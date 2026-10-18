/* Practice exams for Exam 2 and endless exam-style problems (unit e2-prac).
   prac-a, prac-b, prac-c: the Spring 2018 format (75 min, 100 pts): seven multiple-choice questions (3 pts each), then
   four problems with parts. New situations in the styles of the past exams, a notch harder; together they cover every
   Exam 2 topic. Every part has a box or a choice; sketch parts are checked through values read off the sketch, and the
   solutions draw the sketch.
   prac-gen: twelve randomized multi-part generators (GENS.ex_*) in the style of the past exams' long problems. */
(function () {
  'use strict';
  const { R, RF, P, Q, G } = C;
  const { f, p, N, sol } = EM;
  const { pick } = U;
  const mu0 = EM.mu0, eps0 = EM.eps0, c0 = EM.c, eta0 = EM.eta0, PI = Math.PI;

  // ---------------------------------------------------------------- small helpers
  const mc = (lbl, opts, a, why, fixed) => ({ lbl, mc: opts, a, why, fixed: !!fixed });
  const FAC = ['0.25', '0.5', '1', '2', '4'];
  // a scaling question with the five usual factors; why(o) explains a wrong factor o
  const fac = (lbl, right, why) => ({ lbl, mc: FAC, a: FAC.indexOf(right), why: FAC.map((o) => (o === right ? null : why(o))), fixed: true });
  const sgn = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
  const clip = (x, a, b) => Math.min(Math.max(x, a), b);

  // ---------------------------------------------------------------- drawing helpers
  // resistor zigzag between two points
  function res(g, x1, y1, x2, y2, lab, at) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux;
    const a = L / 2 - 15, b = L / 2 + 15, pts = [[x1, y1], [x1 + ux * a, y1 + uy * a]];
    for (let k = 0; k < 6; k++) { const t = a + (b - a) * (k + 0.5) / 6, s = k % 2 ? -5 : 5; pts.push([x1 + ux * t + px * s, y1 + uy * t + py * s]); }
    pts.push([x1 + ux * b, y1 + uy * b], [x2, y2]);
    g.pl(pts, { cls: 'thick' });
    if (lab) g.tag((x1 + x2) / 2, (y1 + y2) / 2, lab, at || 'r', 10);
  }
  // voltmeter: a circle with V inside, + and − marks at its two ends along (dx, dy)
  function meter(g, x, y, lab, at, dx = 0, dy = 1) {
    g.circle(x, y, 10, { cls: 'bgfill nodecl' });
    g.label(x, y, '\\mathrm V', 'c', 'small');
    g.label(x - dx * 18 + dy * 9, y - dy * 18 - dx * 9, '+', 'c', 'small');
    g.label(x + dx * 18 + dy * 9, y + dy * 18 - dx * 9, '-', 'c', 'small');
    if (lab) g.tag(x, y, lab, at || 'r', 22);
  }
  const plot = (o) => PF.plot(Object.assign({ w: 330, h: 190 }, o));

  // ======================================================================================== PRACTICE EXAM A
  // A2: a 2 m x 1 m loop (R1 left, R2 right) around a solenoid in its left half; V1 down the middle, V2 around the left
  function figA2() {
    const g = PF.fig({ alt: 'top view: a 2 by 1 meter loop with R1 on the left side and R2 on the right side; a solenoid with flux out of the page in the left half; voltmeter V1 between the midpoints T and M of the top and bottom wires, leads straight down the middle; voltmeter V2 between the same points, leads running around the outside of the left side' });
    const X = (x) => 40 + 120 * x, Y = (y) => 170 - 120 * y, xm = X(1), xo = -50;
    g.line(X(0), Y(0), X(2), Y(0), { cls: 'thick' });
    g.line(X(0), Y(1), X(2), Y(1), { cls: 'thick' });
    res(g, X(0), Y(0), X(0), Y(1), 'R_1', 'l');
    res(g, X(2), Y(0), X(2), Y(1), 'R_2', 'r');
    g.circle(X(0.5), Y(0.5), 30, { cls: 'shade' });
    g.circle(X(0.5), Y(0.5), 30, { cls: 'dim' });
    g.marks('dot', X(0.5) - 15, Y(0.5) - 15, X(0.5) + 15, Y(0.5) + 15, 3, 3, { r: 2.2 });
    g.label(X(0.5), Y(0.5) + 46, '\\mathbf B_s', 'c', 'small');
    g.line(xm, Y(1), xm, Y(0.5) - 10); g.line(xm, Y(0.5) + 10, xm, Y(0));
    meter(g, xm, Y(0.5), 'V_1', 'r');
    g.pl([[xm, Y(1)], [xm, 18], [xo, 18], [xo, Y(0.5) - 10]]);
    g.pl([[xo, Y(0.5) + 10], [xo, 202], [xm, 202], [xm, Y(0)]]);
    meter(g, xo, Y(0.5), 'V_2', 'r');
    g.dot(xm, Y(1)); g.tag(xm, Y(1), 'T', 'tr', 8);
    g.dot(xm, Y(0)); g.tag(xm, Y(0), 'M', 'br', 8);
    g.tag(X(0), Y(0), '(0,0)', 'br', 8, 'small');
    g.tag(X(2), Y(1), '(2,1)\\ \\text{m}', 'tr', 8, 'small');
    return g.svg();
  }
  // A3 (solution): the source, side view with x out of the page
  function figA3src() {
    const g = PF.fig({ alt: 'side view, z up, y to the right, x out of the page: a shaded slab from z = -1 to 1 m carrying current out of the page, and a sheet at z = 3 m carrying current into the page' });
    const Z = (z) => 150 - 26 * z;
    g.rect(20, Z(1), 220, Z(-1) - Z(1), { cls: 'shade' });
    g.line(20, Z(1), 240, Z(1), { cls: 'dim' }); g.line(20, Z(-1), 240, Z(-1), { cls: 'dim' });
    for (const x of [55, 105, 155, 205]) g.odot(x, Z(0), 5);
    g.line(20, Z(3), 240, Z(3), { cls: 'thick dash' });
    for (const x of [55, 105, 155, 205]) g.otimes(x, Z(3), 5);
    g.arrow(0, Z(-2.2), 0, Z(4.4), { cls: 'dim', hs: 6 }); g.label(5, Z(4.4), 'z', 'bl', 'small accent');
    for (const z of [-1, 1, 3]) { g.line(-4, Z(z), 4, Z(z), { cls: 'dim' }); g.label(-7, Z(z), String(z), 'r', 'small accent'); }
    g.label(246, Z(0), '2\\hat x\\ \\text{A/m}^2', 'l', 'small');
    g.label(246, Z(3), '-4\\hat x\\ \\text{A/m}', 'l', 'small');
    return g.svg();
  }
  const plotA3 = () => plot({
    x: [-3, 5], y: [-5, 1.2], xl: 'z\\ (\\text{m})', yl: 'H_y\\ (\\text{A/m})', xt: [-1, 1, 3], yt: [-4, -2], zero: true,
    curves: [{ pts: [[-3, 0], [-1, 0], [1, -4], [3, -4], [3, 0], [5, 0]] }],
    pts: [{ x: 0, y: -2 }, { x: 0.5, y: -3 }, { x: 2, y: -4 }],
  });
  // A4: coax cross-section, not to scale
  function figA4() {
    const g = PF.fig({ alt: 'cross-section of a coax: inner conductor radius a, a magnetic sleeve out to radius c, air out to the outer conductor at radius b; current out of the page in the center' });
    const cx = 110, cy = 110, ra = 14, rc = 32, rb = 92;
    g.circle(cx, cy, rb, { cls: 'thick' });
    g.circle(cx, cy, rc, { cls: 'shade' }); g.circle(cx, cy, rc);
    g.circle(cx, cy, ra, { cls: 'bgfill' }); g.odot(cx, cy, 5);
    g.line(cx, cy + 6, cx, cy + rb, { cls: 'dim thin' });
    for (const [r, l] of [[ra, 'a'], [rc, 'c'], [rb, 'b']]) { g.line(cx - 4, cy + r, cx + 4, cy + r, { cls: 'dim' }); g.label(cx + 7, cy + r, l, 'l', 'small'); }
    const s = Math.SQRT1_2;
    g.line(cx - 24 * s, cy - 24 * s, cx - 118, cy - 96, { cls: 'dim thin' });
    g.label(cx - 120, cy - 98, '\\mu_r = 4', 'br', 'small');
    g.label(cx + 52, cy - 50, '\\text{air}', 'c', 'small');
    return g.svg();
  }
  // A5: the sheet current waveform, and the two sketches of the solution
  function fA(t) { return t < 0 ? 0 : t < 1 ? 2 * t : t < 2 ? 2 : t < 3 ? -1 : 0; }
  const plotA5 = () => plot({
    x: [-0.6, 4.6], y: [-1.6, 2.6], xl: 't\\ (\\mu\\text{s})', yl: 'J_s\\ (\\text{A/m})', xt: [1, 2, 3, 4], yt: [-1, 1, 2], zero: true,
    curves: [{ pts: [[-0.6, 0], [0, 0], [1, 2], [2, 2], [2, -1], [3, -1], [3, 0], [4.6, 0]] }],
  });
  const E30 = 30 * PI, E60 = 60 * PI;
  const plotA5x = () => plot({
    w: 360, x: [-900, 900], y: [-230, 140], xl: 'x\\ (\\text{m})', yl: 'E_z\\ (\\text{V/m})', zero: true,
    xt: [[-750, '-750'], [-450, '-450'], [450, '450'], [750, '750']], yt: [[-E60, '-60\\pi'], [E30, '30\\pi']],
    curves: [{ pts: [[-900, 0], [-750, 0], [-600, -E60], [-450, -E60], [-450, E30], [-300, E30], [-300, 0], [300, 0], [300, E30], [450, E30], [450, -E60], [600, -E60], [750, 0], [900, 0]] }],
  });
  const plotA5t = () => plot({
    x: [0, 6.5], y: [-230, 140], xl: 't\\ (\\mu\\text{s})', yl: 'E_z\\ (\\text{V/m})', zero: true,
    xt: [2, 3, 4, 5], yt: [[-E60, '-60\\pi'], [E30, '30\\pi']],
    curves: [{ pts: [[0, 0], [2, 0], [3, -E60], [4, -E60], [4, E30], [5, E30], [5, 0], [6.5, 0]] }],
  });

  const examA = [
    R(md`
      **75 minutes, 100 points**, in the format of the Spring 2018 exam: Problem 1 is seven multiple-choice questions (3 points each, no partial credit; most need a short calculation), then four problems with parts. Closed book, no calculator: the numbers work by hand. You may use the official [formula sheet](#/l/e2-sheet) and your own notes.

      Work on paper under time first, then enter your answers. Every part has a box or a choice. Sketches are checked through values you read off them; the solutions draw them. Constants: $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 = 8.854\times10^{-12}$ F/m, $c = 3\times10^8$ m/s, $\eta_0 = 120\pi\ \Omega$.

      | Problem | Topics | Points |
      |---|---|---|
      | 1 | Multiple choice: parallel wires, coil emf, Lenz near a wire, displacement current, vector potential, B at a magnetic interface, a wave in a dielectric | 21 |
      | 2 | Faraday's law: a resistive loop around a solenoid, two voltmeters on the same nodes | 20 |
      | 3 | Ampère: a slab and a sheet written with steps and deltas; field values, plot, force | 20 |
      | 4 | Inductance of a coax with a magnetic sleeve; scaling | 19 |
      | 5 | A current sheet in a dielectric launches a pulse: sketches in space and in time, power | 20 |

      ### Problem 1: multiple choice (21 points)
    `),
    Q(md`(i) Two long parallel wires 2 cm apart carry 5 A and 8 A in **opposite** directions. The force per unit length on each wire is…`,
      [md`$4\times10^{-4}$ N/m, repulsive`, md`$4\times10^{-4}$ N/m, attractive`, md`$2\times10^{-4}$ N/m, repulsive`, md`$8\times10^{-4}$ N/m, repulsive`, md`$4\times10^{-6}$ N/m, repulsive`], 0,
      [null, 'Parallel currents attract; antiparallel currents repel.', md`That uses $\mu_0/4\pi d$ instead of $\mu_0/2\pi d$.`, md`That uses $\mu_0/\pi d$: a factor of 2 lost.`, 'That keeps $d$ in cm: $d = 0.02$ m.'],
      md`$F/\ell = \dfrac{\mu_0I_1I_2}{2\pi d} = \dfrac{(2\times10^{-7})(5)(8)}{0.02} = 4\times10^{-4}$ N/m. Wire 2 sits in wire 1's field; $I_2\,d\mathbf l\times\mathbf B_1$ points away from wire 1 when the currents are opposite: they **repel**.`, { src: 'Practice A · 1(i)', hints: [md`Force per unit length between long parallel wires: $\mu_0I_1I_2/2\pi d$. Parallel currents attract.`] }),
    Q(md`(ii) A 20-turn coil of area $50\ \text{cm}^2$ has its normal at $60°$ to a uniform field that ramps steadily from 0 to 0.4 T in 2 ms. The magnitude of the emf during the ramp is…`,
      ['10 V', '20 V', '17.3 V', '0.5 V', md`$10^5$ V`], 0,
      [null, md`That drops $\cos60° = \tfrac12$: only the normal component of $\mathbf B$ links the coil.`, md`That uses $\sin60°$; flux uses the component **along the normal**, $\cos\theta$.`, 'That leaves out the 20 turns.', md`That keeps the area in cm²: $50\ \text{cm}^2 = 5\times10^{-3}\ \text{m}^2$.`],
      md`$|\emf| = NA\cos\theta\,\dfrac{\Delta B}{\Delta t} = (20)(5\times10^{-3}\ \text{m}^2)(0.5)\dfrac{0.4\ \text{T}}{2\times10^{-3}\ \text{s}} = 10$ V.`, { src: 'Practice A · 1(ii)', hints: [md`$|\emf| = NA\cos\theta\,|\Delta B/\Delta t|$, with the area in m².`] }),
    Q(md`(iii) A long straight wire on the $x$-axis carries a current along $+x$ that is **decreasing**. A square loop lies in the $xy$-plane at $y > 0$, beside the wire. The induced current in the loop, seen from $+z$, is…`,
      ['counterclockwise', 'clockwise', 'zero: the loop does not enclose the wire', 'zero: the wire\'s field is parallel to the loop'], 0,
      [null, md`That makes $-\hat z$ field inside, speeding up the loss of the $+\hat z$ flux.`, 'The wire\'s field crosses the loop\'s plane, and it is changing; the loop need not enclose the wire.', md`At $y > 0$ in the $xy$-plane the wire's field is $\hat x\times\hat y = +\hat z$: normal to the loop.`],
      md`At points $(x, y > 0, 0)$, $\mathbf B$ of a current along $+\hat x$ points along $\hat x\times\hat y = +\hat z$ (RHR). That flux is shrinking, so the loop tops it up with $+\hat z$ field inside: **counterclockwise** from $+z$. On the side nearest the wire the induced current runs along $+x$, parallel to the wire current: the loop is pulled toward the wire, trying to keep its flux.`, { src: 'Practice A · 1(iii)', hints: [md`Find the wire's $\mathbf B$ at the loop (RHR: thumb along the current), then oppose its change.`] }),
    Q(md`(iv) Between the plates of an air capacitor, $\mathbf E = 100\cos(2\pi\times10^6t)\,\hat z$ V/m, uniform over the plate area of $1\ \text{cm}^2$. The amplitude of the displacement current through the gap is…`,
      [md`$0.556\ \mu$A`, md`$0.0885\ \mu$A`, '5.56 mA', 'zero: no charge crosses the gap'], 0,
      [null, md`That uses $f$ in place of $\omega = 2\pi f$.`, md`That keeps the area in cm²: $1\ \text{cm}^2 = 10^{-4}\ \text{m}^2$.`, md`No charge crosses, but $\partial\mathbf D/\partial t \ne 0$: the displacement current is exactly what continues the wire current across the gap.`],
      md`$I_d = A\,\left|\dfrac{\partial D}{\partial t}\right|_{\max} = \epsilon_0\omega E_0A = (8.854\times10^{-12})(2\pi\times10^6)(100)(10^{-4}) = 5.56\times10^{-7}$ A. It equals the current in the leads.`, { src: 'Practice A · 1(iv)', hints: [md`$I_d = A\,\partial D/\partial t$; for $E_0\cos\omega t$ its amplitude is $\epsilon_0\omega E_0A$.`] }),
    Q(md`(v) With $\Phi = 0$ and $\mathbf A = 4yzt\,\hat x$ Wb/m ($x, y, z$ in m, $t$ in s), the magnetic flux density at $(1, 2, 3)$ m and $t = 1$ s is…`,
      [md`$8\hat y - 12\hat z$ T`, md`$-8\hat y + 12\hat z$ T`, md`$12\hat y - 8\hat z$ T`, md`$8\hat y + 12\hat z$ T`, md`$-24\hat x$ T`], 0,
      [null, 'Every sign flipped: that is $-\\nabla\\times\\mathbf A$.', md`The derivatives are swapped: $B_y = \partial A_x/\partial z = 4yt$, $B_z = -\partial A_x/\partial y = -4zt$.`, md`$B_z = \partial A_y/\partial x - \partial A_x/\partial y$: the minus sign was lost.`, md`That is $-\partial\mathbf A/\partial t$ evaluated there: the electric field, not $\mathbf B$.`],
      md`For $\mathbf A = A_x\hat x$: $\nabla\times\mathbf A = \hat y\,\dfrac{\partial A_x}{\partial z} - \hat z\,\dfrac{\partial A_x}{\partial y} = 4yt\,\hat y - 4zt\,\hat z$. At $(1,2,3)$, $t = 1$: $8\hat y - 12\hat z$ T. (The electric field is $\mathbf E = -\partial\mathbf A/\partial t = -4yz\,\hat x = -24\hat x$ V/m there.)`, { src: 'Practice A · 1(v)', hints: [md`$\mathbf B = \nabla\times\mathbf A$. With only $A_x$: $B_y = \partial A_x/\partial z$, $B_z = -\partial A_x/\partial y$.`] }),
    Q(md`(vi) The plane $z = 0$ separates air ($z < 0$) from a material with $\mu_r = 4$ ($z > 0$); there is no surface current. Just below, $\mathbf B = 2\hat x + 3\hat z$ mT. Just above, $\mathbf B = $`,
      [md`$8\hat x + 3\hat z$ mT`, md`$2\hat x + 12\hat z$ mT`, md`$0.5\hat x + 3\hat z$ mT`, md`$8\hat x + 12\hat z$ mT`, md`$2\hat x + 3\hat z$ mT`], 0,
      [null, md`The rules are applied to the wrong components: **normal $B$** and **tangential $H$** are continuous.`, md`Tangential $H$ is continuous, so tangential $B = \mu H$ is **multiplied** by $\mu_r$, not divided.`, md`Normal $B$ is continuous; only the tangential part scales.`, md`$B_x$ is tangential: $H_x$ is continuous, so $B_x$ jumps by $\mu_2/\mu_1$.`],
      md`Normal: $B_z$ continuous, $3$ mT. Tangential: $H_x$ continuous ($\mathbf J_s = 0$), so $B_x^+ = \mu_rB_x^- = 4(2) = 8$ mT. $\mathbf B = 8\hat x + 3\hat z$ mT: the field bends away from the normal in the more permeable material.`, { src: 'Practice A · 1(vi)', hints: [md`Normal $B$ is continuous; tangential $H$ is continuous when $\mathbf J_s = 0$.`] }),
    Q(md`(vii) In a nonmagnetic dielectric, $\mathbf E = 30\cos(10^9t - 5z)\,\hat x$ V/m. The relative permittivity is…`,
      ['2.25', '1.5', '0.444', '0.667'], 0,
      [null, md`That is $c/v_p = \sqrt{\epsilon_r}$; square it.`, md`That is $(v_p/c)^2$: upside down.`, md`That is $v_p/c$.`],
      md`$v_p = \omega/\beta = 10^9/5 = 2\times10^8$ m/s $= c/\sqrt{\epsilon_r}$, so $\epsilon_r = (3/2)^2 = 2.25$.`, { src: 'Practice A · 1(vii)', hints: [md`$v_p = \omega/\beta$, then $\epsilon_r = (c/v_p)^2$.`] }),

    RF(md`
      ### Problem 2 (20 points): one loop, two voltmeters

      A rectangular loop lies in the $xy$-plane with corners $(0,0)$, $(2,0)$, $(2,1)$ and $(0,1)$ m. Its left side contains $R_1 = 1\ \Omega$ and its right side $R_2 = 3\ \Omega$; the top and bottom are ideal wires. A long solenoid along $z$, of cross-section $0.2\ \text{m}^2$, passes through the left half of the loop. Inside it $\mathbf B_s = 40t\,\hat z$ T ($t$ in s); outside it $\mathbf B = 0$. Voltmeters $V_1$ and $V_2$ both connect their + lead to T $= (1, 1)$ m and their − lead to M $= (1, 0)$ m. $V_1$'s leads run straight down the line $x = 1$ m; $V_2$'s leads run around the outside of the loop's left side. The voltmeters draw no current, and the induced current's own field is negligible.

      [[fig:loop]]
    `, { loop: { svg: figA2(), cap: 'Top view, z out of the page. The solenoid\'s flux points out of the page and grows.' } }),
    P({ src: 'Practice A · 2(a–b)', title: 'Emf and current',
      q: md`**(a) (4 pts)** Find the emf $\emf$ around the loop along $C$, counterclockwise seen from $+z$.

      **(b) (4 pts)** Find the loop current: its magnitude, and its direction seen from $+z$.`,
      parts: [N('\\mathcal E\\ \\text{along}\\ C', -8, 'V'), N('|I|', 2, 'A'), mc('Seen from $+z$, the current flows', ['clockwise', 'counterclockwise'], 0, [null, 'That adds to the growing flux out of the page. The current must oppose the growth.'], true)],
      hints: [md`Counterclockwise from $+z$ puts $d\mathbf S = +\hat z$. Only the solenoid's cross-section carries flux.`, md`$\Psi = (40t)(0.2)$ Wb; $\emf = -d\Psi/dt$; the two resistors are in series.`],
      sol: md`
        **1. Flux.** Counterclockwise from $+z$ gives $d\mathbf S = +\hat z$ (RHR). $\mathbf B \ne 0$ only inside the solenoid:
        $$\Psi(t) = B_sA_s = (40t\ \text{T})(0.2\ \text{m}^2) = 8t\ \text{Wb}$$
        **2. Emf.** $\emf = -d\Psi/dt = -8$ V along $C$.

        **3. Current.** $I = \dfrac{\emf}{R_1 + R_2} = \dfrac{-8\ \text{V}}{4\ \Omega} = -2$ A along $C$: **2 A, clockwise** from $+z$. It flows up through $R_1$ and down through $R_2$.

        **Check (Lenz).** The flux out of the page grows, so the current makes field into the page inside the loop: clockwise from $+z$. ✓
      ` }),
    P({ src: 'Practice A · 2(c–d)', title: 'Two voltmeters, same nodes',
      q: md`**(c) (4 pts)** What does $V_1$ read?

      **(d) (4 pts)** What does $V_2$ read?`,
      parts: [N('V_1', 6, 'V'), N('V_2', -2, 'V')],
      hints: [md`A voltmeter reads $\int\mathbf E\cdot d\mathbf l$ from its + tip to its − tip **along its own leads**. Close a loop with the leads and one side of the circuit, and apply Faraday to that loop.`, md`Pick the side whose loop encloses **no** flux. Then the reading is just that side's resistor drop, $\pm IR$.`],
      sol: md`
        A voltmeter reads $V = \int_+^-\mathbf E\cdot d\mathbf l$ along its own leads. With changing flux around, this depends on the path, so close a loop and use Faraday.

        **$V_1$.** Loop: T → down $V_1$'s leads → M → bottom wire → $(2,0)$ → up through $R_2$ → $(2,1)$ → top wire → T. It encloses the right half, where $\mathbf B = 0$, so $\oint\mathbf E\cdot d\mathbf l = 0$:
        $$V_1 + \int_{\text{up through }R_2}\mathbf E\cdot d\mathbf l = 0$$
        Through a resistor $\int\mathbf E\cdot d\mathbf l = +IR$ along the current and $-IR$ against it. The current runs **down** $R_2$, so going up gives $-(2\ \text{A})(3\ \Omega) = -6$ V, and $V_1 = +6$ V.

        **$V_2$.** Loop: T → $V_2$'s leads around the left → M → bottom wire → $(0,0)$ → up through $R_1$ → $(0,1)$ → top wire → T. The solenoid lies outside it, so again $\oint = 0$. The current runs **up** $R_1$: $\int_{\text{up}} = +(2)(1) = 2$ V, so $V_2 = -2$ V.

        **Check.** $V_1 - V_2 = 8$ V $= |\emf|$: the two lead paths together go once around the solenoid. Same two nodes, two different readings: with changing flux between the paths there is no single "voltage from T to M".
      ` }),
    P({ src: 'Practice A · 2(e)', title: 'A third voltmeter',
      q: md`**(e) (4 pts)** A voltmeter $V_3$ is connected directly across $R_1$: + lead at its top end $(0, 1)$, − lead at its bottom end $(0, 0)$, leads hugging the resistor. $V_3$ reads…`,
      parts: [mc('', [md`$-2$ V, the same as $V_2$`, md`$+6$ V, the same as $V_1$`, md`$+2$ V`, md`$-8$ V`], 0,
        [null, md`$V_1$'s leads have the solenoid between them and $R_1$; $V_3$'s do not.`, md`Sign: the current flows **up** through $R_1$, so from the top end to the bottom end you go against it: $-IR_1$.`, 'That is the whole emf. The leads enclose no flux with $R_1$, so only $R_1$\'s drop counts.'])],
      hints: [md`Leads that hug a resistor enclose no flux with it.`],
      sol: md`Leads hugging $R_1$ enclose no flux with it, so $V_3 = \int\mathbf E\cdot d\mathbf l$ through $R_1$ from top to bottom, against the current: $-IR_1 = -(2\ \text{A})(1\ \Omega) = -2$ V. It equals $V_2$ because no flux threads the region between $V_2$'s leads and $R_1$ either. A voltmeter reads a resistor's drop only if no changing flux threads the loop its leads make with that resistor.` }),

    R(md`
      ### Problem 3 (20 points): a slab and a sheet

      In free space a static current density is given by ($z$ in m, $u$ the unit step)
      $$\mathbf J(x,y,z) = 2\hat x\,[u(z + 1) - u(z - 1)] - 4\hat x\,\delta(z - 3)\ \text{A/m}^2$$
      Nothing depends on $x$ or $y$.
    `),
    P({ src: 'Practice A · 3(a)', title: 'Reading the description',
      q: md`**(a) (3 pts)** What do the coefficients $2$ and $-4$ measure, and what current system is this?`,
      parts: [
        mc('The units of the coefficients $2$ and $-4$ are', ['A/m² and A/m', 'A/m² and A/m²', 'A/m and A/m', 'A and A/m'], 0,
          [null, md`$\delta(z - 3)$ has units of 1/m (its integral over $z$ is 1), so the $-4$ carries A/m for the product to be A/m².`, md`The step functions are dimensionless, so the $2$ must already be A/m².`, md`The step functions are dimensionless: the $2$ is a volume density, A/m².`]),
        mc('The current system is', ['a slab $-1 < z < 1$ with $2$ A/m² along $+x$, and a sheet on $z = 3$ with $4$ A/m along $-x$', 'sheets on $z = \\pm1$ with $2$ A/m each, and a sheet on $z = 3$ with $4$ A/m along $-x$', 'a slab $1 < z < 3$ with $2$ A/m² along $+x$, and a sheet on $z = 3$ with $4$ A/m along $-x$', 'a slab $-1 < z < 1$ with $2$ A/m² along $+x$, and a sheet on $z = -3$ with $4$ A/m along $-x$'], 0,
          [null, md`$u(z + 1) - u(z - 1)$ is a **window**: 1 for $-1 < z < 1$, 0 outside. Steps make slabs; deltas make sheets.`, md`$u(z + 1) - u(z - 1)$ switches on at $z = -1$ and off at $z = +1$.`, md`$\delta(z - 3)$ fires where its argument is zero: $z = +3$.`]),
      ],
      hints: [md`$\int\delta(z)\,dz = 1$, so $\delta$ has units of 1/length. $u(z - a)$ is 0 for $z < a$ and 1 for $z > a$.`],
      sol: md`
        $u(z + 1) - u(z - 1) = 1$ for $-1 < z < 1$ and 0 elsewhere: a **slab** of $\mathbf J = 2\hat x$ A/m² (the steps are dimensionless). $\delta(z - 3)$ has units 1/m, so $-4\hat x\,\delta(z - 3)$ A/m² is a **sheet** on $z = 3$ with $\mathbf J_s = -4\hat x$ A/m.

        [[fig:src]]

        The slab carries $JW = (2)(2) = 4$ A per meter of width along $+x$; the sheet carries 4 A/m back. Net current per unit width: zero.
      `,
      figs: { src: { svg: figA3src(), cap: 'x out of the page: the slab current comes out (dots), the sheet current goes in (crosses).' } } }),
    P({ src: 'Practice A · 3(b)', title: 'H at four heights',
      q: md`**(b) (6 pts)** Find $H_y$ at $z = 0$, $z = 0.5$ m and $z = 2$ m, and $\mathbf H$ at $z = -2$ m and $z = 4$ m.`,
      parts: [N('H_y(0)', -2, 'A/m'), N('H_y(0.5\\ \\text{m})', -3, 'A/m'), N('H_y(2\\ \\text{m})', -4, 'A/m'),
        mc('At $z = -2$ m and $z = 4$ m, $\\mathbf H$ is', ['zero at both', md`$+2\hat y$ A/m at both`, md`$+2\hat y$ at $z = -2$ and $-2\hat y$ at $z = 4$ A/m`, md`$-4\hat y$ A/m at both`], 0,
          [null, md`Each point needs both sources. At $z = -2$ the slab gives $+2\hat y$ and the sheet $-2\hat y$; at $z = 4$ the slab gives $-2\hat y$ and the sheet $+2\hat y$. Both cancel.`, 'That is the slab alone, forgetting the sheet.', md`$-4\hat y$ is the field **between** the slab and the sheet, where their fields add.`])],
      hints: [md`Superpose. Formula sheet slab ($\mathbf J = J\hat x$, width $W$, centered at 0): $H_y = -Jz$ inside, $\mp JW/2$ above / below.`, md`Sheet: $\mathbf H = \tfrac12\mathbf J_s\times\hat n$, with $\hat n$ pointing from the sheet toward the point.`],
      sol: md`
        **Slab** ($J = 2$ A/m², $W = 2$ m, centered at 0): $H_y = -2z$ inside; $-2$ above it, $+2$ below it.

        **Sheet** ($\mathbf J_s = -4\hat x$ on $z = 3$): $\mathbf H = \tfrac12\mathbf J_s\times\hat n$. Below it $\hat n = -\hat z$: $\tfrac12(-4\hat x)\times(-\hat z) = 2\,\hat x\times\hat z = -2\hat y$. Above it $+2\hat y$.

        | region | slab | sheet | $H_y$ (A/m) |
        |---|---|---|---|
        | $z < -1$ | $+2$ | $-2$ | $0$ |
        | $-1 < z < 1$ | $-2z$ | $-2$ | $-2z - 2$ |
        | $1 < z < 3$ | $-2$ | $-2$ | $-4$ |
        | $z > 3$ | $-2$ | $+2$ | $0$ |

        So $H_y(0) = -2$, $H_y(0.5) = -3$, $H_y(2) = -4$ A/m, and $\mathbf H = 0$ at $z = -2$ and $z = 4$.

        **Check.** Zero net current per width, so $\mathbf H = 0$ far away on both sides ✓. Across the sheet $H_y$ jumps by $4 = |J_s|$ ✓, and $\mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat z = (-4\hat x)\times\hat z = 4\hat y$ ✓.
      ` }),
    P({ src: 'Practice A · 3(c)', title: 'The plot',
      q: md`**(c) (4 pts)** Sketch $H_y(z)$ for $-3 < z < 5$ m. Which description matches your sketch?`,
      parts: [mc('', [md`zero for $z < -1$; falls linearly to $-4$ A/m at $z = 1$; stays $-4$ up to $z = 3$; jumps to zero above`,
        md`zero for $z < -1$; rises linearly to $+4$ A/m at $z = 1$; stays $+4$ up to $z = 3$; jumps to zero above`,
        md`$+2$ A/m below the slab, a linear ramp to $-2$ A/m at $z = 1$, and $-2$ A/m above`,
        md`zero for $z < -1$, then a constant $-4$ A/m from $z = -1$ to $z = 3$, then zero`], 0,
        [null, md`Sign: above a $+\hat x$ current, $\hat x\times\hat z = -\hat y$. $H_y$ goes negative.`, 'That is the slab alone; the sheet\'s field was left out.', md`Inside the slab $H_y$ changes linearly ($dH_y/dz = -J$); it does not jump at the slab's face.`])],
      hints: [md`Inside a slab, $dH_y/dz = -J_x$ (Ampère's law in differential form): a straight line. Across a sheet, a jump of $|J_s|$.`],
      sol: md`
        [[fig:h]]

        Inside the slab the slope is $dH_y/dz = -J_x = -2$ A/m² (from $\nabla\times\mathbf H = \mathbf J$: $-\partial H_y/\partial z = J_x$). The field is continuous at the slab faces (no surface current there) and jumps by $4$ A/m at the sheet.
      `,
      figs: { h: { svg: plotA3(), cap: 'H_y(z): a ramp through the slab, flat between the slab and the sheet, zero outside. Dots: the three values of part (b).' } } }),
    P({ src: 'Practice A · 3(d)', title: 'Cancel the field',
      q: md`**(d) (4 pts)** A third sheet $K\hat x\,\delta(z + 3)$ A/m² is added. Find $K$ so that $\mathbf H = 0$ for $1 < z < 3$ m, and then find $H_y$ for $z < -3$ m.`,
      parts: [N('K', -8, 'A/m'), N('H_y\\ (z < -3\\ \\text{m})', -4, 'A/m')],
      hints: [md`Above the new sheet, $\hat n = +\hat z$: its field is $\tfrac12K\hat x\times\hat z = -\tfrac K2\hat y$. It must cancel $-4\hat y$.`, md`Below the new sheet, $\hat n = -\hat z$: its field reverses. The old field there is zero.`],
      sol: md`
        The new sheet's field above it ($z > -3$): $\tfrac12K\hat x\times\hat z = -\tfrac K2\hat y$. In $1 < z < 3$ we need $-4 - \tfrac K2 = 0$, so $K = -8$ A/m (current along $-x$).

        Below it ($z < -3$), $\hat n = -\hat z$: $\tfrac12K\hat x\times(-\hat z) = +\tfrac K2\hat y = -4\hat y$ A/m. The old field there is zero, so $H_y = -4$ A/m.

        **Check.** The net current per width is now $4 - 4 - 8 = -8$ A/m, so far above and far below $|H_y| = 8/2 = 4$ A/m with opposite signs: $-4$ below, and $+4$ above $z = 3$. ✓
      ` }),
    P({ src: 'Practice A · 3(e)', title: 'Force on the sheet',
      q: md`**(e) (3 pts)** Without the third sheet, find the magnetic force per unit area on the sheet at $z = 3$ m.`,
      parts: [N('|\\mathbf F|/A', 8 * mu0, 'N/m²'), mc('Its direction is', [md`$+\hat z$: pushed away from the slab`, md`$-\hat z$: pulled toward the slab`, md`$+\hat y$`, md`zero: the field at the sheet is $\tfrac12$ above and $\tfrac12$ below`], 0,
        [null, md`Antiparallel currents **repel**: the sheet's $-\hat x$ current is pushed away from the slab's $+\hat x$ current.`, md`$\mathbf J_s\times\mathbf B$ is perpendicular to $\mathbf B = B_y\hat y$, so it has no $y$-component.`, md`A sheet feels the field of the **other** sources (the average of the fields just above and below it), which is $-2\mu_0\hat y$ here, not zero.`])],
      hints: [md`Force per unit area on a sheet: $\mathbf J_s\times\mathbf B$, with $\mathbf B$ the field of everything **except** the sheet itself (the average of the fields just above and just below it).`],
      sol: md`
        The field at $z = 3$ from the other source (the slab) is $\mathbf B = \mu_0(-2\hat y)$ T. (Check: the average of $\mu_0H$ just below, $-4\mu_0$, and just above, $0$, is $-2\mu_0$ ✓.)
        $$\frac{\mathbf F}{A} = \mathbf J_s\times\mathbf B = (-4\hat x)\times(-2\mu_0\hat y) = 8\mu_0\,\hat z = 1.01\times10^{-5}\ \text{N/m}^2$$
        Along $+\hat z$, away from the slab: antiparallel currents repel. ✓
      ` }),

    RF(md`
      ### Problem 4 (19 points): a coax with a magnetic sleeve

      A long coax has an inner conductor of radius $a = 1$ mm and a thin outer conductor at $b = 8$ mm. A sleeve of magnetic material with $\mu_r = 4$ fills $a < r < c$, $c = 2$ mm; the rest of the space between the conductors, $c < r < b$, is air. The inner conductor carries $I = 3$ A along $+z$ and the outer conductor returns it. Ignore the field inside the conductors. Use $\ln2 = 0.693$.

      [[fig:coax]]
    `, { coax: { svg: figA4(), cap: 'Cross-section (not to scale). Current out of the page in the center, back in the outer conductor.' } }),
    P({ src: 'Practice A · 4(a–b)', title: 'H and B',
      q: md`**(a) (3 pts)** Find $H_\phi$ at $r = 1.5$ mm.

      **(b) (4 pts)** Find $B_\phi$ at $r = 1.5$ mm and at $r = 4$ mm.`,
      parts: [N('H_\\phi(1.5\\ \\text{mm})', 3 / (2 * PI * 1.5e-3), 'A/m'), N('B_\\phi(1.5\\ \\text{mm})', 4 * mu0 * 3 / (2 * PI * 1.5e-3), 'T'), N('B_\\phi(4\\ \\text{mm})', mu0 * 3 / (2 * PI * 4e-3), 'T')],
      hints: [md`Ampère's law for $\mathbf H$ counts only **free** current: $H_\phi\,2\pi r = I$ in both layers.`, md`Then $B = \mu H$ with the local $\mu$: $4\mu_0$ in the sleeve, $\mu_0$ in the air.`],
      sol: md`
        **1. Ampère.** A circle of radius $r$ between the conductors, counterclockwise from $+z$: $\oint\mathbf H\cdot d\mathbf l = H_\phi\,2\pi r = I_{\text{free,enc}} = I$. The sleeve does not change this.
        $$H_\phi(1.5\ \text{mm}) = \frac{3\ \text{A}}{2\pi(1.5\times10^{-3}\ \text{m})} = 318\ \text{A/m}$$
        **2. $B = \mu H$.** In the sleeve: $B_\phi = 4\mu_0(318) = 1.60\times10^{-3}$ T. At 4 mm (air): $B_\phi = \dfrac{\mu_0I}{2\pi r} = \dfrac{(2\times10^{-7})(3)}{4\times10^{-3}} = 1.50\times10^{-4}$ T.

        **Check.** At $r = c$, $H_\phi$ is tangential and continuous (no surface current); $B_\phi$ jumps by the factor 4. ✓
      ` }),
    P({ src: 'Practice A · 4(c–d)', title: 'Flux and inductance',
      q: md`**(c) (4 pts)** Find the magnetic flux per unit length linked between the conductors.

      **(d) (4 pts)** Find the inductance of a 2 m length.`,
      parts: [N("\\Psi'", 3.6e-6 * Math.log(2), 'Wb/m'), N('L\\ (2\\ \\text{m})', 2 * 1.2e-6 * Math.log(2), 'H')],
      hints: [md`Integrate $B_\phi$ over a radial strip from $a$ to $b$, 1 m long. Split the integral at $c$.`, md`$\ln(c/a) = \ln2$, $\ln(b/c) = \ln4 = 2\ln2$.`],
      sol: md`
        **1. Flux per unit length** through a radial strip from $a$ to $b$:
        $$\Psi' = \int_a^b B_\phi\,dr = \frac{\mu_0I}{2\pi}\left[\mu_r\ln\frac ca + \ln\frac bc\right] = (2\times10^{-7})(3)(4\ln2 + 2\ln2) = 2.50\times10^{-6}\ \text{Wb/m}$$
        **2. Inductance.** $L' = \Psi'/I = \dfrac{\mu_0}{2\pi}(6\ln2) = 8.32\times10^{-7}$ H/m, so $L = L'\ell = 1.66\times10^{-6}$ H $= 1.66\ \mu$H for 2 m.

        **Check.** With no sleeve, $L' = \dfrac{\mu_0}{2\pi}\ln8 = \dfrac{\mu_0}{2\pi}(3\ln2)$: the thin sleeve doubles $L'$, because the field is strongest near the inner conductor.
      ` }),
    P({ src: 'Practice A · 4(e)', title: 'Scaling',
      q: md`**(e) (4 pts)** By what factor does $L$ change if…`,
      parts: [
        fac('(i) $a$, $c$ and $b$ are all doubled', '1', () => md`$L'$ depends on the radii only through $\ln(c/a)$ and $\ln(b/c)$; doubling all three leaves both ratios.`),
        fac('(ii) the current is doubled', '1', () => md`$\Psi$ doubles with $I$, so $L = \Psi/I$ does not change: $L$ is geometry and material only.`),
        fac('(iii) the sleeve is replaced by air', '0.5', (o) => (o === '0.25' ? md`$\mu_r$ multiplies only the sleeve's term: $(\ln2 + 2\ln2)/(4\ln2 + 2\ln2) = 1/2$.` : md`Without the sleeve the bracket is $\ln2 + 2\ln2 = 3\ln2$ instead of $6\ln2$.`)),
      ],
      hints: [md`$L' = \dfrac{\mu_0}{2\pi}\left[\mu_r\ln\dfrac ca + \ln\dfrac bc\right]$.`],
      sol: md`$L' = \dfrac{\mu_0}{2\pi}\left[\mu_r\ln\dfrac ca + \ln\dfrac bc\right]$. (i) Ratios unchanged: **×1**. (ii) $L$ does not depend on $I$: **×1** (the flux doubles, the energy $\tfrac12LI^2$ quadruples). (iii) $3\ln2/6\ln2$: **×0.5**.` }),

    RF(md`
      ### Problem 5 (20 points): a pulse from a current sheet

      A current sheet on the plane $x = 0$ carries $\mathbf J_s = J_s(t)\,\hat z$ A/m, with $J_s(t)$ below. All space is filled with a lossless, nonmagnetic dielectric with $\epsilon_r = 4$.

      [[fig:js]]
    `, { js: { svg: plotA5(), cap: 'J_s(t): a ramp to 2 A/m at 1 µs, flat to 2 µs, then −1 A/m from 2 to 3 µs, then zero.' } }),
    P({ src: 'Practice A · 5(a)', title: 'The fields in symbols',
      q: md`**(a) (4 pts)** Find the wave speed $v$. Write the fields as $E_z(x,t) = K_E\,J_s(t - |x|/v)$ (both sides) and, for $x < 0$, $H_y(x,t) = K_H\,J_s(t + x/v)$. Find $K_E$ and $K_H$.`,
      parts: [N('v', 1.5e8, 'm/s'), N('K_E', -30 * PI, 'Ω'), N('K_H', -0.5, '')],
      hints: [md`$v = c/\sqrt{\epsilon_r}$, $\eta = \eta_0/\sqrt{\epsilon_r}$. The sheet's field is $\mathbf E = -\tfrac\eta2\mathbf J_s(t - |x|/v)$ on both sides.`, md`$\mathbf E\times\mathbf H$ points away from the sheet: along $-\hat x$ for $x < 0$.`],
      sol: md`
        **1. Medium.** $v = c/\sqrt4 = 1.5\times10^8$ m/s $= 150$ m/µs; $\eta = 120\pi/2 = 60\pi\ \Omega$.

        **2. E.** The sheet launches $\mathbf E = -\tfrac\eta2\mathbf J_s(t - |x|/v)$ on both sides (formula sheet: $\mathbf J_s = -J_s\hat x$ gives $+\tfrac\eta2J_s\hat x$). Here $\mathbf J_s = J_s\hat z$, so $E_z = -30\pi\,J_s(t - |x|/v)$: $K_E = -30\pi = -94.2\ \Omega$.

        **3. H for $x < 0$.** The wave travels along $-\hat x$, so $\mathbf E\times\mathbf H \parallel -\hat x$. With $E_z\hat z\times H_y\hat y = -E_zH_y\,\hat x$, this needs $E_zH_y > 0$: $H_y = E_z/\eta = -\tfrac12J_s(t + x/v)$. $K_H = -0.5$.

        **Check.** For $x > 0$ the same reasoning gives $H_y = +\tfrac12J_s$. The jump $H_y(0^+) - H_y(0^-) = J_s$ matches $\mathbf J_s\times\hat n = J_s\hat z\times\hat x = J_s\hat y$ ✓. And $\mathbf E$ opposes $\mathbf J_s$, so $\mathbf E\cdot\mathbf J_s < 0$: the sheet delivers power to the field ✓.
      ` }),
    P({ src: 'Practice A · 5(b)', title: 'A snapshot in space',
      q: md`**(b) (6 pts)** Sketch $E_z$ versus $x$ at $t = 5\ \mu$s. From your sketch: where is the front of the pulse for $x > 0$, and what are $E_z$ at $x = 500$ m and at $x = -375$ m?`,
      parts: [N('x_{\\text{front}}', 750, 'm'), N('E_z(500\\ \\text{m})', -60 * PI, 'V/m'), N('E_z(-375\\ \\text{m})', 30 * PI, 'V/m')],
      hints: [md`At a point $x$, the field now is what the sheet did at the retarded time $\tau = t - |x|/v$. With $v = 150$ m/µs: $\tau = 5 - |x|/150$ µs.`, md`The front is where $\tau = 0$. Evaluate $J_s(\tau)$, then multiply by $-30\pi$.`],
      sol: md`
        Retarded time: $\tau = t - |x|/v = 5 - |x|/150$ (µs, m).

        - Front: $\tau = 0$ at $|x| = vt = 750$ m.
        - $x = 500$ m: $\tau = 1.67$ µs, $J_s = 2$ A/m, $E_z = -30\pi(2) = -60\pi = -188$ V/m.
        - $x = -375$ m: $\tau = 2.5$ µs, $J_s = -1$ A/m, $E_z = +30\pi = 94.2$ V/m.

        [[fig:x]]

        The snapshot is $J_s(t)$ **reversed in space**: the earliest part of the pulse (the ramp) is farthest out, at 600–750 m; the last part (the $-1$ A/m step) is nearest the sheet, at 300–450 m. It is even in $x$ and scaled by $-30\pi$.
      `,
      figs: { x: { svg: plotA5x(), cap: 'E_z(x) at t = 5 µs. Each side shows J_s reversed (time maps to −|x|/v), times −30π.' } } }),
    P({ src: 'Practice A · 5(c)', title: 'A record in time',
      q: md`**(c) (5 pts)** Sketch $E_z$ versus $t$ at $x = 300$ m. From your sketch: when does the field first become nonzero there, what is $E_z$ during $3 < t < 4\ \mu$s, and when does it return to zero for good?`,
      parts: [N('t_{\\text{arrive}}', 2, 'µs'), N('E_z\\ (3 < t < 4\\ \\mu\\text{s})', -60 * PI, 'V/m'), N('t_{\\text{end}}', 5, 'µs')],
      hints: [md`At fixed $x$, $E_z(300, t) = -30\pi\,J_s(t - 2\ \mu\text{s})$: the sheet's waveform, delayed by $|x|/v = 2$ µs.`],
      sol: md`
        The delay is $|x|/v = 300/150 = 2$ µs, so $E_z(300\ \text{m}, t) = -30\pi\,J_s(t - 2\ \mu\text{s})$: the waveform of $J_s$ in its **original** order, shifted right by 2 µs and flipped in sign.

        It arrives at $t = 2$ µs; during $3 < t < 4$ µs, $J_s(\tau = 1\text{–}2) = 2$, so $E_z = -60\pi = -188$ V/m; it ends at $t = 3 + 2 = 5$ µs.

        [[fig:t]]

        **Check.** In time the ramp comes first; in space (part b) the ramp is farthest out. Both say the ramp leads. ✓
      `,
      figs: { t: { svg: plotA5t(), cap: 'E_z(t) at x = 300 m: the sheet\'s waveform, delayed 2 µs, times −30π.' } } }),
    P({ src: 'Practice A · 5(d)', title: 'Power',
      q: md`**(d) (5 pts)** Find the Poynting vector at $x = 500$ m, $t = 5\ \mu$s, and the total energy per unit area that crosses the plane $x = 300$ m during the whole pulse.`,
      parts: [N('|\\mathbf S|', 60 * PI, 'W/m²'), mc('$\\mathbf S$ points along', [md`$+\hat x$`, md`$-\hat x$`, md`$+\hat z$`, md`$-\hat y$`], 0,
        [null, md`At $x > 0$ the wave moves away from the sheet, along $+\hat x$; $\mathbf S$ points along the travel.`, md`$\mathbf S = \mathbf E\times\mathbf H$ is perpendicular to $\mathbf E = E_z\hat z$.`, md`$\mathbf S$ is perpendicular to $\mathbf H = H_y\hat y$.`], true),
      N('W/A', 95 * PI * 1e-6, 'J/m²')],
      hints: [md`$|\mathbf S| = |E||H| = \eta H^2 = \dfrac{\eta}{4}J_s^2$ at the retarded time.`, md`Energy per area $= \int S\,dt = \dfrac{\eta}{4}\int J_s^2\,dt$; integrate $J_s^2$ piece by piece.`],
      sol: md`
        **1. At (500 m, 5 µs).** $\tau = 1.67$ µs: $E_z = -60\pi$ V/m, $H_y = +\tfrac12J_s = 1$ A/m.
        $$\mathbf S = E_z\hat z\times H_y\hat y = -E_zH_y\,\hat x = (60\pi)(1)\,\hat x = 188\ \text{W/m}^2\ \text{along}\ +\hat x$$
        **2. Energy through $x = 300$ m.** $S = \dfrac{\eta}{4}J_s^2(\tau) = 15\pi J_s^2$. Over the pulse:
        $$\int J_s^2\,dt = \int_0^1 (2t)^2dt + (2)^2(1) + (-1)^2(1) = \tfrac43 + 4 + 1 = \tfrac{19}{3}\ \text{A}^2\,\mu\text{s/m}^2$$
        $$\frac WA = 15\pi\times\frac{19}{3}\times10^{-6} = 95\pi\times10^{-6} = 2.98\times10^{-4}\ \text{J/m}^2$$
        **Check.** The same energy crosses $x = -300$ m going the other way; the sheet supplies both.
      ` }),
  ];

  EM.lesson('e2-prac', { id: 'prac-a', title: 'Practice exam A', kind: 'mock', steps: examA });

  // ======================================================================================== PRACTICE EXAM B
  // B2: rails along x, resistor at x = 0, bar at x = s moving +x; B out of the page, growing with x
  function figB2() {
    const g = PF.fig({ alt: 'top view: two rails along x joined by a resistor R at x = 0; a bar at x = s(t) moves to the right with speed v; B points out of the page and grows with x (bigger dots to the right)' });
    const X = (x) => 40 + 40 * x, y0 = 150, y1 = 70;
    g.line(X(0), y0, X(5.6), y0, { cls: 'thick' }); g.line(X(0), y1, X(5.6), y1, { cls: 'thick' });
    res(g, X(0), y0, X(0), y1, 'R', 'l');
    g.line(X(3), y1 - 8, X(3), y0 + 8, { cls: 'thick' });
    g.arrow(X(3) + 6, y1 - 16, X(3) + 44, y1 - 16, { hs: 7 }); g.label(X(3) + 48, y1 - 16, 'v', 'l');
    for (const x of [0.5, 1.5, 2.4, 3.6, 4.5, 5.4]) for (const y of [90, 110, 130]) g.dot(X(x), y, 1.2 + 0.45 * x, { cls: 'dimfill' });
    g.label(X(3), y0 + 12, 'x = s(t)', 't', 'small');
    g.label(X(5.6) + 6, y0, 'y = 0', 'l', 'small'); g.label(X(5.6) + 6, y1, 'y = w', 'l', 'small');
    g.arrow(X(0), 196, X(0) + 34, 196, { cls: 'dim', hs: 6 }); g.label(X(0) + 38, 196, 'x', 'l', 'small accent');
    g.arrow(X(0), 196, X(0), 166, { cls: 'dim', hs: 6 }); g.label(X(0) + 4, 164, 'y', 'bl', 'small accent');
    return g.svg();
  }
  // B3: two-layer capacitor, side view
  function figB3() {
    const g = PF.fig({ alt: 'side view of a parallel-plate capacitor: bottom plate at z = 0 grounded, top plate at z = 3 mm at 10 V; layer 1 (epsilon_r = 2) from 0 to 1 mm, layer 2 (epsilon_r = 4) from 1 to 3 mm' });
    const Z = (z) => 170 - 40 * z, x0 = 40, x1 = 240;
    g.rect(x0, Z(3), x1 - x0, Z(1) - Z(3), { cls: 'shade' });
    g.line(x0, Z(1), x1, Z(1), { cls: 'dim dash' });
    g.line(x0, Z(0), x1, Z(0), { cls: 'thick' }); g.line(x0, Z(3), x1, Z(3), { cls: 'thick' });
    g.label((x0 + x1) / 2, Z(0.5), '\\epsilon_{r1} = 2', 'c', 'small');
    g.label((x0 + x1) / 2, Z(2), '\\epsilon_{r2} = 4', 'c', 'small');
    g.label(x1 + 8, Z(3), 'V_0 = 10\\ \\text{V}', 'l', 'small'); g.label(x1 + 8, Z(0), '0\\ \\text{V}', 'l', 'small');
    g.dim(x0 - 14, Z(0), x0 - 14, Z(1), '1\\ \\text{mm}', { at: 'l' });
    g.dim(x0 - 14, Z(1), x0 - 14, Z(3), '2\\ \\text{mm}', { at: 'l' });
    return g.svg();
  }
  const plotB4 = () => plot({
    x: [-3, 3], y: [-7.5, 7.5], xl: 'x\\ (\\text{m})', yl: 'B_z\\ (\\text{mT})', xt: [-2, -1, 1, 2], yt: [-6, -3, 3, 6], zero: true,
    curves: [{ pts: [[-3, 6], [-1, 6], [1, -6], [3, -6]] }], pts: [{ x: 0.5, y: -3 }, { x: 2, y: -6 }, { x: -2, y: 6 }],
  });

  const examB = [
    R(md`
      **75 minutes, 100 points.** Same format as exam A: seven multiple-choice questions (3 points each), then four problems with parts. Closed book, no calculator; formula sheet and notes allowed. Work on paper first, then enter answers.

      | Problem | Topics | Points |
      |---|---|---|
      | 1 | Multiple choice: relaxation in seawater, toroid scaling, mutual inductance, conduction vs. displacement current, which field can be B, H at a sheet between two materials, reading a wave | 21 |
      | 2 | Motional emf: a bar on rails in a graded field; current, force, power | 20 |
      | 3 | A two-layer capacitor: D, E, P, C; a leaky layer; self-discharge | 20 |
      | 4 | A vector potential: ∇·A, B, the current that makes it, flux as a line integral, gauge | 19 |
      | 5 | A sinusoidal wave in a dielectric: parameters, H from Faraday's law, power | 20 |

      ### Problem 1: multiple choice (21 points)
    `),
    Q(md`(i) Seawater has $\sigma = 4$ S/m and $\epsilon_r = 81$. A small excess charge placed inside it decays with time constant…`,
      ['0.18 ns', md`$5.6\times10^9$ s`, '2.2 ps', 'zero: a conductor holds no charge inside'], 0,
      [null, md`That is $\sigma/\epsilon$, upside down: the units are 1/s, not s.`, md`That uses $\epsilon_0$ and forgets $\epsilon_r = 81$.`, md`It reaches zero only after a few $\tau$; the decay takes a finite time $\tau = \epsilon/\sigma$.`],
      md`$\tau = \dfrac{\epsilon}{\sigma} = \dfrac{(81)(8.854\times10^{-12})}{4} = 1.79\times10^{-10}$ s. Charge inside seawater leaves for the surface in well under a nanosecond.`, { src: 'Practice B · 1(i)', hints: [md`$\tau = \epsilon/\sigma$ with $\epsilon = \epsilon_r\epsilon_0$.`] }),
    Q(md`(ii) A toroid of rectangular cross-section is rewound with twice the turns, half the height, and a larger outer radius so that $b/a$ goes from 2 to 4. Its inductance changes by a factor of…`,
      ['4', '8', '2', '1'], 0,
      [null, md`That forgets the halved height: $L \propto h$.`, md`$\ln4 = 2\ln2$: the log doubles, so this misses a factor. $4\times\tfrac12\times2 = 4$.`, md`That takes $L \propto N$ and ignores the log. $L \propto N^2$ (×4), $h$ halves (×½), $\ln(b/a)$ doubles (×2).`],
      md`$L = \dfrac{\mu N^2h}{2\pi}\ln\dfrac ba$: $N^2 \to 4$, $h \to \tfrac12$, $\ln(b/a) \to \ln4 = 2\ln2$. Total $4\times\tfrac12\times2 = 4$.`, { src: 'Practice B · 1(ii)', hints: [md`$L = \dfrac{\mu N^2h}{2\pi}\ln\dfrac ba$: multiply the three changes.`] }),
    Q(md`(iii) When the current in coil 1 changes at 200 A/s, coil 2 shows an emf of 0.1 V. If instead coil 2's current changes at 400 A/s, the emf in coil 1 is…`,
      ['0.2 V', '0.1 V', '0.05 V', 'cannot be found without the turns of each coil'], 0,
      [null, md`The rate is doubled: $\emf = M\,dI/dt$ doubles.`, 'That divides by the rate instead of multiplying.', md`Mutual inductance is reciprocal, $M_{12} = M_{21}$, whatever the turns.`],
      md`$M = \dfrac{0.1\ \text{V}}{200\ \text{A/s}} = 0.5$ mH, the same both ways. $|\emf_1| = M\,|dI_2/dt| = (0.5\times10^{-3})(400) = 0.2$ V.`, { src: 'Practice B · 1(iii)', hints: [md`$\emf_2 = M\,dI_1/dt$ gives $M$; mutual inductance is the same both ways.`] }),
    Q(md`(iv) In seawater ($\sigma = 4$ S/m, $\epsilon_r = 81$) at $f = 1$ MHz, the ratio of conduction current density to displacement current density is about…`,
      ['890', '5600', '0.0011', '72 000'], 0,
      [null, md`That uses $f$ in place of $\omega = 2\pi f$.`, md`Upside down: $\sigma E$ over $\omega\epsilon E$ is $\sigma/\omega\epsilon$.`, md`That forgets $\epsilon_r$.`],
      md`$\dfrac{|J_c|}{|J_d|} = \dfrac{\sigma E}{\omega\epsilon E} = \dfrac{4}{(2\pi\times10^6)(81)(8.854\times10^{-12})} = 888$. Seawater is a good conductor at 1 MHz.`, { src: 'Practice B · 1(iv)', hints: [md`$|J_c|/|J_d| = \sigma E/\omega\epsilon E = \sigma/\omega\epsilon$.`] }),
    Q(md`(v) Which of these can be a magnetic flux density?`,
      [md`$x^2\hat x - 2xy\,\hat y$`, md`$xy\,\hat x + xy\,\hat y$`, md`$z\,\hat x + x\,\hat y + z\,\hat z$`, md`$y\,\hat x + x\,\hat y + z^2\hat z$`], 0,
      [null, md`$\nabla\cdot\mathbf B = y + x \ne 0$.`, md`$\nabla\cdot\mathbf B = 0 + 0 + 1 = 1 \ne 0$.`, md`$\nabla\cdot\mathbf B = 2z \ne 0$.`],
      md`A magnetic field must have $\nabla\cdot\mathbf B = 0$. For $x^2\hat x - 2xy\,\hat y$: $\partial_x(x^2) + \partial_y(-2xy) = 2x - 2x = 0$ ✓.`, { src: 'Practice B · 1(v)', hints: [md`Every magnetic field has $\nabla\cdot\mathbf B = 0$.`] }),
    Q(md`(vi) A sheet $\mathbf J_s = 3\hat x$ A/m on $z = 0$ separates air ($z < 0$), where $\mathbf H = 2\hat y + 4\hat z$ A/m, from a material with $\mu_r = 2$ ($z > 0$). Just above the sheet, $\mathbf H = $`,
      [md`$-\hat y + 2\hat z$ A/m`, md`$5\hat y + 2\hat z$ A/m`, md`$-\hat y + 4\hat z$ A/m`, md`$-\hat y + 8\hat z$ A/m`, md`$2\hat y + 2\hat z$ A/m`], 0,
      [null, md`Sign of the jump: $\mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat n = 3\hat x\times\hat z = -3\hat y$.`, md`$B_z$ is continuous, not $H_z$: $H_z^+ = \mu_1H_z^-/\mu_2 = 2$.`, md`$\mu_r$ is applied the wrong way: $B_z = \mu_0(4) = 2\mu_0H_z^+$ gives $H_z^+ = 2$.`, md`The sheet's jump in tangential $\mathbf H$ was left out.`],
      md`Tangential: $\mathbf H^+_t = \mathbf H^-_t + \mathbf J_s\times\hat n = 2\hat y + 3\hat x\times\hat z = 2\hat y - 3\hat y = -\hat y$. Normal: $\mu_0(4) = 2\mu_0H_z^+$, so $H_z^+ = 2$. $\mathbf H^+ = -\hat y + 2\hat z$ A/m.`, { src: 'Practice B · 1(vi)', hints: [md`Tangential: $\mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat n$ with $\hat n = +\hat z$. Normal: $\mu_1H_z^- = \mu_2H_z^+$.`] }),
    Q(md`(vii) $\mathbf E = 5\cos(2\pi\times10^7t + 0.2\pi y)\,\hat z$ V/m. The wave travels toward…`,
      [md`$-y$, with $\lambda = 10$ m`, md`$+y$, with $\lambda = 10$ m`, md`$-y$, with $\lambda = 30$ m`, md`$-y$, with $\lambda = 0.1$ m`], 0,
      [null, md`$\omega t + \beta y$ stays constant as $y$ decreases: a $+\beta y$ phase means travel toward $-y$.`, md`$\lambda = c/f$ assumes free space. Read $\lambda$ from $\beta$: $2\pi/0.2\pi = 10$ m (the medium has $\epsilon_r = 9$).`, md`That is $\beta/2\pi$; $\lambda = 2\pi/\beta$.`],
      md`Phase $\omega t + \beta y$: constant phase moves to $-y$. $\lambda = 2\pi/\beta = 10$ m. Then $v_p = f\lambda = 10^8$ m/s $= c/3$: the medium is not free space.`, { src: 'Practice B · 1(vii)', hints: [md`Follow a point of constant phase: $\omega t + \beta y = $ const. $\lambda = 2\pi/\beta$.`] }),

    RF(md`
      ### Problem 2 (20 points): a bar on rails in a graded field

      Two conducting rails lie along $y = 0$ and $y = w = 0.5$ m in the $xy$-plane, joined at $x = 0$ by a resistor $R = 2\ \Omega$. A conducting bar slides on them at $x = s(t)$ with constant velocity $\mathbf v = 4\hat x$ m/s, starting from $s = 0$ at $t = 0$. The static field is $\mathbf B = B_0(1 + x/L)\,\hat z$ with $B_0 = 0.2$ T and $L = 2$ m. The rails and bar have no resistance; ignore the field of the induced current.

      [[fig:rails]]
    `, { rails: { svg: figB2(), cap: 'Top view, z out of the page. B grows with x (larger dots).' } }),
    P({ src: 'Practice B · 2(a–b)', title: 'Flux and emf',
      q: md`**(a) (4 pts)** Find the flux $\Psi$ through the circuit (with $d\mathbf S = +\hat z\,dS$) when $s = 3$ m.

      **(b) (5 pts)** Find the magnitude of the emf when $s = 3$ m, and the direction of the current through $R$.`,
      parts: [N('\\Psi\\ (s = 3\\ \\text{m})', 0.525, 'Wb'), N('|\\mathcal E|', 1, 'V'), mc('Through $R$ the current flows along', [md`$+\hat y$`, md`$-\hat y$`], 0, [null, md`The flux along $+\hat z$ grows, so the current is clockwise from $+z$; on the left side (the resistor) clockwise means up, $+\hat y$.`], true)],
      hints: [md`$\Psi = \int_0^s\int_0^w B_0(1 + x/L)\,dy\,dx$.`, md`$\dfrac{d\Psi}{dt} = \dfrac{d\Psi}{ds}\dfrac{ds}{dt} = B(s)\,w\,v$: only the field at the bar matters.`],
      sol: md`
        **1. Flux.** $\Psi(s) = w\int_0^sB_0\left(1 + \frac xL\right)dx = wB_0\left(s + \frac{s^2}{2L}\right) = (0.5)(0.2)\left(3 + \tfrac94\right) = 0.525$ Wb.

        **2. Emf.** $\dfrac{d\Psi}{dt} = wB_0\left(1 + \dfrac sL\right)v = B(s)\,wv = (0.5\ \text{T})(0.5\ \text{m})(4\ \text{m/s}) = 1$ V, so $|\emf| = 1$ V; along $C$ counterclockwise from $+z$, $\emf = -1$ V.

        **3. Direction.** The $+\hat z$ flux grows, so the induced current is clockwise from $+z$: down the bar ($-\hat y$), up through $R$ ($+\hat y$).

        **Check (force on charges).** In the bar, $\mathbf v\times\mathbf B = 4\hat x\times B\hat z = -4B\,\hat y$: positive charge is pushed along $-\hat y$ in the bar ✓. Same emf from the bar alone: $(\mathbf v\times\mathbf B)\cdot\boldsymbol\ell = vBw = 1$ V ✓.
      ` }),
    P({ src: 'Practice B · 2(c–e)', title: 'Current, force, power, time',
      q: md`**(c) (4 pts)** Find the current and the external force needed to keep the bar at constant speed, at $s = 3$ m.

      **(d) (4 pts)** At what time does the emf reach 2 V?

      **(e) (3 pts)** Find the mechanical power delivered at $s = 3$ m.`,
      parts: [N('|I|', 0.5, 'A'), N('|F_{\\text{ext}}|', 0.125, 'N'), N('t\\ (|\\mathcal E| = 2\\ \\text{V})', 2, 's'), N('P', 0.5, 'W')],
      hints: [md`The magnetic force on the bar is $I\boldsymbol\ell\times\mathbf B$ with $\mathbf B$ at the bar; it opposes the motion. The external force balances it.`, md`$|\emf(t)| = B_0wv\,(1 + vt/L)$, linear in $t$. Power $= Fv$; it should equal $I^2R$.`],
      sol: md`
        **(c)** $I = |\emf|/R = 1/2 = 0.5$ A. Force on the bar: current along $-\hat y$, $\mathbf F = I(-w\hat y)\times B(s)\hat z = -IwB(s)\,\hat x$, magnitude $(0.5)(0.5)(0.5) = 0.125$ N against $\mathbf v$. The external force is $0.125$ N along $+\hat x$.

        **(d)** $|\emf(t)| = B_0wv\left(1 + \dfrac{vt}{L}\right) = 0.4(1 + 2t)$ V. Setting $0.4(1 + 2t) = 2$: $t = 2$ s (the bar is at $s = 8$ m, where $B = 1$ T).

        **(e)** $P = F_{\text{ext}}v = (0.125)(4) = 0.5$ W. **Check:** $I^2R = (0.5)^2(2) = 0.5$ W ✓: all the mechanical work ends up as heat in $R$.
      ` }),

    RF(md`
      ### Problem 3 (20 points): a two-layer capacitor

      A parallel-plate capacitor has plates of area $A = 0.01\ \text{m}^2$ at $z = 0$ (grounded) and $z = 3$ mm (at $V_0 = 10$ V). The gap holds two perfect dielectrics: $\epsilon_{r1} = 2$ for $0 < z < 1$ mm and $\epsilon_{r2} = 4$ for $1 < z < 3$ mm. Ignore fringing.

      [[fig:cap]]
    `, { cap: { svg: figB3(), cap: 'Side view. The shaded layer is layer 2.' } }),
    P({ src: 'Practice B · 3(a)', title: 'D and E',
      q: md`**(a) (5 pts)** Find $|\mathbf D|$ and $|\mathbf E|$ in each layer, and the direction of the fields.`,
      parts: [N('|\\mathbf D|', 1e4 * eps0, 'C/m²'), N('|\\mathbf E_1|', 5000, 'V/m'), N('|\\mathbf E_2|', 2500, 'V/m'),
        mc('$\\mathbf E$ and $\\mathbf D$ point along', [md`$-\hat z$`, md`$+\hat z$`], 0, [null, md`$\mathbf E$ points from high potential to low: from the 10 V plate at the top down to the grounded plate.`], true)],
      hints: [md`With no free charge at the interface, $D_z$ is continuous: the same $D$ in both layers.`, md`$V_0 = E_1d_1 + E_2d_2 = D\left(\dfrac{d_1}{\epsilon_1} + \dfrac{d_2}{\epsilon_2}\right)$.`],
      sol: md`
        **1. D is the same in both layers** ($\hat n\cdot(\mathbf D_2 - \mathbf D_1) = \rho_s = 0$ at the interface).

        **2. Voltage.** $V_0 = D\left(\dfrac{d_1}{\epsilon_1} + \dfrac{d_2}{\epsilon_2}\right) = \dfrac{D}{\epsilon_0}\left(\dfrac{10^{-3}}{2} + \dfrac{2\times10^{-3}}{4}\right) = \dfrac{D}{\epsilon_0}(10^{-3}\ \text{m})$, so
        $$D = \epsilon_0\frac{10\ \text{V}}{10^{-3}\ \text{m}} = 8.85\times10^{-8}\ \text{C/m}^2$$
        **3. E.** $E_1 = D/2\epsilon_0 = 5000$ V/m, $E_2 = D/4\epsilon_0 = 2500$ V/m, both along $-\hat z$ (top plate positive).

        **Check.** $E_1d_1 + E_2d_2 = 5 + 5 = 10$ V ✓. The layer with lower $\epsilon$ carries the larger field.
      ` }),
    P({ src: 'Practice B · 3(b–c)', title: 'Polarization and capacitance',
      q: md`**(b) (3 pts)** Find $|\mathbf P|$ in layer 2.

      **(c) (3 pts)** Find the capacitance.`,
      parts: [N('|\\mathbf P_2|', 7500 * eps0, 'C/m²'), N('C', 10 * eps0, 'F')],
      hints: [md`$\mathbf P = \mathbf D - \epsilon_0\mathbf E$.`, md`$C = Q/V_0$ with $Q = DA$; or layers in series: $C = A/\left(\frac{d_1}{\epsilon_1} + \frac{d_2}{\epsilon_2}\right)$.`],
      sol: md`
        **(b)** $P_2 = D - \epsilon_0E_2 = \epsilon_0(10^4 - 2500) = 7500\epsilon_0 = 6.64\times10^{-8}$ C/m², along $-\hat z$ like $\mathbf D$. (Layer 1: $5000\epsilon_0 = 4.43\times10^{-8}$ C/m².)

        **(c)** $Q = DA = (8.85\times10^{-8})(0.01) = 8.85\times10^{-10}$ C; $C = Q/V_0 = 8.85\times10^{-11}$ F $= 88.5$ pF. Same as two capacitors in series, $C = A/\left(\frac{d_1}{\epsilon_1} + \frac{d_2}{\epsilon_2}\right) = 10\epsilon_0$ F.
      ` }),
    P({ src: 'Practice B · 3(d)', title: 'A leaky layer',
      q: md`**(d) (5 pts)** Layer 2 is replaced by a leaky material with the same $\epsilon_{r2} = 4$ and conductivity $\sigma_2 = 10^{-4}$ S/m; layer 1 stays a perfect insulator. Once steady state is reached, find $|\mathbf E_1|$, $\mathbf E_2$, and the free surface charge density at the interface $z = 1$ mm.`,
      parts: [N('|\\mathbf E_1|', 1e4, 'V/m'), mc('$\\mathbf E_2$ is', ['zero', md`$2500\ \text{V/m}$, as before`, md`$5000\ \text{V/m}$`], 0,
        [null, md`In steady state $J = \sigma_2E_2$ must equal the current through layer 1, which is zero: $E_2 = 0$.`, md`5000 V/m was layer 1's field before the leak. Layer 2 can carry no steady current ($\sigma_2E_2$ must match layer 1's zero), so $E_2 = 0$.`]),
      N('\\rho_s\\ (z = 1\\ \\text{mm})', 2e4 * eps0, 'C/m²')],
      hints: [md`Steady state: no charge keeps piling up, so the normal current density is continuous: $\sigma_1E_1 = \sigma_2E_2$.`, md`With $E_2 = 0$, all of $V_0$ drops across layer 1. Then $\rho_s = \hat z\cdot(\mathbf D_2 - \mathbf D_1)$.`],
      sol: md`
        **1. Steady state.** $J_{z}$ is continuous across the interface. Layer 1 conducts nothing, so $J_2 = \sigma_2E_2 = 0$: $\mathbf E_2 = 0$.

        **2. Layer 1** takes all the voltage: $E_1 = V_0/d_1 = 10/10^{-3} = 10^4$ V/m, along $-\hat z$.

        **3. Interface charge** ($\hat n = \hat z$, from layer 1 into layer 2):
        $$\rho_s = \hat z\cdot(\mathbf D_2 - \mathbf D_1) = 0 - (-2\epsilon_0\times10^4) = 2\times10^4\epsilon_0 = 1.77\times10^{-7}\ \text{C/m}^2$$
        **Check.** The top plate's positive charge leaked through layer 2 and now sits on the interface; the top plate itself has $\rho_s = 0$ (no field below it), and the bottom plate has $-1.77\times10^{-7}$ C/m². Total charge zero ✓.
      ` }),
    P({ src: 'Practice B · 3(e)', title: 'Self-discharge',
      q: md`**(e) (4 pts)** Instead, the whole 3 mm gap is filled with one leaky material, $\epsilon_r = 4$, $\sigma = 10^{-4}$ S/m. Find its conductance $G$, and the time constant with which it discharges itself once disconnected from the source.`,
      parts: [N('G', 1e-4 * 0.01 / 3e-3, 'S'), N('\\tau', 4 * eps0 / 1e-4, 's')],
      hints: [md`$G = \sigma A/d$. Same geometry for $C$ and $G$: $G/C = \sigma/\epsilon$.`, md`The capacitor discharges through its own conductance: $\tau = RC = C/G = \epsilon/\sigma$.`],
      sol: md`
        $G = \dfrac{\sigma A}{d} = \dfrac{(10^{-4})(0.01)}{3\times10^{-3}} = 3.33\times10^{-4}$ S. With $C = \epsilon A/d = 118$ pF, $\tau = C/G = \epsilon/\sigma = \dfrac{4(8.854\times10^{-12})}{10^{-4}} = 3.54\times10^{-7}$ s.

        **Check.** $\tau = \epsilon/\sigma$ does not depend on the shape: it is the relaxation time of the material.
      ` }),

    R(md`
      ### Problem 4 (19 points): a vector potential

      In free space, $\mathbf A = A_y(x)\,\hat y$ with ($x$ in m)
      $$A_y = -kx^2\ \ (|x| \le 1\ \text{m}), \qquad A_y = -k(2|x| - 1)\ \ (|x| \ge 1\ \text{m}), \qquad k = 3\times10^{-3}\ \text{Wb/m}^3$$
      Nothing depends on $y$, $z$ or $t$.
    `),
    P({ src: 'Practice B · 4(a–b)', title: 'Divergence and curl',
      q: md`**(a) (3 pts)** Find $\nabla\cdot\mathbf A$.

      **(b) (5 pts)** Find $B_z$ at $x = 0.5$ m, $x = 2$ m and $x = -2$ m.`,
      parts: [mc('$\\nabla\\cdot\\mathbf A$ is', ['zero everywhere', md`$-2kx$ for $|x| < 1$`, md`nonzero only at $|x| = 1$`], 0,
        [null, md`That is $\partial A_y/\partial x$, which belongs to the curl. The divergence takes $\partial A_y/\partial y$.`, md`$A_y$ is continuous with a continuous slope at $|x| = 1$, and the divergence only involves $\partial/\partial y$ anyway.`]),
      N('B_z(0.5\\ \\text{m})', -3e-3, 'T'), N('B_z(2\\ \\text{m})', -6e-3, 'T'), N('B_z(-2\\ \\text{m})', 6e-3, 'T')],
      hints: [md`$\nabla\cdot\mathbf A = \partial A_y/\partial y$. For $\mathbf A = A_y(x)\hat y$: $\nabla\times\mathbf A = \hat z\,dA_y/dx$.`, md`For $x < -1$, $|x| = -x$: $A_y = -k(-2x - 1)$.`],
      sol: md`
        **(a)** $\nabla\cdot\mathbf A = \partial A_y/\partial y = 0$ everywhere.

        **(b)** $\nabla\times\mathbf A = \hat z\dfrac{\partial A_y}{\partial x} - \hat x\dfrac{\partial A_y}{\partial z} = \hat z\dfrac{dA_y}{dx}$.
        - $|x| < 1$: $B_z = -2kx$; at $0.5$ m, $-3\times10^{-3}$ T.
        - $x > 1$: $B_z = -2k = -6\times10^{-3}$ T.
        - $x < -1$: $A_y = k(2x + 1)$, $B_z = +2k = +6\times10^{-3}$ T.

        [[fig:b]]
      `,
      figs: { b: { svg: plotB4(), cap: 'B_z(x): uniform ±6 mT outside, a linear ramp through |x| < 1 m.' } } }),
    P({ src: 'Practice B · 4(c)', title: 'The current',
      q: md`**(c) (5 pts)** Find the current density $\mathbf J$ that produces this field.`,
      parts: [N('J_y\\ (|x| < 1\\ \\text{m})', 2 * 3e-3 / mu0, 'A/m²'), mc('For $|x| > 1$ m and at $|x| = 1$ m', [md`$\mathbf J = 0$, and there is no surface current at $|x| = 1$`, md`$\mathbf J = 0$, with surface currents at $x = \pm1$`, md`$J_y = -2k/\mu_0$ for $|x| > 1$`], 0,
        [null, md`$B_z$ is continuous at $x = \pm1$ ($-2k\cdot1 = -2k$), so tangential $\mathbf H$ does not jump: no sheet.`, md`$B_z$ is uniform for $|x| > 1$, so its curl is zero there.`])],
      hints: [md`$\mathbf J = \nabla\times\mathbf H = \dfrac{1}{\mu_0}\nabla\times(B_z\hat z) = -\dfrac{1}{\mu_0}\dfrac{dB_z}{dx}\hat y$.`],
      sol: md`
        $\mathbf J = \dfrac{1}{\mu_0}\nabla\times(B_z\hat z) = \dfrac{1}{\mu_0}\left(\hat x\dfrac{\partial B_z}{\partial y} - \hat y\dfrac{\partial B_z}{\partial x}\right) = -\dfrac{1}{\mu_0}\dfrac{dB_z}{dx}\hat y$.

        Inside: $dB_z/dx = -2k$, so $J_y = \dfrac{2k}{\mu_0} = \dfrac{6\times10^{-3}}{4\pi\times10^{-7}} = 4.77\times10^3$ A/m². Outside: $B_z$ uniform, $\mathbf J = 0$. At $|x| = 1$, $B_z$ is continuous: no sheet.

        **Check.** A slab of $J\hat y$, width $W = 2$ m, gives $|B| = \mu_0JW/2 = \mu_0(4.77\times10^3)(1) = 6\times10^{-3}$ T outside ✓, and the RHR: at $x > 0$, $\hat y\times\hat x = -\hat z$ ✓.
      ` }),
    P({ src: 'Practice B · 4(d–e)', title: 'Flux from A, and gauge',
      q: md`**(d) (3 pts)** Find the flux through the rectangle $0 \le x \le 2$ m, $0 \le y \le 1$ m in the plane $z = 0$, with $d\mathbf S = +\hat z\,dS$.

      **(e) (3 pts)** Which vector potential gives the **same** $\mathbf B$?`,
      parts: [N('\\Psi', -9e-3, 'Wb'), mc('', [md`$\mathbf A + 5y\,\hat x + 5x\,\hat y$`, md`$\mathbf A + 5x\,\hat y$`, md`$\mathbf A + 5z\,\hat y$`, md`$\mathbf A + 5y\,\hat x$`], 0,
        [null, md`$\nabla\times(5x\hat y) = 5\hat z$: adds a uniform field.`, md`$\nabla\times(5z\hat y) = -5\hat x$: adds a field along $x$.`, md`$\nabla\times(5y\hat x) = -5\hat z$.`])],
      hints: [md`Stokes: $\Psi = \int_S(\nabla\times\mathbf A)\cdot d\mathbf S = \oint_C\mathbf A\cdot d\mathbf l$, with $C$ counterclockwise from $+z$. Only the legs along $y$ count.`, md`Adding a gradient, $\nabla\psi$, never changes $\nabla\times\mathbf A$. $5y\hat x + 5x\hat y = \nabla(5xy)$.`],
      sol: md`
        **(d)** Directly: $\Psi = (1\ \text{m})\left[\int_0^1(-2kx)\,dx + \int_1^2(-2k)\,dx\right] = -k - 2k = -3k = -9\times10^{-3}$ Wb.

        From $\mathbf A$: $\Psi = \oint_C\mathbf A\cdot d\mathbf l$ around the rectangle counterclockwise. The legs along $x$ give zero ($A_x = 0$). Up the leg $x = 2$: $A_y(2)\cdot(1) = -3k$. Down the leg $x = 0$: $A_y(0) = 0$. $\Psi = -3k$ ✓.

        **(e)** $5y\hat x + 5x\hat y = \nabla(5xy)$, and $\nabla\times\nabla\psi = 0$: $\mathbf B$ is unchanged. The others add a uniform field.
      ` }),

    R(md`
      ### Problem 5 (20 points): a sinusoidal wave in a dielectric

      In a lossless, nonmagnetic dielectric,
      $$\mathbf E = 12\cos\left(4\pi\times10^8t + \tfrac{8\pi}{3}x\right)\hat z\ \text{V/m}\qquad (x\ \text{in m})$$
    `),
    P({ src: 'Practice B · 5(a–b)', title: 'Reading the wave',
      q: md`**(a) (5 pts)** Find the frequency, the wavelength and the direction of travel.

      **(b) (3 pts)** Find $\epsilon_r$ and the intrinsic impedance $\eta$.`,
      parts: [N('f', 2e8, 'Hz'), N('\\lambda', 0.75, 'm'), mc('The wave travels along', [md`$-\hat x$`, md`$+\hat x$`, md`$+\hat z$`], 0,
        [null, md`The phase is $\omega t + \beta x$: it stays constant as $x$ **decreases**.`, md`$\hat z$ is the polarization (the direction of $\mathbf E$); the wave travels perpendicular to it.`]),
      N('\\epsilon_r', 4, ''), N('\\eta', 60 * PI, 'Ω')],
      hints: [md`$f = \omega/2\pi$, $\lambda = 2\pi/\beta$, $v_p = \omega/\beta = f\lambda$.`, md`$v_p = c/\sqrt{\epsilon_r}$, $\eta = \eta_0/\sqrt{\epsilon_r}$.`],
      sol: md`
        **(a)** $f = \omega/2\pi = 2\times10^8$ Hz; $\lambda = 2\pi/\beta = 2\pi\cdot\tfrac{3}{8\pi} = 0.75$ m; phase $\omega t + \beta x$: travel along $-\hat x$.

        **(b)** $v_p = f\lambda = 1.5\times10^8$ m/s $= c/2$, so $\epsilon_r = 4$ and $\eta = 120\pi/2 = 60\pi = 188\ \Omega$.
      ` }),
    P({ src: 'Practice B · 5(c)', title: 'H from Faraday\'s law',
      q: md`**(c) (5 pts)** Use $\nabla\times\mathbf E = -\mu_0\,\partial\mathbf H/\partial t$ to find $\mathbf H$: its amplitude and its direction when $E_z > 0$.`,
      parts: [N('H_0', 12 / (60 * PI), 'A/m'), mc('When $E_z > 0$, $\\mathbf H$ points along', [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat x$`, md`$-\hat x$`], 0,
        [null, md`Then $\mathbf E\times\mathbf H = \hat z\times(-\hat y) = +\hat x$: the wrong way for a wave moving to $-x$.`, md`$\mathbf H$ is perpendicular to the direction of travel ($\pm\hat x$).`, md`$\mathbf H$ is perpendicular to the direction of travel ($\pm\hat x$).`])],
      hints: [md`For $\mathbf E = E_z(x,t)\hat z$: $\nabla\times\mathbf E = -\hat y\,\partial E_z/\partial x$.`, md`Integrate in time; the amplitude comes out as $E_0\beta/\mu_0\omega = E_0/\eta$.`],
      sol: md`
        **1. Curl.** $\nabla\times\mathbf E = \hat x\dfrac{\partial E_z}{\partial y} - \hat y\dfrac{\partial E_z}{\partial x} = -\hat y\dfrac{\partial E_z}{\partial x} = 12\beta\sin(\omega t + \beta x)\,\hat y$.

        **2. Integrate.** $\dfrac{\partial\mathbf H}{\partial t} = -\dfrac{12\beta}{\mu_0}\sin(\omega t + \beta x)\,\hat y$, so
        $$\mathbf H = \frac{12\beta}{\mu_0\omega}\cos(\omega t + \beta x)\,\hat y = \frac{12}{60\pi}\cos(\omega t + \beta x)\,\hat y = 0.0637\cos(\omega t + \beta x)\,\hat y\ \text{A/m}$$
        using $\beta/\mu_0\omega = 1/\mu_0v_p = 1/\eta$.

        **Check.** $\mathbf E\times\mathbf H = \hat z\times\hat y = -\hat x$ when both are positive: along the travel ✓. $E_0/H_0 = 188\ \Omega = \eta$ ✓.
      ` }),
    P({ src: 'Practice B · 5(d–e)', title: 'Power',
      q: md`**(d) (4 pts)** Find the time-averaged Poynting vector's magnitude, and the average power through a $2\ \text{m}\times1.5$ m window in a plane $x = $ const.

      **(e) (3 pts)** Find $E_z$ and $S_x$ at $x = 0.25$ m, $t = 0$.`,
      parts: [N('\\langle S\\rangle', 144 / (120 * PI), 'W/m²'), N('\\langle P\\rangle', 3 * 144 / (120 * PI), 'W'), N('E_z(0.25\\ \\text{m}, 0)', -6, 'V/m'), N('S_x(0.25\\ \\text{m}, 0)', -36 / (60 * PI), 'W/m²')],
      hints: [md`$\langle S\rangle = E_0^2/2\eta$; the window faces the wave, so $\langle P\rangle = \langle S\rangle A$.`, md`At $x = 0.25$ m, $t = 0$: phase $= \tfrac{8\pi}{3}(0.25) = \tfrac{2\pi}{3}$, $\cos = -\tfrac12$. $S_x = -E_zH_y$.`],
      sol: md`
        **(d)** $\langle S\rangle = \dfrac{E_0^2}{2\eta} = \dfrac{144}{2(60\pi)} = 0.382$ W/m², along $-\hat x$. The window's normal is along $x$: $\langle P\rangle = (0.382)(3\ \text{m}^2) = 1.15$ W.

        **(e)** Phase $2\pi/3$: $E_z = 12(-\tfrac12) = -6$ V/m and $H_y = 0.0637(-\tfrac12) = -0.0318$ A/m.
        $$\mathbf S = E_z\hat z\times H_y\hat y = -E_zH_y\,\hat x = -(-6)(-0.0318)\,\hat x = -0.191\,\hat x\ \text{W/m}^2$$
        **Check.** $\mathbf S$ points along $-\hat x$ even though both fields are negative: $E$ and $H$ change sign together, so the power always flows with the wave ✓.
      ` }),
  ];
  EM.lesson('e2-prac', { id: 'prac-b', title: 'Practice exam B', kind: 'mock', steps: examB });

  // ======================================================================================== PRACTICE EXAM C
  // C2: toroid top view with a secondary turn
  function figC2() {
    const g = PF.fig({ alt: 'top view of a toroid: an annular core between radius a and radius b, windings drawn as radial lines across it, and one extra turn wrapped around the core at the lower right' });
    const cx = 120, cy = 112, ra = 24, rb = 92;
    g.circle(cx, cy, rb, { cls: 'shade' }); g.circle(cx, cy, ra, { cls: 'bgfill' });
    g.circle(cx, cy, rb); g.circle(cx, cy, ra);
    for (let k = 0; k < 20; k++) {
      const t = (k * 18 + 9) * PI / 180;
      if ([0, 9, 10, 17, 19].includes(k)) continue;     // room for the radii (0° and 180°) and the extra turn (−45°)
      g.line(cx + (ra - 3) * Math.cos(t), cy - (ra - 3) * Math.sin(t), cx + (rb + 3) * Math.cos(t), cy - (rb + 3) * Math.sin(t), { cls: 'thin' });
    }
    const t2 = -45 * PI / 180;
    g.line(cx + (ra - 4) * Math.cos(t2), cy - (ra - 4) * Math.sin(t2), cx + (rb + 6) * Math.cos(t2), cy - (rb + 6) * Math.sin(t2), { cls: 'thick' });
    g.label(cx + (rb + 10) * Math.cos(t2), cy - (rb + 10) * Math.sin(t2), '\\text{1 extra turn}', 'tl', 'small');
    g.dim(cx, cy, cx - ra, cy, 'a', { at: 't' });
    g.dim(cx, cy, cx + rb, cy, 'b', { at: 't' });
    return g.svg();
  }
  // C3: capacitor with circular plates and two Amperian circles in the midplane
  function figC3() {
    const g = PF.fig({ alt: 'side view of a capacitor with circular plates of radius R and gap d; two dashed circles in the midplane, of radius 3 cm (inside the plate edge) and 10 cm (outside it); wires leave the plate centers' });
    const cx = 150, R = 60, yt = 70, yb = 100;
    g.line(cx - R, yt, cx + R, yt, { cls: 'thick' }); g.line(cx - R, yb, cx + R, yb, { cls: 'thick' });
    g.line(cx, yt, cx, 30); g.line(cx, yb, cx, 140);
    g.ellipse(cx, (yt + yb) / 2, 36, 7, { cls: 'dash' });
    g.ellipse(cx, (yt + yb) / 2, 120, 16, { cls: 'dash dim' });
    g.label(cx + 40, (yt + yb) / 2 - 2, 'r = 3\\ \\text{cm}', 'bl', 'small');
    g.label(cx + 122, (yt + yb) / 2 + 14, 'r = 10\\ \\text{cm}', 'tl', 'small');
    g.dim(cx + R + 10, yt, cx + R + 10, yb, 'd', { at: 'r' });
    g.label(cx - R, yt - 4, 'R = 5\\ \\text{cm}', 'br', 'small');
    return g.svg();
  }
  // C4: two sheets with a magnetic slab in the lower half of the gap
  function figC4() {
    const g = PF.fig({ alt: 'side view, z up, x out of the page: a sheet at z = 0 with current into the page, a sheet at z = 4 cm with current out of the page; the lower half of the gap (0 to 2 cm) is a magnetic slab with mu_r = 50, the upper half is air' });
    const Z = (z) => 170 - 30 * z, x0 = 30, x1 = 230;
    g.rect(x0, Z(2), x1 - x0, Z(0) - Z(2), { cls: 'shade' });
    g.line(x0, Z(2), x1, Z(2), { cls: 'dim' });
    g.line(x0, Z(0), x1, Z(0), { cls: 'thick dash' }); g.line(x0, Z(4), x1, Z(4), { cls: 'thick dash' });
    for (const x of [60, 110, 160, 210]) { g.otimes(x, Z(0), 5); g.odot(x, Z(4), 5); }
    g.label((x0 + x1) / 2, Z(1), '\\mu_r = 50', 'c', 'small'); g.label((x0 + x1) / 2, Z(3), '\\text{air}', 'c', 'small');
    g.label(x1 + 8, Z(0), '-2\\hat x\\ \\text{A/m}', 'l', 'small'); g.label(x1 + 8, Z(4), '+2\\hat x\\ \\text{A/m}', 'l', 'small');
    g.arrow(10, Z(-0.6), 10, Z(4.7), { cls: 'dim', hs: 6 }); g.label(15, Z(4.7), 'z\\ (\\text{cm})', 'bl', 'small accent');
    for (const z of [0, 2, 4]) g.label(5, Z(z), String(z), 'r', 'small accent');
    return g.svg();
  }
  const plotC5 = () => plot({
    x: [-0.6, 3], y: [-1, 7], xl: 't\\ (\\mu\\text{s})', yl: 'E_x(0,t)\\ (\\text{V/m})', xt: [1, 2], yt: [3, 6], zero: true,
    curves: [{ pts: [[-0.6, 0], [0, 0], [0, 6], [2, 0], [3, 0]] }],
  });
  const plotC5z = () => plot({
    x: [-400, 400], y: [-1, 7], xl: 'z\\ (\\text{m})', yl: 'E_x(z, 1\\ \\mu\\text{s})', xt: [[-200, '-200'], [200, '200']], yt: [3, 6], zero: true,
    curves: [{ pts: [[-400, 0], [-200, 0], [-200, 6], [200, 0], [400, 0]] }], pts: [{ x: 0, y: 3 }],
  });

  const examC = [
    R(md`
      **75 minutes, 100 points.** Same format: seven multiple-choice questions (3 points each), then four problems with parts. Closed book, no calculator; formula sheet and notes allowed.

      | Problem | Topics | Points |
      |---|---|---|
      | 1 | Multiple choice: a voltmeter across a resistive ring, a spinning rod, L′C′ of a line, an iron core, E at a dielectric interface, a sheet's wave amplitude, power from H | 21 |
      | 2 | A toroid with an iron core: B, flux, L, a secondary turn, scaling | 20 |
      | 3 | Displacement current: E from H by the curl; the field between capacitor plates | 20 |
      | 4 | Magnetic materials: a magnetic slab between current sheets; B and H at an interface | 19 |
      | 5 | A pulse recorded at two points: speed, the wave in space, H, energy | 20 |

      ### Problem 1: multiple choice (21 points)
    `),
    Q(md`(i) A uniform resistive ring encloses a region of changing $\mathbf B$, uniform over the ring's disk; the emf around the ring is 12 V. A voltmeter is connected between two diametrically opposite points of the ring, its leads running straight along the diameter. It reads…`,
      ['0', '6 V', '12 V', '3 V'], 0,
      [null, md`6 V is the drop along half the ring, but the leads cut the disk in half: the half-disk's emf, also 6 V, cancels it.`, 'That is the emf around the whole ring; the voltmeter loop encloses only half the flux.', md`The half-ring's drop ($6$ V) and the half-disk's emf ($6$ V) cancel exactly; nothing leaves a quarter.`],
      md`Close a loop: half the ring plus the voltmeter's diameter. It encloses half the flux, so its emf is 6 V. Along the half ring the resistive drop is $IR/2 = 6$ V in the same sense. Faraday on that loop: $6 = 6 + V$, so $V = 0$. A diameter voltmeter on a symmetric ring reads nothing, whatever the emf.`, { src: 'Practice C · 1(i)', hints: [md`Close a loop with half the ring and the voltmeter's leads. How much flux does it enclose, and what is the resistive drop along that half?`] }),
    Q(md`(ii) A 0.5 m metal rod spins at 20 rad/s about one end, in a plane perpendicular to a uniform $B = 0.4$ T. The emf between its ends is…`,
      ['1 V', '2 V', '4 V', 'zero: there is no closed loop'], 0,
      [null, md`That uses the tip speed for the whole rod; the speed grows from 0 at the pivot, so average it: $\tfrac12$.`, md`$B\omega L$ has units of V/m; integrate $vB$ along the rod.`, md`Motional emf $\int(\mathbf v\times\mathbf B)\cdot d\mathbf l$ exists along any moving conductor; the charges separate until it is balanced.`],
      md`$\emf = \int_0^L(\omega r)B\,dr = \tfrac12B\omega L^2 = \tfrac12(0.4)(20)(0.25) = 1$ V.`, { src: 'Practice C · 1(ii)', hints: [md`A piece $dr$ at radius $r$ moves at $\omega r$: $d\emf = \omega rB\,dr$.`] }),
    Q(md`(iii) A parallel-plate transmission line, filled with a nonmagnetic dielectric of $\epsilon_r = 2.25$, has $L' = 0.25\ \mu$H/m. Its capacitance per unit length is…`,
      ['100 pF/m', '44.4 pF/m', '225 pF/m', '66.7 pF/m'], 0,
      [null, md`That forgets $\epsilon_r$: $L'C' = \mu\epsilon = \epsilon_r/c^2$.`, md`$\epsilon_r$ is used twice.`, md`That uses $\sqrt{\epsilon_r}$ in place of $\epsilon_r$.`],
      md`$L'C' = \mu\epsilon = \dfrac{\epsilon_r}{c^2}$, so $C' = \dfrac{2.25}{(9\times10^{16})(2.5\times10^{-7})} = 10^{-10}$ F/m $= 100$ pF/m.`, { src: 'Practice C · 1(iii)', hints: [md`For a two-conductor line filled with one medium, $L'C' = \mu\epsilon$.`] }),
    Q(md`(iv) A long solenoid with 1000 turns/m carries 0.1 A and is filled with iron, $\mu_r = 1000$. Inside, $|\mathbf B|$ is…`,
      ['0.126 T', md`$1.26\times10^{-4}$ T`, '126 T', '100 A/m'], 0,
      [null, 'That ignores the core.', md`$\mu_r$ is applied twice.`, md`That is $H = nI$, which the core does not change; $B = \mu_0\mu_rH$.`],
      md`$H = nI = 100$ A/m (free current only), $B = \mu_0\mu_rH = (4\pi\times10^{-7})(1000)(100) = 0.126$ T.`, { src: 'Practice C · 1(iv)', hints: [md`$H = nI$ (free current only), then $B = \mu_0\mu_rH$.`] }),
    Q(md`(v) The plane $z = 0$ separates a dielectric with $\epsilon_r = 2$ ($z < 0$), where $\mathbf E = 3\hat x + 4\hat z$ V/m, from one with $\epsilon_r = 4$ ($z > 0$). There is no free surface charge. Just above, $\mathbf E = $`,
      [md`$3\hat x + 2\hat z$ V/m`, md`$1.5\hat x + 2\hat z$ V/m`, md`$3\hat x + 8\hat z$ V/m`, md`$6\hat x + 2\hat z$ V/m`], 0,
      [null, md`Tangential $\mathbf E$ is continuous; only the normal part scales.`, md`Normal $D$ is continuous: $2(4) = 4E_z$, so $E_z = 2$, not 8.`, md`Tangential $\mathbf E$ is continuous, not tangential $\mathbf D$.`],
      md`$E_x$ continuous: 3. $D_z$ continuous: $2\epsilon_0(4) = 4\epsilon_0E_z$, $E_z = 2$. $\mathbf E = 3\hat x + 2\hat z$ V/m.`, { src: 'Practice C · 1(v)', hints: [md`Tangential $\mathbf E$ is continuous; normal $\mathbf D$ is continuous with no free surface charge.`] }),
    Q(md`(vi) A sheet $\mathbf J_s = -0.2\cos(\omega t)\,\hat x$ A/m on $z = 0$ radiates into free space. The amplitude of $\mathbf E$ in $z > 0$ is…`,
      ['37.7 V/m', '75.4 V/m', '0.1 V/m', '18.8 V/m'], 0,
      [null, md`The sheet's current splits between two waves: $\eta/2$, not $\eta$.`, md`That is the amplitude of $H$, $J_s/2$ (in A/m).`, md`That uses $\eta_0/4$.`],
      md`$E_0 = \dfrac{\eta_0}{2}J_{s0} = 60\pi(0.2) = 12\pi = 37.7$ V/m.`, { src: 'Practice C · 1(vi)', hints: [md`A sheet launches $E_0 = \tfrac\eta2J_{s0}$ on each side.`] }),
    Q(md`(vii) A plane wave in free space has $\mathbf H$ of amplitude 0.5 A/m. Its time-averaged power density is…`,
      [md`47.1 W/m²`, md`94.2 W/m²`, md`$3.3\times10^{-4}$ W/m²`, md`188 W/m²`], 0,
      [null, md`The time average of $\cos^2$ is $\tfrac12$.`, md`That divides by $\eta_0$; with $H$ given, $\langle S\rangle = \tfrac12\eta_0H_0^2$.`, md`That is $\eta_0H_0$: the amplitude of $E$, in V/m.`],
      md`$\langle S\rangle = \tfrac12\eta_0H_0^2 = 60\pi(0.25) = 15\pi = 47.1$ W/m².`, { src: 'Practice C · 1(vii)', hints: [md`$\langle S\rangle = \tfrac12\eta_0H_0^2$ when $H_0$ is given.`] }),

    RF(md`
      ### Problem 2 (20 points): a toroid with an iron core

      A toroid of rectangular cross-section has inner radius $a = 1$ cm, outer radius $b = 4$ cm, height $h = 1$ cm and $N = 500$ turns on a linear iron core with $\mu_r = 100$. It carries $I = 0.5$ A. Use $\ln4 = 1.386$.

      [[fig:tor]]
    `, { tor: { svg: figC2(), cap: 'Top view. The windings (thin lines) and one extra turn (thick) wrap around the core.' } }),
    P({ src: 'Practice C · 2(a–b)', title: 'B and flux',
      q: md`**(a) (4 pts)** Find $|\mathbf B|$ in the core at $r = 2$ cm.

      **(b) (4 pts)** Find the flux through one turn.`,
      parts: [N('|\\mathbf B|\\ (2\\ \\text{cm})', 0.25, 'T'), N('\\Psi_1', 0.5e-4 * Math.log(4), 'Wb')],
      hints: [md`Ampère around a circle inside the core: $H_\phi\,2\pi r = NI$. Then $B = \mu_0\mu_rH$.`, md`$\Psi_1 = \int_a^b B_\phi\,h\,dr = \dfrac{\mu NIh}{2\pi}\ln\dfrac ba$.`],
      sol: md`
        **(a)** A circle of radius $r$ inside the core links all $N$ turns: $H_\phi = \dfrac{NI}{2\pi r}$, $B_\phi = \dfrac{\mu_0\mu_rNI}{2\pi r} = \dfrac{(2\times10^{-7})(100)(250)}{0.02} = 0.25$ T.

        **(b)** $\Psi_1 = \displaystyle\int_a^b\frac{\mu NI}{2\pi r}h\,dr = \frac{\mu NIh}{2\pi}\ln\frac ba = (2\times10^{-7})(100)(250)(0.01)(1.386) = 6.93\times10^{-5}$ Wb.
      ` }),
    P({ src: 'Practice C · 2(c–d)', title: 'Self and mutual inductance',
      q: md`**(c) (4 pts)** Find the inductance $L$.

      **(d) (4 pts)** One extra turn of wire is wrapped once around the core, as drawn. Find its mutual inductance with the toroid and its emf magnitude when $I$ grows at 100 A/s. A second loop lies flat in the toroid's central hole (around the axis, not through the core): what is its emf?`,
      parts: [N('L', 0.05 * Math.log(4), 'H'), N('M', 1e-4 * Math.log(4), 'H'), N('|\\mathcal E_{\\text{turn}}|', 1e-2 * Math.log(4), 'V'),
        mc('The loop in the hole has emf', ['zero', md`the same as the extra turn`, md`$N$ times that of the extra turn`], 0,
          [null, md`$\mathbf B$ of an ideal toroid is confined to the core; a loop in the hole links none of it.`, md`It links no flux at all: the field is inside the core.`])],
      hints: [md`$L = N\Psi_1/I$. A single turn around the core links $\Psi_1$: $M = \Psi_1/I$.`, md`$|\emf| = M\,dI/dt$. Outside the core of an ideal toroid, $\mathbf B = 0$.`],
      sol: md`
        **(c)** $L = \dfrac{N\Psi_1}{I} = \dfrac{(500)(6.93\times10^{-5})}{0.5} = 6.93\times10^{-2}$ H $= 69.3$ mH. (Formula: $L = \dfrac{\mu N^2h}{2\pi}\ln\dfrac ba$.)

        **(d)** The extra turn links the flux of one turn: $M = \Psi_1/I = 1.39\times10^{-4}$ H, and $|\emf| = M\,dI/dt = (1.39\times10^{-4})(100) = 1.39\times10^{-2}$ V $= 13.9$ mV. The loop in the hole links no flux ($\mathbf B = 0$ outside the core): emf zero.

        **Check.** $L/M = N = 500$: the toroid links the core flux $N$ times, the extra turn once ✓.
      ` }),
    P({ src: 'Practice C · 2(e)', title: 'Scaling',
      q: md`**(e) (4 pts)** By what factor does $L$ change if…`,
      parts: [
        fac('(i) $N$ is doubled', '4', () => md`$L \propto N^2$: twice the turns make twice the flux, linked by twice the turns.`),
        fac('(ii) $a$, $b$ and $h$ are all doubled', '2', () => md`$L \propto h\ln(b/a)$: $h$ doubles, the ratio $b/a$ does not.`),
        fac('(iii) the current is halved', '1', () => md`$L$ is geometry and material only: $\Psi$ halves with $I$, so $\Psi/I$ is fixed.`),
      ],
      hints: [md`$L = \dfrac{\mu N^2h}{2\pi}\ln\dfrac ba$.`],
      sol: md`$L = \dfrac{\mu N^2h}{2\pi}\ln\dfrac ba$: (i) $N^2$: **×4**. (ii) $h$ doubles, $\ln(b/a)$ unchanged: **×2**. (iii) independent of $I$: **×1**. (Removing the core would give **×0.01**.)` }),

    R(md`
      ### Problem 3 (20 points): displacement current

      The two parts are independent.

      **Part A.** In free space, $\mathbf H = 0.1\cos(6\pi\times10^8t - 2\pi z)\,\hat x$ A/m.
    `),
    P({ src: 'Practice C · 3(a)', title: 'E from H',
      q: md`**(i) (4 pts)** Use $\nabla\times\mathbf H = \epsilon_0\,\partial\mathbf E/\partial t$ to find the amplitude of $\mathbf E$, and its direction when $\cos(\cdot) > 0$.

      **(ii) (3 pts)** Find the amplitude of the displacement current density.

      **(iii) (3 pts)** Which way does the wave travel?`,
      parts: [N('E_0', 0.2 * PI / (eps0 * 6 * PI * 1e8), 'V/m'), mc('When $\\cos(\\cdot) > 0$, $\\mathbf E$ points along', [md`$-\hat y$`, md`$+\hat y$`, md`$+\hat z$`], 0,
        [null, md`Then $\mathbf E\times\mathbf H = \hat y\times\hat x = -\hat z$, against the travel set by $t - z/v$.`, md`$\mathbf E$ is perpendicular to the travel direction $\hat z$.`]),
      N('|\\partial\\mathbf D/\\partial t|_{\\max}', 0.2 * PI, 'A/m²'),
      mc('The wave travels along', [md`$+\hat z$`, md`$-\hat z$`, md`$+\hat x$`], 0, [null, md`The phase $\omega t - \beta z$ is constant as $z$ **increases**.`, md`$\hat x$ is the direction of $\mathbf H$.`])],
      hints: [md`For $\mathbf H = H_x(z,t)\hat x$: $\nabla\times\mathbf H = \hat y\,\partial H_x/\partial z$.`, md`$\partial\mathbf D/\partial t = \nabla\times\mathbf H$ directly; its amplitude is $\beta H_0$.`],
      sol: md`
        **1. Curl.** $\nabla\times\mathbf H = \hat y\dfrac{\partial H_x}{\partial z} = \hat y\,(0.1)(2\pi)\sin(\omega t - \beta z) = 0.2\pi\sin(\omega t - \beta z)\,\hat y$ A/m². This **is** $\partial\mathbf D/\partial t$: amplitude $0.2\pi = 0.628$ A/m².

        **2. Integrate.** $\epsilon_0\,\partial\mathbf E/\partial t = 0.2\pi\sin(\omega t - \beta z)\,\hat y$, so
        $$\mathbf E = -\frac{0.2\pi}{\epsilon_0\omega}\cos(\omega t - \beta z)\,\hat y = -\frac{0.2\pi}{(8.854\times10^{-12})(6\pi\times10^8)}\cos(\cdot)\,\hat y = -37.7\cos(\omega t - 2\pi z)\,\hat y\ \text{V/m}$$
        **3. Check.** $E_0 = \eta_0H_0 = 120\pi(0.1) = 37.7$ V/m ✓; $\beta = \omega/c = 2\pi$ ✓. Travel $+\hat z$ (phase $\omega t - \beta z$), and $\mathbf E\times\mathbf H = (-\hat y)\times\hat x = +\hat z$ ✓.
      ` }),
    RF(md`
      **Part B.** An air capacitor with circular plates of radius $R = 5$ cm and gap $d = 1$ mm is driven by $V(t) = 100\sin(2\pi\times10^6t)$ V. Ignore fringing; the field between the plates is uniform.

      [[fig:cap]]
    `, { cap: { svg: figC3(), cap: 'Amperian circles in the midplane: one inside the plate edge, one outside it.' } }),
    P({ src: 'Practice C · 3(b)', title: 'Ampère–Maxwell between the plates',
      q: md`**(iv) (4 pts)** Find the amplitude of $H_\phi$ at $r = 3$ cm in the midplane.

      **(v) (3 pts)** Find the amplitude of $H_\phi$ at $r = 10$ cm in the midplane.

      **(vi) (3 pts)** Find the amplitude of the current in the wires.`,
      parts: [N('H_\\phi(3\\ \\text{cm})', 0.015 * eps0 * 1e5 * 2 * PI * 1e6, 'A/m'), N('H_\\phi(10\\ \\text{cm})', eps0 * 1e5 * 2 * PI * 1e6 * 0.0025 / 0.2, 'A/m'), N('I_0', eps0 * PI * 0.0025 / 1e-3 * 100 * 2 * PI * 1e6, 'A')],
      hints: [md`$\oint\mathbf H\cdot d\mathbf l = \dfrac{d}{dt}\int\mathbf D\cdot d\mathbf S$: only the area **inside the plates** carries $\partial D/\partial t$.`, md`$|\partial E/\partial t|_{\max} = \dfrac{V_0}{d}\omega$. The wire current is $C\,dV/dt$ with $C = \epsilon_0\pi R^2/d$.`],
      sol: md`
        $E = V/d$, so $\epsilon_0\left|\dfrac{\partial E}{\partial t}\right|_{\max} = \epsilon_0\dfrac{V_0\omega}{d} = (8.854\times10^{-12})\dfrac{(100)(2\pi\times10^6)}{10^{-3}} = 5.56$ A/m².

        **(iv)** $r < R$: $H_\phi\,2\pi r = \epsilon_0\dfrac{\partial E}{\partial t}\pi r^2$, so $H_\phi = \dfrac r2\epsilon_0\dfrac{\partial E}{\partial t}$: amplitude $(0.015)(5.56) = 0.0834$ A/m.

        **(v)** $r > R$: only $\pi R^2$ carries displacement current: $H_\phi = \dfrac{R^2}{2r}\epsilon_0\dfrac{\partial E}{\partial t} = \dfrac{0.0025}{0.2}(5.56) = 0.0695$ A/m.

        **(vi)** $I_0 = C\,V_0\omega = \dfrac{\epsilon_0\pi R^2}{d}V_0\omega = (5.56)(\pi\times0.0025) = 4.37\times10^{-2}$ A $= 43.7$ mA.

        **Check.** At $r = 10$ cm a circle around the **wire** gives $H_\phi = I_0/2\pi r = 0.0437/0.628 = 0.0695$ A/m, the same as (v): the displacement current between the plates equals the conduction current in the wires ✓.
      ` }),

    RF(md`
      ### Problem 4 (19 points): magnetic materials

      **Part A.** Two infinite current sheets: $\mathbf J_s = -2\hat x$ A/m on $z = 0$ and $\mathbf J_s = +2\hat x$ A/m on $z = 4$ cm. A linear magnetic slab with $\mu_r = 50$ fills $0 < z < 2$ cm; the rest of the gap, $2 < z < 4$ cm, is air.

      [[fig:sl]]
    `, { sl: { svg: figC4(), cap: 'Side view, x out of the page: the bottom sheet\'s current goes in, the top sheet\'s comes out.' } }),
    P({ src: 'Practice C · 4(a)', title: 'H, B, M',
      q: md`**(i) (4 pts)** Find $H_y$ between the sheets. Is it different in the slab and in the air?

      **(ii) (4 pts)** Find $|\mathbf B|$ in the slab and in the air.

      **(iii) (4 pts)** Find $|\mathbf M|$ in the slab, and the bound surface current density on the slab's top face, $z = 2$ cm.`,
      parts: [N('H_y', 2, 'A/m'), mc('$\\mathbf H$ in the slab, compared with the air', ['the same', md`50 times smaller`, md`50 times larger`], 0,
        [null, md`$\mathbf H$ is set by the free currents only, and tangential $\mathbf H$ is continuous at $z = 2$ cm (no free sheet there).`, md`$\mathbf B$ is 50 times larger in the slab; $\mathbf H$ is not.`]),
      N('|\\mathbf B|_{\\text{slab}}', 100 * mu0, 'T'), N('|\\mathbf B|_{\\text{air}}', 2 * mu0, 'T'), N('|\\mathbf M|', 98, 'A/m'), N('|\\mathbf J_{s,b}|\\ (z = 2\\ \\text{cm})', 98, 'A/m'),
      mc('That bound current points along', [md`$+\hat x$`, md`$-\hat x$`], 0, [null, md`$\mathbf J_{s,b} = \mathbf M\times\hat n$ with $\hat n = +\hat z$ (out of the slab): $98\hat y\times\hat z = +98\hat x$.`], true)],
      hints: [md`Each sheet gives $\tfrac12\mathbf J_s\times\hat n$; between them both point the same way. Ampère for $\mathbf H$ sees only free current.`, md`$\mathbf M = \chi_m\mathbf H$, $\chi_m = \mu_r - 1$. The bound current is $\nabla\times\mathbf M$; where $\mathbf M$ drops to zero at a face, that is a sheet $\mathbf M\times\hat n$.`],
      sol: md`
        **(i)** Bottom sheet, above it: $\tfrac12(-2\hat x)\times\hat z = +\hat y$. Top sheet, below it: $\tfrac12(2\hat x)\times(-\hat z) = +\hat y$. Between: $\mathbf H = 2\hat y$ A/m in **both** layers (free currents only; $H_y$ is tangential and continuous at $z = 2$ cm). Outside: zero.

        **(ii)** $B = \mu_0\mu_rH$: slab $\mu_0(50)(2) = 100\mu_0 = 1.26\times10^{-4}$ T; air $2\mu_0 = 2.51\times10^{-6}$ T. Tangential $\mathbf B$ jumps at the slab's face; tangential $\mathbf H$ does not.

        **(iii)** $\mathbf M = (\mu_r - 1)\mathbf H = 98\hat y$ A/m. At $z = 2$ cm, $M_y$ drops from 98 to 0, so $\nabla\times\mathbf M = -\hat x\,\partial M_y/\partial z = +98\,\delta(z - 0.02)\,\hat x$: a bound sheet of $98$ A/m along $+\hat x$ ($= \mathbf M\times\hat n$, $\hat n = +\hat z$). On the bottom face it is $-98\hat x$.

        **Check.** $\mathbf B = \mu_0(\mathbf H + \mathbf M) = \mu_0(2 + 98)\hat y = 100\mu_0\hat y$ ✓. The bound sheets, $-98\hat x$ below and $+98\hat x$ above, act like the free sheets, multiplying $B$ inside the slab by 50.
      ` }),
    R(md`**Part B.** The plane $x = 0$ separates region 1 ($x < 0$, $\mu_{r1} = 1$) from region 2 ($x > 0$, $\mu_{r2} = 3$). There is no surface current. In region 1, $\mathbf B_1 = 0.3\hat x + 0.4\hat y$ T.`),
    P({ src: 'Practice C · 4(b)', title: 'B at an interface',
      q: md`**(iv) (4 pts)** Find $\mathbf B_2$.

      **(v) (3 pts)** Find the angle between $\mathbf B_2$ and the normal $\hat x$.`,
      parts: [N('B_{2x}', 0.3, 'T'), N('B_{2y}', 1.2, 'T'), N('\\theta_2', Math.atan(4) * 180 / PI, '°')],
      hints: [md`Normal $B$ is continuous; tangential $H$ is continuous (no $\mathbf J_s$).`, md`$\tan\theta_2 = B_{2y}/B_{2x}$.`],
      sol: md`
        **(iv)** Normal ($x$): $B_{2x} = B_{1x} = 0.3$ T. Tangential ($y$): $H_{2y} = H_{1y}$, so $B_{2y} = \dfrac{\mu_2}{\mu_1}B_{1y} = 3(0.4) = 1.2$ T. $\mathbf B_2 = 0.3\hat x + 1.2\hat y$ T.

        **(v)** $\theta_2 = \arctan(1.2/0.3) = \arctan4 = 76.0°$ (versus $53.1°$ in region 1): field lines bend away from the normal in the more permeable material, $\tan\theta_2/\tan\theta_1 = \mu_2/\mu_1$.
      ` }),

    RF(md`
      ### Problem 5 (20 points): a pulse recorded at two points

      A uniform plane wave travels in a lossless, nonmagnetic medium. At $z = 0$ its field is $\mathbf E = E_x(0,t)\,\hat x$ with $E_x(0,t)$ below: a jump to 6 V/m at $t = 0$, then a linear fall to zero at $t = \tau = 2\ \mu$s. A probe at $z = -600$ m records the same waveform, delayed by $3\ \mu$s.

      [[fig:e0]]
    `, { e0: { svg: plotC5(), cap: 'E_x(0, t) = 6(1 − t/τ) V/m for 0 < t < τ, zero otherwise.' } }),
    P({ src: 'Practice C · 5(a)', title: 'The medium',
      q: md`**(a) (4 pts)** Find the wave speed, $\epsilon_r$, and $\eta$.`,
      parts: [N('v', 2e8, 'm/s'), N('\\epsilon_r', 2.25, ''), N('\\eta', 80 * PI, 'Ω')],
      hints: [md`The waveform moved 600 m in 3 µs. $v = c/\sqrt{\epsilon_r}$, $\eta = \eta_0/\sqrt{\epsilon_r}$.`],
      sol: md`$v = \dfrac{600\ \text{m}}{3\ \mu\text{s}} = 2\times10^8$ m/s; $\sqrt{\epsilon_r} = c/v = 1.5$, so $\epsilon_r = 2.25$ and $\eta = 120\pi/1.5 = 80\pi = 251\ \Omega$. The probe at negative $z$ saw it later: the wave travels along $-\hat z$.` }),
    P({ src: 'Practice C · 5(b–c)', title: 'The wave in space',
      q: md`**(b) (4 pts)** Find $E_x$ at $z = -300$ m, $t = 2\ \mu$s.

      **(c) (5 pts)** Sketch $E_x$ versus $z$ at $t = 1\ \mu$s. From your sketch: where is the jump (the front), what is $E_x$ at $z = 0$, and where does the pulse end on the other side?`,
      parts: [N('E_x(-300\\ \\text{m}, 2\\ \\mu\\text{s})', 4.5, 'V/m'), N('z_{\\text{front}}', -200, 'm'), N('E_x(0, 1\\ \\mu\\text{s})', 3, 'V/m'), N('z_{\\text{tail}}', 200, 'm')],
      hints: [md`Travel along $-\hat z$: $E_x(z,t) = E_x(0,\,t + z/v)$. With $v = 200$ m/µs, $t + z/v = t + z/200$ (µs, m).`, md`The front is the part that left $z = 0$ first ($t' = 0^+$, the jump). It has moved $vt = 200$ m toward $-z$.`],
      sol: md`
        **1. The wave.** $E_x(z,t) = f(t + z/v)$ with $f(t') = 6(1 - t'/\tau)$ on $0 < t' < \tau$.

        **(b)** $t + z/v = 2 - 300/200 = 0.5$ µs: $E_x = 6(1 - 0.25) = 4.5$ V/m.

        **(c)** At $t = 1$ µs, $t' = 1 + z/200$ runs over $(0, 2)$ µs for $-200 < z < 200$ m. The jump ($t' = 0^+$, value 6) is at $z = -200$ m: it left first and leads toward $-z$. At $z = 0$, $t' = 1$: $E_x = 3$ V/m. The tail ($t' = 2$, value 0) is at $z = +200$ m.

        [[fig:z]]

        **Check.** A snapshot in space is the time record reversed **along the direction of travel**: what came first sits farthest ahead, here at the most negative $z$ ✓.
      `,
      figs: { z: { svg: plotC5z(), cap: 'E_x(z) at t = 1 µs: the jump leads at z = −200 m, moving toward −z.' } } }),
    P({ src: 'Practice C · 5(d–e)', title: 'H and energy',
      q: md`**(d) (4 pts)** Find $H_y$ at $z = 0$, $t = 1\ \mu$s, and the direction of $\mathbf S$.

      **(e) (3 pts)** Find the energy per unit area that crosses the plane $z = 0$ during the pulse.`,
      parts: [N('H_y(0, 1\\ \\mu\\text{s})', -3 / (80 * PI), 'A/m'), mc('$\\mathbf S$ points along', [md`$-\hat z$`, md`$+\hat z$`], 0, [null, md`The wave travels toward $-z$; power flows with it.`], true), N('W/A', 12 * 2e-6 / (80 * PI), 'J/m²')],
      hints: [md`$\mathbf E\times\mathbf H$ must point along $-\hat z$: $\hat x\times(-\hat y) = -\hat z$, so $H_y = -E_x/\eta$.`, md`$W/A = \int S\,dt = \dfrac1\eta\int_0^\tau E_x^2\,dt$, and $\int_0^\tau(1 - t/\tau)^2dt = \tau/3$.`],
      sol: md`
        **(d)** Travel along $-\hat z$ with $\mathbf E\parallel\hat x$: $\hat x\times(-\hat y) = -\hat z$, so $\mathbf H = -\dfrac{E_x}{\eta}\hat y$. At $z = 0$, $t = 1$ µs: $H_y = -3/80\pi = -0.0119$ A/m. $\mathbf S$ points along $-\hat z$.

        **(e)** $\dfrac WA = \dfrac1\eta\displaystyle\int_0^\tau36\left(1 - \frac t\tau\right)^2dt = \frac{36}{\eta}\cdot\frac\tau3 = \frac{12\tau}{\eta} = \frac{12(2\times10^{-6})}{80\pi} = 9.55\times10^{-8}\ \text{J/m}^2$.
      ` }),
  ];
  EM.lesson('e2-prac', { id: 'prac-c', title: 'Practice exam C', kind: 'mock', steps: examC });

  // ======================================================================================== ENDLESS EXAM-STYLE PROBLEMS
  // Each generator also returns its inputs as _v (ignored by the engine) so a script can re-derive every answer.
  const DIRS = ['counterclockwise', 'clockwise'];
  const hat = (s, a) => `${s < 0 ? '-' : '+'}\\hat ${a}`;          // signed unit vector, TeX
  const AXES = ['x', 'y', 'z'];
  const unit = (s, a) => { const u = [0, 0, 0]; u[AXES.indexOf(a)] = s; return u; };
  const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const vecTeX = (u) => { const i = u.findIndex((x) => x !== 0); return hat(u[i], AXES[i]); };
  const shiftTeX = (w, a) => (a === 0 ? w : `${w} ${a < 0 ? '+' : '-'} ${Math.abs(a)}`);

  // ---------------------------------------------------------------- 1. resistive loop, ramping field, a voltmeter
  function figVM(route) {
    const g = PF.fig({ alt: `a square loop with resistors R1 on the left, R2 on the top and R3 on the right, an ideal bottom wire, B out of the page; a voltmeter from corner A (top right, + lead) to corner B (bottom left) with its leads ${route === 'diag' ? 'along the diagonal' : route === 'right' ? 'around the outside of the right side and the bottom' : 'around the outside of the top and the left side'}` });
    const x0 = 40, y0 = 160, s = 120, A = [x0 + s, y0 - s], B = [x0, y0], o = 44;
    g.line(x0, y0, x0 + s, y0, { cls: 'thick' });
    res(g, x0, y0, x0, y0 - s, 'R_1', 'l');
    res(g, x0, y0 - s, x0 + s, y0 - s, 'R_2', 't');
    res(g, x0 + s, y0 - s, x0 + s, y0, 'R_3', 'r');
    g.marks('dot', x0 + 24, y0 - s + 24, x0 + s - 24, y0 - 24, 3, 3, { r: 2 });
    if (route === 'diag') {
      const cx = x0 + s / 2, cy = y0 - s / 2, k = 10 / Math.SQRT2;
      g.line(A[0], A[1], cx + k, cy - k); g.line(cx - k, cy + k, B[0], B[1]);
      meter(g, cx, cy, '', 'r', -Math.SQRT1_2, Math.SQRT1_2);
    } else if (route === 'right') {
      const xr = x0 + s + o, yb = y0 + 30, ym = y0 - s / 2;
      g.pl([A, [xr, A[1]], [xr, ym - 10]]); g.pl([[xr, ym + 10], [xr, yb], [x0, yb], B]);
      meter(g, xr, ym, '', 'r');
    } else {
      const xl = x0 - o, yt = y0 - s - 34, ym = y0 - s / 2;
      g.pl([A, [A[0], yt], [xl, yt], [xl, ym - 10]]); g.pl([[xl, ym + 10], [xl, y0], B]);
      meter(g, xl, ym, '', 'r');
    }
    g.dot(A[0], A[1]); g.tag(A[0], A[1], 'A', route === 'left' ? 'r' : 'tr', 8);
    g.dot(B[0], B[1]); g.tag(B[0], B[1], 'B', 'bl', 8);
    return g.svg();
  }
  GENS.ex_vm_loop = () => {
    const s = pick([0.5, 1, 2]), rate = pick([-12, -8, -6, -4, 4, 6, 8, 12]);
    let R1, R2, R3, route, emf, I, Vr;
    do {
      R1 = pick([1, 2, 3, 4, 5]); R2 = pick([1, 2, 3, 4, 5]); R3 = pick([1, 2, 3, 4, 5]); route = pick(['diag', 'right', 'left']);
      emf = -s * s * rate; I = emf / (R1 + R2 + R3);
      Vr = route === 'diag' ? emf / 2 - I * R3 : route === 'right' ? -I * R3 : I * (R1 + R2);
    } while (Math.abs(Vr) < 1e-9);
    const how = { diag: 'run straight along the diagonal from A to B', right: 'run close along the outside of the right side and then the bottom', left: 'run close along the outside of the top and then the left side' }[route];
    const loop = {
      diag: md`Close a loop with the diagonal: A → leads → B → bottom wire → $(${s}, 0)$ → up through $R_3$ → A. It is the lower-right triangle, counterclockwise from $+z$, and holds **half** the flux: $\oint\mathbf E\cdot d\mathbf l = \emf/2$. Going up $R_3$ follows $C$: $+IR_3$. So $V + IR_3 = \emf/2$:
        $$V = \frac{\emf}{2} - IR_3 = ${f(emf / 2)} - (${f(I)})(${R3}) = ${f(Vr)}\ \text{V}$$`,
      right: md`Close a loop with the leads and the right side and bottom: A → leads → B → bottom wire → $(${s}, 0)$ → up through $R_3$ → A. The leads hug the loop, so this loop encloses (almost) **no** flux: $V + IR_3 = 0$ (going up $R_3$ follows $C$):
        $$V = -IR_3 = -(${f(I)})(${R3}) = ${f(Vr)}\ \text{V}$$`,
      left: md`Close a loop with the leads and the left side and top: A → leads → B → up through $R_1$ → $(0, ${s})$ → through $R_2$ → A. It encloses (almost) **no** flux. Both resistors are crossed **against** $C$ (which runs down the left side and leftward along the top): $V - IR_1 - IR_2 = 0$:
        $$V = I(R_1 + R_2) = (${f(I)})(${R1 + R2}) = ${f(Vr)}\ \text{V}$$`,
    }[route];
    return {
      title: 'Resistive loop, ramping field, a voltmeter',
      q: md`A square loop of side $${s}$ m lies in the $xy$-plane with corners B $= (0, 0)$ and A $= (${s}, ${s})$ m. Its left side holds $R_1 = ${R1}\ \Omega$, its top $R_2 = ${R2}\ \Omega$, its right side $R_3 = ${R3}\ \Omega$; the bottom is an ideal wire. A uniform field $\mathbf B = B_0(t)\,\hat z$ fills the square (zero outside it), with $dB_0/dt = ${rate}$ T/s. A voltmeter's + lead touches A and its − lead touches B; its leads ${how}. Take $C$ counterclockwise seen from $+z$. Find $\emf$ along $C$, the current along $C$, and the voltmeter reading.

      [[fig:loop]]`,
      figs: { loop: { svg: figVM(route), cap: 'Top view, z out of the page.' } },
      parts: [N('\\mathcal E\\ \\text{along}\\ C', emf, 'V'), N('I\\ \\text{along}\\ C', I, 'A'), N('V\\ \\text{(reading)}', Vr, 'V')],
      hints: [md`$d\mathbf S = +\hat z$: $\emf = -A\,dB_0/dt$ and $I = \emf/(R_1 + R_2 + R_3)$.`, md`The meter reads $\int_+^-\mathbf E\cdot d\mathbf l$ along its leads. Close a loop with the leads and part of the circuit; Faraday gives that loop's emf from the flux it encloses. Through a resistor, $\int\mathbf E\cdot d\mathbf l = \pm IR$ (+ along the current).`],
      sol: sol({
        eq: md`$\emf = -\dfrac{d\Psi}{dt}$ with $d\mathbf S = +\hat z$; for any closed path, $\oint\mathbf E\cdot d\mathbf l = -d\Psi_{\text{enclosed}}/dt$.`,
        sym: md`$\emf = -s^2\dfrac{dB_0}{dt}$, $\;I = \dfrac{\emf}{R_1 + R_2 + R_3}$. ${loop}`,
        sub: md`$$\emf = -(${s}\ \text{m})^2(${rate}\ \text{T/s}) = ${f(emf)}\ \text{V}, \qquad I = \frac{${f(emf)}\ \text{V}}{${R1 + R2 + R3}\ \Omega} = ${f(I)}\ \text{A}$$`,
        ans: md`$\emf = ${f(emf)}$ V, $I = ${f(I)}$ A (${I > 0 ? 'counterclockwise' : 'clockwise'} from $+z$), reading $V = ${f(Vr)}$ V.`,
        check: md`Lenz: the field ${rate > 0 ? 'grows along $+\\hat z$, so the current is clockwise' : 'along $+\\hat z$ shrinks (or grows along $-\\hat z$), so the current is counterclockwise'} ✓. The three possible lead routes read $-IR_3$, $\emf/2 - IR_3$ and $\emf - IR_3$: each extra half of the flux between the leads and $R_3$ adds $\emf/2$.`,
      }),
      _v: { s, rate, R1, R2, R3, route, emf, I, Vr },
    };
  };

  // ---------------------------------------------------------------- 2. two slabs and a sheet: H at points
  GENS.ex_slabs = () => {
    const ax = pick(['x', 'z']), sg = ax === 'x' ? 1 : -1, jd = ax === 'x' ? 'z' : 'x';
    const a1 = pick([-4, -3]), w1 = pick([1, 2]), a2 = pick([1, 2]), w2 = pick([1, 2]);
    const J1 = pick([-4, -3, -2, 2, 3, 4]), J2 = pick([-4, -2, -1, 1, 2, 4]), K = pick([0, 0, -4, -2, 2, 4]);
    const b1 = a1 + w1, b2 = a2 + w2, c1 = (a1 + b1) / 2, c2 = (a2 + b2) / 2;
    const H = (w) => sg * (J1 * (clip(w, a1, b1) - c1) + J2 * (clip(w, a2, b2) - c2) + (K / 2) * sgn(w));
    const cand = [a1 - 0.5, a1 + w1 / 4, a1 + 3 * w1 / 4, b1 / 2, a2 / 2, a2 + w2 / 4, a2 + 3 * w2 / 4, b2 + 0.5].filter((w) => Math.abs(H(w)) > 1e-9);
    const i1 = Math.floor(Math.random() * cand.length);
    let i2 = Math.floor(Math.random() * (cand.length - 1)); if (i2 >= i1) i2++;
    const [w1q, w2q] = [cand[i1], cand[i2]].sort((u, v) => u - v);
    const net = J1 * w1 + J2 * w2 + K, HL = H(-100), HR = H(100);
    const term = (J, a, b, first) => `${first ? (J < 0 ? '-' : '') : (J < 0 ? ' - ' : ' + ')}${Math.abs(J) === 1 ? '' : Math.abs(J)}\\hat ${jd}\\,[u(${shiftTeX(ax, a)}) - u(${shiftTeX(ax, b)})]`;
    const Jtex = term(J1, a1, b1, true) + term(J2, a2, b2, false) + (K ? `${K < 0 ? ' - ' : ' + '}${Math.abs(K) === 1 ? '' : Math.abs(K)}\\hat ${jd}\\,\\delta(${ax})` : '');
    const far = net === 0
      ? { right: 'zero on both sides', wrong: [[md`$${p(sg * J1 * w1 / 2)}$ A/m on one side, $${p(-sg * J1 * w1 / 2)}$ on the other`, 'That counts only the first slab; the net current per unit width is zero.'], ['the same nonzero value on both sides', 'Far fields of sheets and slabs reverse across them, and here the net current is zero.'], ['it grows with distance', 'The field of a planar current is uniform outside it.']] }
      : { right: md`$H_y = ${p(HL)}$ A/m far to the left, $${p(HR)}$ A/m far to the right`, wrong: [['zero on both sides', md`The net current per unit width is $${p(net)}$ A/m, not zero.`], [md`$H_y = ${p(HL)}$ A/m on both sides`, 'A planar current\'s field reverses from one side to the other.'], [md`$H_y = ${p(2 * HL)}$ A/m far to the left, $${p(2 * HR)}$ A/m far to the right`, md`The far field is **half** the net current per width: $|H| = ${p(Math.abs(net))}/2$.`]] };
    const opts = [far.right, ...far.wrong.map((x) => x[0])], why = [null, ...far.wrong.map((x) => x[1])];
    const brk = [a1, b1, a2, b2], lo = a1 - 1, hi = b2 + 1;
    const pts = [[lo, H(lo)]]; [a1, b1].forEach((w) => pts.push([w, H(w)])); pts.push([0, H(-1e-9)], [0, H(1e-9)]); [a2, b2].forEach((w) => pts.push([w, H(w)])); pts.push([hi, H(hi)]);
    const ymax = Math.max(...pts.map((q) => Math.abs(q[1]))) + 1;
    const fig = plot({ x: [lo, hi], y: [-ymax, ymax], xl: `${ax}\\ (\\text{m})`, yl: 'H_y\\ (\\text{A/m})', xt: brk, yt: [...new Set(pts.map((q) => Math.round(q[1] * 100) / 100).filter((y) => y !== 0))].slice(0, 5), zero: true, curves: [{ pts }], pts: [{ x: w1q, y: H(w1q) }, { x: w2q, y: H(w2q) }] });
    const rule = ax === 'x'
      ? md`Currents along $\hat z$, layered in $x$: a sheet $K\hat z$ at $x_0$ gives $\mathbf H = \tfrac12K\hat z\times(\pm\hat x) = \pm\tfrac K2\hat y$ for $x \gtrless x_0$. A slab $J\hat z$ on $a < x < b$ is a stack of such sheets: $H_y = J\,(x - c)$ inside ($c$ = its center) and $\pm J\frac{b - a}{2}$ beyond it.`
      : md`Currents along $\hat x$, layered in $z$ (the formula sheet's case): a sheet $K\hat x$ at $z_0$ gives $\mathbf H = \tfrac12K\hat x\times(\pm\hat z) = \mp\tfrac K2\hat y$ for $z \gtrless z_0$. A slab $J\hat x$ on $a < z < b$ gives $H_y = -J\,(z - c)$ inside ($c$ = its center) and $\mp J\frac{b - a}{2}$ beyond it.`;
    return {
      title: 'Slabs and a sheet: H at two points',
      q: md`In free space a static current density is ($${ax}$ in m, $u$ the unit step)
      $$\mathbf J = ${Jtex}\ \text{A/m}^2$$
      Nothing depends on the other two coordinates. Find $H_y$ at $${ax} = ${p(w1q)}$ m and at $${ax} = ${p(w2q)}$ m, and describe $\mathbf H$ far from all the currents.`,
      parts: [N(`H_y(${ax} = ${p(w1q)}\\ \\text{m})`, H(w1q), 'A/m'), N(`H_y(${ax} = ${p(w2q)}\\ \\text{m})`, H(w2q), 'A/m'), { lbl: 'Far from all the currents, $\\mathbf H$ is', mc: opts, a: 0, why }],
      hints: [md`Steps make slabs ($u(${ax} - a) - u(${ax} - b)$ is 1 for $a < ${ax} < b$); the delta makes a sheet. Superpose the fields of the pieces.`, md`Sheet: $\mathbf H = \tfrac12\mathbf J_s\times\hat n$, $\hat n$ from the sheet toward the point. A slab acts like a sheet of $JW$ outside it and grows linearly inside it.`],
      sol: sol({
        eq: md`Superposition. ${rule}`,
        sym: md`$$H_y(${ax}) = ${sg < 0 ? '-' : ''}\Big[J_1(\mathrm{clip}_1 - c_1) + J_2(\mathrm{clip}_2 - c_2)${K ? ` + \\tfrac K2\\,\\mathrm{sgn}(${ax})` : ''}\Big]$$
          where $\mathrm{clip}_i$ is $${ax}$ held inside slab $i$ (its nearer face if $${ax}$ is outside), $c_1 = ${p(c1)}$, $c_2 = ${p(c2)}$ m.`,
        sub: md`At $${ax} = ${p(w1q)}$: $H_y = ${f(H(w1q))}$ A/m. At $${ax} = ${p(w2q)}$: $H_y = ${f(H(w2q))}$ A/m.

          [[fig:h]]`,
        ans: md`$H_y(${p(w1q)}) = ${f(H(w1q))}$ A/m, $H_y(${p(w2q)}) = ${f(H(w2q))}$ A/m; far away, ${net === 0 ? 'zero on both sides' : `$H_y = ${p(HL)}$ (left) and $${p(HR)}$ A/m (right)`}.`,
        check: md`Net current per unit width: $${J1}(${w1}) + (${J2})(${w2})${K ? ` + (${K})` : ''} = ${p(net)}$ A/m; far away $|H_y| = |${p(net)}|/2$ ✓. Inside a slab the slope is $dH_y/d${ax} = ${sg > 0 ? '+J_z' : '-J_x'}$ (from $\nabla\times\mathbf H = \mathbf J$).`,
      }),
      figs: { h: { svg: fig, cap: `H_y(${ax}): ramps through the slabs, flat between them${K ? ', a jump at the sheet' : ''}. Dots: the two points asked.` } },
      _v: { ax, a1, w1, a2, w2, J1, J2, K, w1q, w2q, H1: H(w1q), H2: H(w2q), net, ans: opts[0] },
    };
  };

  // ---------------------------------------------------------------- 3. toroid: B, flux per turn, L, scaling
  GENS.ex_toroid = () => {
    const N0 = pick([100, 200, 250, 400, 500]), a = pick([1, 2, 3]), ratio = pick([2, 3, 4]), h = pick([1, 2, 3]), mur = pick([1, 50, 100, 200]), I = pick([0.2, 0.5, 1, 2]);
    const b = a * ratio, rm = (a + b) / 2, mu = mur * mu0, lnr = Math.log(ratio);
    const Bm = mu * N0 * I / (2 * PI * rm / 100), psi1 = mu * N0 * I * (h / 100) * lnr / (2 * PI), L = N0 * psi1 / I;
    const [chg, fx] = pick([['the number of turns is doubled', '4'], ['the height $h$ is doubled', '2'], ['$a$ and $b$ are both doubled ($h$ unchanged)', '1'], ['$a$, $b$ and $h$ are all doubled', '2'], ['$N$ is halved and $h$ is doubled', '0.5'], ['the current is doubled', '1'], ['$N$ is doubled and $h$ is halved', '2'], ['$N$ is halved', '0.25']]);
    const lnTeX = { 2: '0.693', 3: '1.099', 4: '1.386' }[ratio];
    return {
      title: 'Toroid: field, flux, inductance, scaling',
      q: md`A toroid of rectangular cross-section has inner radius $a = ${a}$ cm, outer radius $b = ${b}$ cm, height $h = ${h}$ cm and $N = ${N0}$ turns${mur > 1 ? ` on a linear core with $\\mu_r = ${mur}$` : ' (air core)'}. It carries $I = ${I}$ A. ($\ln${ratio} = ${lnTeX}$.) Find $|\mathbf B|$ at the mean radius $r = ${p(rm)}$ cm, the flux through one turn, and $L$. Then: if ${chg}, by what factor does $L$ change?`,
      parts: [N(`|\\mathbf B|\\ (r = ${p(rm)}\\ \\text{cm})`, Bm, 'T'), N('\\Psi_1', psi1, 'Wb'), N('L', L, 'H'),
        fac('Factor for $L$', fx, (o) => md`$L = \frac{\mu N^2h}{2\pi}\ln\frac ba$ and does not depend on $I$; here it changes by ${fx}, not ${o}.`)],
      hints: [md`Ampère inside the core: $H_\phi\,2\pi r = NI$, $B = \mu H$.`, md`$\Psi_1 = \int_a^b B_\phi h\,dr = \frac{\mu NIh}{2\pi}\ln\frac ba$, $L = N\Psi_1/I$. Convert cm to m.`],
      sol: sol({
        eq: md`$\oint\mathbf H\cdot d\mathbf l = NI$ on a circle inside the core; $\Psi_1 = \int_S\mathbf B\cdot d\mathbf S$ over one turn's cross-section; $L = N\Psi_1/I$.`,
        sym: md`$B_\phi = \dfrac{\mu NI}{2\pi r}$, $\;\Psi_1 = \dfrac{\mu NIh}{2\pi}\ln\dfrac ba$, $\;L = \dfrac{\mu N^2h}{2\pi}\ln\dfrac ba$.`,
        sub: md`$$B = \frac{(${mur})(4\pi\times10^{-7})(${N0})(${I})}{2\pi(${p(rm / 100)})} = ${f(Bm)}\ \text{T}, \qquad \Psi_1 = (${p(mur * 2)}\times10^{-7})(${N0})(${I})(${p(h / 100)})(${lnTeX}) = ${f(psi1)}\ \text{Wb}$$
          $$L = \frac{N\Psi_1}{I} = \frac{(${N0})(${f(psi1)})}{${I}} = ${f(L)}\ \text{H}$$`,
        ans: md`$B = ${f(Bm)}$ T, $\Psi_1 = ${f(psi1)}$ Wb, $L = ${f(L)}$ H; the change multiplies $L$ by ${fx}.`,
        check: md`$L \propto N^2h\ln(b/a)$: scaling every length by $k$ multiplies $L$ by $k$ (through $h$ only); $I$ never enters.`,
      }),
      _v: { N0, a, b, h, mur, I, rm, Bm, psi1, L, chg, fx, ans: fx },
    };
  };

  // ---------------------------------------------------------------- 4. parallel-plate line: Js, B, flux, L, scaling
  GENS.ex_ppline = () => {
    const w = pick([2, 4, 5, 10]), d = pick([1, 2, 5]), len = pick([0.5, 1, 2, 5]), I = pick([1, 2, 5, 10]);
    const kd = pick([0.5, 2]), kI = pick([0.5, 1, 2]);
    const Js = I / (w / 100), B = mu0 * Js, Psi = B * (d / 1000) * len, L = Psi / I;
    const fPsi = String(kd * kI), fL = String(kd);
    return {
      title: 'Parallel-plate line: inductance and scaling',
      q: md`Two thin plates of width $w = ${w}$ cm (along $y$) and length $\ell = ${len}$ m (along $x$) are separated by $d = ${d}$ mm (along $z$), $d \ll w, \ell$, in free space. The line is shorted at $x = \ell$. A current $I = ${I}$ A flows along $+x$ on the top plate ($z = d$) and back along $-x$ on the bottom plate ($z = 0$), spread uniformly across the width. Find $|\mathbf J_s|$, $\mathbf B$ between the plates, the flux linked by the current path, and $L$. Then the separation is multiplied by ${kd}${kI === 1 ? ' with the same current' : ` and the current by ${kI}`}: by what factors do $\Psi$ and $L$ change?`,
      parts: [N('|\\mathbf J_s|', Js, 'A/m'), N('|\\mathbf B|', B, 'T'),
        mc('Between the plates $\\mathbf B$ points along', [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat z$`], 0, [null, md`Top plate, below it: $\tfrac12J_s\hat x\times(-\hat z) = +\tfrac12J_s\hat y$; the bottom plate adds the same.`, md`$\mathbf B$ of a sheet is parallel to the sheet and perpendicular to its current.`]),
        N('\\Psi', Psi, 'Wb'), N('L', L, 'H'),
        fac('Factor for $\\Psi$', fPsi, (o) => md`$\Psi = \mu_0Id\ell/w$: it scales with $I$ and with $d$: ${kI}×${kd} = ${fPsi}, not ${o}.`),
        fac('Factor for $L$', fL, (o) => md`$L = \mu_0d\ell/w$: geometry only, so only $d$ counts: ${fL}, not ${o}.`)],
      hints: [md`$J_s = I/w$. Each plate gives $\tfrac12\mathbf J_s\times\hat n$; between them the two add, outside they cancel.`, md`The current path encloses the rectangle $d\times\ell$ in the $xz$-plane: $\Psi = Bd\ell$.`],
      sol: sol({
        eq: md`$\mathbf H = \tfrac12\mathbf J_s\times\hat n$ per plate; $\Psi = \int\mathbf B\cdot d\mathbf S$; $L = \Psi/I$.`,
        sym: md`$J_s = \dfrac Iw$, $\;B = \mu_0J_s = \dfrac{\mu_0I}{w}$ along $+\hat y$, $\;\Psi = \dfrac{\mu_0Id\ell}{w}$, $\;L = \dfrac{\mu_0d\ell}{w}$.`,
        sub: md`$$J_s = \frac{${I}}{${p(w / 100)}} = ${f(Js)}\ \text{A/m}, \quad B = (4\pi\times10^{-7})(${f(Js)}) = ${f(B)}\ \text{T}, \quad \Psi = B(${p(d / 1000)})(${len}) = ${f(Psi)}\ \text{Wb}, \quad L = ${f(L)}\ \text{H}$$`,
        ans: md`$J_s = ${f(Js)}$ A/m, $B = ${f(B)}$ T along $+\hat y$, $\Psi = ${f(Psi)}$ Wb, $L = ${f(L)}$ H. Scaling: $\Psi$ ×${fPsi}, $L$ ×${fL} ($B$ ×${kI}: it does not depend on $d$).`,
        check: md`$L' = \mu_0d/w$ per meter (not on the official sheet: know it); with $C' = \epsilon_0w/d$, $L'C' = \mu_0\epsilon_0$ ✓.`,
      }),
      _v: { w, d, len, I, kd, kI, Js, B, Psi, L, fPsi, fL },
    };
  };

  // ---------------------------------------------------------------- 5. square loop moving in a graded field
  GENS.ex_grad_loop = () => {
    let s, B0, Lg, kap, v, x0, t0, Rl, dir, xc, Psi;
    do {
      s = pick([0.5, 1, 2]); B0 = pick([0.1, 0.2, 0.5]); Lg = pick([2, 5, 10]); kap = pick([1, -1]); v = pick([2, 4, 5]); x0 = pick([0, 1, 2]); t0 = pick([1, 2]); Rl = pick([0.5, 1, 2, 5]); dir = pick(['x', 'x', 'x', 'y']);
      xc = x0 + (dir === 'x' ? v * t0 : 0); Psi = s * s * B0 * (1 + kap * xc / Lg);
    } while (Math.abs(Psi) < 1e-9);
    const emf = dir === 'x' ? -s * s * B0 * kap * v / Lg : 0, I = emf / Rl;
    const parts = dir === 'x'
      ? [N(`\\Psi(t = ${t0}\\ \\text{s})`, Psi, 'Wb'), N('\\mathcal E\\ \\text{along}\\ C', emf, 'V'), N('|I|', Math.abs(I), 'A'),
        { lbl: 'Seen from $+z$, the current flows', mc: DIRS, a: emf > 0 ? 0 : 1, fixed: true, why: emf > 0 ? [null, md`The emf along $C$ (counterclockwise) is positive.`] : [md`The emf along $C$ (counterclockwise) is negative.`, null] }]
      : [N(`\\Psi(t = ${t0}\\ \\text{s})`, Psi, 'Wb'), mc('The emf is', ['zero', md`$s^2B_0v/L$`, md`$s^2B_0(1 + x_0/L)$ per second`], 0, [null, md`$\mathbf B$ does not change along $y$, so moving along $y$ leaves the flux constant.`, 'That is a flux, not a rate of change; the flux is constant.'])];
    return {
      title: 'A loop moving through a graded field',
      q: md`A square loop of side $s = ${s}$ m lies in the $xy$-plane, centered at $(${x0}, 0)$ m at $t = 0$, and moves with constant velocity $\mathbf v = ${v}\hat ${dir}$ m/s. The static field is $\mathbf B = B_0\left(1 ${kap > 0 ? '+' : '-'} x/L\right)\hat z$ with $B_0 = ${B0}$ T and $L = ${Lg}$ m ($x$ in m), and the loop's resistance is $${Rl}\ \Omega$. With $d\mathbf S = +\hat z\,dS$ and $C$ counterclockwise from $+z$, find the flux at $t = ${t0}$ s${dir === 'x' ? ', the emf along $C$, and the current' : ', and the emf'}.`,
      parts,
      hints: [md`For a field linear in $x$, the flux through the square is exact with the field at its center: $\Psi = s^2B(x_c)$.`, md`$\emf = -\dfrac{d\Psi}{dt} = -s^2\dfrac{dB}{dx}\dfrac{dx_c}{dt}$.`],
      sol: sol({
        eq: md`$\Psi(t) = \int_S\mathbf B\cdot d\mathbf S$, $\;\emf = -d\Psi/dt$.`,
        sym: md`The field is linear in $x$, so $\Psi = s^2B_0\left(1 ${kap > 0 ? '+' : '-'} \dfrac{x_c(t)}{L}\right)$ with $x_c = ${x0}${dir === 'x' ? ` + ${v}t` : ''}$ m. ${dir === 'x' ? md`$\emf = ${kap > 0 ? '-' : '+'}\dfrac{s^2B_0v}{L}$, constant in time.` : md`$x_c$ does not change: $\Psi$ is constant and $\emf = 0$.`}`,
        sub: md`$$\Psi(${t0}\ \text{s}) = (${s})^2(${B0})\left(1 ${kap > 0 ? '+' : '-'} \frac{${p(xc)}}{${Lg}}\right) = ${f(Psi)}\ \text{Wb}${dir === 'x' ? `, \\qquad \\emf = ${kap > 0 ? '-' : ''}\\frac{(${s})^2(${B0})(${v})}{${Lg}} = ${f(emf)}\\ \\text{V}` : ''}$$`,
        ans: dir === 'x' ? md`$\Psi = ${f(Psi)}$ Wb, $\emf = ${f(emf)}$ V along $C$, $|I| = ${f(Math.abs(I))}$ A, ${emf > 0 ? 'counterclockwise' : 'clockwise'} from $+z$.` : md`$\Psi = ${f(Psi)}$ Wb at all times; $\emf = 0$.`,
        check: dir === 'x' ? md`Lenz: $B_z$ ${kap > 0 ? 'grows' : 'falls'} along $+x$, so $\Psi$ ${kap > 0 ? 'grows and the current makes $-\\hat z$ field inside: clockwise' : 'falls and the current makes $+\\hat z$ field inside: counterclockwise'} ✓. Same as the motional emf $vs\,[B(\text{front}) - B(\text{back})]$.` : 'A uniform translation along a direction in which B does not vary changes nothing.',
      }),
      _v: { s, B0, Lg, kap, v, x0, t0, Rl, dir, Psi, emf, I },
    };
  };

  // ---------------------------------------------------------------- 6. bar on rails
  GENS.ex_rails = () => {
    const B0 = pick([0.2, 0.5, 1, 1.5]), w = pick([0.2, 0.5, 1]), v0 = pick([2, 4, 5, 10]), Rr = pick([0.5, 1, 2, 5]), sB = pick([1, -1]), sv = pick([1, -1]);
    const emf = B0 * w * v0, I = emf / Rr, F = I * w * B0, Pw = F * v0;
    const upR = sB * sv > 0;                       // current through R along +y?
    return {
      title: 'A bar on rails',
      q: md`Two rails lie along $y = 0$ and $y = ${w}$ m in the $xy$-plane, joined at $x = 0$ by $R = ${Rr}\ \Omega$. A bar across them (at some $x > 0$) moves with $\mathbf v = ${sv > 0 ? '' : '-'}${v0}\hat x$ m/s, ${sv > 0 ? 'away from' : 'toward'} the resistor, in a uniform $\mathbf B = ${sB > 0 ? '' : '-'}${B0}\hat z$ T. Rails and bar have no resistance. Find the emf, the current, its direction through $R$, the external force needed to keep $\mathbf v$ constant, and the power delivered.`,
      parts: [N('|\\mathcal E|', emf, 'V'), N('|I|', I, 'A'),
        mc('Through $R$ the current flows along', [md`$+\hat y$`, md`$-\hat y$`], upR ? 0 : 1, upR ? [null, 'In the bar, $\\mathbf v\\times\\mathbf B$ points along $-\\hat y$, so the current returns through $R$ along $+\\hat y$.'] : ['In the bar, $\\mathbf v\\times\\mathbf B$ points along $+\\hat y$, so the current returns through $R$ along $-\\hat y$.', null], true),
        N('|F_{\\text{ext}}|', F, 'N'), N('P', Pw, 'W')],
      hints: [md`$|\emf| = vBw$ (motional emf of the bar), $I = \emf/R$.`, md`Direction: $\mathbf v\times\mathbf B$ in the bar pushes positive charge; the current closes through $R$ the other way. Force on the bar: $I\boldsymbol\ell\times\mathbf B$, against $\mathbf v$.`],
      sol: sol({
        eq: md`$\emf = \oint(\mathbf v\times\mathbf B)\cdot d\mathbf l$ (only the bar moves), $\;I = \emf/R$, $\;\mathbf F = I\boldsymbol\ell\times\mathbf B$, $\;P = Fv$.`,
        sym: md`$|\emf| = vBw$, $\;I = \dfrac{vBw}{R}$, $\;F = IwB = \dfrac{vB^2w^2}{R}$, $\;P = \dfrac{(vBw)^2}{R}$. In the bar $\mathbf v\times\mathbf B = (${sv > 0 ? '' : '-'}\hat x)\times(${sB > 0 ? '' : '-'}\hat z)\,vB = ${upR ? '-' : '+'}vB\,\hat y$.`,
        sub: md`$$|\emf| = (${v0})(${B0})(${w}) = ${f(emf)}\ \text{V}, \quad I = ${f(I)}\ \text{A}, \quad F = (${f(I)})(${w})(${B0}) = ${f(F)}\ \text{N}, \quad P = ${f(Pw)}\ \text{W}$$`,
        ans: md`$|\emf| = ${f(emf)}$ V, $I = ${f(I)}$ A, along $${upR ? '+' : '-'}\hat y$ through $R$; $F_{\text{ext}} = ${f(F)}$ N along $\mathbf v$; $P = ${f(Pw)}$ W.`,
        check: md`$I^2R = (${f(I)})^2(${Rr}) = ${f(I * I * Rr)}$ W $= P$ ✓. Lenz: the ${sv > 0 ? 'growing' : 'shrinking'} area changes the flux, and the force on the bar resists the motion either way.`,
      }),
      _v: { B0, w, v0, Rr, sB, sv, emf, I, F, Pw, ans: upR ? '+y' : '-y' },
    };
  };

  // ---------------------------------------------------------------- 7. two-dielectric capacitor
  GENS.ex_layer_cap = () => {
    const V0 = pick([5, 10, 12, 20, 50, 100]), Acm = pick([10, 20, 50, 100]), A = Acm * 1e-4;
    if (pick(['series', 'series', 'side']) === 'series') {
      const e1 = pick([1, 2, 3, 4, 5, 6, 8]), e2 = pick([2, 3, 4, 5, 6, 8, 10]), d1 = pick([0.5, 1, 2, 3]), d2 = pick([0.5, 1, 2, 3]);
      const Rs = (d1 / 1000) / (e1 * eps0) + (d2 / 1000) / (e2 * eps0), D = V0 / Rs, E1 = D / (e1 * eps0), E2 = D / (e2 * eps0), P2 = D * (1 - 1 / e2), Cc = A / Rs;
      return {
        title: 'Two dielectric layers in series',
        q: md`A parallel-plate capacitor of area $${Acm}\ \text{cm}^2$ holds two layers stacked between its plates: $\epsilon_{r1} = ${e1}$, thickness $${d1}$ mm, and $\epsilon_{r2} = ${e2}$, thickness $${d2}$ mm. The plates are held $V_0 = ${V0}$ V apart. Ignore fringing. Find $|\mathbf E|$ in each layer, $|\mathbf P|$ in layer 2, and the capacitance.`,
        parts: [N('|\\mathbf E_1|', E1, 'V/m'), N('|\\mathbf E_2|', E2, 'V/m'), N('|\\mathbf P_2|', P2, 'C/m²'), N('C', Cc, 'F')],
        hints: [md`No free charge at the interface: the same $D$ in both layers.`, md`$V_0 = D\left(\frac{d_1}{\epsilon_1} + \frac{d_2}{\epsilon_2}\right)$; $\mathbf P = \mathbf D - \epsilon_0\mathbf E$; $C = DA/V_0$.`],
        sol: sol({
          eq: md`$\hat n\cdot(\mathbf D_2 - \mathbf D_1) = 0$ at the interface, $V_0 = \int\mathbf E\cdot d\mathbf l$ across the gap, $\mathbf D = \epsilon\mathbf E = \epsilon_0\mathbf E + \mathbf P$.`,
          sym: md`$D = \dfrac{V_0}{d_1/\epsilon_1 + d_2/\epsilon_2}$, $\;E_i = D/\epsilon_i$, $\;P_2 = D\left(1 - \dfrac1{\epsilon_{r2}}\right)$, $\;C = \dfrac{A}{d_1/\epsilon_1 + d_2/\epsilon_2}$.`,
          sub: md`$$D = \frac{${V0}}{\frac{${p(d1 / 1000)}}{${e1}\epsilon_0} + \frac{${p(d2 / 1000)}}{${e2}\epsilon_0}} = ${f(D)}\ \text{C/m}^2, \quad E_1 = ${f(E1)}\ \text{V/m}, \quad E_2 = ${f(E2)}\ \text{V/m}$$
            $$P_2 = ${f(P2)}\ \text{C/m}^2, \qquad C = D\,A/V_0 = ${f(Cc)}\ \text{F}$$`,
          ans: md`$E_1 = ${f(E1)}$ V/m, $E_2 = ${f(E2)}$ V/m, $P_2 = ${f(P2)}$ C/m², $C = ${f(Cc)}$ F.`,
          check: md`$E_1d_1 + E_2d_2 = ${f(E1 * d1 / 1000 + E2 * d2 / 1000)}$ V $= V_0$ ✓. The layer with the smaller $\epsilon_r$ carries the larger field.`,
        }),
        _v: { kind: 'series', V0, A, e1, e2, d1, d2, E1, E2, P2, Cc },
      };
    }
    const e1 = pick([1, 2, 3]), e2 = pick([4, 5, 6, 8, 10]), d = pick([0.5, 1, 2, 5]), frac = pick([0.25, 0.5, 0.75]);
    const E = V0 / (d / 1000), rho1 = e1 * eps0 * E, P2 = (e2 - 1) * eps0 * E, Cc = eps0 * (e1 * frac + e2 * (1 - frac)) * A / (d / 1000);
    return {
      title: 'Two dielectrics side by side',
      q: md`A parallel-plate capacitor of area $${Acm}\ \text{cm}^2$ and gap $${d}$ mm is filled side by side: a fraction ${frac} of its area with $\epsilon_{r1} = ${e1}$, the rest with $\epsilon_{r2} = ${e2}$, each filling the full gap. The plates are held $V_0 = ${V0}$ V apart. Ignore fringing. Find $|\mathbf E|$ in the gap, the surface charge density on the positive plate over region 1, $|\mathbf P|$ in region 2, and the capacitance.`,
      parts: [N('|\\mathbf E|', E, 'V/m'), N('\\rho_{s1}', rho1, 'C/m²'), N('|\\mathbf P_2|', P2, 'C/m²'), N('C', Cc, 'F')],
      hints: [md`Both regions span the same plates: the same $V_0$ over the same $d$, so the same $E$ (and tangential $\mathbf E$ is continuous across their side boundary).`, md`$\rho_s = D = \epsilon E$ on each part of the plate; the regions are capacitors in parallel.`],
      sol: sol({
        eq: md`$E = V_0/d$ in both regions; $\rho_s = \hat n\cdot\mathbf D$ at the plate; $\mathbf P = (\epsilon - \epsilon_0)\mathbf E$; parallel capacitors add.`,
        sym: md`$\rho_{s1} = \epsilon_1E$, $\;P_2 = \epsilon_0(\epsilon_{r2} - 1)E$, $\;C = \dfrac{\epsilon_1A_1 + \epsilon_2A_2}{d}$.`,
        sub: md`$$E = \frac{${V0}}{${p(d / 1000)}} = ${f(E)}\ \text{V/m}, \quad \rho_{s1} = ${e1}\epsilon_0E = ${f(rho1)}\ \text{C/m}^2, \quad P_2 = ${e2 - 1}\epsilon_0E = ${f(P2)}\ \text{C/m}^2$$
          $$C = \frac{\epsilon_0\,[${e1}(${frac}) + ${e2}(${1 - frac})](${p(A)})}{${p(d / 1000)}} = ${f(Cc)}\ \text{F}$$`,
        ans: md`$E = ${f(E)}$ V/m, $\rho_{s1} = ${f(rho1)}$ C/m², $P_2 = ${f(P2)}$ C/m², $C = ${f(Cc)}$ F.`,
        check: md`Same $E$, different $D$: the plate holds ${e2 / e1 === Math.round(e2 / e1) ? `${e2 / e1}` : p(e2 / e1)} times more charge per area over region 2.`,
      }),
      _v: { kind: 'side', V0, A, e1, e2, d, frac, E, rho1, P2, Cc },
    };
  };

  // ---------------------------------------------------------------- 8. lossy capacitor: G, C, tau, steady state
  GENS.ex_lossy = () => {
    const sig = pick([1e-6, 2e-6, 5e-6, 1e-5]), er = pick([2, 4, 5, 10]), eps = er * eps0, geo = pick(['plate', 'coax', 'sphere']);
    let G, desc, gsym;
    if (geo === 'plate') { const A = pick([0.01, 0.1, 0.5]), d = pick([1, 2, 5]); G = sig * A / (d / 1000); desc = md`a parallel-plate capacitor (plate area $${A}\ \text{m}^2$, gap $${d}$ mm)`; gsym = md`G = \dfrac{\sigma A}{d}`; }
    else if (geo === 'coax') { const a = pick([1, 2]), r = pick([2, 4]), len = pick([1, 2, 10]); G = 2 * PI * sig * len / Math.log(r); desc = md`a coax of length $${len}$ m, radii $a = ${a}$ mm and $b = ${a * r}$ mm ($\ln${r} = ${r === 2 ? '0.693' : '1.386'}$)`; gsym = md`G = \dfrac{2\pi\sigma\ell}{\ln(b/a)}`; }
    else { const a = pick([0.1, 0.5, 1]); G = 4 * PI * sig * a; desc = md`an isolated metal sphere of radius $${a}$ m (return at infinity)`; gsym = md`G = 4\pi\sigma a`; }
    const Cc = eps * G / sig, tau = eps / sig, t10 = tau * Math.log(10);
    const k = pick([0.5, 1, 2, 3]), Vs = pick([10, 12, 20]), Rs = k / G, Vss = Vs / (1 + k);
    const parts = [N('G', G, 'S'), N('C', Cc, 'F'), N('\\tau', tau, 's'), N('t_{10\\%}', t10, 's')];
    if (geo !== 'sphere') parts.push(N('V_{\\text{ss}}', Vss, 'V'));
    return {
      title: 'A lossy capacitor',
      q: md`The space ${geo === 'sphere' ? 'around' : 'between the conductors of'} ${desc} is filled with a material of $\epsilon_r = ${er}$ and $\sigma = ${p(sig)}$ S/m. Find its conductance $G$, its capacitance $C$, the time constant with which it discharges itself, and the time for its charge to fall to 10% once isolated.${geo !== 'sphere' ? ` It is then driven in steady state by a ${Vs} V DC source through $R_s = ${p(Rs)}\\ \\Omega$: find the steady-state voltage across it.` : ''}`,
      parts,
      hints: [md`Same geometry, same formula with $\sigma \leftrightarrow \epsilon$: $C = G\epsilon/\sigma$. The self-discharge time is $RC = C/G = \epsilon/\sigma$.`, md`In DC steady state the capacitor is just the resistor $1/G$: a divider with $R_s$.`],
      sol: sol({
        eq: md`$${gsym}$, $\;\dfrac GC = \dfrac\sigma\epsilon$, $\;Q(t) = Q_0e^{-t/\tau}$ with $\tau = \dfrac\epsilon\sigma$.`,
        sym: md`$C = \dfrac{\epsilon}{\sigma}G$, $\;t_{10\%} = \tau\ln10$${geo !== 'sphere' ? md`, $\;V_{\text{ss}} = V_s\dfrac{1/G}{R_s + 1/G}$` : ''}.`,
        sub: md`$$G = ${f(G)}\ \text{S}, \quad C = \frac{(${er})(8.854\times10^{-12})}{${p(sig)}}(${f(G)}) = ${f(Cc)}\ \text{F}, \quad \tau = ${f(tau)}\ \text{s}, \quad t_{10\%} = ${f(t10)}\ \text{s}$$${geo !== 'sphere' ? `
          $$V_{\\text{ss}} = \\frac{${Vs}}{1 + R_sG} = \\frac{${Vs}}{1 + ${k}} = ${f(Vss)}\\ \\text{V}$$` : ''}`,
        ans: md`$G = ${f(G)}$ S, $C = ${f(Cc)}$ F, $\tau = ${f(tau)}$ s, $t_{10\%} = ${f(t10)}$ s${geo !== 'sphere' ? `, $V_{\\text{ss}} = ${f(Vss)}$ V` : ''}.`,
        check: md`$\tau = \epsilon/\sigma$ is the same for every shape: it is the material's relaxation time.${geo !== 'sphere' ? ' Steady state means no current into the capacitance, so only the conductance matters.' : ''}`,
      }),
      _v: { sig, er, geo, G, Cc, tau, t10, k, Vs, Vss, desc },
    };
  };

  // ---------------------------------------------------------------- 9. a current sheet launches a pulse
  const WAVES = {
    triangle: [[0, 0], [1, 1], [2, 0]], rectangle: [[0, 0], [0, 1], [2, 1], [2, 0]], sawtooth: [[0, 0], [0, 1], [2, 0]],
    ramp: [[0, 0], [2, 1], [2, 0]], bipolar: [[0, 0], [1, 1], [1, -1], [2, -1], [2, 0]], trapezoid: [[0, 0], [1, 1], [2, 1], [3, 0]],
  };
  const wave = (pts, t) => { for (let i = 0; i + 1 < pts.length; i++) { const [ta, fa] = pts[i], [tb, fb] = pts[i + 1]; if (tb > ta && t > ta && t < tb) return fa + (fb - fa) * (t - ta) / (tb - ta); } return 0; };
  GENS.ex_sheet_wave = () => {
    const name = pick(Object.keys(WAVES)), W = WAVES[name], T = pick([1, 2, 5]), A0 = pick([1, 2, 4]), er = pick([1, 4, 9]), ee = pick(['x', 'y']), sc = pick([1, -1]);
    const tauq = pick([0.5, 1.5, 2.5].filter((t) => t < W[W.length - 1][0] && Math.abs(wave(W, t)) > 1e-9)), k = pick([1, 2, 3]), sz = pick([1, -1]);
    const v = 0.3 / Math.sqrt(er), eta = eta0 / Math.sqrt(er), z0 = sz * v * k * T, t0 = (tauq + k) * T;
    const fv = A0 * wave(W, tauq), Ee = -sc * (eta / 2) * fv, oh = ee === 'x' ? 'y' : 'x', Ho = ee === 'x' ? sz * Ee / eta : -sz * Ee / eta;
    const fig = plot({ x: [-0.4 * T, (W[W.length - 1][0] + 0.6) * T], y: [Math.min(0, ...W.map((q) => q[1])) * A0 - 0.6 * A0, 1.5 * A0], xl: 't\\ (\\text{ns})', yl: 'J_s\\ (\\text{A/m})',
      xt: [...new Set(W.map((q) => q[0]).filter((t) => t > 0))].map((t) => [t * T, p(t * T)]), yt: [...new Set(W.map((q) => q[1]).filter((y) => y !== 0))].map((y) => [y * A0, p(y * A0)]), zero: true,
      curves: [{ pts: [[-0.4 * T, 0], ...W.map(([t, y]) => [t * T, y * A0]), [(W[W.length - 1][0] + 0.6) * T, 0]] }] });
    return {
      title: 'A current sheet launches a pulse',
      q: md`A current sheet on $z = 0$ carries $\mathbf J_s = ${sc < 0 ? '-' : ''}J_s(t)\,\hat ${ee}$ A/m, with $J_s(t)$ below, in a nonmagnetic medium with $\epsilon_r = ${er}$${er === 1 ? ' (free space)' : ''}. At the point $z = ${p(z0)}$ m and time $t = ${p(t0)}$ ns, find $E_${ee}$, $H_${oh}$, and the direction of $\mathbf S$. When does the front of the pulse reach that point?

      [[fig:js]]`,
      figs: { js: { svg: fig, cap: `J_s(t), ${name}: amplitude ${A0} A/m, time scale ${T} ns.` } },
      parts: [N(`E_${ee}`, Ee, 'V/m'), N(`H_${oh}`, Ho, 'A/m'),
        mc('$\\mathbf S$ points along', [md`$+\hat z$`, md`$-\hat z$`], sz > 0 ? 0 : 1, sz > 0 ? [null, 'The point is on the $+z$ side: power flows away from the sheet, along $+\\hat z$.'] : ['The point is on the $-z$ side: power flows away from the sheet, along $-\\hat z$.', null], true),
        N('t_{\\text{front}}', k * T, 'ns')],
      hints: [md`$v = 0.3/\sqrt{\epsilon_r}$ m/ns, $\eta = 120\pi/\sqrt{\epsilon_r}$. The field at $(z, t)$ is set by the sheet at the retarded time $t - |z|/v$.`, md`$\mathbf E = -\tfrac\eta2\mathbf J_s(t - |z|/v)$ on both sides; $\mathbf H$ follows from $\mathbf E\times\mathbf H$ pointing away from the sheet, $|H| = |E|/\eta$.`],
      sol: sol({
        eq: md`$\mathbf E(z,t) = -\dfrac\eta2\mathbf J_s\!\left(t - \dfrac{|z|}{v}\right)$ (formula sheet: $\mathbf J_s = -J_s\hat x$ gives $E_x = +\tfrac\eta2J_s$); $\mathbf E\times\mathbf H$ along $\pm\hat z$ for $z \gtrless 0$; $|\mathbf H| = |\mathbf E|/\eta$.`,
        sym: md`$v = ${p(v)}$ m/ns, $\eta = ${p(eta / PI)}\pi\ \Omega$. Retarded time $\tau = t - |z|/v = ${p(t0)} - ${p(k * T)} = ${p(tauq * T)}$ ns, where $J_s = ${p(fv)}$ A/m. ${ee === 'x' ? md`With $\mathbf E = E_x\hat x$: $\hat x\times\hat y = \hat z$, so $H_y = ${sz > 0 ? '+' : '-'}E_x/\eta$.` : md`With $\mathbf E = E_y\hat y$: $\hat y\times\hat x = -\hat z$, so $H_x = ${sz > 0 ? '-' : '+'}E_y/\eta$.`}`,
        sub: md`$$E_${ee} = ${sc > 0 ? '-' : '+'}\frac{${p(eta / PI)}\pi}{2}(${p(fv)}) = ${f(Ee)}\ \text{V/m}, \qquad H_${oh} = ${f(Ho)}\ \text{A/m}, \qquad t_{\text{front}} = \frac{|z|}{v} = ${p(k * T)}\ \text{ns}$$`,
        ans: md`$E_${ee} = ${f(Ee)}$ V/m, $H_${oh} = ${f(Ho)}$ A/m, $\mathbf S$ along $${sz > 0 ? '+' : '-'}\hat z$, front arrives at $t = ${p(k * T)}$ ns.`,
        check: md`$|E/H| = ${f(Math.abs(Ee / Ho))}\ \Omega = \eta$ ✓; $\mathbf E\times\mathbf H$ points away from the sheet ✓; $\mathbf E$ opposes $\mathbf J_s$ at the sheet, so $\mathbf E\cdot\mathbf J_s < 0$: the sheet supplies the power ✓.`,
      }),
      _v: { name, T, A0, er, ee, sc, tauq, k, sz, z0, t0, Ee, Ho, oh },
    };
  };

  // ---------------------------------------------------------------- 10. & 11. sinusoids: parameters, and one field from the other
  const BTEX = { 0.5: '4\\pi', 1: '2\\pi', 2: '\\pi', 3: '\\tfrac{2\\pi}{3}', 5: '0.4\\pi', 10: '0.2\\pi' };
  function sinusoid() {
    let er, lam, f0, e, m;
    do { er = pick([1, 2.25, 4, 9]); lam = pick([0.5, 1, 2, 3, 5, 10]); f0 = c0 / (Math.sqrt(er) * lam); e = Math.floor(Math.log10(2 * f0)); m = 2 * f0 / 10 ** e; }
    while (Math.abs(m * 100 - Math.round(m * 100)) > 1e-6);
    const w = pick(AXES), others = AXES.filter((a) => a !== w), ee = pick(others), sd = pick([1, -1]);
    return { er, lam, f0, w, ee, sd, beta: 2 * PI / lam, omega: 2 * PI * f0, eta: eta0 / Math.sqrt(er), v: c0 / Math.sqrt(er),
      wTeX: `${m === 1 ? '' : p(m)}\\pi\\times10^{${e}}`, phase: `${m === 1 ? '' : p(m)}\\pi\\times10^{${e}}t ${sd > 0 ? '-' : '+'} ${BTEX[lam]}\\,${w}` };
  }
  GENS.ex_sinusoid = () => {
    const S = sinusoid(), E0 = pick([2, 5, 10, 12, 30]), H0 = E0 / S.eta;
    const kh = unit(S.sd, S.w), eh = unit(1, S.ee), hh = cross3(kh, eh), Hs = vecTeX(hh);
    const opts = [Hs, vecTeX(hh.map((x) => -x)), vecTeX(eh), vecTeX(kh)];
    return {
      title: 'Reading a sinusoidal wave',
      q: md`In a lossless, nonmagnetic medium, $\mathbf E = ${E0}\cos(${S.phase})\,\hat ${S.ee}$ V/m ($${S.w}$ in m, $t$ in s). Find the frequency, the phase velocity, $\epsilon_r$, the amplitude of $\mathbf H$, and the direction of $\mathbf H$ when $E_${S.ee} > 0$.`,
      parts: [N('f', S.f0, 'Hz'), N('v_p', S.v, 'm/s'), N('\\epsilon_r', S.er, ''), N('H_0', H0, 'A/m'),
        { lbl: `When $E_${S.ee} > 0$, $\\mathbf H$ points along`, mc: opts.map((o) => `$${o}$`), a: 0, why: [null, md`Then $\mathbf E\times\mathbf H$ points along $${vecTeX(kh.map((x) => -x))}$: against the travel.`, md`$\mathbf H$ is perpendicular to $\mathbf E$.`, md`$${opts[3]}$ is the direction of travel; $\mathbf H$ is transverse.`] }],
      hints: [md`$f = \omega/2\pi$, $v_p = \omega/\beta$, $\epsilon_r = (c/v_p)^2$, $\eta = \eta_0/\sqrt{\epsilon_r}$, $H_0 = E_0/\eta$.`, md`The phase $\omega t ${S.sd > 0 ? '-' : '+'} \beta ${S.w}$ moves toward $${S.sd > 0 ? '+' : '-'}${S.w}$. Then $\hat{\mathbf H} = \hat{\mathbf k}\times\hat{\mathbf E}$.`],
      sol: sol({
        eq: md`$v_p = \omega/\beta = \lambda f = c/\sqrt{\epsilon_r}$, $\;\eta = \eta_0/\sqrt{\epsilon_r}$, $\;|\mathbf E| = \eta|\mathbf H|$, $\;\mathbf E\times\mathbf H$ along the travel.`,
        sym: md`$\omega = ${S.wTeX}$ rad/s, $\beta = ${BTEX[S.lam]}$ rad/m ($\lambda = ${S.lam}$ m). Travel along $${vecTeX(kh)}$, so $\hat{\mathbf H} = ${vecTeX(kh)}\times\hat ${S.ee} = ${Hs}$.`,
        sub: md`$$f = ${f(S.f0)}\ \text{Hz}, \quad v_p = f\lambda = ${f(S.v)}\ \text{m/s}, \quad \epsilon_r = \left(\frac{3\times10^8}{${f(S.v)}}\right)^2 = ${p(S.er)}, \quad \eta = ${f(S.eta)}\ \Omega, \quad H_0 = \frac{${E0}}{${f(S.eta)}} = ${f(H0)}\ \text{A/m}$$`,
        ans: md`$f = ${f(S.f0)}$ Hz, $v_p = ${f(S.v)}$ m/s, $\epsilon_r = ${p(S.er)}$, $H_0 = ${f(H0)}$ A/m along $${Hs}$ when $E_${S.ee} > 0$.`,
        check: md`$\hat ${S.ee}\times(${Hs}) = ${vecTeX(kh)}$: along the travel ✓.`,
      }),
      _v: { er: S.er, lam: S.lam, w: S.w, ee: S.ee, sd: S.sd, E0, f0: S.f0, v: S.v, H0, ans: Hs },
    };
  };
  GENS.ex_curl = () => {
    const S = sinusoid(), A0 = pick([0.1, 0.2, 0.5, 1, 2, 10]), fromE = pick([true, false]);
    const kh = unit(S.sd, S.w), gh = unit(1, S.ee);
    // given field along gh; the other field's direction (for a positive given component)
    const oh = fromE ? cross3(kh, gh) : cross3(gh, kh), Os = vecTeX(oh);
    const amp = fromE ? A0 / S.eta : A0 * S.eta, rate = S.beta * A0;   // |curl| = beta * amplitude
    const opts = [Os, vecTeX(oh.map((x) => -x)), vecTeX(kh)];
    const G0 = fromE ? 'E' : 'H', O0 = fromE ? 'H' : 'E';
    return {
      title: fromE ? 'H from E with Faraday\'s law' : 'E from H with Ampère–Maxwell',
      q: md`In a lossless, nonmagnetic medium with $\epsilon_r = ${p(S.er)}$, $\mathbf ${G0} = ${A0}\cos(${S.phase})\,\hat ${S.ee}$ ${fromE ? 'V/m' : 'A/m'}. Use ${fromE ? md`$\nabla\times\mathbf E = -\mu_0\,\partial\mathbf H/\partial t$` : md`$\nabla\times\mathbf H = \epsilon\,\partial\mathbf E/\partial t$ (no conduction current)`} to find the amplitude of $\mathbf ${O0}$ and its direction when the cosine is positive. Also find the amplitude of ${fromE ? md`$\partial\mathbf B/\partial t$` : md`the displacement current density $\partial\mathbf D/\partial t$`}.`,
      parts: [N(`${O0}_0`, amp, fromE ? 'A/m' : 'V/m'),
        { lbl: `When the cosine is positive, $\\mathbf ${O0}$ points along`, mc: opts.map((o) => `$${o}$`), a: 0, why: [null, md`That makes $\mathbf E\times\mathbf H$ point against the travel, $${vecTeX(kh.map((x) => -x))}$.`, md`$${opts[2]}$ is the direction of travel; both fields are transverse.`] },
        N(fromE ? '|\\partial\\mathbf B/\\partial t|_{\\max}' : '|\\partial\\mathbf D/\\partial t|_{\\max}', rate, fromE ? 'T/s' : 'A/m²')],
      hints: [md`For a field along $\hat ${S.ee}$ that varies only with $${S.w}$: only one term of the curl survives; it is $\pm\partial(\cdot)/\partial ${S.w}$ along the third axis.`, md`The amplitude of the curl is $\beta\times$ the given amplitude; it equals ${fromE ? md`$|\partial\mathbf B/\partial t|$` : md`$|\partial\mathbf D/\partial t|$`}. Integrate in time to get the other field: amplitude ${fromE ? md`$E_0\beta/\mu_0\omega = E_0/\eta$` : md`$H_0\beta/\epsilon\omega = \eta H_0$`}.`],
      sol: sol({
        eq: fromE ? md`$\nabla\times\mathbf E = -\partial\mathbf B/\partial t$, $\mathbf B = \mu_0\mathbf H$.` : md`$\nabla\times\mathbf H = \partial\mathbf D/\partial t$, $\mathbf D = \epsilon\mathbf E$.`,
        sym: md`$\beta = ${BTEX[S.lam]}$ rad/m, $\omega = ${S.wTeX}$ rad/s, travel along $${vecTeX(kh)}$. The curl of $${A0}\cos(\cdot)\hat ${S.ee}$ has amplitude $\beta(${A0})$; integrating in time divides by $${fromE ? '\\mu_0' : '\\epsilon'}\omega$, so $${O0}_0 = ${fromE ? `\\dfrac{\\beta}{\\mu_0\\omega}E_0 = \\dfrac{E_0}{\\eta}` : `\\dfrac{\\beta}{\\epsilon\\omega}H_0 = \\eta H_0`}$ with $\eta = ${f(S.eta)}\ \Omega$. Its direction makes $\mathbf E\times\mathbf H$ point along the travel: $${Os}$.`,
        sub: md`$$|\partial\mathbf ${fromE ? 'B' : 'D'}/\partial t|_{\max} = \beta(${A0}) = ${f(rate)}\ ${fromE ? '\\text{T/s}' : '\\text{A/m}^2'}, \qquad ${O0}_0 = ${fromE ? `\\frac{${A0}}{${f(S.eta)}}` : `(${A0})(${f(S.eta)})`} = ${f(amp)}\ \text{${fromE ? 'A/m' : 'V/m'}}$$`,
        ans: md`$${O0}_0 = ${f(amp)}$ ${fromE ? 'A/m' : 'V/m'} along $${Os}$ when the cosine is positive; $|\partial\mathbf ${fromE ? 'B' : 'D'}/\partial t|_{\max} = ${f(rate)}$ ${fromE ? 'T/s' : 'A/m²'}.`,
        check: md`${fromE ? `$\\hat ${S.ee}\\times(${Os})$` : `$(${Os})\\times\\hat ${S.ee}$`} $= ${vecTeX(kh)}$: $\mathbf E\times\mathbf H$ along the travel ✓. $E_0/H_0 = \eta$ ✓.`,
      }),
      _v: { er: S.er, lam: S.lam, w: S.w, ee: S.ee, sd: S.sd, A0, fromE, amp, rate, ans: Os },
    };
  };

  // ---------------------------------------------------------------- 12. Poynting: power through a window
  GENS.ex_poynting = () => {
    const er = pick([1, 4, 9]), E0 = pick([10, 20, 30, 60, 100]), Aw = pick([0.5, 1, 2, 4]), th = pick([0, 30, 60]), [phi, phiTeX, c2] = pick([[0, '0', 1], [PI / 6, '\\pi/6', 0.75], [PI / 4, '\\pi/4', 0.5], [PI / 3, '\\pi/3', 0.25]]);
    const eta = eta0 / Math.sqrt(er), Sav = E0 * E0 / (2 * eta), Pav = Sav * Aw * Math.cos(th * PI / 180), Sin = E0 * E0 / eta * c2, wav = 0.5 * er * eps0 * E0 * E0;
    return {
      title: 'Poynting vector and power',
      q: md`A uniform plane wave with $|\mathbf E|$ amplitude $${E0}$ V/m travels in a lossless, nonmagnetic medium with $\epsilon_r = ${er}$. Find the time-averaged power density, the average power through a flat window of area $${Aw}\ \text{m}^2$ whose normal makes $${th}°$ with the direction of travel, the instantaneous power density where the phase $\omega t - \beta z$ equals $${phiTeX}$, and the time-averaged total energy density.`,
      parts: [N('\\langle S\\rangle', Sav, 'W/m²'), N('\\langle P\\rangle', Pav, 'W'), N('S\\ (\\text{phase}\\ ' + phiTeX + ')', Sin, 'W/m²'), N('\\langle w\\rangle', wav, 'J/m³')],
      hints: [md`$\eta = \eta_0/\sqrt{\epsilon_r}$. $S(t) = \dfrac{E_0^2}{\eta}\cos^2(\omega t - \beta z)$; its average is half the peak.`, md`Only the component of $\mathbf S$ along the window's normal crosses it: $\cos\theta$. Energy density: $\langle w\rangle = \langle S\rangle/v_p = \tfrac12\epsilon E_0^2$.`],
      sol: sol({
        eq: md`$\mathbf S = \mathbf E\times\mathbf H$, $|H| = |E|/\eta$; $\;\langle S\rangle = \dfrac{E_0^2}{2\eta}$; $\;P = \int\mathbf S\cdot d\mathbf A$; $\;\langle w\rangle = \langle w_e\rangle + \langle w_m\rangle = \tfrac14\epsilon E_0^2 + \tfrac14\mu H_0^2$.`,
        sym: md`$\langle P\rangle = \langle S\rangle A\cos\theta$, $\;S = \dfrac{E_0^2}{\eta}\cos^2\varphi$, $\;\langle w\rangle = \tfrac12\epsilon E_0^2$ (the two halves are equal in a plane wave).`,
        sub: md`$$\eta = ${f(eta)}\ \Omega, \quad \langle S\rangle = \frac{${E0}^2}{2(${f(eta)})} = ${f(Sav)}\ \text{W/m}^2, \quad \langle P\rangle = (${f(Sav)})(${Aw})\cos${th}° = ${f(Pav)}\ \text{W}$$
          $$S = \frac{${E0}^2}{${f(eta)}}\cos^2(${phiTeX}) = ${f(Sin)}\ \text{W/m}^2, \qquad \langle w\rangle = \tfrac12(${er})(8.854\times10^{-12})(${E0})^2 = ${f(wav)}\ \text{J/m}^3$$`,
        ans: md`$\langle S\rangle = ${f(Sav)}$ W/m², $\langle P\rangle = ${f(Pav)}$ W, $S = ${f(Sin)}$ W/m², $\langle w\rangle = ${f(wav)}$ J/m³.`,
        check: md`$\langle S\rangle = \langle w\rangle v_p$: $(${f(wav)})(${f(c0 / Math.sqrt(er))}) = ${f(wav * c0 / Math.sqrt(er))}$ W/m² ✓ (energy moves at $v_p$).`,
      }),
      _v: { er, E0, Aw, th, phi, c2, Sav, Pav, Sin, wav },
    };
  };

  EM.lesson('e2-prac', {
    id: 'prac-gen', title: 'Exam-style problems, endless', kind: 'review',
    steps: [
      R(md`
        The long problems of the past exams, with new numbers and new orientations every time. Work each on paper the way you would in the exam: equation, symbols, numbers with units, a check. Two correct answers without opening the solution complete each one; **New problem** gives a fresh one.

        ### Induction: Faraday, voltmeters, motion
      `),
      G('ex_vm_loop', { need: 2 }),
      G('ex_grad_loop', { need: 2 }),
      G('ex_rails', { need: 2 }),
      R(md`### Magnetostatics and inductance`),
      G('ex_slabs', { need: 2 }),
      G('ex_toroid', { need: 2 }),
      G('ex_ppline', { need: 2 }),
      R(md`### Fields in matter: dielectrics and lossy capacitors`),
      G('ex_layer_cap', { need: 2 }),
      G('ex_lossy', { need: 2 }),
      R(md`### Waves and power`),
      G('ex_sheet_wave', { need: 2 }),
      G('ex_sinusoid', { need: 2 }),
      G('ex_curl', { need: 2 }),
      G('ex_poynting', { need: 2 }),
    ],
  });
})();

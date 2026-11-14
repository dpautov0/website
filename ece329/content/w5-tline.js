/* Topics 13 and 14: a transmission line from the fields (Lecture 27), then launching and reflecting (Lecture 28).
   w5-telegraph  T13  a TEM wave between two conductors -> V and I -> Faraday and charge conservation -> the telegrapher's
                      equations -> L, C, G and the geometrical factor (plates, coax from Gauss and from the flux) -> the wave
                      equation, v, d'Alembert, Z0.
   w5-launch     T14  tau_g from the divider, Gamma_L and Gamma_g from KVL and Ohm's law, current reflection -Gamma, open,
                      short and matched loads, tau_g versus 1 + Gamma_g, the steady state equals the DC divider (proved).
   Same pace as w2-gamma.js. Every number was recomputed in Python (work-w5t/); every bounce value comes from TL.solve. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;
  const PI = Math.PI;
  const EPS0 = 1e-9 / (36 * PI), MU0 = 4e-7 * PI, CC = 3e8;          // the course's values
  const NT = (lbl, ans, unit, traps) => Object.assign(N(lbl, ans, unit), { traps: traps.map(([v, msg]) => ({ v, msg })) });
  // a plan-first step (the engine's p.plan): the right move first, then [wrong, why] pairs; the site shuffles them
  const plan = (q, right, wrongs, move) => ({ q, opts: [right, ...wrongs.map((w) => w[0])], a: 0, why: [null, ...wrongs.map((w) => w[1])], move });
  // option text: a number with a TeX unit
  const o = (x, u) => `$${p(+x.toPrecision(3))}${u ? `\\ ${u}` : ''}$`;
  // k times pi, as TeX
  const piT = (k) => (Math.abs(k - 1) < 1e-9 ? '\\pi' : `${TL.frac(k)}\\pi`);
  const OHM = '\\Omega', MS = '\\text{m/s}';

  // ================================================================ figures, lesson 1
  // side view of a parallel-plate line: x down, z right, y into the page. A step has been switched on at the left;
  // the charged region ends at a front that moves right.
  function plateFig() {
    const g = PF.fig({ alt: 'Side view of a parallel-plate line. E points down from the top plate to the bottom plate, H points into the page, the top plate carries current I to the right and the bottom plate carries it back to the left. The fields end at a front that moves right at speed v.' });
    const x0 = 70, x1 = 450, yT = 60, yB = 140, xf = 300, ym = (yT + yB) / 2;
    g.rect(x0, yT - 9, x1 - x0, 9, { cls: 'shade' });
    g.rect(x0, yB, x1 - x0, 9, { cls: 'shade' });
    for (let x = x0 + 22; x < xf - 5; x += 46) g.arrow(x, yT + 5, x, yB - 5, { hs: 7 });
    for (let x = x0 + 45; x < xf - 20; x += 46) g.otimes(x, ym, 5);
    g.label(x0 + 28, ym - 18, '\\mathbf E', 'l', 'small');
    g.label(x0 + 51, ym + 12, '\\mathbf H', 'tl', 'small');
    g.line(xf, yT - 4, xf, yB + 4, { cls: 'dash dim' });
    g.arrow(xf + 6, ym, xf + 50, ym, { hs: 7 }); g.label(xf + 54, ym, 'v', 'l', 'small');
    g.arrow(x0 + 80, yT - 22, x0 + 160, yT - 22, { hs: 7 }); g.label(x0 + 120, yT - 27, 'I', 'b', 'small');
    g.arrow(x0 + 160, yB + 31, x0 + 80, yB + 31, { hs: 7 }); g.label(x0 + 120, yB + 36, 'I', 't', 'small');
    g.label(x0 - 12, yT + 4, '+', 'c', 'small'); g.label(x0 - 14, ym, 'V', 'c', 'small'); g.label(x0 - 12, yB - 4, '-', 'c', 'small');
    g.label(x1 - 6, yT - 14, '\\text{top plate}', 'br', 'small');
    g.label(x1 - 6, yB + 14, '\\text{bottom plate}', 'tr', 'small');
    // axes: x down, z right, y into the page
    const ax = 22, ay = 196;
    g.otimes(ax, ay, 5); g.label(ax - 8, ay, 'y', 'r', 'small accent');
    g.arrow(ax + 6, ay, ax + 46, ay, { cls: 'dim', hs: 6 }); g.label(ax + 50, ay, 'z', 'l', 'small accent');
    g.arrow(ax, ay + 6, ax, ay + 40, { cls: 'dim', hs: 6 }); g.label(ax + 6, ay + 40, 'x', 'l', 'small accent');
    return g.svg();
  }
  // the thin rectangle for Faraday's law, in the gap between z and z + dz
  function faradayFig() {
    const g = PF.fig({ alt: 'A thin rectangle in the gap, between z and z plus delta z, traversed clockwise. The magnetic flux through it points into the page. The voltage across the gap is V(z) on its left side and V(z + delta z) on its right side.' });
    const yT = 40, yB = 140, xa = 170, xb = 280;
    g.rect(60, yT - 9, 330, 9, { cls: 'shade' });
    g.rect(60, yB, 330, 9, { cls: 'shade' });
    for (const x of [90, 130, 320, 360]) g.arrow(x, yT + 6, x, yB - 6, { cls: 'dim', hs: 6 });
    g.loopRect(xa, yT, xb - xa, yB - yT, { dir: 'cw' });
    for (const [x, y] of [[200, 72], [250, 72], [200, 110], [250, 110]]) g.otimes(x, y, 5);
    g.label(225, 91, '\\mathbf B', 'c', 'small');
    g.label(xa - 8, 90, 'V(z)', 'r', 'small');
    g.label(xb + 8, 90, 'V(z + \\Delta z)', 'l', 'small');
    const ya = yB + 34;
    g.arrow(70, ya, 390, ya, { cls: 'dim', hs: 6 }); g.label(394, ya, 'z', 'l', 'small accent');
    g.line(xa, ya - 4, xa, ya + 4, { cls: 'dim' }); g.label(xa, ya + 7, 'z', 't', 'small');
    g.line(xb, ya - 4, xb, ya + 4, { cls: 'dim' }); g.label(xb, ya + 7, 'z + \\Delta z', 't', 'small');
    g.dim(410, yT, 410, yB, 'd', { at: 'r' });
    return g.svg();
  }
  // a piece of the top plate between z and z + dz: current in, current out, charge on the inner face, current across
  function chargeFig() {
    const g = PF.fig({ alt: 'The piece of the top plate between z and z plus delta z. Current I(z) enters from the left and I(z + delta z) leaves on the right. Positive charge sits on the plate\'s lower face, and current crosses the gap downward: displacement current plus leakage.' });
    const yT = 50, yB = 150, xa = 150, xb = 310;
    g.rect(60, yT - 9, 330, 9, { cls: 'dim' });
    g.rect(xa, yT - 9, xb - xa, 9, { cls: 'shade' });
    g.rect(60, yB, 330, 9, { cls: 'dim' });
    g.arrow(70, yT - 22, 140, yT - 22, { hs: 7 }); g.label(105, yT - 27, 'I(z)', 'b', 'small');
    g.arrow(320, yT - 22, 390, yT - 22, { hs: 7 }); g.label(355, yT - 27, 'I(z + \\Delta z)', 'b', 'small');
    for (let x = xa + 14; x < xb; x += 33) g.label(x, yT + 9, '+', 'c', 'small');
    for (const x of [185, 275]) g.arrow(x, yT + 20, x, yB - 6, { cls: 'dim', hs: 6 });
    g.label(230, (yT + yB) / 2 + 8, '\\text{across the gap}', 'c', 'small');
    g.line(xa, yT + 2, xa, yB + 24, { cls: 'dim dash' }); g.line(xb, yT + 2, xb, yB + 24, { cls: 'dim dash' });
    g.label(xa, yB + 28, 'z', 't', 'small'); g.label(xb, yB + 28, 'z + \\Delta z', 't', 'small');
    return g.svg();
  }
  // the ladder: series L dz, shunt C dz, three cells
  function ladderFig() {
    const g = PF.fig({ alt: 'A line drawn as a ladder of small circuits: in each piece of length delta z, a series inductor L delta z in the top wire and a shunt capacitor C delta z across the two wires.' });
    const yT = 40, yB = 128, x0 = 40, cw = 120;
    g.line(x0, yB, x0 + 3 * cw + 20, yB);
    for (let k = 0; k < 3; k++) {
      const x = x0 + k * cw, a = x + 14, b = x + 66, r = (b - a) / 8;
      g.line(x, yT, a, yT);
      for (let i = 0; i < 4; i++) g.arc(a + r * (2 * i + 1), yT, r, 0, 180);
      g.line(b, yT, x + cw, yT);
      const xc = x + 92;
      g.dot(xc, yT, 2.4); g.dot(xc, yB, 2.4);
      g.line(xc, yT, xc, 79); g.line(xc - 12, 79, xc + 12, 79, { cls: 'thick' });
      g.line(xc - 12, 88, xc + 12, 88, { cls: 'thick' }); g.line(xc, 88, xc, yB);
      if (k === 1) { g.label((a + b) / 2, yT - 12, 'L\\Delta z', 'b', 'small'); g.label(xc + 16, 84, 'C\\Delta z', 'l', 'small'); }
    }
    g.line(x0 + 3 * cw, yT, x0 + 3 * cw + 20, yT);
    g.label(x0 + 3 * cw + 26, (yT + yB) / 2, '\\cdots', 'l', 'small');
    g.label(x0 - 10, yT + 6, '+', 'c', 'small'); g.label(x0 - 12, (yT + yB) / 2, 'V', 'c', 'small'); g.label(x0 - 10, yB - 6, '-', 'c', 'small');
    g.arrow(x0 + 2, yT - 14, x0 + 34, yT - 14, { hs: 6 }); g.label(x0 + 18, yT - 18, 'I', 'b', 'small');
    g.dim(x0 + cw, yB + 18, x0 + 2 * cw, yB + 18, '\\Delta z', { at: 'b' });
    return g.svg();
  }
  // cross-sections: plates end-on, coax end-on (the wave comes toward you)
  function ppEnd() {
    const g = PF.fig({ alt: 'Parallel plates seen end-on: plate width W, gap d, E straight down between the plates, H straight across.' });
    const x0 = 30, x1 = 230, yT = 40, yB = 110;
    g.rect(x0, yT - 8, x1 - x0, 8, { cls: 'shade' }); g.rect(x0, yB, x1 - x0, 8, { cls: 'shade' });
    for (let x = x0 + 20; x < x1 - 10; x += 32) g.arrow(x, yT + 4, x, yB - 4, { hs: 6 });
    g.arrow(x0 + 40, (yT + yB) / 2 + 14, x0 + 120, (yT + yB) / 2 + 14, { cls: 'dash', hs: 6 });
    g.label(x0 + 124, (yT + yB) / 2 + 14, '\\mathbf H', 'l', 'small');
    g.label(x0 + 26, (yT + yB) / 2 - 12, '\\mathbf E', 'l', 'small');
    g.dim(x0, yT - 22, x1, yT - 22, 'W', { at: 't' });
    g.dim(x1 + 18, yT, x1 + 18, yB, 'd', { at: 'r' });
    return g.svg();
  }
  function coaxEnd() {
    const g = PF.fig({ alt: 'Coax seen end-on: inner conductor of radius a, outer conductor of radius b, E pointing radially outward between them, H circling the inner conductor.' });
    const cx = 110, cy = 90, a = 18, b = 66, D = PI / 180;
    g.circle(cx, cy, b + 6, { cls: 'shade' }); g.circle(cx, cy, b, { cls: 'bgfill' }); g.circle(cx, cy, a, { cls: 'shade' });
    for (let k = 0; k < 8; k++) { const t = (22.5 + 45 * k) * D; g.arrow(cx + (a + 5) * Math.cos(t), cy - (a + 5) * Math.sin(t), cx + (b - 6) * Math.cos(t), cy - (b - 6) * Math.sin(t), { hs: 6 }); }
    g.circle(cx, cy, 42, { cls: 'dash dim' });
    for (const t of [90, 270]) { const th = t * D; g.head(cx + 42 * Math.cos(th), cy - 42 * Math.sin(th), -Math.sin(th), -Math.cos(th), { hs: 7 }); }
    g.line(cx, cy, cx - a, cy, { cls: 'thick' }); g.label(cx - a - 4, cy - 8, 'a', 'br', 'small');
    const k = Math.SQRT1_2;
    g.line(cx, cy, cx + b * k, cy + b * k); g.label(cx + 0.62 * b * k + 6, cy + 0.62 * b * k - 4, 'b', 'bl', 'small');
    g.label(cx + b + 12, cy - 30, '\\mathbf H', 'l', 'small');
    g.label(cx + b + 12, cy + 2, '\\mathbf E', 'l', 'small');
    return g.svg();
  }
  // a shape moving toward +z: the same bump at two instants
  const moveFig = () => PF.plot({
    w: 380, h: 170, x: [0, 6], y: [-0.15, 1.35], xl: 'z', yl: 'V',
    xt: [[1.5, 'vt_1'], [4, 'vt_2']],
    curves: [
      { f: (z) => Math.exp(-Math.pow((z - 1.5) / 0.5, 2)), n: 300, lab: 't = t_1', labAt: 1.5, dx: 10, dy: -14 },
      { f: (z) => Math.exp(-Math.pow((z - 4) / 0.5, 2)), n: 300, cls: 'dash', lab: 't = t_2', labAt: 4, dx: 10, dy: -14 },
    ],
  });

  // ================================================================ lesson 1
  EM.lesson('w5', {
    id: 'w5-telegraph', topic: 13, ref: 'Lecture 27', title: 'From fields to a transmission line',
    steps: [
      RF(md`
        !!key Why you care
          Prof. Chen's Spring 2024 Exam 3 gave 18 of its 100 points to one coax question: given $C$, find $L$, $Z_0$ and $v$. Every bounce diagram after that uses $Z_0$ and $v$ too. The formula sheet lists the telegrapher's equations, $Z_0 = \sqrt{L/C}$ and $v = 1/\sqrt{LC}$, but not where they come from or what $Z_0$ means. In this lesson you build all of it from Faraday's law and charge conservation, the same way [Topic 5](#/l/w2-gamma) built $\gamma$ and $\eta$. By the end, a transmission line is just a plane wave squeezed between two conductors.

        ### Notation

        - $V(z,t)$: the **voltage** between the two conductors at position $z$ and time $t$: the top (or inner) conductor minus the bottom (or outer) one. In volts.
        - $I(z,t)$: the **current** on the top (or inner) conductor, positive when it flows toward $+z$. The other conductor carries the same current back. In amperes.
        - $L$, $C$, $G$: the line's **inductance, capacitance and conductance per meter of length**, in H/m, F/m and S/m. A 2 m piece has $2L$ of inductance. (SP24 writes them $\mathcal L$, $\mathcal C$.)
        - $\mu$, $\epsilon$, $\sigma$: the permeability, permittivity and conductivity of the material **between** the conductors, the filling.
        - $W$, $d$: the width and the gap of a parallel-plate line. $a$, $b$: the inner and outer radii of a coax.
        - $\text{GF}$: the **geometrical factor**, a pure number set by the shape of the cross-section.
        - $v$: the speed of waves on the line. $Z_0$: the **characteristic impedance**, in $\Omega$.
        - $f(t - z/v)$, $g(t + z/v)$: the shapes of the wave going toward $+z$ and of the wave going toward $-z$.

        ### 1. A plane wave between two plates

        Start from the plane wave of Exam 2: $\mathbf E = \hat x\,E_x(z,t)$ and $\mathbf H = \hat y\,H_y(z,t)$, traveling along $z$ in a uniform material. Now slide two flat perfect conductors into it, one in the plane $x = 0$ and one in the plane $x = d$. Point $\hat x$ **down** the page, so the plate at $x = 0$ is on top.

        Does the wave notice? Check the two boundary conditions at the surface of a perfect conductor (they are on your sheet):

        - Tangential $\mathbf E$ must be zero. The plates are perpendicular to $\hat x$ and $\mathbf E$ is along $\hat x$, so $\mathbf E$ meets them head-on. It has no tangential part. ✓
        - Normal $\mathbf B$ must be zero. $\mathbf H$ is along $\hat y$, which lies in the plates. It has no normal part. ✓

        So the fields between the plates can stay exactly as they were. The plates only collect surface charge and surface current on their inner faces, as the other two boundary conditions demand:
        $$\rho_s = \hat n\cdot\mathbf D, \qquad \mathbf J_s = \hat n\times\mathbf H$$
        Here $\hat n$ is the normal pointing out of the metal, into the gap. Now delete the fields outside the plates. What is left is a wave **guided** by the plates. We ignore the small fringing fields at the edges, which is fine when the width $W$ is much larger than the gap $d$.

        [[fig:plates]]

        Neither field has a component along $z$, the direction of travel. Both are transverse, so this is a **TEM** wave (transverse electric and magnetic). Every line in this course carries a TEM wave.

        !!intuition Does this make sense?
          The conductors do not make the wave. The fields between them carry the energy; the plates hold the charges and currents where the field lines end. Keep that picture: it is why the speed on a line will turn out to be the speed of light in the filling, whatever the shape.
      `, { plates: { svg: plateFig(), cap: 'Side view, with x pointing down and y into the page. A step has been switched on at the left end: behind the front, E points down, H points into the page, and current flows right on the top plate and back on the bottom one. Ahead of the front there is nothing yet.' } }),
      Q(md`**Predict.** Put the same two plates into the same wave, but in the planes $y = 0$ and $y = d$ instead, parallel to $\mathbf E$. What goes wrong?`,
        [md`Both conditions fail: $\mathbf E$ would lie along the plates and $\mathbf H$ would point into them`, md`Only $\mathbf E$ fails; $\mathbf H$ is fine`, md`Only $\mathbf H$ fails; $\mathbf E$ is fine`, md`Nothing: plates can be put in at any angle`], 0,
        [null, md`Check $\mathbf H$ too: it is along $\hat y$, which is now the plates' normal. A normal $\mathbf B$ is not allowed at a perfect conductor.`, md`Check $\mathbf E$ too: it is along $\hat x$, which now lies in the plates. Tangential $\mathbf E$ must be zero at a perfect conductor.`, md`The boundary conditions decide. Only plates perpendicular to $\mathbf E$ (and containing $\mathbf H$) leave the wave undisturbed.`],
        md`With plates in the planes $y = $ const, the normal is $\hat y$. Then $\mathbf E = \hat xE_x$ is tangential (must be zero) and $\mathbf B = \mu\hat yH_y$ is normal (must be zero). Both fail. The plates must be perpendicular to $\mathbf E$.`),
      R(md`
        ### 2. Voltage and current from the fields

        A circuit needs a voltage and a current. Get both from the fields.

        **Voltage.** Integrate $\mathbf E$ straight across the gap, from the top plate to the bottom plate, at one $z$:
        $$V(z,t) = \int_{\text{top}}^{\text{bottom}}\mathbf E\cdot d\mathbf l$$
        $\mathbf E$ points from top to bottom and is the same everywhere across the gap, so the integral is the field times the gap:
        $$\boxed{V = E_x\,d}$$
        A positive $V$ means the top plate is at the higher potential, since $\mathbf E$ points from high potential to low.

        But wait. The fields change in time. Is a voltage even defined? A voltage needs $\oint\mathbf E\cdot d\mathbf l = 0$, so that every path from top to bottom gives the same answer. Faraday's law says
        $$\oint\mathbf E\cdot d\mathbf l = -\frac{d}{dt}\int\mathbf B\cdot d\mathbf S$$
        Take the loop in a plane of constant $z$. Its normal is $\hat z$, and a TEM wave has no $B_z$. So the flux is zero and so is the circulation. **In each cross-section the voltage is well defined.** That is what TEM buys you.

        **Current.** Use Ampère's law on a loop around the top plate, again in a plane of constant $z$:
        $$\oint\mathbf H\cdot d\mathbf l = I_{\text{enc}} + \frac{d}{dt}\int\mathbf D\cdot d\mathbf S$$
        The displacement term needs $D_z$, and a TEM wave has none. So the loop measures exactly the current on the plate. Above the plate the field is zero. Just below it, $\mathbf H = \hat yH_y$ runs along the plate for its whole width $W$:
        $$\oint\mathbf H\cdot d\mathbf l = H_y\,W$$
        So the current on the top plate is
        $$\boxed{I = H_y\,W}$$
        The boundary condition says the same. On the top plate $\hat n = \hat x$ (into the gap), so
        $$\mathbf J_s = \hat x\times\hat y\,H_y = \hat z\,H_y$$
        That is $H_y$ amperes per meter of width, flowing toward $+z$, over a width $W$. The bottom plate has $\hat n = -\hat x$, so it carries the same current back toward $-z$.

        !!intuition Does this make sense?
          Check the power. The Poynting vector $E_xH_y$ (in W/m²) flows through the gap, whose cross-section has area $Wd$. The total is $E_xH_y\,Wd = (E_xd)(H_yW) = VI$. The circuit formula $P = VI$ is the field's power flow, added up over the gap.
      `),
      Q(md`**Predict.** Between two plates of width $W = 4$ cm and gap $d = 1$ mm, the wave has $H_y = 5$ A/m. What current does each plate carry?`,
        ['0.2 A, toward $+z$ on the top plate and toward $-z$ on the bottom one', '0.4 A in total, 0.2 A on each plate in the same direction', '5 mA on each plate', '125 A on each plate'], 0,
        [null, md`The two plates carry equal currents in **opposite** directions. Nothing flows "in total" along the line.`, md`That is $H_yd$. The current spreads across the width: $I = H_yW$.`, md`That is $H_y/W$. The surface current density $H_y$ (A/m) is multiplied by the width.`],
        md`$I = H_yW = (5)(0.04) = 0.2$ A. On the top plate $\mathbf J_s = \hat x\times\hat yH_y = +\hat zH_y$; on the bottom plate $\hat n = -\hat x$ flips it.`),
      RF(md`
        ### 3. Faraday's law gives the first telegrapher's equation

        Now find how $V$ changes along the line. Draw a thin rectangle in the gap, in the plane of the page. It crosses the gap at $z$ and again at $z + \Delta z$, and runs along the two plates in between.

        [[fig:far]]

        Go around it clockwise, as drawn. With $\hat x$ down and $\hat z$ to the right, the right-hand rule gives the rectangle the normal $\hat z\times\hat x = \hat y$: into the page, along $\mathbf H$.

        Add up $\mathbf E\cdot d\mathbf l$ on the four sides:

        - along the top plate, going right: $\mathbf E$ is along $\hat x$ and $d\mathbf l$ along $\hat z$, so $0$;
        - down the right side at $z + \Delta z$, along $\mathbf E$: $+E_x(z + \Delta z)\,d = V(z + \Delta z)$;
        - along the bottom plate, going left: $0$;
        - up the left side at $z$, against $\mathbf E$: $-E_x(z)\,d = -V(z)$.

        So the circulation is
        $$\oint\mathbf E\cdot d\mathbf l = V(z + \Delta z) - V(z)$$
        The flux through the rectangle: $\mathbf B = \mu H_y\hat y$, into the page, over an area $d\,\Delta z$:
        $$\Phi = \mu H_y\,d\,\Delta z$$
        Faraday's law sets the circulation equal to $-d\Phi/dt$:
        $$V(z + \Delta z) - V(z) = -\mu d\,\Delta z\,\frac{\partial H_y}{\partial t}$$
        Replace $H_y$ by $I/W$, from Section 2:
        $$V(z + \Delta z) - V(z) = -\frac{\mu d}{W}\,\Delta z\,\frac{\partial I}{\partial t}$$
        Divide by $\Delta z$ and let $\Delta z \to 0$. The left side becomes a derivative:
        $$\frac{\partial V}{\partial z} = -\frac{\mu d}{W}\frac{\partial I}{\partial t}$$
        Call the constant $L$, and move the minus sign to the left:
        $$\boxed{-\frac{\partial V}{\partial z} = L\frac{\partial I}{\partial t}}\qquad L = \frac{\mu d}{W}$$

        **What $L$ is.** The flux per meter of line is $\mu H_yd = \mu(I/W)d$. Divide by the current and you get $\mu d/W$. So $L$ is the **magnetic flux linked per meter of line, per ampere**: an inductance per meter.

        !!intuition Does this make sense?
          An inductor obeys $v = L\,di/dt$. Here the voltage **lost** over a short length $\Delta z$ is $L\Delta z\,\partial I/\partial t$: each slice of the line acts as a small series inductor. A wider plate spreads the same current over more width, so $H$ and the flux get smaller: $L$ falls as $W$ grows. A bigger gap holds more flux: $L$ grows with $d$. ✓
      `, { far: { svg: faradayFig(), cap: 'The thin rectangle, traversed clockwise. Only its two sides across the gap pick up E·dl. The flux of B = μH through it points into the page.' } }),
      Q(md`**Predict.** A parallel-plate line has its gap doubled and its width halved, with the same filling. Its $L$ becomes…`,
        ['4 times larger', 'the same', '2 times larger', '4 times smaller'], 0,
        [null, md`$L = \mu d/W$. Both changes push $d/W$ the same way: $\times2$ from $d$ and $\times2$ from $W$.`, md`That counts only one of the two changes.`, md`That is what happens to $C = \epsilon W/d$. $L$ has the ratio the other way up.`],
        md`$L = \mu d/W$, and $d/W$ goes from $d/W$ to $(2d)/(W/2) = 4\,d/W$. So $L$ grows 4 times.`),
      RF(md`
        ### 4. Charge conservation gives the second telegrapher's equation

        Now find how $I$ changes along the line. Look at the piece of the top plate between $z$ and $z + \Delta z$.

        [[fig:chg]]

        Current $I(z)$ flows into this piece from the left, and $I(z + \Delta z)$ flows out on the right. If more comes in than goes out, the difference has two places to go.

        **It piles up as charge** on the plate's inner face. There $\rho_s = \hat n\cdot\mathbf D = \epsilon E_x$, with $\hat n = \hat x$ pointing into the gap. Over the area $W\Delta z$, using $E_x = V/d$:
        $$Q = \epsilon E_x\,W\Delta z = \frac{\epsilon W}{d}\,\Delta z\,V$$
        This charge grows at the rate $\partial Q/\partial t$.

        **It leaks across the gap**, if the filling conducts. Ohm's law at a point, $J = \sigma E_x$, through the same area:
        $$I_{\text{leak}} = \sigma E_x\,W\Delta z = \frac{\sigma W}{d}\,\Delta z\,V$$
        Charge is conserved: what comes in minus what goes out equals what piles up plus what leaks.
        $$I(z) - I(z + \Delta z) = \frac{\epsilon W}{d}\Delta z\frac{\partial V}{\partial t} + \frac{\sigma W}{d}\Delta z\,V$$
        Divide by $\Delta z$ and let it go to zero. The left side becomes $-\partial I/\partial z$:
        $$\boxed{-\frac{\partial I}{\partial z} = C\frac{\partial V}{\partial t} + GV}$$
        with
        $$C = \frac{\epsilon W}{d}, \qquad G = \frac{\sigma W}{d}$$
        $C$ is the **charge per meter, per volt**. $G$ is the **leakage current per meter, per volt**.

        **The same result from Ampère's law.** The $x$-component of $\nabla\times\mathbf H = \sigma\mathbf E + \epsilon\,\partial\mathbf E/\partial t$, for these fields, is
        $$-\frac{\partial H_y}{\partial z} = \sigma E_x + \epsilon\frac{\partial E_x}{\partial t}$$
        Multiply by $W$, then use $H_yW = I$ and $E_x = V/d$. You land on the same box. Two routes, one equation.

        !!intuition Does this make sense?
          A capacitor obeys $i = C\,dv/dt$. Here the current **lost** along $\Delta z$ is $C\Delta z\,\partial V/\partial t$: each slice is a small capacitor across the line, with a small resistor ($G\Delta z$ of conductance) beside it when the filling leaks.

        **The lossless line.** From here on the filling is a perfect dielectric, $\sigma = 0$, so $G = 0$. (A real line also loses a little in its metal, a series $RI$ term that perfect plates leave out.) The pair on your formula sheet is
        $$-\frac{\partial V}{\partial z} = L\frac{\partial I}{\partial t}$$
        $$-\frac{\partial I}{\partial z} = C\frac{\partial V}{\partial t}$$
        These are the **telegrapher's equations**.
      `, { chg: { svg: chargeFig(), cap: 'The piece of the top plate between z and z + Δz. Whatever current comes in and does not go out either piles up as charge on the inner face or crosses the gap.' } }),
      Q(md`**Predict.** On a lossless line with $C = 100$ pF/m, at one point and instant, $\partial I/\partial z = -2$ A/m. Then $\partial V/\partial t$ there is…`,
        [md`$+2\times10^{10}$ V/s`, md`$-2\times10^{10}$ V/s`, md`$+2\times10^{-10}$ V/s`, md`zero, since the line is lossless`], 0,
        [null, md`Mind the sign in $-\partial I/\partial z = C\,\partial V/\partial t$: the left side is $+2$.`, md`That multiplies by $C$. Solve for $\partial V/\partial t$: divide by $C$.`, md`Lossless means $G = 0$, not that nothing changes. The capacitive term is still there.`],
        md`$C\,\partial V/\partial t = -\partial I/\partial z = 2$ A/m, so $\partial V/\partial t = 2/(100\times10^{-12}) = 2\times10^{10}$ V/s. More current flows in than out, charge piles up, and the voltage rises.`),
      RF(md`
        ### 5. The line as a ladder of tiny inductors and capacitors

        Put the two boxes together. A short piece of line, $\Delta z$ long, is a small circuit: a series inductor $L\Delta z$ in the top wire, and a shunt capacitor $C\Delta z$ across the two wires ($G\Delta z$ beside it if the filling leaks). A whole line is a long ladder of these pieces.

        [[fig:lad]]

        Each equation can be read off one rung:

        - KVL across the inductor: $V(z) - V(z + \Delta z) = L\Delta z\,\partial I/\partial t$. That is the first telegrapher's equation.
        - KCL at the node: $I(z) - I(z + \Delta z) = C\Delta z\,\partial V/\partial t$. That is the second.

        The ladder is only honest when $\Delta z$ is so short that $V$ and $I$ barely change across one piece: $\Delta z \ll \lambda$, the shortest wavelength in the signal.

        **What is new compared with circuits.** In a lumped circuit the current is the same all along a wire. On a line it is not. Connect a battery at $z = 0$ at $t = 0$. Charge flows into the first capacitor, and only then can current reach the next piece, through its inductor, and so on. So the charged region grows at a finite speed $v$. Ahead of the front, $V = 0$ and $I = 0$, even though the wire touches a battery. Behind it, the wire carries current. The figure in Section 1 is this picture, seen in the fields.

        !!intuition Does this make sense?
          Lumped circuits are the limit of a line much shorter than a wavelength: then the front crosses the whole line before anything else changes, and every point sees the same current. Your lab circuits at a few kHz are fine. A 1 m cable at 1 GHz ($\lambda = 30$ cm in air) is not.
      `, { lad: { svg: ladderFig(), cap: 'A line as a chain of short pieces: series inductance LΔz and shunt capacitance CΔz in each. The model is exact in the limit Δz → 0.' } }),
      Q(md`**Predict.** A line has $L = 250$ nH/m and $C = 100$ pF/m. In the ladder model, one piece 1 cm long has…`,
        ['2.5 nH in series and 1 pF across', '250 nH in series and 100 pF across', '25 nH in series and 10 pF across', '2.5 nH across and 1 pF in series'], 0,
        [null, md`Those are the values per meter. A piece $\Delta z$ long has $L\Delta z$ and $C\Delta z$.`, md`That uses $\Delta z = 10$ cm. 1 cm is $0.01$ m.`, md`The inductance is in series (Faraday: the voltage drop along the wire); the capacitance is across (charge between the conductors).`],
        md`$L\Delta z = (250\ \text{nH/m})(0.01\ \text{m}) = 2.5$ nH, in series. $C\Delta z = (100\ \text{pF/m})(0.01\ \text{m}) = 1$ pF, across the line.`),
      RF(md`
        ### 6. L, C and G for any line: the geometrical factor

        Look at the three results for the plates side by side:
        $$C = \epsilon\,\frac{W}{d}, \qquad G = \sigma\,\frac{W}{d}, \qquad L = \frac{\mu}{W/d}$$
        One number, $W/d$, carries all the geometry. Call it the **geometrical factor**:
        $$\boxed{C = \epsilon\,\text{GF}, \quad G = \sigma\,\text{GF}, \quad L = \frac{\mu}{\text{GF}}}$$
        These hold for **any** two-conductor line with a uniform filling, not only plates. Two reasons:

        - $C$ and $G$ come from the same field pattern: the charge from $\epsilon E$ and the leakage from $\sigma E$. So $G/C = \sigma/\epsilon$ for every shape.
        - In Section 7 you will see that the wave must travel at $1/\sqrt{\mu\epsilon}$ and also at $1/\sqrt{LC}$. So $LC = \mu\epsilon$ for every shape. Once $C = \epsilon\,\text{GF}$, that forces $L = \mu/\text{GF}$.

        **The coax, from scratch.** An inner conductor of radius $a$ and an outer one of radius $b$, with the filling between.

        *Capacitance from Gauss's law.* Put a charge $\rho_l$ per meter on the inner conductor and $-\rho_l$ on the outer one. Take a Gauss cylinder of radius $r$, between $a$ and $b$, and 1 m long. By symmetry $\mathbf D$ points straight out, so
        $$D_r\cdot2\pi r = \rho_l$$
        Divide by $2\pi r\epsilon$:
        $$E_r = \frac{\rho_l}{2\pi\epsilon r}$$
        The voltage is the integral of $E_r$ from the inner conductor out to the outer one:
        $$V = \int_a^b\frac{\rho_l}{2\pi\epsilon r}\,dr = \frac{\rho_l}{2\pi\epsilon}\ln\frac{b}{a}$$
        Charge per meter over voltage:
        $$C = \frac{\rho_l}{V} = \frac{2\pi\epsilon}{\ln(b/a)}$$
        Compare with $C = \epsilon\,\text{GF}$. For the coax,
        $$\boxed{\text{GF} = \frac{2\pi}{\ln(b/a)}}$$
        *Inductance from the flux.* Now put a current $I$ on the inner conductor. Ampère's law on a circle of radius $r$:
        $$H_\phi\cdot2\pi r = I \quad\Rightarrow\quad H_\phi = \frac{I}{2\pi r}$$
        The flux per meter of line goes through a strip 1 m long, from $r = a$ to $r = b$:
        $$\Phi' = \int_a^b\frac{\mu I}{2\pi r}\,dr = \frac{\mu I}{2\pi}\ln\frac{b}{a}$$
        Flux per ampere:
        $$L = \frac{\mu\ln(b/a)}{2\pi} = \frac{\mu}{\text{GF}}\ ✓$$
        The same GF, reached through a different law.

        [[fig:xs]]

        | Line | GF | Where it comes from |
        |---|---|---|
        | parallel plates: width $W$, gap $d$ | $W/d$ | uniform $E$ across the gap |
        | coax: radii $a < b$ | $2\pi/\ln(b/a)$ | Gauss: $E \propto 1/r$ |
        | two wires: radius $a$, centers $D$ apart | $\pi/\cosh^{-1}(D/2a)$ | quoted in Lecture 27 |

        !!intuition Does this make sense?
          A bigger GF means the conductors are effectively closer: more capacitance, less inductance. Pull the coax's outer conductor in toward the inner one ($b \to a$): $\ln(b/a) \to 0$, so GF and $C$ blow up, like a capacitor whose gap vanishes. ✓
      `, { xs: { svg: PF.row([{ svg: ppEnd(), cap: 'Plates, end-on: GF = W/d' }, { svg: coaxEnd(), cap: 'Coax, end-on: GF = 2π/ln(b/a)' }]).svg, cap: 'The same TEM picture in two cross-sections, with the wave coming toward you: E runs from one conductor to the other, H circles the inner (or top) conductor, and E and H cross at right angles everywhere.' } }),
      Q(md`**Predict.** A coax has $b/a = e$ (so $\ln(b/a) = 1$) and a filling with $\epsilon = 4\epsilon_0$. With $\epsilon_0 = \frac{10^{-9}}{36\pi}$ F/m, its $C$ is about…`,
        ['222 pF/m', '55.6 pF/m', '5.63 pF/m', '889 pF/m'], 0,
        [null, md`That drops the filling: it is the air-filled value $2\pi\epsilon_0$. Use $\epsilon = 4\epsilon_0$.`, md`That divides by GF. $C = \epsilon\,\text{GF}$; it is $L$ that divides.`, md`That uses $\epsilon_r^2 = 16$. $C$ is proportional to $\epsilon$ itself.`],
        md`$\text{GF} = 2\pi/1 = 2\pi$, so $C = 4\epsilon_0\cdot2\pi = 8\pi\cdot\frac{10^{-9}}{36\pi} = \frac{2}{9}\times10^{-9} \approx 222$ pF/m.`),
      R(md`
        ### 7. The wave equation, and why the speed ignores the shape

        Two first-order equations, two unknowns. Get one equation in $V$ alone, just as for $E_x$ in Topic 5.

        **Step 1.** Differentiate the first telegrapher's equation with respect to $z$:
        $$-\frac{\partial^2V}{\partial z^2} = L\frac{\partial^2I}{\partial z\,\partial t}$$
        **Step 2.** Differentiate the second with respect to $t$:
        $$-\frac{\partial^2I}{\partial t\,\partial z} = C\frac{\partial^2V}{\partial t^2}$$
        **Step 3.** The order of the two derivatives does not matter, so Step 2 says
        $$\frac{\partial^2I}{\partial z\,\partial t} = -C\frac{\partial^2V}{\partial t^2}$$
        **Step 4.** Put that into Step 1:
        $$-\frac{\partial^2V}{\partial z^2} = L\left(-C\frac{\partial^2V}{\partial t^2}\right)$$
        The minus signs cancel:
        $$\boxed{\frac{\partial^2V}{\partial z^2} = LC\,\frac{\partial^2V}{\partial t^2}}$$
        This is the wave equation of Exam 2, $\partial^2E_x/\partial z^2 = \mu\epsilon\,\partial^2E_x/\partial t^2$, with $LC$ in place of $\mu\epsilon$. That one had speed $1/\sqrt{\mu\epsilon}$, so this one has speed
        $$\boxed{v = \frac{1}{\sqrt{LC}}}$$
        Now use the geometrical factor:
        $$LC = \frac{\mu}{\text{GF}}\cdot\epsilon\,\text{GF} = \mu\epsilon$$
        The GF cancels:
        $$\boxed{v = \frac{1}{\sqrt{LC}} = \frac{1}{\sqrt{\mu\epsilon}}}$$

        **Why the shape cancels.** The wave on a line *is* the TEM field wave in the filling. The conductors steer it, but between them the fields still obey Maxwell's equations in that material, so they travel at that material's speed. The shape decides how much $V$ and $I$ go with a given field, not how fast it moves.

        With $\mu = \mu_0$ this is
        $$v = \frac{c}{\sqrt{\epsilon_r}}$$
        Air: $c$. Polyethylene, $\epsilon_r = 2.25$: $c/1.5 = 2\times10^8$ m/s. $\epsilon_r = 4$: $c/2 = 1.5\times10^8$ m/s.

        !!intuition Does this make sense?
          Units. $L$ (H/m) times $C$ (F/m) has units H·F/m². An $LC$ circuit's $\sqrt{LC}$ is a time, so H·F is s². Then $LC$ is s²/m², and $1/\sqrt{LC}$ is in m/s. ✓
      `),
      Q(md`**Predict.** A coax filled with $\epsilon_r = 9$ ($\mu = \mu_0$) is replaced by one with twice the ratio $b/a$ and the same filling. The wave speed on the new cable is…`,
        [md`$10^8$ m/s, the same as before`, md`half as large, because GF halves`, md`larger by a factor $\ln(2b/a)/\ln(b/a)$`, md`$3\times10^8$ m/s`], 0,
        [null, md`GF changes, but $v = 1/\sqrt{LC}$ and $LC = \mu\epsilon$ does not depend on GF at all.`, md`$L$ and $C$ change by opposite factors, so their product, and $v$, stay fixed.`, md`That is $c$, the speed in air. This filling has $\epsilon_r = 9$.`],
        md`$v = c/\sqrt{\epsilon_r} = 3\times10^8/3 = 10^8$ m/s for both. A bigger $b/a$ raises $L$ and lowers $C$ by the same factor.`),
      RF(md`
        ### 8. d'Alembert's solutions, and the current that goes with them

        Which functions solve the wave equation? Take any shape $f$ and form $V = f(t - z/v)$. Call the argument $u = t - z/v$.

        The chain rule in $z$ brings out $\partial u/\partial z = -1/v$ each time:
        $$\frac{\partial V}{\partial z} = -\frac1v\,f'(u)$$
        $$\frac{\partial^2V}{\partial z^2} = \frac{1}{v^2}\,f''(u)$$
        In $t$, $\partial u/\partial t = 1$:
        $$\frac{\partial^2V}{\partial t^2} = f''(u)$$
        So $\partial^2V/\partial z^2 = (1/v^2)\,\partial^2V/\partial t^2 = LC\,\partial^2V/\partial t^2$. ✓ Any shape works. The same steps work for $g(t + z/v)$. The general solution is the sum:
        $$V(z,t) = f(t - z/v) + g(t + z/v)$$

        **What $f(t - z/v)$ means.** The voltage at position $z$ and time $t$ equals the voltage that was at $z = 0$ at the earlier time $t - z/v$. Whatever happened at the start arrives at $z$ a delay $z/v$ later. So $f$ moves toward $+z$ at speed $v$ and keeps its shape. In the same way, $g(t + z/v)$ moves toward $-z$.

        [[fig:mv]]

        **The current.** The voltage alone is not the whole wave. Use the second telegrapher's equation to find the current that comes with it. Forward wave first:
        $$-\frac{\partial I}{\partial z} = C\frac{\partial V}{\partial t} = Cf'(u)$$
        From the chain rule above, $f'(u) = -v\,\partial f/\partial z$. Substitute:
        $$-\frac{\partial I}{\partial z} = -Cv\,\frac{\partial f}{\partial z}$$
        Both sides are $z$-derivatives. With no current before the wave arrives, the functions themselves match:
        $$I = Cv\,f(t - z/v)$$
        And $Cv = C/\sqrt{LC} = \sqrt{C/L}$. Give its inverse a name:
        $$Z_0 \equiv \sqrt{\frac{L}{C}}, \qquad I = \frac{f(t - z/v)}{Z_0}$$
        For the backward wave $g(t + z/v)$ the chain rule gives $g' = +v\,\partial g/\partial z$, one sign different, and the same steps give $I = -g/Z_0$. Together:
        $$\boxed{I = \frac{f(t - z/v) - g(t + z/v)}{Z_0}}$$
      `, { mv: { svg: moveFig(), cap: 'V = f(t − z/v) at two instants. The same shape, moved a distance v(t₂ − t₁) toward +z.' } }),
      Q(md`**Predict.** On a 50 Ω line, a backward step $V = 10\,u(t + z/v - t_0)$ V travels toward $-z$. Behind its front, the current $I$ (positive toward $+z$) is…`,
        ['$-0.2$ A', '$+0.2$ A', '$-500$ A', '$+5$ A'], 0,
        [null, md`That is the forward-wave rule. A backward wave has $I = -g/Z_0$.`, md`That multiplies by $Z_0$. Current is voltage divided by $Z_0$.`, md`That divides $Z_0$ by the voltage, and has the wrong sign for a backward wave.`],
        md`$I = -g/Z_0 = -10/50 = -0.2$ A. The power $VI = -2$ W is negative: it flows toward $-z$, the way the wave goes.`),
      R(md`
        ### 9. What Z₀ means

        $Z_0$ is the ratio of voltage to current **in one traveling wave**. Call the forward wave's voltage and current $V^+$, $I^+$, and the backward wave's $V^-$, $I^-$:
        $$\frac{V^+}{I^+} = Z_0, \qquad \frac{V^-}{I^-} = -Z_0$$
        That is the line $Z_0 = \pm V^\pm/I^\pm$ on your formula sheet. In terms of the geometrical factor:
        $$Z_0 = \sqrt{\frac{L}{C}} = \sqrt{\frac{\mu/\text{GF}}{\epsilon\,\text{GF}}} = \frac{1}{\text{GF}}\sqrt{\frac{\mu}{\epsilon}}$$
        $$\boxed{Z_0 = \frac{\eta}{\text{GF}}}$$
        The fields say the same thing directly. In the forward wave $E_x/H_y = \eta$, so
        $$\frac{V}{I} = \frac{E_xd}{H_yW} = \eta\,\frac{d}{W} = \frac{\eta}{\text{GF}}\ ✓$$

        **What it is, physically.**

        - A source connected to the line sees, until anything comes back from the far end, a plain resistor $Z_0$. A 50 Ω cable looks like a 50 Ω resistor to the source for its first round-trip time. [Topic 14](#/l/w5-launch) is built on this.
        - It is not a resistance an ohmmeter would read: at DC, the far end decides everything. And $Z_0$ burns nothing. The power $V^+I^+ = (V^+)^2/Z_0$ travels down the line instead of turning into heat.
        - It does not depend on the length. A 1 m piece and a 1 km piece of the same cable have the same $Z_0$.
        - The cross-section and the filling set it: conductors effectively closer (bigger GF) give more $C$, less $L$, and a lower $Z_0$.

        **Why the backward wave has the minus sign.** It carries power toward $-z$, so $VI$ must be negative for it. If its voltage is positive, the current on the top conductor flows toward $-z$: $I^- = -V^-/Z_0$. It is the same rule as $\tilde H = -\tilde E/\eta$ for a backward plane wave.

        !!intuition Does this make sense?
          Coax in air: $Z_0 = \frac{120\pi}{2\pi}\ln\frac{b}{a} = 60\ln\frac{b}{a}\ \Omega$. A 75 Ω cable needs $\ln(b/a) = 1.25$, so $b/a \approx 3.5$. Filling the same cable with $\epsilon_r = 2.25$ divides $\eta$, and so $Z_0$, by 1.5: about 50 Ω. Real cables have just these proportions. ✓
      `),
      Q(md`**Predict.** A parallel-plate line has $W = 3$ cm, $d = 1$ mm and a filling with $\epsilon_r = 4$, $\mu = \mu_0$. Its $Z_0$ is…`,
        [md`$2\pi \approx 6.28\ \Omega$`, md`$4\pi \approx 12.6\ \Omega$`, md`$\pi \approx 3.14\ \Omega$`, md`$1800\pi\ \Omega$`], 0,
        [null, md`That uses $\eta_0 = 120\pi$. In this filling $\eta = 120\pi/\sqrt{\epsilon_r} = 60\pi$.`, md`That divides $\eta_0$ by $\epsilon_r$. $\eta$ has the square root: $\eta = \eta_0/\sqrt{\epsilon_r}$.`, md`That multiplies $\eta$ by GF. $Z_0 = \eta/\text{GF}$.`],
        md`$\text{GF} = W/d = 30$ and $\eta = 120\pi/2 = 60\pi\ \Omega$. So $Z_0 = 60\pi/30 = 2\pi \approx 6.28\ \Omega$.`),
      R(md`
        ### The method

        !!method From the cross-section to $L$, $C$, $G$, $Z_0$ and $v$
          1. **GF from the shape.** Plates: $W/d$ (same units top and bottom). Coax: $2\pi/\ln(b/a)$ (natural log).
          2. **The filling alone.** $v = 1/\sqrt{\mu\epsilon} = c/\sqrt{\epsilon_r\mu_r}$ and $\eta = 120\pi\sqrt{\mu_r/\epsilon_r}$.
          3. **Per meter.** $C = \epsilon\,\text{GF}$, $G = \sigma\,\text{GF}$, $L = \mu/\text{GF}$.
          4. **Impedance.** $Z_0 = \eta/\text{GF}$.
          5. **Check two ways.** $\sqrt{L/C}$ must give the same $Z_0$, and $1/\sqrt{LC}$ the same $v$. Even faster: $L = Z_0/v$ and $C = 1/(Z_0v)$.

        Where do the last two come from? Multiply and divide the boxes: $Z_0/v = \sqrt{L/C}\cdot\sqrt{LC} = L$, and $Z_0v = \sqrt{L/C}/\sqrt{LC} = 1/C$.

        ### Worked example 1: a parallel-plate line, with a leaky filling

        !!graded Problem
          A parallel-plate line has $W = 2$ cm and $d = 1$ mm. The filling has $\epsilon = 4\epsilon_0$, $\mu = \mu_0$ and $\sigma = 10^{-4}$ S/m. Find GF, $C$, $L$, $G$, then $v$ and $Z_0$ (ignoring the small loss).

        **Step 1: GF.** Same units top and bottom: $W/d = 20\ \text{mm}/1\ \text{mm}$.
        $$\text{GF} = 20$$
        **Step 2: C.** With $\epsilon_0 = \frac{10^{-9}}{36\pi}$:
        $$C = \epsilon\,\text{GF} = 80\epsilon_0 = \frac{80\times10^{-9}}{36\pi}$$
        That is about $707$ pF/m.

        **Step 3: L.**
        $$L = \frac{\mu_0}{\text{GF}} = \frac{4\pi\times10^{-7}}{20} = 2\pi\times10^{-8}\ \text{H/m}$$
        That is about $62.8$ nH/m.

        **Step 4: G.**
        $$G = \sigma\,\text{GF} = (10^{-4})(20) = 2\times10^{-3}\ \text{S/m}$$
        **Step 5: v, from the filling alone.**
        $$v = \frac{c}{\sqrt{\epsilon_r}} = \frac{3\times10^8}{2} = 1.5\times10^8\ \text{m/s}$$
        **Step 6: Z₀.** $\eta = 120\pi/2 = 60\pi\ \Omega$, so
        $$Z_0 = \frac{\eta}{\text{GF}} = \frac{60\pi}{20} = 3\pi \approx 9.42\ \Omega$$
        **Check.** $L/C = 2\pi\times10^{-8}\cdot\frac{36\pi}{80\times10^{-9}} = 9\pi^2$, so $\sqrt{L/C} = 3\pi$ ✓. And $LC = 2\pi\times10^{-8}\cdot\frac{80\times10^{-9}}{36\pi} = 4.44\times10^{-17}$ s²/m², whose root is $6.67$ ns/m: $v = 1.5\times10^8$ m/s ✓.

        ### Worked example 2: the coax of Spring 2024 #3

        !!graded Problem
          A coax has inner radius $a$, outer radius $b$, and a lossless filling with $\epsilon$, $\mu$. Its capacitance per meter is $C = \frac{2\pi\epsilon}{\ln(b/a)}$. Find $L$, $Z_0$ and $v$ in terms of $a$, $b$, $\epsilon$, $\mu$. Then evaluate them for $b/a = e^2$, $\epsilon = 2.25\epsilon_0$, $\mu = \mu_0$.

        **Step 1: read GF off $C$.** $C = \epsilon\,\text{GF}$, so
        $$\text{GF} = \frac{2\pi}{\ln(b/a)}$$
        **Step 2: L.**
        $$L = \frac{\mu}{\text{GF}} = \frac{\mu}{2\pi}\ln\frac{b}{a}\ \ \text{H/m}$$
        **Step 3: Z₀.**
        $$Z_0 = \sqrt{\frac{L}{C}} = \frac{\ln(b/a)}{2\pi}\sqrt{\frac{\mu}{\epsilon}}\ \ \Omega$$
        **Step 4: v.** $LC = \mu\epsilon$:
        $$v = \frac{1}{\sqrt{LC}} = \frac{1}{\sqrt{\mu\epsilon}}\ \ \text{m/s}$$
        The posted key gives exactly these three. ✓

        **Step 5: numbers.** $\ln(b/a) = 2$, so $\text{GF} = \pi$. Then
        $$C = 2.25\epsilon_0\cdot\pi = \frac{2.25\times10^{-9}}{36} = 62.5\ \text{pF/m}$$
        $$L = \frac{\mu_0}{\pi} = 4\times10^{-7}\ \text{H/m} = 0.4\ \mu\text{H/m}$$
        $\eta = 120\pi/1.5 = 80\pi$, so
        $$Z_0 = \frac{80\pi}{\pi} = 80\ \Omega$$
        $$v = \frac{c}{1.5} = 2\times10^8\ \text{m/s}$$
        **Check.** $L/C = 0.4\times10^{-6}/62.5\times10^{-12} = 6400$, and $\sqrt{6400} = 80$ ✓. $L = Z_0/v = 80/(2\times10^8) = 4\times10^{-7}$ ✓.

        **Speed path.** Write GF from $C$, then $L = \mu/\text{GF}$, $Z_0 = \eta/\text{GF}$, $v = 1/\sqrt{\mu\epsilon}$. Four lines, no algebra.

        **Where points go.** Writing $L = \mu\cdot2\pi/\ln(b/a)$ (GF upside down). Writing $v$ in terms of $a$ and $b$ (they cancel). Leaving off units.

        ### Worked example 3: one cable, two fillings (the skill HW 11 #4 asks for)

        !!graded Problem
          A coax has $a = 1$ mm and $b = 4$ mm ($\ln4 \approx 1.386$). Find $C$, $L$, $Z_0$ and $v$ with an air filling, then with a filling of $\epsilon_r = 4$ ($\mu = \mu_0$). Which numbers change?

        **Step 1: GF.** It depends only on the shape:
        $$\text{GF} = \frac{2\pi}{1.386} = 4.53$$
        **Step 2: air.**
        $$C = \epsilon_0\,(4.53) = 40.1\ \text{pF/m}$$
        $$L = \frac{\mu_0}{4.53} = 0.277\ \mu\text{H/m}$$
        $$Z_0 = 60\ln4 = 83.2\ \Omega, \qquad v = c$$
        **Step 3: $\epsilon_r = 4$.** $C$ grows 4 times; $L$ does not change (no $\epsilon$ in it):
        $$C = 160\ \text{pF/m}, \qquad L = 0.277\ \mu\text{H/m}$$
        $Z_0 = \sqrt{L/C}$ falls by $\sqrt4 = 2$, and so does $v$:
        $$Z_0 = 41.6\ \Omega, \qquad v = 1.5\times10^8\ \text{m/s}$$
        **What changed.** The filling changes $C$, $Z_0$ and $v$, never $L$ (unless it is magnetic). The shape changes $C$, $L$ and $Z_0$, never $v$.

        ### The whole topic on one table

        | Quantity | Formula | Where it came from |
        |---|---|---|
        | $V$, $I$ | $E_xd$, $H_yW$ | $\int\mathbf E\cdot d\mathbf l$ across; $\oint\mathbf H\cdot d\mathbf l$ around |
        | first equation | $-\partial V/\partial z = L\,\partial I/\partial t$ | Faraday on a thin rectangle |
        | second equation | $-\partial I/\partial z = C\,\partial V/\partial t + GV$ | charge conservation |
        | $C$, $G$, $L$ | $\epsilon\,\text{GF}$, $\sigma\,\text{GF}$, $\mu/\text{GF}$ | flux and charge per meter |
        | GF | $W/d$; $2\pi/\ln(b/a)$ | the cross-section |
        | $v$ | $1/\sqrt{LC} = 1/\sqrt{\mu\epsilon}$ | the wave equation; GF cancels |
        | $Z_0$ | $\sqrt{L/C} = \eta/\text{GF}$ | the current of a traveling $V$ |
        | solutions | $V = f + g$, $I = (f - g)/Z_0$ | d'Alembert |

        !!mistake Common mistakes
          - **GF upside down in $L$.** $L = \mu/\text{GF}$: a wider plate or a fatter inner conductor means **less** inductance.
          - **Thinking $v$ depends on the shape.** $v = 1/\sqrt{\mu\epsilon}$ for every TEM line. Only the filling sets it.
          - **Forgetting $\sqrt{\epsilon_r}$ in $\eta$** when computing $Z_0 = \eta/\text{GF}$ for a filled line.
          - **$\log_{10}$ instead of $\ln$.** The coax formula comes from $\int dr/r$, a natural log.
          - **Mixing units in $W/d$.** Centimeters over millimeters gives a GF ten times too small.
          - **The backward current's sign.** $I^- = -V^-/Z_0$.
          - **Treating $Z_0$ as a resistor that burns power**, or one that grows with length. It is a ratio in one traveling wave.
          - **Per meter versus total.** $L$ and $C$ are per meter. A piece $\Delta z$ long has $L\Delta z$ and $C\Delta z$.

        !!key Speed tricks
          - **Speed first, shape never:** $v = c/\sqrt{\epsilon_r}$ (for $\mu = \mu_0$). Air $c$; $\epsilon_r = 2.25$ gives $2\times10^8$; $\epsilon_r = 4$ gives $1.5\times10^8$; $\epsilon_r = 9$ gives $10^8$ m/s.
          - **Coax in one line:** $Z_0 = 60\ln(b/a)/\sqrt{\epsilon_r}\ \Omega$.
          - **Plates in one line:** $Z_0 = 120\pi\,d/(W\sqrt{\epsilon_r})\ \Omega$.
          - **Any two give the rest:** $L = Z_0/v$, $C = 1/(Z_0v)$, $Z_0 = \sqrt{L/C}$, $v = 1/\sqrt{LC}$. A 50 Ω line at $2\times10^8$ m/s has $L = 250$ nH/m and $C = 100$ pF/m.
          - **Constants without a calculator:** $\epsilon_0 = \frac{1}{36\pi}$ nF/m $\approx 8.84$ pF/m; $\mu_0 = 0.4\pi\ \mu$H/m $\approx 1.26\ \mu$H/m.
          - **What scales with what.** Raise $\epsilon_r$: $C \propto \epsilon_r$, $L$ fixed, $Z_0$ and $v \propto 1/\sqrt{\epsilon_r}$. Raise GF: $C \propto \text{GF}$, $L$ and $Z_0 \propto 1/\text{GF}$, $v$ fixed.
          - **Statement test:** "$v$ depends on $b/a$": false. "$Z_0$ depends on the length": false. "$L$ changes when only $\epsilon$ changes": false.

        ### Check questions
      `),
      Q(md`Why is the voltage between the conductors well defined, even though the fields change in time?`,
        [md`A TEM wave has no $B_z$, so $\oint\mathbf E\cdot d\mathbf l = 0$ around any loop in a cross-section`, md`Because the conductors are perfect, so $\mathbf E = 0$ everywhere`, md`Because $\partial\mathbf B/\partial t = 0$ on a transmission line`, md`It is not: $V$ depends on the path, and we choose the straight one`], 0,
        [null, md`$\mathbf E = 0$ only inside the metal. Between the conductors it is the wave's field.`, md`$\mathbf B$ changes in time; only its $z$-component is zero.`, md`For loops in a cross-section, Faraday's law with $B_z = 0$ makes every path give the same answer.`],
        md`Faraday's law for a loop in a plane of constant $z$ involves only the flux of $B_z$, which is zero for TEM fields. So $\oint\mathbf E\cdot d\mathbf l = 0$ there, and the voltage does not depend on the path.`),
      Q(md`A line has $L = 0.5\ \mu$H/m and $C = 50$ pF/m. Its $Z_0$ and $v$ are…`,
        [md`$100\ \Omega$ and $2\times10^8$ m/s`, md`$10^4\ \Omega$ and $2\times10^8$ m/s`, md`$100\ \Omega$ and $4\times10^{16}$ m/s`, md`$0.01\ \Omega$ and $5\times10^{-9}$ m/s`], 0,
        [null, md`That is $L/C$ without the square root.`, md`That is $1/(LC)$ without the root: its units are m²/s².`, md`Those are $\sqrt{C/L}$ and $\sqrt{LC}$, both upside down.`],
        md`$L/C = 0.5\times10^{-6}/50\times10^{-12} = 10^4$, so $Z_0 = 100\ \Omega$. $LC = 2.5\times10^{-17}$, $\sqrt{LC} = 5\times10^{-9}$ s/m, so $v = 2\times10^8$ m/s.`),
      Q(md`You fill an air coax with a dielectric of $\epsilon_r = 4$. Which list is right?`,
        [md`$C\times4$, $L$ unchanged, $Z_0\div2$, $v\div2$`, md`$C\times4$, $L\div4$, $Z_0\div4$, $v$ unchanged`, md`$C\times2$, $L$ unchanged, $Z_0\div2$, $v\div2$`, md`$C\times4$, $L$ unchanged, $Z_0\div4$, $v\div4$`], 0,
        [null, md`That treats the filling like a change of shape. $L = \mu/\text{GF}$ has no $\epsilon$, and $v = 1/\sqrt{\mu\epsilon}$ does change.`, md`$C = \epsilon\,\text{GF}$ is proportional to $\epsilon$ itself, so $\times4$.`, md`$Z_0$ and $v$ go as $1/\sqrt{\epsilon}$, not $1/\epsilon$.`],
        md`$C \propto \epsilon$: $\times4$. $L = \mu/\text{GF}$: unchanged. $Z_0 = \sqrt{L/C}$: $\div2$. $v = 1/\sqrt{LC}$: $\div2$.`),
      Q(md`The second telegrapher's equation, $-\partial I/\partial z = C\,\partial V/\partial t$, is a statement of…`,
        ['charge conservation: current lost along the wire charges the line', "Faraday's law around a loop in the gap", "Ohm's law in the filling", 'energy conservation, from the Poynting theorem'], 0,
        [null, md`Faraday's law gives the first equation, the one with $L$.`, md`Ohm's law gives the $GV$ term, which vanishes for a lossless line.`, md`It is a current balance; energy is not involved.`],
        md`In minus out, $I(z) - I(z + \Delta z)$, equals the rate of charge build-up $C\Delta z\,\partial V/\partial t$. The $x$-component of Ampère's law says the same thing.`),
      Q(md`On a 75 Ω line, a single forward wave has $V = 30$ V at some point and instant. The power it carries past that point is…`,
        ['12 W toward $+z$', '6 W toward $+z$', '0.4 W toward $+z$', '12 W toward $-z$'], 0,
        [null, md`$V^2/(2Z_0)$ is the average of a sinusoid with peak $V$. Here $V$ is the instantaneous value: $p = VI = V^2/Z_0$.`, md`That is the current, $V/Z_0$, in amperes.`, md`A forward wave carries its power toward $+z$.`],
        md`$I = V/Z_0 = 0.4$ A and $p = VI = 30\times0.4 = 12$ W, toward $+z$.`),
      Q(md`A pulse takes 5 ns to travel 1 m of a nonmagnetic cable. The filling has $\epsilon_r$ equal to…`,
        ['2.25', '1.5', '5', '0.67'], 0,
        [null, md`That is $c/v$. $v = c/\sqrt{\epsilon_r}$, so $\epsilon_r = (c/v)^2$.`, md`That reads the delay in ns as $\epsilon_r$.`, md`That is $v/c$, upside down and without the square.`],
        md`$v = 1\ \text{m}/5\ \text{ns} = 2\times10^8$ m/s. $c/v = 1.5$, so $\epsilon_r = 1.5^2 = 2.25$.`),
      Q(md`Which statement about $Z_0$ is true?`,
        ['It is the ratio $V/I$ inside a single wave traveling toward $+z$', 'It is the resistance you would measure between the conductors with an ohmmeter', 'It grows in proportion to the length of the line', 'A line of impedance $Z_0$ heats up like a resistor $Z_0$'], 0,
        [null, md`At DC the reading depends on what terminates the far end; a lossless line has no resistance of its own.`, md`$Z_0 = \sqrt{L/C}$ uses values per meter, so the length cancels.`, md`A lossless line dissipates nothing: the power $V^+I^+$ travels on.`],
        md`$Z_0 = V^+/I^+$ for the forward wave (and $-V^-/I^-$ for the backward one). It is set by the cross-section and the filling only.`),
      R(md`
        ### Practice, level 1: one move at a time

        **The trick:** find GF first, then everything is one multiplication. Each card asks for one move. Answer in about 10 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_w5t_lc', { need: 8 }), { id: 'w5-telegraph.r0' }),
      R(md`
        ### Practice, level 1: speed and impedance

        **The trick:** $v$ comes from the filling alone. $Z_0 = \eta/\text{GF}$. From any two of $L$, $C$, $Z_0$, $v$, the other two follow in one line.
      `),
      Object.assign(G('rf_w5t_vz', { need: 8 }), { id: 'w5-telegraph.r1' }),
      R(md`
        ### Practice, level 1: reading a traveling wave

        **The trick:** $t - z/v$ goes toward $+z$, $t + z/v$ toward $-z$. Forward current $+V/Z_0$, backward current $-V/Z_0$.
      `),
      Object.assign(G('rf_w5t_wave', { need: 8 }), { id: 'w5-telegraph.r2' }),
      R(md`
        ### Practice, level 1: fields to circuit

        **The trick:** $V = E_xd$ across, $I = H_yW$ along, $V/I = \eta d/W$.
      `),
      Object.assign(G('rf_w5t_field', { need: 8 }), { id: 'w5-telegraph.r3' }),
      R(md`
        ### Practice, level 2: whole lines, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w5t_pp', { need: 2 }),
      G('w5t_coax', { need: 2 }),
      G('w5t_read', { need: 2 }),
      G('w5t_tele', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        Spring 2024 #3, extended: symbols first, then numbers, then what a wave on it carries.
      `),
      G('w5t_exam1', { need: 2 }),
    ],
  });

  // ================================================================ lesson 1, level 1
  const xe = (n) => (n === 1 ? 'e' : `e^{${n}}`);        // e^n as TeX

  GENS.rf_w5t_lc = () => one([
    // C of parallel plates
    () => {
      const [Wc, dm] = pick([[1, 1], [2, 1], [2, 2], [3, 1], [5, 1], [1, 0.5], [4, 2], [5, 0.5]]);
      const k = (Wc * 10) / dm, er = pick([2, 4, 9]);
      const m = (x) => `$${p(+x.toPrecision(3))}\\epsilon_0$`;
      return MC('C of a parallel-plate line', md`Parallel plates: $W = ${Wc}$ cm, $d = ${dm}$ mm, filling $\epsilon = ${er}\epsilon_0$. Then $C$ is…`, m(er * k),
        [[m(k), md`That drops the filling: $C = \epsilon\,\text{GF}$ with $\epsilon = ${er}\epsilon_0$.`],
          [m(er / k), md`That uses $d/W$. Wider plates hold more charge: $\text{GF} = W/d$.`],
          [m((er * Wc) / dm), md`That divides centimeters by millimeters. In the same units, $W/d = ${k}$.`],
          [m(Math.sqrt(er) * k), md`That uses $\sqrt{\epsilon_r}$. $C$ is proportional to $\epsilon$ itself; the root belongs to $v$ and $\eta$.`]],
        md`$\text{GF} = W/d = ${Wc * 10}\ \text{mm}/${dm}\ \text{mm} = ${k}$, so $C = \epsilon\,\text{GF} = ${er}\epsilon_0\cdot${k} = ${p(er * k)}\epsilon_0 \approx ${p(+(er * k * EPS0 * 1e12).toPrecision(3))}$ pF/m.`);
    },
    // L of parallel plates
    () => {
      const [Wc, dm] = pick([[1, 1], [2, 1], [3, 1], [5, 1], [1, 0.5], [4, 2], [2, 0.5]]);
      const k = (Wc * 10) / dm, er = pick([2, 4, 9]);
      const fr = (n) => `$\\mu_0/${p(n)}$`;
      return MC('L of a parallel-plate line', md`Parallel plates: $W = ${Wc}$ cm, $d = ${dm}$ mm, filling $\epsilon = ${er}\epsilon_0$, $\mu = \mu_0$. Then $L$ is…`, fr(k),
        [[`$${p(k)}\\mu_0$`, md`That multiplies by GF. $L = \mu/\text{GF}$: wider plates mean less flux per ampere.`],
          ['$\\mu_0$', md`That leaves out the geometry: $L = \mu/\text{GF}$ with $\text{GF} = ${k}$.`],
          [`$${er}\\mu_0/${p(k)}$`, md`The filling's $\epsilon$ does not enter $L$. Only $\mu$ and the shape do.`],
          [fr(Wc / dm), md`That divides centimeters by millimeters. In the same units, $W/d = ${k}$.`]],
        md`$L = \mu_0/\text{GF} = \mu_0/${k} \approx ${p(+(MU0 / k * 1e9).toPrecision(3))}$ nH/m. The filling's $\epsilon$ plays no part.`);
    },
    // GF of a coax
    () => {
      const n = pick([0.5, 2, 3, 4]);
      return MC('GF of a coax', md`A coax has $b/a = ${xe(n)}$. Its geometrical factor is…`, `$${piT(2 / n)}$`,
        [[`$\\tfrac{${p(n)}}{2\\pi}$`, md`That is $1/\text{GF}$, the factor that multiplies $\mu$ in $L$.`],
          [`$${piT(2 * n)}$`, md`That multiplies by $\ln(b/a)$. GF has it in the denominator.`],
          [`$2\\pi ${xe(n)}$`, md`That uses $b/a$ itself. GF has its natural log: $\ln(b/a) = ${p(n)}$.`],
          [`$\\tfrac{2\\pi}{${p(+(n * Math.LOG10E).toPrecision(3))}}$`, md`That uses $\log_{10}$. The coax formula comes from $\int dr/r$, a natural log.`]],
        md`$\text{GF} = 2\pi/\ln(b/a) = 2\pi/${p(n)} = ${piT(2 / n)}$.`);
    },
    // which of L, C, G change
    () => {
      const S = pick([
        { s: md`You replace the filling with one of higher $\epsilon$ (same $\mu = \mu_0$, still $\sigma = 0$, same shape).`, r: 0,
          why: { 1: md`$L = \mu/\text{GF}$ has no $\epsilon$ in it.`, 2: md`$G = \sigma\,\text{GF}$, and $\sigma$ is still 0.`, 3: md`$G$ depends on $\sigma$, which did not change.`, 4: md`The shape is the same, so only the $\epsilon$-term changes.` }, sol: md`$C = \epsilon\,\text{GF}$ changes; $L = \mu/\text{GF}$ and $G = \sigma\,\text{GF}$ do not.` },
        { s: md`The filling starts to conduct a little ($\sigma$ goes from 0 to a small value; $\epsilon$, $\mu$ and the shape unchanged).`, r: 2,
          why: { 0: md`$C = \epsilon\,\text{GF}$: neither $\epsilon$ nor GF changed.`, 1: md`$L = \mu/\text{GF}$: neither changed.`, 3: md`$C$ depends on $\epsilon$, which did not change.`, 4: md`The shape is the same, so only the $\sigma$-term changes.` }, sol: md`$G = \sigma\,\text{GF}$ changes; $C$ and $L$ do not.` },
        { s: md`You fill the line with a magnetic material, $\mu = 4\mu_0$, with the same $\epsilon$ and $\sigma$ and the same shape.`, r: 1,
          why: { 0: md`$C = \epsilon\,\text{GF}$ has no $\mu$ in it.`, 2: md`$G = \sigma\,\text{GF}$ has no $\mu$ in it.`, 3: md`Neither $C$ nor $G$ contains $\mu$.`, 4: md`The shape is the same, so only the $\mu$-term changes.` }, sol: md`$L = \mu/\text{GF}$ changes; $C$ and $G$ do not.` },
        { s: md`You double the gap $d$ of a parallel-plate line whose filling leaks slightly, with the same filling.`, r: 4,
          why: { 0: md`GF changed, and GF is in all three.`, 1: md`GF changed, and GF is in all three.`, 2: md`GF changed, and GF is in all three.`, 3: md`$L = \mu/\text{GF}$ changes too: it doubles.` }, sol: md`GF $= W/d$ halves. So $C$ and $G$ halve and $L$ doubles: all three change.` },
      ]);
      const OPTS = ['only $C$', 'only $L$', 'only $G$', '$C$ and $G$', 'all three: $L$, $C$ and $G$'];
      return MC('What changes?', md`${S.s} Which of the per-meter values $L$, $C$, $G$ change?`, OPTS[S.r],
        OPTS.map((x, i) => [x, S.why[i]]).filter((_, i) => i !== S.r), S.sol);
    },
    // scaling of the gap or width
    () => {
      const gap = pick([true, false]);
      const t = (c, l, z) => `$C$ ${c}, $L$ ${l}, $Z_0$ ${z}`;
      const [up, dn] = gap ? ['doubles', 'halves'] : ['halves', 'doubles'];
      return MC('Scaling a parallel-plate line', md`The ${gap ? 'gap $d$' : 'width $W$'} of a parallel-plate line is doubled; the filling stays the same. Then…`, t(dn, up, up),
        [[t(dn, up, 'is unchanged'), md`$Z_0 = \sqrt{L/C}$, and $L/C$ changes by a factor of 4, so $Z_0$ changes by 2. It is $v$ that is unchanged.`],
          [t(up, dn, dn), md`Backward. $\text{GF} = W/d$ ${dn}, and $C = \epsilon\,\text{GF}$ follows it.`],
          [t(dn, dn, 'is unchanged'), md`$L = \mu/\text{GF}$ moves opposite to $C$.`],
          ['$C$, $L$ and $Z_0$ are all unchanged', md`Only $v$ is shape-free. $C$, $L$ and $Z_0$ all depend on GF.`]],
        md`$\text{GF} = W/d$ ${gap ? 'halves' : 'doubles'}. $C = \epsilon\,\text{GF}$ ${gap ? 'halves' : 'doubles'}, $L = \mu/\text{GF}$ ${gap ? 'doubles' : 'halves'}, and $Z_0 = \eta/\text{GF}$ ${gap ? 'doubles' : 'halves'}. $v$ does not change.`);
    },
    // G from sigma
    () => {
      const [gf, gfT] = pick([[5, '5'], [10, '10'], [20, '20'], [2 * PI, '2\\pi']]);
      const s = pick([1e-4, 1e-3, 2e-3, 5e-5]);
      return MC('G from σ', md`A line has $\text{GF} = ${gfT}$ and its filling has $\sigma = ${p(s)}$ S/m. Then $G$ is…`, o(s * gf, '\\text{S/m}'),
        [[o(s / gf, '\\text{S/m}'), md`That divides by GF. $G = \sigma\,\text{GF}$, like $C = \epsilon\,\text{GF}$.`],
          [o(s, '\\text{S/m}'), md`That leaves out the shape. $G = \sigma\,\text{GF}$.`],
          [o(gf / s, '\\text{S/m}'), md`That is $\text{GF}/\sigma$, a resistance-like quantity, not a conductance.`]],
        md`$G = \sigma\,\text{GF} = (${p(s)})(${gfT}) = ${p(+(s * gf).toPrecision(3))}$ S/m.`);
    },
  ]);

  // pairs (Z0, v) whose L = Z0/v and C = 1/(Z0 v) are clean
  const ZV = [[50, 1e8], [50, 2e8], [100, 1e8], [100, 2e8], [25, 2e8], [200, 1e8], [25, 1e8], [250, 2e8], [125, 2e8]];
  const nH = (L) => p(+(L * 1e9).toPrecision(3)), pF = (Cv) => p(+(Cv * 1e12).toPrecision(3));

  GENS.rf_w5t_vz = () => one([
    // v from epsilon_r
    () => {
      const [er, n] = pick([[2.25, 1.5], [4, 2], [9, 3], [16, 4], [6.25, 2.5]]);
      return MC('Speed on a filled line', md`A coax is filled with a dielectric of $\epsilon_r = ${er}$, $\mu = \mu_0$. Waves on it travel at…`, o(CC / n, MS),
        [[o(CC / er, MS), md`That divides by $\epsilon_r$. The speed is $c/\sqrt{\epsilon_r}$.`],
          [o(CC * n, MS), md`Nothing travels faster than $c$. A filling slows the wave: divide by $\sqrt{\epsilon_r}$.`],
          [o(CC, MS), md`That is the speed in air. This line is filled.`],
          ['a speed that also depends on $b/a$', md`$v = 1/\sqrt{LC} = 1/\sqrt{\mu\epsilon}$. The geometry cancels.`]],
        md`$v = c/\sqrt{\epsilon_r} = 3\times10^8/${n} = ${p(CC / n)}$ m/s, whatever the cross-section.`);
    },
    // Z0 of plates
    () => {
      const gf = pick([10, 20, 30, 60]), [er, n] = pick([[4, 2], [9, 3]]);
      const k = 120 / (n * gf);
      const om = (x) => `$${piT(x)}\\ \\Omega$`;
      return MC('Z₀ of plates', md`A parallel-plate line has $W/d = ${gf}$ and a filling with $\epsilon_r = ${er}$, $\mu = \mu_0$. Its $Z_0$ is…`, om(k),
        [[om(120 / gf), md`That uses $\eta_0 = 120\pi$. In the filling, $\eta = 120\pi/\sqrt{\epsilon_r}$.`],
          [om(120 / (er * gf)), md`That divides $\eta_0$ by $\epsilon_r$. $\eta$ has $\sqrt{\epsilon_r}$.`],
          [om((120 * gf) / n), md`That multiplies $\eta$ by GF. $Z_0 = \eta/\text{GF}$.`],
          [om((120 * n) / gf), md`That multiplies $\eta_0$ by $\sqrt{\epsilon_r}$. A denser filling lowers $\eta$.`]],
        md`$\eta = 120\pi/${n} = ${piT(120 / n)}\ \Omega$, so $Z_0 = \eta/\text{GF} = ${piT(k)} \approx ${p(+(k * PI).toPrecision(3))}\ \Omega$.`);
    },
    // Z0 of a coax
    () => {
      const ln = pick([0.5, 1.5, 2, 2.5, 3]), [er, n] = pick([[2.25, 1.5], [4, 2], [9, 3]]);
      const z = (60 * ln) / n;
      return MC('Z₀ of a coax', md`A coax has $\ln(b/a) = ${ln}$ and a filling with $\epsilon_r = ${er}$, $\mu = \mu_0$. Its $Z_0$ is…`, o(z, OHM),
        [[o(60 * ln, OHM), md`That is the air value, $60\ln(b/a)$. The filling divides it by $\sqrt{\epsilon_r}$.`],
          [o((60 * ln) / er, OHM), md`That divides by $\epsilon_r$. $\eta$ has $\sqrt{\epsilon_r}$.`],
          [o((120 * PI * ln) / n, OHM), md`That forgets the $2\pi$: $Z_0 = \eta\ln(b/a)/2\pi$.`],
          [o(60 / (ln * n), OHM), md`That puts $\ln(b/a)$ upside down. $Z_0 = \eta/\text{GF}$ and $\text{GF} = 2\pi/\ln(b/a)$, so the log is on top.`],
          [o((60 * ln * Math.LOG10E) / n, OHM), md`That uses $\log_{10}$. The coax log is natural.`]],
        md`$Z_0 = \frac{\eta}{2\pi}\ln\frac{b}{a} = \frac{60}{\sqrt{\epsilon_r}}\ln\frac{b}{a} = \frac{60\cdot${ln}}{${n}} = ${p(+z.toPrecision(3))}\ \Omega$.`);
    },
    // Z0 or v from L and C
    () => {
      const [Z, v] = pick(ZV), L = Z / v, Cv = 1 / (Z * v);
      const given = md`A line has $L = ${nH(L)}$ nH/m and $C = ${pF(Cv)}$ pF/m.`;
      return pick([true, false])
        ? MC('Z₀ from L and C', md`${given} Its $Z_0$ is…`, o(Z, OHM),
          [[o(L / Cv, OHM), md`That is $L/C$. $Z_0 = \sqrt{L/C}$.`],
            [o(Math.sqrt(Cv / L), OHM), md`That is $\sqrt{C/L} = 1/Z_0$, upside down.`],
            [o(1 / Math.sqrt(L * Cv), OHM), md`That is $1/\sqrt{LC}$, the speed, not the impedance.`]],
          md`$Z_0 = \sqrt{L/C} = \sqrt{${p(+(L / Cv).toPrecision(4))}} = ${p(Z)}\ \Omega$.`)
        : MC('v from L and C', md`${given} Waves on it travel at…`, o(v, MS),
          [[o(1 / (L * Cv), MS), md`That is $1/(LC)$, without the square root.`],
            [o(v / (2 * PI), MS), md`That is $1/(2\pi\sqrt{LC})$, the resonant frequency formula of an $LC$ circuit. Here there is no $2\pi$.`],
            [o(Math.sqrt(L / Cv), MS), md`That is $\sqrt{L/C} = Z_0$, an impedance.`],
            [o(CC, MS), md`That assumes an air filling. Compute $1/\sqrt{LC}$.`]],
          md`$LC = ${p(+(L * Cv).toPrecision(3))}$ s²/m², so $v = 1/\sqrt{LC} = ${p(v)}$ m/s.`);
    },
    // L or C from Z0 and v
    () => {
      const [Z, v] = pick(ZV), L = Z / v, Cv = 1 / (Z * v);
      const given = md`A line has $Z_0 = ${p(Z)}\ \Omega$ and $v = ${p(v)}$ m/s.`;
      return pick([true, false])
        ? MC('L from Z₀ and v', md`${given} Its $L$ is…`, `$${nH(L)}$ nH/m`,
          [[`$${nH(Z / CC)}$ nH/m`, md`That uses $c$ instead of the line's own $v$.`],
            [`$${pF(1 / (Z * v))}$ nH/m`, md`That is $1/(Z_0v)$ in pF/m, which is $C$, not $L$.`],
            [`$${nH(Z / v / (2 * PI))}$ nH/m`, md`That divides by $2\pi$, as if $v$ were an angular frequency. $L = Z_0/v$ exactly.`],
            [`$${nH(v / Z)}$ nH/m`, md`That is $v/Z_0$, upside down. $\sqrt{L/C}\cdot\sqrt{LC} = L$, so $L = Z_0/v$.`]],
          md`$L = Z_0/v = ${p(Z)}/${p(v)} = ${nH(L)}$ nH/m.`)
        : MC('C from Z₀ and v', md`${given} Its $C$ is…`, `$${pF(Cv)}$ pF/m`,
          [[`$${pF(1 / (Z * CC))}$ pF/m`, md`That uses $c$ instead of the line's own $v$.`],
            [`$${nH(Z / v)}$ pF/m`, md`That is $Z_0/v$ in nH/m, which is $L$, not $C$.`],
            [`$${pF(1 / (2 * PI * Z * v))}$ pF/m`, md`That divides by $2\pi$, as if $v$ were an angular frequency. $C = 1/(Z_0v)$ exactly.`]],
          md`$C = 1/(Z_0v) = 1/(${p(Z)}\cdot${p(v)}) = ${pF(Cv)}$ pF/m.`);
    },
    // epsilon_r from a delay
    () => {
      const [ns, er] = pick([[5, 2.25], [20 / 3, 4], [10, 9], [25 / 6, 1.5625]]);
      const nsT = TL.frac(ns);
      return MC('Filling from a delay', md`A pulse needs $${nsT}$ ns to travel 1 m of a nonmagnetic cable. Its $\epsilon_r$ is…`, `$${p(er)}$`,
        [[`$${p(+Math.sqrt(er).toPrecision(3))}$`, md`That is $c/v$. $v = c/\sqrt{\epsilon_r}$, so $\epsilon_r = (c/v)^2$.`],
          [`$${p(+(1 / er).toPrecision(3))}$`, md`That is $(v/c)^2$, upside down. A slower wave means a larger $\epsilon_r$.`],
          [`$${p(+(er * er).toPrecision(3))}$`, md`That squares twice. $\epsilon_r = (c/v)^2$.`]],
        md`$v = 1\ \text{m}/${nsT}\ \text{ns} = ${p(+(1e9 / ns).toPrecision(4))}$ m/s. $c/v = ${p(+Math.sqrt(er).toPrecision(3))}$, so $\epsilon_r = ${p(er)}$.`);
    },
  ]);

  GENS.rf_w5t_wave = () => one([
    // which way does it go
    () => {
      const F = pick([
        ['f(t - z/v)', 1], ['f(t + z/v)', -1], ['f(z - vt)', 1], ['f(z + vt)', -1], ['5\\cos(\\omega t - \\beta z)', 1], ['5\\cos(\\omega t + \\beta z)', -1], ['e^{-(t + z/v - 2)^2}', -1], ['u(t - z/v - 3)', 1],
      ]);
      const r = F[1] > 0 ? 'toward $+z$, at speed $v$' : 'toward $-z$, at speed $v$';
      const w = F[1] > 0 ? 'toward $-z$, at speed $v$' : 'toward $+z$, at speed $v$';
      return MC('Which way?', md`On a line, $V(z,t) = ${F[0]}$. This wave travels…`, r,
        [[w, md`Follow one point of the shape: keep the argument constant. ${F[1] > 0 ? 'As $t$ grows, $z$ must grow.' : 'As $t$ grows, $z$ must shrink.'}`],
          ['nowhere: it is a standing wave', md`A standing wave is a sum of two waves going opposite ways. One function of one argument moves.`],
          ['both ways at once', md`Both ways needs two terms, $f(t - z/v) + g(t + z/v)$. Here there is one.`],
          [`${F[1] > 0 ? 'toward $+z$' : 'toward $-z$'}, at speed $1/v$`, md`Set the argument constant: $z$ changes by $v$ per unit time, not $1/v$.`]],
        md`Hold the argument constant and let $t$ grow: ${F[1] > 0 ? '$z$ must grow too, so the shape moves toward $+z$' : '$z$ must shrink, so the shape moves toward $-z$'}.`);
    },
    // the current of a wave
    () => {
      const [A, Z] = pick([[5, 25], [10, 50], [30, 75], [60, 150], [20, 100], [12, 50], [15, 75], [45, 150]]);
      const fw = pick([true, false]), I = (fw ? 1 : -1) * (A / Z);
      return MC('Current of a wave', md`On a $${Z}\ \Omega$ line, $V = ${A}\,u(t ${fw ? '-' : '+'} z/v)$ V, a step going toward ${fw ? '$+z$' : '$-z$'}. Behind its front, $I$ (positive toward $+z$) is…`, o(I, '\\text{A}'),
        [[o(-I, '\\text{A}'), md`${fw ? 'A forward wave has $I = +V/Z_0$.' : 'A backward wave has $I = -V/Z_0$: its power flows toward $-z$.'}`],
          [o((fw ? 1 : -1) * A * Z, '\\text{A}'), md`That multiplies by $Z_0$. $I = \pm V/Z_0$.`],
          [o(I / 2, '\\text{A}'), md`Nothing is split between the conductors. Each carries the full $I$, one forward and one back.`],
          [o((fw ? 1 : -1) * (Z / A), '\\text{A}'), md`That is $Z_0/V$, upside down.`]],
        md`${fw ? 'Forward' : 'Backward'} wave: $I = ${fw ? '+' : '-'}V/Z_0 = ${fw ? '' : '-'}${A}/${Z} = ${p(+I.toPrecision(3))}$ A.`);
    },
    // the arrival time
    () => {
      const l = pick([100, 150, 300, 600]), [er, n] = pick([[2.25, 1.5], [4, 2], [9, 3]]);
      const t = (l * n) / CC;
      const us = (x) => `$${p(+(x * 1e6).toPrecision(3))}\\ \\mu\\text{s}$`;
      return MC('Arrival time', md`A step is switched onto a line at $t = 0$, $z = 0$. The line is $${l}$ m long and filled with $\epsilon_r = ${er}$ ($\mu_0$). The front reaches the far end at…`, us(t),
        [[us((2 * l * n) / CC), md`That is the round trip, $2l/v$. One way is $l/v$.`],
          [us((l * er) / CC), md`That uses $v = c/\epsilon_r$. The speed is $c/\sqrt{\epsilon_r}$.`],
          [us(l / CC / n), md`That multiplies the speed by $\sqrt{\epsilon_r}$. A filling slows the wave.`],
          [us((l * n) / CC / 2), md`That is half the trip. The front starts at $z = 0$.`]].filter((x) => x[0] !== us(t)),
        md`$v = c/\sqrt{\epsilon_r} = ${p(CC / n)}$ m/s, so $T = l/v = ${l}/${p(CC / n)} = ${p(+(t * 1e6).toPrecision(3))}\ \mu$s.`);
    },
    // the power of one wave
    () => {
      const [V, Z] = pick([[10, 50], [20, 100], [30, 75], [12, 72], [60, 150], [15, 25]]);
      return MC('Power in one wave', md`A single forward step of $${V}$ V travels on a $${Z}\ \Omega$ line. Behind its front it carries a power of…`, o((V * V) / Z, '\\text{W}'),
        [[o((V * V) / (2 * Z), '\\text{W}'), md`The $\tfrac12$ belongs to the average of a sinusoid. A constant step carries $V^2/Z_0$.`],
          [o(V / Z, '\\text{W}'), md`That is the current $V/Z_0$, in amperes.`],
          [o(V * V * Z, '\\text{W}'), md`That multiplies by $Z_0$. $p = VI = V^2/Z_0$.`],
          [o(V * Z, '\\text{W}'), md`$VZ_0$ has units of V·Ω. Power is $V\cdot I$ with $I = V/Z_0$.`]],
        md`$I = V/Z_0 = ${p(+(V / Z).toPrecision(3))}$ A and $p = VI = V^2/Z_0 = ${p(+((V * V) / Z).toPrecision(3))}$ W, toward $+z$.`);
    },
    // which is not a solution
    () => {
      const bad = pick([
        ['f(t - 2z/v)', md`It moves at $v/2$. Differentiating twice gives $\partial^2V/\partial z^2 = (4/v^2)f''$, which is not $LC\,f''$.`],
        ['(t - z/v)(t + z/v)', md`It is $t^2 - z^2/v^2$: $\partial^2V/\partial z^2 = -2/v^2$ while $LC\,\partial^2V/\partial t^2 = +2/v^2$.`],
        ['\\sin(t)\\,\\cos(t)\\,z', md`Its second $z$-derivative is zero, but its second $t$-derivative is not.`],
      ]);
      const good = [['\\cos\\big(\\omega(t - z/v)\\big)', md`A function of $t - z/v$ alone: a forward wave.`], ['e^{-(t + z/v)^2}', md`A function of $t + z/v$ alone: a backward wave.`], ['3f(t - z/v) - g(t + z/v)', md`A sum of solutions solves a linear equation.`], ['(t - z/v)^2', md`Any shape of $t - z/v$ works, polynomials too.`], ['u(t + z/v - 4)', md`A delayed step going toward $-z$: a function of $t + z/v$ alone.`]];
      return MC('Not a solution', md`On a line with $v = 1/\sqrt{LC}$, which $V(z,t)$ does **not** solve $\partial^2V/\partial z^2 = LC\,\partial^2V/\partial t^2$?`, `$${bad[0]}$`,
        good.map(([x, w]) => [`$${x}$`, md`This one does solve it. ${w}`]),
        md`$V = ${bad[0]}$ fails. ${bad[1]}`);
    },
  ]);

  GENS.rf_w5t_field = () => one([
    () => {
      const E = pick([1, 2, 5, 10, 20]), dm = pick([0.5, 1, 2, 4]), Wc = pick([1, 2, 5]);
      const V = E * 1e3 * dm * 1e-3;
      return MC('V from the field', md`Between parallel plates ($W = ${Wc}$ cm, $d = ${dm}$ mm), $E_x = ${E}$ kV/m at some $z$ and $t$. The voltage between the plates there is…`, o(V, '\\text{V}'),
        [[o(E * 1e3 * Wc * 1e-2, '\\text{V}'), md`That uses the width. The voltage is $\mathbf E$ integrated across the gap: $E_xd$.`],
          [o((E * 1e3) / (dm * 1e-3), '\\text{V}'), md`That divides by $d$. $V = E_xd$.`],
          [o(V * 1000, '\\text{V}'), md`That keeps $E_x$ in V/m but puts $d$ in mm. $d = ${dm}\times10^{-3}$ m.`],
          [o(V / 2, '\\text{V}'), md`The field is uniform across the gap; nothing is halved.`]],
        md`$V = E_xd = (${E}\times10^3)(${dm}\times10^{-3}) = ${p(V)}$ V.`);
    },
    () => {
      const H = pick([2, 5, 10, 20]), Wc = pick([1, 2, 4, 5]), dm = pick([0.5, 1, 2]);
      const I = H * Wc * 1e-2;
      return MC('I from the field', md`Between parallel plates ($W = ${Wc}$ cm, $d = ${dm}$ mm), $H_y = ${H}$ A/m. The current on the top plate is…`, o(I, '\\text{A}'),
        [[o(H * dm * 1e-3, '\\text{A}'), md`That uses the gap. The surface current $H_y$ (A/m) flows across the plate's width: $I = H_yW$.`],
          [o(H / (Wc * 1e-2), '\\text{A}'), md`That divides by $W$. $H_y$ is a current per meter of width, so multiply.`],
          [o(2 * I, '\\text{A}'), md`The two plates carry $I$ in opposite directions. Each one carries $H_yW$; nothing adds.`],
          [o(H * Wc, '\\text{A}'), md`That leaves $W$ in centimeters. $W = ${Wc}\times10^{-2}$ m.`]],
        md`$I = H_yW = (${H})(${p(Wc * 1e-2)}) = ${p(+I.toPrecision(3))}$ A, toward $+z$ on the top plate and back on the bottom one.`);
    },
    () => {
      const [er, n] = pick([[1, 1], [4, 2], [9, 3]]), k = pick([5, 10, 20, 40]);
      const Z = 120 / (n * k);
      return MC('V/I from the fields', md`In a forward wave between plates with $W/d = ${k}$ and $\epsilon_r = ${er}$ ($\mu_0$), the ratio $V/I = (E_xd)/(H_yW)$ is…`, `$${piT(Z)}\\ \\Omega$`,
        [[`$${piT((120 * k) / n)}\\ \\Omega$`, md`That is $\eta W/d$. $V/I = (E_x/H_y)(d/W) = \eta\,d/W$.`],
          [`$${piT(120 / n)}\\ \\Omega$`, md`That is $\eta$ alone. The geometry adds the factor $d/W$.`],
          n > 1 ? [`$${piT(120 / (n * n * k))}\\ \\Omega$`, md`That divides $\eta_0$ by $\epsilon_r$. $\eta = \eta_0/\sqrt{\epsilon_r}$.`] : [`$${piT(240 / k)}\\ \\Omega$`, md`That doubles $\eta$. The forward wave has $E_x/H_y = \eta$ exactly.`],
          [`$${piT(60 / (n * k))}\\ \\Omega$`, md`That halves the answer. There is no $\tfrac12$ in $V/I$; it belongs to average power.`]],
        md`$E_x/H_y = \eta = ${piT(120 / n)}$ and $d/W = 1/${k}$, so $V/I = ${piT(Z)} = Z_0$, as $\eta/\text{GF}$ says.`);
    },
    () => {
      const q = pick([
        [md`In the side view, $\mathbf E$ points from the top plate down to the bottom plate. Which plate is at the higher potential?`, 'the top plate', [['the bottom plate', md`$\mathbf E$ points from high potential to low, so the plate it leaves is higher.`], ['neither: a moving wave has no potential difference', md`TEM fields make $V$ well defined in each cross-section.`], ['it depends on which way the wave travels', md`The sign of $V$ comes from $\mathbf E$ alone. The travel direction decides the sign of $I$.`]], md`$V = \int_{\text{top}}^{\text{bottom}}\mathbf E\cdot d\mathbf l = E_xd > 0$: the top plate is higher.`],
        [md`The top plate carries current $I$ toward $+z$. The bottom plate carries…`, '$I$ toward $-z$', [['$I$ toward $+z$', md`On the bottom plate $\hat n = -\hat x$, which flips $\mathbf J_s = \hat n\times\mathbf H$.`], ['no current: it is the ground', md`Ampère's law around both plates encloses zero net current: the bottom plate carries the return.`], ['$I/2$ toward $-z$', md`The return current equals the forward current.`]], md`$\mathbf J_s = \hat n\times\mathbf H$ with $\hat n = -\hat x$ on the bottom plate gives $-\hat zH_y$: the full current, coming back.`],
        [md`Why is the current on the top plate exactly $\oint\mathbf H\cdot d\mathbf l$ around it, with no displacement term?`, 'a TEM wave has no $D_z$, so no displacement current crosses a loop in a cross-section', [[md`because the filling has $\sigma = 0$`, md`$\sigma$ is about conduction current in the filling, not about displacement current through the loop.`], [md`because $\partial\mathbf D/\partial t = 0$ on a line`, md`$\mathbf D$ changes in time. Only its $z$-component is zero.`], ['because the plates are perfect conductors', md`That decides where the current sits, not whether displacement current crosses the loop.`]], md`The loop lies in a plane of constant $z$, so only $D_z$ could cross it, and TEM has $D_z = 0$.`],
        [md`The power through the gap is $E_xH_y$ times the gap's cross-section $Wd$. In circuit terms that is…`, '$VI$', [['$V^2Z_0$', md`$E_xH_yWd = (E_xd)(H_yW)$: one $V$ and one $I$, no $Z_0$.`], ['$\\tfrac12VI$', md`No $\tfrac12$: this is the instantaneous power, not a sinusoidal average.`], ['$VI/(Wd)$', md`The area multiplies the Poynting vector, it does not divide.`]], md`$E_xH_yWd = (E_xd)(H_yW) = VI$.`],
      ]);
      return MC('Fields and circuit', q[0], q[1], q[2], q[3]);
    },
  ]);

  // ================================================================ lesson 1, level 2 and 3
  GENS.w5t_pp = () => {
    const [Wc, dm] = pick([[1, 1], [2, 1], [3, 1], [2, 0.5], [4, 2], [5, 1], [1.5, 0.5]]);
    const [er, n] = pick([[1, 1], [2.25, 1.5], [4, 2], [9, 3]]);
    const sig = pick([0, 1e-5, 1e-4]);
    const gf = (Wc * 10) / dm, Cv = er * EPS0 * gf, L = MU0 / gf, Z = (120 * PI) / n / gf, v = CC / n;
    const parts = [
      NT('C', Cv * 1e12, 'pF/m', [[EPS0 * gf * 1e12, 'That drops the filling: use ε = εr ε0.'], [er * EPS0 / gf * 1e12, 'That uses d/W. GF = W/d.']]),
      NT('L', L * 1e9, 'nH/m', [[MU0 * gf * 1e9, 'That multiplies μ0 by GF. L = μ/GF.']]),
      NT('Z_0', Z, 'Ω', [[(120 * PI) / gf, 'That uses η0. In the filling η = 120π/√εr.']]),
      NT('v', v, 'm/s', [[CC / er, 'v = c/√εr, not c/εr.']]),
    ];
    if (sig) parts.push(N('G', sig * gf, 'S/m'));
    return {
      title: 'A parallel-plate line, from its cross-section',
      q: md`A parallel-plate line has width $W = ${Wc}$ cm and gap $d = ${dm}$ mm. The filling has $\epsilon = ${er}\epsilon_0$, $\mu = \mu_0$${sig ? md` and $\sigma = ${p(sig)}$ S/m` : md` and no loss`}. Use $\epsilon_0 = \frac{10^{-9}}{36\pi}$ F/m. Find $C$ (pF/m), $L$ (nH/m), $Z_0$ and $v$${sig ? ', and G' : ''}.`,
      plan: plan(md`Before any numbers: what is the quickest route to all of these?`, md`Find $\text{GF} = W/d$, then $C = \epsilon\,\text{GF}$, $L = \mu/\text{GF}$, $Z_0 = \eta/\text{GF}$; $v$ from the filling alone`,
        [[md`Solve Laplace's equation for the potential between the plates first`, md`For plates the field is uniform; GF $= W/d$ is already the answer of that calculation.`], [md`Use $\text{GF} = 2\pi/\ln(b/a)$`, md`That is the coax. Plates have $\text{GF} = W/d$.`], [md`Find $v$ from $W$ and $d$, then $L$ and $C$ from $v$`, md`$v = 1/\sqrt{\mu\epsilon}$ does not depend on $W$ or $d$, and one number cannot give both $L$ and $C$.`]],
        md`All the geometry is in one number, GF. Every per-meter value is the filling's constant times or divided by it.`),
      parts,
      hints: [md`$\text{GF} = W/d$ with both in the same unit: $${Wc * 10}/${dm}$.`, md`$C = \epsilon\,\text{GF}$, $L = \mu_0/\text{GF}$, $Z_0 = (120\pi/\sqrt{\epsilon_r})/\text{GF}$, $v = c/\sqrt{\epsilon_r}$.`],
      sol: md`
        **Step 1: GF.** In millimeters, $W/d = ${Wc * 10}/${dm}$:
        $$\text{GF} = ${p(gf)}$$
        **Step 2: C.**
        $$C = \epsilon\,\text{GF} = ${p(er * gf)}\epsilon_0 = \frac{${p(er * gf)}\times10^{-9}}{36\pi}$$
        That is $${f(Cv * 1e12)}$ pF/m.

        **Step 3: L.**
        $$L = \frac{\mu_0}{\text{GF}} = \frac{4\pi\times10^{-7}}{${p(gf)}} = ${f(L * 1e9)}\ \text{nH/m}$$
        ${sig ? md`**Step 3b: G.**
        $$G = \sigma\,\text{GF} = (${p(sig)})(${p(gf)}) = ${f(sig * gf)}\ \text{S/m}$$
        ` : ''}**Step 4: v, from the filling.**
        $$v = \frac{c}{\sqrt{\epsilon_r}} = \frac{3\times10^8}{${p(n)}} = ${f(v)}\ \text{m/s}$$
        **Step 5: Z₀.** $\eta = 120\pi/${p(n)} = ${f((120 * PI) / n)}\ \Omega$, so
        $$Z_0 = \frac{\eta}{\text{GF}} = \frac{${f((120 * PI) / n)}}{${p(gf)}} = ${f(Z)}\ \Omega$$
        **Check.** $\sqrt{L/C} = \sqrt{${f(L)}/${f(Cv)}} = ${f(Math.sqrt(L / Cv))}\ \Omega$ ✓, and $L = Z_0/v = ${f(Z / v * 1e9)}$ nH/m ✓.
      `,
    };
  };

  // coax ratios with their natural logs
  const BA = [
    { r: 'e', ln: 1, lnT: '1' }, { r: 'e^2', ln: 2, lnT: '2' }, { r: '4', ln: Math.log(4), lnT: '1.386' }, { r: '2', ln: Math.log(2), lnT: '0.693' },
    { r: '3', ln: Math.log(3), lnT: '1.099' }, { r: 'e^{1.5}', ln: 1.5, lnT: '1.5' }, { r: '5', ln: Math.log(5), lnT: '1.609' }, { r: '10', ln: Math.log(10), lnT: '2.303' },
  ];
  GENS.w5t_coax = () => {
    const B = pick(BA), [er, n] = pick([[1, 1], [2.25, 1.5], [4, 2]]), a = pick([0.5, 1, 0.25]);
    const gf = (2 * PI) / B.ln, Cv = er * EPS0 * gf, L = MU0 / gf, Z = (60 * B.ln) / n, v = CC / n;
    const bnum = { e: Math.E, 'e^2': Math.E * Math.E, 'e^{1.5}': Math.exp(1.5) }[B.r] ?? +B.r;
    return {
      title: 'A coax, from its radii',
      q: md`A coax has inner radius $a = ${a}$ mm and outer radius $b = ${p(+(a * bnum).toPrecision(3))}$ mm, so $b/a = ${B.r}$ and $\ln(b/a) = ${B.lnT}$. The filling has $\epsilon_r = ${er}$, $\mu = \mu_0$, no loss. Find GF, $C$ (pF/m), $L$ (nH/m), $Z_0$ and $v$.`,
      plan: plan(md`What sets each of the five numbers?`, md`GF from $\ln(b/a)$ alone; $C$, $L$, $Z_0$ from GF and the filling; $v$ from the filling alone`,
        [[md`Everything scales with the radii $a$ and $b$ themselves`, md`Only the ratio $b/a$ enters: scale the whole cable up and nothing changes.`], [md`$v$ depends on $b/a$, so find it last`, md`$v = 1/\sqrt{\mu\epsilon}$: the GF cancels in $LC$.`], [md`Use $\text{GF} = b/a$`, md`That is the plate formula's pattern. For a coax, Gauss's law gives $2\pi/\ln(b/a)$.`]],
        md`Only the ratio $b/a$ matters, through its natural log. The radii's size never enters.`),
      parts: [
        NT('\\text{GF}', gf, '', [[1 / gf, 'That is ln(b/a)/2π, which is 1/GF.'], [2 * PI * B.ln, 'That multiplies by ln(b/a). GF = 2π/ln(b/a).']]),
        NT('C', Cv * 1e12, 'pF/m', [[EPS0 * gf * 1e12, 'That drops the filling: ε = εr ε0.']]),
        NT('L', L * 1e9, 'nH/m', [[MU0 * gf * 1e9, 'That multiplies μ0 by GF. L = μ/GF.']]),
        NT('Z_0', Z, 'Ω', [[60 * B.ln, 'That is the air value. Divide by √εr.'], [(60 * B.ln) / er, 'That divides by εr; η has √εr.']]),
        N('v', v, 'm/s'),
      ],
      hints: [md`$\text{GF} = 2\pi/\ln(b/a) = 2\pi/${B.lnT}$.`, md`$Z_0 = \eta/\text{GF} = 60\ln(b/a)/\sqrt{\epsilon_r}$.`],
      sol: md`
        **Step 1: GF.** Only the ratio matters:
        $$\text{GF} = \frac{2\pi}{\ln(b/a)} = \frac{2\pi}{${B.lnT}} = ${f(gf)}$$
        **Step 2: C.**
        $$C = \epsilon\,\text{GF} = (${er})(8.84\ \text{pF/m})(${f(gf)}) = ${f(Cv * 1e12)}\ \text{pF/m}$$
        **Step 3: L.** No $\epsilon$ in it:
        $$L = \frac{\mu_0}{\text{GF}} = \frac{1257\ \text{nH/m}}{${f(gf)}} = ${f(L * 1e9)}\ \text{nH/m}$$
        **Step 4: Z₀.**
        $$Z_0 = \frac{\eta}{\text{GF}} = \frac{60\ln(b/a)}{\sqrt{\epsilon_r}} = \frac{60(${B.lnT})}{${p(n)}} = ${f(Z)}\ \Omega$$
        **Step 5: v.**
        $$v = \frac{c}{\sqrt{\epsilon_r}} = ${f(v)}\ \text{m/s}$$
        **Check.** $L/C = ${f(L / Cv)}$ and its root is $${f(Math.sqrt(L / Cv))}\ \Omega$ ✓. $1/\sqrt{LC} = ${f(1 / Math.sqrt(L * Cv))}$ m/s ✓.
      `,
    };
  };

  // reading a cable from its Z0 and its delay
  GENS.w5t_read = () => {
    const Z = pick([50, 75, 100, 60]), [v, er, ns] = pick([[3e8, 1, '3.33'], [2e8, 2.25, '5'], [1.5e8, 4, '6.67'], [1e8, 9, '10']]);
    const L = Z / v, Cv = 1 / (Z * v), gf = (120 * PI) / Math.sqrt(er) / Z, ln = (2 * PI) / gf;
    return {
      title: 'Reading a cable from Z₀ and its delay',
      q: md`A nonmagnetic coax is labeled $Z_0 = ${Z}\ \Omega$. A pulse takes $${ns}$ ns to travel 1 m of it. Find $v$, the filling's $\epsilon_r$, $L$, $C$, and the cable's $\ln(b/a)$.`,
      plan: plan(md`You know $Z_0$ and $v$. What gives $L$ and $C$ fastest?`, md`$L = Z_0/v$ and $C = 1/(Z_0v)$; then $\epsilon_r = (c/v)^2$ and $\ln(b/a)$ from $Z_0 = 60\ln(b/a)/\sqrt{\epsilon_r}$`,
        [[md`You cannot find $L$ and $C$ without the radii`, md`$Z_0$ and $v$ are two equations in the two unknowns $L$ and $C$.`], [md`$L = Z_0v$ and $C = Z_0/v$`, md`Both are upside down. $Z_0/v = \sqrt{L/C}\cdot\sqrt{LC} = L$, and $Z_0v = 1/C$.`], [md`$\epsilon_r = c/v$`, md`$v = c/\sqrt{\epsilon_r}$, so $\epsilon_r$ is the **square** of $c/v$.`]],
        md`$Z_0/v = \sqrt{L/C}\sqrt{LC} = L$ and $Z_0v = 1/C$. Two measurements, two unknowns.`),
      parts: [
        N('v', v, 'm/s'),
        NT('\\epsilon_r', er, '', [[Math.sqrt(er), 'That is c/v. εr = (c/v)².']].filter((t) => er !== 1)),
        NT('L', L * 1e9, 'nH/m', [[Z * v * 1e9, 'L = Z0/v, not Z0·v.']]),
        NT('C', Cv * 1e12, 'pF/m', [[Z / v * 1e12, 'That is Z0/v = L. C = 1/(Z0 v).']]),
        N('\\ln(b/a)', ln, ''),
      ],
      hints: [md`$v = 1\ \text{m}/${ns}\ \text{ns}$. Then $L = Z_0/v$ and $C = 1/(Z_0v)$.`, md`$Z_0 = \frac{60}{\sqrt{\epsilon_r}}\ln\frac{b}{a}$.`],
      sol: md`
        **Step 1: v.** One meter in $${ns}$ ns:
        $$v = ${p(v)}\ \text{m/s}$$
        **Step 2: εr.** $v = c/\sqrt{\epsilon_r}$, so
        $$\epsilon_r = \left(\frac{c}{v}\right)^2 = (${p(CC / v)})^2 = ${p(er)}$$
        **Step 3: L and C.** Multiply and divide the two boxes, $Z_0 = \sqrt{L/C}$ and $v = 1/\sqrt{LC}$:
        $$L = \frac{Z_0}{v} = \frac{${Z}}{${p(v)}} = ${f(L * 1e9)}\ \text{nH/m}$$
        $$C = \frac{1}{Z_0v} = \frac{1}{(${Z})(${p(v)})} = ${f(Cv * 1e12)}\ \text{pF/m}$$
        **Step 4: the shape.** $Z_0 = 60\ln(b/a)/\sqrt{\epsilon_r}$, so
        $$\ln\frac{b}{a} = \frac{Z_0\sqrt{\epsilon_r}}{60} = \frac{(${Z})(${p(Math.sqrt(er))})}{60} = ${f(ln)}$$
        That is $b/a \approx ${f(Math.exp(ln))}$.

        **Check.** $\sqrt{L/C} = ${f(Math.sqrt(L / Cv))}\ \Omega$ ✓ and $LC = ${f(L * Cv)}$ s²/m², whose root gives $${f(1 / Math.sqrt(L * Cv))}$ m/s ✓.
      `,
    };
  };

  // the skill HW 11 #6 asks for: use the telegrapher's equations twice on a cosine
  GENS.w5t_tele = () => {
    const [Z, v] = pick([[50, 2e8], [100, 1e8], [100, 2e8], [25, 2e8], [50, 1e8]]);
    const L = Z / v, Cv = 1 / (Z * v), b = pick([1, 2, 3, 4, 5]), w = b * v, V0 = pick([2, 4, 5, 10, 20]);
    const fw = pick([true, false]), sg = fw ? '-' : '+', I0 = (fw ? 1 : -1) * (V0 / Z);
    return {
      title: 'Telegrapher equations, used twice',
      q: md`A lossless line has $L = ${nH(L)}$ nH/m and $C = ${pF(Cv)}$ pF/m. On it, $V(z,t) = ${V0}\cos(\omega t ${sg} \beta z)$ V with $\omega = ${p(w)}$ rad/s and $\beta > 0$. Use the telegrapher's equations to find $\beta$, the current $I(z,t) = I_0\cos(\omega t ${sg} \beta z)$ (give $I_0$ with its sign), and the wavelength.`,
      plan: plan(md`How do you get $\beta$ and $I$ from $V$ alone?`, md`Put $V$ into $-\partial V/\partial z = L\,\partial I/\partial t$ to get $I$; then put $I$ into $-\partial I/\partial z = C\,\partial V/\partial t$ and demand it gives back $V$`,
        [[md`$\beta = \omega/c$, then $I = V/Z_0$`, md`The line's speed is $1/\sqrt{LC}$, not necessarily $c$, and the sign of $I$ depends on the direction.`], [md`Use only the first equation; it gives $\beta$ and $I$ at once`, md`One equation relates $I$ to $V$ for any $\beta$. The second equation is what fixes $\beta$.`], [md`$\beta = \omega\sqrt{L/C}$`, md`That has units of Ω·rad/s. $\beta = \omega\sqrt{LC}$.`]],
        md`Two equations, two unknowns ($I_0$ and $\beta$): the first gives $I_0$ in terms of $\beta$, the second fixes $\beta$.`),
      parts: [
        NT('\\beta', b, 'rad/m', [[w / CC, 'That is ω/c. The speed on this line is 1/√(LC), not c.']]),
        NT('I_0', I0, 'A', [[-I0, fw ? 'A wave going toward +z has I = +V/Z0.' : 'A wave going toward −z has I = −V/Z0.'], [V0 * Z, 'That multiplies by Z0.']]),
        N('\\lambda', (2 * PI) / b, 'm'),
      ],
      hints: [md`$-\partial V/\partial z = L\,\partial I/\partial t$. Differentiate the cosine in $z$, then integrate in $t$.`, md`The second equation gives $\beta^2 = \omega^2LC$, and $I_0 = \pm V_0/Z_0$.`],
      sol: md`
        Write $\theta = \omega t ${sg} \beta z$ for short.

        **Step 1: the first equation.** Differentiate $V$ in $z$. The chain rule brings out $\partial\theta/\partial z = ${fw ? '-' : '+'}\beta$, and the derivative of $\cos$ is $-\sin$:
        $$\frac{\partial V}{\partial z} = ${fw ? '' : '-'}${V0}\beta\sin\theta$$
        The first telegrapher's equation sets $-\partial V/\partial z$ equal to $L\,\partial I/\partial t$:
        $$L\frac{\partial I}{\partial t} = ${fw ? '-' : ''}${V0}\beta\sin\theta$$
        Integrate in time. Since $\partial\theta/\partial t = \omega$, the integral of $\sin\theta$ is $-\cos\theta/\omega$:
        $$I = ${fw ? '' : '-'}\frac{${V0}\beta}{\omega L}\cos\theta$$
        **Step 2: the second equation.** Differentiate this $I$ in $z$ (again $\partial\theta/\partial z = ${fw ? '-' : '+'}\beta$). In both directions the signs combine to
        $$-\frac{\partial I}{\partial z} = -\frac{${V0}\beta^2}{\omega L}\sin\theta$$
        The right side of the second equation is
        $$C\frac{\partial V}{\partial t} = -${V0}\omega C\sin\theta$$
        The two must be equal for every $\theta$:
        $$\frac{\beta^2}{\omega L} = \omega C$$
        Solve for $\beta$:
        $$\beta = \omega\sqrt{LC}$$
        **Step 3: numbers.** $\sqrt{LC} = \sqrt{(${nH(L)}\times10^{-9})(${pF(Cv)}\times10^{-12})} = ${f(1 / v)}$ s/m, so
        $$\beta = (${p(w)})(${f(1 / v)}) = ${b}\ \text{rad/m}$$
        **Step 4: the current.** $\frac{\beta}{\omega L} = \sqrt{LC}/L = \sqrt{C/L} = 1/Z_0$, and $Z_0 = \sqrt{L/C} = ${Z}\ \Omega$:
        $$I_0 = ${fw ? '+' : '-'}\frac{${V0}}{${Z}} = ${f(I0)}\ \text{A}$$
        The sign is ${fw ? 'plus because the wave travels toward $+z$' : 'minus because the wave travels toward $-z$'}.

        **Step 5: λ.**
        $$\lambda = \frac{2\pi}{\beta} = ${f((2 * PI) / b)}\ \text{m}$$
        **Speed path.** $\beta = \omega/v$ with $v = 1/\sqrt{LC}$; $I_0 = \pm V_0/Z_0$ with the sign of the direction. The derivation is what a "use the telegrapher's equations" problem wants on paper.
      `,
    };
  };

  // level 3: Spring 2024 #3 extended
  GENS.w5t_exam1 = () => {
    const B = pick(BA.filter((x) => ['e', 'e^2', '4', '3', 'e^{1.5}'].includes(x.r))), [er, n] = pick([[2.25, 1.5], [4, 2], [9, 3]]);
    const gf = (2 * PI) / B.ln, Cv = er * EPS0 * gf, L = MU0 / gf, Z = (60 * B.ln) / n, v = CC / n;
    const V0 = pick([10, 12, 20, 30]), len = pick([100, 200, 300, 600]);
    return {
      title: 'A coax from first principles, then a wave on it',
      q: md`A coax has inner radius $a$, outer radius $b$, and a lossless filling with permittivity $\epsilon$ and permeability $\mu$. Its capacitance per meter is $C = 2\pi\epsilon/\ln(b/a)$.

(a) Choose the inductance per meter. (b) Write $Z_0$ in terms of $a$, $b$, $\epsilon$, $\mu$ (type $\epsilon$ as <code>eps</code> and $\mu$ as <code>mu</code>).

Now take $b/a = ${B.r}$ ($\ln(b/a) = ${B.lnT}$), $\epsilon = ${er}\epsilon_0$, $\mu = \mu_0$. (c) Find $C$ in pF/m, (d) $Z_0$, (e) $v$. (f) A forward step of $${V0}$ V is launched at $z = 0$. Find its current, (g) the power it carries, and (h) when its front reaches $z = ${len}$ m.`,
      plan: plan(md`Plan the symbolic part. What is the one idea that gives $L$ from $C$?`, md`$C = \epsilon\,\text{GF}$ fixes GF; then $L = \mu/\text{GF}$ (equivalently $LC = \mu\epsilon$)`,
        [[md`Redo Gauss's law for the inductance`, md`Gauss's law gives $C$. For $L$ you would need Ampère's law and the flux, which takes longer than $LC = \mu\epsilon$.`], [md`$L = 1/(\omega^2C)$`, md`That is a resonance condition for a lumped circuit, not a property of the line.`], [md`$L = \mu\,\text{GF}$`, md`GF upside down: wider conductors mean less flux per ampere.`]],
        md`Read GF $= 2\pi/\ln(b/a)$ off $C$, then $L = \mu/\text{GF}$, $Z_0 = \eta/\text{GF}$ and $v = 1/\sqrt{\mu\epsilon}$.`),
      parts: [
        { lbl: '(a)\\ L', mc: [md`$\frac{\mu}{2\pi}\ln\frac{b}{a}$`, md`$\frac{2\pi\mu}{\ln(b/a)}$`, md`$\frac{\ln(b/a)}{2\pi\mu}$`, md`$\frac{\mu\epsilon}{2\pi}\ln\frac{b}{a}$`], a: 0,
          why: [null, md`That is $\mu\,\text{GF}$: GF upside down.`, md`That inverts $\mu$. $L$ grows with $\mu$.`, md`An extra $\epsilon$: then $LC$ would not equal $\mu\epsilon$, and the units are wrong.`] },
        { lbl: '(b)\\ Z_0', expr: 'ln(b/a)/(2*pi)*sqrt(mu/eps0)', vars: { a: [0.5, 2], b: [3, 10], mu: [1e-6, 1e-5], eps0: [1e-11, 1e-10] } },
        NT('(c)\\ C', Cv * 1e12, 'pF/m', [[EPS0 * gf * 1e12, 'That drops the filling.']]),
        NT('(d)\\ Z_0', Z, 'Ω', [[60 * B.ln, 'That is the air value; divide by √εr.']]),
        NT('(e)\\ v', v, 'm/s', [[CC, 'That is c; the filling slows the wave.']]),
        NT('(f)\\ I^+', V0 / Z, 'A', [[V0 * Z, 'That multiplies by Z0.']]),
        NT('(g)\\ P', (V0 * V0) / Z, 'W', [[(V0 * V0) / (2 * Z), 'No ½: a constant step carries V²/Z0.']]),
        NT('(h)\\ t', (len / v) * 1e6, 'µs', [[(2 * len / v) * 1e6, 'That is the round trip.']]),
      ],
      hints: [md`$C = \epsilon\,\text{GF}$ gives $\text{GF} = 2\pi/\ln(b/a)$. Then $L = \mu/\text{GF}$ and $Z_0 = \sqrt{L/C}$.`, md`For the step: $I^+ = V^+/Z_0$, $P = (V^+)^2/Z_0$, $t = z/v$.`],
      sol: md`
        **(a) L.** $C = \epsilon\,\text{GF}$ means $\text{GF} = 2\pi/\ln(b/a)$. Then
        $$L = \frac{\mu}{\text{GF}} = \frac{\mu}{2\pi}\ln\frac{b}{a}$$
        Check: $LC = \mu\epsilon$ ✓.

        **(b) Z₀.**
        $$Z_0 = \sqrt{\frac{L}{C}} = \frac{\ln(b/a)}{2\pi}\sqrt{\frac{\mu}{\epsilon}}$$
        **(c) C.** $\text{GF} = 2\pi/${B.lnT} = ${f(gf)}$:
        $$C = (${er})(8.84\ \text{pF/m})(${f(gf)}) = ${f(Cv * 1e12)}\ \text{pF/m}$$
        **(d) Z₀.** $\eta = 120\pi/${p(n)}$, so
        $$Z_0 = \frac{\eta}{\text{GF}} = \frac{60(${B.lnT})}{${p(n)}} = ${f(Z)}\ \Omega$$
        **(e) v.**
        $$v = \frac{c}{\sqrt{\epsilon_r}} = ${f(v)}\ \text{m/s}$$
        **(f) the current.** One forward wave: $I^+ = V^+/Z_0$:
        $$I^+ = \frac{${V0}}{${f(Z)}} = ${f(V0 / Z)}\ \text{A}$$
        **(g) the power.**
        $$P = V^+I^+ = \frac{(${V0})^2}{${f(Z)}} = ${f((V0 * V0) / Z)}\ \text{W}$$
        **(h) the arrival.**
        $$t = \frac{z}{v} = \frac{${len}}{${f(v)}} = ${f((len / v) * 1e6)}\ \mu\text{s}$$
        **Speed path.** GF from $C$; $L = \mu/\text{GF}$; $Z_0 = 60\ln(b/a)/\sqrt{\epsilon_r}$; $v = c/\sqrt{\epsilon_r}$. Every number after that is one division.

        **Where points go.** $L$ with GF upside down. $v$ written with $a$ and $b$ in it. $\eta_0$ instead of $\eta$. Units missing in the answer box (the SP24 box asks for them).
      `,
    };
  };

  // ================================================================ lesson 1, question bank
  EM.BANK['w5-telegraph'] = [
    Q(md`A TEM wave on a line has which field components?`,
      [md`Only components perpendicular to the direction of travel`, md`$E_z$ and $H_z$ only`, md`$E_z$ but no $H_z$`, md`All six components`], 0,
      [null, md`Those are along the travel. TEM means both fields are transverse.`, md`That would be a TM wave. TEM has neither longitudinal part.`, md`TEM has no $E_z$ and no $H_z$.`],
      md`Transverse electric and magnetic: $\mathbf E$ and $\mathbf H$ both lie in the cross-section.`),
    Q(md`On a perfect conductor's surface, which condition lets parallel plates perpendicular to $\mathbf E$ leave a plane wave unchanged?`,
      [md`$\mathbf E$ has no tangential part there and $\mathbf B$ has no normal part`, md`$\mathbf E$ has no normal part there`, md`$\mathbf H$ has no tangential part there`, md`The surface charge is zero`], 0,
      [null, md`$\mathbf E$ is entirely normal to these plates, which is allowed: it ends on surface charge.`, md`$\mathbf H$ is tangential to the plates; that is allowed and requires a surface current.`, md`The plates do carry surface charge, $\rho_s = \epsilon E_x$.`],
      md`Tangential $\mathbf E = 0$ and normal $\mathbf B = 0$ are both satisfied when $\mathbf E$ is normal to the plates and $\mathbf H$ lies in them.`),
    Q(md`Between plates $d = 2$ mm apart, $E_x = 3$ kV/m. The voltage between them is…`,
      ['6 V', '1.5 V', '6000 V', '1.5 MV'], 0,
      [null, md`That divides 3 by 2. $V = E_xd$, a product.`, md`That uses $d = 2$ instead of $d = 2\times10^{-3}$ m.`, md`That is $E_x/d$. Multiply instead.`],
      md`$V = E_xd = (3000)(0.002) = 6$ V.`),
    Q(md`The surface current on the top plate is $\mathbf J_s = \hat n\times\mathbf H$. With $\hat n = \hat x$ and $\mathbf H = \hat yH_y$, it points along…`,
      [md`$+\hat z$`, md`$-\hat z$`, md`$+\hat y$`, md`$-\hat x$`], 0,
      [null, md`$\hat x\times\hat y = +\hat z$. The minus sign is on the bottom plate.`, md`A surface current flows along the surface, perpendicular to $\mathbf H$.`, md`A surface current lies in the surface, which has normal $\hat x$.`],
      md`$\hat x\times\hat y = \hat z$: the top plate carries current toward $+z$ when $H_y > 0$.`),
    Q(md`In the derivation of $-\partial V/\partial z = L\,\partial I/\partial t$, the flux through the thin rectangle is…`,
      [md`$\mu H_y\,d\,\Delta z$`, md`$\mu H_y\,W\Delta z$`, md`$\epsilon E_x\,d\,\Delta z$`, md`$\mu H_y\,Wd$`], 0,
      [null, md`The rectangle spans the gap $d$, not the width $W$. It lies in the plane of $x$ and $z$.`, md`That is an electric flux. Faraday's law uses $\mathbf B$.`, md`$Wd$ is the cross-section. The rectangle is $d$ tall and $\Delta z$ long.`],
      md`The rectangle is $d$ by $\Delta z$, and $\mathbf B = \mu H_y\hat y$ crosses it: $\Phi = \mu H_yd\Delta z$.`),
    Q(md`For parallel plates, $L = \mu d/W$. Physically $L$ is…`,
      ['the magnetic flux per meter of line, per ampere', 'the stored charge per meter, per volt', 'the inductance of the whole line', 'the resistance of the plates per meter'], 0,
      [null, md`That is $C$.`, md`It is per meter: multiply by the length for the whole line.`, md`The plates are perfect; there is no resistance in this model.`],
      md`$\Phi' = \mu H_yd = \mu(I/W)d$, so $\Phi'/I = \mu d/W$.`),
    Q(md`Which change lowers a parallel-plate line's $C$?`,
      ['a larger gap $d$', 'a wider plate $W$', md`a filling with larger $\epsilon$`, 'a longer line'], 0,
      [null, md`$C = \epsilon W/d$ grows with $W$.`, md`$C$ grows with $\epsilon$.`, md`$C$ is per meter; length does not change it.`],
      md`$C = \epsilon W/d$ falls as $d$ grows.`),
    Q(md`A slightly lossy filling adds which term to the telegrapher's equations?`,
      [md`$+GV$ in $-\partial I/\partial z = C\,\partial V/\partial t + GV$`, md`$+GI$ in the first equation`, md`$+RV$ in the second equation`, md`nothing: loss only changes $Z_0$`], 0,
      [null, md`The filling's loss is a leak **across** the line, driven by $V$, so it belongs in the current equation.`, md`$R$ is a series loss in the metal; it would appear as $RI$ in the first equation.`, md`Loss adds a term; the lossless equations no longer hold exactly.`],
      md`Leakage current per meter is $\sigma E_xW = (\sigma W/d)V = GV$.`),
    Q(md`For a coax, Gauss's law gives $E_r$ proportional to…`,
      [md`$1/r$`, md`$1/r^2$`, md`$r$`, md`a constant`], 0,
      [null, md`$1/r^2$ is a point charge. A line charge gives $1/r$.`, md`That is inside a uniformly charged cylinder, not between conductors.`, md`A constant field is the parallel-plate case.`],
      md`$D_r\cdot2\pi r = \rho_l$, so $E_r = \rho_l/(2\pi\epsilon r)$.`),
    Q(md`The coax's $\ln(b/a)$ comes from…`,
      [md`integrating $1/r$ from $a$ to $b$`, md`the area of the annulus`, md`the ratio of the circumferences`, md`a series expansion for small $b - a$`], 0,
      [null, md`The area would give $\pi(b^2 - a^2)$, with no log.`, md`That ratio is just $b/a$, with no log.`, md`The result is exact for any $a < b$.`],
      md`$\int_a^b dr/r = \ln(b/a)$, in both the voltage (Gauss) and the flux (Ampère).`),
    Q(md`Which product is the same for every TEM line with the same filling?`,
      [md`$LC = \mu\epsilon$`, md`$L/C$`, md`$L/G$`, md`$C\,\text{GF}$`], 0,
      [null, md`$L/C = Z_0^2$ depends on GF.`, md`$L/G = \mu/(\sigma\,\text{GF}^2)$ depends on the shape.`, md`$C\,\text{GF} = \epsilon\,\text{GF}^2$ depends on the shape.`],
      md`$L = \mu/\text{GF}$ and $C = \epsilon\,\text{GF}$, so $LC = \mu\epsilon$. That is why $v = 1/\sqrt{\mu\epsilon}$ for every line.`),
    Q(md`A twin-lead line in air and a coax in air are both lossless. Which is true?`,
      ['They have the same wave speed, $c$, but generally different $Z_0$', 'They have the same $Z_0$ but different speeds', 'The twin-lead is faster because there is less metal', 'Neither can carry a TEM wave'], 0,
      [null, md`$Z_0 = \eta/\text{GF}$ depends on the shape; the speed does not.`, md`The speed is $1/\sqrt{\mu\epsilon}$ for both.`, md`Both are two-conductor lines, and both carry TEM waves.`],
      md`$v = 1/\sqrt{\mu_0\epsilon_0} = c$ for both; GF differs, so $Z_0$ differs.`),
    Q(md`From the wave equation $\partial^2V/\partial z^2 = LC\,\partial^2V/\partial t^2$, the speed is…`,
      [md`$1/\sqrt{LC}$`, md`$\sqrt{LC}$`, md`$1/(LC)$`, md`$\sqrt{L/C}$`], 0,
      [null, md`$\sqrt{LC}$ is a time per meter, the inverse of the speed.`, md`That is $v^2$.`, md`That is $Z_0$.`],
      md`Compare with $\partial^2E/\partial z^2 = \mu\epsilon\,\partial^2E/\partial t^2$, whose speed is $1/\sqrt{\mu\epsilon}$.`),
    Q(md`$V(z,t) = f(t - z/v)$. The value of $V$ at $z = 300$ m and $t = 5\ \mu$s, with $v = 10^8$ m/s, equals…`,
      [md`$f(2\ \mu\text{s})$: the value at $z = 0$, 3 µs earlier`, md`$f(8\ \mu\text{s})$`, md`$f(5\ \mu\text{s})$`, md`$f(3\ \mu\text{s})$`], 0,
      [null, md`That adds the delay. A forward wave arrives later, so the argument is $t - z/v$.`, md`That ignores the travel time $z/v = 3\ \mu$s.`, md`That is the delay alone, not $t - z/v$.`],
      md`$t - z/v = 5 - 3 = 2\ \mu$s.`),
    Q(md`For a backward wave $V = g(t + z/v)$, the current is $I = -g/Z_0$. The minus sign means…`,
      ['its power $VI$ flows toward $-z$', 'its voltage is negative', 'it is reflected with $\\Gamma = -1$', 'its current flows on the bottom conductor only'], 0,
      [null, md`$g$ can be positive or negative; the sign is between $V$ and $I$.`, md`No boundary is involved: it is just a wave traveling the other way.`, md`Both conductors always carry equal and opposite currents.`],
      md`$VI = -g^2/Z_0 < 0$: the energy moves toward $-z$, as it must for a wave going that way.`),
    Q(md`On a $100\ \Omega$ line, $V = 20$ V belongs to a forward wave and $V = 10$ V to a backward wave at the same point. The total current is…`,
      ['0.1 A', '0.3 A', '0.2 A', '−0.1 A'], 0,
      [null, md`That adds the two currents. The backward wave's current is negative.`, md`That is the forward wave alone.`, md`That has the signs swapped: forward $+0.2$, backward $-0.1$.`],
      md`$I = (V^+ - V^-)/Z_0 = (20 - 10)/100 = 0.1$ A. The total voltage is 30 V.`),
    Q(md`An air coax has $Z_0 = 60\ \Omega$. Its $b/a$ is…`,
      [md`$e \approx 2.72$`, md`$10$`, md`$60$`, md`$2\pi$`], 0,
      [null, md`That uses $\log_{10}$. Air coax: $Z_0 = 60\ln(b/a)$, so $\ln(b/a) = 1$.`, md`That is $Z_0$ itself, not a ratio.`, md`$2\pi$ is the numerator of GF.`],
      md`$60\ln(b/a) = 60$ means $\ln(b/a) = 1$, so $b/a = e$.`),
    Q(md`A 50 Ω cable has $v = 2\times10^8$ m/s. Its $L$ and $C$ are…`,
      ['250 nH/m and 100 pF/m', '100 nH/m and 250 pF/m', '25 nH/m and 1 nF/m', '250 nH/m and 10 pF/m'], 0,
      [null, md`Swapped: $L = Z_0/v = 250$ nH/m.`, md`$L = 50/(2\times10^8) = 2.5\times10^{-7}$ H/m, not $2.5\times10^{-8}$.`, md`$C = 1/(Z_0v) = 1/(10^{10}) = 10^{-10}$ F/m = 100 pF/m.`],
      md`$L = Z_0/v = 250$ nH/m and $C = 1/(Z_0v) = 100$ pF/m.`),
    Q(md`Why can a lumped-circuit model treat the current in a short wire as the same everywhere?`,
      ['The wire is much shorter than a wavelength, so the front crosses it before anything changes', 'Kirchhoff\'s laws hold exactly at any frequency', 'Wires have no capacitance', 'The current in a transmission line is always uniform'], 0,
      [null, md`On a long line the current varies with $z$; KCL along a wire fails there.`, md`Every pair of wires has some capacitance per meter.`, md`On a line, current exists only behind the front: it is not uniform.`],
      md`The ladder model is lumped when $\Delta z \ll \lambda$. A whole circuit is "lumped" when it is much smaller than a wavelength.`),
    Q(md`Spring 2024 #3 asks for $v_p$ "in terms of $a$, $b$, $\epsilon$, $\mu$". The right answer…`,
      [md`does not contain $a$ or $b$: $v_p = 1/\sqrt{\mu\epsilon}$`, md`contains $\ln(b/a)$`, md`contains $b - a$`, md`contains $2\pi$`], 0,
      [null, md`$\ln(b/a)$ appears in $L$, $C$ and $Z_0$, but cancels in $LC$.`, md`Only the ratio $b/a$ ever appears, and here not even that.`, md`The $2\pi$ cancels in $LC$ too.`],
      md`$LC = \frac{\mu\ln(b/a)}{2\pi}\cdot\frac{2\pi\epsilon}{\ln(b/a)} = \mu\epsilon$.`),
    Q(md`Doubling $\mu$ of the filling (same $\epsilon$, same shape) changes $Z_0$ and $v$ by…`,
      [md`$Z_0\times\sqrt2$, $v\div\sqrt2$`, md`$Z_0\times2$, $v\div2$`, md`$Z_0\div\sqrt2$, $v\div\sqrt2$`, md`$Z_0$ unchanged, $v\div\sqrt2$`], 0,
      [null, md`Both go as the square root of $\mu$.`, md`$Z_0 = \sqrt{L/C}$ and $L \propto \mu$, so $Z_0$ grows.`, md`$L = \mu/\text{GF}$ doubles, so $Z_0 = \sqrt{L/C}$ grows.`],
      md`$L$ doubles, $C$ is unchanged: $Z_0 = \sqrt{L/C}$ grows by $\sqrt2$ and $v = 1/\sqrt{LC}$ falls by $\sqrt2$.`),
    Q(md`A parallel-plate line has $Z_0 = 377\ \Omega$ with an air filling. Its $W/d$ is…`,
      ['1', '377', '1/377', '$2\\pi$'], 0,
      [null, md`That would make $Z_0 = 1\ \Omega$.`, md`That would make $Z_0 = 377^2\ \Omega$.`, md`$2\pi$ belongs to the coax.`],
      md`$Z_0 = \eta_0/\text{GF} = 377/\text{GF}$, so $\text{GF} = W/d = 1$: a square cross-section (where fringing would matter, but the formula says 1).`),
    Q(md`Which pair of measurements is enough to find both $L$ and $C$ of a cable?`,
      [md`$Z_0$ and the delay per meter`, md`$Z_0$ alone`, md`the delay per meter alone`, md`$\epsilon_r$ and the delay per meter`], 0,
      [null, md`One number cannot give two unknowns.`, md`The delay gives $\sqrt{LC}$, the product only.`, md`Both give the same information ($v$). You need one more independent number, like $Z_0$.`],
      md`$L = Z_0/v$ and $C = 1/(Z_0v)$.`),
  ];

  // ================================================================ figures, lesson 2
  // a resistor zigzag on the segment (x1,y1)-(x2,y2)
  function zig(g, x1, y1, x2, y2, body = 30) {
    const Ln = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / Ln, uy = (y2 - y1) / Ln, px = -uy, py = ux, s = (Ln - body) / 2;
    const at = (t, k = 0) => [x1 + ux * t + px * k, y1 + uy * t + py * k];
    const pts = [at(0), at(s)];
    for (let i = 0; i < 6; i++) pts.push(at(s + (body * (i + 0.5)) / 6, i % 2 ? -5 : 5));
    pts.push(at(s + body), at(Ln));
    g.pl(pts);
  }
  function source(g, x, y, r = 13) {
    g.circle(x, y, r, { cls: 'bgfill' });
    g.add(`<path class="glyph" d="M${x - 3.5},${y - 5}H${x + 3.5}M${x},${y - 8.5}V${y - 1.5}M${x - 3.5},${y + 5}H${x + 3.5}"/>`);
  }
  // source (or a short, for changes), Rg, the line as two bars, a load; a z axis; optional wave arrows
  // o: { alt, short, src, rg, z0, rl, waves: 'load' | 'gen', zt }
  function lineCkt(o) {
    const g = PF.fig({ alt: o.alt });
    const yT = 46, yB = 126, cy = 86, xs = 36, x0 = 150, x1 = 370, xl = 420;
    if (o.short) { g.line(xs, yT, xs, yB); g.label(xs - 8, cy, '\\text{short}', 'r', 'small'); }
    else { source(g, xs, cy); g.label(xs - 18, cy, o.src || 'V_g\\,u(t)', 'r', 'small'); g.line(xs, cy - 13, xs, yT); g.line(xs, cy + 13, xs, yB); }
    g.line(xs, yT, 62, yT); zig(g, 62, yT, 124, yT); g.line(124, yT, x0, yT);
    g.label(93, yT - 10, o.rg || 'R_g', 'b', 'small');
    g.line(xs, yB, x0, yB);
    for (const y of [yT, yB]) g.rect(x0, y - 4, x1 - x0, 8, { cls: 'shade' });
    g.label(o.waves ? (o.waves === 'load' ? x0 + 50 : x1 - 50) : (x0 + x1) / 2, cy, o.z0 || 'Z_0,\\ v', 'c', 'small');
    if (o.rl === 'open') { g.line(x1, yT, xl - 20, yT); g.line(x1, yB, xl - 20, yB); g.label(xl - 14, cy, '\\text{open}', 'l', 'small'); }
    else {
      g.pl([[x1, yT], [xl, yT], [xl, cy - 22]]); zig(g, xl, cy - 22, xl, cy + 22); g.pl([[xl, cy + 22], [xl, yB], [x1, yB]]);
      g.label(xl + 12, cy, o.rl || 'R_L', 'l', 'small');
    }
    if (o.waves === 'load') {
      g.arrow(x1 - 130, cy - 14, x1 - 30, cy - 14, { hs: 7 }); g.label(x1 - 80, cy - 18, 'V^+', 'b', 'small');
      g.arrow(x1 - 30, cy + 14, x1 - 130, cy + 14, { cls: 'dim', hs: 7 }); g.label(x1 - 80, cy + 18, 'V^- = \\Gamma_LV^+', 't', 'small');
    }
    if (o.waves === 'gen') {
      g.arrow(x0 + 130, cy + 14, x0 + 30, cy + 14, { cls: 'dim', hs: 7 }); g.label(x0 + 80, cy + 18, 'V^-', 't', 'small');
      g.arrow(x0 + 30, cy - 14, x0 + 130, cy - 14, { hs: 7 }); g.label(x0 + 80, cy - 18, 'V_2^+ = \\Gamma_gV^-', 'b', 'small');
    }
    const ya = yB + 30;
    g.arrow(x0 - 12, ya, x1 + 30, ya, { cls: 'dim', hs: 6 }); g.label(x1 + 34, ya, 'z', 'l', 'small accent');
    for (const [x, t] of [[x0, '0'], [x1, 'l']]) { g.line(x, ya - 3, x, ya + 3, { cls: 'dim' }); g.label(x, ya + 6, t, 't', 'small'); }
    return g.svg();
  }
  // what the source sees at t = 0+: Rg in series with a resistor Z0
  function dividerFig() {
    const g = PF.fig({ alt: 'The circuit the source sees at t = 0+: the source, Rg in series, and a resistor Z0 in place of the line. The voltage across Z0 is V(0, 0+).' });
    const yT = 40, yB = 130, cy = 85, xs = 40, xr = 200;
    source(g, xs, cy); g.label(xs - 18, cy, 'V_g', 'r', 'small');
    g.line(xs, cy - 13, xs, yT); g.line(xs, cy + 13, xs, yB);
    g.line(xs, yT, 70, yT); zig(g, 70, yT, 140, yT); g.line(140, yT, xr, yT); g.label(105, yT - 10, 'R_g', 'b', 'small');
    g.line(xr, yT, xr, cy - 22); zig(g, xr, cy - 22, xr, cy + 22); g.line(xr, cy + 22, xr, yB); g.line(xs, yB, xr, yB);
    g.label(xr + 12, cy, 'Z_0', 'l', 'small');
    g.label(xr - 14, yT + 16, '+', 'c', 'small'); g.label(xr - 14, yB - 16, '-', 'c', 'small');
    g.label(xr - 14, cy, 'V', 'r', 'small');
    g.arrow(150, yT - 18, 190, yT - 18, { hs: 6 }); g.label(170, yT - 22, 'I', 'b', 'small');
    return g.svg();
  }
  const S1 = TL.solve({ Vg: 80, Rg: 50, RL: 50, sections: [{ Z0: 150, len: 300, v: 150 }], tMax: 9 });
  const S2 = TL.solve({ Vg: 10, Rg: 25, RL: Infinity, sections: [{ Z0: 75, len: 300, v: 300 }], tMax: 8 });
  const S3 = TL.solve({ Vg: 12, Rg: 100, RL: 0, sections: [{ Z0: 50, len: 200, v: 200 }], tMax: 8 });

  // ================================================================ lesson 2
  EM.lesson('w5', {
    id: 'w5-launch', topic: 14, ref: 'Lecture 28', title: 'Launching and reflecting: τ_g, Γ_L, Γ_g, steady state',
    steps: [
      RF(md`
        !!key Why you care
          Every bounce-diagram problem starts with three numbers, $\tau_g$, $\Gamma_g$ and $\Gamma_L$, and every one can be checked at the end against a DC circuit. Prof. Chen's Spring 2024 Exam 3 put 34 of its 100 points on a bounce diagram, and its first line was $\tau_g = 150/200 = \tfrac34$, so $\tfrac34\cdot80 = 60$ V. In this lesson you derive all three numbers from KVL and Ohm's law, and you prove that the final value is the plain voltage divider. Then any bounce problem can be checked in ten seconds.

        ### Notation

        - $V_g\,u(t)$: the source, a step of $V_g$ volts switched on at $t = 0$. $R_g$: the source's internal resistance.
        - $Z_0$, $v$: the line's characteristic impedance and wave speed ([Topic 13](#/l/w5-telegraph)). $l$: its length, from $z = 0$ (the generator) to $z = l$ (the load). $R_L$: the load resistor.
        - $T = l/v$: the **one-way travel time**. A round trip takes $2T$.
        - $V^+$, $I^+$: voltage and current of a wave going toward the load. $V^-$, $I^-$: of a wave going back. Always $I^+ = V^+/Z_0$ and $I^- = -V^-/Z_0$.
        - $\tau_g = Z_0/(R_g + Z_0)$: the **injection coefficient**, the share of $V_g$ launched onto the line.
        - $\Gamma_L$: the **load reflection coefficient**, $V^-/V^+$ at the load. $\Gamma_g$: the **generator reflection coefficient**, the same ratio for a wave arriving back at $z = 0$.
        - Three different taus live in this course. $\tau_g$ (this lesson) is the injection coefficient. $\tau = 1 + \Gamma$ is the transmission coefficient at a boundary or junction ([Topic 11](#/l/w4-gamma), [Topic 16](#/l/w5-multi)). $\tau$ in $\eta = |\eta|e^{j\tau}$ is an angle ([Topic 5](#/l/w2-gamma)). Never mix them.

        [[fig:ckt]]

        ### 1. At t = 0⁺ the source sees only Z₀

        Before $t = 0$ the line is uncharged: $V = I = 0$ everywhere. At $t = 0$ the source switches on and a forward wave $f(t - z/v)$ starts down the line.

        Nothing can come back from the load until the wave has gone there and back: a time $2T$. So for $0 < t < 2T$ the line holds only the forward wave, and at its input
        $$V(0,t) = f(t), \qquad I(0,t) = \frac{f(t)}{Z_0}$$
        Their ratio is $Z_0$. **To the source, the line looks like a resistor $Z_0$.** It does not matter what is at the far end; the source cannot know yet.

        [[fig:div]]

        Write KVL around the source loop: the source voltage equals the drop across $R_g$ plus the line's input voltage.
        $$V_g = R_g\,I(0,t) + V(0,t)$$
        Substitute the line's $V$ and $I$:
        $$V_g = R_g\frac{f}{Z_0} + f$$
        Factor out $f$:
        $$V_g = f\cdot\frac{R_g + Z_0}{Z_0}$$
        Solve for $f$:
        $$f = \frac{Z_0}{R_g + Z_0}\,V_g$$
        That fraction is the injection coefficient:
        $$\boxed{\tau_g = \frac{Z_0}{R_g + Z_0}}$$
        The first wave has voltage and current
        $$V_1^+ = \tau_gV_g, \qquad I_1^+ = \frac{V_g}{R_g + Z_0}$$
        It is a **voltage divider** between $R_g$ and $Z_0$.

        !!intuition Does this make sense?
          $R_g = 0$: $\tau_g = 1$, the whole source voltage goes onto the line. $R_g = Z_0$: $\tau_g = \tfrac12$, half. Large $R_g$: almost nothing. So $0 < \tau_g \le 1$ always. And $R_L$ is nowhere in it, because the wave has not reached the load.
      `, {
        ckt: { svg: lineCkt({ alt: 'A source Vg u(t) with internal resistance Rg drives a line of impedance Z0 and speed v from z = 0 to z = l, ending in a load RL.' }), cap: 'The circuit of every problem in this lesson: a step source with resistance $R_g$, a line $Z_0$ of length $l$, a load $R_L$.' },
        div: { svg: dividerFig(), cap: 'What the source sees for $0 < t < 2T$: the line acts as a resistor $Z_0$. The divider gives $V = \\tau_gV_g$.' },
      }),
      Q(md`**Predict.** $V_g = 30$ V, $R_g = 25\ \Omega$, $Z_0 = 50\ \Omega$, $R_L = 100\ \Omega$. The first wave launched onto the line has voltage…`,
        ['20 V', '10 V', '24 V', '15 V'], 0,
        [null, md`That is $R_g/(R_g + Z_0)$ of the source: the share dropped across $R_g$, not the line's share.`, md`That is the DC divider with $R_L$. At $t = 0^+$ the load is invisible; the line looks like $Z_0$.`, md`That is half of $V_g$, which needs $R_g = Z_0$.`],
        md`$\tau_g = 50/(25 + 50) = \tfrac23$, so $V_1^+ = \tfrac23\cdot30 = 20$ V. $R_L$ does not enter until the wave comes back.`),
      RF(md`
        ### 2. At the load: Γ_L from Ohm's law

        At $t = T$ the forward wave $V^+$ reaches the load. The load is a resistor, so Ohm's law must hold there:
        $$V(l,t) = R_L\,I(l,t)$$
        The forward wave alone has $V/I = Z_0$. If $R_L \neq Z_0$, it cannot satisfy Ohm's law by itself. So something new must appear: a **reflected wave** $V^-$, starting back toward the generator. At the load both waves are present:
        $$V_L = V^+ + V^-$$
        $$I_L = \frac{V^+ - V^-}{Z_0}$$
        (The backward wave's current has the minus sign from Topic 13.) Put them into Ohm's law, $V_L = R_LI_L$:
        $$V^+ + V^- = \frac{R_L}{Z_0}\,(V^+ - V^-)$$
        Multiply both sides by $Z_0$:
        $$Z_0V^+ + Z_0V^- = R_LV^+ - R_LV^-$$
        Move every $V^-$ to the left and every $V^+$ to the right:
        $$V^-(R_L + Z_0) = V^+(R_L - Z_0)$$
        Divide:
        $$\boxed{\Gamma_L \equiv \frac{V^-}{V^+} = \frac{R_L - Z_0}{R_L + Z_0}}$$
        This is the line on your formula sheet. The reflected wave is $V^- = \Gamma_LV^+$, and it leaves the load at $t = T$.

        [[fig:ld]]

        !!intuition Does this make sense?
          $R_L > Z_0$: $\Gamma_L > 0$, the reflection adds voltage. $R_L < Z_0$: $\Gamma_L < 0$, it takes voltage away. For any $R_L \ge 0$, $-1 \le \Gamma_L \le 1$. It is the same form as $\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$ for plane waves ([Topic 11](#/l/w4-gamma)): to the wave, the load is a new medium of impedance $R_L$.
      `, { ld: { svg: lineCkt({ alt: 'At the load: the incident wave V+ arrives and the reflected wave V- = Gamma_L V+ leaves back toward the generator.', waves: 'load' }), cap: 'At $t = T$ the incident $V^+$ meets $R_L$, and $V^- = \\Gamma_LV^+$ starts back.' } }),
      Q(md`**Predict.** A $50\ \Omega$ line ends in $R_L = 150\ \Omega$. Its $\Gamma_L$ is…`,
        [md`$+\tfrac12$`, md`$-\tfrac12$`, md`$\tfrac34$`, md`$3$`], 0,
        [null, md`That is $(Z_0 - R_L)/(Z_0 + R_L)$, upside down. A load larger than $Z_0$ gives a positive $\Gamma_L$.`, md`That is $R_L/(R_L + Z_0)$, a divider fraction, not a reflection coefficient.`, md`That is $R_L/Z_0$. $|\Gamma_L|$ can never exceed 1.`],
        md`$\Gamma_L = (150 - 50)/(150 + 50) = 100/200 = \tfrac12$.`),
      R(md`
        ### 3. The current reflects with −Γ

        The reflected current follows from the reflected voltage:
        $$I^- = -\frac{V^-}{Z_0} = -\Gamma_L\frac{V^+}{Z_0}$$
        And $V^+/Z_0 = I^+$, so
        $$\boxed{I^- = -\Gamma_L\,I^+}$$
        **For current, the reflection coefficient is $-\Gamma$.** On a current bounce diagram, every reflection coefficient changes sign; the injection is $I_1^+ = V_1^+/Z_0$.

        So the totals at the load are
        $$V_L = V^+(1 + \Gamma_L)$$
        $$I_L = I^+(1 - \Gamma_L)$$
        **Check that they obey Ohm's law.** First the two brackets:
        $$1 + \Gamma_L = \frac{2R_L}{R_L + Z_0}$$
        $$1 - \Gamma_L = \frac{2Z_0}{R_L + Z_0}$$
        Their ratio is $R_L/Z_0$. So
        $$\frac{V_L}{I_L} = Z_0\cdot\frac{R_L}{Z_0} = R_L\ ✓$$

        !!intuition Does this make sense?
          Why must the current flip? The reflected wave travels the other way, so for the same sign of voltage its current runs the other way along the wire. A reflection that adds voltage ($\Gamma > 0$) must take current away, and vice versa. Voltage up, current down: that is how a big resistor gets $V/I = R_L > Z_0$.
      `),
      Q(md`**Predict.** A wave with $I^+ = 0.2$ A reaches a load with $\Gamma_L = \tfrac12$. Just after, the current through the load is…`,
        ['0.1 A', '0.3 A', '0.2 A', '−0.1 A'], 0,
        [null, md`That uses $1 + \Gamma_L$. Current reflects with $-\Gamma_L$: $I_L = I^+(1 - \Gamma_L)$.`, md`That ignores the reflection.`, md`That is the reflected current alone, $-\Gamma_LI^+$. The load carries incident plus reflected.`],
        md`$I^- = -\tfrac12(0.2) = -0.1$ A, so $I_L = 0.2 - 0.1 = 0.1$ A. Check with Ohm's law: $V_L = V^+(1.5)$ and $V^+ = 0.2Z_0$, so $V_L/I_L = 0.3Z_0/0.1 = 3Z_0 = R_L$ ✓ (a $\Gamma_L$ of $\tfrac12$ means $R_L = 3Z_0$).`),
      R(md`
        ### 4. Open, short and matched loads

        | Load | $\Gamma_L$ | Voltage at the load | Current at the load |
        |---|---|---|---|
        | open, $R_L = \infty$ | $+1$ | $2V^+$ | $0$ |
        | short, $R_L = 0$ | $-1$ | $0$ | $2I^+$ |
        | matched, $R_L = Z_0$ | $0$ | $V^+$ | $I^+$ |

        **Open end.** Charges arrive with the wave and have nowhere to go. The current must be zero at the end, so the reflected current cancels the incident one ($-\Gamma_L = -1$). The charge piles up instead, and the voltage doubles. The reflected wave carries that news back: behind its front the line sits at $2V^+$ with no current.

        **Short.** The short forces $V = 0$ at the end. The reflected voltage cancels the incident voltage ($\Gamma_L = -1$), and the currents add: $2I^+$ flows through the short. Behind the returning front the line has $V = 0$ and twice the current.

        **Matched.** $R_L = Z_0$ takes exactly the $V/I$ the wave already has. To the wave, the load looks like more line. Everything is absorbed; nothing comes back.

        !!intuition Does this make sense?
          Use the limits of Section 2. $R_L \to \infty$ makes $(R_L - Z_0)/(R_L + Z_0) \to 1$. $R_L = 0$ gives $-Z_0/Z_0 = -1$. $R_L = Z_0$ gives 0. ✓ The open end doubles voltage the way a free end of a rope doubles its displacement; the short is the clamped end.
      `),
      Q(md`**Predict.** A 6 V step wave on a $60\ \Omega$ line reaches an **open** end. Just after, the voltage and current at the end are…`,
        ['12 V and 0 A', '6 V and 0.1 A', '0 V and 0.2 A', '12 V and 0.2 A'], 0,
        [null, md`That is the incident wave alone. At an open end the current must be zero, so a reflection is needed.`, md`That is a short: $\Gamma_L = -1$ cancels the voltage and doubles the current.`, md`At an open end the reflected current cancels the incident current: $I_L = I^+(1 - 1) = 0$.`],
        md`$\Gamma_L = +1$: $V_L = 6(1 + 1) = 12$ V and $I_L = 0.1(1 - 1) = 0$ A.`),
      RF(md`
        ### 5. At the generator: Γ_g

        At $t = 2T$ the reflected wave $V^-$ reaches $z = 0$. KVL still holds at the source:
        $$V_g = R_g\,I(0,t) + V(0,t)$$
        Just before the arrival, the first wave alone satisfied it: $V_g = R_gI_1^+ + V_1^+$. When $V^-$ arrives, a new forward wave $V_2^+$ starts. Subtract the "before" equation from the "after" one. $V_g$ is the same on both sides, so it cancels, and the **changes** alone must satisfy
        $$0 = R_g\,\Delta I + \Delta V$$
        The changes are the two new waves at $z = 0$:
        $$\Delta V = V^- + V_2^+$$
        $$\Delta I = \frac{V_2^+ - V^-}{Z_0}$$
        Substitute:
        $$V^- + V_2^+ = -\frac{R_g}{Z_0}\,(V_2^+ - V^-)$$
        Multiply by $Z_0$:
        $$Z_0V^- + Z_0V_2^+ = -R_gV_2^+ + R_gV^-$$
        Collect:
        $$V_2^+(R_g + Z_0) = V^-(R_g - Z_0)$$
        $$\boxed{\Gamma_g = \frac{V_2^+}{V^-} = \frac{R_g - Z_0}{R_g + Z_0}}$$
        The same formula as the load, with $R_g$ in place of $R_L$. Why? The source voltage cancelled out of the changes: **to a returning wave, an ideal voltage source is a short circuit**, and only $R_g$ is left.

        [[fig:gen]]

        !!intuition Does this make sense?
          $R_g = 0$: $\Gamma_g = -1$. An ideal source holds $V(0)$ fixed at $V_g$, so it must cancel any voltage that arrives. $R_g = Z_0$: $\Gamma_g = 0$, a **matched source**: it absorbs whatever comes back, and the bouncing stops after one round trip.
      `, { gen: { svg: lineCkt({ alt: 'For a returning wave the source is a short circuit, so the line ends in Rg alone at z = 0. The arriving V- launches V2+ = Gamma_g V-.', short: true, waves: 'gen', rl: 'R_L' }), cap: 'What a returning wave sees at $z = 0$: the source is a short for changes, so the line ends in $R_g$ alone.' } }),
      Q(md`**Predict.** An ideal source ($R_g = 0$) drives a line. A reflected wave of $+3$ V arrives back at $z = 0$. The new forward wave it launches is…`,
        ['$-3$ V', '$+3$ V', '0 V', '$+6$ V'], 0,
        [null, md`That is $\Gamma_g = +1$, an open end. An ideal voltage source is a short for changes: $\Gamma_g = (0 - Z_0)/(0 + Z_0) = -1$.`, md`Zero would need $R_g = Z_0$, a matched source.`, md`That is the total voltage change at an open end. The source holds $V(0)$ fixed.`],
        md`$\Gamma_g = -1$, so $V_2^+ = -3$ V. The two new waves cancel at $z = 0$: $V(0) = V_g$ stays fixed, as an ideal source demands.`),
      R(md`
        ### 6. τ_g is not 1 + Γ_g

        At a junction between two lines ([Topic 16](#/l/w5-multi)), the wave that gets through is $\tau = 1 + \Gamma$ times the incident one. So it is tempting to write $\tau_g = 1 + \Gamma_g$. It is wrong. Compute both:
        $$1 + \Gamma_g = 1 + \frac{R_g - Z_0}{R_g + Z_0} = \frac{2R_g}{R_g + Z_0}$$
        $$\tau_g = \frac{Z_0}{R_g + Z_0}$$
        They are different numbers. They agree only when $2R_g = Z_0$, by accident. What does match is
        $$1 - \Gamma_g = \frac{2Z_0}{R_g + Z_0} = 2\tau_g$$
        so $\tau_g = (1 - \Gamma_g)/2$, a handy check.

        **Why they differ.** They answer different questions.

        - $\tau_g$ answers: **how much of the source voltage $V_g$** goes onto the line? It multiplies $V_g$, the source's own voltage, through the divider of Section 1.
        - $1 + \Gamma$ answers: **a wave arrives at a boundary**; what is the total voltage there, as a multiple of that wave? It multiplies an incident wave.

        At $t = 0$ no wave is arriving at the generator, so $1 + \Gamma_g$ has nothing to multiply.

        !!intuition Does this make sense?
          Take $R_g = 0$. Then $\tau_g = 1$ (the line gets all of $V_g$), while $1 + \Gamma_g = 0$: a wave $V^-$ arriving at an ideal source changes the voltage there by $V^-(1 + \Gamma_g) = 0$, because the source holds $V(0)$ fixed. Same circuit, two different questions, two different answers.
      `),
      Q(md`**Predict.** $R_g = 150\ \Omega$ and $Z_0 = 50\ \Omega$. Which number multiplies $V_g$ to give the first wave?`,
        [md`$\tfrac14$`, md`$\tfrac32$`, md`$\tfrac12$`, md`$\tfrac34$`], 0,
        [null, md`That is $1 + \Gamma_g$. The launch is the divider $Z_0/(R_g + Z_0)$.`, md`That is $\Gamma_g$ itself.`, md`That is $R_g/(R_g + Z_0)$, the share dropped across $R_g$.`],
        md`$\tau_g = 50/200 = \tfrac14$. Check: $\Gamma_g = 100/200 = \tfrac12$ and $(1 - \Gamma_g)/2 = \tfrac14$ ✓.`),
      RF(md`
        ### 7. Following the waves

        Now chain the three numbers. With a step $V_g\,u(t)$ and $T = l/v$:

        | Wave | Starts at | Leaves from | Voltage |
        |---|---|---|---|
        | 1st, forward | $t = 0$ | generator | $\tau_gV_g$ |
        | 1st, backward | $t = T$ | load | $\Gamma_L\tau_gV_g$ |
        | 2nd, forward | $t = 2T$ | generator | $\Gamma_g\Gamma_L\tau_gV_g$ |
        | 2nd, backward | $t = 3T$ | load | $\Gamma_g\Gamma_L^2\tau_gV_g$ |

        Each wave is the previous one times the coefficient at the end it bounced from. Every wave is a step: once it passes a point, it stays added there. So the voltage at the load climbs in steps at $T, 3T, 5T, \ldots$ Each step is one forward wave plus its own reflection, which leave together:
        $$V_L(T^+) = \tau_gV_g(1 + \Gamma_L)$$
        $$V_L(3T^+) = \tau_gV_g(1 + \Gamma_L)(1 + \Gamma_g\Gamma_L)$$
        and in general, after the $n$th arrival,
        $$V_L = \tau_gV_g(1 + \Gamma_L)\sum_{k=0}^{n-1}(\Gamma_g\Gamma_L)^k$$
        The bounce diagram ([Topic 15](#/l/w5-bounce)) is this table drawn in the $z$-$t$ plane. Try it below with Spring 2024's numbers on one line: $V_g = 80$ V, $R_g = 50\ \Omega$, $Z_0 = 150\ \Omega$, $R_L = 50\ \Omega$, $l = 300$ m and $v = c/2 = 150$ m/µs. Then change $R_L$ to inf (an open end), to 0, and to 150.
      `, {}),
      W3.bounce({ Vg: 80, Rg: 50, Z0: 150, RL: 50, len: 300, v: 150, z: 300, tmax: 12 }),
      Q(md`**Predict.** $\tau_gV_g = 60$ V, $\Gamma_L = -\tfrac12$, $\Gamma_g = -\tfrac12$. The load voltage just after $t = 3T$ is…`,
        ['37.5 V', '30 V', '45 V', '22.5 V'], 0,
        [null, md`That is $V_L(T^+)$, after the first arrival only.`, md`That adds the second forward wave (15 V) but forgets its reflection at the load.`, md`That subtracts the second arrival. $\Gamma_g\Gamma_L = +\tfrac14$, so it adds.`],
        md`$V_L(T^+) = 60(1 - \tfrac12) = 30$ V. The second forward wave is $\Gamma_g\Gamma_L\cdot60 = 15$ V, and it arrives with its reflection: $15(1 - \tfrac12) = 7.5$ V more. $V_L(3T^+) = 37.5$ V.`),
      R(md`
        ### 8. The steady state is the DC answer

        Let $t \to \infty$. Add **all** the forward waves. They form a geometric series with ratio $\Gamma_g\Gamma_L$:
        $$V^+_{\text{tot}} = \tau_gV_g\left[1 + \Gamma_g\Gamma_L + (\Gamma_g\Gamma_L)^2 + \cdots\right]$$
        The series $1 + r + r^2 + \cdots$ sums to $1/(1 - r)$ when $|r| < 1$:
        $$V^+_{\text{tot}} = \frac{\tau_gV_g}{1 - \Gamma_g\Gamma_L}$$
        Every backward wave is $\Gamma_L$ times a forward one, so $V^-_{\text{tot}} = \Gamma_LV^+_{\text{tot}}$. The final voltage is
        $$V_\infty = V^+_{\text{tot}}(1 + \Gamma_L) = \frac{\tau_gV_g(1 + \Gamma_L)}{1 - \Gamma_g\Gamma_L}$$
        Now put in the three coefficients. Two of the pieces are already known:
        $$\tau_g = \frac{Z_0}{R_g + Z_0}, \qquad 1 + \Gamma_L = \frac{2R_L}{R_L + Z_0}$$
        The denominator takes one line of algebra. Put $1 - \Gamma_g\Gamma_L$ over the common denominator $(R_g + Z_0)(R_L + Z_0)$; its top is
        $$(R_g + Z_0)(R_L + Z_0) - (R_g - Z_0)(R_L - Z_0)$$
        Expand both products. The $R_gR_L$ terms cancel, and so do the $Z_0^2$ terms. What is left is
        $$2R_gZ_0 + 2R_LZ_0 = 2Z_0(R_g + R_L)$$
        So
        $$1 - \Gamma_g\Gamma_L = \frac{2Z_0(R_g + R_L)}{(R_g + Z_0)(R_L + Z_0)}$$
        Assemble. The factors $(R_g + Z_0)$, $(R_L + Z_0)$, $2$ and $Z_0$ all cancel:
        $$V_\infty = \frac{Z_0}{R_g + Z_0}\cdot\frac{2R_L}{R_L + Z_0}\cdot\frac{(R_g + Z_0)(R_L + Z_0)}{2Z_0(R_g + R_L)}$$
        $$\boxed{V_\infty = \frac{R_L}{R_g + R_L}\,V_g}$$
        **$Z_0$ has disappeared.** The final voltage is the voltage divider you would write if the line were two plain wires. The same steps give $I_\infty = V_g/(R_g + R_L)$.

        **The physical reason, in two lines.** When nothing changes any more, $\partial/\partial t = 0$, and the telegrapher's equations say
        $$\frac{\partial V}{\partial z} = 0, \qquad \frac{\partial I}{\partial z} = 0$$
        The voltage and current are the same all along the line: at DC, a lossless line is just a pair of wires.

        **When it fails.** The series needs $|\Gamma_g\Gamma_L| < 1$. That fails only when both ends reflect perfectly: $R_g = 0$ with an open or shorted load. Then nothing ever absorbs energy, and the waves bounce forever (Lecture 31 studies those oscillations).

        !!intuition Does this make sense?
          An open load: $V_\infty = V_g$ and $I_\infty = 0$, for any $R_g > 0$. A shorted load: $V_\infty = 0$ and $I_\infty = V_g/R_g$. Exactly the DC circuit. ✓
      `),
      Q(md`**Predict.** $V_g = 9$ V, $R_g = 30\ \Omega$, $Z_0 = 75\ \Omega$, $R_L = 60\ \Omega$. After the waves die out, the load voltage is…`,
        ['6 V', '6.43 V', '4 V', '9 V'], 0,
        [null, md`That is $V_gZ_0/(R_g + Z_0)$, the first launched wave. At DC the line has no say.`, md`That is $V_gR_L/(Z_0 + R_L)$: $Z_0$ in place of $R_g$. $Z_0$ cancels completely.`, md`That would need no current in $R_g$, as with an open load. Here $R_L$ draws current.`],
        md`$V_\infty = V_gR_L/(R_g + R_L) = 9\cdot60/90 = 6$ V. $Z_0$ never enters the final value.`),
      RF(md`
        ### 9. Climbing or ringing, and a table of cases

        The steps at the load are $\tau_gV_g(1 + \Gamma_L)$ times $1, \Gamma_g\Gamma_L, (\Gamma_g\Gamma_L)^2, \ldots$ The sign of $\Gamma_g\Gamma_L$ decides the shape:

        - $\Gamma_g\Gamma_L > 0$: every step has the same sign. The voltage **climbs (or falls) steadily** toward its final value: a staircase.
        - $\Gamma_g\Gamma_L < 0$: the steps alternate. The voltage **overshoots and rings** around the final value, closer each round trip.
        - $\Gamma_g\Gamma_L = 0$ (either end matched): at most one reflection. The load reaches its final value at $t = T$ (or the generator end at $2T$) and stays.

        [[fig:two]]

        With $V_g = 12$ V and $Z_0 = 60\ \Omega$:

        | $R_g$ | $R_L$ | $\tau_g$ | $\Gamma_g$ | $\Gamma_L$ | $V_L(T^+)$ | $V_L(\infty)$ |
        |---|---|---|---|---|---|---|
        | 0 | 180 | 1 | $-1$ | $\tfrac12$ | 18 V | 12 V |
        | 60 | 180 | $\tfrac12$ | 0 | $\tfrac12$ | 9 V | 9 V |
        | 20 | 60 | $\tfrac34$ | $-\tfrac12$ | 0 | 9 V | 9 V |
        | 60 | open | $\tfrac12$ | 0 | 1 | 12 V | 12 V |
        | 180 | 20 | $\tfrac14$ | $\tfrac12$ | $-\tfrac12$ | 1.5 V | 1.2 V |
        | 0 | open | 1 | $-1$ | 1 | 24 V | never settles |

        Read the rows: whenever one end is matched, the first value at the load is already final. The first row overshoots: $\Gamma_g\Gamma_L = -\tfrac12$, so the load goes 18, 9, 13.5, … and rings in toward 12 V. The last row is the lossless-resonator exception: $V_L$ jumps between 24 V and 0 forever.
      `, { two: { svg: PF.row([{ svg: TL.plotT(S1, 300, { tMax: 9, w: 330, h: 210 }), cap: '$\\Gamma_g\\Gamma_L = +\\tfrac14$: a staircase up to 40 V' }, { svg: TL.plotT(S2, 300, { tMax: 8, w: 330, h: 210 }), cap: '$\\Gamma_g\\Gamma_L = -\\tfrac12$: rings around 10 V' }]).svg, cap: 'The load voltage of worked examples 1 and 2 below. Dashed: the DC value $V_gR_L/(R_g + R_L)$.' } }),
      Q(md`**Predict.** $R_g = 25\ \Omega$, $Z_0 = 50\ \Omega$, $R_L = 100\ \Omega$. The load voltage approaches its final value…`,
        ['by overshooting and ringing around it', 'as a steady staircase that never overshoots', 'immediately at $t = T$', 'never: it oscillates forever'], 0,
        [null, md`A staircase needs $\Gamma_g\Gamma_L > 0$. Here $\Gamma_g = -\tfrac13$ and $\Gamma_L = +\tfrac13$.`, md`That needs a matched end, $\Gamma_g = 0$ or $\Gamma_L = 0$.`, md`That needs $|\Gamma_g\Gamma_L| = 1$. Here it is $\tfrac19$.`],
        md`$\Gamma_g = -\tfrac13$, $\Gamma_L = \tfrac13$, so $\Gamma_g\Gamma_L = -\tfrac19 < 0$: the steps alternate in sign, and $V_L$ rings in toward $V_g\cdot100/125$.`),
      RF(md`
        ### The method

        !!method A step source on one line, start to finish
          1. **Times.** $T = l/v$. Arrivals at the load: $T, 3T, 5T, \ldots$; at the generator: $2T, 4T, \ldots$
          2. **Three numbers.** $\tau_g = Z_0/(R_g + Z_0)$, $\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$, $\Gamma_L = (R_L - Z_0)/(R_L + Z_0)$. Check: $\tau_g = (1 - \Gamma_g)/2$.
          3. **The waves.** $V_1^+ = \tau_gV_g$, then multiply by $\Gamma_L$, $\Gamma_g$, $\Gamma_L$, … For current, divide by $Z_0$ and use $-\Gamma$ at each end.
          4. **Any point, any time.** Add every wave that has passed that point by that time.
          5. **The 10-second check.** The values must approach $V_gR_L/(R_g + R_L)$ and $V_g/(R_g + R_L)$; climbing if $\Gamma_g\Gamma_L > 0$, ringing if $< 0$.

        ### Worked example 1: Spring 2024's numbers on one line

        !!graded Problem
          $V_g = 80$ V (a step), $R_g = 50\ \Omega$, one line with $Z_0 = 150\ \Omega$, $l = 300$ m, $v = c/2$, and $R_L = 50\ \Omega$. Find $\tau_g$, $\Gamma_g$, $\Gamma_L$, the first three waves, the load voltage and current at $T^+$ and $3T^+$, and the final values.

        **Step 1: time.** $v = 1.5\times10^8$ m/s $= 150$ m/µs, so $T = 300/150 = 2\ \mu$s.

        **Step 2: the three numbers.**
        $$\tau_g = \frac{150}{50 + 150} = \frac34$$
        $$\Gamma_g = \frac{50 - 150}{50 + 150} = -\frac12$$
        $$\Gamma_L = \frac{50 - 150}{50 + 150} = -\frac12$$
        Check: $(1 - \Gamma_g)/2 = \tfrac34$ ✓.

        **Step 3: the waves.**
        $$V_1^+ = \tfrac34\cdot80 = 60\ \text{V}$$
        $$V_1^- = -\tfrac12\cdot60 = -30\ \text{V}$$
        $$V_2^+ = -\tfrac12\cdot(-30) = +15\ \text{V}$$
        In current ($\div150\ \Omega$, and $-\Gamma = +\tfrac12$ at each end): $0.4$ A, then $+0.2$ A, then $+0.1$ A.

        **Step 4: the load at $T^+ = 2\ \mu$s.**
        $$V_L = 60 - 30 = 30\ \text{V}$$
        $$I_L = 0.4 + 0.2 = 0.6\ \text{A}$$
        Ohm's law: $30/0.6 = 50\ \Omega = R_L$ ✓.

        **Step 5: the load at $3T^+ = 6\ \mu$s.** The second forward wave (15 V) arrives with its reflection ($-7.5$ V):
        $$V_L = 30 + 15 - 7.5 = 37.5\ \text{V}$$
        **Step 6: the final values.**
        $$V_\infty = \frac{50}{50 + 50}\cdot80 = 40\ \text{V}$$
        $$I_\infty = \frac{80}{100} = 0.8\ \text{A}$$
        Series check: $60(1 - \tfrac12)/(1 - \tfrac14) = 30\cdot\tfrac43 = 40$ ✓. $\Gamma_g\Gamma_L = +\tfrac14$, so the load climbs 30, 37.5, 39.4, … toward 40 V without overshoot.

        [[fig:bd1]]

        **Speed path.** Write $\tau_g$, $\Gamma_g$, $\Gamma_L$ in the corners of the diagram first; every label after that is one multiplication. Write $V_\infty = 40$ V at the bottom before you start, and watch the sums head toward it.

        **Where points go.** Using $1 + \Gamma_g = \tfrac12$ as $\tau_g$ (it would launch 40 V). Using $+\Gamma$ for the current diagram. Forgetting that the second forward wave reflects at the load in the same instant it arrives.

        ### Worked example 2: an open end and a ringing approach

        !!graded Problem
          $V_g = 10$ V, $R_g = 25\ \Omega$, $Z_0 = 75\ \Omega$, $l = 300$ m in air, open at the far end. Find the load voltage at $T^+$, $3T^+$ and $5T^+$, and its final value.

        **Step 1.** $v = c$, so $T = 1\ \mu$s. $\tau_g = 75/100 = \tfrac34$, $\Gamma_g = -50/100 = -\tfrac12$, $\Gamma_L = +1$.

        **Step 2: the first arrival.** $V_1^+ = 7.5$ V, and the open end doubles it:
        $$V_L(T^+) = 7.5(1 + 1) = 15\ \text{V}$$
        **Step 3: the next arrivals.** The second forward wave is $\Gamma_g\Gamma_L\cdot7.5 = -3.75$ V, doubled at the open end:
        $$V_L(3T^+) = 15 - 7.5 = 7.5\ \text{V}$$
        The third is $(-\tfrac12)(-3.75) = +1.875$ V, doubled:
        $$V_L(5T^+) = 7.5 + 3.75 = 11.25\ \text{V}$$
        **Step 4: final value.** Open load: no current at DC, so no drop across $R_g$:
        $$V_\infty = V_g = 10\ \text{V}$$
        $\Gamma_g\Gamma_L = -\tfrac12$: 15, 7.5, 11.25, 9.375, … rings in toward 10 V. Series check: $7.5\cdot2/(1 + \tfrac12) = 10$ ✓.

        ### Worked example 3: a shorted load, watched in current

        !!graded Problem
          $V_g = 12$ V, $R_g = 100\ \Omega$, $Z_0 = 50\ \Omega$, $R_L = 0$ (a short). Find the current in the short at $T^+$, $3T^+$, and its final value.

        **Step 1.** $\tau_g = 50/150 = \tfrac13$, so $V_1^+ = 4$ V and $I_1^+ = 4/50 = 0.08$ A. $\Gamma_g = 50/150 = \tfrac13$, $\Gamma_L = -1$.

        **Step 2: current coefficients.** For current, use $-\Gamma$: $+1$ at the short and $-\tfrac13$ at the generator.

        **Step 3: at $T^+$.** The short doubles the current:
        $$I_L(T^+) = 0.08(1 + 1) = 0.16\ \text{A}$$
        **Step 4: at $3T^+$.** The second forward current wave is $(-\tfrac13)(+1)(0.08) = -0.0267$ A, doubled at the short:
        $$I_L(3T^+) = 0.16 - 0.0533 = 0.107\ \text{A}$$
        **Step 5: final value.** DC: the short carries $V_g/R_g$:
        $$I_\infty = \frac{12}{100} = 0.12\ \text{A}$$
        $\Gamma_g\Gamma_L = -\tfrac13 < 0$: 0.16, 0.107, 0.124, … rings in toward 0.12 A. The voltage at the short is 0 the whole time.

        ### The whole topic on one table

        | Quantity | Formula | From |
        |---|---|---|
        | $\tau_g$ | $Z_0/(R_g + Z_0)$ | KVL, line looks like $Z_0$ |
        | $\Gamma_L$ | $(R_L - Z_0)/(R_L + Z_0)$ | Ohm's law with $V^+ + V^-$ |
        | $\Gamma_g$ | $(R_g - Z_0)/(R_g + Z_0)$ | KVL on the changes; source is a short |
        | current reflection | $-\Gamma$ | $I^- = -V^-/Z_0$ |
        | totals at a load | $V^+(1 + \Gamma)$, $I^+(1 - \Gamma)$ | incident plus reflected |
        | check | $\tau_g = (1 - \Gamma_g)/2$ | algebra |
        | steady state | $V_gR_L/(R_g + R_L)$, $V_g/(R_g + R_L)$ | geometric series, or $\partial_t = 0$ |
        | shape | staircase if $\Gamma_g\Gamma_L > 0$, ringing if $< 0$ | sign of the ratio |

        !!mistake Common mistakes
          - **$\tau_g = 1 + \Gamma_g$.** Wrong; $\tau_g = (1 - \Gamma_g)/2$. The injection is a divider of $V_g$, not a transmission of a wave.
          - **Putting $R_L$ into the first wave.** At $t = 0^+$ the source sees $Z_0$; the load is unknown until $2T$.
          - **Using $+\Gamma$ for current.** Current reflects with $-\Gamma$ at both ends.
          - **Forgetting the source is a short for returning waves.** $\Gamma_g$ uses $R_g$ alone.
          - **Upside-down $\Gamma$**: $(Z_0 - R)/(Z_0 + R)$. A big load must give a positive $\Gamma_L$.
          - **Using $Z_0$ in the steady state.** $V_\infty = V_gR_L/(R_g + R_L)$, no $Z_0$.
          - **Dropping the same-instant reflection.** A forward wave reaching the load adds $V^+(1 + \Gamma_L)$ there at once, not $V^+$.

        !!key Speed tricks
          - **Write three numbers first:** $\tau_g$, $\Gamma_g$, $\Gamma_L$, with the check $\tau_g = (1 - \Gamma_g)/2$.
          - **The 10-second check:** the final values are $V_gR_L/(R_g + R_L)$ and $V_g/(R_g + R_L)$. Write them before drawing anything.
          - **Load voltage at $T^+$:** $\tau_gV_g(1 + \Gamma_L)$ in one line. Open end: $2\tau_gV_g$. Short: 0.
          - **Shape at a glance:** sign of $\Gamma_g\Gamma_L$: $+$ staircase, $-$ ringing, $0$ settles in one step.
          - **Common $\Gamma$ values:** $R = 3Z_0 \to \tfrac12$, $2Z_0 \to \tfrac13$, $Z_0/2 \to -\tfrac13$, $Z_0/3 \to -\tfrac12$, open $\to 1$, short $\to -1$.
          - **Statement test:** "$\tau_g$ depends on $R_L$": false. "A matched source ($R_g = Z_0$) launches $V_g/2$ and absorbs every return": true. "The final voltage depends on $Z_0$": false.

        ### Check questions
      `, { bd1: { svg: PF.row([{ svg: TL.diagram(S1, { tMax: 9, w: 330, h: 330 }), cap: 'Voltage (V)' }, { svg: TL.diagram(S1, { tMax: 9, w: 330, h: 330, qty: 'I' }), cap: 'Current (A): each end reflects with $-\\Gamma$' }]).svg, cap: 'Worked example 1 as bounce diagrams: position across, time ($\\mu$s) downward. Each slanted line is one wave, labeled with its value.' } }),
      Q(md`A line with $Z_0 = 50\ \Omega$ is driven through $R_g = 50\ \Omega$ and ends in $R_L = 200\ \Omega$. Which statement is true?`,
        ['The load voltage reaches its final value at $t = T$ and stays there', 'The load voltage rings around its final value', 'The load voltage climbs in a staircase over many round trips', 'The first wave carries $\\tfrac45$ of $V_g$'], 0,
        [null, md`Ringing needs $\Gamma_g\Gamma_L < 0$. Here $\Gamma_g = 0$.`, md`A matched source absorbs the first reflection, so only one step ever reaches the load.`, md`That is $R_L/(R_g + R_L)$, the DC answer. The first wave is $\tau_gV_g = V_g/2$.`],
        md`$\Gamma_g = 0$: the reflection from the load is absorbed at the generator. The load sees one step, $\tfrac12V_g(1 + \tfrac35) = 0.8V_g$, at $t = T$, which equals the DC value $200/250 = 0.8$ ✓.`),
      Q(md`Which expression is the injection coefficient?`,
        [md`$\frac{Z_0}{R_g + Z_0}$`, md`$\frac{2R_g}{R_g + Z_0}$`, md`$\frac{R_g - Z_0}{R_g + Z_0}$`, md`$\frac{R_L}{R_g + R_L}$`], 0,
        [null, md`That is $1 + \Gamma_g$.`, md`That is $\Gamma_g$.`, md`That is the final (DC) fraction at the load.`],
        md`At $t = 0^+$ the line is a resistor $Z_0$ in series with $R_g$: $\tau_g = Z_0/(R_g + Z_0)$.`),
      Q(md`A 100 Ω line has a 10 V wave arriving at a load with $\Gamma_L = -\tfrac13$. The reflected **current** wave is…`,
        ['$+\\tfrac{1}{30}$ A', '$-\\tfrac{1}{30}$ A', '$+\\tfrac{1}{10}$ A', '$-\\tfrac{10}{3}$ A'], 0,
        [null, md`That uses $+\Gamma$ for current. $I^- = -\Gamma_LI^+ = +\tfrac13(0.1)$.`, md`That is the incident current, $0.1$ A.`, md`That is the reflected voltage, in volts.`],
        md`$I^+ = 0.1$ A, so $I^- = -(-\tfrac13)(0.1) = +\tfrac{1}{30}$ A. Equivalently $V^- = -\tfrac{10}{3}$ V and $I^- = -V^-/Z_0 = +\tfrac{1}{30}$ A.`),
      Q(md`Why does $\Gamma_g$ contain $R_g$ but not $V_g$?`,
        ['For changes, the constant source voltage cancels: the source acts as a short', 'Because the source is switched off after $t = 0$', 'Because $V_g$ is small', 'It does: $\\Gamma_g$ depends on $V_g$ through $\\tau_g$'], 0,
        [null, md`The source stays on. Its constant value cancels when you subtract KVL before and after an arrival.`, md`Its size is irrelevant: it cancels exactly.`, md`$\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$ has no $V_g$ and no $\tau_g$.`],
        md`KVL after minus KVL before: $0 = R_g\Delta I + \Delta V$. The returning wave sees only $R_g$.`),
      Q(md`$V_g = 20$ V, $R_g = 10\ \Omega$, $Z_0 = 50\ \Omega$, open load. The final current and the final load voltage are…`,
        ['0 A and 20 V', '0.4 A and 0 V', '0.333 A and 16.7 V', '0 A and 33.3 V'], 0,
        [null, md`That is a short. An open end carries no DC current.`, md`That is the first wave, $\tau_gV_g = 16.7$ V. It is not final.`, md`That is $2\tau_gV_g$, the first value at the open end. It rings in toward $V_g$.`],
        md`DC: no current flows into an open circuit, so there is no drop across $R_g$: $V_\infty = 20$ V, $I_\infty = 0$.`),
      Q(md`True or false: "The final voltage at the load depends on $Z_0$, because a bigger $Z_0$ launches a bigger first wave."`,
        ['False: $V_\\infty = V_gR_L/(R_g + R_L)$ for any $Z_0$', 'True: $V_\\infty = \\tau_gV_g$', 'True, unless the load is matched', 'False, but only when $R_g = 0$'], 0,
        [null, md`$\tau_gV_g$ is only the first wave. The reflections change the total.`, md`Even with a matched load, $V_L = \tau_gV_g = V_gZ_0/(R_g + Z_0) = V_gR_L/(R_g + R_L)$ because $R_L = Z_0$: the same DC formula.`, md`The geometric series gives the DC divider for every $R_g$ with $|\Gamma_g\Gamma_L| < 1$.`],
        md`$Z_0$ cancels in $\tau_g(1 + \Gamma_L)/(1 - \Gamma_g\Gamma_L)$. It changes how fast and in what shape the load gets there, not where it ends.`),
      Q(md`At $t = 2T^+$, just after the first reflection returns, the voltage at the generator end ($z = 0$) is…`,
        [md`$\tau_gV_g(1 + \Gamma_L + \Gamma_g\Gamma_L)$`, md`$\tau_gV_g(1 + \Gamma_L)$`, md`$\tau_gV_g(1 + \Gamma_g)$`, md`$\tau_gV_g\Gamma_g\Gamma_L$`], 0,
        [null, md`That forgets the new forward wave launched at the same instant.`, md`That leaves out the returning wave $\Gamma_L\tau_gV_g$.`, md`That is only the newest wave. The first two are still there.`],
        md`Three waves have passed $z = 0$ by then: the original $\tau_gV_g$, the returning $\Gamma_L\tau_gV_g$, and the new $\Gamma_g\Gamma_L\tau_gV_g$.`),
      R(md`
        ### Practice, level 1: the three numbers

        **The trick:** $\tau_g$ is a divider; $\Gamma$ is (far minus near) over (far plus near); current uses $-\Gamma$. Eight right completes a card.
      `),
      Object.assign(G('rf_w5t_coef', { need: 8 }), { id: 'w5-launch.r0' }),
      R(md`
        ### Practice, level 1: the first waves

        **The trick:** $V_1^+ = \tau_gV_g$, $V_L(T^+) = \tau_gV_g(1 + \Gamma_L)$, $I_L(T^+) = (\tau_gV_g/Z_0)(1 - \Gamma_L)$.
      `),
      Object.assign(G('rf_w5t_first', { need: 8 }), { id: 'w5-launch.r1' }),
      R(md`
        ### Practice, level 1: where it ends up

        **The trick:** the DC divider, no $Z_0$. The sign of $\Gamma_g\Gamma_L$ gives the shape.
      `),
      Object.assign(G('rf_w5t_dc', { need: 8 }), { id: 'w5-launch.r2' }),
      R(md`
        ### Practice, level 2: whole problems, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('w5t_launch', { need: 2 }),
      G('w5t_steady', { need: 2 }),
      G('w5t_probe', { need: 2 }),
      R(md`
        ### Practice, level 3: the exam's size of problem

        One line, a step, every number Spring 2024 #4 asks for, plus the DC check.
      `),
      G('w5t_exam2', { need: 2 }),
    ],
  });

  // ================================================================ lesson 2 helpers
  const ZS = [60, 90, 150, 300];
  const MS2 = [0, 1 / 3, 0.5, 2, 3, Infinity];                        // R as a multiple of Z0 (not 1: that gives zeros)
  const Rof = (Z, m) => (m === Infinity ? Infinity : Z * m);
  const RT = (R) => (R === Infinity ? '\\infty' : p(R));
  const gm = (R, Z) => (R === Infinity ? 1 : (R - Z) / (R + Z));
  const fr = (x) => TL.frac(x);
  const fo = (x, u) => `$${fr(x)}${u ? `\\ ${u}` : ''}$`;              // option: exact fraction with a unit
  const VGS = [12, 24, 36, 48, 60, 120];
  // a whole setup: Z0, Rg (finite), RL, Vg; avoid both ends lossless
  function setup(o = {}) {
    for (;;) {
      const Z = pick(ZS), mg = pick(o.mg || [0, 1 / 3, 0.5, 2, 3, 1]), mL = pick(o.mL || MS2);
      const Rg = Rof(Z, mg), RL = Rof(Z, mL), Vg = pick(VGS);
      const tg = Z / (Rg + Z), Gg = gm(Rg, Z), GL = gm(RL, Z);
      if (Math.abs(Gg * GL) > 0.999) continue;
      if (o.ok && !o.ok({ Z, Rg, RL, tg, Gg, GL, Vg })) continue;
      const dcV = RL === Infinity ? Vg : (Vg * RL) / (Rg + RL), dcI = RL === Infinity ? 0 : Vg / (Rg + RL);
      return { Z, Rg, RL, Vg, tg, Gg, GL, dcV, dcI };
    }
  }

  // ================================================================ lesson 2, level 1
  GENS.rf_w5t_coef = () => one([
    () => {
      const Z = pick(ZS), mg = pick([0, 1 / 3, 0.5, 1, 2, 3]), mL = pick([0.5, 2, 3, Infinity]), Rg = Z * mg, RL = Rof(Z, mL);
      const tg = Z / (Rg + Z), Gg = gm(Rg, Z);
      return MC('Injection coefficient', md`$R_g = ${p(Rg)}\ \Omega$, $Z_0 = ${Z}\ \Omega$, $R_L = ${RT(RL)}\ \Omega$. The injection coefficient $\tau_g$ is…`, fo(tg),
        [[fo(1 - tg), md`That is $R_g/(R_g + Z_0)$, the share dropped across $R_g$.`],
          [fo(1 + Gg), md`That is $1 + \Gamma_g$. The launch is the divider $Z_0/(R_g + Z_0)$; check: $\tau_g = (1 - \Gamma_g)/2$.`],
          [fo(RL === Infinity ? 1 : Z / (RL + Z)), md`That uses $R_L$. At $t = 0^+$ the source cannot see the load.`],
          [fo(Gg), md`That is $\Gamma_g$, the reflection for a returning wave.`]],
        md`$\tau_g = Z_0/(R_g + Z_0) = ${Z}/${p(Rg + Z)} = ${fr(tg)}$.`);
    },
    () => {
      const Z = pick(ZS), mL = pick([0, 1 / 3, 0.5, 2, 3, Infinity]), RL = Rof(Z, mL), G0 = gm(RL, Z);
      return MC('Load reflection', md`A $${Z}\ \Omega$ line ends in $R_L = ${RT(RL)}\ \Omega$. $\Gamma_L$ is…`, fo(G0),
        [[fo(-G0), md`That is upside down: $(Z_0 - R_L)/(Z_0 + R_L)$. A load ${mL > 1 ? 'larger' : 'smaller'} than $Z_0$ gives a ${mL > 1 ? 'positive' : 'negative'} $\Gamma_L$.`],
          [fo(1 + G0), md`That is $1 + \Gamma_L$, the total voltage at the load per volt of incident wave.`],
          [fo(RL === Infinity ? 0.5 : RL / (RL + Z)), md`That is a divider fraction, not a reflection coefficient.`],
          [fo(1 - G0), md`That is $1 - \Gamma_L$, the total current at the load per ampere of incident wave.`]],
        md`$\Gamma_L = (R_L - Z_0)/(R_L + Z_0) = ${RL === Infinity ? '1\\ (\\text{open})' : `${p(RL - Z)}/${p(RL + Z)} = ${fr(G0)}`}$.`);
    },
    () => {
      const Z = pick(ZS), mg = pick([0, 1 / 3, 0.5, 2, 3]), Rg = Z * mg, G0 = gm(Rg, Z);
      return MC('Generator reflection', md`A returning wave reaches the generator end: $R_g = ${p(Rg)}\ \Omega$, $Z_0 = ${Z}\ \Omega$. $\Gamma_g$ is…`, fo(G0),
        [[fo(-G0), md`Upside down. $\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$.`],
          [fo(Z / (Rg + Z)), md`That is $\tau_g$, the injection coefficient, used only at $t = 0$.`],
          [fo(1 + G0), md`That is $1 + \Gamma_g$.`],
          ['$0$', md`Zero needs $R_g = Z_0$, a matched source. The source itself is a short for changes; only $R_g$ counts.`]],
        md`$\Gamma_g = (R_g - Z_0)/(R_g + Z_0) = ${p(Rg - Z)}/${p(Rg + Z)} = ${fr(G0)}$.`);
    },
    () => {
      const [Ip, G0] = [pick([0.1, 0.2, 0.3, 0.4, 0.6]), pick([-1 / 2, -1 / 3, 1 / 3, 1 / 2])];
      const ask = pick(['ref', 'load']);
      const r = ask === 'ref' ? -G0 * Ip : Ip * (1 - G0);
      const A = (x) => o(x, '\\text{A}');
      return MC('Current reflection', md`An incident current wave of $${Ip}$ A reaches a load with $\Gamma_L = ${fr(G0)}$. The ${ask === 'ref' ? 'reflected current wave' : 'total current in the load, just after'} is…`, A(r),
        [[A(ask === 'ref' ? G0 * Ip : Ip * (1 + G0)), md`That uses $+\Gamma_L$ for current. Current reflects with $-\Gamma_L$.`],
          [A(ask === 'ref' ? Ip * (1 - G0) : -G0 * Ip), md`${ask === 'ref' ? 'That is the total in the load, incident plus reflected.' : 'That is the reflected wave alone. The load carries incident plus reflected.'}`],
          [A(Ip), md`That ignores the reflection.`],
          [A(ask === 'ref' ? -Ip : Ip * (1 + 2 * Math.abs(G0))), md`${ask === 'ref' ? 'That is $\\Gamma = 1$ for current. Use the actual $\\Gamma_L$.' : 'Only one reflection happens at this instant: $I^+(1 - \\Gamma_L)$.'}`]],
        md`$I^- = -\Gamma_LI^+ = ${p(+(-G0 * Ip).toPrecision(3))}$ A, so the load carries $I^+(1 - \Gamma_L) = ${p(+(Ip * (1 - G0)).toPrecision(3))}$ A.`);
    },
    () => {
      const L = pick([
        ['an open end', 'twice the incident voltage, and zero current', [['zero voltage, and twice the incident current', md`That is a short ($\Gamma_L = -1$).`], ['the incident voltage and current, unchanged', md`That is a matched load ($\Gamma_L = 0$).`], ['twice the incident voltage, and twice the incident current', md`Current reflects with $-\Gamma_L = -1$: it cancels at an open end.`]], md`$\Gamma_L = +1$: $V_L = V^+(1 + 1)$ and $I_L = I^+(1 - 1) = 0$.`],
        ['a short', 'zero voltage, and twice the incident current', [['twice the incident voltage, and zero current', md`That is an open end ($\Gamma_L = +1$).`], ['the incident voltage and current, unchanged', md`That is a matched load.`], ['zero voltage, and zero current', md`The voltage cancels, but the current reflects with $-\Gamma_L = +1$ and doubles.`]], md`$\Gamma_L = -1$: $V_L = V^+(1 - 1) = 0$ and $I_L = I^+(1 + 1)$.`],
        ['a matched load, $R_L = Z_0$', 'the incident voltage and current, unchanged, with no reflected wave', [['twice the incident voltage, and zero current', md`That is an open end.`], ['zero voltage, and twice the incident current', md`That is a short.`], ['half the incident voltage, reflected', md`$\Gamma_L = (Z_0 - Z_0)/(2Z_0) = 0$: nothing reflects.`]], md`$\Gamma_L = 0$: the load takes exactly the $V/I$ the wave has.`],
      ]);
      return MC('Special loads', md`A step wave reaches ${L[0]}. Just after, the end has…`, L[1], L[2], L[3]);
    },
    () => {
      const Z = pick([50, 60, 100, 150]), mg = pick([1 / 3, 0.5, 2, 3]), Rg = Z * mg;
      const tg = Z / (Rg + Z), Gg = gm(Rg, Z);
      const q = pick(['tau', 'check']);
      return q === 'tau'
        ? MC('τ_g versus 1 + Γ_g', md`$R_g = ${p(Rg)}\ \Omega$, $Z_0 = ${Z}\ \Omega$. Which number is $1 + \Gamma_g$?`, fo(1 + Gg),
          [[fo(tg), md`That is $\tau_g$. It is a different number: $\tau_g = (1 - \Gamma_g)/2$.`], [fo(Gg), md`That is $\Gamma_g$ itself.`], [fo(1 - Gg), md`That is $1 - \Gamma_g = 2\tau_g$.`]],
          md`$\Gamma_g = ${fr(Gg)}$, so $1 + \Gamma_g = ${fr(1 + Gg)}$. Compare $\tau_g = ${fr(tg)}$: not the same.`)
        : MC('A quick check', md`You computed $\Gamma_g = ${fr(Gg)}$. Then $\tau_g$ must be…`, fo(tg),
          [[fo(1 + Gg), md`That is $1 + \Gamma_g$. The identity is $\tau_g = (1 - \Gamma_g)/2$.`], [fo(1 - Gg), md`That is $1 - \Gamma_g$, twice $\tau_g$.`], [fo(-Gg), md`$\tau_g$ is always positive and comes from $(1 - \Gamma_g)/2$.`]],
          md`$\tau_g = (1 - \Gamma_g)/2 = (1 ${Gg < 0 ? '+' : '-'} ${fr(Math.abs(Gg))})/2 = ${fr(tg)}$.`);
    },
  ]);

  GENS.rf_w5t_first = () => one([
    () => {
      const s = setup();
      const V = (x) => fo(x, '\\text{V}');
      return MC('The first wave', md`$V_g = ${s.Vg}$ V, $R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$, $R_L = ${RT(s.RL)}\ \Omega$. The first wave launched has voltage…`, V(s.tg * s.Vg),
        [[V((1 - s.tg) * s.Vg), md`That is the drop across $R_g$, $V_gR_g/(R_g + Z_0)$.`],
          [V(s.dcV), md`That is the final DC value. At $t = 0^+$ the line is a resistor $Z_0$, not $R_L$.`],
          [V(s.Vg), md`Only an ideal source ($R_g = 0$) puts all of $V_g$ on the line.`],
          [V(s.Vg / 2), md`Half needs $R_g = Z_0$.`]],
        md`$\tau_g = ${fr(s.tg)}$, so $V_1^+ = ${fr(s.tg)}\cdot${s.Vg} = ${fr(s.tg * s.Vg)}$ V.`);
    },
    () => {
      const s = setup({ mg: [1 / 3, 0.5, 2, 3, 1] });
      const A = (x) => o(x, '\\text{A}');
      return MC('The first current', md`$V_g = ${s.Vg}$ V, $R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$. The first current wave is…`, A(s.Vg / (s.Rg + s.Z)),
        [[A(s.Vg / s.Z), md`That ignores $R_g$. The line and $R_g$ are in series: $V_g/(R_g + Z_0)$.`], [A(s.Vg / s.Rg), md`That ignores the line, which looks like $Z_0$.`], [A((s.tg * s.Vg) / s.Rg), md`That divides the line's voltage by $R_g$. Divide it by $Z_0$.`]],
        md`$I_1^+ = V_g/(R_g + Z_0) = ${s.Vg}/${p(s.Rg + s.Z)} = ${p(+(s.Vg / (s.Rg + s.Z)).toPrecision(3))}$ A.`);
    },
    () => {
      const s = setup({ mL: [1 / 3, 0.5, 2, 3, Infinity] });
      const V = (x) => fo(x, '\\text{V}'), V1 = s.tg * s.Vg;
      return MC('The load at T⁺', md`$V_g = ${s.Vg}$ V, $R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$, $R_L = ${RT(s.RL)}\ \Omega$. Just after the first wave reaches the load, $V_L$ is…`, V(V1 * (1 + s.GL)),
        [[V(V1), md`That forgets the reflection, which starts at the same instant: $V_L = V^+(1 + \Gamma_L)$.`],
          [V(V1 * s.GL), md`That is the reflected wave alone.`],
          [V(V1 * (1 - s.GL)), md`That uses $1 - \Gamma_L$, the current factor.`],
          [V(s.dcV), md`That is the final DC value, reached only after many round trips${s.Gg === 0 ? ' (here the same number, because the generator is matched, but the reason is different)' : ''}.`]],
        md`$V_1^+ = ${fr(V1)}$ V and $\Gamma_L = ${fr(s.GL)}$, so $V_L(T^+) = ${fr(V1)}(1 ${s.GL < 0 ? '-' : '+'} ${fr(Math.abs(s.GL))}) = ${fr(V1 * (1 + s.GL))}$ V.`);
    },
    () => {
      const s = setup({ mL: [0, 1 / 3, 0.5, 2, 3] });
      const A = (x) => o(x, '\\text{A}'), I1 = (s.tg * s.Vg) / s.Z;
      return MC('The load current at T⁺', md`$V_g = ${s.Vg}$ V, $R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$, $R_L = ${RT(s.RL)}\ \Omega$. Just after the first wave reaches the load, the load current is…`, A(I1 * (1 - s.GL)),
        [[A(I1 * (1 + s.GL)), md`That uses $+\Gamma_L$. Current reflects with $-\Gamma_L$.`], [A(I1), md`That forgets the reflected current.`], [A(s.dcI), md`That is the final DC current.`], [A(-I1 * s.GL), md`That is the reflected current alone.`]],
        md`$I_1^+ = ${p(+I1.toPrecision(3))}$ A, so $I_L = I_1^+(1 - \Gamma_L) = ${p(+(I1 * (1 - s.GL)).toPrecision(3))}$ A. Check: $R_L I_L$ equals $V_L(T^+)$.`);
    },
    () => {
      const s = setup({ mg: [0, 1 / 3, 0.5, 2, 3], mL: [0, 1 / 3, 0.5, 2, 3, Infinity] });
      const V = (x) => fo(x, '\\text{V}'), V1 = s.tg * s.Vg, r = V1 * (1 + s.GL + s.Gg * s.GL);
      return MC('The generator end at 2T⁺', md`$V_g = ${s.Vg}$ V, $R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$, $R_L = ${RT(s.RL)}\ \Omega$. Just after the first reflection returns to $z = 0$, $V(0)$ is…`, V(r),
        [[V(V1 * (1 + s.GL)), md`That forgets the new forward wave $\Gamma_g\Gamma_LV_1^+$ launched at the same instant.`],
          [V(V1), md`That ignores the returning wave.`],
          [V(V1 * (1 + s.Gg * s.GL)), md`That keeps the new forward wave but forgets the returning one that caused it.`],
          [V(s.dcV), md`That is the final value, not the value at $2T^+$.`]],
        md`Three waves have passed $z = 0$: $V_1^+ = ${fr(V1)}$, the return $\Gamma_LV_1^+ = ${fr(V1 * s.GL)}$, and the new $\Gamma_g\Gamma_LV_1^+ = ${fr(V1 * s.Gg * s.GL)}$. Sum: $${fr(r)}$ V.`);
    },
  ]);

  GENS.rf_w5t_dc = () => one([
    () => {
      const s = setup({ mL: [1 / 3, 0.5, 2, 3] });
      const V = (x) => fo(x, '\\text{V}');
      return MC('Final load voltage', md`$V_g = ${s.Vg}$ V, $R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$, $R_L = ${p(s.RL)}\ \Omega$. After the waves settle, $V_L$ is…`, V(s.dcV),
        [[V(s.tg * s.Vg * (1 + s.GL)), md`That is the first value, at $T^+$. The reflections keep changing it.`],
          [V(s.tg * s.Vg), md`That is the first launched wave.`],
          [V((s.Vg * s.RL) / (s.Z + s.RL)), md`That puts $Z_0$ where $R_g$ belongs. At DC the line is a pair of wires.`],
          [V(s.Vg), md`Only an open load (or $R_g = 0$) ends at $V_g$.`]],
        md`$V_\infty = V_gR_L/(R_g + R_L) = ${s.Vg}\cdot${p(s.RL)}/${p(s.Rg + s.RL)} = ${fr(s.dcV)}$ V. $Z_0$ cancels.`);
    },
    () => {
      const s = setup({ mL: [0, 1 / 3, 0.5, 2, 3], mg: [1 / 3, 0.5, 2, 3, 1] });
      const A = (x) => o(x, '\\text{A}');
      return MC('Final current', md`$V_g = ${s.Vg}$ V, $R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$, $R_L = ${p(s.RL)}\ \Omega$. After the waves settle, the current is…`, A(s.dcI),
        [[A(s.Vg / (s.Rg + s.Z)), md`That is the first current wave. At DC, $Z_0$ plays no part.`], [A(s.Vg / (s.Z + s.RL)), md`That puts $Z_0$ in place of $R_g$.`], [A(s.Vg / (s.Rg + s.Z + s.RL)), md`The line is not a series resistor at DC: it is two plain wires.`]],
        md`$I_\infty = V_g/(R_g + R_L) = ${s.Vg}/${p(s.Rg + s.RL)} = ${p(+s.dcI.toPrecision(3))}$ A.`);
    },
    () => {
      const s = setup({ mg: [0, 1 / 3, 0.5, 2, 3], mL: [0, 1 / 3, 0.5, 2, 3, Infinity] });
      const pr = s.Gg * s.GL;
      const CL = 'a staircase toward the final value, never overshooting', RI = 'overshooting and ringing around the final value';
      return MC('Climb or ring?', md`$R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$, $R_L = ${RT(s.RL)}\ \Omega$. The load voltage approaches its final value as…`, pr > 0 ? CL : RI,
        [[pr > 0 ? RI : CL, md`$\Gamma_g = ${fr(s.Gg)}$ and $\Gamma_L = ${fr(s.GL)}$; their product is ${pr > 0 ? 'positive, so every step has the same sign' : 'negative, so the steps alternate'}.`],
          ['a single step at $t = T$, then constant', md`That needs a matched end. Here neither $\Gamma$ is zero.`],
          ['an oscillation that never dies', md`That needs $|\Gamma_g\Gamma_L| = 1$. Here it is $${fr(Math.abs(pr))}$.`]],
        md`$\Gamma_g\Gamma_L = ${fr(pr)}$ is ${pr > 0 ? 'positive: a staircase' : 'negative: the steps alternate, so it rings'}.`);
    },
    () => {
      const s = setup({ mL: [1 / 3, 0.5, 2, 3, Infinity] });
      const tot = (s.tg * s.Vg) / (1 - s.Gg * s.GL);
      const V = (x) => o(x, '\\text{V}');
      return MC('The series', md`$\tau_gV_g = ${fr(s.tg * s.Vg)}$ V, $\Gamma_g = ${fr(s.Gg)}$, $\Gamma_L = ${fr(s.GL)}$. All the forward waves together add up to…`, V(tot),
        [[V(s.tg * s.Vg * (1 + s.GL) / (1 - s.Gg * s.GL)), md`That is the final load voltage, forward plus backward. The question asks for the forward waves only.`],
          [V((s.tg * s.Vg) / (1 + s.Gg * s.GL)), md`The series $1 + r + r^2 + \cdots$ sums to $1/(1 - r)$, not $1/(1 + r)$.`],
          [V(s.tg * s.Vg * (1 + s.Gg * s.GL)), md`That keeps only the first two terms of the series.`]],
        md`$V^+_{\text{tot}} = \tau_gV_g/(1 - \Gamma_g\Gamma_L) = ${fr(s.tg * s.Vg)}/(1 - (${fr(s.Gg * s.GL)})) = ${p(+tot.toPrecision(3))}$ V.`);
    },
    () => {
      const Rg = pick([10, 25, 50, 100]), Vg = pick([5, 10, 20]);
      const pair = pick([[50, 300], [75, 150], [25, 100]]);
      return MC('Does Z₀ matter at the end?', md`The same source ($V_g = ${Vg}$ V, $R_g = ${Rg}\ \Omega$) and the same open-ended load drive two cables, one with $Z_0 = ${pair[0]}\ \Omega$ and one with $Z_0 = ${pair[1]}\ \Omega$. Their final load voltages are…`, `both $${Vg}$ V`,
        [[`$${p(+((Vg * pair[0]) / (Rg + pair[0])).toPrecision(3))}$ V and $${p(+((Vg * pair[1]) / (Rg + pair[1])).toPrecision(3))}$ V`, md`Those are the first launched waves, $\tau_gV_g$. The final value has no $Z_0$.`],
          [`$${p(+((2 * Vg * pair[0]) / (Rg + pair[0])).toPrecision(3))}$ V and $${p(+((2 * Vg * pair[1]) / (Rg + pair[1])).toPrecision(3))}$ V`, md`Those are the first values at the open end, $2\tau_gV_g$. Reflections follow.`],
          [`both $${Vg / 2}$ V`, md`Half would need a load equal to $R_g$. An open load carries no DC current.`]],
        md`Open load: no DC current, no drop across $R_g$, so $V_\infty = V_g = ${Vg}$ V for both. $Z_0$ changes the path, not the end.`);
    },
  ]);

  // ================================================================ lesson 2, level 2 and 3
  // line lengths and speeds with a clean one-way time T (µs); v in m/µs
  const GEO = [[300, 150, 'c/2'], [300, 300, 'c'], [200, 100, 'c/3'], [400, 200, '2\\times10^8\\ \\text{m/s}'], [600, 300, 'c']];

  GENS.w5t_launch = () => {
    const s = setup({ mg: [1 / 3, 0.5, 2, 3], mL: [1 / 3, 0.5, 2, 3, Infinity] });
    const V1 = s.tg * s.Vg, VL = V1 * (1 + s.GL);
    const parts = [
      NT('\\tau_g', s.tg, '', [[1 + s.Gg, 'That is 1 + Γg. τg = Z0/(Rg + Z0) = (1 − Γg)/2.'], [1 - s.tg, 'That is Rg/(Rg + Z0).']]),
      NT('\\Gamma_g', s.Gg, '', [[-s.Gg, 'Upside down: Γg = (Rg − Z0)/(Rg + Z0).']]),
      NT('\\Gamma_L', s.GL, '', [[-s.GL, 'Upside down: ΓL = (RL − Z0)/(RL + Z0).']]),
      NT('V_1^+', V1, 'V', [[s.dcV, 'That is the DC value. At t = 0+ the line looks like Z0.']]),
      NT('V_1^-\\ \\text{(reflected)}', V1 * s.GL, 'V', [[-V1 * s.GL, 'Sign: V− = ΓL V+.']]),
      NT('V_L(T^+)', VL, 'V', [[V1, 'That forgets the reflected wave, which starts at the same instant.']]),
    ];
    if (s.RL !== Infinity) parts.push(NT('I_L(T^+)', (V1 / s.Z) * (1 - s.GL), 'A', [[(V1 / s.Z) * (1 + s.GL), 'Current reflects with −ΓL.']]));
    return {
      title: 'Launch and first reflection',
      q: md`A step source $V_g = ${s.Vg}$ V with $R_g = ${p(s.Rg)}\ \Omega$ drives a line with $Z_0 = ${s.Z}\ \Omega$, ending in $R_L = ${RT(s.RL)}\ \Omega$${s.RL === Infinity ? ' (open)' : ''}. Find $\tau_g$, $\Gamma_g$, $\Gamma_L$, the first wave, its reflection, and the load voltage${s.RL !== Infinity ? ' and current' : ''} just after the first arrival.`,
      plan: plan(md`What does the source see at $t = 0^+$, and what happens at the load?`, md`A divider of $R_g$ and $Z_0$ launches $\tau_gV_g$; at the load the wave and its reflection add: $V^+(1 + \Gamma_L)$`,
        [[md`A divider of $R_g$ and $R_L$ launches the first wave`, md`That is the DC answer. Until $2T$ the source cannot see $R_L$; the line looks like $Z_0$.`], [md`The first wave is $(1 + \Gamma_g)V_g$`, md`$1 + \Gamma$ multiplies an arriving wave. At $t = 0$ nothing arrives; use the divider.`], [md`The load voltage is $V^+$ until the reflection gets back`, md`The reflection starts at the load the instant $V^+$ arrives, so the load sees both at once.`]],
        md`Launch: divider. Load: Ohm's law with incident plus reflected.`),
      parts,
      hints: [md`$\tau_g = Z_0/(R_g + Z_0)$; $\Gamma = (R - Z_0)/(R + Z_0)$ at each end.`, md`$V_L(T^+) = \tau_gV_g(1 + \Gamma_L)$; $I_L(T^+) = (\tau_gV_g/Z_0)(1 - \Gamma_L)$.`],
      sol: md`
        **Step 1: τ_g.** The line looks like $Z_0$ to the source:
        $$\tau_g = \frac{${s.Z}}{${p(s.Rg)} + ${s.Z}} = ${fr(s.tg)}$$
        **Step 2: Γ_g and Γ_L.**
        $$\Gamma_g = \frac{${p(s.Rg)} - ${s.Z}}{${p(s.Rg)} + ${s.Z}} = ${fr(s.Gg)}$$
        $$\Gamma_L = ${s.RL === Infinity ? '1\\quad(\\text{open})' : `\\frac{${p(s.RL)} - ${s.Z}}{${p(s.RL)} + ${s.Z}} = ${fr(s.GL)}`}$$
        Check: $(1 - \Gamma_g)/2 = ${fr((1 - s.Gg) / 2)} = \tau_g$ ✓.

        **Step 3: the first wave and its reflection.**
        $$V_1^+ = ${fr(s.tg)}\cdot${s.Vg} = ${fr(V1)}\ \text{V}$$
        $$V_1^- = \Gamma_LV_1^+ = ${fr(V1 * s.GL)}\ \text{V}$$
        **Step 4: the load just after $T$.**
        $$V_L = V_1^+ + V_1^- = ${fr(VL)}\ \text{V}$$
        ${s.RL !== Infinity ? md`The current: $I_1^+ = ${fr(V1)}/${s.Z} = ${f(V1 / s.Z)}$ A, reflected with $-\Gamma_L$:
        $$I_L = ${f(V1 / s.Z)}(1 ${s.GL < 0 ? '+' : '-'} ${fr(Math.abs(s.GL))}) = ${f((V1 / s.Z) * (1 - s.GL))}\ \text{A}$$
        Ohm's law: $${fr(VL)}/${f((V1 / s.Z) * (1 - s.GL))} = ${f(VL / ((V1 / s.Z) * (1 - s.GL)))}\ \Omega = R_L$ ✓.` : md`An open end carries no current, and the voltage doubled: $2\cdot${fr(V1)} = ${fr(VL)}$ V ✓.`}
      `,
    };
  };

  GENS.w5t_steady = () => {
    const s = setup({ mg: [1 / 3, 0.5, 2, 3], mL: [1 / 3, 0.5, 2, 3, Infinity] });
    const [len, v] = pick(GEO), T = len / v, V1 = s.tg * s.Vg, r = s.Gg * s.GL;
    const L1 = V1 * (1 + s.GL), L3 = L1 * (1 + r), L5 = L1 * (1 + r + r * r);
    const sol = TL.solve({ Vg: s.Vg, Rg: s.Rg, RL: s.RL, sections: [{ Z0: s.Z, len, v }], tMax: 7 * T });
    const parts = [
      NT('V_L(T^+)', L1, 'V', [[V1, 'The reflection starts at the same instant: V+(1 + ΓL).']]),
      NT('V_L(3T^+)', L3, 'V', [[L1 + V1 * r, 'The second forward wave reflects at the load as it arrives: add V2+(1 + ΓL).']]),
      NT('V_L(5T^+)', L5, 'V', []),
      NT('V_L(\\infty)', s.dcV, 'V', [[V1, 'That is τg Vg, the first wave. The final value is the DC divider.']]),
      { lbl: 'Shape of the approach', mc: ['a staircase that never overshoots', 'overshoot and ringing around the final value', 'one step at $t = T$, then constant', 'an oscillation that never dies'], a: r > 0 ? 0 : 1,
        why: r > 0 ? [null, md`Ringing needs $\Gamma_g\Gamma_L < 0$; here it is $${fr(r)}$.`, md`That needs a matched end.`, md`That needs $|\Gamma_g\Gamma_L| = 1$.`] : [md`A staircase needs $\Gamma_g\Gamma_L > 0$; here it is $${fr(r)}$.`, null, md`That needs a matched end.`, md`That needs $|\Gamma_g\Gamma_L| = 1$.`] },
    ];
    return {
      title: 'Steps at the load, and where they end',
      q: md`$V_g = ${s.Vg}$ V (a step), $R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$, $R_L = ${RT(s.RL)}\ \Omega$. The line is $${len}$ m long with $v = ${v}$ m/µs. Find the load voltage just after $T$, $3T$ and $5T$, its final value, and the shape of the approach.`,
      plan: plan(md`How do you get the load voltage after each arrival, and how do you check it?`, md`Each arrival adds the next forward wave times $(1 + \Gamma_L)$; the waves shrink by $\Gamma_g\Gamma_L$ per round trip; the end is $V_gR_L/(R_g + R_L)$`,
        [[md`Each arrival adds $\Gamma_L$ times the previous step`, md`Between two load arrivals the wave also reflects at the generator: the ratio per round trip is $\Gamma_g\Gamma_L$.`], [md`The final value is $\tau_gV_g$`, md`That is only the first wave. The DC divider is the final value.`], [md`Draw the whole bounce diagram first; there is no shortcut`, md`For the load alone, the steps form a geometric series you can write directly.`]],
        md`$V_L$ after the $n$th arrival is $\tau_gV_g(1 + \Gamma_L)(1 + r + \cdots + r^{n-1})$ with $r = \Gamma_g\Gamma_L$, heading to the DC value.`),
      parts,
      figs: { vl: { svg: TL.plotT(sol, len, { tMax: 7 * T, w: 380 }), cap: 'The load voltage. Dashed: the DC value.' } },
      hints: [md`$T = ${len}/${v} = ${p(T)}\ \mu$s. $V_L(T^+) = \tau_gV_g(1 + \Gamma_L)$.`, md`Each later step is the previous one times $\Gamma_g\Gamma_L = ${fr(r)}$.`],
      sol: md`
        **Step 1: the three numbers.** $\tau_g = ${fr(s.tg)}$, $\Gamma_g = ${fr(s.Gg)}$, $\Gamma_L = ${fr(s.GL)}$. So $V_1^+ = ${fr(V1)}$ V and the ratio per round trip is
        $$r = \Gamma_g\Gamma_L = ${fr(r)}$$
        **Step 2: the first arrival, at $T = ${p(T)}\ \mu$s.**
        $$V_L(T^+) = ${fr(V1)}(1 ${s.GL < 0 ? '-' : '+'} ${fr(Math.abs(s.GL))}) = ${fr(L1)}\ \text{V}$$
        **Step 3: the next arrivals.** Each step is $r$ times the last one:
        $$V_L(3T^+) = ${fr(L1)}(1 ${r < 0 ? '-' : '+'} ${fr(Math.abs(r))}) = ${fr(L3)}\ \text{V}$$
        $$V_L(5T^+) = ${fr(L3)} + ${fr(L1 * r * r)} = ${fr(L5)}\ \text{V}$$
        **Step 4: the final value.** ${s.RL === Infinity ? md`Open load: no DC current, so $V_\infty = V_g = ${s.Vg}$ V.` : md`The DC divider:
        $$V_\infty = \frac{${p(s.RL)}}{${p(s.Rg)} + ${p(s.RL)}}\cdot${s.Vg} = ${fr(s.dcV)}\ \text{V}$$`}
        Series check: $${fr(L1)}/(1 - (${fr(r)})) = ${fr(L1 / (1 - r))}$ V ✓.

        **Step 5: the shape.** $r = ${fr(r)}$ is ${r > 0 ? 'positive: every step has the same sign, a staircase' : 'negative: the steps alternate, so the voltage overshoots and rings in'}.

        [[fig:vl]]
      `,
    };
  };

  GENS.w5t_probe = () => {
    for (;;) {
      const s = setup({ mg: [0, 1 / 3, 0.5, 2, 3], mL: [0, 1 / 3, 0.5, 2, 3, Infinity] });
      const [len, v] = pick(GEO), T = len / v, zf = pick([0.25, 0.5, 0.75]), z = zf * len;
      const sol = TL.solve({ Vg: s.Vg, Rg: s.Rg, RL: s.RL, sections: [{ Z0: s.Z, len, v }], tMax: 8 * T });
      const arr = TL.arrivals(sol, z).filter((a) => a.t < 6 * T);
      const k = pick([2, 3, 4]);
      if (arr.length < k + 1) continue;
      const t = +((arr[k - 1].t + arr[k].t) / 2).toPrecision(6);
      const Vv = TL.valueAt(sol, z, t, 'V'), Iv = TL.valueAt(sol, z, t, 'I');
      if (Math.abs(Vv) < 1e-9 || Math.abs(Iv) < 1e-9) continue;
      const passed = arr.slice(0, k);
      const rows = passed.map((a) => `| ${a.dir > 0 ? 'forward' : 'backward'} | $${fr(a.t)}$ | $${fr(a.v)}$ V | $${fr(a.i)}$ A |`).join('\n          ');
      return {
        title: 'Voltage and current at one point and one time',
        q: md`$V_g = ${s.Vg}$ V (a step), $R_g = ${p(s.Rg)}\ \Omega$, $Z_0 = ${s.Z}\ \Omega$, $R_L = ${RT(s.RL)}\ \Omega$. The line is $${len}$ m long with $v = ${v}$ m/µs. Find $V$ and $I$ at $z = ${p(z)}$ m and $t = ${p(t)}\ \mu$s.`,
        plan: plan(md`How do you find $V(z, t)$ at one point?`, md`List every wave that has passed $z$ by time $t$ and add their values`,
          [[md`Use the final DC value`, md`At a finite time only the waves that have arrived count; the DC value is the limit.`], [md`Take the most recent wave only`, md`Every wave that passed is still there: steps add up.`], [md`Use $V = \tau_gV_g$ everywhere until $t = 2T$`, md`The reflection from the load reaches points near the load well before $2T$.`]],
          md`Each wave is a step: once it passes a point it stays added. A vertical probe line on the bounce diagram picks them out.`),
        parts: [
          NT(`V(${p(z)}\\ \\text{m},\\ ${p(t)}\\ \\mu\\text{s})`, Vv, 'V', [[TL.valueAt(sol, z, arr[k].t + 1e-9, 'V'), 'That includes a wave that has not reached z yet.'], [TL.valueAt(sol, z, arr[k - 2].t + 1e-9, 'V'), 'That stops one wave too early.']]),
          NT(`I(${p(z)}\\ \\text{m},\\ ${p(t)}\\ \\mu\\text{s})`, Iv, 'A', [[passed.reduce((x, a) => x + Math.abs(a.i), 0), 'Backward waves carry current of the opposite sign: I− = −V−/Z0.']]),
        ],
        figs: { bd: { svg: TL.diagram(sol, { tMax: 6 * T, probe: z, w: 360, h: 340 }), cap: `The probe line at z = ${p(z)} m: each dot is a wave passing.` } },
        hints: [md`$T = ${p(T)}\ \mu$s. Waves cross $z$ at $z/v$, $2T - z/v$, $2T + z/v$, …`, md`$\tau_g = ${fr(s.tg)}$, $\Gamma_g = ${fr(s.Gg)}$, $\Gamma_L = ${fr(s.GL)}$.`],
        sol: md`
          **Step 1: the numbers.** $T = ${len}/${v} = ${p(T)}\ \mu$s. $\tau_g = ${fr(s.tg)}$, $\Gamma_g = ${fr(s.Gg)}$, $\Gamma_L = ${fr(s.GL)}$, so the first wave is $${fr(s.tg * s.Vg)}$ V.

          **Step 2: which waves have passed.** A wave going forward crosses $z = ${p(z)}$ m a time $${p(z / v)}\ \mu$s after leaving the generator; a backward one $${p((len - z) / v)}\ \mu$s after leaving the load. By $t = ${p(t)}\ \mu$s:

          | Wave | Passes at (µs) | V | I |
          |---|---|---|---|
          ${rows}

          [[fig:bd]]

          **Step 3: add them.**
          $$V = ${passed.map((a) => fr(a.v)).join(' + ').replace(/\+ -/g, '- ')} = ${fr(Vv)}\ \text{V}$$
          $$I = ${passed.map((a) => fr(a.i)).join(' + ').replace(/\+ -/g, '- ')} = ${fr(Iv)}\ \text{A}$$
          The next wave reaches this point at $${fr(arr[k].t)}\ \mu$s, after the time asked.

          **Check.** The values head toward $V_\infty = ${fr(s.dcV)}$ V and $I_\infty = ${fr(s.dcI)}$ A.
        `,
      };
    }
  };

  // level 3: one line, Spring 2024 #4 style
  GENS.w5t_exam2 = () => {
    for (;;) {
      const s = setup({ mg: [1 / 3, 0.5, 2, 3], mL: [0, 1 / 3, 0.5, 2, 3, Infinity] });
      const [len, v, vt] = pick(GEO), T = len / v, V1 = s.tg * s.Vg;
      const sol = TL.solve({ Vg: s.Vg, Rg: s.Rg, RL: s.RL, sections: [{ Z0: s.Z, len, v }], tMax: 5 * T });
      const zm = len / 2, tm = 3 * T, tL = 3.5 * T, t0 = 2.5 * T;
      const Vm = TL.valueAt(sol, zm, tm, 'V'), VLv = TL.valueAt(sol, len, tL, 'V'), I0 = TL.valueAt(sol, 0, t0, 'I');
      if ([Vm, VLv, I0].some((x) => Math.abs(x) < 1e-9)) continue;
      const stmts = [
        ['The first wave would be the same if $R_L$ were changed', true, md`$\tau_g = Z_0/(R_g + Z_0)$ has no $R_L$: the source cannot see the load before $2T$.`],
        ['The final load voltage would change if $Z_0$ were doubled', false, md`$V_\infty = V_gR_L/(R_g + R_L)$ has no $Z_0$.`],
        ['$\\tau_g = 1 + \\Gamma_g$', false, md`$\tau_g = (1 - \Gamma_g)/2$; here $1 + \Gamma_g = ${fr(1 + s.Gg)}$ but $\tau_g = ${fr(s.tg)}$.`],
        ['On the current diagram the load reflects with $-\\Gamma_L$', true, md`$I^- = -V^-/Z_0 = -\Gamma_LI^+$.`],
      ];
      const st = pick(stmts);
      return {
        title: 'One line, a step, the whole story',
        q: md`A step source $V_g = ${s.Vg}$ V with $R_g = ${p(s.Rg)}\ \Omega$ is switched on at $t = 0$ at $z = 0$. The line has $Z_0 = ${s.Z}\ \Omega$, length $l = ${len}$ m and $v = ${v}$ m/µs, and ends in $R_L = ${RT(s.RL)}\ \Omega$.

(a) Find $\tau_g$, $\Gamma_g$, $\Gamma_L$. (b) Find $V(l/2,\ ${p(tm)}\ \mu\text{s})$, (c) $V(l,\ ${p(tL)}\ \mu\text{s})$, (d) $I(0,\ ${p(t0)}\ \mu\text{s})$. (e) Find the steady-state load voltage and current. (f) True or false: "${st[0]}".`,
        plan: plan(md`What do you write down before drawing anything?`, md`$T$, then $\tau_g$, $\Gamma_g$, $\Gamma_L$, then the DC values $V_gR_L/(R_g + R_L)$ and $V_g/(R_g + R_L)$ as the target`,
          [[md`The DC values are the first labels on the diagram`, md`The diagram starts with $\tau_gV_g$; the DC values are where the sums end.`], [md`$\tau_g = 1 + \Gamma_g$`, md`$\tau_g = (1 - \Gamma_g)/2$. It is a divider, not a transmission.`], [md`Only $\Gamma_L$, since the generator absorbs everything`, md`The generator absorbs only if $R_g = Z_0$. Otherwise it reflects with $\Gamma_g$.`]],
          md`Three coefficients in the corners, the target values at the bottom; every label after that is one multiplication.`),
        parts: [
          NT('(a)\\ \\tau_g', s.tg, '', [[1 + s.Gg, 'That is 1 + Γg.']]),
          NT('(a)\\ \\Gamma_g', s.Gg, '', [[-s.Gg, 'Upside down.']]),
          NT('(a)\\ \\Gamma_L', s.GL, '', [[-s.GL, 'Upside down.']]),
          NT(`(b)\\ V(l/2,\\ ${p(tm)}\\ \\mu\\text{s})`, Vm, 'V', []),
          NT(`(c)\\ V(l,\\ ${p(tL)}\\ \\mu\\text{s})`, VLv, 'V', []),
          NT(`(d)\\ I(0,\\ ${p(t0)}\\ \\mu\\text{s})`, I0, 'A', [[-I0, 'Check the current coefficients: −Γ at each end.']]),
          NT('(e)\\ V_L(\\infty)', s.dcV, 'V', [[V1, 'That is the first wave.']]),
          ...(s.RL === Infinity ? [] : [NT('(e)\\ I(\\infty)', s.dcI, 'A', [[s.Vg / (s.Rg + s.Z), 'That is the first current wave.']])]),
          { lbl: '(f)', mc: ['True', 'False'], a: st[1] ? 0 : 1, why: st[1] ? [null, st[2]] : [st[2], null] },
        ],
        figs: {
          bd: { svg: PF.row([{ svg: TL.diagram(sol, { tMax: 4 * T, w: 330, h: 330 }), cap: 'Voltage (V)' }, { svg: TL.diagram(sol, { tMax: 4 * T, w: 330, h: 330, qty: 'I' }), cap: 'Current (A)' }]).svg, cap: 'The bounce diagrams up to 4T.' },
          vl: { svg: TL.plotT(sol, len, { tMax: 5 * T, w: 380 }), cap: 'The load voltage. Dashed: the DC value.' },
        },
        hints: [md`$T = ${p(T)}\ \mu$s. Arrivals: at $l/2$ at $T/2, 3T/2, 5T/2, \ldots$; at the load at $T, 3T, \ldots$; at $z = 0$ at $0, 2T, 4T$.`, md`Current: divide each voltage wave by $Z_0$ and give backward waves a minus sign.`],
        sol: md`
          **(a) The three numbers.** $T = ${len}/${v} = ${p(T)}\ \mu$s.
          $$\tau_g = \frac{${s.Z}}{${p(s.Rg + s.Z)}} = ${fr(s.tg)}$$
          $$\Gamma_g = \frac{${p(s.Rg - s.Z)}}{${p(s.Rg + s.Z)}} = ${fr(s.Gg)}$$
          $$\Gamma_L = ${s.RL === Infinity ? '1\\quad(\\text{open})' : `\\frac{${p(s.RL - s.Z)}}{${p(s.RL + s.Z)}} = ${fr(s.GL)}`}$$
          The first wave is $${fr(s.tg)}\cdot${s.Vg} = ${fr(V1)}$ V; then $${fr(V1 * s.GL)}$ V back, $${fr(V1 * s.GL * s.Gg)}$ V forward, $${fr(V1 * s.GL * s.GL * s.Gg)}$ V back.

          [[fig:bd]]

          **(b) $z = l/2$ at $${p(tm)}\ \mu$s $= 3T$.** Waves cross the middle at $0.5T$, $1.5T$, $2.5T$, $3.5T$, … Three have passed by $3T$:
          $$V = ${TL.arrivals(sol, zm).filter((a) => a.t <= tm + 1e-9).map((a) => fr(a.v)).join(' + ').replace(/\+ -/g, '- ')} = ${fr(Vm)}\ \text{V}$$
          **(c) the load at $3.5T$.** Arrivals at $T$ and $3T$, each with its reflection:
          $$V_L = ${fr(V1 * (1 + s.GL))} + ${fr(V1 * s.GL * s.Gg * (1 + s.GL))} = ${fr(VLv)}\ \text{V}$$
          **(d) the current at $z = 0$ at $2.5T$.** Waves at $z = 0$: $I_1^+ = ${fr(V1 / s.Z)}$ A at $0$; at $2T$ the return ($-\Gamma_L$ in current) and the new forward wave arrive and leave together:
          $$I = ${TL.arrivals(sol, 0).filter((a) => a.t <= t0 + 1e-9).map((a) => fr(a.i)).join(' + ').replace(/\+ -/g, '- ')} = ${fr(I0)}\ \text{A}$$
          **(e) steady state.** ${s.RL === Infinity ? md`Open load: $I_\infty = 0$ and $V_\infty = V_g = ${s.Vg}$ V.` : md`The DC divider:
          $$V_\infty = \frac{${p(s.RL)}\cdot${s.Vg}}{${p(s.Rg + s.RL)}} = ${fr(s.dcV)}\ \text{V}$$
          $$I_\infty = \frac{${s.Vg}}{${p(s.Rg + s.RL)}} = ${fr(s.dcI)}\ \text{A}$$`}
          Series check: $${fr(V1 * (1 + s.GL))}/(1 - (${fr(s.Gg * s.GL)})) = ${fr((V1 * (1 + s.GL)) / (1 - s.Gg * s.GL))}$ V ✓.

          [[fig:vl]]

          **(f)** ${st[1] ? 'True' : 'False'}. ${st[2]}

          **Speed path.** Corners first ($\tau_g$, $\Gamma_g$, $\Gamma_L$), target values at the bottom (the DC divider), then each label is the previous one times one coefficient. For a point and a time, draw the vertical probe line and add the waves it crosses.

          **Where points go.** $\tau_g$ taken as $1 + \Gamma_g$. Current diagram with $+\Gamma$. Counting a wave that arrives exactly at the asked time without saying "just after". Unlabeled lines on the diagram.
        `,
      };
    }
  };

  // ================================================================ lesson 2, question bank
  EM.BANK['w5-launch'] = [
    Q(md`Why does the source see $Z_0$ at $t = 0^+$, whatever the load?`,
      ['Only a forward wave exists until a reflection returns at $2T$, and a single wave has $V/I = Z_0$', 'Because $Z_0$ is always larger than $R_L$', 'Because the line is short', 'Because the load is disconnected at $t = 0$'], 0,
      [null, md`$Z_0$ can be larger or smaller than $R_L$; it does not matter for the first $2T$.`, md`The argument holds for any length; length only sets $2T$.`, md`The load is connected; the wave simply has not reached it.`],
      md`For $0 < t < 2T$, $V(0) = f$ and $I(0) = f/Z_0$.`),
    Q(md`$R_g = 0$, $Z_0 = 50\ \Omega$, $V_g = 10$ V. The first wave is…`,
      ['10 V', '5 V', '0 V', '20 V'], 0,
      [null, md`Half needs $R_g = Z_0$.`, md`$\tau_g = 50/50 = 1$, not 0. It is $\Gamma_g = -1$ that is extreme here.`, md`Doubling happens at an open end, not at the source.`],
      md`$\tau_g = Z_0/(0 + Z_0) = 1$.`),
    Q(md`$\tau_g$ is always…`,
      ['between 0 and 1', 'between −1 and 1', 'equal to $1 + \\Gamma_g$', 'larger than 1 when $R_g < Z_0$'], 0,
      [null, md`It is a positive divider fraction; it cannot be negative.`, md`$\tau_g = (1 - \Gamma_g)/2$.`, md`At most 1, reached when $R_g = 0$.`],
      md`$Z_0/(R_g + Z_0)$ with $R_g \ge 0$ lies in $(0, 1]$.`),
    Q(md`A $75\ \Omega$ line ends in $25\ \Omega$. $\Gamma_L$ is…`,
      ['$-\\tfrac12$', '$+\\tfrac12$', '$-\\tfrac13$', '$\\tfrac14$'], 0,
      [null, md`Upside down. $R_L < Z_0$ gives a negative $\Gamma_L$.`, md`$(25 - 75)/(25 + 75) = -50/100$.`, md`That is $R_L/(R_L + Z_0)$, a divider fraction.`],
      md`$\Gamma_L = (25 - 75)/100 = -\tfrac12$.`),
    Q(md`$\Gamma_L = \tfrac13$ on a $60\ \Omega$ line. $R_L$ is…`,
      ['$120\\ \\Omega$', '$30\\ \\Omega$', '$20\\ \\Omega$', '$80\\ \\Omega$'], 0,
      [null, md`That gives $\Gamma_L = -\tfrac13$.`, md`$20\ \Omega = Z_0/3$ gives $-\tfrac12$.`, md`$(80 - 60)/(140) = \tfrac17$.`],
      md`$R_L = Z_0(1 + \Gamma)/(1 - \Gamma) = 60\cdot\tfrac43/\tfrac23 = 120\ \Omega$.`),
    Q(md`A wave reaches a load with $\Gamma_L = -\tfrac12$. Compared with the incident wave, the load has…`,
      ['half the voltage and 1.5 times the current', '1.5 times the voltage and half the current', 'half the voltage and half the current', 'the same voltage and current'], 0,
      [null, md`That is $\Gamma_L = +\tfrac12$.`, md`Current uses $1 - \Gamma_L = 1.5$.`, md`That would need $\Gamma_L = 0$.`],
      md`$V_L = V^+(1 + \Gamma_L) = 0.5V^+$ and $I_L = I^+(1 - \Gamma_L) = 1.5I^+$, so $V_L/I_L = Z_0/3 = R_L$.`),
    Q(md`An open end: behind the reflected front, the line has…`,
      ['$V = 2V^+$ and $I = 0$', '$V = 0$ and $I = 2I^+$', '$V = V^+$ and $I = I^+$', '$V = 2V^+$ and $I = 2I^+$'], 0,
      [null, md`That is behind the front reflected from a short.`, md`That is ahead of the reflected front.`, md`An open end reflects current with $-1$: it cancels.`],
      md`The reflected wave $V^- = +V^+$, $I^- = -I^+$ adds to the incident one.`),
    Q(md`Which load makes the line look infinitely long to the wave?`,
      ['$R_L = Z_0$', '$R_L = \\infty$', '$R_L = 0$', '$R_L = R_g$'], 0,
      [null, md`An open end reflects everything.`, md`A short reflects everything, with a sign change.`, md`$R_g$ has nothing to do with the load end.`],
      md`$\Gamma_L = 0$: no reflection, exactly as if the line kept going.`),
    Q(md`For a wave returning to the generator, the ideal source $V_g$ acts as…`,
      ['a short circuit', 'an open circuit', 'a resistor $Z_0$', 'a resistor $R_g + Z_0$'], 0,
      [null, md`An open source would give $\Gamma_g = +1$ regardless of $R_g$.`, md`That is what the line looks like to the source, not the reverse.`, md`The returning wave sees $R_g$ only.`],
      md`Its voltage does not change, so for changes it is a wire: only $R_g$ is left, and $\Gamma_g = (R_g - Z_0)/(R_g + Z_0)$.`),
    Q(md`A matched source ($R_g = Z_0$) launches…`,
      ['$V_g/2$, and absorbs every returning wave', '$V_g$, and reflects every returning wave', '$V_g/2$, and reflects returning waves with $-\\tfrac12$', 'nothing until the load reflects'], 0,
      [null, md`$\tau_g = \tfrac12$ and $\Gamma_g = 0$.`, md`$\Gamma_g = 0$ when $R_g = Z_0$.`, md`The launch happens at $t = 0$.`],
      md`$\tau_g = \tfrac12$, $\Gamma_g = 0$. The load voltage is final at $t = T$.`),
    Q(md`$1 + \Gamma_g$ and $\tau_g$ are equal when…`,
      ['$Z_0 = 2R_g$', '$R_g = Z_0$', '$R_g = 0$', 'always'], 0,
      [null, md`Then $1 + \Gamma_g = 1$ but $\tau_g = \tfrac12$.`, md`Then $1 + \Gamma_g = 0$ but $\tau_g = 1$.`, md`$1 + \Gamma_g = 2R_g/(R_g + Z_0)$ and $\tau_g = Z_0/(R_g + Z_0)$ differ in general.`],
      md`$2R_g = Z_0$ makes the numerators equal. It is a coincidence, not a rule.`),
    Q(md`Which identity always holds?`,
      ['$\\tau_g = (1 - \\Gamma_g)/2$', '$\\tau_g = 1 + \\Gamma_g$', '$\\tau_g = 1 - \\Gamma_L$', '$\\tau_g\\Gamma_g = 1$'], 0,
      [null, md`$1 + \Gamma_g = 2R_g/(R_g + Z_0)$.`, md`$\tau_g$ does not involve the load.`, md`For $R_g = Z_0$, $\Gamma_g = 0$ and the product is 0.`],
      md`$1 - \Gamma_g = 2Z_0/(R_g + Z_0) = 2\tau_g$.`),
    Q(md`The second forward wave on the line is…`,
      ['$\\Gamma_g\\Gamma_L\\tau_gV_g$, launched at $2T$', '$\\Gamma_L\\tau_gV_g$, launched at $T$', '$\\Gamma_g\\tau_gV_g$, launched at $2T$', '$\\Gamma_g\\Gamma_L\\tau_gV_g$, launched at $T$'], 0,
      [null, md`That is the first backward wave.`, md`It must first reflect at the load: $\Gamma_L$ is missing.`, md`It needs a full round trip, $2T$.`],
      md`Down ($\tau_gV_g$), reflect at the load ($\times\Gamma_L$), back, reflect at the generator ($\times\Gamma_g$), at $t = 2T$.`),
    Q(md`$V_g = 24$ V, $R_g = 40\ \Omega$, $R_L = 80\ \Omega$, $Z_0 = 50\ \Omega$. The steady-state current is…`,
      ['0.2 A', '0.267 A', '0.185 A', '0.6 A'], 0,
      [null, md`That is $V_g/(R_g + Z_0)$, the first current wave.`, md`That adds $Z_0$ as a series resistor. At DC the line is two wires.`, md`That is $V_g/R_g$, a short at the load.`],
      md`$I_\infty = 24/(40 + 80) = 0.2$ A, and $V_\infty = 16$ V.`),
    Q(md`Why is the steady state the DC divider, in one sentence?`,
      ['With $\\partial/\\partial t = 0$ the telegrapher\'s equations give $\\partial V/\\partial z = \\partial I/\\partial z = 0$: the line is two wires', 'Because the waves stop moving', 'Because $Z_0 = R_L$ at DC', 'Because the reflections cancel the first wave'], 0,
      [null, md`The waves keep moving; their sizes shrink to zero.`, md`$Z_0$ does not change with frequency for a lossless line.`, md`They add to it: the series sums to the divider.`],
      md`No time change means no voltage drop along $L$ and no charging of $C$.`),
    Q(md`The geometric series for the load voltage converges because…`,
      ['$|\\Gamma_g\\Gamma_L| < 1$ unless both ends reflect perfectly', '$\\tau_g < 1$', '$Z_0 > 0$', 'each wave is a step'], 0,
      [null, md`$\tau_g$ only scales the series; the ratio is $\Gamma_g\Gamma_L$.`, md`Positivity of $Z_0$ does not bound the ratio.`, md`Steps are why values add; convergence needs the ratio below 1 in size.`],
      md`$|\Gamma| \le 1$ at each end, with equality only for $R = 0$ or $\infty$ (and $R_g = 0$).`),
    Q(md`$R_g = 0$ and an open load. The load voltage…`,
      ['jumps between $2V_g$ and $0$ forever', 'settles at $V_g$', 'settles at $2V_g$', 'is $V_g$ from $t = T$ on'], 0,
      [null, md`It would, if anything absorbed energy. $\Gamma_g\Gamma_L = -1$: nothing does.`, md`$2V_g$ is only its value for $T < t < 3T$.`, md`The first value at the open end is $2V_g$, not $V_g$.`],
      md`$\tau_g = 1$, $\Gamma_L = 1$, $\Gamma_g = -1$: steps $+2V_g$, $-2V_g$, $+2V_g$, … The lossless resonator of Lecture 31.`),
    Q(md`$\Gamma_g = -\tfrac12$ and $\Gamma_L = -\tfrac12$. The load voltage…`,
      ['climbs as a staircase', 'rings around its final value', 'reaches its final value at $T$', 'falls to zero'], 0,
      [null, md`The product $+\tfrac14$ is positive.`, md`That needs a zero coefficient.`, md`It heads to the DC divider, which is not zero unless $R_L = 0$.`],
      md`Each step is $\tfrac14$ of the last with the same sign.`),
    Q(md`On a current bounce diagram with $\Gamma_g = \tfrac13$ and $\Gamma_L = -1$, the coefficients to write at the ends are…`,
      ['$-\\tfrac13$ at the generator and $+1$ at the load', '$\\tfrac13$ and $-1$', '$-\\tfrac13$ and $-1$', '$\\tfrac13$ and $+1$'], 0,
      [null, md`Those are the voltage coefficients.`, md`Both ends flip for current, not just the generator.`, md`Both ends flip for current, not just the load.`],
      md`Current reflects with $-\Gamma$ at every end.`),
    Q(md`Spring 2024 #4 had $R_g = 50\ \Omega$, $Z_{01} = 150\ \Omega$ and $V_g = 80$ V. Its first wave was 60 V. Which formula gave it?`,
      ['$\\tau_gV_g = \\tfrac{150}{200}\\cdot80$', '$(1 + \\Gamma_g)V_g = \\tfrac12\\cdot80$', '$\\tfrac{R_L}{R_g + R_L}V_g$', '$\\tfrac{R_g}{R_g + Z_0}V_g$'], 0,
      [null, md`That gives 40 V, a common slip.`, md`That is the DC answer, $40$ V with $R_L = 50\ \Omega$.`, md`That gives 20 V, the drop across $R_g$.`],
      md`The divider of $R_g$ and $Z_{01}$: $\tfrac34\cdot80 = 60$ V.`, { src: 'Spring 2024 #4(a)' }),
    Q(md`A load voltage is measured: 15 V at $T^+$, 7.5 V at $3T^+$, 11.25 V at $5T^+$. Its final value is…`,
      ['10 V', '11.25 V', '15 V', '7.5 V'], 0,
      [null, md`That is the latest value; it is still ringing.`, md`That is the first value.`, md`That is one of the swings.`],
      md`Steps $+15$, $-7.5$, $+3.75$: ratio $-\tfrac12$. Sum $15/(1 + \tfrac12) = 10$ V.`),
    Q(md`Doubling the line's length (same $Z_0$, $v$, $R_g$, $R_L$, $V_g$) changes…`,
      ['only the times of the steps, not their sizes or the final value', 'the sizes of the steps', 'the final value', 'the injection coefficient'], 0,
      [null, md`The coefficients have no length in them.`, md`DC divider: no length.`, md`$\tau_g = Z_0/(R_g + Z_0)$: no length.`],
      md`$T = l/v$ doubles; everything else is the same.`),
  ];
})();

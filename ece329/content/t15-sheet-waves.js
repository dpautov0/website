/* Topic 15 — Waves launched by a current sheet (Lectures 18–19). A sheet whose current changes in time sends one uniform
   plane wave out each side: H is the static sheet field, delayed by the travel time; E points against the current; the
   boundary conditions at the sheet fix the amplitude η/2. Directions for any sheet orientation, sketches in space and in
   time, Spring 2018 #5, and Lecture 19's sheet at x = 0 read backward from a snapshot. The wave equation and reading
   waveforms are Topic 14; power is Topic 17. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick, ri } = U;
  const ETA0 = EM.eta0;

  // ---------------------------------------------------------------- vectors (unit vectors along the axes)
  const AX = ['x', 'y', 'z'];
  const uv = (i, s = 1) => { const v = [0, 0, 0]; v[i] = s; return v; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const neg = (v) => v.map((c) => -c);
  const axisOf = (v) => v.findIndex((c) => c !== 0);
  const vt = (v) => { const i = axisOf(v); return `${v[i] > 0 ? '+' : '-'}\\hat ${AX[i]}`; };   // "+\hat x"
  const opt = (v) => `$${vt(v)}$`;
  const sgn = (s) => (s > 0 ? '' : '-');

  // ---------------------------------------------------------------- figures
  // the course's sheet edge-on: x up, z right, y out of the page; J_s = −J_s x̂ points down
  function sheetFig() {
    const g = PF.fig({ alt: 'a current sheet seen edge-on with its current pointing down; on both sides E points up, H points out of the page on the right and into the page on the left, and each wave moves away from the sheet' });
    const X = 160;
    g.sheet(X, 24, 176);
    g.head(X, 76, 0, 1, { hs: 9 });
    g.head(X, 136, 0, 1, { hs: 9 });
    g.label(X + 7, 26, '\\mathbf J_s', 'tl');
    g.arrow(222, 128, 222, 70, { cls: 'thick', hs: 8 }); g.label(222, 64, '\\mathbf E', 'b');
    g.odot(256, 100, 7, { lab: '\\mathbf H', at: 'b' });
    g.arrow(276, 100, 322, 100, { hs: 8 }); g.label(326, 100, 'v_p', 'l');
    g.arrow(98, 128, 98, 70, { cls: 'thick', hs: 8 }); g.label(98, 64, '\\mathbf E', 'b');
    g.otimes(64, 100, 7, { lab: '\\mathbf H', at: 'b' });
    g.arrow(44, 100, -2, 100, { hs: 8 }); g.label(-6, 100, 'v_p', 'r');
    const ox = 6, oy = 204;
    g.arrow(ox, oy, ox + 30, oy, { cls: 'dim', hs: 6 }); g.label(ox + 34, oy, 'z', 'l', 'small accent');
    g.arrow(ox, oy, ox, oy - 30, { cls: 'dim', hs: 6 }); g.label(ox, oy - 34, 'x', 'b', 'small accent');
    g.odot(ox + 58, oy - 6, 4); g.label(ox + 66, oy - 6, 'y', 'l', 'small accent');
    g.label(X, 186, 'z = 0', 't', 'small');
    return g.svg();
  }

  // a piecewise-linear waveform plot (o.pts is the curve; PF.plot's own `pts` option means point markers)
  const wave = (o) => { const { pts, ...rest } = o; return PF.plot(Object.assign({ w: 300, h: 150, zero: true }, rest, { curves: [{ pts }] })); };

  // Step 5: a ramp J_s(t) and its snapshot at t = 3 µs
  const rampJ = () => wave({ x: [-0.4, 2.2], y: [-0.4, 2.5], pts: [[-0.4, 0], [0, 0], [1, 2], [1, 0], [2.2, 0]], xt: [[1, '1'], [2, '2']], yt: [[2, '2']], xl: 't\\,(\\mu\\text{s})', yl: 'J_s\\,(\\text{A/m})' });
  const rampE = () => wave({ x: [-1100, 1100], y: [-60, 470], pts: [[-1100, 0], [-900, 0], [-600, 377], [-600, 0], [600, 0], [600, 377], [900, 0], [1100, 0]], xt: [[-900, '-900'], [-600, '-600'], [600, '600'], [900, '900']], yt: [[377, '377']], xl: 'z\\,(\\text{m})', yl: 'E_x\\,(\\text{V/m})' });
  const rampH = () => wave({ x: [-1100, 1100], y: [-1.3, 1.3], pts: [[-1100, 0], [-900, 0], [-600, -1], [-600, 0], [600, 0], [600, 1], [900, 0], [1100, 0]], xt: [[-900, '-900'], [-600, '-600'], [600, '600'], [900, '900']], yt: [[1, '1'], [-1, '-1']], xl: 'z\\,(\\text{m})', yl: 'H_y\\,(\\text{A/m})' });

  // Step 6: Lecture 19, sheet at x = 0
  const l19given = () => wave({ x: [-40, 260], y: [-0.4, 2.5], pts: [[-40, 0], [0, 0], [100, 2], [100, 0], [260, 0]], xt: [[100, '100']], yt: [[2, '2']], xl: 'x\\,(\\text{m})', yl: 'H_y\\,(\\text{A/m})' });
  const l19J = () => wave({ x: [0, 1.5], y: [-0.6, 4.8], pts: [[0, 0], [2 / 3, 0], [2 / 3, 4], [1, 0], [1.5, 0]], xt: [[2 / 3, '\\tfrac23'], [1, '1']], yt: [[4, '4']], xl: 't\\,(\\mu\\text{s})', yl: 'J_z\\,(\\text{A/m})' });
  const l19H4 = () => wave({ x: [-1500, 1500], y: [-2.6, 2.6], pts: [[-1500, 0], [-1000, 0], [-1000, -2], [-900, 0], [900, 0], [1000, 2], [1000, 0], [1500, 0]], xt: [[-1000, '-1000'], [1000, '1000']], yt: [[2, '2'], [-2, '-2']], xl: 'x\\,(\\text{m})', yl: 'H_y\\,(\\text{A/m})' });
  const l19E2 = () => wave({ w: 340, x: [-460, 460], y: [-900, 150], pts: [[-460, 0], [-400, 0], [-400, -754], [-300, 0], [300, 0], [400, -754], [400, 0], [460, 0]], xt: [[-400, '-400'], [-300, '-300'], [300, '300'], [400, '400']], yt: [[-754, '-754']], xl: 'x\\,(\\text{m})', yl: 'E_z\\,(\\text{V/m})' });

  // Spring 2018 #5: J_s(t) and H_z(y) at t = 5 ns
  const sp18J = () => wave({ w: 320, x: [0, 5.4], y: [-5, 5], pts: [[0, 0], [1, 0], [2, 4], [3, -4], [4, -4], [4, 0], [5.4, 0]], xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']], yt: [[4, '4'], [-4, '-4']], xl: 't\\,(\\text{ns})', yl: 'J_s\\,(\\text{A/m})' });
  const sp18H = () => wave({ w: 400, h: 170, x: [-1.4, 1.4], y: [-2.7, 2.7], pts: [[-1.4, 0], [-1.2, 0], [-0.9, 2], [-0.6, -2], [-0.3, -2], [-0.3, 0], [0.3, 0], [0.3, 2], [0.6, 2], [0.9, -2], [1.2, 0], [1.4, 0]], xt: [[-1.2, '-1.2'], [-0.9, '-0.9'], [-0.6, '-0.6'], [-0.3, '-0.3'], [0.3, '0.3'], [0.6, '0.6'], [0.9, '0.9'], [1.2, '1.2']], yt: [[2, '2'], [-2, '-2']], xl: 'y\\,(\\text{m})', yl: 'H_z\\,(\\text{A/m})' });

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u5', {
    id: 't15-sheet-waves', topic: 15, ref: 'Lectures 18–19', title: 'Waves launched by a current sheet',
    steps: [
      R(md`
        !!key Why you care
          Spring 2018 #5 (20 points) is this topic: a sheet in the $y = 0$ plane, fill in $\mathbf H$ for both waves, sketch it at $t = 5$ ns. Lecture 19 works the reverse problem (a field snapshot back to the sheet current), and HW 7 #6 builds $\mathbf H$ from a traveling $\mathbf E$. Topic 17's power questions start from these fields. Points are lost on two things: the **direction** of $\mathbf H$ on each side, and sketches drawn **the wrong way round**.

        ### Notation

        - $\mathbf J_s(t)$: surface current density of the sheet, in A/m (current per meter of width). The course's standard sheet is $\mathbf J_s = -J_s(t)\,\hat x$ on $z = 0$: the scalar $J_s(t) > 0$ means current along $-\hat x$.
        - $\mathbf E$ (V/m) and $\mathbf H$ (A/m): the fields. They depend only on the distance from the sheet and on $t$.
        - $\mu$, $\epsilon$: permeability (H/m) and permittivity (F/m) of the medium around the sheet.
        - $v_p = 1/\sqrt{\mu\epsilon}$: the propagation speed, m/s. Free space: $c = 3\times10^8$ m/s $= 300$ m/µs $= 0.3$ m/ns.
        - $\eta = \sqrt{\mu/\epsilon}$: the intrinsic impedance, in ohms. Free space: $\eta_0 = 120\pi \approx 377\ \Omega$.
        - $\hat n$: a unit normal of the sheet. In boundary conditions it points from region − into region +. In the sheet rule below it points from the sheet toward the point you look at.
        - $d$: distance from the sheet, m. $t - d/v_p$ is the **retarded time**: the moment the field now at distance $d$ left the sheet.
        - $f(t - z/v_p)$: a waveform moving toward $+z$; $g(t + z/v_p)$ moves toward $-z$ ([Topic 14](#/l/t14-wave-eq)).

        ### The idea

        A steady sheet current makes $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ on each side, the same at every distance. When the current changes, the news travels outward at $v_p$. So the field at distance $d$ is the static sheet field of the current that flowed a time $d/v_p$ earlier, now with an electric partner:
        $$\mathbf H = \frac12\,\mathbf J_s\!\left(t - \frac{d}{v_p}\right)\times\hat n \qquad \mathbf E = -\frac{\eta}{2}\,\mathbf J_s\!\left(t - \frac{d}{v_p}\right)$$
        Two uniform plane waves leave the sheet, one each way. $\mathbf E$ is the same on both sides, $\mathbf H$ flips, and $\mathbf E\times\mathbf H$ points away from the sheet on both sides.
      `),
      RF(md`
        ### Step 1: what symmetry allows

        [[fig:sheet]]

        Take the course's sheet, $\mathbf J_s = -J_s(t)\hat x$ on $z = 0$. It is infinite and uniform, so nothing depends on $x$ or $y$: the fields are functions of $z$ and $t$ only.

        - **H:** a steady current gives the static sheet field $\tfrac12\mathbf J_s\times\hat n$, along $\pm\hat y$. A changing current points the same way, so $\mathbf H = H_y(z,t)\,\hat y$.
        - **E:** Faraday's $y$-component, $\partial E_x/\partial z = -\mu\,\partial H_y/\partial t$, says a changing $H_y$ makes $E_x$. Nothing drives $E_y$ or $E_z$: with no current along $\hat y$ or $\hat z$, Ampère–Maxwell keeps them constant in time, and both were zero before the current started. So $\mathbf E = E_x(z,t)\,\hat x$, along the current's line.

        Away from the sheet the two curl equations couple them:
        $$\frac{\partial E_x}{\partial z} = -\mu\frac{\partial H_y}{\partial t} \qquad \frac{\partial H_y}{\partial z} = -\epsilon\frac{\partial E_x}{\partial t}$$
        Eliminating $H_y$ gives the wave equation $\partial^2E_x/\partial z^2 = \mu\epsilon\,\partial^2E_x/\partial t^2$ ([Topic 14](#/l/t14-wave-eq)).
      `, { sheet: { svg: sheetFig(), cap: 'The course\'s sheet edge-on, y out of the page. $J_s$ points down (−x). E points up on both sides; H is out of the page on the right, into it on the left; each wave moves away from the sheet.' } }),
      Q(md`**Predict.** The sheet $\mathbf J_s = -J_s(t)\hat x$ sits on $z = 0$, with $J_s > 0$ at the moment that matters. On the side $z > 0$, $\mathbf H$ points along…`,
        ['$+\\hat y$', '$-\\hat y$', '$+\\hat x$', '$+\\hat z$'], 0,
        [null, 'That is the field on $z < 0$, or $\\hat x\\times\\hat z$ taken as $+\\hat y$. Here the current points along $-\\hat x$ and $\\hat x\\times\\hat z = -\\hat y$.', '$\\mathbf H$ circles the current, so it is perpendicular to $\\mathbf J_s$.', 'A uniform plane wave has no field along its direction of travel.'],
        md`$\tfrac12\mathbf J_s\times\hat n = \tfrac12(-J_s\hat x)\times\hat z = -\tfrac12J_s(-\hat y) = +\tfrac12J_s\,\hat y$. Fingers along the current (down the sheet), the field circles it: out of the page on the right.`),
      R(md`
        ### Step 2: one wave out each side

        The general solution is a forward plus a backward wave. The sheet is the only source, so each side keeps only the wave moving **away** from it:
        $$z > 0:\ E_x = A\,f\!\left(t - \frac{z}{v_p}\right) \qquad\qquad z < 0:\ E_x = B\,g\!\left(t + \frac{z}{v_p}\right)$$
        $H_y$ follows from $\partial E_x/\partial z = -\mu\,\partial H_y/\partial t$. For $f(t - z/v_p)$, $\partial_z = -\tfrac{1}{v_p}\partial_t$, so $H_y = E_x/(\mu v_p) = E_x/\eta$. For $g(t + z/v_p)$ the sign flips: $H_y = -E_x/\eta$.

        !!key The pairing rule
          In every uniform plane wave, $\mathbf E\perp\mathbf H$, $|\mathbf E| = \eta|\mathbf H|$, and $\mathbf E\times\mathbf H$ points along the direction of travel.
      `),
      Q(md`**Predict.** In free space on the side $z < 0$, at some instant $E_x = +5$ V/m. Then $H_y$ there is…`,
        ['$-13.3$ mA/m', '$+13.3$ mA/m', '$-1885$ A/m', '$0$: $\\mathbf H$ lags $\\mathbf E$ by a quarter period'], 0,
        [null, 'That pairs a forward wave with $\\mathbf E$. On $z < 0$ the wave travels toward $-z$, so $\\mathbf E\\times\\mathbf H$ must point along $-\\hat z$.', 'That multiplies by $\\eta_0$; divide: $H = E/\\eta_0$.', 'In a uniform plane wave $E$ and $H$ are in step: same waveform, same instant.'],
        md`$|H| = 5/377 = 13.3$ mA/m. Travel is toward $-z$, so $(+\hat x)\times(-\hat y) = -\hat z$ ✓: $H_y = -13.3$ mA/m.`),
      R(md`
        ### Step 3: the boundary conditions fix the amplitude

        Two conditions at $z = 0$, with $\hat n = \hat z$ (from region − into region +):

        - **Tangential $\mathbf E$ is continuous:** $A f(t) = B g(t)$. Both sides launch the same waveform; call it $E_x(0,t)$.
        - **Tangential $\mathbf H$ jumps by the sheet current:** $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$. With $\hat z\times\hat y = -\hat x$:

        $$-\big[H_y(0^+) - H_y(0^-)\big]\hat x = -J_s(t)\,\hat x \quad\Rightarrow\quad H_y(0^+) - H_y(0^-) = J_s(t)$$

        Step 2 gives $H_y(0^\pm) = \pm E_x(0,t)/\eta$, so $2E_x(0,t)/\eta = J_s(t)$. Propagate it outward:
        $$E_x = \frac{\eta}{2}J_s\!\left(t \mp \frac{z}{v_p}\right) \qquad H_y = \pm\frac12J_s\!\left(t \mp \frac{z}{v_p}\right) \qquad (z \gtrless 0)$$
        That is the formula sheet's line. The jump $J_s$ in $H$ is split evenly: $\tfrac12J_s$ per side, as in the static case.

        **Why $\mathbf E$ points against $\mathbf J_s$.** $E_x$ has the sign of $J_s(t)$, while the current points along $-\hat x$. The sheet drives its current against the field it makes, as charge inside a battery moves against $\mathbf E$. That is how it hands energy to the two waves ([Topic 17](#/l/t17-poynting)).
      `),
      Q(md`**Predict.** A sheet in free space carries a current pulse with peak $|\mathbf J_s| = 4$ A/m. The peak $|\mathbf E|$ at 30 m from the sheet is about…`,
        ['754 V/m', '1508 V/m', '25 V/m', '2 V/m'], 0,
        [null, 'That is $\\eta_0J_s$. The jump $J_s$ in $H$ is shared by two waves, so each has $|H| = J_s/2$ and $|E| = \\eta_0J_s/2$.', 'That divides by the distance. An infinite sheet\'s wave does not spread out; its amplitude is the same at every distance.', 'That is $|H| = J_s/2$ in A/m, not $|E|$. Multiply by $\\eta_0$.'],
        md`$|E| = \tfrac{\eta_0}{2}|J_s| = (60\pi\ \Omega)(4\ \text{A/m}) = 754$ V/m, at any distance; it just arrives $30/c = 0.1$ µs later.`),
      R(md`
        ### Step 4: any sheet, any direction

        Do not memorize the $\hat x/\hat y/\hat z$ version. Build the fields from three facts:

        1. $\mathbf H = \tfrac12\mathbf J_s(t - d/v_p)\times\hat n$, with $\hat n$ from the sheet toward the point: the static sheet rule, delayed.
        2. $\mathbf E = -\tfrac{\eta}{2}\mathbf J_s(t - d/v_p)$, the same on both sides.
        3. Check that $\mathbf E\times\mathbf H$ points away from the sheet.

        | Sheet and current | Side | $\mathbf H$ | $\mathbf E$ |
        |---|---|---|---|
        | $z = 0$, $\mathbf J_s = -J_s\hat x$ | $z > 0$ | $+\tfrac12J_s\,\hat y$ | $+\tfrac{\eta}{2}J_s\,\hat x$ |
        |  | $z < 0$ | $-\tfrac12J_s\,\hat y$ | $+\tfrac{\eta}{2}J_s\,\hat x$ |
        | $y = 0$, $\mathbf J_s = -J_s\hat x$ | $y > 0$ | $-\tfrac12J_s\,\hat z$ | $+\tfrac{\eta}{2}J_s\,\hat x$ |
        |  | $y < 0$ | $+\tfrac12J_s\,\hat z$ | $+\tfrac{\eta}{2}J_s\,\hat x$ |
        | $x = 0$, $\mathbf J_s = J_s\hat z$ | $x > 0$ | $+\tfrac12J_s\,\hat y$ | $-\tfrac{\eta}{2}J_s\,\hat z$ |
        |  | $x < 0$ | $-\tfrac12J_s\,\hat y$ | $-\tfrac{\eta}{2}J_s\,\hat z$ |

        Every $J_s$ in the table is taken at the retarded time $t - d/v_p$. Check the $y = 0$ row: $\hat x\times(-\hat z) = +\hat y$, away from the sheet on $y > 0$. ✓

        **Going backward.** Cross fact 1 with $\hat n$: $\hat n\times\mathbf H = \tfrac12\mathbf J_s$, so a field measured just outside gives the current, $\mathbf J_s = 2\,\hat n\times\mathbf H(0^+)$.
      `),
      Q(md`**Predict.** A sheet on the plane $x = 0$ carries $\mathbf J_s = J_s(t)\,\hat y$ with $J_s > 0$. On the side $x < 0$, $\mathbf H$ points along…`,
        ['$+\\hat z$', '$-\\hat z$', '$-\\hat y$', '$-\\hat x$'], 0,
        [null, 'That is the side $x > 0$: $\\hat y\\times\\hat x = -\\hat z$. On $x < 0$ the normal toward the point is $-\\hat x$.', '$\\mathbf H$ is perpendicular to the current.', 'A plane wave has no field along its direction of travel ($\\pm\\hat x$ here).'],
        md`$\hat n = -\hat x$: $\tfrac12J_s\,\hat y\times(-\hat x) = \tfrac12J_s\,\hat z$. Check: $\mathbf E = -\tfrac\eta2J_s\hat y$, and $(-\hat y)\times\hat z = -\hat x$, away from the sheet. ✓`),
      RF(md`
        ### Step 5: sketching in space and in time

        Every piece of the waveform carries the time $t'$ it left the sheet. At time $t$ that piece is at distance $d = v_p(t - t')$.

        - **Versus time at a fixed place** $d$: the sheet's waveform delayed by $d/v_p$. Same shape, same orientation: $E_x(d, t) = \tfrac{\eta}{2}J_s(t - d/v_p)$.
        - **Versus position at a fixed time** $t$: the waveform **reversed**. What left first has gone farthest, so the start of the pulse is its outermost point. One microsecond of waveform covers $v_p\times1$ µs of space.
        - **Both sides:** $E$ is even in position (a mirror image about the sheet); $H$ is odd (mirrored and sign-flipped).

        Example: $J_s(t)$ ramps from 0 to 2 A/m over $0 < t < 1$ µs, then switches off, in free space. At $t = 3$ µs the pulse occupies $600 < |z| < 900$ m. Its start ($t' = 0$, value 0) is at 900 m; its end ($t' = 1$ µs, value 2 A/m) at 600 m. In space the ramp rises **toward** the sheet, then drops to zero.

        [[fig:snap]]
      `, { snap: { svg: PF.row([{ svg: rampJ(), cap: 'The sheet current $J_s(t)$.' }, { svg: rampE(), cap: '$E_x$ at t = 3 µs: even, the ramp reversed, peak (η₀/2)(2 A/m) = 377 V/m.' }, { svg: rampH(), cap: '$H_y$ at t = 3 µs: odd, ±½$J_s$.' }]).svg } }),
      Q(md`**Predict.** Same ramp pulse, free space. At $z = +750$ m, $E_x$ versus $t$ is…`,
        ['zero until 2.5 µs, a ramp up to 377 V/m at 3.5 µs, then zero', 'a ramp down from 377 V/m: time plots come out reversed', 'the ramp starting at $t = 0$: the field is everywhere at once', 'zero until 2.5 µs, then a ramp up to 754 V/m'], 0,
        [null, 'Only position plots are reversed. At a fixed place the waveform arrives in the order it was made.', 'The waveform needs $750/300 = 2.5$ µs to get there.', 'The peak is $\\tfrac{\\eta_0}{2}(2\\ \\text{A/m}) = 377$ V/m, not $\\eta_0J_s$.'],
        md`$E_x(750\ \text{m}, t) = \tfrac{\eta_0}{2}J_s(t - 2.5\ \mu\text{s})$: the ramp, delayed by 2.5 µs, with peak $60\pi\times2 = 377$ V/m.`),
      RF(md`
        ### Step 6: working backward from a snapshot (Lecture 19)

        A sheet in the $yz$-plane ($x = 0$), free space. At $t = 1$ µs the field on $x > 0$ is $H_y$ rising linearly from 0 at $x = 0$ to 2 A/m at $x = 100$ m, zero beyond.

        **The source.** The point at $x$ left the sheet at $t' = 1\ \mu\text{s} - x/c$: $x = 100$ m left at $\tfrac23$ µs, $x = 0$ at 1 µs. So $H_y(0^+, t)$ jumps to 2 A/m at $t = \tfrac23$ µs and falls linearly to 0 at 1 µs. Then $\mathbf J_s = 2\,\hat x\times H_y\hat y = 2H_y\,\hat z$: a jump to 4 A/m along $+\hat z$ at $\tfrac23$ µs, ramping to zero at 1 µs.

        **Elsewhere.**
        - At $x = 400$ m everything arrives $400/300 = \tfrac43$ µs late: $H_y$ jumps to 2 A/m at $t = 2$ µs and falls to 0 at $\tfrac73$ µs.
        - At $t = 4$ µs the pulse on $x > 0$ sits at $900 < x < 1000$ m (0 at 900 m, 2 A/m at 1000 m). On $x < 0$ it is the mirror image with the opposite sign.
        - $\mathbf E = -\tfrac{\eta_0}{2}\mathbf J_s(t - |x|/c)$, so $E_z = -\eta_0H_y(0^+, t - |x|/c)$ on both sides. At $t = 2$ µs it is nonzero for $300 < |x| < 400$ m, reaching $-2\eta_0 = -754$ V/m at $|x| = 400$ m.

        [[fig:l19]]
      `, { l19: { svg: PF.row([{ svg: l19given(), cap: 'Given: $H_y(x)$ at t = 1 µs, x > 0.' }, { svg: l19J(), cap: 'The source: $J_s(t)$ along +z.' }, { svg: l19H4(), cap: '$H_y(x)$ at t = 4 µs: odd.' }, { svg: l19E2(), cap: '$E_z(x)$ at t = 2 µs: even, opposite to $J_s$.' }]).svg } }),
      Q(md`**Predict.** In Lecture 19's problem, $H_y$ at $x = -950$ m and $t = 4$ µs is…`,
        ['$-1$ A/m', '$+1$ A/m', '$-2$ A/m', '$0$: the pulse has not reached $x < 0$'], 0,
        [null, 'That is the value at $x = +950$ m. $H$ is odd about the sheet.', 'That is at $x = -1000$ m, where the earliest part of the pulse (the 2 A/m jump) sits.', 'The sheet sends a wave each way; the left wave is the mirror image of the right one.'],
        md`Retarded time $4 - 950/300 = 0.833$ µs, halfway down the ramp from 2 A/m (at $\tfrac23$ µs) to 0 (at 1 µs): $|H_y| = 1$ A/m. On $x < 0$ the sign flips: $H_y = -1$ A/m.`),
      RF(md`
        ### The method

        !!method Sheet-launched waves in five steps
          1. **Geometry.** Name the sheet's normal axis and the current's direction. The fields depend only on the distance $d$ from the sheet and on $t$.
          2. **Retarded time.** The field at distance $d$ is set by $J_s$ at $t - d/v_p$, with $v_p = 1/\sqrt{\mu\epsilon}$.
          3. **H:** $\mathbf H = \tfrac12\mathbf J_s(t - d/v_p)\times\hat n$, with $\hat n$ from the sheet toward the point. Opposite on the two sides.
          4. **E:** $\mathbf E = -\tfrac\eta2\mathbf J_s(t - d/v_p)$, the same on both sides, and $|\mathbf E| = \eta|\mathbf H|$.
          5. **Check** that $\mathbf E\times\mathbf H$ points away from the sheet. Sketches: in time, the same shape delayed; in space, reversed (the start is outermost), $E$ even, $H$ odd.

        ### Worked example

        !!graded Problem
          (Spring 2018 #5, 20 pts.) A thin current sheet in the $y = 0$ plane launches forward and reverse uniform plane waves into free space ($v_p = 3\times10^8$ m/s, $\eta = 120\pi\ \Omega$). Its current is $\mathbf J = -J_s(t)\,\hat x$ A/m with $J_s(t)$ below. (a) Write the forward wave as $\mathbf H(y,t) = (\text{ii})\,J_s(t - y/v_p)\,(\text{i})$: give the unit vector (i) and the coefficient (ii). (b) The same for the reverse wave, $J_s(t + y/v_p)$. (c) Sketch that component of $\mathbf H$ versus $y$ at $t = 5$ ns.

        [[fig:js18]]

        **1. Forward wave** ($y > 0$, $\hat n = +\hat y$). $\mathbf H = \tfrac12(-J_s\hat x)\times\hat y = -\tfrac12J_s\,\hat z$. So (i) $= \hat z$ and (ii) $= -\tfrac12$:
        $$\mathbf H = -\tfrac12J_s(t - y/v_p)\,\hat z\ \ \text{A/m}$$

        **2. Reverse wave** ($y < 0$, $\hat n = -\hat y$). $\mathbf H = +\tfrac12J_s(t + y/v_p)\,\hat z$: (i) $= \hat z$, (ii) $= +\tfrac12$.

        **3. Check.** $\mathbf E = -\tfrac\eta2\mathbf J = +60\pi J_s\,\hat x$ on both sides. On $y > 0$: $\hat x\times(-\hat z) = +\hat y$ ✓; on $y < 0$: $\hat x\times\hat z = -\hat y$ ✓. Boundary condition: $\mathbf H^+ - \mathbf H^- = -J_s\hat z = (-J_s\hat x)\times\hat y = \mathbf J_s\times\hat n$ ✓.

        **4. Map space to emission time.** At $t = 5$ ns the point $|y|$ shows $J_s(5\ \text{ns} - |y|/(0.3\ \text{m/ns}))$: $|y| = 0.3$ m ↔ 4 ns, 0.6 m ↔ 3 ns, 0.9 m ↔ 2 ns, 1.2 m ↔ 1 ns.

        **5. Values on $y > 0$** ($H_z = -\tfrac12J_s$): zero for $y < 0.3$ m (emitted after 4 ns, when $J_s = 0$); $+2$ A/m for $0.3 < y < 0.6$ m (the $-4$ A/m flat); a straight line from $+2$ A/m at 0.6 m through 0 at 0.75 m to $-2$ A/m at 0.9 m; back to 0 at 1.2 m; zero beyond (emitted before 1 ns).

        **6. $y < 0$.** $H_z$ is odd: the mirror image with the sign flipped.

        [[fig:h18]]

        **Check.** The jump at $|y| = 0.3$ m is the switch-off at 4 ns: it left last, so it is nearest the sheet. The outermost feature is the start of the pulse: $(0.3\ \text{m/ns})(5 - 1)\ \text{ns} = 1.2$ m ✓.

        !!mistake Common mistakes
          - Drawing the space sketch with the same orientation as $J_s(t)$. In space the waveform is reversed: its earliest part is farthest out.
          - Giving $\mathbf H$ the same sign on both sides. $H$ is odd about the sheet; $E$ is even.
          - Using $\eta J_s$ instead of $\tfrac\eta2J_s$: the jump in $H$ is shared by two waves.
          - Pointing $\mathbf E$ along $\mathbf J_s$. It points against it; the sheet is a source.
          - Writing $J_s(t - z/v_p)$ on the side $z < 0$, which is a time in the future there. Use $t - |z|/v_p$, i.e. $t + z/v_p$ for $z < 0$.
          - Expecting the wave to weaken with distance. A sheet's plane wave keeps its amplitude; only the delay grows.
          - Mixing units: $c = 0.3$ m/ns $= 300$ m/µs.

        ### Check questions
      `, { js18: { svg: sp18J(), cap: 'Spring 2018 #5: $J_s(t)$. The current is $\\mathbf J = -J_s(t)\\,\\hat x$.' }, h18: { svg: sp18H(), cap: '$H_z(y)$ at t = 5 ns: odd about the sheet, the waveform reversed in space, ±½$J_s$.' } }),
      Q(md`A sheet current $\mathbf J_s = 2\hat y$ A/m lies on the $z = 0$ plane in free space. In $z < 0$ the field is $\mathbf H = 3\hat z$ A/m. In $z > 0$, $\mathbf H$ is…`,
        ['$2\\hat x + 3\\hat z$ A/m', '$-2\\hat x + 3\\hat z$ A/m', '$5\\hat z$ A/m', '$1\\hat z$ A/m', '$-2\\hat y + 3\\hat z$ A/m'], 0,
        [null, 'Sign: $\\mathbf H^+ - \\mathbf H^- = \\mathbf J_s\\times\\hat n = 2\\hat y\\times\\hat z = +2\\hat x$, with $\\hat n$ from region − into region +.', 'The normal component of $\\mathbf H$ (here $H_z$, in vacuum on both sides) is continuous. Only the tangential part jumps.', 'The normal component is continuous; the jump is tangential and perpendicular to $\\mathbf J_s$.', 'The jump in $\\mathbf H$ is perpendicular to $\\mathbf J_s$, so it cannot be along $\\hat y$.'],
        md`$\mathbf H^+ = \mathbf H^- + \mathbf J_s\times\hat n = 3\hat z + 2\hat y\times\hat z = 2\hat x + 3\hat z$ A/m. (Spring 2018, 1(vi); the printed options e and f are identical.)`, { src: 'Spring 2018 Exam 2' }),
      Q(md`A sheet on the plane $y = 0$ carries a sinusoidal $\mathbf J_s$ along $\pm\hat z$; the waves it launches have $|\mathbf H| = H_0$. At an instant when $\mathbf J_s$ points along $-\hat z$, $\mathbf E$ just beside the sheet is…`,
        ['$\\eta_0H_0$ along $+\\hat z$', '$\\eta_0H_0$ along $-\\hat z$', '$\\eta_0H_0/2$ along $+\\hat z$', '$2\\eta_0H_0$ along $+\\hat z$'], 0,
        [null, '$\\mathbf E$ points against the sheet current.', '$H_0$ already is the wave\'s field ($\\tfrac12|J_s|$), so $|E| = \\eta_0H_0$ with no extra ½.', '$|J_s| = 2H_0$, but $|E| = \\tfrac{\\eta_0}{2}|J_s| = \\eta_0H_0$.'],
        md`$|J_s| = 2H_0$ and $|\mathbf E| = \tfrac{\eta_0}{2}|J_s| = \eta_0H_0$, directed against $\mathbf J_s$: $+\hat z$. (Lecture 19's example.)`),
      Q(md`Why does the sheet launch equal waveforms toward $+z$ and $-z$?`,
        ['Tangential $\\mathbf E$ is continuous at the sheet, so both sides start with the same $E_x(0,t)$', 'The sheet current splits into two equal currents', 'The wave equation has only symmetric solutions', 'Energy conservation forces equal amplitudes at every instant'], 0,
        [null, 'The current is one sheet current; it is its jump in $H$ that is shared by two waves.', 'The wave equation allows any $f(t - z/v_p) + g(t + z/v_p)$, symmetric or not.', 'Energy conservation alone fixes the total, not how it divides; symmetry and the $E$ condition do that.'],
        md`$E_x(0^+, t) = E_x(0^-, t)$ forces $Af(t) = Bg(t)$. The $H$ jump then sets the common amplitude to $\tfrac\eta2J_s$.`),
      Q(md`A sheet's current switches on at $t = 0$ to a constant $J_0$ and stays on (free space). At time $t$, at distance $d$ from the sheet…`,
        ['$|\\mathbf H| = J_0/2$ if $d < ct$, and zero if $d > ct$', '$|\\mathbf H| = J_0/2$ everywhere for all $t > 0$', '$|\\mathbf H|$ grows from 0 to $J_0/2$ as $t$ goes to infinity', '$|\\mathbf H| = J_0/2$ only at $d = ct$, a thin shell'], 0,
        [null, 'The news of the switch-on travels at $c$; beyond the front nothing has happened yet.', 'Behind the front the field is already the full static value; the step arrives as a step.', 'A step in $J_s$ makes a step in the wave, not a pulse: behind the front $H$ stays at $J_0/2$.'],
        md`$H = \tfrac12J_s(t - d/c)$: a step that has traveled $ct$. Behind the front the field equals the static sheet field.`),
      Q(md`The same sheet current is placed in a lossless dielectric with $\epsilon_r = 4$, $\mu_r = 1$ instead of free space. Compared with free space…`,
        ['$|\\mathbf E|$ halves, $|\\mathbf H|$ is unchanged, and a pulse is half as long in space', '$|\\mathbf E|$ and $|\\mathbf H|$ both halve', '$|\\mathbf E|$ is unchanged and $|\\mathbf H|$ doubles', '$|\\mathbf E|$ quarters, because $\\eta \\propto 1/\\epsilon_r$'], 0,
        [null, '$|H| = \\tfrac12|J_s|$ comes from the boundary condition alone, with no material constant in it.', 'The $H$ jump fixes $|H| = J_s/2$ in any medium; $E = \\eta H$ is what changes.', '$\\eta = \\eta_0/\\sqrt{\\epsilon_r}$: a square root.'],
        md`$\eta = \eta_0/\sqrt4 = \eta_0/2$, so $E = \tfrac\eta2J_s$ halves; $H = \tfrac12J_s$ is unchanged; $v_p = c/2$, so a pulse of duration $\Delta t$ is $v_p\Delta t$ long, half as long.`),
      Q(md`At the same instant, compare the fields at $z = +d$ and $z = -d$ on either side of the course's sheet.`,
        ['$\\mathbf E$ equal, $\\mathbf H$ opposite', '$\\mathbf E$ opposite, $\\mathbf H$ equal', 'both equal', 'both opposite'], 0,
        [null, 'Tangential $\\mathbf E$ is continuous at the sheet and both waves carry the same waveform out, so $\\mathbf E$ is even.', 'Then $\\mathbf E\\times\\mathbf H$ would point the same way on both sides; one of the waves would be traveling toward the sheet.', 'Then $\\mathbf E\\times\\mathbf H$ would point the same way on both sides.'],
        md`Both points show $J_s(t - d/v_p)$. $\mathbf E = -\tfrac\eta2\mathbf J_s$ has no $\hat n$ in it (even); $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ flips with $\hat n$ (odd).`),
      Q(md`$J_s(t)$ is a pulse that rises slowly and falls fast (a sawtooth). In a snapshot of $E$ versus distance on one side, the pulse…`,
        ['falls slowly toward the front and rises steeply on the side nearest the sheet', 'rises slowly toward the front, exactly like $J_s(t)$', 'is symmetric: the snapshot loses the shape', 'is compressed to a spike, because space and time have different units'], 0,
        [null, 'That copies the time plot. In space the earliest part is farthest out, so the slow rise ends up outermost, read inward.', 'Each piece keeps its value; only the order in space is reversed.', 'The shape is kept, stretched by $v_p$.'],
        md`Distance $d = v_p(t - t')$ decreases as the emission time $t'$ increases, so the snapshot is $J_s$ read backward: the slow rise is spread over the outer part, the steep drop sits nearest the sheet.`),
      Q(md`Units check: $\tfrac{\eta}{2}J_s$, with $\eta$ in ohms and $J_s$ in A/m, is in…`,
        ['V/m', 'V', 'A/m', 'W/m²'], 0,
        [null, 'Ω·A = V, and the "per meter" of $J_s$ stays: V/m.', 'That is $\\tfrac12J_s$ itself, the magnetic field.', 'That is the unit of a Poynting vector, $E$ times $H$.'],
        md`$\Omega\cdot\text{A/m} = \text{V/m}$: an electric field, as it should be.`),
      R(md`
        ### Rapid fire: directions

        **The trick:** $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ with $\hat n$ toward the point; $\mathbf E$ against $\mathbf J_s$ on both sides; $\mathbf E\times\mathbf H$ away from the sheet.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t15_dir', { need: 8 }), { id: 't15-sheet-waves.r0' }),
      R(md`
        ### Rapid fire: sizes and delays

        **The trick:** $|E| = \tfrac\eta2|J_s|$, $|H| = \tfrac12|J_s|$ at every distance; the delay is $d/v_p$ with $v_p = c/\sqrt{\epsilon_r}$, and $c = 300$ m/µs.
      `),
      Object.assign(G('rf_t15_num', { need: 8 }), { id: 't15-sheet-waves.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t15_pulse', { need: 2 }),
      G('t15_snapshot', { need: 2 }),
      G('t15_inverse', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  // a sheet on the plane n = 0 with current along ±j: returns the pieces every template needs
  const setup = () => {
    const n = ri(0, 2), others = [0, 1, 2].filter((i) => i !== n), j = pick(others), k = others.find((i) => i !== j);
    const sj = pick([1, -1]), side = pick([1, -1]);
    const J = uv(j, sj), nh = uv(n, side), H = cross(J, nh);
    return { n, j, k, sj, side, J, nh, H, sheet: md`A current sheet on the plane $${AX[n]} = 0$ carries $\mathbf J_s = ${sgn(sj)}J_s(t)\,\hat ${AX[j]}$, with $J_s > 0$ at the retarded time`, at: md`$${AX[n]} ${side > 0 ? '>' : '<'} 0$` };
  };
  GENS.rf_t15_dir = () => one([
    // H on a given side
    () => {
      const s = setup();
      return MC('H direction', md`${s.sheet}. At a point with ${s.at}, $\mathbf H$ points along…`, opt(s.H),
        [[opt(neg(s.H)), 'That is the field on the other side (or the cross product in the wrong order). $\\mathbf H$ flips across the sheet.'], [opt(s.J), '$\\mathbf H$ circles the current: it is perpendicular to $\\mathbf J_s$.'], [opt(neg(s.J)), 'That is the direction of $\\mathbf E$, not $\\mathbf H$.'], [opt(s.nh), 'A plane wave has no field along its direction of travel.']],
        md`$\mathbf H = \tfrac12\mathbf J_s\times\hat n$ with $\hat n = ${vt(s.nh)}$ (toward the point): $(${vt(s.J)})\times(${vt(s.nh)}) = ${vt(s.H)}$.`);
    },
    // E direction (either side)
    () => {
      const s = setup();
      return MC('E direction', md`${s.sheet}. At a point with ${s.at}, $\mathbf E$ points along…`, opt(neg(s.J)),
        [[opt(s.J), '$\\mathbf E$ points against the sheet current: the sheet is a source, pushing charge against its own field.'], [opt(s.H), 'That is the direction of $\\mathbf H = \\tfrac12\\mathbf J_s\\times\\hat n$.'], [opt(s.nh), 'A plane wave has no field along its direction of travel.'], [opt(neg(s.H)), '$\\mathbf E$ is parallel to the current line, not to $\\mathbf H$.']],
        md`$\mathbf E = -\tfrac\eta2\mathbf J_s$ on both sides: along $${vt(neg(s.J))}$. Check: $(${vt(neg(s.J))})\times(${vt(s.H)}) = ${vt(cross(neg(s.J), s.H))}$, away from the sheet. ✓`);
    },
    // which way does a wave with these E and H travel?
    () => {
      const a = ri(0, 2), b = pick([0, 1, 2].filter((i) => i !== a));
      const E = uv(a, pick([1, -1])), H = uv(b, pick([1, -1])), k = cross(E, H);
      return MC('Direction of travel', md`At some point a uniform plane wave has $\mathbf E$ along $${vt(E)}$ and $\mathbf H$ along $${vt(H)}$. It travels toward…`, opt(k),
        [[opt(neg(k)), 'That is $\\mathbf H\\times\\mathbf E$. The travel direction is $\\mathbf E\\times\\mathbf H$.'], [opt(E), 'A plane wave never travels along its own $\\mathbf E$.'], [opt(H), 'A plane wave never travels along its own $\\mathbf H$.']],
        md`$(${vt(E)})\times(${vt(H)}) = ${vt(k)}$.`);
    },
    // the sheet current from a measured H
    () => {
      const n = ri(0, 2), others = [0, 1, 2].filter((i) => i !== n), hk = pick(others), sh = pick([1, -1]), side = pick([1, -1]);
      const Hv = uv(hk, sh), nh = uv(n, side), J = cross(nh, Hv);
      return MC('Current from H', md`A sheet on the plane $${AX[n]} = 0$ launches plane waves. At a point with $${AX[n]} ${side > 0 ? '>' : '<'} 0$ you measure $\mathbf H$ along $${vt(Hv)}$. The sheet current, at the matching retarded time, pointed along…`, opt(J),
        [[opt(neg(J)), 'Reversed. From $\\mathbf H = \\tfrac12\\mathbf J_s\\times\\hat n$: $\\mathbf J_s = 2\\,\\hat n\\times\\mathbf H$, with $\\hat n$ toward the point.'], [opt(Hv), 'The current is perpendicular to the $\\mathbf H$ it makes.'], [opt(nh), 'The current lies in the sheet; it has no component along the normal.']],
        md`$\mathbf J_s = 2\,\hat n\times\mathbf H$ with $\hat n = ${vt(nh)}$: $(${vt(nh)})\times(${vt(Hv)}) = ${vt(J)}$.`);
    },
    // the mirror point
    () => {
      const s = setup();
      return MC('Mirror point', md`${s.sheet}. Compare the fields at two points the same distance from the sheet on opposite sides, at the same instant.`, '$\\mathbf E$ the same, $\\mathbf H$ reversed',
        [['$\\mathbf E$ reversed, $\\mathbf H$ the same', 'Tangential $\\mathbf E$ is continuous at the sheet and both waves carry the same waveform, so $\\mathbf E$ is even.'], ['both the same', 'Then $\\mathbf E\\times\\mathbf H$ would point the same way on both sides, toward the sheet on one of them.'], ['both reversed', 'Then $\\mathbf E\\times\\mathbf H$ would point the same way on both sides.']],
        md`$\mathbf E = -\tfrac\eta2\mathbf J_s$ has no $\hat n$ in it; $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ flips with $\hat n$.`);
    },
  ]);

  const ER = [1, 1, 4, 9];
  const med = (er) => (er === 1 ? 'free space' : `a lossless dielectric with $\\epsilon_r = ${er}$, $\\mu_r = 1$`);
  GENS.rf_t15_num = () => one([
    // peak E from the sheet current
    () => {
      const J0 = pick([1, 2, 4, 5, 10]), er = pick(ER), d = pick([10, 50, 200, 1000]);
      const eta = ETA0 / Math.sqrt(er), E = eta * J0 / 2;
      const o = (x) => `$${p(+x.toPrecision(3))}$ V/m`;
      return MC('Field strength', md`A sheet in ${med(er)} carries a current pulse with peak $|\mathbf J_s| = ${J0}$ A/m. The peak $|\mathbf E|$ at $${d}$ m from the sheet is…`, o(E),
        [[o(eta * J0), 'That is $\\eta J_s$; the jump in $H$ is shared by two waves, so $|E| = \\tfrac\\eta2|J_s|$.'], [o(E / d), 'A sheet\'s plane wave does not weaken with distance.'], [o(er === 1 ? E / 2 : ETA0 * J0 / 2), er === 1 ? 'One factor of ½ too many.' : 'That uses $\\eta_0$; in the medium $\\eta = \\eta_0/\\sqrt{\\epsilon_r}$.'], [o(J0 / 2), 'That is $|H| = J_s/2$ (in A/m). Multiply by $\\eta$.']],
        md`$|E| = \tfrac{\eta}{2}|J_s|$ with $\eta = ${er === 1 ? '120\\pi' : `120\\pi/\\sqrt{${er}}`}\ \Omega$: $${f(E)}$ V/m, at any distance.`);
    },
    // H does not depend on distance or material
    () => {
      const J0 = pick([2, 3, 4, 6, 8]), er = pick(ER), d = pick([1, 30, 500]);
      const o = (x) => `$${p(x)}$ A/m`;
      return MC('|H|', md`A sheet in ${med(er)} carries peak $|\mathbf J_s| = ${J0}$ A/m. The peak $|\mathbf H|$ at $${d}$ m is…`, o(J0 / 2),
        [[o(J0), 'The jump in $H$ across the sheet is $J_s$, but it is split: $\\tfrac12J_s$ on each side.'], [o(J0 / 4), 'One factor of ½ too many.'], [o(+(J0 / 2 / Math.sqrt(er === 1 ? 4 : er)).toPrecision(3)), '$|H| = \\tfrac12|J_s|$ involves no material constant.'], [o(+(J0 * ETA0 / 2 / Math.sqrt(er)).toPrecision(3)), 'That is $|E| = \\eta|H|$, in V/m.']],
        md`$|H| = \tfrac12|J_s|$ from the boundary condition alone: $${p(J0 / 2)}$ A/m at any distance, in any medium.`);
    },
    // arrival delay
    () => {
      const d = pick([150, 300, 600, 900, 1500]), er = pick(ER);
      const t = d * Math.sqrt(er) / 300;
      const o = (x) => `$${p(+x.toPrecision(3))}$ µs`;
      return MC('Delay', md`A sheet in ${med(er)} switches its current on at $t = 0$. When does the field arrive at $${d}$ m?`, o(t),
        [[o(d / 300), er === 1 ? 'Off by a factor.' : 'That is the free-space delay; in the medium $v_p = c/\\sqrt{\\epsilon_r}$.'], [o(d * er / 300), '$v_p = c/\\sqrt{\\epsilon_r}$: a square root, not $\\epsilon_r$.'], [o(d / Math.sqrt(er) / 300 / 2), er === 1 ? 'Half the delay: each wave covers the whole distance at $c$.' : 'The wave is slower in a medium, not faster.'], [o(2 * t), 'Each wave covers the distance once.'], [o(t * 1000), 'Units: $c = 300$ m/µs; this is off by 1000.']],
        md`$v_p = ${er === 1 ? '300' : `300/\\sqrt{${er}} = ${p(300 / Math.sqrt(er))}`}$ m/µs, so $t = ${d}/${p(300 / Math.sqrt(er))} = ${p(+t.toPrecision(3))}$ µs.`);
    },
    // where is the front?
    () => {
      const t0 = pick([1, 2]), dt = pick([1, 2, 3]), er = pick([1, 4]);
      const v = 300 / Math.sqrt(er), T = t0 + dt;
      const o = (x) => `$${p(x)}$ m`;
      return MC('Front position', md`A sheet in ${med(er)} switches its current on at $t = ${t0}$ µs. At $t = ${T}$ µs the front of the wave on each side is how far from the sheet?`, o(v * dt),
        [[o(v * T), 'The clock starts when the current switches on, at $' + t0 + '$ µs.'], [o(2 * v * dt), 'That is the distance between the two fronts; each is $v_p\\Delta t$ from the sheet.'], [o(v * dt / 2), 'Each front moves at the full $v_p$.'], [o(300 * dt * (er === 1 ? 3 : 1)), er === 1 ? 'Recheck $c = 300$ m/µs.' : 'That is the free-space speed; here $v_p = c/2$.']],
        md`$d = v_p(t - t_{\text{on}}) = (${p(v)}\ \text{m}/\mu\text{s})(${dt}\ \mu\text{s}) = ${p(v * dt)}$ m on each side.`);
    },
    // the sheet current from |E| or |H|
    () => {
      const byE = pick([true, false]);
      if (byE) {
        const E0 = pick([377, 754, 188.5, 1131]), J = 2 * E0 / ETA0;
        const o = (x) => `$${p(+x.toPrecision(3))}$ A/m`;
        return MC('Source strength', md`A sheet in free space launches waves with $|\mathbf E| = ${E0}$ V/m. $|\mathbf J_s|$ is…`, o(J),
          [[o(J / 2), 'That is $|H| = |E|/\\eta_0$. The current is twice $|H|$.'], [o(E0 * 2), 'Divide by $\\eta_0$: $|J_s| = 2|E|/\\eta_0$.'], [o(J * 2), 'One factor of 2 too many.']],
          md`$|J_s| = 2|E|/\eta_0 = 2(${E0})/377 = ${p(+J.toPrecision(3))}$ A/m.`);
      }
      const H0 = pick([0.5, 1, 1.5, 3]);
      const o = (x) => `$${p(x)}$ A/m`;
      return MC('Source strength', md`On one side of a sheet the wave has $|\mathbf H| = ${H0}$ A/m. $|\mathbf J_s|$ is…`, o(2 * H0),
        [[o(H0), 'The current is the full jump in $H$: $H^+ - H^-$, and $H^- = -H^+$.'], [o(H0 / 2), 'The current makes $\\tfrac12J_s$ per side, so $J_s = 2|H|$.'], [o(4 * H0), 'One factor of 2 too many.']],
        md`$H_{\text{one side}} = \tfrac12J_s$, so $|J_s| = 2(${H0}) = ${p(2 * H0)}$ A/m. Lecture 19: $|J_s| = 2|H|$.`);
    },
    // a pulse's length in space
    () => {
      const D = pick([2, 5, 10, 20, 50]), er = pick([1, 4, 9]);
      const v = 0.3 / Math.sqrt(er), len = v * D;
      const o = (x) => `$${p(+x.toPrecision(3))}$ m`;
      return MC('Length in space', md`A sheet in ${med(er)} emits a current pulse lasting $${D}$ ns. How long is the pulse in space?`, o(len),
        [[o(0.3 * D), er === 1 ? 'Off by a factor.' : 'That uses $c$; in the medium $v_p = c/\\sqrt{\\epsilon_r}$.'], [o(2 * len), 'That counts both waves; each one is $v_p\\Delta t$ long.'], [o(len * 1000), 'Units: $c = 0.3$ m/ns.'], [o(len / 2), 'Each wave is $v_p\\Delta t$ long, not half of it.']],
        md`$\ell = v_p\Delta t = (${p(+v.toPrecision(3))}\ \text{m/ns})(${D}\ \text{ns}) = ${p(+len.toPrecision(3))}$ m.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  // a triangular pulse at a chosen point and time, for a sheet in any plane
  GENS.t15_pulse = () => {
    const s = setup();
    const J0 = pick([2, 4, 5, 10]), tp = pick([1, 2]), tf = tp + pick([1, 2]);
    const er = pick([1, 1, 4]), v = 0.3 / Math.sqrt(er), eta = ETA0 / Math.sqrt(er);
    const tau = pick([tp / 2, tp, tp + (tf - tp) / 2, tp + (tf - tp) / 4]);
    const Jt = tau <= tp ? J0 * tau / tp : J0 * (tf - tau) / (tf - tp);
    const delay = pick([1, 2, 4, 5, 10]), d = v * delay, T = tau + delay;
    const Ej = -s.sj * eta * Jt / 2;                       // E along ĵ
    const Hk = s.H[s.k] * Jt / 2;                           // H along k̂
    const pt = `${AX[s.n]} = ${s.side > 0 ? '' : '-'}${p(+d.toPrecision(4))}\\ \\text{m}`;
    return {
      title: 'A pulse from a sheet in any plane',
      q: md`${s.sheet.replace(', with $J_s > 0$ at the retarded time', '')} in ${med(er)}. $J_s(t)$ is a triangle: zero for $t < 0$, rising linearly to $${J0}$ A/m at $t = ${tp}$ ns, falling linearly to zero at $t = ${tf}$ ns, zero after. Find $E_${AX[s.j]}$ and $H_${AX[s.k]}$ (signed) at $${pt}$ and $t = ${p(T)}$ ns, and the direction the wave there travels.`,
      parts: [
        N(`E_${AX[s.j]}`, Ej, 'V/m'),
        N(`H_${AX[s.k]}`, Hk, 'A/m'),
        { lbl: 'The wave at that point travels toward', mc: [`$+${AX[s.n]}$`, `$-${AX[s.n]}$`], a: s.side > 0 ? 0 : 1, fixed: true, why: s.side > 0 ? [null, 'Each wave moves away from the sheet.'] : ['Each wave moves away from the sheet.', null] },
      ],
      hints: [`The retarded time is $t - d/v_p$ with $d = ${p(+d.toPrecision(4))}$ m and $v_p = ${p(+v.toPrecision(3))}$ m/ns.`, '$\\mathbf H = \\tfrac12\\mathbf J_s\\times\\hat n$ ($\\hat n$ from the sheet toward the point) and $\\mathbf E = -\\tfrac\\eta2\\mathbf J_s$, both at the retarded time.'],
      sol: sol({
        eq: md`$\mathbf H = \tfrac12\mathbf J_s(t - d/v_p)\times\hat n$, $\;\mathbf E = -\tfrac\eta2\mathbf J_s(t - d/v_p)$, with $v_p = ${er === 1 ? 'c' : 'c/\\sqrt{\\epsilon_r}'}$ and $\eta = ${er === 1 ? '\\eta_0' : '\\eta_0/\\sqrt{\\epsilon_r}'}$.`,
        sym: md`Retarded time $\tau = t - d/v_p$. Here $\hat n = ${vt(s.nh)}$, so $\mathbf H = \tfrac12J_s(\tau)\,(${vt(s.J)})\times(${vt(s.nh)}) = \tfrac12J_s(\tau)\,(${vt(s.H)})$ and $\mathbf E = \tfrac\eta2J_s(\tau)\,(${vt(neg(s.J))})$.`,
        sub: md`$v_p = ${p(+v.toPrecision(3))}$ m/ns, $\tau = ${p(T)} - ${p(+d.toPrecision(4))}/${p(+v.toPrecision(3))} = ${p(tau)}$ ns, $J_s(\tau) = ${f(Jt)}$ A/m. $\eta = ${f(eta)}\ \Omega$:
$$E_${AX[s.j]} = ${s.sj > 0 ? '-' : ''}\tfrac{${f(eta)}}{2}(${f(Jt)}) = ${f(Ej)}\ \text{V/m} \qquad H_${AX[s.k]} = ${s.H[s.k] > 0 ? '' : '-'}\tfrac12(${f(Jt)}) = ${f(Hk)}\ \text{A/m}$$`,
        ans: md`$E_${AX[s.j]} = ${f(Ej)}$ V/m, $H_${AX[s.k]} = ${f(Hk)}$ A/m; the wave travels toward $${s.side > 0 ? '+' : '-'}${AX[s.n]}$.`,
        check: md`$\mathbf E\times\mathbf H$ is along $(${vt(neg(s.J))})\times(${vt(s.H)}) = ${vt(cross(neg(s.J), s.H))}$: away from the sheet ✓. $|E|/|H| = ${f(Math.abs(Ej / Hk))}\ \Omega = \eta$ ✓.`,
      }),
    };
  };

  // a ramp pulse in a snapshot: where it is, and the fields on the left side
  GENS.t15_snapshot = () => {
    const up = pick([true, false]), J0 = pick([2, 3, 4, 6]), t0 = pick([0, 1]), D = pick([1, 2]), er = pick([1, 4]);
    const v = 300 / Math.sqrt(er), eta = ETA0 / Math.sqrt(er);
    const T = t0 + D + pick([1, 2, 3]);
    const front = v * (T - t0), inner = v * (T - t0 - D);
    const fr = pick([0.25, 0.5, 0.75]), zp = inner + fr * (front - inner);
    const tau = T - zp / v, Jt = up ? J0 * (tau - t0) / D : J0 * (1 - (tau - t0) / D);
    const Ex = eta * Jt / 2, Hy = -Jt / 2;
    const shape = up ? `rises linearly from 0 at $t = ${t0}$ µs to $${J0}$ A/m at $t = ${t0 + D}$ µs, then drops to zero` : `jumps to $${J0}$ A/m at $t = ${t0}$ µs, falls linearly to zero at $t = ${t0 + D}$ µs, and stays zero`;
    return {
      title: 'Where is the pulse?',
      q: md`The sheet $\mathbf J_s = -J_s(t)\hat x$ on $z = 0$ sits in ${med(er)}. $J_s(t)$ is zero before $t = ${t0}$ µs, ${shape}. At $t = ${T}$ µs, find the distance of the pulse's front (outer edge) and of its inner edge from the sheet, and $E_x$ and $H_y$ at $z = -${p(zp)}$ m. Where is $|\mathbf E|$ largest?`,
      parts: [
        N('|z|\\ \\text{of the front}', front, 'm'),
        N('|z|\\ \\text{of the inner edge}', inner, 'm'),
        N(`E_x\\ \\text{at}\\ z = -${p(zp)}\\ \\text{m}`, Ex, 'V/m'),
        N(`H_y\\ \\text{at}\\ z = -${p(zp)}\\ \\text{m}`, Hy, 'A/m'),
        { lbl: 'In the snapshot, $|\\mathbf E|$ is largest', mc: ['at the inner edge, nearest the sheet', 'at the front, farthest out'], a: up ? 0 : 1, fixed: true, why: up ? [null, 'The front left the sheet first, when $J_s$ was still 0.'] : ['The inner edge left last, when $J_s$ had fallen to 0.', null] },
      ],
      hints: [`A piece emitted at $t'$ is at $|z| = v_p(t - t')$, with $v_p = ${p(v)}$ m/µs.`, 'On $z < 0$: $E_x = \\tfrac\\eta2J_s(t + z/v_p)$, $H_y = -\\tfrac12J_s(t + z/v_p)$.'],
      sol: sol({
        eq: md`$E_x = \tfrac\eta2J_s(t - |z|/v_p)$ on both sides; $H_y = \pm\tfrac12J_s(t - |z|/v_p)$ for $z \gtrless 0$. A piece emitted at $t'$ is at $|z| = v_p(t - t')$.`,
        sym: md`Front: emitted at $t' = ${t0}$ µs, $|z| = v_p(t - ${t0})$. Inner edge: emitted at $t' = ${t0 + D}$ µs, $|z| = v_p(t - ${t0 + D})$. At $z = -${p(zp)}$ m the retarded time is $\tau = t - ${p(zp)}/v_p$.`,
        sub: md`$v_p = ${p(v)}$ m/µs: front at $${p(v)}\times${T - t0} = ${p(front)}$ m, inner edge at $${p(v)}\times${T - t0 - D} = ${p(inner)}$ m. $\tau = ${T} - ${p(zp)}/${p(v)} = ${p(+tau.toPrecision(4))}$ µs, so $J_s(\tau) = ${f(Jt)}$ A/m and
$$E_x = \tfrac{${f(eta)}}{2}(${f(Jt)}) = ${f(Ex)}\ \text{V/m} \qquad H_y = -\tfrac12(${f(Jt)}) = ${f(Hy)}\ \text{A/m}$$`,
        ans: md`Front at $${p(front)}$ m, inner edge at $${p(inner)}$ m (on both sides); $E_x = ${f(Ex)}$ V/m, $H_y = ${f(Hy)}$ A/m. $|\mathbf E|$ peaks ${up ? 'at the inner edge: the last part emitted, when $J_s$ was largest' : 'at the front: the first part emitted, when $J_s$ was largest'}.`,
        check: md`The pulse is $v_p\times${D}\ \mu\text{s} = ${p(v * D)}$ m long ✓, and $H_y < 0$ on $z < 0$ for $J_s > 0$, as the formula sheet says.`,
      }),
    };
  };

  // Lecture 19 style: a snapshot on x > 0 back to the sheet current, then the field elsewhere
  GENS.t15_inverse = () => {
    const L0 = pick([100, 150, 300]), T0 = L0 === 300 ? 2 : pick([1, 2]), H0 = pick([1, 2, 3]) * pick([1, -1]);   // t_on > 0
    const lc = L0 / 300, ton = T0 - lc;
    const fr = pick([0.25, 0.5, 0.75]), x2 = pick([-1200, -600, 300, 900]);
    const T2 = +(ton + fr * lc + Math.abs(x2) / 300).toPrecision(4);       // the time as printed
    const tau = T2 - Math.abs(x2) / 300, Fv = H0 * 300 * (T0 - tau) / L0;     // H_y(0+, τ) from the snapshot
    const Ez = -ETA0 * Fv;
    const jz = H0 > 0 ? 0 : 1;
    return {
      title: 'From a snapshot back to the sheet',
      q: md`A sheet in the $yz$-plane ($x = 0$) radiates into free space. At $t = ${T0}$ µs the field on $x > 0$ is $H_y = ${H0}\,(x/${L0}\ \text{m})$ A/m for $0 < x < ${L0}$ m and zero elsewhere. Find when the sheet current switched on (the moment of the jump) and off, its peak magnitude and direction, and $E_z$ at $x = ${x2}$ m, $t = ${p(+T2.toPrecision(4))}$ µs.`,
      parts: [
        N('t_{\\text{on}}', ton, 'µs'),
        N('t_{\\text{off}}', T0, 'µs'),
        N('|\\mathbf J_s|_{\\max}', 2 * Math.abs(H0), 'A/m'),
        { lbl: 'At its peak, $\\mathbf J_s$ points along', mc: ['$+\\hat z$', '$-\\hat z$', '$+\\hat y$', '$-\\hat y$'], a: jz, fixed: true, why: [jz === 0 ? null : '$\\mathbf J_s = 2\\hat x\\times H_y\\hat y = 2H_y\\hat z$, and $H_y < 0$ here.', jz === 1 ? null : '$\\mathbf J_s = 2\\hat x\\times H_y\\hat y = 2H_y\\hat z$, and $H_y > 0$ here.', 'The current is perpendicular to the $\\mathbf H$ it makes.', 'The current is perpendicular to the $\\mathbf H$ it makes.'] },
        N(`E_z\\ \\text{at}\\ x = ${x2}\\ \\text{m}`, Ez, 'V/m'),
      ],
      hints: ['The point at $x$ left the sheet at $t\' = t - x/c$, with $c = 300$ m/µs. The point $x = ' + L0 + '$ m left first.', '$\\mathbf J_s = 2\\,\\hat n\\times\\mathbf H(0^+)$ with $\\hat n = \\hat x$; $\\mathbf E = -\\tfrac{\\eta_0}{2}\\mathbf J_s(t - |x|/c)$ on both sides.'],
      sol: sol({
        eq: md`$\mathbf H(x, t) = H_y(0^+, t - |x|/c)\,(\pm\hat y)$ for $x \gtrless 0$; $\;\mathbf J_s = 2\hat x\times\mathbf H(0^+) = 2H_y(0^+)\,\hat z$; $\;\mathbf E = -\tfrac{\eta_0}{2}\mathbf J_s(t - |x|/c)$.`,
        sym: md`At $t = ${T0}$ µs, the point $x$ left at $t' = ${T0} - x/c$. So $x = ${L0}$ m (value $${H0}$ A/m) left at $t' = ${T0} - ${L0}/300$, and $x = 0$ (value 0) at $${T0}$ µs: $H_y(0^+, t')$ jumps to $${H0}$ A/m, then ramps linearly to 0.`,
        sub: md`$t_{\text{on}} = ${T0} - ${p(+lc.toPrecision(4))} = ${p(+ton.toPrecision(4))}$ µs, $t_{\text{off}} = ${T0}$ µs, $|J_s|_{\max} = 2(${Math.abs(H0)}) = ${2 * Math.abs(H0)}$ A/m along $${H0 > 0 ? '+' : '-'}\hat z$. At $x = ${x2}$ m: $\tau = ${p(+T2.toPrecision(4))} - ${Math.abs(x2)}/300 = ${p(+tau.toPrecision(4))}$ µs. What left the sheet then is the snapshot point $x = c(${T0}\ \mu\text{s} - \tau) = ${p(+(300 * (T0 - tau)).toPrecision(4))}$ m, so $H_y(0^+, \tau) = ${H0}\,(${p(+(300 * (T0 - tau)).toPrecision(4))}/${L0}) = ${f(Fv)}$ A/m and
$$E_z = -\eta_0H_y(0^+, \tau) = -(377)(${f(Fv)}) = ${f(Ez)}\ \text{V/m}$$`,
        ans: md`$t_{\text{on}} = ${p(+ton.toPrecision(4))}$ µs, $t_{\text{off}} = ${T0}$ µs, $|\mathbf J_s|_{\max} = ${2 * Math.abs(H0)}$ A/m along $${H0 > 0 ? '+' : '-'}\hat z$; $E_z = ${f(Ez)}$ V/m.`,
        check: md`On $x > 0$: $\mathbf E\times\mathbf H \propto (-H_y\hat z)\times(H_y\hat y) = H_y^2\,\hat x$, away from the sheet ✓. $E_z$ has the same sign on both sides (even); ${x2 < 0 ? 'the point is on the left, but that does not change $E_z$' : 'it would be the same at $x = ' + (-x2) + '$ m'}.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t15-sheet-waves'] = [
    Q(md`Why can the fields of an infinite uniform current sheet depend only on the distance from the sheet and on $t$?`,
      ['Every point of a plane parallel to the sheet sees the same sheet', 'Maxwell\'s equations forbid dependence on more than one coordinate', 'The current flows only along one axis', 'The fields are static'], 0,
      [null, 'Maxwell\'s equations allow any dependence; the symmetry of the source is what restricts it here.', 'The current direction sets the field directions, not which coordinates they depend on.', 'They change in time; only the dependence on $x$ and $y$ is removed.'],
      md`Slide the sheet sideways and nothing changes, so nothing can depend on the in-plane coordinates. That is what "uniform" means in "uniform plane wave".`),
    Q(md`On the side $z > 0$ of a sheet on $z = 0$, why is there no wave $g(t + z/v_p)$ moving toward the sheet?`,
      ['Nothing out there emits one: the sheet is the only source', 'The wave equation does not allow it', 'It is reflected by the sheet', 'It cancels the forward wave'], 0,
      [null, 'The wave equation allows both directions; the boundary condition at infinity (no incoming wave) removes it.', 'There is no incoming wave to reflect; the medium is unbounded.', 'Both would then be absent; the forward wave is what the sheet makes.'],
      md`Waves come from sources. With empty space on each side, only waves moving away from the sheet appear.`),
    Q(md`Which boundary condition makes $E_x$ the same just above and just below the sheet?`,
      ['Tangential $\\mathbf E$ is continuous', 'Normal $\\mathbf D$ jumps by $\\rho_s$', 'Tangential $\\mathbf H$ jumps by $\\mathbf J_s$', 'Normal $\\mathbf B$ is continuous'], 0,
      [null, '$E_x$ is tangential to the sheet, and the sheet carries no charge.', 'That fixes the jump in $H_y$, not $E_x$.', '$E_x$ is tangential; the normal $\\mathbf B$ condition is about $B_z$, which is zero.'],
      md`Faraday's law around a thin loop straddling the sheet: with no magnetic surface current, tangential $\mathbf E$ cannot jump.`),
    Q(md`For the course's sheet, which equation gives $H_y(0^+) - H_y(0^-) = J_s(t)$?`,
      ['$\\hat z\\times(\\mathbf H^+ - \\mathbf H^-) = \\mathbf J_s$ with $\\mathbf J_s = -J_s\\hat x$', '$\\hat z\\cdot(\\mathbf H^+ - \\mathbf H^-) = J_s$', '$\\nabla\\cdot\\mathbf H = 0$', '$\\mathbf E^+ - \\mathbf E^- = \\eta\\mathbf J_s$'], 0,
      [null, 'That is the normal component, which is continuous in vacuum.', 'That constrains the normal component, not the jump in the tangential one.', 'Tangential $\\mathbf E$ does not jump at all.'],
      md`$\hat z\times\hat y = -\hat x$, so $-\big[H_y^+ - H_y^-\big]\hat x = -J_s\hat x$.`),
    Q(md`A forward wave $E_x = f(t - z/v_p)$ in a medium with impedance $\eta$ has $H_y = $…`,
      ['$f(t - z/v_p)/\\eta$', '$-f(t - z/v_p)/\\eta$', '$\\eta f(t - z/v_p)$', '$f(t - z/v_p)/(\\eta v_p)$'], 0,
      [null, 'That is the backward-wave pairing.', 'Divide by $\\eta$.', '$\\mu v_p = \\eta$ already absorbs the speed.'],
      md`$\partial_zE_x = -\mu\partial_tH_y$ with $\partial_z = -\tfrac1{v_p}\partial_t$ gives $H_y = E_x/(\mu v_p) = E_x/\eta$.`),
    Q(md`$\mu v_p$ equals…`,
      ['$\\eta$', '$1/\\eta$', '$c$', '$\\mu\\epsilon$'], 0,
      [null, '$\\mu/\\sqrt{\\mu\\epsilon} = \\sqrt{\\mu/\\epsilon}$, not its inverse.', '$\\mu v_p$ has units of ohms: it is an impedance, not a speed.', 'That is $1/v_p^2$.'],
      md`$\mu\cdot\dfrac{1}{\sqrt{\mu\epsilon}} = \sqrt{\dfrac\mu\epsilon} = \eta$. Likewise $\epsilon v_p = 1/\eta$.`),
    Q(md`Power flows out of the sheet into both waves. Which fact about directions says so?`,
      ['$\\mathbf E$ points against $\\mathbf J_s$, so $\\mathbf J_s\\cdot\\mathbf E < 0$ at the sheet', '$\\mathbf H$ is perpendicular to $\\mathbf J_s$', '$\\mathbf E$ is parallel to the sheet', '$\\mathbf H$ is odd about the sheet'], 0,
      [null, 'True, but $\\mathbf H$ does no work on the current.', 'True, but direction relative to the current is what decides the sign of the work.', 'True, but it does not say whether energy goes in or out.'],
      md`$\mathbf J\cdot\mathbf E < 0$ means the charges do work on the field: a source. Topic 17 counts it: $-\mathbf J_s\cdot\mathbf E = \tfrac\eta2J_s^2$ W/m².`),
    Q(md`A sheet in a dielectric with $\epsilon_r = 9$ ($\mu_r = 1$) carries $|\mathbf J_s| = 3$ A/m. $|\mathbf E|$ is…`,
      ['$60\\pi \\approx 188$ V/m', '$180\\pi \\approx 565$ V/m', '$20\\pi \\approx 63$ V/m', '1.5 V/m'], 0,
      [null, 'That uses $\\eta_0$. Here $\\eta = 120\\pi/3 = 40\\pi$.', 'That divides by $\\epsilon_r$ instead of $\\sqrt{\\epsilon_r}$.', 'That is $|H| = 1.5$ A/m.'],
      md`$\eta = 120\pi/\sqrt9 = 40\pi\ \Omega$, $|E| = \tfrac\eta2|J_s| = 20\pi\times3 = 60\pi$ V/m.`),
    Q(md`At the sheet itself ($z = 0$), which field is well defined?`,
      ['$E_x(0, t) = \\tfrac\\eta2J_s(t)$', '$H_y(0, t) = \\tfrac12J_s(t)$', 'Both, and both are zero', 'Neither'], 0,
      [null, '$H_y$ jumps from $-\\tfrac12J_s$ to $+\\tfrac12J_s$ across the sheet; it has no single value there.', '$E_x$ at the sheet is what both waves start from; it is not zero while current flows.', 'Tangential $\\mathbf E$ is continuous, so it has one value at the sheet.'],
      md`Continuous $E_x$ has a value at $z = 0$; $H_y$ is discontinuous there by exactly $J_s$.`),
    Q(md`A current pulse lasts 10 ns. On each side of the sheet (free space), the wave it makes is…`,
      ['3 m long', '1.5 m long', '6 m long', '3 km long'], 0,
      [null, 'Each wave moves at the full $c$.', 'That counts both waves together.', 'Units: $c = 0.3$ m/ns.'],
      md`$\ell = c\,\Delta t = (0.3\ \text{m/ns})(10\ \text{ns}) = 3$ m.`),
    Q(md`$J_s(t)$ switches on at $t = 2$ µs. At $t = 5$ µs, in free space, the fields are nonzero for…`,
      ['$|z| < 900$ m', '$|z| < 1500$ m', '$600 < |z| < 1500$ m', '$z > 0$ only, out to 900 m'], 0,
      [null, 'That starts the clock at $t = 0$; the current switched on at 2 µs.', 'The current is still on, so the region near the sheet is filled too.', 'The sheet radiates to both sides.'],
      md`Front: $c\,(5 - 2)\ \mu\text{s} = 900$ m on each side; everything inside is filled because the current stays on.`),
    Q(md`Two identical sheets lie on top of each other on $z = 0$ with opposite currents $\pm\mathbf J_s(t)$. What waves leave?`,
      ['None: the fields cancel everywhere', 'Two waves of double strength', 'Waves only toward $+z$', 'Standing waves'], 0,
      [null, 'The fields of opposite currents subtract, by superposition.', 'Each sheet radiates both ways; their fields cancel on both sides.', 'With no net current, nothing drives a wave.'],
      md`Superposition: the net sheet current is zero, so is everything it makes.`),
    Q(md`A sheet's current is a single rectangular pulse. At a point 600 m away (free space), $H$ versus time is…`,
      ['the same rectangular pulse, delayed by 2 µs, with height $\\tfrac12J_s$', 'the pulse reversed in time', 'a pulse that is smeared out by the travel', 'zero, because a pulse has no DC part'], 0,
      [null, 'Reversal happens in a snapshot (versus position), not in a time plot at a fixed place.', 'A lossless uniform plane wave travels without changing shape.', 'Any waveform travels; nothing filters out the DC part.'],
      md`$H = \tfrac12J_s(t - 600/300\ \mu\text{s})$: same shape, delayed 2 µs.`),
    Q(md`On the side $z < 0$ of the course's sheet, the retarded time is…`,
      ['$t + z/v_p$', '$t - z/v_p$', '$t + |z|/v_p$', '$t$: the field there is instantaneous'], 0,
      [null, 'On $z < 0$, $-z/v_p > 0$, so $t - z/v_p$ is later than $t$: a time in the future.', 'The retarded time is earlier than $t$: $t - |z|/v_p$.', 'Nothing travels faster than $v_p$.'],
      md`$t - |z|/v_p = t + z/v_p$ for $z < 0$: the formula sheet's $J_s(t \mp z/v_p)$ with the lower sign.`),
    Q(md`A sheet's current is a sinusoid. Which statement is right about $\mathbf E$ and $\mathbf H$ at a point near it?`,
      ['They rise and fall together: same waveform, ratio $\\eta$', '$\\mathbf H$ lags $\\mathbf E$ by 90°', '$\\mathbf E$ is largest where $\\mathbf H$ is zero', 'Their ratio depends on the distance'], 0,
      [null, 'That happens in a standing wave or near a small antenna, not in a single traveling plane wave.', 'In a traveling plane wave they peak together.', '$|E|/|H| = \\eta$ everywhere.'],
      md`$E_x = \pm\eta H_y$ at every point and instant of a single traveling plane wave.`),
    Q(md`A sheet on $x = 0$ carries $\mathbf J_s = -J_s(t)\hat y$. On $x > 0$ the wave's $\mathbf E$ and $\mathbf H$ are along…`,
      ['$\\mathbf E$ along $+\\hat y$, $\\mathbf H$ along $+\\hat z$', '$\\mathbf E$ along $-\\hat y$, $\\mathbf H$ along $-\\hat z$', '$\\mathbf E$ along $+\\hat y$, $\\mathbf H$ along $-\\hat z$', '$\\mathbf E$ along $+\\hat z$, $\\mathbf H$ along $+\\hat y$'], 0,
      [null, '$\\mathbf E$ points against the current.', '$\\hat y\\times(-\\hat z) = -\\hat x$: that wave would travel toward the sheet.', '$\\mathbf E$ is parallel to the current line ($\\hat y$), not perpendicular.'],
      md`$\mathbf E = -\tfrac\eta2\mathbf J_s = +\tfrac\eta2J_s\hat y$; $\mathbf H = \tfrac12(-J_s\hat y)\times\hat x = +\tfrac12J_s\hat z$; $\hat y\times\hat z = \hat x$ ✓.`),
    Q(md`A snapshot at $t = 3$ µs shows $H_y$ on $x > 0$ (sheet at $x = 0$, free space) nonzero only for $600 < x < 750$ m. The sheet current was on during…`,
      ['$0.5 < t < 1$ µs', '$2 < t < 2.5$ µs', '$0 < t < 0.5$ µs', '$1 < t < 1.5$ µs'], 0,
      [null, 'That reads $x/c$ as the emission time; the emission time is $t - x/c$.', 'The far edge (750 m) left at $3 - 2.5 = 0.5$ µs, the near edge (600 m) at 1 µs.', 'Recheck: $600/300 = 2$ µs of travel for the near edge.'],
      md`$t' = 3 - x/300$ µs: $x = 750$ m ↔ 0.5 µs, $x = 600$ m ↔ 1 µs.`),
    Q(md`Spring 2018 #5's sheet lies in the plane $y = 0$ with $\mathbf J = -J_s(t)\hat x$. Its forward wave's $\mathbf H$ is…`,
      ['$-\\tfrac12J_s(t - y/v_p)\\,\\hat z$', '$+\\tfrac12J_s(t - y/v_p)\\,\\hat y$', '$+\\tfrac12J_s(t - y/v_p)\\,\\hat z$', '$-\\tfrac{\\eta}{2}J_s(t - y/v_p)\\,\\hat z$'], 0,
      [null, 'That copies the $z = 0$ sheet. With the sheet in $y = 0$ the wave travels along $\\hat y$, so $\\mathbf H$ cannot be along $\\hat y$.', 'Sign: $(-\\hat x)\\times\\hat y = -\\hat z$.', 'The factor $\\eta$ belongs to $\\mathbf E$, not $\\mathbf H$.'],
      md`$\tfrac12(-J_s\hat x)\times\hat y = -\tfrac12J_s\hat z$; check $\mathbf E = +\tfrac\eta2J_s\hat x$ and $\hat x\times(-\hat z) = +\hat y$ ✓.`),
  ];
})();

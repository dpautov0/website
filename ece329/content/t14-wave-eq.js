/* Topic 14 — The wave equation and traveling waveforms (Lecture 18, first half of Lecture 19). From the two curl
   equations to ∂²E/∂z² = με ∂²E/∂t², d'Alembert's solution f(t − z/v_p) + g(t + z/v_p), which way each part moves,
   the H that goes with each part, moving snapshots and recordings in space and time (Spring 2018 #4, Lecture 19's
   "transforming time and space"), and checking candidate solutions (HW 7 #5).
   Sheet-launched waves are Topic 15; sinusoids, λ and β are Topic 16. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick, ri } = U;
  const ETA0 = EM.eta0;

  const fixedQ = (...a) => { const q = Q(...a); q.parts[0].fixed = true; return q; };

  // unit vectors as [axis index, sign]
  const AX = ['x', 'y', 'z'];
  const cross = (a, b) => [3 - a[0] - b[0], a[1] * b[1] * ((b[0] - a[0] + 3) % 3 === 1 ? 1 : -1)];
  const vec = (v) => `${v[1] < 0 ? '-' : '+'}\\hat ${AX[v[0]]}`;
  // "x - 300" / "x + 200" / "x"
  const shift = (u, c) => (c === 0 ? u : `${u} ${c > 0 ? '-' : '+'} ${Math.abs(c)}`);
  const r2 = (x) => +x.toFixed(2);

  // ---------------------------------------------------------------- plots
  // a function plot like PF.plot, plus arrows and labels in data coordinates:
  // { x:[a,b], y:[c,d], xt:[[v,'tex']], yt, xl, yl, curves:[{pts, cls}], arrows:[[x1,y1,x2,y2,'tex']], labels:[[x,y,'tex',anchor]] }
  function wplot(o) {
    const W = o.w || 330, H = o.h || 175, ml = 42, mr = 30, mt = 16, mb = 30;
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const X = (x) => ml + (x - x0) / (x1 - x0) * (W - ml - mr);
    const Y = (y) => H - mb - (y - y0) / (y1 - y0) * (H - mt - mb);
    const g = PF.fig({ pad: 4, alt: o.alt });
    for (const [v, s] of o.xt || []) { g.line(X(v), Y(y0), X(v), Y(y1), { cls: 'grid nodecl' }); g.label(X(v), Y(y0) + 5, s, 't', 'small accent'); }
    for (const [v, s] of o.yt || []) { g.line(X(x0), Y(v), X(x1), Y(v), { cls: 'grid nodecl' }); g.label(X(x0) - 6, Y(v), s, 'r', 'small accent'); }
    const ya = y0 < 0 && y1 > 0 ? 0 : y0;
    g.line(X(x0), Y(ya), X(x1), Y(ya), { cls: 'axisl', arrow: 'end', hs: 6 });
    g.line(X(x0), Y(y0), X(x0), Y(y1), { cls: 'axisl', arrow: 'end', hs: 6 });
    for (const c of o.curves || []) g.pl(c.pts.map(([x, y]) => [X(x), Y(y)]), { cls: 'curve ' + (c.cls || '') });
    for (const [ax0, ay0, ax1, ay1, t] of o.arrows || []) {
      g.arrow(X(ax0), Y(ay0), X(ax1), Y(ay1), { hs: 7 });
      if (t) g.label((X(ax0) + X(ax1)) / 2, Y(ay0) - 4, t, 'b', 'small');
    }
    for (const [lx, ly, t, an] of o.labels || []) g.label(X(lx), Y(ly), t, an || 'c', 'small');
    if (o.xl) g.label(X(x1) + 10, Y(ya), o.xl, 'l', 'small');
    if (o.yl) g.label(X(x0) + 6, Y(y1) - 2, o.yl, 'bl', 'small');
    g.track(0, 0, W, H);
    return g.svg().replace('class="schem pfig', 'class="schem pfig pplot');
  }
  const ticks = (a, b, d, fmt = (v) => String(v)) => { const t = []; for (let v = Math.ceil(a / d) * d; v <= b + 1e-9; v += d) t.push([v, fmt(v)]); return t; };
  const niceStep = (span) => [50, 100, 200, 250, 300, 500, 1000].find((d) => span / d <= 7) || 2000;

  // Lecture 19's example: toward +z at 100 m/s; the profile at t = 0 has corners (−100, 0), (0, 1), (100, −1), (300, 0)
  const L19 = (z) => (z <= -100 || z >= 300 ? 0 : z <= 0 ? (z + 100) / 100 : z <= 100 ? 1 - 2 * z / 100 : -1 + (z - 100) / 200);
  function moveFig() {
    return wplot({
      alt: 'a wave profile E(z,0) with corners at z = −100, 0, 100 and 300 m, and the same profile 100 m farther along +z at t = 1 s',
      x: [-200, 500], y: [-1.3, 1.55], xt: ticks(-100, 400, 100), yt: [[1, '1'], [-1, '-1']], xl: 'z\\,(\\text{m})', yl: 'E_x\\,(\\text{V/m})',
      curves: [{ pts: [[-200, 0], [-100, 0], [0, 1], [100, -1], [300, 0], [500, 0]] }, { pts: [[-200, 0], [0, 0], [100, 1], [200, -1], [400, 0], [500, 0]], cls: 'dash' }],
      arrows: [[0, 1.25, 100, 1.25, '100\\ \\text{m}']],
      labels: [[-75, 0.62, 't = 0', 'r'], [405, 0.35, 't = 1\\ \\text{s}', 'l']],
    });
  }
  // the same wave recorded at z = 0: E(0,t) = E(−100t, 0)
  function flipFig() {
    return wplot({
      alt: 'the same wave recorded at z = 0 versus time: zero before t = −3 s, down to −1 at t = −1 s, up to 1 at t = 0, back to zero at t = 1 s',
      x: [-4.5, 2.5], y: [-1.3, 1.4], xt: ticks(-4, 2, 1), yt: [[1, '1'], [-1, '-1']], xl: 't\\,(\\text{s})', yl: 'E_x(0,t)',
      curves: [{ pts: [[-4.5, 0], [-3, 0], [-1, -1], [0, 1], [1, 0], [2.5, 0]] }],
    });
  }
  // Lecture 18's moving-waveform example: a recording at z = 0 (trapezoid), toward −z at 100 m/s
  const trap = (t) => (t <= 0 || t >= 4 ? 0 : t <= 1 ? t : t <= 2 ? 1 : 1 - (t - 2) / 2);
  function trapFig() {
    return wplot({
      alt: 'a recording E(0,t): rises linearly from 0 at t = 0 to 1 V/m at t = 1 s, stays at 1 until t = 2 s, falls linearly to 0 at t = 4 s',
      x: [-0.6, 5.6], y: [0, 1.35], xt: ticks(0, 5, 1), yt: [[1, '1']], xl: 't\\,(\\text{s})', yl: 'E(0,t)\\,(\\text{V/m})',
      curves: [{ pts: [[-0.6, 0], [0, 0], [1, 1], [2, 1], [4, 0], [5.6, 0]] }],
    });
  }
  // an exponential step profile: A u[x − x0] e^{−(x − x0)/L}
  const expPts = (x0, A, L, a, b) => { const pts = [[a, 0], [x0, 0], [x0, A]]; for (let i = 1; i <= 60; i++) { const x = x0 + (b - x0) * i / 60; pts.push([x, A * Math.exp(-(x - x0) / L)]); } return pts; };
  function sp18Fig() {
    return wplot({
      alt: 'the profile 3 V/m at x = 100 m decaying to the right at t = 1 μs (solid), and the same profile with its step at x = 400 m at t = 0 (dashed); an arrow shows motion toward −x',
      x: [-150, 650], y: [0, 3.9], xt: ticks(-100, 600, 100), yt: [[1, '1'], [2, '2'], [3, '3']], xl: 'x\\,(\\text{m})', yl: 'E_z\\,(\\text{V/m})',
      curves: [{ pts: expPts(100, 3, 50, -150, 650) }, { pts: expPts(400, 3, 50, -150, 650), cls: 'dash' }],
      arrows: [[390, 3.45, 110, 3.45, '300\\ \\text{m in}\\ 1\\ \\mu\\text{s}']],
      labels: [[160, 1.6, 't = 1\\ \\mu\\text{s}', 'l'], [460, 1.6, 't = 0', 'l']],
    });
  }

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u5', {
    id: 't14-wave-eq', topic: 14, ref: 'Lecture 18', title: 'The wave equation and traveling waveforms',
    steps: [
      R(md`
        !!key Why you care
          Spring 2018 #4 (14 points) gives a field profile at $t = 1\ \mu$s and its velocity, and asks for the field at $t = 0$, at every $t$, and whether the medium is lossy. HW 7 #5 asks which functions solve the wave equation, and on what condition. HW 7 #6 turns a recording at $x = 0$ into $\mathbf E(x,t)$ and $\mathbf H(x,t)$, then plots versus $t$ and versus $x$. Spring 2018 #5(c) sketches $\mathbf H$ versus position at a fixed time. Lecture 18's challenge reads velocities off arguments.

        ### Notation

        - $E_x(z,t)$: the $x$-component of $\mathbf E$, V/m, depending only on $z$ and $t$: the same over every plane $z = $ const. That is a **uniform plane wave**.
        - $H_y(z,t)$: the $y$-component of $\mathbf H$, A/m.
        - $\mu = \mu_r\mu_0$ (H/m), $\epsilon = \epsilon_r\epsilon_0$ (F/m): permeability and permittivity of the medium.
        - $v_p = 1/\sqrt{\mu\epsilon}$: propagation speed, m/s. Free space: $c = 3\times10^8$ m/s $= 300$ m/μs. In a medium $v_p = c/\sqrt{\mu_r\epsilon_r}$.
        - $\eta = \sqrt{\mu/\epsilon}$: intrinsic impedance, Ω. Free space: $\eta_0 = 120\pi \approx 377\ \Omega$.
        - $f(\cdot)$, $g(\cdot)$: any functions of one variable, the **waveforms**. $f'$, $f''$: their first and second derivatives with respect to their argument.
        - Snapshot: the field versus position at one time. Recording: the field versus time at one position.
        - $u[\cdot]$: the unit step, 0 for a negative argument and 1 for a positive one.
        - $\omega$ (rad/s), $\beta$ (rad/m): angular frequency and phase constant of a sinusoid $\cos(\omega t - \beta z)$ ([Topic 16](#/l/t16-sinusoids)). $\nabla^2 = \partial^2_x + \partial^2_y + \partial^2_z$.

        ### The idea

        Where there is no charge or current, the two curl equations feed each other: $\mathbf E$ changing in time makes $\mathbf H$ vary in space, and $\mathbf H$ changing in time makes $\mathbf E$ vary in space. Eliminating $\mathbf H$ leaves the **wave equation**. Its solutions are shapes that slide without changing, at speed $v_p$:
        $$\frac{\partial^2E_x}{\partial z^2} = \mu\epsilon\,\frac{\partial^2E_x}{\partial t^2} \quad\Longrightarrow\quad E_x(z,t) = f\!\left(t - \frac{z}{v_p}\right) + g\!\left(t + \frac{z}{v_p}\right)$$
      `),
      R(md`
        ### Step 1: from Maxwell to the wave equation

        Take $\mathbf E = E_x(z,t)\,\hat x$ and $\mathbf H = H_y(z,t)\,\hat y$ (a current sheet launches exactly these, [Topic 15](#/l/t15-sheet-waves)), with $\mathbf J = 0$ and $\rho = 0$. Since $\nabla\times(F(z,t)\,\hat a) = \partial_zF\,(\hat z\times\hat a)$ ([Topic 12](#/l/t12-displacement)), each curl equation keeps one component:
        $$\nabla\times\mathbf E = -\mu\frac{\partial\mathbf H}{\partial t}:\qquad \frac{\partial E_x}{\partial z} = -\mu\frac{\partial H_y}{\partial t} \qquad (1)$$
        $$\nabla\times\mathbf H = \epsilon\frac{\partial\mathbf E}{\partial t}:\qquad \frac{\partial H_y}{\partial z} = -\epsilon\frac{\partial E_x}{\partial t} \qquad (2)$$
        Differentiate (1) in $z$, swap the order of the derivatives, and use (2):
        $$\frac{\partial^2E_x}{\partial z^2} = -\mu\frac{\partial}{\partial t}\frac{\partial H_y}{\partial z} = \mu\epsilon\frac{\partial^2E_x}{\partial t^2}$$
        $H_y$ obeys the same equation. $\mu\epsilon$ has units s²/m², so $1/\sqrt{\mu\epsilon}$ is a speed: $v_p$.
      `),
      Q(md`**Predict.** Glass has $\epsilon = 2.25\epsilon_0$ and $\mu = \mu_0$. A wave in it travels at…`,
        ['$2\\times10^8$ m/s', '$1.33\\times10^8$ m/s', '$4.5\\times10^8$ m/s', '$3\\times10^8$ m/s'], 0,
        [null, 'That divides $c$ by $\\epsilon_r$; the speed goes as $1/\\sqrt{\\epsilon_r}$.', 'That multiplies by $\\sqrt{\\epsilon_r}$: a denser medium is slower, not faster.', 'Only vacuum has $v_p = c$; here $\\mu\\epsilon$ is 2.25 times larger.'],
        md`$v_p = c/\sqrt{\epsilon_r} = 3\times10^8/1.5 = 2\times10^8$ m/s.`),
      R(md`
        ### Step 2: d'Alembert's solution

        Any function of $t - z/v_p$ solves it. With $\xi = t - z/v_p$: $\partial_tf(\xi) = f'$ and $\partial_zf(\xi) = -f'/v_p$, so
        $$\frac{\partial^2f}{\partial z^2} = \frac{f''}{v_p^2} = \mu\epsilon\,f'' = \mu\epsilon\,\frac{\partial^2f}{\partial t^2}\ \ \checkmark$$
        The same holds for $g(t + z/v_p)$. Nothing else solves it: in the variables $\xi = t - z/v_p$ and $\zeta = t + z/v_p$ the wave equation becomes $\partial^2E_x/\partial\xi\,\partial\zeta = 0$, so $E_x$ is a function of $\xi$ plus a function of $\zeta$:
        $$E_x(z,t) = f\!\left(t - \frac{z}{v_p}\right) + g\!\left(t + \frac{z}{v_p}\right)$$
        The shapes are anything: pulses, steps, sinusoids. Maxwell's equations fix only the speed. (Lecture 18 does the same change of variables as a factorization, $(\partial_\tau + \partial_t)(\partial_\tau - \partial_t)E_x = 0$ with $\tau = z/v_p$.)
      `),
      Q(md`**Predict.** Which of these solves the wave equation with speed $v$, $\partial^2E/\partial z^2 = (1/v^2)\,\partial^2E/\partial t^2$?`,
        ['$e^{-(z + vt)^2}$', '$e^{-(z^2 + v^2t^2)}$', '$z^2 - v^2t^2$', '$e^{-z}\\cos(vt)$'], 0,
        [null, 'It cannot be written as a function of $z - vt$ plus a function of $z + vt$; substituting leaves extra terms.', '$\\partial^2/\\partial z^2$ gives $2$, but $(1/v^2)\\partial^2/\\partial t^2$ gives $-2$.', '$\\partial^2/\\partial z^2$ gives $+E$, $(1/v^2)\\partial^2/\\partial t^2$ gives $-E$: the signs disagree.'],
        md`$e^{-(z + vt)^2} = g(t + z/v)$ with $g(s) = e^{-v^2s^2}$: a backward wave. Any function of $z \pm vt$ works; the others are not of that form.`),
      RF(md`
        ### Step 3: which way, how fast

        Follow one point of the shape: the place where the argument has a fixed value. For $f(t - z/v_p)$, $t - z/v_p = $ const means $z = v_pt + $ const: the shape moves toward $+z$ at $v_p$. For $g(t + z/v_p)$, $z = -v_pt + $ const: toward $-z$.

        [[fig:move]]

        !!key Reading an argument
          Write the argument as $at + bz$. The shape moves along $z$ with velocity $-a/b$. Opposite signs on the $t$ and $z$ terms: toward $+z$.

        All of these move toward $+z$ at $v_p$: $f(t - z/v_p)$, $F(z - v_pt)$, $\cos(\omega t - \beta z)$ with $v_p = \omega/\beta$. Two more: $u[t - 0.01x]$ moves at $+100\,\hat x$ m/s ($a = 1$, $b = -0.01$); $(2y + t)^2$ at $-0.5\,\hat y$ m/s.
      `, { move: { svg: moveFig(), cap: 'Lecture 19\'s wave, moving toward +z at 100 m/s: the snapshot at t = 0 (solid) slides 100 m in 1 s (dashed) without changing shape.' } }),
      Q(md`**Predict.** $E_y = 5\,e^{-(t + x/200)^2}$ V/m, with $t$ in seconds and $x$ in meters. The pulse moves…`,
        ['toward $-x$ at 200 m/s', 'toward $+x$ at 200 m/s', 'toward $-x$ at $1/200$ m/s', 'nowhere: it is a pulse in time'], 0,
        [null, 'A plus sign between the $t$ and $x$ terms means travel toward $-x$: $x = -200t + $ const.', 'The speed is the ratio of the $t$ coefficient to the $x$ coefficient: $1/(1/200) = 200$ m/s.', 'It is a pulse in time at each $x$, and its peak $t = -x/200$ shifts with $x$: it moves.'],
        md`Argument $at + bx$ with $a = 1$, $b = 1/200$: velocity $-a/b = -200$ m/s. The peak sits at $x = -200t$.`),
      R(md`
        ### Step 4: the H that goes with each part

        Equation (2) fixes $H_y$ once $E_x$ is known. Try $H_y = f(t - z/v_p)/\eta$: then $\partial_zH_y = -f'/(\eta v_p)$, and (2) needs $-\epsilon f'$, so $\eta = 1/(\epsilon v_p) = \sqrt{\mu/\epsilon}$. For the backward part the sign flips:
        $$E_x = f\!\left(t - \frac{z}{v_p}\right) + g\!\left(t + \frac{z}{v_p}\right), \qquad H_y = \frac1\eta\left[f\!\left(t - \frac{z}{v_p}\right) - g\!\left(t + \frac{z}{v_p}\right)\right]$$

        - Each traveling part has $|\mathbf E|/|\mathbf H| = \eta$. Their sum does not.
        - $\mathbf E\times\mathbf H$ points along the travel. Forward: $\hat x\times\hat y = +\hat z$. Backward: $E_x > 0$ comes with $H_y < 0$, and $\hat x\times(-\hat y) = -\hat z$.
        - Free space: 377 V/m goes with 1 A/m.
      `),
      Q(md`**Predict.** In free space, $\mathbf E = 377\,u[t + z/c]\,\hat x$ V/m. Then $\mathbf H = $`,
        ['$-u[t + z/c]\\,\\hat y$ A/m', '$+u[t + z/c]\\,\\hat y$ A/m', '$-377^2\\,u[t + z/c]\\,\\hat y$ A/m', '$-u[t + z/c]\\,\\hat z$ A/m'], 0,
        [null, 'That is the forward-wave sign. This wave moves toward $-z$, so $\\mathbf E\\times\\mathbf H$ must point along $-\\hat z$.', '$|\\mathbf H| = |\\mathbf E|/\\eta_0$, not $\\eta_0|\\mathbf E|$.', '$\\mathbf H$ is transverse: no component along the travel axis $z$.'],
        md`Backward wave: $H_y = -E_x/\eta_0 = -u[t + z/c]$ A/m. Check: $\hat x\times(-\hat y) = -\hat z$, the travel direction. ✓`),
      RF(md`
        ### Step 5: snapshots and recordings

        One snapshot, or one recording, fixes a traveling wave everywhere:
        $$\text{toward } +z:\quad E(z,t) = E\!\left(0,\ t - \frac{z}{v_p}\right) = E(z - v_pt,\ 0)$$
        $$\text{toward } -z:\quad E(z,t) = E\!\left(0,\ t + \frac{z}{v_p}\right) = E(z + v_pt,\ 0)$$

        - **Snapshot to snapshot:** slide the profile by $v_p\,\Delta t$ in the travel direction.
        - **Recording to recording:** a probe $\Delta z$ downstream sees the same signal $\Delta z/v_p$ later.
        - **Snapshot to recording:** for a forward wave $E(z, t_0) = E(0,\ t_0 - z/v_p)$: large $z$ goes with early $t$. The front of the snapshot is what the probe saw first, so the snapshot is the recording **reversed**, with 1 s of time becoming $v_p\times1$ s of space.

        [[fig:flip]]
      `, { flip: { svg: flipFig(), cap: 'The same wave recorded at z = 0. Its front (z = 300 m at t = 0) passed the probe first, at t = −3 s: the recording is the snapshot read right to left, with 100 m becoming 1 s.' } }),
      Q(md`**Predict.** For the wave above (toward $+z$ at 100 m/s, snapshot $E(z,0)$ in the first figure), a probe at $z = 200$ m reads, at $t = 1$ s…`,
        ['$-1$ V/m', '$0$', '$-0.5$ V/m', '$+1$ V/m'], 0,
        [null, 'That reads the snapshot at $z = 300$ m: the shift went the wrong way.', 'That is $E(200, 0)$: the wave has moved 100 m since then.', 'That is $E(0, 0)$: in 1 s the wave moves 100 m, not 200 m.'],
        md`$E(200, 1) = E(200 - 100\cdot1,\ 0) = E(100, 0) = -1$ V/m: the trough that sat at $z = 100$ m at $t = 0$ has arrived. (Lecture 19.)`),
      R(md`
        ### Step 6: is it a solution?

        A candidate solves the 1-D wave equation exactly when it can be written as $f(t - z/v_p) + g(t + z/v_p)$ with the medium's $v_p$. Otherwise substitute it. HW 7 #5(b)–(d), then one that fails:

        - $\cos^2(\omega t - \beta x)$: a function of $\omega t - \beta x$ alone (it is $\tfrac12 + \tfrac12\cos(2\omega t - 2\beta x)$). A solution if $\omega/\beta = v_p$, i.e. $\beta = \omega\sqrt{\mu\epsilon}$. It travels toward $+x$.
        - $\cos\omega t\,\cos\beta x = \tfrac12\cos(\omega t - \beta x) + \tfrac12\cos(\omega t + \beta x)$: two equal waves moving opposite ways, a **standing wave**. A solution if $\beta = \omega\sqrt{\mu\epsilon}$. Nothing travels: the zeros at $\cos\beta x = 0$ stay put.
        - $\cos(\omega t - \beta_xx - \beta_yy)$: in $\nabla^2E = \mu\epsilon\,\partial^2E/\partial t^2$ it gives $-(\beta_x^2 + \beta_y^2)E = -\omega^2\mu\epsilon E$. A solution if $\beta_x^2 + \beta_y^2 = \omega^2\mu\epsilon$: a plane wave traveling along $(\beta_x, \beta_y)$, at $\tan^{-1}(\beta_y/\beta_x)$ from $\hat x$.
        - $e^{-\alpha z}\cos(\omega t - \beta z)$ with $\alpha > 0$: **not** a solution for any $\beta$; the $\sin$ terms leave $2\alpha\beta = 0$. A wave that shrinks as it travels needs a lossy medium, $\sigma \ne 0$.
      `),
      Q(md`**Predict.** In a medium where $\omega/\beta = v_p$, is $E_x = \cos(\omega t)\cos(\beta z)$ a solution of the wave equation?`,
        ['yes: it is the sum of two waves moving in opposite directions', 'no: nothing in it travels', 'no: it is not a function of $t - z/v_p$', 'only at the instants when $\\cos\\omega t = 0$'], 0,
        [null, 'A standing wave is still a solution: two traveling waves add up to a pattern that does not move.', 'The solution may be a sum $f(t - z/v_p) + g(t + z/v_p)$; it need not be one of them alone.', 'A solution must hold at all times, and this one does.'],
        md`$\cos\omega t\cos\beta z = \frac12\cos(\omega t - \beta z) + \frac12\cos(\omega t + \beta z)$, each a solution when $\omega/\beta = v_p$. (HW 7 #5(c).)`),
      RF(md`
        ### The method

        !!method Moving a waveform
          1. **Direction and speed:** from the argument ($-a/b$) or the stated velocity. In a medium, $v_p = c/\sqrt{\mu_r\epsilon_r}$.
          2. **The field everywhere** from the slice you are given. A snapshot at $t_0$: $E(z,t) = E\big(z \mp v_p(t - t_0),\ t_0\big)$. A recording at $z_0$: $E(z,t) = E\big(z_0,\ t \mp (z - z_0)/v_p\big)$. Upper signs: travel toward $+z$.
          3. **A new slice:** map the corner points. Each moves $v_p\Delta t$, or arrives $\Delta z/v_p$ later.
          4. **$\mathbf H$:** magnitude $|\mathbf E|/\eta$, direction such that $\mathbf E\times\mathbf H$ points along the travel.
          5. **Check:** one point of the shape moves the right way; a snapshot is the recording reversed.

        ### Worked example

        !!graded Problem
          (Spring 2018 #4, 14 points.) The electric field of a wave moves with $\mathbf v = -c\,\hat x = -300\,\hat x$ m/μs and at $t = 1\ \mu$s has the profile
          $$\mathbf E(x, 1\,\mu\text{s}) = 3\,u[x - 100]\,e^{-(x - 100)/50}\,\hat z\ \ \text{V/m}\qquad (x\ \text{in m})$$
          (a) (7 pts) Find $\mathbf E(x, 0)$ and sketch it. (b) (5 pts) Find $\mathbf E(x,t)$ for any $x$ and $t$. (c) (2 pts) True or false: the wave is propagating in a conductive medium.

        **1. Direction and speed.** Toward $-x$ at $v = 300$ m/μs.

        **2. (a) Back to $t = 0$.** One microsecond earlier the wave had 300 m still to travel toward $-x$: it sat 300 m farther toward $+x$. The step moves from $x = 100$ m back to $x = 400$ m:
        $$\mathbf E(x, 0) = 3\,u[x - 400]\,e^{-(x - 400)/50}\,\hat z\ \ \text{V/m}$$
        The same shape: 3 V/m at the step, falling by $1/e$ every 50 m to its right, zero to its left.

        [[fig:sp18]]

        **3. (b) Every $t$.** A wave toward $-x$: $\mathbf E(x,t) = \mathbf E\big(x + v(t - t_0),\ t_0\big)$. Replace $x$ by $x + 300(t - 1)$ in the given profile:
        $$\mathbf E(x,t) = 3\,u[x + 300t - 400]\,e^{-(x + 300t - 400)/50}\,\hat z\ \ \text{V/m}\qquad (x\ \text{in m},\ t\ \text{in}\ \mu\text{s})$$

        **4. Check.** $t = 1$ returns $x - 100$ ✓; $t = 0$ returns $x - 400$ ✓. The step sits where $x + 300t = 400$, i.e. $x = 400 - 300t$: velocity $-300$ m/μs ✓. A function of $x + vt$ alone solves the lossless wave equation.

        **5. (c) FALSE.** The wave moves at $c$, the speed in vacuum. The exponential is the shape in space, not a loss: the profile translates rigidly, and the step is 3 V/m at every $t$. In a conductive medium the field would shrink as it travels. (Not asked: $\mathbf H = \frac{3}{120\pi}\,u[\cdot]\,e^{-(\cdot)/50}\,\hat y$ A/m, since $\hat z\times\hat y = -\hat x$ is the travel direction; its peak is 7.96 mA/m.)

        !!mistake Common mistakes
          - Shifting the wrong way when going back in time. Earlier, a wave moving toward $-x$ was farther toward $+x$.
          - Reading the direction from the sign of one term. $f(t - z/v_p)$ and $F(z - v_pt)$ both move toward $+z$; use $-a/b$.
          - Copying the recording as the snapshot. For a forward wave the snapshot is the recording reversed: its front is what arrived first.
          - Mixing units: with $v$ in m/μs, keep $t$ in μs. $c = 300$ m/μs $= 0.3$ m/ns.
          - Dropping the minus sign in $H_y = -g/\eta$ for a backward wave, or using $|\mathbf E|/|\mathbf H| = \eta$ on a sum of two waves.
          - Calling a shape that decays in space "attenuation". Loss means the amplitude falls with distance traveled.
          - Using $c$ in a medium instead of $c/\sqrt{\mu_r\epsilon_r}$.

        ### Check questions
      `, { sp18: { svg: sp18Fig(), cap: 'Spring 2018 #4: the given profile at t = 1 μs (solid) and the answer at t = 0 (dashed), 300 m farther toward +x. The wave moves toward −x.' } }),
      Q(md`Spring 2018 #4(c): the profile $3\,u[x - 100]\,e^{-(x - 100)/50}\,\hat z$ V/m at $t = 1\ \mu$s moves at $-300\,\hat x$ m/μs. True or false: the wave is propagating in a conductive medium.`,
        ['FALSE: the shape translates without shrinking', 'TRUE: the field decays exponentially with $x$', 'TRUE: a step-shaped wave needs a conductor to launch it', 'Cannot tell without knowing $\\sigma$'], 0,
        [null, 'The decay is in the shape at one instant. Loss would make the step itself shrink as it travels; it stays 3 V/m.', 'Any shape can be launched; a step needs only a source switched on suddenly.', 'The data tell you: it moves at $c$, the vacuum speed, and a function of $x + vt$ alone translates rigidly, which a lossy medium does not allow.'],
        md`$\mathbf E(x,t) = 3\,u[x + 300t - 400]\,e^{-(x + 300t - 400)/50}\,\hat z$ is a function of $x + 300t$ alone: a rigid translation, a solution of the lossless wave equation. FALSE.`, { src: 'Spring 2018 Exam 2' }),
      fixedQ(md`Lecture 18's challenge: the velocities of propagation of $f = (0.05y - t)^2$, $g = u[t + 0.02x]$ and $h = \cos(2\pi10^8t - 2\pi z)$ (SI units) are…`,
        ['$0.05\\,\\hat y$, $-0.02\\,\\hat x$, $10^8\\,\\hat z$', '$0.05\\,\\hat y$, $-0.02\\,\\hat x$, $-10^8\\,\\hat z$', '$20\\,\\hat y$, $-50\\,\\hat x$, $10^8\\,\\hat z$', '$20\\,\\hat y$, $50\\,\\hat x$, $10^8\\,\\hat z$', '$20\\,\\hat y$, $-50\\,\\hat x$, $-10^8\\,\\hat z$'], 2,
        ['Those are the coefficients, which are $1/v$: $0.05\\,\\text{s/m}$ means 20 m/s.', 'Those are $1/v$, and $h$ has opposite signs on its $t$ and $z$ terms: toward $+z$.', null, '$t + 0.02x$ has the same signs: toward $-x$.', '$2\\pi10^8t - 2\\pi z$ has opposite signs: toward $+z$.'],
        md`Velocity $= -a/b$ for an argument $at + b\,(\text{position})$: $f$: $a = -1$, $b = 0.05$, so $+20\,\hat y$; $g$: $-1/0.02 = -50\,\hat x$; $h$: $2\pi10^8/2\pi = 10^8\,\hat z$. Answer (c). (Lecture 18.)`),
      Q(md`[[fig:trap]]
        A wave traveling toward $-z$ at 100 m/s is recorded at $z = 0$ (above). Its amplitude at $z = -300$ m, $t = 3.4$ s is…`,
        ['0.4 V/m', '0.3 V/m', '0', '1 V/m'], 0,
        [null, 'That reads the recording at $t = 3.4$ s, ignoring the 300 m between the two points.', 'That treats the wave as moving toward $+z$: it would then show what $z = 0$ recorded at $t = 6.4$ s.', 'That is the flat top, recorded between $t = 1$ and 2 s; here the argument is $t + z/v = 0.4$ s.'],
        md`Toward $-z$: $E(z,t) = E(0,\ t + z/v) = E(0,\ 3.4 - 3) = E(0, 0.4) = 0.4$ V/m. The point $z = -300$ m is downstream, so it sees the signal 3 s late. (Lecture 18.)`, { figs: { trap: { svg: trapFig(), cap: 'The recording E(0, t) at z = 0.' } } }),
      Q(md`HW 7 #5(b): is $\mathbf E = \cos^2(\omega t - \beta x)\,\hat y$ V/m a solution of $\nabla^2\mathbf E = \mu\epsilon\,\partial^2\mathbf E/\partial t^2$?`,
        ['yes, if $\\beta = \\omega\\sqrt{\\mu\\epsilon}$: it is a function of $\\omega t - \\beta x$ alone', 'no: a squared cosine is not a sinusoid', 'yes, for any $\\beta$', 'yes, if $\\beta = 2\\omega\\sqrt{\\mu\\epsilon}$, since $\\cos^2$ oscillates at $2\\omega$'], 0,
        [null, 'Any shape works, sinusoidal or not, as long as it depends on $t$ and $x$ only through $t - x/v_p$.', 'The speed $\\omega/\\beta$ must equal $1/\\sqrt{\\mu\\epsilon}$.', '$\\cos^2(\\phi) = \\frac12 + \\frac12\\cos 2\\phi$: both $\\omega$ and $\\beta$ double, and their ratio, the speed, does not change.'],
        md`$\cos^2(\omega t - \beta x) = F(t - x\beta/\omega)$: a forward wave at speed $\omega/\beta$, a solution when $\omega/\beta = 1/\sqrt{\mu\epsilon}$. In words: a $\cos^2$-shaped pattern sliding toward $+x$.`),
      Q(md`HW 7 #5(d): $\mathbf E = \cos(\omega t - \beta_xx - \beta_yy)\,\hat z$ V/m solves the wave equation if…`,
        ['$\\beta_x^2 + \\beta_y^2 = \\omega^2\\mu\\epsilon$', '$\\beta_x + \\beta_y = \\omega\\sqrt{\\mu\\epsilon}$', '$\\beta_x = \\beta_y = \\omega\\sqrt{\\mu\\epsilon}$', 'never: it depends on two coordinates, so it is not a plane wave'], 0,
        [null, 'The Laplacian brings down $\\beta_x^2$ and $\\beta_y^2$; they add as squares.', 'Then $\\beta_x^2 + \\beta_y^2 = 2\\omega^2\\mu\\epsilon$: too fast a variation in space for this $\\omega$.', 'It is a plane wave traveling at an angle, along $(\\beta_x, \\beta_y)$; it is uniform across that direction.'],
        md`$\nabla^2\mathbf E = -(\beta_x^2 + \beta_y^2)\mathbf E$ and $\mu\epsilon\,\partial^2\mathbf E/\partial t^2 = -\omega^2\mu\epsilon\,\mathbf E$. It travels along $\beta_x\hat x + \beta_y\hat y$ at $v_p = \omega/\sqrt{\beta_x^2 + \beta_y^2}$.`),
      Q(md`HW 7 #6: a $z$-polarized wave moves toward $-x$ in vacuum, with $E_z(0,t) = 2\triangle(t/\tau)$ V/m, a unit triangle of width $\tau = 3\ \mu$s centered on $t = 0$. The peak of $E_z$ reaches $x = -1000$ m at…`,
        ['$t = 3.33\\ \\mu$s', '$t = -3.33\\ \\mu$s', '$t = 3\\ \\mu$s', '$t = 4.83\\ \\mu$s'], 0,
        [null, 'That is when a wave moving toward $+x$ would have left $x = -1000$ m; this one arrives there after passing $x = 0$.', 'That is the pulse width, not the travel time.', 'That adds half the width; the peak itself passes $x = 0$ at $t = 0$.'],
        md`$E_z(x,t) = 2\triangle\big((t + x/c)/\tau\big)$; the peak is where $t + x/c = 0$: $t = 1000/300\ \mu\text{s} = 3.33\ \mu$s.`),
      Q(md`A probe at $z = 0$ records a forward wave (toward $+z$): $E$ rises slowly from 0 to a maximum, then drops suddenly to 0. A snapshot of the same wave, taken later, is…`,
        ['zero at its front, rising slowly toward its back, then dropping suddenly at the back', 'rising slowly from its back toward its front, then dropping suddenly at the front', 'a symmetric triangle: travel smooths the drop', 'dropping suddenly at both ends'], 0,
        [null, 'That copies the recording onto the $z$ axis. The front of the snapshot is what reached the probe first: the slow start.', 'A lossless wave keeps its shape exactly; nothing smooths out.', 'The shape is the recording, reversed and stretched, so one end is slow and one is sudden.'],
        md`$E(z, t_0) = E(0,\ t_0 - z/v_p)$: the largest $z$ (the front) holds the earliest part of the recording, the slow rise; the sudden drop, recorded last, sits at the back.`),
      Q(md`Why does a uniform plane wave traveling along $z$ (fields depending on $z$ and $t$ only) have no $E_z$?`,
        ['Gauss: $\\nabla\\cdot\\mathbf E = \\partial E_z/\\partial z = 0$, so $E_z$ is constant, and a constant is not part of the wave', 'An $E_z$ would travel faster than $v_p$', 'Faraday\'s law forbids any component along $z$', 'It can have one if the source is strong enough'], 0,
        [null, 'Every component obeys the same wave equation; speed is not the issue.', 'Faraday constrains $E_x$ and $E_y$ through their $z$-derivatives; $E_z$ drops out of it. The constraint comes from Gauss.', 'Strength does not matter; $\\nabla\\cdot\\mathbf E = 0$ holds for any amplitude in a charge-free region.'],
        md`With no charge and no $x$, $y$ dependence, $\nabla\cdot\mathbf E = \partial E_z/\partial z = 0$; and $\epsilon\,\partial E_z/\partial t = (\nabla\times\mathbf H)_z = 0$, since $\mathbf H$ depends only on $z$. So $E_z$ is constant in space and time. The same argument with $\nabla\cdot\mathbf B = 0$ and Faraday removes $H_z$: the wave is transverse.`),
      Q(md`A pulse lasts 2 μs as it passes a fixed point in a medium with $\epsilon_r = 4$, $\mu_r = 1$. At one instant it occupies a length of…`,
        ['300 m', '600 m', '150 m', '1200 m'], 0,
        [null, 'That uses $c$; in this medium $v_p = c/2$.', 'That divides by $\\epsilon_r$ instead of $\\sqrt{\\epsilon_r}$.', 'That multiplies by $\\sqrt{\\epsilon_r}$ instead of dividing.'],
        md`$v_p = c/\sqrt4 = 150$ m/μs, so the length is $v_p\times2\ \mu\text{s} = 300$ m.`),
      R(md`
        ### Rapid fire: direction, speed, and is it a wave?

        **The trick:** argument $at + bz$ moves at $-a/b$; $\mathbf E\times\mathbf H$ points along the travel; a solution is any function of $t \mp z/v_p$, or a sum of them.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t14_dir', { need: 8 }), { id: 't14-wave-eq.r0' }),
      R(md`
        ### Rapid fire: moving it

        **The trick:** forward, $E(z,t) = E(0,\ t - z/v_p)$; backward, $E(0,\ t + z/v_p)$. Downstream is later. $v_p = c/\sqrt{\epsilon_r}$, $\eta = \eta_0/\sqrt{\epsilon_r}$ (with $\mu = \mu_0$).
      `),
      Object.assign(G('rf_t14_shift', { need: 8 }), { id: 't14-wave-eq.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t14_profile', { need: 2 }),
      G('t14_signal', { need: 2 }),
      G('t14_cand', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const TRAP = trapFig();
  const MEDIA = [[1, 300], [2.25, 200], [4, 150], [9, 100]];        // ε_r, v_p in m/μs (μ = μ0)
  const er$ = (er) => (er === 1 ? 'free space' : `a medium with $\\epsilon_r = ${er}$, $\\mu_r = 1$`);

  GENS.rf_t14_dir = () => one([
    // velocity from an argument
    () => {
      const ax = pick(AX), sg = pick([1, -1]), form = ri(0, 4);
      let ex, v, rec;
      if (form === 0) { const V = pick([20, 50, 200, 500]); ex = `f\\!\\left(t ${sg > 0 ? '-' : '+'} \\frac{${ax}}{${V}}\\right)`; v = sg * V; rec = 1 / V; }
      else if (form === 1) { const V = pick([20, 50, 100, 200]); ex = `(${1 / V}${ax} ${sg > 0 ? '-' : '+'} t)^2`; v = sg * V; rec = 1 / V; }
      else if (form === 2) { const V = pick([20, 50, 100, 500]); ex = `u[t ${sg > 0 ? '-' : '+'} ${1 / V}${ax}]`; v = sg * V; rec = 1 / V; }
      else if (form === 3) { const n = pick([6, 8, 9]), m = pick(n === 9 ? [1, 2] : [0, 1, 2]); /* speeds up to 10^8 m/s, below c */ ex =`\\cos(2\\pi\\times10^{${n}}t ${sg > 0 ? '-' : '+'} 2\\pi${m ? `\\times10^{${m}}` : ''}\\,${ax})`; v = sg * 10 ** (n - m); rec = 10 ** (m - n); }
      else { const V = pick([100, 300, 2000]); ex = `e^{-(${ax} ${sg > 0 ? '-' : '+'} ${V}t)^2}`; v = sg * V; rec = 1 / V; }
      const o = (x) => `$${x < 0 ? '-' : '+'}${p(Math.abs(x))}\\,\\hat ${ax}$ m/s`;
      return MC('Which way, how fast?', md`Positions in m, time in s. The waveform $${ex}$ moves with velocity…`, o(v),
        [[o(-v), `Write the argument as $at + b${ax}$: the velocity is $-a/b$, ${v > 0 ? 'positive here because $a$ and $b$ have opposite signs' : 'negative here because $a$ and $b$ have the same sign'}.`],
          [o(Math.sign(v) * rec), 'That is $b/a$, the slowness (s/m). The speed is its reciprocal.'],
          ['$0$: it is a pulse in time, not in space', `Its features sit at $${ax} = (\\text{const}) ${v > 0 ? '+' : '-'} ${p(Math.abs(v))}t$: they move.`]],
        md`Argument $at + b${ax}$, velocity $-a/b = ${v < 0 ? '-' : ''}${p(Math.abs(v))}$ m/s: toward $${v > 0 ? '+' : '-'}${ax}$.`);
    },
    // which H goes with a traveling E
    () => {
      const ui = ri(0, 2), s = pick([1, -1]), ai = pick([0, 1, 2].filter((i) => i !== ui));
      const u = AX[ui], a = AX[ai], h = cross([ui, s], [ai, 1]);
      const arg = `t ${s > 0 ? '-' : '+'} ${u}/v_p`;
      return MC('Which way is H?', md`$\mathbf E = f(${arg})\,\hat ${a}$ with $f \ge 0$, in a lossless medium. $\mathbf H = \frac1\eta f(${arg})$ times…`, `$${vec(h)}$`,
        [[`$${vec([h[0], -h[1]])}$`, `Then $\\mathbf E\\times\\mathbf H$ would point along $${vec([ui, -s])}$, against the travel of $f(${arg})$.`],
          [`$+\\hat ${u}$`, 'Plane-wave fields are transverse: no component along the travel axis.'],
          [`$+\\hat ${a}$`, '$\\mathbf H$ is perpendicular to $\\mathbf E$.']],
        md`$f(${arg})$ travels toward $${vec([ui, s])}$, and $\hat ${a}\times(${vec(h)}) = ${vec([ui, s])}$ ✓.`);
    },
    // is it a solution?
    () => {
      const [ex, right, wrongs, why] = pick([
        ['\\cos^2(\\omega t - \\beta z)', 'yes: it is a function of $\\omega t - \\beta z$ alone', [['no: $\\cos^2$ is not a sinusoid', 'Any shape travels; it need not be sinusoidal.'], ['no: it oscillates at $2\\omega$, too fast for $\\beta$', 'Its spatial rate doubles too ($2\\beta$): the speed $\\omega/\\beta$ is unchanged.']], '$\\cos^2(\\omega t - \\beta z) = F(t - z/v_p)$.'],
        ['\\cos(\\omega t)\\cos(\\beta z)', 'yes: it is two waves moving in opposite directions', [['no: nothing in it travels', 'A standing wave is a sum of two traveling waves, and a sum of solutions is a solution.'], ['no: it is not of the form $f(t - z/v_p)$', 'Solutions may be $f(t - z/v_p) + g(t + z/v_p)$.']], '$\\cos\\omega t\\cos\\beta z = \\frac12\\cos(\\omega t - \\beta z) + \\frac12\\cos(\\omega t + \\beta z)$.'],
        ['e^{-\\alpha z}\\cos(\\omega t - \\beta z),\\ \\alpha > 0', 'no: a lossless wave cannot shrink as it travels', [['yes: it is a decaying traveling wave', 'Decay with distance needs a lossy medium; substituting leaves a $2\\alpha\\beta\\sin$ term.'], ['yes, if $\\beta^2 - \\alpha^2 = \\omega^2\\mu\\epsilon$', 'That balances the $\\cos$ terms, but the $\\sin$ terms still demand $\\alpha\\beta = 0$.']], 'Substituting gives $(\\alpha^2 - \\beta^2)\\cos - 2\\alpha\\beta\\sin = -\\omega^2\\mu\\epsilon\\cos$, impossible for $\\alpha > 0$.'],
        ['(z - v_pt)^3', 'yes: it is a function of $z - v_pt$', [['no: it grows without bound', 'The wave equation does not require boundedness (a real source would cut it off).'], ['no: only sinusoids solve it', 'Any function of $z - v_pt$ solves it.']], '$(z - v_pt)^3 = F(z - v_pt)$: a forward wave.'],
        ['z^2 + v_p^2t^2', 'yes: it is $\\frac12(z - v_pt)^2 + \\frac12(z + v_pt)^2$', [['no: it is not a function of $z - v_pt$', 'It is a sum of a function of $z - v_pt$ and a function of $z + v_pt$.'], ['no: $\\partial^2/\\partial z^2$ and $\\partial^2/\\partial t^2$ have opposite signs', 'Both give positive constants: $2 = (1/v_p^2)(2v_p^2)$.']], '$\\partial_z^2 = 2$ and $(1/v_p^2)\\partial_t^2 = 2$: equal.'],
        ['z^2 - v_p^2t^2', 'no: $\\partial^2/\\partial z^2 = 2$ but $(1/v_p^2)\\partial^2/\\partial t^2 = -2$', [['yes: it is $(z - v_pt)(z + v_pt)$', 'A product of the two arguments is not a sum of functions of each.'], ['yes: it is built from $z$ and $v_pt$', 'Being built from them is not enough; it must be $F(z - v_pt) + G(z + v_pt)$.']], 'The two sides have opposite signs.'],
        ['\\cos(\\omega t - \\beta z),\\ \\omega/\\beta = 2v_p', 'no: it moves at $2v_p$, not $v_p$', [['yes: every $\\cos(\\omega t - \\beta z)$ is a wave', 'Only at the medium\'s speed: $\\omega/\\beta$ must equal $1/\\sqrt{\\mu\\epsilon}$.'], ['yes: the speed may be anything up to $c$', 'The medium fixes the speed exactly.']], 'Substituting gives $\\beta^2 = \\omega^2\\mu\\epsilon$, i.e. $\\omega/\\beta = v_p$.'],
        ['u[t - z/v_p]\\,e^{-(t - z/v_p)}', 'yes: it is a function of $t - z/v_p$ alone', [['no: the step makes it discontinuous', 'Steps are fine: they travel as sharp fronts.'], ['no: it decays, so it needs loss', 'It decays in its argument, not with distance traveled; the shape is rigid.']], 'A shape $F(t - z/v_p)$ with $F(s) = u[s]e^{-s}$.'],
      ]);
      return MC('Is it a solution?', md`In a lossless medium with speed $v_p = 1/\sqrt{\mu\epsilon}$ (and $\omega/\beta = v_p$ unless stated otherwise), is $E_x = ${ex}$ a solution of $\partial^2E_x/\partial z^2 = \mu\epsilon\,\partial^2E_x/\partial t^2$?`, right, wrongs, md`${why}`);
    },
  ]);

  GENS.rf_t14_shift = () => one([
    // Lecture 18's recording, read at another place and time
    () => {
      const v = pick([50, 100, 200]), s = pick([1, -1]);
      let tau, k, zs, ts;
      do { tau = pick([0.4, 0.5, 0.8, 1.5, 2.2, 2.5, 3, 3.4]); k = pick([1, 2, 3]); zs = pick([1, -1]) * k * v; ts = r2(tau + s * zs / v); } while (ts < 0);
      const val = (x) => `$${r2(x)}$ V/m`;
      return MC('Read the recording', md`The recording $E(0,t)$ above belongs to a wave moving toward $${s > 0 ? '+' : '-'}z$ at ${v} m/s. At $z = ${zs}$ m and $t = ${ts}$ s, $E = $`, val(trap(tau)),
        [[val(trap(ts + s * zs / v)), `That shifts the wrong way: toward $${s > 0 ? '+' : '-'}z$, $E(z,t) = E(0,\\ t ${s > 0 ? '-' : '+'} z/v)$.`],
          [val(trap(ts)), `That reads the recording at $t = ${ts}$ s, ignoring the ${Math.abs(zs)} m between the points.`],
          [val(0), `The argument is $${r2(tau)}$ s, inside the pulse.`], [val(1), `The flat top is at arguments between 1 and 2 s; here it is $${r2(tau)}$ s.`]],
        md`$E(${zs}, ${ts}) = E\big(0,\ ${ts} ${s > 0 ? '-' : '+'} (${zs})/${v}\big) = E(0, ${r2(tau)}\ \text{s}) = ${r2(trap(tau))}$ V/m.`, TRAP);
    },
    // travel time in a medium
    () => {
      const [er, v] = pick(MEDIA), d = pick([300, 600, 900, 1200, 1500]);
      const t = d / v;
      const o = (x) => `${+x.toPrecision(3)} μs`;
      return MC('Arrival time', md`A pulse passes $z = 0$ at $t = 0$, moving toward $+z$ in ${er$(er)}. Its peak passes $z = ${d}$ m at…`, o(t),
        [[o(d / 300), 'That uses $c$; in this medium $v_p = c/\\sqrt{\\epsilon_r}$.'], [o(d * er / 300), 'That divides $c$ by $\\epsilon_r$ instead of $\\sqrt{\\epsilon_r}$.'], [o(t / 2), 'The peak travels the whole distance at $v_p$.'], [o(t * 10), 'Off by ten: $c = 300$ m/μs.'], [o(t / 10), 'Off by ten: $c = 300$ m/μs.']],
        md`$v_p = 300/\sqrt{${er}} = ${v}$ m/μs, so $t = ${d}/${v} = ${+t.toPrecision(3)}$ μs.`);
    },
    // where is the feature now
    () => {
      const [er, v] = pick(MEDIA), s = pick([1, -1]), z0 = pick([-300, -100, 0, 200, 500]), t0 = pick([1, 2]);
      let t1; do { t1 = pick([0, 3, 4, 5]); } while (t1 === t0);
      const z1 = z0 + s * v * (t1 - t0);
      const o = (x) => `${x} m`;
      return MC('Where is the peak?', md`A snapshot at $t = ${t0}$ μs shows a pulse peaked at $z = ${z0}$ m, moving toward $${s > 0 ? '+' : '-'}z$ in ${er$(er)}. At $t = ${t1}$ μs the peak is at…`, o(z1),
        [[o(z0 - s * v * (t1 - t0)), 'That moves it the wrong way.'], [o(z0), 'The pulse moves.'], [o(z0 + s * v * t1), `That measures time from $t = 0$; the snapshot is at $t = ${t0}$ μs.`], [o(z0 + s * 300 * (t1 - t0)), 'That uses $c$; in this medium $v_p = c/\\sqrt{\\epsilon_r}$.']],
        md`$z = ${z0} ${s > 0 ? '+' : '-'} ${v}\,(${t1} - ${t0}) = ${z1}$ m.`);
    },
    // length of a pulse in space
    () => {
      const [er, v] = pick(MEDIA), T = pick([0.5, 1, 2, 4]);
      const Lm = v * T;
      const o = (x) => `${+x.toPrecision(3)} m`;
      return MC('Length in space', md`A pulse lasts ${T} μs as it passes a fixed point in ${er$(er)}. At one instant it is how long?`, o(Lm),
        [[o(300 * T), 'That uses $c$, not $c/\\sqrt{\\epsilon_r}$.'], [o(Lm * 10), 'Off by ten: $c = 300$ m/μs.'], [o(Lm * 2), 'The whole pulse, not twice it: $v_pT$.'], [o(Lm / 2), 'The whole pulse is $v_pT$ long, not half of it.']],
        md`Length $= v_pT = ${v}\ \text{m}/\mu\text{s}\times${T}\ \mu\text{s} = ${+Lm.toPrecision(3)}$ m.`);
    },
    // H from E with the medium's η
    () => {
      const [er] = pick(MEDIA), H0 = pick([0.5, 1, 2, 4]);
      const eta = ETA0 / Math.sqrt(er), E0 = eta * H0;
      const o = (x) => `$${f(x)}$ A/m`;
      return MC('H from E', md`A single traveling wave in ${er$(er)} has $|\mathbf E| = ${f(E0)}$ V/m at some point. There $|\mathbf H| = $`, o(H0),
        [[o(E0 / ETA0), er === 1 ? 'Recheck: $\\eta_0 = 120\\pi\\ \\Omega$.' : 'That uses $\\eta_0$; in this medium $\\eta = \\eta_0/\\sqrt{\\epsilon_r}$.'], [o(E0 * eta), '$|\\mathbf H| = |\\mathbf E|/\\eta$, not $\\eta|\\mathbf E|$.'],
          er === 1 ? [o(2 * H0), 'A single traveling wave has $|\\mathbf E|/|\\mathbf H| = \\eta_0$ exactly: no factor of 2.'] : [o(H0 * Math.sqrt(er)), 'That divides $\\eta_0$ by $\\epsilon_r$ instead of $\\sqrt{\\epsilon_r}$.'],
          er === 1 ? [o(H0 / 2), 'A single traveling wave has $|\\mathbf E|/|\\mathbf H| = \\eta_0$ exactly: no factor of 2.'] : [o(H0 / er), 'That multiplies $\\eta_0$ by $\\sqrt{\\epsilon_r}$; a denser medium has a smaller $\\eta$.']],
        md`$\eta = 120\pi/\sqrt{${er}} = ${f(eta)}\ \Omega$, so $|\mathbf H| = ${f(E0)}/${f(eta)} = ${f(H0)}$ A/m.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  // Spring 2018 #4 style: a step-exponential snapshot at t0, moved in time
  GENS.t14_profile = () => {
    const ui = ri(0, 2), ai = pick([0, 1, 2].filter((i) => i !== ui));
    const u = AX[ui], a = AX[ai];
    const [er, v] = pick(MEDIA), s = pick([1, -1]);
    const A = pick([2, 3, 4, 5]), Lc = pick([25, 50, 100]), t0 = pick([1, 2, 3]);
    let u0, us0;
    do { u0 = pick([-200, -100, 100, 200, 300]); us0 = u0 - s * v * t0; } while (us0 === 0);
    const ts = pick([0, 1, 2, 3, 4, 5].filter((x) => x !== t0));
    const xi = pick([0.5, 1, 2]) * Lc;
    const uq = u0 + s * v * (ts - t0) + xi;
    const Eq = A * Math.exp(-xi / Lc);
    // the argument u − s v t − c for a candidate (velocity sign sv, step at c when t = 0)
    const arg = (sv, c) => `${u} ${sv > 0 ? '-' : '+'} ${v}t${c === 0 ? '' : ` ${c > 0 ? '-' : '+'} ${Math.abs(c)}`}`;
    const expr = (sv, c) => `$${A}\\,u[${arg(sv, c)}]\\,e^{-(${arg(sv, c)})/${Lc}}$`;
    const OPTS = [expr(s, us0), expr(-s, u0 + s * v * t0), expr(s, u0), expr(-s, u0)];
    const P = [ui, s], hdir = cross(P, [ai, 1]);
    const HD = [vec(hdir), vec([hdir[0], -hdir[1]]), `+\\hat ${u}`, `+\\hat ${a}`];
    const span0 = [u0 - 250, u0 + 450];
    const lo = Math.min(u0, us0) - 200, hi = Math.max(u0, us0) + 400, st = niceStep(hi - lo);
    const given = wplot({
      alt: `the snapshot at t = ${t0} μs: zero left of ${u} = ${u0} m, ${A} V/m at the step, decaying to the right`,
      x: span0, y: [0, A + 0.9], xt: ticks(span0[0], span0[1], 100), yt: ticks(1, A, 1), xl: `${u}\\,(\\text{m})`, yl: `E_${a}\\,(\\text{V/m})`,
      curves: [{ pts: expPts(u0, A, Lc, span0[0], span0[1]) }],
      arrows: [[u0 + 230 - 60 * s, A + 0.45, u0 + 230 + 60 * s, A + 0.45, '\\mathbf v']],
    });
    const solFig = wplot({
      alt: `the given snapshot (solid) and the snapshot at t = 0 (dashed), with its step at ${u} = ${us0} m`,
      x: [lo, hi], y: [0, A + 0.9], xt: ticks(lo, hi, st), yt: ticks(1, A, 1), xl: `${u}\\,(\\text{m})`, yl: `E_${a}\\,(\\text{V/m})`,
      curves: [{ pts: expPts(u0, A, Lc, lo, hi) }, { pts: expPts(us0, A, Lc, lo, hi), cls: 'dash' }],
      arrows: [[us0, A + 0.45, u0, A + 0.45, `${v * t0}\\ \\text{m}`]],
    });
    return {
      title: 'A snapshot, moved in time',
      q: md`The electric field of a wave moves with $\mathbf v = ${s > 0 ? '' : '-'}${v}\,\hat ${u}$ m/μs in ${er$(er)}. At $t = ${t0}\ \mu$s its snapshot is
$$\mathbf E(${u}, ${t0}\,\mu\text{s}) = ${A}\,u[${shift(u, u0)}]\,e^{-(${shift(u, u0)})/${Lc}}\,\hat ${a}\ \ \text{V/m}\qquad(${u}\ \text{in m})$$
[[fig:given]]
Find where the step is at $t = 0$, the field at $${u} = ${uq}$ m and $t = ${ts}\ \mu$s, the expression for $\mathbf E(${u},t)$ ($t$ in μs), and the direction of $\mathbf H$.`,
      figs: { given: { svg: given, cap: `The snapshot at t = ${t0} μs.` }, sol: { svg: solFig, cap: `Given snapshot (solid) and t = 0 (dashed): ${v * t0} m farther toward ${s > 0 ? '−' : '+'}${u}.` } },
      parts: [
        N(`${u}_{\\text{step}}\\ \\text{at}\\ t = 0`, us0, 'm'),
        N(`E_${a}(${uq}\\,\\text{m},\\ ${ts}\\,\\mu\\text{s})`, Eq, 'V/m'),
        { lbl: `$E_${a}(${u},t) = $`, mc: OPTS, a: 0, why: [null, `That snapshot matches at $t = ${t0}$ μs but moves toward $${s > 0 ? '-' : '+'}${u}$.`, `That puts the given snapshot at $t = 0$; it was taken at $t = ${t0}$ μs.`, 'Wrong direction, and it puts the snapshot at $t = 0$.'] },
        { lbl: `$\\mathbf H$ points along`, mc: HD.map((d) => `$${d}$`), a: 0, why: [null, `Then $\\mathbf E\\times\\mathbf H$ would point along $${vec([ui, -s])}$, against $\\mathbf v$.`, 'Plane-wave fields are transverse.', '$\\mathbf H\\perp\\mathbf E$.'] },
      ],
      hints: [`Toward $${s > 0 ? '+' : '-'}${u}$: $\\mathbf E(${u},t) = \\mathbf E\\big(${u} ${s > 0 ? '-' : '+'} ${v}(t - ${t0}),\\ ${t0}\\,\\mu\\text{s}\\big)$.`, `The step sits where the argument of $u[\\cdot]$ is zero; $\\mathbf E\\times\\mathbf H$ points along $\\mathbf v$.`],
      sol: sol({
        eq: md`A rigid shape moving at $${s > 0 ? '+' : '-'}${v}\,\hat ${u}$ m/μs: $\mathbf E(${u},t) = \mathbf E\big(${u} ${s > 0 ? '-' : '+'} ${v}(t - ${t0}),\ ${t0}\,\mu\text{s}\big)$.`,
        sym: md`Replace $${u}$ by $${u} ${s > 0 ? '-' : '+'} ${v}(t - ${t0})$: the argument becomes $${shift(u, u0)} ${s > 0 ? '-' : '+'} ${v}(t - ${t0}) = ${arg(s, us0)}$.`,
        sub: md`Step at $t = 0$: $${u} = ${u0} ${s > 0 ? '-' : '+'} ${v}(${t0}) = ${us0}$ m. At $(${uq}\,\text{m}, ${ts}\,\mu\text{s})$ the argument is $${uq} ${s > 0 ? '-' : '+'} ${v}(${ts})${us0 === 0 ? '' : ` ${us0 > 0 ? '-' : '+'} ${Math.abs(us0)}`} = ${xi}$ m, so
$$E_${a} = ${A}\,e^{-${xi}/${Lc}} = ${f(Eq)}\ \text{V/m}$$
[[fig:sol]]`,
        ans: md`Step at $${u} = ${us0}$ m; $E_${a} = ${f(Eq)}$ V/m; $\mathbf E(${u},t) = ${expr(s, us0).slice(1, -1)}\,\hat ${a}$ V/m; $\mathbf H$ along $${vec(hdir)}$ (magnitude $|\mathbf E|/\eta$).`,
        check: md`At $t = ${t0}$ the argument is $${shift(u, u0)}$ ✓. The step moves at $${s > 0 ? '+' : '-'}${v}$ m/μs ✓. $\hat ${a}\times(${vec(hdir)}) = ${vec(P)}$, along $\mathbf v$ ✓. The shape never shrinks: no loss.`,
      }),
    };
  };

  // HW 7 #6 / Lecture 19 style: a recording at the origin, moved in space
  GENS.t14_signal = () => {
    const ui = ri(0, 2), ai = pick([0, 1, 2].filter((i) => i !== ui));
    const u = AX[ui], a = AX[ai];
    const [er, v] = pick(MEDIA.slice(0, 3)), s = pick([1, -1]);
    const Pk = pick([2, 3, 6, 12]);
    let T1, T2; do { T1 = pick([1, 2, 3]); T2 = pick([1, 2, 4]); } while (T1 === T2);
    const sig = (t) => (t <= 0 || t >= T1 + T2 ? 0 : t <= T1 ? Pk * t / T1 : Pk * (1 - (t - T1) / T2));
    const k = pick([1, 2, 3]), tau = pick([T1 / 2, T1 + T2 / 2, T1 + T2 / 4]);
    const uq = s * k * v, tq = tau + k;                              // downstream by k μs of travel
    const d1 = pick([2, 4, 5]) * v, tpk = T1 + d1 / v;
    const eta = ETA0 / Math.sqrt(er), Hpk = Pk / eta;
    const steepFront = T1 < T2;
    const C3 = [`the front (the side facing $${vec([ui, s])}$)`, 'the back (the side facing the origin)', 'neither: both sides are equally steep'];
    const recFig = wplot({
      alt: `the recording at ${u} = 0: zero, rising linearly to ${Pk} V/m at t = ${T1} μs, falling linearly to zero at t = ${T1 + T2} μs`,
      x: [-1, T1 + T2 + 1.5], y: [0, Pk * 1.25], xt: ticks(0, T1 + T2 + 1, 1), yt: [[Pk, String(Pk)]], xl: 't\\,(\\mu\\text{s})', yl: `E_${a}(0,t)\\,(\\text{V/m})`,
      curves: [{ pts: [[-1, 0], [0, 0], [T1, Pk], [T1 + T2, 0], [T1 + T2 + 1.5, 0]] }],
    });
    const t2 = T1 + T2 + 1;                                           // a snapshot after the whole pulse has left the origin
    const zb = s * v * (t2 - T1 - T2), zp = s * v * (t2 - T1), zf = s * v * t2;
    const lo = Math.min(0, zf) - v / 2, hi = Math.max(0, zf) + v / 2, st = niceStep(hi - lo);
    const snapFig = wplot({
      alt: `the snapshot at t = ${t2} μs versus ${u}: front at ${zf} m, peak at ${zp} m, back at ${zb} m`,
      x: [lo, hi], y: [0, Pk * 1.35], xt: ticks(lo, hi, st), yt: [[Pk, String(Pk)]], xl: `${u}\\,(\\text{m})`, yl: `E_${a}(${u}, ${t2}\\,\\mu\\text{s})`,
      curves: [{ pts: [[lo, 0], [Math.min(zb, zf), 0], [zp, Pk], [Math.max(zb, zf), 0], [hi, 0]] }],
      arrows: [[zp - s * v * 0.6, Pk * 1.15, zp + s * v * 0.6, Pk * 1.15, '\\mathbf v']],
    });
    return {
      title: 'A recording, moved in space',
      q: md`A $${a}$-polarized plane wave travels toward $${s > 0 ? '+' : '-'}${u}$ in ${er$(er)} ($v_p = ${v}$ m/μs). At $${u} = 0$ its field is recorded as $E_${a}(0,t)$ below: 0 before $t = 0$, rising linearly to $${Pk}$ V/m at $t = ${T1}\ \mu$s, falling linearly to 0 at $t = ${T1 + T2}\ \mu$s.
[[fig:rec]]
Find $E_${a}$ at $${u} = ${uq}$ m, $t = ${r2(tq)}\ \mu$s; the time at which the peak passes $${u} = ${s * d1}$ m; the peak of $|\mathbf H|$; and which side of the pulse is steeper in a snapshot.`,
      figs: { rec: { svg: recFig, cap: `The recording at ${u} = 0.` }, snap: { svg: snapFig, cap: `The snapshot at t = ${t2} μs: the recording reversed, 1 μs becoming ${v} m.` } },
      parts: [
        N(`E_${a}(${uq}\\,\\text{m},\\ ${r2(tq)}\\,\\mu\\text{s})`, sig(tau), 'V/m'),
        N(`t_{\\text{peak}}\\ \\text{at}\\ ${u} = ${s * d1}\\,\\text{m}`, tpk, 'μs'),
        N('|\\mathbf H|_{\\max}', Hpk, 'A/m'),
        { lbl: 'In a snapshot, the steeper side of the pulse is', mc: C3, a: steepFront ? 0 : 1, fixed: true, why: steepFront ? [null, 'The back holds the end of the recording, the slow fall.', `The rise takes ${T1} μs and the fall ${T2} μs: they differ.`] : ['The front holds the start of the recording, the slow rise.', null, `The rise takes ${T1} μs and the fall ${T2} μs: they differ.`] },
      ],
      hints: [`Toward $${s > 0 ? '+' : '-'}${u}$: $E_${a}(${u},t) = E_${a}(0,\\ t ${s > 0 ? '-' : '+'} ${u}/v_p)$. A point downstream sees the recording late.`, `$\\eta = 120\\pi/\\sqrt{\\epsilon_r}$. In a snapshot the front holds what was recorded first.`],
      sol: sol({
        eq: md`$E_${a}(${u},t) = E_${a}\big(0,\ t ${s > 0 ? '-' : '+'} ${u}/v_p\big)$ with $v_p = ${v}$ m/μs; $|\mathbf H| = |\mathbf E|/\eta$.`,
        sym: md`The point $${u} = ${uq}$ m is ${k * v} m downstream: it sees the recording ${k} μs late. The peak (recorded at $t = ${T1}$ μs) reaches $${u} = ${s * d1}$ m after $${d1}/${v}$ μs more.`,
        sub: md`$$E_${a}(${uq}, ${r2(tq)}) = E_${a}(0,\ ${r2(tq)} - ${k}) = E_${a}(0,\ ${r2(tau)}\,\mu\text{s}) = ${f(sig(tau))}\ \text{V/m}$$
$$t_{\text{peak}} = ${T1} + \frac{${d1}}{${v}} = ${f(tpk)}\ \mu\text{s}, \qquad |\mathbf H|_{\max} = \frac{${Pk}}{120\pi/\sqrt{${er}}} = ${f(Hpk)}\ \text{A/m}$$
[[fig:snap]]`,
        ans: md`$E_${a} = ${f(sig(tau))}$ V/m; the peak passes at $t = ${f(tpk)}$ μs; $|\mathbf H|_{\max} = ${f(Hpk)}$ A/m; the steeper side is ${steepFront ? 'the front' : 'the back'} (the ${steepFront ? 'rise' : 'fall'}, ${Math.min(T1, T2)} μs, becomes ${Math.min(T1, T2) * v} m).`,
        check: md`In the snapshot the front sits at $${u} = ${zf}$ m, the farthest point, and holds the start of the recording ✓. Lengths: rise $${T1 * v}$ m, fall $${T2 * v}$ m, total $v_p(${T1 + T2}\ \mu\text{s}) = ${(T1 + T2) * v}$ m ✓.`,
      }),
    };
  };

  // HW 7 #5 style: the condition that makes a candidate a solution, with numbers
  GENS.t14_cand = () => {
    const kind = ri(0, 2);
    const er = pick([1, 4, 9]), m = pick([1, 2, 3]);
    const w = 3e8 * m, kk = m * Math.sqrt(er), v = 3e8 / Math.sqrt(er);   // ω, ω√(με) in rad/m, v_p
    const med = er === 1 ? 'free space' : `a lossless medium with $\\epsilon = ${er}\\epsilon_0$, $\\mu = \\mu_0$`;
    if (kind === 0) {
      const [cx, cy, th] = pick([[0.6, 0.8, Math.atan2(0.8, 0.6)], [0.8, 0.6, Math.atan2(0.6, 0.8)], [0.5, Math.sqrt(3) / 2, Math.PI / 3], [Math.sqrt(3) / 2, 0.5, Math.PI / 6]]);
      const bx = cx * kk, by = cy * kk, deg = th * 180 / Math.PI;
      return {
        title: 'An oblique plane wave',
        q: md`In ${med}, $\mathbf E = E_0\cos(\omega t - \beta_xx - \beta_yy)\,\hat z$ with $\omega = ${p(w)}$ rad/s and $\beta_x = ${f(bx)}$ rad/m. Find the $\beta_y > 0$ that makes it a solution of $\nabla^2\mathbf E = \mu\epsilon\,\partial^2\mathbf E/\partial t^2$, the angle between its direction of travel and $+\hat x$, and its speed along that direction.`,
        parts: [N('\\beta_y', by, 'rad/m'), N('\\theta', deg, 'deg'), N('v_p', v, 'm/s')],
        hints: ['Substitute: $\\nabla^2$ brings down $-(\\beta_x^2 + \\beta_y^2)$, and $\\partial^2/\\partial t^2$ brings down $-\\omega^2$.', 'It travels along $\\beta_x\\hat x + \\beta_y\\hat y$; along that direction the speed is $\\omega/\\sqrt{\\beta_x^2 + \\beta_y^2}$.'],
        sol: sol({
          eq: md`$\nabla^2\mathbf E = -(\beta_x^2 + \beta_y^2)\mathbf E$ and $\mu\epsilon\,\partial^2\mathbf E/\partial t^2 = -\omega^2\mu\epsilon\,\mathbf E$, so $\beta_x^2 + \beta_y^2 = \omega^2\mu\epsilon$.`,
          sym: md`$\beta_y = \sqrt{\omega^2\mu\epsilon - \beta_x^2}$, $\;\theta = \tan^{-1}(\beta_y/\beta_x)$, $\;v_p = \omega/\sqrt{\beta_x^2 + \beta_y^2} = 1/\sqrt{\mu\epsilon}$.`,
          sub: md`$\omega\sqrt{\mu\epsilon} = \dfrac{(${p(w)})\sqrt{${er}}}{3\times10^8} = ${f(kk)}$ rad/m, so $\beta_y = \sqrt{${f(kk)}^2 - ${f(bx)}^2} = ${f(by)}$ rad/m, $\theta = \tan^{-1}(${f(by)}/${f(bx)}) = ${f(deg)}°$, $v_p = ${p(v)}$ m/s.`,
          ans: md`$\beta_y = ${f(by)}$ rad/m, $\theta = ${f(deg)}°$, $v_p = ${p(v)}$ m/s.`,
          check: md`The fronts of constant phase, $\beta_xx + \beta_yy = $ const, are lines perpendicular to $(\beta_x, \beta_y)$; $\mathbf E = E_z\hat z$ is perpendicular to the travel, so $\nabla\cdot\mathbf E = 0$ ✓.`,
        }),
      };
    }
    if (kind === 1) {
      const WHY = ['it is a function of $\\omega t - \\beta z$ alone, a shape moving toward $+z$', 'it oscillates in time at every fixed point', 'it never is: $\\cos^2$ is not a solution'];
      return {
        title: 'A squared cosine',
        q: md`In ${med}, is $\mathbf E = E_0\cos^2(\omega t - \beta z)\,\hat x$ with $\omega = ${p(w)}$ rad/s a solution of the wave equation? Find the $\beta$ that makes it one, the frequency in Hz at which the field oscillates at a fixed point, and say why it works.`,
        parts: [N('\\beta', kk, 'rad/m'), N('f_{\\text{osc}}', w / Math.PI, 'Hz'), { lbl: 'It is a solution because', mc: WHY, a: 0, fixed: true, why: [null, 'Oscillating in time is not enough: $e^{-z}\\cos\\omega t$ oscillates at every point and is not a solution. What counts is that $z$ and $t$ enter only through $t - z/v_p$.', 'It is one, provided $\\omega/\\beta = v_p$.'] }],
        hints: ['Any $F(\\omega t - \\beta z)$ moves at $\\omega/\\beta$; set that equal to $v_p = c/\\sqrt{\\epsilon_r}$.', '$\\cos^2\\phi = \\tfrac12 + \\tfrac12\\cos2\\phi$: at a fixed point it oscillates at $2\\omega$.'],
        sol: sol({
          eq: md`$\cos^2(\omega t - \beta z) = F(t - z\beta/\omega)$ moves at $\omega/\beta$; the wave equation needs $\omega/\beta = 1/\sqrt{\mu\epsilon}$.`,
          sym: md`$\beta = \omega\sqrt{\mu\epsilon} = \omega\sqrt{\epsilon_r}/c$. And $\cos^2\phi = \frac12 + \frac12\cos2\phi$, so at fixed $z$ the field oscillates at $2\omega$: $f_{\text{osc}} = 2\omega/2\pi = \omega/\pi$.`,
          sub: md`$\beta = \dfrac{(${p(w)})\sqrt{${er}}}{3\times10^8} = ${f(kk)}$ rad/m, $\;f_{\text{osc}} = \dfrac{${p(w)}}{\pi} = ${f(w / Math.PI)}$ Hz.`,
          ans: md`Yes, with $\beta = ${f(kk)}$ rad/m; it oscillates at ${f(w / Math.PI)} Hz at a fixed point.`,
          check: md`Both $2\omega$ and $2\beta$ doubled: the speed $2\omega/2\beta = v_p$ is unchanged ✓. The constant $\frac12E_0$ is a static field that also satisfies the equation.`,
        }),
      };
    }
    const WHY2 = ['two equal waves moving in opposite directions: a standing wave', 'a single wave moving toward $+z$', 'not a wave: it does not solve the wave equation'];
    return {
      title: 'A standing wave',
      q: md`In ${med}, $\mathbf E = E_0\cos(\omega t)\cos(\beta z)\,\hat x$ with $\omega = ${p(w)}$ rad/s. Find the $\beta > 0$ that makes it a solution of the wave equation, the distance between neighboring points where $\mathbf E$ is always zero, and what it is.`,
      parts: [N('\\beta', kk, 'rad/m'), N('\\Delta z', Math.PI / kk, 'm'), { lbl: 'It is', mc: WHY2, a: 0, fixed: true, why: [null, 'It contains $\\cos(\\omega t + \\beta z)$ as well, which moves toward $-z$.', 'It solves it, as a sum of two solutions.'] }],
      hints: ['$\\cos\\omega t\\cos\\beta z = \\tfrac12\\cos(\\omega t - \\beta z) + \\tfrac12\\cos(\\omega t + \\beta z)$.', 'Each part needs $\\omega/\\beta = v_p$. The field is zero for all $t$ where $\\cos\\beta z = 0$: those points are $\\pi/\\beta$ apart.'],
      sol: sol({
        eq: md`$\cos\omega t\cos\beta z = \frac12\cos(\omega t - \beta z) + \frac12\cos(\omega t + \beta z)$; each is a solution when $\omega/\beta = 1/\sqrt{\mu\epsilon}$.`,
        sym: md`$\beta = \omega\sqrt{\epsilon_r}/c$. Zeros for all $t$ where $\cos\beta z = 0$, i.e. $\beta z = \frac\pi2 + n\pi$, spaced $\Delta z = \pi/\beta$.`,
        sub: md`$\beta = \dfrac{(${p(w)})\sqrt{${er}}}{3\times10^8} = ${f(kk)}$ rad/m, $\;\Delta z = \dfrac{\pi}{${f(kk)}} = ${f(Math.PI / kk)}$ m.`,
        ans: md`$\beta = ${f(kk)}$ rad/m, zeros every ${f(Math.PI / kk)} m: a standing wave.`,
        check: md`Substituting directly: $\partial_z^2 \to -\beta^2$, $\mu\epsilon\,\partial_t^2 \to -\omega^2\mu\epsilon$: equal when $\beta = \omega\sqrt{\mu\epsilon}$ ✓. The zeros (nodes) never move; nothing travels.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t14-wave-eq'] = [
    Q(md`A wave travels in a medium with $\epsilon_r = 4$, $\mu_r = 1$. Its speed is…`,
      ['$1.5\\times10^8$ m/s', '$7.5\\times10^7$ m/s', '$6\\times10^8$ m/s', '$3\\times10^8$ m/s'], 0,
      [null, 'That divides by $\\epsilon_r$, not $\\sqrt{\\epsilon_r}$.', 'A denser medium is slower: divide by $\\sqrt{\\epsilon_r}$.', 'That is vacuum.'],
      md`$v_p = c/\sqrt{\mu_r\epsilon_r} = 3\times10^8/2$.`),
    Q(md`The intrinsic impedance of a medium with $\epsilon_r = 4$, $\mu_r = 1$ is…`,
      ['$60\\pi\\ \\Omega$', '$240\\pi\\ \\Omega$', '$30\\pi\\ \\Omega$', '$120\\pi\\ \\Omega$'], 0,
      [null, 'That multiplies by $\\sqrt{\\epsilon_r}$; $\\eta = \\eta_0\\sqrt{\\mu_r/\\epsilon_r}$ shrinks.', 'That divides by $\\epsilon_r$, not $\\sqrt{\\epsilon_r}$.', 'That is free space.'],
      md`$\eta = 120\pi\sqrt{1/4} = 60\pi \approx 188\ \Omega$.`),
    Q(md`$E = F(z - v_pt)$, for any shape $F$, moves…`,
      ['toward $+z$ at $v_p$', 'toward $-z$ at $v_p$', 'toward $+z$ at $1/v_p$', 'it depends on $F$'], 0,
      [null, 'A fixed argument $z - v_pt = $ const gives $z = v_pt + $ const: increasing $z$.', 'The speed is the ratio of coefficients, $v_p/1$.', 'The shape does not affect the direction or speed.'],
      md`$F(z - v_pt) = F(-v_p(t - z/v_p))$: a function of $t - z/v_p$, a forward wave.`),
    Q(md`A field is the sum of a forward and a backward wave. At a point, $|\mathbf E|/|\mathbf H|$ is…`,
      ['not necessarily $\\eta$', 'always $\\eta$', 'always $2\\eta$', 'always zero'], 0,
      [null, 'Each part has ratio $\\eta$, but their $\\mathbf H$ parts have opposite signs, so the totals do not.', 'Nothing forces a factor of 2.', 'Both fields can be nonzero at once.'],
      md`$E_x = f + g$ but $\eta H_y = f - g$. Only a single traveling wave has $|\mathbf E| = \eta|\mathbf H|$.`),
    Q(md`Two probes on the $z$-axis, 600 m apart, record a forward wave in free space. The downstream recording is the upstream one…`,
      ['delayed by 2 μs', 'advanced by 2 μs', 'delayed by 0.5 μs', 'reversed in time'], 0,
      [null, 'Downstream sees it later, not earlier.', '600 m at 300 m/μs is 2 μs.', 'Recordings at two points are copies, shifted in time; only snapshot versus recording is reversed.'],
      md`$E(z_2, t) = E(z_1,\ t - (z_2 - z_1)/c)$, a delay of $600/300 = 2\ \mu$s.`),
    Q(md`Is $E_x = z^2 + v_p^2t^2$ a solution of $\partial^2E_x/\partial z^2 = (1/v_p^2)\,\partial^2E_x/\partial t^2$?`,
      ['yes: it equals $\\frac12(z - v_pt)^2 + \\frac12(z + v_pt)^2$', 'no: it is not a function of $z - v_pt$', 'no: it grows without bound', 'only at $t = 0$'], 0,
      [null, 'It need not be one function of $z - v_pt$; a sum of a forward and a backward part also works.', 'The wave equation does not require boundedness.', 'Both sides equal 2 everywhere.'],
      md`$\partial_z^2 = 2$ and $(1/v_p^2)\partial_t^2 = (1/v_p^2)(2v_p^2) = 2$. (By contrast $z^2 - v_p^2t^2$ gives $2 \ne -2$.)`),
    Q(md`$E = e^{-(x + ct)^2/a^2}$ is a pulse that…`,
      ['moves toward $-x$ at $c$', 'moves toward $+x$ at $c$', 'stays at $x = 0$ and decays in time', 'spreads out as it travels'], 0,
      [null, 'Its peak sits at $x = -ct$.', 'At a fixed $x$ it rises and falls, but its peak moves: $x = -ct$.', 'A function of $x + ct$ alone keeps its shape exactly.'],
      md`Constant argument $x + ct$ means $x = -ct + $ const.`),
    Q(md`A probe records a symmetric triangle lasting $T$ as a forward wave passes. A snapshot of that pulse is…`,
      ['a symmetric triangle of length $v_pT$', 'a symmetric triangle of length $T/v_p$', 'an asymmetric triangle', 'a triangle of length $v_pT/2$'], 0,
      [null, 'Units: length is speed times time.', 'Reversing a symmetric shape leaves it symmetric.', 'The whole duration $T$ maps to length $v_pT$.'],
      md`The snapshot is the recording reversed and stretched by $v_p$; a symmetric shape looks the same reversed.`),
    Q(md`Deriving the wave equation for $E_x(z,t)$ uses…`,
      ['Faraday\'s law and Ampère–Maxwell with $\\mathbf J = 0$', 'Gauss\'s law and Faraday\'s law', 'only Ampère–Maxwell', 'Gauss\'s law for $\\mathbf B$ and continuity'], 0,
      [null, 'Gauss only shows the fields are transverse; it cannot couple $\\mathbf E$ to $\\mathbf H$.', 'One curl equation alone has two unknowns; you need both.', 'Neither couples $\\mathbf E$ and $\\mathbf H$ in time.'],
      md`Faraday: $\partial_zE_x = -\mu\,\partial_tH_y$. Ampère–Maxwell: $\partial_zH_y = -\epsilon\,\partial_tE_x$. Eliminating $H_y$ gives the wave equation.`),
    Q(md`Doubling $\mu_r$ (same $\epsilon_r$) changes the wave speed by a factor…`,
      ['$1/\\sqrt2$', '$1/2$', '$\\sqrt2$', '1: speed depends only on $\\epsilon$'], 0,
      [null, 'The speed goes as $1/\\sqrt{\\mu\\epsilon}$: a square root.', 'Larger $\\mu$ means slower, not faster.', '$v_p = 1/\\sqrt{\\mu\\epsilon}$ depends on both.'],
      md`$v_p \propto 1/\sqrt{\mu}$.`),
    Q(md`In a lossless medium, a sharp pulse and a smooth pulse launched together…`,
      ['arrive together, each with its shape unchanged', 'the sharp one arrives first', 'the smooth one arrives first', 'both spread into the same shape'], 0,
      [null, 'Every shape moves at $v_p$: the wave equation does not care about sharpness.', 'Every shape moves at the same $v_p$.', 'Any $f(t - z/v_p)$ keeps its shape exactly.'],
      md`d'Alembert: any $f(t - z/v_p)$ is a solution, so every shape moves rigidly at the same speed.`),
    Q(md`Which of these moves toward $-z$?`,
      ['$\\cos(\\omega t + \\beta z)$', '$\\cos(\\omega t - \\beta z)$', '$\\cos(\\beta z - \\omega t)$', '$u[z - v_pt]$'], 0,
      [null, 'Opposite signs: toward $+z$.', 'That is $\\cos(\\omega t - \\beta z)$ again (cosine is even): toward $+z$.', 'A fixed argument gives $z = v_pt + $ const: toward $+z$.'],
      md`$\omega t + \beta z = $ const means $z = -(\omega/\beta)t + $ const.`),
    Q(md`For $E_x = f(t - z/v_p)$, a recording at fixed $z$ is $f$ delayed by $z/v_p$. A snapshot at fixed $t$ is…`,
      ['$f$ reversed and stretched by $v_p$', '$f$ itself, stretched by $v_p$', '$f$ compressed by $v_p$', 'the derivative of $f$'], 0,
      [null, 'As $z$ grows the argument falls: the snapshot runs through $f$ backward.', 'Stretched, yes, but the argument decreases as $z$ increases.', 'Snapshots are values of $f$, not of $f\'$.'],
      md`At fixed $t_0$, $f(t_0 - z/v_p)$: increasing $z$ means decreasing argument.`),
    Q(md`The units of $\mu\epsilon$ are…`,
      ['s²/m²', 'm²/s²', 's/m', 'Ω'], 0,
      [null, 'That is $v_p^2$; $\\mu\\epsilon = 1/v_p^2$.', 'That is $\\sqrt{\\mu\\epsilon}$, one over a speed.', 'Ohms are $\\sqrt{\\mu/\\epsilon}$.'],
      md`(H/m)(F/m) = (Ω·s/m)(s/Ω·m) = s²/m².`),
    Q(md`A probe at $z = 0$ records $E = 10\cos(2\pi\times10^6t)$ V/m from a forward wave in free space. At $z = 150$ m the recording is…`,
      ['$-10\\cos(2\\pi\\times10^6t)$ V/m', '$10\\cos(2\\pi\\times10^6t)$ V/m', '$10\\sin(2\\pi\\times10^6t)$ V/m', '$-10\\sin(2\\pi\\times10^6t)$ V/m'], 0,
      [null, 'The delay is $150/300 = 0.5\\ \\mu$s, half a period at 1 MHz: the signal is inverted.', 'A quarter-period delay would give $+\\sin$; this one is half a period.', 'That is a quarter-period advance (or three-quarter delay); this delay is half a period.'],
      md`$E(150, t) = 10\cos\big(2\pi10^6(t - 0.5\times10^{-6})\big) = 10\cos(2\pi10^6t - \pi) = -10\cos(2\pi10^6t)$.`),
    Q(md`[[fig:trap]]
      Lecture 18: the recording above belongs to a wave moving toward $-z$ at 100 m/s. At $z = 200$ m, $t = 0.2$ s, $E = $`,
      ['0.9 V/m', '0.2 V/m', '0', '1 V/m'], 0,
      [null, 'That reads the recording at $t = 0.2$ s, ignoring the 200 m.', 'That treats the wave as moving toward $+z$: the argument would be $0.2 - 2 < 0$.', 'The flat top lasts from 1 to 2 s; the argument here is 2.2 s, on the falling edge.'],
      md`Toward $-z$: $E(z,t) = E(0,\ t + z/v) = E(0,\ 0.2 + 2) = E(0, 2.2) = 1 - 0.2/2 = 0.9$ V/m. The point $z = 200$ m is upstream: it saw the wave 2 s before the origin did.`, { figs: { trap: { svg: trapFig(), cap: 'The recording E(0, t) at z = 0.' } } }),
    Q(md`A uniform plane wave has $\mathbf E = E_x\hat x$ and travels toward $-z$. If $E_x > 0$ at some point, $H_y$ there is…`,
      ['negative', 'positive', 'zero', 'positive or negative depending on $\\eta$'], 0,
      [null, 'Then $\\mathbf E\\times\\mathbf H$ would point along $+\\hat z$.', 'A single traveling wave has $|\\mathbf H| = |\\mathbf E|/\\eta \\ne 0$.', '$\\eta$ is positive; it fixes the size, not the sign.'],
      md`$\hat x\times(-\hat y) = -\hat z$: for a backward wave $H_y = -E_x/\eta$.`),
    Q(md`The fields of a uniform plane wave traveling along $z$ in a source-free region…`,
      ['are perpendicular to each other and to $\\hat z$', 'have components along $\\hat z$ that carry the energy', 'are parallel to each other', 'point along $\\hat z$ when the wave is strong'], 0,
      [null, '$\\nabla\\cdot\\mathbf E = \\nabla\\cdot\\mathbf B = 0$ with only $z$-dependence forbids $z$-components.', 'Faraday makes $\\partial_zE_x$ track $\\partial_tH_y$: $\\mathbf E\\perp\\mathbf H$.', 'Amplitude never changes the geometry.'],
      md`Transverse: $\mathbf E\perp\mathbf H\perp\hat z$, with $\mathbf E\times\mathbf H$ along the travel.`),
  ];
})();

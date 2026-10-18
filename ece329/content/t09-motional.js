/* Topic 9 — Motional emf: moving and rotating loops (Lecture 14). The force on the charges of a moving conductor,
   vBℓ for a bar, rails and a sliding bar (Lecture 14's example), the force on the bar and the energy balance, the rail
   gun, loops moving through a nonuniform field (HW 6 #3, Summer 2018 #2, Summer 2020 #3), and rotating loops: the
   generator (HW 6 #2, #6). Stationary loops are Topic 8; voltmeters are Topic 10. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick } = U;

  // ---------------------------------------------------------------- figure helpers
  // a resistor between two points: straight leads and a zigzag in the middle
  function zig(g, x1, y1, x2, y2, o = {}) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux;
    const len = Math.min(o.len || 34, L * 0.6), a = (L - len) / 2, n = 6, amp = o.amp || 6;
    const pts = [[x1, y1], [x1 + ux * a, y1 + uy * a]];
    for (let i = 1; i < n; i++) { const s = a + len * i / n, k = (i % 2 ? 1 : -1) * amp; pts.push([x1 + ux * s + px * k, y1 + uy * s + py * k]); }
    pts.push([x1 + ux * (a + len), y1 + uy * (a + len)], [x2, y2]);
    g.pl(pts, { cls: o.cls || '' });
    return g;
  }

  // Lecture 14's example, top view: x to the right, z up, so y points into the page (B = y: crosses)
  function railsFig() {
    const g = PF.fig({ scale: 1.2, alt: 'two horizontal rails 2 m apart joined on the left by R2; a bar R1 slides to the right at 3 m/s; B points into the page; the current runs counterclockwise: up the bar, left along the top rail, down through R2' });
    const x0 = 34, x1 = 292, yt = 34, yb = 134, xb = 214;
    g.marks('x', 66, 52, 270, 116, 6, 3);
    g.line(x0, yt, x1, yt, { cls: 'thick' });
    g.line(x0, yb, x1, yb, { cls: 'thick' });
    zig(g, x0, yt, x0, yb);
    g.line(xb, yt - 8, xb, yb + 8, { cls: 'thick' });
    g.head(xb, 90, 0, -1, { hs: 9 });                       // current up the bar
    g.head(130, yt, -1, 0, { hs: 9 });                      // left along the top rail
    g.head(130, yb, 1, 0, { hs: 9 });                       // right along the bottom rail
    g.arrow(xb + 4, 14, xb + 44, 14, { hs: 7 });
    g.label(xb + 48, 14, '\\mathbf v', 'l');
    g.label(x0 - 10, 84, 'R_2', 'r');
    g.label(xb, yb + 14, 'R_1 = 1\\ \\Omega', 't', 'small');
    g.label(x0 + 6, yt - 6, '\\mathbf B = \\hat y\\ \\text{T (into page)}', 'bl', 'small');
    g.dim(x1 + 12, yt, x1 + 12, yb, '2\\ \\text{m}');
    return g.svg();
  }

  // a square loop drifting right through a field (out of the page) that grows with x: bigger dots = stronger B
  function gradFig() {
    const g = PF.fig({ scale: 1.25, alt: 'a square loop moving to the right through a field pointing out of the page whose strength grows to the right; the circulation C is counterclockwise' });
    for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) g.dot(20 + i * 34, 20 + j * 34, 0.8 + i * 0.48, { cls: 'dimfill' });
    g.loopRect(97, 30, 78, 80, { dir: 'ccw' });
    g.arrow(180, 71, 214, 71, { hs: 7 });
    g.label(217, 71, '\\mathbf v', 'l');
    g.label(181, 102, 'C', 'l', 'small');
    g.arrow(20, 150, 70, 150, { cls: 'dim', hs: 6 });
    g.label(74, 150, 'x', 'l', 'small accent');
    return g.svg();
  }

  // top view of a turning loop: the loop is the line through the shaft, n its normal at angle theta from B
  function rotFig() {
    const g = PF.fig({ scale: 1.2, alt: 'top view of a loop turning about a vertical shaft in a uniform horizontal B; the loop is seen edge-on as a line, its normal n makes angle theta with B' });
    const cx = 130, cy = 100, th = 30 * Math.PI / 180, Lh = 68;
    g.arrow(30, 24, 236, 24, { cls: 'dim', hs: 7 });
    g.arrow(30, 176, 236, 176, { cls: 'dim', hs: 7 });
    g.label(240, 24, '\\mathbf B', 'l');
    const ex = Math.cos(th + Math.PI / 2), ey = -Math.sin(th + Math.PI / 2);
    g.line(cx - Lh * ex, cy - Lh * ey, cx + Lh * ex, cy + Lh * ey, { cls: 'thick' });
    g.dot(cx, cy, 3);
    g.arrow(cx, cy, cx + 54 * Math.cos(th), cy - 54 * Math.sin(th), { hs: 8 });
    g.label(cx + 58 * Math.cos(th), cy - 58 * Math.sin(th), '\\hat n', 'l');
    g.line(cx, cy, cx + 44, cy, { cls: 'dim dash thin' });
    g.angle(cx, cy, 30, 0, 30, '\\theta');
    g.arc(cx, cy, 20, 160, 270, { cls: 'dim' });
    const a = 270 * Math.PI / 180;
    g.head(cx + 20 * Math.cos(a), cy - 20 * Math.sin(a), -Math.sin(a), -Math.cos(a), { hs: 6, cls: 'dim' });
    g.label(cx - 30, cy + 22, '\\omega', 'r', 'small');
    return g.svg();
  }

  // the generator: flux (dashed) and emf (solid) over one turn
  function genPlot() {
    const P = Math.PI;
    return PF.plot({
      w: 330, h: 170, x: [0, 2 * P], y: [-1.3, 1.3], zero: true, xl: '\\omega t',
      xt: [[P / 2, '\\tfrac{\\pi}{2}'], [P, '\\pi'], [3 * P / 2, '\\tfrac{3\\pi}{2}'], [2 * P, '2\\pi']],
      yt: [[1, '1'], [-1, '-1']],
      curves: [{ f: Math.cos, cls: 'dash dim', lab: '\\Psi/\\Psi_{\\max}', labAt: 0.25, dy: -12 }, { f: Math.sin, lab: '\\emf/\\emf_{\\max}', labAt: 1.75, dy: -12 }],
    });
  }

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u3', {
    id: 't9-motional', topic: 9, ref: 'Lecture 14', title: 'Motional emf: moving and rotating loops',
    steps: [
      R(md`
        !!key Why you care
          Moving paths are on every Exam 2: a loop drifting through a nonuniform field (Summer 2018 #2, Summer 2020 #3, HW 6 #3), a bar on rails and a rail gun (HW 6 #5, Lecture 14's example), a small loop moving along another loop's axis (Summer 2017 #2(b)), a turning loop (HW 6 #2, #6). Same law as [Topic 8](#/l/t8-faraday); the flux now changes because the path moves.

        ### Notation

        - $\mathbf v$: velocity of a piece of the conductor, in m/s. Its charges move with it.
        - $q\mathbf v\times\mathbf B$: the magnetic force on a charge $q$ carried along at $\mathbf v$, in N. Per unit charge, $\mathbf v\times\mathbf B$ is a push in V/m, like an electric field.
        - $\ell$: length of a moving bar (the distance between the rails), in m. $x(t)$: its position.
        - $\emf = \oint_C(\mathbf E + \mathbf v\times\mathbf B)\cdot d\mathbf l$: the emf of a path that moves, in V. $C$ and $d\mathbf S$ tied by the right-hand rule, as in Topic 8.
        - $R$: total resistance around the circuit, **including the bar's own**, in Ω.
        - $\mathbf F = I\boldsymbol\ell\times\mathbf B$: force on a straight segment carrying current $I$; $\boldsymbol\ell$ points along the current, length $\ell$. In N.
        - $\hat n$, $\theta(t)$, $\omega$: a turning loop's normal, its angle from $\mathbf B$, and the angular speed in rad/s. $N$: turns. $P$: power, in W.

        ### The idea

        A conductor moving through $\mathbf B$ drags its charges along, and each one feels $q\mathbf v\times\mathbf B$. Summed around a closed path, that push is an emf. It equals the rate at which the moving path sweeps flux, so Faraday's rule still holds:
        $$\emf = \oint_C(\mathbf E + \mathbf v\times\mathbf B)\cdot d\mathbf l = -\frac{d\Psi}{dt}$$
        Use the right side for whole loops (write $\Psi(t)$, differentiate). Use $\mathbf v\times\mathbf B$ to see where the emf sits and which way it pushes. They are the same emf: never add them.
      `),
      R(md`
        ### Step 1: a moving bar is a battery

        A bar of length $\ell$ moves at $\mathbf v$ perpendicular to itself and to $\mathbf B$. Every charge in it feels $\mathbf v\times\mathbf B$ along the bar. Positive charge collects at the end $\mathbf v\times\mathbf B$ points to, negative at the other, until their field cancels the push inside. The bar is now a battery:
        $$\emf_{\text{bar}} = \int_{\text{bar}}(\mathbf v\times\mathbf B)\cdot d\mathbf l = vB\ell \qquad (\mathbf v,\ \mathbf B,\ \text{bar mutually perpendicular})$$
        Its + terminal is the end $\mathbf v\times\mathbf B$ points to. Only the part of $\mathbf v\times\mathbf B$ along the bar counts: a bar sliding along its own length, or moving along $\mathbf B$, has no emf.
      `),
      Q(md`**Predict.** A bar lies along $\hat y$ and moves with $\mathbf v = v\hat x$ through $\mathbf B = B\hat z$ ($v, B > 0$). Positive charge collects at…`,
        ['the $-y$ end', 'the $+y$ end', 'neither end: an emf needs a closed loop', 'the end that leads the motion'], 0,
        [null, '$\\hat x\\times\\hat z = -\\hat y$: the push on positive charge points to $-y$. This is where electrons collect.', 'The force on each charge exists without a loop; charge piles up at the ends of an open bar.', 'The bar moves sideways; neither end leads. The direction comes from $\\mathbf v\\times\\mathbf B$.'],
        md`$\mathbf v\times\mathbf B = vB(\hat x\times\hat z) = -vB\hat y$. Positive charge is pushed to the $-y$ end, which becomes the + terminal, with $vB\ell$ across the bar.`),
      RF(md`
        ### Step 2: rails and a sliding bar

        [[fig:rails]]

        Rails close the circuit, and the bar's emf drives a current. The flux rule gives the same number: the circuit's area is $\ell x(t)$, so $|\Psi| = B\ell x$ and $|d\Psi/dt| = B\ell v$.

        **Lecture 14's example.** Bar $R_1 = 1\ \Omega$, $\mathbf v = 3\hat x$ m/s, rails 2 m apart, load $R_2 = 2\ \Omega$ at $x = 0$, $\mathbf B = \hat y$ T. With $x$ right and $z$ up, $\hat y$ points into the page. Take $C$ counterclockwise on the page: the RHR puts $d\mathbf S = -\hat y$ (out of the page).
        $$\Psi = \int_S\mathbf B\cdot d\mathbf S = (1)(-1)(2\,\text{m})(3t\,\text{m}) = -6t\ \text{Wb} \qquad \emf = -\frac{d\Psi}{dt} = +6\ \text{V along } C$$
        $I = 6\,\text{V}/(1 + 2)\,\Omega = 2$ A, counterclockwise. Check: in the bar $\mathbf v\times\mathbf B = 3\hat x\times\hat y = 3\hat z$ V/m, up the page, 3 V/m × 2 m = 6 V. ✓
      `, { rails: { svg: railsFig(), cap: 'Lecture 14: the bar is the battery (v × B pushes up in it); the current returns down through R₂.' } }),
      Q(md`**Predict.** In Lecture 14's example the bar now moves **left** at 3 m/s (still on the rails). The current through $R_2$ flows…`,
        ['up the page ($+z$)', 'down the page ($-z$), as before', 'nowhere: the flux is unchanged', 'up, but only if $R_1 > R_2$'], 0,
        [null, 'Reversing $\\mathbf v$ reverses $\\mathbf v\\times\\mathbf B$ and $d\\Psi/dt$, so the current reverses.', 'The area now shrinks, so the flux changes: there is an emf.', 'The resistances set the size of the current, not its direction.'],
        md`$\mathbf v\times\mathbf B = -3\hat x\times\hat y = -3\hat z$: the bar pushes charge down, so the current runs clockwise on the page and **up** through $R_2$. Lenz: the into-page flux shrinks, the current tops it up (clockwise makes $\mathbf B$ into the page inside).`),
      R(md`
        ### Step 3: the force on the bar, and where the energy comes from

        The current in the bar feels $\mathbf F = I\boldsymbol\ell\times\mathbf B$. For an **induced** current it always points against $\mathbf v$: Lenz's law in mechanical form. To keep $v$ constant you push with
        $$F = I\ell B = \frac{B^2\ell^2v}{R} \qquad Fv = \frac{(B\ell v)^2}{R} = \frac{\emf^2}{R} = I^2R$$
        Your mechanical power equals the Joule heat. The magnetic force does no net work; it hands your work to the charges. Let go, and the bar slows down.

        **Rail gun (HW 6 #5(d)).** Now drive a current $I$ through the bar yourself. The same $\mathbf F = I\boldsymbol\ell\times\mathbf B$ accelerates it: $\mathbf a = I\boldsymbol\ell\times\mathbf B/M$, magnitude $I\ell B/M$. The direction is whatever the cross product says; it is not "against the motion" any more.
      `),
      Q(md`**Predict.** Rails run along $x$ from a source at $x = 0$. The current goes out along the bottom rail, **up** the bar ($+\hat y$), and back along the top rail. $\mathbf B = B_0\hat z$ (out of the page). The bar accelerates…`,
        ['along $+\\hat x$, away from the source', 'along $-\\hat x$, toward the source', 'along $+\\hat y$, up the page', 'not at all: the forces on the two rails cancel'], 0,
        [null, '$\\hat y\\times\\hat z = +\\hat x$, not $-\\hat x$.', 'A force on a current along $\\hat y$ in a field along $\\hat z$ is perpendicular to both.', 'The rails are fixed; the force that matters is the one on the movable bar.'],
        md`$\mathbf F = I\ell\,\hat y\times B_0\hat z = I\ell B_0\,\hat x$. The loop's own field inside is out of the page, along $\mathbf B$; a loop pushed by a parallel field tries to grow, so the bar is shot away from the source.`),
      RF(md`
        ### Step 4: loops moving through a nonuniform field

        [[fig:grad]]

        A loop translating through a **uniform** field keeps its flux: no emf (Topic 8). In a field that varies with position it does not. For a field linear in $x$, the average over a symmetric loop is the value at its center, so exactly
        $$\Psi(t) = B\big(x_c(t)\big)A \qquad \emf = -A\,\frac{dB}{dx}\,v$$
        Motional view: the front and back edges each carry $vB\ell$, pointing opposite ways around the loop; only their difference survives.

        **Summer 2018 #2 and Summer 2020 #3.** $\mathbf B = 25\times10^{-6}(1 + x/L)$ T with $L = 1000$ m (along $\hat y$ in 2018, $\hat z$ in 2020), a 1 m × 1 m loop, $\mathbf v = 4\hat x$ m/s. Most flux: loop face-on to $\mathbf B$. With $d\mathbf S$ along $\mathbf B$:
        $$\Psi(t) = 25\times10^{-6}\Big(1 + \frac{4t}{1000}\Big)\ \text{Wb} \qquad \emf = -\frac{25\times10^{-6}\cdot4}{1000} = -10^{-7}\ \text{V}$$
        Negative: the current runs against $C$. For 2 Ω, $|I| = 5\times10^{-8}$ A. (The Summer 2020 key gives $\emf$ in Wb and $I = -5\times10^{-7}$ A; the right values are $-10^{-7}$ V and $-5\times10^{-8}$ A.) The emf is constant: $B$ is linear in $x$ and $v$ is constant. **Zero current:** turn the loop edge-on to $\mathbf B$; its flux is then zero wherever it is.
      `, { grad: { svg: gradFig(), cap: 'Bigger dots, stronger B out of the page. Moving right, the loop gains flux, so the current runs clockwise, against C.' } }),
      Q(md`**Predict.** HW 6 #3: a loop of radius 1 m in the $xy$-plane moves with $\mathbf v = 2\hat x$ m/s through $\mathbf B = 25\times10^{-6}(1 - x/L)\hat z$ T. Seen from $+z$, the induced current is…`,
        ['counterclockwise', 'clockwise', 'zero: the field is static', 'zero: $r \\ll L$ makes the field uniform across the loop'], 0,
        [null, 'Clockwise would make $-\\hat z$ field inside, speeding up the loss of upward flux.', 'A static field still changes along the loop\'s path, so the flux through it changes.', '$r \\ll L$ lets you use the center value of $B$; it does not make $B$ the same at every position the loop visits.'],
        md`Moving to larger $x$, the loop enters weaker upward field: $\Psi_z$ shrinks. The current tops it up with upward $\mathbf B$ inside: counterclockwise from $+z$. In numbers, $\emf = +A\,v\,B_0/L = \pi\cdot2\cdot25\times10^{-6}/1000 = 1.57\times10^{-7}$ V along the counterclockwise $C$.`),
      RF(md`
        ### Step 5: turning loops, the generator

        [[fig:rot]]

        A coil of $N$ turns and area $A$ turns at constant $\omega$ in a uniform $\mathbf B$. With $\theta = \omega t$ the angle between its normal and $\mathbf B$:
        $$\Psi(t) = \mathbf B\cdot\hat n\,A = BA\cos\omega t \qquad \emf = -N\frac{d\Psi}{dt} = NBA\omega\sin\omega t$$

        [[fig:gen]]

        The emf peaks when the coil is **edge-on** ($\Psi = 0$, changing fastest) and is zero when it is face-on ($\Psi$ at its peak, momentarily constant). Into a resistor $R$: $P(t) = \emf^2/R$, average $\overline P = (NBA\omega)^2/2R$. The torque on the shaft supplies it. HW 6 #2 and #6 are this calculation with the angle defined by their own figures: write $\hat n(t)$ first, then $\Psi = \mathbf B\cdot\hat nA$.
      `, { rot: { svg: rotFig(), cap: 'Top view: the loop (thick line) turns about the shaft; its normal makes θ = ωt with B.' }, gen: { svg: genPlot(), cap: 'Flux (dashed) and emf (solid): the emf is largest where the flux crosses zero.' } }),
      Q(md`**Predict.** A generator coil turns at constant $\omega$. At the instant its plane is **perpendicular** to $\mathbf B$ (face-on), its emf is…`,
        ['zero', '$NBA\\omega$, its peak', '$NBA\\omega/\\sqrt2$', 'not defined: the flux is at its peak'], 0,
        [null, 'The peak comes a quarter turn later, edge-on, where $\\Psi$ crosses zero.', 'That is the rms value; at face-on the emf is instantaneously zero.', 'A peak of $\\Psi$ is where $d\\Psi/dt = 0$.'],
        md`$\Psi = BA\cos\omega t$ is at its maximum, where its slope is zero: $\emf = NBA\omega\sin\omega t = 0$.`),
      R(md`
        ### The method

        !!method Moving and turning loops in five steps
          1. **Pick $C$** (any direction); the RHR fixes $d\mathbf S$. Draw $\mathbf B$, the path and the motion.
          2. **Geometry at time $t$:** the bar position $x(t)$ and area $\ell x(t)$, the loop center $x_c(t)$, or the normal $\hat n(t)$.
          3. **Flux:** $\Psi(t) = \int_S\mathbf B\cdot d\mathbf S$. Linear $B$: center value times $A$. Turning: $\mathbf B\cdot\hat n(t)A$.
          4. **Emf:** $\emf = -N\,d\Psi/dt$ along $C$. For a single moving bar, check with $vB\ell$ and the direction of $\mathbf v\times\mathbf B$.
          5. **Current and force:** $I = \emf/R$ (bar included). Force on the moving part $I\boldsymbol\ell\times\mathbf B$ opposes the motion; check $Fv = I^2R$.

        ### Worked example

        !!graded Problem
          Two rails along $x$, $\ell = 0.5$ m apart (at $y = 0$ and $y = \ell$), are joined at $x = 0$ by $R = 1.5\ \Omega$. A bar of resistance $0.5\ \Omega$ slides on them at $\mathbf v = 5\hat x$ m/s. $\mathbf B = -0.4\hat z$ T. Find $\emf$ along $C$ (counterclockwise from $+z$), the current and its direction, the force needed to keep $v$ constant, and check the power balance.

        **1. Path and surface.** $C$ counterclockwise from $+z$, so $d\mathbf S = +\hat z\,dS$. Along $C$ the bar (right side) is traversed in $+\hat y$.

        **2. Flux.** $\Psi(t) = B_z\,\ell\,x(t) = (-0.4\,\text{T})(0.5\,\text{m})\,x(t) = -0.2\,x(t)$ Wb, with $dx/dt = 5$ m/s.

        **3. Emf.**
        $$\emf = -\frac{d\Psi}{dt} = (0.2\,\text{T·m})(5\,\text{m/s}) = 1.0\ \text{V}$$
        Check with the bar: $\mathbf v\times\mathbf B = 5\hat x\times(-0.4\hat z) = 2\hat y$ V/m, along $+\hat y$, times 0.5 m: 1.0 V, pushing along $C$. ✓

        **4. Current.** $I = 1.0\,\text{V}/(1.5 + 0.5)\,\Omega = 0.5$ A, positive: **counterclockwise** from $+z$, up the bar and down through $R$.

        **5. Force.** On the bar: $\mathbf F = I\ell\,\hat y\times\mathbf B = (0.5\,\text{A})(0.5\,\text{m})\,\hat y\times(-0.4\,\text{T}\,\hat z) = -0.1\hat x$ N, against $\mathbf v$. You push with $+0.1\hat x$ N.

        **6. Check.** Power in: $Fv = (0.1\,\text{N})(5\,\text{m/s}) = 0.5$ W. Heat: $I^2(R + R_{\text{bar}}) = (0.5\,\text{A})^2(2\,\Omega) = 0.5$ W. ✓ Lenz: the into-page flux grows; the current makes out-of-page field inside, counterclockwise. ✓

        !!mistake Common mistakes
          - Taking $\ell$ as the distance the bar has traveled. It is the bar's length between the rails; the distance enters only through $\Psi$.
          - Leaving the bar's own resistance out of $I = \emf/R$.
          - Expecting an emf from a loop that translates through a uniform field. Each side has $\mathbf v\times\mathbf B$, but the sides cancel.
          - Putting the generator's peak at the face-on position. It is edge-on, where $\Psi = 0$.
          - Using $vB\ell$ when $\mathbf v$, $\mathbf B$ and the bar are not mutually perpendicular. Use $(\mathbf v\times\mathbf B)\cdot d\mathbf l$.
          - Adding the flux-rule emf to the $\mathbf v\times\mathbf B$ emf. They are one emf, computed two ways.
          - Assuming every magnetic force on the bar opposes $\mathbf v$. That holds for induced current; a current you drive (rail gun) goes where $I\boldsymbol\ell\times\mathbf B$ says.

        ### Check questions
      `),
      Q(md`$\mathbf B = 25\times10^{-6}(1 + x/L)\hat y$ T, $L = 1000$ m. A 1 m × 1 m loop moves with $\mathbf v = 4\hat x$ m/s. Which orientation induces **no** current?`,
        ['the loop in the $xy$-plane (its plane contains $\\hat y$)', 'the loop in the $xz$-plane', 'any orientation: $L \\gg 1$ m makes the emf zero', 'none: a moving loop always has an emf here'], 0,
        [null, 'Its normal is $\\hat y$, along $\\mathbf B$: that is the orientation of **maximum** flux and current.', '$L \\gg 1$ m makes $B$ nearly uniform across the loop, not constant along its path; the emf is small, not zero.', 'Edge-on, the flux is zero at every position, so it never changes.'],
        md`Turn the loop so its plane contains $\mathbf B$ (normal $\perp\hat y$): $\Psi = 0$ at every $x$, so $\emf = 0$. The $xy$-plane (or $yz$-plane) works. (Summer 2018 #2(a).)`, { src: 'Summer 2018 Exam 2' }),
      Q(md`Same field and motion. The emf in the orientation of maximum current is…`,
        ['$-10^{-7}$ V with $d\\mathbf S = +\\hat y$', '$-10^{-4}$ V', '$-25\\times10^{-6}$ V', '$-2.5\\times10^{-8}$ V'], 0,
        [null, 'That forgets to divide by $L = 1000$ m: the gradient is $B_0/L$.', 'That is the flux at $t = 0$ in Wb, not its rate of change.', 'That leaves out $v = 4$ m/s.'],
        md`Loop in the $xz$-plane, $\Psi = 25\times10^{-6}(1 + 4t/1000)$ Wb, $\emf = -d\Psi/dt = -10^{-7}$ V. (Summer 2018 #2(d).)`, { src: 'Summer 2018 Exam 2' }),
      Q(md`Summer 2020 #3(d): for the loop above (now with $\mathbf B$ along $\hat z$, loop in the $xy$-plane), is the emf time dependent?`,
        ['No: $\\Psi$ grows linearly in time, so $\\emf$ is constant', 'Yes: the loop sees a stronger field as it moves', 'Yes: it grows as $t^2$', 'No: the emf is zero because $\\mathbf B$ is static'], 0,
        [null, 'A stronger field means more flux, but it grows at a steady rate: $d\\Psi/dt$ is constant.', '$\\Psi$ is linear in $x$ and $x = vt$; nothing is squared.', 'The field is static but the loop moves through its gradient.'],
        md`$\Psi = B_0A(1 + vt/L)$ is linear in $t$, so $\emf = -B_0Av/L$ is constant (for constant $v$ and a field linear in $x$).`, { src: 'Summer 2020 Exam 2' }),
      Q(md`A loop of radius $a_1 = 1$ m carries $I = 2/\mu_0$ A; on its axis far away $\mathbf B = \hat z\,\mu_0Ia_1^2/2z^3$. A small loop of radius $a_2 = 1$ cm, coaxial, moves up at $dz/dt = 1$ m/s near $z = 100$ m. Its emf (counterclockwise from above) is about…`,
        ['$3\\pi\\times10^{-12}$ V', '$\\pi\\times10^{-12}$ V', '$3\\pi\\times10^{-10}$ V', '$3\\pi\\times10^{-8}$ V'], 0,
        [null, 'The factor 3 comes from $d(z^{-3})/dz = -3z^{-4}$.', 'That uses $z^{-3}$ instead of $z^{-4}$ after differentiating.', 'That uses the area in cm² as if it were m².'],
        md`$\Psi = \pi a_2^2\,\mu_0Ia_1^2/2z^3 = \pi\times10^{-4}/z^3$ Wb. $\emf = -\frac{d\Psi}{dz}\frac{dz}{dt} = 3\pi\times10^{-4}/z^4 = 3\pi\times10^{-12}$ V. Positive: the small loop loses upward flux, so it circulates like the big loop. (Summer 2017 #2(b).)`, { src: 'Summer 2017 Exam 2' }),
      Q(md`In Lecture 14's example ($\emf = 6$ V, $I = 2$ A, $\ell = 2$ m, $B = 1$ T, $v = 3$ m/s), the force needed to keep the bar moving at constant speed is…`,
        ['4 N', '2 N', '12 N', '6 N'], 0,
        [null, 'That leaves out $\\ell = 2$ m: $F = I\\ell B$.', 'That is the power in W, $Fv = 12$ W.', 'That is the emf (6 V) relabeled; the force is $I\\ell B$.'],
        md`$F = I\ell B = (2\,\text{A})(2\,\text{m})(1\,\text{T}) = 4$ N. Check: $Fv = 12$ W $= I^2(R_1 + R_2) = 4\cdot3$ W. ✓`),
      Q(md`A bar on rails is pushed at speed $v$. You double $v$. The power you must supply becomes…`,
        ['4 times larger', '2 times larger', 'the same', 'half'], 0,
        [null, 'The force doubles too ($F \\propto v$), so $Fv$ quadruples.', 'Faster motion means a larger emf and current.', 'Power grows with speed.'],
        md`$P = (B\ell v)^2/R \propto v^2$: twice the emf, twice the current, four times the heat.`),
      Q(md`A generator's coil is spun twice as fast. Its peak emf and its average power into a fixed resistor become…`,
        ['2× and 4×', '2× and 2×', '4× and 4×', '1× and 2×'], 0,
        [null, 'Power goes as emf squared.', 'The peak emf is $NBA\\omega$: linear in $\\omega$.', 'Faster change of flux means larger emf.'],
        md`$\emf_{\max} = NBA\omega$ and $\overline P = \emf_{\max}^2/2R$.`),
      Q(md`A bar on frictionless rails (circuit closed by a resistor) is given a push and released. Afterward it…`,
        ['slows down and stops, its kinetic energy turned into heat', 'keeps moving at constant speed: no force acts', 'speeds up: the emf drives it', 'oscillates about its starting point'], 0,
        [null, 'The induced current feels $I\\boldsymbol\\ell\\times\\mathbf B$, which opposes $\\mathbf v$.', 'Energy would come from nowhere.', 'The force always opposes the velocity; there is no restoring force toward a position.'],
        md`$m\,dv/dt = -B^2\ell^2v/R$: $v$ decays as $e^{-t/\tau}$ with $\tau = mR/B^2\ell^2$. Magnetic braking.`),
      R(md`
        ### Rapid fire: directions

        **The trick:** for a bar, $\mathbf v\times\mathbf B$ points to its + end. For a loop, ask what the flux is doing and oppose it. Forces: compute $I\boldsymbol\ell\times\mathbf B$; for induced current it opposes $\mathbf v$.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t9_dir', { need: 8 }), { id: 't9-motional.r0' }),
      R(md`
        ### Rapid fire: sizes

        **The trick:** bar $vB\ell$; generator peak $NBA\omega$ with $\omega = 2\pi f$; gradient $Av\,dB/dx$; force to keep $v$ constant $B^2\ell^2v/R$. Lengths in meters first.
      `),
      Object.assign(G('rf_t9_num', { need: 8 }), { id: 't9-motional.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t9_rails', { need: 2 }),
      G('t9_gradient', { need: 2 }),
      G('t9_gen', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const CYC = { xy: 1, yz: 1, zx: 1, yx: -1, zy: -1, xz: -1 };
  const sg = (s) => (s > 0 ? '' : '-');
  GENS.rf_t9_dir = () => one([
    // which end of a moving bar is positive
    () => {
      const [va, ba, la] = pick([['x', 'y', 'z'], ['y', 'z', 'x'], ['z', 'x', 'y'], ['x', 'z', 'y'], ['y', 'x', 'z'], ['z', 'y', 'x']]);
      const sv = pick([1, -1]), sB = pick([1, -1]);
      const s = sv * sB * CYC[va + ba];                     // v x B = s * (unit vector along the bar's axis)
      const ans = `the $${s > 0 ? '+' : '-'}${la}$ end`;
      return MC('Moving bar', md`A metal bar along the $${la}$-axis moves with $\mathbf v = ${sg(sv)}v\hat ${va}$ through $\mathbf B = ${sg(sB)}B\hat ${ba}$ ($v, B > 0$). Positive charge collects at…`, ans,
        [[`the $${s > 0 ? '-' : '+'}${la}$ end`, md`$\mathbf v\times\mathbf B$ points to the other end; electrons collect here.`], ['neither end: an emf needs a closed loop', 'Each charge feels $q\\mathbf v\\times\\mathbf B$ with or without a loop; an open bar charges its ends.'], ['neither end: $\\mathbf v \\perp \\mathbf B$ gives no force', 'Perpendicular $\\mathbf v$ and $\\mathbf B$ give the **largest** force.']],
        md`$\mathbf v\times\mathbf B = (${sg(sv)}v\hat ${va})\times(${sg(sB)}B\hat ${ba}) = ${sg(s)}vB\,\hat ${la}$, so positive charge is pushed to the $${s > 0 ? '+' : '-'}${la}$ end.`);
    },
    // rails: current direction on the page
    () => {
      const right = pick([true, false]), out = pick([true, false]);
      // page: X right, Y up, Z out of page. v x B = sv sB (X x Z) = -sv sB Y
      const down = (right ? 1 : -1) * (out ? 1 : -1) > 0;
      const ans = down ? 'clockwise' : 'counterclockwise';          // bar on the right of the resistor
      return MC('Rails', md`Rails run left to right on the page, joined at the left end by a resistor. A bar on them moves **${right ? 'right (away from' : 'left (toward'}** the resistor). $\mathbf B$ points **${out ? 'out of' : 'into'}** the page. The current circulates, as seen on the page,…`, ans,
        [[down ? 'counterclockwise' : 'clockwise', 'That reinforces the change of flux instead of opposing it.'], ['nowhere: $\\mathbf B$ is constant', 'The circuit\'s area changes, so its flux changes.'], ['either way, depending on the resistances', 'Resistance sets the size of the current, not its direction.']],
        md`In the bar $\mathbf v\times\mathbf B$ points **${down ? 'down' : 'up'}** the page. Lenz agrees: the ${out ? 'out-of-page' : 'into-page'} flux ${right ? 'grows' : 'shrinks'}, so the current makes ${(right === out) ? 'into-page' : 'out-of-page'} field inside: ${ans}.`);
    },
    // force on the bar from its induced current
    () => {
      const away = pick([true, false]);
      return MC('Brake', md`A bar on rails (closed by a resistor) moves **${away ? 'away from' : 'toward'}** the resistor through a uniform $\mathbf B$ perpendicular to the rails' plane. The magnetic force on the bar's induced current points…`, away ? 'toward the resistor' : 'away from the resistor',
        [[away ? 'away from the resistor' : 'toward the resistor', 'That would speed the bar up and create energy from nothing.'], ['along the bar', '$I\\boldsymbol\\ell\\times\\mathbf B$ is perpendicular to the bar.'], ['it depends on the sign of $\\mathbf B$', 'Flipping $\\mathbf B$ flips the current too; the force still opposes $\\mathbf v$.']],
        md`An induced current always brakes the motion that makes it (Lenz). Flipping $\mathbf B$ flips $I$ as well, so $I\boldsymbol\ell\times\mathbf B$ keeps pointing against $\mathbf v$.`);
    },
    // rail gun
    () => {
      const up = pick([true, false]), out = pick([true, false]);
      // F = I l x B: bar current +Y (up) or -Y, B +Z or -Z. Y x Z = +X (away from the source on the left)
      const awayF = (up ? 1 : -1) * (out ? 1 : -1) > 0;
      const ans = awayF ? 'away from the source (to the right)' : 'toward the source (to the left)';
      return MC('Rail gun', md`A source at the **left** end drives a current out along the ${up ? 'bottom' : 'top'} rail, ${up ? 'up' : 'down'} through a free bar, and back along the ${up ? 'top' : 'bottom'} rail. $\mathbf B$ points **${out ? 'out of' : 'into'}** the page. The bar is pushed…`, ans,
        [[awayF ? 'toward the source (to the left)' : 'away from the source (to the right)', 'Recheck the cross product $I\\boldsymbol\\ell\\times\\mathbf B$.'], ['along the bar', 'The force is perpendicular to the current.'], ['nowhere: rail forces cancel it', 'The rails are fixed; the free bar takes the force.']],
        md`$\boldsymbol\ell$ points ${up ? 'up' : 'down'}, $\mathbf B$ ${out ? 'out of' : 'into'} the page: $\boldsymbol\ell\times\mathbf B$ points ${awayF ? 'right' : 'left'}. (Up × out = right.)`);
    },
    // generator: when is the emf largest
    () => {
      const [desc, ans, w] = pick([
        ['its normal is parallel to $\\mathbf B$ (face-on)', 'zero', [['$NBA\\omega$', 'Face-on, $\\Psi$ is at its peak and momentarily constant.'], ['$NBA\\omega/\\sqrt2$', 'That is the value at 45°.'], ['$NBA$', 'Wrong units: an emf needs $\\omega$.']]],
        ['its plane contains $\\mathbf B$ (edge-on)', '$NBA\\omega$, its peak', [['zero', 'Edge-on, $\\Psi = 0$ but it is changing fastest.'], ['$NBA\\omega/\\sqrt2$', 'That is the value at 45°.'], ['$NBA\\omega/2$', 'The emf is $NBA\\omega\\sin\\theta$; at 90° that is the full peak.']]],
        ['its normal is at 45° to $\\mathbf B$', '$NBA\\omega/\\sqrt2$', [['$NBA\\omega/2$', '$\\sin45° = 1/\\sqrt2$, not 1/2.'], ['zero', 'Zero only face-on.'], ['$NBA\\omega$', 'The peak is edge-on.']]],
        ['its normal is antiparallel to $\\mathbf B$', 'zero', [['$-NBA\\omega$', 'Antiparallel is face-on again: $\\Psi = -BA$, momentarily constant.'], ['$NBA\\omega$', 'The peak is edge-on.'], ['$2NBA\\omega$', 'The emf never exceeds $NBA\\omega$.']]],
      ]);
      return MC('Generator', md`A coil of $N$ turns, area $A$, turns at constant $\omega$ in a uniform $\mathbf B$. At the instant ${desc}, $|\emf|$ is…`, ans, w,
        md`$\Psi = BA\cos\theta$, so $|\emf| = NBA\omega|\sin\theta|$ with $\theta$ the angle between $\hat n$ and $\mathbf B$.`);
    },
  ]);

  GENS.rf_t9_num = () => one([
    // v B l
    () => {
      const v = pick([2, 3, 4, 5, 10, 20]), B = pick([0.1, 0.2, 0.5, 1, 2]), lcm = pick([10, 20, 25, 50, 100]);
      const e = v * B * lcm / 100;
      const o = (x) => `${p(+x.toPrecision(3))} V`;
      return MC('Moving bar', md`A bar ${lcm} cm long moves at $${v}$ m/s perpendicular to itself and to a uniform $B = ${B}$ T. The emf between its ends is…`, o(e),
        [[o(e * 100), 'The length must be in meters: $' + lcm + '$ cm $= ' + lcm / 100 + '$ m.'], [o(e / 2), 'No factor ½: $\\emf = vB\\ell$.'], [o(e * 2), 'No factor 2: $\\emf = vB\\ell$.'], [o(v * B), 'The length was left out.']],
        md`$\emf = vB\ell = (${v})(${B})(${lcm / 100}) = ${p(+e.toPrecision(3))}$ V.`);
    },
    // generator peak
    () => {
      const n = pick([1, 10, 50, 100]), B = pick([0.1, 0.2, 0.5]), A = pick([0.01, 0.02, 0.05]), fr = pick([50, 60]);
      const e = n * B * A * 2 * Math.PI * fr;
      const o = (x) => `${f(x)} V`;
      return MC('Generator', md`A ${n === 1 ? 'loop' : `${n}-turn coil`} of area $${A}\,\text{m}^2$ spins at $${fr}$ Hz in $B = ${B}$ T. The peak emf is…`, `$${f(e)}$ V`,
        [[`$${f(e / (2 * Math.PI))}$ V`, 'That uses $f$ in place of $\\omega = 2\\pi f$.'], [`$${f(n === 1 ? e * 2 : e / n)}$ V`, n === 1 ? 'No factor 2.' : 'The turns were left out.'], [`$${f(e / Math.SQRT2)}$ V`, 'That is the rms value, not the peak.']],
        md`$\emf_{\max} = NBA\omega = (${n})(${B})(${A})(2\pi\cdot${fr}) = ${f(e)}$ V.`);
    },
    // loop in a gradient
    () => {
      const B0 = pick([10, 25, 50]), Lm = pick([100, 500, 1000]), v = pick([2, 4, 5, 10]), A = pick([0.5, 1, 2]);
      const e = A * v * B0 * 1e-6 / Lm;
      return MC('Gradient', md`$B_z = ${B0}\,\mu\text{T}\,(1 + x/L)$ with $L = ${Lm}$ m. A loop of area $${A}\,\text{m}^2$ in the $xy$-plane moves along $x$ at $${v}$ m/s. $|\emf| = $`, `$${f(e)}$ V`,
        [[`$${f(e * Lm)}$ V`, 'The gradient is $B_0/L$: divide by $L$.'], [`$${f(Math.sqrt(A) * v * B0 * 1e-6)}$ V`, 'That is $vB\\ell$ for one edge. The front and back edges nearly cancel; only the difference counts.'], [`$${f(e / 2)}$ V`, 'No factor ½: $|\\emf| = Av\\,dB/dx$.']],
        md`$|\emf| = A\,v\,\dfrac{dB}{dx} = (${A})(${v})\dfrac{${B0}\times10^{-6}}{${Lm}} = ${f(e)}$ V.`);
    },
    // force to keep v constant
    () => {
      const B = pick([0.5, 1, 2]), v = pick([2, 4, 5]), Rr = pick([1, 2, 4, 5]);
      let l = pick([0.5, 1.5, 2]); if (B * l === 1) l = 1.5;   // Bl = 1 or l = 1 would make two options equal
      const F = B * B * l * l * v / Rr;
      const o = (x) => `${p(+x.toPrecision(3))} N`;
      return MC('Brake force', md`A bar of length $${l}$ m slides on rails at $${v}$ m/s through $B = ${B}$ T; the circuit's total resistance is $${Rr}\ \Omega$. The force needed to keep $v$ constant is…`, o(F),
        [[o(B * l * v / Rr), 'That is the current $I = B\\ell v/R$ in A, not the force $I\\ell B$.'], [o(F * v), 'That is the power $Fv$ in W.'], [o(B * l * v * B / Rr), 'One factor of $\\ell$ is missing: $F = I\\ell B$ with $I = B\\ell v/R$.'], [o(B * l * v), 'That is the emf $B\\ell v$ in V, not a force.']],
        md`$F = I\ell B = \dfrac{B^2\ell^2v}{R} = \dfrac{(${B})^2(${l})^2(${v})}{${Rr}} = ${p(+F.toPrecision(3))}$ N.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  const CCW = ['counterclockwise from $+z$ (along $C$)', 'clockwise from $+z$ (against $C$)'];

  GENS.t9_rails = () => {
    const B0 = pick([0.2, 0.4, 0.5, 0.8, 1.2]), sB = pick([1, -1]), l = pick([0.2, 0.25, 0.5, 1, 1.5]);
    const v = pick([2, 3, 4, 5, 8, 10]), sv = pick([1, -1]), Rr = pick([1, 2, 3, 5, 10]), Rb = pick([0.5, 1, 2]);
    const e = -sB * B0 * l * sv * v;                    // along C (ccw from +z, dS = +z); bar on the right, traversed +y
    const Rt = Rr + Rb, I = e / Rt, F = Math.abs(I) * l * B0, P = F * v;
    return {
      title: 'Bar on rails',
      q: md`Rails along $x$ at $y = 0$ and $y = ${l}$ m are joined at $x = 0$ by $R = ${Rr}\ \Omega$. A bar of resistance $${Rb}\ \Omega$ slides on them with $\mathbf v = ${sg(sv)}${v}\hat x$ m/s (it is at $x > 0$). $\mathbf B = ${sg(sB)}${B0}\hat z$ T. Take $C$ counterclockwise from $+z$. Find $\emf$ along $C$, the current and its direction, the force needed to keep the bar's speed constant, and the power you supply.`,
      parts: [
        N('\\mathcal E\\ \\text{along}\\ C', e, 'V'),
        N('|I|', Math.abs(I), 'A'),
        { lbl: 'The current flows', mc: CCW, a: e > 0 ? 0 : 1, fixed: true, why: e > 0 ? [null, 'The emf along $C$ is positive.'] : ['The emf along $C$ is negative.', null] },
        N('|F|', F, 'N'),
        N('P', P, 'W'),
      ],
      hints: ['Counterclockwise from $+z$ puts $d\\mathbf S = +\\hat z$. $\\Psi(t) = B_z\\,\\ell\\,x(t)$ with $dx/dt = v_x$.', 'The bar is in series with $R$: $I = \\emf/(R + R_{\\text{bar}})$. Then $F = |I|\\ell B$ and $P = Fv$.'],
      sol: sol({
        eq: md`$\emf = -d\Psi/dt$ with $\Psi = B_z\,\ell\,x(t)$ ($d\mathbf S = +\hat z$); $\;I = \emf/(R + R_{\text{bar}})$; $\;\mathbf F = I\boldsymbol\ell\times\mathbf B$.`,
        sym: md`$\emf = -B_z\ell v_x$, $\;|F| = |I|\ell B_0$, $\;P = |F||v| = I^2(R + R_{\text{bar}})$.`,
        sub: md`$$\emf = -(${sg(sB)}${B0}\,\text{T})(${l}\,\text{m})(${sg(sv)}${v}\,\text{m/s}) = ${f(e)}\ \text{V}, \qquad I = \frac{${f(e)}\ \text{V}}{${Rt}\ \Omega} = ${f(I)}\ \text{A}$$
$$|F| = (${f(Math.abs(I))}\,\text{A})(${l}\,\text{m})(${B0}\,\text{T}) = ${f(F)}\ \text{N}, \qquad P = (${f(F)}\,\text{N})(${v}\,\text{m/s}) = ${f(P)}\ \text{W}$$`,
        ans: md`$\emf = ${f(e)}$ V, $|I| = ${f(Math.abs(I))}$ A ${e > 0 ? 'counterclockwise' : 'clockwise'} from $+z$, $|F| = ${f(F)}$ N, $P = ${f(P)}$ W.`,
        check: md`In the bar, $\mathbf v\times\mathbf B = (${sg(sv)}${v}\hat x)\times(${sg(sB)}${B0}\hat z) = ${f(-sv * sB * v * B0)}\,\hat y$ V/m: it pushes ${e > 0 ? 'up ($+y$), along $C$' : 'down ($-y$), against $C$'}. ✓ Heat: $I^2(R + R_{\text{bar}}) = ${f(I * I * Rt)}$ W $= P$. ✓`,
      }),
    };
  };

  GENS.t9_gradient = () => {
    const B0 = pick([10, 20, 25, 50]), Lm = pick([100, 200, 500, 1000]), s = pick([1, -1]);
    const sq = pick([true, false]), dim = pick([0.5, 1, 2]), v = pick([2, 3, 4, 5, 10]), sv = pick([1, -1]), Rr = pick([1, 2, 4, 5]);
    const A = sq ? dim * dim : Math.PI * dim * dim;
    const e = -A * B0 * 1e-6 * s * sv * v / Lm;          // along C, ccw from +z, dS = +z
    const I = e / Rr;
    return {
      title: 'Loop drifting through a gradient',
      q: md`A ${sq ? `square loop of side $${dim}$ m` : `circular loop of radius $${dim}$ m`} lies in the $xy$-plane, centered at the origin at $t = 0$, and moves with $\mathbf v = ${sg(sv)}${v}\hat x$ m/s through $\mathbf B = ${B0}\times10^{-6}\left(1 ${s > 0 ? '+' : '-'} x/L\right)\hat z$ T, $L = ${Lm}$ m. Its resistance is $${Rr}\ \Omega$. Take $C$ counterclockwise from $+z$. Find $\emf$ along $C$, the magnitude of the current, and its direction.`,
      parts: [
        N('\\mathcal E\\ \\text{along}\\ C', e, 'V'),
        N('|I|', Math.abs(I), 'A'),
        { lbl: 'The current flows', mc: CCW, a: e > 0 ? 0 : 1, fixed: true, why: e > 0 ? [null, 'The emf along $C$ is positive.'] : ['The emf along $C$ is negative.', null] },
      ],
      hints: ['$B$ is linear in $x$, so the flux is the center value times the area: $\\Psi(t) = B_z(x_c(t))\\,A$ with $x_c = v_xt$.', '$\\emf = -d\\Psi/dt = -A\\,v_x\\,dB_z/dx$.'],
      sol: sol({
        eq: md`$\emf = -d\Psi/dt$, $\;\Psi(t) = B_z\big(x_c(t)\big)A$ (exact for a field linear in $x$), $d\mathbf S = +\hat z$.`,
        sym: md`$\Psi(t) = B_0\left(1 ${s > 0 ? '+' : '-'} v_xt/L\right)A$, so $\emf = ${s > 0 ? '-' : ''}\dfrac{B_0Av_x}{L}$, constant in time.`,
        sub: md`$$\emf = ${s > 0 ? '-' : ''}\frac{(${B0}\times10^{-6}\,\text{T})(${p(+A.toPrecision(4))}\,\text{m}^2)(${sg(sv)}${v}\,\text{m/s})}{${Lm}\,\text{m}} = ${f(e)}\ \text{V}, \qquad |I| = \frac{|\emf|}{${Rr}\ \Omega} = ${f(Math.abs(I))}\ \text{A}$$`,
        ans: md`$\emf = ${f(e)}$ V, $|I| = ${f(Math.abs(I))}$ A, ${e > 0 ? 'counterclockwise' : 'clockwise'} from $+z$.`,
        check: md`Lenz: the loop moves toward ${s * sv > 0 ? 'stronger' : 'weaker'} upward field, so its upward flux ${s * sv > 0 ? 'grows; the current makes downward field inside: clockwise' : 'shrinks; the current tops it up: counterclockwise'}. ✓`,
      }),
    };
  };

  GENS.t9_gen = () => {
    const n = pick([1, 20, 50, 100, 200]), B = pick([0.05, 0.1, 0.2, 0.5]), a = pick([5, 10, 20]), b = pick([5, 10, 15]), Rr = pick([5, 10, 20, 50]);
    const rpm = pick([true, false]), rate = rpm ? pick([600, 1200, 1800, 3000]) : pick([10, 50, 60]);
    const w = 2 * Math.PI * (rpm ? rate / 60 : rate), A = a * b * 1e-4;
    const e = n * B * A * w, I = e / Rr, P = e * e / (2 * Rr);
    return {
      title: 'Generator',
      q: md`A rectangular coil of $N = ${n}$ turn${n > 1 ? 's' : ''}, $${a}$ cm × $${b}$ cm, turns at ${rpm ? `$${rate}$ rpm` : `$${rate}$ Hz`} about an axis perpendicular to a uniform $B = ${B}$ T. It is connected to a $${Rr}\ \Omega$ resistor (coil resistance negligible). Find the peak emf, the peak current and the average power.`,
      parts: [N('\\mathcal E_{\\max}', e, 'V'), N('I_{\\max}', I, 'A'), N('\\overline P', P, 'W')],
      hints: [`$\\omega = 2\\pi${rpm ? '\\times(\\text{rpm}/60)' : ' f'}$ and $A = ${a * b}\\ \\text{cm}^2 = ${p(A)}\\ \\text{m}^2$.`, '$\\emf = NBA\\omega\\sin\\omega t$; the average of $\\sin^2$ is ½, so $\\overline P = \\emf_{\\max}^2/2R$.'],
      sol: sol({
        eq: md`$\Psi = BA\cos\omega t$, $\;\emf = -N\,d\Psi/dt = NBA\omega\sin\omega t$, $\;P(t) = \emf^2/R$.`,
        sym: md`$\emf_{\max} = NBA\omega$, $\;I_{\max} = \emf_{\max}/R$, $\;\overline P = \emf_{\max}^2/2R$.`,
        sub: md`$$\omega = ${f(w)}\ \text{rad/s}, \qquad \emf_{\max} = (${n})(${B}\,\text{T})(${p(A)}\,\text{m}^2)(${f(w)}\,\text{s}^{-1}) = ${f(e)}\ \text{V}$$
$$I_{\max} = \frac{${f(e)}\ \text{V}}{${Rr}\ \Omega} = ${f(I)}\ \text{A}, \qquad \overline P = \frac{(${f(e)}\ \text{V})^2}{2(${Rr}\ \Omega)} = ${f(P)}\ \text{W}$$`,
        ans: md`$\emf_{\max} = ${f(e)}$ V, $I_{\max} = ${f(I)}$ A, $\overline P = ${f(P)}$ W.`,
        check: 'The peak comes when the coil is edge-on to B (zero flux). The average power is supplied by the torque on the shaft.',
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t9-motional'] = [
    Q(md`For a moving loop, you compute $-d\Psi/dt$ and also $\oint(\mathbf v\times\mathbf B)\cdot d\mathbf l$ (static $\mathbf B$). The emf is…`,
      ['either one: they are equal', 'their sum', 'their difference', 'only the $\\mathbf v\\times\\mathbf B$ term; the flux rule is for fixed loops'], 0,
      [null, 'They describe the same emf; adding counts it twice.', 'They are equal, so the difference is zero, not the emf.', 'The flux rule holds for moving paths too (Lecture 14).'],
      md`In a static field the whole emf is motional, and $\oint(\mathbf v\times\mathbf B)\cdot d\mathbf l = -d\Psi/dt$ exactly. Use whichever is easier.`),
    Q(md`A metal bar slides **along its own length** through a uniform $\mathbf B$ perpendicular to it. The emf between its ends is…`,
      ['zero', '$vB\\ell$', '$vB\\ell/2$', 'it depends on the bar\'s resistance'], 0,
      [null, '$\\mathbf v\\times\\mathbf B$ is perpendicular to $\\mathbf v$, hence to the bar: no push along it.', 'There is no factor ½; there is no emf at all.', 'An open bar has an emf set by geometry only.'],
      md`$\mathbf v\times\mathbf B \perp \mathbf v$, and $\mathbf v$ is along the bar, so $(\mathbf v\times\mathbf B)\cdot d\mathbf l = 0$.`),
    Q(md`A bar moves **parallel to** $\mathbf B$. Its emf is…`,
      ['zero', '$vB\\ell$', 'largest when it is also parallel to $\\mathbf v$', 'equal to $vB\\ell\\cos 0$'], 0,
      [null, '$\\mathbf v\\times\\mathbf B = 0$ when $\\mathbf v \\parallel \\mathbf B$.', 'The bar\'s orientation does not matter if $\\mathbf v\\times\\mathbf B = 0$.', 'The cross product brings a sine, and $\\sin0 = 0$.'],
      md`No force on charges moving along $\mathbf B$, so no emf.`),
    Q(md`A square loop translates at $\mathbf v$ through a **uniform** $\mathbf B$ normal to it. Both edges perpendicular to $\mathbf v$ have $vB\ell$ across them. The loop's emf is…`,
      ['zero: the two edge emfs oppose each other around the loop', '$2vB\\ell$', '$vB\\ell$', 'zero only if the loop is a square'], 0,
      [null, 'They have the same direction in space, so around the loop they point opposite ways.', 'Only the difference between the edges counts, and here they are equal.', 'Any shape: uniform $\\mathbf B$ and pure translation keep $\\Psi$ constant.'],
      md`Same field at both edges, so the emfs cancel around the loop: $\Psi$ is constant. A gradient breaks the cancellation (Step 4).`),
    Q(md`In a rails circuit with a resistor at one end and a moving bar, where is the emf located?`,
      ['in the moving bar', 'in the resistor', 'spread uniformly around the loop', 'in the rails'], 0,
      [null, 'The resistor is where the energy is dissipated, not where the push is.', 'The $\\mathbf v\\times\\mathbf B$ push exists only where the conductor moves.', 'The rails are at rest: $\\mathbf v = 0$ there.'],
      md`$\mathbf v\times\mathbf B$ acts only on moving charges: the bar is the battery, the resistor the load.`),
    Q(md`A falling bar slides down vertical rails (closed at the top by $R$) through a horizontal $\mathbf B$ perpendicular to the rails' plane. Its terminal speed is…`,
      ['$mgR/B^2\\ell^2$', '$mg/B\\ell$', '$mgR/B\\ell$', 'there is none: it keeps accelerating at $g$'], 0,
      [null, 'That is the current needed to hold it up ($I\\ell B = mg$), in A, not a speed.', 'One factor of $B\\ell$ is missing: the emf is $B\\ell v$ and the force is $I\\ell B$.', 'The braking force grows with $v$ until it balances $mg$.'],
      md`Terminal: $I\ell B = mg$ with $I = B\ell v/R$, so $v_t = mgR/B^2\ell^2$.`),
    Q(md`A bar of mass $m$ on rails (total resistance $R$) is released with speed $v_0$ and no push. Its speed decays as $e^{-t/\tau}$ with $\tau = $`,
      ['$mR/B^2\\ell^2$', '$B^2\\ell^2/mR$', '$L/R$', '$mR/B\\ell$'], 0,
      [null, 'Inverted: $1/\\tau = B^2\\ell^2/mR$.', 'There is no inductance here.', 'Units: $B\\ell$ alone does not give seconds.'],
      md`$m\,dv/dt = -(B^2\ell^2/R)v$.`),
    Q(md`A generator spins at $f$ revolutions per second. Its emf oscillates at…`,
      ['$f$ hertz', '$2f$ hertz', '$f/2$ hertz', '$2\\pi f$ hertz'], 0,
      [null, 'The emf repeats once per revolution.', 'One full turn is one full emf cycle.', '$2\\pi f$ is the angular frequency in rad/s, not hertz.'],
      md`$\emf = NBA\omega\sin\omega t$ with $\omega = 2\pi f$: one cycle per turn.`),
    Q(md`A coil turns about an axis **parallel** to the uniform $\mathbf B$. Its emf is…`,
      ['zero', '$NBA\\omega\\sin\\omega t$', '$NBA\\omega$', 'it depends on the coil\'s shape'], 0,
      [null, 'Turning about $\\mathbf B$ keeps the angle between $\\hat n$ and $\\mathbf B$ fixed.', 'The flux does not change, so there is no emf.', 'Constant flux, any shape.'],
      md`$\hat n$ sweeps a cone around $\mathbf B$; $\mathbf B\cdot\hat n$ stays constant, so $\Psi$ does too.`),
    Q(md`A metal rod of length $a$ spins about one end at $\omega$, in a plane perpendicular to a uniform $\mathbf B$. The emf between its ends is…`,
      ['$\\tfrac12B\\omega a^2$', '$B\\omega a^2$', '$B\\omega a$', 'zero: the rod does not enclose any flux'], 0,
      [null, 'The speed grows from 0 at the pivot to $\\omega a$ at the tip; integrate $vB\\,dr$.', 'Units: $B\\omega a$ is V/m, not V.', 'An open rod still has a motional emf between its ends.'],
      md`$\emf = \int_0^a(\omega r)B\,dr = \tfrac12B\omega a^2$. Equivalently, the rod sweeps area $\tfrac12a^2\omega$ per second.`),
    Q(md`A wire loop is pulled at constant speed out of a region of uniform $\mathbf B$ into a field-free region. Its emf is nonzero…`,
      ['only while it crosses the field edge', 'only while it is fully inside', 'at all times', 'never: the field is uniform'], 0,
      [null, 'Fully inside, the flux is constant.', 'Fully outside or fully inside, nothing changes.', 'Uniform where it exists, but the loop crosses its edge, so the flux through it changes.'],
      md`$\Psi$ changes only while the edge of the field region cuts across the loop.`),
    Q(md`An airplane with a 30 m wingspan flies level at 250 m/s where Earth's field has a vertical component of 50 µT. The emf between its wingtips is about…`,
      ['0.38 V', '380 V', '0.0125 V', '3.8 V'], 0,
      [null, 'That uses µT as mT.', 'That leaves out the 30 m wingspan.', 'Off by ten: $250\\cdot50\\times10^{-6}\\cdot30 = 0.375$.'],
      md`$vB\ell = (250)(50\times10^{-6})(30) = 0.375$ V. Only the vertical component of $\mathbf B$ pushes charge along the horizontal wing.`),
    Q(md`A loop moves along $+x$ through $B_z = B_0(1 + x/L)$ and then through $B_z = B_0(1 - x/L)$, same speed. Its emf…`,
      ['has the same size and opposite sign', 'is the same', 'is zero in the second case', 'doubles in the second case'], 0,
      [null, 'The gradient changed sign, so $d\\Psi/dt$ did.', 'The flux now decreases, so the emf and current reverse.', 'Only the sign of the gradient changed, not its size.'],
      md`$\emf = -A\,v\,dB_z/dx = \mp AvB_0/L$.`),
    Q(md`In HW 6 #5(d), $\mathbf B$ is an external field and you reverse the direction of the injected current $I'$. The projectile's acceleration…`,
      ['reverses', 'stays the same', 'doubles', 'becomes zero'], 0,
      [null, '$\\mathbf F = I\\boldsymbol\\ell\\times\\mathbf B$ is linear in $I$ with $\\mathbf B$ fixed. (In a real rail gun the rails make $\\mathbf B$, which reverses too, so the force would not reverse.)', 'Reversing the current reverses the force, not its size.', 'The force still has the same magnitude.'],
      md`With an external $\mathbf B$, flipping $I$ flips $\mathbf F$.`),
    Q(md`A rail gun's projectile accelerates at $a$ with current $I$ in a field $B$. With $2I$ and $B/2$…`,
      ['$a$', '$2a$', '$4a$', '$a/2$'], 0,
      [null, '$a = I\\ell B/M$: the two changes cancel.', 'Each factor enters once.', 'Halving $B$ undoes doubling $I$.'],
      md`$a = I\ell B/M$, and $(2I)(B/2) = IB$.`),
    Q(md`A copper plate swings into the gap of a strong magnet and stops quickly. Cutting slots in the plate makes it…`,
      ['swing more freely: the eddy-current loops are broken up', 'stop even faster', 'stop just the same', 'be pushed out of the gap'], 0,
      [null, 'Slots cut the closed paths that eddy currents need.', 'Slots reduce the current, which carries the braking force.', 'The force is a drag (opposes $\\mathbf v$), not a push.'],
      md`Braking needs induced current, and current needs closed paths. Slotted plates (and laminated cores) suppress eddy currents.`),
    Q(md`For a fixed area, which loop shape gives the largest emf when turned at $\omega$ in a uniform $\mathbf B$?`,
      ['all shapes give the same emf', 'a circle', 'a long thin rectangle', 'a square'], 0,
      [null, 'In a uniform field only the area and the angle enter $\\Psi = BA\\cos\\theta$.', 'Shape does not enter $BA\\cos\\theta$.', 'Shape does not enter $BA\\cos\\theta$.'],
      md`$\emf = NBA\omega\sin\omega t$ depends on $A$, not on the outline.`),
    Q(md`A generator is connected to nothing (open terminals) and turned by hand. Compared with turning it while it drives a resistor, it is…`,
      ['easier to turn: no current means no opposing torque', 'harder to turn', 'equally hard', 'impossible to turn'], 0,
      [null, 'Opposing torque comes from $I\\boldsymbol\\ell\\times\\mathbf B$; with no current there is none.', 'The emf is there, but with no current no power is delivered.', 'Friction aside, nothing resists.'],
      md`Mechanical power in = electrical power out = $\emf I$. Open terminals: $I = 0$, no load torque.`),
  ];
})();

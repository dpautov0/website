/* Topic 10 — Voltmeters and KVL with induced fields (Lecture 14). With changing flux ∮E·dl ≠ 0, so the integral of E
   between two points depends on the path; a voltmeter reads ∫E·dl along its own leads, from + to −. Where E lives in
   a circuit (zero in ideal wire, IR across resistors), Lecture 14's E inside the rail resistor, reading one resistor,
   two meters on the same two points (Summer 2018 #3), and diagonal meters (Summer 2017 #3, Summer 2018 #3(e)). */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick } = U;

  // ---------------------------------------------------------------- figure helpers
  function zig(g, x1, y1, x2, y2, o = {}) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = -uy, py = ux;
    const len = Math.min(o.len || 34, L * 0.6), a = (L - len) / 2, n = 6, amp = o.amp || 6;
    const pts = [[x1, y1], [x1 + ux * a, y1 + uy * a]];
    for (let i = 1; i < n; i++) { const s = a + len * i / n, k = (i % 2 ? 1 : -1) * amp; pts.push([x1 + ux * s + px * k, y1 + uy * s + py * k]); }
    pts.push([x1 + ux * (a + len), y1 + uy * (a + len)], [x2, y2]);
    g.pl(pts, { cls: o.cls || '' });
    return g;
  }
  // a voltmeter in the straight line from (x1,y1) to (x2,y2): wire, circle with V, wire; '+' on the (x1,y1) side
  function meterOn(g, x1, y1, x2, y2, o = {}) {
    const r = o.r || 12, mx = o.at ? o.at[0] : (x1 + x2) / 2, my = o.at ? o.at[1] : (y1 + y2) / 2;
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L, px = uy, py = -ux;
    const s = o.side || 1;                                   // which side of the line the + and − marks go
    g.line(x1, y1, mx - ux * r, my - uy * r, { cls: o.cls || '' });
    g.line(mx + ux * r, my + uy * r, x2, y2, { cls: o.cls || '' });
    g.circle(mx, my, r, { cls: 'bgfill' });
    g.label(mx, my, '\\text{V}', 'c', 'small');
    g.label(mx - ux * (r + 7) + s * px * 11, my - uy * (r + 7) + s * py * 11, '+', 'c', 'small');
    g.label(mx + ux * (r + 7) + s * px * 11, my + uy * (r + 7) + s * py * 11, '-', 'c', 'small');
    if (o.lab) g.label(mx - s * px * (r + 10), my - s * py * (r + 10), o.lab, o.labAt || 'c', 'small');
    return g;
  }
  const cross = (g, x, y, k = 3) => { g.add(`<path class="dim thin nodecl" d="M${x - k},${y - k}L${x + k},${y + k}M${x + k},${y - k}L${x - k},${y + k}"/>`); g.track(x - k, y - k, x + k, y + k); };

  // two paths from A to B around a region of changing flux
  function pathFig() {
    const g = PF.fig({ scale: 1.15, alt: 'points A and B on either side of a shaded region of changing flux; path P1 goes over the top, path P2 under the bottom' });
    const cx = 150, cy = 92;
    g.circle(cx, cy, 30, { cls: 'shade' });
    g.circle(cx, cy, 30, { cls: 'dim' });
    for (const [dx, dy] of [[-12, -10], [12, -10], [-12, 10], [12, 10], [0, 0]]) g.dot(cx + dx, cy + dy, 2, { cls: 'dimfill' });
    g.ellipse(cx, cy, 92, 62, { half: 'back', cls: 'thick' });
    g.ellipse(cx, cy, 92, 62, { half: 'front', cls: 'thick dash' });
    g.head(cx + 3, cy - 62, 1, 0, { hs: 9 });
    g.head(cx + 3, cy + 62, 1, 0, { hs: 9 });
    g.dot(cx - 92, cy, 3.2); g.dot(cx + 92, cy, 3.2);
    g.label(cx - 100, cy, 'A', 'r');
    g.label(cx + 100, cy, 'B', 'l');
    g.label(cx, cy - 70, 'P_1', 'b');
    g.label(cx, cy + 70, 'P_2', 't');
    return g.svg();
  }

  // Lecture 14's rails: where E is. x right, z up, y into the page
  function railEFig() {
    const g = PF.fig({ scale: 1.2, alt: 'the rails circuit of Lecture 14: E is zero in the perfect rails, points down at 2 V/m inside R2, and inside the moving bar E points down at 2 V/m while v cross B pushes up at 3 V/m' });
    const x0 = 34, x1 = 300, yt = 34, yb = 134, xb = 250;
    g.line(x0, yt, x1, yt, { cls: 'thick' });
    g.line(x0, yb, x1, yb, { cls: 'thick' });
    zig(g, x0, yt, x0, yb);
    g.line(xb, yt - 8, xb, yb + 8, { cls: 'thick' });
    g.arrow(56, 62, 56, 106, { hs: 7 });
    g.label(62, 84, 'E_z = -2\\ \\text{V/m}', 'l', 'small');
    g.arrow(xb - 14, 106, xb - 14, 62, { hs: 7, cls: 'dim' });
    g.label(xb - 20, 84, '\\mathbf v\\times\\mathbf B:\\ 3', 'r', 'small');
    g.arrow(xb + 14, 62, xb + 14, 106, { hs: 7 });
    g.label(xb + 20, 84, 'E_z = -2', 'l', 'small');
    g.label(140, yt - 6, 'E = 0\\ \\text{in the rails}', 'b', 'small');
    g.label(x0 - 10, 84, 'R_2', 'r');
    g.label(xb, yb + 14, 'R_1', 't', 'small');
    g.arrow(xb + 4, 12, xb + 40, 12, { hs: 7 });
    g.label(xb + 44, 12, '\\mathbf v', 'l', 'small');
    return g.svg();
  }

  // Summer 2017 #3: R1 left, R2 top, R3 right, B = B0 z (dots); A top-right, B bottom-left.
  // variant 'diag': a voltmeter on the diagonal (+ at A); 'hug': the same meter with its leads run down R3 and along the bottom
  function su17Fig(variant) {
    const g = PF.fig({ scale: 1.4, alt: variant === 'hug' ? 'the same square loop; the voltmeter now sits beside R3 with its leads running tight along R3 and the bottom wire from A to B' : 'square loop with R1 on the left, R2 on top, R3 on the right; B out of the page; a voltmeter on the diagonal from A (top right, + probe) to B (bottom left)' });
    const L0 = 40, T0 = 50, S = 120, A = [L0 + S, T0], Bp = [L0, T0 + S], TL = [L0, T0], BR = [L0 + S, T0 + S];
    for (const x of [62, 88, 114, 138]) for (const y of [72, 98, 124, 150]) {
      if (variant === 'diag' && Math.abs(x + y - (A[0] + A[1])) < 24) continue;
      if (variant === 'hug' && x === 138 && (y === 98 || y === 124)) continue;   // room for the R3 label
      g.dot(x, y, 2, { cls: 'dimfill' });
    }
    zig(g, TL[0], TL[1], Bp[0], Bp[1]);
    zig(g, TL[0], TL[1], A[0], A[1]);
    zig(g, A[0], A[1], BR[0], BR[1]);
    g.line(Bp[0], Bp[1], BR[0], BR[1]);
    if (variant === 'diag') {
      g.head(BR[0], BR[1] - 18, 0, -1, { hs: 8 });
      g.label(BR[0] + 8, BR[1] - 18, 'C', 'l', 'small');
    }
    g.label(L0 - 10, T0 + S / 2, 'R_1', 'r');
    g.label(L0 + S / 2, T0 - 10, 'R_2', 'b');
    if (variant === 'hug') g.label(A[0] - 12, T0 + S / 2, 'R_3', 'r');
    else g.label(A[0] + 10, T0 + S / 2, 'R_3', 'l');
    g.dot(A[0], A[1], 3); g.dot(Bp[0], Bp[1], 3);
    g.label(A[0] + 6, A[1] - 6, 'A', 'bl');
    g.label(Bp[0] - 6, Bp[1] + 6, 'B', 'tr');
    if (variant === 'diag') meterOn(g, A[0], A[1], Bp[0], Bp[1], { side: 1 });
    else {
      const xm = A[0] + 24, ym = T0 + S / 2 + 14, yl = BR[1] + 9;
      g.pl([[A[0], A[1]], [xm, A[1]], [xm, ym - 12]], { cls: 'thin' });
      g.pl([[xm, ym + 12], [xm, yl], [Bp[0], yl], [Bp[0], Bp[1]]], { cls: 'thin' });
      g.circle(xm, ym, 12, { cls: 'bgfill' });
      g.label(xm, ym, '\\text{V}', 'c', 'small');
      g.label(xm + 18, ym - 14, '+', 'c', 'small');
      g.label(xm + 18, ym + 14, '-', 'c', 'small');
    }
    g.label(L0 + S / 2, BR[1] + (variant === 'hug' ? 16 : 10), '\\mathbf B = B_0\\hat z', 't', 'small');
    return g.svg();
  }

  // Summer 2018 #3: 2 m square, V1 on the left, V2 on the right (+ at the top), V3 on the diagonal (+ at P); B = -z 3t
  function su18Fig() {
    const g = PF.fig({ scale: 1.35, alt: 'a 2 m square in the xy-plane with corners O at the bottom left and P at the top right; voltmeter V1 on the left side and V2 on the right side, each with its + probe at the top; voltmeter V3 on the diagonal with + at P; B points into the page' });
    const L0 = 40, T0 = 40, S = 150, O = [L0, T0 + S], P = [L0 + S, T0];
    for (const x of [68, 92, 138, 162]) for (const y of [62, 86, 144, 168]) { if (Math.abs(x + y - (O[0] + O[1])) < 26) continue; cross(g, x, y); }
    g.line(L0, T0, P[0], P[1]);
    g.line(O[0], O[1], L0 + S, T0 + S);
    meterOn(g, L0, T0, O[0], O[1], { side: 1 });
    meterOn(g, P[0], P[1], L0 + S, T0 + S, { side: -1 });
    meterOn(g, P[0], P[1], O[0], O[1], { side: -1 });
    g.label(L0 - 16, T0 + S / 2, 'V_1', 'r', 'small');
    g.label(L0 + S + 16, T0 + S / 2, 'V_2', 'l', 'small');
    g.label(L0 + S / 2 + 18, T0 + S / 2 + 18, 'V_3', 'tl', 'small');
    g.head(L0 + S / 2 + 4, T0 + S, 1, 0, { hs: 8 });
    g.label(L0 + S / 2, T0 + S + 8, 'I', 't', 'small');
    g.dot(O[0], O[1], 3); g.dot(P[0], P[1], 3);
    g.label(O[0] - 6, O[1] + 6, 'O', 'tr');
    g.label(P[0] + 6, P[1] - 6, 'P', 'bl');
    g.label(L0 + S / 2, T0 - 8, '\\mathbf B = -3t\\,\\hat z', 'b', 'small');
    return g.svg();
  }

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u3', {
    id: 't10-voltmeters', topic: 10, ref: 'Lecture 14', title: 'Voltmeters and KVL with induced fields',
    steps: [
      R(md`
        !!key Why you care
          Summer 2017 #3 (a diagonal voltmeter across a loop with three resistors, and how to rewire it to read one resistor) and Summer 2018 #3 (two voltmeters on the same two points read +6 V and −6 V; a diagonal one reads 0) are 25-point problems. Lecture 14 asks for $\mathbf E$ inside the rail circuit's resistor. All of them turn on one fact: with changing flux, a voltage depends on the path.

        ### Notation

        - $A$, $B$: two points of a circuit. $P$, $P_1$, $P_2$: paths from one to the other.
        - $\int_P\mathbf E\cdot d\mathbf l$: the line integral of $\mathbf E$ along $P$, in V. In statics it is $V_A - V_B$ for every path.
        - $\emf_{\text{loop}} = \oint\mathbf E\cdot d\mathbf l = -d\Psi/dt$: the emf of a closed loop, its $d\mathbf S$ tied to the direction you go around it by the right-hand rule (RHR).
        - $I$: the circuit current. Through a resistor, $\int\mathbf E\cdot d\mathbf l = +IR$ taken **along** the current, $-IR$ against it.
        - $V_m$: a voltmeter's reading, $\int\mathbf E\cdot d\mathbf l$ from its **+ probe to its − probe** along the path through its leads and its body. $R_m$: its internal resistance (ideal: infinite, no current drawn).
        - PEC: perfect electric conductor, ideal wire. Inside it the tangential $\mathbf E$ is zero.

        ### The idea

        Kirchhoff's voltage law (KVL) is $\oint\mathbf E\cdot d\mathbf l = 0$. It holds only if no flux through the loop is changing. Otherwise $\oint\mathbf E\cdot d\mathbf l = -d\Psi/dt$, and two paths between the same points disagree by exactly that emf:
        $$\int_{P_1}\mathbf E\cdot d\mathbf l - \int_{P_2}\mathbf E\cdot d\mathbf l = \oint_{P_1\ \text{out},\ P_2\ \text{back}}\mathbf E\cdot d\mathbf l = -\frac{d\Psi_{12}}{dt}$$
        $\Psi_{12}$ is the flux through the loop the two paths make. "The voltage between $A$ and $B$" has no meaning until you name the path. A voltmeter names one: its own leads.
      `),
      RF(md`
        ### Step 1: the voltage depends on the path

        [[fig:paths]]

        Go out along $P_1$ and back along $P_2$: that closed loop links the changing flux in the middle, so its emf is not zero, and the two integrals differ by it. Paths that enclose no changing flux between them agree, as in statics.
      `, { paths: { svg: pathFig(), cap: 'P₁ and P₂ join A to B on either side of the changing flux. Their integrals of E differ by the emf of the loop they form.' } }),
      Q(md`**Predict.** Two paths join $A$ to $B$. $\int_{P_1}\mathbf E\cdot d\mathbf l = 2$ V. The loop "out along $P_1$, back along $P_2$" has emf $+5$ V. Then $\int_{P_2}\mathbf E\cdot d\mathbf l$ (from $A$ to $B$) is…`,
        ['$-3$ V', '$7$ V', '$2$ V', '$3$ V'], 0,
        [null, 'That adds the emf. Coming back along $P_2$ contributes $-\\int_{P_2}$, so $2 - \\int_{P_2} = 5$.', 'Equal integrals would mean no changing flux between the paths.', 'Sign: $\\int_{P_2} = 2 - 5$.'],
        md`$\oint = \int_{P_1} - \int_{P_2} = 5$ V, so $\int_{P_2} = 2 - 5 = -3$ V. Same endpoints, different "voltages".`),
      RF(md`
        ### Step 2: where the E is

        In a circuit the field has only a few places to live:
        - **Ideal wire (PEC):** $E_{\text{tan}} = 0$. Any field there would drive an infinite current.
        - **A resistor:** $\mathbf E = \mathbf J/\sigma$, along the current, uniform for a uniform resistor: $E = IR/d$ over its length $d$, and $\int\mathbf E\cdot d\mathbf l = IR$ along the current.
        - **A gap or a voltmeter:** whatever the loop needs to make $\oint\mathbf E\cdot d\mathbf l$ come out right.

        So the whole emf lands on the resistors: around the circuit, $\sum(\pm IR) = \emf$. That is KVL with the emf as the source. What fails is node voltages: the emf sits at no single spot, so the voltage between two nodes depends on the path.

        [[fig:railE]]

        **Lecture 14's rails** ($\emf = 6$ V, $I = 2$ A, $R_1 = 1\ \Omega$ bar, $R_2 = 2\ \Omega$, 2 m long). In $R_2$ the current flows down, so $\mathbf E$ points down: $E_z = -IR_2/\ell = -(2)(2)/2 = -2$ V/m. In the moving bar, $\mathbf J = \sigma(\mathbf E + \mathbf v\times\mathbf B)$: $(E_z + 3)(2\,\text{m}) = IR_1 = 2$ V, so $E_z = -2$ V/m there too. Here $\mathbf B$ is static, so the lab $\mathbf E$ is conservative ($+4$ V down $R_2$, $-4$ V up the bar): the whole emf is the $\mathbf v\times\mathbf B$ push.
      `, { railE: { svg: railEFig(), cap: 'Lecture 14: E is zero in the PEC rails and −2 V/m (down) in both R₂ and the bar; v × B pushes up at 3 V/m in the bar.' } }),
      Q(md`**Predict.** Same rails circuit, but $R_2$ is replaced by $4\ \Omega$ (bar $R_1 = 1\ \Omega$, $\emf = 6$ V, 2 m between the rails). $E_z$ inside the new $R_2$ is…`,
        ['$-2.4$ V/m', '$-3$ V/m', '$+2.4$ V/m', '$-1.2$ V/m'], 0,
        [null, 'That puts the whole 6 V across $R_2$; the bar drops $IR_1$ too.', 'The current still flows down $R_2$, so $\\mathbf E$ points down: $E_z < 0$.', 'That divides by an extra 2: $E = IR_2/\\ell$ with $\\ell = 2$ m.'],
        md`$I = 6/(1 + 4) = 1.2$ A; across $R_2$: $IR_2 = 4.8$ V over 2 m, pointing down: $E_z = -2.4$ V/m.`),
      R(md`
        ### Step 3: what a voltmeter reads

        A voltmeter is a huge resistor $R_m$ between two probes. Its leads are ideal wire. Its reading is $I_mR_m = \int\mathbf E\cdot d\mathbf l$ through it, from + to −. To find it, close a loop: the meter from + to −, then any circuit path $P$ back from − to +. Faraday on that loop gives
        $$V_m = \int_{P:\ +\to-}\mathbf E\cdot d\mathbf l + \emf_{\text{loop}}$$
        the drops along $P$ (from the + probe to the − probe), plus the emf of the loop "meter from + to −, then back along $P$".

        **To read one resistor alone,** run the leads tight along it. The loop of leads and resistor then encloses no flux, $\emf_{\text{loop}} = 0$, and the meter reads its $IR$. Leads that wander around changing flux add that flux's emf to the reading.
      `),
      Q(md`**Predict.** A voltmeter's leads run tight along a resistor $R$ carrying current $I$ in a loop with changing flux. The + probe is on the end where the current **enters** the resistor. It reads…`,
        ['$+IR$', '$-IR$', '$IR$ minus the loop\'s emf', 'nothing definite: the voltage is path dependent'], 0,
        [null, 'Inside the resistor $\\mathbf E$ points along $I$, from the entry end to the exit end: from + to − the integral is positive.', 'The leads hug the resistor, so the loop they make with it encloses no flux.', 'Path dependent, yes, but the path is fixed by the leads: this one gives a definite $IR$.'],
        md`Loop: meter from + to −, back through the resistor against the current: $V_m - IR = 0$ (no flux enclosed), so $V_m = +IR$.`),
      RF(md`
        ### Step 4: two meters on the same two points

        [[fig:su18]]

        **Summer 2018 #3.** A 2 m × 2 m square, $\mathbf B = -3t\,\hat z$ T. Voltmeters $V_1$ (left side) and $V_2$ (right side), each $3\ \text{k}\Omega$, + probes at the top. With $d\mathbf S = +\hat z$, $\Psi = (-3t)(4) = -12t$ Wb, so $\emf = +12$ V counterclockwise from $+z$. The meters are the circuit's only resistors: $I = 12\,\text{V}/6\,\text{k}\Omega = 2$ mA, counterclockwise.
        - $V_1$: the current runs **down** through it, from + to −: $V_1 = +IR_1 = +6$ V.
        - $V_2$: the current runs **up** through it, from − to +: $V_2 = -IR_2 = -6$ V.

        Through the ideal top and bottom wires both meters connect $P$ to $O$, + on the $P$ side. Same two points, readings $+6$ V and $-6$ V. Neither meter is wrong: they read different paths, and the loop they form together links the 12 V.
      `, { su18: { svg: su18Fig(), cap: 'Summer 2018 #3: V₁ and V₂ both join P (+) to O (−), one on each side of the changing flux. V₃ cuts the square along the diagonal.' } }),
      Q(md`**Predict.** In Summer 2018 #3, swap $V_2$'s leads (+ probe now at the bottom). It reads…`,
        ['$+6$ V', '$-6$ V', '$0$', '$+12$ V'], 0,
        [null, 'Swapping + and − flips the sign of $\\int\\mathbf E\\cdot d\\mathbf l$ from + to −.', 'The meter\'s path is the same; only its direction reverses.', 'It still reads only its own $IR_2$; the full 12 V is around both meters together.'],
        md`Now the current runs from + to − through it: $+IR_2 = +6$ V. Both meters agree in sign once you orient them the same way **around the loop**, which is the point: their readings add to the emf.`),
      R(md`
        ### Step 5: a diagonal meter splits the flux

        **Summer 2018 #3(e).** $V_3$ ($3000\ \text{k}\Omega$, draws almost no current) runs along the diagonal from $P$ (+) to $O$ (−). Come back from $O$ to $P$ along the bottom wire and up through $V_2$. The loop "$V_3$ from $P$ to $O$, then bottom, then up $V_2$" encloses the lower-right triangle, counterclockwise, so its emf is half the total: $+6$ V. Going up through $V_2$ runs with the current: $+IR_2 = +6$ V. Faraday on that loop:
        $$V_3 + 0 + 6\ \text{V} = 6\ \text{V} \quad\Rightarrow\quad V_3 = 0$$
        Check with the other triangle (back from $O$ up through $V_1$ and along the top wire): that loop is clockwise, emf $-6$ V; up through $V_1$ is against the current, $-6$ V; $V_3 - 6 = -6$, $V_3 = 0$. ✓ A diagonal meter takes half the flux into its loop, and that half matters as much as the resistors.
      `),
      Q(md`**Predict.** Same circuit, but the changing flux (still $-12$ Wb/s in total along $\hat z$) is concentrated in a thin solenoid passing through the **lower-right** triangle, between the diagonal and $V_2$. $V_1$, $V_2$ and $V_3$ now read…`,
        ['$+6$, $-6$, $+6$ V', '$+6$, $-6$, $0$ V', '$+6$, $-6$, $-6$ V', '$+3$, $-3$, $0$ V'], 0,
        [null, 'The side meters see the same total emf, but $V_3$\'s loop with $V_2$ now encloses **all** the flux: $V_3 + 6 = 12$.', 'That is the reading with the solenoid in the **upper-left** triangle: then $V_3$\'s loop with $V_2$ links none of it, and $V_3 + 6 = 0$.', 'The square still has 12 V around it and 6 kΩ in it: $I = 2$ mA.'],
        md`$I$, $V_1$, $V_2$ depend only on the total emf. $V_3$'s loop with the bottom wire and $V_2$ now links the full 12 V: $V_3 + 6 = 12$, $V_3 = +6$ V. With the solenoid in the other triangle, that loop links nothing: $V_3 + 6 = 0$, $V_3 = -6$ V.`),
      RF(md`
        ### The method

        !!method Reading a voltmeter in an induced field
          1. **Emf and current.** Faraday for the whole circuit; $I = \emf/\sum R$ (a finite-resistance meter is one of the resistors). Direction from the sign, checked by Lenz.
          2. **Mark the drops.** Each resistor: $\mathbf E$ along $I$, $+IR$ along the current. Ideal wire: 0.
          3. **Pick a circuit path $P$** from the + probe to the − probe; add its drops ($+IR$ with the current, $-IR$ against).
          4. **Add the emf of the loop** "meter from + to −, then back along $P$": $-d\Psi/dt$ of the flux it encloses, oriented by the RHR **for that loop**. Zero if the leads hug $P$.
          5. **Check** with the other path to the − probe: same reading.

        ### Worked example

        [[fig:su17]]

        !!graded Problem
          Summer 2017 #3. $R_1 = 1\ \Omega$ (left), $R_2 = 3\ \Omega$ (top) and $R_3 = 2\ \Omega$ (right) make a square loop of area 1 m² in the $xy$-plane; the bottom is ideal wire. $\mathbf B = B_0\hat z$ with $dB_0/dt = -12$ T/s. (a) The emf along $C$ (counterclockwise, up through $R_3$). (b) The current along $C$. (c) The reading of a voltmeter on the diagonal from $A$ (top right, + probe) to $B$ (bottom left). (d) How to reconnect the meter between $A$ and $B$ to read $R_3$'s drop.

        **(a) Emf.** $C$ counterclockwise from $+z$, so $d\mathbf S = +\hat z$ and $\Psi = B_0(1\,\text{m}^2)$.
        $$\emf = -\frac{d\Psi}{dt} = -(1\,\text{m}^2)(-12\,\text{T/s}) = +12\ \text{V}$$

        **(b) Current.** $I = 12\,\text{V}/(1 + 3 + 2)\,\Omega = 2$ A along $C$: up $R_3$, left through $R_2$, down $R_1$. (Lenz: $+\hat z$ flux is falling; counterclockwise current tops it up. ✓)

        **(c) Diagonal meter.** Path $P$ from $A$ to $B$: down through $R_3$ (against $I$: $-IR_3 = -4$ V), then the bottom wire (0). The loop "meter $A\to B$, then $B\to$ bottom-right corner $\to A$" is the lower-right triangle, traversed counterclockwise: emf $= +\tfrac12(12) = +6$ V.
        $$V_m = (-4\ \text{V}) + (+6\ \text{V}) = +2\ \text{V}$$
        Check through $R_2$ and $R_1$: $P'$ from $A$ left through $R_2$ (with $I$: $+6$ V) and down $R_1$ (with $I$: $+2$ V) gives $+8$ V; that loop is the upper-left triangle traversed clockwise, emf $-6$ V. $8 - 6 = 2$ V. ✓ (The key's $V_x + 4 = 12/2$ is the same equation.)

        **(d) Reading $R_3$ alone.** Run the leads from $A$ tight down along $R_3$ and then tight along the bottom wire to $B$. The meter's loop with $R_3$ and the bottom wire encloses no flux, so it reads the drop along that path: $-IR_3 = -4$ V with + at $A$ ($|V| = 4$ V; swap the probes for $+4$ V).

        [[fig:hug]]

        !!mistake Common mistakes
          - Writing "$V_A - V_B$" as one number in a circuit with changing flux. Name the path.
          - Forgetting that the meter's leads are part of its path. Moving them changes the reading.
          - Putting a field, or a drop, in ideal wire.
          - Sign of $IR$: $+IR$ along the current, $-IR$ against it.
          - Orienting the half-loop's emf by $C$. Use the loop you actually traverse (meter + to −, then back along $P$) and the RHR for it.
          - Treating finite-resistance meters as ideal. In Summer 2018 the two 3 kΩ meters **are** the circuit's resistance.
          - Calling one of two disagreeing meters "wrong". Each reads its own path correctly.

        ### Check questions
      `, { su17: { svg: su17Fig('diag'), cap: 'Summer 2017 #3: B out of the page, falling at 12 T/s. The diagonal meter reads A (+) to B (−).' }, hug: { svg: su17Fig('hug'), cap: '(d): the leads hug R₃ and the bottom wire, enclosing no flux, so the meter reads R₃ alone: −4 V with + at A.' } }),
      Q(md`Summer 2018 #3: the 2 m square with two 3 kΩ voltmeters in a field $\mathbf B = -3t\,\hat z$ T. The loop current is…`,
        ['2 mA', '4 mA', '1 mA', '0.5 mA'], 0,
        [null, 'That uses one meter (3 kΩ) for the whole loop; the two are in series.', 'That takes the side (2 m) as the area, giving 6 V. The area is $(2\\ \\text{m})^2 = 4$ m², so $\\emf = 12$ V.', 'That uses the 1 m² of Summer 2017\'s loop (3 V); here the area is 4 m², so $\\emf = 12$ V.'],
        md`$\emf = (3\,\text{T/s})(4\,\text{m}^2) = 12$ V; $I = 12/6000 = 2$ mA, counterclockwise from $+z$.`, { src: 'Summer 2018 Exam 2' }),
      Q(md`Summer 2018 #3(d): $V_1$ (left) and $V_2$ (right), each with its + probe at the top, read…`,
        ['$V_1 = +6$ V, $V_2 = -6$ V', '$V_1 = V_2 = +6$ V', '$V_1 = -6$ V, $V_2 = +6$ V', '$V_1 = V_2 = 0$: both connect the same two points'], 0,
        [null, 'The current runs down one meter and up the other, so with both + probes at the top they disagree in sign.', 'Counterclockwise current runs **down** the left side: from + to − through $V_1$.', 'Same points, different paths: the loop between them links 12 V.'],
        md`Counterclockwise current runs down through $V_1$ (+ to −) and up through $V_2$ (− to +): $+IR = +6$ V and $-IR = -6$ V.`, { src: 'Summer 2018 Exam 2' }),
      Q(md`Summer 2018 #3(e): a 3000 kΩ voltmeter $V_3$ on the diagonal, + at $P$, reads…`,
        ['0 V', '+6 V', '−6 V', '+12 V'], 0,
        [null, 'That is the drop along the left path alone (top wire, down through $V_1$: $+6$ V). Its loop with the meter is clockwise and links half the flux: add $-6$ V.', 'That is the drop along the right path alone (down through $V_2$, against the current: $-6$ V). Add the $+6$ V emf of the lower-right triangle.', 'The diagonal meter links only half the flux with either side.'],
        md`Loop $V_3$ ($P\to O$), bottom wire, up $V_2$: $V_3 + 6\,\text{V} = \tfrac12(12\,\text{V})$, so $V_3 = 0$. It works only because $R_1 = R_2$.`, { src: 'Summer 2018 Exam 2' }),
      Q(md`Summer 2017 #3(d): to make the meter (probes at $A$ and $B$) read the drop across $R_3$ alone, you…`,
        ['run its leads tight along $R_3$ and the bottom wire', 'move the meter far from the loop, keeping the probes at $A$ and $B$', 'use a meter with a larger internal resistance', 'loop the leads once around the square'], 0,
        [null, 'Far-away leads make a big loop with the circuit; it encloses the square\'s flux, so the reading picks up its emf.', 'The issue is the flux enclosed by the leads, not the meter\'s resistance.', 'That adds the full 12 V emf of the square to the reading.'],
        md`The reading is the drop along the path the leads follow, plus the emf of the flux between the leads and that path. Hug $R_3$ and the bottom wire: no flux between, and the meter reads $-IR_3 = -4$ V (+ at $A$).`, { src: 'Summer 2017 Exam 2' }),
      Q(md`In Summer 2017 #3, the diagonal meter's probes are swapped (+ at $B$). It reads…`,
        ['$-2$ V', '$+2$ V', '$-4$ V', '$+6$ V'], 0,
        [null, 'Swapping the probes reverses the direction of the integral.', 'That is the drop across $R_3$ alone.', 'That is the half-flux emf alone.'],
        md`Same path, opposite direction: $-2$ V.`),
      Q(md`In Lecture 14's rails circuit, the tangential $\mathbf E$ inside the PEC rails is…`,
        ['zero', '$-2$ V/m, as in $R_2$', '$3$ V/m, the $\\mathbf v\\times\\mathbf B$ push', 'not defined while the bar moves'], 0,
        [null, 'Perfect conductors carry current with no field: $\\mathbf J = \\sigma\\mathbf E$ with $\\sigma\\to\\infty$.', 'The rails are at rest: no $\\mathbf v\\times\\mathbf B$ in them.', 'It is defined, and it is zero.'],
        md`Ideal wire: $E_{\text{tan}} = 0$. The drops sit in $R_2$ (4 V) and the bar.`),
      Q(md`Why does a meter whose leads hug a resistor read exactly $IR$, even though the flux through the circuit is changing?`,
        ['the loop of leads and resistor encloses no flux, so its emf is zero', 'the meter\'s resistance cancels the induced emf', 'the induced $\\mathbf E$ is zero near the resistor', 'KVL holds for every loop in the circuit'], 0,
        [null, 'The meter\'s resistance only makes its current tiny; it cancels nothing.', 'The induced field is there; it is what drives $I$ through $R$.', 'KVL fails for the circuit loop itself, which links the changing flux.'],
        md`Faraday on the thin loop "meter, then back through the resistor": $V_m - IR = -d\Psi/dt = 0$.`),
      Q(md`A square loop has $R_a = 1\ \Omega$ on its left side and $R_b = 3\ \Omega$ on its right side; the flux through it makes $\emf = 4$ V counterclockwise. Voltmeters hug each resistor, + probes at the top. They read…`,
        ['left $+1$ V, right $-3$ V', 'left $+2$ V, right $-2$ V', 'left $+1$ V, right $+3$ V', 'both $+4$ V'], 0,
        [null, 'That splits the emf equally; each meter reads its own resistor\'s $IR$.', 'Counterclockwise current runs **up** the right side, from − to +: negative.', 'Each meter sees only its resistor\'s drop.'],
        md`$I = 4/(1 + 3) = 1$ A. Left: down through $R_a$, + to −: $+1$ V. Right: up through $R_b$: $-3$ V. The meters sit on the same two nodes and disagree by $\emf = 4$ V.`),
      R(md`
        ### Rapid fire: readings

        **The trick:** reading = drops along a path from + to − ($+IR$ with the current) + the emf of the loop "meter + to −, back along that path". Hugging leads: just the drops.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t10_read', { need: 8 }), { id: 't10-voltmeters.r0' }),
      R(md`
        ### Rapid fire: ideas

        **The trick:** ideal wire has no field; a resistor has $E = IR/d$ along $I$; "voltage between two points" needs a path once flux changes.
      `),
      Object.assign(G('rf_t10_idea', { need: 8 }), { id: 't10-voltmeters.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t10_diag', { need: 2 }),
      G('t10_meters', { need: 2 }),
      G('t10_rails', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  // square loop, R_a on the left, R_b on the right, top and bottom ideal wire; emf e counterclockwise (from the front)
  const SQ = (Ra, Rb, e) => `A square loop has $R_a = ${Ra}\\ \\Omega$ on its left side and $R_b = ${Rb}\\ \\Omega$ on its right side; top and bottom are ideal wire. Changing flux gives $\\emf = ${e}$ V counterclockwise (as you look at it).`;
  const v = (x) => `$${p(+x.toPrecision(3))}$ V`;
  GENS.rf_t10_read = () => one([
    // meter hugging the left resistor, + at top
    () => {
      const Ra = pick([1, 2, 3, 4]), Rb = pick([1, 2, 4, 6]), e = pick([4, 6, 8, 12, -6, -12]);
      const I = e / (Ra + Rb), ans = I * Ra;
      return MC('Left meter', md`${SQ(Ra, Rb, e)} A voltmeter's leads hug $R_a$, + probe at the top. It reads…`, v(ans),
        [[v(-ans), 'Counterclockwise current runs **down** the left side: from the + probe to the − probe it runs with the current.'], [v(e), 'The hugging leads enclose no flux; the meter sees only $R_a$\'s drop.'], [v(e / 2), 'The emf does not split equally; the resistors share it in proportion.'], [v(I * Rb), 'That is $R_b$\'s drop.']],
        md`$I = ${e}/${Ra + Rb} = ${p(+I.toPrecision(3))}$ A counterclockwise, down through $R_a$: $V = +IR_a = ${p(+ans.toPrecision(3))}$ V.`);
    },
    // meter hugging the right resistor, + at top
    () => {
      const Ra = pick([1, 2, 3, 4]), Rb = pick([1, 2, 4, 6]), e = pick([4, 6, 8, 12, -6, -12]);
      const I = e / (Ra + Rb), ans = -I * Rb;
      return MC('Right meter', md`${SQ(Ra, Rb, e)} A voltmeter's leads hug $R_b$, + probe at the top. It reads…`, v(ans),
        [[v(-ans), 'Counterclockwise current runs **up** the right side: from + (top) to − (bottom) is against the current.'], [v(-e), 'The hugging leads enclose no flux; only $R_b$\'s drop counts.'], [v(I * Ra), 'That is $R_a$\'s drop, with the wrong side.'], [v(0), 'There is current through $R_b$, so there is a drop.']],
        md`$I = ${p(+I.toPrecision(3))}$ A counterclockwise, up through $R_b$; top to bottom is against it: $V = -IR_b = ${p(+ans.toPrecision(3))}$ V.`);
    },
    // meter straight down the middle, + at top
    () => {
      let Ra = pick([1, 2, 3]), Rb = pick([1, 3, 5, 7]); if (Ra === Rb) Rb += 2;
      const e = pick([4, 8, 12, -8]), I = e / (Ra + Rb), ans = I * Ra - e / 2;
      return MC('Middle meter', md`${SQ(Ra, Rb, e)} A voltmeter runs straight down the middle, from the top wire (+) to the bottom wire (−), splitting the flux in half. It reads…`, v(ans),
        [[v(I * Ra), 'That is the left drop alone; the meter\'s loop with the left side encloses half the flux.'], [v(I * Ra + e / 2), 'The loop "meter down, left side up" runs clockwise: its emf is $-\\emf/2$.'], [v(0), 'Zero only if $R_a = R_b$.'], [v(-ans), 'Sign: start at the + probe.']],
        md`Path back up the left side: $V_m - IR_a = -\emf/2$ (that loop is clockwise). $V_m = IR_a - \emf/2 = ${p(+(I * Ra).toPrecision(3))} - (${p(e / 2)}) = ${p(+ans.toPrecision(3))}$ V.`);
    },
    // path dependence arithmetic
    () => {
      const a = pick([1, 2, 3, 5, -2]), b = pick([2, 4, 5, 6, -3]);
      return MC('Two paths', md`$\int_{P_1}\mathbf E\cdot d\mathbf l = ${a}$ V from $A$ to $B$. The loop "out along $P_1$, back along $P_2$" has emf $${b}$ V. $\int_{P_2}\mathbf E\cdot d\mathbf l$ from $A$ to $B$ is…`, v(a - b),
        [[v(a + b), 'Coming back along $P_2$ contributes $-\\int_{P_2}$: $' + a + ' - \\int_{P_2} = ' + b + '$.'], [v(a), 'Equal only if no changing flux lies between the paths.'], [v(b - a), 'Sign: $\\int_{P_2} = \\int_{P_1} - \\emf$.']],
        md`$\int_{P_1} - \int_{P_2} = \emf_{\text{loop}}$, so $\int_{P_2} = ${a} - (${b}) = ${a - b}$ V.`);
    },
    // field inside a resistor
    () => {
      const I = pick([0.5, 1, 2, 3]), Rr = pick([2, 4, 5, 10]), d = pick([0.5, 1, 2]);
      const E = I * Rr / d, o = (x) => `$${p(+x.toPrecision(3))}$ V/m`;
      return MC('E in a resistor', md`A uniform resistor $${Rr}\ \Omega$, $${d}$ m long, carries $${I}$ A in a loop driven by a changing flux. $|\mathbf E|$ inside it is…`, o(E),
        [[o(I * Rr), 'That is the drop in V; divide by the length.'], [o(I / (Rr * d)), 'Inverted: $E = IR/d$.'], [o(E / 2), 'No factor ½.']],
        md`$|\mathbf E| = IR/d = (${I})(${Rr})/${d} = ${p(+E.toPrecision(3))}$ V/m, pointing along the current.`);
    },
  ]);

  GENS.rf_t10_idea = () => one([
    () => MC('Ideal wire', md`A loop of ideal (PEC) wire with one resistor links a changing flux. Inside the ideal wire, the tangential $\mathbf E$ is…`, 'zero',
      [['$\\emf$ divided by the wire length', 'That would drive an infinite current in a perfect conductor.'], ['the same as inside the resistor', 'The resistor carries the whole drop; the wire carries none.'], ['$-d\\Psi/dt$', 'That is the emf around the loop, in V, not a field.']],
      'Perfect conductor: $\\mathbf J = \\sigma\\mathbf E$ with $\\sigma\\to\\infty$, so $E_{\\text{tan}} = 0$. The whole emf appears across the resistor.'),
    () => MC('KVL', md`Kirchhoff's voltage law $\oint\mathbf E\cdot d\mathbf l = 0$ fails around a loop when…`, 'the magnetic flux through that loop changes',
      [['the loop contains a resistor', 'Resistors are fine; KVL fails because of changing flux.'], ['the current is large', 'Size of the current is irrelevant.'], ['the loop is made of ideal wire', 'Material is irrelevant; the flux through the loop decides.']],
      md`$\oint\mathbf E\cdot d\mathbf l = -d\Psi/dt$: zero only if the flux through that particular loop is constant.`),
    () => MC('Meter leads', md`You move a voltmeter's leads, keeping the probes on the same two points of a circuit with changing flux. The reading…`, 'can change: the flux between the leads and the circuit changes',
      [['cannot change: the probes did not move', 'The reading is a path integral along the leads, not a property of the two points.'], ['changes only if the meter\'s resistance changes', 'Resistance is irrelevant; the enclosed flux matters.'], ['always drops to zero', 'It changes by the emf of the flux the move adds or removes.']],
      'The reading is $\\int\\mathbf E\\cdot d\\mathbf l$ along the meter\'s own path. Moving the leads changes the path and the flux it encloses with the circuit.'),
    () => MC('Two meters', md`Two ideal voltmeters connect the same two nodes of a loop that links a changing flux, one on each side of it. They read different values. Which is right?`, 'both: each reads its own path',
      [['the one with the larger reading', 'Size does not make a reading right.'], ['neither: voltage has no meaning here', 'Each reading is well defined: $\\int\\mathbf E\\cdot d\\mathbf l$ along that meter\'s path.'], ['their average', 'There is no "true" voltage to average toward.']],
      'Their readings differ by the emf of the loop the two meters form. Nothing is broken.'),
    () => {
      const s = pick([true, false]);
      return MC('Static B', md`A bar slides on rails in a **static** $\mathbf B$. In the lab frame, around the circuit, $\oint\mathbf E\cdot d\mathbf l$ is…`, 'zero: the emf is all $\\mathbf v\\times\\mathbf B$',
        [['the emf, $vB\\ell$', 'The emf is $\\oint(\\mathbf E + \\mathbf v\\times\\mathbf B)\\cdot d\\mathbf l$; the $\\mathbf E$ part alone vanishes since $\\partial\\mathbf B/\\partial t = 0$.'], ['$-d\\Psi/dt$', 'That is the full emf, which here comes from $\\mathbf v\\times\\mathbf B$.'], [s ? 'not defined while the bar moves' : 'infinite in the PEC rails', 'It is defined and finite: zero.']],
        md`$\nabla\times\mathbf E = -\partial\mathbf B/\partial t = 0$: the lab $\mathbf E$ is conservative. In Lecture 14, $+4$ V down $R_2$ and $-4$ V up the bar.`);
    },
    () => {
      const top = pick([true, false]);
      return MC('Where the drop is', md`A ring with one resistor links a changing flux; the ring's wire is ideal. A voltmeter is clipped across the resistor with leads hugging it. Compared with the ring's emf, its reading is…`, 'equal in size: the whole emf sits on the resistor',
        [['zero: the emf is spread around the ring', 'In ideal wire there is no field; the drop concentrates in the resistor.'], [top ? 'half the emf' : 'the emf times the wire\'s share of the length', 'The ideal wire carries no drop at all.'], ['larger than the emf', 'Around the ring, $IR = \\emf$ exactly.']],
        'Around the ring, $\\oint\\mathbf E\\cdot d\\mathbf l = IR = \\emf$, all of it inside the resistor. The hugging leads enclose no flux, so the meter reads $IR$.');
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  GENS.t10_diag = () => {
    const s = pick([0.5, 1, 2]), rate = pick([-24, -12, -6, -3, 3, 6, 12, 24]);
    let Rs = pick([[1, 3, 2], [2, 2, 2], [1, 1, 4], [2, 3, 1], [3, 1, 2], [4, 2, 2], [1, 2, 5]]);
    if (Rs[2] === Rs[0] + Rs[1]) Rs = [Rs[0], Rs[1], Rs[2] + 1];   // keep the diagonal reading nonzero
    const [Rl, Rt, Rr] = Rs, plusA = pick([true, false]), sgn = plusA ? 1 : -1;
    const e = -s * s * rate, I = e / (Rl + Rt + Rr);
    const Vd = sgn * (e / 2 - I * Rr), Vh = sgn * (-I * Rr);
    return {
      title: 'Diagonal voltmeter',
      q: md`A square loop of side $${s}$ m in the $xy$-plane has $R_1 = ${Rl}\ \Omega$ on its left side, $R_2 = ${Rt}\ \Omega$ on top and $R_3 = ${Rr}\ \Omega$ on its right side; the bottom is ideal wire. $\mathbf B = B_0(t)\hat z$ is uniform with $dB_0/dt = ${rate}$ T/s. $A$ is the top-right corner, $B$ the bottom-left. Take $C$ counterclockwise from $+z$. Find $\emf$ and $I$ along $C$; the reading of a voltmeter on the diagonal with its + probe at **${plusA ? 'A' : 'B'}**; and its reading when its leads (same probes) are instead run tight down along $R_3$ and the bottom wire.`,
      parts: [
        N('\\mathcal E\\ \\text{along}\\ C', e, 'V'),
        N('I\\ \\text{along}\\ C', I, 'A'),
        N('V_{\\text{diagonal}}', Vd, 'V'),
        N('V_{\\text{hugging}}', Vh, 'V'),
      ],
      hints: ['$\\emf = -A\\,dB_0/dt$ with $A = s^2$; $I = \\emf/(R_1 + R_2 + R_3)$. Counterclockwise current runs up $R_3$.', 'Diagonal meter: drops along a path from + to − plus the emf of the triangle the meter makes with that path (half the flux; orient it by the RHR for the way you go around it).'],
      sol: sol({
        eq: md`$\emf = -d\Psi/dt$, $\;I = \emf/\sum R$; $\;V_m = \int_{P:\,+\to-}\mathbf E\cdot d\mathbf l + \emf_{\text{loop}}$.`,
        sym: md`With + at $A$ and $P$ = down $R_3$, then the bottom wire: the drop is $-IR_3$, and the loop "meter $A\to B$, bottom wire, up $R_3$" is the lower-right triangle, counterclockwise: $\emf_{\text{loop}} = \emf/2$. So $V_{\text{diag}} = \emf/2 - IR_3$ and $V_{\text{hug}} = -IR_3$${plusA ? '' : '; with + at $B$ both flip sign'}.`,
        sub: md`$$\emf = -(${s}\,\text{m})^2(${rate}\,\text{T/s}) = ${f(e)}\ \text{V}, \qquad I = \frac{${f(e)}}{${Rl + Rt + Rr}} = ${f(I)}\ \text{A}$$
$$V_{\text{diag}} = ${plusA ? '' : '-'}\left(\frac{${f(e)}}{2} - (${f(I)})(${Rr})\right) = ${f(Vd)}\ \text{V}, \qquad V_{\text{hug}} = ${plusA ? '-' : '+'}(${f(I)})(${Rr}) = ${f(Vh)}\ \text{V}$$`,
        ans: md`$\emf = ${f(e)}$ V, $I = ${f(I)}$ A along $C$, $V_{\text{diag}} = ${f(Vd)}$ V, $V_{\text{hug}} = ${f(Vh)}$ V.`,
        check: md`Other path for the diagonal (+ at $A$): left through $R_2$ and down $R_1$, with the current: $I(R_2 + R_1) = ${f(I * (Rt + Rl))}$ V; that triangle is traversed clockwise, $-\emf/2 = ${f(-e / 2)}$ V; sum $${f(I * (Rt + Rl) - e / 2)}$ V, the same as $\emf/2 - IR_3 = ${f(e / 2 - I * Rr)}$ V. ✓`,
      }),
    };
  };

  GENS.t10_meters = () => {
    const s = pick([1, 2, 3]), k = pick([1, 2, 3, 5]), sB = pick([1, -1]);
    const R1 = pick([1, 2, 3, 5]); let R2 = pick([1, 2, 4, 6, 10]); if (R2 === R1) R2 = R1 + 3;
    const e = -s * s * sB * k, I = e / (R1 + R2);                 // V, mA (R in kΩ)
    const V1 = I * R1, V2 = -I * R2, V3 = e / 2 - I * R2;
    return {
      title: 'Two meters and a diagonal',
      q: md`Voltmeters $V_1$ ($${R1}\ \text{k}\Omega$) and $V_2$ ($${R2}\ \text{k}\Omega$) form the left and right sides of a $${s}$ m × $${s}$ m square in the $xy$-plane; the top and bottom are ideal wire. $O$ is the bottom-left corner, $P$ the top-right. Both meters have their + probe at the top. $\mathbf B = ${sB > 0 ? '' : '-'}${k}t\,\hat z$ T. A third, very high-resistance meter $V_3$ runs along the diagonal from $P$ (+) to $O$ (−). Find the emf (counterclockwise from $+z$), the current, and the three readings.`,
      parts: [
        N('\\mathcal E\\ (\\text{ccw})', e, 'V'),
        N('I\\ (\\text{ccw})', I, 'mA'),
        N('V_1', V1, 'V'),
        N('V_2', V2, 'V'),
        N('V_3', V3, 'V'),
      ],
      hints: ['The meters are the circuit\'s resistors: $I = \\emf/(R_1 + R_2)$. Counterclockwise current runs down the left side and up the right side.', '$V_3$: go from $P$ to $O$ through $V_3$, back along the bottom wire and up through $V_2$. That loop encloses the lower-right triangle, counterclockwise: emf $\\emf/2$.'],
      sol: sol({
        eq: md`$\emf = -d\Psi/dt$ with $d\mathbf S = +\hat z$; $\;I = \emf/(R_1 + R_2)$; $\;V_m = \int_{P:+\to-}\mathbf E\cdot d\mathbf l + \emf_{\text{loop}}$.`,
        sym: md`$V_1 = +IR_1$ (current down through it, + to −), $V_2 = -IR_2$ (current up through it), $V_3 + IR_2 = \emf/2$, so $V_3 = \emf/2 - IR_2 = \emf\dfrac{R_1 - R_2}{2(R_1 + R_2)}$.`,
        sub: md`$$\emf = -(${s}\,\text{m})^2(${sB > 0 ? '' : '-'}${k}\,\text{T/s}) = ${f(e)}\ \text{V}, \qquad I = \frac{${f(e)}\ \text{V}}{${R1 + R2}\ \text{k}\Omega} = ${f(I)}\ \text{mA}$$
$$V_1 = ${f(V1)}\ \text{V}, \qquad V_2 = ${f(V2)}\ \text{V}, \qquad V_3 = \frac{${f(e)}}{2} - (${f(I)}\,\text{mA})(${R2}\,\text{k}\Omega) = ${f(V3)}\ \text{V}$$`,
        ans: md`$\emf = ${f(e)}$ V, $I = ${f(I)}$ mA, $V_1 = ${f(V1)}$ V, $V_2 = ${f(V2)}$ V, $V_3 = ${f(V3)}$ V.`,
        check: md`$V_1 - V_2 = I(R_1 + R_2) = \emf$: the two side meters, same two points, differ by the full emf. With $R_1 = R_2$ the diagonal would read 0 (Summer 2018).`,
      }),
    };
  };

  GENS.t10_rails = () => {
    const vv = pick([2, 3, 4, 5]), sv = pick([1, -1]), B0 = pick([0.5, 1, 2]), sB = pick([1, -1]), l = pick([0.5, 1, 2]);
    const R1 = pick([0.5, 1, 2]), R2 = pick([1, 2, 3, 4]);
    const vx = sv * vv, By = sB * B0;
    const e = By * l * vx, I = e / (R1 + R2), Ez2 = -I * R2 / l, Ezb = I * R1 / l - vx * By;
    return {
      title: 'Fields in the rails circuit',
      q: md`As in Lecture 14: $x$ to the right, $z$ up, so $\hat y$ points into the page. Ideal rails along $x$ at $z = \pm${p(l / 2)}$ m are joined at $x = 0$ by $R_2 = ${R2}\ \Omega$. A bar of resistance $R_1 = ${R1}\ \Omega$ slides on them (at $x > 0$) with $\mathbf v = ${sv > 0 ? '' : '-'}${vv}\hat x$ m/s. $\mathbf B = ${sB > 0 ? '' : '-'}${B0}\hat y$ T. Take $C$ counterclockwise on the page. Find $\emf$ and $I$ along $C$, $E_z$ inside $R_2$, and $E_z$ (the lab-frame electric field) inside the bar.`,
      parts: [
        N('\\mathcal E\\ \\text{along}\\ C', e, 'V'),
        N('I\\ \\text{along}\\ C', I, 'A'),
        N('E_z\\ \\text{in}\\ R_2', Ez2, 'V/m'),
        N('E_z\\ \\text{in the bar}', Ezb, 'V/m'),
      ],
      hints: ['Counterclockwise on the page puts $d\\mathbf S = -\\hat y$: $\\Psi = -B_y\\ell x(t)$. Along $C$ the current goes up the bar ($+z$) and down $R_2$ ($-z$).', 'In $R_2$, $\\mathbf E$ points along the current: $E_z = -IR_2/\\ell$. In the bar, $\\mathbf J = \\sigma(\\mathbf E + \\mathbf v\\times\\mathbf B)$: $(E_z + v_xB_y)\\ell = IR_1$.'],
      sol: sol({
        eq: md`$\emf = -d\Psi/dt$, $\Psi = -B_y\ell x(t)$; $\;I = \emf/(R_1 + R_2)$; in $R_2$: $\mathbf E = \mathbf J/\sigma$; in the bar: $\mathbf J = \sigma(\mathbf E + \mathbf v\times\mathbf B)$, $(\mathbf v\times\mathbf B)_z = v_xB_y$.`,
        sym: md`$\emf = B_y\ell v_x$, $\;E_z^{R_2} = -IR_2/\ell$, $\;E_z^{\text{bar}} = IR_1/\ell - v_xB_y$ (the two are equal: the lab $\mathbf E$ is conservative because $\mathbf B$ is static).`,
        sub: md`$$\emf = (${f(By)})(${l})(${f(vx)}) = ${f(e)}\ \text{V}, \qquad I = \frac{${f(e)}}{${R1 + R2}} = ${f(I)}\ \text{A}$$
$$E_z^{R_2} = -\frac{(${f(I)})(${R2})}{${l}} = ${f(Ez2)}\ \text{V/m}, \qquad E_z^{\text{bar}} = \frac{(${f(I)})(${R1})}{${l}} - (${f(vx)})(${f(By)}) = ${f(Ezb)}\ \text{V/m}$$`,
        ans: md`$\emf = ${f(e)}$ V, $I = ${f(I)}$ A, $E_z = ${f(Ez2)}$ V/m in $R_2$ and $${f(Ezb)}$ V/m in the bar.`,
        check: md`Lab $\oint\mathbf E\cdot d\mathbf l$ counterclockwise: $E_z^{\text{bar}}\ell - E_z^{R_2}\ell = ${f(Ezb * l)} - (${f(Ez2 * l)}) = 0$, as it must be for a static $\mathbf B$. With $B_y = 1$, $\ell = 2$, $v_x = 3$, $R_1 = 1$, $R_2 = 2$ this gives Lecture 14's $-2$ V/m.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t10-voltmeters'] = [
    Q(md`A voltmeter reads…`,
      ['$\\int\\mathbf E\\cdot d\\mathbf l$ from its + probe to its − probe, along its own leads and body', 'the potential difference between its probes, the same for any leads', 'the emf of the circuit it is attached to', 'the current through it times the circuit resistance'], 0,
      [null, 'True only when no changing flux threads the region between possible lead paths.', 'Only if its leads enclose all the changing flux with a resistance-free path.', 'It reads its own current times its own resistance.'],
      md`Its reading is $I_mR_m$, which equals $\int\mathbf E\cdot d\mathbf l$ through the meter from + to −.`),
    Q(md`Around a loop of wire with one resistor, linking a changing flux, the integral of $\mathbf E$ through the resistor (along the current) equals…`,
      ['the emf of the loop', 'zero', 'half the emf', 'the emf times the resistor\'s share of the loop length'], 0,
      [null, 'Only if the flux were constant.', 'All of the emf lands on the only resistor.', 'The ideal wire has no field, whatever its length.'],
      md`$\oint\mathbf E\cdot d\mathbf l = 0 + IR = \emf$.`),
    Q(md`Two paths from $A$ to $B$ enclose between them a region with **constant** flux. Their integrals of $\mathbf E$…`,
      ['are equal', 'differ by the flux', 'differ by the emf of the circuit', 'cannot be compared'], 0,
      [null, 'Only the **change** in flux makes an emf.', 'They differ by the emf of the loop **they** form, which is zero here.', 'They can: their difference is the emf of the loop they form.'],
      md`$\int_{P_1} - \int_{P_2} = -d\Psi_{12}/dt = 0$.`),
    Q(md`Inside a uniform resistor of length $d$ carrying $I$, the field is…`,
      ['$IR/d$, pointing along the current', '$IR/d$, pointing against the current', '$IR$, along the current', 'zero: resistors only dissipate'], 0,
      [null, 'Current flows along $\\mathbf E$ in a resistor: $\\mathbf J = \\sigma\\mathbf E$.', 'Units: $IR$ is a voltage; divide by $d$.', 'Dissipation needs $\\mathbf E\\cdot\\mathbf J > 0$.'],
      md`$\mathbf J = \sigma\mathbf E$ and $\int\mathbf E\cdot d\mathbf l = IR$ along it.`),
    Q(md`Summer 2018 #3 used 3 kΩ voltmeters as the loop's only resistance. If they had been ideal (infinite $R_m$), the loop current would have been…`,
      ['zero, and each meter would have read half of the emf in size', 'the same 2 mA', 'infinite', 'zero, and both meters would read zero'], 0,
      [null, 'Infinite resistance allows no current.', 'Zero resistance would give infinite current, not infinite resistance.', 'With no current, the field does not vanish: each meter takes up its part of the emf, set by the geometry (here by symmetry, 6 V each).'],
      md`Two identical ideal meters split the emf by symmetry: $V_1 - V_2 = 12$ V with $V_1 = -V_2 = 6$ V. The readings come from the field, not from the current.`),
    Q(md`A voltmeter's leads form a loop of area $A$ in a region where $\mathbf B$ is uniform, normal to the loop, and $|d\mathbf B/dt| = b$, with no circuit inside it (the probes touch each other). It reads…`,
      ['$Ab$ in size', '0: the probes are at the same point', '$b$', 'it depends on the meter\'s resistance'], 0,
      [null, 'Same point, but the path through the meter is a closed loop linking a changing flux.', 'Units: an emf needs an area times $dB/dt$.', 'Ideal or not, it reads $\\oint\\mathbf E\\cdot d\\mathbf l$ around its own loop.'],
      md`The meter and its leads are a loop: $V_m = -d\Psi/dt = \pm Ab$. This is how a pickup coil works.`),
    Q(md`The induced field $\mathbf E$ of a changing $\mathbf B$ inside a solenoid circulates outside it too. Can it be written as $-\nabla V$?`,
      ['No: its loop integral around the solenoid is not zero', 'Yes, outside the solenoid where $\\mathbf B = 0$', 'Yes, everywhere', 'Only inside the solenoid'], 0,
      [null, 'Locally its curl is zero outside, but a loop around the solenoid has a nonzero integral, so no single-valued $V$ exists.', 'A gradient field has zero integral around every loop.', 'Inside, its curl is $-\\partial\\mathbf B/\\partial t \\ne 0$.'],
      md`$\oint\mathbf E\cdot d\mathbf l = -d\Psi/dt \ne 0$ around the solenoid: no potential can do that.`),
    Q(md`Two identical resistors $R$ in a ring, one on each side of a solenoid whose flux changes to give $\emf$. Meters hugging each resistor, both oriented the same way **around the ring**, read…`,
      ['$\\emf/2$ each, and their sum is $\\emf$', '$\\emf$ each', '$\\emf/2$ and $-\\emf/2$, summing to zero', '0 each'], 0,
      [null, 'Each sees only its own $IR = \\emf/2$.', 'Oriented the same way around the ring, they add up to the emf.', 'There is current, so there are drops.'],
      md`$I = \emf/2R$; each drop $IR = \emf/2$. Oriented around the ring, the drops add to $\emf$. (Oriented between the same two nodes, they read $+\emf/2$ and $-\emf/2$.)`),
    Q(md`In the diagonal-meter problems, why does the meter's loop pick up exactly **half** the flux?`,
      ['the diagonal cuts the square into two equal triangles, and the field is uniform', 'a voltmeter always reads half the emf', 'the meter\'s resistance halves the emf', 'the current splits in half at the corners'], 0,
      [null, 'Only for this geometry and a uniform field.', 'Resistance plays no role in the enclosed flux.', 'An ideal meter draws no current; nothing splits.'],
      md`Uniform $\partial\mathbf B/\partial t$ over two equal areas. Concentrate the flux in one triangle and the half becomes all or nothing.`),
    Q(md`You twist a voltmeter's leads tightly together all the way to the circuit. The flux they add to the reading is…`,
      ['zero: the twisted pair encloses no area', 'doubled', 'the full flux of the circuit', 'unpredictable'], 0,
      [null, 'A twisted pair encloses (almost) no area, so it links no flux.', 'Twisting is not about the circuit\'s flux; it removes the leads\' own pickup.', 'Each twist reverses orientation; tiny areas cancel.'],
      md`Twisted leads are standard practice for exactly this reason: they kill induced pickup.`),
    Q(md`In Lecture 14's rails circuit the lab-frame $\mathbf E$ inside the moving bar points…`,
      ['down ($-z$), against the current', 'up ($+z$), along the current', 'nowhere: $\\mathbf E = 0$ in a conductor', 'along $\\mathbf v$'], 0,
      [null, 'The current flows up in the bar, driven by $\\mathbf v\\times\\mathbf B$, which beats the downward $\\mathbf E$.', 'Charges pile up at the bar\'s ends and make a field; inside a resistive bar carrying current it is not zero.', 'The field is along the bar.'],
      md`$(E_z + 3)(2) = IR_1 = 2$, so $E_z = -2$ V/m: the piled-up charge pushes back, but $\mathbf v\times\mathbf B$ wins by 1 V/m. A battery works the same way inside.`),
    Q(md`A meter clipped across a resistor reads less than $IR$ in a circuit with changing flux. The likely cause is…`,
      ['its leads enclose part of the changing flux, opposing the drop', 'the resistor is overheating', 'the meter draws too much current', 'KVL'], 0,
      [null, 'Temperature changes $R$ but the reading would still be the drop $IR$.', 'A good meter draws negligible current.', 'KVL fails here; it does not explain anything.'],
      md`$V_m = IR + \emf_{\text{loop}}$; a lead loop with opposing orientation subtracts its emf.`),
    Q(md`For a loop with **no** changing flux anywhere (a DC circuit), two meters on the same two nodes but on opposite sides of the circuit read…`,
      ['the same', 'opposite values', 'values differing by the battery emf', 'zero'], 0,
      [null, 'Opposite readings need flux changing between their paths.', 'With static fields, $\\mathbf E = -\\nabla V$ and readings depend only on the endpoints.', 'Zero only if the nodes are at the same potential.'],
      md`Statics: path independence. The disagreement is a purely induction effect.`),
    Q(md`Which quantity is the same for every path between two points in a circuit with changing flux?`,
      ['none of the line integrals of $\\mathbf E$ in general', '$\\int\\mathbf E\\cdot d\\mathbf l$', 'the voltmeter reading', 'the emf'], 0,
      [null, 'It depends on the path as soon as flux changes between paths.', 'The reading depends on where the leads run.', 'Emf belongs to a closed loop, not to a pair of points.'],
      md`Only once you fix the path is the "voltage" defined.`),
    Q(md`A small square loop with two resistors $R$ and $3R$ (on opposite sides) links a flux increasing so that $\emf = 8$ V. The **larger** of the two hugging-meter readings has magnitude…`,
      ['6 V', '4 V', '8 V', '2 V'], 0,
      [null, 'That splits the emf equally; the drops are proportional to the resistances.', 'Each meter sees only its own resistor.', 'That is the smaller one.'],
      md`$I = 8/4R$; drops $2$ V and $6$ V.`),
  ];
})();

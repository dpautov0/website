/* Topic 11 — Inductance and magnetic energy (Lecture 15b). L = Λ/I = NΨ/I by Lecture 15's steps; the inductor's emf;
   solenoid, toroid with a rectangular section (Spring 2018 #2), coax, parallel-plate line (Spring 2018 #3); stored
   energy ½LI² = ∫½μH²dV; mutual inductance (HW 6 #4, nested solenoids of Summer 2017 #1(b) and Summer 2020 #2(b));
   L'C' = με and Lecture 15's challenge question. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick } = U;
  const mu0 = EM.mu0;

  // ---------------------------------------------------------------- figures
  // a solenoid from the side: n turns per meter over length l, B along the axis inside
  function coilFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a long solenoid seen from the side; the field inside points along the axis and is uniform' });
    g.coil(40, 70, 210, 64, 11);
    for (const y of [56, 70, 84]) g.arrow(54, y, 236, y, { cls: 'dim thin', hs: 6 });
    g.label(258, 70, '\\mathbf B = \\mu nI\\,\\hat z', 'l', 'small');
    g.dim(40, 120, 250, 120, '\\ell', { at: 'b' });
    return g.svg();
  }

  // Spring 2018 #2, "view of one turn": the cross-section a < r < b, 0 < z < h; phi-hat into the page
  function torFig() {
    const g = PF.fig({ scale: 1.15, alt: 'the cross-section of a toroidal coil between r = a and r = b and z = 0 to h; one turn carries current up its inner side, out along the top, down its outer side and back along the bottom; B points into the page, stronger near r = a' });
    const ax = 24, xa = 96, xb = 196, yt = 40, yb = 130;
    g.line(ax, 18, ax, 152, { cls: 'dim dash thin' });
    g.label(ax + 4, 16, 'z\\ \\text{axis}', 'bl', 'small accent');
    for (const [x, k] of [[112, 4.6], [138, 3.8], [162, 3.2], [182, 2.7]]) for (const y of [62, 85, 108]) g.add(`<path class="dim thin nodecl" d="M${x - k},${y - k}L${x + k},${y + k}M${x + k},${y - k}L${x - k},${y + k}"/>`);
    g.track(105, 55, 186, 113);
    g.rect(xa, yt, xb - xa, yb - yt, { cls: 'thick' });
    g.head(xa, 88, 0, -1, { hs: 9 }); g.head(150, yt, 1, 0, { hs: 9 }); g.head(xb, 82, 0, 1, { hs: 9 }); g.head(142, yb, -1, 0, { hs: 9 });
    g.label(xa - 8, 85, 'I', 'r');
    g.dim(ax, 146, xa, 146, 'a');
    g.dim(ax, 164, xb, 164, 'b', { at: 'b' });
    g.dim(xb + 14, yt, xb + 14, yb, 'h');
    g.label(150, 186, '\\hat\\phi\\ \\text{into the page}', 't', 'small');
    return g.svg();
  }

  // a coax cut along its axis: inner conductor radius a, outer radius b, the flux surface shaded (length l)
  function coaxFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a coaxial cable cut along its axis; current I flows right in the inner conductor and returns left in the outer one; the flux surface is the rectangle between r = a and r = b, of length l, where H points out of the page' });
    const y0 = 100, ya = 18, yb = 56, x0 = 24, x1 = 268, s0 = 84, s1 = 214;
    g.add(`<path class="shade nodecl" d="M${s0},${y0 - yb}L${s1},${y0 - yb}L${s1},${y0 - ya}L${s0},${y0 - ya}Z"/>`);
    g.line(x0, y0 - yb, x1, y0 - yb, { cls: 'thick' }); g.line(x0, y0 + yb, x1, y0 + yb, { cls: 'thick' });
    g.line(x0, y0 - ya, x1, y0 - ya); g.line(x0, y0 + ya, x1, y0 + ya);
    for (const x of [104, 134, 164, 194]) g.odot(x, y0 - 37, 4.5);
    g.arrow(130, y0, 176, y0, { hs: 7 }); g.label(180, y0, 'I', 'l', 'small');
    g.arrow(176, y0 - yb - 10, 130, y0 - yb - 10, { hs: 7 }); g.label(126, y0 - yb - 10, 'I', 'r', 'small');
    g.dim(x1 + 10, y0, x1 + 10, y0 - ya, 'a');
    g.dim(x1 + 30, y0, x1 + 30, y0 - yb, 'b');
    g.dim(s0, y0 + yb + 14, s1, y0 + yb + 14, '\\ell', { at: 'b' });
    return g.svg();
  }

  // Spring 2018 #3: two plates d apart, width w (into the page), length l; shorted at the far end
  function plateFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a parallel-plate line seen from the side: a source at the left drives current right along the top plate, through the short at the far end, and back left along the bottom plate; B between the plates points into the page' });
    const x0 = 74, x1 = 292, yt = 44, yb = 104;
    g.line(x0, yt, x1, yt, { cls: 'thick' }); g.line(x0, yb, x1, yb, { cls: 'thick' });
    g.line(x1, yt, x1, yb);
    g.pl([[x0, yt], [50, yt], [50, 62]]); g.pl([[50, 86], [50, yb], [x0, yb]]);
    g.circle(50, 74, 12, { cls: 'bgfill' });
    g.arrow(50, 81, 50, 66, { hs: 6 });
    g.label(34, 74, 'I', 'r');
    for (const x of [112, 150, 188, 226, 264]) for (const y of [64, 84]) g.add(`<path class="dim thin nodecl" d="M${x - 3},${y - 3}L${x + 3},${y + 3}M${x + 3},${y - 3}L${x - 3},${y + 3}"/>`);
    g.track(100, 58, 270, 90);
    g.head(186, yt, 1, 0, { hs: 9 }); g.head(178, yb, -1, 0, { hs: 9 });
    g.label(186, yt - 8, '\\mathbf J_s = \\tfrac{I}{w}\\hat z', 'b', 'small');
    g.label(178, yb + 8, '\\mathbf J_s = -\\tfrac{I}{w}\\hat z', 't', 'small');
    g.dim(x1 + 14, yt, x1 + 14, yb, 'd');
    g.dim(x0, yb + 48, x1, yb + 48, 'l', { at: 'b' });
    const ox = 20, oy = 170;
    g.arrow(ox, oy, ox + 30, oy, { cls: 'dim', hs: 5 }); g.label(ox + 34, oy, 'z', 'l', 'small accent');
    g.arrow(ox, oy, ox, oy - 30, { cls: 'dim', hs: 5 }); g.label(ox, oy - 34, 'x', 'b', 'small accent');
    g.odot(ox, oy, 4); g.label(ox - 6, oy + 6, 'y', 'tr', 'small accent');
    return g.svg();
  }

  // HW 6 #4: a big loop a, a small coaxial loop b at height z moving up
  function loopsFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a large horizontal loop of radius a carrying current counterclockwise seen from above, and a small coaxial loop of radius b a height z above it, moving up' });
    const cx = 150, cy = 124;
    g.line(cx, 150, cx, 18, { cls: 'dim dash thin' });
    g.ellipse(cx, cy, 104, 26, { half: 'back', cls: 'dim' });
    g.ellipse(cx, cy, 104, 26, { half: 'front', cls: 'thick' });
    g.head(cx + 6, cy + 26, 1, 0, { hs: 9 });
    g.label(cx + 70, cy + 26, 'I_a', 'tl', 'small');
    g.line(cx, cy, cx + 104, cy, { cls: 'dim thin' }); g.label(cx + 60, cy - 4, 'a', 'b', 'small');
    g.ellipse(cx, 64, 20, 6, { half: 'back', cls: 'dim' });
    g.ellipse(cx, 64, 20, 6, { half: 'front', cls: 'thick' });
    g.label(cx + 24, 64, 'b', 'l', 'small');
    g.arrow(cx + 40, 74, cx + 40, 40, { hs: 7 }); g.label(cx + 46, 50, 'v', 'l', 'small');
    g.dim(cx - 34, cy, cx - 34, 64, 'z', { at: 'l' });
    return g.svg();
  }

  // nested solenoids, end view: outer a1 carries I1, inner a2 carries I2 the other way; B = 0 inside a2
  function nestedFig() {
    const g = PF.fig({ scale: 1.15, alt: 'end view of two coaxial solenoids; the outer one carries current counterclockwise, the inner one clockwise; between them B points out of the page, inside the inner one B is zero' });
    const cx = 110, cy = 100;
    for (const [dx, dy] of [[-55, 0], [55, 0], [0, -55], [0, 55], [-39, -39], [39, -39], [-39, 39], [39, 39]]) g.dot(cx + dx, cy + dy, 2, { cls: 'dimfill' });
    g.loopCirc(cx, cy, 72, { dir: 'ccw' });
    g.loopCirc(cx, cy, 34, { dir: 'cw' });
    g.label(cx, cy, '\\mathbf B = 0', 'c', 'small');
    g.label(cx + 56, cy - 70, 'n_1, I_1', 'bl', 'small');
    g.label(cx - 22, cy - 40, 'I_2', 'c', 'small');
    g.label(cx + 80, cy + 10, '\\mu_0n_1I_1\\ \\text{out}', 'l', 'small');
    return g.svg();
  }

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u3', {
    id: 't11-inductance', topic: 11, ref: 'Lecture 15', title: 'Inductance and magnetic energy',
    steps: [
      R(md`
        !!key Why you care
          Spring 2018 #2 (20 pts: the flux, linkage and emf of a toroidal coil) and #3 (25 pts: a parallel-plate line's $\mathbf J_s$, $\mathbf B$, $\psi$, $L$ and how they scale). HW 6 #4 (mutual inductance of concentric loops, the emf of a moving loop, its differential equation). Summer 2017 #1(b) and Summer 2020 #2(b) (nested solenoids: cancel the field, then Lenz). Lecture 15 adds the stored energy and $L'C' = \mu\epsilon$.

        ### Notation

        - $I$: the current in the circuit, in A.
        - $N$: number of turns. $n = N/\ell$: turns per meter. (Lecture 15 and the summer exams call the turns per meter $N$: read each problem.)
        - $\Psi$: flux through **one** turn, in Wb. $\Lambda = N\Psi$: the **flux linkage**, in Wb (Wb-turns).
        - $L = \Lambda/I$: self-inductance, in henry, $\text{H} = \text{Wb/A} = \text{V·s/A}$.
        - $M$ (or $L_{ab}$) $= \Lambda_b/I_a$: mutual inductance, the linkage of circuit $b$ per ampere in circuit $a$, in H.
        - $L' = L/\ell$, $C'$: inductance and capacitance per unit length of a long line, H/m and F/m. (Lecture 15 writes $\mathcal L$ and $\mathcal C$.)
        - $W_m$: stored magnetic energy, J. $w_m = \tfrac12\mu H^2$: energy per volume, J/m³.
        - $\mu = \mu_r\mu_0$, $\epsilon$: permeability (H/m) and permittivity (F/m).
        - $v_L = L\,dI/dt$: the voltage across an inductor, + at the end where $I$ enters.

        ### The idea

        A current makes $\mathbf B$, and $\mathbf B$ threads the circuit's own turns, so the linkage is proportional to the current: $\Lambda = LI$. $L$ is pure geometry (times $\mu$). When $I$ changes, Faraday's law makes an emf that fights the change, and building up the current stores energy in the field:
        $$L = \frac{\Lambda}{I} = \frac{N\Psi}{I} \qquad \emf = -\frac{d\Lambda}{dt} = -L\frac{dI}{dt} \qquad W_m = \tfrac12LI^2 = \int_V\tfrac12\mu H^2\,dV$$
      `),
      R(md`
        ### Step 1: the recipe

        Lecture 15's steps, for any shape:
        1. Assume a current $I$. **Ampère's law** gives $\mathbf H$.
        2. $\mathbf B = \mu\mathbf H$.
        3. **Flux through one turn:** $\Psi = \int_S\mathbf B\cdot d\mathbf S$ over the surface that one turn bounds.
        4. **Linkage:** $\Lambda = N\Psi$.
        5. **Divide:** $L = \Lambda/I$. The $I$ must cancel; if it does not, something is wrong. For a long line, $L' = L/\ell$.

        As a circuit element, the voltage across an inductor is $v_L = L\,dI/dt$, with + where the current enters. Its emf $-L\,dI/dt$ opposes any change in $I$ (Lenz): it pushes back against a rising current and keeps a falling one going.
      `),
      Q(md`**Predict.** The current through a coil is increasing. The emf induced in the coil by its own changing flux…`,
        ['pushes against the current', 'pushes along the current, speeding the rise', 'is zero: a coil cannot induce an emf in itself', 'depends on which way the coil is wound'], 0,
        [null, 'That would feed the change, creating energy from nothing.', 'Self-inductance is exactly this: the coil links its own flux.', 'Reversing the winding reverses the field and the induced emf together; it still opposes the change.'],
        md`$\emf = -L\,dI/dt < 0$ along the current: the coil fights the rise. The source must supply $v_L = L\,dI/dt$ extra, and that work becomes field energy.`),
      RF(md`
        ### Step 2: the solenoid

        [[fig:coil]]

        Long solenoid, $n$ turns per meter, cross-section $A$, length $\ell$. Ampère: $H = nI$ inside, 0 outside. $B = \mu nI$; one turn links $\Psi = \mu nIA$; there are $N = n\ell$ turns:
        $$\Lambda = (n\ell)(\mu nIA) \quad\Rightarrow\quad L = \mu n^2A\ell = \frac{\mu N^2A}{\ell}$$
        $L \propto N^2$: $N$ turns make the field, and $N$ turns link it. Example: $n = 1000$ /m, $A = 1\ \text{cm}^2$, $\ell = 10$ cm: $L = (4\pi\times10^{-7})(10^6)(10^{-4})(0.1) = 12.6\ \mu$H.
      `, { coil: { svg: coilFig(), cap: 'Inside a long solenoid B = μnI, uniform; outside it is zero.' } }),
      Q(md`**Predict.** A solenoid of $N$ turns is stretched to twice its length, same $N$, same radius. Its inductance becomes…`,
        ['half', 'twice', 'four times', 'the same'], 0,
        [null, 'Fixed $N$: the turns per meter halve, so $B$ halves; $L = \\mu N^2A/\\ell$.', 'That would be doubling the length at fixed turns **per meter** (more turns).', 'Area is unchanged; only $\\ell$ changed, once.'],
        md`$L = \mu N^2A/\ell$ with $N$ fixed: $\ell\to2\ell$ halves $L$. (At fixed $n$ instead, $L = \mu n^2A\ell$ doubles: you added turns.)`),
      RF(md`
        ### Step 3: toroid, coax, parallel plates

        **Toroid with a rectangular section (Spring 2018 #2).** $N$ turns on a core $a < r < b$, $0 < z < h$. Ampère around a circle of radius $r$ inside: $H_\phi\,2\pi r = NI$. The field falls as $1/r$, so integrate:
        $$\Psi_1 = \int_a^b\!\int_0^h\frac{\mu_0NI}{2\pi r}\,dz\,dr = \frac{\mu_0NIh}{2\pi}\ln\frac ba \qquad \Lambda = N\Psi_1 \qquad L = \frac{\mu_0N^2h}{2\pi}\ln\frac ba$$

        [[fig:tor]]

        **Coax.** $H_\phi = I/2\pi r$ between the conductors. The surface the current loop bounds is a rectangle in a plane containing the axis, from $r = a$ to $b$ and length $\ell$:
        $$\Psi = \int_0^\ell\!\int_a^b\frac{\mu I}{2\pi r}\,dr\,dz = \frac{\mu I\ell}{2\pi}\ln\frac ba \qquad L' = \frac{\mu}{2\pi}\ln\frac ba$$

        [[fig:coax]]

        **Parallel-plate line (Spring 2018 #3).** Plates of width $w$, $d$ apart, length $l$, shorted at the far end; $I$ goes out on the top plate and back on the bottom. Each plate is a sheet with $J_s = I/w$, opposite directions. Between the plates their fields add, outside they cancel:
        $$B = \mu_0J_s = \frac{\mu_0I}{w} \qquad \psi = B\,ld = \frac{\mu_0Ild}{w} \qquad L = \frac{\mu_0ld}{w},\quad L' = \frac{\mu_0d}{w}$$

        [[fig:plate]]
      `, { tor: { svg: torFig(), cap: 'Spring 2018 #2, one turn: current up the inner side, out along the top. B = μ₀NI/2πr into the page (along φ̂), strongest at r = a.' }, coax: { svg: coaxFig(), cap: 'Coax cut along its axis: the flux surface (shaded) is the rectangle between the conductors, where H = I/2πr crosses it.' }, plate: { svg: plateFig(), cap: 'Spring 2018 #3: the two plates are opposite current sheets; B = μ₀I/w fills the gap (into the page here) and vanishes outside.' } }),
      Q(md`**Predict.** Spring 2018 #3(e): the plate separation is doubled to $2d$ and the current halved to $I/2$. $|\mathbf B|$, $\psi$ and $L$ scale by…`,
        ['0.5, 1.0, 2.0', '0.5, 0.5, 2.0', '0.25, 0.5, 2.0', '1.0, 2.0, 2.0'], 0,
        [null, '$\\psi = Bld$: $B$ halves and $d$ doubles, so $\\psi$ is unchanged.', 'B depends on $I/w$ only, not on $d$: it halves, not quarters.', '$B = \\mu_0I/w$ halves with $I$; it does not depend on $d$.'],
        md`$B = \mu_0I/w$: ×0.5. $\psi = \mu_0Ild/w$: $(0.5)(2) = 1$. $L = \mu_0ld/w$: ×2 (geometry only, no $I$).`),
      R(md`
        ### Step 4: stored energy

        The source pushes current against the inductor's emf, with power $p = v_LI = LI\,dI/dt = \frac{d}{dt}\big(\tfrac12LI^2\big)$. Starting from zero current, the work done is
        $$W_m = \tfrac12LI^2 = \int_V\tfrac12\mu H^2\,dV$$
        The energy sits in the field, $w_m = \tfrac12\mu H^2$ per volume. Solenoid check: $\tfrac12\mu(nI)^2\cdot A\ell = \tfrac12(\mu n^2A\ell)I^2$. ✓

        This gives a second route to inductance, $L = 2W_m/I^2$. Coax: $\int_a^b\tfrac12\mu\big(\tfrac{I}{2\pi r}\big)^2\,2\pi r\ell\,dr = \frac{\mu I^2\ell}{4\pi}\ln\frac ba$, so $L = \frac{\mu\ell}{2\pi}\ln\frac ba$, as before.
      `),
      Q(md`**Predict.** The current in a solenoid doubles. Its inductance and stored energy become…`,
        ['$L$ the same, $W_m$ four times', 'both double', '$L$ doubles, $W_m$ four times', '$L$ the same, $W_m$ doubles'], 0,
        [null, '$L$ is geometry; it does not change with $I$.', '$L$ does not depend on $I$.', '$W_m = \\tfrac12LI^2$: squared.'],
        md`$\Lambda$ doubles with $I$, so $L = \Lambda/I$ is fixed; $W_m = \tfrac12LI^2$ quadruples, as does $\tfrac12\mu H^2$ everywhere.`),
      RF(md`
        ### Step 5: mutual inductance

        Circuit $a$'s current links circuit $b$: $M = \Lambda_b/I_a$, and $M_{ab} = M_{ba}$. Then $\emf_b = -M\,dI_a/dt$, or $-I_a\,dM/dt$ if $b$ moves.

        **Concentric loops, $a \gg b$ (HW 6 #4).** At the center of loop $a$, $B = \mu_0I_a/2a$, nearly uniform over the small loop:
        $$\Psi_{ab} \approx \frac{\mu_0I_a}{2a}\,\pi b^2 \qquad M = \frac{\mu_0\pi b^2}{2a}$$
        For $a = 8$ cm, $b = 0.5$ cm: $M = 6.17\times10^{-10}$ H. If loop $b$ rises along the axis, use the on-axis field $B_z = \mu_0I_aa^2/2(a^2 + z^2)^{3/2}$: $\emf_b = -\pi b^2\,\frac{dB_z}{dz}\,v$. With its own $L_b$ and $R_b$, the total linkage is $MI_a + L_bi$, so $L_b\,di/dt + R_bi = \emf_b(t)$.

        [[fig:loops]]

        **Nested solenoids (Summer 2017 #1(b), Summer 2020 #2(b)).** Inside the inner one, $H = n_1I_1 + n_2I_2$: it vanishes when $n_2I_2 = -n_1I_1$. Summer 2017: $n_1 = n_2 = 1000$ /m, $I_1 = 1$ mA, so $I_2 = -1$ mA. Summer 2020: $n_2 = 500$ /m, so $I_2 = -2$ mA. Their mutual inductance uses the **inner** area, where both fields exist: $M = \mu_0n_1n_2\,\pi a_2^2\,\ell$.

        [[fig:nested]]

        **Lenz between them.** If $I_1$ grows, the inner coil's induced current flows against $I_1$ (Summer 2017: $I_2$, already opposite, grows in size). If $I_1$ falls, the induced current flows along $I_1$ (Summer 2020: $|I_2|$ shrinks).
      `, { loops: { svg: loopsFig(), cap: 'HW 6 #4: loop b rises along the axis of loop a. Its flux falls as it climbs, so its emf circulates the same way as $I_a$.' }, nested: { svg: nestedFig(), cap: 'End view: the inner coil cancels the outer field inside radius a₂. Between the coils B = μ₀n₁I₁.' } }),
      Q(md`**Predict.** Summer 2017 #1(b)(iii): $I_1$ (outer) slowly grows, so $H_0$ grows in proportion. The inner coil, carrying $I_2 = -I_1$, responds by…`,
        ['$I_2$ growing in size, still opposite to $I_1$', '$I_2$ shrinking toward zero', '$I_2$ reversing to follow $I_1$', 'nothing: the inner field is zero, so its flux cannot change'], 0,
        [null, 'That is the response to a **falling** $I_1$ (Summer 2020).', 'Lenz opposes the growing flux, so the induced current flows against $I_1$.', 'The flux through the inner coil starts at zero but changes as $I_1$ grows; it is the change that matters.'],
        md`Growing $I_1$ adds flux along its own direction through the inner coil; the induced current opposes it, i.e. flows against $I_1$, adding to $I_2$'s magnitude.`),
      R(md`
        ### Step 6: the same line has $L'C' = \mu\epsilon$

        For two long parallel conductors, capacitance per length is $\epsilon$ times a geometric factor, and inductance per length is $\mu$ divided by the same factor (Lecture 15's table):

        | | $C'$ | $G'$ | $L'$ |
        |---|---|---|---|
        | parallel plates | $\epsilon w/d$ | $\sigma w/d$ | $\mu d/w$ |
        | coax | $2\pi\epsilon/\ln(b/a)$ | $2\pi\sigma/\ln(b/a)$ | $(\mu/2\pi)\ln(b/a)$ |

        So $L'C' = \mu\epsilon$ and $G'/C' = \sigma/\epsilon$ for every such line, and the wave speed on it is $1/\sqrt{L'C'} = 1/\sqrt{\mu\epsilon}$. Know one of $L'$, $C'$ and you have the other.
      `),
      Q(md`**Predict.** Lecture 15's challenge question: the plate separation $d$ of a parallel-plate line increases. Which is true?`,
        ['$L\'$ increases and $C\'$ decreases', '$G\'$ and $L\'$ both increase', '$C\'$ and $G\'$ both increase', '$G\'$ increases and $L\'$ decreases'], 0,
        [null, '$G\' = \\sigma w/d$ decreases with $d$, like $C\'$.', 'Both fall as $1/d$.', 'Backwards: $G\'$ falls and $L\' = \\mu d/w$ rises.'],
        md`$C' = \epsilon w/d$ and $G' = \sigma w/d$ fall; $L' = \mu d/w$ rises; $L'C' = \mu\epsilon$ stays fixed.`),
      R(md`
        ### The method

        !!method Inductance in five steps
          1. **Assume $I$** and use Ampère with symmetry: $\mathbf H$ everywhere it is nonzero.
          2. **$\mathbf B = \mu\mathbf H$.**
          3. **One turn's flux:** $\Psi = \int\mathbf B\cdot d\mathbf S$ over the surface that turn bounds; integrate if $B$ varies ($1/r$ gives a log).
          4. **Linkage** $\Lambda = N\Psi$ (mutual: the turns of circuit $b$ times the flux of $a$'s field through one of them).
          5. **$L = \Lambda/I$** ($I$ cancels); $L' = L/\ell$. Check with $L = 2W_m/I^2$ or $L'C' = \mu\epsilon$. Emf $-L\,dI/dt$, direction by Lenz.

        ### Worked example

        !!graded Problem
          Spring 2018 #2. $N$ turns are wound uniformly on a torus of rectangular cross-section ($a < r < b$, $0 < z < h$). The coil's current produces $\mathbf B = \dfrac{\mu_0NI}{2\pi r}\hat\phi$ inside. (a) Find the flux through one turn. (b) Find the flux linking the $N$-turn coil. (c) Find the magnitude and direction (clockwise or counterclockwise in the "view of one turn" figure) of the induced emf when $I$ increases. Then (numbers added; the exam stops at symbols) evaluate for $N = 200$, $a = 2$ cm, $b = 4$ cm, $h = 1$ cm, $dI/dt = 50$ A/s.

        **(a) One turn.** The turn bounds the rectangle $a < r < b$, $0 < z < h$, with $d\mathbf S = \hat\phi\,dr\,dz$ (the drawn current circulates clockwise in the figure, and $\hat\phi$ is into the page: RHR ✓).
        $$\psi_1 = \int_0^h\!\int_a^b\frac{\mu_0NI}{2\pi r}\,dr\,dz = \frac{\mu_0NIh}{2\pi}\ln\frac ba\ \ \text{Wb}$$

        **(b) Linkage.** $\psi_N = N\psi_1 = \dfrac{\mu_0N^2Ih}{2\pi}\ln\dfrac ba$ Wb, so $L = \dfrac{\mu_0N^2h}{2\pi}\ln\dfrac ba$.

        **(c) Emf.** $|\emf| = \dfrac{d\psi_N}{dt} = \dfrac{\mu_0N^2h}{2\pi}\ln\dfrac ba\,\dfrac{dI}{dt}$. Growing $I$ grows the flux along $\hat\phi$ (into the page); the emf opposes it, so it acts **counterclockwise** in the figure, against $I$.

        **Numbers.**
        $$L = (2\times10^{-7}\,\text{H/m})(200)^2(0.01\,\text{m})\ln2 = 5.55\times10^{-5}\ \text{H}, \qquad |\emf| = L\frac{dI}{dt} = (5.55\times10^{-5})(50) = 2.77\ \text{mV}$$

        **Check.** Units: $\mu_0h$ is H; $N^2$ and the log are pure numbers. Thin-ring limit $b - a \ll a$: $\ln(b/a) \approx (b - a)/a$ and $L \approx \mu_0N^2A/2\pi a$, a solenoid of length $2\pi a$. ✓

        !!mistake Common mistakes
          - Dropping one $N$. $L \propto N^2$: $N$ turns make $H$, and $N$ turns link the flux.
          - Mixing turns per meter and total turns: $\mu n^2A\ell = \mu N^2A/\ell$. Lecture 15's "$N$" is per meter.
          - Toroid: multiplying $B$ at the mean radius by $h(b - a)$. $B \propto 1/r$; integrate to get $\ln(b/a)$.
          - Coax: using the annulus as the flux surface. $\mathbf B$ is parallel to it; the surface is the rectangle between the conductors.
          - Plates: writing $B = \mu_0I/2w$. Both sheets contribute $\mu_0J_s/2$ between the plates: $\mu_0I/w$.
          - Thinking $L$ depends on $I$. It is geometry; $\Lambda$ and $W_m$ depend on $I$.
          - Nested solenoids: using the outer area for $M$. Only the inner area has both fields.

        ### Check questions
      `),
      Q(md`Spring 2018 #2(a): the flux through one turn of the rectangular-section toroid is…`,
        ['$\\dfrac{\\mu_0NIh}{2\\pi}\\ln\\dfrac ba$', '$\\dfrac{\\mu_0NIh(b - a)}{2\\pi a}$', '$\\dfrac{\\mu_0N^2Ih}{2\\pi}\\ln\\dfrac ba$', '$\\dfrac{\\mu_0NI}{2\\pi}\\ln\\dfrac ba$'], 0,
        [null, 'That treats $B$ as constant at its $r = a$ value; it falls as $1/r$.', 'That is the linkage of all $N$ turns (part b).', 'The height $h$ is missing: the turn bounds an $h$-tall rectangle.'],
        md`$\psi_1 = \int_0^h\int_a^b\frac{\mu_0NI}{2\pi r}\,dr\,dz$.`, { src: 'Spring 2018 Exam 2' }),
      Q(md`Spring 2018 #2(c): with $I$ increasing, the induced emf in the "view of one turn" drawing (current up the inner side, $\hat\phi$ into the page) acts…`,
        ['counterclockwise, against $I$', 'clockwise, along $I$', 'clockwise, because the flux is into the page', 'nowhere: the coil is shielded by its own core'], 0,
        [null, 'Along $I$ would speed up the growth of its own flux.', 'The emf opposes the **change**; the flux into the page is growing, so the emf would drive out-of-page flux: counterclockwise.', 'Nothing shields a coil from its own changing flux.'],
        md`Flux along $+\hat\phi$ (into the page) grows; the induced emf would drive a current making out-of-page flux: counterclockwise in the drawing, opposite to $I$.`, { src: 'Spring 2018 Exam 2' }),
      Q(md`Spring 2018 #3(a): $x$ up, $z$ along the line, $y$ out of the page; $I$ flows along the top plate ($+z$) and back along the bottom. The surface current densities are…`,
        ['top $+\\hat z\\,I/w$, bottom $-\\hat z\\,I/w$', 'top $+\\hat z\\,I/2w$, bottom $-\\hat z\\,I/2w$', 'top and bottom $+\\hat z\\,I/w$', 'top $+\\hat z\\,I/l$, bottom $-\\hat z\\,I/l$'], 0,
        [null, 'Each plate carries all of $I$ across its width $w$.', 'The bottom plate carries the return current.', 'A surface current density is current per **width** (A/m across the flow), not per length along it.'],
        md`$J_s = I/w$, spread uniformly across each plate's width, out on top and back on the bottom.`, { src: 'Spring 2018 Exam 2' }),
      Q(md`Spring 2018 #3(b): the magnetic flux density between the plates is…`,
        ['$-\\hat y\\,\\mu_0I/w$', '$+\\hat y\\,\\mu_0I/w$', '$-\\hat y\\,\\mu_0I/2w$', '$0$: the two sheets cancel'], 0,
        [null, 'Check with $\\tfrac12\\mu_0\\mathbf J_s\\times\\hat n$: top plate, point below, $\\hat n = -\\hat x$: $\\hat z\\times(-\\hat x) = -\\hat y$.', 'That is one sheet\'s field; the two add between the plates.', 'They cancel **outside**; between, they add.'],
        md`Top: $\tfrac{\mu_0}{2}\tfrac Iw\,\hat z\times(-\hat x) = -\tfrac{\mu_0I}{2w}\hat y$. Bottom: $\tfrac{\mu_0}{2}\big(-\tfrac Iw\hat z\big)\times\hat x = -\tfrac{\mu_0I}{2w}\hat y$. Sum: $-\hat y\,\mu_0I/w$, into the page, as the RHR on the clockwise current path says.`, { src: 'Spring 2018 Exam 2' }),
      Q(md`Spring 2018 #3(d): the inductance of the shorted line of length $l$ is…`,
        ['$\\mu_0ld/w$', '$\\mu_0lw/d$', '$\\mu_0d/w$', '$\\mu_0Ild/w$'], 0,
        [null, 'Inverted geometry: that is the capacitance pattern ($\\epsilon w/d$).', 'That is $L\'$, per unit length.', 'That is the flux $\\psi$; divide by $I$.'],
        md`$L = \psi/I = (\mu_0I/w)(ld)/I = \mu_0ld/w$.`, { src: 'Spring 2018 Exam 2' }),
      Q(md`Summer 2017 #1(b): an outer solenoid ($n_1 = 1000$ /m) carries $I_1 = 1$ mA, so $H_0 = 1$ A/m inside. An inner one with the same $n$ must carry what current to make $\mathbf H = 0$ inside it?`,
        ['$-1$ mA', '$+1$ mA', '$-2$ mA', '$-0.5$ mA'], 0,
        [null, 'Same direction doubles the field inside.', 'That is Summer 2020\'s answer, where $n_2 = 500$ /m.', 'Equal $n$ needs equal and opposite current.'],
        md`$n_2I_2 = -n_1I_1$ with $n_2 = n_1$: $I_2 = -1$ mA. Only the field inside the inner coil cancels; between the coils $H = 1$ A/m remains.`, { src: 'Summer 2017 Exam 2' }),
      Q(md`Summer 2020 #2(b)(iii): the nested solenoids start with $\mathbf H = 0$ inside the inner one ($I_2 = -2$ mA). $I_1$ slowly **decreases**. Lenz's law says $I_2$…`,
        ['shrinks in size (the induced current flows along $I_1$)', 'grows in size', 'reverses at once', 'stays at $-2$ mA'], 0,
        [null, 'That is the response to a growing $I_1$.', 'The induced current is small and gradual; it opposes the change in flux.', 'The flux through the inner coil changes, so an emf appears.'],
        md`As $I_1$ falls, the net flux in the inner coil swings toward $I_2$'s direction; the induced current opposes that, flowing along $I_1$, which makes $I_2$ less negative.`, { src: 'Summer 2020 Exam 2' }),
      Q(md`A coax filled with a dielectric of $\epsilon_r = 4$ ($\mu = \mu_0$) has $L' = 0.4\ \mu$H/m. Its $C'$ is about…`,
        ['111 pF/m', '27.8 pF/m', '444 pF/m', '0.111 pF/m'], 0,
        [null, 'That is the air-filled value; $\\epsilon = 4\\epsilon_0$.', 'That multiplies by 16: only one factor of $\\epsilon_r$.', 'Off by $10^3$: $\\mu_0\\epsilon_0 = 1/c^2 = 1.11\\times10^{-17}$ s²/m².'],
        md`$C' = \mu\epsilon/L' = 4/(c^2L') = 4/(9\times10^{16}\cdot0.4\times10^{-6}) = 1.11\times10^{-10}$ F/m.`),
      R(md`
        ### Rapid fire: scaling

        **The trick:** write the formula, change one thing. $L = \mu N^2A/\ell$, $\mu_0N^2h\ln(b/a)/2\pi$, $(\mu/2\pi)\ln(b/a)$ per meter, $\mu d/w$ per meter; $W = \tfrac12LI^2$; $L'C' = \mu\epsilon$.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t11_scale', { need: 8 }), { id: 't11-inductance.r0' }),
      R(md`
        ### Rapid fire: numbers

        **The trick:** $\mu_0/2\pi = 2\times10^{-7}$ H/m, $\mu_0 = 4\pi\times10^{-7} \approx 1.26\times10^{-6}$ H/m, $\mu_0\epsilon_0 = 1/c^2 = 1.11\times10^{-17}$ s²/m².
      `),
      Object.assign(G('rf_t11_num', { need: 8 }), { id: 't11-inductance.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t11_solenoid', { need: 2 }),
      G('t11_toroid', { need: 2 }),
      G('t11_plate', { need: 2 }),
      G('t11_mutual', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const X = (k) => (k === 1 ? 'unchanged' : k === 0.5 ? 'halved' : k === 2 ? 'doubled' : k === 4 ? '4 times larger' : k === 0.25 ? 'a quarter' : `${k} times`);
  GENS.rf_t11_scale = () => one([
    () => {
      const [ch, k, why] = pick([
        ['double the number of turns (same length and radius)', 4, '$L \\propto N^2$.'],
        ['double the length, keeping the total number of turns', 0.5, '$L = \\mu N^2A/\\ell$ with $N$ fixed.'],
        ['double the length, keeping the turns per meter', 2, '$L = \\mu n^2A\\ell$ with $n$ fixed: twice the turns, each linking the same flux.'],
        ['double the radius', 4, '$A = \\pi r^2$ goes up 4 times.'],
        ['fill it with a core of $\\mu_r = 4$', 4, '$L \\propto \\mu$.'],
        ['double the current', 1, '$L$ is geometry; it does not depend on $I$.'],
      ]);
      return MC('Solenoid', md`A long solenoid: you ${ch}. Its inductance is…`, X(k),
        [[X(k === 4 ? 2 : k * 2), 'Recheck the power: ' + why], [X(k === 1 ? 2 : 1), 'It does change: ' + why], [X(k === 0.5 ? 2 : 0.5), 'Wrong direction: ' + why], [X(k === 4 ? 8 : 0.25), 'Recheck: ' + why]],
        md`${why}`);
    },
    () => {
      const [ch, k, why] = pick([
        ['the plate separation $d$ doubles', 2, '$L\' = \\mu d/w$.'],
        ['the plate width $w$ doubles', 0.5, '$L\' = \\mu d/w$.'],
        ['the current doubles', 1, '$L\'$ is geometry only.'],
        ['the space between the plates is filled with a dielectric $\\epsilon_r = 4$', 1, '$L\'$ depends on $\\mu$, not $\\epsilon$; $C\'$ goes up 4 times.'],
      ]);
      return MC('Plate line', md`A parallel-plate line: ${ch}. Its $L'$ is…`, X(k),
        [[X(k === 2 ? 0.5 : 2), 'Wrong direction: ' + why], [X(k === 1 ? 4 : 1), why], [X(k === 1 ? 0.25 : 4), 'Only the first power enters: ' + why]],
        md`${why}`);
    },
    () => {
      const [ch, k, why] = pick([
        ['$b/a$ goes from $e$ to $e^2$', 2, '$L\' \\propto \\ln(b/a)$: $\\ln e^2 = 2$.'],
        ['$b/a$ goes from $e^2$ to $e$', 0.5, '$L\' \\propto \\ln(b/a)$.'],
        ['both radii double', 1, 'Only the ratio $b/a$ enters.'],
      ]);
      return MC('Coax', md`A coax: ${ch}. Its $L'$ is…`, X(k),
        [[X(k === 2 ? 4 : 2), 'The log, not the ratio, enters: ' + why], [X(k === 1 ? 2 : 1), why], [X(k === 0.5 ? 0.25 : 0.5), why]],
        md`$L' = (\mu/2\pi)\ln(b/a)$. ${why}`);
    },
    () => {
      const k = pick([2, 3, 0.5]);
      const r = k * k, o = (x) => (x === 1 ? 'unchanged' : `${p(x)} times`);
      return MC('Energy', md`The current in an inductor changes by a factor of $${p(k)}$. Its stored energy changes by…`, o(r),
        [[o(k), '$W = \\tfrac12LI^2$: the square.'], [o(1), 'More current, more field, more energy.'], [o(2 * k), 'Square, not doubled.']],
        md`$W = \tfrac12LI^2$: factor $${p(k)}^2 = ${p(r)}$.`);
    },
    () => {
      const [ch, ans, w] = pick([
        ['The dielectric between the conductors of a coax is changed from air to $\\epsilon_r = 9$.', '$C\'$ ×9, $L\'$ unchanged, speed ÷3', [['$C\'$ ×9, $L\'$ ÷9, speed unchanged', '$L\'$ depends on $\\mu$, not $\\epsilon$.'], ['$C\'$ ×3, $L\'$ ÷3', '$C\' \\propto \\epsilon$: ×9.'], ['all unchanged', '$C\'$ depends on $\\epsilon$.']]],
        ['A line\'s $C\'$ is known; the line is in air.', '$L\' = \\mu_0\\epsilon_0/C\'$', [['$L\' = C\'/\\mu_0\\epsilon_0$', 'Inverted: $L\'C\' = \\mu\\epsilon$.'], ['$L\' = \\mu_0/C\'$', 'Units: the product is $\\mu\\epsilon$.'], ['it cannot be found without the geometry', '$L\'C\' = \\mu\\epsilon$ is geometry-free.']]],
      ]);
      return MC('L′C′', md`${ch} Then…`, ans, w, md`$L'C' = \mu\epsilon$ for any line of two parallel conductors; the speed is $1/\sqrt{\mu\epsilon}$.`);
    },
    () => {
      const [ch, k, why] = pick([
        ['double the number of turns', 4, '$L \\propto N^2$.'],
        ['double the height $h$', 2, '$L \\propto h$.'],
        ['change $b/a$ from 2 to 4', 2, '$\\ln4 = 2\\ln2$.'],
      ]);
      return MC('Toroid', md`A rectangular-section toroid: ${ch}. Its inductance is…`, X(k),
        [[X(k === 4 ? 2 : 4), 'Recheck: ' + why], [X(1), why], [X(k === 2 && /b\/a/.test(ch) ? 1.5 : 0.5), why]],
        md`$L = \dfrac{\mu_0N^2h}{2\pi}\ln\dfrac ba$. ${why}`);
    },
  ]);

  GENS.rf_t11_num = () => one([
    () => {
      const Lm = pick([1, 2, 5, 10, 20]), rate = pick([10, 50, 100, 500, 1000]);
      const v = Lm * 1e-3 * rate, o = (x) => `$${p(+x.toPrecision(3))}$ V`;
      return MC('Inductor voltage', md`A $${Lm}$ mH inductor's current rises at $${rate}$ A/s. $|v_L| = $`, o(v),
        [[o(v * 1000), 'mH is $10^{-3}$ H.'], [o(v / 2), 'No factor ½: $v_L = L\\,dI/dt$.'], [o(Lm / rate), 'That divides; multiply.']],
        md`$v_L = L\,dI/dt = (${Lm}\times10^{-3})(${rate}) = ${p(+v.toPrecision(3))}$ V.`);
    },
    () => {
      const Lm = pick([2, 4, 10, 20, 50]), I = pick([1, 2, 3, 5]);
      const W = 0.5 * Lm * 1e-3 * I * I, o = (x) => `$${p(+x.toPrecision(3))}$ J`;
      return MC('Stored energy', md`A $${Lm}$ mH inductor carries $${I}$ A. $W_m = $`, o(W),
        [[o(2 * W), 'Missing the ½.'], [o(W / I), 'The current is squared.'], [o(W * 1000), 'mH is $10^{-3}$ H.']],
        md`$W = \tfrac12LI^2 = \tfrac12(${Lm}\times10^{-3})(${I})^2 = ${p(+W.toPrecision(3))}$ J.`);
    },
    () => {
      const n = pick([1000, 2000, 5000]), Acm = pick([1, 2, 4]), lcm = pick([10, 20, 50]);
      const Lv = mu0 * n * n * Acm * 1e-4 * lcm / 100;
      const o = (x) => `$${f(x)}$ H`;
      return MC('Solenoid', md`A solenoid: $${n}$ turns/m, cross-section $${Acm}\,\text{cm}^2$, length $${lcm}$ cm, air core. $L = $`, o(Lv),
        [[o(Lv / n), 'One factor of $n$ missing: $L = \\mu_0n^2A\\ell$.'], [o(Lv * 1e4), 'cm² is $10^{-4}$ m².'], [o(Lv / (lcm / 100) ** 2), 'That is $\\mu_0n^2A/\\ell$, the total-turns formula with $n$ in place of $N$; with $n$ per meter, $L = \\mu_0n^2A\\ell$.']],
        md`$L = \mu_0n^2A\ell = (4\pi\times10^{-7})(${n})^2(${Acm}\times10^{-4})(${lcm / 100}) = ${f(Lv)}$ H.`);
    },
    () => {
      const [r, lnr, lab] = pick([[Math.E, 1, 'e'], [Math.E ** 2, 2, 'e^2'], [2, Math.LN2, '2'], [10, Math.LN10, '10']]);
      const Lp = 2e-7 * lnr, o = (x) => `$${f(x)}$ H/m`;
      return MC('Coax', md`An air coax with $b/a = ${lab}$. $L' = $`, o(Lp),
        [[o(2e-7 * r), 'Use $\\ln(b/a)$, not $b/a$.'], [o(4 * Math.PI * 1e-7 * lnr), 'That is $\\mu_0\\ln(b/a)$; divide by $2\\pi$.'], [o(1e-7 * lnr), '$\\mu_0/2\\pi = 2\\times10^{-7}$, not $10^{-7}$.']],
        md`$L' = \dfrac{\mu_0}{2\pi}\ln\dfrac ba = (2\times10^{-7})(${p(+lnr.toPrecision(4))}) = ${f(Lp)}$ H/m.`);
    },
    () => {
      const Lp = pick([0.2, 0.25, 0.5]), er = pick([1, 2.25, 4]);
      const Cp = er / (9e16 * Lp * 1e-6), o = (x) => `$${f(x * 1e12)}$ pF/m`;
      return MC('L′C′', md`A line with $L' = ${Lp}\ \mu$H/m is filled with a dielectric $\epsilon_r = ${er}$ ($\mu = \mu_0$). $C' = $`, o(Cp),
        [[o(Cp / er), 'That leaves out $\\epsilon_r$.'], [o(Cp * 1000), 'µH is $10^{-6}$ H.'], [o(Cp / 1000), 'That treats µH as mH: µH is $10^{-6}$ H.'], [o(Cp * er), 'Only one factor of $\\epsilon_r$.'], [o(er / (3e8 * Lp * 1e-6)), 'That uses $c$ for $c^2$: $\\mu_0\\epsilon_0 = 1/c^2$.']],
        md`$C' = \mu\epsilon/L' = \epsilon_r/(c^2L') = ${er}/(9\times10^{16}\cdot${Lp}\times10^{-6}) = ${f(Cp * 1e12)}$ pF/m.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  GENS.t11_solenoid = () => {
    const n = pick([500, 1000, 2000]), rcm = pick([1, 2, 3]), lcm = pick([10, 20, 50]), mur = pick([1, 1, 50, 200]);
    const I = pick([0.5, 1, 2, 4]), rate = pick([10, 100, 1000]);
    const A = Math.PI * (rcm / 100) ** 2, l = lcm / 100, Lv = mur * mu0 * n * n * A * l, W = 0.5 * Lv * I * I, v = Lv * rate;
    return {
      title: 'Solenoid: L, energy, voltage',
      q: md`A long solenoid has $n = ${n}$ turns/m, radius $${rcm}$ cm and length $${lcm}$ cm, ${mur === 1 ? 'with an air core' : `wound on a core of $\\mu_r = ${mur}$`}. Find its inductance, the energy stored when it carries $${I}$ A, and the voltage across it when its current changes at $${rate}$ A/s.`,
      parts: [N('L', Lv, 'H'), N('W_m', W, 'J'), N('|v_L|', v, 'V')],
      hints: ['$H = nI$ inside; one turn links $\\mu nIA$; there are $n\\ell$ turns.', '$L = \\mu n^2A\\ell$, $W_m = \\tfrac12LI^2$, $v_L = L\\,dI/dt$.'],
      sol: sol({
        eq: md`$L = \Lambda/I$ with $\Lambda = (n\ell)(\mu nIA)$; $\;W_m = \tfrac12LI^2$; $\;v_L = L\,dI/dt$.`,
        sym: md`$L = \mu n^2A\ell = \mu_r\mu_0n^2\pi r^2\ell$.`,
        sub: md`$$L = (${mur})(4\pi\times10^{-7})(${n})^2\pi(${rcm / 100})^2(${l}) = ${f(Lv)}\ \text{H}$$
$$W_m = \tfrac12(${f(Lv)})(${I})^2 = ${f(W)}\ \text{J}, \qquad |v_L| = (${f(Lv)})(${rate}) = ${f(v)}\ \text{V}$$`,
        ans: md`$L = ${f(Lv)}$ H, $W_m = ${f(W)}$ J, $|v_L| = ${f(v)}$ V.`,
        check: md`Field form: $\tfrac12\mu(nI)^2\cdot A\ell = ${f(0.5 * mur * mu0 * (n * I) ** 2 * A * l)}$ J $= W_m$. ✓`,
      }),
    };
  };

  GENS.t11_toroid = () => {
    const Nn = pick([100, 200, 500, 1000]), a = pick([2, 3, 5]), ba = pick([1.5, 2, 3]), h = pick([1, 2, 4]);
    const I = pick([0.5, 1, 2]), rate = pick([20, 50, 100, 500]), up = pick([true, false]);
    const b = a * ba, lnr = Math.log(ba), psi1 = mu0 * Nn * I * h / 100 / (2 * Math.PI) * lnr;
    const Lam = Nn * psi1, Lv = Lam / I, e = Lv * rate;
    return {
      title: 'Toroidal coil',
      q: md`$N = ${Nn}$ turns are wound uniformly on a toroidal core of rectangular cross-section: inner radius $a = ${a}$ cm, outer radius $b = ${p(b)}$ cm, height $h = ${h}$ cm, air. The coil carries $${I}$ A, ${up ? 'increasing' : 'decreasing'} at $${rate}$ A/s. Find the flux through one turn, the flux linkage, the inductance, and the magnitude and direction of the induced emf.`,
      parts: [
        N('\\psi_1', psi1, 'Wb'), N('\\Lambda = N\\psi_1', Lam, 'Wb'), N('L', Lv, 'H'), N('|\\mathcal E|', e, 'V'),
        { lbl: 'The induced emf acts', mc: ['against the current', 'along the current'], a: up ? 0 : 1, fixed: true, why: up ? [null, 'The current is rising: the emf opposes the rise.'] : ['The current is falling: the emf tries to keep it going.', null] },
      ],
      hints: ['Ampère inside the core: $H_\\phi = NI/2\\pi r$. One turn bounds $a < r < b$, $0 < z < h$.', '$\\psi_1 = \\dfrac{\\mu_0NIh}{2\\pi}\\ln\\dfrac ba$, $\\Lambda = N\\psi_1$, $L = \\Lambda/I$, $|\\emf| = L\\,|dI/dt|$.'],
      sol: sol({
        eq: md`$\psi_1 = \int_0^h\int_a^b\dfrac{\mu_0NI}{2\pi r}\,dr\,dz$, $\;\Lambda = N\psi_1$, $\;L = \Lambda/I$, $\;\emf = -L\,dI/dt$.`,
        sym: md`$\psi_1 = \dfrac{\mu_0NIh}{2\pi}\ln\dfrac ba$, $\;L = \dfrac{\mu_0N^2h}{2\pi}\ln\dfrac ba$.`,
        sub: md`$$\psi_1 = (2\times10^{-7})(${Nn})(${I})(${h / 100})\ln${p(ba)} = ${f(psi1)}\ \text{Wb}, \qquad \Lambda = ${f(Lam)}\ \text{Wb}$$
$$L = \frac{${f(Lam)}}{${I}} = ${f(Lv)}\ \text{H}, \qquad |\emf| = (${f(Lv)})(${rate}) = ${f(e)}\ \text{V}$$`,
        ans: md`$\psi_1 = ${f(psi1)}$ Wb, $\Lambda = ${f(Lam)}$ Wb, $L = ${f(Lv)}$ H, $|\emf| = ${f(e)}$ V, ${up ? 'against' : 'along'} the current.`,
        check: md`Lenz: the flux along $\hat\phi$ is ${up ? 'growing, so the emf opposes the current' : 'shrinking, so the emf pushes along the current to keep it'}. Thin-ring estimate $\mu_0N^2h(b - a)/2\pi a$ gives $${f(mu0 * Nn * Nn * h / 100 * (b - a) / 100 / (2 * Math.PI * a / 100))}$ H, larger than $L$ because $B$ is largest at $r = a$.`,
      }),
    };
  };

  GENS.t11_plate = () => {
    const wcm = pick([1, 2, 5, 10]), dmm = pick([0.5, 1, 2, 5].filter((x) => x <= wcm)), l = pick([0.5, 1, 2, 5]), I = pick([1, 2, 5, 10]), er = pick([1, 2, 4]);   // d <= w/10
    const w = wcm / 100, d = dmm / 1000, Js = I / w, B = mu0 * I / w, psi = B * l * d, Lv = mu0 * l * d / w, Cp = er * EM.eps0 * w / d;
    return {
      title: 'Parallel-plate line',
      q: md`A parallel-plate line has plates $${wcm}$ cm wide and $${dmm}$ mm apart, $${l}$ m long, shorted at the far end, filled with a dielectric $\epsilon_r = ${er}$ ($\mu = \mu_0$). A current of $${I}$ A flows out along the top plate and back along the bottom, uniform across the width. Find $J_s$ on each plate, $|\mathbf B|$ between them, the flux $\psi$ linked by the current path, $L$, and (from $L'C' = \mu\epsilon$) the capacitance per meter.`,
      parts: [N('J_s', Js, 'A/m'), N('|\\mathbf B|', B, 'T'), N('\\psi', psi, 'Wb'), N('L', Lv, 'H'), N("C'", Cp * 1e12, 'pF/m')],
      hints: ['$J_s = I/w$ on each plate, opposite directions. Between the plates the two sheets add: $B = \\mu_0J_s$.', '$\\psi = B\\cdot l\\cdot d$, $L = \\psi/I$, $L\' = L/l$, $C\' = \\mu\\epsilon/L\'$.'],
      sol: sol({
        eq: md`$J_s = I/w$; each sheet gives $\tfrac12\mu_0J_s$, adding between the plates; $\;\psi = Bld$, $\;L = \psi/I$, $\;L'C' = \mu\epsilon$.`,
        sym: md`$B = \mu_0I/w$, $\;\psi = \mu_0Ild/w$, $\;L = \mu_0ld/w$, $\;C' = \mu_0\epsilon/L' = \epsilon w/d$.`,
        sub: md`$$J_s = \frac{${I}}{${w}} = ${f(Js)}\ \text{A/m}, \qquad B = (4\pi\times10^{-7})(${f(Js)}) = ${f(B)}\ \text{T}, \qquad \psi = (${f(B)})(${l})(${p(d)}) = ${f(psi)}\ \text{Wb}$$
$$L = \frac{\psi}{I} = ${f(Lv)}\ \text{H}, \qquad C' = \frac{${er}\epsilon_0\,w}{d} = ${f(Cp * 1e12)}\ \text{pF/m}$$`,
        ans: md`$J_s = ${f(Js)}$ A/m, $|\mathbf B| = ${f(B)}$ T, $\psi = ${f(psi)}$ Wb, $L = ${f(Lv)}$ H, $C' = ${f(Cp * 1e12)}$ pF/m.`,
        check: md`$L'C' = (${f(Lv / l)})(${f(Cp)}) = ${f(Lv / l * Cp)}$ s²/m² $= \mu_0\epsilon_r\epsilon_0 = ${f(mu0 * er * EM.eps0)}$. ✓ The dielectric changes $C'$, not $L$.`,
      }),
    };
  };

  GENS.t11_mutual = () => {
    const loops = pick([true, false]), rate = pick([10, 100, 1000]), up = pick([true, false]);
    if (loops) {
      const a = pick([10, 20, 50]), b = pick([0.5, 1, 2]), n2 = pick([1, 10, 50]);
      const M = n2 * mu0 * Math.PI * (b / 100) ** 2 / (2 * a / 100), e = M * rate;
      return {
        title: 'Mutual inductance: concentric loops',
        q: md`A small coil of $${n2}$ turn${n2 > 1 ? 's' : ''} and radius $b = ${b}$ cm sits at the center of a single loop of radius $a = ${a}$ cm, in the same plane ($b \ll a$). The big loop's current is ${up ? 'increasing' : 'decreasing'} at $${rate}$ A/s. Find the mutual inductance, the emf in the small coil, and the direction of the small coil's induced current.`,
        parts: [N('M', M, 'H'), N('|\\mathcal E_b|', e, 'V'),
          { lbl: 'Relative to the big loop\'s current, the induced current circulates', mc: ['the opposite way', 'the same way'], a: up ? 0 : 1, fixed: true, why: up ? [null, 'The flux is growing: the induced current opposes it.'] : ['The flux is shrinking: the induced current tops it up.', null] }],
        hints: ['At the center of the big loop $B = \\mu_0I_a/2a$, nearly uniform over the small coil.', '$\\Lambda_b = N_b\\pi b^2\\,\\mu_0I_a/2a$, $M = \\Lambda_b/I_a$, $|\\emf_b| = M\\,|dI_a/dt|$.'],
        sol: sol({
          eq: md`$M = \Lambda_b/I_a$, $\;\emf_b = -M\,dI_a/dt$.`,
          sym: md`$M = N_b\dfrac{\mu_0\pi b^2}{2a}$.`,
          sub: md`$$M = (${n2})\frac{(4\pi\times10^{-7})\pi(${b / 100})^2}{2(${a / 100})} = ${f(M)}\ \text{H}, \qquad |\emf_b| = (${f(M)})(${rate}) = ${f(e)}\ \text{V}$$`,
          ans: md`$M = ${f(M)}$ H, $|\emf_b| = ${f(e)}$ V, circulating ${up ? 'opposite to' : 'with'} the big loop's current.`,
          check: md`Lenz: the big loop's flux through the small coil is ${up ? 'growing, so the small coil opposes it' : 'shrinking, so the small coil tops it up'}. $M \propto b^2/a$: tiny, because the small coil catches little of the big loop's field.`,
        }),
      };
    }
    const n1 = pick([500, 1000, 2000]), n2 = pick([500, 1000]), a2 = pick([1, 2, 5]), lcm = pick([20, 50, 100]);
    const M = mu0 * n1 * n2 * Math.PI * (a2 / 100) ** 2 * lcm / 100, e = M * rate;
    return {
      title: 'Mutual inductance: nested solenoids',
      q: md`A long inner solenoid ($n_2 = ${n2}$ turns/m, radius $${a2}$ cm) sits inside a longer outer one ($n_1 = ${n1}$ turns/m) over a common length of $${lcm}$ cm. The outer current is ${up ? 'increasing' : 'decreasing'} at $${rate}$ A/s. Find the mutual inductance, the emf induced in the inner coil, and the direction of its induced current.`,
      parts: [N('M', M, 'H'), N('|\\mathcal E_2|', e, 'V'),
        { lbl: 'Relative to $I_1$, the inner coil\'s induced current circulates', mc: ['the opposite way', 'the same way'], a: up ? 0 : 1, fixed: true, why: up ? [null, 'The flux is growing: the induced current opposes it.'] : ['The flux is shrinking: the induced current tops it up.', null] }],
      hints: ['The outer field $\\mu_0n_1I_1$ fills the inner coil; each of its $n_2\\ell$ turns links $\\mu_0n_1I_1\\pi a_2^2$.', '$M = \\mu_0n_1n_2\\pi a_2^2\\ell$, $|\\emf_2| = M\\,|dI_1/dt|$.'],
      sol: sol({
        eq: md`$M = \Lambda_2/I_1$ with $\Lambda_2 = (n_2\ell)(\mu_0n_1I_1\pi a_2^2)$; $\;\emf_2 = -M\,dI_1/dt$.`,
        sym: md`$M = \mu_0n_1n_2\pi a_2^2\ell$ (the inner area: the only place both coils' fields exist).`,
        sub: md`$$M = (4\pi\times10^{-7})(${n1})(${n2})\pi(${a2 / 100})^2(${lcm / 100}) = ${f(M)}\ \text{H}, \qquad |\emf_2| = (${f(M)})(${rate}) = ${f(e)}\ \text{V}$$`,
        ans: md`$M = ${f(M)}$ H, $|\emf_2| = ${f(e)}$ V, circulating ${up ? 'opposite to' : 'with'} $I_1$.`,
        check: md`Reciprocity: $\Lambda_1/I_2$ gives the same $M$, since the inner field $\mu_0n_2I_2$ lives only inside radius $a_2$ and links $n_1\ell$ outer turns.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t11-inductance'] = [
    Q(md`One henry equals…`,
      ['1 Wb/A = 1 V·s/A', '1 V/A', '1 T·m²', '1 A/Wb'], 0,
      [null, 'V/A is the ohm.', 'T·m² is the weber, a flux.', 'Inverted.'],
      md`$L = \Lambda/I$ (Wb/A), and $v = L\,dI/dt$ gives V·s/A.`),
    Q(md`Why does a coil's inductance go as $N^2$?`,
      ['$N$ turns make the field and $N$ turns link it', 'the wire is $N$ times longer, and resistance adds', 'energy goes as the square of anything', 'it does not: $L \\propto N$'], 0,
      [null, 'Resistance is unrelated to inductance.', 'Not a reason: the two factors of $N$ have distinct origins.', 'Both the field and the linkage grow with $N$.'],
      md`$H \propto NI$, $\Lambda = N\Psi \propto N^2I$.`),
    Q(md`The current through an inductor cannot change instantly because…`,
      ['that would need an infinite voltage $L\\,dI/dt$', 'its resistance is infinite', 'charge would pile up inside it', 'its field cannot exist'], 0,
      [null, 'An ideal inductor has zero resistance.', 'That is the capacitor\'s constraint, on voltage.', 'Its field exists; it can only change at a finite rate.'],
      md`A jump in $I$ means $dI/dt\to\infty$. Opening a switch on an inductive circuit makes a spark for this reason.`),
    Q(md`The current enters an inductor at terminal 1 and is **decreasing**. Which terminal is at the higher potential?`,
      ['terminal 2', 'terminal 1', 'neither: $v_L = 0$', 'it depends on $L$'], 0,
      [null, '$v_{12} = L\\,dI/dt < 0$ when $I$ is falling.', 'Only if $dI/dt = 0$.', '$L$ sets the size, not the sign.'],
      md`$v_{12} = L\,dI/dt < 0$: the inductor acts as a source pushing the current on.`),
    Q(md`At the same $B$, a region of $\mu_r = 100$ material stores, per volume, compared with air…`,
      ['100 times less energy', '100 times more energy', 'the same energy', '10 times less'], 0,
      [null, 'At the same $H$ it would be 100 times more; at the same $B$ it is less.', '$w = B^2/2\\mu$ depends on $\\mu$.', '$\\mu$ enters to the first power.'],
      md`$w_m = \tfrac12\mu H^2 = B^2/2\mu$. Magnetic circuits store most energy in their air gaps.`),
    Q(md`In a coax, the magnetic energy per unit length between radii $r$ and $r + dr$ goes as…`,
      ['$1/r$: more of it sits near the inner conductor', '$r$: more near the outer conductor', '$1/r^2$', 'it is uniform'], 0,
      [null, '$H \\propto 1/r$, so $w \\propto 1/r^2$, times the shell area $2\\pi r\\,dr$.', 'That is the density $w$, before multiplying by the shell area.', 'The field is not uniform.'],
      md`$\tfrac12\mu(I/2\pi r)^2\cdot2\pi r\,dr \propto dr/r$: integrating gives the $\ln(b/a)$.`),
    Q(md`Two inductors, far apart (no coupling), in series. The total inductance is…`,
      ['$L_1 + L_2$', '$L_1L_2/(L_1 + L_2)$', '$\\sqrt{L_1L_2}$', '$L_1 + L_2 + 2\\sqrt{L_1L_2}$'], 0,
      [null, 'That is the parallel formula.', 'Not a series combination.', 'That would be perfect coupling, aiding.'],
      md`The same current, voltages add: $v = (L_1 + L_2)\,dI/dt$. Coupling adds $\pm2M$.`),
    Q(md`$M_{12}$ is the linkage of coil 2 per amp in coil 1, $M_{21}$ the reverse. In general…`,
      ['$M_{12} = M_{21}$', '$M_{12} > M_{21}$ if coil 1 has more turns', 'they are unrelated', '$M_{12} = 1/M_{21}$'], 0,
      [null, 'Reciprocity holds whatever the turns.', 'They are equal (reciprocity).', 'Units: both are henries.'],
      md`Reciprocity: compute whichever is easier. For nested solenoids, the outer field through the inner coil is the easy one.`),
    Q(md`The small loop of HW 6 #4 is rotated 90° about a diameter, so its plane contains the axis of the big loop. $M$ becomes…`,
      ['about zero', 'unchanged', 'doubled', 'negative'], 0,
      [null, 'Orientation matters: only the part of $\\mathbf B$ along the normal counts, and edge-on that is zero.', 'It cannot exceed the face-on value; edge-on it is zero.', 'A negative $M$ needs the normal reversed (a 180° turn); at 90° the normal is perpendicular to $\\mathbf B$.'],
      md`$\Psi = \mathbf B\cdot\hat n\,A$ with $\hat n \perp \mathbf B$: zero.`),
    Q(md`For a small loop of radius $b$ at the center of a big loop of radius $a$, halving $b$ changes $M$ by…`,
      ['a factor of 1/4', '1/2', '1/8', 'nothing'], 0,
      [null, 'The area goes as $b^2$.', 'Only the area enters: $b^2$.', 'The big loop\'s field is the same.'],
      md`$M = \mu_0\pi b^2/2a$.`),
    Q(md`A wire loop of **any** shape encircles a long solenoid ($n$ turns/m, radius $a$) far outside it. Their mutual inductance per turn of the loop is…`,
      ['$\\mu_0n\\pi a^2$', 'zero: $\\mathbf B = 0$ at the loop', 'proportional to the loop\'s area', '$\\mu_0n$'], 0,
      [null, 'The loop links all the flux inside the solenoid even though $\\mathbf B = 0$ on the wire.', 'Only the solenoid\'s cross-section carries flux.', 'Units: an area is missing.'],
      md`$\Psi = \mu_0nI\pi a^2$ through any surface spanning the loop, so $M = \mu_0n\pi a^2$.`),
    Q(md`Outside an ideal toroidal coil, $\mathbf B$ is…`,
      ['zero', '$\\mu_0NI/2\\pi r$', '$\\mu_0NI/2\\pi b$', 'the same as inside at $r = b$'], 0,
      [null, 'An Ampère loop outside encloses $NI$ going up and $NI$ coming down: zero net.', 'That is the field inside.', 'Outside the enclosed current is zero.'],
      md`All the flux is confined to the core: that is why toroids are used as inductors.`),
    Q(md`Changing a coax's dielectric from air to $\epsilon_r = 4$ changes the wave speed on it by…`,
      ['a factor of 1/2', '1/4', '2', 'nothing'], 0,
      [null, 'Speed is $1/\\sqrt{\\mu\\epsilon}$: the square root.', 'Higher $\\epsilon$ means slower.', '$C\'$ changes, so $L\'C\'$ does.'],
      md`$v = 1/\sqrt{L'C'} = 1/\sqrt{\mu_0\cdot4\epsilon_0} = c/2$.`),
    Q(md`A coax has $C' = 100$ pF/m and leakage $G' = 10^{-6}$ S/m. The dielectric's $\sigma/\epsilon$ is…`,
      ['$10^4\\ \\text{s}^{-1}$', '$10^{-4}$ s', '$10^{-16}$', 'cannot be found without $a$ and $b$'], 0,
      [null, 'Inverted: that is $\\epsilon/\\sigma$, the relaxation time.', 'Units: $G\'/C\'$ is per second.', '$G\'/C\' = \\sigma/\\epsilon$ for any geometry.'],
      md`$G'/C' = 10^{-6}/10^{-10} = 10^4$ s⁻¹ $= \sigma/\epsilon$.`),
    Q(md`Where does the energy you spend ramping up a solenoid's current go?`,
      ['into its magnetic field, $\\tfrac12\\mu H^2$ per volume inside', 'into heat in the wire', 'it is radiated away', 'into the electric field of the windings'], 0,
      [null, 'For an ideal (zero-resistance) coil none is lost to heat.', 'At slow ramps, radiation is negligible.', 'The stored energy is magnetic.'],
      md`$\int v_LI\,dt = \tfrac12LI^2 = \int\tfrac12\mu H^2\,dV$, recoverable when the current falls.`),
    Q(md`Doubling a parallel-plate line's width $w$ (same $d$, same $I$) changes $|\mathbf B|$ between the plates and $L'$ by…`,
      ['½ and ½', '½ and 2', '1 and ½', '2 and ½'], 0,
      [null, '$L\' = \\mu d/w$ halves too.', '$B = \\mu_0I/w$ halves: the same current is spread wider.', 'More width, weaker sheet current, weaker field.'],
      md`$J_s = I/w$, $B = \mu_0I/w$, $L' = \mu_0d/w$.`),
    Q(md`A thin toroid (mean radius $R_0$, cross-section $A$, $b - a \ll R_0$) has inductance about…`,
      ['$\\mu N^2A/2\\pi R_0$', '$\\mu N^2A\\cdot2\\pi R_0$', '$\\mu NA/2\\pi R_0$', '$\\mu N^2/2\\pi R_0$'], 0,
      [null, 'Inverted length: $L = \\mu N^2A/\\ell$ with $\\ell = 2\\pi R_0$.', 'One $N$ missing.', 'The area is missing.'],
      md`A thin toroid is a solenoid bent into a ring of length $2\pi R_0$: $\ln(b/a) \approx (b - a)/R_0$.`),
    Q(md`HW 6 #4(e): with the inner loop's own inductance $L_b$ and resistance $R_b$, its current obeys $L_b\,di/dt + R_bi = \emf(t)$. If $L_b/R_b$ is much shorter than the time over which $\emf$ changes, then…`,
      ['$i \\approx \\emf/R_b$: self-inductance barely matters', '$i \\approx 0$', '$i$ grows without limit', '$i \\approx \\emf/L_b$'], 0,
      [null, 'A fast circuit follows its drive.', 'The drive is there; the current follows it.', 'Units: $\\emf/L_b$ is A/s, a rate.'],
      md`With a short time constant the $L_b\,di/dt$ term is small: $i$ tracks $\emf/R_b$, as part (d) assumed.`),
  ];
})();

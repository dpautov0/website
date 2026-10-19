/* Topic 5 — Ampère's law with symmetry (Lectures 12–13). ∮H·dl = I_enc, H = B/μ0; when symmetry lets you pull H out
   of the integral and how to choose the loop; the infinite wire, the thick wire with uniform J, the coax (the lecture's
   challenge question), the solenoid (rectangular loop), the toroid, MMF, and the check ∇×H = J in cylindrical coordinates.
   Planar sources (sheets, slabs, holes, delta currents) are Topic 6; the displacement-current term is Topic 12. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick } = U;
  const r3 = (x) => +x.toPrecision(3);
  const TWO_PI = 2 * Math.PI;

  // ---------------------------------------------------------------- figures
  // three wires, two inside C (counterclockwise): I_enc = 5 - 3 = 2 A
  function encFig() {
    const g = PF.fig({ scale: 1.2, alt: 'a counterclockwise closed path C around a 5 A wire out of the page and a 3 A wire into the page; a 10 A wire out of the page sits outside C' });
    g.loopCirc(100, 95, 64, { dir: 'ccw' });
    g.label(150, 150, 'C', 'tl');
    g.odot(76, 84, 8, { lab: '5\\ \\text{A}', at: 'r' });
    g.otimes(118, 118, 8, { lab: '3\\ \\text{A}', at: 'r' });
    g.odot(222, 56, 8, { lab: '10\\ \\text{A}', at: 'r' });
    return g.svg();
  }

  // cross-section of a uniform round current (out of the page) with an Amperian circle inside and one outside
  function roundFig(coax) {
    const g = PF.fig({ scale: 1.25, alt: coax ? 'coax cross-section: a solid inner conductor with current out of the page, a thin outer shell with the return current into the page, and dashed Amperian circles' : 'cross-section of a thick wire of radius a with uniform current out of the page, and dashed Amperian circles inside and outside it' });
    const cx = 100, cy = 100, a = coax ? 34 : 48;
    g.circle(cx, cy, a, { cls: 'shade' });
    g.circle(cx, cy, a, { cls: '' });
    g.marks('dot', cx - a * 0.55, cy - a * 0.55, cx + a * 0.55, cy + a * 0.55, 3, 3, { r: 1.8 });
    if (coax) {
      g.circle(cx, cy, 74, { cls: 'thick' });
      for (let k = 0; k < 12; k++) { const t = (k + 0.5) * Math.PI / 6; g.otimes(cx + 74 * Math.cos(t), cy - 74 * Math.sin(t), 5); }
      g.circle(cx, cy, 54, { cls: 'dash dim' });
      g.circle(cx, cy, 92, { cls: 'dash dim' });
      g.dim(cx, cy, cx + a, cy, 'a', { at: 'b' });
      g.dim(cx, cy, cx - 74 * Math.cos(Math.PI / 4), cy + 74 * Math.sin(Math.PI / 4), 'b', { at: 'l' });
    } else {
      g.circle(cx, cy, 26, { cls: 'dash' });
      g.circle(cx, cy, 76, { cls: 'dash' });
      g.head(cx + 76, cy, 0, -1, { hs: 7 });
      g.head(cx + 26, cy, 0, -1, { hs: 6 });
      g.dim(cx, cy, cx - a * Math.SQRT1_2, cy + a * Math.SQRT1_2, 'a', { at: 'l' });
      g.label(cx + 80, cy - 40, 'C', 'l', 'small');
    }
    return g.svg();
  }

  function thickPlot() {
    return PF.plot({ w: 270, h: 170, x: [0, 3.2], y: [0, 1.2], xl: 'r', yl: 'H_\\phi', xt: [[1, 'a'], [2, '2a'], [3, '3a']], yt: [[1, 'I/2\\pi a'], [0.5, 'I/4\\pi a']],
      curves: [{ f: (r) => r, to: 1 }, { f: (r) => 1 / r, from: 1 }] });
  }
  function coaxPlot() {
    return PF.plot({ w: 270, h: 170, x: [0, 3.2], y: [0, 1.2], xl: 'r', yl: 'H_\\phi', xt: [[1, 'a'], [2.2, 'b']], yt: [[1, 'I/2\\pi a']],
      curves: [{ f: (r) => r, to: 1 }, { f: (r) => 1 / r, from: 1, to: 2.2 }, { f: () => 0, from: 2.2 }], vlines: [[2.2, '']] });
  }

  // a solenoid cut along its axis: turns out of the page on top, into the page below; H = nI inside, a rectangle C
  function solenoidFig() {
    const g = PF.fig({ scale: 1.15, alt: 'a long solenoid cut along its axis: the turns carry current out of the page along the top wall and into the page along the bottom wall; H points right inside and is zero outside; a rectangular path straddles the top wall' });
    for (let k = 0; k < 9; k++) { g.odot(26 + k * 26, 50, 7); g.otimes(26 + k * 26, 140, 7); }
    for (const y of [82, 108]) g.arrow(40, y, 220, y, { cls: 'dim', hs: 7 });
    g.label(230, 95, '\\mathbf H = nI\\,\\hat x', 'l', 'small');
    g.loopRect(88, 20, 104, 50, { dir: 'ccw', cls: 'dash' });
    g.label(84, 20, 'C', 'br', 'small');
    g.label(198, 22, '\\mathbf H = 0', 'l', 'small');
    g.dim(88, 4, 192, 4, 'L', { at: 't' });
    return g.svg();
  }

  // a toroid from above: turns come out of the page through the hole, go back in outside; H circles inside the core
  function toroidFig() {
    const g = PF.fig({ scale: 1.25, alt: 'a toroid seen from above: the windings carry current out of the page at the inner radius a and into the page at the outer radius b; a dashed circle of radius r between them carries H counterclockwise' });
    const cx = 120, cy = 110, a = 40, b = 92;
    g.circle(cx, cy, a, { cls: 'dim' });
    g.circle(cx, cy, b, { cls: 'dim' });
    for (let k = 0; k < 8; k++) { const t = k * Math.PI / 4 + 0.2; g.odot(cx + a * Math.cos(t), cy - a * Math.sin(t), 5); }
    for (let k = 0; k < 14; k++) { const t = k * Math.PI / 7 + 0.1; g.otimes(cx + b * Math.cos(t), cy - b * Math.sin(t), 5); }
    g.loopCirc(cx, cy, 66, { dir: 'ccw', cls: 'dash' });
    g.label(cx + 50, cy - 50, '\\mathbf H', 'bl', 'small');
    g.dim(cx, cy, cx - a, cy, 'a', { at: 'b' });
    g.dim(cx, cy, cx + b * Math.cos(-0.9), cy - b * Math.sin(-0.9), 'b', { at: 'r' });
    return g.svg();
  }

  function exPlot() {
    // the worked example, a = 2 mm, b = 6 mm, c = 8 mm, I = 5 A; r in mm, H in A/m
    const a = 2, b = 6, c = 8, I = 5;
    const H = (r) => { const m = r / 1000; const Ie = r < a ? I * r * r / (a * a) : r < b ? I : r < c ? I * (1 - (r * r - b * b) / (c * c - b * b)) : 0; return Ie / (TWO_PI * m); };
    return PF.plot({ w: 300, h: 180, x: [0, 10.5], y: [0, 440], xl: 'r\\ (\\text{mm})', yl: 'H_\\phi\\ (\\text{A/m})', xt: [[2, '2'], [6, '6'], [8, '8']], yt: [[398, '398'], [133, '133']],
      curves: [{ f: H, from: 0.001, to: 10.5, n: 400 }], pts: [{ x: 1.5, y: H(1.5) }, { x: 4, y: H(4) }, { x: 7, y: H(7) }] });
  }

  // ---------------------------------------------------------------- the lesson
  EM.lesson('u2', {
    id: 't5-ampere', topic: 5, ref: 'Lectures 12–13', title: "Ampère's law with symmetry",
    steps: [
      R(md`
        !!key Why you care
          Summer 2018 #1(a) is a thick wire with $\mathbf J = \hat z/\pi$ A/m²: $H$ inside and outside at given points. HW 5 #4(a)(b) is the same with a total current $I$. Summer 2017 #1(b) and Summer 2020 #2(b) are solenoids, $H = nI$, with a second solenoid nested inside to cancel it. Spring 2018 #2 gives a toroid's $\mu_0NI/2\pi r$ and asks for its flux. Lecture 12 ends on a coax challenge question. The sheets and slabs of Topic 6 are the same law with a rectangle. Exam 2 also tests $\nabla\times\mathbf H = \mathbf J$ in cylindrical coordinates on wires and coax (the instructor, on Piazza): Step 7.

        ### Notation

        - $\mathbf H = \mathbf B/\mu_0$: the **magnetic field intensity**, in A/m (in free space). Back to flux density: $\mathbf B = \mu_0\mathbf H$; $1$ A/m $\leftrightarrow 1.257\ \mu$T.
        - $C$: a closed path (an "Amperian loop") with a direction; $d\mathbf l$ a step along it. $S$: any surface whose rim is $C$; $d\mathbf S$ is fixed by $C$ through the **right-hand rule** (fingers along $C$, thumb along $d\mathbf S$).
        - $I_{\text{enc}} = \int_S\mathbf J\cdot d\mathbf S$: the current through $S$, A, counted **positive along $d\mathbf S$**.
        - $\mathbf J$: volume current density, A/m². Uniform over an area $A$: $J = I/A$.
        - $r$, $\hat\phi$: distance from the symmetry axis and the direction circling it. $a$, $b$, $c$: radii.
        - $n$: turns per meter of a solenoid, $n = N/\ell$. $N$: total number of turns (of a toroid).
        - **MMF** (magnetomotive force): $\oint_C\mathbf H\cdot d\mathbf l$, in A, often called ampere-turns.
        - $\nabla\times\mathbf H$: the **curl** of $\mathbf H$, its circulation per unit area, in A/m² ([Unit 0, Lesson C](#/l/u0-curl-div)).

        ### The idea

        Around **any** closed path, the circulation of $\mathbf H$ equals the current through it:
        $$\oint_C\mathbf H\cdot d\mathbf l = I_{\text{enc}} = \int_S\mathbf J\cdot d\mathbf S$$
        For steady currents this is always true. It **gives** you $\mathbf H$ only when symmetry fixes the direction of $\mathbf H$ and makes its size constant along the pieces of $C$. Then the integral is $H$ times a length, and you divide.
      `),
      RF(md`
        ### Step 1: counting the enclosed current

        [[fig:enc]]

        Orient $C$, read off $d\mathbf S$ by the RHR, then add the currents through $S$ with signs: along $d\mathbf S$ positive, against it negative. A wire that does not pierce $S$ counts zero. It still makes $\mathbf H$ on $C$; its contributions to $\oint\mathbf H\cdot d\mathbf l$ just cancel around the loop.

        Reverse $C$ and both sides change sign. Nothing physical changes.
      `, { enc: { svg: encFig(), cap: 'C counterclockwise, so dS points out of the page: the 5 A wire counts +5 A, the 3 A wire −3 A, the 10 A wire outside counts 0.' } }),
      Q(md`**Predict.** For the path in the figure, $\oint_C\mathbf H\cdot d\mathbf l = $`,
        ['$2$ A', '$8$ A', '$12$ A', '$-2$ A'], 0,
        [null, 'That adds magnitudes. The 3 A wire runs against $d\\mathbf S$ and counts negative.', 'The 10 A wire is outside $C$: it changes $\\mathbf H$ on the path but not the circulation.', 'With $C$ counterclockwise, $d\\mathbf S$ is out of the page, so out-of-page currents count positive.'],
        md`$I_{\text{enc}} = +5 - 3 = 2$ A. The 10 A wire is outside.`),
      R(md`
        ### Step 2: symmetry decides whether the law is useful

        For a long, straight, round current (a wire, a thick wire, a coax) the symmetry fixes everything:
        - **No $H_z$:** in Biot–Savart, $d\mathbf l\parallel\hat z$, and $\hat z\times\hat R$ has no $z$-part.
        - **No $H_r$:** a radial field would send net flux out of a closed cylinder around the axis, which $\oint\mathbf B\cdot d\mathbf S = 0$ forbids.
        - **$H_\phi$ depends only on $r$:** the setup looks the same after a rotation about the axis or a slide along it.

        So $\mathbf H = H_\phi(r)\hat\phi$. Take $C$ = a circle of radius $r$ around the axis; $\mathbf H\parallel d\mathbf l$ and $|\mathbf H|$ is constant on it:
        $$H_\phi\cdot2\pi r = I_{\text{enc}}(r) \qquad\Rightarrow\qquad H_\phi = \frac{I_{\text{enc}}(r)}{2\pi r}$$
        A thin wire gives back $\mu_0I/2\pi r$ in one line.

        Three shapes have enough symmetry: **round** (circle), **planar** (rectangle straddling the sheet, Topic 6), **coiled** (solenoid rectangle, toroid circle). For a finite segment, a single loop or a square loop the law is still true, but no path has a constant $\mathbf H$: use Biot–Savart (Topic 4).
      `),
      Q(md`**Predict.** Can Ampère's law alone give $\mathbf B$ at the center of a single circular current loop?`,
        ['No: no path around the wire has a known, constant $\\mathbf H$', 'Yes: use a circle through the center', 'Yes: use the loop itself as $C$', 'No: Ampère\'s law does not hold for loops'], 0,
        [null, '$\\mathbf H$ is neither constant nor along $d\\mathbf l$ on such a circle; you cannot pull it out of the integral.', 'A path along the current is not an Amperian loop around it: no current passes through it.', 'The law holds for every path. It is just not solvable here.'],
        md`$\oint\mathbf H\cdot d\mathbf l = I$ around any path linking the wire, but $\mathbf H$ varies along every such path. Biot–Savart gives $\mu_0I/2a$.`),
      RF(md`
        ### Step 3: the thick wire

        [[fig:thick]]

        Uniform $\mathbf J = \dfrac{I}{\pi a^2}\hat z$ fills $r < a$. A circle of radius $r$ encloses
        - inside ($r < a$): $I_{\text{enc}} = J\pi r^2 = I\,r^2/a^2$, so $H_\phi = \dfrac{Ir}{2\pi a^2} = \dfrac{Jr}{2}$;
        - outside ($r > a$): all of it, so $H_\phi = \dfrac{I}{2\pi r}$, as if the current were a thin line on the axis.

        $H$ rises linearly, peaks at the surface ($I/2\pi a$), then falls as $1/r$. It is continuous at $r = a$. Summer 2018 #1(a) gives $J$ directly ($\hat z/\pi$ A/m²): use $H_\phi = Jr/2$ inside and $Ja^2/2r$ outside.
      `, { thick: PF.row([{ svg: roundFig(false), cap: 'Uniform J out of the page. The inner circle encloses only the fraction r²/a².' }, { svg: thickPlot(), cap: 'H_φ(r): linear inside, 1/r outside, largest at r = a.' }]) }),
      Q(md`**Predict.** For the thick wire, which is larger: $H$ at $r = a/2$ or $H$ at $r = 2a$?`,
        ['they are equal', '$r = a/2$: it is closer to the axis', '$r = 2a$: it encloses all the current', 'cannot tell without $I$'], 0,
        [null, 'Inside, closer to the axis means **less** field: only $I/4$ is enclosed at $a/2$.', 'It encloses all of $I$, but spread over a circle four times longer than at $a/2$.', 'Both are fractions of the same surface value $I/2\\pi a$.'],
        md`Inside: $H(a/2) = \dfrac{I(a/2)}{2\pi a^2} = \dfrac{I}{4\pi a}$. Outside: $H(2a) = \dfrac{I}{2\pi(2a)} = \dfrac{I}{4\pi a}$. Both are half the surface value.`),
      RF(md`
        ### Step 4: the coax

        [[fig:coax]]

        A solid inner wire of radius $a$ carries $I$ one way; a thin outer shell of radius $b$ carries it back. Circles of radius $r$:
        $$H_\phi = \frac{Ir}{2\pi a^2}\ (r < a), \qquad H_\phi = \frac{I}{2\pi r}\ (a < r < b), \qquad H_\phi = 0\ (r > b)$$
        Outside, $I_{\text{enc}} = I - I = 0$, and with $\mathbf H = H_\phi(r)\hat\phi$ that makes $H_\phi = 0$ exactly. The return current shields the outside world. (If the outer conductor is thick, $b < r < c$, the enclosed current falls from $I$ to 0 across it.)
      `, { coax: PF.row([{ svg: roundFig(true), cap: 'Inner conductor out of the page, outer shell back into it.' }, { svg: coaxPlot(), cap: 'H_φ(r) for the coax: zero outside the shell.' }]) }),
      Q(md`**Predict.** (Lecture 12's challenge question.) A coax has a solid center wire (radius $a$) and an outer cylindrical shell (radius $b$). A uniform $\mathbf J$ flows along $-\hat x$ in the inner wire, and the total current returns on the shell. In which region(s) is $\mathbf H$ constant?`,
        ['$r > b$', '$r < a$', '$a < r < b$', 'both $a < r < b$ and $r > b$'], 0,
        [null, 'Inside the wire $H_\\phi\\propto r$: it grows from zero at the axis.', 'Between the conductors $H_\\phi = I/2\\pi r$: it falls with $r$.', 'Only outside is it constant (zero); between, it falls as $1/r$.'],
        md`Outside both conductors $I_{\text{enc}} = 0$, so $\mathbf H = 0$ everywhere there: constant. The current's direction ($-\hat x$ here) only fixes which way $\hat\phi$ circulates inside.`),
      RF(md`
        ### Step 5: the solenoid

        [[fig:sol]]

        A long solenoid with $n$ turns per meter carrying $I$. Symmetry: $\mathbf H$ points along the axis. Outside, a long solenoid's field is zero. Take a rectangle with one side of length $L$ inside along the axis, one side outside, and two ends crossing the wall. The ends run perpendicular to $\mathbf H$ and the outside side sees $\mathbf H = 0$, so only the inside side counts. The rectangle is pierced by $nL$ turns:
        $$HL = nL\,I \qquad\Rightarrow\qquad H = nI, \qquad B = \mu_0nI$$
        Uniform: the same at every point inside, whatever the radius. **Direction by the RHR:** fingers along the current in the turns, thumb along $\mathbf H$. Summer 2017 #1(b): $n = 1000$ /m and $I = 1$ mA give $H = 1$ A/m.
      `, { sol: { svg: solenoidFig(), cap: 'C counterclockwise: dS out of the page, so the nL turns along the top wall count +nLI. Only the side inside contributes: HL.' } }),
      Q(md`**Predict.** You rewind a long solenoid on a tube of **twice the radius**, same turns per meter, same current. $H$ inside…`,
        ['stays the same', 'halves', 'doubles', 'quadruples'], 0,
        [null, 'That is how a loop\'s center field behaves, $\\mu_0I/2a$; a long solenoid\'s field does not depend on radius.', 'The rectangle argument never uses the radius.', 'The area grows by four, but $H = nI$ has no area in it.'],
        md`$H = nI$: only the turns per meter and the current enter. (The flux, $B\pi a^2$, does grow by four.)`),
      RF(md`
        ### Step 6: the toroid, and MMF

        [[fig:tor]]

        $N$ turns wound around a ring (inner radius $a$, outer $b$). A circle of radius $r$ inside the core passes through every turn once:
        $$H_\phi\cdot2\pi r = NI \qquad\Rightarrow\qquad H_\phi = \frac{NI}{2\pi r}\quad(a < r < b)$$
        In the hole ($r < a$) nothing is enclosed; outside ($r > b$) $N$ turns go up and $N$ come down. Both give $H = 0$. Unlike the solenoid, the toroid's field is **not uniform**: it is larger at the inner wall, by $b/a$. Spring 2018 #2 gives $\mathbf B = (\mu_0NI/2\pi r)\,\hat\phi$ and asks for the flux through one turn (Topic 7).

        $\oint\mathbf H\cdot d\mathbf l = NI$ is the **magnetomotive force**: the "ampere-turns" that drive $\mathbf H$ around a core, as an emf drives current around a circuit.
      `, { tor: { svg: toroidFig(), cap: 'Turns come up through the hole (dots) and go down outside (crosses). Inside the core, H circles counterclockwise.' } }),
      Q(md`**Predict.** A toroid has inner radius $4$ cm and outer radius $6$ cm. $H$ at the inner wall divided by $H$ at the outer wall is…`,
        ['$1.5$', '$1$', '$0.67$', '$2.25$'], 0,
        [null, 'That would be a solenoid. A toroid\'s $H\\propto1/r$.', 'Inverted: the inner wall is closer, so $H$ is larger there.', 'One power of $r$, not two.'],
        md`$H\propto1/r$: $6/4 = 1.5$.`),
      R(md`
        ### Step 7: check the result with the curl

        Ampère's law also has a point form, $\nabla\times\mathbf H = \mathbf J$. For $\mathbf H = H_\phi(r)\,\hat\phi$, one term of the cylindrical curl survives ([Unit 0, Lesson C](#/l/u0-curl-div)):
        $$\mathbf J = \nabla\times\mathbf H = \hat z\,\frac1r\frac{d}{dr}\big(rH_\phi\big)$$
        Multiply by $r$, differentiate, divide by $r$: **not** $dH_\phi/dr$. Since $rH_\phi = I_{\text{enc}}(r)/2\pi$,
        $$J_z = \frac{1}{2\pi r}\frac{dI_{\text{enc}}}{dr}$$
        the current in a thin ring, divided by the ring's area $2\pi r\,dr$. Where $I_{\text{enc}}$ stops growing, $\mathbf J = 0$, even though $\mathbf H \ne 0$.

        | region | $H_\phi$ | $rH_\phi$ | $J_z$ |
        |---|---|---|---|
        | inside the wire, $r < a$ | $\dfrac{Ir}{2\pi a^2}$ | $\dfrac{Ir^2}{2\pi a^2}$ | $\dfrac{I}{\pi a^2}$: the uniform $J$ ✓ |
        | between, $a < r < b$ (or outside a lone wire) | $\dfrac{I}{2\pi r}$ | $\dfrac{I}{2\pi}$ | $0$ ✓ |
        | thick outer conductor, $b < r < c$ | $\dfrac{I}{2\pi r}\,\dfrac{c^2 - r^2}{c^2 - b^2}$ | $\dfrac{I}{2\pi}\,\dfrac{c^2 - r^2}{c^2 - b^2}$ | $-\dfrac{I}{\pi(c^2 - b^2)}$: the return current ✓ |
        | outside the coax | $0$ | $0$ | $0$ ✓ |

        With a thin outer shell instead, $rH_\phi$ drops from $I/2\pi$ to $0$ at $r = b$: the curl is a spike there, the shell's surface current. Any $H_\phi(r)$ you derive must give back the $\mathbf J$ you started from.
      `),
      Q(md`**Predict.** Inside a long wire, Ampère gives $H_\phi = kr^2/3$, with $k$ a constant. The current density in the wire is…`,
        [md`$kr\,\hat z$`, md`$\dfrac{2kr}{3}\,\hat z$`, md`$\dfrac{kr}{3}\,\hat z$`, md`$k\,\hat z$, uniform`], 0,
        [null, md`That is $dH_\phi/dr$ alone. Differentiate $rH_\phi = kr^3/3$, then divide by $r$.`, md`That is $H_\phi/r$ alone, the other half of the product rule.`, md`A uniform $J$ gives $H_\phi\propto r$, not $r^2$.`],
        md`$rH_\phi = kr^3/3$, $\;\dfrac{d}{dr}(rH_\phi) = kr^2$, divide by $r$: $\;J_z = kr$. Back to Ampère: $\int_0^rkr'\,2\pi r'\,dr' = \dfrac{2\pi kr^3}{3} = 2\pi rH_\phi$. ✓`, { id: 't5-ampere.curl0' }),
      RF(md`
        ### The method

        !!method Ampère's law in five steps
          1. **Symmetry first.** Which component of $\mathbf H$ survives, and what does it depend on? Round: $H_\phi(r)$. Planar: parallel to the sheet, across the current. Solenoid: along the axis, uniform inside.
          2. **Choose $C$** along $\mathbf H$ where you want it, and perpendicular to $\mathbf H$ (or where $\mathbf H = 0$) everywhere else.
          3. **Orient $C$**; the RHR gives $d\mathbf S$. Left side: $H\times$(length where $\mathbf H\parallel d\mathbf l$).
          4. **$I_{\text{enc}}$:** $\int\mathbf J\cdot d\mathbf S$ over the part of $S$ inside the conductor. Partial areas inside a conductor; return currents with their sign.
          5. **Solve, give the direction** by the RHR, and check: $H$ is continuous at the surface of a volume current; zero where the enclosed current is zero; $\frac1r\frac{d}{dr}(rH_\phi)$ gives back $J$ (Step 7).

        ### Worked example

        !!graded Problem
          A coax has a solid inner conductor of radius $a = 2$ mm carrying $I = 5$ A along $+\hat z$, and a thick outer conductor $b = 6$ mm $< r < c = 8$ mm carrying $5$ A back along $-\hat z$, each uniformly distributed. Find $\mathbf H$ at $r = 1.5$, $4$, $7$ and $10$ mm, and $B$ at $4$ mm.

        **1. Symmetry and path.** Round and long: $\mathbf H = H_\phi(r)\hat\phi$. $C$: a circle of radius $r$, counterclockwise seen from $+z$, so $d\mathbf S = +\hat z\,dS$. $H_\phi\,2\pi r = I_{\text{enc}}(r)$.

        **2. $r = 1.5$ mm (inside the inner conductor).** $I_{\text{enc}} = I\,r^2/a^2 = (5\,\text{A})(1.5/2)^2 = 2.81$ A.
        $$H_\phi = \frac{2.81\,\text{A}}{2\pi(1.5\times10^{-3}\,\text{m})} = 298\ \text{A/m}$$

        **3. $r = 4$ mm (between).** $I_{\text{enc}} = 5$ A: $H_\phi = \dfrac{5\,\text{A}}{2\pi(4\times10^{-3}\,\text{m})} = 199$ A/m, and $B = \mu_0H = (4\pi\times10^{-7})(199) = 2.50\times10^{-4}$ T $= 250\ \mu$T.

        **4. $r = 7$ mm (inside the outer conductor).** The outer current is spread over $\pi(c^2 - b^2)$; the circle encloses the part $\pi(r^2 - b^2)$ of it, flowing along $-\hat z$:
        $$I_{\text{enc}} = 5\,\text{A}\left(1 - \frac{7^2 - 6^2}{8^2 - 6^2}\right) = 5\left(1 - \frac{13}{28}\right) = 2.68\ \text{A}, \qquad H_\phi = \frac{2.68\,\text{A}}{2\pi(7\times10^{-3}\,\text{m})} = 60.9\ \text{A/m}$$

        **5. $r = 10$ mm (outside).** $I_{\text{enc}} = 5 - 5 = 0$: $\mathbf H = 0$.

        All nonzero answers point along $+\hat\phi$ (counterclockwise seen from $+z$, the RHR with the thumb along the inner current).

        [[fig:ex]]

        **Check.** At $r = a$: inside formula $5/(2\pi\cdot0.002) = 398$ A/m, the same as the between formula. ✓ At $r = c$ the enclosed current reaches 0, and $H$ with it. ✓ Units: A/m. ✓

        !!mistake Common mistakes
          - Using the total $I$ inside a conductor. A circle at $r < a$ encloses only $I\,r^2/a^2$ of a uniform current.
          - Applying Ampère without symmetry (a finite segment, one loop) and dividing by a length anyway. The law holds; the shortcut does not.
          - Forgetting the return current: outside a coax, and outside a solenoid or toroid, $\mathbf H = 0$.
          - Solenoid with $N$ instead of $n = N/\ell$. A toroid uses the total $N$ over $2\pi r$.
          - Treating the toroid's field as uniform. It is $\propto 1/r$; the mean radius is only an approximation for a thin core.
          - Mixing $\mathbf H$ (A/m) and $\mathbf B$ (T). $\mathbf B = \mu_0\mathbf H$; answer in the one asked for.
          - A sign slip in $I_{\text{enc}}$: the direction of $C$ fixes $d\mathbf S$ by the RHR.

        ### Check questions
      `, { ex: { svg: exPlot(), cap: 'H_φ(r) for the worked example; the dots are the three nonzero answers.' } }),
      Q(md`The current density in a long cylinder is $\mathbf J = \hat z/\pi$ A/m² for $r < a$ and zero otherwise. With $a = \pi$ m, $H_\phi$ at $r = a$ is…`,
        ['$1/2$ A/m', '$\\pi/2$ A/m', '$1/(2\\pi)$ A/m', '$1$ A/m'], 0,
        [null, 'That forgets the $1/\\pi$ in $J$: $H = Jr/2 = (1/\\pi)(\\pi)/2$.', 'That uses $r = 1$ m instead of $r = a = \\pi$ m.', 'That drops the 2 from $H = Jr/2$.'],
        md`$H_\phi\,2\pi r = J\pi r^2$, so $H_\phi = Jr/2 = \frac{1}{\pi}\cdot\frac{\pi}{2} = \frac12$ A/m. (Summer 2018, 1(a)(iii).)`, { src: 'Summer 2018 Exam 2', id: 't5-ampere.p14' }),
      Q(md`Same cylinder ($\mathbf J = \hat z/\pi$ A/m² for $r < a$), now with $a = 1$ m. $H_\phi$ at $r = 2a$ is…`,
        ['$1/(4\\pi)$ A/m', '$1/(2\\pi)$ A/m', '$1/\\pi$ A/m', '$1/4$ A/m'], 0,
        [null, 'That is the surface value $I/2\\pi a$, at $r = a = 1$ m, not $2a$.', 'That is $Jr/2$ at $r = 2$ m: the inside formula used outside.', 'The enclosed current is $J\\pi a^2 = 1$ A; divide by $2\\pi r$, not by $r^2$.'],
        md`$I_{\text{enc}} = J\pi a^2 = 1$ A; $H_\phi = \dfrac{1}{2\pi(2)} = \dfrac{1}{4\pi}$ A/m. (Summer 2018, 1(a)(iv).)`, { src: 'Summer 2018 Exam 2', id: 't5-ampere.p15' }),
      Q(md`A long solenoid has $N = 1000$ loops per meter and carries $I_1 = 1$ mA. Its internal field is $\mathbf H = H_0\hat z$ with $H_0 = $`,
        ['$1$ A/m', '$1000$ A/m', '$1.26\\ \\mu$T', '$10^{-3}$ A/m'], 0,
        [null, 'That uses $I = 1$ A instead of 1 mA.', 'That is $B = \\mu_0H$, in tesla; the question asks for $H$.', 'That forgets the turns per meter.'],
        md`$H_0 = nI = (1000\ \text{m}^{-1})(10^{-3}\ \text{A}) = 1$ A/m. (Summer 2017, 1(b)(i).)`, { src: 'Summer 2017 Exam 2', id: 't5-ampere.p16' }),
      Q(md`A long solenoid along $\hat x$ ($1000$ loops/m, $I_1 = 1$ mA) gives $\mathbf H = 1\,\hat x$ A/m inside. A second solenoid with $500$ loops/m is put inside it. To make $\mathbf H = 0$ inside the inner one, its current must be…`,
        ['$2$ mA, opposite in direction to $I_1$', '$1$ mA, opposite to $I_1$', '$2$ mA, in the same direction as $I_1$', '$0.5$ mA, opposite to $I_1$'], 0,
        [null, 'With half the turns per meter it needs twice the current: $500\\,I_2 = 1$ A/m.', 'Same direction would add to the field instead of cancelling it.', 'That scales by the turns ratio the wrong way: $I_2 = I_1n_1/n_2 = (1\\ \\text{mA})(1000/500)$.'],
        md`Inside the inner solenoid both fields add: $1 + 500\,I_2 = 0$, so $I_2 = -2$ mA. Between the two, only the outer one's field remains. (Summer 2020, 2(b)(ii).)`, { src: 'Summer 2020 Exam 2', id: 't5-ampere.p17' }),
      Q(md`A closed path runs near a long wire but does **not** encircle it. Then…`,
        ['$\\oint\\mathbf H\\cdot d\\mathbf l = 0$, though $\\mathbf H\\ne0$ on the path', '$\\mathbf H = 0$ everywhere on the path', '$\\oint\\mathbf H\\cdot d\\mathbf l = I$', 'Ampère\'s law does not apply'], 0,
        [null, 'The wire\'s field reaches the path; only its circulation cancels.', 'Only currents through the surface count.', 'It applies to every closed path.'],
        md`$I_{\text{enc}} = 0$, so the circulation is zero: $\mathbf H\cdot d\mathbf l$ is positive on part of the path and negative on the rest.`, { id: 't5-ampere.p18' }),
      Q(md`A **square** path is drawn around a long straight wire carrying $I$. $\oint\mathbf H\cdot d\mathbf l$ is…`,
        ['$I$', '$I$ times $4/\\pi$', 'less than $I$, since the corners are farther', 'not defined: Ampère needs a circle'], 0,
        [null, 'The shape of the path does not matter; only the enclosed current does.', 'The far corners have a weaker $H$ but a longer path; the circulation is exactly $I$.', 'Any closed path works; a circle is only the convenient one.'],
        md`The law holds for any path. A square just makes $\mathbf H$ hard to pull out of the integral.`, { id: 't5-ampere.p19' }),
      Q(md`A long thin-walled tube of radius $b$ carries current $I$ along its length. Inside the tube ($r < b$), $H$ is…`,
        ['zero', '$I/2\\pi r$', '$Ir/2\\pi b^2$', '$I/2\\pi b$'], 0,
        [null, 'That is the field **outside** the tube.', 'That is a solid wire; a tube carries no current inside $r < b$.', 'That is the value just outside the wall.'],
        md`A circle inside the tube encloses nothing, and $\mathbf H = H_\phi(r)\hat\phi$, so $H_\phi = 0$.`, { id: 't5-ampere.p20' }),
      Q(md`Why does a long straight wire have no **radial** component of $\mathbf B$?`,
        ['A radial $\\mathbf B$ would give net flux out of a closed cylinder, but $\\oint\\mathbf B\\cdot d\\mathbf S = 0$', 'Ampère\'s law forbids it', 'The current is along $\\hat z$, so $\\mathbf B$ must be too', 'It does have one, but it is small'], 0,
        [null, 'Ampère\'s law constrains the circulation, the $\\hat\\phi$ part; it says nothing about $B_r$.', '$\\mathbf B$ is perpendicular to the current; a $\\hat z$ part is ruled out by Biot–Savart.', 'By symmetry and $\\nabla\\cdot\\mathbf B = 0$ it is exactly zero.'],
        md`By symmetry $B_r$ would be the same all over a coaxial cylinder, giving net flux out of it. Gauss's law for $\mathbf B$ makes it zero.`, { id: 't5-ampere.p21' }),
      Q(md`Between the conductors of a coax, $H_\phi = I/2\pi r$, which is not zero. There, $\nabla\times\mathbf H$ is…`,
        ['$0$', md`$-\dfrac{I}{2\pi r^2}\,\hat z$`, md`$\dfrac{I}{2\pi r}\,\hat z$`, md`$\dfrac{I}{2\pi r^2}\,\hat\phi$`], 0,
        [null, md`That is $\partial H_\phi/\partial r$ alone. The curl is $\frac1r\frac{d}{dr}(rH_\phi)$, and $rH_\phi = I/2\pi$ is constant.`, md`That is $H_\phi$ itself pointed along $\hat z$; the curl is a derivative, in A/m².`, md`The curl of a $\hat\phi$ field that depends on $r$ points along $\hat z$, and here it is zero.`],
        md`No current flows between the conductors, and the curl says so: $\mathbf H$ circles the inner current without having curl where there is no current.`, { id: 't5-ampere.curl1' }),
      Q(md`In the thick outer conductor of a coax ($b < r < c$, return current spread uniformly), $\nabla\times\mathbf H$ points…`,
        [md`along $-\hat z$, opposite to the inner current`, md`along $+\hat z$, since $H_\phi > 0$ there`, md`along $+\hat\phi$, like $\mathbf H$`, md`nowhere: it is zero, as between the conductors`], 0,
        [null, md`$H_\phi > 0$ is not the test. $rH_\phi\propto c^2 - r^2$ **decreases**, so $\frac1r\frac{d}{dr}(rH_\phi) < 0$.`, md`The curl of $H_\phi(r)\,\hat\phi$ has only a $\hat z$ part.`, md`Here $H_\phi$ falls faster than $1/r$: $rH_\phi$ drops from $I/2\pi$ to $0$ across the conductor.`],
        md`$J_z = \dfrac1r\dfrac{d}{dr}\Big[\dfrac{I}{2\pi}\dfrac{c^2 - r^2}{c^2 - b^2}\Big] = -\dfrac{I}{\pi(c^2 - b^2)}$: the return current, uniform over the outer conductor.`, { id: 't5-ampere.curl2' }),
      Q(md`You know $H_\phi(r)$ for some long, round current distribution. Where is $\mathbf J = 0$?`,
        [md`wherever $rH_\phi$ does not change with $r$`, md`wherever $H_\phi$ does not change with $r$`, md`only where $H_\phi = 0$`, md`wherever $H_\phi$ decreases with $r$`], 0,
        [null, md`A constant $H_\phi = H_0$ gives $J_z = H_0/r \ne 0$.`, md`Between coax conductors $H_\phi = I/2\pi r \ne 0$, yet $\mathbf J = 0$.`, md`Falling as $1/r$ gives zero; falling faster gives a negative $J_z$ (a return current), and slower a positive one.`],
        md`$J_z = \frac1r\frac{d}{dr}(rH_\phi)$ and $2\pi rH_\phi = I_{\text{enc}}$: $\mathbf J = 0$ exactly where the enclosed current stops changing.`, { id: 't5-ampere.curl3' }),
      R(md`
        ### Rapid fire: enclosed current

        **The trick:** orient $C$, get $d\mathbf S$ by the RHR, then add signed currents. Inside a uniform conductor, enclose the **area fraction**: $r^2/a^2$ for a solid wire, $(r^2 - b^2)/(c^2 - b^2)$ of a thick shell.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t5_enc', { need: 8 }), { id: 't5-ampere.r0' }),
      R(md`
        ### Rapid fire: field values

        **The trick:** $H = I_{\text{enc}}/(\text{length})$: $2\pi r$ for round symmetry, $L$ for a solenoid side. Then $B = \mu_0H$, with $\mu_0\approx1.26\times10^{-6}$.
      `),
      Object.assign(G('rf_t5_val', { need: 8 }), { id: 't5-ampere.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      Object.assign(G('t5_thick', { need: 2 }), { id: 't5-ampere.g27' }),
      Object.assign(G('t5_coax', { need: 2 }), { id: 't5-ampere.g28' }),
      Object.assign(G('t5_nested', { need: 2 }), { id: 't5-ampere.g29' }),
      Object.assign(G('t5_toroid', { need: 2 }), { id: 't5-ampere.g30' }),
      Object.assign(G('t5_curl', { need: 2 }), { id: 't5-ampere.gcurl' }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  GENS.rf_t5_enc = () => one([
    // three wires, some inside C
    () => {
      const ws = [0, 1, 2].map(() => ({ I: pick([1, 2, 3, 4, 5, 6, 8, 10]), out: pick([true, false]), inside: pick([true, true, false]) }));
      if (!ws.some((w) => w.inside)) ws[0].inside = true;
      const ccw = pick([true, false]);
      const sgn = (w) => (w.out === ccw ? 1 : -1);          // ccw: dS out of the page
      const enc = ws.filter((w) => w.inside).reduce((s, w) => s + sgn(w) * w.I, 0);
      const all = ws.reduce((s, w) => s + sgn(w) * w.I, 0);
      const mags = ws.filter((w) => w.inside).reduce((s, w) => s + w.I, 0);
      const o = (x) => `$${x}$ A`;
      const desc = ws.map((w, i) => `wire ${i + 1}: ${w.I} A ${w.out ? 'out of' : 'into'} the page, ${w.inside ? 'inside' : 'outside'} $C$`).join('; ');
      const k0 = ws.findIndex((w) => w.inside), w0 = ws[k0];
      return MC('Enclosed current', md`Three long wires pierce the page: ${desc}. $C$ runs **${ccw ? 'counterclockwise' : 'clockwise'}** on the page. $\oint_C\mathbf H\cdot d\mathbf l = $`, o(enc),
        [[o(-enc), md`${ccw ? 'Counterclockwise' : 'Clockwise'} $C$ puts $d\mathbf S$ ${ccw ? 'out of' : 'into'} the page; currents that way count positive.`], [o(mags), 'The directions matter: currents against $d\\mathbf S$ subtract.'], [o(all), 'Only currents **inside** $C$ count.'], [o(enc === 0 ? mags : 0), enc === 0 ? 'The inside currents cancel exactly.' : 'Some net current passes through $S$.'],
          [o(enc - 2 * sgn(w0) * w0.I), md`Wire ${k0 + 1} runs ${w0.out ? 'out of' : 'into'} the page, ${sgn(w0) > 0 ? 'along' : 'against'} $d\mathbf S$: it counts ${sgn(w0) > 0 ? '+' : '−'}${w0.I} A.`]],
        md`$d\mathbf S$ points ${ccw ? 'out of' : 'into'} the page. Inside: ${ws.filter((w) => w.inside).map((w) => `${sgn(w) > 0 ? '+' : '-'}${w.I}`).join(' ')} $= ${enc}$ A.`);
    },
    // fraction of a uniform wire
    () => {
      const [fr, ft] = pick([[0.5, '\\tfrac12'], [0.25, '\\tfrac14'], [0.3, '0.3'], [0.8, '0.8'], [2, '2']]);
      const I = pick([2, 4, 5, 10, 20]);
      const enc = fr < 1 ? I * fr * fr : I;
      const o = (x) => `$${r3(x)}$ A`;
      return MC('Inside a wire', md`A long wire of radius $a$ carries $${I}$ A spread uniformly over its cross-section. A coaxial circle of radius $r = ${ft}\,a$ encloses…`, o(enc),
        [[o(fr < 1 ? I * fr : I * fr * fr), fr < 1 ? 'The enclosed current goes as the **area**, $r^2/a^2$, not $r/a$.' : 'Outside the wire the circle encloses all of it, no more.'], [o(fr < 1 ? I : I / (fr * fr)), fr < 1 ? 'The circle is inside the wire: it encloses only part of the current.' : 'Outside, all the current is enclosed.'], [o(I * 2), 'The circle cannot enclose more than the total.'], [o(I / 2), 'Uniform current: enclose by area.']],
        fr < 1 ? md`$I_{\text{enc}} = I\,r^2/a^2 = ${I}\times${r3(fr * fr)} = ${r3(enc)}$ A.` : md`$r > a$: all ${I} A is enclosed.`);
    },
    // coax regions
    () => {
      const [reg, ans, why] = pick([
        ['between the inner wire and the shell', '$I$', [['$0$', 'The return current is on the shell, outside this circle.'], ['$2I$', 'The two conductors carry opposite currents.'], ['$I\\,r^2/a^2$', 'That is inside the inner wire.']]],
        ['outside the shell', '$0$', [['$I$', 'The shell\'s return current is enclosed too.'], ['$2I$', 'The currents are opposite: they cancel.'], ['$-I$', 'The inner current is enclosed as well.']]],
        ['inside the inner wire, at $r = a/2$', '$I/4$', [['$I/2$', 'Enclose by area: $(1/2)^2$.'], ['$I$', 'Only part of the inner wire is inside the circle.'], ['$0$', 'Part of the inner current is enclosed.']]],
      ]);
      return MC('Coax', md`A coax: inner wire (radius $a$) carries $I$ uniformly, a thin outer shell (radius $b$) carries it back. A coaxial circle ${reg} encloses…`, ans, why, md`Inner: $I\,r^2/a^2$; between: $I$; outside: $I - I = 0$.`);
    },
    // solenoid rectangle
    () => {
      const n = pick([200, 500, 1000, 2000]), L = pick([0.02, 0.05, 0.1, 0.2]), I = pick([0.5, 1, 2, 3]);
      const enc = n * L * I;
      const o = (x) => `$${r3(x)}$ A`;
      return MC('Solenoid rectangle', md`A long solenoid has $${n}$ turns/m carrying $${I}$ A. A rectangle straddles one wall, with sides of length $${L * 100}$ cm along the axis. $|I_{\text{enc}}|$ is…`, o(enc),
        [[o(n * I), 'Only the turns that pierce the rectangle count: $nL$ of them.'], [o(enc * 2), 'Only one wall passes through the rectangle.'], [o(L * I), 'Each turn carries $I$ through the rectangle; there are $nL$ turns.']],
        md`$nL = ${r3(n * L)}$ turns pierce it, each carrying $${I}$ A: $${r3(enc)}$ A.`);
    },
  ]);

  GENS.rf_t5_val = () => one([
    // thin wire H
    () => {
      const I = pick([1, 2, 5, 10, 20]), rc = pick([1, 2, 5, 10]);
      const H = I / (TWO_PI * rc / 100);
      const o = (x) => `${r3(x)} A/m`;
      return MC('Wire', md`A long wire carries $${I}$ A. $H$ at $${rc}$ cm is…`, o(H),
        [[o(H / 100), 'Convert cm to m.'], [o(H * TWO_PI), 'That forgets the $2\\pi$: $H = I/2\\pi r$.'], [o(H * 4 * Math.PI * 1e-7), 'That is $B$ in tesla, not $H$.']],
        md`$H = I/2\pi r = ${I}/(2\pi\times${rc / 100}) = ${r3(H)}$ A/m.`);
    },
    // solenoid
    () => {
      const Nt = pick([100, 200, 500, 1000]), l = pick([0.1, 0.2, 0.5]), I = pick([0.5, 1, 2, 5]);
      const H = Nt / l * I;
      const o = (x) => `${p(r3(x))} A/m`;
      return MC('Solenoid', md`A solenoid of length $${l * 100}$ cm has $${Nt}$ turns and carries $${I}$ A. $H$ inside is…`, o(H),
        [[o(Nt * I), 'That uses the total $N$; the formula is $nI$ with $n = N/\\ell$.'], [o(H / TWO_PI), 'No $2\\pi$ for a solenoid.'], [o(I / l), 'The turns are missing.']],
        md`$n = ${Nt}/${l} = ${p(Nt / l)}$ /m; $H = nI = ${p(r3(H))}$ A/m.`);
    },
    // toroid
    () => {
      const Nt = pick([100, 200, 500, 1000]), I = pick([0.5, 1, 2]), rc = pick([5, 8, 10, 20]);
      const H = Nt * I / (TWO_PI * rc / 100);
      const o = (x) => `${p(r3(x))} A/m`;
      return MC('Toroid', md`A toroid of $${Nt}$ turns carries $${I}$ A. $H$ in the core at $r = ${rc}$ cm is…`, o(H),
        [[o(Nt * I / (rc / 100)), 'The path is the circumference, $2\\pi r$.'], [o(I / (TWO_PI * rc / 100)), 'The circle links all $N$ turns.'], [o(H / 100), 'Convert cm to m.']],
        md`$H = NI/2\pi r = (${Nt})(${I})/(2\pi\times${rc / 100}) = ${p(r3(H))}$ A/m.`);
    },
    // H to B
    () => {
      const H = pick([1, 10, 100, 500, 1000]);
      const B = 4 * Math.PI * 1e-7 * H * 1e6;
      const o = (x) => `${p(r3(x))} µT`;
      return MC('H to B', md`In free space $H = ${H}$ A/m. $B = $`, o(B),
        [[o(H / (4 * Math.PI * 1e-7) * 1e-6), 'That divides by $\\mu_0$; $B = \\mu_0H$.'], [o(B / (4 * Math.PI)), 'That uses $\\mu_0 = 10^{-7}$; it is $4\\pi\\times10^{-7}$.'], [o(B * 10), 'Off by ten.']],
        md`$B = \mu_0H = (4\pi\times10^{-7})(${H}) = ${p(r3(B))}\ \mu\text{T}$.`);
    },
    // scaling in a thick wire / toroid
    () => {
      const [q, r, w] = pick([
        ['Inside a uniform thick wire you move from $r = a/3$ to $r = 2a/3$. $H$', 'doubles', [['quadruples', 'The enclosed current goes as $r^2$ but the path as $r$: $H\\propto r$.'], ['halves', 'Inside, $H$ grows with $r$.'], ['stays the same', 'Inside a uniform wire $H\\propto r$.']]],
        ['Outside a thick wire you move from $r = 2a$ to $r = 4a$. $H$', 'halves', [['quarters', 'Outside, $H = I/2\\pi r$.'], ['doubles', 'Outside, $H$ falls with $r$.'], ['stays the same', 'Outside, $H\\propto1/r$.']]],
        ['You double a toroid\'s turns and halve its current. $H$ in the core', 'stays the same', [['doubles', 'Only the product $NI$ matters.'], ['halves', 'Only the product $NI$ matters.'], ['quadruples', 'Only the product $NI$ matters.']]],
        ['You stretch a solenoid to twice its length, same total turns and current. $H$ inside', 'halves', [['stays the same', '$n = N/\\ell$ halves.'], ['doubles', 'Fewer turns per meter means less field.'], ['quarters', '$H = nI$ is linear in $n$.']]],
      ]);
      return MC('Scaling', md`${q}…`, r, w, md`Thick wire: $H\propto r$ inside, $\propto1/r$ outside. Solenoid: $H = nI$. Toroid: $H = NI/2\pi r$.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  GENS.t5_thick = () => {
    const giveJ = pick([true, false]);
    const amm = pick([2, 4, 5, 10]), a = amm / 1000;
    let I, J;
    if (giveJ) { J = pick([1, 2, 5, 10]) * 1e5; I = J * Math.PI * a * a; } else { I = pick([2, 5, 10, 20, 50]); J = I / (Math.PI * a * a); }
    const f1 = pick([0.25, 0.4, 0.5, 0.75]), f2 = pick([1.5, 2, 3, 4]);
    const r1 = f1 * a, r2 = f2 * a;
    const H1 = J * r1 / 2, H2 = I / (TWO_PI * r2);
    const B1 = 4 * Math.PI * 1e-7 * H1;
    const rs = a * a / r1;                                    // outside radius where H equals H(r1)
    return {
      title: 'A thick wire',
      q: giveJ
        ? md`A long cylinder of radius $a = ${amm}$ mm carries a uniform $\mathbf J = ${p(J)}\,\hat z$ A/m² (zero outside). Find $H_\phi$ at $r = ${p(r1 * 1000)}$ mm and at $r = ${p(r2 * 1000)}$ mm, $B$ at $r = ${p(r1 * 1000)}$ mm, and the radius outside the wire where $H_\phi$ equals its value at $${p(r1 * 1000)}$ mm.`
        : md`A long wire of radius $a = ${amm}$ mm carries $I = ${I}$ A along $+\hat z$, uniformly over its cross-section. Find $H_\phi$ at $r = ${p(r1 * 1000)}$ mm and at $r = ${p(r2 * 1000)}$ mm, $B$ at $r = ${p(r1 * 1000)}$ mm, and the radius outside the wire where $H_\phi$ equals its value at $${p(r1 * 1000)}$ mm.`,
      parts: [
        N(`H_\\phi(${p(r1 * 1000)}\\ \\text{mm})`, H1, 'A/m'),
        N(`H_\\phi(${p(r2 * 1000)}\\ \\text{mm})`, H2, 'A/m'),
        N(`B(${p(r1 * 1000)}\\ \\text{mm})`, B1 * 1e3, 'mT'),
        N('r_{\\text{out}}', rs * 1000, 'mm'),
      ],
      hints: ['Circle of radius $r$: $H_\\phi\\,2\\pi r = I_{\\text{enc}}$. Inside, $I_{\\text{enc}} = J\\pi r^2$, so $H_\\phi = Jr/2$.', 'Outside, $I_{\\text{enc}} = J\\pi a^2$ and $H_\\phi = Ja^2/2r$. Set it equal to $Jr_1/2$: $r = a^2/r_1$.'],
      sol: sol({
        eq: md`$\oint\mathbf H\cdot d\mathbf l = I_{\text{enc}}$ on a circle: $H_\phi\,2\pi r = I_{\text{enc}}(r)$.`,
        sym: md`$H_\phi = \dfrac{Jr}{2}$ for $r < a$, $\;H_\phi = \dfrac{Ja^2}{2r} = \dfrac{I}{2\pi r}$ for $r > a$, with $J = I/\pi a^2$. Equal values: $\dfrac{a^2}{r} = r_1$, so $r = a^2/r_1$.`,
        sub: md`$J = ${f(J)}$ A/m², $I = ${f(I)}$ A. $$H_\phi(r_1) = \frac{(${f(J)})(${p(r1)})}{2} = ${f(H1)}\ \text{A/m}, \qquad H_\phi(r_2) = \frac{${f(I)}}{2\pi(${p(r2)})} = ${f(H2)}\ \text{A/m}$$ $$B = \mu_0H = (4\pi\times10^{-7})(${f(H1)}) = ${f(B1 * 1e3)}\ \text{mT}, \qquad r_{\text{out}} = \frac{(${amm})^2}{${p(r1 * 1000)}}\ \text{mm} = ${f(rs * 1000)}\ \text{mm}$$`,
        ans: md`$H_\phi = ${f(H1)}$ A/m and $${f(H2)}$ A/m; $B = ${f(B1 * 1e3)}$ mT; $r_{\text{out}} = ${f(rs * 1000)}$ mm. All along $+\hat\phi$.`,
        check: md`At $r = a$ both formulas give $Ja/2 = ${f(J * a / 2)}$ A/m: continuous. ✓ The peak is at the surface.`,
      }),
    };
  };

  GENS.t5_coax = () => {
    const amm = pick([1, 2, 3]), bmm = amm * pick([3, 4]), cmm = bmm + pick([1, 2, 3]), I = pick([2, 5, 10, 20]);
    const r1 = amm * pick([0.4, 0.5, 0.8]), r2 = (amm + bmm) / 2, r3m = (bmm + cmm) / 2;
    const Hof = (r) => { const Ie = r < amm ? I * r * r / (amm * amm) : r < bmm ? I : r < cmm ? I * (cmm * cmm - r * r) / (cmm * cmm - bmm * bmm) : 0; return Ie / (TWO_PI * r / 1000); };
    const Ie3 = I * (cmm * cmm - r3m * r3m) / (cmm * cmm - bmm * bmm);
    return {
      title: 'Coax with a thick outer conductor',
      q: md`A coax carries $I = ${I}$ A along $+\hat z$ in a solid inner conductor of radius $a = ${amm}$ mm and back along $-\hat z$ in an outer conductor $${bmm}\ \text{mm} < r < ${cmm}$ mm, each uniformly distributed. Find $H_\phi$ at $r = ${p(r1)}$ mm, $${p(r2)}$ mm and $${p(r3m)}$ mm, and say what it is at $r = ${cmm + 2}$ mm.`,
      parts: [
        N(`H_\\phi(${p(r1)}\\ \\text{mm})`, Hof(r1), 'A/m'),
        N(`H_\\phi(${p(r2)}\\ \\text{mm})`, Hof(r2), 'A/m'),
        N(`H_\\phi(${p(r3m)}\\ \\text{mm})`, Hof(r3m), 'A/m'),
        { lbl: `$H_\\phi(${cmm + 2}\\ \\text{mm})$ is`, mc: ['zero', `$I/2\\pi r$, about ${r3(Hof(r2) * r2 / (cmm + 2))} A/m`, 'negative'], a: 0, fixed: true, why: [null, 'The return current is enclosed too: $I_{\\text{enc}} = 0$.', 'Nothing is enclosed, so there is no field to point either way.'] },
      ],
      hints: ['Circle of radius $r$: $H_\\phi = I_{\\text{enc}}/2\\pi r$, with $r$ in meters.', 'In the outer conductor the enclosed current is $I\\left[1 - \\dfrac{r^2 - b^2}{c^2 - b^2}\\right] = I\\dfrac{c^2 - r^2}{c^2 - b^2}$.'],
      sol: sol({
        eq: md`$H_\phi\,2\pi r = I_{\text{enc}}(r)$ on a coaxial circle (round symmetry).`,
        sym: md`$I_{\text{enc}} = I\dfrac{r^2}{a^2}\ (r < a)$, $\;I\ (a < r < b)$, $\;I\dfrac{c^2 - r^2}{c^2 - b^2}\ (b < r < c)$, $\;0\ (r > c)$.`,
        sub: md`$$H_\phi(${p(r1)}) = \frac{${I}(${p(r1)}/${amm})^2}{2\pi(${p(r1 / 1000)})} = ${f(Hof(r1))}, \quad H_\phi(${p(r2)}) = \frac{${I}}{2\pi(${p(r2 / 1000)})} = ${f(Hof(r2))}, \quad H_\phi(${p(r3m)}) = \frac{${f(Ie3)}}{2\pi(${p(r3m / 1000)})} = ${f(Hof(r3m))}\ \text{A/m}$$`,
        ans: md`$${f(Hof(r1))}$, $${f(Hof(r2))}$ and $${f(Hof(r3m))}$ A/m along $+\hat\phi$; zero outside.`,
        check: md`Continuous at $r = a$ ($${f(I / (TWO_PI * amm / 1000))}$ A/m from both sides) and at $r = b$. ✓ Zero at $r = c$. ✓`,
      }),
    };
  };

  // Summer 2017 #1(b), Summer 2020 #2(b): a solenoid inside a solenoid
  GENS.t5_nested = () => {
    const n1 = pick([500, 1000, 2000]), I1 = pick([1, 2, 5]), n2 = pick([250, 500, 1000, 2000].filter((x) => x !== n1)), ax = pick(['x', 'z']);
    const a1 = pick([1, 0.5]), a2 = a1 / 2;
    const H0 = n1 * I1 * 1e-3;
    const I2 = -n1 * I1 / n2;                                   // mA
    const Bbetween = 4 * Math.PI * 1e-7 * H0;
    return {
      title: 'Nested solenoids',
      q: md`A long solenoid along the $${ax}$-axis has $${n1}$ loops/m, radius $a_1 = ${a1}$ m, and carries $I_1 = ${I1}$ mA, giving $\mathbf H = H_0\hat ${ax}$ inside. A second solenoid with $${n2}$ loops/m and radius $a_2 = ${a2}$ m is placed inside it, on the same axis, and its current $I_2$ is adjusted so that $\mathbf H = 0$ for $r < a_2$. Find $H_0$, $I_2$ (signed, positive meaning the same sense as $I_1$), and $B$ in the gap $a_2 < r < a_1$.`,
      parts: [
        N('H_0', H0, 'A/m'),
        N('I_2', I2, 'mA'),
        N('B\\ (a_2 < r < a_1)', Bbetween * 1e6, 'µT'),
      ],
      hints: ['$H = nI$ inside a long solenoid, zero outside. Fields of the two solenoids add where both are "inside".', 'For $r < a_2$: $n_1I_1 + n_2I_2 = 0$. In the gap only the outer solenoid counts.'],
      sol: sol({
        eq: md`$H = nI$ inside a long solenoid (rectangular Amperian loop), $0$ outside; superpose.`,
        sym: md`$H_0 = n_1I_1$. For $r < a_2$: $n_1I_1 + n_2I_2 = 0 \Rightarrow I_2 = -\dfrac{n_1}{n_2}I_1$. In the gap: $B = \mu_0n_1I_1$.`,
        sub: md`$$H_0 = (${n1})(${I1}\times10^{-3}) = ${f(H0)}\ \text{A/m}, \qquad I_2 = -\frac{${n1}}{${n2}}(${I1}\ \text{mA}) = ${f(I2)}\ \text{mA}, \qquad B = (4\pi\times10^{-7})(${f(H0)}) = ${f(Bbetween * 1e6)}\ \mu\text{T}$$`,
        ans: md`$H_0 = ${f(H0)}$ A/m; $I_2 = ${f(I2)}$ mA (opposite sense to $I_1$); $B = ${f(Bbetween * 1e6)}$ µT in the gap.`,
        check: md`${n2 < n1 ? 'Fewer' : 'More'} turns per meter on the inner coil (${n2} vs ${n1}) need ${n2 < n1 ? 'more' : 'less'} current than $I_1$. ✓ The radii never enter.`,
      }),
    };
  };

  GENS.t5_toroid = () => {
    const Nt = pick([200, 400, 500, 1000]), I = pick([0.5, 1, 2, 3]), acm = pick([3, 4, 5]), bcm = acm + pick([1, 2, 3]), hcm = pick([1, 2]);
    const a = acm / 100, b = bcm / 100, h = hcm / 100;
    const Ha = Nt * I / (TWO_PI * a), Hb = Nt * I / (TWO_PI * b);
    const rm = (a + b) / 2, Bm = 4 * Math.PI * 1e-7 * Nt * I / (TWO_PI * rm);
    return {
      title: 'A toroid',
      q: md`A toroid of rectangular cross-section (inner radius $a = ${acm}$ cm, outer radius $b = ${bcm}$ cm, height $${hcm}$ cm) has $N = ${Nt}$ turns carrying $I = ${I}$ A. Find $H$ at the inner and outer walls of the core, $B$ at the mean radius, and the MMF around the core.`,
      parts: [
        N('H(r = a)', Ha, 'A/m'),
        N('H(r = b)', Hb, 'A/m'),
        N('B\\ \\text{at}\\ (a + b)/2', Bm * 1e3, 'mT'),
        N('\\text{MMF}', Nt * I, 'A'),
      ],
      hints: ['A circle of radius $r$ inside the core links all $N$ turns: $H\\,2\\pi r = NI$.', 'MMF $= \\oint\\mathbf H\\cdot d\\mathbf l = NI$, the same for every circle inside the core.'],
      sol: sol({
        eq: md`$\oint\mathbf H\cdot d\mathbf l = NI$ on a circle inside the core; $H_\phi = \dfrac{NI}{2\pi r}$ for $a < r < b$.`,
        sym: md`$H(a) = \dfrac{NI}{2\pi a}$, $H(b) = \dfrac{NI}{2\pi b}$, $B = \dfrac{\mu_0NI}{2\pi r_m}$, MMF $= NI$.`,
        sub: md`$$H(a) = \frac{(${Nt})(${I})}{2\pi(${a})} = ${f(Ha)}\ \text{A/m}, \quad H(b) = \frac{(${Nt})(${I})}{2\pi(${b})} = ${f(Hb)}\ \text{A/m}, \quad B = \frac{(4\pi\times10^{-7})(${Nt})(${I})}{2\pi(${p(rm)})} = ${f(Bm * 1e3)}\ \text{mT}$$`,
        ans: md`$H(a) = ${f(Ha)}$ A/m, $H(b) = ${f(Hb)}$ A/m, $B = ${f(Bm * 1e3)}$ mT, MMF $= ${f(Nt * I)}$ A.`,
        check: md`$H(a)/H(b) = b/a = ${p(bcm / acm)}$. ✓ The height ${hcm} cm does not enter $H$; it enters the flux (Topic 7).`,
      }),
    };
  };

  // a nonuniform wire: J from H with the cylindrical curl, I_enc with Ampère, and the two agree
  GENS.t5_curl = () => {
    const kind = pick(['lin', 'sq', 'par']), coax = pick([false, true]);
    const amm = pick([2, 4, 5, 10]), a = amm / 1000, I = pick([2, 5, 10, 20]), bmm = amm * pick([2, 3]), fr = pick([0.25, 0.5, 0.75]);
    const r1 = fr * a, aa = p(a);
    const K = {
      lin: { prof: 'J\\propto r', H: '\\dfrac{Ir^2}{2\\pi a^3}', rH: '\\dfrac{Ir^3}{2\\pi a^3}', d: '\\dfrac{3Ir^2}{2\\pi a^3}', J: '\\dfrac{3Ir}{2\\pi a^3}', Ie: 'I\\dfrac{r^3}{a^3}', ex: '3*I*r/(2*pi*a^3)',
        J1: 3 * I * fr / (2 * Math.PI * a * a), Ie1: I * fr ** 3, J1s: `\\frac{3(${I}\\ \\text{A})(${fr})}{2\\pi(${aa}\\ \\text{m})^2}`, Ie1s: `(${I}\\ \\text{A})(${fr})^3`, note: '$J$ is zero on the axis and largest at the surface' },
      sq: { prof: 'J\\propto r^2', H: '\\dfrac{Ir^3}{2\\pi a^4}', rH: '\\dfrac{Ir^4}{2\\pi a^4}', d: '\\dfrac{2Ir^3}{\\pi a^4}', J: '\\dfrac{2Ir^2}{\\pi a^4}', Ie: 'I\\dfrac{r^4}{a^4}', ex: '2*I*r^2/(pi*a^4)',
        J1: 2 * I * fr * fr / (Math.PI * a * a), Ie1: I * fr ** 4, J1s: `\\frac{2(${I}\\ \\text{A})(${fr})^2}{\\pi(${aa}\\ \\text{m})^2}`, Ie1s: `(${I}\\ \\text{A})(${fr})^4`, note: '$J$ is zero on the axis and largest at the surface' },
      par: { prof: 'J\\propto1 - r^2/a^2', H: '\\dfrac{Ir}{\\pi a^2}\\left(1 - \\dfrac{r^2}{2a^2}\\right)', rH: '\\dfrac{I}{\\pi a^2}\\left(r^2 - \\dfrac{r^4}{2a^2}\\right)', d: '\\dfrac{I}{\\pi a^2}\\left(2r - \\dfrac{2r^3}{a^2}\\right)', J: '\\dfrac{2I}{\\pi a^2}\\left(1 - \\dfrac{r^2}{a^2}\\right)', Ie: 'I\\dfrac{r^2}{a^2}\\left(2 - \\dfrac{r^2}{a^2}\\right)', ex: '2*I*(1 - r^2/a^2)/(pi*a^2)',
        J1: 2 * I * (1 - fr * fr) / (Math.PI * a * a), Ie1: I * fr * fr * (2 - fr * fr), J1s: `\\frac{2(${I}\\ \\text{A})}{\\pi(${aa}\\ \\text{m})^2}\\left(1 - ${fr}^2\\right)`, Ie1s: `(${I}\\ \\text{A})(${fr})^2\\left(2 - ${fr}^2\\right)`, note: '$J$ is largest on the axis, $2I/\\pi a^2$, twice the average $I/\\pi a^2$, and zero at the surface' },
    }[kind];
    const reg = coax ? '$a < r < b$' : '$r > a$';
    const zeroWhy = ['That is $\\partial H_\\phi/\\partial r$ alone. $rH_\\phi = I/2\\pi$ is constant, so the curl is zero.', 'That is $H_\\phi/r$ alone. The full curl, $\\partial_rH_\\phi + H_\\phi/r$, is zero.'];
    return {
      title: 'Check Ampère with the curl',
      q: md`A long wire of radius $a = ${amm}$ mm on the $z$-axis carries $I = ${I}$ A along $+\hat z$, spread **nonuniformly** over its cross-section${coax ? `; a thin coaxial shell of radius $b = ${bmm}$ mm carries it back` : ''}. Ampère's law gives $\mathbf H = H_\phi(r)\,\hat\phi$ with $H_\phi = ${K.H}$ for $r < a$ and $H_\phi = \dfrac{I}{2\pi r}$ for ${reg}${coax ? ' ($H_\\phi = 0$ for $r > b$)' : ''}. Recover $J_z(r)$ inside from $\nabla\times\mathbf H = \mathbf J$ and evaluate it at $r = ${p(r1 * 1000)}$ mm. Find the current enclosed by the circle $r = ${p(r1 * 1000)}$ mm from Ampère's law, and confirm that $\int\mathbf J\cdot d\mathbf S$ over the disk gives the same. What is $\mathbf J$ for ${reg}?`,
      parts: [
        { lbl: '$J_z(r)$ for $r < a$, in A/m²', expr: K.ex, vars: { I: [0.5, 5], a: [0.5, 2], r: [0.2, 1.5] } },
        N(`J_z(${p(r1 * 1000)}\\ \\text{mm})`, K.J1, 'A/m^2'),
        N(`I_{\\text{enc}}(${p(r1 * 1000)}\\ \\text{mm})`, K.Ie1, 'A'),
        { lbl: `For ${reg}, $\\mathbf J$ is`, mc: ['zero', '$-\\dfrac{I}{2\\pi r^2}\\,\\hat z$', '$+\\dfrac{I}{2\\pi r^2}\\,\\hat z$'], a: 0, fixed: true, why: [null, ...zeroWhy] },
      ],
      hints: ['$J_z = \\dfrac1r\\dfrac{d}{dr}(rH_\\phi)$: multiply by $r$ first, differentiate, then divide by $r$.', 'Ampère on the circle: $I_{\\text{enc}} = 2\\pi rH_\\phi$. The disk integral is $\\int_0^{r}J_z\\,2\\pi r\'\\,dr\'$; the two must agree.'],
      sol: sol({
        eq: md`Point form $\nabla\times\mathbf H = \mathbf J$; for $\mathbf H = H_\phi(r)\hat\phi$ only $J_z = \dfrac1r\dfrac{d}{dr}(rH_\phi)$ survives. Integral form on a circle of radius $r$: $2\pi rH_\phi = I_{\text{enc}}(r)$.`,
        sym: md`Inside: $rH_\phi = ${K.rH}$, $\;\dfrac{d}{dr}(rH_\phi) = ${K.d}$, so $J_z = ${K.J}$ ($${K.prof}$). Ampère: $I_{\text{enc}}(r) = 2\pi rH_\phi = ${K.Ie}$. The disk, with rings of area $2\pi r'\,dr'$: $\displaystyle\int_0^rJ_z(r')\,2\pi r'\,dr' = ${K.Ie}$, the same. ✓ For ${reg}: $rH_\phi = I/2\pi$ is constant, so $\mathbf J = 0$.`,
        sub: md`$$J_z(${p(r1 * 1000)}\ \text{mm}) = ${K.J1s} = ${f(K.J1)}\ \text{A/m}^2, \qquad I_{\text{enc}} = ${K.Ie1s} = ${f(K.Ie1)}\ \text{A}$$`,
        ans: md`$J_z = ${K.J}$; $J_z = ${f(K.J1)}$ A/m² at $${p(r1 * 1000)}$ mm; $I_{\text{enc}} = ${f(K.Ie1)}$ A by both methods; $\mathbf J = 0$ for ${reg}.`,
        check: md`At $r = a$ the enclosed current is all of $I$, and both forms of $H_\phi$ give $I/2\pi a$: continuous. ✓ ${K.note}. ✓`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t5-ampere'] = [
    Q(md`$\oint_C\mathbf H\cdot d\mathbf l = I_{\text{enc}}$ uses the current through **which** surface?`,
      ['any surface whose rim is $C$', 'only the flat surface inside $C$', 'only a hemisphere on $C$', 'the surface where $\\mathbf H$ is uniform'], 0,
      [null, 'For steady currents every surface with the same rim carries the same current, since charge does not pile up.', 'A hemisphere works, and so does any other surface with rim $C$.', 'The surface is chosen for $I_{\\text{enc}}$; $\\mathbf H$ is evaluated on $C$.'],
      md`Lecture 13's "mouth": all the current entering the mouth leaves through any surface around it ($\nabla\cdot\mathbf J = 0$ in statics).`),
    Q(md`Units: $\mathbf H$ is measured in…`,
      ['A/m', 'T', 'A·m', 'Wb/m'], 0,
      [null, 'Tesla is the unit of $\\mathbf B = \\mu_0\\mathbf H$.', 'A·m is a current element, $I\\,d\\mathbf l$.', 'Wb/m is a vector potential unit.'],
      md`$\oint\mathbf H\cdot d\mathbf l$ is in amperes, so $H$ is A/m.`),
    Q(md`Two coaxial thin tubes carry equal and opposite currents: the inner (radius $a$) carries $I$, the outer (radius $b$) carries $-I$. $\mathbf H$ is nonzero…`,
      ['only for $a < r < b$', 'only for $r < a$', 'everywhere except $r > b$', 'only for $r > b$'], 0,
      [null, 'Inside the inner tube nothing is enclosed.', 'Inside the inner tube nothing is enclosed, so $H = 0$ there too.', 'Outside both, $I - I = 0$.'],
      md`Only circles between the tubes enclose net current.`),
    Q(md`A coax carries $I$ on the inner conductor but only $I/2$ back on the outer one (the rest returns elsewhere). Outside the coax, $H_\phi = $`,
      ['$I/4\\pi r$', '$0$', '$I/2\\pi r$', '$3I/4\\pi r$'], 0,
      [null, 'The currents no longer cancel: $I - I/2 = I/2$ is enclosed.', 'Only $I/2$ net is enclosed.', 'The return current subtracts.'],
      md`$I_{\text{enc}} = I - I/2 = I/2$, so $H_\phi = (I/2)/(2\pi r)$.`),
    Q(md`Inside a long solenoid, a rectangle lies **entirely inside** (both long sides inside, at different distances from the axis). Ampère gives…`,
      ['$H$ is the same on both sides: the field is uniform inside', '$H$ is larger near the wall', '$H$ is larger on the axis', 'nothing, since no current is enclosed'], 0,
      [null, 'No current is enclosed, so $H_1L - H_2L = 0$.', 'No current is enclosed, so $H_1L - H_2L = 0$.', '"No enclosed current" is exactly the information: it forces $H_1 = H_2$.'],
      md`$I_{\text{enc}} = 0$, so the two long sides contribute equal and opposite: $H_1 = H_2$. The same argument outside, plus $H\to0$ far away, gives $H = 0$ outside.`),
    Q(md`Inside a uniform thick wire, $H_\phi$ at $r = a/2$ compared with the surface value is…`,
      ['half', 'a quarter', 'the same', 'twice'], 0,
      [null, 'The enclosed current is a quarter, but the path is half as long: $H\\propto r$.', 'Inside a wire $H$ grows with $r$.', 'Inside, $H$ is less than at the surface.'],
      md`$H_\phi = Ir/2\pi a^2\propto r$.`),
    Q(md`A hollow conductor ($a < r < b$) carries $I$ uniformly. Its current density is…`,
      ['$I/\\pi(b^2 - a^2)$', '$I/\\pi b^2$', '$I/2\\pi(b - a)$', '$I/\\pi(b - a)^2$'], 0,
      [null, 'That spreads the current over the hole too.', 'That divides by a length, not an area: A/m, not A/m².', 'The area of an annulus is $\\pi(b^2 - a^2)$, not $\\pi(b - a)^2$.'],
      md`Area of the annulus: $\pi b^2 - \pi a^2$.`),
    Q(md`The analogy between a uniform cylinder of **current** and one of **charge**: $H_\phi = Jr/2$ inside corresponds to…`,
      ['$E_r = \\rho r/2\\epsilon_0$', '$E_r = \\rho/2\\pi\\epsilon_0r$', '$E_r = \\rho r^2/\\epsilon_0$', '$E_r = 0$'], 0,
      [null, 'That has the shape of the field outside a line charge.', 'Wrong power of $r$: Gauss and Ampère both give $\\propto r$ inside.', 'Inside a uniform charge cylinder the field grows with $r$.'],
      md`Gauss on a cylinder and Ampère on a circle have the same geometry: enclosed source $\propto r^2$, surface or path $\propto r$.`),
    Q(md`A toroid's field outside the windings is zero **exactly**, while a real solenoid's is only approximately zero. Why?`,
      ['A toroid has no ends; a finite solenoid leaks field at its ends', 'A toroid has more turns', 'The toroid\'s current is larger', 'Ampère\'s law only holds for toroids'], 0,
      [null, 'The number of turns does not matter: $NI$ up and $NI$ down cancel outside.', 'The current size does not matter.', 'The law holds for both; only the symmetry differs.'],
      md`The ideal "long solenoid" is an approximation; a toroid is a solenoid bent into a ring, with no ends to fringe.`),
    Q(md`$N = 500$ turns, $I = 2$ A on a toroid. At $r = 10$ cm in the core, $H \approx$`,
      ['1590 A/m', '10 000 A/m', '159 A/m', '1000 A/m'], 0,
      [null, 'That divides $NI$ by $r$ instead of $2\\pi r$.', 'That uses $r = 1$ m; 10 cm is 0.1 m.', 'That is $NI$ itself, the MMF in A, not $H$ in A/m.'],
      md`$H = NI/2\pi r = 1000/(0.628) = 1592$ A/m.`),
    Q(md`Doubling the number of turns of a toroid at fixed current…`,
      ['doubles $H$ everywhere in the core', 'doubles $H$ only at the inner wall', 'leaves $H$ unchanged', 'quadruples $H$'], 0,
      [null, 'The $1/r$ shape stays; the whole profile scales by $N$.', '$H = NI/2\\pi r$ is linear in $N$.', 'Only one factor of $N$.'],
      md`The MMF $NI$ doubles, and $H$ with it.`),
    Q(md`Two wires inside a closed path carry equal and opposite currents. On the path, $\mathbf H$ is…`,
      ['generally not zero, though $\\oint\\mathbf H\\cdot d\\mathbf l = 0$', 'zero everywhere', 'uniform', 'along $d\\mathbf l$ everywhere'], 0,
      [null, 'A pair of opposite wires has a field; only its circulation vanishes.', 'Nothing makes it uniform.', 'Its direction varies around the path.'],
      md`Zero enclosed current means zero circulation, not zero field. Ampère gives $H = 0$ only when symmetry also says $H$ is constant along $C$.`),
    Q(md`Static Ampère's law $\oint\mathbf H\cdot d\mathbf l = I_{\text{enc}}$ fails around a wire charging a capacitor, for a surface that passes between the plates. What fixes it?`,
      ['the displacement current $\\frac{d}{dt}\\int\\mathbf D\\cdot d\\mathbf S$', 'choosing a circular path', 'using $\\mathbf B$ instead of $\\mathbf H$', 'nothing: the field is zero there'], 0,
      [null, 'The path is fine; the surface between the plates carries no conduction current.', '$\\mathbf B = \\mu_0\\mathbf H$ gives the same law.', 'The wire\'s field is there; it does not depend on the surface you pick.'],
      md`Lecture 13: the changing $\mathbf E$ between the plates carries the "missing" current (Topic 12).`),
    Q(md`A long solenoid has $B = 2.5$ mT inside with $n = 2000$ turns/m. Its current is about…`,
      ['1.0 A', '2000 A', '0.1 A', '10 A'], 0,
      [null, 'That forgets the turns per meter: $B/\\mu_0\\approx2000$ A; divide by $n$ too.', 'Ten times too small.', 'Ten times too large.'],
      md`$I = B/(\mu_0n) = (2.5\times10^{-3})/(1.257\times10^{-6}\times2000) = 0.99$ A.`),
    Q(md`For which current distribution does Ampère's law **not** give $\mathbf H$ by itself?`,
      ['a square loop', 'an infinite wire', 'an infinite solenoid', 'an infinite sheet'], 0,
      [null, 'A circle around it has constant $H_\\phi$.', 'A rectangle half inside gives $H = nI$.', 'A rectangle straddling it gives $J_s/2$.'],
      md`A square loop has no path with constant, known-direction $\mathbf H$; use Biot–Savart.`),
    Q(md`A long thick wire carries a **non-uniform** current density $J = kr$ (A/m²). $H_\phi$ inside is…`,
      ['$kr^2/3$', '$kr/2$', '$kr^3/3$', '$kr^2/2$'], 0,
      [null, 'That is the uniform-$J$ result with $J = k$; here $J$ grows with $r$.', 'That is $I_{\\text{enc}}/2\\pi$: divide by the path length $2\\pi r$.', 'That treats $J = kr$ as uniform out to $r$, $(kr)r/2$; the inner layers carry less.'],
      md`$I_{\text{enc}} = \int_0^r kr'\,2\pi r'\,dr' = \frac{2\pi k r^3}{3}$; $H_\phi = I_{\text{enc}}/2\pi r = kr^2/3$.`),
    // the curl check (Step 7)
    Q(md`Inside a long wire, $H_\phi = H_0r/a$. The current density is…`,
      [md`$\dfrac{2H_0}{a}\,\hat z$, uniform`, md`$\dfrac{H_0}{a}\,\hat z$, uniform`, md`$\dfrac{H_0r}{a}\,\hat z$`, md`$\dfrac{2H_0}{a}\,\hat\phi$`], 0,
      [null, md`That is only one of the two equal terms, $dH_\phi/dr$ or $H_\phi/r$; the curl is their sum.`, md`That is $H_\phi$ itself pointed along $\hat z$; the curl is a derivative, in A/m².`, md`The current that makes a $\hat\phi$ field runs along $\hat z$.`],
      md`$\frac1r\frac{d}{dr}\big(H_0r^2/a\big) = 2H_0/a$. Check: $J\pi a^2 = 2\pi aH_0 = 2\pi a\,H_\phi(a)$, Ampère at the surface. ✓`),
    Q(md`$H_\phi$ is a constant, $H_0$, throughout a region $a < r < b$. That region carries…`,
      [md`$J_z = H_0/r$: current that thins out with $r$`, md`no current, since $H_\phi$ is constant`, md`$J_z = H_0$, uniform`, md`$J_z = -H_0/r$`], 0,
      [null, md`$rH_\phi = H_0r$ grows, so the enclosed current $2\pi rH_0$ grows with $r$.`, md`The curl has units of A/m²: $\frac1r\frac{d}{dr}(H_0r) = H_0/r$.`, md`$I_{\text{enc}} = 2\pi rH_0$ grows outward, so $J_z > 0$.`],
      md`$\frac1r\frac{d}{dr}(rH_0) = H_0/r$. Every ring of width $dr$ carries the same current, $J_z\,2\pi r\,dr = 2\pi H_0\,dr$.`),
    Q(md`Integrate the curl's $J_z = \frac1r\frac{d}{dr}(rH_\phi)$ over a disk of radius $R$ centered on the axis (no line current on the axis): $\int_0^RJ_z\,2\pi r\,dr = $`,
      [md`$2\pi RH_\phi(R)$, Ampère's law`, md`$H_\phi(R)$`, md`$\pi R^2H_\phi(R)$`, md`$2\pi H_\phi(R)$`], 0,
      [null, md`The ring area $2\pi r\,dr$ cancels the $1/r$ and leaves $2\pi\,d(rH_\phi)$; integrating gives $2\pi RH_\phi(R)$.`, md`The $1/r$ cancels one power of $r$: what remains is $2\pi R$, a length, not an area.`, md`The integral of $d(rH_\phi)$ is $RH_\phi(R)$, not $H_\phi(R)$.`],
      md`$\int_0^R\frac1r\frac{d(rH_\phi)}{dr}\,2\pi r\,dr = 2\pi\big[rH_\phi\big]_0^R = 2\pi RH_\phi(R) = I_{\text{enc}}$. The point form and the integral form are one law (Stokes' theorem).`),
    Q(md`A long wire carries $I$ with $J\propto(1 - r^2/a^2)$. Compared with a uniform wire of the same $I$ and $a$, its $H_\phi$ at the surface $r = a$ is…`,
      ['the same, $I/2\\pi a$', 'larger', 'smaller', 'zero, since $J = 0$ at the surface'], 0,
      [null, md`At $r = a$ only $I_{\text{enc}} = I$ matters, not how it is spread.`, md`Same $I_{\text{enc}} = I$ at $r = a$, so the same $H_\phi$.`, md`$H_\phi(a)$ is set by all the current inside, $I$, not by $J$ at the surface.`],
      md`$2\pi aH_\phi(a) = I$ for any distribution. The profiles differ only inside, where this one is larger (more current near the axis).`),
    Q(md`For the wire with $J\propto(1 - r^2/a^2)$ carrying $I$, $J$ on the axis is…`,
      [md`$\dfrac{2I}{\pi a^2}$, twice the average`, md`$\dfrac{I}{\pi a^2}$, the average`, '$0$', md`$\dfrac{I}{2\pi a^2}$`], 0,
      [null, md`The average is $I/\pi a^2$; this profile piles current near the axis.`, md`$1 - r^2/a^2 = 1$ on the axis: that is the maximum.`, md`$\int_0^aJ_0(1 - r^2/a^2)\,2\pi r\,dr = \pi a^2J_0/2$, so $J_0 = 2I/\pi a^2$, four times this.`],
      md`$I = \int_0^aJ_0\big(1 - \tfrac{r^2}{a^2}\big)2\pi r\,dr = \tfrac{\pi a^2}{2}J_0$, so $J_0 = 2I/\pi a^2$. The curl of its $H_\phi = \dfrac{Ir}{\pi a^2}\Big(1 - \dfrac{r^2}{2a^2}\Big)$ gives the same.`),
  ];
})();

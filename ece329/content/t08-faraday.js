/* Topic 8 — Faraday's law and Lenz's law (Lecture 14). Stationary loops in a changing B: flux, the sign convention
   that ties C to dS, emf, current and its direction, N turns, and the circulating E of ∇×E = −∂B/∂t.
   Moving and rotating loops are Topic 9; voltmeters in induced fields are Topic 10.
   This file is the template for every topic: notation, the idea, a build-up with a prediction at each step, the method,
   a worked exam problem, mistakes, check questions, rapid fire, problems with new numbers, and extra bank questions. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick, ri } = U;

  // ---------------------------------------------------------------- figures
  // a horizontal loop in a vertical B, seen from above and in front: C counterclockwise from above, dS up
  function loopFig() {
    const g = PF.fig({ alt: 'a circular loop lying flat, B pointing up through it, the circulation C counterclockwise seen from above and dS pointing up' });
    const cx = 150, cy = 110, rx = 92, ry = 26;
    for (const x of [52, 86, 120, 180, 214, 248]) g.arrow(x, 170, x, 38, { cls: 'dim thin', hs: 6 });
    g.label(262, 44, '\\mathbf B', 'l');
    g.ellipse(cx, cy, rx, ry, { half: 'back', cls: 'thick' });
    g.ellipse(cx, cy, rx, ry, { half: 'front', cls: 'thick' });
    g.head(cx + 4, cy + ry, 1, 0, { hs: 9 });                       // front of the loop moves right: ccw from above
    g.label(cx + rx * 0.8, cy + ry + 6, 'C', 'tl');
    g.arrow(cx, cy, cx, cy - 64, { cls: 'thick', hs: 8 });
    g.label(cx + 6, cy - 60, 'd\\mathbf S', 'l');
    return g.svg();
  }

  // top view, B out of the page: the induced current that opposes an increase (cw) and a decrease (ccw)
  function lenzFig(dir) {
    const g = PF.fig({ alt: dir === 'cw' ? 'B out of the page and increasing: the induced current flows clockwise' : 'B out of the page and decreasing: the induced current flows counterclockwise' });
    g.marks('dot', 34, 30, 146, 114, 5, 4, { r: 2.2 });
    g.loopRect(20, 18, 140, 108, { dir });
    g.label(90, 140, dir === 'cw' ? '\\mathbf B\\ \\text{out, growing}' : '\\mathbf B\\ \\text{out, shrinking}', 't', 'small');
    return g.svg();
  }

  // inside a long solenoid B_z grows; E circulates inside and outside (E_phi < 0: clockwise seen from +z)
  function curlFig() {
    const g = PF.fig({ alt: 'a circular region of growing B out of the page; the induced E circles clockwise both inside and outside the region' });
    const cx = 130, cy = 110;
    g.circle(cx, cy, 52, { cls: 'shade' });
    g.circle(cx, cy, 52, { cls: 'dim' });
    g.marks('dot', cx - 30, cy - 30, cx + 30, cy + 30, 4, 4, { r: 2.2 });
    g.loopCirc(cx, cy, 28, { dir: 'cw', cls: '' });
    g.loopCirc(cx, cy, 86, { dir: 'cw', cls: 'dash' });
    g.label(cx + 64, cy - 64, '\\mathbf E', 'bl');
    g.dim(cx, cy, cx + 52, cy, 'a');
    return g.svg();
  }

  // ---------------------------------------------------------------- the lesson
  const L = EM.lesson('u3', {
    id: 't8-faraday', topic: 8, ref: 'Lecture 14', title: "Faraday's law and Lenz's law",
    steps: [
      R(md`
        !!key Why you care
          Every past Exam 2 has a Faraday problem, usually two: a loop in a changing field (Spring 2018 1(ii), Summer 2017 #3, Summer 2018 #3, Summer 2019 #3), a falling magnet (Spring 2018 1(iii)), a coil's emf and its direction (Spring 2018 #2(c)). The points are in the **sign**: which way the current flows.

        ### Notation

        - $\mathbf B$: magnetic flux density, in tesla, $\text{T} = \text{Wb/m}^2$. Here it may change in time, $\mathbf B(t)$.
        - $C$: a **closed path with a direction** (the circulation). $\oint_C$ means "integrate once around $C$". $d\mathbf l$ is a short step along $C$, pointing along it.
        - $S$: any surface whose edge is $C$. $d\mathbf S = \hat n\,dS$ is a small patch of $S$ written as a vector: length = its area, direction = its normal $\hat n$.
        - **Right-hand rule (RHR):** curl the fingers of your right hand along $C$; the thumb gives $d\mathbf S$. You may pick either direction for $C$, but then $d\mathbf S$ is no longer yours to choose.
        - $\Psi = \int_S\mathbf B\cdot d\mathbf S$: the **magnetic flux** through $S$, in webers, $\text{Wb} = \text{T·m}^2 = \text{V·s}$. Only the part of $\mathbf B$ along $d\mathbf S$ counts.
        - $\emf = \oint_C\mathbf E\cdot d\mathbf l$: the **emf** around $C$, in volts: the work $\mathbf E$ does on a unit charge carried once around $C$.
        - $N$: number of turns. $R$: resistance of the loop. $I = \emf/R$, positive when current flows along $C$.

        ### The idea

        A loop does not respond to $\mathbf B$. It responds to a **change in the flux** through it. When $\Psi$ changes, an electric field appears that circulates around the loop and pushes charge along it:
        $$\emf = \oint_C\mathbf E\cdot d\mathbf l = -\frac{d\Psi}{dt} = -\frac{d}{dt}\int_S\mathbf B\cdot d\mathbf S$$
        This $\mathbf E$ is not electrostatic: its loop integral is not zero, so it is not $-\nabla V$ of anything. (What that does to voltmeters is Topic 10.)
      `),
      RF(md`
        ### Step 1: flux

        [[fig:loop]]

        For a uniform $\mathbf B$ through a flat loop of area $A$ whose normal $\hat n$ makes angle $\theta$ with $\mathbf B$:
        $$\Psi = \mathbf B\cdot\hat n\,A = BA\cos\theta$$
        Face-on ($\theta = 0$): $\Psi = BA$. Edge-on ($\theta = 90°$): $\Psi = 0$. Field against $d\mathbf S$: $\Psi < 0$. For a nonuniform $\mathbf B$, integrate: $\Psi = \int_S B_n\,dS$.
      `, { loop: { svg: loopFig(), cap: 'C counterclockwise seen from above, so the RHR puts dS up, along B: here Ψ > 0.' } }),
      Q(md`**Predict.** $\mathbf B = 0.4\,\hat z$ T is uniform. A $0.5\,\text{m}\times0.5\,\text{m}$ loop lies in the $xy$-plane, and you choose $d\mathbf S = -\hat z\,dx\,dy$. What is $\Psi$?`,
        ['$-0.1$ Wb', '$+0.1$ Wb', '$-0.2$ Wb', '$0$'], 0,
        [null, 'That is the flux for $d\\mathbf S = +\\hat z$. Here $\\mathbf B$ points against $d\\mathbf S$.', 'That multiplies $B$ by one side (0.5 m), not by the area (0.25 m²).', 'The loop faces the field; the flux is zero only edge-on.'],
        md`$\Psi = \mathbf B\cdot\hat n A = (0.4\,\text{T})(-1)(0.25\,\text{m}^2) = -0.1$ Wb. The sign is part of the answer: it says $\mathbf B$ crosses $S$ against the chosen $d\mathbf S$.`),
      R(md`
        ### Step 2: what makes Ψ change

        $\Psi = BA\cos\theta$ changes if **$B$ changes** (this topic), if **$A$ changes** or the loop **moves** through a nonuniform field, or if it **turns** ($\theta$ changes). Faraday's law covers all of them; Topic 9 does the moving and turning cases.

        No change in $\Psi$, no emf, however strong $\mathbf B$ is.
      `),
      Q(md`**Predict.** A loop sits at rest in a strong, constant, uniform $\mathbf B$ (face-on). Then it is slid sideways, still inside the uniform region. The emf during the slide is…`,
        ['zero: $\\Psi$ never changes', 'proportional to $B$', 'proportional to the speed', 'nonzero only while it accelerates'], 0,
        [null, 'A large $B$ gives a large $\\Psi$, not a changing one.', 'Speed matters only if the flux changes as it moves (nonuniform $\\mathbf B$, or crossing the field edge).', 'Acceleration plays no role; only $d\\Psi/dt$ does.'],
        md`Uniform field, same area, same angle: $\Psi = BA$ throughout, so $\emf = -d\Psi/dt = 0$.`),
      RF(md`
        ### Step 3: the sign, and Lenz's law

        $\emf > 0$ means $\mathbf E$ pushes charge **along** $C$. The minus sign says: if $\Psi$ grows along $d\mathbf S$, the push is **against** $C$. Then the current, by the RHR, makes its own flux pointing against $d\mathbf S$: it **opposes the change**. That is Lenz's law:

        !!key Lenz's law
          The induced current makes a field that fights the **change** in flux (not the flux itself). The loop tries to keep its flux constant.

        [[fig:lenz]]

        Use Lenz to get the direction fast, and the formula with $C$ and $d\mathbf S$ to get the number with a sign. They must agree.
      `, { lenz: { svg: PF.row([{ svg: lenzFig('cw'), cap: 'Ψ out of the page growing: the current makes B into the page inside, so it flows clockwise.' }, { svg: lenzFig('ccw'), cap: 'Ψ out of the page shrinking: the current tops it up, counterclockwise.' }]).svg } }),
      Q(md`**Predict.** A bar magnet falls **north end first** toward a horizontal copper ring from above. While it approaches, the ring's current seen from above is…`,
        ['counterclockwise', 'clockwise', 'zero until the magnet is inside the ring', 'counterclockwise, then clockwise as it approaches'], 0,
        [null, 'Clockwise from above makes $\\mathbf B$ point down inside the ring: that would add to the growing downward flux.', 'The flux through the ring grows the whole time the magnet approaches, so there is current the whole time.', 'The flux grows monotonically during the approach; the current reverses only after the magnet passes through.'],
        md`Field lines leave the north pole, so below the magnet $\mathbf B$ points **down** through the ring, and that downward flux grows as the magnet nears. The ring opposes the growth with **upward** $\mathbf B$ inside it: counterclockwise from above (RHR, thumb up). After the magnet passes, the downward flux shrinks and the current reverses.`),
      R(md`
        ### Step 4: N turns, and an open loop

        A coil of $N$ turns links the flux of every turn: the turns are emfs in series.
        $$\emf = -N\frac{d\Psi}{dt}$$
        $\Psi$ is still the flux through **one** turn. $N\Psi$ is called the **flux linkage**.

        A loop with a gap still has the emf; it appears as a voltage across the gap. No current flows, so Lenz's "opposing field" never appears. A cut ring dropped through a magnet feels no force.
      `),
      RF(md`
        ### Step 5: the local form, ∇×E = −∂B/∂t

        Shrink $C$ to a point (Stokes' theorem) and Faraday's law becomes $\nabla\times\mathbf E = -\partial\mathbf B/\partial t$: wherever $\mathbf B$ changes, $\mathbf E$ curls around it.

        [[fig:curl]]

        In a long region of radius $a$ with uniform $B_z(t)$ (inside a solenoid), symmetry makes $\mathbf E = E_\phi(r)\hat\phi$. Faraday on a circle of radius $r$ (counterclockwise from $+z$, $d\mathbf S = +\hat z$):
        $$E_\phi\,2\pi r = -\frac{d}{dt}\left(B_z\,\pi\min(r,a)^2\right) \quad\Rightarrow\quad E_\phi = -\frac{r}{2}\frac{dB_z}{dt}\ (r < a), \qquad E_\phi = -\frac{a^2}{2r}\frac{dB_z}{dt}\ (r > a)$$
        **Outside, $\mathbf B = 0$ but $\mathbf E \ne 0$.** A loop around a solenoid gets an emf even though no field touches the wire (Summer 2019 #3).
      `, { curl: { svg: curlFig(), cap: 'B out of the page grows inside radius a. E circles clockwise, inside (solid) and outside (dashed), where B = 0.' } }),
      Q(md`**Predict.** A wire loop encircles a long solenoid far outside it, where $\mathbf B = 0$. The solenoid current ramps up. The loop's emf is…`,
        ['$-d\\Psi/dt$ with $\\Psi$ = the flux inside the solenoid', 'zero: $\\mathbf B = 0$ on the wire', 'zero: the loop is far from the windings', 'proportional to the loop\'s own area'], 0,
        [null, 'The emf depends on the flux through the surface, not on $\\mathbf B$ at the wire. Inside the solenoid the flux grows.', 'Distance does not matter: any loop that encloses the solenoid links all its flux.', 'Only the part of the area where $\\mathbf B \\ne 0$ contributes: the solenoid\'s cross-section.'],
        md`$\Psi = \int_S\mathbf B\cdot d\mathbf S$ over the loop's surface picks up $\mu_0nI\,\pi a^2$ from the solenoid's interior and nothing elsewhere. Its change drives a circulating $\mathbf E$ out to any radius.`),
      R(md`
        ### The method

        !!method Faraday's law in five steps
          1. **Pick $C$'s direction** (any). The RHR fixes $d\mathbf S$. Draw both.
          2. **Flux:** $\Psi(t) = \int_S\mathbf B\cdot d\mathbf S$; for uniform $\mathbf B$, $\Psi = (\mathbf B\cdot\hat n)A$.
          3. **Emf:** $\emf = -N\,d\Psi/dt$, measured along $C$.
          4. **Current:** $I = \emf/R$. Positive: along $C$. Negative: against it.
          5. **Check the direction with Lenz.**

        ### Worked example

        !!graded Problem
          A uniform field $\mathbf B = B_0e^{-t/\tau}\hat z$ with $B_0 = 0.5$ T and $\tau = 2$ ms threads a coil of $N = 50$ turns of radius $r = 4$ cm in the $z = 0$ plane. The coil's resistance is $10\ \Omega$. Find $\emf(t)$ counterclockwise seen from above, the current at $t = 0$, and its direction.

        **1. Path and surface.** $C$ counterclockwise from above, so $d\mathbf S = +\hat z\,dS$.

        **2. Flux.** $\Psi(t) = \mathbf B\cdot\hat z\,\pi r^2 = B_0\pi r^2e^{-t/\tau}$.

        **3. Emf.**
        $$\emf(t) = -N\frac{d\Psi}{dt} = \frac{N\pi r^2B_0}{\tau}e^{-t/\tau}$$
        $$\emf(0) = \frac{(50)\,\pi\,(0.04\,\text{m})^2\,(0.5\,\text{T})}{2\times10^{-3}\,\text{s}} = 62.8\ \text{V}$$

        **4. Current.** $I(0) = \emf/R = 62.8\,\text{V}/10\,\Omega = 6.28$ A, positive: **counterclockwise** from above, along $C$.

        **5. Lenz.** The upward flux is dying; the current replaces it with upward $\mathbf B$, which is counterclockwise from above. ✓

        !!mistake Common mistakes
          - Choosing $d\mathbf S$ without looking at $C$. They are tied by the RHR; reverse one and you must reverse the other.
          - Dropping the minus sign, or applying it twice: once in $-d\Psi/dt$ and again "because of Lenz". Lenz is a **check**, not a second sign.
          - Using $B$ instead of its **change**: constant flux gives zero emf, however big.
          - Forgetting $N$, or multiplying $\Psi$ by $N$ and then $\emf$ by $N$ again.
          - Area in cm²: $1\,\text{cm}^2 = 10^{-4}\,\text{m}^2$. 10 cm × 10 cm $= 0.01\,\text{m}^2$.
          - Counting the full $B$ for a tilted loop: only $B\cos\theta$ crosses it.

        ### Check questions
      `),
      Q(md`$\partial\mathbf B/\partial t = 10\,\hat z$ T/s is uniform. A 10 cm × 10 cm loop in the $xy$-plane has a resistance of $10\ \Omega$. The magnitude of the induced current is…`,
        ['10 mA', '1 mA', '100 mA', '1 A'], 0,
        [null, 'That divides by an extra 10: the emf is 0.1 V, and 0.1 V / 10 Ω = 10 mA.', 'That uses $A = 0.1\\,\\text{m}^2$; 10 cm × 10 cm is $0.01\\,\\text{m}^2$.', 'That uses $A$ in a wrong unit (100 cm² treated as 1 m²).'],
        md`$|\emf| = A\,|dB/dt| = (0.01\,\text{m}^2)(10\,\text{T/s}) = 0.1$ V; $I = 0.1/10 = 10$ mA. (Spring 2018, 1(ii).)`, { src: 'Spring 2018 Exam 2' }),
      Q(md`A circular loop in the $xy$-plane sits in a uniform $\mathbf B = B_0\hat z$, $B_0 > 0$. Its radius starts to shrink. The induced current flows along…`,
        ['$+\\hat\\phi$ (counterclockwise from above)', '$-\\hat\\phi$', '$\\hat z$', 'no direction: $\\mathbf B$ is constant'], 0,
        [null, 'That would make downward $\\mathbf B$ inside, speeding up the loss of upward flux.', 'Current flows along the wire, which is in the $xy$-plane.', 'The field is constant but the area shrinks, so $\\Psi$ changes.'],
        md`Upward flux shrinks; the current tops it up with upward $\mathbf B$ inside: counterclockwise from above, $+\hat\phi$. (Lecture 14 challenge question.)`),
      Q(md`You reverse your choice of $C$ (and so of $d\mathbf S$) and redo a Faraday problem. What changes?`,
        ['The signs of $\\Psi$, $\\emf$ and $I$; the physical current is the same', 'Nothing at all', 'The magnitude of $\\emf$', 'The physical direction of the current'], 0,
        [null, 'Each signed quantity is measured relative to $C$ or $d\\mathbf S$, so each one flips sign.', 'Flux through a surface does not depend on how you orient the path around it, only its sign does.', 'Physics cannot depend on a bookkeeping choice: a negative current against the new $C$ is the old current.'],
        md`$C$ and $d\mathbf S$ are bookkeeping. Flip both and every signed number flips; "negative along the new $C$" is the same current as "positive along the old $C$".`),
      Q(md`A coil of $N$ turns and area $A$ gives emf $\emf$ in a changing field. You rewind it with $2N$ turns of half the area, same orientation, same field. The emf is…`,
        ['$\\emf$', '$2\\emf$', '$\\emf/2$', '$4\\emf$'], 0,
        [null, 'That counts the doubled turns but not the halved area per turn.', 'That counts the halved area but not the doubled turns.', 'Neither change is squared, and they pull in opposite directions.'],
        md`$\emf = -NA\,dB/dt$: $(2N)(A/2) = NA$.`),
      Q(md`A loop's plane is parallel to a uniform $\mathbf B(t) = B_0\sin(\omega t)\hat x$. The loop lies in the $xz$-plane. Its emf is…`,
        ['zero', '$B_0A\\omega\\cos(\\omega t)$', '$-B_0A\\omega\\cos(\\omega t)$', '$B_0A\\omega$'], 0,
        [null, 'That is the emf of a loop facing the field. The normal of the $xz$-plane is $\\hat y$, and $\\mathbf B$ has no $y$-component.', 'That is Faraday\'s law with the full flux $B_0A$, but the normal of the $xz$-plane is $\\hat y$: the loop links no flux.', 'That is a peak emf of a face-on loop. This loop is edge-on: $\\Psi = 0$ at all times.'],
        md`$\Psi = \mathbf B\cdot\hat yA = 0$ at all times, so $\emf = 0$. Edge-on loops link no flux.`),
      Q(md`The induced $\mathbf E$ of a changing $\mathbf B$ satisfies $\oint_C\mathbf E\cdot d\mathbf l \ne 0$. Which follows?`,
        ['There is no potential $V$ with $\\mathbf E = -\\nabla V$ for that field', 'Kirchhoff\'s voltage law still holds for every loop', 'The field must be zero inside a conductor', 'The emf is the same for any two paths between two points'], 0,
        [null, 'KVL is the statement $\\oint\\mathbf E\\cdot d\\mathbf l = 0$; it fails around a loop with changing flux (Topic 10).', 'Induced $\\mathbf E$ drives current inside the wire; in a resistive wire it is not zero.', 'Different paths enclose different flux, so their $\\int\\mathbf E\\cdot d\\mathbf l$ differ.'],
        md`A gradient field has zero curl and zero loop integral. The induced field has neither, so "the voltage between two points" depends on the path.`),
      Q(md`A **cut** ring (a small gap) falls past a strong magnet. Compared with a whole ring, the cut ring…`,
        ['has an emf across its gap but no current, so no magnetic braking', 'has no emf at all', 'has the same current, flowing through the gap', 'is braked more strongly'], 0,
        [null, 'The emf comes from the changing flux, which the gap does not remove.', 'The gap is an open circuit: no current crosses it.', 'Braking comes from the induced current; with no current there is no force.'],
        md`Faraday gives the emf whether or not current can flow. Current needs a closed conducting path; Lenz's opposing force needs current.`),
      R(md`
        ### Rapid fire: direction

        **The trick:** ask what the flux is doing (up, down, growing, shrinking), oppose the change, then turn "induced $\mathbf B$ inside" into a circulation with the RHR.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_fa_dir', { need: 8 }), { id: 't8-faraday.r0' }),
      R(md`
        ### Rapid fire: size and sign

        **The trick:** $|\emf| = N\,|d\Psi/dt|$; convert cm² to m² first ($\times10^{-4}$); the sign of $\Psi$ is the sign of $\mathbf B\cdot d\mathbf S$.
      `),
      Object.assign(G('rf_fa_num', { need: 8 }), { id: 't8-faraday.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('fa_decay', { need: 2 }),
      G('fa_sin', { need: 2 }),
      G('fa_ramp', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const AX = ['x', 'y', 'z'];
  const VIEW = (k) => `seen from $+${k}$`;
  GENS.rf_fa_dir = () => one([
    // B along the loop's normal, growing or shrinking
    () => {
      const k = pick(AX), sB = pick([1, -1]), grow = pick([true, false]);
      const s = sB * (grow ? 1 : -1);                        // sign of dB_k/dt
      const ans = s > 0 ? 'clockwise' : 'counterclockwise';
      const other = s > 0 ? 'counterclockwise' : 'clockwise';
      const plane = { x: 'yz', y: 'xz', z: 'xy' }[k];
      return MC('Which way?', md`A loop lies in the $${plane}$-plane. $\mathbf B = ${sB > 0 ? '' : '-'}B(t)\hat ${k}$ with $B > 0$ **${grow ? 'growing' : 'shrinking'}**. The induced current, ${VIEW(k)}, is…`, ans,
        [[other, md`That ${grow ? 'adds to' : 'removes even more of'} the ${sB > 0 ? '$+' : '$-'}${k}$ flux. The current must oppose the change.`], ['zero', 'The flux through the loop is changing, so there is an emf and a current.'], ['along $\\hat ' + k + '$', 'Current flows in the wire, which lies in the plane of the loop.']],
        md`The flux along $${sB > 0 ? '+' : '-'}${k}$ is ${grow ? 'growing' : 'shrinking'}, so $\Psi_{${k}}$ is ${s > 0 ? 'increasing' : 'decreasing'}. The induced $\mathbf B$ inside points ${s > 0 ? `along $-${k}$` : `along $+${k}$`}; with the thumb that way, the fingers curl ${ans} ${VIEW(k)}.`);
    },
    // area shrinking or growing in a constant field
    () => {
      const sB = pick([1, -1]), grow = pick([true, false]);
      const s = sB * (grow ? 1 : -1);
      const ans = s > 0 ? 'clockwise' : 'counterclockwise';
      return MC('Changing area', md`A flexible loop in the $xy$-plane sits in a constant $\mathbf B = ${sB > 0 ? '+' : '-'}B_0\hat z$. Its area **${grow ? 'grows' : 'shrinks'}**. The current seen from $+z$ is…`, ans,
        [[s > 0 ? 'counterclockwise' : 'clockwise', 'That reinforces the change instead of opposing it.'], ['zero, since $\\mathbf B$ is constant', 'The area changes, so $\\Psi = BA$ changes.'], ['zero, since the loop does not move', 'Changing the area is enough to change $\\Psi$.']],
        md`$\Psi_z = ${sB > 0 ? '+' : '-'}B_0A$ is ${s > 0 ? 'increasing' : 'decreasing'}; the induced field points ${s > 0 ? '$-z$' : '$+z$'} inside: ${ans} from $+z$.`);
    },
    // magnet approaching or leaving along the axis
    () => {
      const pole = pick(['north', 'south']), from = pick(['above', 'below']), come = pick([true, false]);
      // the magnet's field at the ring points away from a north pole, toward a south pole
      const towardRing = (pole === 'north');                 // B at ring points from magnet toward ring (N) or ring toward magnet (S)
      const bUp = (from === 'below') === towardRing;         // B through ring points up?
      const s = (bUp ? 1 : -1) * (come ? 1 : -1);            // sign of dΨ_up/dt
      const ans = s > 0 ? 'clockwise' : 'counterclockwise';
      return MC('Moving magnet', md`A magnet ${come ? 'approaches' : 'moves away from'} a horizontal ring from **${from}**, with its **${pole}** pole facing the ring. The ring current, seen from above, is…`, ans,
        [[s > 0 ? 'counterclockwise' : 'clockwise', 'That adds to the change in flux instead of opposing it.'], ['zero until the magnet passes through', 'The flux through the ring changes as soon as the magnet moves.'], ['it depends on the speed', 'Speed sets the size of the current, not its direction.']],
        md`Field lines leave a north pole and enter a south pole, so at the ring $\mathbf B$ points **${bUp ? 'up' : 'down'}**. ${come ? 'Approaching' : 'Leaving'}, that flux ${come ? 'grows' : 'shrinks'}. The ring makes $\mathbf B$ pointing ${s > 0 ? 'down' : 'up'} inside: ${ans} from above.`);
    },
    // loop turning from face-on toward edge-on
    () => {
      const toEdge = pick([true, false]);
      return MC('Turning loop', md`A loop is turning in a uniform $\mathbf B = B_0\hat z$ (constant). Its normal $\hat n$ (tilted, with a positive $z$-part) is swinging **${toEdge ? 'away from $\\hat z$: face-on toward edge-on' : 'toward $\\hat z$: edge-on toward face-on'}**. The current, seen from the tip of $\hat n$, is…`, toEdge ? 'counterclockwise' : 'clockwise',
        [[toEdge ? 'clockwise' : 'counterclockwise', 'That speeds up the change in flux.'], ['zero, since $\\mathbf B$ is constant', '$\\Psi = BA\\cos\\theta$ changes as $\\theta$ changes.'], ['zero at every instant', 'Only at the instant the rate $d\\Psi/dt$ passes through zero.']],
        md`$\Psi = B_0A\cos\theta$ ${toEdge ? 'falls' : 'rises'}; the current ${toEdge ? 'tops it up (induced B along the normal): counterclockwise' : 'opposes the rise (induced B against the normal): clockwise'} seen from that side.`);
    },
  ]);

  GENS.rf_fa_num = () => one([
    // |emf| = N A dB/dt, with an area in cm²
    () => {
      const Ncm = pick([10, 20, 25, 40, 50, 100, 200]), rate = pick([5, 10, 20, 50, 100]), n = pick([1, 1, 10, 100]);
      const e = n * Ncm * 1e-4 * rate;
      const opt = (x) => `$${EM.p(+x.toPrecision(3))}$ V`;
      return MC('Emf from a ramp', md`A ${n === 1 ? 'loop' : `${n}-turn coil`} of area $${Ncm}\,\text{cm}^2$ faces a uniform field changing at $${rate}$ T/s. $|\emf| = $`, opt(e),
        [[opt(e * 100), 'That converts with $10^{-2}$; $1\\,\\text{cm}^2 = 10^{-4}\\,\\text{m}^2$.'], [opt(e * 1e4), 'cm² were not converted to m².'], [opt(e / 10), 'Off by ten: recheck the powers of ten.'], [opt(n === 1 ? e * 10 : e / n), n === 1 ? 'Off by ten.' : 'The turns were left out.']],
        md`$|\emf| = NA\,|dB/dt| = ${n}\times${Ncm}\times10^{-4}\,\text{m}^2\times${rate}\,\text{T/s} = ${EM.p(+e.toPrecision(3))}$ V.`);
    },
    // sign of Psi with a chosen dS
    () => {
      const B = pick([0.2, 0.5, 2, 4]), A = pick([0.5, 2, 0.1]), sB = pick([1, -1]), sS = pick([1, -1]), ax = pick(AX);
      const v = sB * sS * B * A;
      const o = (x) => `$${EM.p(+x.toPrecision(3))}$ Wb`;
      return MC('Sign of the flux', md`$\mathbf B = ${sB > 0 ? '' : '-'}${B}\,\hat ${ax}$ T through a flat loop of area $${A}\,\text{m}^2$ facing the field, with $d\mathbf S$ chosen along $${sS > 0 ? '+' : '-'}\hat ${ax}$. $\Psi = $`, o(v),
        [[o(-v), md`$\mathbf B$ ${v > 0 ? 'points along' : 'points against'} $d\mathbf S$, so $\Psi$ is ${v > 0 ? 'positive' : 'negative'}.`], [o(0), 'The loop faces the field.'], [o(sB * sS * B), 'That is $\\mathbf B\\cdot\\hat n$ alone; the flux multiplies it by the area.']],
        md`$\Psi = (\mathbf B\cdot\hat n)A = (${sB * B})(${sS})(${A}) = ${EM.p(+v.toPrecision(3))}$ Wb.`);
    },
    // tilted loop
    () => {
      const [th, c, cs] = pick([[60, 0.5, '\\tfrac12'], [90, 0, '0'], [0, 1, '1'], [45, Math.SQRT1_2, '\\tfrac{1}{\\sqrt2}']]);
      const B = pick([0.2, 0.4, 1, 2]), A = pick([0.5, 2, 4]);
      const v = B * A * c;
      const o = (x) => `$${x < 1e-12 ? 0 : EM.p(+x.toPrecision(3))}$ Wb`;
      return MC('Tilted loop', md`A loop of area $${A}\,\text{m}^2$ has its normal at $${th}°$ to a uniform $B = ${B}$ T. $|\Psi| = $`, o(v),
        [[o(B * A * Math.sin(th * Math.PI / 180)), 'That uses the sine: the flux uses the component of $\\mathbf B$ **along the normal**, $\\cos\\theta$.'], [o(B * A), 'Only the normal component crosses the loop.'], [o(B * A * c / 2), 'One factor of ½ too many.'], [o(B), 'That is $B$ alone: multiply by the area and by $\\cos\\theta$.']],
        md`$|\Psi| = BA\cos\theta = (${B})(${A})(${cs}) = ${v < 1e-12 ? 0 : EM.p(+v.toPrecision(3))}$ Wb.`);
    },
    // which change keeps emf the same
    () => {
      const [q, r, w] = pick([
        ['double the turns and halve the area', 'the same', [['doubled', 'Halving the area undoes doubling the turns.'], ['halved', 'Doubling the turns undoes halving the area.'], ['quadrupled', 'The two changes cancel.']]],
        ['double the radius of a circular loop', 'four times', [['twice', 'Area goes as radius squared.'], ['the same', 'A bigger loop links more flux.'], ['eight times', 'Area is $\\pi r^2$, not $r^3$.']]],
        ['make the field ramp twice as fast', 'twice', [['the same', '$\\emf$ is proportional to $dB/dt$.'], ['four times', 'Only the first power of the rate enters.'], ['half', 'Faster change, larger emf.']]],
        ['stop the ramp and hold the field constant at twice its present value', 'zero', [['twice', 'A constant field gives no emf, however large.'], ['four times', 'A constant field gives no emf, however large.'], ['the same nonzero value', 'The emf came from the ramp; with the ramp stopped, $d\\Psi/dt = 0$.']]],
      ]);
      return MC('Scaling', md`A loop sits in a uniform field that ramps steadily. You ${q}. The emf becomes…`, r, w, md`$\emf = -N\,\dfrac{d}{dt}(BA)$.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  const DIR = ['counterclockwise (along $C$)', 'clockwise (against $C$)'];
  GENS.fa_decay = () => {
    const B0 = pick([0.2, 0.5, 0.8, 1.2, 2]), tau = pick([1, 2, 5, 10]), r = pick([2, 3, 4, 5, 8]), n = pick([1, 10, 20, 50, 100]), Rr = pick([2, 5, 10, 20, 50]);
    const t0 = pick([0, tau, 2 * tau]), up = pick([1, -1]);
    const A = Math.PI * (r / 100) ** 2;
    const e = up * n * A * B0 / (tau * 1e-3) * Math.exp(-t0 / tau);      // emf along C (ccw from above, dS = +z)
    const I = e / Rr;
    return {
      title: 'Decaying field through a coil',
      q: md`$\mathbf B = ${up > 0 ? '' : '-'}B_0e^{-t/\tau}\hat z$ with $B_0 = ${B0}$ T and $\tau = ${tau}$ ms threads a coil of $N = ${n}$ turn${n > 1 ? 's' : ''}, radius $${r}$ cm, in the $z = 0$ plane. The coil's resistance is $${Rr}\ \Omega$. Take $C$ counterclockwise seen from $+z$. Find $\emf$ along $C$ and the current at $t = ${t0 === 0 ? '0' : `${t0}\\ \\text{ms}`}$.`,
      parts: [
        N('\\mathcal E\\ \\text{along}\\ C', e, 'V'),
        N('|I|', Math.abs(I), 'A'),
        { lbl: 'Seen from $+z$, the current flows', mc: DIR, a: e > 0 ? 0 : 1, fixed: true, why: e > 0 ? [null, 'The emf along $C$ is positive.'] : ['The emf along $C$ is negative.', null] },
      ],
      hints: ['Counterclockwise from $+z$ puts $d\\mathbf S = +\\hat z$ (RHR).', `$\\Psi(t) = ${up > 0 ? '' : '-'}B_0e^{-t/\\tau}\\pi r^2$, then $\\emf = -N\\,d\\Psi/dt$.`],
      sol: sol({
        eq: md`$\emf = -N\dfrac{d\Psi}{dt}$, $\;\Psi = \mathbf B\cdot\hat z\,\pi r^2$ (RHR: $d\mathbf S = +\hat z$).`,
        sym: md`$\Psi = ${up > 0 ? '' : '-'}B_0\pi r^2e^{-t/\tau}$, so $\emf = ${up > 0 ? '' : '-'}\dfrac{N\pi r^2B_0}{\tau}e^{-t/\tau}$ and $I = \emf/R$.`,
        sub: md`$$\emf = ${up > 0 ? '' : '-'}\frac{(${n})\,\pi\,(${r / 100}\,\text{m})^2\,(${B0}\,\text{T})}{${tau}\times10^{-3}\,\text{s}}\,e^{-${t0 / tau}} = ${f(e)}\ \text{V}$$`,
        ans: md`$\emf = ${f(e)}$ V, $|I| = ${f(Math.abs(I))}$ A, ${e > 0 ? 'counterclockwise' : 'clockwise'} from $+z$.`,
        check: md`Lenz: the ${up > 0 ? 'upward' : 'downward'} flux is dying, so the current makes ${up > 0 ? 'upward' : 'downward'} $\mathbf B$ inside: ${up > 0 ? 'counterclockwise' : 'clockwise'} from $+z$. ✓`,
      }),
    };
  };

  GENS.fa_sin = () => {
    const B0 = pick([0.1, 0.2, 0.5, 1]), fHz = pick([50, 60, 100, 1000]), a = pick([5, 10, 20]), th = pick([0, 30, 60]), n = pick([1, 10, 100]);
    const A = (a / 100) ** 2, w = 2 * Math.PI * fHz, c = Math.cos(th * Math.PI / 180);
    const peak = n * B0 * A * w * c;
    return {
      title: 'Sinusoidal field through a tilted coil',
      q: md`A uniform field $B(t) = B_0\sin(\omega t)$ with $B_0 = ${B0}$ T and $f = ${fHz}$ Hz passes through a square coil of side $${a}$ cm and $N = ${n}$ turn${n > 1 ? 's' : ''}. The coil's normal makes $${th}°$ with the field. Find the peak emf.`,
      parts: [N('|\\mathcal E|_{\\max}', peak, 'V')],
      hints: ['$\\Psi(t) = B_0A\\cos\\theta\\,\\sin(\\omega t)$ per turn.', 'Differentiate: the peak of $\\cos(\\omega t)$ is 1, so $|\\emf|_{\\max} = NB_0A\\omega\\cos\\theta$, with $\\omega = 2\\pi f$.'],
      sol: sol({
        eq: md`$\emf = -N\,d\Psi/dt$, $\;\Psi = B(t)A\cos\theta$.`,
        sym: md`$\emf(t) = -NB_0A\omega\cos\theta\cos(\omega t)$, so $|\emf|_{\max} = NB_0A\omega\cos\theta$.`,
        sub: md`$$|\emf|_{\max} = (${n})(${B0}\,\text{T})(${a / 100}\,\text{m})^2(2\pi\cdot${fHz}\,\text{s}^{-1})\cos${th}° = ${f(peak)}\ \text{V}$$`,
        ans: md`$|\emf|_{\max} = ${f(peak)}$ V.`,
        check: 'The emf peaks when $B$ crosses zero (fastest change), not when $B$ peaks.',
      }),
    };
  };

  // Summer 2017 #3 style: a square loop with series resistors in a ramping field
  GENS.fa_ramp = () => {
    const side = pick([0.5, 1, 2]), rate = pick([-12, -6, -3, 3, 6, 12]), Rs = pick([[1, 2, 3], [2, 2, 2], [1, 1, 4], [2, 3, 5]]);
    const Rt = Rs[0] + Rs[1] + Rs[2];
    const e = -side * side * rate;                // C counterclockwise from +z, dS = +z, B = B0(t) z
    const I = e / Rt;
    return {
      title: 'Ramping field, resistive loop',
      q: md`A square loop of side $${side}$ m in the $xy$-plane contains resistors of $${Rs[0]}$, $${Rs[1]}$ and $${Rs[2]}\ \Omega$ in series (wire resistance negligible). The field is $\mathbf B = B_0(t)\hat z$ with $dB_0/dt = ${rate}$ T/s. Take $C$ counterclockwise from $+z$. Find $\emf$ along $C$, the current along $C$ (signed), and the voltage drop across the ${Rs[2]} Ω resistor.`,
      parts: [
        N('\\mathcal E\\ \\text{along}\\ C', e, 'V'),
        N('I\\ \\text{along}\\ C', I, 'A'),
        N(`|V_{${Rs[2]}\\Omega}|`, Math.abs(I * Rs[2]), 'V'),
      ],
      hints: ['$d\\mathbf S = +\\hat z$, so $\\Psi = B_0A$ and $\\emf = -A\\,dB_0/dt$.', 'The resistors are in series: $I = \\emf/(R_1 + R_2 + R_3)$, and each drops $IR$.'],
      sol: sol({
        eq: md`$\emf = -d\Psi/dt$, $\;\Psi = B_0(t)\,A$ with $d\mathbf S = +\hat z$; $\;I = \emf/R_{\text{total}}$.`,
        sym: md`$\emf = -A\,\dfrac{dB_0}{dt}$, $\;I = \dfrac{\emf}{R_1 + R_2 + R_3}$, $\;V = IR_3$.`,
        sub: md`$$\emf = -(${side}\,\text{m})^2(${rate}\,\text{T/s}) = ${f(e)}\ \text{V}, \qquad I = \frac{${f(e)}\ \text{V}}{${Rt}\ \Omega} = ${f(I)}\ \text{A}$$`,
        ans: md`$\emf = ${f(e)}$ V, $I = ${f(I)}$ A (${I > 0 ? 'counterclockwise' : 'clockwise'}), $|V| = ${f(Math.abs(I * Rs[2]))}$ V.`,
        check: md`The field ${rate * 1 > 0 ? 'grows along $+z$, so the current makes $-z$ field inside: clockwise' : 'along $+z$ is falling (or growing along $-z$), so the current makes $+z$ field: counterclockwise'}. ✓ The resistor voltages add to $\emf$ around the loop, which is why a voltmeter reading depends on where its leads run (Topic 10).`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t8-faraday'] = [
    Q(md`Faraday's law in integral form, $\oint_C\mathbf E\cdot d\mathbf l = -\frac{d}{dt}\int_S\mathbf B\cdot d\mathbf S$, holds for…`,
      ['any surface $S$ bounded by $C$', 'only the flat surface bounded by $C$', 'only surfaces where $\\mathbf B$ is uniform', 'only if $C$ is a circle'], 0,
      [null, 'Since $\\oint\\mathbf B\\cdot d\\mathbf S = 0$, every surface with the same rim carries the same flux.', 'Nonuniform fields are integrated; the law holds regardless.', 'The path can be any closed curve.'],
      md`$\nabla\cdot\mathbf B = 0$ makes the flux through a rim independent of the surface: two surfaces with the same rim form a closed surface with zero net flux.`),
    Q(md`Units: $1$ Wb/s equals…`,
      ['1 V', '1 A', '1 T', '1 H'], 0,
      [null, 'Amperes measure current; $d\\Psi/dt$ is an emf.', 'Tesla is Wb/m², a flux density.', 'Henry is Wb/A.'],
      md`$\emf = -d\Psi/dt$, so Wb/s = V, and Wb = V·s.`),
    Q(md`A coil's flux is $\Psi(t) = 3t^2$ mWb ($t$ in s). The magnitude of its emf at $t = 2$ s is…`,
      ['12 mV', '6 mV', '12 mWb', '24 mV'], 0,
      [null, 'That is $d\\Psi/dt$ at $t = 1$ s.', 'Wrong unit: the emf is a rate of change of flux, in volts.', 'That doubles the derivative.'],
      md`$d\Psi/dt = 6t$ mWb/s $= 12$ mV at $t = 2$ s.`),
    Q(md`$B_z$ inside a long solenoid of radius $a$ grows at a steady rate. Where is the induced $|\mathbf E|$ largest?`,
      ['at $r = a$, the solenoid wall', 'on the axis', 'far outside', 'it is uniform everywhere'], 0,
      [null, 'On the axis $E_\\phi = -(r/2)\\,dB/dt = 0$.', 'Outside it falls as $1/r$.', 'It grows as $r$ inside and falls as $1/r$ outside.'],
      md`$E_\phi \propto r$ for $r < a$ and $\propto a^2/r$ for $r > a$: the peak is at the wall.`),
    Q(md`A rectangular loop is pulled out of a region of uniform $\mathbf B$ into a field-free region. The force from the induced current on the loop…`,
      ['opposes the motion', 'pulls it out faster', 'is zero because $\\mathbf B$ is uniform', 'is perpendicular to the motion and does no work'], 0,
      [null, 'That would create energy from nothing; Lenz says the reaction resists.', 'The flux is changing as the loop leaves, so a current flows in the part still inside.', 'The force on the edge still in the field points back against the motion and does negative work.'],
      md`Lenz in mechanical form: the induced current's force resists whatever changes the flux. Your pulling force supplies the energy dissipated in the loop.`),
    Q(md`Two identical loops, one copper and one plastic with a copper stripe painted on it (same shape), sit in the same changing field. Which statement is right?`,
      ['Both have the same emf; the currents differ with resistance', 'The plastic loop has no emf', 'Both carry the same current', 'Only the loop with lower resistance has an emf'], 0,
      [null, 'The emf depends only on the changing flux through the path.', 'Current is $\\emf/R$, so it depends on resistance.', 'Emf is geometric; resistance only decides the current.'],
      md`$\emf = -d\Psi/dt$ is set by geometry and the field; the material only sets $I = \emf/R$.`),
    Q(md`A long straight wire carries a current that is growing. A square loop lies flat beside it, in the same plane. The loop's current, near the wire, flows…`,
      ['opposite to the wire current', 'in the same direction as the wire current', 'zero: the loop is not around the wire', 'perpendicular to the plane'], 0,
      [null, 'That would add to the growing flux through the loop.', 'The wire\'s field passes through the loop (circles around the wire cross its plane), and it is growing.', 'Current flows in the loop\'s wire, which lies in the plane.'],
      md`The wire's growing $\mathbf B$ points one way through the loop; the loop opposes it with the opposite field inside, which needs current antiparallel to the wire on the near side.`),
    Q(md`For $N$ turns, which is the emf?`,
      ['$-N\\,d\\Psi/dt$, with $\\Psi$ the flux through one turn', '$-d\\Psi/dt$, with $\\Psi$ the flux through one turn', '$-N^2\\,d\\Psi/dt$', '$-(1/N)\\,d\\Psi/dt$'], 0,
      [null, 'That ignores the other $N - 1$ turns, which add in series.', 'Turns add in series once: one factor of $N$.', 'More turns give more emf, not less.'],
      md`Each turn contributes $-d\Psi/dt$ and they add in series.`),
  ];
})();

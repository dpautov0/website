/* Topic 13 — Magnetic materials, B and H boundary conditions (Lecture 17).
   Dipole moments and magnetization, H = B/μ0 − M, χm and μ, dia-, para- and ferromagnets (hysteresis), bound currents,
   the boundary conditions on B and H and the bending of field lines, Lecture 17's ferromagnetic slab between current
   sheets, cores in inductors (HW 7 #1(c)), and the electric analogy. Ampère's law itself is Topic 5; sheets are Topic 6. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick, ri } = U;

  // ---------------------------------------------------------------- helpers
  const AX = ['x', 'y', 'z'];
  const eps = (a, b) => ((b - a + 3) % 3 === 1 ? 1 : -1);          // sign of the permutation (a, b, third)
  const cf = (c) => (c === 1 ? '' : c === -1 ? '-' : String(c));
  // [vx, vy, vz] -> '2\hat x - 3\hat z' (zero parts dropped), '0' if all zero
  const vec = (v) => {
    let s = '';
    v.forEach((c, i) => {
      if (!c) return;
      const m = Math.abs(c) === 1 ? '' : EM.p(Math.abs(c));
      s += s ? (c < 0 ? ' - ' : ' + ') : (c < 0 ? '-' : '');
      s += m + '\\hat ' + AX[i];
    });
    return s || '0';
  };
  // Lecture 17's tables: χm for dia- and paramagnets, χm = μr − 1 for ferromagnets
  const MATS = [
    ['copper', -0.94e-5], ['lead', -1.7e-5], ['water', -0.88e-5], ['bismuth', -1.7e-4],
    ['platinum', 2.9e-5], ['aluminum', 2.1e-5], ['liquid oxygen', 3.5e-5],
    ['cobalt', 249], ['nickel', 599], ['mild steel', 1999], ['iron', 4999],
  ];
  const KIND = (chi) => (chi < 0 ? 'diamagnetic' : chi < 1 ? 'paramagnetic' : 'ferromagnetic');

  // ---------------------------------------------------------------- figures
  // a ferromagnet's hysteresis loop with the first magnetization curve, remanence and coercive field
  function hystFig() {
    const g = PF.fig({ alt: 'a hysteresis loop: B against H; the dashed first-magnetization curve starts at the origin and saturates; at H = 0 the loop keeps a remanent B_r; B returns to zero at the coercive field minus H_c' });
    const ox = 150, oy = 100, sx = 40, sy = 70, Hc = 0.8, w = 0.55;
    const P = (h, b) => [ox + sx * h, oy - sy * b];
    g.axes(ox, oy, { x: [-135, 135], y: [-88, 88], xl: 'H', yl: 'B' });
    const branch = (sg) => { const pts = []; for (let k = 0; k <= 72; k++) { const h = -3 + 6 * k / 72; pts.push(P(h, Math.tanh((h + sg * Hc) / w))); } return pts; };
    g.pl(branch(1), { cls: 'thick' });
    g.pl(branch(-1), { cls: 'thick' });
    const first = []; for (let k = 0; k <= 40; k++) { const h = 3 * k / 40; first.push(P(h, 0.98 * Math.tanh(h / 0.9))); }
    g.pl(first, { cls: 'dash dim' });
    const sl = sy / w / sx;                                       // screen slope at the steep crossings
    g.head(...P(-Hc, 0), -1, sl, { hs: 9 });
    g.head(...P(Hc, 0), 1, -sl, { hs: 9 });
    g.line(...P(0.6, 1), ...P(3, 1), { cls: 'dash dim' });
    g.label(...P(3, 1.06), 'B_{\\text{sat}}', 'br', 'small');
    const Br = P(0, Math.tanh(Hc / w));
    g.dot(Br[0], Br[1], 3);
    g.label(Br[0] - 8, Br[1] - 8, 'B_r', 'br', 'small');
    const Hcp = P(-Hc, 0);
    g.dot(Hcp[0], Hcp[1], 3);
    g.label(Hcp[0] - 6, Hcp[1] - 6, '-H_c', 'br', 'small');
    return g.svg();
  }

  // a block of identical current loops (M out of the page): inside they cancel, along the edge they add
  function boundFig() {
    const g = PF.fig({ alt: 'a block filled with small counterclockwise current loops; neighbouring currents cancel inside, and along the edge they add to a counterclockwise surface current' });
    const x0 = 30, y0 = 20, r = 15, dx = 38;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      const cx = x0 + r + i * dx, cy = y0 + r + j * dx;
      g.circle(cx, cy, r, { cls: 'dim' });
      g.head(cx - 1, cy - r, -1, 0, { hs: 6, cls: 'dim' });
      g.head(cx + 1, cy + r, 1, 0, { hs: 6, cls: 'dim' });
    }
    g.loopRect(x0 - 7, y0 - 7, 3 * dx + 2 * r + 14, 2 * dx + 2 * r + 14, { dir: 'ccw' });
    g.odot(222, 34, 6);
    g.label(232, 34, '\\mathbf M', 'l');
    g.label(x0 + 3 * dx + 2 * r + 14, 92, '\\mathbf J_{sb}', 'l');
    return g.svg();
  }

  // a field line entering iron from air: close to the normal in air, nearly along the surface in iron
  function bendFig() {
    const g = PF.fig({ alt: 'a field line in air meets the surface of iron at a small angle theta 1 from the normal and continues inside the iron at a large angle theta 2, nearly along the surface' });
    const yI = 100, X0 = 110;
    g.rect(20, yI, 260, 70, { cls: 'shade' });
    g.line(20, yI, 280, yI, { cls: 'thick' });
    g.line(X0, 24, X0, 166, { cls: 'dim dash' });
    g.line(66, 30, X0, yI, { cls: 'thick', mid: true, hs: 8 });
    g.line(X0, yI, 250, yI + 30, { cls: 'thick', mid: true, hs: 8 });
    g.angle(X0, yI, 30, 90, 122, '\\theta_1');
    g.angle(X0, yI, 30, 270, 348, '\\theta_2');
    g.label(240, 50, '\\mu_1\\ (\\text{air})', 'c');
    g.label(215, 152, '\\mu_2 \\gg \\mu_1\\ (\\text{iron})', 'c');
    g.label(X0 + 4, 26, '\\hat n', 'l', 'small');
    return g.svg();
  }

  // Lecture 17's example: a slab between two current sheets (x right, z up, y into the page)
  function slabFig() {
    const g = PF.fig({ alt: 'side view: the top current sheet flows out of the page, the bottom one into the page; a shaded slab of relative permeability 100 lies between them; H points to the right between the sheets' });
    const xs = [60, 90, 120, 150, 180, 210, 240];
    for (const x of xs) g.odot(x, 40, 5);
    for (const x of xs) g.otimes(x, 140, 5);
    g.rect(50, 62, 200, 56, { cls: 'shade' });
    g.label(150, 78, '\\mu_r = 100', 'c', 'small');
    g.arrow(110, 102, 190, 102, { cls: 'thick', hs: 8 });
    g.label(196, 102, '\\mathbf H', 'l');
    g.label(42, 40, '-0.1\\,\\hat y\\ \\text{A/m}', 'r', 'small');
    g.label(42, 140, '+0.1\\,\\hat y\\ \\text{A/m}', 'r', 'small');
    g.axes(286, 150, { x: [0, 30], y: [0, 30], xl: 'x', yl: 'z' });
    g.otimes(286, 150, 4, { lab: 'y', at: 'bl' });
    return g.svg();
  }

  // ---------------------------------------------------------------- the lesson
  EM.lesson('u4', {
    id: 't13-materials', topic: 13, ref: 'Lecture 17', title: 'Magnetic materials, B and H boundary conditions',
    steps: [
      R(md`
        !!key Why you care
          Spring 2018 1(vi) gives $\mathbf H$ on one side of a current sheet and asks for it on the other: the $\mathbf H$ boundary condition. HW 7 #1(c) finds $\mu$ of a rod from the change in an RL time constant and asks whether it is diamagnetic or paramagnetic. Lecture 17's example, a ferromagnetic slab between two current sheets, is the pattern for every "$\mathbf H$ stays, $\mathbf B$ grows by $\mu_r$" problem. And $\mu$ enters every inductor with a core ([Topic 11](#/l/t11-inductance)) and every wave in a magnetic medium ([Topic 16](#/l/t16-sinusoids)).

        ### Notation

        - $\mathbf m = IA\,\hat n$: **magnetic dipole moment** of a small loop carrying current $I$ around area $A$, A·m²; $\hat n$ from the current by the right-hand rule (RHR).
        - $n$: dipoles per m³. $\mathbf M = n\mathbf m$: **magnetization**, the dipole moment per volume, A/m.
        - $\mathbf B$: magnetic flux density (T). $\mathbf H = \mathbf B/\mu_0 - \mathbf M$: magnetic field intensity (A/m).
        - $\chi_m$: magnetic **susceptibility**, no units, $\mathbf M = \chi_m\mathbf H$. $\mu = \mu_0(1 + \chi_m) = \mu_0\mu_r$: **permeability** (H/m); $\mu_r$: relative permeability, no units.
        - **Free** currents $\mathbf J$ (A/m²) and $\mathbf J_s$ (A/m): the ones in wires and sheets that you drive. **Bound** currents, from the aligned atomic loops: $\mathbf J_b = \nabla\times\mathbf M$ (A/m²) inside a material, $\mathbf J_{sb} = \mathbf M\times\hat n$ (A/m) on its surface, $\hat n$ pointing out.
        - At an interface: $\hat n$ points from region − into region +; $\mathbf B^\pm$, $\mathbf H^\pm$ are the fields just on either side; subscripts $n$ and $t$ mean the parts normal and tangential to the interface; $\theta$ is the angle between a field line and the normal.
        - $L$: inductance (H); $R$: resistance (Ω); $\tau = L/R$: the RL time constant (s).

        ### The idea

        Matter is full of tiny current loops: electrons orbiting and spinning. An applied field lines them up (or, in a diamagnet, makes them oppose it), and their field adds to the applied one. Their effect is bookkept in $\mathbf M$, and for most materials it is proportional to $\mathbf H$:
        $$\mathbf B = \mu_0(\mathbf H + \mathbf M) = \mu_0(1 + \chi_m)\mathbf H = \mu\mathbf H$$
        When the field runs along every material surface (cores in solenoids and toroids, slabs between sheets), $\mathbf H$ comes from Ampère's law with the free currents alone, and the material multiplies $\mathbf B$ by $\mu_r$. Everything from vacuum carries over with $\mu_0 \to \mu$.
      `),
      R(md`
        ### Step 1: dipoles and magnetization

        A small loop of current $I$ around area $A$ is a **magnetic dipole**, $\mathbf m = IA\,\hat n$. Far away its field looks like a tiny bar magnet's, with the north pole on the $\hat n$ side. Atoms carry such moments from their electrons' orbits and spins.

        In an unmagnetized piece the moments point every which way and cancel. An applied $\mathbf B$ twists each one toward itself (torque $\mathbf m\times\mathbf B$), and the sum no longer cancels. The **magnetization** is the net moment per volume:
        $$\mathbf M = n\mathbf m \qquad [\text{m}^{-3}\times\text{A·m}^2 = \text{A/m}]$$
        the same unit as $\mathbf H$.
      `),
      Q(md`**Predict.** A circular loop of radius 10 cm in the $xy$-plane carries 2 A, counterclockwise seen from $+z$. Its dipole moment is…`,
        ['$0.0628\\,\\hat z$ A·m²', '$-0.0628\\,\\hat z$ A·m²', '$1.26\\,\\hat z$ A·m²', '$0.0628\\,\\hat x$ A·m²'], 0,
        [null, 'Counterclockwise seen from $+z$ puts the RHR thumb along $+\\hat z$.', 'That multiplies $I$ by the circumference $2\\pi a = 0.628$ m, not by the area.', '$\\mathbf m$ is normal to the plane of the loop.'],
        md`$\mathbf m = I\pi a^2\,\hat n = (2\ \text{A})\,\pi(0.1\ \text{m})^2\,\hat z = 0.0628\,\hat z$ A·m², along $+\hat z$ by the RHR.`),
      RF(md`
        ### Step 2: susceptibility, permeability, three kinds of matter

        For a **linear** material $\mathbf M = \chi_m\mathbf H$, so $\mathbf B = \mu_0(1 + \chi_m)\mathbf H = \mu\mathbf H$ and $\mu_r = 1 + \chi_m$.

        | Kind | $\chi_m$ | The moments… | Near a strong magnet | Examples |
        |---|---|---|---|---|
        | Diamagnetic | about $-10^{-5}$ | oppose $\mathbf H$ (induced by it, as Lenz's law would have it) | pushed away, weakly | copper, bismuth, water |
        | Paramagnetic | about $+10^{-5}$ | align weakly with $\mathbf H$ | pulled in, weakly | aluminum, platinum, liquid oxygen |
        | Ferromagnetic | $10^2$ to $10^5$ | align strongly, in domains | pulled in, strongly | iron, nickel, cobalt |

        Every material has the diamagnetic response; it is so weak that it shows only when nothing else does. Ferromagnets are **not linear**: their $\mu_r$ depends on $\mathbf H$ and on history. Their domains (regions already magnetized one way) swing into line with the applied field, and can stay there.

        [[fig:hyst]]
      `, { hyst: { svg: hystFig(), cap: 'A ferromagnet\'s B against H. From the origin (dashed) it saturates at B_sat. Bring H back to zero and B_r, the remanence, stays: a permanent magnet. The reverse field −H_c (coercive field) brings B back to zero.' } }),
      Q(md`**Predict.** Copper has $\chi_m = -0.94\times10^{-5}$. A copper core sits in a solenoid where $\mathbf H = 2000\,\hat z$ A/m. Its magnetization is…`,
        ['$-0.0188\\,\\hat z$ A/m', '$+0.0188\\,\\hat z$ A/m', '$-2.36\\times10^{-8}\\,\\hat z$ A/m', '$0$'], 0,
        [null, '$\\chi_m < 0$: in a diamagnet $\\mathbf M$ opposes $\\mathbf H$.', 'That multiplies by $\\mu_0$ as well. $\\mathbf M = \\chi_m\\mathbf H$ has no $\\mu_0$: both are in A/m.', 'Small is not zero: every material responds.'],
        md`$\mathbf M = \chi_m\mathbf H = (-0.94\times10^{-5})(2000\ \text{A/m})\,\hat z = -0.0188\,\hat z$ A/m. The core lowers $B$ by 0.00094%.`),
      RF(md`
        ### Step 3: bound currents

        [[fig:bound]]

        Picture a magnetized block as a grid of identical little loops. Inside, each loop's current runs right next to its neighbor's, going the other way: they cancel. At the surface nothing cancels them, so the block carries a **surface current** circulating around it, just like a solenoid's winding:
        $$\mathbf J_{sb} = \mathbf M\times\hat n\quad(\hat n\ \text{out of the material}), \qquad \mathbf J_b = \nabla\times\mathbf M\ \ \text{inside, where}\ \mathbf M\ \text{varies}$$
        The formula sheet's $\mathbf J_{\text{bound}} = \nabla\times\mathbf M + \partial\mathbf P/\partial t$ is the volume part plus a dielectric's polarization current. These bound currents are what raise $\mathbf B$ inside: a uniformly magnetized rod is a solenoid with $NI/\ell$ replaced by $M$, adding $\mu_0\mathbf M$ to $\mu_0\mathbf H$.
      `, { bound: { svg: boundFig(), cap: 'Uniform M out of the page. Neighbouring loop currents cancel inside; along the edge they add up to a surface current J_sb = M × n̂, counterclockwise.' } }),
      Q(md`**Predict.** A long rod along $z$ of radius $a$ has uniform $\mathbf M = M_0\hat z$. Its bound current is…`,
        ['$M_0\\hat\\phi$ (A/m) on the curved side only', '$M_0\\hat z$ (A/m²) through the whole volume', '$-M_0\\hat\\phi$ on the curved side only', '$M_0\\hat\\phi$ on the side and on both flat ends'], 0,
        [null, 'Uniform $\\mathbf M$ has no curl, so no volume current; and bound currents circulate around $\\mathbf M$, not along it.', 'Sign: $\\hat z\\times\\hat r = +\\hat\\phi$.', 'On the flat ends $\\hat n = \\pm\\hat z$ is parallel to $\\mathbf M$, and $\\mathbf M\\times\\hat n = 0$.'],
        md`$\mathbf J_{sb} = M_0\hat z\times\hat r = M_0\hat\phi$: counterclockwise seen from $+z$, like a solenoid winding with $NI/\ell = M_0$. Inside, $\mathbf B = \mu_0M_0\hat z$ from it alone.`),
      RF(md`
        ### Step 4: boundary conditions on B and H

        Two laws, each applied to a thin shape straddling the interface:

        - **Pillbox** (Gauss's law for $\mathbf B$): what enters the bottom face leaves the top, so **normal $\mathbf B$ is continuous**: $\hat n\cdot(\mathbf B^+ - \mathbf B^-) = 0$.
        - **Thin rectangle** (Ampère's law for $\mathbf H$): its circulation equals the free current threading it, nonzero only if a free sheet lies on the interface: $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$, equivalently $\mathbf H^+_t - \mathbf H^-_t = \mathbf J_s\times\hat n$. With no free sheet, **tangential $\mathbf H$ is continuous**.

        $\mathbf J_s$ here is **free** current only: the bound surface current is already inside $\mathbf M$, which $\mathbf H$ accounts for.

        [[fig:bend]]

        With $\mathbf B = \mu\mathbf H$ on each side and no free sheet, $B\cos\theta$ and $(B/\mu)\sin\theta$ are both continuous, so
        $$\frac{\tan\theta_2}{\tan\theta_1} = \frac{\mu_2}{\mu_1}$$
        Entering iron, a field line swings almost parallel to the surface; leaving iron, it exits almost perpendicular to it. That is how an iron core guides flux along itself.
      `, { bend: { svg: bendFig(), cap: 'Entering high-μ material the line swings toward the surface: tan θ2 / tan θ1 = μ2/μ1.' } }),
      Q(md`**Predict.** Region $z < 0$ has $\mu_r = 4$, region $z > 0$ is air, and no free current flows on $z = 0$. Just below the interface $\mathbf B = 2\,\hat x + 3\,\hat z$ mT. Just above it, $\mathbf B = $`,
        ['$0.5\\,\\hat x + 3\\,\\hat z$ mT', '$8\\,\\hat x + 3\\,\\hat z$ mT', '$2\\,\\hat x + 0.75\\,\\hat z$ mT', '$2\\,\\hat x + 3\\,\\hat z$ mT'], 0,
        [null, 'That multiplies the tangential part by $\\mu_r$. Leaving the high-$\\mu$ side, $B_t$ shrinks by $\\mu_r$.', 'That scales the normal part, which is continuous, and keeps the tangential part, which is not.', 'Only the normal part of $\\mathbf B$ is continuous; the tangential part of $\\mathbf H$, not of $\\mathbf B$, carries across.'],
        md`$B_z$ is continuous: 3 mT. $H_x$ is continuous: $H_x = 2\ \text{mT}/4\mu_0$, so in air $B_x = \mu_0H_x = 0.5$ mT. The line leans toward the normal on the air side.`),
      R(md`
        ### Step 5: field along the interface, or across it

        The two conditions decide what a material changes.

        - **Field along the interfaces** (a core filling a solenoid or toroid, a slab parallel to current sheets): tangential $\mathbf H$ is continuous, so $\mathbf H$ is the same as without the material, fixed by the free current. $\mathbf B = \mu\mathbf H$ grows by $\mu_r$, and $\mathbf M = \chi_m\mathbf H$.
        - **Field across the interfaces** (a thin plate perpendicular to a uniform field, a gap cut across an iron ring): normal $\mathbf B$ is continuous, so $\mathbf B$ stays the same and $\mathbf H = \mathbf B/\mu$ inside drops by $\mu_r$.

        Most exam problems are the first kind: find $\mathbf H$ from the free currents with Ampère's law, then multiply.
      `),
      Q(md`**Predict.** A wide, thin iron plate ($\mu_r = 1000$) lies flat in the $xy$-plane, in a uniform field $\mathbf B_0 = 0.1\,\hat z$ T in air. Inside the plate…`,
        ['$B = 0.1$ T and $H = 79.6$ A/m', '$B = 100$ T and $H = 7.96\\times10^4$ A/m', '$B = 0.1$ T and $H = 7.96\\times10^4$ A/m', '$B = 0$: the iron screens the field'], 0,
        [null, 'That treats the field as running along the plate. It crosses the plate, so $B_n$ is continuous.', 'That is $H$ outside, $B_0/\\mu_0$. Inside, $H = B/\\mu$ is $\\mu_r$ times smaller.', 'Flux lines cannot stop at the surface: $B_n$ is continuous.'],
        md`$B_z$ is continuous: 0.1 T inside. $H = B/\mu_0\mu_r = 0.1/(4\pi\times10^{-7}\cdot1000) = 79.6$ A/m, a thousandth of the $7.96\times10^4$ A/m outside.`),
      R(md`
        ### Step 6: cores, and the electric analogy

        Inductance is flux linkage per amp, and the flux is $\mu$ times something set by geometry and free current. So $L \propto \mu$: a long solenoid with a core has $L = \mu N^2A/\ell$, $\mu_r$ times its air value until a ferromagnet saturates. An iron core multiplies $L$ by hundreds or thousands; a diamagnetic rod lowers it by a hair.

        | Electric | Magnetic |
        |---|---|
        | $\mathbf P = \epsilon_0\chi_e\mathbf E$ | $\mathbf M = \chi_m\mathbf H$ (no $\mu_0$) |
        | $\mathbf D = \epsilon_0\mathbf E + \mathbf P = \epsilon\mathbf E$ | $\mathbf B = \mu_0(\mathbf H + \mathbf M) = \mu\mathbf H$ |
        | $\epsilon = \epsilon_0(1 + \chi_e)$ | $\mu = \mu_0(1 + \chi_m)$ |
        | bound charge $\rho_b = -\nabla\cdot\mathbf P$ | bound current $\mathbf J_b = \nabla\times\mathbf M$ |
        | $\hat n\cdot(\mathbf D^+ - \mathbf D^-) = \rho_s$; $\mathbf E_t$ continuous | $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$; $B_n$ continuous |
        | $C \propto \epsilon$ | $L \propto \mu$ |

        One asymmetry: $\chi_e$ is positive in every material, while $\chi_m$ can be either sign.
      `),
      Q(md`**Predict.** An air-core solenoid has $L = 2$ mH. Filled with ferrite of $\mu_r = 500$ (well below saturation), its inductance becomes…`,
        ['1 H', '2 mH', '4 μH', '0.1 H'], 0,
        [null, 'A core changes the flux per amp, so it changes $L$.', 'That divides by $\\mu_r$. Flux, and $L$, grow with $\\mu$.', 'Arithmetic: $2\\ \\text{mH}\\times500 = 1000$ mH $= 1$ H.'],
        md`$L = \mu N^2A/\ell \propto \mu$: $2\ \text{mH}\times500 = 1$ H. Same current, 500 times the flux.`),
      RF(md`
        ### The method

        !!method Magnetic materials and interfaces
          1. **Find H from the free currents:** Ampère's law, the sheet formula $\mathbf H = \tfrac12\mathbf J_s\times\hat n$, the solenoid's $H = NI/\ell$. This works when $\mathbf H$ runs along every material surface; if it crosses one, start from continuous $B_n$ instead.
          2. **Multiply:** $\mathbf B = \mu_0\mu_r\mathbf H$, $\;\mathbf M = \chi_m\mathbf H = (\mu_r - 1)\mathbf H$.
          3. **Bound currents, if asked:** $\mathbf J_{sb} = \mathbf M\times\hat n$ on each surface ($\hat n$ outward), $\mathbf J_b = \nabla\times\mathbf M$ inside.
          4. **Interfaces:** $B_n$ continuous; $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$ (free only), $\hat n$ from − into +. Convert with $\mathbf B = \mu\mathbf H$ on each side.
          5. **Check:** $\mathbf B$ is larger in para- and ferromagnets, a hair smaller in diamagnets; bound surface currents run with the free current next to them in para- and ferromagnets, against it in diamagnets.

        ### Worked example

        !!graded Problem
          Lecture 17: an infinite ferromagnetic slab ($\mu_r = 100$) lies between two infinite current sheets, $\mathbf J_s = -0.1\,\hat y$ A/m on the top sheet and $+0.1\,\hat y$ A/m on the bottom sheet ($x$ to the right, $z$ up, $\hat y$ into the page). Find $\mathbf H$, $\mathbf B$ and $\mathbf M$ inside the slab and compare them with a nonmagnetic slab ($\mu_r = 1$). Then find the bound surface currents on the slab's faces.

        [[fig:slab]]

        **1. H from the free sheets.** Each sheet gives $\mathbf H = \tfrac12\mathbf J_s\times\hat n$, with $\hat n$ from the sheet toward the point. Between them:
        $$\text{top}\ (\hat n = -\hat z):\ \tfrac12(-0.1\,\hat y)\times(-\hat z) = 0.05\,\hat x, \qquad \text{bottom}\ (\hat n = +\hat z):\ \tfrac12(0.1\,\hat y)\times\hat z = 0.05\,\hat x$$
        So $\mathbf H = 0.1\,\hat x$ A/m between the sheets, and zero outside, where the two cancel. The slab's faces are parallel to $\mathbf H$ and carry no free current, so tangential $\mathbf H$ is continuous: **the same $0.1\,\hat x$ A/m inside the slab**, whatever its $\mu_r$.

        **2. B and M.**
        $$\mathbf B = \mu_0\mu_r\mathbf H = (4\pi\times10^{-7}\ \text{H/m})(100)(0.1\ \text{A/m})\,\hat x = 1.26\times10^{-5}\,\hat x\ \text{T}, \qquad \mathbf M = (\mu_r - 1)\mathbf H = 9.9\,\hat x\ \text{A/m}$$

        **3. Nonmagnetic slab.** $\mathbf H = 0.1\,\hat x$ A/m (unchanged), $\mathbf B = \mu_0\mathbf H = 1.26\times10^{-7}\,\hat x$ T (100 times smaller), $\mathbf M = 0$.

        **4. Bound surface currents.** $\mathbf J_{sb} = \mathbf M\times\hat n$: on the top face ($\hat n = +\hat z$), $9.9\,\hat x\times\hat z = -9.9\,\hat y$ A/m; on the bottom face ($\hat n = -\hat z$), $+9.9\,\hat y$ A/m. Inside, $\nabla\times\mathbf M = 0$.

        **Check.** Each bound current runs the same way as the free sheet beside it and adds 9.9 A/m to its 0.1 A/m: as if 10 A/m sheets sat in vacuum, giving $\mathbf B = \mu_0(10\ \text{A/m})\,\hat x = 1.26\times10^{-5}\,\hat x$ T ✓. RHR on the bottom sheet: current into the page, so above it $\mathbf H$ points right, $+\hat x$ ✓.

        !!mistake Common mistakes
          - Writing $\mathbf M = \chi_m\mathbf B$ or $\mathbf M = \mu_0\chi_m\mathbf H$. $\mathbf M$ and $\mathbf H$ are both A/m, and $\chi_m$ has no units.
          - "B is continuous at an interface." Only $B_n$ is. With no free sheet, tangential $\mathbf H$ (not $\mathbf B$) is continuous.
          - Putting bound currents into $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$. Only free current goes there.
          - Flipping $\hat n$. It points from region − into region +; reverse it and the $\mathbf J_s$ you compute changes sign.
          - Thinking a core changes $\mathbf H$ in a solenoid. $H = NI/\ell$ is set by the free current; the core multiplies $\mathbf B$, the flux and $L$.
          - Reading "diamagnetic" as $\mu_r < 0$. It means $\mu_r$ just below 1 ($\chi_m \approx -10^{-5}$).
          - Using one fixed $\mu_r$ for a ferromagnet near saturation, or forgetting remanence: with $\mathbf H = 0$ a ferromagnet can still have $\mathbf M \ne 0$.

        ### Check questions
      `, { slab: { svg: slabFig(), cap: 'Lecture 17: the top sheet (−0.1ŷ A/m) flows out of the page, the bottom one (+0.1ŷ A/m) into it. Between them H = 0.1x̂ A/m, in the slab and in the gaps.' } }),
      Q(md`A sheet current $\mathbf J_s = 2\,\hat y$ A/m lies on the plane $z = 0$ in free space. In the region $z < 0$, $\mathbf H = 3\,\hat z$ A/m. In the region $z > 0$, $\mathbf H = $`,
        ['$2\\hat x + 3\\hat z$ A/m', '$-2\\hat x + 3\\hat z$ A/m', '$5\\hat z$ A/m', '$1\\hat z$ A/m', '$-2\\hat y + 3\\hat z$ A/m'], 0,
        [null, 'Sign: $\\mathbf J_s\\times\\hat n = 2\\hat y\\times\\hat z = +2\\hat x$.', 'The sheet changes only the tangential part; $H_z$ is normal, and continuous with free space on both sides.', 'The sheet changes only the tangential part; $H_z$ is normal, and continuous with free space on both sides.', 'The jump is $\\mathbf J_s\\times\\hat n$, perpendicular to $\\mathbf J_s$, not along it.'],
        md`$\mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat n = 2\hat y\times\hat z = 2\hat x$ A/m, and $H_z$ is continuous ($B_n$ continuous, $\mu_0$ on both sides). So $\mathbf H^+ = 2\hat x + 3\hat z$ A/m, choice (d) on the exam (which prints choices (e) and (f) identically).`, { src: 'Spring 2018 Exam 2' }),
      Q(md`To measure $\mu$ of a rod, you insert it into a long solenoid whose diameter matches the rod's. The time constant $L/R$ of the solenoid's current in an RL circuit **decreases by 0.2%** when the rod replaces the air core. Then…`,
        ['$\\mu = 0.998\\mu_0$: diamagnetic', '$\\mu = 1.002\\mu_0$: paramagnetic', '$\\mu = 0.002\\mu_0$: diamagnetic', '$\\mu = 0.998\\mu_0$: paramagnetic'], 0,
        [null, 'A smaller $\\tau$ means a smaller $L$, so a smaller $\\mu$.', 'A 0.2% change means $\\mu_r - 1 = -0.002$, not $\\mu_r = 0.002$.', '$\\mu_r < 1$ means $\\chi_m < 0$: diamagnetic.'],
        md`$R$ is unchanged and $L = \mu N^2A/\ell \propto \mu$ (the rod fills the core), so $\tau_{\text{rod}}/\tau_{\text{air}} = \mu/\mu_0 = 0.998$: $\chi_m = -0.002 < 0$, diamagnetic.`, { src: 'HW 7 #1(c)' }),
      Q(md`The magnetization $\mathbf M = n\mathbf m$ is measured in…`,
        ['A/m', 'A·m²', 'T', 'no units'], 0,
        [null, 'That is one dipole moment, $\\mathbf m$. Per volume divides by m³.', 'That is $\\mathbf B$. $\\mathbf M$ enters as $\\mu_0\\mathbf M$, so it is in A/m like $\\mathbf H$.', 'That is $\\chi_m$, the ratio $M/H$.'],
        md`(1/m³)(A·m²) = A/m, the unit of $\mathbf H$; that is why $\mathbf B = \mu_0(\mathbf H + \mathbf M)$ adds them.`),
      Q(md`A small piece of bismuth ($\chi_m = -1.7\times10^{-4}$) hangs near one pole of a strong magnet. It is…`,
        ['pushed weakly away from the pole', 'pulled weakly toward the pole', 'pulled strongly toward the pole', 'unaffected'], 0,
        [null, 'That is a paramagnet, $\\chi_m > 0$.', 'That is a ferromagnet, $\\chi_m \\gg 1$.', 'Its moments respond, weakly; a strong magnet makes that visible.'],
        md`$\chi_m < 0$: its induced moments oppose the field, so it is pushed toward weaker field. Bismuth is the strongest common diamagnet.`),
      Q(md`An iron bar is magnetized and the applied field is switched off. The bar keeps $\mathbf M \ne 0$. That leftover magnetization is called…`,
        ['remanence', 'saturation', 'diamagnetism', 'the coercive field'], 0,
        [null, 'Saturation is the ceiling of $M$ at large $H$, when all domains are aligned.', 'Diamagnetism is the weak opposing response, gone as soon as $H$ is.', 'The coercive field is the reverse $H$ needed to bring $B$ back to zero.'],
        md`On the hysteresis loop, $B_r$ at $H = 0$ is the remanence: the domains stay aligned. That is a permanent magnet.`),
      Q(md`A slab $0 < z < d$ has uniform $\mathbf M = M_0\hat x$. Its bound currents are…`,
        ['$-M_0\\hat y$ (A/m) on the top face, $+M_0\\hat y$ on the bottom face, none inside', '$+M_0\\hat y$ on the top face, $-M_0\\hat y$ on the bottom face', '$M_0\\hat x$ (A/m²) throughout the volume', 'none: $\\mathbf M$ is uniform'], 0,
        [null, 'Sign: $\\hat x\\times\\hat z = -\\hat y$ on the top face, where $\\hat n = +\\hat z$.', 'Uniform $\\mathbf M$ has no curl; and bound currents run perpendicular to $\\mathbf M$.', 'Uniform $\\mathbf M$ has no volume current, but it ends at the faces, and there $\\mathbf M\\times\\hat n \\ne 0$.'],
        md`$\mathbf J_{sb} = \mathbf M\times\hat n$: $M_0\hat x\times\hat z = -M_0\hat y$ on top, $M_0\hat x\times(-\hat z) = +M_0\hat y$ on the bottom. Two opposite sheets: like Lecture 17's free sheets, they make $\mu_0M_0\hat x$ between them.`),
      Q(md`A field line leaves a block of iron ($\mu_r = 1000$) into air; inside the iron it runs at $80°$ from the surface normal. In the air just outside, it runs…`,
        ['almost along the normal (about 0.3° from it)', 'almost along the surface', 'at 80° from the normal, unchanged', 'at 10° from the normal'], 0,
        [null, 'That is how it runs inside the iron, the high-$\\mu$ side.', 'It bends at the surface: $\\tan\\theta$ scales with $\\mu$.', 'That uses $90° - 80°$; the bending follows $\\tan\\theta \\propto \\mu$.'],
        md`$\tan\theta_{\text{air}} = \tan80°/1000 = 0.0057$, so $\theta_{\text{air}} \approx 0.3°$: flux leaves iron perpendicular to its surface.`),
      Q(md`A toroid's air core is replaced by a core with $\mu_r = 200$; the current stays the same. Inside the core…`,
        ['$H$ is unchanged; $B$ and $L$ are 200 times larger', '$H$ and $B$ are 200 times larger', '$B$ is unchanged; $H$ is 200 times smaller', 'everything is unchanged'], 0,
        [null, '$H_\\phi = NI/2\\pi r$ is fixed by the free current (Ampère).', 'That is the field-across case. In a toroid $\\mathbf H$ runs along the core.', 'The core multiplies $B$, the flux and the inductance.'],
        md`Ampère around the core: $H_\phi = NI/2\pi r$, independent of $\mu$. Then $B = \mu H$ and $L = N\Psi/I$ both scale with $\mu_r$.`),
      Q(md`At the interface between two magnetic materials with no free current on it, which are continuous?`,
        ['$B_n$ and $\\mathbf H_t$', '$\\mathbf B_t$ and $H_n$', 'all of $\\mathbf B$', 'all of $\\mathbf H$'], 0,
        [null, 'Those are the two that jump, by the ratio of the $\\mu$\'s.', '$\\mathbf B_t = \\mu\\mathbf H_t$ jumps when $\\mu$ does.', '$H_n = B_n/\\mu$ jumps when $\\mu$ does.'],
        md`Gauss's law for $\mathbf B$ on a pillbox gives $B_n$; Ampère's law on a thin loop gives $\mathbf H_t$ (no free sheet).`),
      R(md`
        ### Rapid fire: what kind of material?

        **The trick:** $\chi_m = \mu_r - 1$. Negative and tiny: diamagnetic, pushed out. Positive and tiny: paramagnetic. Hundreds or more: ferromagnetic. $M = \chi_mH$ with no $\mu_0$.

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t13_class', { need: 8 }), { id: 't13-materials.r0' }),
      R(md`
        ### Rapid fire: boundary conditions

        **The trick:** $B_n$ carries across; $\mathbf H_t$ carries across, plus $\mathbf J_s\times\hat n$ if a free sheet is there. Bound currents: $\mathbf M\times\hat n$, with $\hat n$ out of the material.
      `),
      Object.assign(G('rf_t13_bc', { need: 8 }), { id: 't13-materials.r1' }),
      R(md`
        ### Rapid fire: cores and plates

        **The trick:** field along the material: $H$ fixed, $B$, flux, $L$ and $L/R$ times $\mu_r$. Field across it: $B$ fixed, $H$ divided by $\mu_r$.
      `),
      Object.assign(G('rf_t13_core', { need: 8 }), { id: 't13-materials.r2' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t13_slab', { need: 2 }),
      G('t13_interface', { need: 2 }),
      G('t13_core', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  const WHYKIND = {
    diamagnetic: 'Diamagnetic needs $\\chi_m < 0$, that is $\\mu_r$ just below 1.',
    paramagnetic: 'Paramagnetic means $\\chi_m$ small and positive, about $10^{-5}$.',
    ferromagnetic: 'Ferromagnetic means $\\chi_m$ in the hundreds or more.',
  };
  GENS.rf_t13_class = () => one([
    // classify from χm or μr
    () => {
      const [name, chi] = pick(MATS), useMu = pick([true, false]);
      const val = useMu ? (chi > 1 ? String(Math.round(1 + chi)) : (1 + chi).toFixed(7)) : (chi > 1 ? String(chi) : EM.p(chi));
      const k = KIND(chi);
      return MC('What kind?', md`${name[0].toUpperCase() + name.slice(1)} has $${useMu ? '\\mu_r' : '\\chi_m'} = ${val}$. It is…`, k,
        [...['diamagnetic', 'paramagnetic', 'ferromagnetic'].filter((x) => x !== k).map((x) => [x, WHYKIND[x]]), ['nonmagnetic ($\\chi_m = 0$)', 'Only vacuum has $\\chi_m = 0$ exactly; small is not zero.']],
        md`${useMu ? md`$\chi_m = \mu_r - 1 = ${chi > 1 ? chi : EM.p(chi)}$: ` : ''}${chi < 0 ? 'negative and tiny, so the moments oppose H' : chi < 1 ? 'positive and tiny, so the moments align weakly' : 'huge, so domains align strongly'}: ${k}.`);
    },
    // M = χm H
    () => {
      const chi = pick([99, 199, 499, 999, 2.1e-5, -0.94e-5, -1.7e-4]), Hh = pick([10, 20, 50, 100, 200]);
      const M = chi * Hh;
      const o = (x) => md`$${EM.p(+x.toPrecision(3))}$ A/m`;
      return MC('Magnetization', md`A linear material with $\chi_m = ${EM.p(chi)}$ sits where $H = ${Hh}$ A/m. Its magnetization is $M = $`, o(M),
        [[o(M * EM.mu0), 'There is no $\\mu_0$ in $\\mathbf M = \\chi_m\\mathbf H$: both are in A/m.'], [o((1 + chi) * Hh), 'That is $\\mu_rH = B/\\mu_0$, not $M$.'], [o(-M), '$M$ has the sign of $\\chi_m$.'], [o(M / 10), 'Off by ten.']],
        md`$M = \chi_mH = (${EM.p(chi)})(${Hh}\ \text{A/m}) = ${EM.p(+M.toPrecision(3))}$ A/m${chi < 0 ? ', against $\\mathbf H$' : ', along $\\mathbf H$'}.`);
    },
    // μr from H and M
    () => {
      const mur = pick([50, 100, 200, 250, 500, 1000]), Hh = pick([2, 5, 10, 20]);
      const M = (mur - 1) * Hh;
      return MC('Relative permeability', md`Inside a material $H = ${Hh}$ A/m and $M = ${M}$ A/m, in the same direction. $\mu_r = $`, md`$${mur}$`,
        [[md`$${mur - 1}$`, 'That is $\\chi_m = M/H$; $\\mu_r = 1 + \\chi_m$.'], [md`$${mur + 1}$`, '$\\mu_r = 1 + M/H$, not $2 + M/H$.'], [md`$${EM.p(M * Hh)}$`, 'Divide $M$ by $H$; do not multiply.'], ['$1$', '$M \\ne 0$ means the material responds: $\\mu_r \\ne 1$.']],
        md`$\chi_m = M/H = ${mur - 1}$, so $\mu_r = 1 + \chi_m = ${mur}$, and $B = \mu_0(H + M) = \mu_0(${mur * Hh}\ \text{A/m})$.`);
    },
    // pushed or pulled
    () => {
      const [name, chi] = pick(MATS);
      const A = ['pushed weakly toward weaker field', 'pulled weakly toward stronger field', 'pulled strongly toward stronger field', 'unaffected'];
      const a = chi < 0 ? 0 : chi < 1 ? 1 : 2;
      const why = ['That is a diamagnet, $\\chi_m < 0$.', 'That is a paramagnet, $\\chi_m$ small and positive.', 'That is a ferromagnet, $\\chi_m \\gg 1$.', 'Every material responds; a strong magnet makes even $10^{-5}$ visible.'];
      return MC('Pushed or pulled?', md`A small piece of ${name} ($\chi_m = ${chi > 1 ? chi : EM.p(chi)}$) is held near the pole of a strong magnet. It is…`, A[a],
        A.map((o, k) => [o, why[k]]).filter((_, k) => k !== a),
        md`${KIND(chi)}: ${a === 0 ? 'its induced moments oppose the field, so it is pushed toward weaker field' : a === 1 ? 'its moments align weakly, so it is pulled in weakly' : 'its domains align strongly, so it is pulled in hard'}.`);
    },
  ]);

  GENS.rf_t13_bc = () => one([
    // no free sheet, two materials: B_t scales with μ, B_n carries across
    () => {
      const [m1, m2] = pick([[1, 4], [4, 1], [2, 10], [10, 2], [1, 100], [100, 1], [5, 1], [1, 5]]);
      const bt = pick([1, 2, 4, 5, 10]), bn = pick([1, 2, 3, 6]), askT = pick([true, false]);
      const btp = bt * m2 / m1;
      const o = (x) => md`$${EM.p(x)}$ mT`;
      const wr = askT
        ? [[o(bt), 'Tangential $\\mathbf B$ is not continuous; tangential $\\mathbf H$ is, so $B_x$ scales with $\\mu$.'], [o(bt * m1 / m2), 'Ratio upside down: $H_x$ is the same on both sides, so $B_x = \\mu H_x$ is larger where $\\mu$ is larger.'], [o(bn), 'That is the normal part, $B_z$.']]
        : [[o(bn * m2 / m1), 'Normal $\\mathbf B$ is continuous; it is $H_n$ that changes with $\\mu$.'], [o(bn * m1 / m2), 'Normal $\\mathbf B$ is continuous: no flux can pile up at the interface.'], [o(btp), 'That is the tangential part above, $B_x$.']];
      return MC(askT ? 'Tangential B' : 'Normal B', md`Region $z < 0$ has $\mu_r = ${m1}$, region $z > 0$ has $\mu_r = ${m2}$; no free current on $z = 0$. Just below, $\mathbf B = ${bt}\,\hat x + ${bn}\,\hat z$ mT. Just above, $B_${askT ? 'x' : 'z'} = $`, askT ? o(btp) : o(bn), wr,
        askT ? md`$H_x$ is continuous, so $B_x^+ = \dfrac{\mu_{r2}}{\mu_{r1}}B_x^- = \dfrac{${m2}}{${m1}}(${bt}) = ${EM.p(btp)}$ mT.` : md`$B_z$ is continuous: ${bn} mT on both sides. ($H_z$ changes by the ratio ${m1}/${m2}.)`);
    },
    // a free sheet in free space: H+ = H- + J_s × n̂ (Spring 2018 1(vi))
    () => {
      const K = pick([1, 2, 3, 4]), ax = pick([0, 1]), sg = pick([1, -1]);
      const J = [0, 0, 0]; J[ax] = sg * K;
      const Hm = [pick([0, 1, -2]), pick([0, 2, -1]), pick([1, 2, 3, -3])];
      const cr = [J[1], -J[0], 0];                                       // J_s × ẑ
      const Hp = Hm.map((v, k) => v + cr[k]);
      const o = (v) => md`$${vec(v)}$ A/m`;
      return MC('Across a free sheet', md`A free sheet $\mathbf J_s = ${vec(J)}$ A/m lies on $z = 0$ in free space. Just below it $\mathbf H = ${vec(Hm)}$ A/m. Just above it, $\mathbf H = $`, o(Hp),
        [[o(Hm.map((v, k) => v - cr[k])), 'Sign: $\\mathbf H^+ - \\mathbf H^- = \\mathbf J_s\\times\\hat n$ with $\\hat n = +\\hat z$, from − into +.'], [o(Hm.map((v, k) => v + J[k])), 'The jump is $\\mathbf J_s\\times\\hat n$, perpendicular to $\\mathbf J_s$, not $\\mathbf J_s$ itself.'], [o(Hm), 'A free sheet makes the tangential $\\mathbf H$ jump.'], [o(Hm.map((v, k) => v + cr[k] / 2)), 'Half of $\\mathbf J_s$ is the field of the sheet alone on one side. The jump across it is the full $\\mathbf J_s\\times\\hat n$.']],
        md`$\mathbf J_s\times\hat z = ${vec(cr)}$ A/m is added to the tangential part; $H_z$ (normal, free space both sides) stays.`);
    },
    // free sheet from the jump in H
    () => {
      const Hm = [pick([0, 1, 2, -1]), pick([0, 2, -3]), pick([1, 2, 3])];
      const D = [0, 0, 0]; D[pick([0, 1])] = pick([-4, -3, -2, 2, 3, 5]);
      const Hp = Hm.map((v, k) => v + D[k]);
      const Js = [-D[1], D[0], 0];                                        // ẑ × D
      const o = (v) => md`$${vec(v)}$ A/m`;
      return MC('Find the sheet', md`In free space, just below $z = 0$ $\mathbf H = ${vec(Hm)}$ A/m and just above it $\mathbf H = ${vec(Hp)}$ A/m. The free surface current on $z = 0$ is $\mathbf J_s = $`, o(Js),
        [[o(Js.map((v) => -v)), 'Order: $\\hat n\\times(\\mathbf H^+ - \\mathbf H^-)$, with $\\hat n = +\\hat z$ from − into +.'], [o(D), 'That is the jump in $\\mathbf H$; the current is $\\hat n$ crossed into it, perpendicular to it.'], ['$0$', 'Tangential $\\mathbf H$ jumps, so a free sheet must be there.']],
        md`$\mathbf H^+ - \mathbf H^- = ${vec(D)}$ A/m, and $\mathbf J_s = \hat z\times(${vec(D)}) = ${vec(Js)}$ A/m.`);
    },
    // bound surface current M × n̂
    () => {
      const a = ri(0, 2), same = pick([false, false, false, true]);
      const b = same ? a : pick([0, 1, 2].filter((v) => v !== a)), s = pick([1, -1]), M0 = pick([2, 5, 10, 50, 100]);
      const J = [0, 0, 0];
      if (!same) J[3 - a - b] = M0 * s * eps(a, b);
      const o = (v) => (v.every((c) => !c) ? '$0$' : md`$${vec(v)}$ A/m`);
      const Ma = [0, 0, 0]; Ma[a] = M0;
      const other = [0, 0, 0]; other[(a + 1) % 3] = M0;
      return MC('Bound surface current', md`A block has uniform $\mathbf M = ${M0}\,\hat ${AX[a]}$ A/m. On its face with outward normal $\hat n = ${s > 0 ? '+' : '-'}\hat ${AX[b]}$, the bound surface current is $\mathbf J_{sb} = $`, o(J),
        same
          ? [[o(Ma), 'That is $\\mathbf M$ itself. On this face $\\mathbf M\\parallel\\hat n$, so $\\mathbf M\\times\\hat n = 0$.'], [o(other), 'On this face $\\mathbf M\\parallel\\hat n$, so $\\mathbf M\\times\\hat n = 0$.'], [o(other.map((v) => -v)), 'On this face $\\mathbf M\\parallel\\hat n$, so $\\mathbf M\\times\\hat n = 0$.']]
          : [[o(J.map((v) => -v)), 'Order: $\\mathbf M\\times\\hat n$, not $\\hat n\\times\\mathbf M$.'], [o(Ma), 'Bound currents circulate around $\\mathbf M$; they never run along it.'], ['$0$', 'Uniform $\\mathbf M$ has no volume current, but on a face parallel to $\\mathbf M$ the surface current is not zero.']],
        same ? md`$\mathbf M\times\hat n = 0$ on a face perpendicular to $\mathbf M$: the loops' currents there run in the face's own plane and cancel.` : md`$\mathbf M\times\hat n = ${M0}\,\hat ${AX[a]}\times(${s > 0 ? '+' : '-'}\hat ${AX[b]}) = ${vec(J)}$ A/m.`);
    },
  ]);

  GENS.rf_t13_core = () => one([
    // a core in a solenoid or toroid: which quantities scale with μr
    () => {
      const mur = pick([4, 50, 200, 1000]);
      const [qty, scales] = pick([['$H$ inside the core', false], ['$B$ inside the core', true], ['the inductance $L$', true], ['the RL time constant $L/R$', true], ['the flux linkage $N\\Psi$', true]]);
      const up = md`${mur} times larger`, same = 'unchanged', down = md`${mur} times smaller`, sq = md`$${EM.p(mur * mur)}$ times larger`;
      return MC('Add a core', md`A long solenoid's air core is replaced by a linear core with $\mu_r = ${mur}$; the current is the same. ${qty[0].toUpperCase() + qty.slice(1)} becomes…`, scales ? up : same,
        scales
          ? [[same, '$H = NI/\\ell$ is unchanged, but $B = \\mu H$, and with it the flux and $L$, grow with $\\mu$.'], [down, 'The core raises $\\mu$; the flux grows, it does not shrink.'], [sq, 'Only one power of $\\mu$: $L = \\mu N^2A/\\ell$.']]
          : [[up, '$H = NI/\\ell$ comes from the free current alone (the field runs along the core). It is $B$ that grows.'], [down, 'The field runs along the core, so tangential $H$ carries across unchanged.'], [sq, 'Nothing here scales as $\\mu^2$.']],
        md`Field along the core: $H = NI/\ell$ fixed; $B = \mu H$, $N\Psi$ and $L$ scale with $\mu_r$; $R$ is unchanged, so $L/R$ does too.`);
    },
    // thin plate along or across a uniform field
    () => {
      const mur = pick([5, 100, 1000]), along = pick([true, false]), askB = pick([true, false]);
      const opts = askB ? ['$B_0$', md`$${mur}B_0$`, md`$B_0/${mur}$`, '$0$'] : ['$H_0$', md`$${mur}H_0$`, md`$H_0/${mur}$`, '$0$'];
      const a = askB ? (along ? 1 : 0) : (along ? 0 : 2);
      const why = askB
        ? [along ? 'Along the plate, tangential $H$ carries across, so $B = \\mu H$ grows by $\\mu_r$.' : null, along ? null : 'Across the plate, $B_n$ carries across unchanged.', 'Inside a high-$\\mu$ material $B$ never drops below the outside value in these geometries.', 'Flux lines cannot stop at a surface.']
        : [along ? null : 'Across the plate $B$ is fixed, so $H = B/\\mu$ drops.', along ? 'Along the plate $H_t$ carries across unchanged; it is $B$ that grows.' : 'That would be $B$ growing; across the plate it is fixed.', along ? 'Along the plate $H_t$ carries across unchanged.' : null, 'Inside a magnetic material $H$ is reduced, not removed.'];
      return MC('Plate in a field', md`A thin plate with $\mu_r = ${mur}$ sits in a uniform field $B_0$ (in air, $H_0 = B_0/\mu_0$), with the field running **${along ? 'along' : 'across'}** the plate. Inside, $${askB ? 'B' : 'H'} = $`, opts[a],
        opts.map((o, k) => [o, why[k]]).filter((_, k) => k !== a),
        along ? md`Field along the plate: $H_t$ continuous, so $H = H_0$ and $B = \mu_rB_0$.` : md`Field across the plate: $B_n$ continuous, so $B = B_0$ and $H = H_0/\mu_r$.`);
    },
    // HW 7 #1(c): an RL time constant changes when a rod is inserted
    () => {
      const [txt, chi] = pick([['falls by 0.2%', -0.002], ['falls by 0.05%', -0.0005], ['rises by 0.1%', 0.001], ['rises by 0.02%', 0.0002], ['grows 200-fold', 199], ['grows 50-fold', 49]]);
      const o = (c, k) => md`$\chi_m = ${EM.p(c)}$, ${k}`;
      const k = KIND(chi);
      const wr = chi > 1
        ? [[o(chi + 1, k), md`That is $\mu_r$; $\chi_m = \mu_r - 1$.`], [o(chi, 'paramagnetic'), 'Hundreds is ferromagnetic territory.'], [o(-chi, 'diamagnetic'), 'A longer $\\tau$ means a larger $L$, so a larger $\\mu$.']]
        : [[o(-chi, KIND(-chi)), md`Sign: $\tau$ ${chi < 0 ? 'falls, so $L$ and $\\mu$ fall' : 'rises, so $L$ and $\\mu$ rise'}.`], [o(chi * 100, k), md`Percent not converted: ${+(Math.abs(chi) * 100).toPrecision(3)}% is $${EM.p(Math.abs(chi))}$.`], [o(chi, chi < 0 ? 'paramagnetic' : 'diamagnetic'), chi < 0 ? '$\\chi_m < 0$ is diamagnetic.' : '$\\chi_m > 0$ (and small) is paramagnetic.']];
      return MC('Rod in a solenoid', md`A rod that exactly fills a long solenoid is inserted in place of air; the RL time constant $L/R$ ${txt}. The rod has…`, o(chi, k), wr,
        md`$\tau \propto L \propto \mu$, so $\mu_r = \tau_{\text{rod}}/\tau_{\text{air}} = ${+(1 + chi).toFixed(4)}$ and $\chi_m = ${EM.p(chi)}$: ${k}.`);
    },
    // which way do the bound currents in a core run?
    () => {
      const [name, chi] = pick(MATS);
      const A = ['the same way as the winding current', 'opposite to the winding current', 'along the axis of the rod', 'nowhere: only ferromagnets have bound currents'];
      const a = chi > 0 ? 0 : 1;
      const why = ['That is para- and ferromagnets ($\\chi_m > 0$): $\\mathbf M$ along $\\mathbf H$.', 'That is diamagnets ($\\chi_m < 0$): $\\mathbf M$ against $\\mathbf H$.', '$\\mathbf M\\times\\hat n$ circulates around the axis, like the winding.', 'Any $\\mathbf M \\ne 0$ ends at the surface with $\\mathbf J_{sb} = \\mathbf M\\times\\hat n$.'];
      return MC('Bound current in a core', md`A ${name} rod ($\chi_m = ${chi > 1 ? chi : EM.p(chi)}$) fills a solenoid. The bound surface current on the rod runs…`, A[a],
        A.map((o, k) => [o, why[k]]).filter((_, k) => k !== a),
        md`$\mathbf M = \chi_m\mathbf H$ is ${chi > 0 ? 'along' : 'against'} $\mathbf H$, so $\mathbf J_{sb} = \mathbf M\times\hat n$ circulates ${chi > 0 ? 'with' : 'against'} the winding, ${chi > 0 ? 'adding to' : 'slightly reducing'} $B$.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  // Lecture 17's example with new numbers: a slab between two opposite current sheets
  GENS.t13_slab = () => {
    const K = pick([0.1, 0.2, 0.5, 1, 2, 5]), s = pick([1, -1]);
    const [mat, mur] = pick([['ferromagnetic', 100], ['ferromagnetic', 250], ['ferromagnetic', 600], ['ferromagnetic', 5000], ['bismuth, diamagnetic', 0.99983], ['aluminum, paramagnetic', 1.000021]]);
    const top = -s;                                                   // the top sheet carries top·K ŷ, the bottom one −top·K ŷ
    const Hx = s * K, Bx = EM.mu0 * mur * Hx, Mx = (mur - 1) * Hx;
    const jTop = -Mx;                                                 // y-part of M x̂ × ẑ on the top face
    const sgn = (v) => (v > 0 ? '' : '-');
    return {
      title: 'A slab between current sheets',
      q: md`An infinite slab with $\mu_r = ${mur}$ (${mat}) lies between two infinite current sheets: $\mathbf J_s = ${top > 0 ? '' : '-'}${K}\,\hat y$ A/m on the top sheet and $${top > 0 ? '-' : ''}${K}\,\hat y$ A/m on the bottom sheet ($z$ up). Find $H_x$, $B_x$ and $M_x$ inside the slab, and the direction of the bound surface current on the slab's top face.`,
      parts: [
        N('H_x', Hx, 'A/m'),
        N('B_x', Bx, 'T'),
        N('M_x', Mx, 'A/m'),
        { lbl: 'Bound surface current on the top face points along', mc: ['$+\\hat y$', '$-\\hat y$'], a: jTop > 0 ? 0 : 1, fixed: true, why: jTop > 0 ? [null, 'Sign: $\\mathbf M\\times\\hat z$ with $M_x < 0$ points along $+\\hat y$.'] : ['Sign: $\\mathbf M\\times\\hat z$ with $M_x > 0$ points along $-\\hat y$ ($\\hat x\\times\\hat z = -\\hat y$).', null] },
      ],
      hints: ['Each sheet gives $\\mathbf H = \\tfrac12\\mathbf J_s\\times\\hat n$ ($\\hat n$ from the sheet toward the point); between the sheets they add. Tangential $\\mathbf H$ carries into the slab unchanged.', '$\\mathbf B = \\mu_0\\mu_r\\mathbf H$, $\\mathbf M = (\\mu_r - 1)\\mathbf H$, $\\mathbf J_{sb} = \\mathbf M\\times\\hat n$ with $\\hat n = +\\hat z$ on the top face.'],
      sol: sol({
        eq: md`Each sheet: $\mathbf H = \tfrac12\mathbf J_s\times\hat n$. No free current on the slab's faces and $\mathbf H$ along them, so $\mathbf H$ inside equals $\mathbf H$ between the sheets. Then $\mathbf B = \mu_0\mu_r\mathbf H$, $\mathbf M = (\mu_r - 1)\mathbf H$, $\mathbf J_{sb} = \mathbf M\times\hat n$.`,
        sym: md`Top sheet ($\hat n = -\hat z$ toward the slab): $\tfrac12(${sgn(top)}K\hat y)\times(-\hat z) = ${sgn(s)}\tfrac K2\hat x$. Bottom sheet ($\hat n = +\hat z$): $\tfrac12(${sgn(-top)}K\hat y)\times\hat z = ${sgn(s)}\tfrac K2\hat x$. Inside: $H_x = ${sgn(s)}K$.`,
        sub: md`$$H_x = ${f(Hx)}\ \text{A/m}, \qquad B_x = (4\pi\times10^{-7})(${mur})(${f(Hx)}) = ${f(Bx)}\ \text{T}, \qquad M_x = (${mur} - 1)(${f(Hx)}) = ${f(Mx)}\ \text{A/m}$$`,
        ans: md`$H_x = ${f(Hx)}$ A/m, $B_x = ${f(Bx)}$ T, $M_x = ${f(Mx)}$ A/m; on the top face $\mathbf J_{sb} = M_x\hat x\times\hat z = ${f(-Mx)}\,\hat y$ A/m, along $${jTop > 0 ? '+' : '-'}\hat y$.`,
        check: md`${mur > 1 ? md`The bound current on the top face runs the same way as the free sheet beside it, which is why $B$ is $\mu_r$ times larger.` : md`The bound current runs against the free sheet beside it: a diamagnet lowers $B$, by a hair.`} With $\mu_r = 1$, $B_x$ would be $${f(EM.mu0 * Hx)}$ T.`,
      }),
    };
  };

  // two materials meet at z = 0, maybe with a free sheet on the interface
  GENS.t13_interface = () => {
    const [m1, m2] = pick([[1, 4], [4, 1], [2, 5], [5, 2], [1, 10], [10, 1], [3, 1], [1, 3], [50, 1], [1, 50]]);
    const hx = pick([1, 2, 3, 4, -2]), hz = pick([2, 3, 4, 6, -3]);
    const K = pick([0, 0, 1, 2, -1, -3].filter((k) => hx + k !== 0));
    const Hxp = hx + K, Hzp = m1 * hz / m2, Bz = EM.mu0 * m1 * hz;
    return {
      title: 'B and H across an interface',
      q: md`The plane $z = 0$ separates a material with $\mu_r = ${m1}$ ($z < 0$) from one with $\mu_r = ${m2}$ ($z > 0$). ${K ? md`A free surface current $\mathbf J_s = ${cf(K)}\,\hat y$ A/m flows on the interface.` : 'No free current flows on the interface.'} Just below it, $\mathbf H = ${vec([hx, 0, hz])}$ A/m. Find $H_x$, $H_z$ and $B_z$ just above it.`,
      parts: [N('H_x^+', Hxp, 'A/m'), N('H_z^+', Hzp, 'A/m'), N('B_z^+', Bz, 'T')],
      hints: ['Normal $\\mathbf B$ carries across: $\\mu_{r1}H_z^- = \\mu_{r2}H_z^+$.', '$\\mathbf H_t^+ - \\mathbf H_t^- = \\mathbf J_s\\times\\hat n$ with $\\hat n = +\\hat z$; note $\\hat y\\times\\hat z = \\hat x$.'],
      sol: sol({
        eq: md`$\hat n\cdot(\mathbf B^+ - \mathbf B^-) = 0$ and $\mathbf H_t^+ - \mathbf H_t^- = \mathbf J_s\times\hat n$, with $\hat n = +\hat z$ (from − into +).`,
        sym: md`Tangential: ${K ? md`$\mathbf J_s\times\hat z = ${cf(K)}\,\hat y\times\hat z = ${cf(K)}\,\hat x$ A/m, so $H_x^+ = H_x^- + (${K})$.` : md`no free sheet, so $H_x^+ = H_x^-$.`} Normal: $B_z^+ = B_z^- = \mu_0\mu_{r1}H_z^-$, so $H_z^+ = \dfrac{\mu_{r1}}{\mu_{r2}}H_z^-$.`,
        sub: md`$$H_x^+ = ${K ? `${hx} + (${K})` : 'H_x^-'} = ${Hxp}\ \text{A/m}, \qquad H_z^+ = \frac{${m1}}{${m2}}(${hz}) = ${f(Hzp)}\ \text{A/m}, \qquad B_z^+ = (4\pi\times10^{-7})(${m1})(${hz}) = ${f(Bz)}\ \text{T}$$`,
        ans: md`$H_x^+ = ${Hxp}$ A/m, $H_z^+ = ${f(Hzp)}$ A/m, $B_z^+ = ${f(Bz)}$ T.`,
        check: md`$B_z$ is the same on both sides, so the side with the larger $\mu_r$ has the smaller $H_z$ (here the ${m2 > m1 ? 'top' : 'bottom'}). ${K ? md`Only the free sheet changes $H_x$, by $(\mathbf J_s\times\hat n)_x = ${K}$ A/m.` : md`Without a free sheet $H_x$ is continuous.`}`,
      }),
    };
  };

  // HW 7 #1(c) with numbers: the solenoid's L and τ, then χm of a rod from the change in τ
  GENS.t13_core = () => {
    const [txt, chi, kind] = pick([['decreases by 0.2%', -0.002, 0], ['decreases by 0.05%', -0.0005, 0], ['increases by 0.1%', 0.001, 1], ['increases by 0.03%', 0.0003, 1], ['becomes 300 times longer', 299, 2], ['becomes 80 times longer', 79, 2]]);
    const Nt = pick([200, 400, 500, 1000]), len = pick([0.2, 0.25, 0.4, 0.5]), rad = pick([0.5, 1, 1.5, 2]), Rr = pick([2, 5, 10, 20]);
    const L0 = EM.mu0 * Nt * Nt * Math.PI * (rad / 100) ** 2 / len, tau0 = L0 / Rr;
    // why[option][answer]: why that option is wrong when the rod is of kind `answer`
    const why = [
      [null, 'Diamagnetic means $\\chi_m < 0$: $\\tau$ would fall.', 'Diamagnetic means $\\chi_m < 0$: $\\tau$ would fall.'],
      ['Paramagnetic means a small positive $\\chi_m$; here $\\tau$ fell, so $\\chi_m < 0$.', null, 'Paramagnetic $\\chi_m$ is about $10^{-5}$, not hundreds.'],
      ['Ferromagnets raise $\\tau$ hundreds of times; here it fell.', 'Ferromagnets raise $\\tau$ hundreds of times, not by a fraction of a percent.', null],
    ];
    return {
      title: 'Permeability from an RL time constant',
      q: md`A long solenoid with $N = ${Nt}$ turns, length $${len}$ m and radius $${rad}$ cm (air core) is connected in series with a $${Rr}\ \Omega$ resistor; the coil's own resistance is negligible. Find its inductance and the RL time constant. A rod that exactly fills the solenoid is then inserted, and the time constant ${txt}. Find the rod's $\chi_m$ and classify it.`,
      parts: [
        N('L_{\\text{air}}', L0, 'H'),
        N('\\tau_{\\text{air}}', tau0, 's'),
        N('\\chi_m', chi, ''),
        { lbl: 'The rod is', mc: ['diamagnetic', 'paramagnetic', 'ferromagnetic'], a: kind, fixed: true, why: [0, 1, 2].map((k) => (k === kind ? null : why[k][kind])) },
      ],
      hints: ['$L = \\mu N^2A/\\ell$ for a long solenoid, with $A = \\pi a^2$; $\\tau = L/R$.', 'With $R$ fixed, $\\tau \\propto L \\propto \\mu$, so $\\tau_{\\text{rod}}/\\tau_{\\text{air}} = \\mu_r = 1 + \\chi_m$.'],
      sol: sol({
        eq: md`$L = \mu N^2A/\ell$, $\;\tau = L/R$. With $R$ fixed, $\tau \propto L \propto \mu$.`,
        sym: md`$\tau_{\text{rod}}/\tau_{\text{air}} = \mu/\mu_0 = \mu_r = 1 + \chi_m$.`,
        sub: md`$$L_{\text{air}} = \frac{(4\pi\times10^{-7})(${Nt})^2\,\pi(${rad / 100}\ \text{m})^2}{${len}\ \text{m}} = ${f(L0)}\ \text{H}, \qquad \tau_{\text{air}} = \frac{${f(L0)}\ \text{H}}{${Rr}\ \Omega} = ${f(tau0)}\ \text{s}$$`,
        ans: md`$L_{\text{air}} = ${f(L0)}$ H, $\tau_{\text{air}} = ${f(tau0)}$ s; $\mu_r = ${+(1 + chi).toFixed(4)}$, so $\chi_m = ${EM.p(chi)}$: ${KIND(chi)}.`,
        check: md`${kind === 0 ? md`A shorter $\tau$ means a smaller $L$: $\mu < \mu_0$, diamagnetic.` : kind === 1 ? md`A slightly longer $\tau$: $\mu$ a hair above $\mu_0$, paramagnetic.` : md`A $\tau$ hundreds of times longer: only a ferromagnet does that.`} With the rod, $\tau = ${f(tau0 * (1 + chi))}$ s.`,
      }),
    };
  };

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t13-materials'] = [
    Q(md`An atom's magnetic moment comes from…`,
      ['its electrons\' orbital motion and spin', 'its net charge', 'its electric dipole moment', 'the nucleus\'s charge at rest'], 0,
      [null, 'A neutral atom has no net charge, yet many atoms have moments.', 'An electric dipole makes $\\mathbf E$, not $\\mathbf B$.', 'Charge at rest makes no magnetic field; moving charge does.'],
      md`Each orbiting or spinning electron is a tiny current loop, $\mathbf m = IA\,\hat n$.`),
    Q(md`A dipole $\mathbf m = m_0\hat x$ sits in $\mathbf B = B_0\hat z$. The torque $\mathbf m\times\mathbf B$ is…`,
      ['$-m_0B_0\\hat y$', '$+m_0B_0\\hat y$', '$m_0B_0\\hat z$', '$0$'], 0,
      [null, 'Sign: $\\hat x\\times\\hat z = -\\hat y$.', 'The torque is perpendicular to both $\\mathbf m$ and $\\mathbf B$.', 'Only $\\mathbf m\\parallel\\mathbf B$ feels no torque.'],
      md`$m_0B_0(\hat x\times\hat z) = -m_0B_0\hat y$. A rotation about $-\hat y$ turns $\hat x$ toward $\hat z$: the moment swings toward $\mathbf B$.`),
    Q(md`An ordinary iron nail is not a magnet, although iron is ferromagnetic, because…`,
      ['its domains point in different directions and cancel', 'iron atoms carry no magnetic moment', 'its $\\chi_m$ is negative', 'its moments are too weak to align'], 0,
      [null, 'Iron atoms have large moments; that is why iron is ferromagnetic.', 'Iron\'s $\\chi_m$ is in the thousands.', 'Inside each domain they are fully aligned.'],
      md`Each domain is magnetized, but in random directions. An applied field lines the domains up; with remanence some alignment stays.`),
    Q(md`A superconductor expels magnetic flux, acting like $\chi_m = -1$. Inside it, $\mathbf B$ is…`,
      ['zero', '$\\mu_0\\mathbf H$', '$2\\mu_0\\mathbf H$', 'the same as outside'], 0,
      [null, 'That is $\\chi_m = 0$.', 'That is $\\chi_m = +1$.', 'The flux is expelled.'],
      md`$\mathbf B = \mu_0(1 + \chi_m)\mathbf H = 0$: a perfect diamagnet.`),
    Q(md`In a piece of iron, $H = 200$ A/m and $B = 1.0$ T. Its magnetization is about…`,
      ['$7.96\\times10^5$ A/m', '$200$ A/m', '$1.0$ T', '$3.98\\times10^3$ A/m'], 0,
      [null, 'That is $H$.', '$M$ is in A/m: $B/\\mu_0 - H$.', 'That is $\\mu_r = B/\\mu_0H$, which has no units.'],
      md`$M = B/\mu_0 - H = 7.958\times10^5 - 200 \approx 7.96\times10^5$ A/m; $\mu_r \approx 3980$. Nearly all of $B$ comes from the aligned moments.`),
    Q(md`Which kind of material can stay magnetized after the applied field is removed?`,
      ['ferromagnetic', 'paramagnetic', 'diamagnetic', 'all of them, weakly'], 0,
      [null, 'Paramagnetic alignment is undone by thermal motion as soon as $H$ is gone.', 'The diamagnetic response exists only while $H$ is applied.', 'Only ferromagnets have domains that stay aligned.'],
      md`Remanence needs domains that hold their alignment: iron, nickel, cobalt and their alloys.`),
    Q(md`$\mathbf M = M_0(x/\ell)\,\hat z$ inside a block. The bound volume current density is…`,
      ['$-\\dfrac{M_0}{\\ell}\\hat y$', '$+\\dfrac{M_0}{\\ell}\\hat y$', '$\\dfrac{M_0}{\\ell}\\hat z$', '$0$'], 0,
      [null, 'Sign: $(\\nabla\\times\\mathbf M)_y = \\partial_zM_x - \\partial_xM_z = -M_0/\\ell$.', 'A curl is perpendicular to the direction the field varies across, not along $\\mathbf M$.', '$\\mathbf M$ varies with $x$, so its curl is not zero.'],
      md`$\nabla\times(M_z\hat z) = \hat x\,\partial_yM_z - \hat y\,\partial_xM_z = -\frac{M_0}{\ell}\hat y$.`),
    Q(md`The same $B$ exists in the iron ($\mu_r = 1000$) of a magnetic circuit and in a thin air gap cut across it. The energy density $w_m = B^2/2\mu$ in the gap is…`,
      ['1000 times that in the iron', '1/1000 of that in the iron', 'the same', '$10^6$ times that in the iron'], 0,
      [null, 'At equal $B$, a larger $\\mu$ means less energy: $w_m = B^2/2\\mu$.', '$B$ is the same, but $\\mu$ is not.', 'Only one power of $\\mu$ enters.'],
      md`$w_m = \tfrac12\mu H^2 = B^2/2\mu$. With $B_n$ continuous across the gap, the gap holds $\mu_r$ times the energy per volume: inductors store their energy in the gap.`),
    Q(md`A field line crosses from air into aluminum ($\mu_r = 1.00002$). It…`,
      ['goes straight on, for all practical purposes', 'bends sharply toward the surface', 'bends sharply toward the normal', 'stops at the surface'], 0,
      [null, 'That happens entering iron, where $\\mu_r$ is huge.', 'A tiny $\\chi_m$ means a tiny bend.', 'Field lines never end: $B_n$ is continuous.'],
      md`$\tan\theta_2/\tan\theta_1 = \mu_2/\mu_1 = 1.00002$: no visible bend.`),
    Q(md`The boundary condition $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$ comes from…`,
      ['Ampère\'s law around a thin rectangle straddling the interface', 'Gauss\'s law for $\\mathbf B$ on a pillbox', 'Faraday\'s law', 'charge conservation'], 0,
      [null, 'The pillbox gives the normal component of $\\mathbf B$.', 'Faraday\'s law on a thin loop gives tangential $\\mathbf E$.', 'Continuity relates $\\rho$ and $\\mathbf J$.'],
      md`The thin loop's circulation of $\mathbf H$ picks up only the tangential jump, and it encloses only the free sheet current.`),
    Q(md`Below $z = 0$, $\mathbf H = 0$. A free sheet $\mathbf J_s = 4\,\hat x$ A/m lies on $z = 0$. Just above it, the tangential $\mathbf H$ is…`,
      ['$-4\\,\\hat y$ A/m', '$+4\\,\\hat y$ A/m', '$4\\,\\hat x$ A/m', '$-2\\,\\hat y$ A/m'], 0,
      [null, 'Sign: $\\mathbf J_s\\times\\hat n = 4\\hat x\\times\\hat z = -4\\hat y$.', 'The jump is perpendicular to $\\mathbf J_s$.', 'Half of $J_s$ is the field of a sheet alone in space, on each side. Here the whole jump sits above.'],
      md`$\mathbf H^+ = \mathbf H^- + \mathbf J_s\times\hat n = 0 + 4\hat x\times\hat z = -4\hat y$ A/m.`),
    Q(md`The magnetic counterpart of bound charge, $\rho_b = -\nabla\cdot\mathbf P$, is…`,
      ['the bound current $\\mathbf J_b = \\nabla\\times\\mathbf M$', '$\\nabla\\cdot\\mathbf M$', 'the free current $\\mathbf J$', 'magnetic charge'], 0,
      [null, 'Aligned loops make currents, which a curl describes.', 'Free current is driven from outside, not by the material\'s response.', 'There is no magnetic charge.'],
      md`Polarization leaves bound charge where $\mathbf P$ changes; magnetization leaves bound current where $\mathbf M$ curls, plus $\mathbf M\times\hat n$ on surfaces.`),
    Q(md`Which statement about susceptibilities is right?`,
      ['$\\chi_e$ is positive in every material; $\\chi_m$ can have either sign', 'both are always positive', 'both can be negative', '$\\chi_m$ is always positive; $\\chi_e$ can be negative'], 0,
      [null, 'Diamagnets have $\\chi_m < 0$.', 'Dielectrics always polarize along $\\mathbf E$.', 'It is the other way round.'],
      md`An applied $\mathbf E$ always pulls charges apart along itself. Induced current loops (diamagnetism) oppose $\mathbf H$, while permanent moments (para-, ferro-) align with it.`),
    Q(md`A nonconducting medium has $\mu_r = 4$ and $\epsilon_r = 1$. A plane wave in it travels at…`,
      ['$c/2$', '$c/4$', '$2c$', '$c$'], 0,
      [null, '$v_p = 1/\\sqrt{\\mu\\epsilon}$: the square root of 4, not 4.', 'A larger $\\mu$ slows the wave.', '$\\mu$ enters $v_p$ as much as $\\epsilon$ does.'],
      md`$v_p = c/\sqrt{\mu_r\epsilon_r} = c/2$ (Topic 16).`),
    Q(md`The SI unit of $\mu$ is…`,
      ['H/m', 'A/m', 'T', 'none'], 0,
      [null, 'That is $\\mathbf H$ and $\\mathbf M$.', 'That is $\\mathbf B$.', 'That is $\\mu_r$ and $\\chi_m$.'],
      md`$\mu_0 = 4\pi\times10^{-7}$ H/m; $B = \mu H$ gives (H/m)(A/m) = Wb/m² = T.`),
    Q(md`A copper rod fills a solenoid whose winding current runs counterclockwise seen from $+z$. The bound surface current on the rod runs…`,
      ['clockwise, and is tiny', 'counterclockwise, and is tiny', 'counterclockwise, and is strong', 'along the rod\'s axis'], 0,
      [null, 'That is a paramagnetic rod. Copper is diamagnetic, $\\chi_m < 0$.', 'That is a ferromagnetic rod.', '$\\mathbf M\\times\\hat n$ circulates around the axis.'],
      md`$\mathbf M = \chi_m\mathbf H$ points against $\mathbf H$, so $\mathbf M\times\hat r$ circulates against the winding, with $|\chi_m| \approx 10^{-5}$ of its strength.`),
    Q(md`A strong enough magnet can levitate a frog (mostly water, $\chi_m \approx -10^{-5}$). That works because…`,
      ['a diamagnet is pushed toward weaker field, which can balance gravity', 'water is paramagnetic', 'the frog carries a net charge', 'water turns ferromagnetic in strong fields'], 0,
      [null, 'Water\'s $\\chi_m$ is negative.', 'A static charge feels no force from a static $\\mathbf B$.', 'Water has no domains.'],
      md`The induced moments oppose the field, so the frog is pushed out of the strong-field region, upward against gravity.`),
    Q(md`Driving a ferromagnetic core harder and harder, its effective $\mu_r = B/\mu_0H$ eventually…`,
      ['falls: the domains are all aligned and $M$ stops growing', 'keeps growing', 'stays constant', 'becomes negative'], 0,
      [null, 'Once every domain is aligned, $M$ cannot grow.', 'That would be a linear material.', '$B$ still points along $H$.'],
      md`At saturation $M \to M_{\text{sat}}$, so $B = \mu_0(H + M_{\text{sat}})$ grows only as fast as in vacuum and $B/\mu_0H$ falls toward 1.`),
    Q(md`Flux runs around an iron ring and crosses a thin air gap cut across it. Compared with $B$ in the iron, $B$ in the gap is…`,
      ['about the same', '$\\mu_r$ times larger', '$\\mu_r$ times smaller', 'zero'], 0,
      [null, 'That would be $H$: $H$ in the gap is $\\mu_r$ times larger.', '$B_n$ is continuous across the gap faces.', 'The flux has to cross the gap; it cannot stop.'],
      md`The field crosses the gap faces normally, so $B$ carries across; $H = B/\mu_0$ in the gap is $\mu_r$ times its value in the iron.`),
    Q(md`On a hysteresis loop, the coercive field $H_c$ is…`,
      ['the reverse $H$ needed to bring $B$ back to zero', 'the $B$ left when $H$ returns to zero', 'the largest $B$ the material can reach', 'the $H$ at which the domains first form'], 0,
      [null, 'That is the remanence $B_r$.', 'That is saturation.', 'Domains exist already in unmagnetized iron.'],
      md`Hard magnets (permanent magnets) have a large $H_c$; soft iron (transformer cores) a small one.`),
  ];
})();

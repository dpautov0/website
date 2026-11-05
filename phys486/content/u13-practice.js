/* Unit 7 (Midterm 2): Practice midterms 1–5, exam level, in the exact format of the real Fall 2026 Midterm 1:
   three problems of 20 points, each four 5-point parts with a 5/4/3/2/1 rubric; the formulas a problem needs are
   printed in its statement; every exam has explain, sketch, decide-without-calculating and true-or-false-with-
   justification parts. One paper block per problem (setup once, a reveal per part), then a numbers check. */
(function () {
  'use strict';
  const { R, P } = C;
  const SQ = Math.sqrt, PI = Math.PI, EXP = Math.exp;

  // ------------------------------------------------------------------ helpers
  function herm(n, x) {
    if (n === 0) return 1;
    let a = 1, b = 2 * x;
    for (let k = 2; k <= n; k++) { const c = 2 * x * b - 2 * (k - 1) * a; a = b; b = c; }
    return b;
  }
  const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
  // oscillator stationary states in units of w = sqrt(hbar/m omega), argument xi = x/w
  const psi = (n, x) => herm(n, x) * EXP(-x * x / 2) / SQ(2 ** n * fact(n) * SQ(PI));

  // polar plot of an angular distribution: g(t) with t measured from the vertical axis (z); plane labels
  function polarFig(curves, xl, yl) {
    const f = PF.fig(), S = 72;
    f.axes(0, 0, { x: [-S * 1.3, S * 1.3], y: [-S * 1.3, S * 1.3], xl, yl });
    curves.forEach((c) => {
      const pts = [];
      for (let i = 0; i <= 360; i++) { const t = 2 * PI * i / 360, r = S * c.g(t); pts.push([r * Math.sin(t), -r * Math.cos(t)]); }
      f.pl(pts, { cls: 'curve ' + (c.cls || '') });
      if (c.lab) f.label(c.lx * S, -c.ly * S, c.lab, c.anchor || 'l', 'small');
    });
    return f.svg();
  }

  // rubric list; T/F rubric as on Midterm 1 (1 point for the verdict alone)
  const rub = (r) => `\n\n**Rubric (5 points)**\n\n${r.map((t, i) => `- **${5 - i}** ${t}`).join('\n')}`;
  const tf = (verdict) => rub([`${verdict}, with a correct and complete justification.`, 'Good reasoning attempt with one gap.', 'Fair reasoning attempt.', 'Some applicable thoughts.', 'Correct verdict, no justification.']);

  const paper = (n, k, pr) => ({
    t: 'paper',
    html: `<div class="pp-title"><span>PHYS 486 · Practice Midterm 2 · #${n}</span><span>Problem ${k} · 20 pts</span></div>`,
    head: pr.head, figs: pr.figs, items: pr.items,
  });

  const INTRO = md`
    **Exam level, in the real Midterm 1 format.** Three problems, 20 points each, every problem four parts of 5 points. Give yourself **75 minutes**, closed book, pen and paper. As on Midterm 1, the formulas a problem needs are printed in its statement; the ladder-operator algebra, bra-ket manipulation and the Born rule you bring yourself.

    **Write the reason next to every answer.** On Midterm 1 the class median was about 62%, and almost all lost points were on *explain*, *justify*, *sketch* and true-or-false parts (medians 30–50%), not on algebra. A sketch needs labeled axes and the features that matter (nodes, symmetry, where it is large). A true-or-false verdict with no reason earns 1 of 5 points.

    **Grading yourself.** Each part has a rubric written like the real one: **5** everything including the justification; **4** one real flaw (a justification only asserted, a sketch wrong, a factor missing); **3** right structure, reasoning missing; **2** wrong approach; **1** little beyond the start. Aim for **48/60**. Redo every part that scored below 4 a day later without looking.
  `;

  const score = (topics) => R(md`
    ### Score yourself

    Add up the rubric scores (out of 60). **50 or more:** well above the Midterm 1 median; go to the next exam. **40–49:** redo the parts you lost points on tomorrow, then continue. **Below 40:** reread the topics below, then retry this exam in two days.

    Topics used: ${topics}
  `);

  const exam = (n, focus, probs, check, topics) => ({
    id: `m2-pm${n}`, title: `Practice midterm ${n}`, sub: 'exam level', kind: 'mock',
    steps: [R(INTRO), R(focus), ...probs.map((pr, k) => paper(n, k + 1, pr)), R(md`### Check your numbers`),
      P(Object.assign({ title: `Practice midterm ${n}: key numbers` }, check)), score(topics)],
  });

  // ------------------------------------------------------------------ figures
  const W = '\\xi';
  const figPM = PF.plot({
    w: 360, h: 220, x: [-3.4, 3.4], y: [-0.45, 0.95], zero: true, xl: W, xt: [[0, '0']],
    curves: [
      { f: (x) => (psi(0, x) + psi(1, x)) / SQ(2), lab: '\\langle x|+\\rangle', labAt: 1.25 },
      { f: (x) => (psi(0, x) - psi(1, x)) / SQ(2), cls: 'dash', lab: '\\langle x|-\\rangle', labAt: -2.6, dy: -14 },
    ],
  });
  const figVeffOsc = PF.plot({
    w: 360, h: 240, x: [0, 3.4], y: [0, 7], xl: 'r/w', yl: 'V_{\\text{eff}}/\\hbar\\omega',
    xt: [[1.189, '1.19'], [1.565, '1.57']], yt: [[SQ(2), '\\sqrt2'], [SQ(6), '\\sqrt6']],
    curves: [0, 1, 2].map((l) => ({ f: (r) => 0.5 * r * r + l * (l + 1) / (2 * r * r), from: 0.04, lab: `\\ell = ${l}`, labAt: [2.7, 0.62, 0.9][l], cls: ['', 'dash', 'dim'][l] })),
    pts: [{ x: 1.189, y: SQ(2) }, { x: 1.565, y: SQ(6) }],
  });
  const figHalf = PF.plot({
    w: 340, h: 260, x: [-0.4, 3.7], y: [0, 5.4], xl: W, yl: 'E/\\hbar\\omega',
    xt: [[0, '0'], [SQ(3), '\\sqrt3'], [SQ(7), '\\sqrt7']], yt: [[1.5, '\\tfrac32'], [3.5, '\\tfrac72']],
    hlines: [[1.5, ''], [3.5, '']],
    curves: [
      { f: (x) => 0.5 * x * x, from: 0, cls: 'dim' }, { pts: [[0, 0], [0, 5.4]], cls: 'dim' },
      { f: (x) => 1.5 + 0.9 * SQ(2) * psi(1, x), from: 0, lab: '\\varphi_0', labAt: 3.3, dy: -10 },
      { f: (x) => 3.5 + 0.9 * SQ(2) * psi(3, x), from: 0, lab: '\\varphi_1', labAt: 3.3, dy: -10 },
    ],
  });
  const figPolarL1 = Object.assign(PF.row([
    { svg: polarFig([{ g: (t) => Math.cos(t) ** 2, lab: '|Y_1^0|^2', lx: 0.25, ly: 0.95 }, { g: (t) => Math.sin(t) ** 2, cls: 'dash', lab: '|Y_1^1|^2', lx: 0.75, ly: 0.55 }], 'x', 'z'), cap: 'Slice through the $xz$ plane. $|Y_1^1|^2 \\propto \\sin^2\\theta$ is a doughnut around $z$, seen edge-on.' },
    { svg: polarFig([{ g: () => 0.5, cls: 'dash', lab: '|Y_1^1|^2', lx: 0.42, ly: 0.62 }, { g: (t) => Math.sin(t) ** 2, lab: '|x/r|^2', lx: 0.7, ly: -0.55 }], 'x', 'y'), cap: 'Slice through the $xy$ plane (seen from above). The doughnut is a ring; the $L_x = 0$ state is a dumbbell along $x$.' },
  ]), { cap: '' });
  const figYll = polarFig([
    { g: (t) => Math.sin(t) ** 2, cls: 'dash', lab: '\\ell = 1', lx: 0.55, ly: 0.75 },
    { g: (t) => Math.abs(Math.sin(t)) ** 12, lab: '\\ell = 6', lx: 0.95, ly: 0.32 },
  ], 'x', 'z');
  const figHr = PF.plot({
    w: 360, h: 220, x: [0, 6], y: [0, 0.62], xl: 'r/a', yl: 'a\\,P(r)',
    xt: [[1, '1'], [1.5, '\\tfrac32'], [2, '2'], [4, '4']],
    curves: [{ f: (r) => 4 * r * r * EXP(-2 * r) }],
    vlines: [[2, '']],
    pts: [{ x: 1, y: 4 * EXP(-2), lab: 'r_{\\rm mp} = a' }],
  });
  const figPhase = (() => {
    const f = PF.fig(), S = 34, L = 3.1 * S;
    f.axes(0, 0, { x: [-L, L], y: [-L, L], xl: '\\langle x\\rangle', yl: '\\langle p\\rangle' });
    f.circle(0, 0, 2 * S, { cls: 'dim dash' });
    [[0, 't = 0', 'r'], [90, 't = 3T/4', 't'], [180, 't = T/2', 'l'], [270, 't = T/4', 'b']].forEach(([a, lab, at]) => {
      const cx = 2 * S * Math.cos(a * PI / 180), cy = -2 * S * Math.sin(a * PI / 180);
      f.circle(cx, cy, 0.5 * S, { cls: 'curve' });
      f.dot(cx, cy, 2.2);
      f.tag(cx, cy, lab, at, 0.5 * S + 6);
    });
    f.arc(0, 0, 2 * S, 40, 15, { arrow: 'end', cls: 'thick' });
    return f.svg();
  })();
  const figTop = PF.plot({
    w: 360, h: 250, x: [-0.5, 1.05], y: [0, 6.6], xl: '\\varepsilon', yl: 'E/(\\hbar^2/2I)', zero: false,
    vlines: [[0, '']], xt: [[0, '0'], [1, '1']], yt: [[2, '2'], [6, '6']],
    curves: [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1], [2, 2]].map(([l, m]) => ({
      f: (e) => l * (l + 1) - e * m * m / (1 + e), from: -0.5, to: 1, cls: m === 0 ? 'dim' : m === 1 ? '' : 'dash',
      lab: l === 0 ? '' : `\\ell${l},\\,|m|${m}`, labAt: 1, dy: m === 0 ? -9 : 2,
    })),
  });
  const figBreathe = PF.plot({
    w: 360, h: 220, x: [-3.6, 3.6], y: [0, 0.92], xl: W, xt: [[0, '0']],
    curves: [
      { f: (x) => 0.5 * (psi(0, x) - psi(2, x)) ** 2, lab: 't = 0', labAt: 0.45, dy: -12 },
      { f: (x) => 0.5 * (psi(0, x) + psi(2, x)) ** 2, cls: 'dash', lab: 't = \\pi/2\\omega', labAt: 1.9, dy: -12 },
    ],
  });

  // ================================================================== Practice midterm 1
  const pm1 = exam(1, md`**This exam:** the oscillator's two lowest states treated as a qubit (Midterm 1 Problem 1, moved to the oscillator), measuring $L_z$ and $L^2$ on the sphere (Midterm 1 Problem 2, moved to 3D), and the effective potential with two true-or-false parts.`, [
    {
      head: md`
        **1  The harmonic oscillator as a two-level system** [20 points, 5 per part]

        A particle of mass $m$ moves in $V(x) = \tfrac12m\omega^2x^2$. Its stationary states $\ket n$ have energies $E_n = \hbar\omega\left(n + \tfrac12\right)$, and
        $$\hat x = \sqrt{\frac{\hbar}{2m\omega}}\left(\hat a_+ + \hat a_-\right),\qquad \hat p = i\sqrt{\frac{\hbar m\omega}{2}}\left(\hat a_+ - \hat a_-\right),\qquad \hat a_+\ket n = \sqrt{n+1}\ket{n+1},\qquad \hat a_-\ket n = \sqrt n\ket{n-1}.$$
        With $\xi = \sqrt{m\omega/\hbar}\,x$: $\psi_0(x) = \left(\tfrac{m\omega}{\pi\hbar}\right)^{1/4}e^{-\xi^2/2}$ and $\psi_1(x) = \left(\tfrac{m\omega}{\pi\hbar}\right)^{1/4}\sqrt2\,\xi\,e^{-\xi^2/2}$. You may use $\int_0^\infty\xi e^{-\xi^2}d\xi = \tfrac12$.

        At $t = 0$ the particle is in $\ket{\Psi(0)} = \tfrac{1}{\sqrt2}\left(\ket0 + \ket1\right)$.
      `,
      items: [
        {
          q: md`**(a)** Find $\langle x\rangle(t)$ and $\langle p\rangle(t)$ using only the ladder operators (no integrals). Check that your result obeys Ehrenfest's theorem, $d\langle x\rangle/dt = \langle p\rangle/m$.`,
          ans: md`$\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\cos\omega t$, $\langle p\rangle = -\sqrt{\tfrac{\hbar m\omega}{2}}\sin\omega t$; $m\,\tfrac{d\langle x\rangle}{dt} = -m\omega\sqrt{\tfrac{\hbar}{2m\omega}}\sin\omega t = \langle p\rangle$ ✓.`,
          sol: md`
            **How to see it.** $\hat x$ and $\hat p$ only connect $\ket n$ to $\ket{n\pm1}$, so their averages are pure interference between $\ket0$ and $\ket1$, and they oscillate at the beat frequency $(E_1 - E_0)/\hbar = \omega$.

            Each stationary state takes its own phase: $\ket{\Psi(t)} = \tfrac{1}{\sqrt2}e^{-i\omega t/2}\left(\ket0 + e^{-i\omega t}\ket1\right)$. The global phase cancels in every average.

            $\hat a_-\ket{\Psi(t)} = \tfrac{1}{\sqrt2}e^{-i\omega t/2}e^{-i\omega t}\ket0$, so $\langle\hat a_-\rangle = \tfrac12e^{-i\omega t}$ and $\langle\hat a_+\rangle = \langle\hat a_-\rangle^* = \tfrac12e^{i\omega t}$. Then
            $$\langle x\rangle = \sqrt{\frac{\hbar}{2m\omega}}\left(\tfrac12e^{i\omega t} + \tfrac12e^{-i\omega t}\right) = \sqrt{\frac{\hbar}{2m\omega}}\cos\omega t,\qquad \langle p\rangle = i\sqrt{\frac{\hbar m\omega}{2}}\left(\tfrac12e^{i\omega t} - \tfrac12e^{-i\omega t}\right) = -\sqrt{\frac{\hbar m\omega}{2}}\sin\omega t.$$
            Check: $m\omega\sqrt{\hbar/2m\omega} = \sqrt{\hbar m\omega/2}$, so $m\,d\langle x\rangle/dt = \langle p\rangle$ ✓. The particle starts at the right turning point of a small orbit and moves left.
          ` + rub(['Both averages from the ladder algebra, and the Ehrenfest check.', 'One sign or factor slip, or the check missing.', md`Right structure (only the $\ket0$–$\ket1$ cross term survives) but the time dependence wrong, e.g. one common phase for both states.`, md`Integrals attempted without result, or $\langle x\rangle = 0$ claimed.`, md`Only $\Psi(t)$ written down.`]),
        },
        {
          q: md`**(b)** Keep only the two states $\ket0 = (1, 0)^T$ and $\ket1 = (0, 1)^T$: a two-level system. Write the $2\times2$ matrices of $\hat H$ and $\hat x$ in this subspace and express them with Pauli matrices. Find $\langle\hat\sigma_x\rangle$, $\langle\hat\sigma_y\rangle$, $\langle\hat\sigma_z\rangle$ in $\ket{\Psi(t)}$ and describe the motion of the Bloch vector.`,
          ans: md`$H = \hbar\omega\begin{pmatrix}\tfrac12 & 0\\ 0 & \tfrac32\end{pmatrix} = \hbar\omega\,\mathbb 1 - \tfrac{\hbar\omega}{2}\sigma_z$; $x \to \sqrt{\tfrac{\hbar}{2m\omega}}\,\sigma_x$ (and $p \to \sqrt{\tfrac{\hbar m\omega}{2}}\,\sigma_y$). $\langle\sigma_x\rangle = \cos\omega t$, $\langle\sigma_y\rangle = -\sin\omega t$, $\langle\sigma_z\rangle = 0$: the Bloch vector goes around the equator at angular frequency $\omega$.`,
          sol: md`
            **How to see it.** In this subspace position is $\sigma_x$ and momentum is $\sigma_y$ (up to constants), and $\hat H$ is a $\sigma_z$ field. The oscillation of $\langle x\rangle$ *is* the qubit precession from Lecture 9.

            Matrix elements: $H_{00} = \tfrac12\hbar\omega$, $H_{11} = \tfrac32\hbar\omega$, off-diagonal 0. $x_{01} = x_{10} = \sqrt{\hbar/2m\omega}$ (from $\hat a_-\ket1 = \ket0$), $x_{00} = x_{11} = 0$. So $\hat x \to \sqrt{\hbar/2m\omega}\,\sigma_x$. Similarly $\hat a_+ - \hat a_- \to \begin{pmatrix}0 & -1\\ 1 & 0\end{pmatrix} = -i\sigma_y$, so $\hat p \to \sqrt{\hbar m\omega/2}\,\sigma_y$.

            With $c_0 = 1/\sqrt2$, $c_1 = e^{-i\omega t}/\sqrt2$ (dropping the global phase): $\langle\sigma_x\rangle = 2\,\text{Re}(c_0^*c_1) = \cos\omega t$, $\langle\sigma_y\rangle = 2\,\text{Im}(c_0^*c_1) = -\sin\omega t$, $\langle\sigma_z\rangle = |c_0|^2 - |c_1|^2 = 0$. Consistent with (a): $\langle x\rangle = \sqrt{\hbar/2m\omega}\cos\omega t$ and $\langle p\rangle = -\sqrt{\hbar m\omega/2}\sin\omega t$.

            The Bloch vector starts at $+x$ on the equator and precesses about $z$ (clockwise seen from $+z$) with angular frequency $\omega = (E_1 - E_0)/\hbar$.

            *Caveat:* these are the operators **projected** onto the subspace. The full $\hat x\ket1$ also contains $\sqrt2\ket2$; that piece never contributes to $\langle x\rangle$ in a state built from $\ket0, \ket1$ only, but it does contribute to $\langle x^2\rangle$.
          ` + rub(['Both matrices, their Pauli forms, the three averages, and the precession described.', 'One average wrong, or the Bloch motion not described.', md`Matrices right but no link to $\langle x\rangle$ or to the Bloch vector.`, md`$x$ given diagonal entries, or placed on the wrong elements.`, md`Only $\hat H$.`]),
        },
        {
          q: md`**(c)** Find the eigenvalues and eigenvectors $\ket\pm$ of $\hat\sigma_x$, and **sketch** $\braket{x|\pm}$. Show that the probability of finding the particle at $x > 0$ in the state $\ket+$ is $P_R = \tfrac12 + J$ with $J = \int_0^\infty\psi_0\psi_1\,dx$. Explain where the $\tfrac12$ comes from, and decide the sign of $J$ **without evaluating the integral**. Then evaluate $J$.`,
          ans: md`$\pm1$, $\ket\pm = \tfrac{1}{\sqrt2}(\ket0 \pm \ket1)$. $\braket{x|+}$ is lopsided to the right, $\braket{x|-}$ is its mirror image. The $\tfrac12$: each $\psi_n^2$ is even, so half of each normalization lies at $x > 0$. $J > 0$ because $\psi_0 > 0$ everywhere and $\psi_1 > 0$ for $x > 0$. $J = 1/\sqrt{2\pi} = 0.399$, $P_R = 0.899$.`,
          figs: { pm: { svg: figPM, cap: 'The eigenvectors of $\\sigma_x$ in position space, $\\xi = x/\\sqrt{\\hbar/m\\omega}$. Adding $\\psi_1$ (odd) to $\\psi_0$ (even) builds up one side and cancels the other.' } },
          sol: md`
            **How to see it.** $\psi_0$ is even and positive; $\psi_1$ is odd, positive for $x > 0$. Their sum piles up on the right and cancels on the left, their difference the reverse.

            $\sigma_x\ket\pm = \pm\ket\pm$ with $\ket\pm = \tfrac{1}{\sqrt2}(\ket0 \pm \ket1)$, so $\braket{x|\pm} = \tfrac{1}{\sqrt2}(\psi_0 \pm \psi_1)$:

            [[fig:pm]]

            $P_R = \int_0^\infty\tfrac12(\psi_0 + \psi_1)^2dx = \tfrac12\left[\int_0^\infty\psi_0^2 + \int_0^\infty\psi_1^2 + 2J\right]$. Every $\psi_n$ has definite parity, so $\psi_n^2$ is even and $\int_0^\infty\psi_n^2 = \tfrac12$: $P_R = \tfrac12\left(\tfrac12 + \tfrac12\right) + J = \tfrac12 + J$. Sign: the integrand $\psi_0\psi_1 > 0$ on $x > 0$, so $J > 0$ and $P_R > \tfrac12$.

            Value: with $dx = \sqrt{\hbar/m\omega}\,d\xi$, $J = \tfrac{\sqrt2}{\sqrt\pi}\int_0^\infty\xi e^{-\xi^2}d\xi = \tfrac{1}{\sqrt{2\pi}} = 0.399$. So $\ket+$ is on the right 90% of the time: mostly, not entirely.
          ` + rub(['Eigenpairs, a correct mirror-image sketch, the ½ explained by parity, the sign of J argued.', md`Sketch symmetric or the two states swapped, or the $\tfrac12$ only asserted.`, md`Eigenpairs right, $P_R$ not set up.`, md`Eigenvalues wrong, or $\braket{x|\pm}$ never formed.`, 'Eigenvalues only.']),
        },
        {
          q: md`**(d)** Use (b) and (c) to give a physical interpretation of $\hat\sigma_x$ for this particle and of $\langle\hat\sigma_x\rangle(t)$. Find $P_R(t)$, the probability of finding the particle at $x > 0$ at time $t$, without a new integral. Finally, a friend says "$\hat\sigma_x$ *is* the observable 'is the particle at $x > 0$?'". Is that right? Justify.`,
          ans: md`$\sigma_x = +1$ means "lopsided right", $-1$ "lopsided left"; $\langle\sigma_x\rangle = \cos\omega t$ tracks $\langle x\rangle$: the particle sloshes right → left → right with period $2\pi/\omega$. $P_R(t) = \tfrac12 + J\cos\omega t$. The friend is wrong: "is $x > 0$?" is the step function $\Theta(\hat x)$, whose eigenstates are not in the two-level subspace; projected onto it, it is $\tfrac12\mathbb 1 + J\sigma_x$, not $\sigma_x$.`,
          sol: md`
            **How to see it.** This is Midterm 1 Problem 1(d) in the oscillator: $\sigma_x$ asks "left or right?" in the coarse two-level language.

            **Interpretation.** The $\sigma_x$ eigenstates are the right-heavy and left-heavy states of (c), and $\langle x\rangle = \sqrt{\hbar/2m\omega}\,\langle\sigma_x\rangle$: $\langle\sigma_x\rangle$ starts at $+1$ (right), passes 0 at $t = \pi/2\omega$, reaches $-1$ (left) at $t = \pi/\omega$.

            **$P_R(t)$.** The $\psi_n$ are real, so $|\Psi(x,t)|^2 = \tfrac12\left[\psi_0^2 + \psi_1^2 + 2\psi_0\psi_1\cos\omega t\right]$ and $P_R(t) = \tfrac12 + J\cos\omega t$: from 0.899 down to 0.101 and back.

            **The friend.** "Is the particle at $x > 0$?" is the operator $\Theta(\hat x)$ (multiply by the step function), eigenvalues 1 and 0. Its eigenfunctions are functions that vanish on one side, which are not combinations of $\psi_0$ and $\psi_1$ only. In the subspace, its matrix is $\bra0\Theta\ket0 = \bra1\Theta\ket1 = \tfrac12$, $\bra0\Theta\ket1 = J$, i.e. $\tfrac12\mathbb 1 + J\sigma_x$. So $\sigma_x = +1$ does not guarantee $x > 0$ (10% of the time it isn't), and a real "right side" measurement leaves the state cut off at $x = 0$, which contains all the $\ket n$.
          ` + rub(['Interpretation, $P_R(t)$, and a correct reason the friend is wrong.', md`One of the three weak (e.g. agrees with the friend, but $P_R(t)$ and the interpretation are right).`, md`$P_R(t)$ right, no interpretation.`, md`$P_R$ time-independent or oscillating at the wrong frequency.`, 'Little progress.']),
        },
      ],
    },
    {
      head: md`
        **2  Measuring $L_z$ and $L^2$ on the sphere** [20 points, 5 per part]

        A particle's state depends only on the angles $\theta, \varphi$, with inner product $\braket{f|g} = \int f^*g\,\sin\theta\,d\theta\,d\varphi$. The $z$ component of angular momentum is $\hat L_z = -i\hbar\,\partial/\partial\varphi$. The spherical harmonics $Y_\ell^m$ satisfy $\hat L^2Y_\ell^m = \hbar^2\ell(\ell+1)Y_\ell^m$ and $\hat L_zY_\ell^m = \hbar mY_\ell^m$; for $\ell \le 2$:
        $$Y_0^0 = \frac{1}{\sqrt{4\pi}},\qquad Y_1^0 = \sqrt{\frac{3}{4\pi}}\cos\theta,\qquad Y_1^{\pm1} = \mp\sqrt{\frac{3}{8\pi}}\sin\theta\,e^{\pm i\varphi},$$
        $$Y_2^0 = \sqrt{\frac{5}{16\pi}}\left(3\cos^2\theta - 1\right),\qquad Y_2^{\pm1} = \mp\sqrt{\frac{15}{8\pi}}\sin\theta\cos\theta\,e^{\pm i\varphi},\qquad Y_2^{\pm2} = \sqrt{\frac{15}{32\pi}}\sin^2\theta\,e^{\pm2i\varphi}.$$
      `,
      items: [
        {
          q: md`**(a)** Show that any function $g(\theta)e^{im\varphi}$ is an eigenfunction of $\hat L_z$, and explain why $m$ must be an integer. Is $f_1 = \sin\theta\cos\varphi$ an eigenfunction of $\hat L_z$? Of $\hat L^2$? Justify using the table (no $\theta$-derivatives needed).`,
          ans: md`$\hat L_z(ge^{im\varphi}) = \hbar m\,ge^{im\varphi}$; single-valuedness, $e^{im\cdot2\pi} = 1$, forces $m \in \mathbb Z$. $f_1 = \sqrt{2\pi/3}\left(Y_1^{-1} - Y_1^1\right)$: **not** an $\hat L_z$ eigenfunction (mixes $m = \pm1$), but **is** an $\hat L^2$ eigenfunction with $2\hbar^2$ (both terms have $\ell = 1$).`,
          sol: md`
            **How to see it.** $\hat L_z$ only touches $\varphi$: it is the ring operator of Midterm 1 Problem 2 ($\hat Q = i\,d/d\varphi = -\hat L_z/\hbar$), with $g(\theta)$ along for the ride.

            $-i\hbar\,\partial_\varphi\left(g(\theta)e^{im\varphi}\right) = -i\hbar(im)ge^{im\varphi} = \hbar m\,ge^{im\varphi}$. The wavefunction must be single-valued: $\varphi$ and $\varphi + 2\pi$ are the same point, so $e^{2\pi im} = 1$ and $m$ is an integer.

            $\cos\varphi = \tfrac12(e^{i\varphi} + e^{-i\varphi})$, and from the table $Y_1^{-1} - Y_1^1 = 2\sqrt{3/8\pi}\sin\theta\cos\varphi$. So $f_1 = \sqrt{2\pi/3}(Y_1^{-1} - Y_1^1)$: two different $m$, so not an $L_z$ eigenfunction; one $\ell$, so an $L^2$ eigenfunction with $\hbar^2\cdot1\cdot2 = 2\hbar^2$. (It is $x/r$: the $p_x$ orbital.)
          ` + rub(['Eigen-equation, the periodicity argument, both verdicts with reasons.', 'One verdict missing, or periodicity not stated.', 'Only the eigen-equation.', md`Claims $\sin\theta\cos\varphi$ is an $L_z$ eigenfunction ($\cos\varphi$ is not $e^{im\varphi}$).`, 'Little progress.']),
        },
        {
          q: md`**(b)** At $t = 0$ the state is $f(\theta, \varphi) = A\sin^2\theta\cos^2\varphi$ (which is $A\,x^2/r^2$). **Without normalizing and without any $\theta$-integral**, find the possible outcomes of an $\hat L_z$ measurement and their probabilities, $\langle L_z\rangle$, and $\sigma_{L_z}$. Explain why the $\theta$-dependence doesn't matter here.`,
          ans: md`$L_z = 0$ with $\tfrac23$, $\pm2\hbar$ with $\tfrac16$ each. $\langle L_z\rangle = 0$, $\sigma_{L_z} = 2\hbar/\sqrt3 \approx 1.15\hbar$. Every term carries the same $\sin^2\theta$, so the common $\theta$-integral cancels in the ratios.`,
          sol: md`
            **How to see it.** $\cos^2\varphi = \tfrac14\left(e^{2i\varphi} + 2 + e^{-2i\varphi}\right)$: exactly the ring state of Midterm 1, so the answer is the same.

            $f = \tfrac A4\sin^2\theta\left(e^{2i\varphi} + 2 + e^{-2i\varphi}\right)$. Each term is an $L_z$ eigenfunction ($m = 2, 0, -2$) and they are orthogonal (different $m$). Each has the same $\theta$ factor, so each term's norm is $|\text{coefficient}|^2\times\int\sin^4\theta\sin\theta\,d\theta\cdot2\pi$, the same integral for all three: the probabilities are in the ratio $1 : 4 : 1$, i.e. $P(0) = \tfrac23$, $P(\pm2\hbar) = \tfrac16$.

            $\langle L_z\rangle = 0$ by symmetry. $\langle L_z^2\rangle = 4\hbar^2\left(\tfrac16 + \tfrac16\right) = \tfrac43\hbar^2$, so $\sigma_{L_z} = \tfrac{2}{\sqrt3}\hbar$.
          ` + rub(['Outcomes, probabilities, the average, σ, and the reason θ drops out.', md`Probabilities unnormalized ($\tfrac12, \tfrac14, \tfrac14$) or $\sigma$ missing.`, md`Expansion right but outcomes given as $\pm\hbar$.`, md`Treats $f$ as an $L_z$ eigenstate.`, 'Little progress.']),
        },
        {
          q: md`**(c)** Now find the possible outcomes of an $\hat L^2$ measurement in the same state, their probabilities, and $\langle L^2\rangle$. *Hint:* $\sin^2\theta = \tfrac23 - \tfrac13\left(3\cos^2\theta - 1\right)$.`,
          ans: md`$L^2 = 0$ with $\tfrac59$, $L^2 = 6\hbar^2$ with $\tfrac49$; $\langle L^2\rangle = \tfrac83\hbar^2$.`,
          sol: md`
            **How to see it.** $x^2/r^2$ is its average over all directions ($\tfrac13$, an $\ell = 0$ piece) plus a part that averages to zero ($\ell = 2$). $L^2$ sorts these two.

            $\sin^2\theta\cos^2\varphi = \tfrac12\sin^2\theta + \tfrac14\sin^2\theta\left(e^{2i\varphi} + e^{-2i\varphi}\right) = \tfrac13 - \tfrac16\left(3\cos^2\theta - 1\right) + \tfrac14\sin^2\theta\left(e^{2i\varphi} + e^{-2i\varphi}\right)$. In the table's functions:
            $$\frac fA = \frac{\sqrt{4\pi}}{3}Y_0^0 - \frac16\sqrt{\frac{16\pi}{5}}\,Y_2^0 + \frac14\sqrt{\frac{32\pi}{15}}\left(Y_2^2 + Y_2^{-2}\right).$$
            Squared coefficients: $\tfrac{4\pi}{9}$, $\tfrac{4\pi}{45}$, $\tfrac{2\pi}{15}$, $\tfrac{2\pi}{15}$, total $\tfrac{4\pi}{5}$. So $P(Y_0^0) = \tfrac59$, $P(Y_2^0) = \tfrac19$, $P(Y_2^{\pm2}) = \tfrac16$ each.

            $L^2 = 0$: $\tfrac59$. $L^2 = 6\hbar^2$: $\tfrac19 + \tfrac16 + \tfrac16 = \tfrac49$. $\langle L^2\rangle = 6\hbar^2\cdot\tfrac49 = \tfrac83\hbar^2$. Check against (b): $P(L_z = 0) = \tfrac59 + \tfrac19 = \tfrac23$ ✓.
          ` + rub(['Correct expansion, both probabilities, the average.', 'One coefficient slip carried through consistently.', md`Recognizes $\ell \in \{0, 2\}$ but no probabilities.`, md`Claims only $\ell = 2$ (or $\ell = 1$) appears.`, 'Little progress.']),
        },
        {
          q: md`**(d)** A measurement of $\hat L^2$ gives $6\hbar^2$. Immediately afterwards $\hat L_z$ is measured. Find the outcome probabilities. $P(L_z = 0)$ is different from (b): explain how that can be, given that $[\hat L^2, \hat L_z] = 0$.`,
          ans: md`$P(0) = \tfrac14$, $P(\pm2\hbar) = \tfrac38$ each. Measuring $L^2$ doesn't scramble the $(\ell, m)$ content; getting $6\hbar^2$ *selects* the $\ell = 2$ part, which removes the $\ell = 0$ piece (all of it $m = 0$). Averaged over both $L^2$ results, $P(L_z = 0)$ is still $\tfrac59\cdot1 + \tfrac49\cdot\tfrac14 = \tfrac23$.`,
          sol: md`
            **How to see it.** Compatible means the measurement of one doesn't reshuffle the other's labels. It can still *tell you something* (which $\ell$ you are in), and conditioning on that changes the odds.

            After the result $6\hbar^2$ the state is the $\ell = 2$ part, renormalized: weights $\tfrac19 : \tfrac16 : \tfrac16$ out of $\tfrac49$, so $P(L_z = 0) = \tfrac{1/9}{4/9} = \tfrac14$ and $P(L_z = \pm2\hbar) = \tfrac{1/6}{4/9} = \tfrac38$ each.

            The joint distribution $P(\ell, m)$ is untouched by the $L^2$ measurement. If you ignore its result, $P(L_z = 0) = P(\ell=0)\cdot1 + P(\ell=2)\cdot\tfrac14 = \tfrac23$, exactly as in (b). The change comes from keeping only the runs that gave $6\hbar^2$. Contrast an *incompatible* pair: measuring $L_x$ in between would change the $m$-distribution itself.
          ` + rub(['Projected state, probabilities, and the conditioning explanation.', 'Probabilities right, explanation vague.', md`Keeps the $\ell = 0$ term ($\tfrac23, \tfrac16, \tfrac16$) but explains compatibility.`, 'Claims commuting observables cannot change any probability, and stops.', 'Little progress.']),
        },
      ],
    },
    {
      head: md`
        **3  The effective potential** [20 points, 5 per part]

        A particle of mass $m$ moves in the central potential $V(r) = \tfrac12m\omega^2r^2$. With $\psi = R(r)Y_\ell^m(\theta,\varphi)$ and $u = rR$, the radial equation is
        $$-\frac{\hbar^2}{2m}\frac{d^2u}{dr^2} + V_{\text{eff}}(r)\,u = Eu,\qquad V_{\text{eff}}(r) = V(r) + \frac{\hbar^2\ell(\ell+1)}{2mr^2},\qquad u(0) = 0,$$
        and $|u|^2dr$ is the probability of finding the particle between $r$ and $r + dr$. The exact energies are $E = \hbar\omega\left(2k + \ell + \tfrac32\right)$, $k = 0, 1, 2, \dots$ Use $w = \sqrt{\hbar/m\omega}$.
      `,
      items: [
        {
          q: md`**(a)** **Sketch** $V_{\text{eff}}$ for $\ell = 0, 1, 2$ on the same axes. For $\ell \ge 1$ find the position $r_{\min}$ and the value $V_{\text{eff}}(r_{\min})$ of the minimum. How do they change with $\ell$?`,
          ans: md`$r_{\min} = [\ell(\ell+1)]^{1/4}w$, $V_{\text{eff}}(r_{\min}) = \hbar\omega\sqrt{\ell(\ell+1)}$: $\ell = 1$: $1.19w$, $1.41\hbar\omega$; $\ell = 2$: $1.57w$, $2.45\hbar\omega$. The minimum moves out and up with $\ell$.`,
          figs: { veff: { svg: figVeffOsc, cap: 'Effective potentials of the 3D oscillator. For $\\ell \\ge 1$ the centrifugal wall $\\propto 1/r^2$ dominates near the origin; dots mark the minima.' } },
          sol: md`
            **How to see it.** Two competing terms: a spring pulling in ($\propto r^2$) and a centrifugal wall pushing out ($\propto 1/r^2$). The minimum is where they balance, and there the two are equal.

            $\dfrac{dV_{\text{eff}}}{dr} = m\omega^2r - \dfrac{\hbar^2\ell(\ell+1)}{mr^3} = 0 \Rightarrow r_{\min}^4 = \dfrac{\ell(\ell+1)\hbar^2}{m^2\omega^2}$, so $r_{\min} = [\ell(\ell+1)]^{1/4}w$. At $r_{\min}$ the two terms are equal, so $V_{\text{eff}} = m\omega^2r_{\min}^2 = \hbar\omega\sqrt{\ell(\ell+1)}$.

            [[fig:veff]]

            $\ell = 0$: the plain parabola from 0. $\ell \ge 1$: $+\infty$ at the origin, one minimum, then the parabola. (Compare Coulomb, Discussion 8: there the minimum moves out and gets *shallower*; here it moves out and gets *higher*, roughly $\hbar\omega\ell$.)
          ` + rub(['Correct sketch (wall at the origin for ℓ ≥ 1, plain parabola for ℓ = 0), r_min, V_eff(r_min), the trend.', 'Sketch right, one formula wrong.', 'Sketch only.', md`Sketch shows $V_{\text{eff}}$ finite at $r = 0$ for $\ell \ge 1$.`, 'Little progress.']),
        },
        {
          q: md`**(b)** Check that the lowest $\ell = 1$ and $\ell = 2$ levels lie above the minima you found, and explain why every energy eigenvalue must lie **strictly** above the minimum of $V_{\text{eff}}$. Then, **without calculating**, explain why the lowest level of each $\ell$ rises with $\ell$.`,
          ans: md`$\tfrac52\hbar\omega > \sqrt2\hbar\omega = 1.41\hbar\omega$; $\tfrac72\hbar\omega > \sqrt6\hbar\omega = 2.45\hbar\omega$. $E = \tfrac{\hbar^2}{2m}\int|u'|^2dr + \int V_{\text{eff}}|u|^2dr$, and the first term is positive. The centrifugal term is a positive addition to the potential that grows with $\ell$.`,
          sol: md`
            **How to see it.** A particle can't sit at the bottom of a well: that would need $u$ concentrated at one $r$, i.e. huge $u'$ and huge kinetic energy. Same zero-point physics as $\sigma_x\sigma_p \ge \hbar/2$.

            Lowest $\ell = 1$: $k = 0$, $E = \tfrac52\hbar\omega$ vs. minimum $1.41\hbar\omega$ ✓. Lowest $\ell = 2$: $\tfrac72\hbar\omega$ vs. $2.45\hbar\omega$ ✓.

            For a normalized eigenfunction, integrating by parts with $u(0) = 0$ and $u \to 0$ at infinity: $E = \tfrac{\hbar^2}{2m}\int_0^\infty|u'|^2dr + \int_0^\infty V_{\text{eff}}|u|^2dr > V_{\text{eff},\min}$. Strict because $u' = 0$ everywhere would make $u$ constant, i.e. zero.

            Rising with $\ell$: $\hat H_\ell = \hat H_0 + \tfrac{\hbar^2\ell(\ell+1)}{2mr^2}$, and the added term is positive. Take the lowest $\ell$ eigenfunction $u$: $E_\ell = \bra u\hat H_\ell\ket u > \bra u\hat H_0\ket u \ge E_{\text{lowest},\,\ell=0}$ (the same boundary conditions hold for every $\ell$, so $u$ is an allowed $\ell = 0$ trial function). The same argument compares any $\ell' < \ell$. Physically: at fixed angular momentum part of the energy is locked into rotation.
          ` + rub(['Both checks, the kinetic-energy argument, and the ℓ trend argued.', 'Checks right, one argument only asserted.', 'Checks only.', 'Claims E can equal the minimum.', 'Little progress.']),
        },
        {
          q: md`**(c)** True or false? To receive credit, give a brief justification. "For $\ell \ge 1$ the particle can never be found closer to the origin than the inner classical turning point $r_1$ (where $V_{\text{eff}}(r_1) = E$), because $V_{\text{eff}} \to \infty$ at $r = 0$."`,
          ans: md`**False.** $0 < r < r_1$ is classically forbidden but not empty: $u$ decays into the centrifugal barrier (as $r^{\ell+1}$ near the origin) instead of oscillating. The probability there is small but nonzero; only at $r = 0$ itself is $u = 0$.`,
          sol: md`
            Same physics as the tail of a finite well: in a forbidden region ($V_{\text{eff}} > E$), $u'' = \tfrac{2m}{\hbar^2}(V_{\text{eff}} - E)u$ has the sign of $u$, so $u$ curves away from the axis and decays, but it is not zero. $\int_0^{r_1}|u|^2dr > 0$: the particle tunnels into the barrier. The infinite value of $V_{\text{eff}}$ only at $r = 0$ forces $u(0) = 0$, not $u = 0$ on a whole interval.
          ` + tf('False'),
        },
        {
          q: md`**(d)** True or false? Justify. "Because $V_{\text{eff}}$ depends on $\ell$ but not on $m$, every energy level of a central potential is exactly $(2\ell+1)$-fold degenerate."`,
          ans: md`**False.** $m$-independence guarantees *at least* $2\ell + 1$ states per level. Different $\ell$ can share an energy: here $E = \hbar\omega(2k + \ell + \tfrac32)$ gives $\tfrac72\hbar\omega$ for $(k, \ell) = (1, 0)$ and $(0, 2)$: $1 + 5 = 6$ states.`,
          sol: md`
            Rotational symmetry makes the $2\ell + 1$ values of $m$ degenerate, since the radial equation never sees $m$. It says nothing about different $\ell$, whose radial equations differ. For this oscillator, $2k + \ell$ is all that matters: $\ell = 0$ with $k = 1$ and $\ell = 2$ with $k = 0$ both give $\tfrac72\hbar\omega$, 6 states. (Check with Cartesian coordinates: $n_x + n_y + n_z = 2$ has 6 solutions.) This extra, "accidental" degeneracy comes from a hidden symmetry, like hydrogen's.
          ` + tf('False'),
        },
      ],
    },
  ], {
    q: md`Enter: 1(c) $J = \int_0^\infty\psi_0\psi_1\,dx$; 1(d) $P_R$ at $t = \pi/\omega$; 2(b) $P(L_z = 0)$; 2(c) $P(L^2 = 6\hbar^2)$; 3(a) $V_{\text{eff}}(r_{\min})/\hbar\omega$ for $\ell = 2$.`,
    parts: [
      { lbl: 'J', ans: 1 / SQ(2 * PI) },
      { lbl: md`P_R(\pi/\omega)`, ans: 0.5 - 1 / SQ(2 * PI) },
      { lbl: md`P(L_z=0)`, ans: 2 / 3 },
      { lbl: md`P(L^2=6\hbar^2)`, ans: 4 / 9 },
      { lbl: md`V_{\text{eff,min}}/\hbar\omega`, ans: SQ(6) },
    ],
    sol: md`$0.399$, $0.101$, $0.667$, $0.444$, $2.449$.`,
  }, md`[Topic 13: ladder operators](#/l/t13-ladder), [Topic 15: oscillator motion](#/l/t15-shomotion), [Topic 19: spherical harmonics and measuring L](#/l/t19-Ylm), [Topic 20: the radial equation](#/l/t20-radial).`);

  // ================================================================== Practice midterm 2
  const pm2 = exam(2, md`**This exam:** the half oscillator and what happens when its wall is pulled out, successive measurements of $L_z$ and $L_x$ with sketches of the angular distributions, and the spherical box with two true-or-false parts.`, [
    {
      head: md`
        **1  The half oscillator** [20 points, 5 per part]

        A particle of mass $m$ moves in $V(x) = \tfrac12m\omega^2x^2$ for $x > 0$ and $V = \infty$ for $x \le 0$. The **full** oscillator (same $m$, $\omega$, all $x$) has stationary states $\psi_n$ with $E_n = \hbar\omega(n + \tfrac12)$, $n$ nodes, and parity $\psi_n(-x) = (-1)^n\psi_n(x)$. With $\xi = \sqrt{m\omega/\hbar}\,x$ and $w = \sqrt{\hbar/m\omega}$:
        $$\psi_0 = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}e^{-\xi^2/2},\qquad \psi_1 = \left(\frac{m\omega}{\pi\hbar}\right)^{1/4}\sqrt2\,\xi\,e^{-\xi^2/2},\qquad \int_0^\infty\xi e^{-\xi^2}d\xi = \int_0^\infty\xi^3e^{-\xi^2}d\xi = \frac12.$$
        Ehrenfest: $\tfrac{d\langle x\rangle}{dt} = \tfrac{\langle p\rangle}{m}$, $\tfrac{d\langle p\rangle}{dt} = -\left\langle\tfrac{dV}{dx}\right\rangle$.
      `,
      items: [
        {
          q: md`**(a)** Find the stationary states and energies of the half oscillator from those of the full oscillator (normalization included). What are the ground-state energy and the level spacing? Explain physically why the ground-state energy is higher than $\tfrac12\hbar\omega$, although $V$ is unchanged for $x > 0$.`,
          ans: md`$\varphi_k = \sqrt2\,\psi_{2k+1}$ for $x > 0$, $0$ for $x \le 0$; $E_k = \hbar\omega(2k + \tfrac32)$. Ground state $\tfrac32\hbar\omega$, spacing $2\hbar\omega$. Squeezed into half the space: smaller $\sigma_x$, larger $\sigma_p$, more kinetic energy; the even states (including the $\tfrac12\hbar\omega$ one) don't vanish at the wall.`,
          sol: md`
            **How to see it.** For $x > 0$ the Schrödinger equation is the full oscillator's. The only new requirement is $\psi(0) = 0$ at the infinite wall.

            The odd $\psi_n$ vanish at $x = 0$ and so satisfy it; the even ones have $\psi_n(0) \ne 0$ and don't. (At an infinite wall $\psi'$ need not be continuous.) Half the probability is cut away, so the norm needs $\sqrt2$: $\int_0^\infty2\psi_{2k+1}^2dx = 1$ because $\psi_{2k+1}^2$ is even. Energies unchanged: $E = \tfrac32, \tfrac72, \tfrac{11}2, \dots\ \hbar\omega$.

            Physically: the wall confines the particle to $x > 0$, so $\sigma_x$ drops and by uncertainty $\sigma_p$ grows; more kinetic energy. The spacing doubles because every other state is gone.
          ` + rub(['States, √2, energies, spacing, and the physical reason.', 'Normalization missing, or the reason vague.', 'Picks the right states without saying why.', 'Keeps the even states, or all states.', 'Little progress.']),
        },
        {
          q: md`**(b)** **Sketch** the two lowest stationary states of the half oscillator, each drawn at the height of its energy, together with $V(x)$. Mark the classical turning points. How many nodes does each have at $x > 0$?`,
          ans: md`$\varphi_0 = \sqrt2\psi_1$: zero at the wall, one hump, no interior node, turning point $\sqrt3\,w$. $\varphi_1 = \sqrt2\psi_3$: one interior node (at $\xi = \sqrt{3/2}$), turning point $\sqrt7\,w$. Both decay beyond their turning points.`,
          figs: { half: { svg: figHalf, cap: 'The two lowest states of the half oscillator at their energies $\\tfrac32\\hbar\\omega$ and $\\tfrac72\\hbar\\omega$. Each is a full-oscillator state with its left half cut off.' } },
          sol: md`
            Turning points: $\tfrac12m\omega^2x^2 = \hbar\omega(n + \tfrac12)$ gives $x = w\sqrt{2n+1}$: $\sqrt3\,w$ for $n = 1$, $\sqrt7\,w$ for $n = 3$.

            [[fig:half]]

            Features to show: zero at the wall; curving toward the axis inside the allowed region and away from it (decaying) beyond the turning point; $\varphi_1$ has one node in $x > 0$ (the zero of $H_3 = 8\xi^3 - 12\xi$ at $\xi = \sqrt{3/2}$); larger wiggles near the turning points, where the particle is slow.
          ` + rub(['Both states at the right energies, nodes, turning points, decaying tails.', 'One feature wrong (nonzero at the wall, or no tail).', 'Shapes right, energies or turning points missing.', 'Draws even states (nonzero at x = 0).', 'Little progress.']),
        },
        {
          q: md`**(c)** The particle is in the ground state of the half oscillator when, at $t = 0$, the wall is suddenly removed: the wavefunction is unchanged by the removal, and afterwards $V = \tfrac12m\omega^2x^2$ for all $x$. The energy is measured right after. **Without evaluating any integral**, find the probability of $E = \tfrac32\hbar\omega$, and decide which other outcomes have zero probability. Then find $P(E = \tfrac12\hbar\omega)$.`,
          ans: md`$P(\tfrac32\hbar\omega) = \tfrac12$. All other odd-$n$ outcomes ($\tfrac72, \tfrac{11}2, \dots\ \hbar\omega$) have probability 0. $P(\tfrac12\hbar\omega) = \tfrac1\pi = 0.318$.`,
          sol: md`
            **How to see it.** The amplitude for $E_n$ is $c_n = \sqrt2\int_0^\infty\psi_n\psi_1\,dx$. When $\psi_n\psi_1$ is even (odd $n$), the half-line integral is half the full one, and the full one is fixed by orthogonality.

            - $n = 1$: $\sqrt2\cdot\tfrac12\int\psi_1^2 = \tfrac{1}{\sqrt2}$, so $P = \tfrac12$.
            - $n$ odd, $n \ne 1$: $\sqrt2\cdot\tfrac12\int\psi_n\psi_1 = 0$. Probability 0.
            - $n$ even: $\psi_n\psi_1$ is odd, so symmetry fixes nothing; these are generally nonzero.

            $c_0 = \sqrt2\int_0^\infty\psi_0\psi_1dx = \sqrt2\cdot\tfrac{\sqrt2}{\sqrt\pi}\int_0^\infty\xi e^{-\xi^2}d\xi = \tfrac{1}{\sqrt\pi}$, so $P(\tfrac12\hbar\omega) = \tfrac1\pi = 0.318$. The remaining $\tfrac12 - \tfrac1\pi = 0.18$ is spread over $n = 2, 4, \dots$ (one can show $P(\tfrac52\hbar\omega) = \tfrac{1}{2\pi}$).
          ` + rub(['P = ½ from parity, zero for odd n ≠ 1 justified, P(½ħω) = 1/π.', 'One of the three missing.', md`Right setup $c_n = \sqrt2\int_0^\infty\psi_n\psi_1$, no parity arguments.`, md`$\sqrt2$ missing, or claims the state is still an energy eigenstate.`, 'Little progress.']),
        },
        {
          q: md`**(d)** Find $\langle x\rangle(t)$ after the wall is removed. Explain in two sentences why the answer is exactly what a classical particle would do. Does the whole probability density also repeat with period $2\pi/\omega$? What does it look like at $t = \pi/\omega$?`,
          ans: md`$\langle x\rangle(t) = \tfrac{2w}{\sqrt\pi}\cos\omega t \approx 1.13\,w\cos\omega t$. For a harmonic force $\langle V'\rangle = m\omega^2\langle x\rangle$ exactly, so Ehrenfest is the classical equation; $\langle p\rangle(0) = 0$ because $\Psi(x,0)$ is real. Yes: all energies differ by multiples of $\hbar\omega$, so $|\Psi|^2$ repeats every $2\pi/\omega$; at $t = \pi/\omega$ it is the mirror image, all on the left.`,
          sol: md`
            **How to see it.** In a harmonic potential the center of the packet obeys Newton's law exactly, whatever the packet looks like.

            $\langle x\rangle(0) = 2\int_0^\infty x\psi_1^2dx = 2w\cdot\tfrac{2}{\sqrt\pi}\int_0^\infty\xi^3e^{-\xi^2}d\xi = \tfrac{2w}{\sqrt\pi}$.

            Ehrenfest: $\tfrac{d^2\langle x\rangle}{dt^2} = -\tfrac1m\langle m\omega^2x\rangle = -\omega^2\langle x\rangle$, no approximation, since $V'$ is linear in $x$. $\langle p\rangle(0) = -i\hbar\int\Psi\Psi'dx = -\tfrac{i\hbar}{2}\left[\Psi^2\right]_{-\infty}^\infty = 0$ for a real $\Psi$. So $\langle x\rangle = \tfrac{2w}{\sqrt\pi}\cos\omega t$.

            Shape: $\Psi(x,t) = \sum c_n\psi_ne^{-i(n+\frac12)\omega t}$. At $t = 2\pi/\omega$ every term gets $e^{-i\pi(2n+1)} = -1$: the same state. At $t = \pi/\omega$ the factor is $e^{-i\pi/2}(-1)^n$, and $\sum c_n(-1)^n\psi_n(x) = \sum c_n\psi_n(-x) = \Psi(-x, 0)$: the mirror image, sitting against where the wall was, on the left.
          ` + rub(['⟨x⟩(t) with amplitude, the Ehrenfest argument, ⟨p⟩(0) = 0 justified, the shape question.', 'One of these missing.', 'Right frequency, wrong amplitude or phase.', md`$\langle x\rangle$ constant, or frequency $2\omega$.`, 'Little progress.']),
        },
      ],
    },
    {
      head: md`
        **2  Successive measurements of angular momentum** [20 points, 5 per part]

        A beam of particles, each with wavefunction $R(r)Y(\theta,\varphi)$. The ladder operators $\hat L_\pm = \hat L_x \pm i\hat L_y$ act as
        $$\hat L_\pm\ket{\ell, m} = \hbar\sqrt{\ell(\ell+1) - m(m\pm1)}\,\ket{\ell, m\pm1},\qquad Y_1^0 = \sqrt{\frac{3}{4\pi}}\cos\theta,\qquad Y_1^{\pm1} = \mp\sqrt{\frac{3}{8\pi}}\sin\theta\,e^{\pm i\varphi}.$$
        A first measurement of $\hat L_z$ has selected the particles with $L_z = +\hbar$; they are all in $\ket{1,1}$ ($Y_1^1$). Use the basis $\left(\ket{1,1}, \ket{1,0}, \ket{1,-1}\right)$.
      `,
      items: [
        {
          q: md`**(a)** Write $\hat L_x$ as a $3\times3$ matrix in this basis. Without diagonalizing it, state its eigenvalues and justify.`,
          ans: md`$\hat L_x = \dfrac{\hbar}{\sqrt2}\begin{pmatrix}0 & 1 & 0\\ 1 & 0 & 1\\ 0 & 1 & 0\end{pmatrix}$; eigenvalues $\hbar, 0, -\hbar$: nothing singles out $z$, so the component along any axis has the $\ell = 1$ spectrum $m\hbar$, $m = -1, 0, 1$.`,
          sol: md`
            $\hat L_x = \tfrac12(\hat L_+ + \hat L_-)$. $\hat L_+\ket{1,0} = \sqrt2\hbar\ket{1,1}$, $\hat L_+\ket{1,-1} = \sqrt2\hbar\ket{1,0}$, and $\hat L_-$ is the mirror image. So the only nonzero elements are next to the diagonal, each $\tfrac12\sqrt2\hbar = \hbar/\sqrt2$.

            Eigenvalues: $L_x$ is $L_z$ in a rotated coordinate system, and rotations don't change $\ell$; so the possible values are again $\hbar, 0, -\hbar$. Check: $\det(L_x - \lambda) = -\lambda^3 + \lambda\hbar^2 = 0$ (trace 0, and the sum of the $2\times2$ minors is $-\hbar^2$).
          ` + rub(['Matrix and eigenvalues with the symmetry argument (or the characteristic polynomial).', md`Matrix with a wrong factor (e.g. $\hbar$ instead of $\hbar/\sqrt2$), eigenvalues right.`, 'Matrix right, eigenvalues asserted without reason.', md`Matrix diagonal, or uses $L_z$.`, 'Little progress.']),
        },
        {
          q: md`**(b)** Find the normalized eigenvectors of $\hat L_x$ and the probabilities of the outcomes of an $\hat L_x$ measurement on the selected beam. Find $\langle L_x\rangle$ and $\sigma_{L_x}$.`,
          ans: md`$\ket{+\hbar}_x = \left(\tfrac12, \tfrac{1}{\sqrt2}, \tfrac12\right)$, $\ket{0}_x = \left(\tfrac{1}{\sqrt2}, 0, -\tfrac{1}{\sqrt2}\right)$, $\ket{-\hbar}_x = \left(\tfrac12, -\tfrac{1}{\sqrt2}, \tfrac12\right)$. $P(+\hbar) = \tfrac14$, $P(0) = \tfrac12$, $P(-\hbar) = \tfrac14$. $\langle L_x\rangle = 0$, $\sigma_{L_x} = \hbar/\sqrt2$.`,
          sol: md`
            **How to see it.** "$L_z = +\hbar$" is a cone around $z$: the $x$ component averages to zero but fluctuates, with $\langle L_x^2\rangle = \tfrac12\langle L^2 - L_z^2\rangle = \tfrac12(2 - 1)\hbar^2$.

            Eigenvectors: for $0$, $(a, b, c)$ with $b = 0$ and $a + c = 0$. For $\pm\hbar$: $b = \pm\sqrt2a$, $c = a$. Normalize.

            Probabilities $= |\text{first component}|^2$ (since the state is $(1, 0, 0)$): $\tfrac14, \tfrac12, \tfrac14$. $\langle L_x\rangle = \hbar\left(\tfrac14 - \tfrac14\right) = 0$; $\langle L_x^2\rangle = \hbar^2\left(\tfrac14 + \tfrac14\right) = \tfrac12\hbar^2$, so $\sigma_{L_x} = \hbar/\sqrt2$, matching the cone estimate.
          ` + rub(['Eigenvectors, probabilities, average, σ.', 'One eigenvector wrong, or σ missing.', 'Probabilities right without eigenvectors.', md`Says $L_x = 0$ with certainty.`, 'Little progress.']),
        },
        {
          q: md`**(c)** **Sketch** the angular probability distributions $|Y_1^0|^2$ and $|Y_1^1|^2$, and that of the $L_x = 0$ eigenstate from (b). Write that eigenstate in terms of $x$, $y$, $z$, $r$, and interpret it in one sentence.`,
          ans: md`$|Y_1^0|^2 \propto \cos^2\theta$: a dumbbell along $z$. $|Y_1^1|^2 \propto \sin^2\theta$: a doughnut around $z$. $L_x = 0$ state: $\tfrac{1}{\sqrt2}(Y_1^1 - Y_1^{-1}) = -\sqrt{\tfrac{3}{4\pi}}\,\tfrac xr$: a dumbbell along $x$, i.e. $Y_1^0$ turned to point along $x$.`,
          figs: { polar: figPolarL1 },
          sol: md`
            $\tfrac{1}{\sqrt2}\left(Y_1^1 - Y_1^{-1}\right) = -\tfrac{1}{\sqrt2}\sqrt{\tfrac{3}{8\pi}}\sin\theta\left(e^{i\varphi} + e^{-i\varphi}\right) = -\sqrt{\tfrac{3}{4\pi}}\sin\theta\cos\varphi = -\sqrt{\tfrac{3}{4\pi}}\,\frac xr.$

            [[fig:polar]]

            **Interpretation.** "$m = 0$ about an axis" is a dumbbell along that axis (no circulation around it): $p_z$ for $z$, $p_x$ for $x$. The states with $m = \pm1$ about $z$ are doughnuts around $z$: the particle circulates around the axis.
          ` + rub(['Three correct sketches with labeled axes, the x/r form, the interpretation.', 'One sketch wrong (e.g. Y₁¹ drawn as a dumbbell along x with no mention that it is a doughnut).', 'Formula right, sketches poor.', 'Wrong combination for the L_x = 0 state.', 'Little progress.']),
        },
        {
          q: md`**(d)** The particles that gave $L_x = 0$ go through a second $\hat L_z$ measurement. Outcomes and probabilities? Explain why the first result ($L_z = +\hbar$) is "forgotten", and why $L^2 = 2\hbar^2$ is still certain.`,
          ans: md`$+\hbar$ and $-\hbar$ with $\tfrac12$ each, $0$ never. $[\hat L_x, \hat L_z] = -i\hbar\hat L_y \ne 0$: an $L_x$ eigenstate is not an $L_z$ eigenstate, and the collapse onto it erased the earlier value. $[\hat L^2, \hat L_i] = 0$: every measurement leaves the state in the $\ell = 1$ subspace.`,
          sol: md`
            $\ket0_x = \tfrac{1}{\sqrt2}(\ket{1,1} - \ket{1,-1})$, so $P(+\hbar) = P(-\hbar) = \tfrac12$ and $P(0) = 0$ (the $x$-dumbbell has no $Y_1^0$ part).

            After the $L_x$ measurement the state is an $L_x$ eigenstate. Only for $\ell = 0$ can two components be sharp at once (Discussion 7), so for $\ell = 1$ it cannot also be an $L_z$ eigenstate, and nothing of "$+\hbar$" survives. Classically, measuring $L_x$ would leave $L_z$ alone; this is the quantum surprise. $\hat L^2$ commutes with every component, so neither measurement can take the state out of $\ell = 1$.
          ` + rub(['Probabilities with zero for m = 0, and commutator reasons for both statements.', 'Probabilities right, one explanation missing.', md`Says $L_z = \hbar$ is still certain, but explains $L^2$.`, md`Probabilities $\tfrac13$ each.`, 'Little progress.']),
        },
      ],
    },
    {
      head: md`
        **3  A particle in a spherical box** [20 points, 5 per part]

        $V = 0$ for $r < b$ and $V = \infty$ for $r \ge b$. With $\psi = R(r)Y_\ell^m$ and $u = rR$:
        $$-\frac{\hbar^2}{2m}u'' + \frac{\hbar^2\ell(\ell+1)}{2mr^2}u = Eu,\qquad u(0) = u(b) = 0,\qquad E_{N\ell} = \frac{\hbar^2\beta_{N\ell}^2}{2mb^2},$$
        where $\beta_{N\ell}$ is the $N$th zero of the spherical Bessel function $j_\ell$:

        | $\ell$ | $N = 1$ | $N = 2$ | $N = 3$ |
        |---|---|---|---|
        | 0 | 3.142 | 6.283 | 9.425 |
        | 1 | 4.493 | 7.725 | |
        | 2 | 5.763 | 9.095 | |
        | 3 | 6.988 | | |
      `,
      items: [
        {
          q: md`**(a)** Solve the radial equation for $\ell = 0$: find $E_{N0}$ and the normalized $u_{N0}$. Explain why the $\ell = 0$ energies are those of a one-dimensional infinite well of width $b$ (and not $2b$, the diameter).`,
          ans: md`$u_{N0} = \sqrt{2/b}\,\sin(N\pi r/b)$, $E_{N0} = \tfrac{N^2\pi^2\hbar^2}{2mb^2}$ ($\beta = N\pi$, matching the table). $u$ lives on $0 < r < b$ and must vanish at both ends: $u(0) = 0$ acts as a wall at the center.`,
          sol: md`
            **How to see it.** For $\ell = 0$ there is no centrifugal term, and the $u$ equation is the 1D free equation on $[0, b]$ with $u = 0$ at both ends.

            $u'' = -k^2u$, $k = \sqrt{2mE}/\hbar$: $u = A\sin kr + B\cos kr$. $u(0) = 0 \Rightarrow B = 0$. $u(b) = 0 \Rightarrow kb = N\pi$. $\int_0^b|u|^2dr = 1 \Rightarrow A = \sqrt{2/b}$. Then $R = u/r = \sqrt{2/b}\,\sin(kr)/r$, finite at the origin.

            Not $2b$: $r$ runs from 0 to $b$, not across the diameter, and $u(0) = 0$ (needed so that $\psi$ solves the equation at the origin) is exactly a wall condition. Equivalently, these are the states of the 1D well $[-b, b]$ that vanish at its center: only the odd ones.
          ` + rub(['u, E, normalization, and the reason.', 'Normalization missing, or the reason vague.', md`Solution right, $u(0) = 0$ not justified.`, md`Imposes the boundary condition on $R$ ($R = \sin kr$).`, 'Little progress.']),
        },
        {
          q: md`**(b)** The inner ball $r < b/2$ has only $\tfrac18$ of the box's volume. **Without evaluating an integral**, find the probability that a particle in the ground state is found there. Then explain why it is so much larger than $\tfrac18$.`,
          ans: md`$\tfrac12$: $|u|^2 = \tfrac2b\sin^2(\pi r/b)$ is symmetric about $r = b/2$. The density $|\psi|^2 = |u|^2/(4\pi r^2)$ is largest at the center and falls off: the particle crowds the middle.`,
          sol: md`
            **How to see it.** $|u|^2dr$ is already the probability in a shell (the $r^2$ of the volume element sits inside $u = rR$). So read probabilities off $|u|^2$, not off $|\psi|^2$.

            $\sin^2(\pi r/b)$ is symmetric about $r = b/2$, so exactly half of $\int_0^b|u|^2dr$ lies in $r < b/2$: $P = \tfrac12$.

            "1/8 of the volume" would be right for a uniform density. Here $|\psi|^2 = \tfrac{\sin^2(\pi r/b)}{2\pi br^2}$ is largest at the center ($\pi/2b^3$) and falls to zero at the wall, so the inner ball holds much more than its share.
          ` + rub(['½ from the symmetry of |u|², and the density explanation.', 'Right answer, explanation missing.', md`Integral set up correctly with the $r^2$, no symmetry argument.`, md`Answers $\tfrac18$, or uses $|R|^2dr$ without the $r^2$.`, 'Little progress.']),
        },
        {
          q: md`**(c)** Use the table to list the five lowest levels with their $\ell$, spectroscopic label (1s, 1p, …) and degeneracy. Then: true or false, with a justification that does not use the table? "The ground state of a particle in any central potential has $\ell = 0$."`,
          ans: md`1s (3.142, 1 state), 1p (4.493, 3), 1d (5.763, 5), 2s (6.283, 1), 1f (6.988, 7). **True**: the centrifugal term is positive, so for any $\ell \ge 1$ the lowest energy exceeds the lowest $\ell = 0$ energy.`,
          sol: md`
            Ordering by $\beta$: 3.142 (1s), 4.493 (1p), 5.763 (1d), 6.283 (2s), 6.988 (1f), with $2\ell + 1$ states each.

            **True.** Let $u$ be the lowest eigenfunction for some $\ell \ge 1$. Then $E_{1\ell} = \bra u\hat H_0\ket u + \tfrac{\hbar^2\ell(\ell+1)}{2m}\int\tfrac{|u|^2}{r^2}dr > \bra u\hat H_0\ket u \ge E_{10}$, because $u$ (with $u(0) = 0$) is also an allowed $\ell = 0$ wavefunction and no $\ell = 0$ state has energy below $E_{10}$. Holds for any $V(r)$. Physically, angular momentum costs rotational energy. (Bonus: the ground state is therefore nondegenerate.)
          ` + rub(['List right and True with the centrifugal/variational argument.', 'List with one error, argument right.', 'List right, verdict only asserted.', 'Says False.', 'Part of the list only.']),
        },
        {
          q: md`**(d)** True or false? Justify. "Since $u(0) = 0$ in every state, the probability density $|\psi|^2$ vanishes at the center of the box in every stationary state."`,
          ans: md`**False.** $u(0) = 0$ constrains $u = rR$, not $R$. Near the origin $u \propto r^{\ell+1}$, so $R \propto r^\ell$: for $\ell = 0$, $R(0) \ne 0$. In the ground state the density is *largest* at the center, $|\psi(0)|^2 = \pi/2b^3$.`,
          sol: md`
            $R = u/r$: for the ground state $R = \sqrt{2/b}\,\sin(\pi r/b)/r \to \sqrt{2/b}\,\pi/b$ as $r \to 0$, so $|\psi(0)|^2 = R(0)^2/4\pi = \pi/2b^3 \ne 0$. Only $\ell \ge 1$ states vanish at the center, as $r^\ell$: the centrifugal barrier keeps a particle with angular momentum away from the origin, and s states have nothing to keep them out.
          ` + tf('False'),
        },
      ],
    },
  ], {
    q: md`Enter: 1(c) $P(E = \tfrac12\hbar\omega)$; 1(d) $\langle x\rangle(0)$ in units of $w$; 2(b) $P(L_x = 0)$; 3(b) $P(r < b/2)$; 3(c) $E_{\text{1p}}/E_{\text{1s}}$.`,
    parts: [
      { lbl: md`P(\tfrac12\hbar\omega)`, ans: 1 / PI },
      { lbl: md`\langle x\rangle(0)/w`, ans: 2 / SQ(PI) },
      { lbl: md`P(L_x=0)`, ans: 0.5 },
      { lbl: md`P(r<b/2)`, ans: 0.5 },
      { lbl: md`E_{1p}/E_{1s}`, ans: (4.4934 / PI) ** 2 },
    ],
    sol: md`$0.318$, $1.128$, $0.5$, $0.5$, $(4.493/3.142)^2 = 2.05$.`,
  }, md`[Topic 14: oscillator wavefunctions](#/l/t14-showave), [Topic 15: oscillator motion](#/l/t15-shomotion), [Topic 18: angular momentum algebra](#/l/t18-Lalgebra), [Topic 19: spherical harmonics and measuring L](#/l/t19-Ylm), [Topic 20: the radial equation and the spherical box](#/l/t20-radial).`);

  // ================================================================== Practice midterm 3
  const pm3 = exam(3, md`**This exam:** the generalized Ehrenfest theorem (virial theorem, conservation, energy–time), the top of the angular-momentum ladder with a sketch of $|Y_\ell^\ell|^2$, and the hydrogen ground state with two true-or-false parts.`, [
    {
      head: md`
        **1  What moves and what is conserved** [20 points, 5 per part]

        A particle of mass $m$ moves in one dimension with $\hat H = \hat p^2/2m + V(\hat x)$. For any observable $\hat Q$,
        $$\frac{d\langle Q\rangle}{dt} = \frac i\hbar\left\langle[\hat H, \hat Q]\right\rangle + \left\langle\frac{\partial\hat Q}{\partial t}\right\rangle,\qquad [\hat x, \hat p] = i\hbar,\qquad [f(\hat x), \hat p] = i\hbar f'(\hat x),\qquad [\hat A\hat B, \hat C] = \hat A[\hat B, \hat C] + [\hat A, \hat C]\hat B.$$
        For the harmonic oscillator, $V = \tfrac12m\omega^2x^2$, $E_n = \hbar\omega(n + \tfrac12)$.
      `,
      items: [
        {
          q: md`**(a)** Show that $\dfrac{d}{dt}\langle\hat x\hat p\rangle = 2\langle T\rangle - \left\langle x\,V'(x)\right\rangle$, where $T = p^2/2m$.`,
          ans: md`$[\hat H, \hat x\hat p] = [\tfrac{\hat p^2}{2m}, \hat x]\hat p + \hat x[V, \hat p] = -\tfrac{i\hbar}{m}\hat p^2 + i\hbar\,\hat xV'$, so $\tfrac{d}{dt}\langle xp\rangle = \tfrac{\langle p^2\rangle}{m} - \langle xV'\rangle$.`,
          sol: md`
            **How to see it.** The kinetic term pushes $xp$ up (moving away from the origin increases $xp$), the force term pulls it down. Their balance is the virial theorem.

            $[\hat p^2, \hat x] = \hat p[\hat p, \hat x] + [\hat p, \hat x]\hat p = -2i\hbar\hat p$, so $[\tfrac{\hat p^2}{2m}, \hat x\hat p] = [\tfrac{\hat p^2}{2m}, \hat x]\hat p + \hat x[\tfrac{\hat p^2}{2m}, \hat p] = -\tfrac{i\hbar}{m}\hat p^2$.

            $[V, \hat x\hat p] = \hat x[V, \hat p] + [V, \hat x]\hat p = i\hbar\,\hat xV'(\hat x)$.

            $\tfrac i\hbar\left(-\tfrac{i\hbar}{m}\langle p^2\rangle + i\hbar\langle xV'\rangle\right) = \tfrac{\langle p^2\rangle}{m} - \langle xV'\rangle = 2\langle T\rangle - \langle xV'\rangle$. $\hat x\hat p$ has no explicit $t$.
          ` + rub(['Both commutators with correct operator ordering and signs.', 'One sign slip.', 'Product rule used but the V term missing or wrong.', md`Treats $\hat x$, $\hat p$ as numbers.`, 'Little progress.']),
        },
        {
          q: md`**(b)** Explain why the left side of (a) vanishes in any stationary state, and deduce the virial theorem. Apply it to the harmonic oscillator and to $V = \beta x^4$: what fraction of $E$ is kinetic, in each? (Do not solve the Schrödinger equation.)`,
          ans: md`In a stationary state every expectation value of a time-independent operator is constant (the phase $e^{-iEt/\hbar}$ cancels). So $2\langle T\rangle = \langle xV'\rangle$. Oscillator: $xV' = 2V$, $\langle T\rangle = \langle V\rangle = \tfrac E2$. Quartic: $xV' = 4V$, $\langle T\rangle = 2\langle V\rangle$, so $\langle T\rangle = \tfrac23E$, $\langle V\rangle = \tfrac13E$.`,
          sol: md`
            $\Psi = \psi e^{-iEt/\hbar}$: $\bra\Psi\hat Q\ket\Psi = \bra\psi\hat Q\ket\psi$, independent of $t$. So $0 = 2\langle T\rangle - \langle xV'\rangle$.

            Power law $V \propto x^s$: $xV' = sV$, so $2\langle T\rangle = s\langle V\rangle$. With $E = \langle T\rangle + \langle V\rangle$: $\langle T\rangle = \tfrac{s}{s+2}E$. $s = 2$: $\tfrac12$; $s = 4$: $\tfrac23$. A steeper potential confines more sharply, so more of the energy is kinetic. (Check, oscillator ground state: $\langle T\rangle = \tfrac14\hbar\omega = \langle V\rangle$, the equal split found from the uncertainty estimate.)
          ` + rub(['Reason the left side vanishes, the theorem, both applications.', 'One application wrong.', 'Theorem right, the reason the derivative vanishes missing.', md`Claims $\langle xp\rangle = 0$ because $\langle p\rangle = 0$.`, 'Little progress.']),
        },
        {
          q: md`**(c)** For the harmonic oscillator, decide (one line of justification each) whether $\langle Q\rangle$ is constant in **every** state for $\hat Q =$ (i) $\hat H$, (ii) $\hat p$, (iii) the parity operator $\hat\Pi$ ($\hat\Pi\psi(x) = \psi(-x)$), (iv) $\hat x\hat p + \hat p\hat x$. Which answers change for a free particle?`,
          ans: md`(i) Yes, $[\hat H, \hat H] = 0$. (ii) No, $\tfrac{d\langle p\rangle}{dt} = -m\omega^2\langle x\rangle$. (iii) Yes, $V$ is even so $[\hat H, \hat\Pi] = 0$. (iv) No, $\tfrac{d}{dt}\langle xp + px\rangle = 4(\langle T\rangle - \langle V\rangle)$, nonzero e.g. in a breathing state. Free particle: (ii) becomes yes; (iv) is still no ($= 2\langle p^2\rangle/m > 0$: the packet spreads).`,
          sol: md`
            **How to see it.** Conserved $\Leftrightarrow$ commutes with $\hat H$ (no explicit $t$). Symmetries of $\hat H$ give conserved quantities: even $V$ gives parity, no $V$ gives momentum.

            (iv): $\hat x\hat p + \hat p\hat x = 2\hat x\hat p - i\hbar$, so its rate is $2(2\langle T\rangle - \langle xV'\rangle) = 4(\langle T\rangle - \langle V\rangle)$ for the oscillator: zero in stationary states (part (b)) but not in general, e.g. in $\tfrac{1}{\sqrt2}(\ket0 - \ket2)$, whose width oscillates. For a free particle it is $4\langle T\rangle > 0$ for every state: $\langle x^2\rangle$ grows, the packet spreads.
          ` + rub(['All four right with reasons, plus the free-particle comparison.', 'One wrong.', 'Two wrong, or reasons missing.', md`"Everything is conserved because $\hat H$ is time-independent."`, 'Little progress.']),
        },
        {
          q: md`**(d)** The oscillator starts in $\tfrac{1}{\sqrt2}(\ket0 + \ket1)$. Find $\sigma_H$. At $t = \pi/2\omega$, find $\sigma_x$ and $|d\langle x\rangle/dt|$ (you may use $\langle x\rangle = \sqrt{\hbar/2m\omega}\cos\omega t$ and $\langle x^2\rangle = \hbar/m\omega$ in this state). Compute $\Delta t = \sigma_x/|d\langle x\rangle/dt|$, check $\sigma_H\Delta t \ge \hbar/2$, and say what $\Delta t$ means.`,
          ans: md`$\sigma_H = \tfrac12\hbar\omega$. At $t = \pi/2\omega$: $\sigma_x = \sqrt{\hbar/m\omega}$, $|d\langle x\rangle/dt| = \omega\sqrt{\hbar/2m\omega}$, $\Delta t = \sqrt2/\omega$, $\sigma_H\Delta t = \hbar/\sqrt2 \approx 0.71\hbar \ge 0.5\hbar$ ✓. $\Delta t$ is the time for $\langle x\rangle$ to move by one standard deviation: how fast the state visibly changes.`,
          sol: md`
            **How to see it.** A state changes noticeably only if it has an energy spread; the bigger the spread, the faster. Two levels $\hbar\omega$ apart give changes on the time scale $1/\omega$.

            $\langle H\rangle = \hbar\omega$, $\langle H^2\rangle = \tfrac12\left(\tfrac14 + \tfrac94\right)\hbar^2\omega^2 = \tfrac54\hbar^2\omega^2$, $\sigma_H = \tfrac12\hbar\omega$.

            At $t = \pi/2\omega$: $\langle x\rangle = 0$, so $\sigma_x = \sqrt{\hbar/m\omega}$, and $|d\langle x\rangle/dt| = \omega\sqrt{\hbar/2m\omega}$ (largest speed). $\Delta t = \sqrt{\hbar/m\omega}\big/\left(\omega\sqrt{\hbar/2m\omega}\right) = \sqrt2/\omega$. $\sigma_H\Delta t = \tfrac12\hbar\omega\cdot\tfrac{\sqrt2}{\omega} = \tfrac{\hbar}{\sqrt2}$ ✓ (not saturated). In a stationary state $\sigma_H = 0$ and $d\langle x\rangle/dt = 0$: the relation says nothing, as it must.
          ` + rub(['σ_H, σ_x, the rate, Δt, the check, and the meaning.', 'One quantity wrong, the rest consistent.', 'Numbers right, no interpretation.', md`Treats $t$ as an operator, or uses $\sigma_H = 0$.`, 'Little progress.']),
        },
      ],
    },
    {
      head: md`
        **2  The top of the ladder** [20 points, 5 per part]

        $[\hat L_x, \hat L_y] = i\hbar\hat L_z$ (and cyclic), $\hat L_x$, $\hat L_y$, $\hat L_z$ are Hermitian, $\hat L_\pm = \hat L_x \pm i\hat L_y$, and
        $$\hat L_\mp\hat L_\pm = \hat L^2 - \hat L_z^2 \mp \hbar\hat L_z,\qquad \hat L^2f_\ell^m = \hbar^2\ell(\ell+1)f_\ell^m,\qquad \hat L_zf_\ell^m = \hbar mf_\ell^m.$$
        In spherical coordinates $\hat L_z = -i\hbar\,\partial_\varphi$ and $\hat L_+ = \hbar e^{i\varphi}\left(\partial_\theta + i\cot\theta\,\partial_\varphi\right)$. Normalized eigenfunctions are assumed throughout.
      `,
      items: [
        {
          q: md`**(a)** Show that $\hat L_+^\dagger = \hat L_-$. Use it to find $|A|^2$ in $\hat L_+f_\ell^m = A\,f_\ell^{m+1}$.`,
          ans: md`$(\hat L_x + i\hat L_y)^\dagger = \hat L_x - i\hat L_y$. $|A|^2 = \braket{\hat L_+f|\hat L_+f} = \bra f\hat L_-\hat L_+\ket f = \hbar^2\left[\ell(\ell+1) - m(m+1)\right]$.`,
          sol: md`
            **How to see it.** The length squared of the raised state is computed two ways: as $|A|^2$ (normalized $f^{m+1}$), and by moving $\hat L_+$ to the other side, where $\hat L_-\hat L_+$ is built from operators whose eigenvalues we know.

            Dagger reverses order and conjugates numbers: $(\hat L_x + i\hat L_y)^\dagger = \hat L_x^\dagger - i\hat L_y^\dagger = \hat L_x - i\hat L_y = \hat L_-$.

            $|A|^2 = \braket{\hat L_+f|\hat L_+f} = \bra f\hat L_+^\dagger\hat L_+\ket f = \bra f(\hat L^2 - \hat L_z^2 - \hbar\hat L_z)\ket f = \hbar^2\left[\ell(\ell+1) - m^2 - m\right]$.
          ` + rub(['Dagger shown, the two-way norm, the result.', 'Result right, the dagger step only asserted.', 'Correct idea, algebra slip in the product.', md`Uses $\hat L_+^\dagger = \hat L_+$.`, 'Little progress.']),
        },
        {
          q: md`**(b)** Use (a) to explain why the ladder must have a top rung $m_{\max}$, why $\hat L_+f_\ell^{m_{\max}} = 0$, and show that $m_{\max} = \ell$.`,
          ans: md`$|A|^2 \ge 0$, but $\ell(\ell+1) - m(m+1)$ becomes negative if we keep raising. The only way out: some rung gives exactly $\hat L_+f = 0$, which needs $m_{\max}(m_{\max}+1) = \ell(\ell+1)$, so $m_{\max} = \ell$ (the other root, $-\ell - 1$, is below the bottom).`,
          sol: md`
            **How to see it.** $L^2 - L_z^2 = L_x^2 + L_y^2 \ge 0$: a component can't exceed the total. Raising $m$ forever would violate that, so the ladder must end, and it can only end by producing the zero vector.

            Each $\hat L_+$ raises $m$ by 1 at fixed $\ell$ (it commutes with $\hat L^2$). The norm squared of $\hat L_+f_\ell^m$ is $\hbar^2[\ell(\ell+1) - m(m+1)]$, which goes negative for large $m$: impossible for a norm. So there is a top $f^{m_{\max}}$ with $\hat L_+f^{m_{\max}} = 0$, i.e. norm zero: $\ell(\ell+1) = m_{\max}(m_{\max}+1)$, so $m_{\max} = \ell$. (Same at the bottom with $\hat L_-$: $m_{\min} = -\ell$, so $2\ell$ is an integer.)
          ` + rub(['The positivity argument, why it must be exactly zero, and m_max = ℓ.', 'm_max = ℓ shown, the reason for a top vague.', 'States "the ladder must stop" without the norm argument.', 'Claims m_max = ℓ(ℓ+1) or similar.', 'Little progress.']),
        },
        {
          q: md`**(c)** Find $Y_\ell^\ell(\theta,\varphi)$ up to normalization from $\hat L_+Y_\ell^\ell = 0$ and $\hat L_zY_\ell^\ell = \hbar\ell Y_\ell^\ell$. **Sketch** $|Y_\ell^\ell|^2$ (a polar plot in a plane containing $z$) for $\ell = 1$ and for a large $\ell$, and interpret the large-$\ell$ shape.`,
          ans: md`$Y_\ell^\ell = C\sin^\ell\theta\,e^{i\ell\varphi}$. $|Y_\ell^\ell|^2 \propto \sin^{2\ell}\theta$: a doughnut around $z$ that gets thinner as $\ell$ grows, squeezed toward the $xy$ plane. Large $\ell$: a classical orbit in the $xy$ plane with $\vb L$ along $+z$.`,
          figs: { yll: { svg: figYll, cap: '$|Y_\\ell^\\ell|^2 \\propto \\sin^{2\\ell}\\theta$ in the $xz$ plane (scaled to the same maximum). The doughnut around $z$ flattens onto the equator as $\\ell$ grows.' } },
          sol: md`
            $\hat L_zY = \hbar\ell Y \Rightarrow Y = f(\theta)e^{i\ell\varphi}$. Then $\hat L_+Y = \hbar e^{i\varphi}\left(f' + i\cot\theta\cdot i\ell f\right)e^{i\ell\varphi} = \hbar e^{i(\ell+1)\varphi}\left(f' - \ell\cot\theta\,f\right) = 0$, so $f'/f = \ell\cot\theta$, $f = C\sin^\ell\theta$. (Check $\ell = 1$: $\sin\theta e^{i\varphi}$ ✓.)

            [[fig:yll]]

            The width of the doughnut is about $1/\sqrt\ell$ around $\theta = \pi/2$. As $\ell \to \infty$ the particle is confined to the equatorial plane: the classical picture of an orbit in the $xy$ plane with angular momentum along $z$ comes back.
          ` + rub(['Y_ℓ^ℓ derived, correct sketches (doughnut, thinner for large ℓ), interpretation.', 'Derivation right, sketch or interpretation weak.', 'φ part right, θ ODE not solved.', 'Sketch a dumbbell along z.', 'Little progress.']),
        },
        {
          q: md`**(d)** In the state $Y_\ell^\ell$ find $\langle L_x\rangle$ and $\langle L_x^2\rangle$. In the vector model, the angle $\alpha$ between $\vb L$ and the $z$ axis has $\cos\alpha = \ell/\sqrt{\ell(\ell+1)}$: evaluate it for $\ell = 1, 2$. Why can $\vb L$ never point exactly along $z$ (for $\ell \ge 1$)?`,
          ans: md`$\langle L_x\rangle = 0$; $\langle L_x^2\rangle = \tfrac12\hbar^2\ell$. $\alpha = 45°$ ($\ell = 1$), $35.3°$ ($\ell = 2$). Pointing along $z$ would need $L_x = L_y = 0$ sharp together with $L_z$; two sharp components are possible only for $\ell = 0$. Equivalently $\langle L_x^2 + L_y^2\rangle = \hbar^2\ell > 0$.`,
          sol: md`
            $\langle L_x\rangle = \tfrac12\langle L_+ + L_-\rangle = 0$: $L_\pm$ change $m$, and different $m$ are orthogonal.

            $\langle L_x^2 + L_y^2\rangle = \langle L^2 - L_z^2\rangle = \hbar^2(\ell^2 + \ell - \ell^2) = \hbar^2\ell$. $|Y_\ell^\ell|^2$ is symmetric about $z$, so $x$ and $y$ share it: $\langle L_x^2\rangle = \tfrac12\hbar^2\ell$.

            $\cos\alpha = \ell/\sqrt{\ell(\ell+1)}$: $1/\sqrt2$ ($45°$), $2/\sqrt6$ ($35.3°$); it shrinks like $1/\sqrt\ell$ but never reaches 0. The leftover $\hbar^2\ell$ in the perpendicular components is the uncertainty forced by $[\hat L_x, \hat L_y] = i\hbar\hat L_z$: in $Y_\ell^\ell$, $\sigma_{L_x}\sigma_{L_y} \ge \tfrac\hbar2|\langle L_z\rangle| = \tfrac12\hbar^2\ell$, and $Y_\ell^\ell$ meets it with equality.
          ` + rub(['Both averages, both angles, and the commutator reason.', 'One average wrong.', 'Angles only.', md`Says $\vb L$ points along $z$ since $L_z = \ell\hbar$ is the maximum.`, 'Little progress.']),
        },
      ],
    },
    {
      head: md`
        **3  Where is the electron?** [20 points, 5 per part]

        The hydrogen ground state is $\psi_{100} = \dfrac{e^{-r/a}}{\sqrt{\pi a^3}}$, $a = 0.0529$ nm. Energies: $E_n = E_1/n^2$, $E_1 = -\dfrac{k}{2a} = -13.6$ eV, with $V = -k/r$; for each $n$: $\ell = 0, \dots, n - 1$ and $m = -\ell, \dots, \ell$. $d^3r = r^2\sin\theta\,dr\,d\theta\,d\varphi$,
        $$\int_0^\infty r^ne^{-\beta r}dr = \frac{n!}{\beta^{n+1}},\qquad \int_c^\infty r^2e^{-\beta r}dr = e^{-\beta c}\left(\frac{c^2}{\beta} + \frac{2c}{\beta^2} + \frac{2}{\beta^3}\right).$$
        Virial theorem for a central potential: in a stationary state $2\langle T\rangle = \langle\vb r\cdot\nabla V\rangle$.
      `,
      items: [
        {
          q: md`**(a)** Find the radial probability density $P(r)$ (probability per unit $r$), the most probable $r$, and $\langle r\rangle$. $|\psi_{100}|^2$ is largest at $r = 0$: explain why the most probable $r$ is nevertheless $a$.`,
          ans: md`$P(r) = \tfrac{4r^2}{a^3}e^{-2r/a}$; $r_{\text{mp}} = a$; $\langle r\rangle = \tfrac32a$. The density per volume peaks at 0, but the volume of a shell, $4\pi r^2dr$, vanishes there; their product peaks at $a$.`,
          figs: { hr: { svg: figHr, cap: 'Radial probability density of the hydrogen ground state. Beyond $r = 2a$ (the classical turning point) the electron is in the classically forbidden region.' } },
          sol: md`
            $P(r)dr = |\psi|^2\cdot4\pi r^2dr = \tfrac{4r^2}{a^3}e^{-2r/a}dr$. Maximum: $\tfrac{d}{dr}(r^2e^{-2r/a}) = 0 \Rightarrow 2r - 2r^2/a = 0 \Rightarrow r = a$. $\langle r\rangle = \tfrac{4}{a^3}\int r^3e^{-2r/a}dr = \tfrac4{a^3}\cdot\tfrac{3!}{(2/a)^4} = \tfrac32a$ (mean beyond the peak: long tail).

            [[fig:hr]]

            "Most probable place" (a point, maximum of $|\psi|^2$: the nucleus) and "most probable distance" (a shell, maximum of $4\pi r^2|\psi|^2$) are different questions. There are many more points at distance $a$ than near $r = 0$.
          ` + rub(['P(r), r_mp, ⟨r⟩, and the volume-factor explanation.', 'One quantity wrong, or the explanation only asserted.', md`$P(r)$ right, no explanation.`, md`Uses $|\psi|^2$ as the radial density (finds $r_{\text{mp}} = 0$).`, 'Little progress.']),
        },
        {
          q: md`**(b)** Find the classical turning point of an electron with energy $E_1$, and the probability that the ground-state electron is found in the classically forbidden region.`,
          ans: md`$-k/r = E_1 = -k/2a \Rightarrow r = 2a$. $P(r > 2a) = e^{-4}(1 + 4 + 8) = 13e^{-4} = 0.238$.`,
          sol: md`
            Classically allowed means $E \ge V$: $-\tfrac{k}{2a} \ge -\tfrac kr \Rightarrow r \le 2a$.

            $P(r > 2a) = \tfrac4{a^3}\int_{2a}^\infty r^2e^{-2r/a}dr = \tfrac4{a^3}e^{-4}\left(\tfrac{4a^2\cdot a}{2} + \tfrac{2\cdot2a\cdot a^2}{4} + \tfrac{2a^3}{8}\right) = e^{-4}(8 + 4 + 1) = 0.238$.

            Almost a quarter of the time the electron is where a classical particle with its energy could never be: the same tail as in the finite well.
          ` + rub(['Turning point and probability with the integral done right.', 'Arithmetic slip in the integral.', 'Turning point right, integral set up without the r² or the limits.', md`Turning point at $r = a$ or from $T = 0$ at the wrong energy.`, 'Little progress.']),
        },
        {
          q: md`**(c)** True or false? Justify. "An electron is known to have energy $E_2 = -3.4$ eV. A measurement of $\hat L^2$ then gives $0$ or $2\hbar^2$, each with probability $\tfrac12$."`,
          ans: md`**False.** The outcomes $0$ (2s) or $2\hbar^2$ (2p) are right, but $E_2$ is $n^2 = 4$-fold degenerate, so "energy $E_2$" allows any superposition of $\psi_{200}, \psi_{211}, \psi_{210}, \psi_{21,-1}$. The probabilities are the weights of the 2s and 2p parts of that particular state: anything from 0 to 1. (Even counting states, it would be $\tfrac14$ vs $\tfrac34$, not $\tfrac12$.)`,
          sol: md`
            Knowing $E$ only says the state lies in the $n = 2$ subspace: $\ket\psi = c_0\ket{200} + \sum_mc_m\ket{21m}$. Then $P(L^2 = 0) = |c_0|^2$, $P(L^2 = 2\hbar^2) = \sum|c_m|^2$, set by how the state was prepared. Compare Discussion 8: energy alone does not fix probabilities within a degenerate level. Bonus point of view: rotational symmetry explains the threefold 2p degeneracy, but the 2s–2p coincidence is hydrogen's accidental degeneracy.
          ` + tf('False'),
        },
        {
          q: md`**(d)** True or false? Justify. "In the hydrogen ground state the electron is at rest: $L = 0$ and $\psi$ is real, so $\langle p\rangle = 0$ and $\langle T\rangle = 0$."`,
          ans: md`**False.** $\langle\vb p\rangle = 0$ is right, but $\langle p^2\rangle \ne 0$. Virial: $2\langle T\rangle = \langle\vb r\cdot\nabla V\rangle = -\langle V\rangle$, so $\langle T\rangle = -E_1 = +13.6$ eV and $\langle V\rangle = 2E_1 = -27.2$ eV. Confining the electron to $r \sim a$ costs kinetic energy (uncertainty); $v_{\text{rms}} \approx c/137$.`,
          sol: md`
            $\langle\vb p\rangle = 0$ (real $\psi$, and spherical symmetry) only says the average velocity vanishes. $\langle p^2\rangle$ measures the spread: $\sigma_p \sim \hbar/a$. For $V = -k/r$, $\vb r\cdot\nabla V = r\tfrac{k}{r^2} = -V$, so $2\langle T\rangle = -\langle V\rangle$ and $E = \langle T\rangle + \langle V\rangle = -\langle T\rangle$: $\langle T\rangle = 13.6$ eV. Directly: $\langle V\rangle = -k\langle1/r\rangle = -k/a = 2E_1$. $\sqrt{\langle p^2\rangle}\,c = \sqrt{2(0.511\text{ MeV})(13.6\text{ eV})} = 3.7$ keV, so $v_{\text{rms}} \approx c/137$. $L = 0$ means no circulation, not no motion.
          ` + tf('False'),
        },
      ],
    },
  ], {
    q: md`Enter: 1(b) $\langle T\rangle/E$ for $V = \beta x^4$; 1(d) $\sigma_H\Delta t/\hbar$; 2(d) the vector-model angle for $\ell = 2$ in degrees; 3(b) $P(r > 2a)$; 3(a) $\langle r\rangle/a$.`,
    parts: [
      { lbl: md`\langle T\rangle/E`, ans: 2 / 3 },
      { lbl: md`\sigma_H\Delta t/\hbar`, ans: 1 / SQ(2) },
      { lbl: md`\alpha\ (\ell=2)`, ans: Math.acos(2 / SQ(6)) * 180 / PI, unit: '°' },
      { lbl: md`P(r>2a)`, ans: 13 * EXP(-4) },
      { lbl: md`\langle r\rangle/a`, ans: 1.5 },
    ],
    sol: md`$0.667$, $0.707$, $35.3°$, $0.238$, $1.5$.`,
  }, md`[Topic 11: the generalized Ehrenfest theorem](#/l/t11-ehrenfest), [Topic 12: energy and time](#/l/t12-energytime), [Topic 18: angular momentum algebra](#/l/t18-Lalgebra), [Topic 19: spherical harmonics](#/l/t19-Ylm), [Topic 21: hydrogen](#/l/t21-hydrogen).`);

  // ================================================================== Practice midterm 4
  const pm4 = exam(4, md`**This exam:** a coherent state (energy statistics, motion, phase space) compared with a stationary state of the same energy, a rotating molecule that is a symmetric top, and the three-dimensional oscillator's degeneracies with true-or-false parts.`, [
    {
      head: md`
        **1  A coherent state** [20 points, 5 per part]

        The oscillator ($m$, $\omega$, $E_n = \hbar\omega(n + \tfrac12)$) is in a coherent state, an eigenstate of the lowering operator:
        $$\hat a_-\ket\alpha = \alpha\ket\alpha,\qquad \ket\alpha = e^{-|\alpha|^2/2}\sum_{n=0}^\infty\frac{\alpha^n}{\sqrt{n!}}\ket n,\qquad \ket{\alpha(t)} = e^{-i\omega t/2}\ket{\alpha e^{-i\omega t}},$$
        $$\hat x = \sqrt{\frac{\hbar}{2m\omega}}\left(\hat a_+ + \hat a_-\right),\qquad \hat p = i\sqrt{\frac{\hbar m\omega}{2}}\left(\hat a_+ - \hat a_-\right),\qquad \hat a_+ = \hat a_-^\dagger,\qquad [\hat a_-, \hat a_+] = 1.$$
        Use $w = \sqrt{\hbar/m\omega}$. For a stationary state, $\sigma_x = w\sqrt{n + \tfrac12}$.
      `,
      items: [
        {
          q: md`**(a)** Take $\alpha = 2$. An energy measurement: what are the possible outcomes and probabilities? Which $n$ is most likely? Find $\langle H\rangle$ and $\sigma_H$. *Hint:* $\bra\alpha\hat a_+\hat a_-\ket\alpha = |\alpha|^2$; write $\hat a_+\hat a_-\hat a_+\hat a_-$ using the commutator.`,
          ans: md`$E_n$ with $P(n) = e^{-4}\tfrac{4^n}{n!}$ (Poisson): $P(0) = 0.018$, …; $n = 3$ and $n = 4$ tie as most likely ($0.195$ each). $\langle H\rangle = \hbar\omega(4 + \tfrac12) = 4.5\hbar\omega$, $\sigma_H = |\alpha|\hbar\omega = 2\hbar\omega$.`,
          sol: md`
            **How to see it.** $P(n) = |c_n|^2 = e^{-|\alpha|^2}|\alpha|^{2n}/n!$ is a Poisson distribution with mean $|\alpha|^2$: like counting independent random events. Its spread is the square root of its mean.

            $P(3) = e^{-4}\tfrac{64}{6}$, $P(4) = e^{-4}\tfrac{256}{24}$: equal, $0.195$.

            $\hat N = \hat a_+\hat a_-$: $\langle N\rangle = \braket{\hat a_-\alpha|\hat a_-\alpha} = |\alpha|^2 = 4$. $\hat N^2 = \hat a_+(\hat a_+\hat a_- + 1)\hat a_- = \hat a_+^2\hat a_-^2 + \hat N$, so $\langle N^2\rangle = |\alpha|^4 + |\alpha|^2$ and $\sigma_N = |\alpha| = 2$. Hence $\langle H\rangle = \hbar\omega(\langle N\rangle + \tfrac12) = 4.5\hbar\omega$, $\sigma_H = 2\hbar\omega$.
          ` + rub(['Outcomes, Poisson probabilities, the most likely n, ⟨H⟩ and σ_H.', 'σ_H wrong or the most likely n wrong.', 'Probabilities right, averages missing.', md`Claims the energy is certain because $\ket\alpha$ is an eigenstate (of $\hat a_-$, not $\hat H$).`, 'Little progress.']),
        },
        {
          q: md`**(b)** Find $\langle x\rangle(t)$ and $\langle p\rangle(t)$ for $\alpha = 2$ and for $\alpha = 2i$. What does the phase of $\alpha$ tell you?`,
          ans: md`$\langle x\rangle = \sqrt{2}\,w\,\text{Re}\,\alpha(t)$, $\langle p\rangle = \sqrt2\,\tfrac\hbar w\,\text{Im}\,\alpha(t)$, $\alpha(t) = \alpha e^{-i\omega t}$. $\alpha = 2$: $\langle x\rangle = 2\sqrt2\,w\cos\omega t$, $\langle p\rangle = -2\sqrt2\,\tfrac\hbar w\sin\omega t$ (starts at rest at the right turning point). $\alpha = 2i$: $\langle x\rangle = 2\sqrt2\,w\sin\omega t$, $\langle p\rangle = 2\sqrt2\,\tfrac\hbar w\cos\omega t$ (starts at the center, moving right). The phase of $\alpha$ is the starting point on the orbit.`,
          sol: md`
            $\langle\hat a_-\rangle = \alpha(t)$ and $\langle\hat a_+\rangle = \alpha(t)^*$ (the state stays coherent with $\alpha(t) = \alpha e^{-i\omega t}$). So $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}(\alpha + \alpha^*) = \sqrt2\,w\,\text{Re}\,\alpha(t)$ and $\langle p\rangle = i\sqrt{\tfrac{\hbar m\omega}{2}}(\alpha^* - \alpha) = \sqrt{2\hbar m\omega}\,\text{Im}\,\alpha(t)$, with $\sqrt{\hbar m\omega} = \hbar/w$.

            $\alpha = 2$: $\alpha(t) = 2\cos\omega t - 2i\sin\omega t$. $\alpha = 2i$: $\alpha(t) = 2\sin\omega t + 2i\cos\omega t$. $|\alpha|$ sets the amplitude, $\arg\alpha$ the phase of the classical motion: $\alpha$ *is* the classical initial condition in scaled phase-space coordinates.
          ` + rub(['Both cases correct, and the meaning of the phase.', 'One case with a sign error.', 'General formula right, cases not worked out.', md`Assumes $\alpha$ real in the general formula, or forgets $\alpha(t)$.`, 'Little progress.']),
        },
        {
          q: md`**(c)** **Sketch** the motion in phase space for $\alpha = 2$: the orbit of $(\langle x\rangle, \langle p\rangle)$, its direction and period, and at a few times the uncertainty region (an ellipse with semi-axes $\sigma_x$, $\sigma_p$). How big is the orbit compared to the blob? Why is a coherent state called quasi-classical?`,
          ans: md`An ellipse (a circle in units of $\sqrt2w$ and $\sqrt2\hbar/w$) of amplitude $2\sqrt2\,w$, traversed clockwise with period $2\pi/\omega$. The blob keeps the ground-state size $\sigma_x = w/\sqrt2$, $\sigma_p = \hbar/(\sqrt2w)$ at all times; orbit radius / blob radius $= 2|\alpha| = 4$. Quasi-classical: the center follows the classical orbit and the spread stays minimal ($\sigma_x\sigma_p = \hbar/2$) and never grows.`,
          figs: { phase: { svg: figPhase, cap: 'Coherent state with $\\alpha = 2$ in scaled phase space (units $\\sqrt2 w$ and $\\sqrt2\\hbar/w$): the center moves clockwise on a circle of radius $|\\alpha| = 2$; the uncertainty blob keeps radius $\\tfrac12$.' } },
          sol: md`
            **How to see it.** Shift the ground state's minimal blob to the point $\alpha$ in phase space and let it ride the classical circle.

            $\sigma_x$, $\sigma_p$: $\ket{\alpha}$ is an $\hat a_-$ eigenstate, so $\langle x^2\rangle - \langle x\rangle^2$ is the same as in $\ket0$: $\sigma_x = w/\sqrt2$, $\sigma_p = \hbar/\sqrt2w$, product $\hbar/2$. At all times, since $\ket{\alpha(t)}$ is still coherent.

            [[fig:phase]]

            Direction: at $t = 0$, $\langle x\rangle$ is maximal and $\langle p\rangle$ becomes negative: clockwise (with $x$ right, $p$ up). Size: amplitude $2\sqrt2w$ vs. $\sigma_x = w/\sqrt2$: ratio 4. For $|\alpha| \gg 1$ the blob is a dot on the orbit: classical motion.
          ` + rub(['Orbit, direction, period, blob with its constant size, the ratio, the quasi-classical reason.', 'Direction wrong or blob size wrong.', 'Orbit only.', 'Blob grows or the orbit is a line.', 'Little progress.']),
        },
        {
          q: md`**(d)** Compare $\ket{\alpha = 2}$ with the stationary state $\ket{N = 4}$: $\langle H\rangle$, $\sigma_H$, $\langle x\rangle(t)$, $\sigma_x$. In one or two sentences: why does one move and the other not, and what is the price of moving?`,
          ans: md`Both $\langle H\rangle = 4.5\hbar\omega$. $\sigma_H$: $2\hbar\omega$ vs $0$. $\langle x\rangle$: $2\sqrt2w\cos\omega t$ vs $0$. $\sigma_x$: $0.71w$ (constant) vs $\sqrt{4.5}\,w = 2.12w$ (constant). Motion needs neighboring $\ket n$'s with fixed relative phases (the $\ket n \to \ket{n\pm1}$ interference that $\hat x$ measures); the price is an energy spread.`,
          sol: md`
            **How to see it.** $\hat x$ only connects $n$ to $n \pm 1$. A single $\ket N$ has no neighbors to interfere with, so $\langle x\rangle = 0$ forever: it is a ring smeared over the classical orbit of energy $E_4$ (classical amplitude $w\sqrt{2N+1} = 3w$, comparable to $\sigma_x = 2.12w$), with no phase, i.e. no position on the ring.

            $\ket\alpha$ has many neighboring $n$'s with phases locked together ($c_n \propto \alpha^n$), so the cross terms add up to a moving packet. The price: $\sigma_H = 2\hbar\omega \ne 0$. (Energy–time: something that changes on a time scale $1/\omega$ needs an energy spread $\gtrsim\hbar\omega$.)
          ` + rub(['All four comparisons and the interference/price explanation.', 'One comparison wrong.', 'Comparisons right, no explanation.', md`Claims $\ket4$ oscillates because its energy is the same.`, 'Little progress.']),
        },
      ],
    },
    {
      head: md`
        **2  A rotating molecule** [20 points, 5 per part]

        Model a rigid molecule by a wavefunction that depends only on the angles, with
        $$\hat H = \frac{\hat L_x^2}{2I_x} + \frac{\hat L_y^2}{2I_y} + \frac{\hat L_z^2}{2I_z},\qquad \hat L^2 = \hat L_x^2 + \hat L_y^2 + \hat L_z^2,\qquad \hat L^2Y_\ell^m = \hbar^2\ell(\ell+1)Y_\ell^m,\qquad \hat L_zY_\ell^m = \hbar mY_\ell^m,$$
        with $Y_1^{\pm1} = \mp\sqrt{3/8\pi}\,\sin\theta\,e^{\pm i\varphi}$.
      `,
      items: [
        {
          q: md`**(a)** Let $I_x = I_y = I_z = I$. Find the energy eigenfunctions, the energies, and their degeneracies. The molecule emits a photon in each transition $\ell \to \ell - 1$: show that the photon energies are equally spaced and find the spacing.`,
          ans: md`$\hat H = \hat L^2/2I$; eigenfunctions $Y_\ell^m$, $E_\ell = \tfrac{\hbar^2\ell(\ell+1)}{2I}$, degeneracy $2\ell + 1$. $E_\ell - E_{\ell-1} = \tfrac{\hbar^2\ell}{I}$: lines at $\tfrac{\hbar^2}{I}\times1, 2, 3, \dots$, spacing $\hbar^2/I$.`,
          sol: md`
            **How to see it.** A sphere-like rotor has no preferred axis: only $|L|$ matters.

            $E_\ell$: $0, 2, 6, 12, \dots$ in units of $\tfrac{\hbar^2}{2I}$. Differences: $\tfrac{\hbar^2}{2I}[\ell(\ell+1) - (\ell-1)\ell] = \tfrac{\hbar^2}{2I}\cdot2\ell$. A rotational spectrum is a ladder of equally spaced lines, and the spacing gives the moment of inertia (hence the bond length). The $2\ell + 1$ degeneracy is rotational symmetry: $\hat H$ commutes with every $\hat L_i$.
          ` + rub(['Eigenfunctions, energies, degeneracy, the line spacing.', 'Degeneracy or spacing wrong.', 'Energies only.', md`Energies $\propto \ell^2$ or $\propto m$.`, 'Little progress.']),
        },
        {
          q: md`**(b)** Now $I_x = I_y = I$ and $I_z = 2I$ (a symmetric top). Write $\hat H$ in terms of $\hat L^2$ and $\hat L_z$. Are the $Y_\ell^m$ still eigenfunctions? List the levels with $\ell \le 2$, their energies in units of $\hbar^2/2I$, and their degeneracies.`,
          ans: md`$\hat H = \tfrac{\hat L^2}{2I} - \tfrac{\hat L_z^2}{4I}$; yes, exactly. $E_{\ell m} = \tfrac{\hbar^2}{2I}\left[\ell(\ell+1) - \tfrac{m^2}{2}\right]$: $0$ (1); $1.5$ ($\ell = 1$, $m = \pm1$: 2); $2$ ($\ell = 1$, $m = 0$: 1); $4$ ($\ell = 2$, $m = \pm2$: 2); $5.5$ ($m = \pm1$: 2); $6$ ($m = 0$: 1).`,
          sol: md`
            $\hat L_x^2 + \hat L_y^2 = \hat L^2 - \hat L_z^2$, so $\hat H = \tfrac{\hat L^2 - \hat L_z^2}{2I} + \tfrac{\hat L_z^2}{4I} = \tfrac{\hat L^2}{2I} - \tfrac{\hat L_z^2}{4I}$. Built from $\hat L^2$ and $\hat L_z$ only, so the $Y_\ell^m$ are exact eigenfunctions (no approximation). $E_{\ell m} = \tfrac{\hbar^2}{2I}\ell(\ell+1) - \tfrac{\hbar^2m^2}{4I}$. Ordered: 0, 1.5, 2, 4, 5.5, 6.
          ` + rub(['H rewritten, the eigenfunction argument, all six levels with degeneracies.', 'One level or degeneracy wrong.', 'H right, levels missing.', 'Claims the Y_ℓ^m are no longer eigenfunctions.', 'Little progress.']),
        },
        {
          q: md`**(c)** **Sketch** $E_{\ell m}$ for $\ell = 1, 2$ as a function of $\varepsilon$ when $I_z = (1 + \varepsilon)I$ (so $E_{\ell m} = \tfrac{\hbar^2}{2I}\left[\ell(\ell+1) - \tfrac{\varepsilon}{1+\varepsilon}m^2\right]$), for $-0.5 < \varepsilon < 1$. For $\varepsilon > 0$, which $|m|$ lies lowest in each $\ell$, and what is the classical reason? Which degeneracy survives, and which symmetry protects it?`,
          ans: md`Lines fanning out from each $\ell(\ell+1)$ at $\varepsilon = 0$; $m = 0$ flat, larger $|m|$ bend down for $\varepsilon > 0$ (up for $\varepsilon < 0$). For $\varepsilon > 0$, $|m| = \ell$ lies lowest: rotating about the axis with the larger moment of inertia is cheaper at fixed $|L|$. $\pm m$ stay degenerate (twofold), protected by symmetry under rotations by $\pi$ about an axis $\perp z$ (or reflection through a plane containing $z$), which flip $L_z$.`,
          figs: { top: { svg: figTop, cap: 'Symmetric-top levels in units of $\\hbar^2/2I$ against $\\varepsilon$ ($I_z = (1+\\varepsilon)I$). Each $\\ell$ multiplet fans out by $|m|$; $\\pm m$ stay together.' } },
          sol: md`
            [[fig:top]]

            Classically $E = \tfrac{L_\perp^2}{2I} + \tfrac{L_z^2}{2I_z}$ at fixed $L^2 = L_\perp^2 + L_z^2$; if $I_z > I$, putting the angular momentum along $z$ costs less. Since $E$ depends on $m^2$, clockwise and counterclockwise spin about $z$ have the same energy: the $\pm m$ degeneracy. It is protected by any operation that flips $L_z$ but leaves the top unchanged. Only a term linear in $\hat L_z$ (a magnetic field along $z$) would split it.
          ` + rub(['Correct fan diagram, |m| = ℓ lowest with the classical reason, the ±m degeneracy and its symmetry.', 'Diagram right, one explanation missing.', 'Diagram only.', 'All m split, or the slopes have the wrong sign.', 'Little progress.']),
        },
        {
          q: md`**(d)** The symmetric top of (b) is in $Y = \tfrac{1}{\sqrt2}\left(Y_1^1 + Y_1^{-1}\right)$. True or false (justify each): (i) "The angular probability distribution $|Y(\theta, \varphi, t)|^2$ never changes in time." (ii) "Adding a term $-\gamma B\hat L_z$ to $\hat H$ leaves (i) true, because $\langle L_z\rangle = 0$ in this state."`,
          ans: md`(i) **True**: $Y_1^{\pm1}$ have the same energy, so $Y$ is itself an energy eigenstate (it is $\propto y/r$, a dumbbell along $y$) and only a global phase evolves. (ii) **False**: the field shifts $Y_1^{\pm1}$ by $\mp\gamma B\hbar$; the relative phase evolves, and the dumbbell rotates about $z$ with angular frequency $\gamma B$ (Larmor precession), even though $\langle L_z\rangle = 0$ throughout.`,
          sol: md`
            $Y_1^1 + Y_1^{-1} = -2i\sqrt{3/8\pi}\,\sin\theta\sin\varphi$, so $Y \propto y/r$.

            (i) Any superposition within one degenerate level is an eigenstate: $\Psi(t) = Ye^{-iEt/\hbar}$, and $|\Psi|^2$ is frozen.

            (ii) With $-\gamma B\hat L_z$: $E_{\pm1} \to E \mp\gamma B\hbar$. Then $\Psi \propto e^{i(\varphi + \gamma Bt)} - e^{-i(\varphi + \gamma Bt)} \propto \sin(\varphi + \gamma Bt)$ times $\sin\theta$: the pattern rotates rigidly about $z$ at angular frequency $\gamma B$. $\langle L_z\rangle$ is conserved (it is still 0), but the *orientation* of the dumbbell is not: a nonzero average is not needed for motion, a broken degeneracy is.
          ` + rub(['Both verdicts with the degeneracy argument and the rotation found.', 'Both verdicts right, one justification weak.', 'One verdict right with reason.', 'Both wrong but some relevant physics.', 'Correct verdicts, no justification.']),
        },
      ],
    },
    {
      head: md`
        **3  The three-dimensional oscillator** [20 points, 5 per part]

        $V = \tfrac12m\omega^2(x^2 + y^2 + z^2) = \tfrac12m\omega^2r^2$. The Schrödinger equation separates in Cartesian coordinates: $\psi_{n_xn_yn_z} = \psi_{n_x}(x)\psi_{n_y}(y)\psi_{n_z}(z)$ with $E = \hbar\omega(N + \tfrac32)$, $N = n_x + n_y + n_z$. With $w = \sqrt{\hbar/m\omega}$, the 1D states are $\psi_0 \propto e^{-x^2/2w^2}$, $\psi_1 \propto x\,e^{-x^2/2w^2}$, $\psi_2 \propto (2x^2/w^2 - 1)e^{-x^2/2w^2}$. Useful: $x \pm iy = r\sin\theta\,e^{\pm i\varphi}$, $z = r\cos\theta$. Spherical harmonics with $\ell$ have parity $(-1)^\ell$.
      `,
      items: [
        {
          q: md`**(a)** Find the degeneracy of the levels $N = 0, 1, 2, 3$, and derive the general formula.`,
          ans: md`$1, 3, 6, 10$; $g_N = \tfrac{(N+1)(N+2)}{2}$.`,
          sol: md`
            Count the ways to write $N = n_x + n_y + n_z$ with non-negative integers. For fixed $n_x$ there are $N - n_x + 1$ choices of $n_y$ (then $n_z$ is fixed). $\sum_{n_x=0}^N(N - n_x + 1) = 1 + 2 + \dots + (N+1) = \tfrac{(N+1)(N+2)}{2}$.
          ` + rub(['Counts and the derivation.', 'Formula right, one count wrong.', 'Counts by listing, no formula.', 'Uses (2ℓ+1) logic and gets 1, 3, 5, 7.', 'Little progress.']),
        },
        {
          q: md`**(b)** Show that the $N = 1$ states form a single $\ell = 1$ multiplet. Which combination has $L_z = +\hbar$? Which has $L_z = 0$?`,
          ans: md`$\psi_{100}, \psi_{010}, \psi_{001} \propto (x, y, z)\,e^{-r^2/2w^2} = r\,e^{-r^2/2w^2}\times(\sin\theta\cos\varphi, \sin\theta\sin\varphi, \cos\theta)$: radial factor times $\ell = 1$ angular functions. $L_z = +\hbar$: $(x + iy)e^{-r^2/2w^2} \propto r e^{-r^2/2w^2}Y_1^1$. $L_z = 0$: $z\,e^{-r^2/2w^2}$.`,
          sol: md`
            **How to see it.** The Gaussian $e^{-(x^2+y^2+z^2)/2w^2} = e^{-r^2/2w^2}$ is spherically symmetric, so the angular dependence sits entirely in the prefactor $x$, $y$ or $z$, which are $r$ times the $\ell = 1$ functions.

            $x + iy = r\sin\theta\,e^{i\varphi} \propto rY_1^1$ (eigenvalue $\hbar$ of $-i\hbar\partial_\varphi$), $x - iy \propto rY_1^{-1}$, $z \propto rY_1^0$. Three states, one $\ell = 1$ multiplet: exactly the degeneracy that rotational symmetry requires.
          ` + rub(['Gaussian is radial, x, y, z are ℓ = 1, both combinations.', 'One combination wrong.', 'Shows ℓ = 1 without the Lz combinations.', 'Claims x, y, z states are Lz eigenstates.', 'Little progress.']),
        },
        {
          q: md`**(c)** For $N = 2$: find the combination of $\psi_{200}, \psi_{020}, \psi_{002}$ with $\ell = 0$, and say which $\ell$ the other five states must have. Explain why rotational symmetry does **not** explain this level's degeneracy. **Without calculating**, which $\ell$ values make up $N = 3$?`,
          ans: md`$\psi_{200} + \psi_{020} + \psi_{002} \propto (2r^2/w^2 - 3)e^{-r^2/2w^2}$: $\ell = 0$. The other five ($xy$, $yz$, $zx$, $x^2 - y^2$, $2z^2 - x^2 - y^2$ times the Gaussian) are $\ell = 2$. Rotations never change $\ell$, so they can't relate the $\ell = 0$ state to the $\ell = 2$ states: an accidental degeneracy. $N = 3$: parity $(-1)^3$ means odd $\ell$, and $10 = 7 + 3$: $\ell = 3$ and $\ell = 1$.`,
          sol: md`
            $\sum_i(2x_i^2/w^2 - 1) = 2r^2/w^2 - 3$, a function of $r$ only: $\ell = 0$. Six states minus one leaves five, and a multiplet of five is $\ell = 2$; every state is a quadratic in $x, y, z$ (even parity) consistent with $\ell = 2$.

            Rotational symmetry guarantees $(2\ell + 1)$-fold degeneracy *within* each $\ell$. Here $1 + 5$ states with different $\ell$ share an energy: that needs a larger (hidden) symmetry. In spherical language $E = \hbar\omega(2k + \ell + \tfrac32)$: only $2k + \ell$ matters.

            $N = 3$: each state is a cubic polynomial times the Gaussian, so parity $-1$: $\ell$ odd. With $2k + \ell = 3$: $\ell = 3$ ($k = 0$, 7 states) and $\ell = 1$ ($k = 1$, 3 states). $7 + 3 = 10$ ✓.
          ` + rub(['ℓ = 0 combination, ℓ = 2 for the rest, the accidental-degeneracy argument, N = 3 content.', 'One of the four missing.', 'Combination right, no symmetry argument.', 'Says rotational symmetry explains it.', 'Little progress.']),
        },
        {
          q: md`**(d)** True or false? Justify each. (i) "Every state with $N = 1$ has $L^2 = 2\hbar^2$." (ii) "The Cartesian state $\psi_{200} = \psi_2(x)\psi_0(y)\psi_0(z)$ has a definite value of $L^2$."`,
          ans: md`(i) **True**: all of $N = 1$ is the single $\ell = 1$ multiplet, so any superposition has $\ell = 1$. (ii) **False**: $2x^2/w^2 - 1 = \tfrac13(2r^2/w^2 - 3) + \tfrac{2}{3w^2}(3x^2 - r^2)$, a mix of $\ell = 0$ and $\ell = 2$.`,
          sol: md`
            (i) $L^2$ is $2\hbar^2$ on every vector of the $N = 1$ space, so on every superposition.

            (ii) Split $x^2$ into its direction average and the rest: $x^2 = \tfrac{r^2}{3} + \tfrac13(3x^2 - r^2)$. The first piece is $\ell = 0$, the second is one of the $\ell = 2$ functions. $\psi_{200}$ is an energy eigenstate (inside a degenerate level that mixes $\ell$), but not an $L^2$ eigenstate. This is why one chooses spherical coordinates when one wants $\ell$ and $m$ sharp.
          ` + rub(['Both verdicts with the ℓ-content arguments.', 'Both verdicts, one justification weak.', 'One verdict right with reason.', 'Some relevant physics, verdicts wrong.', 'Correct verdicts, no justification.']),
        },
      ],
    },
  ], {
    q: md`Enter: 1(a) $P(n = 0)$ for $\alpha = 2$; 1(a) $\sigma_H/\hbar\omega$; 1(d) $\sigma_x/w$ in $\ket{N=4}$; 2(b) $E_{2,\pm2}$ in units of $\hbar^2/2I$; 3(a) degeneracy of $N = 3$.`,
    parts: [
      { lbl: md`P(n=0)`, ans: EXP(-4) },
      { lbl: md`\sigma_H/\hbar\omega`, ans: 2 },
      { lbl: md`\sigma_x/w`, ans: SQ(4.5) },
      { lbl: md`E_{2,\pm2}`, ans: 4 },
      { lbl: md`g_3`, ans: 10 },
    ],
    sol: md`$0.0183$, $2$, $2.121$, $4$, $10$.`,
  }, md`[Topic 16: coherent states](#/l/t16-coherent), [Topic 15: oscillator motion](#/l/t15-shomotion), [Topic 17: QM in 3D](#/l/t17-3d), [Topic 19: the rigid rotor](#/l/t19-Ylm), [Topic 21: accidental degeneracy](#/l/t21-hydrogen).`);

  // ================================================================== Practice midterm 5
  const pm5 = exam(5, md`**This exam:** an oscillator state that breathes instead of sloshing, which components of angular momentum can be sharp together (and what a uniform force conserves), and a p state in an unknown central potential with a describe-the-steps part and two true-or-false parts.`, [
    {
      head: md`
        **1  A breathing oscillator** [20 points, 5 per part]

        The oscillator ($m$, $\omega$) with $E_n = \hbar\omega(n + \tfrac12)$,
        $$\hat x = \sqrt{\frac{\hbar}{2m\omega}}\left(\hat a_+ + \hat a_-\right),\qquad \hat p = i\sqrt{\frac{\hbar m\omega}{2}}\left(\hat a_+ - \hat a_-\right),\qquad \hat a_+\ket n = \sqrt{n+1}\ket{n+1},\qquad \hat a_-\ket n = \sqrt n\ket{n-1},$$
        $\psi_0 = \left(\tfrac{m\omega}{\pi\hbar}\right)^{1/4}e^{-\xi^2/2}$, $\psi_2 = \left(\tfrac{m\omega}{\pi\hbar}\right)^{1/4}\tfrac{1}{\sqrt2}\left(2\xi^2 - 1\right)e^{-\xi^2/2}$, $\xi = x/w$, $w = \sqrt{\hbar/m\omega}$. At $t = 0$: $\ket{\Psi(0)} = \tfrac{1}{\sqrt2}\left(\ket0 - \ket2\right)$.
      `,
      items: [
        {
          q: md`**(a)** **Without calculating**, show that $\langle x\rangle = \langle p\rangle = 0$ at all times; give two independent reasons. What are the possible results of an energy measurement, their probabilities, and $\langle H\rangle$?`,
          ans: md`(1) $\hat x$, $\hat p$ change $n$ by $\pm1$, but only $n = 0$ and $n = 2$ are present: no neighbors, no cross terms. (2) $\Psi(x,t)$ is even for all $t$ (both $\psi_0$, $\psi_2$ are even), so $|\Psi|^2$ is even and $\Psi'$ odd. $E = \tfrac12\hbar\omega$ or $\tfrac52\hbar\omega$, $\tfrac12$ each; $\langle H\rangle = \tfrac32\hbar\omega$.`,
          sol: md`
            **How to see it.** Sloshing needs adjacent levels (odd and even mixed). With only even levels the packet stays centered, but it can still change *width*: the $n \leftrightarrow n\pm2$ interference shows up in $\langle x^2\rangle$.

            Reason 1: $\langle x\rangle \propto \sum c_n^*c_{n\pm1}\cdots$, and no two populated levels differ by 1. Reason 2: parity is conserved ($V$ even), the state starts even, so it stays even; $\int x|\Psi|^2 = 0$ and $\langle p\rangle = -i\hbar\int\Psi^*\Psi' = 0$ (odd integrand).

            Energies: $P = |c_n|^2 = \tfrac12$ each; $\langle H\rangle = \tfrac12\left(\tfrac12 + \tfrac52\right)\hbar\omega = \tfrac32\hbar\omega$.
          ` + rub(['Both reasons and the energy statistics.', 'One reason only, energies right.', md`Energies right, $\langle x\rangle = 0$ only at $t = 0$ argued.`, md`Claims $\langle x\rangle$ oscillates at $2\omega$.`, 'Little progress.']),
        },
        {
          q: md`**(b)** Find $\langle x^2\rangle(t)$ with the ladder operators, and from it $\sigma_x(t)$. At what frequency does the width oscillate? Find the smallest and largest $\sigma_x$ and when they occur.`,
          ans: md`$\langle x^2\rangle = \tfrac{\hbar}{2m\omega}\left(3 - \sqrt2\cos2\omega t\right)$. Frequency $2\omega$ (period $\pi/\omega$). Smallest $\sigma_x = w\sqrt{(3 - \sqrt2)/2} = 0.89w$ at $t = 0$; largest $w\sqrt{(3 + \sqrt2)/2} = 1.49w$ at $t = \pi/2\omega$.`,
          sol: md`
            $\hat x^2 = \tfrac{\hbar}{2m\omega}\left(\hat a_+^2 + \hat a_-^2 + 2\hat N + 1\right)$ (using $\hat a_-\hat a_+ = \hat N + 1$).

            $\langle2N + 1\rangle = \tfrac12(1) + \tfrac12(5) = 3$. $\langle\hat a_-^2\rangle = c_0^*c_2\sqrt2\,e^{-i(E_2 - E_0)t/\hbar} = \left(\tfrac{1}{\sqrt2}\right)\left(-\tfrac{1}{\sqrt2}\right)\sqrt2\,e^{-2i\omega t} = -\tfrac{1}{\sqrt2}e^{-2i\omega t}$; $\langle\hat a_+^2\rangle$ is its conjugate. Sum: $-\sqrt2\cos2\omega t$.

            $\langle x^2\rangle = \tfrac{\hbar}{2m\omega}\left(3 - \sqrt2\cos2\omega t\right)$, and $\sigma_x^2 = \langle x^2\rangle$ since $\langle x\rangle = 0$. The beat frequency is $(E_2 - E_0)/\hbar = 2\omega$. (Even the narrowest moment is wider than the ground state, $0.71w$.)
          ` + rub(['Ladder algebra with the cross term, frequency 2ω, both extremes with times.', 'One extreme or the time wrong.', md`Constant part right, cross term missing (no time dependence).`, md`Frequency $\omega$.`, 'Little progress.']),
        },
        {
          q: md`**(c)** **Sketch** $|\Psi(x, 0)|^2$ and $|\Psi(x, \pi/2\omega)|^2$ on the same axes. Show that at $t = \pi/2\omega$ the state is $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$ up to a global phase, and point out the features that distinguish the two curves.`,
          ans: md`At $t = \pi/2\omega$ the relative phase $e^{-2i\omega t} = -1$ flips the sign of the $\ket2$ term. $t = 0$: $\psi_0 - \psi_2$ adds at the center, a single narrow peak. $t = \pi/2\omega$: $\psi_0 + \psi_2$ cancels at the center (density $\approx0.02/w$ there) and piles up near $|\xi| \approx 1.5$: two side humps, wider.`,
          figs: { br: { svg: figBreathe, cap: '$|\\Psi|^2$ (units $1/w$) at $t = 0$ (narrow, peaked at the center) and half a breathing period later (wide, nearly empty at the center).' } },
          sol: md`
            $\ket{\Psi(t)} = \tfrac{1}{\sqrt2}e^{-i\omega t/2}\left(\ket0 - e^{-2i\omega t}\ket2\right)$. At $2\omega t = \pi$: $-e^{-i\pi} = +1$, so the state is $\tfrac{1}{\sqrt2}(\ket0 + \ket2)$ times a phase.

            At the center $\psi_2(0) = -\psi_0(0)/\sqrt2$: $\psi_0 - \psi_2$ is $1 + 1/\sqrt2$ times $\psi_0(0)$ there, $\psi_0 + \psi_2$ only $1 - 1/\sqrt2$.

            [[fig:br]]

            Both curves are even and have the same area; the second is wider, consistent with (b).
          ` + rub(['Phase argument and two correct, distinct, even sketches.', 'Sketches swapped (wide one at t = 0).', 'Phase right, one sketch wrong.', 'Sketch shifted sideways (sloshing).', 'Little progress.']),
        },
        {
          q: md`**(d)** With $\langle p^2\rangle = \tfrac{\hbar m\omega}{2}\left(3 + \sqrt2\cos2\omega t\right)$, find $\sigma_x\sigma_p$ at $t = 0$ and show it is the smallest value over time. Is this ever a minimum-uncertainty state? Give a classical picture of why the width oscillates at **twice** the oscillator frequency.`,
          ans: md`$\sigma_x\sigma_p = \tfrac\hbar2\sqrt{(3 - \sqrt2\cos2\omega t)(3 + \sqrt2\cos2\omega t)} = \tfrac\hbar2\sqrt{9 - 2\cos^22\omega t} \ge \tfrac{\sqrt7}{2}\hbar = 1.32\hbar$, smallest at $t = 0$ (and every $\pi/2\omega$). Never $\hbar/2$. Classically: a cloud of oscillators all at rest at $t = 0$, spread symmetrically about 0; each passes through the center and reaches a turning point twice per period, so the cloud's width pulses at $2\omega$.`,
          sol: md`
            **How to see it.** When the cloud is narrow in $x$ it is broad in $p$ and vice versa, a quarter breathing period apart, like energy swapping between $\langle V\rangle$ and $\langle T\rangle$.

            Product: $\sigma_x^2\sigma_p^2 = \tfrac{\hbar^2}{4}(9 - 2\cos^22\omega t)$, minimized when $\cos^2 = 1$: $\tfrac{\hbar^2}{4}\cdot7$. So $\sigma_x\sigma_p \ge 1.32\hbar > \hbar/2$ always.

            Classical picture: $x_i(t) = x_i(0)\cos\omega t$ for every member of an ensemble released at rest: the spread is $\propto|\cos\omega t|$, which repeats every half period. (Here the cloud also has momentum spread at $t = 0$, so it never collapses to zero width, but the $2\omega$ rhythm is the same.) Also $\langle T\rangle - \langle V\rangle \propto \cos2\omega t$ oscillates, consistent with $\tfrac{d}{dt}\langle xp + px\rangle = 4(\langle T\rangle - \langle V\rangle)$.
          ` + rub(['Product, minimum, never ħ/2, and the classical 2ω picture.', 'Numbers right, picture missing or wrong.', 'Product at t = 0 only.', 'Claims it saturates ħ/2.', 'Little progress.']),
        },
      ],
    },
    {
      head: md`
        **2  Which components can be sharp?** [20 points, 5 per part]

        $[\hat r_i, \hat p_j] = i\hbar\delta_{ij}$, $[\hat r_i, \hat r_j] = [\hat p_i, \hat p_j] = 0$; $\hat{\vb L} = \hat{\vb r}\times\hat{\vb p}$, e.g. $\hat L_z = \hat x\hat p_y - \hat y\hat p_x$, $\hat L_x = \hat y\hat p_z - \hat z\hat p_y$. $[\hat L_x, \hat L_y] = i\hbar\hat L_z$ (and cyclic), $\hat L^2 = \hat L_x^2 + \hat L_y^2 + \hat L_z^2$, $[\hat L^2, \hat L_i] = 0$. Generalized Ehrenfest: $\tfrac{d\langle Q\rangle}{dt} = \tfrac i\hbar\langle[\hat H, \hat Q]\rangle$ for $\hat Q$ without explicit $t$.
      `,
      items: [
        {
          q: md`**(a)** Compute $[\hat L_z, \hat x]$, $[\hat L_z, \hat y]$, $[\hat L_z, \hat z]$ and $[\hat L_z, \hat r^2]$.`,
          ans: md`$i\hbar\hat y$, $-i\hbar\hat x$, $0$, $0$.`,
          sol: md`
            **How to see it.** $\hat L_z$ generates rotations about $z$: it turns $x$ into $y$ and $y$ into $-x$, leaves $z$ and $r$ alone.

            $[\hat x\hat p_y - \hat y\hat p_x, \hat x] = -\hat y[\hat p_x, \hat x] = i\hbar\hat y$. $[\hat x\hat p_y, \hat y] = \hat x[\hat p_y, \hat y] = -i\hbar\hat x$. $\hat z$ commutes with $\hat x, \hat y, \hat p_x, \hat p_y$: 0.

            $[\hat L_z, \hat x^2 + \hat y^2] = \hat x(i\hbar\hat y) + (i\hbar\hat y)\hat x + \hat y(-i\hbar\hat x) + (-i\hbar\hat x)\hat y = 0$, and $[\hat L_z, \hat z^2] = 0$.
          ` + rub(['All four with correct signs.', 'One sign wrong.', 'Two wrong.', 'Treats L_z as commuting with all coordinates.', 'Little progress.']),
        },
        {
          q: md`**(b)** Decide, with a commutator reason, which pairs have a complete set of simultaneous eigenstates: $\{\hat L^2, \hat L_z\}$, $\{\hat L_z, \hat z\}$, $\{\hat L_z, \hat x\}$, $\{\hat L_x, \hat L_z\}$. For each compatible pair, name an example of a state in which both are sharp.`,
          ans: md`$\{L^2, L_z\}$: yes, $[\hat L^2, \hat L_z] = 0$; e.g. $Y_\ell^m$. $\{L_z, z\}$: yes, commutator 0; e.g. $f(s)\,\delta(z - z_0)\,e^{im\varphi}$ (cylindrical coordinates). $\{L_z, x\}$: no, $[\hat L_z, \hat x] = i\hbar\hat y \ne 0$. $\{L_x, L_z\}$: no, $[\hat L_x, \hat L_z] = -i\hbar\hat L_y$; only $\ell = 0$ states have both sharp.`,
          sol: md`
            Commuting Hermitian operators share a complete eigenbasis; non-commuting ones can only share isolated special states.

            $\{L_z, z\}$: rotations about $z$ don't move $z$, so knowing the height and the circulation about the $z$ axis together is fine. $\{L_z, x\}$: a sharp $x$ picks out a direction in the $xy$ plane, which a sharp $L_z$ (definite $e^{im\varphi}$, spread over all $\varphi$) forbids. $\{L_x, L_z\}$: see (c).
          ` + rub(['All four verdicts with commutators and examples.', 'One verdict wrong or examples missing.', 'Two wrong.', 'Claims all components of L commute.', 'Little progress.']),
        },
        {
          q: md`**(c)** Can a particle have $L_z = \hbar$ and $L_x = \hbar$ simultaneously sharp? Prove your answer from the commutators alone.`,
          ans: md`No. If $\hat L_z\psi = \lambda_z\psi$ and $\hat L_x\psi = \lambda_x\psi$, then $i\hbar\hat L_y\psi = [\hat L_z, \hat L_x]\psi = 0$, so $\hat L_y\psi = 0$; then $i\hbar\hat L_x\psi = [\hat L_y, \hat L_z]\psi = \hat L_y\hat L_z\psi - \hat L_z\hat L_y\psi = \lambda_z\hat L_y\psi - 0 = 0$, so $\lambda_x = 0 \ne \hbar$. (Likewise $\lambda_z = 0$, and then $\ell = 0$.)`,
          sol: md`
            **How to see it.** Two sharp components would force the third to be sharp too (it is their commutator), and then the commutator relations make all three vanish. Only the state with no angular momentum at all escapes.

            The steps are in the answer. With $\lambda_x = \lambda_y = 0$, the same argument with $[\hat L_x, \hat L_y] = i\hbar\hat L_z$ gives $\lambda_z = 0$, so $\hat L^2\psi = 0$: $\ell = 0$. Classically you can know all three components; quantum mechanically, for $\ell \ge 1$, at most one.
          ` + rub(['Complete commutator proof.', 'Proof with one step missing or sign slip.', 'Correct idea ("they don\'t commute") with partial algebra.', 'Says yes.', 'Answer only.']),
        },
        {
          q: md`**(d)** The particle moves in a central potential plus a uniform force along $z$: $\hat H = \tfrac{\hat p^2}{2m} + V(r) - F\hat z$. Which of $\langle L_z\rangle$, $\langle L^2\rangle$, $\langle L_x\rangle$ are conserved in every state? Compute $d\langle L_x\rangle/dt$ and interpret it classically. (You may use $[\hat L_i, \hat p^2] = [\hat L_i, V(r)] = 0$.)`,
          ans: md`$\langle L_z\rangle$: conserved, since $[\hat L_z, \hat z] = 0$. $\langle L^2\rangle$, $\langle L_x\rangle$: not in general. $[\hat H, \hat L_x] = -F[\hat z, \hat L_x] = -i\hbar F\hat y$, so $\tfrac{d\langle L_x\rangle}{dt} = F\langle y\rangle$: the $x$ component of the torque $\vb r\times F\hat{\vb z} = (Fy, -Fx, 0)$.`,
          sol: md`
            **How to see it.** A force along $z$ exerts torque $\vb r\times\vb F$ with no $z$ component: angular momentum about the force direction is conserved, like a projectile's about the vertical. The other components are twisted by the torque.

            $[\hat z, \hat L_x] = [\hat z, \hat y\hat p_z - \hat z\hat p_y] = \hat y[\hat z, \hat p_z] = i\hbar\hat y$. So $[\hat H, \hat L_x] = -F\cdot i\hbar\hat y$ and $\tfrac{d\langle L_x\rangle}{dt} = \tfrac i\hbar(-i\hbar F)\langle y\rangle = F\langle y\rangle$ ✓. Similarly $\tfrac{d\langle L_y\rangle}{dt} = -F\langle x\rangle$. $L^2$ changes whenever $\langle\vb N\rangle\cdot\vb L \ne 0$ (e.g. a state with $\langle y\rangle \ne 0$ and $L_x$ content). This is HW7's torque theorem with a non-central force.
          ` + rub(['Correct verdicts, the commutator, the torque interpretation.', 'Verdicts right, sign or factor slip in dL_x/dt.', 'L_z conserved argued, the rest asserted.', 'Claims everything is conserved because V is central.', 'Little progress.']),
        },
      ],
    },
    {
      head: md`
        **3  A p state in an unknown central potential** [20 points, 5 per part]

        A particle moves in a central potential $V(r)$ that is not specified. Its state is
        $$\psi(r, \theta, \varphi) = A\,g(r)\left(x + iy + z\right),$$
        with $g$ real. Use $x \pm iy = r\sin\theta\,e^{\pm i\varphi}$, $z = r\cos\theta$, $Y_1^0 = \sqrt{\tfrac{3}{4\pi}}\cos\theta$, $Y_1^{\pm1} = \mp\sqrt{\tfrac{3}{8\pi}}\sin\theta\,e^{\pm i\varphi}$, $\hat L_\pm\ket{\ell,m} = \hbar\sqrt{\ell(\ell+1) - m(m\pm1)}\ket{\ell,m\pm1}$, $\hat L_x = \tfrac12(\hat L_+ + \hat L_-)$. Radial equation: $-\tfrac{\hbar^2}{2m}u'' + V_{\text{eff}}u = Eu$, $u = rR$, $V_{\text{eff}} = V + \tfrac{\hbar^2\ell(\ell+1)}{2mr^2}$. Hydrogen: $R_{21} \propto r\,e^{-r/2a}$, $E_2 = -3.4$ eV.
      `,
      items: [
        {
          q: md`**(a)** **Without any integral**, find the possible outcomes and probabilities of measurements of $\hat L^2$ and of $\hat L_z$, and $\langle L_z\rangle$. Explain why $g(r)$ doesn't matter.`,
          ans: md`$L^2 = 2\hbar^2$ with certainty. $\psi = A\,r\,g(r)\left[-\sqrt{\tfrac{8\pi}{3}}Y_1^1 + \sqrt{\tfrac{4\pi}{3}}Y_1^0\right]$: $P(L_z = \hbar) = \tfrac23$, $P(L_z = 0) = \tfrac13$, $P(-\hbar) = 0$. $\langle L_z\rangle = \tfrac23\hbar$. The radial factor is common to both terms, so it cancels in the ratios.`,
          sol: md`
            **How to see it.** $x$, $y$, $z$ divided by $r$ are the $\ell = 1$ functions, so any linear combination of $x, y, z$ times a radial function is pure $\ell = 1$. Which $m$ appears is decided by the combination.

            $x + iy = r\sin\theta e^{i\varphi} = -\sqrt{8\pi/3}\,rY_1^1$; $z = \sqrt{4\pi/3}\,rY_1^0$. Weights $\tfrac{8\pi}{3} : \tfrac{4\pi}{3} = 2 : 1$ (the radial integral $\int r^4g^2dr$ is the same for both and cancels).
          ` + rub(['L² certain with reason, both L_z probabilities, ⟨L_z⟩, why g drops out.', 'Probabilities 1:1 (forgot the different normalizations), rest right.', 'L² right, L_z attempted without the table.', 'Claims ℓ depends on g(r).', 'Little progress.']),
        },
        {
          q: md`**(b)** Suppose $V(r)$ and $g(r)$ were given. Describe **in words** the steps you would take to find the possible energies and their probabilities. For each step say what you would calculate and why. You do not need explicit equations. Do the $L_z$ probabilities change in time?`,
          ans: md`(1) Only $\ell = 1$ eigenstates can appear (the angular part is pure $\ell = 1$, and different $\ell$ are orthogonal). (2) Solve the $\ell = 1$ radial equation with $u(0) = 0$ and $u \to 0$ at infinity to get $u_{N1}$, $E_{N1}$. (3) Expand the given radial function, $u = r\cdot rg(r)$ (normalized), in the $u_{N1}$: $c_N = \int u_{N1}u\,dr$. (4) $P(E_{N1}) = |c_N|^2$; the $m = 1$ and $m = 0$ parts share the same radial function and $E$ doesn't depend on $m$, so they share these probabilities. (5) If $\sum|c_N|^2 < 1$, the rest is in $E > 0$ scattering states (if $V$ allows them). $L_z$ probabilities are constant: $[\hat H, \hat L_z] = 0$.`,
          sol: md`
            **How to see it.** This is Midterm 1 Problem 3(a) in 3D: decompose into stationary states of the right symmetry, overlap, square. The angular part is already "diagonal", so all the work is radial.

            Steps as in the answer. Common slips the rubric watches for: using $R$ instead of $u = rR$ for the radial overlap (both work if the $r^2$ weight is kept), including $\ell \ne 1$ states, or thinking the two $m$ components could have different energy distributions (they can't: same radial function, $m$-independent radial equation). Time: each $E_N$ component gets $e^{-iE_Nt/\hbar}$ in both $m$ parts; $|c_{N,m}|^2$ and hence $P(L_z)$ never change.
          ` + rub(['ℓ = 1 only, radial eigenproblem, overlap with the right weight, squares, continuum remark, L_z constant.', 'All main steps, one omission (continuum or L_z).', 'Right overall idea, misses that only ℓ = 1 enters or how u is built.', 'Poor understanding of the expansion in stationary states.', 'Generic statements only.']),
        },
        {
          q: md`**(c)** True or false? Justify. "If $V$ is the Coulomb potential of hydrogen and $g(r) = e^{-r/2a}$, an energy measurement gives $-3.4$ eV with certainty."`,
          ans: md`**True.** Then $R(r) \propto r\,g(r) = r\,e^{-r/2a} \propto R_{21}$: $\psi$ is a superposition of $\psi_{211}$ and $\psi_{210}$, both with $E_2 = -3.4$ eV, so it is itself an energy eigenstate.`,
          sol: md`
            $\psi = A\,r\,e^{-r/2a}\times(\text{angular }\ell = 1) \propto R_{21}(r)\left[c_1Y_1^1 + c_0Y_1^0\right]$. Any superposition within one degenerate level is an eigenstate with that energy: $E_2 = -13.6/4 = -3.4$ eV, $\sigma_H = 0$. (Contrast PM3, 3(c): there the energy was known and the *angular* content wasn't; here the radial function fixes $n$.)
          ` + tf('True'),
        },
        {
          q: md`**(d)** True or false? Justify. "The state has no special relation to the $x$ axis, so $\langle L_x\rangle = 0$."`,
          ans: md`**False.** With $(c_1, c_0, c_{-1}) = \left(-\sqrt{\tfrac23}, \sqrt{\tfrac13}, 0\right)$: $\langle L_x\rangle = \text{Re}\langle\hat L_+\rangle = \sqrt2\hbar\,\text{Re}(c_1^*c_0 + c_0^*c_{-1}) = -\tfrac23\hbar$.`,
          sol: md`
            $\langle\hat L_+\rangle = \sum_mc_{m+1}^*c_m\hbar\sqrt{2 - m(m+1)} = \sqrt2\hbar\left(c_1^*c_0 + c_0^*c_{-1}\right) = \sqrt2\hbar\left(-\tfrac{\sqrt2}{3}\right) = -\tfrac23\hbar$; $\langle L_x\rangle = \text{Re}\langle\hat L_+\rangle = -\tfrac23\hbar$ (and $\langle L_y\rangle = \text{Im} = 0$).

            The sign comes from the minus sign in $Y_1^1$: this is why the table's phases matter. Picture: $\langle\vb L\rangle = \left(-\tfrac23, 0, \tfrac23\right)\hbar$, pointing between $+z$ and $-x$, of length $0.94\hbar < \sqrt2\hbar$. The state "$x + iy + z$" does single out directions: the complex vector $(1, i, 1)$ has a definite orientation, and its $x$ and $z$ parts are tied together.
          ` + tf('False'),
        },
      ],
    },
  ], {
    q: md`Enter: 1(b) smallest $\sigma_x/w$; 1(d) smallest $\sigma_x\sigma_p/\hbar$; 3(a) $P(L_z = \hbar)$; 3(d) $\langle L_x\rangle/\hbar$.`,
    parts: [
      { lbl: md`\sigma_{x,\min}/w`, ans: SQ((3 - SQ(2)) / 2) },
      { lbl: md`(\sigma_x\sigma_p)_{\min}/\hbar`, ans: SQ(7) / 2 },
      { lbl: md`P(L_z=\hbar)`, ans: 2 / 3 },
      { lbl: md`\langle L_x\rangle/\hbar`, ans: -2 / 3 },
    ],
    sol: md`$0.890$, $1.323$, $0.667$, $-0.667$.`,
  }, md`[Topic 11: the generalized Ehrenfest theorem](#/l/t11-ehrenfest), [Topic 15: oscillator motion](#/l/t15-shomotion), [Topic 18: angular momentum algebra](#/l/t18-Lalgebra), [Topic 19: measuring L](#/l/t19-Ylm), [Topic 20: the radial equation](#/l/t20-radial), [Topic 21: hydrogen](#/l/t21-hydrogen).`);

  C.unit({
    id: 'u13', exam: 'm2', num: 'Unit 7', title: 'Practice midterms (Midterm 1 format)',
    blurb: 'Timed practice exams built exactly like the real Midterm 1: three problems × four 5-point parts, formulas printed in the problem, a rubric for every part, and the explain, sketch and true-or-false parts that cost the most points. These five are exam level; Unit 8 has five harder ones.',
    lessons: [pm1, pm2, pm3, pm4, pm5],
  });
})();

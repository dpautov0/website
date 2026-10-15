/* Past exams, blank, with full solutions: Spring 2026 Exam 1 and Fall 2024 Exam 1, rebuilt as interactive problems
   with the figures redrawn. Each part shows its point value; solutions explain the reasoning graders look for. */
(function () {
  'use strict';
  const { R, P } = C;
  const FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });
  const MC = (lbl, mc, a, why) => ({ lbl, mc, a, why });   // shuffled
  const N = (lbl, ans, unit, rel = 0.03) => ({ lbl, ans, unit, tol: { rel } });

  // ---------------------------------------------------------------- figures
  // SP26 problem 1: equilibrium band diagram rising by Eg = 1.2 eV across the sample, Ec = EF at x = 0, Ev = EF at x = L
  function sp26Bands() {
    const f = PF.fig({ alt: 'band diagram: Ec, Ei and Ev rise linearly from x = 0 to x = L; EF is flat; Ec meets EF at x = 0, Ei crosses EF at L/2, Ev meets EF at L; a hole sits on Ev' });
    const X = (u) => 40 + u * 260, Y = (E) => 150 - E * 95;          // E in eV relative to EF
    const line = (E0, cls) => f.line(X(0), Y(E0), X(1), Y(E0 + 1.2), { cls });
    line(0, 'curve'); line(-0.6, 'dash dim'); line(-1.2, 'curve');
    f.line(X(0), Y(0), X(1), Y(0), { cls: 'ef' });
    f.label(X(1) + 6, Y(1.2), 'E_c', 'l'); f.label(X(1) + 6, Y(0.6), 'E_i', 'l'); f.label(X(1) + 6, Y(0) + 9, 'E_F', 'l'); f.label(X(1) + 6, Y(0) - 7, 'E_v', 'l');
    for (const [u, t] of [[0, 'X = 0'], [0.5, 'X = L/2'], [1, 'X = L']]) { f.line(X(u), Y(1.3), X(u), Y(-1.25), { cls: 'dash dim thin' }); f.label(X(u), Y(-1.25) + 6, `\\text{${t}}`, 't', 'small'); }
    const hx = 0.66; f.circle(X(hx), Y(-1.2 + 1.2 * hx), 5, { cls: 'bgfill' }); f.text(X(hx) + 8, Y(-1.2 + 1.2 * hx) + 12, 'Hole', 'tl', 'small');
    return f.svg();
  }

  // SP26 problem 2: electron and hole mobility in Si at 300 K versus total impurity concentration (log axis)
  const muN = (N) => 90 + 1270 / (1 + Math.pow(N / 1.248e17, 0.72));
  const muP = (N) => 50 + 430 / (1 + Math.pow(N / 6.18e16, 0.684));
  function sp26Mob() {
    return PF.plot({
      w: 360, h: 250, x: [14, 20], y: [0, 1450], xl: 'N_I\\,(\\text{cm}^{-3})', yl: '\\mu\\,(\\text{cm}^2/\\text{V·s})',
      xt: [[14, '10^{14}'], [15, ''], [16, '10^{16}'], [17, '10^{17}'], [18, '10^{18}'], [19, ''], [20, '10^{20}']],
      yt: [[200, '200'], [400, '400'], [600, '600'], [800, '800'], [1000, '1000'], [1200, '1200'], [1400, '1400']],
      curves: [{ f: (x) => muN(Math.pow(10, x)), lab: '\\mu_n', labAt: 16.6, dx: 6, dy: -8 }, { f: (x) => muP(Math.pow(10, x)), lab: '\\mu_p', labAt: 15, dx: 4, dy: -10 }],
    });
  }

  // SP26 problem 2c: four sketches of electron mobility versus temperature for S1 and S2
  function sp26Sketches() {
    const f = PF.fig({ alt: 'four sketches i to iv of electron mobility versus temperature for samples S1 and S2' });
    const P4 = [
      [['S1', 0.45, 0.6, 0.85, 0.5], ['S2', 0.32, 0.38, 0.68, 0.22]],
      [['S1', 0.55, 0.38, 0.86, 0.44], ['S2', 0.28, 0.62, 0.66, 0.44]],
      [['S2', 0.45, 0.6, 0.85, 0.5], ['S1', 0.32, 0.38, 0.68, 0.22]],
      [['S2', 0.55, 0.38, 0.86, 0.44], ['S1', 0.28, 0.62, 0.66, 0.44]],
    ];
    P4.forEach((curves, k) => {
      const ox = 10 + (k % 2) * 175, oy = 10 + Math.floor(k / 2) * 125, W = 140, H = 90;
      const X = (u) => ox + 18 + u * W, Y = (v) => oy + H - v * H;
      f.line(X(0), Y(0), X(1.04), Y(0), { cls: 'axisl', arrow: 'end', hs: 5 }); f.line(X(0), Y(0), X(0), Y(1.05), { cls: 'axisl', arrow: 'end', hs: 5 });
      f.label(X(0) - 3, Y(1.05), '\\mu_n', 'r', 'small'); f.label(X(1.04) + 3, Y(0), 'T', 'l', 'small');
      f.label(X(0.5), Y(0) + 6, ['\\text{i}', '\\text{ii}', '\\text{iii}', '\\text{iv}'][k], 't', 'small');
      for (const [lab, y0, px, py, y1] of curves) {
        f.pl([[X(0.06), Y(y0)], [X(px), Y(py)], [X(0.96), Y(y1)]], { cls: 'curve' });
        f.label(X(px) + 10, Y(py) - 2, `\\text{${lab}}`, 'bl', 'small');
      }
    });
    return f.svg();
  }

  // F24 problem 2: bands rising 1 eV over the 10 μm sample (the dashed line is the energy zero, not E_F)
  function f24Bands() {
    return PF.plot({
      w: 340, h: 230, x: [0, 10], y: [-1.15, 1.25], xl: '\\text{length}\\,(\\mu\\text{m})', yl: '\\text{energy (eV)}',
      xt: [[10, '10']], yt: [[1, '1'], [0, '0'], [-1, '-1']], hlines: [[0, '']],
      curves: [{ f: (x) => 0.1 * x, lab: 'E_c', labAt: 10, dx: 6, dy: 0 }, { f: (x) => 0.1 * x - 0.5, cls: 'dash', lab: 'E_i', labAt: 10, dx: 6, dy: 0 }, { f: (x) => 0.1 * x - 1, lab: 'E_v', labAt: 10, dx: 6, dy: 0 }],
    });
  }

  // F24 problem 3c: electrons injected at x = 0 into a p-type block
  function f24Inject() {
    const f = PF.fig({ alt: 'electrons injected from the left into a p-type semiconductor block starting at x = 0' });
    f.rect(90, 20, 170, 60, { cls: 'shade' }); f.text(175, 50, 'p-type semiconductor', 'c', 'small');
    for (const y of [30, 45, 60, 75]) f.arrow(40, y, 82, y, { hs: 5 });
    f.text(40, 92, 'electrons injected', 'tl', 'small');
    f.arrow(90, 115, 290, 115, { cls: 'axisl', hs: 6 }); f.label(90, 121, '0', 't', 'small'); f.label(296, 115, 'x', 'l', 'small');
    return f.svg();
  }

  // ---------------------------------------------------------------- Spring 2026 Exam 1
  const sp26 = [
    R(md`
      **Spring 2026 · ECE 340 · Exam 1.** Three problems, 100 points, 60 minutes. Closed book, formula sheet provided, calculator allowed. Show your reasoning: credit goes to the method as much as the number. Work each part on paper, enter your answers, then read the full solution.
    `),
    R(md`### Problem 1 (33 points)

A semiconductor in **equilibrium** has the band diagram below. Band gap $E_g = 1.2$ eV, $n_i = 10^{11}\,\text{cm}^{-3}$, $kT = 0.026$ eV.

[[fig:b]]`),
    P({ src: 'SP26 · 1a (8 pts)', q: md`(a) At $X = L/2$, what are (i) the electron concentration $n$ and (ii) the hole concentration $p$?`, fig: sp26Bands(),
      parts: [N('n(L/2)', 1e11, 'cm^{-3}'), N('p(L/2)', 1e11, 'cm^{-3}')],
      sol: md`At $X = L/2$ the Fermi level crosses $E_i$: $E_F = E_i$, so $n = n_ie^{(E_F - E_i)/kT} = n_i$ and likewise $p = n_i$. Both are $10^{11}\,\text{cm}^{-3}$ (check: $np = n_i^2$ at equilibrium).` }),
    P({ src: 'SP26 · 1b (10 pts)', q: md`(b) At $X = L/4$: (i) is the material n-type or p-type? (ii) What is $n(L/4)$?`,
      parts: [FIX('(i) At L/4 the material is…', ['n-type', 'p-type', 'intrinsic'], 0, [null, 'At $L/4$, $E_F$ is above $E_i$ (closer to $E_c$): more electrons than holes.', 'Only at $L/2$ does $E_F = E_i$.']), N('n(L/4)', 1.0259e16, 'cm^{-3}')],
      sol: md`The bands rise linearly: at $X = 0$, $E_c = E_F$ (so $E_i = E_F - 0.6$ eV); at $X = L/2$, $E_i = E_F$. So at $L/4$, $E_i$ is halfway between: $E_F - E_i = 0.3$ eV, which is above $E_i$: **n-type**.
$$n = n_ie^{(E_F - E_i)/kT} = 10^{11}e^{0.3/0.026} = 10^{11}e^{11.54} = 1.03\times10^{16}\,\text{cm}^{-3}$$` }),
    P({ src: 'SP26 · 1c (6 pts)', q: md`(c) What is the approximate kinetic energy of the hole shown in the diagram?`,
      parts: [MC('', ['about 0 eV (at the band edge)', 'about 0.6 eV ($E_g/2$)', 'about 1.2 eV ($E_g$)', 'about 0.3 eV (height above $E_F$)'], 0,
        [null, 'Kinetic energy is measured from the band edge, not from midgap.', 'That is the gap, not the hole’s energy above its band edge.', 'Distance to $E_F$ is not kinetic energy.'])],
      sol: md`A hole's kinetic energy is its distance **below** $E_v$ at its own position (hole energy increases downward). The hole is drawn right on the $E_v$ line, so its kinetic energy is about **0 eV**: all its energy is potential energy ($E_v$ there). The slope of the bands is a force, not kinetic energy.` }),
    P({ src: 'SP26 · 1d (9 pts)', q: md`(d) If $L = 10\,\mu$m, what is the magnitude of the electric field inside the semiconductor? Which way does it point?`,
      parts: [N('|\\mathscr{E}|', 1200, 'V/cm'), FIX('Direction', ['toward $+x$', 'toward $-x$', 'no field: $E_F$ is flat'], 0,
        [null, 'The field points the way the bands rise: $\\mathscr{E} = \\tfrac1q\\,dE_c/dx > 0$.', 'Flat $E_F$ means no current, not no field; the bands slope.'])],
      sol: md`$$\mathscr{E} = \frac1q\frac{dE_c}{dx} = \frac{1.2\,\text{eV}/q}{10\,\mu\text{m}} = \frac{1.2\,\text{V}}{10^{-3}\,\text{cm}} = 1.2\times10^{3}\,\text{V/cm}\ (= 1.2\times10^5\,\text{V/m})$$
The bands rise by $E_g = 1.2$ eV from $E_c = E_F$ at $X = 0$ to $E_v = E_F$ at $X = L$. Dividing an energy in eV by $q$ gives volts directly; leaving it in joules per meter (the common mistake) is not a field. It points toward $+x$, the way the bands rise; electrons are pushed toward $-x$ (downhill on $E_c$).` }),
    R(md`### Problem 2 (33 points)

Two Si samples at 300 K. **S1**: acceptors $N_a = 1\times10^{17}\,\text{cm}^{-3}$. **S2**: acceptors $N_a = 1\times10^{17}$ **and** donors $N_d = 5\times10^{17}\,\text{cm}^{-3}$. Electron and hole mobility versus total impurity concentration is shown. $n_i = 1.5\times10^{10}\,\text{cm}^{-3}$.`),
    P({ src: 'SP26 · 2a (10 pts)', q: md`(a) Calculate the conductivity of S1.`, fig: sp26Mob(),
      parts: [N('\\sigma_{S1}', 3.68, '(Ω·cm)^{-1}', 0.12)],
      hints: [md`Majority holes, $p = N_a$; read $\mu_p$ at $N_I = 10^{17}$.`],
      sol: md`S1 is p-type with $p \approx N_a = 10^{17}$ and $n = n_i^2/p = 2.25\times10^3$ (negligible). The impurity concentration is $10^{17}$, where the figure gives $\mu_p \approx 230\,\text{cm}^2/\text{V·s}$:
$$\sigma = q(n\mu_n + p\mu_p) \approx qp\mu_p = (1.6\times10^{-19})(10^{17})(230) = 3.7\,(\Omega\,\text{cm})^{-1}$$` }),
    P({ src: 'SP26 · 2b (13 pts)', q: md`(b) Calculate the conductivity of S2. State the doping (net) concentration, the majority-carrier mobility, and the impurity concentration you used to read it.`, fig: sp26Mob(),
      parts: [FIX('S2 is…', ['n-type', 'p-type'], 0, [null, 'Donors (5×10¹⁷) outnumber acceptors (1×10¹⁷).']), N('\\text{net doping}', 4e17, 'cm^{-3}'), N('N_I\\ (\\text{for the mobility})', 6e17, 'cm^{-3}'), N('\\mu_n', 400, 'cm^2/V·s', 0.15), N('\\sigma_{S2}', 25.6, '(Ω·cm)^{-1}', 0.15)],
      sol: md`**Carriers follow the net doping:** $n = N_d - N_a = 4\times10^{17}$ (n-type), $p = n_i^2/n \approx 560$, negligible.

**Mobility follows the total impurities:** every ionized dopant scatters, so $N_I = N_d + N_a = 6\times10^{17}$, where $\mu_n \approx 400\,\text{cm}^2/\text{V·s}$.
$$\sigma = qn\mu_n = (1.6\times10^{-19})(4\times10^{17})(400) = 25.6\,(\Omega\,\text{cm})^{-1}$$
Common mistakes: using $n = N_d = 5\times10^{17}$ (ignores the acceptors that swallowed donor electrons), adding a hole term with $p = N_a$ (there are no free holes: they recombined with the donor electrons), or reading $\mu_n$ at $4\times10^{17}$ instead of $6\times10^{17}$.` }),
    P({ src: 'SP26 · 2c (10 pts)', q: md`(c) Which sketch correctly shows the electron mobility versus temperature for S1 and S2? Justify briefly.`, fig: sp26Sketches(),
      parts: [FIX('', ['i', 'ii', 'iii', 'iv'], 1, ['S1 and S2 should merge at high $T$, where lattice scattering (the same in both) dominates; and S2’s peak should be at a higher $T$, not a lower one.', null, 'S2 has 6× the ionized impurities: its mobility must be **lower**, not higher.', 'S2 must be lower, and its peak at a higher temperature.'])],
      sol: md`**ii.** Three facts decide it:

1. **S2 is lower at low $T$.** It has $N_I = 6\times10^{17}$ against S1's $10^{17}$, so ionized-impurity scattering ($\mu_I \propto T^{3/2}/N_I$) is stronger.
2. **S2 peaks at a higher temperature.** Mobility rises with $T$ while impurity scattering dominates and falls once lattice scattering ($\mu_L \propto T^{-3/2}$) takes over. With more impurities, impurity scattering stays dominant up to a higher $T$.
3. **They merge at high $T$.** There lattice scattering, identical in both samples, dominates.

Only sketch ii has S1 above S2, S2's peak to the right, and the curves joining at high $T$.` }),
    R(md`### Problem 3 (34 points)

A uniformly doped n-type Si sample at 300 K: $N_D = 1.5\times10^{16}\,\text{cm}^{-3}$, $\tau_n = \tau_p = 15\,\mu$s, $\mu_n = 1350$, $\mu_p = 450\,\text{cm}^2/\text{V·s}$, $n_i = 1.5\times10^{10}\,\text{cm}^{-3}$. 10% numerical accuracy is acceptable.`),
    P({ src: 'SP26 · 3a (8 pts)', q: md`(a) The sample is illuminated uniformly with a constant optical generation rate $G = 10^{19}\,\text{cm}^{-3}\text{s}^{-1}$. Find the steady-state excess concentrations $\delta n$ and $\delta p$. Is this low-level or high-level injection?`,
      parts: [N('\\delta n = \\delta p', 1.5e14, 'cm^{-3}', 0.05), FIX('Injection level', ['low level', 'high level'], 0, [null, 'Compare $\\delta p$ with the **majority** concentration $n_0 = 1.5\\times10^{16}$, not with $p_0$.'])],
      sol: md`Steady state: generation = recombination, $\delta p = G\tau_p = (10^{19})(15\times10^{-6}) = 1.5\times10^{14}\,\text{cm}^{-3} = \delta n$.

**Low level**, because $\delta p = 1.5\times10^{14} \ll n_0 = 1.5\times10^{16}$. (It is enormous compared with $p_0 = 1.5\times10^4$, but that doesn't make it high level: low level means the excess is small next to the majority concentration, so the lifetime stays $1/\alpha_rn_0$.)` }),
    P({ src: 'SP26 · 3b (7 pts)', q: md`(b) The illumination is suddenly turned off at $t = 0$. Write the total hole concentration for $t > 0$, and evaluate it at $t = 15\,\mu$s.`,
      parts: [MC('p(t) =', [md`$1.5\times10^{4} + 1.5\times10^{14}\,e^{-t/15\,\mu\text{s}}\ \text{cm}^{-3}$`, md`$1.5\times10^{14}\,e^{-t/15\,\mu\text{s}}\ \text{cm}^{-3}$`, md`$1.5\times10^{4}\,e^{-t/15\,\mu\text{s}}\ \text{cm}^{-3}$`, md`$1.5\times10^{16} + 1.5\times10^{14}\,e^{-t/15\,\mu\text{s}}\ \text{cm}^{-3}$`], 0,
        [null, 'That is only the excess; the total includes $p_0$ (it never decays below $p_0$).', 'The excess decays, not the equilibrium part.', 'That adds the electron concentration.']), N('p(15\\,\\mu\\text{s})', 5.518e13, 'cm^{-3}', 0.05)],
      sol: md`Low level, so the excess decays exponentially with the minority lifetime: $p(t) = p_0 + \delta p(0)e^{-t/\tau_p}$, with $p_0 = n_i^2/N_D = 1.5\times10^4$:
$$p(t) = 1.5\times10^4 + 1.5\times10^{14}e^{-t/15\,\mu\text{s}}\,\text{cm}^{-3}$$
At $t = \tau_p$: $1.5\times10^{14}/e = 5.5\times10^{13}\,\text{cm}^{-3}$. As $t \to \infty$, $p \to p_0$.` }),
    P({ src: 'SP26 · 3c (7 pts)', q: md`(c) For the steady state of (a), find the hole quasi-Fermi level relative to the intrinsic level, $F_p - E_i$, in meV.`,
      parts: [N('F_p - E_i', -238.5, 'meV', 0.03)],
      sol: md`$p = p_0 + \delta p = 1.5\times10^4 + 1.5\times10^{14} \approx 1.5\times10^{14}$:
$$F_p - E_i = -kT\ln\frac{p}{n_i} = -0.0259\ln\frac{1.5\times10^{14}}{1.5\times10^{10}} = -0.0259\ln10^4 = -0.239\,\text{eV} = -239\,\text{meV}$$
$F_p$ is 239 meV **below** $E_i$, while $F_n$ stays at the dark $E_F$, $kT\ln(N_D/n_i) = 358$ meV above $E_i$.` }),
    P({ src: 'SP26 · 3d (12 pts)', q: md`(d) The illumination is changed so that at $t = 0$ the excess carriers vary **linearly** from $\delta n = \delta p = 10^{14}\,\text{cm}^{-3}$ at $x = 0$ to $10^{16}\,\text{cm}^{-3}$ at $x = 1\,\mu$m, with no electric field. Find the electron and hole **diffusion current densities** at $x = 0.5\,\mu$m (+ means along $+x$).`,
      parts: [N('J_{n,\\text{diff}}', 553.9, 'A/cm^2', 0.05), N('J_{p,\\text{diff}}', -184.6, 'A/cm^2', 0.05)],
      hints: [md`The profile is linear, so the gradient is the same everywhere: $\dfrac{10^{16} - 10^{14}}{10^{-4}\,\text{cm}}$. Get $D$ from Einstein.`],
      sol: md`$\dfrac{dn}{dx} = \dfrac{dp}{dx} = \dfrac{10^{16} - 10^{14}}{10^{-4}\,\text{cm}} = 9.9\times10^{19}\,\text{cm}^{-4}$ (the uniform $n_0$, $p_0$ don't contribute). Einstein: $D_n = 0.0259\times1350 = 35.0$, $D_p = 0.0259\times450 = 11.7\,\text{cm}^2/\text{s}$.
$$J_{n,\text{diff}} = +qD_n\frac{dn}{dx} = (1.6\times10^{-19})(35.0)(9.9\times10^{19}) = +554\,\text{A/cm}^2$$
$$J_{p,\text{diff}} = -qD_p\frac{dp}{dx} = -(1.6\times10^{-19})(11.7)(9.9\times10^{19}) = -185\,\text{A/cm}^2$$
Both kinds of carrier flow toward $-x$ (down the gradient). Electrons carry $-q$, so their current points $+x$; holes carry $+q$, so theirs points $-x$. The same at every $x$ in this linear profile.` }),
  ];
  // the band figure belongs in the problem 1 intro
  sp26[1] = C.RF(md`### Problem 1 (33 points)

A semiconductor in **equilibrium** has the band diagram below. Band gap $E_g = 1.2$ eV, $n_i = 10^{11}\,\text{cm}^{-3}$, $kT = 0.026$ eV.

[[fig:b]]`, { b: { svg: sp26Bands(), cap: 'Equilibrium band diagram. At X = 0, $E_c = E_F$; at X = L/2, $E_i = E_F$; at X = L, $E_v = E_F$.' } });
  delete sp26[2].fig;

  // ---------------------------------------------------------------- Fall 2024 Exam 1
  const f24 = [
    R(md`
      **Fall 2024 · ECE 340 · Exam 1** (Thursday October 10, 2024, 7–8 pm). Three problems: 34 + 33 + 33 points. Closed book and notes; simple calculator. Show units in your work and answers, and explain your reasoning: no credit without the procedure.
    `),
    R(md`### Problem 1 (34 points)`),
    P({ src: 'F24 · 1a (6 pts)', q: md`(a) Explain the difference between metals, semiconductors and insulators, in words and figures. Pick the statement that captures it, then compare your sketch with the solution.`,
      parts: [MC('', ['metal: partly filled band · semiconductor: gap ≈ 1 eV · insulator: gap ≳ 5 eV', 'metal: small gap · semiconductor: medium gap · insulator: no gap at all', 'metal: full bands · semiconductor: partly filled band · insulator: full bands', 'metal: gap ≈ 1 eV · semiconductor: no gap · insulator: gap ≳ 5 eV'], 0,
        [null, 'Metals have no gap at the Fermi level: their band is partly filled.', 'Reversed: semiconductors have full and empty bands at 0 K.', 'A metal has no gap at its Fermi level; that is why it conducts even at 0 K.'])],
      sol: md`(Streetman Fig. 3-4.) Draw three E–x pictures at 0 K:

- **Metal**: a partly filled band (or overlapping bands), electrons up to $E_F$ with empty states right above: high conductivity at any temperature.
- **Semiconductor**: a filled valence band and an empty conduction band separated by a **small** gap $E_g$ (about 0.5–3 eV); conduction is possible when heat, doping or light puts carriers in the bands.
- **Insulator**: the same filling with a **large** gap (more than about 5–10 eV) that prevents conduction.` }),
    P({ src: 'F24 · 1b (8 pts)', q: md`(b) You are given four semiconductors: one **clear**, one **transparent blue**, one **transparent orange**, and one **silvery and opaque**. Which do you expect to have the lowest intrinsic carrier concentration? Why?`,
      parts: [FIX('', ['the clear one', 'the transparent blue one', 'the transparent orange one', 'the silvery opaque one'], 0,
        [null, 'It absorbs part of the visible spectrum, so its gap is within the visible range: smaller than the clear sample’s.', 'It absorbs blue and green, so its gap is around 2 eV.', 'It absorbs all visible light: the smallest gap of the four, the **largest** $n_i$.'])],
      sol: md`A semiconductor absorbs photons with $h\nu > E_g$ and transmits those below. The **clear** sample transmits all visible light, even violet (about 3.1 eV), so its gap is the **largest**. The colored ones absorb part of the visible spectrum (gaps inside 1.8–3.1 eV); the silvery opaque one absorbs everything visible (smallest gap). Since
$$n_i = \sqrt{N_cN_v}\,e^{-E_g/2kT}$$
the largest gap gives the lowest intrinsic concentration: **clear**.` }),
    P({ src: 'F24 · 1c (20 pts)', q: md`(c) A GaAs sample is doped with silicon at $2\times10^{16}\,\text{cm}^{-3}$; 75% of the Si sits on column-III (Ga) sites and 25% on column-V (As) sites. 300 K, $n_i = 2\times10^6\,\text{cm}^{-3}$, $E_g = 1.43$ eV.
(i) p-type or n-type? (ii) the electron and hole densities. (iii) $E_F - E_i$ (take $E_i \approx E_g/2$), and whether the Boltzmann approximation is valid.`,
      parts: [FIX('(i) 6 pts', ['n-type', 'p-type', 'intrinsic'], 0, [null, 'Si on a Ga (group III) site has one extra electron: a donor, and 75% of the Si is there.', 'The donors outnumber the acceptors 3 to 1.']),
        N('n\\ (\\text{ii})', 1e16, 'cm^{-3}'), N('p\\ (\\text{ii})', 4e-4, 'cm^{-3}'), N('E_F - E_i\\ (\\text{iii})', 0.578, 'eV', 0.02),
        MC('Is the Boltzmann approximation valid?', ['yes: $E_c - E_F \\approx 0.137$ eV ≈ 5kT', 'no: $E_F$ is above $E_i$, so it fails', 'no: GaAs never follows Boltzmann'], 0, [null, 'Being above $E_i$ is fine; what matters is the distance to $E_c$.', 'It does whenever $E_F$ is a few $kT$ inside the gap.'])],
      sol: md`(i) **n-type.** Si (column IV) on a Ga (column III) site has one extra electron: a **donor**. On an As (column V) site it is one short: an **acceptor**. 75% donors versus 25% acceptors leaves net donors.

(ii) $N_D = 0.75\times2\times10^{16} = 1.5\times10^{16}$, $N_A = 0.25\times2\times10^{16} = 0.5\times10^{16}$:
$$n = N_D - N_A = 1\times10^{16}\,\text{cm}^{-3}, \qquad p = \frac{n_i^2}{n} = \frac{(2\times10^6)^2}{10^{16}} = 4\times10^{-4}\,\text{cm}^{-3}$$
(Less than one hole per cm³: GaAs's tiny $n_i$.)

(iii) $E_F - E_i = kT\ln\dfrac{n}{n_i} = 0.0259\ln\dfrac{10^{16}}{2\times10^6} = 0.578$ eV (positive: above $E_i$).
With $E_c - E_i = E_g/2 = 0.715$ eV, $E_c - E_F = 0.715 - 0.578 = 0.137$ eV ≈ 5.3 kT > 3kT ($= 0.078$ eV): the Boltzmann approximation is **valid**.` }),
    R(md`### Problem 2 (33 points)

A semiconductor sample 10 μm long, with a 10 μm² cross-section, at 300 K, initially **undoped**, has the energy–position diagram below. $\mu_n = 1000$, $\mu_p = 500\,\text{cm}^2/\text{V·s}$, $n_i = 10^{10}\,\text{cm}^{-3}$. (The dashed line marks the energy zero, **not** the Fermi level.)`),
    P({ src: 'F24 · 2a (9 pts)', q: md`(a) What is the current density when the sample is intrinsic?`, fig: f24Bands(),
      parts: [N('J', 2.4, 'mA/cm^2')],
      sol: md`Intrinsic: $n = p = n_i$, so
$$\sigma = qn_i(\mu_n + \mu_p) = (1.6\times10^{-19})(10^{10})(1500) = 2.4\times10^{-6}\,\text{S/cm}$$
From the diagram, $\dfrac{dE_i}{dx} = \dfrac{1\,\text{eV}}{10\,\mu\text{m}} = 10^3$ eV/cm, so $\mathscr{E} = \dfrac1q\dfrac{dE_i}{dx} = 10^3$ V/cm (the $q$ cancels the "e" in eV).
$$J = \sigma\mathscr{E} = 2.4\times10^{-3}\,\text{A/cm}^2 = 2.4\,\text{mA/cm}^2$$` }),
    P({ src: 'F24 · 2b (10 pts)', q: md`(b) Doping is now added. What **electron** concentration minimizes the current density (minimizes the conductivity)? Hint: it is not the intrinsic concentration.`,
      parts: [N('n_{\\min}', 7.071e9, 'cm^{-3}')],
      sol: md`$\sigma = q(n\mu_n + p\mu_p) = q\left(n\mu_n + \dfrac{n_i^2}{n}\mu_p\right)$. Set $d\sigma/dn = 0$:
$$q\left(\mu_n - \frac{n_i^2}{n^2}\mu_p\right) = 0 \;\Rightarrow\; n = n_i\sqrt{\frac{\mu_p}{\mu_n}} = 10^{10}\sqrt{0.5} = 7.07\times10^9\,\text{cm}^{-3}$$
Lowering $n$ further doesn't help: $p = n_i^2/n$ then grows and the conductivity rises again.` }),
    P({ src: 'F24 · 2c (7 pts)', q: md`(c) To reach that minimum, which is required? Circle one and explain.`,
      parts: [FIX('', ['increase the acceptor doping', 'increase the donor doping'], 0, [null, 'At the minimum $p = n_i^2/n = 1.41\\times10^{10} > n$: the sample must be slightly p-type.'])],
      sol: md`At the minimum, $p = n_i^2/n = 1.41\times10^{10} > n = 7.07\times10^9$: slightly **p-type**, so **add acceptors**. Intuition: electrons are more mobile, so to minimize conductivity you trade some electrons for (slower) holes.` }),
    P({ src: 'F24 · 2d (7 pts)', q: md`(d) For the sample optimized for minimum conductivity, how does the conductivity change if the temperature is raised to 1000 K? Circle one and explain.`,
      parts: [FIX('', ['increase', 'decrease', 'no effect', 'insufficient information'], 0, [null, 'Mobility does fall with $T$, but far more slowly than $n_i$ grows.', '$n_i$ changes enormously.', 'The trend is clear from $n_i(T)$ and $\\mu(T)$.'])],
      sol: md`**Increase.** The doping is tiny (of order $n_i(300\,\text{K})$), so at 1000 K the sample is intrinsic: $\sigma = qn_i(\mu_n + \mu_p)$. Mobility falls ($\mu \propto T^{-3/2}$), but $n_i \propto T^{3/2}e^{-E_g/2kT}$ rises by many orders of magnitude, so $\sigma \propto e^{-E_g/2kT}$ (the $T^{\pm3/2}$ factors cancel) increases.` }),
    R(md`### Problem 3 (33 points): light absorption and excess carriers

A **direct-gap p-type** semiconductor: $E_g = 1.4$ eV, $\tau_n = \tau_p = 10$ ns, $N_A = 1\times10^{16}\,\text{cm}^{-3}$, $n_i = 2\times10^6\,\text{cm}^{-3}$, 300 K.`),
    P({ src: 'F24 · 3a (12 pts)', q: md`(a) At a photon wavelength of 870 nm the optical generation rate is $10^{21}$ EHP cm⁻³ s⁻¹. What are the electron and hole concentrations under steady illumination?`,
      parts: [N('n', 1e13, 'cm^{-3}'), N('p', 1.001e16, 'cm^{-3}', 0.01)],
      sol: md`Check the photon: $1.24/0.87 = 1.43$ eV > 1.4 eV, so it is absorbed. Equilibrium: $p_0 = 10^{16}$, $n_0 = n_i^2/p_0 = 4\times10^{-4}\,\text{cm}^{-3}$. Excess: $\Delta n = \Delta p = g_{op}\tau = (10^{21})(10^{-8}) = 10^{13}$ (low level).
$$n = n_0 + \Delta n \approx 10^{13}\,\text{cm}^{-3}, \qquad p = p_0 + \Delta p = 1.001\times10^{16} \approx 10^{16}\,\text{cm}^{-3}$$` }),
    P({ src: 'F24 · 3b (5 pts)', q: md`(b) The wavelength is changed to 1.6 μm with the same light power density. What are the optical generation rate and the steady-state excess concentration now?`,
      parts: [MC('', ['both zero: 0.78 eV photons are below the 1.4 eV gap', 'the same as in (a)', 'larger: there are more photons per watt at longer wavelength', 'half of (a)'], 0,
        [null, 'Below-gap photons are not absorbed band to band.', 'More photons per watt, yes, but none of them can be absorbed.', 'No.'])],
      sol: md`$h\nu = 1.24/1.6 = 0.78$ eV $< E_g = 1.4$ eV: the material is transparent at this wavelength, so $g_{op} = 0$ and $\Delta n = \Delta p = 0$.` }),
    R(md`**Carrier diffusion.** The same p-type sample ($N_A = 10^{16}$): electrons are injected continuously at $x = 0$ so that the excess there is $2\times10^{13}\,\text{cm}^{-3}$. $\tau_n = \tau_p = 10$ ns, $D_n = 25\,\text{cm}^2/\text{s}$, 300 K ($e \approx 2.72$).`),
    P({ src: 'F24 · 3c (4 pts)', q: md`(c) Which way do the electron diffusion **flux** and the electron diffusion **current** point?`, fig: f24Inject(),
      parts: [MC('', ['flux toward $+x$, current toward $-x$', 'flux toward $+x$, current toward $+x$', 'flux toward $-x$, current toward $+x$', 'both zero in steady state'], 0,
        [null, 'Electrons carry $-q$: their current is opposite to their flow.', 'Electrons flow away from the injection point, down their gradient.', 'Steady state still has a steady flow.'])],
      sol: md`The excess is largest at $x = 0$ and decays into the sample, so electrons diffuse toward **$+x$**. Being negative, they carry current toward **$-x$**: $J_n = qD_n\,dn/dx < 0$.` }),
    P({ src: 'F24 · 3d (12 pts)', q: md`(d) Calculate the electron diffusion current density at $x = 5\,\mu$m (magnitude; its direction is from part (c)).`,
      parts: [N('L_n', 5, 'μm'), N('|J_n(5\\,\\mu\\text{m})|', 0.0589, 'A/cm^2', 0.02)],
      sol: md`$L_n = \sqrt{D_n\tau_n} = \sqrt{25\times10^{-8}} = 5\times10^{-4}$ cm $= 5\,\mu$m. Long-sample profile: $\delta n(x) = \Delta ne^{-x/L_n}$, and $n_0$ is uniform, so
$$J_n = qD_n\frac{dn}{dx} = -q\frac{D_n}{L_n}\Delta ne^{-x/L_n}$$
$$|J_n(5\,\mu\text{m})| = (1.6\times10^{-19})\frac{25}{5\times10^{-4}}(2\times10^{13})e^{-1} = 0.0589\,\text{A/cm}^2$$
pointing toward $-x$.` }),
  ];

  C.unit({
    id: 'e1-past', exam: 'e1', tools: true, num: 'Exam 1', title: 'Past exams (blank, with solutions)',
    lessons: [
      { id: 'e1-sp26', title: 'Spring 2026 Exam 1', kind: 'exam', steps: sp26 },
      { id: 'e1-f24', title: 'Fall 2024 Exam 1', kind: 'exam', steps: f24 },
    ],
  });
})();

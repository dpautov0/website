/* Start here (unit e3s, Topic 0): the three pages every other Exam 3 lesson leans on.
   e3-map       The map of Exam 3: what the nine old papers asked (counted from the papers), Prof. Chen's Spring 2024
                paper problem by problem, what the formula sheet gives and what it leaves out, then the big idea derived:
                a transmission line obeys the same two equations as a plane wave (V <-> E, I <-> H, L <-> mu, C <-> eps,
                Z0 <-> eta), and how to spend the days left.
   e3-complex   Complex numbers from zero, and arithmetic without a calculator.
   e3-refresh   What you need from Exam 2, rebuilt: the 1-D wave equation, f(t -+ z/v), eta and E x H, the boundary
                conditions, sheet radiation derived from them, and S = E x H.
   Generators use the prefix s0 (rf_s0_* rapid fire, s0_* problems). Numbers checked in work-start2/*.py. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N } = EM;
  const { pick } = U;
  const PI = Math.PI;

  // ================================================================ figures for e3-map
  // a short piece of line: series L dz on the top wire, shunt C dz across, I and V at both ends
  function ladderFig() {
    const g = PF.fig({ alt: 'a short piece of transmission line of length delta z: an inductor L delta z in series on the top wire, a capacitor C delta z across the two wires at the right; current I(z) enters at the left and I(z + delta z) leaves at the right; voltage V(z) across the left end and V(z + delta z) across the right end' });
    const yT = 40, yB = 140, x0 = 40, x1 = 330, xa = 112, xb = 184, n = 4, r = (xb - xa) / (2 * n);
    const ym = (yT + yB) / 2, xc = 250;
    g.line(x0, yT, xa, yT);
    for (let i = 0; i < n; i++) g.arc(xa + r + 2 * r * i, yT, r, 0, 180);
    g.line(xb, yT, x1, yT);
    g.line(x0, yB, x1, yB);
    g.line(xc, yT, xc, ym - 5); g.line(xc - 13, ym - 5, xc + 13, ym - 5, { cls: 'thick' });
    g.line(xc - 13, ym + 5, xc + 13, ym + 5, { cls: 'thick' }); g.line(xc, ym + 5, xc, yB);
    for (const [x, y] of [[x0, yT], [x0, yB], [x1, yT], [x1, yB]]) g.dot(x, y, 3);
    g.label((xa + xb) / 2, yT - 16, 'L\\,\\Delta z', 'b');
    g.label(xc + 24, ym, 'C\\,\\Delta z', 'l');
    g.arrow(52, yT + 14, 92, yT + 14, { hs: 7 }); g.label(72, yT + 20, 'I(z)', 't', 'small');
    g.arrow(284, yT + 14, 324, yT + 14, { hs: 7 }); g.label(304, yT + 20, 'I(z+\\Delta z)', 't', 'small');
    g.label(x0 - 8, yT + 10, '+', 'r', 'small'); g.label(x0 - 8, yB - 10, '-', 'r', 'small');
    g.label(x0 - 8, ym, 'V(z)', 'r', 'small');
    g.label(x1 + 8, yT + 10, '+', 'l', 'small'); g.label(x1 + 8, yB - 10, '-', 'l', 'small');
    g.label(x1 + 8, ym, 'V(z+\\Delta z)', 'l', 'small');
    g.dim(x0, yB + 22, x1, yB + 22, '\\Delta z');
    return g.svg();
  }
  // how many of the nine old papers asked each topic, split into spring/fall and summer
  const TOPICS = [
    ['Lossy media, skin depth', 5, 4], ['Power and Poynting', 4, 4], ['Polarization', 4, 3], ['Current sheets', 1, 4],
    ['Bounce diagrams', 5, 0], ['Reflection, Γ and τ', 3, 1], ['Standing waves', 4, 0], ['L, C, Z₀ of a line', 4, 0],
    ['Stubs and resonance', 4, 0], ['Quarter-wave, Γ(d)', 1, 0],
  ];
  function barsFig() {
    const g = PF.fig({ alt: 'bar chart: out of nine past papers, lossy media 9, power 8, polarization 7, current sheets 5, bounce diagrams 5, reflection 4, standing waves 4, L C Z0 of a line 4, stubs and resonance 4, quarter-wave 1; bounce diagrams, lines and stubs come only from the five spring and fall papers' });
    const xb = 150, u = 19, h = 22, y0 = 18;
    TOPICS.forEach(([name, sf, su], i) => {
      const y = y0 + i * h;
      g.text(xb - 8, y, name, 'r', 'small');
      if (sf) g.rect(xb, y - 7, sf * u, 14, { cls: 'carr' });
      if (su) { g.rect(xb + sf * u, y - 7, su * u, 14, { cls: 'shade' }); g.rect(xb + sf * u, y - 7, su * u, 14, { cls: 'dim thin' }); }
      g.text(xb + (sf + su) * u + 6, y, String(sf + su), 'l', 'small');
    });
    const yl = y0 + TOPICS.length * h + 8;
    g.line(xb, y0 - 12, xb, yl - 10, { cls: 'axisl' });
    g.rect(xb, yl, 14, 12, { cls: 'carr' }); g.text(xb + 20, yl + 6, 'spring and fall (5)', 'l', 'small');
    g.rect(xb, yl + 18, 14, 12, { cls: 'shade' }); g.rect(xb, yl + 18, 14, 12, { cls: 'dim thin' }); g.text(xb + 20, yl + 24, 'summer (4)', 'l', 'small');
    return g.svg();
  }

  // ================================================================ lesson: the map of Exam 3
  EM.lesson('e3s', {
    id: 'e3-map', topic: 0, order: 0, kind: 'read', ref: 'nine past papers, the formula sheet', title: 'The map of Exam 3',
    steps: [
      RF(md`
        !!key What this page is for
          Before you study anything, know what the exam asks, what the formula sheet hands you, and how the pieces connect. This page answers those three questions from the nine old Exam 3 papers. Then it shows you the one idea that halves the course: **a transmission line obeys the same two equations as a plane wave.** Everything you learn about one is free for the other.

        ### The exam

        - **When:** Monday, November 16, 7:00 to 8:15 pm. That is **75 minutes**.
        - **What you bring:** one 4"×6" card of handwritten notes. You get the official formula sheet (3 pages).
        - **No calculator.** Every number is chosen to work by hand. That is why [complex numbers from zero](#/l/e3-complex) is the next page.
        - **Who writes it:** Prof. Xu Chen. His Spring 2024 Exam 3 is the best model of what you will see.
        - **Scope:** Lectures 20 to 33. Poynting's theorem and power; phasors; waves in lossy materials; polarization; reflection and standing waves; transmission lines in time (bounce diagrams) and in phasors (stubs, resonance, quarter-wave transformers). **The Smith chart is not on it.**

        ### What the old papers asked

        There are nine old Exam 3 papers with solutions. Five are spring or fall papers, the same kind of term you are in. Four are summer papers by Prof. Kudeki, which are shorter (three problems, 75 points).

        - [Spring 2024](#/l/e3-past-sp24) (Chen, Shao, Waldrop). Four problems: two current sheets, a good conductor, a coax, a two-line bounce diagram. The next section takes it apart.
        - [Fall 2023](#/l/e3-past-fa23) (Goddard, Ilie, Zhao). Seven questions, many multiple choice: polarization, the loss tangent, standing waves, line junctions, a scope trace read backward, a shorted line driven by a pulse, power in water, a resonant line.
        - [Spring 2019](#/l/e3-past-sp19) (Chen, Goddard, Zhao). Five problems: a lossy wave from its phasor, a parallel-plate line from its fields, a circular wave hitting a perfect conductor, a two-line bounce, resonances.
        - [Spring 2018](#/l/e3-past-sp18) (He, Goddard, Ilie). Ten multiple-choice parts, reflection into a dielectric, a bounce diagram with plots, a shorted-line resonance and a quarter-wave transformer.
        - [Spring 2017](#/l/e3-past-sp17) (Waldrop, Lee, Goddard, Ilie). True or false, multiple choice, reading a lossy wave, polarization with power, a bounce with a sine pulse, a shorted line in series with a resistor.
        - [Summer 2017](#/l/e3-past-su17), [2018](#/l/e3-past-su18), [2019](#/l/e3-past-su19), [2020](#/l/e3-past-su20) (Kudeki). Each has a switched-on current sheet sketched against $t$ and $z$, a circular wave with its power, and a lossy medium. **None has a transmission line.**

        I went through every part of every paper and marked which topic it tests. The count:

        [[fig:bars]]

        | Topic | Chen, Spring 2024 | 5 spring/fall papers | 4 summer papers |
        |---|---|---|---|
        | Lossy media: $\gamma$, $\eta$, skin depth | #2, 30 pts | 5 of 5 | 4 of 4 |
        | Power: $\mathbf S$, $\langle\mathbf S\rangle$, dB | #2(c) | 4 of 5 | 4 of 4 |
        | Polarization and handedness | — | 4 of 5 | 3 of 4 |
        | Current sheets that radiate | #1, 18 pts | 1 of 5 | 4 of 4 |
        | Bounce diagrams, junctions, DC steady state | #4, 34 pts | 5 of 5 | 0 of 4 |
        | Reflection: $\Gamma$ and $\tau$ at a boundary | — | 3 of 5 | 1 of 4 |
        | Standing waves | #1, between the sheets | 4 of 5 | 0 of 4 |
        | $L$, $C$, $Z_0$ from the fields | #3, 18 pts | 4 of 5 | 0 of 4 |
        | Stubs, resonance, input impedance | — | 4 of 5 | 0 of 4 |
        | Quarter-wave transformer, $\Gamma(d)$ | — | 1 of 5 | 0 of 4 |

        Three things to take from this.

        1. **A lossy wave is on every paper.** Nine of nine. Know $\gamma$, $\eta$, $\tau$, the good-conductor limit and the skin depth cold.
        2. **A bounce diagram is on every spring and fall paper.** Five of five, and it was the largest problem on Prof. Chen's (34 points).
        3. **Power and polarization are on almost every paper**, usually as a part of a bigger problem or as multiple choice.
      `, { bars: { svg: barsFig(), cap: 'How many of the nine papers ask each topic. The solid part of each bar counts spring and fall papers; the outlined part counts summer papers.' } }),
      Q(md`**Predict.** Prof. Chen's Spring 2024 paper used $f = 300$ MHz in free space. What is the wavelength? (Clean numbers like this are the point: no calculator.)`,
        ['1 m', '0.1 m', '3 m', '10 m'], 0,
        [null, md`That divides $3\times10^8$ by $3\times10^9$. The frequency is $3\times10^8$ Hz: 300 MHz is $300\times10^6$.`, md`That is the wavelength at 100 MHz.`, md`That is the wavelength at 30 MHz.`],
        md`$\lambda = c/f = (3\times10^8\ \text{m/s})/(3\times10^8\ \text{Hz}) = 1$ m. So $\beta = 2\pi/\lambda = 2\pi$ rad/m, and a sheet spacing of 0.5 m is exactly half a wavelength.`),
      R(md`
        ### Prof. Chen's Spring 2024 paper, problem by problem

        Four problems, worth 18, 30, 18 and 34 points. Each is cut into short parts, and every number was chosen to work without a calculator. Here is what each one asked, and which lesson teaches it.

        **Problem 1 (18 points): two current sheets.** Two infinite sheets in free space, at $z = 0$ and $z = 0.5$ m, each carrying the phasor $\tilde{\mathbf J}_s = -2\hat x$ A/m at $f = 300$ MHz. Write $\tilde{\mathbf E}$ and $\tilde{\mathbf H}$ in all three regions. The trick: $\lambda = 1$ m, so the sheets are half a wavelength apart, and the factor $e^{-j\beta(0.5)} = e^{-j\pi} = -1$ appears. Outside the pair the two waves cancel. Between them they make a standing wave:
        $$\tilde{\mathbf E} = -j240\pi\sin(2\pi z)\,\hat x\ \text{V/m}$$
        $$\tilde{\mathbf H} = 2\cos(2\pi z)\,\hat y\ \text{A/m}$$
        for $0 < z < 0.5$ m, and both are zero outside. You need: the sheet fields ([what you need from Exam 2](#/l/e3-refresh)), $e^{j\pi} = -1$ and $e^{j\theta} - e^{-j\theta} = 2j\sin\theta$ ([complex numbers](#/l/e3-complex)), and adding sheets ([Topic 10](#/l/w3-antenna)). The posted key writes the amplitude as "$-240j$"; the correct amplitude is $-j240\pi$ V/m, since $2\eta_0 = 240\pi\ \Omega$.

        **Problem 2 (30 points): a good conductor.** A wave travels along $+\hat x$ in a good conductor with skin depth $\delta = 1$ mm, and $\mathbf E(0,0) = 10\hat z$ V/m. (a) Find $\gamma$. In a good conductor $\alpha = \beta = 1/\delta$, so $\gamma = 1000(1 + j)$ m⁻¹. (b) The amplitude at $x = 2$ mm: $10e^{-2}$ V/m, left unevaluated. (c) Circle the true statements about Poynting's theorem and $\langle\mathbf S\rangle$ in a lossy medium. You need: [Topic 7](#/l/w2-limits), [Topic 3](#/l/w1-poynting), [Topic 8](#/l/w2-loss).

        **Problem 3 (18 points): a coax.** You are given $C = 2\pi\epsilon/\ln(b/a)$. Find $L$, $Z_0$ and $v_p$ in terms of $a$, $b$, $\epsilon$, $\mu$. The trick is $LC = \mu\epsilon$, which the next section derives. Then $L = \mu\ln(b/a)/2\pi$, $Z_0 = \sqrt{L/C} = (\eta/2\pi)\ln(b/a)$, and $v_p = 1/\sqrt{\mu\epsilon}$. You need: [Topic 13](#/l/w5-telegraph).

        **Problem 4 (34 points): two lines in a row.** A source with $R_g = 50\ \Omega$ and $v_g = 80u(t)$ V drives a 150 m line with $Z_{01} = 150\ \Omega$, then a 150 m line with $Z_{02} = 50\ \Omega$, ending in $R_L = 50\ \Omega$. Both lines have $v_p = c/2 = 150$ m/µs, so each takes exactly 1 µs. (a) The bounce diagram for $0 \le t \le 4$ µs, with $\tau_g = \tfrac34$, a first wave of 60 V, $\Gamma = -\tfrac12$ at the junction, and $\Gamma_L = 0$. (b) The voltage at $z = 100$ m against time: it steps through 60, 30, 45 and 37.5 V. (c) The DC current at the end: $80/(50 + 50) = 0.8$ A. You need: [Topic 14](#/l/w5-launch), [Topic 15](#/l/w5-bounce), [Topic 16](#/l/w5-multi).

        !!intuition What made it doable by hand
          $f = 300$ MHz gives $\lambda = 1$ m. $v_p = c/2$ and 150 m lines give 1 µs per trip. Impedances of 50 and 150 $\Omega$ give coefficients of $\pm\tfrac12$ and $\tfrac34$. $\delta = 1$ mm gives $\alpha = \beta = 1000$. Expect the same style on Monday: if your numbers get ugly, look for the slip.
      `),
      Q(md`**Predict.** In Spring 2024 Problem 4, each line is 150 m long and $v_p = c/2$. How long does a wave take to cross one line?`,
        ['1 µs', '0.5 µs', '2 µs', '0.75 µs'], 0,
        [null, md`That uses the full speed of light, $c = 300$ m/µs. The waves move at $c/2 = 150$ m/µs.`, md`That is the round trip, there and back.`, md`That is $\tau_g = \tfrac34$, a coefficient, not a time.`],
        md`$v_p = c/2 = 150$ m/µs. Time $= 150\ \text{m}/(150\ \text{m}/\mu\text{s}) = 1\ \mu\text{s}$. Writing $c$ as 300 m/µs makes every line problem a division you can do in your head.`),
      R(md`
        ### What the formula sheet gives you, and what it does not

        You get the official three-page sheet ([read it here](#/l/e3-sheet)). Know what is on it, so your 4"×6" card holds only what is not.

        **It gives you:**
        - Maxwell's equations and the boundary conditions, with $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$.
        - The fields of a current sheet, written for the sheet $\mathbf J_s = -J_s(t)\hat x$.
        - $\hat e\times\hat h = \hat v_p$, $\mathbf S = \mathbf E\times\mathbf H$, Poynting's theorem, and $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$.
        - The lossy wave in time and in phasors, $\gamma$, $\eta$, $\tau$, $\eta\gamma = j\omega\mu$, $\gamma/\eta = \sigma + j\omega\epsilon$, and the three limits (no loss, imperfect dielectric, good conductor).
        - $\Gamma = (\eta_2 - \eta_1)/(\eta_2 + \eta_1)$ and $\tau = 1 + \Gamma$.
        - The telegrapher's equations, $Z_0$, $v_p$, $\tau_g$, $\Gamma_L$, $\Gamma_g$, and the sums for $V(z,t)$ and $I(z,t)$ after a delta input.
        - $\tilde V(d)$, $\tilde I(d)$, $\Gamma(d)$, $Z(d)$, the power $P(d)$, VSWR, and the short and open loads.

        **It does not give you:**
        - Any complex arithmetic, or the values of $\sqrt2$, $\sqrt3$, $e^{-1}$, $\cos 30°$ and friends. ([Complex numbers from zero](#/l/e3-complex).)
        - **Anything about polarization.** Which hand is which is a rule you must carry.
        - The skin depth by name: $\delta = 1/\alpha$. The sheet gives only $\alpha \approx \sqrt{\omega\mu\sigma/2}$.
        - Decibels: $10\log_{10}$ of a power ratio, and $1$ Np $\approx 8.69$ dB.
        - $\langle\mathbf S\rangle$ for a lossy wave already worked out: $\dfrac{E_0^2}{2|\eta|}e^{-2\alpha z}\cos\tau$.
        - $L$ and $C$ for a coax or parallel plates. (Spring 2024 gave $C$ in the problem.)
        - The coefficients at a junction of two lines, $\Gamma_{12} = (Z_{02} - Z_{01})/(Z_{02} + Z_{01})$ and $\tau_{12} = 1 + \Gamma_{12}$, and the fact that current reflects with $-\Gamma$.
        - The resonance lengths of shorted and open lines, and $Z_{in} = Z_0^2/Z_L$ for a quarter-wave line.

        !!trap One line on the sheet is shorthand
          The sheet writes $Z(d) = Y(d \pm \lambda/4)$. Read literally, the units do not match: ohms on the left, siemens on the right. It is true only for the **normalized** values, $z(d) = y(d \pm \lambda/4)$, with $z = Z/Z_0$ and $y = Z_0Y$. In ohms it says $Z(d)\,Z(d \pm \lambda/4) = Z_0^2$. That is the quarter-wave transformer.
      `),
      Q(md`**Predict.** A line has $Z_0 = 50\ \Omega$. At some point $Z(d) = 100\ \Omega$. What is $Z$ a quarter wavelength farther along, $Z(d + \lambda/4)$?`,
        [md`$25\ \Omega$`, md`$0.01\ \Omega$`, md`$100\ \Omega$`, md`$200\ \Omega$`], 0,
        [null, md`That reads $Z(d) = Y(d \pm \lambda/4)$ literally and takes $1/100$. The sheet's line holds only for normalized values.`, md`That is what a **half** wavelength does: $z(d) = z(d \pm \lambda/2)$.`, md`That multiplies by 2. The quarter-wave line inverts the normalized impedance: $z = 2$ becomes $z = \tfrac12$.`],
        md`Normalized: $z(d) = 100/50 = 2$. A quarter wave inverts it: $z = \tfrac12$. In ohms, $\tfrac12\cdot50 = 25\ \Omega$. Check: $Z(d)\,Z(d + \lambda/4) = 100\cdot25 = 2500 = Z_0^2$ ✓.`),
      RF(md`
        ### The big idea: a line is a plane wave in disguise

        Half of Exam 3 is waves in space. The other half is waves on transmission lines. They look like two subjects. They are one. Here is the proof, one step at a time.

        **The plane wave.** Take $\mathbf E = \hat x\,E_x(z,t)$ and $\mathbf H = \hat y\,H_y(z,t)$ in a lossless material. Faraday's law and Ampère's law each keep one component ([derived here](#/l/e3-refresh)):
        $$\frac{\partial E_x}{\partial z} = -\mu\frac{\partial H_y}{\partial t} \qquad\text{(1)}$$
        $$\frac{\partial H_y}{\partial z} = -\epsilon\frac{\partial E_x}{\partial t} \qquad\text{(2)}$$

        **The line.** A transmission line is two conductors. Current flows forward on one and back on the other. That current makes a magnetic field between them, which stores energy like an inductor. Charge on the conductors makes an electric field between them, which stores energy like a capacitor. So a short piece of length $\Delta z$ is an inductor $L\,\Delta z$ in series and a capacitor $C\,\Delta z$ across. Here $L$ (H/m) and $C$ (F/m) are the inductance and capacitance **per meter** of line.

        [[fig:ladder]]

        **Kirchhoff's voltage law.** Walk around the piece: start at the left terminals, cross the inductor, arrive at the right terminals. The inductor drops $L\,\Delta z\,\partial I/\partial t$ in the direction of the current:
        $$V(z) - L\,\Delta z\,\frac{\partial I}{\partial t} = V(z + \Delta z)$$
        Move $V(z)$ to the right side:
        $$V(z + \Delta z) - V(z) = -L\,\Delta z\,\frac{\partial I}{\partial t}$$
        Divide by $\Delta z$ and let $\Delta z \to 0$. The left side becomes a derivative:
        $$\frac{\partial V}{\partial z} = -L\frac{\partial I}{\partial t} \qquad\text{(3)}$$

        **Kirchhoff's current law.** At the top node, the current $I(z)$ that arrives either leaves as $I(z + \Delta z)$ or charges the capacitor, which takes $C\,\Delta z\,\partial V/\partial t$:
        $$I(z) = I(z + \Delta z) + C\,\Delta z\,\frac{\partial V}{\partial t}$$
        Rearrange the same way:
        $$I(z + \Delta z) - I(z) = -C\,\Delta z\,\frac{\partial V}{\partial t}$$
        Divide by $\Delta z$ and let $\Delta z \to 0$:
        $$\frac{\partial I}{\partial z} = -C\frac{\partial V}{\partial t} \qquad\text{(4)}$$
        Equations (3) and (4) are the **telegrapher's equations**, the first line under "Guided TEM waves" on your sheet.

        **Now lay (1) next to (3), and (2) next to (4).** They are the same equations with different letters:
        $$E_x \to V, \quad H_y \to I, \quad \mu \to L, \quad \epsilon \to C$$
        Same equations, same solutions. Every result you derive for a plane wave becomes a result for a line by swapping the letters, and the other way around.
      `, { ladder: { svg: ladderFig(), cap: 'A piece of line Δz long: series inductance L Δz, shunt capacitance C Δz. L and C are per meter.' } }),
      Q(md`**Predict.** The plane wave has speed $1/\sqrt{\mu\epsilon}$ and impedance $\eta = \sqrt{\mu/\epsilon}$. A line has $L = 0.25$ µH/m and $C = 100$ pF/m. What are its $Z_0$ and its speed?`,
        [md`$50\ \Omega$ and $2\times10^8$ m/s`, md`$50\ \Omega$ and $3\times10^8$ m/s`, md`$2500\ \Omega$ and $2\times10^8$ m/s`, md`$0.02\ \Omega$ and $5\times10^{-9}$ m/s`], 0,
        [null, md`The speed is $1/\sqrt{LC}$, which depends on this line's $L$ and $C$. It is $c$ only for an air-filled line.`, md`That is $L/C$ without the square root.`, md`That is $\sqrt{C/L}$ and $\sqrt{LC}$: both upside down. $\sqrt{LC}$ is a time per meter.`],
        md`Swap the letters: $Z_0 = \sqrt{L/C} = \sqrt{0.25\times10^{-6}/10^{-10}} = \sqrt{2500} = 50\ \Omega$. Speed: $LC = 2.5\times10^{-17}$, so $\sqrt{LC} = 5\times10^{-9}$ s/m and $v = 2\times10^8$ m/s.`),
      R(md`
        ### Why it is not a coincidence

        Take the simplest line: two parallel plates, each $w$ wide, a gap $h$ apart, filled with a material ($\mu$, $\epsilon$). Between the plates the field is a plane wave. Now connect the circuit quantities to the fields.

        **Voltage.** $E_x$ points straight across the gap and is uniform, so the voltage is the field times the gap:
        $$V = E_x\,h$$
        **Current.** At a perfect conductor, the surface current equals the tangential $\mathbf H$ next to it ([boundary conditions](#/l/e3-refresh)). The plate is $w$ wide, so
        $$I = H_y\,w$$
        Put $E_x = V/h$ and $H_y = I/w$ into equation (1):
        $$\frac{1}{h}\frac{\partial V}{\partial z} = -\frac{\mu}{w}\frac{\partial I}{\partial t}$$
        Multiply both sides by $h$:
        $$\frac{\partial V}{\partial z} = -\frac{\mu h}{w}\frac{\partial I}{\partial t}$$
        That is equation (3) with $L = \mu h/w$. Do the same to (2), and you get (4) with $C = \epsilon w/h$. **The line's equations are the field equations, multiplied by its shape.**

        Multiply the two:
        $$LC = \frac{\mu h}{w}\cdot\frac{\epsilon w}{h} = \mu\epsilon$$
        The shape cancels. So $v = 1/\sqrt{LC} = 1/\sqrt{\mu\epsilon}$: **a wave on a line travels at the speed of light in whatever fills it.** The sheet's $v_p = 1/\sqrt{LC} = 1/\sqrt{\mu\epsilon}$ says exactly this. Divide instead:
        $$Z_0 = \sqrt{\frac{L}{C}} = \sqrt{\frac{\mu}{\epsilon}}\,\frac{h}{w} = \eta\,\frac{h}{w}$$
        The impedance does depend on the shape. The sheet writes the shape factor as $1/GF$.

        !!intuition Does this make sense?
          Units: $L/C$ is H/F, and H/F $= \Omega^2$, so $\sqrt{L/C}$ is in ohms ✓. Plates as wide as their gap ($w = h$) in air give $Z_0 = \eta_0 = 377\ \Omega$: the line is a square chunk of plane wave. Wider plates or a smaller gap mean more capacitance and less inductance, so $Z_0$ falls ✓. And $LC = \mu\epsilon$ for **every** shape of TEM line, not only plates. That is how Spring 2024 #3 got $L$ from $C$ for a coax: $L = \mu\epsilon/C$.

        ### The dictionary

        | Plane wave | Transmission line | What it means |
        |---|---|---|
        | $E_x$ (V/m) | $V$ (V) | the push |
        | $H_y$ (A/m) | $I$ (A) | the flow |
        | $\mu$ (H/m) | $L$ (H/m) | stores magnetic energy |
        | $\epsilon$ (F/m) | $C$ (F/m) | stores electric energy |
        | $1/\sqrt{\mu\epsilon}$ | $1/\sqrt{LC}$ | the speed |
        | $\eta = \sqrt{\mu/\epsilon}$ | $Z_0 = \sqrt{L/C}$ | push over flow in one wave |
        | $H_y = -E_x/\eta$ going back | $I = -V/Z_0$ going back | a backward wave flips the flow |
        | $\tfrac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$ | $\tfrac{Z_2 - Z_1}{Z_2 + Z_1}$ | the reflection $\Gamma$ |
        | $\tau = 1 + \Gamma$ | $\tau = 1 + \Gamma$ | the transmission |
        | $\mathbf S = \mathbf E\times\mathbf H$ | $P = VI$ | power |
        | $\tfrac12\Re\{\tilde E\tilde H^*\}$ | $\tfrac12\Re\{\tilde V\tilde I^*\}$ | average power |
        | a perfect conductor, $\eta_2 = 0$ | a short, $Z_L = 0$ | $\Gamma = -1$: a standing wave |
        | a slab $\lambda/2$ thick | a line $\lambda/2$ long | invisible: $Z_{in} = Z_L$ |
        | a $\lambda/4$ coating, $\eta_c = \sqrt{\eta_1\eta_3}$ | a $\lambda/4$ line, $Z_0 = \sqrt{Z_{in}Z_L}$ | no reflection |
        | conductivity $\sigma$ | leakage $G$ | loss |

        **Three differences to remember.**
        - A line has a **generator with its own resistance** at one end, so waves reflect at both ends: $\Gamma_L$ at the load and $\Gamma_g$ at the source. Plane-wave problems almost never have the second reflection.
        - **Current reflects with $-\Gamma$**, just as $\mathbf H$ does. Fall 2023 #3 asked for the current coefficient on purpose.
        - **Two position variables.** In time-domain line problems $z$ runs from the generator ($z = 0$) to the load ($z = l$). In phasor line problems $d$ runs backward from the load ($d = 0$ at the load). Your sheet uses both.
      `),
      Q(md`**Predict.** A 150 $\Omega$ line joins a 50 $\Omega$ line. A voltage wave arrives from the 150 $\Omega$ side. Use the dictionary: what fraction reflects?`,
        [md`$-\tfrac12$`, md`$+\tfrac12$`, md`$\tfrac12$ of the power, so $-\tfrac{1}{\sqrt2}$ of the voltage`, md`$-\tfrac13$`], 0,
        [null, md`That has the subtraction backward: $\Gamma = (Z_2 - Z_1)/(Z_2 + Z_1)$, with $Z_2$ the line the wave enters.`, md`$\Gamma$ is a ratio of voltages, not of powers.`, md`That divides by $2Z_1 = 300$. The denominator is $Z_1 + Z_2 = 200$.`],
        md`$\Gamma = (Z_2 - Z_1)/(Z_2 + Z_1) = (50 - 150)/(50 + 150) = -\tfrac12$. The same formula as $(\eta_2 - \eta_1)/(\eta_2 + \eta_1)$ for a wave hitting a new material. This is the junction in Spring 2024 #4.`),
      Q(md`**Predict.** A line is shorted at its end ($Z_L = 0$). Which plane-wave situation behaves the same way?`,
        ['A wave hitting a perfect conductor', 'A wave entering a material with twice the $\\epsilon$', 'A wave in a good conductor', 'A wave leaving a current sheet'], 0,
        [null, md`That gives $\Gamma = (\eta/\sqrt2 - \eta)/(\eta/\sqrt2 + \eta) \approx -0.17$, a partial reflection. A short reflects everything.`, md`That is loss along the way, not a reflection at an end.`, md`A sheet is a source, like the generator, not a termination.`],
        md`A short forces $V = 0$ at the end, as a perfect conductor forces $E_{\text{tan}} = 0$. Both give $\Gamma = (0 - Z)/(0 + Z) = -1$: the reflected wave cancels the incident one at the wall, and the two make a standing wave.`),
      R(md`
        ### How to use the days you have

        Today is Friday evening. The exam is Monday at 7 pm. That is about two and a half days. Spend them like this.

        !!method The rule for every day
          1. **Exams first.** A timed exam shows you exactly what you cannot yet do. Reading lessons does not.
          2. **Lessons to fix misses.** For every point you lose, find the lesson in the table below and redo its worked example.
          3. **The gym every day.** Ten minutes of [the recognition gym](#/l/e3-gym) and [flashcards](#/l/e3-cards). It trains the five-second reads: which way it travels, which hand, which medium, what the next bounce does.
          4. **A miss counts as fixed** only when you can redo the problem blank the next day.

        **Friday night.** These three start pages. Then [Spring 2024](#/l/e3-past-sp24), timed, 75 minutes, closed book. Grade it with the solutions. List each miss next to the lesson that fixes it.

        **Saturday.** Morning: fix Friday's misses. Then [practice exam A](#/l/e3-prac-a) and [practice exam B](#/l/e3-prac-b), each timed, each graded and fixed the same way. Gym. If lines were weak, read [Topic 15](#/l/w5-bounce) and [Topic 18](#/l/w6-stubs).

        **Sunday.** [Practice exams C](#/l/e3-prac-c) and [D](#/l/e3-prac-d), then [Fall 2023](#/l/e3-past-fa23) and [Spring 2019](#/l/e3-past-sp19). Redo Saturday's misses blank. Learn the [speed tricks](#/l/e3-speed). Gym and flashcards.

        **Monday.** One last timed paper in the morning, [Spring 2018](#/l/e3-past-sp18) or a practice exam. Afternoon: [the formula sheet](#/l/e3-sheet), then copy your <a href="notecard-e3.html">notecard</a> by hand. Gym. Nothing new after 4 pm.

        ### Where each topic is taught

        | If you missed… | Read |
        |---|---|
        | phasors, $\Re\{\tilde E e^{j\omega t}\}$ | [Topic 1](#/l/w1-phasor), [Topic 2](#/l/w1-maxwell) |
        | Poynting, $\langle\mathbf S\rangle$ | [Topic 3](#/l/w1-poynting), [Topic 4](#/l/w1-avg) |
        | $\gamma$, $\eta$, $\tau$ | [Topic 5](#/l/w2-gamma), [Topic 6](#/l/w2-read) |
        | good conductor, skin depth, dB | [Topic 7](#/l/w2-limits), [Topic 8](#/l/w2-loss) |
        | polarization, which hand | [Topic 9](#/l/w3-pol) |
        | current sheets, two sheets | [Topic 10](#/l/w3-antenna), [Exam 2 refresh](#/l/e3-refresh) |
        | $\Gamma$, $\tau$, perfect conductor | [Topic 11](#/l/w4-gamma) |
        | standing waves | [Topic 12](#/l/w4-standing) |
        | $L$, $C$, $Z_0$, coax | [Topic 13](#/l/w5-telegraph) |
        | $\tau_g$, $\Gamma_L$, $\Gamma_g$, DC | [Topic 14](#/l/w5-launch) |
        | bounce diagrams | [Topic 15](#/l/w5-bounce), [Topic 16](#/l/w5-multi) |
        | $V(d)$, $\Gamma(d)$, VSWR | [Topic 17](#/l/w6-vd) |
        | stubs, resonance | [Topic 18](#/l/w6-stubs) |
        | quarter-wave, half-wave | [Topic 19](#/l/w6-qw) |
        | complex arithmetic by hand | [complex numbers from zero](#/l/e3-complex) |

        ### Check questions
      `),
      Q(md`On the formula sheet, what does the shape factor $GF$ do for a parallel-plate line of width $w$ and gap $h$?`,
        [md`$GF = w/h$, so $Z_0 = \eta/GF = \eta h/w$`, md`$GF = h/w$, so $Z_0 = \eta w/h$`, md`$GF = wh$, the area of the cross-section`, md`$GF = 1$ for every line`], 0,
        [null, md`That is upside down: a wide plate (large $w$) has a large capacitance and so a small $Z_0$.`, md`A shape factor is a ratio with no units. An area has units of m².`, md`$GF$ is what makes a coax differ from a pair of plates. Only $LC = \mu\epsilon$ is the same for every shape.`],
        md`$C = \epsilon w/h = \epsilon\,GF$ and $L = \mu h/w = \mu/GF$. Then $Z_0 = \sqrt{L/C} = \sqrt{\mu/\epsilon}/GF = \eta h/w$.`),
      Q(md`Which statement about the nine old papers is true?`,
        ['Every spring and fall paper has a bounce diagram, and no summer paper has a transmission line', 'Every paper has a polarization problem', 'Only summer papers have lossy media', 'The Smith chart appears on every spring paper'], 0,
        [null, md`Spring 2024 and Summer 2020 have none.`, md`Lossy media are on all nine.`, md`The Smith chart is a Final topic, not an Exam 3 topic.`],
        md`Bounce diagrams: 5 of 5 spring and fall papers. Lines: 0 of 4 summer papers. Lossy media: 9 of 9.`),
    ],
  });

  // ---------------------------------------------------------------- the question bank: e3-map
  EM.BANK['e3-map'] = [
    Q(md`How long is Exam 3, and what may you bring?`,
      ['75 minutes, one handwritten 4"×6" card, plus the official formula sheet', '75 minutes, a calculator and the formula sheet', '50 minutes, three 3"×5" cards', '120 minutes, open book'], 0,
      [null, md`No calculator is allowed. That is why every number on the exam is chosen to work by hand.`, md`Older spring papers allowed three 3×5 cards. This term it is one 4×6 card, for 75 minutes.`, md`It is closed book, 7:00 to 8:15 pm.`],
      md`Monday 7:00 to 8:15 pm: 75 minutes, closed book, no calculator, one 4"×6" card, and the 3-page formula sheet.`),
    Q(md`Which topic is **not** on Exam 3?`,
      ['The Smith chart', 'Quarter-wave transformers', 'Bounce diagrams with two lines', 'Skin depth in a good conductor'], 0,
      [null, md`Half- and quarter-wave transformers are Lecture 33, inside the scope (Lectures 20 to 33).`, md`Multi-line bounce diagrams are Lecture 30 and were 34 points in Spring 2024.`, md`Good conductors are Lecture 23 and were 30 points in Spring 2024.`],
      md`The Smith chart is Lecture 34, on exam day. It is on the Final.`),
    Q(md`Which topic appeared on all nine old Exam 3 papers?`,
      ['Waves in lossy media ($\\gamma$, $\\eta$, skin depth)', 'Bounce diagrams', 'Polarization', 'Current sheets'], 0,
      [null, md`Bounce diagrams are on all five spring and fall papers, but on none of the summer ones.`, md`Polarization is on seven of nine; Spring 2024 has none.`, md`Current sheets are on five of nine: Spring 2024 and the four summer papers.`],
      md`A lossy wave is on every paper, 9 of 9. Expect one on Monday.`),
    Q(md`Spring 2024 Problem 2 gives a good conductor with $\delta = 1$ mm. What is $\gamma$?`,
      [md`$1000(1 + j)$ m⁻¹`, md`$1000$ m⁻¹`, md`$j1000$ m⁻¹`, md`$10^{-3}(1 + j)$ m⁻¹`], 0,
      [null, md`That is only $\alpha$. In a good conductor $\beta \approx \alpha$ too.`, md`That is a lossless wave. A good conductor has as much decay as phase.`, md`That uses $\delta$ itself. $\alpha = 1/\delta = 1/(10^{-3}\ \text{m})$.`],
      md`$\alpha = \beta = 1/\delta = 1000$ m⁻¹, so $\gamma = \alpha + j\beta = 1000(1 + j)$ m⁻¹.`),
    Q(md`In Spring 2024 Problem 1, the two sheets are 0.5 m apart at 300 MHz in free space. Why do the fields cancel outside the pair?`,
      ['The spacing is half a wavelength, so one sheet\'s wave arrives with an extra factor $e^{-j\\pi} = -1$', 'The two currents point in opposite directions', 'Waves from two sheets always cancel outside', 'The fields decay with distance from each sheet'], 0,
      [null, md`Both sheets carry the same current, $-2\hat x$ A/m.`, md`Only for this spacing. At a quarter-wave spacing they would not cancel on both sides.`, md`An infinite sheet's wave does not decay in free space.`],
      md`$\lambda = 1$ m, so $\beta(0.5) = \pi$. For $z > 0.5$ the two waves are $e^{-j\beta z}$ and $e^{-j\beta(z - 0.5)} = -e^{-j\beta z}$: they cancel. The same happens for $z < 0$.`),
    Q(md`Spring 2024 Problem 3 gives the coax capacitance $C = 2\pi\epsilon/\ln(b/a)$. The fastest way to $L$ is…`,
      [md`$LC = \mu\epsilon$, so $L = \mu\ln(b/a)/2\pi$`, md`$L = 1/C$`, md`$L = \mu C/\epsilon$`, md`$L = \mu\,2\pi/\ln(b/a)$`], 0,
      [null, md`The units do not work: $1/C$ is in m/F, not H/m.`, md`That gives $\mu\cdot2\pi/\ln(b/a)$: the logarithm ended up upside down. Use $L = \mu\epsilon/C$.`, md`That copies the shape of $C$. Inductance has the log on top: more space between the conductors, more flux.`],
      md`For every TEM line $LC = \mu\epsilon$. So $L = \mu\epsilon/C = \mu\epsilon\ln(b/a)/(2\pi\epsilon) = \mu\ln(b/a)/2\pi$.`),
    Q(md`Spring 2024 Problem 4: $R_g = 50\ \Omega$, the first line has $Z_{01} = 150\ \Omega$, $v_g = 80u(t)$ V. The first voltage wave launched is…`,
      ['60 V', '20 V', '80 V', '40 V'], 0,
      [null, md`That uses $R_g/(R_g + Z_0)$. The line's share is $Z_0/(R_g + Z_0)$.`, md`That forgets the divider: the source resistance and the line share the 80 V.`, md`That splits it evenly, as if $Z_{01} = R_g$.`],
      md`$\tau_g = Z_{01}/(R_g + Z_{01}) = 150/200 = \tfrac34$, so $V^+ = \tfrac34\cdot80 = 60$ V.`),
    Q(md`Spring 2024 Problem 4(c): what is the DC current as $t \to \infty$?`,
      ['0.8 A', '1.6 A', '0.4 A', '0.53 A'], 0,
      [null, md`That uses only $R_g$: $80/50$. In DC the load is in series too.`, md`That counts $R_g$, $R_L$ and an extra 100 $\Omega$. Lossless lines are plain wires in DC.`, md`That puts $Z_{01} = 150\ \Omega$ in series. In DC steady state the characteristic impedances do not appear.`],
      md`At DC the lines are just wires: $I = 80/(50 + 50) = 0.8$ A.`),
    Q(md`Which of these is **not** on the formula sheet, so it must go on your card or in your head?`,
      ['The rule for which hand a circular wave has', '$\\Gamma = (\\eta_2 - \\eta_1)/(\\eta_2 + \\eta_1)$', '$\\tau_g = Z_0/(R_g + Z_0)$', '$\\langle\\mathbf S\\rangle = \\tfrac12\\Re\\{\\tilde{\\mathbf E}\\times\\tilde{\\mathbf H}^*\\}$'], 0,
      [null, md`It is on page 3, with $\tau = 1 + \Gamma$.`, md`It is on page 3, with $\Gamma_L$ and $\Gamma_g$.`, md`It is on page 2.`],
      md`The sheet has nothing about polarization. The handedness rule is yours to carry.`),
    Q(md`The skin depth $\delta$ of a good conductor is…`,
      [md`$1/\alpha$, which is **not** written on the sheet`, md`$\alpha$ itself, on the sheet`, md`$2\pi/\beta$, on the sheet`, md`$1/(2\alpha)$, the power's decay length`], 0,
      [null, md`$\alpha$ is in Np/m; a depth is in meters.`, md`$2\pi/\beta$ is the wavelength, which is $2\pi\delta$ in a good conductor.`, md`$1/(2\alpha)$ is where the **power** falls to $1/e$. The skin depth is defined with the field.`],
      md`$\delta = 1/\alpha$: the field falls to $1/e$. The sheet gives $\alpha \approx \sqrt{\omega\mu\sigma/2}$ but never names $\delta$.`),
    Q(md`From Kirchhoff's voltage law on a piece of line, $\partial V/\partial z = -L\,\partial I/\partial t$. The plane-wave equation it matches is…`,
      [md`$\partial E_x/\partial z = -\mu\,\partial H_y/\partial t$ (Faraday)`, md`$\partial H_y/\partial z = -\epsilon\,\partial E_x/\partial t$ (Ampère)`, md`$\partial E_x/\partial z = -\epsilon\,\partial H_y/\partial t$`, md`$\partial^2E_x/\partial z^2 = \mu\epsilon\,\partial^2E_x/\partial t^2$`], 0,
      [null, md`That matches the current law, $\partial I/\partial z = -C\,\partial V/\partial t$.`, md`$\epsilon$ goes with the capacitor and Ampère's law. Faraday's law has $\mu$.`, md`That is the wave equation, which both systems give after combining the two first-order equations.`],
      md`$V \leftrightarrow E_x$, $I \leftrightarrow H_y$, $L \leftrightarrow \mu$: KVL is Faraday's law, KCL is Ampère's law.`),
    Q(md`For every TEM transmission line, whatever its shape, $LC$ equals…`,
      [md`$\mu\epsilon$ of the material between the conductors`, md`$\mu_0\epsilon_0$ always`, md`$Z_0^2$`, md`$1/\eta^2$`], 0,
      [null, md`Only an air-filled line has $LC = \mu_0\epsilon_0$.`, md`$Z_0^2 = L/C$, the ratio, not the product.`, md`That has the wrong units: $LC$ is in s²/m².`],
      md`The shape factors cancel in the product: $LC = \mu\epsilon$, so $v = 1/\sqrt{\mu\epsilon}$, the speed of light in the filling.`),
    Q(md`An air-filled parallel-plate line has plates 2 cm wide and 1 cm apart. Its $Z_0$ is about…`,
      [md`$60\pi \approx 188\ \Omega$`, md`$240\pi \approx 754\ \Omega$`, md`$120\pi \approx 377\ \Omega$`, md`$30\pi \approx 94\ \Omega$`], 0,
      [null, md`That is $\eta_0\,w/h$: the ratio upside down.`, md`That is $w = h$. These plates are twice as wide as their gap.`, md`That divides by 4. $Z_0 = \eta_0h/w$ with $h/w = \tfrac12$.`],
      md`$Z_0 = \eta_0\,h/w = 120\pi\cdot\tfrac12 = 60\pi \approx 188\ \Omega$. (A line this wide and close is not exactly a plane wave at its edges; the formula assumes $w \gg h$.)`),
    Q(md`A wave on a 50 $\Omega$ line reaches a 150 $\Omega$ line. The **current** reflection coefficient is…`,
      [md`$-\tfrac12$`, md`$+\tfrac12$`, md`$\tfrac32$`, md`$-\tfrac32$`], 0,
      [null, md`That is the voltage coefficient, $(150 - 50)/200$. Current reflects with the opposite sign.`, md`That is the voltage **transmission** coefficient, $1 + \Gamma$.`, md`That is not a reflection coefficient of either kind: it has size above 1.`],
      md`Voltage: $\Gamma = +\tfrac12$. A backward wave has $I^- = -V^-/Z_0$, so the current reflects with $-\Gamma = -\tfrac12$. Fall 2023 #3 asked exactly this.`),
    Q(md`In a time-domain line problem, $z$ is measured from…; in a phasor line problem, $d$ is measured from…`,
      ['the generator, toward the load; the load, back toward the generator', 'the load in both', 'the generator in both', 'the middle of the line in both'], 0,
      [null, md`Time-domain problems start the clock and the distance at the generator.`, md`Phasor formulas like $\Gamma(d) = \Gamma_Le^{-j2\beta d}$ need $d = 0$ at the load.`, md`Neither convention uses the middle.`],
      md`Bounce diagrams use $z$ from the generator. $V(d)$, $\Gamma(d)$, $Z(d)$ use $d$ from the load, as on the sheet.`),
    Q(md`A wave hits a material that has the same $\eta$ as the one it came from, but a different $\mu$ and $\epsilon$. On a line, the same thing is…`,
      ['joining two lines with the same $Z_0$ but different speeds: no reflection', 'a short circuit', 'an open circuit', 'a quarter-wave transformer'], 0,
      [null, md`A short has $Z_L = 0$, which reflects everything.`, md`An open has $Z_L = \infty$, which reflects everything with $\Gamma = +1$.`, md`A transformer needs a different $Z_0$ in the middle.`],
      md`$\Gamma$ depends only on the impedances: $(\eta_2 - \eta_1)/(\eta_2 + \eta_1) = 0$. The wave passes into the new medium unreflected, only slower or faster.`),
    Q(md`Why does $\tfrac12\Re\{\tilde V\tilde I^*\}$ give the average power on a line?`,
      ['It is the line version of $\\tfrac12\\Re\\{\\tilde{\\mathbf E}\\times\\tilde{\\mathbf H}^*\\}$: the same time average of a product of two cosines', 'Because power on a line is always real', 'Because $\\tilde I^* = \\tilde I$ on a lossless line', 'It is a definition with no derivation'], 0,
      [null, md`Instantaneous power $v(t)i(t)$ is real; the formula is about its average.`, md`$\tilde I$ is complex in general; the conjugate matters.`, md`It follows from averaging $V_0\cos(\omega t + \phi_V)\,I_0\cos(\omega t + \phi_I)$ over a period.`],
      md`The average of $V_0\cos(\omega t + \phi_V)I_0\cos(\omega t + \phi_I)$ is $\tfrac12V_0I_0\cos(\phi_V - \phi_I) = \tfrac12\Re\{\tilde V\tilde I^*\}$. Swap $V, I$ for $E, H$ and it is the Poynting average.`),
  ];

  // ================================================================ figures for e3-complex
  const S2 = Math.SQRT2, S3 = Math.sqrt(3);
  // a label anchor that points away from the center at angle a (degrees, counterclockwise)
  const outAt = (a) => {
    const c = Math.cos(a * PI / 180), s = Math.sin(a * PI / 180);
    return ((s > 0.3 ? 'b' : s < -0.3 ? 't' : '') + (c > 0.3 ? 'l' : c < -0.3 ? 'r' : '')) || 'c';
  };
  function planeFig() {
    const g = PF.fig({ alt: 'the complex plane: the number 3 + j4 is the point 3 to the right and 4 up; the arrow from the origin to it has length 5 and makes the angle theta with the real axis' });
    const ox = 50, oy = 190, s = 36, X = (a) => ox + a * s, Y = (b) => oy - b * s;
    g.arrow(X(-0.6), oy, X(5), oy, { cls: 'dim', hs: 7 }); g.arrow(ox, Y(-0.6), ox, Y(4.9), { cls: 'dim', hs: 7 });
    g.label(X(5) + 4, oy, '\\text{Re}', 'l', 'small'); g.label(ox + 6, Y(4.9), '\\text{Im}', 'l', 'small');
    g.line(X(3), Y(4), X(3), oy, { cls: 'dash' }); g.line(X(3), Y(4), ox, Y(4), { cls: 'dash' });
    g.arrow(ox, oy, X(3), Y(4), { cls: 'thick', hs: 9 });
    g.dot(X(3), Y(4), 3.5);
    g.label(X(3) + 8, Y(4) - 2, '3 + j4', 'l');
    g.label(X(3), oy + 6, '3', 't', 'small accent'); g.label(ox - 6, Y(4), '4', 'r', 'small accent');
    g.label(X(1.5) - 8, Y(2) - 6, '|z| = 5', 'br', 'small');
    g.angle(ox, oy, 30, 0, 53.13, '\\theta');
    return g.svg();
  }
  function circleFig() {
    const g = PF.fig({ alt: 'the unit circle: e to the j theta is the arrow of length 1 at angle theta; its shadow on the real axis is cos theta and on the imaginary axis sin theta; the points 1, j, minus 1 and minus j sit at 0, 90, 180 and 270 degrees' });
    const cx = 150, cy = 125, Rr = 90, th = 40 * PI / 180;
    g.arrow(cx - Rr - 34, cy, cx + Rr + 34, cy, { cls: 'dim', hs: 7 }); g.arrow(cx, cy + Rr + 26, cx, cy - Rr - 28, { cls: 'dim', hs: 7 });
    g.label(cx + Rr + 38, cy, '\\text{Re}', 'l', 'small'); g.label(cx + 8, cy - Rr - 28, '\\text{Im}', 'l', 'small');
    g.circle(cx, cy, Rr, { cls: 'dim' });
    const tx = cx + Rr * Math.cos(th), ty = cy - Rr * Math.sin(th);
    g.line(tx, ty, tx, cy, { cls: 'dash' }); g.line(tx, ty, cx, ty, { cls: 'dash' });
    g.arrow(cx, cy, tx, ty, { cls: 'thick', hs: 9 });
    g.label(tx + 8, ty - 6, 'e^{j\\theta}', 'bl');
    g.label((cx + tx) / 2 + 6, cy + 6, '\\cos\\theta', 't', 'small');
    g.label(cx - 6, ty, '\\sin\\theta', 'r', 'small');
    g.angle(cx, cy, 24, 0, 40, '\\theta');
    for (const [a, t, at, dx, dy] of [[0, '1', 'bl', 5, -5], [90, 'j', 'bl', 6, -4], [180, '-1', 'br', -5, -5], [270, '-j', 'tl', 6, 4]]) {
      const x = cx + Rr * Math.cos(a * PI / 180), y = cy - Rr * Math.sin(a * PI / 180);
      g.dot(x, y, 3.5); g.label(x + dx, y + dy, t, at);
    }
    return g.svg();
  }
  function rotFig() {
    const g = PF.fig({ alt: 'Gamma of d on a circle of radius |Gamma_L|: it starts at Gamma_L when d = 0 and turns clockwise by 90 degrees for each eighth of a wavelength, through d = lambda/8, lambda/4 and 3 lambda/8, back to the start at lambda/2' });
    const cx = 160, cy = 120, Rr = 72, a0 = 30;
    g.arrow(cx - Rr - 40, cy, cx + Rr + 40, cy, { cls: 'dim', hs: 7 }); g.arrow(cx, cy + Rr + 28, cx, cy - Rr - 30, { cls: 'dim', hs: 7 });
    g.label(cx + Rr + 44, cy, '\\text{Re}', 'l', 'small'); g.label(cx + 8, cy - Rr - 30, '\\text{Im}', 'l', 'small');
    g.circle(cx, cy, Rr, { cls: 'dim dash' });
    const labs = ['d = 0', 'd = \\lambda/8', 'd = \\lambda/4', 'd = 3\\lambda/8'];
    labs.forEach((t, k) => {
      const a = a0 - 90 * k, x = cx + Rr * Math.cos(a * PI / 180), y = cy - Rr * Math.sin(a * PI / 180);
      g.dot(x, y, 4);
      g.label(cx + (Rr + 10) * Math.cos(a * PI / 180), cy - (Rr + 10) * Math.sin(a * PI / 180), t, outAt(a), 'small');
    });
    // clockwise arrow between the first two points, just inside the circle
    const r2 = Rr - 16, P = (a) => [cx + r2 * Math.cos(a * PI / 180), cy - r2 * Math.sin(a * PI / 180)];
    g.arc(cx, cy, r2, a0 - 70, a0 - 15, { cls: 'thin' });
    const [ax, ay] = P(a0 - 66), [bx, by] = P(a0 - 72);
    g.arrow(ax, ay, bx, by, { hs: 7 });
    g.label(cx + 8, cy + 6, '0', 'tl', 'small accent');
    return g.svg();
  }

  // ================================================================ lesson: complex numbers from zero
  EM.lesson('e3s', {
    id: 'e3-complex', topic: 0, order: 0.1, ref: 'no calculator', title: 'Complex numbers from zero, and arithmetic without a calculator',
    steps: [
      R(md`
        !!key Why you care
          There is no calculator on Monday, and almost every Exam 3 answer is a complex number: $\eta = j\omega\mu/\gamma$, $\Gamma = (Z_L - Z_0)/(Z_L + Z_0)$, $e^{-j2\beta d}$, the sum of two waves. The papers know it. Spring 2019 printed the hint $1 + j\sqrt3 = 2e^{j60°}$. Spring 2024 printed $e^{j\pi} = -1$ and the formulas for $\cos\theta$ and $\sin\theta$ in exponentials. This page builds complex numbers from nothing. Then it drills the dozen numbers every exam reuses, until each one takes you two seconds.

        ### Notation

        - $j$: the number whose square is $-1$. Engineers write $j$ because $i$ already means current.
        - $z = a + jb$: a complex number. $a$ is its **real part**, written $\Re\{z\}$. $b$ is its **imaginary part**, written $\Im\{z\}$. Both $a$ and $b$ are ordinary real numbers.
        - $|z|$: the **size** (magnitude) of $z$. Always a positive real number.
        - $\theta$, or $\angle z$: the **angle** of $z$, measured counterclockwise from the positive real axis.
        - $z^*$: the **conjugate** of $z$: the same number with the sign of its imaginary part flipped.
        - $e^{j\theta}$: the arrow of length 1 at angle $\theta$ (Section 4).
        - Radians and degrees: $\pi$ rad $= 180°$. So $\pi/2 = 90°$, $\pi/3 = 60°$, $\pi/4 = 45°$, $\pi/6 = 30°$.

        ### 1. Where $j$ comes from

        Start with the number line. Multiplying by $-1$ flips a number to the other side of zero. That is a turn by $180°$.

        Now ask: is there a number that, applied **twice**, turns by $180°$? Half of a $180°$ turn is a $90°$ turn. So that number turns things by $90°$, off the number line, into a second direction. Call it $j$. Applying it twice is the same as multiplying by $-1$:
        $$j\cdot j = -1$$
        No real number does this. That is why we need the second direction, the **imaginary axis**, at right angles to the real one. Keep this picture: **multiplying by $j$ rotates by $90°$ counterclockwise.**

        Follow the number 1 as you keep multiplying by $j$:
        $$j^1 = j,\quad j^2 = -1,\quad j^3 = -j,\quad j^4 = 1$$
        Four quarter turns make a full turn, so the pattern repeats every four powers.

        **Dividing by $j$.** Multiply the top and the bottom by $j$. The bottom becomes $j^2 = -1$:
        $$\frac{1}{j} = \frac{j}{j\cdot j} = \frac{j}{-1} = -j$$
        So dividing by $j$ rotates by $90°$ **clockwise**. You will use $1/j = -j$ all the time. It is the step that turns $\epsilon + \sigma/j\omega$ into $\epsilon - j\sigma/\omega$ in [Topic 5](#/l/w2-gamma).

        !!intuition Does this make sense?
          Multiply back to check: $j\cdot(-j) = -j^2 = -(-1) = 1$ ✓. And a quarter turn counterclockwise followed by a quarter turn clockwise brings you back where you started ✓.
      `),
      Q(md`**Predict.** What is $j^7$?`,
        [md`$-j$`, md`$j$`, md`$-1$`, md`$1$`], 0,
        [null, md`That would be $j^5$ or $j^1$. Seven is $4 + 3$, so $j^7 = j^3$.`, md`That is $j^2$ or $j^6$.`, md`That is $j^4$ or $j^8$, a whole number of full turns.`],
        md`$j^4 = 1$, so drop full turns: $j^7 = j^4\cdot j^3 = j^3 = -j$. Seven quarter turns is one full turn plus three quarters.`),
      RF(md`
        ### 2. The complex plane, and rectangular form

        A complex number $z = a + jb$ is a point in a plane: go $a$ along the real axis, then $b$ up the imaginary axis. Writing it as $a + jb$ is its **rectangular form**.

        [[fig:plane]]

        **Adding** means adding the parts separately, like walking one trip and then another:
        $$(3 + j4) + (1 - j2) = (3 + 1) + j(4 - 2)$$
        $$= 4 + j2$$
        **Multiplying** in rectangular form: multiply every term by every term, then use $j^2 = -1$:
        $$(3 + j4)(1 - j2) = 3 - j6 + j4 - j^2\,8$$
        The last term is $-j^2\,8 = -(-1)\,8 = +8$. Collect the real parts and the imaginary parts:
        $$= (3 + 8) + j(4 - 6) = 11 - j2$$
        That works, but it is slow and easy to slip. Section 5 gives the fast way.

        ### 3. Polar form: a size and an angle

        The same point can be described differently: how far it is from 0, and in which direction.

        **The size.** The legs of the right triangle in the figure are $a$ and $b$. Pythagoras gives the hypotenuse:
        $$|z| = \sqrt{a^2 + b^2}$$
        **The angle.** The tangent of the angle is the opposite leg over the adjacent leg:
        $$\tan\theta = \frac{b}{a}$$
        **Back again.** From the same triangle, each leg is the hypotenuse times a cosine or a sine:
        $$a = |z|\cos\theta, \qquad b = |z|\sin\theta$$
        For $3 + j4$: the size is $\sqrt{9 + 16} = \sqrt{25} = 5$, and the angle is $\tan^{-1}(4/3) \approx 53.1°$. This is the 3-4-5 triangle, with $\cos\theta = 3/5$ and $\sin\theta = 4/5$.

        !!trap The quadrant
          $\tan^{-1}(b/a)$ only sees the ratio. $1 + j$ and $-1 - j$ have the same ratio, 1, but they point in opposite directions: $45°$ and $-135°$. **Sketch the point first.** The signs of $a$ and $b$ tell you the quadrant; the triangle tells you the angle inside it.
      `, { plane: { svg: planeFig(), cap: 'The point 3 + j4: 3 along the real axis, 4 up. Its size is 5 and its angle θ ≈ 53.1°.' } }),
      Q(md`**Predict.** What is the angle of $-1 + j\sqrt3$?`,
        [md`$120°$`, md`$-60°$`, md`$60°$`, md`$150°$`], 0,
        [null, md`That is $\tan^{-1}(\sqrt3/(-1)) = \tan^{-1}(-\sqrt3)$ straight from a calculator. The point has $a < 0$ and $b > 0$: it is in the upper left, so the angle is between $90°$ and $180°$.`, md`That is the angle of $1 + j\sqrt3$. The real part here is negative.`, md`That is the angle of $-\sqrt3 + j$: the legs are swapped. Here the imaginary leg is the long one.`],
        md`Sketch it: 1 to the left, $\sqrt3$ up. The triangle has legs 1 and $\sqrt3$, so it makes $60°$ with the negative real axis. Measured from the positive real axis that is $180° - 60° = 120°$. Size: $\sqrt{1 + 3} = 2$.`),
      RF(md`
        ### 4. Euler's formula: the arrow at angle $\theta$

        Here is the most useful formula in this course, derived from scratch. Define a function of the angle $\theta$:
        $$u(\theta) = \cos\theta + j\sin\theta$$
        By Section 3, this is the point at distance 1 from the origin, at angle $\theta$. Differentiate it with respect to $\theta$:
        $$\frac{du}{d\theta} = -\sin\theta + j\cos\theta$$
        Now pull out a factor of $j$. Since $j\cdot j = -1$, you can write $-\sin\theta$ as $j\cdot j\sin\theta$:
        $$\frac{du}{d\theta} = j\cos\theta + j\cdot j\sin\theta = j(\cos\theta + j\sin\theta)$$
        The bracket is $u$ itself:
        $$\frac{du}{d\theta} = j\,u, \qquad u(0) = 1$$
        So $u$ is a function whose derivative is $j$ times itself, and which starts at 1. The exponential $e^{j\theta}$ has exactly the same two properties: its derivative is $je^{j\theta}$, and $e^0 = 1$. A function is fixed by its derivative rule and its starting value, so these are the same function:
        $$\boxed{e^{j\theta} = \cos\theta + j\sin\theta}$$
        This is **Euler's formula**. $e^{j\theta}$ is the arrow of length 1 at angle $\theta$. And any complex number is its size times the arrow in its direction:
        $$\boxed{z = |z|\,e^{j\theta}}$$
        That is the **polar form**.

        [[fig:circle]]

        Read the special arrows straight off the circle:

        | $\theta$ | $e^{j\theta}$ |
        |---|---|
        | $0$ | $1$ |
        | $\pi/2 = 90°$ | $j$ |
        | $\pi = 180°$ | $-1$ |
        | $3\pi/2 = 270°$, same as $-90°$ | $-j$ |
        | $2\pi = 360°$ | $1$ |
        | $\pi/4 = 45°$ | $(1 + j)/\sqrt2$ |
        | $\pi/3 = 60°$ | $\tfrac12 + j\tfrac{\sqrt3}{2}$ |
        | $\pi/6 = 30°$ | $\tfrac{\sqrt3}{2} + j\tfrac12$ |

        **Cosine and sine from exponentials.** Write Euler's formula for $+\theta$ and for $-\theta$. Since $\cos(-\theta) = \cos\theta$ and $\sin(-\theta) = -\sin\theta$:
        $$e^{j\theta} = \cos\theta + j\sin\theta$$
        $$e^{-j\theta} = \cos\theta - j\sin\theta$$
        Add the two lines. The sines cancel:
        $$e^{j\theta} + e^{-j\theta} = 2\cos\theta$$
        Subtract the second from the first. The cosines cancel:
        $$e^{j\theta} - e^{-j\theta} = 2j\sin\theta$$
        These are the two lines Spring 2024 printed on the exam. They turn two traveling waves into one standing wave.

        !!intuition Does this make sense?
          The size of $e^{j\theta}$ is $\sqrt{\cos^2\theta + \sin^2\theta} = 1$ for every $\theta$: the arrow stays on the unit circle ✓. And $e^{j\pi/2} = \cos90° + j\sin90° = j$: the quarter turn of Section 1 ✓.
      `, { circle: { svg: circleFig(), cap: 'The unit circle. The arrow $e^{j\\theta}$ has shadow $\\cos\\theta$ on the real axis and $\\sin\\theta$ on the imaginary axis.' } }),
      Q(md`**Predict.** What is $e^{-j3\pi/2}$?`,
        [md`$j$`, md`$-j$`, md`$-1$`, md`$1$`], 0,
        [null, md`That is $e^{+j3\pi/2}$. The minus sign means turning clockwise: three quarter turns clockwise.`, md`That is $e^{\pm j\pi}$, two quarter turns.`, md`That needs a whole number of full turns, $e^{j2\pi n}$.`],
        md`Three quarter turns clockwise from 1: down to $-j$, left to $-1$, up to $j$. So $e^{-j3\pi/2} = j$. Same as one quarter turn counterclockwise, since $-270° + 360° = 90°$.`),
      Q(md`**Predict.** In Spring 2024 #1, the field between the two sheets came out as $\eta_0\left(e^{-j\beta z} - e^{j\beta z}\right)\hat x$. Simplify it.`,
        [md`$-2j\eta_0\sin(\beta z)\,\hat x$`, md`$2j\eta_0\sin(\beta z)\,\hat x$`, md`$2\eta_0\cos(\beta z)\,\hat x$`, md`$-2\eta_0\sin(\beta z)\,\hat x$`], 0,
        [null, md`$e^{j\theta} - e^{-j\theta} = 2j\sin\theta$. Here the order is reversed, $e^{-j\theta} - e^{j\theta}$, which flips the sign.`, md`A cosine comes from a **sum**, $e^{j\theta} + e^{-j\theta}$. This is a difference.`, md`The $j$ is lost. The difference of the two exponentials is purely imaginary.`],
        md`$e^{-j\beta z} - e^{j\beta z} = -(e^{j\beta z} - e^{-j\beta z}) = -2j\sin\beta z$. With $\eta_0 = 120\pi$ and $\beta = 2\pi$: $-j240\pi\sin(2\pi z)\,\hat x$ V/m.`),
      R(md`
        ### 5. Multiplying and dividing: use polar form

        When you multiply two exponentials, their exponents add:
        $$z_1z_2 = |z_1|e^{j\theta_1}\cdot|z_2|e^{j\theta_2}$$
        $$= |z_1||z_2|\,e^{j(\theta_1 + \theta_2)}$$
        **Multiply the sizes, add the angles.** Dividing is the reverse:
        $$\frac{z_1}{z_2} = \frac{|z_1|}{|z_2|}\,e^{j(\theta_1 - \theta_2)}$$
        **Divide the sizes, subtract the angles.**

        Check this against Section 2. In polar form $3 + j4 = 5e^{j53.1°}$ and $1 - j2 = \sqrt5\,e^{-j63.4°}$. The product should have size $5\sqrt5 \approx 11.2$ and angle $53.1° - 63.4° = -10.3°$. And indeed $11 - j2$ has size $\sqrt{121 + 4} = \sqrt{125} \approx 11.2$ and angle $\tan^{-1}(-2/11) \approx -10.3°$ ✓.

        Everything about $j$ now fits in one picture. $j = e^{j90°}$, so multiplying by $j$ adds $90°$ to the angle. Multiplying by $e^{-j\beta z}$ subtracts $\beta z$ from the angle and leaves the size alone: that is a phase delay, the thing every traveling wave does.

        !!method Which form for which job
          - **Add or subtract:** rectangular.
          - **Multiply, divide, powers, roots:** polar.
          - Converting costs a few seconds. Convert once, then stay in the form that suits the job.

        **Example: $\eta$ from $\gamma$.** In [Topic 5](#/l/w2-gamma) we had $\eta = j\omega\mu/\gamma$ with $\omega\mu = 400$ and $\gamma = 2 + j2$. Put the top in polar form:
        $$j400 = 400\,e^{j90°}$$
        Put the bottom in polar form. Its size is $\sqrt{4 + 4} = 2\sqrt2$, and its legs are equal, so its angle is $45°$:
        $$2 + j2 = 2\sqrt2\,e^{j45°}$$
        Divide the sizes and subtract the angles:
        $$\eta = \frac{400}{2\sqrt2}\,e^{j(90° - 45°)} = 100\sqrt2\,e^{j45°}$$
        Back to rectangular, with $\cos45° = \sin45° = 1/\sqrt2$:
        $$\eta = 100\sqrt2\cdot\frac{1 + j}{\sqrt2} = 100 + j100\ \Omega$$
      `),
      Q(md`**Predict.** What is $\left(2e^{j30°}\right)\left(3e^{j60°}\right)$?`,
        [md`$j6$`, md`$5e^{j90°}$`, md`$6e^{j1800°}$`, md`$6e^{-j30°}$`], 0,
        [null, md`That adds the sizes. Sizes multiply: $2\cdot3 = 6$.`, md`That multiplies the angles. Angles add.`, md`That subtracts the angles, which is what division does.`],
        md`Sizes multiply: $6$. Angles add: $90°$. So $6e^{j90°} = j6$.`),
      Q(md`**Predict.** Spring 2019 #1 had $\omega\mu = 16\pi^2\ \Omega$/m and $\gamma = 1 + j\sqrt3$ m⁻¹. Then $\eta = j\omega\mu/\gamma$ is…`,
        [md`$8\pi^2e^{j30°}\ \Omega$`, md`$8\pi^2e^{j150°}\ \Omega$`, md`$8\pi^2e^{-j30°}\ \Omega$`, md`$16\pi^2e^{j30°}\ \Omega$`], 0,
        [null, md`That adds the angle of $\gamma$. Dividing by $\gamma$ subtracts it: $90° - 60°$.`, md`That subtracts in the wrong order. The angle of the top, $90°$, minus the angle of the bottom, $60°$.`, md`That forgets the size of $\gamma$: $|1 + j\sqrt3| = 2$.`],
        md`$1 + j\sqrt3 = 2e^{j60°}$ (the hint printed on that exam). Then $\eta = 16\pi^2e^{j90°}/(2e^{j60°}) = 8\pi^2e^{j30°} \approx 79e^{j30°}\ \Omega$. The angles of $\eta$ and $\gamma$ add to $90°$, as they must.`),
      R(md`
        ### 6. The conjugate, the size, and the real part

        The **conjugate** flips the sign of the imaginary part. In polar form it flips the angle: the point is mirrored across the real axis.
        $$z^* = a - jb = |z|e^{-j\theta}$$
        Multiply a number by its own conjugate:
        $$zz^* = (a + jb)(a - jb) = a^2 - jab + jab - j^2b^2$$
        The middle terms cancel, and $-j^2 = +1$:
        $$zz^* = a^2 + b^2 = |z|^2$$
        So $zz^*$ is always real and positive. That is the trick for dividing in rectangular form: **multiply the top and the bottom by the conjugate of the bottom.** The bottom becomes real:
        $$\frac{1}{1 + j} = \frac{1 - j}{(1 + j)(1 - j)} = \frac{1 - j}{2}$$
        **The real and imaginary parts.** Add or subtract $z$ and $z^*$:
        $$\Re\{z\} = \frac{z + z^*}{2}, \qquad \Im\{z\} = \frac{z - z^*}{2j}$$
        **The size of a fraction** is the fraction of the sizes. You never need to simplify first:
        $$\left|\frac{z_1}{z_2}\right| = \frac{|z_1|}{|z_2|}$$
        Example: a load $Z_L = 100 + j50\ \Omega$ on a $Z_0 = 50\ \Omega$ line. $\Gamma = (Z_L - Z_0)/(Z_L + Z_0)$ has top $50 + j50$ and bottom $150 + j50$:
        $$|\Gamma| = \frac{\sqrt{50^2 + 50^2}}{\sqrt{150^2 + 50^2}} = \sqrt{\frac{5000}{25000}} = \frac{1}{\sqrt5} \approx 0.447$$

        **Where the conjugate shows up: average power.** $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$. Take $\tilde E = E_0e^{-j\beta z}$ and $\tilde H = (E_0/|\eta|)\,e^{-j\beta z}e^{-j\tau}$. The conjugate flips both angles of $\tilde H$:
        $$\tilde E\tilde H^* = E_0e^{-j\beta z}\cdot\frac{E_0}{|\eta|}e^{+j\beta z}e^{+j\tau}$$
        The traveling phases cancel. Only the angle between $\mathbf E$ and $\mathbf H$ survives:
        $$\tilde E\tilde H^* = \frac{E_0^2}{|\eta|}e^{j\tau}$$
        Take half the real part:
        $$\langle S\rangle = \frac{E_0^2}{2|\eta|}\cos\tau$$
        That is why the conjugate is there: it subtracts the phases, so what is left is the phase **difference**.
      `),
      Q(md`**Predict.** What is $\left|\dfrac{3 + j4}{1 + j}\right|$?`,
        [md`$5/\sqrt2 \approx 3.54$`, md`$5/2 = 2.5$`, md`$7/2 = 3.5$`, md`$5\sqrt2 \approx 7.07$`], 0,
        [null, md`$|1 + j|$ is $\sqrt2$, not 2: use Pythagoras on the bottom too.`, md`That adds the legs, $3 + 4 = 7$ over $1 + 1 = 2$. Sizes need Pythagoras.`, md`That multiplies the sizes. Division divides them.`],
        md`$|3 + j4| = 5$ and $|1 + j| = \sqrt2$, so the size is $5/\sqrt2 = 5\sqrt2/2 \approx 3.54$.`),
      Q(md`**Predict.** At a point, $\tilde E = 6e^{j40°}$ V/m and $\tilde H = 2e^{j10°}$ A/m (perpendicular, so $\mathbf E\times\mathbf H$ has size $EH$). What is $\tfrac12\Re\{\tilde E\tilde H^*\}$?`,
        [md`$3\sqrt3 \approx 5.2$ W/m²`, md`$6$ W/m²`, md`$3$ W/m²`, md`$6\sqrt3 \approx 10.4$ W/m²`], 0,
        [null, md`That drops the cosine: it assumes $\mathbf E$ and $\mathbf H$ are in phase. They are $30°$ apart.`, md`That uses $\sin30° = \tfrac12$: the imaginary part. Average power is the real part, with $\cos30°$.`, md`That forgets the $\tfrac12$ of the time average.`],
        md`$\tilde E\tilde H^* = 6\cdot2\,e^{j(40° - 10°)} = 12e^{j30°}$. Real part: $12\cos30° = 6\sqrt3$. Half: $3\sqrt3 \approx 5.2$ W/m².`),
      R(md`
        ### 7. Square roots

        In polar form, a square root takes the root of the size and **half** of the angle:
        $$\sqrt{z} = \sqrt{|z|}\,e^{j\theta/2}$$
        Check it by squaring: $\left(\sqrt{|z|}\,e^{j\theta/2}\right)^2 = |z|\,e^{j\theta}$ ✓. (The negative of this is also a square root. Physics picks the sign, as it picked $\alpha > 0$ in [Topic 5](#/l/w2-gamma).)

        **The root of $j$.** $j = e^{j90°}$. Half the angle:
        $$\sqrt j = e^{j45°} = \frac{1 + j}{\sqrt2}$$
        Check by squaring: $\dfrac{(1 + j)^2}{2} = \dfrac{1 + 2j + j^2}{2} = \dfrac{2j}{2} = j$ ✓.

        **The root of $-j$.** $-j = e^{-j90°}$. Half the angle:
        $$\sqrt{-j} = e^{-j45°} = \frac{1 - j}{\sqrt2}$$
        **The root of $1 - j\sqrt3$.** First the polar form. The size is $\sqrt{1 + 3} = 2$. The legs are 1 and $\sqrt3$, below the axis, so the angle is $-60°$:
        $$1 - j\sqrt3 = 2e^{-j60°}$$
        Root of the size, half of the angle:
        $$\sqrt{1 - j\sqrt3} = \sqrt2\,e^{-j30°}$$
        Back to rectangular with $\cos30° = \sqrt3/2$ and $\sin30° = 1/2$:
        $$\sqrt2\left(\frac{\sqrt3}{2} - \frac{j}{2}\right) = \frac{\sqrt6 - j\sqrt2}{2}$$
        That is about $1.22 - j0.71$. This is exactly the loss tangent $\sigma/\omega\epsilon = \sqrt3$ of [Topic 5](#/l/w2-gamma)'s first example.

        **Where you need it: the good conductor.** When $\sigma \gg \omega\epsilon$, the displacement term is negligible, and
        $$\gamma^2 = j\omega\mu(\sigma + j\omega\epsilon) \approx j\,\omega\mu\sigma$$
        Take the root. $\omega\mu\sigma$ is a positive number; $j$ brings $\sqrt j$:
        $$\gamma = \sqrt{\omega\mu\sigma}\,\sqrt j = \sqrt{\omega\mu\sigma}\,\frac{1 + j}{\sqrt2}$$
        Split it into real and imaginary parts:
        $$\alpha = \beta = \sqrt{\frac{\omega\mu\sigma}{2}}$$
        That is the good-conductor line on your sheet, and now you know where it comes from. The same $\sqrt j$ gives $\eta = \sqrt{j\omega\mu/\sigma} = \sqrt{\omega\mu/\sigma}\,e^{j45°}$: the $\tau \approx 45°$ on the sheet.

        !!intuition Does this make sense?
          A square root halves the angle, so it pulls every number toward the positive real axis. That is why $\tau$ never exceeds $45°$: it is half of an angle that is at most $90°$. And Spring 2024's $\delta = 1$ mm means $\alpha = \beta = 1000$ m⁻¹, so $\gamma = 1000(1 + j)$ m⁻¹: a $45°$ arrow.
      `),
      Q(md`**Predict.** What is $\sqrt{2j}$ (the root with a positive real part)?`,
        [md`$1 + j$`, md`$\sqrt2\,j$`, md`$\dfrac{1 + j}{\sqrt2}$`, md`$1 - j$`], 0,
        [null, md`That takes the root of the size but keeps the angle at $90°$. The root halves the angle.`, md`That is $\sqrt j$. Here the size is 2, so its root is $\sqrt2$, which multiplies $(1 + j)/\sqrt2$.`, md`That is $\sqrt{-2j}$: angle $-45°$.`],
        md`$2j = 2e^{j90°}$. Root: $\sqrt2\,e^{j45°} = \sqrt2\cdot\dfrac{1 + j}{\sqrt2} = 1 + j$. Check: $(1 + j)^2 = 1 + 2j - 1 = 2j$ ✓.`),
      RF(md`
        ### 8. The numbers to know by heart

        | Number | Size | Angle |
        |---|---|---|
        | $1 + j$ | $\sqrt2$ | $45°$ |
        | $1 - j$ | $\sqrt2$ | $-45°$ |
        | $-1 + j$ | $\sqrt2$ | $135°$ |
        | $1 + j\sqrt3$ | $2$ | $60°$ |
        | $1 - j\sqrt3$ | $2$ | $-60°$ |
        | $\sqrt3 + j$ | $2$ | $30°$ |
        | $\sqrt3 - j$ | $2$ | $-30°$ |
        | $-1 + j\sqrt3$ | $2$ | $120°$ |
        | $3 + j4$ | $5$ | $53.1°$ |
        | $4 + j3$ | $5$ | $36.9°$ |

        **A memory hook.** In $1 + j\sqrt3$ the imaginary leg is the long one, so the arrow is steep: the big angle, $60°$. In $\sqrt3 + j$ the imaginary leg is the short one, so the arrow is shallow: $30°$.

        | $\theta$ | $\cos\theta$ | $\sin\theta$ |
        |---|---|---|
        | $0°$ | $1$ | $0$ |
        | $30°$ | $\sqrt3/2 \approx 0.866$ | $1/2$ |
        | $45°$ | $1/\sqrt2 \approx 0.707$ | $1/\sqrt2 \approx 0.707$ |
        | $60°$ | $1/2$ | $\sqrt3/2 \approx 0.866$ |
        | $90°$ | $0$ | $1$ |

        ### 9. $e^{-j2\beta d}$: the rotation on a line

        On a transmission line the reflection coefficient changes with distance $d$ from the load as $\Gamma(d) = \Gamma_Le^{-j2\beta d}$ ([Topic 17](#/l/w6-vd)). With $\beta = 2\pi/\lambda$, the angle is
        $$2\beta d = \frac{4\pi d}{\lambda}$$
        Measure $d$ in eighths of a wavelength. Each eighth adds $\pi/2$ to $2\beta d$:

        | $d$ | $2\beta d$ | $e^{-j2\beta d}$ |
        |---|---|---|
        | $\lambda/8$ | $\pi/2$ | $-j$ |
        | $\lambda/4$ | $\pi$ | $-1$ |
        | $3\lambda/8$ | $3\pi/2$ | $+j$ |
        | $\lambda/2$ | $2\pi$ | $1$ |

        [[fig:rot]]

        So $\Gamma$ turns **clockwise by a quarter turn every $\lambda/8$**, and returns to where it started every $\lambda/2$. Two facts follow at once. A half-wave line repeats its load. A quarter-wave line flips the sign of $\Gamma$, which turns a high impedance into a low one ([Topic 19](#/l/w6-qw)).

        Example: $\Gamma_L = \tfrac12$. At $d = \lambda/8$, $\Gamma = \tfrac12(-j) = -j\tfrac12$. At $d = \lambda/4$, $\Gamma = -\tfrac12$.

        The one-way factor $e^{-j\beta d}$ turns half as fast: $e^{-j\beta d} = -j$ at $d = \lambda/4$ and $-1$ at $d = \lambda/2$.
      `, { rot: { svg: rotFig(), cap: '$\\Gamma(d) = \\Gamma_Le^{-j2\\beta d}$ keeps its size and turns clockwise, a quarter turn for every $\\lambda/8$.' } }),
      Q(md`**Predict.** A load has $\Gamma_L = j\tfrac12$. What is $\Gamma(d)$ at $d = 3\lambda/8$?`,
        [md`$-\tfrac12$`, md`$+\tfrac12$`, md`$-j\tfrac12$`, md`$j\tfrac12$`], 0,
        [null, md`That turns by only one eighth-step: $j\tfrac12\cdot(-j) = \tfrac12$ is $d = \lambda/8$.`, md`That is $d = \lambda/4$: a half turn, multiplying by $-1$.`, md`That is a full turn, $d = \lambda/2$.`],
        md`$d = 3\lambda/8$ gives $2\beta d = 3\pi/2$ and $e^{-j3\pi/2} = j$. So $\Gamma = j\tfrac12\cdot j = -\tfrac12$.`),
      R(md`
        ### 10. Numbers to know

        | Quantity | Value | Why |
        |---|---|---|
        | $\sqrt2$ | $1.414$ | $1.414^2 \approx 2.000$ |
        | $\sqrt3$ | $1.732$ | $1.732^2 \approx 3.000$ |
        | $\sqrt5$ | $2.236$ | between 2 and 3, $2.236^2 \approx 5.000$ |
        | $\sqrt{10}$ | $3.162$ | just above 3 |
        | $1/\sqrt2$ | $0.707$ | $= \sqrt2/2$ |
        | $e^{-1}$ | $0.368$ | about $1/e$, $e \approx 2.718$ |
        | $e^{-2}$ | $0.135$ | $0.368^2$ |
        | $\ln 2$ | $0.693$ | $e^{0.693} = 2$ |
        | $10\log_{10}2$ | $3.01$ dB | $2^{10} \approx 10^3$ |
        | $120\pi$ | $377\ \Omega$ | $\eta_0$ |
        | $20\log_{10}e$ | $8.69$ dB | one neper |

        **Where 3 dB comes from.** $2^{10} = 1024$, which is about $1000 = 10^3$. Take $\log_{10}$ of both sides:
        $$10\log_{10}2 \approx 3$$
        So doubling a power is $+3$ dB, halving it is $-3$ dB, a factor of 4 is $6$ dB, and a factor of 10 is $10$ dB.

        **Where 8.69 dB per neper comes from.** A field that falls as $e^{-\alpha z}$ carries a power that falls as $e^{-2\alpha z}$. In decibels the power loss is
        $$10\log_{10}e^{2\alpha z} = 20\,\alpha z\log_{10}e$$
        With $\log_{10}e \approx 0.434$:
        $$= 8.69\,\alpha z\ \text{dB}$$
        So every neper of field decay ($\alpha z = 1$) costs 8.69 dB, whether you count the field ($20\log_{10}$) or the power ($10\log_{10}$). [Topic 8](#/l/w2-loss) uses this.

        **Where $\ln2$ shows up.** The power halves when $e^{-2\alpha z} = \tfrac12$, which gives $z = \ln2/(2\alpha) \approx 0.35/\alpha$.

        **Roots you can pull apart.** $\sqrt{50} = \sqrt{25\cdot2} = 5\sqrt2 \approx 7.07$. $\sqrt{12} = 2\sqrt3 \approx 3.46$. $\sqrt8 = 2\sqrt2 \approx 2.83$. $\sqrt{20} = 2\sqrt5 \approx 4.47$.

        **The constants.** $c = 3\times10^8$ m/s $= 300$ m/µs. $\epsilon_0 = 10^{-9}/(36\pi)$ F/m. $\mu_0 = 4\pi\times10^{-7}$ H/m. $\eta_0 = 120\pi\ \Omega$. Check they agree: $\mu_0\epsilon_0 = 4\pi\times10^{-7}\cdot10^{-9}/(36\pi) = 10^{-16}/9$, and $1/\sqrt{10^{-16}/9} = 3\times10^8$ ✓.

        ### Worked example 1: a reflection coefficient by hand

        !!graded Problem
          A $Z_0 = 50\ \Omega$ line ends in $Z_L = 50 + j50\ \Omega$. Find $\Gamma_L$ in rectangular and polar form, then $\Gamma$ at $d = \lambda/8$.

        **Step 1: top and bottom.**
        $$\Gamma_L = \frac{Z_L - Z_0}{Z_L + Z_0} = \frac{j50}{100 + j50}$$
        Divide top and bottom by 50 to make the numbers small:
        $$\Gamma_L = \frac{j}{2 + j}$$
        **Step 2: multiply by the conjugate of the bottom.** The bottom becomes $(2 + j)(2 - j) = 4 + 1 = 5$:
        $$\Gamma_L = \frac{j(2 - j)}{5} = \frac{2j - j^2}{5}$$
        Since $-j^2 = +1$:
        $$\Gamma_L = \frac{1 + 2j}{5} = 0.2 + j0.4$$
        **Step 3: polar form.** Size $\sqrt{0.04 + 0.16} = \sqrt{0.2} = 1/\sqrt5 \approx 0.447$. Angle $\tan^{-1}(0.4/0.2) = \tan^{-1}2 \approx 63.4°$.

        **Step 4: move to $d = \lambda/8$.** Multiply by $e^{-j\pi/2} = -j$:
        $$\Gamma = \frac{(1 + 2j)(-j)}{5} = \frac{-j - 2j^2}{5} = \frac{2 - j}{5}$$
        **Check.** The size is still $\sqrt{4 + 1}/5 = 1/\sqrt5$ ✓: moving along a lossless line only turns $\Gamma$. And the sizes give it directly: $|j50|/|100 + j50| = 50/\sqrt{12500} = 1/\sqrt5$ ✓.

        ### Worked example 2: adding two sinusoids

        !!graded Problem
          Write $3\cos\omega t + 4\sin\omega t$ as a single cosine $A\cos(\omega t + \phi)$.

        **Step 1: phasors.** $3\cos\omega t$ has phasor $3$. Since $\sin x = \cos(x - 90°)$, $4\sin\omega t$ has phasor $4e^{-j90°} = -j4$.

        **Step 2: add them, in rectangular form.**
        $$3 + (-j4) = 3 - j4$$
        **Step 3: polar form.** The 3-4-5 triangle, below the axis:
        $$3 - j4 = 5e^{-j53.1°}$$
        **Step 4: back to time.**
        $$3\cos\omega t + 4\sin\omega t = 5\cos(\omega t - 53.1°)$$
        **Check.** At $t = 0$ the left side is 3 and the right side is $5\cos53.1° = 5\cdot\tfrac35 = 3$ ✓.

        ### Worked example 3: Spring 2019's lossy wave

        !!graded Problem
          A wave has $\gamma = 1 + j\sqrt3$ m⁻¹ and $\omega\mu = 16\pi^2\ \Omega$/m. Find $\eta$, then $\sigma/\omega\epsilon$ from $\gamma/\eta = \sigma + j\omega\epsilon$.

        **Step 1.** $\eta = j\omega\mu/\gamma = 16\pi^2e^{j90°}/(2e^{j60°}) = 8\pi^2e^{j30°}\ \Omega$ (Section 5).

        **Step 2: divide again.**
        $$\frac{\gamma}{\eta} = \frac{2e^{j60°}}{8\pi^2e^{j30°}} = \frac{1}{4\pi^2}\,e^{j30°}$$
        **Step 3: the real and imaginary parts.** The real part is $\sigma$ and the imaginary part is $\omega\epsilon$:
        $$\sigma = \frac{\cos30°}{4\pi^2}, \qquad \omega\epsilon = \frac{\sin30°}{4\pi^2}$$
        **Step 4: the ratio.** The $4\pi^2$ cancels:
        $$\frac{\sigma}{\omega\epsilon} = \frac{\cos30°}{\sin30°} = \frac{\sqrt3/2}{1/2} = \sqrt3$$
        Nothing here needed a calculator: only the triangle $1$, $\sqrt3$, $2$.

        !!mistake Common mistakes
          - **The wrong quadrant.** $\tan^{-1}(b/a)$ cannot tell $1 + j$ from $-1 - j$. Sketch the point.
          - **Adding the legs** for a size. $|3 + j4| = 5$, not 7.
          - **Forgetting to halve the angle** in a square root.
          - **Adding angles when dividing.** Division subtracts: top angle minus bottom angle.
          - **$1/j = j$.** It is $-j$.
          - **Dropping the conjugate** in $\tfrac12\Re\{\tilde E\tilde H^*\}$. Without it the traveling phases do not cancel, and the answer depends on $z$.
          - **$e^{-j2\beta d}$ versus $e^{-j\beta d}$.** $\Gamma(d)$ uses the round trip, $2\beta d$.

        ### Check questions
      `),
      Q(md`Which form should you use to compute $(1 + j)^4$ by hand?`,
        [md`Polar: $(\sqrt2)^4e^{j4\cdot45°} = 4e^{j180°} = -4$`, md`Rectangular: multiply $(1 + j)$ by itself four times, which gives $4$`, md`Polar: $(\sqrt2)^4e^{j45°} = 4e^{j45°}$`, md`Rectangular: $1^4 + j^4 = 2$`], 0,
        [null, md`Rectangular works, but the result is $-4$: $(1 + j)^2 = 2j$, and $(2j)^2 = -4$.`, md`A power multiplies the angle too: four copies of $45°$ add to $180°$.`, md`Powers of a sum are not sums of powers.`],
        md`Polar: sizes multiply, angles add. $(\sqrt2)^4 = 4$ and $4\cdot45° = 180°$, so $(1 + j)^4 = -4$. Check: $(1 + j)^2 = 2j$, $(2j)^2 = -4$ ✓.`),
      Q(md`$\cos\theta$ written with exponentials is…`,
        [md`$\dfrac{e^{j\theta} + e^{-j\theta}}{2}$`, md`$\dfrac{e^{j\theta} - e^{-j\theta}}{2}$`, md`$\dfrac{e^{j\theta} - e^{-j\theta}}{2j}$`, md`$\Im\{e^{j\theta}\}$`], 0,
        [null, md`The difference is $2j\sin\theta$, so this is $j\sin\theta$.`, md`That is $\sin\theta$.`, md`$\Im\{e^{j\theta}\} = \sin\theta$; the cosine is the real part.`],
        md`Add $e^{j\theta} = \cos\theta + j\sin\theta$ and $e^{-j\theta} = \cos\theta - j\sin\theta$: the sines cancel, leaving $2\cos\theta$.`),
      R(md`
        ### Practice, level 1: one move at a time

        **The trick:** sketch the point before you compute. Each card is one move: a size, an angle, a conversion. Aim for 10 seconds each. Eight right completes a card.
      `),
      Object.assign(G('rf_s0_polar', { need: 8 }), { id: 'e3-complex.r0' }),
      R(md`
        ### Practice, level 1: arrows on the circle

        **The trick:** $e^{j\theta}$ is the unit arrow at $\theta$. Count quarter turns: $j$, $-1$, $-j$, $1$. A minus sign in the exponent turns clockwise.
      `),
      Object.assign(G('rf_s0_euler', { need: 8 }), { id: 'e3-complex.r1' }),
      R(md`
        ### Practice, level 1: multiply, divide, conjugate

        **The trick:** multiply the sizes and add the angles; divide the sizes and subtract the angles. The size of a fraction is the fraction of the sizes.
      `),
      Object.assign(G('rf_s0_muldiv', { need: 8 }), { id: 'e3-complex.r2' }),
      R(md`
        ### Practice, level 1: square roots

        **The trick:** root of the size, half of the angle. $\sqrt j = (1 + j)/\sqrt2$.
      `),
      Object.assign(G('rf_s0_root', { need: 6 }), { id: 'e3-complex.r3' }),
      R(md`
        ### Practice, level 1: numbers without a calculator

        **The trick:** $\sqrt2 = 1.414$, $\sqrt3 = 1.732$, $e^{-1} = 0.368$, 3 dB per doubling, 8.69 dB per neper.
      `),
      Object.assign(G('rf_s0_num', { need: 8 }), { id: 'e3-complex.r4' }),
      R(md`
        ### Practice, level 2: whole calculations, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('s0_gamma', { need: 2 }),
      G('s0_addcos', { need: 2 }),
      G('s0_root', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- e3-complex generators
  const nrm = (a) => { let x = ((a + 180) % 360 + 360) % 360 - 180; if (Math.abs(x + 180) < 1e-9) x = 180; return +x.toFixed(1); };
  const dg = (x) => `$${nrm(x)}°$`;
  const neg = (t) => (t[0] === '-' ? t.slice(1) : '-' + t);
  // special numbers a + jb with clean polar forms: [re tex, im tex, re, im, size tex, size]
  const SPEC = [
    ['1', '1', 1, 1, '\\sqrt2', S2], ['1', '-1', 1, -1, '\\sqrt2', S2], ['-1', '1', -1, 1, '\\sqrt2', S2], ['-1', '-1', -1, -1, '\\sqrt2', S2],
    ['1', '\\sqrt3', 1, S3, '2', 2], ['1', '-\\sqrt3', 1, -S3, '2', 2], ['-1', '\\sqrt3', -1, S3, '2', 2], ['-1', '-\\sqrt3', -1, -S3, '2', 2],
    ['\\sqrt3', '1', S3, 1, '2', 2], ['\\sqrt3', '-1', S3, -1, '2', 2], ['-\\sqrt3', '1', -S3, 1, '2', 2], ['-\\sqrt3', '-1', -S3, -1, '2', 2],
    ['3', '4', 3, 4, '5', 5], ['4', '3', 4, 3, '5', 5], ['3', '-4', 3, -4, '5', 5], ['-4', '3', -4, 3, '5', 5],
  ];
  // k times a TeX number ('1', '-\\sqrt3', '4', ...)
  const sc = (k, t) => { const n = t[0] === '-', b = n ? t.slice(1) : t; const r = /^\d+$/.test(b) ? String(k * +b) : (k === 1 ? '' : k) + b; return (n ? '-' : '') + r; };
  // rectangular TeX of k(re + j im)
  const rectT = (k, re, im) => { const r = sc(k, re), i = sc(k, im), n = i[0] === '-', ai = n ? i.slice(1) : i; return `${r} ${n ? '-' : '+'} j${ai === '1' ? '' : ai}`; };
  const polarT = (mag, th) => (Math.abs(nrm(th)) < 1e-9 ? `${mag}` : `${mag}\\,e^{${nrm(th) < 0 ? '-' : ''}j${Math.abs(nrm(th))}°}`);
  const ang = (s) => Math.atan2(s[3], s[2]) * 180 / PI;
  const num = (x) => `$${p(+x.toPrecision(3))}$`;
  // a numeric part with slips; a slip equal to the answer (at these numbers) is dropped
  const NT = (lbl, ans, unit, traps) => {
    const t = traps.filter(([v]) => isFinite(v) && Math.abs(v - ans) > 1e-6 * Math.max(1, Math.abs(ans))).map(([v, msg]) => ({ v, msg }));
    return t.length ? Object.assign(N(lbl, ans, unit), { traps: t }) : N(lbl, ans, unit);
  };

  GENS.rf_s0_polar = () => {
    const s = pick(SPEC), [re, im, a, b, rt, rv] = s, th = ang(s), z = rectT(1, re, im);
    return one([
      () => MC('Size', md`The size of $z = ${z}$ is…`, num(rv),
        [[num(Math.abs(a) + Math.abs(b)), md`That adds the legs. The size is the hypotenuse, $\sqrt{a^2 + b^2}$.`],
          [num(rv * rv), md`That is $a^2 + b^2$, the size squared. Take its square root.`],
          [num(Math.max(Math.abs(a), Math.abs(b))), md`That is the longer leg alone. The hypotenuse is longer than either leg.`],
          [num(1 / rv), md`That is $1/|z|$, the size of $1/z$.`],
          [num(rv / 2), md`That halves the size, as a square root does to an angle. Sizes need Pythagoras only.`]],
        md`$|z| = \sqrt{(${re})^2 + (${im})^2} = ${rt} \approx ${p(+rv.toPrecision(3))}$.`),
      () => MC('Angle', md`The angle of $z = ${z}$ (between $-180°$ and $180°$) is…`, dg(th),
        [[dg(Math.atan(b / a) * 180 / PI), md`That is $\tan^{-1}(b/a)$ straight from a calculator. It ignores the quadrant: $z$ has ${a < 0 ? 'a negative real part, so it is in the left half-plane' : 'this angle only by luck here'}.`],
          [dg(-th), md`That is the angle of the conjugate. The sign of the imaginary part puts $z$ ${b > 0 ? 'above' : 'below'} the real axis.`],
          [dg(Math.atan2(a, b) * 180 / PI), md`That swaps the legs. $\tan\theta$ is the imaginary part over the real part.`],
          [dg(180 - th), md`That is the mirror image across the imaginary axis: the sign of the real part is wrong.`],
          [dg(2 * th), md`That doubles the angle: it is the angle of $z^2$.`]],
        md`Sketch it: ${a > 0 ? 'right' : 'left'} by $${re.replace('-', '')}$, ${b > 0 ? 'up' : 'down'} by $${im.replace('-', '')}$. The triangle gives $${nrm(th)}°$.`),
      () => {
        const k = pick([1, 2]), mag = sc(k, rt);
        return MC('Polar to rectangular', md`Write $${polarT(mag, th)}$ in rectangular form.`, `$${rectT(k, re, im)}$`,
          [[`$${rectT(k, im, re)}$`, md`That swaps cosine and sine. The real part is $|z|\cos\theta$.`],
            [`$${rectT(k, re, neg(im))}$`, md`That is the conjugate: the sign of the angle sets the sign of the imaginary part.`],
            [`$${rectT(k, neg(re), im)}$`, md`The real part has the sign of $\cos\theta$, and $\cos(${nrm(th)}°)$ is ${a > 0 ? 'positive' : 'negative'}.`],
            [`$${rectT(k, neg(re), neg(im))}$`, md`That is half a turn away: the negative of the right answer.`]],
          md`$${mag}(\cos ${nrm(th)}° + j\sin ${nrm(th)}°) = ${rectT(k, re, im)}$.`);
      },
    ]);
  };

  // quarter-turn values of e^{j theta}
  const QV = ['1', 'j', '-1', '-j'];
  const qWhy = (i) => md`That is the arrow at $${90 * i}°$.`;
  GENS.rf_s0_euler = () => one([
    () => {
      const [tex, n] = pick([['\\pi/2', 1], ['\\pi', 2], ['3\\pi/2', 3], ['2\\pi', 4], ['5\\pi/2', 5], ['-\\pi/2', -1], ['-\\pi', -2], ['-3\\pi/2', -3], ['3\\pi', 6], ['-5\\pi/2', -5]]);
      const i = ((n % 4) + 4) % 4;
      return MC('A quarter-turn arrow', md`$e^{j${tex}}$ equals…`, `$${QV[i]}$`, QV.map((v, k) => [`$${v}$`, qWhy(k)]).filter((x, k) => k !== i),
        md`$${tex}$ is ${Math.abs(n)} quarter turn${Math.abs(n) === 1 ? '' : 's'} ${n > 0 ? 'counterclockwise' : 'clockwise'} from 1, which lands on $${QV[i]}$.`);
    },
    () => {
      const [tex, deg, r] = pick([['\\pi/4', 45, '\\tfrac{1 + j}{\\sqrt2}'], ['-\\pi/4', -45, '\\tfrac{1 - j}{\\sqrt2}'], ['3\\pi/4', 135, '\\tfrac{-1 + j}{\\sqrt2}'], ['-3\\pi/4', -135, '\\tfrac{-1 - j}{\\sqrt2}'],
        ['\\pi/3', 60, '\\tfrac12 + j\\tfrac{\\sqrt3}{2}'], ['\\pi/6', 30, '\\tfrac{\\sqrt3}{2} + j\\tfrac12'], ['-\\pi/3', -60, '\\tfrac12 - j\\tfrac{\\sqrt3}{2}'], ['2\\pi/3', 120, '-\\tfrac12 + j\\tfrac{\\sqrt3}{2}']]);
      const POOL = [[45, '\\tfrac{1 + j}{\\sqrt2}'], [-45, '\\tfrac{1 - j}{\\sqrt2}'], [135, '\\tfrac{-1 + j}{\\sqrt2}'], [-135, '\\tfrac{-1 - j}{\\sqrt2}'], [60, '\\tfrac12 + j\\tfrac{\\sqrt3}{2}'], [30, '\\tfrac{\\sqrt3}{2} + j\\tfrac12'], [-60, '\\tfrac12 - j\\tfrac{\\sqrt3}{2}'], [120, '-\\tfrac12 + j\\tfrac{\\sqrt3}{2}'], [-30, '\\tfrac{\\sqrt3}{2} - j\\tfrac12'], [150, '-\\tfrac{\\sqrt3}{2} + j\\tfrac12']];
      const near = POOL.filter((x) => x[0] !== deg).sort((u, v) => Math.abs(nrm(u[0] - deg)) - Math.abs(nrm(v[0] - deg))).slice(0, 4);
      return MC('An eighth or a sixth of a turn', md`$e^{j${tex}}$ equals…`, `$${r}$`, near.map(([d, t]) => [`$${t}$`, md`That is the arrow at $${d}°$. $${tex}$ is $${deg}°$.`]),
        md`$${tex} = ${deg}°$, so $e^{j${tex}} = \cos ${deg}° + j\sin ${deg}° = ${r}$.`);
    },
    () => {
      const it = pick([
        ['e^{j\\theta} + e^{-j\\theta}', '2\\cos\\theta'], ['e^{j\\theta} - e^{-j\\theta}', '2j\\sin\\theta'], ['e^{-j\\theta} - e^{j\\theta}', '-2j\\sin\\theta'],
        ['\\dfrac{e^{j\\theta} - e^{-j\\theta}}{2j}', '\\sin\\theta'], ['\\dfrac{e^{j\\theta} + e^{-j\\theta}}{2}', '\\cos\\theta'], ['e^{j\\theta}e^{-j\\theta}', '1'],
      ]);
      const ALL = {
        '2\\cos\\theta': md`That is the sum $e^{j\theta} + e^{-j\theta}$.`, '2j\\sin\\theta': md`That is $e^{j\theta} - e^{-j\theta}$, in that order.`,
        '-2j\\sin\\theta': md`That is $e^{-j\theta} - e^{j\theta}$.`, '\\sin\\theta': md`That is the difference $e^{j\theta} - e^{-j\theta}$ divided by $2j$.`,
        '\\cos\\theta': md`That is the sum divided by 2.`, '1': md`That is the product $e^{j\theta}e^{-j\theta}$.`,
        '2\\sin\\theta': md`No combination gives this: a difference of the two exponentials always keeps its $j$.`, '2j\\cos\\theta': md`No combination gives this: a cosine comes from the sum, which is real.`,
      };
      return MC('Exponentials to sines and cosines', md`$${it[0]}$ equals…`, `$${it[1]}$`,
        Object.keys(ALL).filter((k) => k !== it[1]).map((k) => [`$${k}$`, md`${ALL[k]} Write $e^{\pm j\theta} = \cos\theta \pm j\sin\theta$ and combine.`]),
        md`With $e^{\pm j\theta} = \cos\theta \pm j\sin\theta$: $${it[0]} = ${it[1]}$.`);
    },
    () => {
      const n = pick([1, 2, 3, 4, 5, 6, 7]), i = ((-n % 4) + 4) % 4;
      const dT = n === 1 ? '\\lambda/8' : n === 4 ? '\\lambda/2' : n === 2 ? '\\lambda/4' : n === 6 ? '3\\lambda/4' : `${n}\\lambda/8`;
      const dOf = { 0: '\\lambda/2', 1: '3\\lambda/8', 2: '\\lambda/4', 3: '\\lambda/8' };
      return MC('Round trip on a line', md`$\beta = 2\pi/\lambda$. At $d = ${dT}$, $e^{-j2\beta d}$ equals…`, `$${QV[i]}$`,
        QV.map((v, k) => [`$${v}$`, md`That is the value at $d = ${dOf[k]}$ (or that plus a multiple of $\lambda/2$).`]).filter((x, k) => k !== i),
        md`$2\beta d = 4\pi d/\lambda = ${n}\pi/2$: ${n} quarter turns clockwise, which lands on $${QV[i]}$.`);
    },
  ]);

  GENS.rf_s0_muldiv = () => one([
    () => {
      const n = pick([2, 3, 5, 6, 7, 9, 10, 11, -1, -2, -3]), i = ((n % 4) + 4) % 4;
      return MC('Powers of j', md`$j^{${n}}$ equals…`, `$${QV[i]}$`, QV.map((v, k) => [`$${v}$`, md`That is $j^{${k}}$ (or $j^{${k + 4}}$). Reduce the power by multiples of 4 first.`]).filter((x, k) => k !== i),
        md`$j^4 = 1$, so $j^{${n}} = j^{${i}} = ${QV[i]}$. ${n < 0 ? md`(A negative power turns clockwise: $1/j = -j$.)` : ''}`);
    },
    () => {
      const r1 = pick([2, 3, 4, 6]), r2 = pick([2, 3, 4]), t1 = pick([30, 45, 60, 90, 120, -30]), t2 = pick([30, 45, 60, -45, -60, 90].filter((x) => x !== t1));
      const div = pick([true, false]);
      const R0 = div ? r1 / r2 : r1 * r2, T0 = div ? t1 - t2 : t1 + t2;
      const mt = (x) => TL.frac(x);
      const z1 = polarT(r1, t1), z2 = polarT(r2, t2);
      return MC(div ? 'Divide in polar form' : 'Multiply in polar form', div ? md`$\dfrac{${z1}}{${z2}}$ equals…` : md`$\left(${z1}\right)\left(${z2}\right)$ equals…`, `$${polarT(mt(R0), T0)}$`,
        [[`$${polarT(mt(div ? r1 / r2 : r1 * r2), div ? t1 + t2 : t1 - t2)}$`, div ? md`Dividing subtracts the angles: top minus bottom.` : md`Multiplying adds the angles.`],
          [`$${polarT(mt(div ? r1 - r2 : r1 + r2), T0)}$`, div ? md`Sizes divide; they do not subtract.` : md`Sizes multiply; they do not add.`],
          [`$${polarT(mt(div ? r1 * r2 : r1 / r2), T0)}$`, div ? md`That multiplies the sizes. Division divides them.` : md`That divides the sizes. Multiplication multiplies them.`],
          [`$${polarT(mt(R0), div ? t2 - t1 : (t1 + t2) / 2)}$`, div ? md`That subtracts in the wrong order. It is the top's angle minus the bottom's.` : md`That averages the angles. Multiplying adds them.`],
          [`$${polarT(mt(R0), t1)}$`, md`That keeps only the first angle. The second one ${div ? 'is subtracted' : 'is added'} too.`]],
        md`${div ? 'Divide the sizes and subtract the angles' : 'Multiply the sizes and add the angles'}: $${polarT(mt(R0), T0)}$.`);
    },
    () => {
      const s1 = pick(SPEC), s2 = pick(SPEC.filter((x) => x[5] !== s1[5]));
      const r = s1[5] / s2[5];
      return MC('Size of a fraction', md`$\left|\dfrac{${rectT(1, s1[0], s1[1])}}{${rectT(1, s2[0], s2[1])}}\right|$ equals…`, num(r),
        [[num(s1[5] * s2[5]), md`That multiplies the sizes. The size of a fraction is the top's size over the bottom's.`],
          [num(s2[5] / s1[5]), md`That is upside down: the bottom's size over the top's.`],
          [num((Math.abs(s1[2]) + Math.abs(s1[3])) / (Math.abs(s2[2]) + Math.abs(s2[3]))), md`That adds the legs of each. Sizes need Pythagoras.`],
          [num(r * r), md`That is the size squared.`]],
        md`$|\text{top}| = ${s1[4]}$, $|\text{bottom}| = ${s2[4]}$, so the size is $${s1[4]}/${s2[4]} \approx ${p(+r.toPrecision(3))}$.`);
    },
    () => {
      const A = pick([2, 4, 6, 10]), B = pick([2, 3, 4]), d = pick([30, 45, 60]), p2 = pick([10, 20, -20, 40]), p1 = p2 + d;
      const cosT = { 30: '\\tfrac{\\sqrt3}{2}', 45: '\\tfrac{1}{\\sqrt2}', 60: '\\tfrac12' }[d];
      const v = 0.5 * A * B * Math.cos(d * PI / 180);
      return MC('Average power from phasors', md`$\tilde E = ${polarT(A, p1)}$ V/m and $\tilde H = ${polarT(B, p2)}$ A/m, perpendicular. $\tfrac12\Re\{\tilde E\tilde H^*\}$ is…`, `$${p(+v.toPrecision(3))}$ W/m²`,
        [[`$${p(0.5 * A * B)}$ W/m²`, md`That drops the $\cos$ of the angle between them: $${p1}° - ${p2}° = ${d}°$.`],
          [`$${p(+(A * B * Math.cos(d * PI / 180)).toPrecision(3))}$ W/m²`, md`That forgets the $\tfrac12$ of the time average.`],
          [`$${p(+(0.5 * A * B * Math.sin(d * PI / 180)).toPrecision(3))}$ W/m²`, md`That takes the imaginary part. Average power is the real part.`],
          [`$${p(+(0.5 * A * B * Math.cos((p1 + p2) * PI / 180)).toPrecision(3))}$ W/m²`, md`That adds the angles: the conjugate was dropped. $\tilde H^*$ flips the sign of the angle of $\tilde H$.`],
          [`$${p(+(0.5 * A * B * Math.cos(p1 * PI / 180)).toPrecision(3))}$ W/m²`, md`That uses only the angle of $\tilde E$. What matters is the angle between them, $${d}°$.`],
          [`$${p(+(0.5 * (A / B) * Math.cos(d * PI / 180)).toPrecision(3))}$ W/m²`, md`That divides $E$ by $H$. Power is $E$ times $H$.`]],
        md`$\tilde E\tilde H^* = ${A * B}e^{j(${p1}° - ${p2 < 0 ? `(${p2}°)` : `${p2}°`})} = ${A * B}e^{j${d}°}$. Half the real part: $\tfrac12(${A * B})\cos${d}° = ${p(A * B / 2)}\cdot${cosT} \approx ${p(+v.toPrecision(3))}$ W/m².`);
    },
  ]);

  GENS.rf_s0_root = () => one([
    () => {
      const r = pick([4, 9, 16, 25, 100]), t = pick([90, -90, 60, -60, 120, -120, 150]);
      const sr = Math.sqrt(r);
      return MC('Root in polar form', md`The square root of $${polarT(r, t)}$ that you get by halving the angle is…`, `$${polarT(sr, t / 2)}$`,
        [[`$${polarT(sr, t)}$`, md`That keeps the whole angle. A square root halves it.`],
          [`$${polarT(r / 2, t / 2)}$`, md`That halves the size. The size takes a square root: $\sqrt{${r}} = ${sr}$.`],
          [`$${polarT(r, t / 2)}$`, md`That forgets the root of the size.`],
          [`$${polarT(sr, 2 * t)}$`, md`That doubles the angle, which is what squaring does.`]],
        md`Root of the size, half of the angle: $\sqrt{${r}}\,e^{j${t / 2}°}$. Check: squaring doubles the angle back to $${t}°$.`);
    },
    () => {
      const it = pick([
        ['\\sqrt{j}', '\\tfrac{1 + j}{\\sqrt2}', 'j = e^{j90°}, half the angle is 45°'],
        ['\\sqrt{-j}', '\\tfrac{1 - j}{\\sqrt2}', '-j = e^{-j90°}, half the angle is -45°'],
        ['\\sqrt{2j}', '1 + j', '2j = 2e^{j90°}, so \\sqrt2\\,e^{j45°}'],
        ['\\sqrt{-2j}', '1 - j', '-2j = 2e^{-j90°}, so \\sqrt2\\,e^{-j45°}'],
        ['\\sqrt{-4}', '2j', '-4 = 4e^{j180°}, so 2e^{j90°}'],
        ['\\sqrt{1 + j\\sqrt3}', '\\tfrac{\\sqrt6 + j\\sqrt2}{2}', '1 + j\\sqrt3 = 2e^{j60°}, so \\sqrt2\\,e^{j30°}'],
        ['\\sqrt{1 - j\\sqrt3}', '\\tfrac{\\sqrt6 - j\\sqrt2}{2}', '1 - j\\sqrt3 = 2e^{-j60°}, so \\sqrt2\\,e^{-j30°}'],
        ['\\sqrt{8j}', '2 + 2j', '8j = 8e^{j90°}, so 2\\sqrt2\\,e^{j45°}'],
      ]);
      // each candidate answer and its square
      const SQ = { '\\tfrac{1 + j}{\\sqrt2}': 'j', '\\tfrac{1 - j}{\\sqrt2}': '-j', '1 + j': '2j', '1 - j': '-2j', '2j': '-4', '\\tfrac{\\sqrt6 + j\\sqrt2}{2}': '1 + j\\sqrt3', '\\tfrac{\\sqrt6 - j\\sqrt2}{2}': '1 - j\\sqrt3', '2 + 2j': '8j', 'j': '-1', '\\sqrt2\\,j': '-2' };
      const target = SQ[it[1]];
      return MC('A root to know', md`$${it[0]}$ (the root you get by halving the angle) is…`, `$${it[1]}$`,
        Object.keys(SQ).filter((k) => k !== it[1]).map((k) => [`$${k}$`, md`Its square is $${SQ[k]}$, not $${target}$.`]),
        md`$${it[2]}$, which is $${it[1]}$. Check: its square is $${target}$.`);
    },
    () => {
      const [K, KT] = pick([[2e6, '2\\times10^{6}'], [2e4, '2\\times10^{4}'], [8e6, '8\\times10^{6}'], [200, '200'], [1.8e5, '1.8\\times10^{5}'], [50, '50']]);
      const a = Math.sqrt(K / 2);
      const ask = pick(['a', 'd']);
      const val = ask === 'a' ? a : 1 / a;
      const unit = ask === 'a' ? 'Np/m' : 'm';
      return MC('Good conductor by root', md`In a good conductor $\gamma^2 \approx j\omega\mu\sigma$, with $\omega\mu\sigma = ${KT}$ m⁻². Then ${ask === 'a' ? '$\\alpha$' : 'the skin depth $\\delta = 1/\\alpha$'} is…`, `$${p(+val.toPrecision(3))}$ ${unit}`,
        [[`$${p(+(ask === 'a' ? Math.sqrt(K) : 1 / Math.sqrt(K)).toPrecision(3))}$ ${unit}`, md`That uses $|\gamma| = \sqrt{\omega\mu\sigma}$. $\alpha$ is $|\gamma|\cos45° = \sqrt{\omega\mu\sigma/2}$.`],
          [`$${p(+(ask === 'a' ? K / 2 : 2 / K).toPrecision(3))}$ ${unit}`, md`That forgets the square root.`],
          [`$${p(+(ask === 'a' ? Math.sqrt(2 * K) : 1 / Math.sqrt(2 * K)).toPrecision(3))}$ ${unit}`, md`That multiplies by $\sqrt2$ instead of dividing: $\cos45° = 1/\sqrt2$.`]],
        md`$\gamma = \sqrt{${KT}}\,e^{j45°}$, so $\alpha = \beta = \sqrt{${KT}/2} = ${p(+a.toPrecision(3))}$ m⁻¹${ask === 'd' ? md` and $\delta = 1/\alpha = ${p(+(1 / a).toPrecision(3))}$ m` : ''}.`);
    },
  ]);

  GENS.rf_s0_num = () => one([
    () => {
      const it = pick([
        ['\\sqrt2', 1.414, [[1.732, '\\sqrt3'], [1.5, 'the midpoint of 1 and 2'], [0.707, '1/\\sqrt2'], [1.2, 'a guess: 1.2^2 = 1.44']]],
        ['\\sqrt3', 1.732, [[1.414, '\\sqrt2'], [1.5, '3/2'], [0.577, '1/\\sqrt3'], [2.236, '\\sqrt5']]],
        ['\\sqrt5', 2.236, [[2.5, '5/2'], [1.732, '\\sqrt3'], [2.449, '\\sqrt6'], [3.162, '\\sqrt{10}']]],
        ['\\sqrt{10}', 3.162, [[3.333, '10/3'], [5, '10/2'], [2.236, '\\sqrt5'], [3.464, '\\sqrt{12}']]],
        ['e^{-1}', 0.368, [[0.5, '1/2'], [0.135, 'e^{-2}'], [0.632, '1 - e^{-1}'], [0.271, '2/e^2']]],
        ['e^{-2}', 0.135, [[0.368, 'e^{-1}'], [0.25, '1/4'], [0.0498, 'e^{-3}'], [0.736, '2e^{-1}']]],
        ['\\ln2', 0.693, [[0.301, '\\log_{10}2'], [0.5, '1/2'], [1.386, '\\ln4'], [0.368, 'e^{-1}']]],
        ['120\\pi', 377, [[360, '120\\cdot3'], [188, '60\\pi'], [314, '100\\pi'], [754, '240\\pi']]],
        ['1/\\sqrt2', 0.707, [[0.5, '1/2'], [1.414, '\\sqrt2'], [0.866, '\\sqrt3/2'], [0.577, '1/\\sqrt3']]],
      ]);
      return MC('A number to know', md`Without a calculator, $${it[0]}$ is about…`, `$${it[1]}$`, it[2].map(([v, t]) => [`$${v}$`, md`That is $${t}$.`]),
        md`$${it[0]} \approx ${it[1]}$.`);
    },
    () => {
      const [r, rt, dB] = pick([[2, '2', 3], [4, '4', 6], [10, '10', 10], [100, '100', 20], [0.5, '\\tfrac12', -3], [0.25, '\\tfrac14', -6], [0.1, '\\tfrac{1}{10}', -10], [20, '20', 13], [1000, '1000', 30], [8, '8', 9]]);
      return MC('Decibels', md`A power is multiplied by $${rt}$. In decibels that is about…`, `$${dB}$ dB`,
        [[`$${2 * dB}$ dB`, md`That is $20\log_{10}$, which is for a ratio of field amplitudes. Power uses $10\log_{10}$.`],
          [`$${-dB}$ dB`, md`The sign is backward: ${r > 1 ? 'a gain is positive' : 'a loss is negative'}.`],
          [`$${p(r)}$ dB`, md`That is the ratio itself, not its logarithm.`],
          [`$${p(+(dB / 2).toPrecision(2))}$ dB`, md`That halves it. Each factor of 2 is 3 dB and each factor of 10 is 10 dB.`]],
        md`$10\log_{10}(${rt}) \approx ${dB}$ dB. (Use $10\log_{10}2 \approx 3$ and $10\log_{10}10 = 10$.)`);
    },
    () => {
      const n = pick([1, 2, 3, 4, 5]);
      return MC('Nepers to decibels', md`A wave's field amplitude falls by a factor $e^{-${n}}$ (that is, $\alpha z = ${n}$). By how many dB has its **power** fallen?`, `$${p(+(8.686 * n).toPrecision(3))}$ dB`,
        [[`$${p(+(4.343 * n).toPrecision(3))}$ dB`, md`That is $10\log_{10}e^{${n}}$: it treats the field ratio as a power ratio. The power falls by $e^{-${2 * n}}$.`],
          [`$${p(+(17.37 * n).toPrecision(3))}$ dB`, md`That doubles twice: $20\log_{10}$ of the power ratio.`],
          [`$${n}$ dB`, md`Nepers and decibels are different units: 1 Np is 8.69 dB.`],
          [`$${p(+(3 * n).toPrecision(2))}$ dB`, md`3 dB is a factor of 2, not a factor of $e$.`]],
        md`Power falls as $e^{-2\alpha z} = e^{-${2 * n}}$: $10\log_{10}e^{${2 * n}} = ${2 * n}(4.343) \approx ${p(+(8.686 * n).toPrecision(3))}$ dB. Each neper is 8.69 dB.`);
    },
    () => {
      const [q, r, t] = pick([['\\sqrt{50}', 7.07, '5\\sqrt2'], ['\\sqrt{12}', 3.46, '2\\sqrt3'], ['\\sqrt8', 2.83, '2\\sqrt2'], ['\\sqrt{18}', 4.24, '3\\sqrt2'], ['\\sqrt{27}', 5.2, '3\\sqrt3'], ['\\sqrt{20}', 4.47, '2\\sqrt5'], ['\\sqrt{0.5}', 0.707, '1/\\sqrt2'], ['\\sqrt{1000}', 31.6, '10\\sqrt{10}'], ['\\sqrt{200}', 14.1, '10\\sqrt2']]);
      const v = r;
      return MC('Pull a root apart', md`$${q}$ is about…`, `$${v}$`,
        [[`$${p(+(v * S2 / S3).toPrecision(3))}$`, md`That swaps a $\sqrt3$ and a $\sqrt2$. Factor out the largest perfect square.`],
          [`$${p(+(v / 2).toPrecision(3))}$`, md`That halves it. Factor out a perfect square, then use $\sqrt2 = 1.414$ or $\sqrt3 = 1.732$.`],
          [`$${p(+(v * 1.25).toPrecision(3))}$`, md`Too big: square it and compare.`],
          [`$${p(+(v * v / 10).toPrecision(3))}$`, md`That is a tenth of the number under the root, not its root.`]],
        md`$${q} = ${t} \approx ${v}$.`);
    },
  ]);

  // ---------------------------------------------------------------- e3-complex problems
  GENS.s0_gamma = () => {
    const Z0 = pick([50, 75, 100]), [x, y] = pick([[1, 1], [1, -1], [1, 2], [2, 1], [0, 2], [2, -1], [3, 1], [1, 3], [0, -2]]);
    const ZL = Cx.of(Z0 * x, Z0 * y), G = ZL.sub(Z0).div(ZL.add(Z0));
    const [nd, dTex, rotT, rot] = pick([[1, '\\lambda/8', '-j', Cx.of(0, -1)], [3, '3\\lambda/8', 'j', Cx.of(0, 1)], [2, '\\lambda/4', '-1', Cx.of(-1, 0)]]);
    const Gd = G.mul(rot);
    const top = Cx.of(x - 1, y), bot = Cx.of(x + 1, y), bb = (x + 1) * (x + 1) + y * y;
    const num2 = top.mul(bot.conj());
    return {
      title: 'A reflection coefficient by hand',
      q: md`A lossless line with $Z_0 = ${Z0}\ \Omega$ ends in $Z_L = ${ZL.tex()}\ \Omega$. Find $\Gamma_L$ (real part, imaginary part, size), then $\Gamma(d)$ at $d = ${dTex}$ from the load.`,
      parts: [
        NT('\\Re\\{\\Gamma_L\\}', G.re, '', [[G.im, 'That is the imaginary part.']]),
        NT('\\Im\\{\\Gamma_L\\}', G.im, '', [[-G.im, 'Check the sign. After multiplying by the conjugate of the bottom, multiply out the top carefully: j·(−j) = +1.']]),
        NT('|\\Gamma_L|', G.abs(), '', [[G.abs() ** 2, 'That is the size squared.']]),
        NT(`\\Re\\{\\Gamma(${dTex})\\}`, Gd.re, '', [[G.mul(rot.conj()).re, 'That turns the wrong way. Γ(d) = Γ_L e^{−j2βd} turns clockwise as d grows.'], [G.re, 'That is Γ_L itself. Multiply by e^{−j2βd} first.']]),
        NT(`\\Im\\{\\Gamma(${dTex})\\}`, Gd.im, '', [[G.mul(rot.conj()).im, 'That turns the wrong way. Γ(d) = Γ_L e^{−j2βd} turns clockwise as d grows.']]),
      ],
      hints: [md`Divide top and bottom by $Z_0$ first: $\Gamma_L = (z_L - 1)/(z_L + 1)$ with $z_L = Z_L/Z_0$.`, md`Multiply top and bottom by the conjugate of the bottom. Then multiply by $e^{-j2\beta d} = ${rotT}$.`],
      sol: md`
        **Step 1: normalize.** Divide by $Z_0 = ${Z0}\ \Omega$: $z_L = ${Cx.of(x, y).tex()}$. Then
        $$\Gamma_L = \frac{z_L - 1}{z_L + 1} = \frac{${top.tex()}}{${bot.tex()}}$$
        **Step 2: multiply top and bottom by the conjugate of the bottom, $${bot.conj().tex()}$.** The bottom becomes $${x + 1}^2 + ${Math.abs(y)}^2 = ${bb}$:
        $$\Gamma_L = \frac{(${top.tex()})(${bot.conj().tex()})}{${bb}} = \frac{${num2.tex()}}{${bb}}$$
        $$\Gamma_L = ${f(G.re)} ${G.im < 0 ? '-' : '+'} j${f(Math.abs(G.im))}$$
        **Step 3: the size.** The size of a fraction is the fraction of the sizes:
        $$|\Gamma_L| = \frac{|${top.tex()}|}{|${bot.tex()}|} = \frac{\sqrt{${(x - 1) ** 2 + y * y}}}{\sqrt{${bb}}} = ${f(G.abs())}$$
        **Step 4: move to $d = ${dTex}$.** $2\beta d = ${nd === 1 ? '' : nd}\pi/2$, so $e^{-j2\beta d} = ${rotT}$:
        $$\Gamma(${dTex}) = (${f(G.re)} ${G.im < 0 ? '-' : '+'} j${f(Math.abs(G.im))})(${rotT}) = ${f(Gd.re)} ${Gd.im < 0 ? '-' : '+'} j${f(Math.abs(Gd.im))}$$
        **Check.** $|\Gamma(d)| = ${f(Gd.abs())} = |\Gamma_L|$ ✓: a lossless line only turns $\Gamma$.
      `,
    };
  };

  GENS.s0_addcos = () => {
    const T = pick([
      // a cos(wt) + b sin(wt): phasor a - jb
      () => {
        const [expr, a, b] = pick([['3\\cos\\omega t + 4\\sin\\omega t', 3, 4], ['4\\cos\\omega t + 3\\sin\\omega t', 4, 3], ['\\cos\\omega t + \\sqrt3\\sin\\omega t', 1, S3],
          ['\\sqrt3\\cos\\omega t + \\sin\\omega t', S3, 1], ['2\\cos\\omega t + 2\\sin\\omega t', 2, 2], ['3\\cos\\omega t - 4\\sin\\omega t', 3, -4],
          ['-\\cos\\omega t + \\sqrt3\\sin\\omega t', -1, S3], ['5\\cos\\omega t - 5\\sin\\omega t', 5, -5], ['2\\cos\\omega t + 2\\sqrt3\\sin\\omega t', 2, 2 * S3],
          ['6\\cos\\omega t + 8\\sin\\omega t', 6, 8], ['\\sqrt3\\cos\\omega t - \\sin\\omega t', S3, -1]]);
        return { expr, ph: Cx.of(a, -b), sumAmp: Math.abs(a) + Math.abs(b),
          steps: md`The cosine part has phasor $${p(+a.toPrecision(3))}$. Since $\sin x = \cos(x - 90°)$, a sine with coefficient $${p(+b.toPrecision(3))}$ has phasor $-j(${p(+b.toPrecision(3))}) = ${Cx.of(0, -b).tex()}$.` };
      },
      // A cos(wt) + A cos(wt + phi): phasor A(1 + e^{j phi})
      () => {
        const A = pick([1, 2, 3, 4]), phi = pick([60, 90, 120, -90, -60, -120]), At = A === 1 ? '' : A;
        return { expr: `${At}\\cos\\omega t + ${At}\\cos(\\omega t ${phi < 0 ? '-' : '+'} ${Math.abs(phi)}°)`, ph: Cx.of(A, 0).add(Cx.polar(A, phi * PI / 180)), sumAmp: 2 * A,
          steps: md`The phasors are $${A}$ and $${A}e^{j${phi}°} = ${Cx.polar(A, phi * PI / 180).tex()}$.` };
      },
    ])();
    const amp = T.ph.abs(), phd = T.ph.arg() * 180 / PI;
    return {
      title: 'Adding two sinusoids with phasors',
      q: md`Write $f(t) = ${T.expr}$ as a single cosine $A\cos(\omega t + \phi)$, with $A > 0$ and $-180° < \phi \le 180°$.`,
      parts: [
        NT('A', amp, '', [[T.sumAmp, 'That adds the two amplitudes. They are out of phase: add them as phasors, then take the size.']]),
        NT('\\phi', phd, '°', [[-phd, 'Check the sign of φ. A sine lags a cosine by 90°, so its phasor is −j times its coefficient.']]),
      ],
      hints: [md`$\cos\omega t \to 1$, $\sin\omega t = \cos(\omega t - 90°) \to -j$, $\cos(\omega t + \phi) \to e^{j\phi}$.`, md`Add the phasors in rectangular form, then convert the sum to polar form.`],
      sol: md`
        **Step 1: phasors.** ${T.steps}

        **Step 2: add in rectangular form.**
        $$\tilde F = ${T.ph.tex()}$$
        **Step 3: polar form.**
        $$A = |\tilde F| = ${f(amp)}, \qquad \phi = ${f(phd)}°$$
        **Step 4: back to time.**
        $$f(t) = ${f(amp)}\cos(\omega t ${phd < 0 ? '-' : '+'} ${f(Math.abs(phd))}°)$$
        **Check.** At $t = 0$ the original is $\Re\{\tilde F\} = ${f(T.ph.re)}$, and $${f(amp)}\cos(${f(phd)}°) = ${f(amp * Math.cos(phd * PI / 180))}$ ✓.
      `,
    };
  };

  GENS.s0_root = () => {
    const gc = pick([true, false]);
    if (gc) {
      const [K, KT] = pick([[2e6, '2\\times10^{6}'], [8e6, '8\\times10^{6}'], [2e4, '2\\times10^{4}'], [1.8e5, '1.8\\times10^{5}'], [5e5, '5\\times10^{5}']]);
      const g = Math.sqrt(K), a = g / S2;
      return {
        title: 'A good conductor, by one square root',
        q: md`In a good conductor the displacement current is negligible, so $\gamma^2 \approx j\omega\mu\sigma$. Here $\omega\mu\sigma = ${KT}$ m⁻². Find $|\gamma|$, $\alpha$, $\beta$ and the skin depth $\delta = 1/\alpha$.`,
        parts: [
          N('|\\gamma|', g, '1/m'),
          Object.assign(N('\\alpha', a, 'Np/m'), { traps: [{ v: g, msg: 'That is |γ|. α is its real part, |γ| cos 45°.' }] }),
          N('\\beta', a, 'rad/m'),
          Object.assign(N('\\delta', 1 / a, 'm'), { traps: [{ v: 1 / g, msg: 'That is 1/|γ|. The skin depth is 1/α.' }] }),
        ],
        hints: [md`$j\omega\mu\sigma = ${KT}\,e^{j90°}$.`, md`Root of the size, half the angle: $\gamma = \sqrt{${KT}}\,e^{j45°}$.`],
        sol: md`
          **Step 1: polar form.** $\gamma^2 = ${KT}\,e^{j90°}$.

          **Step 2: the root.** Root of the size, half of the angle:
          $$\gamma = \sqrt{${KT}}\,e^{j45°} = ${f(g)}\,e^{j45°}\ \text{m}^{-1}$$
          **Step 3: split.** $\cos45° = \sin45° = 1/\sqrt2$:
          $$\alpha = \beta = \frac{${f(g)}}{\sqrt2} = ${f(a)}\ \text{m}^{-1}$$
          This is the sheet's $\sqrt{\omega\mu\sigma/2}$.

          **Step 4: the skin depth.**
          $$\delta = \frac{1}{\alpha} = ${f(1 / a)}\ \text{m}$$
        `,
      };
    }
    const [M, th] = pick([[4, 120], [16, 120], [4, 150], [16, 90], [100, 120], [36, 150], [9, 135]]);
    const g = Math.sqrt(M), half = th / 2, a = g * Math.cos(half * PI / 180), b = g * Math.sin(half * PI / 180);
    const LT = { 90: md`$\sigma/\omega\epsilon$ is very large: a good conductor`, 120: md`$\sigma/\omega\epsilon = \sqrt3$`, 135: md`$\sigma/\omega\epsilon = 1$`, 150: md`$\sigma/\omega\epsilon = 1/\sqrt3$` }[th];
    return {
      title: 'γ from γ², by one square root',
      q: md`A wave has $\gamma^2 = ${M}\,e^{j${th}°}$ m⁻². (This angle means ${LT}.) Find $|\gamma|$, the angle of $\gamma$, $\alpha$ and $\beta$.`,
      parts: [
        N('|\\gamma|', g, '1/m'),
        Object.assign(N('\\angle\\gamma', half, '°'), { traps: [{ v: th, msg: 'That is the angle of γ². The square root halves it.' }] }),
        Object.assign(N('\\alpha', a, 'Np/m'), { traps: [{ v: b, msg: 'That is β. α is the real part, |γ| cos(angle).' }] }),
        Object.assign(N('\\beta', b, 'rad/m'), { traps: [{ v: a, msg: 'That is α. β is the imaginary part, |γ| sin(angle).' }] }),
      ],
      hints: [md`Root of the size, half of the angle.`, md`$\alpha = |\gamma|\cos(\angle\gamma)$ and $\beta = |\gamma|\sin(\angle\gamma)$.`],
      sol: md`
        **Step 1: the root.** Root of the size and half of the angle:
        $$\gamma = \sqrt{${M}}\,e^{j${th}°/2} = ${p(g)}\,e^{j${half}°}$$
        **Step 2: split.**
        $$\alpha = ${p(g)}\cos${half}° = ${f(a)}\ \text{Np/m}$$
        $$\beta = ${p(g)}\sin${half}° = ${f(b)}\ \text{rad/m}$$
        **Check.** $\beta > \alpha$, as it must be with any finite loss, and $\beta^2 - \alpha^2 = ${f(b * b - a * a)}$ is $-\Re\{\gamma^2\} = ${f(-M * Math.cos(th * PI / 180))}$ ✓.
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank: e3-complex
  EM.BANK['e3-complex'] = [
    Q(md`$j^2\cdot j^3$ equals…`, [md`$j$`, md`$-j$`, md`$-1$`, md`$j^6 = -1$`], 0,
      [null, md`That is $j^3$ alone, or $j^7$.`, md`That is $j^2$ or $j^6$. Powers add: $2 + 3 = 5$.`, md`Powers add when you multiply, they do not multiply: $j^{2 + 3} = j^5$.`],
      md`$j^2j^3 = j^5 = j^4\cdot j = j$.`),
    Q(md`$(1 + j)^2$ equals…`, [md`$2j$`, md`$2$`, md`$1 + j^2 = 0$`, md`$2 + 2j$`], 0,
      [null, md`That forgets $j^2 = -1$: $1 + 2j + j^2 = 2j$.`, md`The middle term $2j$ is missing. $(a + b)^2 = a^2 + 2ab + b^2$.`, md`That doubles $1 + j$ instead of squaring it.`],
      md`$1 + 2j + j^2 = 1 + 2j - 1 = 2j$. In polar: $(\sqrt2e^{j45°})^2 = 2e^{j90°} = 2j$ ✓.`),
    Q(md`$(1 + j)(1 - j)$ equals…`, [md`$2$`, md`$0$`, md`$1 - j^2 = 0$`, md`$2j$`], 0,
      [null, md`That treats $j^2$ as $+1$.`, md`$1 - j^2 = 1 - (-1) = 2$, not 0.`, md`The imaginary parts cancel: $-j + j = 0$.`],
      md`A number times its conjugate is its size squared: $|1 + j|^2 = 2$.`),
    Q(md`The angle of $-j$ is…`, [md`$-90°$`, md`$90°$`, md`$180°$`, md`$0°$`], 0,
      [null, md`That is $j$, straight up.`, md`That is $-1$, to the left.`, md`That is a positive real number.`],
      md`$-j$ points straight down: $e^{-j90°}$.`),
    Q(md`The size of $-6 + j8$ is…`, [md`$10$`, md`$14$`, md`$2$`, md`$100$`], 0,
      [null, md`That adds the legs.`, md`That adds them with signs, $-6 + 8$.`, md`That is the size squared.`],
      md`$\sqrt{36 + 64} = \sqrt{100} = 10$: a 3-4-5 triangle doubled.`),
    Q(md`$(j2)(-j3)$ equals…`, [md`$6$`, md`$-6$`, md`$6j$`, md`$-j6$`], 0,
      [null, md`$j\cdot(-j) = -j^2 = +1$.`, md`The two $j$'s combine into a real number.`, md`$j\cdot(-j)$ is real.`],
      md`$2\cdot(-3)\cdot j^2 = -6\cdot(-1) = 6$. In polar: $2e^{j90°}\cdot3e^{-j90°} = 6e^{j0}$.`),
    Q(md`$\dfrac{1}{1 - j}$ equals…`, [md`$\dfrac{1 + j}{2}$`, md`$1 + j$`, md`$\dfrac{1 - j}{2}$`, md`$1 - j$`], 0,
      [null, md`The bottom becomes $|1 - j|^2 = 2$, so there is a factor $\tfrac12$.`, md`That is $1/(1 + j)$.`, md`That is the number itself.`],
      md`Multiply top and bottom by $1 + j$: $(1 + j)/(1 + 1) = (1 + j)/2$.`),
    Q(md`$\Re\{e^{j2\pi/3}\}$ equals…`, [md`$-\tfrac12$`, md`$\tfrac12$`, md`$\tfrac{\sqrt3}{2}$`, md`$-\tfrac{\sqrt3}{2}$`], 0,
      [null, md`That is $\cos60°$. $2\pi/3 = 120°$ is in the left half-plane.`, md`That is $\sin120°$, the imaginary part.`, md`That is $\cos150°$.`],
      md`$\cos120° = -\tfrac12$.`),
    Q(md`$e^{j\pi/2}\cdot e^{j\pi/2}$ equals…`, [md`$-1$`, md`$1$`, md`$j$`, md`$e^{j\pi^2/4}$`], 0,
      [null, md`Two quarter turns make a half turn.`, md`That is one quarter turn.`, md`Exponents add when you multiply, they do not multiply.`],
      md`$e^{j\pi} = -1$, which is $j\cdot j$.`),
    Q(md`The conjugate of $5e^{j30°}$ is…`, [md`$5e^{-j30°}$`, md`$-5e^{j30°}$`, md`$\tfrac15e^{-j30°}$`, md`$5e^{j210°}$`], 0,
      [null, md`That is the negative: half a turn away.`, md`That is $1/z$. The conjugate keeps the size.`, md`That is also the negative.`],
      md`The conjugate mirrors across the real axis: same size, opposite angle.`),
    Q(md`For $z = 1 + j2$, $zz^*$ equals…`, [md`$5$`, md`$\sqrt5$`, md`$-3$`, md`$1 + 4j$`], 0,
      [null, md`That is $|z|$. $zz^* = |z|^2$.`, md`That is $z^2$'s real part, $1 - 4$.`, md`$zz^*$ is always real.`],
      md`$zz^* = 1^2 + 2^2 = 5$.`),
    Q(md`$\Im\left\{\dfrac{2 + j}{j}\right\}$ equals…`, [md`$-2$`, md`$2$`, md`$1$`, md`$-1$`], 0,
      [null, md`Dividing by $j$ multiplies by $-j$: $(2 + j)(-j) = -2j + 1$.`, md`That is the real part.`, md`That is the real part with the wrong sign.`],
      md`$(2 + j)/j = (2 + j)(-j) = -2j - j^2 = 1 - 2j$. Imaginary part: $-2$.`),
    Q(md`The two square roots of $-4$ are…`, [md`$\pm2j$`, md`$\pm2$`, md`$-2$ only`, md`$\pm j\sqrt2$`], 0,
      [null, md`$(\pm2)^2 = 4$, not $-4$.`, md`$(-2)^2 = +4$.`, md`$(j\sqrt2)^2 = -2$.`],
      md`$-4 = 4e^{j180°}$; roots $2e^{j90°} = 2j$ and its negative.`),
    Q(md`$\sqrt{4e^{j120°}}$ (positive real part) equals…`, [md`$1 + j\sqrt3$`, md`$\sqrt3 + j$`, md`$-1 + j\sqrt3$`, md`$2 + 2j$`], 0,
      [null, md`That is $2e^{j30°}$. Half of $120°$ is $60°$.`, md`That is $2e^{j120°}$: the angle was not halved, and the size was rooted.`, md`That has size $2\sqrt2$ and angle $45°$.`],
      md`$2e^{j60°} = 2(\tfrac12 + j\tfrac{\sqrt3}{2}) = 1 + j\sqrt3$.`),
    Q(md`$\sin60°$ equals…`, [md`$\tfrac{\sqrt3}{2}$`, md`$\tfrac12$`, md`$\tfrac{1}{\sqrt2}$`, md`$\sqrt3$`], 0,
      [null, md`That is $\sin30°$ or $\cos60°$.`, md`That is $\sin45°$.`, md`That is $\tan60°$.`],
      md`In $1 + j\sqrt3 = 2e^{j60°}$, the imaginary part over the size is $\sqrt3/2$.`),
    Q(md`A line with $Z_0$ ends in $Z_L = jZ_0$ (a pure reactance). $\Gamma_L$ is…`, [md`$j$`, md`$-1$`, md`$0$`, md`$\tfrac{1 + j}{2}$`], 0,
      [null, md`That is a short, $Z_L = 0$.`, md`That would need $Z_L = Z_0$.`, md`Multiply out: $(j - 1)/(j + 1)$ is purely imaginary.`],
      md`$(j - 1)/(j + 1)$. Multiply by $(1 - j)/(1 - j)$: top $(j - 1)(1 - j) = 2j$, bottom $2$. So $\Gamma_L = j$, with $|\Gamma_L| = 1$: a reactance reflects everything.`),
    Q(md`$10\log_{10}(1000)$ equals…`, [md`$30$ dB`, md`$3$ dB`, md`$60$ dB`, md`$1000$ dB`], 0,
      [null, md`That is $\log_{10}1000$ without the factor 10.`, md`That is $20\log_{10}$.`, md`That is the ratio itself.`],
      md`$\log_{10}10^3 = 3$, times 10: 30 dB.`),
    Q(md`A wave's power drops to a quarter. In dB that is…`, [md`$-6$ dB`, md`$-3$ dB`, md`$-12$ dB`, md`$-25$ dB`], 0,
      [null, md`That is a half.`, md`That uses $20\log_{10}$ for a power ratio.`, md`That treats a quarter as 25%, then as dB.`],
      md`Two halvings: $-3 - 3 = -6$ dB.`),
    Q(md`$e^{-3}$ is about…`, [md`$0.05$`, md`$0.33$`, md`$0.135$`, md`$0.0025$`], 0,
      [null, md`That is $1/3$, not $e^{-3}$.`, md`That is $e^{-2}$.`, md`That is about $e^{-6}$.`],
      md`$e^{-3} = e^{-1}e^{-2} \approx 0.368\cdot0.135 \approx 0.050$. After three skin depths the field is about 5% of its start.`),
    Q(md`Which of these is **not** equal to $j$?`, [md`$e^{-j\pi/2}$`, md`$e^{j5\pi/2}$`, md`$-1/j$`, md`$(1 + j)^2/2$`], 0,
      [null, md`$5\pi/2$ is a full turn plus a quarter turn: $j$.`, md`$1/j = -j$, so $-1/j = j$.`, md`$(1 + j)^2 = 2j$, and half of it is $j$.`],
      md`$e^{-j\pi/2}$ is a quarter turn clockwise: $-j$.`),
    Q(md`The phasor of $5\sin(\omega t + 30°)$ (cosine reference) is…`, [md`$5e^{-j60°}$`, md`$5e^{j30°}$`, md`$5e^{j120°}$`, md`$-5je^{-j30°}$`], 0,
      [null, md`That treats the sine as a cosine. $\sin x = \cos(x - 90°)$.`, md`That adds $90°$. A sine lags a cosine.`, md`$-je^{-j30°} = e^{-j120°}$: the $30°$ got the wrong sign.`],
      md`$5\sin(\omega t + 30°) = 5\cos(\omega t + 30° - 90°) = 5\cos(\omega t - 60°)$, phasor $5e^{-j60°}$.`),
    Q(md`$\left|e^{-(1 + j2)z}\right|$ for real $z$ equals…`, [md`$e^{-z}$`, md`$e^{-3z}$`, md`$e^{-\sqrt5z}$`, md`$1$`], 0,
      [null, md`That adds the real and imaginary parts. Only the real part changes the size.`, md`That uses the size of $1 + j2$. The imaginary part is a pure rotation.`, md`The real part $-z$ shrinks it.`],
      md`$e^{-z}e^{-j2z}$: the second factor has size 1. This is why $\alpha$ alone sets the decay.`),
    Q(md`$\eta_0/\sqrt{\epsilon_r}$ with $\epsilon_r = 4$ is about…`, [md`$188\ \Omega$`, md`$94\ \Omega$`, md`$754\ \Omega$`, md`$377\ \Omega$`], 0,
      [null, md`That divides by $\epsilon_r$, not its root.`, md`That multiplies by 2.`, md`That is free space.`],
      md`$120\pi/2 = 60\pi \approx 188\ \Omega$.`),
  ];

  // ================================================================ figures for e3-refresh
  // a pulse f(t - z/v) at t = 0 and a moment later: the same shape, moved toward +z
  function snapFig() {
    const bump = (z, c0) => Math.exp(-((z - c0) ** 2) / 0.18);
    return PF.plot({
      w: 380, h: 170, x: [0, 6], y: [0, 1.45], xl: 'z', yl: 'E_x',
      xt: [[1.5, 'z_0'], [4, 'z_0 + vt_1']],
      curves: [{ f: (z) => bump(z, 1.5), n: 300 }, { f: (z) => bump(z, 4), cls: 'dash', n: 300 }],
      pts: [{ x: 1.5, y: 1.0, lab: 't = 0', anchor: 'bl' }, { x: 4, y: 1.0, lab: 't = t_1', anchor: 'bl' }],
    });
  }
  // a current sheet edge-on: z to the right, x up, y out of the page
  function sheetFig() {
    const g = PF.fig({ alt: 'a current sheet on the plane z = 0 seen edge-on, with x up and y out of the page; the current points up along +x; on both sides E points down, against the current; H points into the page on the right and out of the page on the left; each wave travels away from the sheet' });
    const x0 = 190, ya = 24, yb = 176;
    g.sheet(x0, ya, yb); g.label(x0, yb + 8, 'z = 0', 't', 'small accent');
    g.arrow(x0 - 14, 136, x0 - 14, 64, { cls: 'thick', hs: 9 }); g.label(x0 - 20, 78, '\\mathbf J_s', 'r');
    for (const s of [-1, 1]) {
      const xe = x0 + s * 70;
      g.arrow(xe, 56, xe, 126, { cls: 'thick', hs: 9 }); g.label(xe + 8, 64, '\\mathbf E', 'l');
      const xh = x0 + s * 122;
      if (s > 0) g.otimes(xh, 90, 8); else g.odot(xh, 90, 8);
      g.label(xh, 74, '\\mathbf H', 'b');
      g.arrow(x0 + s * 40, 156, x0 + s * 110, 156, { hs: 8 }); g.label(x0 + s * 75, 162, '\\text{travel}', 't', 'small');
    }
    // axes triad, bottom left: x up, z right, y out of the page
    const ox = 34, oy = 206;
    g.arrow(ox, oy, ox, oy - 34, { cls: 'dim', hs: 6 }); g.label(ox + 5, oy - 34, 'x', 'l', 'small accent');
    g.arrow(ox, oy, ox + 34, oy, { cls: 'dim', hs: 6 }); g.label(ox + 38, oy, 'z', 'l', 'small accent');
    g.odot(ox, oy, 5); g.label(ox - 8, oy, 'y', 'r', 'small accent');
    return g.svg();
  }
  // the thin loop that straddles a boundary
  function loopFig() {
    const g = PF.fig({ alt: 'a boundary drawn as a horizontal line between region 1 below and region 2 above, with the unit normal n pointing up into region 2; a thin rectangular loop of length w along the boundary and height h across it straddles the line; tangential fields H1 below and H2 above run along the boundary; a surface current J_s flows in the boundary, into the page' });
    const y0 = 100, xa = 110, xb = 270, h = 16;
    g.rect(40, y0, 300, 70, { cls: 'shade' });
    g.line(30, y0, 350, y0, { cls: 'thick' });
    g.label(44, y0 + 54, '\\text{region 1}', 'l', 'small'); g.label(44, y0 - 54, '\\text{region 2}', 'l', 'small');
    g.arrow(320, y0, 320, y0 - 44, { hs: 8 }); g.label(326, y0 - 40, '\\hat n', 'l');
    g.loopRect(xa, y0 - h, xb - xa, 2 * h, { dir: 'ccw' });
    g.dim(xa, y0 + h + 16, xb, y0 + h + 16, 'w');
    g.label(xb + 8, y0 - 8, 'h', 'l', 'small');
    g.arrow(140, y0 - 36, 230, y0 - 36, { cls: 'dim', hs: 7 }); g.label(185, y0 - 42, '\\mathbf H_2', 'b', 'small');
    g.arrow(140, y0 + 50, 230, y0 + 50, { cls: 'dim', hs: 7 }); g.label(240, y0 + 50, '\\mathbf H_1', 'l', 'small');
    for (const xs of [70, 300]) g.otimes(xs, y0, 6);
    g.label(70, y0 - 12, '\\mathbf J_s', 'b', 'small');
    return g.svg();
  }

  // ================================================================ lesson: what you need from Exam 2
  EM.lesson('e3s', {
    id: 'e3-refresh', topic: 0, order: 0.2, ref: 'Lectures 18–20 (Exam 2)', title: 'What you need from Exam 2, rebuilt',
    steps: [
      R(md`
        !!key Why you care
          Exam 3 starts where Exam 2 stopped. Spring 2024 #1 is two current sheets. All four summer papers open with a switched-on sheet sketched against $t$ and $z$. Every lossy-wave problem needs "which way does $\mathbf H$ point". And the field/line analogy on [the map of Exam 3](#/l/e3-map) leans on the two equations derived here. This page rebuilds the Exam 2 wave toolkit from Maxwell's equations, briefly but with every step.

        ### Notation

        - $E_x(z,t)$: the $x$-component of $\mathbf E$ (V/m), depending only on $z$ and $t$. $H_y(z,t)$: the $y$-component of $\mathbf H$ (A/m).
        - $\mu = \mu_r\mu_0$ (H/m), $\epsilon = \epsilon_r\epsilon_0$ (F/m): the permeability and permittivity of the medium.
        - $v = 1/\sqrt{\mu\epsilon}$: the wave speed (m/s). $c = 3\times10^8$ m/s $= 300$ m/µs in vacuum.
        - $\eta = \sqrt{\mu/\epsilon}$: the intrinsic impedance ($\Omega$). $\eta_0 = 120\pi \approx 377\ \Omega$ in vacuum.
        - $f(\cdot)$, $g(\cdot)$: any functions of one variable: the **wave shapes**. $f'$ is the derivative of $f$ with respect to its argument.
        - $\hat e$, $\hat h$, $\hat v$: unit vectors along $\mathbf E$, along $\mathbf H$, and along the direction of travel.
        - $\mathbf J_s$: a surface current density (A/m): current per meter of width, flowing in a sheet.
        - $\hat n$: a unit normal of a surface.

        ### 1. The two equations of a plane wave

        Away from any charge or current, Maxwell's two curl equations are
        $$\nabla\times\mathbf E = -\mu\frac{\partial\mathbf H}{\partial t}$$
        $$\nabla\times\mathbf H = \epsilon\frac{\partial\mathbf E}{\partial t}$$
        In words: an $\mathbf H$ that changes in time makes $\mathbf E$ curl (Faraday), and an $\mathbf E$ that changes in time makes $\mathbf H$ curl (Ampère, with Maxwell's displacement current).

        Now take the simplest wave: $\mathbf E = \hat x\,E_x(z,t)$ and $\mathbf H = \hat y\,H_y(z,t)$. Nothing depends on $x$ or $y$. The $y$-component of $\nabla\times\mathbf E$, from the sheet, is
        $$(\nabla\times\mathbf E)_y = \frac{\partial E_x}{\partial z} - \frac{\partial E_z}{\partial x}$$
        There is no $E_z$, so only the first term is left. Faraday's law then says
        $$\frac{\partial E_x}{\partial z} = -\mu\frac{\partial H_y}{\partial t} \qquad\text{(1)}$$
        The $x$-component of $\nabla\times\mathbf H$ is
        $$(\nabla\times\mathbf H)_x = \frac{\partial H_z}{\partial y} - \frac{\partial H_y}{\partial z}$$
        There is no $H_z$, so only $-\partial H_y/\partial z$ is left. Ampère's law then says $-\partial H_y/\partial z = \epsilon\,\partial E_x/\partial t$. Move the minus sign across:
        $$\frac{\partial H_y}{\partial z} = -\epsilon\frac{\partial E_x}{\partial t} \qquad\text{(2)}$$
        These two lines are the whole of plane-wave theory. On a transmission line they become the telegrapher's equations, with $V$ for $E_x$ and $I$ for $H_y$.

        ### 2. The wave equation

        We want one equation with only $E_x$ in it. Differentiate (1) with respect to $z$:
        $$\frac{\partial^2E_x}{\partial z^2} = -\mu\frac{\partial}{\partial z}\frac{\partial H_y}{\partial t}$$
        The order of two partial derivatives does not matter, so swap them:
        $$\frac{\partial^2E_x}{\partial z^2} = -\mu\frac{\partial}{\partial t}\frac{\partial H_y}{\partial z}$$
        Equation (2) says what $\partial H_y/\partial z$ is. Substitute it:
        $$\frac{\partial^2E_x}{\partial z^2} = -\mu\frac{\partial}{\partial t}\left(-\epsilon\frac{\partial E_x}{\partial t}\right)$$
        The two minus signs cancel:
        $$\boxed{\frac{\partial^2E_x}{\partial z^2} = \mu\epsilon\,\frac{\partial^2E_x}{\partial t^2}}$$
        That is the **wave equation**, the first line under "TEM waves" on your sheet.

        !!intuition Does this make sense?
          Units: the left side is (V/m)/m², the right side is $\mu\epsilon$ times (V/m)/s². So $\mu\epsilon$ must have units s²/m²: one over a speed squared. That speed is $v = 1/\sqrt{\mu\epsilon}$. In vacuum, $\mu_0\epsilon_0 = 4\pi\times10^{-7}\cdot10^{-9}/(36\pi) = 10^{-16}/9$, so $v = 3\times10^8$ m/s $= c$ ✓. In a material, $v = c/\sqrt{\mu_r\epsilon_r}$.
      `),
      Q(md`**Predict.** A non-magnetic material has $\epsilon_r = 9$. A wave in it travels at…`,
        [md`$10^8$ m/s`, md`$3.33\times10^7$ m/s`, md`$9\times10^8$ m/s`, md`$3\times10^8$ m/s`], 0,
        [null, md`That divides $c$ by $\epsilon_r$. The speed has $\sqrt{\epsilon_r}$: $v = 1/\sqrt{\mu\epsilon}$.`, md`That multiplies. A larger $\epsilon$ makes $\mu\epsilon$ larger and the wave slower.`, md`That is vacuum. Here $\mu\epsilon$ is 9 times larger.`],
        md`$v = c/\sqrt{\epsilon_r} = 3\times10^8/3 = 10^8$ m/s $= 100$ m/µs.`),
      RF(md`
        ### 3. The solutions: shapes that slide

        Claim: **any** function of $t - z/v$ solves the wave equation. Call the argument $u = t - z/v$ and check it with the chain rule.

        The time derivative: $\partial u/\partial t = 1$, so
        $$\frac{\partial}{\partial t}f(u) = f'(u), \qquad \frac{\partial^2}{\partial t^2}f(u) = f''(u)$$
        The space derivative: $\partial u/\partial z = -1/v$, so each $z$-derivative brings a factor $-1/v$:
        $$\frac{\partial^2}{\partial z^2}f(u) = \left(-\frac1v\right)^2f''(u) = \frac{f''(u)}{v^2}$$
        Put both into the wave equation. The left side is $f''/v^2$ and the right side is $\mu\epsilon f''$. They match because $\mu\epsilon = 1/v^2$ ✓. The same steps work for $g(t + z/v)$, since $(+1/v)^2 = 1/v^2$ too. So the general solution is
        $$E_x(z,t) = f\!\left(t - \frac zv\right) + g\!\left(t + \frac zv\right)$$
        Maxwell's equations do not choose the shape. Pulses, steps, sinusoids: anything goes. They only fix the speed.

        **Which way does it move?** Follow one feature of $f$, say its peak, where the argument has a fixed value $u_0$:
        $$t - \frac zv = u_0 \quad\Longrightarrow\quad z = v(t - u_0)$$
        As $t$ grows, $z$ grows. So $f(t - z/v)$ moves toward $+z$ at speed $v$. For $g(t + z/v)$ the same steps give $z = v(u_0 - t)$, which shrinks as $t$ grows: it moves toward $-z$.

        [[fig:snap]]

        !!method Reading the direction in two seconds
          Look at the signs of $t$ and $z$ inside the argument.
          - **Opposite signs** ($t - z/v$, $\omega t - \beta z$, $z - vt$): the wave moves toward **$+z$**.
          - **Same signs** ($t + z/v$, $\omega t + \beta z$, $z + vt$): the wave moves toward **$-z$**.
          - The speed is the coefficient of $t$ divided by the coefficient of $z$: $v$, or $\omega/\beta$.
      `, { snap: { svg: snapFig(), cap: 'The pulse f(t − z/v) at t = 0 (solid) and at t = t₁ (dashed): the same shape, moved a distance vt₁ toward +z.' } }),
      Q(md`**Predict.** $E_x = 5\cos(6\times10^8t + 2z)$ V/m, with $z$ in meters. The wave travels…`,
        [md`toward $-\hat z$ at $3\times10^8$ m/s`, md`toward $+\hat z$ at $3\times10^8$ m/s`, md`toward $-\hat z$ at $1.2\times10^9$ m/s`, md`toward $-\hat z$ at $3.3\times10^{-9}$ m/s`], 0,
        [null, md`$t$ and $z$ have the **same** sign in the argument, which means $-z$.`, md`That multiplies $\omega$ by $\beta$. The speed is $\omega/\beta$.`, md`That is $\beta/\omega$, upside down: seconds per meter, not meters per second.`],
        md`Same signs on $t$ and $z$: toward $-z$. Speed $\omega/\beta = 6\times10^8/2 = 3\times10^8$ m/s: this is vacuum.`),
      R(md`
        ### 4. $\eta$, and which way $\mathbf H$ points

        Take the forward wave $E_x = f(t - z/v)$ and find the $H_y$ that goes with it. The left side of (1) is the $z$-derivative, which brings $-1/v$:
        $$\frac{\partial E_x}{\partial z} = -\frac1v f'$$
        Equation (1) says this equals $-\mu\,\partial H_y/\partial t$:
        $$-\frac1v f' = -\mu\frac{\partial H_y}{\partial t}$$
        Cancel the minus signs and divide by $\mu$:
        $$\frac{\partial H_y}{\partial t} = \frac{f'}{\mu v}$$
        The right side is the time derivative of $f/(\mu v)$. So, leaving out any constant (static) field,
        $$H_y = \frac{f}{\mu v} = \frac{E_x}{\mu v}$$
        Simplify $\mu v$ with $v = 1/\sqrt{\mu\epsilon}$:
        $$\mu v = \frac{\mu}{\sqrt{\mu\epsilon}} = \sqrt{\frac\mu\epsilon} \equiv \eta$$
        So for the forward wave
        $$\boxed{H_y = +\frac{E_x}{\eta}}$$
        For the backward wave $g(t + z/v)$, the $z$-derivative brings $+1/v$ instead, and the sign flips:
        $$\boxed{H_y = -\frac{E_x}{\eta}}$$
        $\eta$ is the ratio of $E$ to $H$ in one traveling wave. In vacuum $\eta_0 = \sqrt{\mu_0/\epsilon_0} = 120\pi \approx 377\ \Omega$. In a material, $\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$.

        **The direction rule.** For the forward wave, $\mathbf E\times\mathbf H = E_xH_y\,(\hat x\times\hat y) = (E_x^2/\eta)\,\hat z$. That points along $+\hat z$, the direction of travel, whatever the sign of $E_x$. For the backward wave it points along $-\hat z$. In general:
        $$\boxed{\hat e\times\hat h = \hat v}$$
        That is the line $\hat e\times\hat h = \hat v_p$ on your sheet. To find $\hat h$ from $\hat e$ and $\hat v$, use the same cyclic order, one step on:
        $$\hat h = \hat v\times\hat e$$
        Check it on the forward wave: $\hat v\times\hat e = \hat z\times\hat x = \hat y$ ✓.

        **Example.** $\mathbf E = \hat y\,10\cos(\omega t + \beta x)$ V/m in vacuum. Same signs on $t$ and $x$: the wave travels toward $-\hat x$. So
        $$\hat h = \hat v\times\hat e = (-\hat x)\times\hat y = -\hat z$$
        The size is $10/\eta_0 = 10/(120\pi) = 1/(12\pi) \approx 0.0265$ A/m:
        $$\mathbf H = -\hat z\,\frac{1}{12\pi}\cos(\omega t + \beta x)\ \text{A/m}$$
        **Check.** $\hat y\times(-\hat z) = -\hat x$, the direction of travel ✓.

        !!intuition Does this make sense?
          Reverse the travel and keep $\mathbf E$: then $\mathbf E\times\mathbf H$ must reverse, so $\mathbf H$ must flip. That is the sign difference between $+E_x/\eta$ and $-E_x/\eta$. A reflected wave works the same way: when $\mathbf E$ reflects with $\Gamma$, $\mathbf H$ reflects with $-\Gamma$.
      `),
      Q(md`**Predict.** $\mathbf E = \hat x\,6\cos(\omega t - \beta y)$ V/m in a non-magnetic material with $\epsilon_r = 4$. Then $\mathbf H$ is…`,
        [md`$-\hat z\,0.0318\cos(\omega t - \beta y)$ A/m`, md`$+\hat z\,0.0318\cos(\omega t - \beta y)$ A/m`, md`$-\hat z\,0.0159\cos(\omega t - \beta y)$ A/m`, md`$-\hat z\,1131\cos(\omega t - \beta y)$ A/m`], 0,
        [null, md`Check $\hat e\times\hat h$: $\hat x\times\hat z = -\hat y$, but the wave travels toward $+\hat y$.`, md`That uses $\eta_0 = 120\pi$. In this material $\eta = 120\pi/\sqrt4 = 60\pi\ \Omega$.`, md`That multiplies by $\eta$. $H$ is $E$ divided by $\eta$.`],
        md`Opposite signs on $t$ and $y$: travel toward $+\hat y$. $\hat h = \hat v\times\hat e = \hat y\times\hat x = -\hat z$. Size: $6/(60\pi) = 1/(10\pi) \approx 0.0318$ A/m.`),
      RF(md`
        ### 5. The boundary conditions

        At a surface between two regions, Maxwell's equations in integral form tie the fields on one side to the fields on the other. Let $\hat n$ be the unit normal pointing from region 1 into region 2. Draw a thin rectangular loop that straddles the surface: length $w$ along it, height $h$ across it. Then shrink $h$ to zero.

        [[fig:loop]]

        **Tangential $\mathbf E$.** Faraday's law in integral form:
        $$\oint\mathbf E\cdot d\mathbf l = -\frac{d}{dt}\int\mathbf B\cdot d\mathbf S$$
        As $h \to 0$, the loop encloses no area, so the flux on the right goes to zero (the fields are finite). The two short sides have no length left. Only the two long sides remain, traversed in opposite directions:
        $$E_{2,t}\,w - E_{1,t}\,w = 0$$
        So the tangential $\mathbf E$ is the same on both sides. In vector form, as on your sheet:
        $$\boxed{\hat n\times(\mathbf E_2 - \mathbf E_1) = 0}$$
        **Tangential $\mathbf H$.** Ampère's law in integral form:
        $$\oint\mathbf H\cdot d\mathbf l = I_{\text{enc}} + \frac{d}{dt}\int\mathbf D\cdot d\mathbf S$$
        As $h \to 0$ the displacement term vanishes for the same reason. But a **surface current** flows in the surface itself, with no thickness, so the loop still encloses it: $I_{\text{enc}} = J_s\,w$. So the tangential $\mathbf H$ jumps by $J_s$. In vector form:
        $$\boxed{\hat n\times(\mathbf H_2 - \mathbf H_1) = \mathbf J_s}$$
        (The normal components obey $\hat n\cdot(\mathbf D_2 - \mathbf D_1) = \rho_s$ and $\hat n\cdot(\mathbf B_2 - \mathbf B_1) = 0$, from the two divergence laws. Exam 3 mostly uses the tangential pair.)

        **How to use the vector form.** Take $\hat n = \hat z$, $\mathbf H_1 = 2\hat y$ below and $\mathbf H_2 = -\hat y$ above, in A/m. The jump is $\mathbf H_2 - \mathbf H_1 = -3\hat y$. Then
        $$\mathbf J_s = \hat z\times(-3\hat y) = -3(\hat z\times\hat y) = 3\hat x\ \text{A/m}$$
        since $\hat z\times\hat y = -\hat x$.

        **At a perfect conductor** the fields inside are zero. Then the tangential $\mathbf E$ outside must be zero, and the surface current equals the tangential $\mathbf H$ just outside: $\mathbf J_s = \hat n\times\mathbf H$, with $\hat n$ pointing out of the conductor. This is the fact that turns a pair of plates into a transmission line on [the map](#/l/e3-map).
      `, { loop: { svg: loopFig(), cap: 'A thin loop straddling a boundary. As its height h shrinks to zero, only the two long sides and any current flowing in the surface itself remain.' } }),
      Q(md`**Predict.** The plane $z = 0$ separates region 1 ($z < 0$) from region 2 ($z > 0$). Just below it $\mathbf H_1 = 3\hat x$ A/m; just above it $\mathbf H_2 = -\hat x$ A/m. The surface current is…`,
        [md`$\mathbf J_s = -4\hat y$ A/m`, md`$\mathbf J_s = +4\hat y$ A/m`, md`$\mathbf J_s = -2\hat y$ A/m`, md`$\mathbf J_s = -4\hat x$ A/m`], 0,
        [null, md`That uses $\mathbf H_1 - \mathbf H_2$. The rule is $\hat n\times(\mathbf H_2 - \mathbf H_1)$ with $\hat n$ pointing into region 2.`, md`That adds the fields, $3 + (-1)$. The current is set by the **jump**, $-1 - 3 = -4$.`, md`$\hat n\times\Delta\mathbf H$ is perpendicular to $\Delta\mathbf H$, so it cannot point along $\hat x$.`],
        md`$\mathbf H_2 - \mathbf H_1 = -4\hat x$. Then $\hat z\times(-4\hat x) = -4\hat y$ A/m, since $\hat z\times\hat x = \hat y$.`),
      RF(md`
        ### 6. Sheet radiation, derived from the boundary conditions

        Put a sheet of surface current $\mathbf J_s = \hat x\,J_s(t)$ (A/m) on the plane $z = 0$, in a medium with $\mu$ and $\epsilon$. What does it radiate?

        **Step 1: symmetry.** The sheet is infinite and uniform, so the fields can depend only on $z$ and $t$. The current is along $\hat x$, so $\mathbf E$ is along $\hat x$ and $\mathbf H$ along $\hat y$: exactly the wave of Section 1.

        **Step 2: outgoing waves only.** The sheet is the only source, so on each side the wave must travel **away** from it. Nothing comes in from infinity. Using Sections 3 and 4:
        $$z > 0:\quad E_x = f\!\left(t - \frac zv\right),\quad H_y = +\frac{E_x}{\eta}$$
        $$z < 0:\quad E_x = g\!\left(t + \frac zv\right),\quad H_y = -\frac{E_x}{\eta}$$
        **Step 3: tangential $\mathbf E$ is continuous at $z = 0$.** So $f(t) = g(t)$. Call this common value $e(t) = E_x(0,t)$.

        **Step 4: tangential $\mathbf H$ jumps by $\mathbf J_s$.** The normal from the region below into the region above is $\hat n = \hat z$. Just above the sheet $H_y = e/\eta$; just below, $H_y = -e/\eta$. So the jump is
        $$\mathbf H_2 - \mathbf H_1 = \left(\frac e\eta + \frac e\eta\right)\hat y = \frac{2e}{\eta}\,\hat y$$
        Cross with $\hat z$, using $\hat z\times\hat y = -\hat x$:
        $$\hat z\times(\mathbf H_2 - \mathbf H_1) = -\frac{2e}{\eta}\,\hat x$$
        The boundary condition sets this equal to $\mathbf J_s = \hat x\,J_s(t)$:
        $$-\frac{2e(t)}{\eta} = J_s(t)$$
        Solve for the field at the sheet:
        $$e(t) = -\frac\eta2\,J_s(t)$$
        **Step 5: send it outward.** On each side the field at distance $|z|$ is what left the sheet a time $|z|/v$ earlier:
        $$\boxed{\mathbf E = -\frac\eta2\,\mathbf J_s\!\left(t - \frac{|z|}{v}\right)}$$
        on both sides, and
        $$\boxed{\mathbf H = \frac12\,\mathbf J_s\!\left(t - \frac{|z|}{v}\right)\times\hat n}$$
        where $\hat n$ points from the sheet toward the place you are looking. For $z > 0$, $\hat x\times\hat z = -\hat y$; for $z < 0$, $\hat x\times(-\hat z) = +\hat y$. So $H_y = \mp\tfrac12J_s$ for $z \gtrless 0$.

        [[fig:sheet]]

        **Compare with your sheet.** The formula sheet uses $\mathbf J_s = -J_s(t)\,\hat x$, a current along $-\hat x$. Put that into the box: $\mathbf E = +\tfrac\eta2J_s\,\hat x$ and $H_y = \pm\tfrac12J_s$ for $z \gtrless 0$. Exactly the sheet's lines. The vector form above works for any sheet in any plane.

        **In phasors.** A sheet with phasor current $\tilde{\mathbf J}_s$ at one frequency radiates
        $$\tilde{\mathbf E} = -\frac\eta2\,\tilde{\mathbf J}_s\,e^{-j\beta|z|}$$
        since a delay of $|z|/v$ is a phase of $-\omega|z|/v = -\beta|z|$. That is what Spring 2024 #1 used for both sheets.

        !!intuition Does this make sense?
          - **$\mathbf E$ points against the current**, on both sides. So $\mathbf J_s\cdot\mathbf E < 0$: the sheet pushes its current against the field it makes, like the charges inside a battery. That is how it gives energy to the waves.
          - **$\mathbf E\times\mathbf H$ points away from the sheet** on both sides. Above: $(-\hat x)\times(-\hat y) = +\hat z$ ✓. Below: $(-\hat x)\times(+\hat y) = -\hat z$ ✓.
          - **The amplitude does not fall with distance.** An infinite sheet's wave does not spread out.
          - **Static limit.** A steady current gives $\mathbf H = \tfrac12\mathbf J_s\times\hat n$, the magnetostatic sheet field on page 2 of the sheet ✓.
      `, { sheet: { svg: sheetFig(), cap: 'A sheet with current along +x, seen edge-on. E points against the current on both sides; H points into the page on the right and out of it on the left; both waves move away from the sheet.' } }),
      Q(md`**Predict.** A sheet at $z = 0$ in vacuum carries the phasor current $\tilde{\mathbf J}_s = -2\hat x$ A/m at a frequency where $\lambda = 1$ m. What is $\tilde{\mathbf E}$ at $z = 0.25$ m?`,
        [md`$-j120\pi\,\hat x$ V/m`, md`$+j120\pi\,\hat x$ V/m`, md`$-j60\pi\,\hat x$ V/m`, md`$120\pi\,\hat x$ V/m`], 0,
        [null, md`That uses $e^{+j\beta|z|}$. A delay is a phase **lag**: $e^{-j\beta|z|}$, which at a quarter wavelength is $-j$.`, md`That takes $\eta_0/2\cdot1$: the current's size is 2 A/m, so $(\eta_0/2)(2) = 120\pi$.`, md`That leaves out the phase. At a quarter wavelength from the sheet the phase is $-90°$.`],
        md`$\tilde{\mathbf E} = -\tfrac{\eta_0}{2}(-2\hat x)e^{-j\beta(0.25)} = 120\pi\,\hat x\,e^{-j\pi/2} = -j120\pi\,\hat x$ V/m, since $\beta(0.25) = 2\pi(0.25) = \pi/2$.`),
      Q(md`**Predict.** A sheet at $z = 0$ in vacuum is switched on at $t = 0$: $\mathbf J_s = \hat x\,2u(t)\sin(2\pi\times10^6t)$ A/m. When does the field first reach $z = 600$ m, and how big is its peak there?`,
        [md`at $2$ µs, with peak $|E| = 120\pi \approx 377$ V/m`, md`at $2$ µs, with peak $|E| = 240\pi \approx 754$ V/m`, md`at $0.5$ µs, with peak $|E| = 120\pi$ V/m`, md`at $2$ µs, with peak $|E| = 377/600$ V/m`], 0,
        [null, md`That is $\eta_0J_s$. The jump in $\mathbf H$ is shared by two waves, so each has $|E| = \eta_0J_s/2$.`, md`That divides the speed by the distance. Time is distance over speed: $600/300$ µs.`, md`An infinite sheet's wave does not fall off with distance.`],
        md`Arrival: $600\ \text{m}/(300\ \text{m}/\mu\text{s}) = 2\ \mu\text{s}$. Peak: $\tfrac{\eta_0}{2}(2) = 120\pi \approx 377$ V/m, at every distance.`),
      R(md`
        ### 7. Power: $\mathbf S = \mathbf E\times\mathbf H$

        The **Poynting vector** $\mathbf S = \mathbf E\times\mathbf H$ is the power that flows through each square meter, in W/m². Units: (V/m)(A/m) $=$ W/m² ✓. For one traveling wave it points along $\hat v$, and its size is
        $$S = E_xH_y = \frac{E_x^2}{\eta}$$
        **Why it is power: energy is conserved.** Use equations (1) and (2). Differentiate the product $E_xH_y$ with the product rule:
        $$\frac{\partial(E_xH_y)}{\partial z} = H_y\frac{\partial E_x}{\partial z} + E_x\frac{\partial H_y}{\partial z}$$
        Replace each derivative using (1) and (2):
        $$= H_y\left(-\mu\frac{\partial H_y}{\partial t}\right) + E_x\left(-\epsilon\frac{\partial E_x}{\partial t}\right)$$
        Each term is a time derivative of a square, since $\partial(\tfrac12H^2)/\partial t = H\,\partial H/\partial t$:
        $$\frac{\partial S_z}{\partial z} = -\frac{\partial}{\partial t}\left(\tfrac12\mu H_y^2 + \tfrac12\epsilon E_x^2\right)$$
        The bracket is the energy stored per cubic meter, magnetic plus electric. So the power flowing into a thin slab minus the power flowing out equals the rate at which the slab's stored energy grows. That is Poynting's theorem in one dimension. With currents present it gains a $\mathbf J\cdot\mathbf E$ term ([Topic 3](#/l/w1-poynting)).

        **The sheet balances its books.** Each side carries $S = E^2/\eta = (\eta J_s/2)^2/\eta = \tfrac\eta4J_s^2$ away. Both sides together: $\tfrac\eta2J_s^2$ per square meter of sheet. And the power the sheet delivers is $-\mathbf J_s\cdot\mathbf E = J_s\cdot\tfrac\eta2J_s = \tfrac\eta2J_s^2$ ✓.

        **The time average.** For a cosine wave of amplitude $E_0$, $S = (E_0^2/\eta)\cos^2(\omega t - \beta z)$. The average of $\cos^2$ over a period is $\tfrac12$, since $\cos^2x = \tfrac12(1 + \cos2x)$ and the $\cos2x$ averages to zero:
        $$\langle S\rangle = \frac{E_0^2}{2\eta}$$
        [Topic 4](#/l/w1-avg) gets the same thing from phasors: $\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$.
      `),
      Q(md`**Predict.** (Summer 2020 #2.) A sheet in vacuum carries $\mathbf J_s = \hat y\,4\sin\omega t$ A/m. What is the time-averaged power density carried away on **one** side?`,
        [md`$240\pi \approx 754$ W/m²`, md`$480\pi \approx 1508$ W/m²`, md`$120\pi \approx 377$ W/m²`, md`$960\pi \approx 3016$ W/m²`], 0,
        [null, md`That is both sides together (or one side without the $\tfrac12$ of the average).`, md`That splits the sheet's total power, $|\langle\mathbf J_s\cdot\mathbf E\rangle| = 480\pi$ W/m², four ways. It splits two ways: half to each side.`, md`That uses $\eta_0J_s$ for the field: twice too big, so four times the power.`],
        md`Peak field $E_0 = \tfrac{\eta_0}{2}(4) = 240\pi$ V/m. $\langle S\rangle = E_0^2/(2\eta_0) = (240\pi)^2/(240\pi) = 240\pi \approx 754$ W/m². The posted key gets the same value from $\tfrac12|\langle\mathbf J_s\cdot\mathbf E\rangle| = \tfrac12(480\pi)$.`),
      R(md`
        ### The method

        !!method From a field written down to everything about the wave
          1. **Direction:** opposite signs on $t$ and the position mean $+$; same signs mean $-$.
          2. **Speed:** coefficient of $t$ over coefficient of position ($\omega/\beta$). Compare with $c$ to get $\sqrt{\mu_r\epsilon_r}$.
          3. **Impedance:** $\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$.
          4. **H:** size $E_0/\eta$, direction $\hat h = \hat v\times\hat e$.
          5. **Power:** $\langle S\rangle = E_0^2/2\eta$ along $\hat v$.
          6. **Check:** $\hat e\times\hat h = \hat v$.

        !!method A sheet in two lines
          $\mathbf E = -\tfrac\eta2\mathbf J_s(t - d/v)$ on both sides, against the current. $\mathbf H = \tfrac12\mathbf J_s(t - d/v)\times\hat n$, with $\hat n$ from the sheet toward you and $d$ your distance from the sheet.

        ### Worked example 1: a wave read from its formula

        !!graded Problem
          $\mathbf E = \hat x\,60\pi\cos(3\times10^8t + 2z)$ V/m in a non-magnetic material. Find the direction, $v$, $\epsilon_r$, $\eta$, $\mathbf H$ and $\langle\mathbf S\rangle$.

        **Step 1: direction.** Same signs on $t$ and $z$: toward $-\hat z$.

        **Step 2: speed.**
        $$v = \frac{\omega}{\beta} = \frac{3\times10^8}{2} = 1.5\times10^8\ \text{m/s}$$
        **Step 3: $\epsilon_r$.** $v = c/\sqrt{\epsilon_r}$, so $\sqrt{\epsilon_r} = c/v = 2$:
        $$\epsilon_r = 4$$
        **Step 4: $\eta$.**
        $$\eta = \frac{120\pi}{\sqrt4} = 60\pi\ \Omega$$
        **Step 5: $\mathbf H$.** The size is $60\pi/60\pi = 1$ A/m. The direction:
        $$\hat h = \hat v\times\hat e = (-\hat z)\times\hat x = -\hat y$$
        So
        $$\mathbf H = -\hat y\cos(3\times10^8t + 2z)\ \text{A/m}$$
        **Step 6: power.**
        $$\langle S\rangle = \frac{(60\pi)^2}{2\cdot60\pi} = 30\pi \approx 94\ \text{W/m}^2$$
        along $-\hat z$.
        **Check.** $\hat x\times(-\hat y) = -\hat z$ ✓.

        ### Worked example 2: a switched-on sheet (the summer-paper problem)

        !!graded Problem
          A sheet on the plane $y = 0$ in vacuum carries $\mathbf J_s = \hat z\,2u(t)\sin(2\pi\times10^6t)$ A/m. Find $\mathbf E$ and $\mathbf H$ for $y > 0$, the wavelength, and when the field reaches $y = 600$ m.

        **Step 1: $\mathbf E$.** Against the current, delayed by $y/c$:
        $$\mathbf E = -\frac{\eta_0}{2}\,\mathbf J_s\!\left(t - \frac yc\right)$$
        With $\eta_0/2\cdot2 = 120\pi$:
        $$\mathbf E = -\hat z\,120\pi\,u(t - y/c)\sin\!\big(\omega(t - y/c)\big)$$
        in V/m.
        **Step 2: $\mathbf H$.** For $y > 0$, $\hat n = \hat y$, and $\hat z\times\hat y = -\hat x$. The size is $\tfrac12\cdot2 = 1$ A/m:
        $$\mathbf H = -\hat x\,u(t - y/c)\sin\!\big(\omega(t - y/c)\big)$$
        in A/m.
        **Step 3: wavelength.** $\lambda = c/f = 3\times10^8/10^6 = 300$ m.

        **Step 4: arrival.** $600\ \text{m}/(300\ \text{m}/\mu\text{s}) = 2\ \mu\text{s}$. Before that, the field at $y = 600$ m is zero.

        **Check.** $\mathbf E\times\mathbf H$: $(-\hat z)\times(-\hat x) = \hat z\times\hat x = \hat y$, away from the sheet ✓.

        !!mistake Common mistakes
          - **Reading the direction backward.** $\cos(\omega t + \beta z)$ goes toward $-z$.
          - **Speed as $\beta/\omega$** or $\omega\beta$. It is $\omega/\beta$.
          - **$\eta$ with $\epsilon_r$ instead of $\sqrt{\epsilon_r}$.**
          - **$\mathbf H$ along the wrong sign.** Always finish with the check $\hat e\times\hat h = \hat v$.
          - **The sheet's field as $\eta J_s$.** It is $\tfrac\eta2J_s$: two waves share the jump.
          - **$\mathbf E$ along the current.** It points against it.
          - **Forgetting the delay** $|z|/v$, or using $t - z/v$ on the side $z < 0$.
          - **Subtracting in the wrong order** in $\hat n\times(\mathbf H_2 - \mathbf H_1)$: $\hat n$ points into region 2.

        ### Check questions
      `),
      Q(md`Which pair of fields can be one wave traveling toward $+\hat y$?`,
        [md`$\mathbf E$ along $+\hat z$, $\mathbf H$ along $+\hat x$`, md`$\mathbf E$ along $+\hat x$, $\mathbf H$ along $+\hat z$`, md`$\mathbf E$ along $+\hat z$, $\mathbf H$ along $+\hat y$`, md`$\mathbf E$ along $+\hat y$, $\mathbf H$ along $+\hat x$`], 0,
        [null, md`$\hat x\times\hat z = -\hat y$: that wave travels toward $-\hat y$.`, md`$\mathbf H$ cannot point along the direction of travel in a plane wave.`, md`$\mathbf E$ cannot point along the direction of travel either.`],
        md`$\hat z\times\hat x = \hat y$ ✓.`),
      Q(md`$E_x = f(t - z/v)$ and someone writes $H_y = -E_x/\eta$. What is wrong?`,
        ['The sign: for a wave toward $+z$, $H_y = +E_x/\\eta$', 'Nothing: the sign of $H$ is a convention', 'The size: it should be $\\eta E_x$', 'The direction of $\\mathbf H$ should be $\\hat z$'], 0,
        [null, md`The sign is fixed by Faraday's law: $\mathbf E\times\mathbf H$ must point along the travel.`, md`$H = E/\eta$: $\eta$ has units of ohms.`, md`A plane wave has no field along its direction of travel.`],
        md`$\hat x\times(-\hat y) = -\hat z$ would mean travel toward $-z$, but $f(t - z/v)$ moves toward $+z$.`),
      R(md`
        ### Practice, level 1: one move at a time

        **The trick:** signs in the argument give the direction; $\hat h = \hat v\times\hat e$ gives $\mathbf H$; $\tfrac\eta2J_s$ gives a sheet's field. Eight right completes each card.
      `),
      Object.assign(G('rf_s0_dir', { need: 8 }), { id: 'e3-refresh.r0' }),
      Object.assign(G('rf_s0_eh', { need: 8 }), { id: 'e3-refresh.r1' }),
      Object.assign(G('rf_s0_sheet', { need: 8 }), { id: 'e3-refresh.r2' }),
      R(md`
        ### Practice, level 2: the whole wave, new numbers

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('s0_plane', { need: 2 }),
      G('s0_sheet', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- e3-refresh generators
  // unit vectors as [axis index, sign]
  const AXN = ['x', 'y', 'z'];
  const cross = (a, b) => [3 - a[0] - b[0], a[1] * b[1] * ((b[0] - a[0] + 3) % 3 === 1 ? 1 : -1)];
  const uv = (v) => `${v[1] < 0 ? '-' : '+'}\\hat ${AXN[v[0]]}`;
  const uvO = (v) => `$${uv(v)}$`;
  const dirOpt = (v, s) => md`toward $${uv(v)}$ at $${s}$`;

  GENS.rf_s0_dir = () => one([
    () => {
      const ax = pick([0, 1, 2]), sgn = pick([1, -1]);
      const [w, b] = pick([[6e8, 2], [3e8, 2], [9e8, 3], [6e8, 4], [2e8, 2], [4e8, 2], [1.2e9, 4], [6e8, 3]]);
      const v = w / b, a = AXN[ax];
      const sp = (x) => `${p(+x.toPrecision(3))}\\ \\text{m/s}`;
      return MC('Direction and speed', md`$E = 5\cos(${p(w)}\,t ${sgn > 0 ? '-' : '+'} ${b}${a})$ V/m, with ${a} in meters. The wave travels…`, dirOpt([ax, sgn], sp(v)),
        [[dirOpt([ax, -sgn], sp(v)), md`The signs of $t$ and $${a}$ in the argument are ${sgn > 0 ? 'opposite, which means $+' + a + '$' : 'the same, which means $-' + a + '$'}.`],
          [dirOpt([ax, sgn], sp(w * b)), md`That multiplies $\omega$ by $\beta$. The speed is $\omega/\beta$.`],
          [dirOpt([ax, sgn], sp(b / w)), md`That is $\beta/\omega$, upside down: seconds per meter.`],
          [dirOpt([ax, -sgn], sp(w * b)), md`Both the direction and the speed are off: speed is $\omega/\beta$, and the sign rule gives ${sgn > 0 ? '$+' : '$-'}${a}$.`]],
        md`${sgn > 0 ? 'Opposite' : 'Same'} signs on $t$ and $${a}$: toward $${sgn > 0 ? '+' : '-'}\hat ${a}$. Speed $\omega/\beta = ${p(w)}/${b} = ${p(v)}$ m/s.`);
    },
    () => {
      const ax = pick([0, 1, 2]), a = AXN[ax], sgn = pick([1, -1]), v = pick([100, 150, 200, 300]), form = pick(['t', 'z']);
      const arg = form === 't' ? `t ${sgn > 0 ? '-' : '+'} ${a}/${v}` : `${a} ${sgn > 0 ? '-' : '+'} ${v}t`;
      const sp = (x) => `${p(x)}\\ \\text{m}/\\mu\\text{s}`;
      return MC('Direction and speed', md`$E = f(${arg})$, with ${a} in meters and $t$ in µs. The shape travels…`, dirOpt([ax, sgn], sp(v)),
        [[dirOpt([ax, -sgn], sp(v)), md`${sgn > 0 ? 'Opposite' : 'Same'} signs on $t$ and $${a}$ mean ${sgn > 0 ? '$+' : '$-'}${a}$. Follow a peak: the argument stays fixed as $t$ grows.`],
          [dirOpt([ax, sgn], sp(+(1 / v).toPrecision(3))), md`That is ${form === 't' ? 'the coefficient of the position, upside down' : 'one over the speed'}. Hold the argument fixed: $${a}$ changes by ${v} m each µs.`],
          [dirOpt([ax, -sgn], sp(+(1 / v).toPrecision(3))), md`Both are off. Hold the argument fixed and solve for $${a}$ as $t$ grows.`]],
        md`Hold the argument fixed: $${a} = ${sgn > 0 ? '' : '-'}${v}t + $ const. The shape moves toward $${sgn > 0 ? '+' : '-'}\hat ${a}$ at ${v} m/µs.`);
    },
  ]);

  GENS.rf_s0_eh = () => one([
    () => {
      const vax = pick([0, 1, 2]), vs = pick([1, -1]), eax = pick([0, 1, 2].filter((k) => k !== vax)), es = pick([1, -1]);
      const vv = [vax, vs], ee = [eax, es], hh = cross(vv, ee);
      const sgnArg = vs > 0 ? '-' : '+';
      return MC('Which way H points', md`$\mathbf E = ${uv(ee).replace('+', '')}\,E_0\cos(\omega t ${sgnArg} \beta ${AXN[vax]})$ with $E_0 > 0$. $\mathbf H$ points along…`, uvO(hh),
        [[uvO([hh[0], -hh[1]]), md`Check: $\hat e\times\hat h$ must point along the travel, $${uv(vv)}$. This choice gives the opposite.`],
          [uvO(vv), md`$\mathbf H$ is perpendicular to the direction of travel: a plane wave has no field along $\hat v$.`],
          [uvO([vv[0], -vv[1]]), md`$\mathbf H$ is perpendicular to the direction of travel, whichever way that is.`],
          [uvO(ee), md`$\mathbf H$ is perpendicular to $\mathbf E$.`]],
        md`Travel: ${vs > 0 ? 'opposite' : 'same'} signs, so $\hat v = ${uv(vv)}$. Then $\hat h = \hat v\times\hat e = (${uv(vv)})\times(${uv(ee)}) = ${uv(hh)}$.`);
    },
    () => {
      const [er, mr] = pick([[4, 1], [9, 1], [16, 1], [1, 4], [9, 4]]), E0 = pick([1, 2, 3, 6, 12]);
      const eta = 120 * Math.sqrt(mr / er);   // in units of pi
      const H = E0 / (eta * PI);
      const opt = (x) => `$${p(+x.toPrecision(3))}$ A/m`;
      return MC('The size of H', md`A wave with $|E| = ${E0}$ V/m travels in a material with $\epsilon_r = ${er}$ and $\mu_r = ${mr}$. Then $|H|$ is…`, opt(H),
        [[opt(E0 / (120 * PI)), md`That uses $\eta_0$. Here $\eta = 120\pi\sqrt{\mu_r/\epsilon_r} = ${p(eta)}\pi\ \Omega$.`],
          [opt(E0 / (120 * PI * mr / er)), md`That uses $\mu_r/\epsilon_r$ without the square root.`],
          [opt(E0 / (120 * PI * Math.sqrt(er / mr))), md`That has the ratio upside down: $\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$.`],
          [opt(E0 * eta * PI), md`That multiplies by $\eta$. $H = E/\eta$.`]],
        md`$\eta = 120\pi\sqrt{${mr}/${er}} = ${p(eta)}\pi\ \Omega$, so $|H| = ${E0}/(${p(eta)}\pi) = ${p(+H.toPrecision(3))}$ A/m.`);
    },
    () => {
      const [er, mr] = pick([[4, 1], [9, 1], [16, 1], [1, 4], [4, 9], [2.25, 1]]), eta = 120 * Math.sqrt(mr / er);
      const piT = (x) => `$${p(+x.toPrecision(3))}\\pi\\ \\Omega$`;
      return MC('The impedance of a material', md`$\epsilon_r = ${er}$, $\mu_r = ${mr}$. Then $\eta$ is…`, piT(eta),
        [[piT(120 * mr / er), md`That drops the square root.`], [piT(120 * Math.sqrt(er / mr)), md`Upside down: $\mu$ goes on top.`], ['$120\\pi\\ \\Omega$', md`That is vacuum.`], [piT(120 / er), md`That divides by $\epsilon_r$ and ignores $\mu_r$.`]],
        md`$\eta = \eta_0\sqrt{\mu_r/\epsilon_r} = 120\pi\sqrt{${mr}/${er}} = ${p(+eta.toPrecision(3))}\pi\ \Omega$.`);
    },
  ]);

  GENS.rf_s0_sheet = () => one([
    () => {
      // boundary condition: Js = n x (H2 - H1), n = +z
      const hax = pick([0, 1]), h1 = pick([-3, -2, -1, 1, 2, 3]), h2 = pick([-2, -1, 1, 2, 4].filter((x) => x !== h1));
      const dH = h2 - h1, js = cross([2, 1], [hax, Math.sign(dH)]), mag = Math.abs(dH);
      const vec = (m, v) => `$${v[1] < 0 ? '-' : ''}${m}\\hat ${AXN[v[0]]}$ A/m`;
      return MC('A surface current from a jump', md`The plane $z = 0$ separates region 1 ($z < 0$) from region 2 ($z > 0$). Just below, $\mathbf H_1 = ${h1}\hat ${AXN[hax]}$; just above, $\mathbf H_2 = ${h2}\hat ${AXN[hax]}$ (A/m). $\mathbf J_s$ is…`, vec(mag, js),
        [[vec(mag, [js[0], -js[1]]), md`That is $\hat n\times(\mathbf H_1 - \mathbf H_2)$: backward. $\hat n$ points into region 2, and the jump is region 2 minus region 1.`],
          ...(h1 + h2 !== 0 ? [[vec(Math.abs(h1 + h2), js), md`That adds the two fields. The current is set by the jump, $\mathbf H_2 - \mathbf H_1$.`]] : []),
          [vec(mag, [hax, Math.sign(dH)]), md`$\hat n\times\Delta\mathbf H$ is perpendicular to $\Delta\mathbf H$, so it cannot point along $\hat ${AXN[hax]}$.`],
          [vec(mag, [2, 1]), md`A surface current flows in the surface; it has no component along $\hat n$.`]],
        md`$\mathbf H_2 - \mathbf H_1 = ${dH}\hat ${AXN[hax]}$. Then $\hat z\times(${dH}\hat ${AXN[hax]}) = ${js[1] < 0 ? '-' : ''}${mag}\hat ${AXN[js[0]]}$ A/m.`);
    },
    () => {
      const er = pick([1, 4, 9]), J = pick([1, 2, 4, 6]), eta = 120 / Math.sqrt(er);
      const o = (x) => `$${p(+x.toPrecision(3))}\\pi$ V/m`;
      return MC('How strong is a sheet\'s wave', md`A sheet in a non-magnetic medium with $\epsilon_r = ${er}$ carries a current of peak $${J}$ A/m. The peak $|\mathbf E|$ of the wave it launches is…`, o(eta * J / 2),
        [[o(eta * J), md`That is $\eta J_s$. The jump in $H$ is shared by two waves, one each side: $|E| = \tfrac\eta2J_s$.`],
          [o(120 * J / 2), md`That uses $\eta_0$. In this medium $\eta = 120\pi/\sqrt{${er}}$.`],
          [o(eta * J / 4), md`That halves twice. Each side gets $|H| = J_s/2$, so $|E| = \eta J_s/2$.`],
          [`$${p(J / 2)}$ V/m`, md`That is $|H| = J_s/2$ in A/m, not $|E|$.`]],
        md`$|E| = \tfrac\eta2J_s = \tfrac{${p(eta)}\pi}{2}(${J}) = ${p(eta * J / 2)}\pi$ V/m.`);
    },
    () => {
      const nax = pick([0, 1, 2]), jax = pick([0, 1, 2].filter((k) => k !== nax)), js = pick([1, -1]), side = pick([1, -1]);
      const J = [jax, js], n = [nax, side], H = cross(J, n), E = [jax, -js];
      const ask = pick(['E', 'H']);
      const right = ask === 'E' ? E : H;
      return MC(`Which way ${ask} points next to a sheet`, md`A sheet on the plane $${AXN[nax]} = 0$ carries $\mathbf J_s = ${uv(J).replace('+', '')}\,J_0$ with $J_0 > 0$ at this moment. On the side $${AXN[nax]} ${side > 0 ? '>' : '<'} 0$, the wave's $\mathbf ${ask}$ there points along…`, uvO(right),
        ask === 'E'
          ? [[uvO(J), md`$\mathbf E = -\tfrac\eta2\mathbf J_s$: against the current. The sheet pushes its current against its own field, which is how it gives away energy.`],
            [uvO(n), md`A plane wave has no field along its direction of travel, here $${uv(n)}$.`],
            [uvO(H), md`That is the direction of $\mathbf H$, perpendicular to $\mathbf E$.`],
            [uvO([H[0], -H[1]]), md`$\mathbf E$ is parallel to the current (pointing against it), not perpendicular to it.`]]
          : [[uvO([H[0], -H[1]]), md`That is the other side of the sheet. $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ with $\hat n$ from the sheet toward you, $${uv(n)}$.`],
            [uvO(J), md`$\mathbf H$ circles the current, so it is perpendicular to it.`],
            [uvO(n), md`A plane wave has no field along its direction of travel.`],
            [uvO(E), md`That is the direction of $\mathbf E$.`]],
        ask === 'E' ? md`$\mathbf E = -\tfrac\eta2\mathbf J_s$ on both sides: $${uv(E)}$.` : md`$\hat n = ${uv(n)}$, so $\mathbf H \propto \mathbf J_s\times\hat n = (${uv(J)})\times(${uv(n)}) = ${uv(H)}$. Check: $\hat e\times\hat h = (${uv(E)})\times(${uv(H)}) = ${uv(cross(E, H))}$, away from the sheet ✓.`);
    },
    () => {
      const er = pick([4, 9, 16]), d = pick([150, 300, 600, 900, 1200]), v = 300 / Math.sqrt(er);
      const o = (x) => `$${p(+x.toPrecision(3))}$ µs`;
      return MC('When does it arrive', md`A sheet switches on at $t = 0$ in a non-magnetic medium with $\epsilon_r = ${er}$. When does its field first reach a distance of ${d} m?`, o(d / v),
        [[o(d / 300), md`That uses $c = 300$ m/µs. Here $v = c/\sqrt{${er}} = ${p(v)}$ m/µs.`], [o(d / (300 / er)), md`That divides $c$ by $\epsilon_r$. The speed has $\sqrt{\epsilon_r}$.`], [o(2 * d / v), md`That is a round trip. The wave only has to go out once.`], [o(v / d), md`That is speed over distance, upside down.`], [o(d / (300 * Math.sqrt(er))), md`That multiplies the speed by $\sqrt{\epsilon_r}$. A denser medium is slower.`]],
        md`$v = 300/\sqrt{${er}} = ${p(v)}$ m/µs, so $t = ${d}/${p(v)} = ${p(+(d / v).toPrecision(3))}$ µs.`);
    },
  ]);

  GENS.s0_plane = () => {
    const er = pick([1, 4, 9]), n = Math.sqrt(er), w = pick([3e8, 6e8, 1.5e8]), v = 3e8 / n, b = w / v;
    const ax = pick([0, 1, 2]), sgn = pick([1, -1]), eax = pick([0, 1, 2].filter((k) => k !== ax)), es = pick([1, -1]);
    const vv = [ax, sgn], ee = [eax, es], hh = cross(vv, ee);
    const eta = 120 * PI / n, E0 = pick([1, 2, 3]) * eta;     // H amplitude 1, 2 or 3 A/m
    const H0 = E0 / eta, S = E0 * E0 / (2 * eta);
    const hcoef = hh[1] * H0;
    const a = AXN[ax];
    return {
      title: 'A plane wave read from its formula',
      q: md`$\mathbf E = ${uv(ee).replace('+', '')}\,${p(E0 / PI)}\pi\cos(${p(w)}\,t ${sgn > 0 ? '-' : '+'} ${p(+b.toPrecision(4))}${a})$ V/m in a non-magnetic material, with ${a} in meters. $\mathbf H$ points along $\pm\hat ${AXN[hh[0]]}$. Find the speed, $\epsilon_r$, $\eta$, the signed amplitude $H_${AXN[hh[0]]}$ (the coefficient of $\hat ${AXN[hh[0]]}$ in $\mathbf H$), and $\langle S\rangle$.`,
      parts: [
        NT('v', v, 'm/s', [[b / w, 'That is β/ω, upside down.'], [w * b, 'That multiplies ω by β.']]),
        NT('\\epsilon_r', er === 1 ? 1 : er, '', [[n, 'That is √ε_r = c/v. Square it.']]),
        NT('\\eta', eta, 'Ω', [[120 * PI / er, 'That divides η0 by ε_r instead of its square root.'], [120 * PI, 'That is vacuum.']]),
        NT(`H_${AXN[hh[0]]}`, hcoef, 'A/m', [[-hcoef, 'Check the sign with ê × ĥ = v̂: the travel direction comes from the signs in the argument.'], [E0 / (120 * PI) * hh[1], 'That uses η0. Use this material’s η.']]),
        NT('\\langle S\\rangle', S, 'W/m²', [[2 * S, 'That forgets the ½ of the time average.'], [E0 * E0 / (2 * 120 * PI), 'That uses η0.']]),
      ],
      hints: [md`Speed $= \omega/\beta$; then $\sqrt{\epsilon_r} = c/v$ and $\eta = 120\pi/\sqrt{\epsilon_r}$.`, md`Direction of travel from the signs; then $\hat h = \hat v\times\hat e$ and $|H| = E_0/\eta$.`],
      sol: md`
        **Step 1: direction.** ${sgn > 0 ? 'Opposite' : 'Same'} signs on $t$ and $${a}$: the wave travels toward $${uv(vv)}$.

        **Step 2: speed.**
        $$v = \frac{\omega}{\beta} = \frac{${p(w)}}{${p(+b.toPrecision(4))}} = ${p(v)}\ \text{m/s}$$
        **Step 3: $\epsilon_r$.** $\sqrt{\epsilon_r} = c/v = ${p(n)}$, so $\epsilon_r = ${er}$.

        **Step 4: $\eta$.**
        $$\eta = \frac{120\pi}{${p(n)}} = ${p(120 / n)}\pi \approx ${f(eta)}\ \Omega$$
        **Step 5: $\mathbf H$.** Size: $E_0/\eta = ${p(E0 / PI)}\pi/(${p(120 / n)}\pi) = ${p(H0)}$ A/m. Direction:
        $$\hat h = \hat v\times\hat e = (${uv(vv)})\times(${uv(ee)}) = ${uv(hh)}$$
        So $H_${AXN[hh[0]]} = ${p(hcoef)}$ A/m, and
        $$\mathbf H = ${uv(hh).replace('+', '')}\,${p(H0)}\cos(${p(w)}\,t ${sgn > 0 ? '-' : '+'} ${p(+b.toPrecision(4))}${a})\ \text{A/m}$$
        **Step 6: power.**
        $$\langle S\rangle = \frac{E_0^2}{2\eta} = \frac{(${p(E0 / PI)}\pi)^2}{2\cdot${p(120 / n)}\pi} = ${f(S)}\ \text{W/m}^2$$
        along $${uv(vv)}$.

        **Check.** $\hat e\times\hat h = (${uv(ee)})\times(${uv(hh)}) = ${uv(cross(ee, hh))}$, the direction of travel ✓.
      `,
    };
  };

  GENS.s0_sheet = () => {
    const er = pick([1, 4]), n = Math.sqrt(er), fM = pick([0.5, 1, 2, 3]), J0 = pick([2, 4, 6]);
    const nax = pick([0, 1, 2]), jax = pick([0, 1, 2].filter((k) => k !== nax)), js = pick([1, -1]), side = pick([1, -1]);
    const J = [jax, js], nn = [nax, side], H = cross(J, nn);
    const eta = 120 * PI / n, v = 300 / n, lam = v / fM, D = pick([1, 2, 3]) * lam, tA = D / v;
    const E0 = eta * J0 / 2, Hc = H[1] * J0 / 2, S = E0 * E0 / (2 * eta);
    const a = AXN[nax];
    return {
      title: 'A switched-on current sheet',
      q: md`A sheet on the plane $${a} = 0$, in a non-magnetic medium with $\epsilon_r = ${er}$, carries $\mathbf J_s = ${uv(J).replace('+', '')}\,${J0}\,u(t)\sin(2\pi f t)$ A/m with $f = ${fM}$ MHz. Find the peak $|\mathbf E|$, the wavelength, the time the field first reaches the point $${a} = ${side > 0 ? '' : '-'}${p(D)}$ m, the signed peak $H_${AXN[H[0]]}$ there once it has arrived (the coefficient of $\hat ${AXN[H[0]]}$ multiplying $\sin$), and the average power density carried away on that side.`,
      parts: [
        NT('|\\mathbf E|_{\\text{peak}}', E0, 'V/m', [[eta * J0, 'That is ηJ_s. Two waves share the jump: |E| = (η/2)J_s.'], [60 * PI * J0, 'That uses η0. Use this medium’s η.']]),
        NT('\\lambda', lam, 'm', [[300 / fM, 'That uses c. The wave is slower here: v = c/√ε_r.']]),
        NT('t_{\\text{arrive}}', tA, 'µs', [[D / 300, 'That uses c = 300 m/µs. Here v = c/√ε_r.']]),
        NT(`H_${AXN[H[0]]}`, Hc, 'A/m', [[-Hc, 'That is the other side of the sheet. H = ½ J_s × n̂ with n̂ pointing from the sheet toward the point.'], [H[1] * J0, 'That is J_s itself. Each side gets half: |H| = J_s/2.']]),
        NT('\\langle S\\rangle', S, 'W/m²', [[2 * S, 'That is both sides together, or forgets the ½ of the time average.']]),
      ],
      hints: [md`$\mathbf E = -\tfrac\eta2\mathbf J_s(t - d/v)$ and $\mathbf H = \tfrac12\mathbf J_s(t - d/v)\times\hat n$, where $d$ is the distance from the sheet.`, md`$v = 300/\sqrt{\epsilon_r}$ m/µs and $\lambda = v/f$.`],
      sol: md`
        **Step 1: the medium.** $v = c/\sqrt{${er}} = ${p(v)}$ m/µs and $\eta = 120\pi/\sqrt{${er}} = ${p(120 / n)}\pi\ \Omega$.

        **Step 2: the field size.**
        $$|\mathbf E| = \frac\eta2J_0 = \frac{${p(120 / n)}\pi}{2}(${J0}) = ${p(60 * J0 / n)}\pi \approx ${f(E0)}\ \text{V/m}$$
        It points along $${uv([jax, -js])}$, against the current, on both sides.

        **Step 3: the wavelength.**
        $$\lambda = \frac vf = \frac{${p(v)}\ \text{m}/\mu\text{s}}{${fM}\ \text{MHz}} = ${p(lam)}\ \text{m}$$
        (m/µs divided by MHz is meters.)

        **Step 4: arrival.** The point is $${p(D)}$ m from the sheet:
        $$t = \frac{${p(D)}}{${p(v)}} = ${p(+tA.toPrecision(4))}\ \mu\text{s}$$
        **Step 5: $\mathbf H$ there.** $\hat n = ${uv(nn)}$ (from the sheet toward the point). $\mathbf J_s\times\hat n = (${uv(J)})\times(${uv(nn)}) = ${uv(H)}$, and the size is $J_0/2 = ${p(J0 / 2)}$ A/m. So $H_${AXN[H[0]]} = ${p(Hc)}$ A/m.

        **Step 6: power on that side.**
        $$\langle S\rangle = \frac{|\mathbf E|^2}{2\eta} = \frac\eta8J_0^2 = ${f(S)}\ \text{W/m}^2$$
        **Check.** $\mathbf E\times\mathbf H$: $(${uv([jax, -js])})\times(${uv(H)}) = ${uv(cross([jax, -js], H))}$, away from the sheet ✓.
      `,
    };
  };

  // ---------------------------------------------------------------- the question bank: e3-refresh
  EM.BANK['e3-refresh'] = [
    Q(md`The product $\mu\epsilon$ has units of…`, [md`s²/m²`, md`m²/s²`, md`Ω²`, md`s/m`], 0,
      [null, md`That is a speed squared, $1/(\mu\epsilon)$.`, md`That is $\mu/\epsilon$, whose root is $\eta$.`, md`That is $\sqrt{\mu\epsilon}$, one over a speed.`],
      md`$v = 1/\sqrt{\mu\epsilon}$, so $\mu\epsilon = 1/v^2$, in s²/m².`),
    Q(md`Which function solves $\partial^2E/\partial z^2 = (1/v^2)\,\partial^2E/\partial t^2$?`, [md`$e^{-(z - vt)^2}$`, md`$e^{-(z^2 + v^2t^2)}$`, md`$e^{-z}\cos(vt)$`, md`$z^2 - v^2t^2$`], 0,
      [null, md`That is not a function of $z \mp vt$ alone, and differentiating twice shows the two sides differ.`, md`$\partial_z^2$ gives $+e^{-z}\cos vt$, but $(1/v^2)\partial_t^2$ gives $-e^{-z}\cos vt$: opposite signs.`, md`$\partial_z^2$ gives $2$, but $(1/v^2)\partial_t^2$ gives $(1/v^2)(-2v^2) = -2$.`],
      md`Any $F(z - vt)$ solves it. $e^{-(z - vt)^2}$ is a pulse moving toward $+z$.`),
    Q(md`$E = f(z + 300t)$, with $z$ in m and $t$ in µs. The shape moves…`, [md`toward $-z$ at 300 m/µs`, md`toward $+z$ at 300 m/µs`, md`toward $-z$ at $1/300$ m/µs`, md`toward $+z$ at $1/300$ m/µs`], 0,
      [null, md`Same signs on $z$ and $t$: toward $-z$.`, md`Hold $z + 300t$ fixed: $z$ changes by 300 m per µs.`, md`Both are off.`],
      md`$z + 300t = $ const gives $z = -300t + $ const.`),
    Q(md`A non-magnetic material has $\epsilon_r = 9$. Its $\eta$ is…`, [md`$40\pi\ \Omega$`, md`$\tfrac{40}{3}\pi\ \Omega$`, md`$360\pi\ \Omega$`, md`$120\pi\ \Omega$`], 0,
      [null, md`That divides by $\epsilon_r$, not its root.`, md`That multiplies.`, md`That is vacuum.`],
      md`$120\pi/\sqrt9 = 40\pi \approx 126\ \Omega$.`),
    Q(md`A material has $\mu_r = 4$ and $\epsilon_r = 1$. Its $\eta$ is…`, [md`$240\pi\ \Omega$`, md`$60\pi\ \Omega$`, md`$480\pi\ \Omega$`, md`$120\pi\ \Omega$`], 0,
      [null, md`$\mu$ goes on top: a magnetic material raises $\eta$.`, md`That forgets the square root.`, md`That ignores $\mu_r$.`],
      md`$\eta = 120\pi\sqrt{4/1} = 240\pi\ \Omega$.`),
    Q(md`$\mathbf E = -\hat z\,E_0\cos(\omega t - \beta x)$, $E_0 > 0$. $\mathbf H$ points along…`, [md`$+\hat y$`, md`$-\hat y$`, md`$+\hat x$`, md`$-\hat z$`], 0,
      [null, md`Check: $(-\hat z)\times(-\hat y) = -\hat x$, the wrong way.`, md`$\mathbf H$ is perpendicular to the travel, $+\hat x$.`, md`$\mathbf H$ is perpendicular to $\mathbf E$.`],
      md`Travel $+\hat x$. $\hat h = \hat v\times\hat e = \hat x\times(-\hat z) = \hat y$. Check: $(-\hat z)\times\hat y = \hat x$ ✓.`),
    Q(md`You know $\hat h$ and $\hat v$. Then $\hat e$ is…`, [md`$\hat h\times\hat v$`, md`$\hat v\times\hat h$`, md`$\hat h\cdot\hat v$`, md`$\hat v$`], 0,
      [null, md`That is $-\hat e$: the order matters.`, md`A dot product is a number; and $\hat h\perp\hat v$ makes it zero.`, md`$\mathbf E$ is perpendicular to the travel.`],
      md`The triple $(\hat e, \hat h, \hat v)$ is cyclic like $(\hat x, \hat y, \hat z)$: $\hat h\times\hat v = \hat e$, as $\hat y\times\hat z = \hat x$.`),
    Q(md`Across the boundary between two dielectrics with no surface current, which is continuous?`, [md`tangential $\mathbf E$ and tangential $\mathbf H$`, md`only normal $\mathbf E$`, md`tangential $\mathbf E$ only`, md`nothing`], 0,
      [null, md`Normal $\mathbf D$ is continuous (no surface charge); normal $\mathbf E$ jumps by $\epsilon_1/\epsilon_2$.`, md`With $\mathbf J_s = 0$, tangential $\mathbf H$ is continuous too.`, md`The thin-loop argument gives two conditions.`],
      md`$\hat n\times(\mathbf E_2 - \mathbf E_1) = 0$ always; $\hat n\times(\mathbf H_2 - \mathbf H_1) = \mathbf J_s = 0$ here. These two give $\Gamma$ and $\tau$ in [Topic 11](#/l/w4-gamma).`),
    Q(md`The normal component of $\mathbf B$ across any boundary…`, [md`is continuous`, md`jumps by $\mu_0J_s$`, md`is zero`, md`jumps by $\rho_s$`], 0,
      [null, md`A surface current makes **tangential** $\mathbf H$ jump.`, md`It need not be zero; it is only continuous.`, md`$\rho_s$ makes normal $\mathbf D$ jump.`],
      md`$\nabla\cdot\mathbf B = 0$ through a thin pillbox: $\hat n\cdot(\mathbf B_2 - \mathbf B_1) = 0$.`),
    Q(md`At the surface of a perfect conductor, the tangential $\mathbf E$ just outside is…`, [md`zero`, md`$\eta J_s$`, md`$\rho_s/\epsilon$`, md`twice the incident field`], 0,
      [null, md`That would mean a field inside the conductor, by continuity.`, md`$\rho_s/\epsilon$ is the **normal** field.`, md`The **total** tangential field is zero: incident and reflected cancel.`],
      md`Inside, $\mathbf E = 0$, and tangential $\mathbf E$ is continuous. That is why $\Gamma = -1$ at a perfect conductor.`),
    Q(md`On the two sides of a radiating current sheet…`, [md`$\mathbf E$ is the same; $\mathbf H$ is reversed`, md`$\mathbf E$ is reversed; $\mathbf H$ is the same`, md`both are the same`, md`both are reversed`], 0,
      [null, md`Tangential $\mathbf E$ must be continuous at the sheet.`, md`$\mathbf H$ must jump by $\mathbf J_s$, so it cannot be the same.`, md`Then $\mathbf E$ would jump, which needs a magnetic current.`],
      md`$\mathbf E = -\tfrac\eta2\mathbf J_s$ on both sides; $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ flips with $\hat n$.`),
    Q(md`For a radiating sheet, $\mathbf J_s\cdot\mathbf E$ at the sheet is…`, [md`negative: the sheet delivers power`, md`positive: the sheet absorbs power`, md`zero: $\mathbf E\perp\mathbf J_s$`, md`positive on one side, negative on the other`], 0,
      [null, md`That would be a resistor heating up, which takes power from the field.`, md`$\mathbf E$ is parallel to $\mathbf J_s$ (and opposite).`, md`$\mathbf E$ is the same on both sides.`],
      md`$\mathbf J_s\cdot\mathbf E = -\tfrac\eta2J_s^2 < 0$: the sheet is a source, like a battery driving current against its field.`),
    Q(md`The wave from an infinite current sheet in a lossless medium, at twice the distance…`, [md`has the same amplitude, arriving later`, md`has half the amplitude`, md`has a quarter of the power`, md`has the same amplitude, arriving at the same time`], 0,
      [null, md`A sheet's wave does not spread out, unlike a point source's.`, md`Same: the plane wave does not spread.`, md`It needs time $d/v$ to get there.`],
      md`$\mathbf E = -\tfrac\eta2\mathbf J_s(t - d/v)$: no $1/d$ anywhere.`),
    Q(md`$\mathbf S = \mathbf E\times\mathbf H$ is measured in…`, [md`W/m²`, md`W`, md`J/m³`, md`W/m`], 0,
      [null, md`It is per unit area. Multiply by an area to get watts.`, md`J/m³ is an energy density, the bracket in Poynting's theorem.`, md`(V/m)(A/m) $=$ W/m².`],
      md`(V/m)(A/m) = VA/m² = W/m².`),
    Q(md`The time average of $\cos^2(\omega t - \beta z)$ is…`, [md`$\tfrac12$`, md`$1$`, md`$0$`, md`$\tfrac1{\sqrt2}$`], 0,
      [null, md`That is its peak.`, md`That is the average of $\cos$, not $\cos^2$.`, md`That is the rms of $\cos$, not the mean of $\cos^2$.`],
      md`$\cos^2x = \tfrac12(1 + \cos2x)$, and $\cos2x$ averages to zero.`),
    Q(md`The formula sheet writes its sheet as $\mathbf J_s = -J_s(t)\hat x$. When $J_s(t) > 0$, the sheet's $\mathbf E$ points along…`, [md`$+\hat x$ on both sides`, md`$-\hat x$ on both sides`, md`$+\hat x$ above, $-\hat x$ below`, md`$\pm\hat y$`], 0,
      [null, md`The current itself points along $-\hat x$, and $\mathbf E$ points against the current.`, md`$\mathbf E$ is continuous across the sheet.`, md`That is the direction of $\mathbf H$.`],
      md`$\mathbf E = -\tfrac\eta2\mathbf J_s = +\tfrac\eta2J_s\hat x$: the sheet's $E_x = \tfrac\eta2J_s(t \mp z/v)$.`),
    Q(md`A sheet switches on at $t = 0$ in a non-magnetic medium with $\epsilon_r = 9$. When does its field reach 300 m?`, [md`3 µs`, md`1 µs`, md`9 µs`, md`0.33 µs`], 0,
      [null, md`That uses $c$.`, md`That divides $c$ by $\epsilon_r$.`, md`That is speed over distance.`],
      md`$v = 300/3 = 100$ m/µs, so $300/100 = 3$ µs.`),
    Q(md`The static field of a steady sheet current $\mathbf J_s$ has $|\mathbf H| =$…`, [md`$J_s/2$`, md`$J_s$`, md`$\mu_0J_s/2$`, md`$J_s/(2\pi d)$`], 0,
      [null, md`The jump is $J_s$, shared equally by the two sides.`, md`That is $|\mathbf B|$, not $|\mathbf H|$.`, md`That is a line current's field shape.`],
      md`$\mathbf H = \tfrac12\mathbf J_s\times\hat n$, the same as the radiating sheet's $\mathbf H$ in the limit of a slow current.`),
    Q(md`At a point the wave from a sheet has not reached yet, the field is…`, [md`zero`, md`the static sheet field`, md`half its final value`, md`$-\tfrac\eta2J_s(0)$`], 0,
      [null, md`Nothing at that point knows the sheet switched on; no field can get there faster than $v$.`, md`Information travels at $v$; nothing has arrived.`, md`That is the field at the sheet at $t = 0^+$.`],
      md`$\mathbf J_s(t - d/v) = 0$ while $t < d/v$, since the current was zero before $t = 0$.`),
    Q(md`Which pair of equations is correct for $\mathbf E = \hat xE_x(z,t)$, $\mathbf H = \hat yH_y(z,t)$ in a lossless medium?`, [md`$\partial_zE_x = -\mu\,\partial_tH_y$ and $\partial_zH_y = -\epsilon\,\partial_tE_x$`, md`$\partial_zE_x = \mu\,\partial_tH_y$ and $\partial_zH_y = \epsilon\,\partial_tE_x$`, md`$\partial_zE_x = -\epsilon\,\partial_tH_y$ and $\partial_zH_y = -\mu\,\partial_tE_x$`, md`$\partial_zE_x = -\mu\,\partial_tH_y$ and $\partial_zH_y = +\epsilon\,\partial_tE_x$`], 0,
      [null, md`Both signs are negative: the $y$-component of $\nabla\times\mathbf E$ is $+\partial_zE_x$, and the $x$-component of $\nabla\times\mathbf H$ is $-\partial_zH_y$.`, md`$\mu$ goes with Faraday's law, $\epsilon$ with Ampère's.`, md`$(\nabla\times\mathbf H)_x = -\partial_zH_y$, so Ampère's law gives a minus sign here too.`],
      md`These are the two equations of Section 1, and the telegrapher's equations with $V, I, L, C$ for $E, H, \mu, \epsilon$.`),
    Q(md`In a vacuum plane wave, $|E| = 377$ V/m. Then $|H|$ is…`, [md`$1$ A/m`, md`$377$ A/m`, md`$0.5$ A/m`, md`$142{,}000$ A/m`], 0,
      [null, md`$H = E/\eta_0$.`, md`That would be a sheet's split, but here $E$ is given.`, md`That multiplies by $\eta_0$.`],
      md`$377/377 = 1$ A/m.`),
    Q(md`A wave in vacuum has $\langle S\rangle = 60\pi$ W/m². Its peak field $E_0$ is…`, [md`$120\pi$ V/m`, md`$60\pi$ V/m`, md`$60\sqrt2\,\pi \approx 84.9\pi$ V/m`, md`$\sqrt{60\pi} \approx 13.7$ V/m`], 0,
      [null, md`That sets $E_0$ equal to $\langle S\rangle$. Use $\langle S\rangle = E_0^2/2\eta_0$.`, md`That uses $\langle S\rangle = E_0^2/\eta_0$, without the $\tfrac12$ of the time average.`, md`That takes the root of $\langle S\rangle$ alone. The root is of $2\eta_0\langle S\rangle$.`],
      md`$E_0^2 = 2\eta_0\langle S\rangle = 240\pi\cdot60\pi = 14400\pi^2$, so $E_0 = 120\pi$ V/m.`),
  ];
})();

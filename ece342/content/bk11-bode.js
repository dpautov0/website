/* Chapter 11 — Bode plots (the book, unit bk11): decibels and log axes, one pole and one zero derived (asymptotes,
   -3 dB, the straight-line phase and its error), the right-half-plane zero and s at the origin, many factors as sums,
   sketching step by step, and reading H(s), the -3 dB and the unity-gain frequencies back off a plot (Lectures 25, 27).
   Plots are drawn by E3Bode (gens-e3-bode.js) and BK7.lplot (gens-bk-a7.js); every number was checked independently
   (scratchpad A7: exact complex evaluation, numerical roots, straight lines computed a second way). */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const L = (l) => BK.lesson('bk11', l);
  const K = window.BK7;
  const EB = window.E3Bode;
  const f = U.fmt;
  const L10 = Math.log10, DEG = 180 / Math.PI;
  const plot = (sp, o = {}) => ({ svg: EB.svg(sp, o), cap: o.cap });

  // ================================================================ figures
  // a log ruler: equal steps are equal ratios
  const rulerFig = (() => {
    const p = new K.Pic(), x0 = 30, D = 150;          // one decade = 150 px
    p.line(x0, 60, x0 + 2 * D, 60);
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach((v) => {
      const x = x0 + D * L10(v), big = [1, 10, 100].includes(v);
      p.line(x, big ? 48 : 54, x, big ? 72 : 66, big ? 'thick' : '');
      if ([1, 2, 3, 5, 10, 20, 30, 50, 100].includes(v)) p.lab(x, 76, String(v), 't');
    });
    p.lab(x0 + D / 2, 32, '\\text{one decade}\\ (\\times10)', 'b').lab(x0 + D * (1 + L10(2) / 2), 32, '\\times2', 'b');
    p.path(`M${x0},44L${x0},36L${x0 + D},36L${x0 + D},44`, 'dim').path(`M${x0 + D + 3},44L${x0 + D + 3},36L${x0 + D * (1 + L10(2))},36L${x0 + D * (1 + L10(2))},44`, 'dim');
    return p.svg(380);
  })();
  // power laws are straight lines on log-log axes
  const powFig = K.lplot({ wmin: 10, wmax: 1e5, y: [-60, 40], yt: [-60, -40, -20, 0, 20, 40], xl: '\\omega\\ (\\text{rad/s})', yl: '20\\log_{10}|H|', h: 250,
    curves: [{ f: (w) => 20 * L10(w / 1e3) }, { f: () => 0, cls: 'ink' }, { f: (w) => -20 * L10(w / 1e3), cls: 'dash' }, { f: (w) => -40 * L10(w / 1e3), cls: 'ink dash' }],
    notes: [{ w: 6e4, y: 31, n: '\\omega/10^3:\\ +20' }, { w: 6e4, y: 5, n: '1:\\ 0' }, { w: 6e4, y: -30, n: '-20' }, { w: 2.6e4, y: -54, n: '-40\\ \\text{dB/dec}' }] });

  // ================================================================ 1. decibels and logarithmic axes
  L({
    id: 'bk11-db', title: 'Decibels and logarithmic axes', ref: 'Lectures 25, 27',
    steps: [
      R(md`
        ### Chapter 11 at a glance

        Lecture 25 plotted the common source's gain three ways: on linear axes ("tedious to plot, difficult to read and use"), semi-log, and log-log, and chose log-log. That is the **Bode plot**. This chapter derives why log-log axes turn every transfer function into a few straight lines, and every rule needed to sketch and read them: decibels; the one-pole and one-zero asymptotes; the $-3\,\text{dB}$ point; Lecture 27's straight-line phase, the $0.1\times$ to $10\times$ rule; the right-half-plane zero and $s$ at the origin; adding many factors; and reading $H(s)$, the bandwidth and the unity-gain frequency back off a plot.

        **You will be able to:**
        - convert any gain to and from decibels in your head, and add the gains of a chain;
        - draw the magnitude and phase of any $H(s)$ in standard form with straight lines, and say how far the real curve is from them;
        - read $H(s)$ off a plot, and find $\omega_{-3\text{dB}}$ and the unity-gain frequency, roughly and exactly.

        **You need first:** Chapter 10, above all [the $1 + jx$ facts](#/l/bk10-complex) and [the standard form](#/l/bk10-pz).
      `),
      R(md`
        ### The question

        Amplifier gains span from $0.001$ to $10^5$ and frequencies from hertz to gigahertz. On linear axes everything interesting is squashed into a corner: Lecture 25's first plot shows the gain falling, but you cannot read a slope or a corner off it. Logarithmic scales on **both** axes fix that, and they do something better: they turn the products in $H(s)$ into sums and the power laws into straight lines.
      `),
      RF(md`
        ### The physical picture: a ruler of ratios

        On a logarithmic axis, position measures $\log_{10}$ of the value, so **equal steps are equal ratios**. The distance from 1 to 10 equals the distance from 10 to 100: one **decade**. A factor of 2, an **octave**, is always $\log_{10}2 = 0.301$ of a decade; 3 sits $48\%$ of the way along a decade, and 5 sits $70\%$ of the way.

        [[fig:ruler]]

        The frequency axis of a Bode plot is such a ruler, labelled in decades. The vertical axis uses decibels, which are the same idea applied to the gain.
      `, { ruler: { svg: rulerFig, cap: 'A log scale: each decade has the same length; $\\times2$ is always $30\\%$ of a decade.' } }),
      R(md`
        ### The model: the decibel

        $$|H|_{\text{dB}} = 20\log_{10}|H|$$
        Where the 20 comes from: the bel measures a **power** ratio, $\log_{10}(P_2/P_1)$, and the decibel is a tenth of a bel, $10\log_{10}(P_2/P_1)$. Power goes as voltage squared, so for a voltage gain $10\log_{10}|H|^2 = 20\log_{10}|H|$. Every gain in this course is a voltage (or current) ratio: always use 20.

        Assumptions: none. This is a change of scale, exact for every number.
      `),
      R(md`
        ### The derivation: two facts and one rule

        **The rule:** logs turn products into sums, $\log_{10}(ab) = \log_{10}a + \log_{10}b$. So the dB of a product is the sum of the dBs.

        **The two facts:** $20\log_{10}10 = 20\,\text{dB}$, and $20\log_{10}2 = 20\times0.30103 = 6.02\,\text{dB}$. From these, $\sqrt2$ is half of $6$, about $3\,\text{dB}$, and $\sqrt{10}$ is half of $20$, exactly $10\,\text{dB}$.

        | $\lvert H\rvert$ | Built as | dB |
        |---|---|---|
        | $1$ | | $0$ |
        | $\sqrt2 = 1.41$ | half of $\times2$ | $3$ |
        | $2$, $4$, $8$ | $2$, $2^2$, $2^3$ | $6$, $12$, $18$ |
        | $5$ | $10/2$ | $20 - 6 = 14$ |
        | $10$, $100$, $1000$ | | $20$, $40$, $60$ |
        | $50$ | $100/2$ | $34$ |
        | $0.707$ | $1/\sqrt2$ | $-3$ |
        | $0.5$, $0.1$, $0.01$ | | $-6$, $-20$, $-40$ |

        **Power laws become straight lines.** Suppose $|H| = K\omega^n$. Then
        $$20\log_{10}|H| = 20\log_{10}K + 20n\log_{10}\omega$$
        Plotted against $\log_{10}\omega$ (the ruler), this is a straight line. Moving one decade to the right adds 1 to $\log_{10}\omega$, so the line rises by $20n\,\text{dB}$.

        !!key Slopes on a Bode plot
          $$|H|\propto\omega^n\quad\Longleftrightarrow\quad\text{a straight line of slope }20n\ \text{dB/decade}\ (= 6.02n\ \text{dB/octave})$$
          A gain falling as $1/\omega$ is $-20\,\text{dB/dec}$ ($-6\,\text{dB}$ per octave); as $1/\omega^2$, $-40\,\text{dB/dec}$.
      `),
      RF(md`
        [[fig:pow]]

        ### Check it

        - $|H| = 1$ is $0\,\text{dB}$; a gain below 1 is a **negative** number of dB ($0.1\to-20\,\text{dB}$); a gain above 1 is positive. ✓
        - $20\log_{10}(1/\sqrt2) = -10\log_{10}2 = -3.01\,\text{dB}$: the "$-3\,\text{dB}$" of [the RC low-pass](#/l/bk10-rc). ✓
        - $20\,\text{dB/dec}$ in octaves: $20\times\log_{10}2 = 6.02\,\text{dB}$ per octave, the lecture's "$+6\,\text{dB}$/octave". ✓

        ### What it means

        On these axes a cascade of stages is a **sum**: the overall gain in dB is the sum of the stages' (loaded) gains in dB. And any piece of a response that behaves like a power of $\omega$ is a straight line whose slope you can read off with a ruler. That is why Bode plots are drawn with straight lines.
      `, { pow: { svg: powFig, cap: 'Power laws are straight lines on log-log axes: $\\omega^{+1}$, $\\omega^0$, $\\omega^{-1}$, $\\omega^{-2}$ have slopes $+20$, $0$, $-20$, $-40\\,\\text{dB/dec}$.' } }),
      R(md`
        ### How to recognize it

        Factor the number into powers of ten and twos (and $\sqrt{10}$ for the odd $10\,\text{dB}$), and add: $400 = 100\times2\times2\to40 + 6 + 6 = 52\,\text{dB}$. Backwards, split the dB into twenties and sixes: $46\,\text{dB} = 40 + 6\to100\times2 = 200$.

        ### Worked example: a chain

        Three stages have loaded gains $-10$, $5$ and $0.4$. Overall: $|A| = 10\times5\times0.4 = 20$, which is $26\,\text{dB}$. In dB, stage by stage: $20 + 14 + (12 - 20) = 20 + 14 - 8 = 26\,\text{dB}$ ($0.4 = 4/10$). The same number, by adding. The one minus sign adds $180^\circ$ of phase and nothing to the magnitude.
      `),
      R(md`
        !!mistake Common mistakes
          - **$10\log_{10}$ for a voltage gain.** That is the power rule; a voltage ratio uses $20\log_{10}$.
          - **The natural log.** Decibels use $\log_{10}$.
          - **A gain below 1 as positive dB.** $0.5$ is $-6\,\text{dB}$.
          - **The dB of a negative gain.** Use $|A|$; the sign is phase ($180^\circ$), not magnitude.
          - **Decades versus octaves.** $-20\,\text{dB}$ per decade is $-6\,\text{dB}$ per octave.
      `),
      Q(md`A gain of $500$ is how many decibels?`,
        ['$54\\,\\text{dB}$', '$27\\,\\text{dB}$', '$50\\,\\text{dB}$', '$60\\,\\text{dB}$'], 0,
        [null, 'That is $10\\log_{10}500$, the power rule.', '$50\\,\\text{dB}$ is $316$.', '$60\\,\\text{dB}$ is $1000$; $500$ is half of that, $6\\,\\text{dB}$ less.'],
        md`$500 = 1000/2$: $60 - 6 = 54\,\text{dB}$.`),
      Q(md`A gain falls as $1/\omega$. How many dB does it lose per octave?`,
        ['About $6\\,\\text{dB}$', '$20\\,\\text{dB}$', '$3\\,\\text{dB}$', '$12\\,\\text{dB}$'], 0,
        [null, '$20\\,\\text{dB}$ is per **decade** ($\\times10$ in frequency).', '$3\\,\\text{dB}$ is the drop at a single pole\'s corner, not a slope.', '$12\\,\\text{dB}$ per octave is $1/\\omega^2$.'],
        md`Doubling $\omega$ halves $|H|$: $20\log_{10}2 = 6.02\,\text{dB}$ per octave, the same slope as $20\,\text{dB}$ per decade.`),
      Q(md`On a log frequency axis, a tick sits $70\%$ of the way from $10^4$ to $10^5$. What frequency is it?`,
        ['$5\\times10^4$', '$7\\times10^4$', '$7.7\\times10^4$', '$3\\times10^4$'], 0,
        [null, 'On a log axis position is $\\log_{10}$: $10^{4.7}$, not $7\\times10^4$.', 'Equal distances are equal ratios: $10^{0.7} = 5$.', '$3\\times10^4$ sits at $48\\%$.'],
        md`$10^{4 + 0.7} = 10^{0.7}\times10^4 = 5.0\times10^4$ ($\log_{10}5 = 0.699$).`),
      P({
        id: 'bk11-db-a', title: 'Into decibels',
        q: md`Convert to dB without a calculator: (a) $316$, (b) $0.05$.`,
        parts: [K.plain('(a)', 20 * L10(316), 'dB', { tol: { abs: 0.3 } }), K.plain('(b)', 20 * L10(0.05), 'dB', { tol: { abs: 0.3 }, traps: [{ v: 26, msg: 'A gain below 1 is **negative** dB.' }] })],
        hints: [md`$316\approx10^{2.5} = 100\sqrt{10}$. $0.05 = 0.1/2$.`],
        sol: md`(a) $316\approx100\times\sqrt{10}$: $40 + 10 = 50\,\text{dB}$ (exactly $49.99$). (b) $0.05 = 0.1/2$: $-20 - 6 = -26\,\text{dB}$.`,
      }),
      P({
        id: 'bk11-db-b', title: 'Out of decibels',
        q: md`Convert to plain ratios: (a) $46\,\text{dB}$, (b) $-14\,\text{dB}$.`,
        parts: [K.plain('(a)', 10 ** (46 / 20), 'V/V', { traps: [{ v: 10 ** 4.6, msg: 'Divide by 20, not 10: $10^{46/20}$.' }] }), K.plain('(b)', 10 ** (-14 / 20), 'V/V')],
        hints: [md`$46 = 40 + 6$; $-14 = 6 - 20$.`],
        sol: md`(a) $46 = 40 + 6\to100\times2 = 200$ (exactly $199.5$). (b) $-14 = 6 - 20\to2/10 = 0.2$ (exactly $0.1995$).`,
      }),
      P({
        id: 'bk11-db-c', title: 'A chain of stages',
        q: md`Three stages have loaded gains $-10$, $5$ and $0.4$. Find the overall $|A|$ and its value in dB.`,
        parts: [K.plain('|A|', 20, 'V/V', { traps: [{ v: 4.6, msg: 'Gains multiply; only dB values add.' }] }), K.plain('|A|_{dB}', 20 * L10(20), 'dB', { tol: { abs: 0.3 } })],
        hints: [md`Multiply the gains, or add their dB: $20$, $14$, $-8$.`],
        sol: md`$|A| = 10\times5\times0.4 = 20\to26\,\text{dB}$; stage by stage, $20 + 14 - 8 = 26\,\text{dB}$.`,
      }),
      P({
        id: 'bk11-db-d', title: 'Slopes',
        q: md`A gain falls as $1/\omega^2$. What is its slope in dB per decade, and in dB per octave?`,
        parts: [K.plain('\\text{per decade}', -40, 'dB/dec', { tol: { abs: 0.3 } }), K.plain('\\text{per octave}', -40 * L10(2), 'dB/oct', { tol: { abs: 0.2 }, traps: [{ v: -6.02, msg: 'That is for $1/\\omega$. Squared: twice as steep.' }] })],
        hints: [md`$|H|\propto\omega^{-2}$: slope $20n$ dB/dec with $n = -2$; an octave is $0.301$ decade.`],
        sol: md`$n = -2$: $-40\,\text{dB/dec}$; per octave $-40\times0.301 = -12.04\,\text{dB}$ (each doubling of $\omega$ quarters the gain).`,
      }),
      P({
        id: 'bk11-db-e', title: 'Exam style: walking down a slope',
        q: md`An amplifier's gain is $60\,\text{dB}$ at low frequency; from $10^5\,\text{rad/s}$ on, its straight-line gain falls at $-20\,\text{dB/dec}$. Find the straight-line gain (as a ratio) at $10^6$ and $10^7\,\text{rad/s}$, and the frequency where the straight line reaches $0\,\text{dB}$.`,
        parts: [K.plain('|A|\\ \\text{at}\\ 10^6', 100, 'V/V'), K.plain('|A|\\ \\text{at}\\ 10^7', 10, 'V/V'), K.wPart('\\omega\\ (0\\,\\text{dB})', 1e8, { traps: [{ v: 1e6, msg: '$60\\,\\text{dB}$ at $-20\\,\\text{dB/dec}$ takes **three** decades.' }] })],
        hints: [md`Each decade above $10^5$ takes off $20\,\text{dB}$.`],
        sol: md`One decade above the corner: $60 - 20 = 40\,\text{dB} = 100$. Two decades: $20\,\text{dB} = 10$. $0\,\text{dB}$ after $60/20 = 3$ decades: $10^8\,\text{rad/s}$.`,
      }),
      G('bk_db', { need: 6 }),
    ],
  });

  // ================================================================ 2. one pole, derived
  const pole1 = { k: 10, poles: [1e3] };
  const errMag = K.lplot({ wmin: 0.01, wmax: 100, y: [-3.5, 0.5], yt: [-3, -2, -1, 0], xl: '\\omega/\\omega_p', yl: '\\text{error (dB)}', h: 200,
    curves: [{ f: (x) => -10 * L10(1 + x * x) + (x > 1 ? 20 * L10(x) : 0) }], marks: [{ w: 1, n: '\\omega_p' }],
    pts: [{ w: 1, y: -3.0103, n: '-3\\,\\text{dB}', side: 'dr' }, { w: 2, y: -0.969, n: '-1\\,\\text{dB}', side: 'dr' }, { w: 0.5, y: -0.969, n: '-1', side: 'dl' }] });
  const slPh = (x) => (x <= 0.1 ? 0 : x >= 10 ? -90 : -45 * (1 + L10(x)));
  const errPh = K.lplot({ wmin: 0.01, wmax: 100, y: [-7, 7], yt: [-6, -3, 0, 3, 6], xl: '\\omega/\\omega_p', yl: '\\text{line} - \\text{exact}\\ (^\\circ)', h: 200,
    curves: [{ f: (x) => slPh(x) + Math.atan(x) * DEG }], hlines: [{ y: 0 }], marks: [{ w: 0.1, n: '0.1\\omega_p' }, { w: 10, n: '10\\omega_p' }],
    pts: [{ w: 0.1, y: 5.71, n: '5.7^\\circ', side: 'ul' }, { w: 10, y: -5.71, n: '-5.7^\\circ', side: 'dr' }] });
  L({
    id: 'bk11-pole', title: 'One pole, derived', ref: 'Lectures 25, 27',
    steps: [
      R(md`
        ### The question

        Every Bode plot on the exam is a stack of single factors, and the pole is the one that matters most. For
        $$H(s) = \frac{A_{dc}}{1 + s/\omega_p}$$
        we want the magnitude and phase on log axes: exactly, with straight lines that are quick to draw, and with a clear idea of how wrong the lines are. Lecture 25 drew the magnitude; Lecture 27 derived the phase rules. Here is every step.
      `),
      R(md`
        ### The physical picture

        Put $s = j\omega$ and $x = \omega/\omega_p$. The denominator $1 + jx$ is [the triangle](#/l/bk10-complex) with legs 1 and $x$, and the magnitude of $H$ is $|A_{dc}|$ divided by its hypotenuse.

        - **Low frequency** ($x\ll1$): a flat triangle. The hypotenuse is about 1, the angle about $0$: $H\approx A_{dc}$.
        - **High frequency** ($x\gg1$): a tall triangle. The hypotenuse is about $x$: $|H|\approx|A_{dc}|/x$, falling as $1/\omega$, and the angle is about $90^\circ$.
        - **At the corner** ($x = 1$): the isosceles triangle, $\sqrt2$ and $45^\circ$.

        In circuit terms (the [common source with $C_L$](#/l/bk10-amp)): below $\omega_p$ the load resistor takes the current; above it the capacitor does.
      `),
      R(md`
        ### The magnitude, derived

        $$|H|_{\text{dB}} = 20\log_{10}\frac{|A_{dc}|}{\sqrt{1 + x^2}} = 20\log_{10}|A_{dc}| - 10\log_{10}(1 + x^2)$$
        (because $20\log_{10}\sqrt{u} = 10\log_{10}u$).

        **Low-frequency asymptote.** For $x\ll1$, $1 + x^2\approx1$ and $\log_{10}1 = 0$:
        $$|H|_{\text{dB}}\approx20\log_{10}|A_{dc}|\qquad\text{(a horizontal line)}$$
        **High-frequency asymptote.** For $x\gg1$, $1 + x^2\approx x^2$:
        $$|H|_{\text{dB}}\approx20\log_{10}|A_{dc}| - 20\log_{10}\omega + 20\log_{10}\omega_p\qquad\text{(slope }-20\ \text{dB/decade)}$$
        **Where they meet.** Set them equal: $20\log_{10}(\omega/\omega_p) = 0$, so $\omega = \omega_p$. The two lines meet exactly at the pole: that is why $\omega_p$ is called the **corner** (or break) frequency.

        **How far the real curve is from the lines.** Below the corner the error is $e = -10\log_{10}(1 + x^2)$; above it, $e = -10\log_{10}(1 + x^2) + 20\log_{10}x = -10\log_{10}(1 + 1/x^2)$. So $e(x) = e(1/x)$: the error is **symmetric** about the corner, in decades.

        | $x$ | $0.1$ or $10$ | $0.5$ or $2$ | $1$ |
        |---|---|---|---|
        | exact $-$ straight line | $-0.04\,\text{dB}$ | $-0.97\,\text{dB}$ | $-3.01\,\text{dB}$ |

        **The $-3\,\text{dB}$ frequency.** $|H| = |A_{dc}|/\sqrt2$ means $1 + x^2 = 2$, so $x = 1$: for a single pole $\omega_{-3\text{dB}} = \omega_p$ exactly.

        !!key One pole: magnitude
          Flat at $20\log_{10}|A_{dc}|$ up to $\omega_p$, then $-20\,\text{dB/decade}$. The real curve is $3\,\text{dB}$ under the corner, about $1\,\text{dB}$ under the lines an octave either side, and on them a decade away.
      `),
      RF(md`
        [[fig:err]]

        ### The phase, derived (Lecture 27)

        $$\angle H = \angle A_{dc} - \tan^{-1}\frac{\omega}{\omega_p},\qquad \angle A_{dc} = \begin{cases}0^\circ & A_{dc} > 0\\ 180^\circ & A_{dc} < 0\end{cases}$$
        Take $A_{dc} > 0$. The simple cases: $\omega = 0$ gives $0^\circ$; $\omega = \omega_p$ gives $-45^\circ$; $\omega\to\infty$ gives $-90^\circ$.

        The lecture's two approximations:
        - **At $\omega = 0.1\,\omega_p$:** $-\tan^{-1}0.1 = -5.7^\circ\approx0$. So the pole has (almost) no influence on the phase below $\omega_p/10$.
        - **At $\omega = 10\,\omega_p$:** $-\tan^{-1}10 = -84.3^\circ\approx-90^\circ$. So above $10\,\omega_p$ the pole contributes its full $-90^\circ$.

        Join the two points $(0.1\,\omega_p, 0^\circ)$ and $(10\,\omega_p, -90^\circ)$ with a straight line on the log axis. It drops $90^\circ$ over two decades, $-45^\circ$ per decade:
        $$\angle H_{\text{line}} = -45^\circ\left(1 + \log_{10}\frac{\omega}{\omega_p}\right)\qquad(0.1\,\omega_p\le\omega\le10\,\omega_p)$$
        At $\omega = \omega_p$ it gives $-45^\circ$: exact at the centre. Its worst error is $5.7^\circ$, at the two ends; in between it is never more than $5.3^\circ$ off (near $0.4\,\omega_p$ and $2.5\,\omega_p$).

        [[fig:ph]]

        !!key One pole: phase
          $0^\circ$ up to $0.1\,\omega_p$; $-45^\circ$ per decade through $-45^\circ$ at $\omega_p$; $-90^\circ$ from $10\,\omega_p$ on. Add $180^\circ$ if $A_{dc} < 0$. The phase starts a decade **before** the magnitude corner and finishes a decade after.
      `, { err: { svg: errMag, cap: 'The magnitude error of the straight lines: $-3\\,\\text{dB}$ at the corner, about $-1\\,\\text{dB}$ an octave away, symmetric in decades.' }, ph: { svg: errPh, cap: 'The phase error of the straight lines: at most $5.7^\\circ$, at $0.1\\,\\omega_p$ and $10\\,\\omega_p$.' } }),
      RF(md`
        [[fig:pole]]

        ### Check it

        - $A_{dc} = 10$, $\omega_p = 10^3$: flat at $20\,\text{dB}$; at $10^4$ the line is at $0\,\text{dB}$ and the exact value $20 - 10\log_{10}101 = -0.04\,\text{dB}$. ✓
        - A negative $A_{dc}$ changes nothing in the magnitude ($|{-A}| = A$) and adds $180^\circ$ at every frequency: the phase runs from $180^\circ$ down to $90^\circ$ (the same as $-180^\circ$ to $-270^\circ$). ✓
        - The magnitude and phase "know" each other: wherever the magnitude falls at $-20\,\text{dB/dec}$ for a long stretch, the phase sits near $-90^\circ$.

        ### What it means

        The magnitude bends **at** the corner, sharply. The phase is a slow, spread-out effect: it starts changing a decade early and is still changing a decade late. That is why a pole far above the frequency you care about still costs a few degrees of phase there, and why phase plots of real amplifiers are rarely flat.
      `, { pole: plot(pole1, { show: 'both', marks: [{ w: 1e2, n: '0.1\\omega_p' }, { w: 1e3, n: '\\omega_p' }, { w: 1e4, n: '10\\omega_p' }], pts: [{ w: 1e3, on: 'exact', n: '-3\\,\\text{dB}', side: 'dl' }], cap: '$H(s) = 10/(1 + s/10^3)$. Solid: the straight lines. Dashed: the exact curves.' }) }),
      R(md`
        ### How to recognize it

        A factor $(1 + s/\omega_p)$ downstairs: a knee at $\omega_p$ that tips the magnitude down by $20\,\text{dB/dec}$, and a $90^\circ$ phase drop spread over the two decades centred on $\omega_p$.

        ### Worked example

        $$H(s) = \frac{50}{1 + s/(2\times10^5)}$$
        1. **Flat level:** $20\log_{10}50 = 34\,\text{dB}$ ($50 = 100/2$), up to the corner at $2\times10^5\,\text{rad/s}$.
        2. **A decade above** ($2\times10^6$): the line is at $34 - 20 = 14\,\text{dB}$; exactly $33.98 - 10\log_{10}101 = 13.94\,\text{dB}$.
        3. **Phase:** $0^\circ$ up to $2\times10^4$, $-45^\circ$ at $2\times10^5$, $-90^\circ$ from $2\times10^6$ (exactly $-84.3^\circ$ there).
        4. **Where the line reaches $0\,\text{dB}$:** $34\,\text{dB}$ at $20\,\text{dB/dec}$ takes $1.7$ decades: $2\times10^5\times10^{1.7} = 2\times10^5\times50 = 10^7\,\text{rad/s}$, the gain-bandwidth product $A_{dc}\omega_p$. Exactly, $\omega_p\sqrt{50^2 - 1} = 9.998\times10^6\,\text{rad/s}$.
      `),
      R(md`
        !!mistake Common mistakes
          - **The $-3\,\text{dB}$ point somewhere else.** For one pole it is exactly at $\omega_p$.
          - **Starting the phase ramp at $\omega_p$.** It starts at $0.1\,\omega_p$ and ends at $10\,\omega_p$.
          - **$-20\,\text{dB}$ per octave.** It is per **decade** ($-6\,\text{dB}$ per octave).
          - **Forgetting the $180^\circ$** of a negative gain; or drawing the magnitude of $-A$ as negative dB.
      `),
      Q(md`$H(s) = \dfrac{10}{1 + s/10^3}$. What is the straight-line phase at $\omega = 10^4\,\text{rad/s}$, and the exact one?`,
        ['$-90^\\circ$ (exact $-84.3^\\circ$)', '$-45^\\circ$ (exact $-45^\\circ$)', '$-84.3^\\circ$ on both', '$0^\\circ$ (exact $-5.7^\\circ$)'], 0,
        [null, '$-45^\\circ$ is at the corner, $10^3$.', 'The straight line has reached $-90^\\circ$ at $10\\omega_p$; only the exact curve is at $-84.3^\\circ$.', 'That is at $0.1\\,\\omega_p = 10^2$.'],
        md`$10^4 = 10\,\omega_p$: the ramp has finished at $-90^\circ$; exactly, $-\tan^{-1}10 = -84.3^\circ$.`),
      Q(md`At the corner of a single pole, the exact magnitude is...`,
        ['$3\\,\\text{dB}$ below the point where the two lines meet', 'exactly on the lines', '$3\\,\\text{dB}$ above it', '$6\\,\\text{dB}$ below it'], 0,
        [null, 'The lines are an approximation; the corner is where they are worst.', 'A pole pulls the real curve **under** the lines.', '$|1 + j| = \\sqrt2$, which is $3\\,\\text{dB}$, not $6$.'],
        md`$1/|1 + j| = 1/\sqrt2$: $-3\,\text{dB}$ from the flat level, which is where the lines meet.`),
      Q(md`Below which frequency can a pole at $\omega_p$ be ignored in the **phase** (straight-line rule)?`,
        ['$0.1\\,\\omega_p$', '$\\omega_p$', '$10\\,\\omega_p$', 'It always matters'], 0,
        [null, 'At $\\omega_p$ it already contributes $-45^\\circ$.', 'Above $10\\,\\omega_p$ it contributes its full $-90^\\circ$.', 'Below $0.1\\,\\omega_p$ it contributes less than $5.7^\\circ$: the rule calls that zero.'],
        md`$\tan^{-1}0.1 = 5.7^\circ$: Lecture 27's rule treats the pole's phase as $0$ below $\omega_p/10$.`),
      P({
        id: 'bk11-pole-a', title: 'Lines and exact values',
        q: md`$H(s) = \dfrac{100}{1 + s/10^4}$. Find the straight-line $|H|_{\text{dB}}$ at $10^6\,\text{rad/s}$, the exact $|H|_{\text{dB}}$ at $10^4\,\text{rad/s}$, and the straight-line phase at $10^5\,\text{rad/s}$.`,
        parts: [K.plain('|H|_{dB}\\ (10^6,\\ \\text{line})', 0, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 20, msg: 'Two decades above the corner: $40 - 40$.' }] }),
          K.plain('|H|_{dB}\\ (10^4,\\ \\text{exact})', 40 - 10 * L10(2), 'dB', { tol: { abs: 0.1 }, traps: [{ v: 40, msg: 'That is the straight line; at the corner the curve is $3\\,\\text{dB}$ lower.' }, { v: 34, msg: '$|1 + j| = \\sqrt2$ is $3\\,\\text{dB}$, not $6$.' }] }),
          K.plain('\\angle H\\ (10^5,\\ \\text{line})', -90, '°', { tol: { abs: 1 } })],
        hints: [md`Flat at $40\,\text{dB}$ to $10^4$, then $-20\,\text{dB/dec}$.`],
        sol: md`Line at $10^6$: two decades above the corner, $40 - 40 = 0\,\text{dB}$. Exact at the corner: $40 - 3.01 = 36.99\,\text{dB}$. Phase at $10^5 = 10\,\omega_p$: the ramp has finished, $-90^\circ$ (exact $-84.3^\circ$).`,
      }),
      P({
        id: 'bk11-pole-b', title: 'The error an octave away',
        q: md`For a single pole, how far (in dB, with sign) is the exact magnitude from the straight lines at $\omega = 2\,\omega_p$, and at $\omega = \omega_p/2$?`,
        parts: [K.plain('e(2\\omega_p)', -10 * L10(1.25), 'dB', { tol: { abs: 0.05 } }), K.plain('e(\\omega_p/2)', -10 * L10(1.25), 'dB', { tol: { abs: 0.05 } })],
        hints: [md`Above the corner $e = -10\log_{10}(1 + 1/x^2)$; below it $e = -10\log_{10}(1 + x^2)$.`],
        sol: md`At $x = 2$: $-10\log_{10}(1 + 1/4) = -0.97\,\text{dB}$. At $x = 1/2$: $-10\log_{10}(1 + 1/4) = -0.97\,\text{dB}$. The same: the error is symmetric about the corner.`,
      }),
      P({
        id: 'bk11-pole-c', title: 'Phase half-way to the corner',
        q: md`At $\omega = 0.5\,\omega_p$, find the straight-line phase and the exact phase of $1/(1 + s/\omega_p)$.`,
        parts: [K.plain('\\text{line}', -45 * (1 + L10(0.5)), '°', { tol: { abs: 0.5 } }), K.plain('\\text{exact}', -Math.atan(0.5) * DEG, '°', { tol: { abs: 0.3 } })],
        hints: [md`Line: $-45^\circ(1 + \log_{10}0.5)$; exact: $-\tan^{-1}0.5$.`],
        sol: md`Line: $-45^\circ(1 - 0.301) = -31.5^\circ$. Exact: $-\tan^{-1}0.5 = -26.6^\circ$. The line is $4.9^\circ$ too low here.`,
      }),
      P({
        id: 'bk11-pole-d', title: 'An inverting pole',
        q: md`$H(s) = \dfrac{-20}{1 + s/10^6}$. Give the straight-line phase at $10^5$, $10^6$ and $10^7\,\text{rad/s}$ (take the $-20$ as $+180^\circ$).`,
        parts: [K.plain('10^5', 180, '°', { tol: { abs: 1 }, accept: [-180] }), K.plain('10^6', 135, '°', { tol: { abs: 1 }, accept: [-225] }), K.plain('10^7', 90, '°', { tol: { abs: 1 }, accept: [-270], traps: [{ v: -90, msg: 'Add the $180^\\circ$ of the negative constant.' }] })],
        hints: [md`$180^\circ$ from the constant, minus the pole's ramp.`],
        sol: md`$180^\circ - 0 = 180^\circ$ at $10^5 = 0.1\,\omega_p$; $180^\circ - 45^\circ = 135^\circ$ at the corner; $180^\circ - 90^\circ = 90^\circ$ at $10\,\omega_p$.`,
      }),
      P({
        id: 'bk11-pole-e', title: 'Exam style: a common source on a Bode plot',
        q: md`A common source has $A_v(s) = \dfrac{-40}{1 + s/10^8}$. Find $|A_v(0)|$ in dB, the straight-line $|A_v|_{\text{dB}}$ at $10^9\,\text{rad/s}$, the straight-line unity-gain frequency, and the exact one.`,
        parts: [K.plain('|A_v(0)|_{dB}', 20 * L10(40), 'dB', { tol: { abs: 0.3 } }), K.plain('|A_v|_{dB}\\ (10^9)', 20 * L10(40) - 20, 'dB', { tol: { abs: 0.3 } }),
          K.wPart('\\omega_u\\ (\\text{line})', 4e9, { traps: [{ v: 1e8, msg: 'That is the corner.' }] }), K.wPart('\\omega_u\\ (\\text{exact})', 1e8 * Math.sqrt(1599))],
        hints: [md`$40 = 10\times4$: $32\,\text{dB}$. It falls $20\,\text{dB/dec}$ above $10^8$.`, md`Exact: $40/\sqrt{1 + x^2} = 1$.`],
        sol: md`$|A_v(0)| = 40\to20 + 12 = 32\,\text{dB}$. At $10^9$, one decade above: $12\,\text{dB}$. The line reaches $0\,\text{dB}$ $32/20 = 1.6$ decades above $10^8$: $10^8\times10^{1.6} = 4\times10^9\,\text{rad/s}$ $(= g_mR\,\omega_p)$. Exactly: $1 + x^2 = 1600$, $x = \sqrt{1599} = 39.99$, $\omega_u = 3.999\times10^9\,\text{rad/s}$.`,
      }),
      G('bk_pole', { need: 4 }),
      G('bk_unity', { need: 3, kind: 'one' }),
    ],
  });

  // ================================================================ 3. one zero, the right-half-plane zero, s at the origin
  const mirrorFig = (() => {
    const p = new K.Pic(), ox = 40, oy = 110, u = 70;
    p.arrow(ox - 10, oy, ox + 2.2 * u, oy, 'dim').lab(ox + 2.2 * u + 6, oy, '\\text{Re}', 'l');
    p.line(ox + u, oy, ox + u, oy - u * 1.2, 'dash').line(ox + u, oy, ox + u, oy + u * 1.2, 'dash');
    p.arrow(ox, oy, ox + u, oy - u * 1.2, '', 'stroke:var(--accent);stroke-width:2.2', 9).arrow(ox, oy, ox + u, oy + u * 1.2, '', 'stroke:var(--dim);stroke-width:2.2', 9);
    p.lab(ox + u + 6, oy - u * 1.2, '1 + jx', 'l').lab(ox + u + 6, oy + u * 1.2, '1 - jx', 'l').lab(ox + 28, oy - 8, '+\\theta', 'bl').lab(ox + 28, oy + 8, '-\\theta', 'tl');
    return p.svg(260);
  })();
  const zero1 = { k: 1, zeros: [1e3] }, rhp1 = { k: 1, rhp: [1e3] }, orig1 = { k: 1, origin: 1, w0: 1e3 }, hp1 = { k: 1, origin: 1, w0: 1e3, poles: [1e3] };
  L({
    id: 'bk11-zero', title: 'One zero, the right-half-plane zero, and $s$ at the origin', ref: 'Lecture 27',
    steps: [
      R(md`
        ### The question

        Real transfer functions have zeros as well as poles. The common source has a right-half-plane zero at $g_m/C_{gd}$ ([Chapter 12](#/l/bk12-exact)); a coupling capacitor puts an $s$ in the numerator ([Chapter 10](#/l/bk10-hp)); a bypassed source or emitter resistor gives an ordinary zero. Each is a small change to the one-pole picture, and each shows up on Bode questions as a trap.
      `),
      R(md`
        ### One zero (Lecture 27)

        $$H(s) = A_{dc}\,(1 + s/\omega_z),\qquad |H| = |A_{dc}|\sqrt{1 + (\omega/\omega_z)^2}$$
        **The picture:** a zero is a pole turned upside down. $\left|\frac{1}{1 + jx}\right| = \frac{1}{|1 + jx|}$ and $\angle\frac{1}{1 + jx} = -\angle(1 + jx)$, so in dB and degrees every rule of [the pole](#/l/bk11-pole) flips sign.

        **The derivation, as in the notes.**
        - If $\omega\ll\omega_z$: $|H|_{\text{dB}}\approx20\log_{10}|A_{dc}|$.
        - If $\omega\gg\omega_z$: $|H|_{\text{dB}} = 20\log_{10}|A_{dc}| + 20\log_{10}\omega - 20\log_{10}\omega_z$: the magnitude **rolls up at $+20\,\text{dB/decade}$** ($+6\,\text{dB}$/octave).
        - At $\omega_z$ the exact curve is $3\,\text{dB}$ **above** the corner of the lines.

        **Phase:** $\angle H = \angle A_{dc} + \tan^{-1}(\omega/\omega_z)$: "the same as a pole, with a positive phase shift". Straight line: $0^\circ$ up to $0.1\,\omega_z$, $+45^\circ$ per decade through $+45^\circ$ at $\omega_z$, $+90^\circ$ from $10\,\omega_z$.
      `),
      RF(md`
        [[fig:z]]

        ### The right-half-plane zero: magnitude of a zero, phase of a pole

        $$H(s) = 1 - s/\omega_z$$
        Its arrow $1 - jx$ is the mirror image of $1 + jx$ below the real axis: the **same length**, the **opposite angle**.

        [[fig:mir]]

        $$|1 - jx| = \sqrt{1 + x^2},\qquad \angle(1 - jx) = -\tan^{-1}x$$
        So the magnitude rises at $+20\,\text{dB/dec}$ exactly like an ordinary zero, while the phase goes **down** to $-90^\circ$ like a pole. The magnitude plot alone cannot tell the two apart; the phase plot can. The name: the zero, the root of $1 - s/\omega_z$, sits at $s = +\omega_z$, in the right half of the $s$-plane.

        Where it comes from: in the common source, $C_{gd}$ carries a current straight from the input to the output, in the opposite sense to the transistor's $g_mv_{gs}$. At $s = g_m/C_{gd}$ the two cancel exactly, so the zero is at $s = +g_m/C_{gd}$ ([Chapter 12](#/l/bk12-exact)).
      `, { z: plot(zero1, { show: 'both', marks: [{ w: 1e3, n: '\\omega_z' }], cap: '$H(s) = 1 + s/10^3$: the mirror image of a pole.' }), mir: { svg: mirrorFig, cap: '$1 + jx$ and $1 - jx$: equal lengths, opposite angles.' } }),
      RF(md`
        [[fig:r]]

        ### $s$ at the origin

        $$H(s) = \frac{s}{\omega_0}:\qquad |H| = \frac{\omega}{\omega_0},\qquad \angle H = +90^\circ$$
        A power law with $n = 1$, so on log axes [a straight line](#/l/bk11-db) of slope $+20\,\text{dB/dec}$ **at every frequency**, crossing $0\,\text{dB}$ at $\omega = \omega_0$. There is no corner and no approximation: the straight line is exact. Its phase is $+90^\circ$ everywhere (multiplying by $j$). A pole at the origin, $1/s$ (an integrator), is the opposite: $-20\,\text{dB/dec}$ through $0\,\text{dB}$ at $\omega_0$, and $-90^\circ$.

        Combined with a pole it is [the high-pass](#/l/bk10-hp):
        $$H(s) = \frac{s/\omega_L}{1 + s/\omega_L}$$
        Below $\omega_L$ the $s$ makes the magnitude rise at $+20\,\text{dB/dec}$; at $\omega_L$ the pole's $-20$ cancels it, and the plot is flat at $0\,\text{dB}$ above. The phase runs from $+90^\circ$ down to $0^\circ$.

        [[fig:hp]]
      `, { r: plot(rhp1, { show: 'both', marks: [{ w: 1e3, n: '\\omega_z' }], cap: '$H(s) = 1 - s/10^3$: it rises like a zero and lags like a pole.' }), hp: plot(hp1, { show: 'both', marks: [{ w: 1e3, n: '\\omega_L' }], cap: '$H(s) = (s/10^3)/(1 + s/10^3)$: $+20\\,\\text{dB/dec}$, then flat at $0\\,\\text{dB}$.' }) }),
      R(md`
        ### Check it

        - $H = 10(1 + s/10^3)$ at $10^4$: line $20 + 20 = 40\,\text{dB}$; exact $20 + 10\log_{10}101 = 40.04\,\text{dB}$; phase $+84.3^\circ$ exactly, $+90^\circ$ on the line. ✓
        - The same with $1 - s/10^3$: identical magnitudes, phase $-84.3^\circ$. ✓
        - $s/10^3$ at $10^5$: $\omega/\omega_0 = 100$, $+40\,\text{dB}$, at every frequency the line is exact. ✓

        ### What it means and how to recognize it

        | Factor | Magnitude (straight line) | Phase (straight line) |
        |---|---|---|
        | $1/(1 + s/\omega_p)$ | flat, then $-20\,\text{dB/dec}$ from $\omega_p$ | $0\to-90^\circ$ over $0.1\omega_p\ldots10\omega_p$ |
        | $1 + s/\omega_z$ | flat, then $+20\,\text{dB/dec}$ from $\omega_z$ | $0\to+90^\circ$ over $0.1\omega_z\ldots10\omega_z$ |
        | $1 - s/\omega_z$ | flat, then $+20\,\text{dB/dec}$ from $\omega_z$ | $0\to-90^\circ$ over $0.1\omega_z\ldots10\omega_z$ |
        | $s/\omega_0$ | $+20\,\text{dB/dec}$ everywhere, $0\,\text{dB}$ at $\omega_0$ | $+90^\circ$ |
        | $-1$ | $0\,\text{dB}$ | $180^\circ$ |

        The magnitude only sees the **length** of each factor; the phase sees its **direction**. That is why a negative constant and a right-half-plane zero are invisible on a magnitude plot.
      `),
      R(md`
        !!mistake Common mistakes
          - **A right-half-plane zero whose magnitude falls.** It rises, like any zero; only its phase goes down.
          - **A right-half-plane zero whose phase rises.** It falls, like a pole.
          - **Treating $s$ as a corner at $\omega = 1$.** An $s$ alone has no corner: it is a $+20\,\text{dB/dec}$ line through $0\,\text{dB}$ at $\omega_0$ (at $\omega = 1$ only when it is written as plain $s$).
          - **A zero's exact curve under the lines.** A zero's real curve is **above** its lines, $3\,\text{dB}$ at the corner.
      `),
      Q(md`Two magnitude plots are identical: one is $1 + s/\omega_z$, the other $1 - s/\omega_z$. How do you tell them apart?`,
        ['By the phase: the right-half-plane zero goes to $-90^\\circ$, the ordinary zero to $+90^\\circ$', 'The right-half-plane zero falls at $-20\\,\\text{dB/dec}$', 'You cannot: they are the same function', 'The right-half-plane zero has a bump at the corner'], 0,
        [null, 'Its magnitude **rises**, exactly like an ordinary zero.', 'Same magnitude, opposite phase: different functions.', 'Both have the same magnitude everywhere, including the corner.'],
        md`$|1\pm j\omega/\omega_z|$ is the same, but the angles are $\pm\tan^{-1}(\omega/\omega_z)$: only the phase plot shows the difference.`),
      Q(md`$H(s) = s/10^4$ at $\omega = 10^4\,\text{rad/s}$ has...`,
        ['$0\\,\\text{dB}$ and $+90^\\circ$', '$+80\\,\\text{dB}$ and $+90^\\circ$', '$-3\\,\\text{dB}$ and $+45^\\circ$', '$0\\,\\text{dB}$ and $0^\\circ$'], 0,
        [null, '$s$ is divided by $10^4$: $|H| = \\omega/10^4 = 1$.', 'There is no corner: an $s$ has no $1 +$, so no $3\\,\\text{dB}$ and no ramp.', 'An $s$ is $j\\omega$: always $+90^\\circ$.'],
        md`$|j10^4/10^4| = 1$, $0\,\text{dB}$; the angle of $j$ is $+90^\circ$ at every frequency.`),
      Q(md`At the corner of an ordinary zero, the exact magnitude is...`,
        ['$3\\,\\text{dB}$ above the lines', '$3\\,\\text{dB}$ below the lines', 'on the lines', '$6\\,\\text{dB}$ above'], 0,
        [null, 'That is a pole. A zero is a pole upside down: the error flips sign too.', 'The lines are off by $3\\,\\text{dB}$ at every corner.', '$|1 + j| = \\sqrt2$: $3\\,\\text{dB}$.'],
        md`$|1 + j| = \sqrt2$, $+3\,\text{dB}$ above the flat level where the lines meet.`),
      P({
        id: 'bk11-zero-a', title: 'An ordinary zero',
        q: md`$H(s) = 10\,(1 + s/10^2)$. Find the straight-line and exact $|H|_{\text{dB}}$ at $10^4\,\text{rad/s}$, and the straight-line phase there.`,
        parts: [K.plain('\\text{line}', 60, 'dB', { tol: { abs: 0.3 }, traps: [{ v: -20, msg: 'A zero **raises** the magnitude.' }, { v: 20, msg: 'That is only the flat level below $10^2$.' }] }), K.plain('\\text{exact}', 20 + 10 * L10(1 + 1e4), 'dB', { tol: { abs: 0.1 } }), K.plain('\\angle H', 90, '°', { tol: { abs: 1 } })],
        hints: [md`Two decades above the zero at $+20$ each.`],
        sol: md`Flat at $20\,\text{dB}$ to $10^2$, then $+20\,\text{dB/dec}$ for two decades: $60\,\text{dB}$. Exact: $20 + 10\log_{10}(1 + 10^4) = 60.00\,\text{dB}$ (two decades away the lines are essentially exact). Phase: $10^4\ge10\,\omega_z$, so $+90^\circ$.`,
      }),
      P({
        id: 'bk11-zero-b', title: 'A right-half-plane zero',
        q: md`$H(s) = 1 - s/10^5$. Find the exact $|H|_{\text{dB}}$ and exact phase at $10^5\,\text{rad/s}$, and the straight-line magnitude and phase at $10^6\,\text{rad/s}$.`,
        parts: [K.plain('|H|_{dB}\\ (10^5)', 10 * L10(2), 'dB', { tol: { abs: 0.1 }, traps: [{ v: -10 * L10(2), msg: 'A zero (of either half-plane) is $3\\,\\text{dB}$ **above** at its corner.' }] }),
          K.plain('\\angle H\\ (10^5)', -45, '°', { tol: { abs: 0.5 }, traps: [{ v: 45, msg: 'The right-half-plane zero lags: $\\angle(1 - j) = -45^\\circ$.' }] }),
          K.plain('|H|_{dB}\\ (10^6,\\ \\text{line})', 20, 'dB', { tol: { abs: 0.3 } }), K.plain('\\angle H\\ (10^6,\\ \\text{line})', -90, '°', { tol: { abs: 1 } })],
        hints: [md`$|1 - jx| = \sqrt{1 + x^2}$, $\angle(1 - jx) = -\tan^{-1}x$.`],
        sol: md`At $x = 1$: $|1 - j| = \sqrt2\to+3.01\,\text{dB}$ and $-45^\circ$. At $x = 10$: the line is one decade up the $+20$ slope, $20\,\text{dB}$, and the phase line has reached $-90^\circ$ (exact $-84.3^\circ$).`,
      }),
      P({
        id: 'bk11-zero-c', title: '$s$ at the origin',
        q: md`$H(s) = s/10^3$. Find $|H|_{\text{dB}}$ at $10^5$ and at $10\,\text{rad/s}$, and its phase.`,
        parts: [K.plain('10^5', 40, 'dB', { tol: { abs: 0.3 } }), K.plain('10', -40, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 0, msg: 'There is no flat part: $|H| = \\omega/10^3$ at every frequency.' }] }), K.plain('\\angle H', 90, '°', { tol: { abs: 1 } })],
        hints: [md`$|H| = \omega/10^3$ exactly.`],
        sol: md`At $10^5$: $|H| = 100\to40\,\text{dB}$. At $10$: $|H| = 0.01\to-40\,\text{dB}$. The phase is $+90^\circ$ at every frequency.`,
      }),
      P({
        id: 'bk11-zero-d', title: 'A high-pass below its corner',
        q: md`$H(s) = 100\cdot\dfrac{s/10^2}{1 + s/10^2}$. At $\omega = 10\,\text{rad/s}$, find the straight-line and exact $|H|_{\text{dB}}$ and the straight-line phase.`,
        parts: [K.plain('\\text{line}', 20, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 40, msg: 'That is the level above the corner. Below it, the $s$ makes the line rise toward it at $+20\\,\\text{dB/dec}$.' }] }), K.plain('\\text{exact}', 40 + 20 * L10(0.1) - 10 * L10(1.01), 'dB', { tol: { abs: 0.1 } }), K.plain('\\angle H\\ (\\text{line})', 90, '°', { tol: { abs: 1 } })],
        hints: [md`$100\cdot\frac{s}{10^2}$ alone is $40\,\text{dB}$ at $10^2$ and falls $20\,\text{dB}$ per decade going down.`],
        sol: md`Below the corner, $|H|\approx100\,\omega/10^2 = 10$ at $\omega = 10$: $20\,\text{dB}$ on the line. Exactly $20 - 10\log_{10}1.01 = 19.96\,\text{dB}$. Phase: $+90^\circ$ from the $s$; the pole's ramp starts at $0.1\times10^2 = 10$, so it has not begun: $+90^\circ$ (exact $84.3^\circ$).`,
      }),
      P({
        id: 'bk11-zero-e', title: 'Exam style: which zero?',
        q: md`A straight-line Bode plot is flat at $0\,\text{dB}$, then from $10^4\,\text{rad/s}$ rises at $+20\,\text{dB/dec}$ for good; its phase goes from $0^\circ$ down to $-90^\circ$, passing $-45^\circ$ at $10^4$. Which $H(s)$ is it?`,
        figHtml: EB.svg({ k: 1, rhp: [1e4] }, { show: 'both', exact: false }),
        parts: [{ lbl: 'Choose one', mc: ['$1 - s/10^4$', '$1 + s/10^4$', '$1/(1 + s/10^4)$', '$-(1 + s/10^4)$'], a: 0,
          why: [null, 'Same magnitude, but its phase goes **up** to $+90^\\circ$.', 'A pole makes the magnitude **fall**.', 'A minus sign would start the phase at $180^\\circ$ and the zero would add phase.'] }],
        hints: [md`Magnitude up: a zero. Phase down: which kind of zero lags?`],
        sol: md`A rising magnitude is a zero; a phase that goes down with it is a right-half-plane zero: $H(s) = 1 - s/10^4$.`,
      }),
      G('bk_zero', { need: 4 }),
    ],
  });

  // ================================================================ 4. many poles and zeros: products become sums
  const ex1 = { k: 100, zeros: [1e3], poles: [1e2, 1e5] };
  const up = (w, c) => (w > c ? 20 * L10(w / c) : 0);
  const sumFig = K.lplot({ wmin: 10, wmax: 1e7, y: [-100, 80], yt: [-100, -60, -20, 20, 60], h: 280,
    curves: [{ f: () => 40, cls: 'ink' }, { f: (w) => -up(w, 1e2), cls: 'dash' }, { f: (w) => up(w, 1e3), cls: 'dash' }, { f: (w) => -up(w, 1e5), cls: 'ink dash' }, { f: (w) => EB.tf(ex1).asyDb(w) }],
    notes: [{ w: 14, y: 47, n: 'k:\\ 40\\,\\text{dB}', anchor: 'bl' }, { w: 2.2e5, y: -60, n: '\\text{pole }10^2', anchor: 'tr' }, { w: 6e5, y: 62, n: '\\text{zero }10^3', anchor: 'br' }, { w: 2.5e6, y: -34, n: '\\text{pole }10^5', anchor: 'tr' }, { w: 1e4, y: 26, n: '\\textbf{sum}', anchor: 'b' }] });
  const ex2 = { k: -200, poles: [1e4, 1e6] };
  const dbl = { k: 10, poles: [1e3, 1e3] };
  const exM = { k: 50, rhp: [1e7], poles: [1e5, 1e8] };
  L({
    id: 'bk11-many', title: 'Many poles and zeros: products become sums', ref: 'Lectures 25, 27',
    steps: [
      R(md`
        ### The question

        Real amplifiers have two to four corners: a pole at each node, a zero or two (Chapters 12 and 13). Lecture 25's goal form,
        $$H(s) = k\,\frac{(1 + s/\omega_{z1})(1 + s/\omega_{z2})\cdots}{(1 + s/\omega_{p1})(1 + s/\omega_{p2})\cdots}$$
        looks complicated, but on Bode axes it is just the single factors of the last two sections **added up**. This is the Bode skill the exam tests.
      `),
      R(md`
        ### The physical picture

        Each factor bends the line at its own corner and leaves it alone elsewhere. On a log scale multiplying lengths is adding logs, and the angles of a product always add. So the whole plot is a stack of the single-factor plots, one on top of the other: a pole tips everything to its right down by $20\,\text{dB/dec}$, a zero tips it up.

        ### The derivation

        Put $s = j\omega$ and take the magnitude and angle [factor by factor](#/l/bk10-complex):
        $$|H|_{\text{dB}} = 20\log_{10}|k| + \sum_{\text{zeros}}20\log_{10}\left|1 + j\frac{\omega}{\omega_z}\right| - \sum_{\text{poles}}20\log_{10}\left|1 + j\frac{\omega}{\omega_p}\right|$$
        $$\angle H = \angle k + \sum_{\text{zeros}}\tan^{-1}\frac{\omega}{\omega_z} - \sum_{\text{poles}}\tan^{-1}\frac{\omega}{\omega_p}\qquad(\text{a right-half-plane zero enters with a minus sign})$$
        Replace each term by its straight line ([pole](#/l/bk11-pole), [zero](#/l/bk11-zero)): $0$ below its corner, $\pm20\log_{10}(\omega/\omega_c)$ above. A sum of straight lines is a broken straight line, whose slope at any $\omega$ is the sum of the slopes of the terms that have "switched on".

        !!key Slope and phase bookkeeping
          $$\text{slope} = 20\times(\text{zeros passed} - \text{poles passed})\ \text{dB/decade}$$
          The phase is the sum of the ramps: each pole $-45^\circ$/decade and each zero $+45^\circ$/decade (a right-half-plane zero $-45^\circ$) over the two decades around its corner, plus $180^\circ$ if $k < 0$.
      `),
      RF(md`
        [[fig:sum]]

        ### Check it

        - **Far right:** every corner is passed, so the final slope is $-20\times(\text{poles} - \text{zeros})$, and the final phase is $\angle k - 90^\circ\times(\text{poles} + \text{RHP zeros} - \text{LHP zeros})$.
        - **Far left:** nothing has switched on: the level is $20\log_{10}|k|$ and the phase is $\angle k$ (if there is no $s$ factor).
        - **Corners close together.** The $3\,\text{dB}$ corrections add too: a **double pole** (two poles at the same $\omega_p$) bends the line by $-40\,\text{dB/dec}$, sits $6\,\text{dB}$ under the lines at $\omega_p$, and its phase is exactly $-90^\circ$ there, ramping at $-90^\circ$ per decade.
      `, { sum: { svg: sumFig, cap: '$H(s) = 100\\,(1 + s/10^3)/((1 + s/10^2)(1 + s/10^5))$: the dashed and grey lines are the single factors; the blue line is their sum.' } }),
      RF(md`
        ### Worked example 1

        $$${EB.tex(ex1)}$$

        **Magnitude.** Flat at $20\log_{10}100 = 40\,\text{dB}$. At $10^2$ (pole) the slope becomes $-20$: by $10^3$ the line is at $40 - 20 = 20\,\text{dB}$. At $10^3$ (zero) the slope returns to $0$: flat at $20\,\text{dB}$. At $10^5$ (pole) it falls at $-20\,\text{dB/dec}$ for good.

        **Phase.** The pole at $10^2$ ramps from $10^1$ to $10^3$; the zero at $10^3$ ramps up from $10^2$ to $10^4$; the pole at $10^5$ ramps down from $10^4$ to $10^6$. Adding the ramps decade by decade:

        | $\omega$ | $10^1$ | $10^2$ | $10^3$ | $10^4$ | $10^5$ | $10^6$ |
        |---|---|---|---|---|---|---|
        | straight-line phase | $0^\circ$ | $-45^\circ$ | $-45^\circ$ | $0^\circ$ | $-45^\circ$ | $-90^\circ$ |

        Between $10^2$ and $10^3$ the pole's $-45^\circ$/decade and the zero's $+45^\circ$/decade cancel: the phase is flat at $-45^\circ$.

        [[fig:e1]]

        **Read it back:** a flat stretch in the middle of a magnitude plot always means "as many zeros as poles passed so far".
      `, { e1: plot(ex1, { show: 'both', marks: [{ w: 1e2, n: '10^{2}' }, { w: 1e3, n: '10^{3}' }, { w: 1e5, n: '10^{5}' }] }) }),
      RF(md`
        ### Worked example 2: a negative gain and two poles

        $$${EB.tex(ex2)}$$

        **Magnitude:** $|{-200}| = 200\to46\,\text{dB}$ up to $10^4$; $-20\,\text{dB/dec}$ to $10^6$, which is two decades, so $46 - 40 = 6\,\text{dB}$ there; then $-40\,\text{dB/dec}$. The line reaches $0\,\text{dB}$ $6/40 = 0.15$ decade above $10^6$, at $1.41\times10^6\,\text{rad/s}$.

        **Phase:** $180^\circ$ from the sign. The first pole takes $90^\circ$ away between $10^3$ and $10^5$; the second between $10^5$ and $10^7$. So: $180^\circ$ up to $10^3$, $135^\circ$ at $10^4$, $90^\circ$ at $10^5$, $45^\circ$ at $10^6$, $0^\circ$ from $10^7$ (the same as $-180^\circ\to-360^\circ$ if you start from $-180^\circ$).

        [[fig:e2]]
      `, { e2: plot(ex2, { show: 'both', marks: [{ w: 1e4, n: '10^{4}' }, { w: 1e6, n: '10^{6}' }] }) }),
      R(md`
        !!mistake Common mistakes
          - **Only the last corner.** Every corner already passed keeps bending the line; the slopes accumulate.
          - **The ramp in the wrong place.** Each ramp runs from $0.1\omega_c$ to $10\omega_c$, so ramps of corners less than two decades apart overlap and their slopes add.
          - **The $180^\circ$ of a negative $k$**, which never shows on the magnitude.
          - **A double pole drawn as one pole.** Two equal corners bend the slope by $40\,\text{dB/dec}$.
      `),
      Q(md`$H(s)$ has three poles and one ordinary zero. What is the slope of its magnitude far above every corner?`,
        ['$-40\\,\\text{dB/dec}$', '$-60\\,\\text{dB/dec}$', '$-80\\,\\text{dB/dec}$', '$-20\\,\\text{dB/dec}$'], 0,
        [null, 'The zero gives back $+20$.', 'A zero **raises** the slope.', 'Count: $20\\times(1 - 3)$.'],
        md`$20\times(\text{zeros} - \text{poles}) = 20\times(1 - 3) = -40\,\text{dB/dec}$.`),
      Q(md`In the middle of a magnitude plot there is a long flat stretch. What does it tell you?`,
        ['As many zeros as poles have been passed so far', 'There are no corners at all', 'The gain is $0\\,\\text{dB}$ there', 'The phase is $0^\\circ$ there'], 0,
        [null, 'Corners on the left can cancel each other\'s slopes.', 'Flat is about the slope, not the level.', 'The phase can sit anywhere, e.g. $-45^\\circ$, while ramps overlap.'],
        md`The slope is $20\times(\text{zeros passed} - \text{poles passed})$: zero slope means the counts are equal.`),
      Q(md`Two poles and one left-half-plane zero, positive $k$. What is the phase far above every corner?`,
        ['$-90^\\circ$', '$-180^\\circ$', '$+90^\\circ$', '$0^\\circ$'], 0,
        [null, 'The zero gives back $+90^\\circ$.', 'Poles subtract phase.', 'One pole is left over after the zero cancels the other.'],
        md`$-90^\circ\times2 + 90^\circ = -90^\circ$.`),
      P({
        id: 'bk11-many-a', title: 'Walk the magnitude',
        q: md`$$H(s) = \frac{1000\,(1 + s/10^4)}{(1 + s/10^2)(1 + s/10^6)}$$
Find the straight-line $|H|_{\text{dB}}$ at $10^3$ and at $10^5\,\text{rad/s}$, and the slope above $10^6$.`,
        parts: [K.plain('10^3', 40, 'dB', { tol: { abs: 0.3 } }), K.plain('10^5', 20, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 0, msg: 'The zero at $10^4$ stops the fall: flat from $10^4$ to $10^6$.' }] }), K.plain('\\text{slope}', -20, 'dB/dec', { tol: { abs: 0.5 } })],
        hints: [md`$60\,\text{dB}$ flat to $10^2$; $-20$ to $10^4$; $0$ to $10^6$; $-20$ beyond.`],
        sol: md`$60\,\text{dB}$ up to $10^2$; at $10^3$ one decade of $-20$: $40\,\text{dB}$; at $10^4$: $20\,\text{dB}$, where the zero levels it off; at $10^5$ still $20\,\text{dB}$. Above $10^6$: $20(1 - 2) = -20\,\text{dB/dec}$.`,
      }),
      P({
        id: 'bk11-many-b', title: 'Walk the phase',
        q: md`Same $H(s)$. Find the straight-line phase at $10^3$, $10^5$ and $10^7\,\text{rad/s}$.`,
        parts: [K.plain('10^3', -90, '°', { tol: { abs: 1 } }), K.plain('10^5', 0, '°', { tol: { abs: 1 } }), K.plain('10^7', -90, '°', { tol: { abs: 1 } })],
        hints: [md`Ramps: pole $10^2$ over $10^1\ldots10^3$; zero $10^4$ over $10^3\ldots10^5$; pole $10^6$ over $10^5\ldots10^7$.`],
        sol: md`At $10^3$: the first pole has finished ($-90^\circ$), the zero is just starting: $-90^\circ$. At $10^5$: zero finished ($+90^\circ$), the last pole just starting: $-90 + 90 = 0^\circ$. At $10^7$: $-90 + 90 - 90 = -90^\circ$.`,
      }),
      P({
        id: 'bk11-many-c', title: 'A double pole',
        q: md`$H(s) = \dfrac{10}{(1 + s/10^3)^2}$. Find the exact $|H|_{\text{dB}}$ at $10^3$, the straight-line $|H|_{\text{dB}}$ at $10^4$, and the exact phase at $10^3$.`,
        parts: [K.plain('\\text{exact at }10^3', 20 - 20 * L10(2), 'dB', { tol: { abs: 0.1 }, traps: [{ v: 20 - 10 * L10(2), msg: 'Two poles: $3\\,\\text{dB}$ each, $6\\,\\text{dB}$ in all.' }] }),
          K.plain('\\text{line at }10^4', -20, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 0, msg: 'Two poles: $-40\\,\\text{dB/dec}$, not $-20$.' }] }), K.plain('\\angle H\\ (10^3)', -90, '°', { tol: { abs: 0.5 } })],
        hints: [md`Each factor is $1/|1 + j| = 1/\sqrt2$ at the corner, and $-45^\circ$.`],
        sol: md`At $10^3$: $|H| = 10/(\sqrt2)^2 = 5\to14\,\text{dB}$ ($20 - 6.02 = 13.98$). The line falls $40\,\text{dB/dec}$ above $10^3$: $20 - 40 = -20\,\text{dB}$ at $10^4$. Phase at $10^3$: $2\times(-45^\circ) = -90^\circ$.`,
      }),
      P({
        id: 'bk11-many-d', title: 'Negative gain, two poles',
        q: md`$H(s) = \dfrac{-200}{(1 + s/10^4)(1 + s/10^6)}$. Find the straight-line $|H|_{\text{dB}}$ at $10^6$, the frequency where the straight line crosses $0\,\text{dB}$, and the straight-line phase at $10^6$ (sign as $+180^\circ$).`,
        parts: [K.plain('|H|_{dB}\\ (10^6)', 20 * L10(200) - 40, 'dB', { tol: { abs: 0.3 } }), K.wPart('\\omega\\ (0\\,\\text{dB})', 1e6 * 10 ** ((20 * L10(200) - 40) / 40), { traps: [{ v: 2e6, msg: 'Above $10^6$ the line falls at $-40\\,\\text{dB/dec}$, not $-20$.' }] }),
          K.plain('\\angle H\\ (10^6)', 45, '°', { tol: { abs: 1 }, accept: [-315] })],
        hints: [md`$46\,\text{dB}$; two decades at $-20$; then $-40\,\text{dB/dec}$.`],
        sol: md`$46 - 40 = 6\,\text{dB}$ at $10^6$. Then $-40\,\text{dB/dec}$: $0\,\text{dB}$ after $6/40 = 0.15$ decade, at $10^{6.15} = 1.41\times10^6\,\text{rad/s}$. Phase: $180^\circ - 90^\circ - 45^\circ = 45^\circ$.`,
      }),
      P({
        id: 'bk11-many-e', title: 'Exam style: a right-half-plane zero in the middle',
        q: md`$$${EB.tex(exM)}$$
Find the straight-line $|H|_{\text{dB}}$ at $10^6$ and at $10^9\,\text{rad/s}$, the straight-line phase at $10^7$, and the phase far above every corner.`,
        parts: [K.plain('|H|_{dB}\\ (10^6)', 20 * L10(50) - 20, 'dB', { tol: { abs: 0.3 } }), K.plain('|H|_{dB}\\ (10^9)', 20 * L10(50) - 40 - 20, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 20 * L10(50) - 40 - 40, msg: 'The right-half-plane zero **raises** the slope like any zero: flat between $10^7$ and $10^8$.' }] }),
          K.plain('\\angle H\\ (10^7)', -135, '°', { tol: { abs: 1 }, traps: [{ v: -45, msg: 'A right-half-plane zero takes phase **away**, like a pole.' }] }), K.plain('\\angle H\\ (\\infty)', -270, '°', { tol: { abs: 1 }, accept: [90], traps: [{ v: -90, msg: 'The right-half-plane zero adds $-90^\\circ$, not $+90^\\circ$.' }] })],
        hints: [md`Magnitude: the right-half-plane zero acts like an ordinary zero (+20). Phase: like a pole (−45°/dec over its two decades).`],
        sol: md`**Magnitude:** $34\,\text{dB}$ to $10^5$; $-20$ to $10^7$: $14\,\text{dB}$ at $10^6$ and $-6\,\text{dB}$ at $10^7$; flat (the zero) to $10^8$; then $-20$: $-26\,\text{dB}$ at $10^9$.

**Phase at $10^7$:** the pole at $10^5$ has finished ($-90^\circ$); the right-half-plane zero at $10^7$ is half-way ($-45^\circ$); the pole at $10^8$ starts at $10^7$ ($0$): $-135^\circ$. **Far right:** $-90 - 90 - 90 = -270^\circ$ (the same direction as $+90^\circ$).

[[fig:p]]`,
        figs: { p: plot(exM, { show: 'both', marks: [{ w: 1e6, n: '10^{6}' }, { w: 1e7, n: '10^{7}' }, { w: 1e9, n: '10^{9}' }] }) },
      }),
      G('bk_asy', { need: 5 }),
      G('bk_phase', { need: 4 }),
    ],
  });

  // ================================================================ 5. sketching from H(s), step by step
  const sk1 = { k: 100, zeros: [1e3], poles: [1e2, 1e5] };
  const sk2 = { k: -100, origin: 1, w0: 1e2, poles: [1e2, 1e6] };
  const sk3 = { k: -20, rhp: [1e9], poles: [1e7, 1e10] };
  L({
    id: 'bk11-sketch', title: 'Sketching from $H(s)$, step by step', ref: 'Lectures 25, 27',
    steps: [
      R(md`
        ### The question

        The exam gives $H(s)$, often as $(s + a)$ factors or straight from a circuit, and asks for the Bode sketch with numbers on it, or for values at particular frequencies. With the rules of the last sections, a sketch is a checklist. This section is that checklist, worked three times.
      `),
      R(md`
        !!method Sketching a Bode plot
          1. **Standard form.** Pull each corner out of its factor, $s + a = a(1 + s/a)$; the constant is $k = H(0)$. Note the sign of $k$, any right-half-plane zero ($1 - s/a$), and any bare $s^n$.
          2. **List the corners** in order, each with its type: pole, zero, RHP zero.
          3. **Axes.** One decade below the first corner to one above the last; two decades each side for the phase.
          4. **Magnitude.** Start at $20\log_{10}|k|$ (with an $s^n$, start on its $20n\,\text{dB/dec}$ line). Walk right; at each corner change the slope by $-20$ (pole) or $+20$ (any zero). Write the level at every corner: next level $=$ level $+$ slope $\times$ decades.
          5. **Phase.** Start at $\angle k$ ($0^\circ$ or $180^\circ$) $+\,90^\circ n$. List every ramp's start and end ($0.1\omega_c$, $10\omega_c$); between breakpoints the phase slope is the sum of the active ramps ($\pm45^\circ$/dec each). Write the phase at each breakpoint.
          6. **Check.** Final slope $-20\times(\text{poles} - \text{zeros})$; final phase from the counts.
          7. **Optional:** the exact curve is $3\,\text{dB}$ off at an isolated corner (below for a pole, above for a zero).
      `),
      RF(md`
        ### Worked example 1: from $(s + a)$ factors

        $$H(s) = \frac{10^6\,(s + 10^3)}{(s + 10^2)(s + 10^5)}$$

        1. **Standard form:** $k = \dfrac{10^6\times10^3}{10^2\times10^5} = 100$, so $H(s) = ${EB.tex(sk1, '')}$.
        2. **Corners:** pole $10^2$, zero $10^3$, pole $10^5$.
        3. **Axes:** $10^1$ to $10^6$ for the magnitude; $10^0$ to $10^7$ for the phase.
        4. **Magnitude:** $40\,\text{dB}$ to $10^2$; slope $-20$ to $10^3$ (level $20\,\text{dB}$); slope $0$ to $10^5$ (still $20\,\text{dB}$); slope $-20$ after ($0\,\text{dB}$ at $10^6$).
        5. **Phase breakpoints:** $10^1$ (pole 1 starts), $10^2$ (zero starts), $10^3$ (pole 1 ends), $10^4$ (zero ends, pole 2 starts), $10^6$ (pole 2 ends):

        | From | To | Active ramps | Phase slope | Phase at the end |
        |---|---|---|---|---|
        | $10^1$ | $10^2$ | pole 1 | $-45^\circ$/dec | $-45^\circ$ |
        | $10^2$ | $10^3$ | pole 1, zero | $0$ | $-45^\circ$ |
        | $10^3$ | $10^4$ | zero | $+45^\circ$/dec | $0^\circ$ |
        | $10^4$ | $10^6$ | pole 2 | $-45^\circ$/dec | $-90^\circ$ |

        6. **Check:** final slope $20(1 - 2) = -20\,\text{dB/dec}$ ✓; final phase $-90^\circ$ ✓.

        [[fig:s1]]
      `, { s1: plot(sk1, { show: 'both', marks: [{ w: 1e2, n: '10^{2}' }, { w: 1e3, n: '10^{3}' }, { w: 1e5, n: '10^{5}' }] }) }),
      RF(md`
        ### Worked example 2: a band-pass with a negative gain

        A common emitter with a coupling capacitor and a load capacitor ([Chapter 10](#/l/bk10-problems)) has the shape
        $$H(s) = -100\,\frac{s/10^2}{(1 + s/10^2)(1 + s/10^6)}$$

        1. **The $s$ sets the start:** below $10^2$ the magnitude is $100\,\omega/10^2$, a $+20\,\text{dB/dec}$ line through $40\,\text{dB}$ at $10^2$ (so $20\,\text{dB}$ at $10$).
        2. **Magnitude:** $+20$ up to $10^2$; the pole there cancels it: flat at $40\,\text{dB}$ (the mid-band gain, $|{-100}|$) to $10^6$; then $-20\,\text{dB/dec}$.
        3. **Phase:** $180^\circ$ (sign) $+ 90^\circ$ ($s$) $= 270^\circ$ at the far left; the pole at $10^2$ ramps it down to $180^\circ$ between $10$ and $10^3$; the pole at $10^6$ takes it to $90^\circ$ between $10^5$ and $10^7$. In the middle of the band the stage simply inverts: $180^\circ$.

        [[fig:s2]]
      `, { s2: plot(sk2, { show: 'both', marks: [{ w: 1e2, n: '10^{2}' }, { w: 1e6, n: '10^{6}' }] }) }),
      RF(md`
        ### Worked example 3 (exam style): the common source with its zero

        Chapter 12's exact common source has this form:
        $$H(s) = ${EB.tex(sk3, '')}$$

        1. **Corners:** pole $10^7$, right-half-plane zero $10^9$, pole $10^{10}$. $|k| = 20\to26\,\text{dB}$; $k < 0$.
        2. **Magnitude:** $26\,\text{dB}$ to $10^7$; $-20$ for two decades: $-14\,\text{dB}$ at $10^9$; the RHP zero adds $+20$: flat at $-14\,\text{dB}$ to $10^{10}$; then $-20\,\text{dB/dec}$.
        3. **Phase:** start at $180^\circ$. Ramps: pole $10^7$ over $10^6\ldots10^8$; RHP zero over $10^8\ldots10^{10}$ (**down**); pole $10^{10}$ over $10^9\ldots10^{11}$.

        | $\omega$ | $10^6$ | $10^8$ | $10^9$ | $10^{10}$ | $10^{11}$ |
        |---|---|---|---|---|---|
        | straight-line phase | $180^\circ$ | $90^\circ$ | $45^\circ$ | $-45^\circ$ | $-90^\circ$ |

        Between $10^9$ and $10^{10}$ two ramps run down together, $-90^\circ$ per decade.
        4. **Check:** final slope $20(1 - 2) = -20\,\text{dB/dec}$; final phase $180 - 90 - 90 - 90 = -90^\circ$ ✓. The magnitude never shows the zero's sign; only the phase does.

        [[fig:s3]]
      `, { s3: plot(sk3, { show: 'both', marks: [{ w: 1e7, n: '10^{7}' }, { w: 1e9, n: '10^{9}' }, { w: 1e10, n: '10^{10}' }] }) }),
      R(md`
        !!mistake Common mistakes
          - **Skipping the standard form**, so the leading constant is taken as the gain.
          - **Ramp end-points.** Each ramp is $0.1\omega_c$ to $10\omega_c$; list them all before drawing.
          - **Forgetting the $s^n$ slope** at the far left of a band-pass.
          - **Adding phase slopes wrong** where ramps overlap: add them, one $\pm45^\circ$/dec per active corner.
      `),
      Q(md`$H(s) = \dfrac{10^8}{(s + 10^3)(s + 10^5)}$. What is the low-frequency gain?`,
        ['$1$ ($0\\,\\text{dB}$)', '$10^8$ ($160\\,\\text{dB}$)', '$10^3$', '$100$'], 0,
        [null, 'Normalize first: $H(0) = 10^8/(10^3\\times10^5)$.', 'Divide by both corners.', 'Divide by both corners: $10^8/10^8$.'],
        md`$H(0) = 10^8/(10^3\times10^5) = 1$: $0\,\text{dB}$.`),
      Q(md`Over which range does the phase ramp of a pole at $10^5\,\text{rad/s}$ run?`,
        ['$10^4$ to $10^6$', '$10^5$ to $10^6$', '$10^4$ to $10^5$', '$10^5$ to $10^7$'], 0,
        [null, 'It starts a decade **before** the corner.', 'It ends a decade **after** the corner.', 'It is centred on the corner: $0.1\\omega_p$ to $10\\omega_p$.'],
        md`$0.1\omega_p = 10^4$ to $10\omega_p = 10^6$, passing $-45^\circ$ at $10^5$.`),
      Q(md`A band-pass $H(s) = k\,\dfrac{s/\omega_L}{(1 + s/\omega_L)(1 + s/\omega_H)}$ with $\omega_L\ll\omega_H$. What is the slope below $\omega_L$?`,
        ['$+20\\,\\text{dB/dec}$', '$0$', '$-20\\,\\text{dB/dec}$', '$+40\\,\\text{dB/dec}$'], 0,
        [null, 'The $s$ makes it rise; only the pole at $\\omega_L$ flattens it.', 'Nothing pulls it down below $\\omega_L$.', 'One $s$, one $20\\,\\text{dB/dec}$.'],
        md`Below $\omega_L$ only the $s$ is active: $+20\,\text{dB/dec}$, rising to the mid-band level $20\log_{10}|k|$ at $\omega_L$.`),
      P({
        id: 'bk11-sk-a', title: 'A zero first',
        q: md`$$H(s) = \frac{10^5\,(s + 10)}{(s + 10^2)(s + 10^4)}$$
Find the low-frequency gain in dB, the straight-line $|H|_{\text{dB}}$ at $10^3$, and the straight-line phase at $10^3\,\text{rad/s}$.`,
        parts: [K.plain('|H(0)|_{dB}', 0, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 100, msg: 'Normalize: $k = 10^5\\times10/(10^2\\times10^4) = 1$.' }] }), K.plain('|H|_{dB}\\ (10^3)', 20, 'dB', { tol: { abs: 0.3 } }), K.plain('\\angle H\\ (10^3)', 0, '°', { tol: { abs: 1 } })],
        hints: [md`$k = 1$; the zero at $10$ comes first, so the line **rises** first.`],
        sol: md`$k = \dfrac{10^5\times10}{10^2\times10^4} = 1\to0\,\text{dB}$. Magnitude: $0\,\text{dB}$ to $10$; $+20$ to $10^2$ ($20\,\text{dB}$); flat to $10^4$; so $20\,\text{dB}$ at $10^3$. Phase at $10^3$: zero ($10$) finished, $+90^\circ$; pole ($10^2$) finished, $-90^\circ$; pole ($10^4$) just starting, $0$: total $0^\circ$.`,
      }),
      P({
        id: 'bk11-sk-b', title: 'Two poles, one awkward',
        q: md`$$H(s) = \frac{2\times10^{12}}{(s + 10^3)(s + 2\times10^6)}$$
Find $|H(0)|_{\text{dB}}$, the straight-line $|H|_{\text{dB}}$ at $2\times10^6$, and the slope above it.`,
        parts: [K.plain('|H(0)|_{dB}', 60, 'dB', { tol: { abs: 0.3 } }), K.plain('|H|_{dB}\\ (2\\times10^6)', 60 - 20 * L10(2000), 'dB', { tol: { abs: 0.3 } }), K.plain('\\text{slope}', -40, 'dB/dec', { tol: { abs: 0.5 } })],
        hints: [md`$k = 2\times10^{12}/(10^3\times2\times10^6) = 1000$. From $10^3$ to $2\times10^6$ is $\log_{10}2000 = 3.3$ decades.`],
        sol: md`$k = 1000\to60\,\text{dB}$. From $10^3$ to $2\times10^6$: $3.30$ decades at $-20$: $60 - 66 = -6\,\text{dB}$. Above, two poles: $-40\,\text{dB/dec}$.`,
      }),
      P({
        id: 'bk11-sk-c', title: 'Exam style: the common source with its zero',
        q: md`$$H(s) = ${EB.tex(sk3, '')}$$
Find the straight-line $|H|_{\text{dB}}$ at $10^8$ and at $10^{11}\,\text{rad/s}$, and the straight-line phase at $10^9$ and at $10^{11}\,\text{rad/s}$ ($-20$ taken as $+180^\circ$).`,
        parts: [K.plain('|H|_{dB}\\ (10^8)', 20 * L10(20) - 20, 'dB', { tol: { abs: 0.3 } }), K.plain('|H|_{dB}\\ (10^{11})', 20 * L10(20) - 40 - 20, 'dB', { tol: { abs: 0.3 } }),
          K.plain('\\angle H\\ (10^9)', 45, '°', { tol: { abs: 1 }, accept: [-315], traps: [{ v: 135, msg: 'The right-half-plane zero takes phase **away**.' }] }), K.plain('\\angle H\\ (10^{11})', -90, '°', { tol: { abs: 1 }, accept: [270], traps: [{ v: 90, msg: 'The right-half-plane zero subtracts $90^\\circ$, it does not add it.' }] })],
        hints: [md`See worked example 3: $26\,\text{dB}$, $-20$ to $10^9$, flat to $10^{10}$, $-20$ after.`],
        sol: md`$26 - 20 = 6\,\text{dB}$ at $10^8$; $-14\,\text{dB}$ from $10^9$ to $10^{10}$; $-34\,\text{dB}$ at $10^{11}$. Phase at $10^9$: $180 - 90$ (pole $10^7$ done) $- 45$ (RHP zero half-way) $- 0$ (pole $10^{10}$ just starting) $= 45^\circ$. At $10^{11}$: $180 - 90 - 90 - 90 = -90^\circ$.`,
      }),
      P({
        id: 'bk11-sk-d', title: 'A band-pass',
        q: md`$H(s) = -100\,\dfrac{s/10^2}{(1 + s/10^2)(1 + s/10^6)}$. Find the mid-band gain in dB, the straight-line $|H|_{\text{dB}}$ at $10$ and at $10^7$, and the straight-line phase at $10^4$.`,
        parts: [K.plain('\\text{mid-band}', 40, 'dB', { tol: { abs: 0.3 } }), K.plain('|H|_{dB}\\ (10)', 20, 'dB', { tol: { abs: 0.3 } }), K.plain('|H|_{dB}\\ (10^7)', 20, 'dB', { tol: { abs: 0.3 } }), K.plain('\\angle H\\ (10^4)', 180, '°', { tol: { abs: 1 }, accept: [-180] })],
        hints: [md`Below $10^2$: $+20\,\text{dB/dec}$ toward $40\,\text{dB}$; above $10^6$: $-20\,\text{dB/dec}$.`],
        sol: md`Mid-band $|{-100}| = 40\,\text{dB}$. At $10$, a decade below $\omega_L$ on the $+20$ line: $20\,\text{dB}$. At $10^7$, a decade above $\omega_H$: $20\,\text{dB}$. At $10^4$ every ramp has finished or not started: $270^\circ - 90^\circ = 180^\circ$, a plain inversion.`,
      }),
      G('bk_sketch', { need: 4 }),
    ],
  });

  // ================================================================ 6. reading a plot back into H(s); -3 dB and unity gain
  const rdA = { k: 10, zeros: [1e5], poles: [1e3, 1e7] };
  const rdP = { k: 100, zeros: [1e4], poles: [1e2, 1e6] };
  const rdB = { k: -10, rhp: [1e5], poles: [1e3, 1e6] };
  // the exact w where (1 + w^2/a^2)(1 + w^2/b^2) = T (a quadratic in u = w^2, written in the stable form)
  const solve2 = (a, b, T) => { const A = 1 / (a * a * b * b), B = 1 / (a * a) + 1 / (b * b), Cp = T - 1; return Math.sqrt(2 * Cp / (B + Math.sqrt(B * B + 4 * A * Cp))); };
  const opA = { A0: 1e4, w1: 1e3, w2: 1e6 };
  L({
    id: 'bk11-read', title: 'Reading a plot back into $H(s)$; the $-3\\,\\text{dB}$ and unity-gain frequencies', ref: 'Lectures 25, 27',
    steps: [
      R(md`
        ### The question

        Recognition runs both ways. Given a Bode plot, write $H(s)$; and from $H(s)$ or the plot, find the two numbers every amplifier datasheet quotes: the **bandwidth** $\omega_{-3\text{dB}}$ and the **unity-gain frequency** $\omega_u$ where $|H| = 1$. Reading plots is also how you check your own sketch on the exam.
      `),
      RF(md`
        ### Three readings

        1. **The level on the left** is $20\log_{10}|k|$: $40\,\text{dB}$ means $|k| = 100$. (If the far-left slope is not zero, there is an $s^n$: $+20n\,\text{dB/dec}$.)
        2. **Every kink is a corner.** Read its $\omega$ off the decade grid. **Which way it kinks** gives the type: the slope gets $20\,\text{dB/dec}$ more negative at a **pole**, $20$ more positive at a **zero**.
        3. **The phase settles what the magnitude cannot see:** a phase that starts at $180^\circ$ means $k < 0$; a corner where the magnitude turns up but the phase goes down is a **right-half-plane zero**.

        Then check with the far-right slope, $-20\times(\text{poles} - \text{zeros})$.

        [[fig:a]]

        **Try it.** Level $20\,\text{dB}$: $|k| = 10$. Kink down at $10^3$: a pole. Kink up at $10^5$, back to flat: a zero. Kink down at $10^7$: a pole. So
        $$${EB.tex(rdA)}$$
        and the final slope $20(1 - 2) = -20\,\text{dB/dec}$ agrees.

        **Between grid lines** use the ruler: $2\times$ sits $30\%$ into a decade, $3\times$ at $48\%$, $5\times$ at $70\%$.
      `, { a: plot(rdA, { exact: false, cap: 'Read me: a straight-line magnitude plot.' }) }),
      R(md`
        ### The $-3\,\text{dB}$ frequency, derived

        **One pole:** $\omega_{-3\text{dB}} = \omega_p$ exactly ([derived](#/l/bk11-pole)).

        **Two poles**, $H = A_0/((1 + s/\omega_{p1})(1 + s/\omega_{p2}))$ with $\omega_{p2} = r\,\omega_{p1}$. Set $|H|^2 = A_0^2/2$, with $x = \omega/\omega_{p1}$:
        $$(1 + x^2)\left(1 + \frac{x^2}{r^2}\right) = 2$$
        a quadratic in $u = x^2$: $\frac{u^2}{r^2} + u\left(1 + \frac{1}{r^2}\right) - 1 = 0$.
        - **Far apart** ($r = 10$): $u = 0.981$, $x = 0.990$: $\omega_{-3\text{dB}} = 0.99\,\omega_{p1}$. The lower pole **dominates**, and the bandwidth is simply $\omega_{p1}$.
        - **Equal poles** ($r = 1$): $(1 + u)^2 = 2$, so $u = \sqrt2 - 1$ and $x = \sqrt{\sqrt2 - 1} = 0.644$: the bandwidth is only $0.644\,\omega_p$, because each pole is already $-3\,\text{dB}$ at $\omega_p$ and together they are $-6\,\text{dB}$ there. Chapter 13 meets this number again ([Chapter 13](#/l/bk13-why)).

        !!key The bandwidth
          With one pole far below the others (a **dominant pole**), $\omega_{-3\text{dB}}\approx\omega_{p1}$. When the poles are close, the real $-3\,\text{dB}$ point comes earlier: solve $|H| = |H(0)|/\sqrt2$.
      `),
      R(md`
        ### The unity-gain frequency, derived

        **From the straight lines:** walk down until the line reaches $0\,\text{dB}$. If the line is at $G\,\text{dB}$ at a corner $\omega_c$ and falls at $20m\,\text{dB/dec}$ from there, it reaches $0\,\text{dB}$ after $G/(20m)$ decades:
        $$\omega_u\approx\omega_c\cdot10^{G/(20m)}$$
        - **One pole:** $G = 20\log_{10}A_0$, $m = 1$, so $\omega_u\approx A_0\,\omega_p$: the gain-bandwidth product ([Chapter 10](#/l/bk10-amp)).
        - **Two poles, crossing past the second:** at $\omega_{p2}$ the line is at $20\log_{10}(A_0\omega_{p1}/\omega_{p2})$ and then falls at $40\,\text{dB/dec}$, so $\omega_u\approx\omega_{p2}\sqrt{A_0\omega_{p1}/\omega_{p2}} = \sqrt{A_0\,\omega_{p1}\omega_{p2}}$.

        **Exactly:** solve $|H(j\omega_u)| = 1$. For one pole, $\omega_u = \omega_p\sqrt{A_0^2 - 1}$. For two, the same quadratic in $\omega^2$ as above with $A_0^2$ on the right.
      `),
      R(md`
        ### Worked example: an op-amp-like response

        $A_0 = 10^4$ ($80\,\text{dB}$), poles at $10^3$ and $10^6\,\text{rad/s}$.

        1. **Bandwidth:** the poles are three decades apart, so $\omega_{-3\text{dB}}\approx10^3\,\text{rad/s}$ (exactly $999.9995$).
        2. **Straight-line $\omega_u$:** at $10^6$ the line is at $80 - 60 = 20\,\text{dB}$; at $-40\,\text{dB/dec}$ it needs half a decade more: $\omega_u\approx10^{6.5} = 3.16\times10^6 = \sqrt{10^4\times10^3\times10^6}$.
        3. **Exact $\omega_u$:** $(1 + u/10^6)(1 + u/10^{12}) = 10^8$ with $u = \omega^2$ gives $u = 9.51\times10^{12}$, $\omega_u = 3.08\times10^6\,\text{rad/s}$: the straight line is $2.5\%$ high, because the second pole's own $-3\,\text{dB}$ is close to the crossing.

        ### How to recognize it

        "Bandwidth" is the $-3\,\text{dB}$ frequency, read where the curve is $3\,\text{dB}$ under its flat level. "Unity-gain frequency" or "crossover" is where the magnitude crosses $0\,\text{dB}$. The phase there is what decides whether a feedback loop is stable (a later course); the exam asks for the frequency.
      `),
      R(md`
        !!mistake Common mistakes
          - **Reading a kink up as a pole.** Up is a zero; down is a pole.
          - **Ignoring the phase** when the options differ in sign or in the half-plane of a zero.
          - **Taking $\omega_u$ at the corner.** At the corner the gain is still $A_0/\sqrt2$.
          - **Assuming $\omega_{-3\text{dB}} = \omega_{p1}$ for close poles.** Two equal poles give $0.644\,\omega_p$.
      `),
      Q(md`On a straight-line magnitude plot, at $10^5\,\text{rad/s}$ the slope turns **up** by $20\,\text{dB/dec}$, and on the phase plot the phase starts falling a decade earlier. What is at $10^5$?`,
        ['A right-half-plane zero', 'A pole', 'An ordinary zero', 'A negative constant'], 0,
        [null, 'A pole turns the magnitude **down**.', 'An ordinary zero raises the phase.', 'A constant has no corner.'],
        md`Magnitude up: a zero. Phase down: the right-half-plane kind, $1 - s/10^5$.`),
      Q(md`Two equal poles at $\omega_p$ (and nothing else). Where is the $-3\,\text{dB}$ frequency?`,
        ['$0.64\\,\\omega_p$', '$\\omega_p$', '$0.5\\,\\omega_p$', '$1.41\\,\\omega_p$'], 0,
        [null, 'At $\\omega_p$ each pole gives $-3\\,\\text{dB}$: $-6\\,\\text{dB}$ in all.', 'Solve $(1 + x^2)^2 = 2$: $x^2 = \\sqrt2 - 1$.', 'The gain only falls as $\\omega$ rises.'],
        md`$(1 + x^2)^2 = 2\Rightarrow x = \sqrt{\sqrt2 - 1} = 0.644$.`),
      Q(md`A one-pole amplifier has $A_0 = 1000$ and $\omega_p = 10^4\,\text{rad/s}$. About where does its gain reach 1?`,
        ['$10^7\\,\\text{rad/s}$', '$10^4\\,\\text{rad/s}$', '$10^{5.5}\\,\\text{rad/s}$', '$10^{10}\\,\\text{rad/s}$'], 0,
        [null, 'That is the corner, where the gain is still $707$.', 'One pole falls $20\\,\\text{dB}$ per decade: $60\\,\\text{dB}$ takes three decades.', 'Gain times bandwidth: $1000\\times10^4$.'],
        md`$\omega_u\approx A_0\omega_p = 10^3\times10^4 = 10^7\,\text{rad/s}$ (exactly $0.9999995\times10^7$).`),
      P({
        id: 'bk11-rd-a', title: 'Read the plot',
        q: md`From the straight-line plot, find $|k|$, the frequency of the zero, and the slope at the far right.`,
        figHtml: EB.svg(rdP, { exact: false }),
        parts: [K.plain('|k|', 100, 'V/V'), K.wPart('\\omega_z', 1e4), K.plain('\\text{final slope}', -20, 'dB/dec', { tol: { abs: 0.5 } })],
        hints: [md`$40\,\text{dB}$ on the left. Kinks at $10^2$ (down), $10^4$ (up), $10^6$ (down).`],
        sol: md`Level $40\,\text{dB}\Rightarrow|k| = 100$. Down at $10^2$ (pole), up at $10^4$ (zero), down at $10^6$ (pole): $$${EB.tex(rdP)}$$ Final slope $20(1 - 2) = -20\,\text{dB/dec}$.`,
      }),
      P({
        id: 'bk11-rd-b', title: 'Read the phase too',
        q: md`Which transfer function has these straight-line plots?`,
        figHtml: EB.svg(rdB, { show: 'both', exact: false }),
        parts: [{ lbl: 'Choose one', mc: [`$${EB.tex(rdB)}$`, `$${EB.tex({ k: 10, rhp: [1e5], poles: [1e3, 1e6] })}$`, `$${EB.tex({ k: -10, zeros: [1e5], poles: [1e3, 1e6] })}$`, `$${EB.tex({ k: -10, rhp: [1e5], poles: [1e3], zeros: [1e6] })}$`], a: 0,
          why: [null, 'The phase starts at $180^\\circ$: the constant is negative.', 'At $10^5$ the phase goes **down** while the magnitude turns up: a right-half-plane zero.', 'At $10^6$ the magnitude turns **down**: a pole.'] }],
        hints: [md`Level: $20\,\text{dB}$. Start of the phase: $180^\circ$. At $10^5$: magnitude up, phase down.`],
        sol: md`$|k| = 10$ and the phase starts at $180^\circ$: $k = -10$. Pole at $10^3$ (down), right-half-plane zero at $10^5$ (magnitude up, phase down), pole at $10^6$ (down): $$${EB.tex(rdB)}$$`,
      }),
      P({
        id: 'bk11-rd-c', title: 'Two equal poles',
        q: md`$H(s) = \dfrac{100}{(1 + s/10^6)^2}$. Find the exact $-3\,\text{dB}$ frequency and the exact gain (in dB) at $10^6\,\text{rad/s}$.`,
        parts: [K.wPart('\\omega_{-3dB}', 1e6 * Math.sqrt(Math.SQRT2 - 1), { traps: [{ v: 1e6, msg: 'At $10^6$ each pole is already $-3\\,\\text{dB}$.' }] }), K.plain('|H|_{dB}\\ (10^6)', 40 - 20 * L10(2), 'dB', { tol: { abs: 0.1 } })],
        hints: [md`$(1 + x^2)^2 = 2$.`],
        sol: md`$x^2 = \sqrt2 - 1$, $x = 0.644$: $\omega_{-3\text{dB}} = 6.44\times10^5\,\text{rad/s}$. At $10^6$: $100/(\sqrt2)^2 = 50\to34\,\text{dB}$, i.e. $6\,\text{dB}$ under $40$.`,
      }),
      P({
        id: 'bk11-rd-d', title: 'Unity gain past the second pole',
        q: md`$A_0 = 10^4$, poles at $10^3$ and $10^6\,\text{rad/s}$. Find $\omega_u$ from the straight lines and exactly.`,
        parts: [K.wPart('\\omega_u\\ (\\text{line})', Math.sqrt(1e4 * 1e3 * 1e6), { traps: [{ v: 1e7, msg: 'That ignores the second pole: past $10^6$ the line falls at $-40\\,\\text{dB/dec}$.' }] }), K.wPart('\\omega_u\\ (\\text{exact})', solve2(1e3, 1e6, 1e8))],
        hints: [md`Line: $20\,\text{dB}$ at $10^6$, then $-40\,\text{dB/dec}$. Exact: $(1 + u/10^6)(1 + u/10^{12}) = 10^8$, $u = \omega^2$.`],
        sol: md`Line: $\sqrt{A_0\omega_{p1}\omega_{p2}} = \sqrt{10^{13}} = 3.16\times10^6\,\text{rad/s}$. Exact: the quadratic $10^{-18}u^2 + 1.000001\times10^{-6}u - (10^8 - 1) = 0$ gives $u = 9.51\times10^{12}$, $\omega_u = 3.08\times10^6\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk11-rd-e', title: 'Exam style: a circuit read off its Bode plot',
        q: md`A common-source stage (one pole, from $C_L = 1\,\text{pF}$ at its output) has a Bode magnitude that is flat at $40\,\text{dB}$ and whose straight line crosses $0\,\text{dB}$ at $10^9\,\text{rad/s}$. Find $\omega_p$, then $g_m$ and the output resistance $R$ (where $|A_v(0)| = g_mR$ and $\omega_p = 1/(RC_L)$).`,
        figHtml: EB.svg({ k: -100, poles: [1e7] }, { exact: false, marks: [{ w: 1e9, n: '0\\,\\text{dB}' }] }),
        parts: [K.wPart('\\omega_p', 1e7, { traps: [{ v: 1e9 / 40, msg: 'The line falls $20\\,\\text{dB}$ per **decade**: $40\\,\\text{dB}$ is two decades.' }] }), K.part('g_m', 1e9 * 1e-12, [[1e-3, 'mS']]), K.rPart('R', 100 / (1e9 * 1e-12))],
        hints: [md`$40\,\text{dB}$ at $-20\,\text{dB/dec}$ takes two decades. The crossing is $g_m/C_L$.`],
        sol: md`$40\,\text{dB}$ ($|A_v(0)| = 100$) falling at $20\,\text{dB}$ per decade reaches $0\,\text{dB}$ two decades past the corner: $\omega_p = 10^9/100 = 10^7\,\text{rad/s}$. The crossing is the gain-bandwidth product $g_m/C_L$, so $g_m = 10^9\times1\,\text{pF} = 1\,\text{mS}$; then $R = 100/g_m = 100\,\text{k}\Omega$. Check: $1/(RC_L) = 1/(100\,\text{k}\Omega\times1\,\text{pF}) = 10^7$ ✓.`,
      }),
      G('bk_read', { need: 4 }),
      G('bk_unity', { need: 3 }),
    ],
  });

  // ================================================================ 7. Chapter 11 problems
  const prJ = { k: 1000, poles: [1e3, 1e5] };
  const prN = { k: 1000, zeros: [1e4], poles: [1e2, 1e6, 1e7] };
  const prP = { k: -100, rhp: [1e9], poles: [1e6, 1e8] };
  const csIn = [['Vac', [-1.6, 1.4], [-1.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-1.6, 2.4]], ['w', [-1.6, 1.4], [-1.6, 1], [-1.3, 1]], ['R', [-1.3, 1], [-0.1, 1], { n: 'R_S' }],
    ['w', [-0.1, 1], [0, 1]], ['C', [0, 1], [0, 2.4], { n: 'C_{in}', side: 'l' }], ['gnd', [0, 2.4]], ['nmos', [1, 1]], ['gnd', [1, 2]],
    ['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [2.6, 0]], ['C', [1.9, 0], [1.9, 1.2], { n: 'C_L' }], ['gnd', [1.9, 1.2]], ['term', [2.6, 0], { n: 'v_{out}' }]];
  const w3two = (a, r) => { const r2 = r * r, B = 1 + 1 / r2, A = 1 / r2; return a * Math.sqrt(2 / (B + Math.sqrt(B * B + 4 * A))); };
  L({
    id: 'bk11-problems', title: 'Chapter 11 problems', kind: 'review', ref: 'Lectures 25, 27',
    steps: [
      RF(md`
        ### Chapter 11 in one page

        **1. Decibels:** $|H|_{\text{dB}} = 20\log_{10}|H|$ (voltage, so 20). $\times10\to+20\,\text{dB}$, $\times2\to+6\,\text{dB}$; products become sums. A power law $\omega^n$ is a straight line of slope $20n\,\text{dB/dec}$. ([section](#/l/bk11-db))

        [[fig:pow]]

        **2. One pole** $A_{dc}/(1 + s/\omega_p)$: flat at $20\log_{10}|A_{dc}|$, then $-20\,\text{dB/dec}$; the lines meet at $\omega_p$, where the curve is $3\,\text{dB}$ under them, and $\omega_{-3\text{dB}} = \omega_p$ exactly. Phase: $0^\circ$ up to $0.1\omega_p$, $-45^\circ$/decade through $-45^\circ$ at $\omega_p$, $-90^\circ$ from $10\omega_p$; never more than $5.7^\circ$ off. A negative $A_{dc}$ adds $180^\circ$. ([section](#/l/bk11-pole))

        [[fig:pole]]
      `, { pow: { svg: powFig, cap: 'Power laws are straight lines.' }, pole: plot(pole1, { show: 'both', marks: [{ w: 1e2, n: '0.1\\omega_p' }, { w: 1e3, n: '\\omega_p' }, { w: 1e4, n: '10\\omega_p' }], cap: 'One pole: straight lines (solid) and exact (dashed).' }) }),
      RF(md`
        **3. One zero** is a pole upside down: $+20\,\text{dB/dec}$, $3\,\text{dB}$ above at the corner, phase $0\to+90^\circ$. **A right-half-plane zero** $1 - s/\omega_z$: the magnitude of a zero, the phase of a pole. **$s$ alone:** $+20\,\text{dB/dec}$ everywhere through $0\,\text{dB}$ at $\omega_0$, always $+90^\circ$. ([section](#/l/bk11-zero))

        [[fig:mir]]

        **4. Many factors add:** slope $= 20\times(\text{zeros passed} - \text{poles passed})$; phase $=$ the sum of the ramps; a double pole is $-40\,\text{dB/dec}$ and $6\,\text{dB}$ down at its corner. ([section](#/l/bk11-many))

        [[fig:sum]]

        **5. Sketching** is a checklist: standard form, corners in order, the magnitude walk, the phase breakpoints, the check. ([section](#/l/bk11-sketch))

        **6. Reading back:** the level gives $|k|$, the kinks the corners (down: pole, up: zero), the phase the sign and the right-half-plane zeros. $\omega_{-3\text{dB}}\approx\omega_{p1}$ for a dominant pole ($0.644\,\omega_p$ for two equal poles); $\omega_u\approx A_0\omega_p$ for one pole, $\sqrt{A_0\omega_{p1}\omega_{p2}}$ when the line crosses past a second pole. ([section](#/l/bk11-read))
      `, { mir: { svg: mirrorFig, cap: '$1 + jx$ and $1 - jx$: the same length, opposite angles.' }, sum: { svg: sumFig, cap: 'Products become sums.' } }),
      P({
        id: 'bk11-pr-a', title: 'Decibels both ways',
        q: md`(a) $0.002$ in dB. (b) $66\,\text{dB}$ as a ratio.`,
        parts: [K.plain('(a)', 20 * L10(0.002), 'dB', { tol: { abs: 0.3 } }), K.plain('(b)', 10 ** (66 / 20), 'V/V')],
        hints: [md`$0.002 = 2/1000$; $66 = 60 + 6$.`],
        sol: md`(a) $0.002 = 2\times10^{-3}$: $6 - 60 = -54\,\text{dB}$. (b) $66 = 60 + 6\to1000\times2 = 2000$ (exactly $1995$).`,
      }),
      P({
        id: 'bk11-pr-b', title: 'A chain in decibels',
        q: md`Three stages have loaded gains of $34\,\text{dB}$, $-6\,\text{dB}$ and $20\,\text{dB}$. Find the overall gain in dB and as a ratio.`,
        parts: [K.plain('|A|_{dB}', 48, 'dB', { tol: { abs: 0.3 } }), K.plain('|A|', 10 ** (48 / 20), 'V/V', { traps: [{ v: 50 * 0.5 + 10, msg: 'Ratios multiply: $50\\times0.5\\times10$.' }] })],
        hints: [md`Decibels add: $34 - 6 + 20$. As ratios: $34\,\text{dB}\approx50$, $-6\,\text{dB}\approx0.5$, $20\,\text{dB} = 10$.`],
        sol: md`$34 - 6 + 20 = 48\,\text{dB}$. As ratios: $50\times0.5\times10 = 250$ (exactly $10^{48/20} = 251$).`,
      }),
      P({
        id: 'bk11-pr-c', title: 'Three times the corner',
        q: md`$H(s) = \dfrac{1000}{1 + s/\omega_p}$. At $\omega = 3\,\omega_p$ find the straight-line and the exact $|H|_{\text{dB}}$.`,
        parts: [K.plain('\\text{line}', 60 - 20 * L10(3), 'dB', { tol: { abs: 0.2 } }), K.plain('\\text{exact}', 60 - 10 * L10(10), 'dB', { tol: { abs: 0.1 } })],
        hints: [md`$3\times$ is $0.477$ decade. Exact: $60 - 10\log_{10}(1 + 9)$.`],
        sol: md`Line: $60 - 20\times0.477 = 50.46\,\text{dB}$. Exact: $60 - 10\log_{10}10 = 50\,\text{dB}$. Error $-0.46\,\text{dB}$ ($= -10\log_{10}(1 + 1/9)$).`,
      }),
      P({
        id: 'bk11-pr-d', title: 'Phase at an octave',
        q: md`$H(s) = \dfrac{10}{1 + s/10^4}$. At $2\times10^4\,\text{rad/s}$ find the straight-line and exact phase.`,
        parts: [K.plain('\\text{line}', -45 * (1 + L10(2)), '°', { tol: { abs: 0.5 } }), K.plain('\\text{exact}', -Math.atan(2) * DEG, '°', { tol: { abs: 0.3 } })],
        hints: [md`Line: $-45^\circ(1 + \log_{10}2)$.`],
        sol: md`Line: $-45^\circ\times1.301 = -58.5^\circ$. Exact: $-\tan^{-1}2 = -63.4^\circ$ (the line is $4.9^\circ$ off).`,
      }),
      P({
        id: 'bk11-pr-e', title: 'A zero above a small gain',
        q: md`$H(s) = 0.1\,(1 + s/10^3)$. Straight-line $|H|_{\text{dB}}$ and phase at $10^5\,\text{rad/s}$?`,
        parts: [K.plain('|H|_{dB}', 20, 'dB', { tol: { abs: 0.3 }, traps: [{ v: -60, msg: 'A zero raises the line: $-20 + 40$.' }] }), K.plain('\\angle H', 90, '°', { tol: { abs: 1 } })],
        hints: [md`$-20\,\text{dB}$ flat, then $+20\,\text{dB/dec}$ for two decades.`],
        sol: md`$-20 + 2\times20 = 20\,\text{dB}$; the ramp finished at $10^4$: $+90^\circ$.`,
      }),
      P({
        id: 'bk11-pr-f', title: 'A right-half-plane zero above the corner',
        q: md`$H(s) = 5\,(1 - s/10^6)$. Straight-line $|H|_{\text{dB}}$ and phase at $10^7\,\text{rad/s}$?`,
        parts: [K.plain('|H|_{dB}', 20 * L10(5) + 20, 'dB', { tol: { abs: 0.3 } }), K.plain('\\angle H', -90, '°', { tol: { abs: 1 }, traps: [{ v: 90, msg: 'A right-half-plane zero lags.' }] })],
        hints: [md`$5\to14\,\text{dB}$; magnitude like a zero, phase like a pole.`],
        sol: md`$14 + 20 = 34\,\text{dB}$; phase $-90^\circ$ (ramp finished at $10^7$).`,
      }),
      P({
        id: 'bk11-pr-g', title: 'An $s$ and a pole',
        q: md`$H(s) = \dfrac{s/10^4}{1 + s/10^6}$. Straight-line $|H|_{\text{dB}}$ at $10^5$ and at $10^7\,\text{rad/s}$, and the straight-line phase at $10^5$.`,
        parts: [K.plain('10^5', 20, 'dB', { tol: { abs: 0.3 } }), K.plain('10^7', 40, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 60, msg: 'The pole at $10^6$ flattens the line: the $s$ and the pole cancel slopes above it.' }] }), K.plain('\\angle H\\ (10^5)', 90, '°', { tol: { abs: 1 } })],
        hints: [md`$|s/10^4| = \omega/10^4$ rises $20\,\text{dB/dec}$ until the pole at $10^6$ flattens it.`],
        sol: md`At $10^5$: $\omega/10^4 = 10\to20\,\text{dB}$. Up to $10^6$: $40\,\text{dB}$; then flat: $40\,\text{dB}$ at $10^7$. Phase at $10^5$: $+90^\circ$, and the pole's ramp only starts at $10^5$: $+90^\circ$.`,
      }),
      P({
        id: 'bk11-pr-h', title: 'Normalize, then walk',
        q: md`$$H(s) = \frac{10^7\,(s + 10^2)}{(s + 10)(s + 10^5)}$$
Find $|H(0)|_{\text{dB}}$, and the straight-line $|H|_{\text{dB}}$ at $10^4$ and at $10^6\,\text{rad/s}$.`,
        parts: [K.plain('|H(0)|_{dB}', 60, 'dB', { tol: { abs: 0.3 }, traps: [{ v: 140, msg: 'Normalize first: $k = 10^7\\times10^2/(10\\times10^5)$.' }] }), K.plain('10^4', 40, 'dB', { tol: { abs: 0.3 } }), K.plain('10^6', 20, 'dB', { tol: { abs: 0.3 } })],
        hints: [md`$k = 10^3$. Pole at $10$, zero at $10^2$, pole at $10^5$.`],
        sol: md`$k = \dfrac{10^7\times10^2}{10\times10^5} = 10^3\to60\,\text{dB}$. $-20$ from $10$ to $10^2$: $40\,\text{dB}$; flat to $10^5$ (so $40$ at $10^4$); $-20$ beyond: $20\,\text{dB}$ at $10^6$.`,
      }),
      P({
        id: 'bk11-pr-i', title: 'The same, in phase',
        q: md`Same $H(s)$. Straight-line phase at $10$ and at $10^3\,\text{rad/s}$?`,
        parts: [K.plain('10', -45, '°', { tol: { abs: 1 } }), K.plain('10^3', 0, '°', { tol: { abs: 1 } })],
        hints: [md`Ramps: pole $10$ over $1\ldots10^2$; zero $10^2$ over $10\ldots10^3$; pole $10^5$ over $10^4\ldots10^6$.`],
        sol: md`At $10$: the pole is half-way ($-45^\circ$), the zero just starting: $-45^\circ$. At $10^3$: pole done ($-90^\circ$), zero done ($+90^\circ$), the last pole not started: $0^\circ$.`,
      }),
      P({
        id: 'bk11-pr-j', title: 'Read two poles',
        q: md`From the straight-line plot, find $|k|$, the two poles, and where the line crosses $0\,\text{dB}$.`,
        figHtml: EB.svg(prJ, { exact: false }),
        parts: [K.plain('|k|', 1000, 'V/V'), K.wPart('\\omega_{p1}', 1e3), K.wPart('\\omega_{p2}', 1e5), K.wPart('\\omega_u\\ (\\text{line})', 10 ** 5.5, { traps: [{ v: 1e6, msg: 'After $10^5$ the line falls $40\\,\\text{dB}$ per decade.' }] })],
        hints: [md`$60\,\text{dB}$ on the left; it is at $20\,\text{dB}$ at $10^5$ and then falls $40$ per decade.`],
        sol: md`$|k| = 1000$; poles at $10^3$ and $10^5$. At $10^5$ the line is at $60 - 40 = 20\,\text{dB}$, then $-40\,\text{dB/dec}$: $0\,\text{dB}$ half a decade later, $10^{5.5} = 3.16\times10^5\,\text{rad/s}$ $(= \sqrt{A_0\omega_{p1}\omega_{p2}})$.`,
      }),
      P({
        id: 'bk11-pr-k', title: 'The bandwidth with a nearby pole',
        q: md`$H(s) = \dfrac{A_0}{(1 + s/10^4)(1 + s/10^5)}$. Find the exact $-3\,\text{dB}$ frequency.`,
        parts: [K.wPart('\\omega_{-3dB}', w3two(1e4, 10), { traps: [{ v: 1e4, msg: 'Close, but the pole at $10^5$ costs a little: solve $(1 + x^2)(1 + x^2/100) = 2$.' }] })],
        hints: [md`$u = x^2$: $u^2/100 + 1.01u - 1 = 0$.`],
        sol: md`$u = \dfrac{-1.01 + \sqrt{1.0201 + 0.04}}{0.02} = 0.9806$, $x = 0.990$: $\omega_{-3\text{dB}} = 9.90\times10^3\,\text{rad/s}$, $1\%$ below the dominant pole.`,
      }),
      P({
        id: 'bk11-pr-l', title: 'Unity gain, one pole, small gain',
        q: md`$H(s) = \dfrac{20}{1 + s/10^6}$. Exact unity-gain frequency? Compare with $A_0\omega_p$.`,
        parts: [K.wPart('\\omega_u', 1e6 * Math.sqrt(399))],
        hints: [md`$20/\sqrt{1 + x^2} = 1$.`],
        sol: md`$1 + x^2 = 400$, $x = \sqrt{399} = 19.97$: $\omega_u = 1.997\times10^7\,\text{rad/s}$, $0.1\%$ below $A_0\omega_p = 2\times10^7$.`,
      }),
      P({
        id: 'bk11-pr-m', title: 'Corners from the slopes',
        q: md`Walking left to right, a straight-line magnitude plot has slopes $0$, then $-20$, then $-40$, then $-20\,\text{dB/dec}$. What are its three corners, in order?`,
        parts: [{ lbl: 'Choose one', mc: ['pole, pole, zero', 'pole, zero, pole', 'zero, zero, pole', 'pole, pole, pole'], a: 0,
          why: [null, 'After a zero the slope would go back up, from $-20$ to $0$, not down to $-40$.', 'A zero first would make it rise.', 'A third pole would make it $-60$.'] }],
        hints: [md`Each pole: $-20$ more; each zero: $+20$ more.`],
        sol: md`$0\to-20$: a pole. $-20\to-40$: another pole. $-40\to-20$: a zero.`,
      }),
      P({
        id: 'bk11-pr-n', title: 'Exam style 1: a four-corner sketch', big: true,
        q: md`$$H(s) = \frac{10^{14}\,(s + 10^4)}{(s + 10^2)(s + 10^6)(s + 10^7)}$$
(a) $|H(0)|_{\text{dB}}$. (b) The straight-line $|H|_{\text{dB}}$ at $10^3$, $10^5$ and $10^8\,\text{rad/s}$. (c) The final slope. (d) The straight-line phase at $10^5$. (e) Where the straight line crosses $0\,\text{dB}$.`,
        parts: [K.plain('(a)', 60, 'dB', { tol: { abs: 0.3 } }), K.plain('(b)\\ 10^3', 40, 'dB', { tol: { abs: 0.3 } }), K.plain('(b)\\ 10^5', 20, 'dB', { tol: { abs: 0.3 } }), K.plain('(b)\\ 10^8', -40, 'dB', { tol: { abs: 0.3 } }),
          K.plain('(c)', -40, 'dB/dec', { tol: { abs: 0.5 } }), K.plain('(d)', 0, '°', { tol: { abs: 1 } }), K.wPart('(e)', 1e7)],
        hints: [md`$k = 10^{14}\times10^4/(10^2\times10^6\times10^7) = 10^3$.`, md`Walk: $60$ to $10^2$; $-20$ to $10^4$; flat to $10^6$; $-20$ to $10^7$; $-40$ after.`],
        sol: md`**(a)** $k = \dfrac{10^{14}\times10^4}{10^{15}} = 10^3\to60\,\text{dB}$:
$$${EB.tex(prN)}$$
**(b)** $60\,\text{dB}$ to $10^2$; $-20$: $40\,\text{dB}$ at $10^3$, $20\,\text{dB}$ at $10^4$; flat (the zero) to $10^6$, so $20\,\text{dB}$ at $10^5$; $-20$ to $10^7$ ($0\,\text{dB}$); $-40$: $-40\,\text{dB}$ at $10^8$.
**(c)** $20(1 - 3) = -40\,\text{dB/dec}$.
**(d)** At $10^5$: pole $10^2$ done ($-90^\circ$); zero $10^4$ done ($+90^\circ$); pole $10^6$ starting ($0$); pole $10^7$ not started: $0^\circ$.
**(e)** The line is at $0\,\text{dB}$ exactly at $10^7\,\text{rad/s}$.

[[fig:p]]`,
        figs: { p: plot(prN, { show: 'both', marks: [{ w: 1e3, n: '10^{3}' }, { w: 1e5, n: '10^{5}' }, { w: 1e8, n: '10^{8}' }] }) },
      }),
      P({
        id: 'bk11-pr-o', title: 'Exam style 2: a common source with two node poles', big: true,
        q: md`A common source is driven through $R_S = 10\,\text{k}\Omega$; its gate node has $C_{in} = 0.1\,\text{pF}$ to ground and its output has $C_L = 2\,\text{pF}$; $g_m = 4\,\text{mS}$, $R_D = 5\,\text{k}\Omega$, $r_{ds}\to\infty$ (ignore $C_{gd}$, so each node has its own pole: [Chapter 12](#/l/bk12-node)).
(a) $|A_v(0)|$ in dB. (b) The two poles, low first. (c) The straight-line $|A_v|_{\text{dB}}$ at $10^9\,\text{rad/s}$. (d) Where the straight line crosses $0\,\text{dB}$. (e) The exact $\omega_{-3\text{dB}}$. (f) The straight-line phase at $10^9$ ($-$ sign as $+180^\circ$).`,
        fig: csIn,
        parts: [K.plain('(a)', 20 * L10(20), 'dB', { tol: { abs: 0.3 } }), K.wPart('(b)\\ \\omega_{p1}', 1e8), K.wPart('(b)\\ \\omega_{p2}', 1e9), K.plain('(c)', 20 * L10(20) - 20, 'dB', { tol: { abs: 0.3 } }),
          K.wPart('(d)', 1e9 * 10 ** ((20 * L10(20) - 20) / 40), { traps: [{ v: 2e9, msg: 'Past $10^9$ the line falls $40\\,\\text{dB/dec}$.' }] }), K.wPart('(e)', w3two(1e8, 10)), K.plain('(f)', 45, '°', { tol: { abs: 1 }, accept: [-315] })],
        hints: [md`Gate node: $R_S$ to the (zeroed) source and nothing into the gate: $\omega_{in} = 1/(R_SC_{in})$. Output: $\omega_{out} = 1/(R_DC_L)$.`, md`$A_v(s) = \dfrac{-g_mR_D}{(1 + s/\omega_{in})(1 + s/\omega_{out})}$.`],
        sol: md`**(a)** $g_mR_D = 20\to26\,\text{dB}$ (inverting).
**(b)** $\omega_{out} = 1/(5\,\text{k}\Omega\times2\,\text{pF}) = 10^8$; $\omega_{in} = 1/(10\,\text{k}\Omega\times0.1\,\text{pF}) = 10^9\,\text{rad/s}$. So $\omega_{p1} = 10^8$ (the output) and $\omega_{p2} = 10^9$.
**(c)** One decade at $-20$: $26 - 20 = 6\,\text{dB}$ at $10^9$.
**(d)** Then $-40\,\text{dB/dec}$: $0\,\text{dB}$ after $6/40 = 0.15$ decade: $1.41\times10^9\,\text{rad/s}$.
**(e)** $(1 + x^2)(1 + x^2/100) = 2$: $x = 0.990$, $\omega_{-3\text{dB}} = 9.90\times10^7\,\text{rad/s}$ ($15.8\,\text{MHz}$).
**(f)** $180^\circ - 90^\circ$ (the $10^8$ pole, done at $10^9$) $- 45^\circ$ (the $10^9$ pole, at its corner) $= 45^\circ$.

[[fig:p]]`,
        figs: { p: plot({ k: -20, poles: [1e8, 1e9] }, { show: 'both', marks: [{ w: 1e8, n: '\\omega_{p1}' }, { w: 1e9, n: '\\omega_{p2}' }] }) },
      }),
      P({
        id: 'bk11-pr-p', title: 'Exam style 3: read it, then find the crossover', big: true,
        q: md`The straight-line plots below belong to an amplifier. (a) Find $|k|$. (b) Which $H(s)$ is it? (c) Where does the magnitude line cross $0\,\text{dB}$? (d) What is the straight-line phase there?`,
        figHtml: EB.svg(prP, { show: 'both', exact: false }),
        parts: [K.plain('(a)\\ |k|', 100, 'V/V'),
          { lbl: '(b)', mc: [`$${EB.tex(prP)}$`, `$${EB.tex({ k: 100, rhp: [1e9], poles: [1e6, 1e8] })}$`, `$${EB.tex({ k: -100, zeros: [1e9], poles: [1e6, 1e8] })}$`, `$${EB.tex({ k: -100, poles: [1e6, 1e8, 1e9] })}$`], a: 0,
            why: [null, 'The phase starts at $180^\\circ$: $k < 0$.', 'At $10^9$ the phase goes **down** while the magnitude levels off: a right-half-plane zero.', 'At $10^9$ the magnitude slope goes **up** (to $-20$), so it is a zero.'] },
          K.wPart('(c)\\ \\omega_u', 1e8), K.plain('(d)', 45, '°', { tol: { abs: 1 }, accept: [-315] })],
        hints: [md`$40\,\text{dB}$ to $10^6$, $-20$ to $10^8$...`, md`At $10^8$: the $10^6$ pole is done, the $10^8$ pole is half-way, the zero's ramp only starts at $10^8$.`],
        sol: md`**(a)** $40\,\text{dB}\Rightarrow|k| = 100$; the phase starts at $180^\circ$, so $k = -100$.
**(b)** Down at $10^6$ and $10^8$ (poles); at $10^9$ the magnitude slope goes back up by 20 while the phase keeps falling: a right-half-plane zero. $$${EB.tex(prP)}$$
**(c)** $40\,\text{dB}$ at $10^6$, then $-20\,\text{dB/dec}$ for two decades: $0\,\text{dB}$ at $10^8\,\text{rad/s}$.
**(d)** $180^\circ - 90^\circ - 45^\circ - 0^\circ = 45^\circ$ at $10^8$.`,
      }),
      G('bk_db', { need: 8, pool: ['bk_db', 'bk_pole', 'bk_zero', 'bk_asy', 'bk_phase', 'bk_sketch', 'bk_read', 'bk_unity'] }),
    ],
  });

  // @@END
})();

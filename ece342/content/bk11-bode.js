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

  // @@END
})();

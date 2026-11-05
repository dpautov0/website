/* Unit 13 — frequency response and Bode plots (uploaded Lectures 25 and 27): what a frequency response is, the
   common source with a load capacitor (the first pole), decibels, the one-pole and one-zero straight-line rules,
   many poles and zeros, negative gains, the right-half-plane zero, s at the origin, and reading a plot back into H(s).
   Plots are drawn by E3Bode (js/gens-e3-bode.js); every number was checked by exact complex evaluation. */
(function () {
  'use strict';
  const { R, RF, P, G, Q } = C;
  const B = window.E3Bode;
  const L = (l) => E3.lesson('e3u13', l);
  const plot = (sp, o = {}) => ({ svg: B.svg(sp, o), cap: o.cap });

  // the common source with a load capacitor
  const csCL = [['rail', [1, -1.2]], ['R', [1, -1.2], [1, 0], { n: 'R_D' }], ['w', [1, 0], [2.6, 0]], ['term', [2.6, 0], { n: 'v_{out}' }],
    ['C', [2, 0], [2, 1.2], { n: 'C_L' }], ['gnd', [2, 1.2]], ['nmos', [1, 1]], ['gnd', [1, 2]],
    ['w', [0, 1], [-0.6, 1], [-0.6, 1.4]], ['Vac', [-0.6, 1.4], [-0.6, 2.4], { n: 'v_{in}', side: 'l' }], ['gnd', [-0.6, 2.4]]];
  // the same stage seen from its output: G_M v_in into R_D parallel C_L
  const nortonCL = [['G', [0.6, 0], [0.6, 1.8], { n: 'g_mv_{in}', side: 'l' }], ['w', [0.6, 0], [3.6, 0]], ['R', [1.8, 0], [1.8, 1.8], { n: 'R_D' }],
    ['C', [2.9, 0], [2.9, 1.8], { n: 'C_L' }], ['w', [0.6, 1.8], [2.9, 1.8]], ['gnd', [1.8, 1.8]], ['term', [3.6, 0], { n: 'v_{out}' }]];
  // a high-pass: coupling capacitor into a resistor
  const hp = [['Vac', [0, 0.4], [0, 1.4], { n: 'v_{in}', side: 'l' }], ['gnd', [0, 1.4]], ['w', [0, 0.4], [0, 0], [0.4, 0]], ['C', [0.4, 0], [1.6, 0], { n: 'C' }],
    ['w', [1.6, 0], [2.6, 0]], ['R', [2, 0], [2, 1.4], { n: 'R' }], ['gnd', [2, 1.4]], ['term', [2.6, 0], { n: 'v_{out}' }]];

  const ex1 = { k: 100, zeros: [1e4], poles: [1e2, 1e6] };

  // ================================================================ 1. what a frequency response is
  L({
    id: 'e3-u13-what', title: 'What a frequency response is: the first pole', ref: 'Lecture 25',
    steps: [
      R(md`
        ### Why this lesson

        One of the three Exam 3 problems is about frequency: sketch a Bode plot, or find where the gain starts to drop (the bandwidth). Everything in Units 13 to 15 grows out of one picture: **a capacitor at a node of an amplifier**. This lesson builds that picture from the common source you already know, and names the three things every later lesson uses: the transfer function $H(s)$, the pole $\omega_p$, and the $-3\,\text{dB}$ point.
      `),
      R(md`
        ### Sine in, sine out

        Feed an amplifier a sine wave $v_{in} = A_{in}\sin\omega t$. Because the small-signal circuit is linear, the output is **a sine at the same frequency**, only scaled and shifted: $v_{out} = A_{out}\sin(\omega t + \phi)$.

        At low frequency the output is big. Raise the frequency and, past some point, the output shrinks. Measure $|A_v| = A_{out}/A_{in}$ at many frequencies and plot it against frequency: that curve is the **magnitude response**. The shift $\phi$ against frequency is the **phase response**. Together they are the frequency response.

        Why does the gain fall? Capacitors. A capacitor's impedance $1/(j\omega C)$ is huge at low frequency (an open circuit, the way you have treated every transistor capacitance so far) and small at high frequency, where it starts to short signal current to ground.
      `),
      R(md`
        ### The common source with a load capacitor

        Start with the stage you know cold: $A_v = -g_mR_D$, the same at every frequency (its plot is a flat line). Now hang a capacitor $C_L$ on the output, as any real load does.
      `, csCL),
      R(md`
        ### Nothing about the input changes. Only $R_{out}$ does.

        Use the Exam 2 method ([Unit 8, $G_MR_{out}$](#/l/e2-u8-gmrout)). Short the output: $C_L$ is shorted too, so $G_M = g_m$ exactly as before. The output resistance is now $R_D$ **in parallel with the capacitor's impedance** $1/(sC_L)$:
        $$R_{out}(s) = R_D\parallel\frac{1}{sC_L} = \frac{R_D}{1 + sR_DC_L}$$
        $$A_v(s) = -G_MR_{out}(s) = \frac{-g_mR_D}{1 + sR_DC_L} = \frac{-g_mR_D}{1 + s/\omega_p},\qquad \omega_p = \frac{1}{R_DC_L}$$

        Here $s$ stands for $j\omega$. The frequency $\omega_p$ is the **pole** (the factor $1 + s/\omega_p$ in the denominator; the actual pole of $H(s)$ sits at $s = -\omega_p$, which is why the notes write $-1/(R_DC_L)$ once).

        **Recognize it on sight:** one node, a resistance $R$ to ground, a capacitance $C$ to ground: a pole at $\omega_p = 1/(RC)$. Here $R = R_D$ (with $r_{ds}$ in parallel if it is not infinite).
      `, nortonCL),
      R(md`
        ### What the pole does

        Take the magnitude, with $s = j\omega$:
        $$|A_v(j\omega)| = \frac{g_mR_D}{\sqrt{1 + (\omega/\omega_p)^2}}$$
        - $\omega\ll\omega_p$: the square root is about 1. Flat: $|A_v|\approx g_mR_D$.
        - $\omega = \omega_p$: $\sqrt2$. The gain is down to $0.707$ of its flat value, which is $-3\,\text{dB}$. That is why $\omega_p$ is called the **$-3\,\text{dB}$ frequency** or the **bandwidth**.
        - $\omega\gg\omega_p$: the square root is about $\omega/\omega_p$. The gain falls as $1/\omega$: ten times the frequency, a tenth of the gain.

        The notes plot this three ways: linear axes (tedious, hard to read), semi-log, and **log-log**. On log-log axes the $1/\omega$ fall is a **straight line**. That is the Bode plot, next lessons.

        **Hertz or rad/s?** $\omega$ is in rad/s; $f = \omega/2\pi$ is in hertz. A pole at $\omega_p = 10^8\,\text{rad/s}$ is $f_p = 15.9\,\text{MHz}$. Read every question for which one it wants.
      `, null),
      RF(md`
        [[fig:one]]
      `, { one: plot({ k: 40, poles: [1e8] }, { marks: [{ w: 1e8, n: '\\omega_p' }], pts: [{ w: 1e8, on: 'exact', n: '-3\\,\\text{dB}', side: 'dl' }], cap: 'The common source with $g_mR_D = 40$ ($32\\,\\text{dB}$) and $\\omega_p = 10^8\\,\\text{rad/s}$. Solid: the two straight lines; dashed: the real curve, $3\\,\\text{dB}$ under the corner.' }) }),
      Q(md`The output of a common source sees $R_D = 10\kO$ and $C_L = 1\,\text{pF}$. At $\omega = 10^8\,\text{rad/s}$, the gain compared with its low-frequency value is...`,
        ['$1/\\sqrt2\\approx0.707$ of it ($-3\\,\\text{dB}$)', 'Half of it ($-6\\,\\text{dB}$)', 'Unchanged', 'A tenth of it ($-20\\,\\text{dB}$)'], 0,
        [null, 'At the pole the denominator is $|1 + j| = \\sqrt2$, not 2.', '$\\omega_p = 1/(R_DC_L) = 10^8\\,\\text{rad/s}$: this **is** the pole, where the drop is already $3\\,\\text{dB}$.', 'A tenth happens a decade **above** the pole, at $10^9\\,\\text{rad/s}$.'],
        md`$\omega_p = 1/(10^4\times10^{-12}) = 10^8\,\text{rad/s}$, exactly this frequency. $|1 + j\omega/\omega_p| = |1 + j| = \sqrt2$: the gain is $0.707$ of its flat value, $-3\,\text{dB}$.`),
      Q(md`You double $C_L$. What happens to the bandwidth $\omega_p$ and to the low-frequency gain?`,
        ['$\\omega_p$ halves; the low-frequency gain is unchanged', 'Both halve', '$\\omega_p$ doubles; the gain is unchanged', '$\\omega_p$ is unchanged; the gain halves'], 0,
        [null, 'At low frequency $C_L$ is an open circuit: it cannot change $g_mR_D$.', 'A bigger capacitor shorts the output sooner: the pole moves **down**, $\\omega_p = 1/(R_DC_L)$.', '$C_L$ appears only in $\\omega_p$.'],
        md`$\omega_p = 1/(R_DC_L)$ halves. The flat gain $g_mR_D$ is set with $C_L$ open, so it does not move. A bigger $R_D$ would raise the gain **and** lower $\omega_p$ by the same factor: their product, the gain-bandwidth $g_m/C_L$, stays put.`),
      Q(md`Far above the pole, the gain of this stage...`,
        ['falls in proportion to $1/\\omega$: $\\times10$ in frequency, $\\div10$ in gain', 'falls as $1/\\omega^2$', 'stays at $0.707$ of the low-frequency value', 'drops to zero right after $\\omega_p$'], 0,
        [null, 'That needs two poles. One capacitor gives one power of $\\omega$.', '$0.707$ is the value **at** the pole only.', 'The fall is gradual: $1/\\omega$, a straight line on a log-log plot.'],
        md`For $\omega\gg\omega_p$, $|1 + j\omega/\omega_p|\approx\omega/\omega_p$, so $|A_v|\approx g_mR_D\,\omega_p/\omega = g_m/(\omega C_L)$. In decibels, $-20\,\text{dB}$ per decade.`),
      P({
        id: 'e3-u13-cs1', title: 'A common source with a load capacitor',
        q: md`Common source with $g_m = 4\,\text{mS}$, $r_{ds}\to\infty$, $R_D = 10\kO$, $C_L = 1\,\text{pF}$ (ignore the transistor's own capacitances). Find the low-frequency gain magnitude, its value in dB, the pole $\omega_p$, and $f_{3\text{dB}}$.`,
        fig: csCL,
        parts: [
          { lbl: '|A_v(0)|', unit: 'V/V', ans: 40 },
          { lbl: '|A_v(0)|_{dB}', unit: 'dB', ans: 20 * Math.log10(40), tol: { abs: 0.3 }, traps: [{ v: 10 * Math.log10(40), msg: 'Voltage gain: $20\\log_{10}$, not $10\\log_{10}$.' }] },
          { lbl: '\\omega_p', unit: 'Mrad/s', ans: 100, traps: [{ v: 100 / (2 * Math.PI), msg: 'That is $f_p$ in MHz. $\\omega_p$ is in rad/s.' }] },
          { lbl: 'f_{3dB}', unit: 'MHz', ans: 100 / (2 * Math.PI), traps: [{ v: 100, msg: 'That is $\\omega_p$ in Mrad/s. $f = \\omega/2\\pi$.' }] },
        ],
        hints: [md`$|A_v(0)| = g_mR_D$. In dB: $40 = 100/2.5$... or $40 = 10\times4$: $20 + 12 = 32\,\text{dB}$.`, md`$\omega_p = 1/(R_DC_L)$, $f = \omega_p/2\pi$.`],
        sol: md`$$|A_v(0)| = g_mR_D = 4\,\text{mS}\times10\kO = 40$$
$$20\log_{10}40 = 20\log_{10}10 + 20\log_{10}4 = 20 + 12 = 32\,\text{dB}$$
$$\omega_p = \frac{1}{R_DC_L} = \frac{1}{10^4\times10^{-12}} = 10^8\,\text{rad/s} = 100\,\text{Mrad/s},\qquad f_{3\text{dB}} = \frac{10^8}{2\pi} = 15.9\,\text{MHz}$$`,
      }),
      G('e3_f3db', { need: 4 }),
    ],
  });

  // ================================================================ 2. decibels
  L({
    id: 'e3-u13-db', title: 'Decibels and decades in your head', ref: 'Lectures 25, 27',
    steps: [
      R(md`
        ### Why this lesson

        Bode plots are drawn in decibels against $\log\omega$, because on those axes every pole and zero is a straight line and products become sums. The exam gives no calculator time for logs, so the conversions have to be automatic. Ten minutes here saves you on every Bode question.
      `),
      R(md`
        ### The definition, and the two facts that do all the work

        $$|H|_{\text{dB}} = 20\log_{10}|H|$$
        (For a voltage or current ratio. Power uses $10\log_{10}$; we never use that here.)

        Two facts build every number you will need:
        - $\times10$ is $+20\,\text{dB}$ (and $\div10$ is $-20\,\text{dB}$).
        - $\times2$ is about $+6\,\text{dB}$ (and $\div2$ is $-6\,\text{dB}$).

        Logs turn products into sums, so split the number into tens and twos:

        | $\lvert H\rvert$ | Built as | dB |
        |---|---|---|
        | 1 | | $0$ |
        | $\sqrt2\approx1.41$ | half of $\times2$ | $3$ |
        | 2 | | $6$ |
        | 4 | $2\times2$ | $12$ |
        | 5 | $10/2$ | $14$ |
        | 10 | | $20$ |
        | 20 | $10\times2$ | $26$ |
        | 50 | $100/2$ | $34$ |
        | 100 | $10\times10$ | $40$ |
        | 1000 | | $60$ |
        | $0.707$ | $1/\sqrt2$ | $-3$ |
        | $0.1$ | | $-20$ |

        Going back: $46\,\text{dB} = 40 + 6\to100\times2 = 200$. $28\,\text{dB} = 40 - 12\to100/4 = 25$.
      `),
      R(md`
        ### Decades and octaves

        The frequency axis is $\log\omega$. A **decade** is a factor of 10 in frequency; an **octave** is a factor of 2.

        A gain that falls as $1/\omega$ loses a factor 10 per decade: **$-20\,\text{dB/decade}$**, the same thing as **$-6\,\text{dB/octave}$**. A gain that falls as $1/\omega^2$: $-40\,\text{dB/dec}$. Rising as $\omega$: $+20\,\text{dB/dec}$. Slopes on a Bode plot only ever come in multiples of $20\,\text{dB/dec}$, one $20$ per pole or zero.
      `),
      Q(md`A gain of $500$ is how many dB?`, ['$54\\,\\text{dB}$', '$27\\,\\text{dB}$', '$50\\,\\text{dB}$', '$60\\,\\text{dB}$'], 0,
        [null, 'That is $10\\log_{10}500$, the power rule.', '$50\\,\\text{dB}$ would be $316$.', '$60\\,\\text{dB}$ is $1000$; $500$ is half of that, $6\\,\\text{dB}$ less.'],
        md`$500 = 1000/2$: $60 - 6 = 54\,\text{dB}$.`),
      Q(md`A filter's gain falls from $0\,\text{dB}$ to $-40\,\text{dB}$ over one decade of frequency. Its slope corresponds to...`,
        ['Two poles ($1/\\omega^2$)', 'One pole', 'Four poles', 'A zero'], 0,
        [null, 'One pole gives $-20\\,\\text{dB}$ per decade.', 'Each pole is $20\\,\\text{dB/dec}$: four would be $-80$.', 'A zero makes the gain **rise**.'],
        md`$-40\,\text{dB/dec} = 2\times(-20)$: two poles' worth, a gain falling as $1/\omega^2$.`),
      Q(md`$|H| = 0.05$. In dB?`, ['$-26\\,\\text{dB}$', '$-13\\,\\text{dB}$', '$26\\,\\text{dB}$', '$-20\\,\\text{dB}$'], 0,
        [null, 'That is the power rule ($10\\log$).', 'A gain below 1 is a negative number of dB.', '$-20\\,\\text{dB}$ is $0.1$; $0.05$ is half of that, another $-6\\,\\text{dB}$.'],
        md`$0.05 = 0.1/2$: $-20 - 6 = -26\,\text{dB}$.`),
      G('e3_db', { need: 8 }),
    ],
  });

  // ================================================================ 3. one pole
  L({
    id: 'e3-u13-pole', title: 'One pole: the straight-line magnitude and phase', ref: 'Lectures 25, 27',
    steps: [
      R(md`
        ### Why this lesson

        Every Bode plot on the exam is a stack of single poles and zeros. If you can draw **one** pole in your sleep, magnitude and phase, the rest is bookkeeping. The lecture's goal form is
        $$H(s) = A_v^{DC}\,\frac{(1 + s/\omega_{z1})(1 + s/\omega_{z2})\cdots}{(1 + s/\omega_{p1})(1 + s/\omega_{p2})\cdots}$$
        and this lesson is one factor $\dfrac{1}{1 + s/\omega_p}$.
      `),
      R(md`
        ### The complex numbers you need

        For a complex number $a + jb$: magnitude $\sqrt{a^2 + b^2}$, angle $\tan^{-1}(b/a)$. Put $s = j\omega$ and $x = \omega/\omega_p$:
        $$\left|\frac{1}{1 + jx}\right| = \frac{1}{\sqrt{1 + x^2}},\qquad \angle\frac{1}{1 + jx} = -\tan^{-1}x$$

        Three values to know by heart:

        | $\omega$ | $x$ | Magnitude | dB | Phase |
        |---|---|---|---|---|
        | $0.1\,\omega_p$ | $0.1$ | $0.995$ | $\approx0$ | $-5.7^\circ\approx0$ |
        | $\omega_p$ | $1$ | $0.707$ | $-3$ | $-45^\circ$ |
        | $10\,\omega_p$ | $10$ | $0.0995$ | $\approx-20$ | $-84^\circ\approx-90^\circ$ |
      `),
      R(md`
        ### Magnitude: two straight lines

        - Below $\omega_p$: flat at $20\log_{10}|A_{dc}|$.
        - Above $\omega_p$: falls at **$-20\,\text{dB/decade}$**.
        - The two lines meet at $\omega_p$, the **corner**. The real curve is $3\,\text{dB}$ under the corner and about $1\,\text{dB}$ under the lines an octave either side.

        ### Phase: three straight lines (the lecture's approximation)

        - Below $0.1\,\omega_p$: $0^\circ$. "The pole has no influence on the phase below $\omega_p/10$."
        - From $0.1\,\omega_p$ to $10\,\omega_p$: a ramp of **$-45^\circ$ per decade**, passing $-45^\circ$ exactly at $\omega_p$.
        - Above $10\,\omega_p$: $-90^\circ$.

        The straight lines are never off by more than $5.7^\circ$. **The picture to carry:** the magnitude bends at the corner; the phase starts a decade early and finishes a decade late.
      `),
      RF(md`
        [[fig:pole]]

        **Recognize it on sight:** a single $1 + s/\omega$ downstairs is a knee at $\omega$ that tips the magnitude down by $20\,\text{dB/dec}$, and a $90^\circ$ phase drop spread over the two decades around $\omega$.
      `, { pole: plot({ k: 10, poles: [1e3] }, { show: 'both', marks: [{ w: 1e2, n: '0.1\\omega_p' }, { w: 1e3, n: '\\omega_p' }, { w: 1e4, n: '10\\omega_p' }], cap: '$H(s) = 10/(1 + s/10^3)$. Solid: straight lines. Dashed: exact.' }) }),
      Q(md`$H(s) = \dfrac{10}{1 + s/10^3}$. Straight-line phase at $\omega = 10^4\,\text{rad/s}$?`,
        ['$-90^\\circ$', '$-45^\\circ$', '$0^\\circ$', '$-84^\\circ$, and the straight line says the same'], 0,
        [null, '$-45^\\circ$ is at the corner, $10^3$.', '$0^\\circ$ is below $0.1\\omega_p = 10^2$.', 'The exact value is $-84^\\circ$; the straight line reaches $-90^\\circ$ at $10\\omega_p$.'],
        md`$10^4 = 10\,\omega_p$: the ramp has finished, $-90^\circ$ (exact: $-\tan^{-1}10 = -84.3^\circ$).`),
      Q(md`Same $H(s)$. Straight-line magnitude at $\omega = 10^5\,\text{rad/s}$?`,
        ['$-20\\,\\text{dB}$', '$0\\,\\text{dB}$', '$20\\,\\text{dB}$', '$-40\\,\\text{dB}$'], 0,
        [null, '$0\\,\\text{dB}$ is where the line crosses unity, one decade above the corner.', '$20\\,\\text{dB}$ is the flat level, below $10^3$.', 'One pole falls $20\\,\\text{dB}$ per decade, and $10^5$ is two decades above the corner: $20 - 40$.'],
        md`Flat at $20\log_{10}10 = 20\,\text{dB}$ up to $10^3$, then $-20\,\text{dB/dec}$ for two decades: $20 - 40 = -20\,\text{dB}$.`),
      Q(md`At the corner of a single pole, the exact magnitude compared with the straight lines is...`,
        ['$3\\,\\text{dB}$ below the corner of the lines', 'Exactly on the lines', '$3\\,\\text{dB}$ above', '$6\\,\\text{dB}$ below'], 0,
        [null, 'The lines are an approximation; the biggest error is right at the corner.', 'A pole pulls the real curve **under** the lines.', '$|1 + j| = \\sqrt2$: that is $3\\,\\text{dB}$, not $6$.'],
        md`$1/|1 + j| = 1/\sqrt2$: $-3\,\text{dB}$ from the flat level, which is where both lines meet.`),
      G('e3_bode_phase', { need: 4, n: 1, pos: true }),
    ],
  });

  // ================================================================ 4. zeros, signs, RHP, origin
  L({
    id: 'e3-u13-zero', title: 'Zeros, negative gains, the right-half-plane zero, $s$ at the origin', ref: 'Lecture 27',
    steps: [
      R(md`
        ### Why this lesson

        Real amplifier transfer functions have more than poles: the common-source stage has a zero (Unit 14), every inverting stage has a negative DC gain, and a coupling capacitor puts an $s$ upstairs. Each is one small change to the one-pole picture, and each shows up on Bode questions as a trap.
      `),
      R(md`
        ### One zero: a pole turned upside down

        $$H(s) = A_{dc}\,(1 + s/\omega_z),\qquad |H| = |A_{dc}|\sqrt{1 + (\omega/\omega_z)^2},\qquad \angle H = \angle A_{dc} + \tan^{-1}(\omega/\omega_z)$$

        Everything flips sign: the magnitude is flat, then **rises at $+20\,\text{dB/dec}$** ("rolls up at $+6\,\text{dB}$ per octave"); the phase ramps **up** from $0$ to $+90^\circ$, $+45^\circ$ at $\omega_z$, over the same two decades.
      `),
      RF(md`
        [[fig:zero]]

        ### A negative DC gain

        $-g_mR_D$ is negative. A negative constant does nothing to the magnitude ($|{-40}| = 40$) and adds $180^\circ$ to the phase at every frequency (the notes: $\angle A_{dc} = 0^\circ$ if $A_{dc} > 0$, $180^\circ$ if $A_{dc} < 0$). So the common source's phase starts at $180^\circ$ and the pole takes it down to $90^\circ$. Writing it as $-180^\circ$ and going to $-270^\circ$ is the same angle.
      `, { zero: plot({ k: 1, zeros: [1e3] }, { show: 'both', marks: [{ w: 1e3, n: '\\omega_z' }], cap: '$H(s) = 1 + s/10^3$: the mirror image of a pole.' }) }),
      RF(md`
        ### The right-half-plane zero: magnitude up, phase down

        $$H(s) = 1 - s/\omega_z$$
        The magnitude is $\sqrt{1 + (\omega/\omega_z)^2}$, **the same as an ordinary zero**: it rises at $+20\,\text{dB/dec}$. But the angle is $-\tan^{-1}(\omega/\omega_z)$: the phase goes **down**, like a pole. The magnitude plot alone cannot tell the two apart; the phase plot can.

        Where it comes from: the common-source stage has one at $\omega_z = g_m/C_{gd}$. A signal sneaks forward through $C_{gd}$ with no inversion and fights the inverted signal from $g_m$. Unit 14 derives it.

        [[fig:rhp]]
      `, { rhp: plot({ k: 1, rhp: [1e3] }, { show: 'both', marks: [{ w: 1e3, n: '\\omega_z' }], cap: '$H(s) = 1 - s/10^3$: rises like a zero, lags like a pole.' }) }),
      RF(md`
        ### $s$ at the origin (an extension): the coupling capacitor

        A capacitor in series with the signal path, into a resistor:
        $$H(s) = \frac{R}{R + 1/(sC)} = \frac{sRC}{1 + sRC}$$
        The $s$ upstairs is a zero **at $\omega = 0$**: on log axes it is a line of slope $+20\,\text{dB/dec}$ everywhere, with a constant $+90^\circ$ of phase. Here it rises until the pole at $\omega = 1/(RC)$ flattens it: a **high-pass**. (Coupling capacitors are treated as shorts in the mid-band, which is everything above this corner.)

        [[fig:hp]]

        [[fig:hpplot]]
      `, { hp: { fig: hp }, hpplot: plot({ k: 1, origin: 1, w0: 1e3, poles: [1e3] }, { show: 'both', marks: [{ w: 1e3, n: '1/RC' }], cap: '$H(s) = (s/10^3)/(1 + s/10^3)$ with $RC = 1\\,\\text{ms}$: $+20\\,\\text{dB/dec}$, then flat at $0\\,\\text{dB}$.' }) }),
      Q(md`$H(s) = -100/(1 + s/10^6)$. Its phase at very low frequency and at very high frequency (straight-line, using $+180^\circ$ for the sign)?`,
        ['$180^\\circ$, then $90^\\circ$', '$0^\\circ$, then $-90^\\circ$', '$-180^\\circ$, then $-90^\\circ$', '$180^\\circ$, then $270^\\circ$'], 0,
        [null, 'That forgets the minus sign: a negative constant adds $180^\\circ$.', 'The pole **subtracts** $90^\\circ$: from $-180^\\circ$ it goes to $-270^\\circ$, not $-90^\\circ$.', 'A pole takes phase **away**: $180^\\circ - 90^\\circ$.'],
        md`The constant gives $180^\circ$; the pole subtracts up to $90^\circ$: $180^\circ\to90^\circ$ (equivalently $-180^\circ\to-270^\circ$).`),
      Q(md`Two magnitude plots are identical: one belongs to $1 + s/\omega_z$, the other to $1 - s/\omega_z$. How do you tell them apart?`,
        ['Phase: the right-half-plane zero lags (goes to $-90^\\circ$), the ordinary zero leads (to $+90^\\circ$)', 'The right-half-plane zero falls at $-20\\,\\text{dB/dec}$', 'You cannot: they are the same function', 'The right-half-plane zero has a $3\\,\\text{dB}$ bump at the corner'], 0,
        [null, 'Its magnitude **rises**, exactly like an ordinary zero.', 'Same magnitude, opposite phase: different functions.', 'Both have the same magnitude everywhere.'],
        md`$|1 \pm j\omega/\omega_z|$ is the same, but the angles are $\pm\tan^{-1}(\omega/\omega_z)$. Only the phase plot shows the difference.`),
      Q(md`$H(s) = 10\,(1 + s/10^2)$. Straight-line magnitude at $10^4\,\text{rad/s}$?`,
        ['$60\\,\\text{dB}$', '$-20\\,\\text{dB}$', '$20\\,\\text{dB}$', '$40\\,\\text{dB}$'], 0,
        [null, 'A zero **raises** the magnitude.', '$20\\,\\text{dB}$ is only the flat level below $10^2$.', 'Two decades above the zero at $+20$ each: $20 + 40$.'],
        md`Flat at $20\,\text{dB}$ to $10^2$, then $+20\,\text{dB/dec}$ for two decades: $60\,\text{dB}$.`),
    ],
  });

  // ================================================================ 5. many poles and zeros
  L({
    id: 'e3-u13-many', title: 'Many poles and zeros: add them up', ref: 'Lectures 25, 27',
    steps: [
      R(md`
        ### Why this lesson

        This is the Bode skill the exam tests: a transfer function with two to four corners, sketch it, or read off a value. The trick is that **logarithms turn the product into a sum**: the dB plot is the sum of each factor's dB plot, and the phase is the sum of each factor's phase. You already know each factor.
      `),
      R(md`
        ### The recipe

        1. **Standard form.** Write every factor as $(1 + s/\omega)$. If a factor comes as $(s + 10^3)$, pull the number out: $s + 10^3 = 10^3(1 + s/10^3)$, and that $10^3$ goes into the constant $k$. (Forgetting this is the number-one slip.)
        2. **Low-frequency level:** $20\log_{10}|k|$. Phase: $0^\circ$, or $180^\circ$ if $k < 0$.
        3. **Sort the corners.** Walk left to right. At each **pole** the slope drops by $20\,\text{dB/dec}$; at each **zero** it rises by $20$. The slope in any region is $20\times$(zeros passed $-$ poles passed).
        4. **Phase:** each corner adds its own ramp over the two decades around it ($-45^\circ$/decade for a pole, $+45^\circ$/decade for a zero). Add the ramps.
        5. **Check:** the final slope is $-20\,\text{dB/dec}$ times (number of poles $-$ number of zeros).
      `),
      RF(md`
        ### Worked example

        $$${B.tex(ex1)}$$

        **Magnitude.** Flat at $20\log_{10}100 = 40\,\text{dB}$. At $10^2$ (pole) the slope becomes $-20$: by $10^4$ the line is at $40 - 40 = 0\,\text{dB}$. At $10^4$ (zero) the slope returns to $0$: flat at $0\,\text{dB}$. At $10^6$ (pole) it drops to $-20\,\text{dB/dec}$ for good.

        **Phase.** The pole at $10^2$ ramps from $10^1$ to $10^3$ (down to $-90^\circ$). The zero at $10^4$ ramps up from $10^3$ to $10^5$ (back up $90^\circ$). The pole at $10^6$ ramps down from $10^5$ to $10^7$. Total: $0$, $-45^\circ$ at $10^2$, $-90^\circ$ at $10^3$, $-45^\circ$ at $10^4$, $0^\circ$ at $10^5$, $-45^\circ$ at $10^6$, $-90^\circ$ beyond $10^7$.

        [[fig:ex1]]

        **Read the plot back:** the zero at $10^4$ cancels the first pole's slope, and the phase climbs back toward $0^\circ$ in the middle. A flat stretch in the middle of a magnitude plot always means "as many zeros as poles passed so far".
      `, { ex1: plot(ex1, { show: 'both', marks: [{ w: 1e2, n: '10^{2}' }, { w: 1e4, n: '10^{4}' }, { w: 1e6, n: '10^{6}' }] }) }),
      Q(md`$H(s) = \dfrac{10^5\,(s + 10^3)}{(s + 10^2)(s + 10^5)}$. What is the low-frequency gain $|H(0)|$?`,
        ['$10$ ($20\\,\\text{dB}$)', '$10^5$ ($100\\,\\text{dB}$)', '$1$', '$10^3$'], 0,
        [null, 'That is the leading constant, not the gain: the $(s + \\omega)$ factors each carry a number. Put $s = 0$.', 'Put $s = 0$: $10^5\\cdot10^3/(10^2\\cdot10^5)$.', 'Put $s = 0$ in every factor.'],
        md`At $s = 0$: $\dfrac{10^5\times10^3}{10^2\times10^5} = 10$. In standard form, $H(s) = \dfrac{10\,(1 + s/10^3)}{(1 + s/10^2)(1 + s/10^5)}$.`),
      P({
        id: 'e3-u13-std', title: 'Into standard form, then the straight lines',
        q: md`$$H(s) = \frac{10^5\,(s + 10^3)}{(s + 10^2)(s + 10^5)}$$
Find the constant $k$ in standard form, the straight-line $|H|$ at $\omega = 10^4\,\text{rad/s}$, and the slope at very high frequency.`,
        parts: [
          { lbl: 'k', unit: '', ans: 10, traps: [{ v: 1e5, msg: 'Pull the corner frequency out of each $(s + \\omega)$ factor first: $s + 10^3 = 10^3(1 + s/10^3)$.' }] },
          { lbl: '|H(j10^4)|_{dB}', unit: 'dB', ans: 0, tol: { abs: 0.3 }, traps: [{ v: 20, msg: 'The pole at $10^2$ bends the line down for one decade before the zero at $10^3$ flattens it.' }, { v: -20, msg: 'The zero at $10^3$ stops the fall: from $10^3$ to $10^5$ the line is flat.' }] },
          { lbl: '\\text{final slope}', unit: 'dB/dec', ans: -20, tol: { abs: 0.5 } },
        ],
        hints: [md`Factor each corner out: $(s + 10^3) = 10^3(1 + s/10^3)$, $(s + 10^2) = 10^2(1 + s/10^2)$, $(s + 10^5) = 10^5(1 + s/10^5)$.`],
        sol: md`**Standard form.**
$$H(s) = \frac{10^5\cdot10^3\,(1 + s/10^3)}{10^2\cdot10^5\,(1 + s/10^2)(1 + s/10^5)} = \frac{10\,(1 + s/10^3)}{(1 + s/10^2)(1 + s/10^5)}$$
So $k = 10$: flat at $20\,\text{dB}$.

**Walk:** pole at $10^2$: slope $-20$; by $10^3$ the line is at $0\,\text{dB}$. Zero at $10^3$: slope back to $0$; flat at $0\,\text{dB}$ through $10^4$. Pole at $10^5$: slope $-20$ for good.

$|H(j10^4)|_{\text{dB}}\approx0\,\text{dB}$ and the final slope is $20(1 - 2) = -20\,\text{dB/dec}$.

[[fig:p]]`,
        figs: { p: plot({ k: 10, zeros: [1e3], poles: [1e2, 1e5] }, { marks: [{ w: 1e4, n: '10^{4}' }] }) },
      }),
      G('e3_bode_asy', { need: 5 }),
      G('e3_bode_slope', { need: 4 }),
      G('e3_bode_phase', { need: 4 }),
    ],
  });

  // ================================================================ 6. reading a plot
  L({
    id: 'e3-u13-read', title: 'Reading a Bode plot back into $H(s)$', ref: 'Lecture 27',
    steps: [
      R(md`
        ### Why this lesson

        Recognition runs both ways. If you can look at a straight-line plot and write $H(s)$ in ten seconds, you can also check any sketch you draw on the exam. Three readings do it.
      `),
      R(md`
        ### Three readings

        1. **The level on the left** is $20\log_{10}|k|$: $40\,\text{dB}$ means $|k| = 100$.
        2. **Every kink is a corner.** Read its $\omega$ off the decade grid.
        3. **Which way it kinks:** the slope gets $20\,\text{dB/dec}$ more negative at a **pole**, $20$ more positive at a **zero**.

        Check with the far-right slope ($-20$ per extra pole). If a phase plot is given too, it settles what the magnitude cannot: a negative $k$ (phase starting at $180^\circ$) and a right-half-plane zero (a corner where the magnitude turns up but the phase goes down).
      `),
      RF(md`
        ### Try it

        [[fig:t]]

        Level $20\,\text{dB}$: $|k| = 10$. Kink down at $10^3$: pole. Kink up at $10^5$ (slope back to $0$): zero. Kink down at $10^7$: pole. So
        $$H(s) = \frac{10\,(1 + s/10^5)}{(1 + s/10^3)(1 + s/10^7)}$$
        Check: final slope $20(1 - 2) = -20\,\text{dB/dec}$. ✓
      `, { t: plot({ k: 10, zeros: [1e5], poles: [1e3, 1e7] }, { exact: false }) }),
      Q(md`A straight-line magnitude plot is flat at $0\,\text{dB}$, then from $10^4\,\text{rad/s}$ it rises at $+20\,\text{dB/dec}$ forever. Its phase goes from $0^\circ$ down to $-90^\circ$. Which $H(s)$?`,
        ['$1 - s/10^4$', '$1 + s/10^4$', '$1/(1 + s/10^4)$', '$-1/(1 + s/10^4)$'], 0,
        [null, 'That one has the same magnitude but its phase goes **up** to $+90^\\circ$.', 'A pole makes the magnitude **fall**.', 'The magnitude rises: a zero, not a pole.'],
        md`Rising magnitude: a zero. Phase going down: a right-half-plane zero, $1 - s/\omega_z$.`),
      G('e3_bode_pick', { need: 5 }),
      G('e3_bode_read', { need: 3 }),
    ],
  });

  // ================================================================ 7. mixed drill
  L({
    id: 'e3-u13-mix', title: 'Unit 13 mixed drill', kind: 'review', ref: 'Lectures 25, 27',
    steps: [
      R(md`Every Unit 13 skill, mixed, new numbers each time: decibels both ways, straight-line magnitude and phase, slopes, picking $H(s)$ from a plot, reading a plot, and a one-pole circuit. Ten in a row without opening a solution completes it.`),
      G('e3_db', { need: 10, pool: ['e3_db', 'e3_bode_asy', 'e3_bode_slope', 'e3_bode_phase', 'e3_bode_pick', 'e3_bode_read', 'e3_f3db'] }),
    ],
  });
})();

/* Topic 20: the four reads the Fall 2025 Exam 3 tested that the other lessons only touch:
   the steady state of a delta source, peaks and nulls on shorted and open lines (and the length they imply),
   a matched line (same size, different phase), and lambda/2 and lambda/4 sections at a glance. */
(function () {
  'use strict';
  const { R, Q, G } = C;
  const { MC, one } = EM;
  const { pick } = U;

  EM.lesson('w6', {
    id: 'w6-reads', topic: 20, ref: 'Fall 2025 Exam 3, Problems 3-4', title: 'Four reads from the Fall 2025 exam',
    steps: [
      R(md`
        !!key Why you care
          Prof. Chen's Fall 2025 Exam 3 spent 47 of its 100 points on [a delta source on two lines](#/l/e3-past-fa25) and on six quick reads of standing waves on lines. Each read takes ten seconds once you see it, and each is easy to get backwards. This lesson builds each one from what you already know.

        ### 1. A delta source has no steady state voltage

        A step source $V_g u(t)$ never turns off. After the bounces die out, the line is just wire, so the load sees the DC divider:
        $$V_{ss} = V_g\frac{R_L}{R_g + R_L}$$
        A delta source $V_0\delta(t)$ is on for an instant and then is $0$. Every wave it launches gets multiplied by $\Gamma_g\Gamma_L$ on each round trip, and $|\Gamma_g\Gamma_L| < 1$ unless one end is an open or a short. So each spike is smaller than the one before:
        $$V_{ss} = 0$$
        Read it in circuit terms: the steady state of the line is the DC circuit with the source as it is "at $t = \infty$". A step is still $V_g$ then. A delta is $0$ then.

        !!intuition Does this make sense?
          A step response is the running sum of the impulse response. The impulse response's spikes shrink to nothing, but their running sum settles at the DC value. One is the derivative of the other.
      `),
      Q(md`**Predict.** $V_g(t) = 100\,\delta(t)$ V, $R_g = 25\ \Omega$, $R_L = 75\ \Omega$, and two matched-ish line sections in between. The voltage at the load as $t \to \infty$ is…`,
        ['$0$ V', '$75$ V', '$100$ V', '$25$ V'], 0,
        [null, md`$75$ V is the divider $100\cdot75/100$: the steady state of a 100 V **step**. A delta is zero after $t = 0$.`, md`That is the source size, and only an open load with a step would reach it.`, md`That is the drop across $R_g$ for a step.`],
        md`A delta launches a finite set of shrinking spikes; nothing is left once they die out. $V_{ss} = 0$.`, { src: 'Fall 2025 Exam 3, 3(c)' }),
      R(md`
        ### 2. Where V and I peak on a shorted or open line

        On a lossless line with $d$ measured back from the load, a **short** forces $\tilde V = 0$ at $d = 0$:
        $$\tilde V(d) = j2\tilde V^+\sin\beta d, \qquad \tilde I(d) = \frac{2\tilde V^+}{Z_0}\cos\beta d$$
        An **open** forces $\tilde I = 0$ at $d = 0$:
        $$\tilde V(d) = 2\tilde V^+\cos\beta d, \qquad \tilde I(d) = \frac{j2\tilde V^+}{Z_0}\sin\beta d$$
        So the pattern is fixed by the end:
        - Short: V nulls at $d = 0, \lambda/2, \lambda, \dots$; V peaks at $d = \lambda/4, 3\lambda/4, \dots$ (I is the other way round).
        - Open: V peaks at $d = 0, \lambda/2, \dots$; V nulls at $d = \lambda/4, 3\lambda/4, \dots$
        - Nulls and peaks of the same quantity are $\lambda/4$ apart; nulls repeat every $\lambda/2$.

        **Working back to the length.** If the problem says "on a shorted line of length $l$, the voltage peaks at the midpoint $l/2$", then $l/2$ must be one of $\lambda/4, 3\lambda/4, \dots$, so $l = \lambda/2, 3\lambda/2, \dots$. The input end $d = l$ is then a **V null**: $Z_{\text{in}} = 0$.
      `),
      Q(md`**Predict.** A shorted line of length $l$ has its voltage peak at $d = l/2$ (and no other peak). The input impedance at $d = l$ is…`,
        ['$0$', '$\\infty$', '$Z_0$', '$jZ_0$'], 0,
        [null, md`An open input would need $l$ to be an odd number of $\lambda/4$. Here $l/2 = \lambda/4$ gives $l = \lambda/2$: a voltage null.`, md`Only a matched load gives $Z_0$; a short gives a pure reactance or $0$ or $\infty$.`, md`That is a shorted $\lambda/8$ line.`],
        md`One peak at $l/2$ means $l/2 = \lambda/4$, so $l = \lambda/2$. A half-wave line repeats its load: the input looks like the short, $Z = 0$.`, { src: 'Fall 2025 Exam 3, 4(d)' }),
      Q(md`**Predict.** An open-ended line has a current null at $d = l/4$, and that is the first null back from the end after $d = 0$. The line length is…`,
        ['$l = 2\\lambda$', '$l = \\lambda$', '$l = \\lambda/2$', '$l = 4\\lambda$'], 0,
        [null, md`For an open, current nulls sit every $\lambda/2$: $d = 0, \lambda/2, \dots$ The first after $d = 0$ is $\lambda/2$, so $l/4 = \lambda/2$.`, md`That puts the current null at $\lambda/8$; open-line current nulls are at multiples of $\lambda/2$.`, md`That reads $\lambda/2$ as the null itself spacing times two; solve $l/4 = \lambda/2$.`],
        md`An open forces $\tilde I = 0$ at the end and every $\lambda/2$ back. The first one after the end is at $\lambda/2$, so $l/4 = \lambda/2$ and $l = 2\lambda$.`, { src: 'Fall 2025 Exam 3, 4(e)' }),
      R(md`
        ### 3. A matched line: same size, different phasor

        With $Z_L = Z_0$ there is no reflected wave, $\Gamma_L = 0$:
        $$\tilde V(d) = \tilde V^+e^{j\beta d}$$
        The size $|\tilde V(d)| = |\tilde V^+|$ is the same everywhere: no standing wave, VSWR = 1. But the phase turns by $\beta d$. So $\tilde V(0) \ne \tilde V(l)$ in general: they are equal only when $\beta l$ is a multiple of $2\pi$, that is when $l$ is a whole number of wavelengths.

        ### 4. Half and quarter waves at a glance

        - $l = n\lambda/2$: $Z_{\text{in}} = Z_L$, and $\tilde V_{\text{in}} = (-1)^n\tilde V_L$. A $5\lambda/2$ line gives $\tilde V_{\text{in}} = -\tilde V_L$.
        - $l = \lambda/4, 3\lambda/4, \dots$: $Z_{\text{in}} = Z_0^2/Z_L$. A $3\lambda/4$ line of $Z_0 = 25\ \Omega$ on $50\ \Omega$ gives $12.5\ \Omega$.
        - A length in wavelengths gives $\omega$: $l = \lambda/3$ with $l = 1$ km and $v = c$ means $\lambda = 3$ km, $f = 100$ kHz, $\omega = 2\pi\times10^5$ rad/s.
        Details in [Topic 19](#/l/w6-qw) and [Topic 18](#/l/w6-stubs).
      `),
      Q(md`**Predict.** A matched line ($Z_L = Z_0$) of length $l = 3\lambda/4$. Compare the voltage phasors at the two ends.`,
        ['Same size; $\\tilde V(l) = j\\tilde V(0)$ (phase differs by $270°$, i.e. $-90°$)', 'Exactly equal', 'Same phase, different size', 'Opposite: $\\tilde V(l) = -\\tilde V(0)$'], 0,
        [null, md`Equal only if $l$ is a whole number of wavelengths.`, md`A matched line has no standing wave, so the size cannot change.`, md`That needs $\beta l = \pi$, a half wavelength.`],
        md`$\tilde V(d) = \tilde V^+e^{j\beta d}$: $|\tilde V|$ is constant, and $\beta l = 3\pi/2$, so $\tilde V(l) = \tilde V(0)e^{j3\pi/2} = -j\tilde V(0)$. Same size, phase $-90°$ apart.`),
      R(md`### Rapid fire: the four reads`),
      Object.assign(G('rf_w6r_reads', { need: 8 }), { id: 'w6-reads.r0' }),
    ],
  });

  GENS.rf_w6r_reads = () => one([
    () => {
      const V = pick([50, 80, 100, 120]), [rg, rl] = pick([[25, 75], [50, 150], [100, 100], [25, 25]]);
      const step = pick([true, false]), dc = +(V * rl / (rg + rl)).toFixed(2);
      return MC('Steady state', md`$V_g(t) = ${V}\,${step ? 'u(t)' : '\\delta(t)'}$ V, $R_g = ${rg}\ \Omega$, $R_L = ${rl}\ \Omega$. The load voltage as $t\to\infty$:`,
        step ? `$${dc}$ V` : '$0$ V',
        [[step ? '$0$ V' : `$${dc}$ V`, step ? md`A step stays on, so the DC divider gives the answer.` : md`That is the step answer; a delta is zero after $t = 0$.`], [`$${V}$ V`, md`Only an open load with a step reaches the full source.`], [`$${+(V * rg / (rg + rl)).toFixed(2)}$ V`, md`That is the drop across $R_g$.`]],
        step ? md`DC divider: $${V}\cdot${rl}/${rg + rl} = ${dc}$ V.` : md`A delta source is $0$ at $t\to\infty$: $V_{ss} = 0$.`);
    },
    () => {
      const sh = pick([true, false]), q = pick(['V', 'I']), kind = pick(['null', 'peak']);
      const atEnd = (sh && ((q === 'V' && kind === 'null') || (q === 'I' && kind === 'peak'))) || (!sh && ((q === 'I' && kind === 'null') || (q === 'V' && kind === 'peak')));
      const r = atEnd ? '$d = 0, \\lambda/2, \\lambda, \\dots$' : '$d = \\lambda/4, 3\\lambda/4, \\dots$';
      return MC('Where?', md`On ${sh ? 'a shorted' : 'an open'} line, where are the ${q === 'V' ? 'voltage' : 'current'} ${kind}s (d from the load)?`, r,
        [[atEnd ? '$d = \\lambda/4, 3\\lambda/4, \\dots$' : '$d = 0, \\lambda/2, \\lambda, \\dots$', md`Backwards: a ${sh ? 'short forces V = 0' : 'open forces I = 0'} at $d = 0$.`], ['$d = \\lambda/8, 5\\lambda/8, \\dots$', md`Peaks and nulls sit at multiples of $\lambda/4$.`], ['$d = 0, \\lambda/4, \\lambda/2, \\dots$', md`Nulls of one quantity repeat every $\lambda/2$, not $\lambda/4$.`]],
        md`${sh ? 'Short' : 'Open'}: $\tilde ${sh ? 'V' : 'I'} = 0$ at $d = 0$ and every $\lambda/2$; its peaks are $\lambda/4$ away. The other quantity is the reverse.`);
    },
    () => {
      const n = pick([1, 2, 3, 4, 5, 6]);
      const half = n % 2 === 0;
      return MC('Matched line', md`A matched line is $${n}\lambda/4$ long. $\tilde V(l)$ compared with $\tilde V(0)$:`,
        half ? (n % 4 === 0 ? 'equal' : 'equal size, opposite sign') : 'equal size, $\\pm 90°$ apart',
        [['different sizes', md`No reflection, no standing wave: the size is the same everywhere.`], [half ? 'equal size, $\\pm 90°$ apart' : 'equal size, opposite sign', md`$\beta l = ${n}\pi/2$; count the quarter turns.`], [n % 4 === 0 ? 'equal size, opposite sign' : 'equal', md`$\beta l = ${n}\pi/2$ rad.`]],
        md`$\tilde V(d) = \tilde V^+e^{j\beta d}$ with $\beta l = ${n}\pi/2$: ${n % 4 === 0 ? 'a whole number of turns, equal' : half ? 'an odd number of half turns, sign flips' : 'a quarter-turn left over, $\\pm 90°$'}.`);
    },
  ]);

  EM.BANK['w6-reads'] = [
    Q(md`A $100\,\delta(t)$ source drives a line ending in $50\ \Omega$ with $R_g = 50\ \Omega$ and $Z_0 = 50\ \Omega$. How many spikes reach the load?`, ['One', 'Two', 'Infinitely many', 'None'], 0,
      [null, md`Everything is matched: nothing reflects.`, md`Only with reflections at both ends.`, md`The launched wave reaches the load once.`], md`Matched at both ends: one spike of $50$ V, then nothing.`),
    Q(md`A shorted line's input current is zero. Its length is…`, ['an odd number of $\\lambda/4$', 'a multiple of $\\lambda/2$', 'any length', '$\\lambda/8$'], 0,
      [null, md`At multiples of $\lambda/2$ the current peaks (it repeats the short).`, md`The pattern is fixed by the short.`, md`At $\lambda/8$ the input is $jZ_0$.`], md`Short: $\tilde I \propto \cos\beta d$, zero at $\beta d = \pi/2, 3\pi/2$: odd $\lambda/4$.`),
    Q(md`A $5\lambda/2$ line: $\tilde V_{\text{in}} = $`, ['$-\\tilde V_L$', '$\\tilde V_L$', '$j\\tilde V_L$', '$0$'], 0,
      [null, md`Five half waves: an odd count flips the sign.`, md`That is a quarter-wave relation shape, not a half-wave one.`, md`Only a short or a node gives zero.`], md`Each $\lambda/2$ multiplies by $-1$; five of them give $-1$.`),
    Q(md`A matched line: which is true?`, ['$|\\tilde V|$ is the same everywhere', '$\\tilde V$ is the same everywhere', 'VSWR $= \\infty$', '$Z(d)$ changes with $d$'], 0,
      [null, md`The phase turns by $\beta d$.`, md`Matched means VSWR $= 1$.`, md`$Z(d) = Z_0$ everywhere when matched.`], md`$\Gamma_L = 0$: one traveling wave, constant size, turning phase.`),
    Q(md`A step $V_g u(t)$ into an open-ended line with $R_g = Z_0$ settles to…`, ['$V_g$ at the open end', '$V_g/2$', '$0$', 'never settles'], 0,
      [null, md`$V_g/2$ is the launched wave; the open doubles it and $\Gamma_g = 0$ ends the story.`, md`That is the delta answer.`, md`With $\Gamma_g = 0$ there is one reflection only.`], md`DC divider with $R_L = \infty$: no current, the full $V_g$.`),
  ];
})();

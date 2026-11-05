/* Book Chapter 13 — Open-circuit time constants (the student's Lecture 29 OCTC notes).
   Every resistance, sum and bandwidth below was checked against an independent complex nodal solve (scratchpad a8/:
   solver.py, ex13.py, static13.py, verify13.py): each R_jo by a test source with the other capacitors open, each exact
   bandwidth by sweeping the full transfer function. Figures and the formula kit: js/gens-bk-a8.js (window.BK8). */
(function () {
  'use strict';
  const { R, RF, Q, P, G } = C;
  const B = window.BK8;
  const { F, M, T, num, RT, CT, TT, WT, FT, MS, STG, octRows, INF } = B;
  const f = U.fmt;
  const L = (l) => BK.lesson('bk13', l);
  // the open-circuit sum and estimate of one stage (capacitors in p.C), as the generators compute it
  const oc = (kind, p) => { const rows = octRows(kind, p); const sum = rows.reduce((a, r) => a + r.tau, 0); return { rows, sum, w: 1 / sum }; };
  const twoPole = (t1, t2) => Math.sqrt((-(t1 * t1 + t2 * t2) + Math.sqrt((t1 * t1 + t2 * t2) ** 2 + 4 * t1 * t1 * t2 * t2)) / (2 * t1 * t1 * t2 * t2));
  const nPole = (ws) => { const ts = ws.map((w) => 1 / w); let lo = 1e-3 * ws[0], hi = ws[0]; for (let i = 0; i < 100; i++) { const m = Math.sqrt(lo * hi); if (ts.reduce((a, t) => a * (1 + t * t * m * m), 1) > 2) hi = m; else lo = m; } return Math.sqrt(lo * hi); };

  // ---------------------------------------------------------------- figures local to this chapter
  // degenerated CS, tau_cgd (Lecture 29, page 4): test current from gate to drain; looking down into the drain is R_x
  const degGd = [
    ['R', [0, 1], [1.4, 1], { n: 'R_G' }], ['w', [0, 1], [0, 2.2]], ['gnd', [0, 2.2]], ['w', [1.4, 1], [2, 1]],
    ['node', [1.7, 1], { n: 'v_1', side: 'b', dot: true }],
    ['w', [1.7, 1], [1.7, -0.6]], ['I', [1.7, -0.6], [3, -0.6], { n: 'I_T' }], ['node', [3, -0.6], { n: 'v_2', side: 'ar' }],
    ['nmos', [3, 1]], ['w', [3, 0], [3, -0.6]], ['rail', [3, -1.9], { n: 'V_{DD}' }], ['R', [3, -1.9], [3, -0.6], { n: 'R_L' }],
    ['w', [3, 2], [3, 2.3]], ['R', [3, 2.3], [3, 3.5], { n: 'R_S' }], ['gnd', [3, 3.5]],
    ['txt', [3.75, 0.15], '$\\downarrow R_x$'],
  ];
  // ratio of the true bandwidth to the estimate, two real poles, against tau2/tau1
  const ratioPlot = B.plot2({
    x: [0, 1], y: [1, 1.32], w: 440, h: 230,
    xt: [0, 0.25, 0.5, 0.75, 1].map((v) => ({ v, t: `$${v}$` })), yt: [1, 1.1, 1.2, 1.3].map((v) => ({ v, t: `$${v}$` })),
    curves: [{ f: (x) => (x < 1e-9 ? 1 : twoPole(1, x) * (1 + x)), n: '$\\omega_{-3dB}\\,/\\,\\hat\\omega$', at: 0.55, pos: 'l' }],
    pts: [{ x: 1, y: 1.287, n: '$1.29$', pos: 'l' }],
    xl: '$\\tau_2/\\tau_1$ (second time constant over the first)', yl: 'true over estimated bandwidth',
  });

  // ---------------------------------------------------------------- worked numbers (checked in a8/ex13.py)
  const RUN = { gm: 5e-3, rds: 40e3, RS: 4e3, RL: 10e3, C: { Cgs: 200e-15, Cgd: 25e-15, CL: 300e-15 } };
  const CE1 = { gm: 40e-3, rpi: 2.5e3, ro: 100e3, RS: 1e3, RL: 4e3, C: { Cpi: 8e-12, Cmu: 0.4e-12, CL: 1e-12 } };
  const DEG = { gm: 5e-3, RG: 20e3, RS: 400, RL: 12e3, C: { Cgs: 0.5e-12, Cgd: 50e-15, CL: 0.5e-12 } };
  const DEG0 = Object.assign({}, DEG, { RS: 0 });
  const DEGr = Object.assign({}, DEG, { rds: 50e3 });

  // ================================================================ 13.1 why one number works
  L({
    id: 'bk13-why', title: 'Why the bandwidth is about 1/ΣRC', ref: 'Lecture 29 (OCTC notes, pages 1–2)',
    steps: [
      R(md`
        !!key Chapter 13 at a glance
          One number estimates the bandwidth of almost any amplifier: $\hat\omega_{-3dB} = 1/\sum R_{jo}C_j$, where $R_{jo}$ is the resistance capacitor $C_j$ sees with every other capacitor removed. You will be able to: (1) explain why the sum of time constants estimates the bandwidth, and why the estimate errs on the safe side; (2) find every $R_{jo}$ with two pictures (a node to ground, and a capacitor bridging two nodes, whose rule $R_{left} + R_{right} + G_mR_{left}R_{right}$ we derive); (3) do it for every stage of Lecture 29 and its BJT twin; (4) say which capacitor limits the bandwidth and what to change.

          You need: node and terminal resistances ([Chapter 3](#/l/bk03-node), [Chapter 8](#/l/bk08-node)), the test-source method ([Chapter 1](#/l/bk01-test)), and [Chapter 12](#/l/bk12-where): where the capacitors are, and the exact CS solution.

        ### The question

        Chapter 12 found the poles of a common source exactly, and even with three capacitors it took a page and a quadratic. A cascode has five capacitors. The **open-circuit time-constant method** (OCTC) estimates the bandwidth with nothing but the skill you already have: the resistance between two points of a circuit. This section shows why a single number, the sum of the time constants, is enough.
      `),
      R(md`
        ### The physical picture: delays add up

        Every capacitor in the signal path has to be charged through some resistance, and each one delays the signal a little: about $RC$. A signal that passes through several such delays is late by roughly their **sum**. A sine wave slower than that total delay gets through; a faster one is smeared out. So the bandwidth should be about one over the total delay. (In fact, for a response with only real poles, $\sum\tau$ is exactly the average delay of the impulse response: the delays of the stages add like the delays of a chain of RC filters.)

        The rest of the section turns this into algebra, in three steps: the sum of the pole time constants appears as one coefficient of the denominator; near the bandwidth only that coefficient matters; and that coefficient can be computed one capacitor at a time.
      `),
      R(md`
        ### Step 1: the coefficient of $s$ is the sum of the time constants

        An amplifier with $n$ capacitors and no zeros that matter has an **all-pole** transfer function (Lecture 29):
        $$\frac{v_o(s)}{v_i(s)} = \frac{a_0}{(\tau_1s + 1)(\tau_2s + 1)\cdots(\tau_ns + 1)} = \frac{a_0}{D(s)}$$
        Multiply out three of the brackets to see the pattern:
        $$(\tau_1s + 1)(\tau_2s + 1)(\tau_3s + 1) = \tau_1\tau_2\tau_3\,s^3 + (\tau_1\tau_2 + \tau_1\tau_3 + \tau_2\tau_3)\,s^2 + (\tau_1 + \tau_2 + \tau_3)\,s + 1$$
        To get a term in plain $s$ you must pick $\tau_is$ from exactly one bracket and $1$ from all the others. So in general
        $$D(s) = b_ns^n + \dots + b_2s^2 + b_1s + 1,\qquad b_1 = \tau_1 + \tau_2 + \dots + \tau_n,\qquad b_n = \tau_1\tau_2\cdots\tau_n$$

        ### Step 2: near the bandwidth, keep only $b_1$

        Drop every term above $b_1s$:
        $$D(s)\approx b_1s + 1\quad\Rightarrow\quad\frac{v_o}{v_i}\approx\frac{a_0}{b_1s + 1}$$
        That is a one-pole system, whose $-3\,\text{dB}$ frequency we know ([Chapter 10](#/l/bk10-rc)):

        !!key The open-circuit estimate
          $$\hat\omega_{-3dB} = \frac{1}{b_1} = \frac{1}{\sum_i\tau_i}$$
          Notes' notation: $\hat\omega_{-3dB}$ is the estimate, $\omega_{-3dB}$ the true value. Both in rad/s.
      `),
      RF(md`
        ### Is dropping the higher terms safe? The two-pole case (Lecture 29)

        Take two poles: $D(s) = \tau_1\tau_2s^2 + (\tau_1 + \tau_2)s + 1$. At the estimate, $(\tau_1 + \tau_2)\hat\omega = 1$ by definition, so
        $$D(j\hat\omega) = 1 - \tau_1\tau_2\hat\omega^2 + j\,(\tau_1 + \tau_2)\hat\omega = 1 - \tau_1\tau_2\hat\omega^2 + j$$
        Each of $\tau_1\hat\omega$ and $\tau_2\hat\omega$ is less than 1 (they add up to 1), so the dropped term $\tau_1\tau_2\hat\omega^2$ is at most $\tfrac14$, and very small when one time constant dominates. Then $\omega_{-3dB}\approx\hat\omega$.

        **How close, exactly?** Call $p = \tau_1\tau_2\hat\omega^2$ (between $0$ and $\tfrac14$):
        $$|D(j\hat\omega)|^2 = (1 - p)^2 + 1 = 2 - 2p + p^2 = 2 - p(2 - p)\le2$$
        At the estimate the gain has not yet fallen by $\sqrt2$, so the true $-3\,\text{dB}$ point lies **at or above** $\hat\omega$: the estimate is pessimistic.

        **The worst case is two equal poles**, $\tau_1 = \tau_2 = \tau$: $\hat\omega = \tfrac{1}{2\tau} = \tfrac{0.5}{\tau}$. The truth solves $|1 + j\omega\tau|^4 = 2$, i.e. $(1 + \omega^2\tau^2)^2 = 2$:
        $$\omega_{-3dB} = \frac{\sqrt{\sqrt2 - 1}}{\tau} = \frac{0.644}{\tau}$$
        The notes reach the same number through the second-order formula with $\omega_n = 1/\tau$, $\zeta = 1$. So the estimate is at most 22% low (the truth is at most 29% above it):

        [[fig:r]]
      `, { r: { fig: ratioPlot, cap: 'Two real poles: the true bandwidth over the estimate. One dominant pole: 1. Equal poles: 1.29, the worst case.' } }),
      R(md`
        ### Always on the safe side (for real poles)

        The two-pole argument extends to any number of real poles. At $\hat\omega$ write $a_i = \tau_i\hat\omega$; they are positive and add up to 1. Then $|D(j\hat\omega)|^2 = (1 + a_1^2)(1 + a_2^2)\cdots(1 + a_n^2)$, and one line shows this never exceeds 2:
        - for two factors, $(1 + a^2)(1 + b^2) = 1 + a^2 + b^2 + a^2b^2\le1 + a^2 + b^2 + 2ab = 1 + (a + b)^2$, since $ab\le1$;
        - apply it again and again, merging one factor at a time: $\prod(1 + a_i^2)\le1 + (\sum a_i)^2 = 2$.

        So with real poles and no zeros the true bandwidth is **always** at least $\hat\omega$, with equality only for a single pole. With zeros, or with complex poles (followers can have them, section 13.6), the notes' wording is the honest one: *the estimate is usually pessimistic*.

        ### Step 3: why $b_1$ can be found one capacitor at a time

        We do not want the poles, so we need $b_1$ without them. Two facts make that possible.
        1. **$b_1$ is a sum of terms with exactly one capacitor each.** In the nodal equations every capacitor appears as $sC_j$. A term of $D(s)$ in plain $s^1$ picked up exactly one factor $s$, so exactly one capacitance: $b_1 = k_1C_1 + k_2C_2 + \dots$, where each $k_j$ depends only on the resistors and transconductances.
        2. **To find $k_j$, remove every other capacitor.** With $C_j$ alone the circuit has one capacitor, so one pole: it sees a single Thévenin resistance $R_{jo}$ and $D(s) = 1 + sR_{jo}C_j$ exactly. Comparing: $k_j = R_{jo}$.

        !!key The open-circuit time constants
          $$b_1 = \sum_jR_{jo}C_j\quad\text{exactly},\qquad \hat\omega_{-3dB} = \frac{1}{\sum_jR_{jo}C_j}$$
          $R_{jo}$: the resistance between the two ends of $C_j$ with the input zeroed and every other capacitor **open** (removed). "Open" because at low frequency that is what a capacitor is.

        **Check it on Lecture 28.** The exact CS denominator had $b = (1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})$. Regroup by capacitor:
        $$b = R_{TH}\,C_{in} + \big[R_{TH} + R_L + g_mR_{TH}R_L\big]C_{xy} + R_L\,C_{out}$$
        Three capacitors, each times one resistance. With $C_{xy}$ alone, $C_{in}$ sees $R_{TH}$, $C_{out}$ sees $R_L$, and $C_{xy}$ sees the bracket, which is the bridge rule of the next section.
      `),
      R(md`
        ### Worked example: the running common source

        Chapter 12's circuit: $R_S = 4\,\text{k}\Omega$, $g_m = 5\,\text{mS}$, $R_L = 8\,\text{k}\Omega$, $C_{gs} = 200\,\text{fF}$, $C_{gd} = 25\,\text{fF}$, $C_{out} = 300\,\text{fF}$.
        1. $C_{gs}$ sees $R_S = 4\,\text{k}\Omega$: $\tau = 0.8\,\text{ns}$.
        2. $C_{gd}$ sees $R_S + R_L + g_mR_SR_L = 4 + 8 + 160 = 172\,\text{k}\Omega$: $\tau = 4.3\,\text{ns}$.
        3. $C_{out}$ sees $R_L = 8\,\text{k}\Omega$: $\tau = 2.4\,\text{ns}$.
        4. $\sum\tau = 7.5\,\text{ns}$ (exactly Chapter 12's $b$), $\hat\omega = 1.33\times10^8\,\text{rad/s}$. True: $1.39\times10^8$, 4% higher.

        ### What it means

        - The bandwidth is set by the **sum** of the delays, so the biggest time constant matters most, and making a small one smaller buys almost nothing.
        - A small capacitor can have the biggest time constant if it sees a big resistance ($C_{gd}$: $25\,\text{fF}\times172\,\text{k}\Omega$).
        - The estimate errs low. On an exam, "estimate the bandwidth" means: report $1/\sum R_{jo}C_j$ and do not try to correct it.

        !!mistake Common mistakes
          - Adding pole **frequencies** instead of time constants.
          - Reporting $\hat\omega$ in hertz without dividing by $2\pi$ (or dividing when the question wants rad/s).
          - Shorting the other capacitors instead of opening them. "Open circuit" time constants: the others are removed.
          - Expecting the estimate to be exact. It is a safe lower estimate (for real poles).
      `),
      Q(md`Two poles at $10\,\text{Mrad/s}$ and $100\,\text{Mrad/s}$. What does $1/\sum\tau$ give?`,
        [md`$9.09\,\text{Mrad/s}$`, md`$10\,\text{Mrad/s}$`, md`$110\,\text{Mrad/s}$`, md`$55\,\text{Mrad/s}$`], 0,
        [null, md`That is the lower pole alone; the estimate adds the second time constant too.`, md`You added pole frequencies; add the time constants $1/\omega$.`, md`That averages the frequencies.`],
        md`$\tau = 100\,\text{ns} + 10\,\text{ns} = 110\,\text{ns}$, $\hat\omega = 9.09\,\text{Mrad/s}$. The truth is $9.90\,\text{Mrad/s}$.`),
      Q(md`OCTC gives $50\,\text{Mrad/s}$ for an amplifier whose poles are all real (no zeros). The true bandwidth is...`,
        [md`at least $50\,\text{Mrad/s}$, and at most about 29% more`, md`at most $50\,\text{Mrad/s}$`, md`exactly $50\,\text{Mrad/s}$`, md`impossible to bound without the poles`], 0,
        [null, md`The other way: dropping the higher terms makes the estimate low.`, md`Only for a single pole.`, md`It is bounded: $|D(j\hat\omega)|^2\le2$ always, and the equal-pole case is the worst (for two poles).`],
        md`For real poles $|D(j\hat\omega)|^2\le2$, so the gain is still above $-3\,\text{dB}$ at $\hat\omega$.`),
      Q(md`Why can each $R_{jo}$ be found with all the other capacitors **removed**?`,
        [md`$b_1$ is linear in the capacitances, one at a time; with only $C_j$ present the circuit has one pole and $D = 1 + sR_{jo}C_j$`,
          md`Because the other capacitors are too small to matter`, md`Because at the bandwidth the other capacitors are open circuits`, md`It is an extra approximation on top of $D\approx1 + b_1s$`], 0,
        [null, md`They can be big; the argument does not need them small.`, md`At the bandwidth they are not open at all; the "open" is an algebra fact about $b_1$.`, md`It is exact: $b_1 = \sum R_{jo}C_j$ with no approximation. The only approximation is dropping $b_2, b_3, \dots$`],
        md`Each term of $b_1$ carries exactly one $sC$, so $b_1 = \sum k_jC_j$, and $k_j$ is found with the other capacitances set to zero (open).`),
      P({
        id: 'bk13-why-x1', title: 'Estimate against truth',
        q: md`An amplifier has poles at $10$ and $50\,\text{Mrad/s}$. Find $1/\sum\tau$ and the true $-3\,\text{dB}$ frequency.`,
        parts: [num('\\hat\\omega_{-3dB}', 1 / 120e-9, 'w', [{ v: 1e7, msg: 'That is the lower pole alone.' }]), num('\\omega_{-3dB}', twoPole(1e-7, 2e-8), 'w', [{ v: 1 / 120e-9, msg: 'That is the estimate; solve $(1 + \\omega^2\\tau_1^2)(1 + \\omega^2\\tau_2^2) = 2$.' }])],
        hints: [md`$\tau_1 = 100\,\text{ns}$, $\tau_2 = 20\,\text{ns}$.`, md`With $x = \omega^2$: $\tau_1^2\tau_2^2x^2 + (\tau_1^2 + \tau_2^2)x - 1 = 0$.`],
        sol: md`$\sum\tau = 120\,\text{ns}$, $\hat\omega = 8.33\,\text{Mrad/s}$. Exactly: $4\times10^{-30}x^2 + 1.04\times10^{-14}x - 1 = 0$ gives $x = ${f(twoPole(1e-7, 2e-8) ** 2, 4)}$, so $\omega_{-3dB} = ${f(twoPole(1e-7, 2e-8) / 1e6, 4)}\,\text{Mrad/s}$, ${f(100 * (twoPole(1e-7, 2e-8) * 120e-9 - 1), 2)}% above the estimate.`,
      }),
      P({
        id: 'bk13-why-x2', title: 'Three poles',
        q: md`Poles at $1$, $4$ and $20\,\text{Mrad/s}$. Find $\sum\tau$, the estimate, and the true bandwidth.`,
        parts: [num('\\sum\\tau', 1.3e-6, 't'), num('\\hat\\omega_{-3dB}', 1 / 1.3e-6, 'w'), num('\\omega_{-3dB}', nPole([1e6, 4e6, 20e6]), 'w')],
        hints: [md`$1000 + 250 + 50\,\text{ns}$.`, md`For the truth, solve $\prod(1 + \omega^2\tau_i^2) = 2$ by trial between $0.77$ and $1\,\text{Mrad/s}$.`],
        sol: md`$\sum\tau = 1.3\,\mu\text{s}$ (enter $1300\,\text{ns}$), $\hat\omega = 7.69\times10^5\,\text{rad/s}$. The product $(1 + \omega^2\tau_1^2)(1 + \omega^2\tau_2^2)(1 + \omega^2\tau_3^2)$ reaches 2 at $\omega_{-3dB} = ${f(nPole([1e6, 4e6, 20e6]) / 1e3, 4)}\,\text{krad/s}$, ${f(100 * (nPole([1e6, 4e6, 20e6]) * 1.3e-6 - 1), 2)}% above the estimate.`,
      }),
      P({
        id: 'bk13-why-x3', title: 'The worst case',
        q: md`Two equal poles at $20\,\text{Mrad/s}$. Find the estimate and the truth.`,
        parts: [num('\\hat\\omega_{-3dB}', 1e7, 'w', [{ v: 2e7, msg: 'Two time constants of $50\\,\\text{ns}$ add to $100\\,\\text{ns}$.' }]), num('\\omega_{-3dB}', Math.sqrt(Math.SQRT2 - 1) * 2e7, 'w')],
        hints: [md`$\omega_{-3dB} = \sqrt{\sqrt2 - 1}/\tau$.`],
        sol: md`$\hat\omega = 1/100\,\text{ns} = 10\,\text{Mrad/s}$; $\omega_{-3dB} = 0.6436\times20 = 12.9\,\text{Mrad/s}$: the estimate is 22% low, its worst.`,
      }),
      P({
        id: 'bk13-why-x4', title: 'Read $b_1$ off a denominator',
        q: md`$D(s) = 10^{-17}s^2 + 1.1\times10^{-8}s + 1$. Find the estimate, then the true poles and the true bandwidth.`,
        parts: [num('\\hat\\omega_{-3dB}', 1 / 1.1e-8, 'w'), num('\\omega_{p1}', 1e8, 'w'), num('\\omega_{p2}', 1e9, 'w'), num('\\omega_{-3dB}', twoPole(1e-8, 1e-9), 'w')],
        hints: [md`$b_1 = 11\,\text{ns}$.`, md`$s = \dfrac{-b_1\pm\sqrt{b_1^2 - 4b_2}}{2b_2}$.`],
        sol: md`$\hat\omega = 1/11\,\text{ns} = 9.09\times10^7\,\text{rad/s}$. Roots: $\sqrt{1.21\times10^{-16} - 4\times10^{-17}} = 9\times10^{-9}$, so $|s| = (11\mp9)\times10^{-9}/(2\times10^{-17}) = 10^8$ and $10^9\,\text{rad/s}$. With the poles a decade apart the truth is $9.90\times10^7$, 9% above the estimate.`,
      }),
      P({
        id: 'bk13-why-x5', title: 'Regroup Lecture 28 by capacitor',
        q: md`In $b = (1 + g_mR_L)C_{xy}R_{TH} + R_{TH}C_{in} + R_L(C_{xy} + C_{out})$, what resistance multiplies $C_{xy}$?`,
        parts: [BK.ex('RTH + RL + gm*RTH*RL', ['gm', 'RTH', 'RL'], 'R_{xy}', { exact: true })],
        hints: [md`Collect every term with $C_{xy}$.`],
        sol: md`$(1 + g_mR_L)R_{TH} + R_L = R_{TH} + R_L + g_mR_{TH}R_L$: the bridge rule, with $R_{left} = R_{TH}$ and $R_{right} = R_L$.`,
      }),
      R(md`### Drill: estimate against truth`),
      G('bk_octc_est', { need: 3 }),
    ],
  });

  // ================================================================ 13.2 the recipe and the pictures
  L({
    id: 'bk13-recipe', title: 'The recipe, and the pictures you need', ref: 'Lecture 29 (page 2)',
    steps: [
      R(md`
        ### The question

        How do you find each $R_{jo}$ quickly? This section gives the recipe and the only three pictures you will ever need: a capacitor from a node to ground, a capacitor bridging an **inverting** transconductor (the Miller case), and a capacitor bridging a **follower**. Every stage in the rest of the chapter is these three pictures.

        ### The recipe (Lecture 29's boxed "OCTC calculation")

        1. **Zero the input.** A signal voltage source becomes a short (its series resistance stays); a signal current source becomes an open.
        2. **Pick one capacitor $C_j$ and remove all the others** (open circuits).
        3. **Find the resistance $R_{jo}$ between $C_j$'s two ends**, with a test source when a transistor is involved.
        4. $\tau_{jo} = R_{jo}C_j$. Repeat for every capacitor.
        5. $\hat\omega_{-3dB} = \dfrac{1}{\sum_j\tau_{jo}}$ in rad/s; $\hat f_{-3dB} = \hat\omega_{-3dB}/2\pi$ in Hz.

        Two capacitors with **both** ends on the same two nodes are in parallel: add them and use one time constant (for example $C_{gd}$ and $C_L$ of a common gate, both from the output to ground).
      `),
      RF(md`
        ### Picture 1: a capacitor from a node to ground

        One end on a node, the other on ground. "Ground" includes $V_{DD}$, $V_{CC}$, the triangles (held biases), and any grounded terminal. The capacitor sees **that node's resistance**, $R_{UP}\parallel R_{DN}$ ([Chapter 3](#/l/bk03-node)):

        [[fig:n]]

        Size it with the terminal rules: a drain or collector is big ($r_{ds}$, $r_o$, or more with degeneration); a source or emitter is small (about $1/g_m$); a gate adds nothing; a base adds $r_\pi$ (or $r_\pi + (\beta + 1)R_E$).
      `, { n: { fig: M.nodeUD(), cap: 'Picture 1: the capacitor sees $R_{UP}\\parallel R_{DN}$.' } }),
      RF(md`
        ### Picture 2: a bridge across an inverting transconductor (derived)

        Now both ends move. Node 1 (a gate or base) has $R_{left}$ to ground. Node 2 (a drain or collector) has $R_{right}$ to ground, and the transistor pulls $G_mv_1$ out of it. Replace the capacitor by a test current $I_T$, out of node 1 and into node 2 (Lecture 29's picture):

        [[fig:b]]

        - **Node 1.** No other current enters node 1 (a gate draws none; for a base, $r_\pi$ is already inside $R_{left}$), so $I_T$ must come up through $R_{left}$ from ground:
        $$v_1 = -I_TR_{left}$$
        - **Node 2.** $I_T$ arrives and leaves through $R_{right}$ and the transconductor:
        $$I_T = \frac{v_2}{R_{right}} + G_mv_1 = \frac{v_2}{R_{right}} - G_mI_TR_{left}\quad\Rightarrow\quad v_2 = I_TR_{right}(1 + G_mR_{left})$$
        - **The test voltage** across the gap, $V_T = v_2 - v_1$:
        $$V_T = I_TR_{right}(1 + G_mR_{left}) + I_TR_{left}$$

        !!key The bridge rule
          $$R = \frac{V_T}{I_T} = R_{left} + R_{right} + G_mR_{left}R_{right} = R_{right} + (1 + G_mR_{right})R_{left}$$
          The second form reads: $R_{left}$ multiplied by **one plus the gain** $G_mR_{right}$ from node 1 to node 2. That is Chapter 12's Miller effect, appearing as a resistance.

        **Check it.** $G_m = 0$: $R_{left} + R_{right}$, two resistors in series through ground. ✓ $R_{left} = 0$: $R_{right}$ (node 1 is ground, the capacitor hangs on node 2). ✓ Units: $G_mR_{left}R_{right}$ is siemens times ohms times ohms, ohms. ✓
      `, { b: { fig: T.bridge({ test: true }), cap: 'Picture 2: a test current across the bridge. $G_mv_1$ is pulled out of node 2.' } }),
      RF(md`
        ### Picture 3: a bridge across a follower (derived)

        When the capacitor sits between a gate and **its own source** (a source follower's $C_{gs}$, or a degenerated stage's), the transistor's current depends on the very voltage across the capacitor. Put a test voltage $V_T$ across it, so $v_{gs} = V_T$ exactly; the gate node has $R_G$ to ground, the source node $R_S$ (drain held, $r_{ds}$ ignored):

        [[fig:f]]

        - $I_T$ leaves the test source's $+$ end into the gate and flows down $R_G$: $v_g = I_TR_G$.
        - The source node receives $g_mV_T$ from the transistor and loses $I_T$ into the test source, so $R_S$ carries $g_mV_T - I_T$: $v_s = (g_mV_T - I_T)R_S$.
        - $v_g = v_s + V_T$ (Lecture 29's loop):
        $$0 = -I_TR_G + V_T + (g_mV_T - I_T)R_S\quad\Rightarrow\quad V_T(1 + g_mR_S) = I_T(R_G + R_S)$$

        !!key The follower bridge
          $$R = \frac{R_G + R_S}{1 + g_mR_S}$$
          the loop resistance, **divided** by one plus $g_m$ times the source-side resistance. The source follows the gate, so the capacitor sees much less than its loop.

        Compare the two bridges: across an inverting gain the gain term **adds**; across a follower it **divides**.
      `, { f: { fig: T.follow({ rg: 'R_G', rs: 'R_S' }), cap: 'Picture 3: a test current across gate and source; the transistor pushes $g_mv_{gs}$ into the source node.' } }),
      R(md`
        ### Recognize the picture in one second

        Look at the capacitor's two ends:
        - **one end on ground, a supply, or a triangle** → picture 1, that node's resistance;
        - **gate and drain** (base and collector) of the same transistor, signal inverted between them → picture 2, $R_{left} + R_{right} + G_mR_{left}R_{right}$;
        - **gate and source** (base and emitter) when the source (emitter) is not grounded → picture 3, the follower bridge.

        The trap: the same physical capacitor changes picture with the circuit. $C_{gd}$ is picture 2 in a common source, but in a common gate the gate is held, so it is picture 1 (output to ground). $C_{gs}$ is picture 1 in a common source (source grounded) and picture 3 in a follower.

        !!mistake Common mistakes
          - Dropping the gain term in picture 2 (the usual way to get a bandwidth ten times too high).
          - Using the inverting rule for a follower's $C_{gs}$: the gain term divides there.
          - Putting the two sides of a bridge in parallel. The test current goes through both: series, plus the gain term.
          - Forgetting that a held gate or base is a ground.
      `),
      Q(md`$R_{left} = 2\,\text{k}\Omega$, $R_{right} = 5\,\text{k}\Omega$, $G_m = 4\,\text{mS}$. What does the bridging capacitor see?`,
        [md`$47\,\text{k}\Omega$`, md`$7\,\text{k}\Omega$`, md`$1.43\,\text{k}\Omega$`, md`$40\,\text{k}\Omega$`], 0,
        [null, md`You dropped $G_mR_{left}R_{right} = 40\,\text{k}\Omega$.`, md`Not parallel: the test current passes through both sides.`, md`That is the gain term alone.`],
        md`$2 + 5 + 4\,\text{mS}\times2\,\text{k}\Omega\times5\,\text{k}\Omega = 47\,\text{k}\Omega$. The gain from node 1 to node 2 is 20, so $R_{left}$ is multiplied by 21: $5 + 42$.`),
      Q(md`In a common gate (gate on a triangle), which picture is $C_{gd}$?`,
        [md`Picture 1: from the output node to the held gate, i.e. to ground`, md`Picture 2: it bridges gate and drain`, md`Picture 3: a follower bridge`, md`None: it is shorted`], 0,
        [null, md`The gate is held, so that end is a ground: no bridge.`, md`A follower bridge is gate to source of a stage whose source follows.`, md`It is not shorted: it hangs on the output node.`],
        md`One end on a held gate means one end on ground: $C_{gd}$ joins $C_L$ on the output node.`, { fig: F.cg({ hi: 'Cgd' }) }),
      Q(md`In a source follower, $C_{gs}$ connects the gate ($R_S$ to the source of $v_{in}$) and the output ($R_L$ to ground). Its resistance is...`,
        [md`$\dfrac{R_S + R_L}{1 + g_mR_L}$`, md`$R_S + R_L + g_mR_SR_L$`, md`$R_S$`, md`$R_S\parallel R_L$`], 0,
        [null, md`That is the inverting bridge. Across a follower the gain term divides.`, md`That would need the source grounded.`, md`A bridge sees the two sides through the loop, not in parallel.`],
        md`Picture 3 with the gate resistance $R_S$ and the source resistance $R_L$.`, { fig: F.sf({ hi: 'Cgs' }) }),
      P({
        id: 'bk13-recipe-x1', title: 'The bridge rule in numbers',
        q: md`Node 1 has $2\,\text{k}\Omega$ to ground, node 2 has $10\,\text{k}\Omega$ to ground, and a transconductor pulls $G_mv_1$ out of node 2 with $G_m = 5\,\text{mS}$. Find the resistance a capacitor between the nodes sees, and the gain from node 1 to node 2.`,
        fig: T.bridgeC(),
        parts: [BK.res('R', 112e3, undefined, [{ v: 12e3, msg: 'Add the gain term $G_mR_{left}R_{right} = 100\\,\\text{k}\\Omega$.' }]), num('|v_2/v_1|', 50, 'x')],
        hints: [md`$R_{left} + R_{right} + G_mR_{left}R_{right}$.`],
        sol: md`$R = 2 + 10 + 5\,\text{mS}\times2\,\text{k}\Omega\times10\,\text{k}\Omega = 2 + 10 + 100 = 112\,\text{k}\Omega$. The gain is $G_mR_{right} = 50$, and indeed $R = R_{right} + (1 + 50)R_{left} = 10 + 102$.`,
      }),
      P({
        id: 'bk13-recipe-x2', title: 'The follower bridge in numbers',
        q: md`A gate with $R_G = 20\,\text{k}\Omega$ to ground, its source with $R_S = 2\,\text{k}\Omega$ to ground, $g_m = 2\,\text{mS}$, $r_{ds}$ ignored. What does $C_{gs}$ see?`,
        fig: T.follow({ rg: 'R_G', rs: 'R_S' }),
        parts: [BK.res('R_{cgs}', 22e3 / 5, undefined, [{ v: 22e3, msg: 'Divide by $1 + g_mR_S = 5$.' }, { v: 22e3 + 2e-3 * 20e3 * 2e3, msg: 'That is the inverting bridge; here the gain term divides.' }])],
        hints: [md`$\dfrac{R_G + R_S}{1 + g_mR_S}$.`],
        sol: md`$\dfrac{20 + 2}{1 + 4} = 4.4\,\text{k}\Omega$.`,
      }),
      P({
        id: 'bk13-recipe-x3', title: 'A node to ground',
        q: md`A capacitor hangs from a node that has $10\,\text{k}\Omega$ up to a held bias and $15\,\text{k}\Omega$ down to ground. What does it see?`,
        fig: M.nodeUD({ up: '10\\kO', dn: '15\\kO' }),
        parts: [BK.res('R', 6e3, undefined, [{ v: 25e3, msg: 'A held bias is ground: the two are in parallel.' }])],
        sol: md`$10\parallel15 = 6\,\text{k}\Omega$.`,
      }),
      P({
        id: 'bk13-recipe-x4', title: 'The rule, symbolically',
        q: md`Write the resistance seen by a capacitor bridging node 1 ($R_1$ to ground) and node 2 ($R_2$ to ground) when $g_mv_1$ is pulled out of node 2.`,
        fig: T.bridgeC({ rl: 'R_1', rr: 'R_2', gm: 'g_mv_1' }),
        parts: [BK.ex('R1 + R2 + gm*R1*R2', ['gm', 'R1', 'R2'], 'R', { exact: true })],
        hints: [md`$v_1 = -I_TR_1$, then KCL at node 2.`],
        sol: md`$v_1 = -I_TR_1$; $I_T = v_2/R_2 + g_mv_1$ gives $v_2 = I_TR_2(1 + g_mR_1)$; $R = (v_2 - v_1)/I_T = R_1 + R_2 + g_mR_1R_2$.`,
      }),
      R(md`### Drills: the two bridges, and recognizing the picture`),
      G('bk_bridge', { need: 3 }),
      G('bk_octc_which', { need: 6 }),
    ],
  });

  // ================================================================ 13.3 common source and common emitter
  L({
    id: 'bk13-cs', title: 'Common source and common emitter', ref: 'Lecture 29 (page 3)',
    steps: [
      RF(md`
        ### The question

        The common source is the stage you will most likely meet on the exam. Lecture 29 does it with three test-source pictures. We follow the notes, keep $r_{ds}$ where it belongs, and then translate to the common emitter.

        [[fig:a]]

        [[fig:b]]
      `, { a: { fig: F.cs(), cap: 'The common source with its capacitors ($C_L$ includes $C_{db}$).' }, b: { fig: M.csSS().filter((e) => !(e[0] === 'C' && e[3] && e[3].n === 'C_{db}') && !(e[0] === 'gnd' && e[1][0] === 4.1)), cap: 'Its small-signal circuit (Lecture 29, page 3).' } }),
      RF(md`
        ### $\tau_{cgs}$: a test voltage where $C_{gs}$ was

        Zero $v_{in}$ (so $R_S$ goes to ground), remove $C_{gd}$ and $C_L$, and put a test source $V_T$ across the gate and source:

        [[fig:t]]

        The gate draws no current and nothing else connects to the gate node, so all of $I_T$ flows through $R_S$. The right-hand half (the transconductor into $R_L$) is cut off from the gate: it carries current, but none of it reaches the test source.
        $$R_{cgs} = R_S,\qquad\tau_{cgs} = R_SC_{gs}$$
      `, { t: { fig: T.csGs(), cap: 'Lecture 29: $\\tau_{cgs}$. The test source only sees $R_S$.' } }),
      RF(md`
        ### $\tau_{cgd}$: a test current where $C_{gd}$ was

        Remove $C_{gs}$ and $C_L$, and drive a test current $I_T$ from the gate node ($v_1$) to the drain node ($v_2$):

        [[fig:t]]

        This is picture 2 with $R_{left} = R_S$ and $R_{right} = R_L$. The notes' lines:
        - $v_1 = -I_TR_S$ ($I_T$ leaves the gate node, so it comes up through $R_S$);
        - $I_T = g_mv_1 + \dfrac{v_2}{R_L} = -g_mI_TR_S + \dfrac{v_2}{R_L}$, so $v_2 = I_T(1 + g_mR_S)R_L$;
        - $V_T = v_2 - v_1 = I_T(1 + g_mR_S)R_L + I_TR_S$.
        $$R_{cgd} = \frac{V_T}{I_T} = (1 + g_mR_S)R_L + R_S = R_L + (1 + g_mR_L)R_S$$

        ### $\tau_{CL}$: the output node

        With the gate at 0 ($v_{in}$ zeroed, $C_{gd}$ removed) the transistor is only $r_{ds}$ from the drain to ground:
        $$R_{CL} = R_L\parallel r_{ds}\approx R_L$$

        ### With $r_{ds}$

        The notes ignore $r_{ds}$. Keep it and nothing changes in the method: everything on the drain is $R_L' = R_L\parallel r_{ds}$, so $R_{cgd} = R_S + R_L' + g_mR_SR_L'$ and $R_{CL} = R_L'$. A separate $C_{db}$ adds to $C_L$ (same two nodes).

        !!key Common source (Lecture 29)
          $$\sum\tau = R_SC_{gs} + \big[R_L' + (1 + g_mR_L')R_S\big]C_{gd} + R_L'C_L,\qquad R_L' = R_L\parallel r_{ds}$$
          The same three terms as Chapter 12's exact $b$: here OCTC gives the dominant-pole estimate with no algebra.
      `, { t: { fig: T.csGd(), cap: 'Lecture 29: $\\tau_{cgd}$. A test current from the gate node to the drain node.' } }),
      RF(md`
        ### The common emitter: one change, $r_\pi$

        Replace the NMOS by an NPN: $C_{gs}\to C_\pi$, $C_{gd}\to C_\mu$, $r_{ds}\to r_o$. The base is not an open circuit: $r_\pi$ runs from the base to the (grounded) emitter, right across $C_\pi$. So wherever the MOS answer had "the gate node: $R_S$", the BJT answer has $R_S\parallel r_\pi$:
        $$R_\pi = R_S\parallel r_\pi,\qquad R_\mu = (R_S\parallel r_\pi) + R_L' + g_m(R_S\parallel r_\pi)R_L',\qquad R_{CL} = R_L' = R_L\parallel r_o$$

        [[fig:e]]

        Ask every time: "is there an $r_\pi$ on this node?" It is the most common slip on a BJT frequency problem.
      `, { e: { fig: F.ce(), cap: 'The common emitter: the same three capacitors, plus $r_\\pi$ at the base.' } }),
      R(md`
        ### Check it

        - $R_S\to0$: $\tau_{cgs}\to0$ and $R_{cgd}\to R_L'$ (the gate is held, $C_{gd}$ is a capacitor from the drain to ground). ✓
        - $g_m\to0$: $R_{cgd}\to R_S + R_L'$, two resistors through ground. ✓
        - The sum equals Chapter 12's exact $b$ term by term. ✓

        ### Worked example 1: the running common source with $r_{ds}$

        $g_m = 5\,\text{mS}$, $r_{ds} = 40\,\text{k}\Omega$, $R_L = 10\,\text{k}\Omega$, $R_S = 4\,\text{k}\Omega$, $C_{gs} = 200\,\text{fF}$, $C_{gd} = 25\,\text{fF}$, $C_L = 300\,\text{fF}$.
        1. $R_L' = 10\parallel40 = 8\,\text{k}\Omega$; $g_mR_L' = 40$.
        2. $R_{cgs} = 4\,\text{k}\Omega$: $\tau_{cgs} = 0.8\,\text{ns}$.
        3. $R_{cgd} = 8 + 41\times4 = 172\,\text{k}\Omega$: $\tau_{cgd} = 4.3\,\text{ns}$.
        4. $R_{CL} = 8\,\text{k}\Omega$: $\tau_{CL} = 2.4\,\text{ns}$.
        5. $\sum\tau = 7.5\,\text{ns}$, $\hat\omega_{-3dB} = 1.33\times10^8\,\text{rad/s}$, $\hat f = 21.2\,\text{MHz}$. Exact: $1.39\times10^8$.

        ### Worked example 2: a common emitter

        $I_C = 1\,\text{mA}$ ($g_m = 40\,\text{mS}$), $\beta = 100$ ($r_\pi = 2.5\,\text{k}\Omega$), $r_o = 100\,\text{k}\Omega$; $R_S = 1\,\text{k}\Omega$, $R_L = 4\,\text{k}\Omega$; $C_\pi = 8\,\text{pF}$, $C_\mu = 0.4\,\text{pF}$, $C_L = 1\,\text{pF}$.
        1. Base node: $R_S\parallel r_\pi = 1\parallel2.5 = 714\,\Omega$: $\tau_\pi = 714\,\Omega\times8\,\text{pF} = 5.71\,\text{ns}$.
        2. $R_L' = 4\parallel100 = 3.85\,\text{k}\Omega$; $R_\mu = 0.714 + 3.85 + 40\,\text{mS}\times0.714\,\text{k}\Omega\times3.85\,\text{k}\Omega = 114.4\,\text{k}\Omega$: $\tau_\mu = 45.8\,\text{ns}$.
        3. $\tau_{CL} = 3.85\,\text{k}\Omega\times1\,\text{pF} = 3.85\,\text{ns}$.
        4. $\sum\tau = 55.3\,\text{ns}$, $\hat\omega = 1.81\times10^7\,\text{rad/s}$ ($\hat f = 2.88\,\text{MHz}$). Exact: $1.83\times10^7$.

        The $0.4\,\text{pF}$ $C_\mu$ is 83% of the sum. In both stages the smallest capacitor has the biggest time constant: Miller.

        !!mistake Common mistakes
          - $R_S$ instead of $R_S\parallel r_\pi$ at a base.
          - Dropping $g_mR_SR_L'$, the Miller term.
          - Forgetting $r_{ds}$ (or $r_o$) in $R_L'$ when it is given.
          - Forgetting $C_{db}$ when it is given separately: it adds to $C_L$.
      `),
      Q(md`You double $R_L$ to double a common source's gain ($r_{ds}$ ignored, $g_mR_L\gg1$). What happens to $\tau_{cgd}$?`,
        [md`It roughly doubles`, md`It stays the same`, md`It halves`, md`It quadruples`], 0,
        [null, md`Both $R_L$ and the Miller factor $1 + g_mR_L$ grow.`, md`More gain makes it worse, not better.`, md`$R_L + (1 + g_mR_L)R_S$ is linear in $R_L$.`],
        md`$R_{cgd} = R_L + (1 + g_mR_L)R_S$ grows linearly with $R_L$, and so does $\tau_{CL}$. More gain, less bandwidth.`),
      Q(md`Common emitter, $R_S = 2.5\,\text{k}\Omega$, $r_\pi = 2.5\,\text{k}\Omega$. What does $C_\pi$ see?`,
        [md`$1.25\,\text{k}\Omega$`, md`$2.5\,\text{k}\Omega$`, md`$5\,\text{k}\Omega$`, md`$25\,\Omega$`], 0,
        [null, md`That is one path. $R_S$ and $r_\pi$ both go from the base to ground.`, md`Parallel, not series.`, md`That is looking into an emitter, $r_\pi/(\beta + 1)$.`],
        md`$R_S\parallel r_\pi = 1.25\,\text{k}\Omega$.`, { fig: F.ce({ hi: 'Cpi' }) }),
      P({
        id: 'bk13-cs-x1', title: 'The running common source, with $r_{ds}$',
        q: md`$g_m = 5\,\text{mS}$, $r_{ds} = 40\,\text{k}\Omega$, $R_S = 4\,\text{k}\Omega$, $R_L = 10\,\text{k}\Omega$, $C_{gs} = 200\,\text{fF}$, $C_{gd} = 25\,\text{fF}$, $C_L = 300\,\text{fF}$. Find the three resistances, the sum, and the estimate.`,
        fig: F.cs({ v: { RS: '4\\kO', RL: '10\\kO', Cgs: '200\\,\\text{fF}', Cgd: '25\\,\\text{fF}', CL: '300\\,\\text{fF}' } }),
        parts: [BK.res('R_{cgs}', 4e3), BK.res('R_{cgd}', 172e3, undefined, [{ v: 12e3, msg: 'Add the Miller term $g_mR_SR_L\'$.' }, { v: 4e3 + 10e3 + 5e-3 * 4e3 * 10e3, msg: 'Use $R_L\' = R_L\\parallel r_{ds} = 8\\,\\text{k}\\Omega$.' }]),
          BK.res('R_{CL}', 8e3, undefined, [{ v: 10e3, msg: 'Keep $r_{ds}$: $10\\parallel40\\,\\text{k}\\Omega$.' }]), num('\\sum\\tau', 7.5e-9, 't'), num('\\hat\\omega_{-3dB}', 1 / 7.5e-9, 'w')],
        hints: [md`$R_L' = R_L\parallel r_{ds} = 8\,\text{k}\Omega$, $g_mR_L' = 40$.`],
        sol: md`$R_{cgs} = 4\,\text{k}\Omega$ ($0.8\,\text{ns}$); $R_{cgd} = 8 + 41\times4 = 172\,\text{k}\Omega$ ($4.3\,\text{ns}$); $R_{CL} = 8\,\text{k}\Omega$ ($2.4\,\text{ns}$). $\sum\tau = 7.5\,\text{ns}$, $\hat\omega = 1.33\times10^8\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-cs-x2', title: 'A common emitter, step by step',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $r_o = 100\,\text{k}\Omega$; $R_S = 1\,\text{k}\Omega$, $R_L = 4\,\text{k}\Omega$; $C_\pi = 8\,\text{pF}$, $C_\mu = 0.4\,\text{pF}$, $C_L = 1\,\text{pF}$. Find $R_\pi$, $R_\mu$, $R_{CL}$ and the estimate.`,
        fig: F.ce({ v: { RS: '1\\kO', RL: '4\\kO', Cpi: '8\\,\\text{pF}', Cmu: '0.4\\,\\text{pF}', CL: '1\\,\\text{pF}' } }),
        parts: [BK.res('R_\\pi', STG.ce(CE1)[0].R, undefined, [{ v: 1e3, msg: 'The base node has $r_\\pi$ too.' }]), BK.res('R_\\mu', STG.ce(CE1)[1].R, undefined, [{ v: 1e3 + 4e3 + 40e-3 * 1e3 * 4e3, msg: 'Use $R_S\\parallel r_\\pi$ and $R_L\\parallel r_o$.' }]),
          BK.res('R_{CL}', STG.ce(CE1)[2].R), num('\\hat\\omega_{-3dB}', oc('ce', CE1).w, 'w')],
        hints: [md`$r_\pi = 2.5\,\text{k}\Omega$, $R_S\parallel r_\pi = 714\,\Omega$, $R_L' = 3.85\,\text{k}\Omega$.`],
        sol: md`$R_\pi = 714\,\Omega$ ($5.71\,\text{ns}$); $R_\mu = 0.714 + 3.846 + 40\,\text{mS}\times714\,\Omega\times3.846\,\text{k}\Omega = 114.4\,\text{k}\Omega$ ($45.8\,\text{ns}$); $R_{CL} = 3.846\,\text{k}\Omega$ ($3.85\,\text{ns}$). $\sum\tau = 55.3\,\text{ns}$, $\hat\omega = 1.81\times10^7\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-cs-x3', title: '$R_{cgd}$ with $r_{ds}$, symbolically',
        q: md`Write the resistance $C_{gd}$ of a common source sees, keeping $r_{ds}$ (source resistance $R_S$, load $R_L$).`,
        fig: F.cs({ hi: 'Cgd' }),
        parts: [BK.ex('RS + RL*rds/(RL + rds) + gm*RS*RL*rds/(RL + rds)', ['gm', 'RS', 'RL', 'rds'], 'R_{cgd}', { exact: true })],
        hints: [md`The bridge rule with $R_{right} = R_L\parallel r_{ds}$.`],
        sol: md`$R_{cgd} = R_S + R_L' + g_mR_SR_L'$ with $R_L' = \dfrac{R_Lr_{ds}}{R_L + r_{ds}}$.`,
      }),
      P({
        id: 'bk13-cs-x4', title: 'With $C_{db}$ given separately',
        q: md`$g_m = 2\,\text{mS}$, $r_{ds}\to\infty$, $R_S = 10\,\text{k}\Omega$, $R_L = 20\,\text{k}\Omega$; $C_{gs} = 0.2\,\text{pF}$, $C_{gd} = 20\,\text{fF}$, $C_{db} = 50\,\text{fF}$, $C_L = 150\,\text{fF}$. Find the sum and the estimate in Hz.`,
        fig: F.cs({ cdb: true, v: { RS: '10\\kO', RL: '20\\kO', Cgs: '0.2\\,\\text{pF}', Cgd: '20\\,\\text{fF}', Cdb: '50\\,\\text{fF}', CL: '150\\,\\text{fF}' } }),
        parts: [num('\\sum\\tau', 14.6e-9, 't', [{ v: 13.6e-9, msg: '$C_{db}$ also hangs on the output node: add it to $C_L$.' }]), num('\\hat f_{-3dB}', 1 / 14.6e-9 / (2 * Math.PI), 'f', [{ v: 1 / 14.6e-9, msg: 'That is in rad/s.' }])],
        hints: [md`$C_{db} + C_L = 200\,\text{fF}$ on the output; $g_mR_L = 40$.`],
        sol: md`$\tau_{cgs} = 10\,\text{k}\Omega\times0.2\,\text{pF} = 2\,\text{ns}$; $R_{cgd} = 20 + 41\times10 = 430\,\text{k}\Omega$, $\tau = 8.6\,\text{ns}$; output $20\,\text{k}\Omega\times200\,\text{fF} = 4\,\text{ns}$. $\sum\tau = 14.6\,\text{ns}$, $\hat\omega = 6.85\times10^7\,\text{rad/s}$, $\hat f = 10.9\,\text{MHz}$.`,
      }),
      P({
        id: 'bk13-cs-x5', title: 'Twice the gain',
        q: md`Same stage as the previous problem, but $R_L = 40\,\text{k}\Omega$. Find the new gain magnitude and the new estimate.`,
        parts: [num('|A_v|', 80, 'x'), num('\\hat\\omega_{-3dB}', 1 / 27e-9, 'w')],
        hints: [md`$R_{cgd} = 40 + 81\times10\,\text{k}\Omega$.`],
        sol: md`$|A_v| = g_mR_L = 80$. $\tau_{cgs} = 2\,\text{ns}$; $R_{cgd} = 40 + 810 = 850\,\text{k}\Omega$, $17\,\text{ns}$; output $8\,\text{ns}$. $\sum\tau = 27\,\text{ns}$, $\hat\omega = 3.70\times10^7\,\text{rad/s}$: twice the gain, a bit more than half the bandwidth.`,
      }),
      R(md`### Drill: CS and CE`),
      G('bk_octc_cs', { need: 4 }),
    ],
  });

  // ================================================================ 13.4 source degeneration
  const DEGo = oc('csdeg', DEG), DEG0o = oc('csdeg', DEG0), DEGro = oc('csdeg', DEGr);
  const Rx = 50e3 + 400 + 5e-3 * 50e3 * 400;
  L({
    id: 'bk13-deg', title: 'The degenerated common source', ref: 'Lecture 29 (page 4)',
    steps: [
      RF(md`
        ### The question

        Put a resistor under the source and the gain drops to $\dfrac{g_mR_L}{1 + g_mR_S}$ ([Chapter 4](#/l/bk04-degen)). What does it do to the bandwidth? Lecture 29 works this stage, and it shows the method's power: the bridge rule keeps working, with the stage's transconductance in place of $g_m$.

        **Watch the names.** In this stage the notes call the signal-source resistance $R_G$ (it is in series with the gate) and the degeneration resistor $R_S$. In the plain common source, $R_S$ was the signal-source resistance. The drain resistor is drawn $R_D$ in the notes' circuit and called $R_L$ in their formulas; we write $R_L$.

        [[fig:a]]
      `, { a: { fig: F.csdeg(), cap: 'The degenerated common source (Lecture 29, page 4). $C_{gs}$ now ends on the source node, which moves.' } }),
      RF(md`
        ### $\tau_{cgs}$: a follower bridge

        $C_{gs}$ connects the gate and the source, and the source is no longer grounded. Test voltage $V_T$ across it, $r_{ds}$ ignored (as the notes do in the equation):

        [[fig:t]]

        This is picture 3: the gate node has $R_G$, the source node $R_S$, and the transistor pushes $g_mV_T$ into the source node. The notes' loop:
        $$0 = -I_TR_G + V_T + (-I_T + g_mV_T)R_S\quad\Rightarrow\quad R_{cgs} = \frac{V_T}{I_T} = \frac{R_G + R_S}{1 + g_mR_S}$$
        $R_S = 0$ gives back $R_G$, the plain common source. ✓
      `, { t: { fig: T.degGs(), cap: 'Lecture 29: $\\tau_{cgs}$ of the degenerated stage. The notes draw $r_{ds}$ but drop it from the equation.' } }),
      RF(md`
        ### $\tau_{cgd}$: the bridge rule with $g_{m,eff}$

        $C_{gd}$ bridges the gate ($v_1$, with $R_G$) and the drain ($v_2$). Looking down into the drain you see the degenerated drain ([Chapter 3](#/l/bk03-degen)), $R_x = r_{ds} + R_S + g_mr_{ds}R_S$; the load $R_L$ is in parallel. And the gate drives the drain through the degenerated transconductance $g_{m,eff} = \dfrac{g_m}{1 + g_mR_S}$:

        [[fig:t]]

        The notes' lines, with $I_T$ from the gate to the drain:
        - $v_1 = -I_TR_G$;
        - $I_T = \dfrac{v_2}{R_L} + \dfrac{v_2}{R_x} + \dfrac{g_m}{1 + g_mR_S}v_1$, so $I_T\Big[1 + \dfrac{g_mR_G}{1 + g_mR_S}\Big] = v_2\Big[\dfrac{1}{R_L} + \dfrac{1}{R_x}\Big]$;
        - $v_2 - v_1 = I_T(R_L\parallel R_x)\Big[1 + \dfrac{g_mR_G}{1 + g_mR_S}\Big] + I_TR_G$.

        !!key Degenerated common source (Lecture 29)
          $$R_{cgs} = \frac{R_G + R_S}{1 + g_mR_S}\quad(r_{ds}\text{ ignored})$$
          $$R_{cgd} = \underbrace{(R_L\parallel R_x)}_{R_{right}} + \underbrace{R_G}_{R_{left}} + (R_L\parallel R_x)\,R_G\underbrace{\frac{g_m}{1 + g_mR_S}}_{g_{m,eff}},\qquad R_x = r_{ds} + R_S + g_mr_{ds}R_S$$
          $$\tau_{CL} = (R_L\parallel R_x)\,C_L$$

        **The notes' check:** $R_S = 0$ gives $R_x = r_{ds}$ and $R_{cgd} = (R_L\parallel r_{ds})(1 + g_mR_G) + R_G$, the plain common source. ✓
      `, { t: { fig: degGd, cap: 'Lecture 29: $\\tau_{cgd}$ of the degenerated stage. Looking down into the drain: $R_x$.' } }),
      R(md`
        ### What degeneration buys

        $R_S$ divides the gain from the gate to the drain by $1 + g_mR_S$, and the Miller term with it. The gain falls, but the bandwidth rises, and the dominant term falls the most.

        ### Worked example

        $g_m = 5\,\text{mS}$, $R_G = 20\,\text{k}\Omega$, $R_S = 400\,\Omega$ ($g_mR_S = 2$), $R_L = 12\,\text{k}\Omega$, $r_{ds}$ ignored; $C_{gs} = 0.5\,\text{pF}$, $C_{gd} = 50\,\text{fF}$, $C_L = 0.5\,\text{pF}$.
        1. $R_{cgs} = (20 + 0.4)/3 = 6.8\,\text{k}\Omega$: $\tau = 3.4\,\text{ns}$.
        2. $g_{m,eff} = 5/3 = 1.67\,\text{mS}$; $R_{cgd} = 12 + 20 + 1.67\,\text{mS}\times20\,\text{k}\Omega\times12\,\text{k}\Omega = 32 + 400 = 432\,\text{k}\Omega$: $\tau = 21.6\,\text{ns}$.
        3. $\tau_{CL} = 12\,\text{k}\Omega\times0.5\,\text{pF} = 6\,\text{ns}$.
        4. $\sum\tau = 31\,\text{ns}$, $\hat\omega = 3.23\times10^7\,\text{rad/s}$ (exact $3.32\times10^7$). Gain: $-g_mR_L/(1 + g_mR_S) = -20$.

        **Without degeneration** ($R_S = 0$, same parts): $R_{cgs} = 20\,\text{k}\Omega$ ($10\,\text{ns}$), $R_{cgd} = 32 + 1200 = 1232\,\text{k}\Omega$ ($61.6\,\text{ns}$), $\tau_{CL} = 6\,\text{ns}$: $\sum\tau = 77.6\,\text{ns}$, $\hat\omega = 1.29\times10^7$, gain $-60$. Degeneration cut the gain by 3 and raised the bandwidth by 2.5, almost all of it through the Miller term.
      `),
      R(md`
        !!trap What $r_{ds}$ does to the notes' $R_{cgs}$ (an exact solve disagrees)
          The notes draw $r_{ds}$ in the $\tau_{cgs}$ picture but drop it from the equation, so $\tfrac{R_G + R_S}{1 + g_mR_S}$ is the $r_{ds}\to\infty$ answer. Keep $r_{ds}$ (with $R_L$ on the drain) and the exact result is
          $$R_{cgs} = \frac{(R_G + R_S)(r_{ds} + R_L) + R_GR_S}{R_L + R_x}$$
          (a test-voltage solve; it reduces to the notes' form when $r_{ds}\to\infty$, and to $R_G$ when $R_S = 0$). The reason: the source "follows" through the transistor's conductance looking up, $\tfrac{1 + g_mr_{ds}}{r_{ds} + R_L}$, which is less than $g_m$ when $R_L$ is not small next to $r_{ds}$. In the example with $r_{ds} = 50\,\text{k}\Omega$: $R_x = ${f(Rx / 1e3, 4)}\,\text{k}\Omega$, the notes' formula still gives $6.8\,\text{k}\Omega$, but the exact value is $${f(STG.csdeg(DEGr)[0].R / 1e3, 4)}\,\text{k}\Omega$, 15% more.

          The notes' $R_{cgd}$ also uses $g_{m,eff} = g_m/(1 + g_mR_S)$; with $r_{ds}$ kept, the exact short-circuit transconductance is $g_mr_{ds}/R_x = g_m/(1 + g_mR_S + R_S/r_{ds})$, a tiny difference ($0.25\%$ in this example). Unless a problem says otherwise, use the notes' forms; if $r_{ds}$ is given and comparable to $R_L$, expect $R_{cgs}$ to come out somewhat larger than $\tfrac{R_G + R_S}{1 + g_mR_S}$.

        !!mistake Common mistakes
          - Using $R_G$ for $C_{gs}$ as in the plain common source. The source moves now.
          - Using $g_m$ instead of $g_{m,eff}$ in the bridge for $C_{gd}$.
          - Mixing the names: $R_S$ is the degeneration resistor here, $R_G$ the source resistance.
          - Using $R_L\parallel R_S$ for the output: from the drain, $R_S$ is magnified into $R_x$.
      `),
      Q(md`Set $R_S = 0$ in every degenerated result. You should get...`,
        [md`the plain common source: $R_{cgs} = R_G$, $R_{cgd} = R_G + R_L' + g_mR_GR_L'$`, md`zero for every resistance`, md`the common gate`, md`nothing sensible`], 0,
        [null, md`Only $R_S$ goes to zero; $R_G$ and $R_L$ stay.`, md`The input still goes into the gate.`, md`They reduce smoothly: that is the notes' check.`],
        md`Always check a new formula against the case you know; the notes do it for $R_{cgd}$.`),
      Q(md`Why does degeneration raise the bandwidth so much?`,
        [md`It divides the gate-to-drain gain by $1 + g_mR_S$, and the Miller term with it`, md`It lowers $C_{gd}$`, md`It lowers $R_L$`, md`It removes $C_{gs}$`], 0,
        [null, md`The capacitors are the same; what changes is what they see.`, md`$R_L$ is unchanged.`, md`$C_{gs}$ is still there, now seeing $(R_G + R_S)/(1 + g_mR_S)$.`],
        md`$R_{cgd} = R_G + R_L + g_{m,eff}R_GR_L$ with $g_{m,eff} = g_m/(1 + g_mR_S)$: the dominant term shrinks by $1 + g_mR_S$.`),
      P({
        id: 'bk13-deg-x1', title: 'What degeneration buys, in numbers',
        q: md`$g_m = 5\,\text{mS}$, $R_G = 20\,\text{k}\Omega$, $R_S = 400\,\Omega$, $R_L = 12\,\text{k}\Omega$, $r_{ds}$ ignored; $C_{gs} = 0.5\,\text{pF}$, $C_{gd} = 50\,\text{fF}$, $C_L = 0.5\,\text{pF}$. Find $R_{cgs}$, $R_{cgd}$, the estimate, and the estimate with $R_S = 0$.`,
        fig: F.csdeg({ v: { RG: '20\\kO', RS: '400\\,\\Omega', RL: '12\\kO', Cgs: '0.5\\,\\text{pF}', Cgd: '50\\,\\text{fF}', CL: '0.5\\,\\text{pF}' } }),
        parts: [BK.res('R_{cgs}', 6.8e3, undefined, [{ v: 20e3, msg: 'The source end of $C_{gs}$ moves now.' }, { v: 20.4e3, msg: 'Right loop; divide by $1 + g_mR_S = 3$.' }]),
          BK.res('R_{cgd}', 432e3, undefined, [{ v: 1232e3, msg: 'Use $g_{m,eff} = g_m/(1 + g_mR_S)$.' }]), num('\\hat\\omega_{-3dB}', DEGo.w, 'w'), num('\\hat\\omega_{-3dB}\\ (R_S = 0)', DEG0o.w, 'w')],
        hints: [md`$1 + g_mR_S = 3$, $g_{m,eff} = 1.67\,\text{mS}$.`],
        sol: md`$R_{cgs} = 20.4/3 = 6.8\,\text{k}\Omega$ ($3.4\,\text{ns}$); $R_{cgd} = 20 + 12 + 400 = 432\,\text{k}\Omega$ ($21.6\,\text{ns}$); $\tau_{CL} = 6\,\text{ns}$. $\sum\tau = 31\,\text{ns}$: $3.23\times10^7\,\text{rad/s}$. With $R_S = 0$: $10 + 61.6 + 6 = 77.6\,\text{ns}$: $1.29\times10^7\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-deg-x2', title: 'The two degenerated resistances',
        q: md`Ignore $r_{ds}$. Write the resistances $C_{gs}$ and $C_{gd}$ see.`,
        fig: F.csdeg(),
        parts: [BK.ex('(RG + RS)/(1 + gm*RS)', ['gm', 'RG', 'RS'], 'R_{cgs}', { exact: true }), BK.ex('RG + RL + gm*RG*RL/(1 + gm*RS)', ['gm', 'RG', 'RS', 'RL'], 'R_{cgd}', { exact: true })],
        hints: [md`$R_{cgs}$: the follower bridge. $R_{cgd}$: the bridge rule with $g_{m,eff}$.`],
        sol: md`$$R_{cgs} = \frac{R_G + R_S}{1 + g_mR_S},\qquad R_{cgd} = R_G + R_L + \frac{g_mR_GR_L}{1 + g_mR_S}$$`,
      }),
      P({
        id: 'bk13-deg-x3', title: 'The $r_{ds}$ trap',
        q: md`The same stage with $r_{ds} = 50\,\text{k}\Omega$. Find $R_x$, the notes' $R_{cgs}$, and the exact $R_{cgs} = \dfrac{(R_G + R_S)(r_{ds} + R_L) + R_GR_S}{R_L + R_x}$.`,
        parts: [BK.res('R_x', Rx), BK.res('R_{cgs}\\ \\text{(notes)}', 6.8e3), BK.res('R_{cgs}\\ \\text{(exact)}', STG.csdeg(DEGr)[0].R, undefined, [{ v: 6.8e3, msg: 'That is the $r_{ds}\\to\\infty$ form.' }])],
        hints: [md`$R_x = r_{ds} + R_S + g_mr_{ds}R_S$.`],
        sol: md`$R_x = 50 + 0.4 + 5\,\text{mS}\times50\,\text{k}\Omega\times0.4\,\text{k}\Omega = 150.4\,\text{k}\Omega$. Notes: $6.8\,\text{k}\Omega$. Exact: $\dfrac{20.4\times62 + 20\times0.4}{12 + 150.4}\,\text{k}\Omega = \dfrac{1272.8}{162.4} = 7.84\,\text{k}\Omega$. With $R_L/r_{ds} = 0.24$ the transistor follows less well than $g_m$ suggests.`,
      }),
      P({
        id: 'bk13-deg-x4', title: 'The output with $r_{ds}$',
        q: md`For the same stage with $r_{ds} = 50\,\text{k}\Omega$, find the resistance $C_L$ sees.`,
        fig: F.csdeg({ hi: 'CL' }),
        parts: [BK.res('R_{CL}', 1 / (1 / 12e3 + 1 / Rx), undefined, [{ v: 12e3 * 400 / 12.4e3, msg: 'From the drain, $R_S$ is magnified into $R_x$, not seen directly.' }])],
        hints: [md`$R_L\parallel R_x$.`],
        sol: md`$12\,\text{k}\Omega\parallel150.4\,\text{k}\Omega = 11.1\,\text{k}\Omega$.`,
      }),
      R(md`### Drill: the degenerated common source`),
      G('bk_octc_deg', { need: 3 }),
    ],
  });

  // ================================================================ 13.5 common gate and common base
  const CG1 = { gm: 5e-3, rds: 50e3, RS: 1e3, RL: 10e3, C: { Cgs: 0.5e-12, Cgd: 50e-15, CL: 0.5e-12 } };
  const CB1 = { gm: 40e-3, rpi: 2.5e3, RS: 50, RL: 2e3, C: { Cpi: 10e-12, Cmu: 0.5e-12, CL: 2e-12 } };
  const CG1o = oc('cg', CG1), CB1o = oc('cb', CB1);
  L({
    id: 'bk13-cgcb', title: 'Common gate and common base', ref: 'Lecture 29 (page 5)',
    steps: [
      RF(md`
        ### The question

        Chapter 12 found the common gate fast because nothing bridges its input and output. OCTC says the same thing in two lines, and shows exactly where the remaining time constant lives. Lecture 29 keeps $r_{ds}$ here, so we do too.

        [[fig:a]]

        ### $\tau_{cgs}$: the source node

        The gate is held, so $C_{gs}$ hangs from the source node to (incremental) ground: picture 1. The source node has $R_S$ down to the zeroed input, and the transistor's source looking up, with $R_L$ on the drain ([Chapter 3](#/l/bk03-source)):
        $$R_{up} = \frac{r_{ds} + R_L}{1 + g_mr_{ds}}\approx\frac{1}{g_m}\Big(1 + \frac{R_L}{r_{ds}}\Big)$$
        (the notes write the approximate form; it differs from the exact one by the factor $g_mr_{ds}/(1 + g_mr_{ds})$, under 1% for any real transistor).

        !!key Common gate (Lecture 29)
          $$R_{cgs} = R_S\parallel\frac{1}{g_m}\Big[1 + \frac{R_L}{r_{ds}}\Big],\qquad\tau_{cgs} = R_{cgs}C_{gs}$$
          $$\tau_{CL'} = (C_{gd} + C_L)\,R_{CL'},\qquad R_{CL'} = R_L\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$$

        ### $\tau_{CL'}$: both output capacitors together

        $C_{gd}$ runs from the drain to the held gate, so it is a capacitor from the output to ground, side by side with $C_L$. Two capacitors on the same two nodes add, and see the same resistance: the output node, $R_L$ in parallel with the drain degenerated by $R_S$. **No Miller term anywhere.**
      `, { a: { fig: F.cg(), cap: 'The common gate (Lecture 29, page 5): $C_{gs}$ and $C_{gd}$ both go to the held gate.' } }),
      R(md`
        ### Worked example

        $g_m = 5\,\text{mS}$, $r_{ds} = 50\,\text{k}\Omega$, $R_S = 1\,\text{k}\Omega$, $R_L = 10\,\text{k}\Omega$; $C_{gs} = 0.5\,\text{pF}$, $C_{gd} = 50\,\text{fF}$, $C_L = 0.5\,\text{pF}$.
        1. Looking up into the source: $\tfrac{50 + 10}{1 + 250}\,\text{k}\Omega = 239\,\Omega$ (notes' form: $200\times1.2 = 240\,\Omega$). With $R_S$: $R_{cgs} = 1\,\text{k}\Omega\parallel239\,\Omega = 193\,\Omega$, $\tau_{cgs} = 0.096\,\text{ns}$.
        2. Looking down into the drain: $50 + 1 + 5\,\text{mS}\times50\times1\,\text{k}\Omega = 301\,\text{k}\Omega$; $R_{CL'} = 10\parallel301 = 9.68\,\text{k}\Omega$; $\tau_{CL'} = 0.55\,\text{pF}\times9.68\,\text{k}\Omega = 5.32\,\text{ns}$.
        3. $\sum\tau = 5.42\,\text{ns}$, $\hat\omega = 1.85\times10^8\,\text{rad/s}$ (exact $1.87\times10^8$). 98% of it is the output node: **a common gate's bandwidth is set by its load.**

        ### The common base

        Same pictures with the BJT's emitter: looking into the emitter with the base held is $r_\pi/(\beta + 1)\approx1/g_m$ ($r_o$ ignored), and $C_\mu$ joins $C_L$ at the output:
        $$R_\pi = R_S\parallel\frac{r_\pi}{\beta + 1},\qquad R_{CL'} = R_L\ (r_o\text{ ignored})$$
        Example: $I_C = 1\,\text{mA}$, $\beta = 100$, $R_S = 50\,\Omega$, $R_L = 2\,\text{k}\Omega$, $C_\pi = 10\,\text{pF}$, $C_\mu = 0.5\,\text{pF}$, $C_L = 2\,\text{pF}$: $R_\pi = 50\parallel24.75 = 16.6\,\Omega$ ($0.17\,\text{ns}$, even with $10\,\text{pF}$!), output $2\,\text{k}\Omega\times2.5\,\text{pF} = 5\,\text{ns}$; $\hat\omega = 1.94\times10^8\,\text{rad/s}$ (exact $2.00\times10^8$).

        ### What it means

        The common gate and common base turn their big input capacitor harmless by putting it on the lowest-resistance node in the circuit. Their price is input resistance: about $1/g_m$, so they need a driver that can deliver current.

        !!mistake Common mistakes
          - Applying the bridge rule to $C_{gd}$ of a common gate: its gate is held.
          - Forgetting to add $C_{gd}$ (or $C_\mu$) to $C_L$.
          - $R_S$ alone for $C_{gs}$: the transistor's source, about $1/g_m$, is in parallel and usually wins.
          - $R_L$ in parallel with $R_S$ for the output: from the drain, $R_S$ is magnified by $g_mr_{ds}$.
      `),
      Q(md`In a common gate, which time constant usually sets the bandwidth?`,
        [md`$(C_{gd} + C_L)R_{CL'}$ at the output`, md`$C_{gs}$ at the source`, md`a Miller-multiplied $C_{gd}$`, md`they are always equal`], 0,
        [null, md`The source node is about $R_S\parallel1/g_m$: tiny.`, md`There is no Miller term: the gate is held.`, md`Not in general; the output one is usually much bigger.`],
        md`The input node is about $1/g_m$; the output node is about $R_L$, with $C_{gd} + C_L$ on it.`),
      Q(md`Common gate with $R_L = r_{ds}$. Looking up into the source you see about...`,
        [md`$2/g_m$`, md`$1/g_m$`, md`$r_{ds}$`, md`$R_L$`], 0,
        [null, md`Only when $R_L\ll r_{ds}$.`, md`The drain is far from ground here.`, md`From the source, $R_L$ is divided by about $g_mr_{ds}$.`],
        md`$\tfrac{1}{g_m}(1 + R_L/r_{ds}) = 2/g_m$: a big drain load makes the source node less "small".`),
      P({
        id: 'bk13-cgcb-x1', title: 'Common gate with $r_{ds}$',
        q: md`$g_m = 5\,\text{mS}$, $r_{ds} = 50\,\text{k}\Omega$, $R_S = 1\,\text{k}\Omega$, $R_L = 10\,\text{k}\Omega$; $C_{gs} = 0.5\,\text{pF}$, $C_{gd} = 50\,\text{fF}$, $C_L = 0.5\,\text{pF}$. Find $R_{cgs}$, $R_{CL'}$ and the estimate.`,
        fig: F.cg({ v: { RS: '1\\kO', RL: '10\\kO', Cgs: '0.5\\,\\text{pF}', Cgd: '50\\,\\text{fF}', CL: '0.5\\,\\text{pF}' } }),
        parts: [BK.res('R_{cgs}', STG.cg(CG1)[0].R, 1 / (1 / 1e3 + 1 / 240), [{ v: 1e3, msg: 'The source node also has the transistor on it.' }]),
          BK.res("R_{CL'}", STG.cg(CG1)[1].R, undefined, [{ v: 10e3 * 1e3 / 11e3, msg: 'From the drain $R_S$ is magnified, not in parallel.' }]),
          num('\\hat\\omega_{-3dB}', CG1o.w, 'w', [{ v: 1 / (STG.cg(CG1)[1].R * 0.5e-12 + STG.cg(CG1)[0].R * 0.5e-12), msg: 'Add $C_{gd}$ to $C_L$: it hangs from the output to the held gate.' }])],
        hints: [md`Up into the source: $\tfrac{r_{ds} + R_L}{1 + g_mr_{ds}}$.`, md`Down into the drain: $r_{ds} + R_S + g_mr_{ds}R_S$.`],
        sol: md`$R_{cgs} = 1\,\text{k}\Omega\parallel239\,\Omega = 193\,\Omega$ ($0.096\,\text{ns}$). $R_{CL'} = 10\parallel301 = 9.68\,\text{k}\Omega$, with $C_{gd} + C_L = 0.55\,\text{pF}$: $5.32\,\text{ns}$. $\sum\tau = 5.42\,\text{ns}$, $\hat\omega = 1.85\times10^8\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-cgcb-x2', title: 'A common base',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $r_o\to\infty$; $R_S = 50\,\Omega$, $R_L = 2\,\text{k}\Omega$; $C_\pi = 10\,\text{pF}$, $C_\mu = 0.5\,\text{pF}$, $C_L = 2\,\text{pF}$. Find $R_\pi$, the output time constant and the estimate.`,
        fig: F.cb({ v: { RS: '50\\,\\Omega', RL: '2\\kO', Cpi: '10\\,\\text{pF}', Cmu: '0.5\\,\\text{pF}', CL: '2\\,\\text{pF}' } }),
        parts: [BK.res('R_\\pi', STG.cb(CB1)[0].R, undefined, [{ v: 50, msg: 'The emitter itself, $r_\\pi/(\\beta + 1)$, is in parallel.' }, { v: 1 / (1 / 50 + 1 / 2500), msg: 'Looking into an emitter, $r_\\pi$ is divided by $\\beta + 1$.' }]),
          num("\\tau_{CL'}", 5e-9, 't', [{ v: 4e-9, msg: 'Add $C_\\mu$ to $C_L$.' }]), num('\\hat\\omega_{-3dB}', CB1o.w, 'w')],
        hints: [md`$r_\pi = 2.5\,\text{k}\Omega$, $r_\pi/(\beta + 1) = 24.75\,\Omega$.`],
        sol: md`$R_\pi = 50\parallel24.75 = 16.6\,\Omega$, $\tau = 0.166\,\text{ns}$. Output: $2\,\text{k}\Omega\times2.5\,\text{pF} = 5\,\text{ns}$. $\sum\tau = 5.17\,\text{ns}$, $\hat\omega = 1.94\times10^8\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-cgcb-x3', title: '$R_{cgs}$ symbolically',
        q: md`Common gate, $r_{ds}$ ignored: write $R_{cgs}$ in terms of $g_m$ and $R_S$.`,
        parts: [BK.ex('RS/(1 + gm*RS)', ['gm', 'RS'], 'R_{cgs}', { exact: true })],
        sol: md`$R_S\parallel\dfrac{1}{g_m} = \dfrac{R_S}{1 + g_mR_S}$.`,
      }),
      P({
        id: 'bk13-cgcb-x4', title: 'A big drain load',
        q: md`Common gate, $g_m = 2\,\text{mS}$, $r_{ds} = 50\,\text{k}\Omega$, $R_L = 50\,\text{k}\Omega$. Find the resistance looking up into the source, exactly and with the notes' form.`,
        parts: [BK.res('R_{up}\\ \\text{(exact)}', 100e3 / 101, undefined, [{ v: 500, msg: 'With $R_L = r_{ds}$ the source is not $1/g_m$.' }]), BK.res('R_{up}\\ \\text{(notes)}', 1e3)],
        sol: md`Exact: $\dfrac{50 + 50}{1 + 100}\,\text{k}\Omega = 990\,\Omega$; notes: $\dfrac{1}{g_m}(1 + 1) = 1\,\text{k}\Omega$. Twice $1/g_m$.`,
      }),
      R(md`### Drill: common gate and common base`),
      G('bk_octc_cg', { need: 3 }),
    ],
  });

  // ================================================================ 13.6 followers
  const SF1 = { gm: 5e-3, RS: 10e3, RL: 2e3, C: { Cgs: 0.5e-12, Cgd: 50e-15, CL: 1e-12 } };
  const EF1 = { gm: 40e-3, rpi: 2.5e3, RS: 5e3, RL: 1e3, C: { Cpi: 10e-12, Cmu: 1e-12, CL: 5e-12 } };
  const EF2 = { gm: 80e-3, rpi: 1.25e3, RS: 1e3, RL: 2e3, C: { Cpi: 10e-12, Cmu: 0.2e-12, CL: 5e-12 } };
  const SF1o = oc('sf', SF1), EF1o = oc('ef', EF1), EF2o = oc('ef', EF2);
  L({
    id: 'bk13-follow', title: 'Followers', ref: 'Lecture 29',
    steps: [
      RF(md`
        ### The question

        Followers drive heavy loads, so their bandwidth matters. They are also where OCTC shows its limits: a follower's two capacitors interact strongly, the response has a zero, and the poles can even be complex. The method still gives a quick, usually safe number.

        [[fig:a]]

        ### The three capacitors of a source follower ($r_{ds}$ ignored)

        - **$C_{gd}$, picture 1.** The drain is on $V_{DD}$, so $C_{gd}$ hangs from the gate to ground; the gate draws nothing: $R_{cgd} = R_S$.
        - **$C_L$, picture 1.** The output is a source with the gate held at 0 (no current in $R_S$): $R_{CL} = R_L\parallel\tfrac{1}{g_m}$.
        - **$C_{gs}$, picture 3**, the follower bridge with the gate side $R_S$ and the source side $R_L$:
        $$R_{cgs} = \frac{R_S + R_L}{1 + g_mR_L}$$
        The source follows the gate, so $C_{gs}$ is bootstrapped: Chapter 12's Miller factor $1 - A_v$ seen as a resistance.

        ### The emitter follower

        Two changes, both from [Chapter 8](#/l/bk08-elevator): the base draws current, and $r_\pi$ sits across $C_\pi$.
        $$R_\mu = R_S\parallel\big[r_\pi + (\beta + 1)R_L\big],\qquad R_\pi = r_\pi\parallel\frac{R_S + R_L}{1 + g_mR_L},\qquad R_{CL} = R_L\parallel\frac{r_\pi + R_S}{\beta + 1}$$
      `, { a: { fig: F.sf(), cap: 'The source follower: $C_{gd}$ to $V_{DD}$, $C_{gs}$ bridging gate and output.' } }),
      R(md`
        ### Worked example 1: a source follower

        $g_m = 5\,\text{mS}$, $R_S = 10\,\text{k}\Omega$, $R_L = 2\,\text{k}\Omega$; $C_{gs} = 0.5\,\text{pF}$, $C_{gd} = 50\,\text{fF}$, $C_L = 1\,\text{pF}$.
        1. $R_{cgd} = 10\,\text{k}\Omega$: $\tau = 0.5\,\text{ns}$.
        2. $R_{cgs} = \tfrac{10 + 2}{1 + 10}\,\text{k}\Omega = 1.09\,\text{k}\Omega$: $\tau = 0.545\,\text{ns}$.
        3. $R_{CL} = 2\,\text{k}\Omega\parallel200\,\Omega = 182\,\Omega$: $\tau = 0.182\,\text{ns}$.
        4. $\sum\tau = 1.23\,\text{ns}$, $\hat\omega = 8.15\times10^8\,\text{rad/s}$. Exact: $1.13\times10^9$, 38% higher. The exact poles are complex here ($-5.9\times10^8\pm j7.8\times10^8$), and $C_{gs}$ also feeds the input straight to the output (a left-half-plane zero): both push the truth above the estimate.

        ### Worked example 2: an emitter follower

        $I_C = 1\,\text{mA}$, $\beta = 100$ ($r_\pi = 2.5\,\text{k}\Omega$); $R_S = 5\,\text{k}\Omega$, $R_L = 1\,\text{k}\Omega$; $C_\pi = 10\,\text{pF}$, $C_\mu = 1\,\text{pF}$, $C_L = 5\,\text{pF}$.
        1. $R_\mu = 5\parallel(2.5 + 101) = 4.77\,\text{k}\Omega$: $\tau = 4.77\,\text{ns}$.
        2. $R_\pi = 2.5\,\text{k}\Omega\parallel\tfrac{6\,\text{k}\Omega}{41} = 138\,\Omega$: $\tau = 1.38\,\text{ns}$.
        3. $R_{CL} = 1\,\text{k}\Omega\parallel\tfrac{7.5\,\text{k}\Omega}{101} = 69\,\Omega$: $\tau = 0.35\,\text{ns}$.
        4. $\sum\tau = 6.50\,\text{ns}$, $\hat\omega = 1.54\times10^8\,\text{rad/s}$ (exact $1.86\times10^8$). Here $C_\mu$, the plain capacitor on the high-resistance input node, dominates.
      `),
      R(md`
        !!trap The estimate is not always pessimistic for a follower
          Section 13.1 proved the estimate safe for real poles and no zeros. A follower has a zero, and its two poles can be a lightly damped complex pair, and then the estimate can come out **high**. Example: an emitter follower with $I_C = 2\,\text{mA}$, $\beta = 100$, $R_S = 1\,\text{k}\Omega$, $R_L = 2\,\text{k}\Omega$, $C_\pi = 10\,\text{pF}$, $C_\mu = 0.2\,\text{pF}$, $C_L = 5\,\text{pF}$ gives $\sum\tau = ${f(EF2o.sum * 1e9, 3)}\,\text{ns}$ and $\hat\omega = ${f(EF2o.w / 1e9, 3)}\times10^9\,\text{rad/s}$, but an exact solve gives $1.82\times10^9$ (10% lower), with poles at $-3.8\times10^8\pm j1.18\times10^9$. This agrees with the notes' wording ("usually pessimistic"); it is rare, and only for followers in this course, but do not quote the estimate as a guaranteed lower bound there.

        !!mistake Common mistakes
          - Using the inverting bridge for $C_{gs}$ of a follower.
          - $R_S$ alone for $C_\mu$ of an emitter follower: the base looks like $r_\pi + (\beta + 1)R_L$, in parallel.
          - $R_L$ alone at the output: the transistor's source or emitter, about $1/g_m$, wins in parallel.
          - Forgetting $r_\pi$ across $C_\pi$.
      `),
      Q(md`Source follower, $g_m = 4\,\text{mS}$, $R_S = 10\,\text{k}\Omega$, $R_L = 2\,\text{k}\Omega$. What does $C_{gs}$ see?`,
        [md`$1.33\,\text{k}\Omega$`, md`$10\,\text{k}\Omega$`, md`$92\,\text{k}\Omega$`, md`$12\,\text{k}\Omega$`], 0,
        [null, md`That is $C_{gd}$. $C_{gs}$ ends on the source, which follows.`, md`That is the inverting bridge.`, md`Right loop; divide by $1 + g_mR_L = 9$.`],
        md`$\tfrac{10 + 2}{9} = 1.33\,\text{k}\Omega$.`, { fig: F.sf({ hi: 'Cgs' }) }),
      Q(md`Why is $C_\mu$ of an emitter follower **not** just $R_S$, as $C_{gd}$ of a source follower is?`,
        [md`The base draws current: it looks like $r_\pi + (\beta + 1)R_L$, in parallel with $R_S$`, md`Because $C_\mu$ is Miller-multiplied`, md`Because the collector moves`, md`It is just $R_S$`], 0,
        [null, md`The collector is on $V_{CC}$: no Miller.`, md`It is on $V_{CC}$.`, md`A gate is open; a base is not.`],
        md`$R_\mu = R_S\parallel[r_\pi + (\beta + 1)R_L]$; usually close to $R_S$, but write it properly.`, { fig: F.ef({ hi: 'Cmu' }) }),
      P({
        id: 'bk13-follow-x1', title: 'A source follower',
        q: md`$g_m = 5\,\text{mS}$, $r_{ds}\to\infty$, $R_S = 10\,\text{k}\Omega$, $R_L = 2\,\text{k}\Omega$; $C_{gs} = 0.5\,\text{pF}$, $C_{gd} = 50\,\text{fF}$, $C_L = 1\,\text{pF}$. Find the three resistances and the estimate.`,
        fig: F.sf({ v: { RS: '10\\kO', RL: '2\\kO', Cgs: '0.5\\,\\text{pF}', Cgd: '50\\,\\text{fF}', CL: '1\\,\\text{pF}' } }),
        parts: [BK.res('R_{cgs}', STG.sf(SF1)[0].R, undefined, [{ v: 12e3, msg: 'Divide by $1 + g_mR_L$.' }]), BK.res('R_{cgd}', 10e3), BK.res('R_{CL}', STG.sf(SF1)[2].R, undefined, [{ v: 2e3, msg: 'The output is a source: $1/g_m$ in parallel.' }]), num('\\hat\\omega_{-3dB}', SF1o.w, 'w')],
        hints: [md`$1 + g_mR_L = 11$; $1/g_m = 200\,\Omega$.`],
        sol: md`$R_{cgs} = 12/11 = 1.09\,\text{k}\Omega$ ($0.545\,\text{ns}$), $R_{cgd} = 10\,\text{k}\Omega$ ($0.5\,\text{ns}$), $R_{CL} = 182\,\Omega$ ($0.182\,\text{ns}$). $\sum\tau = 1.23\,\text{ns}$, $\hat\omega = 8.15\times10^8\,\text{rad/s}$ (exact $1.13\times10^9$).`,
      }),
      P({
        id: 'bk13-follow-x2', title: 'An emitter follower',
        q: md`$I_C = 1\,\text{mA}$, $\beta = 100$, $r_o\to\infty$; $R_S = 5\,\text{k}\Omega$, $R_L = 1\,\text{k}\Omega$; $C_\pi = 10\,\text{pF}$, $C_\mu = 1\,\text{pF}$, $C_L = 5\,\text{pF}$. Find $R_\pi$, $R_\mu$, $R_{CL}$ and the estimate.`,
        fig: F.ef({ v: { RS: '5\\kO', RL: '1\\kO', Cpi: '10\\,\\text{pF}', Cmu: '1\\,\\text{pF}', CL: '5\\,\\text{pF}' } }),
        parts: [BK.res('R_\\pi', STG.ef(EF1)[0].R, undefined, [{ v: 6e3 / 41, msg: 'Put $r_\\pi$ in parallel: it sits across $C_\\pi$.' }]), BK.res('R_\\mu', STG.ef(EF1)[1].R, undefined, [{ v: 1 / (1 / 5e3 + 1 / 2.5e3), msg: 'The emitter is not grounded: the base looks like $r_\\pi + (\\beta + 1)R_L$.' }]),
          BK.res('R_{CL}', STG.ef(EF1)[2].R, undefined, [{ v: 1 / (1 / 1e3 + 0.04), msg: '$R_S$ on the base also shows at the emitter, divided by $\\beta + 1$.' }]), num('\\hat\\omega_{-3dB}', EF1o.w, 'w')],
        hints: [md`$r_\pi = 2.5\,\text{k}\Omega$; $1 + g_mR_L = 41$.`],
        sol: md`$R_\pi = 2.5\,\text{k}\Omega\parallel146\,\Omega = 138\,\Omega$; $R_\mu = 5\parallel103.5 = 4.77\,\text{k}\Omega$; $R_{CL} = 1\,\text{k}\Omega\parallel74.3\,\Omega = 69.1\,\Omega$. $\sum\tau = 1.38 + 4.77 + 0.35 = 6.50\,\text{ns}$, $\hat\omega = 1.54\times10^8\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-follow-x3', title: 'The follower bridge, symbolically',
        q: md`Source follower, $r_{ds}$ ignored: write $R_{cgs}$.`,
        parts: [BK.ex('(RS + RL)/(1 + gm*RL)', ['gm', 'RS', 'RL'], 'R_{cgs}', { exact: true })],
        sol: md`$$R_{cgs} = \frac{R_S + R_L}{1 + g_mR_L}$$`,
      }),
      P({
        id: 'bk13-follow-x4', title: 'When the estimate is high',
        q: md`Emitter follower: $I_C = 2\,\text{mA}$, $\beta = 100$, $R_S = 1\,\text{k}\Omega$, $R_L = 2\,\text{k}\Omega$, $C_\pi = 10\,\text{pF}$, $C_\mu = 0.2\,\text{pF}$, $C_L = 5\,\text{pF}$. Find $\sum\tau$ and the estimate. An exact solve gives $1.82\times10^9\,\text{rad/s}$: is the estimate pessimistic here?`,
        fig: F.ef({ v: { RS: '1\\kO', RL: '2\\kO', Cpi: '10\\,\\text{pF}', Cmu: '0.2\\,\\text{pF}', CL: '5\\,\\text{pF}' } }),
        parts: [num('\\sum\\tau', EF2o.sum, 't'), num('\\hat\\omega_{-3dB}', EF2o.w, 'w'),
          { lbl: 'Is the estimate pessimistic here?', mc: ['No: it is about 10% high, because the poles are a lightly damped complex pair', 'Yes, as always', 'It is exact'], a: 0, why: [null, 'The guarantee needs real poles and no zeros; this follower has neither.', 'It differs from $1.82\\times10^9$.'] }],
        hints: [md`$g_m = 80\,\text{mS}$, $r_\pi = 1.25\,\text{k}\Omega$, $1 + g_mR_L = 161$.`],
        sol: md`$R_\pi = 1.25\,\text{k}\Omega\parallel\tfrac{3\,\text{k}\Omega}{161} = 18.4\,\Omega$ ($0.184\,\text{ns}$); $R_\mu = 1\parallel(1.25 + 202) = 995\,\Omega$ ($0.199\,\text{ns}$); $R_{CL} = 2\,\text{k}\Omega\parallel\tfrac{2.25\,\text{k}\Omega}{101} = 22.0\,\Omega$ ($0.110\,\text{ns}$). $\sum\tau = ${f(EF2o.sum * 1e9, 3)}\,\text{ns}$, $\hat\omega = ${f(EF2o.w / 1e9, 3)}\times10^9\,\text{rad/s}$, above the true $1.82\times10^9$.`,
      }),
      R(md`### Drill: followers`),
      G('bk_octc_follow', { need: 3 }),
    ],
  });

  // ================================================================ 13.7 the cascode
  const CA = { gm1: 4e-3, gm2: 4e-3, rds1: 50e3, rds2: 50e3, RS: 20e3, RL: 25e3, C: { Cgs1: 0.4e-12, Cgd1: 40e-15, Cgs2: 0.4e-12, Cgd2: 40e-15, CL: 0.5e-12 } };
  const CAcs = { gm: 4e-3, rds: 50e3, RS: 20e3, RL: 25e3, C: { Cgs: 0.4e-12, Cgd: 40e-15, CL: 0.5e-12 } };
  const BCA = { gm1: 40e-3, gm2: 40e-3, rpi1: 2.5e3, rpi2: 2.5e3, RS: 1e3, RL: 5e3, C: { Cpi1: 10e-12, Cmu1: 0.5e-12, Cpi2: 10e-12, Cmu2: 0.5e-12, CL: 2e-12 } };
  const CAo = oc('casc', CA), CAcso = oc('cs', CAcs), BCAo = oc('bjtcasc', BCA);
  const RXc = STG.casc(CA)[2].R;
  L({
    id: 'bk13-cascode', title: 'The cascode', ref: 'Lecture 29 (page 5)',
    steps: [
      RF(md`
        ### The question

        The cascode was Exam 2's way to get more gain. Lecture 29 shows its other virtue: bandwidth. Five capacitors, four time constants, and the Miller term almost gone.

        [[fig:a]]

        ### Walk the capacitors from the input up (Lecture 29)

        - **$C_{gs1}$**: $M_1$'s source is grounded, so it hangs from the input gate: $\tau_{cgs1} = R_SC_{gs1}$.
        - **$C_{gs2}$**: $M_2$'s gate is held, so it hangs from node $X$ to ground. Node $X$ sees $r_{ds1}$ down and $M_2$'s source up:
        $$R_{cgs2} = r_{ds1}\parallel\frac{1}{g_{m2}}\Big(1 + \frac{R_L}{r_{ds2}}\Big)$$
        - **$C_{gd1}$**: it bridges $M_1$'s gate ($R_S$) and node $X$ ($R_{cgs2}$), with $g_{m1}$ between them: picture 2,
        $$R_{cgd1} = R_S + R_{cgs2} + g_{m1}R_SR_{cgs2},\qquad\tau_{cgd1} = \big[\underbrace{(1 + g_{m1}R_{cgs2})}_{\text{Miller}}R_S + R_{cgs2}\big]C_{gd1}$$
        - **$C_{gd2}$ and $C_L$**: both from the output to ground ($M_2$'s gate is held): $\tau_{CL} = (C_{gd2} + C_L)R_{out}$, with $R_{out} = R_L\parallel(r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1})$.

        !!key Cascode (Lecture 29)
          $$\hat\omega_{-3dB} = \frac{1}{\tau_{cgs1} + \tau_{CL} + \tau_{cgs2} + \tau_{cgd1}}$$
          The Miller factor of $C_{gd1}$ is $1 + g_{m1}R_{cgs2}\approx1 + g_{m1}/g_{m2}\approx2$, instead of the common source's $1 + g_mR_L$.
      `, { a: { fig: F.casc(), cap: 'The cascode (Lecture 29, page 5): $C_{gd1}$ ends on node $X$, where the gain is only about $-1$.' } }),
      R(md`
        ### Worked example: cascode against common source

        Identical transistors: $g_m = 4\,\text{mS}$, $r_{ds} = 50\,\text{k}\Omega$, $C_{gs} = 0.4\,\text{pF}$, $C_{gd} = 40\,\text{fF}$; $R_S = 20\,\text{k}\Omega$, $R_L = 25\,\text{k}\Omega$, $C_L = 0.5\,\text{pF}$.
        1. Node $X$: $\tfrac{50 + 25}{1 + 200}\,\text{k}\Omega = 373\,\Omega$, in parallel with $50\,\text{k}\Omega$: $R_{cgs2} = ${f(RXc, 4)}\,\Omega$, $\tau_{cgs2} = 0.15\,\text{ns}$.
        2. $R_{cgd1} = 20 + 0.37 + 4\,\text{mS}\times20\,\text{k}\Omega\times370\,\Omega = 50.0\,\text{k}\Omega$: $\tau_{cgd1} = 2.0\,\text{ns}$. (Miller factor $1 + 1.48 = 2.5$.)
        3. $\tau_{cgs1} = 20\,\text{k}\Omega\times0.4\,\text{pF} = 8\,\text{ns}$.
        4. $R_{out} = 25\,\text{k}\Omega\parallel(100\,\text{k}\Omega + 10\,\text{M}\Omega) = 24.9\,\text{k}\Omega$; $\tau_{CL} = 0.54\,\text{pF}\times24.9\,\text{k}\Omega = 13.5\,\text{ns}$.
        5. $\sum\tau = 23.6\,\text{ns}$, $\hat\omega = 4.23\times10^7\,\text{rad/s}$; gain $\approx-g_mR_{out} = -99$.

        **The common source** with the same parts: $R_L' = 25\parallel50 = 16.7\,\text{k}\Omega$, $R_{cgd} = 20 + 16.7 + 1333 = 1370\,\text{k}\Omega$ ($54.8\,\text{ns}$), plus $8$ and $8.3\,\text{ns}$: $\sum\tau = 71.1\,\text{ns}$, $\hat\omega = 1.41\times10^7$, gain $-66.7$.

        The cascode has **more gain and three times the estimated bandwidth** (exactly: $5.40\times10^7$ against $1.43\times10^7$, nearly four times; the cascode's estimate is more pessimistic because its two big time constants, $8$ and $13.5\,\text{ns}$, are similar).

        ### The BJT cascode

        Same walk with BJT terminal rules: $R_{\pi1} = R_S\parallel r_{\pi1}$; node $X$ is $Q_2$'s emitter, $R_X = r_{\pi2}/(\beta + 1)$ ($r_o$ ignored); $R_{\mu1} = R_{\pi1} + R_X + g_{m1}R_{\pi1}R_X$; $C_{\mu2}$ joins $C_L$ on $R_L$.

        !!mistake Common mistakes
          - Bridging $C_{gd1}$ to the output (the plain common-source answer). It ends on node $X$.
          - Forgetting $C_{gd2}$ at the output.
          - Taking node $X$ as $r_{ds1}$: $M_2$'s source, about $1/g_{m2}$, is in parallel and wins.
      `),
      Q(md`In a cascode with identical transistors and $R_L\ll r_{ds}$, about what does $C_{gd1}$ see?`,
        [md`$2R_S + \tfrac{1}{g_m}$`, md`$R_S + R_L + g_mR_SR_L$`, md`$R_S$`, md`$\tfrac{1}{g_m}$`], 0,
        [null, md`That is the plain common source.`, md`That is $C_{gs1}$.`, md`That is node $X$ alone, $C_{gs2}$.`],
        md`$R_X\approx1/g_m$: $R_S + R_X + g_mR_SR_X\approx2R_S + 1/g_m$. Miller factor about 2.`, { fig: F.casc({ hi: 'Cgd1' }) }),
      P({
        id: 'bk13-cascode-x1', title: 'The cascode in numbers',
        q: md`Identical transistors: $g_m = 4\,\text{mS}$, $r_{ds} = 50\,\text{k}\Omega$, $C_{gs} = 0.4\,\text{pF}$, $C_{gd} = 40\,\text{fF}$; $R_S = 20\,\text{k}\Omega$, $R_L = 25\,\text{k}\Omega$, $C_L = 0.5\,\text{pF}$. Find $R_{cgs2}$, $R_{cgd1}$, $R_{out}$ and the estimate.`,
        fig: F.casc({ v: { RS: '20\\kO', RL: '25\\kO' } }),
        parts: [BK.res('R_{cgs2}', RXc, 1 / (1 / 50e3 + 1 / (250 * 1.5)), [{ v: 50e3, msg: 'Node $X$ also has $M_2$\'s source on it: small.' }]),
          BK.res('R_{cgd1}', STG.casc(CA)[1].R, undefined, [{ v: 20e3 + 25e3 + 4e-3 * 20e3 * 25e3, msg: 'That bridges to the output. $C_{gd1}$ ends on node $X$.' }]),
          BK.res('R_{out}', STG.casc(CA)[3].R), num('\\hat\\omega_{-3dB}', CAo.w, 'w')],
        hints: [md`Up into $M_2$'s source: $\tfrac{r_{ds2} + R_L}{1 + g_{m2}r_{ds2}}$.`],
        sol: md`$R_{cgs2} = 50\,\text{k}\Omega\parallel373\,\Omega = ${f(RXc, 4)}\,\Omega$ ($0.15\,\text{ns}$); $R_{cgd1} = ${f(STG.casc(CA)[1].R / 1e3, 4)}\,\text{k}\Omega$ ($2.0\,\text{ns}$); $\tau_{cgs1} = 8\,\text{ns}$; $R_{out} = 24.9\,\text{k}\Omega$, $\tau_{CL} = 13.5\,\text{ns}$. $\sum\tau = 23.6\,\text{ns}$, $\hat\omega = ${f(CAo.w / 1e7, 3)}\times10^7\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-cascode-x2', title: 'The same parts as a common source',
        q: md`Build a common source from $M_1$ alone ($R_L = 25\,\text{k}\Omega$, $r_{ds} = 50\,\text{k}\Omega$, everything else as before). Find $R_{cgd}$, the estimate, and the ratio of the cascode's estimate to it.`,
        parts: [BK.res('R_{cgd}', STG.cs(CAcs)[1].R), num('\\hat\\omega_{-3dB}', CAcso.w, 'w'), num('\\text{ratio}', CAo.w / CAcso.w, 'x')],
        hints: [md`$R_L' = 16.7\,\text{k}\Omega$, $g_mR_L' = 66.7$.`],
        sol: md`$R_{cgd} = 20 + 16.7 + 4\,\text{mS}\times20\,\text{k}\Omega\times16.7\,\text{k}\Omega = 1370\,\text{k}\Omega$ ($54.8\,\text{ns}$); $\sum\tau = 8 + 54.8 + 8.3 = 71.1\,\text{ns}$, $\hat\omega = 1.41\times10^7\,\text{rad/s}$. Ratio $${f(CAo.w / CAcso.w, 3)}$.`,
      }),
      P({
        id: 'bk13-cascode-x3', title: 'A BJT cascode',
        q: md`Both transistors at $I_C = 1\,\text{mA}$, $\beta = 100$, $r_o\to\infty$; $R_S = 1\,\text{k}\Omega$, $R_L = 5\,\text{k}\Omega$; $C_\pi = 10\,\text{pF}$, $C_\mu = 0.5\,\text{pF}$, $C_L = 2\,\text{pF}$. Find $R_X$, $R_{\mu1}$ and the estimate.`,
        fig: F.bjtcasc({ v: { RS: '1\\kO', RL: '5\\kO' } }),
        parts: [BK.res('R_X', STG.bjtcasc(BCA)[2].R, 25), BK.res('R_{\\mu1}', STG.bjtcasc(BCA)[1].R, undefined, [{ v: 1e3 + 24.75 + 0.04 * 1e3 * 24.75, msg: 'The base node is $R_S\\parallel r_{\\pi1}$.' }]), num('\\hat\\omega_{-3dB}', BCAo.w, 'w')],
        hints: [md`$R_X = r_{\pi2}/(\beta + 1)$; $R_{\pi1} = 1\parallel2.5\,\text{k}\Omega$.`],
        sol: md`$R_X = 2500/101 = 24.75\,\Omega$; $R_{\pi1} = 714\,\Omega$; $R_{\mu1} = 714 + 24.75 + 40\,\text{mS}\times714\times24.75 = 1446\,\Omega$. $\sum\tau = 7.14 + 0.72 + 0.25 + 12.5 = 20.6\,\text{ns}$, $\hat\omega = 4.85\times10^7\,\text{rad/s}$ (a common emitter with the same parts: $\sum\tau = 91.4\,\text{ns}$, $1.09\times10^7$).`,
      }),
      P({
        id: 'bk13-cascode-x4', title: "The notes' $R_{cgd1}$, symbolically",
        q: md`Write $R_{cgd1}$ in terms of $R_S$, $g_{m1}$ and the node-$X$ resistance $R_X$.`,
        parts: [BK.ex('RS + RX + gm1*RS*RX', ['gm1', 'RS', 'RX'], 'R_{cgd1}', { exact: true, ranges: { RX: [100, 2000] } })],
        sol: md`$R_{cgd1} = R_S + R_X + g_{m1}R_SR_X = (1 + g_{m1}R_X)R_S + R_X$.`,
      }),
      R(md`### Drill: cascodes`),
      G('bk_octc_casc', { need: 3 }),
    ],
  });

  // ================================================================ 13.8 which capacitor, and what to change
  const DOM = { gm: 5e-3, rds: 40e3, RS: 4e3, RL: 10e3, C: { Cgs: 200e-15, Cgd: 25e-15, CL: 300e-15 } };
  const mod = (o, f2) => { const q = JSON.parse(JSON.stringify(o)); f2(q); if (o.rds === INF) q.rds = INF; return q; };
  const DOMw = [mod(DOM, (q) => { q.RS /= 2; }), mod(DOM, (q) => { q.C.CL /= 2; }), mod(DOM, (q) => { q.C.Cgd /= 2; }), mod(DOM, (q) => { q.C.Cgs /= 2; })].map((q) => oc('cs', q).w);
  L({
    id: 'bk13-dominant', title: 'Which capacitor limits the bandwidth, and how to fix it', ref: 'Lecture 29',
    steps: [
      R(md`
        ### The question

        "Which capacitor dominates?" and "what would you change to raise the bandwidth?" are favourite exam questions, and OCTC answers both: the biggest $R_{jo}C_j$ dominates, and a change helps exactly through the time constants it touches.

        ### Size the resistances by eye first

        - **Bridge across an inverting gain** ($C_{gd}$, $C_\mu$ of a CS/CE): $R_{right} + (1 + |A|)R_{left}$. With a gain of 20 to 100 this is usually the biggest time constant, though the capacitor is the smallest.
        - **Output node** ($C_L$): about $R_L$. Big when the gain is big.
        - **Input node** ($C_{gs}$, $C_\pi$ of a grounded-source stage): $R_S$ (or $R_S\parallel r_\pi$). Big only with a big source resistance.
        - **Source or emitter nodes** (CG input, cascode node $X$, follower outputs): about $1/g_m$. Almost never matters.

        ### The fixes, and what each one touches

        | Fix | Shrinks | Cost |
        |---|---|---|
        | lower the source resistance (drive with a follower) | the input $\tau$ **and** the Miller term | an extra stage |
        | cascode | the Miller gain: $C_{gd1}$ sees about $-1$ | headroom |
        | source / emitter degeneration | the transconductance, so the Miller term | gain |
        | smaller $R_L$ | the output $\tau$ and the Miller term | gain |
      `),
      R(md`
        ### Worked example: the running common source

        $\tau_{cgs} = 0.8$, $\tau_{cgd} = 4.3$, $\tau_{CL} = 2.4\,\text{ns}$; $\hat\omega = 1.33\times10^8\,\text{rad/s}$. $C_{gd}$ dominates. Try four changes, one at a time:

        | Change | New $\sum\tau$ | New $\hat\omega$ (rad/s) |
        |---|---|---|
        | halve $R_S$ | $0.4 + 2.25 + 2.4 = 5.05\,\text{ns}$ | $${f(DOMw[0] / 1e8, 3)}\times10^8$ |
        | halve $C_L$ | $0.8 + 4.3 + 1.2 = 6.3\,\text{ns}$ | $${f(DOMw[1] / 1e8, 3)}\times10^8$ |
        | halve $C_{gd}$ | $0.8 + 2.15 + 2.4 = 5.35\,\text{ns}$ | $${f(DOMw[2] / 1e8, 3)}\times10^8$ |
        | halve $C_{gs}$ | $0.4 + 4.3 + 2.4 = 7.1\,\text{ns}$ | $${f(DOMw[3] / 1e8, 3)}\times10^8$ |

        Halving $R_S$ wins: it shrinks the input time constant **and** the Miller term ($R_{cgd} = 8 + 41\times2 = 90\,\text{k}\Omega$). Halving $C_{gs}$ barely helps: it was the smallest time constant.

        ### The gain–bandwidth trade, in one line

        Drive a common source from an ideal source ($R_S = 0$): $\tau_{cgs} = 0$, $\tau_{cgd} = R_LC_{gd}$, $\tau_{CL} = R_LC_L$, so
        $$\hat\omega_{-3dB} = \frac{1}{R_L(C_L + C_{gd})},\qquad |A_v| = g_mR_L\qquad\Rightarrow\qquad|A_v|\,\hat\omega_{-3dB} = \frac{g_m}{C_L + C_{gd}}$$
        The product does not depend on $R_L$: double the gain and you halve the bandwidth. With a source resistance the Miller term makes the trade worse; the cascode is how you beat it.

        !!mistake Common mistakes
          - Attacking the biggest **capacitor** instead of the biggest **time constant**.
          - Expecting a change to help through a time constant it does not touch.
          - Raising $R_L$ for gain and forgetting that it raises two time constants.
      `),
      Q(md`A common source is driven from $R_S = 10\,\text{k}\Omega$, gain 40, and $\tau_{cgd}$ is 80% of $\sum\tau$. Which change does **not** raise the bandwidth?`,
        [md`Doubling $R_L$`, md`Driving the gate from a source follower`, md`Adding a cascode transistor`, md`Adding a little source degeneration`], 0,
        [null, md`A follower makes $R_{left}$ about $1/g_m$: the input $\tau$ and the Miller term both shrink.`, md`The cascode turns the Miller factor from 41 into about 2.`, md`Degeneration divides the gain across $C_{gd}$.`],
        md`Doubling $R_L$ roughly doubles the Miller term and the output $\tau$: the bandwidth drops.`),
      Q(md`Which capacitor usually limits a common-gate stage?`,
        [md`$C_{gd} + C_L$ at the output`, md`$C_{gs}$ at the source`, md`a Miller-multiplied $C_{gd}$`, md`none: a common gate has no limit`], 0,
        [null, md`The source node is about $1/g_m$: tiny.`, md`There is no Miller term in a common gate.`, md`The output node still needs charging.`],
        md`The output node, about $R_L$ with $C_{gd} + C_L$.`),
      P({
        id: 'bk13-dominant-x1', title: 'Pick the best change',
        q: md`For the running common source ($R_S = 4\,\text{k}\Omega$, $g_m = 5\,\text{mS}$, $R_L' = 8\,\text{k}\Omega$, $C_{gs} = 200\,\text{fF}$, $C_{gd} = 25\,\text{fF}$, $C_L = 300\,\text{fF}$), find the estimate after halving $R_S$, and pick the best of the four changes.`,
        parts: [num('\\hat\\omega_{-3dB}\\ (R_S/2)', DOMw[0], 'w'),
          { lbl: 'Best change', mc: ['halve $R_S$', 'halve $C_L$', 'halve $C_{gd}$', 'halve $C_{gs}$'], a: 0, fixed: true, why: [null, `Only $\\tau_{CL}$ shrinks: $${f(DOMw[1] / 1e8, 3)}\\times10^8$.`, `Close, but it only halves $\\tau_{cgd}$: $${f(DOMw[2] / 1e8, 3)}\\times10^8$.`, `The smallest time constant: $${f(DOMw[3] / 1e8, 3)}\\times10^8$.`] }],
        hints: [md`With $R_S = 2\,\text{k}\Omega$: $\tau_{cgs} = 0.4\,\text{ns}$, $R_{cgd} = 8 + 41\times2\,\text{k}\Omega$.`],
        sol: md`Halving $R_S$: $0.4 + 2.25 + 2.4 = 5.05\,\text{ns}$, $${f(DOMw[0] / 1e8, 3)}\times10^8\,\text{rad/s}$, the best, because it touches two time constants.`,
      }),
      P({
        id: 'bk13-dominant-x2', title: 'The gain–bandwidth product',
        q: md`A common source is driven from an ideal source: $g_m = 5\,\text{mS}$, $C_L + C_{gd} = 0.5\,\text{pF}$. Find $|A_v|\hat\omega_{-3dB}$, and the estimate when $R_L = 10\,\text{k}\Omega$.`,
        parts: [num('|A_v|\\hat\\omega', 1e10, 'w'), num('\\hat\\omega_{-3dB}', 2e8, 'w')],
        sol: md`$g_m/(C_L + C_{gd}) = 5\,\text{mS}/0.5\,\text{pF} = 10^{10}\,\text{rad/s}$. With $R_L = 10\,\text{k}\Omega$: gain 50, $\hat\omega = 1/(10\,\text{k}\Omega\times0.5\,\text{pF}) = 2\times10^8\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-dominant-x3', title: 'Where the time goes',
        q: md`For the common emitter of section 13.3 ($\tau_\pi = 5.71$, $\tau_\mu = 45.8$, $\tau_{CL} = 3.85\,\text{ns}$), what fraction of $\sum\tau$ is the Miller capacitor's, and what would the estimate be if $C_\mu$ were halved?`,
        parts: [num('\\tau_\\mu/\\sum\\tau', STG.ce(CE1)[1].R * 0.4e-12 / oc('ce', CE1).sum, 'x'), num('\\hat\\omega_{-3dB}', oc('ce', mod(CE1, (q) => { q.C.Cmu /= 2; })).w, 'w')],
        sol: md`$45.8/55.3 = 0.83$. Halving $C_\mu$: $5.71 + 22.9 + 3.85 = 32.5\,\text{ns}$, $\hat\omega = 3.08\times10^7\,\text{rad/s}$, 1.7 times better.`,
      }),
      R(md`### Drill: which one dominates, and what to change`),
      G('bk_octc_dom', { need: 4 }),
    ],
  });

  // ================================================================ 13.9 chapter problems
  const X6 = { gm: 1e-3, rds: 100e3, RS: 10e3, RL: 25e3, C: { Cgs: 0.3e-12, Cgd: 30e-15, CL: 0.4e-12 } };
  const X7 = { gm: 20e-3, rpi: 5e3, ro: 100e3, RS: 2e3, RL: 10e3, C: { Cpi: 6e-12, Cmu: 0.3e-12, CL: 2e-12 } };
  const X8 = { gm: 4e-3, RG: 10e3, RS: 500, RL: 15e3, C: { Cgs: 0.4e-12, Cgd: 40e-15, CL: 0.3e-12 } };
  const X8n = Object.assign({}, X8, { RS: 0 });
  const X9 = { gm: 2e-3, rds: 100e3, RS: 500, RL: 20e3, C: { Cgs: 0.5e-12, Cgd: 50e-15, CL: 0.5e-12 } };
  const X10 = { gm: 20e-3, rpi: 5e3, RS: 100, RL: 5e3, C: { Cpi: 5e-12, Cmu: 0.5e-12, CL: 1e-12 } };
  const X11 = { gm: 2e-3, RS: 20e3, RL: 5e3, C: { Cgs: 0.4e-12, Cgd: 40e-15, CL: 2e-12 } };
  const X12 = { gm: 20e-3, rpi: 5e3, RS: 10e3, RL: 2e3, C: { Cpi: 5e-12, Cmu: 0.5e-12, CL: 10e-12 } };
  const X13c = { gm1: 2e-3, gm2: 2e-3, rds1: 100e3, rds2: 100e3, RS: 50e3, RL: 50e3, C: { Cgs1: 0.2e-12, Cgd1: 20e-15, Cgs2: 0.2e-12, Cgd2: 20e-15, CL: 0.2e-12 } };
  const X13s = { gm: 2e-3, rds: 100e3, RS: 50e3, RL: 50e3, C: { Cgs: 0.2e-12, Cgd: 20e-15, CL: 0.2e-12 } };
  const X14 = { gm1: 20e-3, gm2: 20e-3, rpi1: 5e3, rpi2: 5e3, RS: 2e3, RL: 10e3, C: { Cpi1: 5e-12, Cmu1: 0.3e-12, Cpi2: 5e-12, Cmu2: 0.3e-12, CL: 1e-12 } };
  const o6 = oc('cs', X6), o7 = oc('ce', X7), o8 = oc('csdeg', X8), o8n = oc('csdeg', X8n), o9 = oc('cg', X9), o10 = oc('cb', X10), o11 = oc('sf', X11), o12 = oc('ef', X12);
  const o13c = oc('casc', X13c), o13s = oc('cs', X13s), o14 = oc('bjtcasc', X14);
  const ch6 = [mod(X6, (q) => { q.RS /= 2; }), mod(X6, (q) => { q.C.CL /= 2; }), mod(X6, (q) => { q.C.Cgd /= 2; }), mod(X6, (q) => { q.C.Cgs /= 2; })].map((q) => oc('cs', q).w);
  L({
    id: 'bk13-problems', title: 'Chapter 13 problems', kind: 'review', ref: 'Lecture 29',
    steps: [
      RF(md`
        ### Chapter 13 in one page

        **Why** ([13.1](#/l/bk13-why)): for an all-pole response $D(s) = \dots + b_1s + 1$ with $b_1 = \sum\tau_i$; keeping only $b_1s + 1$ gives $\hat\omega_{-3dB} = 1/b_1$. For real poles $|D(j\hat\omega)|^2\le2$, so the estimate is never high, and at worst (two equal poles) $0.5/\tau$ against the true $0.644/\tau$. And $b_1 = \sum R_{jo}C_j$ exactly, because $b_1$ is linear in each capacitance.

        **The recipe** ([13.2](#/l/bk13-recipe)): zero the input, remove the other capacitors, find the resistance across each one; $\hat\omega_{-3dB} = 1/\sum R_{jo}C_j$. Three pictures: a node to ground ($R_{UP}\parallel R_{DN}$); an inverting bridge, $R_{left} + R_{right} + G_mR_{left}R_{right}$; a follower bridge, $\tfrac{R_{gate} + R_{source}}{1 + g_mR_{source}}$.

        [[fig:b]]

        | Stage | Input-side capacitor | Bridge | Output |
        |---|---|---|---|
        | CS ([13.3](#/l/bk13-cs)) | $C_{gs}$: $R_S$ | $C_{gd}$: $R_S + R_L' + g_mR_SR_L'$ | $C_L$: $R_L' = R_L\parallel r_{ds}$ |
        | CE | $C_\pi$: $R_S\parallel r_\pi$ | $C_\mu$: $(R_S\parallel r_\pi) + R_L' + g_m(R_S\parallel r_\pi)R_L'$ | $R_L\parallel r_o$ |
        | degenerated CS ([13.4](#/l/bk13-deg)) | $C_{gs}$: $\tfrac{R_G + R_S}{1 + g_mR_S}$ | $C_{gd}$: $(R_L\parallel R_x)\big[1 + \tfrac{g_mR_G}{1 + g_mR_S}\big] + R_G$ | $R_L\parallel R_x$ |
        | CG ([13.5](#/l/bk13-cgcb)) | $C_{gs}$: $R_S\parallel\tfrac{1}{g_m}(1 + \tfrac{R_L}{r_{ds}})$ | none | $C_{gd} + C_L$: $R_L\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$ |
        | source follower ([13.6](#/l/bk13-follow)) | $C_{gd}$: $R_S$ | $C_{gs}$: $\tfrac{R_S + R_L}{1 + g_mR_L}$ | $C_L$: $R_L\parallel\tfrac{1}{g_m}$ |
        | cascode ([13.7](#/l/bk13-cascode)) | $C_{gs1}$: $R_S$; $C_{gs2}$: $R_X$ | $C_{gd1}$: $R_S + R_X + g_{m1}R_SR_X$ | $C_{gd2} + C_L$: $R_{out}$ |

        **Which one** ([13.8](#/l/bk13-dominant)): attack the biggest $R_{jo}C_j$, and prefer a change that touches several.
      `, { b: { fig: T.bridge({ test: true }), cap: 'The bridge rule\'s test-current picture.' } }),
      P({
        id: 'bk13-pr-x1', title: 'Estimate and truth',
        q: md`Poles at $100$ and $300\,\text{Mrad/s}$. Find the estimate and the true bandwidth.`,
        parts: [num('\\hat\\omega_{-3dB}', 1 / (1e-8 + 1 / 3e8), 'w'), num('\\omega_{-3dB}', twoPole(1e-8, 1 / 3e8), 'w')],
        sol: md`$\sum\tau = 10 + 3.33 = 13.33\,\text{ns}$, $\hat\omega = 7.5\times10^7$. Exact: $${f(twoPole(1e-8, 1 / 3e8) / 1e7, 4)}\times10^7\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-pr-x2', title: 'From a denominator',
        q: md`$D(s) = 6\times10^{-18}s^2 + 7\times10^{-9}s + 1$. Find the estimate, the two poles, and the true bandwidth.`,
        parts: [num('\\hat\\omega_{-3dB}', 1 / 7e-9, 'w'), num('\\omega_{p1}', 1 / 6e-9, 'w'), num('\\omega_{p2}', 1e9, 'w'), num('\\omega_{-3dB}', twoPole(6e-9, 1e-9), 'w')],
        hints: [md`$\sqrt{b_1^2 - 4b_2} = \sqrt{49 - 24}\times10^{-9}$.`],
        sol: md`$\hat\omega = 1/7\,\text{ns} = 1.43\times10^8$. Roots: $(7\mp5)\times10^{-9}/(1.2\times10^{-17})$: $1.67\times10^8$ and $10^9\,\text{rad/s}$. True bandwidth $${f(twoPole(6e-9, 1e-9) / 1e8, 4)}\times10^8$.`,
      }),
      P({
        id: 'bk13-pr-x3', title: 'A bridge',
        q: md`$R_{left} = 5\,\text{k}\Omega$, $R_{right} = 20\,\text{k}\Omega$, $G_m = 2\,\text{mS}$. What does the bridging capacitor see?`,
        fig: T.bridgeC(),
        parts: [BK.res('R', 225e3, undefined, [{ v: 25e3, msg: 'Add $G_mR_{left}R_{right}$.' }])],
        sol: md`$5 + 20 + 2\,\text{mS}\times5\times20\,\text{k}\Omega = 225\,\text{k}\Omega$.`,
      }),
      P({
        id: 'bk13-pr-x4', title: 'A follower bridge',
        q: md`Gate: $50\,\text{k}\Omega$ to ground; source: $2\,\text{k}\Omega$ to ground; $g_m = 4\,\text{mS}$, $r_{ds}$ ignored. What does $C_{gs}$ see?`,
        fig: T.follow({ rg: 'R_G', rs: 'R_S' }),
        parts: [BK.res('R_{cgs}', 52e3 / 9, undefined, [{ v: 52e3, msg: 'Divide by $1 + g_mR_S = 9$.' }])],
        sol: md`$\dfrac{50 + 2}{1 + 8} = 5.78\,\text{k}\Omega$.`,
      }),
      P({
        id: 'bk13-pr-x5', title: 'A base node',
        q: md`Common emitter: $I_C = 0.5\,\text{mA}$, $\beta = 150$, $R_S = 5\,\text{k}\Omega$. What does $C_\pi$ see?`,
        parts: [BK.res('R_\\pi', 3e3, undefined, [{ v: 5e3, msg: 'Add $r_\\pi = 7.5\\,\\text{k}\\Omega$ in parallel.' }])],
        sol: md`$r_\pi = 150/20\,\text{mS} = 7.5\,\text{k}\Omega$; $5\parallel7.5 = 3\,\text{k}\Omega$.`,
      }),
      P({
        id: 'bk13-pr-x6', title: 'Exam style: a common source from its bias',
        big: true,
        q: md`An NMOS with $W/L = 50$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\lambda = 0.1\,\text{V}^{-1}$) runs at $V_{ov} = 0.2\,\text{V}$ in a common source with $R_L = 25\,\text{k}\Omega$, driven from $R_S = 10\,\text{k}\Omega$. $C_{gs} = 0.3\,\text{pF}$, $C_{gd} = 30\,\text{fF}$, $C_L = 0.4\,\text{pF}$.
(a) $I_D$, $g_m$, $r_{ds}$; (b) the gain; (c) the three open-circuit resistances; (d) $\sum\tau$ and the bandwidth in Hz.`,
        fig: F.cs({ v: { RS: '10\\kO', RL: '25\\kO', Cgs: '0.3\\,\\text{pF}', Cgd: '30\\,\\text{fF}', CL: '0.4\\,\\text{pF}' } }),
        parts: [{ lbl: 'I_D', unit: 'µA', ans: 100 }, num('g_m', 1e-3, 'g'), BK.res('r_{ds}', 100e3), num('A_v', -20, 'x', [{ v: -25, msg: 'Use $R_L\\parallel r_{ds}$.' }]),
          BK.res('R_{cgs}', 10e3), BK.res('R_{cgd}', STG.cs(X6)[1].R, undefined, [{ v: 30e3, msg: 'Add the Miller term $g_mR_SR_L\'$.' }]), BK.res('R_{CL}', 20e3),
          num('\\sum\\tau', o6.sum, 't'), num('\\hat f_{-3dB}', o6.w / (2 * Math.PI), 'f', [{ v: o6.w, msg: 'That is in rad/s.' }])],
        hints: [md`$I_D = \tfrac12\mu_nC_{ox}\tfrac WLV_{ov}^2$, $g_m = 2I_D/V_{ov}$, $r_{ds} = 1/(\lambda I_D)$.`, md`$R_L' = 25\parallel100 = 20\,\text{k}\Omega$.`],
        sol: md`**(a)** $I_D = \tfrac12(100\,\mu)(50)(0.04) = 100\,\mu\text{A}$; $g_m = 1\,\text{mS}$; $r_{ds} = 1/(0.1\times100\,\mu) = 100\,\text{k}\Omega$.

**(b)** $R_L' = 20\,\text{k}\Omega$, $A_v = -g_mR_L' = -20$.

**(c)** $R_{cgs} = 10\,\text{k}\Omega$ ($3\,\text{ns}$); $R_{cgd} = 10 + 20 + 1\,\text{mS}\times10\times20\,\text{k}\Omega = 230\,\text{k}\Omega$ ($6.9\,\text{ns}$); $R_{CL} = 20\,\text{k}\Omega$ ($8\,\text{ns}$).

**(d)** $\sum\tau = 17.9\,\text{ns}$, $\hat\omega = 5.59\times10^7\,\text{rad/s}$, $\hat f = 8.89\,\text{MHz}$. Here the output node is the biggest single time constant.`,
      }),
      P({
        id: 'bk13-pr-x7', title: 'Exam style: a common emitter with $r_o$',
        big: true,
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$, $V_A = 50\,\text{V}$; $R_S = 2\,\text{k}\Omega$, $R_L = 10\,\text{k}\Omega$; $C_\pi = 6\,\text{pF}$, $C_\mu = 0.3\,\text{pF}$, $C_L = 2\,\text{pF}$. Find $g_m$, $r_\pi$, $r_o$, the three resistances and the estimate.`,
        fig: F.ce({ v: { RS: '2\\kO', RL: '10\\kO', Cpi: '6\\,\\text{pF}', Cmu: '0.3\\,\\text{pF}', CL: '2\\,\\text{pF}' } }),
        parts: [num('g_m', 20e-3, 'g'), BK.res('r_\\pi', 5e3), BK.res('r_o', 100e3), BK.res('R_\\pi', STG.ce(X7)[0].R), BK.res('R_\\mu', STG.ce(X7)[1].R, undefined, [{ v: 2e3 + 10e3 + 20e-3 * 2e3 * 10e3, msg: 'Use $R_S\\parallel r_\\pi$ and $R_L\\parallel r_o$.' }]),
          BK.res('R_{CL}', STG.ce(X7)[2].R), num('\\hat\\omega_{-3dB}', o7.w, 'w')],
        hints: [md`$r_o = V_A/I_C$.`],
        sol: md`$g_m = 20\,\text{mS}$, $r_\pi = 5\,\text{k}\Omega$, $r_o = 100\,\text{k}\Omega$. $R_\pi = 2\parallel5 = 1.43\,\text{k}\Omega$ ($8.57\,\text{ns}$); $R_L' = 10\parallel100 = 9.09\,\text{k}\Omega$; $R_\mu = 1.43 + 9.09 + 20\,\text{mS}\times1.43\times9.09\,\text{k}\Omega = 270\,\text{k}\Omega$ ($81.1\,\text{ns}$); $R_{CL} = 9.09\,\text{k}\Omega$ ($18.2\,\text{ns}$). $\sum\tau = 107.8\,\text{ns}$, $\hat\omega = 9.27\times10^6\,\text{rad/s}$ ($1.48\,\text{MHz}$).`,
      }),
      P({
        id: 'bk13-pr-x8', title: 'Exam style: degeneration as a design choice',
        big: true,
        q: md`$g_m = 4\,\text{mS}$, $R_G = 10\,\text{k}\Omega$, $R_L = 15\,\text{k}\Omega$, $r_{ds}$ ignored; $C_{gs} = 0.4\,\text{pF}$, $C_{gd} = 40\,\text{fF}$, $C_L = 0.3\,\text{pF}$. Compare $R_S = 500\,\Omega$ with $R_S = 0$: resistances, estimates and gains.`,
        fig: F.csdeg({ v: { RG: '10\\kO', RS: '500\\,\\Omega', RL: '15\\kO', Cgs: '0.4\\,\\text{pF}', Cgd: '40\\,\\text{fF}', CL: '0.3\\,\\text{pF}' } }),
        parts: [BK.res('R_{cgs}', STG.csdeg(X8)[0].R), BK.res('R_{cgd}', STG.csdeg(X8)[1].R), num('\\hat\\omega_{-3dB}', o8.w, 'w'), num('A_v', -20, 'x'),
          num('\\hat\\omega_{-3dB}\\ (R_S = 0)', o8n.w, 'w'), num('A_v\\ (R_S = 0)', -60, 'x')],
        hints: [md`$1 + g_mR_S = 3$; $g_{m,eff} = 1.33\,\text{mS}$.`],
        sol: md`**With $R_S$:** $R_{cgs} = 10.5/3 = 3.5\,\text{k}\Omega$ ($1.4\,\text{ns}$); $R_{cgd} = 10 + 15 + 1.33\,\text{mS}\times10\times15\,\text{k}\Omega = 225\,\text{k}\Omega$ ($9\,\text{ns}$); $\tau_{CL} = 4.5\,\text{ns}$; $\sum\tau = 14.9\,\text{ns}$, $\hat\omega = 6.71\times10^7$; gain $-60/3 = -20$.

**Without:** $10\,\text{k}\Omega$ ($4\,\text{ns}$), $625\,\text{k}\Omega$ ($25\,\text{ns}$), $4.5\,\text{ns}$: $33.5\,\text{ns}$, $2.99\times10^7$; gain $-60$. One third of the gain for 2.2 times the bandwidth.`,
      }),
      P({
        id: 'bk13-pr-x9', title: 'A common gate with $r_{ds}$',
        q: md`$g_m = 2\,\text{mS}$, $r_{ds} = 100\,\text{k}\Omega$, $R_S = 500\,\Omega$, $R_L = 20\,\text{k}\Omega$; $C_{gs} = 0.5\,\text{pF}$, $C_{gd} = 50\,\text{fF}$, $C_L = 0.5\,\text{pF}$. Find $R_{cgs}$, $R_{CL'}$ and the estimate.`,
        fig: F.cg({ v: { RS: '500\\,\\Omega', RL: '20\\kO', Cgs: '0.5\\,\\text{pF}', Cgd: '50\\,\\text{fF}', CL: '0.5\\,\\text{pF}' } }),
        parts: [BK.res('R_{cgs}', STG.cg(X9)[0].R, 1 / (1 / 500 + 1 / (500 * 1.2))), BK.res("R_{CL'}", STG.cg(X9)[1].R), num('\\hat\\omega_{-3dB}', o9.w, 'w')],
        sol: md`Up: $120\,\text{k}\Omega/201 = 597\,\Omega$; $R_{cgs} = 500\parallel597 = 272\,\Omega$. Down: $100 + 0.5 + 100 = 200.5\,\text{k}\Omega$; $R_{CL'} = 20\parallel200.5 = 18.2\,\text{k}\Omega$. $\sum\tau = 0.136 + 0.55\times18.2 = 10.1\,\text{ns}$, $\hat\omega = 9.86\times10^7\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-pr-x10', title: 'A common base',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$, $r_o\to\infty$; $R_S = 100\,\Omega$, $R_L = 5\,\text{k}\Omega$; $C_\pi = 5\,\text{pF}$, $C_\mu = 0.5\,\text{pF}$, $C_L = 1\,\text{pF}$. Find $R_\pi$ and the estimate.`,
        fig: F.cb({ v: { RS: '100\\,\\Omega', RL: '5\\kO', Cpi: '5\\,\\text{pF}', Cmu: '0.5\\,\\text{pF}', CL: '1\\,\\text{pF}' } }),
        parts: [BK.res('R_\\pi', STG.cb(X10)[0].R), num('\\hat\\omega_{-3dB}', o10.w, 'w')],
        sol: md`$r_\pi/(\beta + 1) = 5000/101 = 49.5\,\Omega$; $R_\pi = 100\parallel49.5 = 33.1\,\Omega$ ($0.17\,\text{ns}$). Output: $5\,\text{k}\Omega\times1.5\,\text{pF} = 7.5\,\text{ns}$. $\hat\omega = 1/7.67\,\text{ns} = 1.30\times10^8\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-pr-x11', title: 'A source follower',
        q: md`$g_m = 2\,\text{mS}$, $R_S = 20\,\text{k}\Omega$, $R_L = 5\,\text{k}\Omega$, $r_{ds}$ ignored; $C_{gs} = 0.4\,\text{pF}$, $C_{gd} = 40\,\text{fF}$, $C_L = 2\,\text{pF}$. Find $R_{cgs}$, $R_{CL}$ and the estimate.`,
        fig: F.sf({ v: { RS: '20\\kO', RL: '5\\kO', Cgs: '0.4\\,\\text{pF}', Cgd: '40\\,\\text{fF}', CL: '2\\,\\text{pF}' } }),
        parts: [BK.res('R_{cgs}', STG.sf(X11)[0].R), BK.res('R_{CL}', STG.sf(X11)[2].R), num('\\hat\\omega_{-3dB}', o11.w, 'w')],
        sol: md`$R_{cgs} = 25/11 = 2.27\,\text{k}\Omega$ ($0.91\,\text{ns}$); $R_{cgd} = 20\,\text{k}\Omega$ ($0.8\,\text{ns}$); $R_{CL} = 5\,\text{k}\Omega\parallel500\,\Omega = 455\,\Omega$ ($0.91\,\text{ns}$). $\sum\tau = 2.62\,\text{ns}$, $\hat\omega = 3.82\times10^8\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-pr-x12', title: 'An emitter follower driving a big load',
        q: md`$I_C = 0.5\,\text{mA}$, $\beta = 100$; $R_S = 10\,\text{k}\Omega$, $R_L = 2\,\text{k}\Omega$; $C_\pi = 5\,\text{pF}$, $C_\mu = 0.5\,\text{pF}$, $C_L = 10\,\text{pF}$. Find the three resistances and the estimate.`,
        fig: F.ef({ v: { RS: '10\\kO', RL: '2\\kO', Cpi: '5\\,\\text{pF}', Cmu: '0.5\\,\\text{pF}', CL: '10\\,\\text{pF}' } }),
        parts: [BK.res('R_\\mu', STG.ef(X12)[1].R), BK.res('R_\\pi', STG.ef(X12)[0].R), BK.res('R_{CL}', STG.ef(X12)[2].R), num('\\hat\\omega_{-3dB}', o12.w, 'w')],
        sol: md`$r_\pi = 5\,\text{k}\Omega$. $R_\mu = 10\parallel(5 + 202) = 9.54\,\text{k}\Omega$ ($4.77\,\text{ns}$); $R_\pi = 5\,\text{k}\Omega\parallel\tfrac{12\,\text{k}\Omega}{41} = 277\,\Omega$ ($1.38\,\text{ns}$); $R_{CL} = 2\,\text{k}\Omega\parallel\tfrac{15\,\text{k}\Omega}{101} = 138\,\Omega$ ($1.38\,\text{ns}$). $\sum\tau = 7.54\,\text{ns}$, $\hat\omega = 1.33\times10^8\,\text{rad/s}$: the $10\,\text{pF}$ load costs little, because it sits on $138\,\Omega$.`,
      }),
      P({
        id: 'bk13-pr-x13', title: 'Exam style: cascode against common source',
        big: true,
        q: md`Identical NMOS: $g_m = 2\,\text{mS}$, $r_{ds} = 100\,\text{k}\Omega$, $C_{gs} = 0.2\,\text{pF}$, $C_{gd} = 20\,\text{fF}$. $R_S = 50\,\text{k}\Omega$, $R_L = 50\,\text{k}\Omega$, $C_L = 0.2\,\text{pF}$. (a) Common source: $R_{cgd}$ and the estimate. (b) Cascode: $R_X$, $R_{cgd1}$, $R_{out}$ and the estimate. (c) The ratio of the two estimates.`,
        fig: F.casc({ v: { RS: '50\\kO', RL: '50\\kO' } }),
        parts: [BK.res('R_{cgd}\\ \\text{(CS)}', STG.cs(X13s)[1].R), num('\\hat\\omega\\ \\text{(CS)}', o13s.w, 'w'), BK.res('R_X', STG.casc(X13c)[2].R),
          BK.res('R_{cgd1}', STG.casc(X13c)[1].R), BK.res('R_{out}', STG.casc(X13c)[3].R), num('\\hat\\omega\\ \\text{(cascode)}', o13c.w, 'w'), num('\\text{ratio}', o13c.w / o13s.w, 'x')],
        hints: [md`CS: $R_L' = 50\parallel100 = 33.3\,\text{k}\Omega$.`, md`Cascode: $R_X = r_{ds}\parallel\tfrac{r_{ds} + R_L}{1 + g_mr_{ds}}$.`],
        sol: md`**(a)** $R_L' = 33.3\,\text{k}\Omega$; $R_{cgd} = 50 + 33.3 + 2\,\text{mS}\times50\times33.3\,\text{k}\Omega = 3.42\,\text{M}\Omega$ ($68.3\,\text{ns}$); $\tau_{cgs} = 10$, $\tau_{CL} = 6.67\,\text{ns}$; $\sum\tau = 85.0\,\text{ns}$, $\hat\omega = 1.18\times10^7$.

**(b)** $R_X = 100\,\text{k}\Omega\parallel\tfrac{150\,\text{k}\Omega}{201} = 741\,\Omega$; $R_{cgd1} = 50 + 0.74 + 2\,\text{mS}\times50\,\text{k}\Omega\times741\,\Omega = 124.8\,\text{k}\Omega$ ($2.5\,\text{ns}$); $R_{out} = 50\,\text{k}\Omega\parallel20.2\,\text{M}\Omega = 49.9\,\text{k}\Omega$, with $0.22\,\text{pF}$: $11.0\,\text{ns}$; $\tau_{cgs1} = 10$, $\tau_{cgs2} = 0.15\,\text{ns}$. $\sum\tau = 23.6\,\text{ns}$, $\hat\omega = 4.23\times10^7$.

**(c)** $${f(o13c.w / o13s.w, 3)}$ times, with more gain ($-99.8$ against $-66.7$).`,
      }),
      P({
        id: 'bk13-pr-x14', title: 'A BJT cascode',
        q: md`Both at $I_C = 0.5\,\text{mA}$, $\beta = 100$, $r_o\to\infty$; $R_S = 2\,\text{k}\Omega$, $R_L = 10\,\text{k}\Omega$; $C_\pi = 5\,\text{pF}$, $C_\mu = 0.3\,\text{pF}$, $C_L = 1\,\text{pF}$. Find the estimate.`,
        fig: F.bjtcasc({ v: { RS: '2\\kO', RL: '10\\kO' } }),
        parts: [num('\\hat\\omega_{-3dB}', o14.w, 'w')],
        hints: [md`$R_{\pi1} = 2\parallel5\,\text{k}\Omega$; $R_X = 5000/101\,\Omega$.`],
        sol: md`$R_{\pi1} = 1.43\,\text{k}\Omega$ ($7.14\,\text{ns}$); $R_X = 49.5\,\Omega$ ($C_{\pi2}$: $0.25\,\text{ns}$); $R_{\mu1} = 1429 + 49.5 + 20\,\text{mS}\times1429\times49.5 = 2.89\,\text{k}\Omega$ ($0.87\,\text{ns}$); output $10\,\text{k}\Omega\times1.3\,\text{pF} = 13\,\text{ns}$. $\sum\tau = 21.3\,\text{ns}$, $\hat\omega = 4.70\times10^7\,\text{rad/s}$.`,
      }),
      P({
        id: 'bk13-pr-x15', title: 'The degenerated output, symbolically',
        q: md`Degenerated common source with $r_{ds}$ kept: write the resistance $C_L$ sees.`,
        parts: [BK.ex('RL*(rds + RS + gm*rds*RS)/(RL + rds + RS + gm*rds*RS)', ['gm', 'rds', 'RS', 'RL'], 'R_{CL}', { exact: true })],
        sol: md`$R_L\parallel R_x$ with $R_x = r_{ds} + R_S + g_mr_{ds}R_S$.`,
      }),
      P({
        id: 'bk13-pr-x16', title: 'Which one, and what to change',
        q: md`For the common source of problem 6 ($\tau_{cgs} = 3$, $\tau_{cgd} = 6.9$, $\tau_{CL} = 8\,\text{ns}$), which capacitor dominates, and which single change (halving $R_S$, $C_L$, $C_{gd}$ or $C_{gs}$) raises the estimate most?`,
        parts: [{ lbl: 'Dominant', mc: ['$C_L$', '$C_{gd}$', '$C_{gs}$'], a: 0, fixed: true, why: [null, '$6.9\\,\\text{ns}$, second.', '$3\\,\\text{ns}$, smallest.'] },
          { lbl: 'Best change', mc: ['halve $R_S$', 'halve $C_L$', 'halve $C_{gd}$', 'halve $C_{gs}$'], a: 0, fixed: true,
            why: [null, `It only touches $\\tau_{CL}$: $${f(ch6[1] / 1e7, 3)}\\times10^7$.`, `$${f(ch6[2] / 1e7, 3)}\\times10^7$.`, `$${f(ch6[3] / 1e7, 3)}\\times10^7$.`] },
          num('\\hat\\omega\\ \\text{after the best change}', ch6[0], 'w')],
        sol: md`$C_L$ has the biggest time constant, but halving $R_S$ wins: $\tau_{cgs}\to1.5$ and $R_{cgd}\to5 + 20 + 100 = 125\,\text{k}\Omega$ ($3.75\,\text{ns}$), so $\sum\tau = 13.25\,\text{ns}$ and $\hat\omega = ${f(ch6[0] / 1e7, 3)}\times10^7$, against $${f(ch6[1] / 1e7, 3)}\times10^7$ for halving $C_L$. A change that touches two time constants can beat one aimed at the biggest.`,
      }),
      P({
        id: 'bk13-pr-x17', title: 'Name the picture',
        q: md`Which picture is each capacitor?`,
        parts: [{ lbl: '$C_{gs}$ of a source follower', mc: ['follower bridge', 'node to ground', 'inverting bridge'], a: 0, fixed: true, why: [null, 'Both ends move: gate and source.', 'The source follows; it does not invert.'] },
          { lbl: '$C_{gd}$ of a common gate', mc: ['node to ground', 'inverting bridge', 'follower bridge'], a: 0, fixed: true, why: [null, 'The gate is held: one end is ground.', 'The gate is held.'] },
          { lbl: '$C_\\mu$ of a common emitter', mc: ['inverting bridge', 'node to ground', 'follower bridge'], a: 0, fixed: true, why: [null, 'Base and collector both move.', 'The collector inverts.'] }],
        sol: md`Follower bridge; node to ground (output to the held gate); inverting bridge.`,
      }),
      P({
        id: 'bk13-pr-x18', title: 'The gain–bandwidth product',
        q: md`A common source driven from an ideal source: $g_m = 2\,\text{mS}$, $C_L + C_{gd} = 0.4\,\text{pF}$. Find $|A_v|\hat\omega_{-3dB}$, and $R_L$ for a bandwidth of $10^8\,\text{rad/s}$.`,
        parts: [num('|A_v|\\hat\\omega', 5e9, 'w'), BK.res('R_L', 25e3)],
        sol: md`$g_m/(C_L + C_{gd}) = 5\times10^9\,\text{rad/s}$. $\hat\omega = 1/(R_L\times0.4\,\text{pF}) = 10^8$ gives $R_L = 25\,\text{k}\Omega$ (gain 50).`,
      }),
      R(md`### Mixed drill: every Chapter 13 skill`),
      G('bk_octc_cs', { need: 8, pool: ['bk_octc_est', 'bk_bridge', 'bk_octc_which', 'bk_octc_cs', 'bk_octc_deg', 'bk_octc_cg', 'bk_octc_follow', 'bk_octc_casc', 'bk_octc_dom'] }),
    ],
  });

})();

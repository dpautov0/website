/* lectures.js — Exam 1 material from the lectures and handouts that the units didn't cover yet
   (triode DC solving, the Lecture 8–9 and Handout 3 worked examples, a Newton step, the 5% rule,
   nonlinear two-ports, three Handout 1 facts), original problems in the exam style, and the random
   question bank. Exam 1 scope (Canvas): HW 1–3, up to MOSFET DC analysis. Loaded last, before engine.js. */
(function () {
  const { R, P, G } = C;
  const X = window.EXAM;
  const f = U.fmt;
  const unit = (id) => COURSE.units.find((u) => u.id === id);
  const lesson = (uid, lid) => unit(uid).lessons.find((l) => l.id === lid);
  const insertAfter = (uid, afterId, ...ls) => {
    const u = unit(uid);
    u.lessons.splice(u.lessons.findIndex((l) => l.id === afterId) + 1, 0, ...ls);
  };
  const nodeOut = (x, y, n) => [['w', [x, y], [x + 1, y]], ['term', [x + 1, y], { n }]];

  // ================================================================ Unit 1: three Handout 1 facts
  lesson('u1', 'u1-linear').steps.push(P({
    q: md`Handout 1 classifies an **ideal independent voltage source** ($v = V_0$ for any current) as...`,
    parts: [{ mc: ['nonlinear: $f(i) = V_0$ fails scaling, since $f(0) = V_0 \\neq 0$', 'linear: it is an ideal element', 'linear only when $V_0 > 0$', 'neither: sources aren\'t circuit elements'], a: 0, why: [null, 'Ideal doesn\'t mean linear. Double the current and the voltage stays $V_0$.', 'The sign of $V_0$ doesn\'t help: $f(0) \\neq 0$ either way.', 'Handout 1 treats sources as (nonlinear) components.'] }],
    sol: md`Nonlinear. Its $i$–$v$ law is a constant, which fails scaling ($f(2i) = V_0 \neq 2V_0$). Same for an independent current source. That's exactly why a circuit with internal independent sources is **affine**, not linear, in its input, and why you switch independent sources off for $\RTH$.`,
  }));

  lesson('u1', 'u1-thevenin').steps.push(P({
    q: md`**Substitution theorem** (Handout 1). A branch of a network has $6\,\text{V}$ across it and carries $1\,\text{A}$. Which replacement would **change** the rest of the circuit's voltages and currents?`,
    parts: [{ mc: ['a $3\\,\\Omega$ resistor', 'an ideal $6\\,\\text{V}$ source (same polarity)', 'an ideal $1\\,\\text{A}$ source (same direction)', 'a $6\\,\\Omega$ resistor'], a: 0, why: [null, 'It keeps $6\\,\\text{V}$ across the branch, and the network then forces the same $1\\,\\text{A}$.', 'It keeps $1\\,\\text{A}$, and the network then produces the same $6\\,\\text{V}$.', '$6\\,\\text{V}/6\\,\\Omega = 1\\,\\text{A}$: same voltage and current.'] }],
    sol: md`Any branch with the same terminal voltage **and** current can be swapped in: a $6\,\text{V}$ source, a $1\,\text{A}$ source, or a $6\,\Omega$ resistor. A $3\,\Omega$ resistor can't have $6\,\text{V}$ and $1\,\text{A}$ at once. The theorem proves Thévenin's theorem (replace the load by a current source $I_L$, then superpose); it isn't a solving method on its own.`,
  }));

  lesson('u1', 'u1-twoport').steps.push(P({
    q: md`When does a pair of terminals $(a, b)$ qualify as a **port**?`,
    parts: [{ mc: ['When the current entering $a$ equals the current leaving $b$ (set by the external connections)', 'Whenever the two terminals belong to the same network', 'When the voltage between them is fixed', 'Only when a source is connected across them'], a: 0, why: [null, 'Attach an extra current source from $a$ to some other terminal and the currents stop matching.', 'The port condition is about current, not voltage.', 'Any external circuit works, as long as the currents are equal and opposite.'] }],
    sol: md`The **port condition**: equal and opposite currents at the two terminals. It depends on how the outside circuit is connected, not on the network's insides. Every two-terminal element is automatically a one-port (KCL).`,
  }));

  // ================================================================ Unit 2: nonlinear two-ports (handwritten Handout 2)
  const yv = { a1: [0.1, 5], a2: [0.1, 5], b2: [0.1, 5] }, yd = { a1: '\\alpha_1', a2: '\\alpha_2', b2: '\\beta_2' };
  lesson('u2', 'u2-nlsrc').steps.push(
    R(md`
      **Nonlinear two-ports** (handwritten Handout 2). If $i_1 = f(v_1, v_2)$ and $i_2 = g(v_1, v_2)$, linearising gives an **incremental y-matrix** of partial derivatives at the operating point:
      $$y_{11} = \frac{\partial f}{\partial v_1},\quad y_{12} = \frac{\partial f}{\partial v_2},\quad y_{21} = \frac{\partial g}{\partial v_1},\quad y_{22} = \frac{\partial g}{\partial v_2}\qquad(\text{all at } Q)$$
      The model: $1/y_{11}$ in parallel with a $y_{12}v_2$ source at the input, and a $y_{21}v_1$ source in parallel with $1/y_{22}$ at the output. It's the two-input version of "differentiate at $Q$".
    `),
    P({
      q: md`A nonlinear two-port obeys $i_{IN} = \alpha_1v_{IN}^2 + \beta_1$ and $i_{OUT} = \alpha_2v_{IN}^2 + \beta_2v_{OUT}^2$. It's biased at $V_{IN} = 1\,\text{V}$, $V_{OUT} = 2\,\text{V}$. Find the incremental y-parameters (type <code>a1</code>, <code>a2</code>, <code>b2</code> for $\alpha_1$, $\alpha_2$, $\beta_2$).`,
      parts: [
        { lbl: 'y_{11}', expr: '2*a1', vars: yv, disp: yd },
        { lbl: 'y_{12}', mc: ['$0$', '$\\beta_1$', '$2\\alpha_1$', '$\\alpha_1 + \\beta_1$'], a: 0, why: [null, '$\\beta_1$ is a constant: its derivative is zero.', 'That\'s $y_{11}$.', '$i_{IN}$ doesn\'t depend on $v_{OUT}$ at all.'] },
        { lbl: 'y_{21}', expr: '2*a2', vars: yv, disp: yd },
        { lbl: 'y_{22}', expr: '4*b2', vars: yv, disp: yd },
      ],
      hints: [md`$y_{22} = \partial i_{OUT}/\partial v_{OUT} = 2\beta_2V_{OUT}$. The $\alpha_2v_{IN}^2$ term doesn't depend on $v_{OUT}$.`],
      sol: md`$y_{11} = 2\alpha_1V_{IN} = 2\alpha_1$, $y_{12} = 0$, $y_{21} = 2\alpha_2V_{IN} = 2\alpha_2$, $y_{22} = 2\beta_2V_{OUT} = 4\beta_2$. Input: a resistor $\dfrac{1}{2\alpha_1}$. Output: $2\alpha_2v_{in}$ in parallel with $\dfrac{1}{4\beta_2}$.

!!trap A slip in the notes
The handwritten Handout 2 writes $y_{22} = 2\alpha_2V_{IN} + 2\beta_2V_{OUT}$. The $\alpha_2v_{IN}^2$ term doesn't change with $v_{OUT}$, so it drops out: $y_{22} = 2\beta_2V_{OUT}$.`,
    }),
  );

  // ================================================================ Unit 3: the 5 V → 5.1 V example
  // (Newton–Raphson and the 5% swing rule have their own lessons in content/diode-numerics.js.)
  lesson('u3', 'u3-rd').steps.push(
    P({
      id: 'HO2-EX', src: 'Lecture example · Handout 2', title: 'Incremental analysis, 5 V → 5.1 V', cat: 'nl', kind: 'lec',
      q: md`A $5\,\text{V}$ source drives a diode through $2.15\kO$. Use $V_{D0} = 0.7\,\text{V}$ and $V_T = 25\,\text{mV}$. The source then rises to $5.1\,\text{V}$. Using the incremental model, find the original current $I_1$, $r_d$, the change $\Delta I$, and the new total current.`,
      parts: [{ lbl: 'I_1', unit: 'mA', ans: 2 }, { lbl: 'r_d', unit: 'Ω', ans: 12.5 }, { lbl: '\\Delta I', unit: 'µA', ans: 0.1 / 2162.5 * 1e6 }, { lbl: 'I_2', unit: 'mA', ans: 2 + 0.1 / 2162.5 * 1e3 }],
      sol: md`$I_1 = \dfrac{5 - 0.7}{2.15\}text{k} = 2\,\text{mA}$, $r_d = 25/2 = 12.5\,\Omega$. Incremental circuit: $\Delta V = 0.1\,\text{V}$ across $2.15\kO + r_d$, so $\Delta I = 0.1/2162.5 = 46.2\,\mu\text{A}$ and $I_2 = 2.046\,\text{mA}$. The diode voltage moves by only $\Delta I\,r_d = 0.58\,\text{mV}$.`,
    }),
  );

  // ================================================================ Unit 4: triode, and the worked examples from Lectures 8–9 and Handout 3
  insertAfter('u4', 'u4-bias', {
    id: 'u4-triode', title: 'When saturation fails: triode',
    steps: [
      R(md`
        Assume saturation, solve, **check**. If the check fails and the device is on, it's in **triode**:
        $$I_D = \mu_nC_{ox}\frac{W}{L}\left[V_{ov}V_{DS} - \tfrac12V_{DS}^2\right],\qquad V_{DS} < V_{ov}\qquad(\text{no }\tfrac12\text{ in front})$$

        !!method Handout 3, Example 3.1(c)
        1. Saturation predicts $V_D$ below $V_{ov}$ (often negative). Not physical: switch to triode.
        2. Substitute $V_D = V_{DD} - I_DR_D$ (source grounded, so $V_{DS} = V_D$): a **quadratic** in $V_D$.
        3. Keep the root with $V_D < V_{ov}$. The other root is above $V_{ov}$, where the triode law doesn't hold.

        !!key Triode as a resistor (Lecture 7)
        For small $V_{DS}$ the channel is a **voltage-controlled resistor**:
        $$R_{ON} \approx \frac{1}{\mu_nC_{ox}\frac{W}{L}V_{ov}}$$
        More $V_{GS}$ → smaller $R_{ON}$. Lecture 7 uses it as the input resistor of an op-amp inverting amplifier: gain $-R_2/R_{ON}$, set by the control voltage.

        !!trap A slip in Lecture 9
        Lecture 9 writes the PMOS triode current with $\tfrac{\mu_pC_{ox}}{2}$ in front. The $\tfrac12$ belongs only to saturation. Handout 3 and the formula sheet have $I_{SD} = \mu_pC_{ox}\tfrac{W}{L}\left[(V_{SG} - |V_T|)V_{SD} - \tfrac12V_{SD}^2\right]$.
      `),
      P({
        id: 'HO3-EX1', src: 'Lecture example · Handout 3 Ex. 3.1', title: 'Cut-off, saturation, then triode', cat: 'mos', kind: 'lec',
        q: md`$V_{DD} = 5\,\text{V}$, $R_D = 1\kO$, $R_G = 10\kO$, $W/L = 10$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_T = 1\,\text{V}$). Find $I_D$ and $V_D$ for (a) $V_G = 0.5\,\text{V}$, (b) $V_G = 1.5\,\text{V}$, (c) $V_G = 5\,\text{V}$.`,
        fig: FIGS.nsimple({ vdds: 'V_{DD}=5\\,\\text{V}', RDs: '1\\kO', wls: 'W/L=10', RG: true, RGs: '10\\kO' }),
        parts: [{ lbl: 'I_D\\text{ (a)}', unit: 'mA', ans: 0 }, { lbl: 'I_D\\text{ (b)}', unit: 'mA', ans: 0.125 }, { lbl: 'V_D\\text{ (b)}', unit: 'V', ans: 4.875 }, { lbl: 'V_D\\text{ (c)}', unit: 'V', ans: 5 - Math.sqrt(15) }, { lbl: 'I_D\\text{ (c)}', unit: 'mA', ans: Math.sqrt(15) }],
        hints: [md`$R_G$ carries no current, so $V_{GS} = V_G$.`, md`(c): saturation gives $8\,\text{mA}$ and $V_D = -3\,\text{V}$. Impossible, so solve the triode quadratic $V_D^2 - 10V_D + 10 = 0$.`],
        sol: md`**(a)** $V_{GS} = 0.5 < V_T$: cut-off, $I_D = 0$, $V_D = 5\,\text{V}$.

**(b)** $V_{ov} = 0.5$: $I_D = \tfrac12(1\,\text{mA/V}^2)(0.25) = 0.125\,\text{mA}$, $V_D = 4.875\,\text{V} > 0.5$. Saturated ✓.

**(c)** Saturation would give $8\,\text{mA}$ and $V_D = -3\,\text{V}$: not physical. Triode: $1\text{m}\left[4V_D - \tfrac12V_D^2\right] = \dfrac{5 - V_D}{1\text{k}} \Rightarrow V_D^2 - 10V_D + 10 = 0 \Rightarrow V_D = 5 \pm \sqrt{15}$. Keep $V_D = 1.127\,\text{V}$ ($< V_{ov} = 4$); then $I_D = 3.873\,\text{mA}$.`,
      }),
      G('triode_solve', { need: 3 }),
      P({
        q: md`An NMOS with $W/L = 20$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_T = 1\,\text{V}$) is used as a resistor with a tiny $V_{DS}$. Find $R_{ON}$ at $V_{GS} = 3\,\text{V}$, and the $V_{GS}$ that halves it.`,
        parts: [{ lbl: 'R_{ON}', unit: 'Ω', ans: 250 }, { lbl: 'V_{GS}', unit: 'V', ans: 5 }],
        sol: md`$R_{ON} = \dfrac{1}{(100\,\mu)(20)(2)} = 250\,\Omega$. Halving it needs twice the overdrive ($4\,\text{V}$), so $V_{GS} = 5\,\text{V}$.`,
      }),
    ],
  });

  lesson('u4', 'u4-bias').steps.push(P({
    id: 'HO3-EX2', src: 'Lecture example · Handout 3 Ex. 3.2', title: 'Source degeneration, the two roots', cat: 'mos', kind: 'lec',
    q: md`$V_G = 1.3\,\text{V}$ (through $R_G = 10\kO$), $R_S = 1\kO$, $R_D = 10\kO$, $V_{DD} = 5\,\text{V}$, $W/L = 100$. Find $I_D$, $V_S$ and $V_D$. (Calculator allowed: the numbers aren't clean.)`,
    fig: FIGS.nbias({ vdds: 'V_{DD}=5\\,\\text{V}', RDs: '10\\kO', RSs: '1\\kO', wls: 'W/L=100', vgs: '1.3\\,\\text{V}' }),
    parts: [{ lbl: 'I_D', unit: 'µA', ans: (4 - Math.sqrt(7)) / 10000 * 1e6 }, { lbl: 'V_S', unit: 'V', ans: (4 - Math.sqrt(7)) / 10 }, { lbl: 'V_D', unit: 'V', ans: 5 - (4 - Math.sqrt(7)) }],
    hints: [md`$I_D = 0.005(0.3 - 1000I_D)^2 \Rightarrow 5000I_D^2 - 4I_D + 0.00045 = 0$.`],
    sol: md`$I_D = \dfrac{4 \pm \sqrt7}{10^4}$: $664.6\,\mu\text{A}$ or $135.4\,\mu\text{A}$. The first gives $V_D = 5 - 6.646 < 0$ (and $V_{GS} < V_T$): reject. So $I_D = 135.4\,\mu\text{A}$, $V_S = 0.135\,\text{V}$, $V_D = 3.646\,\text{V}$. Check: $V_{DS} = 3.51 > V_{ov} = 0.165$ ✓.`,
  }));

  lesson('u4', 'u4-diodeconn').steps.push(P({
    id: 'HO3-EX3', src: 'Lecture example · Handout 3 Ex. 3.3 (new numbers)', title: 'Gate tied to drain through a resistor', cat: 'mos', kind: 'lec',
    q: md`The gate connects to the drain through $R_G = 100\kO$. $V_{DD} = 5\,\text{V}$, $R_D = 19\kO$, $W/L = 100$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_T = 1\,\text{V}$). Find $V_D$ and $I_D$.`,
    fig: [
      ['rail', [2, 0], { n: 'V_{DD}' }], ['R', [2, 0], [2, 1.2], { n: 'R_D', s: '19\\kO' }], ['w', [2, 1.2], [2.9, 1.2]], ['term', [2.9, 1.2], { n: 'V_D' }],
      ['nmos', [2, 2.2], { sz: 'W/L=100' }], ['gnd', [2, 3.2]],
      ['w', [2, 1.2], [0.2, 1.2]], ['R', [0.2, 1.2], [0.2, 2.2], { n: 'R_G', s: '100\\kO', side: 'l' }], ['w', [0.2, 2.2], [1, 2.2]],
    ],
    parts: [{ lbl: 'V_D', unit: 'V', ans: 1.2 }, { lbl: 'I_D', unit: 'mA', ans: 0.2 }],
    hints: [md`No gate current, so $R_G$ drops nothing: $V_G = V_D$. It's diode-connected, hence saturated.`, md`$\dfrac{5 - V_D}{19\text{k}} = 5\text{m}(V_D - 1)^2$. One root puts $V_D$ below $V_T$ (cut-off): reject it.`],
    sol: md`$V_G = V_D$ (no current in $R_G$), so the device is diode-connected and saturated. $95(V_D - 1)^2 = 5 - V_D$: with $x = V_D - 1$, $95x^2 + x - 4 = 0 \Rightarrow x = 0.2$ or $-0.21$. The negative root means $V_{GS} < V_T$: reject. $V_D = 1.2\,\text{V}$, $I_D = 3.8/19\text{k} = 0.2\,\text{mA}$.`,
  }));

  lesson('u4', 'u4-mirror').steps.push(P({
    id: 'L8-EX2', src: 'Lecture example · Lectures 8–9, Example 2', title: 'Three devices on one gate line', cat: 'mos', kind: 'lec', big: true,
    q: md`$V_{DD} = 5\,\text{V}$, $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_T = 1\,\text{V}$, $(W/L)_1 = 125$, $(W/L)_2 = 2(W/L)_1$, $(W/L)_3 = 3(W/L)_1$. (i) What region is $M_1$ in? (ii) Find $V_1$ and $R_1$ for $I_1 = 250\,\mu\text{A}$. (iii) Find $R_2$ that puts $M_2$ at the **edge** of saturation. (iv) Find $I_3$ if $V_3 = V_1$.`,
    fig: [
      ['w', [0, 0], [5.2, 0]], ['rail', [1.3, 0], { n: 'V_{DD}' }],
      ['R', [0, 0], [0, 1.3], { n: 'R_1', side: 'l' }], ['node', [0, 1.3], { n: 'V_1', side: 'l' }],
      ['nmos', [0, 2.3], { n: 'M_1', sz: '125/1', flip: true, dc: true }], ['gnd', [0, 3.3]],
      ['w', [1, 2.3], [1.6, 2.3]],
      ['R', [2.6, 0], [2.6, 1.3], { n: 'R_2' }], ['node', [2.6, 1.3], { n: 'V_2', side: 'r' }],
      ['nmos', [2.6, 2.3], { n: 'M_2', sz: '250/1' }], ['gnd', [2.6, 3.3]],
      ['w', [1.3, 2.3], [1.3, 3.9], [3.9, 3.9], [3.9, 2.3], [4.2, 2.3]],
      ['R', [5.2, 0], [5.2, 1.3], { n: 'R_3' }], ['node', [5.2, 1.3], { n: 'V_3', side: 'r' }],
      ['nmos', [5.2, 2.3], { n: 'M_3', sz: '375/1' }], ['gnd', [5.2, 3.3]],
    ],
    parts: [
      { mc: ['Saturation: it\'s diode-connected ($V_{GD} = 0 < V_T$)', 'Triode', 'Cut-off', 'Depends on $R_1$'], a: 0, why: [null, 'Triode needs $V_{GD} > V_T$.', 'It carries $I_1 > 0$.', 'Any $R_1$ that lets it conduct leaves it saturated.'] },
      { lbl: 'V_1', unit: 'V', ans: 1.2 }, { lbl: 'R_1', unit: 'kΩ', ans: 15.2 }, { lbl: 'R_2', unit: 'kΩ', ans: 9.6 }, { lbl: 'I_3', unit: 'mA', ans: 0.75 },
    ],
    hints: [md`All three share $V_{GS} = V_1$, so all have $V_{ov} = 0.2\,\text{V}$ and currents scale with $W/L$.`, md`Edge of saturation: $V_{DS} = V_{ov}$, i.e. $V_2 = 0.2\,\text{V}$.`],
    sol: md`**(i)** Saturated (diode-connected). **(ii)** $250\,\mu = \tfrac12(100\mu)(125)V_{ov}^2 \Rightarrow V_{ov} = 0.2$, $V_1 = 1.2\,\text{V}$; $R_1 = \dfrac{5 - 1.2}{250\,\mu} = 15.2\kO$.

**(iii)** $M_2$: same $V_{GS}$, twice the size: $I_2 = 500\,\mu\text{A}$. Edge of saturation: $V_2 = V_{ov} = 0.2\,\text{V}$, so $R_2 = \dfrac{5 - 0.2}{500\,\mu} = 9.6\kO$.

**(iv)** $V_3 = V_1$ means $V_{DS3} = V_{GS3}$: saturated. $I_3 = 3I_1 = 750\,\mu\text{A}$.

!!trap Your notes disagree here
Lecture 8 has $R_2 = 9.6\kO$ (correct). Lecture 9 writes $7.6\kO$ (it used $5 - 1.2$), and the NS notes eq. (3.26) write $\dfrac{5 - 0.2}{500\,\mu} = 7.6\kO$ (an arithmetic slip). Lecture 9 p.2 also writes $I_3 = 725\,\mu\text{A}$; it's $3 \times 250 = 750\,\mu\text{A}$.`,
  }));

  // ================================================================ original problems in the exam style
  const O = (p) => P(Object.assign({ src: 'Original · exam style' }, p));
  X.NXP1a = O({
    id: 'NX-P1a', title: 'Y-parameters with a load', src: 'Original · P1 style (short answer)',
    q: md`A linear two-port has $y_{11} = 1\,\text{mS}$, $y_{12} = -0.5\,\text{mS}$, $y_{21} = 20\,\text{mS}$, $y_{22} = 0.25\,\text{mS}$ (currents defined **into** both ports). Port 1 is driven by an ideal source $V_1 = 10\,\text{mV}$ and $R_2 = 4\kO$ is connected across port 2. Find $\RTH$ looking into port 2, the output voltage $V_2$, the current $I_2$ flowing **down** through $R_2$ as drawn, and the input current $I_1$.`,
    fig: FIGS.blackbox({ src: 'V' }),
    parts: [{ lbl: '\\RTH', unit: 'kΩ', ans: 4 }, { lbl: 'V_2', unit: 'V', ans: -0.4 }, { lbl: 'I_2\\text{ (down through }R_2)', unit: 'mA', ans: -0.1 }, { lbl: 'I_1', unit: 'mA', ans: 0.21 }],
    hints: [md`Ideal source at port 1: switched off it's a short, so $\RTH = 1/y_{22}$.`, md`The port-2 current *into* the two-port is $-V_2/R_2$. Put that into $I_2 = y_{21}V_1 + y_{22}V_2$.`],
    sol: md`$\RTH = 1/y_{22} = 4\kO$. At port 2: $-V_2/R_2 = y_{21}V_1 + y_{22}V_2 \Rightarrow V_2 = \dfrac{-y_{21}V_1R_2}{1 + y_{22}R_2} = \dfrac{-(20\text{m})(0.01)(4\text{k})}{2} = -0.4\,\text{V}$. The current down through $R_2$ is $V_2/R_2 = -0.1\,\text{mA}$ (it actually flows up). $I_1 = y_{11}V_1 + y_{12}V_2 = 0.01\,\text{mA} + 0.2\,\text{mA} = 0.21\,\text{mA}$.`,
  });
  X.NXP1b = O({
    id: 'NX-P1b', title: 'A black box with an internal source', src: 'Original · P1 style (short answer)',
    q: md`A linear circuit that **contains an internal independent source** is driven by $V_1$. With $C$–$D$ open, $V_1 = 1\,\text{V}$ gives $V_2 = 3\,\text{V}$ and $V_1 = 3\,\text{V}$ gives $V_2 = 7\,\text{V}$. With $C$–$D$ shorted, $V_1 = 1\,\text{V}$ gives $I_2 = 1.5\,\text{mA}$ and $V_1 = 3\,\text{V}$ gives $I_2 = 3.5\,\text{mA}$. Find $V_{OC}$ and $\RTH$ at $V_1 = 4\,\text{V}$, then $I_2$ and $V_2$ with $R_2 = 2\kO$.`,
    fig: FIGS.blackbox({ src: 'V' }),
    parts: [{ lbl: 'V_{OC}', unit: 'V', ans: 9 }, { lbl: '\\RTH', unit: 'kΩ', ans: 2 }, { lbl: 'I_2', unit: 'mA', ans: 2.25 }, { lbl: 'V_2', unit: 'V', ans: 4.5 }],
    hints: [md`With an internal source, $V_{OC}$ and $I_{SC}$ are **affine** in $V_1$: $aV_1 + b$. Two measurements fix each line. Don't scale proportionally.`],
    sol: md`$V_{OC} = 2V_1 + 1$ and $I_{SC} = V_1 + 0.5\,\text{mA}$. At $V_1 = 4$: $V_{OC} = 9\,\text{V}$, $I_{SC} = 4.5\,\text{mA}$, $\RTH = 2\kO$ (the same at every $V_1$, as it must be). $I_2 = \dfrac{9}{2 + 2\}text{k} = 2.25\,\text{mA}$, $V_2 = 4.5\,\text{V}$. Pure proportional scaling from $V_1 = 1$ would have given $V_{OC} = 12\,\text{V}$: the affine trap.`,
  });
  X.NXP1c = O({
    id: 'NX-P1c', title: 'Two inputs, two slopes', src: 'Original · P1 style (short answer)', cat: 'nl',
    q: md`A nonlinear circuit has two inputs. At $(v_A, v_B) = (1, 1)\,\text{V}$ the output is $v_{OUT} = 2\,\text{V}$. Raising only $v_A$ to $1.1\,\text{V}$ gives $2.3\,\text{V}$; raising only $v_B$ to $1.05\,\text{V}$ gives $1.9\,\text{V}$. Estimate $v_{OUT}$ at $(v_A, v_B) = (0.95, 1.02)\,\text{V}$.`,
    parts: [{ lbl: '\\partial v_{OUT}/\\partial v_A', unit: 'V/V', ans: 3 }, { lbl: '\\partial v_{OUT}/\\partial v_B', unit: 'V/V', ans: -2 }, { lbl: 'v_{OUT}', unit: 'V', ans: 1.81 }],
    hints: [md`First-order Taylor in two variables: $\Delta v_{OUT} \approx \dfrac{\partial v_{OUT}}{\partial v_A}\Delta v_A + \dfrac{\partial v_{OUT}}{\partial v_B}\Delta v_B$. The small changes superpose.`],
    sol: md`Slopes: $0.3/0.1 = 3$ and $-0.1/0.05 = -2$. $\Delta v_{OUT} = 3(-0.05) + (-2)(0.02) = -0.19$, so $v_{OUT} \approx 1.81\,\text{V}$.`,
  });
  X.NXP2a = O({
    id: 'NX-P2a', title: 'Exponential element: gain back to the operating point', src: 'Original · P2 style (Spring 2026)',
    q: md`The two-terminal element $X$ obeys $i_X = I_Se^{v_X/V_T}$ with $I_S = 10^{-15}\,\text{A}$ and $V_T = 25\,\text{mV}$, connected as shown with $R_1 = 1\kO$. The incremental gain is $A_v = v_{out}/v_{in} = \tfrac15$. Find $r_x$, the DC current $I_X$, $V_{OUT}$ and $V_{IN}$.`,
    fig: FIGS.shuntX(),
    parts: [{ lbl: 'r_x', unit: 'Ω', ans: 250 }, { lbl: 'I_X', unit: 'mA', ans: 0.1 }, { lbl: 'V_{OUT}', unit: 'V', ans: 0.025 * Math.log(1e11) }, { lbl: 'V_{IN}', unit: 'V', ans: 0.025 * Math.log(1e11) + 0.1 }],
    hints: [md`Divider: $\dfrac{r_x}{R_1 + r_x} = \dfrac15 \Rightarrow r_x = R_1/4$.`, md`$r_x = V_T/I_X$, then $V_{OUT} = V_T\ln(I_X/I_S)$ and $V_{IN} = V_{OUT} + I_XR_1$.`],
    sol: md`$r_x = 250\,\Omega$, so $I_X = 25\,\text{mV}/250\,\Omega = 0.1\,\text{mA}$. $V_{OUT} = 0.025\ln\dfrac{10^{-4}}{10^{-15}} = 0.025\times25.33 = 0.633\,\text{V}$. $V_{IN} = 0.633 + (0.1\,\text{m})(1\text{k}) = 0.733\,\text{V}$.`,
  });
  X.NXP2b = O({
    id: 'NX-P2b', title: 'Three-diode clamp, a current sink and a floating resistor', src: 'Original · P2 style', big: true,
    q: md`$V_{IN} = 5\,\text{V}$, $R_1 = R_2 = 1\kO$, $I_2 = 0.9\,\text{mA}$, $V_T = 25\,\text{mV}$, CVD $0.7\,\text{V}$. (i) Find $V_X$, $V_{OUT}$ and the diode current. (ii) Draw the incremental model. (iii) Find $v_{out}/v_{in}$ (with $i_{out} = 0$) and $v_{out}/i_{out}$ (with $v_{in} = 0$).`,
    fig: [
      ['Vac', [0, 0.2], [0, 1.2], { n: 'v_{in}', side: 'l' }], ['V', [0, 1.2], [0, 2.2], { n: 'V_{IN}', side: 'l' }], ['gnd', [0, 2.2]],
      ['w', [0, 0.2], [0, -0.4]], ['R', [0, -0.4], [1.8, -0.4], { n: 'R_1' }], ['node', [1.8, -0.4], { n: 'V_X', side: 'a' }],
      ['D', [1.8, -0.4], [1.8, 0.47]], ['D', [1.8, 0.47], [1.8, 1.33]], ['D', [1.8, 1.33], [1.8, 2.2]], ['gnd', [1.8, 2.2]],
      ['R', [1.8, -0.4], [3.6, -0.4], { n: 'R_2' }], ['I', [3.6, -0.4], [3.6, 2.2], { n: 'I_2' }], ['gnd', [3.6, 2.2]],
      ['Iac', [4.8, 2.2], [4.8, -0.4], { n: 'i_{out}' }], ['gnd', [4.8, 2.2]],
      ['w', [3.6, -0.4], [4.8, -0.4]], ...nodeOut(4.8, -0.4, 'V_{OUT}+v_{out}'),
    ],
    parts: [{ lbl: 'V_X', unit: 'V', ans: 2.1 }, { lbl: 'V_{OUT}', unit: 'V', ans: 1.2 }, { lbl: 'I_D', unit: 'mA', ans: 2 }, { lbl: 'v_{out}/v_{in}', unit: 'V/V', ans: 37.5 / 1037.5 }, { lbl: 'v_{out}/i_{out}', unit: 'Ω', ans: 1000 + 1000 * 37.5 / 1037.5 }],
    hints: [md`DC: the three diodes clamp $V_X = 2.1\,\text{V}$. $R_2$ carries exactly $I_2$, and the diodes get what $R_1$ supplies minus $I_2$.`, md`Small signal: $I_2$ becomes an open, so $R_2$ carries no signal current when $i_{out} = 0$: $v_{out} = v_x$.`],
    sol: md`**DC:** $V_X = 2.1\,\text{V}$; $I_{R1} = 2.9\,\text{mA}$; $V_{OUT} = 2.1 - (0.9\,\text{m})(1\text{k}) = 1.2\,\text{V}$; diodes carry $2.9 - 0.9 = 2\,\text{mA}$ (> 0 ✓). $r_d = 12.5\,\Omega$, string $= 37.5\,\Omega$.

**Small signal:** $I_2$ → open, diodes → $37.5\,\Omega$. With $i_{out} = 0$, no current in $R_2$, so $\dfrac{v_{out}}{v_{in}} = \dfrac{37.5}{1000 + 37.5} = 0.0361$. With $v_{in} = 0$: $i_{out}$ sees $R_2 + (R_1\pl37.5) = 1000 + 36.1 = 1036\,\Omega$.`,
  });
  X.NXP3a = O({
    id: 'NX-P3a', title: 'NMOS mirror into a PMOS mirror, then too much load', src: 'Original · P3 style', big: true,
    q: md`$I_{REF} = 0.2\,\text{mA}$, $V_{DD} = 5\,\text{V}$, $1X = 100/1$ for both NMOS and PMOS. Find $V_1$, the current in $M_2$, $V_2$, the current in $M_4$, and the largest $R_D$ that keeps $M_4$ saturated. Then find $V_D$ if $R_D = 8\kO$.`,
    fig: [
      ['w', [0, 0], [5, 0]], ['rail', [1.6, 0], { n: 'V_{DD}' }],
      ['I', [0, 0], [0, 2.5], { n: 'I_{REF}', side: 'l' }], ['node', [0, 2.5], { n: 'V_1', side: 'l' }],
      ['nmos', [0, 3.5], { n: 'M_1', sz: '1X', flip: true, dc: true }], ['gnd', [0, 4.5]],
      ['w', [1, 3.5], [1.6, 3.5]], ['nmos', [2.6, 3.5], { n: 'M_2', sz: '2X' }], ['gnd', [2.6, 4.5]],
      ['pmos', [2.6, 1], { n: 'M_3', sz: '4X', flip: true }], ['w', [3.6, 1], [3.6, 2], [2.6, 2]], ['w', [2.6, 2], [2.6, 2.5]], ['node', [2.6, 2], { n: 'V_2', side: 'l' }],
      ['w', [3.6, 1], [4, 1]], ['pmos', [5, 1], { n: 'M_4', sz: '8X' }],
      ['R', [5, 2], [5, 3.5], { n: 'R_D' }], ['gnd', [5, 3.5]], ['node', [5, 2], { n: 'V_D', side: 'r' }],
    ],
    parts: [{ lbl: 'V_1', unit: 'V', ans: 1.2 }, { lbl: 'I_{M2}', unit: 'mA', ans: 0.4 }, { lbl: 'V_2', unit: 'V', ans: 3.8 }, { lbl: 'I_{M4}', unit: 'mA', ans: 0.8 }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: 6 }, { lbl: 'V_D\\ (R_D = 8\\kO)', unit: 'V', ans: 5 - (65 - Math.sqrt(65 * 65 - 3200)) / 320 }],
    hints: [md`$M_2$ copies $M_1$ at twice the size. That current is forced through the diode-connected PMOS $M_3$, which sets $V_2$. $M_4$ has $M_3$'s $V_{SG}$.`, md`$R_D = 8\kO$ would need $V_D = 6.4\,\text{V}$: impossible. Solve $M_4$ in triode: $I = \mu_pC_{ox}\tfrac{W}{L}\left[V_{ov}V_{SD} - \tfrac12V_{SD}^2\right]$ with $\mu_pC_{ox}\tfrac WL = 40\,\text{mA/V}^2$.`],
    sol: md`$M_1$ ($\tfrac12(100\mu)(100) = 5\,\text{mA/V}^2$): $V_{ov} = 0.2$, $V_1 = 1.2\,\text{V}$. $M_2$ ($2X$, same $V_{GS}$): $0.4\,\text{mA}$. $M_3$ ($4X$ PMOS: $\tfrac12(50\mu)(400) = 10\,\text{mA/V}^2$): $V_{ov} = 0.2$, $V_{SG} = 1.2$, $V_2 = 3.8\,\text{V}$ (and $M_2$'s drain at 3.8 V keeps it saturated). $M_4$ ($8X$, twice $M_3$): $0.8\,\text{mA}$. Saturation: $V_D \le V_G + |V_T| = 4.8\,\text{V}$, so $R_{D,max} = 4.8/0.8\text{m} = 6\kO$.

**$R_D = 8\kO$:** triode. With $u = V_{SD}$: $\dfrac{5 - u}{8\text{k}} = 40\text{m}\left[0.2u - \tfrac12u^2\right] \Rightarrow 160u^2 - 65u + 5 = 0 \Rightarrow u = 0.103$ or $0.303$. Keep $u < V_{ov} = 0.2$: $V_D = 4.897\,\text{V}$, $I = 0.612\,\text{mA}$ (less than the $0.8\,\text{mA}$ the mirror "wants").`,
  });
  X.NXP3b = O({
    id: 'NX-P3b', title: 'Degenerated NMOS: saturated, then not', src: 'Original · P3 style (calculator)',
    q: md`$V_G = 2\,\text{V}$, $R_S = 1\kO$, $W/L = 20$, $V_{DD} = 5\,\text{V}$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_T = 1\,\text{V}$). (a) With $R_D = 4\kO$, find $I_D$. (b) Find $R_{D,max}$ for saturation. (c) With $R_D = 12\kO$, find $I_D$ and $V_D$.`,
    fig: FIGS.nbias({ vdds: 'V_{DD}=5\\,\\text{V}', RSs: '1\\kO', wls: 'W/L=20', vgs: '2\\,\\text{V}' }),
    parts: [{ lbl: 'I_D\\text{ (a)}', unit: 'mA', ans: (3 - Math.sqrt(5)) / 2 }, { lbl: 'R_{D,max}', unit: 'kΩ', ans: 4 / ((3 - Math.sqrt(5)) / 2) }, { lbl: 'I_D\\text{ (c)}', unit: 'mA', ans: 0.354219, tol: { rel: 0.005 } }, { lbl: 'V_D\\text{ (c)}', unit: 'V', ans: 0.749372, tol: { rel: 0.01 } }],
    hints: [md`(a) In mA and V: $I = (1 - I)^2 \Rightarrow I^2 - 3I + 1 = 0$. Reject the root with $V_{GS} < V_T$.`, md`(b) $V_D \ge V_G - V_T = 1\,\text{V}$.`, md`(c) $12\kO$ is above $R_{D,max}$: triode. Unknown $I$; $V_S = I R_S$, $V_D = 5 - IR_D$; $I = 2\text{m}\left[(1 - V_S)V_{DS} - \tfrac12V_{DS}^2\right]$. Solve numerically and keep the root with $V_{DS} < V_{ov}$.`],
    sol: md`**(a)** $I_D = 0.382\,\text{mA}$ ($V_S = 0.382$, $V_{GS} = 1.618$); the other root, $2.618\,\text{mA}$, makes $V_{GS} < 0$. $V_D = 5 - 1.528 = 3.47 \ge 1$ ✓.

**(b)** $R_{D,max} = \dfrac{5 - 1}{0.382\,\text{m}} = 10.47\kO$.

**(c)** Saturation would give $V_D = 5 - 4.58 = 0.42 < 1$: triode. Solving the triode equation gives two candidates: $I = 0.296\,\text{mA}$ ($V_{DS} = 1.15 > V_{ov} = 0.70$: not triode, reject) and $I = 0.354\,\text{mA}$ ($V_S = 0.354$, $V_D = 0.749$, $V_{DS} = 0.395 < V_{ov} = 0.646$ ✓).`,
  });
  const NX = [X.NXP1a, X.NXP1b, X.NXP1c, X.NXP2a, X.NXP2b, X.NXP3a, X.NXP3b];

  // ================================================================ Exam Prep: originals, the bank, logistics
  const bankIndex = () => {
    const rows = { lin: [], nl: [], mos: [] };
    const label = { real: 'Past exam / practice', hw: 'Homework', lec: 'Lecture example', orig: 'Original' };
    for (const e of BANK.collect()) rows[e.topic].push(`| ${e.p.title || e.p.id} | ${label[e.source]} · ${e.p.src || e.p.id} | [open](#/l/${e.lesson}) |`);
    return Object.entries(rows).map(([t, r]) => `### ${BANK.TOPIC[t]} (${r.length})\n\n| Question | Source | |\n|---|---|---|\n${r.join('\n')}`).join('\n\n');
  };
  const ALLSRC = ['real', 'hw', 'lec', 'orig', 'gen'];
  insertAfter('u5', 'u5-mockD',
    { id: 'u5-originals', title: 'Original exam-style problems', kind: 'mock', steps: [R(md`New problems in the exam style. Some need a calculator.`), ...NX] },
  );
  insertAfter('u5', 'u5-mixed', {
    id: 'u5-bank', title: 'Question bank', kind: 'review',
    steps: [
      R(md`
        Past exams, practice papers, homework, lecture examples, originals, and generated variants. No repeats until a card has gone through every stored question. Index at the bottom.

        ### Any topic
      `),
      G('bank', { need: 10, cat: 'any', from: ALLSRC }),
      R(md`### Past exams and practice papers only`),
      G('bank', { need: 10, cat: 'any', from: ['real'] }),
      R(md`### Problem 1: linear circuits`),
      G('bank', { need: 5, cat: 'lin', from: ALLSRC }),
      R(md`### Problem 2: nonlinear and diodes`),
      G('bank', { need: 5, cat: 'nl', from: ALLSRC }),
      R(md`### Problem 3: MOSFET DC`),
      G('bank', { need: 5, cat: 'mos', from: ALLSRC }),
      R(md`### Originals and generated only`),
      G('bank', { need: 5, cat: 'any', from: ['orig', 'gen'] }),
    ],
  });
  const bank = lesson('u5', 'u5-bank');
  bank.steps.push(R(bankIndex()));

  lesson('u5', 'u5-playbook').steps.unshift(R(md`
    **Exam 1:** Thu Sep 24, 7–8 PM, 1002 ECEB. HW 1–3, through MOSFET DC analysis. Calculators allowed; formula sheet provided. Answers here match the official Practice 1–6 solutions (Practice 2 = Fall 2023, Practice 3 = Fall 2022).
  `));
  const mixed = lesson('u5', 'u5-mixed').steps.find((s) => s.t === 'gen');
  mixed.opts.pool.push('triode_solve');

  unit('u5').blurb = 'Every past paper as a timed set (Spring 2026 included), four mock midterms, original exam-style problems, a random question bank, a mixed drill, and the exam-day playbook.';
  const gm = lesson('u4', 'u4-gm');
  if (gm) gm.title = 'Preview: transconductance (not on Exam 1)';
})();

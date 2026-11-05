/* Exam 3 flashcards: the BJT, frequency-response and time-constant results, plus every Exam 2 MOSFET card (from
   e2-cards.js), in one deck with topic piles. Same Leitner scheme as the Exam 2 deck: "Missed it" sends a card back
   into this round, "Got it" twice in a row (across rounds) marks it known. Boxes are kept in this browser. */
(function () {
  'use strict';
  const F = window.E3F;
  const ex = (e, n, o) => E3.ex(e, n, '', o);
  const look = F.look, lookDn = F.lookDn, out = F.out, vin = F.vin;

  const CATS = {
    bimp: 'BJT impedances', bstage: 'BJT stages', bdc: 'BJT DC and model', bode: 'Bode plots', hf: 'Poles, Miller', octc: 'Time constants',
    'm-imp': 'MOS impedances (Exam 2)', 'm-stage': 'MOS stages (Exam 2)', 'm-rule': 'Methods (Exam 2)', 'm-dc': 'MOS DC (Exam 2)', 'm-trap': 'Traps (Exam 2)',
  };
  const cascR = [['npn', [1, 1], { n: 'Q_2' }], ['acg', [0, 1]], ['npn', [1, 3], { n: 'Q_1' }], ['acg', [0, 3]], ['gnd', [1, 4]], ['w', [1, 0], [1, -0.4]], lookDn([1, -0.4], 'R_{out}')];
  const activeLoad = [['pnp', [1, 0], { n: 'Q_2' }], ['acg', [0, 0]], ['rail', [1, -1]], ['npn', [1, 2], { n: 'Q_1' }], ['gnd', [1, 3]],
    ['w', [0, 2], [-0.6, 2], [-0.6, 2.4]], ...vin(-0.6, 2.4), ['w', [1, 1], [1.8, 1]], out([1.8, 1])];
  const csCaps = [['nmos', [1, 1]], ['gnd', [1, 2]], ['w', [0, 1], [-0.4, 1]], ['R', [-2, 1], [-0.4, 1], { n: 'R_S' }], ['Vac', [-2, 1], [-2, 2], { n: 'v_{in}', side: 'l' }], ['gnd', [-2, 2]],
    ['C', [-0.4, 1], [-0.4, 2], { n: 'C_{gs}', side: 'l' }], ['gnd', [-0.4, 2]], ['w', [-0.4, 1], [-0.4, 0]], ['C', [-0.4, 0], [1, 0], { n: 'C_{gd}' }],
    ['R', [1, -1.2], [1, 0], { n: 'R_L' }], ['rail', [1, -1.2]], ['w', [1, 0], [2.6, 0]], ['C', [2, 0], [2, 1], { n: 'C_L' }], ['gnd', [2, 1]], ['term', [2.6, 0], { n: 'v_{out}' }]];
  const ceCaps = csCaps.map((e) => (e[0] === 'nmos' ? ['npn', e[1]] : e[0] === 'C' && e[3].n === 'C_{gs}' ? ['C', e[1], e[2], { n: 'C_\\pi', side: 'l' }] : e[0] === 'C' && e[3].n === 'C_{gd}' ? ['C', e[1], e[2], { n: 'C_\\mu' }] : e));

  const CARDS = [
    // ---------------------------------------------------------------- BJT impedances
    { id: 'b-base', cat: 'bimp', t: 'Looking into the base', fig: F.base(), ex: ex('rpi', ['rpi']),
      q: md`Emitter on its rail. Resistance looking into the base?`,
      a: md`$$R_{in} = r_\pi = \frac{\beta}{g_m}$$`,
      why: md`The base draws current: $i_b = v_\pi/r_\pi$. Not infinite like a gate. At $1\,\text{mA}$ and $\beta = 100$: $2.5\,\text{k}\Omega$.` },
    { id: 'b-baseRE', cat: 'bimp', t: 'Base with an emitter resistor', fig: F.baseRE(), ex: ex('rpi + (beta+1)*RE', ['rpi', 'beta', 'RE']),
      q: md`$R_E$ in the emitter. Resistance looking into the base ($r_o\to\infty$)?`,
      a: md`$$R_{in} = r_\pi + (\beta + 1)R_E$$`,
      why: md`The emitter carries $(\beta + 1)$ times the base current, so $R_E$ drops $(\beta + 1)i_bR_E$: it looks $(\beta + 1)$ times bigger from the base. **Up through the junction: multiply.**` },
    { id: 'b-emit', cat: 'bimp', t: 'Looking into the emitter', fig: F.emitter(), ex: ex('rpi/(beta+1)', ['rpi', 'beta', 'gm']),
      q: md`Base held, collector on its rail. Resistance looking into the emitter?`,
      a: md`$$R = \frac{r_\pi}{\beta + 1}\approx\frac{1}{g_m}\quad(\parallel r_o)$$`,
      why: md`Push the emitter by $v$: $v_\pi = -v$, and the emitter current changes by $(g_m + 1/r_\pi)v$. Same as a MOSFET source: small, about $25\,\Omega$ at $1\,\text{mA}$.` },
    { id: 'b-emitRB', cat: 'bimp', t: 'Emitter with a base resistor', fig: F.emitterRB(), ex: ex('(rpi + RB)/(beta+1)', ['rpi', 'beta', 'RB']),
      q: md`$R_B$ between the base and a held node. Resistance looking into the emitter ($r_o\to\infty$)?`,
      a: md`$$R = \frac{r_\pi + R_B}{\beta + 1}\approx\frac{1}{g_m} + \frac{R_B}{\beta + 1}$$`,
      why: md`The base resistance shows up at the emitter divided by $(\beta + 1)$. **Down through the junction: divide.** (A MOSFET source ignores a gate resistor: no gate current.)` },
    { id: 'b-coll', cat: 'bimp', t: 'Looking into the collector', fig: F.collector(), ex: ex('ro', ['ro']),
      q: md`Base held, emitter on its rail. Resistance looking into the collector?`,
      a: md`$$R = r_o = \frac{V_A}{I_C}$$`,
      why: md`$v_\pi = 0$, the controlled source is off, only $r_o$ remains. This is a current source. With $r_o$ dropped (Lecture 24) it is $\infty$.` },
    { id: 'b-collRE', cat: 'bimp', t: 'Collector with emitter degeneration', fig: F.collectorRE(), ex: ex('ro*(1 + gm*(RE || rpi)) + (RE || rpi)', ['ro', 'gm', 'RE', 'rpi', 'beta']),
      q: md`Base held, $R_E$ in the emitter. Resistance looking into the collector?`,
      a: md`$$R = r_o[1 + g_m(R_E\parallel r_\pi)] + R_E\parallel r_\pi\approx r_o[1 + g_m(R_E\parallel r_\pi)]$$`,
      why: md`The MOSFET degenerated drain with $R_S\to R_E\parallel r_\pi$ ($r_\pi$ hangs from the held base to the emitter, in parallel with $R_E$). Because of that $r_\pi$, the multiplier tops out at $1 + g_mr_\pi = 1 + \beta$: **at most about $\beta r_o$.**` },
    { id: 'b-diode', cat: 'bimp', t: 'Diode-connected BJT', fig: F.diode(), ex: ex('rpi/(beta+1)', ['rpi', 'beta', 'gm']),
      q: md`Base tied to collector, emitter on ground. Resistance looking in?`,
      a: md`$$R = \frac{r_\pi}{\beta + 1}\parallel r_o\approx\frac{1}{g_m}$$`,
      why: md`$v_\pi = v$: the device draws $(g_m + 1/r_\pi)v$. Same as the MOSFET diode, about $1/g_m$.` },
    { id: 'b-diodeRB', cat: 'bimp', t: 'Base tied to the collector through $R_B$', fig: F.diodeRB(), ex: ex('(rpi + RB)/(beta+1)', ['rpi', 'beta', 'RB']),
      q: md`$R_B$ from the collector to the base, emitter grounded. Resistance looking into the collector ($r_o\to\infty$)?`,
      a: md`$$R = \frac{R_B + r_\pi}{\beta + 1}$$`,
      why: md`The base current $v/(R_B + r_\pi)$ is multiplied by $\beta$ at the collector; total current $(\beta + 1)v/(R_B + r_\pi)$ (Lecture 24 summary).` },
    { id: 'b-casc', cat: 'bimp', t: 'BJT cascode output resistance', fig: cascR, ex: ex('ro2*(1 + gm2*(ro1 || rpi2)) + (ro1 || rpi2)', ['ro1', 'ro2', 'gm2', 'rpi2', 'beta2']),
      q: md`Two stacked NPNs, both bases held. Resistance looking into the top collector?`,
      a: md`$$R_{out} = r_{o2}[1 + g_{m2}(r_{o1}\parallel r_{\pi2})] + r_{o1}\parallel r_{\pi2}\approx\beta r_{o2}$$`,
      why: md`A degenerated collector with $R_E = r_{o1}$. Since $r_{o1}\gg r_{\pi2}$, $r_{o1}\parallel r_{\pi2}\approx r_{\pi2}$ and the multiplier is about $\beta$. A MOSFET cascode reaches $g_mr_{ds}^2$; a BJT cascode stops at $\beta r_o$.` },
    { id: 'b-elev', cat: 'bimp', t: 'The $(\\beta + 1)$ elevator',
      q: md`A resistance $R$ sits on one side of a base–emitter junction. How does it look from the other side?`,
      a: md`From the base, an emitter-side $R$ looks like $(\beta + 1)R$. From the emitter, a base-side $R$ looks like $R/(\beta + 1)$.`,
      why: md`The emitter current is $(\beta + 1)$ times the base current. Same voltage, $(\beta + 1)$ times the current: impedance scales by $(\beta + 1)$. This one rule gives $R_{in}$ of every CE/CC stage and $R_{out}$ of every follower and CB input.` },

    // ---------------------------------------------------------------- BJT DC and model
    { id: 'b-gm', cat: 'bdc', t: 'BJT $g_m$',
      q: md`Transconductance of a BJT at collector current $I_C$?`,
      a: md`$$g_m = \frac{I_C}{V_T},\qquad V_T = 25\,\text{mV}\ \Rightarrow\ 40\,\text{mS per mA}$$`,
      why: md`From $I_C = I_Se^{V_{BE}/V_T}$: $dI_C/dV_{BE} = I_C/V_T$. A MOSFET at the same current has $2I_D/V_{ov}$, several times less.` },
    { id: 'b-rpi', cat: 'bdc', t: '$r_\\pi$ and $r_o$',
      q: md`Write $r_\pi$ and $r_o$ in terms of the bias.`,
      a: md`$$r_\pi = \frac{\beta}{g_m} = \frac{\beta V_T}{I_C},\qquad r_o = \frac{V_A}{I_C}$$`,
      why: md`$r_\pi$: the base current is $1/\beta$ of the collector current, so the base sees $\beta$ times $1/g_m$. At $1\,\text{mA}$, $\beta = 100$, $V_A = 100\,\text{V}$: $g_m = 40\,\text{mS}$, $r_\pi = 2.5\,\text{k}\Omega$, $r_o = 100\,\text{k}\Omega$.` },
    { id: 'b-currents', cat: 'bdc', t: 'The three currents',
      q: md`Forward active. Relate $I_B$, $I_C$, $I_E$.`,
      a: md`$$I_C = \beta I_B,\quad I_E = (\beta + 1)I_B,\quad I_C = \alpha I_E,\ \alpha = \frac{\beta}{\beta + 1}$$`,
      why: md`$I_E = I_B + I_C$. For $\beta = 100$, $\alpha = 0.99$: the collector and emitter currents are nearly equal, which is why $I_C\approx I_E$ is a common shortcut.` },
    { id: 'b-regions', cat: 'bdc', t: 'Which region?',
      q: md`An NPN: how do you tell forward active, saturation and cutoff from the node voltages?`,
      a: md`Active: $V_{BE}\approx0.7\,\text{V}$ and $V_C\ge V_B$ (base–collector off). Saturation: both junctions on, $V_{CE}\approx0.2\,\text{V}$. Cutoff: $V_{BE}$ well under $0.7\,\text{V}$, all currents zero.`,
      why: md`PNP: flip every inequality ($V_{EB}\approx0.7$, $V_C\le V_B$). Procedure: assume active, solve with $V_{BE} = 0.7$ and $I_C = \beta I_B$, then check $V_C\ge V_B$; if it fails, redo with $V_{CE} = 0.2\,\text{V}$.` },
    { id: 'b-bias', cat: 'bdc', t: 'Base resistor plus emitter resistor',
      q: md`$V_{BB}$ drives the base through $R_B$; $R_E$ in the emitter. Base current in forward active?`,
      a: md`$$I_B = \frac{V_{BB} - 0.7}{R_B + (\beta + 1)R_E},\qquad I_C = \beta I_B$$`,
      why: md`KVL around the base–emitter loop: $V_{BB} = I_BR_B + 0.7 + (\beta + 1)I_BR_E$. The $(\beta + 1)$ elevator again, at DC.` },
    { id: 'b-hybrid', cat: 'bdc', t: 'The hybrid-$\\pi$ model', fig: F.hybridPi(),
      q: md`Draw the small-signal model of a BJT.`,
      a: md`$r_\pi$ from base to emitter (with $v_\pi$ across it), $g_mv_\pi$ from collector to emitter, $r_o$ from collector to emitter.`,
      why: md`It is the MOSFET model plus $r_\pi$. The same model works for NPN and PNP: never flip arrows or signs for a PNP in the small-signal circuit.` },

    // ---------------------------------------------------------------- BJT stages
    { id: 'b-ce', cat: 'bstage', t: 'Common emitter', fig: F.ce(), ex: ex('-gm*(RC || ro)', ['gm', 'RC', 'ro']),
      q: md`Voltage gain, input and output resistance?`,
      a: md`$$A_v = -g_m(R_C\parallel r_o),\quad R_{in} = r_\pi,\quad R_{out} = R_C\parallel r_o$$`,
      why: md`$G_M = g_m$ (output shorted, $v_\pi = v_{in}$), $A_v = -G_MR_{out}$. Exactly the common source; only $R_{in}$ differs ($r_\pi$ instead of $\infty$).` },
    { id: 'b-ceRB', cat: 'bstage', t: 'Common emitter with a source resistance', fig: F.ceRB(), ex: ex('-gm*RC*rpi/(rpi + RB)', ['gm', 'RC', 'rpi', 'RB', 'beta']),
      q: md`$v_{in}$ reaches the base through $R_B$. Gain ($r_o\to\infty$)?`,
      a: md`$$A_v = -g_mR_C\frac{r_\pi}{r_\pi + R_B} = -\frac{\beta R_C}{r_\pi + R_B}$$`,
      why: md`$R_B$ and $r_\pi$ divide the input before it reaches the junction. With a MOSFET this divider does not exist (gate current is zero).` },
    { id: 'b-ceRE', cat: 'bstage', t: 'Common emitter with emitter degeneration', fig: F.ceDeg(), ex: ex('-gm*RC/(1 + gm*RE*(beta+1)/beta)', ['gm', 'RC', 'RE', 'beta']),
      q: md`$G_M$ and gain ($r_o\to\infty$, ideal source on the base)?`,
      a: md`$$G_M = \frac{g_m}{1 + \frac{\beta + 1}{\beta}g_mR_E}\approx\frac{g_m}{1 + g_mR_E},\quad A_v\approx-\frac{R_C}{1/g_m + R_E}\approx-\frac{R_C}{R_E}$$
$R_{in} = r_\pi + (\beta + 1)R_E$.`,
      why: md`KVL: $v_{in} = v_\pi + (1 + 1/\beta)i_{out}R_E$ with $i_{out} = g_mv_\pi$ (Lecture 24). The resistors set the gain; $R_E$ also raises $R_{in}$ by $(\beta + 1)R_E$.` },
    { id: 'b-cb', cat: 'bstage', t: 'Common base', fig: F.cb(), ex: ex('beta*RC/(rpi + (beta+1)*RE)', ['beta', 'RC', 'rpi', 'RE', 'gm']),
      q: md`Base held, $v_{in}$ into the emitter through $R_E$. Gain ($r_o\to\infty$)?`,
      a: md`$$A_v = \frac{\beta R_C}{r_\pi + (\beta + 1)R_E} = \frac{\alpha R_C}{R_E + r_\pi/(\beta + 1)}\approx\frac{R_C}{R_E + 1/g_m}$$
With $R_B$ at the base: replace $r_\pi$ by $r_\pi + R_B$. $R_{in} = R_E + \dfrac{r_\pi + R_B}{\beta + 1}$.`,
      why: md`The input current $v_{in}/(R_E + R_{emitter})$ goes in at the emitter and $\alpha$ of it comes out of the collector. Non-inverting; $G_M < 0$ in the $A_v = -G_MR_{out}$ convention.` },
    { id: 'b-cc', cat: 'bstage', t: 'Emitter follower', fig: F.cc(true), ex: ex('(beta+1)*RE/(RB + rpi + (beta+1)*RE)', ['beta', 'RE', 'RB', 'rpi']),
      q: md`$v_{in}$ through $R_B$ into the base, output at the emitter. Gain, $R_{in}$, $R_{out}$ ($r_o\to\infty$)?`,
      a: md`$$A_v = \frac{(\beta + 1)R_E}{R_B + r_\pi + (\beta + 1)R_E}\approx1$$
$R_{in} = R_B + r_\pi + (\beta + 1)R_E$, $\;R_{out} = R_E\parallel\dfrac{r_\pi + R_B}{\beta + 1}$.`,
      why: md`Lecture 24: $G_M = -\dfrac{\beta + 1}{r_\pi + R_B}$, $A_v = -G_MR_{out}$. A buffer: high in, low out, gain just under 1. Both $(\beta + 1)$ directions appear in one stage.` },
    { id: 'b-active', cat: 'bstage', t: 'Common emitter with a PNP current-source load', fig: activeLoad, ex: ex('-gm1*(ro1 || ro2)', ['gm1', 'ro1', 'ro2']),
      q: md`$Q_2$'s base is held. Gain?`,
      a: md`$$A_v = -g_{m1}(r_{o1}\parallel r_{o2})$$`,
      why: md`Output node: $r_{o1}$ down, $r_{o2}$ up (a held-base collector). At $1\,\text{mA}$ with $V_A = 100\,\text{V}$: $-40\,\text{mS}\times50\,\text{k}\Omega = -2000$.` },
    { id: 'b-cascamp', cat: 'bstage', t: 'BJT cascode amplifier', fig: F.cascode(), ex: ex('-gm1*RC', ['gm1', 'RC']),
      q: md`$Q_2$'s base is held, resistor load $R_C$. Gain?`,
      a: md`$$A_v\approx-\alpha g_{m1}(R_C\parallel\beta r_{o2})\approx-g_{m1}R_C$$`,
      why: md`$Q_1$ makes the current, $Q_2$ (common base) passes it up. With a resistor load, $R_C$ sets $R_{out}$: no more gain than a common emitter. The cascode pays off with a current-source load, and against Miller.` },

    // ---------------------------------------------------------------- Bode
    { id: 'f-db', cat: 'bode', t: 'Decibels',
      q: md`$|H|_{dB}$ of a gain of 10, 2, $\sqrt2$, 100, 0.1, $1/\sqrt2$?`,
      a: md`$20\log_{10}|H|$: 20, 6, 3, 40, $-20$, $-3$ dB.`,
      why: md`Products add in dB: $50 = 100/2\to40 - 6 = 34$ dB. Use $20\log$ for voltage gain, never $10\log$.` },
    { id: 'f-pole', cat: 'bode', t: 'One pole',
      q: md`$H(s) = \dfrac{A}{1 + s/\omega_p}$: magnitude and phase?`,
      a: md`Flat at $20\log A$, then $-20$ dB/decade above $\omega_p$ ($-3$ dB right at it). Phase $0°\to-90°$: $-45°$ at $\omega_p$, straight line from $0.1\omega_p$ to $10\omega_p$ ($-45°$/decade).`,
      why: md`$|H| = A/\sqrt{1 + (\omega/\omega_p)^2}$, $\angle H = -\tan^{-1}(\omega/\omega_p)$. At $0.1\omega_p$ the exact phase is $-5.7°$, at $10\omega_p$ it is $-84°$: hence the straight-line rule.` },
    { id: 'f-zero', cat: 'bode', t: 'One zero (left half plane)',
      q: md`$H(s) = A(1 + s/\omega_z)$: magnitude and phase?`,
      a: md`Flat, then $+20$ dB/decade above $\omega_z$. Phase $0°\to+90°$, $+45°$ at $\omega_z$.`,
      why: md`A zero is a pole upside down. A **right-half-plane** zero, $(1 - s/\omega_z)$, has the same magnitude but its phase goes **down** to $-90°$ (the CS stage's $g_m/C_{gd}$ zero).` },
    { id: 'f-form', cat: 'bode', t: 'Sketching any $H(s)$',
      q: md`How do you sketch $H(s) = A_{dc}\dfrac{(1 + s/\omega_{z1})\cdots}{(1 + s/\omega_{p1})(1 + s/\omega_{p2})\cdots}$?`,
      a: md`Start at $20\log|A_{dc}|$. Walk up in frequency: each pole bends the slope down by 20 dB/dec, each zero up by 20 dB/dec. Phase: add $-90°$ per pole and $+90°$ per zero, each spread over two decades around its corner; $A_{dc} < 0$ adds $180°$.`,
      why: md`Logarithms turn the product into a sum, so every factor is drawn alone and the plots add. Slope between corners $= 20\times$(zeros passed $-$ poles passed).` },

    // ---------------------------------------------------------------- poles at nodes, Miller
    { id: 'f-node', cat: 'hf', t: 'A pole at a node',
      q: md`A node has resistance $R$ to ground and capacitance $C$ to ground. Its pole?`,
      a: md`$$\omega_p = \frac{1}{RC}$$`,
      why: md`$R$ = everything you see from the node (the Exam 2 skill), $C$ = everything hanging on it. Examples: $C_L$ at a drain, $1/(R_LC_L)$; a gate driven through $R_S$, $1/(R_SC_{in})$; a common-gate input, $1/[(R_S\parallel1/g_m)C_{in}]$.` },
    { id: 'f-models', cat: 'hf', t: 'Transistor capacitances',
      q: md`Name the capacitances of the BJT and MOSFET high-frequency models.`,
      a: md`BJT: $C_\pi = C_b + C_{je}$ (base–emitter: diffusion plus depletion), $C_\mu$ (base–collector depletion). MOSFET: $C_{gs}$, $C_{gd}$, $C_{db}$, $C_{sb}$.`,
      why: md`$C_\mu$ and $C_{gd}$ are the dangerous ones: they bridge the input (base/gate) and the output (collector/drain) of a common emitter/source.` },
    { id: 'f-miller', cat: 'hf', t: "Miller's theorem",
      q: md`An impedance $Z_F$ bridges nodes 1 and 2, with $v_2 = A_vv_1$. Equivalent impedances to ground?`,
      a: md`$$Z_1 = \frac{Z_F}{1 - A_v},\quad Z_2 = \frac{Z_F}{1 - 1/A_v}$$
A capacitor across gain $-A$: $C_{in} = (1 + A)C_F$, $C_{out}\approx C_F$.`,
      why: md`The far end swings $A$ times harder the other way, so the capacitor carries $(1 + A)$ times the current. Non-inverting $A_v\approx1$ (a follower): $C_F(1 - A_v)\approx0$.` },
    { id: 'f-csMiller', cat: 'hf', t: 'Common source: the two poles (Miller)', fig: csCaps,
      q: md`Input and output poles of the common source with $R_S$, $C_{gs}$, $C_{gd}$, $R_L$, $C_L$?`,
      a: md`$$\omega_{p,in} = \frac{1}{R_S[C_{gs} + (1 + g_mR_L)C_{gd}]},\quad\omega_{p,out} = \frac{1}{R_L[C_L + (1 + \tfrac{1}{g_mR_L})C_{gd}]}$$`,
      why: md`Miller splits $C_{gd}$ into $(1 + g_mR_L)C_{gd}$ at the gate and about $C_{gd}$ at the drain. BJT: $R_S\to R_S\parallel r_\pi$, $C_{gs}\to C_\pi$, $C_{gd}\to C_\mu$.` },
    { id: 'f-csExact', cat: 'hf', t: 'Common source: exact response',
      q: md`The exact CS transfer function (Lecture 28): its zero, and the dominant-pole estimate?`,
      a: md`$$\frac{v_{out}}{v_{in}} = \frac{(C_{gd}s - g_m)R_L}{as^2 + bs + 1},\quad\omega_z = \frac{g_m}{C_{gd}}\ (\text{right half plane})$$
$$\omega_{p1}\approx\frac1b = \frac{1}{(1 + g_mR_L)C_{gd}R_S + R_SC_{gs} + R_L(C_{gd} + C_L)}$$`,
      why: md`$b$ is exactly the sum of the open-circuit time constants: the dominant-pole estimate and the OCTC bandwidth are the same number for this stage.` },

    // ---------------------------------------------------------------- open-circuit time constants
    { id: 'o-proc', cat: 'octc', t: 'The OCTC recipe',
      q: md`Estimate the bandwidth of a circuit with several capacitors.`,
      a: md`For each capacitor $C_j$: short the input source, remove (open) the other capacitors, find the resistance $R_{jo}$ it sees. Then $\tau_j = R_{jo}C_j$ and $$\omega_{-3\text{dB}}\approx\frac{1}{\sum_j R_{jo}C_j}$$`,
      why: md`The $s$ coefficient of the denominator is exactly $\sum\tau_j$; keeping only that term gives a one-pole estimate. It is pessimistic: the real bandwidth is at least this big (two equal poles: $0.644/\tau$ actual vs $0.5/\tau$ estimated).` },
    { id: 'o-bridge', cat: 'octc', t: 'The bridge rule',
      q: md`A capacitor bridges two nodes of a transconductor: left node $R_L'$ to ground, right node $R_R$ to ground, current $G_mv_{left}$ into the right node. Resistance it sees?`,
      a: md`$$R = R_{left} + R_{right} + G_mR_{left}R_{right}$$`,
      why: md`Push $i_t$ through the capacitor's terminals: it makes $v_{left} = -i_tR_{left}$ and the transconductor adds $G_mR_{left}i_t$ through $R_{right}$. The product term is Miller. CS: $R_S + R_L + g_mR_SR_L$.` },
    { id: 'o-cs', cat: 'octc', t: 'Common source / emitter time constants', fig: ceCaps,
      q: md`Resistances seen by $C_\pi$, $C_\mu$, $C_L$ in this common emitter ($r_o\to\infty$)?`,
      a: md`$R_\pi = R_S\parallel r_\pi$, $\;R_\mu = R' + R_L + g_mR'R_L$ with $R' = R_S\parallel r_\pi$, $\;R_{CL} = R_L$.`,
      why: md`MOSFET version: $R_{gs} = R_S$, $R_{gd} = R_S + R_L + g_mR_SR_L$, $R_{CL} = R_L$ (no $r_\pi$). The $C_\mu$ term usually dominates.` },
    { id: 'o-deg', cat: 'octc', t: 'Degenerated common source',
      q: md`$R_G$ at the gate, $R_S$ at the source, $R_L$ at the drain ($r_{ds}\to\infty$). $R_{gs}$ and $R_{gd}$?`,
      a: md`$$R_{gs} = \frac{R_G + R_S}{1 + g_mR_S},\qquad R_{gd} = R_G + R_L + \frac{g_m}{1 + g_mR_S}R_GR_L$$`,
      why: md`$C_{gs}$ is partly bootstrapped (the source follows the gate). $C_{gd}$ is the bridge rule with the degenerated transconductance $g_m/(1 + g_mR_S)$ (Lecture 29).` },
    { id: 'o-cg', cat: 'octc', t: 'Common gate time constants',
      q: md`Common gate, input through $R_S$ at the source, $R_L$ at the drain. Resistances for $C_{gs}$ and for $C_{gd} + C_L$?`,
      a: md`$$R_{gs} = R_S\parallel\frac{1}{g_m}\Big(1 + \frac{R_L}{r_{ds}}\Big),\qquad R_{out} = R_L\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$$`,
      why: md`Gate grounded: every capacitor goes from a node to ground, nothing bridges input and output, no Miller. That is why common gate/base stages are fast.` },
    { id: 'o-fol', cat: 'octc', t: 'Source follower $C_{gs}$',
      q: md`Follower: $R_S$ at the gate, $R_L$ at the source. Resistance seen by $C_{gs}$?`,
      a: md`$$R_{gs} = \frac{R_S + R_L}{1 + g_mR_L}$$
BJT: $r_\pi\parallel\dfrac{R_S + R_L}{1 + g_mR_L}$.`,
      why: md`The source follows the gate, so little voltage develops across $C_{gs}$: it is bootstrapped (Miller with $A_v\approx+1$).` },
    { id: 'o-casc', cat: 'octc', t: 'Cascode: why it is fast',
      q: md`Cascode, input device $M_1$ through $R_S$. Resistance seen by $C_{gd1}$?`,
      a: md`$$R_{gd1} = R_S + R_X + g_{m1}R_SR_X,\quad R_X\approx\frac{1}{g_{m2}}\ \Rightarrow\ \approx R_S\Big(1 + \frac{g_{m1}}{g_{m2}}\Big) + \frac{1}{g_{m2}}$$`,
      why: md`$C_{gd1}$ lands on node $X$, the low-resistance source of $M_2$, instead of the output. The Miller factor drops from $1 + g_mR_L$ to about 2.` },
  ];

  // Exam 2's deck, folded in under its own piles
  const E2C = (window.E2CARDS && window.E2CARDS.CARDS) || [];
  E2C.forEach((c) => CARDS.push(Object.assign({}, c, { id: `e2:${c.id}`, cat: `m-${c.cat}` })));

  // ---------------------------------------------------------------- the widget (the Exam 2 deck's, with piles and its own key)
  const KEY = 'ece342.cards.e3.v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } };
  const KNOWN = 2;
  const figHtml = (c) => (c.fig ? `<figure class="fig">${Schem.render(c.fig, { maxW: 360 })}</figure>` : '');
  const E3CATS = ['bimp', 'bstage', 'bdc', 'bode', 'hf', 'octc'];

  function init(el) {
    const st = Object.assign({ box: {}, cats: E3CATS.concat('m-imp', 'm-stage') }, load());
    const R = Engine.rich, M = Engine.renderMath;
    let queue = [], cur = null, shown = false, roundTotal = 0;
    const inDeck = () => CARDS.filter((c) => st.cats.includes(c.cat));
    const box = (c) => st.box[c.id] || 0;
    el.innerHTML = `
      <div class="fc">
        <div class="fc-chips">${Object.entries(CATS).map(([k, v]) => `<button type="button" class="fc-chip" data-cat="${k}">${v} <span>${CARDS.filter((c) => c.cat === k).length}</span></button>`).join('')}</div>
        <div class="fc-stats"><div class="fc-bar"><span class="k"></span><span class="l"></span></div><p class="fc-count"></p></div>
        <div class="fc-stage"></div>
        <p class="fc-foot"><button type="button" class="btn subtle fc-all">Study all cards again</button><button type="button" class="btn subtle fc-reset">Reset the deck</button><span class="fc-keys">Keys: Space shows the answer, ← missed, → got it</span></p>
      </div>`;
    const stage = el.querySelector('.fc-stage');
    function stats() {
      const d = inDeck();
      const k = d.filter((c) => box(c) >= KNOWN).length, l = d.filter((c) => box(c) > 0 && box(c) < KNOWN).length;
      el.querySelector('.fc-bar .k').style.width = `${(100 * k) / Math.max(d.length, 1)}%`;
      el.querySelector('.fc-bar .l').style.width = `${(100 * l) / Math.max(d.length, 1)}%`;
      el.querySelector('.fc-count').innerHTML = `<b>${k}</b> known · <b>${l}</b> learning · <b>${d.length - k - l}</b> new <span class="fc-dim">(of ${d.length} cards in the selected piles)</span>`;
      el.querySelectorAll('.fc-chip').forEach((b) => b.classList.toggle('on', st.cats.includes(b.dataset.cat)));
    }
    function newRound(all) {
      const d = inDeck();
      const pool = all ? d : d.filter((c) => box(c) < KNOWN);
      queue = [0, 1, 2].flatMap((b) => U.shuffle(pool.filter((c) => Math.min(box(c), 2) === b)));
      roundTotal = queue.length;
      next();
    }
    function next() {
      stats();
      cur = queue.shift();
      shown = false;
      if (!cur) {
        const d = inDeck(), k = d.filter((c) => box(c) >= KNOWN).length;
        stage.innerHTML = `<div class="fc-card fc-donecard"><h3>${k === d.length ? 'Every card in these piles is known.' : 'Round done.'}</h3><p>${k} of ${d.length} known. ${k === d.length ? 'Shuffle the whole deck once more, or add piles above. Tomorrow, run it again from the top.' : 'Start the next round: it deals only the cards you have not yet got twice in a row.'}</p><p><button type="button" class="btn primary fc-next">${k === d.length ? 'Shuffle all again' : 'Next round'}</button></p></div>`;
        stage.querySelector('.fc-next').addEventListener('click', () => newRound(k === d.length));
        return;
      }
      const c = cur, n = roundTotal - queue.length;
      stage.innerHTML = `
        <div class="fc-card">
          <p class="fc-meta"><span>${CATS[c.cat]}</span><span>${n} / ${roundTotal}${box(c) ? ` · ${box(c) >= KNOWN ? 'known' : 'got it once'}` : ''}</span></p>
          <h3 class="fc-t">${Engine.mdToHtml(c.t).replace(/^<p>|<\/p>$/g, '')}</h3>
          ${figHtml(c)}
          <div class="fc-q">${R(c.q)}</div>
          ${c.ex ? `<div class="fc-try"><input class="ans" type="text" autocomplete="off" spellcheck="false" placeholder="Optional: type it first, e.g. rpi + (beta+1)*RE" aria-label="Type your answer"><button type="button" class="btn fc-chk">Check</button><span class="fc-res" aria-live="polite"></span></div>` : ''}
          <p class="fc-actions"><button type="button" class="btn primary fc-flip">Show answer</button></p>
          <div class="fc-back" hidden>
            <div class="fc-a">${R(c.a)}</div>
            <div class="fc-why"><span>Why</span>${R(c.why)}</div>
            <p class="fc-grade"><button type="button" class="btn fc-miss">← Missed it</button><button type="button" class="btn primary fc-got">Got it →</button></p>
          </div>
        </div>`;
      stage.querySelector('.fc-flip').addEventListener('click', flip);
      stage.querySelector('.fc-miss').addEventListener('click', () => grade(false));
      stage.querySelector('.fc-got').addEventListener('click', () => grade(true));
      const chk = stage.querySelector('.fc-chk');
      if (chk) {
        const inp = stage.querySelector('.fc-try input');
        const run = () => {
          const v = inp.value.trim(), res = stage.querySelector('.fc-res');
          if (!v) { res.textContent = ''; return; }
          const r = Expr.checkExpr(v, c.ex.expr, c.ex);
          res.className = `fc-res ${r.ok ? 'good' : 'bad'}`;
          res.textContent = r.ok ? 'Equivalent. ✓' : (r.err || r.msg || 'Not equivalent.');
        };
        chk.addEventListener('click', run);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } e.stopPropagation(); });
      }
      M(stage);
    }
    function flip() {
      if (!cur || shown) return;
      shown = true;
      const back = stage.querySelector('.fc-back');
      back.hidden = false;
      stage.querySelector('.fc-actions').hidden = true;
      M(back);
    }
    function grade(ok) {
      if (!cur || !shown) return;
      if (ok) st.box[cur.id] = Math.min(box(cur) + 1, KNOWN);
      else { st.box[cur.id] = 0; queue.splice(Math.min(3, queue.length), 0, cur); roundTotal++; }
      save(st);
      next();
    }
    el.querySelectorAll('.fc-chip').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.cat;
      st.cats = st.cats.includes(k) ? st.cats.filter((x) => x !== k) : st.cats.concat(k);
      if (!st.cats.length) st.cats = [k];
      save(st);
      newRound(false);
    }));
    el.querySelector('.fc-all').addEventListener('click', () => newRound(true));
    el.querySelector('.fc-reset').addEventListener('click', () => { st.box = {}; save(st); newRound(false); });
    const onKey = (e) => {
      if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; }
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === ' ' || e.key === 'Enter') { if (cur && !shown) { e.preventDefault(); flip(); } }
      else if (e.key === 'ArrowLeft') grade(false);
      else if (e.key === 'ArrowRight') grade(true);
    };
    document.addEventListener('keydown', onKey);
    newRound(false);
  }

  const mine = CARDS.filter((c) => !c.cat.startsWith('m-'));
  const listMd = E3CATS.map((k) => `## ${CATS[k]}\n\n` + mine.filter((c) => c.cat === k).map((c) => `${c.fig ? `[[fig:${c.id}]]\n\n` : ''}**${c.t}.** ${c.q}\n\n${c.a}\n\n*Why:* ${c.why}`).join('\n\n---\n\n')).join('\n\n');
  const listFigs = {};
  mine.forEach((c) => { if (c.fig) listFigs[c.id] = { fig: c.fig, opts: { maxW: 340 } }; });

  E3.lesson('e3-cardsu', {
    id: 'e3-cards', title: 'Flashcards: BJT, frequency and every MOSFET stage', kind: 'review', sub: `${mine.length} Exam 3 cards plus the ${E2C.length} Exam 2 cards, spaced repetition`,
    steps: [
      C.R(md`
        Look at the circuit, say the answer out loud (or type it: the box checks any equivalent form), then flip and grade yourself honestly. The piles at the top are topics: the Exam 3 piles and the two most-missed Exam 2 piles (MOS impedances and stages) start switched on; tap any pile to add or remove it.

        "Missed it" puts the card back a few cards later. "Got it" twice in a row, across rounds, makes it *known*. Each round deals only what is not known yet, least-known first. Progress stays in this browser.
      `),
      C.W('<div class="fc-host"></div>', (el) => init(el.querySelector('.fc-host'))),
      C.R(md`Prefer to read them? [Every Exam 3 card with its answer](#/l/e3-cardlist) · [every Exam 2 card](#/l/e2-cardlist).`),
    ],
  });
  E3.lesson('e3-cardsu', {
    id: 'e3-cardlist', title: 'Every Exam 3 card, answers showing', kind: 'read', sub: 'The deck as one page, for reading',
    steps: [{ t: 'read', md: listMd, figs: listFigs }],
  });
  window.E3CARDS = { CARDS, CATS };
})();

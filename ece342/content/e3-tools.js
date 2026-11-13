/* Exam 3 tools (loaded last among the content files): the Exam 3 sheet (#/sheet), mixed practice (#/quiz), the concept
   bank, the both-exams mix, and the clean-up of empty units. Generators are found by name prefix, so every e3_*
   drill any unit file registers lands in the mixes automatically. */
(function () {
  'use strict';
  const { R, G } = C;
  const L = (l) => E3.lesson('e3-xu', l);

  L({
    id: 'e3-sheet', title: 'Exam 3 sheet: everything to memorise', kind: 'read', sub: 'BJT DC and model, every terminal and stage for both devices, Bode rules, poles, Miller, time constants',
    steps: [
      R(md`
        ### The read, before any algebra

        1. **Arrow** = source/emitter. N-type: bottom, pointing out. P-type: **top**, pointing in, near the supply.
        2. **Small-signal picture**: rails and held nodes to ground, current sources open, big capacitors shorted.
        3. **Each gate/base**: held → current source / small resistor at its source; driven → input device; tied to its drain/collector → diode ($1/g_m$).
        4. **In, out, common**: in at gate/base + out at drain/collector = CS/CE; in at source/emitter with gate/base held = CG/CB; out at source/emitter = follower.
        5. **Each node**: $R_{UP}\parallel R_{DN}$ (supply is ground), smallest wins. $A_v = -G_MR_{out}$.
        6. **Each capacitor**: node to ground sees the node; a bridge sees $R_{left} + R_{right} + G_mR_{left}R_{right}$.

        ### BJT: DC

        $I_C = I_Se^{V_{BE}/V_T}$, $I_C = \beta I_B$, $I_E = (\beta + 1)I_B$, $\alpha = \beta/(\beta + 1)$. Forward active: $V_{BE}\approx0.7\,\text{V}$, $V_C\ge V_B$. Saturation: $V_{CE}\approx0.2\,\text{V}$. PNP: flip everything ($V_{EB}$, $V_C\le V_B$). Base resistor and emitter resistor: $I_B = \dfrac{V_{BB} - 0.7}{R_B + (\beta + 1)R_E}$. Capacitors are open at DC.

        ### BJT: small-signal model

        $g_m = I_C/V_T$ (**40 mS per mA**), $r_\pi = \beta/g_m$ (2.5 kΩ at 1 mA, $\beta = 100$), $r_o = V_A/I_C$. Hybrid-$\pi$: $r_\pi$ base–emitter, $g_mv_\pi$ and $r_o$ collector–emitter. Same model for NPN and PNP. MOSFET: $g_m = 2I_D/V_{ov}$, gate open.

        ### What each terminal looks like

        | Looking into | MOSFET | BJT |
        |---|---|---|
        | gate / base | $\infty$ | $r_\pi$ |
        | gate / base, $R$ under source/emitter | $\infty$ | $r_\pi + (\beta + 1)R$ |
        | drain / collector | $r_{ds}$ | $r_o$ |
        | drain / collector, $R$ under source/emitter | $r_{ds} + R + g_mr_{ds}R$ | $r_o[1 + g_m(R\parallel r_\pi)] + R\parallel r_\pi$ (max $\approx\beta r_o$) |
        | source / emitter (gate/base held) | $\tfrac{1}{g_m}\parallel r_{ds}$ | $\tfrac{r_\pi}{\beta + 1}\approx\tfrac1{g_m}$ |
        | source / emitter, $R$ at gate/base | $\approx\tfrac{1}{g_m}$ | $\dfrac{r_\pi + R}{\beta + 1}$ |
        | source / emitter, $R$ at the drain / collector | $\dfrac{r_{ds} + R}{1 + g_mr_{ds}}$ | still $\approx\tfrac{1}{g_m}$ while $R\ll r_o$ |
        | diode | $\approx\tfrac1{g_m}$ | $\approx\tfrac1{g_m}$; with $R_B$ collector→base: $\dfrac{R_B + r_\pi}{\beta + 1}$ |
        | cascode | $\approx g_{m2}r_{ds2}r_{ds1}$ | $\approx g_{m2}r_{o2}(r_{o1}\parallel r_{\pi2})\approx\beta r_{o2}$ |

        **The $(\beta + 1)$ elevator:** up into the base, multiply; down into the emitter, divide.

        ### Stages ($A_v = -G_MR_{out}$, $r_o\to\infty$ unless shown)

        | Stage | MOSFET | BJT |
        |---|---|---|
        | CS / CE | $-g_m(R_D\parallel r_{ds})$, $R_{in} = \infty$ | $-g_m(R_C\parallel r_o)$, $R_{in} = r_\pi$; with $R_B$: $\times\dfrac{r_\pi}{r_\pi + R_B}$ |
        | degenerated | $-\dfrac{g_mR_D}{1 + g_mR_S}$ | $G_M = \dfrac{g_m}{1 + \frac{\beta + 1}{\beta}g_mR_E}$, $A_v\approx-\dfrac{R_C}{1/g_m + R_E}$, $R_{in} = r_\pi + (\beta + 1)R_E$ |
        | CG / CB | $+\dfrac{R_D}{R_S + 1/g_m}$ | $+\dfrac{\beta R_C}{R_B + r_\pi + (\beta + 1)R_E}$, $R_{in} = R_E + \dfrac{R_B + r_\pi}{\beta + 1}$ |
        | follower | $\dfrac{g_mR_S}{1 + g_mR_S}$, $R_{out}\approx\tfrac1{g_m}$ | $\dfrac{(\beta + 1)R_E}{R_B + r_\pi + (\beta + 1)R_E}$, $R_{out} = R_E\parallel\dfrac{r_\pi + R_B}{\beta + 1}$ |
        | active load | $-g_{m1}(r_{ds1}\parallel r_{ds2})$ | $-g_{m1}(r_{o1}\parallel r_{o2})$ |

        Between stages: the next stage's $R_{in}$ loads this stage's output. **A base loads, a gate does not.**

        ### Bode plots

        $H(s) = A_{dc}\dfrac{\prod(1 + s/\omega_z)}{\prod(1 + s/\omega_p)}$, $s = j\omega$, $|H|_{dB} = 20\log_{10}|H|$ ($\times10 = 20$ dB, $\times2 = 6$ dB, $\sqrt2 = 3$ dB). Each pole: slope $-20$ dB/dec after $\omega_p$ ($-3$ dB at it); phase $-90°$ spread over $0.1\omega_p$ to $10\omega_p$, $-45°$ at $\omega_p$. Each zero: $+20$ dB/dec, $+90°$. Right-half-plane zero $(1 - s/\omega_z)$: magnitude up, phase **down**. $A_{dc} < 0$: $+180°$.

        ### Poles, Miller

        Capacitors: BJT $C_\pi = C_b + C_{je}$, $C_\mu$; MOSFET $C_{gs}$, $C_{gd}$, $C_{db}$, $C_{sb}$. One pole per node: $\omega_p = 1/(R_{node}C_{node})$. Miller: $Z_1 = \dfrac{Z_F}{1 - A_v}$, $Z_2 = \dfrac{Z_F}{1 - 1/A_v}$; a capacitor across $-A$ looks like $(1 + A)C_F$ at the input.

        CS (CE: $R_S\to R_S\parallel r_\pi$, $C_{gs}\to C_\pi$, $C_{gd}\to C_\mu$): $\omega_{p,in} = \dfrac{1}{R_S[C_{gs} + (1 + g_mR_L)C_{gd}]}$, $\;\omega_{p,out} = \dfrac{1}{R_L[C_L + (1 + \frac{1}{g_mR_L})C_{gd}]}$, zero $g_m/C_{gd}$ (right half plane). Exact: $\omega_{p1}\approx\dfrac{1}{(1 + g_mR_L)C_{gd}R_S + R_SC_{gs} + R_L(C_{gd} + C_L)}$.

        ### Open-circuit time constants

        Short $v_{in}$; for each capacitor remove the others and find $R_{jo}$; $\omega_{-3\text{dB}}\approx1/\sum R_{jo}C_j$ (pessimistic: two equal poles give $0.644/\tau$, the estimate $0.5/\tau$).

        | Capacitor | CS | CE | Degenerated CS | CG | Follower |
        |---|---|---|---|---|---|
        | $C_{gs}$ / $C_\pi$ | $R_S$ | $R_S\parallel r_\pi$ | $\dfrac{R_G + R_S}{1 + g_mR_S}$ | $R_S\parallel\tfrac{1}{g_m}$ | $\dfrac{R_S + R_L}{1 + g_mR_L}$ |
        | $C_{gd}$ / $C_\mu$ | $R_S + R_L + g_mR_SR_L$ | $R' + R_L + g_mR'R_L$ | $R_G + R_L + \tfrac{g_m}{1 + g_mR_S}R_GR_L$ | $R_L$ | $R_S$ |
        | $C_L$ | $R_L$ | $R_L$ | $R_L$ | $R_L$ | $R_L\parallel\tfrac1{g_m}$ |

        ($R' = R_S\parallel r_\pi$.) Cascode: $C_{gd1}$ sees $R_S(1 + g_{m1}/g_{m2}) + 1/g_{m2}$: the Miller factor falls to about 2.

        Exam 2's [stage sheet](#/l/e2-sheet) has every MOSFET result in more detail.
      `),
    ],
  });

  // the book's drills are named bk_* (some writers used bk8_*, bk9_*); the Exam 3 units' e3_*
  const E3G = Object.keys(GENS).filter((k) => /^(e3|bk\d*)_/.test(k));
  const E2G = ['e2_updn', 'e2_k', 'e2_stage', 'e2_gm', 'e2_chain', 'e2_sign', 'e2_look'].filter((k) => GENS[k]);
  const E3U = ['e3start', 'e3u10', 'e3u11', 'e3u12', 'e3u13', 'e3u14', 'e3u15'].concat(COURSE.units.filter((u) => /^bk\d/.test(u.id)).map((u) => u.id));
  if (E3G.length) {
    L({
      id: 'e3-mix', title: 'Mixed practice: every drill in the book and the units', kind: 'review', sub: `Randomized drills (${E3G.length} kinds), mixed`,
      steps: [
        R(md`New circuits and numbers every time, every Exam 3 skill mixed: BJT bias, impedances, stage gains, Bode plots, poles, Miller and time constants. Ten in a row without opening a solution completes it. For one-tap recognition use the [gym](#/gym); for recall, the [flashcards](#/cards).`),
        G(E3G[0], { need: 10, pool: E3G }),
      ],
    });
    L({
      id: 'e3-mix2', title: 'Both exams mixed: MOSFET and BJT, low and high frequency', kind: 'review', sub: 'Exam 2 and Exam 3 drills in one stream',
      steps: [
        R(md`Exam 2's drills (node impedances, the K rule, stage gains, chains, "which end is which") mixed with every Exam 3 drill. This is the "review both at once" button: if a MOSFET item stumps you, the matching Exam 2 unit is still right there on the study path.`),
        G(E3G[0], { need: 12, pool: E3G.concat(E2G, E2G) }),
      ],
    });
  }
  L({
    id: 'e3-bank', title: 'Concept questions', kind: 'quiz', sub: 'Every multiple-choice prediction from the Exam 3 units, shuffled',
    steps: [
      R(md`Every "predict before you read" question from the Exam 3 units, served at random with the options shuffled. No repeats until the pool runs out. [The same for Exam 2](#/l/e2-bank).`),
      G('concept', { need: 10, units: E3U }),
    ],
  });

  COURSE.units = COURSE.units.filter((u) => u.lessons.length);
})();

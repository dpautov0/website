/* Exam 2 tools (loaded last): the stage sheet (#/sheet), mixed practice (#/quiz), the concept bank; then drops units
   that have no lessons. */
(function () {
  'use strict';
  const { R, G } = C;
  const F = window.E2F;

  E2.lesson('e2-xu', {
    id: 'e2-sheet', title: 'Stage sheet: everything to memorise', kind: 'read', sub: 'The formula sheet, and the results it leaves out',
    steps: [
      R(md`
        ### What the exam gives you
        The Exam 2 formula sheet has only: $V_{ov}$ for NMOS and PMOS, the square law in saturation and triode, the diode law and $r_d = V_T/I_{D0}$, and $g_m = 2I_D/V_{ov}$. **Every result below is yours to bring.** Course parameters (printed on the cover): $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\mu_pC_{ox} = 50\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$, $|V_{TP}| = 1\,\text{V}$ ($V_T$ alone is the diode's thermal voltage). The lectures name the controlling voltage $v_x$: $g_mv_x$ with $v_x = v_{gs}$.

        ### The model
        $i_d = g_mv_{gs} + v_{ds}/r_{ds}$ (drain → source), **NMOS and PMOS alike**. Gate current zero.
        $$g_m = \frac{2I_D}{V_{ov}} = \mu C_{ox}\frac{W}{L}V_{ov} = \sqrt{2\mu C_{ox}\frac{W}{L}I_D}$$
        Small-signal circuit: $V_{DD}$ and bias voltages → ground; DC current source → open; $\infty$ capacitor → short. A gate shorted to its source with a wire is **off** (open); through a big capacitor it is $r_{ds}$.

        ### Terminal impedances
        | Looking into | Condition | Result | $g_mr_{ds}\gg1$ |
        |---|---|---|---|
        | gate | always | $\infty$ | |
        | drain | gate, source at incr. ground | $r_{ds}$ | |
        | source | gate, drain at incr. ground | $\tfrac1{g_m}\parallel r_{ds}$ | $\tfrac1{g_m}$ |
        | diode (G = D), NMOS or PMOS | | $\tfrac1{g_m}\parallel r_{ds}$ | $\tfrac1{g_m}$ |
        | diode on $R_S$ | | $R_S + \tfrac1{g_m}\parallel r_{ds}$ | $R_S + \tfrac1{g_m}$ |
        | drain, $R_S$ in source | gate held | $r_{ds} + R_S + g_mr_{ds}R_S$ | $r_{ds}(1 + g_mR_S)$ |
        | source, $R_D$ on drain | gate held | $\dfrac{r_{ds} + R_D}{1 + g_mr_{ds}}$ | $\tfrac1{g_m} + \tfrac{R_D}{g_mr_{ds}}$ |
        | source, ideal current source on drain | gate held | $\infty$ | |
        | drain, gate moves $Kv_x$ | $R_S$ in source | $\dfrac{r_{ds} + R_S + g_mr_{ds}R_S}{1 + g_mr_{ds}K}$ | $\dfrac{R_S + 1/g_m}{K}$ |
        | cascode drain | both gates held | $r_{ds1} + r_{ds2} + g_{m2}r_{ds2}r_{ds1}$ | $g_{m2}r_{ds2}r_{ds1}$ |
        | regulated cascode | booster gain $A = g_{m3}r_{ds3}$ | $r_{ds1} + R + g_{m1}r_{ds1}(1 + A)R$ | $g_{m1}r_{ds1}AR$ |
        | diff pair output, mirror load | gates held, ideal tail | | $r_{ds2}\parallel r_{ds4}$ |
        | diff pair output, current-source loads | gates held, ideal tail | $r_{ds4}\parallel\big[r_{ds2} + (1 + g_{m2}r_{ds2})\tfrac{r_{ds1} + r_{ds3}}{1 + g_{m1}r_{ds1}}\big]$ | $r_{ds4}\parallel 3r_{ds}$ |

        Any node: $R = R_{UP}\parallel R_{DN}\parallel(\text{transistors whose gate the node drives})$.

        ### Amplifier stages ($A_v = -G_MR_{out}$, $G_M$ = short-circuit current pulled down, $R_{out}$ with $v_{in}$ dead)
        | Stage | $G_M$ | $R_{out}$ | $A_v$ (approx.) | $R_{in}$ |
        |---|---|---|---|---|
        | CS, $R_D$ | $g_m$ | $R_D\parallel r_{ds}$ | $-g_m(R_D\parallel r_{ds})$ | $\infty$ |
        | CS, $R_S$ degeneration | $\dfrac{g_m}{1 + (g_m + g_{ds})R_S}$ | $R_D\parallel r_{ds}(1 + g_mR_S)$ | $-\dfrac{g_mR_D}{1 + g_mR_S}\to-\dfrac{R_D}{R_S}$ | $\infty$ |
        | CS, diode load | $g_{m1}$ | $\tfrac1{g_{m2}}\parallel r_{ds1}\parallel r_{ds2}$ | $-\dfrac{g_{m1}}{g_{m2}} = -\sqrt{\dfrac{\mu_1(W/L)_1}{\mu_2(W/L)_2}}$ | $\infty$ |
        | CS, current-source load | $g_{m1}$ | $r_{ds1}\parallel r_{ds2}$ | $-g_{m1}(r_{ds1}\parallel r_{ds2})$ | $\infty$ |
        | CMOS inverter | $g_{m1} + g_{m2}$ | $r_{ds1}\parallel r_{ds2}$ | $-(g_{m1}+g_{m2})(r_{ds1}\parallel r_{ds2})$ | $\infty$ |
        | CG, $R_S$ in series with input | $-\dfrac{1}{R_S + \frac1{g_m}\parallel r_{ds}}$ | $R_D\parallel(r_{ds} + R_S + g_mr_{ds}R_S)$ | $+\dfrac{R_D}{R_S + 1/g_m}$ | $\dfrac{r_{ds}+R_D}{1+g_mr_{ds}}$ |
        | CD (follower), $R_L$ | $-g_m$ | $R_L\parallel\tfrac1{g_m}\parallel r_{ds}$ | $\dfrac{R_L\parallel r_{ds}}{(R_L\parallel r_{ds}) + 1/g_m}$ | $\infty$ |
        | CD on ideal current source | | $\tfrac1{g_m}\parallel r_{ds}$ | $\dfrac{g_mr_{ds}}{1 + g_mr_{ds}}\approx1$ | $\infty$ |
        | cascode, $R_D$ | $\dfrac{g_{m1}r_{ds1}(1 + g_{m2}r_{ds2})}{r_{ds1} + r_{ds2} + g_{m2}r_{ds1}r_{ds2}}\approx g_{m1}$ | $R_D\parallel g_{m2}r_{ds2}r_{ds1}$ | $-g_{m1}R_D$ | $\infty$ |
        | folded cascode | $g_{m1}\dfrac{R_X}{R_X + 1/g_{m4}}$ | $R_D\parallel[r_{ds4} + R_X(1 + g_{m4}r_{ds4})]$ | $-G_MR_{out}$ | $\infty$ |

        ### Methods
        - **$G_MR_{out}$:** short the output for $G_M$ (add every path's current), kill $v_{in}$ for $R_{out}$.
        - **Impedance scaler:** from the drain, source resistances $\times g_mr_{ds}$; from the source, drain resistances $\div g_mr_{ds}$.
        - **Chains:** $A_v = A_1A_2$; compute $v_1$ with the next stage attached (gates are free, sources and diodes are $1/g_m$).
        - **Current division** at a node with a $1/g_m$ branch: the share through it is $\dfrac{R_X}{R_X + 1/g_m}$.
        - **Mirror:** $i_{out} = \dfrac{(W/L)_2}{(W/L)_1}i_{in}$; diode node voltage $i_{in}/g_{m1}$; the copy flows the same way.
        - **Signs:** CS-type stages invert; CG and CD do not; a PMOS gate driven by an inverted copy fights an NMOS driven by the input.

        ### DC
        Same $V_{GS}$ (mirror): $I\propto W/L$. Same current: $V_{ov}\propto1/\sqrt{W/L}$, $g_m\propto\sqrt{W/L}$. PMOS needs $2\times$ the $W/L$. Saturation: NMOS $V_D\ge V_G - V_{TN}$, PMOS $V_D\le V_G + |V_{TP}|$. Diode-connected devices are always saturated. $1\,\text{mA}$ at $0.2\,\text{V}$: $g_m = 10\,\text{mS}$, $1/g_m = 100\,\Omega$.

        A [printable version](stages.html) of this page fits on two sides.
      `),
    ],
  });

  const POOL = ['e2_updn', 'e2_k', 'e2_stage', 'e2_gm', 'e2_chain', 'e2_sign'];
  E2.lesson('e2-xu', {
    id: 'e2-mix', title: 'Mixed practice', kind: 'review', sub: 'Randomized drills from every unit, mixed',
    steps: [
      R(md`New numbers every time, every Exam 2 skill mixed: node impedances, the K rule, single-stage gains, $g_m$ from the bias, two-stage chains and signs. Ten in a row without opening a solution completes it. For symbolic recall, use the [flashcards](#/cards).`),
      G('e2_updn', { need: 10, pool: POOL }),
    ],
  });
  E2.lesson('e2-xu', {
    id: 'e2-bank', title: 'Concept questions', kind: 'quiz', sub: 'Every multiple-choice prediction from Units 6–9, shuffled',
    steps: [
      R(md`Every "predict before you read" question from Units 6–9, served at random with the options shuffled. No repeats until the pool runs out.`),
      G('concept', { need: 10, units: ['e2u6', 'e2u7', 'e2u8', 'e2u9'] }),
    ],
  });

  // one line under each paper on the home page
  const SUB = {
    'e2-p1': 'Short answers, a diode on top of a degenerated drain, a folded cascode',
    'e2-p2': 'Mirror DC bias, cascode and gain-boosted impedances, a gain chain with two paths',
    'e2-p3': 'Cascode-mirror gain, signal through two mirrors, differential-pair impedances',
    'e2-p4': 'Numeric gain with an input divider, $G_M$ with three paths, impedances with mirror feedback',
    'e2-p5': 'Numeric CG gain, diode-degenerated impedances, CMOS inverter stages',
    'e2-mockA': 'Black-box measurements, diode-load and CG gains, cascode on a diode, the K rule, two paths',
    'e2-mockB': 'Mirrors and cascodes at DC, a PMOS cascode, mirror feedback, CG into degenerated CS',
    'e2-mockC': 'Harder: PMOS mirror amplifier, a follower driving a gate, gain-boosted cascode amplifier',
    'e2-hw4': 'CS/CG/CD with degeneration, CMOS inverter amp, a CG-mirror stage, a folded cascode',
    'e2-hw5': 'Nine equivalent resistances: degeneration, diodes, the K rule',
    'e2-hw6': 'Six gains: chains, two paths, mirrors, a differential pair',
  };
  COURSE.units.forEach((u) => u.lessons.forEach((l) => { if (SUB[l.id] && !l.sub) l.sub = SUB[l.id]; }));

  COURSE.units = COURSE.units.filter((u) => u.lessons.length);
  void F;
})();

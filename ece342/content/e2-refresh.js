/* Exam 1 refresher: the five Exam 1 skills Exam 2 is built on, each with what it turns into now. Placed first in
   Unit 6 so it is the "Start" lesson. */
(function () {
  'use strict';
  const { R, G, Q } = C;

  const lesson = {
    id: 'e2-u6-refresh', title: 'Exam 1 refresher (15 minutes)', ref: 'Units 0–4',
    steps: [
      R(md`
        Exam 2 reuses five things from Exam 1. Each section below is the Exam 1 fact, then what it becomes on Exam 2. If one feels shaky, the full Exam 1 unit is under **Exam 1 review** in the sidebar.

        ### 1. Thévenin, Norton and the test source
        Any linear circuit seen from two terminals is $v_{TH}$ in series with $R_{TH}$, or $i_N = v_{TH}/R_{TH}$ in parallel with $R_{TH}$. With **dependent sources**, you cannot just combine resistors: kill the independent sources, apply a test voltage $v_t$, find the current $i_t$, and $R_{TH} = v_t/i_t$. Dependent sources stay in the circuit.

        **On Exam 2:** "resistance looking into a drain/source" is exactly this, with $g_mv_{gs}$ as the dependent source. The $G_MR_{out}$ method is Norton: $G_M$ is the short-circuit current per $v_{in}$, $R_{out}$ is $R_{TH}$, and $A_v = -G_MR_{out}$.

        ### 2. Superposition
        In a linear circuit the response to several sources is the sum of the responses to each one alone.

        **On Exam 2:** when $v_{in}$ reaches the output through two transistors, short the output and add their currents.

        ### 3. Linearization (the diode)
        A nonlinear element near its bias point acts like its slope. The diode: $I_D$ sets $r_d = V_T/I_D$, and small signals see only $r_d$. Total = DC + small change; DC sources become shorts (or opens, for current sources) in the small-signal circuit.

        **On Exam 2:** the same move on the MOSFET. The bias gives $g_m = 2I_D/V_{ov}$ and $r_{ds}$, and the signal circuit is linear.

        ### 4. The MOSFET at DC
        $$V_{ov} = V_{GS} - V_T\ (\text{NMOS}),\quad V_{SG} - |V_T|\ (\text{PMOS}),\qquad I_D = \tfrac12\mu C_{ox}\tfrac{W}{L}V_{ov}^2\ \text{in saturation}$$
        - Course numbers: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $\mu_pC_{ox} = 50$, $|V_T| = 1\,\text{V}$. Precompute $K = \tfrac12\mu C_{ox}\tfrac{W}{L}$: $W/L = 500$ NMOS gives $K = 25\,\text{mA/V}^2$.
        - **Saturated** iff NMOS $V_D \ge V_G - V_T$, PMOS $V_D \le V_G + |V_T|$. "Edge of saturation" is the equality.
        - Gate current is zero, always.

        **On Exam 2:** you only need DC far enough to get $g_m$. Typical: $1\,\text{mA}$ at $V_{ov} = 0.2\,\text{V}$ gives $g_m = 10\,\text{mS}$, $1/g_m = 100\,\Omega$.

        ### 5. Diodes, mirrors and stacks
        - **Diode-connected** (gate tied to drain): always saturated, $V_{GS} = V_T + V_{ov}$.
        - **Mirror** (same $V_{GS}$): $I_2/I_1 = (W/L)_2/(W/L)_1$.
        - **Stack** (same current): $V_{ov}\propto 1/\sqrt{W/L}$, so a $4\times$ wider device needs half the overdrive.
        - KCL at a node where mirrored currents meet a resistor: the resistor carries the difference.

        **On Exam 2:** a diode-connected device is a small-signal resistor $1/g_m$; a mirror copies small-signal current too, $i_{out} = \frac{(W/L)_2}{(W/L)_1}i_{in}$; same current means $g_m \propto \sqrt{W/L}$. Problem 1 can still be a pure DC mirror problem (Practice 2 #1).

        !!key The one-line bridge
        Exam 1 found the bias point. Exam 2 turns the bias into $g_m$ and $r_{ds}$, then uses Exam 1's Thévenin/Norton tools on the linear circuit.
      `),
      Q(md`A circuit contains a dependent source. To find its Thévenin resistance you...`,
        ['kill the independent sources, apply a test source, and take $v_t/i_t$', 'kill every source, dependent ones too, and combine resistors', 'short the output and divide $v_{OC}$ by nothing', 'cannot: Thévenin needs independent sources'], 0,
        [null, 'Dependent sources stay: they are part of the circuit\'s behavior.', '$R_{TH} = v_{OC}/i_{SC}$ works too, but you need both values.', 'Thévenin works for any linear circuit.'],
        md`Dependent sources stay in. This is exactly how every Exam 2 impedance is found, with $g_mv_{gs}$ as the dependent source.`),
      Q(md`An NMOS has $V_G = 2\,\text{V}$, $V_D = 0.8\,\text{V}$, $V_T = 1\,\text{V}$. Is it saturated (assuming it is on)?`,
        ['No: saturation needs $V_D \\ge V_G - V_T = 1\\,\\text{V}$', 'Yes: $V_D > 0$', 'Yes: $V_{GS} > V_T$', 'Cannot tell without $V_S$'], 0,
        [null, 'The test compares $V_D$ with $V_G - V_T$, not with 0.', 'That only says it is on, not which region.', 'The shortcut $V_D \\ge V_G - V_T$ needs no $V_S$.'],
        md`$V_G - V_T = 1\,\text{V} > 0.8\,\text{V}$: triode. The source voltage cancels out of the test.`),
      Q(md`A diode carries $I_D = 1\,\text{mA}$ ($V_T = 25\,\text{mV}$). A MOSFET carries $1\,\text{mA}$ at $V_{ov} = 0.2\,\text{V}$. Compare the diode's $r_d$ with the MOSFET's $1/g_m$.`,
        ['$r_d = 25\\,\\Omega$, $1/g_m = 100\\,\\Omega$', '$r_d = 100\\,\\Omega$, $1/g_m = 25\\,\\Omega$', 'Both $25\\,\\Omega$', 'Both $100\\,\\Omega$'], 0,
        [null, 'Swapped: $r_d = V_T/I_D$, $1/g_m = V_{ov}/(2I_D)$.', '$1/g_m = V_{ov}/(2I_D) = 0.2/0.002$.', '$r_d = 0.025/0.001$.'],
        md`Same idea, the slope at the bias point: $r_d = V_T/I_D = 25\,\Omega$; $g_m = 2I_D/V_{ov} = 10\,\text{mS}$, so $1/g_m = 100\,\Omega$.`),
      Q(md`$M_1$ ($1X$, diode-connected) carries $100\,\mu\text{A}$. $M_2$ ($4X$) shares its gate and source. What does $M_2$ carry, and how does its $V_{ov}$ compare with $M_1$'s?`,
        ['$400\\,\\mu\\text{A}$, same $V_{ov}$', '$400\\,\\mu\\text{A}$, half the $V_{ov}$', '$100\\,\\mu\\text{A}$, half the $V_{ov}$', '$200\\,\\mu\\text{A}$, same $V_{ov}$'], 0,
        [null, 'Half the overdrive is the rule for the same *current*. Here the $V_{GS}$ is shared.', 'That is a series stack, not a mirror.', 'Current scales with $W/L$, not its square root.'],
        md`A mirror shares $V_{GS}$, so the same $V_{ov}$, and current scales with size: $4\times100 = 400\,\mu\text{A}$.`),
      G('mos_region', { need: 2 }),
      G('mirror_ratio', { need: 2 }),
      G('thev_dep', { need: 1 }),
    ],
  };
  E2.unit('e2u6').lessons.unshift(lesson);
})();

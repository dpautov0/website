/* Exam 2, part C — metal–semiconductor contacts (5.7) and junctions with light: photodiodes, solar cells, LEDs and
   lasers (Ch. 8). Topics 21–22. Same lesson shape as e2-a.js; e2-tools.js assembles them. */
(function () {
  'use strict';
  const { R, RF, Q } = C;

  // ---------------------------------------------------------------- figures
  // metal (x < 0) on n-Si: energies from E_F; rectifying bends up by V0, ohmic bends down
  function msFig(rect) {
    const W = 1, top = rect ? 0.744 : -0.15, bulk = 0.205;
    const Ec = (x) => (rect ? bulk + top * Math.max(0, 1 - x / W) ** 2 : bulk + top * Math.exp(-x / 0.25));
    return BD.prof({ w: 260, h: 190, x: [-0.6, 2.2], y: [-1.15, 1.15], xl: 'x', yl: 'E', vlines: [[0, '']], xt: [[-0.3, '\\text{metal}'], [1.3, '\\text{n-Si}']],
      curves: [{ f: () => 0, lab: 'E_F', labAt: 2.2, dy: 4 }, { f: Ec, from: 0, to: 2.2, lab: 'E_c', labAt: 2.2, dy: -6 }, { f: (x) => Ec(x) - 1.12, from: 0, to: 2.2, lab: 'E_v', labAt: 2.2, dy: -6 }] });
  }
  // illuminated diode: I = I0(e^{V/0.06} − 1) − Iop, with the max-power point
  function solarFig() {
    const I0 = 1e-5, Iop = 1, Vt = 0.05, Voc = Vt * Math.log(1 + Iop / I0);
    let best = [0, 0, 0];
    for (let v = 0; v < Voc; v += Voc / 400) { const i = I0 * (Math.exp(v / Vt) - 1) - Iop; if (-i * v > best[2]) best = [v, i, -i * v]; }
    return BD.prof({ w: 340, h: 220, x: [-0.3, 0.75], y: [-1.25, 0.6], xl: 'V', yl: 'I', zero: true, xt: [[Voc, 'V_{oc}']], yt: [[-Iop, '-I_{sc}']],
      curves: [{ f: (v) => I0 * (Math.exp(v / Vt) - 1) - Iop, lab: '\\text{lit}', labAt: 0.6, dx: -34, dy: -2 }, { f: (v) => I0 * (Math.exp(v / Vt) - 1), cls: 'dash', lab: '\\text{dark}', labAt: 0.55, dx: -38, dy: 0 },
        { pts: [[0, best[1]], [best[0], best[1]], [best[0], 0]], cls: 'dim' }],
      pts: [{ x: best[0], y: best[1], lab: '(V_m, I_m)', anchor: 'tl' }] });
  }

  // ======================================================================== Topic 21
  const T21 = {
    id: 't21-ms', topic: 21, sec: '5.7', title: 'Metal–semiconductor contacts: Schottky or ohmic?',
    why: md`Every device needs wires, and where a metal touches a semiconductor you get either a **diode** (a Schottky barrier) or a **resistor** (an ohmic contact). Which one is decided by three numbers: the metal's work function, the semiconductor's electron affinity, and its doping. Objective 10 asks you to predict it. One table and one band picture do it.`,
    build: [
      R(md`
        ### Work function and electron affinity

        Measure energies from the **vacuum level** (the energy of an electron just free of the material):

        - **Work function** $q\phi$: vacuum level down to $E_F$. For a metal, $\phi_m$ is a fixed property (Al ≈ 4.3 V, Au ≈ 5.1 V, Pt ≈ 5.6 V).
        - **Electron affinity** $q\chi$: vacuum level down to $E_c$. Fixed for a semiconductor (Si: $\chi = 4.05$ V).
        - The semiconductor's work function depends on doping: $\phi_s = \chi + (E_c - E_F)/q$. n-type: $E_F$ near $E_c$, $\phi_s$ just above $\chi$. p-type: $E_F$ near $E_v$, $\phi_s$ near $\chi + E_g/q$.

        **On contact, the Fermi levels line up**, exactly as in a p-n junction. Electrons flow from the side with the higher $E_F$ (the **smaller** work function) to the other side, until equilibrium. The metal has so many electrons that its side barely changes; all the bending happens in the semiconductor.
      `),
      Q(md`**Predict first.** A metal with $\phi_m = 5.0$ V touches n-Si with $\phi_s = 4.25$ V. Which way do electrons flow, and what does the semiconductor surface become?`,
        ['semiconductor → metal; the surface is depleted of electrons', 'metal → semiconductor; electrons accumulate at the surface', 'no flow: the Fermi levels are already aligned', 'metal → semiconductor; the surface is depleted'], 0,
        [null, md`Electrons go to the side with the larger work function (lower $E_F$): the metal.`, md`They differ by 0.75 eV.`, 'Electrons leaving the semiconductor deplete it, not the other way.'],
        md`The semiconductor's $E_F$ is 0.75 eV higher, so its electrons drop into the metal, leaving ionized donors: a depletion region, bands bending up.`),
      RF(md`
        ### Case 1: n-type, $\phi_m > \phi_s$: a rectifying (Schottky) contact

        Electrons leave the semiconductor; positive donors are left behind in a depletion region of width $W$ (just like the n side of a p⁺-n junction, with the metal playing p⁺). The bands bend **up** toward the interface.

        [[fig:ms]]

        Two barriers, seen from two sides:

        - **From the semiconductor:** electrons in the n-Si must climb $qV_0 = q(\phi_m - \phi_s)$ to reach the metal.
        - **From the metal:** electrons in the metal must climb $q\phi_B = q(\phi_m - \chi)$ to get into the semiconductor's conduction band. This one is pinned at the interface and **doesn't change with bias**.

        Apply bias (metal + is forward):

        - **Forward:** the semiconductor-side barrier drops to $q(V_0 - V)$. Electrons pour over into the metal: $\propto e^{qV/kT}$.
        - **Reverse:** the semiconductor-side barrier grows, shutting that flow off. What's left is the small flow from metal to semiconductor over the fixed $\phi_B$: a saturation current $I_0 \propto e^{-q\phi_B/kT}$.

        $$I = I_0\left(e^{qV/kT} - 1\right)$$

        The same diode equation, but the current is **majority carriers** (electrons) going over a barrier into a metal, where they instantly thermalize. **No minority carriers are stored**, so there's no diffusion capacitance and no storage delay: Schottky diodes switch very fast. Their $I_0$ is typically many decades larger than a p-n diode's, so they turn on at ~0.3 V (and leak more in reverse).

        The depletion region behaves exactly like a one-sided junction: $W = \sqrt{2\epsilon(V_0 - V)/qN_d}$, $C_j = \epsilon A/W$.
      `, { ms: PF.row([{ svg: msFig(true), cap: 'n-Si, φm > φs: bands bend up, barrier → rectifying' }, { svg: msFig(false), cap: 'n-Si, φm < φs: bands bend down, accumulation → ohmic' }]) }),
      R(md`
        ### Case 2: n-type, $\phi_m < \phi_s$: an ohmic contact

        Now the metal's $E_F$ is higher, so electrons flow **into** the semiconductor and pile up at its surface (accumulation). The bands bend **down**; there's no barrier for electrons in either direction. Current flows freely both ways: ohmic.

        ### p-type: everything flips

        For p-type the majority carriers are holes, which see barriers upside down:

        - $\phi_m < \phi_s$: electrons flow into the p-Si, recombine with holes, leaving negative acceptors: depletion, a barrier for holes → **rectifying**. Barrier from the metal for holes: $\phi_B = \chi + E_g/q - \phi_m$.
        - $\phi_m > \phi_s$: holes accumulate at the surface → **ohmic**.

        | | $\phi_m > \phi_s$ | $\phi_m < \phi_s$ |
        |---|---|---|
        | **n-type** | rectifying | ohmic |
        | **p-type** | ohmic | rectifying |

        **One-line rule:** the contact rectifies when it **depletes** the majority carriers. n-type is depleted by a metal that "pulls" electrons (large $\phi_m$); p-type by a metal that "pushes" electrons in (small $\phi_m$).
      `),
      Q(md`**Predict first.** Gold ($\phi_m = 5.1$ V) on p-type Si with $\phi_s = 5.0$ V. The contact is…`,
        ['ohmic: φm > φs on p-type accumulates holes', 'rectifying: gold has a large work function', 'rectifying: any metal on p-type is', 'impossible to say'], 0,
        [null, md`A large $\phi_m$ is rectifying on **n**-type, ohmic on p-type.`, 'It depends on the work functions.', 'The table decides it.'],
        md`p-type: $\phi_m > \phi_s$ → ohmic.`),
      R(md`
        ### Real ohmic contacts: tunnel through it

        In practice, surface states often **pin** the Fermi level at the interface, so the barrier height barely depends on which metal you choose. The practical trick for an ohmic contact: **dope the semiconductor very heavily under the contact** (n⁺ or p⁺). The depletion width shrinks as $1/\sqrt{N}$ to a few nm, and carriers **tunnel** straight through the barrier in both directions: a small, linear contact resistance. (That's the n⁺ contact at the end of the narrow-base diode, and the "heavy doping → thin barrier → tunneling" idea is the same physics as Zener breakdown.)
      `),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$\phi_s = \chi + \frac{E_c - E_F}{q} \qquad \text{n-type: } V_0 = \phi_m - \phi_s,\ \phi_B = \phi_m - \chi \qquad \text{p-type: } V_0 = \phi_s - \phi_m,\ \phi_B = \chi + \frac{E_g}{q} - \phi_m$$

        $$I = I_0\left(e^{qV/kT} - 1\right),\ I_0 \propto e^{-q\phi_B/kT} \qquad W = \sqrt{\frac{2\epsilon(V_0 - V)}{qN}}$$

        | | $\phi_m > \phi_s$ | $\phi_m < \phi_s$ |
        |---|---|---|
        | n | rectifying | ohmic |
        | p | ohmic | rectifying |

        Schottky: majority-carrier, no storage, fast, low turn-on, higher leakage. Practical ohmic: heavy doping → tunneling.
      `),
      R(md`
        ### Worked example

        !!graded Problem
          A metal with $\phi_m = 5.0$ V is deposited on Si ($\chi = 4.05$ V, $E_g = 1.12$ eV, $N_c = 2.8\times10^{19}$, $N_v = 1.04\times10^{19}\,\text{cm}^{-3}$) at 300 K. (a) On n-Si with $N_d = 10^{16}$: find $\phi_s$, the contact type, $\phi_B$ and $V_0$. (b) On p-Si with $N_a = 10^{16}$: $\phi_s$ and the contact type. (c) Which metal work function would make a rectifying contact on that p-Si, and what barrier would a $\phi_m = 4.5$ V metal give holes?

        **1. Governing equations.** $E_c - E_F = kT\ln(N_c/N_d)$; $E_F - E_v = kT\ln(N_v/N_a)$; $\phi_s = \chi + (E_c - E_F)/q$; table above.

        **2. Units.** eV ↔ V for one electron.

        **3. Substitute.**
        $$E_c - E_F = 0.0259\ln\frac{2.8\times10^{19}}{10^{16}} = 0.206\,\text{eV} \qquad E_F - E_v = 0.0259\ln\frac{1.04\times10^{19}}{10^{16}} = 0.180\,\text{eV}$$

        **4. Answers.** (a) $\phi_s = 4.05 + 0.21 = 4.26$ V < $\phi_m$: **rectifying**; $\phi_B = 5.0 - 4.05 = 0.95$ V; $V_0 = 5.0 - 4.26 = 0.74$ V. (b) $\phi_s = 4.05 + 1.12 - 0.18 = 4.99$ V; $\phi_m = 5.0 > \phi_s$ on p-type: **ohmic** (barely). (c) Any $\phi_m < 4.99$ V; with 4.5 V, $\phi_B = 4.05 + 1.12 - 4.5 = 0.67$ V for holes.

        !!mistake Common mistakes
          - Using $\phi_m - \phi_s$ for the barrier seen from the metal: that's $\phi_m - \chi$.
          - Applying the n-type rule to p-type.
          - Expecting minority storage (and a storage delay) in a Schottky diode.
      `),
    ],
    qs: [
      Q(md`Why does the reverse current of a Schottky diode saturate?`,
        [md`electrons from the metal must still climb the fixed barrier $\phi_B$, which bias doesn't change`, 'the depletion region blocks all current', 'minority carriers run out', 'the metal runs out of electrons'], 0,
        [null, md`A small current over $\phi_B$ flows.`, 'Schottky current is majority carriers.', 'No.'],
        md`Bias moves the semiconductor side only; the metal-side barrier is pinned.`),
      Q(md`A Schottky diode is preferred over a p-n diode in a fast switching power supply because…`,
        ['it stores no minority charge, so there is no storage delay', 'its reverse leakage is lower', 'its breakdown voltage is higher', 'it has a larger turn-on voltage'], 0,
        [null, 'Leakage is usually **higher**.', 'Not inherently.', 'Lower, which is another advantage.'],
        md`Majority-carrier conduction: nothing to drain when switching off.`),
      Q(md`Increasing the doping under a contact makes it more ohmic because…`,
        ['the depletion region becomes thin enough to tunnel through', 'it lowers the work function of the metal', 'it removes the barrier entirely', 'it increases the minority lifetime'], 0,
        [null, md`$\phi_m$ is a metal property.`, 'The barrier height may stay; it just gets thin.', 'Irrelevant.'],
        md`$W \propto 1/\sqrt{N}$: nanometers at $10^{19}$–$10^{20}$.`),
    ],
  };

  // ======================================================================== Topic 22
  const T22 = {
    id: 't22-opto', topic: 22, sec: '8.1–8.4', title: 'Junctions and light: photodiodes, solar cells, LEDs, lasers',
    why: md`Shine light on a p-n junction and it becomes a **photodetector** (reverse biased) or a **solar cell** (delivering power). Push current through the right one and it becomes an **LED** or a **laser**. Objective 14 asks for $I_{sc}$, $V_{oc}$, $P_{max}$ and the fill factor; the intuition questions ask which quadrant, which way the current flows, and what happens when light, temperature or band gap change.`,
    build: [
      R(md`
        ### Light adds a reverse current

        Uniform light generates $g_{op}$ electron-hole pairs per cm³ per second everywhere. Which ones contribute current?

        - Pairs generated **inside the depletion region** ($W$): the field immediately sweeps the electron to the n side and the hole to the p side.
        - Pairs generated in the **p side within about $L_n$** of the edge: the minority electron diffuses to the edge before recombining, and the field sweeps it across to n.
        - Same on the n side within about $L_p$: holes reach the edge and are swept to p.
        - Pairs generated farther away just recombine where they are.

        Electrons going to n and holes going to p is current flowing from n to p **inside** the device: the **reverse** direction. So the light adds a reverse current

        $$I_{op} = qAg_{op}(L_p + L_n + W) \qquad I = I_{th}\left(e^{qV/kT} - 1\right) - I_{op}$$

        ($I_{th}$ is the dark saturation current, the $I_0$ of before.) The lit I–V is the dark curve shifted straight down by $I_{op}$.
      `),
      Q(md`**Predict first.** A solar cell is short-circuited by a wire and illuminated. Inside the cell, the current flows…`,
        ['from n to p (reverse direction)', 'from p to n (forward direction)', 'nowhere: V = 0 so I = 0', 'alternately both ways'], 0,
        [null, md`Forward current needs forward bias; at short circuit $V = 0$ and only $-I_{op}$ remains.`, md`$I = -I_{op} \ne 0$ at $V = 0$.`, 'Steady light, steady current.'],
        md`The field sweeps photo-electrons to n, photo-holes to p: reverse current, $I_{sc} = I_{op}$ in magnitude.`),
      RF(md`
        ### Two numbers: $I_{sc}$ and $V_{oc}$

        [[fig:sc]]

        **Short circuit** ($V = 0$): $I = -I_{op}$. So $I_{sc} = I_{op}$, proportional to the light.

        **Open circuit** ($I = 0$): the photo-electrons collect on the n side and the photo-holes on the p side, and that charge **forward-biases the junction by itself**. It stops when the forward diode current exactly cancels the photocurrent:

        $$0 = I_{th}\left(e^{qV_{oc}/kT} - 1\right) - I_{op} \quad\Longrightarrow\quad V_{oc} = \frac{kT}{q}\ln\left(1 + \frac{I_{op}}{I_{th}}\right) \approx \frac{kT}{q}\ln\frac{I_{op}}{I_{th}}$$

        $V_{oc}$ is **logarithmic** in the light: 60 mV per decade of intensity. (Streetman also writes it as $\frac{kT}{q}\ln\frac{g_{op}}{g_{th}}$ with $g_{th}$ the equilibrium thermal generation rate, $p_n/\tau_p$ for a p⁺-n; same physics.) It's capped by the contact potential: as $V \to V_0$ the barrier vanishes, so $V_{oc} < V_0 < E_g/q$. Si cells: ~0.5–0.7 V.

        **Quadrants** (I positive in the forward direction):

        | quadrant | V, I | what it is |
        |---|---|---|
        | 1st | V > 0, I > 0 | forward-biased diode (an LED): absorbs power |
        | 3rd | V < 0, I < 0 | **photodiode**: $I \approx -I_{op}$, linear in light, independent of V |
        | 4th | V > 0, I < 0 | **solar cell**: power delivered, $P = -IV > 0$ |
      `, { sc: PF.row([{ svg: solarFig(), cap: 'lit I–V: the dark curve shifted down by I_op; power comes out in the 4th quadrant' }]) }),
      Q(md`**Predict first.** The sunlight on a cell doubles. $I_{sc}$ and $V_{oc}$…`,
        [md`$I_{sc}$ ×2, $V_{oc}$ +18 mV`, md`both ×2`, md`$I_{sc}$ ×2, $V_{oc}$ unchanged`, md`$I_{sc}$ +18 mA, $V_{oc}$ ×2`], 0,
        [null, md`$V_{oc}$ is logarithmic.`, md`It moves by $\frac{kT}{q}\ln 2$.`, 'Backwards.'],
        md`$I_{sc} \propto g_{op}$; $V_{oc}$ gains $\frac{kT}{q}\ln 2 = 18$ mV.`),
      R(md`
        ### Maximum power and the fill factor

        Along the 4th-quadrant curve the delivered power $P = -IV$ is zero at both ends (at short circuit V = 0; at open circuit I = 0) and peaks at $(V_m, I_m)$, the largest rectangle that fits under the curve. The **fill factor** says how square the curve is:

        $$FF = \frac{V_mI_m}{V_{oc}I_{sc}} \qquad P_{max} = FF\cdot V_{oc}I_{sc} \qquad \eta = \frac{P_{max}}{P_{in}}$$

        Typical FF: 0.7–0.85. Sunlight at the ground: ~100 mW/cm² (1000 W/m²). Slide example: $I_{sc}$ = 100 mA, $V_{oc}$ = 0.8 V, FF = 0.7 → $P_{max}$ = 56 mW.

        **Designing a better cell** (and the trade-offs the exam likes):

        - Heavier doping → smaller $I_{th}$ → larger $V_{oc}$, but shorter lifetimes → smaller $L$ → smaller $I_{op}$.
        - Junction near the surface (shallower than $L$), since light is absorbed near the surface.
        - Low series resistance (it kills the fill factor); thin metal fingers to limit shadowing; anti-reflection coating.
        - **Series** connection adds voltages; **parallel** adds currents.
        - **Temperature ↑ → $V_{oc}$ ↓** ($I_{th} \propto n_i^2$).
        - **Band gap:** bigger $E_g$ → bigger $V_{oc}$ but fewer photons absorbed (those with $h\nu < E_g$ pass through) → smaller $I_{sc}$. Best single junction ~1.1–1.4 eV.
      `),
      R(md`
        ### Photodetectors: PIN and avalanche

        A photodiode is run in **reverse bias**: the current is $-I_{op}$, linear in the light, and a wide depletion region collects more and has less capacitance.

        **PIN diode:** an undoped (intrinsic) layer between p and n makes the depletion region wide by design. Most light is absorbed **in** the depletion region, where carriers are swept out by **drift (fast)** instead of diffusing in from the neutral regions (slow). Trade-off: a wider I region absorbs more (sensitivity) but takes longer to cross (transit time), so it's slower. Heterostructure PINs use wide-gap p and n layers so light is absorbed only in the I region.

        **Avalanche photodiode (APD):** biased just below breakdown so each photo-carrier is multiplied ($M = 1/(1 - P)$, topic 19): internal gain, at the cost of noise and needing a high, stable voltage.

        **Quantum efficiency:** electrons out per photon in, $\eta = \frac{I/q}{P/h\nu}$. **Responsivity** $I/P = \eta\frac{q}{h\nu} = \eta\frac{\lambda\,[\mu\text{m}]}{1.24}$ A/W.
      `),
      R(md`
        ### LEDs and lasers (8.2, 8.4): the junction run backwards

        **LED:** forward bias injects minority carriers across the junction; they recombine. In a **direct-gap** material (GaAs, InGaN, AlGaInP) much of that recombination emits a photon with $h\nu \approx E_g$:

        $$\lambda\,[\mu\text{m}] \approx \frac{1.24}{E_g\,[\text{eV}]}$$

        GaAs 1.42 eV → 0.87 μm (infrared); red ~1.9 eV; blue ~2.7 eV. Si is indirect (needs a phonon), so it's a terrible light emitter. Alloys tune the gap (and the color).

        **Laser diode:** at high enough injection the junction reaches **population inversion**: more electrons at the top of the transition than at the bottom, i.e. $F_n - F_p > h\nu$. Then a photon is more likely to cause **stimulated emission** (a copy of itself: same direction, phase and wavelength) than to be absorbed. Add an optical cavity (cleaved mirror facets) for feedback, and above a **threshold current** the light output jumps: the L–I curve has a knee at $I_{th}$, and its slope above threshold is the differential quantum efficiency. Below threshold, a laser diode is just an LED. Laser light is coherent and has a narrow linewidth.
      `),
    ],
    rest: [
      R(md`
        ### The model in brief

        $$I = I_{th}\left(e^{qV/kT} - 1\right) - I_{op} \qquad I_{op} = qAg_{op}(L_p + L_n + W) \qquad I_{sc} = I_{op} \qquad V_{oc} = \frac{kT}{q}\ln\left(1 + \frac{I_{op}}{I_{th}}\right)$$

        $$FF = \frac{V_mI_m}{V_{oc}I_{sc}} \qquad P_{max} = FF\cdot V_{oc}I_{sc} \qquad \eta = \frac{P_{max}}{P_{in}} \qquad \lambda\,[\mu\text{m}] = \frac{1.24}{E_g\,[\text{eV}]}$$

        Light ×10 → $I_{sc}$ ×10, $V_{oc}$ +60 mV. T ↑ → $V_{oc}$ ↓. Photodiode: 3rd quadrant. Solar cell: 4th. LED: 1st.
      `),
      R(md`
        ### Worked example

        !!graded Problem
          A 1 cm² Si p⁺-n solar cell has $L_p = 100\,\mu$m in the n side, $L_n = 2\,\mu$m in the p⁺ side, $W = 1\,\mu$m, and dark saturation current $I_{th} = 1.0\times10^{-11}$ A. Sunlight generates $g_{op} = 2\times10^{19}$ EHP/cm³·s uniformly. Find (a) $I_{sc}$, (b) $V_{oc}$, (c) $P_{max}$ and efficiency for $FF = 0.78$ under 100 mW/cm², (d) $V_{oc}$ if the light doubles.

        **1. Governing equations.** $I_{sc} = qAg_{op}(L_p + L_n + W)$; $V_{oc} = \frac{kT}{q}\ln(1 + I_{op}/I_{th})$; $P_{max} = FF\cdot V_{oc}I_{sc}$.

        **2. Units.** $L_p + L_n + W = 103\,\mu\text{m} = 1.03\times10^{-2}$ cm.

        **3. Substitute.**
        $$I_{sc} = (1.6\times10^{-19}\,\text{C})(1\,\text{cm}^2)(2\times10^{19}\,\text{cm}^{-3}\text{s}^{-1})(1.03\times10^{-2}\,\text{cm}) \qquad V_{oc} = (0.0259\,\text{V})\ln\left(1 + \frac{3.30\times10^{-2}}{10^{-11}}\right)$$

        **4. Answers.** (a) $I_{sc} = 33.0$ mA. (b) $V_{oc} = 0.568$ V. (c) $P_{max} = 0.78 \times 33.0\,\text{mA} \times 0.568\,\text{V} = 14.6$ mW; $\eta = 14.6\%$. (d) $0.568 + 0.018 = 0.586$ V.

        !!mistake Common mistakes
          - Taking $V_{oc} = \frac{kT}{q}\frac{I_{op}}{I_{th}}$ (no log), or using 60 mV per factor of $e$.
          - Forgetting the fill factor: $P_{max} \ne V_{oc}I_{sc}$.
          - Leaving out $W$ (or the diffusion lengths) in $I_{op}$; check units: $g_{op}$ in cm⁻³s⁻¹ × length in cm × area in cm².
          - Sign: the photocurrent is negative (reverse) in the diode convention.
      `),
    ],
    qs: [
      Q(md`Why can't a Si solar cell's $V_{oc}$ reach 1.5 V, no matter how bright the light?`,
        [md`$V_{oc}$ is limited by the contact potential $V_0$, itself below $E_g/q$ = 1.12 V`, 'the cell would break down', 'the fill factor limits it', 'series resistance'], 0,
        [null, 'Breakdown is reverse bias.', 'FF is about power, not voltage.', 'That lowers power, not $V_{oc}$.'],
        md`At $V_{oc} \to V_0$ the barrier that separates the carriers is gone.`),
      Q(md`In $I_{op} = qAg_{op}(L_p + L_n + W)$, carriers generated **far** (≫ L) from the junction…`,
        ['recombine before reaching it and don\'t contribute', 'are swept across by the field', 'contribute half', 'are collected by the contacts'], 0,
        [null, 'The neutral regions have almost no field.', 'No.', 'They recombine first.'],
        md`Only pairs within about a diffusion length of the depletion region get collected.`),
      Q(md`A photodiode for a fast optical link: what helps speed?`,
        ['a PIN structure with light absorbed in the depletion region and a modest reverse bias', 'forward bias', 'a long minority lifetime in the neutral regions', 'a very large area'], 0,
        [null, 'Forward current swamps the signal.', 'Slow diffusion from neutral regions is what you want to avoid.', md`Large area means large $C_j$: slow.`],
        md`Drift is fast, diffusion is slow; a wide depletion region also lowers $C_j$.`),
      Q(md`Which material makes an efficient LED?`,
        ['GaAs (direct gap)', 'Si (indirect gap)', 'Ge (indirect gap)', 'any semiconductor with a large gap'], 0,
        [null, 'Indirect: recombination needs a phonon, so it is mostly non-radiative.', 'Indirect too.', 'The gap must be **direct**.'],
        md`Direct gap: an electron at the conduction-band minimum can drop straight to the valence-band maximum and emit a photon.`),
      Q(md`A laser diode's light output vs current has a sharp knee. Below the knee it behaves like…`,
        ['an LED (spontaneous emission)', 'a reverse-biased photodiode', 'a resistor', 'nothing: no light at all'], 0,
        [null, 'It is forward biased.', 'No.', 'It emits weak spontaneous light.'],
        md`Below threshold, gain hasn't overcome cavity losses: spontaneous emission only.`),
    ],
  };

  C.unit({ id: 'e2-ch5c', exam: 'e2', num: 'Ch. 5', title: 'Metal–semiconductor contacts', lessons: [T21] });
  C.unit({ id: 'e2-ch8', exam: 'e2', num: 'Ch. 8', title: 'Optoelectronic devices', lessons: [T22] });
})();

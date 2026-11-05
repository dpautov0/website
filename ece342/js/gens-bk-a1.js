/* gens-bk-a1.js — randomized drills for the book's Chapters 1 and 2 (writer A1).
   Chapter 1: gain as the slope at a bias point, the square-law and exponential expansions (how small is small), the
   diode's r_d, the two pictures (a current-biased diode attenuator), the test-source method (divider-controlled VCCS,
   shunt feedback), and series/parallel sizes. Chapter 2: regions and the square law, PMOS, r_ds and lambda, g_m three
   ways, the small-signal model (CS gain), PMOS model, and DC bias (source resistor, mirror).
   Every generator returns its random draw in _v; scratchpad A1/check_gens.py recomputes every answer from _v with an
   independent method (nonlinear solves, numerical derivatives, nodal analysis) and found no mismatch. */
(function () {
  'use strict';
  const GENS = window.GENS;
  const f = U.fmt, pick = U.pick;
  const md = String.raw;
  const par = (...r) => 1 / r.reduce((s, x) => s + 1 / x, 0);
  const VT = 0.025;

  // ---------------------------------------------------------------- formatting
  const ohm = (r) => (Math.abs(r) < 1e3 ? `${f(r, 4)}\\,\\Omega` : Math.abs(r) < 1e6 ? `${f(r / 1e3, 4)}\\,\\text{k}\\Omega` : `${f(r / 1e6, 4)}\\,\\text{M}\\Omega`);
  const amp = (i) => (Math.abs(i) < 1e-3 ? `${f(i * 1e6, 4)}\\,\\mu\\text{A}` : `${f(i * 1e3, 4)}\\,\\text{mA}`);
  const volt = (v) => `${f(v, 4)}\\,\\text{V}`;
  const mv = (v) => `${f(v * 1e3, 4)}\\,\\text{mV}`;
  const ms = (g) => `${f(g * 1e3, 4)}\\,\\text{mS}`;
  const kk = (k) => `${f(k * 1e3, 4)}\\,\\text{mA/V}^2`;
  // a resistance answer box in a sensible unit; accepts = other right forms; traps = known slips
  const resAns = (lbl, exact, accepts = [], traps = []) => {
    const a = Math.abs(exact);
    const [unit, s] = a < 1e3 ? ['Ω', 1] : a < 1e6 ? ['kΩ', 1e-3] : ['MΩ', 1e-6];
    const p = { lbl, unit, ans: exact * s };
    const acc = accepts.filter((x) => Math.abs(x - exact) > 0.012 * a);
    if (acc.length) p.accept = acc.map((x) => x * s);
    const good = [exact, ...accepts];
    const t = traps.filter((x) => isFinite(x.v) && good.every((g) => Math.abs(x.v - g) > 0.03 * Math.abs(g)));
    if (t.length) p.traps = t.map((x) => ({ v: x.v * s, msg: x.msg }));
    return p;
  };
  // a current answer box in µA or mA
  const curAns = (lbl, exact, traps = []) => {
    const [unit, s] = Math.abs(exact) < 1e-3 ? ['µA', 1e6] : ['mA', 1e3];
    const t = traps.filter((x) => isFinite(x.v) && Math.abs(x.v - exact) > 0.03 * Math.abs(exact));
    return Object.assign({ lbl, unit, ans: exact * s }, t.length ? { traps: t.map((x) => ({ v: x.v * s, msg: x.msg })) } : {});
  };
  const numAns = (lbl, unit, exact, traps = [], accept = []) => {
    const t = traps.filter((x) => isFinite(x.v) && [exact, ...accept].every((g) => Math.abs(x.v - g) > 0.03 * Math.abs(g)));
    return Object.assign({ lbl, unit, ans: exact }, accept.length ? { accept } : {}, t.length ? { traps: t } : {});
  };
  window.BKA1 = { ohm, amp, volt, mv, ms, kk, resAns, curAns, numAns, par };

  // ---------------------------------------------------------------- figures
  const ampFig = (vdd, rd, vin) => [
    ['rail', [1, -1.2], { n: `V_{DD} = ${vdd}` }],
    ['R', [1, -1.2], [1, 0], { n: 'R_D', s: rd }],
    ['w', [1, 0], [2, 0]], ['term', [2, 0], { n: 'v_{OUT}' }],
    ['nmos', [1, 1]], ['gnd', [1, 2]],
    ['w', [0, 1], [-1, 1], [-1, 1.4]],
    ['Vac', [-1, 1.4], [-1, 2.4], { n: 'v_{in}', side: 'l' }],
    ['V', [-1, 2.4], [-1, 3.4], { n: 'V_{IN}', s: vin, side: 'l' }],
    ['gnd', [-1, 3.4]],
  ];

  // ================================================================ Ch 1.1  gain = slope at the bias point
  GENS.bk_bias_q = () => {
    let k, RD, ov, VDD, ID, VOUT, Av, tries = 0;
    do {
      k = pick([0.5, 1, 2, 4]) * 1e-3;
      RD = pick([2, 2.5, 4, 5, 10, 20]) * 1e3;
      ov = pick([0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8]);
      VDD = pick([3, 5, 5, 10]);
      ID = 0.5 * k * ov * ov;
      VOUT = VDD - ID * RD;
      Av = -k * RD * ov;
      tries++;
    } while ((VOUT < ov + 0.15 || VOUT > VDD - 0.1 || Math.abs(Av) < 1.5 || Math.abs(Av) > 40) && tries < 500);
    const VIN = 1 + ov, vin = pick([5, 10, 20]) * 1e-3;
    const out = Math.abs(Av) * vin;
    return {
      fig: ampFig(`${VDD}\\,\\text{V}`, ohm(RD), volt(VIN)),
      q: md`The transistor carries $I_D = \tfrac12k(V_{IN} - V_{TN})^2$ with $k = ${kk(k)}$ and $V_{TN} = 1\,\text{V}$ (it stays in saturation). $V_{DD} = ${VDD}\,\text{V}$, $R_D = ${ohm(RD)}$, and the gate is biased at $V_{IN} = ${volt(VIN)}$ with a $${f(vin * 1e3)}\,\text{mV}$-peak signal on top. Find the bias current, the DC output, the small-signal gain $A_v = v_{out}/v_{in}$ (the slope of the transfer curve at the bias point) and the output amplitude.`,
      parts: [
        curAns('I_D', ID, [{ v: 2 * ID, msg: 'You dropped the $\\tfrac12$ in front of $k$.' }]),
        numAns('V_{OUT}', 'V', VOUT, [{ v: ID * RD, msg: 'That is the drop across $R_D$. The output is $V_{DD}$ minus that drop.' }]),
        numAns('A_v', 'V/V', Av, [{ v: VOUT / VIN, msg: 'That is $V_{OUT}/V_{IN}$, a ratio of totals. The gain is the slope at the bias point.' }, { v: Av / 2, msg: 'The derivative of $\\tfrac12(\\cdot)^2$ is $(\\cdot)$: the $\\tfrac12$ cancels, so $A_v = -kR_D(V_{IN} - V_{TN})$.' }]),
        numAns('|v_{out}|\\ \\text{peak}', 'mV', out * 1e3, [{ v: vin * 1e3, msg: 'That is the input amplitude. Multiply by $|A_v|$.' }]),
      ],
      hints: [md`Excess gate voltage: $V_{IN} - V_{TN} = ${volt(ov)}$.`, md`Slope of $V_{OUT} = V_{DD} - \tfrac12kR_D(V_{IN} - V_{TN})^2$: differentiate, giving $-kR_D(V_{IN} - V_{TN})$.`],
      sol: md`
1. Excess gate voltage: $V_{IN} - V_{TN} = ${f(VIN)} - 1 = ${volt(ov)}$.
2. Current: $I_D = \tfrac12(${kk(k)})(${f(ov)}\,\text{V})^2 = ${amp(ID)}$.
3. Output: $V_{OUT} = V_{DD} - I_DR_D = ${VDD} - (${amp(ID)})(${ohm(RD)}) = ${VDD} - ${f(ID * RD)} = ${volt(VOUT)}$. It is above $V_{IN} - V_{TN} = ${volt(ov)}$, so the transistor is in saturation, as stated.
4. Gain (slope at $Q$): $A_v = -kR_D(V_{IN} - V_{TN}) = -(${kk(k)})(${ohm(RD)})(${volt(ov)}) = ${f(Av)}$.
5. Output amplitude: $|A_v|\,v_{in} = ${f(Math.abs(Av))}\times${f(vin * 1e3)}\,\text{mV} = ${f(out * 1e3)}\,\text{mV}$ peak, inverted, riding on $${volt(VOUT)}$.

(Ratio of totals $V_{OUT}/V_{IN} = ${f(VOUT / VIN, 3)}$ means nothing: the gain is a ratio of changes.)`,
      _v: { VDD, k, RD, VIN, vin },
    };
  };

  // ================================================================ Ch 1.2  how small is small
  GENS.bk_tan_sq = () => {
    const K = pick([2, 5, 10, 25]) * 1e-3, ov = pick([0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]);
    const vgs = pick([2, 5, 10, 20, 30, 50].filter((m) => m * 1e-3 <= ov / 2)) * 1e-3;
    const pct = pick([1, 2, 5]);
    const ID = K * ov * ov, lin = 2 * K * ov * vgs, sq = K * vgs * vgs, ratio = 100 * vgs / (2 * ov), vmax = pct / 100 * 2 * ov;
    return {
      q: md`A square-law device carries $i_D = K(v_{GS} - V_{TN})^2$ with $K = ${kk(K)}$. It is biased at $V_{ov} = V_{GS} - V_{TN} = ${volt(ov)}$, and a signal $v_{gs} = ${mv(vgs)}$ is added. Find the bias current, the linear term $2KV_{ov}v_{gs}$, the curvature term $Kv_{gs}^2$, their ratio, and the largest $v_{gs}$ that keeps the ratio at or below $${pct}\%$.`,
      parts: [
        curAns('I_D', ID),
        numAns('2KV_{ov}v_{gs}', 'µA', lin * 1e6, [{ v: K * ov * vgs * 1e6, msg: 'The linear coefficient is $2KV_{ov}$: the 2 comes from expanding $(V_{ov} + v_{gs})^2$.' }]),
        numAns('Kv_{gs}^2', 'µA', sq * 1e6),
        numAns('\\text{ratio}', '\\%', ratio, [{ v: 2 * ratio, msg: 'The ratio is $v_{gs}/(2V_{ov})$, not $v_{gs}/V_{ov}$.' }]),
        numAns(`v_{gs,max}\\ (${pct}\\%)`, 'mV', vmax * 1e3, [{ v: vmax * 500, msg: 'Use $2V_{ov}$, not $V_{ov}$.' }]),
      ],
      hints: [md`$(V_{ov} + v_{gs})^2 = V_{ov}^2 + 2V_{ov}v_{gs} + v_{gs}^2$: multiply each term by $K$.`, md`The ratio of the last two terms is $v_{gs}/(2V_{ov})$.`],
      sol: md`
Expand: $i_D = K(V_{ov} + v_{gs})^2 = KV_{ov}^2 + 2KV_{ov}v_{gs} + Kv_{gs}^2$.

1. Bias current: $I_D = KV_{ov}^2 = (${kk(K)})(${f(ov)}\,\text{V})^2 = ${amp(ID)}$.
2. Linear term: $2KV_{ov}v_{gs} = 2(${kk(K)})(${f(ov)}\,\text{V})(${f(vgs)}\,\text{V}) = ${f(lin * 1e6)}\,\mu\text{A}$.
3. Curvature term: $Kv_{gs}^2 = (${kk(K)})(${f(vgs)}\,\text{V})^2 = ${f(sq * 1e6)}\,\mu\text{A}$.
4. Ratio: $\dfrac{Kv_{gs}^2}{2KV_{ov}v_{gs}} = \dfrac{v_{gs}}{2V_{ov}} = \dfrac{${f(vgs)}}{${f(2 * ov)}} = ${f(ratio)}\%$.
5. For at most $${pct}\%$: $v_{gs}\le${f(pct / 100)}\times2V_{ov} = ${f(pct / 100)}\times${volt(2 * ov)} = ${mv(vmax)}$.`,
      _v: { K, ov, vgs, pct },
    };
  };

  GENS.bk_tan_exp = () => {
    const I = pick([0.1, 0.25, 0.5, 1, 2, 5]) * 1e-3, vd = pick([1, 2, 3, 4, 5, 8, 10]) * 1e-3;
    const x = vd / VT, slope = I / VT, lin = slope * vd, exact = I * (Math.exp(x) - 1), err = 100 * (exact - lin) / lin, est = 100 * x / 2;
    return {
      q: md`A diode follows $i_D = I_Se^{v_D/V_T}$ with $V_T = 25\,\text{mV}$, and carries $I_D = ${amp(I)}$ at its operating point. Its voltage rises by $v_d = ${mv(vd)}$. Find the slope $I_D/V_T$, the straight-line current change, the exact change, the exact error of the straight line, and the second-order estimate $v_d/(2V_T)$ of that error.`,
      parts: [
        numAns('I_D/V_T', 'mA/V', slope * 1e3),
        numAns('i_d\\ \\text{(line)}', 'µA', lin * 1e6),
        numAns('i_d\\ \\text{(exact)}', 'µA', exact * 1e6, [{ v: I * Math.exp(x) * 1e6, msg: 'That is the new total current $I_De^{v_d/V_T}$. The change is that minus $I_D$.' }]),
        numAns('\\text{error (exact)}', '\\%', err),
        numAns('v_d/(2V_T)', '\\%', est, [{ v: 2 * est, msg: 'Divide by $2V_T = 50\\,\\text{mV}$, not by $V_T$.' }]),
      ],
      hints: [md`$i_D = I_De^{v_d/V_T}$, so the exact change is $I_D(e^{v_d/V_T} - 1)$.`, md`Here $v_d/V_T = ${f(x)}$.`],
      sol: md`
1. Slope: $I_D/V_T = ${amp(I)}/25\,\text{mV} = ${f(slope * 1e3)}\,\text{mA/V}$.
2. Straight line: $(I_D/V_T)\,v_d = (${f(slope * 1e3)}\,\text{mA/V})(${f(vd)}\,\text{V}) = ${f(lin * 1e6)}\,\mu\text{A}$.
3. Exact: $I_D(e^{v_d/V_T} - 1) = (${amp(I)})(e^{${f(x)}} - 1) = (${amp(I)})(${f(Math.exp(x) - 1, 5)}) = ${f(exact * 1e6)}\,\mu\text{A}$.
4. Exact error: $(${f(exact * 1e6)} - ${f(lin * 1e6)})/${f(lin * 1e6)} = ${f(err, 3)}\%$.
5. Estimate: $v_d/(2V_T) = ${f(vd * 1e3)}/50 = ${f(est)}\%$. ${err > 1.08 * est ? 'The estimate is a little low: the $u^3$ and higher terms of $e^u$ add to the error when $v_d$ is not tiny.' : 'Close to the exact error: at this size the second-order term is almost all of it.'}`,
      _v: { I, vd },
    };
  };

  // ================================================================ Ch 1.3  the diode's r_d in a divider
  const divFig = (vs, r, n) => [
    ['Vac', [0, 0], [0, 1], { n: 'v_s', side: 'l' }], ['V', [0, 1], [0, 2], { n: 'V_S', s: vs, side: 'l' }], ['gnd', [0, 2]],
    ['w', [0, 0], [0, -0.6], [0.3, -0.6]], ['R', [0.3, -0.6], [1.7, -0.6], { n: 'R', s: r }], ['w', [1.7, -0.6], [2.2, -0.6], [2.2, -0.2]],
    ...(n === 1 ? [['D', [2.2, -0.2], [2.2, 1.2]], ['w', [2.2, 1.2], [2.2, 2]]]
      : [['D', [2.2, -0.2], [2.2, 0.8]], ['D', [2.2, 0.8], [2.2, 1.8]], ['w', [2.2, 1.8], [2.2, 2]]]),
    ['gnd', [2.2, 2]], ['w', [2.2, -0.6], [3, -0.6]], ['term', [3, -0.6], { n: 'v_{OUT}' }],
  ];
  GENS.bk_diode = () => {
    const n = pick([1, 1, 2]), VS = pick([3, 5, 5, 10, 12]);
    let R, I, tries = 0;
    do { R = pick([1, 1.5, 2, 2.2, 3.3, 4.3, 4.7, 5.6, 8.2, 10, 15, 22]) * 1e3; I = (VS - 0.7 * n) / R; tries++; } while ((I < 0.1e-3 || I > 5e-3) && tries < 200);
    const rd = VT / I, vs = pick([10, 20, 50, 100, 200]) * 1e-3;
    const att = n * rd / (R + n * rd), vo = vs * att;
    const two = n === 2;
    return {
      fig: divFig(`${VS}\\,\\text{V}`, ohm(R), n),
      q: md`A $${VS}\,\text{V}$ supply with a $${mv(vs)}$-peak signal $v_s$ on it feeds $R = ${ohm(R)}$ and ${two ? 'two diodes in series' : 'a diode'} to ground. Use $0.7\,\text{V}$ per diode for DC and $V_T = 25\,\text{mV}$. Find the DC current, the small-signal resistance of one diode, and the signal amplitude at $v_{OUT}$ (across ${two ? 'both diodes' : 'the diode'}).`,
      parts: [
        numAns('I_D', 'mA', I * 1e3, [{ v: VS / R * 1e3, msg: 'Subtract the diode drop before dividing by $R$.' }, ...(two ? [{ v: (VS - 0.7) / R * 1e3, msg: 'Two diodes drop $1.4\\,\\text{V}$.' }] : [])]),
        numAns('r_d', 'Ω', rd, [{ v: 0.7 / I, msg: 'That is $0.7\\,\\text{V}/I_D$, the chord. The small-signal resistance is the slope, $V_T/I_D$.' }]),
        numAns('|v_{out}|', 'mV', vo * 1e3, [{ v: vs * 1e3, msg: 'The diode is stiff: only the fraction $r/(R + r)$ of the signal appears across it.' }, ...(two ? [{ v: vs * rd / (R + 2 * rd) * 1e3, msg: 'That is one diode\'s share. The output is across both.' }] : [])]),
      ],
      hints: [md`DC: $I_D = (V_S - ${two ? '1.4' : '0.7'}\,\text{V})/R$.`, md`Small signal: the DC source is a short and each diode is $r_d = V_T/I_D$; the result is a divider.`],
      sol: md`
1. **DC picture** (signal off): $I_D = \dfrac{${VS} - ${f(0.7 * n)}}{${ohm(R)}} = ${amp(I)}$.
2. **Slope:** $r_d = \dfrac{25\,\text{mV}}{${amp(I)}} = ${ohm(rd)}$.
3. **Small-signal picture:** $V_S$ becomes a wire, ${two ? 'each diode becomes $r_d$ and the two add: $2r_d = ' + ohm(2 * rd) + '$' : 'the diode becomes $r_d$'}. A divider:
$$|v_{out}| = ${mv(vs)}\times\frac{${ohm(n * rd)}}{${ohm(R)} + ${ohm(n * rd)}} = ${mv(vs)}\times${f(att, 4)} = ${f(vo * 1e3, 4)}\,\text{mV}$$`,
      _v: { VS, R, n, vs },
    };
  };

  // ================================================================ Ch 1.4  the two pictures: a current-biased diode attenuator
  const attFig = (ib, rs, rl) => [
    ['rail', [2, -1.6], { n: 'V_{DD}' }], ['I', [2, -1.6], [2, -0.4], { n: 'I_B', s: ib, side: 'r' }], ['w', [2, -0.4], [2, 0]],
    ['node', [2, 0], { n: 'X', side: 'al' }], ['w', [2, 0], [2, 0.2]], ['D', [2, 0.2], [2, 1.4]], ['gnd', [2, 1.4]],
    ['Vac', [-1.4, 0.4], [-1.4, 1.4], { n: 'v_s', side: 'l' }], ['gnd', [-1.4, 1.4]], ['w', [-1.4, 0.4], [-1.4, 0]],
    ['R', [-1.4, 0], [-0.2, 0], { n: 'R_S', s: rs }], ['w', [-0.2, 0], [0.4, 0]], ['C', [0.4, 0], [1.2, 0], { n: 'C_1' }], ['w', [1.2, 0], [2, 0], [2.8, 0]],
    ['C', [2.8, 0], [3.6, 0], { n: 'C_2' }], ['w', [3.6, 0], [4.4, 0], [5, 0]],
    ...(rl ? [['R', [4.4, 0], [4.4, 1.4], { n: 'R_L', s: rl }], ['gnd', [4.4, 1.4]]] : []), ['term', [5, 0], { n: 'v_{out}' }],
  ];
  GENS.bk_two_atten = () => {
    const design = Math.random() < 0.35;
    if (design) {
      const RS = pick([100, 200, 500, 1000, 2000]), g = pick([0.05, 0.1, 0.2, 0.25, 0.5]);
      const rd = g * RS / (1 - g), IB = VT / rd;
      return {
        fig: attFig('?', ohm(RS), null),
        q: md`The current-biased diode attenuator, with $R_S = ${ohm(RS)}$ and the output driving a very high resistance ($R_L\to\infty$). The capacitors are large. Which $r_d$, and which bias current $I_B$, give $v_{out}/v_s = ${g}$? ($V_T = 25\,\text{mV}$.)`,
        parts: [
          numAns('r_d', 'Ω', rd, [{ v: g * RS, msg: `The divider is $r_d/(R_S + r_d)$: solving gives $r_d = R_S\\,g/(1 - g)$, not $gR_S$.` }]),
          numAns('I_B', 'mA', IB * 1e3, [{ v: VT / (g * RS) * 1e3, msg: 'That uses $r_d = gR_S$. Solve the divider exactly.' }]),
        ],
        hints: [md`Small-signal picture: $I_B$ open, capacitors shorted, diode $\to r_d$: a divider $r_d/(R_S + r_d)$.`, md`Then $I_B = I_D = V_T/r_d$.`],
        sol: md`
1. Small-signal picture: $v_{out}/v_s = \dfrac{r_d}{R_S + r_d} = ${g}$, so $r_d(1 - ${g}) = ${g}R_S$ and
$$r_d = \frac{${g}\times${ohm(RS)}}{${f(1 - g)}} = ${ohm(rd)}$$
2. DC picture: the capacitors are open, so the diode carries all of $I_B$, and $r_d = V_T/I_B$:
$$I_B = \frac{25\,\text{mV}}{${ohm(rd)}} = ${amp(IB)}$$`,
        _v: { mode: 'design', RS, g },
      };
    }
    const IB = pick([0.05, 0.1, 0.25, 0.5, 1, 2]) * 1e-3, RS = pick([100, 500, 1000, 2000]), RL = pick([1e3, 2e3, 10e3, Infinity]);
    const rd = VT / IB, rx = isFinite(RL) ? par(rd, RL) : rd, g = rx / (RS + rx), vs = pick([10, 20, 50]) * 1e-3;
    return {
      fig: attFig(amp(IB), ohm(RS), isFinite(RL) ? ohm(RL) : null),
      q: md`A current source $I_B = ${amp(IB)}$ biases a diode. The signal $v_s$ ($${mv(vs)}$ peak, source resistance $R_S = ${ohm(RS)}$) comes in through the large capacitor $C_1$; the output leaves through the large capacitor $C_2$${isFinite(RL) ? md` into $R_L = ${ohm(RL)}$` : ' into a very high resistance'}. Find the diode's DC current, $r_d$, the resistance from $X$ to ground in the small-signal picture, $v_{out}/v_s$ and the output amplitude.`,
      parts: [
        numAns('I_D', 'mA', IB * 1e3),
        numAns('r_d', 'Ω', rd, [{ v: 0.7 / IB, msg: 'That is $0.7\\,\\text{V}/I_D$, the chord. Use $V_T/I_D$.' }]),
        numAns('R_X', 'Ω', rx, isFinite(RL) ? [{ v: rd + RL, msg: '$r_d$ and $R_L$ both go from $X$ to ground: parallel, not series.' }] : []),
        numAns('v_{out}/v_s', '', g, [{ v: rx / RS, msg: 'The divider is $R_X/(R_S + R_X)$, not $R_X/R_S$.' }]),
        numAns('|v_{out}|', 'mV', g * vs * 1e3),
      ],
      hints: [md`DC picture: the capacitors are open, so all of $I_B$ flows through the diode.`, md`Small-signal picture: $I_B$ open, capacitors shorted; at $X$, $r_d${isFinite(RL) ? '\\parallel R_L' : ''} to ground, fed through $R_S$.`],
      sol: md`
1. **DC picture.** $C_1$, $C_2$ open; $v_s$ off. All of $I_B$ goes into the diode: $I_D = ${amp(IB)}$.
2. **Slope:** $r_d = 25\,\text{mV}/${amp(IB)} = ${ohm(rd)}$.
3. **Small-signal picture.** $I_B$ open (deleted, with $V_{DD}$), $C_1$ and $C_2$ wires, diode $\to r_d$. ${isFinite(RL) ? md`At $X$: $R_X = r_d\parallel R_L = ${ohm(rd)}\parallel${ohm(RL)} = ${ohm(rx)}$.` : md`At $X$ only $r_d$ goes to ground: $R_X = ${ohm(rx)}$.`}
4. **Divider:** $\dfrac{v_{out}}{v_s} = \dfrac{R_X}{R_S + R_X} = \dfrac{${f(rx, 4)}}{${f(RS)} + ${f(rx, 4)}} = ${f(g, 4)}$.
5. **Output:** $${mv(vs)}\times${f(g, 4)} = ${f(g * vs * 1e3, 4)}\,\text{mV}$ peak (around $0\,\text{V}$: $C_2$ blocks the diode's $0.7\,\text{V}$).`,
      _v: { mode: 'fwd', IB, RS, RL: isFinite(RL) ? RL : null, vs },
    };
  };

  // ================================================================ Ch 1.5  the test-source method
  const testSrc = (x, y, dx = 1.3) => [['w', [x, y], [x - dx, y]], ['V', [x - dx, y], [x - dx, y + 1.4], { n: 'v_t', side: 'l' }], ['gnd', [x - dx, y + 1.4]], ['iarr', [x - dx * 0.5, y], 'r', { n: 'i_t' }]];
  const divCtl = (ra, rb, gm, rp) => [
    ...testSrc(1.4, 0), ['node', [1.4, 0], { n: 'A', side: 'a', dot: true }],
    ['G', [1.4, 0], [1.4, 1.6], { n: 'g_mv_c', s: gm, side: 'r' }], ['gnd', [1.4, 1.6]],
    ...(rp ? [['R', [2.6, 0], [2.6, 1.6], { n: 'R_p', s: rp }], ['gnd', [2.6, 1.6]]] : []),
    ['w', [1.4, 0], [3.8, 0]], ['R', [3.8, 0], [3.8, 1.2], { n: 'R_a', s: ra }], ['node', [3.8, 1.2], { n: 'C', side: 'l' }],
    ['R', [3.8, 1.2], [3.8, 2.4], { n: 'R_b', s: rb, side: 'l' }], ['gnd', [3.8, 2.4]], ['vlab', [4.2, 1.35], [4.2, 2.25], { n: 'v_c' }],
  ];
  GENS.bk_test_div = () => {
    const Ra = pick([1, 2, 3, 4, 5, 9]) * 1e3, Rb = pick([1, 1, 2, 3]) * 1e3, gm = pick([1, 2, 4, 5, 10]) * 1e-3;
    const Rp = pick([null, null, 1e3, 2e3, 5e3]);
    const K = Rb / (Ra + Rb), Gs = gm * K, R = 1 / (1 / (Ra + Rb) + Gs + (Rp ? 1 / Rp : 0));
    return {
      fig: divCtl(ohm(Ra), ohm(Rb), ms(gm), Rp ? ohm(Rp) : null),
      q: md`A VCCS $g_mv_c$ ($g_m = ${ms(gm)}$) pulls current from node $A$ to ground; its controlling voltage $v_c$ is taken across $R_b$ in the divider $R_a = ${ohm(Ra)}$, $R_b = ${ohm(Rb)}$ hanging from $A$${Rp ? md`, and a resistor $R_p = ${ohm(Rp)}$ also runs from $A$ to ground` : ''}. Find the fraction $K = v_c/v_t$, the resistance of the source branch alone, and the total resistance seen at $A$.`,
      parts: [
        numAns('K', '', K, [{ v: Ra / (Ra + Rb), msg: 'The control voltage is across $R_b$: $K = R_b/(R_a + R_b)$.' }]),
        resAns('1/(g_mK)', 1 / Gs, [], [{ v: 1 / gm, msg: 'That is $1/g_m$: the source only sees $Kv_t$.' }]),
        resAns('R_A', R, [], [{ v: 1 / (1 / (Ra + Rb) + gm + (Rp ? 1 / Rp : 0)), msg: 'You let the source see all of $v_t$. It only sees $Kv_t$.' }, { v: 1 / (Gs + (Rp ? 1 / Rp : 0)), msg: 'The divider itself also draws $v_t/(R_a + R_b)$ from the test source.' }]),
      ],
      hints: [md`Turn nothing off (no independent sources); apply $v_t$ at $A$. Then $v_c = Kv_t$.`, md`KCL at $A$: $i_t = g_mKv_t + \dfrac{v_t}{R_a + R_b}${Rp ? ' + \\dfrac{v_t}{R_p}' : ''}$.`],
      sol: md`
1. **Controlling voltage.** The divider carries $v_t/(R_a + R_b)$, so $v_c = v_t\dfrac{R_b}{R_a + R_b} = ${f(K, 4)}\,v_t$.
2. **Source branch:** it draws $g_mKv_t = (${ms(Gs)})\,v_t$, so alone it looks like $1/(g_mK) = ${ohm(1 / Gs)}$.
3. **KCL at $A$:** $i_t = v_t\left[${f(Gs * 1e3, 4)} + ${f(1e3 / (Ra + Rb), 4)}${Rp ? ` + ${f(1e3 / Rp, 4)}` : ''}\right]\,\text{mS}$, so
$$R_A = ${Rp ? '\\frac{1}{g_mK}\\parallel(R_a + R_b)\\parallel R_p' : '\\frac{1}{g_mK}\\parallel(R_a + R_b)'} = ${ohm(R)}$$`,
      _v: { Ra, Rb, gm, Rp },
    };
  };

  const fbFig = (r1, rf, gm, r2) => [
    ['Vac', [0, 0.4], [0, 1.4], { n: 'v_s', side: 'l' }], ['gnd', [0, 1.4]], ['w', [0, 0.4], [0, 0]],
    ['R', [0, 0], [1.4, 0], { n: 'R_1', s: r1, side: 'b' }], ['node', [1.4, 0], { n: 'v_1', side: 'a', dot: true }],
    ['R', [1.4, 0], [3, 0], { n: 'R_F', s: rf, side: 'b' }], ['w', [3, 0], [3.2, 0]], ['node', [3.2, 0], { n: 'v_2', side: 'a', dot: true }],
    ['G', [3.2, 0], [3.2, 1.4], { n: 'g_mv_1', s: gm, side: 'r' }], ['gnd', [3.2, 1.4]],
    ['w', [3.2, 0], [4.9, 0]], ['R', [4.9, 0], [4.9, 1.4], { n: 'R_2', s: r2 }], ['gnd', [4.9, 1.4]], ['w', [4.9, 0], [5.7, 0]], ['term', [5.7, 0], { n: 'v_{out}' }],
  ];
  GENS.bk_test_fb = () => {
    const R1 = pick([0.5, 1, 1, 2]) * 1e3, RF = pick([4, 5, 10, 20]) * 1e3, R2 = pick([2, 5, 10, 20]) * 1e3, gm = pick([2, 4, 5, 10]) * 1e-3;
    const Rout = 1 / (1 / R2 + (1 + gm * R1) / (R1 + RF));
    const Av = R2 * (1 - gm * RF) / (R1 + R2 + RF + gm * R1 * R2);
    const k = R1 / (R1 + RF);
    return {
      fig: fbFig(ohm(R1), ohm(RF), ms(gm), ohm(R2)),
      q: md`$R_1 = ${ohm(R1)}$, $R_F = ${ohm(RF)}$, $R_2 = ${ohm(R2)}$, and a VCCS $g_mv_1$ with $g_m = ${ms(gm)}$ (controlled by the voltage of node $v_1$) pulls current from the output to ground. Find the output resistance (with $v_s$ off) and the open-circuit gain $v_{out}/v_s$.`,
      parts: [
        resAns('R_{out}', Rout, [], [{ v: par(R2, R1 + RF), msg: 'That ignores the dependent source. Keep it: it is controlled by $v_1$, which the test source moves.' }]),
        numAns('v_{out}/v_s', 'V/V', Av, [{ v: -gm * R2, msg: 'That is $-g_mR_2$: it ignores the current fed back through $R_F$ and the fact that $v_1\\ne v_s$.' }]),
      ],
      hints: [md`$R_{out}$: short $v_s$, put $v_t$ at the output. Node 1 is then a divider: $v_1 = v_t\,R_1/(R_1 + R_F)$.`, md`Gain: KCL at node 2, $\frac{v_2 - v_1}{R_F} + g_mv_1 + \frac{v_2}{R_2} = 0$, and at node 1, $\frac{v_1 - v_s}{R_1} + \frac{v_1 - v_2}{R_F} = 0$.`],
      sol: md`
**Output resistance.** With $v_s$ shorted and $v_t$ at the output, $v_1 = v_t\,\dfrac{R_1}{R_1 + R_F} = ${f(k, 4)}\,v_t$. KCL at the output: through $R_2$, $v_t/R_2$; through the VCCS, $g_mv_1$; through $R_F$, $(v_t - v_1)/R_F = v_t/(R_1 + R_F)$:
$$i_t = v_t\left[\frac{1}{R_2} + \frac{1 + g_mR_1}{R_1 + R_F}\right]\quad\Rightarrow\quad R_{out} = R_2\parallel\frac{R_1 + R_F}{1 + g_mR_1} = ${ohm(R2)}\parallel${ohm((R1 + RF) / (1 + gm * R1))} = ${ohm(Rout)}$$

**Gain.** Node 2 gives $v_2\left(\frac{1}{R_F} + \frac{1}{R_2}\right) = v_1\left(\frac{1}{R_F} - g_m\right)$; node 1 gives $v_1\left(\frac{1}{R_1} + \frac{1}{R_F}\right) = \frac{v_s}{R_1} + \frac{v_2}{R_F}$. Eliminating $v_1$:
$$\frac{v_{out}}{v_s} = \frac{R_2(1 - g_mR_F)}{R_1 + R_2 + R_F + g_mR_1R_2} = \frac{${f(R2 / 1e3)}(1 - ${f(gm * RF)})}{${f(R1 / 1e3)} + ${f(R2 / 1e3)} + ${f(RF / 1e3)} + ${f(gm * R1 * R2 / 1e3)}} = ${f(Av, 4)}$$
(resistances in $\text{k}\Omega$). The Thévenin equivalent at the output is $${f(Av, 4)}\,v_s$ behind $${ohm(Rout)}$.`,
      _v: { R1, RF, R2, gm },
    };
  };

  // ================================================================ Ch 1.6  sizes: who wins
  const NICE = [100, 200, 250, 500, 1e3, 2e3, 2.5e3, 5e3, 10e3, 20e3, 50e3, 100e3, 200e3, 500e3, 1e6];
  GENS.bk_sizes = () => {
    const mode = pick(['par2', 'par2', 'ser2', 'par3', 'gain']);
    if (mode === 'gain') {
      const gm = pick([1, 2, 4, 5]) * 1e-3, RD = pick([5e3, 10e3, 20e3]), RL = pick([10e3, 20e3, Infinity]), rds = pick([50e3, 100e3, 200e3, 500e3]);
      const Rx = isFinite(RL) ? par(RD, RL) : RD, est = -gm * Rx, ex = -gm * par(Rx, rds), err = 100 * (Math.abs(est) - Math.abs(ex)) / Math.abs(ex);
      return {
        q: md`A gain $A_v = -g_m(R_D\parallel r_{ds}${isFinite(RL) ? '\\parallel R_L' : ''})$ with $g_m = ${ms(gm)}$, $R_D = ${ohm(RD)}$${isFinite(RL) ? md`, $R_L = ${ohm(RL)}$` : ''}, $r_{ds} = ${ohm(rds)}$. Give the quick estimate that drops $r_{ds}$, the exact gain, and the error of the estimate in percent (relative to the exact value).`,
        parts: [numAns('\\text{estimate}', 'V/V', est), numAns('\\text{exact}', 'V/V', ex, [{ v: -gm * par(RD, rds), msg: 'Keep $R_L$: it is in parallel too.' }].filter(() => isFinite(RL))), numAns('\\text{error}', '\\%', err)],
        hints: [md`Combine the resistors you keep first${isFinite(RL) ? ' ($R_D\\parallel R_L$)' : ''}; then the ratio $n = r_{ds}/(\\text{that})$ gives the error $1/n$.`],
        sol: md`
1. ${isFinite(RL) ? md`$R_D\parallel R_L = ${ohm(Rx)}$.` : md`Without $r_{ds}$ only $R_D = ${ohm(RD)}$ is left.`} Estimate: $A_v\approx-(${ms(gm)})(${ohm(Rx)}) = ${f(est, 4)}$.
2. Exact: $${ohm(Rx)}\parallel${ohm(rds)}$; the ratio is $n = ${f(rds / Rx, 4)}$, so this is $${ohm(Rx)}\times\frac{n}{n + 1} = ${ohm(par(Rx, rds))}$, and $A_v = ${f(ex, 4)}$.
3. Error: $1/n = ${f(err, 3)}\%$.`,
        _v: { mode, gm, RD, RL: isFinite(RL) ? RL : null, rds },
      };
    }
    if (mode === 'par3') {
      let a, b, c;
      do { a = pick(NICE.slice(2, 12)); b = pick(NICE.slice(2, 12)); c = pick(NICE.slice(2, 12)); } while (Math.max(a, b, c) / Math.min(a, b, c) > 20);
      const Rt = par(a, b, c);
      return {
        q: md`Find $${ohm(a)}\parallel${ohm(b)}\parallel${ohm(c)}$.`,
        parts: [resAns('R', Rt, [], [{ v: a + b + c, msg: 'Parallel resistances do not add; their conductances do.' }, { v: (a + b + c) / 3, msg: 'Parallel resistances do not average. Add conductances.' }])],
        hints: [md`Add the conductances: $1/R = 1/R_1 + 1/R_2 + 1/R_3$.`],
        sol: md`
Conductances: $\dfrac{1}{${ohm(a)}} + \dfrac{1}{${ohm(b)}} + \dfrac{1}{${ohm(c)}} = ${f(1e3 / a, 4)} + ${f(1e3 / b, 4)} + ${f(1e3 / c, 4)} = ${f(1e3 / Rt, 4)}\,\text{mS}$, so $R = ${ohm(Rt)}$, below the smallest of the three, as a parallel combination must be.`,
        _v: { mode, vals: [a, b, c] },
      };
    }
    const ser = mode === 'ser2';
    let a, b;
    do { a = pick(NICE); b = pick(NICE); } while (a >= b || b / a > 1000);
    const n = b / a, ex = ser ? a + b : par(a, b), approx = ser ? b : a, err = 100 * Math.abs(approx - ex) / ex, ok5 = err <= 5;
    return {
      q: md`Find $${ohm(a)}${ser ? ' + ' : '\\parallel'}${ohm(b)}$ (${ser ? 'in series' : 'in parallel'}). Which resistor wins, how large is the error (relative to the exact value) of keeping only the winner, and is that within $5\%$?`,
      parts: [
        resAns('R', ex, [], ser ? [{ v: par(a, b), msg: 'That is the parallel combination; in series, resistances add.' }] : [{ v: a + b, msg: 'They are in parallel: add conductances, not resistances.' }]),
        { lbl: 'The winner (the one the total is closest to)', mc: [md`$${ohm(a)}$`, md`$${ohm(b)}$`], a: ser ? 1 : 0, fixed: true,
          why: ser ? [md`In series the **larger** resistor wins.`, null] : [null, md`In parallel the **smaller** resistor wins.`] },
        numAns('\\text{error}', '\\%', err),
        { lbl: 'Within $5\\%$?', mc: ['Yes', 'No'], a: ok5 ? 0 : 1, fixed: true, why: ok5 ? [null, `The ratio is $n = ${f(n, 4)}$, so the error is only about $1/n$.`] : [`The ratio is only $n = ${f(n, 4)}$: the error is about $1/n$, more than $5\\%$.`, null] },
      ],
      hints: [md`Ratio first: $n = ${ohm(b)}/${ohm(a)} = ${f(n, 4)}$.`, ser ? md`Series: exact $= nR_1(1 + 1/n)$; keeping only the larger costs $1/(n + 1)$ of the exact value.` : md`Parallel: exact $= R_1\,n/(n + 1)$; keeping only the smaller costs $1/n$ of the exact value.`],
      sol: md`
1. Ratio: $n = ${f(n, 4)}$.
2. Exact: ${ser ? md`$${ohm(a)} + ${ohm(b)} = ${ohm(ex)}$` : md`$${ohm(a)}\times\dfrac{n}{n + 1} = ${ohm(ex)}$`}.
3. ${ser ? 'In series the larger' : 'In parallel the smaller'} resistor wins: $${ohm(approx)}$, which is off by $${f(err, 3)}\%$ ${ok5 ? '(within $5\\%$).' : '(more than $5\\%$: keep both).'}`,
      _v: { mode, a, b },
    };
  };

  // ================================================================ Ch 2.1  regions and the square law
  const MUN = 100e-6, MUP = 50e-6;
  const REGS = ['Cutoff', 'Triode', 'Saturation'];
  const nodeFig = (type, vg, vs, vd) => {
    const p = type === 'pmos';
    return [[type, [1, 1], {}], ['w', [1, 0], [1, -0.35]], ['w', [1, 2], [1, 2.35]], ['w', [0, 1], [-0.35, 1]],
      ['txt', [1.25, -0.3], `$${p ? 'S' : 'D'}:\\ ${p ? 'V_S' : 'V_D'} = ${f(p ? vs : vd)}\\,\\text{V}$`, { a: 'l' }],
      ['txt', [1.25, 2.3], `$${p ? 'D' : 'S'}:\\ ${p ? 'V_D' : 'V_S'} = ${f(p ? vd : vs)}\\,\\text{V}$`, { a: 'l' }],
      ['txt', [-0.45, 1.3], `$G:\\ V_G = ${f(vg)}\\,\\text{V}$`, { a: 'r' }]];
  };
  GENS.bk_mos_region = () => {
    const WL = pick([10, 20, 50, 100]), k = MUN * WL, reg = pick([0, 1, 1, 2, 2, 2]);
    const VS = pick([0, 0, 0.5, 1]);
    const VGS = reg === 0 ? pick([0.4, 0.6, 0.8, 0.9]) : pick([1.2, 1.4, 1.5, 1.8, 2, 2.5]);
    const ov = VGS - 1, VG = +(VS + VGS).toFixed(2);
    const VDS = reg === 0 ? pick([0.5, 1, 2]) : reg === 1 ? +(ov * pick([0.2, 0.4, 0.5, 0.6, 0.8])).toFixed(2) : +(ov + pick([0.1, 0.3, 0.5, 1, 2])).toFixed(2);
    const VD = +(VS + VDS).toFixed(2);
    const ID = reg === 0 ? 0 : reg === 1 ? k * (ov * VDS - VDS * VDS / 2) : 0.5 * k * ov * ov;
    const sat = 0.5 * k * Math.max(ov, 0) ** 2;
    return {
      fig: nodeFig('nmos', VG, VS, VD),
      q: md`An NMOS with $W/L = ${WL}$ ($\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$) has the node voltages shown. Find its region and its drain current.`,
      parts: [
        { lbl: 'Region', mc: REGS, a: reg, fixed: true, why: REGS.map((_, j) => (j === reg ? null : [
          md`It is on: $V_{GS} = ${f(VGS)}\,\text{V} > V_{TN}$.`,
          reg === 0 ? md`It is off: $V_{GS} = ${f(VGS)}\,\text{V} < V_{TN}$.` : md`Triode needs $V_D < V_G - V_{TN} = ${f(VG - 1)}\,\text{V}$; here $V_D = ${f(VD)}\,\text{V}$.`,
          reg === 0 ? md`It is off: $V_{GS} = ${f(VGS)}\,\text{V} < V_{TN}$.` : md`Saturation needs $V_D\ge V_G - V_{TN} = ${f(VG - 1)}\,\text{V}$; here $V_D = ${f(VD)}\,\text{V}$.`][j])) },
        numAns('I_D', 'mA', ID * 1e3, reg === 1 ? [{ v: sat * 1e3, msg: 'That is the saturation current, but the device is in triode.' }] : reg === 2 ? [{ v: 2 * sat * 1e3, msg: 'Missing the $\\tfrac12$ of the square law.' }] : []),
      ],
      hints: [md`$V_{GS} = V_G - V_S$ against $V_{TN}$; then $V_D$ against $V_G - V_{TN}$.`, md`$k = \mu_nC_{ox}W/L = ${kk(k)}$.`],
      sol: md`
1. $V_{GS} = ${f(VG)} - ${f(VS)} = ${f(VGS)}\,\text{V}$${reg === 0 ? md` $< V_{TN}$: **cutoff**, $I_D = 0$.` : md` $> V_{TN}$: on, with $V_{ov} = ${f(ov)}\,\text{V}$.`}
${reg === 0 ? '' : md`2. $V_D = ${f(VD)}\,\text{V}$ against $V_G - V_{TN} = ${f(VG - 1)}\,\text{V}$: ${reg === 2 ? '**saturation** ($V_D$ is at or above it).' : '**triode** ($V_D$ is below it).'}
3. $k = (100\,\mu\text{A/V}^2)(${WL}) = ${kk(k)}$. ${reg === 2 ? md`$I_D = \tfrac12kV_{ov}^2 = \tfrac12(${kk(k)})(${f(ov)})^2 = ${f(ID * 1e3, 4)}\,\text{mA}$.` : md`$V_{DS} = ${f(VDS)}\,\text{V}$: $I_D = k\big[V_{ov}V_{DS} - \tfrac12V_{DS}^2\big] = (${kk(k)})\big[(${f(ov)})(${f(VDS)}) - \tfrac12(${f(VDS)})^2\big] = ${f(ID * 1e3, 4)}\,\text{mA}$.`}`}`,
      _v: { WL, VG, VS, VD },
    };
  };

  GENS.bk_mos_sq = () => {
    const unit = pick([100, 200, 250, 500]), mult = pick([0.25, 0.5, 1, 2, 4]), WL = unit * mult, k = MUN * WL;
    const sz = mult === 0.25 ? '\\tfrac14X' : mult === 0.5 ? '\\tfrac12X' : `${mult}X`;
    const ov = pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5]), ID = 0.5 * k * ov * ov;
    const mode = pick(['I', 'V', 'size']);
    const base = md`Course NMOS: $\mu_nC_{ox} = 100\,\mu\text{A/V}^2$, $V_{TN} = 1\,\text{V}$, $1X = ${unit}/1$, saturation.`;
    if (mode === 'I') return {
      q: md`${base} A $${sz}$ device has $V_{GS} = ${volt(1 + ov)}$. Find $k = \mu_nC_{ox}W/L$ and $I_D$.`,
      parts: [numAns('k', 'mA/V²', k * 1e3), curAns('I_D', ID, [{ v: 2 * ID, msg: 'Missing the $\\tfrac12$.' }, { v: 0.5 * k * (1 + ov) ** 2, msg: 'Use the overdrive $V_{GS} - V_{TN}$, not $V_{GS}$.' }])],
      hints: [md`$W/L = ${f(WL)}$.`],
      sol: md`$W/L = ${f(mult)}\times${unit} = ${f(WL)}$, so $k = (100\,\mu\text{A/V}^2)(${f(WL)}) = ${kk(k)}$. $V_{ov} = ${f(ov)}\,\text{V}$: $I_D = \tfrac12kV_{ov}^2 = ${amp(ID)}$.`,
      _v: { mode, WL, ov },
    };
    if (mode === 'V') return {
      q: md`${base} A $${sz}$ device must carry $I_D = ${amp(ID)}$. Find $V_{ov}$ and $V_{GS}$.`,
      parts: [numAns('V_{ov}', 'V', ov, [{ v: Math.sqrt(ID / k), msg: 'Missing the $\\tfrac12$: $V_{ov} = \\sqrt{2I_D/k}$.' }]), numAns('V_{GS}', 'V', 1 + ov, [{ v: ov, msg: 'Add the threshold: $V_{GS} = V_{TN} + V_{ov}$.' }])],
      hints: [md`$k = ${kk(k)}$; $V_{ov} = \sqrt{2I_D/k}$.`],
      sol: md`$k = (100\,\mu)(${f(WL)}) = ${kk(k)}$. $V_{ov} = \sqrt{\dfrac{2(${amp(ID)})}{${kk(k)}}} = ${volt(ov)}$, so $V_{GS} = 1 + ${f(ov)} = ${volt(1 + ov)}$.`,
      _v: { mode, WL, ov },
    };
    return {
      q: md`${base} A device must carry $I_D = ${amp(ID)}$ at $V_{GS} = ${volt(1 + ov)}$. Find its $W/L$ and its size in units of $X$.`,
      parts: [numAns('W/L', '', WL, [{ v: WL / 2, msg: 'Missing the $\\tfrac12$: $W/L = 2I_D/(\\mu_nC_{ox}V_{ov}^2)$.' }]), numAns('\\text{size}', 'X', mult)],
      hints: [md`$W/L = \dfrac{2I_D}{\mu_nC_{ox}V_{ov}^2}$ with $V_{ov} = ${f(ov)}\,\text{V}$.`],
      sol: md`$W/L = \dfrac{2(${amp(ID)})}{(100\,\mu\text{A/V}^2)(${f(ov)})^2} = ${f(WL)}$, which is $${f(WL)}/${unit} = ${f(mult)}X$.`,
      _v: { mode, WL, ov },
    };
  };
})();

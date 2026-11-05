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
})();

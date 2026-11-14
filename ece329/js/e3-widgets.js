/* e3-widgets.js — things you can watch move. Each W3.name(opts) returns a lesson step (C.W), so a lesson just lists it:
     W3.phasor()    a rotating arrow and the cosine it casts: what a phasor is
     W3.damped()    a wave in any medium, from perfect dielectric to good conductor: dial the loss tangent
     W3.pol()       the tip of E in a fixed plane: linear, circular, elliptical, and which hand
     W3.standing()  incident + reflected = total, with the envelope: dial Gamma
     W3.bounce()    a full bounce diagram and V(z,t) from your own Rg, Z0, RL, length, speed and Vg
     W3.zline()     |V(d)|, |I(d)| and Z(d) along a line ending in any load
   Everything is drawn in SVG with the page's colours. Animations stop when the widget leaves the page. */
(function () {
  'use strict';
  const W3 = {};
  const PI = Math.PI;
  const fmt = (x, d = 3) => (Math.abs(x) < 5e-13 ? '0' : (+x.toPrecision(d)).toString());
  const $ = (el, q) => el.querySelector(q);
  const path = (pts) => 'M' + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join('L');
  const AX = 'stroke="var(--dim)" stroke-width="1"';
  const CUR = 'fill="none" stroke="var(--accent)" stroke-width="2.2"';
  const CUR2 = 'fill="none" stroke="var(--fg)" stroke-width="1.6"';
  const DIM = 'fill="none" stroke="var(--dim)" stroke-width="1.2" stroke-dasharray="5 4"';
  const TXT = 'fill="var(--dim)" font-size="12" font-family="var(--sans, sans-serif)"';
  const svgOf = (w, h, inner) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" style="display:block;max-width:100%;height:auto;margin:6px auto" role="img">${inner}</svg>`;
  const slider = (id, label, min, max, step, val) => `<label>${label} <input type="range" data-k="${id}" min="${min}" max="${max}" step="${step}" value="${val}"> <span class="w-out" data-o="${id}"></span></label>`;
  // run fn(t) every frame while the element is on the page (and at least one frame when offscreen)
  function animate(el, fn) {
    let stop = false; const t0 = performance.now();
    const loop = (now) => { if (stop || !el.isConnected) return; fn((now - t0) / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    fn(0);
    return () => { stop = true; };
  }
  const readers = (el, S, after) => {
    el.querySelectorAll('input[type=range],select').forEach((inp) => {
      const k = inp.dataset.k; S[k] = inp.tagName === 'SELECT' ? inp.value : +inp.value;
      inp.addEventListener('input', () => { S[k] = inp.tagName === 'SELECT' ? inp.value : +inp.value; if (after) after(); });
    });
  };

  // ---------------------------------------------------------------- phasor
  W3.phasor = () => C.W(`
    <div class="w-title">A phasor is a rotating arrow</div>
    <div class="w-row">${slider('A', 'Length A', 0.3, 1, 0.05, 0.9)}${slider('p', 'Start angle φ (deg)', -180, 180, 15, 30)}</div>
    <div class="w-plot"></div>
    <div class="w-note">The arrow $Ae^{j(\\omega t + \\phi)}$ spins at $\\omega$. Its shadow on the real axis is the field you measure: $A\\cos(\\omega t + \\phi)$. The phasor $Ae^{j\\phi}$ is the arrow frozen at $t = 0$: its length and its start angle. The spin is the same for every field in the problem, so we stop writing it.</div>`,
  (el) => {
    const S = {}; readers(el, S);
    const P = $(el, '.w-plot'), W = 520, H = 200, cx = 100, cy = 100, R = 80;
    Engine.renderMath(el);
    animate(el, (t) => {
      const w = 1.1, th = w * t + S.p * PI / 180, a = S.A * R;
      const tx = cx + a * Math.cos(th), ty = cy - a * Math.sin(th);
      const x0 = 215, x1 = W - 10, T = 2 * PI * 2.2;
      const pts = [];
      for (let i = 0; i <= 200; i++) { const u = (i / 200) * T; pts.push([x0 + ((x1 - x0) * i) / 200, cy - R * S.A * Math.cos(th - u)]); }
      P.innerHTML = svgOf(W, H, `
        <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="var(--line-2)"/><line x1="${cx - R - 6}" y1="${cy}" x2="${cx + R + 6}" y2="${cy}" ${AX}/><line x1="${cx}" y1="${cy - R - 6}" x2="${cx}" y2="${cy + R + 6}" ${AX}/>
        <text x="${cx + R + 2}" y="${cy - 5}" ${TXT}>Re</text><text x="${cx + 5}" y="${cy - R - 2}" ${TXT}>Im</text>
        <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="var(--accent)" stroke-width="2.6"/><circle cx="${tx}" cy="${ty}" r="4" fill="var(--accent)"/>
        <line x1="${tx}" y1="${ty}" x2="${tx}" y2="${cy}" ${DIM}/><circle cx="${tx}" cy="${cy}" r="4" fill="var(--fg)"/>
        <line x1="${x0}" y1="${cy}" x2="${x1}" y2="${cy}" ${AX}/><line x1="${x0}" y1="${cy - R - 6}" x2="${x0}" y2="${cy + R + 6}" ${AX}/>
        <path d="${path(pts)}" ${CUR}/><circle cx="${x0}" cy="${cy - R * S.A * Math.cos(th)}" r="4" fill="var(--fg)"/>
        <text x="${x0 + 6}" y="${cy - R - 2}" ${TXT}>the field at this instant, then its past</text>`);
      el.querySelector('[data-o=A]').textContent = fmt(S.A, 2);
      el.querySelector('[data-o=p]').textContent = `${S.p}°`;
    });
  });

  // ---------------------------------------------------------------- damped wave
  W3.damped = () => C.W(`
    <div class="w-title">One wave, any medium: dial the loss tangent</div>
    <div class="w-row">${slider('x', 'log₁₀(σ/ωε)', -2, 2.5, 0.05, -2)}</div>
    <div class="w-plot"></div>
    <p class="w-note w-read"></p>
    <div class="w-note">Accent: $E$. White: $H$ times $\\sqrt{\\mu/\\epsilon}$, so the two match when $\\sigma = 0$. Dashed: the envelope $e^{-\\alpha z}$. The $z$ axis is in $\\lambda_0$, the wavelength of the same wave with $\\sigma = 0$; it zooms in as the loss grows. Slide right: the wave dies faster, its wavelength shrinks, $H$ falls behind $E$ (up to $45°$) and grows relative to $E$ because $|\\eta|$ falls.</div>`,
  (el) => {
    const S = {}; readers(el, S);
    const P = $(el, '.w-plot'), rd = $(el, '.w-read'), W = 560, H = 210;
    Engine.renderMath(el);
    animate(el, (t) => {
      const lt = Math.pow(10, S.x);                 // sigma/(omega eps)
      // gamma = j k sqrt(1 - j lt), k = 2 pi (per lossless wavelength); eta/eta_0 = 1 / sqrt(1 - j lt)
      const root = Cx.of(1, -lt).sqrt();
      const g = Cx.of(0, 2 * PI).mul(root), a = g.re, b = g.im;
      const eta = Cx.of(1).div(root), tau = eta.arg(), m = eta.abs();
      // show at most 3 lossless wavelengths, and no more than 5 decay lengths, so a lossy wave still fills the plot
      const wt = t * 2.0, z1 = Math.min(3, 5 / a), x0 = 34, x1 = W - 8, cy = 100, A = 70;
      const X = (z) => x0 + ((x1 - x0) * z) / z1;
      const e = [], h = [], up = [], dn = [];
      const hs = Math.min(1 / m, 1.25);             // H on screen: |H| times sqrt(mu/eps), capped so it stays on the plot
      for (let i = 0; i <= 360; i++) {
        const z = (z1 * i) / 360, d = Math.exp(-a * z);
        e.push([X(z), cy - A * d * Math.cos(wt - b * z)]);
        h.push([X(z), cy - A * hs * d * Math.cos(wt - b * z - tau)]);
        up.push([X(z), cy - A * d]); dn.push([X(z), cy + A * d]);
      }
      const st = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1].find((s) => z1 / s <= 6) || 1;
      const ticks = []; for (let k = st; k <= z1 + 1e-9; k += st) ticks.push(+k.toFixed(3));
      P.innerHTML = svgOf(W, H, `
        <line x1="${x0}" y1="${cy}" x2="${x1}" y2="${cy}" ${AX}/><line x1="${x0}" y1="${cy - A - 8}" x2="${x0}" y2="${cy + A + 8}" ${AX}/>
        ${ticks.map((k) => `<line x1="${X(k)}" y1="${cy - 4}" x2="${X(k)}" y2="${cy + 4}" ${AX}/><text x="${X(k) - 8}" y="${cy + 18}" ${TXT}>${k}</text>`).join('')}
        <text x="${x1 - 70}" y="${H - 6}" ${TXT}>z in units of λ₀</text>
        <path d="${path(up)}" ${DIM}/><path d="${path(dn)}" ${DIM}/><path d="${path(h)}" ${CUR2}/><path d="${path(e)}" ${CUR}/>`);
      el.querySelector('[data-o=x]').textContent = `σ/ωε = ${fmt(lt, 2)}`;
      rd.innerHTML = `<b>${lt < 0.1 ? 'Imperfect dielectric' : lt > 10 ? 'Good conductor' : 'In between: use the exact formula'}.</b> Measured in λ₀ (the wavelength the same wave would have with σ = 0): α = ${fmt(a, 2)} and β = ${fmt(b, 2)} per λ₀; the wavelength is ${fmt(2 * PI / b, 2)} λ₀; the 1/e depth δ = 1/α is ${fmt(1 / a, 2)} λ₀; |η| is ${fmt(m, 2)} × √(μ/ε); H lags E by τ = ${fmt(tau * 180 / PI, 3)}° (never more than 45°).`;
    });
  });

  // ---------------------------------------------------------------- polarization
  W3.pol = () => C.W(`
    <div class="w-title">The tip of E in one fixed plane</div>
    <div class="w-row">${slider('a', 'First amplitude', 0, 1, 0.05, 1)}${slider('b', 'Second amplitude', 0, 1, 0.05, 1)}</div>
    <div class="w-row">${slider('d', 'Second lags the first by (deg)', -180, 180, 15, 90)}
      <label>Wave travels <select data-k="dir"><option value="1">out of the page, toward you</option><option value="-1">into the page, away from you</option></select></label></div>
    <div class="w-plot"></div>
    <p class="w-note w-read"></p>
    <div class="w-note">The fixed plane is the screen. "First" is the horizontal axis $\\hat a$, "second" the vertical axis $\\hat b$, with $\\hat a\\times\\hat b$ pointing out of the page. So $E = a\\cos(\\omega t)\\,\\hat a + b\\cos(\\omega t - \\Delta)\\,\\hat b$ here. Point your right thumb along the travel: if your fingers curl the way the tip moves, it is right-handed.</div>`,
  (el) => {
    const S = {}; readers(el, S);
    const P = $(el, '.w-plot'), rd = $(el, '.w-read'), W = 300, H = 240, cx = 150, cy = 120, R = 92;
    Engine.renderMath(el);
    animate(el, (t) => {
      const dl = S.d * PI / 180, wt = t * 1.6;
      const pos = (u) => [cx + R * S.a * Math.cos(u), cy - R * S.b * Math.cos(u - dl)];
      const tr = []; for (let i = 0; i <= 120; i++) tr.push(pos((i / 120) * 2 * PI));
      const [x, y] = pos(wt);
      // rotation sense from E x dE/dt along out-of-page; positive means counterclockwise on screen
      const ccw = S.a * S.b * Math.sin(dl);          // a cos u, b cos(u-d): cross = a b sin d
      const dir = +S.dir;
      const lin = S.a < 1e-6 || S.b < 1e-6 || Math.abs(Math.sin(dl)) < 1e-6;
      const circ = !lin && Math.abs(S.a - S.b) < 1e-6 && Math.abs(Math.abs(Math.sin(dl)) - 1) < 1e-6;
      const hand = lin ? '' : (ccw * dir > 0 ? 'right-handed' : 'left-handed');
      P.innerHTML = svgOf(W, H, `
        <line x1="${cx - R - 12}" y1="${cy}" x2="${cx + R + 14}" y2="${cy}" ${AX}/><line x1="${cx}" y1="${cy + R + 12}" x2="${cx}" y2="${cy - R - 14}" ${AX}/>
        <text x="${cx + R + 2}" y="${cy - 6}" ${TXT}>first</text><text x="${cx + 5}" y="${cy - R - 4}" ${TXT}>second</text>
        <path d="${path(tr)}" fill="none" stroke="var(--line-2)" stroke-width="1.6"/>
        <line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--accent)" stroke-width="2.6"/><circle cx="${x}" cy="${y}" r="4.5" fill="var(--accent)"/>
        ${dir > 0 ? `<circle cx="22" cy="24" r="9" fill="none" stroke="var(--fg)"/><circle cx="22" cy="24" r="2.5" fill="var(--fg)"/>` : `<circle cx="22" cy="24" r="9" fill="none" stroke="var(--fg)"/><path d="M16,18L28,30M28,18L16,30" stroke="var(--fg)"/>`}<text x="36" y="28" ${TXT}>travel</text>`);
      ['a', 'b'].forEach((k) => { el.querySelector(`[data-o=${k}]`).textContent = fmt(S[k], 2); });
      el.querySelector('[data-o=d]').textContent = `${S.d}°`;
      rd.innerHTML = `<b>${lin ? 'Linear' : circ ? 'Circular' : 'Elliptical'}${hand ? `, ${hand}` : ''}.</b> ${lin ? 'The two parts peak together (or one is missing): the tip stays on one line.' : circ ? 'Equal amplitudes, a quarter period apart: the tip keeps a constant length.' : 'Either unequal amplitudes or a phase other than ±90°.'}`;
    });
  });

  // ---------------------------------------------------------------- standing wave
  W3.standing = () => C.W(`
    <div class="w-title">Incident + reflected = a standing pattern</div>
    <div class="w-row">${slider('g', 'Reflection coefficient Γ', -1, 1, 0.05, -1)}</div>
    <div class="w-plot"></div>
    <p class="w-note w-read"></p>
    <div class="w-note">The boundary is at the right edge ($d = 0$); $d$ is the distance back from it. Thin line: the incident wave. Dim: the reflected wave. Accent: their sum at this instant. Dashed: the envelope $|1 + \\Gamma e^{-j2\\beta d}|$, which never moves. $\\Gamma = -1$ (a perfect conductor or a short): nodes every $\\lambda/2$, starting at the boundary. $\\Gamma = 0$: no pattern at all.</div>`,
  (el) => {
    const S = {}; readers(el, S);
    const P = $(el, '.w-plot'), rd = $(el, '.w-read'), W = 560, H = 230;
    Engine.renderMath(el);
    animate(el, (t) => {
      const wt = t * 2.0, G = S.g, x0 = 12, x1 = W - 14, cy = 112, A = 50, dMax = 2;   // d in wavelengths
      const X = (d) => x1 - ((x1 - x0) * d) / dMax;
      const inc = [], ref = [], tot = [], up = [], dn = [];
      for (let i = 0; i <= 320; i++) {
        const d = (dMax * i) / 320, bd = 2 * PI * d;
        const vi = Math.cos(wt + bd), vr = G * Math.cos(wt - bd);
        inc.push([X(d), cy - A * vi]); ref.push([X(d), cy - A * vr]); tot.push([X(d), cy - A * (vi + vr)]);
        const env = Math.hypot(1 + G * Math.cos(2 * bd), G * Math.sin(2 * bd));
        up.push([X(d), cy - A * env]); dn.push([X(d), cy + A * env]);
      }
      const ticks = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
      const smax = (1 + Math.abs(G)), smin = (1 - Math.abs(G));
      P.innerHTML = svgOf(W, H, `
        <line x1="${x0}" y1="${cy}" x2="${x1}" y2="${cy}" ${AX}/><line x1="${x1}" y1="${cy - 2 * A - 6}" x2="${x1}" y2="${cy + 2 * A + 6}" stroke="var(--fg)" stroke-width="3"/>
        ${ticks.map((k) => `<line x1="${X(k)}" y1="${cy - 3}" x2="${X(k)}" y2="${cy + 3}" ${AX}/>${k % 0.5 === 0 && k ? `<text x="${X(k) - 8}" y="${H - 4}" ${TXT}>${k}λ</text>` : ''}`).join('')}
        <path d="${path(up)}" ${DIM}/><path d="${path(dn)}" ${DIM}/>
        <path d="${path(inc)}" fill="none" stroke="var(--dim)" stroke-width="1"/><path d="${path(ref)}" fill="none" stroke="var(--line-2)" stroke-width="1"/>
        <path d="${path(tot)}" ${CUR}/>`);
      el.querySelector('[data-o=g]').textContent = fmt(G, 2);
      rd.innerHTML = `Peak of the envelope ${fmt(smax, 2)}, minimum ${fmt(smin, 2)} (in units of the incident amplitude). VSWR $= ${Math.abs(G) > 0.999 ? '\\infty' : fmt(smax / smin, 3)}$. Average power that gets through: $1 - |\\Gamma|^2 = ${fmt(1 - G * G, 3)}$ of the incident.`;
      Engine.renderMath(rd);
    });
  });

  // ---------------------------------------------------------------- bounce diagram
  W3.bounce = (o = {}) => C.W(`
    <div class="w-title">Your own bounce diagram</div>
    <div class="w-row">
      ${[['Vg', 'V<sub>g</sub> (V)', o.Vg ?? 80], ['Rg', 'R<sub>g</sub> (Ω)', o.Rg ?? 50], ['Z0', 'Z<sub>0</sub> (Ω)', o.Z0 ?? 150], ['RL', 'R<sub>L</sub> (Ω; inf = open)', o.RL ?? 50], ['len', 'length (m)', o.len ?? 300], ['v', 'speed (m/µs)', o.v ?? 150], ['z', 'probe z (m)', o.z ?? 100], ['tmax', 'show up to t (µs)', o.tmax ?? 10]].map(([k, l, val]) => `<label style="gap:4px">${l} <input data-b="${k}" value="${val}" style="width:64px;font:inherit;padding:2px 6px;background:var(--card-2);color:var(--fg);border:1px solid var(--line-2);border-radius:6px"></label>`).join('')}
    </div>
    <div class="w-grid"><div class="w-plot w-d"></div><div class="w-plot w-t"></div></div>
    <p class="w-note w-read"></p>`,
  (el) => {
    const val = (k) => { const s = $(el, `[data-b=${k}]`).value.trim(); return /^inf/i.test(s) ? Infinity : parseFloat(s); };
    const draw = () => {
      const p = { Vg: val('Vg'), Rg: val('Rg'), RL: val('RL'), sections: [{ Z0: val('Z0'), len: val('len'), v: val('v') }], tMax: val('tmax') };
      if ([p.Vg, p.Rg, p.sections[0].Z0, p.sections[0].len, p.sections[0].v, p.tMax].some((x) => !isFinite(x) || x < 0) || !(p.sections[0].len > 0) || !(p.sections[0].v > 0) || !(p.tMax > 0)) return;
      const s = TL.solve(p), z = Math.min(Math.max(val('z') || 0, 0), p.sections[0].len);
      $(el, '.w-d').innerHTML = TL.diagram(s, { tMax: p.tMax, probe: z, w: 400, h: 340 });
      $(el, '.w-t').innerHTML = TL.plotT(s, z, { tMax: p.tMax, w: 380, h: 240 }) + TL.plotT(s, z, { tMax: p.tMax, qty: 'I', w: 380, h: 200 });
      $(el, '.w-read').innerHTML = `$\\tau_g = ${TL.frac(s.tauG)}$, $\\Gamma_g = ${TL.frac(s.GammaG)}$, $\\Gamma_L = ${TL.frac(s.GammaL)}$, one-way time $T = ${TL.frac(s.T[0])}\\ \\mu\\text{s}$. Steady state (dashed): $V = ${TL.frac(s.dc.V)}$ V, $I = ${TL.frac(s.dc.I)}$ A, from the DC circuit alone.`;
      Engine.renderMath(el);
    };
    el.querySelectorAll('input[data-b]').forEach((i) => i.addEventListener('change', draw));
    draw();
  });

  // ---------------------------------------------------------------- along a line, any load
  W3.zline = () => C.W(`
    <div class="w-title">Walk along a line toward the source</div>
    <div class="w-row"><label>Load <select data-k="load"><option value="short">short</option><option value="open">open</option><option value="match">matched, Z_L = Z_0</option><option value="r2">Z_L = 3Z_0</option><option value="r5">Z_L = Z_0/3</option><option value="rx">Z_L = Z_0(1 + j)</option></select></label>
      ${slider('d', 'd/λ', 0, 1, 0.005, 0.125)}</div>
    <div class="w-plot"></div>
    <p class="w-note w-read"></p>
    <div class="w-note">$d$ is the distance back from the load. Accent: $|\\tilde V(d)|/|\\tilde V^+|$. White: $Z_0|\\tilde I(d)|/|\\tilde V^+|$. Everything repeats every $\\lambda/2$, because $\\Gamma(d)$ turns once around per half wavelength. Where the voltage peaks the current dips, and $Z(d)$ is real at both.</div>`,
  (el) => {
    const S = {}; const draw = () => {
      const ZL = { short: 0, open: Infinity, match: 1, r2: 3, r5: 1 / 3, rx: Cx.of(1, 1) }[S.load];
      const GL = TL.gamma(ZL, 1), W = 560, H = 190, x0 = 12, x1 = W - 14, cy = H - 26, A = 66;
      const X = (d) => x1 - (x1 - x0) * d;
      const vpts = [], ipts = [];
      for (let i = 0; i <= 300; i++) {
        const d = i / 300, G = TL.gammaAt(GL, 2 * PI * d);
        vpts.push([X(d), cy - A * Cx.of(1).add(G).abs()]); ipts.push([X(d), cy - A * Cx.of(1).sub(G).abs()]);
      }
      const z = TL.zAt(ZL, 1, 2 * PI * S.d), Gd = TL.gammaAt(GL, 2 * PI * S.d);
      const ztxt = z === Infinity ? '\\infty' : z.abs() < 1e-6 ? '0' : z.tex((x) => fmt(x, 3));
      const kind = z === Infinity || z.abs() > 1e5 ? 'an open circuit here (parallel resonance)' : z.abs() < 1e-5 ? 'a short circuit here (series resonance)' : Math.abs(z.im) < 1e-6 ? 'purely resistive here' : z.im > 0 ? 'inductive here' : 'capacitive here';
      $(el, '.w-plot').innerHTML = svgOf(W, H, `
        <line x1="${x0}" y1="${cy}" x2="${x1}" y2="${cy}" ${AX}/><line x1="${x1}" y1="${cy - 2 * A}" x2="${x1}" y2="${cy + 4}" stroke="var(--fg)" stroke-width="3"/>
        ${[0.25, 0.5, 0.75, 1].map((k) => `<line x1="${X(k)}" y1="${cy - 3}" x2="${X(k)}" y2="${cy + 3}" ${AX}/><text x="${X(k) - 10}" y="${cy + 16}" ${TXT}>${k}λ</text>`).join('')}
        <path d="${path(ipts)}" ${CUR2}/><path d="${path(vpts)}" ${CUR}/>
        <line x1="${X(S.d)}" y1="${cy - 2 * A}" x2="${X(S.d)}" y2="${cy}" ${DIM}/>`);
      el.querySelector('[data-o=d]').textContent = fmt(S.d, 3);
      $(el, '.w-read').innerHTML = `At $d = ${fmt(S.d, 3)}\\lambda$: $\\Gamma(d) = ${Gd.tex((x) => fmt(x, 3))}$, $\\;z(d) = Z(d)/Z_0 = ${ztxt}$: ${kind}. VSWR $= ${TL.vswr(GL) === Infinity ? '\\infty' : fmt(TL.vswr(GL), 3)}$.`;
      Engine.renderMath($(el, '.w-read'));
    };
    readers(el, S, draw);
    Engine.renderMath(el);
    draw();
  });

  window.W3 = W3;
})();

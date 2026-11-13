/* Hour Exam II randomized drills: every call builds a fresh version of a standard setup, with answers as pure numbers
   "in units of" the natural combination, so they can be checked without constants. Used by G('e2_...') steps. */
(function () {
  'use strict';
  const { pick, ri } = U;
  const num = (v) => (+v.toFixed(4)).toString();
  const frac = { 0.25: '\\tfrac14', 0.5: '\\tfrac12', 0.75: '\\tfrac34', 2: '2', 3: '3', 1.5: '\\tfrac32' };

  // ---------------------------------------------------------------- 1. bent wires (Biot–Savart by pieces)
  GENS.e2_bentwire = () => {
    const A = pick([
      { phi: Math.PI / 2, t: '\\pi/2', w: 'a quarter circle' },
      { phi: Math.PI, t: '\\pi', w: 'a semicircle' },
      { phi: 3 * Math.PI / 2, t: '3\\pi/2', w: 'three quarters of a circle' },
    ]);
    const kind = pick(['radial', 'tangent', 'mixed', 'two-arc']);
    const k = pick([2, 3]);
    let q, ans, sol;
    if (kind === 'radial') {
      q = md`A wire comes in straight toward point $P$ along a radius, runs along ${A.w} of radius $R$ centered on $P$, then leaves straight out along a radius. Find $B$ at $P$ in units of $\dfrac{\mu_0I}{4\pi R}$.`;
      ans = A.phi;
      sol = md`Both straight pieces point at $P$: $d\vb l\parallel\uv{\srm}$, zero. The arc gives $\dfrac{\mu_0I\phi}{4\pi R}$ with $\phi = ${A.t}$: answer $${A.t}\approx${num(ans)}$.`;
    } else if (kind === 'tangent') {
      q = md`A long straight wire runs in from infinity, joins smoothly (tangentially) onto ${A.w} of radius $R$ centered on $P$, and leaves along the tangent line at the far end, out to infinity. Find $B$ at $P$ in units of $\dfrac{\mu_0I}{4\pi R}$.`;
      ans = A.phi + 2;
      sol = md`Each straight lead is semi-infinite and ends **beside** $P$ at distance $R$ (the tangent point is the foot of the perpendicular): $\dfrac{\mu_0I}{4\pi R}$ each, the same sense as the arc because the path turns smoothly the same way. Arc: $\phi = ${A.t}$. Total $${A.t} + 2\approx${num(ans)}$.`;
    } else if (kind === 'mixed') {
      q = md`A wire comes straight in toward $P$ along a radius, runs along ${A.w} of radius $R$ centered on $P$, then leaves along the tangent line at that end, out to infinity. Find $B$ at $P$ in units of $\dfrac{\mu_0I}{4\pi R}$.`;
      ans = A.phi + 1;
      sol = md`Radial lead: zero. Tangent lead: semi-infinite, beside $P$ at distance $R$: $1$ unit. Arc: $${A.t}$. Total $${A.t} + 1\approx${num(ans)}$.`;
    } else {
      q = md`A closed loop is made of two arcs centered on $P$, radius $R$ and $${k}R$, each spanning angle $${A.t}$, joined by two radial segments. Current $I$ goes around it. Find $|B|$ at $P$ in units of $\dfrac{\mu_0I}{4\pi R}$.`;
      ans = A.phi * (1 - 1 / k);
      sol = md`Radial segments: zero. The arcs circulate in opposite senses about $P$, so they subtract: $\phi\left(\dfrac1R - \dfrac{1}{${k}R}\right) = ${A.t}\cdot\dfrac{${k - 1}}{${k}}\approx${num(ans)}$ units. The inner arc wins.`;
    }
    return {
      title: 'Bent wire: B at the center',
      q, parts: [{ lbl: md`$B$`, ans, unit: '' }],
      hints: [md`Cross off every straight piece whose line passes through $P$.`, md`Arc: $\dfrac{\mu_0I\phi}{4\pi R}$. Semi-infinite wire ending beside the point: $\dfrac{\mu_0I}{4\pi s}$.`],
      sol,
    };
  };

  // ---------------------------------------------------------------- 2. Ampère with symmetric currents
  GENS.e2_ampere = () => {
    const v = pick(['power', 'tube', 'coax']);
    let q, ans, sol;
    if (v === 'power') {
      const k = ri(0, 3), f = pick([0.25, 0.5, 0.75, 2, 3]);
      q = md`A long wire of radius $a$ carries total current $I$ with $J\propto s^{${k}}$. Find $B$ at $s = ${frac[f]}a$ in units of $\dfrac{\mu_0I}{2\pi a}$.`;
      ans = f < 1 ? Math.pow(f, k + 1) : 1 / f;
      sol = f < 1
        ? md`$I_{\text{enc}}/I = (s/a)^{${k + 2}} = (${frac[f]})^{${k + 2}}$, and $B = \dfrac{\mu_0I_{\text{enc}}}{2\pi s}$, so in units of $\dfrac{\mu_0I}{2\pi a}$: $(${frac[f]})^{${k + 1}}\approx${num(ans)}$.`
        : md`Outside, all of $I$ is enclosed: $B = \dfrac{\mu_0I}{2\pi s}$, i.e. $a/s = ${num(ans)}$ units. The current profile doesn't matter outside.`;
    } else if (v === 'tube') {
      const b = pick([2, 3]), f = pick([0.5, 1.5, b === 3 ? 2 : 1.5, b + 1]);
      q = md`A thick tube $a<s<${b}a$ carries total current $I$ spread uniformly over its cross-section. Find $B$ at $s = ${frac[f] || f}a$ in units of $\dfrac{\mu_0I}{2\pi a}$.`;
      ans = f < 1 ? 0 : f > b ? 1 / f : (f * f - 1) / ((b * b - 1) * f);
      sol = f < 1 ? md`Inside the hole nothing is enclosed: $0$.`
        : f > b ? md`Outside: all of $I$, $B = \mu_0I/2\pi s$: $${num(ans)}$ units.`
          : md`$I_{\text{enc}} = I\dfrac{s^2 - a^2}{${b * b}a^2 - a^2}$, then divide by $2\pi s$: $\dfrac{(${f})^2 - 1}{${b * b - 1}\cdot${f}}\approx${num(ans)}$ units.`;
    } else {
      const b = pick([2, 3]), f = pick([0.5, 1.5, b + 1]);
      q = md`A coax: solid inner wire of radius $a$ carrying $I$ (uniform), thin outer shell at $s = ${b}a$ carrying $-I$. Find $B$ at $s = ${frac[f] || f}a$ in units of $\dfrac{\mu_0I}{2\pi a}$.`;
      ans = f < 1 ? f : f < b ? 1 / f : 0;
      sol = f < 1 ? md`Inside a uniform wire $B = \dfrac{\mu_0Is}{2\pi a^2}$: $${num(ans)}$ units.`
        : f < b ? md`Between: only the inner $I$, $B = \mu_0I/2\pi s$: $${num(ans)}$ units.` : md`Outside: net current zero, $B = 0$.`;
    }
    return { title: 'Ampère: B at one radius', q, parts: [{ lbl: md`$B$`, ans, unit: '' }], hints: [md`$B\cdot2\pi s = \mu_0I_{\text{enc}}$. Only the enclosed current matters.`], sol };
  };

  // ---------------------------------------------------------------- 3. capacitors with dielectrics
  GENS.e2_cap = () => {
    const e1 = ri(2, 6); let e2; do { e2 = ri(2, 6); } while (e2 === e1);
    const v = pick(['stacked', 'side', 'mixed']);
    if (v === 'stacked') {
      const C = 2 * e1 * e2 / (e1 + e2), sb = 1 / e2 - 1 / e1;
      return {
        title: 'Stacked dielectrics',
        q: md`A parallel-plate capacitor is filled with two slabs of equal thickness, $\varepsilon_{r1} = ${e1}$ against the top ($+\sigma$) plate and $\varepsilon_{r2} = ${e2}$ against the bottom. Find (a) $C/C_0$ ($C_0$: empty), (b) the net bound charge at the interface between the slabs, in units of $\sigma$.`,
        parts: [{ lbl: md`(a) $C/C_0$`, ans: C, unit: '' }, { lbl: md`(b) $\sigma_b/\sigma$`, ans: sb, unit: '' }],
        hints: [md`Stacked = series: same $D = \sigma$ in both.`, md`$P_i = \sigma(1 - 1/\varepsilon_{ri})$. At the interface: $+P_1$ (bottom face of slab 1) $-P_2$ (top face of slab 2).`],
        sol: md`(a) $\dfrac{C_0}{C} = \tfrac12\left(\tfrac1{${e1}} + \tfrac1{${e2}}\right)$, so $C/C_0 = ${num(C)}$. (b) $\left(1 - \tfrac1{${e1}}\right) - \left(1 - \tfrac1{${e2}}\right) = \tfrac1{${e2}} - \tfrac1{${e1}} = ${num(sb)}$. Check: it's the jump in $\varepsilon_0E/\sigma$ across the interface.`,
      };
    }
    if (v === 'side') {
      const C = (e1 + e2) / 2, f = e1 / (e1 + e2);
      return {
        title: 'Side-by-side dielectrics',
        q: md`A parallel-plate capacitor is filled side by side: half the area with $\varepsilon_{r1} = ${e1}$, half with $\varepsilon_{r2} = ${e2}$, each the full gap. Find (a) $C/C_0$, (b) the fraction of the plate's free charge sitting on the $\varepsilon_{r1}$ half.`,
        parts: [{ lbl: md`(a) $C/C_0$`, ans: C, unit: '' }, { lbl: md`(b) fraction`, ans: f, unit: '' }],
        hints: [md`Side by side = parallel: same $E = V/d$ in both halves, $D_i = \varepsilon_iE$.`],
        sol: md`(a) $\tfrac12(${e1} + ${e2}) = ${num(C)}$. (b) $\sigma_f\propto\varepsilon_r$: $\tfrac{${e1}}{${e1 + e2}} = ${num(f)}$.`,
      };
    }
    const C = e1 / 2 + e2 / (1 + e2);
    return {
      title: 'Half side by side, half stacked',
      q: md`Left half of a capacitor's area: $\varepsilon_{r1} = ${e1}$ over the full gap. Right half: $\varepsilon_{r2} = ${e2}$ in the lower half of the gap, vacuum above. Find $C/C_0$.`,
      parts: [{ lbl: md`$C/C_0$`, ans: C, unit: '' }],
      hints: [md`Left and right halves in parallel; the two layers on the right in series.`],
      sol: md`Left: $\tfrac{${e1}}{2}$. Right: two layers of thickness $d/2$ in series, each $\varepsilon_{ri}\cdot\tfrac{A/2}{d/2}$, giving $\tfrac{${e2}}{1 + ${e2}}$ in units of $C_0$. Total $${num(C)}$.`,
    };
  };

  // ---------------------------------------------------------------- 4. depolarizing factor: one number per shape
  GENS.e2_depol = (o = {}) => {
    const shapes = [
      { n: 'a sphere', N: 1 / 3, Nt: '\\tfrac13' },
      { n: 'a thin slab, field (or polarization) perpendicular to its faces', N: 1, Nt: '1' },
      { n: 'a long cylinder, field (or polarization) perpendicular to its axis', N: 0.5, Nt: '\\tfrac12' },
      { n: 'a long needle along the field (or polarization)', N: 0, Nt: '0' },
    ];
    const s = pick(shapes);
    const kinds = o.kinds || ['P', 'E0', 'M', 'H'];
    const k = pick(kinds);
    const er = ri(2, 8);
    let q, ans, sol;
    if (k === 'P') {
      q = md`The object is ${s.n}, with frozen-in uniform polarization $\vb P$. Find $\vb E$ inside, as a multiple of $\vb P/\varepsilon_0$.`;
      ans = -s.N; sol = md`$\vb E_{\text{in}} = -N\vb P/\varepsilon_0$ with $N = ${s.Nt}$: $${num(ans)}$.`;
    } else if (k === 'E0') {
      q = md`The object is ${s.n}, made of linear dielectric $\varepsilon_r = ${er}$, in a uniform external field $\vb E_0$. Find $E_{\text{in}}/E_0$.`;
      ans = 1 / (1 + s.N * (er - 1)); sol = md`$E_{\text{in}} = \dfrac{E_0}{1 + N\chi_e}$ with $N = ${s.Nt}$, $\chi_e = ${er - 1}$: $${num(ans)}$.`;
    } else if (k === 'M') {
      q = md`The object is ${s.n}, with frozen-in uniform magnetization $\vb M$. Find $\vb B$ inside, as a multiple of $\mu_0\vb M$.`;
      ans = 1 - s.N; sol = md`$\vb B_{\text{in}} = \mu_0(1 - N)\vb M$ with $N = ${s.Nt}$: $${num(ans)}$. (Electric twin: $-N$. The magnetic answer is $1 - N$ because $\vb B = \mu_0(\vb H + \vb M)$ and $\vb H_{\text{in}} = -N\vb M$.)`;
    } else {
      q = md`The object is ${s.n}, with frozen-in uniform magnetization $\vb M$. Find $\vb H$ inside, as a multiple of $\vb M$.`;
      ans = -s.N; sol = md`$\vb H_{\text{in}} = -N\vb M$ with $N = ${s.Nt}$: $${num(ans)}$.`;
    }
    return { title: 'One number per shape', q, parts: [{ lbl: md`answer`, ans, unit: '' }], hints: [md`Depolarizing factor: slab ⊥ $1$, sphere $\tfrac13$, cylinder ⊥ $\tfrac12$, needle along $0$.`], sol };
  };

  // ---------------------------------------------------------------- 5. spinning charge
  GENS.e2_spin = () => {
    const o = pick([
      { n: 'a thin ring', IM: 1, c: 0.25, ct: '\\tfrac14' },
      { n: 'a flat disk (uniform surface charge)', IM: 0.5, c: 0.5, ct: '\\tfrac12' },
      { n: 'a spherical shell (uniform surface charge)', IM: 2 / 3, c: 1 / 6, ct: '\\tfrac16' },
      { n: 'a solid ball (uniform volume charge)', IM: 0.4, c: 0.25, ct: '\\tfrac14' },
    ]);
    const m = o.IM / 2;
    const far = Math.random() < 0.5;
    return {
      title: 'Spinning charge: moment and field',
      q: md`${o.n.charAt(0).toUpperCase() + o.n.slice(1)} of radius $R$ and total charge $Q$ spins at $\omega$ about its symmetry axis. Find (a) $m$ in units of $Q\omega R^2$, (b) ${far ? md`$B$ on the axis far away ($z\gg R$), in units of $\dfrac{\mu_0Q\omega R^2}{\pi z^3}$` : md`$B$ at the center, in units of $\dfrac{\mu_0Q\omega}{\pi R}$`}.`,
      parts: [{ lbl: md`(a) $m$`, ans: m, unit: '' }, { lbl: md`(b) $B$`, ans: far ? m / 2 : o.c, unit: '' }],
      hints: [md`$m = \dfrac{Q}{2M}L = \dfrac{Q}{2M}I_{\text{moment}}\omega$. Ring $MR^2$, disk $\tfrac12MR^2$, shell $\tfrac23MR^2$, ball $\tfrac25MR^2$.`, far ? md`Far on the axis: $B = \dfrac{\mu_0}{4\pi}\dfrac{2m}{z^3}$.` : md`Center fields: ring $\mu_0I/2R$ with $I = Q\omega/2\pi$; disk $\tfrac12\mu_0\sigma\omega R$; shell $\tfrac23\mu_0\sigma\omega R$; ball $\tfrac13\mu_0\rho\omega R^2$.`],
      sol: md`(a) $\tfrac12\cdot${num(o.IM)} = ${num(m)}$. (b) ${far ? md`$\dfrac{\mu_0m}{2\pi z^3}$, so $${num(m / 2)}$ units.` : md`$${o.ct}$ (ring $\tfrac14$, disk $\tfrac12$, shell $\tfrac16$, ball $\tfrac14$).`}`,
    };
  };

  // ---------------------------------------------------------------- 6. images with a dielectric
  GENS.e2_dimg = () => {
    const er = pick([2, 3, 4, 5, 7, 9]), b = (er - 1) / (er + 1);
    const pool = [
      { lbl: md`image charge, in units of $q$`, ans: -b, why: md`$q' = -\frac{\varepsilon_r - 1}{\varepsilon_r + 1}q$` },
      { lbl: md`$F_z$ on $q$, in units of $\dfrac{q^2}{16\pi\varepsilon_0d^2}$`, ans: -b, why: md`$F = \frac{qq'}{4\pi\varepsilon_0(2d)^2}$` },
      { lbl: md`$\sigma_b$ directly below $q$, in units of $\dfrac{q}{2\pi d^2}$`, ans: -b, why: md`$\sigma_b = -\frac{1}{2\pi}\frac{\chi_e}{\chi_e+2}\frac{qd}{(s^2+d^2)^{3/2}}$ at $s = 0$` },
      { lbl: md`$V$ on the surface directly below $q$, in units of $\dfrac{q}{4\pi\varepsilon_0d}$`, ans: 2 / (er + 1), why: md`below, $V = \frac{1}{4\pi\varepsilon_0}\frac{q''}{R}$ with $q'' = \frac{2q}{\varepsilon_r + 1}$, $R = d$` },
      { lbl: md`$V$ inside the dielectric at depth $d$ directly below $q$, in units of $\dfrac{q}{4\pi\varepsilon_0d}$`, ans: 1 / (er + 1), why: md`$q'' = \frac{2q}{\varepsilon_r+1}$ seen from distance $2d$` },
    ];
    const ch = U.shuffle(pool).slice(0, 2);
    return {
      title: 'Point charge above a dielectric',
      q: md`A point charge $q$ sits at height $d$ above a flat dielectric half-space with $\varepsilon_r = ${er}$. Find:`,
      parts: ch.map((p) => ({ lbl: p.lbl, ans: p.ans, unit: '' })),
      hints: [md`$q' = -\dfrac{\varepsilon_r - 1}{\varepsilon_r + 1}q$ at the mirror point (for the region above); $q'' = \dfrac{2q}{\varepsilon_r + 1}$ at $q$'s location (for the region below).`],
      sol: md`$\dfrac{\varepsilon_r - 1}{\varepsilon_r + 1} = \dfrac{${er - 1}}{${er + 1}}$.

${ch.map((p) => `- ${p.why}: $${num(p.ans)}$.`).join('\n')}`,
    };
  };

  // ---------------------------------------------------------------- 7. bound sources from power-law P or M
  GENS.e2_bound = (o = {}) => {
    const kind = pick(o.kinds || ['Psph', 'Pcyl', 'Mphi', 'Mz']);
    const n = kind === 'Mz' ? ri(1, 3) : ri(0, 3), h = Math.pow(0.5, n - 1);
    const T = {
      Psph: { setup: md`A sphere of radius $R$ has $\vb P = kr^{${n}}\,\uv r$ (no free charge).`,
        parts: [[md`$\rho_b(R/2)$, in units of $kR^{${n - 1}}$`, -(n + 2) * h, md`$\rho_b = -\frac{1}{r^2}\frac{d}{dr}(kr^{${n + 2}}) = -${n + 2}kr^{${n - 1}}$`],
          [md`$\sigma_b$, in units of $kR^{${n}}$`, 1, md`$\sigma_b = P(R)$`],
          [md`$E_r(R/2)$, in units of $kR^{${n}}/\varepsilon_0$`, -Math.pow(0.5, n), md`$\vb D = 0$ by symmetry, so $\vb E = -\vb P/\varepsilon_0$`]] },
      Pcyl: { setup: md`A long cylinder of radius $R$ has $\vb P = ks^{${n}}\,\hat{\mathbf s}$ (no free charge).`,
        parts: [[md`$\rho_b(R/2)$, in units of $kR^{${n - 1}}$`, -(n + 1) * h, md`$\rho_b = -\frac1s\frac{d}{ds}(ks^{${n + 1}}) = -${n + 1}ks^{${n - 1}}$`],
          [md`$\sigma_b$, in units of $kR^{${n}}$`, 1, md`$\sigma_b = P(R)$`],
          [md`$E_s(R/2)$, in units of $kR^{${n}}/\varepsilon_0$`, -Math.pow(0.5, n), md`$\vb D = 0$, $\vb E = -\vb P/\varepsilon_0$`]] },
      Mphi: { setup: md`A long cylinder of radius $R$ has $\vb M = ks^{${n}}\,\hat{\boldsymbol\phi}$ (no free current).`,
        parts: [[md`$J_{b,z}(R/2)$, in units of $kR^{${n - 1}}$`, (n + 1) * h, md`$J_{b,z} = \frac1s\frac{d}{ds}(ks^{${n + 1}}) = ${n + 1}ks^{${n - 1}}$`],
          [md`$K_{b,z}$, in units of $kR^{${n}}$`, -1, md`$\vb K_b = \vb M\times\hat{\mathbf s} = -kR^{${n}}\hat{\mathbf z}$`],
          [md`$B_\phi(R/2)$, in units of $\mu_0kR^{${n}}$`, Math.pow(0.5, n), md`$\vb H = 0$ by symmetry, so $\vb B = \mu_0\vb M$`]] },
      Mz: { setup: md`A long cylinder of radius $R$ has $\vb M = ks^{${n}}\,\hat{\mathbf z}$ (no free current).`,
        parts: [[md`$J_{b,\phi}(R/2)$, in units of $kR^{${n - 1}}$`, -n * h, md`$J_{b,\phi} = -\frac{d}{ds}(ks^{${n}}) = -${n}ks^{${n - 1}}$`],
          [md`$K_{b,\phi}$, in units of $kR^{${n}}$`, 1, md`$\vb K_b = \vb M\times\hat{\mathbf s} = kR^{${n}}\hat{\boldsymbol\phi}$`],
          [md`$B_z(R/2)$, in units of $\mu_0kR^{${n}}$`, Math.pow(0.5, n), md`$\vb H = 0$ by symmetry, so $\vb B = \mu_0\vb M$`]] },
    }[kind];
    return {
      title: kind[0] === 'P' ? 'Bound charge from a given P' : 'Bound current from a given M',
      q: T.setup,
      parts: T.parts.map((p) => ({ lbl: p[0], ans: p[1], unit: '' })),
      hints: [kind[0] === 'P' ? md`$\rho_b = -\nabla\cdot\vb P$, $\sigma_b = \vb P\cdot\uv n$; no free charge + symmetry ⇒ $\vb D = 0$.` : md`$\vb J_b = \nabla\times\vb M$, $\vb K_b = \vb M\times\uv n$; no free current + symmetry ⇒ $\vb H = 0$.`],
      sol: T.parts.map((p) => `- ${p[2]}: $${num(p[1])}$.`).join('\n'),
    };
  };
})();

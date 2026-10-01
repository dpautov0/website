/* gens-legendre.js — randomized Legendre-polynomial drills (exact fractions in the answers and solutions).
   GENS.leg_expand   : write a polynomial in cos θ as Σ a_ℓ P_ℓ(cos θ)
   GENS.leg_sphere   : sphere held at V₀(θ) = polynomial in cos θ: center value, points inside/outside, Q, σ, E at center
   GENS.leg_integral : orthogonality and ∫ x^k P_ℓ(x) dx, done by the shortcuts (degree and parity)
   GENS.leg_value    : P_ℓ(cos θ) at standard angles */
(function () {
  'use strict';
  const md = String.raw;
  const ri = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const num = (v) => (+v.toFixed(5)).toString();

  // ---------------------------------------------------------------- exact fractions
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  class Fr {
    constructor(n, d = 1) { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d); this.n = n / g; this.d = d / g; }
    add(o) { return new Fr(this.n * o.d + o.n * this.d, this.d * o.d); }
    mul(o) { return new Fr(this.n * o.n, this.d * o.d); }
    get v() { return this.n / this.d; }
    get zero() { return this.n === 0; }
    tex() { return this.d === 1 ? String(this.n) : `${this.n < 0 ? '-' : ''}\\tfrac{${Math.abs(this.n)}}{${this.d}}`; }
  }
  const F = (n, d = 1) => new Fr(n, d);
  const sumF = (arr) => arr.reduce((s, x) => s.add(x), F(0));

  // P_ℓ(x) as coefficient lists in powers of x (ℓ = 0..4)
  const PC = [[F(1)], [F(0), F(1)], [F(-1, 2), F(0), F(3, 2)], [F(0), F(-3, 2), F(0), F(5, 2)], [F(3, 8), F(0), F(-30, 8), F(0), F(35, 8)]];
  const PTEX = ['1', 'x', '\\tfrac12(3x^2-1)', '\\tfrac12(5x^3-3x)', '\\tfrac18(35x^4-30x^2+3)'];
  // x^k in the Legendre basis
  const MONO = [{ 0: F(1) }, { 1: F(1) }, { 0: F(1, 3), 2: F(2, 3) }, { 1: F(3, 5), 3: F(2, 5) }, { 0: F(1, 5), 2: F(4, 7), 4: F(8, 35) }];
  const MONOTEX = ['P_0', 'P_1', '\\tfrac13P_0+\\tfrac23P_2', '\\tfrac35P_1+\\tfrac25P_3', '\\tfrac15P_0+\\tfrac47P_2+\\tfrac{8}{35}P_4'];
  const Pval = (l, x) => PC[l].reduce((s, c, k) => s + c.v * Math.pow(x, k), 0);

  // polynomial Σ c_k cos^k θ  ->  Legendre coefficients a_ℓ (fractions)
  function toLegendre(c) {
    const a = c.map(() => F(0));
    c.forEach((ck, k) => { if (!ck) return; for (const [l, f] of Object.entries(MONO[k])) a[+l] = a[+l].add(f.mul(F(ck))); });
    while (a.length > 1 && a[a.length - 1].zero) a.pop();
    return a;
  }
  // c = [c0, c1, ...] -> TeX of Σ c_k u^k with u = cos θ (or x)
  function polyTex(c, useX = false) {
    const mon = (k) => (k === 0 ? '' : useX ? (k === 1 ? 'x' : `x^{${k}}`) : (k === 1 ? '\\cos\\theta' : `\\cos^{${k}}\\theta`));
    const terms = [];
    c.forEach((ck, k) => {
      if (!ck) return;
      const sign = ck < 0 ? '-' : '+', mag = Math.abs(ck);
      terms.push(k === 0 ? `${sign}${mag}` : `${sign}${mag === 1 ? '' : mag + '\\,'}${mon(k)}`);
    });
    return terms.join('').replace(/^\+/, '') || '0';
  }
  function legTex(a) {
    const t = [];
    a.forEach((f, l) => { if (f.zero) return; const c = f.tex(); t.push(`${f.n < 0 ? '' : '+'}${c === '1' ? '' : c === '-1' ? '-' : c}P_{${l}}`); });
    return t.join('').replace(/^\+/, '') || '0';
  }
  const fracTex = (x) => (x === 0.5 ? '\\tfrac12' : x === -0.5 ? '-\\tfrac12' : String(x));

  // a sphere with its surface condition written beside it
  function sphereFig(lab, opts = {}) {
    const f = PF.fig();
    const cx = 110, cy = 110, R = 64;
    f.sphere(cx, cy, R);
    f.line(cx, cy + R + 12, cx, cy - R - 34, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(cx + 6, cy - R - 34, 'z', 'l', 'small accent');
    f.line(cx, cy, cx - R * 0.72, cy + R * 0.69, { cls: 'dim', arrow: 'end' }); f.label(cx - R * 0.42 - 8, cy + R * 0.32, 'R', 'r', 'small');
    f.label(cx + R * 0.72 + 12, cy - R * 0.72 - 6, lab, 'bl');
    for (const p of (opts.pts || [])) { f.dot(cx + p.x * R, cy - p.z * R, 3); f.label(cx + p.x * R + 7, cy - p.z * R, p.lab, 'l', 'small'); }
    return f.svg();
  }

  // ---------------------------------------------------------------- 1. expansion
  GENS.leg_expand = (o = {}) => {
    const deg = o.deg || pick([2, 3, 3, 4]);
    let c;
    do { c = Array.from({ length: deg + 1 }, () => ri(-3, 3)); c[deg] = pick([-3, -2, -1, 1, 2, 3]); } while (c.filter(Boolean).length < 2);
    const a = toLegendre(c);
    while (a.length < deg + 1) a.push(F(0));
    const used = c.map((ck, k) => (ck && k >= 2 ? k : -1)).filter((k) => k >= 0);
    const atOne = c.reduce((s, x) => s + x, 0);
    return {
      title: 'Expand in Legendre polynomials',
      q: md`A sphere's surface is held at $V_0(\theta) = V_0\left[${polyTex(c)}\right]$. Write it as $V_0\sum_\ell a_\ell P_\ell(\cos\theta)$: find $a_0$ through $a_{${deg}}$.`,
      figHtml: sphereFig('V_0(\\theta)'),
      parts: a.map((f, l) => ({ lbl: `a_{${l}}`, ans: f.v, unit: '' })),
      hints: [
        md`Don't integrate. With $x = \cos\theta$, rewrite each power of $x$ in Legendre polynomials and collect.`,
        md`${used.map((k) => `$x^{${k}} = ${MONOTEX[k]}$`).join(', ')}. Lower powers are already Legendre polynomials: $1 = P_0$, $x = P_1$.`,
      ],
      sol: md`
        With $x=\cos\theta$: $\;V_0(\theta)/V_0 = ${polyTex(c, true)}$. Replace each power:
        $$${c.map((ck, k) => (ck ? `x^{${k}} = ${MONOTEX[k]}` : null)).filter(Boolean).join(',\\qquad ')}$$
        Collecting the $P_\ell$ terms:
        $$\frac{V_0(\theta)}{V_0} = ${legTex(a)},$$
        so ${a.map((f, l) => `$a_{${l}} = ${f.tex()}$`).join(', ')}.

        **Check:** at $\theta = 0$ every $P_\ell(1) = 1$, so $\sum a_\ell$ must equal the polynomial at $x = 1$, which is $${atOne}$; here $\sum a_\ell = ${sumF(a).tex()}$ ✓. A degree-${deg} polynomial needs only $\ell \le ${deg}$, and each power $x^k$ only feeds $P_\ell$ with $\ell$ of the same parity as $k$.
      `,
    };
  };

  // ---------------------------------------------------------------- 2. sphere held at V0(θ)
  GENS.leg_sphere = () => {
    let c;
    do { c = [ri(-2, 3), ri(-3, 3), ri(-3, 3)]; if (Math.random() < 0.35) c.push(pick([-2, -1, 1, 2])); } while (c.filter(Boolean).length < 2 || (!c[1] && !c[2]));
    const a = toLegendre(c);
    const sum = (fn) => a.reduce((s, f, l) => s + f.v * fn(l), 0);
    const pool = [
      { name: md`$V$ at the center`, lbl: md`$V(0)$, in units of $V_0$`, ans: a[0].v, why: md`only $\ell=0$ survives at $r=0$, so $V(0) = a_0V_0$ (the average of $V_0(\theta)$ over the sphere)` },
      { name: md`$V$ at $r = R/2$, $\theta = 0$`, lbl: md`$V(R/2,\,0)$, in units of $V_0$`, ans: sum((l) => Math.pow(0.5, l)), why: md`inside, $V = V_0\sum a_\ell(r/R)^\ell P_\ell(\cos\theta)$ and $P_\ell(1) = 1$, so $V = V_0\sum a_\ell(1/2)^\ell$` },
      { name: md`$V$ at $r = 2R$, $\theta = \pi$`, lbl: md`$V(2R,\,\pi)$, in units of $V_0$`, ans: sum((l) => Math.pow(0.5, l + 1) * (l % 2 ? -1 : 1)), why: md`outside, $V = V_0\sum a_\ell(R/r)^{\ell+1}P_\ell(\cos\theta)$ and $P_\ell(-1) = (-1)^\ell$, so $V = V_0\sum a_\ell(1/2)^{\ell+1}(-1)^\ell$` },
      { name: md`the total charge`, lbl: md`$Q$, in units of $4\pi\varepsilon_0RV_0$`, ans: a[0].v, why: md`far away $V\to a_0V_0R/r$, which must be $Q/(4\pi\varepsilon_0r)$, so $Q = 4\pi\varepsilon_0RV_0\,a_0$` },
      { name: md`$\sigma$ at the north pole`, lbl: md`$\sigma(0)$, in units of $\varepsilon_0V_0/R$`, ans: sum((l) => 2 * l + 1), why: md`$\sigma = -\varepsilon_0[\partial_rV_{\text{out}}-\partial_rV_{\text{in}}]_R = \dfrac{\varepsilon_0V_0}{R}\sum(2\ell+1)a_\ell P_\ell(\cos\theta)$, so at $\theta=0$ it is $\sum(2\ell+1)a_\ell$` },
      { name: md`$E_z$ at the center`, lbl: md`$E_z(0)$, in units of $V_0/R$`, ans: -a[1].v, why: md`near the center $V\approx V_0[a_0 + a_1z/R]$ (only $\ell = 1$ is linear in the coordinates), so $E_z = -\partial V/\partial z = -a_1V_0/R$` },
    ];
    const chosen = [pool[0], pick([pool[1], pool[5]]), pick([pool[2], pool[3], pool[4]])];
    return {
      title: 'Sphere held at a polynomial potential',
      q: md`A thin spherical shell of radius $R$ (no other charges anywhere) is held at $V_0(\theta) = V_0\left[${polyTex(c)}\right]$. Find the quantities below, in the units shown.`,
      figHtml: sphereFig(`V_0\\left[${polyTex(c)}\\right]`),
      parts: chosen.map((p) => ({ lbl: p.lbl, ans: p.ans, unit: '' })),
      hints: [
        md`Expand $V_0(\theta)$ in Legendre polynomials by eye (powers of $\cos\theta$), then use $V_{\text{in}} = V_0\sum a_\ell(r/R)^\ell P_\ell$ and $V_{\text{out}} = V_0\sum a_\ell(R/r)^{\ell+1}P_\ell$.`,
        md`$P_\ell(1) = 1$ and $P_\ell(-1) = (-1)^\ell$, so on the axis no Legendre polynomial needs evaluating.`,
      ],
      sol: md`
        **Boundary conditions:** (1) $V$ finite at $r=0$, so keep only $r^\ell$ inside; (2) $V\to0$ as $r\to\infty$, so keep only $r^{-(\ell+1)}$ outside; (3) $V(R,\theta) = V_0(\theta)$ from both sides, which fixes the coefficients.

        **Expand:** $\dfrac{V_0(\theta)}{V_0} = ${legTex(a)}$, i.e. ${a.map((f, l) => `$a_{${l}} = ${f.tex()}$`).join(', ')}.

        $$V_{\text{in}} = V_0\sum_\ell a_\ell\left(\frac rR\right)^{\ell}P_\ell(\cos\theta),\qquad V_{\text{out}} = V_0\sum_\ell a_\ell\left(\frac Rr\right)^{\ell+1}P_\ell(\cos\theta).$$

        ${chosen.map((p) => `- **${p.name}:** ${p.why}: ${num(p.ans)}.`).join('\n        ')}
      `,
    };
  };

  // ---------------------------------------------------------------- 3. integrals
  GENS.leg_integral = () => {
    if (Math.random() < 0.4) {
      const l = ri(0, 4), m = Math.random() < 0.5 ? l : ri(0, 4);
      const ans = l === m ? F(2, 2 * l + 1) : F(0);
      return {
        title: 'Orthogonality',
        q: md`Evaluate $\displaystyle\int_0^\pi P_{${l}}(\cos\theta)\,P_{${m}}(\cos\theta)\,\sin\theta\,d\theta$. (The plot shows both functions of $\theta$.)`,
        figHtml: PF.plot({ w: 300, h: 170, x: [0, Math.PI], y: [-1.1, 1.1], zero: true, xl: '\\theta', xt: [[Math.PI / 2, '\\tfrac\\pi2'], [Math.PI, '\\pi']], yt: [[1, '1'], [-1, '-1']], curves: [{ f: (t) => Pval(l, Math.cos(t)) }, { f: (t) => Pval(m, Math.cos(t)), cls: 'dim dash' }] }),
        parts: [{ lbl: 'I', ans: ans.v, unit: '' }],
        hints: [md`With $x=\cos\theta$, $dx = -\sin\theta\,d\theta$ and the limits flip: this is $\int_{-1}^{1}P_{${l}}(x)P_{${m}}(x)\,dx$.`, md`Orthogonality: zero unless $\ell = m$; for $\ell = m$ it is $\dfrac{2}{2\ell+1}$.`],
        sol: md`Substitute $x = \cos\theta$: the integral becomes $\int_{-1}^1 P_{${l}}P_{${m}}\,dx$. ${l === m ? `Same index, so it is the normalization $\\dfrac{2}{2\\ell+1} = ${ans.tex()}$.` : 'Different indices, so it vanishes by orthogonality: $0$. No need to multiply anything out.'} The $\sin\theta$ is not optional: without it this is not the orthogonality integral.`,
      };
    }
    const l = ri(1, 4), k = ri(0, 4);
    let s = F(0);
    PC[l].forEach((cf, n) => { const p = n + k; if (p % 2 === 0) s = s.add(cf.mul(F(2, p + 1))); });
    const reason = k < l ? `$x^{${k}}$ is a combination of $P_0,\\dots,P_{${k}}$ only, and every one of those is orthogonal to $P_{${l}}$ (since $${k}<${l}$): the integral is $0$ without any work.`
      : (k - l) % 2 ? `$x^{${k}}P_{${l}}(x)$ is an odd function (the parities of $x^{${k}}$ and $P_{${l}}$ differ), so its integral over $[-1,1]$ is $0$.`
        : `Expand $x^{${k}} = ${MONOTEX[k]}$; by orthogonality only the $P_{${l}}$ term survives, giving its coefficient times $\\tfrac{2}{2\\cdot${l}+1}$.`;
    return {
      title: 'Integral against a Legendre polynomial',
      q: md`Evaluate $\displaystyle\int_{-1}^{1} x^{${k}}\,P_{${l}}(x)\,dx$, where $P_{${l}}(x) = ${PTEX[l]}$. (Solid: $P_{${l}}$; dashed: $x^{${k}}$.)`,
      figHtml: PF.plot({ w: 300, h: 170, x: [-1, 1], y: [-1.1, 1.1], zero: true, xl: 'x', xt: [[-1, '-1'], [1, '1']], yt: [[1, '1'], [-1, '-1']], curves: [{ f: (x) => Pval(l, x) }, { f: (x) => Math.pow(x, k), cls: 'dim dash' }] }),
      parts: [{ lbl: 'I', ans: s.v, unit: '' }],
      hints: [md`Two shortcuts before any algebra: a polynomial of degree less than $\ell$ is orthogonal to $P_\ell$, and an odd integrand integrates to zero on $[-1,1]$.`],
      sol: md`${reason} Result: $${s.tex()}$.`,
    };
  };

  // ---------------------------------------------------------------- 4. values
  GENS.leg_value = () => {
    const l = ri(1, 4);
    const [dtex, x] = pick([['0', 1], ['60^\\circ', 0.5], ['90^\\circ', 0], ['120^\\circ', -0.5], ['180^\\circ', -1]]);
    const v = Pval(l, x);
    const xt = fracTex(x);
    return {
      title: 'Evaluate a Legendre polynomial',
      q: md`Evaluate $P_{${l}}(\cos\theta)$ at $\theta = ${dtex}$, where $P_{${l}}(x) = ${PTEX[l]}$.`,
      figHtml: PF.plot({ w: 300, h: 170, x: [0, 180], y: [-1.1, 1.1], zero: true, xl: '\\theta\\,(^\\circ)', xt: [[90, '90'], [180, '180']], yt: [[1, '1'], [-1, '-1']], curves: [{ f: (t) => Pval(l, Math.cos(t * Math.PI / 180)) }] }),
      parts: [{ lbl: `P_{${l}}(\\cos ${dtex})`, ans: v, unit: '' }],
      hints: [md`$\cos ${dtex} = ${xt}$.${x === 1 || x === -1 ? ' At the poles there is a shortcut: $P_\\ell(1)=1$, $P_\\ell(-1)=(-1)^\\ell$.' : x === 0 ? ' At the equator every odd $P_\\ell$ vanishes (they are odd functions).' : ''}`],
      sol: md`$x = \cos ${dtex} = ${xt}$, so $P_{${l}} = ${PTEX[l].replace(/x/g, `\\left(${xt}\\right)`)} = ${num(v)}$.`,
    };
  };

  window.LEG = { Fr, F, toLegendre, polyTex, legTex, Pval, PC, PTEX, MONO, MONOTEX, sphereFig };
})();

/* Unit P — Past-exam patterns.
   Three problem types from a past Hour Exam I, drilled until they are automatic:
   (1) given E (or V), find V and rho, with the origin checked separately (delta functions);
   (2) Gauss's law for superposed spheres, cylinders, cavities and line charges;
   (3) images for a sphere with a twist: held at V0, isolated, charged, a charge inside a shell, a uniform field, energy. */
(function () {
  'use strict';
  const { RF, P, Q } = C;
  const DEG = Math.PI / 180;
  const LESSONS = [];
  // Local md tag: String.raw that also strips the common indentation of lines 2..n.
  const md = (s, ...v) => {
    const L = String.raw(s, ...v).split('\n');
    if (L.length < 2) return L[0];
    const rest = L.slice(1).filter((l) => l.trim());
    const ind = rest.length ? Math.min(...rest.map((l) => l.match(/^ */)[0].length)) : 0;
    return [L[0]].concat(L.slice(1).map((l) => l.slice(Math.min(ind, l.match(/^ */)[0].length)))).join('\n');
  };
  const r1 = (v) => Math.round(v * 10) / 10;
  const dpath = (pts) => `M${pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L')}Z`;
  // translucent tint for a region of negative (or other) charge; not a conductor, so labels may sit on it
  function tint(f, pts, op = 0.22) {
    pts.forEach((p) => f.track(p[0], p[1]));
    f.add(`<path class="nodecl" style="fill:var(--dim);fill-opacity:${op};stroke:none" d="${dpath(pts)}"/>`);
    return f;
  }

  // =====================================================================================
  // Lesson 1 figures
  // =====================================================================================
  // plot of a given radial function (setup figure for "given E or V" problems)
  const pF = (fn, o = {}) => PF.plot(Object.assign({
    w: 340, h: 200, x: [0, 4], y: [0, 4], xl: 'r', yl: 'E_r', zero: true,
    xt: [[1, 'a'], [2, '2a'], [3, '3a']], curves: [{ f: fn }],
  }, o));

  // a tiny Gaussian sphere around the origin, inside a bigger one
  function fTiny() {
    const f = PF.fig();
    const cx = 150, cy = 110;
    f.circle(cx, cy, 82, { cls: 'dash dim' });
    f.circle(cx, cy, 22, { cls: 'dash' });
    f.dot(cx, cy, 3);
    for (const ang of [0, 90, 180, 270]) {
      const c = Math.cos(ang * DEG), s = Math.sin(ang * DEG);
      f.arrow(cx + 27 * c, cy - 27 * s, cx + 66 * c, cy - 66 * s, { hs: 6 });
    }
    f.label(cx + 29, cy - 29, '\\epsilon', 'c', 'small');
    f.tag(cx + 82 * Math.cos(45 * DEG), cy - 82 * Math.sin(45 * DEG), 'r', 'tr', 6, 'small');
    return f.svg();
  }
  // a generic "enclosed charge vs r" graph
  const fQgraph = () => PF.plot({
    w: 340, h: 200, x: [0, 5], y: [0, 1.25], xl: 'r', yl: 'Q_{\\text{enc}}(r)', zero: true,
    yt: [[1, 'Q_0']], xt: [], curves: [{ f: (x) => (1 + x) * Math.exp(-x) }],
  });
  // a point dipole at the origin and a field point
  function fDip() {
    const f = PF.fig();
    const cx = 120, cy = 150;
    f.line(cx, cy + 40, cx, cy - 120, { cls: 'dim dash thin' });
    f.label(cx + 6, cy - 122, 'z', 'bl', 'small accent');
    f.arrow(cx, cy + 14, cx, cy - 22, { cls: 'thick', hs: 8 });
    f.label(cx - 9, cy - 2, '\\vb p', 'r');
    const ang = 50, rr = 120, px = cx + rr * Math.cos(ang * DEG), py = cy - rr * Math.sin(ang * DEG);
    f.line(cx, cy, px, py, { cls: 'dim' });
    f.dot(px, py, 3); f.tag(px, py, 'P', 'tr', 7);
    f.label(cx + 0.55 * rr * Math.cos(ang * DEG) + 10, cy - 0.55 * rr * Math.sin(ang * DEG) + 8, 'r', 'tl', 'small');
    f.arc(cx, cy, 34, ang, 90, { cls: 'dim' });
    f.label(cx + 46 * Math.cos(70 * DEG), cy - 46 * Math.sin(70 * DEG), '\\theta', 'c', 'small');
    return f.svg();
  }
  // a ball of radius R (tinted cloud) with a point at the center: piecewise setups
  function fBallR(o = {}) {
    const f = PF.fig();
    const cx = 130, cy = 110, Rp = 80;
    tint(f, f.arcPts(cx, cy, Rp, Rp, 0, 360), 0.12);
    f.circle(cx, cy, Rp, { cls: o.dashed ? 'dash' : '' });
    f.dot(cx, cy, 3); f.tag(cx, cy, 'O', 'bl', 7, 'small');
    f.dim(cx, cy, cx + Rp * Math.cos(-30 * DEG), cy - Rp * Math.sin(-30 * DEG), '');
    f.label(cx + 0.5 * Rp * Math.cos(-30 * DEG) - 2, cy - 0.5 * Rp * Math.sin(-30 * DEG) - 6, 'R', 'br', 'small');
    if (o.inLab) f.label(cx - 10, cy - 40, o.inLab, 'c', 'small');
    if (o.outLab) f.label(cx + Rp + 12, cy - Rp + 4, o.outLab, 'l', 'small');
    return f.svg();
  }
  // end view of a line along z (cylindrical problem): the axis and the coordinate s
  function fLineEnd() {
    const f = PF.fig();
    const cx = 130, cy = 110;
    f.circle(cx, cy, 6, { cls: 'bgfill' }); f.dot(cx, cy, 2.4);
    f.text(cx - 14, cy + 14, 'axis, out of the page', 'tr');
    f.line(cx + 7, cy, cx + 110, cy - 50, { cls: 'dim' });
    f.dot(cx + 110, cy - 50, 3); f.tag(cx + 110, cy - 50, 'P', 'r', 7);
    f.label(cx + 60, cy - 32, 's', 'b', 'small');
    return f.svg();
  }

  // ---- solution figures for lesson 1
  const pThomsonV = () => PF.plot({
    w: 340, h: 200, x: [0, 1.4], y: [0, 2.2], xl: 'r', yl: 'V\\ (\\text{units } k/R)', zero: true,
    xt: [[0.5, 'R/2'], [1, 'R']], curves: [{ f: (x) => (x < 1 ? 1 / x - 1.5 + x * x / 2 : 0) }],
  });
  const pQencThomson = () => PF.plot({
    w: 340, h: 200, x: [0, 1.4], y: [0, 1.25], xl: 'r', yl: 'Q_{\\text{enc}}\\ (\\text{units } 4\\pi\\varepsilon_0k)', zero: true,
    xt: [[1, 'R']], yt: [[1, '1']], curves: [{ f: (x) => (x < 1 ? 1 - x * x * x : 0) }],
  });

  // =====================================================================================
  // Lesson 1: given E (or V), find V and rho
  // =====================================================================================
  LESSONS.push({
    id: 'uP-delta', title: 'Given E (or V), find V and ρ: watch the origin',
    steps: [
      RF(md`
        ### The pattern

        You are handed a spherically symmetric field, $\vb E = E_r(r)\,\uv r$ (or a potential $V(r)$), and asked for the charge density $\rho$, the potential, and the total charge. The exam trap: the field blows up at $r=0$, and the usual divergence formula silently misses a point charge sitting there.

        Three tools, all from Gauss's law:

        1. **Away from the origin**, differentiate: $\rho = \ep\,\divg\vb E = \dfrac{\ep}{r^2}\dfrac{d}{dr}\left(r^2E_r\right)$.
        2. **At the origin**, use the integral form on a tiny sphere of radius $\epsilon$. By symmetry $\oint\vb E\cdot d\vb a = 4\pi\epsilon^2E_r(\epsilon)$, so the charge enclosed is $Q_{\text{enc}}(\epsilon) = 4\pi\ep\epsilon^2E_r(\epsilon)$. Let $\epsilon\to0$:
        $$q_0 = \lim_{r\to0}4\pi\ep r^2E_r(r).$$
        A finite nonzero $q_0$ means a point charge: $\rho$ contains $q_0\,\delta^3(\vb r)$.
        3. **Far away**, the total charge is $Q_{\text{tot}} = \lim_{r\to\infty}4\pi\ep r^2E_r(r)$.

        [[fig:tiny]]

        The potential comes from integrating in from infinity, $V(r) = -\displaystyle\int_\infty^r E_r(r')\,dr'$, whenever $E_r$ falls off faster than $1/r$.

        !!key The one function to compute
          $Q_{\text{enc}}(r) = 4\pi\ep r^2E_r(r)$ is the charge inside radius $r$. Its value at $r\to0$ is the point charge, its value at $r\to\infty$ is the total charge, and its slope gives the smooth density: $\rho = \dfrac{1}{4\pi r^2}\dfrac{dQ_{\text{enc}}}{dr}$ for $r>0$.
      `, { tiny: { svg: fTiny(), cap: md`Gaussian spheres around the origin. The flux through the tiny sphere (radius $\epsilon$) as $\epsilon\to0$ measures the point charge at $O$; the flux through a big sphere measures everything inside it.` } }),

      Q(md`$\vb E = \dfrac{k}{r^2}\,\uv r$ everywhere ($k$ a constant). The spherical divergence formula gives $\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\cdot\dfrac{k}{r^2}\right) = 0$. What is $\rho$?`,
        [md`$0$ everywhere: the field has no sources`, md`$\ep k/r^2$`, md`$4\pi\ep k\,\delta^3(\vb r)$`, md`It can't be determined from $\vb E$`], 2,
        [md`The flux through every sphere around the origin is $4\pi k$, not zero. Gauss's law then demands charge $4\pi\ep k$ inside every such sphere, however small.`,
          md`That is not a divergence of anything here; the field is $k/r^2$, and $\ep k/r^2$ has the wrong units for a density.`,
          null,
          md`Gauss's law in differential form determines $\rho$ completely once $\vb E$ is known everywhere, including the origin.`],
        md`The formula is valid only where $\vb E$ is differentiable, i.e. for $r>0$, and there it correctly gives $\rho=0$. At $r=0$ use the flux: $4\pi\ep r^2E_r = 4\pi\ep k$ for every $r$, so a point charge $q_0 = 4\pi\ep k$ sits at the origin. This is $\divg(\uv r/r^2) = 4\pi\delta^3(\vb r)$.`,
        { figHtml: fTiny() }),

      Q(md`Which quantity tells you the point charge sitting at the origin?`,
        [md`$\displaystyle\lim_{r\to0}E_r(r)$`, md`$\displaystyle\lim_{r\to0}4\pi\ep r^2E_r(r)$`, md`$\rho(0)$ from the divergence formula`, md`$\displaystyle\lim_{r\to0}4\pi\ep rE_r(r)$`], 1,
        [md`$E_r$ itself is infinite at a point charge; the size of the charge is in how fast it blows up, which is what multiplying by $r^2$ measures.`,
          null,
          md`The divergence formula doesn't apply at $r=0$, and a point charge gives no finite $\rho(0)$ anyway.`,
          md`The flux through a sphere is (field) × (area $4\pi r^2$), so the power is $r^2$, not $r$.`],
        md`Flux through a sphere of radius $r$ is $4\pi r^2E_r$, so $Q_{\text{enc}}(r) = 4\pi\ep r^2E_r$. Shrink the sphere: what is left is the charge at the point itself.`,
        { figHtml: fTiny() }),

      Q(md`The graph shows $Q_{\text{enc}}(r)$, the charge inside radius $r$, for some spherically symmetric distribution. What is the charge made of?`,
        [md`A point charge $Q_0$ at the center plus a negative cloud of total charge $-Q_0$`, md`Only a positive cloud; there is no point charge since $Q_{\text{enc}}$ is finite at $r=0$`, md`A single point charge $Q_0$`, md`A negative point charge plus a positive cloud`], 0,
        [null,
          md`A cloud with finite density contributes $\approx\tfrac43\pi r^3\rho\to0$ as $r\to0$. A nonzero value at $r=0$ can only be a point charge.`,
          md`Then $Q_{\text{enc}}$ would stay at $Q_0$ for every $r$. It falls, so negative charge is being added as you go out.`,
          md`$Q_{\text{enc}}(0)=Q_0>0$ and it decreases: positive point charge, negative cloud.`],
        md`$Q_{\text{enc}}(0^+) = Q_0$ is the point charge. The slope is negative, and $\rho = \dfrac{1}{4\pi r^2}\dfrac{dQ_{\text{enc}}}{dr}<0$: a negative cloud. $Q_{\text{enc}}\to0$ far away, so the total is zero: the cloud exactly screens the charge.`,
        { figHtml: fQgraph() }),

      Q(md`For $\vb E = \dfrac{k}{r^2}\uv r$, what is the flux through a sphere of radius $\epsilon$ centered at the origin, and how does it depend on $\epsilon$?`,
        [md`$0$ for every $\epsilon$`, md`$4\pi k\epsilon^2$, so it vanishes as $\epsilon\to0$`, md`It diverges as $\epsilon\to0$`, md`$4\pi k$ for every $\epsilon$`], 3,
        [md`That is what the naive divergence would predict. The direct calculation says otherwise.`,
          md`The area grows as $\epsilon^2$, but the field falls as $1/\epsilon^2$; the product is constant.`,
          md`The field diverges, but the area shrinks just as fast.`,
          null],
        md`$\oint\vb E\cdot d\vb a = \dfrac{k}{\epsilon^2}\cdot4\pi\epsilon^2 = 4\pi k$. A flux that does not shrink with the surface means the charge is concentrated at a point. By the divergence theorem, $\int\divg\vb E\,d\tau = 4\pi k$ over every ball around the origin: $\divg\vb E = 4\pi k\,\delta^3(\vb r)$.`,
        { figHtml: fTiny() }),

      RF(md`
        ### Why the formula misses the point charge, and the fix

        Write any radial field as $\vb E = f(r)\,\dfrac{\uv r}{r^2}$ with $f(r) = r^2E_r$. The product rule for divergence gives

        $$\divg\vb E = f(r)\,\divg\!\left(\frac{\uv r}{r^2}\right) + \frac{\uv r}{r^2}\cdot\nabla f = 4\pi f(0)\,\delta^3(\vb r) + \frac{1}{r^2}\frac{df}{dr}.$$

        (The delta function only cares about $f$ at the origin, so $f(r)\delta^3(\vb r) = f(0)\delta^3(\vb r)$.) Multiply by $\ep$:

        $$\boxed{\rho(\vb r) = q_0\,\delta^3(\vb r) + \frac{\ep}{r^2}\frac{d}{dr}\left(r^2E_r\right)},\qquad q_0 = 4\pi\ep\lim_{r\to0}r^2E_r.$$

        The first term is what the plain formula drops. The second is the plain formula, valid for $r>0$.

        **Consistency check** (do it on the exam, it takes one line): the charge inside $r$ must equal the point charge plus the cloud,
        $$Q_{\text{enc}}(r) = q_0 + \int_0^r\rho(r')\,4\pi r'^2\,dr'.$$

        !!method Given $\vb E(r)$: the recipe
          1. Compute $Q_{\text{enc}}(r) = 4\pi\ep r^2E_r$.
          2. $q_0 = Q_{\text{enc}}(0^+)$. Nonzero and finite: point charge $q_0\delta^3(\vb r)$. Zero: no point charge. Infinite: see the "steeper than $1/r^2$" section below.
          3. $\rho = \dfrac{1}{4\pi r^2}\dfrac{dQ_{\text{enc}}}{dr}$ for $r>0$. Where $E_r$ jumps at a radius $R$, add a surface charge $\sigma = \ep\left(E_{\text{out}}-E_{\text{in}}\right)$.
          4. $Q_{\text{tot}} = Q_{\text{enc}}(\infty)$.
          5. $V(r) = -\displaystyle\int_\infty^rE_r\,dr'$ (or from another reference point if $E$ doesn't fall off).

        !!trap Two opposite mistakes
          Forgetting the delta when $r^2E_r\to\dfrac{q_0}{4\pi\ep}\neq0$, and adding a delta when $r^2E_r\to0$. A density that is infinite at the origin (like $1/r$) is **not** a point charge if it integrates to zero charge in a tiny ball.
      `),

      Q(md`In some range of $r$, the enclosed charge $Q_{\text{enc}}(r)$ **decreases** as $r$ increases. What is the sign of $\rho$ there?`,
        [md`Positive`, md`Negative`, md`Zero`, md`It depends on the sign of $Q_{\text{enc}}$`], 1,
        [md`Adding positive charge as you go out would make $Q_{\text{enc}}$ grow.`,
          null,
          md`Zero density keeps $Q_{\text{enc}}$ constant.`,
          md`$\rho$ is set by the slope, not by the value: $\rho = \dfrac{1}{4\pi r^2}\dfrac{dQ_{\text{enc}}}{dr}$.`],
        md`Each thin shell adds $dQ = \rho\,4\pi r^2dr$. If $Q_{\text{enc}}$ goes down, the shells hold negative charge.`,
        { figHtml: fQgraph() }),

      Q(md`$\vb E = k\,\uv r$: constant magnitude, pointing radially outward everywhere ($k>0$). What is at the origin, and what is $\rho$ for $r>0$?`,
        [md`A point charge $4\pi\ep k$; $\rho = 0$ for $r>0$`, md`Nothing; $\rho = 0$ everywhere`, md`A point charge $4\pi\ep k$; $\rho = 2\ep k/r$`, md`No point charge; $\rho = 2\ep k/r$`], 3,
        [md`$r^2E_r = kr^2\to0$: no flux escapes a tiny sphere, so no point charge. And a radial field of constant size does diverge.`,
          md`$\dfrac{1}{r^2}\dfrac{d}{dr}(kr^2) = \dfrac{2k}{r}\neq0$.`,
          md`$Q_{\text{enc}} = 4\pi\ep kr^2\to0$ at the origin: no point charge.`,
          null],
        md`$Q_{\text{enc}}(r) = 4\pi\ep kr^2$, which is $0$ at $r=0$: no point charge. $\rho = \dfrac{\ep}{r^2}\dfrac{d}{dr}(kr^2) = \dfrac{2\ep k}{r}$. It is infinite at the origin but integrable: $\int_0^r\dfrac{2\ep k}{r'}4\pi r'^2dr' = 4\pi\ep kr^2\to0$. Infinite density is not the same thing as a point charge.`,
        { figHtml: pF((x) => 1, { y: [0, 2], yt: [[1, 'k']] }) }),

      Q(md`Near the origin, $\vb E\approx-\dfrac{B}{r^2}\,\uv r$ with $B>0$. What sits at the origin?`,
        [md`A point charge $+4\pi\ep B$`, md`Nothing, since the field points inward`, md`A point charge $-4\pi\ep B$`, md`A point charge $-B$`], 2,
        [md`An inward field means negative enclosed charge.`,
          md`Inward or outward, $|r^2E_r|\to B\neq0$: there is a point charge.`,
          null,
          md`Units: $B$ is in V·m. The charge is $4\pi\ep$ times it.`],
        md`$q_0 = \lim 4\pi\ep r^2E_r = -4\pi\ep B$. Field lines end on negative charge, so they point toward it.`,
        { figHtml: pF((x) => -1 / (x * x), { y: [-4, 0.5], yl: 'E_r', xt: [] }) }),

      Q(md`$\vb E = A\,\dfrac{\sin(r/a)}{r^3}\,\uv r$. It looks more singular than a point charge. What is at the origin?`,
        [md`An infinite charge: $1/r^3$ is too singular`, md`A point charge $4\pi\ep A/a$`, md`A point charge $4\pi\ep A$`, md`Nothing, since $\sin 0 = 0$`], 1,
        [md`Expand $\sin(r/a)\approx r/a$ before judging the power: $E_r\approx\dfrac{A}{ar^2}$, an ordinary $1/r^2$ field.`,
          null,
          md`You dropped the $1/a$ from $\sin(r/a)\approx r/a$.`,
          md`The numerator vanishes, but the denominator vanishes faster. Take the limit of $r^2E_r$.`],
        md`$r^2E_r = A\dfrac{\sin(r/a)}{r}\to\dfrac Aa$, so $q_0 = \dfrac{4\pi\ep A}{a}$. Always compute $r^2E_r$ and take the limit; don't judge by the leading power of the denominator alone.`,
        { figHtml: pF((x) => Math.sin(x) / (x * x * x), { y: [-0.3, 3] }) }),

      Q(md`$\vb E = A\,\dfrac{1-\cos(r/a)}{r^4}\,\uv r$. What is at the origin?`,
        [md`An infinite charge`, md`Nothing`, md`A point charge $4\pi\ep A/a^2$`, md`A point charge $2\pi\ep A/a^2$`], 3,
        [md`$1-\cos(r/a)\approx\dfrac{r^2}{2a^2}$ cancels two powers: $E_r\approx\dfrac{A}{2a^2r^2}$.`,
          md`$r^2E_r$ tends to a nonzero constant, so there is a point charge.`,
          md`Missing the $\tfrac12$ from $1-\cos x\approx x^2/2$.`,
          null],
        md`$r^2E_r = A\dfrac{1-\cos(r/a)}{r^2}\to\dfrac{A}{2a^2}$, so $q_0 = 4\pi\ep\cdot\dfrac{A}{2a^2} = \dfrac{2\pi\ep A}{a^2}$.`,
        { figHtml: pF((x) => (1 - Math.cos(x)) / Math.pow(x, 4), { y: [0, 2] }) }),

      Q(md`$\vb E = \dfrac{A}{r^2\,(1+r/a)}\,\uv r$ with $A>0$. Which description is right?`,
        [md`Point charge $4\pi\ep A$, negative cloud, total charge $0$`, md`Point charge $4\pi\ep A$, no cloud`, md`No point charge, positive cloud, total $4\pi\ep A$`, md`Point charge $4\pi\ep A$, positive cloud, total $8\pi\ep A$`], 0,
        [null,
          md`$Q_{\text{enc}} = \dfrac{4\pi\ep A}{1+r/a}$ changes with $r$, so there is a cloud.`,
          md`$Q_{\text{enc}}(0^+) = 4\pi\ep A\neq0$: there is a point charge.`,
          md`$Q_{\text{enc}}$ decreases with $r$, so the cloud is negative, and it tends to $0$.`],
        md`$Q_{\text{enc}}(r) = \dfrac{4\pi\ep A}{1+r/a}$: $4\pi\ep A$ at the origin, decreasing (negative cloud), and $0$ at infinity (total zero).`,
        { figHtml: pF((x) => 1 / (x * x * (1 + x)), { y: [0, 4] }) }),

      Q(md`A field behaves like $\dfrac{3A}{r^2}\uv r$ near the origin and like $\dfrac{A}{r^3}\uv r$ far away. What is the total charge?`,
        [md`$12\pi\ep A$`, md`$4\pi\ep A$`, md`It can't be found without the full formula`, md`$0$`], 3,
        [md`That is the point charge at the center, not the total.`,
          md`There is no $1/r^2$ tail far away to give this.`,
          md`Gauss's law on a huge sphere needs only the far field.`,
          null],
        md`$Q_{\text{tot}} = \lim_{r\to\infty}4\pi\ep r^2\cdot\dfrac{A}{r^3} = 0$. A far field falling faster than $1/r^2$ always means zero net charge. Here a point charge $12\pi\ep A$ is screened completely by a cloud of $-12\pi\ep A$.`,
        { nofig: 'asymptotic behaviour only; nothing to draw' }),

      Q(md`$\vb E = A\,\dfrac{e^{-r/a}}{r^2}\,\uv r$ ($A>0$). Which is right?`,
        [md`Point charge $4\pi\ep A$, no cloud, total $4\pi\ep A$`, md`No point charge; negative cloud`, md`Point charge $4\pi\ep A$, negative cloud, total $0$`, md`Point charge $4\pi\ep A$, positive cloud, total $8\pi\ep A$`], 2,
        [md`The exponential makes $r^2E_r$ fall with $r$: there is a cloud, and the far field dies faster than $1/r^2$.`,
          md`$r^2E_r = Ae^{-r/a}\to A$ at the origin: there is a point charge.`,
          null,
          md`$Q_{\text{enc}} = 4\pi\ep Ae^{-r/a}$ decreases, so the cloud is negative, and it goes to $0$.`],
        md`$Q_{\text{enc}}(r) = 4\pi\ep Ae^{-r/a}$: $4\pi\ep A$ at the center, decreasing to $0$. The cloud is $\rho = \dfrac{1}{4\pi r^2}\dfrac{dQ_{\text{enc}}}{dr} = -\dfrac{\ep A}{a}\dfrac{e^{-r/a}}{r^2}$.`,
        { figHtml: pF((x) => Math.exp(-x) / (x * x), { y: [0, 4] }) }),

      Q(md`$\vb E = \dfrac{k}{r^2}\uv r$ for $r<R$ and $\vb E = 0$ for $r>R$ ($k>0$). Where is the charge?`,
        [md`Only a point charge $4\pi\ep k$ at the origin`, md`A point charge and a uniform negative cloud`, md`A point charge $4\pi\ep k$ and a surface charge $+\ep k/R^2$ on $r=R$`, md`A point charge $4\pi\ep k$ and a surface charge $-\ep k/R^2$ on $r=R$`], 3,
        [md`Then the field outside would be $k/r^2$, not $0$.`,
          md`For $0<r<R$, $r^2E_r = k$ is constant: no cloud.`,
          md`Sign: $E_r$ drops from $k/R^2$ to $0$, so $\sigma = \ep(0-k/R^2)<0$.`,
          null],
        md`$\sigma = \ep(E_{\text{out}}-E_{\text{in}}) = -\ep k/R^2$, total $-4\pi\ep k$, which cancels the point charge. It is a charge at the center of a metal shell that carries the opposite charge on its inner surface.`,
        { figHtml: pF((x) => (x < 1 ? 1 / (x * x) : 0), { x: [0, 2], y: [0, 4], xt: [[1, 'R']] }) }),

      Q(md`$V(r) = \dfrac{A}{r+a}$ ($A, a>0$). What is at the origin, and what is the total charge?`,
        [md`No point charge; total $4\pi\ep A$, spread in a positive cloud`, md`Point charge $4\pi\ep A$; total $4\pi\ep A$`, md`Point charge $4\pi\ep A$; total $0$`, md`No charge anywhere`], 0,
        [null,
          md`$V(0) = A/a$ is finite: no $1/r$ singularity.`,
          md`Far away $V\approx A/r$, so the total is $4\pi\ep A$, not $0$.`,
          md`$V$ is not harmonic: $\tfrac1r(rV)''\neq0$.`],
        md`$rV = \dfrac{Ar}{r+a} = A - \dfrac{Aa}{r+a}\to0$ at the origin: no point charge. $(rV)'' = -\dfrac{2Aa}{(r+a)^3}$, so $\rho = \dfrac{2\ep Aa}{r(r+a)^3}>0$. Far away $V\to A/r$: total $4\pi\ep A$.`,
        { figHtml: pF((x) => 1 / (x + 1), { y: [0, 1.2], yl: 'V', yt: [[1, 'A/a']] }) }),

      RF(md`
        ### Worked example: a point charge in a uniform ball of opposite charge

        Given: $\vb E = k\left(\dfrac{1}{r^2}-\dfrac{r}{R^3}\right)\uv r$ for $r<R$, and $\vb E = 0$ for $r>R$. Find $\rho$, the total charge and $V$.

        [[fig:set]]

        **Enclosed charge.** $Q_{\text{enc}}(r) = 4\pi\ep r^2E_r = 4\pi\ep k\left(1-\dfrac{r^3}{R^3}\right)$ for $r<R$, and $0$ for $r>R$.

        [[fig:q]]

        **Origin.** $Q_{\text{enc}}(0^+) = 4\pi\ep k$: a point charge $q_0 = 4\pi\ep k$.

        **Cloud.** $\rho = \dfrac{\ep}{r^2}\dfrac{d}{dr}\left[k\left(1-\dfrac{r^3}{R^3}\right)\right] = \dfrac{\ep}{r^2}\cdot\left(-\dfrac{3kr^2}{R^3}\right) = -\dfrac{3\ep k}{R^3}$, uniform, for $0<r<R$. Outside, $\rho = 0$.

        **Surface at $R$.** $E_r$ is continuous ($E_{\text{in}}(R) = k\left(\tfrac{1}{R^2}-\tfrac{1}{R^2}\right) = 0 = E_{\text{out}}$), so $\sigma = 0$.

        $$\rho(\vb r) = 4\pi\ep k\,\delta^3(\vb r) - \frac{3\ep k}{R^3}\quad(r<R),\qquad \rho = 0\quad(r>R).$$

        **Check.** Cloud total $= -\dfrac{3\ep k}{R^3}\cdot\dfrac43\pi R^3 = -4\pi\ep k$. Total $= 0$, matching $E=0$ outside.

        **Potential.** Conditions on $V$:

        1. $V\to0$ as $r\to\infty$ (the total charge is finite, here zero).
        2. $V$ is continuous at $r=R$ (no dipole layer; $E$ is finite).

        Outside, $E=0$, so $V$ is constant; condition 1 makes it $0$, and condition 2 gives $V(R)=0$. Inside,
        $$V(r) = -\int_R^r k\left(\frac{1}{r'^2}-\frac{r'}{R^3}\right)dr' = k\left(\frac1r-\frac{3}{2R}+\frac{r^2}{2R^3}\right).$$
        Check: $-\dfrac{dV}{dr} = k\left(\dfrac1{r^2}-\dfrac{r}{R^3}\right)$ ✓, and $V(R) = k\left(1-\tfrac32+\tfrac12\right)/R = 0$ ✓. Near the origin $V\approx k/r$, the potential of $q_0 = 4\pi\ep k$, as it must be.

        [[fig:v]]

        This is a "Thomson atom": a point nucleus inside a uniform ball of opposite charge.
      `, {
        set: { svg: fBallR(), cap: md`The field is given inside the ball of radius $R$ and is zero outside.` },
        q: { svg: pQencThomson(), cap: md`$Q_{\text{enc}}(r)$: it starts at $q_0$ (the point charge) and drops to $0$ at $R$ as the uniform negative cloud is added.` },
        v: { svg: pThomsonV(), cap: md`$V(r)$: like $k/r$ near the center, reaching $0$ at $R$ with zero slope.` },
      }),

      Q(md`In the worked example, why is $V(R) = 0$?`,
        [md`Because $\rho$ is negative near $R$`, md`Because $E=0$ for $r>R$, so $V$ is constant outside, and that constant must be $V(\infty)=0$`, md`Because $V$ is always zero on the surface of a charged ball`, md`Because the point charge and cloud cancel at every radius`], 1,
        [md`The sign of $\rho$ fixes the curvature of $V$, not its value.`,
          null,
          md`A uniformly charged ball with net charge $Q$ has $V(R) = \dfrac{Q}{4\pi\ep R}\neq0$.`,
          md`They cancel only for $r\ge R$; inside, $Q_{\text{enc}}>0$.`],
        md`No field outside means no change in $V$ between $R$ and infinity. With the reference at infinity, $V(R) = 0$.`,
        { figHtml: fBallR() }),

      Q(md`Suppose instead $E_r$ jumped at $r=R$, from $E_{\text{in}}$ just inside to $E_{\text{out}}$ just outside. What charge sits on the sphere $r=R$?`,
        [md`$\sigma = \ep\left(E_{\text{out}}-E_{\text{in}}\right)$`, md`$\sigma = \ep\left(E_{\text{in}}-E_{\text{out}}\right)$`, md`$\sigma = \dfrac{\ep}{2}\left(E_{\text{out}}-E_{\text{in}}\right)$`, md`None: the divergence formula gives $\rho$ only`], 0,
        [null,
          md`Sign: more outward field outside means positive charge on the surface.`,
          md`The jump across a surface charge is $\sigma/\ep$, not $\dfrac{\sigma}{2\ep}$.`,
          md`A jump in $E_r$ is a delta function in $dE_r/dr$; its strength is a surface charge.`],
        md`Pillbox on the surface: $E_{\text{out}}-E_{\text{in}} = \sigma/\ep$. Equivalently, $Q_{\text{enc}}$ jumps by $4\pi R^2\sigma$ at $r=R$.`,
        { figHtml: fBallR() }),

      Q(md`You found $q_0$ and $\rho(r)$ for $r>0$. Which check catches a missing or wrong point charge?`,
        [md`Check that $\rho$ is finite`, md`Check that $\curl\vb E = 0$`, md`Check that $4\pi\ep r^2E_r = q_0 + \displaystyle\int_0^r\rho\,4\pi r'^2dr'$ for some $r$`, md`Check that $V$ is continuous`], 2,
        [md`Densities like $1/r$ are allowed and common here.`,
          md`Any radial field $E_r(r)\uv r$ is curl-free; that tests nothing about charge.`,
          null,
          md`$V$ is continuous whether or not you got $q_0$ right.`],
        md`Gauss's law at radius $r$ counts all the charge inside: the point charge and the cloud. If you forgot $q_0$, the two sides differ by exactly $q_0$.`,
        { figHtml: fQgraph() }),

      P({
        title: 'A point charge, a uniform cloud, and a charged surface',
        q: md`
          $\vb E = k\left(\dfrac{1}{r^2}-\dfrac{2r}{R^3}\right)\uv r$ for $r<R$ and $\vb E = 0$ for $r>R$ ($k>0$).

          Find the point charge at the origin, the density $\rho$ for $0<r<R$, and the surface charge density $\sigma$ on $r=R$.
        `,
        figHtml: fBallR(),
        hints: [
          md`Compute $Q_{\text{enc}}(r) = 4\pi\ep r^2E_r$ first. Its limit at $r\to0$ is the point charge.`,
          md`$\rho = \dfrac{1}{4\pi r^2}\dfrac{dQ_{\text{enc}}}{dr}$ inside.`,
          md`Just inside $R$: $E_r = -k/R^2$. Just outside: $0$. Use $\sigma = \ep(E_{\text{out}}-E_{\text{in}})$.`,
        ],
        parts: [
          { lbl: 'q_0', expr: '4*pi*eps0*k', vars: { eps0: [0.5, 2], k: [0.5, 3] } },
          { lbl: md`$\rho$ for $0<r<R$`, expr: '-6*eps0*k/R^3', vars: { eps0: [0.5, 2], k: [0.5, 3], R: [1, 3] } },
          { lbl: '\\sigma(R)', expr: 'eps0*k/R^2', vars: { eps0: [0.5, 2], k: [0.5, 3], R: [1, 3] } },
          { lbl: md`Total charge`, mc: [md`$0$`, md`$4\pi\ep k$`, md`$-4\pi\ep k$`, md`$-8\pi\ep k$`], a: 0,
            why: [null, md`That is only the point charge.`, md`That leaves out the surface charge $4\pi R^2\sigma = 4\pi\ep k$.`, md`That is only the cloud.`] },
        ],
        sol: md`
          **Enclosed charge.** $Q_{\text{enc}}(r) = 4\pi\ep k\left(1-\dfrac{2r^3}{R^3}\right)$ for $r<R$.

          **Point charge.** $Q_{\text{enc}}(0^+) = 4\pi\ep k$.

          **Cloud.** $\rho = \dfrac{1}{4\pi r^2}\cdot4\pi\ep k\left(-\dfrac{6r^2}{R^3}\right) = -\dfrac{6\ep k}{R^3}$, uniform. Its total is $-\dfrac{6\ep k}{R^3}\cdot\dfrac43\pi R^3 = -8\pi\ep k$.

          **Surface.** $E_{\text{in}}(R) = k\left(\dfrac1{R^2}-\dfrac2{R^2}\right) = -\dfrac{k}{R^2}$, $E_{\text{out}} = 0$, so $\sigma = \ep\left(0+\dfrac{k}{R^2}\right) = \dfrac{\ep k}{R^2}$. Total on the surface: $4\pi R^2\sigma = 4\pi\ep k$.

          **Total.** $4\pi\ep k - 8\pi\ep k + 4\pi\ep k = 0$, consistent with $E=0$ outside. ✓

          **What to remember.** Three places charge can hide: the origin (limit of $r^2E_r$), the volume (slope of $r^2E_r$), and any radius where $E_r$ jumps.
        `,
      }),

      RF(md`
        ### Reading $\rho$ off $V$: Poisson's equation and $\lap(1/r)$

        If you are given $V$ instead, use Poisson's equation $\lap V = -\rho/\ep$. For $V = V(r)$ and $r>0$, the radial Laplacian has a compact form that saves algebra:

        $$\lap V = \frac{1}{r^2}\frac{d}{dr}\left(r^2\frac{dV}{dr}\right) = \frac1r\frac{d^2}{dr^2}\big(rV\big).$$

        At the origin the key identity is

        $$\lap\frac1r = -4\pi\,\delta^3(\vb r),$$

        which is $\divg(\uv r/r^2) = 4\pi\delta^3$ with $\nabla(1/r) = -\uv r/r^2$. So if $V\approx c/r$ near the origin, $\rho$ contains $-\ep c\cdot(-4\pi\delta^3) = 4\pi\ep c\,\delta^3(\vb r)$: a point charge $q_0 = 4\pi\ep c$, with $c = \lim_{r\to0}rV(r)$.

        | Near the origin, $V\approx$ | What sits at the origin |
        |---|---|
        | a finite value | nothing (no point charge) |
        | $c/r$ | point charge $4\pi\ep c$ |
        | $c\cos\theta/r^2$ | point dipole $p = 4\pi\ep c$ along $\uv z$, no net charge |
        | $c/r^n$ with $n>1$, no angle dependence | an infinite charge: not a real distribution down to $r=0$ |

        A constant added to $V$ changes nothing: $\lap(\text{const}) = 0$.
      `),

      Q(md`$V(r) = A\,\dfrac{1-e^{-r/a}}{r}$. Is there a point charge at the origin?`,
        [md`Yes, $4\pi\ep A$, because of the $1/r$`, md`No: $V\to A/a$, finite, as $r\to0$`, md`Yes, $-4\pi\ep A$`, md`Yes, $4\pi\ep A/a$`], 1,
        [md`Expand first: $1-e^{-r/a}\approx r/a$, which cancels the $1/r$.`,
          null,
          md`There is no $1/r$ singularity at all once you expand.`,
          md`$A/a$ is the value of $V(0)$, a finite potential, not a $c/r$ coefficient.`],
        md`$rV = A(1-e^{-r/a})\to0$, so $c = 0$: no point charge. The charge is spread out: $\rho = \dfrac{\ep A}{a^2}\dfrac{e^{-r/a}}{r}$, with total $4\pi\ep A$ (from the $A/r$ tail far away).`,
        { figHtml: pF((x) => (1 - Math.exp(-x)) / x, { y: [0, 1.3], yl: 'V', yt: [[1, 'A/a']] }) }),

      Q(md`$V = c/r$ with $c>0$, everywhere. What is $\rho$?`,
        [md`$-4\pi\ep c\,\delta^3(\vb r)$`, md`$0$ everywhere`, md`$c\,\delta^3(\vb r)$`, md`$4\pi\ep c\,\delta^3(\vb r)$`], 3,
        [md`Two minus signs: $\rho = -\ep\lap V$ and $\lap(1/r) = -4\pi\delta^3$. They cancel.`,
          md`$\lap(1/r) = 0$ only for $r>0$.`,
          md`Units and the $4\pi\ep$: $\rho = -\ep c\,\lap(1/r) = 4\pi\ep c\,\delta^3$.`,
          null],
        md`$\rho = -\ep\lap V = -\ep c\left(-4\pi\delta^3(\vb r)\right) = 4\pi\ep c\,\delta^3(\vb r)$. That is $V = \dfrac{q}{4\pi\ep r}$ read backwards, with $q = 4\pi\ep c$.`,
        { figHtml: pF((x) => 1 / x, { y: [0, 4], yl: 'V' }) }),

      Q(md`Which expression equals $\lap V$ for a function $V(r)$ of the spherical radius only, at $r>0$?`,
        [md`$\dfrac{1}{r}\dfrac{d^2}{dr^2}(rV)$`, md`$\dfrac{d^2V}{dr^2}$`, md`$\dfrac1r\dfrac{d}{dr}\left(r\dfrac{dV}{dr}\right)$`, md`$\dfrac{1}{r^2}\dfrac{d^2}{dr^2}\left(r^2V\right)$`], 0,
        [null,
          md`That is the Cartesian 1-D form; it misses the $\tfrac{2}{r}\tfrac{dV}{dr}$ term.`,
          md`That is the cylindrical Laplacian for $V(s)$.`,
          md`Expand it: it produces extra terms ($\tfrac{2V}{r^2}$ and $\tfrac4r V'$) that don't belong.`],
        md`$\dfrac1r(rV)'' = \dfrac1r(2V' + rV'') = V'' + \dfrac2rV'$, which is $\dfrac{1}{r^2}(r^2V')'$. With $u = rV$, Poisson becomes $u'' = -r\rho/\ep$: handy for $V = (\text{something})/r$.`,
        { nofig: 'formula identity' }),

      Q(md`$V = A\,\dfrac{e^{-\lambda r}}{r} + B$, with $B$ a constant. How does $B$ change $\rho$?`,
        [md`It adds a uniform density $-\ep B$`, md`It adds a point charge $4\pi\ep B$`, md`It doesn't: $\lap B = 0$`, md`It makes the total charge infinite`], 2,
        [md`$\rho$ comes from second derivatives of $V$; a constant has none.`,
          md`A point charge needs a $1/r$ singularity.`,
          null,
          md`The total charge comes from the field far away; $B$ adds no field.`],
        md`Adding a constant to $V$ is a change of reference point. $\vb E$ and $\rho$ are unchanged. (Here $\rho = \ep A\left(4\pi\delta^3-\lambda^2e^{-\lambda r}/r\right)$, as in [Discussion 3](#/l/u2-poisson).)`,
        { nofig: 'reference-point fact' }),

      Q(md`$V(r) = -A\ln(r/a)$, with $r$ the **spherical** radius ($A>0$). What is $\rho$?`,
        [md`$0$ for $r>0$ and a point charge at the origin, as for an infinite line`, md`$\rho = \ep A/r^2$, and no point charge`, md`$\rho = -\ep A/r^2$`, md`$\rho = 4\pi\ep A\,\delta^3(\vb r)$`], 1,
        [md`$\ln$ is harmonic in two dimensions (the line charge, with $s$). In three dimensions it isn't.`,
          null,
          md`Sign: $\lap\ln r = +1/r^2$, so $\rho = -\ep\lap V = +\ep A/r^2$.`,
          md`$rV = -Ar\ln(r/a)\to0$: no $1/r$ singularity, no point charge.`],
        md`$\lap\ln r = \dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\cdot\dfrac1r\right) = \dfrac{1}{r^2}$, so $\rho = \dfrac{\ep A}{r^2}$. Check: $E_r = A/r$, $Q_{\text{enc}} = 4\pi\ep Ar\to0$ at the origin. The same formula means different charges in different coordinate systems.`,
        { figHtml: pF((x) => -Math.log(x), { y: [-1.5, 3], yl: 'V', xt: [[1, 'a'], [2, '2a'], [3, '3a']] }) }),

      Q(md`$V(r) = \dfrac{A}{r} + \dfrac{B\,e^{-r/a}}{r}$. What is the point charge at the origin?`,
        [md`$4\pi\ep(A+B)$`, md`$4\pi\ep A$`, md`$4\pi\ep B$`, md`$4\pi\ep A - 4\pi\ep B$`], 0,
        [null,
          md`The second term also behaves like $B/r$ near the origin.`,
          md`The first term is a $1/r$ too.`,
          md`Both terms are $+1/r$ near the origin.`],
        md`$\lim rV = A + B$, so $q_0 = 4\pi\ep(A+B)$. Far away only $A/r$ survives: the total charge is $4\pi\ep A$, so the cloud carries $-4\pi\ep B$.`,
        { nofig: 'formula reading; the graph would show nothing new' }),

      P({
        title: 'A screened charge, starting from E',
        q: md`
          A spherically symmetric field is

          $$\vb E = \frac{A}{r^2}\left(1+\frac ra\right)e^{-r/a}\,\uv r ,$$

          with $A>0$ and $a>0$. Find the point charge $q_0$ at the origin, the density $\rho(r)$ for $r>0$, the total charge, and $V(r)$ with $V(\infty)=0$.
        `,
        figHtml: pF((x) => (1 + x) * Math.exp(-x) / (x * x)),
        hints: [
          md`$Q_{\text{enc}}(r) = 4\pi\ep A\left(1+\dfrac ra\right)e^{-r/a}$.`,
          md`Differentiate: $\dfrac{d}{dr}\left[(1+r/a)e^{-r/a}\right] = -\dfrac{r}{a^2}e^{-r/a}$.`,
          md`For $V$, guess a form whose derivative gives $E$: try $V = A\,e^{-r/a}/r$ and check $-dV/dr$.`,
        ],
        parts: [
          { lbl: 'q_0', expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [0.5, 3] } },
          { lbl: md`$\rho(r)$, $r>0$`, expr: '-eps0*A*exp(-r/a)/(a^2*r)', vars: { eps0: [0.5, 2], A: [0.5, 3], a: [0.5, 2], r: [0.2, 3] } },
          { lbl: 'Q_{\\text{tot}}', ans: 0, unit: '' },
          { lbl: 'V(r)', expr: 'A*exp(-r/a)/r', vars: { A: [0.5, 3], a: [0.5, 2], r: [0.2, 3] } },
        ],
        sol: md`
          **Enclosed charge.** $Q_{\text{enc}}(r) = 4\pi\ep r^2E_r = 4\pi\ep A\left(1+\dfrac ra\right)e^{-r/a}$.

          **Origin.** $Q_{\text{enc}}(0^+) = 4\pi\ep A$: point charge $q_0 = 4\pi\ep A$.

          **Cloud.** $\dfrac{dQ_{\text{enc}}}{dr} = 4\pi\ep A\left[\dfrac1a - \dfrac1a\left(1+\dfrac ra\right)\right]e^{-r/a} = -4\pi\ep A\dfrac{r}{a^2}e^{-r/a}$, so

          $$\rho = \frac{1}{4\pi r^2}\frac{dQ_{\text{enc}}}{dr} = -\frac{\ep A}{a^2}\,\frac{e^{-r/a}}{r}\qquad(r>0).$$

          **Total.** $Q_{\text{enc}}\to0$ as $r\to\infty$ (the exponential wins). The cloud carries exactly $-4\pi\ep A$.

          **Potential.** $V = A\dfrac{e^{-r/a}}{r}$: $-\dfrac{dV}{dr} = A\left(\dfrac{1}{r^2}+\dfrac{1}{ar}\right)e^{-r/a} = \dfrac{A}{r^2}\left(1+\dfrac ra\right)e^{-r/a}$ ✓, and $V\to0$ at infinity ✓.

          **Why this works.** It is a positive point charge dressed in a negative cloud that screens it completely: the field dies exponentially, not as $1/r^2$. This is the field of the potential in [Discussion 3](#/l/u2-poisson), approached from the $\vb E$ side.
        `,
      }),

      P({
        title: 'The hydrogen atom',
        q: md`
          The field of a hydrogen atom in its ground state (proton at the origin, electron cloud around it) is

          $$\vb E = \frac{A}{r^2}\left(1+\frac{2r}{a}+\frac{2r^2}{a^2}\right)e^{-2r/a}\,\uv r ,$$

          with $A>0$. Find the point charge at the origin, $\rho(r)$ for $r>0$, and $V(r)$ with $V(\infty)=0$.
        `,
        figHtml: pF((x) => (1 + 2 * x + 2 * x * x) * Math.exp(-2 * x) / (x * x)),
        hints: [
          md`$Q_{\text{enc}} = 4\pi\ep A\left(1+\dfrac{2r}{a}+\dfrac{2r^2}{a^2}\right)e^{-2r/a}$; its value at $0$ is the proton.`,
          md`Differentiate the bracket times the exponential. Almost everything cancels.`,
          md`For $V$, try $V = A\,e^{-2r/a}\left(\dfrac1r+\dfrac1a\right)$ and differentiate.`,
        ],
        parts: [
          { lbl: 'q_0', expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [0.5, 3] } },
          { lbl: md`$\rho(r)$, $r>0$`, expr: '-4*eps0*A*exp(-2*r/a)/a^3', vars: { eps0: [0.5, 2], A: [0.5, 3], a: [0.5, 2], r: [0.2, 3] } },
          { lbl: 'V(r)', expr: 'A*exp(-2*r/a)*(1/r+1/a)', vars: { A: [0.5, 3], a: [0.5, 2], r: [0.2, 3] }, accepts: ['A*(a+r)*exp(-2*r/a)/(a*r)'] },
        ],
        sol: md`
          **Enclosed charge.** $Q_{\text{enc}} = 4\pi\ep A\,g(r)e^{-2r/a}$ with $g = 1+\dfrac{2r}{a}+\dfrac{2r^2}{a^2}$. At the origin: $q_0 = 4\pi\ep A$ (the proton, so $A = \dfrac{e}{4\pi\ep}$).

          **Cloud.** $\dfrac{d}{dr}\left(ge^{-2r/a}\right) = \left(\dfrac2a+\dfrac{4r}{a^2}-\dfrac2a-\dfrac{4r}{a^2}-\dfrac{4r^2}{a^3}\right)e^{-2r/a} = -\dfrac{4r^2}{a^3}e^{-2r/a}$. So

          $$\rho = \frac{1}{4\pi r^2}\cdot4\pi\ep A\left(-\frac{4r^2}{a^3}\right)e^{-2r/a} = -\frac{4\ep A}{a^3}e^{-2r/a}.$$

          With $A = \dfrac{e}{4\pi\ep}$ this is $-\dfrac{e}{\pi a^3}e^{-2r/a}$, the electron's ground-state cloud, finite at the origin.

          **Total.** $Q_{\text{enc}}\to0$: the atom is neutral.

          **Potential.** $V = Ae^{-2r/a}\left(\dfrac1r+\dfrac1a\right)$. Check: $-\dfrac{dV}{dr} = Ae^{-2r/a}\left[\dfrac2a\left(\dfrac1r+\dfrac1a\right)+\dfrac1{r^2}\right] = \dfrac{A}{r^2}\left(1+\dfrac{2r}a+\dfrac{2r^2}{a^2}\right)e^{-2r/a}$ ✓. Near the origin $V\approx A/r - A/a + \dots$: the proton's $1/r$ plus a finite negative shift from the cloud.

          **What to remember.** A cloud with **finite** density at the origin is fine; the point charge is still read off $r^2E_r$.
        `,
      }),

      P({
        title: 'A potential with no point charge',
        q: md`
          $V(r) = A\,\dfrac{1-e^{-r/a}}{r}$ everywhere, with $A>0$.

          Find $\rho(r)$ for $r>0$, decide whether there is a point charge at the origin, and find the total charge.
        `,
        figHtml: pF((x) => (1 - Math.exp(-x)) / x, { y: [0, 1.3], yl: 'V', yt: [[1, 'A/a']] }),
        hints: [
          md`Near the origin, expand $e^{-r/a}\approx1-r/a$. Is there a $c/r$ singularity?`,
          md`Use $\lap V = \dfrac1r\dfrac{d^2}{dr^2}(rV)$ with $rV = A\left(1-e^{-r/a}\right)$.`,
          md`Total charge: far away $V\approx A/r$.`,
        ],
        parts: [
          { lbl: md`$\rho(r)$, $r>0$`, expr: 'eps0*A*exp(-r/a)/(a^2*r)', vars: { eps0: [0.5, 2], A: [0.5, 3], a: [0.5, 2], r: [0.2, 3] } },
          { lbl: md`Point charge at the origin`, mc: [md`$4\pi\ep A$`, md`none`, md`$-4\pi\ep A$`, md`$4\pi\ep A/a$`], a: 1,
            why: [md`$rV\to0$, so there is no $1/r$ singularity.`, null, md`No $1/r$ singularity of either sign.`, md`$A/a$ is $V(0)$, a finite potential.`] },
          { lbl: 'Q_{\\text{tot}}', expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [0.5, 3] } },
        ],
        sol: md`
          **Origin.** $rV = A(1-e^{-r/a})\to0$, and $V(0) = A/a$ is finite. No point charge.

          **Density.** $\dfrac{d^2}{dr^2}(rV) = A\cdot\left(-\dfrac{1}{a^2}\right)e^{-r/a}$, so $\lap V = -\dfrac{A}{a^2}\dfrac{e^{-r/a}}{r}$ and

          $$\rho = -\ep\lap V = \frac{\ep A}{a^2}\frac{e^{-r/a}}{r}.$$

          Positive, and infinite at the origin, but integrable: the charge inside radius $r$ is $\int_0^r\rho\,4\pi r'^2dr'\approx\dfrac{4\pi\ep A}{a^2}\cdot\dfrac{r^2}{2}\to0$.

          **Total.** $\int_0^\infty\dfrac{\ep A}{a^2}\dfrac{e^{-r/a}}{r}4\pi r^2dr = \dfrac{4\pi\ep A}{a^2}\cdot a^2 = 4\pi\ep A$, matching the far-field $V\approx A/r$.

          **What to remember.** Compare with $Ae^{-r/a}/r$: one minus sign moves the charge from a point plus a screening cloud to a pure smeared-out cloud. Always expand near $r=0$ before deciding.
        `,
      }),

      P({
        title: 'A Gaussian-screened charge: the cloud changes sign',
        q: md`
          $V(r) = A\,\dfrac{e^{-r^2/a^2}}{r}$, with $A>0$.

          Find the point charge at the origin, $\rho(r)$ for $r>0$, the radius $r_0$ where $\rho$ changes sign, and the total charge.
        `,
        figHtml: pF((x) => Math.exp(-x * x) / x, { y: [0, 3], yl: 'V' }),
        hints: [
          md`$rV = Ae^{-r^2/a^2}\to A$: a $1/r$ singularity.`,
          md`$\dfrac{d^2}{dr^2}e^{-r^2/a^2} = \left(\dfrac{4r^2}{a^4}-\dfrac{2}{a^2}\right)e^{-r^2/a^2}$.`,
          md`Total: $V$ dies faster than $1/r$ far away.`,
        ],
        parts: [
          { lbl: 'q_0', expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [0.5, 3] } },
          { lbl: md`$\rho(r)$, $r>0$`, expr: 'eps0*A*exp(-r^2/a^2)*(2/(a^2*r)-4*r/a^4)', vars: { eps0: [0.5, 2], A: [0.5, 3], a: [0.5, 2], r: [0.2, 2] }, accepts: ['2*eps0*A*(a^2-2*r^2)*exp(-r^2/a^2)/(a^4*r)'] },
          { lbl: 'r_0', expr: 'a/sqrt(2)', vars: { a: [0.5, 3] } },
          { lbl: 'Q_{\\text{tot}}', ans: 0, unit: '' },
        ],
        sol: md`
          **Origin.** $rV\to A$: point charge $q_0 = 4\pi\ep A$.

          **Density.** $\rho = -\dfrac{\ep}{r}\dfrac{d^2}{dr^2}\left(Ae^{-r^2/a^2}\right) = -\dfrac{\ep A}{r}\left(\dfrac{4r^2}{a^4}-\dfrac2{a^2}\right)e^{-r^2/a^2} = \dfrac{2\ep A\,(a^2-2r^2)}{a^4\,r}e^{-r^2/a^2}.$

          **Sign change.** Positive for $r<a/\sqrt2$, negative beyond: $r_0 = a/\sqrt2$.

          **Total.** Far away $V$ dies like a Gaussian, so $Q_{\text{tot}} = 0$. Check with the enclosed charge: $Q_{\text{enc}} = 4\pi\ep r^2E_r = 4\pi\ep A\left(1+\dfrac{2r^2}{a^2}\right)e^{-r^2/a^2}$. It starts at $4\pi\ep A$, **rises** (positive cloud) until $r = a/\sqrt2$, then falls to $0$ (negative cloud). The whole cloud integrates to $-4\pi\ep A$.

          **What to remember.** The sign of $\rho$ is the sign of the slope of $Q_{\text{enc}}(r)$. A screening cloud need not have one sign.
        `,
      }),

      RF(md`
        ### Fields that don't fall off: the total charge and the reference point

        Take $\vb E = \dfrac{A}{r^2}\uv r + B\,\uv r$ everywhere. Then $Q_{\text{enc}} = 4\pi\ep\left(A+Br^2\right)$:

        - origin: point charge $4\pi\ep A$;
        - cloud: $\rho = \dfrac{\ep}{r^2}\dfrac{d}{dr}(Br^2) = \dfrac{2\ep B}{r}$;
        - total: $Q_{\text{enc}}\to\pm\infty$. The charge extends to infinity.

        Now $V(\infty) = 0$ is impossible: $\int_r^\infty B\,dr'$ diverges. Pick a finite reference point instead, say $V(a) = 0$:
        $$V(r) = -\int_a^r\left(\frac{A}{r'^2}+B\right)dr' = A\left(\frac1r-\frac1a\right) - B(r-a).$$

        !!trap $V(\infty)=0$ needs a localized charge
          The formula $V = -\int_\infty^r\vb E\cdot d\vb l$ only makes sense if $E_r$ falls faster than $1/r$. If the problem's field doesn't (charge extending to infinity: infinite lines, planes, or $\rho\propto1/r$ as here), choose a finite reference point and say so.
      `),

      Q(md`$\vb E = \dfrac{A}{r^2}\uv r + B\,\uv r$ everywhere. Why can't you use $V(\infty)=0$?`,
        [md`Because there is a point charge at the origin`, md`Because $\curl\vb E\neq0$`, md`Because $\rho$ is negative`, md`Because $\int^\infty B\,dr$ diverges: the charge is not localized`], 3,
        [md`A point charge alone is fine with $V(\infty)=0$.`,
          md`Every radial field $E_r(r)\uv r$ is curl-free.`,
          md`The sign of $\rho$ has nothing to do with it; $\rho = 2\ep B/r$ has the sign of $B$.`,
          null],
        md`$V(r)-V(\infty) = \int_r^\infty E_r\,dr'$ is infinite. The enclosed charge $4\pi\ep(A+Br^2)$ grows without bound, so there is no "far away where nothing is". Pick $V(a)=0$ at some finite $a$.`,
        { figHtml: pF((x) => 1 / (x * x) + 0.5, { y: [0, 4], yt: [[0.5, 'B']] }) }),

      Q(md`$\vb E = \dfrac{A}{r^2}\uv r + B\,\uv r$ with $A>0$ and $B<0$. Where is $\vb E = 0$?`,
        [md`$r = \sqrt{A/|B|}$`, md`$r = A/|B|$`, md`Nowhere`, md`At the origin`], 0,
        [null,
          md`Solve $A/r^2 = |B|$: the power is 2.`,
          md`The two terms have opposite signs, so they cancel at one radius.`,
          md`At the origin the $A/r^2$ term is infinite.`],
        md`$\dfrac{A}{r^2} + B = 0\Rightarrow r^2 = A/|B|$. That is the radius where the negative cloud ($\rho = 2\ep B/r<0$) has cancelled the point charge: $Q_{\text{enc}} = 4\pi\ep(A+Br^2) = 0$.`,
        { figHtml: pF((x) => 1 / (x * x) - 0.4, { y: [-1, 3], yt: [] }) }),

      P({
        title: 'A point charge in a cloud that never ends',
        q: md`
          $\vb E = \left(\dfrac{A}{r^2}+B\right)\uv r$ everywhere, with constants $A$ and $B$.

          Find the point charge at the origin, $\rho(r)$ for $r>0$, the charge inside radius $r$, and $V(r)$ taking $V(a) = 0$ at a chosen radius $a$.
        `,
        figHtml: pF((x) => 1 / (x * x) + 0.5, { y: [0, 4], yt: [[0.5, 'B']] }),
        hints: [
          md`$Q_{\text{enc}} = 4\pi\ep r^2E_r$.`,
          md`$\rho = \dfrac{\ep}{r^2}\dfrac{d}{dr}\left(A+Br^2\right)$.`,
          md`$V(r) = -\displaystyle\int_a^r E_r\,dr'$.`,
        ],
        parts: [
          { lbl: 'q_0', expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [0.5, 3] } },
          { lbl: md`$\rho(r)$, $r>0$`, expr: '2*eps0*B/r', vars: { eps0: [0.5, 2], B: [0.5, 3], r: [0.2, 3] } },
          { lbl: 'Q_{\\text{enc}}(r)', expr: '4*pi*eps0*(A+B*r^2)', vars: { eps0: [0.5, 2], A: [0.5, 3], B: [0.5, 3], r: [0.2, 3] } },
          { lbl: 'V(r)', expr: 'A*(1/r-1/a)-B*(r-a)', vars: { A: [0.5, 3], B: [0.5, 3], a: [0.5, 2], r: [0.2, 3] } },
        ],
        sol: md`
          $Q_{\text{enc}} = 4\pi\ep(A+Br^2)$, so $q_0 = 4\pi\ep A$ and

          $$\rho = \frac{1}{4\pi r^2}\frac{dQ_{\text{enc}}}{dr} = \frac{1}{4\pi r^2}\cdot8\pi\ep Br = \frac{2\ep B}{r}\qquad(r>0).$$

          **Check:** $q_0 + \int_0^r\dfrac{2\ep B}{r'}4\pi r'^2dr' = 4\pi\ep A + 4\pi\ep Br^2$ ✓.

          **Potential.** The total charge is infinite, so use $V(a)=0$:

          $$V(r) = -\int_a^r\left(\frac{A}{r'^2}+B\right)dr' = A\left(\frac1r-\frac1a\right) - B(r-a).$$

          Check: $-dV/dr = A/r^2 + B$ ✓, $V(a) = 0$ ✓.
        `,
      }),

      RF(md`
        ### Steeper than $1/r^2$: what $r^2E_r\to\infty$ means

        Power laws make the whole picture clear. For $\vb E = k\,r^n\,\uv r$:

        $$Q_{\text{enc}}(r) = 4\pi\ep k\,r^{n+2},\qquad \rho = \frac{\ep}{r^2}\frac{d}{dr}\left(kr^{n+2}\right) = (n+2)\,\ep k\,r^{n-1}\quad(r>0).$$

        | $n$ | $Q_{\text{enc}}$ as $r\to0$ | at the origin | $\rho$ for $r>0$ |
        |---|---|---|---|
        | $n>-2$ | $\to0$ | nothing | same sign as $k$, integrable (even if infinite at $0$) |
        | $n=-2$ | $4\pi\ep k$ | point charge $4\pi\ep k$ | $0$ |
        | $n<-2$ | $\to\pm\infty$ | **infinite** charge | opposite sign to $k$, not integrable |

        Take $\vb E = k\,\uv r/r^4$ ($n=-4$, $k>0$). The sphere of radius $r$ encloses $4\pi\ep k/r^2$: a sphere of radius 1 mm encloses a million times what a sphere of 1 m does. Meanwhile $\rho = -\dfrac{2\ep k}{r^5}<0$: every shell holds negative charge, so going **inward** the enclosed charge grows without limit. No finite $q\,\delta^3(\vb r)$ can produce that; the "charge at the origin" is infinite. Such a field cannot hold all the way down to $r=0$ for any real charge distribution.

        So when a $1/r^4$ appears in a sensible problem, it is one of these:

        - **the field is given only outside some radius $R$** (the inside is described separately, e.g. a point charge or a ball): then $Q_{\text{enc}}(R)$ is finite and everything is fine;
        - **a term in $V$**, like $V = \dfrac Ar + \dfrac{B}{r^4}$ for $r\ge R$;
        - **a vector written with $\vb r$, not $\uv r$**: $k\dfrac{\vb r}{r^3} = k\dfrac{\uv r}{r^2}$ is an ordinary point charge, and $k\dfrac{\vb r}{r^4} = k\dfrac{\uv r}{r^3}$ is $n=-3$.

        !!trap Bold $\vb r$ versus $\uv r$
          $\vb r = r\,\uv r$. Before using the table, rewrite the field with $\uv r$ and count the power honestly.
      `),

      Q(md`$\vb E = \dfrac{k}{r^4}\,\uv r$ ($k>0$) is claimed to hold for **all** $r>0$. What is at the origin?`,
        [md`A point charge $4\pi\ep k$`, md`Nothing; $\rho$ is just large there`, md`An infinite positive charge: no finite $q\,\delta^3(\vb r)$ fits, so this can't be a real distribution down to $r=0$`, md`A point dipole`], 2,
        [md`$r^2E_r = k/r^2$ is not constant; it diverges.`,
          md`$Q_{\text{enc}}\to+\infty$ as the sphere shrinks. That is not "nothing".`,
          null,
          md`A dipole field depends on angle and has zero flux through a centered sphere. This field is radial with flux $4\pi k/r^2$.`],
        md`$Q_{\text{enc}}(r) = 4\pi\ep k/r^2\to\infty$. The surrounding shells are negative ($\rho = -2\ep k/r^5$), so the charge at the center would have to be infinite to leave a finite total. On an exam, say exactly this, and expect the field to be valid only outside some radius.`,
        { figHtml: pF((x) => 1 / Math.pow(x, 4), { y: [0, 4] }) }),

      Q(md`For $\vb E = \dfrac{k}{r^4}\uv r$ with $k>0$, what is the sign of $\rho$ at $r>0$?`,
        [md`Positive`, md`Negative`, md`Zero`, md`It changes sign at $r = 1$`], 1,
        [md`$r^2E_r = k/r^2$ decreases outward, so the shells add negative charge.`,
          null,
          md`Only $n=-2$ gives zero; here $n=-4$.`,
          md`There is no length scale in the field; nothing special happens at $r=1$.`],
        md`$\rho = \dfrac{\ep}{r^2}\dfrac{d}{dr}\left(\dfrac{k}{r^2}\right) = -\dfrac{2\ep k}{r^5}$. Fields steeper than $1/r^2$ fall off **faster** than a point charge's field, which requires negative charge around a positive center.`,
        { figHtml: pF((x) => 1 / Math.pow(x, 4), { y: [0, 4] }) }),

      Q(md`$\vb E = k\,\dfrac{\vb r}{r^3}$, with **bold** $\vb r$ (the position vector). What is it?`,
        [md`A point charge $4\pi\ep k$ at the origin`, md`An infinite charge, since the power is $1/r^3$`, md`A uniform field`, md`$\rho = -\ep k/r^4$ and no point charge`], 0,
        [null,
          md`$\vb r = r\uv r$: the field is $k\uv r/r^2$, an ordinary point charge.`,
          md`Its magnitude is $k/r^2$, not constant.`,
          md`Rewrite with $\uv r$ first; then the divergence is $0$ for $r>0$.`],
        md`$k\vb r/r^3 = k\uv r/r^2$, Coulomb's law. A field written with the position vector has magnitude one power of $r$ **higher** than the denominator suggests.`,
        { nofig: 'notation question' }),

      Q(md`$\vb E = \dfrac{k}{\sqrt r}\,\uv r$ ($k>0$). $\rho$ is infinite at the origin. Is there a point charge there?`,
        [md`Yes, $4\pi\ep k$`, md`Yes, but infinite`, md`No: $r^2E_r = kr^{3/2}\to0$`, md`Yes, $2\pi\ep k$`], 2,
        [md`That would need $r^2E_r\to k$.`,
          md`Infinite would need $r^2E_r\to\infty$.`,
          null,
          md`No power of $r$ survives as $r\to0$ here.`],
        md`$Q_{\text{enc}} = 4\pi\ep kr^{3/2}\to0$. The density $\rho = \tfrac32\ep kr^{-3/2}$ blows up at the origin, but $\int_0^r r'^{-3/2}r'^2dr'$ converges. Infinite density, zero point charge.`,
        { figHtml: pF((x) => 1 / Math.sqrt(x), { y: [0, 3] }) }),

      Q(md`For a radial power-law field $\vb E = k\,r^n\,\uv r$, for which $n$ is there a finite, nonzero point charge at the origin?`,
        [md`Every $n<0$`, md`Every $n\le-2$`, md`$n = -1$ only`, md`$n = -2$ only`], 3,
        [md`For $-2<n<0$, $r^2E_r\to0$: no point charge, even though $E$ blows up.`,
          md`For $n<-2$ the enclosed charge diverges.`,
          md`$n=-1$: $r^2E_r = kr\to0$.`,
          null],
        md`$Q_{\text{enc}} = 4\pi\ep kr^{n+2}$ has a finite nonzero limit only when $n+2 = 0$.`,
        { nofig: 'power counting' }),

      Q(md`$\vb E = \dfrac{k}{r^4}\uv r$ for $r>R$, and $\vb E = 0$ for $r<R$ ($k>0$). Where is the charge?`,
        [md`A surface charge $\sigma = \ep k/R^4$ on $r=R$ and a negative cloud outside; total $0$`, md`A point charge $4\pi\ep k$ at the origin`, md`Only a negative cloud outside`, md`Only the surface charge, total $4\pi\ep k/R^2$`], 0,
        [null,
          md`$E = 0$ inside: no charge inside $R$ at all.`,
          md`Then $E$ would point inward. $E_r$ jumps up at $R$: positive surface charge.`,
          md`The cloud outside ($\rho = -2\ep k/r^5$) is there too, and cancels it.`],
        md`$\sigma = \ep(E_{\text{out}}-E_{\text{in}}) = \ep k/R^4$, total $4\pi\ep k/R^2$. Outside, $Q_{\text{enc}} = 4\pi\ep k/r^2\to0$: the negative cloud carries $-4\pi\ep k/R^2$. Cut off at $R$, a $1/r^4$ field is perfectly sensible.`,
        { figHtml: pF((x) => (x > 1 ? 1 / Math.pow(x, 4) : 0), { x: [0, 3], y: [0, 1.3], xt: [[1, 'R'], [2, '2R']], yt: [[1, 'k/R^4']] }) }),

      P({
        title: 'V = A/r + B/r⁴ outside a ball',
        q: md`
          Outside a ball of radius $R$, the potential is $V(r) = \dfrac{A}{r} + \dfrac{B}{r^4}$ ($r\ge R$). Nothing is said about the inside.

          Find $\rho(r)$ for $r>R$, the total charge inside the ball (assume no surface charge on $r=R$ from the outside formula), and the total charge of everything.
        `,
        figHtml: fBallR({ outLab: 'V = \\dfrac{A}{r} + \\dfrac{B}{r^4}' }),
        hints: [
          md`$\lap V = \dfrac1r\dfrac{d^2}{dr^2}(rV)$ with $rV = A + B/r^3$.`,
          md`The charge inside radius $R$ is $4\pi\ep R^2E_r(R^+)$, with $E_r = -dV/dr$.`,
          md`The total charge is the coefficient of $1/r$ far away, times $4\pi\ep$.`,
        ],
        parts: [
          { lbl: md`$\rho(r)$, $r>R$`, expr: '-12*eps0*B/r^6', vars: { eps0: [0.5, 2], B: [0.5, 3], r: [1, 3] } },
          { lbl: md`Charge inside $r<R$`, expr: '4*pi*eps0*(A+4*B/R^3)', vars: { eps0: [0.5, 2], A: [0.5, 3], B: [0.5, 3], R: [0.5, 2] } },
          { lbl: 'Q_{\\text{tot}}', expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [0.5, 3] } },
          { lbl: md`If this $V$ held all the way to $r=0$ (with $B\neq0$), the charge at the origin would be`, mc: [md`$4\pi\ep A$`, md`$4\pi\ep(A+B)$`, md`$0$`, md`infinite`], a: 3,
            why: [md`The $B/r^4$ term makes $r^2E_r$ diverge.`, md`$B/r^4$ is not a $1/r$ term.`, md`$r^2E_r = A + 4B/r^3$ does not go to $0$.`, null] },
        ],
        sol: md`
          **Field.** $E_r = -\dfrac{dV}{dr} = \dfrac{A}{r^2} + \dfrac{4B}{r^5}$, so $Q_{\text{enc}}(r) = 4\pi\ep\left(A + \dfrac{4B}{r^3}\right)$ for $r\ge R$.

          **Density.** $rV = A + Br^{-3}$, $(rV)'' = 12Br^{-5}$, $\lap V = \dfrac{12B}{r^6}$, so $\rho = -\dfrac{12\ep B}{r^6}$. Check with the slope: $\dfrac{1}{4\pi r^2}\dfrac{d}{dr}\left(\dfrac{16\pi\ep B}{r^3}\right) = -\dfrac{12\ep B}{r^6}$ ✓.

          **Inside.** $Q_{\text{enc}}(R) = 4\pi\ep A + \dfrac{16\pi\ep B}{R^3}$, whatever its arrangement.

          **Total.** $Q_{\text{enc}}(\infty) = 4\pi\ep A$. The cloud outside holds the difference, $-16\pi\ep B/R^3$.

          **The origin.** If the formula held down to $r=0$, $Q_{\text{enc}}\to\infty$: an infinite charge at the center. That is why such a $V$ is only given outside a ball.
        `,
      }),

      P({
        title: 'E = A/r² + B/r⁴ outside a ball: V and a shell of charge',
        q: md`
          For $r\ge R$, $\vb E = \left(\dfrac{A}{r^2}+\dfrac{B}{r^4}\right)\uv r$.

          Find $V(r)$ for $r\ge R$ with $V(\infty)=0$, $\rho(r)$ for $r>R$, and the charge contained in the shell $R<r<2R$.
        `,
        figHtml: fBallR({ outLab: '\\vb E = \\left(\\dfrac{A}{r^2}+\\dfrac{B}{r^4}\\right)\\uv r' }),
        hints: [
          md`$V = -\displaystyle\int_\infty^r E_r\,dr'$; integrate each power.`,
          md`$Q_{\text{enc}}(r) = 4\pi\ep(A + B/r^2)$.`,
          md`Shell charge $= Q_{\text{enc}}(2R) - Q_{\text{enc}}(R)$.`,
        ],
        parts: [
          { lbl: 'V(r)', expr: 'A/r + B/(3*r^3)', vars: { A: [0.5, 3], B: [0.5, 3], r: [1, 3] } },
          { lbl: md`$\rho(r)$, $r>R$`, expr: '-2*eps0*B/r^5', vars: { eps0: [0.5, 2], B: [0.5, 3], r: [1, 3] } },
          { lbl: md`Charge in $R<r<2R$`, expr: '-3*pi*eps0*B/R^2', vars: { eps0: [0.5, 2], B: [0.5, 3], R: [0.5, 2] } },
        ],
        sol: md`
          **Potential.** $V = -\displaystyle\int_\infty^r\left(\frac{A}{r'^2}+\frac{B}{r'^4}\right)dr' = \frac Ar + \frac{B}{3r^3}.$ (Notice $1/r^4$ in $E$ is $1/r^3$ in $V$.)

          **Density.** $Q_{\text{enc}} = 4\pi\ep\left(A+\dfrac{B}{r^2}\right)$, so $\rho = \dfrac{1}{4\pi r^2}\cdot4\pi\ep\left(-\dfrac{2B}{r^3}\right) = -\dfrac{2\ep B}{r^5}$.

          **Shell.** $Q_{\text{enc}}(2R)-Q_{\text{enc}}(R) = 4\pi\ep B\left(\dfrac1{4R^2}-\dfrac1{R^2}\right) = -\dfrac{3\pi\ep B}{R^2}$.

          **Check** by integrating: $\displaystyle\int_R^{2R}-\frac{2\ep B}{r^5}4\pi r^2dr = -8\pi\ep B\left[-\frac{1}{2r^2}\right]_R^{2R} = -8\pi\ep B\cdot\frac{3}{8R^2}$ ✓.
        `,
      }),

      RF(md`
        ### Not every singularity is a point charge: the point dipole and the line charge

        **Point dipole.** $V = \dfrac{p\cos\theta}{4\pi\ep r^2}$ blows up at the origin, but the flux through any sphere centered there is

        $$\oint\vb E\cdot d\vb a = \int\left(\frac{2p\cos\theta}{4\pi\ep r^3}\right)r^2\sin\theta\,d\theta\,d\phi = 0,$$

        since $\int_0^\pi\cos\theta\sin\theta\,d\theta = 0$. So there is **no point charge** in the $\delta^3$ sense. For $r>0$, the full Laplacian (radial and angular parts) gives $\lap V = 0$: no cloud either. What sits at the origin is a point dipole, a $+$ and a $-$ charge squeezed together ($\rho = -\vb p\cdot\nabla\delta^3(\vb r)$; you won't need that formula). The flux test only sees the net (monopole) charge.

        For $V$ with angles, the point charge is read off the **angle-averaged** $1/r$ coefficient: $V = \dfrac Ar + \dfrac{B\cos\theta}{r^2}$ has $q_0 = 4\pi\ep A$ and a dipole $p = 4\pi\ep B$ along $\uv z$.

        [[fig:dip]]

        **Line charge.** In cylindrical coordinates the same logic runs with circles of radius $s$: the charge per length inside radius $s$ is $\lambda_{\text{enc}}(s) = 2\pi\ep\,sE_s$, and $\divg(\uv s/s) = 2\pi\delta^2(s)$. A field $E_s\approx k/s$ near the axis means a line charge $\lambda = 2\pi\ep k$ on it; away from it, $\rho = \dfrac{\ep}{s}\dfrac{d}{ds}(sE_s)$.
      `, { dip: { svg: fDip(), cap: md`A point dipole $\vb p$ at the origin, and a field point at $(r,\theta)$.` } }),

      Q(md`$V = \dfrac{p\cos\theta}{4\pi\ep r^2}$. What is the flux of $\vb E$ through a sphere of radius $r$ centered on the origin?`,
        [md`$\dfrac{p}{\ep r}$`, md`$0$`, md`$p/\ep$`, md`Infinite, since $V$ blows up`], 1,
        [md`Flux has units of charge/$\ep$; and the angular integral kills it anyway.`,
          null,
          md`That would be a net charge $p$, which has the wrong units (C·m).`,
          md`A diverging $V$ doesn't mean a diverging flux: the positive and negative halves cancel.`],
        md`$E_r = \dfrac{2p\cos\theta}{4\pi\ep r^3}$ is outward on the top half and inward on the bottom half, equally. Net flux $0$: no net charge inside. That is why there is no $\delta^3$ term.`,
        { figHtml: fDip() }),

      Q(md`$V = \dfrac{A}{r} + \dfrac{B\cos\theta}{r^2}$ everywhere. What sits at the origin?`,
        [md`A point charge $4\pi\ep(A+B)$`, md`Only a dipole`, md`A point charge $4\pi\ep A$ and a point dipole $4\pi\ep B\,\uv z$`, md`A point charge $4\pi\ep A$ only; the second term is a cloud`], 2,
        [md`The $\cos\theta/r^2$ term carries no net charge.`,
          md`The $A/r$ term is a monopole: a point charge.`,
          null,
          md`$\lap\left(\dfrac{\cos\theta}{r^2}\right) = 0$ for $r>0$: no cloud. It is a singularity at a point, of dipole type.`],
        md`Compare with $V_{\text{dip}} = \dfrac{p\cos\theta}{4\pi\ep r^2}$: $p = 4\pi\ep B$. The monopole $A/r$ gives $q_0 = 4\pi\ep A$. For $r>0$, $\rho = 0$.`,
        { figHtml: fDip() }),

      Q(md`In the same $V = \dfrac{A}{r} + \dfrac{B\cos\theta}{r^2}$, why can't you compute $\lap V$ with $\dfrac{1}{r^2}\dfrac{d}{dr}\left(r^2\dfrac{dV}{dr}\right)$ alone?`,
        [md`Because $V$ depends on $\theta$, so the angular part of the Laplacian contributes`, md`Because the dipole term is not differentiable`, md`Because the formula only applies to $1/r$`, md`You can; it gives $0$`], 0,
        [null,
          md`For $r>0$ the dipole term is perfectly smooth.`,
          md`The radial formula works for any $V(r)$; the problem here is the $\theta$ dependence.`,
          md`The radial part alone gives $\dfrac{2B\cos\theta}{r^4}$, not $0$. The angular part supplies $-\dfrac{2B\cos\theta}{r^4}$.`],
        md`$\dfrac{1}{r^2}\partial_r\left(r^2\partial_r\dfrac{\cos\theta}{r^2}\right) = \dfrac{2\cos\theta}{r^4}$ and $\dfrac{1}{r^2\sin\theta}\partial_\theta\left(\sin\theta\,\partial_\theta\dfrac{\cos\theta}{r^2}\right) = -\dfrac{2\cos\theta}{r^4}$. They cancel. Using only the radial piece would invent a fake charge density.`,
        { figHtml: fDip() }),

      Q(md`In cylindrical coordinates, $\vb E = \dfrac{k}{s}\,\uv s$ everywhere. What is the charge?`,
        [md`A point charge $4\pi\ep k$ at the origin`, md`Nothing: $\dfrac1s\dfrac{d}{ds}(s\cdot k/s) = 0$`, md`A uniform density $\ep k$`, md`A line charge $\lambda = 2\pi\ep k$ along the $z$-axis`], 3,
        [md`$\uv s$ points away from an axis, not a point; the field doesn't depend on $z$.`,
          md`That is the $s>0$ result. On the axis, the flux through a thin coaxial cylinder is $2\pi kL$ for every radius.`,
          md`$\rho = 0$ off the axis.`,
          null],
        md`$\lambda_{\text{enc}} = 2\pi\ep sE_s = 2\pi\ep k$ for every $s$: all of it on the axis. Compare $E = \dfrac{\lambda}{2\pi\ep s}$ for a line charge.`,
        { figHtml: fLineEnd() }),

      Q(md`$\vb E = \dfrac{k}{s^2}\,\uv s$ in cylindrical coordinates ($k>0$), claimed for all $s>0$. What is on the axis?`,
        [md`A line charge $2\pi\ep k$`, md`Nothing`, md`An infinite charge per unit length`, md`A point charge`], 2,
        [md`That needs $sE_s\to k$; here $sE_s = k/s\to\infty$.`,
          md`$\lambda_{\text{enc}} = 2\pi\ep k/s$ grows without bound as $s\to0$.`,
          null,
          md`Nothing depends on $z$; there is no special point.`],
        md`Same story as $1/r^4$ in spherical coordinates: the power is steeper than the line-charge $1/s$, so the enclosed charge per length diverges toward the axis. Such a field can only hold outside some radius.`,
        { figHtml: fLineEnd() }),

      P({
        title: 'A point charge and a point dipole',
        q: md`
          $V(r,\theta) = \dfrac{A}{r} + \dfrac{B\cos\theta}{r^2}$ everywhere ($r>0$).

          Find the point charge at the origin, the dipole moment (its $z$-component), and the total charge.
        `,
        figHtml: fDip(),
        hints: [
          md`Flux through a sphere around the origin: only the $A/r$ part contributes.`,
          md`Match the second term to $\dfrac{p\cos\theta}{4\pi\ep r^2}$.`,
          md`For $r>0$, compute the full Laplacian (both parts) of each term.`,
        ],
        parts: [
          { lbl: 'q_0', expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [0.5, 3] } },
          { lbl: 'p_z', expr: '4*pi*eps0*B', vars: { eps0: [0.5, 2], B: [0.5, 3] } },
          { lbl: md`$\rho$ for $r>0$`, mc: [md`$0$`, md`$-\dfrac{2\ep B\cos\theta}{r^4}$`, md`$\dfrac{2\ep B\cos\theta}{r^4}$`, md`$-\dfrac{\ep A}{r^3}$`], a: 0,
            why: [null, md`That is the radial part alone; the angular part cancels it.`, md`Sign aside, the angular part cancels it.`, md`$\lap(1/r) = 0$ for $r>0$.`] },
          { lbl: 'Q_{\\text{tot}}', expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [0.5, 3] } },
        ],
        sol: md`
          **Flux.** $E_r = \dfrac{A}{r^2} + \dfrac{2B\cos\theta}{r^3}$. Through a sphere: $\oint E_r\,da = 4\pi A + 0$. So $Q_{\text{enc}} = 4\pi\ep A$ for every $r$: point charge $q_0 = 4\pi\ep A$, and that is also the total.

          **Dipole.** $\dfrac{B\cos\theta}{r^2} = \dfrac{p\cos\theta}{4\pi\ep r^2}$ gives $p = 4\pi\ep B$, along $+\uv z$ (for $B>0$).

          **Away from the origin.** Both terms are harmonic for $r>0$ (the dipole term by the radial/angular cancellation $\tfrac{2\cos\theta}{r^4}-\tfrac{2\cos\theta}{r^4}$). So $\rho = 0$ there.

          $$\rho = 4\pi\ep A\,\delta^3(\vb r) + (\text{a point dipole } 4\pi\ep B\,\uv z\text{ at the origin}).$$
        `,
      }),

      P({
        title: 'A screened line charge',
        q: md`
          In cylindrical coordinates, $\vb E = \dfrac{k}{s}\left(1+\dfrac sb\right)e^{-s/b}\,\uv s$, with $k>0$.

          Find the line charge $\lambda_0$ on the $z$-axis, $\rho(s)$ for $s>0$, and the total charge per unit length.
        `,
        figHtml: fLineEnd(),
        hints: [
          md`Charge per length inside radius $s$: $\lambda_{\text{enc}}(s) = 2\pi\ep\,sE_s$.`,
          md`$\rho = \dfrac{1}{2\pi s}\dfrac{d\lambda_{\text{enc}}}{ds}$ (a thin cylindrical shell has $2\pi s\,ds$ of cross-section).`,
        ],
        parts: [
          { lbl: '\\lambda_0', expr: '2*pi*eps0*k', vars: { eps0: [0.5, 2], k: [0.5, 3] } },
          { lbl: md`$\rho(s)$, $s>0$`, expr: '-eps0*k*exp(-s/b)/b^2', vars: { eps0: [0.5, 2], k: [0.5, 3], b: [0.5, 2], s: [0.2, 3] } },
          { lbl: md`Total charge per length`, ans: 0, unit: '' },
        ],
        sol: md`
          $\lambda_{\text{enc}}(s) = 2\pi\ep k\left(1+\dfrac sb\right)e^{-s/b}$. At $s\to0$: $\lambda_0 = 2\pi\ep k$ on the axis.

          $\dfrac{d\lambda_{\text{enc}}}{ds} = 2\pi\ep k\left(-\dfrac{s}{b^2}\right)e^{-s/b}$, so $\rho = \dfrac{1}{2\pi s}\dfrac{d\lambda_{\text{enc}}}{ds} = -\dfrac{\ep k}{b^2}e^{-s/b}$: finite on the axis, negative.

          Far away $\lambda_{\text{enc}}\to0$: the cloud screens the line completely. Check: $\int_0^\infty-\dfrac{\ep k}{b^2}e^{-s/b}2\pi s\,ds = -2\pi\ep k$ ✓.

          **What to remember.** Same recipe in any symmetry: (field) × (Gaussian-surface area) is the enclosed charge; its limit at the center is the singular piece.
        `,
      }),

      RF(md`
        ### Exam-style mixed set

        These combine everything: a singular center, a cloud, a boundary at $R$, and the potential. Write $Q_{\text{enc}}(r)$ first every time.
      `),

      Q(md`$\vb E$ is given separately in two regions, $r<R$ and $r>R$. Which checks must you do at $r = R$?`,
        [md`Only that $V$ is continuous`, md`Whether $E_r$ jumps (that gives $\sigma$), and that $V$ is continuous when you build it`, md`That $\rho$ is continuous`, md`None; each region is independent`], 1,
        [md`You also need $\sigma$ from any jump in $E_r$.`,
          null,
          md`$\rho$ may jump freely; nothing requires it to be continuous.`,
          md`The regions share a boundary: a jump in $E_r$ hides charge there, and $V$ must join up.`],
        md`Boundary conditions at a surface: $E^\perp$ jumps by $\sigma/\ep$, and $V$ is continuous. Build $V$ from the outside in, starting each region where the last one ended.`,
        { figHtml: fBallR() }),

      P({
        title: 'Exam-style: a 1/r⁴ field outside a point charge',
        q: md`
          $\vb E = \dfrac{k}{r^2}\uv r$ for $0<r<R$, and $\vb E = \dfrac{kR^2}{r^4}\uv r$ for $r>R$ ($k>0$).

          (a) What is at the origin? (b) Find $\rho$ in each region. (c) Total charge. (d) $V(r)$ for $0<r<R$, with $V(\infty)=0$.
        `,
        figHtml: pF((x) => (x < 1 ? 1 / (x * x) : 1 / Math.pow(x, 4)), { x: [0, 3], y: [0, 4], xt: [[1, 'R'], [2, '2R']], yt: [[1, 'k/R^2']] }),
        hints: [
          md`Is $E_r$ continuous at $R$? Compare $k/R^2$ with $kR^2/R^4$.`,
          md`$Q_{\text{enc}} = 4\pi\ep k$ inside and $4\pi\ep kR^2/r^2$ outside.`,
          md`$V(R) = -\displaystyle\int_\infty^R\frac{kR^2}{r^4}dr$, then continue inward with $k/r^2$.`,
        ],
        parts: [
          { lbl: md`(a) $q_0$`, expr: '4*pi*eps0*k', vars: { eps0: [0.5, 2], k: [0.5, 3] } },
          { lbl: md`(b) $\rho$ for $r>R$`, expr: '-2*eps0*k*R^2/r^5', vars: { eps0: [0.5, 2], k: [0.5, 3], R: [0.5, 1], r: [1.1, 3] } },
          { lbl: md`(c) $Q_{\text{tot}}$`, ans: 0, unit: '' },
          { lbl: md`(d) $V(r)$, $r<R$`, expr: 'k/r - 2*k/(3*R)', vars: { k: [0.5, 3], R: [1.5, 3], r: [0.2, 1.4] } },
        ],
        sol: md`
          **Continuity.** $E_r(R^-) = k/R^2 = E_r(R^+)$: no surface charge.

          **(a)** $Q_{\text{enc}}(r) = 4\pi\ep k$ for $r<R$: a point charge $q_0 = 4\pi\ep k$, and nothing else inside ($\rho = 0$ for $0<r<R$).

          **(b)** Outside, $Q_{\text{enc}} = \dfrac{4\pi\ep kR^2}{r^2}$, so $\rho = \dfrac{1}{4\pi r^2}\cdot\left(-\dfrac{8\pi\ep kR^2}{r^3}\right) = -\dfrac{2\ep kR^2}{r^5}$.

          **(c)** $Q_{\text{enc}}\to0$: total $0$. The cloud outside carries $-4\pi\ep k$.

          **(d)** Conditions: 1. $V(\infty) = 0$. 2. $V$ continuous at $R$.

          $V(r>R) = \dfrac{kR^2}{3r^3}$, so $V(R) = \dfrac{k}{3R}$. Inside: $V(r) = V(R) - \displaystyle\int_R^r\frac{k}{r'^2}dr' = \frac{k}{3R} + \frac kr - \frac kR = \frac kr - \frac{2k}{3R}.$

          **Why this is the sensible $1/r^4$ problem.** The field blows up at the origin like $1/r^2$, which is a finite point charge; the $1/r^4$ part never reaches the origin.
        `,
      }),

      P({
        title: 'Exam-style: read the charge off a piecewise V',
        q: md`
          $V(r) = \dfrac{A}{r}\left(1-\dfrac rR\right)^2$ for $r<R$, and $V = 0$ for $r\ge R$ ($A>0$).

          Find the point charge at the origin, $\rho$ for $0<r<R$, the surface charge on $r=R$, and the total charge.
        `,
        figHtml: pF((x) => (x < 1 ? (1 - x) * (1 - x) / x : 0), { x: [0, 1.6], y: [0, 3], yl: 'V', xt: [[1, 'R']] }),
        hints: [
          md`Expand: $V = A\left(\dfrac1r - \dfrac2R + \dfrac{r}{R^2}\right)$.`,
          md`$\lap\dfrac1r = -4\pi\delta^3$, $\lap(\text{const}) = 0$, $\lap r = \dfrac2r$.`,
          md`$E_r(R^-) = -V'(R)$. Compare with $E_r = 0$ outside.`,
        ],
        parts: [
          { lbl: 'q_0', expr: '4*pi*eps0*A', vars: { eps0: [0.5, 2], A: [0.5, 3] } },
          { lbl: md`$\rho$, $0<r<R$`, expr: '-2*eps0*A/(R^2*r)', vars: { eps0: [0.5, 2], A: [0.5, 3], R: [1.5, 3], r: [0.2, 1.4] } },
          { lbl: '\\sigma(R)', ans: 0, unit: '' },
          { lbl: 'Q_{\\text{tot}}', ans: 0, unit: '' },
        ],
        sol: md`
          **Expand.** $V = A\left(\dfrac1r-\dfrac2R+\dfrac{r}{R^2}\right)$ inside.

          **Origin.** $rV\to A$: $q_0 = 4\pi\ep A$.

          **Cloud.** $\lap r = \dfrac{1}{r^2}\dfrac{d}{dr}(r^2) = \dfrac2r$, so for $0<r<R$: $\rho = -\ep\cdot\dfrac{A}{R^2}\cdot\dfrac2r = -\dfrac{2\ep A}{R^2r}$.

          **Boundary.** $E_r = -V' = A\left(\dfrac{1}{r^2}-\dfrac{1}{R^2}\right)$ inside, which is $0$ at $R$; outside $E = 0$. No jump: $\sigma = 0$. Also $V(R^-) = 0 = V(R^+)$ ✓.

          **Total.** Cloud: $\displaystyle\int_0^R-\frac{2\ep A}{R^2r}4\pi r^2dr = -4\pi\ep A$. Total $0$, consistent with $E = 0$ outside.

          **What to remember.** Expanding $V$ into powers of $r$ turns Poisson's equation into a table lookup: $1/r\to$ point charge, constants $\to$ nothing, $r\to2/r$, $r^2\to6$.
        `,
      }),

      P({
        title: 'Exam-style: a field that looks too singular',
        q: md`
          $\vb E = A\,\dfrac{\sin(r/a)}{r^3}\,\uv r$ for $r<\pi a$, and $\vb E = 0$ for $r>\pi a$ ($A>0$).

          Find the point charge at the origin, $\rho(r)$ for $0<r<\pi a$, and the total charge.
        `,
        figHtml: pF((x) => (x < Math.PI ? Math.sin(x) / (x * x * x) : 0), { x: [0, 4.2], y: [-0.2, 3], xt: [[Math.PI, '\\pi a']] }),
        hints: [
          md`$Q_{\text{enc}} = 4\pi\ep A\dfrac{\sin(r/a)}{r}$. Take $r\to0$ carefully.`,
          md`Differentiate $\dfrac{\sin(r/a)}{r}$ with the quotient rule.`,
          md`Is $E_r$ continuous at $r = \pi a$?`,
        ],
        parts: [
          { lbl: 'q_0', expr: '4*pi*eps0*A/a', vars: { eps0: [0.5, 2], A: [0.5, 3], a: [0.5, 2] } },
          { lbl: md`$\rho(r)$`, expr: 'eps0*A*(r*cos(r/a)/a - sin(r/a))/r^4', vars: { eps0: [0.5, 2], A: [0.5, 3], a: [1, 2], r: [0.2, 3] }, accepts: ['eps0*A*(r*cos(r/a)-a*sin(r/a))/(a*r^4)'] },
          { lbl: 'Q_{\\text{tot}}', ans: 0, unit: '' },
        ],
        sol: md`
          **Origin.** $Q_{\text{enc}} = 4\pi\ep r^2E_r = 4\pi\ep A\dfrac{\sin(r/a)}{r}\to\dfrac{4\pi\ep A}{a}$. Point charge $q_0 = 4\pi\ep A/a$, finite despite the $1/r^3$.

          **Cloud.** $\dfrac{d}{dr}\dfrac{\sin(r/a)}{r} = \dfrac{\cos(r/a)}{ar}-\dfrac{\sin(r/a)}{r^2}$, so

          $$\rho = \frac{\ep A}{r^2}\left(\frac{\cos(r/a)}{ar}-\frac{\sin(r/a)}{r^2}\right) = \frac{\ep A}{r^4}\left(\frac ra\cos\frac ra-\sin\frac ra\right).$$

          Since $x\cos x<\sin x$ for $0<x<\pi$, $\rho<0$: a negative cloud. Near the origin $\rho\approx-\dfrac{\ep A}{3a^3r}$, integrable.

          **Boundary and total.** $\sin\pi = 0$, so $E_r(\pi a^-) = 0 = E_r(\pi a^+)$: no surface charge, and $Q_{\text{enc}}(\pi a) = 0$. The total is $0$.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Compute $Q_{\text{enc}}(r) = 4\pi\ep r^2E_r$ first. Its limit at $0$ is the point charge; its limit at $\infty$ is the total; its slope over $4\pi r^2$ is $\rho$.
          - $\rho = q_0\delta^3(\vb r) + \dfrac{\ep}{r^2}\dfrac{d}{dr}(r^2E_r)$. The plain formula silently drops the first term.
          - $r^2E_r\to0$: no point charge, even if $\rho$ or $E$ is infinite at $0$. $r^2E_r\to$ const: point charge. $r^2E_r\to\infty$: infinite charge; the formula can only hold outside some radius.
          - From $V$: $\rho = -\ep\lap V$, $\lap V = \tfrac1r(rV)''$, and $\lap(1/r) = -4\pi\delta^3$. $q_0 = 4\pi\ep\lim rV$. Expand near $0$ before deciding.
          - A jump in $E_r$ at $R$ is a surface charge $\ep(E_{\text{out}}-E_{\text{in}})$.
          - $V(\infty)=0$ only for localized charge. Otherwise pick a finite reference.
          - $\cos\theta/r^2$ in $V$ is a point dipole, not a point charge. $k/s$ in cylindrical $E_s$ is a line charge $2\pi\ep k$.
          - Rewrite $\vb r$ as $r\uv r$ before counting powers.
      `),
    ],
  });

  // =====================================================================================
  // Lesson 2 figures: blue tint = +rho, red tint = -rho, uncoloured = no net charge.
  // (Hatching means a conductor elsewhere on the site, so it is not used for charge here.)
  // =====================================================================================
  const CHG = { '+': 'fill:var(--primary, #3f7fd8);fill-opacity:.25;stroke:none', '-': 'fill:var(--bad);fill-opacity:.16;stroke:none' };
  // filled region of charge density +rho or -rho; a hole can be cut with a keyhole point list
  function chg(f, pts, sign) {
    pts.forEach((p) => f.track(p[0], p[1]));
    f.add(`<path class="nodecl" style="${CHG[sign]}" d="${dpath(pts)}"/>`);
    return f;
  }
  // label at the end of a thin leader line (keeps labels clear of the outlines)
  const lead = (f, x0, y0, x1, y1, t, anchor) => { f.line(x0, y0, x1, y1, { cls: 'dim thin' }); f.label(x1 + (/l/.test(anchor) ? 3 : /r/.test(anchor) ? -3 : 0), y1, t, anchor); return f; };
  // a point inside a charged region: dot plus a leader to a label outside
  const ptLead = (f, x, y, t, lx, ly, anchor) => { f.dot(x, y, 3); return lead(f, x, y, lx, ly, t, anchor); };

  // Sphere (+rho, radius R) pierced by an infinite cylinder (-rho, radius a) along z. Side view.
  // o: { ap, pts: [[x, z, label, side | {lx, ly, anchor}]] (units of R), dens: false (cylinder density unknown: grey, labelled rho_c), noA }
  function fSphCyl(o = {}) {
    const f = PF.fig();
    const cx = 170, cy = 150, Rp = 90, ap = o.ap ?? 28, ext = 46;
    const phi = Math.acos(-ap / Rp) / DEG, psi = Math.acos(ap / Rp) / DEG;
    const top = cy - Rp - ext, bot = cy + Rp + ext;
    chg(f, f.arcPts(cx, cy, Rp, Rp, phi, 360 - phi), '+');
    chg(f, f.arcPts(cx, cy, Rp, Rp, -psi, psi), '+');
    if (o.dens === false) {
      tint(f, [[cx - ap, top], [cx + ap, top], [cx + ap, bot], [cx - ap, bot]], 0.18);
      lead(f, cx - 62, cy + 40, cx - Rp - 20, cy + 78, '+\\rho', 'r');
      lead(f, cx + ap - 8, top + 14, cx + ap + 26, top + 6, '\\rho_c', 'l');
    } else {
      chg(f, [[cx - ap, top], [cx + ap, top]].concat(f.arcPts(cx, cy, Rp, Rp, psi, phi)), '-');
      chg(f, [[cx + ap, bot], [cx - ap, bot]].concat(f.arcPts(cx, cy, Rp, Rp, 360 - phi, 360 - psi)), '-');
    }
    f.circle(cx, cy, Rp);
    for (const x of [cx - ap, cx + ap]) {
      f.line(x, top, x, bot, { cls: 'thin' });
      f.line(x, top, x, top - 16, { cls: 'thin dash dim' }); f.line(x, bot, x, bot + 16, { cls: 'thin dash dim' });
    }
    f.line(cx, top - 22, cx, bot + 22, { cls: 'dim dash thin' });
    f.label(cx + 5, top - 24, 'z', 'bl', 'small accent');
    if (o.dens !== false) {
      lead(f, cx - 62, cy + 40, cx - Rp - 20, cy + 78, '+\\rho', 'r');
      lead(f, cx + ap - 8, top + 14, cx + ap + 26, top + 6, '-\\rho', 'l');
    }
    const ea = -38 * DEG;
    f.line(cx, cy, cx + Rp * Math.cos(ea), cy - Rp * Math.sin(ea), { cls: 'dim', arrow: 'end', hs: 6 });
    f.tag(cx + Rp * Math.cos(ea), cy - Rp * Math.sin(ea), 'R', 'br', 9, 'small');
    if (!o.noA) f.dim(cx, bot + 26, cx + ap, bot + 26, 'a', { at: 'b' });
    for (const [x, z, t, side] of (o.pts || [])) {
      const px = cx + x * Rp, py = cy - z * Rp;
      if (side && typeof side === 'object') ptLead(f, px, py, t, side.lx, side.ly, side.anchor || 'l');
      else { f.dot(px, py, 3); f.tag(px, py, t, side || 'r', 7); }
    }
    return f.svg();
  }
  // Infinite cylinder (+rho, radius a) with a spherical cavity (radius b) whose centre is a distance d from the axis. Side view.
  function fCylCav(o = {}) {
    const f = PF.fig();
    const cx = 150, cy = 150, ap = 78, bp = o.bp ?? 44, dp = o.dp ?? 0, top = 30, bot = 270;
    const ccx = cx + dp;
    chg(f, [[cx - ap, cy], [cx - ap, top], [cx + ap, top], [cx + ap, bot], [cx - ap, bot], [cx - ap, cy], [ccx - bp, cy]].concat(f.arcPts(ccx, cy, bp, bp, 180, 540)), '+');
    f.circle(ccx, cy, bp);
    for (const x of [cx - ap, cx + ap]) {
      f.line(x, top, x, bot, { cls: 'thin' });
      f.line(x, top, x, top - 16, { cls: 'thin dash dim' }); f.line(x, bot, x, bot + 16, { cls: 'thin dash dim' });
    }
    f.line(cx, top - 22, cx, bot + 22, { cls: 'dim dash thin' });
    f.label(cx + 5, top - 24, 'z', 'bl', 'small accent');
    lead(f, cx - ap + 22, top + 40, cx - ap - 26, top + 22, o.rhoLab || '+\\rho', 'r');
    f.dim(cx, bot + 30, cx + ap, bot + 30, o.aLab || 'a', { at: 'b' });
    f.dot(ccx, cy, 2.4);
    if (!o.noB) {
      f.dim(ccx, cy, ccx + bp * Math.cos(-50 * DEG), cy - bp * Math.sin(-50 * DEG), '');
      f.label(ccx + 0.5 * bp * Math.cos(-50 * DEG) + 6, cy - 0.5 * bp * Math.sin(-50 * DEG) - 4, o.bLab || 'b', 'bl', 'small');
    }
    if (dp) { f.line(ccx, cy + bp, ccx, bot + 60, { cls: 'dim dash thin' }); f.dim(cx, bot + 60, ccx, bot + 60, 'd', { at: 'b' }); }
    for (const [x, z, t, side] of (o.pts || [])) { const px = ccx + x * bp, py = cy - z * bp; f.dot(px, py, 3); f.tag(px, py, t, side || 'r', 7); }
    if (o.q) f.charge(ccx, cy, { q: '+', lab: 'q', at: 'l' });
    if (o.field) {
      f.field((x, y) => { const X = x - ccx, Z = -(y - cy); if (Math.hypot(X, Z) > bp - 8) return null; return [(2 * dp + X) / 6, Z / 3]; },
        [ccx - bp + 8, cy - bp + 8, ccx + bp - 8, cy + bp - 8], 5, 5, { len: 12, mag: true });
    }
    return f.svg();
  }
  // Ball (+rho, radius R) with a line charge along the vertical diameter (finite) or through it (infinite).
  function fBallLine(o = {}) {
    const f = PF.fig();
    const cx = 160, cy = 140, Rp = 90;
    chg(f, f.arcPts(cx, cy, Rp, Rp, 0, 360), '+');
    f.circle(cx, cy, Rp);
    const y0 = o.inf ? cy - Rp - 40 : cy - Rp, y1 = o.inf ? cy + Rp + 40 : cy + Rp;
    f.line(cx, y0, cx, y1, { cls: 'thick' });
    if (o.inf) { f.line(cx, y0, cx, y0 - 14, { cls: 'thick dash' }); f.line(cx, y1, cx, y1 + 14, { cls: 'thick dash' }); }
    f.tag(cx, y0 - (o.inf ? 14 : 0), '\\lambda', 'tr', 8);
    lead(f, cx - 50, cy + 45, cx - Rp - 22, cy + 82, '+\\rho', 'r');
    const ea = 140 * DEG;
    f.line(cx, cy, cx + Rp * Math.cos(ea), cy - Rp * Math.sin(ea), { cls: 'dim', arrow: 'end', hs: 6 });
    f.tag(cx + Rp * Math.cos(ea), cy - Rp * Math.sin(ea), 'R', 'tl', 9, 'small');
    f.line(cx + 4, cy, cx + Rp + 40, cy, { cls: 'dim dash thin nodecl' });
    for (const [s, t, inside] of (o.pts || [])) {
      const px = cx + s * Rp;
      if (inside) ptLead(f, px, cy, t, cx + Rp + 22, cy - 50, 'l'); else { f.dot(px, cy, 3); f.tag(px, cy, t, 'br', 9); }
    }
    return f.svg();
  }
  // A cylinder (axis z, radius a, +rho) and a separate ball (+rho) centred at (D,0,0), radius Rb. P above the ball.
  function fSep(o = {}) {
    const f = PF.fig();
    const u = o.u || 26, cx = 70, cy = 170, ap = u, D = (o.D || 3) * u, Rb = (o.Rb || 1) * u, h = (o.h || 2) * u;
    const top = cy - h - 40, bot = cy + Rb + 40;
    chg(f, [[cx - ap, top], [cx + ap, top], [cx + ap, bot], [cx - ap, bot]], '+');
    for (const x of [cx - ap, cx + ap]) { f.line(x, top, x, bot, { cls: 'thin' }); f.line(x, top, x, top - 14, { cls: 'thin dash dim' }); f.line(x, bot, x, bot + 14, { cls: 'thin dash dim' }); }
    f.line(cx, top - 20, cx, bot + 20, { cls: 'dim dash thin' });
    f.label(cx + 5, top - 22, 'z', 'bl', 'small accent');
    chg(f, f.arcPts(cx + D, cy, Rb, Rb, 0, 360), '+'); f.circle(cx + D, cy, Rb);
    f.dot(cx + D, cy, 2.4);
    f.line(cx + ap + 4, cy, cx + D - Rb - 4, cy, { cls: 'dim dash thin' });
    f.line(cx + D + Rb + 4, cy, cx + D + Rb + 30, cy, { cls: 'dim dash thin' });
    f.label(cx + D + Rb + 34, cy, 'x', 'l', 'small accent');
    lead(f, cx - ap + 10, bot - 20, cx - ap - 18, bot - 4, '+\\rho', 'r');
    lead(f, cx + D + Rb * 0.5, cy + Rb * 0.5, cx + D + Rb + 24, cy + Rb + 18, '+\\rho', 'l');
    f.dim(cx, bot + 26, cx + D, bot + 26, o.Dl || '3a', { at: 'b' });
    f.line(cx + D, cy - Rb, cx + D, cy - h, { cls: 'dim dash thin' });
    f.label(cx + D - 6, cy - Rb - (h - Rb) / 2, o.hl || '2a', 'r', 'small');
    f.dot(cx + D, cy - h, 3); f.tag(cx + D, cy - h, 'P', 't', 7);
    if (o.Rl) f.tag(cx + D + Rb * 0.707, cy - Rb * 0.707, o.Rl, 'tr', 7, 'small');
    return f.svg();
  }
  // Ball (+rho, radius R, centre O) overlapping a cylinder (-rho, radius a) whose axis is a distance d from O (side view).
  function fOffCyl(o = {}) {
    const f = PF.fig();
    const cx = 160, cy = 150, Rp = 100, ap = 36, dp = 22, ext = 40;
    const ax = cx + dp;
    const top = cy - Rp - ext, bot = cy + Rp + ext;
    const ang = (x) => Math.acos((x - cx) / Rp) / DEG;
    const aL = ang(ax - ap), aR = ang(ax + ap);
    chg(f, f.arcPts(cx, cy, Rp, Rp, aL, 360 - aL), '+');
    chg(f, f.arcPts(cx, cy, Rp, Rp, -aR, aR), '+');
    chg(f, [[ax - ap, top], [ax + ap, top]].concat(f.arcPts(cx, cy, Rp, Rp, aR, aL)), '-');
    chg(f, [[ax + ap, bot], [ax - ap, bot]].concat(f.arcPts(cx, cy, Rp, Rp, 360 - aL, 360 - aR)), '-');
    f.circle(cx, cy, Rp);
    for (const x of [ax - ap, ax + ap]) { f.line(x, top, x, bot, { cls: 'thin' }); f.line(x, top, x, top - 14, { cls: 'thin dash dim' }); f.line(x, bot, x, bot + 14, { cls: 'thin dash dim' }); }
    f.line(ax, top - 20, ax, bot + 20, { cls: 'dim dash thin' });
    f.label(ax + 5, top - 22, '\\text{axis}', 'bl', 'small accent');
    f.dot(cx, cy, 3); f.label(cx + 4, cy + 4, 'O', 'tl', 'small');
    f.dim(cx, cy - 30, ax, cy - 30, 'd', { at: 't' });
    lead(f, cx - 64, cy + 40, cx - Rp - 18, cy + 76, '+\\rho', 'r');
    lead(f, ax + ap - 8, top + 14, ax + ap + 24, top + 4, '-\\rho', 'l');
    f.dim(ax, bot + 26, ax + ap, bot + 26, 'a', { at: 'b' });
    const ea = 160 * DEG;
    f.line(cx, cy, cx + Rp * Math.cos(ea), cy - Rp * Math.sin(ea), { cls: 'dim', arrow: 'end', hs: 6 });
    f.tag(cx + Rp * Math.cos(ea), cy - Rp * Math.sin(ea), 'R', 'tl', 9, 'small');
    for (const [x, z, t, side] of (o.pts || [])) { const px = cx + x * Rp, py = cy - z * Rp; f.dot(px, py, 3); f.tag(px, py, t, side || 'r', 7); }
    return f.svg();
  }
  // Two overlapping balls (+rho left, -rho right), centres a distance d apart. Overlap uncoloured.
  function fTwoBalls(o = {}) {
    const f = PF.fig();
    const cy = 120, Rp = 80, D = o.D || 100, x1 = 110, x2 = x1 + D;
    const al = Math.acos(D / 2 / Rp) / DEG;
    const cyl = !!o.cyl;
    chg(f, f.arcPts(x1, cy, Rp, Rp, al, 360 - al).concat(f.arcPts(x2, cy, Rp, Rp, 180 + al, 180 - al)), '+');
    chg(f, f.arcPts(x2, cy, Rp, Rp, 180 + al, 540 - al).concat(f.arcPts(x1, cy, Rp, Rp, al, -al)), '-');
    f.circle(x1, cy, Rp); f.circle(x2, cy, Rp);
    f.dot(x1, cy, 2.6); f.dot(x2, cy, 2.6);
    f.arrow(x1, cy, x2 - 4, cy, { cls: 'dim', hs: 6 });
    f.label((x1 + x2) / 2, cy + 6, '\\vb d', 't', 'small');
    lead(f, x1 - 40, cy - 40, x1 - Rp - 14, cy - Rp + 4, '+\\rho', 'r');
    f.label(x2 + 34, cy - 40, '-\\rho', 'c');
    if (o.field) for (const y of [cy - 30, cy + 30]) f.arrow((x1 + x2) / 2 - 12, y, (x1 + x2) / 2 + 12, y, { hs: 5 });
    return f.svg();
  }
  // Ball (+rho) with an off-centre spherical cavity, centres a distance d apart.
  // o: { dp: offset in px (0 = concentric), inner: true fills the small ball red (a -2rho ball), end: true = end view of two cylinders }
  function fBallCav(o = {}) {
    const f = PF.fig();
    const cx = 130, cy = 120, Rp = 90, bp = 32, dp = o.dp ?? 46, hx = cx + dp;
    chg(f, f.arcPts(cx, cy, Rp, Rp, 0, 360).concat(f.arcPts(hx, cy, bp, bp, 360, 0)), '+');
    if (o.inner) chg(f, f.arcPts(hx, cy, bp, bp, 0, 360), '-');
    f.circle(cx, cy, Rp); f.circle(hx, cy, bp);
    f.dot(cx, cy, 2.6); if (dp) f.dot(hx, cy, 2.6);
    lead(f, cx - 50, cy + 44, cx - Rp - 14, cy + 78, '+\\rho', 'r');
    if (o.inner) lead(f, hx + 10, cy - 14, cx + Rp + 18, cy - Rp + 6, '\\text{net } -\\rho', 'l');
    if (dp) {
      const yd = cy + Rp + 18;
      f.line(cx, cy + 4, cx, yd + 4, { cls: 'dim dash thin' }); f.line(hx, cy + 4, hx, yd + 4, { cls: 'dim dash thin' });
      f.dim(cx, yd, hx, yd, '\\vb d', { at: 'b' });
    }
    if (o.end) f.text(cx - Rp, cy - Rp - 8, 'end view: both axes out of the page', 'bl');
    return f.svg();
  }
  // Two infinite cylinders crossing at right angles (+rho vertical, -rho horizontal), side view.
  function fCross() {
    const f = PF.fig();
    const cx = 150, cy = 130, a = 34, L = 110;
    chg(f, [[cx - a, cy - L], [cx + a, cy - L], [cx + a, cy - a], [cx - a, cy - a]], '+');
    chg(f, [[cx - a, cy + a], [cx + a, cy + a], [cx + a, cy + L], [cx - a, cy + L]], '+');
    chg(f, [[cx - L - 30, cy - a], [cx - a, cy - a], [cx - a, cy + a], [cx - L - 30, cy + a]], '-');
    chg(f, [[cx + a, cy - a], [cx + L + 30, cy - a], [cx + L + 30, cy + a], [cx + a, cy + a]], '-');
    for (const x of [cx - a, cx + a]) f.line(x, cy - L, x, cy + L, { cls: 'thin' });
    for (const y of [cy - a, cy + a]) f.line(cx - L - 30, y, cx + L + 30, y, { cls: 'thin' });
    lead(f, cx + a - 10, cy - L + 20, cx + a + 30, cy - L + 6, '+\\rho\\ (\\text{along } z)', 'l');
    f.label(cx + L - 6, cy, '-\\rho', 'c');
    f.label(cx - L + 6, cy, '-\\rho', 'c');
    f.label(cx + L + 34, cy + a + 12, '\\text{along } y', 'l', 'small accent');
    return f.svg();
  }
  // Building blocks: a ball and a cylinder with Gaussian surfaces (theory figure).
  function fBlocks() {
    const a = (() => {
      const f = PF.fig();
      const cx = 110, cy = 110, Rp = 80, rr = 46;
      chg(f, f.arcPts(cx, cy, Rp, Rp, 0, 360), '+'); f.circle(cx, cy, Rp);
      f.circle(cx, cy, rr, { cls: 'dash' });
      f.dot(cx, cy, 2.4);
      f.line(cx, cy, cx + rr * Math.cos(30 * DEG), cy - rr * Math.sin(30 * DEG), { cls: 'dim', arrow: 'end', hs: 5 });
      lead(f, cx + 0.5 * rr * Math.cos(30 * DEG), cy - 0.5 * rr * Math.sin(30 * DEG), cx + Rp + 18, cy - 50, 'r', 'l');
      lead(f, cx - 50, cy + 44, cx - Rp - 14, cy + 74, '\\rho', 'r');
      f.tag(cx + Rp * Math.cos(-40 * DEG), cy - Rp * Math.sin(-40 * DEG), 'R', 'br', 8, 'small');
      return f.svg();
    })();
    const b = (() => {
      const f = PF.fig();
      const cx = 110, top = 20, bot = 200, ap = 54, sp = 32;
      chg(f, [[cx - ap, top], [cx + ap, top], [cx + ap, bot], [cx - ap, bot]], '+');
      for (const x of [cx - ap, cx + ap]) { f.line(x, top, x, bot, { cls: 'thin' }); f.line(x, top, x, top - 12, { cls: 'thin dash dim' }); f.line(x, bot, x, bot + 12, { cls: 'thin dash dim' }); }
      f.line(cx, top - 16, cx, bot + 16, { cls: 'dim dash thin' });
      f.rect(cx - sp, 70, 2 * sp, 80, { cls: 'dash' });
      f.line(cx, 110, cx + sp, 110, { cls: 'dim', arrow: 'end', hs: 5 });
      lead(f, cx + sp / 2, 110, cx + ap + 20, 96, 's', 'l');
      lead(f, cx - sp, 130, cx - ap - 18, 150, 'L', 'r');
      lead(f, cx - ap + 14, top + 20, cx - ap - 18, top + 10, '\\rho', 'r');
      f.dim(cx, bot + 22, cx + ap, bot + 22, 'a', { at: 'b' });
      return f.svg();
    })();
    return PF.row([{ svg: a, cap: md`Ball (blue = $+\rho$): Gaussian sphere of radius $r$.` }, { svg: b, cap: md`Infinite cylinder (blue = $+\rho$): coaxial Gaussian cylinder, radius $s$, length $L$.` }]);
  }

  // =====================================================================================
  // Lesson 2: Gauss's law with superposed cylinders and spheres
  // =====================================================================================
  LESSONS.push({
    id: 'uP-superpose', title: "Gauss's law with superposed cylinders and spheres",
    steps: [
      RF(md`
        ### The two building blocks

        Gauss's law gives $\vb E$ only for very symmetric pieces. The trick for "a sphere and a cylinder superimposed" is to split the configuration into such pieces, find each field separately, and add the vectors.

        [[fig:blocks]]

        **Uniform ball** (density $\rho$, radius $R$, center $\vb c$). Gaussian sphere of radius $r$ around the center: $E\cdot4\pi r^2 = \dfrac{\rho\cdot\frac43\pi r^3}{\ep}$ inside. With $\vb r$ measured **from the ball's own center**:

        $$\vb E_{\text{ball}} = \frac{\rho}{3\ep}\,\vb r\quad(r<R),\qquad \vb E_{\text{ball}} = \frac{\rho R^3}{3\ep}\,\frac{\vb r}{r^3} = \frac{Q}{4\pi\ep r^2}\uv r\quad(r>R).$$

        **Infinite uniform cylinder** (density $\rho$, radius $a$, axis along $\uv z$). Coaxial Gaussian cylinder of radius $s$ and length $L$; the end caps carry no flux: $E\cdot2\pi sL = \dfrac{\rho\,\pi s^2L}{\ep}$ inside. With $\vb s$ the **perpendicular** vector from the axis, $\vb s = (x,y,0)$:

        $$\vb E_{\text{cyl}} = \frac{\rho}{2\ep}\,\vb s\quad(s<a),\qquad \vb E_{\text{cyl}} = \frac{\rho a^2}{2\ep}\,\frac{\vb s}{s^2} = \frac{\lambda}{2\pi\ep s}\uv s\quad(s>a),\quad\lambda = \rho\pi a^2.$$

        **Line charge** $\lambda$ (infinite): $\vb E = \dfrac{\lambda}{2\pi\ep s}\uv s$.

        !!key Each piece gets its own origin
          Write each piece's field as a vector measured from **its own** center (ball) or **its own** axis (cylinder), decide inside or outside for **that piece alone**, then add. The cylinder's $\vb s$ has no $z$-component.
      `, { blocks: fBlocks() }),

      Q(md`Inside a uniform ball $E = \dfrac{\rho r}{3\ep}$, inside an infinite uniform cylinder $E = \dfrac{\rho s}{2\ep}$. Where do the $3$ and the $2$ come from?`,
        [md`From $4\pi$ versus $2\pi$ in the solid angles`, md`From (enclosed volume)/(Gaussian area): $\dfrac{\frac43\pi r^3}{4\pi r^2} = \dfrac r3$ and $\dfrac{\pi s^2L}{2\pi sL} = \dfrac s2$`, md`The cylinder is infinite, so its field is $3/2$ times larger`, md`They are conventions; both could be written with a $3$`], 1,
        [md`$4\pi/2\pi = 2$ is not the ratio $3/2$; the volume-to-area ratio is what matters.`,
          null,
          md`Being infinite is why Gauss works for it, not where the factor comes from.`,
          md`They are fixed by Gauss's law; get them wrong and every superposition answer is wrong.`],
        md`$E\cdot(\text{area}) = \rho\cdot(\text{volume})/\ep$, so $E = \dfrac{\rho}{\ep}\cdot\dfrac{\text{volume}}{\text{area}}$. A ball gives $r/3$, a cylinder $s/2$, a slab gives $x$ (for a slab of thickness $2d$, at distance $x$ from the mid-plane). This mismatch is what makes mixed superpositions non-uniform.`,
        { figHtml: fBlocks().svg }),

      Q(md`A cylinder lies along the $z$-axis. At the point $(x,y,z)$, what is the vector $\vb s$ in $\vb E_{\text{cyl}} = \dfrac{\rho}{2\ep}\vb s$?`,
        [md`$(x,y,z)$`, md`$(0,0,z)$`, md`$(x,y,0)$`, md`$\sqrt{x^2+y^2}\,\uv z$`], 2,
        [md`That is the spherical $\vb r$. The cylinder's field has no $z$-component.`,
          md`That points along the axis; the field points away from it.`,
          null,
          md`Its size is right but it points along $z$; the field is perpendicular to the axis.`],
        md`$\vb s$ runs perpendicularly from the axis to the point: $(x,y,0)$. Moving along $z$ doesn't change the field of an infinite cylinder.`,
        { figHtml: fBlocks().svg }),

      Q(md`What is the field of an infinite uniformly charged cylinder at a point **on its own axis**?`,
        [md`$\dfrac{\rho a}{2\ep}$ along the axis`, md`$\dfrac{\rho a^2}{2\ep s}$`, md`Infinite`, md`Zero`], 3,
        [md`By symmetry it can't point along the axis (the cylinder looks the same in both directions) or sideways (all sideways directions are equivalent).`,
          md`That is the outside formula; the axis is inside, and there $s = 0$.`,
          md`The charge is spread out; nothing is singular on the axis.`,
          null],
        md`$\vb E = \dfrac{\rho}{2\ep}\vb s$ with $\vb s = 0$. This is why, in "sphere pierced by a cylinder", the cylinder drops out of the field on the axis.`,
        { figHtml: fBlocks().svg }),

      Q(md`Why can the field of an **infinite** uniform cylinder have no component along its axis?`,
        [md`Translation along the axis and reflection $z\to-z$ leave the cylinder unchanged, so they must leave $\vb E$ unchanged`, md`Because the end caps of the Gaussian cylinder have no flux`, md`Because charge only produces radial fields`, md`It can; it's just small`], 0,
        [null,
          md`That is a consequence of $E_z = 0$, used in the Gauss calculation, not its reason.`,
          md`A finite rod has an axial field near its ends. The reason is the symmetry of the infinite cylinder.`,
          md`For an infinite cylinder it is exactly zero.`],
        md`Reflecting through any plane perpendicular to the axis maps the cylinder onto itself and flips $E_z$, so $E_z = -E_z = 0$. Gauss's law then needs only the curved side.`,
        { figHtml: fBlocks().svg }),

      Q(md`Outside an infinite cylinder of radius $a$ and density $\rho$, the field is the same as that of`,
        [md`A point charge $\rho\pi a^2$ on the axis`, md`A line charge $\lambda = \rho\pi a^2$ on the axis`, md`A line charge $\lambda = 2\pi a\rho$`, md`A line charge $\lambda = \rho a^2$`], 1,
        [md`An infinite cylinder carries infinite total charge; it is a line, not a point.`,
          null,
          md`$2\pi a$ is the circumference. Charge per length is $\rho$ times the cross-section area.`,
          md`Missing the $\pi$ of the cross-section area $\pi a^2$.`],
        md`Per unit length the cylinder holds $\rho\pi a^2$. Outside, Gauss's law only sees that: $E = \dfrac{\rho\pi a^2}{2\pi\ep s} = \dfrac{\rho a^2}{2\ep s}$.`,
        { figHtml: fBlocks().svg }),

      Q(md`At a point inside a uniform ball, a distance $r$ from the center, which charges set the field?`,
        [md`All the charge: the shells outside $r$ add an inward push that reduces the field`, md`Only the charge closer to the center than $r$; shells outside $r$ give zero field there`, md`Only the charge outside $r$`, md`Only the charge within a distance $r$ of the point`], 1,
        [md`A uniform shell gives exactly zero field everywhere inside it, so the shells outside $r$ add nothing, inward or outward.`,
          null,
          md`Backwards: the outer shells give nothing.`,
          md`The relevant region is a ball around the **center**, not around the point.`],
        md`A uniform spherical shell gives zero field inside it. So at radius $r$, only the ball of radius $r$ matters, and it acts like a point charge $\rho\cdot\frac43\pi r^3$ at the center: $E = \dfrac{\rho r}{3\ep}$.`,
        { figHtml: fBlocks().svg }),

      RF(md`
        ### Holes are negative charge

        A region with a hole is the full region **plus** a piece of density $-\rho$ filling the hole. Each of these has a symmetric shape, so each gets Gauss's law; then add. The same works for regions of different density that overlap: just superpose the pieces with their own densities.

        **Warm-up: two overlapping balls.** Two balls of radius $R$, densities $+\rho$ and $-\rho$, centers separated by $\vb d$ (from the $+$ center to the $-$ center). In the overlap, both inside formulas apply, with $\vb r_+$ and $\vb r_-$ measured from the two centers:

        $$\vb E = \frac{\rho}{3\ep}\vb r_+ - \frac{\rho}{3\ep}\vb r_- = \frac{\rho}{3\ep}\left(\vb r_+-\vb r_-\right) = \frac{\rho}{3\ep}\,\vb d.$$

        [[fig:two]]

        **Uniform!** The position dependence cancels because both pieces have the **same** coefficient $\dfrac{\rho}{3\ep}$. A ball with an off-center spherical cavity is the same calculation: the field in the cavity is $\dfrac{\rho}{3\ep}\vb d$, with $\vb d$ from the ball's center to the cavity's center.

        **Cylinder analog.** An infinite cylinder with an off-axis cylindrical hole (parallel axes, separation $\vb d$ perpendicular to them): $\vb E_{\text{hole}} = \dfrac{\rho}{2\ep}\vb d$, also uniform.

        **Mixed shapes are different.** A sphere and a cylinder have different coefficients ($\tfrac13$ vs $\tfrac12$) and the cylinder has no $z$-component, so the position dependence does **not** cancel.
      `, { two: { svg: fTwoBalls({ field: true }), cap: md`Overlapping balls: blue = $+\rho$, red = $-\rho$. The uncoloured overlap has no net charge, yet carries the uniform field $\dfrac{\rho}{3\ep}\vb d$.` } }),

      Q(md`Two balls, $+\rho$ and $-\rho$, overlap as shown. Which way does the field point in the uncoloured overlap?`,
        [md`From the $-$ center toward the $+$ center`, md`It is zero, because the net density there is zero`, md`Radially out from the middle of the overlap`, md`Along $\vb d$, from the $+$ center toward the $-$ center`], 3,
        [md`Field lines run from positive charge to negative charge, so from $+$ toward $-$.`,
          md`Zero density means zero **divergence**, not zero field. The surrounding charges still push.`,
          md`The field is uniform there; nothing is radial.`,
          null],
        md`$\vb E = \dfrac{\rho}{3\ep}(\vb r_+ - \vb r_-) = \dfrac{\rho}{3\ep}\vb d$, pointing from the positive ball's center to the negative ball's center, the same everywhere in the overlap.`,
        { figHtml: fTwoBalls() }),

      Q(md`An infinite cylinder of density $\rho$ has a cylindrical hole drilled parallel to its axis; the hole's axis is displaced by $\vb d$ (perpendicular to the axes). What is the field inside the hole?`,
        [md`Zero`, md`$\dfrac{\rho}{3\ep}\vb d$`, md`$\dfrac{\rho}{2\ep}\vb d$, uniform`, md`$\dfrac{\rho}{2\ep}\vb s$, as if there were no hole`], 2,
        [md`Only a concentric hole ($\vb d = 0$) gives zero.`,
          md`That is the ball result. Cylinders have $\tfrac12$.`,
          null,
          md`The hole's $-\rho$ adds $-\dfrac{\rho}{2\ep}(\vb s-\vb d)$.`],
        md`$\dfrac{\rho}{2\ep}\vb s - \dfrac{\rho}{2\ep}(\vb s - \vb d) = \dfrac{\rho}{2\ep}\vb d$: uniform, pointing from the big axis toward the hole's axis.`,
        { figHtml: fBallCav({ end: true }) }),

      Q(md`Which superposition gives a **uniform** field in the region where both pieces overlap?`,
        [md`A $+\rho$ ball and a $-\rho$ infinite cylinder through it`, md`A $+\rho$ ball and a $-\rho$ ball (any offset)`, md`A $+\rho$ ball and a $-2\rho$ ball`, md`A $+\rho$ cylinder and a $-\rho$ cylinder at right angles`], 1,
        [md`$\dfrac{\rho}{3\ep}\vb r - \dfrac{\rho}{2\ep}\vb s$ still depends on position: the coefficients differ, and only the sphere has a $z$-part.`,
          null,
          md`$\dfrac{\rho}{3\ep}\vb r_1 - \dfrac{2\rho}{3\ep}\vb r_2$ leaves $-\dfrac{\rho}{3\ep}\vb r$ behind.`,
          md`$\dfrac{\rho}{2\ep}(x,y,0) - \dfrac{\rho}{2\ep}(x,0,z) = \dfrac{\rho}{2\ep}(0,y,-z)$: not uniform.`],
        md`Uniformity needs equal and opposite densities **and** the same shape type with parallel orientation, so that the linear terms cancel and only the offset survives.`,
        { figHtml: fCross() }),

      Q(md`A ball of density $\rho$ has a spherical cavity **concentric** with it. What is the field in the cavity?`,
        [md`Zero`, md`$\dfrac{\rho}{3\ep}\vb r$`, md`$-\dfrac{\rho}{3\ep}\vb r$`, md`Uniform but nonzero`], 0,
        [null,
          md`The cavity's $-\rho$ cancels this exactly.`,
          md`That is only the cavity piece; add the full ball.`,
          md`The offset $\vb d$ is zero, so the uniform field is zero.`],
        md`$\vb d = 0$ in $\dfrac{\rho}{3\ep}\vb d$. It is the shell theorem again: a thick spherical shell gives no field in its hollow.`,
        { figHtml: fBallCav({ dp: 0 }) }),

      Q(md`In the overlap of the two balls the net charge density is zero. Why is the field not zero there?`,
        [md`Because of numerical error in superposition`, md`Because $\divg\vb E = 0$ forces $\vb E$ to be constant`, md`The field at a point depends on all the charge everywhere; zero local density only means zero divergence there`, md`Because the overlap region is not symmetric`], 2,
        [md`Superposition is exact.`,
          md`$\divg\vb E = 0$ allows many fields; a uniform one is just one of them.`,
          null,
          md`Symmetry isn't the issue; the surrounding charge is.`],
        md`Gauss's law in differential form is local: $\divg\vb E = \rho/\ep = 0$ in the overlap. The field itself is produced by the charged crescents on either side, positive on one side and negative on the other: a uniform field, like between capacitor plates.`,
        { figHtml: fTwoBalls() }),

      Q(md`A ball of density $\rho$ has an empty spherical cavity whose center is displaced by $\vb d$ from the ball's center. Which way does the field point inside the cavity?`,
        [md`Radially out from the cavity's center`, md`Radially out from the ball's center`, md`Along $-\vb d$, toward the ball's center`, md`Along $\vb d$, from the ball's center toward the cavity's center, the same everywhere`], 3,
        [md`The cavity is not a charge; its field (as $-\rho$) is radial **inward**, and it is not alone.`,
          md`That is the full ball without the cavity.`,
          md`Sign: $\dfrac{\rho}{3\ep}\vb r - \dfrac{\rho}{3\ep}(\vb r - \vb d) = +\dfrac{\rho}{3\ep}\vb d$.`,
          null],
        md`Ball plus a $-\rho$ ball in the cavity: $\vb E = \dfrac{\rho}{3\ep}\vb d$. The thick side of the ball (opposite the cavity) pushes harder, so the field points toward the thin side.`,
        { figHtml: fBallCav() }),

      Q(md`Two overlapping balls, $+\rho$ and $-\rho$. At a point inside the $+$ ball but **outside** the $-$ ball, the field is`,
        [md`$\dfrac{\rho}{3\ep}\vb d$, as in the overlap`, md`$\dfrac{\rho}{3\ep}\vb r_+$ only`, md`$\dfrac{\rho}{3\ep}\vb r_+ - \dfrac{\rho R^3}{3\ep}\dfrac{\vb r_-}{r_-^3}$, not uniform`, md`zero`], 2,
        [md`The uniform result needs both inside formulas; here the $-$ ball uses its outside formula.`,
          md`The $-$ ball still has a field outside itself.`,
          null,
          md`Nothing cancels it there.`],
        md`Inside/outside is decided for each piece separately. Only in the overlap are both inside formulas valid.`,
        { figHtml: fTwoBalls() }),

      Q(md`An infinite cylinder of radius $a$ and density $-\rho$, seen from a distance $s\gg a$, looks like`,
        [md`a point charge`, md`nothing: its field falls off too fast to matter`, md`a uniform field`, md`a line charge $\lambda = -\rho\pi a^2$ on its axis, with field $-\dfrac{\rho a^2}{2\ep s}\uv s$`], 3,
        [md`It is infinitely long; it never looks like a point.`,
          md`Its field falls only as $1/s$, slower than any ball's $1/s^2$.`,
          md`Its field depends on $s$.`,
          null],
        md`Outside, a cylinder is exactly a line charge $\lambda = \rho\pi a^2$ (with its sign). This is also why a thin hole ($a\to0$) drops out: $\lambda\propto a^2\to0$.`,
        { figHtml: fBlocks().svg }),

      RF(md`
        ### Worked example: a spherical cavity in a cylinder is not uniform

        An infinite cylinder (radius $a$, density $\rho$, axis $z$) contains an empty spherical cavity of radius $b<a$ centered on the axis at the origin. Find $\vb E$ inside the cavity.

        [[fig:set]]

        **Pieces.** Full cylinder ($+\rho$) plus a ball of $-\rho$ filling the cavity. At a point $(x,y,z)$ in the cavity, both inside formulas apply:

        $$\vb E = \frac{\rho}{2\ep}(x,\,y,\,0) - \frac{\rho}{3\ep}(x,\,y,\,z) = \frac{\rho}{6\ep}\big(x,\;y,\;-2z\big) = \frac{\rho}{6\ep}\left(\vb s - 2z\,\uv z\right).$$

        **Not uniform.** Sideways the cylinder wins ($\tfrac12>\tfrac13$): the field points away from the axis. Along the axis only the ball term acts, and it is negative: the field points **toward** the cavity's center. At the center itself $\vb E = 0$.

        [[fig:sol]]

        **Checks.** $\divg\vb E = \dfrac{\rho}{6\ep}(1+1-2) = 0$: the cavity is empty ✓. $\curl\vb E = 0$ (each component depends only on its own coordinate) ✓.

        **Why it differs from two spheres.** In "ball minus ball" the $\tfrac13\vb r$ terms cancel exactly. Here $\tfrac12\vb s$ and $\tfrac13\vb r$ can't cancel: different coefficients and different vectors.
      `, {
        set: { svg: fCylCav(), cap: md`Infinite cylinder of radius $a$ (blue = $+\rho$) with an empty, uncoloured spherical cavity of radius $b$ on the axis.` },
        sol: { svg: fCylCav({ field: true, noB: true }), cap: md`The field in the cavity (blue = $+\rho$): outward from the axis sideways, toward the center along $z$.` },
      }),

      Q(md`In the worked example, at a point on the axis just above the cavity's center ($z>0$), which way does $\vb E$ point?`,
        [md`Up ($+\uv z$), away from the center`, md`Sideways, away from the axis`, md`Zero`, md`Down ($-\uv z$), toward the center`], 3,
        [md`The cylinder gives nothing on its axis; the $-\rho$ ball pulls positive test charges toward its center.`,
          md`On the axis $\vb s = 0$: no sideways part.`,
          md`Only at the center itself.`,
          null],
        md`$E_z = -\dfrac{\rho z}{3\ep}$: the cavity acts like a negative ball, and the cylinder contributes no axial field.`,
        { figHtml: fCylCav() }),

      Q(md`In the worked example, compare $|\vb E|$ at two points on the cavity wall: on the equator ($s = b$, $z = 0$) and at the top ($s = 0$, $z = b$).`,
        [md`Equal, $\dfrac{\rho b}{6\ep}$`, md`Equator $\dfrac{\rho b}{6\ep}$, top $\dfrac{\rho b}{3\ep}$`, md`Equator $\dfrac{\rho b}{2\ep}$, top $\dfrac{\rho b}{3\ep}$`, md`Both zero`], 1,
        [md`$E_z$ has the factor $-2$: the top is twice as strong.`,
          null,
          md`At the equator the cavity's $-\dfrac{\rho b}{3\ep}$ partly cancels the cylinder's $\dfrac{\rho b}{2\ep}$.`,
          md`Only the center has zero field.`],
        md`$\vb E = \dfrac{\rho}{6\ep}(x,y,-2z)$: magnitude $\dfrac{\rho b}{6\ep}$ at the equator and $\dfrac{2\rho b}{6\ep} = \dfrac{\rho b}{3\ep}$ at the top.`,
        { figHtml: fCylCav() }),

      Q(md`You found $\vb E = \dfrac{\rho}{6\ep}(x,y,-2z)$ in an empty cavity. Which quick check confirms it?`,
        [md`$\divg\vb E = 0$`, md`$\vb E$ is uniform`, md`$|\vb E|$ is the same everywhere on the cavity wall`, md`$\vb E$ is radial from the cavity's center`], 0,
        [null,
          md`It isn't uniform, and it doesn't need to be.`,
          md`The cavity wall is not a surface of any symmetry of the whole configuration.`,
          md`Only on the axis and in the equatorial plane is it along a radius.`],
        md`No charge in the cavity means $\divg\vb E = 0$: $\dfrac{\rho}{6\ep}(1+1-2) = 0$ ✓. If you had used $\tfrac13$ for the cylinder or forgotten the $z$-part of the ball, this check fails.`,
        { figHtml: fCylCav() }),

      Q(md`A student claims the field in a spherical cavity of an infinite cylinder is uniform, "just like the two overlapping spheres". What is wrong?`,
        [md`Nothing; it is uniform when the cavity is centered`, md`Uniformity needs the same coefficient and the same kind of vector for both pieces; here $\tfrac12\vb s$ and $\tfrac13\vb r$ don't cancel`, md`Superposition doesn't apply to cylinders`, md`The cylinder field is zero inside, so the field is just the cavity's`], 1,
        [md`Centered or not, $\dfrac{\rho}{6\ep}(x,y,-2z)$ varies with position.`,
          null,
          md`Superposition always applies; it is Gauss's law for the **combined** shape that fails.`,
          md`The cylinder's field inside is $\dfrac{\rho}{2\ep}\vb s$, not zero.`],
        md`For two balls: $\tfrac13\vb r_+ - \tfrac13\vb r_- = \tfrac13\vb d$. For a cylinder and a ball the linear terms survive. Uniform fields in cavities are special to matched shapes.`,
        { figHtml: fCylCav() }),

      P({
        title: 'An off-axis spherical cavity in a cylinder',
        q: md`
          An infinite cylinder (radius $a$, uniform density $\rho$, axis along $z$) has an empty spherical cavity of radius $b$ whose center is at $(d,0,0)$, with $d+b<a$.

          Find $E_x$ at the cavity's center, and $E_x$ and $E_z$ at the top of the cavity, the point $(d, 0, b)$.
        `,
        figHtml: fCylCav({ dp: 26, bp: 40, pts: [[0, 1, 'T', 'br']] }),
        hints: [
          md`Full cylinder plus a ball of $-\rho$ centered at $(d,0,0)$.`,
          md`Cylinder: $\dfrac{\rho}{2\ep}(x,y,0)$. Cavity ball: $-\dfrac{\rho}{3\ep}(x-d,\,y,\,z)$.`,
          md`Add them and substitute the two points.`,
        ],
        parts: [
          { lbl: md`$E_x$ at the cavity center`, expr: 'rho*d/(2*eps0)', vars: { rho: [0.5, 3], d: [0.2, 1], eps0: [0.5, 2] } },
          { lbl: md`$E_x$ at $(d,0,b)$`, expr: 'rho*d/(2*eps0)', vars: { rho: [0.5, 3], d: [0.2, 1], eps0: [0.5, 2] } },
          { lbl: md`$E_z$ at $(d,0,b)$`, expr: '-rho*b/(3*eps0)', vars: { rho: [0.5, 3], b: [0.2, 1], eps0: [0.5, 2] } },
        ],
        sol: md`
          **Superposition.** For a point in the cavity,

          $$\vb E = \frac{\rho}{2\ep}(x,y,0) - \frac{\rho}{3\ep}(x-d,\,y,\,z) = \frac{\rho}{6\ep}\big(x+2d,\;y,\;-2z\big).$$

          **Center** $(d,0,0)$: $\vb E = \dfrac{\rho}{6\ep}(3d,0,0) = \dfrac{\rho d}{2\ep}\uv x$. Only the cylinder contributes (the ball gives zero at its own center).

          **Top** $(d,0,b)$: $\vb E = \dfrac{\rho}{6\ep}(3d,0,-2b)$, so $E_x = \dfrac{\rho d}{2\ep}$ and $E_z = -\dfrac{\rho b}{3\ep}$.

          **Check.** $d = 0$ gives the centered result $\dfrac{\rho}{6\ep}(x,y,-2z)$ ✓. $\divg\vb E = \dfrac{\rho}{6\ep}(1+1-2) = 0$ ✓.
        `,
      }),

      RF(md`
        ### The exam configuration: a sphere pierced by a cylinder

        A ball (radius $R$, density $+\rho$) and an infinite cylinder (radius $a<R$, density $-\rho$) along a diameter, the $z$-axis. Inside the ball the two cancel: a cylindrical **hole**. Outside the ball the cylinder sticks out with net $-\rho$.

        [[fig:reg]]

        Classify the point for each piece separately: inside or outside the ball ($r$ vs $R$), inside or outside the cylinder ($s$ vs $a$). With $\vb r = (x,y,z)$ and $\vb s = (x,y,0)$:

        | Region | ball | cylinder | $\vb E$ |
        |---|---|---|---|
        | I: the hole ($r<R$, $s<a$) | inside | inside | $\dfrac{\rho}{3\ep}\vb r - \dfrac{\rho}{2\ep}\vb s$ |
        | II: the solid part ($r<R$, $s>a$) | inside | outside | $\dfrac{\rho}{3\ep}\vb r - \dfrac{\rho a^2}{2\ep}\dfrac{\vb s}{s^2}$ |
        | III: the stubs ($r>R$, $s<a$) | outside | inside | $\dfrac{\rho R^3}{3\ep}\dfrac{\vb r}{r^3} - \dfrac{\rho}{2\ep}\vb s$ |
        | IV: everywhere else ($r>R$, $s>a$) | outside | outside | $\dfrac{\rho R^3}{3\ep}\dfrac{\vb r}{r^3} - \dfrac{\rho a^2}{2\ep}\dfrac{\vb s}{s^2}$ |

        On the $z$-axis, $\vb s = 0$, so the cylinder contributes nothing: $\vb E = \dfrac{\rho z}{3\ep}\uv z$ inside the ball and $\dfrac{\rho R^3}{3\ep z^2}\uv z$ outside, as if there were no hole.

        !!trap A truly drilled hole is a different problem
          If the hole is drilled and nothing sticks out, the removed piece is a **finite** plug (a short cylinder with spherical caps). A finite plug has no symmetry that makes $|\vb E|$ constant on a Gaussian surface, so Gauss's law can't give its field. The Gauss-solvable exam version is the infinite cylinder of $-\rho$. For a thin hole the two agree closely: near the center of the axis the stubs change the field by about $1.5\%$ for $a = R/10$, but by about $13\%$ for $a = 0.3R$, and more toward the poles.
      `, { reg: { svg: fSphCyl({ pts: [[0, 0.5, 'I', { lx: 300, ly: 40 }], [-0.62, -0.3, 'II', { lx: 40, ly: 290 }], [0, 1.25, 'III', { lx: 60, ly: 20, anchor: 'r' }], [1.3, 0.5, 'IV', 'r']] }), cap: md`Ball pierced by an infinite cylinder: blue = $+\rho$, red = $-\rho$. Uncoloured: the hole (net zero). Red: the stubs of the cylinder outside the ball (net $-\rho$). Sample points in regions I–IV.` } }),

      Q(md`Sphere ($+\rho$) pierced by a $-\rho$ cylinder along $z$. At a point on the axis inside the hole, at height $z$, the field is`,
        [md`$\dfrac{\rho z}{3\ep}\uv z$`, md`$0$, since the net density in the hole is zero`, md`$\dfrac{\rho z}{3\ep}\uv z - \dfrac{\rho a}{2\ep}\uv z$`, md`$-\dfrac{\rho z}{6\ep}\uv z$`], 0,
        [null,
          md`Zero density at a point doesn't mean zero field.`,
          md`The cylinder gives no axial field at all, and nothing on its axis.`,
          md`That would be the cylinder-with-spherical-cavity result, a different configuration.`],
        md`On the axis $\vb s = 0$, so only the ball acts: $\dfrac{\rho}{3\ep}z\,\uv z$, as if the hole weren't there.`,
        { figHtml: fSphCyl({ pts: [[0, 0.5, 'P', { lx: 300, ly: 40 }]] }) }),

      Q(md`Same configuration. A point on the $z$-axis at $z = 1.5R$ (inside a red stub). Which formulas do you use?`,
        [md`Ball inside, cylinder inside`, md`Ball outside, cylinder outside`, md`Ball outside, cylinder inside`, md`Ball inside, cylinder outside`], 2,
        [md`$r = 1.5R>R$: outside the ball.`,
          md`$s = 0<a$: inside the cylinder.`,
          null,
          md`Backwards: $r = 1.5R$ is outside the ball, and $s = 0$ is inside the cylinder.`],
        md`Ball: $r>R$, point-charge formula. Cylinder: $s = 0<a$, inside formula, which gives $0$ on the axis. So $\vb E = \dfrac{\rho R^3}{3\ep(1.5R)^2}\uv z = \dfrac{4\rho R}{27\ep}\uv z$.`,
        { figHtml: fSphCyl({ pts: [[0, 1.5, 'P', 'l']] }) }),

      Q(md`Same configuration. Very far away in the equatorial plane ($s\to\infty$, $z = 0$), which way does $\vb E$ point?`,
        [md`Outward, because the ball is positive`, md`It is zero, since the total charge is zero`, md`Along $\uv z$`, md`Inward, because the cylinder's $1/s$ field beats the ball's $1/s^2$`], 3,
        [md`The ball's field falls like $1/s^2$; the infinite cylinder's like $1/s$.`,
          md`The total charge is infinite and negative: the cylinder never ends.`,
          md`By symmetry ($z\to-z$) there is no $z$-component in the equatorial plane.`,
          null],
        md`$E_s = \dfrac{\rho R^3}{3\ep s^2} - \dfrac{\rho a^2}{2\ep s}$. For large $s$ the second term dominates: the field points toward the negative cylinder.`,
        { figHtml: fSphCyl({ pts: [[1.4, 0, 'P', 'tr']] }) }),

      Q(md`At a point in the hole but **off** the axis, the net density is zero. The field there is`,
        [md`zero`, md`$\dfrac{\rho}{3\ep}\vb r - \dfrac{\rho}{2\ep}\vb s$, not zero in general`, md`$\dfrac{\rho}{3\ep}\vb r$ only`, md`$-\dfrac{\rho}{2\ep}\vb s$ only`], 1,
        [md`Zero density doesn't mean zero field.`,
          null,
          md`Off the axis the cylinder contributes $-\dfrac{\rho}{2\ep}\vb s$.`,
          md`The ball's field doesn't switch off in its own hole.`],
        md`Both pieces contain the point, so both inside formulas apply. In components: $\vb E = \dfrac{\rho}{6\ep}\left(-x,\,-y,\,2z\right)$. Sideways it points toward the axis, along $z$ away from the center. $\divg\vb E = 0$ ✓.`,
        { figHtml: fSphCyl({ pts: [[0.15, 0.4, 'P', { lx: 300, ly: 40 }]] }) }),

      Q(md`Why can't you get the field of the pierced sphere by drawing one Gaussian surface around the whole thing?`,
        [md`Gauss's law doesn't hold for composite objects`, md`The flux would be infinite`, md`The combined charge has no symmetry that makes $|\vb E|$ constant on any closed surface, so the flux integral can't be turned into $E\times$area`, md`Because the total charge is zero`], 2,
        [md`Gauss's law always holds. It just isn't always useful.`,
          md`The flux through a finite surface is finite; it equals the enclosed charge over $\ep$.`,
          null,
          md`The total isn't zero, and zero charge wouldn't block the method anyway.`],
        md`Gauss's law is a tool for $\vb E$ only with sphere, cylinder or plane symmetry. The combination has neither; the pieces each have one. That is why you split first and add fields.`,
        { figHtml: fSphCyl() }),

      Q(md`A ball has a hole drilled along a diameter, and **nothing** sticks out (a truly finite hole). Can you find the field on the axis with Gauss's law alone?`,
        [md`Yes, the infinite-cylinder formula is exact on the axis`, md`Yes, use a Gaussian cylinder that fits the hole`, md`No: the removed plug is finite and Gauss can't give its field; the infinite-cylinder version is only an approximation, good for thin holes`, md`No, because the field on the axis is zero`], 2,
        [md`The infinite version includes the two stubs of $-\rho$ outside the ball; the real drilled ball doesn't have them, and they push on the axis.`,
          md`The flux through such a cylinder isn't $E\times$area: $E$ varies over its caps and side.`,
          null,
          md`On the axis the ball's own field $\dfrac{\rho z}{3\ep}$ is still there.`],
        md`The plug is a short cylinder with caps: no Gaussian surface makes its field constant. The infinite version differs from it by the two stubs. For a hole of radius $a\ll R$ their effect is of order $(a/R)^2$.`,
        { figHtml: fSphCyl() }),

      P({
        title: 'A sphere pierced by a cylinder: four points',
        q: md`
          A ball of radius $R$ and density $+\rho$, and an infinite cylinder of radius $a<R$ and density $-\rho$ along the $z$-axis through the ball's center.

          Find $E_z$ at (i) a point on the axis inside the ball at height $z$; $E_s$ at (ii) a point in the equatorial plane with $a<s<R$ and (iii) with $s>R$; and $E_z$ at (iv) a point on the axis with $z>R$.
        `,
        figHtml: fSphCyl({ pts: [[0, 0.5, '(i)', { lx: 300, ly: 40 }], [0.65, 0, '(ii)', { lx: 300, ly: 260 }], [1.35, 0, '(iii)', 'tr'], [0, 1.3, '(iv)', { lx: 60, ly: 20, anchor: 'r' }]] }),
        hints: [
          md`Decide for each piece separately: ball inside/outside, cylinder inside/outside.`,
          md`On the axis the cylinder contributes $0$.`,
          md`In the equatorial plane $\vb r = \vb s$, so both fields are along $\uv s$.`,
        ],
        parts: [
          { lbl: md`(i) $E_z$`, expr: 'rho*z/(3*eps0)', vars: { rho: [0.5, 3], z: [0.2, 1], eps0: [0.5, 2] } },
          { lbl: md`(ii) $E_s$`, expr: 'rho*s/(3*eps0) - rho*a^2/(2*eps0*s)', vars: { rho: [0.5, 3], s: [0.5, 1], a: [0.1, 0.4], eps0: [0.5, 2] }, accepts: ['rho*(2*s^2-3*a^2)/(6*eps0*s)'] },
          { lbl: md`(iii) $E_s$`, expr: 'rho*R^3/(3*eps0*s^2) - rho*a^2/(2*eps0*s)', vars: { rho: [0.5, 3], R: [1, 2], s: [2.1, 4], a: [0.1, 0.9], eps0: [0.5, 2] }, accepts: ['rho*(2*R^3-3*a^2*s)/(6*eps0*s^2)'] },
          { lbl: md`(iv) $E_z$`, expr: 'rho*R^3/(3*eps0*z^2)', vars: { rho: [0.5, 3], R: [0.5, 1], z: [1.1, 3], eps0: [0.5, 2] } },
        ],
        sol: md`
          | Point | ball | cylinder | field |
          |---|---|---|---|
          | (i) axis, $z<R$ | inside: $\dfrac{\rho z}{3\ep}\uv z$ | inside, $\vb s=0$: $0$ | $\dfrac{\rho z}{3\ep}\uv z$ |
          | (ii) equator, $a<s<R$ | inside: $\dfrac{\rho s}{3\ep}\uv s$ | outside: $-\dfrac{\rho a^2}{2\ep s}\uv s$ | $\dfrac{\rho(2s^2-3a^2)}{6\ep s}\uv s$ |
          | (iii) equator, $s>R$ | outside: $\dfrac{\rho R^3}{3\ep s^2}\uv s$ | outside: $-\dfrac{\rho a^2}{2\ep s}\uv s$ | $\dfrac{\rho(2R^3-3a^2s)}{6\ep s^2}\uv s$ |
          | (iv) axis, $z>R$ | outside: $\dfrac{\rho R^3}{3\ep z^2}\uv z$ | inside, $\vb s=0$: $0$ | $\dfrac{\rho R^3}{3\ep z^2}\uv z$ |

          **Checks.** At $s = R$, (ii) and (iii) agree: $\dfrac{\rho R}{3\ep} - \dfrac{\rho a^2}{2\ep R}$ ✓ (no surface charge). At $z = R$, (i) and (iv) agree ✓. With $a\to0$ everything reduces to the plain ball ✓.
        `,
      }),

      P({
        title: 'Where the field vanishes on the equator',
        q: md`
          Same configuration (ball $+\rho$, radius $R$; infinite cylinder $-\rho$, radius $a$, along $z$), with $a<R\sqrt{2/3}$.

          In the equatorial plane, find the radius $s_1$ (between $a$ and $R$) and the radius $s_2$ (beyond $R$) where $\vb E = 0$.
        `,
        figHtml: fSphCyl(),
        hints: [
          md`Use the region (ii) and (iii) results from the previous problem.`,
          md`Set each to zero and solve for $s$.`,
        ],
        parts: [
          { lbl: 's_1', expr: 'a*sqrt(3/2)', vars: { a: [0.2, 2] }, accepts: ['sqrt(3)*a/sqrt(2)'] },
          { lbl: 's_2', expr: '2*R^3/(3*a^2)', vars: { R: [1, 2], a: [0.3, 0.8] } },
        ],
        sol: md`
          **Inside the ball** ($a<s<R$): $E_s = \dfrac{\rho(2s^2-3a^2)}{6\ep s} = 0\Rightarrow s_1 = a\sqrt{3/2}$. This is less than $R$ when $a<R\sqrt{2/3}$.

          **Outside** ($s>R$): $E_s = \dfrac{\rho(2R^3-3a^2s)}{6\ep s^2} = 0\Rightarrow s_2 = \dfrac{2R^3}{3a^2}$, which is beyond $R$ for the same condition.

          **Picture.** Just outside the hole the negative cylinder wins (inward field); deeper into the ball the ball's growing field wins (outward); far away the infinite cylinder wins again (inward). Two sign changes, two zeros.
        `,
      }),

      P({
        title: 'Potential differences in the pierced sphere',
        q: md`
          Same configuration. Find $V(\text{center}) - V(\text{top of the ball, } z = R \text{ on the axis})$, and $V(\text{center}) - V(\text{equator point at } s = R)$.
        `,
        figHtml: fSphCyl({ pts: [[0, 1, 'T', 'tl'], [1, 0, 'Q', 'r']] }),
        hints: [
          md`$V(A) - V(B) = \displaystyle\int_A^B\vb E\cdot d\vb l$. Pick straight paths along the axis and along the equator.`,
          md`Along the axis, $E_z = \dfrac{\rho z}{3\ep}$.`,
          md`Along the equator, split at $s = a$: $E_s = -\dfrac{\rho s}{6\ep}$ in the hole and $\dfrac{\rho s}{3\ep} - \dfrac{\rho a^2}{2\ep s}$ beyond.`,
        ],
        parts: [
          { lbl: md`$V(0) - V(T)$`, expr: 'rho*R^2/(6*eps0)', vars: { rho: [0.5, 3], R: [0.5, 2], eps0: [0.5, 2] } },
          { lbl: md`$V(0) - V(Q)$`, expr: 'rho*(2*R^2 - 3*a^2 - 6*a^2*ln(R/a))/(12*eps0)', vars: { rho: [0.5, 3], R: [1, 2], a: [0.2, 0.8], eps0: [0.5, 2] } },
        ],
        sol: md`
          **Axis.** $V(0) - V(T) = \displaystyle\int_0^R\frac{\rho z}{3\ep}dz = \frac{\rho R^2}{6\ep}$.

          **Equator.** In the hole ($s<a$): $E_s = \dfrac{\rho s}{3\ep}-\dfrac{\rho s}{2\ep} = -\dfrac{\rho s}{6\ep}$. Beyond: $\dfrac{\rho s}{3\ep}-\dfrac{\rho a^2}{2\ep s}$.

          $$V(0)-V(Q) = \int_0^a-\frac{\rho s}{6\ep}ds + \int_a^R\left(\frac{\rho s}{3\ep}-\frac{\rho a^2}{2\ep s}\right)ds = -\frac{\rho a^2}{12\ep} + \frac{\rho(R^2-a^2)}{6\ep} - \frac{\rho a^2}{2\ep}\ln\frac Ra.$$

          $$= \frac{\rho}{12\ep}\left(2R^2 - 3a^2 - 6a^2\ln\frac Ra\right).$$

          **Check.** $a\to0$: both become $\dfrac{\rho R^2}{6\ep}$, the plain ball ✓. The ball's surface is **not** an equipotential here: the negative cylinder **raises** the equator relative to the poles ($V(Q)>V(T)$), because the equator is farther from the negative charge on the axis.

          **Why integrate piece by piece.** The infinite cylinder's own potential can't be referenced at infinity, but differences are fine. Integrating $\vb E$ along a path avoids the problem entirely.
        `,
      }),

      RF(md`
        ### Line charges through balls

        A line charge along a diameter is a cylinder with zero radius. Two versions:

        - **Infinite line** through the ball: $\dfrac{\lambda}{2\pi\ep s}\uv s$, Gauss-exact.
        - **Finite segment** (just the diameter, length $2R$): not Gauss-solvable. In the **mid-plane** use the finite-segment result: a segment of half-length $L$, at distance $s$ on its bisector, gives $E = \dfrac{1}{4\pi\ep}\dfrac{2\lambda L}{s\sqrt{s^2+L^2}}$, perpendicular to the segment.

        Then add the ball's field. In the equatorial plane both point along $\uv s$.

        **Example.** Infinite line $\lambda$ through a ball: $E_s = \dfrac{\rho s}{3\ep} + \dfrac{\lambda}{2\pi\ep s}$ inside. With $\lambda<0$ it vanishes at $s^2 = -\dfrac{3\lambda}{2\pi\rho}$.
      `),

      Q(md`A line charge $\lambda$ lies along a diameter of a ball, **only** inside the ball (length $2R$). At a point in the equatorial plane at distance $s$, why can't you use $\dfrac{\lambda}{2\pi\ep s}$?`,
        [md`You can; it is exact in the mid-plane`, md`Because the ball screens the line`, md`Because the formula is for $s>R$ only`, md`It is the field of an **infinite** line; a finite segment gives $\dfrac{1}{4\pi\ep}\dfrac{2\lambda R}{s\sqrt{s^2+R^2}}$`], 3,
        [md`Only in the limit $s\ll R$ does the segment look infinite.`,
          md`Charges don't screen each other's fields in vacuum; fields just add.`,
          md`The infinite-line formula holds at any $s$, for an infinite line.`,
          null],
        md`Gauss needs the infinite line. For the finite diameter use the finite-segment result with $L = R$. For $s\ll R$ it reduces to $\dfrac{\lambda}{2\pi\ep s}$; for $s\gg R$ to $\dfrac{2\lambda R}{4\pi\ep s^2}$, a point charge.`,
        { figHtml: fBallLine() }),

      Q(md`A ball (radius $R$, density $\rho$) with a line charge $\lambda$ along a diameter of length $2R$. What $\lambda$ makes the whole object neutral?`,
        [md`$-\dfrac{2}{3}\pi R^2\rho$`, md`$-\dfrac43\pi R^3\rho$`, md`$-\dfrac{4}{3}\pi R^2\rho$`, md`$-\dfrac{\rho R^2}{2}$`], 0,
        [null,
          md`That is a charge, not a charge per length. Divide by the length $2R$.`,
          md`Forgot to divide by 2: the diameter is $2R$ long.`,
          md`Missing the $\tfrac43\pi$ of the ball's volume: $\lambda = -\dfrac{\frac43\pi R^3\rho}{2R}$.`],
        md`$\lambda\cdot2R + \tfrac43\pi R^3\rho = 0\Rightarrow\lambda = -\tfrac23\pi R^2\rho$.`,
        { figHtml: fBallLine() }),

      Q(md`An **infinite** line $\lambda$ passes through the center of a ball. Inside the ball, in the equatorial plane at distance $s$, the field is`,
        [md`$\dfrac{\rho s}{3\ep}\uv s$`, md`$\left(\dfrac{\rho s}{3\ep} + \dfrac{\lambda}{2\pi\ep s}\right)\uv s$`, md`$\left(\dfrac{\rho s}{2\ep} + \dfrac{\lambda}{2\pi\ep s}\right)\uv s$`, md`$\dfrac{\rho R^3}{3\ep s^2}\uv s + \dfrac{\lambda}{2\pi\ep s}\uv s$`], 1,
        [md`The line's field is there too.`,
          null,
          md`The ball's coefficient is $\tfrac13$; $\tfrac12$ is for a cylinder.`,
          md`Inside the ball, use the inside formula.`],
        md`In the equatorial plane $\vb r = \vb s$, so both fields are along $\uv s$ and add as numbers.`,
        { figHtml: fBallLine({ inf: true, pts: [[0.5, 'P', true]] }) }),

      P({
        title: 'A ball with a charged diameter',
        q: md`
          A ball (radius $R$, density $\rho$) has a line charge $\lambda$ along one diameter (length $2R$, ending at the surface).

          (a) Find $E_s$ in the equatorial plane at $s = R/2$. (b) Find $\lambda$ such that $\vb E = 0$ on the equator of the ball's surface ($s = R$, $z = 0$).
        `,
        figHtml: fBallLine({ pts: [[0.5, 'P', true], [1, 'Q', false]] }),
        hints: [
          md`Ball: $\dfrac{\rho s}{3\ep}$ inside (and at the surface).`,
          md`Segment of half-length $L = R$ at distance $s$ on its bisector: $\dfrac{2\lambda L}{4\pi\ep s\sqrt{s^2+L^2}}$.`,
        ],
        parts: [
          { lbl: md`(a) $E_s(R/2)$`, expr: 'rho*R/(6*eps0) + 2*lambda/(sqrt(5)*pi*eps0*R)', vars: { rho: [0.5, 3], R: [0.5, 2], lambda: [0.5, 3], eps0: [0.5, 2] }, accepts: ['rho*R/(6*eps0) + 2*sqrt(5)*lambda/(5*pi*eps0*R)'] },
          { lbl: md`(b) $\lambda$`, expr: '-2*sqrt(2)*pi*rho*R^2/3', vars: { rho: [0.5, 3], R: [0.5, 2] } },
        ],
        sol: md`
          **(a)** Ball: $\dfrac{\rho}{3\ep}\cdot\dfrac R2 = \dfrac{\rho R}{6\ep}$. Segment with $L = R$, $s = R/2$: $\sqrt{s^2+L^2} = \dfrac{\sqrt5}{2}R$, so

          $$E_{\text{seg}} = \frac{2\lambda R}{4\pi\ep\cdot\frac R2\cdot\frac{\sqrt5}{2}R} = \frac{2\lambda}{\sqrt5\,\pi\ep R}.$$

          Total $E_s = \dfrac{\rho R}{6\ep} + \dfrac{2\lambda}{\sqrt5\,\pi\ep R}$.

          **(b)** At $s = R$: $\dfrac{\rho R}{3\ep} + \dfrac{2\lambda R}{4\pi\ep R\cdot\sqrt2R} = \dfrac{\rho R}{3\ep} + \dfrac{\lambda}{2\sqrt2\,\pi\ep R} = 0\Rightarrow\lambda = -\dfrac{2\sqrt2\,\pi\rho R^2}{3}.$

          **Compare.** An infinite line would need $\lambda = -\dfrac{2\pi\rho R^2}{3}$ ($\dfrac{\rho R}{3\ep} + \dfrac{\lambda}{2\pi\ep R} = 0$). The finite diameter is weaker at the equator (its ends are far away), so it needs $\sqrt2$ times more.
        `,
      }),

      RF(md`
        ### Pieces centered at different points

        When the pieces don't share a center, write each field as a vector in one coordinate system and add components.

        **Worked example.** An infinite cylinder (radius $a$, density $\rho$, axis $z$) and a separate ball (radius $a$, density $\rho$) centered at $(3a,0,0)$. Find $\vb E$ at $P = (3a,0,2a)$, directly above the ball.

        [[fig:sep]]

        - Ball: $P$ is outside (distance $2a$), straight up: $\dfrac{\rho a^3}{3\ep(2a)^2}\uv z = \dfrac{\rho a}{12\ep}\uv z$.
        - Cylinder: $P$ is at $s = 3a$, outside, with $\vb s = (3a,0,0)$: $\dfrac{\rho a^2}{2\ep\cdot3a}\uv x = \dfrac{\rho a}{6\ep}\uv x$.

        $$\vb E(P) = \frac{\rho a}{\ep}\left(\frac16,\;0,\;\frac1{12}\right),\qquad|\vb E| = \frac{\sqrt5\,\rho a}{12\ep},$$

        at $\arctan\tfrac12\approx26.6^\circ$ above the $x$-axis.
      `, { sep: { svg: fSep(), cap: md`A cylinder of radius $a$ along $z$ and a ball of radius $a$ centered $3a$ away (blue = $+\rho$); $P$ is $2a$ above the ball's center.` } }),

      Q(md`In the worked example, which way does each piece push a positive test charge at $P$?`,
        [md`Ball: straight up; cylinder: along $+x$, away from the cylinder's axis`, md`Both straight up`, md`Ball: toward the cylinder; cylinder: up`, md`Ball: along $+x$; cylinder: along $+z$`], 0,
        [null,
          md`The cylinder's field is perpendicular to its axis, so it has no $z$-part.`,
          md`The ball's field is radial from the ball's own center, which is directly below $P$.`,
          md`Swapped: the ball's center is directly below $P$, so its field is along $z$; the cylinder's field is perpendicular to its axis, so along $x$.`],
        md`Each piece's field is radial from its own center (ball) or axis (cylinder). $P$ is directly above the ball's center and $3a$ out from the cylinder's axis.`,
        { figHtml: fSep() }),

      Q(md`A ball ($+\rho$, radius $R$, center $O$) overlaps an infinite cylinder ($-\rho$, radius $a$) whose axis is parallel to $z$ and a distance $d$ from $O$ (with $d<a$, $d+a<R$). Compare $\vb E$ at $O$ and at the point of the cylinder's axis level with $O$.`,
        [md`Both equal $\dfrac{\rho}{3\ep}\vb d$: the field is uniform in the overlap`, md`At $O$: $\dfrac{\rho d}{2\ep}\uv x$; on the axis: $\dfrac{\rho d}{3\ep}\uv x$`, md`Both zero`, md`At $O$: $0$; on the axis: $\dfrac{\rho d}{3\ep}\uv x$`], 1,
        [md`A ball and a cylinder never give a uniform overlap field.`,
          null,
          md`Each point gets a contribution from one of the pieces.`,
          md`At $O$ the ball gives $0$ but the cylinder gives $-\dfrac{\rho}{2\ep}(-d,0,0)$.`],
        md`At $O$: the ball gives $0$ (its own center); the cylinder gives $-\dfrac{\rho}{2\ep}\vb s$ with $\vb s = (-d,0,0)$: $+\dfrac{\rho d}{2\ep}\uv x$. On the axis: the cylinder gives $0$; the ball gives $\dfrac{\rho}{3\ep}(d,0,0)$. Different values: not uniform.`,
        { figHtml: fOffCyl() }),

      Q(md`Two infinite cylinders cross at right angles: $+\rho$ along $z$, $-\rho$ along $y$, same radius. In the overlap region, $\vb E$ is`,
        [md`$0$`, md`uniform`, md`$\dfrac{\rho}{2\ep}(0,\,y,\,-z)$`, md`$\dfrac{\rho}{2\ep}(x,\,y,\,z)$`], 2,
        [md`The net density is zero, but the field isn't.`,
          md`The two cylinders point different ways, so the linear terms don't cancel.`,
          null,
          md`Sign and components: the $-\rho$ cylinder along $y$ gives $-\dfrac{\rho}{2\ep}(x,0,z)$.`],
        md`$\dfrac{\rho}{2\ep}(x,y,0) - \dfrac{\rho}{2\ep}(x,0,z) = \dfrac{\rho}{2\ep}(0,y,-z)$. The $x$ parts cancel (both cylinders give the same $x$-part); the $y$ and $z$ parts don't. $\divg\vb E = \dfrac{\rho}{2\ep}(1-1) = 0$ ✓.`,
        { figHtml: fCross() }),

      P({
        title: 'A cylinder and a ball, apart',
        q: md`
          An infinite cylinder of radius $a$ and density $\rho$ lies along the $z$-axis. A ball of radius $2a$ and the same density is centered at $(4a,0,0)$. Find $E_x$ and $E_z$ at $P = (4a,0,3a)$.
        `,
        figHtml: fSep({ D: 4, Rb: 2, h: 3, Dl: '4a', hl: '3a', u: 22, Rl: '2a' }),
        hints: [
          md`Is $P$ inside or outside the ball? Its distance from the ball's center is $3a$.`,
          md`The cylinder's field at $s = 4a$ is along $\uv x$.`,
        ],
        parts: [
          { lbl: 'E_x', expr: 'rho*a/(8*eps0)', vars: { rho: [0.5, 3], a: [0.5, 2], eps0: [0.5, 2] } },
          { lbl: 'E_z', expr: '8*rho*a/(27*eps0)', vars: { rho: [0.5, 3], a: [0.5, 2], eps0: [0.5, 2] } },
        ],
        sol: md`
          **Ball.** $P$ is $3a$ above its center, outside ($3a>2a$): charge $Q = \rho\cdot\tfrac43\pi(2a)^3$, so $E_z = \dfrac{\rho(2a)^3}{3\ep(3a)^2} = \dfrac{8\rho a}{27\ep}$.

          **Cylinder.** $s = 4a>a$: $E_x = \dfrac{\rho a^2}{2\ep\cdot4a} = \dfrac{\rho a}{8\ep}$.

          $\vb E = \dfrac{\rho a}{\ep}\left(\dfrac18,\,0,\,\dfrac{8}{27}\right)$.
        `,
      }),

      P({
        title: 'A ball and an off-center negative cylinder',
        q: md`
          A ball (radius $R$, density $+\rho$, center $O$ at the origin) and an infinite cylinder (radius $a$, density $-\rho$) whose axis is parallel to $z$ through $(d,0,0)$, with $d<a$ and $d+a<R$.

          Find $E_x$ at the origin, and $E_x$ and $E_z$ at the point $(d,0,h)$ on the cylinder's axis (with $h$ small enough that the point is inside the ball).
        `,
        figHtml: fOffCyl({ pts: [[0.22, 0.35, 'P', 'r']] }),
        hints: [
          md`In the overlap: $\vb E = \dfrac{\rho}{3\ep}(x,y,z) - \dfrac{\rho}{2\ep}(x-d,\,y,\,0)$.`,
          md`On the cylinder's axis its own contribution is zero.`,
        ],
        parts: [
          { lbl: md`$E_x$ at $O$`, expr: 'rho*d/(2*eps0)', vars: { rho: [0.5, 3], d: [0.1, 1], eps0: [0.5, 2] } },
          { lbl: md`$E_x$ at $(d,0,h)$`, expr: 'rho*d/(3*eps0)', vars: { rho: [0.5, 3], d: [0.1, 1], eps0: [0.5, 2] } },
          { lbl: md`$E_z$ at $(d,0,h)$`, expr: 'rho*h/(3*eps0)', vars: { rho: [0.5, 3], h: [0.1, 1], eps0: [0.5, 2] } },
        ],
        sol: md`
          **Overlap field.** $\vb E = \dfrac{\rho}{3\ep}(x,y,z) - \dfrac{\rho}{2\ep}(x-d,y,0) = \dfrac{\rho}{6\ep}\left(3d - x,\;-y,\;2z\right)$.

          **At $O$:** $\dfrac{\rho}{6\ep}(3d,0,0) = \dfrac{\rho d}{2\ep}\uv x$.

          **At $(d,0,h)$:** $\dfrac{\rho}{6\ep}(2d,0,2h) = \dfrac{\rho}{3\ep}(d,0,h)$. On the cylinder's axis only the ball acts, so it is just $\dfrac{\rho}{3\ep}\vb r$ ✓.

          **What to remember.** Points on a cylinder's axis or at a ball's center are where that piece drops out. Use them as quick checks.
        `,
      }),

      P({
        title: 'Pierced sphere: a point off both axes',
        q: md`
          Ball (radius $R$, $+\rho$) pierced by an infinite cylinder (radius $a = R/2$, $-\rho$) along $z$. Find $E_x$ and $E_z$ at the point $(2R, 0, 2R)$, in units of $\rho R/\ep$.
        `,
        figHtml: fSphCyl({ ap: 45, pts: [[2, 2, 'P', 'r']] }),
        hints: [
          md`$r = 2\sqrt2R>R$ and $s = 2R>a$: both outside formulas.`,
          md`Ball: $\dfrac{\rho R^3}{3\ep}\dfrac{\vb r}{r^3}$ with $\vb r = (2R,0,2R)$. Cylinder: $-\dfrac{\rho a^2}{2\ep}\dfrac{\vb s}{s^2}$ with $\vb s = (2R,0,0)$.`,
        ],
        parts: [
          { lbl: md`$E_x$ (units $\rho R/\ep$)`, ans: -0.03304, unit: '' },
          { lbl: md`$E_z$ (units $\rho R/\ep$)`, ans: 0.02946, unit: '' },
        ],
        sol: md`
          **Ball.** $r^3 = (2\sqrt2R)^3 = 16\sqrt2R^3$. $\dfrac{\rho R^3}{3\ep}\cdot\dfrac{(2R,0,2R)}{16\sqrt2R^3} = \dfrac{\rho R}{24\sqrt2\,\ep}(1,0,1)$, and $\dfrac{1}{24\sqrt2}\approx0.02946$.

          **Cylinder.** $-\dfrac{\rho(R/2)^2}{2\ep}\cdot\dfrac{1}{2R}\uv x = -\dfrac{\rho R}{16\ep}\uv x$.

          $E_x = \dfrac{\rho R}{\ep}\left(\dfrac{1}{24\sqrt2}-\dfrac1{16}\right) = \dfrac{\sqrt2-3}{48}\dfrac{\rho R}{\ep}\approx-0.0330\dfrac{\rho R}{\ep}$; $E_z = \dfrac{\sqrt2}{48}\dfrac{\rho R}{\ep}\approx0.0295\dfrac{\rho R}{\ep}$.

          The field tilts back toward the negative cylinder.
        `,
      }),

      RF(md`
        ### Exam-style mixed set

        Always: (1) list the pieces with their densities, centers and axes; (2) for the point in question, decide inside/outside for each piece; (3) write each field as a vector from its own center or axis; (4) add components; (5) check with a point where a piece drops out, or with $\divg\vb E$.
      `),

      Q(md`A configuration is "a ball of $+\rho$ with a cylindrical hole of radius $a$ along a diameter, plus an infinite cylinder of $-\rho$ sticking out". Which superposition represents it?`,
        [md`Ball $+\rho$ and a finite plug of $-\rho$`, md`Ball $-\rho$ and an infinite cylinder of $+\rho$`, md`Ball $+\rho$ and an infinite cylinder of $-2\rho$`, md`Ball $+\rho$ and an infinite cylinder of $-\rho$`], 3,
        [md`That gives the hole but no stubs sticking out.`,
          md`Signs reversed.`,
          md`Then the hole would have net $-\rho$, not zero.`,
          null],
        md`Inside the ball: $+\rho - \rho = 0$ (the hole). Outside: $-\rho$ (the stubs). Each piece is Gauss-friendly.`,
        { figHtml: fSphCyl() }),

      Q(md`In the cylinder with a spherical cavity, the potential difference between the cavity's center and its top is $-\dfrac{\rho b^2}{6\ep}$, and between the center and its side is $+\dfrac{\rho b^2}{12\ep}$. What does that tell you?`,
        [md`There is an arithmetic error: the cavity wall must be an equipotential`, md`The field is zero in the cavity`, md`The cavity wall is not an equipotential; the top is at higher potential than the center, the side lower`, md`$V$ is constant inside the cavity`], 2,
        [md`Only a conductor's surface must be an equipotential. This is an empty hole in a charged insulator.`,
          md`Zero field means $V$ doesn't change from point to point, but these two differences are nonzero.`,
          null,
          md`Constant $V$ would make both differences zero; here they are $-\dfrac{\rho b^2}{6\ep}$ and $+\dfrac{\rho b^2}{12\ep}$.`],
        md`$V(0)-V(\text{top}) = -\dfrac{\rho b^2}{6\ep}<0$: the top is higher. $V(0)-V(\text{side}) = +\dfrac{\rho b^2}{12\ep}>0$: the side is lower. Field points from high to low: toward the center along $z$, outward sideways ✓.`,
        { figHtml: fCylCav({ noB: true, pts: [[0, 1, 'T', 'br'], [1, 0, 'S', 'l']] }) }),

      Q(md`For an infinite charged cylinder you want $V$ at a point. What reference point can you use?`,
        [md`$V(\infty) = 0$, as always`, md`$V = 0$ at the surface is required by Gauss's law`, md`None: $V$ is undefined for infinite charge`, md`Any finite point, e.g. $V = 0$ on the axis or at $s = a$; only differences matter`], 3,
        [md`The cylinder's potential grows like $\ln s$; it diverges at infinity.`,
          md`Gauss's law says nothing about where $V = 0$; any choice works.`,
          md`$V$ is defined up to a constant; you just can't put the zero at infinity.`,
          null],
        md`Infinite charge distributions need a finite reference point. Exam questions usually ask for potential **differences**, which avoid the issue.`,
        { figHtml: fBlocks().svg }),

      Q(md`Units check: which expression could be an electric field?`,
        [md`$\dfrac{\rho d}{3\ep}$`, md`$\dfrac{\rho d^2}{3\ep}$`, md`$\dfrac{\rho}{3\ep d}$`, md`$\dfrac{\rho d^3}{3\ep}$`], 0,
        [null,
          md`$\rho d^2/\ep$ is a potential (volts).`,
          md`$\rho/(\ep d)$ has units of V/m³.`,
          md`$\rho d^3$ is a charge; over $\ep$ it is V·m.`],
        md`$\rho/\ep$ has units (C/m³)/(C/(V·m)) = V/m². Times one length: V/m. Fields in these problems always look like $\dfrac{\rho\times\text{length}}{\ep}$; potentials like $\dfrac{\rho\times\text{length}^2}{\ep}$.`,
        { nofig: 'units only' }),

      Q(md`Ball of $+\rho$ (radius $R$) and a ball of $-2\rho$ (radius $b$) inside it, centered at $\vb d$ from the big center. In the small ball, $\vb E$ is`,
        [md`$\dfrac{\rho}{3\ep}\vb d$, uniform`, md`$\dfrac{2\rho}{3\ep}\vb d$`, md`$\dfrac{\rho}{3\ep}\left(2\vb d - \vb r\right)$, with $\vb r$ from the big center`, md`$0$`], 2,
        [md`That needs equal and opposite densities.`,
          md`The $\vb r$ terms don't cancel when the densities differ.`,
          null,
          md`The net density there is $-\rho$, and the field is not zero.`],
        md`$\dfrac{\rho}{3\ep}\vb r - \dfrac{2\rho}{3\ep}(\vb r - \vb d) = \dfrac{\rho}{3\ep}(2\vb d - \vb r)$. Check: $\divg\vb E = -\dfrac{\rho}{\ep}$, matching the net density $-\rho$ ✓.`,
        { figHtml: fBallCav({ inner: true }) }),

      Q(md`Ball of $+\rho$ pierced along $z$ by a $-\rho$ cylinder. Very far up the $z$-axis, how does the field behave?`,
        [md`Like $\dfrac{\rho R^3}{3\ep z^2}$, pointing up`, md`Like $\dfrac{\rho a^2}{2\ep z}$`, md`It points down, toward the ball`, md`It is zero`], 0,
        [null,
          md`That is the cylinder's field off its axis. On its axis the cylinder gives nothing.`,
          md`On the axis only the positive ball acts.`,
          md`The ball's field is still there.`],
        md`On the axis the cylinder drops out at every height. So the ball alone: $\dfrac{\rho R^3}{3\ep z^2}\uv z$.`,
        { figHtml: fSphCyl({ pts: [[0, 1.3, 'P', 'l']] }) }),

      P({
        title: 'Exam-style: refilling a cavity with a point charge',
        q: md`
          An infinite cylinder (radius $2a$, density $\rho$, axis $z$) has an empty spherical cavity of radius $a$ centered on the axis. A point charge $q$ is placed at the cavity's center.

          (a) Find $q$ such that $\vb E = 0$ at the top of the cavity, $(0,0,a)$. (b) With that $q$, find $E_s$ at the side of the cavity, $s = a$, $z = 0$.
        `,
        figHtml: fCylCav({ q: true, aLab: '2a', bLab: 'a', noB: true, pts: [[0, 1, 'T', 'br'], [1, 0, 'S', 'l']] }),
        hints: [
          md`Field in the empty cavity: $\dfrac{\rho}{6\ep}(x,y,-2z)$. Add $\dfrac{q}{4\pi\ep r^2}\uv r$.`,
          md`At the top, the cavity field is $-\dfrac{\rho a}{3\ep}\uv z$.`,
        ],
        parts: [
          { lbl: md`(a) $q$`, expr: '4*pi*rho*a^3/3', vars: { rho: [0.5, 3], a: [0.5, 2] } },
          { lbl: md`(b) $E_s$`, expr: 'rho*a/(2*eps0)', vars: { rho: [0.5, 3], a: [0.5, 2], eps0: [0.5, 2] } },
        ],
        sol: md`
          **(a)** At $(0,0,a)$: $-\dfrac{\rho a}{3\ep} + \dfrac{q}{4\pi\ep a^2} = 0\Rightarrow q = \dfrac43\pi a^3\rho$: exactly the charge the cavity is missing.

          **(b)** At $s = a$: $\dfrac{\rho a}{6\ep} + \dfrac{q}{4\pi\ep a^2} = \dfrac{\rho a}{6\ep} + \dfrac{\rho a}{3\ep} = \dfrac{\rho a}{2\ep}$.

          **Why.** On and outside the cavity's surface, a point charge $\tfrac43\pi a^3\rho$ at the center has the same field as a ball of $+\rho$ filling the cavity. So at the wall the field is that of the solid cylinder: $0$ along $z$ on the axis, and $\dfrac{\rho s}{2\ep}$ sideways ✓.
        `,
      }),

      P({
        title: 'Exam-style: choose the cylinder density',
        q: md`
          A ball (radius $R$, density $\rho$) is pierced along a diameter by an infinite cylinder of radius $a = R/2$ and density $\rho_c$ (it overlaps the ball; densities add where they overlap).

          (a) Find $\rho_c$ such that $\vb E = 0$ on the ball's equator, $s = R$, $z = 0$. (b) With that $\rho_c$, find $E_z$ on the axis at $z = R/2$.
        `,
        figHtml: fSphCyl({ ap: 45, dens: false, pts: [[1, 0, 'Q', 'r'], [0, 0.5, 'P', { lx: 300, ly: 40 }]] }),
        hints: [
          md`At $s = R$ the point is outside the cylinder: $\dfrac{\rho_c a^2}{2\ep s}$.`,
          md`On the axis the cylinder contributes nothing, whatever its density.`,
        ],
        parts: [
          { lbl: md`(a) $\rho_c$`, expr: '-8*rho/3', vars: { rho: [0.5, 3] } },
          { lbl: md`(b) $E_z$`, expr: 'rho*R/(6*eps0)', vars: { rho: [0.5, 3], R: [0.5, 2], eps0: [0.5, 2] } },
        ],
        sol: md`
          **(a)** $\dfrac{\rho R}{3\ep} + \dfrac{\rho_c(R/2)^2}{2\ep R} = \dfrac{\rho R}{3\ep} + \dfrac{\rho_cR}{8\ep} = 0\Rightarrow\rho_c = -\dfrac{8\rho}{3}$.

          **(b)** On the axis the cylinder gives $0$: $E_z = \dfrac{\rho}{3\ep}\cdot\dfrac R2 = \dfrac{\rho R}{6\ep}$.

          Inside the ball the net density in the overlap is $\rho+\rho_c = -\tfrac53\rho$, and superposition handles that automatically.
        `,
      }),

      P({
        title: 'Exam-style: potentials in a spherical cavity',
        q: md`
          An infinite cylinder (radius $a$, density $\rho$, axis $z$) has an empty spherical cavity of radius $b$ centered on the axis.

          Find $V(\text{center}) - V(\text{top})$ (top: $z = b$ on the axis) and $V(\text{center}) - V(\text{side})$ (side: $s = b$, $z = 0$).
        `,
        figHtml: fCylCav({ noB: true, pts: [[0, 1, 'T', 'br'], [1, 0, 'S', 'l']] }),
        hints: [
          md`In the cavity, $\vb E = \dfrac{\rho}{6\ep}(x,y,-2z)$.`,
          md`$V(A)-V(B) = \displaystyle\int_A^B\vb E\cdot d\vb l$ along straight paths from the center.`,
        ],
        parts: [
          { lbl: md`$V(0)-V(T)$`, expr: '-rho*b^2/(6*eps0)', vars: { rho: [0.5, 3], b: [0.5, 2], eps0: [0.5, 2] } },
          { lbl: md`$V(0)-V(S)$`, expr: 'rho*b^2/(12*eps0)', vars: { rho: [0.5, 3], b: [0.5, 2], eps0: [0.5, 2] } },
        ],
        sol: md`
          Along the axis, $E_z = -\dfrac{\rho z}{3\ep}$: $V(0)-V(T) = \displaystyle\int_0^b-\frac{\rho z}{3\ep}dz = -\frac{\rho b^2}{6\ep}$.

          Sideways, $E_s = \dfrac{\rho s}{6\ep}$: $V(0)-V(S) = \displaystyle\int_0^b\frac{\rho s}{6\ep}ds = \frac{\rho b^2}{12\ep}$.

          So $V(T) > V(0) > V(S)$. The potential in the cavity is $V = V(0) - \dfrac{\rho}{12\ep}\left(s^2 - 2z^2\right)$, a saddle, as a charge-free region must be (no local extrema of $V$ where $\rho = 0$).
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Building blocks: ball $\dfrac{\rho}{3\ep}\vb r$ inside, $\dfrac{Q}{4\pi\ep r^2}\uv r$ outside; cylinder $\dfrac{\rho}{2\ep}\vb s$ inside, $\dfrac{\lambda}{2\pi\ep s}\uv s$ outside, $\lambda = \rho\pi a^2$; $\vb s$ has no $z$-part.
          - A hole is $+\rho$ everywhere plus $-\rho$ in the hole. Each piece gets its own Gauss's law; then add vectors.
          - Classify the point separately for each piece (inside/outside), measure from that piece's own center or axis.
          - Same shapes, equal and opposite densities, parallel: uniform field $\dfrac{\rho}{3\ep}\vb d$ (balls) or $\dfrac{\rho}{2\ep}\vb d$ (cylinders). Mixed shapes: not uniform.
          - On a cylinder's axis it contributes nothing; at a ball's center it contributes nothing. Use these points as checks.
          - A truly finite drilled plug is not Gauss-solvable; the exam version uses an infinite cylinder.
          - A finite line segment needs the finite-segment formula $\dfrac{1}{4\pi\ep}\dfrac{2\lambda L}{s\sqrt{s^2+L^2}}$, not $\dfrac{\lambda}{2\pi\ep s}$.
          - Potential differences: integrate $\vb E$ piece by piece along a convenient path; infinite cylinders can't use $V(\infty) = 0$.
          - Check with $\divg\vb E = \rho_{\text{net}}/\ep$ in the region.
      `),
    ],
  });


  // =====================================================================================
  // Lesson 3 figures: conducting spheres (hatched in setups, dashed in image solutions)
  // =====================================================================================
  // Setup: conducting sphere (radius R) and a point charge q a distance a = A R from the center.
  // o: { A, lab, ground, qlab, neg }
  function fSph(o = {}) {
    const f = PF.fig();
    const A = o.A ?? 3, Rp = Math.min(62, 210 / A), cx = 30 + Rp + 20, cy = 40 + Rp + 20, qx = cx + A * Rp;
    f.hatchBand(f.arcPts(cx, cy, Rp, Rp, 0, 360)); f.circle(cx, cy, Rp, { cls: 'thick' });
    f.dot(cx, cy, 2.4);
    const ra = 135 * DEG;
    f.line(cx, cy, cx + Rp * Math.cos(ra), cy - Rp * Math.sin(ra), { cls: 'dim', arrow: 'end', hs: 6 });
    f.tag(cx + Rp * Math.cos(ra), cy - Rp * Math.sin(ra), 'R', 'tl', 8, 'small');
    if (o.lab) f.tag(cx + Rp * Math.cos(225 * DEG), cy - Rp * Math.sin(225 * DEG), o.lab, 'bl', 10, 'small');
    if (o.ground) { const gx = cx + Rp * Math.cos(300 * DEG), gy = cy - Rp * Math.sin(300 * DEG); f.line(gx, gy, gx, gy + 14); f.ground(gx, gy + 14); }
    f.line(cx + 4, cy, qx - 9, cy, { cls: 'dim dash thin' });
    f.charge(qx, cy, { q: o.neg ? '-' : '+', lab: o.qlab || 'q', at: 't' });
    const yd = cy + Rp + (o.ground ? 46 : 22);
    f.line(cx, cy + 4, cx, yd + 4, { cls: 'dim dash thin' }); f.line(qx, cy + 10, qx, yd + 4, { cls: 'dim dash thin' });
    f.dim(cx, yd, qx, yd, o.aLab || 'a', { at: 'b' });
    return f.svg();
  }
  // Solution: images replace the sphere. o: { A, center: label or null, qp: label, cq: '+'|'-', Rp }
  function fSphImg(o = {}) {
    const f = PF.fig();
    const A = o.A ?? 3, Rp = o.Rp || Math.min(80, 230 / A), cx = 30 + Rp + 20, cy = 40 + Rp + 20, qx = cx + A * Rp, bx = cx + Rp / A;
    f.circle(cx, cy, Rp, { cls: 'dash dim' });
    f.line(cx - Rp - 10, cy, qx + 20, cy, { cls: 'dim dash thin nodecl' });
    f.charge(qx, cy, { q: '+', lab: 'q', at: 't', r: 6 });
    f.charge(bx, cy, { q: '-', lab: o.qp || "q'", at: 't', image: true, r: 6 });
    if (o.center) f.charge(cx, cy, { q: o.cq || '+', lab: o.center, at: 'tl', image: true, r: 6 });
    const yd = cy + Rp + 18;
    f.line(cx, cy + 7, cx, yd + 26, { cls: 'dim dash thin' }); f.line(bx, cy + 7, bx, yd + 4, { cls: 'dim dash thin' }); f.line(qx, cy + 7, qx, yd + 26, { cls: 'dim dash thin' });
    f.dim(cx, yd, bx, yd, '', {}); f.label((cx + bx) / 2, yd + 6, o.bLab || 'b', 't', 'small');
    f.dim(cx, yd + 22, qx, yd + 22, 'a', { at: 'b' });
    f.text(cx - Rp + 6, cy - Rp - 8, 'sphere removed', 'bl');
    return f.svg();
  }
  // Setup: a spherical cavity of radius R in a conductor (outer radius R2), with q at distance a from the center.
  function fShell(o = {}) {
    const f = PF.fig();
    const cx = 150, cy = 140, Rp = 80, R2 = o.thin ? 92 : 112, ap = (o.A ?? 1 / 3) * Rp;
    f.hatchBand(f.arcPts(cx, cy, R2, R2, 0, 360).concat(f.arcPts(cx, cy, Rp, Rp, 360, 0)));
    f.circle(cx, cy, R2, { cls: 'thick' }); f.circle(cx, cy, Rp, { cls: 'thick' });
    f.dot(cx, cy, 2.4);
    f.charge(cx + ap, cy, { q: '+', lab: 'q', at: 't', r: 6 });
    f.dim(cx, cy + 20, cx + ap, cy + 20, 'a', { at: 'b' });
    f.line(cx, cy, cx + Rp * Math.cos(130 * DEG), cy - Rp * Math.sin(130 * DEG), { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(cx + 0.5 * Rp * Math.cos(130 * DEG) + 14 * Math.cos(40 * DEG), cy - 0.5 * Rp * Math.sin(130 * DEG) - 14 * Math.sin(40 * DEG), 'R', 'c', 'small');
    if (!o.thin) f.tag(cx + R2 * Math.cos(40 * DEG), cy - R2 * Math.sin(40 * DEG), o.r2Lab || 'R_2', 'tr', 8, 'small');
    if (o.lab) f.tag(cx + R2 * Math.cos(220 * DEG), cy - R2 * Math.sin(220 * DEG), o.lab, 'bl', 10, 'small');
    if (o.ground) { const gx = cx + R2 * Math.cos(300 * DEG), gy = cy - R2 * Math.sin(300 * DEG); f.line(gx, gy, gx, gy + 14); f.ground(gx, gy + 14); }
    return f.svg();
  }
  // Solution: q inside the cavity and its image outside (conductor removed).
  function fShellImg(o = {}) {
    const f = PF.fig();
    const A = o.A ?? 1 / 3, Rp = 64, cx = 110, cy = 120, ap = A * Rp, bp = Rp / A;
    f.circle(cx, cy, Rp, { cls: 'dash dim' });
    f.line(cx - Rp - 10, cy, cx + bp + 20, cy, { cls: 'dim dash thin nodecl' });
    f.dot(cx, cy, 2.4);
    f.charge(cx + ap, cy, { q: '+', lab: 'q', at: 't', r: 6 });
    f.charge(cx + bp, cy, { q: '-', lab: o.qp || "q' = -\\tfrac{R}{a}q", at: 't', image: true, r: 6 });
    const yd = cy + Rp + 18;
    f.line(cx, cy + 4, cx, yd + 26, { cls: 'dim dash thin' }); f.line(cx + ap, cy + 7, cx + ap, yd + 4, { cls: 'dim dash thin' }); f.line(cx + bp, cy + 7, cx + bp, yd + 26, { cls: 'dim dash thin' });
    f.dim(cx, yd, cx + ap, yd, '', {}); f.label(cx + ap / 2, yd + 6, 'a', 't', 'small');
    f.dim(cx, yd + 22, cx + bp, yd + 22, o.bLab || 'b = R^2/a', { at: 'b' });
    f.text(cx - Rp + 4, cy - Rp - 8, 'conductor removed', 'bl');
    return f.svg();
  }
  // Setup: sphere in a uniform field E0 (z up), optionally held at V0.
  function fSphField(o = {}) {
    const f = PF.fig();
    const cx = 160, cy = 130, Rp = 56;
    f.hatchBand(f.arcPts(cx, cy, Rp, Rp, 0, 360)); f.circle(cx, cy, Rp, { cls: 'thick' });
    for (const x of [40, 280]) for (const y of [200, 110]) f.arrow(x, y + 30, x, y - 20, { hs: 7 });
    f.label(48, 236, 'E_0\\,\\uv z', 'tl', 'small');
    f.label(272, 40, '\\text{far away}', 'br', 'small accent');
    if (o.lab) f.tag(cx + Rp * Math.cos(225 * DEG), cy - Rp * Math.sin(225 * DEG), o.lab, 'bl', 10, 'small');
    f.line(cx, cy, cx + Rp * Math.cos(45 * DEG), cy - Rp * Math.sin(45 * DEG), { cls: 'dim', arrow: 'end', hs: 6 });
    f.tag(cx + Rp * Math.cos(45 * DEG), cy - Rp * Math.sin(45 * DEG), 'R', 'tr', 8, 'small');
    if (o.q) { f.line(cx, cy - Rp - 4, cx, cy - 2 * Rp + 8, { cls: 'dim dash thin' }); f.charge(cx, cy - 2 * Rp, { q: '+', lab: 'q', at: 'r' }); f.dim(cx - Rp - 16, cy, cx - Rp - 16, cy - 2 * Rp, 'a', { at: 'l' }); f.line(cx - Rp - 20, cy, cx - 4, cy, { cls: 'dim dash thin' }); f.line(cx - Rp - 20, cy - 2 * Rp, cx - 9, cy - 2 * Rp, { cls: 'dim dash thin' }); }
    return f.svg();
  }
  // Setup: grounded sphere with two charges on the z-axis at +-a. o.same: both +q
  function fSphTwo(o = {}) {
    const f = PF.fig();
    const cx = 130, cy = 160, Rp = 48, A = 2;
    f.hatchBand(f.arcPts(cx, cy, Rp, Rp, 0, 360)); f.circle(cx, cy, Rp, { cls: 'thick' });
    f.line(cx, cy - A * Rp - 20, cx, cy + A * Rp + 20, { cls: 'dim dash thin nodecl' });
    f.charge(cx, cy - A * Rp, { q: '+', lab: '+q', at: 'r' });
    f.charge(cx, cy + A * Rp, { q: o.same ? '+' : '-', lab: o.same ? '+q' : '-q', at: 'r' });
    f.dim(cx - Rp - 20, cy, cx - Rp - 20, cy - A * Rp, 'a = 2R', { at: 'l' });
    f.line(cx - Rp - 24, cy - A * Rp, cx - 9, cy - A * Rp, { cls: 'dim dash thin' });
    f.line(cx - Rp - 24, cy, cx - Rp, cy, { cls: 'dim dash thin' });
    f.tag(cx + Rp * Math.cos(-30 * DEG), cy - Rp * Math.sin(-30 * DEG), 'V=0', 'br', 10, 'small');
    const gx = cx + Rp * Math.cos(200 * DEG), gy = cy - Rp * Math.sin(200 * DEG); f.line(gx, gy, gx - 14, gy); f.line(gx - 14, gy, gx - 14, gy + 12); f.ground(gx - 14, gy + 12);
    return f.svg();
  }
  function fSphTwoImg(o = {}) {
    const f = PF.fig();
    const cx = 130, cy = 160, Rp = 48, A = 2;
    f.circle(cx, cy, Rp, { cls: 'dash dim' });
    f.line(cx, cy - A * Rp - 20, cx, cy + A * Rp + 20, { cls: 'dim dash thin nodecl' });
    f.charge(cx, cy - A * Rp, { q: '+', lab: '+q', at: 'r' });
    f.charge(cx, cy + A * Rp, { q: o.same ? '+' : '-', lab: o.same ? '+q' : '-q', at: 'r' });
    f.charge(cx, cy - Rp / A, { q: '-', lab: '-\\tfrac{q}{2}', at: 'r', image: true, r: 6 });
    f.charge(cx, cy + Rp / A, { q: o.same ? '-' : '+', lab: o.same ? '-\\tfrac{q}{2}' : '+\\tfrac{q}{2}', at: 'r', image: true, r: 6 });
    f.text(cx - Rp - 4, cy - Rp - 6, 'sphere removed', 'br');
    return f.svg();
  }
  // sigma(theta) on the sphere for q at a = 4R: grounded and at the zero-force V0 (units q/R^2)
  const pSigma = () => {
    const sg = (t, v) => (-(16 - 1) / (4 * Math.PI * Math.pow(1 + 16 - 8 * Math.cos(t), 1.5)) + v / (4 * Math.PI));
    return PF.plot({ w: 340, h: 210, x: [0, Math.PI], y: [-0.05, 0.03], xl: '\\theta', yl: '\\sigma\\ (q/R^2)', zero: true,
      xt: [[Math.PI / 2, '\\pi/2'], [Math.PI, '\\pi']], yt: [[-0.04, '-0.04'], [0.02, '0.02']],
      curves: [{ f: (t) => sg(t, 0), cls: 'dash' }, { f: (t) => sg(t, 64 / 225) }] });
  };

  // =====================================================================================
  // Lesson 3: images for a sphere with a twist
  // =====================================================================================
  LESSONS.push({
    id: 'uP-sphere-v0', title: 'Images for a sphere with a twist',
    steps: [
      RF(md`
        ### Start from the grounded sphere (Griffiths Ex. 3.2)

        A point charge $q$ sits a distance $a$ from the center of a grounded conducting sphere of radius $R$ ($a>R$).

        [[fig:set]]

        **Region of interest:** $r\ge R$ (outside the sphere). **Boundary conditions:**

        1. $V(R,\theta) = 0$ for every $\theta$ (grounded).
        2. $V\to0$ as $r\to\infty$.

        **Image.** One charge inside the sphere, on the line to $q$:

        $$q' = -\frac Ra\,q\quad\text{at}\quad b = \frac{R^2}{a}.$$

        Condition 1 fixes both numbers: setting $V(R,\theta)=0$ for **every** $\theta$ and matching the constant and $\cos\theta$ terms gives two equations, solved by $b = R^2/a$ and $q' = -qR/a$ (the other root, $b = a$, puts the image on top of $q$, inside the region, and is rejected). Condition 2 holds automatically for point charges. The image is outside the region of interest, so $\rho$ in $r>R$ is unchanged, and by uniqueness

        $$V(r,\theta) = \frac{1}{4\pi\ep}\left(\frac{q}{\srm} + \frac{q'}{\srm'}\right),\quad \srm = \sqrt{r^2+a^2-2ra\cos\theta},\quad\srm' = \sqrt{r^2+b^2-2rb\cos\theta}.$$

        [[fig:img]]

        The key geometric fact: on the sphere, $\srm'/\srm = R/a$ at every point. That is why $\dfrac{q}{\srm} + \dfrac{q'}{\srm'} = 0$ there.

        **Results to keep.** Induced charge density
        $$\sigma_g(\theta) = -\ep\frac{\partial V}{\partial r}\bigg|_{R} = -\frac{q\,(a^2-R^2)}{4\pi R\,(R^2+a^2-2Ra\cos\theta)^{3/2}},$$
        total induced charge $q' = -\dfrac Raq$, and force on $q$ (toward the sphere)
        $$F = -\frac{1}{4\pi\ep}\frac{q^2Ra}{(a^2-R^2)^2}.$$

        Unit 5 derives all of this in detail ([grounded sphere](#/l/u5-sphere)). This lesson is about the **twists** exams put on it.
      `, {
        set: { svg: fSph({ A: 3, lab: 'V=0', ground: true }), cap: md`Grounded conducting sphere of radius $R$; point charge $q$ at distance $a$ from the center.` },
        img: { svg: fSphImg({ A: 3 }), cap: md`The image $q' = -\dfrac Raq$ at $b = \dfrac{R^2}{a}$ replaces the sphere for $r\ge R$.` },
      }),

      Q(md`A charge $q$ is at distance $a$ from the center of a grounded sphere of radius $R$. Where is the image, and how big is it?`,
        [md`$-q$ at distance $a$ behind the surface, as for a plane`, md`$-\dfrac Raq$ at distance $\dfrac{R^2}{a}$ from the center, toward $q$`, md`$-\dfrac aRq$ at $\dfrac{R^2}{a}$`, md`$-\dfrac Raq$ at the center`], 1,
        [md`That is the plane result; for a sphere the image is smaller and closer to the center.`,
          null,
          md`That would be bigger than $q$. The image of an outside charge is always smaller.`,
          md`At the center the image's potential would be the same on the whole sphere and couldn't cancel $q$'s, which varies.`],
        md`$q' = -\dfrac Raq$, $b = \dfrac{R^2}{a}$. Both follow from $V(R,\theta) = 0$ for all $\theta$.`,
        { figHtml: fSph({ A: 3, lab: 'V=0', ground: true }) }),

      Q(md`What is the total charge induced on the **grounded** sphere?`,
        [md`$-q$`, md`$0$`, md`$-\dfrac Raq$`, md`$-\dfrac aRq$`], 2,
        [md`That is the infinite plane. A sphere catches only part of $q$'s field lines.`,
          md`Grounded means $V = 0$, not $Q = 0$; charge flows in from the ground.`,
          null,
          md`More than $q$ itself; impossible for an outside charge.`],
        md`Outside the sphere the image system and the real system have the same field, so Gauss's law around the sphere gives the same enclosed charge: $q'$. A one-line check: the center is at $V = 0$, and every induced charge is a distance $R$ from it, so $0 = \dfrac{q}{4\pi\ep a} + \dfrac{Q_{\text{ind}}}{4\pi\ep R}$.`,
        { figHtml: fSph({ A: 3, lab: 'V=0', ground: true }) }),

      Q(md`As $q$ moves very close to the grounded sphere ($a\to R^+$), what happens to the image?`,
        [md`$q'\to-q$ and $b\to R$: it looks like the plane image`, md`$q'\to0$`, md`$q'\to-q$ at the center`, md`$b\to0$`], 0,
        [null,
          md`That is the far limit, $a\to\infty$.`,
          md`$b = R^2/a\to R$, not $0$.`,
          md`$b\to0$ only as $a\to\infty$.`],
        md`Close up, the sphere looks flat, and $q' = -\dfrac Raq\to-q$ sits just inside the surface, mirroring $q$: the plane result.`,
        { figHtml: fSph({ A: 1.3, lab: 'V=0', ground: true }) }),

      Q(md`Why must the image for an outside charge lie **inside** the sphere?`,
        [md`Because induced charge sits inside conductors`, md`Because it has the opposite sign`, md`Any position works as long as $V(R)=0$`, md`It must be outside the region of interest ($r\ge R$), so that $\rho$ there is unchanged`], 3,
        [md`Induced charge is on the surface; the image is a fictitious stand-in.`,
          md`Sign doesn't decide location.`,
          md`An image inside the region changes Poisson's equation there, so the uniqueness argument no longer applies.`,
          null],
        md`Uniqueness needs the same charge density in the region and the same boundary values. An image in $r>R$ would add charge to the region. Inside the sphere it is invisible to the problem.`,
        { figHtml: fSph({ A: 3, lab: 'V=0', ground: true }) }),

      Q(md`On the surface of the sphere, how are $\srm$ (distance to $q$) and $\srm'$ (distance to $q'$) related?`,
        [md`$\srm' = \srm$`, md`$\srm'/\srm = R/a$ at every point of the sphere`, md`$\srm' + \srm = a$`, md`$\srm'\srm = R^2$`], 1,
        [md`Only at points equidistant from both, not over the whole sphere.`,
          null,
          md`Only true for points on the line between them.`,
          md`Not a property of these two points.`],
        md`The sphere is the set of points whose distances to $q$ and $q'$ have the fixed ratio $a/R$ (an Apollonius sphere). Then $\dfrac{q}{\srm} - \dfrac{qR/a}{\srm'} = \dfrac{q}{\srm} - \dfrac{q}{\srm} = 0$.`,
        { figHtml: fSphImg({ A: 3 }) }),

      RF(md`
        ### Twist 1: the sphere held at $V_0$

        A battery holds the sphere at $V_0$ relative to infinity. **Region:** $r\ge R$. **Boundary conditions:**

        1. $V(R,\theta) = V_0$ for every $\theta$.
        2. $V\to0$ as $r\to\infty$.

        Keep the grounded image $q'$ (it makes $V = 0$ on the sphere together with $q$) and add a **second image at the center**:

        $$q_0 = 4\pi\ep RV_0 .$$

        A charge at the center is the same distance $R$ from every point of the sphere, so it adds the constant $\dfrac{q_0}{4\pi\ep R} = V_0$ everywhere on it. Condition 1 ✓. Condition 2 ✓ (all point charges). Both images are inside the sphere ✓.

        $$V(r,\theta) = \frac{1}{4\pi\ep}\left(\frac{q}{\srm} - \frac{qR/a}{\srm'}\right) + \frac{RV_0}{r}\qquad(r\ge R).$$

        **Surface charge.** The center image adds a uniform layer: $\sigma(\theta) = \sigma_g(\theta) + \dfrac{\ep V_0}{R}$.

        **Total charge on the sphere** (Gauss around it, or integrate $\sigma$): $Q_s = q' + q_0 = 4\pi\ep RV_0 - \dfrac Raq$. The battery supplies whatever this takes.

        **Force on $q$.** From both images:
        $$F = \frac{q}{4\pi\ep}\left[\frac{q_0}{a^2} - \frac{qRa}{(a^2-R^2)^2}\right]\qquad(\text{positive} = \text{away from the sphere}).$$

        The center image repels (if $V_0$ has the sign of $q$); the near image attracts and wins close to the surface, where it blows up like $\dfrac{1}{(a-R)^2}$. The force vanishes when
        $$q_0 = \frac{qRa^3}{(a^2-R^2)^2}\quad\Longleftrightarrow\quad V_0^* = \frac{1}{4\pi\ep}\frac{q\,a^3}{(a^2-R^2)^2}.$$

        **Stability.** With $V_0$ fixed, $\dfrac{dF}{da} = \dfrac{q^2R(a^2+3R^2)}{4\pi\ep(a^2-R^2)^3}>0$ at the balance point: move $q$ out and the force pushes it further out; move it in and it is pulled in. **Unstable** (as Earnshaw's theorem says any electrostatic equilibrium must be).
      `),

      Q(md`To go from a grounded sphere to a sphere held at $V_0$, what do you add to the image system?`,
        [md`$4\pi\ep RV_0$ at the center`, md`$4\pi\ep RV_0$ at $b$`, md`$4\pi\ep aV_0$ at the center`, md`Nothing; only the image size changes`], 0,
        [null,
          md`At $b$ its potential would vary over the sphere and spoil the equipotential.`,
          md`The center charge must produce $V_0$ at distance $R$, not $a$.`,
          md`The grounded pair gives exactly $0$ on the sphere; you need something that adds a constant.`],
        md`$\dfrac{q_0}{4\pi\ep R} = V_0\Rightarrow q_0 = 4\pi\ep RV_0$, at the center so its potential is the same at every point of the sphere.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`Which boundary conditions describe a sphere held at $V_0$ by a battery, with $q$ outside?`,
        [md`$V(R,\theta) = V_0$ and total charge $4\pi\ep RV_0$`, md`$V\to V_0$ at infinity`, md`$V(R,0) = V_0$ only at the point nearest $q$`, md`$V(R,\theta) = V_0$ for all $\theta$, and $V\to0$ at infinity`], 3,
        [md`The total charge isn't fixed: the battery adjusts it. Imposing both would over-determine the problem.`,
          md`$V_0$ is on the sphere; at infinity $V\to0$ (the reference).`,
          md`The whole conductor is at one potential.`,
          null],
        md`Fix the potential, let the charge float. Fixing both $V$ and $Q$ on the same conductor is too many conditions; fixing one of them is enough for uniqueness.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`What is the total charge on a sphere held at $V_0$, with $q$ at distance $a$?`,
        [md`$4\pi\ep RV_0$`, md`$-\dfrac Raq$`, md`$4\pi\ep RV_0 + \dfrac Raq$`, md`$4\pi\ep RV_0 - \dfrac Raq$`], 3,
        [md`That leaves out the charge drawn in by $q$.`,
          md`That is the grounded case, $V_0 = 0$.`,
          md`The induced part has the sign opposite to $q$.`,
          null],
        md`The two images inside the sphere add to $q_0 + q' = 4\pi\ep RV_0 - \dfrac Raq$. Outside, the image system and the real sphere have the same field, so Gauss's law gives this as the sphere's charge.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`Compared with the grounded sphere, how does holding the sphere at $V_0$ change $\sigma(\theta)$?`,
        [md`It adds a uniform $\ep V_0/R$ everywhere`, md`It multiplies $\sigma$ by $V_0$`, md`It adds charge only near $q$`, md`It doesn't change $\sigma$; only the total changes`], 0,
        [null,
          md`The new image adds to the field, it doesn't scale it.`,
          md`The center image is symmetric; its contribution is the same everywhere.`,
          md`A different total needs a different $\sigma$.`],
        md`The center charge $q_0$ gives a radial field $\dfrac{q_0}{4\pi\ep R^2}$ at the surface, so $\Delta\sigma = \ep E = \dfrac{q_0}{4\pi R^2} = \dfrac{\ep V_0}{R}$, uniform.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`A sphere held at $V_0>0$ and a positive charge $q$. As $q$ approaches the surface ($a\to R^+$), the force on $q$`,
        [md`becomes strongly repulsive`, md`goes to zero`, md`becomes strongly attractive`, md`depends on how large $V_0$ is`], 2,
        [md`The repulsion from $q_0$ stays finite ($\propto1/a^2$).`,
          md`It diverges.`,
          null,
          md`For any finite $V_0$, the near image's pull grows without bound and wins close enough.`],
        md`The image $q'$ approaches $-q$ just inside the surface, a distance $a - b\to0$ away, and its pull diverges like $\dfrac{1}{(a-R)^2}$. The repulsion $\dfrac{qq_0}{4\pi\ep a^2}$ stays finite.`,
        { figHtml: fSph({ A: 1.3, lab: 'V=V_0' }) }),

      Q(md`$V_0$ is tuned so the force on $q$ is exactly zero at distance $a$ (battery fixed). Is this balance stable?`,
        [md`Stable: any displacement is pushed back`, md`Unstable: pushed outward if moved out, pulled in if moved in`, md`Neutral: zero force at every $a$`, md`Stable radially, unstable sideways`], 1,
        [md`Then $F$ would decrease through zero as $a$ increases; it increases.`,
          null,
          md`The force depends on $a$; it vanishes at one point only.`,
          md`Radially it is already unstable.`],
        md`At the balance point $\dfrac{dF}{da}>0$: farther out the center image wins (repulsion), closer in the near image wins (attraction). Electrostatics never has stable equilibria in charge-free space (Earnshaw).`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`The sphere is held at $V_0$ with the **opposite** sign to $q$. What is the force on $q$?`,
        [md`Attractive at every distance`, md`Repulsive far away, attractive close in`, md`Zero at one distance`, md`Repulsive at every distance`], 0,
        [null,
          md`That needs $V_0$ of the same sign as $q$.`,
          md`Both images now attract: no balance point.`,
          md`Both terms are attractive.`],
        md`$q_0 = 4\pi\ep RV_0$ now has the opposite sign to $q$, so both images pull $q$ in.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`Far from everything ($r\gg a$), what does $V$ look like for the sphere held at $V_0$ with $q$ nearby?`,
        [md`$V\to V_0$`, md`$V\approx\dfrac{q}{4\pi\ep r}$`, md`$V\approx0$ faster than $1/r$`, md`$V\approx\dfrac{1}{4\pi\ep r}\left(q + 4\pi\ep RV_0 - \dfrac Raq\right)$`], 3,
        [md`$V_0$ is the sphere's potential, not the potential at infinity (which is $0$).`,
          md`The sphere's own charge contributes too.`,
          md`Only if the net charge vanishes.`,
          null],
        md`Far away every point charge looks like it is at the origin: $V\approx\dfrac{q_{\text{total}}}{4\pi\ep r}$ with $q_{\text{total}} = q + q_0 + q'$, the real charge $q$ plus the sphere's charge.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`What is the potential at the **center** of the sphere held at $V_0$ (with $q$ outside)?`,
        [md`$V_0 + \dfrac{q}{4\pi\ep a}$`, md`Undefined: an image sits there`, md`$0$`, md`$V_0$`], 3,
        [md`The center is inside the metal. The images are fictitious and the formula with them is valid only for $r\ge R$.`,
          md`Inside the conductor $V$ is simply $V_0$; the image formula doesn't apply there.`,
          md`That is the grounded case.`,
          null],
        md`The whole conductor, including its interior, is at $V_0$. The image formula describes only $r\ge R$.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      RF(md`
        ### Worked example: held at $V_0$, charge at $a = 4R$

        **Region:** $r\ge R$. **BCs:** 1. $V(R,\theta) = V_0$. 2. $V\to0$ at infinity.

        **Images.** $q' = -\dfrac q4$ at $b = \dfrac R4$; $q_0 = 4\pi\ep RV_0$ at the center.

        [[fig:img]]

        **Potential** ($r\ge R$): $V = \dfrac{1}{4\pi\ep}\left(\dfrac{q}{\srm} - \dfrac{q/4}{\srm'}\right) + \dfrac{RV_0}{r}$, with $\srm = \sqrt{r^2+16R^2-8rR\cos\theta}$, $\srm' = \sqrt{r^2+\tfrac{R^2}{16}-\tfrac{rR}{2}\cos\theta}$. **Check BC 1:** on $r = R$, $\srm' = \srm/4$, so the bracket is $0$ and $V = V_0$ ✓.

        **Surface charge.** $\sigma = -\dfrac{15q}{4\pi R^2(17-8\cos\theta)^{3/2}} + \dfrac{\ep V_0}{R}$.

        **Force** (units $\dfrac{1}{4\pi\ep}\dfrac{q}{R^2}$): $\dfrac{q_0}{16} - q\dfrac{4}{225}$. Zero when $q_0 = \dfrac{64}{225}q$, i.e.

        $$V_0^* = \frac{64}{225}\,\frac{q}{4\pi\ep R}\approx0.284\,\frac{q}{4\pi\ep R}.$$

        **Total charge then:** $Q_s = \dfrac{64}{225}q - \dfrac q4 = \dfrac{31}{900}q$: a small positive charge.

        [[fig:sig]]

        **Reading the graph.** Grounded (dashed): negative everywhere, most negative facing $q$. At $V_0^*$ (solid): the uniform layer shifts the curve up; the near side is still negative and the far side positive.
      `, {
        img: { svg: fSphImg({ A: 4, center: 'q_0', Rp: 70 }), cap: md`$q' = -q/4$ at $R/4$ and $q_0 = 4\pi\ep RV_0$ at the center.` },
        sig: { svg: pSigma(), cap: md`$\sigma(\theta)$ in units of $q/R^2$ for $a = 4R$: grounded (dashed) and held at the zero-force potential $V_0^*$ (solid).` },
      }),

      P({
        title: 'Zero force close to a sphere at fixed potential',
        q: md`
          A point charge $q$ is at $a = \tfrac32R$ from the center of a conducting sphere of radius $R$ held at potential $V_0$.

          (a) Find $V_0$ such that the force on $q$ is zero. (b) Find the total charge on the sphere then.
        `,
        figHtml: fSph({ A: 1.5, lab: 'V=V_0' }),
        hints: [
          md`BCs: $V(R,\theta) = V_0$, $V\to0$ at infinity. Images: $q' = -\tfrac23q$ at $\tfrac23R$, and $q_0 = 4\pi\ep RV_0$ at the center.`,
          md`$F\propto\dfrac{q_0}{a^2} - \dfrac{qRa}{(a^2-R^2)^2}$.`,
          md`$Q_s = q_0 + q'$.`,
        ],
        parts: [
          { lbl: md`(a) $V_0$`, expr: '27*q/(50*pi*eps0*R)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 2] }, accepts: ['(54/25)*q/(4*pi*eps0*R)'] },
          { lbl: md`(b) $Q_s$`, expr: '112*q/75', vars: { q: [0.5, 3] } },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs:** 1. $V(R,\theta) = V_0$. 2. $V\to0$ at infinity.

          **Images:** $q' = -\dfrac{R}{a}q = -\dfrac23q$ at $b = \dfrac{R^2}{a} = \dfrac23R$; $q_0 = 4\pi\ep RV_0$ at the center.

          **(a)** $a^2 - R^2 = \tfrac54R^2$, so $\dfrac{qRa}{(a^2-R^2)^2} = \dfrac{q\cdot\tfrac32R^2}{\tfrac{25}{16}R^4} = \dfrac{24q}{25R^2}$. Zero force: $\dfrac{q_0}{\tfrac94R^2} = \dfrac{24q}{25R^2}\Rightarrow q_0 = \dfrac{54}{25}q$. So

          $$V_0 = \frac{q_0}{4\pi\ep R} = \frac{54}{25}\cdot\frac{q}{4\pi\ep R} = \frac{27q}{50\pi\ep R}.$$

          **(b)** $Q_s = \dfrac{54}{25}q - \dfrac23q = \dfrac{162-50}{75}q = \dfrac{112}{75}q$.

          **Compare.** Close to the sphere ($a = 1.5R$) the near image is strong, so it takes a large like charge ($\approx1.5q$) to balance it. At $a = 4R$ only $0.034q$ was needed.
        `,
        figs: {},
      }),

      P({
        title: 'No negative charge anywhere on the sphere',
        q: md`
          A charge $q>0$ is at distance $a$ from the center of a conducting sphere of radius $R$ held at $V_0$. Find the smallest $V_0$ for which $\sigma\ge0$ everywhere on the sphere.
        `,
        figHtml: fSph({ A: 3, lab: 'V=V_0' }),
        hints: [
          md`$\sigma(\theta) = \sigma_g(\theta) + \dfrac{\ep V_0}{R}$. Where is $\sigma_g$ most negative?`,
          md`At $\theta = 0$: $\sigma_g(0) = -\dfrac{q(a^2-R^2)}{4\pi R(a-R)^3} = -\dfrac{q(a+R)}{4\pi R(a-R)^2}$.`,
        ],
        parts: [
          { lbl: 'V_0', expr: 'q*(a+R)/(4*pi*eps0*(a-R)^2)', vars: { q: [0.5, 3], eps0: [0.5, 2], a: [2, 4], R: [0.5, 1.5] } },
          { lbl: md`For $a = 3R$, this $V_0$ in units of $\dfrac{q}{4\pi\ep R}$`, ans: 1, unit: '' },
        ],
        sol: md`
          $\sigma_g$ is most negative facing $q$ ($\theta = 0$), where the denominator $(R^2+a^2-2Ra)^{3/2} = (a-R)^3$ is smallest:

          $$\sigma_g(0) = -\frac{q(a^2-R^2)}{4\pi R(a-R)^3} = -\frac{q(a+R)}{4\pi R(a-R)^2}.$$

          Require $\sigma(0) = \sigma_g(0) + \dfrac{\ep V_0}{R}\ge0$:

          $$V_0\ge\frac{q(a+R)}{4\pi\ep(a-R)^2}.$$

          For $a = 3R$: $\dfrac{4R}{4R^2}\cdot\dfrac{q}{4\pi\ep} = \dfrac{q}{4\pi\ep R}$. Then $\sigma$ is zero at the point facing $q$ and positive everywhere else.

          **Note.** Compare with the zero-force $V_0^* = \dfrac{q\,a^3}{4\pi\ep(a^2-R^2)^2}$, which at $a = 3R$ is $\dfrac{27}{64}\dfrac{q}{4\pi\ep R}$, smaller. So at zero force there is still negative charge facing $q$.
        `,
      }),

      P({
        title: 'Held at V0 = q/(4πε0R), charge at 2R',
        q: md`
          A conducting sphere of radius $R$ is held at $V_0 = \dfrac{q}{4\pi\ep R}$. A charge $q$ is at $a = 2R$.

          Find the total charge on the sphere and the force on $q$ (in units of $\dfrac{q^2}{4\pi\ep R^2}$, positive = away).
        `,
        figHtml: fSph({ A: 2, lab: 'V=V_0' }),
        hints: [
          md`$q_0 = 4\pi\ep RV_0 = q$; $q' = -q/2$ at $R/2$.`,
          md`Distances from $q$: $q_0$ at $2R$, $q'$ at $\tfrac32R$.`,
        ],
        parts: [
          { lbl: 'Q_s', expr: 'q/2', vars: { q: [0.5, 3] } },
          { lbl: 'F', ans: 0.02778, unit: '' },
          { lbl: md`The force is`, mc: [md`attractive`, md`repulsive`, md`zero`], a: 1, why: [md`At this distance the center image's push ($\tfrac14$) beats the near image's pull ($\tfrac29$).`, null, md`$\tfrac14\neq\tfrac29$.`] },
        ],
        sol: md`
          **Images:** $q_0 = q$ at the center, $q' = -\dfrac q2$ at $\dfrac R2$. **Total:** $Q_s = q - \dfrac q2 = \dfrac q2$.

          **Force** (units $\dfrac{q^2}{4\pi\ep R^2}$): $\dfrac{1}{2^2} - \dfrac{1/2}{(3/2)^2} = \dfrac14 - \dfrac29 = \dfrac{1}{36}\approx0.0278$: weakly repulsive. Bring $q$ closer and it turns attractive.
        `,
      }),

      RF(md`
        ### Twists 2 and 3: isolated spheres (neutral, or carrying $Q$)

        An isolated sphere is not connected to anything. Its potential is **not** given; its total charge is.

        **Region:** $r\ge R$. **Boundary conditions:**

        1. $V(R,\theta) = V_s$, a constant you don't know in advance.
        2. $\oint\sigma\,da = Q$ (the given total charge; $0$ if neutral).
        3. $V\to0$ as $r\to\infty$.

        Images: $q'$ at $b$ as before, plus a center charge $q_c$ chosen to fix the total: $q' + q_c = Q$, so

        $$q_c = Q + \frac Raq,\qquad V_s = \frac{q_c}{4\pi\ep R} = \frac{1}{4\pi\ep R}\left(Q + \frac Raq\right).$$

        | Sphere | condition on it | center image | total charge | potential |
        |---|---|---|---|---|
        | grounded | $V = 0$ | none | $-\dfrac Raq$ | $0$ |
        | held at $V_0$ | $V = V_0$ | $4\pi\ep RV_0$ | $4\pi\ep RV_0 - \dfrac Raq$ | $V_0$ |
        | isolated, neutral | $V$ = const, $Q = 0$ | $+\dfrac Raq$ | $0$ | $\dfrac{q}{4\pi\ep a}$ |
        | isolated, charge $Q$ | $V$ = const, total $Q$ | $Q+\dfrac Raq$ | $Q$ | $\dfrac{Q + Rq/a}{4\pi\ep R}$ |

        **Shortcut for the potential.** The center is in the metal, so it is at $V_s$. Every bit of surface charge is a distance $R$ from it: together they give $\dfrac{Q}{4\pi\ep R}$ there. Add $q$'s potential at the center: $V_s = \dfrac{Q}{4\pi\ep R} + \dfrac{q}{4\pi\ep a}$, the same as the table.

        **Force:** $F = \dfrac{q}{4\pi\ep}\left[\dfrac{q_c}{a^2} - \dfrac{qRa}{(a^2-R^2)^2}\right]$ with the appropriate $q_c$.
      `),

      Q(md`An isolated sphere carries total charge $Q$, with $q$ nearby. Which boundary conditions apply (region $r\ge R$)?`,
        [md`$V(R) = \dfrac{Q}{4\pi\ep R}$ and $V\to0$`, md`$V(R) = 0$ and $\oint\sigma\,da = Q$`, md`$V(R,\theta)$ = an unknown constant, $\oint\sigma\,da = Q$, $V\to0$ at infinity`, md`$\sigma = \dfrac{Q}{4\pi R^2}$ and $V\to0$`], 2,
        [md`That is the potential of the sphere alone; $q$ shifts it.`,
          md`$V(R) = 0$ would be a grounded sphere, which can't hold an arbitrary $Q$.`,
          null,
          md`$q$ pushes the charge around; $\sigma$ is not uniform.`],
        md`A conductor is an equipotential, but for an isolated one you don't know which. You know its charge. The uniqueness theorem for conductors says the total charges (plus $\rho$ outside) determine the field.`,
        { figHtml: fSph({ A: 3, lab: 'Q' }) }),

      Q(md`For an isolated sphere carrying total charge $Q$, which charge goes at the center?`,
        [md`$Q$`, md`$Q - \dfrac Raq$`, md`$-\dfrac Raq$`, md`$Q + \dfrac Raq$`], 3,
        [md`The image $q'$ already contributes $-\dfrac Raq$ to the total.`,
          md`Wrong sign: you must cancel $q'$, not double it.`,
          md`That makes the total $-\dfrac{2R}{a}q$.`,
          null],
        md`Total $= q' + q_c = -\dfrac Raq + q_c = Q\Rightarrow q_c = Q + \dfrac Raq$.`,
        { figHtml: fSph({ A: 3, lab: 'Q' }) }),

      Q(md`What is the potential of an isolated **neutral** sphere with $q$ at distance $a$?`,
        [md`$\dfrac{q}{4\pi\ep a}$`, md`$0$`, md`$\dfrac{q}{4\pi\ep R}$`, md`$\dfrac{q}{4\pi\ep(a-R)}$`], 0,
        [null,
          md`Only grounded spheres are at $0$.`,
          md`That would be a sphere carrying charge $q$.`,
          md`That is $q$'s potential at the nearest point of the sphere.`],
        md`At the center: induced charges contribute $\dfrac{0}{4\pi\ep R}$, and $q$ contributes $\dfrac{q}{4\pi\ep a}$. Or: $q_c = \dfrac Raq$ gives $\dfrac{q_c}{4\pi\ep R} = \dfrac{q}{4\pi\ep a}$.`,
        { figHtml: fSph({ A: 3, lab: 'Q=0' }) }),

      Q(md`At the same distance, which sphere pulls harder on $q$?`,
        [md`The isolated neutral one`, md`It depends on the sign of $q$`, md`They pull equally`, md`The grounded one`], 3,
        [md`The neutral sphere's center image ($+\dfrac Raq$) pushes $q$ away.`,
          md`Forces from induced charge go as $q^2$: the sign doesn't matter.`,
          md`They differ by the center image's force $\dfrac{q^2R}{4\pi\ep a^3}$.`,
          null],
        md`The grounded sphere can pull extra opposite charge from the earth; the neutral one can only separate its own charge.`,
        { figHtml: fSph({ A: 3, lab: 'Q=0' }) }),

      Q(md`Far from a **neutral** sphere ($a\gg R$), the force on $q$ falls off like`,
        [md`$1/a^2$`, md`$1/a^3$`, md`$1/a^4$`, md`$1/a^5$`], 3,
        [md`That would need a net charge on the sphere.`,
          md`That is the grounded sphere, whose induced charge $-\dfrac Raq$ is a net charge.`,
          md`Count again: induced dipole $\propto1/a^2$, its field at $q$ $\propto p/a^3$.`,
          null],
        md`The two images form a dipole $p = \dfrac Raq\cdot\dfrac{R^2}{a} = \dfrac{qR^3}{a^2}$. Its field at $q$ is $\approx\dfrac{2p}{4\pi\ep a^3}$, so $F\approx\dfrac{2q^2R^3}{4\pi\ep a^5}$, attractive.`,
        { figHtml: fSph({ A: 3, lab: 'Q=0' }) }),

      Q(md`A grounded sphere holds induced charge $-\dfrac Raq$. You cut the ground wire without moving $q$. Then you move $q$ farther away. What is the sphere now?`,
        [md`Isolated, with total charge $-\dfrac Raq_{\text{(old }a)}$ fixed, and its potential no longer $0$`, md`Grounded, still at $V = 0$`, md`Neutral`, md`At $V_0 = \dfrac{q}{4\pi\ep a}$`], 0,
        [null,
          md`The wire is cut; nothing holds it at $0$.`,
          md`The charge it had can't leave.`,
          md`That is the neutral sphere's potential; this sphere is not neutral.`],
        md`Cutting the wire changes nothing at first (same charge, same potential, same solution). After that the sphere's **charge** is fixed at its old value, so moving $q$ changes its potential. Words to conditions: "cut the wire" = "isolated, total charge = whatever it had".`,
        { figHtml: fSph({ A: 3, lab: 'V=0', ground: true }) }),

      Q(md`A sphere is held at $V_0$ and ends up with total charge $Q_s$. An isolated sphere carrying exactly $Q_s$, with $q$ in the same place, has`,
        [md`a different field, since the conditions are different`, md`the same field everywhere, and potential $V_0$`, md`the same total charge but potential $0$`, md`the same field only far away`], 1,
        [md`Different kinds of conditions can describe the same physical state.`,
          null,
          md`Uniqueness gives the same solution, so the same potential.`,
          md`Uniqueness gives the same field everywhere in the region.`],
        md`Both are solutions with charge $Q_s$ on the conductor; by uniqueness they're the same. Fixed $V$ and fixed $Q$ are two ways to label one state. They differ only when $q$ **moves**: then the battery keeps $V$ and changes $Q$, while the isolated sphere keeps $Q$ and changes $V$.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`An isolated sphere carries $Q = -q$ (opposite to the nearby $q>0$). The force on $q$ is`,
        [md`repulsive far away, attractive close in`, md`attractive at all distances`, md`zero at one distance`, md`repulsive at all distances`], 1,
        [md`Both images are negative now, so both attract.`,
          null,
          md`No repulsive term to balance.`,
          md`Opposite charges attract.`],
        md`$q_c = -q + \dfrac Raq<0$ (for $a>R$) and $q'<0$: both images attract $q$.`,
        { figHtml: fSph({ A: 3, lab: 'Q=-q' }) }),

      P({
        title: 'A neutral sphere, charge at 4R',
        q: md`
          A charge $q$ is at $a = 4R$ from the center of an isolated, uncharged conducting sphere of radius $R$.

          Find the potential of the sphere, the potential at the point $r = 2R$, $\theta = \pi$ (on the far side), and the force on $q$.
        `,
        figHtml: fSph({ A: 4, lab: 'Q=0' }),
        hints: [
          md`BCs: $V(R)$ = const, total charge $0$, $V\to0$. Images: $-\dfrac q4$ at $\dfrac R4$, $+\dfrac q4$ at the center.`,
          md`At $(2R,\pi)$ the distances are $6R$ to $q$, $\tfrac94R$ to $q'$, $2R$ to the center.`,
        ],
        parts: [
          { lbl: 'V_s', expr: 'q/(16*pi*eps0*R)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 2] }, accepts: ['q/(4*pi*eps0*4*R)'] },
          { lbl: md`$V(2R,\pi)$ in units of $\dfrac{q}{4\pi\ep R}$`, ans: 0.18056, unit: '' },
          { lbl: md`$F$ in units of $\dfrac{q^2}{4\pi\ep R^2}$ (positive = away)`, ans: -0.0021528, unit: '' },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs:** 1. $V(R,\theta) = V_s$ (unknown). 2. Total charge $0$. 3. $V\to0$ at infinity.

          **Images.** $q' = -\dfrac q4$ at $b = \dfrac R4$; $q_c = +\dfrac q4$ at the center (total $0$ ✓). BC 1: $q$ and $q'$ cancel on the sphere and $q_c$ adds a constant ✓.

          [[fig:img]]

          **Sphere's potential.** $V_s = \dfrac{q/4}{4\pi\ep R} = \dfrac{q}{16\pi\ep R}$ $\left(= \dfrac{q}{4\pi\ep a}\right)$.

          **At $(2R,\pi)$** (units $\dfrac{q}{4\pi\ep R}$): $\dfrac{1}{6} - \dfrac{1/4}{9/4} + \dfrac{1/4}{2} = \dfrac16 - \dfrac19 + \dfrac18 = \dfrac{13}{72}\approx0.1806$.

          **Force** (units $\dfrac{q^2}{4\pi\ep R^2}$): from $q_c$ at $4R$: $+\dfrac{1/4}{16} = \dfrac1{64}$; from $q'$ at $\tfrac{15}{4}R$: $-\dfrac{1/4}{225/16} = -\dfrac{4}{225}$. Total $\dfrac{1}{64} - \dfrac{4}{225} = -\dfrac{31}{14400}\approx-0.00215$: weakly attractive.

          At this distance the grounded sphere would pull with $\dfrac{4}{225}\approx0.0178$, eight times harder.
        `,
        figs: { img: { svg: fSphImg({ A: 4, center: 'q_c', Rp: 70 }), cap: md`$q' = -q/4$ at $R/4$ and $q_c = +q/4$ at the center.` } },
      }),

      P({
        title: 'An oppositely charged sphere',
        q: md`
          An isolated conducting sphere of radius $R$ carries total charge $Q = -q$. A charge $q$ is at $a = 3R$.

          Find the center image $q_c$, the sphere's potential, and the force on $q$.
        `,
        figHtml: fSph({ A: 3, lab: 'Q=-q' }),
        hints: [
          md`$q' = -\dfrac q3$ at $\dfrac R3$. $q_c = Q + \dfrac Raq$.`,
          md`Force: $q_c$ at distance $3R$, $q'$ at $\tfrac83R$.`,
        ],
        parts: [
          { lbl: 'q_c', expr: '-2*q/3', vars: { q: [0.5, 3] } },
          { lbl: 'V_s', expr: '-q/(6*pi*eps0*R)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 2] }, accepts: ['-(2/3)*q/(4*pi*eps0*R)'] },
          { lbl: md`$F$ in units of $\dfrac{q^2}{4\pi\ep R^2}$ (positive = away)`, ans: -0.12095, unit: '' },
        ],
        sol: md`
          **BCs:** $V(R)$ = const (unknown), total charge $-q$, $V\to0$.

          **Images.** $q' = -\dfrac q3$ at $\dfrac R3$; $q_c = -q + \dfrac q3 = -\dfrac{2q}{3}$ at the center. Total $-q$ ✓.

          **Potential.** $V_s = \dfrac{q_c}{4\pi\ep R} = -\dfrac{2}{3}\dfrac{q}{4\pi\ep R} = -\dfrac{q}{6\pi\ep R}$. Check via the center: $\dfrac{-q}{4\pi\ep R} + \dfrac{q}{4\pi\ep\cdot3R} = -\dfrac23\dfrac{q}{4\pi\ep R}$ ✓.

          **Force.** $-\dfrac{2/3}{9} - \dfrac{1/3}{64/9} = -\dfrac{2}{27} - \dfrac{3}{64} = -\dfrac{209}{1728}\approx-0.121$. Attractive.
        `,
      }),

      RF(md`
        ### Twist 4: a charge inside a spherical cavity held at $V_0$

        Now $q$ is **inside** a spherical cavity of radius $R$ in a conductor, at distance $a<R$ from the center. The conductor is held at $V_0$.

        [[fig:set]]

        **Region of interest:** the cavity, $r\le R$. **Boundary conditions:**

        1. $V(R,\theta) = V_0$ for every $\theta$.

        That is all: infinity is not part of this region, so there is no condition there.

        **Images.** The same algebra as before with the roles swapped: the image goes **outside** the cavity (outside the region),

        $$q' = -\frac Raq\quad\text{at}\quad b = \frac{R^2}{a}>R .$$

        Now $|q'|>q$. The pair gives $V = 0$ on $r = R$; to raise it to $V_0$, add a constant. (A center charge would be inside the region; a constant is the right tool here.)

        $$V(r,\theta) = \frac{1}{4\pi\ep}\left(\frac{q}{\srm} - \frac{qR/a}{\srm'}\right) + V_0\qquad(r\le R).$$

        [[fig:img]]

        **Induced charge on the cavity wall:** $-q$, **not** $q'$. Take a Gaussian surface inside the metal: $\vb E = 0$ there, so it encloses zero charge, so the wall holds $-q$. The image is bigger than $-q$ because it only has to reproduce the field **inside** the cavity; Gauss's law on a surface through the image region tells you nothing about the real charge.

        **Force on $q$:** toward the nearest wall (toward the image),
        $$F = \frac{1}{4\pi\ep}\frac{q^2Ra}{(R^2-a^2)^2},$$
        **independent of $V_0$**: adding a constant to $V$ adds no field.

        **Outer surface.** Depends on what holds the conductor. Held at $V_0$ with outer radius $R_2$: $\sigma_{\text{out}} = \ep V_0/R_2$, uniform, total $4\pi\ep R_2V_0$. Isolated and neutral: total $+q$ on the outer surface, uniform (the cavity's details are shielded).
      `, {
        set: { svg: fShell({ lab: 'V=V_0' }), cap: md`A spherical cavity of radius $R$ in a conductor held at $V_0$; the charge $q$ is a distance $a$ from the cavity's center.` },
        img: { svg: fShellImg(), cap: md`The image for the inside problem lies outside the cavity, at $b = R^2/a$, and is larger than $q$.` },
      }),

      Q(md`$q$ is inside a spherical cavity (radius $R$), at distance $a<R$ from its center. Where is the image?`,
        [md`Outside the cavity, $-\dfrac Raq$ at $\dfrac{R^2}{a}$`, md`Inside the cavity, $-\dfrac aRq$ at $\dfrac{a^2}{R}$`, md`At the center, $-q$`, md`Outside, $-q$ at $2R-a$`], 0,
        [null,
          md`Inside the cavity is the region of interest; no image may go there.`,
          md`An image in the cavity changes $\rho$ in the region.`,
          md`That is a plane-mirror guess; the sphere's image follows $b = R^2/a$.`],
        md`Same Apollonius geometry with $a<R$: $b = R^2/a>R$ and $|q'| = \dfrac Raq>q$. The image is outside the region (the cavity), as it must be.`,
        { figHtml: fShell({ lab: 'V=V_0' }) }),

      Q(md`In that problem, what is the total charge induced on the cavity wall?`,
        [md`$-\dfrac Raq$, the image`, md`$-q$`, md`$0$`, md`It depends on $V_0$`], 1,
        [md`Gauss's law can't be applied through the image region; the image only reproduces the field inside the cavity.`,
          null,
          md`Then the field inside the metal near the wall wouldn't vanish.`,
          md`$V_0$ moves charge to the **outer** surface only.`],
        md`A Gaussian surface inside the metal surrounds the cavity and has $\vb E = 0$ on it, so the total enclosed is $0$: $q + Q_{\text{wall}} = 0$.`,
        { figHtml: fShell({ lab: 'V=V_0' }) }),

      Q(md`Does the value of $V_0$ change the force on $q$ inside the cavity?`,
        [md`Yes, the force grows with $V_0$`, md`Yes, it reverses for large $V_0$`, md`No: $V_0$ adds a constant to $V$ in the cavity, which has no gradient`, md`Only if $V_0$ has the same sign as $q$`], 2,
        [md`A constant potential exerts no force.`,
          md`Nothing in the cavity depends on $V_0$ except a constant shift of $V$.`,
          null,
          md`The sign of a constant doesn't matter either.`],
        md`Inside: $V = V_{\text{pair}} + V_0$, so $\vb E = -\nabla V_{\text{pair}}$, the same as for a grounded shell. Compare the outside problem, where $V_0$ enters through the center image and does change the force.`,
        { figHtml: fShell({ lab: 'V=V_0' }) }),

      Q(md`For the charge inside a cavity held at $V_0$, which boundary conditions define the problem?`,
        [md`$V(R,\theta) = V_0$ and $V\to0$ at infinity`, md`$V(R,\theta) = V_0$ only; the region is $r\le R$`, md`$V(R,\theta) = 0$ only`, md`Total charge on the wall $= -q$ only`], 1,
        [md`Infinity is not in the region $r\le R$.`,
          null,
          md`The wall is at $V_0$, not $0$.`,
          md`That is a consequence (Gauss), not the condition that fixes $V$.`],
        md`The region is bounded by the wall alone. One Dirichlet condition on the whole boundary fixes $V$ by uniqueness.`,
        { figHtml: fShell({ lab: 'V=V_0' }) }),

      Q(md`Which way is the force on $q$ inside the cavity (at distance $a$ from the center, $0<a<R$)?`,
        [md`Toward the center`, md`Zero, by symmetry`, md`Toward the nearest part of the wall`, md`It depends on $V_0$`], 2,
        [md`The image is outside, beyond the nearest wall, and attracts $q$ toward it.`,
          md`Only at $a = 0$.`,
          null,
          md`$V_0$ doesn't affect it.`],
        md`The induced charge crowds onto the nearest part of the wall and pulls $q$ there. $F = \dfrac{1}{4\pi\ep}\dfrac{q^2Ra}{(R^2-a^2)^2}$, outward, growing without bound as $a\to R$.`,
        { figHtml: fShell({ lab: 'V=V_0' }) }),

      Q(md`The conductor around the cavity is an isolated **neutral** thick shell (outer radius $R_2$), with $q$ inside the cavity. What is on the outer surface?`,
        [md`$+q$, uniformly spread`, md`$+q$, crowded on the side nearest $q$`, md`Nothing`, md`$-q$`], 0,
        [null,
          md`The metal shields the outside from the cavity's details; only the total gets through.`,
          md`The shell is neutral and the wall holds $-q$, so $+q$ must be somewhere: on the outer surface.`,
          md`Sign: the wall holds $-q$; neutrality puts $+q$ outside.`],
        md`Outer surface charge $+q$, uniform (a sphere with no outside charges has uniform $\sigma$). The field outside is $\dfrac{q}{4\pi\ep r^2}$ as if $q$ sat at the center.`,
        { figHtml: fShell({ lab: 'Q=0' }) }),

      P({
        title: 'A charge a third of the way to the wall',
        q: md`
          A charge $q$ is at $a = R/3$ from the center of a spherical cavity of radius $R$ in a conductor held at $V_0$.

          Find the image (size and position), the potential at the cavity's center, the force on $q$, and $\sigma$ on the cavity wall at the point nearest $q$.
        `,
        figHtml: fShell({ lab: 'V=V_0' }),
        hints: [
          md`BC: $V(R,\theta) = V_0$; region $r\le R$. Image $q' = -\dfrac Raq$ at $\dfrac{R^2}{a}$.`,
          md`$V$ inside $= V_{\text{pair}} + V_0$.`,
          md`On the wall the normal out of the metal points **into** the cavity, $-\uv r$: $\sigma = +\ep\dfrac{\partial V}{\partial r}\Big|_R$.`,
        ],
        parts: [
          { lbl: "q'", expr: '-3*q', vars: { q: [0.5, 3] } },
          { lbl: 'b', expr: '3*R', vars: { R: [0.5, 2] } },
          { lbl: md`$V(0)$`, expr: 'q/(2*pi*eps0*R) + V0', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 2], V0: [0.5, 3] }, accepts: ['2*q/(4*pi*eps0*R) + V0'] },
          { lbl: md`$|F|$ in units of $\dfrac{q^2}{4\pi\ep R^2}$`, ans: 0.421875, unit: '' },
          { lbl: md`$\sigma$ at the nearest point, units $q/R^2$`, ans: -0.23873, unit: '' },
        ],
        sol: md`
          **Region** $r\le R$. **BC:** 1. $V(R,\theta) = V_0$.

          **Image.** $q' = -\dfrac{R}{R/3}q = -3q$ at $b = \dfrac{R^2}{R/3} = 3R$.

          [[fig:img]]

          **Center.** $V(0) = \dfrac{1}{4\pi\ep}\left(\dfrac{q}{R/3} - \dfrac{3q}{3R}\right) + V_0 = \dfrac{2q}{4\pi\ep R} + V_0$.

          **Force.** $q'$ is $3R - \tfrac R3 = \tfrac83R$ away: $|F| = \dfrac{3q^2}{4\pi\ep(8R/3)^2} = \dfrac{27}{64}\dfrac{q^2}{4\pi\ep R^2}\approx0.422$, toward the nearest wall. Formula check: $\dfrac{Ra}{(R^2-a^2)^2} = \dfrac{R^2/3}{(8R^2/9)^2} = \dfrac{27}{64R^2}$ ✓.

          **Surface charge.** The normal pointing out of the metal into the field region is $-\uv r$, so $\sigma = \ep\dfrac{\partial V}{\partial r}\Big|_R$. This gives

          $$\sigma(\theta) = -\frac{q\,(R^2-a^2)}{4\pi R\,(R^2+a^2-2aR\cos\theta)^{3/2}},$$

          and at $\theta = 0$: $-\dfrac{q(R+a)}{4\pi R(R-a)^2} = -\dfrac{q\cdot\frac43R}{4\pi R\cdot\frac49R^2} = -\dfrac{3q}{4\pi R^2}\approx-0.239\,\dfrac{q}{R^2}$. Integrated over the wall it gives $-q$ ✓.
        `,
        figs: { img: { svg: fShellImg({ qp: "q' = -3q", bLab: 'b = 3R' }), cap: md`$q$ at $R/3$ and its image $-3q$ at $3R$.` } },
      }),

      RF(md`
        ### Twist 5: a sphere in a uniform field

        Griffiths Ex. 3.8 (solved by separation of variables in [Unit 8](#/l/u7-field)) also has an image solution. Make the uniform field $E_0\uv z$ with two far charges: $-Q$ at $z = D$ and $+Q$ at $z = -D$, with $\dfrac{2Q}{4\pi\ep D^2} = E_0$, and let $D\to\infty$. Their images are $+\dfrac RDQ$ at $z = +\dfrac{R^2}{D}$ and $-\dfrac RDQ$ at $z = -\dfrac{R^2}{D}$. Together the images form a dipole of moment
        $$p = \frac RDQ\cdot\frac{2R^2}{D} = 4\pi\ep R^3E_0\quad(\text{along } +\uv z).$$

        So a grounded sphere in a uniform field is the uniform field plus a point dipole at the center:

        $$V(r,\theta) = -E_0\left(r - \frac{R^3}{r^2}\right)\cos\theta,\qquad \sigma(\theta) = 3\ep E_0\cos\theta .$$

        **Region:** $r\ge R$. **Boundary conditions:**

        1. $V(R,\theta) = 0$.
        2. $V\to-E_0r\cos\theta$ as $r\to\infty$ (not $0$: the applied field is still there).

        The induced charge is $+$ on top, $-$ on the bottom, total $0$, so "grounded" and "isolated neutral" are the same here (with the zero of $V$ on the equatorial plane). Holding the sphere at $V_0$ adds $\dfrac{RV_0}{r}$ (a center charge $4\pi\ep RV_0$): $\sigma$ gains $\dfrac{\ep V_0}{R}$. A point charge near the sphere in the field: just superpose its image system.
      `),

      Q(md`A grounded sphere sits in a uniform field $E_0\uv z$. What is the boundary condition far away?`,
        [md`$V\to0$`, md`$V\to-E_0r\cos\theta$`, md`$V\to E_0r\cos\theta$`, md`$\vb E\to0$`], 1,
        [md`The applied field never dies; $V$ grows linearly with $z$.`,
          null,
          md`Sign: $\vb E = -\nabla V = E_0\uv z$ needs $V = -E_0z$.`,
          md`The field approaches $E_0\uv z$, not zero.`],
        md`Far away the sphere's effect (a dipole, $\propto1/r^2$) dies, leaving the applied field: $V\to-E_0z = -E_0r\cos\theta$.`,
        { figHtml: fSphField({ lab: 'V=0' }) }),

      Q(md`For the grounded sphere in $E_0\uv z$, where is $|\sigma|$ largest, and what is the field just outside there?`,
        [md`At the equator; $E_0$`, md`Uniform; $3E_0$`, md`At the poles; $2E_0$`, md`At the poles; $3E_0$`], 3,
        [md`$\sigma = 3\ep E_0\cos\theta$ vanishes on the equator.`,
          md`$\sigma\propto\cos\theta$ is not uniform.`,
          md`The dipole adds $2E_0$ at the poles to the applied $E_0$.`,
          null],
        md`$\sigma = 3\ep E_0\cos\theta$, largest at $\theta = 0,\pi$. Just outside, $E = \sigma/\ep = 3E_0$: the sphere triples the field at its poles.`,
        { figHtml: fSphField({ lab: 'V=0' }) }),

      Q(md`In a uniform field, a grounded sphere and an isolated neutral sphere (centered where the applied $V$ is $0$) have`,
        [md`the same solution`, md`different induced dipoles`, md`different total charges`, md`different $\sigma$, since one is grounded`], 0,
        [null,
          md`The dipole $4\pi\ep R^3E_0$ is the same: it comes from the same conditions.`,
          md`The grounded sphere's induced charge totals zero by up–down antisymmetry.`,
          md`Same conditions, same $\sigma$.`],
        md`$\sigma = 3\ep E_0\cos\theta$ integrates to zero, and the sphere's potential is $0$: it satisfies both "grounded" and "neutral". Unlike a point charge, a uniform field pulls up as much charge as it pushes down.`,
        { figHtml: fSphField({ lab: 'V=0' }) }),

      Q(md`What is the induced dipole moment of a conducting sphere in a uniform field $E_0$?`,
        [md`$4\pi\ep RE_0$`, md`$4\pi\ep R^3E_0$, along $\vb E_0$`, md`$4\pi\ep R^3E_0$, opposite to $\vb E_0$`, md`$\tfrac43\pi R^3\ep E_0$`], 1,
        [md`Units: a dipole is charge × length, $\ep E_0R^3$.`,
          null,
          md`Positive charge is pushed to the top: the dipole points along the field.`,
          md`Wrong factor: from $V_{\text{dip}} = \dfrac{p\cos\theta}{4\pi\ep r^2} = \dfrac{E_0R^3\cos\theta}{r^2}$.`],
        md`Match $+E_0\dfrac{R^3}{r^2}\cos\theta$ with $\dfrac{p\cos\theta}{4\pi\ep r^2}$: $p = 4\pi\ep R^3E_0$.`,
        { figHtml: fSphField({ lab: 'V=0' }) }),

      P({
        title: 'A sphere at V0 in a uniform field',
        q: md`
          A conducting sphere of radius $R$ is held at $V_0$ in a uniform field $E_0\uv z$ (with $V = 0$ on the plane $z = 0$ far away).

          Find the total charge on the sphere, and for $V_0 = E_0R$ the angle $\theta_0$ where $\sigma = 0$ (in degrees).
        `,
        figHtml: fSphField({ lab: 'V=V_0' }),
        hints: [
          md`BCs: $V(R,\theta) = V_0$; $V\to-E_0r\cos\theta$ far away.`,
          md`Grounded solution plus $\dfrac{RV_0}{r}$.`,
          md`$\sigma = -\ep\,\partial V/\partial r$ at $R$.`,
        ],
        parts: [
          { lbl: 'Q_s', expr: '4*pi*eps0*R*V0', vars: { eps0: [0.5, 2], R: [0.5, 2], V0: [0.5, 3] } },
          { lbl: md`$\theta_0$ (degrees)`, ans: 109.47, unit: '°' },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs:** 1. $V(R,\theta) = V_0$. 2. $V\to-E_0r\cos\theta$.

          $$V = -E_0\left(r-\frac{R^3}{r^2}\right)\cos\theta + \frac{RV_0}{r}.$$

          BC 1: at $r = R$ the first term vanishes and the second is $V_0$ ✓. BC 2: both added terms die ✓.

          $$\sigma = -\ep\frac{\partial V}{\partial r}\bigg|_R = 3\ep E_0\cos\theta + \frac{\ep V_0}{R}.$$

          **Total:** the $\cos\theta$ part integrates to $0$; the uniform part gives $Q_s = 4\pi R^2\cdot\dfrac{\ep V_0}{R} = 4\pi\ep RV_0$.

          **Zero of $\sigma$:** $\cos\theta_0 = -\dfrac{V_0}{3E_0R} = -\dfrac13$, $\theta_0\approx109.5^\circ$. The positive region has grown past the equator.
        `,
      }),

      RF(md`
        ### Twist 6: several charges

        The problem is linear. With charges $q_1, q_2,\dots$ outside a grounded sphere, each gets its own image $-\dfrac{R}{a_i}q_i$ at $\dfrac{R^2}{a_i}$ along its own direction. The total induced charge is the sum of the images. Then add center charges for $V_0$ / neutral / $Q$ exactly as before, using the **total** grounded induced charge.

        Forces: the force on $q_1$ includes the other **real** charges, all the images (including $q_2$'s image), and any center charge.
      `),

      Q(md`Two charges $q_1$ (at $a_1$) and $q_2$ (at $a_2$) near a grounded sphere. The total induced charge is`,
        [md`$-(q_1+q_2)$`, md`$-\dfrac{R}{a_1+a_2}(q_1+q_2)$`, md`$-R\left(\dfrac{q_1}{a_1}+\dfrac{q_2}{a_2}\right)$`, md`$0$`], 2,
        [md`That is the plane result.`,
          md`Each charge's image depends on its own distance.`,
          null,
          md`Grounded spheres generally carry net charge.`],
        md`Images superpose. Check with the center potential: $0 = \dfrac{q_1}{4\pi\ep a_1} + \dfrac{q_2}{4\pi\ep a_2} + \dfrac{Q_{\text{ind}}}{4\pi\ep R}$.`,
        { figHtml: fSphTwo({ same: true }) }),

      Q(md`$+q$ at $z = 2R$ and $-q$ at $z = -2R$, outside a sphere centered at the origin. Which statement is right?`,
        [md`The grounded and the isolated-neutral answers are the same`, md`The grounded sphere carries charge $-q$`, md`The images are both negative`, md`The sphere is at potential $\dfrac{q}{4\pi\ep\cdot2R}$`], 0,
        [null,
          md`The images $-q/2$ and $+q/2$ cancel: total $0$.`,
          md`$-q$ gets a positive image.`,
          md`By antisymmetry the center (and sphere) is at $V = 0$.`],
        md`The images add to zero, so the grounded sphere is already neutral; no center charge is needed in either case.`,
        { figHtml: fSphTwo() }),

      P({
        title: 'Two opposite charges near a grounded sphere',
        q: md`
          A grounded conducting sphere of radius $R$ at the origin; $+q$ at $z = 2R$ and $-q$ at $z = -2R$.

          Find the total induced charge and the $z$-component of the force on $+q$ (units $\dfrac{q^2}{4\pi\ep R^2}$).
        `,
        figHtml: fSphTwo(),
        hints: [
          md`Images: $-\dfrac q2$ at $z = \dfrac R2$ (for $+q$) and $+\dfrac q2$ at $z = -\dfrac R2$ (for $-q$).`,
          md`Forces on $+q$: from $-q$ (distance $4R$), from $-\tfrac q2$ (distance $\tfrac32R$), from $+\tfrac q2$ (distance $\tfrac52R$).`,
        ],
        parts: [
          { lbl: md`Total induced charge`, ans: 0, unit: '' },
          { lbl: 'F_z', ans: -0.20472, unit: '' },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs:** 1. $V(R,\theta) = 0$. 2. $V\to0$.

          **Images:** each charge gets its own. Sum $-\tfrac q2 + \tfrac q2 = 0$: the sphere stays neutral.

          [[fig:img]]

          **Force on $+q$** at $z = 2R$ (all along $z$, units $\dfrac{q^2}{4\pi\ep R^2}$):

          - real $-q$ at $-2R$: attraction, $-\dfrac{1}{16}$;
          - image $-\tfrac q2$ at $\tfrac R2$: attraction, $-\dfrac{1/2}{9/4} = -\dfrac29$;
          - image $+\tfrac q2$ at $-\tfrac R2$: repulsion, $+\dfrac{1/2}{25/4} = +\dfrac{2}{25}$.

          $F_z = -\dfrac1{16} - \dfrac29 + \dfrac2{25} = -\dfrac{737}{3600}\approx-0.205$: toward the sphere.
        `,
        figs: { img: { svg: fSphTwoImg(), cap: md`Each real charge with its own image.` } },
      }),

      RF(md`
        ### Energy: grounded versus fixed $V_0$

        **Grounded.** The work you do to bring $q$ in from infinity is $W = -\displaystyle\int_\infty^a F\,da'$:

        $$W = \frac{1}{4\pi\ep}\int_\infty^a\frac{q^2Ra'}{(a'^2-R^2)^2}da' = -\frac{1}{4\pi\ep}\frac{q^2R}{2(a^2-R^2)} = \frac12\,q\,V_{\text{image}}(q).$$

        Half of "$q$ times the image's potential at $q$", for the same reason as the plane: the images move as $q$ moves, so you are not assembling two fixed charges.

        **Held at $V_0$.** Now three quantities differ, and an exam must say which it wants:

        1. **Work you do** on $q$ (against the force, battery connected):
        $$W_{\text{you}} = \frac{qRV_0}{a} - \frac{1}{4\pi\ep}\frac{q^2R}{2(a^2-R^2)}.$$
        The first term is pushing $q$ against the center image $q_0$ (fixed, since $V_0$ is fixed).
        2. **Work done by the battery:** as $q$ arrives, the sphere's charge changes by $\Delta Q = -\dfrac Raq$ at potential $V_0$: $W_{\text{bat}} = V_0\Delta Q = -\dfrac{qRV_0}{a}$ (charge flows back into the battery; it gains energy).
        3. **Change in electrostatic energy** (excluding $q$'s infinite self-energy): $\Delta U = W_{\text{you}} + W_{\text{bat}} = -\dfrac{1}{4\pi\ep}\dfrac{q^2R}{2(a^2-R^2)}$, the same as grounded.

        !!trap "The energy" with a battery
          With $V_0$ fixed the field energy is not the work you do: the battery exchanges energy too. If asked for the work to bring $q$ in, give $W_{\text{you}}$. Never use $W = \tfrac12qV$ alone when a battery is connected.
      `),

      Q(md`For a grounded sphere, the work to bring $q$ from infinity to $a$ is`,
        [md`$q\,V_{\text{image}}(q)$`, md`$\tfrac12\,q\,V_{\text{image}}(q)$`, md`$2\,q\,V_{\text{image}}(q)$`, md`$0$, since the sphere is at $V = 0$`], 1,
        [md`That would be bringing $q$ near a **fixed** charge $q'$. The image moves and grows as $q$ comes in.`,
          null,
          md`The factor is $\tfrac12$, not $2$.`,
          md`$q$ is attracted the whole way in; the work is negative.`],
        md`$W = -\dfrac{1}{4\pi\ep}\dfrac{q^2R}{2(a^2-R^2)}$, while $qV_{\text{image}}(q) = -\dfrac{1}{4\pi\ep}\dfrac{q^2R}{a^2-R^2}$.`,
        { figHtml: fSph({ A: 3, lab: 'V=0', ground: true }) }),

      Q(md`With the sphere held at $V_0$ by a battery, you bring $q$ in from infinity. Which statement is right?`,
        [md`The work you do equals the change in field energy`, md`The battery does no work since $V_0$ is constant`, md`The battery does work $V_0\Delta Q$ because the sphere's charge changes at fixed potential`, md`The work you do is $\tfrac12qV_0$`], 2,
        [md`They differ by the battery's work.`,
          md`Moving charge $\Delta Q$ onto a conductor at $V_0$ costs (or returns) $V_0\Delta Q$.`,
          null,
          md`$V_0$ is the sphere's potential, not the potential at $q$, and the battery also exchanges energy; the work you do is $\dfrac{qRV_0}{a} - \dfrac{1}{4\pi\ep}\dfrac{q^2R}{2(a^2-R^2)}$.`],
        md`$\Delta Q = -\dfrac Raq$: the battery takes back charge and gains $\dfrac{qRV_0}{a}$. Energy bookkeeping: $W_{\text{you}} + W_{\text{bat}} = \Delta U$.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      Q(md`As $q$ (positive) is brought toward a sphere held at $V_0>0$, the sphere's charge`,
        [md`increases`, md`decreases by $\dfrac Raq$`, md`stays $4\pi\ep RV_0$`, md`drops to zero`], 1,
        [md`The induced part is negative for positive $q$.`,
          null,
          md`That is its charge with $q$ far away.`,
          md`Only if $4\pi\ep RV_0 = \dfrac Raq$.`],
        md`$Q_s = 4\pi\ep RV_0 - \dfrac Raq$: the battery pulls positive charge off the sphere as $q$ approaches, keeping $V$ at $V_0$.`,
        { figHtml: fSph({ A: 3, lab: 'V=V_0' }) }),

      P({
        title: 'Energy bookkeeping with a battery',
        q: md`
          A conducting sphere of radius $R$; a charge $q$ is brought from infinity to $a = 2R$.

          (a) Sphere grounded: the work you do. (b) Sphere held at $V_0 = \dfrac{q}{4\pi\ep R}$: the work you do, the work done by the battery, and the change in electrostatic energy. Give all in units of $\dfrac{q^2}{4\pi\ep R}$.
        `,
        figHtml: fSph({ A: 2, lab: 'V=V_0' }),
        hints: [
          md`Grounded: $W = -\dfrac{1}{4\pi\ep}\dfrac{q^2R}{2(a^2-R^2)}$.`,
          md`$V_0$: $W_{\text{you}} = \dfrac{qRV_0}{a} + (\text{grounded } W)$; $W_{\text{bat}} = V_0\Delta Q$ with $\Delta Q = -\dfrac Raq$.`,
        ],
        parts: [
          { lbl: md`(a) $W$`, ans: -0.16667, unit: '' },
          { lbl: md`(b) $W_{\text{you}}$`, ans: 0.33333, unit: '' },
          { lbl: md`(b) $W_{\text{bat}}$`, ans: -0.5, unit: '' },
          { lbl: md`(b) $\Delta U$`, ans: -0.16667, unit: '' },
        ],
        sol: md`
          **(a)** $W = -\dfrac{R}{2(4R^2-R^2)}\cdot\dfrac{q^2}{4\pi\ep} = -\dfrac{1}{6}\dfrac{q^2}{4\pi\ep R}$.

          **(b)** $q_0 = 4\pi\ep RV_0 = q$. Pushing $q$ in against $q_0$ costs $\dfrac{q\,q_0}{4\pi\ep a} = \dfrac{q^2}{4\pi\ep\cdot2R}$, i.e. $\tfrac12$. So $W_{\text{you}} = \tfrac12 - \tfrac16 = \tfrac13$.

          Battery: $\Delta Q = -\dfrac q2$ at $V_0 = \dfrac{q}{4\pi\ep R}$: $W_{\text{bat}} = -\tfrac12$.

          $\Delta U = \tfrac13 - \tfrac12 = -\tfrac16$, equal to the grounded result.

          **Why.** The center charge's energy and the battery's exchange cancel: the stored energy change only involves $q$ and its induced image part.
        `,
      }),

      RF(md`
        ### Exam-style mixed set

        The recipe, every time:

        1. Region of interest (outside or inside the sphere).
        2. Boundary conditions, numbered: the condition on the sphere (grounded / $V_0$ / isolated with $Q$), the condition at infinity (only if infinity is in the region; $0$ or $-E_0r\cos\theta$).
        3. Images: the grounded image $-\dfrac Raq$ at $\dfrac{R^2}{a}$, plus a center charge (outside problem) or a constant (inside problem).
        4. Check every BC, and that every image is outside the region.
        5. Then $V$, $\sigma = -\ep\,\partial V/\partial n$, total charge (Gauss), force (images on $q$).
      `),

      Q(md`Which words go with which condition on the sphere? "grounded", "held at $V_0$", "isolated and neutral", "carries charge $Q$"`,
        [md`$V = 0$; $V = V_0$; $V$ const & total $0$; $V$ const & total $Q$`, md`$V = 0$; total $4\pi\ep RV_0$; $V = 0$; $V = \dfrac{Q}{4\pi\ep R}$`, md`$Q = 0$; $V = V_0$; $V = 0$; total $Q$`, md`$V = 0$; $V = V_0$; $V = 0$ & total $0$; $V$ const`], 0,
        [null,
          md`Held at $V_0$ fixes $V$, not $Q$; isolated neutral fixes $Q$, not $V$.`,
          md`Grounded fixes $V = 0$, not $Q = 0$.`,
          md`A neutral isolated sphere floats; it isn't at $V = 0$ in general, and fixing both would over-determine the problem.`],
        md`Each conductor gets **one** condition: either its potential (grounded, held at $V_0$) or its total charge (isolated). The other comes out of the solution.`,
        { figHtml: fSph({ A: 3, lab: 'V=?' }) }),

      Q(md`In the **inside** problem (charge in a cavity held at $V_0$), why do you add a constant $V_0$ instead of a charge at the center?`,
        [md`A center charge would be inside the region of interest`, md`Because constants are simpler`, md`A center charge doesn't change $V$ on the sphere`, md`Both work equally`], 0,
        [null,
          md`It's not about simplicity; a center charge is forbidden there.`,
          md`It would change $V$ on the sphere by a constant, but it would also put charge in the cavity.`,
          md`A charge at the center of the cavity changes $\rho$ in the region.`],
        md`Outside problem: the center is outside the region, so a center charge is allowed and it adds a constant on the sphere. Inside problem: the center is in the region, but a constant is a valid solution of Laplace's equation there, so add $V_0$ directly.`,
        { figHtml: fShell({ lab: 'V=V_0' }) }),

      P({
        title: 'Exam-style: a sphere at V0, charge at 3R',
        big: true,
        q: md`
          A conducting sphere of radius $R$ is held at potential $V_0$. A point charge $q$ is at distance $a = 3R$ from its center.

          (a) Find the images. (b) Find $V_0$ for which the force on $q$ is zero. (c) Find the total charge on the sphere at that $V_0$. (d) Find $\sigma$ at the point nearest $q$ at that $V_0$. (e) Is the equilibrium stable?
        `,
        figHtml: fSph({ A: 3, lab: 'V=V_0' }),
        hints: [
          md`Write the BCs first: region $r\ge R$; $V(R,\theta) = V_0$; $V\to0$.`,
          md`Images: $-\dfrac q3$ at $\dfrac R3$, and $4\pi\ep RV_0$ at the center.`,
          md`$\sigma(0) = \sigma_g(0) + \dfrac{\ep V_0}{R}$ with $\sigma_g(0) = -\dfrac{q(a+R)}{4\pi R(a-R)^2}$.`,
        ],
        parts: [
          { lbl: md`(a) $q'$`, expr: '-q/3', vars: { q: [0.5, 3] } },
          { lbl: md`(b) $V_0$`, expr: '27*q/(256*pi*eps0*R)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 2] }, accepts: ['(27/64)*q/(4*pi*eps0*R)'] },
          { lbl: md`(c) $Q_s$`, expr: '17*q/192', vars: { q: [0.5, 3] } },
          { lbl: md`(d) $\sigma(0)$ in units of $q/R^2$`, ans: -0.046006, unit: '' },
          { lbl: md`(e) The equilibrium is`, mc: [md`stable`, md`unstable`, md`neutral`], a: 1, why: [md`$dF/da>0$ at the balance: displacements grow.`, null, md`The force depends on $a$.`] },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs:** 1. $V(R,\theta) = V_0$. 2. $V\to0$ as $r\to\infty$.

          **(a)** $q' = -\dfrac q3$ at $b = \dfrac R3$; $q_0 = 4\pi\ep RV_0$ at the center. Check: on the sphere $q$ and $q'$ cancel ($\srm' = \srm/3$) and $q_0$ adds $V_0$ ✓; all images inside ✓.

          [[fig:img]]

          **(b)** Units $\dfrac{q}{4\pi\ep R^2}$: $\dfrac{q_0}{9} - q\dfrac{3}{64} = 0\Rightarrow q_0 = \dfrac{27}{64}q$, so $V_0 = \dfrac{27}{64}\dfrac{q}{4\pi\ep R} = \dfrac{27q}{256\pi\ep R}$.

          **(c)** $Q_s = \dfrac{27}{64}q - \dfrac13q = \dfrac{81-64}{192}q = \dfrac{17}{192}q$.

          **(d)** $\sigma_g(0) = -\dfrac{4R\,q}{4\pi R\cdot4R^2} = -\dfrac{q}{4\pi R^2}$; uniform part $\dfrac{\ep V_0}{R} = \dfrac{27}{64}\cdot\dfrac{q}{4\pi R^2}$. Total $-\dfrac{37}{64}\cdot\dfrac{q}{4\pi R^2}\approx-0.0460\,\dfrac{q}{R^2}$: still negative facing $q$.

          **(e)** Unstable: $\dfrac{dF}{da} = \dfrac{q^2R(a^2+3R^2)}{4\pi\ep(a^2-R^2)^3}>0$.
        `,
        figs: { img: { svg: fSphImg({ A: 3, center: 'q_0' }), cap: md`$q' = -q/3$ at $R/3$ and $q_0$ at the center.` } },
      }),

      P({
        title: 'Exam-style: a charge in a neutral thick shell',
        q: md`
          A neutral, isolated conducting shell has inner radius $R$ and outer radius $2R$. A charge $q$ is at $a = R/2$ from the center.

          Find the shell's potential, the potential at the center of the cavity, and the force on $q$.
        `,
        figHtml: fShell({ A: 0.5, lab: 'Q=0', r2Lab: '2R' }),
        hints: [
          md`Gauss: the inner wall holds $-q$, so the outer surface holds $+q$, uniformly.`,
          md`Shell potential: from outside it looks like $q$ at the center, at radius $2R$.`,
          md`Inside: $V = V_{\text{pair}} + V_{\text{shell}}$ with image $-2q$ at $2R$.`,
        ],
        parts: [
          { lbl: 'V_{\\text{shell}}', expr: 'q/(8*pi*eps0*R)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 2] }, accepts: ['q/(4*pi*eps0*2*R)'] },
          { lbl: md`$V(0)$ in units of $\dfrac{q}{4\pi\ep R}$`, ans: 1.5, unit: '' },
          { lbl: md`$|F|$ in units of $\dfrac{q^2}{4\pi\ep R^2}$`, ans: 0.88889, unit: '' },
        ],
        sol: md`
          **Outside** ($r\ge2R$). BCs: total charge $0$ on the shell, $V\to0$. The outer surface holds $+q$ uniformly, so $V = \dfrac{q}{4\pi\ep r}$ and $V_{\text{shell}} = \dfrac{q}{4\pi\ep\cdot2R} = \dfrac{q}{8\pi\ep R}$.

          **Inside** (region $r\le R$). BC: $V(R,\theta) = V_{\text{shell}}$. Image: $-\dfrac{R}{R/2}q = -2q$ at $b = 2R$. $V = V_{\text{pair}} + V_{\text{shell}}$.

          **Center** (units $\dfrac{q}{4\pi\ep R}$): $\dfrac{1}{1/2} - \dfrac{2}{2} + \dfrac12 = 2 - 1 + \dfrac12 = \dfrac32$.

          **Force:** $\dfrac{2q\cdot q}{4\pi\ep(2R-R/2)^2} = \dfrac{2}{9/4} = \dfrac89$, toward the nearest wall. ($V_{\text{shell}}$ doesn't enter.)
        `,
      }),

      P({
        title: 'Exam-style: a charge, a sphere and a uniform field',
        q: md`
          A grounded conducting sphere of radius $R$ sits in a uniform field $E_0\uv z$. A point charge $q>0$ is on the $z$-axis at $a = 2R$ (above the sphere). Find $E_0$ such that the net force on $q$ is zero.
        `,
        figHtml: fSphField({ lab: 'V=0', q: true }),
        hints: [
          md`Superpose: (uniform field + its induced dipole $p = 4\pi\ep R^3E_0$) and ($q$ + its image).`,
          md`On the axis above a dipole $p\uv z$: $E = \dfrac{2p}{4\pi\ep a^3}$.`,
          md`Image force: $-\dfrac{1}{4\pi\ep}\dfrac{q^2Ra}{(a^2-R^2)^2}$.`,
        ],
        parts: [
          { lbl: 'E_0', expr: '8*q/(45*4*pi*eps0*R^2)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 2] }, accepts: ['2*q/(45*pi*eps0*R^2)'] },
        ],
        sol: md`
          **Region** $r\ge R$. **BCs:** 1. $V(R,\theta) = 0$. 2. $V\to-E_0r\cos\theta$ far away.

          **Solution by superposition.** The field part ($-E_0r\cos\theta$ plus the dipole $4\pi\ep R^3E_0\uv z$) satisfies BC 1 alone and BC 2. The charge part ($q$ plus $-\dfrac q2$ at $\dfrac R2$) gives $0$ on the sphere and dies at infinity. Sum: both BCs ✓.

          **Force on $q$** (upward positive):

          - applied field: $qE_0$;
          - induced dipole at $a = 2R$: $q\cdot\dfrac{2\cdot4\pi\ep R^3E_0}{4\pi\ep(2R)^3} = \dfrac{qE_0}{4}$;
          - image: $-\dfrac{1}{4\pi\ep}\dfrac{q^2\cdot2R^2}{(3R^2)^2} = -\dfrac{2}{9}\dfrac{q^2}{4\pi\ep R^2}$.

          Zero: $\dfrac54qE_0 = \dfrac29\dfrac{q^2}{4\pi\ep R^2}\Rightarrow E_0 = \dfrac{8}{45}\dfrac{q}{4\pi\ep R^2}$.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Grounded sphere, $q$ outside at $a$: image $-\dfrac Raq$ at $\dfrac{R^2}{a}$. BCs: $V(R) = 0$, $V\to0$.
          - Held at $V_0$: add $4\pi\ep RV_0$ at the center. Total charge $4\pi\ep RV_0 - \dfrac Raq$. $\sigma$ gains a uniform $\ep V_0/R$.
          - Isolated with $Q$ (neutral: $Q = 0$): center charge $Q + \dfrac Raq$; potential $\dfrac{Q}{4\pi\ep R} + \dfrac{q}{4\pi\ep a}$.
          - Force on $q$ $= \dfrac{q}{4\pi\ep}\left[\dfrac{q_c}{a^2} - \dfrac{qRa}{(a^2-R^2)^2}\right]$. Like-charged spheres repel far, attract close; the balance point is unstable.
          - Charge inside a cavity: image $-\dfrac Raq$ **outside** at $\dfrac{R^2}{a}$; add the constant $V_0$; induced charge on the wall is $-q$; the force doesn't depend on $V_0$; no condition at infinity.
          - Uniform field: $V = -E_0(r - R^3/r^2)\cos\theta$, $\sigma = 3\ep E_0\cos\theta$, dipole $4\pi\ep R^3E_0$. BC at infinity is $-E_0r\cos\theta$.
          - Several charges: one image each; add them.
          - Energy: grounded $W = \tfrac12qV_{\text{image}}$. With a battery, the work you do, the battery's work, and $\Delta U$ all differ.
      `),
    ],
  });


  C.unit({
    id: 'uP', num: 'Unit P', title: 'Past-exam patterns',
    blurb: 'Three problem types from a past Hour Exam I, drilled: E to rho with delta functions at the origin, Gauss for superposed spheres and cylinders, and sphere images with a fixed potential.',
    lessons: LESSONS,
  });
})();

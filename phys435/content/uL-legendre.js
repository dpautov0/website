/* Unit L — Legendre polynomials: direct problems
   (Griffiths 3.3.2). A drill unit that follows Unit 8:
   computing P_ℓ, Legendre's equation, orthogonality, expansions, and direct sphere problems. */
(function () {
  'use strict';
  const { RF, P, Q, G } = C;
  const DG = Math.PI / 180;
  // P_ℓ(x) for any ℓ, by the recurrence (ℓ+1)P_{ℓ+1} = (2ℓ+1)xP_ℓ − ℓP_{ℓ−1}
  const Pl = (l, x) => { if (l === 0) return 1; let a = 1, b = x; for (let k = 1; k < l; k++) { const c = ((2 * k + 1) * x * b - k * a) / (k + 1); a = b; b = c; } return b; };
  // screen point at polar angle th (degrees from +z = up, turning toward +x = right) on a circle of screen radius rr
  const at = (cx, cy, rr, th) => [cx + rr * Math.sin(th * DG), cy - rr * Math.cos(th * DG)];

  // ---------------------------------------------------------------- label helpers
  // label beside the segment p->q at fraction t, pushed off the line along its normal (side +1 = left of p->q on screen)
  function labLine(f, p, q, tex, side = 1, gap = 5, t = 0.5, cls = 'small') {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1;
    const nx = (dy / L) * side, ny = (-dx / L) * side;
    const sz = PF.texSize(tex), hw = (sz.w - 8) / 2, hh = (sz.h - 6) / 2;
    const D = Math.abs(nx) * hw + Math.abs(ny) * hh + gap;
    const mx = p[0] + dx * t, my = p[1] + dy * t;
    f.label(mx + nx * D, my + ny * D, tex, 'c', cls);
  }
  // + / − glyphs drawn as strokes (not labels)
  function sgn(f, x, y, s, h = 3.4) {
    f.line(x - h, y, x + h, y, { cls: 'glyph' });
    if (s > 0) f.line(x, y - h, x, y + h, { cls: 'glyph' });
  }
  // short leader from the surface (polar angle th) to a label outside a circle of radius rr
  function leader(f, cx, cy, rr, th, tex, len = 16, cls = '') {
    const [x0, y0] = at(cx, cy, rr + 2, th), [x1, y1] = at(cx, cy, rr + len, th);
    f.line(x0, y0, x1, y1, { cls: 'dim thin' });
    const right = Math.sin(th * DG) >= 0;
    const x2 = x1 + (right ? 8 : -8);
    f.line(x1, y1, x2, y1, { cls: 'dim thin' });
    f.label(x2 + (right ? 4 : -4), y1, tex, right ? 'l' : 'r', cls);
    const w = PF.texSize(tex).w, slack = w * 0.15 + 6;
    f.track(x2 + (right ? 4 + w + slack : -4 - w - slack), y1);
  }
  function zAxis(f, cx, y0, y1, lab = 'z') {
    f.line(cx, y0, cx, y1, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(cx + 6, y1 + 2, lab, 'l', 'small accent');
  }
  // polar angle mark between the +z axis and the ray at polar angle th (deg; negative = left side)
  function thetaMark(f, cx, cy, th, r = 15, tex = '\\theta') {
    const a0 = 90 - th, a1 = 90;
    f.arc(cx, cy, r, Math.min(a0, a1), Math.max(a0, a1), { cls: 'dim' });
    const am = ((a0 + a1) / 2) * DG, sz = PF.texSize(tex);
    const D = r + 3 + Math.max(sz.w - 8, sz.h - 6) / 2 + 2;
    f.label(cx + D * Math.cos(am), cy - D * Math.sin(am), tex, 'c', 'small');
  }

  // ---------------------------------------------------------------- the sphere figure
  // o: rr, lab/labTh, lab2/lab2Th, lab3/lab3Th (leaders to surface conditions), arcs [[th0, th1, cls]] (polar degrees),
  //    R (false = no radius), Rth, inLab/inX/inY, Pin/Pout {f, th, lab, at}, mark {th, lab, r}, circles [[f, cls]]
  function sph(o = {}) {
    const f = PF.fig();
    const rr = o.rr || 62;
    if (o.arcs) o.arcs.forEach(([a0, a1, cls]) => f.pl(f.arcPts(0, 0, rr, rr, 90 - a0, 90 - a1), { cls }));
    else f.circle(0, 0, rr, { cls: 'thick' });
    for (const [k, cls] of (o.circles || [])) f.circle(0, 0, rr * k, { cls: cls || 'dash dim' });
    if (o.axis !== false) zAxis(f, 0, 0, -rr - (o.axisLen ?? 34));
    if (o.R !== false) {
      const th = o.Rth ?? 225;
      const e = at(0, 0, rr, th);
      f.line(0, 0, e[0], e[1], { cls: 'dim', arrow: 'end', hs: 6 });
      labLine(f, [0, 0], e, o.Rlab || 'R', th < 180 ? 1 : -1, 4, 0.55);
    }
    if (o.lab) leader(f, 0, 0, rr, o.labTh ?? 42, o.lab, o.labLen ?? 16);
    if (o.lab2) leader(f, 0, 0, rr, o.lab2Th ?? 138, o.lab2, o.labLen ?? 16);
    if (o.lab3) leader(f, 0, 0, rr, o.lab3Th ?? 90, o.lab3, o.labLen ?? 16);
    for (const key of ['Pin', 'Pout']) {
      const p0 = o[key];
      if (!p0) continue;
      const p = at(0, 0, rr * p0.f, p0.th);
      if (Math.abs(p0.th) > 2) f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' });
      f.dot(p[0], p[1], 2.8);
      f.tag(p[0], p[1], p0.lab || 'P', p0.at || (p0.th < 0 ? 'l' : 'r'), 7, 'small');
      if (Math.abs(p0.th) > 2 && Math.abs(p0.th) < 178) thetaMark(f, 0, 0, p0.th, 14);
    }
    if (o.mark) { const e = at(0, 0, rr, o.mark.th); f.line(0, 0, e[0], e[1], { cls: 'dim dash thin' }); thetaMark(f, 0, 0, o.mark.th, o.mark.r || 18, o.mark.lab || '\\theta'); }
    if (o.inLab) f.label(o.inX ?? 0, o.inY ?? rr * 0.45, o.inLab, 'c', 'small');
    return f.svg();
  }
  // two-part surface: polar cap of half-angle cap (default 90° = hemispheres)
  const gap = 3;
  const hemis = (o = {}) => {
    const cap = o.cap ?? 90;
    return sph(Object.assign({
      arcs: [[-cap + gap, cap - gap, 'thick'], [cap + gap, 360 - cap - gap, o.botThin ? '' : 'thick']],
      lab: o.top || '+V_0', labTh: o.topTh ?? 34, lab2: o.bot || '-V_0', lab2Th: o.botTh ?? 146, Rth: 235,
    }, o.extra || {}));
  };
  const sphL = (lab, extra = {}) => sph(Object.assign({ lab, R: true }, extra));

  // ---------------------------------------------------------------- other drawings
  // the Legendre variable x = cos θ at the five standard angles
  function xMap() {
    const f = PF.fig();
    const rr = 70;
    f.circle(0, 0, rr, { cls: 'thick' });
    zAxis(f, 0, rr + 14, -rr - 50);
    const pts = [[60, '\\theta=60^\\circ:\\ x=\\tfrac12'], [90, '\\theta=90^\\circ:\\ x=0'], [120, '\\theta=120^\\circ:\\ x=-\\tfrac12']];
    for (const [th, lab] of pts) {
      const p = at(0, 0, rr, th);
      f.line(0, p[1], p[0] - 4, p[1], { cls: 'dash dim thin' });
      f.dot(p[0], p[1], 2.8);
      f.tag(p[0], p[1], lab, 'r', 8, 'small');
    }
    f.dot(0, -rr, 2.8); f.tag(0, -rr, '\\theta=0:\\ x=1', 'tl', 12, 'small');
    f.dot(0, rr, 2.8); f.tag(0, rr, '\\theta=180^\\circ:\\ x=-1', 'bl', 12, 'small');
    return f.svg();
  }
  const XMAP = xMap();

  // P_ℓ(x) on [-1, 1]; styles cycle so several curves can be told apart
  const STY = ['', 'dash', 'dim', 'dim dash', 'thin'];
  const plotP = (ls, o = {}) => PF.plot(Object.assign({
    w: 320, h: 190, x: [-1, 1], y: [-1.15, 1.15], zero: true, xl: 'x',
    xt: [[-1, '-1'], [-0.5, '-\\tfrac12'], [0.5, '\\tfrac12'], [1, '1']], yt: [[1, '1'], [-1, '-1']],
    curves: ls.map((l, i) => ({ f: (x) => Pl(l, x), cls: STY[i % STY.length] })),
  }, o));
  // P_ℓ(cos θ) against θ
  const plotTh = (ls, o = {}) => PF.plot(Object.assign({
    w: 320, h: 190, x: [0, Math.PI], y: [-1.15, 1.15], zero: true, xl: '\\theta',
    xt: [[Math.PI / 3, '60^\\circ'], [Math.PI / 2, '90^\\circ'], [2 * Math.PI / 3, '120^\\circ'], [Math.PI, '180^\\circ']], yt: [[1, '1'], [-1, '-1']],
    curves: ls.map((l, i) => ({ f: (t) => Pl(l, Math.cos(t)), cls: STY[i % STY.length] })),
  }, o));
  // Rodrigues: the bump (x^2-1)^l (dashed) and, optionally, the P_l it produces (solid)
  const plotRod = (l, withP) => PF.plot({
    w: 320, h: 190, x: [-1, 1], y: l % 2 ? [-1.15, 1.15] : [-0.65, 1.15], zero: true, xl: 'x',
    xt: [[-1, '-1'], [1, '1']], yt: l % 2 ? [[1, '1'], [-1, '-1']] : [[1, '1'], [-0.5, '-\\tfrac12']],
    curves: [{ f: (x) => Math.pow(x * x - 1, l), cls: 'dim dash' }].concat(withP ? [{ f: (x) => Pl(l, x) }] : []),
  });

  // equipotentials of r^2 P_2 = z^2 - (x^2+y^2)/2 in the xz plane: a saddle
  function saddleFig() {
    const f = PF.fig();
    const S = 56, Xm = 1.7, Zm = 1.45;
    f.line(-Xm * S - 6, 0, Xm * S + 14, 0, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(Xm * S + 18, 0, 'x', 'l', 'small accent');
    zAxis(f, 0, Zm * S + 6, -Zm * S - 16);
    for (const c of [0.45, 1.1]) for (const s of [1, -1]) {
      const pts = [];
      for (let i = 0; i <= 60; i++) { const x = -Xm + 2 * Xm * i / 60, z = Math.sqrt(c + x * x / 2); if (z <= Zm) pts.push([x * S, -s * z * S]); }
      f.pl(pts, { cls: 'thin' });
    }
    for (const c of [0.45, 1.1]) for (const s of [1, -1]) {
      const pts = [];
      for (let i = 0; i <= 60; i++) { const z = -Zm + 2 * Zm * i / 60, x = Math.sqrt(2 * (z * z + c)); if (x <= Xm) pts.push([s * x * S, -z * S]); }
      f.pl(pts, { cls: 'thin' });
    }
    const zc = Xm / Math.SQRT2;
    f.line(-Xm * S, -zc * S, Xm * S, zc * S, { cls: 'dash dim' });
    f.line(-Xm * S, zc * S, Xm * S, -zc * S, { cls: 'dash dim' });
    sgn(f, 14, -Zm * S + 8, 1, 4); sgn(f, 14, Zm * S - 8, 1, 4);
    sgn(f, Xm * S - 10, 14, -1, 4); sgn(f, -Xm * S + 10, 14, -1, 4);
    return f.svg();
  }

  // a point charge q on the z axis at distance d, and a field point P at (r, θ)
  function chargeFig(o = {}) {
    const f = PF.fig();
    const d = 104;
    zAxis(f, 0, 34, -d - 50);
    f.dot(0, 0, 2.4); f.label(-6, 6, 'O', 'tr', 'small accent');
    f.charge(0, -d, { q: '+', lab: 'q', at: 'l' });
    f.dim(-34, 0, -34, -d, 'd', { at: 'l' });
    const th = o.th ?? 62, rP = o.rP ?? 78;
    const p = at(0, 0, rP, th);
    f.line(0, 0, p[0], p[1], { cls: 'dim dash thin' });
    labLine(f, [0, 0], p, 'r', -1, 3, 0.55);
    thetaMark(f, 0, 0, th, 16);
    f.line(0, -d, p[0], p[1], { cls: 'dim thin' });
    labLine(f, [0, -d], p, '|\\mathbf r-\\mathbf r\'|', 1, 4, 0.5);
    f.dot(p[0], p[1], 2.8); f.tag(p[0], p[1], 'P', 'r', 7, 'small');
    return f.svg();
  }

  // a physical dipole: +q at z = a, -q at z = -a, and a field point on the +z axis
  function pairFig() {
    const f = PF.fig();
    const a = 46;
    zAxis(f, 0, a + 40, -a - 110);
    f.dot(0, 0, 2.4); f.label(-6, 4, 'O', 'r', 'small accent');
    f.charge(0, -a, { q: '+', lab: '+q', at: 'r' });
    f.charge(0, a, { q: '-', lab: '-q', at: 'r' });
    f.dim(-30, 0, -30, -a, 'a', { at: 'l' });
    f.dim(-30, 0, -30, a, 'a', { at: 'l' });
    f.dot(0, -a - 78, 2.8); f.tag(0, -a - 78, 'P\\ (z)', 'r', 8, 'small');
    return f.svg();
  }

  // a sphere with two concentric dashed spheres (averages)
  function avgFig(lab) {
    const f = PF.fig();
    const rr = 70;
    f.circle(0, 0, rr * 1.75, { cls: 'dash dim' });
    f.circle(0, 0, rr * 0.5, { cls: 'dash dim' });
    f.circle(0, 0, rr, { cls: 'thick' });
    zAxis(f, 0, 0, -rr * 1.75 - 24);
    leader(f, 0, 0, rr, 38, lab, rr * 0.75 + 10);
    f.label(0, 16, 'r=R/2', 'c', 'small');
    f.label(-rr * 0.97, rr * 0.97, 'r=3R', 'c', 'small');
    return f.svg();
  }

  // Unit 6's slot: grounded plates at y = 0 and y = a, the end x = 0 held at V0(y)
  function slotFig() {
    const f = PF.fig();
    const a = 90, L = 200;
    f.plane(4, L, 0, { side: 'below' });
    f.plane(4, L, -a, { side: 'above' });
    f.line(L, 0, L + 22, 0, { cls: 'dim dash' });
    f.line(L, -a, L + 22, -a, { cls: 'dim dash' });
    f.label(L * 0.6, 16, 'V=0', 't', 'small');
    f.label(L * 0.6, -a - 16, 'V=0', 'b', 'small');
    f.wall(0, -a + 3, -3, { side: 'left' });
    f.label(-16, -a / 2, 'V_0(y)', 'r');
    f.line(0, -a - 14, 0, -a - 36, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(5, -a - 34, 'y', 'l', 'small accent');
    f.line(L + 26, 0, L + 46, 0, { cls: 'dim', arrow: 'end', hs: 6 });
    f.label(L + 48, 0, 'x', 'l', 'small accent');
    f.label(-15, 9, '0', 'r', 'small accent');
    f.label(-15, -a - 7, 'a', 'r', 'small accent');
    return f.svg();
  }

  // partial sums
  const stepCoef = (l) => { if (l % 2 === 0) return 0; let I = 0; const n = 2000; for (let i = 0; i < n; i++) I += Pl(l, (i + 0.5) / n) / n; return (2 * l + 1) * I; };
  const STEPC = Array.from({ length: 42 }, (_, l) => stepCoef(l));
  const stepSum = (x, N) => { let s = 0; for (let l = 1; l <= N; l += 2) s += STEPC[l] * Pl(l, x); return s; };
  const absCoef = (l) => { if (l % 2) return 0; let I = 0; const n = 2000; for (let i = 0; i < n; i++) { const x = (i + 0.5) / n; I += x * Pl(l, x) / n; } return (2 * l + 1) * I; };
  const ABSC = Array.from({ length: 12 }, (_, l) => absCoef(l));
  const absSum = (x, N) => { let s = 0; for (let l = 0; l <= N; l += 2) s += ABSC[l] * Pl(l, x); return s; };
  const FIG = {};

  // =====================================================================================
  // Lesson 1: computing P_ℓ
  // =====================================================================================
  FIG.rod2 = plotRod(2, true);
  FIG.rod3 = plotRod(3, false);
  FIG.p1to4 = plotP([1, 2, 3, 4]);
  FIG.p4only = plotP([4]);
  FIG.p3theta = plotTh([3]);
  FIG.p34 = plotP([3, 4]);
  FIG.p02 = plotP([0, 2]);

  const L1 = {
    id: 'uL-compute', title: 'Computing P_ℓ',
    steps: [
      RF(md`
        This unit has one job: make you fast and certain on any **direct** Legendre question. Last year's exam had one. Unit 8 used Legendre polynomials as a tool inside boundary-value problems. Here they are the topic, and every skill gets drilled until it takes under a minute.

        Notation: the separated solution is $V(r,\theta) = R(r)\,Q(\theta)$ with

        $$Q(\theta) = P_\ell(\cos\theta), \qquad x = \cos\theta, \qquad \ell = 0, 1, 2, \dots$$

        The polynomials are functions of $x$. On a unit sphere $x$ is the height of a point: $1$ at the north pole, $0$ on the equator, $-1$ at the south pole. Turn every angle into $x$ first.

        [[fig:x]]

        ### Rodrigues' formula

        $$P_\ell(x) = \frac{1}{2^\ell\,\ell!}\left(\frac{d}{dx}\right)^{\ell}\left(x^2 - 1\right)^{\ell}$$

        It is not on the formula sheet. An exam can ask you to generate $P_2$ or $P_3$ from it and check the result, so memorise it and the recipe.

        !!method Rodrigues by hand
          1. Expand $(x^2-1)^\ell$: binomial coefficients, alternating signs, last term $(-1)^\ell$.
          2. Drop every term of degree below $\ell$. Differentiating $\ell$ times kills it.
          3. Differentiate $\ell$ times, using $\dfrac{d^\ell}{dx^\ell}x^n = \dfrac{n!}{(n-\ell)!}\,x^{n-\ell}$.
          4. Divide by $2^\ell\,\ell!$. That is $2, 8, 48, 384$ for $\ell = 1, 2, 3, 4$.
          5. Check $P_\ell(1) = 1$. If it fails, the prefactor or a derivative is wrong.

        **$\ell = 0, 1$.** $P_0 = \dfrac{1}{1}(x^2-1)^0 = 1$. $\;P_1 = \dfrac12\dfrac{d}{dx}(x^2 - 1) = \dfrac12\cdot2x = x$.

        **$\ell = 2$** (prefactor $\frac{1}{2^2\cdot2!} = \frac18$):

        | step | result |
        |---|---|
        | $(x^2-1)^2$ | $x^4 - 2x^2 + 1$ |
        | first derivative | $4x^3 - 4x$ |
        | second derivative | $12x^2 - 4$ |
        | times $\frac18$ | $\tfrac32x^2 - \tfrac12 = \tfrac12(3x^2 - 1)$ |

        Check: $\tfrac12(3 - 1) = 1$.

        **$\ell = 3$** (prefactor $\frac{1}{2^3\cdot3!} = \frac{1}{48}$):

        | step | result |
        |---|---|
        | $(x^2-1)^3$ | $x^6 - 3x^4 + 3x^2 - 1$ |
        | first derivative | $6x^5 - 12x^3 + 6x$ |
        | second derivative | $30x^4 - 36x^2 + 6$ |
        | third derivative | $120x^3 - 72x$ |
        | times $\frac{1}{48}$ | $\tfrac52x^3 - \tfrac32x = \tfrac12(5x^3 - 3x)$ |

        Check: $\tfrac12(5 - 3) = 1$.

        **$\ell = 4$** (prefactor $\frac{1}{2^4\cdot4!} = \frac{1}{384}$):

        | step | result |
        |---|---|
        | $(x^2-1)^4$ | $x^8 - 4x^6 + 6x^4 - 4x^2 + 1$ |
        | first derivative | $8x^7 - 24x^5 + 24x^3 - 8x$ |
        | second derivative | $56x^6 - 120x^4 + 72x^2 - 8$ |
        | third derivative | $336x^5 - 480x^3 + 144x$ |
        | fourth derivative | $1680x^4 - 1440x^2 + 144$ |
        | times $\frac{1}{384}$ | $\tfrac{35}{8}x^4 - \tfrac{30}{8}x^2 + \tfrac38 = \tfrac18(35x^4 - 30x^2 + 3)$ |

        Check: $\tfrac18(35 - 30 + 3) = 1$. (Unit 8 showed the short version for $\ell = 2, 3$ and did $P_5$. Here every line is written out, which is what an exam grader wants to see.)

        [[fig:rod]]

        **The leading coefficient** comes from the top term alone: $\frac{d^\ell}{dx^\ell}x^{2\ell} = \frac{(2\ell)!}{\ell!}x^\ell$, so the coefficient of $x^\ell$ in $P_\ell$ is $\dfrac{(2\ell)!}{2^\ell(\ell!)^2}$: $1, \tfrac32, \tfrac52, \tfrac{35}{8}, \tfrac{63}{8}$ for $\ell = 0$ to $4$. Each derivative also lowers the parity by one step, so $P_\ell$ contains only $x^\ell, x^{\ell-2}, \dots$
      `, {
        x: { svg: XMAP, cap: 'The Legendre variable $x = \\cos\\theta$ is the height on a unit sphere. The five standard angles and their $x$ values.' },
        rod: { svg: FIG.rod2, cap: 'Rodrigues for $\\ell = 2$. Dashed: $(x^2-1)^2$. Solid: $P_2 = \\tfrac18\\,\\dfrac{d^2}{dx^2}(x^2-1)^2$, which equals $1$ at $x = 1$.' },
      }),

      Q(md`In Rodrigues' formula, what is the prefactor $\dfrac{1}{2^\ell\,\ell!}$ for $\ell = 4$?`,
        [md`$\tfrac{1}{16}$`, md`$\tfrac{1}{384}$`, md`$\tfrac{1}{24}$`, md`$\tfrac{1}{96}$`], 1,
        [md`That is only $\tfrac{1}{2^4}$. The $\tfrac{1}{4!}$ is missing.`, null, md`That is only $\tfrac{1}{4!}$. The $\tfrac{1}{2^4}$ is missing.`, md`$96 = 2^2\cdot4!$. The power of 2 is $2^\ell = 16$, not $4$.`],
        md`$2^4\cdot4! = 16\cdot24 = 384$. Check: the fourth derivative of $(x^2-1)^4$ is $1680x^4 - 1440x^2 + 144$, and the coefficients sum to $384$, so dividing by $384$ gives $P_4(1) = 1$.`,
        { figHtml: plotRod(4, true) }),

      Q(md`$(x^2-1)^3 = x^6 - 3x^4 + 3x^2 - 1$. Which terms survive the three derivatives in Rodrigues' formula for $P_3$?`,
        [md`All four`, md`Only $x^6$`, md`$x^6$ and $-3x^4$`, md`$x^6$, $-3x^4$ and $3x^2$`], 2,
        [md`The constant and $3x^2$ have degree below 3. Three derivatives kill them.`, md`$x^4$ has degree 4, so three derivatives leave $24x$. That term gives the $-\tfrac32x$ in $P_3$. With $x^6$ alone you would get $P_3 \propto x^3$, which is not orthogonal to $P_1$.`, null, md`$\frac{d^3}{dx^3}(3x^2) = 0$. Only terms of degree at least 3 survive.`],
        md`Degree $\ge \ell$ survives. $\frac{d^3}{dx^3}x^6 = 120x^3$ and $\frac{d^3}{dx^3}(-3x^4) = -72x$. Then $\frac{1}{48}(120x^3 - 72x) = \tfrac12(5x^3 - 3x)$. Dropping the low terms first halves the work.`,
        { figHtml: FIG.rod3 }),

      Q(md`What is the coefficient of $x^4$ in $P_4(x)$?`,
        [md`$1$`, md`$\tfrac38$`, md`$\tfrac{35}{2}$`, md`$\tfrac{35}{8}$`], 3,
        [md`$P_\ell(1) = 1$ is the *sum* of all the coefficients, not the leading one.`, md`$\tfrac38$ is the constant term, $P_4(0)$.`, md`$\tfrac{1680}{96}$: divided by $2^2\cdot4!$ instead of $2^4\cdot4!$.`, null],
        md`$\dfrac{(2\ell)!}{2^\ell(\ell!)^2} = \dfrac{8!}{16\cdot576} = \dfrac{40320}{9216} = \dfrac{35}{8}$. Or from the table: $\frac{1680}{384} = \frac{35}{8}$. Knowing the leading coefficients ($\tfrac32$, $\tfrac52$, $\tfrac{35}{8}$) is what makes expanding by eye fast in Lesson 4.`,
        { figHtml: FIG.p4only }),

      Q(md`A student runs Rodrigues' formula for $\ell = 3$ and writes $P_3 = 5x^3 - 3x$. What went wrong?`,
        [md`The prefactor is off by a factor of 2: $5 - 3 = 2$ at $x = 1$, so they divided by 24 instead of 48.`, md`Nothing. Legendre polynomials are only defined up to a constant.`, md`A derivative was skipped, so the degree is wrong.`, md`The sign of the $x$ term should be $+$.`],
        0,
        [null, md`The constant is fixed by convention: $P_\ell(1) = 1$. With $5x^3 - 3x$ the coefficient formulas, the axis trick and every table in this unit would be off by 2.`, md`The degree is 3, which is right. Only the overall size is wrong.`, md`$P_3$ must be orthogonal to $P_1 = x$: $\int_{-1}^1 x(5x^3 - 3x)\,dx = 2 - 2 = 0$. With $+3x$ it would not be.`],
        md`The fastest check on any Rodrigues result is $P_\ell(1) = 1$. Here it gives $2$, so the result is $2P_3$. The shape (ratio $5 : -3$) is right; only the prefactor $\frac{1}{2^3\cdot 3!} = \frac{1}{48}$ was mangled.`,
        { nofig: 'checks a normalization, no geometry' }),

      Q(md`Why does $P_\ell$ for odd $\ell$ contain only odd powers of $x$?`,
        [md`Because $x^2 - 1$ is an odd function.`, md`Because the prefactor $\frac{1}{2^\ell\ell!}$ is odd for odd $\ell$.`, md`$(x^2-1)^\ell$ is even, each derivative flips the parity, and an odd number of flips gives an odd function.`, md`It is a coincidence of the first few.`],
        2,
        [md`$x^2 - 1$ is even: it is unchanged under $x \to -x$.`, md`A constant has no parity. Parity is a property of how a function behaves under $x \to -x$.`, null, md`It holds for every $\ell$: $P_\ell(-x) = (-1)^\ell P_\ell(x)$.`],
        md`The derivative of an even function is odd and vice versa. Start even, take $\ell$ derivatives: parity $(-1)^\ell$. On the sphere, $x \to -x$ is $\theta \to \pi - \theta$ (reflection through the equatorial plane), so even-$\ell$ terms are north–south symmetric and odd-$\ell$ terms are antisymmetric.`,
        { figHtml: FIG.p1to4 }),

      RF(md`
        ### A fast check: the recurrence

        $$(\ell+1)\,P_{\ell+1}(x) = (2\ell+1)\,x\,P_\ell(x) - \ell\,P_{\ell-1}(x)$$

        This is a standard identity (Bonnet's recursion). On the exam treat it as a check, not as a substitute for a derivation you are asked to show. Climb from $P_0 = 1$, $P_1 = x$:

        - $\ell = 1$: $\;2P_2 = 3x\cdot x - 1$, so $P_2 = \tfrac12(3x^2 - 1)$.
        - $\ell = 2$: $\;3P_3 = 5x\cdot\tfrac12(3x^2 - 1) - 2x = \tfrac12(15x^3 - 9x)$, so $P_3 = \tfrac12(5x^3 - 3x)$.
        - $\ell = 3$: $\;4P_4 = 7x\cdot\tfrac12(5x^3 - 3x) - 3\cdot\tfrac12(3x^2 - 1) = \tfrac12(35x^4 - 30x^2 + 3)$, so $P_4 = \tfrac18(35x^4 - 30x^2 + 3)$.

        **Numbers without polynomials.** To get $P_\ell(x_0)$ at one point, run the recurrence on numbers. At $x_0 = \tfrac12$:

        $$P_0 = 1,\quad P_1 = \tfrac12,\quad P_2 = \frac{3\cdot\frac12\cdot\frac12 - 1}{2} = -\tfrac18,\quad P_3 = \frac{5\cdot\frac12\cdot\left(-\frac18\right) - 2\cdot\frac12}{3} = -\tfrac{7}{16},\quad P_4 = \frac{7\cdot\frac12\cdot\left(-\frac{7}{16}\right) - 3\cdot\left(-\frac18\right)}{4} = -\tfrac{37}{128}$$

        **It keeps the normalisation.** If $P_\ell(1) = P_{\ell-1}(1) = 1$, then $(\ell+1)P_{\ell+1}(1) = (2\ell+1) - \ell = \ell + 1$, so $P_{\ell+1}(1) = 1$. At $x = 0$ it gives $P_{\ell+1}(0) = -\frac{\ell}{\ell+1}P_{\ell-1}(0)$: $\;1 \to -\tfrac12 \to \tfrac38 \to -\tfrac{5}{16}$.
      `),

      Q(md`You know $P_3$ and $P_4$. Which line of the recurrence gives $P_5$?`,
        [md`$4P_5 = 7xP_4 - 3P_3$`, md`$5P_5 = 9xP_4 - 4P_3$`, md`$5P_5 = 9xP_4 + 4P_3$`, md`$P_5 = 9xP_4 - 4P_3$`], 1,
        [md`That is the $\ell = 3$ line, which gives $P_4$ from $P_3$ and $P_2$.`, null, md`The sign of the last term is minus. Check at $x = 1$: $9 + 4 = 13 \ne 5$.`, md`The factor $(\ell+1) = 5$ on the left is missing. At $x = 1$ this would give $P_5(1) = 5$.`],
        md`Set $\ell = 4$: $(\ell+1) = 5$, $(2\ell+1) = 9$, $\ell = 4$. So $5P_5 = 9xP_4 - 4P_3$. Check at $x = 1$: $5 = 9 - 4$.`,
        { figHtml: FIG.p34 }),

      Q(md`$P_4(0) = \tfrac38$. Using the recurrence at $x = 0$, what is $P_6(0)$?`,
        [md`$\tfrac{5}{16}$`, md`$\tfrac38$`, md`$0$`, md`$-\tfrac{5}{16}$`], 3,
        [md`The factor $-\frac{\ell}{\ell+1}$ carries a minus sign, so the equator values alternate: $1, -\tfrac12, \tfrac38, -\tfrac5{16}$.`, md`That is $P_4(0)$. Each step multiplies by $-\frac{5}{6}$ here.`, md`Only odd $\ell$ vanish at $x = 0$. $P_6$ is even.`, null],
        md`At $x = 0$ the middle term drops: $(\ell+1)P_{\ell+1}(0) = -\ell P_{\ell-1}(0)$. With $\ell = 5$: $6P_6(0) = -5\cdot\tfrac38$, so $P_6(0) = -\tfrac{5}{16}$. The magnitudes shrink slowly and the signs alternate.`,
        { figHtml: XMAP }),

      Q(md`At $x = \tfrac12$ you have $P_1 = \tfrac12$ and $P_2 = -\tfrac18$. What is $P_3(\tfrac12)$?`,
        [md`$\tfrac{7}{16}$`, md`$-\tfrac{1}{16}$`, md`$-\tfrac{7}{16}$`, md`$\tfrac{5}{16}$`], 2,
        [md`Sign: both pieces of $5x P_2 - 2P_1$ are negative here.`, md`The two pieces are $5\cdot\tfrac12\cdot\left(-\tfrac18\right) = -\tfrac{5}{16}$ and $-2\cdot\tfrac12 = -1$. Their sum is $3P_3 = -\tfrac{21}{16}$; divide by 3 only at the end.`, null, md`That is $\tfrac{5}{2}x^3$ at $x = \tfrac12$ plus a sign slip. Use the recurrence or the full polynomial.`],
        md`$3P_3 = 5\cdot\tfrac12\cdot\left(-\tfrac18\right) - 2\cdot\tfrac12 = -\tfrac{5}{16} - 1 = -\tfrac{21}{16}$, so $P_3(\tfrac12) = -\tfrac{7}{16}$. Check with the polynomial: $\tfrac12\left(\tfrac58 - \tfrac32\right) = -\tfrac{7}{16}$. That is $P_3(\cos60^\circ)$.`,
        { figHtml: XMAP }),

      RF(md`
        ### Properties you will be asked about

        | property | statement |
        |---|---|
        | normalisation | $P_\ell(1) = 1$ for every $\ell$ |
        | south pole | $P_\ell(-1) = (-1)^\ell$ |
        | parity | $P_\ell(-x) = (-1)^\ell P_\ell(x)$ |
        | equator | $P_\ell(0) = 0$ for odd $\ell$; $\;P_0(0) = 1$, $P_2(0) = -\tfrac12$, $P_4(0) = \tfrac38$, $P_6(0) = -\tfrac{5}{16}$ |
        | zeros | exactly $\ell$, all inside $(-1, 1)$, in mirror pairs; odd $\ell$ has one at $x = 0$ |
        | leading coefficient | $\dfrac{(2\ell)!}{2^\ell(\ell!)^2}$: $1, \tfrac32, \tfrac52, \tfrac{35}{8}, \tfrac{63}{8}$ |
        | size | $\lvert P_\ell(x)\rvert \le 1$ on $[-1, 1]$, with the extremes at the poles |

        [[fig:plot]]

        On the sphere each zero is a cone $\theta = $ const (a nodal latitude) where that term of $V$ vanishes:
        - $P_1$: the equator.
        - $P_2$: $\cos\theta = \pm\frac{1}{\sqrt3}$, so $\theta = 54.74^\circ$ and $125.26^\circ$.
        - $P_3$: $\cos\theta = 0, \pm\sqrt{3/5}$, so $\theta = 39.23^\circ, 90^\circ, 140.77^\circ$.
        - $P_4$: $\theta = 30.56^\circ, 70.12^\circ, 109.88^\circ, 149.44^\circ$.

        Higher $\ell$ means finer angular structure, like higher harmonics on a string.

        !!trap Degrees vs $x$
          $P_\ell(\cos\theta)$, not $P_\ell(\theta)$. At $\theta = 60^\circ$ you evaluate $P_\ell(\tfrac12)$. Plugging $\theta = \pi/3 \approx 1.05$ into the polynomial gives a number bigger than 1 in size, which the size rule says is impossible.
      `, { plot: { svg: FIG.p1to4, cap: 'Solid $P_1$, dashed $P_2$, dim $P_3$, dim dashed $P_4$. All pass through $1$ at $x = 1$; the odd ones pass through $0$ at $x = 0$.' } }),

      Q(md`What is $P_5(-1)$, the value of $P_5(\cos\theta)$ at the south pole?`,
        [md`$1$`, md`$-1$`, md`$0$`, md`$-5$`], 1,
        [md`$1$ is the north-pole value. Odd polynomials flip sign at the south pole.`, null, md`Odd $P_\ell$ vanish on the equator ($x = 0$), not at the poles.`, md`$\lvert P_\ell\rvert \le 1$ on $[-1, 1]$.`],
        md`$P_\ell(-1) = (-1)^\ell P_\ell(1) = (-1)^5 = -1$. No polynomial needed.`,
        { figHtml: XMAP }),

      Q(md`Going from the north pole to the south pole, how many times does $P_5(\cos\theta)$ change sign?`,
        [md`$3$`, md`$4$`, md`$6$`, md`$5$`], 3,
        [md`That is the count for $P_3$.`, md`$P_\ell$ has exactly $\ell$ zeros in $(-1, 1)$, all simple, so $P_5$ changes sign 5 times.`, md`$P_5$ has degree 5, so at most 5 zeros.`, null],
        md`$P_\ell$ has $\ell$ simple zeros strictly between the poles, and each is a sign change. That is why it goes from $+1$ at the north pole to $(-1)^5 = -1$ at the south pole: an odd number of flips.`,
        { figHtml: FIG.p1to4 }),

      Q(md`A student finds $P_3(\cos60^\circ) = 1.3$. What do you conclude?`,
        [md`It is an arithmetic error, since $\lvert P_\ell(x)\rvert \le 1$ for $-1 \le x \le 1$.`, md`It is fine. Only even $P_\ell$ are bounded by 1.`, md`It is fine. $P_3$ is only bounded at the poles.`, md`It is fine, because $\cos 60^\circ = \tfrac{\sqrt3}{2}$.`],
        0,
        [null, md`The bound holds for every $\ell$.`, md`The bound holds on the whole interval $[-1, 1]$; the poles are where the extremes $\pm1$ are reached.`, md`$\cos60^\circ = \tfrac12$. And $\lvert P_3\rvert \le 1$ for any $x$ in $[-1,1]$ anyway.`],
        md`$P_3(\tfrac12) = -\tfrac{7}{16} \approx -0.44$. A value outside $[-1, 1]$ is a guaranteed slip. The usual culprit is plugging in $\theta$ itself ($1.047$) instead of $\cos\theta$.`,
        { figHtml: XMAP }),

      Q(md`Which of these vanishes everywhere on the equator, $\theta = 90^\circ$?`,
        [md`$P_4(\cos\theta)$`, md`$P_2(\cos\theta)$`, md`$P_5(\cos\theta)$`, md`$P_0(\cos\theta)$`], 2,
        [md`$P_4(0) = \tfrac38$. Even polynomials keep their constant term.`, md`$P_2(0) = -\tfrac12$.`, null, md`$P_0 = 1$ everywhere.`],
        md`The equator is $x = 0$, and every odd $P_\ell$ is an odd function, so $P_\ell(0) = 0$. That is why antisymmetric boundary data (odd $\ell$ only) give $V = 0$ on the whole equatorial plane inside and outside.`,
        { figHtml: XMAP }),

      Q(md`The plot shows one Legendre polynomial $P_\ell(x)$. Which $\ell$?`,
        [md`$2$`, md`$3$`, md`$4$`, md`$5$`], 2,
        [md`$P_2$ has 2 zeros; this curve has 4.`, md`This curve is even (mirror-symmetric about $x = 0$) and equals $+1$ at $x = -1$. $P_3$ is odd.`, null, md`$P_5$ is odd: it would be $-1$ at $x = -1$ and $0$ at $x = 0$.`],
        md`Read three things off any plot: the value at $x = -1$ ($+1$, so even $\ell$), the number of zeros (4), and the value at $x = 0$ ($\tfrac38 > 0$). All three point to $P_4$.`,
        { figHtml: FIG.p4only }),

      Q(md`The plot shows $P_\ell(\cos\theta)$ against $\theta$ (not against $x$). Which $\ell$?`,
        [md`$2$`, md`$3$`, md`$4$`, md`$1$`], 1,
        [md`$P_2$ is $+1$ at both poles. This curve ends at $-1$.`, null, md`$P_4$ is $+1$ at both poles.`, md`$P_1 = \cos\theta$ has one zero. This curve has three.`],
        md`$+1$ at $\theta = 0$, $-1$ at $\theta = 180^\circ$ (odd $\ell$), three zeros (at $39^\circ$, $90^\circ$, $141^\circ$). That is $P_3$. Plotted against $\theta$ the curve is flat at the poles and its zeros are spread almost evenly, because $x = \cos\theta$ changes slowly near the poles. Against $x$ the wiggles crowd toward $x = \pm1$ instead.`,
        { figHtml: FIG.p3theta }),

      RF(md`
        ### Is it a Legendre polynomial?

        Exams disguise them: written in $\cos\theta$, in multiple angles, or scaled. A polynomial $f(x)$ of degree $\ell$ is $P_\ell$ exactly when:

        1. it has a single parity (only $x^\ell, x^{\ell-2}, \dots$),
        2. $f(1) = 1$,
        3. it is orthogonal to every lower power: $\int_{-1}^1 x^k f(x)\,dx = 0$ for $k \lt \ell$. Parity handles the $k$ of opposite parity, so for $\ell = 2$ you only check $k = 0$, for $\ell = 3$ only $k = 1$.

        Conditions 1 and 2 are not enough. $\tfrac14(3x^2 + 1)$ is even, has degree 2 and equals 1 at $x = 1$, but $\int_{-1}^1\tfrac14(3x^2+1)\,dx = \tfrac14(2 + 2) = 1 \ne 0$. It is not $P_2$.

        **Multiple angles.** Convert with $\cos2\theta = 2\cos^2\theta - 1$, $\cos3\theta = 4\cos^3\theta - 3\cos\theta$, $\cos4\theta = 8\cos^4\theta - 8\cos^2\theta + 1$. Then

        $$P_2(\cos\theta) = \tfrac14(3\cos2\theta + 1), \qquad P_3(\cos\theta) = \tfrac18(5\cos3\theta + 3\cos\theta), \qquad P_4(\cos\theta) = \tfrac{1}{64}(35\cos4\theta + 20\cos2\theta + 9)$$

        Check each at $\theta = 0$: $\tfrac44$, $\tfrac88$, $\tfrac{64}{64}$.
      `),

      Q(md`Which expression equals $P_3(\cos\theta)$?`,
        [md`$\tfrac12(5\cos3\theta - 3\cos\theta)$`, md`$\tfrac18(5\cos3\theta - 3\cos\theta)$`, md`$\tfrac14(5\cos3\theta + 3\cos\theta)$`, md`$\tfrac18(5\cos3\theta + 3\cos\theta)$`], 3,
        [md`This swaps $\cos^3\theta$ for $\cos3\theta$. It passes the pole check ($\tfrac12(5 - 3) = 1$), but at $\theta = 60^\circ$ it gives $\tfrac12(5\cos180^\circ - 3\cdot\tfrac12) = -3.25$, outside $[-1, 1]$.`, md`At $\theta = 0$ this gives $\tfrac{2}{8} = \tfrac14$, not 1.`, md`At $\theta = 0$ this gives $2$.`, null],
        md`$5\cos3\theta + 3\cos\theta = 5(4x^3 - 3x) + 3x = 20x^3 - 12x$, and $\tfrac18(20x^3 - 12x) = \tfrac12(5x^3 - 3x)$. Two checks always: the pole value and a value inside the interval.`,
        { figHtml: FIG.p3theta }),

      Q(md`Which of these is even, equals 1 at $x = 1$, and still is **not** a Legendre polynomial?`,
        [md`$\tfrac18(35x^4 - 30x^2 + 3)$`, md`$1$`, md`$\tfrac14(3x^2 + 1)$`, md`$\tfrac14(3\cos2\theta + 1)$ with $x = \cos\theta$`], 2,
        [md`That is $P_4$.`, md`That is $P_0$.`, null, md`That is $P_2(\cos\theta)$ in disguise: $\tfrac14(6x^2 - 2) = \tfrac12(3x^2 - 1)$.`],
        md`A degree-2 Legendre polynomial must be orthogonal to $P_0 = 1$, i.e. integrate to zero on $[-1, 1]$. $\int_{-1}^1\tfrac14(3x^2 + 1)\,dx = 1$. Parity and the pole value are necessary, not sufficient.`,
        { figHtml: FIG.p02 }),

      Q(md`What is the coefficient of $x^5$ in $P_5(x)$?`,
        [md`$\tfrac52$`, md`$\tfrac{35}{8}$`, md`$\tfrac{63}{8}$`, md`$1$`], 2,
        [md`That is the leading coefficient of $P_3$.`, md`That is the leading coefficient of $P_4$.`, null, md`The coefficients of $P_5$ sum to 1 (that is $P_5(1) = 1$); the leading one alone is bigger.`],
        md`$\dfrac{(2\ell)!}{2^\ell(\ell!)^2} = \dfrac{10!}{32\cdot14400} = \dfrac{3628800}{460800} = \dfrac{63}{8}$. Or climb: each step of the recurrence multiplies the leading coefficient by $\frac{2\ell+1}{\ell+1}$, so $\tfrac{35}{8}\cdot\tfrac95 = \tfrac{63}{8}$.`,
        { figHtml: FIG.p1to4 }),

      G('leg_value', { need: 4 }),

      P({
        id: 'uL-rod3', src: 'Exam-style', title: 'P₃ from Rodrigues', big: true,
        q: md`(a) Use Rodrigues' formula to find $P_3(x)$, showing every derivative. (b) Verify $P_3(1) = 1$. (c) Find every polar angle $\theta$ in $(0, \pi)$ at which $P_3(\cos\theta) = 0$. The dashed curve is $(x^2-1)^3$, the function you differentiate.`,
        figHtml: FIG.rod3,
        hints: [
          md`$P_\ell = \dfrac{1}{2^\ell\ell!}\dfrac{d^\ell}{dx^\ell}(x^2-1)^\ell$ with $\ell = 3$. Expand $(x^2-1)^3$ first: $x^6 - 3x^4 + 3x^2 - 1$.`,
          md`The last two terms die under three derivatives. Differentiate $x^6 - 3x^4$ three times, then divide by $2^3\cdot3! = 48$.`,
          md`For (c), factor: $\tfrac12x(5x^2 - 3) = 0$. Convert each $x$ to $\theta = \arccos x$.`,
        ],
        parts: [
          { lbl: md`the third derivative $\dfrac{d^3}{dx^3}(x^2-1)^3$`, expr: '120*x^3 - 72*x', vars: { x: [-1, 1] } },
          { lbl: md`the prefactor $\dfrac{1}{2^3\cdot 3!}$`, ans: 1 / 48 },
          { lbl: md`$P_3(x)$`, expr: '(5*x^3 - 3*x)/2', vars: { x: [-1, 1] }, accepts: ['2.5*x^3 - 1.5*x', 'x*(5*x^2-3)/2'] },
          { lbl: md`(c) the number of zeros of $P_3(\cos\theta)$ in $0 \lt \theta \lt \pi$`, ans: 3 },
          { lbl: md`(c) the smallest of those angles, in degrees`, ans: 39.23 },
        ],
        sol: md`
          **(a)** Expand: $(x^2 - 1)^3 = x^6 - 3x^4 + 3x^2 - 1$.

          $$\frac{d}{dx}: \;6x^5 - 12x^3 + 6x \qquad \frac{d^2}{dx^2}: \;30x^4 - 36x^2 + 6 \qquad \frac{d^3}{dx^3}: \;120x^3 - 72x$$

          Prefactor $\frac{1}{2^3\cdot3!} = \frac{1}{48}$:

          $$P_3(x) = \frac{120x^3 - 72x}{48} = \frac52x^3 - \frac32x = \frac12\left(5x^3 - 3x\right)$$

          **(b)** $P_3(1) = \tfrac12(5 - 3) = 1$. (Also $P_3(-1) = -1$, as odd parity requires.)

          **(c)** $\tfrac12x(5x^2 - 3) = 0$ gives $x = 0$ and $x = \pm\sqrt{3/5} = \pm0.7746$. So $\theta = \arccos(0.7746) = 39.23^\circ$, $\theta = 90^\circ$, and $\theta = 180^\circ - 39.23^\circ = 140.77^\circ$. Three zeros, as $\ell = 3$ requires.

          [[fig:p3]]

          **Quick cross-check** with the recurrence: $3P_3 = 5xP_2 - 2P_1 = \tfrac52x(3x^2 - 1) - 2x = \tfrac{15}{2}x^3 - \tfrac92x$. Same result.

          **What to remember:** drop the low-degree terms, differentiate, divide by $2^\ell\ell!$, and always finish with $P_\ell(1) = 1$.
        `,
        figs: { p3: { svg: FIG.p3theta, cap: '$P_3(\\cos\\theta)$: zeros at $39.23^\\circ$, $90^\\circ$ and $140.77^\\circ$.' } },
      }),

      P({
        title: 'Climb the recurrence to P₆',
        q: md`You are given $P_3 = \tfrac12(5x^3 - 3x)$ and $P_4 = \tfrac18(35x^4 - 30x^2 + 3)$ (plotted: solid $P_3$, dashed $P_4$). Use $(\ell+1)P_{\ell+1} = (2\ell+1)xP_\ell - \ell P_{\ell-1}$ to find $P_5$ and $P_6$. Then evaluate $P_6(0)$ and $P_6(\tfrac12)$.`,
        figHtml: FIG.p34,
        hints: [
          md`$\ell = 4$: $5P_5 = 9xP_4 - 4P_3$. Put everything over 8.`,
          md`$\ell = 5$: $6P_6 = 11xP_5 - 5P_4$. Check each result at $x = 1$.`,
          md`For $P_6(\tfrac12)$ you can also run the recurrence on numbers: $P_4(\tfrac12) = -\tfrac{37}{128}$, $P_5(\tfrac12) = \tfrac{23}{256}$.`,
        ],
        parts: [
          { lbl: md`$P_5(x)$`, expr: '(63*x^5 - 70*x^3 + 15*x)/8', vars: { x: [-1, 1] } },
          { lbl: md`$P_6(x)$`, expr: '(231*x^6 - 315*x^4 + 105*x^2 - 5)/16', vars: { x: [-1, 1] } },
          { lbl: md`$P_6(0)$`, ans: -5 / 16 },
          { lbl: md`$P_6(\tfrac12)$`, ans: 331 / 1024 },
        ],
        sol: md`
          **$P_5$** ($\ell = 4$):

          $$5P_5 = \frac{9x(35x^4 - 30x^2 + 3)}{8} - \frac{4(5x^3 - 3x)}{2} = \frac{315x^5 - 270x^3 + 27x - 80x^3 + 48x}{8} = \frac{315x^5 - 350x^3 + 75x}{8}$$

          $$P_5 = \tfrac18\left(63x^5 - 70x^3 + 15x\right), \qquad P_5(1) = \tfrac{63 - 70 + 15}{8} = 1$$

          **$P_6$** ($\ell = 5$):

          $$6P_6 = \frac{11x(63x^5 - 70x^3 + 15x)}{8} - \frac{5(35x^4 - 30x^2 + 3)}{8} = \frac{693x^6 - 945x^4 + 315x^2 - 15}{8}$$

          $$P_6 = \tfrac{1}{16}\left(231x^6 - 315x^4 + 105x^2 - 5\right), \qquad P_6(1) = \tfrac{231 - 315 + 105 - 5}{16} = 1$$

          **Values.** $P_6(0) = -\tfrac{5}{16} = -0.3125$, matching the equator chain $1, -\tfrac12, \tfrac38, -\tfrac5{16}$. At $x = \tfrac12$ by numbers: $6P_6 = 11\cdot\tfrac12\cdot\tfrac{23}{256} - 5\cdot\left(-\tfrac{37}{128}\right) = \tfrac{253}{512} + \tfrac{740}{512} = \tfrac{993}{512}$, so $P_6(\tfrac12) = \tfrac{331}{1024} \approx 0.3232$. The polynomial gives the same: $\tfrac{1}{16}\left(\tfrac{231}{64} - \tfrac{315}{16} + \tfrac{105}{4} - 5\right) = \tfrac{331}{1024}$.

          **What to remember:** the recurrence is the fastest way to go up in $\ell$ or to get numbers at one $x$. The leading coefficients come out as $\tfrac{63}{8}$ and $\tfrac{231}{16}$, matching $\frac{(2\ell)!}{2^\ell(\ell!)^2}$.
        `,
      }),

      P({
        title: 'Build P₄ from its properties',
        q: md`Without Rodrigues' formula: $P_4$ is even, so $P_4 = ax^4 + bx^2 + c$. Use $P_4(1) = 1$ and the fact that $P_4$ is orthogonal to $1$ and to $x^2$ on $[-1, 1]$ to find $a$, $b$, $c$. (Plotted: $P_0$ and $P_2$, the even polynomials of lower degree.)`,
        figHtml: FIG.p02,
        hints: [
          md`Three unknowns, three equations: $a + b + c = 1$, $\int_{-1}^1(ax^4 + bx^2 + c)\,dx = 0$, $\int_{-1}^1x^2(ax^4 + bx^2 + c)\,dx = 0$.`,
          md`$\int_{-1}^1x^n\,dx = \frac{2}{n+1}$ for even $n$. The two integral equations become $\frac{a}{5} + \frac{b}{3} + c = 0$ and $\frac{a}{7} + \frac{b}{5} + \frac{c}{3} = 0$.`,
        ],
        parts: [
          { lbl: md`$a$`, ans: 35 / 8 },
          { lbl: md`$b$`, ans: -15 / 4 },
          { lbl: md`$c$`, ans: 3 / 8 },
          { lbl: md`Why don't you need to impose orthogonality to $x$ and $x^3$?`, mc: [md`$ax^4 + bx^2 + c$ is even, so $x$ or $x^3$ times it is odd and integrates to zero automatically.`, md`Because $P_4(1) = 1$ already fixes those.`, md`Because $x$ and $x^3$ are not Legendre polynomials.`], a: 0,
            why: [null, md`$P_4(1) = 1$ is one equation; it fixes the overall size, not orthogonality.`, md`$x = P_1$ is one, and $x^3$ is a mix of $P_1$ and $P_3$. Orthogonality to them is automatic by parity, not irrelevant.`] },
        ],
        sol: md`
          **Equations.**
          1. $P_4(1) = 1$: $\;a + b + c = 1$.
          2. Orthogonal to $1$: $\;\frac{2a}{5} + \frac{2b}{3} + 2c = 0$, i.e. $3a + 5b + 15c = 0$.
          3. Orthogonal to $x^2$: $\;\frac{2a}{7} + \frac{2b}{5} + \frac{2c}{3} = 0$, i.e. $15a + 21b + 35c = 0$.

          **Solve.** Put $c = 1 - a - b$ into 2 and 3: $12a + 10b = 15$ and $20a + 14b = 35$. Eliminating $b$: $32a = 140$, so $a = \tfrac{35}{8}$; then $b = -\tfrac{15}{4} = -\tfrac{30}{8}$ and $c = \tfrac38$.

          $$P_4 = \tfrac{35}{8}x^4 - \tfrac{30}{8}x^2 + \tfrac38 = \tfrac18\left(35x^4 - 30x^2 + 3\right)$$

          Same as Rodrigues. Orthogonality to $1$ and $x^2$ is the same as orthogonality to $P_0$ and $P_2$, since those span the even polynomials of degree $\le 2$.

          **What to remember:** a Legendre polynomial is pinned down by its degree, its parity, $P_\ell(1) = 1$, and orthogonality to everything of lower degree. That is also the recognition test.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Rodrigues: $P_\ell = \dfrac{1}{2^\ell\ell!}\dfrac{d^\ell}{dx^\ell}(x^2-1)^\ell$. Prefactors $2, 8, 48, 384$. Drop low terms, differentiate, divide, check $P_\ell(1) = 1$.
          - Recurrence (tool): $(\ell+1)P_{\ell+1} = (2\ell+1)xP_\ell - \ell P_{\ell-1}$. Use it to check, to climb, and to get numbers at one $x$.
          - $P_\ell(1) = 1$, $P_\ell(-1) = (-1)^\ell$, odd ones vanish on the equator, $P_2(0) = -\tfrac12$, $P_4(0) = \tfrac38$.
          - $\ell$ zeros (nodal latitudes); $\lvert P_\ell\rvert \le 1$; leading coefficients $\tfrac32, \tfrac52, \tfrac{35}{8}$.
          - Recognise $P_\ell$: single parity, value 1 at $x = 1$, orthogonal to all lower powers.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 2: Legendre's equation
  // =====================================================================================
  FIG.saddle = saddleFig();
  FIG.coords = sph({ arcs: [], R: false, Pout: { f: 1.45, th: 40, lab: 'P\\,(r,\\theta)' }, axisLen: 50 });
  FIG.p3x = plotP([3]);
  FIG.slot = slotFig();
  FIG.q0 = PF.plot({ w: 320, h: 190, x: [-1, 1], y: [-2.6, 2.6], zero: true, xl: 'x',
    xt: [[-1, '-1'], [1, '1']], yt: [[1, '1'], [-1, '-1'], [2, '2'], [-2, '-2']],
    curves: [{ f: () => 1, cls: 'dim dash' }, { f: (x) => 0.5 * Math.log((1 + x) / (1 - x)), from: -0.995, to: 0.995, n: 300 }] });

  const L2 = {
    id: 'uL-equation', title: 'Legendre\'s equation',
    steps: [
      RF(md`
        ### Two forms of one equation

        Separating $V = R(r)\,Q(\theta)$ in Laplace's equation gives the angular equation

        $$\frac{d}{d\theta}\left(\sin\theta\,\frac{dQ}{d\theta}\right) = -\ell(\ell+1)\,Q\sin\theta$$

        This is **Legendre's equation** in its $\theta$ form. Change the variable to $x = \cos\theta$ and it becomes

        $$\left(1 - x^2\right)\frac{d^2P}{dx^2} - 2x\,\frac{dP}{dx} + \ell(\ell+1)\,P = 0, \qquad\text{equivalently}\qquad \frac{d}{dx}\left[\left(1 - x^2\right)\frac{dP}{dx}\right] + \ell(\ell+1)\,P = 0$$

        **The conversion, step by step.**

        1. Chain rule: $\dfrac{dx}{d\theta} = -\sin\theta$, so $\dfrac{d}{d\theta} = -\sin\theta\,\dfrac{d}{dx}$.
        2. $\sin\theta\,\dfrac{dQ}{d\theta} = \sin\theta\left(-\sin\theta\,\dfrac{dP}{dx}\right) = -\left(1 - x^2\right)\dfrac{dP}{dx}$, using $\sin^2\theta = 1 - x^2$.
        3. Apply $\dfrac{d}{d\theta}$ again: $\;-\sin\theta\,\dfrac{d}{dx}\left[-\left(1 - x^2\right)P'\right] = \sin\theta\,\dfrac{d}{dx}\left[\left(1 - x^2\right)P'\right]$.
        4. So $\sin\theta\,\dfrac{d}{dx}\left[(1 - x^2)P'\right] = -\ell(\ell+1)P\sin\theta$. Divide by $\sin\theta$ (nonzero for $0 \lt \theta \lt \pi$): $\;\dfrac{d}{dx}\left[(1 - x^2)P'\right] + \ell(\ell+1)P = 0$.
        5. Product rule: $\dfrac{d}{dx}\left[(1 - x^2)P'\right] = (1 - x^2)P'' - 2xP'$. That gives the first form.

        The $-2xP'$ term is the product rule acting on $(1 - x^2)$. It is the one people drop.
      `),

      Q(md`With $x = \cos\theta$, what does $\dfrac{d}{d\theta}$ become?`,
        [md`$-\sin\theta\,\dfrac{d}{dx}$`, md`$\sin\theta\,\dfrac{d}{dx}$`, md`$-\dfrac{1}{\sin\theta}\,\dfrac{d}{dx}$`, md`$-\cos\theta\,\dfrac{d}{dx}$`], 0,
        [null, md`Sign: $x = \cos\theta$ decreases as $\theta$ increases, so $dx/d\theta \lt 0$.`, md`That puts $\frac{d\theta}{dx} = -\frac{1}{\sin\theta}$ where $\frac{dx}{d\theta}$ belongs. The chain rule is $\frac{d}{d\theta} = \frac{dx}{d\theta}\frac{d}{dx}$.`, md`The derivative of $\cos\theta$ is $-\sin\theta$, not $-\cos\theta$.`],
        md`$\dfrac{d}{d\theta} = \dfrac{dx}{d\theta}\dfrac{d}{dx} = -\sin\theta\dfrac{d}{dx}$. Applied twice, each $\sin\theta$ pairs with another into $\sin^2\theta = 1 - x^2$, which is why the $x$ form has no trig functions left.`,
        { figHtml: XMAP }),

      Q(md`In $\left(1 - x^2\right)P'' - 2xP' + \ell(\ell+1)P = 0$, where does the term $-2xP'$ come from?`,
        [md`From the $\sin\theta$ on the right-hand side of the $\theta$ form`, md`From the radial equation`, md`From the chain rule $d/d\theta = -\sin\theta\,d/dx$ alone`, md`From the product rule on $\dfrac{d}{dx}\left[\left(1 - x^2\right)P'\right]$`], 3,
        [md`That $\sin\theta$ cancels against the one on the left in step 4.`, md`The radial equation only involves $r$. The two equations are separate after separation.`, md`The chain rule produces the factor $1 - x^2$. The $-2x$ is its derivative.`, null],
        md`$\frac{d}{dx}\left[(1 - x^2)P'\right] = (1 - x^2)P'' + \frac{d(1 - x^2)}{dx}P' = (1 - x^2)P'' - 2xP'$. If you work from the compact form you can't lose it.`,
        { nofig: 'calculus step, no configuration' }),

      Q(md`After separation the radial equation reads $\frac{d}{dr}\left(r^2\frac{dR}{dr}\right) = +\ell(\ell+1)R$, while the angular one carries $-\ell(\ell+1)$. Why the opposite signs?`,
        [md`A convention; either sign works for both.`, md`After dividing by $RQ$ the two pieces add to zero, so they must be equal and opposite constants.`, md`Because $\sin\theta$ is negative for $\theta \gt \pi/2$.`, md`Because $r$ and $\theta$ have different units.`], 1,
        [md`The signs are linked: choose $+\ell(\ell+1)$ for one piece and the other is forced to be $-\ell(\ell+1)$.`, null, md`$\sin\theta \ge 0$ on $[0, \pi]$.`, md`Units have nothing to do with it; each piece is dimensionless.`],
        md`$\frac{1}{R}\frac{d}{dr}(r^2R') + \frac{1}{Q\sin\theta}\frac{d}{d\theta}(\sin\theta Q') = 0$, with the first piece a function of $r$ only and the second of $\theta$ only. Each must be a constant, and the two constants sum to zero. Calling the first $\ell(\ell+1)$ is what makes the radial solutions the clean powers $r^\ell$ and $r^{-(\ell+1)}$.`,
        { figHtml: FIG.coords }),

      RF(md`
        ### Checking a solution

        **$P_2$.** $P = \tfrac12(3x^2 - 1)$, $P' = 3x$, $P'' = 3$. Substitute, keeping $\ell(\ell+1)$ unknown:

        $$\left(1 - x^2\right)3 - 2x\cdot3x + \ell(\ell+1)\cdot\tfrac12\left(3x^2 - 1\right) = 3 - 9x^2 + \ell(\ell+1)\,\frac{3x^2 - 1}{2}$$

        This vanishes for all $x$ only if $\ell(\ell+1) = 6$: then $3 - 9x^2 + 9x^2 - 3 = 0$. So $\ell = 2$, as it should be.

        **The leading-power shortcut.** For a polynomial of degree $n$ with leading coefficient $c$, the $x^n$ terms of the equation are $\left[-n(n-1) - 2n + \ell(\ell+1)\right]c\,x^n$. They must cancel, so

        $$\ell(\ell+1) = n(n+1)$$

        The degree fixes $\ell$. "What is $\ell(\ell+1)$ here?" is answered by the degree alone: $2, 6, 12, 20, 30$ for degrees $1$ to $5$.

        **A free fact (tool): $P_\ell'(1) = \frac{\ell(\ell+1)}{2}$.** At $x = 1$ the first term vanishes, leaving $-2P'(1) + \ell(\ell+1)P(1) = 0$ with $P(1) = 1$. So $P_2'(1) = 3$, $P_3'(1) = 6$, $P_4'(1) = 10$.

        **The $\theta$ form directly.** $Q = \cos\theta$: $\;\sin\theta\,\frac{dQ}{d\theta} = -\sin^2\theta$, and $\frac{d}{d\theta}\left(-\sin^2\theta\right) = -2\sin\theta\cos\theta = -2\,Q\sin\theta$. So $\ell(\ell+1) = 2$, $\ell = 1$.

        **Not every function of $\cos\theta$ is a solution.** Try $\cos2\theta = 2x^2 - 1$: $\;(1 - x^2)\cdot4 - 2x\cdot4x + \lambda(2x^2 - 1) = (4 - \lambda) + (2\lambda - 12)x^2$. The constant needs $\lambda = 4$, the $x^2$ term needs $\lambda = 6$. No single $\lambda$ works, because $\cos2\theta = \tfrac43P_2 - \tfrac13P_0$ mixes two values of $\ell$. Superposition happens in $V = \sum(A_\ell r^\ell + B_\ell r^{-(\ell+1)})P_\ell$, where each $P_\ell$ carries its own power of $r$; a single angular function $Q(\theta)$ must be one $P_\ell$.
      `),

      Q(md`A polynomial of degree 5 solves $\left(1 - x^2\right)P'' - 2xP' + \lambda P = 0$. What is $\lambda$?`,
        [md`$20$`, md`$25$`, md`$30$`, md`$6$`], 2,
        [md`That is $4\cdot5$, the value for degree 4.`, md`$n^2$ misses the $-2xP'$ term's contribution: $n(n-1) + 2n = n(n+1)$.`, null, md`That is the value for degree 2.`],
        md`The $x^5$ terms give $\left[-5\cdot4 - 2\cdot5 + \lambda\right] = 0$, so $\lambda = 30 = 5\cdot6 = \ell(\ell+1)$ with $\ell = 5$.`,
        { nofig: 'algebra on the equation' }),

      Q(md`Is $Q(\theta) = \cos2\theta$ a solution of Legendre's equation for some $\ell$?`,
        [md`Yes, $\ell = 2$, since it has degree 2 in $\cos\theta$.`, md`No. It equals $\tfrac43P_2 - \tfrac13P_0$, a mix of two different $\ell$.`, md`Yes, $\ell = 4$, since $\cos2\theta$ is the second harmonic of $\cos\theta$.`, md`Yes, for every $\ell$.`], 1,
        [md`Degree 2 is necessary but not sufficient. The constant term would need $\ell(\ell+1) = 4$ while the $x^2$ term needs $6$.`, null, md`$\cos2\theta = 2\cos^2\theta - 1$ has degree 2 in $\cos\theta$; $\ell = 4$ would need degree 4.`, md`$\ell(\ell+1)$ is one number for a given solution.`],
        md`Substituting gives $(4 - \lambda) + (2\lambda - 12)x^2 = 0$ for all $x$, which is impossible. Only single Legendre polynomials (times constants) solve it. In a potential, $\cos2\theta$ boundary data simply produce two terms, $\ell = 0$ and $\ell = 2$, with different powers of $r$.`,
        { figHtml: sphL('V_0(\\theta)=V_0\\cos2\\theta') }),

      Q(md`What is $P_4'(1)$, the slope of $P_4$ at the north pole (in $x$)?`,
        [md`$10$`, md`$4$`, md`$20$`, md`$\tfrac{35}{2}$`], 0,
        [null, md`The slope at $x = 1$ is not $\ell$; it is $\frac{\ell(\ell+1)}{2}$.`, md`That is $\ell(\ell+1)$ without the $\frac12$.`, md`$\frac{35}{2}$ is the slope of $\tfrac{35}{8}x^4$ alone. The $-\tfrac{30}{8}x^2$ term subtracts $\tfrac{60}{8}$.`],
        md`From the equation at $x = 1$: $P_\ell'(1) = \frac{\ell(\ell+1)}{2} = 10$. Directly: $P_4' = \tfrac18(140x^3 - 60x)$, which is $\tfrac{80}{8} = 10$ at $x = 1$.`,
        { figHtml: FIG.p4only }),

      Q(md`For $Q(\theta) = P_2(\cos\theta)$, what is $\dfrac{d}{d\theta}\left(\sin\theta\,\dfrac{dQ}{d\theta}\right)$?`,
        [md`$-2\,P_2(\cos\theta)\sin\theta$`, md`$6\,P_2(\cos\theta)\sin\theta$`, md`$-6\,P_2(\cos\theta)$`, md`$-6\,P_2(\cos\theta)\sin\theta$`], 3,
        [md`$-2 = -\ell(\ell+1)$ with $\ell = 1$. Here $\ell = 2$.`, md`The $\theta$ form has a minus sign: $-\ell(\ell+1)Q\sin\theta$.`, md`The $\sin\theta$ on the right is part of the $\theta$ form; it only disappears in the $x$ form.`, null],
        md`It is Legendre's equation in the $\theta$ form with $\ell(\ell+1) = 6$: $-6\,Q\sin\theta$. You can check directly: $Q = \tfrac12(3\cos^2\theta - 1)$, $\sin\theta\,Q' = -3\sin^2\theta\cos\theta$, and its $\theta$ derivative is $-3\sin\theta\,(3\cos^2\theta - 1) = -6\,P_2\sin\theta$.`,
        { figHtml: plotTh([2]) }),

      RF(md`
        ### Why $\ell$ must be a non-negative integer

        Separation only says the angular part solves the equation with *some* constant $\lambda$. Write $\lambda = \ell(\ell+1)$; nothing so far makes $\ell$ an integer. Try a power series $P = \sum c_kx^k$ in $\left(1 - x^2\right)P'' - 2xP' + \lambda P = 0$ and collect the $x^k$ terms:

        $$c_{k+2} = \frac{k(k+1) - \lambda}{(k+1)(k+2)}\,c_k$$

        - If $\lambda = \ell(\ell+1)$ with integer $\ell$, the factor vanishes at $k = \ell$, so the series with the parity of $\ell$ stops: a polynomial, $P_\ell$ up to a constant.
        - Otherwise neither series stops. For large $k$ the ratio $c_{k+2}/c_k \to 1$ with $c_k \sim 1/k$, like $\sum x^k/k$, and the sum diverges logarithmically at $x = \pm1$. No combination of the two series is finite at both poles.

        Worked, $\lambda = 6$, $c_0 = 1$, $c_1 = 0$: $c_2 = \frac{0 - 6}{2} = -3$, $c_4 = \frac{6 - 6}{12}c_2 = 0$. So $P = 1 - 3x^2 = -2P_2$.

        The second solutions are explicit for small $\ell$. For $\ell = 0$, $\frac{d}{dx}\left[(1 - x^2)P'\right] = 0$ gives $(1 - x^2)P' = C$ and

        $$Q_0(x) = \tfrac12\ln\frac{1 + x}{1 - x}$$

        For $\ell = 1$: $Q_1 = x\cdot\tfrac12\ln\frac{1+x}{1-x} - 1$. Both blow up at $x = \pm1$, i.e. on the $z$ axis.

        [[fig:q0]]

        !!key This is a boundary condition
          The requirement is physical: **$V$ is finite on the $z$ axis, at $\theta = 0$ and $\theta = \pi$.** It throws out every solution except the polynomials and forces $\ell = 0, 1, 2, \dots$ It plays the role that $V = 0$ on both plates played in the slot (Unit 6), where it quantized $k = n\pi/a$. Negative $\ell$ adds nothing: $\ell$ and $-(\ell+1)$ give the same $\ell(\ell+1)$.

        (If the region did not contain the whole axis, for example the space inside a cone $\theta \lt \alpha$, the condition at $\theta = \pi$ would be gone and non-integer $\ell$ would appear. That never happens in this course.)
      `, { q0: { svg: FIG.q0, cap: 'Both $\\ell = 0$ solutions of Legendre\'s equation. Dashed: $P_0 = 1$. Solid: $Q_0 = \\tfrac12\\ln\\frac{1+x}{1-x}$, infinite at both poles.' } }),

      Q(md`Which condition forces $\ell$ to be a non-negative integer?`,
        [md`$V$ finite on the $z$ axis, at $\theta = 0$ and $\theta = \pi$`, md`$V \to 0$ as $r \to \infty$`, md`$V$ finite at $r = 0$`, md`$V(R,\theta) = V_0(\theta)$ on the sphere`], 0,
        [null, md`That condition acts on the radial part: it removes $r^\ell$ outside. It says nothing about $\ell$.`, md`That removes $r^{-(\ell+1)}$ inside; it is also radial.`, md`That fixes the coefficients after $\ell$ is already quantized.`],
        md`Only the angular equation knows about $\ell$, and only regularity at the poles cuts its solutions down to the polynomials $P_\ell$. Every other condition acts on the radial part or on the coefficients.`,
        { figHtml: FIG.coords }),

      Q(md`In the slot of Unit 6, which boundary condition played the same role as "finite at $\theta = 0, \pi$"?`,
        [md`$V \to 0$ as $x \to \infty$`, md`$V = V_0(y)$ at $x = 0$`, md`Continuity of $V$ across $y = a/2$`, md`$V = 0$ at $y = 0$ and $y = a$, which quantized $k = n\pi/a$`], 3,
        [md`That killed the growing exponential, like $V \to 0$ at infinity kills $r^\ell$ outside.`, md`That fixed the Fourier coefficients, like $V_0(\theta)$ fixes $A_\ell$.`, md`There is no such condition in the slot.`, null],
        md`In both cases two conditions on the "angular" variable select a discrete set of eigenfunctions: $\sin(n\pi y/a)$ with integer $n$, or $P_\ell(\cos\theta)$ with integer $\ell$. Then the other variable carries the matching radial (or $x$) dependence.`,
        { figHtml: FIG.slot }),

      Q(md`For $\lambda = 12$, which starting values make the series $c_{k+2} = \frac{k(k+1) - 12}{(k+1)(k+2)}c_k$ a polynomial?`,
        [md`$c_0 = 1$, $c_1 = 0$`, md`$c_0 = 0$, $c_1 = 1$`, md`Any starting values`, md`None; $\lambda = 12$ never terminates`], 1,
        [md`The even series has $k = 0, 2, 4, \dots$; the numerator $k(k+1) - 12$ is never zero for even $k$, so it never stops.`, null, md`The even part would never stop and would diverge at the poles.`, md`$k = 3$ gives $3\cdot4 - 12 = 0$, so the odd series stops.`],
        md`$\lambda = 12 = 3\cdot4$, so $\ell = 3$ and the factor vanishes at $k = 3$, which only the odd series reaches. $c_3 = \frac{0 - 12}{6}c_1 = -2c_1$, then $c_5 = 0$: $P = x - 2x^3 \propto P_3$. The parity of $P_\ell$ comes out automatically.`,
        { nofig: 'series algebra' }),

      Q(md`$Q_0(x) = \tfrac12\ln\frac{1+x}{1-x}$ solves Legendre's equation with $\ell = 0$. Why is it never used for the potential near a sphere?`,
        [md`It is not a polynomial, so it cannot match $V_0(\theta)$.`, md`It violates $V \to 0$ at infinity.`, md`It is infinite at $\theta = 0$ and $\theta = \pi$, and the $z$ axis is inside the region.`, md`It is an odd function of $x$.`], 2,
        [md`Non-polynomial functions can match boundary data fine (step functions do). The problem is the infinity.`, md`$Q_0$ is angular; the radial factor decides behavior at infinity.`, null, md`Odd functions are fine ($P_1$, $P_3$ are odd).`],
        md`$Q_0 \to \pm\infty$ as $x \to \pm1$. A potential with charge-free space around the axis can't be infinite there, so the coefficient of $Q_0$ (and of every $Q_\ell$) must be zero.`,
        { figHtml: FIG.coords }),

      Q(md`Suppose the region were the inside of a cone, $\theta \lt 120^\circ$, so the south pole $\theta = \pi$ is not part of it (a grounded conducting cone sits along $\theta = 120^\circ$). What happens to the quantization of $\ell$?`,
        [md`Nothing: $\ell$ is still $0, 1, 2, \dots$`, md`$\ell$ must now be negative.`, md`$\ell$ is no longer forced to be an integer: finiteness at $\theta = 0$ alone keeps one solution for every $\lambda$, and the condition on the cone picks the allowed values.`, md`Separation of variables fails without the south pole.`], 2,
        [md`The integers came from demanding finiteness at **both** poles. With $\theta = \pi$ outside the region, the second demand is gone.`, md`Negative $\ell$ repeat non-negative ones ($\ell \to -\ell - 1$); that is not what changes.`, null, md`The equation still separates; only the condition that quantizes $\ell$ changes.`],
        md`For a non-integer $\lambda$ the series solution that is finite at $\theta = 0$ diverges only at $\theta = \pi$. If $\theta = \pi$ is outside the region, that solution is allowed, and $V = 0$ on the cone selects a discrete set of non-integer $\ell$, the way $V = 0$ at $y = a$ selected $k = n\pi/a$ in the slot. Remove a boundary and the condition that quantized the constant goes with it. (This never happens in this course; it shows where the integers come from.)`,
        { figHtml: (() => { const f = PF.fig(); zAxis(f, 0, 0, -110); const L = at(0, 0, 100, -120), Rt = at(0, 0, 100, 120); f.line(0, 0, L[0], L[1], { cls: 'thick' }); f.line(0, 0, Rt[0], Rt[1], { cls: 'thick' }); f.tag(Rt[0], Rt[1], 'V=0', 'r', 6, 'small'); thetaMark(f, 0, 0, 120, 18, '120^\\circ'); return f.svg(); })() }),

      Q(md`Legendre's equation is second order, so it takes two conditions. For a general constant $\lambda$, what do "finite at $\theta = 0$" and "finite at $\theta = \pi$" each do?`,
        [md`The first removes one of the two independent solutions; the second then allows a solution only when $\lambda = \ell(\ell+1)$ with integer $\ell \ge 0$.`, md`They are the same condition counted twice.`, md`Both are needed just to remove the second solution; $\ell$ is fixed later by $V(R,\theta)$.`, md`Neither matters; $\lambda$ is fixed by the radial equation.`], 0,
        [null, md`They act at different points. For non-integer $\lambda$ a solution can be finite at one pole and infinite at the other.`, md`$V(R,\theta)$ fixes the coefficients $A_\ell$, $B_\ell$ after $\ell$ is quantized; it can't change which $\ell$ exist.`, md`The radial equation accepts any $\lambda$: $r^n$ with $n(n+1) = \lambda$.`],
        md`Same pattern as the slot: one zero face removes $\cos ky$, the second forces $\sin ka = 0$. Here one pole removes the solution that is singular there, and the other pole quantizes $\lambda$. Two conditions for a second-order equation, each with its own job.`,
        { figHtml: FIG.coords }),

      Q(md`Why don't negative values like $\ell = -3$ appear in the general solution?`,
        [md`$r^{-3}$ blows up at the origin.`, md`Legendre polynomials of negative degree are not finite at the poles.`, md`They are allowed and give new solutions that are usually dropped.`, md`$\ell(\ell+1) = 6$ for $\ell = -3$, the same as $\ell = 2$, so they repeat solutions already counted.`], 3,
        [md`That is a radial statement about $r^{-(\ell+1)}$; it is about which terms survive in a region, not which $\ell$ exist.`, md`There are no Legendre polynomials of negative degree. The equation for $\ell = -3$ is the equation for $\ell = 2$.`, md`They give nothing new: same $\lambda$, same $P_2$, and the radial powers $r^{-3}$, $r^{2}$ are just swapped.`, null],
        md`The equation depends on $\ell$ only through $\ell(\ell+1)$, which is symmetric under $\ell \to -(\ell+1)$. Taking $\ell \ge 0$ counts each solution once, and the two radial powers $r^\ell$ and $r^{-(\ell+1)}$ cover both choices.`,
        { nofig: 'algebra on the separation constant' }),

      RF(md`
        ### $r^\ell P_\ell$ and $r^{-(\ell+1)}P_\ell$ are harmonic

        Put $V = R(r)\,P_\ell(\cos\theta)$ into the Laplacian (azimuthal symmetry) and use Legendre's equation on the angular piece:

        $$\nabla^2V = \frac{P_\ell}{r^2}\frac{d}{dr}\left(r^2\frac{dR}{dr}\right) + \frac{R}{r^2\sin\theta}\frac{d}{d\theta}\left(\sin\theta\frac{dP_\ell}{d\theta}\right) = \frac{P_\ell}{r^2}\left[\frac{d}{dr}\left(r^2\frac{dR}{dr}\right) - \ell(\ell+1)R\right]$$

        It vanishes when $\frac{d}{dr}(r^2R') = \ell(\ell+1)R$. For $R = r^n$: $\frac{d}{dr}(nr^{n+1}) = n(n+1)r^n$, so $n(n+1) = \ell(\ell+1)$, i.e. $n = \ell$ or $n = -(\ell+1)$.

        **Cartesian check.** Use $z = r\cos\theta$ and $r^2 = x^2 + y^2 + z^2$ (here $x$ is the Cartesian coordinate, not $\cos\theta$):

        - $r^0P_0 = 1$ and $rP_1 = z$: trivially harmonic.
        - $r^2P_2 = \tfrac12\left(3r^2\cos^2\theta - r^2\right) = \tfrac12\left(3z^2 - r^2\right) = z^2 - \tfrac12\left(x^2 + y^2\right)$, so $\nabla^2 = 2 - 1 - 1 = 0$.
        - $r^{-1}P_0 = 1/r$ and $r^{-2}P_1 = z/r^3$: the point charge and the dipole, harmonic away from the origin.

        [[fig:saddle]]

        The $\ell = 2$ inside term is a saddle: it rises along $\pm z$, falls in the $xy$ plane, and is zero on the cone $\theta = 54.7^\circ$ where $P_2 = 0$.

        !!trap $r^2\cos^2\theta$ is not harmonic
          $r^2\cos^2\theta = z^2$, and $\nabla^2z^2 = 2$. The power $r^2$ pairs with $P_2$, not with $\cos^2\theta$. Writing $V_{\text{in}} = V_0\frac{r^2}{R^2}\cos^2\theta$ for a sphere held at $V_0\cos^2\theta$ is the classic wrong answer; the right one is $V_0\left[\tfrac13 + \tfrac23\frac{r^2}{R^2}P_2(\cos\theta)\right]$.
      `, { saddle: { svg: FIG.saddle, cap: 'Equipotentials of $r^2P_2 = z^2 - \\tfrac12(x^2+y^2)$ in the $xz$ plane. Positive above and below, negative to the sides; dashed: the nodal cone $\\theta = 54.7^\\circ$.' } }),

      Q(md`Which Cartesian function equals $r^2P_2(\cos\theta)$?`,
        [md`$z^2$`, md`$\tfrac12\left(3z^2 - 1\right)$`, md`$z^2 - x^2 - y^2$`, md`$z^2 - \tfrac12\left(x^2 + y^2\right)$`], 3,
        [md`That is $r^2\cos^2\theta$, which is not harmonic.`, md`This replaced $\cos\theta$ by $z$ without the factor $r^2$ on the $-1$. Units don't match: $z^2$ and $1$.`, md`$\nabla^2 = 2 - 2 - 2 = -2 \ne 0$. The coefficients must be $1, -\tfrac12, -\tfrac12$.`, null],
        md`$r^2P_2 = \tfrac12(3z^2 - r^2) = \tfrac12(2z^2 - x^2 - y^2)$. Its Laplacian is $2 - 1 - 1 = 0$, and it has azimuthal symmetry (only $x^2 + y^2$ appears).`,
        { figHtml: FIG.coords }),

      Q(md`For which powers $n$ is $r^nP_3(\cos\theta)$ harmonic?`,
        [md`$n = 3$ and $n = -4$`, md`$n = 3$ and $n = -3$`, md`$n = 3$ only`, md`$n = -3$ and $n = 4$`], 0,
        [null, md`$n = -3$ gives $n(n+1) = 6 \ne 12$. The outside power is $-(\ell+1)$, not $-\ell$.`, md`$r^{-4}P_3$ is harmonic too (away from the origin). It is the outside term.`, md`$n = 4$ gives $20 \ne 12$.`],
        md`$n(n+1) = \ell(\ell+1) = 12$ factors as $(n - 3)(n + 4) = 0$. So $n = 3$ (inside) or $n = -4$ (outside).`,
        { figHtml: FIG.coords }),

      Q(md`Why is $V = z^2$ not a solution of Laplace's equation, even though it is $r^2$ times a function of $\theta$?`,
        [md`It is a solution; $\nabla^2z^2 = 0$.`, md`Because it grows at infinity.`, md`Because $\cos^2\theta = \tfrac13P_0 + \tfrac23P_2$ is not a single $P_\ell$, and $r^2$ only pairs with $P_2$.`, md`Because it is not azimuthally symmetric.`], 2,
        [md`$\frac{\partial^2}{\partial z^2}z^2 = 2$.`, md`$r^2P_2$ also grows at infinity and is harmonic. Growth is not the issue.`, null, md`$z^2$ has no $\phi$ dependence at all.`],
        md`$z^2 = r^2\left(\tfrac13P_0 + \tfrac23P_2\right)$. The $\tfrac23r^2P_2$ piece is harmonic; the $\tfrac13r^2P_0$ piece is not ($P_0$ needs $r^0$ or $r^{-1}$), and $\nabla^2\left(\tfrac13r^2\right) = 2$.`,
        { figHtml: FIG.saddle }),

      P({
        title: 'P₃ satisfies Legendre\'s equation',
        q: md`Verify that $P_3(x) = \tfrac12\left(5x^3 - 3x\right)$ satisfies $\left(1 - x^2\right)P'' - 2xP' + \ell(\ell+1)P = 0$. Find $P_3'$, $P_3''$, the value of $\ell(\ell+1)$ that makes it work, and $P_3'(1)$.`,
        figHtml: FIG.p3x,
        hints: [
          md`Differentiate: $P_3' = \tfrac12(15x^2 - 3)$, then $P_3''$.`,
          md`Substitute with $\lambda$ unknown and collect the $x^3$ and $x$ terms. Both must vanish for the same $\lambda$.`,
          md`Shortcut for $\lambda$: degree 3, so $\lambda = 3\cdot4$.`,
        ],
        parts: [
          { lbl: md`$P_3'(x)$`, expr: '(15*x^2 - 3)/2', vars: { x: [-1, 1] } },
          { lbl: md`$P_3''(x)$`, expr: '15*x', vars: { x: [-1, 1] } },
          { lbl: md`$\ell(\ell+1)$`, ans: 12 },
          { lbl: md`$P_3'(1)$`, ans: 6 },
        ],
        sol: md`
          $P_3' = \tfrac12(15x^2 - 3)$ and $P_3'' = 15x$. Substitute:

          $$\left(1 - x^2\right)15x - 2x\cdot\tfrac12\left(15x^2 - 3\right) + \lambda\cdot\tfrac12\left(5x^3 - 3x\right) = 15x - 15x^3 - 15x^3 + 3x + \tfrac{\lambda}{2}\left(5x^3 - 3x\right)$$

          $$= \left(-30 + \tfrac{5\lambda}{2}\right)x^3 + \left(18 - \tfrac{3\lambda}{2}\right)x$$

          The $x^3$ term needs $\lambda = 12$; the $x$ term needs $\lambda = 12$. They agree, so $P_3$ is a solution with $\ell(\ell+1) = 12$, $\ell = 3$.

          $P_3'(1) = \tfrac12(15 - 3) = 6 = \frac{\ell(\ell+1)}{2}$, as the equation at $x = 1$ predicts.

          **What to remember:** when you verify, keep $\lambda$ unknown and show every power gives the same $\lambda$. That is the content of "it is a solution". A function that needs two different $\lambda$'s (like $\cos2\theta$) is not.
        `,
      }),

      P({
        title: 'A degree-3 solution from scratch',
        q: md`Look for a solution of $\left(1 - x^2\right)P'' - 2xP' + \lambda P = 0$ of the form $P = Ax^3 + Bx$. (a) Find $\lambda$. (b) Find $B/A$. (c) Fix $A$ by the normalisation $P(1) = 1$.`,
        nofig: 'pure algebra on the equation',
        hints: [
          md`$P' = 3Ax^2 + B$, $P'' = 6Ax$. Substitute and collect $x^3$ and $x$.`,
          md`The $x^3$ coefficient is $A(\lambda - 12)$. The $x$ coefficient is $6A + B(\lambda - 2)$.`,
        ],
        parts: [
          { lbl: md`(a) $\lambda$`, ans: 12 },
          { lbl: md`(b) $B/A$`, ans: -0.6 },
          { lbl: md`(c) $A$`, ans: 2.5 },
        ],
        sol: md`
          Substitute $P = Ax^3 + Bx$:

          $$\left(1 - x^2\right)6Ax - 2x\left(3Ax^2 + B\right) + \lambda\left(Ax^3 + Bx\right) = A(\lambda - 12)\,x^3 + \left[6A + B(\lambda - 2)\right]x = 0$$

          (a) $A \ne 0$, so $\lambda = 12 = 3\cdot4$.

          (b) $6A + 10B = 0$, so $B = -\tfrac35A$.

          (c) $P(1) = A + B = \tfrac25A = 1$, so $A = \tfrac52$ and $B = -\tfrac32$: $\;P = \tfrac12(5x^3 - 3x) = P_3$.

          **What to remember:** Legendre's equation plus $P(1) = 1$ determines $P_\ell$ completely. Rodrigues' formula is just a closed form for the result.
        `,
      }),

      P({
        title: 'r³P₃ in Cartesian coordinates',
        q: md`(a) Write $r^3P_3(\cos\theta)$ in Cartesian coordinates $x, y, z$. (b) Compute $\dfrac{\partial^2}{\partial z^2}$ of it and $\dfrac{\partial^2}{\partial x^2}$ of it, and check that the Laplacian vanishes. (c) Give the other power $n$ for which $r^nP_3(\cos\theta)$ is harmonic.`,
        figHtml: FIG.coords,
        hints: [
          md`$r^3P_3 = \tfrac12\left(5r^3\cos^3\theta - 3r^3\cos\theta\right) = \tfrac12\left(5z^3 - 3zr^2\right)$, with $r^2 = x^2 + y^2 + z^2$.`,
          md`Simplify to $z^3 - \tfrac32z(x^2 + y^2)$ before differentiating.`,
          md`For (c): $n(n+1) = 12$.`,
        ],
        parts: [
          { lbl: md`(a) $r^3P_3$ in terms of $x, y, z$`, expr: 'z^3 - 3*z*(x^2 + y^2)/2', vars: { x: [-2, 2], y: [-2, 2], z: [0.3, 2] }, accepts: ['(5*z^3 - 3*z*(x^2+y^2+z^2))/2', '(2*z^3 - 3*z*x^2 - 3*z*y^2)/2'] },
          { lbl: md`(b) $\dfrac{\partial^2}{\partial z^2}\left(r^3P_3\right)$`, expr: '6*z', vars: { z: [0.3, 2] } },
          { lbl: md`(b) $\dfrac{\partial^2}{\partial x^2}\left(r^3P_3\right)$`, expr: '-3*z', vars: { z: [0.3, 2] } },
          { lbl: md`(c) the negative power $n$`, ans: -4 },
        ],
        sol: md`
          **(a)** $z = r\cos\theta$:

          $$r^3P_3 = \tfrac12\left(5z^3 - 3z\,r^2\right) = \tfrac12\left(5z^3 - 3z(x^2 + y^2 + z^2)\right) = z^3 - \tfrac32z\left(x^2 + y^2\right)$$

          **(b)** $\partial_z^2 = 6z$, $\;\partial_x^2 = -3z$, $\;\partial_y^2 = -3z$. Sum: $6z - 3z - 3z = 0$. Harmonic.

          **(c)** $(n - 3)(n + 4) = 0$, so $n = -4$: $r^{-4}P_3$ is the outside partner.

          **What to remember:** $r^\ell P_\ell$ in Cartesian form is a homogeneous polynomial of degree $\ell$ whose Laplacian vanishes: $1$, $z$, $z^2 - \tfrac12(x^2+y^2)$, $z^3 - \tfrac32z(x^2+y^2)$. If an exam gives you $V$ inside in Cartesian form, this is how you recognise the $\ell$ content.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - $\theta$ form $\frac{d}{d\theta}(\sin\theta\,Q') = -\ell(\ell+1)Q\sin\theta$; with $x = \cos\theta$, $d/d\theta = -\sin\theta\,d/dx$, it becomes $(1 - x^2)P'' - 2xP' + \ell(\ell+1)P = 0$.
          - Degree $n$ solution means $\ell(\ell+1) = n(n+1)$. Free fact: $P_\ell'(1) = \ell(\ell+1)/2$.
          - A function of $\cos\theta$ solves the equation only if it is a single $P_\ell$. Mixtures don't.
          - $\ell$ is a non-negative integer because $V$ must be finite on the $z$ axis ($\theta = 0, \pi$). That is a boundary condition, the analog of $V = 0$ on the slot's plates.
          - $r^\ell P_\ell$ and $r^{-(\ell+1)}P_\ell$ are harmonic: $n(n+1) = \ell(\ell+1)$. Cartesian: $r^2P_2 = z^2 - \tfrac12(x^2 + y^2)$.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 3: orthogonality and coefficients
  // =====================================================================================
  FIG.p23th = plotTh([2, 3]);
  FIG.p2sq = PF.plot({ w: 320, h: 190, x: [-1, 1], y: [-0.6, 1.15], zero: true, xl: 'x',
    xt: [[-1, '-1'], [1, '1']], yt: [[1, '1'], [-0.5, '-\\tfrac12']],
    curves: [{ f: (x) => Pl(2, x) * Pl(2, x) }, { f: (x) => Pl(2, x), cls: 'dim dash' }] });
  FIG.p13prod = PF.plot({ w: 320, h: 190, x: [-1, 1], y: [-1.15, 1.15], zero: true, xl: 'x',
    xt: [[-1, '-1'], [1, '1']], yt: [[1, '1'], [-1, '-1']],
    curves: [{ f: (x) => Pl(1, x) * Pl(2, x) }, { f: (x) => Pl(1, x), cls: 'dim dash' }, { f: (x) => Pl(2, x), cls: 'dim' }] });

  const L3 = {
    id: 'uL-orth', title: 'Orthogonality and coefficients',
    steps: [
      RF(md`
        ### The statement

        $$\int_{-1}^{1}P_\ell(x)\,P_{\ell'}(x)\,dx = \int_0^\pi P_\ell(\cos\theta)\,P_{\ell'}(\cos\theta)\,\sin\theta\,d\theta = \frac{2}{2\ell+1}\,\delta_{\ell\ell'}$$

        $\delta_{\ell\ell'}$ is $1$ when $\ell = \ell'$ and $0$ otherwise. Two facts in one line: different $\ell$ are orthogonal, and the same $\ell$ gives $\frac{2}{2\ell+1}$. Neither is on the formula sheet.

        **Why it is true (for the curious).** Write Legendre's equation for $P_\ell$ and for $P_m$: $\left[(1-x^2)P_\ell'\right]' = -\ell(\ell+1)P_\ell$, and the same with $m$. Multiply the first by $P_m$, the second by $P_\ell$, and subtract. The left side is an exact derivative:

        $$\frac{d}{dx}\Big[\left(1 - x^2\right)\left(P_mP_\ell' - P_\ell P_m'\right)\Big] = \left[m(m+1) - \ell(\ell+1)\right]P_\ell P_m$$

        Integrate over $[-1, 1]$. The left side is zero because $1 - x^2 = 0$ at both ends. So for $\ell \ne m$, $\int P_\ell P_m\,dx = 0$. The poles, where the regularity condition lives, are also what makes orthogonality work.

        ### Fourier's trick: the coefficient formula

        Completeness says any reasonable $f$ on $[-1, 1]$ can be written $f(x) = \sum_\ell a_\ell P_\ell(x)$. Multiply both sides by $P_m(x)$ and integrate:

        $$\int_{-1}^1 f\,P_m\,dx = \sum_\ell a_\ell\int_{-1}^1P_\ell P_m\,dx = \sum_\ell a_\ell\,\frac{2}{2\ell+1}\,\delta_{\ell m} = a_m\,\frac{2}{2m+1}$$

        $$\boxed{a_\ell = \frac{2\ell+1}{2}\int_{-1}^{1}f(x)\,P_\ell(x)\,dx = \frac{2\ell+1}{2}\int_0^\pi f(\theta)\,P_\ell(\cos\theta)\,\sin\theta\,d\theta}$$

        It is the slot's sine-series trick again: multiply by one basis function, integrate, and orthogonality kills every term but one. The factor in front is one over the norm, as $\frac2a$ was one over $\int\sin^2 = \frac a2$ (Unit 8, Lesson 3 has the side-by-side table). For a sphere held at $V_0(\theta)$, the coefficient $A_\ell = \frac{2\ell+1}{2R^\ell}\int_0^\pi V_0P_\ell\sin\theta\,d\theta$ is exactly this with $f = V_0$ and $a_\ell = A_\ell R^\ell$.

        One coefficient has a meaning of its own: $a_0 = \frac12\int_{-1}^1f\,dx$ is the **average of $f$ over the sphere's surface**.
      `),

      Q(md`What is $\displaystyle\int_0^\pi P_2(\cos\theta)\,P_4(\cos\theta)\,\sin\theta\,d\theta$?`,
        [md`$\tfrac25$`, md`$0$`, md`$\tfrac29$`, md`$\tfrac{4}{45}$`], 1,
        [md`$\tfrac25$ is $\int P_2^2$. Different indices give zero.`, null, md`$\tfrac29$ is $\int P_4^2$.`, md`Products of the two norms mean nothing here. Different $\ell$: orthogonal.`],
        md`$\ell \ne \ell'$, so the integral vanishes. You don't multiply anything out; that is the point of orthogonality. Note it is not parity: $P_2P_4$ is even, and it still integrates to zero.`,
        { figHtml: plotTh([2, 4]) }),

      Q(md`To get $a_m$ from $f(x) = \sum_\ell a_\ell P_\ell(x)$, what do you multiply both sides by, and over what do you integrate?`,
        [md`$P_m(x)$, then integrate over $0 \le x \le 1$`, md`$\sin\theta$, then integrate over $0 \le \theta \le \pi$`, md`$P_m(\cos\theta)$, then integrate $d\theta$ over $[0, \pi]$ with no other factor`, md`$P_m(x)$, then integrate over $-1 \le x \le 1$`], 3,
        [md`Orthogonality holds on the full interval $[-1, 1]$. On $[0, 1]$, $\int_0^1P_1P_2\,dx = \tfrac18 \ne 0$.`, md`That only extracts $a_0$ (times 2). You need a different basis function for each $m$.`, md`Without $\sin\theta$ this is not the orthogonality integral; cross terms survive.`, null],
        md`Multiply by $P_m(x)$ and integrate $dx$ over $[-1, 1]$, or equivalently by $P_m(\cos\theta)\sin\theta$ and integrate $d\theta$ over $[0, \pi]$. Sphere problems usually use the second form.`,
        { figHtml: XMAP }),

      Q(md`Why is the prefactor in $a_\ell = \frac{2\ell+1}{2}\int_{-1}^1 fP_\ell\,dx$ equal to $\frac{2\ell+1}{2}$ and not $1$?`,
        [md`Because $\int_{-1}^1P_\ell^2\,dx = \frac{2}{2\ell+1}$, and the formula divides by that norm.`, md`Because the interval $[-1, 1]$ has length 2, and nothing else.`, md`Because $P_\ell(1) = 1$.`, md`It is a convention: with the standard $P_\ell$ you may use either $1$ or $\frac{2\ell+1}{2}$.`], 0,
        [null, md`The length explains the 2 in the numerator of $\frac{2}{2\ell+1}$, but the $2\ell + 1$ depends on $\ell$.`, md`$P_\ell(1) = 1$ fixes the size of $P_\ell$, and so its norm, but the factor itself is the inverse norm.`, md`With the standard $P_\ell$ (fixed by $P_\ell(1) = 1$) the factor is forced. Using $1$ makes every $a_\ell$ too small by $\frac{2}{2\ell+1}$: for $f = P_2$ you would get $a_2 = \tfrac25$ instead of $1$.`],
        md`From $\int fP_m = a_m\frac{2}{2m+1}$. Sanity check with $f = P_2$: $a_2 = \tfrac52\cdot\tfrac25 = 1$.`,
        { nofig: 'about a formula' }),

      Q(md`In the orthogonality proof, what makes the boundary term $\left[\left(1 - x^2\right)\left(P_mP_\ell' - P_\ell P_m'\right)\right]_{-1}^{1}$ vanish?`,
        [md`$P_\ell(\pm1) = \pm1$`, md`Parity of the integrand`, md`The factor $1 - x^2$, which is zero at $x = \pm1$`, md`The assumption $\ell \ne m$`], 2,
        [md`The $P$ values at the ends are finite (that is needed) but not zero. The zero comes from $1 - x^2$.`, md`The boundary term is evaluated at two points, not integrated; parity is beside the point.`, null, md`$\ell \ne m$ is used after, to divide by $m(m+1) - \ell(\ell+1)$.`],
        md`$(1 - x^2) = \sin^2\theta$ vanishes at the poles. That needs $P_\ell$ and $P_\ell'$ to be finite there, which is exactly the regularity condition. The second solutions $Q_\ell$ (infinite at the poles) would not be orthogonal in this way.`,
        { figHtml: XMAP }),

      RF(md`
        ### Normalisation by hand

        $$\int_{-1}^1P_1^2\,dx = \int_{-1}^1x^2\,dx = \frac23$$

        $$\int_{-1}^1P_2^2\,dx = \frac14\int_{-1}^1\left(9x^4 - 6x^2 + 1\right)dx = \frac14\left(\frac{18}{5} - 4 + 2\right) = \frac14\cdot\frac85 = \frac25$$

        [[fig:sq]]

        The pattern is $\frac{2}{2\ell+1}$: $\;2, \tfrac23, \tfrac25, \tfrac27, \tfrac29, \tfrac{2}{11}$. Use $\int_{-1}^1x^n\,dx = \frac{2}{n+1}$ for even $n$ (and $0$ for odd $n$).

        !!trap Half the interval gives half the answer
          $\int_0^1P_2^2\,dx = \tfrac15$, not $\tfrac25$. For a squared polynomial the integrand is even, so integrating over $[0, 1]$ gives exactly half. Integrate over the full $[-1, 1]$, or double.
      `, { sq: { svg: FIG.p2sq, cap: 'Solid: $P_2^2$. Dashed: $P_2$. The area under the solid curve on $[-1, 1]$ is $\\tfrac25$.' } }),

      Q(md`What is $\displaystyle\int_0^\pi\left[P_5(\cos\theta)\right]^2\sin\theta\,d\theta$?`,
        [md`$1$`, md`$\tfrac29$`, md`$\tfrac{1}{11}$`, md`$\tfrac{2}{11}$`], 3,
        [md`The $P_\ell$ are normalised by $P_\ell(1) = 1$, not to unit norm.`, md`That is $\ell = 4$.`, md`The numerator is 2 (the length of $[-1, 1]$).`, null],
        md`$\frac{2}{2\ell+1}$ with $\ell = 5$: $\frac{2}{11}$. The $\sin\theta$ and the $x = \cos\theta$ substitution make the $\theta$ form identical to the $x$ form.`,
        { figHtml: plotTh([5]) }),

      Q(md`A student computes $\int P_2^2$ as $\tfrac14\left(\tfrac95 - 2 + 1\right) = \tfrac15$. What went wrong?`,
        [md`Nothing; the answer is $\tfrac15$.`, md`They integrated over $[0, 1]$ instead of $[-1, 1]$, which halves an even integrand.`, md`$P_2$ should be $\tfrac12(3x^2 + 1)$.`, md`They should have used $\int_0^\pi$ without $\sin\theta$.`], 1,
        [md`The normalisation is $\frac{2}{2\cdot2 + 1} = \frac25$.`, null, md`$P_2 = \tfrac12(3x^2 - 1)$; the sign is right in their integrand ($-6x^2$ cross term).`, md`Dropping $\sin\theta$ changes the integral; it does not fix it.`],
        md`$\int_0^1x^4 = \tfrac15$, $\int_0^1x^2 = \tfrac13$, $\int_0^11 = 1$: that is their $\tfrac95 - 2 + 1$. Over $[-1, 1]$ each doubles: $\tfrac14\left(\tfrac{18}{5} - 4 + 2\right) = \tfrac25$.`,
        { figHtml: FIG.p2sq }),

      RF(md`
        ### The $\sin\theta$ weight and the substitution

        With $x = \cos\theta$: $dx = -\sin\theta\,d\theta$, and $\theta: 0 \to \pi$ means $x: 1 \to -1$. So

        $$\int_0^\pi g(\cos\theta)\,\sin\theta\,d\theta = \int_1^{-1}g(x)\,(-dx) = \int_{-1}^{1}g(x)\,dx$$

        The minus sign from $dx$ and the flipped limits cancel. The two ways to get it wrong: keep only one of them (answer has the wrong sign), or forget the $\sin\theta$ and integrate in $\theta$ (wrong integral). The $\sin\theta$ is the area of a latitude band (Unit 8, Lesson 2): orthogonality is a statement about averaging over the sphere's surface.

        | $\theta$ range | $x$ range |
        |---|---|
        | $0$ to $\pi$ (whole sphere) | $-1$ to $1$ |
        | $0$ to $\frac\pi2$ (northern hemisphere) | $0$ to $1$ |
        | $\frac\pi2$ to $\pi$ (southern hemisphere) | $-1$ to $0$ |
        | $0$ to $\alpha$ (polar cap) | $\cos\alpha$ to $1$ |

        Worked: $\int_0^\pi\cos^2\theta\sin\theta\,d\theta = \int_{-1}^1x^2\,dx = \tfrac23$. Over the northern hemisphere: $\int_0^{\pi/2}P_1(\cos\theta)\sin\theta\,d\theta = \int_0^1x\,dx = \tfrac12$.
      `),

      Q(md`Rewrite $\displaystyle\int_0^{\pi/3}f(\cos\theta)\,\sin\theta\,d\theta$ in terms of $x = \cos\theta$.`,
        [md`$\displaystyle\int_{1/2}^{1}f(x)\,dx$`, md`$\displaystyle\int_0^{1/2}f(x)\,dx$`, md`$\displaystyle\int_0^{\pi/3}f(x)\,dx$`, md`$\displaystyle-\int_{1/2}^{1}f(x)\,dx$`], 0,
        [null, md`$\theta = 0$ is $x = 1$, not $x = 0$. The cap near the north pole is near $x = 1$.`, md`The limits must be converted too: $\cos0 = 1$, $\cos\frac\pi3 = \tfrac12$.`, md`The minus from $dx = -\sin\theta\,d\theta$ is used up flipping the limits from $\int_1^{1/2}$ to $\int_{1/2}^1$.`],
        md`$\theta = 0 \to x = 1$, $\theta = \frac\pi3 \to x = \tfrac12$. $\int_1^{1/2}f\,(-dx) = \int_{1/2}^1f\,dx$. A polar cap of half-angle $\alpha$ is always $\cos\alpha \le x \le 1$.`,
        { figHtml: XMAP }),

      Q(md`A student writes $\displaystyle\int_0^\pi P_1^2\sin\theta\,d\theta = \int_1^{-1}x^2\,dx = -\tfrac23$. What happened?`,
        [md`Nothing. The integral is negative because $\cos\theta \lt 0$ for $\theta \gt \pi/2$.`, md`The weight should have been $\cos\theta$.`, md`They dropped the minus sign in $dx = -\sin\theta\,d\theta$; with it, $\int_1^{-1}x^2(-dx) = \tfrac23$.`, md`Orthogonality integrals can be negative; $-\tfrac23$ is fine.`], 2,
        [md`The integrand $P_1^2\sin\theta$ is never negative, so the integral can't be.`, md`The weight is $\sin\theta$, the band area.`, null, md`$\int P_\ell^2 \gt 0$ always; cross integrals $\int P_\ell P_{\ell'}$ are zero, not negative.`],
        md`Substitution gives two signs: one from $dx = -\sin\theta\,d\theta$, one from flipping $\int_1^{-1} \to \int_{-1}^1$. Keep both and they cancel: $\tfrac23$. Quick check: a squared function integrated with a positive weight is positive.`,
        { figHtml: plotTh([1]) }),

      Q(md`What is $\displaystyle\int_0^{\pi/2}P_2(\cos\theta)\,\sin\theta\,d\theta$, the integral over the northern hemisphere only?`,
        [md`$\tfrac15$`, md`$0$`, md`$-\tfrac12$`, md`$\tfrac25$`], 1,
        [md`$\tfrac15$ is $\int_0^1P_2^2$. Here there is no square.`, null, md`$-\tfrac12$ is $P_2$ at the equator, not an integral.`, md`That is the full-range $\int P_2^2$.`],
        md`$\int_0^1P_2\,dx = \tfrac12\left[x^3 - x\right]_0^1 = 0$. In general $\int_0^1P_\ell\,dx = 0$ for even $\ell \ge 2$: the integrand is even, so the half-range integral is half of $\int_{-1}^1P_\ell P_0 = 0$. Odd $\ell$ do not vanish on a half range: $\int_0^1P_1 = \tfrac12$, $\int_0^1P_3 = -\tfrac18$.`,
        { figHtml: plotTh([2]) }),

      RF(md`
        ### Shortcuts: most integrals are zero before you start

        1. **Degree.** A polynomial of degree $k \lt \ell$ is a combination of $P_0, \dots, P_k$, all orthogonal to $P_\ell$. So $\int_{-1}^1x^kP_\ell\,dx = 0$ for $k \lt \ell$. Examples: $\int x^2P_3 = 0$, $\int(1 + x + x^2)P_4 = 0$.
        2. **Parity.** If $f$ has the opposite parity to $P_\ell$, then $fP_\ell$ is odd and integrates to $0$ on $[-1, 1]$. Examples: $\int x^4P_3 = 0$, $\int x^3P_2 = 0$.
        3. **Same parity, $k \ge \ell$.** Write $x^k$ in Legendre polynomials; only its $P_\ell$ piece survives, giving (that coefficient)$\times\frac{2}{2\ell+1}$. With $x^3 = \tfrac35P_1 + \tfrac25P_3$: $\int x^3P_1 = \tfrac35\cdot\tfrac23 = \tfrac25$, $\int x^3P_3 = \tfrac25\cdot\tfrac27 = \tfrac{4}{35}$. With $x^4 = \tfrac15P_0 + \tfrac47P_2 + \tfrac{8}{35}P_4$: $\int x^4P_2 = \tfrac47\cdot\tfrac25 = \tfrac{8}{35}$.
        4. **$k = \ell$ (tool):** $\int_{-1}^1x^\ell P_\ell\,dx = \dfrac{2^{\ell+1}(\ell!)^2}{(2\ell+1)!}$: $\;2, \tfrac23, \tfrac{4}{15}, \tfrac{4}{35}, \tfrac{16}{315}$. It is the norm $\frac{2}{2\ell+1}$ divided by the leading coefficient.
        5. **Half range:** $\int_0^1P_\ell\,dx = 1, \tfrac12, 0, -\tfrac18, 0, \tfrac{1}{16}$ for $\ell = 0$ to $5$. These are what step-function data need (Lesson 4).

        [[fig:par]]

        !!method Before you integrate
          Ask two questions. Is the degree of the other factor below $\ell$? Is its parity opposite to $\ell$'s? If either is yes, the answer is $0$. Only otherwise expand or integrate.
      `, { par: { svg: FIG.p13prod, cap: 'Parity at work: $P_1$ (dim dashed) is odd, $P_2$ (dim) is even, and their product (solid) is odd, so its integral over $[-1, 1]$ is zero.' } }),

      Q(md`What is $\displaystyle\int_{-1}^{1}\left(1 + 4x + 7x^2\right)P_3(x)\,dx$?`,
        [md`$7\cdot\tfrac27$`, md`$4\cdot\tfrac25$`, md`$1$`, md`$0$`], 3,
        [md`$x^2$ has degree 2, below 3, and it is even while $P_3$ is odd. It contributes nothing.`, md`$4x$ has degree 1, below 3. $\int xP_3 = 0$ by orthogonality to $P_1$.`, md`The constant has degree 0. $\int P_3 = 0$.`, null],
        md`Every term has degree below 3, so each is a combination of $P_0, P_1, P_2$, all orthogonal to $P_3$. Zero, with no algebra.`,
        { figHtml: FIG.p3x }),

      Q(md`What is $\displaystyle\int_{-1}^{1}x^4P_3(x)\,dx$?`,
        [md`$0$`, md`$\tfrac{4}{35}$`, md`$\tfrac{8}{63}$`, md`$\tfrac27$`], 0,
        [null, md`That is $\int x^3P_3$. Here the power is 4, even, while $P_3$ is odd.`, md`That is $\int x^5P_3$.`, md`That is $\int P_3^2$.`],
        md`$x^4$ is even and $P_3$ is odd, so the integrand is odd: zero. Degree alone would not settle this one ($4 \gt 3$); parity does.`,
        { figHtml: FIG.p3x }),

      Q(md`What is $\displaystyle\int_{-1}^{1}x^3P_3(x)\,dx$?`,
        [md`$\tfrac27$`, md`$\tfrac25$`, md`$\tfrac{4}{35}$`, md`$0$`], 2,
        [md`$\tfrac27 = \int P_3^2$. But $x^3$ is not $P_3$: $x^3 = \tfrac25P_3 + \tfrac35P_1$.`, md`$\tfrac25$ is the coefficient of $P_3$ in $x^3$ (and also $\int x^3P_1$). Multiply by the norm $\tfrac27$.`, null, md`Same parity and degree $= \ell$: it can't vanish.`],
        md`Only the $\tfrac25P_3$ piece of $x^3$ survives: $\tfrac25\cdot\tfrac27 = \tfrac{4}{35}$. Brute force: $\tfrac12\int(5x^6 - 3x^4)\,dx = \tfrac12\left(\tfrac{10}{7} - \tfrac65\right) = \tfrac{4}{35}$.`,
        { figHtml: FIG.p3x }),

      Q(md`What is $\displaystyle\int_{-1}^{1}(1 + x)^2P_2(x)\,dx$?`,
        [md`$0$`, md`$\tfrac25$`, md`$\tfrac{8}{15}$`, md`$\tfrac{4}{15}$`], 3,
        [md`The $x^2$ term has degree 2 and the right parity, so it survives.`, md`$\tfrac25$ is $\int P_2^2$; $(1 + x)^2$ is not $P_2$.`, md`Double counting: only the $x^2$ term survives, once.`, null],
        md`$(1 + x)^2 = 1 + 2x + x^2$. The $1$ (degree 0) and $2x$ (degree 1) die. $\int x^2P_2 = \tfrac23\cdot\tfrac25 = \tfrac{4}{15}$.`,
        { figHtml: plotP([2]) }),

      Q(md`What is $\displaystyle\int_0^1P_3(x)\,dx$, over half the interval?`,
        [md`$0$`, md`$-\tfrac18$`, md`$\tfrac18$`, md`$-\tfrac14$`], 1,
        [md`Odd $P_\ell$ do not integrate to zero over half the interval. Only the full-range integral vanishes.`, null, md`Sign: $\tfrac12\left[\tfrac54x^4 - \tfrac32x^2\right]_0^1 = \tfrac12\left(\tfrac54 - \tfrac32\right) \lt 0$.`, md`The factor $\tfrac12$ in $P_3$ was dropped.`],
        md`$\tfrac12\left(\tfrac54 - \tfrac32\right) = -\tfrac18$. This number is why the $\pm V_0$ hemispheres have $a_3 = 7\cdot\left(-\tfrac18\right) = -\tfrac78$.`,
        { figHtml: FIG.p3x }),

      Q(md`For boundary data $f(\theta)$ on a sphere, what does $a_0 = \tfrac12\int_0^\pi f(\theta)\sin\theta\,d\theta$ represent?`,
        [md`The value of $f$ at the north pole`, md`The average of $f$ over $\theta$ from $0$ to $\pi$`, md`The average of $f$ over the sphere's surface`, md`The value of $f$ on the equator`], 2,
        [md`The north-pole value is $\sum_\ell a_\ell$, all coefficients together.`, md`That would be $\frac1\pi\int_0^\pi f\,d\theta$, with no $\sin\theta$. It overweights the poles.`, null, md`The equator value is $\sum a_\ell P_\ell(0) = a_0 - \tfrac12a_2 + \tfrac38a_4 - \dots$`],
        md`$\frac{1}{4\pi R^2}\oint f\,da = \frac{1}{4\pi R^2}\int_0^\pi f\,2\pi R^2\sin\theta\,d\theta = \tfrac12\int_0^\pi f\sin\theta\,d\theta = a_0$. For a sphere held at $V_0(\theta)$ this is the potential at the center.`,
        { figHtml: XMAP }),

      Q(md`What is the Legendre expansion of $x\,P_2(x)$?`,
        [md`$P_3$`, md`$\tfrac25P_1 + \tfrac35P_3$`, md`$\tfrac35P_1 + \tfrac25P_3$`, md`$\tfrac32P_3 - \tfrac12P_1$`], 1,
        [md`$xP_2 = \tfrac32x^3 - \tfrac12x$ has leading coefficient $\tfrac32$, while $P_3$ has $\tfrac52$. It passes the pole check ($1$), but the shape is wrong.`, null, md`Those are the coefficients of $x^3$ itself. Here $x^3$ is multiplied by $\tfrac32$ and $\tfrac12x$ is subtracted.`, md`That just renames $x^3$ as $P_3$ and $x$ as $P_1$. Powers are not Legendre polynomials.`],
        md`$xP_2 = \tfrac32x^3 - \tfrac12x = \tfrac32\left(\tfrac25P_3 + \tfrac35P_1\right) - \tfrac12P_1 = \tfrac35P_3 + \tfrac25P_1$. Pole check: $1$. It is the recurrence read backwards, $xP_\ell = \dfrac{(\ell+1)P_{\ell+1} + \ell P_{\ell-1}}{2\ell+1}$: multiplying by $x = \cos\theta$ only couples neighbouring $\ell$.`,
        { figHtml: plotP([1, 2, 3]) }),

      Q(md`$\left[P_2(x)\right]^2$ is a polynomial of degree 4. What is its $P_0$ coefficient $a_0$?`,
        [md`$0$, by orthogonality`, md`$\tfrac25$`, md`$\tfrac15$`, md`$\tfrac14$`], 2,
        [md`Orthogonality says $\int P_2P_0\,dx = 0$. Here the integrand is $P_2\cdot P_2\cdot P_0$, and $\int P_2^2\,dx \ne 0$.`, md`That is $\int_{-1}^1P_2^2\,dx$ itself. $a_0$ is half of it: $\tfrac12\int f\,dx$.`, null, md`$\tfrac14$ is $P_2(0)^2$, the value on the equator, not the average.`],
        md`$a_0 = \tfrac12\int_{-1}^1P_2^2\,dx = \tfrac12\cdot\tfrac25 = \tfrac15$: the average of $P_2^2$ over the sphere. The full expansion is $\tfrac15P_0 + \tfrac27P_2 + \tfrac{18}{35}P_4$ (pole check: $1$). The norm $\tfrac{2}{2\ell+1}$ is twice the surface average of $P_\ell^2$.`,
        { figHtml: FIG.p2sq }),

      Q(md`You may use only $P_0$ and $P_1$ to approximate $f(x) = x^3$ on $[-1, 1]$, with the smallest mean-square error. Which combination?`,
        [md`$x$, which matches $f$ at $x = \pm1$`, md`$\tfrac35x$`, md`$\tfrac12x$`, md`$0$, because $x^3$ is not a combination of $P_0$ and $P_1$`], 1,
        [md`That matches $f$ at the poles but sits above it in between. Least squares weights the whole interval.`, null, md`$\tfrac12$ is not the projection: $a_1 = \tfrac32\int_{-1}^1x^4\,dx = \tfrac35$.`, md`Zero is a poor fit: the $P_1$ part of $x^3$ is not zero.`],
        md`The best fit with a few Legendre polynomials is the truncated Legendre series: $a_\ell = \tfrac{2\ell+1}{2}\int fP_\ell\,dx$ for the kept $\ell$, whatever you drop. Here $a_0 = 0$, $a_1 = \tfrac35$. That is why "keep the first two terms" is a controlled approximation: adding terms never changes the earlier ones, and each one lowers the error.`,
        { figHtml: plotP([1, 3]) }),

      G('leg_integral', { need: 4 }),

      P({
        title: 'The norm of P₃ by hand',
        q: md`(a) Compute $\int_{-1}^1P_3^2\,dx$ by expanding the square. (b) Compute $\int_{-1}^1P_1P_3\,dx$. (c) Compute $\int_{-1}^1x^3P_3\,dx$ and check it against shortcut 4. (Plot: $P_3$.)`,
        figHtml: FIG.p3x,
        hints: [
          md`$P_3^2 = \tfrac14\left(25x^6 - 30x^4 + 9x^2\right)$. Use $\int_{-1}^1x^n\,dx = \frac{2}{n+1}$ for even $n$.`,
          md`(b) $\tfrac12\int\left(5x^4 - 3x^2\right)dx$. (c) $\tfrac12\int\left(5x^6 - 3x^4\right)dx$.`,
        ],
        parts: [
          { lbl: md`(a) $\int P_3^2\,dx$`, ans: 2 / 7 },
          { lbl: md`(b) $\int P_1P_3\,dx$`, ans: 0 },
          { lbl: md`(c) $\int x^3P_3\,dx$`, ans: 4 / 35 },
        ],
        sol: md`
          **(a)** $\displaystyle\int_{-1}^1P_3^2\,dx = \frac14\left(25\cdot\frac27 - 30\cdot\frac25 + 9\cdot\frac23\right) = \frac14\left(\frac{50}{7} - 12 + 6\right) = \frac14\cdot\frac{8}{7} = \frac27$, which is $\frac{2}{2\cdot3+1}$.

          **(b)** $\displaystyle\frac12\int_{-1}^1\left(5x^4 - 3x^2\right)dx = \frac12\left(2 - 2\right) = 0$. Orthogonality, by brute force.

          **(c)** $\displaystyle\frac12\int_{-1}^1\left(5x^6 - 3x^4\right)dx = \frac12\left(\frac{10}{7} - \frac65\right) = \frac{4}{35}$. Shortcut 4: $\frac{2^4(3!)^2}{7!} = \frac{576}{5040} = \frac{4}{35}$. And $\int P_3^2 = \tfrac52\cdot\tfrac{4}{35} = \tfrac27$: the norm is the leading coefficient times $\int x^3P_3$, because the lower part of $P_3$ is orthogonal to $P_3$.

          **What to remember:** expand, use $\frac{2}{n+1}$, done. On an exam you can quote $\frac{2}{2\ell+1}$, but be ready to show it for $\ell \le 3$.
        `,
      }),

      P({
        title: 'Five integrals in θ',
        q: md`Evaluate, using substitution and the shortcuts (no brute force unless needed):

        (a) $\displaystyle\int_0^\pi\cos^3\theta\,P_3(\cos\theta)\sin\theta\,d\theta$ $\quad$ (b) $\displaystyle\int_0^\pi\sin^2\theta\,P_2(\cos\theta)\sin\theta\,d\theta$ $\quad$ (c) $\displaystyle\int_0^\pi\cos\theta\,P_2(\cos\theta)\sin\theta\,d\theta$

        (d) $\displaystyle\int_0^\pi\cos2\theta\,P_2(\cos\theta)\sin\theta\,d\theta$ $\quad$ (e) $\displaystyle\int_{-1}^1x^5P_3(x)\,dx$

        (Plot: $P_2$ solid, $P_3$ dashed, against $\theta$.)`,
        figHtml: FIG.p23th,
        hints: [
          md`Convert each to $x$: $\sin^2\theta = 1 - x^2$, $\cos2\theta = 2x^2 - 1$. The $\sin\theta\,d\theta$ becomes $dx$ on $[-1, 1]$.`,
          md`Then: $x^3 = \tfrac25P_3 + \tfrac35P_1$, $\;1 - x^2 = \tfrac23P_0 - \tfrac23P_2$, $\;2x^2 - 1 = \tfrac43P_2 - \tfrac13P_0$, $\;x^5 = \tfrac{8}{63}P_5 + \tfrac49P_3 + \tfrac37P_1$.`,
        ],
        parts: [
          { lbl: md`(a)`, ans: 4 / 35 },
          { lbl: md`(b)`, ans: -4 / 15 },
          { lbl: md`(c)`, ans: 0 },
          { lbl: md`(d)`, ans: 8 / 15 },
          { lbl: md`(e)`, ans: 8 / 63 },
        ],
        sol: md`
          With $x = \cos\theta$ each $\theta$ integral becomes $\int_{-1}^1(\dots)\,dx$. Then keep only the $P_\ell$ piece that matches:

          - **(a)** $x^3 = \tfrac25P_3 + \dots$: $\;\tfrac25\cdot\tfrac27 = \tfrac{4}{35}$.
          - **(b)** $1 - x^2 = \tfrac23P_0 - \tfrac23P_2$: $\;-\tfrac23\cdot\tfrac25 = -\tfrac{4}{15}$.
          - **(c)** $xP_2$ is odd: $0$.
          - **(d)** $2x^2 - 1 = \tfrac43P_2 - \tfrac13P_0$: $\;\tfrac43\cdot\tfrac25 = \tfrac{8}{15}$.
          - **(e)** $x^5 = \tfrac49P_3 + \dots$: $\;\tfrac49\cdot\tfrac27 = \tfrac{8}{63}$. Brute force agrees: $\tfrac12\int(5x^8 - 3x^6)\,dx = \tfrac12\left(\tfrac{10}{9} - \tfrac67\right) = \tfrac{8}{63}$.

          **Check on (b):** $\sin^2\theta$ is largest at the equator, where $P_2 = -\tfrac12$, so a negative answer makes sense.

          **What to remember:** convert to $x$, write the other factor in Legendre polynomials, read off the one surviving term. Each integral is then one multiplication.
        `,
      }),

      P({
        title: 'Coefficients by the integral, checked by eye',
        q: md`A sphere's surface is held at $V_0(\theta) = V_0(1 + \cos\theta)^3$. Using **only** the coefficient formula $a_\ell = \frac{2\ell+1}{2}\int_{-1}^1f\,P_\ell\,dx$ with $f = (1 + x)^3$, find $a_0$, $a_2$ and $a_3$ (in units of $V_0$).`,
        figHtml: sphL('V_0(1+\\cos\\theta)^3'),
        hints: [
          md`$a_0 = \tfrac12\int_{-1}^1(1 + x)^3\,dx$: substitute $u = 1 + x$.`,
          md`For $a_2$: expand $(1 + x)^3 = 1 + 3x + 3x^2 + x^3$. Against $P_2$ only the $3x^2$ survives (degree and parity).`,
          md`For $a_3$: only the $x^3$ survives against $P_3$, and $\int x^3P_3 = \tfrac{4}{35}$.`,
        ],
        parts: [
          { lbl: md`$a_0$`, ans: 2 },
          { lbl: md`$a_2$`, ans: 2 },
          { lbl: md`$a_3$`, ans: 0.4 },
          { lbl: md`What is $a_4$?`, mc: [md`$0$, since $(1 + x)^3$ has degree 3`, md`Small but nonzero`, md`$\tfrac{9}{2}\cdot\tfrac29$`], a: 0,
            why: [null, md`Degree 3 means $(1+x)^3$ is a combination of $P_0, \dots, P_3$, all orthogonal to $P_4$. Exactly zero.`, md`That would be $\tfrac92\int P_4^2$, as if $f$ were $P_4$.`] },
        ],
        sol: md`
          **$a_0$:** $\tfrac12\int_{-1}^1(1 + x)^3\,dx = \tfrac12\left[\tfrac{(1 + x)^4}{4}\right]_{-1}^1 = \tfrac12\cdot4 = 2$. That is the average of $(1 + \cos\theta)^3$ over the sphere.

          **$a_2$:** $\tfrac52\int(1 + 3x + 3x^2 + x^3)P_2\,dx = \tfrac52\cdot3\int x^2P_2\,dx = \tfrac52\cdot3\cdot\tfrac{4}{15} = 2$.

          **$a_3$:** $\tfrac72\int x^3P_3\,dx = \tfrac72\cdot\tfrac{4}{35} = \tfrac25$.

          **Check by eye** (Unit 7 did this expansion): $(1 + x)^3 = 2P_0 + \tfrac{18}{5}P_1 + 2P_2 + \tfrac25P_3$. Same numbers. At $x = 1$: $2 + 3.6 + 2 + 0.4 = 8 = 2^3$.

          **What to remember:** the integral and the by-eye method must agree. Use whichever is faster; for polynomials it is almost always by eye, and the integral is your check.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - $\int_{-1}^1P_\ell P_{\ell'}\,dx = \int_0^\pi P_\ell P_{\ell'}\sin\theta\,d\theta = \frac{2}{2\ell+1}\delta_{\ell\ell'}$. Norms $2, \tfrac23, \tfrac25, \tfrac27$.
          - $a_\ell = \frac{2\ell+1}{2}\int_{-1}^1fP_\ell\,dx$, Fourier's trick. $a_0$ is the surface average.
          - $x = \cos\theta$: the minus in $dx$ and the flipped limits cancel. Hemisphere $= [0, 1]$, cap $= [\cos\alpha, 1]$.
          - Zero before you start: degree below $\ell$, or opposite parity.
          - $\int x^\ell P_\ell = \tfrac23, \tfrac4{15}, \tfrac4{35}$ for $\ell = 1, 2, 3$; $\int_0^1P_\ell = 1, \tfrac12, 0, -\tfrac18, 0, \tfrac1{16}$.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 4: expanding functions
  // =====================================================================================
  FIG.gibbs = PF.plot({ w: 340, h: 210, x: [-1, 1], y: [-1.35, 1.35], zero: true, xl: 'x',
    xt: [[-1, '-1'], [1, '1']], yt: [[1, '1'], [-1, '-1']],
    curves: [{ f: () => -1, cls: 'dim dash', from: -1, to: -0.004 }, { f: () => 1, cls: 'dim dash', from: 0.004, to: 1 },
      { f: (x) => stepSum(x, 3), cls: 'dash' }, { f: (x) => stepSum(x, 21), n: 600 }] });
  FIG.step5 = PF.plot({ w: 340, h: 210, x: [-1, 1], y: [-1.35, 1.35], zero: true, xl: 'x',
    xt: [[-1, '-1'], [1, '1']], yt: [[1, '1'], [-1, '-1']],
    curves: [{ f: () => -1, cls: 'dim dash', from: -1, to: -0.004 }, { f: () => 1, cls: 'dim dash', from: 0.004, to: 1 },
      { f: (x) => stepSum(x, 5), n: 300 }] });
  FIG.absPlot = PF.plot({ w: 320, h: 190, x: [-1, 1], y: [-0.1, 1.15], xl: 'x',
    xt: [[-1, '-1'], [1, '1']], yt: [[1, '1'], [0.5, '\\tfrac12']],
    curves: [{ f: (x) => Math.abs(x), cls: 'dim dash' }, { f: (x) => absSum(x, 2), cls: 'dash' }, { f: (x) => absSum(x, 4) }] });
  FIG.hemPM = hemis({});
  FIG.halfWave = hemis({ top: 'V_0\\cos\\theta', bot: 'V=0', botThin: true });
  FIG.capA = hemis({ cap: 50, top: 'V_0', bot: 'V=0', botThin: true, topTh: 22, extra: { mark: { th: 50, lab: '\\alpha', r: 20 } } });
  FIG.capHalf = hemis({ top: 'V_0', bot: '-\\tfrac12V_0' });

  const L4 = {
    id: 'uL-expand', title: 'Expanding functions in P_ℓ',
    steps: [
      RF(md`
        ### Method 1: polynomials in $\cos\theta$, by eye

        The coefficient integral is usually hard to do analytically unless the boundary condition is itself a sum of a few Legendre polynomials. On an exam it usually is. Then you need no integral at all.

        **Peel from the top.** The highest power $x^n$ means the series stops at $\ell = n$. Choose the $P_n$ coefficient to reproduce the $x^n$ term (divide by the leading coefficient $\tfrac32$, $\tfrac52$, $\tfrac{35}{8}$), subtract, and repeat on what is left.

        - $x^2$: from $P_2 = \tfrac32x^2 - \tfrac12$, $\;x^2 = \tfrac23\left(P_2 + \tfrac12\right) = \tfrac23P_2 + \tfrac13P_0$.
        - $x^3$: from $P_3 = \tfrac52x^3 - \tfrac32x$, $\;x^3 = \tfrac25\left(P_3 + \tfrac32x\right) = \tfrac25P_3 + \tfrac35P_1$.
        - $x^4$: from $P_4 = \tfrac{35}{8}x^4 - \tfrac{30}{8}x^2 + \tfrac38$, $\;x^4 = \tfrac{8}{35}P_4 + \tfrac67x^2 - \tfrac{3}{35} = \tfrac{8}{35}P_4 + \tfrac67\left(\tfrac23P_2 + \tfrac13\right) - \tfrac{3}{35} = \tfrac{8}{35}P_4 + \tfrac47P_2 + \tfrac15P_0$.

        | power | in Legendre polynomials | sum of coefficients |
        |---|---|---|
        | $x^2$ | $\tfrac13P_0 + \tfrac23P_2$ | $1$ |
        | $x^3$ | $\tfrac35P_1 + \tfrac25P_3$ | $1$ |
        | $x^4$ | $\tfrac15P_0 + \tfrac47P_2 + \tfrac{8}{35}P_4$ | $1$ |

        The coefficients sum to 1 because every $P_\ell(1) = 1$ and $x^k = 1$ at $x = 1$. That is the pole check.

        **Trig to $x$ first:** $\sin^2\theta = 1 - x^2$, $\;\cos2\theta = 2x^2 - 1$, $\;\cos3\theta = 4x^3 - 3x$, $\;\sin^2\frac\theta2 = \frac{1 - x}{2}$ (Griffiths Ex. 3.6), $\;\cos^2\frac\theta2 = \frac{1 + x}{2}$, $\;\sin^2\theta\cos\theta = x - x^3$. Only **even** powers of $\sin\theta$ are polynomials in $x$. (Unit 7, Lesson 3 has a longer table of finished expansions.)

        **Worked: $\sin^4\theta$.** $(1 - x^2)^2 = 1 - 2x^2 + x^4 = 1 - 2\left(\tfrac13 + \tfrac23P_2\right) + \left(\tfrac15 + \tfrac47P_2 + \tfrac{8}{35}P_4\right)$:

        $$\sin^4\theta = \tfrac{8}{15}P_0 - \tfrac{16}{21}P_2 + \tfrac{8}{35}P_4$$

        Pole check: $\tfrac{8}{15} - \tfrac{16}{21} + \tfrac{8}{35} = \tfrac{56 - 80 + 24}{105} = 0 = \sin^40$. Equator check ($P_2 = -\tfrac12$, $P_4 = \tfrac38$): $\tfrac{8}{15} + \tfrac{8}{21} + \tfrac{3}{35} = \tfrac{56 + 40 + 9}{105} = 1 = \sin^490^\circ$.

        **Worked: $\cos2\theta\cos\theta$.** $(2x^2 - 1)x = 2x^3 - x = 2\left(\tfrac35P_1 + \tfrac25P_3\right) - P_1 = \tfrac15P_1 + \tfrac45P_3$. Pole check: $1$.

        !!method Check every expansion twice
          At the north pole every $P_\ell = 1$: the coefficients must sum to $f(1)$. On the equator use $P_\ell(0) = 1, 0, -\tfrac12, 0, \tfrac38$: the sum must equal $f(0)$. The pole check alone misses some errors; the pair rarely does.
      `),

      Q(md`In $x^4 = a_0P_0 + a_2P_2 + a_4P_4$, what is $a_4$?`,
        [md`$\tfrac{35}{8}$`, md`$1$`, md`$\tfrac{8}{35}$`, md`$\tfrac47$`], 2,
        [md`That is the coefficient of $x^4$ *in* $P_4$. You need its inverse.`, md`$P_4$ is not $x^4$; its leading coefficient is $\tfrac{35}{8}$.`, null, md`$\tfrac47$ is the $P_2$ coefficient.`],
        md`To produce $x^4$ from $a_4P_4 = a_4\left(\tfrac{35}{8}x^4 + \dots\right)$ you need $a_4 = \tfrac{8}{35}$. The top coefficient of any expansion is $1/(\text{leading coefficient of }P_n)$ times the top coefficient of $f$.`,
        { figHtml: FIG.p4only }),

      Q(md`A sphere is held at $V_0\left(\cos\theta + \cos^3\theta\right)$. What is its Legendre expansion?`,
        [md`$V_0\left(P_1 + P_3\right)$`, md`$V_0\left(\tfrac35P_1 + \tfrac25P_3\right)$`, md`$V_0\left(P_1 + \tfrac25P_3\right)$`, md`$V_0\left(\tfrac85P_1 + \tfrac25P_3\right)$`], 3,
        [md`$\cos^3\theta \ne P_3$. At the north pole this gives $2V_0$ (right), but at $\theta = 60^\circ$ it gives $\tfrac12 - \tfrac{7}{16} = \tfrac1{16}$ instead of $\tfrac12 + \tfrac18 = \tfrac58$.`, md`That is $\cos^3\theta$ alone. The pole check gives $1$, not $2$.`, md`The $\tfrac35P_1$ inside $\cos^3\theta$ was forgotten. Pole check: $\tfrac75 \ne 2$.`, null],
        md`$x + x^3 = P_1 + \tfrac35P_1 + \tfrac25P_3 = \tfrac85P_1 + \tfrac25P_3$. Pole check: $\tfrac85 + \tfrac25 = 2$. Odd data, odd $\ell$ only.`,
        { figHtml: sphL('V_0(\\cos\\theta+\\cos^3\\theta)') }),

      Q(md`A student writes $\sin^4\theta = 1 - 2P_2 + P_4$ (reasoning "$\sin^2 = 1 - \cos^2$, so just swap powers for $P$'s"). Which check exposes the error?`,
        [md`The north-pole check`, md`The equator check`, md`The parity check`, md`The degree check`], 1,
        [md`$1 - 2 + 1 = 0 = \sin^40$. It passes the pole check.`, null, md`Both sides are even. Parity can't see it.`, md`Both sides have degree 4.`],
        md`At the equator: $1 - 2\left(-\tfrac12\right) + \tfrac38 = \tfrac{19}{8}$, but $\sin^490^\circ = 1$. The right answer is $\tfrac{8}{15}P_0 - \tfrac{16}{21}P_2 + \tfrac{8}{35}P_4$. Powers of $x$ are not Legendre polynomials; you must peel.`,
        { figHtml: sphL('V_0\\sin^4\\theta') }),

      Q(md`Which of these boundary potentials is **not** a finite sum of $P_\ell(\cos\theta)$?`,
        [md`$V_0\sin^2\theta$`, md`$V_0\cos3\theta$`, md`$V_0\sin\theta\cos\theta$`, md`$V_0\sin^4(\theta/2)$`], 2,
        [md`$1 - x^2$: a polynomial.`, md`$4x^3 - 3x$: a polynomial.`, null, md`$\left(\frac{1-x}{2}\right)^2$: a polynomial.`],
        md`$\sin\theta\cos\theta = x\sqrt{1 - x^2}$. The square root never terminates in Legendre polynomials, so it needs the integral and an infinite series (odd $\ell$ only, since it is antisymmetric). Odd powers of $\sin\theta$ are the usual trap; $\sin2\theta$ is one in disguise.`,
        { figHtml: sphL('V_0\\sin\\theta\\cos\\theta') }),

      Q(md`What is the expansion of $\sin^2\frac\theta2\cos^2\frac\theta2$?`,
        [md`$\tfrac12\left(P_0 - P_1\right)$`, md`$\tfrac14P_0$`, md`$\tfrac16\left(P_0 + P_2\right)$`, md`$\tfrac16\left(P_0 - P_2\right)$`], 3,
        [md`That is $\sin^2\frac\theta2$ alone.`, md`That is only the average. The product varies with $\theta$: it is $0$ at both poles.`, md`Sign: at the north pole this gives $\tfrac13$, but the product is $0$ there.`, null],
        md`$\sin^2\frac\theta2\cos^2\frac\theta2 = \tfrac14\sin^2\theta = \tfrac14(1 - x^2) = \tfrac14\cdot\tfrac23(P_0 - P_2) = \tfrac16(P_0 - P_2)$. Poles: $0$. Equator: $\tfrac16\left(1 + \tfrac12\right) = \tfrac14 = \sin^245^\circ\cos^245^\circ$.`,
        { figHtml: sphL('V_0\\sin^2\\tfrac{\\theta}{2}\\cos^2\\tfrac{\\theta}{2}') }),

      Q(md`A sphere is held at $V_0\cos4\theta = V_0\left(8\cos^4\theta - 8\cos^2\theta + 1\right)$. What is the $P_4$ coefficient?`,
        [md`$8$`, md`$\tfrac{8}{35}$`, md`$\tfrac{35}{64}$`, md`$\tfrac{64}{35}$`], 3,
        [md`That renames $x^4$ as $P_4$. $P_4$'s leading coefficient is $\tfrac{35}{8}$, not $1$.`, md`That is the $P_4$ coefficient of $x^4$ alone; here $x^4$ comes with a factor $8$.`, md`Inverted.`, null],
        md`Peel from the top: only the $x^4$ term can feed $P_4$, and $x^4 = \tfrac{8}{35}P_4 + \dots$, so $8x^4$ gives $\tfrac{64}{35}P_4$. The full expansion is $-\tfrac{1}{15}P_0 - \tfrac{16}{21}P_2 + \tfrac{64}{35}P_4$ (pole check: $\tfrac{-7 - 80 + 192}{105} = 1$). The top coefficient takes one division; you never need the rest to get it.`,
        { figHtml: sphL('V_0\\cos4\\theta') }),

      Q(md`A sphere is held at $V_0\left[(1 + \cos\theta)^3 - (1 - \cos\theta)^3\right]$. Without expanding, which coefficients vanish?`,
        [md`Every odd $a_\ell$`, md`Every $a_\ell$ with $\ell \gt 3$, and nothing else`, md`Every even $a_\ell$, and every $a_\ell$ with $\ell \gt 3$`, md`None`], 2,
        [md`Swap $x \to -x$: the two cubes trade places and the bracket changes sign. The data are odd, so it is the **even** ones that vanish.`, md`True but incomplete: parity also kills $a_0$ and $a_2$.`, null, md`Degree and parity each remove some.`],
        md`$f(-x) = (1 - x)^3 - (1 + x)^3 = -f(x)$: odd, so even $\ell$ vanish. Degree 3: $\ell \le 3$. Only $a_1$ and $a_3$ remain. Expanding confirms it: $6x + 2x^3 = \tfrac{36}{5}P_1 + \tfrac45P_3$ (pole check: $8 = 2^3$).`,
        { figHtml: sphL('V_0[(1+\\cos\\theta)^3-(1-\\cos\\theta)^3]') }),

      G('leg_expand', { need: 4 }),

      P({
        title: 'A double angle in disguise',
        q: md`A sphere is held at $V_0(\theta) = \tfrac14V_0\sin^22\theta$. Write it as $V_0\sum_\ell a_\ell P_\ell(\cos\theta)$ and give the nonzero $a_\ell$.`,
        figHtml: sphL('\\tfrac14V_0\\sin^2 2\\theta'),
        hints: [
          md`$\sin2\theta = 2\sin\theta\cos\theta$, so $\tfrac14\sin^22\theta = \sin^2\theta\cos^2\theta$. Even powers of $\sin\theta$: a polynomial.`,
          md`In $x$: $(1 - x^2)x^2 = x^2 - x^4$. Use the table for $x^2$ and $x^4$.`,
        ],
        parts: [
          { lbl: md`$a_0$`, ans: 2 / 15 },
          { lbl: md`$a_2$`, ans: 2 / 21 },
          { lbl: md`$a_4$`, ans: -8 / 35 },
          { lbl: md`Why are $a_1$ and $a_3$ zero?`, mc: [md`$\sin^22\theta$ has a $\sin$ in it`, md`The data are north–south symmetric ($x \to -x$ leaves $x^2 - x^4$ unchanged)`, md`They are small, not zero`], a: 1,
            why: [md`Odd powers of $\sin\theta$ would cause trouble, but here they come squared. The zeros come from symmetry.`, null, md`Odd coefficients of even data are exactly zero by parity.`] },
        ],
        sol: md`
          $\tfrac14\sin^22\theta = \sin^2\theta\cos^2\theta = (1 - x^2)x^2 = x^2 - x^4$. Then

          $$x^2 - x^4 = \left(\tfrac13P_0 + \tfrac23P_2\right) - \left(\tfrac15P_0 + \tfrac47P_2 + \tfrac{8}{35}P_4\right) = \tfrac{2}{15}P_0 + \tfrac{2}{21}P_2 - \tfrac{8}{35}P_4$$

          **Checks.** Pole: $\tfrac{2}{15} + \tfrac{2}{21} - \tfrac{8}{35} = \tfrac{14 + 10 - 24}{105} = 0 = \sin^20$. Equator: $\tfrac{2}{15} - \tfrac{1}{21} - \tfrac{3}{35} = \tfrac{14 - 5 - 9}{105} = 0 = \sin^2180^\circ$. Average: $a_0 = \tfrac{2}{15}$, positive, as it must be for nonnegative data.

          **What to remember:** rewrite multiple angles in powers of $\cos\theta$ before anything else. A $\sin$ squared is fine; a lone $\sin$ is not.
        `,
      }),

      RF(md`
        ### Method 2: the integral (jumps, kinks, square roots)

        **The $\pm1$ step (hemispheres at $\pm V_0$).** $f = +1$ for $x \gt 0$, $-1$ for $x \lt 0$. It is odd, so only odd $\ell$, and the two halves contribute equally:

        $$a_\ell = \frac{2\ell+1}{2}\left[\int_0^1P_\ell\,dx - \int_{-1}^0P_\ell\,dx\right] = (2\ell+1)\int_0^1P_\ell\,dx$$

        $a_1 = 3\cdot\tfrac12 = \tfrac32$, $\;a_3 = 7\cdot\left(-\tfrac18\right) = -\tfrac78$, $\;a_5 = 11\cdot\tfrac{1}{16} = \tfrac{11}{16}$. Unit 8 worked the first two; the new piece is $\int_0^1P_5\,dx = \tfrac18\left(\tfrac{63}{6} - \tfrac{70}{4} + \tfrac{15}{2}\right) = \tfrac18\cdot\tfrac12 = \tfrac{1}{16}$. All even $a_\ell = 0$, including $a_0$: equal areas at $\pm1$ average to zero.

        **$\lvert\cos\theta\rvert$.** Even, so only even $\ell$, and $a_\ell = (2\ell+1)\int_0^1x\,P_\ell\,dx$:

        - $a_0 = 1\cdot\int_0^1x\,dx = \tfrac12$
        - $a_2 = 5\cdot\tfrac12\int_0^1\left(3x^3 - x\right)dx = \tfrac52\left(\tfrac34 - \tfrac12\right) = \tfrac58$
        - $a_4 = 9\cdot\tfrac18\int_0^1\left(35x^5 - 30x^3 + 3x\right)dx = \tfrac98\left(\tfrac{35}{6} - \tfrac{15}{2} + \tfrac32\right) = \tfrac98\left(-\tfrac16\right) = -\tfrac{3}{16}$

        The next one is $a_6 = \tfrac{13}{128}$. Unit 8 only quoted these; now you have done them.

        [[fig:abs]]

        **Split into even and odd parts.** Any $f$ is $f_{\text{e}} + f_{\text{o}}$ with $f_{\text{e}}(x) = \tfrac12\left[f(x) + f(-x)\right]$ (only even $\ell$) and $f_{\text{o}}(x) = \tfrac12\left[f(x) - f(-x)\right]$ (only odd $\ell$). Worked: north hemisphere at $V_0$, south at $-\tfrac12V_0$. Even part: the constant $\tfrac14V_0$. Odd part: $\tfrac34V_0$ times the $\pm1$ step. So

        $$V_0(\theta) = V_0\left[\tfrac14P_0 + \tfrac34\left(\tfrac32P_1 - \tfrac78P_3 + \tfrac{11}{16}P_5 - \dots\right)\right] = V_0\left[\tfrac14P_0 + \tfrac98P_1 - \tfrac{21}{32}P_3 + \dots\right]$$

        and every even $a_\ell$ with $\ell \ge 2$ is zero. Splitting reuses series you already have instead of integrating again.
      `, { abs: { svg: FIG.absPlot, cap: 'Dim dashed: $\\lvert x\\rvert$. Dashed: the sum through $\\ell = 2$. Solid: through $\\ell = 4$. The kink at $x = 0$ is the last place to converge.' } }),

      Q(md`A sphere is held at $V_0\lvert\cos\theta\rvert$. What is $a_0$, the potential at its center in units of $V_0$?`,
        [md`$\tfrac12$`, md`$\tfrac{2}{\pi}$`, md`$1$`, md`$\tfrac14$`], 0,
        [null, md`$\tfrac2\pi = \frac1\pi\int_0^\pi\lvert\cos\theta\rvert\,d\theta$ is the average over $\theta$. The sphere average weights by $\sin\theta$, which favors the equator where $\lvert\cos\theta\rvert$ is small.`, md`$1$ is the value at the poles only.`, md`Half of the right value: $\tfrac12\int_{-1}^1\lvert x\rvert\,dx = \tfrac12$.`],
        md`$a_0 = \tfrac12\int_{-1}^1\lvert x\rvert\,dx = \int_0^1x\,dx = \tfrac12$. The equal-$\theta$ average ($\tfrac2\pi \approx 0.64$) is the classic wrong answer.`,
        { figHtml: sphL('V_0\\lvert\\cos\\theta\\rvert') }),

      Q(md`For the $\pm V_0$ hemispheres, $a_1 = \tfrac32V_0$, larger than the biggest value $V_0$ on the sphere. How can that be?`,
        [md`It can't; $a_1$ must be $V_0$.`, md`A coefficient is a projection, not a value. $\tfrac32P_1$ is the best single-term fit to the step, and higher terms pull the pole value back toward $V_0$.`, md`The $\sin\theta$ weight inflates it.`, md`Because the series diverges at the poles.`], 1,
        [md`$a_1 = 3\int_0^1x\,dx = \tfrac32$. It is right.`, null, md`The weight is what makes the projection correct, not an inflation.`, md`The series converges at the poles (to $\pm V_0$): $\tfrac32 - \tfrac78 + \tfrac{11}{16} - \dots \to 1$.`],
        md`To match a flat $+1$ over the whole northern hemisphere with $\cos\theta$, which is small near the equator, the fit has to overshoot near the pole. The partial sums at the pole are $1.5$, $0.625$, $1.31$, ... and converge to $1$.`,
        { figHtml: FIG.hemPM }),

      Q(md`North hemisphere at $V_0$, south at $-\tfrac12V_0$ (the worked split). What is $a_2$?`,
        [md`$\tfrac14V_0$`, md`$\tfrac38V_0$`, md`$-\tfrac18V_0$`, md`$0$`], 3,
        [md`$\tfrac14V_0$ is $a_0$.`, md`There is no even structure beyond the constant: the even part is exactly $\tfrac14V_0$ everywhere.`, md`Even part $f_{\text{e}} = \tfrac12\left[V_0 + \left(-\tfrac12V_0\right)\right] = \tfrac14V_0$ for every $\theta$, so no $P_2$.`, null],
        md`The even part is a constant, which is pure $P_0$. All the $\theta$ dependence is in the odd part, a scaled step. So every even $a_\ell$ beyond $a_0$ vanishes.`,
        { figHtml: FIG.capHalf }),

      P({
        title: 'The step to five terms',
        q: md`The upper hemisphere of a sphere is held at $+V_0$ and the lower at $-V_0$. (a) Compute $\int_0^1P_5\,dx$ with $P_5 = \tfrac18(63x^5 - 70x^3 + 15x)$, and from it $a_5$ (in units of $V_0$). (b) Using $a_1 = \tfrac32$, $a_3 = -\tfrac78$ and your $a_5$, evaluate the partial sum at the north pole. (c) What value does the full series give on the equator?`,
        figHtml: FIG.hemPM,
        hints: [
          md`$\int_0^1x^n\,dx = \frac{1}{n+1}$. Then $a_\ell = (2\ell+1)\int_0^1P_\ell\,dx$ for odd $\ell$.`,
          md`At the north pole every $P_\ell = 1$, so the partial sum is $a_1 + a_3 + a_5$.`,
          md`At a jump a Legendre series converges to the midpoint of the two sides.`,
        ],
        parts: [
          { lbl: md`(a) $\int_0^1P_5\,dx$`, ans: 1 / 16 },
          { lbl: md`(a) $a_5$`, ans: 11 / 16 },
          { lbl: md`(b) the partial sum through $\ell = 5$ at $\theta = 0$`, ans: 21 / 16 },
          { lbl: md`(c) the full series at $\theta = 90^\circ$`, ans: 0 },
        ],
        sol: md`
          **(a)** $\int_0^1P_5\,dx = \tfrac18\left(\tfrac{63}{6} - \tfrac{70}{4} + \tfrac{15}{2}\right) = \tfrac18\left(10.5 - 17.5 + 7.5\right) = \tfrac{1}{16}$. So $a_5 = 11\cdot\tfrac{1}{16} = \tfrac{11}{16}$.

          **(b)** $\tfrac32 - \tfrac78 + \tfrac{11}{16} = \tfrac{24 - 14 + 11}{16} = \tfrac{21}{16} \approx 1.31$. The partial sums at the pole go $1.5, 0.625, 1.31, 0.73, \dots$ and close in on $1$ slowly. Because the data jump, $\lvert a_\ell\rvert$ only shrinks like $\ell^{-1/2}$, and at the pole every $P_\ell = 1$, so nothing else damps the terms.

          **(c)** Every odd $P_\ell(0) = 0$, so every term vanishes on the equator: the series gives $0$, the average of $+V_0$ and $-V_0$.

          **What to remember:** for a jump, $a_\ell = (2\ell+1)\int_0^1P_\ell\,dx$ with $\int_0^1P_\ell = \tfrac12, -\tfrac18, \tfrac1{16}$ for $\ell = 1, 3, 5$. The series converges to the midpoint at the jump.
        `,
      }),

      P({
        title: 'Half a cosine',
        q: md`The northern hemisphere of a sphere is held at $V_0\cos\theta$ and the southern hemisphere is grounded. Find $a_0$ through $a_4$ in $V_0(\theta) = V_0\sum_\ell a_\ell P_\ell(\cos\theta)$.`,
        figHtml: FIG.halfWave,
        hints: [
          md`In $x$: $f = x$ for $x \gt 0$, $0$ for $x \lt 0$. Split it: $f = \tfrac12x + \tfrac12\lvert x\rvert$.`,
          md`The odd part $\tfrac12x$ is $\tfrac12P_1$ exactly. The even part is half of $\lvert x\rvert$, whose coefficients you have: $\tfrac12, \tfrac58, -\tfrac{3}{16}$.`,
        ],
        parts: [
          { lbl: md`$a_0$`, ans: 0.25 },
          { lbl: md`$a_1$`, ans: 0.5 },
          { lbl: md`$a_2$`, ans: 5 / 16 },
          { lbl: md`$a_3$`, ans: 0 },
          { lbl: md`$a_4$`, ans: -3 / 32 },
        ],
        sol: md`
          **Split.** For $x \gt 0$: $\tfrac12x + \tfrac12x = x$. For $x \lt 0$: $\tfrac12x - \tfrac12x = 0$. So $f = \tfrac12x + \tfrac12\lvert x\rvert$.

          - Odd part: $\tfrac12x = \tfrac12P_1$. So $a_1 = \tfrac12$ and every other odd $a_\ell = 0$, including $a_3$.
          - Even part: $\tfrac12\lvert x\rvert = \tfrac12\left(\tfrac12P_0 + \tfrac58P_2 - \tfrac{3}{16}P_4 + \dots\right)$. So $a_0 = \tfrac14$, $a_2 = \tfrac{5}{16}$, $a_4 = -\tfrac{3}{32}$.

          **Direct check of two of them.** $a_1 = \tfrac32\int_0^1x\cdot x\,dx = \tfrac32\cdot\tfrac13 = \tfrac12$. $\;a_3 = \tfrac72\int_0^1x\,P_3\,dx = \tfrac74\int_0^1(5x^4 - 3x^2)\,dx = \tfrac74(1 - 1) = 0$.

          **Meaning.** $a_0 = \tfrac14$: the center of the sphere sits at $\tfrac14V_0$. A surprising zero like $a_3 = 0$ is a sign the data hide a simple piece (here $\tfrac12x$).

          **What to remember:** split into even and odd parts before integrating. Often one part is a polynomial and the other is a series you already know.
        `,
      }),

      RF(md`
        ### The polar cap

        The cap $\theta \lt \alpha$ is held at $V_0$, the rest is grounded. In $x$, with $c = \cos\alpha$: $f = 1$ for $c \lt x \le 1$, else $0$. So $a_\ell = \frac{2\ell+1}{2}\int_c^1P_\ell\,dx$.

        **A tool:** $(2\ell+1)P_\ell = \dfrac{d}{dx}\left[P_{\ell+1} - P_{\ell-1}\right]$ for $\ell \ge 1$. Check $\ell = 1$: $\frac{d}{dx}(P_2 - P_0) = 3x = 3P_1$. Since $P_{\ell+1}(1) = P_{\ell-1}(1) = 1$, the upper limit drops out:

        $$a_0 = \frac{1 - \cos\alpha}{2}, \qquad a_\ell = \tfrac12\left[P_{\ell-1}(\cos\alpha) - P_{\ell+1}(\cos\alpha)\right] \quad (\ell \ge 1)$$

        $a_0$ is the fraction of the sphere's area inside the cap. For $\ell = 1$: $a_1 = \tfrac12\left[1 - P_2(c)\right] = \tfrac12\cdot\tfrac{3 - 3c^2}{2} = \tfrac34\sin^2\alpha$.

        **Checks.** $\alpha = 90^\circ$ (northern hemisphere at $V_0$): $a_0 = \tfrac12$, $a_1 = \tfrac34$, as in Unit 7. $\alpha = 180^\circ$ (whole sphere): $a_0 = 1$, $a_1 = 0$. $\alpha \to 0$: both go to zero. Unit 7 did $\alpha = 60^\circ$: $a_0 = \tfrac14$, $a_1 = \tfrac{9}{16}$.

        [[fig:cap]]
      `, { cap: { svg: FIG.capA, cap: 'Polar cap $\\theta \\lt \\alpha$ held at $V_0$; the rest of the sphere grounded. In $x$ the cap is $\\cos\\alpha \\lt x \\le 1$.' } }),

      Q(md`The cap $\theta \lt 120^\circ$ is held at $V_0$ and the rest is grounded. What is the potential at the center?`,
        [md`$\tfrac23V_0$ ($120^\circ$ out of $180^\circ$)`, md`$\tfrac12V_0$`, md`$\tfrac34V_0$`, md`$\tfrac14V_0$`], 2,
        [md`Angle fractions are not area fractions. Weight by $\sin\theta$.`, md`The cap is more than a hemisphere.`, null, md`$\tfrac14$ is the area of the *grounded* part.`],
        md`$V(0) = a_0V_0 = \frac{1 - \cos120^\circ}{2}V_0 = \frac{1 + \frac12}{2}V_0 = \tfrac34V_0$. The center sees the area average of the surface potential.`,
        { figHtml: hemis({ cap: 120, top: 'V_0', bot: 'V=0', botThin: true, topTh: 22, botTh: 170, extra: { mark: { th: 120, lab: '120^\\circ', r: 20 } } }) }),

      Q(md`$a_1 = \tfrac{9}{16}$ for both the cap $\theta \lt 60^\circ$ and the cap $\theta \lt 120^\circ$. Which argument explains this **and** predicts that every odd $a_\ell$ agrees for the two caps?`,
        [md`Coincidence of these angles.`, md`Because $\sin^260^\circ = \sin^2120^\circ$ and nothing deeper.`, md`Because $a_1$ only depends on the cap's area.`, md`The $120^\circ$ cap is the whole sphere minus a $60^\circ$ cap at the south pole. The whole sphere has $a_1 = 0$ and the south cap has $a_1 = -\tfrac{9}{16}$.`], 3,
        [md`It holds for every pair $\alpha$ and $180^\circ - \alpha$.`, md`True for $a_1 = \tfrac34\sin^2\alpha$, but it says nothing about $a_3, a_5, \dots$ The superposition argument covers every odd $\ell$.`, md`The areas are $\tfrac14$ and $\tfrac34$, different, yet $a_1$ agrees.`, null],
        md`Superposition: $f_{120^\circ} = 1 - f_{\text{south }60^\circ}$. The constant contributes only to $a_0$. Reflecting a north cap to the south flips the sign of odd $a_\ell$. So odd $a_\ell$ agree and even ones (beyond $a_0$) flip: $a_2 = \pm\tfrac{15}{32}$.`,
        { figHtml: FIG.capA }),

      P({
        title: 'A cap of any size',
        q: md`The cap $\theta \lt \alpha$ of a sphere is held at $V_0$; the rest is grounded. Using $a_\ell = \tfrac12\left[P_{\ell-1}(\cos\alpha) - P_{\ell+1}(\cos\alpha)\right]$, find $a_2$ and $a_3$ as functions of $\alpha$, then the numbers $a_0$, $a_1$, $a_2$ for $\alpha = 120^\circ$.`,
        figHtml: FIG.capA,
        hints: [
          md`$a_2 = \tfrac12\left[P_1(c) - P_3(c)\right]$ with $c = \cos\alpha$. Factor out $1 - c^2 = \sin^2\alpha$.`,
          md`$a_3 = \tfrac12\left[P_2(c) - P_4(c)\right]$. Expand both, then factor: you should find $(1 - c^2)(5c^2 - 1)$.`,
          md`At $\alpha = 120^\circ$, $c = -\tfrac12$ and $\sin^2\alpha = \tfrac34$.`,
        ],
        parts: [
          { lbl: md`$a_2(\alpha)$`, expr: '(5/4)*sin(alpha)^2*cos(alpha)', vars: { alpha: [0.2, 3] }, accepts: ['5*cos(alpha)*(1-cos(alpha)^2)/4'] },
          { lbl: md`$a_3(\alpha)$`, expr: '(7/16)*sin(alpha)^2*(5*cos(alpha)^2 - 1)', vars: { alpha: [0.2, 3] }, accepts: ['7*(1-cos(alpha)^2)*(5*cos(alpha)^2-1)/16'] },
          { lbl: md`$a_0$ at $\alpha = 120^\circ$`, ans: 0.75 },
          { lbl: md`$a_1$ at $\alpha = 120^\circ$`, ans: 9 / 16 },
          { lbl: md`$a_2$ at $\alpha = 120^\circ$`, ans: -15 / 32 },
        ],
        sol: md`
          With $c = \cos\alpha$:

          $$a_2 = \tfrac12\left[c - \tfrac12(5c^3 - 3c)\right] = \tfrac12\cdot\tfrac{5c - 5c^3}{2} = \tfrac54c\left(1 - c^2\right) = \tfrac54\sin^2\alpha\cos\alpha$$

          $$a_3 = \tfrac12\left[\tfrac12(3c^2 - 1) - \tfrac18(35c^4 - 30c^2 + 3)\right] = \tfrac{1}{16}\left(-35c^4 + 42c^2 - 7\right) = \tfrac{7}{16}\left(1 - c^2\right)\left(5c^2 - 1\right) = \tfrac{7}{16}\sin^2\alpha\left(5\cos^2\alpha - 1\right)$$

          **Check at $\alpha = 90^\circ$:** $a_2 = 0$ and $a_3 = -\tfrac{7}{16}$, the northern hemisphere at $V_0$ (half of the $\pm V_0$ series).

          **At $\alpha = 120^\circ$** ($c = -\tfrac12$): $a_0 = \tfrac{1 + 1/2}{2} = \tfrac34$, $\;a_1 = \tfrac34\cdot\tfrac34 = \tfrac{9}{16}$, $\;a_2 = \tfrac54\cdot\tfrac34\cdot\left(-\tfrac12\right) = -\tfrac{15}{32}$.

          **What to remember:** every cap coefficient vanishes as $\sin^2\alpha$ for small caps, and $a_0$ is the area fraction $\tfrac12(1 - \cos\alpha)$. These two facts give the center potential and the field at the center (Lesson 5) with no series at all.
        `,
      }),

      RF(md`
        ### How fast the series converges, and Gibbs at the equator

        The smoothness of the data sets how fast the coefficients shrink:

        | data | example | $\lvert a_\ell\rvert$ for large $\ell$ |
        |---|---|---|
        | polynomial in $\cos\theta$ | $\sin^4\theta$ | exactly $0$ beyond the degree |
        | smooth | $e^{\cos\theta}$ | faster than any power of $\ell$ |
        | kink (jump in slope) | $\lvert\cos\theta\rvert$ | like $\ell^{-3/2}$ (about $1.6\,\ell^{-3/2}$) |
        | jump | $\pm V_0$ hemispheres | like $\ell^{-1/2}$ (about $1.6\,\ell^{-1/2}$) |

        Read the last two rows with care. They hold for a kink or jump strictly between the poles. When it is not on the equator (a cap edge), $\lvert a_\ell\rvert$ oscillates with $\ell$ under an envelope of the same power. The rates look slower than a sine series ($1/n$ for a jump, $1/n^2$ for a kink) only because $P_\ell$ is normalised by $P_\ell(1) = 1$, not to unit norm. Away from the poles $\lvert P_\ell(x)\rvert$ itself shrinks like $\ell^{-1/2}$, so the terms $a_\ell P_\ell(x)$ fall like $\ell^{-1}$ and $\ell^{-2}$, as for sines. At the poles $P_\ell = 1$, so nothing helps there: the step's pole partial sums $1.5, 0.63, 1.31, 0.73, \dots$ close in on $1$ only like $\ell^{-1/2}$.

        At a jump the series converges to the **midpoint**: $0$ on the equator for $\pm V_0$, $\tfrac12V_0$ at the edge of a cap held at $V_0$. Next to the jump the partial sums overshoot. This is the Gibbs phenomenon of Unit 6, the same as for sines: for the $\pm1$ step the peak tends to about $1.18$ (about 9% of the jump of 2), and adding terms squeezes the ringing toward the jump without lowering the peak.

        [[fig:gibbs]]

        **In a potential the ringing is harmless.** Inside, the $\ell$-th term carries $(r/R)^\ell$; at $r = R/2$ the $\ell = 21$ term is down by $2^{-21}$. Outside it carries $(R/r)^{\ell+1}$. Gibbs lives only on the surface itself, which is why "keep the first two terms" is a good approximation anywhere off the sphere.
      `, { gibbs: { svg: FIG.gibbs, cap: 'The $\\pm1$ step (dim dashed), its partial sum through $\\ell = 3$ (dashed) and through $\\ell = 21$ (solid). The overshoot next to $x = 0$ stays near $1.18$.' } }),

      Q(md`What does the full Legendre series of the $\pm V_0$ hemispheres give exactly on the equator?`,
        [md`$V_0$`, md`$0$`, md`$-V_0$`, md`It diverges there`], 1,
        [md`$V_0$ is the value just north of the equator.`, null, md`$-V_0$ is the value just south.`, md`Every term is $a_\ell P_\ell(0)$ with odd $\ell$, which is zero. The sum is $0$.`],
        md`At a jump the series converges to the midpoint of the two sides. Here every odd $P_\ell(0) = 0$, so the sum is exactly $0$ term by term.`,
        { figHtml: FIG.hemPM }),

      Q(md`For which boundary data do the Legendre coefficients shrink fastest with $\ell$?`,
        [md`$V_0\sin^4\theta$`, md`$V_0\lvert\cos\theta\rvert$`, md`$\pm V_0$ hemispheres`, md`A cap $\theta \lt 60^\circ$ at $V_0$`], 0,
        [null, md`A kink: coefficients fall like $\ell^{-3/2}$, forever.`, md`A jump: coefficients fall only like $\ell^{-1/2}$.`, md`The cap edge is a jump too.`],
        md`$\sin^4\theta$ is a degree-4 polynomial in $\cos\theta$: every $a_\ell$ with $\ell \gt 4$ is exactly zero. Smoothness buys fast decay; a polynomial is the extreme case.`,
        { figHtml: sphL('V_0(\\theta)') }),

      Q(md`You add more and more terms to the $\pm1$ step series. What happens to the Gibbs overshoot next to the equator?`,
        [md`It disappears.`, md`It grows without bound.`, md`It moves away from the jump.`, md`It is squeezed toward the jump, but its height stays about 9% of the jump.`], 3,
        [md`The series converges at every point away from the jump, but the maximum of the partial sums does not come down.`, md`It stays bounded near $1.18$.`, md`It moves toward the jump: the peak sits at a distance that shrinks like $1/N$.`, null],
        md`From the numbers: the first peak next to the jump is $1.20$ through $\ell = 5$, $1.18$ through $\ell = 21$, $1.179$ through $\ell = 41$, at $x \approx 0.47, 0.14, 0.07$. Same as the sine series of Unit 6. (The pole values also wander, $1.31$ through $\ell = 5$ and $1.17$ through $\ell = 21$, but that is the slow convergence at the poles, not Gibbs.)`,
        { figHtml: FIG.step5 }),

      Q(md`The cap $\theta \lt 60^\circ$ is held at $V_0$ and the rest of the sphere is grounded. What does the full Legendre series give exactly on the rim, $\theta = 60^\circ$, $r = R$?`,
        [md`$V_0$`, md`$\tfrac12V_0$`, md`$\tfrac14V_0$, the average over the sphere`, md`$0$`], 1,
        [md`That is the value just inside the cap.`, null, md`$\tfrac14V_0$ is $a_0$, the potential at the center, not the value on the rim.`, md`That is the value just outside the cap.`],
        md`At a jump the series converges to the midpoint of the two sides, $\tfrac12(V_0 + 0)$, and the partial sums ring around it (Gibbs). The physical potential right at the insulating gap is not defined; the series reports the midpoint.`,
        { figHtml: hemis({ cap: 60, top: 'V_0', bot: 'V=0', botThin: true, topTh: 22, extra: { mark: { th: 60, lab: '60^\\circ', r: 20 } } }) }),

      Q(md`The partial sums of the $\lvert\cos\theta\rvert$ series (plotted) approach the kink at the equator. Do they overshoot the way the step's partial sums do?`,
        [md`No: $\lvert\cos\theta\rvert$ is continuous, so the series converges uniformly. The kink only gets rounded off and slows the convergence there.`, md`Yes, by about 9% of the jump, as for any non-polynomial data.`, md`Yes, but only at the poles.`, md`No, because the series has only even $\ell$.`], 0,
        [null, md`Gibbs needs a jump in the function itself. A kink is a jump in the slope; the function has no gap to overshoot.`, md`At the poles $\lvert\cos\theta\rvert = 1$ is smooth.`, md`Parity is not the reason: the step has only odd $\ell$ and still rings.`],
        md`Jump in the value: coefficients $\sim\ell^{-1/2}$, and the partial sums overshoot next to the jump. Jump in the slope: coefficients $\sim\ell^{-3/2}$, and the sums round the corner off without overshooting. The plot shows the rounded kink at $x = 0$.`,
        { figHtml: FIG.absPlot }),

      Q(md`You want $V$ at $r = R/2$ inside the $\pm V_0$ sphere to three digits. Why can you ignore the Gibbs ringing?`,
        [md`The ringing cancels by symmetry inside.`, md`The ringing only exists for the outside solution.`, md`Each term carries $(r/R)^\ell = 2^{-\ell}$, so the high-$\ell$ terms that make the ringing are crushed.`, md`Gibbs ringing only happens for sine series.`], 2,
        [md`It is suppressed, not cancelled.`, md`The same coefficients appear inside and outside; both regions damp high $\ell$.`, null, md`It happens for any orthogonal series at a jump, Legendre included.`],
        md`$V_{\text{in}} = \sum a_\ell(r/R)^\ell P_\ell$. At $r = R/2$ the $\ell = 5$ term has a factor $\tfrac1{32}$, the $\ell = 7$ term $\tfrac1{128}$. A few terms give three digits. The surface is the only place where all $\ell$ matter equally.`,
        { figHtml: FIG.hemPM }),

      RF(md`
        !!key Patterns to remember
          - Polynomial in $\cos\theta$: peel by eye. $x^2 = \tfrac13P_0 + \tfrac23P_2$, $x^3 = \tfrac35P_1 + \tfrac25P_3$, $x^4 = \tfrac15P_0 + \tfrac47P_2 + \tfrac{8}{35}P_4$.
          - Convert trig first: $\sin^2\theta$, $\cos2\theta$, $\cos3\theta$, $\sin^2\frac\theta2$. Odd powers of $\sin\theta$ are not polynomials.
          - Check at the pole (sum of coefficients) and on the equator ($P_\ell(0) = 1, 0, -\tfrac12, 0, \tfrac38$).
          - Step: $\tfrac32, -\tfrac78, \tfrac{11}{16}$ (odd only). $\lvert\cos\theta\rvert$: $\tfrac12, \tfrac58, -\tfrac{3}{16}$ (even only). Split data into even and odd parts.
          - Cap: $a_0 = \frac{1 - \cos\alpha}{2}$, $a_1 = \tfrac34\sin^2\alpha$.
          - Jumps converge to the midpoint with a 9% Gibbs overshoot; off the surface the $r$ factors make it harmless.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 5: direct sphere problems
  // =====================================================================================
  FIG.cos3 = sph({ lab: 'V_0(\\theta)=V_0\\cos^3\\theta', inLab: 'V_{\\text{in}}', inX: 16, inY: 28 });
  FIG.cos3sig = PF.plot({ w: 320, h: 200, x: [0, Math.PI], y: [-1.6, 4.9], zero: true, xl: '\\theta', yl: '\\sigma R/\\varepsilon_0V_0',
    xt: [[Math.PI / 2, '90^\\circ'], [Math.PI, '180^\\circ']], yt: [[4.6, '4.6'], [2, '2'], [-1, '-1']],
    curves: [{ f: (t) => { const c = Math.cos(t); return 7 * c * c * c - 2.4 * c; } }, { f: (t) => Math.pow(Math.cos(t), 3), cls: 'dim dash' }] });
  FIG.onePlusSq = sphL('V_0(1+\\cos\\theta)^2');
  FIG.sin2axis = sph({ lab: 'V_0\\sin^2\\theta', Pout: { f: 1.75, th: 0, lab: 'P\\ (z)' } });
  FIG.hemAx = PF.plot({ w: 330, h: 200, x: [1, 4], y: [0, 0.75], xl: 'z/R', yl: 'V/V_0',
    xt: [[1, '1'], [2, '2'], [3, '3'], [4, '4']], yt: [[0.5, '\\tfrac12'], [0.25, '\\tfrac14']],
    curves: [{ f: (u) => { const w = 1 / u; return 1 - (1 - w * w) / Math.sqrt(1 + w * w); } }, { f: (u) => 1.5 / (u * u) - 0.875 / Math.pow(u, 4), cls: 'dash' }] });

  const L5 = {
    id: 'uL-sphere', title: 'Direct sphere problems',
    steps: [
      RF(md`
        ### The recipe

        Every direct sphere problem is the same few lines. Unit 8 (Lesson 5) derived them on Griffiths' example $k\sin^2(\theta/2)$ (Ex. 3.6); here they are as a checklist with a shortcut for each quantity an exam can ask.

        **Setup.** A thin spherical shell of radius $R$ is held at $V_0(\theta)$; there is no other charge. Two regions, inside and outside.

        **Boundary conditions.**
        1. $V$ finite at $r = 0$: inside, every $B_\ell = 0$.
        2. $V \to 0$ as $r \to \infty$: outside, every $A_\ell = 0$.
        3. $V(R^-,\theta) = V_0(\theta)$: fixes the inside coefficients, $A_\ell R^\ell = a_\ell V_0$.
        4. $V(R^+,\theta) = V_0(\theta)$: fixes the outside coefficients, $B_\ell/R^{\ell+1} = a_\ell V_0$.

        (Regularity on the $z$ axis already made $\ell$ an integer, Lesson 2.) With $V_0(\theta) = V_0\sum a_\ell P_\ell(\cos\theta)$ from Lesson 4:

        $$V_{\text{in}} = V_0\sum_\ell a_\ell\left(\frac rR\right)^{\ell}P_\ell(\cos\theta), \qquad V_{\text{out}} = V_0\sum_\ell a_\ell\left(\frac Rr\right)^{\ell+1}P_\ell(\cos\theta)$$

        | quantity | result | why |
        |---|---|---|
        | $V$ at the center | $a_0V_0$ | every $\ell \ge 1$ term has a factor $r^\ell$ |
        | $V$ on the $+z$ axis | $V_0\sum a_\ell(z/R)^\ell$ inside, $V_0\sum a_\ell(R/z)^{\ell+1}$ outside | $P_\ell(1) = 1$ |
        | $V$ on the $-z$ axis | the same with $(-1)^\ell$ | $P_\ell(-1) = (-1)^\ell$ |
        | $\vb E$ at the center | $-\dfrac{a_1V_0}{R}\,\uv z$ | only $\ell = 1$ is linear: $a_1V_0\,z/R$ |
        | $\sigma(\theta)$ | $\dfrac{\varepsilon_0V_0}{R}\sum(2\ell+1)\,a_\ell P_\ell(\cos\theta)$ | jump in $E_r$ |
        | total charge | $Q = 4\pi\varepsilon_0RV_0\,a_0$ | far field $a_0V_0R/r$ |
        | dipole moment | $p = 4\pi\varepsilon_0R^2V_0\,a_1$ | $\ell = 1$ term is $\dfrac{p\cos\theta}{4\pi\varepsilon_0r^2}$ |
        | far field | the lowest $\ell$ with $a_\ell \ne 0$ | higher $\ell$ fall faster |

        **Where $\sigma$ comes from.** $\sigma = \varepsilon_0\left(E_r^{\text{out}} - E_r^{\text{in}}\right) = -\varepsilon_0\left[\partial_rV_{\text{out}} - \partial_rV_{\text{in}}\right]_{r=R}$. At $r = R$, $\partial_r\left(\frac Rr\right)^{\ell+1} = -\frac{\ell+1}{R}$ and $\partial_r\left(\frac rR\right)^\ell = \frac{\ell}{R}$; the difference is $-\frac{2\ell+1}{R}$. (Unit 7 did this for HW 3.22.) For polynomial data the $\sigma$ sum is finite. For data with a jump it does not converge on the surface (the factor $2\ell + 1$ beats $\lvert a_\ell\rvert \sim \ell^{-1/2}$); then only its first terms, or a closed form, mean anything.

        ### Worked: a sphere held at $V_0\cos^3\theta$

        [[fig:setup]]

        **Expand** (Lesson 4): $\cos^3\theta = \tfrac35P_1 + \tfrac25P_3$, so $a_1 = \tfrac35$, $a_3 = \tfrac25$, all others zero.

        **BCs 1–4** give

        $$V_{\text{in}} = V_0\left[\frac35\,\frac rR\,P_1(\cos\theta) + \frac25\,\frac{r^3}{R^3}\,P_3(\cos\theta)\right], \qquad V_{\text{out}} = V_0\left[\frac35\,\frac{R^2}{r^2}\,P_1(\cos\theta) + \frac25\,\frac{R^4}{r^4}\,P_3(\cos\theta)\right]$$

        **Read off:**
        - Center: $a_0 = 0$, so $V(0) = 0$. Total charge $Q = 0$.
        - Field at the center: $\vb E(0) = -\dfrac{3V_0}{5R}\,\uv z$, pointing from the positive north toward the negative south.
        - On the axis inside, $V(z) = V_0\left(\tfrac35\tfrac zR + \tfrac25\tfrac{z^3}{R^3}\right)$: $\tfrac{7}{20}V_0$ at $z = R/2$. Outside at $z = 2R$: $V_0\left(\tfrac35\cdot\tfrac14 + \tfrac25\cdot\tfrac1{16}\right) = \tfrac{7}{40}V_0$.
        - Far field: a dipole, $V \approx \dfrac{3V_0R^2\cos\theta}{5r^2}$, with $p = \tfrac{12}{5}\pi\varepsilon_0R^2V_0$.
        - Surface charge: $\sigma = \dfrac{\varepsilon_0V_0}{R}\left[3\cdot\tfrac35P_1 + 7\cdot\tfrac25P_3\right] = \dfrac{\varepsilon_0V_0}{5R}\left(35\cos^3\theta - 12\cos\theta\right)$. At the north pole $\tfrac{23}{5}\dfrac{\varepsilon_0V_0}{R}$.

        [[fig:sig]]

        **Checks.** BCs: no $1/r$ powers inside, no positive powers outside, and both give $V_0\left(\tfrac35P_1 + \tfrac25P_3\right) = V_0\cos^3\theta$ at $r = R$. Symmetry: odd data, odd $\ell$, so $V = 0$ on the whole equatorial plane. $\sigma$ integrates to zero (no $P_0$ term).

        Note what $\sigma$ does: it changes sign at $\theta = 54.2^\circ$, where $35\cos^2\theta = 12$. The potential is positive all over the northern hemisphere, yet the charge near the equator is negative. $\sigma$ follows $\sum(2\ell+1)a_\ell P_\ell$, which weights the $\ell = 3$ term more than $V_0$ does.
      `, {
        setup: { svg: FIG.cos3, cap: 'A thin shell of radius $R$ held at $V_0\\cos^3\\theta$. No other charge.' },
        sig: { svg: FIG.cos3sig, cap: 'Solid: $\\sigma R/\\varepsilon_0V_0 = \\tfrac15(35\\cos^3\\theta - 12\\cos\\theta)$. Dashed: the surface potential $\\cos^3\\theta$ (in units of $V_0$). They have different shapes.' },
      }),

      Q(md`For the region inside the sphere, which condition kills every $B_\ell$?`,
        [md`$V$ finite at $r = 0$`, md`$V \to 0$ as $r \to \infty$`, md`$V(R,\theta) = V_0(\theta)$`, md`$V$ finite on the $z$ axis`], 0,
        [null, md`Infinity is not in the inside region. That condition acts outside, on $A_\ell$.`, md`That fixes the surviving coefficients; it doesn't remove any.`, md`That condition quantizes $\ell$ (Lesson 2); it doesn't choose between $r^\ell$ and $r^{-(\ell+1)}$.`],
        md`$B_\ell/r^{\ell+1}$ blows up at the origin, and there is no charge there. Inside: keep $r^\ell$. Outside: keep $r^{-(\ell+1)}$. Mixing these up is the most common error in the whole topic.`,
        { figHtml: FIG.cos3 }),

      Q(md`The Ex. 3.6 sphere is held at $V_0(\theta) = k\sin^2(\theta/2) = \tfrac k2\left(P_0 - P_1\right)$, and inside $V = \tfrac k2\left(1 - \tfrac rR\cos\theta\right)$. What is $V$ outside?`,
        [md`$\dfrac k2\left(1 - \dfrac Rr\cos\theta\right)$`, md`$\dfrac k2\left(\dfrac Rr - \dfrac Rr\cos\theta\right)$`, md`$\dfrac k2\left(\dfrac Rr - \dfrac{R^2}{r^2}\cos\theta\right)$`, md`$\dfrac k2\left(1 - \dfrac rR\cos\theta\right)$, the same as inside`], 2,
        [md`The constant must fall off too: $\ell = 0$ goes with $R/r$ outside, or $V$ would not vanish at infinity.`, md`$\ell = 1$ goes with $(R/r)^{\ell+1} = R^2/r^2$, not $R/r$.`, null, md`$r/R$ grows without bound. $V \to 0$ as $r \to \infty$ forbids every $A_\ell$ outside.`],
        md`BCs outside: 1. $V \to 0$ as $r \to \infty$, so every $A_\ell = 0$. 2. $V(R,\theta) = \tfrac k2(P_0 - P_1)$, so $B_0 = \tfrac{kR}{2}$ and $B_1 = -\tfrac{kR^2}{2}$. Each $P_\ell$ keeps its coefficient and trades $(r/R)^\ell$ for $(R/r)^{\ell+1}$. At $r = R$ both forms give $\tfrac k2(1 - \cos\theta)$. Far away $V \approx \dfrac{kR}{2r}$: a net charge $Q = 2\pi\varepsilon_0kR$.`,
        { figHtml: sphL('k\\sin^2(\\theta/2)') }),

      Q(md`A sphere's data have $a_0 = 0$, $a_1 = 0.4$, $a_2 = 0.3$ (in units of $V_0$). What is $\vb E$ at the center?`,
        [md`$-\dfrac{0.4V_0}{R}\,\uv z$`, md`$-\dfrac{0.7V_0}{R}\,\uv z$`, md`$0$, because $a_0 = 0$`, md`$-\dfrac{0.3V_0}{R}\,\uv z$`], 0,
        [null, md`The $\ell = 2$ term goes like $r^2$; its gradient vanishes at the center.`, md`$a_0$ is the potential at the center. The field there comes from the slope, the $\ell = 1$ term.`, md`$\ell = 2$ contributes nothing at $r = 0$.`],
        md`Near the center $V \approx V_0\left[a_0 + a_1\frac{z}{R} + O(r^2)\right]$, using $rP_1 = z$. So $\vb E(0) = -\nabla V = -\frac{a_1V_0}{R}\uv z$. Center value from $a_0$, center field from $a_1$.`,
        { figHtml: sphL('V_0(\\theta)') }),

      Q(md`A sphere is held at $V_0P_2(\cos\theta)$. What is $\sigma$ at the north pole?`,
        [md`$\dfrac{\varepsilon_0V_0}{R}$`, md`$\dfrac{5\varepsilon_0V_0}{R}$`, md`$\dfrac{2\varepsilon_0V_0}{R}$`, md`$\dfrac{3\varepsilon_0V_0}{R}$`], 1,
        [md`The factor $(2\ell + 1)$ from the jump in $E_r$ is missing.`, null, md`$\ell$ is only the inside slope. The outside slope adds $\ell + 1$.`, md`$\ell + 1$ is only the outside slope. The inside adds $\ell$.`],
        md`$\sigma = \frac{\varepsilon_0V_0}{R}(2\ell+1)a_\ell P_\ell$ with $\ell = 2$, $a_2 = 1$, $P_2(1) = 1$: $\frac{5\varepsilon_0V_0}{R}$. The outside field drops by $\ell + 1$ and the inside rises by $\ell$; their sum is $2\ell + 1$.`,
        { figHtml: sphL('V_0P_2(\\cos\\theta)') }),

      Q(md`What is the total charge on the sphere held at $V_0\cos^3\theta$?`,
        [md`$\tfrac{12}{5}\pi\varepsilon_0RV_0$`, md`$4\pi\varepsilon_0RV_0$`, md`$0$`, md`It can't be found without $\sigma(\theta)$.`], 2,
        [md`That mixes the dipole coefficient into $Q$. Only $a_0$ carries net charge.`, md`That is a sphere held at a constant $V_0$.`, null, md`$Q = 4\pi\varepsilon_0RV_0a_0$ needs only $a_0$.`],
        md`$a_0 = \tfrac12\int_{-1}^1x^3\,dx = 0$. Odd data average to zero, so $Q = 0$: as much positive charge in the north as negative in the south.`,
        { figHtml: FIG.cos3 }),

      Q(md`Far from a sphere held at $V_0\cos^2\theta$ (nothing else around), what is $V$ to leading order?`,
        [md`$\dfrac{V_0R}{3r}$`, md`$\dfrac{2V_0R^3}{3r^3}P_2(\cos\theta)$`, md`$\dfrac{V_0R}{r}$`, md`$\dfrac{V_0R^2\cos^2\theta}{r^2}$`], 0,
        [null, md`That is the $\ell = 2$ term. It falls like $1/r^3$; the $1/r$ term wins far away.`, md`That would need the average of $\cos^2\theta$ to be $1$; it is $\tfrac13$.`, md`$\cos^2\theta$ is not a single $P_\ell$, and $1/r^2$ goes with $P_1$, which is absent here.`],
        md`$\cos^2\theta = \tfrac13P_0 + \tfrac23P_2$. Far away the monopole wins: $V \approx \frac{a_0V_0R}{r} = \frac{V_0R}{3r}$, a net charge $Q = \tfrac43\pi\varepsilon_0RV_0$.`,
        { figHtml: sphL('V_0\\cos^2\\theta') }),

      Q(md`For the sphere at $V_0\cos^3\theta$, what is $V$ at $r = R/2$ on the **negative** $z$ axis?`,
        [md`$\tfrac{7}{20}V_0$`, md`$0$`, md`$-\tfrac{3}{10}V_0$`, md`$-\tfrac{7}{20}V_0$`], 3,
        [md`That is the value on the positive axis. On the negative axis odd terms flip sign.`, md`$V = 0$ on the equatorial plane, not on the axis.`, md`That keeps only the $\ell = 1$ term; the $\ell = 3$ term adds $-\tfrac25\cdot\tfrac18 = -\tfrac{1}{20}$.`, null],
        md`$P_\ell(-1) = (-1)^\ell$: $V = V_0\left[\tfrac35\cdot\tfrac12\cdot(-1) + \tfrac25\cdot\tfrac18\cdot(-1)\right] = -\tfrac{7}{20}V_0$. Odd data give an antisymmetric potential.`,
        { figHtml: FIG.cos3 }),

      Q(md`For the sphere at $V_0\cos^3\theta$, at $r = 3R$ on the axis, how big is the $\ell = 3$ term compared with the $\ell = 1$ term?`,
        [md`$\tfrac{2}{27}$`, md`$\tfrac23$`, md`$\tfrac29$`, md`$\tfrac19$`], 0,
        [null, md`That is the ratio of the coefficients alone, $\tfrac{2/5}{3/5}$. The radial factors differ.`, md`That is $\tfrac23\cdot\tfrac13$: one factor of $\tfrac13$ where the radial ratio $(R/r)^4/(R/r)^2$ gives two.`, md`That is only the radial ratio $(R/r)^4/(R/r)^2$; multiply by the coefficient ratio $\tfrac23$.`],
        md`$\dfrac{\tfrac25(1/3)^4}{\tfrac35(1/3)^2} = \tfrac23\cdot\tfrac19 = \tfrac{2}{27} \approx 0.07$. Outside, higher $\ell$ fade fast: from a few radii away the sphere looks like a pure dipole.`,
        { figHtml: sph({ lab: 'V_0\\cos^3\\theta', Pout: { f: 1.9, th: 0, lab: 'r=3R' } }) }),

      Q(md`For the sphere at $V_0\cos^3\theta$: $V_0(\theta) \ge 0$ on the whole northern hemisphere. Is $\sigma \ge 0$ there too?`,
        [md`Yes. Positive potential means positive charge.`, md`Yes, because $\sigma$ is proportional to $V_0(\theta)$.`, md`No, but only exactly at the equator.`, md`No. $\sigma \propto 35\cos^3\theta - 12\cos\theta$ is negative for $54^\circ \lt \theta \lt 90^\circ$.`], 3,
        [md`$\sigma$ is set by the jump in $\partial V/\partial r$, not by $V$ itself.`, md`$\sigma \propto \sum(2\ell+1)a_\ell P_\ell$, which weights each $\ell$ differently from $V_0 = \sum a_\ell P_\ell$. Only a single-$\ell$ boundary makes them proportional.`, md`At the equator $\sigma = 0$; the negative band is the whole range $54^\circ$ to $90^\circ$.`, null],
        md`The weights $(2\ell+1)$ boost the $\ell = 3$ term (factor 7) relative to $\ell = 1$ (factor 3), and $P_3$ is negative between its zero at $39^\circ$ and the equator. The sign of $\sigma$ flips at $\cos^2\theta = \tfrac{12}{35}$, $\theta = 54.2^\circ$.`,
        { figHtml: FIG.cos3 }),

      Q(md`Why does $V$ at the center depend only on $a_0$?`,
        [md`Because every other term carries $r^\ell$ with $\ell \ge 1$, which is zero at $r = 0$.`, md`Because $P_\ell(\cos\theta) = 0$ at the center.`, md`Because the center is on the equator.`, md`Because higher $a_\ell$ are always small.`], 0,
        [null, md`$\theta$ is undefined at the center; it is the $r^\ell$ factor that kills those terms.`, md`The center is not on any particular latitude.`, md`The $a_\ell$ can be large; they still multiply $r^\ell = 0$.`],
        md`$V_{\text{in}}(0) = V_0\sum a_\ell\cdot0^\ell P_\ell = a_0V_0$, and $a_0 = \tfrac12\int_0^\pi\frac{V_0(\theta)}{V_0}\sin\theta\,d\theta$ is the surface average. So the center potential is the average over the sphere (the mean-value property, Unit 3).`,
        { figHtml: sphL('V_0(\\theta)') }),

      Q(md`Which boundary potential gives **zero** field at the center of the sphere?`,
        [md`$V_0\cos\theta$`, md`$V_0\cos^2\theta$`, md`$V_0(1 + \cos\theta)^2$`, md`$V_0\cos^3\theta$`], 1,
        [md`$a_1 = 1$: a uniform field $-\frac{V_0}{R}\uv z$ inside.`, null, md`$a_1 = 2$.`, md`$a_1 = \tfrac35$.`],
        md`The field at the center needs $a_1 \ne 0$. $\cos^2\theta$ is even ($\ell = 0, 2$ only), so $a_1 = 0$ and $\vb E(0) = 0$: the center is a saddle point of $V$. Any north–south symmetric data give zero field at the center.`,
        { figHtml: sphL('V_0\\cos^2\\theta') }),

      Q(md`Far from the $\pm V_0$ hemispheres (upper $+V_0$, lower $-V_0$), what does the potential look like?`,
        [md`$\dfrac{V_0R}{r}$, a net charge`, md`$0$ at every order`, md`A quadrupole, $\propto P_2/r^3$`, md`A dipole, $\dfrac{p\cos\theta}{4\pi\varepsilon_0r^2}$ with $p = 6\pi\varepsilon_0R^2V_0$`], 3,
        [md`$a_0 = 0$: equal areas at $\pm V_0$. No net charge.`, md`$a_1 = \tfrac32 \ne 0$, so there is a far field.`, md`Even $\ell$ are absent for antisymmetric data.`, null],
        md`The lowest nonzero term is $\ell = 1$: $V \approx a_1V_0\frac{R^2}{r^2}\cos\theta = \frac{3V_0R^2\cos\theta}{2r^2}$. Matching $\frac{p\cos\theta}{4\pi\varepsilon_0r^2}$ gives $p = 4\pi\varepsilon_0R^2\cdot\tfrac32V_0 = 6\pi\varepsilon_0R^2V_0$.`,
        { figHtml: FIG.hemPM }),

      Q(md`A sphere is held at $V_0\cos\theta$ (nothing else around). What is $\sigma(\theta)$?`,
        [md`$\dfrac{\varepsilon_0V_0}{R}\cos\theta$`, md`$\dfrac{2\varepsilon_0V_0}{R}\cos\theta$`, md`$\dfrac{3\varepsilon_0V_0}{R}\cos\theta$`, md`$\dfrac{\varepsilon_0V_0}{R}$`], 2,
        [md`The factor $2\ell + 1 = 3$ is missing.`, md`That counts only the outside slope ($\ell + 1 = 2$).`, null, md`A uniform $\sigma$ would be pure $\ell = 0$ and would make $V$ constant on the sphere.`],
        md`$\sigma = \frac{\varepsilon_0V_0}{R}(2\ell+1)a_\ell P_\ell$ with $\ell = 1$, $a_1 = 1$: $\frac{3\varepsilon_0V_0}{R}\cos\theta$. Reverse check (Unit 8, Ex. 3.9): $\sigma = k\cos\theta$ makes $V = \frac{kR}{3\varepsilon_0}\cos\theta$ on the sphere.`,
        { figHtml: sphL('V_0\\cos\\theta') }),

      Q(md`A sphere is held at $V_0(1 + \cos\theta)$, nothing else around. The potential is $\ge 0$ everywhere on it. Where does the surface charge $\sigma$ change sign?`,
        [md`Nowhere: $V_0(\theta) \ge 0$, so $\sigma \ge 0$.`, md`At the south pole only, where $V_0 = 0$.`, md`At $\theta = 90^\circ$.`, md`At $\cos\theta = -\tfrac13$, $\theta \approx 109.5^\circ$.`], 3,
        [md`$\sigma$ follows $\sum(2\ell+1)a_\ell P_\ell$, not $V_0$. The $\ell = 1$ part is weighted three times as much.`, md`There $\sigma = \tfrac{\varepsilon_0V_0}{R}(1 - 3) \lt 0$; it is negative over a whole cap, not just at a point.`, md`At $90^\circ$, $\sigma = \tfrac{\varepsilon_0V_0}{R} \gt 0$.`, null],
        md`$a_0 = a_1 = 1$, so $\sigma = \tfrac{\varepsilon_0V_0}{R}(1 + 3\cos\theta)$: zero at $\cos\theta = -\tfrac13$. Below that latitude the charge is negative even though the potential there is positive: field lines from the hot north curve around and end on the cold southern cap.`,
        { figHtml: sphL('V_0(1+\\cos\\theta)') }),

      Q(md`In the direct sphere problem (inside and outside), how many conditions fix the coefficients for one value of $\ell$, and why that number?`,
        [md`Two: one per region.`, md`One: $V(R,\theta) = V_0(\theta)$.`, md`Three: finite at $0$, zero at infinity, and the surface.`, md`Four: two unknowns ($A_\ell$, $B_\ell$) in each of two regions, so two conditions per region.`], 3,
        [md`Each region has two unknowns per $\ell$, so one condition per region leaves one constant free.`, md`That is one equation; there are four unknowns per $\ell$.`, md`The surface condition counts twice: it must hold from the inside **and** from the outside.`, null],
        md`Inside: finite at $r = 0$ ($B_\ell = 0$) and $V(R^-) = V_0$ (fixes $A_\ell$). Outside: $V \to 0$ ($A_\ell = 0$) and $V(R^+) = V_0$ (fixes $B_\ell$). Four conditions, four unknowns. A charged shell has the same count, with continuity and the jump replacing the two surface values.`,
        { figHtml: FIG.cos3 }),

      Q(md`$\sigma = \dfrac{\varepsilon_0V_0}{R}\displaystyle\sum_\ell(2\ell+1)a_\ell P_\ell(\cos\theta)$. When you integrate it over the sphere to get the total charge, what happens to the factors $2\ell + 1$?`,
        [md`They all survive, so $Q = 4\pi\varepsilon_0RV_0\sum(2\ell+1)a_\ell$.`, md`Only the $\ell = 0$ term survives the integral, and its factor is $1$: $Q = 4\pi\varepsilon_0RV_0a_0$.`, md`They cancel against the norms $\frac{2}{2\ell+1}$.`, md`Only the $\ell = 1$ term survives.`], 1,
        [md`$\int_0^\pi P_\ell\sin\theta\,d\theta = 0$ for every $\ell \ge 1$; those terms carry no net charge.`, null, md`No norms appear: you integrate $P_\ell$ once, not $P_\ell^2$.`, md`$\int P_1\sin\theta\,d\theta = 0$ too; the $\ell = 1$ term moves charge from south to north without adding any.`],
        md`$Q = \oint\sigma\,da = 2\pi R^2\int_0^\pi\sigma\sin\theta\,d\theta$, and $\int_0^\pi P_\ell\sin\theta\,d\theta = 2\delta_{\ell0}$. So $Q = 2\pi R^2\cdot\frac{\varepsilon_0V_0}{R}\cdot2a_0 = 4\pi\varepsilon_0RV_0a_0$, the same as from the far field. The higher harmonics rearrange charge without adding any.`,
        { figHtml: sphL('V_0(\\theta)') }),

      Q(md`Double the radius of a sphere, keeping the same pattern $V_0(\theta)$ on it. How do the total charge $Q$ and the surface charge $\sigma(\theta)$ change?`,
        [md`$Q$ doubles; $\sigma$ halves.`, md`Both double.`, md`$Q$ quadruples (area); $\sigma$ is unchanged.`, md`Both are unchanged; only the potential matters.`], 0,
        [null, md`$\sigma = \frac{\varepsilon_0V_0}{R}\sum(2\ell+1)a_\ell P_\ell$ falls like $1/R$.`, md`The same $\sigma$ would need the same field at the surface, but the field is of order $V_0/R$, which halves.`, md`The same potential on a bigger sphere needs more charge: $Q = 4\pi\varepsilon_0Ra_0V_0$ grows with $R$ (capacitance $\propto R$).`],
        md`Fields scale like $V_0/R$ (the same potential differences over twice the distance), so $\sigma = \varepsilon_0\,\Delta E_r$ halves. Charge is $\sigma$ times area: $\tfrac12\times4 = 2$. Same as the isolated sphere, $C = 4\pi\varepsilon_0R$. Scaling checks like this catch a missing factor of $R$ fast.`,
        { figHtml: sphL('V_0(\\theta)') }),

      G('leg_sphere', { need: 4 }),

      P({
        id: 'uL-sph-sq', src: 'Exam-style', title: 'Sphere at V₀(1 + cos θ)²', big: true,
        q: md`A thin spherical shell of radius $R$ is held at $V_0(\theta) = V_0(1 + \cos\theta)^2$; there is no other charge. Find (a) $V$ inside, (b) $V$ at the center, (c) $E_z$ at the center, (d) $\sigma$ at the north pole, (e) the total charge, and (f) $V$ at $r = 2R$ on the $+z$ axis.`,
        figHtml: FIG.onePlusSq,
        hints: [
          md`Write the numbered BCs first: finite at $r = 0$, $V \to 0$ at infinity, $V = V_0(\theta)$ on both sides of $r = R$.`,
          md`Expand by eye: $(1 + x)^2 = 1 + 2x + x^2 = \tfrac43P_0 + 2P_1 + \tfrac23P_2$ (Unit 8 did this one).`,
          md`Then use the table: center $a_0$; $E_z(0) = -a_1V_0/R$; $\sigma(0) = \frac{\varepsilon_0V_0}{R}\sum(2\ell+1)a_\ell$; $Q = 4\pi\varepsilon_0RV_0a_0$.`,
        ],
        parts: [
          { lbl: md`(a) $V_{\text{in}}(r,\theta)$`, expr: 'V0*(4/3 + 2*r*cos(theta)/R + (r^2/(3*R^2))*(3*cos(theta)^2 - 1))', vars: { V0: [1, 3], r: [0.1, 1], R: [1, 2], theta: [0, 3] }, accepts: ['V0*(4*R^2 + 6*R*r*cos(theta) + r^2*(3*cos(theta)^2-1))/(3*R^2)'] },
          { lbl: md`(b) $V(0)/V_0$`, ans: 4 / 3 },
          { lbl: md`(c) $E_z$ at the center`, expr: '-2*V0/R', vars: { V0: [1, 3], R: [1, 2] } },
          { lbl: md`(d) $\sigma(\theta = 0)$ in units of $\varepsilon_0V_0/R$`, ans: 32 / 3 },
          { lbl: md`(e) $Q$`, expr: '16*pi*eps0*R*V0/3', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
          { lbl: md`(f) $V(2R, 0)/V_0$`, ans: 1.25 },
        ],
        sol: md`
          **Region and BCs.** Inside ($r \le R$) and outside ($r \ge R$), both charge-free.
          1. $V$ finite at $r = 0$: no $B_\ell$ inside.
          2. $V \to 0$ as $r \to \infty$: no $A_\ell$ outside.
          3. $V(R^-,\theta) = V_0(1 + \cos\theta)^2$.
          4. $V(R^+,\theta) = V_0(1 + \cos\theta)^2$.

          **Expand.** $(1 + x)^2 = 1 + 2x + x^2 = 1 + 2P_1 + \tfrac23P_2 + \tfrac13P_0$, so $a_0 = \tfrac43$, $a_1 = 2$, $a_2 = \tfrac23$. Pole check: $\tfrac43 + 2 + \tfrac23 = 4 = (1 + 1)^2$.

          **(a)** $$V_{\text{in}} = V_0\left[\frac43 + 2\,\frac rR\cos\theta + \frac23\,\frac{r^2}{R^2}P_2(\cos\theta)\right] = V_0\left[\frac43 + \frac{2r\cos\theta}{R} + \frac{r^2\left(3\cos^2\theta - 1\right)}{3R^2}\right]$$

          Outside, $V_{\text{out}} = V_0\left[\frac43\frac Rr + 2\frac{R^2}{r^2}\cos\theta + \frac23\frac{R^3}{r^3}P_2(\cos\theta)\right]$.

          **(b)** $V(0) = \tfrac43V_0$, the surface average of $(1 + \cos\theta)^2$.

          **(c)** $E_z(0) = -\frac{a_1V_0}{R} = -\frac{2V_0}{R}$: the field points south, away from the hot north pole ($4V_0$) toward the cold south pole ($0$).

          **(d)** $\sigma = \frac{\varepsilon_0V_0}{R}\left[\tfrac43 + 3\cdot2\cos\theta + 5\cdot\tfrac23P_2\right] = \frac{\varepsilon_0V_0}{3R}\left(15\cos^2\theta + 18\cos\theta - 1\right)$. At the north pole: $\frac{32}{3}\frac{\varepsilon_0V_0}{R}$.

          **(e)** $Q = 4\pi\varepsilon_0RV_0\cdot\tfrac43 = \tfrac{16}{3}\pi\varepsilon_0RV_0$.

          **(f)** On the $+z$ axis, $P_\ell = 1$: $V(2R) = V_0\left[\tfrac43\cdot\tfrac12 + 2\cdot\tfrac14 + \tfrac23\cdot\tfrac18\right] = V_0\left[\tfrac23 + \tfrac12 + \tfrac{1}{12}\right] = \tfrac54V_0$.

          **Checks.** At $r = R$ both forms reduce to $V_0(1 + \cos\theta)^2$. Far field $\frac{4V_0R}{3r} = \frac{Q}{4\pi\varepsilon_0r}$, consistent with (e). $\sigma$ at the south pole: $\frac{\varepsilon_0V_0}{3R}(15 - 18 - 1) = -\frac43\frac{\varepsilon_0V_0}{R}$, negative even though $V_0(\pi) = 0$, not negative.

          **What to remember:** once the data are expanded, every quantity is one line from the table.
        `,
      }),

      P({
        title: 'Hemispheres at ±V₀, two terms',
        q: md`The upper hemisphere of a thin shell (radius $R$) is held at $+V_0$ and the lower at $-V_0$. Keep only the first two nonzero terms, $a_1 = \tfrac32$ and $a_3 = -\tfrac78$. Find (a) $E_z$ at the center, (b) the dipole moment $p$, (c) $V$ at $r = 2R$ on the $+z$ axis (two terms), and (d) the two-term $\sigma(\theta)$. (Unit 8 did the inside values on the axis; this problem is about the outside and the charge.)`,
        figHtml: FIG.hemPM,
        hints: [
          md`BCs as always: inside no $B_\ell$, outside no $A_\ell$, both sides match the data at $r = R$.`,
          md`$E_z(0) = -a_1V_0/R$. $\;p = 4\pi\varepsilon_0R^2V_0a_1$. On the axis outside, $V = V_0\sum a_\ell(R/z)^{\ell+1}$.`,
          md`$\sigma = \frac{\varepsilon_0V_0}{R}\left[3a_1P_1 + 7a_3P_3\right]$.`,
        ],
        parts: [
          { lbl: md`(a) $E_z(0)$`, expr: '-3*V0/(2*R)', vars: { V0: [1, 3], R: [1, 2] } },
          { lbl: md`(b) $p$`, expr: '6*pi*eps0*R^2*V0', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
          { lbl: md`(c) $V(2R, 0)/V_0$ from two terms`, ans: 41 / 128 },
          { lbl: md`(d) $\sigma(\theta)$, two terms`, expr: '(eps0*V0/R)*((9/2)*cos(theta) - (49/16)*(5*cos(theta)^3 - 3*cos(theta)))', vars: { eps0: [0.5, 2], V0: [1, 3], R: [1, 2], theta: [0, 3] }, accepts: ['(eps0*V0/R)*((219/16)*cos(theta) - (245/16)*cos(theta)^3)'] },
          { lbl: md`What is $V$ everywhere on the plane $z = 0$ (inside and outside)?`, mc: [md`$0$, since only odd $\ell$ appear and $P_\ell(0) = 0$ for odd $\ell$`, md`$V_0/2$`, md`It depends on $r$`], a: 0,
            why: [null, md`$V_0/2$ would be the midpoint of $V_0$ and $0$. Here the two sides are $\pm V_0$.`, md`Every term has a factor $P_\ell(0) = 0$, whatever $r$ is.`] },
        ],
        sol: md`
          **BCs.** (1) finite at $r = 0$; (2) $V \to 0$ at infinity; (3)–(4) $V = +V_0$ for $\theta \lt \pi/2$ and $-V_0$ for $\theta \gt \pi/2$ on both sides of $r = R$. The expansion is $V_0\left[\tfrac32P_1 - \tfrac78P_3 + \tfrac{11}{16}P_5 - \dots\right]$ (Lesson 4).

          **(a)** $E_z(0) = -\tfrac32\frac{V_0}{R}$: from the $+V_0$ north toward the $-V_0$ south.

          **(b)** $p = 4\pi\varepsilon_0R^2\cdot\tfrac32V_0 = 6\pi\varepsilon_0R^2V_0$, along $+\uv z$.

          **(c)** $V(2R) = V_0\left[\tfrac32\left(\tfrac12\right)^2 - \tfrac78\left(\tfrac12\right)^4\right] = V_0\left[\tfrac38 - \tfrac{7}{128}\right] = \tfrac{41}{128}V_0 \approx 0.320V_0$. Summing the full series gives $0.329V_0$: two terms are good to 3% at $2R$.

          [[fig:ax]]

          **(d)** $\sigma \approx \frac{\varepsilon_0V_0}{R}\left[\tfrac92P_1 - \tfrac{49}{8}P_3\right]$. Be careful with it: $\sigma$ weights $a_\ell$ by $2\ell + 1$, and $\lvert a_\ell\rvert$ falls only like $\ell^{-1/2}$, so the $\sigma$ series does not converge at all on the surface (at the pole its terms grow like $\ell^{1/2}$). $\sigma$ itself is finite away from the equator; you get it from the fields just inside and outside ($r \to R^\pm$), where the factors $(r/R)^\ell$ and $(R/r)^{\ell+1}$ make every series converge. The two-term form even has the wrong sign at the pole: $\tfrac92 - \tfrac{49}{8} = -\tfrac{13}{8}$, while the exact value (from the closed-form axis potential) is $\left(2\sqrt2 - 1\right)\frac{\varepsilon_0V_0}{R} \approx 1.83\,\frac{\varepsilon_0V_0}{R}$. Near the equator the true $\sigma$ diverges, because the potential jumps across the thin gap. Use the two-term $\sigma$ only as the form the question asks for, not as numbers.

          **What to remember:** potentials and fields off the surface converge fast; quantities on the surface ($\sigma$) need many terms when the data jump.
        `,
        figs: { ax: { svg: FIG.hemAx, cap: '$V$ on the $+z$ axis outside the $\\pm V_0$ sphere. Solid: the full series. Dashed: the two-term approximation.' } },
      }),

      P({
        title: 'The whole axis of a sphere at V₀ sin² θ',
        q: md`A thin shell of radius $R$ is held at $V_0\sin^2\theta$ with no other charge. (a) Find $V$ on the $z$ axis inside, $V(z)$ for $0 \le z \le R$. (b) Find $V$ on the $+z$ axis outside, for $z \ge R$. (c) Where on the outside axis is $V$ largest, and what is it? (d) Find $\sigma$ at the north pole.`,
        figHtml: FIG.sin2axis,
        hints: [
          md`BCs: finite at the center, zero at infinity, $V_0\sin^2\theta$ on both sides of $r = R$. Expand: $\sin^2\theta = 1 - x^2 = \tfrac23P_0 - \tfrac23P_2$.`,
          md`On the axis $P_\ell = 1$, so $V_{\text{in}}(z) = V_0\sum a_\ell(z/R)^\ell$ and $V_{\text{out}}(z) = V_0\sum a_\ell(R/z)^{\ell+1}$.`,
          md`For (c), set $dV/dz = 0$.`,
        ],
        parts: [
          { lbl: md`(a) $V_{\text{in}}(z)$ on the axis`, expr: '(2/3)*V0*(1 - z^2/R^2)', vars: { V0: [1, 3], z: [0.1, 1], R: [1, 2] } },
          { lbl: md`(b) $V_{\text{out}}(z)$ on the axis`, expr: '(2/3)*V0*(R/z - R^3/z^3)', vars: { V0: [1, 3], z: [2, 4], R: [1, 2] } },
          { lbl: md`(c) the position of the maximum, $z/R$`, ans: Math.sqrt(3) },
          { lbl: md`(c) the maximum value, $V/V_0$`, ans: 4 * Math.sqrt(3) / 27 },
          { lbl: md`(d) $\sigma(0)$ in units of $\varepsilon_0V_0/R$`, ans: -8 / 3 },
        ],
        sol: md`
          **BCs.** (1) $V$ finite at $r = 0$; (2) $V \to 0$ as $r \to \infty$; (3)–(4) $V(R,\theta) = V_0\sin^2\theta$ from both sides.

          **Expand.** $\sin^2\theta = \tfrac23P_0 - \tfrac23P_2$: $a_0 = \tfrac23$, $a_2 = -\tfrac23$.

          **(a)** $V_{\text{in}}(z) = V_0\left[\tfrac23 - \tfrac23\frac{z^2}{R^2}\right] = \tfrac23V_0\left(1 - \frac{z^2}{R^2}\right)$. It goes from $\tfrac23V_0$ at the center to $0$ at the pole, as it must ($\sin^20 = 0$).

          **(b)** $V_{\text{out}}(z) = \tfrac23V_0\left(\frac Rz - \frac{R^3}{z^3}\right)$. Zero at $z = R$, positive beyond.

          **(c)** $\frac{d}{dz}\left(\frac Rz - \frac{R^3}{z^3}\right) = -\frac{R}{z^2} + \frac{3R^3}{z^4} = 0$ at $z = \sqrt3R$. There $V = \tfrac23V_0\left(\frac{1}{\sqrt3} - \frac{1}{3\sqrt3}\right) = \frac{4V_0}{9\sqrt3} = \frac{4\sqrt3}{27}V_0 \approx 0.257V_0$.

          **(d)** $\sigma(0) = \frac{\varepsilon_0V_0}{R}\left[1\cdot\tfrac23 + 5\cdot\left(-\tfrac23\right)\right] = -\frac83\frac{\varepsilon_0V_0}{R}$. Negative at the pole: the grounded pole is surrounded by a hot equatorial belt, so field lines end there.

          **Checks.** $\vb E(0) = 0$ (no $\ell = 1$); total charge $4\pi\varepsilon_0R\cdot\tfrac23V_0 \gt 0$; the axis is the line where the $\ell = 2$ term is most negative, which is why $V$ dips to zero at the poles.

          **What to remember:** on the axis no Legendre polynomial needs evaluating. That makes axis questions the fastest direct questions there are.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Always open with the numbered BCs: finite at $r = 0$, zero at infinity, $V_0(\theta)$ on both sides.
          - $V_{\text{in}} = V_0\sum a_\ell(r/R)^\ell P_\ell$, $V_{\text{out}} = V_0\sum a_\ell(R/r)^{\ell+1}P_\ell$: same $a_\ell$ as the data.
          - Center: $V = a_0V_0$, $\vb E = -\frac{a_1V_0}{R}\uv z$. Charge: $Q = 4\pi\varepsilon_0RV_0a_0$. Dipole: $p = 4\pi\varepsilon_0R^2V_0a_1$.
          - $\sigma = \frac{\varepsilon_0V_0}{R}\sum(2\ell+1)a_\ell P_\ell$. Its shape differs from $V_0(\theta)$, and it can change sign where $V_0$ doesn't.
          - On the axis use $P_\ell(\pm1) = (\pm1)^\ell$. Far away, the lowest nonzero $\ell$ wins.
      `),
    ],
  };

  // =====================================================================================
  // Lesson 6: exam-style mixed set
  // =====================================================================================
  FIG.belt = sph({ arcs: [[-57, 57, ''], [63, 117, 'thick'], [123, 237, ''], [243, 297, 'thick']], lab: 'V=0', labTh: 30, lab3: 'V_0', lab3Th: 90, Rth: 215 });
  FIG.twoCaps = sph({ arcs: [[-57, 57, 'thick'], [63, 117, ''], [123, 237, 'thick'], [243, 297, '']], lab: 'V_0', labTh: 28, lab2: 'V_0', lab2Th: 152, lab3: 'V=0', lab3Th: 90, R: false, mark: { th: -60, lab: '60^\\circ', r: 20 } });
  FIG.pmCaps = sph({ arcs: [[-27, 27, 'thick'], [33, 147, ''], [153, 207, 'thick'], [213, 327, '']], lab: '+V_0', labTh: 18, lab2: '-V_0', lab2Th: 162, lab3: 'V=0', lab3Th: 90, R: false });
  FIG.given = sph({ lab: 'V_0(\\theta)=\\ ?', inLab: 'V\\ \\text{given}', inX: 22, inY: 30 });
  FIG.axisIn = sph({ Pin: { f: 0.62, th: 0, lab: 'z' }, inLab: '\\rho=0', inX: 22, inY: 30 });
  FIG.axisOut = sph({ lab: 'V_0(\\theta)=\\ ?', Pout: { f: 1.75, th: 0, lab: 'P\\ (z)' } });
  FIG.pair = pairFig();
  FIG.charge = chargeFig();
  FIG.avg = avgFig('V_0\\cos^6(\\theta/2)');
  FIG.northSq = hemis({ top: 'V_0\\cos^2\\theta', bot: 'V=0', botThin: true });
  FIG.sin2cos = sphL('V_0\\sin^2\\theta\\cos\\theta');

  const L6 = {
    id: 'uL-exam', title: 'Exam-style mixed set',
    steps: [
      RF(md`
        These are direct Legendre questions phrased the way a professor writes them. Do each one on paper before opening the hints, and time yourself: the target is 10–15 minutes for the big ones.

        Before you start, the toolkit in one place:

        | need | tool |
        |---|---|
        | $P_\ell$ itself | Rodrigues, $\frac{1}{2^\ell\ell!}\frac{d^\ell}{dx^\ell}(x^2-1)^\ell$; check $P_\ell(1) = 1$ |
        | is it a solution? | Legendre's equation; degree $n$ means $\ell(\ell+1) = n(n+1)$ |
        | an integral | substitute $x = \cos\theta$; degree and parity shortcuts; norm $\frac{2}{2\ell+1}$ |
        | coefficients | by eye for polynomials, else $a_\ell = \frac{2\ell+1}{2}\int_{-1}^1fP_\ell\,dx$ |
        | which $\ell$ | north–south symmetric: even; antisymmetric: odd; degree $n$: $\ell \le n$ |
        | a sphere | numbered BCs, then $a_\ell(r/R)^\ell$ inside and $a_\ell(R/r)^{\ell+1}$ outside |
        | $V$ known on the axis | **axis trick**: expand in powers of $z$, replace $z^\ell \to r^\ell P_\ell(\cos\theta)$ (or $z^{-(\ell+1)} \to r^{-(\ell+1)}P_\ell$) |
        | a point charge on the axis | $\dfrac{1}{\lvert\vb r - \vb r'\rvert} = \sum_\ell\dfrac{r_<^\ell}{r_>^{\ell+1}}P_\ell(\cos\gamma)$ |
        | averages | the average of $V$ over any sphere centered on the origin inside is $a_0V_0$ |

        **The axis trick** (Unit 7, Lesson 8) works because the general solution $\sum(A_\ell r^\ell + B_\ell r^{-(\ell+1)})P_\ell$ reduces on the $+z$ axis to $\sum(A_\ell z^\ell + B_\ell z^{-(\ell+1)})$, since $P_\ell(1) = 1$. Knowing $V$ on the axis fixes every coefficient, and uniqueness does the rest. It needs a charge-free region that contains a piece of the axis.

        **The point-charge expansion** (Griffiths §3.4.1; Unit 8 uses it for the multipole expansion). Here $r_<$ is the smaller of $r$ and $r'$, $r_>$ the larger, and $\gamma$ is the angle between $\vb r$ and $\vb r'$. For a charge on the $z$ axis, $\gamma = \theta$. You can derive it in one line with the axis trick: on the axis below a charge at $z = d$, $\frac{1}{d - z} = \sum_\ell\frac{z^\ell}{d^{\ell+1}}$.

        **Averages.** Over a sphere of radius $r$ centered on the origin, $\int_0^\pi P_\ell(\cos\theta)\sin\theta\,d\theta = 0$ for every $\ell \ge 1$. So only the $\ell = 0$ term survives the average: $a_0V_0$ inside (the same on every inner sphere, the mean-value property), and $a_0V_0R/r$ outside.
      `),

      Q(md`A belt $60^\circ \lt \theta \lt 120^\circ$ of a sphere is held at $V_0$ and the rest is grounded. Which $\ell$ can appear in $V$?`,
        [md`Odd $\ell$ only`, md`Even $\ell$ only`, md`$\ell = 0$ only`, md`All $\ell$`], 1,
        [md`The belt is symmetric under $\theta \to \pi - \theta$; odd terms are antisymmetric and cancel.`, null, md`The data vary with $\theta$ (0 at the poles, $V_0$ on the belt), so higher even $\ell$ are needed too.`, md`Symmetry removes every odd $\ell$.`],
        md`North–south symmetric data: $V_0(\pi - \theta) = V_0(\theta)$, so only even $\ell$. The data jump, so infinitely many of them. $a_0 = \tfrac12\int_{-1/2}^{1/2}dx = \tfrac12$.`,
        { figHtml: FIG.belt }),

      Q(md`A cap $\theta \lt 30^\circ$ is held at $+V_0$, the cap $\theta \gt 150^\circ$ at $-V_0$, and the rest is grounded. Which $\ell$ can appear?`,
        [md`Even $\ell$ only`, md`$\ell = 1$ only`, md`Odd $\ell$ only`, md`All $\ell$`], 2,
        [md`$V_0(\pi - \theta) = -V_0(\theta)$: antisymmetric, so even terms vanish.`, md`$\cos\theta$ alone can't make flat caps with a grounded band.`, null, md`Antisymmetry removes every even $\ell$, including $\ell = 0$ (no net charge).`],
        md`Antisymmetric data: only odd $\ell$, infinitely many. $a_0 = 0$, so the center is at $V = 0$ and the sphere is neutral, while $a_1 \ne 0$ gives a field at the center and a dipole far away.`,
        { figHtml: FIG.pmCaps }),

      Q(md`A sphere is held at $V_0\cos\theta\,\lvert\cos\theta\rvert$. What does its expansion look like?`,
        [md`Odd $\ell$, infinitely many terms`, md`$\tfrac13P_0 + \tfrac23P_2$`, md`Even $\ell$, infinitely many terms`, md`$P_1$ and $P_3$ only`], 0,
        [null, md`That is $\cos^2\theta$. Here the sign flips in the south: $x\lvert x\rvert = -x^2$ for $x \lt 0$.`, md`$x\lvert x\rvert$ is odd: $(-x)\lvert -x\rvert = -x\lvert x\rvert$.`, md`$x\lvert x\rvert$ is not a polynomial (its second derivative jumps at $x = 0$), so the series doesn't stop.`],
        md`Odd function, not a polynomial: odd $\ell$ only, never ending. It is twice the odd part of the problem below ("north hemisphere at $V_0\cos^2\theta$"), whose coefficients $\tfrac38, \tfrac{7}{48}, -\tfrac{11}{384}$ double to $\tfrac34, \tfrac{7}{24}, -\tfrac{11}{192}$.`,
        { figHtml: sphL('V_0\\cos\\theta\\,\\lvert\\cos\\theta\\rvert') }),

      Q(md`On the $z$ axis inside a charge-free sphere you are told $V(z) = V_0z^3/R^3$. What is $V(r,\theta)$ inside?`,
        [md`$V_0\dfrac{r^3}{R^3}\cos^3\theta$`, md`$V_0\dfrac{r^3}{R^3}P_3(\cos\theta)$`, md`$V_0\dfrac{z^3}{R^3}$ everywhere`, md`$V_0\dfrac{R^4}{r^4}P_3(\cos\theta)$`], 1,
        [md`$r^3\cos^3\theta = z^3$, and $\nabla^2z^3 = 6z \ne 0$. It matches on the axis but is not a solution.`, null, md`Same function as the first option; not harmonic.`, md`That is the outside form; it blows up at the center.`],
        md`Axis trick: $z^\ell \to r^\ell P_\ell(\cos\theta)$, which matches on the axis because $P_\ell(1) = 1$ and solves Laplace's equation. In Cartesian form, $r^3P_3 = z^3 - \tfrac32z(x^2 + y^2)$. Replacing $z$ by $r\cos\theta$ is the trap.`,
        { figHtml: FIG.axisIn }),

      Q(md`Inside a charge-free sphere, $V = C\left(x^2 + y^2 - 2z^2\right)$. Which Legendre content does it have?`,
        [md`$\ell = 0$ and $\ell = 2$`, md`$\ell = 1$ only`, md`$\ell = 2$ only: it is $-2Cr^2P_2(\cos\theta)$`, md`$\ell = 0$ only`], 2,
        [md`$x^2 + y^2 - 2z^2 = r^2 - 3z^2 = r^2(1 - 3\cos^2\theta)$. No constant piece.`, md`It is quadratic in the coordinates, not linear.`, null, md`It depends on angle.`],
        md`$x^2 + y^2 - 2z^2 = r^2(1 - 3\cos^2\theta) = -2r^2P_2(\cos\theta)$. Its Laplacian is $2 + 2 - 4 = 0$. The boundary data that produced it are $-2CR^2P_2(\cos\theta)$, and the center is at $V = 0$.`,
        { figHtml: FIG.given }),

      Q(md`Why is the average of $V$ over **any** sphere of radius $r \lt R$ centered on the origin equal to $V(0)$?`,
        [md`Because $V$ is constant inside.`, md`Because $\int_0^\pi P_\ell(\cos\theta)\sin\theta\,d\theta = 0$ for $\ell \ge 1$, so only the $\ell = 0$ term $a_0V_0$ survives at every $r$.`, md`Because the field is zero inside.`, md`Only for $r = R/2$.`], 1,
        [md`$V$ varies inside (the $r^\ell P_\ell$ terms); its average doesn't.`, null, md`The field inside is generally not zero (e.g. $-\frac{a_1V_0}{R}\uv z$ at the center).`, md`It holds for every $r \lt R$.`],
        md`Average over the sphere of radius $r$: $\frac12\int_0^\pi\sum a_\ell V_0(r/R)^\ell P_\ell\sin\theta\,d\theta = a_0V_0$, since each $P_\ell$ with $\ell \ge 1$ is orthogonal to $P_0 = 1$. This is the mean-value theorem for Laplace's equation (Unit 3), seen through Legendre polynomials.`,
        { figHtml: FIG.avg }),

      Q(md`For the same sphere, what is the average of $V$ over a concentric sphere of radius $2R$ (outside)?`,
        [md`$a_0V_0$`, md`$0$`, md`$\tfrac14a_0V_0$`, md`$\tfrac12a_0V_0$`], 3,
        [md`Outside the $\ell = 0$ term is $a_0V_0R/r$, not constant.`, md`Only if $a_0 = 0$.`, md`$(R/r)^{\ell+1}$ with $\ell = 0$ is $\tfrac12$, not $\tfrac14$.`, null],
        md`Outside, $V = V_0\sum a_\ell(R/r)^{\ell+1}P_\ell$; averaging kills $\ell \ge 1$ and leaves $a_0V_0R/r = \tfrac12a_0V_0$ at $r = 2R$. It is the potential of the net charge $Q = 4\pi\varepsilon_0RV_0a_0$, as Gauss's law suggests.`,
        { figHtml: FIG.avg }),

      Q(md`In $\dfrac{1}{\lvert\vb r - \vb r'\rvert} = \sum_\ell\dfrac{r_<^\ell}{r_>^{\ell+1}}P_\ell(\cos\gamma)$, what is $\gamma$?`,
        [md`The angle between $\vb r$ and $\vb r'$`, md`The polar angle of $\vb r$`, md`The polar angle of $\vb r'$`, md`$\theta - \theta'$ always`], 0,
        [null, md`Only when $\vb r'$ lies on the $z$ axis is $\gamma$ equal to $\theta$.`, md`That is a different angle unless $\vb r$ is on the axis.`, md`$\gamma = \theta - \theta'$ only when both vectors lie in the same plane through the axis.`],
        md`$\gamma$ comes from the law of cosines, $\lvert\vb r - \vb r'\rvert^2 = r^2 + r'^2 - 2rr'\cos\gamma$. For a source on the $+z$ axis, $\gamma = \theta$ and the expansion is in $P_\ell(\cos\theta)$, ready to compare with the general solution.`,
        { figHtml: FIG.charge }),

      Q(md`A charge $q$ sits at $z = d$. For field points with $r \gt d$, the expansion of its potential is in powers of what?`,
        [md`$r/d$`, md`$d/r$, with terms $\dfrac{q}{4\pi\varepsilon_0}\dfrac{d^\ell}{r^{\ell+1}}P_\ell(\cos\theta)$`, md`$(r - d)/r$`, md`$\cos\theta$ only`], 1,
        [md`$r/d \gt 1$ there: the series would diverge. Always expand in (smaller)/(larger).`, null, md`Not a variable that appears in the expansion.`, md`The $r$ dependence is as important as the angle.`],
        md`$r_< = d$, $r_> = r$. Each term is an outside solution $B_\ell r^{-(\ell+1)}P_\ell$ with $B_\ell = \frac{qd^\ell}{4\pi\varepsilon_0}$: the multipole moments of a single off-center charge.`,
        { figHtml: FIG.charge }),

      Q(md`A sphere of radius $R$ is held at $V_0(\theta)$. Now a grounded concentric shell is added at $r = 2R$. What changes?`,
        [md`Nothing anywhere: the grounded shell is far away.`, md`Both inside and outside change.`, md`Only the inside changes.`, md`Inside $r \lt R$ nothing changes; between $R$ and $2R$ both $A_\ell$ and $B_\ell$ now appear.`], 3,
        [md`Between the shells $V$ must now vanish at $2R$, not at infinity, and the old $\sum a_\ell(R/r)^{\ell+1}P_\ell$ doesn't.`, md`The inside is bounded by $r = R$ alone, where $V$ is still $V_0(\theta)$, and the center is still regular: by uniqueness nothing changes there.`, md`Backwards.`, null],
        md`Each region feels only its own boundary conditions. Inside: finite at $0$ and $V_0(\theta)$ at $R$, unchanged. Between: $V_0(\theta)$ at $R$ and $0$ at $2R$, a two-sphere problem with both $r^\ell$ and $r^{-(\ell+1)}$. What does change is the charge on the inner sphere: the nearby grounded shell pulls more onto it.`,
        { figHtml: (() => { const f = PF.fig(); f.circle(0, 0, 124, { cls: 'thick' }); f.circle(0, 0, 56, { cls: 'thick' }); zAxis(f, 0, 0, -152); leader(f, 0, 0, 124, 40, 'V=0', 14); leader(f, 0, 0, 56, 205, 'V_0(\\theta)', 12); const e = at(0, 0, 124, 120); f.line(0, 0, e[0], e[1], { cls: 'dim', arrow: 'end', hs: 6 }); labLine(f, [0, 0], e, '2R', 1, 4, 0.75); const g = at(0, 0, 56, 300); f.line(0, 0, g[0], g[1], { cls: 'dim', arrow: 'end', hs: 6 }); labLine(f, [0, 0], g, 'R', 1, 3, 0.55); return f.svg(); })() }),

      Q(md`A charge $q$ on the $z$ axis at $z = d$ gives, near the origin, $V = \dfrac{q}{4\pi\varepsilon_0}\displaystyle\sum_\ell\dfrac{r^\ell}{d^{\ell+1}}P_\ell(\cos\theta)$. Move it away, $d \to \infty$, while holding $E_0 = \dfrac{q}{4\pi\varepsilon_0d^2}$ fixed. Near the origin, which terms survive (apart from a constant)?`,
        [md`Only $\ell = 1$: $V \to \text{const} + E_0r\cos\theta$, a uniform field $-E_0\uv z$.`, md`Only $\ell = 0$: the potential becomes a constant.`, md`All of them, unchanged.`, md`None: the charge is gone.`], 0,
        [null, md`The $\ell = 0$ term, $\frac{q}{4\pi\varepsilon_0d} = E_0d$, is a constant (large, but a constant makes no field). The $\ell = 1$ term $E_0r\cos\theta$ stays finite.`, md`The $\ell$ term is $E_0d^2\cdot\frac{r^\ell}{d^{\ell+1}} = E_0\frac{r^\ell}{d^{\ell-1}}$, which vanishes for $\ell \ge 2$.`, md`Its field near the origin is held at $E_0$ by construction.`],
        md`$\frac{q}{4\pi\varepsilon_0}\frac{r^\ell}{d^{\ell+1}} = E_0\frac{r^\ell}{d^{\ell-1}}$: $\ell = 0$ gives the constant $E_0d$, $\ell = 1$ gives $E_0r\cos\theta = E_0z$, and every $\ell \ge 2$ dies. A source pushed off to infinity leaves only its lowest non-trivial harmonic. That is what "a uniform field far away" means, and why the sphere-in-a-field problem keeps exactly $A_1$.`,
        { figHtml: FIG.charge }),

      Q(md`Two equal charges $+q$ sit at $z = +a$ and $z = -a$. For $r \gt a$, which $\ell$ appear in $V$?`,
        [md`Odd $\ell$ only`, md`Every $\ell$`, md`Even $\ell$ only, starting with $\ell = 0$ (net charge $2q$)`, md`$\ell = 0$ only`], 2,
        [md`That is the $\pm q$ pair, which is antisymmetric. Equal charges are symmetric under $z \to -z$.`, md`Mirror symmetry removes every odd $\ell$.`, null, md`Off the center the pair is not spherically symmetric: an $\ell = 2$ (quadrupole) term is there.`],
        md`$V(r, \pi - \theta) = V(r,\theta)$, so only even $\ell$. On the axis, $\frac{1}{z - a} + \frac{1}{z + a} = \frac{2z}{z^2 - a^2} = 2\sum_{\text{even }\ell}\frac{a^\ell}{z^{\ell+1}}$, so $V = \frac{2q}{4\pi\varepsilon_0}\sum_{\text{even}}\frac{a^\ell}{r^{\ell+1}}P_\ell(\cos\theta)$: a monopole $2q$, then a quadrupole.`,
        { figHtml: (() => { const f = PF.fig(); const a = 46; zAxis(f, 0, a + 40, -a - 110); f.dot(0, 0, 2.4); f.label(-6, 4, 'O', 'r', 'small accent'); f.charge(0, -a, { q: '+', lab: '+q', at: 'r' }); f.charge(0, a, { q: '+', lab: '+q', at: 'r' }); f.dim(-30, 0, -30, -a, 'a', { at: 'l' }); f.dim(-30, 0, -30, a, 'a', { at: 'l' }); return f.svg(); })() }),

      Q(md`Which of these quantities for a sphere at $V_0(\theta)$ needs more than $a_0$ and $a_1$?`,
        [md`$V$ at the center`, md`$\vb E$ at the center`, md`The total charge`, md`$\sigma$ at the north pole`], 3,
        [md`$a_0V_0$.`, md`$-\frac{a_1V_0}{R}\uv z$.`, md`$4\pi\varepsilon_0RV_0a_0$.`, null],
        md`$\sigma(0) = \frac{\varepsilon_0V_0}{R}\sum(2\ell+1)a_\ell$ involves every coefficient. The center value, center field, charge and dipole moment need only $a_0$ and $a_1$, which is why exams ask for them.`,
        { figHtml: sphL('V_0(\\theta)') }),

      Q(md`Inside a charge-free sphere $V = Ar^2\left(3\cos^2\theta - 1\right)$. What are $V$ at the center and the total charge on the sphere?`,
        [md`Both zero`, md`$V(0) = -A$, charge zero`, md`$V(0) = 0$, charge $4\pi\varepsilon_0AR^3$`, md`Both nonzero`], 0,
        [null, md`At $r = 0$ the factor $r^2$ kills it: $V(0) = 0$.`, md`The data are pure $\ell = 2$; only $\ell = 0$ carries net charge.`, md`No $\ell = 0$ term means neither.`],
        md`$V = 2Ar^2P_2(\cos\theta)$ is pure $\ell = 2$. So $a_0 = 0$: center at zero, no net charge, no dipole. The far field is a quadrupole.`,
        { figHtml: FIG.given }),

      Q(md`Why does the axis trick give the right answer off the axis?`,
        [md`Because $V$ is the same at every point at a given $r$.`, md`Because the general solution is fixed by its values on the axis ($P_\ell(1) = 1$ exposes every coefficient), and the solution is unique.`, md`It only gives an approximation off the axis.`, md`Because $\cos\theta = 1$ everywhere.`], 1,
        [md`$V$ depends on $\theta$ too.`, null, md`It is exact wherever the series converges in the charge-free region.`, md`$\cos\theta = 1$ only on the $+z$ axis.`],
        md`On the axis $\sum(A_\ell r^\ell + B_\ell r^{-(\ell+1)})P_\ell(\cos\theta)$ becomes a power series in $z$, and power series coefficients are unique. Then the full solution with those coefficients satisfies Laplace's equation and agrees with $V$; by uniqueness it is $V$.`,
        { figHtml: FIG.axisOut }),

      P({
        id: 'uL-E1', src: 'Exam-style', title: 'Rodrigues to a sphere', big: true,
        q: md`(a) From Rodrigues' formula, find $P_2(x)$ and $P_3(x)$. (b) Show that they are orthogonal on $[-1, 1]$. (c) Expand $f(\theta) = \sin^2\theta\cos\theta$ in Legendre polynomials. (d) Use your result to find the potential inside a sphere of radius $R$ whose surface is held at $V_0\sin^2\theta\cos\theta$.`,
        figHtml: FIG.sin2cos,
        hints: [
          md`(a) Prefactors $\frac18$ and $\frac{1}{48}$; differentiate $(x^2-1)^2$ twice and $(x^2-1)^3$ three times.`,
          md`(b) $P_2P_3$ is even times odd. Or multiply out and integrate.`,
          md`(c) $\sin^2\theta\cos\theta = x - x^3$; use $x^3 = \tfrac35P_1 + \tfrac25P_3$. (d) Numbered BCs, then $a_\ell(r/R)^\ell$.`,
        ],
        parts: [
          { lbl: md`(a) $P_2(x)$`, expr: '(3*x^2 - 1)/2', vars: { x: [-1, 1] } },
          { lbl: md`(a) $P_3(x)$`, expr: '(5*x^3 - 3*x)/2', vars: { x: [-1, 1] } },
          { lbl: md`(b) $\int_{-1}^1P_2P_3\,dx$`, ans: 0 },
          { lbl: md`(c) the coefficient of $P_1$`, ans: 0.4 },
          { lbl: md`(c) the coefficient of $P_3$`, ans: -0.4 },
          { lbl: md`(d) $V_{\text{in}}(r,\theta)$`, expr: '(2*V0/5)*((r/R)*cos(theta) - (r/R)^3*(5*cos(theta)^3 - 3*cos(theta))/2)', vars: { V0: [1, 3], r: [0.1, 1], R: [1, 2], theta: [0, 3] } },
          { lbl: md`(d) $V(R/2, 0)/V_0$`, ans: 0.15 },
        ],
        sol: md`
          **(a)** $\frac{d^2}{dx^2}(x^4 - 2x^2 + 1) = 12x^2 - 4$, times $\frac18$: $P_2 = \tfrac12(3x^2 - 1)$. $\;\frac{d^3}{dx^3}(x^6 - 3x^4 + 3x^2 - 1) = 120x^3 - 72x$, times $\frac{1}{48}$: $P_3 = \tfrac12(5x^3 - 3x)$. Both equal 1 at $x = 1$.

          **(b)** $\int_{-1}^1P_2P_3\,dx = \tfrac14\int_{-1}^1\left(15x^5 - 14x^3 + 3x\right)dx = 0$: every power is odd. (Even times odd is odd.)

          **(c)** $\sin^2\theta\cos\theta = x - x^3 = P_1 - \left(\tfrac35P_1 + \tfrac25P_3\right) = \tfrac25P_1 - \tfrac25P_3$. Pole check: $0 = \sin^20$. Check at $60^\circ$: $\tfrac25\left(\tfrac12 + \tfrac{7}{16}\right) = \tfrac38 = \tfrac34\cdot\tfrac12$.

          **(d) BCs** (region $r \le R$, no charge): 1. $V$ finite at $r = 0$, so no $B_\ell$. 2. $V(R,\theta) = V_0\left(\tfrac25P_1 - \tfrac25P_3\right)$, so $A_1R = \tfrac25V_0$ and $A_3R^3 = -\tfrac25V_0$.

          $$V_{\text{in}} = \frac{2V_0}{5}\left[\frac rR\cos\theta - \frac{r^3}{R^3}P_3(\cos\theta)\right]$$

          At $r = R/2$ on the $+z$ axis: $\tfrac25V_0\left(\tfrac12 - \tfrac18\right) = \tfrac{3}{20}V_0$. Center: $0$ (odd data). Field at the center: $-\frac{2V_0}{5R}\uv z$.

          **What to remember:** an exam can chain all four skills. Each step is short if you have drilled it; the danger is a slip early (a wrong prefactor) that ruins the rest, so check $P_\ell(1) = 1$ immediately.
        `,
      }),

      P({
        id: 'uL-E2', src: 'Exam-style', title: 'Which boundary made this potential?', big: true,
        q: md`Inside a charge-free sphere of radius $R$ the potential is $V(r,\theta) = Ar^2\left(3\cos^2\theta - 1\right)$. (a) What potential $V_0(\theta)$ is the surface held at? (b) Find $\vb E$ inside (in Cartesian components). (c) Find $V$ outside, assuming no other charge. (d) Find $\sigma$ at the north pole.`,
        figHtml: FIG.given,
        hints: [
          md`(a) Set $r = R$. (b) Use $r^2(3\cos^2\theta - 1) = 2z^2 - x^2 - y^2$.`,
          md`(c) It is pure $\ell = 2$: $V_0(\theta) = 2AR^2P_2(\cos\theta)$. Outside, $\ell = 2$ goes with $(R/r)^3$.`,
          md`(d) $\sigma = \frac{\varepsilon_0}{R}(2\ell+1)\times(\text{the }\ell\text{ coefficient of }V_0)\times P_\ell$.`,
        ],
        parts: [
          { lbl: md`(a) $V_0(\theta)$`, expr: 'A*R^2*(3*cos(theta)^2 - 1)', vars: { A: [0.5, 2], R: [1, 2], theta: [0, 3] } },
          { lbl: md`(b) $E_z$ at the point $(0, 0, z)$`, expr: '-4*A*z', vars: { A: [0.5, 2], z: [0.1, 1] } },
          { lbl: md`(b) $E_x$ at the point $(x, 0, 0)$`, expr: '2*A*x', vars: { A: [0.5, 2], x: [0.1, 1] } },
          { lbl: md`(c) $V_{\text{out}}(r,\theta)$`, expr: 'A*R^5*(3*cos(theta)^2 - 1)/r^3', vars: { A: [0.5, 2], R: [1, 2], r: [2, 4], theta: [0, 3] } },
          { lbl: md`(d) $\sigma(\theta = 0)$`, expr: '10*eps0*A*R', vars: { eps0: [0.5, 2], A: [0.5, 2], R: [1, 2] } },
        ],
        sol: md`
          **Check it is allowed.** $Ar^2(3\cos^2\theta - 1) = 2Ar^2P_2(\cos\theta)$, an $r^\ell P_\ell$ term with $\ell = 2$: harmonic, finite at the center. Good.

          **(a)** By uniqueness the inside solution is fixed by its surface values, so $V_0(\theta) = V(R,\theta) = AR^2\left(3\cos^2\theta - 1\right) = 2AR^2P_2(\cos\theta)$.

          **(b)** In Cartesian form $V = A(2z^2 - x^2 - y^2)$, so $\vb E = -\nabla V = A\left(2x,\;2y,\;-4z\right)$. In spherical components: $E_r = -2Ar(3\cos^2\theta - 1)$, $E_\theta = 6Ar\sin\theta\cos\theta$. The field is zero at the center and grows linearly: a quadrupole-type saddle.

          **(c) BCs outside:** 1. $V \to 0$ at infinity, so no $A_\ell$. 2. $V(R,\theta) = 2AR^2P_2$. Only $\ell = 2$: $\frac{B_2}{R^3} = 2AR^2$, so

          $$V_{\text{out}} = 2AR^2\frac{R^3}{r^3}P_2(\cos\theta) = \frac{AR^5\left(3\cos^2\theta - 1\right)}{r^3}$$

          **(d)** $\sigma = \frac{\varepsilon_0}{R}\cdot5\cdot2AR^2P_2 = 5\varepsilon_0AR\left(3\cos^2\theta - 1\right)$; at the north pole $10\varepsilon_0AR$.

          **Checks.** No net charge (no $\ell = 0$), center at $V = 0$, $\nabla\cdot\vb E = A(2 + 2 - 4) = 0$ inside.

          **What to remember:** "given $V$, find the boundary" is just $r = R$. Recognise the $\ell$ from the $r$ power and the angle, then the rest of the sphere table applies.
        `,
      }),

      P({
        id: 'uL-E3', src: 'Exam-style', title: 'The axis trick for two charges', big: true,
        q: md`A charge $+q$ sits at $z = a$ and $-q$ at $z = -a$. (a) Find $V$ on the $z$ axis for $z \gt a$. (b) Expand it in powers of $a/z$ and use the axis trick to write $V(r,\theta)$ for $r \gt a$; give the $\ell = 3$ term. (c) For $r \lt a$, give the $\ell = 1$ term. (d) On the axis at $r = 2a$, compare the first two terms with the exact value (units of $\frac{q}{4\pi\varepsilon_0a}$).`,
        figHtml: FIG.pair,
        hints: [
          md`(a) Distances on the axis: $z - a$ and $z + a$. Combine: $\frac{1}{z - a} - \frac{1}{z + a} = \frac{2a}{z^2 - a^2}$.`,
          md`(b) $\frac{2a}{z^2}\frac{1}{1 - a^2/z^2} = 2\sum_n\frac{a^{2n+1}}{z^{2n+2}}$: only odd powers $\frac{a^\ell}{z^{\ell+1}}$ with odd $\ell$. Replace $\frac{1}{z^{\ell+1}} \to \frac{P_\ell(\cos\theta)}{r^{\ell+1}}$.`,
          md`(c) For $0 \lt z \lt a$ the distances are $a - z$ and $a + z$: $\frac{2z}{a^2 - z^2} = 2\sum\frac{z^\ell}{a^{\ell+1}}$, odd $\ell$.`,
        ],
        parts: [
          { lbl: md`(a) $V(z)$ for $z \gt a$`, expr: 'q*2*a/(4*pi*eps0*(z^2 - a^2))', vars: { q: [1, 2], eps0: [0.5, 2], a: [1, 2], z: [3, 5] }, accepts: ['q/(4*pi*eps0)*(1/(z-a) - 1/(z+a))'] },
          { lbl: md`(b) the $\ell = 3$ term for $r \gt a$`, expr: 'q*a^3*(5*cos(theta)^3 - 3*cos(theta))/(4*pi*eps0*r^4)', vars: { q: [1, 2], eps0: [0.5, 2], a: [1, 2], r: [3, 5], theta: [0, 3] } },
          { lbl: md`(c) the $\ell = 1$ term for $r \lt a$`, expr: '2*q*r*cos(theta)/(4*pi*eps0*a^2)', vars: { q: [1, 2], eps0: [0.5, 2], a: [2, 3], r: [0.2, 1.5], theta: [0, 3] } },
          { lbl: md`(d) the two-term value at $r = 2a$, $\theta = 0$`, ans: 0.625 },
          { lbl: md`(d) the exact value there`, ans: 2 / 3 },
        ],
        sol: md`
          **(a)** On the axis above both charges: $V = \frac{q}{4\pi\varepsilon_0}\left(\frac{1}{z - a} - \frac{1}{z + a}\right) = \frac{q}{4\pi\varepsilon_0}\,\frac{2a}{z^2 - a^2}$.

          **(b)** For $z \gt a$: $\frac{2a}{z^2}\left(1 + \frac{a^2}{z^2} + \frac{a^4}{z^4} + \dots\right) = 2\left(\frac{a}{z^2} + \frac{a^3}{z^4} + \frac{a^5}{z^6} + \dots\right)$. Each $z^{-(\ell+1)}$ is the axis value of $r^{-(\ell+1)}P_\ell(\cos\theta)$ (the region $r \gt a$ is charge-free and contains the axis above $a$), so

          $$V = \frac{2q}{4\pi\varepsilon_0}\sum_{\ell\text{ odd}}\frac{a^\ell}{r^{\ell+1}}P_\ell(\cos\theta) \qquad (r \gt a)$$

          The $\ell = 3$ term: $\frac{2qa^3}{4\pi\varepsilon_0r^4}P_3(\cos\theta) = \frac{qa^3\left(5\cos^3\theta - 3\cos\theta\right)}{4\pi\varepsilon_0r^4}$. The $\ell = 1$ term is the dipole with $p = 2qa$.

          **(c)** For $0 \lt z \lt a$: $\frac{1}{a - z} - \frac{1}{a + z} = \frac{2z}{a^2 - z^2} = 2\left(\frac{z}{a^2} + \frac{z^3}{a^4} + \dots\right)$. Axis trick with $z^\ell \to r^\ell P_\ell$:

          $$V = \frac{2q}{4\pi\varepsilon_0}\sum_{\ell\text{ odd}}\frac{r^\ell}{a^{\ell+1}}P_\ell(\cos\theta) \qquad (r \lt a)$$

          The $\ell = 1$ term is $\frac{2qr\cos\theta}{4\pi\varepsilon_0a^2}$: a uniform field $-\frac{2q}{4\pi\varepsilon_0a^2}\uv z$ at the origin, pointing from $+q$ toward $-q$, as it should.

          **(d)** At $z = 2a$: two terms give $2\left(\tfrac14 + \tfrac{1}{16}\right) = \tfrac58 = 0.625$; exact $\frac{1}{a} - \frac{1}{3a} = \frac{2}{3a}$, i.e. $0.667$. The series is geometric with ratio $\tfrac14$, so two terms are about 6% low.

          **Why only odd $\ell$:** the pair is antisymmetric under $z \to -z$. Both answers also follow from the point-charge expansion with $r_<, r_> = r, a$.
        `,
      }),

      P({
        id: 'uL-E4', src: 'Exam-style', title: 'A point charge in Legendre form', big: true,
        q: md`A point charge $q$ sits on the $z$ axis at $z = d$. Using $\dfrac{1}{\lvert\vb r - \vb r'\rvert} = \sum_\ell\dfrac{r_<^\ell}{r_>^{\ell+1}}P_\ell(\cos\gamma)$ (you may also derive it with the axis trick), find (a) the $\ell = 2$ term of $V$ for $r \lt d$ and (b) for $r \gt d$. (c) At $r = d/2$, $\theta = 90^\circ$, evaluate the series through $\ell = 2$ and the exact $V$ (units of $\frac{q}{4\pi\varepsilon_0d}$).`,
        figHtml: FIG.charge,
        hints: [
          md`The charge is on the axis, so $\gamma = \theta$. For $r \lt d$, $r_< = r$ and $r_> = d$.`,
          md`At $\theta = 90^\circ$: $P_0 = 1$, $P_1 = 0$, $P_2 = -\tfrac12$.`,
          md`Exact: the distance from $(r = d/2, \theta = 90^\circ)$ to the charge is $\sqrt{d^2 + d^2/4}$.`,
        ],
        parts: [
          { lbl: md`(a) the $\ell = 2$ term for $r \lt d$`, expr: 'q*r^2*(3*cos(theta)^2 - 1)/(8*pi*eps0*d^3)', vars: { q: [1, 2], eps0: [0.5, 2], r: [0.2, 1], d: [2, 3], theta: [0, 3] } },
          { lbl: md`(b) the $\ell = 2$ term for $r \gt d$`, expr: 'q*d^2*(3*cos(theta)^2 - 1)/(8*pi*eps0*r^3)', vars: { q: [1, 2], eps0: [0.5, 2], r: [3, 5], d: [1, 2], theta: [0, 3] } },
          { lbl: md`(c) the series through $\ell = 2$`, ans: 0.875 },
          { lbl: md`(c) the exact value`, ans: 2 / Math.sqrt(5) },
          { lbl: md`Which terms vanish at $\theta = 90^\circ$?`, mc: [md`All odd $\ell$`, md`All even $\ell$`, md`None`], a: 0,
            why: [null, md`Even $P_\ell(0)$ are $1, -\tfrac12, \tfrac38, \dots$, not zero.`, md`Odd $P_\ell(0) = 0$.`] },
        ],
        sol: md`
          **Derivation by the axis trick.** On the axis below the charge ($0 \le z \lt d$): $\frac{1}{d - z} = \frac1d\cdot\frac{1}{1 - z/d} = \sum_\ell\frac{z^\ell}{d^{\ell+1}}$. The region $r \lt d$ is charge-free and contains this piece of axis, so $z^\ell \to r^\ell P_\ell(\cos\theta)$:

          $$V = \frac{q}{4\pi\varepsilon_0}\sum_\ell\frac{r^\ell}{d^{\ell+1}}P_\ell(\cos\theta) \quad (r \lt d), \qquad V = \frac{q}{4\pi\varepsilon_0}\sum_\ell\frac{d^\ell}{r^{\ell+1}}P_\ell(\cos\theta) \quad (r \gt d)$$

          (the second from $\frac{1}{z - d} = \sum\frac{d^\ell}{z^{\ell+1}}$ above the charge). This is the quoted formula with $\gamma = \theta$.

          **(a)** $\frac{q}{4\pi\varepsilon_0}\frac{r^2}{d^3}P_2(\cos\theta) = \frac{qr^2\left(3\cos^2\theta - 1\right)}{8\pi\varepsilon_0d^3}$.

          **(b)** $\frac{q}{4\pi\varepsilon_0}\frac{d^2}{r^3}P_2(\cos\theta) = \frac{qd^2\left(3\cos^2\theta - 1\right)}{8\pi\varepsilon_0r^3}$.

          **(c)** With $r/d = \tfrac12$: $1 + 0 + \tfrac14\left(-\tfrac12\right) = \tfrac78 = 0.875$. Adding $\ell = 4$: $+\tfrac{1}{16}\cdot\tfrac38$ gives $\tfrac{115}{128} = 0.898$. Exact: $\frac{1}{\sqrt{1 + 1/4}} = \frac{2}{\sqrt5} = 0.894$. The partial sums straddle it and close in.

          **What to remember:** $r_<$ on top, $r_>$ at the bottom, so every term is small. The inside form ($r^\ell$) and outside form ($r^{-(\ell+1)}$) are exactly the two halves of the general solution, which is why this expansion plugs straight into sphere problems with a charge on the axis.
        `,
      }),

      P({
        id: 'uL-E5', src: 'Exam-style', title: 'Two caps: symmetry first', big: true,
        q: md`The caps $\theta \lt 60^\circ$ and $\theta \gt 120^\circ$ of a thin shell of radius $R$ are held at $V_0$; the band between is grounded. (a) Which $\ell$ appear? (b) Find $a_0$ and $a_2$. (c) Find $V$ and $\vb E$ at the center. (d) Find the total charge.`,
        figHtml: FIG.twoCaps,
        hints: [
          md`The data are the same at $\theta$ and $\pi - \theta$.`,
          md`In $x$: $f = 1$ for $\lvert x\rvert \gt \tfrac12$. So $a_\ell = \frac{2\ell+1}{2}\left[\int_{1/2}^1 + \int_{-1}^{-1/2}\right]P_\ell\,dx$, and for even $\ell$ the two pieces are equal.`,
          md`$\int_{1/2}^1P_2\,dx = \tfrac12\left[x^3 - x\right]_{1/2}^1 = \tfrac{3}{16}$.`,
        ],
        parts: [
          { lbl: md`(a) Which $\ell$?`, mc: [md`Odd only`, md`Even only`, md`All`], a: 1,
            why: [md`The data are symmetric under $\theta \to \pi - \theta$; odd $P_\ell$ are antisymmetric and drop out.`, null, md`Symmetry removes all odd $\ell$.`] },
          { lbl: md`(b) $a_0$`, ans: 0.5 },
          { lbl: md`(b) $a_2$`, ans: 15 / 16 },
          { lbl: md`(c) $V(0)/V_0$`, ans: 0.5 },
          { lbl: md`(c) $E_z$ at the center (in units of $V_0/R$)`, ans: 0 },
          { lbl: md`(d) $Q$`, expr: '2*pi*eps0*R*V0', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
        ],
        sol: md`
          **(a)** $V_0(\pi - \theta) = V_0(\theta)$: even $\ell$ only. The data jump, so infinitely many.

          **(b)** $a_0 = \tfrac12\left[\tfrac12 + \tfrac12\right] = \tfrac12$: each cap covers $\frac{1 - \cos60^\circ}{2} = \tfrac14$ of the sphere. $\;a_2 = \tfrac52\cdot2\int_{1/2}^1P_2\,dx = 5\cdot\tfrac{3}{16} = \tfrac{15}{16}$. (Check with the cap formula: one cap has $a_2 = \tfrac54\sin^260^\circ\cos60^\circ = \tfrac{15}{32}$, and the mirror cap adds the same for even $\ell$.)

          **BCs.**
          1. $V$ finite at $r = 0$: no $B_\ell$ inside.
          2. $V \to 0$ as $r \to \infty$: no $A_\ell$ outside.
          3. $V(R^-,\theta)$ = the cap data: $A_\ell R^\ell = a_\ell V_0$.
          4. $V(R^+,\theta)$ = the cap data: $B_\ell/R^{\ell+1} = a_\ell V_0$.

          **(c)** BCs 1 and 3: $V(0) = a_0V_0 = \tfrac12V_0$, and $\vb E(0) = -\frac{a_1V_0}{R}\uv z = 0$ since $a_1 = 0$.

          **(d)** BCs 2 and 4: far away $V \approx a_0V_0R/r$, which is $\dfrac{Q}{4\pi\varepsilon_0r}$, so $Q = 4\pi\varepsilon_0RV_0a_0 = 2\pi\varepsilon_0RV_0$.

          **What to remember:** decide the parity from the picture before computing. Half the coefficients vanish, and the center field is zero for any north–south symmetric data.
        `,
      }),

      P({
        id: 'uL-E6', src: 'Exam-style', title: 'Averages are a₀', big: true,
        q: md`A shell of radius $R$ is held at $V_0\cos^6(\theta/2)$; there is no other charge. Find (a) the average of the surface potential, (b) $V$ at the center, (c) the average of $V$ over the dashed sphere $r = R/2$, (d) the average over the dashed sphere $r = 3R$, and (e) the total charge.`,
        figHtml: FIG.avg,
        hints: [
          md`$\cos^2(\theta/2) = \frac{1 + \cos\theta}{2}$, so the data are $V_0\left(\frac{1 + x}{2}\right)^3$.`,
          md`$a_0 = \tfrac12\int_{-1}^1\left(\frac{1+x}{2}\right)^3dx$. Substitute $u = 1 + x$.`,
          md`Averaging over any concentric sphere keeps only the $\ell = 0$ term: $a_0V_0$ inside, $a_0V_0R/r$ outside.`,
        ],
        parts: [
          { lbl: md`(a) average over $r = R$, in units of $V_0$`, ans: 0.25 },
          { lbl: md`(b) $V(0)/V_0$`, ans: 0.25 },
          { lbl: md`(c) average over $r = R/2$`, ans: 0.25 },
          { lbl: md`(d) average over $r = 3R$`, ans: 1 / 12 },
          { lbl: md`(e) $Q$`, expr: 'pi*eps0*R*V0', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
        ],
        sol: md`
          **(a)** $a_0 = \tfrac12\int_{-1}^1\frac{(1 + x)^3}{8}\,dx = \tfrac{1}{16}\left[\frac{(1 + x)^4}{4}\right]_{-1}^1 = \tfrac{1}{16}\cdot4 = \tfrac14$. The full expansion is $\tfrac14P_0 + \tfrac{9}{20}P_1 + \tfrac14P_2 + \tfrac{1}{20}P_3$, but nothing below needs the rest.

          **BCs.**
          1. $V$ finite at $r = 0$: no $B_\ell$ inside.
          2. $V \to 0$ as $r \to \infty$: no $A_\ell$ outside.
          3. $V(R^-,\theta) = V_0\cos^6(\theta/2)$: $A_\ell R^\ell = a_\ell V_0$.
          4. $V(R^+,\theta) = V_0\cos^6(\theta/2)$: $B_\ell/R^{\ell+1} = a_\ell V_0$.

          **(b)** BCs 1 and 3 give $V_{\text{in}} = V_0\sum a_\ell(r/R)^\ell P_\ell$, so $V(0) = a_0V_0 = \tfrac14V_0$.

          **(c)** Over the sphere of radius $r$: $\tfrac12\int_0^\pi V_{\text{in}}\sin\theta\,d\theta = V_0\sum a_\ell(r/R)^\ell\cdot\tfrac12\int_{-1}^1P_\ell\,dx = a_0V_0$, because $\int P_\ell\,dx = 0$ for $\ell \ge 1$. So $\tfrac14V_0$ for every $r \lt R$.

          **(d)** Outside, BCs 2 and 4 give $V_{\text{out}} = V_0\sum a_\ell(R/r)^{\ell+1}P_\ell$, and the average is $a_0V_0R/r = \tfrac14\cdot\tfrac13V_0 = \tfrac{1}{12}V_0$.

          **(e)** $Q = 4\pi\varepsilon_0RV_0a_0 = \pi\varepsilon_0RV_0$. Consistent with (d): the average of $V$ over a sphere outside is $\frac{Q}{4\pi\varepsilon_0r}$ (Gauss's law in averaged form).

          **What to remember:** "average", "center", "total charge" are all $a_0$. One integral answers three questions.
        `,
      }),

      P({
        id: 'uL-E7', src: 'Exam-style', title: 'From the axis back to the sphere', big: true,
        q: md`A thin shell of radius $R$ is held at an unknown $V_0(\theta)$, with no other charge. On the $+z$ axis outside, $V(z) = V_0\left(\dfrac Rz + \dfrac{R^3}{z^3}\right)$ for $z \ge R$. (a) Find $V(r,\theta)$ everywhere outside. (b) Find $V_0(\theta)$. (c) Find $V$ at the center. (d) Find $V$ at $z = -2R$ on the negative axis.`,
        figHtml: FIG.axisOut,
        hints: [
          md`Outside, $V = \sum B_\ell r^{-(\ell+1)}P_\ell$, which on the $+z$ axis is $\sum B_\ell z^{-(\ell+1)}$. Match powers: $z^{-1}$ is $\ell = 0$, $z^{-3}$ is $\ell = 2$.`,
          md`Then set $r = R$. For (c) and (d) use $V_0(\theta) = V_0\sum a_\ell P_\ell$ and the sphere table.`,
        ],
        parts: [
          { lbl: md`(a) $V_{\text{out}}(r,\theta)$`, expr: 'V0*(R/r + R^3*(3*cos(theta)^2 - 1)/(2*r^3))', vars: { V0: [1, 3], R: [1, 2], r: [2, 4], theta: [0, 3] } },
          { lbl: md`(b) $V_0(\theta)$`, expr: 'V0*(1 + 3*cos(theta)^2)/2', vars: { V0: [1, 3], theta: [0, 3] }, accepts: ['V0*(1 + (3*cos(theta)^2-1)/2)'] },
          { lbl: md`(c) $V(0)/V_0$`, ans: 1 },
          { lbl: md`(d) $V(z = -2R)/V_0$`, ans: 0.625 },
        ],
        sol: md`
          **BCs.**
          1. $V \to 0$ as $r \to \infty$: no $A_\ell$ outside.
          2. $V(R^+,\theta) = V_0(\theta)$, unknown here; the axis data take its place.
          3. $V$ finite at $r = 0$: no $B_\ell$ inside.
          4. $V(R^-,\theta) = V_0(\theta)$: the inside matches the same data.

          **(a)** Axis trick, outside version. $\frac{V_0R}{z} \to \frac{V_0R}{r}P_0$ and $\frac{V_0R^3}{z^3} \to \frac{V_0R^3}{r^3}P_2(\cos\theta)$:

          $$V_{\text{out}} = V_0\left[\frac Rr + \frac{R^3}{r^3}P_2(\cos\theta)\right]$$

          It satisfies BC 1 ($V \to 0$ at infinity) and Laplace's equation, and matches the given axis values; by uniqueness it is the answer.

          **(b)** At $r = R$: $V_0(\theta) = V_0\left[1 + P_2(\cos\theta)\right] = \tfrac12V_0\left(1 + 3\cos^2\theta\right)$. So $a_0 = 1$, $a_2 = 1$.

          **(c)** BCs 3 and 4 give $V_{\text{in}} = V_0\left[1 + \frac{r^2}{R^2}P_2(\cos\theta)\right]$; at the center, $V_0$.

          **(d)** On the negative axis $P_\ell(-1) = (-1)^\ell$; both terms are even: $V_0\left[\tfrac12 + \tfrac18\right] = \tfrac58V_0$. Same as at $z = +2R$, as north–south symmetry requires.

          **What to remember:** axis data in powers of $1/z$ give the outside coefficients directly ($z^{-(\ell+1)} \leftrightarrow \ell$). Setting $r = R$ then gives the boundary data, and everything else follows.
        `,
      }),

      P({
        id: 'uL-E8', src: 'Exam-style', title: 'Half a cos²θ', big: true,
        q: md`The northern hemisphere of a thin shell (radius $R$) is held at $V_0\cos^2\theta$ and the southern hemisphere is grounded. (a) Find $a_0$, $a_1$, $a_2$, $a_3$. (b) Explain why $a_4 = 0$. (c) Find $V$ at the center, $E_z$ at the center, and the total charge.`,
        figHtml: FIG.northSq,
        hints: [
          md`In $x$: $f = x^2$ for $x \gt 0$, $0$ for $x \lt 0$. Split: $f = \tfrac12x^2 + \tfrac12x\lvert x\rvert$.`,
          md`The even part $\tfrac12x^2 = \tfrac16P_0 + \tfrac13P_2$ is a polynomial. The odd part is not a polynomial, so integrate. Since the data vanish for $x \lt 0$, $a_\ell = \frac{2\ell+1}{2}\int_0^1x^2P_\ell\,dx$ for every $\ell$.`,
          md`Center: $a_0V_0$. Field: $-a_1V_0/R$. Charge: $4\pi\varepsilon_0RV_0a_0$.`,
        ],
        parts: [
          { lbl: md`$a_0$`, ans: 1 / 6 },
          { lbl: md`$a_1$`, ans: 3 / 8 },
          { lbl: md`$a_2$`, ans: 1 / 3 },
          { lbl: md`$a_3$`, ans: 7 / 48 },
          { lbl: md`(b) Why is $a_4 = 0$?`, mc: [md`The even part of the data is $\tfrac12x^2$, a degree-2 polynomial, so even $\ell \gt 2$ vanish`, md`Because the data vanish in the south`, md`It isn't; it is small`], a: 0,
            why: [null, md`Vanishing in the south makes the data neither even nor odd; that doesn't kill any particular $\ell$.`, md`It is exactly zero: $\tfrac92\int_0^1x^2P_4\,dx = 0$.`] },
          { lbl: md`(c) $V(0)/V_0$`, ans: 1 / 6 },
          { lbl: md`(c) $E_z(0)$`, expr: '-3*V0/(8*R)', vars: { V0: [1, 3], R: [1, 2] } },
          { lbl: md`(c) $Q$`, expr: '2*pi*eps0*R*V0/3', vars: { eps0: [0.5, 2], R: [1, 2], V0: [1, 3] } },
        ],
        sol: md`
          **(a)** $a_\ell = \frac{2\ell+1}{2}\int_0^1x^2P_\ell\,dx$:

          - $a_0 = \tfrac12\cdot\tfrac13 = \tfrac16$
          - $a_1 = \tfrac32\int_0^1x^3\,dx = \tfrac32\cdot\tfrac14 = \tfrac38$
          - $a_2 = \tfrac52\cdot\tfrac12\int_0^1\left(3x^4 - x^2\right)dx = \tfrac54\left(\tfrac35 - \tfrac13\right) = \tfrac13$
          - $a_3 = \tfrac72\cdot\tfrac12\int_0^1\left(5x^5 - 3x^3\right)dx = \tfrac74\left(\tfrac56 - \tfrac34\right) = \tfrac{7}{48}$

          **(b)** Split $f = \tfrac12x^2 + \tfrac12x\lvert x\rvert$. The even part is the polynomial $\tfrac12x^2 = \tfrac16P_0 + \tfrac13P_2$: that gives exactly $a_0$ and $a_2$, and every even $\ell \ge 4$ is zero. The odd part $\tfrac12x\lvert x\rvert$ is not a polynomial and gives all the odd terms ($a_5 = -\tfrac{11}{384}$, ...).

          **(c) BCs.**
          1. $V$ finite at $r = 0$: no $B_\ell$ inside.
          2. $V \to 0$ as $r \to \infty$: no $A_\ell$ outside.
          3. $V(R^-,\theta)$ = the hemisphere data: $A_\ell R^\ell = a_\ell V_0$.
          4. $V(R^+,\theta)$ = the hemisphere data: $B_\ell/R^{\ell+1} = a_\ell V_0$.

          Then $V(0) = \tfrac16V_0$, $\;E_z(0) = -\tfrac38\frac{V_0}{R}$ (pointing south, away from the hot north), $\;Q = 4\pi\varepsilon_0RV_0\cdot\tfrac16 = \tfrac23\pi\varepsilon_0RV_0$.

          **What to remember:** a hemisphere problem with a polynomial on one side is half polynomial (even part) and half series (odd part). The split tells you which coefficients stop.
        `,
      }),

      P({
        title: 'Lightning round',
        q: md`Answer each in under 20 seconds, with no polynomial multiplication. (a) $P_5(1)$ (b) $P_4(-1)$ (c) $P_3(0)$ (d) $P_2(\cos45^\circ)$ (e) $\int_{-1}^1P_4^2\,dx$ (f) $\int_{-1}^1x^2P_4\,dx$ (g) $\int_0^\pi\cos^2\theta\sin\theta\,d\theta$ (h) the coefficient of $x^3$ in $P_3$. (Plot: $P_1$ to $P_4$.)`,
        figHtml: FIG.p1to4,
        hints: [
          md`Poles: $P_\ell(\pm1) = (\pm1)^\ell$. Equator: odd ones vanish. Norm: $\frac{2}{2\ell+1}$. Degree below $\ell$: zero.`,
          md`$\cos45^\circ = \frac{1}{\sqrt2}$, so $x^2 = \tfrac12$.`,
        ],
        parts: [
          { lbl: md`(a)`, ans: 1 },
          { lbl: md`(b)`, ans: 1 },
          { lbl: md`(c)`, ans: 0 },
          { lbl: md`(d)`, ans: 0.25 },
          { lbl: md`(e)`, ans: 2 / 9 },
          { lbl: md`(f)`, ans: 0 },
          { lbl: md`(g)`, ans: 2 / 3 },
          { lbl: md`(h)`, ans: 2.5 },
        ],
        sol: md`
          - **(a)** $P_\ell(1) = 1$.
          - **(b)** $(-1)^4 = 1$.
          - **(c)** odd $\ell$: $0$.
          - **(d)** $\tfrac12\left(3\cdot\tfrac12 - 1\right) = \tfrac14$.
          - **(e)** $\frac{2}{9}$.
          - **(f)** degree $2 \lt 4$: $0$.
          - **(g)** $\int_{-1}^1x^2\,dx = \tfrac23$ (that is $\int P_1^2$).
          - **(h)** $\frac{(2\ell)!}{2^\ell(\ell!)^2} = \frac{720}{8\cdot36} = \tfrac52$.

          **What to remember:** most direct Legendre questions are one of these facts in disguise. Know them cold, and spend your exam time on the setup.
        `,
      }),

      RF(md`
        !!key Patterns to remember
          - Read the symmetry first: symmetric data, even $\ell$; antisymmetric, odd $\ell$; polynomial of degree $n$, $\ell \le n$.
          - Given $V$ inside: the boundary data are $V(R,\theta)$; the $r$ power and angle tell you $\ell$.
          - Given $V$ on the axis: expand in $z^\ell$ or $z^{-(\ell+1)}$ and attach $P_\ell(\cos\theta)$. Never replace $z$ by $r\cos\theta$.
          - Point charge on the axis: $\frac{q}{4\pi\varepsilon_0}\sum\frac{r_<^\ell}{r_>^{\ell+1}}P_\ell(\cos\theta)$ (derive it from $\frac{1}{d - z}$ if asked).
          - Average over any concentric sphere, center value, total charge: all $a_0$. Center field and dipole: $a_1$.
          - Check $P_\ell(1) = 1$ after Rodrigues, the pole and equator values after an expansion, and every BC at the end.
      `),
    ],
  };

  // =====================================================================================
  C.unit({
    id: 'uL', num: 'Unit L', title: 'Legendre polynomials: direct problems',
    blurb: 'Drill for direct Legendre questions: Rodrigues and the recurrence, Legendre\'s equation and why ℓ is an integer, orthogonality integrals and coefficients, expanding V₀(θ), direct sphere problems, and an exam-style mixed set.',
    lessons: [L1,L2,L3,L4,L5,L6,],
  });
})();

/* Unit 3 — Work, energy and conductors.
   Lecture 6 (from "moving a charge" on), Lecture 7, Lecture 8 (parallel plates, energy of a capacitor);
   Griffiths 2.4–2.5. HW 3: Griffiths 2.39, Hybrid 2.40. HW 4: Griffiths 2.43, 2.44. */
(function () {
  'use strict';
  const { RF, P, Q } = C;
  const DEG = Math.PI / 180, S2 = Math.SQRT2;
  const r1 = (v) => Math.round(v * 10) / 10;

  // ===================================================================================== drawing helpers
  // small + or - drawn as a path (not a label), so the declutter pass leaves it where it is
  function glyph(f, x, y, s, r = 3.3, mask = false) {
    if (mask) f.add(`<path class="shade nodecl" d="M${r1(x - r - 2)},${r1(y)}a${r + 2},${r + 2} 0 1,0 ${2 * r + 4},0a${r + 2},${r + 2} 0 1,0 ${-2 * r - 4},0Z"/>`);
    f.add(`<path class="glyph" d="M${r1(x - r)},${r1(y)}H${r1(x + r)}${s > 0 ? `M${r1(x)},${r1(y - r)}V${r1(y + r)}` : ''}"/>`);
    f.track(x - r, y - r, x + r, y + r);
    return f;
  }
  // closed smooth outline: ellipse rx, ry with harmonic wobbles h = [[k, amp, phaseDeg], ...], rotated rot degrees (CCW on screen)
  function shape(cx, cy, rx, ry, o = {}) {
    const n = o.n || 160, rot = (o.rot || 0) * DEG, H = o.h || [], c = Math.cos(rot), s = Math.sin(rot), pts = [];
    for (let i = 0; i < n; i++) {
      const t = 2 * Math.PI * i / n;
      let m = 1;
      for (const [k, A, ph] of H) m += A * Math.cos(k * t + (ph || 0) * DEG);
      const x = rx * m * Math.cos(t), y = -ry * m * Math.sin(t);
      pts.push([cx + x * c + y * s, cy - x * s + y * c]);
    }
    return pts;
  }
  const circ = (cx, cy, r, n = 120) => shape(cx, cy, r, r, { n });
  // outward unit normal at point i of a closed outline drawn counter-clockwise on screen
  function nrm(pts, i) {
    const n = pts.length, a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
    const tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
    return [-ty / L, tx / L];
  }
  // index of the outline point closest to the screen direction ang (degrees, CCW from +x) seen from (cx, cy)
  function at(pts, cx, cy, ang) {
    let best = 0, bd = Infinity;
    pts.forEach((p, i) => { const a = Math.atan2(-(p[1] - cy), p[0] - cx); let d = Math.abs(a - ang * DEG) % (2 * Math.PI); d = Math.min(d, 2 * Math.PI - d); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  // hatched metal: outer outline plus holes (even-odd fill), outlines drawn.
  // The region is also registered (as one keyhole polygon) so the label audit can see it.
  function metal(f, rings, o = {}) {
    const d = rings.map((pts) => 'M' + pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L') + 'Z').join('');
    rings.forEach((pts) => pts.forEach((p) => f.track(p[0], p[1])));
    f.add(`<path class="hatch nodecl" fill-rule="evenodd" d="${d}"/>`);
    let key = rings[0].slice();
    for (const h of rings.slice(1)) key = key.concat([rings[0][0]], h, [h[0]]);
    (f.hatches = f.hatches || []).push(key);
    if (o.outline !== false) rings.forEach((pts) => f.poly(pts, { cls: o.cls || '' }));
    return f;
  }
  // hatched annulus (thick shell) between radii ra < rb
  const ringMetal = (f, cx, cy, ra, rb, o = {}) => metal(f, [circ(cx, cy, rb), circ(cx, cy, ra)], o);
  // signs on an outline at the given screen angles; inset > 0 puts them just inside the outline
  function signsAt(f, pts, cx, cy, angs, s, inset = 8, mask = true) {
    for (const a of angs) { const i = at(pts, cx, cy, a), [nx, ny] = nrm(pts, i); glyph(f, pts[i][0] - nx * inset, pts[i][1] - ny * inset, s, 3.3, mask); }
    return f;
  }
  // label sitting on a small masked box (for text placed on hatching)
  function boxLab(f, x, y, t, w, h = 20) {
    f.add(`<path class="shade nodecl" d="M${r1(x - w / 2)},${r1(y - h / 2)}h${w}v${h}h${-w}Z"/>`);
    f.label(x, y, t, 'c');
    return f;
  }
  // a closed curve as a field-free arrowhead marker placed at fraction t of a polyline
  function headOn(f, pts, t, o = {}) {
    const k = Math.max(1, Math.min(pts.length - 1, Math.round(t * (pts.length - 1))));
    const a = pts[k - 1], b = pts[k];
    f.head(b[0], b[1], b[0] - a[0], b[1] - a[1], o);
    return f;
  }
  // straight dashed "pair" line between two charges, shortened so it does not run into the circles
  function pairLine(f, A, B, cls = 'dim thin', gap = 11) {
    const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    f.line(A[0] + ux * gap, A[1] + uy * gap, B[0] - ux * gap, B[1] - uy * gap, { cls });
    return f;
  }
  const uniformRows = (f, ys, xs, len = 58, cls = 'dim') => { for (const y of ys) for (const x of xs) f.arrow(x, y, x + len, y, { cls }); return f; };

  // ===================================================================================== Lesson 1
  const L1 = () => {
    const fPath = () => {
      const f = PF.fig();
      uniformRows(f, [14, 70, 126], [0, 95, 190]);
      f.label(254, 14, md`\vb E`, 'l');
      const pts = [];
      for (let i = 0; i <= 80; i++) { const t = i / 80; pts.push([92 + 48 * t + 16 * Math.sin(2.4 * Math.PI * t), 146 - 112 * t]); }
      f.pl(pts, { cls: 'thick' });
      headOn(f, pts, 0.5);
      f.charge(92, 146, { q: '+', lab: 'q', at: 'l' });
      f.tag(92, 146, 'a', 'br', 9);
      const B = pts[pts.length - 1];
      f.dot(B[0], B[1], 3.2); f.tag(B[0], B[1], 'b', 'r', 7);
      return f.svg();
    };
    const fUniAB = () => {
      const f = PF.fig();
      uniformRows(f, [8, 92], [0, 92, 184]);
      f.label(248, 8, md`\vb E = E_0\uv x`, 'l');
      f.charge(50, 50, { q: '+', lab: '+q', at: 't' });
      f.tag(50, 50, 'a', 'l', 10);
      f.dot(200, 50, 3.2); f.tag(200, 50, 'b', 't', 7);
      f.dim(50, 62, 200, 62, 'd', { at: 'b' });
      return f.svg();
    };
    const fTwoPaths = () => {
      const f = PF.fig();
      f.charge(50, 120, { q: '+', lab: '+Q', at: 'b' });
      const A = [140, 80], B = [230, 160];
      f.line(A[0], A[1], B[0], B[1], { mid: true });
      f.label(176, 134, '1', 'c', 'small');
      const pts = [];
      for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push([A[0] + (B[0] - A[0]) * t + 95 * Math.sin(Math.PI * t), A[1] + (B[1] - A[1]) * t - 70 * Math.sin(Math.PI * t)]); }
      f.pl(pts, { cls: 'dash' });
      headOn(f, pts, 0.5);
      f.label(262, 70, '2', 'c', 'small');
      f.dot(A[0], A[1], 3.2); f.tag(A[0], A[1], 'a', 'l', 7);
      f.dot(B[0], B[1], 3.2); f.tag(B[0], B[1], 'b', 'b', 7);
      return f.svg();
    };
    const fLoop = () => {
      const f = PF.fig();
      f.charge(50, 90, { q: '+', lab: '+Q', at: 'b' });
      const pts = shape(170, 80, 70, 45, { h: [[2, 0.12, 30], [3, 0.08, 0]] });
      f.poly(pts, { cls: 'dash' });
      headOn(f, pts.concat([pts[0]]), 0.26);
      headOn(f, pts.concat([pts[0]]), 0.76);
      f.charge(pts[40][0], pts[40][1], { q: '+', lab: 'q', at: 't' });
      return f.svg();
    };
    const fEquip = () => {
      const f = PF.fig();
      const cx = 120, cy = 100;
      f.circle(cx, cy, 42, { cls: 'dash dim' });
      f.circle(cx, cy, 80, { cls: 'dash dim' });
      f.charge(cx, cy, { q: '+', lab: '+Q', at: 'b' });
      const P = (r, a) => [cx + r * Math.cos(a * DEG), cy - r * Math.sin(a * DEG)];
      const A = P(80, 150), Cc = P(80, 30), B = P(42, 90);
      f.dot(A[0], A[1], 3.2); f.tag(A[0], A[1], 'a', 'l', 7);
      f.dot(Cc[0], Cc[1], 3.2); f.tag(Cc[0], Cc[1], 'c', 'r', 7);
      f.dot(B[0], B[1], 3.2); f.tag(B[0], B[1], 'b', 'tr', 6);
      f.line(cx, cy, Cc[0], Cc[1], { cls: 'dim thin' });
      f.label(cx + 61 * Math.cos(30 * DEG) - 5, cy - 61 * Math.sin(30 * DEG) - 9, 'r', 'c', 'small');
      return f.svg();
    };
    const fTwoQ = (sol) => {
      const f = PF.fig();
      f.charge(40, 130, { q: '+', lab: '+Q', at: 'l' });
      f.charge(240, 130, { q: '+', lab: '+Q', at: 'r' });
      f.dot(140, 130, 3.2); f.tag(140, 130, 'O', 'tl', 7);
      f.dot(140, 30, 3.2); f.tag(140, 30, 'P', 't', 7);
      f.line(140, 136, 140, 154, { cls: 'dim thin' }); f.line(240, 140, 240, 154, { cls: 'dim thin' });
      f.dim(140, 154, 240, 154, 'd', { at: 'b' });
      f.line(140, 40, 140, 122, { cls: 'dim dash thin' });
      f.label(146, 80, 'd', 'l', 'small');
      if (sol) { pairLine(f, [40, 130], [140, 30], 'dim thin', 10); pairLine(f, [240, 130], [140, 30], 'dim thin', 10); }
      return f.svg();
    };
    const fDip = () => {
      const f = PF.fig();
      f.charge(40, 60, { q: '+', lab: '+Q', at: 't' });
      f.charge(220, 60, { q: '-', lab: '-Q', at: 't' });
      f.dot(130, 60, 3.2); f.tag(130, 60, 'M', 't', 7);
      f.line(40, 70, 40, 84, { cls: 'dim thin' }); f.line(130, 66, 130, 84, { cls: 'dim thin' }); f.line(220, 70, 220, 84, { cls: 'dim thin' });
      f.dim(40, 84, 130, 84, 'd', { at: 'b' });
      f.dim(130, 84, 220, 84, 'd', { at: 'b' });
      return f.svg();
    };
    const fP1 = () => {
      const f = PF.fig();
      const cx = 120, cy = 110;
      f.circle(cx, cy, 34, { cls: 'dash dim thin' });
      f.circle(cx, cy, 96, { cls: 'dash dim thin' });
      f.charge(cx, cy, { q: '+', lab: 'Q', at: 'b' });
      const A = [cx + 96 * Math.cos(200 * DEG), cy - 96 * Math.sin(200 * DEG)], B = [cx + 34 * Math.cos(50 * DEG), cy - 34 * Math.sin(50 * DEG)];
      f.line(cx, cy, A[0], A[1], { cls: 'dim thin' }); f.label((cx + A[0]) / 2, (cy + A[1]) / 2 - 10, '3d', 'c', 'small');
      f.line(cx, cy, B[0], B[1], { cls: 'dim thin' }); f.label((cx + B[0]) / 2 + 10, (cy + B[1]) / 2 + 2, 'd', 'c', 'small');
      const pts = [];
      for (let i = 0; i <= 90; i++) { const t = i / 90, ang = (200 + 210 * t) * DEG, r = 96 - 62 * t + 9 * Math.sin(3 * Math.PI * t); pts.push([cx + r * Math.cos(ang), cy - r * Math.sin(ang)]); }
      f.pl(pts, { cls: 'thick' }); headOn(f, pts, 0.45);
      f.charge(A[0], A[1], { q: '+', lab: 'q', at: 'l' }); f.tag(A[0], A[1], 'a', 'tl', 10);
      f.dot(B[0], B[1], 3.2); f.tag(B[0], B[1], 'b', 'tr', 7);
      return f.svg();
    };
    const fRel = () => {
      const f = PF.fig();
      f.charge(40, 50, { q: '+', lab: 'Q', at: 't' });
      f.text(26, 50, 'held fixed', 'r');
      f.charge(150, 50, { q: '+', lab: 'q,\\ m', at: 't' });
      f.arrow(162, 50, 230, 50, { cls: 'dash' }); f.label(236, 50, 'v', 'l');
      f.line(40, 60, 40, 80, { cls: 'dim thin' }); f.line(150, 60, 150, 80, { cls: 'dim thin' });
      f.dim(40, 80, 150, 80, 'a', { at: 'b' });
      return f.svg();
    };

    return {
      id: 'u3-work', title: 'Work to move a charge',
      steps: [
        RF(md`
          ### From force to energy

          Lecture 6 finishes the chain force → field → potential with **energy**. Put a test charge $q$ in a static field $\vb E(\vb r)$ made by other charges that are held fixed. The field pushes on $q$ with $\vb F = q\vb E$. To move $q$ without letting it speed up, you push back with

          $$\vb F_{\text{ext}} = -q\vb E .$$

          (The notes call $-q\vb E$ "the work we must exert"; it is the **force** you exert. The work comes next.)

          [[fig:path]]

          The work you do carrying $q$ from $a$ to $b$ along the path is

          $$W = \int_a^b \vb F_{\text{ext}}\cdot d\vb l = -q\int_a^b \vb E\cdot d\vb l = q\,\big[V(b)-V(a)\big].$$

          The last step is the definition of the potential difference, $V(b)-V(a) = -\int_a^b \vb E\cdot d\vb l$.

          !!key The work you do is $W = q\,\Delta V$
            It depends only on the charge and on the potential at the two ends. The field does the opposite amount of work, $W_{\text{field}} = -q\,\Delta V$. "Slowly" means no kinetic energy is gained, so the two cancel.
        `, { path: { svg: fPath(), cap: 'Lecture 6: carry $q$ from $a$ to $b$ through a field (here a uniform one). The path is arbitrary.' } }),

        Q(md`A uniform field $\vb E = E_0\uv x$ with $E_0>0$. You carry a charge $+q$ slowly from $a$ to $b$, a distance $d$ along the field. How much work do **you** do?`,
          [md`$+qE_0d$`, md`$-qE_0d$`, md`$0$, because $q$ starts and ends at rest`, md`It depends on the path you take from $a$ to $b$`], 1,
          [md`$+qE_0d$ is the work the **field** does: $\vb E$ is parallel to the displacement. You push the other way ($\vb F_{\text{ext}}=-q\vb E$), so your work has the opposite sign.`, null,
            md`"Starts and ends at rest" means the **total** work (yours plus the field's) is zero. Your share alone is $q\,\Delta V\neq 0$.`,
            md`Electrostatic work never depends on the path: the field is conservative ($\curl\vb E = 0$).`],
          md`The potential drops along the field: $V(b)-V(a) = -\int_a^b \vb E\cdot d\vb l = -E_0d$. So $W = q\,\Delta V = -qE_0d$. Negative work means the field does the pushing and you only hold the charge back, like lowering a brick slowly. Let go, and the charge would gain kinetic energy $qE_0d$ instead.`,
          { figHtml: fUniAB() }),

        Q(md`A charge $q$ is carried from $a$ to $b$ near a fixed charge $+Q$: once along the straight path 1, once along the long detour 2. Compare the work you do.`,
          [md`The same for both paths`, md`Larger along path 2, because you push for longer`, md`Smaller along path 2, because it stays far from $Q$ most of the way`, md`Equal only if the field were uniform; here path 2 costs more`], 0,
          [null, md`Along the detour some stretches go "uphill" in $V$ and some go "downhill". The downhill stretches give the work back. The net is fixed by the end points.`,
            md`Spending time far from $Q$ doesn't matter. Only $V(a)$ and $V(b)$ enter.`,
            md`Path independence holds for **every** electrostatic field, uniform or not, because $\oint\vb E\cdot d\vb l = 0$ around any loop.`],
          md`$W = q[V(b)-V(a)]$ makes no reference to the path. Out along path 2 and back along path 1 is a closed loop, and $\oint\vb E\cdot d\vb l = 0$, so the two works are equal. That is what "conservative" means.`,
          { figHtml: fTwoPaths() }),

        Q(md`You carry $q$ once around the closed dashed loop near the fixed charge $+Q$ and back to where it started. Your total work is`,
          [md`positive, since you push against the field the whole way`, md`positive one way around the loop and negative the other way`, md`zero`, md`$q$ times the electric flux through the loop`], 2,
          [md`You don't push against the field the whole way. On part of the loop the field points along the motion and does the work. Those parts cancel the uphill parts exactly.`,
            md`Reversing the direction flips the sign of the work. The only number equal to its own negative is 0, so both directions give 0.`, null,
            md`Flux is a surface integral of $\vb E\cdot d\vb a$. The work is a line integral, $-q\oint\vb E\cdot d\vb l$, and that vanishes for any electrostatic field.`],
          md`$W = -q\oint\vb E\cdot d\vb l = 0$, because $\curl\vb E = 0$ (Stokes' theorem). Equivalently, $W = q[V(\text{end})-V(\text{start})]$ with the same start and end. A static field cannot pump energy into a charge that you walk around in loops.`,
          { figHtml: fLoop() }),

        RF(md`
          ### What $W = q\,\Delta V$ tells you

          The lecture draws two conclusions.

          1. **Electrostatic forces are conservative.** The energy change of the system depends only on the end points, not on the path. Around any closed loop the work is zero.
          2. **The potential is energy per unit charge:** $V(b)-V(a) = W/q$. With the reference point at infinity, $W(\vb r) = q\,[V(\vb r)-V(\infty)]$, and since we usually take $V(\infty)=0$,

          $$W(\vb r) = q\,V(\vb r)$$

          is the work to bring $q$ in from far away and park it at $\vb r$. Just as $\vb E$ is force per unit charge, $V$ is potential energy per unit charge.

          [[fig:eq]]

          Moving along an equipotential (dashed circles) costs nothing: the force you apply is perpendicular to every step. Moving inward toward $+Q$ costs $q\,[V(b)-V(a)]$, positive if $q>0$.

          !!trap Whose work?
            Three different things get called "work": the work **you** do ($q\,\Delta V$), the work the **field** does ($-q\,\Delta V$), and the change in kinetic energy (zero if you move slowly). Say which one you mean. Carrying $+q$ to higher $V$ costs you positive work. Carrying $-q$ to higher $V$ costs you **negative** work: the field pulls it there for you.
        `, { eq: { svg: fEquip(), cap: 'Equipotentials (dashed) around a fixed charge $+Q$. Points $a$ and $c$ are on the same circle of radius $r$.' } }),

        Q(md`An electron (charge $-e$) is carried slowly from a point at $V=0$ to a point at $V=+10$ V. How much work do you do?`,
          [md`$+10$ eV`, md`$0$, since the electron starts and ends at rest`, md`$-10$ J`, md`$-10$ eV`], 3,
          [md`That would be right for a charge $+e$. Here $q=-e$, so $W = q\,\Delta V = (-e)(+10\text{ V}) = -10$ eV.`,
            md`Starting and ending at rest makes the **total** work zero. Your work alone is $q\,\Delta V$.`,
            md`Charge times volts gives joules only if the charge is in coulombs: $(-1.6\times10^{-19}\text{ C})(10\text{ V}) = -1.6\times10^{-18}$ J, which is $-10$ eV, not $-10$ J.`, null],
          md`$W = q\,\Delta V = (-e)(+10\text{ V}) = -10$ eV $=-1.6\times10^{-18}$ J. An electron is pulled toward higher potential, so the field does the work and you only hold it back. One electron volt is the energy $e\times(1\text{ V})$.`,
          { nofig: 'Only two potential values matter; there is no geometry.' }),

        Q(md`In the figure above, you carry a charge $q$ from $a$ to $c$ along the dashed circle around $+Q$. The work you do is`,
          [md`$\dfrac{qQ}{4\pi\varepsilon_0 r}$`, md`positive, since the field is not zero along the circle`, md`zero`, md`negative, since $q$ moves around $Q$ rather than toward it`], 2,
          [md`That is the work to bring $q$ from infinity onto the circle. Moving **around** the circle afterwards costs nothing more.`,
            md`The field is not zero, but it is radial, and every step along the circle is perpendicular to it: $\vb F_{\text{ext}}\cdot d\vb l = 0$ at each step.`, null,
            md`There is no "sideways" work. With $V(a) = V(c)$, $W = q[V(c)-V(a)] = 0$ exactly.`],
          md`$a$ and $c$ are at the same distance from $Q$, so $V(a) = V(c) = \dfrac{Q}{4\pi\varepsilon_0 r}$ and $W = q[V(c)-V(a)] = 0$. Along the circle, $\vb E$ is radial and $d\vb l$ is tangential, so the integrand $\vb E\cdot d\vb l$ vanishes at every step. Any other path from $a$ to $c$ gives 0 too.`,
          { figHtml: fEquip() }),

        Q(md`It takes $6\ \mu$J of work to bring a charge $+2\ \mu$C slowly from infinity to a point $P$ near some fixed charges. That charge is then taken away. How much work does it take to bring a charge $-1\ \mu$C from infinity to $P$?`,
          [md`$+3\ \mu$J`, md`$-3\ \mu$J`, md`$-6\ \mu$J`, md`$+6\ \mu$J`], 1,
          [md`Right size, wrong sign. $V(P) = 3$ V is a property of the point; multiplying by a **negative** charge gives negative work.`, null,
            md`The work scales with the charge: half the charge (in size) means half the work. $V(P) = 6\ \mu\text{J}/2\ \mu\text{C} = 3$ V, and $W = (-1\ \mu\text{C})(3\text{ V})$.`,
            md`The work depends on the charge being moved. $V(P)=W/q$ is what stays fixed.`],
          md`Energy per unit charge: $V(P) = W/q = 6\ \mu\text{J}/2\ \mu\text{C} = 3$ V (with $V(\infty)=0$). That is a property of the point, set by the fixed charges. For the new charge, $W = qV(P) = (-1\ \mu\text{C})(3\text{ V}) = -3\ \mu$J: the field pulls the negative charge in for you.`,
          { nofig: 'The fixed charges are unspecified; only the potential at P matters.' }),

        Q(md`You redefine the potential by adding a constant 5 V everywhere (a new reference point). What happens to the work needed to carry $q$ from $a$ to $b$?`,
          [md`It increases by $5q$`, md`It decreases by $5q$`, md`It is unchanged`, md`It doubles if $V(a)$ was 5 V`], 2,
          [md`The constant appears in both $V(b)$ and $V(a)$ and cancels in the difference.`, md`The constant cancels in $V(b)-V(a)$; nothing changes.`, null, md`Only differences of $V$ enter the work, and adding a constant changes no difference.`],
          md`$W = q[(V(b)+5)-(V(a)+5)] = q[V(b)-V(a)]$. Work, force and field depend only on differences of $V$. The reference point is a bookkeeping choice; $W = qV(\vb r)$ for "bringing in from infinity" relies on choosing $V(\infty)=0$.`,
          { nofig: 'Statement about the reference point only.' }),

        Q(md`A charge $+q$ is released from rest at point $a$ and moves under the field alone, passing through point $b$. Its kinetic energy at $b$ is`,
          [md`$q\,[V(b)-V(a)]$`, md`$q\,[V(a)-V(b)]$`, md`$q\,V(b)$`, md`$\tfrac12 q\,[V(a)-V(b)]$`], 1,
          [md`That is the work **you** would need to do to move it slowly from $a$ to $b$. Released, the field does the opposite work, and that becomes kinetic energy.`, null,
            md`Only the change in potential matters; $qV(b)$ alone depends on the reference point, and the kinetic energy cannot.`,
            md`There is no $\tfrac12$ here. All the work done by the field, $-q\Delta V$, goes into kinetic energy.`],
          md`Energy conservation: $\text{KE}_b + qV(b) = 0 + qV(a)$, so $\text{KE}_b = q[V(a)-V(b)]$. A positive charge speeds up as it "falls" to lower potential. This is the same as the work done by the field, $W_{\text{field}} = -q\,\Delta V$.`,
          { nofig: 'General statement; no particular geometry.' }),

        RF(md`
          ### Worked example: two fixed charges

          Two charges $+Q$ are held fixed at $(\pm d, 0)$. Point $O$ is the origin; point $P$ is at $(0, d)$.

          [[fig:two]]

          **(a) Bring $q$ from infinity to $O$.** At $O$ each charge is a distance $d$ away:

          $$V(O) = 2\cdot\frac{Q}{4\pi\varepsilon_0 d},\qquad W_{\infty\to O} = qV(O) = \frac{2qQ}{4\pi\varepsilon_0 d}.$$

          Notice that $\vb E(O) = 0$ by symmetry, yet the work is not zero. You pushed against a nonzero field all the way in; only the end point is field-free.

          **(b) Then move $q$ from $O$ to $P$.** Each charge is now $\sqrt2\,d$ away, so $V(P) = \dfrac{2Q}{4\pi\varepsilon_0\sqrt2\,d} = \dfrac{\sqrt2\,Q}{4\pi\varepsilon_0 d}$ and

          $$W_{O\to P} = q\,[V(P)-V(O)] = \frac{qQ}{4\pi\varepsilon_0 d}\big(\sqrt2-2\big) \approx -0.59\,\frac{qQ}{4\pi\varepsilon_0 d}.$$

          Negative: $q$ moves away from both charges, to lower potential, and the field does the work.

          **(c) Check path independence.** Straight from infinity to $P$: $qV(P) = \sqrt2\,\dfrac{qQ}{4\pi\varepsilon_0 d}$, which equals (a) + (b) $= (2 + \sqrt2 - 2)\,\dfrac{qQ}{4\pi\varepsilon_0 d}$.
        `, { two: { svg: fTwoQ(true), cap: 'Two fixed charges $+Q$ a distance $2d$ apart. $O$ is midway; $P$ is a height $d$ above $O$.' } }),

        Q(md`In the worked example, the field at $O$ is zero. Someone concludes that no work is needed to bring $q$ in from infinity to $O$. What is wrong?`,
          [md`Nothing: zero field at $O$ means zero work`, md`The work is infinite because $q$ passes close to the charges`, md`The work depends on the direction $q$ comes in from`, md`The work depends on the field along the whole way in, i.e. on $V(O)$, which is not zero`], 3,
          [md`Zero field at the **end point** says nothing about the field on the way in. $W = qV(O) = 2qQ/(4\pi\varepsilon_0 d)$.`,
            md`$q$ never has to pass through a charge; any reasonable path keeps it a finite distance away, and the work is finite: $qV(O)$.`,
            md`Path independence: every route from infinity to $O$ costs $qV(O)$.`,
            null],
          md`$W = -q\int_\infty^O \vb E\cdot d\vb l = qV(O)$. The integral samples $\vb E$ along the whole path, not just at the end. $\vb E = -\nabla V$ is zero at $O$ because $V$ has a stationary point there (a saddle), not because $V$ is zero.`,
          { figHtml: fTwoQ(false) }),

        Q(md`A charge $+Q$ and a charge $-Q$ are held a distance $2d$ apart. How much work does it take to bring a charge $q$ from infinity to the midpoint $M$?`,
          [md`Zero`, md`$\dfrac{2qQ}{4\pi\varepsilon_0 d}$`, md`$-\dfrac{2qQ}{4\pi\varepsilon_0 d}$`, md`It cannot be finite, since the field at $M$ is large`], 0,
          [null, md`That adds the two contributions with the same sign. The $-Q$ contributes $-Q/(4\pi\varepsilon_0 d)$ to $V(M)$, which cancels the $+Q$.`,
            md`The two contributions to $V(M)$ cancel; neither sign wins.`,
            md`A large field at the end point does not make the work infinite. The work is $qV(M)$, and $V(M) = 0$.`],
          md`$V(M) = \dfrac{Q}{4\pi\varepsilon_0 d} - \dfrac{Q}{4\pi\varepsilon_0 d} = 0$, so $W = qV(M) = 0$. The field at $M$ is large (both charges push $q$ the same way), but the work depends on $V$, not on $\vb E$ at the end point. Compare with the previous question: there $\vb E = 0$ and $V\neq0$; here $\vb E\neq0$ and $V=0$.`,
          { figHtml: fDip() }),

        P({
          title: 'Moving a charge closer to a fixed charge',
          q: md`A point charge $Q$ is held fixed at the origin. You carry a charge $q$ slowly from point $a$, a distance $3d$ from $Q$, to point $b$, a distance $d$ from $Q$, along the wiggly path shown.`,
          figHtml: fP1(),
          hints: [md`Don't integrate along the wiggly path. The work is $q$ times the potential difference between the end points.`, md`$V(r) = \dfrac{Q}{4\pi\varepsilon_0 r}$ for a point charge with $V(\infty)=0$.`],
          parts: [
            { lbl: 'W', expr: 'q*Q/(6*pi*eps0*d)', vars: { q: [0.5, 3], Q: [0.5, 3], eps0: [0.5, 2], d: [0.5, 3] }, accepts: ['q*Q/(4*pi*eps0)*(1/d-1/(3*d))', '2*q*Q/(12*pi*eps0*d)'] },
            { lbl: md`If $q$ and $Q$ have the same sign, the work you do is`, mc: ['positive: you push the charges together', 'negative: the field pulls them together', 'zero: the path is curved'], a: 0,
              why: [null, md`Like charges repel; bringing them closer is "uphill" and costs positive work.`, md`The shape of the path never matters; only the end points do.`] },
          ],
          sol: md`
            $$W = q\,[V(b)-V(a)] = \frac{qQ}{4\pi\varepsilon_0}\left(\frac1d - \frac1{3d}\right) = \frac{qQ}{4\pi\varepsilon_0}\cdot\frac{2}{3d} = \frac{qQ}{6\pi\varepsilon_0 d}.$$

            The angles of $a$ and $b$ and the wiggles don't enter: $V$ of a point charge depends only on distance, and the work depends only on the end points.

            **Check.** Same signs: positive work (pushing like charges together). Opposite signs: negative. Moving from $3d$ out to infinity instead would cost $q[0 - Q/(4\pi\varepsilon_0\,3d)]$, negative for like charges, as it should be.
          `,
        }),

        P({
          title: 'Released from rest',
          q: md`A small particle of mass $m$ and charge $q$ is released from rest a distance $a$ from a point charge $Q$ that is held fixed. $q$ and $Q$ have the same sign. Find the particle's speed when it is very far away, and its speed when it passes $r = 2a$.`,
          figHtml: fRel(),
          hints: [md`Energy conservation: kinetic energy gained = potential energy lost $= q[V(\text{start}) - V(\text{end})]$.`, md`At $r\to\infty$, $V=0$. At $r = 2a$, $V$ is half its starting value.`],
          parts: [
            { lbl: md`v_\infty`, expr: 'sqrt(q*Q/(2*pi*eps0*m*a))', vars: { q: [0.5, 3], Q: [0.5, 3], eps0: [0.5, 2], m: [0.5, 3], a: [0.5, 3] }, accepts: ['sqrt(2*q*Q/(4*pi*eps0*a*m))'] },
            { lbl: md`$v(2a)/v_\infty$`, ans: 1 / Math.SQRT2, unit: '' },
          ],
          sol: md`
            Energy conservation from $r=a$ (at rest) to $r$:

            $$\tfrac12 mv^2 = q\,[V(a)-V(r)] = \frac{qQ}{4\pi\varepsilon_0}\left(\frac1a-\frac1r\right).$$

            As $r\to\infty$: $\tfrac12 mv_\infty^2 = \dfrac{qQ}{4\pi\varepsilon_0 a}$, so

            $$v_\infty = \sqrt{\frac{2qQ}{4\pi\varepsilon_0 m a}} = \sqrt{\frac{qQ}{2\pi\varepsilon_0 m a}}.$$

            At $r=2a$ the particle has released half the energy: $\tfrac12 mv^2 = \dfrac{qQ}{4\pi\varepsilon_0}\cdot\dfrac{1}{2a}$, so $v(2a)/v_\infty = 1/\sqrt2 \approx 0.707$. Most of the speed is gained close in, where the field is strong.
          `,
        }),

        RF(md`
          !!key Patterns to remember
            - The work **you** do: $W = q\,\Delta V = q[V(b)-V(a)]$. The field does $-q\,\Delta V$. Released charges gain kinetic energy $q[V(a)-V(b)]$.
            - The path never matters; closed loops and equipotentials cost nothing.
            - With $V(\infty)=0$, $qV(\vb r)$ is the work to bring $q$ in from infinity.
            - Zero field at a point does not mean zero potential there, and zero potential does not mean zero field.
            - Watch the sign of the charge: negative charges go "downhill" toward **higher** $V$.
        `),
      ],
    };
  };

  // ===================================================================================== Lesson 2
  const L2 = () => {
    // square corners in screen coords: side s, top-left at (x0, y0)
    const sq = (x0, y0, s) => ({ TL: [x0, y0], TR: [x0 + s, y0], BR: [x0 + s, y0 + s], BL: [x0, y0 + s], C: [x0 + s / 2, y0 + s / 2] });
    const fBuild = () => {
      const f = PF.fig();
      const A = [40, 130], B = [190, 150], Cc = [120, 50];
      pairLine(f, A, B); pairLine(f, A, Cc); pairLine(f, B, Cc);
      f.label(112, 152, md`\srm_{12}`, 'c', 'small');
      f.label(66, 86, md`\srm_{13}`, 'c', 'small');
      f.label(170, 92, md`\srm_{23}`, 'c', 'small');
      f.charge(A[0], A[1], { q: '+', lab: 'q_1', at: 'l' });
      f.charge(B[0], B[1], { q: '+', lab: 'q_2', at: 'r' });
      f.charge(Cc[0], Cc[1], { q: '+', lab: 'q_3', at: 'l' });
      f.line(250, 10, 132, 44, { cls: 'dash', arrow: 'end' });
      f.text(254, 10, 'from far away', 'l');
      return f.svg();
    };
    const fSq = (sol) => {
      const f = PF.fig(), s = 120, p = sq(40, 30, s);
      if (sol) {
        pairLine(f, p.TL, p.TR, 'thin'); pairLine(f, p.TR, p.BR, 'thin'); pairLine(f, p.BR, p.BL, 'thin'); pairLine(f, p.BL, p.TL, 'thin');
        pairLine(f, p.TL, p.BR, 'dim dash thin'); pairLine(f, p.TR, p.BL, 'dim dash thin');
      } else f.rect(40, 30, s, s, { cls: 'dim dash thin' });
      f.charge(...p.TL, { q: '-', lab: '-q', at: 'l' });
      f.charge(...p.TR, { q: '+', lab: '+q', at: 'r' });
      f.charge(...p.BR, { q: '-', lab: '-q', at: 'r' });
      if (sol) f.charge(...p.BL, { q: '+', lab: '+q', at: 'l' });
      else { f.circle(...p.BL, 7, { cls: 'dash dim' }); f.label(p.BL[0] - 12, p.BL[1], '?', 'r'); }
      f.dim(40, 30 + s + 12, 40 + s, 30 + s + 12, 'a', { at: 'b' });
      return f.svg();
    };
    const fFour = (center) => {
      const f = PF.fig(), s = 120, p = sq(40, 30, s);
      f.rect(40, 30, s, s, { cls: 'dim dash thin' });
      for (const k of ['TL', 'TR', 'BR', 'BL']) f.charge(...p[k], { q: '+', lab: '+q', at: k[1] === 'L' ? 'l' : 'r' });
      if (center) f.charge(...p.C, { q: '-', lab: '-q', at: 'b' });
      f.dim(40, 30 + s + 12, 40 + s, 30 + s + 12, 'a', { at: 'b' });
      return f.svg();
    };
    const fTri = () => {
      const f = PF.fig(), s = 130, A = [40, 150], B = [40 + s, 150], Cc = [40 + s / 2, 150 - s * Math.sqrt(3) / 2];
      f.poly([A, B, Cc], { cls: 'dim dash thin' });
      f.charge(...A, { q: '+', lab: '+q', at: 'l' });
      f.charge(...B, { q: '+', lab: '+q', at: 'r' });
      f.charge(...Cc, { q: '-', lab: '-q', at: 'r' });
      f.dim(A[0], 162, B[0], 162, 'a', { at: 'b' });
      return f.svg();
    };
    const fLine = () => {
      const f = PF.fig();
      f.line(20, 50, 280, 50, { cls: 'dim dash thin' });
      f.charge(50, 50, { q: '+', lab: '+q', at: 't' });
      f.charge(150, 50, { q: '-', lab: '-q', at: 't' });
      f.charge(250, 50, { q: '+', lab: '+q', at: 't' });
      f.dim(50, 62, 150, 62, 'a', { off: 10, at: 'b' });
      f.dim(150, 62, 250, 62, 'a', { off: 10, at: 'b' });
      return f.svg();
    };
    const fLineTri = () => {
      const f = PF.fig();
      f.line(20, 120, 200, 120, { cls: 'dim dash thin' });
      for (const x of [30, 110, 190]) f.charge(x, 120, { q: '+', lab: '+q', at: 't' });
      f.dim(30, 132, 110, 132, 'a', { off: 6, at: 'b' });
      f.dim(110, 132, 190, 132, 'a', { off: 6, at: 'b' });
      f.label(110, 170, '\\text{(1) line}', 'c', 'small');
      const s = 80, A = [260, 128], B = [260 + s, 128], Cc = [260 + s / 2, 128 - s * Math.sqrt(3) / 2];
      f.poly([A, B, Cc], { cls: 'dim dash thin' });
      f.charge(...A, { q: '+', lab: '+q', at: 'l' }); f.charge(...B, { q: '+', lab: '+q', at: 'r' }); f.charge(...Cc, { q: '+', lab: '+q', at: 'r' });
      f.dim(A[0], 140, B[0], 140, 'a', { at: 'b' });
      f.label(300, 170, '\\text{(2) triangle}', 'c', 'small');
      return f.svg();
    };
    const fCube = () => {
      const g = PF.fig({ proj: { ox: 70, oy: 190, s: 1.15 } });
      const a = 110;
      g.box3(a, a, a);
      for (const x of [0, a]) for (const y of [0, a]) for (const z of [0, a]) { const p = g.p3(x, y, z); g.charge(p[0], p[1], { q: '+', r: 6 }); }
      const p0 = g.p3(a, 0, 0), p1 = g.p3(a, a, 0);
      g.dim(p0[0], p0[1] + 14, p1[0], p1[1] + 14, 'a', { at: 'b' });
      return g.svg();
    };
    const fTet = () => {
      const g = PF.fig({ proj: { ox: 60, oy: 170, s: 1.25 } });
      const a = 120, V = [[0, 0, 0], [0, a, 0], [a * Math.sqrt(3) / 2, a / 2, 0], [a * Math.sqrt(3) / 6, a / 2, a * Math.sqrt(2 / 3)]];
      g.l3(V[0], V[1], { cls: 'dash dim' });
      for (const [i, j] of [[0, 2], [1, 2], [0, 3], [1, 3], [2, 3]]) g.l3(V[i], V[j]);
      V.forEach((v) => { const p = g.p3(...v); g.charge(p[0], p[1], { q: '+', r: 6.5 }); });
      const pA = g.p3(...V[2]), pB = g.p3(...V[1]);
      g.label((pA[0] + pB[0]) / 2 + 12, (pA[1] + pB[1]) / 2 + 6, 'a', 'c', 'small');
      return g.svg();
    };
    const fRel2 = () => {
      const f = PF.fig();
      const pts = []; for (let i = 0; i <= 40; i++) pts.push([62 + 136 * i / 40, 60 + 4 * Math.sin(i * Math.PI / 4)]);
      f.pl(pts, { cls: 'dim thin' });
      f.charge(50, 60, { q: '+', lab: 'q,\\ m', at: 't' });
      f.charge(210, 60, { q: '+', lab: 'q,\\ m', at: 't' });
      f.text(130, 40, 'string', 'c');
      f.dim(50, 76, 210, 76, 'a', { off: 10, at: 'b' });
      return f.svg();
    };
    const fChain = () => {
      const f = PF.fig();
      f.line(0, 40, 330, 40, { cls: 'dim dash thin' });
      [25, 80, 135, 190, 245, 300].forEach((x, i) => f.charge(x, 40, { q: i % 2 ? '-' : '+', r: 7 }));
      f.label(-6, 40, '\\cdots', 'r'); f.label(336, 40, '\\cdots', 'l');
      f.dim(135, 54, 190, 54, 'a', { off: 6, at: 'b' });
      return f.svg();
    };

    // interactive: square of side a, pick charges, see both bookkeeping methods
    const wSquare = () => C.W(`
      <div class="w-title">Square of side $a$: choose a charge for each site and check both ways of adding up the energy</div>
      <div class="w-row sel"></div>
      <div class="w-grid"><div class="w-plot p1"></div><div class="w-note out"></div></div>`, (el) => {
      const sites = [['top left', 0, 1], ['top right', 1, 1], ['bottom right', 1, 0], ['bottom left', 0, 0], ['centre', 0.5, 0.5]];
      const val = [-1, 1, -1, 1, 0];
      const row = el.querySelector('.sel');
      row.innerHTML = sites.map(([n], i) => `<label>${n} <select data-i="${i}"><option value="1">+q</option><option value="-1">−q</option><option value="2">+2q</option><option value="0">none</option></select></label>`).join('');
      const qs = (v) => (v === 1 ? '+q' : v === -1 ? '-q' : v === 2 ? '+2q' : '');
      const fx = (x) => (Math.abs(x) < 5e-10 ? '0' : (x > 0 ? '+' : '−') + Math.abs(x).toFixed(3));
      function draw() {
        const f = PF.fig(), S = 130, ox = 40, oy = 26;
        const Pt = (i) => [ox + sites[i][1] * S, oy + (1 - sites[i][2]) * S];
        f.rect(ox, oy, S, S, { cls: 'dim dash thin' });
        sites.forEach((s, i) => { const [X, Y] = Pt(i); if (val[i]) f.charge(X, Y, { q: val[i] > 0 ? '+' : '-', lab: qs(val[i]), at: i === 4 ? 'b' : (s[1] ? 'r' : 'l') }); else f.dot(X, Y, 2.4, { cls: 'dimfill' }); });
        f.dim(ox, oy + S + 14, ox + S, oy + S + 14, 'a', { at: 'b' });
        el.querySelector('.p1').innerHTML = f.svg();
        const on = sites.map((s, i) => i).filter((i) => val[i]);
        const dist = (i, j) => Math.hypot(sites[i][1] - sites[j][1], sites[i][2] - sites[j][2]);
        const rows = [];
        let W = 0;
        for (let x = 0; x < on.length; x++) for (let y = x + 1; y < on.length; y++) {
          const i = on[x], j = on[y], d = dist(i, j), t = val[i] * val[j] / d; W += t;
          const dt = Math.abs(d - 1) < 1e-9 ? 'a' : Math.abs(d - S2) < 1e-9 ? '\\sqrt2\\,a' : 'a/\\sqrt2';
          rows.push(`<tr><td>${sites[i][0]} & ${sites[j][0]}</td><td>$${dt}$</td><td>$${fx(t)}$</td></tr>`);
        }
        const Vs = on.map((i) => { let v = 0; on.forEach((j) => { if (j !== i) v += val[j] / dist(i, j); }); return [i, v]; });
        const half = 0.5 * Vs.reduce((s, [i, v]) => s + val[i] * v, 0);
        el.querySelector('.out').innerHTML = on.length < 2 ? '<p>Place at least two charges.</p>'
          : `<p>Pairs (each once), in units of $q^2/(4\\pi\\varepsilon_0 a)$:</p><div class="tablewrap"><table><thead><tr><th>pair</th><th>separation</th><th>term</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>
            <p>Sum over pairs: $W = ${fx(W)}$.</p>
            <p>Potential at each charge from the <b>others</b> (units $q/(4\\pi\\varepsilon_0 a)$): ${Vs.map(([i, v]) => `${sites[i][0]} $${fx(v)}$`).join(', ')}. Then $\\tfrac12\\sum q_iV_i = ${fx(half)}$, the same number.</p>
            <p>${W < 0 ? 'Negative: assembling this releases energy; pulling it apart costs $|W|$.' : 'Positive: you must supply this much to assemble it, and you get it back when it flies apart.'}</p>`;
        if (window.Engine) Engine.renderMath(el);
      }
      row.querySelectorAll('select').forEach((s) => { s.value = String(val[+s.dataset.i]); s.addEventListener('input', () => { val[+s.dataset.i] = +s.value; draw(); }); });
      draw();
    });

    return {
      id: 'u3-assembly', title: 'The energy of a collection of point charges',
      steps: [
        RF(md`
          ### What does it cost to assemble charges?

          Start with empty space: no charges, no field. Bring point charges in from far away one at a time and nail each one down where it belongs. The lecture's in-class questions:

          - **The first charge** costs nothing. There is no field yet to push against.
          - **The second charge** costs $q_2V_1(\vb r_2)$, where $V_1(\vb r) = \dfrac{q_1}{4\pi\varepsilon_0\srm_1}$ is the potential of the first, so $W_2 = \dfrac{q_1q_2}{4\pi\varepsilon_0\srm_{12}}$. (The notes write $qV_1(\vb r_2)$; the charge is $q_2$.)
          - **The third** pushes against both: $W_3 = \dfrac{q_3}{4\pi\varepsilon_0}\left(\dfrac{q_1}{\srm_{13}}+\dfrac{q_2}{\srm_{23}}\right)$.

          [[fig:build]]

          Each new charge pays for its interaction with every charge already in place. Add it all up and every pair shows up exactly once:

          $$W = \kq\sum_{i=1}^{n}\sum_{j>i}\frac{q_iq_j}{\srm_{ij}},\qquad \srm_{ij} = |\vb r_i-\vb r_j|.$$

          The recipe: for each pair, multiply the two charges, divide by their separation, add up, and multiply by $1/(4\pi\varepsilon_0)$. Like charges close together give positive terms (it costs energy to push them together); unlike charges close together give negative terms (they pull together on their own).
        `, { build: { svg: fBuild(), cap: 'Bringing in $q_3$ costs work against $q_1$ and $q_2$, which are already nailed down.' } }),

        Q(md`You start with empty space and bring in the first point charge $q_1$ from far away to some point. How much work does that take?`,
          [md`$\dfrac{q_1^2}{4\pi\varepsilon_0 r}$, its interaction with itself`, md`Zero`, md`It depends on where you put it`, md`Infinite, the self-energy of a point charge`], 1,
          [md`A charge does not push on itself. The pairwise formula has no $i=j$ terms.`, null, md`With no other charges around there is no field anywhere, so every location costs the same: nothing.`,
            md`The self-energy (the energy to **make** a point charge) is a separate, infinite quantity that we deliberately leave out; we take point charges as given and only move them. We'll come back to it.`],
          md`There is no field to fight yet, so the first charge is free. Only later charges pay, because they are pushed by the charges already in place. The energy of a configuration is entirely made of **pair** interactions.`,
          { figHtml: fBuild() }),

        Q(md`How many terms are there in $\sum_{i}\sum_{j>i} q_iq_j/\srm_{ij}$ for five charges?`,
          [md`5`, md`20`, md`10`, md`25`], 2,
          [md`That is the number of charges, not the number of pairs.`, md`20 counts each pair twice ($i\neq j$ ordered pairs). The $j>i$ sum counts each pair once.`, null, md`25 includes the 5 terms with $i=j$, which are not allowed, and counts every pair twice.`],
          md`The number of pairs is $\binom{5}{2} = \dfrac{5\cdot4}{2} = 10$. In general $n(n-1)/2$. The $\tfrac12\sum_i\sum_{j\ne i}$ form has $n(n-1) = 20$ terms and the $\tfrac12$ undoes the double count.`,
          { nofig: 'Counting question; no geometry.' }),

        Q(md`You assemble the same four charges in two different orders. The total work`,
          [md`is larger when the like charges are brought in first`, md`is larger when the largest charge is brought in last`, md`depends on the order, though the final configuration is the same`, md`is the same for both orders`], 3,
          [md`Each pair contributes once no matter which of the two arrives first.`, md`The last charge pays for all its pairs, but the earlier charges then paid nothing for those pairs. The total is unchanged.`,
            md`The total is a sum over pairs, and every pair is in the sum whatever the order.`, null],
          md`Every pair $q_iq_j/\srm_{ij}$ appears exactly once whatever the order; the order only changes which charge "pays" for each pair. The energy is a property of the final configuration. It is also the work you get back if you take the configuration apart.`,
          { nofig: 'Statement about ordering; no particular geometry.' }),

        Q(md`A charge $+q$ and a charge $-q$ are a distance $r$ apart. The pairwise formula gives $W = -\dfrac{q^2}{4\pi\varepsilon_0 r}$. What does the minus sign mean?`,
          [md`Assembling the pair releases energy; you must supply $\dfrac{q^2}{4\pi\varepsilon_0 r}$ to pull them apart again`, md`The formula has broken down; energy can never be negative`, md`The pair cannot exist in equilibrium`, md`The work is negative because the charges have opposite signs, but its size is meaningless`], 0,
          [null, md`Energy relative to "infinitely far apart" can be negative. (The field formula $\tfrac{\varepsilon_0}{2}\int E^2$ is never negative, but it also counts the infinite self-energy of each point charge. Lesson 4.)`,
            md`Whether something holds the charges in place is a separate question. Here they are nailed down.`,
            md`Its size is the binding energy: the work to separate them to infinity.`],
          md`Bringing $-q$ in toward $+q$, the field pulls it in and you hold it back: you do negative work. So the assembled pair has less energy than the separated charges. To separate them you must supply $+\dfrac{q^2}{4\pi\varepsilon_0 r}$.`,
          { nofig: 'Two charges at distance r; the formula is given.' }),

        RF(md`
          ### Counting every pair twice: $W = \tfrac12\sum q_iV(\vb r_i)$

          A tidier way is to count each pair **twice** and divide by 2 (the notes: "we have deliberately double counted and used ½ to divide it out"):

          $$W = \frac12\,\kq\sum_{i=1}^{n}\sum_{j\ne i}\frac{q_iq_j}{\srm_{ij}} = \frac12\sum_{i=1}^{n} q_i\underbrace{\left(\sum_{j\ne i}\frac{1}{4\pi\varepsilon_0}\frac{q_j}{\srm_{ij}}\right)}_{V(\vb r_i)} = \frac12\sum_{i=1}^{n} q_i\,V(\vb r_i).$$

          Here $V(\vb r_i)$ is the potential at charge $i$ due to **all the other** charges: all of them, not only the ones present when $i$ arrived. For three charges the table shows why the $\tfrac12$ is needed:

          | | from $q_1$ | from $q_2$ | from $q_3$ |
          |---|---|---|---|
          | $q_1V(\vb r_1)$ | (left out) | $q_1q_2/\srm_{12}$ | $q_1q_3/\srm_{13}$ |
          | $q_2V(\vb r_2)$ | $q_2q_1/\srm_{12}$ | (left out) | $q_2q_3/\srm_{23}$ |
          | $q_3V(\vb r_3)$ | $q_3q_1/\srm_{13}$ | $q_3q_2/\srm_{23}$ | (left out) |

          Each pair appears twice, once in each partner's row. (The notes' upper limits switch between $n$ and $N$; both mean the number of charges.)

          !!trap Two traps in $\tfrac12\sum q_iV(\vb r_i)$
            1. $V(\vb r_i)$ leaves out charge $i$'s own potential, which is infinite at its own position.
            2. The $\tfrac12$ belongs to the **total** energy. The work to bring **one** charge $q$ into the field of charges already in place is $qV$, with no $\tfrac12$.
        `),

        Q(md`In $W = \tfrac12\sum_i q_iV(\vb r_i)$ for point charges, $V(\vb r_i)$ is`,
          [md`the total potential at $\vb r_i$, including $q_i$'s own`, md`the potential at $\vb r_i$ from the charges that were in place before $q_i$ was brought in`, md`the potential at the centre of the configuration`, md`the potential at $\vb r_i$ from all the other charges`], 3,
          [md`$q_i$'s own potential at its own position is infinite. It is left out.`,
            md`That is what the **pairwise** step-by-step construction uses. In the $\tfrac12$ form every other charge counts, whenever it arrived; that is exactly why every pair is counted twice.`,
            md`Each charge is multiplied by the potential at **its own** location.`,
            null],
          md`$V(\vb r_i) = \sum_{j\ne i}\dfrac{q_j}{4\pi\varepsilon_0\srm_{ij}}$: everyone except $q_i$. Using all the others double counts each pair, which the $\tfrac12$ fixes.`,
          { nofig: 'Definition question.' }),

        Q(md`Three charges are already nailed down. You now bring a fourth charge $q_4$ from infinity to the point $\vb r_4$, where the three produce a potential $V_{123}(\vb r_4)$. The work for this step is`,
          [md`$\tfrac12 q_4V_{123}(\vb r_4)$`, md`$q_4V_{123}(\vb r_4)$`, md`$\tfrac12\sum_{i=1}^4 q_iV(\vb r_i)$`, md`$2q_4V_{123}(\vb r_4)$, since each pair counts twice`], 1,
          [md`The $\tfrac12$ only appears when you add up **all** charges, each with the potential of all others. Moving one charge in a fixed field costs $qV$.`, null,
            md`That is the energy of the whole four-charge configuration, which includes the work already spent on the first three.`,
            md`Double counting happens only in the symmetric $\sum_i\sum_{j\ne i}$ sum. The single step counts each new pair once.`],
          md`One charge moved in the field of fixed charges: $W_4 = q_4V_{123}(\vb r_4) = \dfrac{q_4}{4\pi\varepsilon_0}\left(\dfrac{q_1}{\srm_{14}}+\dfrac{q_2}{\srm_{24}}+\dfrac{q_3}{\srm_{34}}\right)$. Each of its three pairs appears once. The total energy is this plus the work spent assembling the first three.`,
          { nofig: 'General statement; positions are symbolic.' }),

        Q(md`Every charge in a configuration is doubled, and every separation is kept. The energy of the configuration`,
          [md`doubles`, md`stays the same`, md`quadruples`, md`halves`], 2,
          [md`Each term is a product $q_iq_j$, so it picks up $2\times2$.`, md`The terms are products of charges and grow with them.`, null, md`Doubling the charges increases every term.`],
          md`Each term $q_iq_j/\srm_{ij}$ is quadratic in the charges, so the total goes up by a factor of 4. (Doubling every separation instead would halve the energy.) Energy is quadratic in charge; this is the first hint that energies do not simply add when you superpose configurations.`,
          { nofig: 'Scaling question.' }),

        RF(md`
          ### Worked example: a square of charges

          Three charges sit at corners of a square of side $a$: $-q$ top left, $+q$ top right, $-q$ bottom right. **(a)** How much work does it take to bring $+q$ from far away to the empty bottom-left corner? **(b)** How much energy does the whole configuration of four charges store?

          [[fig:setup]]

          **(a) Only the new charge's pairs count.** From the bottom-left corner, the two $-q$ are a distance $a$ away and the $+q$ is across the diagonal, $\sqrt2\,a$ away:

          $$W_4 = q\,V(\vb r_4) = \frac{q}{4\pi\varepsilon_0}\left(-\frac{q}{a}-\frac{q}{a}+\frac{q}{\sqrt2\,a}\right) = \frac{q^2}{4\pi\varepsilon_0 a}\left(-2+\frac{1}{\sqrt2}\right)\approx -1.29\,\frac{q^2}{4\pi\varepsilon_0 a}.$$

          **(b) All six pairs.** The signs alternate around the square, so each of the four sides joins a $+q$ to a $-q$ (term $-q^2/a$), and each diagonal joins equal charges (term $+q^2/(\sqrt2\,a)$):

          [[fig:sol]]

          $$W = \frac{1}{4\pi\varepsilon_0}\left(4\cdot\frac{-q^2}{a} + 2\cdot\frac{q^2}{\sqrt2\,a}\right) = \frac{q^2}{4\pi\varepsilon_0 a}\left(-4+\sqrt2\right)\approx -2.59\,\frac{q^2}{4\pi\varepsilon_0 a}.$$

          **Check with $\tfrac12\sum q_iV(\vb r_i)$.** Every charge sees two opposite charges at $a$ and an equal charge at $\sqrt2\,a$, so every product $q_iV(\vb r_i)$ equals $\dfrac{q^2}{4\pi\varepsilon_0a}\left(-2+\dfrac1{\sqrt2}\right)$. Then $W = \tfrac12\cdot4\cdot\left(-2+\tfrac1{\sqrt2}\right) = -4+\sqrt2$ in the same units.

          Notice (a) $\neq$ (b): the cost of the last charge is not the energy of the configuration. The total is negative, so the square is bound: pulling it apart costs $2.59\,q^2/(4\pi\varepsilon_0 a)$.
        `, { setup: { svg: fSq(false), cap: 'Three charges at the corners of a square of side $a$; the fourth corner is empty.' }, sol: { svg: fSq(true), cap: 'All six pairs: four sides (solid, unlike charges, distance $a$) and two diagonals (dashed: like charges, the diagonal distance).' } }),

        wSquare(),

        P({
          title: 'Four equal charges on a square',
          q: md`Four charges $+q$ sit at the corners of a square of side $a$. How much energy does the configuration store? Give $W$ in units of $q^2/(4\pi\varepsilon_0 a)$.`,
          figHtml: fFour(false),
          hints: [md`Six pairs. Sort them by separation: how many sides, how many diagonals?`, md`Four sides at distance $a$, two diagonals at $\sqrt2\,a$. All products are $+q^2$.`],
          parts: [{ lbl: md`$W$ in units of $q^2/(4\pi\varepsilon_0 a)$`, ans: 4 + S2, unit: '' }],
          sol: md`
            Pairs: four sides ($\srm = a$) and two diagonals ($\srm = \sqrt2\,a$), all with $q_iq_j = +q^2$:

            $$W = \frac{q^2}{4\pi\varepsilon_0 a}\left(4 + \frac{2}{\sqrt2}\right) = \left(4+\sqrt2\right)\frac{q^2}{4\pi\varepsilon_0 a}\approx 5.41\,\frac{q^2}{4\pi\varepsilon_0 a}.$$

            Positive, as it must be for like charges: you push them together against their repulsion. Released, they would fly apart and carry off $5.41\,q^2/(4\pi\varepsilon_0 a)$ of kinetic energy in total.
          `,
        }),

        P({
          title: 'Triangle with one odd charge',
          q: md`Charges $+q$, $+q$ and $-q$ sit at the corners of an equilateral triangle of side $a$. Find the energy of the configuration in units of $q^2/(4\pi\varepsilon_0 a)$.`,
          figHtml: fTri(),
          hints: [md`Three pairs, all at the same distance $a$. Only the products of the charges differ.`],
          parts: [
            { lbl: md`$W$ in units of $q^2/(4\pi\varepsilon_0 a)$`, ans: -1, unit: '' },
            { lbl: md`Now the $-q$ is replaced by $+q$. The energy becomes`, mc: [md`$+3$`, md`$+1$`, md`$-3$`, md`$0$`], a: 0, why: [null, md`All three pairs are now $+q^2$: $1+1+1$.`, md`All products are positive now.`, md`No cancellation is left; every term is $+1$.`] },
          ],
          sol: md`
            All three separations are $a$. The products: $(+q)(+q) = +q^2$, $(+q)(-q) = -q^2$ twice.

            $$W = \frac{1}{4\pi\varepsilon_0 a}\left(q^2 - q^2 - q^2\right) = -\frac{q^2}{4\pi\varepsilon_0 a}.$$

            With three $+q$ charges: $3\,q^2/(4\pi\varepsilon_0 a)$. Swapping one sign changed two of the three terms.
          `,
        }),

        P({
          title: 'Three charges in a line',
          q: md`Charges $+q$, $-q$, $+q$ sit on a line with spacing $a$. Find the energy in units of $q^2/(4\pi\varepsilon_0 a)$.`,
          figHtml: fLine(),
          hints: [md`Two neighbour pairs at distance $a$ and one end-to-end pair at $2a$.`],
          parts: [{ lbl: md`$W$ in units of $q^2/(4\pi\varepsilon_0 a)$`, ans: -1.5, unit: '' }],
          sol: md`
            $$W = \frac{1}{4\pi\varepsilon_0}\left(\frac{-q^2}{a}+\frac{-q^2}{a}+\frac{+q^2}{2a}\right) = -\frac32\,\frac{q^2}{4\pi\varepsilon_0 a}.$$

            The middle charge binds the two outer ones: the two attractive neighbour pairs beat the repulsive end pair, which is twice as far apart.
          `,
        }),

        P({
          title: 'A charge at the centre of a square',
          q: md`Four charges $+q$ sit at the corners of a square of side $a$, and a charge $-q$ sits at the centre. (a) Find the energy of the five-charge configuration. (b) If the corner charges were already in place, how much work would it take to bring the $-q$ in from infinity to the centre? Answer both in units of $q^2/(4\pi\varepsilon_0 a)$.`,
          figHtml: fFour(true),
          hints: [md`Start from the four corner charges alone (a practice problem above): $4+\sqrt2$.`, md`The centre is $a/\sqrt2$ from each corner. Each centre–corner pair contributes $-q^2/(a/\sqrt2) = -\sqrt2\,q^2/a$.`, md`Part (b) is a single step: $(-q)\,V_{\text{corners}}(\text{centre})$, no $\tfrac12$.`],
          parts: [
            { lbl: md`(a) $W$`, ans: 4 - 3 * S2, unit: '' },
            { lbl: md`(b) $W_{\text{centre}}$`, ans: -4 * S2, unit: '' },
          ],
          sol: md`
            **(b) first.** The four corner charges make, at the centre, $V = 4\cdot\dfrac{q}{4\pi\varepsilon_0(a/\sqrt2)} = 4\sqrt2\,\dfrac{q}{4\pi\varepsilon_0 a}$. Bringing $-q$ there costs

            $$W_{\text{centre}} = (-q)V = -4\sqrt2\,\frac{q^2}{4\pi\varepsilon_0 a}\approx -5.66\,\frac{q^2}{4\pi\varepsilon_0 a}.$$

            **(a)** The total is the corner square plus this last step (that's just the pairwise sum regrouped):

            $$W = \left(4+\sqrt2\right) - 4\sqrt2 = 4-3\sqrt2\approx -0.243\quad\text{(units } q^2/4\pi\varepsilon_0 a).$$

            Slightly negative: the central charge more than pays for the corner repulsion, so the whole thing is (barely) bound.
          `,
        }),

        Q(md`Three equal charges $+q$ are arranged either (1) on a line with spacing $a$ or (2) at the corners of an equilateral triangle of side $a$. Which arrangement stores more energy?`,
          [md`The triangle: $3$ versus $2.5$ (units $q^2/4\pi\varepsilon_0 a$)`, md`The line: its charges are spread out over a longer distance`, md`They are equal: both have three pairs`, md`The line: $3.5$ versus $3$`], 0,
          [null, md`Spreading out lowers energy. In the line the end pair is $2a$ apart; in the triangle all three pairs are at $a$.`,
            md`Three pairs each, but at different separations: the line's end pair is at $2a$.`,
            md`The line gives $1 + 1 + \tfrac12 = 2.5$, not 3.5.`],
          md`Line: $\dfrac{q^2}{4\pi\varepsilon_0}\left(\dfrac1a+\dfrac1a+\dfrac1{2a}\right) = 2.5\,\dfrac{q^2}{4\pi\varepsilon_0 a}$. Triangle: $3\,\dfrac{q^2}{4\pi\varepsilon_0 a}$. Like charges prefer to be far apart; the configuration with the closest pairs costs most.`,
          { figHtml: fLineTri() }),

        Q(md`Four charges $+q$ sit at the corners of a regular tetrahedron of edge $a$. The energy of the configuration is`,
          [md`$4\,\dfrac{q^2}{4\pi\varepsilon_0 a}$`, md`$\left(4+\sqrt2\right)\dfrac{q^2}{4\pi\varepsilon_0 a}$`, md`$12\,\dfrac{q^2}{4\pi\varepsilon_0 a}$`, md`$6\,\dfrac{q^2}{4\pi\varepsilon_0 a}$`], 3,
          [md`Four is the number of charges, or of faces. There are six pairs.`, md`That is the flat square. In a tetrahedron **every** pair is an edge, at distance $a$.`, md`Twelve counts each of the six pairs twice; the $\tfrac12$ is missing.`, null],
          md`A tetrahedron has $\binom42 = 6$ edges, and every pair of vertices is joined by an edge of length $a$. So $W = 6\,q^2/(4\pi\varepsilon_0 a)$. That's more than the square ($5.41$) because in the square the diagonal pairs are farther apart.`,
          { figHtml: fTet() }),

        Q(md`The four $+q$ charges on a square of side $a$ are released from rest and fly apart. When they are far apart, their total kinetic energy is`,
          [md`$\left(4+\sqrt2\right)\dfrac{q^2}{4\pi\varepsilon_0 a}$`, md`$\tfrac12\left(4+\sqrt2\right)\dfrac{q^2}{4\pi\varepsilon_0 a}$`, md`zero, since the forces on them cancel`, md`infinite, since the charges accelerate forever`], 0,
          [null, md`The $\tfrac12$ is already inside $W$ (or, in the pairwise form, never needed). All of $W$ becomes kinetic energy.`,
            md`The net force on each charge does not cancel; each is pushed outward by the other three.`,
            md`The force falls off as $1/r^2$, so the energy released is finite: exactly the stored energy.`],
          md`Energy conservation: the stored energy $W$ (relative to "far apart") turns into kinetic energy. $W = (4+\sqrt2)\,q^2/(4\pi\varepsilon_0 a)$ from the practice problem, so that is the total kinetic energy at infinity.`,
          { figHtml: fFour(false) }),

        P({
          title: 'A cube of charges',
          q: md`Eight charges $+q$ sit at the corners of a cube of edge $a$. How much energy does the configuration store? Give $W$ in units of $q^2/(4\pi\varepsilon_0 a)$.`,
          figHtml: fCube(),
          hints: [md`There are $\binom82 = 28$ pairs. Sort them by separation: edges, face diagonals, body diagonals.`, md`12 edges ($a$), 12 face diagonals ($\sqrt2\,a$: two per face, six faces), 4 body diagonals ($\sqrt3\,a$). Check: $12+12+4 = 28$.`],
          parts: [{ lbl: md`$W$ in units of $q^2/(4\pi\varepsilon_0 a)$`, ans: 12 + 6 * S2 + 4 / Math.sqrt(3), unit: '' }],
          sol: md`
            Count pairs by type:

            | type | number | separation | contribution |
            |---|---|---|---|
            | edges | 12 | $a$ | $12$ |
            | face diagonals | 12 | $\sqrt2\,a$ | $12/\sqrt2 = 6\sqrt2$ |
            | body diagonals | 4 | $\sqrt3\,a$ | $4/\sqrt3$ |

            Total: $28 = \binom82$ pairs, as it should be.

            $$W = \left(12 + 6\sqrt2 + \frac{4}{\sqrt3}\right)\frac{q^2}{4\pi\varepsilon_0 a}\approx 22.8\,\frac{q^2}{4\pi\varepsilon_0 a}.$$

            The habit to keep: group the pairs by separation and check the count against $n(n-1)/2$.
          `,
        }),

        P({
          title: 'Two charges on a string',
          q: md`Two particles, each of mass $m$ and charge $+q$, are held at rest a distance $a$ apart by a string. The string is cut and they fly apart. How fast is each one going when they are far apart?`,
          figHtml: fRel2(),
          hints: [md`The stored energy $\dfrac{q^2}{4\pi\varepsilon_0 a}$ becomes kinetic energy.`, md`Momentum is conserved (it starts at zero), so the two speeds are equal and the energy is shared equally.`],
          parts: [{ lbl: 'v', expr: 'q/sqrt(4*pi*eps0*m*a)', vars: { q: [0.5, 3], eps0: [0.5, 2], m: [0.5, 3], a: [0.5, 3] }, accepts: ['sqrt(q^2/(4*pi*eps0*a*m))'] }],
          sol: md`
            Momentum: $mv_1 = mv_2$, so both move at the same speed $v$. Energy: the configuration's energy $\dfrac{q^2}{4\pi\varepsilon_0 a}$ is shared:

            $$2\cdot\tfrac12 mv^2 = \frac{q^2}{4\pi\varepsilon_0 a}\quad\Longrightarrow\quad v = \frac{q}{\sqrt{4\pi\varepsilon_0 m a}}.$$

            (With unequal masses the lighter one gets more of the energy: $m_1v_1 = m_2v_2$ and $\tfrac12m_1v_1^2+\tfrac12m_2v_2^2 = W$.)
          `,
        }),

        P({
          title: 'Challenge: an infinite chain',
          q: md`An infinite chain of point charges $\pm q$ with alternating signs lies along a line, each a distance $a$ from its neighbours. The work per particle to assemble it is $-\alpha\,\dfrac{q^2}{4\pi\varepsilon_0 a}$. Find $\alpha$.`,
          figHtml: fChain(),
          hints: [md`Use $W = \tfrac12\sum_i q_iV(\vb r_i)$. Every particle sees the same surroundings, so the energy per particle is $\tfrac12 qV$ with $V$ the potential at one particle from all the others.`, md`For a $+q$ particle the neighbours at distance $na$ on each side have charge $(-1)^n q$: $V = \dfrac{2q}{4\pi\varepsilon_0 a}\sum_{n=1}^\infty\dfrac{(-1)^n}{n}$.`, md`$\sum_{n\ge1}(-1)^{n+1}/n = \ln 2$.`],
          parts: [{ lbl: md`$\alpha$`, ans: Math.LN2, unit: '' }],
          sol: md`
            Take a $+q$ particle. The particles a distance $na$ away (two of them, one on each side) have charge $(-1)^nq$:

            $$V = \frac{2q}{4\pi\varepsilon_0 a}\left(-1+\frac12-\frac13+\frac14-\cdots\right) = -\frac{2q\ln2}{4\pi\varepsilon_0 a}.$$

            A $-q$ particle sees everything with the opposite sign, so $q_iV(\vb r_i)$ is the same for every particle. The energy per particle is

            $$\frac{W}{N} = \frac12\,qV = -\ln2\,\frac{q^2}{4\pi\varepsilon_0 a},\qquad \alpha = \ln2\approx 0.693.$$

            The $\tfrac12$ matters: forgetting it gives $2\ln2$, which is the potential energy of **one** particle in the field of all the others (the Madelung constant of the chain), not the energy per particle.
          `,
        }),

        RF(md`
          !!key Patterns to remember
            - Pairwise: $W = \dfrac{1}{4\pi\varepsilon_0}\sum_{i<j}\dfrac{q_iq_j}{\srm_{ij}}$. Each pair once, no $\tfrac12$. Count pairs: $n(n-1)/2$; group them by separation.
            - Symmetric: $W = \tfrac12\sum_i q_iV(\vb r_i)$ with $V$ from the **other** charges. The $\tfrac12$ undoes the double count.
            - Bringing in one more charge: $qV$, no $\tfrac12$.
            - The total does not depend on the order of assembly; it is also the energy released if the configuration flies apart.
            - Negative $W$ means bound: you must supply $|W|$ to separate the charges.
            - Scaling: doubling every charge quadruples $W$; doubling every distance halves it.
        `),
      ],
    };
  };

  // ===================================================================================== shared sphere drawings
  // thin charged shell: circle with signs just outside it, radius line labelled R
  function shellFig(o = {}) {
    const f = PF.fig(), cx = 110, cy = 100, R = o.R || 60, s = o.sign ?? 1;
    f.circle(cx, cy, R);
    signsAt(f, circ(cx, cy, R), cx, cy, o.angs || [0, 45, 90, 135, 180, 225, 270], s, -9, false);
    f.dot(cx, cy, 2.2);
    const ang = -30 * DEG, ex = cx + R * Math.cos(ang), ey = cy - R * Math.sin(ang);
    f.line(cx, cy, ex, ey, { cls: 'dim thin' });
    f.label(cx + R / 2 * Math.cos(ang) + 6, cy - R / 2 * Math.sin(ang) - 9, 'R', 'c', 'small');
    if (o.lab) f.label(cx + (R + 30) * Math.cos(66 * DEG), cy - (R + 30) * Math.sin(66 * DEG), o.lab, 'c');
    return f;
  }
  // uniformly charged solid ball: shaded disk
  function ballFig(o = {}) {
    const f = PF.fig(), cx = 110, cy = 100, R = o.R || 60;
    const pts = circ(cx, cy, R);
    f.add(`<path class="shade nodecl" d="M${pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L')}Z"/>`);
    f.poly(pts);
    const ang = -30 * DEG;
    f.line(cx, cy, cx + R * Math.cos(ang), cy - R * Math.sin(ang), { cls: 'dim thin' });
    f.label(cx + R / 2 * Math.cos(ang) + 6, cy - R / 2 * Math.sin(ang) - 9, 'R', 'c', 'small');
    f.label(cx - 22, cy - 18, o.lab || '\\rho', 'c');
    return f;
  }

  // ===================================================================================== Lesson 3
  const L3 = () => {
    const fBigS = (bare) => {
      const f = PF.fig(), cx = 130, cy = 110;
      const blob = shape(cx, cy, 34, 24, { rot: 20, h: [[3, 0.12, 0], [2, 0.1, 40]] });
      f.add(`<path class="shade nodecl" d="M${blob.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L')}Z"/>`);
      f.poly(blob);
      f.label(cx, cy, '\\rho', 'c');
      f.circle(cx, cy, 95, { cls: 'dash' });
      f.label(cx + 95 * Math.cos(45 * DEG) + 7, cy - 95 * Math.sin(45 * DEG) - 7, 'S', 'bl');
      const a = 210 * DEG, ex = cx + 95 * Math.cos(a), ey = cy - 95 * Math.sin(a);
      f.line(cx + 36 * Math.cos(a), cy - 36 * Math.sin(a), ex, ey, { cls: 'dim thin' });
      f.label(cx + 66 * Math.cos(a) - 5, cy - 66 * Math.sin(a) - 9, 'r', 'c', 'small');
      if (!bare) {
        f.label(cx + 106, cy - 32, 'V\\sim 1/r', 'l', 'small');
        f.label(cx + 106, cy, 'E\\sim 1/r^2', 'l', 'small');
        f.label(cx + 106, cy + 32, '\\text{area}\\sim 4\\pi r^2', 'l', 'small');
      }
      return f.svg();
    };
    const fShell = () => shellFig({ lab: '\\sigma' }).svg();
    const fBall = () => ballFig().svg();
    const fBallShell = () => PF.row([{ svg: ballFig({ R: 50 }).svg(), cap: 'solid ball, charge $q$' }, { svg: shellFig({ R: 50 }).svg(), cap: 'thin shell, charge $q$' }]).svg;
    const fSqueeze = () => {
      const f = PF.fig(), cx = 110, cy = 100;
      f.circle(cx, cy, 70, { cls: 'dash dim' });
      f.circle(cx, cy, 35);
      for (const a of [20, 110, 200, 290]) { const c = Math.cos(a * DEG), s = Math.sin(a * DEG); f.arrow(cx + 66 * c, cy - 66 * s, cx + 41 * c, cy - 41 * s, { cls: 'dim' }); }
      f.label(cx + 70 * Math.cos(55 * DEG) + 8, cy - 70 * Math.sin(55 * DEG) - 8, '\\text{before: } R', 'bl', 'small');
      f.label(cx, cy, '\\tfrac{R}{2}', 'c', 'small');
      return f.svg();
    };
    const fSnow = () => {
      const f = PF.fig(), cx = 100, cy = 100, r = 50;
      const pts = circ(cx, cy, r);
      f.add(`<path class="shade nodecl" d="M${pts.map((p) => `${r1(p[0])},${r1(p[1])}`).join('L')}Z"/>`);
      f.poly(pts);
      f.circle(cx, cy, r + 7, { cls: 'dash' });
      f.line(cx, cy, cx - r, cy, { cls: 'dim thin' });
      f.label(cx - r / 2, cy - 10, 'r', 'c', 'small');
      f.label(cx + 6, cy + 22, 'q(r)', 'c', 'small');
      f.arrow(cx + 150, cy - 70, cx + 47, cy - 30, { cls: 'dash' });
      f.label(cx + 154, cy - 70, 'dq\\ \\text{from far away}', 'l', 'small');
      f.label(cx + (r + 7) * Math.cos(-40 * DEG) + 8, cy - (r + 7) * Math.sin(-40 * DEG) + 6, 'r+dr', 'tl', 'small');
      return f.svg();
    };
    const plotShell = () => PF.row([
      { svg: PF.plot({ w: 230, h: 160, x: [0, 4], y: [0, 1.3], xl: 'r', yl: 'E', xt: [[1, 'R']], curves: [{ f: () => 0, from: 0, to: 0.995 }, { f: (r) => 1 / (r * r), from: 1, to: 4 }] }), cap: '$E$: zero inside, $q/4\\pi\\varepsilon_0 r^2$ outside' },
      { svg: PF.plot({ w: 230, h: 160, x: [0, 4], y: [0, 1.3], xl: 'r', yl: 'V', xt: [[1, 'R']], curves: [{ f: () => 1, from: 0, to: 1 }, { f: (r) => 1 / r, from: 1, to: 4 }] }), cap: '$V$: constant inside, $q/4\\pi\\varepsilon_0 r$ outside' },
    ]);
    const plotFrac = () => PF.plot({ w: 330, h: 190, x: [0, 10], y: [0, 1.1], xl: 'r', yl: '\\text{fraction of } W \\text{ inside } r', xt: [[1, 'R'], [2, '2R'], [5, '5R'], [10, '10R']], yt: [[0.5, '0.5'], [0.9, '0.9']],
      curves: [{ f: (r) => (r < 1 ? 0 : 1 - 1 / r), n: 400 }], pts: [{ x: 2, y: 0.5 }, { x: 10, y: 0.9 }] });
    const plotBall = () => PF.row([
      { svg: PF.plot({ w: 230, h: 160, x: [0, 3], y: [0, 1.25], xl: 'r', yl: 'E', xt: [[1, 'R']], curves: [{ f: (r) => (r < 1 ? r : 1 / (r * r)), n: 300 }] }), cap: '$E$ grows like $r$ inside, falls like $1/r^2$ outside' },
      { svg: PF.plot({ w: 230, h: 160, x: [0, 3], y: [0, 1.7], xl: 'r', yl: 'V', xt: [[1, 'R']], yt: [[1.5, '\\tfrac32'], [1, '1']], curves: [{ f: (r) => (r < 1 ? 0.5 * (3 - r * r) : 1 / r), n: 300 }] }), cap: '$V$ in units of $q/4\\pi\\varepsilon_0R$' },
    ]);

    return {
      id: 'u3-field-energy', title: 'Continuous charge and the energy in the field',
      steps: [
        RF(md`
          ### From sums to integrals

          In-class question: what is the energy in the continuous case? Replace each $q_i$ by a bit of charge $\rho\,d\tau$ and the sum by an integral:

          $$W = \frac12\int\rho(\vb r)\,V(\vb r)\,d\tau$$

          (for surface and line charges, $\tfrac12\int\sigma V\,da$ and $\tfrac12\int\lambda V\,dl$). Now $V$ is the **full** potential. For a smooth distribution the charge in a tiny volume around $\vb r$ contributes nothing to $V(\vb r)$, so "leave out the charge itself" no longer matters. (For point charges it matters a lot. That's the next lesson.)

          ### Trading $\rho$ and $V$ for $\vb E$

          Gauss's law gives $\rho = \varepsilon_0\,\divg\vb E$, so

          $$W = \frac{\varepsilon_0}{2}\int (\divg\vb E)\,V\,d\tau .$$

          Integrate by parts to move the derivative from $\vb E$ onto $V$: the product rule $\divg(V\vb E) = V\,\divg\vb E + \vb E\cdot\nabla V$ plus the divergence theorem give

          $$W = \frac{\varepsilon_0}{2}\left[-\int_{\mathcal V}\vb E\cdot\nabla V\,d\tau + \oint_{S} V\,\vb E\cdot d\vb a\right] = \frac{\varepsilon_0}{2}\left[\int_{\mathcal V}E^2\,d\tau + \oint_{S} V\,\vb E\cdot d\vb a\right]$$

          using $\nabla V = -\vb E$. Here $\mathcal V$ is any volume that contains all the charge and $S$ is its surface.

          [[fig:S]]

          In-class question: **why is the surface term zero?** Push $S$ out to a sphere of radius $r\to\infty$. From far away the charges look like a point charge, so $V\sim 1/r$ and $E\sim 1/r^2$, while the area grows like $r^2$. The surface term goes like $\dfrac1r\cdot\dfrac1{r^2}\cdot r^2 = \dfrac1r\to0$. Over all space,

          $$W = \frac{\varepsilon_0}{2}\int_{\text{all space}} E^2\,d\tau .$$

          This one is on your formula sheet. The integrand $u = \tfrac{\varepsilon_0}{2}E^2$ is the **energy density** (units J/m$^3$). We think of the energy as stored in the field.

          !!key Two routes to the same number
            - $W = \tfrac12\int\rho V\,d\tau$: integrate over where the **charge** is.
            - $W = \tfrac{\varepsilon_0}{2}\int E^2\,d\tau$: integrate over **all space** where there is field, inside and outside the charges.

          !!trap Stopping the $E^2$ integral too early
            The surface term vanishes only for $S$ at infinity. Integrate $E^2$ over the charged object alone and you miss the field energy outside it (for a shell, that is all of it). For a finite $\mathcal V$, the surface term is exactly what you are missing.
        `, { S: { svg: fBigS(), cap: 'All the charge sits inside $\\mathcal V$. On a large sphere $S$ the surface term shrinks like $1/r$.' } }),

        Q(md`In $W = \tfrac{\varepsilon_0}{2}\left[\int_{\mathcal V}E^2\,d\tau + \oint_S V\vb E\cdot d\vb a\right]$, why does the surface term vanish when $S$ is a sphere of radius $r\to\infty$?`,
          [md`Because $V(\infty)=0$, so the integrand is zero on $S$`, md`Because $V\sim1/r$ and $E\sim 1/r^2$ while the area grows only like $r^2$, so the term falls like $1/r$`, md`Because far away $\vb E$ is parallel to the surface, so $\vb E\cdot d\vb a = 0$`, md`Because the volume integral grows without bound and swamps it`], 1,
          [md`On any sphere of finite radius $V$ is small but not zero. What matters is how fast the whole term shrinks: $V\cdot E\cdot\text{area}\sim 1/r$.`, null,
            md`Far away $\vb E$ is radial, perpendicular to the sphere and parallel to $d\vb a$. The dot product is as large as it can be.`,
            md`The volume integral converges to the finite $W$; it does not blow up. The surface term goes to zero on its own.`],
          md`Far from a bounded charge distribution $V\approx\dfrac{Q}{4\pi\varepsilon_0 r}$ and $E\approx\dfrac{Q}{4\pi\varepsilon_0 r^2}$ (or smaller still if $Q=0$). The surface term is roughly $V E\cdot4\pi r^2\sim 1/r\to0$, while $\int E^2$ grows toward its limit. Their sum is $W$ for every choice of $S$.`,
          { figHtml: fBigS(true) }),

        Q(md`A thin shell carries charge $q$. You integrate $\tfrac{\varepsilon_0}{2}E^2$ only over a ball of radius $10R$ centred on it. Compared with the shell's energy $W$, you get`,
          [md`exactly $W$`, md`$0.9\,W$; the surface term on the ball makes up the rest`, md`more than $W$`, md`zero, since the charge does not fill the ball`], 1,
          [md`Only all of space gives $W$ from $E^2$ alone. The field outside $10R$ still stores energy.`, null,
            md`$E^2\geq0$, so leaving a region out can only lower the integral.`,
            md`The field fills the ball (and the space beyond) whether or not the charge does.`],
          md`The field energy outside radius $r$ is $\dfrac{q^2}{8\pi\varepsilon_0 r}$ (worked example below), so outside $10R$ you miss $\tfrac1{10}$ of $W = \dfrac{q^2}{8\pi\varepsilon_0R}$. The formula $W = \frac{\varepsilon_0}{2}\left[\int_{\mathcal V}E^2 + \oint_S V\vb E\cdot d\vb a\right]$ holds for **any** $\mathcal V$ that contains the charge: on $r=10R$ the surface term is $\tfrac{\varepsilon_0}{2}\,V E\,4\pi r^2 = \dfrac{q^2}{8\pi\varepsilon_0\,(10R)}$, exactly the missing tenth.`,
          { figHtml: fShell() }),

        Q(md`Which identity turns $\int(\divg\vb E)\,V\,d\tau$ into $-\int\vb E\cdot\nabla V\,d\tau + \oint V\vb E\cdot d\vb a$?`,
          [md`$\curl(V\vb E) = V\,\curl\vb E + \nabla V\times\vb E$, then Stokes' theorem`, md`$\lap V = -\rho/\varepsilon_0$`, md`$\nabla(\vb E\cdot\vb E) = 2\vb E\cdot\nabla\vb E$`, md`$\divg(V\vb E) = V\,\divg\vb E + \vb E\cdot\nabla V$, then the divergence theorem`], 3,
          [md`Curl identities and Stokes' theorem give line integrals around loops. You need a surface integral over a closed surface.`,
            md`Poisson's equation is true, but it does not move a derivative from one factor to the other.`,
            md`That identity involves only $\vb E$; the step needs to shift the derivative from $\vb E$ onto $V$.`,
            null],
          md`Integrate the product rule over $\mathcal V$: $\int V\,\divg\vb E\,d\tau = \int\divg(V\vb E)\,d\tau - \int\vb E\cdot\nabla V\,d\tau = \oint_S V\vb E\cdot d\vb a - \int\vb E\cdot\nabla V\,d\tau$. This is integration by parts in three dimensions (Griffiths Eq. 1.59).`,
          { nofig: 'Vector identity; no geometry.' }),

        Q(md`For a uniformly charged solid ball, $W = \tfrac12\int\rho V\,d\tau$. Over what region do you integrate?`,
          [md`Over all space, since $V$ is not zero anywhere`, md`Only outside the ball, where the field lines go`, md`Only over the surface of the ball`, md`Over the ball, where $\rho\neq0$; a bigger region adds nothing`], 3,
          [md`You may, but outside the ball $\rho=0$, so those regions add nothing even though $V\neq0$ there.`, md`That region matters for $\int E^2$ (along with the inside). For $\int\rho V$, the outside has $\rho = 0$.`, md`That would be a surface charge ($\tfrac12\int\sigma V\,da$). Here the charge fills the volume.`, null],
          md`The integrand $\rho V$ vanishes wherever $\rho = 0$, so only the charged region contributes. Compare: $\int E^2$ must run over all of space, because the field extends far beyond the charge. Two formulas, two very different regions, same total.`,
          { figHtml: fBall() }),

        RF(md`
          ### Worked example (Griffiths Ex. 2.9): energy of a charged shell, two ways

          A thin spherical shell of radius $R$ carries total charge $q$, spread uniformly ($\sigma = q/4\pi R^2$).

          [[fig:shell]]

          **Method 1: $\tfrac12\int\sigma V\,da$ over the charge.** On the shell $V = \dfrac{q}{4\pi\varepsilon_0R}$, the same everywhere, so it comes out of the integral:

          $$W = \frac12\cdot\frac{q}{4\pi\varepsilon_0R}\int\sigma\,da = \frac12\cdot\frac{q}{4\pi\varepsilon_0R}\cdot q = \frac{q^2}{8\pi\varepsilon_0R}.$$

          **Method 2: $\tfrac{\varepsilon_0}{2}\int E^2\,d\tau$ over all space.** Inside, $E = 0$. Outside, $E = \dfrac{q}{4\pi\varepsilon_0r^2}$:

          $$W = \frac{\varepsilon_0}{2}\int_R^\infty\left(\frac{q}{4\pi\varepsilon_0 r^2}\right)^2 4\pi r^2\,dr = \frac{q^2}{8\pi\varepsilon_0}\int_R^\infty\frac{dr}{r^2} = \frac{q^2}{8\pi\varepsilon_0R}.$$

          [[fig:EV]]

          Same answer: once from the charge sitting on the surface, once from the field filling the outside. Method 1 needed $V$ only **on** the shell; method 2 needed $E$ everywhere.

          **Where is the energy?** The field energy between $R$ and $r$ is $\dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac1R - \dfrac1r\right)$, so a fraction $1 - R/r$ of the total lies inside radius $r$. Half of it sits between $R$ and $2R$; 90% within $10R$.

          [[fig:frac]]
        `, { shell: { svg: fShell(), cap: 'A thin shell of radius $R$ with total charge $q$.' }, EV: Object.assign(plotShell(), { cap: '' }), frac: { svg: plotFrac(), cap: 'Fraction of the shell\'s energy stored inside radius $r$: $1 - R/r$.' } }),

        Q(md`For the charged shell, what fraction of its energy $\dfrac{q^2}{8\pi\varepsilon_0R}$ is stored in the region inside the shell, $r<R$?`,
          [md`Half`, md`None`, md`All of it`, md`One third`], 1,
          [md`Half lies between $R$ and $2R$, which is outside the shell.`, null, md`Inside, $E = 0$, so the energy density is zero there.`, md`The field inside is zero, so no energy is stored there at all.`],
          md`$u = \tfrac{\varepsilon_0}{2}E^2$ and $E=0$ for $r<R$. All the field energy is outside. (Method 1 says the same total "lives on the charge"; Lesson 4 discusses why both pictures are fine in electrostatics.)`,
          { figHtml: fShell() }),

        Q(md`Within what radius is half of the shell's field energy stored?`,
          [md`$\sqrt2\,R$`, md`$4R$`, md`$10R$`, md`$2R$`], 3,
          [md`The fraction inside $r$ is $1 - R/r$, which equals $\tfrac12$ at $r = 2R$; at $\sqrt2\,R$ it is only $0.29$.`, md`At $4R$ the fraction is $1 - \tfrac14 = 0.75$.`, md`At $10R$ the fraction is $0.9$.`, null],
          md`Energy outside radius $r$: $\dfrac{q^2}{8\pi\varepsilon_0r}$. Inside $r$: $\dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac1R-\dfrac1r\right)$, a fraction $1 - R/r$. Setting this to $\tfrac12$ gives $r = 2R$. The energy is concentrated near the charge, where the field is strong.`,
          { nofig: 'Uses the shell figure and the plot above.' }),

        Q(md`For a uniformly charged ball (charge $q$, radius $R$), where is the energy density $u = \tfrac{\varepsilon_0}{2}E^2$ largest?`,
          [md`At the centre, where the charge is deepest`, md`It is the same everywhere inside`, md`At the surface, $r = R$`, md`Far outside, since most of the energy is outside`], 2,
          [md`At the centre $E = 0$ by symmetry, so $u = 0$ there.`, md`Inside, $E\propto r$, so $u\propto r^2$: it grows toward the surface.`, null, md`Most of the **total** is outside because the volume out there is huge, but the density itself falls like $1/r^4$.`],
          md`$E$ rises linearly inside and falls like $1/r^2$ outside, peaking at $r = R$ where $E = \dfrac{q}{4\pi\varepsilon_0R^2}$. So $u$ peaks at the surface. The outside still holds $5/6$ of the total, because $u\cdot4\pi r^2$ falls only like $1/r^2$.`,
          { figHtml: fBall() }),

        Q(md`Dry air breaks down at about $E = 3\times10^6$ V/m. Roughly how much energy per cubic metre does a field that strong store?`,
          [md`About $80$ J/m$^3$`, md`About $4\times10^{12}$ J/m$^3$`, md`About $40$ J/m$^3$`, md`About $3\times10^{-5}$ J/m$^3$`], 2,
          [md`That's $\varepsilon_0E^2$: the $\tfrac12$ is missing.`, md`That's $E^2/2$ without the factor $\varepsilon_0 = 8.85\times10^{-12}$ F/m.`, null, md`That's $\varepsilon_0E$, with $E$ not squared.`],
          md`$u = \tfrac12\varepsilon_0E^2 = \tfrac12(8.85\times10^{-12})(3\times10^6)^2\approx40$ J/m$^3$. A litre of such field holds only $0.04$ J, which is why practical capacitors use very thin gaps filled with materials that tolerate larger fields.`,
          { nofig: 'A numbers question; no geometry.' }),

        Q(md`A thin shell with charge $q$ is squeezed from radius $R$ to radius $R/2$ (the charge stays uniform). How much work does that take?`,
          [md`$\dfrac{q^2}{8\pi\varepsilon_0R}$, the field energy that now fills $R/2<r<R$`, md`None, since the field outside $R$ is unchanged`, md`$\dfrac{q^2}{16\pi\varepsilon_0R}$`, md`$-\dfrac{q^2}{8\pi\varepsilon_0R}$; the shell gives energy up`], 0,
          [null, md`The field outside $R$ is indeed unchanged, but now there is new field between $R/2$ and $R$, where there was none before.`,
            md`$W(R/2) - W(R) = \dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac2R - \dfrac1R\right)$, not half of that.`,
            md`Pushing like charges closer together costs positive work.`],
          md`$W(R/2)-W(R) = \dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac{2}{R}-\dfrac{1}{R}\right) = \dfrac{q^2}{8\pi\varepsilon_0R}$. In the field picture, the work you do is exactly the energy of the new field in $R/2<r<R$: $\tfrac{\varepsilon_0}{2}\int_{R/2}^R E^2\,4\pi r^2\,dr = \dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac2R - \dfrac1R\right)$.`,
          { figHtml: fSqueeze() }),

        P({
          title: 'A charged shell in numbers',
          q: md`A thin spherical shell of radius $R = 10$ cm carries a charge $q = 1.0\ \mu$C spread uniformly. Use $\dfrac{1}{4\pi\varepsilon_0} = 8.99\times10^{9}$ N m$^2$/C$^2$.`,
          figHtml: shellFig({ lab: 'q' }).svg(),
          hints: [md`$W = \dfrac{q^2}{8\pi\varepsilon_0 R} = \dfrac12\cdot\dfrac{1}{4\pi\varepsilon_0}\cdot\dfrac{q^2}{R}$.`, md`Just outside, $E = \dfrac{q}{4\pi\varepsilon_0R^2}$ and $u = \tfrac{\varepsilon_0}{2}E^2$. You need $\varepsilon_0 = 8.85\times10^{-12}$ F/m.`, md`The fraction of the energy outside radius $r$ is $R/r$.`],
          parts: [
            { lbl: md`(a) $W$`, ans: 44.94, unit: 'mJ' },
            { lbl: md`(b) energy density just outside the shell, in J per cubic metre`, ans: 3.576, unit: '' },
            { lbl: md`(c) fraction of $W$ stored beyond $r = 1$ m`, ans: 0.1, unit: '' },
          ],
          sol: md`
            **(a)** $W = \dfrac12\cdot\dfrac{1}{4\pi\varepsilon_0}\cdot\dfrac{q^2}{R} = \dfrac12\,(8.99\times10^9)\,\dfrac{(10^{-6})^2}{0.10} = 4.49\times10^{-2}$ J $= 44.9$ mJ.

            **(b)** $E = \dfrac{q}{4\pi\varepsilon_0R^2} = (8.99\times10^9)\dfrac{10^{-6}}{0.01} = 8.99\times10^5$ V/m, so $u = \tfrac12(8.85\times10^{-12})(8.99\times10^5)^2 = 3.58$ J/m$^3$. Inside the shell $u = 0$: the energy density jumps across the charged surface, just as $E$ does.

            **(c)** Energy outside $r$ is $\dfrac{q^2}{8\pi\varepsilon_0 r}$, a fraction $R/r = 0.1/1 = 0.1$ of the total.

            **Check:** the energy in a thin layer just outside the shell is $u\cdot4\pi R^2\,dr$, and it must match $-\dfrac{d}{dr}\left(\dfrac{q^2}{8\pi\varepsilon_0 r}\right) = \dfrac{q^2}{8\pi\varepsilon_0R^2} = \dfrac WR$ per unit thickness. Numbers: $W/R = 0.0449/0.10 = 0.449$ J/m, and $4\pi R^2u = 4\pi(0.010\text{ m}^2)(3.58\text{ J/m}^3) = 0.449$ J/m.
          `,
        }),

        P({
          title: 'A uniformly charged ball, two ways',
          q: md`A solid ball of radius $R$ carries charge $q$ spread uniformly through its volume. (a) Find the potential $V(r)$ inside the ball ($r<R$), with $V(\infty) = 0$. (b) Find the energy of the configuration. (c) What fraction of that energy is stored in the field **inside** the ball?`,
          figHtml: fBall(),
          hints: [md`Gauss: $E = \dfrac{qr}{4\pi\varepsilon_0R^3}$ inside, $\dfrac{q}{4\pi\varepsilon_0 r^2}$ outside.`, md`$V(r) = V(R) - \int_R^r E\,dr'$ with $V(R) = \dfrac{q}{4\pi\varepsilon_0R}$.`, md`For (b), either $\tfrac12\int\rho V\,d\tau$ over the ball, or $\tfrac{\varepsilon_0}{2}\int E^2$ inside plus outside. The outside part is the same as for a shell.`],
          parts: [
            { lbl: md`(a) $V(r)$, $r<R$`, expr: 'q/(8*pi*eps0*R)*(3 - r^2/R^2)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [2, 3], r: [0.2, 1.8] }, accepts: ['q*(3*R^2 - r^2)/(8*pi*eps0*R^3)'] },
            { lbl: md`(b) $W$`, expr: '3*q^2/(20*pi*eps0*R)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 3] }, accepts: ['(3/5)*q^2/(4*pi*eps0*R)'] },
            { lbl: md`(c) fraction inside`, ans: 1 / 6, unit: '' },
          ],
          sol: md`
            **(a)** Integrate $E$ in from the surface:

            $$V(r) = \frac{q}{4\pi\varepsilon_0R} - \int_R^r\frac{qr'}{4\pi\varepsilon_0R^3}\,dr' = \frac{q}{4\pi\varepsilon_0R} + \frac{q}{8\pi\varepsilon_0R^3}(R^2-r^2) = \frac{q}{8\pi\varepsilon_0R}\left(3-\frac{r^2}{R^2}\right).$$

            Check: at $r = R$ this is $\dfrac{q}{4\pi\varepsilon_0R}$, and the centre is $\tfrac32$ times higher.

            [[fig:plots]]

            **(b) Method 1:** $\rho = \dfrac{3q}{4\pi R^3}$, and

            $$W = \frac12\int_0^R\rho\,V(r)\,4\pi r^2\,dr = \frac{\rho}{2}\cdot\frac{q}{8\pi\varepsilon_0R}\cdot4\pi\int_0^R\left(3r^2 - \frac{r^4}{R^2}\right)dr = \frac{\rho\,q}{4\varepsilon_0R}\cdot\frac{4R^3}{5} = \frac{3q^2}{20\pi\varepsilon_0R}.$$

            **Method 2:** inside, $\tfrac{\varepsilon_0}{2}\displaystyle\int_0^R\left(\frac{qr}{4\pi\varepsilon_0R^3}\right)^2 4\pi r^2\,dr = \frac{q^2}{8\pi\varepsilon_0R^6}\cdot\frac{R^5}{5} = \frac{q^2}{40\pi\varepsilon_0R}$. Outside, the same as a shell: $\dfrac{q^2}{8\pi\varepsilon_0R}$. Sum: $\dfrac{q^2}{40\pi\varepsilon_0R} + \dfrac{5q^2}{40\pi\varepsilon_0R} = \dfrac{6q^2}{40\pi\varepsilon_0R} = \dfrac{3q^2}{20\pi\varepsilon_0R}$.

            **(c)** $\dfrac{q^2/40}{6q^2/40} = \dfrac16$. Most of the energy is outside even though all the charge is inside.

            **What to remember:** a uniform ball stores $\tfrac35\cdot\dfrac{q^2}{4\pi\varepsilon_0R}$, a shell $\tfrac12\cdot\dfrac{q^2}{4\pi\varepsilon_0R}$. The ball's extra $\tfrac1{10}$ is the field inside it.
          `,
          figs: { plots: Object.assign(plotBall(), { cap: '' }) },
        }),

        Q(md`A uniformly charged solid ball and a uniformly charged thin shell have the same charge $q$ and radius $R$. Which stores more energy?`,
          [md`The shell, because all its charge is at the largest radius`, md`They are equal, because the fields outside are identical`, md`The solid ball, by a factor $6/5$, because it also has field inside`, md`The solid ball, by a factor of 2`], 2,
          [md`Charge at a larger radius is **lower** energy (less crowded). The shell is the low-energy arrangement.`, md`The outside fields are identical, but the ball also has field inside, $E\propto r$, which stores extra energy.`, null, md`The ball's inside field adds $\tfrac{q^2}{40\pi\varepsilon_0R}$, a fifth of the shell's $\tfrac{q^2}{8\pi\varepsilon_0R}$, not a whole extra copy.`],
          md`Outside: identical fields, $\dfrac{q^2}{8\pi\varepsilon_0R}$ each. Inside: zero for the shell, $\dfrac{q^2}{40\pi\varepsilon_0R}$ for the ball. Ratio $\dfrac{3/20}{1/8} = \dfrac65$. This is one way to see why the charge on a conductor goes to its surface: that is the arrangement with the least energy (Lesson 5).`,
          { figHtml: fBallShell() }),

        Q(md`Build the uniform ball (density $\rho$) layer by layer, like a snowball. When its radius is $r$ and its charge is $q(r) = \tfrac43\pi r^3\rho$, you bring a thin layer $dq = 4\pi r^2\rho\,dr$ in from far away and spread it over the surface. The work for that layer is`,
          [md`$\tfrac12\,\dfrac{q(r)\,dq}{4\pi\varepsilon_0 r}$`, md`$\dfrac{q(r)\,dq}{4\pi\varepsilon_0 r}$`, md`$\dfrac{(dq)^2}{8\pi\varepsilon_0 r}$`, md`$\dfrac{q(r)\,dq}{4\pi\varepsilon_0 R}$`], 1,
          [md`No $\tfrac12$: one small charge $dq$ is brought into the fixed field of $q(r)$, and that costs $dq\,V$.`, null,
            md`That is the layer's energy with itself. It is second order in $dq$ and drops out.`,
            md`The layer lands on the **current** surface, radius $r$, where $V = q(r)/(4\pi\varepsilon_0 r)$, not at the final radius $R$.`],
          md`$dW = V(r)\,dq$ with $V(r) = \dfrac{q(r)}{4\pi\varepsilon_0 r}$ at the surface of the partly built ball. Then $W = \displaystyle\int_0^R\frac{\tfrac43\pi r^3\rho\cdot4\pi r^2\rho}{4\pi\varepsilon_0 r}\,dr = \frac{4\pi\rho^2R^5}{15\varepsilon_0} = \frac{3q^2}{20\pi\varepsilon_0R}$ using $\rho = \dfrac{3q}{4\pi R^3}$. A third method, same answer.`,
          { figHtml: fSnow() }),

        P({
          title: 'Density growing with radius',
          q: md`A ball of radius $R$ has charge density $\rho(r) = kr$ ($k$ a constant). Find its total charge and its energy.`,
          figHtml: ballFig({ lab: '\\rho = kr' }).svg(),
          hints: [md`$Q = \int_0^R kr\,4\pi r^2\,dr$.`, md`Gauss inside: $E\cdot4\pi r^2 = \dfrac{1}{\varepsilon_0}\int_0^r kr'\,4\pi r'^2\,dr'$ gives $E = \dfrac{kr^2}{4\varepsilon_0}$.`, md`$W = \tfrac{\varepsilon_0}{2}\int E^2\,d\tau$ inside plus outside; outside it is $\dfrac{Q^2}{8\pi\varepsilon_0R}$.`],
          parts: [
            { lbl: 'Q', expr: 'pi*k*R^4', vars: { k: [0.5, 3], R: [0.5, 2] } },
            { lbl: 'W', expr: 'pi*k^2*R^7/(7*eps0)', vars: { k: [0.5, 3], R: [0.5, 2], eps0: [0.5, 2] } },
          ],
          sol: md`
            **Charge:** $Q = \displaystyle\int_0^R kr\cdot4\pi r^2\,dr = \pi kR^4$.

            **Field:** inside, $E\cdot4\pi r^2 = \pi kr^4/\varepsilon_0$, so $E = \dfrac{kr^2}{4\varepsilon_0}$. Outside, $E = \dfrac{Q}{4\pi\varepsilon_0r^2} = \dfrac{kR^4}{4\varepsilon_0r^2}$. (They agree at $r=R$.)

            **Energy:**

            $$W = \frac{\varepsilon_0}{2}\left[\int_0^R\frac{k^2r^4}{16\varepsilon_0^2}4\pi r^2\,dr + \int_R^\infty\frac{k^2R^8}{16\varepsilon_0^2r^4}4\pi r^2\,dr\right] = \frac{\pi k^2}{8\varepsilon_0}\left[\frac{R^7}{7} + R^7\right] = \frac{\pi k^2R^7}{7\varepsilon_0}.$$

            **Check** with $\tfrac12\int\rho V$: inside, $V(r) = \dfrac{Q}{4\pi\varepsilon_0R} + \displaystyle\int_r^R\frac{kr'^2}{4\varepsilon_0}\,dr' = \dfrac{Q}{4\pi\varepsilon_0R} + \dfrac{k}{12\varepsilon_0}(R^3-r^3)$, and $\tfrac12\displaystyle\int_0^R kr\,V\,4\pi r^2\,dr$ gives the same $\dfrac{\pi k^2R^7}{7\varepsilon_0}$.

            **Sense check.** In terms of $Q$: $W = \dfrac{Q^2}{7\pi\varepsilon_0R} = \dfrac47\cdot\dfrac{Q^2}{4\pi\varepsilon_0 R}$. Compare a shell ($\tfrac12$) and a uniform ball ($\tfrac35$): $\tfrac12<\tfrac47<\tfrac35$. Pushing the charge toward the surface moves the energy toward the shell value.
          `,
        }),

        RF(md`
          !!key Patterns to remember
            - $W = \tfrac12\int\rho V\,d\tau$ over the charge; $W = \tfrac{\varepsilon_0}{2}\int E^2\,d\tau$ over **all** space. Both give the same total.
            - The derivation: $\rho = \varepsilon_0\divg\vb E$, integrate by parts, the surface term dies like $1/r$.
            - Energy density $u = \tfrac{\varepsilon_0}{2}E^2$: no field, no energy.
            - Shell: $\dfrac{q^2}{8\pi\varepsilon_0 R}$, all outside, half within $2R$. Uniform ball: $\dfrac{3q^2}{20\pi\varepsilon_0R}$, one sixth inside.
            - For $\int E^2$ with spherical symmetry: $d\tau = 4\pi r^2\,dr$, and split the integral where $E(r)$ changes form.
            - Building charge up step by step: each step costs $V\,dq$ with no $\tfrac12$.
        `),
      ],
    };
  };

  // ===================================================================================== Lesson 4
  const L4 = () => {
    const fCrossPt = () => {
      const f = PF.fig();
      const A = [50, 130], B = [230, 130], Pp = [150, 46];
      f.charge(...A, { q: '+', lab: 'q_1', at: 'b' });
      f.charge(...B, { q: '+', lab: 'q_2', at: 'b' });
      f.line(A[0] + 8, A[1] - 7, Pp[0] - 4, Pp[1] + 3, { cls: 'dim dash thin' });
      f.line(B[0] - 8, B[1] - 7, Pp[0] + 4, Pp[1] + 3, { cls: 'dim dash thin' });
      const u1 = [Pp[0] - A[0], Pp[1] - A[1]], L1n = Math.hypot(...u1), u2 = [Pp[0] - B[0], Pp[1] - B[1]], L2n = Math.hypot(...u2);
      const e1 = [Pp[0] + 50 * u1[0] / L1n, Pp[1] + 50 * u1[1] / L1n], e2 = [Pp[0] + 50 * u2[0] / L2n, Pp[1] + 50 * u2[1] / L2n];
      f.arrow(Pp[0], Pp[1], e1[0], e1[1]); f.arrow(Pp[0], Pp[1], e2[0], e2[1]);
      f.tag(e1[0], e1[1], md`\vb E_1`, 'r', 6); f.tag(e2[0], e2[1], md`\vb E_2`, 'l', 6);
      f.dot(...Pp, 3); f.tag(Pp[0], Pp[1], 'P', 'b', 8);
      return f.svg();
    };
    const fThales = () => {
      const f = PF.fig(), A = [80, 100], B = [220, 100];
      f.circle(150, 100, 70, { cls: 'dash dim' });
      f.charge(...A, { q: '+', lab: '+q', at: 'l' });
      f.charge(...B, { q: '-', lab: '-q', at: 'r' });
      f.label(150, 100, '\\vb E_1\\cdot\\vb E_2>0', 'c', 'small');
      f.label(150, 194, '\\vb E_1\\cdot\\vb E_2<0 \\text{ outside the dashed sphere}', 'c', 'small');
      return f.svg();
    };
    const fTwoSph = () => {
      const f = PF.fig();
      for (const cx of [60, 280]) { f.circle(cx, 70, 32); signsAt(f, circ(cx, 70, 32), cx, 70, [0, 60, 120, 180, 240, 300], 1, -8, false); }
      f.line(60, 112, 60, 136, { cls: 'dim thin' }); f.line(280, 112, 280, 136, { cls: 'dim thin' });
      f.dim(60, 136, 280, 136, 'd\\to\\infty', { at: 'b' });
      f.label(60, 22, 'q_1', 'b'); f.label(280, 22, 'q_2', 'b');
      return f.svg();
    };
    const fQinShell = () => {
      const f = PF.fig(), cx = 110, cy = 100, R = 60;
      f.circle(cx, cy, R);
      signsAt(f, circ(cx, cy, R), cx, cy, [0, 45, 90, 135, 180, 225, 270], 1, -9, false);
      f.charge(cx, cy, { q: '+', lab: 'q', at: 'b' });
      const ang = -30 * DEG;
      f.line(cx + 9 * Math.cos(ang), cy - 9 * Math.sin(ang), cx + R * Math.cos(ang), cy - R * Math.sin(ang), { cls: 'dim thin' });
      f.label(cx + 36 * Math.cos(ang) + 6, cy - 36 * Math.sin(ang) - 9, 'R', 'c', 'small');
      f.label(cx + (R + 30) * Math.cos(66 * DEG), cy - (R + 30) * Math.sin(66 * DEG), 'Q', 'c');
      return f.svg();
    };
    const fPairPM = () => {
      const f = PF.fig(), A = [50, 70], B = [250, 70], Pp = [150, 70];
      f.line(A[0] + 9, A[1], B[0] - 9, B[1], { cls: 'dim dash thin' });
      f.charge(...A, { q: '+', lab: '+q', at: 't' });
      f.charge(...B, { q: '-', lab: '-q', at: 't' });
      f.dot(...Pp, 3); f.tag(Pp[0], Pp[1], 'P', 't', 8);
      f.arrow(Pp[0] - 10, Pp[1] + 18, Pp[0] + 34, Pp[1] + 18); f.tag(Pp[0] + 34, Pp[1] + 18, md`\vb E_1`, 'r', 5);
      f.arrow(Pp[0] - 10, Pp[1] + 38, Pp[0] + 34, Pp[1] + 38, { cls: 'dash' }); f.tag(Pp[0] + 34, Pp[1] + 38, md`\vb E_2`, 'r', 5);
      return f.svg();
    };
    const fShells = (s2) => {
      const f = PF.fig(), cx = 120, cy = 110, a = 40, b = 88;
      f.circle(cx, cy, a); f.circle(cx, cy, b);
      signsAt(f, circ(cx, cy, a), cx, cy, [60, 110, 200, 250], 1, -8, false);
      signsAt(f, circ(cx, cy, b), cx, cy, [10, 60, 110, 160, 210, 260, 310], s2, -9, false);
      f.dot(cx, cy, 2.2);
      const ang = -35 * DEG;
      f.line(cx, cy, cx + a * Math.cos(ang), cy - a * Math.sin(ang), { cls: 'dim thin' });
      f.label(cx + 20 * Math.cos(ang) + 5, cy - 20 * Math.sin(ang) - 9, 'a', 'c', 'small');
      const ang2 = 150 * DEG;
      f.line(cx, cy, cx + b * Math.cos(ang2), cy - b * Math.sin(ang2), { cls: 'dim thin' });
      f.label(cx + 64 * Math.cos(ang2) - 2, cy - 64 * Math.sin(ang2) - 10, 'b', 'c', 'small');
      f.label(cx + a + 30, cy - 16, s2 > 0 ? '+q' : '+q', 'c', 'small');
      f.label(cx + b + 22, cy + 30, s2 > 0 ? '+q' : '-q', 'l', 'small');
      return f.svg();
    };
    const plotShellsE = () => PF.plot({ w: 300, h: 170, x: [0, 4], y: [0, 1.3], xl: 'r', yl: 'E', xt: [[1, 'a'], [2.5, 'b']],
      curves: [{ f: () => 0, from: 0, to: 0.995 }, { f: (r) => 1 / (r * r), from: 1, to: 2.5 }, { f: () => 0, from: 2.505, to: 4 }] });
    const plotSelf = () => PF.plot({ w: 300, h: 180, x: [0, 4], y: [0, 5], xl: 'r', yl: '\\text{energy outside } r', xt: [[1, '1'], [2, '2'], [3, '3']], yt: [[1, '1'], [4, '4']],
      curves: [{ f: (r) => 1 / r, from: 0.2, to: 4 }] });
    const fInter = () => {
      const g = PF.fig(), O = [60, 170], Q2 = [60, 50], Pp = [190, 110];
      g.line(60, 200, 60, 20, { cls: 'dim', arrow: 'end', hs: 6 }); g.label(66, 18, 'z', 'l', 'small accent');
      g.charge(...O, { q: '+', lab: 'q_1', at: 'l' });
      g.charge(...Q2, { q: '+', lab: 'q_2', at: 'l' });
      g.line(O[0] + 7, O[1] - 3, Pp[0], Pp[1], { cls: 'thin' });
      g.line(Q2[0] + 7, Q2[1] + 3, Pp[0], Pp[1], { cls: 'thin' });
      g.dot(...Pp, 3); g.tag(Pp[0], Pp[1], 'P', 'r', 7);
      g.label(132, 152, 'r', 'c', 'small');
      g.label(132, 70, md`\srm`, 'c', 'small');
      g.angle(O[0], O[1], 30, 25, 90, '');
      g.label(O[0] + 44 * Math.cos(57.5 * DEG), O[1] - 44 * Math.sin(57.5 * DEG), '\\theta', 'c', 'small');
      g.dim(12, 50, 12, 170, 'a', { at: 'l' });
      return g.svg();
    };

    return {
      id: 'u3-energy-comments', title: 'Energy does not superpose; self-energy',
      steps: [
        RF(md`
          ### Energy is quadratic, so it does not superpose

          Lecture 7 opens with a warning: the energy does **not** obey the superposition principle, because it is quadratic in the field. If $\vb E = \vb E_1 + \vb E_2$,

          $$W_{\text{tot}} = \frac{\varepsilon_0}{2}\int(\vb E_1+\vb E_2)^2\,d\tau = \frac{\varepsilon_0}{2}\int\left(E_1^2 + E_2^2 + 2\,\vb E_1\cdot\vb E_2\right)d\tau = W_1 + W_2 + \varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau .$$

          The **cross term** $\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$ is the interaction energy of the two distributions. It is positive where the fields point the same way and negative where they oppose, and its total can have either sign. The fields superpose; the energies do not.

          [[fig:cross]]

          A quick consequence: doubling every charge doubles $\vb E$ and **quadruples** $W$.
        `, { cross: { svg: fCrossPt(), cap: 'At each point the cross term picks up $\\varepsilon_0\\,\\vb E_1\\cdot\\vb E_2$, which depends on the angle between the two fields.' } }),

        Q(md`A charge distribution $\rho$ has energy $W_0$. You put an identical copy on top of it, so the density everywhere becomes $2\rho$. The new energy is`,
          [md`$2W_0$`, md`$W_0$`, md`$\sqrt2\,W_0$`, md`$4W_0$`], 3,
          [md`That forgets the cross term. Here $\vb E_1 = \vb E_2$, so $\varepsilon_0\int\vb E_1\cdot\vb E_2 = 2W_0$, and the total is $W_0 + W_0 + 2W_0$.`, md`The field doubles, so the energy can't stay the same.`, md`$W\propto E^2$, and $E$ doubles: the factor is $2^2$.`, null],
          md`$E\to2E$ everywhere, so $W\to4W_0$. In the language of the cross term: $W_1 + W_2 + \varepsilon_0\int\vb E_1\cdot\vb E_2 = W_0+W_0+2W_0$. Energies add only when the cross term vanishes.`,
          { nofig: 'Scaling argument; no particular geometry.' }),

        Q(md`Configuration 1 has energy $W_0$. Configuration 2 is the same with every charge's sign flipped, so it also has energy $W_0$. Superposed, they cancel everywhere. What is the cross term $\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$?`,
          [md`$0$`, md`$-2W_0$`, md`$-W_0$`, md`$+2W_0$`], 1,
          [md`Then the total would be $2W_0$, but the superposed configuration has no charge and no field, so its energy is 0.`, null, md`$W_0 + W_0 - W_0 = W_0\neq0$.`, md`With $\vb E_2 = -\vb E_1$ the integrand is $-E_1^2$, negative everywhere.`],
          md`The total is zero (no field), so $0 = W_0 + W_0 + \text{cross}$, giving $\text{cross} = -2W_0$. Directly: $\vb E_2 = -\vb E_1$, so $\varepsilon_0\int\vb E_1\cdot\vb E_2 = -\varepsilon_0\int E_1^2 = -2W_0$.`,
          { nofig: 'Abstract superposition; no particular geometry.' }),

        Q(md`Two point charges $q_1$, $q_2$ sit a distance $a$ apart. In $W = W_1 + W_2 + \varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$, which piece equals $\dfrac{q_1q_2}{4\pi\varepsilon_0 a}$, the pair energy from the point-charge lesson?`,
          [md`The cross term $\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$`, md`$W_1$`, md`$W_1 + W_2$`, md`None: the field method cannot reproduce the pair energy`], 0,
          [null, md`$W_1 = \tfrac{\varepsilon_0}{2}\int E_1^2$ is the energy of $q_1$'s own field: its (infinite) self-energy.`, md`The two self-energies are infinite, and neither depends on $a$.`, md`It can: the cross term is finite and works out to exactly the pair energy (practice problem below).`],
          md`$W_1$ and $W_2$ are the self-energies, independent of where the charges are. Only the cross term depends on the separation, and it equals $\dfrac{q_1q_2}{4\pi\varepsilon_0a}$. So "the energy of a configuration of point charges" in the pairwise formula is precisely the sum of all cross terms.`,
          { figHtml: fCrossPt() }),

        Q(md`For $+q$ and $-q$, the cross term $\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau = -\dfrac{q^2}{4\pi\varepsilon_0 a}$ is negative. Yet on the segment between the charges, $\vb E_1$ and $\vb E_2$ point the same way. How is the total negative?`,
          [md`It isn't; the cross term for $\pm q$ is positive`, md`The integrand is negative only at the two charges themselves`, md`$\vb E_1\cdot\vb E_2$ is positive only inside the sphere having the segment as a diameter, and negative in all the space outside it, which wins`, md`The cross term is negative because $W_1$ and $W_2$ are infinite`], 2,
          [md`The pair energy of opposite charges is negative, and the cross term equals the pair energy.`, md`Points, by themselves, carry no volume. The sign is decided over regions of space.`, null, md`The self-energies are separate terms; they don't change the sign of the cross term.`],
          md`
            $\vb E_1$ points away from $+q$, $\vb E_2$ points toward $-q$. At a point $P$ they make an acute angle (positive product) exactly when the angle $q_1Pq_2$ is obtuse, i.e. when $P$ is inside the sphere that has the segment as a diameter (Thales). Everywhere outside, the product is negative, and that region is much bigger.

            [[fig:th]]
          `,
          { figHtml: fPairPM(), figs: { th: { svg: fThales(), cap: 'The sign of $\\vb E_1\\cdot\\vb E_2$ for $+q$ and $-q$: positive only inside the dashed sphere.' } } }),

        Q(md`Two charged spheres, each with energy $W_0$ on its own, are moved very far apart from each other. The total energy approaches`,
          [md`$4W_0$, since energy is quadratic`, md`$2W_0$: the cross term, $\dfrac{q_1q_2}{4\pi\varepsilon_0 d}$, dies away as $d\to\infty$`, md`$0$`, md`$\sqrt2\,W_0$`], 1,
          [md`$4W_0$ is for two **identical** configurations superposed on top of each other. Far apart, the fields hardly overlap.`, null, md`Each sphere keeps its own field energy; nothing cancels.`, md`Energies don't combine like that. The total is $W_1+W_2$ plus a cross term.`],
          md`For spheres far apart the cross term is just the interaction energy $\dfrac{q_1q_2}{4\pi\varepsilon_0d}$, which vanishes as $d\to\infty$. Energies add only when the fields don't overlap. That's why "the energy of a configuration" really means "relative to its parts infinitely far apart".`,
          { figHtml: fTwoSph() }),

        Q(md`A point charge $q$ sits at the centre of a thin shell of radius $R$ that carries charge $Q$. The cross term $\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$ is`,
          [md`$0$, since the shell's field is zero where $q$ is`, md`infinite, since $q$ is a point charge`, md`$\dfrac{qQ}{4\pi\varepsilon_0R}$`, md`$\dfrac{qQ}{8\pi\varepsilon_0R}$`], 2,
          [md`The shell's field is zero **inside**, but outside the shell both fields are nonzero and parallel, and that region contributes.`, md`$q$'s infinite self-energy sits in $W_1$, not in the cross term. The cross term only gets contributions from $r>R$, where everything is finite.`, null, md`There is no $\tfrac12$ in the cross term: $W = W_1 + W_2 + \varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$.`],
          md`$\vb E_2 = 0$ inside the shell, so only $r>R$ counts: $\varepsilon_0\displaystyle\int_R^\infty\frac{q}{4\pi\varepsilon_0r^2}\cdot\frac{Q}{4\pi\varepsilon_0r^2}\,4\pi r^2\,dr = \frac{qQ}{4\pi\varepsilon_0R}$. That's $q$ times the shell's potential at the centre: the work to bring $q$ in, just as the pairwise picture says.`,
          { figHtml: fQinShell() }),

        Q(md`At a point where $\vb E_1\perp\vb E_2$, the energy density $\tfrac{\varepsilon_0}{2}\lvert\vb E_1+\vb E_2\rvert^2$ equals`,
          [md`$\tfrac{\varepsilon_0}{2}(E_1+E_2)^2$`, md`$0$`, md`$\varepsilon_0E_1E_2$`, md`$\tfrac{\varepsilon_0}{2}(E_1^2+E_2^2)$, the two separate densities added`], 3,
          [md`That would need $\vb E_1\parallel\vb E_2$.`, md`Perpendicular fields don't cancel; the total has magnitude $\sqrt{E_1^2+E_2^2}$.`, md`That's the cross term's integrand for **parallel** fields.`, null],
          md`$\lvert\vb E_1+\vb E_2\rvert^2 = E_1^2+E_2^2+2\,\vb E_1\cdot\vb E_2$, and the dot product vanishes for perpendicular fields. Locally, energy densities add only where the fields are perpendicular (or one is zero); the cross term keeps the books everywhere else.`,
          { nofig: 'A pointwise identity; no geometry.' }),

        RF(md`
          ### A perplexing "inconsistency": self-energy

          $\tfrac{\varepsilon_0}{2}\int E^2\,d\tau$ can never be negative. But the pairwise formula gives $-\dfrac{q^2}{4\pi\varepsilon_0 r}$ for $+q$ and $-q$ a distance $r$ apart. Which is right? Both. They answer different questions.

          The pairwise formula $\tfrac12\sum q_iV(\vb r_i)$ counts the work to bring **ready-made** point charges together. The field formula also counts the work to **make** each point charge, and for a point charge that is infinite:

          $$W_{\text{self}} = \frac{\varepsilon_0}{2}\int\left(\frac{q}{4\pi\varepsilon_0r^2}\right)^2 4\pi r^2\,dr = \frac{q^2}{8\pi\varepsilon_0}\int_0^\infty\frac{dr}{r^2} = \infty .$$

          [[fig:self]]

          Where did the derivation slip? Between $\tfrac12\sum q_iV(\vb r_i)$ (with $V$ from the **other** charges) and $\tfrac12\int\rho V\,d\tau$ (with the **full** $V$). For a smooth $\rho$ there is no difference. For point charges, the full $V$ includes each charge's own infinite potential. So for point charges use the discrete sum.

          In practice electrons come ready-made; we only move them around. Their self-energies never change, so every **change** in energy is a change in the pairwise (interaction) sum.

          | formula | includes self-energy? | sign |
          |---|---|---|
          | $\dfrac{1}{4\pi\varepsilon_0}\sum_{i<j}\dfrac{q_iq_j}{\srm_{ij}} = \tfrac12\sum_i q_iV(\vb r_i)$ | no | either sign |
          | $\tfrac12\int\rho V\,d\tau$ (smooth $\rho$) | yes, finite | never negative |
          | $\tfrac{\varepsilon_0}{2}\int E^2\,d\tau$ | yes | never negative |

          **Where is the energy stored?** $\tfrac12\int\rho V$ says "on the charge"; $\tfrac{\varepsilon_0}{2}\int E^2$ says "in the field". In electrostatics this is bookkeeping: both give the same total. (In radiation theory it is useful to regard the energy as stored in the field.)
        `, { self: { svg: plotSelf(), cap: 'Field energy of a point charge stored outside radius $r$: $q^2/(8\\pi\\varepsilon_0 r)$, plotted with $q^2/8\\pi\\varepsilon_0 = 1$. It diverges as $r\\to0$.' } }),

        Q(md`A charge $+q$ and a charge $-q$ are a distance $r$ apart. What does $\tfrac{\varepsilon_0}{2}\int_{\text{all space}}E^2\,d\tau$ give for this configuration?`,
          [md`$-\dfrac{q^2}{4\pi\varepsilon_0 r}$`, md`$+\dfrac{q^2}{4\pi\varepsilon_0 r}$`, md`$+\infty$`, md`$0$, because the net charge is zero`], 2,
          [md`That's the pairwise result. The field integral can never be negative.`, md`The integrand $E^2$ diverges like $1/r^4$ near each point charge, and $\int r^{-4}\,r^2\,dr$ diverges at $0$.`, null, md`Zero net charge only makes the far field fall off faster. Near each charge $E^2$ still blows up.`],
          md`The field integral includes each charge's self-energy, $\tfrac{q^2}{8\pi\varepsilon_0}\int_0^\infty dr/r^2 = \infty$. The finite, negative interaction energy rides on top of two infinite positive self-energies. That's why the pairwise formula is the useful one for point charges.`,
          { nofig: 'Two point charges; the question is about the formula.' }),

        Q(md`You slowly move two point charges from separation $a$ to separation $2a$. The change in $\tfrac{\varepsilon_0}{2}\int E^2\,d\tau$ is`,
          [md`infinite, since the field energy of point charges is infinite`, md`$\dfrac{q_1q_2}{4\pi\varepsilon_0}\left(\dfrac{1}{2a}-\dfrac1a\right)$, the change in the pair energy`, md`zero: rearranging charges cannot change the field energy`, md`twice the change in the pair energy`], 1,
          [md`The self-energies are infinite but **unchanged**; they cancel in the difference.`, null, md`The cross term depends on the separation, so the field energy changes.`, md`The pairwise sum already counts each pair once; it equals the cross term exactly.`],
          md`$W = W_1 + W_2 + \varepsilon_0\int\vb E_1\cdot\vb E_2$. $W_1$ and $W_2$ (infinite) don't depend on the positions, so they drop out of any change. The cross term is $\dfrac{q_1q_2}{4\pi\varepsilon_0\,(\text{separation})}$. So $\Delta W = \dfrac{q_1q_2}{4\pi\varepsilon_0}\left(\dfrac{1}{2a}-\dfrac1a\right)$, the same as the pairwise formula. This is the work you do (negative for like charges: they push apart on their own).`,
          { nofig: 'Two point charges moved apart; no figure needed.' }),

        Q(md`For a uniformly charged shell, $\tfrac12\int\sigma V\,da$ puts the energy "on the charge" while $\tfrac{\varepsilon_0}{2}\int E^2$ puts it "in the field outside". In electrostatics, which is correct?`,
          [md`Only the field picture; the charge picture double counts`, md`Only the charge picture; fields are a mathematical device`, md`Neither; the two give different totals`, md`Both give the same total; where it "is" is bookkeeping`], 3,
          [md`Both give $\dfrac{q^2}{8\pi\varepsilon_0R}$ for the shell. There's no double counting.`, md`Both give the same total; in electrostatics you can't tell them apart.`, md`They give the same total for any smooth distribution (that's how $\int E^2$ was derived).`, null],
          md`Griffiths: in electrostatics it is "simply an unanswerable question" where the energy is located. The total is unambiguous. When fields carry energy away (radiation), the field picture becomes the useful one.`,
          { figHtml: shellFig({ lab: '\\sigma' }).svg() }),

        RF(md`
          ### Worked example: two concentric shells, both ways

          A thin shell of radius $a$ carries $+q$; a concentric shell of radius $b>a$ carries $-q$ (both uniform). Find the energy.

          [[fig:setup]]

          **Method 1: field energy.** By Gauss, $E = 0$ for $r<a$ (no charge inside), $E = \dfrac{q}{4\pi\varepsilon_0r^2}$ for $a<r<b$, and $E = 0$ for $r>b$ (enclosed charge $q - q = 0$):

          [[fig:E]]

          $$W = \frac{\varepsilon_0}{2}\int_a^b\left(\frac{q}{4\pi\varepsilon_0r^2}\right)^2 4\pi r^2\,dr = \frac{q^2}{8\pi\varepsilon_0}\left(\frac1a - \frac1b\right).$$

          **Method 2: superposition with the cross term.** Each shell alone: $W_1 = \dfrac{q^2}{8\pi\varepsilon_0 a}$, $W_2 = \dfrac{q^2}{8\pi\varepsilon_0 b}$. The cross term only gets contributions where **both** fields are nonzero, $r>b$ (shell 2's field vanishes inside it), and there the two fields are opposite:

          $$\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau = \varepsilon_0\int_b^\infty\frac{q}{4\pi\varepsilon_0r^2}\cdot\frac{-q}{4\pi\varepsilon_0r^2}\,4\pi r^2\,dr = -\frac{q^2}{4\pi\varepsilon_0 b}.$$

          Total: $\dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac1a + \dfrac1b - \dfrac2b\right) = \dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac1a - \dfrac1b\right)$. The same.

          **Checks.** $b\to a$: the shells cancel and $W\to0$. $b\to\infty$: $W\to\dfrac{q^2}{8\pi\varepsilon_0a}$, the lone inner shell. (This is also a spherical capacitor storing $\tfrac{Q^2}{2C}$; Lesson 8.)
        `, { setup: { svg: fShells(-1), cap: 'Inner shell $+q$ at radius $a$, outer shell $-q$ at radius $b$.' }, E: { svg: plotShellsE(), cap: 'The field lives only between the shells.' } }),

        P({
          title: 'Two shells with the same sign',
          q: md`Now both shells carry $+q$: the inner one (radius $a$) and the outer one (radius $b$). Find the self-energies of each, the cross term, and the total energy.`,
          figHtml: fShells(1),
          hints: [md`Each shell alone: $\dfrac{q^2}{8\pi\varepsilon_0 R}$ with its own radius.`, md`The cross term gets contributions only where both fields are nonzero ($r>b$). There they point the same way.`, md`Check by doing the total directly: $E = q/(4\pi\varepsilon_0 r^2)$ between the shells and $2q/(4\pi\varepsilon_0 r^2)$ outside.`],
          parts: [
            { lbl: md`cross term $\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$`, expr: 'q^2/(4*pi*eps0*b)', vars: { q: [0.5, 3], eps0: [0.5, 2], b: [2, 4] } },
            { lbl: 'W', expr: 'q^2/(8*pi*eps0)*(1/a + 3/b)', vars: { q: [0.5, 3], eps0: [0.5, 2], a: [0.5, 1.5], b: [2, 4] }, accepts: ['q^2*(b+3*a)/(8*pi*eps0*a*b)'] },
          ],
          sol: md`
            **Self-energies:** $W_1 = \dfrac{q^2}{8\pi\varepsilon_0a}$, $W_2 = \dfrac{q^2}{8\pi\varepsilon_0b}$.

            **Cross term:** only $r>b$ contributes, and both fields are $+\dfrac{q}{4\pi\varepsilon_0r^2}\uv r$:

            $$\varepsilon_0\int_b^\infty\left(\frac{q}{4\pi\varepsilon_0r^2}\right)^2 4\pi r^2\,dr = \frac{q^2}{4\pi\varepsilon_0b}.$$

            **Total:** $\dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac1a + \dfrac1b + \dfrac2b\right) = \dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac1a+\dfrac3b\right)$.

            **Direct check:** between the shells $E = \dfrac{q}{4\pi\varepsilon_0r^2}$, worth $\dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac1a-\dfrac1b\right)$; outside, the enclosed charge is $2q$, worth $\dfrac{(2q)^2}{8\pi\varepsilon_0b}$. Sum: $\dfrac{q^2}{8\pi\varepsilon_0}\left(\dfrac1a - \dfrac1b + \dfrac4b\right)$. Same.

            Note that $W\neq W_1+W_2$: the cross term here is positive (fields add outside $b$).
          `,
        }),

        P({
          title: 'The interaction energy from the fields',
          q: md`Put $q_1$ at the origin and $q_2$ on the $z$ axis at $z = a$. Compute the interaction energy $\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$ directly, using spherical coordinates centred on $q_1$, and show it equals the pair energy.`,
          figHtml: fInter(),
          hints: [md`$\vb E_1 = \dfrac{q_1}{4\pi\varepsilon_0}\dfrac{\uv r}{r^2}$ and $\vb E_2 = \dfrac{q_2}{4\pi\varepsilon_0}\dfrac{\vb r - a\uv z}{\srm^3}$ with $\srm^2 = r^2 + a^2 - 2ra\cos\theta$.`, md`$\uv r\cdot(\vb r - a\uv z) = r - a\cos\theta$. Do the $r$ integral first.`, md`$\dfrac{r - a\cos\theta}{\srm^3} = -\dfrac{\partial}{\partial r}\left(\dfrac1{\srm}\right)$, so $\displaystyle\int_0^\infty\frac{r-a\cos\theta}{\srm^3}\,dr = \frac1a$ for every $\theta$.`],
          parts: [
            { lbl: md`$\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$`, expr: 'q1*q2/(4*pi*eps0*a)', vars: { q1: [0.5, 3], q2: [0.5, 3], eps0: [0.5, 2], a: [0.5, 3] } },
            { lbl: md`The $r$ integral $\int_0^\infty\frac{r-a\cos\theta}{\srm^3}\,dr$ equals`, mc: [md`$\dfrac1a$, for every $\theta$`, md`$\dfrac{\cos\theta}{a}$`, md`$0$`, md`$\dfrac{2}{a}$`], a: 0,
              why: [null, md`Evaluate $\left[-1/\srm\right]_0^\infty$: at $r=0$, $\srm = a$ for any $\theta$, and at $\infty$ it vanishes.`, md`Only if the two limits gave the same value; they give $0$ and $-1/a$.`, md`The factor 2 comes later, from the $\theta$ integral $\int_0^\pi\sin\theta\,d\theta$.`] },
          ],
          sol: md`
            $$\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau = \frac{q_1q_2}{16\pi^2\varepsilon_0}\int\frac{r - a\cos\theta}{r^2\,\srm^3}\,r^2\sin\theta\,dr\,d\theta\,d\phi = \frac{q_1q_2}{16\pi^2\varepsilon_0}\cdot2\pi\int_0^\pi\sin\theta\left[\int_0^\infty\frac{r-a\cos\theta}{\srm^3}\,dr\right]d\theta .$$

            Since $\dfrac{\partial\srm}{\partial r} = \dfrac{r - a\cos\theta}{\srm}$, the bracket is $\left[-\dfrac{1}{\srm}\right]_{r=0}^{\infty} = 0 - \left(-\dfrac1a\right) = \dfrac1a$. Then $\int_0^\pi\sin\theta\,d\theta = 2$:

            $$\varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau = \frac{q_1q_2}{16\pi^2\varepsilon_0}\cdot2\pi\cdot\frac2a = \frac{q_1q_2}{4\pi\varepsilon_0a}.$$

            Exactly the pair energy. The field picture and the pairwise picture agree on everything except the (constant, infinite) self-energies.
          `,
        }),

        RF(md`
          !!key Patterns to remember
            - Fields superpose; energies don't: $W = W_1 + W_2 + \varepsilon_0\int\vb E_1\cdot\vb E_2\,d\tau$.
            - The cross term is the interaction energy. For two point charges it is $\dfrac{q_1q_2}{4\pi\varepsilon_0a}$.
            - Scale all charges by $\lambda$: $W$ scales by $\lambda^2$.
            - Point charges have infinite self-energy. $\tfrac{\varepsilon_0}{2}\int E^2$ includes it (never negative); the pairwise sum leaves it out (either sign). Energy **changes** are the same in both.
            - Cross terms vanish wherever either field is zero: for nested shells, only the region outside both contributes.
        `),
      ],
    };
  };

  // ===================================================================================== shared conductor drawings
  // exact field lines of a conducting sphere (radius R px) in a uniform field along +x, centred at (cx, cy)
  function sphereInField(f, cx, cy, R, L, starts) {
    const E = (x, y) => { const r2 = x * x + y * y, r5 = Math.pow(r2, 2.5), R3 = R * R * R; return [1 + R3 * (2 * x * x - y * y) / r5, 3 * R3 * x * y / r5]; };
    const S = ([x, y]) => [cx + x, cy - y];
    for (const y0 of starts) {
      let x = -L, y = y0, hit = false;
      const pts = [[x, y]];
      for (let k = 0; k < 3000; k++) {
        const [ex, ey] = E(x, y), m = Math.hypot(ex, ey);
        x += 1.5 * ex / m; y += 1.5 * ey / m;
        if (x * x + y * y < R * R) { const rr = Math.hypot(x, y); pts.push([x * R / rr, y * R / rr]); hit = true; break; }
        pts.push([x, y]);
        if (x > L) break;
      }
      const sp = pts.map(S);
      f.pl(sp, { cls: 'thin' }); headOn(f, sp, hit ? 0.35 : 0.2, { hs: 5 });
      if (hit) { const mp = pts.map(([u, v]) => S([-u, v])).reverse(); f.pl(mp, { cls: 'thin' }); headOn(f, mp, 0.7, { hs: 5 }); }
      else headOn(f, sp, 0.85, { hs: 5 });
    }
    return f;
  }
  // battery symbol between (x, y-h) and (x, y+h): long plate at x (+), short plate at x + 9 (-)
  function battery(f, x, y) {
    f.line(x, y - 15, x, y + 15, { cls: 'thick' });
    f.line(x + 9, y - 8, x + 9, y + 8, { cls: 'thick' });
    return f;
  }

  // ===================================================================================== Lesson 5
  const L5 = () => {
    const fBlock = () => {
      const f = PF.fig();
      metal(f, [[[80, 30], [180, 30], [180, 120], [80, 120]]]);
      for (const y of [45, 75, 105]) { f.arrow(0, y, 60, y); f.arrow(200, y, 260, y); }
      f.label(30, 28, md`\vb E_0`, 'c');
      f.label(130, 136, '\\text{neutral metal block}', 't', 'small');
      return f.svg();
    };
    const fSlab = () => {
      const f = PF.fig(), x0 = 80, x1 = 200;
      metal(f, [[[x0, 30], [x1, 30], [x1, 130], [x0, 130]]]);
      for (const y of [45, 80, 115]) { f.arrow(0, y, 60, y); f.arrow(220, y, 280, y); }
      f.label(30, 28, md`\vb E_0`, 'c');
      for (const y of [40, 60, 80, 100, 120]) { glyph(f, x0 + 9, y, -1, 3.3, true); glyph(f, x1 - 9, y, 1, 3.3, true); }
      for (const y of [55, 105]) f.arrow(170, y, 110, y, { cls: 'dash' });
      f.line(140, 107, 140, 146, { cls: 'dim thin' });
      f.label(140, 150, md`\vb E_1\ \text{(induced; inside, } \vb E_0+\vb E_1=0)`, 't', 'small');
      return f.svg();
    };
    const fSph = () => {
      const f = PF.fig(), cx = 160, cy = 110, R = 46;
      sphereInField(f, cx, cy, R, 150, [-96, -74, -52, -30, -10, 10, 30, 52, 74, 96]);
      metal(f, [circ(cx, cy, R)]);
      signsAt(f, circ(cx, cy, R), cx, cy, [130, 155, 180, 205, 230], -1, 8, true);
      signsAt(f, circ(cx, cy, R), cx, cy, [50, 25, 0, -25, -50], 1, 8, true);
      f.label(8, cy - 122, md`\vb E_0`, 'l');
      return f.svg();
    };
    const fScreen = () => {
      const f = PF.fig(), cx = 110, cy = 100;
      const pts = shape(cx, cy, 72, 84, { h: [[2, 0.06, 20], [3, 0.07, 60], [5, 0.03, 0]] });
      metal(f, [pts]);
      signsAt(f, pts, cx, cy, [10, 50, 90, 130, 170, 210, 250, 290, 330], 1, 8, true);
      f.charge(cx, cy, { q: '+' });
      for (let k = 0; k < 8; k++) { const a = (k * 45 + 22.5) * DEG; glyph(f, cx + 18 * Math.cos(a), cy - 18 * Math.sin(a), -1, 3, true); }
      f.line(cx + 8, cy + 4, cx + 110, cy + 52, { cls: 'dim thin' });
      f.label(cx + 114, cy + 52, '+q', 'l');
      return f.svg();
    };
    const fGauss = () => {
      const f = PF.fig(), cx = 110, cy = 100, R = 66;
      metal(f, [circ(cx, cy, R)]);
      signsAt(f, circ(cx, cy, R), cx, cy, [10, 50, 90, 130, 170, 210, 250, 290], 1, 7, true);
      f.circle(cx, cy, 50, { cls: 'dash' });
      const a = -35 * DEG;
      f.line(cx + 50 * Math.cos(a), cy - 50 * Math.sin(a), cx + 120, cy + 74, { cls: 'dim thin' });
      f.label(cx + 124, cy + 74, '\\text{Gaussian surface}', 'l', 'small');
      f.label(cx, cy - R - 12, 'Q', 'b');
      return f.svg();
    };
    const fEqp = () => {
      const f = PF.fig(), cx = 140, cy = 90;
      const pts = shape(cx, cy, 112, 54, { h: [[2, 0.08, 0], [3, 0.1, 270], [4, 0.04, 0]] });
      metal(f, [pts]);
      const A0 = pts[at(pts, cx, cy, 150)], B0 = pts[at(pts, cx, cy, 30)], Cp = [cx, cy + 46];
      const path = [];
      for (let k = 0; k <= 80; k++) {
        const t = k / 80, u = 1 - t;
        path.push([u * u * A0[0] + 2 * t * u * Cp[0] + t * t * B0[0], u * u * A0[1] + 2 * t * u * Cp[1] + t * t * B0[1] + 7 * Math.sin(4 * Math.PI * t) * Math.sin(Math.PI * t)]);
      }
      f.pl(path, { cls: 'thick' }); headOn(f, path, 0.5);
      const A = path[0], B = path[path.length - 1];
      f.dot(...A, 3.2); f.tag(A[0], A[1], 'a', 't', 8);
      f.dot(...B, 3.2); f.tag(B[0], B[1], 'b', 't', 8);
      return f.svg();
    };
    const fPerpA = () => {
      const f = PF.fig(), cx = 110, cy = 95;
      const pts = shape(cx, cy, 70, 48, { rot: 15, h: [[3, 0.1, 30], [2, 0.08, 0]] });
      metal(f, [pts]);
      for (let a = 15; a < 360; a += 30) { const i = at(pts, cx, cy, a), [nx, ny] = nrm(pts, i), p = pts[i]; f.arrow(p[0] + nx * 3, p[1] + ny * 3, p[0] + nx * 24, p[1] + ny * 24, { hs: 5 }); }
      signsAt(f, pts, cx, cy, [0, 60, 120, 180, 240, 300], 1, 8, true);
      const i = at(pts, cx, cy, 105), [nx, ny] = nrm(pts, i), p = pts[i];
      f.label(p[0] + nx * 26 - 14, p[1] + ny * 26 - 4, md`\vb E`, 'r');
      return f.svg();
    };
    const fPerpB = () => {
      const f = PF.fig();
      f.plane(0, 230, 100);
      f.arrow(90, 100, 160, 40, { cls: 'dash' });
      f.arrow(90, 100, 90, 42, { cls: 'dim' });
      f.arrow(90, 40, 158, 40, { cls: 'dim' });
      f.label(146, 82, md`\vb E`, 'c');
      f.label(80, 70, 'E_\\perp', 'r', 'small');
      f.label(124, 33, 'E_\\parallel', 'b', 'small');
      glyph(f, 176, 86, 1);
      f.arrow(184, 86, 212, 86, { hs: 5 });
      f.text(218, 86, 'charge slides', 'l');
      return f.svg();
    };
    const fBlobQ = (line) => {
      const f = PF.fig(), cx = 110, cy = 95;
      const pts = shape(cx, cy, 70, 48, { rot: 15, h: [[3, 0.1, 30], [2, 0.08, 0]] });
      metal(f, [pts]);
      signsAt(f, pts, cx, cy, [0, 60, 120, 180, 240, 300], 1, 8, true);
      if (line) {
        const i = at(pts, cx, cy, 70), p = pts[i], [nx, ny] = nrm(pts, i), tx = ny, ty = -nx;
        const d = [(nx + tx) / Math.SQRT2, (ny + ty) / Math.SQRT2], T = [p[0] + d[0] * 62, p[1] + d[1] * 62];
        f.arrow(p[0] + d[0] * 3, p[1] + d[1] * 3, T[0], T[1], { cls: 'dash' });
        f.text(T[0] - 6, T[1] - 10, 'proposed field line', 'r');
      }
      return f.svg();
    };
    const fInduced = () => {
      const f = PF.fig(), cx = 190, cy = 90;
      const pts = shape(cx, cy, 60, 55, { h: [[3, 0.06, 0]] });
      metal(f, [pts]);
      signsAt(f, pts, cx, cy, [130, 155, 180, 205, 230], -1, 8, true);
      signsAt(f, pts, cx, cy, [50, 25, 0, -25, -50], 1, 8, true);
      f.charge(50, 90, { q: '+', lab: '+q', at: 't' });
      f.label(cx, cy - 72, '\\text{neutral}', 'b', 'small');
      return f.svg();
    };
    const fGroundQ = () => {
      const f = PF.fig(), cx = 90, cy = 80, R = 40;
      metal(f, [circ(cx, cy, R)]);
      f.line(cx, cy + R, cx, cy + R + 22); f.ground(cx, cy + R + 22);
      f.charge(230, cy, { q: '+', lab: 'q', at: 'r' });
      f.line(cx, cy - R - 4, cx, cy - R - 28, { cls: 'dim thin' }); f.line(230, cy - 10, 230, cy - R - 28, { cls: 'dim thin' });
      f.dim(cx, cy - R - 24, 230, cy - R - 24, 'd', { at: 't' });
      return f.svg();
    };
    const fFieldSph = () => {
      const f = PF.fig(), cx = 130, cy = 85, R = 40;
      for (const y of [20, 150]) for (const x of [0, 90, 180]) f.arrow(x, y, x + 60, y);
      for (const y of [55, 85, 115]) { f.arrow(0, y, 64, y); f.arrow(196, y, 256, y); }
      metal(f, [circ(cx, cy, R)]);
      f.label(250, 20, md`\vb E_0`, 'l');
      f.label(cx, 170, '\\text{isolated, neutral metal sphere}', 't', 'small');
      return f.svg();
    };
    const fBatt = () => {
      const f = PF.fig(), cx = 70, cy = 90, R = 40;
      metal(f, [circ(cx, cy, R)]);
      f.line(cx + R, cy, 170, cy); battery(f, 170, cy); f.line(179, cy, 220, cy); f.line(220, cy, 220, cy + 30); f.ground(220, cy + 30);
      f.label(175, cy - 22, 'V_0', 'b');
      return f.svg();
    };
    const fWire2 = () => {
      const f = PF.fig();
      metal(f, [circ(70, 90, 40)]); metal(f, [circ(262, 90, 20)]);
      f.line(110, 90, 242, 90);
      const e1 = [70 + 40 * Math.cos(135 * DEG), 90 - 40 * Math.sin(135 * DEG)], e2 = [262 + 20 * Math.cos(60 * DEG), 90 - 20 * Math.sin(60 * DEG)];
      f.line(70, 90, ...e1, { cls: 'dim thin' }); f.tag(...e1, 'R_1', 'tl', 6);
      f.line(262, 90, ...e2, { cls: 'dim thin' }); f.tag(...e2, 'R_2', 'tr', 6);
      f.text(176, 76, 'thin wire', 'c');
      return f.svg();
    };
    const fCharged = (pin) => {
      const f = PF.fig(), cx = 110, cy = 95, R = 60;
      metal(f, [circ(cx, cy, R)]);
      signsAt(f, circ(cx, cy, R), cx, cy, [20, 60, 100, 140, 180, 220, 260, 300, 340], 1, 7, true);
      const a = -30 * DEG, e = [cx + R * Math.cos(a), cy - R * Math.sin(a)];
      f.line(cx, cy, ...e, { cls: 'dim thin' }); f.tag(...e, 'R', 'br', 6);
      f.label(cx, cy - R - 12, 'Q', 'b');
      if (pin) { const Pp = [cx - 30, cy]; f.dot(...Pp, 3); f.line(Pp[0] - 4, Pp[1] + 3, cx - 92, cy + 48, { cls: 'dim thin' }); f.label(cx - 96, cy + 48, 'P', 'r'); }
      return f.svg();
    };
    const plotSph = () => PF.row([
      { svg: PF.plot({ w: 230, h: 160, x: [0, 4], y: [0, 1.3], xl: 'r', yl: 'E', xt: [[1, 'R']], curves: [{ f: () => 0, from: 0, to: 0.995 }, { f: (r) => 1 / (r * r), from: 1, to: 4 }] }), cap: '$E$: zero in the metal, jumps to $\\sigma/\\varepsilon_0$ at the surface' },
      { svg: PF.plot({ w: 230, h: 160, x: [0, 4], y: [0, 1.3], xl: 'r', yl: 'V', xt: [[1, 'R']], curves: [{ f: () => 1, from: 0, to: 1 }, { f: (r) => 1 / r, from: 1, to: 4 }] }), cap: '$V$: constant (not zero) in the metal' },
    ]);

    return {
      id: 'u3-conductors', title: 'Conductors: the basic properties',
      steps: [
        RF(md`
          ### Insulators and conductors

          Lecture 7 sorts materials by how freely their charges can move.

          - **Insulator:** electrons are tightly bound to their atoms and cannot move (glass, rubber).
          - **Conductor:** one or more charges per atom are free to move: electrons in metals such as aluminium or gold, ions in salt water.

          A **perfect conductor** has an unlimited supply of free charge. Everything in this lesson follows from that one fact plus the word *electrostatics*: in equilibrium, nothing moves any more.

          ### Property 1: $\vb E = 0$ inside

          Put a conductor into an external field $\vb E_0$. The field pushes on the free charges: electrons drift upstream and pile up on the left face, leaving the right face positive. These induced charges make a field of their own, $\vb E_1$, which inside the metal points from $+$ to $-$, **against** $\vb E_0$. While any field remains inside, charge keeps flowing, so the flow stops only when $\vb E_1$ cancels $\vb E_0$ exactly. In the notes' words: the charges separate and create a compensating field that cancels any net field.

          [[fig:slab]]

          Outside, $\vb E_0$ and $\vb E_1$ do **not** cancel. The outside field bends so that it meets the surface at right angles, ending on the induced $-$ charge and starting again from the $+$ charge. Here are the exact field lines for a metal sphere in a uniform field:

          [[fig:sph]]

          !!intuition A conductor is a sea of mobile charge
            It keeps rearranging until no charge inside feels a push. "No push" means $\vb E = 0$. The charge that had to move ends up on the surface.
        `, { slab: { svg: fSlab(), cap: 'Equilibrium: induced $-$ on the upstream face, $+$ on the downstream face. Their field $\\vb E_1$ (dashed) cancels $\\vb E_0$ inside the metal.' }, sph: { svg: fSph(), cap: 'A neutral metal sphere in a uniform field. Field lines end on the induced $-$ charge and leave from the $+$ charge, meeting the surface at right angles. Inside, $\\vb E = 0$.' } }),

        Q(md`A neutral metal block is placed in a uniform external field. After the charges settle, the net charge of the block is`,
          [md`negative, since electrons pile up on one face`, md`zero`, md`positive, since electrons are pushed out of the block`, md`proportional to $E_0$`], 1,
          [md`Electrons pile up on one face, but they come from the other face, which is left positive by the same amount.`, null, md`The electrons can't leave the block; they only move within it.`, md`The **induced** charge on each face grows with $E_0$; the net charge stays zero.`],
          md`Charge is only rearranged: $-$ on the upstream face, an equal $+$ on the downstream face. The net charge of an isolated conductor never changes; its distribution does.`,
          { figHtml: fBlock() }),

        Q(md`For the same block, once the charges have settled, the field inside the metal is`,
          [md`$E_0/2$, since the induced charge cancels half of it`, md`small but not zero; screening is never perfect`, md`exactly zero`, md`$E_0$, since static fields pass through metal`], 2,
          [md`Charge keeps flowing while **any** field is left inside. Half-cancelled is not equilibrium.`, md`A perfect conductor has an unlimited supply of free charge, so the cancellation is complete. Real metals come extremely close.`, null, md`Static fields don't pass through metal: the induced surface charge cancels them inside.`],
          md`Equilibrium means no force on the free charges, so $\vb E = 0$ exactly. The induced charge produces $\vb E_1 = -\vb E_0$ throughout the interior. The block doesn't block the field; it cancels it.`,
          { figHtml: fBlock() }),

        Q(md`Just outside the block's **left** face (the upstream face, where electrons piled up), the field after equilibrium points`,
          [md`perpendicular to the face, into the block`, md`perpendicular to the face, away from the block`, md`along the face`, md`nowhere: it is zero, like the field inside`], 0,
          [null, md`Field lines end on negative charge. On the left face $\sigma<0$, so the field just outside points toward the surface.`, md`A field along the surface would push the surface charge sideways; in equilibrium there is no such component.`, md`Zero is the field **inside**. Just outside there is a field of magnitude $|\sigma|/\varepsilon_0$.`],
          md`Just outside a conductor $\vb E = \dfrac{\sigma}{\varepsilon_0}\hat{\vb n}$, with $\hat{\vb n}$ the outward normal. On the left face $\sigma<0$ and $\hat{\vb n}$ points left, so $\vb E$ points right: into the block. That's the external field arriving and ending on the induced electrons.`,
          { figHtml: fBlock() }),

        Q(md`A copper wire carries a steady current. Is $\vb E = 0$ inside the copper?`,
          [md`Yes: copper is a conductor`, md`Yes, as long as the current is steady`, md`Only at the surface of the wire`, md`No: charges are moving, so this is not electrostatics, and a field drives the current`], 3,
          [md`$\vb E = 0$ is a statement about conductors in **electrostatic equilibrium**. With a current flowing, the charges are not in equilibrium.`, md`Steady is not static. A steady current still needs a field ($\vb J = \sigma_c\vb E$) to push charges against the resistance.`, md`No; the driving field is inside the metal, along the wire.`, null],
          md`The argument for $\vb E = 0$ was "if there were a field, charges would move". In a current-carrying wire, charges **are** moving. Every property in this lesson assumes static equilibrium.`,
          { nofig: 'Conceptual question about when the property applies.' }),

        RF(md`
          ### Property 2: $\rho = 0$ inside

          Gauss's law in differential form: $\divg\vb E = \rho/\varepsilon_0$. With $\vb E = 0$ throughout the metal, $\divg\vb 0 = 0$, so $\rho = 0$. There is still plenty of charge (nuclei and electrons), but exactly as much $+$ as $-$ in every small volume.

          The lecture's picture: imagine a positive point charge placed inside the conductor. Free electrons crowd around it until their charge cancels its field. This is called **screening**. The conductor's net $+q$ ends up on its outer surface.

          [[fig:screen]]

          ### Property 3: any net charge sits on the surface

          "There is no other place for it to be." Draw a closed Gaussian surface just inside the skin of the conductor. $\vb E = 0$ everywhere on it, so $\Qenc = 0$: none of the net charge is inside. The net charge sits in a layer a few atoms thick at the surface.

          [[fig:gauss]]

          Griffiths adds an energy view: the charge settles into the arrangement of least energy, and spreading over the surface beats spreading through the volume. For a sphere: $\dfrac{q^2}{8\pi\varepsilon_0R}$ on the surface versus $\dfrac{3q^2}{20\pi\varepsilon_0R}$ spread uniformly through the volume (Lesson 3).
        `, { screen: { svg: fScreen(), cap: 'Screening: electrons crowd around a charge placed inside the metal. The leftover $+q$ goes to the outer surface.' }, gauss: { svg: fGauss(), cap: 'A Gaussian surface just inside the metal encloses no net charge, because $\\vb E = 0$ on it.' } }),

        Q(md`"$\rho = 0$ inside a conductor" means`,
          [md`there are no charged particles inside the metal`, md`all the electrons have moved to the surface`, md`the charge density is too small to measure`, md`the positive and negative charge densities cancel in every small volume`], 3,
          [md`The metal is full of nuclei and electrons. $\rho$ is the **net** charge density.`,
            md`Only a tiny surplus or deficit of electrons sits at the surface. The vast majority stay inside, balancing the nuclei.`,
            md`It is exactly zero in equilibrium, not merely small: $\rho = \varepsilon_0\divg\vb E$ and $\vb E = 0$.`,
            null],
          md`$\rho$ is net charge per volume. Inside the metal $\rho = \varepsilon_0\,\divg\vb E = 0$ exactly. The free electrons are still there, distributed so that they neutralise the ions everywhere except in the thin surface layer.`,
          { figHtml: fScreen() }),

        Q(md`A solid metal sphere and a hollow metal shell (thin, empty inside) have the same radius $R$ and the same charge $Q$. How do their fields compare?`,
          [md`Identical everywhere`, md`Identical outside, but the hollow shell has a field inside its cavity`, md`The solid sphere has the larger field outside, since it has more metal`, md`The hollow shell has the larger field outside, since its charge is closer to the surface`], 0,
          [null, md`The empty cavity has no charge inside it, so Gauss with a sphere of radius $r<R$ gives zero field there too.`, md`The amount of metal doesn't matter. In both, all of $Q$ sits uniformly on the outer surface.`, md`In both cases the charge is **on** the surface.`],
          md`In both cases $Q$ sits uniformly on the outer surface of radius $R$. Outside: $\dfrac{Q}{4\pi\varepsilon_0r^2}$. Inside (metal or empty cavity): zero. The interior metal of the solid sphere does nothing; you could hollow it out without changing anything.`,
          { figHtml: PF.row([{ svg: fCharged(false), cap: 'solid' }, { svg: shellFig({ lab: 'Q' }).svg(), cap: 'hollow shell' }]).svg }),

        Q(md`You inject charge $Q$ at the centre of a solid metal ball. A moment later the charge is`,
          [md`still at the centre, screened by electrons`, md`spread uniformly through the volume of the ball`, md`spread uniformly over the outer surface`, md`concentrated at the point of the surface nearest the injection`], 2,
          [md`Screening hides a charge that is **held** in place. Free charge is pushed out by its own field until none is left inside.`, md`A uniform volume charge would make a field inside ($E\propto r$), which would push the charge further out.`, null, md`On a sphere, symmetry spreads it uniformly; nothing singles out one point.`],
          md`Excess free charge repels itself to the surface (property 3), and on a sphere symmetry makes it uniform. Only then is $\vb E = 0$ inside.`,
          { figHtml: fCharged(false) }),

        RF(md`
          ### Property 4: a conductor is an equipotential

          For any two points $a$ and $b$ in or on the conductor, integrate along a path inside the metal:

          $$V(b)-V(a) = -\int_a^b\vb E\cdot d\vb l = 0\quad\Longrightarrow\quad V(b) = V(a).$$

          (The notes drop the minus sign; that's harmless here because the integral is zero.) The whole conductor, interior and surface, sits at **one** potential. That potential need not be zero, and the surface charge need not be uniform.

          [[fig:eqp]]

          ### Property 5: just outside, $\vb E$ is perpendicular to the surface

          If $\vb E$ had a component along the surface, it would push the surface charge along the surface until that component was gone. Charge cannot flow out through the surface, so the perpendicular part survives. Another way to say it: the surface is an equipotential, and $\vb E$ is always perpendicular to equipotentials.

          [[fig:perp]]
        `, { eqp: { svg: fEqp(), cap: 'Any path from $a$ to $b$ inside the metal has $\\vb E = 0$ along it, so $V(a) = V(b)$.' }, perp: Object.assign(PF.row([{ svg: fPerpA(), cap: '$\\vb E$ leaves the surface at right angles' }, { svg: fPerpB(), cap: 'a tangential part would make charge slide' }]), { cap: '' }) }),

        Q(md`A metal sphere of radius $R$ carries charge $Q$. Taking $V(\infty) = 0$, the potential at its centre is`,
          [md`$0$, because $\vb E = 0$ inside`, md`$\dfrac{Q}{4\pi\varepsilon_0R}$`, md`$\infty$, because the centre is a point`, md`$\dfrac{3Q}{8\pi\varepsilon_0R}$, as for a uniformly charged ball`], 1,
          [md`$\vb E = 0$ means $V$ is **constant** inside, not zero. The constant is the surface value.`, null, md`There is no charge at the centre; $V$ is finite everywhere.`, md`That is the centre of a ball with charge spread through its volume. On a conductor the charge is on the surface and $V$ is flat inside.`],
          md`Outside, $V = \dfrac{Q}{4\pi\varepsilon_0 r}$. $V$ is continuous at $r=R$, and inside $\vb E = 0$ so $V$ stays at its surface value $\dfrac{Q}{4\pi\varepsilon_0R}$ all the way to the centre.`,
          { figHtml: fCharged(false) }),

        Q(md`Someone sketches a field line that leaves the surface of a charged conductor at $45^\circ$ to the surface. In electrostatics this is`,
          [md`fine, if the surface charge there is large`, md`fine, if the conductor is not a sphere`, md`fine just outside, as long as $\vb E = 0$ inside`, md`impossible: the tangential part would drive charge along the surface`], 3,
          [md`The size of $\sigma$ sets the size of $\vb E$, not its direction.`, md`Property 5 holds for every shape.`, md`$\vb E=0$ inside is not enough: the tangential part **outside** would also act on the surface charge.`, null],
          md`The surface charge feels any tangential field and moves until it is gone, so in equilibrium $E_\parallel = 0$ just outside. Field lines meet a conductor at right angles (curving to do so, as in the sphere-in-a-field picture).`,
          { figHtml: fBlobQ(true) }),

        Q(md`On an irregular charged conductor, point $a$ is on a sharp corner where $\sigma$ is large and point $b$ is on a flat part where $\sigma$ is small. Compare their potentials.`,
          [md`$V(a) = V(b)$`, md`$V(a) > V(b)$, since there is more charge at $a$`, md`$V(a) < V(b)$, since the field near $a$ pushes charge away`, md`It depends on the sign of the charge`], 0,
          [null, md`More charge nearby does not mean higher potential **on** the conductor. The whole conductor is one equipotential; the charge arranges itself to make it so.`, md`The charges have stopped moving; there is no net push along the conductor.`, md`For either sign, the conductor is an equipotential.`],
          md`Property 4: $V$ is the same everywhere on a conductor. The non-uniform $\sigma$ is exactly what it takes to make $V$ uniform on an irregular shape. Uniform $V$, non-uniform $\sigma$: keep those apart.`,
          { figHtml: fEqp() }),

        Q(md`Just outside a charged conductor, the equipotential surfaces`,
          [md`are perpendicular to the conductor's surface`, md`follow the shape of the conductor's surface`, md`are evenly spaced spheres, whatever the shape`, md`do not exist, since the field is perpendicular`], 1,
          [md`It's the **field lines** that are perpendicular to the surface. Equipotentials are perpendicular to field lines, so they run parallel to the surface.`, null, md`Far away they become spheres; close in they hug the conductor.`, md`Equipotentials exist wherever $V$ is defined: they are the surfaces perpendicular to $\vb E$.`],
          md`The conductor's surface is itself an equipotential. Nearby equipotentials are slightly displaced copies of it, crowded together where $E$ is large (sharp points) and spread out where $E$ is small. Far away they round off into spheres.`,
          { figHtml: fBlobQ(false) }),

        RF(md`
          ### Induced charge and attraction

          Hold a charge $+q$ near an uncharged conductor. It pulls electrons to the near side and leaves the far side positive (equivalently: the conductor's charge rearranges to kill the field of $q$ inside the metal). The induced $-$ charge is closer to $q$ than the induced $+$, so the attraction wins. For ordinary shapes (spheres, planes) a charge and a neutral conductor attract, whatever the sign of $q$. The method of images (Lecture 10) computes this force exactly.

          [[fig:ind]]
        `, { ind: { svg: fInduced(), cap: 'A charge $+q$ near a neutral conductor induces $-$ on the near side and $+$ on the far side.' } }),

        Q(md`In the figure, the charge is replaced by $-q$. The force between the charge and the neutral conductor is now`,
          [md`repulsive, since the sign changed`, md`zero, since the conductor is neutral`, md`attractive again: the induced charges also flip`, md`attractive only if the conductor is grounded`], 2,
          [md`Flipping $q$ flips the induced charges too: now $+$ is on the near side.`, md`Neutral overall, but the induced charge is not evenly placed: the near side carries the opposite sign and is closer.`, null, md`An isolated neutral conductor also attracts; grounding just makes the attraction stronger (extra charge flows in).`],
          md`Everything flips together: the near side now has induced $+$, the far side $-$. The closer opposite charge still wins. The force depends on $q^2$, not on $q$.`,
          { figHtml: fInduced() }),

        RF(md`
          ### Conductors as boundary conditions

          Most conductor problems, and all of the next unit, are solved by translating the words into **boundary conditions** on $V$. What a piece of metal does is summarised by conditions on its surface:

          | words in the problem | boundary condition |
          |---|---|
          | "conductor", "metal" | $V$ is constant over the whole surface (and inside) |
          | "grounded" | $V = 0$ on it |
          | "held at potential $V_0$" (by a battery) | $V = V_0$ on it |
          | "isolated, with charge $Q$" | $V = V_c$, an **unknown** constant; what you know is $\oint\sigma\,da = Q$ |
          | "isolated and neutral" | the same with $Q = 0$ |
          | "connected by a wire" | the same constant $V$ on both pieces |
          | far from everything | $V\to0$ (or $V\to-E_0z$ in a uniform applied field) |

          Two more conditions come with every conductor surface: the field just outside is $\vb E = \dfrac{\sigma}{\varepsilon_0}\hat{\vb n}$ with no tangential part, so $\sigma = -\varepsilon_0\dfrac{\partial V}{\partial n}$; and a charge $q$ inside a cavity puts exactly $-q$ on the cavity wall. Those get their own lessons next.

          !!method Read a conductor problem in this order
            1. Which surfaces are conductors? Each one is an equipotential.
            2. For each conductor: is its **potential** given (grounded, battery) or its **charge** (isolated)? You get one condition per conductor, not both.
            3. What happens far away?
            4. Only then solve (Gauss's law if there is symmetry, Chapter 3 methods if not), and get $\sigma$ from $\sigma = -\varepsilon_0\,\partial V/\partial n$.
        `),

        Q(md`A metal sphere of radius $R$ is connected to ground. A point charge $q$ is held a distance $d$ from its centre. Which boundary conditions determine $V$ outside the sphere?`,
          [md`$V = 0$ on the sphere and $V\to0$ far away`, md`$V = 0$ on the sphere and total charge zero on the sphere`, md`$\sigma = 0$ on the sphere`, md`$\vb E = 0$ on the sphere's surface`], 0,
          [null, md`Grounding lets charge flow on or off. The sphere ends up with whatever charge makes $V = 0$ (here $-qR/d$, from images later), not zero. You can't impose both.`, md`A grounded sphere near $q$ carries induced charge; $\sigma\neq0$.`, md`$\vb E = 0$ **inside** the metal. Just outside, $\vb E = (\sigma/\varepsilon_0)\hat{\vb n}\neq0$.`],
          md`"Grounded" fixes the potential: $V = 0$ on the whole sphere. Together with $V\to0$ at infinity (and the point charge $q$ as the source), that determines $V$ uniquely. The induced charge is an **output**: $\sigma = -\varepsilon_0\,\partial V/\partial n$ on the surface, and it totals $-qR/d$.`,
          { figHtml: fGroundQ() }),

        Q(md`An isolated, uncharged metal sphere is placed in a uniform applied field $\vb E_0 = E_0\uv z$. Which set of conditions is right?`,
          [md`$V = 0$ on the sphere and $V\to0$ far away`, md`$V = V_c$ (a constant) on the sphere, total surface charge zero, and $V\to-E_0z + C$ far away`, md`$\sigma = 0$ on the sphere, since it is uncharged`, md`$V = -E_0z$ on the sphere's surface`], 1,
          [md`Far away the potential of a uniform field is $-E_0z$, which doesn't go to zero.`, null, md`Uncharged means **total** charge zero. Locally, $\sigma\neq0$: $-$ on one side, $+$ on the other.`, md`$-E_0z$ varies over the surface, but a conductor is an equipotential.`],
          md`Isolated means you know the charge (zero), not the potential: $V = V_c$ on the sphere with $\oint\sigma\,da = 0$. The applied field fixes the far-away behaviour. (By symmetry $V_c$ equals $C$, the value the applied potential had at the centre; Griffiths picks $C = 0$ and puts the sphere at $V = 0$. That's a choice of constant, not grounding.)`,
          { figHtml: fFieldSph() }),

        Q(md`A metal sphere is connected to the $+$ terminal of a battery of voltage $V_0$ whose $-$ terminal is grounded. Which boundary condition holds on the sphere?`,
          [md`Total charge $= 0$`, md`$V = 0$`, md`$\sigma = \varepsilon_0V_0/R$, set by the battery`, md`$V = V_0$`], 3,
          [md`The battery pushes charge onto the sphere; its charge is whatever it takes to reach $V_0$.`, md`The ground is connected to the **other** terminal. The sphere is $V_0$ above ground.`, md`That's the **result** for an isolated sphere ($\sigma = -\varepsilon_0\,\partial V/\partial n$ at $r=R$), not what you impose. Near other charges $\sigma$ would not even be uniform.`, null],
          md`A battery fixes a potential difference, so the sphere's potential is given: $V = V_0$. Its charge then follows from the solution; for a lone sphere $V_0 = Q/(4\pi\varepsilon_0R)$ gives $Q = 4\pi\varepsilon_0RV_0$.`,
          { figHtml: fBatt() }),

        Q(md`Two metal spheres far apart are joined by a thin wire, and a total charge $Q$ is put on them. The boundary conditions are`,
          [md`$V_1 = V_2$ (one unknown constant) and $Q_1 + Q_2 = Q$`, md`$Q_1 = Q_2 = Q/2$`, md`$\sigma_1 = \sigma_2$`, md`$V_1 = V_2 = 0$`], 0,
          [null, md`Equal charges would give unequal potentials for unequal spheres ($Q/R$ differs). Charge flows until the potentials match.`, md`Equal densities would also give unequal potentials. The densities actually come out in the ratio $R_2/R_1$ (Lesson 7).`, md`Nothing is grounded; the common potential is not zero.`],
          md`The wire makes the two spheres one conductor: one potential, unknown. The total charge is known. Far apart, $\dfrac{Q_1}{4\pi\varepsilon_0R_1} = \dfrac{Q_2}{4\pi\varepsilon_0R_2}$, so $Q_1:Q_2 = R_1:R_2$.`,
          { figHtml: fWire2() }),

        Q(md`A problem states that a metal sphere near a point charge is grounded **and** carries zero net charge. What's wrong with that?`,
          [md`Nothing; those are the two conditions needed`, md`It over-specifies the sphere: grounding fixes $V$, and the charge then comes out of the solution`, md`Grounded spheres cannot carry charge, so the second condition is automatic`, md`A grounded sphere's charge is always zero, so the second condition is redundant but harmless`], 1,
          [md`One condition per conductor. Giving both $V$ and $Q$ generally has no solution.`, null, md`Grounded spheres near charges do carry charge: it flows in from the ground (the image charge $-qR/d$).`, md`It is not zero in general, so the two conditions contradict each other.`],
          md`For each conductor you specify **either** its potential **or** its total charge. A grounded sphere near $q$ ends up with charge $-qR/d$; demanding zero as well is inconsistent. This is the content of the uniqueness theorems in the next unit.`,
          { figHtml: fGroundQ() }),

        RF(md`
          ### Worked example: a charged metal sphere

          A solid metal sphere of radius $R$ is isolated and carries charge $Q$. Find $\vb E$, $V$ and $\sigma$.

          **Conditions.** Conductor: $V = V_c$ throughout, unknown constant, and $\vb E = 0$ inside. Isolated with charge $Q$: $\oint\sigma\,da = Q$. Far away: $V\to0$.

          **Charge.** All of $Q$ is on the surface (property 3), uniform by symmetry: $\sigma = \dfrac{Q}{4\pi R^2}$.

          **Field.** Gauss with a sphere of radius $r$: $\vb E = 0$ for $r<R$ and $\vb E = \dfrac{Q}{4\pi\varepsilon_0r^2}\uv r$ for $r>R$. Just outside: $E = \dfrac{Q}{4\pi\varepsilon_0R^2} = \dfrac{\sigma}{\varepsilon_0}$, the general rule from Lesson 7.

          **Potential.** Outside, $V = \dfrac{Q}{4\pi\varepsilon_0r}$. $V$ is continuous at $r = R$, so $V_c = \dfrac{Q}{4\pi\varepsilon_0R}$: the unknown constant came out of the charge condition.

          [[fig:plots]]

          **Check.** $\sigma = -\varepsilon_0\,\partial V/\partial r$ at $r = R^+$: $-\varepsilon_0\cdot\left(-\dfrac{Q}{4\pi\varepsilon_0R^2}\right) = \dfrac{Q}{4\pi R^2}$.
        `, { plots: Object.assign(plotSph(), { cap: '' }) }),

        P({
          title: 'Inside a charged metal sphere',
          q: md`A solid metal sphere of radius $R$ carries charge $Q$. Point $P$ is inside the metal, a distance $R/2$ from the centre. Find the potential at $P$ (with $V(\infty) = 0$) and say what the field there is.`,
          figHtml: fCharged(true),
          hints: [md`Conditions first: conductor, so $V$ is one constant throughout; isolated with charge $Q$.`, md`The constant equals the surface value, $\dfrac{Q}{4\pi\varepsilon_0R}$. It doesn't matter where $P$ is.`],
          parts: [
            { lbl: md`V(P)`, expr: 'Q/(4*pi*eps0*R)', vars: { Q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 3] } },
            { lbl: md`The field at $P$ is`, mc: [md`$\dfrac{Q}{4\pi\varepsilon_0 (R/2)^2}$, pointing outward`, md`zero`, md`$\dfrac{Q}{8\pi\varepsilon_0R^2}$, half the surface value`], a: 1,
              why: [md`That would be the field of a point charge $Q$ at the centre. The charge is on the surface, outside $P$.`, null, md`That's the field of a uniformly charged **ball** at $R/2$. In a conductor the charge is all on the surface.`] },
          ],
          sol: md`
            **Conditions.** Conductor: $V$ = one constant everywhere in the metal, $\vb E = 0$. Isolated with charge $Q$. $V(\infty) = 0$.

            The charge sits uniformly on the surface, so outside $V = Q/(4\pi\varepsilon_0 r)$. Continuity at $r=R$ fixes the constant:

            $$V(P) = V(R) = \frac{Q}{4\pi\varepsilon_0R},\qquad \vb E(P) = 0.$$

            Being at $R/2$ instead of $R$ changes nothing: in a conductor, $V$ is flat.
          `,
        }),

        P({
          title: 'A sphere held at fixed potential',
          q: md`An isolated metal sphere of radius $R$ is connected to the $+$ terminal of a battery whose $-$ terminal is grounded, so the sphere sits at potential $V_0$ (with ground and infinity both at $V = 0$; the wire's own effect is negligible). Find the charge $Q$ that flows onto the sphere and its surface charge density.`,
          figHtml: fBatt(),
          hints: [md`Here the potential is given, not the charge: $V = V_0$ on the sphere.`, md`Outside, $V = \dfrac{Q}{4\pi\varepsilon_0 r}$. Set $V(R) = V_0$.`],
          parts: [
            { lbl: 'Q', expr: '4*pi*eps0*R*V0', vars: { eps0: [0.5, 2], R: [0.5, 3], V0: [0.5, 3] } },
            { lbl: '\\sigma', expr: 'eps0*V0/R', vars: { eps0: [0.5, 2], R: [0.5, 3], V0: [0.5, 3] } },
            { lbl: md`Doubling $R$ at the same $V_0$ makes $\sigma$`, mc: [md`half as large`, md`twice as large`, md`unchanged`], a: 0, why: [null, md`$Q$ doubles but the area quadruples: $\sigma = \varepsilon_0V_0/R$.`, md`$\sigma = \varepsilon_0V_0/R$ depends on $R$.`] },
          ],
          sol: md`
            **Conditions.** Conductor held at a given potential: $V = V_0$ on the sphere. $V\to0$ far away. The charge is unknown and comes out of the solution.

            By symmetry the charge is uniform and $V = \dfrac{Q}{4\pi\varepsilon_0r}$ outside. Setting $V(R) = V_0$:

            $$Q = 4\pi\varepsilon_0RV_0,\qquad \sigma = \frac{Q}{4\pi R^2} = \frac{\varepsilon_0V_0}{R}.$$

            **Check** with $\sigma = -\varepsilon_0\,\partial V/\partial r$ at $r=R$: $V = V_0R/r$, so $-\varepsilon_0\cdot(-V_0R/R^2) = \varepsilon_0V_0/R$. The smaller the sphere, the larger $\sigma$ and the surface field $V_0/R$ at a given voltage: this is why sharp points discharge first (Lesson 7). (And $Q/V_0 = 4\pi\varepsilon_0R$ is the sphere's capacitance, Lesson 8.)
          `,
        }),

        RF(md`
          !!key Patterns to remember
            - In electrostatic equilibrium, inside a conductor: $\vb E = 0$, $\rho = 0$, $V$ = constant (not necessarily zero).
            - Net charge lives on the surface; $\sigma$ is generally **not** uniform, but $V$ **is**.
            - Just outside: $\vb E\perp$ surface. Field lines meet conductors at right angles.
            - Induced charge: opposite sign on the near side; a charge and an ordinary neutral conductor attract.
            - Translate words into conditions: conductor → $V$ = const; grounded → $V = 0$; battery → $V = V_0$; isolated → $V$ unknown, $Q$ known; wire → equal $V$. One condition per conductor.
        `),
      ],
    };
  };

  // ===================================================================================== Lesson 6
  const L6 = () => {
    const fFaraday = (bare) => {
      const f = PF.fig(), cx = 160, cy = 100;
      const outer = shape(cx, cy, 118, 64, { h: [[3, 0.05, 20], [2, 0.04, 0]] });
      const cav = shape(cx + 34, cy + 2, 46, 30, { h: [[3, 0.05, 0]] });
      metal(f, [outer, cav]);
      for (const y of [58, 100, 142]) f.arrow(-34, y, 18, y);
      for (const y of [72, 128]) f.arrow(302, y, 350, y);
      f.arrow(70, 16, 250, 16);
      f.label(258, 16, md`\vb E\neq0`, 'l');
      if (!bare) {
        f.line(160, 120, 160, 84, { cls: 'thick', arrow: 'end' });
        const back = [];
        for (let k = 0; k <= 40; k++) { const t = k / 40; back.push([160 - 46 * Math.sin(Math.PI * t), 84 + 36 * t]); }
        f.pl(back, { cls: 'dash' });
        f.label(207, 102, md`\vb E = 0`, 'c', 'small');
      } else f.text(194, 104, 'empty', 'c');
      return f.svg();
    };
    // peanut-shaped conductor with a cavity holding +q (lecture figure); options: gauss, ground
    const fCav = (o = {}) => {
      const f = PF.fig(), cx = 170, cy = 100;
      const outer = shape(cx, cy, 96, 72, { h: [[2, 0.2, 0], [4, 0.07, 0]] });
      const ccx = cx - 52, ccy = cy + 4;
      const cav = shape(ccx, ccy, 36, 25, { rot: 10, h: [[3, 0.05, 0]] });
      metal(f, [outer, cav]);
      f.charge(ccx - 4, ccy, { q: '+', lab: 'q', at: 'r' });
      if (!o.bare) signsAt(f, cav, ccx, ccy, [60, 105, 150, 195, 240, 285], -1, 7, false);
      if (!o.ground && !o.bare) signsAt(f, outer, cx, cy, [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330], 1, -9, false);
      if (o.gauss) {
        const gs = shape(ccx, ccy, 52, 38, { rot: 10 });
        f.poly(gs, { cls: 'dash' });
        const i = at(gs, ccx, ccy, -60);
        f.line(gs[i][0], gs[i][1], cx + 40, cy + 102, { cls: 'dim thin' });
        f.label(cx + 44, cy + 102, '\\text{Gaussian surface (in the metal)}', 'l', 'small');
      }
      if (o.ground) { const i = at(outer, cx, cy, -90); f.line(outer[i][0], outer[i][1], outer[i][0], outer[i][1] + 22); f.ground(outer[i][0], outer[i][1] + 22); }
      return f.svg();
    };
    const fEx210 = (bare) => {
      const f = PF.fig(), cx = 130, cy = 110, R = 90, kx = cx - 30, ky = cy + 22;
      const cav = shape(kx, ky, 32, 23, { h: [[2, 0.15, 30], [3, 0.12, 0]] });
      metal(f, [circ(cx, cy, R), cav]);
      f.charge(kx - 13, ky + 3, { q: '+', lab: 'q', at: 'r' });
      if (!bare) {
        signsAt(f, cav, kx, ky, [100, 150, 190, 230, 280], -1, 7, false);
        signsAt(f, circ(cx, cy, R), cx, cy, [10, 50, 90, 130, 170, 210, 250, 290, 330], 1, -9, false);
        f.poly(shape(kx, ky, 47, 38), { cls: 'dash' });
      }
      const ang = 30 * DEG, Pp = [cx + 128 * Math.cos(ang), cy - 128 * Math.sin(ang)];
      f.line(cx, cy, Pp[0] - 4 * Math.cos(ang), Pp[1] + 4 * Math.sin(ang), { cls: 'dim dash thin' });
      f.dot(...Pp, 3); f.tag(Pp[0], Pp[1], 'P', 'tr', 6);
      f.label(cx + 106 * Math.cos(ang) + 5, cy - 106 * Math.sin(ang) + 10, 'r', 'c', 'small');
      f.dot(cx, cy, 2);
      return f.svg();
    };
    const fShellQ = (ground) => {
      const f = PF.fig(), cx = 120, cy = 105, a = 44, b = 78;
      ringMetal(f, cx, cy, a, b);
      f.charge(cx, cy, { q: '+', lab: 'q', at: 'b' });
      const aa = 135 * DEG;
      f.line(cx + 9 * Math.cos(aa), cy - 9 * Math.sin(aa), cx + a * Math.cos(aa), cy - a * Math.sin(aa), { cls: 'dim thin' });
      f.label(cx + 27 * Math.cos(aa) + 8, cy - 27 * Math.sin(aa) - 8, 'a', 'c', 'small');
      const ab = 30 * DEG, eb = [cx + b * Math.cos(ab), cy - b * Math.sin(ab)];
      f.line(cx + 9 * Math.cos(ab), cy - 9 * Math.sin(ab), ...eb, { cls: 'dim thin' }); f.tag(...eb, 'b', 'tr', 6);
      if (ground) { f.line(cx, cy + b, cx, cy + b + 20); f.ground(cx, cy + b + 20); }
      return f.svg();
    };
    const fHW39 = (sol) => {
      const f = PF.fig(), cx = 130, cy = 125, R = 30, a = 58, b = 90;
      metal(f, [circ(cx, cy, R)]);
      ringMetal(f, cx, cy, a, b);
      const P = (r, deg) => [cx + r * Math.cos(deg * DEG), cy - r * Math.sin(deg * DEG)];
      f.line(cx, cy, ...P(R, 150), { cls: 'dim thin' }); f.tag(...P(R, 150), 'R', 'tl', 6);
      f.line(cx, cy, ...P(a, 30), { cls: 'dim thin' });
      { const m = P(46, 30); f.label(m[0] - 0.5 * 12, m[1] - 0.866 * 12, 'a', 'c', 'small'); }
      f.line(cx, cy, ...P(b, -40), { cls: 'dim thin' }); f.tag(...P(b, -40), 'b', 'br', 6);
      if (!sol) f.label(cx, cy + R + 14, 'q', 'c', 'small');
      if (sol) {
        signsAt(f, circ(cx, cy, R), cx, cy, [80, 200, 260, 350], 1, 7, true);
        signsAt(f, circ(cx, cy, a), cx, cy, [0, 70, 110, 200, 240, 280], -1, -7, false);
        signsAt(f, circ(cx, cy, b), cx, cy, [10, 50, 90, 130, 170, 210, 250, 290], 1, -9, false);
        f.circle(cx, cy, 74, { cls: 'dash' });
      }
      return f.svg();
    };
    const plotHW39 = () => PF.plot({ w: 330, h: 200, x: [0, 4], y: [0, 1.0], xl: 'r', yl: 'V\\ \\ (q/4\\pi\\varepsilon_0 R)', xt: [[1, 'R'], [2, 'a'], [3, 'b']], yt: [[0.5, '0.5'], [5 / 6, '0.83']],
      curves: [
        { f: (r) => (r < 1 ? 5 / 6 : r < 2 ? 1 / 3 + 1 / r - 0.5 : r < 3 ? 1 / 3 : 1 / r), n: 400 },
        { f: (r) => (r < 1 ? 0.5 : r < 2 ? 1 / r - 0.5 : 0), n: 400, cls: 'dash' },
      ] });
    const fHW40 = (o = {}) => {
      const f = PF.fig(), cx = 150, cy = 130, R = 120, A = [98, 130], B = [204, 134], ra = 36, rb = 44;
      metal(f, [circ(cx, cy, R), circ(A[0], A[1], ra), circ(B[0], B[1], rb)]);
      f.charge(...A, { q: '+', lab: 'q_a', at: 'r' });
      f.charge(...B, { q: '+', lab: 'q_b', at: 'r' });
      const d = 135 * DEG;
      f.line(A[0] + 9 * Math.cos(d), A[1] - 9 * Math.sin(d), A[0] + ra * Math.cos(d), A[1] - ra * Math.sin(d), { cls: 'dim thin' });
      f.label(A[0] + 20 * Math.cos(d) + 7, A[1] - 20 * Math.sin(d) - 7, 'a', 'c', 'small');
      f.line(B[0] + 9 * Math.cos(d), B[1] - 9 * Math.sin(d), B[0] + rb * Math.cos(d), B[1] - rb * Math.sin(d), { cls: 'dim thin' });
      f.label(B[0] + 24 * Math.cos(d) + 7, B[1] - 24 * Math.sin(d) - 7, 'b', 'c', 'small');
      f.dot(cx, cy, 2.2); f.line(cx, cy, cx, cy - R, { cls: 'dim thin' }); f.tag(cx, cy - R, 'R', 't', 6);
      if (o.sol) {
        signsAt(f, circ(A[0], A[1], ra), A[0], A[1], [45, 190, 250, 305], -1, 7, false);
        signsAt(f, circ(B[0], B[1], rb), B[0], B[1], [60, 190, 240, 290], -1, 7, false);
        signsAt(f, circ(cx, cy, R), cx, cy, [0, 30, 60, 120, 150, 180, 210, 240, 270, 300, 330], 1, -9, false);
      }
      if (o.qc) f.charge(cx + R + 60, cy - 70, { q: '+', lab: 'q_c', at: 'r' });
      return f.svg();
    };
    const plotHW40 = () => PF.plot({ w: 340, h: 210, x: [0, 2.2], y: [0, 6], xl: 's', yl: '\\lvert\\vb E\\rvert\\ \\ (q_a/4\\pi\\varepsilon_0a^2)', xt: [[1, 'a'], [1.5, 'b']], yt: [[1, '1'], [4, '4']],
      curves: [
        { f: (s) => (s <= 1 ? 1 / (s * s) : 0), from: 0.38, to: 2.2, n: 500 },
        { f: (s) => (s <= 1.5 ? 2 / (s * s) : 0), from: 0.55, to: 2.2, n: 500, cls: 'dash' },
      ] });
    const fOff = () => {
      const f = PF.fig(), cx = 130, cy = 110, R = 80, C2 = [108, 122], rc = 34;
      metal(f, [circ(cx, cy, R), circ(C2[0], C2[1], rc)]);
      f.charge(C2[0] - 12, C2[1] + 6, { q: '+', lab: 'q', at: 'r' });
      f.label(cx, cy - R - 12, '\\text{net charge } Q', 'b', 'small');
      f.dot(cx, cy, 2.2);
      return f.svg();
    };

    return {
      id: 'u3-cavities', title: 'Cavities, shielding and induced charge',
      steps: [
        RF(md`
          ### Property 6: an empty cavity has no field (Faraday cage)

          If a conductor with an empty cavity is placed in an external field, the field in the cavity is zero.

          The lecture's argument. Suppose not. Then some field line runs through the cavity. There is no charge in the cavity, so the line has to start and end on the cavity wall (on $+$ and $-$ wall charge). Close it into a loop by returning through the metal (dashed). Along the field line, $\vb E\cdot d\vb l>0$ at every step; through the metal, $\vb E = 0$. So $\oint\vb E\cdot d\vb l>0$, which is impossible: $\oint\vb E\cdot d\vb l = 0$ for every electrostatic field. Hence $\vb E = 0$ in the cavity, and the cavity wall carries no charge at all ($\sigma = 0$ everywhere on it, not just zero in total).

          [[fig:far]]

          This is why you are safe from electrocution inside a car during a lightning strike: the car is a **Faraday cage**. The external field is cancelled at the outer surface by induced charge and never reaches the inside. Sensitive equipment is shielded the same way, and even a wire mesh works well.
        `, { far: { svg: fFaraday(), cap: 'A conductor with an empty cavity in an external field. If a field line (thick) crossed the cavity, closing it through the metal (dashed) would give $\\oint\\vb E\\cdot d\\vb l>0$.' } }),

        Q(md`A conductor with an empty cavity sits in a strong external field. What charge is on the cavity wall?`,
          [md`$+$ on one side and $-$ on the other, totalling zero`, md`None, anywhere on the wall`, md`A charge equal and opposite to the charge on the outer surface`, md`It depends on the shape of the cavity`], 1,
          [md`Wall charges of opposite sign would send a field line across the cavity, and the loop argument rules that out.`, null, md`The outer surface carries the induced charge that cancels the external field; the cavity wall carries nothing.`, md`The argument works for any shape.`],
          md`With $\vb E = 0$ both in the metal and in the cavity, the jump condition $E_{\perp,\text{above}} - E_{\perp,\text{below}} = \sigma/\varepsilon_0$ gives $\sigma = 0$ at every point of the wall. All the induced charge sits on the **outer** surface.`,
          { figHtml: fFaraday(true) }),

        Q(md`The external field around the conductor is doubled. The field inside the empty cavity`,
          [md`doubles`, md`increases, but by less than a factor of two`, md`reverses`, md`stays zero`], 3,
          [md`The induced charge on the outer surface doubles too, and still cancels the field everywhere inside the outer surface.`,
            md`Shielding is complete in electrostatics, not partial.`,
            md`Nothing inside changes; it stays zero.`,
            null],
          md`Whatever the external field, the outer surface charge rearranges to make $\vb E = 0$ in the metal, and the loop argument then forces $\vb E = 0$ in the empty cavity. Shielding doesn't weaken as the outside field grows.`,
          { figHtml: fFaraday(true) }),

        Q(md`The proof that an empty cavity is field-free relies on which fact?`,
          [md`$\oint\vb E\cdot d\vb a = Q_{\text{enc}}/\varepsilon_0$ for a surface around the cavity`, md`The cavity is spherical`, md`$V = 0$ on the cavity wall`, md`$\oint\vb E\cdot d\vb l = 0$ around any closed loop`], 3,
          [md`Gauss's law only shows that the **total** wall charge is zero; it allows $+$ on one side and $-$ on the other. The loop argument is what kills that.`,
            md`No assumption about shape is needed.`,
            md`The wall is at the conductor's potential, which needn't be zero. What matters is that it is **one** constant.`,
            null],
          md`A field line from $+$ wall charge to $-$ wall charge, closed through the metal, would give $\oint\vb E\cdot d\vb l>0$. Since $\curl\vb E = 0$, that's impossible. (Equivalently: the whole wall is one equipotential, and a field line always runs downhill in $V$, so it can't start and end at the same potential.)`,
          { nofig: 'Question about the logic of the proof.' }),

        Q(md`Instead of solid metal, the enclosure is a metal mesh (like chicken wire). The field inside is`,
          [md`exactly zero, as for solid metal`, md`the same as outside, since the field passes through the holes`, md`very nearly zero far from the holes; a fine mesh shields almost as well as solid metal`, md`stronger than outside, because the wires concentrate the field`], 2,
          [md`The loop argument needs a closed metal surface. With holes, a little field leaks in near them.`, md`The induced charges on the wires still cancel most of the field; only small fringing fields poke through the holes.`, null, md`The field is concentrated near the wires on the **outside**; inside it is strongly reduced.`],
          md`Griffiths: "chicken wire will often suffice". The leak-through dies off within a distance comparable to the mesh spacing, so a mesh with small holes is an excellent shield.`,
          { nofig: 'Practical question; no new geometry.' }),

        RF(md`
          ### Property 7: a charge in the cavity makes the conductor look charged

          Put a charge $+q$ in the cavity. $\vb E = 0$ in the metal still, so the metal must compensate. Take a Gaussian surface that lies entirely in the metal and surrounds the cavity: $\vb E = 0$ on it, so $\Qenc = 0$,

          $$q + q_{\text{wall}} = 0\quad\Longrightarrow\quad q_{\text{wall}} = -q .$$

          If the conductor was neutral, charge conservation puts $+q$ on its **outer** surface. From outside, the conductor looks charged.

          [[fig:cav]]

          The notes: "We have lost all information about the charge location." Move $q$ around inside the cavity, and the $-q$ on the wall rearranges to follow it, but nothing outside changes.

          ### Griffiths Ex. 2.10: what does the outside see?

          An uncharged spherical conductor has a cavity of some odd shape, with $q$ somewhere inside it. The field outside is

          $$\vb E = \frac{q}{4\pi\varepsilon_0r^2}\uv r,$$

          measured from the centre of the **sphere**, whatever the shape of the cavity and wherever $q$ sits. Reason: $q$ together with the $-q$ on the cavity wall produces zero field in the metal and beyond. The leftover $+q$ on the outer surface therefore feels no influence from inside and spreads exactly as on an isolated sphere: uniformly.

          [[fig:ex]]

          (Is it obvious that $q$ and the wall's $-q$ cancel by themselves outside? Griffiths admits it isn't quite. The uniqueness theorem of Chapter 3 settles it: there is only one way to arrange the charge so that $\vb E = 0$ in the metal, and the arrangement above works.)
        `, { cav: { svg: fCav({ gauss: true }), cap: 'Lecture 7: $+q$ in a cavity. The wall carries $-q$ (Gauss, with the dashed surface in the metal); the outer surface carries $+q$.' }, ex: { svg: fEx210(), cap: 'Griffiths Ex. 2.10: an odd cavity with $q$ off-centre in a neutral metal sphere. Outside, the field is that of $q$ at the centre of the sphere.' } }),

        Q(md`A neutral conductor has a cavity containing a point charge $+q$. The total charge on the cavity wall is`,
          [md`$0$, since the conductor is neutral`, md`$+q$`, md`$-q/2$`, md`$-q$`], 3,
          [md`The **conductor** is neutral overall; its charge splits into $-q$ on the wall and $+q$ outside.`, md`The wall charge must cancel $q$'s field in the metal, so it has the opposite sign.`, md`Gauss with a surface in the metal: $q + q_{\text{wall}} = 0$ exactly.`, null],
          md`A Gaussian surface inside the metal around the cavity has $\vb E = 0$ on it, so it encloses zero charge: $q_{\text{wall}} = -q$, regardless of the cavity's shape or where $q$ sits.`,
          { figHtml: fCav({ bare: true }) }),

        Q(md`Same neutral conductor. The total charge on its **outer** surface is`,
          [md`$+q$`, md`$0$`, md`$-q$`, md`it depends on where $q$ sits in the cavity`], 0,
          [null, md`The conductor is neutral: if $-q$ went to the wall, $+q$ is left over and must sit on the outer surface (no charge in the metal itself).`, md`That's the cavity wall.`, md`Only the total matters: $0 - (-q) = +q$, wherever $q$ is.`],
          md`Charge conservation: conductor total $= q_{\text{wall}} + q_{\text{outer}} = 0$, so $q_{\text{outer}} = +q$. That's why the conductor "looks charged" from outside.`,
          { figHtml: fCav({ bare: true }) }),

        Q(md`The charge $q$ is moved from the middle of the cavity to a spot close to the cavity wall. What changes?`,
          [md`The field outside the conductor`, md`The charge distribution on the outer surface`, md`Only the distribution of the $-q$ on the cavity wall (and the field in the cavity)`, md`Nothing at all, inside or outside`], 2,
          [md`The outside sees only the total charge on the outer surface, which hasn't changed, and its distribution, which doesn't depend on the inside.`, md`The outer charge is shielded from the inside: it arranges itself as if the cavity weren't there.`, null, md`Inside the cavity things do change: the wall charge crowds toward $q$.`],
          md`The wall charge rearranges to keep cancelling $q$'s field in the metal. Outside, nothing changes: "we have lost all information about the charge location". Shielding works for the outside world.`,
          { figHtml: fCav({ bare: true }) }),

        Q(md`In Griffiths Ex. 2.10 the cavity is irregular and $q$ is off-centre. The surface charge on the **cavity wall** is`,
          [md`uniform, $-q/A_{\text{wall}}$`, md`denser where the wall is closest to $q$`, md`zero, as in an empty cavity`, md`positive near $q$`], 1,
          [md`Uniform would cancel $q$'s field in the metal only for a spherical cavity with $q$ at its centre.`, null, md`The cavity isn't empty: it must carry $-q$ in total.`, md`Near $q$ the wall charge is attracted: it's negative, and densest there.`],
          md`The $-q$ on the wall has to cancel $q$'s field everywhere in the metal, so it crowds toward $q$, like the induced charge under a point charge near a plane (images, Lecture 10). Only a centred charge in a spherical cavity gives a uniform wall charge.`,
          { figHtml: fEx210(true) }),

        Q(md`In the same example, the charge on the **outer** surface of the sphere is`,
          [md`$+q$, crowded toward the side nearest the cavity`, md`$+q$, crowded toward the side nearest $q$`, md`$+q$, uniform`, md`zero, since the conductor is neutral`], 2,
          [md`The outer charge feels no field from the inside, so the position of the cavity is invisible to it.`, md`The inside is shielded from the outer charge's point of view; $q$'s location doesn't matter.`, null, md`Neutral overall means outer $= -(\text{wall}) = +q$.`],
          md`$q$ plus the wall's $-q$ produce zero field in the metal and beyond, so the outer $+q$ is like charge on an isolated sphere: uniform. The field outside is $\dfrac{q}{4\pi\varepsilon_0r^2}\uv r$ from the sphere's centre.`,
          { figHtml: fEx210(true) }),

        Q(md`A point charge $q$ sits off-centre in a **spherical** cavity in a big piece of metal. Is the force on $q$ zero?`,
          [md`Yes: the field in the cavity is zero`, md`Yes: the metal shields it`, md`No: the wall charge crowds toward $q$ and pulls it toward the nearer wall`, md`No: $q$ is pushed toward the centre`], 2,
          [md`The field in a cavity is zero only if the cavity is **empty**. Here the wall charge makes a field at $q$.`, md`Shielding stops **outside** fields from reaching $q$. The cavity's own wall charge still acts on it.`, null, md`The induced charge is opposite to $q$ and densest on the near wall, so it attracts $q$ outward, not inward.`],
          md`The wall's $-q$ is densest near $q$ and attracts it toward the nearest wall. Only when $q$ is exactly at the centre of a spherical cavity is the wall charge uniform and the force zero (and that equilibrium is unstable). Compare the two-cavity homework problem, where each charge sits at its cavity's centre.`,
          { nofig: 'Described in words; it is the same as the figure above with a spherical cavity.' }),

        Q(md`A conductor carries net charge $Q$ and has a cavity containing $q$. The charge on its outer surface is`,
          [md`$Q$`, md`$Q + q$`, md`$Q - q$`, md`$q$`], 1,
          [md`The wall took $-q$ from the conductor's charge, which leaves $Q + q$ for the outer surface.`, null, md`The wall carries $-q$, so the outer surface carries $Q - (-q)$.`, md`That ignores the conductor's own net charge $Q$.`],
          md`Wall: $-q$ (Gauss). Conductor total: $Q = q_{\text{wall}} + q_{\text{outer}}$, so $q_{\text{outer}} = Q + q$. The field far away is that of $Q + q$, the total charge inside a big sphere around everything.`,
          { figHtml: fOff() }),

        RF(md`
          ### Cavities in boundary-condition language

          A conductor with a cavity splits space into two problems that share just one number, the conductor's potential $V_c$:

          - **Inside the cavity:** the source is $q$; on the cavity wall $V = V_c$; the wall's total charge is $-q$.
          - **Outside the conductor:** on the outer surface $V = V_c$; the outer surface carries $Q_{\text{net}} + q$; $V\to0$ far away (plus whatever external charges there are).

          Moving $q$ around in the cavity changes nothing in the outside problem, so the outside field and $V_c$ stay put. Bringing charges near from outside changes $V_c$, but inside the cavity that only adds a constant to $V$, and a constant has no gradient: the cavity field is unchanged. The shielding works both ways.

          !!key The cavity rule
            A charge $q$ in a cavity puts exactly $-q$ on the cavity wall. If the conductor is isolated with net charge $Q$, the outer surface gets $Q + q$; if it is grounded (and nothing else is outside), the outer surface gets $0$.
        `),

        Q(md`The conductor around the cavity is now grounded (and nothing else is nearby). Which statement is right?`,
          [md`$V = 0$ on the cavity wall and on the outer surface; the wall carries $-q$; the outer surface carries no charge`, md`$V = 0$ only on the outer surface; the cavity wall is at $q/(4\pi\varepsilon_0 r)$`, md`The wall charge drains away to the ground along with the outer charge`, md`The field in the cavity drops to zero`], 0,
          [null, md`The whole conductor is one equipotential, including the cavity wall.`, md`The wall's $-q$ is held by $q$'s field and is needed to keep $\vb E = 0$ in the metal; only the outer $+q$ drains away.`, md`The cavity still contains $q$, so the field there is $q$'s field plus that of the wall charge, as before.`],
          md`Grounding fixes $V_c = 0$ on every surface of the conductor. Gauss still requires $-q$ on the wall. Outside, $V = 0$ on the outer surface and $V\to0$ at infinity with no charges outside: the solution is $V = 0$ everywhere outside, so the outer surface charge ($\sigma = -\varepsilon_0\,\partial V/\partial n$) is zero. The outer $+q$ went to ground.`,
          { figHtml: fCav({ ground: true, bare: true }) }),

        RF(md`
          ### Worked example: a charge inside a thick shell, isolated or grounded

          A point charge $q$ sits at the centre of a neutral metal shell with inner radius $a$ and outer radius $b$.

          [[fig:sh]]

          **Conditions.** The shell is one conductor: $V = V_c$ and $\vb E = 0$ for $a\le r\le b$. The cavity wall carries $-q$. Case (i): isolated and neutral, so its total charge is zero. Case (ii): grounded, so $V_c = 0$. Far away, $V\to0$.

          **Charges.** The wall charge $-q$ is uniform by symmetry: $\sigma_a = -\dfrac{q}{4\pi a^2}$. (i) The neutral shell keeps $+q$ on the outside: $\sigma_b = +\dfrac{q}{4\pi b^2}$. (ii) Outside, $V = \dfrac{Q_{\text{out}}}{4\pi\varepsilon_0 r}$, and $V(b) = 0$ forces $Q_{\text{out}} = 0$: the $+q$ drains to ground.

          **Fields.** $E = \dfrac{q}{4\pi\varepsilon_0r^2}$ for $r<a$ in both cases, zero in the metal, and outside either $\dfrac{q}{4\pi\varepsilon_0r^2}$ (i) or zero (ii).

          **Potentials** (come in from infinity). (i) $V = \dfrac{q}{4\pi\varepsilon_0r}$ outside, so $V_c = \dfrac{q}{4\pi\varepsilon_0b}$, and inside the cavity $V(r) = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1b + \dfrac1r - \dfrac1a\right)$. (ii) $V = 0$ outside and in the metal, and in the cavity $V(r) = \dfrac{q}{4\pi\varepsilon_0}\left(\dfrac1r - \dfrac1a\right)$.

          Grounding changed $V$ in the cavity only by the constant $\dfrac{q}{4\pi\varepsilon_0b}$, so the cavity field is the same in both cases.
        `, { sh: { svg: fShellQ(false), cap: 'A charge $q$ at the centre of a thick neutral shell, inner radius $a$, outer radius $b$.' } }),

        Q(md`For the shell in the worked example, grounding the shell changes`,
          [md`the charge on the inner surface, from $-q$ to $0$`, md`the field in the cavity`, md`the charge on the outer surface (from $+q$ to $0$) and the field outside`, md`nothing, since the shell was neutral already`], 2,
          [md`The inner surface keeps $-q$: Gauss with a surface in the metal still demands it.`, md`The cavity potential shifts by a constant, which changes no field.`, null, md`Neutral is not the same as $V = 0$. The isolated shell sits at $q/(4\pi\varepsilon_0 b)$; grounding pulls it to 0 by draining the outer $+q$.`],
          md`Isolated: outer $+q$, field outside $\dfrac{q}{4\pi\varepsilon_0r^2}$, shell at $V_c = \dfrac{q}{4\pi\varepsilon_0b}$. Grounded: outer charge $0$, field outside $0$, $V_c = 0$. Inner surface and cavity field: unchanged.`,
          { figHtml: fShellQ(true) }),

        P({
          id: 'HW3-2.39', src: 'HW 3 · Griffiths 2.39', title: 'A metal sphere inside a thick metal shell', big: true,
          q: md`
            A metal sphere of radius $R$, carrying charge $q$, is surrounded by a thick concentric metal shell (inner radius $a$, outer radius $b$, as in Fig. 2.48). The shell carries no net charge.

            (a) Find the surface charge density $\sigma$ at $R$, at $a$, and at $b$.

            (b) Find the potential at the center, using infinity as the reference point.

            (c) Now the outer surface is touched to a grounding wire, which drains off charge and lowers its potential to zero (same as at infinity). How do your answers to (a) and (b) change?
          `,
          figHtml: fHW39(false),
          hints: [
            md`Conditions first. Two conductors: the sphere (charge $q$) and the shell (neutral; grounded in (c)). In each, $\vb E = 0$ and $V$ is constant. Everything is spherically symmetric, so every $\sigma$ is uniform.`,
            md`Gaussian sphere inside the shell's metal ($a<r<b$): $\vb E = 0$ there, so the enclosed charge is zero. The sphere's $q$ is on its surface; what must be on the shell's inner surface? Then use the shell's neutrality for the outer surface.`,
            md`For (b), integrate $\vb E$ in from infinity: $E = \dfrac{q}{4\pi\varepsilon_0 r^2}$ for $r>b$, zero for $a<r<b$, $\dfrac{q}{4\pi\varepsilon_0 r^2}$ for $R<r<a$, zero inside the sphere. $V(0) = V(R)$.`,
            md`For (c): grounding sets $V(b) = 0$. Outside, $V = Q_b/(4\pi\varepsilon_0 r)$ where $Q_b$ is the outer-surface charge. What must $Q_b$ be? Do the inner charges care?`,
          ],
          parts: [
            { lbl: md`(a) $\sigma_R$`, expr: 'q/(4*pi*R^2)', vars: { q: [0.5, 3], R: [0.5, 2] } },
            { lbl: md`(a) $\sigma_a$`, expr: '-q/(4*pi*a^2)', vars: { q: [0.5, 3], a: [0.5, 2] } },
            { lbl: md`(a) $\sigma_b$`, expr: 'q/(4*pi*b^2)', vars: { q: [0.5, 3], b: [0.5, 2] } },
            { lbl: md`(b) $V(0)$`, expr: 'q/(4*pi*eps0)*(1/b + 1/R - 1/a)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 1], a: [1.5, 2.5], b: [3, 4] }, accepts: ['q*(a*R + a*b - b*R)/(4*pi*eps0*a*b*R)'] },
            { lbl: md`(c) After grounding, the surface charge densities are`, mc: [md`$\sigma_R$ and $\sigma_a$ unchanged, $\sigma_b = 0$`, md`all three become zero`, md`$\sigma_R$ unchanged, $\sigma_a = \sigma_b = 0$`, md`unchanged: the shell was neutral already`], a: 0,
              why: [null, md`The sphere's charge $q$ is isolated from the ground (the sphere doesn't touch the shell), so it stays. And $\sigma_a = -q/4\pi a^2$ is still needed to make $\vb E = 0$ in the shell.`, md`The inner surface still needs $-q$ (Gauss inside the shell). Only the outer surface drains.`, md`Neutral isn't the same as $V = 0$; before grounding the shell sits at $q/(4\pi\varepsilon_0 b)$.`] },
            { lbl: md`(c) $V(0)$ after grounding`, expr: 'q/(4*pi*eps0)*(1/R - 1/a)', vars: { q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 1], a: [1.5, 2.5] }, accepts: ['q*(a - R)/(4*pi*eps0*a*R)'] },
          ],
          sol: md`
            **Conditions.** Two conductors. The sphere: $V$ constant, $\vb E = 0$ inside, total charge $q$ (it's isolated even in (c): it doesn't touch the shell). The shell: $V$ constant, $\vb E = 0$ in $a<r<b$, total charge $0$ in (a)–(b); in (c) $V = 0$ instead. Far away $V\to0$. Spherical symmetry makes each $\sigma$ uniform.

            **(a)** All of the sphere's charge is on its surface: $\sigma_R = \dfrac{q}{4\pi R^2}$. Gaussian sphere in the shell's metal (dashed below): $E = 0$ on it, so $\Qenc = q + Q_a = 0$, giving $Q_a = -q$ and $\sigma_a = -\dfrac{q}{4\pi a^2}$. The shell is neutral, so $Q_b = +q$: $\sigma_b = \dfrac{q}{4\pi b^2}$.

            [[fig:charges]]

            **(b)** Come in from infinity, one region at a time:

            - $r>b$: $V(r) = \dfrac{q}{4\pi\varepsilon_0 r}$ (total enclosed $q$), so $V(b) = \dfrac{q}{4\pi\varepsilon_0 b}$.
            - $a<r<b$ (metal): $E = 0$, so $V(a) = V(b)$.
            - $R<r<a$: $E = \dfrac{q}{4\pi\varepsilon_0 r^2}$, so $V(R) = V(a) - \displaystyle\int_a^R\frac{q}{4\pi\varepsilon_0 r^2}\,dr = V(a) + \frac{q}{4\pi\varepsilon_0}\left(\frac1R - \frac1a\right)$.
            - $r<R$ (metal): $V = V(R)$.

            $$V(0) = \frac{q}{4\pi\varepsilon_0}\left(\frac1b + \frac1R - \frac1a\right).$$

            **(c)** Grounding sets $V(b) = 0$. Outside, $V = \dfrac{Q_b}{4\pi\varepsilon_0 r}$, so $Q_b = 0$: the $+q$ on the outer surface drains away, $\sigma_b = 0$. Nothing else changes: the sphere keeps $q$, and the shell's inner surface still needs $-q$. The field between $R$ and $a$ is the same, so $V(0)$ just loses the $\dfrac{q}{4\pi\varepsilon_0 b}$ that used to come from outside:

            $$V(0) = \frac{q}{4\pi\varepsilon_0}\left(\frac1R - \frac1a\right).$$

            [[fig:V]]

            **Checks.** $V(0)>0$ in both cases since $R<a$. If $a\to R$ (shell touching the sphere), the grounded answer goes to 0, as it should: the sphere would then be grounded too. If $b\to\infty$ the isolated answer reduces to the grounded one.
          `,
          figs: { charges: { svg: fHW39(true), cap: 'Charges: $+q$ on the sphere, $-q$ on the shell\'s inner surface, $+q$ on its outer surface (before grounding). The dashed sphere in the metal is the Gaussian surface.' },
            V: { svg: plotHW39(), cap: '$V(r)$ with $a = 2R$, $b = 3R$. Solid: isolated shell. Dashed: grounded shell. Flat where there is metal.' } },
        }),

        P({
          id: 'HW3-2.40', src: 'HW 3 · Hybrid 2.40', title: 'Two cavities with charges', big: true,
          q: md`
            Two spherical cavities, of radii $a$ and $b$, are hollowed out from the interior of a (neutral) conducting sphere of radius $R$ (Fig. 2.49). At the center of each cavity a point charge is placed—call these charges $q_a$ and $q_b$.

            (a) Find the surface charge densities $\sigma_a$, $\sigma_b$, and $\sigma_R$.

            (b) What is the field outside the conductor?

            (c) What is the field within each cavity? Plot the field within each cavity.

            (d) What is the force on $q_a$ and $q_b$?
          `,
          figHtml: fHW40(),
          hints: [
            md`Conditions first. One conductor (neutral, isolated), with $\vb E = 0$ in the metal and one constant $V$. Each cavity wall must carry minus the charge in its cavity (Gauss with a surface in the metal around that cavity).`,
            md`Each charge is at the centre of a spherical cavity, so its wall charge is uniform. Neutrality fixes the charge on the outer surface. The inside is shielded from the outer surface, so the outer charge spreads as on an isolated sphere.`,
            md`For (c): the cavity's field comes only from its own point charge and its own (uniform, spherical) wall charge. A uniform spherical shell of charge makes no field inside itself.`,
            md`For (d): what field acts on $q_a$, apart from its own?`,
          ],
          parts: [
            { lbl: md`(a) $\sigma_a$`, expr: '-qa/(4*pi*a^2)', vars: { qa: [0.5, 3], a: [0.5, 2] } },
            { lbl: md`(a) $\sigma_b$`, expr: '-qb/(4*pi*b^2)', vars: { qb: [0.5, 3], b: [0.5, 2] } },
            { lbl: md`(a) $\sigma_R$`, expr: '(qa + qb)/(4*pi*R^2)', vars: { qa: [0.5, 3], qb: [0.5, 3], R: [2, 4] } },
            { lbl: md`(b) $E$ outside, at distance $r$ from the centre of the big sphere (radial)`, expr: '(qa + qb)/(4*pi*eps0*r^2)', vars: { qa: [0.5, 3], qb: [0.5, 3], eps0: [0.5, 2], r: [2, 5] } },
            { lbl: md`(c) $E$ in cavity $a$, at distance $s$ from its centre (radial from $q_a$)`, expr: 'qa/(4*pi*eps0*s^2)', vars: { qa: [0.5, 3], eps0: [0.5, 2], s: [0.2, 1] } },
            { lbl: md`(d) The force on $q_a$ is`, mc: [md`$\dfrac{q_aq_b}{4\pi\varepsilon_0 d^2}$, the Coulomb force from $q_b$ a distance $d$ away`, md`toward the nearer part of the outer surface`, md`zero`, md`$\dfrac{q_a(q_a+q_b)}{4\pi\varepsilon_0R^2}$, from the outer surface charge`], a: 2,
              why: [md`The metal shields the cavities from each other: $q_b$ together with its wall charge makes no field outside cavity $b$, so $q_a$ feels nothing from it.`, md`The outer surface charge is shielded from cavity $a$, and it is uniform anyway.`, null, md`The outer charge produces no field inside the metal or the cavities.`] },
          ],
          sol: md`
            **Conditions.** One isolated, neutral conductor: $\vb E = 0$ in the metal, $V = V_c$ on every surface (both cavity walls and the outer surface). Wall of cavity $a$ carries $-q_a$, wall of cavity $b$ carries $-q_b$ (Gauss). Total conductor charge zero. $V\to0$ far away.

            **(a)** Gauss with a surface in the metal around cavity $a$: wall charge $-q_a$. With $q_a$ at the centre of a spherical cavity, symmetry makes it uniform:

            $$\sigma_a = -\frac{q_a}{4\pi a^2},\qquad \sigma_b = -\frac{q_b}{4\pi b^2}.$$

            The conductor is neutral, so the outer surface carries $q_a + q_b$. Each charge plus its wall makes zero field outside its cavity (a point charge at the centre of an opposite uniform shell), so the outer charge feels nothing from inside and spreads uniformly:

            $$\sigma_R = \frac{q_a+q_b}{4\pi R^2}.$$

            [[fig:ch]]

            **(b)** Outside, only the uniform outer charge counts: $\vb E = \dfrac{q_a+q_b}{4\pi\varepsilon_0 r^2}\uv r$, with $r$ measured from the centre of the big sphere, as if all the charge sat there.

            **(c)** In cavity $a$, the field comes from $q_a$ and from its uniform wall charge. A uniform spherical shell makes no field inside itself, and nothing else reaches into the cavity (shielding). So

            $$\vb E = \frac{q_a}{4\pi\varepsilon_0 s^2}\hat{\vb s}\quad(0<s<a),$$

            with $\vb s$ measured from the centre of cavity $a$. Likewise $\vb E = \dfrac{q_b}{4\pi\varepsilon_0 s^2}\hat{\vb s}$ in cavity $b$. Each falls as $1/s^2$ out to the wall and drops to zero in the metal:

            [[fig:plot]]

            **(d)** The field acting on $q_a$, apart from its own, is that of its wall charge (zero inside a uniform shell) plus that of everything outside cavity $a$ (zero, by shielding). So **the force on $q_a$ is zero**, and likewise for $q_b$. They don't feel each other at all: the metal in between cancels their interaction.

            **What to remember.** Each cavity is its own little world: charge $q$, wall $-q$, nothing gets in or out. The outside sees only the total, $q_a + q_b$, spread uniformly over the sphere.
          `,
          figs: { ch: { svg: fHW40({ sol: true }), cap: 'Wall charges $-q_a$ and $-q_b$, uniform; the outer surface carries $q_a+q_b$, uniform.' },
            plot: { svg: plotHW40(), cap: '$\\lvert\\vb E\\rvert$ against distance $s$ from each cavity\'s centre, for $q_b = 2q_a$ and $b = 1.5a$. Solid: cavity $a$. Dashed: cavity $b$. Each is the point-charge field out to the wall, then zero in the metal.' } },
        }),

        Q(md`A third charge $q_c$ is now brought near the outside of the conductor. Which of these changes?`,
          [md`$\sigma_a$ and $\sigma_b$`, md`$\sigma_R$, which is no longer uniform`, md`The field inside the cavities`, md`The total charge on the outer surface`], 1,
          [md`The cavity walls are shielded from $q_c$; their charge still just cancels $q_a$ and $q_b$ in the metal.`, null, md`$q_c$'s influence is cancelled at the outer surface. The cavities feel nothing.`, md`The total on the outer surface stays $q_a + q_b$ (charge conservation); only its distribution changes.`],
          md`$q_c$ induces a non-uniform rearrangement of the outer surface charge (still totalling $q_a+q_b$), and the field outside becomes that of $q_c$ plus a non-uniform conductor. Everything inside the outer surface is shielded: $\sigma_a$, $\sigma_b$ and the cavity fields stay the same.`,
          { figHtml: fHW40({ qc: true }) }),

        Q(md`With $q_c$ nearby, the forces on $q_a$ and $q_b$ are`,
          [md`still zero`, md`toward $q_c$, if $q_c$ is negative`, md`away from $q_c$, if $q_c$ is positive`, md`nonzero, but reduced by the metal`], 0,
          [null, md`The metal's outer-surface charge rearranges to cancel $q_c$'s field everywhere inside the outer surface, including in the cavities.`, md`No field from $q_c$ reaches the cavities, whatever its sign.`, md`In electrostatics the shielding is complete, not partial.`],
          md`Inside each cavity the field is still just $q$'s own plus that of its uniform wall charge. The force on each is zero. (The conductor **as a whole** does feel a force from $q_c$, through its outer surface charge, but $q_a$ and $q_b$ don't.)`,
          { figHtml: fHW40({ qc: true }) }),

        Q(md`With $q_c$ nearby, the potential inside each cavity`,
          [md`is unchanged everywhere`, md`changes by an amount that varies across the cavity, pointing the field toward $q_c$`, md`shifts by the same constant everywhere in the cavities (the conductor's new potential), so the cavity fields are unchanged`, md`drops to zero`], 2,
          [md`The conductor's potential $V_c$ does change when $q_c$ comes near, and every point in the cavities moves with it.`, md`A varying change would mean a field from $q_c$ inside the cavity; shielding rules that out.`, null, md`Only grounding would pin $V_c$ to zero.`],
          md`The walls stay equipotentials at the conductor's potential $V_c$, which changes when $q_c$ is brought near. Inside each cavity $V$ shifts by that same constant, which has zero gradient: no change in $\vb E$. That's the boundary-condition view of shielding.`,
          { figHtml: fHW40({ qc: true }) }),

        P({
          title: 'Off-centre charge in a charged conductor',
          q: md`A metal sphere of radius $R$ carries net charge $Q$. Inside it is a spherical cavity, off-centre, containing a point charge $q$ that is also off the cavity's centre. Find the charge on the cavity wall, the charge on the outer surface, and the field outside, a distance $r$ from the centre of the big sphere.`,
          figHtml: fOff(),
          hints: [md`Conditions: one isolated conductor with net charge $Q$; $\vb E = 0$ in the metal.`, md`Gauss in the metal around the cavity gives the wall charge. Conservation gives the outer charge.`, md`Is the outer charge uniform? What does the outside know about the inside?`],
          parts: [
            { lbl: md`cavity wall charge`, expr: '-q', vars: { q: [0.5, 3] } },
            { lbl: md`outer surface charge`, expr: 'Q + q', vars: { Q: [0.5, 3], q: [0.5, 3] } },
            { lbl: md`E(r) outside`, expr: '(Q + q)/(4*pi*eps0*r^2)', vars: { Q: [0.5, 3], q: [0.5, 3], eps0: [0.5, 2], r: [2, 5] } },
            { lbl: md`The charge density on the cavity wall is`, mc: [md`uniform`, md`largest (most negative) on the part of the wall nearest $q$`, md`zero where the wall is farthest from $q$, and $-q$ concentrated at the nearest point`], a: 1,
              why: [md`Uniform would require $q$ at the centre of the spherical cavity; here it is off-centre.`, null, md`It is spread over the whole wall, just denser near $q$; it isn't zero anywhere.`] },
          ],
          sol: md`
            **Conditions.** One isolated conductor: $\vb E = 0$ in the metal, one potential $V_c$, total charge $Q$. Far away $V\to0$.

            **Wall:** Gauss with a surface in the metal around the cavity: $q_{\text{wall}} = -q$, non-uniform (densest near $q$, since $q$ is off-centre).

            **Outer surface:** $Q = q_{\text{wall}} + q_{\text{outer}}$, so $q_{\text{outer}} = Q + q$. The outer charge is shielded from the inside, so on this isolated sphere it is **uniform**, whatever the positions of the cavity and $q$.

            **Outside:** $\vb E = \dfrac{Q+q}{4\pi\varepsilon_0r^2}\uv r$, centred on the big sphere.
          `,
        }),

        RF(md`
          !!key Patterns to remember
            - Empty cavity: $\vb E = 0$ inside and no charge on its wall (Faraday cage). Proof: $\oint\vb E\cdot d\vb l = 0$.
            - Charge $q$ in a cavity: wall carries exactly $-q$ (Gauss in the metal); outer surface carries $Q_{\text{net}} + q$ (or $0$ if grounded).
            - The outside sees only the total; for a spherical outer surface its charge is uniform. The inside doesn't see outside charges; outside changes only shift $V$ in the cavity by a constant.
            - Wall charge is uniform only for a charge at the centre of a spherical cavity; otherwise it crowds toward the charge (and pulls it toward the wall).
            - Grounding drains the outer charge and sets $V = 0$ on the conductor; inner charges and cavity fields don't change.
            - Solving: list the conditions (potential or charge for each conductor, $-q$ on each cavity wall), then integrate $\vb E$ in from infinity region by region.
        `),
      ],
    };
  };

  // ===================================================================================== Lesson 7
  const L7 = () => {
    const fPillA = () => {
      const f = PF.fig();
      f.line(0, 70, 210, 70, { cls: 'thick' });
      for (const x of [20, 50, 80, 170, 200]) glyph(f, x, 62, 1);
      f.arrow(110, 62, 110, 20); f.arrow(110, 78, 110, 120);
      f.label(118, 34, '\\sigma/2\\varepsilon_0', 'l', 'small');
      f.label(118, 108, '\\sigma/2\\varepsilon_0', 'l', 'small');
      f.rect(140, 52, 22, 36, { cls: 'dash' });
      f.label(214, 70, '\\sigma', 'l');
      return f.svg();
    };
    const fPillB = () => {
      const f = PF.fig();
      f.plane(0, 210, 70);
      for (const x of [20, 50, 80, 170, 200]) glyph(f, x, 62, 1);
      f.arrow(110, 62, 110, 20);
      f.label(118, 34, '\\sigma/\\varepsilon_0', 'l', 'small');
      f.rect(140, 52, 22, 36, { cls: 'dash' });
      f.label(105, 94, '\\vb E = 0\\ \\text{in the metal}', 't', 'small');
      return f.svg();
    };
    const fSurfP = () => {
      const f = PF.fig();
      f.plane(0, 220, 80);
      for (const x of [20, 55, 90, 160, 195]) glyph(f, x, 72, 1);
      f.dot(125, 58, 3); f.tag(125, 58, 'P', 't', 7);
      f.label(110, 100, '\\text{metal}', 't', 'small');
      return f.svg();
    };
    const fVnorm = () => {
      const f = PF.fig();
      f.plane(0, 220, 120);
      for (const [y, t] of [[100, 'V_0'], [70, 'V_0 - 1\\ \\text{V}'], [40, 'V_0 - 2\\ \\text{V}']]) { f.line(50, y, 170, y, { cls: 'dash dim' }); f.label(176, y, t, 'l', 'small'); }
      f.label(4, 128, '\\text{metal}', 'tl', 'small');
      f.dim(36, 120, 36, 40, '2\\ \\text{mm}', { at: 'l' });
      return f.svg();
    };
    const fTear = (arrows) => {
      const f = PF.fig(), cx = 120, cy = 90, S = 92;
      const pts = [];
      for (let i = 0; i < 180; i++) { const t = 2 * Math.PI * i / 180; pts.push([cx + S * Math.cos(t), cy - S * Math.sin(t) * Math.abs(Math.sin(t / 2))]); }
      metal(f, [pts]);
      if (arrows) {
        for (let i = 0; i < 180; i += 9) {
          const t = 2 * Math.PI * i / 180, w = Math.min(t, 2 * Math.PI - t);
          if (w < 0.05) continue;
          const [nx, ny] = nrm(pts, i), L = 12 + 30 * Math.exp(-(w * w) / 0.35), p = pts[i];
          f.arrow(p[0] + nx * 3, p[1] + ny * 3, p[0] + nx * (3 + L), p[1] + ny * (3 + L), { hs: 5 });
        }
        f.arrow(cx + S + 3, cy, cx + S + 48, cy, { hs: 6 });
      }
      for (const t of [0.62, 1.05, 1.6, 2.2, 2.75, 3.14, 3.55, 4.1, 4.7, 5.25, 5.68]) {
        const i = Math.round(t / (2 * Math.PI) * 180) % 180, [nx, ny] = nrm(pts, i);
        glyph(f, pts[i][0] - nx * 7, pts[i][1] - ny * 7, 1, 3, true);
      }
      return f.svg();
    };
    const fWire3 = () => {
      const f = PF.fig();
      metal(f, [circ(80, 90, 60)]); metal(f, [circ(280, 90, 20)]);
      f.line(140, 90, 260, 90);
      const e1 = [80 + 60 * Math.cos(130 * DEG), 90 - 60 * Math.sin(130 * DEG)], e2 = [280 + 20 * Math.cos(60 * DEG), 90 - 20 * Math.sin(60 * DEG)];
      f.line(80, 90, ...e1, { cls: 'dim thin' }); f.tag(...e1, '3R', 'tl', 6);
      f.line(280, 90, ...e2, { cls: 'dim thin' }); f.tag(...e2, 'R', 'tr', 6);
      f.text(200, 76, 'long thin wire', 'c');
      return f.svg();
    };
    const fPatch = () => {
      const f = PF.fig();
      const arcp = f.arcPts(130, 760, 660, 660, 101, 79);
      f.pl(arcp);
      const pp = f.arcPts(130, 760, 660, 660, 92, 88);
      f.pl(pp, { cls: 'thick' });
      f.arrow(130, 94, 130, 46); f.arrow(130, 106, 130, 152);
      f.label(138, 60, '\\sigma/2\\varepsilon_0', 'l', 'small');
      f.label(138, 140, '\\sigma/2\\varepsilon_0', 'l', 'small');
      f.arrow(130, 100, 64, 44, { cls: 'dash' }); f.tag(64, 44, md`\vb E_{\text{other}}`, 'l', 6);
      f.arrow(238, 102, 240, 70, { hs: 6 }); f.tag(240, 70, md`\hat{\vb n}`, 'r', 6);
      f.label(100, 122, '\\text{patch}', 'r', 'small');
      f.label(26, 130, '\\sigma', 'c');
      return f.svg();
    };
    const fHemi = () => {
      const f = PF.fig(), cx = 130, cy = 130, R = 80;
      ringMetal(f, cx, cy, R - 8, R);
      f.line(cx, cy + R + 22, cx, cy - R - 40, { cls: 'dim', arrow: 'end', hs: 6 }); f.label(cx + 6, cy - R - 42, 'z', 'bl', 'small accent');
      f.line(cx - R - 14, cy, cx + R + 14, cy, { cls: 'dash dim' });
      const th = 40, sa = (90 - th) * DEG, E = [cx + R * Math.cos(sa), cy - R * Math.sin(sa)];
      f.line(cx, cy, ...E, { cls: 'dim thin' });
      f.angle(cx, cy, 28, 90 - th, 90, '');
      f.label(cx + 40 * Math.cos(70 * DEG), cy - 40 * Math.sin(70 * DEG), '\\theta', 'c', 'small');
      f.label(cx + 46 * Math.cos(sa) + 9 * Math.sin(sa), cy - 46 * Math.sin(sa) + 9 * Math.cos(sa), 'R', 'c', 'small');
      for (let a = 10; a <= 170; a += 20) {
        if (a === 50) continue;
        const c = Math.cos(a * DEG), s = Math.sin(a * DEG);
        f.arrow(cx + (R + 3) * c, cy - (R + 3) * s, cx + (R + 22) * c, cy - (R + 22) * s, { hs: 5 });
      }
      const n = [Math.cos(sa), -Math.sin(sa)], B0 = [E[0] + 3 * n[0], E[1] + 3 * n[1]], T = [E[0] + 38 * n[0], E[1] + 38 * n[1]];
      f.arrow(...B0, ...T, { cls: 'thick', hs: 7 }); f.tag(...T, 'd\\vb F', 'r', 6);
      f.arrow(B0[0], B0[1], B0[0], T[1], { cls: 'dash', hs: 6 }); f.label(B0[0], T[1] - 9, 'dF_z', 'b', 'small');
      return f.svg();
    };
    const fHemiSetup = () => {
      const f = PF.fig(), cx = 130, cy = 120, R = 80;
      ringMetal(f, cx, cy, R - 8, R);
      f.line(cx - R - 14, cy, cx + R + 14, cy, { cls: 'dash dim' });
      f.dot(cx, cy, 2);
      const e = [cx + R * Math.cos(-35 * DEG), cy - R * Math.sin(-35 * DEG)];
      f.line(cx, cy, ...e, { cls: 'dim thin' }); f.tag(...e, 'R', 'br', 6);
      f.label(cx - R - 6, cy - R + 8, '\\text{northern}', 'r', 'small');
      f.label(cx - R - 6, cy + R - 8, '\\text{southern}', 'r', 'small');
      f.label(cx, cy - R - 10, '\\text{total charge } Q', 'b', 'small');
      return f.svg();
    };
    const fProj = () => PF.row([
      { svg: (() => { const f = PF.fig(), cx = 100, cy = 100, R = 70; f.pl(f.arcPts(cx, cy, R, R, 0, 180)); f.line(cx - R, cy, cx + R, cy, { cls: 'dash dim' }); for (let a = 15; a <= 165; a += 25) { const c = Math.cos(a * DEG), s = Math.sin(a * DEG); f.arrow(cx + (R + 3) * c, cy - (R + 3) * s, cx + (R + 22) * c, cy - (R + 22) * s, { hs: 5 }); } return f.svg(); })(), cap: 'pressure $P$ on the hemisphere' },
      { svg: (() => { const f = PF.fig(), cx = 100, cy = 100, R = 70; f.ellipse(cx, cy, R, 18); for (let x = -50; x <= 50; x += 25) f.arrow(cx + x, cy - 4, cx + x, cy - 40, { hs: 5 }); return f.svg(); })(), cap: 'same $P$ on the flat disk $\\pi R^2$' },
    ]);
    const fBubble = () => {
      const f = shellFig({ R: 56, angs: [0, 45, 90, 135, 180, 225, 270, 315] });
      return f.svg();
    };
    const fPlates2 = () => {
      const f = PF.fig();
      metal(f, [[[20, 40], [240, 40], [240, 50], [20, 50]]]); metal(f, [[[20, 100], [240, 100], [240, 110], [20, 110]]]);
      f.label(250, 45, '+Q', 'l'); f.label(250, 105, '+Q', 'l');
      f.dim(10, 50, 10, 100, 'd', { at: 'l' });
      f.label(130, 30, '\\text{area } A \\text{ each}', 'b', 'small');
      return f.svg();
    };

    return {
      id: 'u3-surface-force', title: 'Surface charge and the force on a conductor',
      steps: [
        RF(md`
          ### The field just outside a conductor

          The boundary condition from Lecture 5 holds across any surface charge, with $\hat{\vb n}$ pointing from "below" to "above":

          $$\vb E_{\text{above}} - \vb E_{\text{below}} = \frac{\sigma}{\varepsilon_0}\,\hat{\vb n}.$$

          In-class question: what is the field just outside a conductor? Take "below" to be inside the metal, where $\vb E_{\text{below}} = 0$:

          $$\vb E = \frac{\sigma}{\varepsilon_0}\,\hat{\vb n}\qquad\text{(just outside; } \hat{\vb n}\text{ the outward normal).}$$

          It is perpendicular to the surface (property 5) and its size is set by the **local** surface charge. In terms of the potential, with $\dfrac{\partial V}{\partial n} = \nabla V\cdot\hat{\vb n}$:

          $$\frac{\partial V}{\partial n} = -\frac{\sigma}{\varepsilon_0}\qquad\Longleftrightarrow\qquad \sigma = -\varepsilon_0\,\frac{\partial V}{\partial n}.$$

          The second form is how you find induced charge once you know $V$ (images and separation of variables, next unit): take the derivative of $V$ along the outward normal at the surface.

          [[fig:pill]]

          **Why $\sigma/\varepsilon_0$ and not $\sigma/2\varepsilon_0$?** Use a pillbox straddling the surface. Its outer face sees $E$, its inner face sits in the metal and sees nothing, and no flux leaves through the sides because $\vb E\perp$ surface. So $EA = \sigma A/\varepsilon_0$. For an isolated sheet, flux leaves through **both** faces: $2EA = \sigma A/\varepsilon_0$, giving $\sigma/2\varepsilon_0$ on each side. On a conductor, the patch's own field is still $\sigma/2\varepsilon_0$ each way, but all the other charges add another $\sigma/2\varepsilon_0$ pointing outward. That cancels the patch's field inside and doubles it outside.

          !!trap $\sigma/\varepsilon_0$ or $\sigma/2\varepsilon_0$?
            An infinite **metal** plate with total charge per area $\sigma_{\text{tot}}$ puts $\sigma_{\text{tot}}/2$ on each face. The field outside each face is then $\dfrac{\sigma_{\text{tot}}/2}{\varepsilon_0} = \dfrac{\sigma_{\text{tot}}}{2\varepsilon_0}$, the same as a thin non-conducting sheet carrying $\sigma_{\text{tot}}$. Both rules agree; always ask which $\sigma$ you are using.
        `, { pill: Object.assign(PF.row([{ svg: fPillA(), cap: 'isolated sheet: $\\sigma/2\\varepsilon_0$ on both sides' }, { svg: fPillB(), cap: 'conductor surface: $\\sigma/\\varepsilon_0$ outside, $0$ inside' }]), { cap: '' }) }),

        Q(md`At a point on a conductor's surface the local surface charge density is $\sigma$. The field just outside, at that point, has magnitude`,
          [md`$\sigma/2\varepsilon_0$`, md`$2\sigma/\varepsilon_0$`, md`$\sigma/\varepsilon_0$`, md`$0$, since the conductor screens it`], 2,
          [md`That's an isolated sheet, with field on both sides. A conductor has no field inside, so all the flux goes out one side.`, md`The boundary condition gives a jump of exactly $\sigma/\varepsilon_0$, and the inside value is 0.`, null, md`$\vb E = 0$ inside the metal, not just outside it.`],
          md`$E_{\text{above}} - E_{\text{below}} = \sigma/\varepsilon_0$ with $E_{\text{below}} = 0$. Check on a charged sphere: $\sigma = \dfrac{Q}{4\pi R^2}$ and $E(R^+) = \dfrac{Q}{4\pi\varepsilon_0R^2} = \dfrac{\sigma}{\varepsilon_0}$.`,
          { figHtml: fSurfP() }),

        Q(md`A large, thin metal plate carries total charge $Q$ (both faces together) over area $A$. The field just outside either face has magnitude`,
          [md`$\dfrac{Q}{\varepsilon_0A}$`, md`$\dfrac{Q}{4\varepsilon_0A}$`, md`$0$`, md`$\dfrac{Q}{2\varepsilon_0A}$`], 3,
          [md`That uses $\sigma = Q/A$ on one face. The charge splits between the two faces: $Q/2A$ each.`,
            md`$\sigma/\varepsilon_0$ with $\sigma = Q/2A$ gives $Q/2\varepsilon_0A$, not half of that.`,
            md`The field is zero inside the metal, not outside it.`,
            null],
          md`By symmetry each face carries $\sigma_{\text{face}} = \dfrac{Q}{2A}$, and just outside a conductor $E = \sigma_{\text{face}}/\varepsilon_0 = \dfrac{Q}{2\varepsilon_0A}$. Same as a non-conducting sheet with $\sigma = Q/A$: $\dfrac{\sigma}{2\varepsilon_0}$. Consistent.`,
          { nofig: 'A single flat plate; the description is complete.' }),

        Q(md`At the surface of a positively charged conductor, the normal derivative $\partial V/\partial n$ (along the outward normal, just outside) is`,
          [md`positive: $V$ increases going outward`, md`zero, since the conductor is an equipotential`, md`undefined, since $V$ jumps at the surface`, md`negative: $V$ decreases going outward`], 3,
          [md`Away from positive charge the potential falls.`, md`$V$ is constant **along** the surface, not across it. The normal derivative is $-\sigma/\varepsilon_0$.`, md`$V$ is continuous across any surface charge; only its normal derivative jumps.`, null],
          md`$\dfrac{\partial V}{\partial n} = -\dfrac{\sigma}{\varepsilon_0}<0$ for $\sigma>0$. Inside the metal the derivative is 0; outside it is $-\sigma/\varepsilon_0$. The jump in slope, with $V$ itself continuous, is the surface charge.`,
          { figHtml: fSurfP() }),

        Q(md`Which of these is **not** a boundary condition at the surface of a conductor in electrostatics?`,
          [md`$V$ is the same at every point of the surface`, md`$\partial V/\partial n$ is continuous across the surface`, md`The tangential component of $\vb E$ just outside is zero`, md`$\sigma = -\varepsilon_0\,\partial V/\partial n$, the derivative taken just outside`], 1,
          [md`That one holds: the conductor is an equipotential.`, null, md`That one holds: $E_\parallel = 0$ (property 5).`, md`That one holds: it's the field-just-outside rule written with $V$.`],
          md`$\partial V/\partial n$ jumps from 0 (inside the metal) to $-\sigma/\varepsilon_0$ (just outside). Only $V$ itself is continuous. Full list for a conductor surface: $V$ continuous and constant along it, $E_\parallel = 0$, $E_\perp = \sigma/\varepsilon_0$, and either the potential or the total charge of the conductor given.`,
          { nofig: 'A list of conditions; no particular geometry.' }),

        P({
          title: 'Surface charge from the potential',
          q: md`Just outside a flat metal surface, the potential drops by $2.0$ V over the first $2.0$ mm (the equipotentials are planes parallel to the surface, evenly spaced). Find the surface charge density on the metal, in nC/m$^2$. Use $\varepsilon_0 = 8.85\times10^{-12}$ F/m.`,
          figHtml: fVnorm(),
          hints: [md`$\sigma = -\varepsilon_0\,\dfrac{\partial V}{\partial n}$ with $n$ measured outward from the metal.`, md`$\dfrac{\partial V}{\partial n} = \dfrac{-2.0\text{ V}}{2.0\times10^{-3}\text{ m}} = -1000$ V/m.`],
          parts: [{ lbl: md`$\sigma$`, ans: 8.85, unit: 'nC/m²' }],
          sol: md`
            **Conditions.** Metal surface: $V = V_0$ on it; just outside, $\sigma = -\varepsilon_0\,\partial V/\partial n$.

            Going outward $V$ falls by 2.0 V in 2.0 mm, so $\partial V/\partial n = -1.0\times10^3$ V/m and

            $$\sigma = -\varepsilon_0\frac{\partial V}{\partial n} = (8.85\times10^{-12})(1.0\times10^3) = 8.85\times10^{-9}\ \text{C/m}^2 = 8.85\ \text{nC/m}^2.$$

            Positive, since $V$ decreases away from the surface (the field points outward). The field just outside is $E = \sigma/\varepsilon_0 = 1000$ V/m, consistent with the spacing of the equipotentials.
          `,
        }),

        RF(md`
          ### Charge sharing and sharp points

          Join two metal spheres, radii $R_1$ and $R_2$, far apart, by a long thin wire. Now they are one conductor, so they sit at one potential. Far apart, each sphere's charge is (nearly) uniform and

          $$\frac{Q_1}{4\pi\varepsilon_0R_1} = \frac{Q_2}{4\pi\varepsilon_0R_2}\quad\Longrightarrow\quad \frac{Q_1}{Q_2} = \frac{R_1}{R_2},\qquad \frac{\sigma_1}{\sigma_2} = \frac{Q_1/R_1^2}{Q_2/R_2^2} = \frac{R_2}{R_1}.$$

          The bigger sphere holds more charge, but the **smaller** one has the larger surface density, and so the larger field just outside ($E = \sigma/\varepsilon_0\propto 1/R$).

          The same thing happens on a single conductor of uneven shape: where the surface is most sharply curved, $\sigma$ and the field are largest. Near a sharp point the field can be strong enough to ionise the air (corona discharge). Lightning rods are sharp for this reason.

          [[fig:tear]]
        `, { tear: { svg: fTear(true), cap: 'A charged teardrop-shaped conductor (sketch). The surface charge and the field just outside are largest at the sharp end.' } }),

        Q(md`Two metal spheres, radii $3R$ and $R$, far apart, are joined by a long thin wire and charged. The ratio of surface charge densities $\sigma_{\text{small}}/\sigma_{\text{big}}$ is`,
          [md`$1/3$`, md`$1$`, md`$9$`, md`$3$`], 3,
          [md`That's the ratio of the charges, $Q_{\text{small}}/Q_{\text{big}} = R/3R$. Densities divide by area too.`, md`Equal densities would give unequal potentials. The wire forces equal potentials instead.`, md`$Q\propto R$ and area $\propto R^2$, so $\sigma\propto 1/R$, not $1/R^2$.`, null],
          md`Equal potentials: $Q\propto R$. Then $\sigma = \dfrac{Q}{4\pi R^2}\propto\dfrac1R$, so the small sphere has 3 times the density, and 3 times the surface field.`,
          { figHtml: fWire3() }),

        Q(md`A charged, isolated metal object is shaped like a teardrop (round at one end, pointed at the other). Where is the field just outside strongest?`,
          [md`At the pointed end`, md`At the round end, where there is more surface`, md`It's the same everywhere, since the conductor is an equipotential`, md`In the middle`], 0,
          [null, md`More surface doesn't mean more density. The densest charge is where the curvature is sharpest.`, md`$V$ is the same everywhere; $\sigma$, and hence $E = \sigma/\varepsilon_0$, is not.`, md`The flat-ish middle has the lowest density.`],
          md`Think of the pointed end as a small sphere and the round end as a big one, both at the same potential: $\sigma\propto1/(\text{radius of curvature})$. So $\sigma$ and $E = \sigma/\varepsilon_0$ peak at the point.`,
          { figHtml: fTear(false) }),

        Q(md`A metal sphere with charge $Q$ is touched to an identical uncharged metal sphere and then pulled far away. Each now carries`,
          [md`$Q$ and $0$: charge doesn't flow between conductors`, md`$Q/2$`, md`$Q/4$`, md`$Q/\sqrt2$`], 1,
          [md`In contact they form one conductor, and charge flows until the potentials are equal.`, null, md`Charge is conserved: the two together still hold $Q$.`, md`Charge, not energy, is shared, and identical spheres share it equally.`],
          md`Touching makes one conductor at one potential, and by symmetry the charge splits evenly. For unequal spheres the split is not even: joined by a long wire and far apart, $Q\propto R$; for spheres in contact the split has to be calculated (the small sphere gets less than its share by radius).`,
          { nofig: 'Two identical spheres; the description is complete.' }),

        P({
          title: 'Sharing charge between two spheres',
          q: md`Two metal spheres, radii $3R$ and $R$, are far apart and joined by a long thin wire. A total charge $Q$ is placed on the pair. Find the charge on the small sphere, and the ratios of the surface charge densities and of the fields just outside the two spheres.`,
          figHtml: fWire3(),
          hints: [md`Conditions: one conductor, so $V_{\text{small}} = V_{\text{big}}$; total charge $Q$.`, md`Far apart, $V = \dfrac{Q_i}{4\pi\varepsilon_0R_i}$ for each.`],
          parts: [
            { lbl: md`Q_{\text{small}}`, expr: 'Q/4', vars: { Q: [0.5, 3] } },
            { lbl: md`$\sigma_{\text{small}}/\sigma_{\text{big}}$`, ans: 3, unit: '' },
            { lbl: md`$E_{\text{small}}/E_{\text{big}}$ (just outside)`, ans: 3, unit: '' },
          ],
          sol: md`
            **Conditions.** One conductor: $V_1 = V_2$ (unknown). Isolated: $Q_1 + Q_2 = Q$.

            $\dfrac{Q_{\text{small}}}{R} = \dfrac{Q_{\text{big}}}{3R}$, so $Q_{\text{big}} = 3Q_{\text{small}}$ and $Q_{\text{small}} = Q/4$, $Q_{\text{big}} = 3Q/4$.

            $\sigma_{\text{small}} = \dfrac{Q/4}{4\pi R^2}$, $\sigma_{\text{big}} = \dfrac{3Q/4}{4\pi(3R)^2} = \dfrac{Q/12}{4\pi R^2}$: ratio $3$. Fields just outside are $\sigma/\varepsilon_0$, so the same ratio, $3$.
          `,
        }),

        RF(md`
          ### The force on a conductor's surface charge (Griffiths 2.5.3)

          Surface charge in a field feels a force per unit area $\vb f = \sigma\vb E$. But $\vb E$ jumps at the surface: which value? The **average** of the two sides:

          $$\vb f = \sigma\,\vb E_{\text{average}} = \tfrac12\sigma\left(\vb E_{\text{above}} + \vb E_{\text{below}}\right).$$

          Why: look at a tiny, flat patch of the surface. The field there is $\vb E = \vb E_{\text{patch}} + \vb E_{\text{other}}$. The patch cannot push itself (no more than you can lift yourself by pulling on your shoelaces), so the force on it comes only from $\vb E_{\text{other}}$, which is smooth across the patch: remove the patch and the field in the hole is perfectly continuous. The jump comes entirely from the patch, which sends $\sigma/2\varepsilon_0$ out of each side:

          $$\vb E_{\text{above}} = \vb E_{\text{other}} + \frac{\sigma}{2\varepsilon_0}\hat{\vb n},\qquad \vb E_{\text{below}} = \vb E_{\text{other}} - \frac{\sigma}{2\varepsilon_0}\hat{\vb n}\quad\Longrightarrow\quad\vb E_{\text{other}} = \tfrac12(\vb E_{\text{above}} + \vb E_{\text{below}}).$$

          Averaging just removes the patch's own field.

          [[fig:patch]]

          For a conductor, $\vb E_{\text{above}} = \dfrac{\sigma}{\varepsilon_0}\hat{\vb n}$ and $\vb E_{\text{below}} = 0$, so $\vb E_{\text{average}} = \dfrac{\sigma}{2\varepsilon_0}\hat{\vb n}$ and

          $$\vb f = \frac{\sigma^2}{2\varepsilon_0}\,\hat{\vb n}.$$

          This is an **outward** pressure whatever the sign of $\sigma$: the conductor is pulled into the field. In terms of the field just outside,

          $$P = \frac{\varepsilon_0}{2}E^2,$$

          numerically equal to the energy density just outside.
        `, { patch: { svg: fPatch(), cap: 'Griffiths Fig. 2.50: a small patch of surface charge. Its own field is $\\sigma/2\\varepsilon_0$ on each side; $\\vb E_{\\text{other}}$, from everything else, is smooth across it.' } }),

        Q(md`Why is the force per area on surface charge $\sigma\vb E_{\text{average}}$, and not $\sigma\vb E_{\text{above}}$?`,
          [md`Because the charge is spread through a layer, half of it above the midpoint`, md`Because a patch of charge cannot exert force on itself, and averaging removes exactly the patch's own field`, md`Because $\vb E_{\text{above}}$ is always twice the true field`, md`It's a convention; either choice works if used consistently`], 1,
          [md`The thickness doesn't enter. The argument works for an ideal zero-thickness sheet.`, null, md`Only for a conductor (where $\vb E_{\text{below}} = 0$) is $\vb E_{\text{above}}$ twice the average.`, md`It's physics, not convention: $\sigma\vb E_{\text{above}}$ would give twice the correct force on a conductor.`],
          md`$\vb E_{\text{above}}$ and $\vb E_{\text{below}}$ both include the patch's own $\pm\sigma/2\varepsilon_0$; their average is exactly $\vb E_{\text{other}}$, the field of everything else, which is what pushes the patch.`,
          { nofig: 'Asks about the patch argument drawn just above; repeating that drawing would give the answer away.' }),

        Q(md`A metal object carries **negative** charge. The electrostatic force on its surface charge points`,
          [md`inward, since negative charge is attracted toward the positive nuclei`, md`outward, the same as for positive charge`, md`inward where $\sigma<0$ and outward where $\sigma>0$`, md`along the surface`], 1,
          [md`The nuclei are neutralised by the other electrons. The extra charge repels itself, pushing outward.`, null, md`$\vb f = \dfrac{\sigma^2}{2\varepsilon_0}\hat{\vb n}$ is outward for either sign.`, md`In equilibrium $E_\parallel = 0$, so there's no force along the surface.`],
          md`$\vb f\propto\sigma^2$: always outward. Physically, the surface charge is pushed away by the rest of the (same-sign) surface charge; for induced charge, the conductor is pulled into the field.`,
          { nofig: 'Sign question; no particular geometry.' }),

        Q(md`Someone computes the force per area on a conductor's surface as $\sigma E$ with $E = \sigma/\varepsilon_0$, the field just outside. Their answer is`,
          [md`correct`, md`too small by a factor of 2`, md`too large by a factor of 2`, md`wrong in sign`], 2,
          [md`The field just outside includes the patch's own field, which can't push the patch.`, md`It's the other way: $\sigma^2/\varepsilon_0$ versus the correct $\sigma^2/2\varepsilon_0$.`, null, md`The direction (outward) is right; the size is off.`],
          md`The correct field to use is $E_{\text{average}} = \sigma/2\varepsilon_0$, giving $\dfrac{\sigma^2}{2\varepsilon_0}$. Using the outside value doubles it. A classic factor-of-2 trap.`,
          { nofig: 'Same flat-surface setup as above.' }),

        Q(md`A soap bubble (a conducting film) is given an electric charge. Compared with the uncharged bubble, it tends to`,
          [md`expand, since the electrostatic pressure on its surface is outward`, md`shrink, since the charge pulls the film inward`, md`stay the same: the forces on opposite sides cancel`, md`expand only if the charge is positive`], 0,
          [null, md`The pressure $\sigma^2/2\varepsilon_0$ is outward, not inward.`, md`The pressure acts outward at every point of the surface; forces on opposite sides add up to a stretching, not a cancellation of the effect.`, md`$\sigma^2$: either sign pushes outward.`],
          md`Like charges on the film repel; the pressure $P = \sigma^2/2\varepsilon_0$ acts outward everywhere and helps the gas inside, so the bubble grows a little. (That's the next practice problem.)`,
          { figHtml: fBubble() }),

        RF(md`
          ### Worked example: pressure on a charged sphere

          A metal sphere of radius $R = 10$ cm carries $Q = 1.0\ \mu$C. Find the outward electrostatic pressure on its surface.

          **Conditions.** Isolated conductor with charge $Q$; sphere, so $\sigma$ is uniform; just outside $E = \sigma/\varepsilon_0$.

          $$\sigma = \frac{Q}{4\pi R^2} = \frac{1.0\times10^{-6}}{4\pi(0.10)^2} = 7.96\times10^{-6}\ \text{C/m}^2,\qquad P = \frac{\sigma^2}{2\varepsilon_0} = \frac{(7.96\times10^{-6})^2}{2(8.85\times10^{-12})} = 3.6\ \text{N/m}^2.$$

          Check with $P = \tfrac{\varepsilon_0}{2}E^2$: $E = \dfrac{Q}{4\pi\varepsilon_0R^2} = 9.0\times10^5$ V/m gives $3.6$ Pa again; it equals the energy density found for this sphere in Lesson 3. Tiny next to atmospheric pressure ($10^5$ Pa), but it's what holds a charged balloon slightly inflated, and it grows as $Q^2$.
        `),

        P({
          title: 'A charged soap bubble',
          q: md`A soap bubble of radius $R$ carries charge $Q$ spread over its (conducting) surface. (a) Find the outward electrostatic pressure in terms of $Q$ and $R$. (b) A soap film has two surfaces, so surface tension $\gamma$ gives an inward pressure $4\gamma/R$. For $\gamma = 0.025$ N/m and $R = 1.0$ cm, what charge makes the electrostatic pressure equal to $4\gamma/R$? (c) What is the bubble's potential then?`,
          figHtml: fBubble(),
          hints: [md`$\sigma = \dfrac{Q}{4\pi R^2}$ and $P = \dfrac{\sigma^2}{2\varepsilon_0}$.`, md`Set $\dfrac{Q^2}{32\pi^2\varepsilon_0R^4} = \dfrac{4\gamma}{R}$ and solve for $Q$.`, md`$V = \dfrac{Q}{4\pi\varepsilon_0 R}$.`],
          parts: [
            { lbl: md`(a) $P$`, expr: 'Q^2/(32*pi^2*eps0*R^4)', vars: { Q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 2] }, accepts: ['(Q/(4*pi*R^2))^2/(2*eps0)'] },
            { lbl: md`(b) $Q$`, ans: 16.72, unit: 'nC' },
            { lbl: md`(c) $V$`, ans: 15.03, unit: 'kV' },
          ],
          sol: md`
            **Conditions.** The film is a conductor: one potential, charge $Q$ on its surface, uniform by symmetry ($\sigma = Q/4\pi R^2$). Just outside, $E = \sigma/\varepsilon_0$; the force per area is $\sigma^2/2\varepsilon_0$, outward.

            **(a)** $P = \dfrac{\sigma^2}{2\varepsilon_0} = \dfrac{1}{2\varepsilon_0}\left(\dfrac{Q}{4\pi R^2}\right)^2 = \dfrac{Q^2}{32\pi^2\varepsilon_0R^4}$.

            **(b)** $Q^2 = 32\pi^2\varepsilon_0R^4\cdot\dfrac{4\gamma}{R} = 128\pi^2\varepsilon_0\gamma R^3$, so

            $$Q = 8\pi\sqrt{2\varepsilon_0\gamma R^3} = 8\pi\sqrt{2(8.85\times10^{-12})(0.025)(10^{-6})} = 1.67\times10^{-8}\ \text{C} = 16.7\ \text{nC}.$$

            **(c)** $V = \dfrac{Q}{4\pi\varepsilon_0R} = (8.99\times10^9)\dfrac{1.67\times10^{-8}}{0.010} = 1.50\times10^4$ V $\approx 15$ kV.

            **Check:** $P = 4\gamma/R = 10$ Pa, and $\sigma^2/2\varepsilon_0$ with $\sigma = Q/4\pi R^2 = 1.33\times10^{-5}$ C/m$^2$ gives $10$ Pa.
          `,
        }),

        P({
          title: 'Two plates with the same charge',
          q: md`Two large metal plates, each of area $A$, are held a small distance $d$ apart. Each carries charge $+Q$. (a) How is the charge arranged on the four faces? (b) What is the electrostatic pressure on each plate?`,
          figHtml: fPlates2(),
          hints: [md`Conditions: two conductors, each with $\vb E = 0$ inside, each isolated with charge $Q$. Let the face densities be $\sigma_1,\sigma_2$ (top plate, outer and inner) and $\sigma_3,\sigma_4$ (bottom plate, inner and outer).`, md`Every face is a large sheet, contributing $\sigma/2\varepsilon_0$. Demand zero field inside each plate. By symmetry $\sigma_1 = \sigma_4$ and $\sigma_2 = \sigma_3$.`, md`Then the pressure on each outer face is $\sigma^2/2\varepsilon_0$.`],
          parts: [
            { lbl: md`(a) The charge sits`, mc: [md`$Q/A$ on each outer face, nothing on the inner faces`, md`$Q/2A$ on each of the four faces`, md`$Q/A$ on each inner face, nothing on the outer faces`], a: 0,
              why: [null, md`Then the inner faces would make a field in the gap; but by symmetry the field in the gap must vanish (two equal plates).`, md`That's the arrangement for $+Q$ and $-Q$ (a capacitor).`] },
            { lbl: md`(b) $P$`, expr: 'Q^2/(2*eps0*A^2)', vars: { Q: [0.5, 3], eps0: [0.5, 2], A: [0.5, 3] } },
            { lbl: md`The plates are pushed`, mc: [md`apart`, md`together`, md`neither way`], a: 0, why: [null, md`The pressure on each plate acts on its outer face, outward: away from the other plate.`, md`Each plate has charge only on its outer face, and the pressure there is outward.`] },
          ],
          sol: md`
            **Conditions.** Two isolated conductors, each with charge $Q$, $\vb E = 0$ inside each.

            **(a)** By symmetry the field in the gap is zero (the two plates are identical), so the inner faces carry no charge ($\sigma = \varepsilon_0E_{\text{gap}} = 0$). Each plate's $Q$ is on its outer face: $\sigma = Q/A$. Check: outside, the four faces act like sheets totalling $2Q/A$, giving $E = \dfrac{2Q/A}{2\varepsilon_0} = \dfrac{Q}{\varepsilon_0A} = \dfrac{\sigma}{\varepsilon_0}$. Consistent.

            **(b)** $P = \dfrac{\sigma^2}{2\varepsilon_0} = \dfrac{Q^2}{2\varepsilon_0A^2}$, outward on each outer face, so the plates are pushed apart (like charges repel). Total force on each plate: $\dfrac{Q^2}{2\varepsilon_0A}$.
          `,
        }),

        P({
          id: 'HW4-2.43', src: 'HW 4 · Griffiths 2.43', title: 'Force between the hemispheres of a charged sphere', big: true,
          q: md`A metal sphere of radius $R$ carries a total charge $Q$. What is the force of repulsion between the "northern" hemisphere and the "southern" hemisphere?`,
          figHtml: fHemiSetup(),
          hints: [
            md`Conditions: isolated conductor with charge $Q$, spherical, so $\sigma = Q/4\pi R^2$ uniformly. The force on surface charge is the pressure $P = \sigma^2/2\varepsilon_0$, outward.`,
            md`The force on the northern hemisphere from the southern one equals the total electrostatic force on the northern hemisphere (it can't push itself). By symmetry only the $z$ component survives.`,
            md`$dF_z = P\cos\theta\,da$ with $da = R^2\sin\theta\,d\theta\,d\phi$; integrate $\theta$ from $0$ to $\pi/2$.`,
          ],
          parts: [
            { lbl: 'F', expr: 'Q^2/(32*pi*eps0*R^2)', vars: { Q: [0.5, 3], eps0: [0.5, 2], R: [0.5, 3] }, accepts: ['(1/(4*pi*eps0))*Q^2/(8*R^2)'] },
            { lbl: md`Why may you integrate only the $z$ component of $d\vb F$?`, mc: [md`The $x$ and $y$ components cancel in pairs by symmetry about the $z$ axis`, md`Pressure only acts vertically`, md`The $x$ and $y$ components are what the southern hemisphere cancels`], a: 0,
              why: [null, md`The pressure is normal to the surface, so each element's force has $x$ and $y$ parts; they cancel only after summing.`, md`They cancel among elements of the northern hemisphere itself.`] },
            { lbl: md`The same answer, as pressure times area:`, mc: [md`$P\cdot2\pi R^2$ (the hemisphere's area)`, md`$P\cdot\pi R^2$ (the area of its shadow on the equatorial plane)`, md`$P\cdot4\pi R^2$`], a: 1,
              why: [md`That would add the forces as if they all pointed along $z$. Only their $z$ parts add.`, null, md`That's the whole sphere's area, and the forces on the two halves point opposite ways.`] },
          ],
          sol: md`
            **Conditions.** Isolated metal sphere with charge $Q$: an equipotential, $\vb E = 0$ inside, charge uniform on the surface by symmetry: $\sigma = \dfrac{Q}{4\pi R^2}$. Just outside, $E = \sigma/\varepsilon_0$.

            **Force on the surface.** Outward pressure $P = \dfrac{\sigma^2}{2\varepsilon_0}$ on every element. The force of the southern hemisphere on the northern one is the total electrostatic force on the northern hemisphere (the northern half exerts no net force on itself).

            **Integrate.** By symmetry the $x$ and $y$ components cancel; keep $dF_z = P\cos\theta\,da$:

            [[fig:hemi]]

            $$F = \frac{\sigma^2}{2\varepsilon_0}\int_0^{2\pi}\!\!\int_0^{\pi/2}\cos\theta\,R^2\sin\theta\,d\theta\,d\phi = \frac{\sigma^2}{2\varepsilon_0}\cdot2\pi R^2\cdot\frac12 = \frac{\sigma^2}{2\varepsilon_0}\,\pi R^2.$$

            With $\sigma = \dfrac{Q}{4\pi R^2}$:

            $$F = \frac{Q^2}{16\pi^2R^4}\cdot\frac{\pi R^2}{2\varepsilon_0} = \frac{Q^2}{32\pi\varepsilon_0R^2} = \frac{1}{4\pi\varepsilon_0}\,\frac{Q^2}{8R^2}.$$

            [[fig:proj]]

            **A shortcut worth remembering:** a uniform pressure on a curved surface pushes along $z$ exactly as hard as the same pressure on the surface's projection onto the $xy$ plane. Here that's the disk $\pi R^2$: $F = P\pi R^2$.

            **Checks.** Units: $Q^2/(\varepsilon_0R^2)$ is a force. Size: like two charges $Q/2$ about $R$ apart, but smaller, since much of each half's charge is farther away: $\dfrac{(Q/2)^2}{4\pi\varepsilon_0R^2} = \dfrac{Q^2}{16\pi\varepsilon_0R^2}$ is twice our answer.
          `,
          figs: { proj: Object.assign(fProj(), { cap: 'Uniform pressure on the hemisphere gives the same net $z$ force as on the flat disk it covers.' }),
            hemi: { svg: fHemi(), cap: 'Pressure acts outward on every element. For the element at polar angle $\\theta$, only $dF_z = P\\cos\\theta\\,da$ survives the sum.' } },
        }),

        RF(md`
          !!key Patterns to remember
            - Just outside a conductor: $\vb E = \dfrac{\sigma}{\varepsilon_0}\hat{\vb n}$ (not $\sigma/2\varepsilon_0$), and $\sigma = -\varepsilon_0\,\partial V/\partial n$.
            - Boundary conditions at a conductor: $V$ continuous and constant along the surface, $E_\parallel = 0$, $E_\perp = \sigma/\varepsilon_0$; plus either $V$ or $Q$ for each conductor.
            - Conductors joined by a wire share one potential: $Q\propto R$, $\sigma\propto1/R$. Sharp points have the largest $\sigma$ and field.
            - Force per area on surface charge: $\sigma\vb E_{\text{average}}$. On a conductor, $\dfrac{\sigma^2}{2\varepsilon_0}\hat{\vb n} = \dfrac{\varepsilon_0}{2}E^2$ outward, for either sign.
            - Net force from uniform pressure on a curved surface = pressure × projected area.
        `),
      ],
    };
  };

  // ===================================================================================== Lesson 8
  const L8 = () => {
    const fTwoCond = () => {
      const f = PF.fig();
      const A = shape(70, 90, 42, 56, { h: [[3, 0.08, 10], [2, 0.06, 0]] });
      const B = shape(260, 90, 40, 54, { h: [[3, 0.07, 200], [2, 0.05, 30]] });
      metal(f, [A]); metal(f, [B]);
      for (const [aa, bb, bulge] of [[28, 152, -34], [0, 180, 0], [-28, 208, 34]]) {
        const P0 = A[at(A, 70, 90, aa)], P1 = B[at(B, 260, 90, bb)], M = [(P0[0] + P1[0]) / 2, (P0[1] + P1[1]) / 2 + bulge];
        const pts = [];
        for (let k = 0; k <= 30; k++) { const t = k / 30, u = 1 - t; pts.push([u * u * P0[0] + 2 * t * u * M[0] + t * t * P1[0], u * u * P0[1] + 2 * t * u * M[1] + t * t * P1[1]]); }
        f.pl(pts, { cls: 'thin' }); headOn(f, pts, 0.55, { hs: 5 });
      }
      f.label(70, 22, '+Q', 'b'); f.label(260, 24, '-Q', 'b');
      return f.svg();
    };
    const fPP3D = () => {
      const g = PF.fig({ proj: { ox: 70, oy: 150, s: 1 } });
      const a = 130, b = 210, h = 46;
      const plate = (z) => g.poly([[0, 0, z], [a, 0, z], [a, b, z], [0, b, z]].map((p) => g.p3(...p)), { cls: 'bgfill' });
      plate(0); plate(h);
      const tl = g.p3(a, 0, h), bl = g.p3(a, 0, 0), tbr = g.p3(0, b, h), bbr = g.p3(0, b, 0);
      g.tag(tbr[0], tbr[1], '+Q', 'r', 8); g.tag(bbr[0], bbr[1], '-Q', 'r', 8);
      const c = g.p3(a / 2, b / 2 + 20, h); g.label(c[0], c[1], 'A', 'c');
      g.dim(tl[0], tl[1], bl[0], bl[1], 'd', { off: 18, at: 'l' });
      g.arrow(bbr[0] + 70, bbr[1] + 40, bbr[0] + 70, bbr[1] + 4, { hs: 6 }); g.tag(bbr[0] + 70, bbr[1] + 4, '\\hat{\\vb z}', 'r', 5);
      return g.svg();
    };
    const fSup = () => {
      const f = PF.fig();
      f.line(20, 60, 250, 60, { cls: 'thick' }); f.line(20, 120, 250, 120, { cls: 'thick' });
      f.label(12, 60, '+\\sigma', 'r'); f.label(12, 120, '-\\sigma', 'r');
      f.arrow(80, 52, 80, 18); f.arrow(110, 18, 110, 52, { cls: 'dash' });
      f.arrow(80, 68, 80, 112); f.arrow(110, 68, 110, 112, { cls: 'dash' });
      f.arrow(80, 128, 80, 162); f.arrow(110, 162, 110, 128, { cls: 'dash' });
      f.label(130, 34, '\\vb E = 0', 'l', 'small');
      f.label(130, 90, '\\lvert\\vb E\\rvert = \\sigma/\\varepsilon_0', 'l', 'small');
      f.label(130, 146, '\\vb E = 0', 'l', 'small');
      f.dim(262, 60, 262, 120, 'd', { at: 'r' });
      return f.svg();
    };
    const fVq = () => {
      const f = PF.fig(), ox = 40, oy = 160, W = 200, H = 120;
      f.add(`<path class="shade nodecl" d="M${ox},${oy}L${ox + W},${oy}L${ox + W},${oy - H}Z"/>`);
      f.axes(ox, oy, { x: [0, W + 30], y: [0, H + 30], xl: 'q', yl: 'V(q) = q/C' });
      f.line(ox, oy, ox + W, oy - H, { cls: 'thick' });
      f.line(ox + W, oy, ox + W, oy - H, { cls: 'dim dash thin' });
      f.line(ox, oy - H, ox + W, oy - H, { cls: 'dim dash thin' });
      f.label(ox + W, oy + 6, 'Q', 't', 'small');
      f.label(ox - 6, oy - H, 'V', 'r', 'small');
      f.label(ox + W * 0.64, oy - 22, 'W = \\tfrac12 QV', 'c', 'small');
      f.text(ox + 44, oy - 82, 'slope 1/C', 'c');
      return f.svg();
    };
    const fSphCap = (sol) => {
      const f = PF.fig(), cx = 120, cy = 110, a = 38, b = 90;
      metal(f, [circ(cx, cy, a)]); ringMetal(f, cx, cy, b, b + 8);
      const P = (r, deg) => [cx + r * Math.cos(deg * DEG), cy - r * Math.sin(deg * DEG)];
      f.line(cx, cy, ...P(a, 150), { cls: 'dim thin' }); f.tag(...P(a, 150), 'a', 'tl', 6);
      f.line(cx, cy, ...P(b + 8, 35), { cls: 'dim thin' }); f.tag(...P(b + 8, 35), 'b', 'tr', 6);
      f.label(...P(51, 300), '+Q', 'c', 'small');
      f.label(...P(b + 32, 225), '-Q', 'c', 'small');
      if (sol) {
        f.circle(cx, cy, 70, { cls: 'dash' });
        for (const d of [80, 190, 250]) { const p0 = P(43, d), p1 = P(60, d); f.arrow(...p0, ...p1, { hs: 5 }); }
      }
      return f.svg();
    };
    const fCoax3D = () => {
      const f = PF.fig(), y0 = 90, x0 = 80, x1 = 280, B = 46, A = 20, k = 0.3;
      f.ellipse(x0, y0, k * B, B);
      f.pl(f.arcPts(x1, y0, k * B, B, -90, 90));
      f.line(x0, y0 - B, x1, y0 - B); f.line(x0, y0 + B, x1, y0 + B);
      f.ellipse(x0 - 50, y0, k * A, A);
      f.line(x0 - 50, y0 - A, x0, y0 - A); f.line(x0 - 50, y0 + A, x0, y0 + A);
      f.line(x0, y0 - A, x1, y0 - A, { cls: 'dash dim' }); f.line(x0, y0 + A, x1, y0 + A, { cls: 'dash dim' });
      f.label(x0 - 50, y0 - A - 10, '\\text{inner tube}', 'b', 'small');
      f.label(x1 - 40, y0 - B - 8, '\\text{outer tube}', 'b', 'small');
      return f.svg();
    };
    const fCoaxEnd = (sol) => {
      const f = PF.fig(), cx = 90, cy = 90, A = 26, B = 66;
      ringMetal(f, cx, cy, A - 5, A); ringMetal(f, cx, cy, B, B + 5);
      const P = (r, deg) => [cx + r * Math.cos(deg * DEG), cy - r * Math.sin(deg * DEG)];
      f.dot(cx, cy, 2);
      if (!sol) {
        f.line(cx, cy, ...P(A, 140), { cls: 'dim thin' }); f.tag(...P(A, 140), 'a', 'tl', 6);
        f.line(cx, cy, ...P(B + 5, 30), { cls: 'dim thin' }); f.tag(...P(B + 5, 30), 'b', 'tr', 6);
      } else {
        f.circle(cx, cy, 48, { cls: 'dash' });
        f.line(cx, cy, ...P(48, 45), { cls: 'dim thin' }); f.label(...P(37, 75), 's', 'c', 'small');
        for (const d of [150, 210, 270, 330]) f.arrow(...P(29, d), ...P(43, d), { hs: 4.5 });
        f.label(...P(37, 110), '+\\lambda', 'c', 'small');
        f.label(...P(B + 24, 230), '-\\lambda', 'c', 'small');
      }
      return f.svg();
    };
    const fCoax = () => PF.row([{ svg: fCoax3D(), cap: 'coaxial tubes (side view)' }, { svg: fCoaxEnd(false), cap: 'cross-section' }]).svg;
    const fIso = () => {
      const f = PF.fig(), cx = 90, cy = 80, R = 46;
      metal(f, [circ(cx, cy, R)]);
      const e = [cx + R * Math.cos(-35 * DEG), cy - R * Math.sin(-35 * DEG)];
      f.line(cx, cy, ...e, { cls: 'dim thin' }); f.tag(...e, 'R', 'br', 6);
      f.label(cx, cy - R - 10, 'Q', 'b');
      f.text(cx + R + 20, cy - 10, 'the second conductor is', 'l');
      f.text(cx + R + 20, cy + 10, 'a sphere at infinity', 'l');
      return f.svg();
    };
    const fPPside = () => {
      const f = PF.fig();
      metal(f, [[[20, 40], [240, 40], [240, 48], [20, 48]]]); metal(f, [[[20, 100], [240, 100], [240, 108], [20, 108]]]);
      f.label(250, 44, '+Q', 'l'); f.label(250, 104, '-Q', 'l');
      f.dim(10, 48, 10, 100, 'd', { at: 'l' });
      f.label(130, 30, '\\text{area } A', 'b', 'small');
      return f.svg();
    };

    // interactive: separate the plates at fixed Q or at fixed V
    const wCap = () => C.W(`
      <div class="w-title">Pull the plates apart: isolated (charge fixed) or connected to a battery (voltage fixed)</div>
      <div class="w-row"><label><input type="radio" name="u3capmode" value="q" checked> isolated: $Q$ fixed</label><label><input type="radio" name="u3capmode" value="v"> battery: $V$ fixed</label></div>
      <div class="w-row"><label>separation $d/d_0$ <input class="dd" type="range" min="0.5" max="3" step="0.05" value="1"></label><span class="w-out dv"></span></div>
      <div class="w-grid"><div class="w-plot p1"></div><div class="w-note bars"></div></div>
      <div class="w-note nt"></div>`, (el) => {
      const fm = (v) => (Math.abs(v) < 5e-3 ? '0' : v.toFixed(2));
      function draw() {
        const x = +el.querySelector('.dd').value, mode = el.querySelector('input[name="u3capmode"]:checked').value;
        el.querySelector('.dv').textContent = x.toFixed(2);
        const Cc = 1 / x, Qq = mode === 'q' ? 1 : 1 / x, Vv = mode === 'q' ? x : 1, Ee = Vv / x, Ww = Qq * Vv;
        const f = PF.fig(), w = 190, top = 24, gap = 40 * x;
        f.line(20, top, 20 + w, top, { cls: 'thick' }); f.line(20, top + gap, 20 + w, top + gap, { cls: 'thick' });
        const nq = Math.max(1, Math.round(8 * Qq));
        for (let i = 0; i < nq; i++) { const X = 20 + (i + 0.5) * w / nq; glyph(f, X, top - 9, 1); glyph(f, X, top + gap + 9, -1); }
        const ne = Math.max(1, Math.round(6 * Ee));
        for (let i = 0; i < ne; i++) { const X = 20 + (i + 0.5) * w / ne; f.arrow(X, top + 5, X, top + gap - 5, { hs: 5 }); }
        el.querySelector('.p1').innerHTML = f.svg();
        const rows = [['C', Cc], ['Q', Qq], ['V', Vv], ['E', Ee], ['W', Ww]];
        el.querySelector('.bars').innerHTML = rows.map(([k, v]) => `<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><span style="width:24px">$${k}$</span><span style="flex:0 0 150px;height:8px;background:var(--line);position:relative"><span style="position:absolute;left:0;top:0;bottom:0;width:${Math.min(100, v / 3 * 100).toFixed(1)}%;background:var(--fg)"></span></span><span>$${fm(v)}\\,${k}_0$</span></div>`).join('');
        el.querySelector('.nt').innerHTML = mode === 'q'
          ? `<p>Isolated: the charge has nowhere to go, so $Q$ stays. $\\sigma = Q/A$ is fixed, so $E = \\sigma/\\varepsilon_0$ is fixed; $V = Ed$ grows with $d$; $C = \\varepsilon_0A/d$ falls; $W = Q^2/2C$ grows. Work you do: $${fm(x - 1)}\\,W_0$ (the plates attract with $F = Q^2/2\\varepsilon_0A$; negative means they pulled themselves together).</p>`
          : `<p>Battery: $V$ is held. $C$ falls, so charge flows back into the battery ($Q = CV$); $E = V/d$ falls; the field energy $W = \\tfrac12CV^2$ falls. Work you do: $${fm(1 - 1 / x)}\\,W_0$ (the plates still attract). Energy delivered to the battery: $${fm(2 * (1 - 1 / x))}\\,W_0$, your work plus the field energy released.</p>`;
        if (window.Engine) Engine.renderMath(el);
      }
      el.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
      draw();
    });

    return {
      id: 'u3-capacitors', title: 'Capacitance and the energy of a capacitor',
      steps: [
        RF(md`
          ### Capacitance

          Two conductors carry $+Q$ and $-Q$. Each is an equipotential, so the potential difference

          $$V = V_+ - V_- = -\int_{(-)}^{(+)}\vb E\cdot d\vb l$$

          is well defined.

          [[fig:two]]

          In-class question: how does $V$ change with the charge? Poisson's equation $\lap V = -\rho/\varepsilon_0$ is **linear**: multiply every charge by the same factor and $V$ and $\vb E$ get multiplied by that factor. (Griffiths flags the fine print: doubling $Q$ really does double $\rho$ everywhere rather than rearranging it. That's a uniqueness theorem, next unit.) So $V\propto Q$, and the constant

          $$C = \frac{Q}{V}\qquad\left[\frac{\text{coulomb}}{\text{volt}} = \text{farad}\right]$$

          is the **capacitance**: how much charge the pair holds per volt. It depends only on geometry (sizes, shapes, separation) and on the material between the conductors, never on $Q$ or $V$. By convention $Q$ is the charge of the positive conductor and $V = V_+ - V_-$, so $C>0$. Capacitors are used for energy storage, filtering, and pulsed applications.

          **One conductor alone:** the "other plate" is a sphere at infinity, and $V$ is measured from $V(\infty) = 0$. An isolated sphere has $V = \dfrac{Q}{4\pi\varepsilon_0R}$, so $C = 4\pi\varepsilon_0R$.

          !!key Boundary conditions for capacitor problems
            Each plate is an equipotential. Either the **charges** $\pm Q$ are given (an isolated capacitor) and you compute $V$, or the **voltage** is given (a battery: $V = V_0$ on one plate, $0$ on the other) and you compute $Q$. $C$ links the two either way.
        `, { two: { svg: fTwoCond(), cap: 'Lecture 7: two conductors with charges $+Q$ and $-Q$. Field lines run from one to the other.' } }),

        Q(md`The charges on the two conductors are doubled, to $\pm2Q$. The capacitance`,
          [md`doubles`, md`halves`, md`quadruples, since the energy quadruples`, md`stays the same; $V$ doubles`], 3,
          [md`$C = Q/V$, and $V$ doubles along with $Q$.`, md`$C$ depends only on geometry; changing $Q$ can't change it.`, md`The energy does quadruple ($Q^2/2C$), but $C$ itself is unchanged.`, null],
          md`Linearity: $V\propto Q$ with a constant of proportionality $1/C$ that depends only on the conductors' shapes and arrangement. Double $Q$, double $V$, same $C$.`,
          { figHtml: fTwoCond() }),

        Q(md`How big would an isolated metal sphere have to be to have a capacitance of 1 farad?`,
          [md`Radius about $9\times10^9$ m, some 20 times the Earth–Moon distance`, md`Radius about 9 cm`, md`Radius about 9 m`, md`Radius about 9 km`], 0,
          [null, md`$4\pi\varepsilon_0(0.09\text{ m}) = 10^{-11}$ F, ten picofarads.`, md`$4\pi\varepsilon_0(9\text{ m}) = 10^{-9}$ F, one nanofarad.`, md`$4\pi\varepsilon_0(9000\text{ m}) = 10^{-6}$ F, one microfarad.`],
          md`$R = \dfrac{C}{4\pi\varepsilon_0} = (1\text{ F})(8.99\times10^9\text{ m/F}) = 9\times10^9$ m. A farad is enormous; practical capacitors are measured in pF to mF (and reach large values only with tiny gaps and large areas).`,
          { figHtml: fIso() }),

        Q(md`Treating the Earth (radius $6.4\times10^6$ m) as an isolated conducting sphere, its capacitance is about`,
          [md`0.7 F`, md`0.7 $\mu$F`, md`7 kF`, md`0.7 mF`], 3,
          [md`That would need a radius of about $6\times10^9$ m.`, md`That's the capacitance of a sphere of radius 6 km.`, md`Far too large; $4\pi\varepsilon_0 R$ is only about $10^{-10}$ F per metre of radius.`, null],
          md`$C = 4\pi\varepsilon_0R = (6.4\times10^6\text{ m})/(8.99\times10^9\text{ m/F}) = 7.1\times10^{-4}$ F $\approx 0.7$ mF. The whole planet is a modest capacitor.`,
          { figHtml: fIso() }),

        Q(md`A charged capacitor is disconnected from its battery, and then its plates are pulled apart. Which quantity stays fixed?`,
          [md`The voltage $V$`, md`The capacitance $C$`, md`The stored energy`, md`The charge $Q$`], 3,
          [md`$V$ is fixed only while a battery holds it. Disconnected, $V = Q/C$ changes as $C$ changes.`, md`$C = \varepsilon_0A/d$ depends on the separation.`, md`The energy changes: you do work pulling the plates apart.`, null],
          md`Isolated conductors keep their charge: that's the boundary condition ("isolated with charge $\pm Q$"). With $Q$ fixed and $C$ falling, $V = Q/C$ rises and $W = Q^2/2C$ rises.`,
          { figHtml: fPPside() }),

        RF(md`
          ### The parallel-plate capacitor (Lecture 8)

          Two plates of area $A$, a distance $d$ apart, with $+Q$ on the top plate and $-Q$ on the bottom. Take $\sqrt A\gg d$ so that fringing (edge effects) can be neglected; then $\sigma = Q/A$.

          [[fig:pp]]

          **One sheet**, by a pillbox: $2EA' = \sigma A'/\varepsilon_0$, so $E = \dfrac{\sigma}{2\varepsilon_0}$, pointing away from a positive sheet on both sides. (The notes write $+\tfrac{\sigma}{2\varepsilon_0}\hat{\vb z}$ below the sheet too; below a positive sheet the field points down, $-\tfrac{\sigma}{2\varepsilon_0}\hat{\vb z}$. Their drawing has it right.)

          **Two plates** (in-class question): superpose. Above the top plate and below the bottom plate the two contributions cancel; between the plates they add.

          [[fig:sup]]

          $$\lvert\vb E\rvert = \frac{\sigma}{\varepsilon_0}\ \text{between the plates, pointing from } + \text{ to } -;\qquad \vb E = 0\ \text{outside}.$$

          (The notes write $\vb E = \tfrac{\sigma}{\varepsilon_0}\hat{\vb z}$ between the plates. With $+Q$ on top the field points down, $-\tfrac{\sigma}{\varepsilon_0}\hat{\vb z}$. The magnitude, and everything below, is unaffected.)

          **Integrate $\vb E$ to get $V$:** $V = V_+ - V_- = \dfrac{\sigma}{\varepsilon_0}d = \dfrac{Q}{A\varepsilon_0}d$, so

          $$C = \frac{\varepsilon_0A}{d}.$$

          Example: plates $1\ \text{cm}\times1\ \text{cm}$, $1$ mm apart: $C = \dfrac{(8.85\times10^{-12})(10^{-4})}{10^{-3}} = 8.9\times10^{-13}$ F, about $0.9$ pF.

          Since $\vb E = 0$ outside, the conductor rule $\sigma = \varepsilon_0E_{\text{outside}}$ says the outer faces carry no charge: all of $\pm Q$ sits on the **inner** faces, facing each other.
        `, { pp: { svg: fPP3D(), cap: 'Lecture 7–8: parallel plates of area $A$, separation $d$, charges $\\pm Q$.' }, sup: { svg: fSup(), cap: 'Solid arrows: the field of the $+$ plate, $\\sigma/2\\varepsilon_0$ each side. Dashed: the $-$ plate. They cancel outside and add in between.' } }),

        Q(md`For an ideal parallel-plate capacitor (fringing neglected), the field just above the top plate, on the outside, is`,
          [md`$\sigma/2\varepsilon_0$, from the top plate alone`, md`$\sigma/\varepsilon_0$, as just outside any conductor`, md`zero`, md`$2\sigma/\varepsilon_0$`], 2,
          [md`The bottom plate contributes $\sigma/2\varepsilon_0$ in the opposite direction there; they cancel.`, md`$\sigma/\varepsilon_0$ is the field next to the charged face, which is the **inner** face. The outer face has no charge, and the field there is zero.`, null, md`Nothing adds up to that anywhere.`],
          md`Each plate contributes $\sigma/2\varepsilon_0$; outside the pair they point in opposite directions and cancel. Consistent with the conductor rule: the outer faces carry no charge, so the field just outside them is $0/\varepsilon_0 = 0$.`,
          { figHtml: fPPside() }),

        Q(md`The plate separation of a parallel-plate capacitor is doubled. Its capacitance`,
          [md`doubles`, md`stays the same`, md`drops to a quarter`, md`halves`], 3,
          [md`A bigger gap means a bigger $V$ for the same $Q$, so less charge per volt.`, md`$C$ depends on geometry, and the geometry changed.`, md`$C\propto 1/d$, not $1/d^2$.`, null],
          md`$C = \varepsilon_0A/d$. Double $d$, half $C$. (Double $A$ instead and $C$ doubles.)`,
          { figHtml: fPPside() }),

        Q(md`Where does the charge sit on the plates of a parallel-plate capacitor?`,
          [md`On the inner faces, facing each other`, md`On the outer faces`, md`Half on each face of each plate`, md`Spread through the thickness of the plates`], 0,
          [null, md`The field outside is zero, so the outer faces carry no charge ($\sigma = \varepsilon_0E_{\text{out}} = 0$).`, md`That's an isolated charged plate. Here the opposite charge on the other plate pulls all of it to the inner face.`, md`Charge on a conductor sits on its surface, never in its bulk.`],
          md`$+Q$ on the inner face of the top plate, $-Q$ on the inner face of the bottom plate. Each face gives $\sigma/\varepsilon_0$ just outside it (into the gap), which is exactly the gap field.`,
          { figHtml: fPPside() }),

        Q(md`An isolated parallel-plate capacitor (charge fixed) has its plates pulled farther apart. The field between the plates`,
          [md`decreases, since the plates are farther apart`, md`increases, since $V$ increases`, md`drops to zero`, md`stays the same`], 3,
          [md`The field of a large sheet doesn't depend on distance. With $\sigma$ fixed, $E = \sigma/\varepsilon_0$ is fixed.`, md`$V = Ed$ increases because $d$ does, not because $E$ does.`, md`The plates still carry $\pm Q$.`, null],
          md`$E = \sigma/\varepsilon_0 = Q/(\varepsilon_0A)$: independent of $d$. The voltage $V = Ed$ grows, and so does the volume $Ad$ filled with the same energy density $\tfrac{\varepsilon_0}{2}E^2$.`,
          { figHtml: fPPside() }),

        RF(md`
          ### Energy stored in a capacitor

          To charge a capacitor, move charge from the $-$ plate to the $+$ plate a little at a time. When the plates hold $\pm q$, the potential difference is $q/C$, so moving the next $dq$ costs (the notes' green line) $dW = V\,dq$:

          $$dW = \frac{q}{C}\,dq\qquad\Longrightarrow\qquad W = \int_0^Q\frac{q}{C}\,dq = \frac{Q^2}{2C} = \frac12CV^2 = \frac12QV.$$

          [[fig:tri]]

          **Why the $\tfrac12$:** the first bits of charge cross almost no voltage; only the last bit crosses the full $V$. On average, charge crosses $V/2$.

          **Check with the field energy** for parallel plates: $u = \tfrac{\varepsilon_0}{2}\left(\tfrac{\sigma}{\varepsilon_0}\right)^2$ fills the volume $Ad$, so $W = \dfrac{\sigma^2}{2\varepsilon_0}Ad = \dfrac{Q^2d}{2\varepsilon_0A} = \dfrac{Q^2}{2C}$. The same.

          Capacitance will only ever depend on geometry and materials; the energy is then fixed by $Q$ (or $V$).
        `, { tri: { svg: fVq(), cap: 'While charging, $V$ grows linearly with $q$. The work is the area under the line: a triangle, $\\tfrac12 QV$.' } }),

        wCap(),

        Q(md`A capacitor holds charge $Q$ at voltage $V$. Someone says the stored energy is $QV$. Why is that twice too big?`,
          [md`Because only half of the charge is on the positive plate`, md`Because half the energy is stored outside the plates`, md`Because $V$ is measured from the midpoint of the gap`, md`Because the voltage was smaller while the charge was being moved: it grew from 0 to $V$`], 3,
          [md`All of $+Q$ is on the positive plate (and $-Q$ on the other); $Q$ in $\tfrac12QV$ is that whole charge.`, md`For ideal plates there's no field outside at all.`, md`$V$ is the full plate-to-plate difference.`, null],
          md`$QV$ would be the work to move all of $Q$ across the **final** voltage. But during charging the voltage was $q/C$, growing from 0. Averaging: $W = \int_0^Q V(q)\,dq = \tfrac12QV$. (Compare $W = \tfrac12\sum q_iV_i$ for point charges: the same $\tfrac12$.)`,
          { figHtml: fPPside() }),

        Q(md`An isolated capacitor (charge fixed) has its plate separation doubled. The stored energy`,
          [md`halves`, md`stays the same, since the charge is unchanged`, md`doubles; the extra comes from the work you did pulling the plates apart`, md`quadruples`], 2,
          [md`That's what happens at fixed **voltage**. At fixed charge, $W = Q^2/2C$ and $C$ halves.`, md`$W = Q^2/2C$, and $C$ changed.`, null, md`$W\propto1/C\propto d$: a factor 2, not 4.`],
          md`$W = \dfrac{Q^2}{2C} = \dfrac{Q^2d}{2\varepsilon_0A}\propto d$. The plates attract, so pulling them apart takes work, and that work is stored as field energy in the newly opened volume ($u$ is unchanged, the volume doubled).`,
          { figHtml: fPPside() }),

        Q(md`A capacitor stays connected to a battery while its plate separation is doubled. The stored energy halves. Which statement is right?`,
          [md`You did negative work: the plates pushed themselves apart`, md`Energy is not conserved here`, md`The battery supplied the missing energy`, md`You still did positive work, and both your work and the released field energy went into the battery`], 3,
          [md`Opposite charges attract no matter what; separating the plates always takes positive work.`, md`It is conserved once you include the battery.`, md`The battery **absorbed** energy: charge was pushed back into it against its voltage.`, null],
          md`With $V$ fixed, $Q = CV$ halves, so $\tfrac12Q_0$ flows back into the battery, which gains $V\cdot\tfrac12Q_0 = W_0$ (with $W_0 = \tfrac12Q_0V$). The field energy fell by $\tfrac12W_0$, and you supplied the other $\tfrac12W_0$. Try both modes in the widget above.`,
          { figHtml: fPPside() }),

        Q(md`For an isolated parallel-plate capacitor with charge $Q$, the force of attraction between the plates`,
          [md`is $\dfrac{Q^2}{2\varepsilon_0A}$, the same at any separation (while $d\ll\sqrt A$)`, md`falls off like $1/d^2$, as for point charges`, md`is $\dfrac{Q^2}{\varepsilon_0A}$, from $Q$ times the field $Q/\varepsilon_0A$`, md`is zero, since the field outside is zero`], 0,
          [null, md`Each plate is a large sheet whose field doesn't depend on distance.`, md`That uses the full field at the plate; the plate's own charge can't push itself. Use the other plate's field, $\sigma/2\varepsilon_0$, which is the average field.`, md`The field outside is zero, but each plate feels the other plate's field in the gap.`],
          md`Force per area on the plate's surface charge: $\dfrac{\sigma^2}{2\varepsilon_0}$, so $F = \dfrac{\sigma^2}{2\varepsilon_0}A = \dfrac{Q^2}{2\varepsilon_0A}$. Energy check: $W = \dfrac{Q^2x}{2\varepsilon_0A}$ at separation $x$, and $F = dW/dx = \dfrac{Q^2}{2\varepsilon_0A}$: constant, so pulling the plates from $d$ to $2d$ costs $Fd = W_0$, the doubling of the previous question.`,
          { figHtml: fPPside() }),

        P({
          title: 'Spherical capacitor (Griffiths Ex. 2.12)',
          q: md`Two concentric metal spherical shells have radii $a$ (inner) and $b$ (outer). Find the capacitance, then check two limits.`,
          figHtml: fSphCap(false),
          hints: [md`Conditions: put $+Q$ on the inner shell and $-Q$ on the outer; each shell is an equipotential.`, md`Gauss between the shells: $E = \dfrac{Q}{4\pi\varepsilon_0r^2}$. Then $V = -\int_b^a E\,dr$.`, md`For the thin-gap limit, write $b = a + d$ with $d\ll a$.`],
          parts: [
            { lbl: 'C', expr: '4*pi*eps0*a*b/(b - a)', vars: { eps0: [0.5, 2], a: [0.5, 1.5], b: [2, 4] }, accepts: ['4*pi*eps0/(1/a - 1/b)'] },
            { lbl: md`As $b\to\infty$, $C$ tends to`, mc: [md`$\infty$`, md`$0$`, md`$4\pi\varepsilon_0 a$, the isolated sphere`], a: 2,
              why: [md`$\dfrac{ab}{b-a}\to a$, which is finite.`, md`$\dfrac{ab}{b-a}\to a$, not 0. An isolated sphere still has capacitance.`, null] },
            { lbl: md`If $b = a + d$ with $d\ll a$, $C$ tends to`, mc: [md`$\dfrac{\varepsilon_0\,4\pi a^2}{d}$, a parallel-plate capacitor of area $4\pi a^2$`, md`$4\pi\varepsilon_0 a$`, md`$\dfrac{\varepsilon_0\,4\pi a^2}{2d}$`], a: 0,
              why: [null, md`That's the opposite limit (outer shell far away).`, md`$\dfrac{ab}{b-a}\approx\dfrac{a^2}{d}$, with no factor $\tfrac12$.`] },
          ],
          sol: md`
            **Conditions.** Two conductors, each an equipotential; inner shell $+Q$, outer $-Q$ (isolated, charges given). By symmetry each charge is uniform.

            **Field:** Gauss with a sphere of radius $r$ between the shells encloses $Q$: $E = \dfrac{Q}{4\pi\varepsilon_0r^2}$. Inside $a$ and outside $b$ the field is zero.

            [[fig:g]]

            **Voltage:**

            $$V = V(a) - V(b) = -\int_b^a\frac{Q}{4\pi\varepsilon_0r^2}\,dr = \frac{Q}{4\pi\varepsilon_0}\left(\frac1a - \frac1b\right),\qquad C = \frac{Q}{V} = 4\pi\varepsilon_0\frac{ab}{b-a}.$$

            **Limits.** $b\to\infty$: $C\to4\pi\varepsilon_0a$, the isolated sphere (the outer shell is the "plate at infinity"). Thin gap $b = a+d$: $C\approx4\pi\varepsilon_0\dfrac{a^2}{d} = \dfrac{\varepsilon_0(4\pi a^2)}{d}$, a parallel-plate capacitor with area $4\pi a^2$. Both make sense.
          `,
          figs: { g: { svg: fSphCap(true), cap: 'Gaussian sphere of radius $r$ (dashed) between the shells; the field points outward, from $+Q$ to $-Q$.' } },
        }),

        P({
          title: 'Energy of the spherical capacitor, two ways',
          q: md`The spherical capacitor above holds charges $\pm Q$. Find its energy (a) from $Q^2/2C$ and (b) from $\tfrac{\varepsilon_0}{2}\int E^2\,d\tau$, and check they agree.`,
          figHtml: fSphCap(false),
          hints: [md`(a) Use $C = 4\pi\varepsilon_0ab/(b-a)$.`, md`(b) The field lives only between the shells. You have done this integral before: two concentric shells with $\pm q$ (Lesson 4).`],
          parts: [{ lbl: 'W', expr: 'Q^2*(b - a)/(8*pi*eps0*a*b)', vars: { Q: [0.5, 3], eps0: [0.5, 2], a: [0.5, 1.5], b: [2, 4] }, accepts: ['Q^2/(8*pi*eps0)*(1/a - 1/b)'] }],
          sol: md`
            **Conditions.** Two conductors with charges $\pm Q$ given (isolated); each an equipotential; the field is radial and lives only between the shells.

            **(a)** $W = \dfrac{Q^2}{2C} = \dfrac{Q^2(b-a)}{8\pi\varepsilon_0ab} = \dfrac{Q^2}{8\pi\varepsilon_0}\left(\dfrac1a - \dfrac1b\right)$.

            **(b)** $W = \dfrac{\varepsilon_0}{2}\displaystyle\int_a^b\left(\frac{Q}{4\pi\varepsilon_0r^2}\right)^2 4\pi r^2\,dr = \frac{Q^2}{8\pi\varepsilon_0}\left(\frac1a - \frac1b\right).$

            They agree, as they must: $\tfrac12CV^2$ is the field energy. This is exactly the "two concentric shells" worked example of Lesson 4.
          `,
        }),

        P({
          title: 'An isolated sphere as a capacitor',
          q: md`An isolated metal sphere of radius $R = 10$ cm is charged to $V = 10$ kV (relative to infinity). Find its capacitance, its charge, and the stored energy. Use $\dfrac{1}{4\pi\varepsilon_0} = 8.99\times10^9$ m/F.`,
          figHtml: fIso(),
          hints: [md`$C = 4\pi\varepsilon_0R$.`, md`$Q = CV$ and $W = \tfrac12CV^2$.`],
          parts: [
            { lbl: 'C', ans: 11.13, unit: 'pF' },
            { lbl: 'Q', ans: 111.3, unit: 'nC' },
            { lbl: 'W', ans: 0.5563, unit: 'mJ' },
          ],
          sol: md`
            **Conditions.** One conductor, potential given ($V = 10$ kV), $V(\infty) = 0$.

            $C = 4\pi\varepsilon_0R = \dfrac{0.10}{8.99\times10^9} = 1.11\times10^{-11}$ F $= 11.1$ pF.

            $Q = CV = (1.11\times10^{-11})(10^4) = 1.11\times10^{-7}$ C $= 111$ nC.

            $W = \tfrac12CV^2 = \tfrac12(1.11\times10^{-11})(10^4)^2 = 5.6\times10^{-4}$ J $= 0.56$ mJ.

            Check: $W = \dfrac{Q^2}{8\pi\varepsilon_0R}$, the shell energy of Lesson 3, gives the same.
          `,
        }),

        P({
          title: 'Separating the plates at fixed charge',
          q: md`An isolated parallel-plate capacitor (area $A$, separation $d$) carries $\pm Q$. The plates are slowly pulled apart from $d$ to $2d$. Answer each part relative to the starting values $C_0$, $V_0$, $E_0$, $W_0$.`,
          figHtml: fPPside(),
          hints: [md`Conditions: isolated, so $Q$ is fixed. $C = \varepsilon_0A/d$, $E = \sigma/\varepsilon_0$, $V = Ed$, $W = Q^2/2C$.`],
          parts: [
            { lbl: md`$C$ becomes`, mc: [md`$2C_0$`, md`$C_0/2$`, md`$C_0$`, md`$C_0/4$`], a: 1, why: [md`$C\propto1/d$.`, null, md`$C$ depends on $d$.`, md`$C\propto 1/d$, not $1/d^2$.`] },
            { lbl: md`$V$ becomes`, mc: [md`$V_0/2$`, md`$V_0$`, md`$4V_0$`, md`$2V_0$`], a: 3, why: [md`$V = Q/C$ and $C$ halved.`, md`$V$ is only fixed when a battery is attached.`, md`$V = Ed$ with $E$ unchanged: a factor 2.`, null] },
            { lbl: md`$E$ between the plates becomes`, mc: [md`$E_0$`, md`$E_0/2$`, md`$2E_0$`, md`$0$`], a: 0, why: [null, md`$E = \sigma/\varepsilon_0$ and $\sigma$ didn't change.`, md`$E = \sigma/\varepsilon_0$ and $\sigma$ didn't change.`, md`The plates still carry their charge.`] },
            { lbl: md`$W$ becomes`, mc: [md`$W_0/2$`, md`$W_0$`, md`$2W_0$`, md`$4W_0$`], a: 2, why: [md`That's the fixed-$V$ result.`, md`$W = Q^2/2C$ and $C$ halved.`, null, md`$W\propto d$, a factor 2.`] },
            { lbl: md`The work you did, in units of $W_0$`, ans: 1, unit: '' },
          ],
          sol: md`
            **Conditions.** Isolated plates: $Q$ fixed. Then $C = \varepsilon_0A/d$ halves, $E = \sigma/\varepsilon_0 = Q/\varepsilon_0A$ is unchanged, $V = Ed$ doubles, and $W = Q^2/2C = \tfrac12QV$ doubles.

            **Work:** $W_{\text{you}} = \Delta W = 2W_0 - W_0 = W_0$. Directly: the attraction $F = Q^2/2\varepsilon_0A$ is constant, and $F\cdot d = \dfrac{Q^2d}{2\varepsilon_0A} = W_0$. The energy density $\tfrac{\varepsilon_0}{2}E^2$ didn't change; the volume holding it doubled.
          `,
        }),

        P({
          title: 'Separating the plates at fixed voltage',
          q: md`The same capacitor stays connected to a battery of voltage $V_0$ while the plates are slowly pulled apart from $d$ to $2d$. Answer relative to the starting values $Q_0$, $E_0$, $W_0$ (with $W_0 = \tfrac12Q_0V_0$).`,
          figHtml: fPPside(),
          hints: [md`Conditions: the battery holds $V = V_0$. $C$ still halves.`, md`$Q = CV$, $E = V/d$, $W = \tfrac12CV^2$. The battery's energy changes by $V_0\,\Delta Q$.`],
          parts: [
            { lbl: md`$Q$ becomes`, mc: [md`$Q_0$`, md`$2Q_0$`, md`$Q_0/2$`, md`$Q_0/4$`], a: 2, why: [md`With $V$ fixed and $C$ halved, $Q = CV$ halves.`, md`$Q = CV$ and $C$ went down.`, null, md`$Q\propto C\propto1/d$: a factor 2.`] },
            { lbl: md`$E$ becomes`, mc: [md`$E_0/2$`, md`$E_0$`, md`$2E_0$`, md`$E_0/4$`], a: 0, why: [null, md`$E = V/d$ with $V$ fixed and $d$ doubled. (Equivalently $\sigma$ halved.)`, md`$E = V/d$ decreases.`, md`$E = V/d$: one factor of 2.`] },
            { lbl: md`$W$ becomes`, mc: [md`$2W_0$`, md`$W_0$`, md`$W_0/4$`, md`$W_0/2$`], a: 3, why: [md`That's the fixed-$Q$ result.`, md`$W = \tfrac12CV^2$ and $C$ halved.`, md`$W\propto C$: a factor 2.`, null] },
            { lbl: md`Energy delivered **to** the battery, in units of $W_0$`, ans: 1, unit: '' },
            { lbl: md`Work you did, in units of $W_0$`, ans: 0.5, unit: '' },
          ],
          sol: md`
            **Conditions.** The battery fixes $V = V_0$. $C = \varepsilon_0A/d$ halves, so $Q = CV_0$ halves, $E = V_0/d$ halves, and $W = \tfrac12CV_0^2$ halves.

            **Energy bookkeeping.** Charge $\tfrac12Q_0$ flows back into the battery against its voltage, so the battery gains $V_0\cdot\tfrac12Q_0 = W_0$. The field lost $\tfrac12W_0$. Conservation: your work $= W_0 - \tfrac12W_0 = \tfrac12W_0$, positive (the plates still attract, now with a decreasing force $F = Q^2/2\varepsilon_0A$).

            **Compare with fixed $Q$:** there $W$ doubled and you did $W_0$. The difference is the battery.
          `,
        }),

        P({
          id: 'HW4-2.44', src: 'HW 4 · Griffiths 2.44', title: 'Capacitance of coaxial tubes', big: true,
          q: md`Find the capacitance per unit length of two coaxial metal cylindrical tubes, of radii $a$ and $b$ (Fig. 2.53).`,
          figHtml: fCoax(),
          hints: [
            md`Conditions: two conductors, each an equipotential. Put charge $+\lambda$ per unit length on the inner tube and $-\lambda$ on the outer. Treat the tubes as very long (ignore the ends).`,
            md`Gauss with a cylinder of radius $s$ ($a<s<b$) and length $\ell$: $E\cdot2\pi s\ell = \lambda\ell/\varepsilon_0$.`,
            md`$V = V(a) - V(b) = \displaystyle\int_a^b E\,ds$. Then $C/\ell = \lambda/V$.`,
          ],
          parts: [
            { lbl: md`$E(s)$ between the tubes`, expr: 'lambda/(2*pi*eps0*s)', vars: { lambda: [0.5, 3], eps0: [0.5, 2], s: [1, 3] } },
            { lbl: md`C/L`, expr: '2*pi*eps0/ln(b/a)', vars: { eps0: [0.5, 2], a: [0.5, 1.5], b: [2, 5] }, accepts: ['2*pi*eps0/(ln(b) - ln(a))'] },
            { lbl: md`If the gap is thin, $b = a + d$ with $d\ll a$, $C/L$ tends to`, mc: [md`$2\pi\varepsilon_0$`, md`$\dfrac{\varepsilon_0\,2\pi a}{d}$, parallel plates of width $2\pi a$`, md`$0$`, md`$\dfrac{\varepsilon_0\,\pi a^2}{d}$`], a: 1,
              why: [md`That's $\ln(b/a) = 1$, i.e. $b = ea$, not a thin gap.`, null, md`A thin gap makes $C$ **large**: $\ln(1+d/a)\approx d/a\to0$ in the denominator.`, md`The relevant area per unit length is the circumference $2\pi a$, not the cross-section.`] },
            { lbl: md`If the inner conductor shrinks to a thin wire ($a\to0$) at fixed $b$, $C/L$`, mc: [md`grows without bound`, md`stays finite and nonzero`, md`goes to zero, but only logarithmically slowly`], a: 2,
              why: [md`$\ln(b/a)\to\infty$, so $C/L\to0$.`, md`$\ln(b/a)$ grows without bound as $a\to0$.`, null] },
          ],
          sol: md`
            **Conditions.** Two conductors, each an equipotential: inner tube with $+\lambda$ per unit length, outer tube with $-\lambda$ (isolated, charges given). Long tubes: by symmetry $\vb E = E(s)\hat{\vb s}$.

            **Field.** Gauss with a cylinder of radius $s$ and length $\ell$ (dashed in the cross-section):

            [[fig:g]]

            $$E\cdot2\pi s\ell = \frac{\lambda\ell}{\varepsilon_0}\quad\Longrightarrow\quad \vb E = \frac{\lambda}{2\pi\varepsilon_0 s}\hat{\vb s}\quad(a<s<b).$$

            Inside the inner tube and outside the outer one the enclosed charge is zero, so $\vb E = 0$ there.

            **Voltage.**

            $$V = V(a) - V(b) = \int_a^b\frac{\lambda}{2\pi\varepsilon_0s}\,ds = \frac{\lambda}{2\pi\varepsilon_0}\ln\frac ba .$$

            **Capacitance per unit length.**

            $$\frac{C}{L} = \frac{\lambda}{V} = \frac{2\pi\varepsilon_0}{\ln(b/a)}.$$

            **Checks.**
            - Thin gap, $b = a+d$: $\ln(1+d/a)\approx d/a$, so $C/L\approx\dfrac{2\pi\varepsilon_0a}{d} = \dfrac{\varepsilon_0(2\pi a)}{d}$: parallel plates whose width is the circumference.
            - Numbers: with $b/a = e$, $C/L = 2\pi\varepsilon_0 = 55.6$ pF/m, the right size for real coaxial cable.
            - Energy: $\dfrac{\lambda^2}{2(C/L)} = \dfrac{\lambda^2\ln(b/a)}{4\pi\varepsilon_0}$ per unit length, the same as $\tfrac{\varepsilon_0}{2}\int_a^b E^2\,2\pi s\,ds$.

            **What to remember:** set up $\pm Q$ (or $\pm\lambda$), get $\vb E$ by Gauss, integrate between the conductors for $V$, divide. $C$ never depends on the charge you assumed.
          `,
          figs: { g: { svg: fCoaxEnd(true), cap: 'Cross-section: inner tube $+\\lambda$, outer tube $-\\lambda$, Gaussian cylinder of radius $s$ (dashed); $\\vb E$ is radial in the gap.' } },
        }),

        RF(md`
          !!key Patterns to remember
            - $C = Q/V$: geometry only. Recipe: assume $\pm Q$ (or $\pm\lambda$), Gauss for $\vb E$, integrate from one conductor to the other for $V$, divide.
            - Parallel plates $\dfrac{\varepsilon_0A}{d}$; spherical $\dfrac{4\pi\varepsilon_0ab}{b-a}$; isolated sphere $4\pi\varepsilon_0R$; coaxial $\dfrac{2\pi\varepsilon_0}{\ln(b/a)}$ per length. Thin gaps all reduce to $\varepsilon_0(\text{area})/d$.
            - $W = \dfrac{Q^2}{2C} = \tfrac12CV^2 = \tfrac12QV$, equal to $\tfrac{\varepsilon_0}{2}\int E^2\,d\tau$.
            - Isolated capacitor: $Q$ fixed (use $Q^2/2C$). Battery attached: $V$ fixed (use $\tfrac12CV^2$, and count the battery's energy).
            - Parallel plates: $E = \sigma/\varepsilon_0$ inside, $0$ outside, charge on the inner faces, attraction $Q^2/2\varepsilon_0A$.
        `),
      ],
    };
  };


  C.unit({
    id: 'u3', num: 'Unit 3', title: 'Work, energy and conductors',
    blurb: 'The work to move and assemble charges, field energy, the seven properties of conductors, cavities and shielding, surface charge and electrostatic pressure, capacitors.',
    lessons: [L1(), L2(), L3(), L4(), L5(), L6(), L7(), L8()],
  });
})();

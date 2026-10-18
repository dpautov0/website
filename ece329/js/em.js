/* em.js — constants, number formatting and E&M drawing helpers shared by every ECE 329 lesson, drill and solution.
   One place for every number the site assumes; problems always state the values they use.

   Numbers:   EM.f(x)  TeX, 3 significant figures (answers)      EM.p(x)  TeX, short (problem statements)
              EM.mu0, EM.eps0, EM.c, EM.eta0
   Cards:     EM.MC(title, q, right, [[wrong, why], ...], sol, fig)   a rapid-fire multiple-choice card (3 wrongs drawn)
              EM.one([() => card, ...])                               one template at random
              EM.N(lbl, ans, unit, rel)                               a numeric answer part
              EM.sol({eq, sym, sub, ans})                             the graded solution format
   Lessons:   EM.lesson(unitId, lesson)                               adds a lesson to a unit declared in site.js
              EM.BANK[lessonId] = [Q(...), ...]                       extra multiple choice for the question bank
   Figures (methods added to PF figures, screen pixels, y down):
              f.odot(x,y,r)  f.otimes(x,y,r)        a current or field arrow out of / into the page
              f.marks('dot'|'x', x0,y0,x1,y1, nx,ny) a uniform field out of / into the page, as a grid of marks
              f.loopRect(x,y,w,h,{dir:'ccw'|'cw'})  a closed path with a circulation arrow on each side
              f.loopCirc(cx,cy,r,{dir})             a circular path with two circulation arrows
              f.sheet(x,y1,y2,{lab})                a current sheet seen edge-on
              f.coil(x,y,w,h,n)                     a solenoid seen from the side (n turns) */
(function () {
  'use strict';

  const EM = (window.EM = window.EM || {});
  EM.mu0 = 4 * Math.PI * 1e-7;     // H/m
  EM.eps0 = 8.854e-12;             // F/m
  EM.c = 3e8;                      // m/s, the course value
  EM.eta0 = 120 * Math.PI;         // Ω, the course value (377 Ω)

  // ---------------------------------------------------------------- numbers
  // 3 significant figures; scientific notation outside [0.01, 10⁴)
  EM.f = (x, sig = 3) => {
    if (x === 0) return '0';
    if (!isFinite(x)) return '\\infty';
    const ax = Math.abs(x);
    if (ax >= 0.01 && ax < 1e4) return ax >= Math.pow(10, sig) ? String(+x.toPrecision(sig)) : x.toPrecision(sig);
    let e = Math.floor(Math.log10(ax));
    let m = +(x / Math.pow(10, e)).toFixed(sig - 1);
    if (Math.abs(m) >= 10) { m /= 10; e += 1; }
    return `${m.toFixed(sig - 1)}\\times10^{${e}}`;
  };
  // a short number for statements: no trailing zeros, 1e-6 -> 10^{-6}
  EM.p = (x) => {
    if (x === 0) return '0';
    const ax = Math.abs(x);
    if (ax >= 0.01 && ax < 1e4) return String(+x.toPrecision(4));
    const e = Math.floor(Math.log10(ax) + 1e-9);
    const m = +(x / Math.pow(10, e)).toPrecision(4);
    return m === 1 ? `10^{${e}}` : m === -1 ? `-10^{${e}}` : `${m}\\times10^{${e}}`;
  };

  // ---------------------------------------------------------------- cards
  EM.MC = (title, q, right, wrongs, sol, fig) => {
    const seen = new Set([right]), keep = [];
    for (const [o, w] of wrongs) if (!seen.has(o)) { seen.add(o); keep.push([o, w]); }
    const all = [[right, null], ...U.shuffle(keep).slice(0, 3)];
    return { title, q, parts: [{ mc: all.map((x) => x[0]), a: 0, why: all.map((x) => x[1]) }], sol, fig };
  };
  EM.one = (list) => U.pick(list)();
  // abs: 0 so a tiny answer (an emf of 1e-7 V) is not matched by typing 0
  EM.N = (lbl, ans, unit, rel = 0.02) => ({ lbl, ans, unit, tol: { rel, abs: 0 } });
  // the graded format: governing equation, symbolic solution, substitution with units, answer
  EM.sol = (o) => [
    o.eq && `**1. Governing equation.** ${o.eq}`,
    o.sym && `**2. Solve symbolically.** ${o.sym}`,
    o.sub && `**3. Substitute, with units.** ${o.sub}`,
    o.ans && `**4. Answer.** ${o.ans}`,
    o.check && `**Check.** ${o.check}`,
  ].filter(Boolean).join('\n\n');

  // ---------------------------------------------------------------- lessons
  EM.lesson = (unitId, l) => {
    const u = COURSE.units.find((x) => x.id === unitId);
    if (!u) throw new Error(`EM.lesson: no unit ${unitId}`);
    u.lessons.push(l);
    return l;
  };
  EM.BANK = EM.BANK || {};

  // ---------------------------------------------------------------- figures
  const F = window.PF && PF.Fig && PF.Fig.prototype;
  if (F) {
    // out of the page: circle with a dot; into the page: circle with a cross
    F.odot = function (x, y, r = 6, o = {}) { this.circle(x, y, r, { cls: 'bgfill' + (o.cls ? ' ' + o.cls : '') }); this.dot(x, y, Math.max(1.6, r * 0.28)); if (o.lab) this.tag(x, y, o.lab, o.at || 'r', r + 4); return this; };
    F.otimes = function (x, y, r = 6, o = {}) {
      this.circle(x, y, r, { cls: 'bgfill' + (o.cls ? ' ' + o.cls : '') });
      const k = r * 0.55;
      this.add(`<path class="glyph" d="M${x - k},${y - k}L${x + k},${y + k}M${x + k},${y - k}L${x - k},${y + k}"/>`);
      if (o.lab) this.tag(x, y, o.lab, o.at || 'r', r + 4);
      return this;
    };
    // a uniform field normal to the page: small dots (out) or crosses (into), no circles, as the lecture slides draw it
    F.marks = function (kind, x0, y0, x1, y1, nx, ny, o = {}) {
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const x = x0 + (x1 - x0) * (nx === 1 ? 0.5 : i / (nx - 1)), y = y0 + (y1 - y0) * (ny === 1 ? 0.5 : j / (ny - 1));
        if (kind === 'dot') this.dot(x, y, o.r || 2, { cls: 'dimfill' });
        else { const k = o.r ? o.r : 3; this.add(`<path class="dim thin nodecl" d="M${x - k},${y - k}L${x + k},${y + k}M${x + k},${y - k}L${x - k},${y + k}"/>`); this.track(x - k, y - k, x + k, y + k); }
      }
      return this;
    };
    // closed rectangular path; dir is the circulation as seen on screen
    F.loopRect = function (x, y, w, h, o = {}) {
      const P = [[x, y + h], [x + w, y + h], [x + w, y], [x, y]];      // bottom-left, bottom-right, top-right, top-left
      const pts = o.dir === 'cw' ? [P[0], P[3], P[2], P[1]] : P;
      for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[(i + 1) % 4]; this.line(a[0], a[1], b[0], b[1], { cls: o.cls || 'thick', mid: o.arrows !== false, hs: 8 }); }
      if (o.lab) this.label(o.labAt ? o.labAt[0] : x + w + 8, o.labAt ? o.labAt[1] : y + h + 4, o.lab, 'l');
      return this;
    };
    F.loopCirc = function (cx, cy, r, o = {}) {
      this.circle(cx, cy, r, { cls: o.cls || 'thick' });
      const s = o.dir === 'cw' ? -1 : 1;
      for (const a of [90, 270]) {                       // arrowheads at the top and bottom, along the circulation
        const t = a * Math.PI / 180, x = cx + r * Math.cos(t), y = cy - r * Math.sin(t);
        this.head(x, y, -s * Math.sin(t), -s * Math.cos(t), { hs: 8 });   // screen tangent of a ccw (s = 1) circle
      }
      if (o.lab) this.tag(cx + r * 0.72, cy + r * 0.72, o.lab, 'br', 6);
      return this;
    };
    // a current sheet edge-on: a thick dashed line
    F.sheet = function (x, y1, y2, o = {}) {
      this.line(x, y1, x, y2, { cls: 'thick dash' });
      if (o.lab) this.label(x, y1 - 6, o.lab, 'b', 'small');
      return this;
    };
    // a solenoid from the side: n turns as narrow ellipses between x and x + w, height h centered on y
    F.coil = function (x, y, w, h, n = 8, o = {}) {
      for (let i = 0; i < n; i++) {
        const cx = x + (i + 0.5) * w / n;
        this.ellipse(cx, y, Math.max(3, w / n * 0.35), h / 2, { half: 'back', cls: 'dim' });
        this.ellipse(cx, y, Math.max(3, w / n * 0.35), h / 2, { half: 'front', cls: o.cls || '' });
      }
      this.line(x, y - h / 2, x + w, y - h / 2, { cls: 'dim thin' });
      this.line(x, y + h / 2, x + w, y + h / 2, { cls: 'dim thin' });
      return this;
    };
  }
})();

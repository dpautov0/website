/* pfig.js — small SVG drawing kit for electrostatics figures.
   Units are screen pixels, y grows DOWN. Labels are TeX (typeset by KaTeX with the rest of the page).
   Every figure gets the "schem" class so declutter.js nudges labels off lines and off each other.

   const f = PF.fig();                 // new drawing
   f.line(x1,y1,x2,y2,{arrow:'end'|'start'|'both', cls:'dim dash thick'})
   f.pl([[x,y],...], o)  f.poly([[x,y],...], o)  f.rect(x,y,w,h,o)  f.circle(cx,cy,r,o)  f.ellipse(cx,cy,rx,ry,o)
   f.arc(cx,cy,r,a0,a1,o)              // degrees, counter-clockwise on screen (0 = +x, 90 = up)
   f.arrow(x1,y1,x2,y2,o)  f.dot(x,y)  f.label(x,y,'TeX',anchor,cls)  f.text(x,y,'plain words',anchor,cls)
   f.charge(x,y,{q:'+'|'-'|'', lab:'+q', at:'r'|'l'|'t'|'b'|'tr'|'tl'|'br'|'bl', image:true, r:7})
   f.plane(x1,x2,y,{side:'below'|'above', lab:'V=0'})   // grounded conducting plane, hatched
   f.wall(x,y1,y2,{side:'left'|'right', lab})            // vertical conducting wall, hatched
   f.ground(x,y)  f.dim(x1,y1,x2,y2,'d',{off:12})  f.angle(cx,cy,r,a0,a1,'\\theta')
   f.axes(ox,oy,{x:[-l,l],y:[-l,l],xl:'x',yl:'z'})      // 2-D axes through (ox,oy)
   f.p3(x,y,z)  f.axes3(L,{labels})  f.box3(a,b,c,o)       // oblique 3-D (x toward viewer, y right, z up)
   f.sphere(cx,cy,r,o)  f.field(fn,[x0,y0,x1,y1],nx,ny,o)
   f.svg()  -> string (viewBox fitted to what was drawn)
   PF.plot({...}) -> function plots.   PF.row([{svg,cap}]) -> side-by-side figures. */
(function () {
  'use strict';
  const r2 = (v) => Math.round(v * 10) / 10;
  const DEG = Math.PI / 180;
  const MADE = [];          // every figure whose svg() was produced (for the overlap audit)

  // rough on-screen size of a TeX label (only used to fit the view box)
  function texSize(t) {
    const s = String(t);
    const lines = s.split(/\\\\|<br\/?>/);
    const w = Math.max(...lines.map((l) => l
      .replace(/<[^>]+>/g, '')
      .replace(/\\(dfrac|tfrac|frac)\{([^{}]*)\}\{([^{}]*)\}/g, (m, f, a, b) => (a.length > b.length ? a : b))
      .replace(/\\(text|mathrm|mathbf|boldsymbol|hat|vec|bar|operatorname)(?![a-zA-Z])/g, '')
      // placeholders are not letters, so a following command can't swallow them (\to\infty used to count as 1)
      .replace(/\\(sinh|cosh|sin|cos|tan|ln|exp|infty)(?![a-zA-Z])/g, '###')
      .replace(/\\[a-zA-Z]+/g, '#').replace(/\\[,;!]/g, ' ').replace(/[${}_^\\]/g, '').length)) * 8 + 8;
    const tall = /\\dfrac|\\frac/.test(s) ? 34 : 18;
    return { w, h: lines.length * tall };
  }

  function wrapTex(t) {
    if (t === undefined || t === null || t === '') return '';
    const s = String(t);
    if (s.startsWith('<') || s.includes('$')) return s;
    return `$${s}$`;
  }

  class Fig {
    constructor(o = {}) {
      this.o = o;
      this.out = [];
      this.ext = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      this.proj = Object.assign({ ox: 0, oy: 0, s: 1, kx: 0.42, ang: 215 }, o.proj || {});
      this.labs = []; this.segs = []; this.dots = [];      // kept for the overlap audit
    }
    track(x0, y0, x1 = x0, y1 = y0) {
      const e = this.ext;
      e.x0 = Math.min(e.x0, x0, x1); e.x1 = Math.max(e.x1, x0, x1);
      e.y0 = Math.min(e.y0, y0, y1); e.y1 = Math.max(e.y1, y0, y1);
    }
    add(s) { this.out.push(s); return this; }
    cls(o) { return (o && o.cls) ? ` class="${o.cls}"` : ''; }

    // ---------------------------------------------------------------- primitives
    pl(pts, o = {}) {
      if (pts.length < 2) return this;
      pts.forEach((p) => this.track(p[0], p[1]));
      if (!(o.cls && /nodecl|grid/.test(o.cls))) {
        for (let i = 1; i < pts.length; i++) this.segs.push([pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]]);
        if (o.close) this.segs.push([pts[pts.length - 1][0], pts[pts.length - 1][1], pts[0][0], pts[0][1]]);
      }
      this.add(`<path${this.cls(o)} d="M${pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join('L')}${o.close ? 'Z' : ''}"/>`);
      if (o.arrow === 'end' || o.arrow === 'both') { const a = pts[pts.length - 2], b = pts[pts.length - 1]; this.head(b[0], b[1], b[0] - a[0], b[1] - a[1], o); }
      if (o.arrow === 'start' || o.arrow === 'both') { const a = pts[1], b = pts[0]; this.head(b[0], b[1], b[0] - a[0], b[1] - a[1], o); }
      if (o.mid) { const a = pts[0], b = pts[pts.length - 1]; this.head((a[0] + b[0]) / 2 + (b[0] - a[0]) * 0.06, (a[1] + b[1]) / 2 + (b[1] - a[1]) * 0.06, b[0] - a[0], b[1] - a[1], o); }
      return this;
    }
    line(x1, y1, x2, y2, o = {}) { return this.pl([[x1, y1], [x2, y2]], o); }
    poly(pts, o = {}) { return this.pl(pts, Object.assign({}, o, { close: true })); }
    rect(x, y, w, h, o = {}) { return this.poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], o); }
    // circles and arcs are drawn as fine polygons so declutter sees their real outline
    arcPts(cx, cy, rx, ry, a0, a1, n) {
      const pts = [];
      const N = n || Math.max(12, Math.ceil(Math.abs(a1 - a0) / 6));
      for (let i = 0; i <= N; i++) { const a = (a0 + (a1 - a0) * i / N) * DEG; pts.push([cx + rx * Math.cos(a), cy - ry * Math.sin(a)]); }
      return pts;
    }
    circle(cx, cy, r, o = {}) { return this.poly(this.arcPts(cx, cy, r, r, 0, 360).slice(0, -1), o); }
    ellipse(cx, cy, rx, ry, o = {}) {
      if (o.half === 'front') return this.pl(this.arcPts(cx, cy, rx, ry, 180, 360), o);
      if (o.half === 'back') return this.pl(this.arcPts(cx, cy, rx, ry, 0, 180), o);
      return this.poly(this.arcPts(cx, cy, rx, ry, 0, 360).slice(0, -1), o);
    }
    arc(cx, cy, r, a0, a1, o = {}) { return this.pl(this.arcPts(cx, cy, r, r, a0, a1), o); }
    head(x, y, dx, dy, o = {}) {
      const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, s = o.hs || 7, px = -uy, py = ux;
      this.add(`<path class="fill${o.cls && /dim/.test(o.cls) ? ' dimfill' : ''}" d="M${r2(x)},${r2(y)}L${r2(x - ux * s + px * s * 0.42)},${r2(y - uy * s + py * s * 0.42)}L${r2(x - ux * s - px * s * 0.42)},${r2(y - uy * s - py * s * 0.42)}Z"/>`);
      this.track(x - 6, y - 6, x + 6, y + 6);
      return this;
    }
    arrow(x1, y1, x2, y2, o = {}) { return this.line(x1, y1, x2, y2, Object.assign({ arrow: 'end' }, o)); }
    dot(x, y, r = 2.6, o = {}) {
      this.track(x - r, y - r, x + r, y + r);
      this.dots.push([x, y, r]);
      return this.add(`<path class="fill${o.cls ? ' ' + o.cls : ''}" d="M${r2(x - r)},${r2(y)}${[...Array(16)].map((_, i) => `L${r2(x + r * Math.cos((i + 1) * Math.PI / 8 + Math.PI))},${r2(y + r * Math.sin((i + 1) * Math.PI / 8 + Math.PI))}`).join('')}Z"/>`);
    }

    // ---------------------------------------------------------------- labels
    label(x, y, t, anchor = 'c', cls = '') {
      if (t === undefined || t === null || t === '') return this;
      const html = wrapTex(t);
      const sz = texSize(t);
      const bx = /l/.test(anchor) && anchor !== 'c' ? x : /r/.test(anchor) ? x - sz.w : x - sz.w / 2;
      const by = /t/.test(anchor) ? y : /b/.test(anchor) ? y - sz.h : y - sz.h / 2;
      this.track(bx, by, bx + sz.w, by + sz.h);
      this.labs.push({ x0: bx, y0: by, x1: bx + sz.w, y1: by + sz.h, t: String(t).replace(/<[^>]+>/g, '').slice(0, 40) });
      const W = Math.max(220, Math.ceil(sz.w * 1.5) + 40), H = Math.max(64, sz.h + 30);   // room for long notes
      let fx = x - W / 2, fy = y - H / 2, jc = 'center', ai = 'center', ta = 'center';
      if (/l/.test(anchor)) { fx = x; jc = 'flex-start'; ta = 'left'; }
      if (/r/.test(anchor)) { fx = x - W; jc = 'flex-end'; ta = 'right'; }
      if (/t/.test(anchor)) { fy = y; ai = 'flex-start'; }
      if (/b/.test(anchor)) { fy = y - H; ai = 'flex-end'; }
      return this.add(`<foreignObject x="${r2(fx)}" y="${r2(fy)}" width="${W}" height="${H}" class="lbl ${cls}"><div xmlns="http://www.w3.org/1999/xhtml" style="justify-content:${jc};align-items:${ai}"><span style="text-align:${ta}">${html}</span></div></foreignObject>`);
    }
    // anchor relative to a point, with a gap: at = 'r','l','t','b','tr','tl','br','bl'
    tag(x, y, t, at = 'r', gap = 9, cls = '') {
      const m = { r: [gap, 0, 'l'], l: [-gap, 0, 'r'], t: [0, -gap, 'b'], b: [0, gap, 't'], tr: [gap * 0.8, -gap * 0.8, 'bl'], tl: [-gap * 0.8, -gap * 0.8, 'br'], br: [gap * 0.8, gap * 0.8, 'tl'], bl: [-gap * 0.8, gap * 0.8, 'tr'] }[at] || [gap, 0, 'l'];
      return this.label(x + m[0], y + m[1], t, m[2], cls);
    }
    text(x, y, words, anchor = 'c', cls = '') { return this.label(x, y, `<span class="ptxt">${words}</span>`, anchor, cls); }

    // ---------------------------------------------------------------- physics symbols
    charge(x, y, o = {}) {
      const r = o.r || 7;
      if (o.image) this.circle(x, y, r, { cls: 'dash bgfill' });
      else this.circle(x, y, r, { cls: o.q === '-' ? 'bgfill' : 'bgfill' });
      if (o.q === '+') this.add(`<path class="glyph" d="M${x - r * 0.55},${y}H${x + r * 0.55}M${x},${y - r * 0.55}V${y + r * 0.55}"/>`);
      if (o.q === '-') this.add(`<path class="glyph" d="M${x - r * 0.55},${y}H${x + r * 0.55}"/>`);
      if (!o.q) this.dot(x, y, r * 0.45);
      if (o.lab) this.tag(x, y, o.lab, o.at || 'r', r + 5, o.image ? 'accent' : '');
      return this;
    }
    hatchBand(pts, o = {}) {           // closed region filled with conductor hatching
      pts.forEach((p) => this.track(p[0], p[1]));
      (this.hatches = this.hatches || []).push(pts);
      return this.add(`<path class="hatch nodecl${o.cls ? ' ' + o.cls : ''}" d="M${pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join('L')}Z"/>`);
    }
    plane(x1, x2, y, o = {}) {
      const t = o.t || 10, s = o.side === 'above' ? -1 : 1;
      this.hatchBand([[x1, y], [x2, y], [x2, y + s * t], [x1, y + s * t]]);
      this.line(x1, y, x2, y, { cls: 'thick' + (o.cls ? ' ' + o.cls : '') });
      if (o.lab) this.label(o.labx ?? x2 - 4, y + s * (t + 4), o.lab, s > 0 ? 'tr' : 'br', 'small');
      return this;
    }
    wall(x, y1, y2, o = {}) {
      const t = o.t || 10, s = o.side === 'right' ? 1 : -1;
      this.hatchBand([[x, y1], [x, y2], [x + s * t, y2], [x + s * t, y1]]);
      this.line(x, y1, x, y2, { cls: 'thick' + (o.cls ? ' ' + o.cls : '') });
      if (o.lab) this.label(x + s * (t + 5), o.laby ?? (y1 + y2) / 2, o.lab, s > 0 ? 'l' : 'r', 'small');
      return this;
    }
    ground(x, y, o = {}) {
      this.line(x, y, x, y + 8);
      this.line(x - 9, y + 8, x + 9, y + 8); this.line(x - 6, y + 11.5, x + 6, y + 11.5); this.line(x - 3, y + 15, x + 3, y + 15);
      return this;
    }
    dim(x1, y1, x2, y2, t, o = {}) {
      const off = o.off ?? 0, L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / L * off, ny = (x2 - x1) / L * off;
      const a = [x1 + nx, y1 + ny], b = [x2 + nx, y2 + ny];
      if (off) { this.line(x1, y1, a[0], a[1], { cls: 'dim thin' }); this.line(x2, y2, b[0], b[1], { cls: 'dim thin' }); }
      this.line(a[0], a[1], b[0], b[1], { cls: 'dim', arrow: 'both', hs: 6 });
      if (t) {
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
        const side = o.at || (Math.abs(x2 - x1) > Math.abs(y2 - y1) ? 't' : 'r');
        this.tag(mx, my, t, side, 6, 'small');
      }
      return this;
    }
    angle(cx, cy, r, a0, a1, t, o = {}) {
      this.arc(cx, cy, r, a0, a1, { cls: 'dim' });
      if (t) { const am = (a0 + a1) / 2 * DEG; this.label(cx + (r + 9) * Math.cos(am), cy - (r + 9) * Math.sin(am), t, 'c', 'small'); }
      return this;
    }
    axes(ox, oy, o = {}) {
      const x = o.x || [-60, 60], y = o.y || [-60, 60];
      this.line(ox + x[0], oy, ox + x[1], oy, { cls: 'dim', arrow: 'end', hs: 6 });
      this.line(ox, oy - y[0], ox, oy - y[1], { cls: 'dim', arrow: 'end', hs: 6 });
      if (o.xl !== '') this.label(ox + x[1] + 4, oy + 2, o.xl || 'x', 'l', 'small accent');
      if (o.yl !== '') this.label(ox + 3, oy - y[1] - 3, o.yl || 'y', 'bl', 'small accent');
      return this;
    }

    // ---------------------------------------------------------------- oblique 3-D
    setProj(ox, oy, s = 1, kx = 0.42, ang = 215) { this.proj = { ox, oy, s, kx, ang }; return this; }
    p3(x, y, z) {
      const P = this.proj, a = P.ang * DEG;
      return [P.ox + P.s * (y + P.kx * x * Math.cos(a)), P.oy - P.s * (z + P.kx * x * Math.sin(a))];
    }
    l3(a, b, o = {}) { const p = this.p3(...a), q = this.p3(...b); return this.line(p[0], p[1], q[0], q[1], o); }
    axes3(L = 80, o = {}) {
      const lab = o.labels || ['x', 'y', 'z'];
      const Lx = o.Lx ?? L, Ly = o.Ly ?? L, Lz = o.Lz ?? L;
      const O = this.p3(0, 0, 0), X = this.p3(Lx, 0, 0), Y = this.p3(0, Ly, 0), Z = this.p3(0, 0, Lz);
      // o.box = [a,b,c]: the stretch inside a box is drawn dashed, the rest solid
      const bx = o.box || [0, 0, 0];
      const ax = (P, Q, frac, k) => {
        if (frac > 0 && frac < 1) { const M = [P[0] + (Q[0] - P[0]) * frac, P[1] + (Q[1] - P[1]) * frac]; this.line(P[0], P[1], M[0], M[1], { cls: 'dim dash thin' }); this.arrow(M[0], M[1], Q[0], Q[1], { cls: 'dim', hs: 6 }); }
        else this.arrow(P[0], P[1], Q[0], Q[1], { cls: 'dim', hs: 6 });
      };
      ax(O, X, bx[0] / Lx); this.label(X[0] - 4, X[1] + 4, lab[0], 'tr', 'small accent');
      ax(O, Y, bx[1] / Ly); this.label(Y[0] + 5, Y[1], lab[1], 'l', 'small accent');
      ax(O, Z, bx[2] / Lz); this.label(Z[0] + 4, Z[1] - 2, lab[2], 'bl', 'small accent');
      return this;
    }
    // box 0..a (x) by 0..b (y) by 0..c (z); hidden edges dashed; o.top / o.faces: 'shade' a face
    box3(a, b, c, o = {}) {
      const V = (x, y, z) => [x, y, z];
      const hid = { cls: 'dash dim' };
      if (o.shadeTop) this.add(`<path class="shade nodecl" d="M${[V(0, 0, c), V(a, 0, c), V(a, b, c), V(0, b, c)].map((p) => this.p3(...p).map(r2).join(',')).join('L')}Z"/>`);
      // hidden edges (those touching the back-left-bottom corner (0,0,0))
      this.l3(V(0, 0, 0), V(a, 0, 0), hid); this.l3(V(0, 0, 0), V(0, b, 0), hid); this.l3(V(0, 0, 0), V(0, 0, c), hid);
      // visible edges
      const E = [[V(a, 0, 0), V(a, b, 0)], [V(0, b, 0), V(a, b, 0)], [V(a, 0, 0), V(a, 0, c)], [V(a, b, 0), V(a, b, c)], [V(0, b, 0), V(0, b, c)],
        [V(0, 0, c), V(a, 0, c)], [V(0, 0, c), V(0, b, c)], [V(a, 0, c), V(a, b, c)], [V(0, b, c), V(a, b, c)]];
      for (const [p, q] of E) this.l3(p, q, o.edge || {});
      return this;
    }
    sphere(cx, cy, r, o = {}) {
      this.circle(cx, cy, r, { cls: o.cls || '' });
      if (o.equator !== false) {
        this.ellipse(cx, cy, r, r * 0.28, { half: 'back', cls: 'dash dim' });
        this.ellipse(cx, cy, r, r * 0.28, { half: 'front', cls: 'dim' });
      }
      return this;
    }
    // field arrows: fn(x,y) -> [Ex,Ey] in screen axes (y down); o.len max arrow length; o.mag scales by |E|
    field(fn, box, nx, ny, o = {}) {
      const [x0, y0, x1, y1] = box, len = o.len || 14;
      const pts = [];
      let mmax = 0;
      for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
        const x = x0 + (x1 - x0) * (nx === 1 ? 0.5 : i / (nx - 1)), y = y0 + (y1 - y0) * (ny === 1 ? 0.5 : j / (ny - 1));
        const v = fn(x, y);
        if (!v) continue;
        const m = Math.hypot(v[0], v[1]);
        if (!isFinite(m)) continue;
        pts.push([x, y, v[0], v[1], m]); mmax = Math.max(mmax, m);
      }
      for (const [x, y, vx, vy, m] of pts) {
        if (m < 1e-12) { this.dot(x, y, 1.4, { cls: 'dimfill' }); continue; }
        const L = o.mag ? len * Math.min(1, Math.max(0.25, Math.sqrt(m / mmax))) : len;
        const ux = vx / m, uy = vy / m;
        this.line(x - ux * L / 2, y - uy * L / 2, x + ux * L / 2, y + uy * L / 2, { cls: o.cls || '', arrow: 'end', hs: 5 });
      }
      return this;
    }

    // ---------------------------------------------------------------- output
    svg(o = {}) {
      const pad = this.o.pad ?? 10;
      const e = this.ext;
      if (!isFinite(e.x0)) return '<svg></svg>';
      const x = Math.floor(e.x0 - pad), y = Math.floor(e.y0 - pad), w = Math.ceil(e.x1 - e.x0 + 2 * pad), h = Math.ceil(e.y1 - e.y0 + 2 * pad);
      const sc = this.o.scale || 1;
      if (!this.registered) { this.registered = true; MADE.push(this); }
      return `<svg class="schem pfig${this.o.cls ? ' ' + this.o.cls : ''}" viewBox="${x} ${y} ${w} ${h}" width="${Math.round(w * sc)}" role="img"${this.o.alt ? ` aria-label="${this.o.alt}"` : ''}>${this.out.join('')}</svg>`;
    }
    toString() { return this.svg(); }

    // Overlap audit (estimated label sizes): labels on labels, labels crossing lines, labels covering dots.
    audit() {
      const issues = [];
      const tight = (L) => ({ x0: L.x0 + 4, y0: L.y0 + 3, x1: L.x1 - 4, y1: L.y1 - 3, t: L.t });
      const T = this.labs.map(tight);
      for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
        const a = T[i], b = T[j];
        const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (w > 1 && h > 1) issues.push(`labels "${a.t}" and "${b.t}" overlap`);
      }
      const hitsBox = (s, B) => {          // Liang–Barsky: does segment s cross box B?
        let [x1, y1, x2, y2] = s, t0 = 0, t1 = 1;
        const dx = x2 - x1, dy = y2 - y1;
        const P = [-dx, dx, -dy, dy], Qv = [x1 - B.x0, B.x1 - x1, y1 - B.y0, B.y1 - y1];
        for (let k = 0; k < 4; k++) {
          if (Math.abs(P[k]) < 1e-12) { if (Qv[k] < 0) return false; continue; }
          const r = Qv[k] / P[k];
          if (P[k] < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
        }
        return t1 - t0 > 1e-9;
      };
      for (const B of T) {
        const n = this.segs.filter((s) => hitsBox(s, B)).length;
        if (n) issues.push(`label "${B.t}" crosses ${n} line segment${n > 1 ? 's' : ''}`);
        const d = this.dots.filter(([x, y, r]) => x + r > B.x0 && x - r < B.x1 && y + r > B.y0 && y - r < B.y1).length;
        if (d) issues.push(`label "${B.t}" covers a dot`);
        // label sitting on a hatched conductor (hard to read): sample the box
        if (this.hatches && this.hatches.length) {
          const inside = (px, py, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c; } return c; };
          let n = 0, tot = 0;
          for (let a = 0; a < 5; a++) for (let b = 0; b < 3; b++) { tot++; const px = B.x0 + (B.x1 - B.x0) * (a + 0.5) / 5, py = B.y0 + (B.y1 - B.y0) * (b + 0.5) / 3; if (this.hatches.some((h) => inside(px, py, h))) n++; }
          if (n >= 4) issues.push(`label "${B.t}" sits on a hatched conductor`);
        }
      }
      return issues;
    }
  }

  // ---------------------------------------------------------------- function plots
  // plot({w,h, x:[a,b], y:[c,d], xl, yl, xt:[[v,'tex'],...]|[v,...], yt, curves:[{f|pts, cls:'dash|dim|thin', lab, labAt}],
  //       vlines:[[x,'tex']], hlines:[[y,'tex']], pts:[{x,y,lab}], zero:true})
  function plot(o) {
    const W = o.w || 380, H = o.h || 230, ml = o.ml ?? 44, mr = o.mr ?? 22, mt = o.mt ?? 18, mb = o.mb ?? 34;
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const X = (x) => ml + (x - x0) / (x1 - x0) * (W - ml - mr);
    const Y = (y) => H - mb - (y - y0) / (y1 - y0) * (H - mt - mb);
    const f = new Fig({ pad: 4 });
    const tick = (v) => (Array.isArray(v) ? v : [v, String(v)]);
    for (const t of (o.xt || [])) { const [v, s] = tick(t); f.line(X(v), Y(y0), X(v), Y(y1), { cls: 'grid nodecl' }); f.label(X(v), Y(y0) + 5, s, 't', 'small accent'); }
    for (const t of (o.yt || [])) { const [v, s] = tick(t); f.line(X(x0), Y(v), X(x1), Y(v), { cls: 'grid nodecl' }); f.label(X(x0) - 6, Y(v), s, 'r', 'small accent'); }
    const ya = (o.zero && y0 < 0 && y1 > 0) ? 0 : y0;
    f.line(X(x0), Y(ya), X(x1), Y(ya), { cls: 'axisl', arrow: 'end', hs: 6 });
    f.line(X(x0), Y(y0), X(x0), Y(y1), { cls: 'axisl', arrow: 'end', hs: 6 });
    for (const [v, s] of (o.vlines || [])) { f.line(X(v), Y(y0), X(v), Y(y1), { cls: 'dash dim' }); if (s) f.label(X(v) + 4, Y(y1) + 2, s, 'tl', 'small accent'); }
    for (const [v, s] of (o.hlines || [])) { f.line(X(x0), Y(v), X(x1), Y(v), { cls: 'dash dim' }); if (s) f.label(X(x1) - 2, Y(v) - 3, s, 'br', 'small accent'); }
    for (const c of (o.curves || [])) {
      let pts = c.pts;
      if (c.f) {
        pts = [];
        const a = c.from ?? x0, b = c.to ?? x1, N = c.n || 240;
        for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; const y = c.f(x); if (isFinite(y)) pts.push([x, y]); }
      }
      // clip to the window (split where the curve leaves it)
      let seg = [];
      const flush = () => { if (seg.length > 1) f.pl(seg.map((p) => [X(p[0]), Y(p[1])]), { cls: 'curve ' + (c.cls || '') }); seg = []; };
      for (const p of pts) { if (p[1] < y0 - 1e-9 || p[1] > y1 + 1e-9) flush(); else seg.push(p); }
      flush();
      if (c.lab) {
        const at = c.labAt ?? (c.to ?? x1);
        const yv = c.f ? c.f(at) : pts[pts.length - 1][1];
        f.label(X(at) + (c.dx ?? 4), Y(Math.min(Math.max(yv, y0), y1)) + (c.dy ?? -8), c.lab, c.anchor || 'l', 'small');
      }
    }
    for (const p of (o.pts || [])) { f.dot(X(p.x), Y(p.y), 3.2); if (p.lab) f.label(X(p.x) + 6, Y(p.y) - 6, p.lab, p.anchor || 'bl', 'small'); }
    if (o.xl) f.label(X(x1) + 10, Y(ya), o.xl, 'l', 'small');     // just past the arrow tip, clear of the tick numbers
    if (o.yl) f.label(X(x0) + 6, Y(y1) - 2, o.yl, 'bl', 'small');
    // fixed frame so all plots line up
    f.track(0, 0, W, H);
    return f.svg().replace('class="schem pfig', 'class="schem pfig pplot');
  }

  const row = (items) => ({ svg: `<div class="figrow">${items.map((it) => `<div>${it.svg || it}${it.cap ? `<figcaption>${it.cap}</figcaption>` : ''}</div>`).join('')}</div>` });

  window.PF = { fig: (o) => new Fig(o), Fig, plot, row, texSize, made: MADE };
})();

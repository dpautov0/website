/* schem.js — draws schematics from a compact grid description and extracts
   the netlist for the solver, so a figure and its answer can never disagree.

   A circuit is an array of entries. Points are [x, y] in grid units.
     ['w', p1, p2, ...]                 wire through the points
     ['R', p1, p2, {n, v, s, side}]     two-terminal parts: R, V, I, E, G, D, Vac, Iac
                                        n = name (TeX), s = shown value (TeX), v = value (SI)
                                        V/E: p1 is the + terminal.  I/G: arrow points p1 -> p2.
                                        D: p1 = anode.  E/G: {g: gain, c: [ctrl+, ctrl-]}
     ['gnd', p]                         ground
     ['rail', p, {n, v}]                supply bar (acts as a source to ground)
     ['term', p, {n, name, side}]       open terminal
     ['node', p, {n, name, side, dot}]  names a node (name used by answers)
     ['dot', p]                         junction dot (drawn automatically at T-junctions)
     ['vlab', p1, p2, {n, side}]        + at p1, - at p2, label beside
     ['iarr', p, dir, {n, side}]        current arrow, dir in 'l' 'r' 'u' 'd'
     ['nmos'|'pmos', p, {n, sz, flip, dc}]  transistor centred at p. NMOS: D above, S below.
                                        PMOS: S above, D below. Gate 1 unit left (right if flip).
                                        dc: true draws the gate-drain (diode) connection.
     ['box', p1, p2, {n}]               labelled black box
     ['txt', p, 'TeX', {a}]             free text; a = anchor l r c t b */
(function () {
  'use strict';

  const G = 64;       // pixels per grid unit
  const PAD = 30;
  const TWO = new Set(['R', 'V', 'I', 'E', 'G', 'D', 'Vac', 'Iac', 'X']);
  const k = (p) => `${Math.round(p[0] * 1000)},${Math.round(p[1] * 1000)}`;

  function parseEntry(e) {
    const [type, ...rest] = e;
    const pts = [], strs = [];
    let opts = {};
    for (const r of rest) {
      if (Array.isArray(r)) pts.push(r);
      else if (typeof r === 'string') strs.push(r);
      else if (r && typeof r === 'object') opts = r;
    }
    return { type, pts, strs, opts };
  }

  function mosPins(el) {
    const [x, y] = el.pts[0];
    const gx = el.opts.flip ? x + 1 : x - 1;
    if (el.type === 'nmos') return { D: [x, y - 1], S: [x, y + 1], G: [gx, y] };
    return { S: [x, y - 1], D: [x, y + 1], G: [gx, y] };
  }

  // ---------------------------------------------------------------- netlist
  class UF {
    constructor() { this.p = new Map(); }
    find(a) {
      if (!this.p.has(a)) this.p.set(a, a);
      let r = a;
      while (this.p.get(r) !== r) r = this.p.get(r);
      let c = a;
      while (this.p.get(c) !== r) { const n = this.p.get(c); this.p.set(c, r); c = n; }
      return r;
    }
    union(a, b) { const ra = this.find(a), rb = this.find(b); if (ra !== rb) this.p.set(ra, rb); }
  }

  function onInterior(p, a, b) {
    const eps = 1e-6;
    if (Math.abs(a[0] - b[0]) < eps && Math.abs(p[0] - a[0]) < eps) {
      const lo = Math.min(a[1], b[1]), hi = Math.max(a[1], b[1]);
      return p[1] > lo + eps && p[1] < hi - eps;
    }
    if (Math.abs(a[1] - b[1]) < eps && Math.abs(p[1] - a[1]) < eps) {
      const lo = Math.min(a[0], b[0]), hi = Math.max(a[0], b[0]);
      return p[0] > lo + eps && p[0] < hi - eps;
    }
    return false;
  }

  function topology(spec) {
    const els = spec.map(parseEntry);
    const uf = new UF();
    const pins = [];
    const segs = [];
    for (const el of els) {
      const t = el.type;
      if (t === 'w') {
        for (let i = 0; i < el.pts.length; i++) {
          pins.push(el.pts[i]);
          if (i) { segs.push([el.pts[i - 1], el.pts[i]]); uf.union(k(el.pts[i - 1]), k(el.pts[i])); }
        }
      } else if (TWO.has(t)) {
        pins.push(el.pts[0], el.pts[1]);
      } else if (t === 'gnd') {
        pins.push(el.pts[0]); uf.union(k(el.pts[0]), 'GND');
      } else if (t === 'rail' || t === 'term' || t === 'node' || t === 'dot') {
        pins.push(el.pts[0]);
      } else if (t === 'nmos' || t === 'pmos') {
        const P = mosPins(el);
        pins.push(P.D, P.G, P.S);
        if (el.opts.dc) {
          const corner = [P.G[0], P.D[1]];
          segs.push([P.G, corner], [corner, P.D]);
          pins.push(corner);
          uf.union(k(P.G), k(corner)); uf.union(k(corner), k(P.D));
        }
      }
    }
    for (const [a, b] of segs) for (const p of pins) if (onInterior(p, a, b)) uf.union(k(p), k(a));
    return { els, uf, pins, segs };
  }

  function netlist(spec) {
    const { els, uf } = topology(spec);
    const gnd = uf.find('GND');
    const ids = new Map();
    let n = 0;
    const id = (p) => {
      const r = uf.find(k(p));
      if (r === gnd) return '0';
      if (!ids.has(r)) ids.set(r, 'n' + (++n));
      return ids.get(r);
    };
    const names = {};
    for (const el of els) {
      if ((el.type === 'node' || el.type === 'term') && el.opts.name !== undefined) names[el.opts.name] = id(el.pts[0]);
    }
    const ref = (c) => (Array.isArray(c) ? id(c) : (c === '0' || c === 0 ? '0' : names[c]));
    const out = [];
    const devices = [];
    let linear = true;
    for (const el of els) {
      const t = el.type, o = el.opts;
      if (t === 'nmos' || t === 'pmos') {
        const P = mosPins(el);
        const dcG = o.dc ? id(P.D) : id(P.G);
        devices.push({ type: t, D: id(P.D), G: dcG, S: id(P.S), sz: o.sz, n: o.n, at: el.pts[0] });
      }
      if (t === 'D') devices.push({ type: 'D', A: id(el.pts[0]), K: id(el.pts[1]), at: el.pts[0] });
      if (t === 'R') out.push({ type: 'R', a: id(el.pts[0]), b: id(el.pts[1]), val: o.v, tag: o.id });
      else if (t === 'V' || t === 'Vac') out.push({ type: 'V', a: id(el.pts[0]), b: id(el.pts[1]), val: o.v ?? 0, tag: o.id });
      else if (t === 'I' || t === 'Iac') out.push({ type: 'I', a: id(el.pts[0]), b: id(el.pts[1]), val: o.v ?? 0, tag: o.id });
      else if (t === 'G' || t === 'E') {
        if (!o.c) { linear = false; continue; }
        out.push({ type: t, a: id(el.pts[0]), b: id(el.pts[1]), gain: o.g, ca: ref(o.c[0]), cb: ref(o.c[1]), tag: o.id });
      }
      else if (t === 'rail' && o.v !== undefined) out.push({ type: 'V', a: id(el.pts[0]), b: '0', val: o.v, tag: o.id });
      else if (t === 'D' || t === 'X' || t === 'nmos' || t === 'pmos') linear = false;
    }
    return { elements: out, names, id, linear, devices };
  }

  // Solve a drawn circuit. Returns helpers keyed by node names.
  function solve(spec) {
    const nl = netlist(spec);
    const s = MNA.mna(nl.elements);
    if (!s) return null;
    const v = (name) => (name === '0' ? 0 : s.v(nl.names[name]));
    const byTag = (tag) => nl.elements.find((e) => e.tag === tag);
    // Current through a tagged resistor from its first point to its second.
    const iR = (tag) => { const e = byTag(tag); return (s.v(e.a) - s.v(e.b)) / e.val; };
    const iV = (tag) => s.iv(byTag(tag));
    return { v, iR, iV, nl };
  }

  function thevenin(spec, p, n = '0') {
    const nl = netlist(spec);
    return MNA.thevenin(nl.elements, nl.names[p], n === '0' ? '0' : nl.names[n]);
  }

  // ---------------------------------------------------------------- drawing
  // Rough on-screen size of a label, so the drawing can grow to fit it.
  let EXT = null;
  function labelSize(html) {
    const lines = String(html).split(/<br\/?>/);
    const w = Math.max(...lines.map((l) => l.replace(/<[^>]+>/g, '').replace(/\\tfrac\d\d/g, 'x').replace(/\\(text|mathrm|tfrac|dfrac|frac)/g, '').replace(/\\[a-zA-Z]+/g, 'x').replace(/\\[,;!]/g, '').replace(/[${}_^\\]/g, '').length)) * 7.6 + 6;
    return { w, h: lines.length * 17 + 2 };
  }
  function track(x0, y0, x1, y1) {
    if (!EXT) return;
    EXT.minx = Math.min(EXT.minx, x0); EXT.maxx = Math.max(EXT.maxx, x1);
    EXT.miny = Math.min(EXT.miny, y0); EXT.maxy = Math.max(EXT.maxy, y1);
  }
  function label(x, y, html, anchor = 'c', cls = '') {
    if (!html) return '';
    const sz = labelSize(html);
    const bx = anchor === 'l' ? x : anchor === 'r' ? x - sz.w : x - sz.w / 2;
    const by = anchor === 't' ? y : anchor === 'b' ? y - sz.h : y - sz.h / 2;
    track(bx, by, bx + sz.w, by + sz.h);
    const w = 190, h = 56;
    let fx = x - w / 2, fy = y - h / 2, jc = 'center', ai = 'center', ta = 'center';
    if (anchor === 'l') { fx = x; jc = 'flex-start'; ta = 'left'; }
    if (anchor === 'r') { fx = x - w; jc = 'flex-end'; ta = 'right'; }
    if (anchor === 't') { fy = y; ai = 'flex-start'; }
    if (anchor === 'b') { fy = y - h; ai = 'flex-end'; }
    return `<foreignObject x="${fx}" y="${fy}" width="${w}" height="${h}" class="lbl ${cls}"><div xmlns="http://www.w3.org/1999/xhtml" style="justify-content:${jc};align-items:${ai}"><span style="text-align:${ta}">${html}</span></div></foreignObject>`;
  }

  const tex = (s) => (s ? `$${s}$` : '');
  const stack = (o) => [tex(o.n), tex(o.s)].filter(Boolean).join('<br/>');

  function plus(x, y) { return `<path class="glyph" d="M${x - 3.5},${y}H${x + 3.5}M${x},${y - 3.5}V${y + 3.5}"/>`; }
  function minus(x, y) { return `<path class="glyph" d="M${x - 3.5},${y}H${x + 3.5}"/>`; }
  function head(x, y, dx, dy, s = 6) {
    const px = -dy, py = dx;
    return `<path class="fill" d="M${x},${y}L${x - dx * s + px * s * 0.55},${y - dy * s + py * s * 0.55}L${x - dx * s - px * s * 0.55},${y - dy * s - py * s * 0.55}Z"/>`;
  }
  function tilde(x, y) { return `<path d="M${x - 8},${y}C${x - 5},${y - 7} ${x - 2},${y - 7} ${x},${y}S${x + 5},${y + 7} ${x + 8},${y}"/>`; }

  const BODY = {
    R: { h: 17, w: 7, draw() {
      let d = 'M-17,0';
      const n = 6, step = 34 / n;
      for (let i = 0; i < n; i++) d += `L${-17 + (i + 0.5) * step},${i % 2 ? 6 : -6}`;
      return `<path d="${d}L17,0"/>`;
    } },
    V: { h: 14, w: 14, draw() { return '<circle r="14"/>'; } },
    Vac: { h: 14, w: 14, draw() { return '<circle r="14"/>'; } },
    I: { h: 14, w: 14, draw() { return `<circle r="14"/><path d="M-8,0H5"/>${head(9, 0, 1, 0, 5)}`; } },
    Iac: { h: 14, w: 14, draw() { return '<circle r="14"/>'; } },
    E: { h: 15, w: 15, draw() { return '<path d="M-15,0L0,-15L15,0L0,15Z"/>'; } },
    G: { h: 15, w: 15, draw() { return `<path d="M-15,0L0,-15L15,0L0,15Z"/><path d="M-8,0H5"/>${head(9, 0, 1, 0, 5)}`; } },
    D: { h: 8, w: 9, draw() { return '<path class="fillbg" d="M-8,-8L8,0L-8,8Z"/><path d="M8,-8V8"/>'; } },
    X: { h: 16, w: 10, draw() { return '<rect class="fillbg" x="-16" y="-10" width="32" height="20" rx="2"/>'; } },
  };

  function drawTwo(el, X, Y) {
    const [p1, p2] = el.pts;
    const x1 = X(p1[0]), y1 = Y(p1[1]), x2 = X(p2[0]), y2 = Y(p2[1]);
    const L = Math.hypot(x2 - x1, y2 - y1);
    const ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    const b = BODY[el.type];
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    let s = `<g transform="translate(${cx},${cy}) rotate(${ang})"><path d="M${-L / 2},0H${-b.h}M${b.h},0H${L / 2}"/>${b.draw()}</g>`;
    if (el.type === 'V' || el.type === 'E') {
      s += plus(cx - ux * 6.5, cy - uy * 6.5) + minus(cx + ux * 6.5, cy + uy * 6.5);
    }
    if (el.type === 'Vac' || el.type === 'Iac') s += tilde(cx, cy);
    if (el.type === 'Iac') {
      const px = -uy, py = ux; // perpendicular (right of travel for vertical-down)
      const ox = cx - px * 22 * (el.opts.side === 'l' ? 1 : -1), oy = cy - py * 22 * (el.opts.side === 'l' ? 1 : -1);
      s += `<path d="M${ox - ux * 8},${oy - uy * 8}L${ox + ux * 5},${oy + uy * 5}"/>${head(ox + ux * 9, oy + uy * 9, ux, uy, 5)}`;
    }
    const horiz = Math.abs(uy) < 0.5;
    const side = el.opts.side;
    const txt = stack(el.opts);
    const off = b.w + (el.type === 'Iac' ? 20 : 5);
    if (horiz) {
      s += side === 'b' ? label(cx, cy + off, txt, 't') : label(cx, cy - off, txt, 'b');
    } else {
      s += side === 'l' ? label(cx - off, cy, txt, 'r') : label(cx + off, cy, txt, 'l');
    }
    return s;
  }

  function drawMos(el, X, Y) {
    const [x0, y0] = el.pts[0];
    const cx = X(x0), cy = Y(y0);
    const f = el.opts.flip ? -1 : 1;              // gate side: -1 = right
    const P = mosPins(el);
    const top = Y(y0 - 1), bot = Y(y0 + 1), gx = X(P.G[0]);
    const chx = cx - 12 * f, gpx = cx - 19 * f;
    let s = '';
    s += `<path d="M${gx},${cy}H${gpx}M${gpx},${cy - 13}V${cy + 13}"/>`;
    s += `<path class="thick" d="M${chx},${cy - 16}V${cy + 16}"/>`;
    s += `<path d="M${chx},${cy - 10}H${cx}V${top}M${chx},${cy + 10}H${cx}V${bot}"/>`;
    if (el.type === 'nmos') s += head(cx - 1 * f, cy + 10, f, 0, 6);          // arrow out of the source
    else s += head(chx + 1 * f, cy - 10, -f, 0, 6);                           // arrow into the source
    if (el.opts.dc) {
      const gxx = X(P.G[0]);
      s += `<path d="M${gxx},${cy}V${top}H${cx}"/>`;
    }
    const txt = [tex(el.opts.n), el.opts.sz ? tex(`\\mathrm{${el.opts.sz}}`) : ''].filter(Boolean).join('<br/>');
    s += f > 0 ? label(cx + 7, cy, txt, 'l', 'small') : label(cx - 7, cy, txt, 'r', 'small');
    return s;
  }

  function render(spec, opts = {}) {
    const { els, uf, pins, segs } = topology(spec);
    // bounds
    let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    const grow = (p) => { minx = Math.min(minx, p[0]); maxx = Math.max(maxx, p[0]); miny = Math.min(miny, p[1]); maxy = Math.max(maxy, p[1]); };
    for (const el of els) {
      el.pts.forEach(grow);
      if (el.type === 'nmos' || el.type === 'pmos') Object.values(mosPins(el)).forEach(grow);
    }
    const padL = 22 + (opts.padL || 0), padR = 22 + (opts.padR || 0), padT = 26 + (opts.padT || 0), padB = 26 + (opts.padB || 0);
    const X = (x) => (x - minx) * G + padL;
    const Y = (y) => (y - miny) * G + padT;
    const W = (maxx - minx) * G + padL + padR;
    const H = (maxy - miny) * G + padT + padB;
    EXT = { minx: 0, miny: 0, maxx: W, maxy: H };

    let body = '';
    const terms = new Set();
    for (const el of els) {
      const t = el.type, o = el.opts;
      if (t === 'w') {
        // o.hops: x-positions where this wire jumps over a crossing vertical line
        const hops = o.hops || [];
        let d = `M${X(el.pts[0][0])},${Y(el.pts[0][1])}`;
        for (let i = 1; i < el.pts.length; i++) {
          const a = el.pts[i - 1], b = el.pts[i];
          if (hops.length && Math.abs(a[1] - b[1]) < 1e-9) {
            const dir = Math.sign(b[0] - a[0]);
            const hs = hops.filter((h) => (h - a[0]) * dir > 0 && (b[0] - h) * dir > 0).sort((p, q) => (p - q) * dir);
            const y = Y(a[1]);
            for (const h of hs) d += `L${X(h) - 6 * dir},${y}A6,6 0 0 ${dir > 0 ? 1 : 0} ${X(h) + 6 * dir},${y}`;
          }
          d += `L${X(b[0])},${Y(b[1])}`;
        }
        body += `<path d="${d}"/>`;
      } else if (TWO.has(t)) {
        body += drawTwo(el, X, Y);
      } else if (t === 'gnd') {
        const x = X(el.pts[0][0]), y = Y(el.pts[0][1]);
        body += `<path d="M${x},${y}V${y + 10}M${x - 10},${y + 10}H${x + 10}M${x - 6.5},${y + 14}H${x + 6.5}M${x - 3},${y + 18}H${x + 3}"/>`;
      } else if (t === 'rail') {
        const x = X(el.pts[0][0]), y = Y(el.pts[0][1]);
        body += `<path d="M${x},${y}V${y - 10}"/><path class="thick" d="M${x - 14},${y - 10}H${x + 14}"/>`;
        body += label(x, y - 13, tex(o.n || (o.v !== undefined ? U.si(o.v, 'V') : '')), 'b');
      } else if (t === 'term') {
        const x = X(el.pts[0][0]), y = Y(el.pts[0][1]);
        terms.add(k(el.pts[0]));
        body += `<circle class="term" cx="${x}" cy="${y}" r="3.6"/>`;
        body += sideLabel(x, y, tex(o.n), o.side || 'r');
      } else if (t === 'node') {
        const x = X(el.pts[0][0]), y = Y(el.pts[0][1]);
        if (o.dot) body += `<circle class="fill" cx="${x}" cy="${y}" r="3.3"/>`;
        body += sideLabel(x, y, tex(o.n), o.side || 'a');
      } else if (t === 'dot') {
        body += `<circle class="fill" cx="${X(el.pts[0][0])}" cy="${Y(el.pts[0][1])}" r="3.3"/>`;
      } else if (t === 'vlab') {
        const [a, b] = el.pts;
        const xa = X(a[0]), ya = Y(a[1]), xb = X(b[0]), yb = Y(b[1]);
        body += plus(xa, ya) + minus(xb, yb);
        body += sideLabel((xa + xb) / 2, (ya + yb) / 2, tex(o.n), o.side || 'r', 4);
      } else if (t === 'iarr') {
        const x = X(el.pts[0][0]), y = Y(el.pts[0][1]);
        const d = { r: [1, 0], l: [-1, 0], u: [0, -1], d: [0, 1] }[el.strs[0] || 'r'];
        const ox = o.off ? o.off[0] : (d[0] ? 0 : 14), oy = o.off ? o.off[1] : (d[0] ? -12 : 0);
        body += `<g class="accent"><path d="M${x + ox - d[0] * 9},${y + oy - d[1] * 9}L${x + ox + d[0] * 4},${y + oy + d[1] * 4}"/>${head(x + ox + d[0] * 9, y + oy + d[1] * 9, d[0], d[1], 5)}</g>`;
        body += sideLabel(x + ox, y + oy, tex(o.n), o.side || (d[0] ? 'a' : 'r'), 8, 'accent');
      } else if (t === 'nmos' || t === 'pmos') {
        body += drawMos(el, X, Y);
      } else if (t === 'box') {
        const [a, b] = el.pts;
        const x = Math.min(X(a[0]), X(b[0])), y = Math.min(Y(a[1]), Y(b[1]));
        const w = Math.abs(X(b[0]) - X(a[0])), h = Math.abs(Y(b[1]) - Y(a[1]));
        body += `<rect class="fillbg" x="${x}" y="${y}" width="${w}" height="${h}"/>`;
        body += label(x + w / 2, y + h / 2, o.n ? `<span class="boxtxt">${o.n}</span>` : '', 'c');
      } else if (t === 'txt') {
        body += label(X(el.pts[0][0]), Y(el.pts[0][1]), el.strs[0], o.a || 'c', o.cls || '');
      }
    }

    // automatic junction dots: 3+ connections at a point
    const deg = new Map();
    const bump = (p, n = 1) => { const kk = k(p); deg.set(kk, (deg.get(kk) || 0) + n); };
    for (const el of els) {
      if (el.type === 'w') el.pts.forEach((p, i) => bump(p, (i === 0 || i === el.pts.length - 1) ? 1 : 2));
      else if (TWO.has(el.type)) el.pts.forEach((p) => bump(p));
      else if (el.type === 'nmos' || el.type === 'pmos') {
        const P = mosPins(el);
        [P.D, P.G, P.S].forEach((p) => bump(p));
        if (el.opts.dc) { bump(P.G); bump(P.D); }
      } else if (el.type === 'rail' || el.type === 'gnd') bump(el.pts[0]);
    }
    for (const [a, b] of segs) for (const p of pins) if (onInterior(p, a, b)) bump(p, 2);
    let dots = '';
    const seen = new Set();
    for (const p of pins) {
      const kk = k(p);
      if (seen.has(kk) || terms.has(kk)) continue;
      seen.add(kk);
      if ((deg.get(kk) || 0) >= 3) dots += `<circle class="fill" cx="${X(p[0])}" cy="${Y(p[1])}" r="3.3"/>`;
    }

    const maxW = opts.maxW || 660;
    const vx = Math.floor(EXT.minx - 4), vy = Math.floor(EXT.miny - 4);
    const vw = Math.ceil(EXT.maxx + 4) - vx, vh = Math.ceil(EXT.maxy + 4) - vy;
    EXT = null;
    return `<svg class="schem" viewBox="${vx} ${vy} ${vw} ${vh}" width="${Math.min(vw, maxW)}" role="img" aria-label="circuit diagram">${body}${dots}</svg>`;
  }

  function sideLabel(x, y, html, side, gap = 6, cls = '') {
    if (!html) return '';
    switch (side) {
      case 'l': return label(x - gap, y, html, 'r', cls);
      case 'b': return label(x, y + gap, html, 't', cls);
      case 'a': return label(x, y - gap, html, 'b', cls);
      case 'ar': return label(x + gap, y - gap, html, 'l', cls);
      case 'al': return label(x - gap, y - gap, html, 'r', cls);
      case 'br': return label(x + gap, y + gap + 6, html, 'l', cls);
      default: return label(x + gap, y, html, 'l', cls);
    }
  }

  // ---------------------------------------------------------------- plots
  // plot({x:[0,10], y:[0,5], xl, yl, curves:[{f|pts, cls}], pts:[{x,y,n}], xt:[...], yt:[...]})
  function plot(o) {
    const W = o.w || 400, H = o.h || 250, ml = 46, mr = 18, mt = 16, mb = 38;
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const X = (x) => ml + (x - x0) / (x1 - x0) * (W - ml - mr);
    const Y = (y) => H - mb - (y - y0) / (y1 - y0) * (H - mt - mb);
    let s = `<svg class="plot" viewBox="0 0 ${W} ${H}" width="${W}">`;
    for (const t of (o.xt || [])) s += `<path class="grid" d="M${X(t)},${Y(y0)}V${Y(y1)}"/>` + label(X(t), Y(y0) + 4, `<span class="tick">${t}</span>`, 't');
    for (const t of (o.yt || [])) s += `<path class="grid" d="M${X(x0)},${Y(t)}H${X(x1)}"/>` + label(X(x0) - 5, Y(t), `<span class="tick">${t}</span>`, 'r');
    s += `<path class="axis" d="M${X(x0)},${Y(y1)}V${Y(y0)}H${X(x1)}"/>`;
    for (const c of (o.curves || [])) {
      let pts = c.pts;
      if (c.f) { pts = []; const a = c.from ?? x0, b = c.to ?? x1; for (let i = 0; i <= 160; i++) { const x = a + (b - a) * i / 160; const y = c.f(x); if (isFinite(y)) pts.push([x, Math.max(Math.min(y, y1 + (y1 - y0)), y0 - (y1 - y0))]); } }
      s += `<path class="curve ${c.cls || ''}" d="M${pts.map((p) => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join('L')}"/>`;
    }
    for (const p of (o.pts || [])) s += `<circle class="fill" cx="${X(p.x)}" cy="${Y(p.y)}" r="4"/>` + label(X(p.x) + 7, Y(p.y) - 7, tex(p.n), 'l', 'small');
    s += `<clipPath id="noop"></clipPath>`;
    s += label((X(x0) + X(x1)) / 2, H - 4, tex(o.xl), 'b', 'small');
    s += label(X(x0) + 4, Y(y1) - 2, tex(o.yl), 'l', 'small');
    return s + '</svg>';
  }

  window.Schem = { render, netlist, solve, thevenin, plot, G };
})();

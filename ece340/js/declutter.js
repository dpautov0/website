/* declutter.js — after a figure is typeset, move any label that overlaps another label or the drawing
   to the nearest free spot. Works on real rendered text sizes, so it catches what size estimates miss. */
(function () {
  'use strict';
  const hit = (a, b, pad = 0.8) => Math.min(a.r, b.r) - Math.max(a.l, b.l) > pad && Math.min(a.b, b.b) - Math.max(a.t, b.t) > pad;

  // Offsets to try, nearest first (svg units).
  const CANDS = [];
  for (let dx = -36; dx <= 36; dx += 3) for (let dy = -30; dy <= 30; dy += 3) if (dx || dy) CANDS.push([dx, dy]);
  CANDS.sort((p, q) => (Math.hypot(p[0], p[1] * 1.15) - Math.hypot(q[0], q[1] * 1.15)));

  // Straight segments of a path using absolute M/L/H/V/A/Z commands (what schem.js emits).
  function pathSegs(d) {
    const segs = [];
    let x = 0, y = 0, sx = 0, sy = 0;
    const re = /([MLHVAZ])([^MLHVAZ]*)/gi;
    let m;
    while ((m = re.exec(d))) {
      const c = m[1].toUpperCase();
      const n = m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (c === 'M') {
        x = n[0]; y = n[1]; sx = x; sy = y;
        for (let i = 2; i + 1 < n.length; i += 2) { segs.push([x, y, n[i], n[i + 1]]); x = n[i]; y = n[i + 1]; }
      } else if (c === 'L') {
        for (let i = 0; i + 1 < n.length; i += 2) { segs.push([x, y, n[i], n[i + 1]]); x = n[i]; y = n[i + 1]; }
      } else if (c === 'H') {
        for (const v of n) { segs.push([x, y, v, y]); x = v; }
      } else if (c === 'V') {
        for (const v of n) { segs.push([x, y, x, v]); y = v; }
      } else if (c === 'A') {
        for (let i = 0; i + 6 < n.length; i += 7) { segs.push([x, y, n[i + 5], n[i + 6]]); x = n[i + 5]; y = n[i + 6]; }
      } else if (c === 'Z') {
        segs.push([x, y, sx, sy]); x = sx; y = sy;
      }
    }
    return segs;
  }

  function declutterSvg(svg) {
    const sr = svg.getBoundingClientRect();
    if (!sr.width || !sr.height) return;                      // hidden: done when it is revealed
    const ctm = svg.getScreenCTM();
    if (!ctm || !ctm.a) return;
    const toUser = (r) => ({ l: (r.left - ctm.e) / ctm.a, r: (r.right - ctm.e) / ctm.a, t: (r.top - ctm.f) / ctm.d, b: (r.bottom - ctm.f) / ctm.d });
    // A line is kept as a true segment (a slanted edge's bounding box would cover a triangle's whole inside).
    const seg = ([x1, y1, x2, y2]) => ({ seg: [x1, y1, x2, y2] });
    const segHits = (s, b) => {                    // does segment s cross box b (grown by 1.2)? Liang-Barsky clip
      const B = { l: b.l - 1.2, r: b.r + 1.2, t: b.t - 1.2, b: b.b + 1.2 };
      const [x1, y1, x2, y2] = s, dx = x2 - x1, dy = y2 - y1;
      const P = [-dx, dx, -dy, dy], Q = [x1 - B.l, B.r - x1, y1 - B.t, B.b - y1];
      let t0 = 0, t1 = 1;
      for (let k = 0; k < 4; k++) {
        if (Math.abs(P[k]) < 1e-12) { if (Q[k] < 0) return false; continue; }
        const t = Q[k] / P[k];
        if (P[k] < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
      }
      return t1 - t0 > 1e-9;
    };
    const obs = [];
    const addEl = (el) => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'foreignobject') return;
      if (el.classList && el.classList.contains('nodecl')) return;
      if (tag === 'g') { [...el.children].forEach(addEl); return; }
      if (tag === 'path' && !el.closest('[transform]')) { pathSegs(el.getAttribute('d') || '').forEach((s) => obs.push(seg(s))); return; }
      if (tag === 'rect' && !el.closest('[transform]')) {
        const x = +el.getAttribute('x'), y = +el.getAttribute('y'), w = +el.getAttribute('width'), h = +el.getAttribute('height');
        [[x, y, x + w, y], [x, y + h, x + w, y + h], [x, y, x, y + h], [x + w, y, x + w, y + h]].forEach((s) => obs.push(seg(s)));
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width || r.height) obs.push(toUser(r));
    };
    [...svg.children].forEach(addEl);

    // labels sit in the HTML layer over the drawing (figlabels.js); positions are kept in SVG units in data-x/y
    const lifted = window.FigLabels ? FigLabels.labels(svg) : [];
    const labs = (lifted.length ? lifted.map((o) => ({ fo: o.el, sp: o.sp, html: true }))
      : [...svg.querySelectorAll('foreignObject')].map((fo) => ({ fo, sp: fo.querySelector('div > span') })))
      .filter((o) => o.sp && o.sp.textContent.trim());
    const placed = [];
    let moved = false;
    for (const L of labs) {
      const r0 = toUser(L.sp.getBoundingClientRect());
      const at = (dx, dy) => ({ l: r0.l + dx, r: r0.r + dx, t: r0.t + dy, b: r0.b + dy });
      const free = (b) => !obs.some((o) => (o.seg ? segHits(o.seg, b) : hit(b, o))) && !placed.some((p) => hit(b, p, 0.5));
      let best = null;
      if (free(at(0, 0))) best = [0, 0];
      else for (const c of CANDS) if (free(at(c[0], c[1]))) { best = c; break; }
      if (!best) best = [0, 0];
      if (best[0] || best[1]) {
        if (L.html) { L.fo.dataset.x = +L.fo.dataset.x + best[0]; L.fo.dataset.y = +L.fo.dataset.y + best[1]; }
        else { L.fo.setAttribute('x', +L.fo.getAttribute('x') + best[0]); L.fo.setAttribute('y', +L.fo.getAttribute('y') + best[1]); }
        moved = true;
      }
      placed.push(at(best[0], best[1]));
    }
    // grow the view box if any label (moved or not) pokes past the edge: real KaTeX widths beat the estimate
    if (placed.length) {
      const vb = svg.viewBox.baseVal;
      let { x, y, width: w, height: h } = vb;
      const l = Math.min(x, ...placed.map((p) => p.l - 3)), t = Math.min(y, ...placed.map((p) => p.t - 3));
      const r = Math.max(x + w, ...placed.map((p) => p.r + 3)), b = Math.max(y + h, ...placed.map((p) => p.b + 3));
      if (l < x || t < y || r > x + w || b > y + h) {
        const oldW = w;
        svg.setAttribute('viewBox', `${l} ${t} ${r - l} ${b - t}`);
        const wa = +svg.getAttribute('width');
        if (wa) svg.setAttribute('width', Math.round(wa * (r - l) / oldW));
      }
    }
    if (moved || placed.length) { if (window.FigLabels) FigLabels.relayout(svg); }
  }

  function declutter(root) {
    if (!root) return;
    root.querySelectorAll('svg.schem').forEach((svg) => { try { declutterSvg(svg); } catch (e) { /* never break the page */ } });
  }

  window.declutter = declutter;
  window.declutterInternals = { pathSegs, hit };
})();

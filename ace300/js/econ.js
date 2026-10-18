/* econ.js — economics graphs for ACE 300 on top of the shared figure kit (pfig.js).
   EC.graph({w, h, x:[x0,x1], y:[y0,y1], xl, yl, xt:[v|[v,'tex']], yt, items:[...]}) -> svg string
   items (fills are drawn first, then lines and curves, then points and labels):
     { poly: [[x,y],...], cls: 'cs'|'ex'|'loss'|'gain' }                         shaded area
     { seg: [[x1,y1],[x2,y2]], cls: 'curve c2 dash', lab, at: 0..1 | 'end', anchor, dx, dy }
     { f: x => y, from, to, cls, lab, labX, anchor, dx, dy }                    curve y = f(x)
     { pts: [[x,y],...], cls, lab, ... }                                        polyline
     { pt: [x,y], lab, at: 'tr'|'tl'|'br'|'bl'|'r'|'l'|'t'|'b', guide: true|'x'|'y', gx: 'tex', gy: 'tex' }
     { text: [x,y], t: 'tex', anchor }   { arrow: [[x1,y1],[x2,y2]], cls }
   Helpers: EC.ic(a, U) = Cobb–Douglas indifference curve x2(x1) for U = x1^a x2^(1-a); EC.fmt(v) prints a number. */
(function () {
  'use strict';

  // labels are TeX; a label with no unescaped $ is wrapped in $...$ here so \$ (a dollar sign) survives
  const tex = (t) => (t && !String(t).startsWith('<') && !/(^|[^\\])\$/.test(String(t)) ? `$${t}$` : t);

  function graph(o) {
    const W = o.w || 320, H = o.h || 250, ml = o.ml ?? 40, mr = o.mr ?? 26, mt = o.mt ?? 16, mb = o.mb ?? 30;
    const [x0, x1] = o.x, [y0, y1] = o.y;
    const X = (x) => ml + (x - x0) / (x1 - x0) * (W - ml - mr);
    const Y = (y) => H - mb - (y - y0) / (y1 - y0) * (H - mt - mb);
    const f = PF.fig({ pad: 4, alt: o.alt });
    const tick = (v) => (Array.isArray(v) ? v : [v, String(v)]);
    for (const t of (o.xt || [])) { const [v, s] = tick(t); f.line(X(v), Y(y0) - 3, X(v), Y(y0) + 3, { cls: 'axisl nodecl' }); if (s !== '') f.label(X(v), Y(y0) + 5, tex(s), 't', 'small accent'); }
    for (const t of (o.yt || [])) { const [v, s] = tick(t); f.line(X(x0) - 3, Y(v), X(x0) + 3, Y(v), { cls: 'axisl nodecl' }); if (s !== '') f.label(X(x0) - 6, Y(v), tex(s), 'r', 'small accent'); }
    const items = o.items || [];
    // shaded areas first
    for (const it of items) if (it.poly) f.poly(it.poly.map((p) => [X(p[0]), Y(p[1])]), { cls: (it.cls || 'cs') + ' nodecl' });
    f.line(X(x0), Y(y0), X(x1), Y(y0), { cls: 'axisl', arrow: 'end', hs: 6 });
    f.line(X(x0), Y(y0), X(x0), Y(y1), { cls: 'axisl', arrow: 'end', hs: 6 });
    // guides from points to the axes
    for (const it of items) if (it.pt && it.guide) {
      const [px, py] = it.pt;
      if (it.guide !== 'y') f.line(X(px), Y(py), X(px), Y(y0), { cls: 'guide nodecl' });
      if (it.guide !== 'x') f.line(X(px), Y(py), X(x0), Y(py), { cls: 'guide nodecl' });
      if (it.gx) f.label(X(px), Y(y0) + 5, tex(it.gx), 't', 'small accent');
      if (it.gy) f.label(X(x0) - 6, Y(py), tex(it.gy), 'r', 'small accent');
    }
    const clipDraw = (pts, cls) => {
      let seg = [];
      const flush = () => { if (seg.length > 1) f.pl(seg.map((p) => [X(p[0]), Y(p[1])]), { cls }); seg = []; };
      for (const p of pts) { if (!isFinite(p[1]) || p[1] < y0 - 1e-9 || p[1] > y1 + 1e-9 || p[0] < x0 - 1e-9 || p[0] > x1 + 1e-9) flush(); else seg.push(p); }
      flush();
    };
    const lab = (px, py, it, defAnchor) => {
      if (!it.lab) return;
      f.label(X(px) + (it.dx ?? 4), Y(py) + (it.dy ?? -6), tex(it.lab), it.anchor || defAnchor, 'small');
    };
    for (const it of items) {
      if (it.seg) {
        const [[ax, ay], [bx, by]] = it.seg;
        f.line(X(ax), Y(ay), X(bx), Y(by), { cls: it.cls ?? 'curve' });
        const t = it.at === undefined || it.at === 'end' ? 1 : it.at === 'start' ? 0 : it.at;
        lab(ax + (bx - ax) * t, ay + (by - ay) * t, it, 'bl');
      } else if (it.f) {
        const a = it.from ?? x0, b = it.to ?? x1, N = it.n || 220, pts = [];
        for (let i = 0; i <= N; i++) { const x = a + (b - a) * i / N; pts.push([x, it.f(x)]); }
        clipDraw(pts, 'curve ' + (it.cls || ''));
        if (it.lab) { const lx = it.labX ?? b; lab(lx, Math.min(Math.max(it.f(lx), y0), y1), it, 'bl'); }
      } else if (it.pts) {
        clipDraw(it.pts, it.cls ?? 'curve');
        if (it.lab) { const p = it.pts[it.labI ?? it.pts.length - 1]; lab(p[0], p[1], it, 'bl'); }
      } else if (it.arrow) {
        const [[ax, ay], [bx, by]] = it.arrow;
        f.arrow(X(ax), Y(ay), X(bx), Y(by), { cls: it.cls || 'dim', hs: 6 });
      }
    }
    for (const it of items) {
      if (it.pt) { f.dot(X(it.pt[0]), Y(it.pt[1]), 3.4, { cls: 'ptdot' }); if (it.lab) f.tag(X(it.pt[0]), Y(it.pt[1]), tex(it.lab), it.at || 'tr', 9, 'small'); }
      if (it.text) f.label(X(it.text[0]), Y(it.text[1]), tex(it.t), it.anchor || 'c', it.cls || 'small');
    }
    if (o.xl) f.label(X(x1) + 9, Y(y0), tex(o.xl), 'l', 'small');
    if (o.yl) f.label(X(x0) + 6, Y(y1) - 2, tex(o.yl), 'bl', 'small');
    f.track(0, 0, W, H);
    return f.svg().replace('class="schem pfig', 'class="schem pfig pplot');
  }

  // Cobb–Douglas indifference curve through utility U: x2 = (U / x1^a)^(1/(1-a))
  const ic = (a, U) => (x) => (x > 0 ? Math.pow(U / Math.pow(x, a), 1 / (1 - a)) : Infinity);
  const U = (a, x1, x2) => Math.pow(x1, a) * Math.pow(x2, 1 - a);
  // print a number the way a person writes it: 2.4, 12, 0.333, 1,250
  const fmt = (v, d = 3) => {
    if (!isFinite(v)) return String(v);
    const r = Math.round(v * Math.pow(10, d)) / Math.pow(10, d);
    const s = String(r);
    return Math.abs(r) >= 10000 ? r.toLocaleString('en-US') : s;
  };

  window.EC = { graph, ic, U, fmt };
})();

/* bank.js — the concept quiz: every multiple-choice question in the course, served at random
   (options shuffled, no repeats until the pool is used up). Loaded after the content files. */
(function () {
  'use strict';
  const seen = {};

  function pool(opts) {
    const out = [];
    COURSE.units.forEach((u) => {
      if (opts.units && !opts.units.includes(u.id)) return;
      u.lessons.forEach((l) => {
        if (l.noBank) return;
        // l.bank: extra questions that only the quiz serves (they don't count toward the lesson)
        l.steps.concat(l.bank || []).forEach((s) => {
          if (s.t !== 'prob' || !s.parts || !s.parts.length) return;
          if (!s.parts.every((p) => p.mc)) return;
          if (opts.tags && !(s.tags || []).some((t) => opts.tags.includes(t))) return;
          out.push({ s, l, u });
        });
      });
    });
    return out;
  }

  function shuffled(part) {
    const idx = part.mc.map((_, i) => i);
    if (!part.fixed) for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return { mc: idx.map((i) => part.mc[i]), a: idx.indexOf(part.a), why: part.why ? idx.map((i) => part.why[i]) : undefined, lbl: part.lbl, fixed: part.fixed };
  }

  GENS.concept = (opts = {}) => {
    const key = JSON.stringify([opts.units || null, opts.tags || null]);
    const all = pool(opts);
    if (!all.length) return { q: 'No questions in this pool yet.', parts: [] };
    seen[key] = seen[key] || new Set();
    let left = all.filter((e) => !seen[key].has(e.s));
    if (!left.length) { seen[key].clear(); left = all; }
    const e = left[Math.floor(Math.random() * left.length)];
    seen[key].add(e.s);
    const s = e.s;
    return {
      q: s.q, figs: s.figs, fig: s.fig, figHtml: s.figHtml, sol: s.sol, hints: s.hints, title: s.title,
      src: `${e.u.num} · <a href="#/l/${e.l.id}">${e.l.title}</a>`,
      parts: s.parts.map(shuffled),
    };
  };
  GENS.concept.count = (opts = {}) => pool(opts).length;
})();

/* print-exam.js — a practice or past exam as a paper (index.html?print=<lesson id>) or its answer key (&key=1).
   Used to build pdf/<id>.pdf and pdf/<id>-key.pdf with headless Edge; also works from a browser's Print.
   Paper: the header, each problem's setup and question, work space sized by points, then the one table the exam prints.
   Key: the same questions, then each part's answer and the worked solution. Interactive-only text (rules for the site,
   "how to use", callout boxes) stays off the paper. */
(function () {
  'use strict';
  if (typeof URLSearchParams === 'undefined' || !window.location || !location.search) return;
  const q = new URLSearchParams(location.search);
  const id = q.get('print');
  if (!id) return;
  const KEY = q.get('key') === '1';

  const strip = (s) => String(s || '').replace(/\[([^\]]+)\]\((#[^)]*|[^)]*\.html)\)/g, '$1').replace(/<a [^>]*>([^<]*)<\/a>/g, '$1');
  // drop "!!callout" blocks (the line and the indented lines under it)
  function noCallouts(md) {
    const out = []; let skip = -1;
    for (const line of String(md).split('\n')) {
      const ind = line.match(/^\s*/)[0].length;
      if (/^\s*!!\w+/.test(line)) { skip = ind; continue; }
      if (skip >= 0 && (line.trim() === '' || ind > skip)) { if (line.trim() === '') out.push(line); continue; }
      skip = -1; out.push(line);
    }
    return out.join('\n');
  }
  const pts = (s) => { const m = /(\d+)\s*pts?/.exec(s.src || ''); return m ? +m[1] : 5; };
  const SHOW_OPTS = /circle|which (of|one)|choose|select|true or false|all that apply|pick/i;

  function answerTex(pt) {
    if (pt.mc) {
      const a = Array.isArray(pt.a) ? pt.a.map((j) => pt.mc[j]).join('; ') : pt.mc[pt.a];
      return String(a);
    }
    const v = typeof pt.ans === 'function' ? pt._ans : pt.ans;
    if (pt.expr !== undefined) return `$${pt.expr}$`;
    if (typeof v === 'number') return `$${U.fmt(v, 4)}${pt.unit ? `\\ \\text{${pt.unit}}` : ''}$`;
    return String(v === undefined ? '' : v);
  }
  const lbl = (l) => (!l ? '' : (/\$/.test(l) || /\s/.test(l) && !/[\\_^{}]/.test(l)) ? l : `$${l}$`);

  function render() {
    const E = window.Engine, l = E.BYID.get(id);
    if (!l) { document.body.innerHTML = `<p>No lesson ${id} (${E.BYID.size} lessons, ${COURSE.units.length} units)</p>`; return; }
    const rich = (m, f) => E.rich(strip(m), f);
    let h = `<header class="px-head"><div class="px-kicker">ECE 329 · Exam 3${KEY ? ' · ANSWER KEY' : ''}</div><h1>${l.title}</h1>`;
    const i0 = l.steps.findIndex((s) => s.t === 'read');
    const intro = i0 >= 0 ? strip(l.steps[i0].md).trim().split(/\n\s*\n/)[0] : '';
    if (intro) h += `<div class="px-rules">${E.mdToHtml(intro)}</div>`;
    if (!KEY) h += `<div class="px-name">Name: <span></span> NetID: <span></span></div><p class="px-note">The loss-limits table (the one table the exam prints) is on the last page. Answer key: the matching -key PDF.</p>`;
    else h += `<p class="px-note">Each part: the answer first, then the worked solution.</p>`;
    h += '</header>';
    let n = 0;
    l.steps.forEach((s, i) => {
      if (i === i0) return;
      if (s.t === 'read') {
        if (!/^\s*#{2,3} /m.test(s.md) || /^\s*!!/.test(s.md)) return;
        h += `<section class="px-setup">${rich(KEY ? s.md : noCallouts(s.md), s.figs)}${s.fig ? `<figure class="fig">${typeof s.fig === 'string' ? s.fig : ''}</figure>` : ''}</section>`;
      } else if (s.t === 'paper') {
        (s.items || []).forEach((it) => {
          h += `<section class="px-prob"><div class="px-q">${rich(it.q, it.figs)}</div>`;
          h += KEY ? `<div class="px-ans"><div class="px-h">Answer</div>${rich(it.ans)}</div>${it.sol ? `<div class="px-sol"><div class="px-h">Worked solution</div>${rich(it.sol, it.figs)}</div>` : ''}` : '<div class="px-work" style="height:160px"></div>';
          h += '</section>';
        });
      } else if (s.t === 'prob') {
        n++;
        const parts = s.parts || [];
        parts.forEach((pt) => { if (typeof pt.ans === 'function') pt._ans = pt.ans(s.fig && window.Schem ? Schem.solve(s.fig) : null); });
        h += `<section class="px-prob">${s.src ? `<div class="px-src">${s.src}</div>` : ''}<div class="px-q">${rich(s.q, s.figs)}</div>`;
        if (s.fig) h += `<figure class="fig">${typeof s.fig === 'string' ? s.fig : (window.Schem ? Schem.render(s.fig, s.figOpts || {}) : '')}</figure>`;
        if (s.figHtml) h += `<figure class="fig">${s.figHtml}</figure>`;
        if (s.q2) h += `<div class="px-q">${E.mdToHtml(strip(s.q2))}</div>`;
        if (!KEY) {
          const showAll = SHOW_OPTS.test(s.q || '');
          h += '<ol class="px-parts">' + parts.map((pt) => {
            const two = pt.mc && pt.mc.length === 2 && pt.mc.every((o) => String(o).length <= 8);
            if (pt.mc && (showAll || two)) {
              if (two) return `<li>${E.mdToHtml(lbl(pt.lbl))}<span class="px-tf">${pt.mc.join(' &nbsp;/&nbsp; ')}</span></li>`;
              return `<li>${pt.lbl ? E.mdToHtml(lbl(pt.lbl)) : ''}<ol class="px-opts" type="A">${pt.mc.map((o) => `<li>${E.mdToHtml(String(o))}</li>`).join('')}</ol></li>`;
            }
            return pt.lbl ? `<li>${E.mdToHtml(lbl(pt.lbl))}${pt.mc ? '' : ' <span class="px-blank"></span>'}</li>` : '';
          }).join('') + '</ol>';
          h += `<div class="px-work" style="height:${Math.min(520, 60 + pts(s) * 26)}px"></div>`;
        } else {
          h += `<div class="px-ans"><div class="px-h">Answer</div><ul>${parts.map((pt) => `<li>${pt.lbl ? `${E.mdToHtml(lbl(pt.lbl))}${pt.mc ? ': ' : ' = '}` : ''}<b>${E.mdToHtml(answerTex(pt))}</b></li>`).join('')}</ul></div>`;
          if (s.sol) h += `<div class="px-sol"><div class="px-h">Worked solution</div>${rich(s.sol, s.figs)}</div>`;
        }
        h += '</section>';
      }
    });
    if (!KEY) {
      const sh = E.BYID.get('e3-sheet');
      const tbl = sh ? sh.steps[0].md.split('\n').filter((x) => /^\s*\|/.test(x)).join('\n') : '';
      h += `<section class="px-table"><h2>Given on the exam: loss limits</h2>${E.mdToHtml(tbl)}<p>with $\\lambda = 2\\pi/\\beta$ and $\\delta = 1/\\alpha$ in every row.</p></section>`;
    }
    const root = document.createElement('div');
    root.id = 'px';
    root.innerHTML = h;
    document.body.innerHTML = '';
    document.body.className = 'px-body' + (KEY ? ' px-key' : '');
    document.documentElement.dataset.theme = 'light';
    document.body.appendChild(root);
    // single-line inline md wraps in <p>: keep list items compact
    root.querySelectorAll('.px-parts li > p:first-child, .px-ans li > p, .px-ans li b > p, .px-opts li > p').forEach((p) => p.replaceWith(...p.childNodes));
    document.title = `${l.title}${KEY ? ' — answer key' : ''}`;
    const go = () => { E.renderMath(root); document.body.dataset.ready = '1'; };
    if (window.renderMathInElement) go(); else window.addEventListener('load', go);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(render, 0));
})();

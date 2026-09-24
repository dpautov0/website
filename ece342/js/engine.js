/* engine.js — renders the course: sidebar, lessons, problem cards, progress. */
(function () {
  'use strict';

  // ---------------------------------------------------------------- storage
  const KEY = 'ece342.trainer.v1';
  const Store = {
    s: { done: {}, gen: {}, last: null },
    load() { try { const raw = localStorage.getItem(KEY); if (raw) this.s = Object.assign(this.s, JSON.parse(raw)); } catch (e) { /* private mode */ } },
    save() { try { localStorage.setItem(KEY, JSON.stringify(this.s)); } catch (e) { /* ignore */ } },
    isDone(id) { return !!this.s.done[id]; },
    markDone(id) { this.s.done[id] = 1; this.save(); },
    gen(id) { return this.s.gen[id] || 0; },
    incGen(id) { this.s.gen[id] = (this.s.gen[id] || 0) + 1; this.save(); },
    setLast(id) { this.s.last = id; this.save(); },
    reset() { this.s = { done: {}, gen: {}, last: null }; this.save(); },
  };

  // ---------------------------------------------------------------- markdown
  const MACROS = {
    '\\pl': '\\mathbin{\\|}',
    '\\VTH': 'V_{\\mathrm{TH}}', '\\RTH': 'R_{\\mathrm{TH}}',
    '\\IN': 'I_{\\mathrm{N}}', '\\RN': 'R_{\\mathrm{N}}',
    '\\Vov': 'V_{ov}', '\\kO': '\\,\\text{k}\\Omega', '\\Ohm': '\\,\\Omega',
    '\\un': '\\,\\text{#1}', '\\WL': '\\tfrac{W}{L}',
  };

  function escMath(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function inlineSeg(s) {
    return s.split(/(\$\$[\s\S]*?\$\$|\$[^$]*\$)/g).map((seg, i) => {
      if (i % 2) return escMath(seg);
      return seg
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/(^|[^*\w])\*([^*\n]+)\*(?!\w)/g, '$1<em>$2</em>')
        .replace(/\[([^\]]+)\]\((#[^)]+)\)/g, '<a href="$2">$1</a>');
    }).join('');
  }

  // Bold is split out first so it can wrap math (**$V_1$:**); an unpaired ** is left as text.
  function inline(s) {
    const parts = s.split('**');
    if (parts.length < 3 || parts.length % 2 === 0) return inlineSeg(s);
    return parts.map((p, i) => (i % 2 ? `<b>${inlineSeg(p)}</b>` : inlineSeg(p))).join('');
  }

  function mdToHtml(src) {
    if (!src) return '';
    const raw = src.replace(/\r/g, '').split('\n');
    const ind = Math.min(...raw.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    const L = raw.map((l) => l.slice(Number.isFinite(ind) ? ind : 0));
    const blocks = [];
    let cur = [];
    let inMath = false;
    for (const l of L) {
      if (!l.trim() && !inMath) { if (cur.length) blocks.push(cur); cur = []; continue; }
      cur.push(l);
      const n = (l.match(/\$\$/g) || []).length;
      if (n % 2) inMath = !inMath;
    }
    if (cur.length) blocks.push(cur);
    // A callout absorbs following blocks that are indented by two or more spaces.
    const merged = [];
    for (const b of blocks) {
      const prev = merged[merged.length - 1];
      if (prev && prev[0].startsWith('!!') && /^ {2,}\S/.test(b[0])) prev.push('', ...b);
      else merged.push(b);
    }
    return merged.map(renderBlock).join('');
  }

  const LIST_RE = /^\s*([-*]|\d+\.) /;

  function renderBlock(lines) {
    const first = lines[0];
    // A paragraph that runs straight into a list: split them.
    if (!first.startsWith('!!') && !LIST_RE.test(first) && !first.trim().startsWith('$$') && !first.startsWith('|')) {
      const j = lines.findIndex((l) => LIST_RE.test(l));
      if (j > 0) return renderBlock(lines.slice(0, j)) + renderBlock(lines.slice(j));
    }
    if (first.startsWith('!!')) {
      const m = /^!!(\w+)\s*(.*)$/.exec(first);
      const body = mdToHtml(lines.slice(1).join('\n'));
      return `<aside class="call call-${m[1]}">${m[2] ? `<div class="call-t">${inline(m[2])}</div>` : ''}${body}</aside>`;
    }
    if (first.startsWith('#')) {
      const lvl = first.match(/^#+/)[0].length;
      const h = `<h${lvl + 2}>${inline(first.replace(/^#+\s*/, ''))}</h${lvl + 2}>`;
      return lines.length > 1 ? h + renderBlock(lines.slice(1)) : h;
    }
    if (first.trim().startsWith('$$')) {
      // Display math ends at the line that closes it; anything after is ordinary text.
      let open = false, end = lines.length;
      for (let i = 0; i < lines.length; i++) {
        if ((lines[i].match(/\$\$/g) || []).length % 2) open = !open;
        if (!open) { end = i + 1; break; }
      }
      const math = `<div class="mathblock">${escMath(lines.slice(0, end).join('\n'))}</div>`;
      return end < lines.length ? math + renderBlock(lines.slice(end)) : math;
    }
    if (/^\s*[-*] /.test(first)) return list(lines, 'ul', /^\s*[-*] /);
    if (/^\s*\d+\. /.test(first)) return list(lines, 'ol', /^\s*\d+\. /);
    if (first.startsWith('|')) return table(lines);
    return `<p>${inline(lines.join(' '))}</p>`;
  }

  function list(lines, tag, re) {
    const items = [];
    for (const l of lines) {
      if (re.test(l)) items.push(l.replace(re, ''));
      else if (items.length) items[items.length - 1] += ' ' + l.trim();
    }
    return `<${tag}>${items.map((i) => `<li>${inline(i)}</li>`).join('')}</${tag}>`;
  }

  function table(lines) {
    const rows = lines.filter((l) => !/^\|\s*:?-+/.test(l)).map((l) => l.replace(/^\||\|$/g, '').split(' | ').map((c) => c.trim()));
    const [h, ...b] = rows;
    return `<div class="tablewrap"><table><thead><tr>${h.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${b.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  // Text with drawings: a line "[[fig:key]]" is replaced by figs[key] = {fig | svg, cap}.
  function figureHtml(F) {
    if (!F) return '';
    const body = F.svg || (typeof F.fig === 'string' ? F.fig : Schem.render(F.fig, F.opts || {}));
    return `<figure class="fig">${body}${F.cap ? `<figcaption>${inline(F.cap)}</figcaption>` : ''}</figure>`;
  }
  function rich(src, figs) {
    if (!src) return '';
    if (!figs) return mdToHtml(src);
    return src.split(/^[ 	]*\[\[fig:([\w-]+)\]\][ 	]*$/m).map((seg, i) => (i % 2 ? figureHtml(figs[seg]) : mdToHtml(seg))).join('');
  }

  function renderMath(el) {
    if (window.renderMathInElement) {
      window.renderMathInElement(el, {
        delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
        macros: MACROS, throwOnError: false, strict: 'ignore',
      });
    }
    if (window.declutter) window.declutter(el);
  }

  function texInline(t) {
    if (window.katex) { try { return window.katex.renderToString(t, { macros: MACROS, throwOnError: false }); } catch (e) { /* fallthrough */ } }
    return U.esc(t);
  }

  function unitTeX(u) {
    return u.split(/(Ω|µ|²)/).filter(Boolean).map((t) => (t === 'Ω' ? '\\Omega' : t === 'µ' ? '\\mu' : t === '²' ? '^2' : `\\text{${t}}`)).join('');
  }

  // ---------------------------------------------------------------- course index
  const LESSONS = [];
  const BYID = new Map();
  function indexCourse() {
    COURSE.units.forEach((u, ui) => {
      u.lessons.forEach((l, li) => {
        l.unit = u; l.ui = ui; l.li = li;
        l.steps.forEach((s, si) => {
          if (s.t === 'prob') s.key = s.id || `${l.id}.p${si}`;
          if (s.t === 'gen') s.key = `${l.id}.g${si}`;
        });
        LESSONS.push(l);
        BYID.set(l.id, l);
      });
    });
  }

  function lessonProgress(l) {
    let tot = 0, got = 0;
    for (const s of l.steps) {
      if (s.t === 'prob') { tot++; if (Store.isDone(s.key)) got++; }
      if (s.t === 'gen') { tot++; if (Store.gen(s.key) >= s.need) got++; }
    }
    return { tot, got, pct: tot ? got / tot : (Store.isDone('visit:' + l.id) ? 1 : 0) };
  }
  function unitProgress(u) {
    let tot = 0, got = 0;
    u.lessons.forEach((l) => { const p = lessonProgress(l); tot += p.tot || 1; got += p.tot ? p.got : p.pct; });
    return tot ? got / tot : 0;
  }
  function courseProgress() {
    let tot = 0, got = 0;
    LESSONS.forEach((l) => { const p = lessonProgress(l); tot += p.tot || 1; got += p.tot ? p.got : p.pct; });
    return tot ? got / tot : 0;
  }

  const KIND = {
    lesson: 'Lesson', checkpoint: 'Checkpoint', pset: 'Problem Set', exam: 'Past midterm',
    mock: 'Mock exam', review: 'Mixed review', read: 'Reference',
  };

  // ---------------------------------------------------------------- sidebar
  function statusIcon(p) {
    if (p.tot === 0) return '<span class="st st-read"></span>';
    if (p.got >= p.tot) return '<span class="st st-done" title="Complete"></span>';
    if (p.got > 0) return `<span class="st st-part" style="--p:${p.pct}" title="${p.got}/${p.tot}"></span>`;
    return '<span class="st st-none"></span>';
  }

  function buildSidebar(activeId) {
    const sb = document.getElementById('sidebar');
    const openUnit = activeId ? BYID.get(activeId)?.unit : null;
    sb.innerHTML = `<nav aria-label="Course">${COURSE.units.map((u) => {
      const pct = Math.round(unitProgress(u) * 100);
      const open = openUnit === u || (!openUnit && u === COURSE.units[0]);
      return `<details class="unit" ${open ? 'open' : ''}><summary><span class="u-num">${u.num}</span><span class="u-title">${u.title}</span><span class="u-pct">${pct}%</span></summary><ol>${u.lessons.map((l) => {
        const p = lessonProgress(l);
        return `<li class="${l.id === activeId ? 'active' : ''} k-${l.kind || 'lesson'}"><a href="#/l/${l.id}">${statusIcon(p)}<span class="l-title">${l.title}</span>${l.kind && l.kind !== 'lesson' ? `<span class="l-kind">${KIND[l.kind]}</span>` : ''}</a></li>`;
      }).join('')}</ol></details>`;
    }).join('')}</nav>`;
    renderMath(sb);
    const act = sb.querySelector('li.active');
    if (act) act.scrollIntoView({ block: 'nearest' });
  }

  function updateTopProgress() {
    const pct = Math.round(courseProgress() * 100);
    document.getElementById('top-pct').textContent = pct + '%';
    document.getElementById('top-bar').style.width = pct + '%';
  }

  // ---------------------------------------------------------------- home
  function renderHome() {
    const main = document.getElementById('main');
    const next = LESSONS.find((l) => { const p = lessonProgress(l); return p.tot && p.got < p.tot; }) || LESSONS[0];
    const last = Store.s.last && BYID.get(Store.s.last);
    main.innerHTML = `
      <section class="home">
        <h1>ECE 342 · Exam 1</h1>
        <p class="lede">Thu Sep 24, 7–8 PM, 1002 ECEB. HW 1–3, through MOSFET DC analysis. Calculators allowed.</p>
        <div class="home-actions">
          <a class="btn primary" href="#/l/${(last || next).id}">${last ? 'Continue: ' + last.title : 'Start: ' + next.title}</a>
          <a class="btn" href="#/l/u5-bank">Question bank</a>
        </div>
        <div class="units">${COURSE.units.map((u) => {
          const pct = Math.round(unitProgress(u) * 100);
          return `<a class="unit-card" href="#/l/${u.lessons[0].id}">
            <div class="uc-top"><span class="u-num">${u.num}</span><span class="uc-pct">${pct}%</span></div>
            <h2>${u.title}</h2>
            <div class="meter"><span style="width:${pct}%"></span></div></a>`;
        }).join('')}</div>
        <section class="howto">
          <p>Numbers: in the unit shown, arithmetic allowed (<code>19/3</code>, <code>sqrt(0.04)</code>), within 1.5%. Expressions: <code>gm*RD</code> or <code>gm RD</code>; <code>||</code> is parallel. A drill doesn't count once you open its solution. Progress is saved in this browser.</p>
        </section>
        <p class="reset-row"><button class="btn subtle" id="reset">Reset progress</button></p>
      </section>`;
    main.querySelector('#reset').addEventListener('click', () => {
      if (confirm('Erase all progress on this device?')) { Store.reset(); route(); }
    });
    renderMath(main);
    buildSidebar(null);
    updateTopProgress();
    document.title = 'ECE 342';
  }

  // ---------------------------------------------------------------- lesson page
  function renderLesson(l) {
    Store.setLast(l.id);
    const main = document.getElementById('main');
    const idx = LESSONS.indexOf(l);
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    main.innerHTML = `
      <article class="lesson k-${l.kind || 'lesson'}">
        <header class="l-head">
          <p class="eyebrow">${l.unit.num} · ${l.unit.title}</p>
          <h1>${l.title}</h1>
          ${l.kind && l.kind !== 'lesson' ? `<span class="kind-pill">${KIND[l.kind]}</span>` : ''}
          <div class="l-progress"><div class="meter"><span></span></div><span class="l-count"></span></div>
        </header>
        <div class="steps"></div>
        <nav class="l-nav">
          ${prev ? `<a class="btn" href="#/l/${prev.id}">← ${prev.title}</a>` : '<span></span>'}
          ${next ? `<a class="btn primary" href="#/l/${next.id}">${next.title} →</a>` : '<a class="btn primary" href="#/">Back to overview</a>'}
        </nav>
      </article>`;
    const wrap = main.querySelector('.steps');
    let pnum = 0;
    for (const s of l.steps) {
      if (s.t === 'read') {
        const d = document.createElement('section');
        d.className = 'read';
        const figHtml = s.fig ? `<figure class="fig">${typeof s.fig === 'string' ? s.fig : Schem.render(s.fig)}</figure>` : '';
        d.innerHTML = rich(s.md, s.figs) + figHtml + (s.after ? rich(s.after, s.figs) : '');
        wrap.appendChild(d);
      } else if (s.t === 'prob') {
        pnum++;
        wrap.appendChild(staticCard(s, pnum, l));
      } else if (s.t === 'gen') {
        pnum++;
        wrap.appendChild(genCard(s, pnum, l));
      }
    }
    if (!l.steps.some((s) => s.t !== 'read')) Store.markDone('visit:' + l.id);
    renderMath(main);
    refreshLessonProgress(l);
    buildSidebar(l.id);
    updateTopProgress();
    document.title = `${l.title} · ECE 342`;
    window.scrollTo(0, 0);
  }

  function refreshLessonProgress(l) {
    const p = lessonProgress(l);
    const bar = document.querySelector('.l-progress .meter span');
    const cnt = document.querySelector('.l-count');
    if (!bar) return;
    bar.style.width = Math.round(p.pct * 100) + '%';
    cnt.textContent = p.tot ? `${p.got} of ${p.tot} complete` : 'Reading';
  }

  function onProgress(l) {
    refreshLessonProgress(l);
    buildSidebar(l.id);
    updateTopProgress();
  }

  // ---------------------------------------------------------------- problem cards
  function staticCard(s, n, l) {
    const el = document.createElement('div');
    const solvedBefore = Store.isDone(s.key);
    mountProblem(el, s, {
      n, lesson: l, solved: solvedBefore,
      onCorrect() { if (!Store.isDone(s.key)) { Store.markDone(s.key); onProgress(l); } },
    });
    return el;
  }

  function genCard(s, n, l) {
    const el = document.createElement('div');
    const make = () => {
      const name = s.opts.pool ? U.pick(s.opts.pool) : s.name;
      const g = GENS[name];
      if (!g) return { q: `Missing generator **${name}**.`, parts: [] };
      const p = g(s.opts);
      p.genName = name;
      return p;
    };
    const draw = () => {
      const p = make();
      mountProblem(el, p, {
        n, lesson: l, gen: true, need: s.need, count: Store.gen(s.key),
        onCorrect(viewedSol) {
          if (!viewedSol) { Store.incGen(s.key); onProgress(l); }
          return Store.gen(s.key);
        },
        onNew() { draw(); renderMath(el); },
      });
    };
    draw();
    return el;
  }

  function mountProblem(host, p, ctx) {
    const parts = p.parts || [];
    const S = (p.fig && parts.some((pt) => typeof pt.ans === 'function')) ? Schem.solve(p.fig) : null;
    parts.forEach((pt) => { if (typeof pt.ans === 'function') pt._ans = pt.ans(S); else pt._ans = pt.ans; });

    const tag = ctx.gen ? 'Practice' : (p.src ? '' : 'Practice');
    const srcHtml = p.src ? `<span class="src">${p.src}</span>` : `<span class="src">${tag}</span>`;
    const genMeter = ctx.gen ? `<span class="streak" title="Correct answers counted toward completion">${meterDots(ctx.count, ctx.need)}</span>` : '';
    host.className = 'prob' + (ctx.solved ? ' solved' : '') + (p.big ? ' big' : '');
    host.innerHTML = `
      <header class="p-head"><span class="p-num">${ctx.n}</span>${srcHtml}${p.title ? `<span class="p-title">${p.title}</span>` : ''}${genMeter}<span class="p-status" aria-live="polite"></span></header>
      <div class="p-q">${rich(p.q, p.figs)}</div>
      ${p.fig ? `<figure class="fig">${Schem.render(p.fig, p.figOpts || {})}</figure>` : ''}
      ${p.figHtml ? `<figure class="fig">${p.figHtml}</figure>` : ''}
      ${p.q2 ? `<div class="p-q">${mdToHtml(p.q2)}</div>` : ''}
      <div class="parts">${parts.map((pt, i) => partHtml(pt, i)).join('')}</div>
      <div class="p-actions">
        ${parts.length ? '<button class="btn primary chk">Check</button>' : ''}
        ${(p.hints && p.hints.length) ? '<button class="btn hint">Hint</button>' : ''}
        ${p.sol ? '<button class="btn subtle solbtn">Solution</button>' : ''}
        ${ctx.gen ? '<button class="btn subtle newp">New problem</button>' : ''}
      </div>
      <div class="p-fb" aria-live="polite"></div>
      <div class="p-hints"></div>
      <div class="p-sol" hidden>${p.sol ? `<div class="sol-h">Worked solution</div>${rich(p.sol, p.figs)}` : ''}</div>`;
    if (ctx.solved) host.querySelector('.p-status').innerHTML = '<span class="ok-badge">Solved</span>';

    let hintIx = 0, viewedSol = false, attempts = 0;
    const fb = host.querySelector('.p-fb');
    const chk = host.querySelector('.chk');

    // expression previews
    parts.forEach((pt, i) => {
      if (pt.expr === undefined) return;
      const inp = host.querySelector(`[data-part="${i}"] input`);
      const pv = host.querySelector(`[data-part="${i}"] .preview`);
      const upd = () => {
        const v = inp.value.trim();
        if (!v) { pv.innerHTML = ''; return; }
        try { const ast = Expr.parse(v, Object.keys(pt.vars), pt.disp); pv.innerHTML = 'Reads as ' + texInline(Expr.toTeX(ast, pt.disp || {})); }
        catch (e) { pv.innerHTML = `<span class="err">${U.esc(e.message)}</span>`; }
      };
      inp.addEventListener('input', upd);
    });

    host.querySelectorAll('.opt').forEach((o) => o.addEventListener('click', () => {
      const grp = o.closest('.part');
      grp.querySelectorAll('.opt').forEach((x) => x.classList.remove('sel'));
      o.classList.add('sel');
      grp.classList.remove('bad', 'good');
    }));

    host.querySelectorAll('input').forEach((inp) => inp.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); chk && chk.click(); }
    }));

    chk && chk.addEventListener('click', () => {
      attempts++;
      let allOk = true;
      const msgs = [];
      parts.forEach((pt, i) => {
        const box = host.querySelector(`[data-part="${i}"]`);
        const r = checkPart(pt, box);
        box.classList.toggle('good', r.ok);
        box.classList.toggle('bad', !r.ok);
        if (!r.ok) {
          allOk = false;
          const lbl = parts.length > 1 && pt.lbl && !pt.mc ? `${pt.lbl.includes('$') ? pt.lbl : `$${pt.lbl}$`}: ` : '';
          if (r.msg || r.err) msgs.push(lbl + (r.err || r.msg));
        }
      });
      if (allOk) {
        host.classList.add('solved');
        host.querySelector('.p-status').innerHTML = '<span class="ok-badge">Solved</span>';
        let extra = '';
        if (ctx.gen) {
          const c = ctx.onCorrect(viewedSol);
          const m = host.querySelector('.streak');
          if (m) m.innerHTML = meterDots(c, ctx.need);
          extra = viewedSol ? ' (You viewed the solution, so this one doesn\'t count. Try a new one.)'
            : (c >= ctx.need ? ' This skill is complete. Keep drilling if you like.' : ` ${ctx.need - c} more to complete this skill.`);
          host.querySelector('.newp').classList.add('primary');
        } else ctx.onCorrect();
        fb.className = 'p-fb good';
        fb.innerHTML = `<b>Correct.</b>${extra}`;
        if (!viewedSol && p.sol && !ctx.gen) host.querySelector('.solbtn').textContent = 'Compare with solution';
      } else {
        fb.className = 'p-fb bad';
        const nudge = (attempts >= 2 && p.hints && hintIx < p.hints.length) ? ' <span class="nudge">Stuck? Try a hint.</span>' : '';
        fb.innerHTML = `<b>Not yet.</b> ${msgs.map(inline).join(' ')}${nudge}`;
      }
      renderMath(fb);
    });

    const hb = host.querySelector('.hint');
    hb && hb.addEventListener('click', () => {
      if (hintIx >= p.hints.length) return;
      const d = document.createElement('div');
      d.className = 'hint-item';
      d.innerHTML = `<span class="hint-n">Hint ${hintIx + 1}/${p.hints.length}</span>${rich(p.hints[hintIx], p.figs)}`;
      host.querySelector('.p-hints').appendChild(d);
      renderMath(d);
      hintIx++;
      if (hintIx >= p.hints.length) { hb.disabled = true; hb.textContent = 'No more hints'; }
    });

    const sb = host.querySelector('.solbtn');
    sb && sb.addEventListener('click', () => {
      const sol = host.querySelector('.p-sol');
      sol.hidden = !sol.hidden;
      if (!sol.hidden) { viewedSol = viewedSol || !host.classList.contains('solved'); renderMath(sol); }
      sb.textContent = sol.hidden ? 'Solution' : 'Hide solution';
    });

    const nb = host.querySelector('.newp');
    nb && nb.addEventListener('click', () => ctx.onNew());
  }

  function meterDots(c, need) {
    let s = '';
    for (let i = 0; i < need; i++) s += `<i class="${i < c ? 'on' : ''}"></i>`;
    return s + (c > need ? `<em>+${c - need}</em>` : '');
  }

  function partHtml(pt, i) {
    const lbl = pt.lbl ? `<span class="pl">${pt.lbl.includes('$') ? pt.lbl : `$${pt.lbl}$`}${pt.mc ? '' : ' ='}</span>` : '';
    if (pt.mc) {
      return `<div class="part mc" data-part="${i}">${pt.lbl ? `<div class="mc-q">${inline(pt.lbl)}</div>` : ''}<div class="opts">${pt.mc.map((o, j) => `<button type="button" class="opt" data-j="${j}">${inline(o)}</button>`).join('')}</div><span class="mark"></span></div>`;
    }
    if (pt.expr !== undefined) {
      const vars = Object.keys(pt.vars).map((v) => `<code>${v}</code>`).join(' ');
      return `<div class="part expr" data-part="${i}">${lbl}<input type="text" autocomplete="off" spellcheck="false" aria-label="${U.esc(pt.lbl || 'answer')}"><span class="mark"></span><div class="expr-meta"><span class="vars">Variables: ${vars}</span><span class="preview"></span></div></div>`;
    }
    return `<div class="part num" data-part="${i}">${lbl}<input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="${U.esc(pt.lbl || 'answer')}">${pt.unit ? `<span class="unit">$${unitTeX(pt.unit)}$</span>` : ''}<span class="mark"></span></div>`;
  }

  function checkPart(pt, box) {
    if (pt.mc) {
      const sel = box.querySelector('.opt.sel');
      if (!sel) return { ok: false, msg: 'Pick an option.' };
      const j = +sel.dataset.j;
      return j === pt.a ? { ok: true } : { ok: false, msg: pt.why && pt.why[j] ? pt.why[j] : 'Not that one.' };
    }
    const v = box.querySelector('input').value;
    if (!v.trim()) return { ok: false, msg: 'Enter an answer.' };
    if (pt.expr !== undefined) return Expr.checkExpr(v, pt.expr, pt);
    let u;
    try { u = Expr.parseNumber(v); } catch (e) { return { ok: false, err: e.message }; }
    if (pt.accept && pt.accept.some((a) => Math.abs(u - a) <= 0.015 * Math.abs(a) + 1e-12)) return { ok: true };
    return Expr.compareNumber(u, pt._ans, pt.tol || {});
  }

  // ---------------------------------------------------------------- router
  function route() {
    const h = location.hash || '#/';
    const m = /^#\/l\/(.+)$/.exec(h);
    document.body.classList.remove('nav-open');
    if (m && BYID.has(m[1])) renderLesson(BYID.get(m[1]));
    else renderHome();
  }

  // ---------------------------------------------------------------- theme
  function initTheme() {
    let t = null;
    try { t = localStorage.getItem('ece342.theme'); } catch (e) { /* ignore */ }
    document.documentElement.dataset.theme = t || 'dark';
    document.getElementById('theme').addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme
        || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      const nt = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = nt;
      try { localStorage.setItem('ece342.theme', nt); } catch (e) { /* ignore */ }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    Store.load();
    indexCourse();
    initTheme();
    document.getElementById('navtoggle').addEventListener('click', () => document.body.classList.toggle('nav-open'));
    window.addEventListener('hashchange', route);
    route();
    // KaTeX fonts change label widths once loaded: tidy the figures again
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => window.declutter && window.declutter(document.getElementById('main')));
  });

  window.Engine = { mdToHtml, rich, renderMath, Store, LESSONS, BYID };
})();

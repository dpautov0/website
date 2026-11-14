/* e3-drill.js — the two memory engines from ECE 342, for the Exam 3 pages.
   Recognition gym: one question at a time, tap an answer (or press 1-7), see why, next. Each deck keeps accuracy, streak
   and speed in this browser, and the mixed gym serves the weakest deck most. A deck is
     { id, title, chip, rule (md), make() }; make() returns { figHtml?, q (md), opts: [md], a: index, why: [md | null] }.
   Decks are registered in window.GYM = { DECKS: [...], byId: {...} } (see js/e3-gym-decks.js).
   Flashcards: Leitner boxes. "Missed it" puts the card back a few cards later; "Got it" twice in a row marks it known.
   A card is { id, cat, t, figHtml?, q (md), a (md), why (md) }; CATS maps cat -> pile name.
   E3Drill.gym(el, deckIds, chips)   E3Drill.cards(el, CARDS, CATS) */
(function () {
  'use strict';
  const KEY = 'ece329.gym.e3.v1';
  const KEYC = 'ece329.cards.e3.v1';
  const median = (a) => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const inl = (s) => Engine.mdToHtml(s).replace(/^<p>([\s\S]*)<\/p>$/, '$1');
  const loadC = () => { try { return JSON.parse(localStorage.getItem(KEYC)) || {}; } catch (e) { return {}; } };
  const saveC = (s) => { try { localStorage.setItem(KEYC, JSON.stringify(s)); } catch (e) { /* private mode */ } };

  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } };

  // deckIds: the decks this widget serves; chips: let the student switch decks on and off
  function gymMount(el, deckIds, chips) {
    const st = Object.assign({ d: {}, sel: null, auto: false }, load());
    const decks = deckIds.map((id) => window.GYM.byId[id]).filter(Boolean);
    let on = chips && st.sel ? decks.filter((d) => st.sel.includes(d.id)) : decks.slice();
    if (!on.length) on = decks.slice();
    let streak = 0, cur = null, t0 = 0, timer = null, answered = false, autoT = null;
    const D = (id) => (st.d[id] = st.d[id] || { n: 0, ok: 0, best: 0, t: [] });
    const acc = (id) => { const d = D(id); return d.n ? d.ok / d.n : null; };

    el.innerHTML = `
      <div class="gym">
        ${chips ? `<div class="gym-chips">${decks.map((d) => `<button type="button" class="gym-chip" data-id="${d.id}"><span class="gym-chip-t">${d.chip}</span><span class="gym-chip-a"></span></button>`).join('')}</div>` : ''}
        <div class="gym-stats"><span><b class="g-streak">0</b> in a row</span><span>best <b class="g-best">0</b></span><span><b class="g-acc">–</b> right</span><span>median <b class="g-time">–</b></span></div>
        <div class="gym-stage"></div>
        <p class="gym-foot"><label class="gym-auto"><input type="checkbox"> Go on by itself when I'm right</label><button type="button" class="btn subtle gym-reset">Reset these stats</button><span class="gym-keys">Keys: 1–5 answer, Enter next</span></p>
      </div>`;
    const stage = el.querySelector('.gym-stage');
    const autoBox = el.querySelector('.gym-auto input');
    autoBox.checked = !!st.auto;
    autoBox.addEventListener('change', () => { st.auto = autoBox.checked; save(st); });

    function stats() {
      const ids = on.map((d) => d.id);
      const n = ids.reduce((s, id) => s + D(id).n, 0), ok = ids.reduce((s, id) => s + D(id).ok, 0);
      const times = ids.flatMap((id) => D(id).t);
      el.querySelector('.g-streak').textContent = streak;
      el.querySelector('.g-best').textContent = Math.max(0, ...ids.map((id) => D(id).best));
      el.querySelector('.g-acc').textContent = n ? `${Math.round((100 * ok) / n)}%` : '–';
      const m = median(times);
      el.querySelector('.g-time').textContent = m === null ? '–' : `${m.toFixed(1)} s`;
      el.querySelectorAll('.gym-chip').forEach((b) => {
        const id = b.dataset.id, a = acc(id);
        b.classList.toggle('on', on.some((d) => d.id === id));
        b.querySelector('.gym-chip-a').textContent = a === null ? 'new' : `${Math.round(a * 100)}%`;
        b.classList.toggle('weak', a !== null && a < 0.7 && D(id).n >= 5);
      });
    }
    // weakest decks more often: low accuracy and few attempts both raise the weight
    function chooseDeck() {
      const w = on.map((d) => { const x = D(d.id), a = (x.ok + 1) / (x.n + 2); return 1 + 3 * (1 - a) + (x.n < 8 ? 1.5 : 0); });
      let r = Math.random() * w.reduce((s, x) => s + x, 0);
      for (let i = 0; i < on.length; i++) { r -= w[i]; if (r <= 0) return on[i]; }
      return on[on.length - 1];
    }
    function next() {
      clearTimeout(autoT);
      const deck = chooseDeck();
      let item = null;
      for (let k = 0; k < 5 && !item; k++) { try { item = deck.make(); } catch (e) { console.error(e); } }
      if (!item) { stage.innerHTML = '<p class="err">Could not draw a problem.</p>'; return; }
      cur = { deck, item };
      answered = false;
      const fig = item.figHtml ? `<figure class="fig">${item.figHtml}</figure>` : '';
      stage.innerHTML = `
        <div class="gym-card">
          <p class="gym-meta"><span>${deck.title}</span><span class="gym-timer">0.0 s</span></p>
          ${fig}
          <div class="gym-q">${Engine.mdToHtml(item.q)}</div>
          <div class="gym-opts">${item.opts.map((o, j) => `<button type="button" class="gym-opt" data-j="${j}"><kbd>${j + 1}</kbd><span>${inl(o.replace(/\\tfrac/g, '\\dfrac'))}</span></button>`).join('')}</div>
          <div class="gym-fb" hidden></div>
          <p class="gym-nextrow" hidden><button type="button" class="btn primary gym-next">Next →</button></p>
        </div>`;
      stage.querySelectorAll('.gym-opt').forEach((b) => b.addEventListener('click', () => answer(+b.dataset.j)));
      stage.querySelector('.gym-next').addEventListener('click', next);
      Engine.renderMath(stage);
      t0 = performance.now();
      clearInterval(timer);
      const tEl = stage.querySelector('.gym-timer');
      timer = setInterval(() => { if (!el.isConnected) { clearInterval(timer); return; } tEl.textContent = `${((performance.now() - t0) / 1000).toFixed(1)} s`; }, 100);
      stats();
    }
    function answer(j) {
      if (answered || !cur) return;
      answered = true;
      clearInterval(timer);
      const secs = (performance.now() - t0) / 1000;
      const { item, deck } = cur, ok = j === item.a, d = D(deck.id);
      d.n++;
      if (ok) { d.ok++; streak++; d.t = d.t.concat(Math.round(secs * 10) / 10).slice(-30); } else streak = 0;
      d.best = Math.max(d.best, streak);
      save(st);
      stage.querySelectorAll('.gym-opt').forEach((b, k) => {
        b.disabled = true;
        if (k === item.a) b.classList.add('right');
        else if (k === j) b.classList.add('wrong');
      });
      const fb = stage.querySelector('.gym-fb');
      fb.hidden = false;
      fb.className = `gym-fb ${ok ? 'good' : 'bad'}`;
      const slow = ok && secs > 8 ? ' <span class="gym-slow">Right, but slow: aim to see it in under 8 seconds.</span>' : '';
      fb.innerHTML = `<p class="gym-verdict"><b>${ok ? 'Right.' : 'Not that one.'}</b> ${secs.toFixed(1)} s.${slow}</p>${!ok && item.why[j] ? `<div class="gym-why">${Engine.mdToHtml(item.why[j])}</div>` : ''}<div class="gym-rule"><span>The read</span>${Engine.mdToHtml(item.rule || deck.rule)}</div>`;
      stage.querySelector('.gym-nextrow').hidden = false;
      Engine.renderMath(fb);
      stats();
      if (ok && st.auto) autoT = setTimeout(() => { if (el.isConnected && answered && cur && cur.item === item) next(); }, 1500);
      else stage.querySelector('.gym-next').focus({ preventScroll: true });
    }
    el.querySelectorAll('.gym-chip').forEach((b) => b.addEventListener('click', () => {
      const d = window.GYM.byId[b.dataset.id];
      on = on.some((x) => x.id === d.id) ? on.filter((x) => x.id !== d.id) : on.concat(d);
      if (!on.length) on = [d];
      st.sel = on.map((x) => x.id);
      save(st);
      streak = 0;
      next();
    }));
    el.querySelector('.gym-reset').addEventListener('click', () => { on.forEach((d) => { st.d[d.id] = { n: 0, ok: 0, best: 0, t: [] }; }); save(st); streak = 0; stats(); });
    const onKey = (e) => {
      if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; }
      // typing in a text box is not an answer; a focused checkbox or button (the auto box, a chip) is no reason to ignore keys
      const tg = e.target || {};
      if (/textarea|select/i.test(tg.tagName || '') || (/input/i.test(tg.tagName || '') && !/checkbox|radio|button/i.test(tg.type || ''))) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[1-9]$/.test(e.key) && cur && !answered && +e.key <= cur.item.opts.length) { e.preventDefault(); answer(+e.key - 1); }
      else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') && answered) { e.preventDefault(); next(); }
    };
    document.addEventListener('keydown', onKey);
    next();
  }

  const KNOWN = 2;
  const figHtml = (c) => (c.figHtml ? `<figure class="fig">${c.figHtml}</figure>` : '');

  function cardsMount(el, CARDS, CATS) {
    const st = Object.assign({ box: {}, cats: Object.keys(CATS) }, loadC());
    const R = Engine.rich, M = Engine.renderMath;
    let queue = [], cur = null, shown = false, roundTotal = 0;
    const inDeck = () => CARDS.filter((c) => st.cats.includes(c.cat));
    const box = (c) => st.box[c.id] || 0;
    // seen = graded at least once; a missed card goes back to box 0 but counts as "learning", not "new"
    const seen = (c) => Object.prototype.hasOwnProperty.call(st.box, c.id);

    el.innerHTML = `
      <div class="fc">
        <div class="fc-chips">${Object.entries(CATS).map(([k, v]) => `<button type="button" class="fc-chip" data-cat="${k}">${v} <span>${CARDS.filter((c) => c.cat === k).length}</span></button>`).join('')}</div>
        <div class="fc-stats"><div class="fc-bar"><span class="k"></span><span class="l"></span></div><p class="fc-count"></p></div>
        <div class="fc-stage"></div>
        <p class="fc-foot"><button type="button" class="btn subtle fc-all">Study all cards again</button><button type="button" class="btn subtle fc-reset">Reset the deck</button><span class="fc-keys">Keys: Space shows the answer, ← missed, → got it</span></p>
      </div>`;
    const stage = el.querySelector('.fc-stage');

    function stats() {
      const d = inDeck();
      const k = d.filter((c) => box(c) >= KNOWN).length, l = d.filter((c) => seen(c) && box(c) < KNOWN).length;
      el.querySelector('.fc-bar .k').style.width = `${(100 * k) / Math.max(d.length, 1)}%`;
      el.querySelector('.fc-bar .l').style.width = `${(100 * l) / Math.max(d.length, 1)}%`;
      el.querySelector('.fc-count').innerHTML = `<b>${k}</b> known · <b>${l}</b> learning · <b>${d.length - k - l}</b> new <span class="fc-dim">(of ${d.length} cards in the selected piles)</span>`;
      el.querySelectorAll('.fc-chip').forEach((b) => b.classList.toggle('on', st.cats.includes(b.dataset.cat)));
    }
    function newRound(all) {
      const d = inDeck();
      const pool = all ? d : d.filter((c) => box(c) < KNOWN);
      // the least-known first, shuffled within each box
      queue = [0, 1, 2].flatMap((b) => U.shuffle(pool.filter((c) => Math.min(box(c), 2) === b)));
      roundTotal = queue.length;
      next();
    }
    function next() {
      stats();
      cur = queue.shift();
      shown = false;
      if (!cur) {
        const d = inDeck(), k = d.filter((c) => box(c) >= KNOWN).length;
        stage.innerHTML = `<div class="fc-card fc-donecard"><h3>${k === d.length ? 'Every card in these piles is known.' : 'Round done.'}</h3><p>${k} of ${d.length} known. ${k === d.length ? 'Shuffle the whole deck once more, or switch piles above. Tomorrow, run it again from the top: recall fades overnight.' : 'Start the next round: it deals only the cards you have not yet got twice in a row.'}</p><p><button type="button" class="btn primary fc-next">${k === d.length ? 'Shuffle all again' : 'Next round'}</button></p></div>`;
        stage.querySelector('.fc-next').addEventListener('click', () => newRound(k === d.length));
        return;
      }
      const c = cur;
      const n = roundTotal - queue.length;
      stage.innerHTML = `
        <div class="fc-card">
          <p class="fc-meta"><span>${CATS[c.cat]}</span><span>${n} / ${roundTotal}${seen(c) ? ` · ${box(c) >= KNOWN ? 'known' : box(c) ? 'got it once' : 'missed last time'}` : ''}</span></p>
          <h3 class="fc-t">${Engine.mdToHtml(c.t).replace(/^<p>|<\/p>$/g, '')}</h3>
          ${figHtml(c)}
          <div class="fc-q">${R(c.q)}</div>
          ${c.ex ? `<div class="fc-try"><input class="ans" type="text" autocomplete="off" spellcheck="false" placeholder="Optional: type ${c.exWhat || 'it'} first, then check" aria-label="Type your answer"><button type="button" class="btn fc-chk">Check</button><span class="fc-res" aria-live="polite"></span></div>` : ''}
          <p class="fc-actions"><button type="button" class="btn primary fc-flip">Show answer</button></p>
          <div class="fc-back" hidden>
            <div class="fc-a">${R(c.a)}</div>
            <div class="fc-why"><span>Why</span>${R(c.why)}</div>
            <p class="fc-grade"><button type="button" class="btn fc-miss">← Missed it</button><button type="button" class="btn primary fc-got">Got it →</button></p>
          </div>
        </div>`;
      const back = stage.querySelector('.fc-back');
      stage.querySelector('.fc-flip').addEventListener('click', flip);
      stage.querySelector('.fc-miss').addEventListener('click', () => grade(false));
      stage.querySelector('.fc-got').addEventListener('click', () => grade(true));
      const chk = stage.querySelector('.fc-chk');
      if (chk) {
        const inp = stage.querySelector('.fc-try input');
        const run = () => {
          const v = inp.value.trim();
          const res = stage.querySelector('.fc-res');
          if (!v) { res.textContent = ''; return; }
          const r = Expr.checkExpr(v, c.ex.expr, c.ex);
          res.className = `fc-res ${r.ok ? 'good' : 'bad'}`;
          res.textContent = r.ok ? 'Equivalent. ✓' : (r.err || r.msg || 'Not equivalent.');
        };
        chk.addEventListener('click', run);
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); run(); } e.stopPropagation(); });
      }
      M(stage);
      void back;
    }
    function flip() {
      if (!cur || shown) return;
      shown = true;
      const back = stage.querySelector('.fc-back');
      back.hidden = false;
      stage.querySelector('.fc-actions').hidden = true;
      M(back);
    }
    function grade(ok) {
      if (!cur || !shown) return;
      if (ok) st.box[cur.id] = Math.min(box(cur) + 1, KNOWN);
      else { st.box[cur.id] = 0; queue.splice(Math.min(3, queue.length), 0, cur); roundTotal++; }
      saveC(st);
      next();
    }
    el.querySelectorAll('.fc-chip').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.cat;
      st.cats = st.cats.includes(k) ? st.cats.filter((x) => x !== k) : st.cats.concat(k);
      if (!st.cats.length) st.cats = [k];
      saveC(st);
      newRound(false);
    }));
    el.querySelector('.fc-all').addEventListener('click', () => newRound(true));
    el.querySelector('.fc-reset').addEventListener('click', () => { st.box = {}; saveC(st); newRound(false); });
    const onKey = (e) => {
      if (!el.isConnected) { document.removeEventListener('keydown', onKey); return; }
      if (e.target && /input|textarea/i.test(e.target.tagName)) return;
      if (e.key === ' ' || e.key === 'Enter') { if (cur && !shown) { e.preventDefault(); flip(); } }
      else if (e.key === 'ArrowLeft') grade(false);
      else if (e.key === 'ArrowRight') grade(true);
    };
    document.addEventListener('keydown', onKey);
    newRound(false);
  }

  // all cards on one page, answers showing: the reading version of the deck

  window.E3Drill = { gym: gymMount, cards: cardsMount };
})();

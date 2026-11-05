/* The recognition gym (#/gym): one-tap drills that train SEEING a circuit. A random circuit, one question, tap an
   answer (or press 1–7), see why, next. Every deck keeps its own accuracy, streak and speed in this browser; the
   mixed gym serves the weakest deck most. Decks live in js/gym-e3.js. */
(function () {
  'use strict';
  const { R } = C;
  const KEY = 'ece342.gym.v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* private mode */ } };
  const median = (a) => { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  const inl = (s) => Engine.mdToHtml(s).replace(/^<p>([\s\S]*)<\/p>$/, '$1');

  // deckIds: the decks this widget serves; chips: let the student switch decks on and off
  function mount(el, deckIds, chips) {
    const st = Object.assign({ d: {}, sel: null, auto: false }, load());
    const decks = deckIds.map((id) => GYM.byId[id]).filter(Boolean);
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
        <p class="gym-foot"><label class="gym-auto"><input type="checkbox"> Go on by itself when I'm right</label><button type="button" class="btn subtle gym-reset">Reset these stats</button><span class="gym-keys">Keys: 1–7 answer, Enter next</span></p>
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
      const fig = item.fig ? `<figure class="fig">${Schem.render(item.fig, { maxW: 380 })}</figure>` : item.figHtml ? `<figure class="fig">${item.figHtml}</figure>` : '';
      stage.innerHTML = `
        <div class="gym-card">
          <p class="gym-meta"><span>${deck.title}</span><span class="gym-timer">0.0 s</span></p>
          ${fig}
          <div class="gym-q">${Engine.mdToHtml(item.q)}</div>
          <div class="gym-opts">${item.opts.map((o, j) => `<button type="button" class="gym-opt" data-j="${j}"><kbd>${j + 1}</kbd><span>${inl(o)}</span></button>`).join('')}</div>
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
      const slow = ok && secs > 8 ? ' <span class="gym-slow">Right, but slow: aim to see it in under 5 seconds.</span>' : '';
      fb.innerHTML = `<p class="gym-verdict"><b>${ok ? 'Right.' : 'Not that one.'}</b> ${secs.toFixed(1)} s.${slow}</p>${!ok && item.why[j] ? `<div class="gym-why">${Engine.mdToHtml(item.why[j])}</div>` : ''}<div class="gym-rule"><span>The read</span>${Engine.mdToHtml(item.rule)}</div>`;
      stage.querySelector('.gym-nextrow').hidden = false;
      Engine.renderMath(fb);
      stats();
      if (ok && st.auto) autoT = setTimeout(() => { if (el.isConnected && answered && cur && cur.item === item) next(); }, 1500);
      else stage.querySelector('.gym-next').focus({ preventScroll: true });
    }
    el.querySelectorAll('.gym-chip').forEach((b) => b.addEventListener('click', () => {
      const d = GYM.byId[b.dataset.id];
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
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (/^[1-9]$/.test(e.key) && cur && !answered && +e.key <= cur.item.opts.length) { e.preventDefault(); answer(+e.key - 1); }
      else if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') && answered) { e.preventDefault(); next(); }
    };
    document.addEventListener('keydown', onKey);
    next();
  }
  window.GymMount = mount;

  // ---------------------------------------------------------------- pages
  const ALL = GYM.DECKS.map((d) => d.id);
  E3.lesson('e3-gymu', {
    id: 'e3-gym', title: 'Recognition gym: every deck, mixed', kind: 'review', sub: 'One tap per circuit. MOSFET and BJT, impedances, stages, capacitors, Bode. Serves your weakest deck most',
    steps: [
      R(md`
        ### What this is for

        "I can't just recognize circuits" is a speed problem, and speed comes from reps. Each card is one circuit and one question you should answer **by looking**, not by solving: which stage is it, what does the arrow see, which branch wins at this node, what does this capacitor see, what slope comes next on the Bode plot. Tap an answer (or press 1–7), read **the read** underneath, press Enter for the next one.

        **How to use it.** Ten minutes a day until the exam. Target: 20 in a row with a median under 5 seconds. The chips are the decks: turn them on and off; each shows your accuracy, and a red one is a weak spot. The gym serves weak and new decks more often. Circuits come as NMOS, PMOS, NPN and PNP, mirrored left and right, so you have to read every picture fresh.
      `),
      C.W('<div class="gym-host"></div>', (el) => mount(el.querySelector('.gym-host'), ALL, true)),
      R(md`
        **One deck at a time:** ${GYM.DECKS.map((d) => `[${d.title}](#/l/e3-gym-${d.id})`).join(' · ')}.
      `),
    ],
  });
  GYM.DECKS.forEach((d) => E3.lesson('e3-gymu', {
    id: `e3-gym-${d.id}`, title: `Gym: ${d.title}`, kind: 'review', sub: d.rule.replace(/\$[^$]*\$/g, '…').replace(/\*\*/g, '').slice(0, 110).replace(/\s+\S*$/, '') + '…',
    hideHome: true,
    steps: [
      R('### The rule\n\n' + d.rule),
      C.W('<div class="gym-host"></div>', (el) => mount(el.querySelector('.gym-host'), [d.id], false)),
      R(md`[Back to the mixed gym](#/l/e3-gym)`),
    ],
  }));
})();

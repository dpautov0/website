/* Exam 3, loaded after every Exam 3 content file. Puts each study unit's lessons in topic order, builds the question bank
   (one quiz per lesson from EM.BANK, plus "random from the whole bank"), adds a mini quiz after every section and a mixed
   quiz closing every unit, and builds mixed practice (#/quiz). Mixed practice draws its rapid-fire cards and problems from
   whatever generators the lessons use, so a new lesson joins it automatically. The formula reference page is e3-sheet.js. */
(function () {
  'use strict';
  const { R, G } = C;
  const STUDY = ['e3s', 'w1', 'w2', 'w3', 'w4', 'w5'];
  const study = COURSE.units.filter((u) => STUDY.includes(u.id));

  // ---------------------------------------------------------------- not on this Exam 3 (Lectures 31-34)
  // This term's Exam 3 stops at Lecture 30 and HW 11. Any step a content file marks { later: true } (a past-exam problem on
  // stubs, a phasor-line card, ...) and any bank question marked the same way is taken out of its lesson here and collected,
  // under its source's title, in one lesson of the extra unit 'w6' (Lectures 31-34, for the Final).
  const later = COURSE.units.find((u) => u.id === 'w6');
  const moved = [];
  COURSE.units.filter((u) => u.exam === 'e3' && !u.extra).forEach((u) => u.lessons.forEach((l) => {
    const out = l.steps.filter((s) => s && s.later);
    if (!out.length) return;
    l.steps = l.steps.filter((s) => !(s && s.later));
    moved.push([l, out]);
    l.steps.splice(1, 0, R(md`!!key Not on this term's Exam 3
  ${out.length} step${out.length > 1 ? 's' : ''} of this page covered Lectures 31–34 (ringing lines, stubs and input impedance, quarter- and half-wave transformers, phasor lines), which this term's Exam 3 does not cover. ${out.length > 1 ? 'They were' : 'It was'} moved to [Not on Exam 3](#/l/e3-later).`));
  }));
  Object.keys(EM.BANK).forEach((k) => {
    const out = EM.BANK[k].filter((q) => q.later);
    if (!out.length) return;
    EM.BANK[k] = EM.BANK[k].filter((q) => !q.later);
    moved.push([{ id: k, title: `question bank: ${k}` }, out]);
  });
  if (later) {
    later.lessons.unshift({
      id: 'e3-later', order: -1, title: 'Moved here: everything past Lecture 30', kind: 'read', sub: 'Problems, cards and questions on Lectures 31–34, kept for the Final',
      steps: [R(md`This term's Exam 3 covers **Lectures 20–30 and HW 8–11** only. Everything below was on a page of the Exam 3 path but uses Lectures 31–34: periodic oscillations on lines, input impedance, stubs and filters, quarter- and half-wave transformers, $\Gamma(d)$, $Z(d)$ and VSWR. **Skip it for Exam 3.** It comes back on the Final.${moved.length ? '' : '\n\nNothing has been moved yet.'}`),
        ...[].concat(...moved.map(([l, out]) => [R(md`## From ${l.unit ? `[${l.title}](#/l/${l.id})` : l.title}`), ...out]))],
    });
  }

  // topic order inside each unit (stable: lessons without an order keep their place)
  const key = (l, i) => (l.order ?? (typeof l.topic === 'number' ? l.topic : i / 1000));
  study.forEach((u) => { u.lessons = u.lessons.map((l, i) => [key(l, i), i, l]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]); });
  // tool units (practice, past exams, speed, reference): by their order, lessons without one stay last in load order
  COURSE.units.filter((u) => u.exam === 'e3' && u.tools).forEach((u) => {
    u.lessons = u.lessons.map((l, i) => [l.order ?? 1e5 + i, i, l]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]);
  });

  // ---------------------------------------------------------------- question bank
  const bankUnit = COURSE.units.find((u) => u.id === 'e3-mcq');
  const topics = [].concat(...study.map((u) => u.lessons)).filter((l) => (EM.BANK[l.id] || []).length);
  const total = topics.reduce((s, l) => s + EM.BANK[l.id].length, 0);
  bankUnit.lessons.push({
    id: 'e3-mcq-all', title: 'Random from the whole bank', kind: 'quiz', sub: `${total} questions`,
    steps: [R(md`${total} questions across ${topics.length} lessons, drawn at random with no repeats until the pool runs out. Options are shuffled every time; every option explains itself after you answer. Each card links to its lesson.`), G('concept', { units: ['e3-mcq'], need: 40 })],
  });
  topics.forEach((l) => bankUnit.lessons.push({
    id: `e3-mcq-${l.id}`, title: `${l.topic ?? ''}${l.topic !== undefined ? ' · ' : ''}${l.title}`, kind: 'quiz', hideHome: true,
    steps: [R(md`${EM.BANK[l.id].length} questions on [${l.title}](#/l/${l.id}). Options are shuffled every time.`), ...EM.BANK[l.id]],
  }));

  // ---------------------------------------------------------------- mini quizzes
  const gensOf = (ls) => { const g = new Set(); ls.forEach((l) => l.steps.forEach((s) => { if (s.t === 'gen' && s.name !== 'concept') (s.opts.pool || [s.name]).forEach((n) => g.add(n)); })); return [...g]; };
  const allGens = gensOf([].concat(...study.map((u) => u.lessons)));
  const RFG = allGens.filter((g) => /^rf_/.test(g)), PG = allGens.filter((g) => !/^rf_/.test(g));
  // Each bank question is tagged with its lesson, so a quiz can draw from one lesson or one unit. Bank questions are never
  // shown in the lesson itself, so every mini-quiz question is new to the reader.
  topics.forEach((l) => EM.BANK[l.id].forEach((q) => { q.tags = [l.id]; }));
  study.forEach((u) => u.lessons.forEach((l) => {
    if (!(EM.BANK[l.id] || []).length) return;
    l.steps.push(
      R(md`### Mini quiz

Five questions on this section that you have not seen above, drawn at random from its [question bank](#/l/e3-mcq-${l.id}). No hints. Five right completes it; a wrong pick explains itself, and the next card is a new question.`),
      Object.assign(G('concept', { units: ['e3-mcq'], tags: [l.id], need: 5 }), { id: `${l.id}.quiz` }),
    );
  }));
  study.forEach((u) => {
    const ls = u.lessons.filter((l) => (EM.BANK[l.id] || []).length);
    if (ls.length < 2) return;
    const probs = gensOf(u.lessons).filter((g) => !/^rf_/.test(g));
    u.lessons.push({
      id: `e3-quiz-${u.id}`, topic: '✓', order: 1e6, title: `${u.num} quiz`, kind: 'quiz', ref: `${ls.length} sections, mixed`,
      steps: [
        R(md`Questions from every section of ${u.num} (${ls.map((l) => `[${l.title}](#/l/${l.id})`).join(', ')}), mixed, with nothing telling you which section they come from. Each card links back to its section.

### Concepts`),
        Object.assign(G('concept', { units: ['e3-mcq'], tags: ls.map((l) => l.id), need: 12 }), { id: `e3-quiz-${u.id}.c` }),
        ...(probs.length ? [R(md`### Problems`), Object.assign(G(probs[0], { pool: probs, need: 4 }), { id: `e3-quiz-${u.id}.p` })] : []),
      ],
    });
  });

  // ---------------------------------------------------------------- mixed practice
  EM.lesson('e3-x', {
    id: 'e3-mix', title: 'Mixed practice', kind: 'review', sub: 'Every topic, shuffled, the way the exam asks',
    steps: [
      R(md`
        Questions from every topic in random order, with nothing telling you which topic they come from. That is how the exam asks them. Every card links back to its lesson, so a miss shows you exactly what to reread.

        ### Concepts
      `),
      G('concept', { need: 20, units: ['e3-mcq'] }),
      ...(RFG.length ? [R(md`### Rapid fire from every topic`), G(RFG[0], { pool: RFG, need: 25 })] : []),
      ...(PG.length ? [R(md`### Problems with new numbers`), G(PG[0], { pool: PG, need: 15 })] : []),
    ],
  });

  // ---------------------------------------------------------------- paper versions: every practice and past exam as a PDF
  // pdf/<id>.pdf (the paper, with the printed table at the end) and pdf/<id>-key.pdf (answers and worked solutions),
  // built by js/print-exam.js (index.html?print=<id>, &key=1) with headless Edge.
  COURSE.units.filter((u) => u.id === 'e3-prac' || u.id === 'e3-past').forEach((u) => u.lessons.forEach((l) => {
    if (!/^(mock|exam)$/.test(l.kind)) return;
    l.steps.unshift({ t: 'widget', html: `<div class="px-links"><span>Take it on paper:</span><a class="btn primary" href="pdf/${l.id}.pdf" target="_blank" rel="noopener">PDF exam</a><a class="btn" href="pdf/${l.id}-key.pdf" target="_blank" rel="noopener">PDF answer key</a></div>` });
  }));

  // a unit whose content file is missing would have no lessons; the home page and the sidebar need at least one
  for (let i = COURSE.units.length - 1; i >= 0; i--) if (!COURSE.units[i].lessons.length) COURSE.units.splice(i, 1);
})();

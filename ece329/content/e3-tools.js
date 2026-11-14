/* Exam 3, loaded after every Exam 3 content file. Puts each study unit's lessons in topic order, builds the question bank
   (one quiz per lesson from EM.BANK, plus "random from the whole bank"), adds a mini quiz after every section and a mixed
   quiz closing every unit, and builds mixed practice (#/quiz). Mixed practice draws its rapid-fire cards and problems from
   whatever generators the lessons use, so a new lesson joins it automatically. The formula sheet is in e3-sheet.js. */
(function () {
  'use strict';
  const { R, G } = C;
  const STUDY = ['e3s', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6'];
  const study = COURSE.units.filter((u) => STUDY.includes(u.id));

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

  // a unit whose content file is missing would have no lessons; the home page and the sidebar need at least one
  for (let i = COURSE.units.length - 1; i >= 0; i--) if (!COURSE.units[i].lessons.length) COURSE.units.splice(i, 1);
})();

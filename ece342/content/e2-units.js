/* Exam 2: the units, in study order. Exam 1's units (u0–u5, loaded before this file) are tagged exam 'e1' so the
   sidebar folds them into an "Exam 1" group and the home page lists them under review.
   Content files add lessons with E2.lesson(unitId, {...}).
   Problem ids in Exam 2 files start with "e2" and never contain "-P<digit>": the Exam 1 question bank (gens-lec.js)
   files any id matching that pattern under its own topics. */
(function () {
  'use strict';
  COURSE.units.forEach((u) => { if (!u.exam) u.exam = 'e1'; });

  const unit = (id, num, title, extra = {}) => C.unit(Object.assign({ id, exam: 'e2', num, title, lessons: [] }, extra));
  unit('e2start', 'Start', 'Start here: why amplifiers, and the map of every stage', { blurb: 'Read this first. Where every stage comes from, what job each one does, and the whole route on one page, before any formulas.' });
  unit('e2u6', 'Unit 6', 'The small-signal MOSFET', { blurb: 'Bias first, then small changes: what "incremental ground" means, one model for NMOS and PMOS, $r_{ds}$, and the test-source method.' });
  unit('e2u7', 'Unit 7', 'Terminal impedances', { blurb: 'Looking into the gate, drain and source; diodes; degeneration as an impedance scaler; $R_{UP}\\parallel R_{DN}$; gates that move with the test voltage.' });
  unit('e2u8', 'Unit 8', 'Single-stage amplifiers: the $G_MR_{out}$ method', { blurb: 'CS, degenerated CS, CG, CD and the cascode, each as $G_M$ and $R_{out}$; the loads (resistor, diode, current source); three ways to the same gain.' });
  unit('e2u9', 'Unit 9', 'Multi-transistor circuits', { blurb: 'Gain chains, two paths to one output, mirrors carrying signal, folded and gain-boosted cascodes, differential pairs, and the DC bias problem.' });
  unit('e2-cardsu', 'Exam 2', 'Flashcards', { tools: true });
  unit('e2-pracu', 'Exam 2', 'Practice exams 1–5 (worked)', { tools: true });
  unit('e2-mocku', 'Exam 2', 'New practice exams', { tools: true });
  unit('e2-hwu', 'Exam 2', 'Homework 4–6', { tools: true });
  unit('e2-xu', 'Exam 2', 'Stage sheet and mixed practice', { tools: true });

  // Symbolic answer boxes. Variable ranges keep g_m r_ds between 200 and 1500, so the usual g_m r_ds >> 1
  // approximations land within 3% of the exact form and both are accepted (pass {exact: true} to demand the exact one).
  const rangeOf = (n) => {
    const l = n.toLowerCase();
    if (/^gm/.test(l)) return [2e-3, 5e-3];
    if (/^r(ds|o)\d*$/.test(l)) return [1e5, 3e5];
    if (/^r/.test(l)) return [1e3, 1e4];
    if (/^a/.test(l)) return [20, 100];
    if (/^k/.test(l)) return [0.1, 0.9];
    if (/^v/.test(l)) return [0.01, 0.1];
    return [0.5, 2];
  };
  const texOf = (n) => {
    let m;
    if ((m = /^gm(\w*)$/.exec(n))) return `g_{m${m[1]}}`;
    if ((m = /^rds(\w*)$/.exec(n))) return `r_{ds${m[1]}}`;
    if ((m = /^v(\w+)$/.exec(n))) return `v_{${m[1]}}`;
    if ((m = /^([A-Za-z])(\w+)$/.exec(n))) return `${m[1]}_{${m[2]}}`;
    return n;
  };

  window.E2 = {
    unit: (id) => COURSE.units.find((u) => u.id === id),
    lesson(uid, l) { const u = this.unit(uid); u.lessons.push(l); return l; },
    // E2.ex('rds + RS + gm*rds*RS', ['gm', 'rds', 'RS'], 'R_{DN}')
    ex(expr, names, lbl, o = {}) {
      const vars = {}, disp = {};
      names.forEach((n) => { vars[n] = o.ranges && o.ranges[n] ? o.ranges[n] : rangeOf(n); disp[n] = texOf(n); });
      return { lbl, expr, vars, disp, rtol: o.exact ? undefined : (o.rtol ?? 0.03) };
    },
    texOf,
  };
})();

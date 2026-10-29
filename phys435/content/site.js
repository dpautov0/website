/* PHYS 435 — how this site describes itself to the shared engine (../shared/engine.js). */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'PHYS 435', key: 'phys435', home: 'units', current: 'e2', unitsTitle: 'Study path', extraTitle: 'Extra (Exam I material)',
    actions: [{ href: '#/l/e2-format', label: 'Read this first' }, { href: '#/l/e2-speed', label: 'Speed tricks' }, { href: '#/l/e2-setups', label: 'Common setups' }, { href: '#/l/e2-mockC', label: 'Mock exams' }, { href: '#/quiz', label: 'Concept quiz' }, { href: '#/sheet', label: 'Formula sheet' }],
    aliases: { '#/mock': 'e2-mockC' },
    howto: 'Answers: the boxes work like Desmos. Type <code>/</code> for a fraction, <code>^</code> for a power, <code>sqrt</code> for a root, <code>pi</code>, <code>theta</code>, <code>lambda</code>, <code>sigma</code>, <code>omega</code>, <code>epsilon</code> for Greek, <code>_</code> for a subscript (<code>V_0</code>), and use the arrow keys to leave a fraction or power. Symbols are case-sensitive, so <code>r</code> and <code>R</code> differ. Constants: <code>eps0</code>, <code>mu0</code>; the dielectric constant is <code>epsr</code> and a susceptibility (χ_e or χ_m) is <code>chi</code>. Each box lists the variables it accepts. Multiple choice explains every wrong option. A drill doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'e1', title: 'Hour Exam I', past: true, scope: 'Lectures 1–13',
    sheet: 'x-sheet', quiz: 'x-quiz', drill: 'uD-start',
  });
  C.exam({
    id: 'e2', title: 'Hour Exam II', when: 'Mon Nov 9', date: '2026-11-09', scope: 'Lectures 14–27',
    blurb: 'Multipoles, polarization and dielectrics, Biot–Savart, Ampère, the vector potential, magnetic dipoles, magnetization and H. Kuo writes long exams, so this path teaches each topic and then the shortcut that makes it a one-liner.',
    sheet: 'e2-sheet', quiz: 'e2-quiz', drill: 'e2-rapid',
    planTitle: 'How to use it',
    plan: [
      '<b>Start with <a href="#/l/e2-format">Read this first</a>.</b> Exam I was four problems in 50 minutes (fields plus an ugly energy integral, overlapping slab and sphere, images, sphere in a uniform field). It maps each one to its Exam II version.',
      '<b>Units 1–8 in order.</b> Each opens with the physical picture, then builds the idea, gives the speed trick for it, and drills it with concept cards and homework-style problems, and ends with an <b>endless speed drill</b> (fresh numbers every time, with a target time per card). Every HW 6–9 and Discussion 5–7 problem is worked somewhere on the path.',
      '<b>Unit 9: the exam-format problems.</b> Given a field (div, curl, potential, energy) and overlapping shapes: the two Exam I problems that are pure technique.',
      '<b>Unit 10 under time.</b> Eight 50-minute mocks on paper with only the formula sheet: start with C (Exam I, problem by problem), then D, E, F, G (the deliberately-too-long one), A, B, and save H for the night before. Practice the triage: standard results first on every problem, then recipes, then the hard parts. The <a href="#/l/e2-speed">speed tricks</a> and <a href="#/l/e2-setups">setups table</a> are where the time comes from.',
      '<b>Last day:</b> the rapid-fire round and the concept quiz until nothing surprises you; the memorize page.',
    ],
  });
})();

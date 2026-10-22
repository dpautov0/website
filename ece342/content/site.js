/* ECE 342 — how this site describes itself to the shared engine (../shared/engine.js).
   Exam 2 is the current exam. Exam 1's units (u0–u5) stay on the site as review: e2-units.js tags them exam 'e1'. */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'ECE 342', key: 'ece342', home: 'units', unitsTitle: 'Study path', current: 'e2', shuffle: true,
    title: 'ECE 342 · Exam 2',
    eyebrow: 'Electronic Circuits',
    actions: [
      { href: '#/cards', label: 'Flashcards: canonical stages' },
      { href: '#/look', label: 'Drill: which end is which (NMOS/PMOS)' },
      { href: '#/l/e2-p1', label: 'Practice exams 1–5' },
      { href: '#/l/e2-mockA', label: 'New practice exams' },
      { href: '#/l/e2-hw4', label: 'Homework 4–6' },
      { href: '#/sheet', label: 'Stage sheet' },
      { href: 'stages.html', label: 'Printable sheet' },
    ],
    aliases: { '#/sp26': 'u5-s26-paper', '#/cards': 'e2-cards', '#/prac': 'e2-p1', '#/look': 'e2-u7-look' },
    howto: 'Numbers: in the unit shown, arithmetic allowed (<code>19/3</code>, <code>sqrt(0.04)</code>), within 1.5%. Expressions: <code>gm*RD</code> or <code>gm RD</code>; <code>||</code> is parallel, so <code>rds || 1/gm</code> works. Where a problem says so, the $g_mr_{ds} \\gg 1$ approximation is accepted as well as the exact form. A drill doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'e2', title: 'Exam 2',
    when: 'Thu Oct 22, 7–8 pm, 1002 ECEB', date: '2026-10-22T19:00:00-05:00',
    scope: 'Lectures 11–20, HW 4–6: MOSFET small-signal amplifiers',
    blurb: 'Three problems in 60 minutes (Practice 1 and 2 say no calculator, so practise without one). The formula sheet only gives the square law and $g_m = 2I_D/V_{ov}$: every stage result below has to be in your head.',
    sheet: 'e2-sheet', quiz: 'e2-mix',
    planTitle: 'Two days, in this order',
    plan: [
      '<b>Flashcards first, every session.</b> The canonical stages (looking into a gate, drain, source, diode, degenerated drain, CS/CG/CD, cascode, the "K" gate rule) are the whole exam. Go until every card is in the "known" pile, then shuffle again tomorrow.',
      '<b>Unit 6–7</b> (the model, then terminal impedances): read the build-up, predict before you look, drill until automatic. This is Problem 2 on every practice exam.',
      '<b>Unit 8–9</b> (gain: GmRout, stages, chains, superposition of paths). This is Problem 3.',
      '<b>Practice exams 1–5</b> under time, 60 minutes each, no calculator. Each problem is typed with a worked solution and every answer was checked against an exact circuit solve.',
      '<b>New practice exams A–C</b> for fresh circuits in the same style, then <b>HW 4–6</b> blank.',
      '<b>Exam morning:</b> the printable stage sheet, then one more pass of the flashcards.',
    ],
  });
  C.exam({ id: 'e1', title: 'Exam 1', past: true, scope: 'HW 1–3, through MOSFET DC analysis (review)' });
})();

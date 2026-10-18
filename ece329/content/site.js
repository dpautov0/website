/* The course, its exam, and the units in study order. Every content file adds its lessons to a unit declared here with
   EM.lesson(unitId, {...}); tools.js (loaded last) sorts each unit's lessons by topic number and builds the formula
   sheet, the question bank and mixed practice. Exam 2 is the current exam; it is cumulative (Lectures 1–20, HW 1–7),
   so Exam 1's material gets a condensed unit of its own. */
(function () {
  'use strict';

  COURSE.meta = {
    name: 'ECE 329',
    key: 'ece329',
    shuffle: true,
    current: 'e2',
    eyebrow: 'Fields and Waves I',
    macros: {
      '\\emf': '\\mathcal{E}', '\\mo': '\\mu_0', '\\eo': '\\epsilon_0', '\\Js': '\\mathbf{J}_s',
      '\\xh': '\\hat{x}', '\\yh': '\\hat{y}', '\\zh': '\\hat{z}', '\\rh': '\\hat{r}', '\\ph': '\\hat{\\phi}', '\\nh': '\\hat{n}',
    },
    actions: [
      { href: '#/l/past-f25', label: 'Fall 2025 exam' },
      { href: '#/l/prac-chen-a', label: 'Prof. Chen-style exams' },
      { href: '#/l/prac-f25a', label: 'Fall 2025-style exams' },
      { href: '#/l/past-sp18', label: 'Older exams' },
      { href: '#/l/hw4', label: 'Homework' },
      { href: '#/l/mcq-all', label: 'Question bank' },
      { href: '#/quiz', label: 'Mixed practice' },
      { href: '#/sheet', label: 'Formula sheet' },
      { href: 'notecard.html', label: 'Your 4×6 notecard' },
      { href: 'cheatsheet.html', label: 'Full cheat sheet' },
    ],
    howto: 'Answers: type numbers as <code>2.5e-6</code>, <code>2.5*10^-6</code> or arithmetic like <code>4*pi*1e-7*3/(2*pi*0.1)</code>; <code>pi</code> works. The unit is printed next to each box; answers within about 2% count. Constants unless a problem says otherwise: $\\mu_0 = 4\\pi\\times10^{-7}$ H/m, $\\epsilon_0 = 8.854\\times10^{-12}$ F/m, $c = 3\\times10^8$ m/s, $\\eta_0 = 120\\pi\\ \\Omega$. Multiple choice explains every wrong option. A randomized problem doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'e2', title: 'Exam 2',
    scope: 'Lectures 1–20 and HW 1–7 (cumulative)',
    blurb: 'Everything since Exam 1 in seventeen topics: fields in matter, magnetostatics, induction, the full Maxwell equations and plane waves. Each topic defines its notation, builds the idea in a few steps with a prediction at each, works one exam problem in full, then drills it: rapid-fire cards with new situations every time and problems with new numbers. Exam 1\'s material is condensed into one unit at the end.',
    sheet: 'e2-sheet', quiz: 'e2-mix',
    planTitle: 'Plan',
    plan: [
      '<b>Unit 0 first</b> if right-hand rules, flux integrals or delta functions feel shaky. It is short.',
      '<b>Topics 1–17 in order.</b> Read the build-up, answer each prediction before you look, then drill the rapid-fire cards until they are automatic.',
      '<b>The Fall 2025 exam</b> under time (75 min): the most recent Exam 2, same format as your Exam 1 (four problems, symbolic answers, one 4″×6″ handwritten card).',
      '<b>The two Prof. Chen-style exams</b> (he wrote your Exam 1), then <b>the two Fall 2025-style exams</b>, each under time. Then Spring 2018, the summer exams and practice exams A–C if time is left.',
      '<b>Homework 4–7</b> blank (HW 1–3 are there too): redo every problem you did not get cleanly the first time.',
      '<b>Mixed practice</b> and the <b>question bank</b> until nothing surprises you; the <b>formula sheet</b> shows what you are given and what to memorize.',
    ],
  });
  C.exam({ id: 'final', title: 'Final', scope: 'Lectures 21 on, plus everything before' });

  // the study path (exam: 'e2'), then the tool units (tools: true)
  const unit = (id, num, title, extra = {}) => C.unit(Object.assign({ id, exam: 'e2', num, title, lessons: [] }, extra));
  unit('u0', 'Unit 0', 'The language: vectors, integrals, deltas, waveforms');
  unit('u1', 'Unit 1', 'Fields in matter: dielectrics, capacitors, relaxation');
  unit('u2', 'Unit 2', 'Magnetostatics: forces, Ampère, flux');
  unit('u3', 'Unit 3', 'Induction: Faraday, emf, inductance');
  unit('u4', 'Unit 4', 'Maxwell complete: displacement current, magnetic materials');
  unit('u5', 'Unit 5', 'Plane waves and power');
  unit('u6', 'Unit 6', 'Exam 1 material, condensed');
  unit('e2-past', 'Exam 2', 'Past exams (blank, with solutions)', { tools: true });
  unit('e2-prac', 'Exam 2', 'Practice exams and exam-style problems', { tools: true });
  unit('e2-hw', 'Exam 2', 'Homework 1–7 (blank, with solutions)', { tools: true });
  unit('e2-mcq', 'Exam 2', 'Question bank', { tools: true });
  unit('e2-x', 'Exam 2', 'Formula sheet and mixed practice', { tools: true });
})();

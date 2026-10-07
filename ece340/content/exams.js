/* The course and its exams. Each chapter file registers units with exam: '<id>'; the home page, progress and the
   #/sheet and #/quiz links follow the current exam (meta.current, else the first exam that has units). To add
   Exam 2: write content/ch5.js and content/ch8.js with exam: 'e2' units, an e2 tools file with its sheet and mixed
   practice lessons, list them in index.html, fill in the e2 entry below and set meta.current = 'e2'. */
(function () {
  'use strict';

  COURSE.meta = {
    name: 'ECE 340',
    key: 'ece340',
    current: 'e1',
    cheatsheet: 'cheatsheet.html',
    eyebrow: 'Semiconductor Electronics',
    actions: [
      { href: '#/quiz', label: 'Mixed practice' },
      { href: '#/sheet', label: 'Formula sheet' },
      { href: 'cheatsheet.html', label: 'Cheat sheet' },
    ],
    howto: 'Answers: type numbers as <code>1.5e10</code>, <code>1.5*10^10</code> or <code>1.5x10^10</code>; arithmetic like <code>2.25e20/1e16</code> works too. The unit is printed next to each box. Answers within about 1% count (3 significant figures is enough). Constants unless a problem says otherwise: $kT = 0.0259$ eV at 300 K, $q = 1.6\\times10^{-19}$ C, Si $n_i = 1.5\\times10^{10}\\,\\text{cm}^{-3}$ and $E_g = 1.12$ eV. Multiple choice explains every wrong option. A randomized problem doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'e1', title: 'Exam 1', when: 'Thu Oct 15, 7–8 pm', date: '2026-10-15T19:00:00-05:00',
    scope: 'Ch. 1, 3, and 4.1–4.4.4',
    blurb: 'Streetman & Banerjee, <i>Solid State Electronic Devices</i> 7e: Ch. 1, 3, and 4 through 4.4.4. Twelve topics. Each teaches the ideas, works one exam-style problem, then drills you with conceptual and numerical questions.',
    sheet: 'e1-sheet', quiz: 'e1-mix',
    planTitle: 'Before Thursday',
    plan: [
      '<b>Topics 1–12 in order.</b> Read, work the example on paper, then answer every question in the lesson. A topic is done when they all are.',
      '<b>Mixed practice</b> pulls questions from every topic at random, the way the exam does. Reread whatever you miss.',
      '<b>Formula sheet</b> to see what the exam gives you and what to memorize, then the <b>cheat sheet</b> front and back.',
    ],
  });
  C.exam({ id: 'e2', title: 'Exam 2', scope: 'Ch. 5 (junctions) and Ch. 8 (optoelectronic devices)' });
  C.exam({ id: 'final', title: 'Final', scope: 'Ch. 6 and 7 (field-effect and bipolar transistors), plus everything before' });
})();

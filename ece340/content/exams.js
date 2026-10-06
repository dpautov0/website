/* The course and its exams. Each chapter file registers units with exam: '<id>'; the home page, progress bar,
   sidebar and the #/sheet, #/quiz, #/drill links follow the current exam (meta.current, else the first exam that
   has units). To add Exam 2: write content/ch5.js and content/ch8.js with exam: 'e2' units, an e2 tools file with
   its sheet / quiz / drill lessons, list them in index.html, fill in the e2 entry below and set meta.current = 'e2'. */
(function () {
  'use strict';

  COURSE.meta = {
    name: 'ECE 340',
    current: 'e1',
    cheatsheet: 'cheatsheet.html',
    howto: 'Answers: type numbers as <code>1.5e10</code>, <code>1.5*10^10</code> or <code>1.5x10^10</code>; arithmetic like <code>2.25e20/1e16</code> works too. The unit is printed next to each box. Answers within about 1% count (3 significant figures is enough). Constants used unless a problem says otherwise: $kT = 0.0259$ eV at 300 K, $q = 1.6\\times10^{-19}$ C, Si $n_i = 10^{10}\\,\\text{cm}^{-3}$. Multiple choice explains every wrong option. A drill doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'e1', title: 'Exam 1', when: 'Thu Oct 15, 7–8 pm', date: '2026-10-15T19:00:00-05:00',
    scope: 'Ch. 1, 3, and 4.1–4.4.4',
    blurb: 'Streetman & Banerjee, <i>Solid State Electronic Devices</i> 7e: Ch. 1, 3, and 4 through 4.4.4. Twelve topics, each a short lesson with a worked example in the graded format and check questions; then the drill and the concept quiz.',
    sheet: 'e1-sheet', quiz: 'e1-quiz', drill: 'e1-drill',
    planTitle: 'Before Thursday',
    plan: [
      '<b>Topics 1–12 in order.</b> Each ends with 3–5 check questions; the topic is done when they are.',
      '<b>Drill every skill to three dots.</b> New numbers each time, every solution in the graded format.',
      '<b>Concept quiz</b> for the multiple-choice reflexes, then the <b>cheat sheet</b> front and back.',
    ],
  });
  C.exam({ id: 'e2', title: 'Exam 2', scope: 'Ch. 5 (junctions) and Ch. 8 (optoelectronic devices)' });
  C.exam({ id: 'final', title: 'Final', scope: 'Ch. 6 and 7 (field-effect and bipolar transistors), plus everything before' });
})();

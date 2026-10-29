/* The course and its exams. Each chapter file registers units with exam: '<id>'; the home page, progress and the
   #/sheet and #/quiz links follow the current exam (meta.current, else the first exam that has units). Exam 2 lives in
   content/e2-a/b/c.js (topics 13–22), content/e2-tools.js (assembly, sheet, speed round, mixed practice, practice
   exam), js/rapid-e2.js and js/gens-e2.js. Exam 1 is marked past, so its units stay on the home page as review. */
(function () {
  'use strict';

  COURSE.meta = {
    name: 'ECE 340',
    key: 'ece340',
    shuffle: true,
    current: 'e2',
    cheatsheet: 'cheatsheet.html',
    eyebrow: 'Semiconductor Electronics',
    actions: [
      { href: '#/l/e2-speed', label: 'Speed round' },
      { href: '#/l/e2-mock', label: 'Practice exam' },
      { href: '#/quiz', label: 'Mixed practice' },
      { href: '#/sheet', label: 'Formula sheet' },
      { href: '#/e1/sheet', label: 'Exam 1 sheet' },
    ],
    howto: 'Answers: type numbers as <code>1.5e10</code>, <code>1.5*10^10</code> or <code>1.5x10^10</code>; arithmetic like <code>2.25e20/1e16</code> works too. The unit is printed next to each box. Answers within about 1% count (3 significant figures is enough). Constants unless a problem says otherwise: $kT = 0.0259$ eV at 300 K, $q = 1.6\\times10^{-19}$ C, Si $n_i = 1.5\\times10^{10}\\,\\text{cm}^{-3}$ and $E_g = 1.12$ eV. Multiple choice explains every wrong option. A randomized problem doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'e1', title: 'Exam 1', past: true, when: 'Thu Oct 15, 7–8 pm', date: '2026-10-15T19:00:00-05:00',
    scope: 'Ch. 1, 3, and 4.1–4.4.4',
    blurb: 'Streetman & Banerjee, <i>Solid State Electronic Devices</i> 7e: Ch. 1, 3, and 4 through 4.4.4. Twelve topics. Each builds the intuition from the physics up, with a prediction at every step, then drills every concept with endless rapid-fire questions you answer by reading a band diagram and doing mental math, then exam-style problems.',
    sheet: 'e1-sheet', quiz: 'e1-mix',
    planTitle: 'Before Thursday',
    plan: [
      '<b>Topics 1–12 in order.</b> Read the build-up, then hammer the <b>rapid-fire</b> cards (new situations every time) until the answers are automatic; then the worked example and the rest of the questions.',
      '<b>The 2015 exam</b>, then <b>practice exams A and B</b> under time (60 min), then the endless exam-style problems and the harder conceptual bank.',
      '<b>Mixed practice</b> pulls questions from every topic at random, the way the exam does. Reread whatever you miss.',
      '<b>Formula sheet</b> to see what the exam gives you and what to memorize, then the <b>cheat sheet</b> front and back.',
    ],
  });
  C.exam({
    id: 'e2', title: 'Exam 2', when: 'Tue Nov 17, 7–8 pm', date: '2026-11-17T19:00:00-06:00',
    scope: 'Ch. 4.4.5–4.4.6, 5 and 8',
    blurb: 'Streetman & Banerjee 7e: the rest of Ch. 4.4, Ch. 5 (p-n junctions, breakdown, capacitance and switching, metal–semiconductor contacts, the narrow-base diode) and Ch. 8 (photodiodes, solar cells, LEDs, lasers). Ten topics, built from the band picture up, with predict-first questions, then endless rapid-fire cause-and-effect cards (a knob turns: which way does each quantity go, and by how much?), worked examples in the graded format, and randomized exam-style problems.',
    sheet: 'e2-sheet', quiz: 'e2-mix',
    planTitle: 'Before November 17',
    plan: [
      '<b>Topics 13–22 in order.</b> Read the build-up slowly and answer every <b>predict first</b> question before you look. Then hammer the <b>rapid-fire</b> cards until the answer arrives before you finish reading.',
      '<b>Speed round</b> every day: the what-happens-if cards from all ten topics mixed. This is the intuition section of the exam.',
      '<b>Practice exam</b> under a 60-minute timer, then the endless exam-style problems in each topic and in <b>mixed practice</b>.',
      '<b>Formula sheet</b>: what the exam gives you, what to memorize, the numbers to have in your fingers, and 14 lines to say out loud the night before.',
    ],
  });
  C.exam({ id: 'final', title: 'Final', scope: 'Ch. 6 and 7 (field-effect and bipolar transistors), plus everything before' });
})();

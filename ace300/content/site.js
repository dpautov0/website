/* ACE 300 — how this site describes itself to the shared engine (../shared/engine.js). */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'ACE 300', key: 'ace300', shuffle: true, current: 'm2',
    eyebrow: 'Intermediate Applied Microeconomics',
    actions: [
      { href: '#/l/ds5', label: 'Homework & discussion problems' },
      { href: '#/l/x-a', label: 'Practice exams' },
      { href: '#/l/in-all', label: 'Intuition drills' },
      { href: '#/l/mc-all', label: 'Multiple-choice bank' },
      { href: '#/quiz', label: 'Mixed practice' },
      { href: '#/sheet', label: 'Formula sheet' },
    ],
    howto: 'Answers: type numbers like <code>2.4</code>, fractions like <code>2/3</code>, or arithmetic like <code>0.4*24/3</code>. When the answer is a formula, type it with the letters shown under the box, e.g. <code>30 - 3P</code> or <code>y/8</code>. Close answers (about 1%) count. Multiple choice explains every option after you answer, and the options are shuffled every time. Open the solution whenever you are stuck: reading a solution carefully, then redoing the problem without it, is how this material sticks. Progress is saved in this browser.',
  };

  C.exam({
    id: 'm2', title: 'Mini Exam 2', when: 'Wed Oct 21, 1:00–1:50 pm, 1100 Wymer Hall', date: '2026-10-21T13:00:00-05:00',
    scope: 'Income and price effects, market demand and elasticity, consumer welfare, production, cost minimization, cost curves',
    blurb: '50 minutes, 100 points. Question 1 is five multiple-choice items (20 points). Questions 2–6 are multipart written problems (80 points): calculations, graphs and short explanations. You get a pencil, a calculator and the formula sheet, nothing else. Everything on the study checklist is taught here step by step and then tested from several angles.',
    sheet: 'sheet', quiz: 'mix',
    planTitle: 'How to use this site',
    plan: [
      '<b>Go in order, one lesson at a time.</b> Each lesson explains the idea slowly, shows a worked example, and then stops every few paragraphs to ask you something. Answer before reading on. If a question feels hard, read its explanation, then try the next one.',
      '<b>At the end of every lesson there is a practice block</b> that makes new problems forever. Do them until three in a row feel easy.',
      '<b>Then the homework and discussion problems</b> (DS5, DS6, DS7 and homework-style sets). These are the closest thing to the exam. Do each on paper first, then check.',
      '<b>Then the practice exams</b>, timed at 50 minutes, on paper, with only the formula sheet. Grade yourself with the solutions and reread the lessons behind anything you missed.',
      '<b>Mixed practice and the multiple-choice bank</b> shuffle everything together, the way the exam does. Use them in the last day for quick drilling.',
      '<b>The formula sheet page</b> shows exactly what you will be given and, just as important, what you must remember yourself.',
    ],
  });
})();

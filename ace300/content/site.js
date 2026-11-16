/* ACE 300 — how this site describes itself to the shared engine (../shared/engine.js). */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'ACE 300', key: 'ace300', shuffle: true, current: 'm3',
    eyebrow: 'Intermediate Applied Microeconomics',
    actions: [
      { href: '#/l/m3-map', label: 'Problem-type map' },
      { href: '#/l/m3-gym', label: 'Recognition gym' },
      { href: '#/l/m3-spot-mix', label: 'Spot the technique' },
      { href: '#/l/m3-ds8', label: 'DS8–DS10' },
      { href: '#/l/m3-xa', label: 'Practice exams' },
      { href: '#/sheet', label: 'Formula sheet' },
    ],
    howto: 'Answers: type numbers like <code>2.4</code>, fractions like <code>2/3</code>, or arithmetic like <code>0.4*24/3</code>. When the answer is a formula, type it with the letters shown under the box, e.g. <code>30 - 3P</code> or <code>y/8</code>. Close answers (about 1%) count. Most Mini Exam 3 problems start with a <b>plan</b> question: pick how you would attack the problem before the answer boxes appear. A wrong pick tells you why it is wrong; keep picking until you find the move. Progress is saved in this browser.',
  };

  C.exam({
    id: 'm2', title: 'Mini Exam 2', past: true, when: 'Wed Oct 21, 1:00–1:50 pm, 1100 Wymer Hall', date: '2026-10-21T13:00:00-05:00',
    scope: 'Income and price effects, market demand and elasticity, consumer welfare, production, cost minimization, cost curves',
    blurb: '50 minutes, 100 points. Question 1 is five multiple-choice items (20 points). Questions 2–6 are multipart written problems (80 points): calculations, graphs and short explanations. You get a pencil, a calculator and the formula sheet, nothing else.',
    sheet: 'sheet', quiz: 'mix',
  });

  C.exam({
    id: 'm3', title: 'Mini Exam 3', when: 'Wed Nov 18, 1:00–1:50 pm, 1100 Wymer Hall', date: '2026-11-18T13:00:00-06:00',
    scope: 'Profit and input choice, short-run and long-run supply, producer surplus and welfare, taxes, ceilings, floors and price supports, monopoly, monopoly taxes and regulation',
    blurb: '50 minutes, 100 points. Question 1 is five multiple-choice items (20 points). Questions 2–6 are multipart written problems (80 points): calculations, graphs and brief explanations. Pencil, calculator and the provided formula sheet only. Lectures 14–19, DS8–DS10, HW8–HW10.',
    sheet: 'm3-sheet', quiz: 'm3-mix', drill: 'm3-gym',
    planTitle: 'How to use this site: recognize first, then solve',
    plan: [
      '<b>Start with the three “Start here” pages.</b> They teach the one idea behind every Exam 3 problem (compare the next unit’s benefit with its cost), the <b>problem-type map</b> (what a problem says → which move to make), and the eight graphs with every area named.',
      '<b>Then each Part in order.</b> Every lesson opens with “what this looks like on the exam”, builds the idea slowly from scratch, and shows worked examples with each move named. Every practice problem first asks <b>how you would solve it</b>; the answer boxes appear only once you have picked the move.',
      '<b>Spot the technique</b> pages are all plan and no arithmetic: forty-plus exam-style problems where you only decide what to do. Do them until the first move is instant.',
      '<b>The recognition gym</b> is one-tap drilling: a price and some cost numbers, a shaded graph, a policy, and you name what happens or what to do. Ten minutes a day; aim for 20 in a row under 6 seconds each.',
      '<b>Then DS8–DS10 and the practice exams</b>, on paper, timed at 50 minutes, with only the formula sheet. Every written question still starts with a plan question.',
      '<b>The formula sheet page</b> shows what you are given and, just as important, the rules that are <b>not</b> on it (shutdown, entry, which root, which quantity is traded).',
    ],
  });
})();

/* PHYS 486 — how this site describes itself to the shared engine (../shared/engine.js). */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'PHYS 486', key: 'phys486', current: 'm1',
    eyebrow: 'Quantum Physics I',
    actions: [{ href: '#/quiz', label: 'Mixed practice' }, { href: '#/sheet', label: 'Formula sheet' }, { href: '#/mock', label: 'Mock exam' }],
    aliases: { '#/mock': 'm1-mock' },
    macros: {
      '\\ket': '\\left|#1\\right\\rangle', '\\bra': '\\left\\langle #1\\right|', '\\braket': '\\left\\langle #1\\middle|#2\\right\\rangle',
      '\\ev': '\\left\\langle #1\\right\\rangle', '\\op': '\\hat{#1}',
    },
    howto: 'Answers: the boxes work like Desmos. Type <code>/</code> for a fraction, <code>^</code> for a power, <code>sqrt</code>, <code>pi</code>, <code>hbar</code>, <code>omega</code>, <code>theta</code>, <code>alpha</code> for Greek, and use the arrow keys to leave a fraction or power. Symbols are case-sensitive. Each symbolic box lists the variables it knows. Numbers count within about 1%. Multiple choice explains every wrong option. A problem doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'm1', title: 'Midterm 1',
    scope: 'Lectures 1–9: postulates, wave mechanics, wells, formalism, uncertainty, the qubit',
    blurb: 'Everything up to the uncertainty relation and the two-level system (Lecture 9). Ten topics. Each builds the intuition first, works an exam-style problem, then drills you with questions that climb from recognition to harder than the exam.',
    sheet: 'm1-sheet', quiz: 'm1-mix',
    planTitle: 'How to use it',
    plan: [
      '<b>Topics 1–10 in order.</b> Every lesson climbs in levels: <b>1</b> recognize, <b>2</b> set up, <b>3</b> standard, <b>4</b> one twist, <b>5</b> exam level, <b>6</b> harder than the exam. If a level goes badly, reread the section above it.',
      '<b>Weight.</b> The homework is the exam: normalizing and expectation values, the 3-step recipe in the infinite well, the finite well, Dirac notation and matrices, the uncertainty relation, Pauli matrices.',
      '<b>Mixed practice</b> pulls questions from every topic at random. Then the <b>mock exam</b> on paper, timed, with only the formula sheet.',
    ],
  });
})();

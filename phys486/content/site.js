/* PHYS 486 — how this site describes itself to the shared engine (../shared/engine.js). */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'PHYS 486', key: 'phys486', current: 'm2',
    eyebrow: 'Quantum Physics I',
    actions: [{ href: '#/l/m2-format', label: 'Read this first' }, { href: '#/mock', label: 'Practice midterms' }, { href: '#/l/m2-tf', label: 'True or false drill' }, { href: '#/drill', label: 'Endless drill' }, { href: '#/quiz', label: 'Mixed practice' }, { href: '#/sheet', label: 'Formula sheet' }, { href: 'cheatsheet-m2.html', label: 'Cheat sheet' }],
    aliases: { '#/mock': 'm2-pm1', '#/notation': 'm2-notation' },
    macros: {
      '\\ket': '\\left|#1\\right\\rangle', '\\bra': '\\left\\langle #1\\right|',   // \braket{a|b} is KaTeX's own (one argument)
      '\\ev': '\\left\\langle #1\\right\\rangle', '\\op': '\\hat{#1}',
    },
    howto: 'Answers: the boxes work like Desmos. Type <code>/</code> for a fraction, <code>^</code> for a power, <code>sqrt</code>, <code>pi</code>, <code>hbar</code>, <code>omega</code>, <code>theta</code>, <code>alpha</code> for Greek, and use the arrow keys to leave a fraction or power. Symbols are case-sensitive. Each symbolic box lists the variables it knows. Numbers count within about 1%. Multiple choice explains every wrong option. A problem doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'm1', title: 'Midterm 1', past: true,
    scope: 'Lectures 1–9: postulates, wave mechanics, wells, formalism, uncertainty, the qubit',
    blurb: 'Everything up to the uncertainty relation and the two-level system (Lecture 9). It starts with Unit 0, the language: complex phases, probability notation, vectors and operators (Dirac notation), Fourier transforms and the delta function. Then ten topics. Each opens by defining its notation, builds the intuition first, works an exam-style problem, then drills you with questions that climb from recognition to harder than the exam. Units 4–5 work every homework and discussion problem, and Unit 6 has ten practice midterms.',
    sheet: 'm1-sheet', quiz: 'm1-mix',
    planTitle: 'How to use it',
    plan: [
      '<b>Unit 0 first (A–D).</b> It assumes only classical mechanics, E&amp;M and calculus, and teaches every symbol the course uses. Skip a lesson only if its Level 5–6 questions are easy for you. The <b>Notation</b> page is a glossary of every symbol.',
      '<b>Then Topics 1–10 in order.</b> Every lesson climbs in levels: <b>1</b> recognize, <b>2</b> set up, <b>3</b> standard, <b>4</b> one twist, <b>5</b> exam level, <b>6</b> harder than the exam. If a level goes badly, reread the section above it.',
      '<b>Units 4–5: every homework and discussion problem, worked.</b> Try each on paper, then reveal the approach and solution; new-number practice follows. Each topic lesson ends with links to the problems that use it.',
      '<b>Weight.</b> The homework is the exam: normalizing and expectation values, the 3-step recipe in the infinite well, the finite well, Dirac notation and matrices, the uncertainty relation, Pauli matrices.',
      '<b>Mixed practice</b> pulls questions from every topic at random.',
      '<b>Unit 6: start with the real October 2022 midterm</b> (timed, ~55 min) to see the level, then its two variants, then ten practice midterms, timed, on paper, with only the formula sheet. 1–3 are exam level, 4–7 harder, 8–10 harder than the exam. Grade yourself from the solutions and redo anything under 20/25.',
    ],
  });
  C.exam({
    id: 'm2', title: 'Midterm 2',
    scope: 'Lecture 9 (from Ehrenfest) onward: oscillator, 3D, angular momentum, central potentials, hydrogen',
    blurb: 'Everything after the Midterm 1 cutoff (the middle of Lecture 9): the generalized Ehrenfest theorem and energy–time uncertainty, the harmonic oscillator (ladder operators, wavefunctions, motion, coherent states), quantum mechanics in 3D, angular momentum and spherical harmonics, the radial equation, the spherical box and hydrogen. Homework 5–7 and Discussions 5–8. Midterm 1 was three problems of four 5-point parts, graded on explanations, sketches and justified true/false as much as on algebra, so this path teaches the picture first and then drills exactly that format.',
    sheet: 'm2-sheet', quiz: 'm2-mix', drill: 'm2-drill',
    planTitle: 'How to use it',
    plan: [
      '<b>Start with <a href="#/l/m2-format">Read this first</a>.</b> It shows how Midterm 1 was built and graded (three problems × four parts × 5 points, rubric for every part), where the class lost points, and the Midterm 2 version of each problem. The real Midterm 1 is typed there with its rubric.',
      '<b>Units 1–4 in order: the picture, then the math.</b> Each topic opens with the physical idea, works an exam-style problem, lists the common mistakes, and climbs in levels: <b>1</b> recognize, <b>2</b> set up, <b>3</b> standard, <b>4</b> one twist, <b>5</b> exam level, <b>6</b> harder than the exam.',
      '<b>Units 5–6: every problem of Homework 5–7 and Discussions 5–8, worked.</b> Try each on paper first. The exam reuses these setups (Midterm 1 Problem 1 was a homework problem rebuilt as a two-level system).',
      '<b>Units 7–8: practice midterms in the Midterm 1 format.</b> Ten timed exams, each three problems of four parts with a rubric for every part, plus a true-or-false-with-justification drill and an explain-in-words drill (the parts the class scored lowest on). Grade yourself with the rubric; redo anything below 4/5 a day later.',
      '<b>Daily:</b> the endless drill (fresh numbers every time) and the mixed concept quiz, until nothing surprises you. Last night: the formula sheet and the printable cheat sheet.',
    ],
  });
})();

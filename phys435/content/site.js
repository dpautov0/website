/* PHYS 435 — how this site describes itself to the shared engine (../shared/engine.js). */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'PHYS 435', key: 'phys435', home: 'units', unitsTitle: 'Study path', extraTitle: 'Extra (not needed for the exam)',
    title: 'PHYS 435 · Hour Exam I',
    lede: 'Mon Oct 5. Delta functions, energy, uniqueness, boundary conditions in 2-D and 3-D, images, and separation of variables: everything ECE 329 did not cover. A formula sheet is provided.',
    actions: [{ href: '#/quiz', label: 'Concept quiz' }, { href: '#/sheet', label: 'Formula sheet' }, { href: 'cheatsheet.html', label: 'Cheat sheet' }],
    plan: {
      title: 'How to use it',
      items: [
        '<b>Units 1–8 in order.</b> Each teaches its topic from scratch, then ends with its practice set. Short on time: the lessons, then the hardest questions of each set.',
        '<b>Weight.</b> Recent exams were mostly Units 5–8: images and separation of variables.',
        '<b>Unit 9.</b> Last spring\'s exam and the mock exam on paper with just the formula sheet, then the concept quiz.',
      ],
      note: 'The Extra section holds ECE 329 review, repeats, and multipoles, none of which is needed for this exam.',
    },
    aliases: { '#/sheet': 'x-sheet', '#/quiz': 'x-quiz', '#/mock': 'x-mock', '#/drill': 'uD-start' },
    howto: 'Answers: the boxes work like Desmos. Type <code>/</code> for a fraction, <code>^</code> for a power, <code>sqrt</code> for a root, <code>pi</code>, <code>theta</code>, <code>lambda</code>, <code>sigma</code>, <code>epsilon</code> for Greek, <code>_</code> for a subscript (<code>V_0</code>), and use the arrow keys to leave a fraction or power. Symbols are case-sensitive, so <code>r</code> and <code>R</code> differ. Greek letters can be typed as <code>lambda</code>, <code>sigma</code>, <code>rho</code>, <code>theta</code>, <code>eps0</code>. Multiple choice explains every wrong option. A drill doesn\'t count once you open its solution. Progress is saved in this browser.',
  };
})();

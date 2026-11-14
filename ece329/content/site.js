/* The course, its exams, and the units in study order. Every content file adds its lessons to a unit declared here with
   EM.lesson(unitId, {...}). Exam 3 is the current exam: its units (e3s, w1–w6 and the e3-* tool units) are built by the
   files listed after tools.js in index.html, and e3-tools.js (loaded last) sorts them and builds the question bank, the
   quizzes, the formula sheet and mixed practice. Exam 2's units stay as review; tools.js builds their extras. */
(function () {
  'use strict';

  COURSE.meta = {
    name: 'ECE 329',
    key: 'ece329',
    shuffle: true,
    current: 'e3',
    home: 'units',
    unitsTitle: 'Exam 3 study path',
    title: 'ECE 329 · Exam 3',
    eyebrow: 'Fields and Waves I',
    macros: {
      '\\emf': '\\mathcal{E}', '\\mo': '\\mu_0', '\\eo': '\\epsilon_0', '\\Js': '\\mathbf{J}_s',
      '\\xh': '\\hat{x}', '\\yh': '\\hat{y}', '\\zh': '\\hat{z}', '\\rh': '\\hat{r}', '\\ph': '\\hat{\\phi}', '\\nh': '\\hat{n}',
      '\\Et': '\\tilde{\\mathbf{E}}', '\\Ht': '\\tilde{\\mathbf{H}}', '\\Vt': '\\tilde{V}', '\\It': '\\tilde{I}', '\\Re': '\\operatorname{Re}', '\\Im': '\\operatorname{Im}',
    },
    aliases: { '#/prac': 'e3-prac-a', '#/past': 'e3-past-sp24', '#/gym': 'e3-gym', '#/cards': 'e3-cards', '#/speed': 'e3-speed', '#/derive': 'e3-derive', '#/start': 'e3-map', '#/endless': 'e3-endless' },
    actions: [
      { href: '#/prac', label: 'Practice exams A–L' },
      { href: '#/past', label: 'Past exams, cleaned and solved' },
      { href: '#/speed', label: 'Speed tricks' },
      { href: '#/gym', label: 'Recognition gym' },
      { href: '#/endless', label: 'Endless exam problems' },
      { href: '#/cards', label: 'Flashcards' },
      { href: '#/derive', label: 'Every formula, derived' },
      { href: '#/quiz', label: 'Mixed practice' },
      { href: '#/sheet', label: 'Formula sheet' },
      { href: 'notecard-e3.html', label: 'Your 4×6 notecard' },
    ],
    howto: 'Answers: type numbers as <code>2.5e-6</code>, <code>2.5*10^-6</code> or arithmetic like <code>120*pi/2</code>; <code>pi</code> works. Formula boxes take expressions such as <code>mu0*H/(2*pi*r)</code> or <code>exp(-t/tau)</code>; the variables you may use are listed under the box. The unit is printed next to each box; answers within about 2% count. Constants unless a problem says otherwise: $\\mu_0 = 4\\pi\\times10^{-7}$ H/m, $\\epsilon_0 = \\tfrac{1}{36\\pi}\\times10^{-9}$ F/m, $c = 3\\times10^8$ m/s, $\\eta_0 = 120\\pi\\ \\Omega$. Every wrong multiple-choice option explains itself. A randomized problem doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'e3', title: 'Exam 3',
    when: 'Mon Nov 16, 7:00–8:15 pm', date: '2026-11-16T19:00:00-06:00',
    scope: 'Lectures 20–33: Poynting, phasors, lossy media, polarization, reflection, standing waves, transmission lines (bounce diagrams, stubs, quarter-wave transformers). The Smith chart is on the Final, not here',
    blurb: 'Written by Prof. Chen, in the format of his Spring 2024 Exam 3: four problems, 75 minutes, one 4″×6″ card of handwritten notes, no calculator. Every result here is derived from Maxwell\'s equations, one line at a time, before you are asked to use it. Then you practice it until it is automatic: predictions, rapid-fire cards, problems with new numbers, a quiz after each section, past exams, and a stack of practice exams.',
    sheet: 'e3-sheet', quiz: 'e3-mix', drill: 'e3-gym',
    planTitle: 'How to use the days you have',
    plan: [
      '<b>Start here:</b> <a href="#/l/e3-map">the map of Exam 3</a>, then complex numbers from zero. Everything else leans on them. Short on time? Go straight to the exams and use the lessons to fix what you miss.',
      '<b>Units 1–6, one lesson at a time.</b> Read each derivation with a pencil and redo it on paper without looking. Answer each prediction before you read on. Finish the lesson\'s mini quiz before moving on.',
      '<b>Every day, 10 minutes: the <a href="#/gym">recognition gym</a> and <a href="#/cards">flashcards</a>.</b> They train the instant reads: which way does it travel, which hand, which medium, what does the next bounce do.',
      '<b>Exams, timed (75 minutes), as many as you can.</b> Start with <a href="#/past">Prof. Chen\'s Spring 2024 exam</a>, then <a href="#/prac">practice exams A–L</a>, then the eight older papers. Redo every problem you lost points on, the next day, blank. <a href="#/endless">Endless exam problems</a> give you a fresh version of any problem type.',
      '<b>Speed:</b> learn the <a href="#/speed">speed tricks</a>, then drill them in the <a href="#/gym">gym</a> until each read takes a few seconds.',
      '<b>The last two days:</b> <a href="#/sheet">the formula sheet</a> (what you are given, and what you must carry), copy your <a href="notecard-e3.html">notecard</a> by hand, and mixed practice.',
    ],
  });
  C.exam({
    id: 'e2', title: 'Exam 2', past: true,
    scope: 'Lectures 1–20: fields in matter, magnetostatics, induction, plane waves',
    blurb: 'Exam 3 builds directly on plane waves, η and E×H from this material.',
    sheet: 'e2-sheet', quiz: 'e2-mix',
  });
  C.exam({ id: 'final', title: 'Final', scope: 'Dec 14, 7–10 pm. Everything, plus Lectures 34–39 (Smith chart and distribution networks)' });

  // Exam 3: the study path, then the tool units
  const u3 = (id, num, title, blurb, extra = {}) => C.unit(Object.assign({ id, exam: 'e3', num, title, blurb, lessons: [] }, extra));
  u3('e3s', 'Start', 'Start here: the map and the math', 'What Exam 3 asks, complex numbers from zero, and what you need from Exam 2');
  u3('w1', 'Unit 1', 'Phasors and the energy of a wave', 'From a cosine to an arrow; the Poynting theorem derived; time-averaged power');
  u3('w2', 'Unit 2', 'Waves in any material', 'Where γ and η come from; reading a lossy wave; loss tangent, good conductors, skin depth; where the power goes');
  u3('w3', 'Unit 3', 'Polarization and adding waves', 'Linear, circular, elliptical, which hand; two sheets and what the phase does');
  u3('w4', 'Unit 4', 'Reflection and standing waves', 'Γ and τ from the boundary conditions; nodes, envelopes, and why no power moves');
  u3('w5', 'Unit 5', 'Transmission lines in time', 'L, C and Z₀ from the fields; launching, reflecting, bounce diagrams, junctions');
  u3('w6', 'Unit 6', 'Transmission lines in phasors', 'V(d), Γ(d), Z(d); shorts, opens and resonance; quarter-wave matching; the whole circuit');
  u3('e3-prac', 'Exam 3', 'Practice exams and endless exam problems', '', { tools: true });
  u3('e3-past', 'Exam 3', 'Past exams (blank, with solutions)', '', { tools: true });
  u3('e3-hw', 'Exam 3', 'Homework 8–11, with full solutions', '', { tools: true });
  u3('e3-gymu', 'Exam 3', 'Speed: tricks, recognition gym, flashcards', '', { tools: true });
  u3('e3-mcq', 'Exam 3', 'Question bank', '', { tools: true });
  u3('e3-x', 'Exam 3', 'Formula sheet, derivations and mixed practice', '', { tools: true });

  // Exam 2 (review): its study path and tool units
  const unit = (id, num, title, extra = {}) => C.unit(Object.assign({ id, exam: 'e2', num, title, lessons: [] }, extra));
  unit('u0', 'Unit 0', 'The language: vectors, integrals, deltas, waveforms');
  unit('u1', 'Unit 1', 'Fields in matter: dielectrics, capacitors, relaxation');
  unit('u2', 'Unit 2', 'Magnetostatics: forces, Ampère, flux');
  unit('u3', 'Unit 3', 'Induction: Faraday, emf, inductance');
  unit('u4', 'Unit 4', 'Maxwell complete: displacement current, magnetic materials');
  unit('u5', 'Unit 5', 'Plane waves and power');
  unit('u6', 'Unit 6', 'Exam 1 material, condensed');
  unit('x-extra', 'Extra', 'Not on the Fall 2026 Exam 2', { extra: true, blurb: 'The vector potential A: on older exams, not tested this term (Piazza).' });
  unit('e2-past', 'Exam 2', 'Past exams (blank, with solutions)', { tools: true });
  unit('e2-prac', 'Exam 2', 'Practice exams and exam-style problems', { tools: true });
  unit('e2-hw', 'Exam 2', 'Homework 1–7 (blank, with solutions)', { tools: true });
  unit('e2-mcq', 'Exam 2', 'Question bank', { tools: true });
  unit('e2-x', 'Exam 2', 'Formula sheet and mixed practice', { tools: true });
})();

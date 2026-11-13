/* ECE 342 — how this site describes itself to the shared engine (../shared/engine.js).
   Exam 3 is the current exam. Its own study path is the book (bk-units.js): Exams 2 and 3 taught slowly from first
   principles. Under it, through exam.include, come the condensed quick-review units: Exam 3's (pseudo-exam 'e3q',
   moved there by bk-units.js) and Exam 2's. Exam 1's units (u0–u5) stay as review: e2-units.js tags them exam 'e1'. */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'ECE 342', key: 'ece342', home: 'units', current: 'e3', shuffle: true,
    unitsTitle: 'The book: Exams 2 and 3 from first principles',
    title: 'ECE 342 · Exam 3',
    eyebrow: 'Electronic Circuits',
    actions: [
      { href: '#/l/bk01-bias', label: 'Read the book from Chapter 1' },
      { href: '#/gym', label: 'Recognition gym' },
      { href: '#/prac', label: 'Exam 3 practice exams' },
      { href: '#/cards', label: 'Flashcards' },
      { href: '#/sheet', label: 'Exam 3 sheet' },
      { href: '#/l/e2-p1', label: 'Exam 2 practice exams' },
    ],
    aliases: {
      '#/sp26': 'u5-s26-paper', '#/cards': 'e3-cards', '#/prac': 'e3-pA', '#/look': 'e2-u7-look', '#/gym': 'e3-gym',
      '#/e2cards': 'e2-cards', '#/book': 'bk01-bias',
    },
    howto: 'Numbers: in the unit shown, arithmetic allowed (<code>19/3</code>, <code>sqrt(0.04)</code>, <code>20*log(50)</code>), within 1.5%. Expressions: <code>gm*RC</code> or <code>gm RC</code>; <code>||</code> is parallel, so <code>rpi || 1/gm</code> works; BJT names are <code>rpi</code>, <code>beta</code>, <code>ro</code>, <code>RE</code>. Where a problem says so, the $\\beta\\gg1$ and $g_mr_o\\gg1$ approximations are accepted as well as the exact form. A drill doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'e3', title: 'Exam 3',
    when: 'Thu Nov 19, 7–8 pm, 1002 ECEB', date: '2026-11-19T19:00:00-06:00',
    scope: 'BJTs (Lectures 21–29), Bode plots and frequency response (30–33), open-circuit time constants (34–36)',
    blurb: 'Same format as Exam 2: three problems, 60 minutes. Expect a BJT stage (DC point, then $g_m$, $r_\\pi$ and the gain), a resistance/gain problem that mixes BJT and MOSFET building blocks, and a frequency-response problem (a Bode plot, or a bandwidth from open-circuit time constants). Every Exam 2 skill is still in play, which is why the book starts from the MOSFET.',
    include: ['e3q', 'e2'],
    sheet: 'e3-sheet', quiz: 'e3-mix', drill: 'e3-gym',
    planTitle: 'Two weeks, in this order',
    plan: [
      '<b>Read the book in order, one or two sections a sitting, and do every exercise at the end of each section before moving on.</b> Chapters 1–5 rebuild Exam 2 from the ground up (small signals, the MOSFET model, every terminal resistance, every stage); Chapters 6–9 do the same for the BJT; Chapters 10–13 are frequency response. Nothing is quoted without being derived.',
      '<b>Every day, 10 minutes: the <a href="#/gym">recognition gym</a>.</b> One tap per circuit, MOSFET and BJT mixed, until reading a circuit takes seconds.',
      '<b>After each chapter, its "Chapter problems" page</b>, then the matching quick-review unit below the book for a fast second pass.',
      '<b>Practice exams under time</b> (60 minutes, closed notes): Exam 3 practice exams from the end of Chapter 9 on, and the Exam 2 practice exams whenever a MOSFET chapter feels shaky.',
      '<b>The night before:</b> the Exam 3 sheet, one gym round per deck, the flashcards.',
    ],
  });
  C.exam({
    id: 'e3q', title: 'Exam 3 units',
    includeTitle: 'Exam 3, condensed: the quick-review units',
    includeSub: 'The same material as Chapters 6–13 in short form: use them for a second pass after the book',
  });
  C.exam({
    id: 'e2', title: 'Exam 2', past: true, scope: 'Lectures 11–20: MOSFET small-signal amplifiers',
    includeTitle: 'Exam 2, condensed: the quick-review units',
    includeSub: 'The same material as Chapters 1–5 in short form, plus Exam 2\'s own derivations module',
  });
  C.exam({ id: 'e1', title: 'Exam 1', past: true, scope: 'HW 1–3, through MOSFET DC analysis (review)' });
})();

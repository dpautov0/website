/* ECE 342 — how this site describes itself to the shared engine (../shared/engine.js).
   Exam 3 is the current exam. Exam 2's units (MOSFET small-signal) stay on the Exam 3 study path through
   exam.include, because Exam 3 reuses every one of those skills (BJT impedances, the G_M R_out method, and the
   resistances each capacitor sees). Exam 1's units (u0–u5) stay as review: e2-units.js tags them exam 'e1'. */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'ECE 342', key: 'ece342', home: 'units', unitsTitle: 'Exam 3 study path', current: 'e3', shuffle: true,
    title: 'ECE 342 · Exam 3',
    eyebrow: 'Electronic Circuits',
    actions: [
      { href: '#/gym', label: 'Recognition gym (MOS + BJT + frequency)' },
      { href: '#/cards', label: 'Flashcards: every stage, both devices' },
      { href: '#/prac', label: 'Exam 3 practice exams' },
      { href: '#/sheet', label: 'Exam 3 sheet' },
      { href: '#/l/e2-p1', label: 'Exam 2 practice exams (redo)' },
    ],
    aliases: {
      '#/sp26': 'u5-s26-paper', '#/cards': 'e3-cards', '#/prac': 'e3-pA', '#/look': 'e2-u7-look', '#/gym': 'e3-gym',
      '#/e2cards': 'e2-cards',
    },
    howto: 'Numbers: in the unit shown, arithmetic allowed (<code>19/3</code>, <code>sqrt(0.04)</code>, <code>20*log(50)</code>), within 1.5%. Expressions: <code>gm*RC</code> or <code>gm RC</code>; <code>||</code> is parallel, so <code>rpi || 1/gm</code> works; BJT names are <code>rpi</code>, <code>beta</code>, <code>ro</code>, <code>RE</code>. Where a problem says so, the $\\beta\\gg1$ and $g_mr_o\\gg1$ approximations are accepted as well as the exact form. A drill doesn\'t count once you open its solution. Progress is saved in this browser.',
  };

  C.exam({
    id: 'e3', title: 'Exam 3',
    when: 'Thu Nov 19, 7–8 pm, 1002 ECEB', date: '2026-11-19T19:00:00-06:00',
    scope: 'BJTs (Lectures 21–29), Bode plots and frequency response (30–33), open-circuit time constants (34–36)',
    blurb: 'Same format as Exam 2: three problems, 60 minutes. Expect a BJT stage (DC point, then $g_m$, $r_\\pi$ and the gain), a resistance/gain problem that mixes BJT and MOSFET building blocks, and a frequency-response problem (a Bode plot, or a bandwidth from open-circuit time constants). Every Exam 2 skill is still in play: the Exam 2 units sit right under the Exam 3 ones.',
    include: ['e2'],
    sheet: 'e3-sheet', quiz: 'e3-mix', drill: 'e3-gym',
    planTitle: 'Two weeks, in this order',
    plan: [
      '<b>Every day, 10 minutes: the <a href="#/gym">recognition gym</a>.</b> One tap per circuit: name the stage, the resistance at the arrow, the resistance a capacitor sees, the slope of a Bode plot. It mixes MOSFET and BJT, and it serves your weakest deck most. This is the fix for "I can\'t just recognize circuits".',
      '<b>Start here</b>, three short lessons: the five-second read (the questions you ask of every transistor, the one table that covers MOS and BJT, how to find the input, the output and the common terminal), six exam-shaped circuits read aloud, and <a href="#/l/e3-start-e2">a map of where each Exam 2 skill comes back</a> so you can repair Midterm 2 as you go.',
      '<b>Units 10–12 (BJT)</b>. They are the Exam 2 ideas again with $r_\\pi$ and $\\beta$. If a BJT step feels shaky, do the matching Exam 2 unit right after (Unit 7 for impedances, Unit 8 for gain): the gym and the flashcards mix both devices on purpose.',
      '<b>Units 13–15 (frequency)</b> as the lectures reach them: Bode plots, a pole at each node, Miller, then open-circuit time constants. The time-constant method is the Exam 2 impedance skill pointed at capacitors.',
      '<b>Practice exams</b> under time (60 minutes, no notes), then the <b>flashcards</b> until every card is known.',
      '<b>The night before:</b> the Exam 3 sheet, one gym round per deck, one more pass of the flashcards.',
    ],
  });
  C.exam({
    id: 'e2', title: 'Exam 2', past: true, scope: 'Lectures 11–20: MOSFET small-signal amplifiers',
    includeTitle: 'Exam 2 material: MOSFET small-signal (still on the path)',
    includeSub: 'Every Exam 3 BJT and frequency problem reuses these: redo what you missed on Exam 2',
  });
  C.exam({ id: 'e1', title: 'Exam 1', past: true, scope: 'HW 1–3, through MOSFET DC analysis (review)' });
})();

/* ECE 342 — how this site describes itself to the shared engine (../shared/engine.js). */
(function () {
  'use strict';
  COURSE.meta = {
    name: 'ECE 342', key: 'ece342', home: 'units', unitsTitle: 'Units',
    title: 'ECE 342 · Exam 1',
    lede: 'Thu Sep 24, 7–8 pm, 1002 ECEB. HW 1–3, through MOSFET DC analysis. Calculators allowed.',
    actions: [{ href: '#/l/u5-bank', label: 'Question bank' }, { href: '#/sp26', label: 'SP26 exam' }],
    aliases: { '#/sp26': 'u5-s26-paper' },
    howto: 'Numbers: in the unit shown, arithmetic allowed (<code>19/3</code>, <code>sqrt(0.04)</code>), within 1.5%. Expressions: <code>gm*RD</code> or <code>gm RD</code>; <code>||</code> is parallel. A drill doesn\'t count once you open its solution. Progress is saved in this browser.',
  };
})();

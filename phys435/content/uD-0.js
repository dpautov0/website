/* Drill ladders. This file registers a holding unit; the uD-*.js files push their lessons into it, and zz-scope.js
   then places each ladder at the end of the study-path unit it drills. */
(function () {
  'use strict';
  const { R } = C;

  C.unit({
    id: 'uD', num: 'Drill', title: 'Drill ladders',
    blurb: 'Every topic drilled from quick recognition up to harder than the exam.',
    lessons: [
      {
        id: 'uD-start', title: 'All drill ladders',
        steps: [
          R(md`
            Each unit on the path ends with a drill ladder for its topic. This page lists them all in one place.

            Every ladder climbs in levels: **1** recognize, **2** set up, **3** standard, **4** one twist, **5** exam level, **6** harder than the exam. Levels 1–2 are short; most questions are at 4–6. If a level goes badly, drop back one and redo it.

            | Unit | Concepts | Problems |
            |---|---|---|
            | 1 · Delta functions | [concept ladder](#/l/uD-delta-concepts) | [problem ladder](#/l/uD-delta-problems) |
            | 2 · Energy | [concept ladder](#/l/uD-energy-concepts) | [problem ladder](#/l/uD-energy-problems) |
            | 4 · Boundary conditions | [concept ladder](#/l/uD-bc-concepts) | [problem ladder](#/l/uD-bc-problems) |
            | 5 · Images and uniqueness | [concept ladder](#/l/uD-img-concepts) | [problem ladder](#/l/uD-img-problems) |
            | 6–7 · Separation, Cartesian and polar | [concept ladder](#/l/uD-sep-concepts) | [problem ladder](#/l/uD-sep-problems) |
            | 8 · Legendre | [concept ladder](#/l/uD-leg-concepts) | [problem ladder](#/l/uD-leg-problems) |

            Short on time? Levels 4–6 of each concept ladder find your gaps fastest; then the Level 5 problems, which are exam-sized.
          `),
        ],
      },
    ],
  });
})();

/* Unit D — Drill ladders. This file registers the unit; the uD-*.js files push their lessons into it. */
(function () {
  'use strict';
  const { R } = C;

  C.unit({
    id: 'uD', num: 'Unit D', title: 'Drill ladders: Chapter 3, harder and harder',
    blurb: 'The topics ECE 329 never taught, drilled from easy recognition up to harder-than-the-exam: separation of variables, images, Legendre, multipoles and deltas, boundary conditions and uniqueness.',
    lessons: [
      {
        id: 'uD-start', title: 'How to use the ladders',
        steps: [
          R(md`
            Each lesson in this unit is one topic, climbed in levels:

            - **Level 1: recognize.** What kind of problem is this, which tool, which function.
            - **Level 2: set up.** Region, numbered boundary conditions, the general solution with the right terms.
            - **Level 3: solve the standard case.**
            - **Level 4: one twist.** A boundary moved, a potential added, a symmetry broken.
            - **Level 5: exam level.** Multi-part, like the last two Hour Exams.
            - **Level 6: harder than the exam.** Combine two methods, reason without computing, catch the trap.

            Climb in order. If a level goes badly, drop back one level and redo it before moving up. The conceptual questions are the fastest way to find out what you don't actually understand yet.

            ### The ladders, in priority order

            | Topic | Concepts | Problems |
            |---|---|---|
            | Separation of variables, Cartesian and polar | [concept ladder](#/l/uD-sep-concepts) | [problem ladder](#/l/uD-sep-problems) |
            | Legendre (spherical separation) | [concept ladder](#/l/uD-leg-concepts) | [problem ladder](#/l/uD-leg-problems) |
            | Method of images and uniqueness | [concept ladder](#/l/uD-img-concepts) | [problem ladder](#/l/uD-img-problems) |
            | Multipoles | [concept ladder](#/l/uD-mp-concepts) | [problem ladder](#/l/uD-mp-problems) |
            | Delta functions in $\rho$ | [concept ladder](#/l/uD-delta-concepts) | [problem ladder](#/l/uD-delta-problems) |
            | Boundary conditions in 2-D and 3-D | [concept ladder](#/l/uD-bc-concepts) | [problem ladder](#/l/uD-bc-problems) |
            | Electrostatic energy | [concept ladder](#/l/uD-energy-concepts) | [problem ladder](#/l/uD-energy-problems) |

            Short on time? Do Levels 4–6 of the concept ladders first: they find the gaps fastest. Then the Level 5 problems, which are exam-sized.
          `),
        ],
      },
    ],
  });
})();

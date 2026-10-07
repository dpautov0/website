/* The study path. Loaded after every other content file: it regroups the existing lessons into numbered units, in the
   order to study them, covering only what ECE 329 Exam 1 did not (the student aced it), within Hour Exam I's scope
   (Lectures 1–13). Everything else (329 review, repeats, extra practice, Lecture 14 multipoles) goes into Extra units,
   which the sidebar collapses and the home page lists last. No lesson is deleted. */
(function () {
  'use strict';
  if (typeof COURSE === 'undefined' || !COURSE.units) return;
  const { R, G } = C;

  const all = new Map();
  COURSE.units.forEach((u) => u.lessons.forEach((l) => all.set(l.id, l)));
  const used = new Set();
  const take = (ids) => ids.filter((id) => all.has(id)).map((id) => { used.add(id); return all.get(id); });

  const PATH = [
    { id: 'p1', title: 'Delta functions: from E to ρ', blurb: 'The Dirac delta, and the past-exam problem: given E, find V and ρ, including the point charge hiding at the origin. Then Gauss with superposed spheres and cylinders.',
      ids: ['u0-delta', 'uP-delta', 'uD-delta-concepts', 'uD-delta-problems', 'uP-superpose'] },
    { id: 'p2', title: 'Electrostatic energy', blurb: 'W = ½Σ qV, the field energy, why energy doesn\'t superpose, and the force on a conductor.',
      ids: ['u3-assembly', 'u3-field-energy', 'u3-energy-comments', 'u3-surface-force', 'uD-energy-concepts', 'uD-energy-problems'] },
    { id: 'p3', title: 'Laplace\'s equation and uniqueness', blurb: 'No maxima, the averaging property, and the two uniqueness theorems: why any solution that fits is the answer.',
      ids: ['u4-3d', 'u4-unique1', 'u4-unique2', 'u4-bcs'] },
    { id: 'p4', title: 'Boundary conditions in 2-D and 3-D', blurb: 'Turning words into conditions, and the matching conditions on V and ∂V/∂n at charged surfaces and conductors.',
      ids: ['ub-words', 'ub-match', 'uD-bc-concepts', 'uD-bc-problems'] },
    { id: 'p5', title: 'The method of images', blurb: 'Planes, corners and spheres: grounded, neutral, charged and held at V₀. Induced charge, force, and the factor of ½ in the energy.',
      ids: ['u5-idea', 'u5-sigma', 'u5-energy', 'u5-corner', 'u5-sphere', 'u5-sphere2', 'uD-img-concepts', 'uD-img-problems'] },
    { id: 'p6', title: 'Separation of variables: Cartesian', blurb: 'The slot, Fourier coefficients, choosing sin vs sinh, closed boxes, 3-D.',
      ids: ['u6-idea', 'u6-slot', 'u6-fourier', 'u6-choose', 'u6-boxes', 'u6-3d'] },
    { id: 'p7', title: 'Separation of variables: polar', blurb: 'Long wedges and pipes, nothing depending on z: r^±k with sin kθ. Last spring\'s exam Problem 1. Then the separation drills.',
      ids: ['uW-polar', 'uW-wedge', 'uW-cyl', 'uD-sep-concepts', 'uD-sep-problems'] },
    { id: 'p8', title: 'Separation of variables: spherical (Legendre)', blurb: 'Spheres and shells with V(θ) or σ(θ): r^ℓ P_ℓ(cos θ), the sphere in a uniform field, the axis trick.',
      ids: ['u7-separate', 'u7-legendre', 'u7-expand', 'u7-bcs', 'u7-shell-V', 'u7-field', 'u7-sigma', 'u7-two-axis', 'x-legendre', 'uD-leg-concepts', 'uD-leg-problems'] },
    { id: 'p9', title: 'Practice exams', blurb: 'The formula sheet, the method chooser, last spring\'s real exam, the mocks, and the concept quiz.',
      ids: ['x-sheet', 'x-method', 'x-s26', 'x-mock4', 'x-mock3', 'x-mock', 'x-mock2', 'uD-start', 'x-quiz'] },
  ];
  const units = PATH.map((p, i) => ({ id: p.id, num: `Unit ${i + 1}`, title: p.title, blurb: p.blurb, lessons: take(p.ids) }));

  // Extra: not needed for this exam
  const L14 = (id) => /^u8-/.test(id) || id === 'uW-multipole' || /^uD-mp-/.test(id);
  const R329 = (id) => /^u[012]-/.test(id) || ['u3-work', 'u3-conductors', 'u3-cavities', 'u3-capacitors', 'u4-poisson'].includes(id);
  const rest = [...all.keys()].filter((id) => !used.has(id));
  const extra = [
    { id: 'e1', num: 'Extra', title: 'ECE 329 review: vectors, Gauss, potential, conductors', blurb: 'Material you already know from ECE 329, with every PHYS 435 homework problem worked.', lessons: take(rest.filter(R329)) },
    { id: 'e2', num: 'Extra', title: 'More practice on the same topics', blurb: 'Repeats and extra practice for Units 1–8. Only if you have time left.', lessons: take(rest.filter((id) => !R329(id) && !L14(id))) },
    { id: 'e3', num: 'Extra', title: 'Multipoles (not on Exam I)', blurb: 'Not on Hour Exam I. Kept for Exam II.', lessons: take(rest.filter(L14)) },
  ];
  extra.forEach((u) => { u.extra = true; });
  extra[2].lessons.forEach((l) => { l.noBank = true; });

  COURSE.units.length = 0;
  units.concat(extra).filter((u) => u.lessons.length).forEach((u) => COURSE.units.push(u));

  // the concept quiz draws from the study path only
  const quiz = all.get('x-quiz');
  if (quiz) {
    quiz.title = 'Concept quiz';
    quiz.steps = [
      R(md`Random multiple-choice questions from the study path (Units 1–8), options shuffled, no repeats until the pool runs out. Each card links back to its lesson.

### Everything on the path`),
      G('concept', { need: 15, units: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'] }),
      R(md`### Images and separation of variables`),
      G('concept', { need: 10, units: ['p5', 'p6', 'p7', 'p8'] }),
      R(md`### Boundary conditions, Laplace and uniqueness`),
      G('concept', { need: 8, units: ['p3', 'p4'] }),
      R(md`### Deltas and energy`),
      G('concept', { need: 8, units: ['p1', 'p2'] }),
    ];
  }
})();

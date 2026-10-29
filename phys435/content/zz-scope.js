/* The study paths. Loaded after every other content file: it regroups the lessons into numbered units, in the order
   to study them. Hour Exam II (current, Lectures 14–27) gets its own path: the Lecture 14 multipole lessons, then the
   e2-*.js lessons. Hour Exam I's path (Lectures 1–13, only what ECE 329 did not cover) is kept as a past exam for review;
   its 329 review and repeats stay in Extra units. No lesson is deleted. */
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
  const units = PATH.map((p, i) => ({ id: p.id, exam: 'e1', num: `Unit ${i + 1}`, title: p.title, blurb: p.blurb, lessons: take(p.ids) }));

  // Hour Exam II: Lectures 14–27
  const L14 = (id) => /^u8-/.test(id) || id === 'uW-multipole' || /^uD-mp-/.test(id);
  const mp = [...all.keys()].filter(L14);
  const PATH2 = [
    { id: 'q0', title: 'Start here: the exam format', blurb: 'What Exam I looked like (four problems, 50 minutes, the clock is the enemy) and which Exam II problem each one turns into.',
      ids: ['e2-format'] },
    { id: 'q1', title: 'Multipoles, and dipoles in a field', blurb: 'Lecture 14 and HW 5–6: the multipole expansion, dipole moments, then torque, energy and force on a dipole (HW 4.6, 4.7).',
      ids: mp.filter((id) => !/^uD-/.test(id)).concat(['e2-dipE'], mp.filter((id) => /^uD-/.test(id))) },
    { id: 'q2', title: 'Polarization, bound charge, and D', blurb: 'σ_b = P·n̂, ρ_b = −∇·P, the four standard shapes, and when Gauss for D works (HW 4.10, 4.11, 4.15).',
      ids: ['e2-pic-P', 'e2-bound', 'e2-D', 'e2-drill-bound'] },
    { id: 'q3', title: 'Linear dielectrics', blurb: 'D = εE, capacitors as series/parallel springs, coax, boundary conditions, the sphere in a uniform field (HW 4.18, 4.21, 4.24; Disc. 4.19).',
      ids: ['e2-linear', 'e2-dielbc', 'e2-dielimg', 'e2-drill-diel'] },
    { id: 'q4', title: 'Energy and force in dielectrics', blurb: 'W = ½∫D·E, fixed Q vs fixed V, the slab sucked into a capacitor (HW 4.26).',
      ids: ['e2-energy', 'e2-energyint'] },
    { id: 'q5', title: 'Currents and Biot–Savart', blurb: 'K, J, spinning charge, forces on currents, and the segment/arc table that solves bent-wire problems (HW 5.6, 5.8, 5.10; Disc. 5.4, 5.11).',
      ids: ['e2-pic-B', 'e2-currents', 'e2-bs', 'e2-drill-bs'] },
    { id: 'q6', title: 'Ampère’s law', blurb: 'The four symmetric setups, sheets, slabs, coaxial solenoids, the moving capacitor, the off-center hole (HW 5.14, 5.17, 5.18; Disc. 5.15).',
      ids: ['e2-ampere', 'e2-drill-amp'] },
    { id: 'q7', title: 'Vector potential, boundary conditions, magnetic dipoles', blurb: 'A from J, Stokes for A, the B jump across K, m = (Q/2M)L, the spinning shell (HW 5.25, 5.26, 5.29, 5.37; Disc. 5.39, 5.63).',
      ids: ['e2-A', 'e2-mbc', 'e2-drill-spin'] },
    { id: 'q8', title: 'Magnetization and H', blurb: 'Para/dia, J_b = ∇×M, K_b = M×n̂, the electric/magnetic swap, H = 0 by symmetry, linear media (HW 6.3, 6.8, 6.12, 6.16).',
      ids: ['e2-pic-M', 'e2-mdip', 'e2-boundJ', 'e2-H', 'e2-drill-mag'] },
    { id: 'qx', title: 'Exam-format problems: given a field, overlapping shapes', blurb: 'Exam I problems 1 and 2 in Exam II material: div, curl, potential and energy of given E, B and P fields, and superposition of overlapping balls, slabs, wires and cavities.',
      ids: ['e2-fields', 'e2-overlap'] },
    { id: 'q9', title: 'Speed tricks and practice exams', blurb: 'What to memorize, twelve shortcuts, the setups table, a rapid-fire round, a mixed endless drill, eight timed 50-minute mocks (C mirrors Exam I problem by problem; H is the dress rehearsal), the concept quiz.',
      ids: ['e2-sheet', 'e2-speed', 'e2-setups', 'e2-rapid', 'e2-drill-mixed', 'e2-mockC', 'e2-mockD', 'e2-mockE', 'e2-mockF', 'e2-mockG', 'e2-mockA', 'e2-mockB', 'e2-mockH', 'e2-quiz'] },
  ];
  const units2 = PATH2.map((p, i) => ({ id: p.id, exam: 'e2', num: i ? `Unit ${i}` : 'Start', title: p.title, blurb: p.blurb, lessons: take(p.ids) }));

  // Extra: Exam I review material that the Exam I path skipped
  const R329 = (id) => /^u[012]-/.test(id) || ['u3-work', 'u3-conductors', 'u3-cavities', 'u3-capacitors', 'u4-poisson'].includes(id);
  const rest = [...all.keys()].filter((id) => !used.has(id));
  const extra = [
    { id: 'ex1', num: 'Extra', title: 'Exam I extra: ECE 329 review (vectors, Gauss, potential, conductors)', blurb: 'Material you already know from ECE 329, with every PHYS 435 homework problem worked.', lessons: take(rest.filter(R329)) },
    { id: 'ex2', num: 'Extra', title: 'Exam I extra: more practice on the same topics', blurb: 'Repeats and extra practice for Exam I Units 1–8.', lessons: take(rest.filter((id) => !R329(id))) },
  ];
  extra.forEach((u) => { u.extra = true; });

  COURSE.units.length = 0;
  units2.concat(units, extra).filter((u) => u.lessons.length).forEach((u) => COURSE.units.push(u));

  // the concept quiz draws from the study path only
  const quiz = all.get('x-quiz');
  if (quiz) {
    quiz.title = 'Concept quiz (Exam I)';
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

  // the Exam II concept quiz draws from its study path
  const quiz2 = all.get('e2-quiz');
  if (quiz2) {
    quiz2.steps = [
      R(md`Random multiple-choice questions from the Exam II path (Units 1–8), options shuffled, no repeats until the pool runs out. Each card links back to its lesson. Aim for 30 seconds a card.

### Everything on Exam II`),
      G('concept', { need: 20, units: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'qx'] }),
      R(md`### Electric side: multipoles and dielectrics`),
      G('concept', { need: 10, units: ['q1', 'q2', 'q3', 'q4'] }),
      R(md`### Magnetic side: Biot–Savart, Ampère, A, magnetization`),
      G('concept', { need: 10, units: ['q5', 'q6', 'q7', 'q8', 'qx'] }),
    ];
  }
})();

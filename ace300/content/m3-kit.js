/* m3-kit.js — small helpers shared by every Mini Exam 3 file. Loaded after econ.js and before the m3 content files.

   Answer parts (same as the Mini Exam 2 files):
     M3.N(lbl, ans, unit?, rel?)       a number box, 1% tolerance by default
     M3.X(lbl, expr, vars)             a formula box, e.g. M3.X('MC(q)', '4*q', { q: [1, 9] })
     M3.FIX(lbl, opts, a, why)         an in-problem multiple choice that keeps its order
     M3.M(lbl, opts, a, why)           an in-problem multiple choice that gets shuffled

   Plan steps (the engine's p.plan; see shared/engine.js):
     M3.plan(q, right, [[wrong, why], ...], move)
       q      the question (md), e.g. 'What is the first equation you write?'
       right  the right option (md); wrongs are [option, why it is wrong]; options are shuffled on screen
       move   what to do, shown once the right option is picked (md): the recipe in one to three short lines

   Generators: M3.gen(name, fn) registers GENS[name] and lists it for the mixed-practice page (M3.GENS). */
(function () {
  'use strict';
  const M3 = window.M3 = window.M3 || {};
  M3.N = (lbl, ans, unit, rel = 0.01) => ({ lbl, ans, unit, tol: { rel, abs: 1e-6 } });
  M3.X = (lbl, expr, vars) => ({ lbl, expr, vars });
  M3.FIX = (lbl, mc, a, why) => ({ lbl, mc, a, why, fixed: true });
  M3.M = (lbl, mc, a, why) => ({ lbl, mc, a, why });
  M3.plan = (q, right, wrongs, move) => ({ q, opts: [right, ...wrongs.map((w) => w[0])], a: 0, why: [null, ...wrongs.map((w) => w[1])], move });
  M3.GENS = M3.GENS || [];
  M3.gen = (name, fn) => { GENS[name] = fn; if (!M3.GENS.includes(name)) M3.GENS.push(name); return name; };
  M3.F = (v, d = 3) => EC.fmt(v, d);
  // "+ 3" / "- 3" for writing a term after another one
  M3.sgn = (v, d = 3) => (v < 0 ? `- ${EC.fmt(-v, d)}` : `+ ${EC.fmt(v, d)}`);
  // a nice random number from a list, and a random integer
  M3.pick = U.pick;
  M3.ri = U.ri;
})();

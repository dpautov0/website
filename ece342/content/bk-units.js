/* The book: Exams 2 and 3 taught slowly, from first principles, in the spirit of a textbook (Razavi, Sedra–Smith) and of
   The Art of Electronics: the physical picture first, then the small-signal model and where it comes from, then every
   result derived one step at a time, then worked examples and many exercises.
   Chapters are units with exam 'e3' (the current exam's own study path). The quick-review units that came before the
   book (Exam 3 Units 10–15 and their Start unit) move to the pseudo-exam 'e3q', shown as their own group under the book
   (site.js: e3.include = ['e3q', 'e2']).
   Chapter files add sections with BK.lesson('bk03', {...}). Lesson and problem ids start with "bk" and never contain
   "-P<digit>" (the Exam 1 bank files any id matching that pattern). */
(function () {
  'use strict';
  const CH = [
    ['bk01', 'Ch 1', 'Small signals riding on a bias', 'Why a transistor needs a DC operating point, how a small signal rides on it, and how a curve becomes a straight line (a tangent): the incremental resistance of a diode, the two pictures (DC and small-signal), what turns into ground, and the test-source method.'],
    ['bk02', 'Ch 2', 'The MOSFET, and where its small-signal model comes from', 'How the channel forms and carries current, the square law, saturation and $r_{ds}$, PMOS; then linearizing: $g_m$ three ways, $r_{ds} = 1/(\\lambda I_D)$, and why one model serves NMOS and PMOS.'],
    ['bk03', 'Ch 3', 'Looking into a MOSFET: every terminal resistance, derived', 'Gate, drain, source, the diode, degeneration as an impedance scaler, a source with a drain load, gates that move (the K rule), cascodes, and a node as $R_{UP}\\parallel R_{DN}$.'],
    ['bk04', 'Ch 4', 'Single-stage MOSFET amplifiers', 'Every amplifier as a Norton source ($A_v = -G_MR_{out}$); common source with its three loads, source degeneration, common gate, the source follower and the cascode, each derived and then felt.'],
    ['bk05', 'Ch 5', 'Circuits with several MOSFETs', 'Current mirrors, gain chains and loading, two paths into one output, mirrors that carry signal, the folded cascode, the differential pair, and the DC bias of stacks and mirrors.'],
    ['bk06', 'Ch 6', 'The BJT from first principles, and DC analysis', 'Two junctions and a thin base: why $I_C = I_Se^{V_{BE}/V_T}$, where base current and $\\beta$ come from, the four regions, PNP, the Early effect, and DC analysis by "assume active, solve, check".'],
    ['bk07', 'Ch 7', 'The BJT small-signal model', '$g_m = I_C/V_T$, $r_\\pi = \\beta/g_m$ and $r_o = V_A/I_C$ derived by linearizing; the hybrid-$\\pi$ and T models, the intrinsic emitter resistance $r_e$, and the MOSFET-to-BJT dictionary.'],
    ['bk08', 'Ch 8', 'Looking into a BJT', 'The base, the emitter and the collector, with and without resistors; the $(\\beta + 1)$ rule derived both ways; the diode-connected BJT; the BJT cascode and its $\\beta r_o$ ceiling; nodes that mix BJTs and MOSFETs.'],
    ['bk09', 'Ch 9', 'BJT amplifiers', 'Common emitter (and with $R_E$), common base, emitter follower and cascode, derived with the hybrid-$\\pi$ model and felt with $r_e$; bias networks with coupling and bypass capacitors; chains.'],
    ['bk10', 'Ch 10', 'Capacitors, time constants and transfer functions', 'What a capacitor does to a node, the RC time constant, impedance $1/(sC)$, the RC low-pass derived, an amplifier with a load capacitor, and poles and zeros.'],
    ['bk11', 'Ch 11', 'Bode plots', 'Decibels and log axes, one pole and one zero derived (asymptotes, $-3$ dB, the straight-line phase), the right-half-plane zero, composite plots, and reading a plot back into $H(s)$.'],
    ['bk12', 'Ch 12', 'Transistor capacitances, poles at nodes, and Miller', 'Where $C_{gs}$, $C_{gd}$, $C_\\pi$, $C_\\mu$ come from; one pole per node; the CS/CE stage solved exactly; the dominant pole; Miller\'s theorem derived and used.'],
    ['bk13', 'Ch 13', 'Open-circuit time constants', 'Why the bandwidth is about $1/\\sum RC$, the recipe, the bridge rule derived, and every stage worked: CS, CE, degenerated CS, CG/CB, followers and the cascode.'],
  ];
  const made = CH.map(([id, num, title, blurb]) => C.unit({ id, exam: 'e3', num, title, blurb, lessons: [] }));

  // the quick-review units move under the book, as their own group
  ['e3start', 'e3u10', 'e3u11', 'e3u12', 'e3u13', 'e3u14', 'e3u15'].forEach((id) => { const u = COURSE.units.find((x) => x.id === id); if (u) u.exam = 'e3q'; });
  // chapters first among the Exam 3 units (before the quick-review units and the tools)
  const rest = COURSE.units.filter((u) => !made.includes(u));
  const at = rest.findIndex((u) => u.exam === 'e3q' || (u.exam === 'e3' && u.tools));
  COURSE.units.splice(0, COURSE.units.length, ...rest.slice(0, at < 0 ? rest.length : at), ...made, ...rest.slice(at < 0 ? rest.length : at));

  window.BK = {
    unit: (id) => COURSE.units.find((u) => u.id === id),
    lesson(uid, l) { const u = this.unit(uid); if (!u) throw new Error(`BK: no chapter ${uid}`); u.lessons.push(l); return l; },
    // the Exam 3 helpers work for both devices: E3.ex (symbolic answers; beta, rpi, ro, gm, rds, R..., C... names),
    // E3.resPart (a resistance answer in a sensible unit), E3.KO / E3.MS / E3.resTeX (formatting)
    ex: (...a) => E3.ex(...a), res: (...a) => E3.resPart(...a),
  };
})();

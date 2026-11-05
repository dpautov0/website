/* Chapter 12 (temporary figure preview while the chapter is being written) */
(function () {
  'use strict';
  const { R, RF } = C;
  const B = window.BK8;
  const L = (l) => BK.lesson('bk12', l);
  const figs = {
    cs: B.F.cs({ cdb: true }), ce: B.F.ce(), csdeg: B.F.csdeg(), cedeg: B.F.cedeg(), cg: B.F.cg(), cb: B.F.cb(), sf: B.F.sf(), ef: B.F.ef(),
    casc: B.F.casc(), bjtcasc: B.F.bjtcasc(), csv: B.F.cs({ hi: 'Cgd', v: { RS: '10\\kO', RL: '5\\kO', Cgs: '1\\,\\text{pF}', Cgd: '0.2\\,\\text{pF}', CL: '1\\,\\text{pF}' } }),
    mosHF: B.M.mosHF(), bjtHF: B.M.bjtHF(), bjtHF2: B.M.bjtHF(false), ft: B.M.ftTest(), nodeRC: B.M.nodeRC(), nodeUD: B.M.nodeUD(), ex1: B.M.ex1(), ex2: B.M.ex2(), ex3: B.M.ex3(),
    ex2ss: B.M.ex2ss(), ex3ss: B.M.ex3ss(), two: B.M.twoNode(), csSS: B.M.csSS(), ceSS: B.M.ceSS(), mz: B.M.millerZ(), ma: B.M.millerA(), mb: B.M.millerB(), csm: B.M.csMiller(),
    br: B.T.bridge({ test: true }), brc: B.T.bridgeC(), csGs: B.T.csGs(), csGd: B.T.csGd(), degGs: B.T.degGs(), fol: B.T.follow(),
    mos: B.X.mosCross(), bjt: B.X.bjtCross(),
    p1: B.plot2({ x: [6, 11], y: [-40, 40], logx: true, xt: [6, 7, 8, 9, 10, 11].map(B.dec), yt: [-40, -20, 0, 20, 40].map((v) => ({ v, t: `$${v}$` })), curves: [{ f: (w) => 20 * Math.log10(40 / Math.hypot(1, w / 1e8)), n: '|H|', at: 7 }], marks: [{ x: 1e8, n: '\\omega_p' }], xl: '$\\omega$ (rad/s)', yl: '$|H|$ (dB)' }),
  };
  const md2 = Object.keys(figs).map((k) => `[[fig:${k}]]`).join('\n\n');
  L({ id: 'bk12-where', title: 'Figure preview', steps: [RF(md2, Object.fromEntries(Object.entries(figs).map(([k, v]) => [k, { fig: v, cap: k }])))] });
})();

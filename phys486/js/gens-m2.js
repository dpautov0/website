/* Midterm 2 randomized drills (PHYS 486): the oscillator, dynamics of expectation values, angular momentum, central
   potentials and hydrogen. Every call builds a fresh version of a standard setup: it picks a variant, then numbers.
   Answers are pure numbers "in units of" the natural combination the question names (checked within ~1.5%), or
   multiple choice for the qualitative variants. Used by G('m2_...') steps in content/m2-tools.js and the topic lessons. */
(function () {
  'use strict';
  const { pick, ri } = U;

  // ---------------------------------------------------------------- helpers
  const clean = (x) => (Math.abs(x) < 1e-12 ? 0 : x);
  const f = (x, s = 4) => U.fmt(x, s);
  const sci = (x, s = 3) => { const e = Math.floor(Math.log10(Math.abs(x))); return `${+(x / 10 ** e).toPrecision(s)}\\times10^{${e}}`; };
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
  // reduced fraction as TeX (integers in, sign out front)
  const fr = (p, q) => {
    if (q < 0) { p = -p; q = -q; }
    const g = gcd(p, q); p /= g; q /= g;
    if (q === 1) return `${p}`;
    return `${p < 0 ? '-' : ''}\\tfrac{${Math.abs(p)}}{${q}}`;
  };
  // square root of a non-negative integer as simplified TeX: 8 -> 2\sqrt{2}, 9 -> 3, 6 -> \sqrt{6}
  const rt = (n) => {
    if (n === 0) return '0';
    let a = 1, b = n;
    for (let k = Math.floor(Math.sqrt(n)); k > 1; k--) if (n % (k * k) === 0) { a = k; b = n / (k * k); break; }
    return b === 1 ? `${a}` : `${a === 1 ? '' : a}\\sqrt{${b}}`;
  };
  const half = (n) => fr(2 * n + 1, 2);           // n + 1/2 as a fraction
  const mc = (opts, a, why, lbl) => ({ mc: opts, a, why, lbl });
  // put the right option (listed first) at a random position; why[] follows it
  const mix = (opts, why) => {
    const pos = ri(0, opts.length - 1);
    const o = opts.slice(), w = why.slice();
    o.splice(pos, 0, o.shift()); w.splice(pos, 0, w.shift());
    return { mc: o, a: pos, why: w };
  };
  const DEG = 180 / Math.PI;

  // constants (eV, nm)
  const HC = 1239.84, HBARC = 197.327, MEC2 = 510999, RY = 13.6, A0 = 0.0529;

  // ================================================================ 1. ladder-operator matrix elements
  GENS.m2_ladder = () => {
    const v = pick(['x', 'x', 'p', 'p', 'x2', 'p2', 'off', 'x4', 'TV']);
    const n = ri(0, 6);
    let q, ans, sol, lbl;
    const hints = [md`$\hat x = \sqrt{\dfrac{\hbar}{2m\omega}}(\hat a_+ + \hat a_-)$, $\hat p = i\sqrt{\dfrac{\hbar m\omega}{2}}(\hat a_+ - \hat a_-)$.`,
      md`$\hat a_+\ket{n} = \sqrt{n+1}\,\ket{n+1}$ and $\hat a_-\ket{n} = \sqrt{n}\,\ket{n-1}$; then use orthonormality.`];
    if (v === 'x' || v === 'p') {
      const k = pick([n + 1, n + 1, n + 2, n].concat(n > 0 ? [n - 1, n - 1] : []));
      const up = k === n + 1, dn = k === n - 1;
      if (v === 'x') {
        ans = up ? Math.sqrt(n + 1) : dn ? Math.sqrt(n) : 0;
        q = md`For the harmonic oscillator, find $\bra{${k}}\hat x\ket{${n}}$ in units of $\sqrt{\hbar/2m\omega}$.`;
        lbl = md`\bra{${k}}\hat x\ket{${n}}`;
        sol = md`$\hat x\ket{${n}} = \sqrt{\dfrac{\hbar}{2m\omega}}\left(${rt(n + 1)}\ket{${n + 1}}${n ? md` + ${rt(n)}\ket{${n - 1}}` : ''}\right)$. `
          + (ans ? md`Only the $\ket{${k}}$ piece survives the projection: $${up ? rt(n + 1) : rt(n)} \approx ${f(ans)}$.`
            : md`$\ket{${k}}$ is orthogonal to every piece: $0$. **The picture:** $\hat x$ moves the state exactly one rung up or down, never two and never zero.`);
      } else {
        ans = up ? Math.sqrt(n + 1) : dn ? -Math.sqrt(n) : 0;
        q = md`For the harmonic oscillator, find $\bra{${k}}\hat p\ket{${n}}$ in units of $i\sqrt{\hbar m\omega/2}$ (the sign matters).`;
        lbl = md`\bra{${k}}\hat p\ket{${n}}`;
        sol = md`$\hat p\ket{${n}} = i\sqrt{\dfrac{\hbar m\omega}{2}}\left(${rt(n + 1)}\ket{${n + 1}}${n ? md` - ${rt(n)}\ket{${n - 1}}` : ''}\right)$: the raising part comes with $+$, the lowering part with $-$. `
          + (ans ? md`Projecting on $\bra{${k}}$: $${up ? rt(n + 1) : `-${rt(n)}`} \approx ${f(ans)}$.` : md`$\ket{${k}}$ is not one rung away: $0$.`);
      }
    } else if (v === 'x2') {
      ans = n + 0.5;
      q = md`Find $\bra{${n}}\hat x^2\ket{${n}}$ (which is $\sigma_x^2$ here) in units of $\hbar/m\omega$.`;
      lbl = md`\bra{${n}}\hat x^2\ket{${n}}`;
      sol = md`$\hat x^2 = \dfrac{\hbar}{2m\omega}(\hat a_+^2 + \hat a_+\hat a_- + \hat a_-\hat a_+ + \hat a_-^2)$. Only the two middle terms return to $\ket{${n}}$: $\hat a_+\hat a_- \to n = ${n}$, $\hat a_-\hat a_+ \to n+1 = ${n + 1}$. So $\langle x^2\rangle = \dfrac{\hbar}{2m\omega}(2n+1) = \left(n+\tfrac12\right)\dfrac{\hbar}{m\omega} = ${half(n)}$ units. Higher states are wider.`;
    } else if (v === 'p2') {
      ans = n + 0.5;
      q = md`Find $\bra{${n}}\hat p^2\ket{${n}}$ in units of $\hbar m\omega$.`;
      lbl = md`\bra{${n}}\hat p^2\ket{${n}}`;
      sol = md`$\hat p^2 = -\dfrac{\hbar m\omega}{2}(\hat a_+^2 - \hat a_+\hat a_- - \hat a_-\hat a_+ + \hat a_-^2)$. The diagonal part is $+\dfrac{\hbar m\omega}{2}(\hat a_+\hat a_- + \hat a_-\hat a_+) \to \dfrac{\hbar m\omega}{2}(2n+1) = ${half(n)}$ units. Then $\langle p^2\rangle/2m = \tfrac12\hbar\omega(n+\tfrac12)$: half the energy is kinetic.`;
    } else if (v === 'off') {
      const isP = Math.random() < 0.4;
      const P = (n + 1) * (n + 2);
      ans = isP ? -Math.sqrt(P) : Math.sqrt(P);
      q = isP ? md`Find $\bra{${n + 2}}\hat p^2\ket{${n}}$ in units of $\hbar m\omega/2$ (the sign matters).`
        : md`Find $\bra{${n + 2}}\hat x^2\ket{${n}}$ in units of $\hbar/2m\omega$.`;
      lbl = isP ? md`\bra{${n + 2}}\hat p^2\ket{${n}}` : md`\bra{${n + 2}}\hat x^2\ket{${n}}`;
      sol = md`Two rungs up needs $\hat a_+^2$: $\hat a_+^2\ket{${n}} = \sqrt{${n + 1}}\sqrt{${n + 2}}\ket{${n + 2}} = ${rt(P)}\ket{${n + 2}}$. `
        + (isP ? md`In $\hat p^2 = -\tfrac{\hbar m\omega}{2}(\hat a_+ - \hat a_-)^2$ it carries a minus sign: $-${rt(P)} \approx ${f(ans)}$ units.`
          : md`In $\hat x^2 = \tfrac{\hbar}{2m\omega}(\hat a_+ + \hat a_-)^2$ it comes with $+1$: $${rt(P)} \approx ${f(ans)}$ units. This is why a superposition of $\ket{n}$ and $\ket{n+2}$ "breathes": its width oscillates at $2\omega$.`);
    } else if (v === 'x4') {
      ans = 6 * n * n + 6 * n + 3;
      q = md`Find $\bra{${n}}\hat x^4\ket{${n}}$ in units of $(\hbar/2m\omega)^2$.`;
      lbl = md`\bra{${n}}\hat x^4\ket{${n}}`;
      sol = md`$(\hat a_+ + \hat a_-)^4$ returns to $\ket{n}$ only through the six orderings with two raises and two lowers: $\hat a_+\hat a_+\hat a_-\hat a_- \to n(n-1)$, $\hat a_-\hat a_-\hat a_+\hat a_+ \to (n+1)(n+2)$, $\hat a_+\hat a_-\hat a_+\hat a_- \to n^2$, $\hat a_-\hat a_+\hat a_-\hat a_+ \to (n+1)^2$, and $\hat a_+\hat a_-\hat a_-\hat a_+$, $\hat a_-\hat a_+\hat a_+\hat a_- \to n(n+1)$ each. Sum: $6n^2 + 6n + 3 = ${ans}$ for $n = ${n}$.`;
    } else {
      ans = (2 * n + 1) / 4;
      q = md`In the stationary state $\ket{${n}}$, find $\langle V\rangle = \tfrac12m\omega^2\langle x^2\rangle$ in units of $\hbar\omega$.`;
      lbl = md`\langle V\rangle`;
      sol = md`$\langle x^2\rangle = \left(n+\tfrac12\right)\dfrac{\hbar}{m\omega}$, so $\langle V\rangle = \tfrac12m\omega^2\cdot${half(n)}\dfrac{\hbar}{m\omega} = ${fr(2 * n + 1, 4)}\hbar\omega$: exactly half of $E_{${n}} = ${half(n)}\hbar\omega$. In every oscillator stationary state $\langle T\rangle = \langle V\rangle$ (the virial theorem for $x^2$).`;
    }
    return { title: 'Ladder-operator matrix element', q, parts: [{ lbl, ans }], hints, sol };
  };

  // ================================================================ 2. superposition of two levels
  GENS.m2_sho_super = () => {
    const v = pick(['P', 'H', 'freq', 'xamp', 'xamp', 'sigH', 'x0p0', 'x0p0']);
    const [p, qq] = pick([[1, 1], [1, 2], [2, 1], [3, 4], [4, 3], [1, 3], [2, 3], [3, 1], [1, 4]]);
    const N = p * p + qq * qq;
    const n1 = ri(0, 3);
    const d = (v === 'xamp') ? pick([1, 1, 2]) : (v === 'x0p0' ? 1 : pick([1, 2]));
    const n2 = n1 + d;
    const PH = pick([[Math.PI / 2, '\\pi/2'], [Math.PI / 3, '\\pi/3'], [Math.PI, '\\pi'], [-Math.PI / 2, '-\\pi/2'], [Math.PI / 4, '\\pi/4'], [2 * Math.PI / 3, '2\\pi/3']]);
    const phase = v === 'x0p0' ? md`e^{i${PH[1]}}` : '';
    const st = md`$\Psi(x,0) = A\left[${p === 1 ? '' : p}\psi_{${n1}}(x) + ${qq === 1 ? '' : qq}${phase}\psi_{${n2}}(x)\right]$`;
    const Atex = md`A = 1/\sqrt{${N}}`;
    let q, parts, sol;
    const hints = [md`Normalize first: $|A|^2(${p}^2 + ${qq}^2) = 1$.`];
    if (v === 'P') {
      q = md`A harmonic oscillator starts in ${st}. What is the probability that an energy measurement gives $E_{${n2}} = ${half(n2)}\hbar\omega$?`;
      parts = [{ lbl: md`P(E_{${n2}})`, ans: qq * qq / N }];
      sol = md`$${Atex}$, so $P(E_{${n2}}) = |A|^2\cdot${qq}^2 = ${fr(qq * qq, N)} \approx ${f(qq * qq / N)}$. It never changes in time: each coefficient only picks up a phase.`;
    } else if (v === 'H') {
      const H = (p * p * (n1 + 0.5) + qq * qq * (n2 + 0.5)) / N;
      q = md`A harmonic oscillator starts in ${st}. Find $\langle H\rangle$ in units of $\hbar\omega$.`;
      parts = [{ lbl: md`\langle H\rangle`, ans: H }];
      sol = md`$P(E_{${n1}}) = ${fr(p * p, N)}$, $P(E_{${n2}}) = ${fr(qq * qq, N)}$, so $\langle H\rangle = ${fr(p * p, N)}\cdot${half(n1)} + ${fr(qq * qq, N)}\cdot${half(n2)} = ${fr(p * p * (2 * n1 + 1) + qq * qq * (2 * n2 + 1), 2 * N)} \approx ${f(H)}$. Between the two levels, closer to the heavier one.`;
    } else if (v === 'freq') {
      q = md`A harmonic oscillator starts in ${st}. $|\Psi(x,t)|^2$ oscillates in time. At what angular frequency, in units of $\omega$?`;
      parts = [{ lbl: md`\Omega/\omega`, ans: d }];
      sol = md`The cross term in $|\Psi|^2$ carries $e^{-i(E_{${n2}} - E_{${n1}})t/\hbar}$, and $E_{${n2}} - E_{${n1}} = ${d}\hbar\omega$: it oscillates at $${d === 1 ? '' : d}\omega$. `
        + (d === 1 ? md`Adjacent levels: the blob sloshes from side to side at the classical frequency.` : md`Two rungs apart: both states have the same parity, so the density stays symmetric and **breathes** (gets wider and narrower) at $2\omega$; $\langle x\rangle$ stays 0.`);
    } else if (v === 'xamp') {
      const amp = d === 1 ? 2 * p * qq * Math.sqrt(n1 + 1) / N : 0;
      q = md`A harmonic oscillator starts in ${st}. $\langle x\rangle(t)$ oscillates (or not). Find its amplitude in units of $\sqrt{\hbar/2m\omega}$.`;
      parts = [{ lbl: md`\text{amplitude of }\langle x\rangle`, ans: amp }];
      sol = d === 1
        ? md`$\hat x$ connects $\ket{${n1}}$ and $\ket{${n2}}$ with $\bra{${n1}}\hat x\ket{${n2}} = ${rt(n1 + 1)}\sqrt{\hbar/2m\omega}$. With real coefficients, $\langle x\rangle = 2c_{${n1}}c_{${n2}}\cdot${rt(n1 + 1)}\sqrt{\tfrac{\hbar}{2m\omega}}\cos\omega t$, amplitude $2\cdot\dfrac{${p}\cdot${qq}}{${N}}\cdot${rt(n1 + 1)} \approx ${f(amp)}$ units. That is smaller than the ground-state width: a quantum-sized wiggle.`
        : md`$\hat x$ only connects levels one rung apart, and these are two apart: every term of $\langle x\rangle$ vanishes, so $\langle x\rangle = 0$ for all $t$ and the amplitude is $0$. Both states have the same parity: the density breathes at $2\omega$ instead of sloshing.`;
    } else if (v === 'sigH') {
      const s = p * qq * d / N;
      q = md`A harmonic oscillator starts in ${st}. Find the energy uncertainty $\sigma_H$ in units of $\hbar\omega$.`;
      parts = [{ lbl: md`\sigma_H`, ans: s }];
      sol = md`Two outcomes with probabilities $P_1 = ${fr(p * p, N)}$, $P_2 = ${fr(qq * qq, N)}$ separated by $\Delta E = ${d}\hbar\omega$: $\sigma_H = \sqrt{P_1P_2}\,\Delta E = \dfrac{${p}\cdot${qq}}{${N}}\cdot${d} \approx ${f(s)}$. The energy–time relation then says the state changes on a time scale $\gtrsim \hbar/2\sigma_H$.`;
    } else {
      const A = 2 * p * qq * Math.sqrt(n1 + 1) / N;
      const x0 = clean(A * Math.cos(PH[0])), p0 = clean(A * Math.sin(PH[0]));
      q = md`A harmonic oscillator starts in ${st}. Find $\langle x\rangle$ at $t = 0$ in units of $\sqrt{\hbar/2m\omega}$ and $\langle p\rangle$ at $t = 0$ in units of $\sqrt{\hbar m\omega/2}$.`;
      parts = [{ lbl: md`\langle x\rangle(0)`, ans: x0 }, { lbl: md`\langle p\rangle(0)`, ans: p0 }];
      sol = md`With $c_{${n1}} = ${p === 1 ? '' : p}A$ and $c_{${n2}} = ${qq === 1 ? '' : qq}Ae^{i\phi}$, $\phi = ${PH[1]}$, $A^2 = 1/${N}$, and $\bra{${n1}}\hat x\ket{${n2}} = ${rt(n1 + 1)}\sqrt{\tfrac{\hbar}{2m\omega}}$: $\langle x\rangle = 2${n1 ? rt(n1 + 1) : ''}\,\text{Re}\left(c_{${n1}}^*c_{${n2}}e^{-i\omega t}\right) = ${f(A)}\cos(\phi - \omega t)$ units, and by Ehrenfest $\langle p\rangle = m\,d\langle x\rangle/dt = ${f(A)}\sin(\phi - \omega t)$ units of $\sqrt{\hbar m\omega/2}$. At $t = 0$: $\langle x\rangle = ${f(A)}\cos(${PH[1]}) = ${f(x0)}$, $\langle p\rangle = ${f(A)}\sin(${PH[1]}) = ${f(p0)}$. **The relative phase sets where on the (clockwise) phase-space circle the state starts.**`;
    }
    return { title: 'Oscillator superposition', q, parts, hints, sol };
  };

  // ================================================================ 3. physical numbers
  GENS.m2_sho_numbers = () => {
    const v = pick(['width', 'photon', 'turn', 'zero', 'ion', 'macro']);
    let q, parts, sol, hints;
    if (v === 'width') {
      const E = pick([0.25, 0.5, 1, 2, 4, 0.1]);
      const w = HBARC / Math.sqrt(MEC2 * E);
      q = md`An electron is bound in a harmonic potential with level spacing $\hbar\omega = ${E}$ eV. Find the ground-state width $w_x = \sqrt{\hbar/m\omega}$ in nm.`;
      parts = [{ lbl: 'w_x', ans: w, unit: 'nm' }];
      hints = [md`Multiply top and bottom by $c$: $w_x = \dfrac{\hbar c}{\sqrt{(mc^2)(\hbar\omega)}}$ with $\hbar c = 197.3$ eV·nm, $m_ec^2 = 0.511$ MeV.`];
      sol = md`$w_x = \dfrac{197.3}{\sqrt{511\,000\times${E}}} = ${f(w, 3)}$ nm. Atomic-size: electrons bound with eV spacings live in a few ångströms.`;
    } else if (v === 'photon') {
      const E = pick([0.1, 0.2, 0.25, 0.37, 0.5, 0.05]);
      const lam = HC / E / 1000;
      q = md`A molecular vibration is modeled as an oscillator with $\hbar\omega = ${E}$ eV. What wavelength of light does the $n = 1 \to 0$ transition emit, in μm?`;
      parts = [{ lbl: '\\lambda', ans: lam, unit: 'μm' }];
      hints = [md`$\lambda = hc/\Delta E$ with $hc = 1240$ eV·nm.`];
      sol = md`$\Delta E = E_1 - E_0 = \hbar\omega = ${E}$ eV (all oscillator gaps are equal), so $\lambda = \dfrac{1240\ \text{eV·nm}}{${E}\ \text{eV}} = ${f(lam * 1000, 4)}$ nm $= ${f(lam, 3)}$ μm: infrared, as molecular vibrations are.`;
    } else if (v === 'turn') {
      const n = ri(0, 20);
      const t = Math.sqrt(2 * n + 1);
      q = md`A classical oscillator has the same energy as the stationary state $n = ${n}$, $E = ${half(n)}\hbar\omega$. Find its turning point $x_n$ in units of the ground-state width $w_x = \sqrt{\hbar/m\omega}$.`;
      parts = [{ lbl: 'x_n/w_x', ans: t }];
      hints = [md`$\tfrac12m\omega^2x_n^2 = \hbar\omega\left(n+\tfrac12\right)$.`];
      sol = md`$x_n^2 = \dfrac{2\hbar\omega(n+\frac12)}{m\omega^2} = (2n+1)\dfrac{\hbar}{m\omega}$, so $x_n = \sqrt{2n+1}\,w_x = ${rt(2 * n + 1)}\,w_x \approx ${f(t)}\,w_x$. ${n === 0 ? md`For the ground state the turning point is at $w_x$ itself: the quantum particle is found beyond it about 16% of the time (tunneling into the forbidden region).` : md`It grows like $\sqrt n$: highly excited states are wide, and in units of $w_x$ the orbit becomes large (the classical limit).`}`;
    } else if (v === 'zero') {
      const fT = pick([1, 2, 5, 10, 20, 30, 60]);
      const E0 = 4.13567 * fT / 2;
      q = md`A lattice vibration (phonon mode) oscillates at $f = ${fT}$ THz. Find its zero-point energy $E_0 = \tfrac12\hbar\omega$ in meV.`;
      parts = [{ lbl: 'E_0', ans: E0, unit: 'meV' }];
      hints = [md`$\hbar\omega = hf$ with $h = 4.136\times10^{-15}$ eV·s.`];
      sol = md`$\hbar\omega = hf = 4.136\times10^{-15}\times${fT}\times10^{12}$ eV $= ${f(2 * E0, 4)}$ meV, so $E_0 = ${f(E0, 4)}$ meV. It cannot be removed: even at $T = 0$ the mode keeps this energy (the uncertainty relation forbids $\sigma_x = \sigma_p = 0$).`;
    } else if (v === 'ion') {
      const ion = pick([['{}^9\\text{Be}^+', 9], ['{}^{40}\\text{Ca}^+', 40], ['{}^{171}\\text{Yb}^+', 171], ['{}^{25}\\text{Mg}^+', 25]]);
      const fM = pick([0.5, 1, 2, 3]);
      const m = ion[1] * 1.66054e-27, om = 2 * Math.PI * fM * 1e6;
      const w = Math.sqrt(1.054572e-34 / (m * om)) * 1e9;
      q = md`A trapped ion $${ion[0]}$ (mass $${ion[1]}$ u, $1\text{ u} = 1.661\times10^{-27}$ kg) sits in a harmonic trap with $\omega = 2\pi\times${fM}$ MHz. Find its ground-state width $w_x = \sqrt{\hbar/m\omega}$ in nm.`;
      parts = [{ lbl: 'w_x', ans: w, unit: 'nm' }];
      hints = [md`$\hbar = 1.055\times10^{-34}$ J·s; work in SI and convert at the end.`];
      sol = md`$m = ${sci(m)}$ kg, $\omega = ${sci(om)}$ s$^{-1}$, $w_x = \sqrt{\dfrac{1.055\times10^{-34}}{(${sci(m)})(${sci(om)})}}$ m $= ${f(w, 3)}$ nm. Tens of nanometers: much bigger than an atom, which is why trapped ions can be laser-cooled into the oscillator ground state and imaged as quantum oscillators.`;
    } else {
      const k = pick([1, 10, 100]), A = pick([1, 2, 5]), mkg = 0.1;
      const om = Math.sqrt(k / mkg), E = 0.5 * k * (A / 100) ** 2, n = E / (1.054572e-34 * om);
      const L = Math.log10(n);
      q = md`A $100$ g mass on a spring with $k = ${k}$ N/m oscillates with amplitude $${A}$ cm. Which quantum number $n$ has $E_n$ equal to its energy? Enter $\log_{10} n$.`;
      parts = [{ lbl: '\\log_{10}n', ans: L }];
      hints = [md`$E = \tfrac12kA^2$, $\omega = \sqrt{k/m}$, $n \approx E/\hbar\omega$.`];
      sol = md`$\omega = \sqrt{${k}/0.1} = ${f(om, 4)}$ s$^{-1}$, $E = \tfrac12(${k})(${A / 100})^2 = ${f(E, 3)}$ J, $\hbar\omega = ${f(1.054572e-34 * om, 3)}$ J, so $n \approx ${f(n, 3)}$ and $\log_{10}n \approx ${f(L, 4)}$. The spacing $\hbar\omega$ is $10^{${Math.round(L)}}$ times smaller than $E$: the levels look continuous, the classical limit ($n \gg 1$).`;
    }
    return { title: 'Oscillator numbers', q, parts, hints, sol };
  };

  // ================================================================ 4. widths and uncertainties
  GENS.m2_sho_sigma = () => {
    const v = pick(['sx', 'sp', 'prod', 'ratio', 'breathe', 'breathe']);
    const n = ri(0, 8);
    let q, parts, sol, hints = [md`$\langle x\rangle = \langle p\rangle = 0$ in any $\ket{n}$; $\langle x^2\rangle = (n+\tfrac12)\tfrac{\hbar}{m\omega}$, $\langle p^2\rangle = (n+\tfrac12)\hbar m\omega$.`];
    if (v === 'sx') {
      q = md`Find $\sigma_x$ in the oscillator state $\ket{${n}}$, in units of $\sqrt{\hbar/m\omega}$.`;
      parts = [{ lbl: '\\sigma_x', ans: Math.sqrt(n + 0.5) }];
      sol = md`$\langle x\rangle = 0$ (parity, or: $\hat x$ changes $n$ by one), $\langle x^2\rangle = ${half(n)}\tfrac{\hbar}{m\omega}$, so $\sigma_x = \sqrt{${half(n)}} \approx ${f(Math.sqrt(n + 0.5))}$ units.`;
    } else if (v === 'sp') {
      q = md`Find $\sigma_p$ in the oscillator state $\ket{${n}}$, in units of $\sqrt{\hbar m\omega}$.`;
      parts = [{ lbl: '\\sigma_p', ans: Math.sqrt(n + 0.5) }];
      sol = md`$\langle p\rangle = 0$, $\langle p^2\rangle = ${half(n)}\hbar m\omega$, so $\sigma_p = \sqrt{${half(n)}} \approx ${f(Math.sqrt(n + 0.5))}$ units. Same number as $\sigma_x$ in its units: the oscillator treats $x$ and $p$ symmetrically.`;
    } else if (v === 'prod') {
      q = md`Find $\sigma_x\sigma_p$ in the oscillator state $\ket{${n}}$, in units of $\hbar$.`;
      parts = [{ lbl: '\\sigma_x\\sigma_p/\\hbar', ans: n + 0.5 }];
      sol = md`$\sigma_x\sigma_p = \sqrt{(n+\tfrac12)\tfrac{\hbar}{m\omega}}\sqrt{(n+\tfrac12)\hbar m\omega} = (n+\tfrac12)\hbar = ${half(n)}\hbar$. Only $n = 0$ reaches the limit $\hbar/2$ (it is a Gaussian).`;
    } else if (v === 'ratio') {
      q = md`For the stationary state $\ket{${n}}$, find $\sigma_x/x_n$, where $x_n$ is the turning point of a classical oscillator with the same energy.`;
      parts = [{ lbl: '\\sigma_x/x_n', ans: Math.SQRT1_2 }];
      hints = [md`$x_n = \sqrt{2n+1}\sqrt{\hbar/m\omega}$.`];
      sol = md`$\sigma_x = \sqrt{n+\tfrac12}\sqrt{\tfrac{\hbar}{m\omega}}$ and $x_n = \sqrt{2n+1}\sqrt{\tfrac{\hbar}{m\omega}}$: the ratio is $\sqrt{\tfrac{n+1/2}{2n+1}} = \tfrac{1}{\sqrt2} \approx 0.707$ for **every** $n$. A classical oscillator with amplitude $x_0$ also has $\langle x^2\rangle_{\text{time}} = x_0^2/2$: the stationary state spreads over the classical orbit.`;
    } else {
      const [a, b] = pick([[1, 1], [3, 1], [2, 1], [1, 2], [4, 1], [1, 3]]);
      const N = a * a + b * b;
      const s0 = ((a * a + 5 * b * b) + 2 * Math.SQRT2 * a * b) / (2 * N);
      const s1 = ((a * a + 5 * b * b) - 2 * Math.SQRT2 * a * b) / (2 * N);
      q = md`An oscillator starts in $\Psi(x,0) = \dfrac{1}{\sqrt{${N}}}\left[${a === 1 ? '' : a}\psi_0 + ${b === 1 ? '' : b}\psi_2\right]$. Find $\sigma_x^2$ at $t = 0$ and at $t = \pi/2\omega$ (a quarter period), in units of $\hbar/m\omega$.`;
      parts = [{ lbl: '\\sigma_x^2(0)', ans: s0 }, { lbl: '\\sigma_x^2(\\pi/2\\omega)', ans: s1 }];
      hints = [md`$\langle x\rangle = 0$ always (no adjacent levels). $\bra0\hat x^2\ket0 = \tfrac12$, $\bra2\hat x^2\ket2 = \tfrac52$, $\bra0\hat x^2\ket2 = \tfrac{\sqrt2}{2}$ (units $\hbar/m\omega$).`, md`The cross term picks up $e^{-i(E_2 - E_0)t/\hbar} = e^{-2i\omega t}$, which is $-1$ at $t = \pi/2\omega$.`];
      sol = md`$\sigma_x^2 = \langle x^2\rangle = \dfrac{1}{${N}}\left[${a * a}\cdot\tfrac12 + ${b * b}\cdot\tfrac52 + 2\cdot${a * b}\cdot\tfrac{\sqrt2}{2}\cos2\omega t\right]$. At $t = 0$: $${f(s0)}$. At $\omega t = \pi/2$ the cross term flips sign: $${f(s1)}$. The packet **breathes** at $2\omega$.${s1 < 0.5 ? md` Note $${f(s1)} < \tfrac12$: at that moment it is narrower than the ground state (a squeezed state), paid for with a wider momentum spread.` : ''}`;
    }
    return { title: 'Oscillator widths', q, parts, hints, sol };
  };

  // ================================================================ 5. coherent states
  GENS.m2_coherent = () => {
    const v = pick(['nbar', 'Pn', 'sig', 'x0', 'amp', 'p0', 'sigH', 'mode', 'P0', 'quarter']);
    let A;
    if (v === 'mode') A = pick([[1.5, 0], [2.5, 0], [1.8, 0], [2.2, 0], [0, 1.5], [3.2, 0]]);
    else A = pick([[1, 0], [2, 0], [0, 1], [1, 1], [1, -1], [2, 1], [1, 2], [-1, 1], [0, 2], [1.5, 0], [3, 0], [0, -2]]);
    const [re, im] = A;
    const mod2 = re * re + im * im, mod = Math.sqrt(mod2);
    const atex = (() => {
      const r = re ? `${re}` : '', i = im ? `${im === 1 ? '' : im === -1 ? '-' : im}i` : '';
      if (re && im) return `${r} ${im > 0 ? '+' : '-'} ${Math.abs(im) === 1 ? '' : Math.abs(im)}i`;
      return r || i;
    })();
    const intro = md`An oscillator is in the coherent state $\ket\alpha$ with $\alpha = ${atex}$ ($\hat a_-\ket\alpha = \alpha\ket\alpha$).`;
    let hints = [md`$\ket\alpha = e^{-|\alpha|^2/2}\sum_n\dfrac{\alpha^n}{\sqrt{n!}}\ket{n}$, $\alpha(t) = \alpha e^{-i\omega t}$; $\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}(\alpha + \alpha^*)$, $\langle p\rangle = i\sqrt{\tfrac{\hbar m\omega}{2}}(\alpha^* - \alpha)$.`];
    let q, parts, sol;
    if (v === 'nbar') {
      q = md`${intro} Find $\langle n\rangle$, the mean number of quanta.`;
      parts = [{ lbl: '\\langle n\\rangle', ans: mod2 }];
      sol = md`$\langle n\rangle = \bra\alpha\hat a_+\hat a_-\ket\alpha = \alpha^*\alpha = |\alpha|^2 = ${f(mod2)}$ (use $\bra\alpha\hat a_+ = \alpha^*\bra\alpha$). So $\langle H\rangle = \hbar\omega(|\alpha|^2 + \tfrac12)$.`;
    } else if (v === 'Pn') {
      const n = ri(0, 4);
      let fact = 1; for (let k = 2; k <= n; k++) fact *= k;
      const P = Math.exp(-mod2) * mod2 ** n / fact;
      q = md`${intro} An energy measurement is made. Find the probability of $E_{${n}} = ${half(n)}\hbar\omega$.`;
      parts = [{ lbl: md`P(n = ${n})`, ans: P }];
      sol = md`$P(n) = |c_n|^2 = e^{-|\alpha|^2}\dfrac{|\alpha|^{2n}}{n!}$, a Poisson distribution with mean $|\alpha|^2 = ${f(mod2)}$: $P(${n}) = e^{-${f(mod2)}}\dfrac{${f(mod2)}^{${n}}}{${fact}} \approx ${f(P, 3)}$. Only $|\alpha|$ matters; the phase of $\alpha$ does not change energy probabilities.`;
    } else if (v === 'sig') {
      const rel = Math.random() < 0.5;
      q = rel ? md`${intro} Find the relative spread $\sigma_n/\langle n\rangle$ of the number of quanta.` : md`${intro} Find the spread $\sigma_n$ of the number of quanta.`;
      parts = [{ lbl: rel ? '\\sigma_n/\\langle n\\rangle' : '\\sigma_n', ans: rel ? 1 / mod : mod }];
      sol = md`Poisson: variance = mean $= |\alpha|^2$, so $\sigma_n = |\alpha| = ${f(mod)}$${rel ? md` and $\sigma_n/\langle n\rangle = 1/|\alpha| = ${f(1 / mod)}$. It shrinks as $|\alpha|$ grows: big coherent states have sharply defined energy in relative terms (classical).` : '.'}`;
    } else if (v === 'x0') {
      q = md`${intro} Find $\langle x\rangle$ at $t = 0$ in units of $\sqrt{\hbar/2m\omega}$.`;
      parts = [{ lbl: '\\langle x\\rangle(0)', ans: 2 * re }];
      sol = md`$\langle x\rangle = \sqrt{\tfrac{\hbar}{2m\omega}}\bra\alpha(\hat a_+ + \hat a_-)\ket\alpha = \sqrt{\tfrac{\hbar}{2m\omega}}(\alpha^* + \alpha) = 2\,\text{Re}\,\alpha = ${f(2 * re)}$ units. The real part of $\alpha$ is the position, the imaginary part the momentum.`;
    } else if (v === 'p0') {
      q = md`${intro} Find $\langle p\rangle$ at $t = 0$ in units of $\sqrt{\hbar m\omega/2}$.`;
      parts = [{ lbl: '\\langle p\\rangle(0)', ans: 2 * im }];
      sol = md`$\langle p\rangle = i\sqrt{\tfrac{\hbar m\omega}{2}}(\alpha^* - \alpha) = i\sqrt{\tfrac{\hbar m\omega}{2}}(-2i\,\text{Im}\,\alpha) = 2\,\text{Im}\,\alpha = ${f(2 * im)}$ units.`;
    } else if (v === 'amp') {
      q = md`${intro} $\langle x\rangle(t)$ oscillates. Find its amplitude in units of $\sqrt{\hbar/2m\omega}$.`;
      parts = [{ lbl: '\\text{amplitude}', ans: 2 * mod }];
      sol = md`$\alpha(t) = \alpha e^{-i\omega t}$, so $\langle x\rangle(t) = 2\,\text{Re}\left(\alpha e^{-i\omega t}\right) = 2|\alpha|\cos(\omega t - \varphi)$ units: amplitude $2|\alpha| = ${f(2 * mod)}$. Meanwhile $\sigma_x$ stays at the ground-state value: a blob riding around the classical orbit.`;
    } else if (v === 'quarter') {
      q = md`${intro} Find $\langle x\rangle$ at $t = \pi/2\omega$ (a quarter period) in units of $\sqrt{\hbar/2m\omega}$.`;
      parts = [{ lbl: '\\langle x\\rangle(\\pi/2\\omega)', ans: 2 * im }];
      sol = md`$\alpha(t) = \alpha e^{-i\omega t} = \alpha e^{-i\pi/2} = -i\alpha$ at a quarter period, so $\langle x\rangle = 2\,\text{Re}(-i\alpha) = 2\,\text{Im}\,\alpha = ${f(2 * im)}$ units. The point $\alpha$ rotates clockwise in the complex plane, just like $(x, p)$ in phase space.`;
    } else if (v === 'sigH') {
      const r = mod / (mod2 + 0.5);
      q = md`${intro} Find $\sigma_H/\langle H\rangle$.`;
      parts = [{ lbl: '\\sigma_H/\\langle H\\rangle', ans: r }];
      sol = md`$\langle H\rangle = \hbar\omega(|\alpha|^2 + \tfrac12) = ${f(mod2 + 0.5)}\hbar\omega$, $\sigma_H = \hbar\omega\,\sigma_n = \hbar\omega|\alpha| = ${f(mod)}\hbar\omega$: ratio $${f(r)}$. A stationary state $\ket{N}$ with the same energy has $\sigma_H = 0$ but does not move: motion costs energy spread.`;
    } else if (v === 'mode') {
      const m = Math.floor(mod2 + 1e-9);
      q = md`${intro} Which number of quanta $n$ is the most likely outcome of an energy measurement?`;
      parts = [{ lbl: 'n_{\\text{most likely}}', ans: m }];
      hints = [md`Compare neighbors: $P(n)/P(n-1) = |\alpha|^2/n$.`];
      sol = md`$P(n)/P(n-1) = |\alpha|^2/n = ${f(mod2)}/n$: the probabilities grow while $n < ${f(mod2)}$ and shrink after. The peak is at $n = ${m}$.`;
    } else {
      q = md`${intro} Find the probability that the oscillator is found in its ground state.`;
      parts = [{ lbl: 'P(n = 0)', ans: Math.exp(-mod2) }];
      sol = md`$P(0) = |c_0|^2 = e^{-|\alpha|^2} = e^{-${f(mod2)}} \approx ${f(Math.exp(-mod2), 3)}$.`;
    }
    return { title: 'Coherent state', q, parts, hints, sol };
  };

  // ================================================================ 6. Ehrenfest and conservation
  const CONS = [
    { sys: md`a free particle, $\hat H = \hat p^2/2m$`, Q: md`$\hat p$`, yes: true, why: md`$[\hat p^2, \hat p] = 0$: momentum is conserved when nothing pushes.` },
    { sys: md`the oscillator $\hat H = \hat p^2/2m + \tfrac12m\omega^2\hat x^2$`, Q: md`$\hat p$`, yes: false, why: md`$[\hat H, \hat p] = i\hbar m\omega^2\hat x$, so $d\langle p\rangle/dt = -m\omega^2\langle x\rangle$: the spring pushes.` },
    { sys: md`the oscillator`, Q: md`the parity operator $\hat\Pi$ ($\psi(x) \to \psi(-x)$)`, yes: true, why: md`$V(x) = V(-x)$ and $\hat p^2$ is unchanged by $x \to -x$, so $[\hat H, \hat\Pi] = 0$.` },
    { sys: md`$\hat H = \hat p^2/2m + \lambda\hat x^3$`, Q: md`the parity operator $\hat\Pi$`, yes: false, why: md`$x^3$ is odd: the potential is not mirror symmetric, so $[\hat H, \hat\Pi] \ne 0$.` },
    { sys: md`a particle in a central potential $V(r)$`, Q: md`$\hat L_z$`, yes: true, why: md`$V(r)$ is unchanged by rotations about $z$ and $[\hat L_z, \hat p^2] = 0$, so $[\hat H, \hat L_z] = 0$.` },
    { sys: md`a particle in a central potential $V(r)$`, Q: md`$\hat L^2$`, yes: true, why: md`Every component of $\hat L$ commutes with $\hat H$ for $V(r)$, so $\hat L^2$ does too.` },
    { sys: md`a particle in $V = V(r) + Fz$ (a central potential plus a uniform force along $-z$)`, Q: md`$\hat L_z$`, yes: true, why: md`$[\hat L_z, z] = 0$: the extra force is along $z$, so it has no torque about $z$.` },
    { sys: md`a particle in $V = V(r) + Fx$`, Q: md`$\hat L_z$`, yes: false, why: md`$[\hat L_z, x] = i\hbar y$: a force along $x$ exerts a torque about $z$; $d\langle L_z\rangle/dt = F\langle y\rangle$.` },
    { sys: md`a rigid rotor with $\hat H = \hat L^2/2I - \epsilon\hat L_z^2/2I$`, Q: md`$\hat L_x$`, yes: false, why: md`$[\hat L_z^2, \hat L_x] \ne 0$: the body is not symmetric about $x$, so $L_x$ is not conserved (only $L^2$ and $L_z$ are).` },
    { sys: md`a qubit with $\hat H = -\hbar\omega\sigma_z$`, Q: md`$\sigma_x$`, yes: false, why: md`$[\sigma_z, \sigma_x] = 2i\sigma_y$: $\langle\sigma_x\rangle$ precesses about $z$ (the Bloch vector rotates).` },
    { sys: md`a qubit with $\hat H = -\hbar\omega\sigma_z$`, Q: md`$\sigma_z$`, yes: true, why: md`Any operator commutes with itself: $\langle\sigma_z\rangle$ is constant (Lecture 12).` },
    { sys: md`the oscillator`, Q: md`$\hat a_+\hat a_-$ (the number operator)`, yes: true, why: md`$\hat H = \hbar\omega(\hat a_+\hat a_- + \tfrac12)$: a function of $\hat H$ commutes with $\hat H$.` },
  ];
  GENS.m2_ehrenfest = () => {
    const v = pick(['cons', 'cons', 'cons', 'virial', 'classical', 'exact', 'comm']);
    let q, parts, sol, hints = [md`$\dfrac{d\langle Q\rangle}{dt} = \dfrac{i}{\hbar}\left\langle[\hat H, \hat Q]\right\rangle + \left\langle\dfrac{\partial\hat Q}{\partial t}\right\rangle$.`];
    if (v === 'cons') {
      const c = pick(CONS);
      q = md`For ${c.sys}, is $\langle Q\rangle$ conserved for every state, with $\hat Q = $ ${c.Q}?`;
      const R = c.yes
        ? mix([md`Yes: $[\hat H, \hat Q] = 0$`, md`Yes: $\hat Q$ is Hermitian`, md`No: $[\hat H, \hat Q] \ne 0$`, md`Only in stationary states`],
          [null, md`Hermitian only makes the average real. Conservation needs $[\hat H, \hat Q] = 0$.`, md`Check the commutator again.`, md`In a stationary state every $\langle Q\rangle$ is constant; "conserved" means for every state, and here it is.`])
        : mix([md`No: $[\hat H, \hat Q] \ne 0$`, md`Yes: $[\hat H, \hat Q] = 0$`, md`Yes: $\hat Q$ is Hermitian`, md`Yes: $\hat H$ has no explicit time dependence`],
          [null, md`Compute it: it is not zero.`, md`Hermitian only makes the average real.`, md`That conserves energy, not $Q$.`]);
      parts = [R];
      sol = c.why;
    } else if (v === 'virial') {
      const K = pick([[2, md`\tfrac12m\omega^2x^2`, '1D'], [4, md`\lambda x^4`, '1D'], [-1, md`-k/r`, '3D'], [1, md`F|x|`, '1D'], [6, md`\lambda x^6`, '1D']]);
      const k = K[0];
      const askT = Math.random() < 0.6;
      const ans = askT ? k / (k + 2) : 2 / (k + 2);
      q = md`A particle is in a stationary state of $V = ${K[1]}$ (${K[2]}) with energy $E$. Find ${askT ? md`$\langle T\rangle/E$` : md`$\langle V\rangle/E$`}.`;
      parts = [{ lbl: askT ? '\\langle T\\rangle/E' : '\\langle V\\rangle/E', ans }];
      hints = [md`Apply the generalized Ehrenfest theorem to $\hat Q = \hat x\hat p$ (or $\hat{\mathbf r}\cdot\hat{\mathbf p}$): in a stationary state $d\langle Q\rangle/dt = 0$.`];
      sol = md`$\dfrac{d\langle xp\rangle}{dt} = 2\langle T\rangle - \langle xV'\rangle$ (in 3D, $\mathbf r\cdot\nabla V$), and for $V\propto x^{${k}}$ that is $${k}V$. Stationary: $0 = 2\langle T\rangle - ${k}\langle V\rangle$, so $\langle T\rangle = ${fr(k, 2)}\langle V\rangle$. With $\langle T\rangle + \langle V\rangle = E$: $\langle T\rangle = ${fr(k, k + 2)}E$, $\langle V\rangle = ${fr(2, k + 2)}E$. Answer $${f(ans)}$.${k === -1 ? md` (Hydrogen: $\langle T\rangle = -E = 13.6$ eV in the ground state.)` : ''}`;
    } else if (v === 'classical') {
      const TH = pick([[Math.PI / 3, '\\pi/3'], [Math.PI / 2, '\\pi/2'], [2 * Math.PI / 3, '2\\pi/3'], [Math.PI, '\\pi'], [Math.PI / 4, '\\pi/4'], [Math.PI / 6, '\\pi/6']]);
      const r = pick([0, 0.5, 1, 2, -1]);
      const ans = clean(Math.cos(TH[0]) + r * Math.sin(TH[0]));
      q = md`An oscillator state has $\langle x\rangle = X$ and $\langle p\rangle = ${r === 0 ? '0' : md`${r === 1 ? '' : r === -1 ? '-' : r}m\omega X`}$ at $t = 0$. Find $\langle x\rangle$ at $\omega t = ${TH[1]}$, in units of $X$.`;
      parts = [{ lbl: md`\langle x\rangle/X`, ans }];
      hints = [md`Ehrenfest: $d\langle x\rangle/dt = \langle p\rangle/m$, $d\langle p\rangle/dt = -m\omega^2\langle x\rangle$. For the oscillator these close on themselves.`];
      sol = md`Because $V'$ is linear in $x$, $\langle V'\rangle = m\omega^2\langle x\rangle$ exactly, and the averages obey the classical equations: $\langle x\rangle = X\cos\omega t + \dfrac{\langle p\rangle_0}{m\omega}\sin\omega t$. At $\omega t = ${TH[1]}$: $\cos(${TH[1]}) ${r < 0 ? '-' : '+'} ${Math.abs(r)}\sin(${TH[1]}) = ${f(ans)}$. This holds for any state, quantum or not.`;
    } else if (v === 'exact') {
      const R = mix([md`$V = ax^2 + bx + c$`, md`$V = \lambda x^4$`, md`$V = V_0\cos kx$`, md`Any $V$, by Ehrenfest's theorem`],
        [null, md`$d\langle p\rangle/dt = -4\lambda\langle x^3\rangle \ne -4\lambda\langle x\rangle^3$ in general.`, md`$\langle\sin kx\rangle \ne \sin k\langle x\rangle$.`, md`Ehrenfest gives $-\langle V'(x)\rangle$, which equals $-V'(\langle x\rangle)$ only if $V'$ is linear.`]);
      q = md`For which potential does $\langle x\rangle(t)$ obey Newton's law $m\,d^2\langle x\rangle/dt^2 = -V'(\langle x\rangle)$ **exactly**, for every state?`;
      parts = [R];
      sol = md`Ehrenfest: $m\,d^2\langle x\rangle/dt^2 = -\langle V'(x)\rangle$. This equals $-V'(\langle x\rangle)$ for every state only if $V'$ is linear: quadratic (or linear, or constant) potentials. That is why the oscillator's averages are exactly classical.`;
    } else {
      const F = pick([
        [md`\hat x^2`, md`2i\hbar\hat x`, md`2\hat x`, md`-2i\hbar\hat x`],
        [md`\hat x^3`, md`3i\hbar\hat x^2`, md`3\hat x^2`, md`-3i\hbar\hat x^2`],
        [md`e^{k\hat x}`, md`i\hbar k\,e^{k\hat x}`, md`k\,e^{k\hat x}`, md`-i\hbar k\,e^{k\hat x}`],
        [md`\sin k\hat x`, md`i\hbar k\cos k\hat x`, md`k\cos k\hat x`, md`-i\hbar k\cos k\hat x`],
      ]);
      const R = mix([md`$${F[1]}$`, md`$${F[3]}$`, md`$${F[2]}$`, md`$0$`],
        [null, md`Sign: $[\hat x, \hat p] = +i\hbar$, and $[f(\hat x), \hat p] = +i\hbar f'(\hat x)$.`, md`Missing the $i\hbar$.`, md`$f(\hat x)$ commutes with $\hat x$, not with $\hat p$.`]);
      q = md`Find $[${F[0]}, \hat p]$.`;
      parts = [R];
      hints = [md`Act on a test function: $[f, \hat p]g = -i\hbar(fg' - (fg)')$.`];
      sol = md`$[f(\hat x), \hat p]g = -i\hbar\left(fg' - f'g - fg'\right) = i\hbar f'g$, so $[f(\hat x), \hat p] = i\hbar f'(\hat x) = ${F[1]}$. Used in Ehrenfest: $\tfrac{i}{\hbar}[V, \hat p] = -V'$.`;
    }
    return { title: 'Ehrenfest and conservation', q, parts, hints, sol };
  };

  // ================================================================ 7. angular-momentum spectrum
  GENS.m2_L_spectrum = () => {
    const v = pick(['count', 'maxLz', 'angle', 'minL2', 'Lx2', 'sLx', 'possible']);
    const l = ri(1, 5);
    const LL = l * (l + 1);
    let q, parts, sol, hints = [md`$L^2 = \hbar^2\ell(\ell+1)$ with $\ell = 0, 1, 2, \dots$; $L_z = m\hbar$ with $m = -\ell, \dots, \ell$.`];
    if (v === 'count') {
      q = md`A measurement of $L^2$ gives $${LL}\hbar^2$. How many different values can a subsequent measurement of $L_z$ give?`;
      parts = [{ lbl: '\\text{number of }L_z\\text{ values}', ans: 2 * l + 1 }];
      sol = md`$\ell(\ell+1) = ${LL}$ gives $\ell = ${l}$, so $m = -${l}, \dots, ${l}$: $2\ell + 1 = ${2 * l + 1}$ values. (The same list for $L_x$ or $L_y$: nothing is special about $z$.)`;
    } else if (v === 'maxLz') {
      q = md`A particle has $L^2 = ${LL}\hbar^2$. Find the largest possible $L_z$ in units of $\hbar$, and compare with $|\mathbf L|$.`;
      parts = [{ lbl: 'L_{z,\\max}/\\hbar', ans: l }];
      sol = md`$\ell = ${l}$, so $L_{z,\max} = ${l}\hbar$, while $|\mathbf L| = \sqrt{${LL}}\hbar \approx ${f(Math.sqrt(LL))}\hbar$. Always $L_{z,\max} < |\mathbf L|$: if $L_z$ equalled $|\mathbf L|$, then $L_x = L_y = 0$ would be sharp too, which the commutators forbid.`;
    } else if (v === 'angle') {
      const th = Math.acos(l / Math.sqrt(LL)) * DEG;
      q = md`In the vector model, a state with $\ell = ${l}$, $m = ${l}$ has $\mathbf L$ on a cone around $z$. Find the half-angle of the cone (the smallest possible angle between $\mathbf L$ and the $z$ axis) in degrees.`;
      parts = [{ lbl: '\\theta_{\\min}', ans: th, unit: '°' }];
      sol = md`$\cos\theta = \dfrac{m}{\sqrt{\ell(\ell+1)}} = \dfrac{${l}}{\sqrt{${LL}}}$, so $\theta = ${f(th, 4)}°$. It shrinks as $\ell$ grows ($\to 0$ classically) but never reaches 0.`;
    } else if (v === 'minL2') {
      const m = ri(-4, 4) || 2;
      const am = Math.abs(m);
      q = md`A measurement of $L_z$ gives $${m === 1 ? '' : m === -1 ? '-' : m}\hbar$. What is the smallest value a subsequent measurement of $L^2$ could give, in units of $\hbar^2$?`;
      parts = [{ lbl: 'L^2_{\\min}/\\hbar^2', ans: am * (am + 1) }];
      sol = md`$m = ${m}$ needs $\ell \ge |m| = ${am}$, so $L^2 \in \{${am * (am + 1)}, ${(am + 1) * (am + 2)}, ${(am + 2) * (am + 3)}, \dots\}\hbar^2$, an infinite list with minimum $${am * (am + 1)}\hbar^2$. ($\ell$ bounds $m$, but $m$ only bounds $\ell$ from below.)`;
    } else if (v === 'Lx2' || v === 'sLx') {
      const m = ri(-l, l);
      const val = (LL - m * m) / 2;
      q = v === 'Lx2' ? md`Find $\langle L_x^2\rangle$ in the state $\ket{\ell, m} = \ket{${l}, ${m}}$, in units of $\hbar^2$.`
        : md`Find the uncertainty $\sigma_{L_x}$ in the state $\ket{\ell, m} = \ket{${l}, ${m}}$, in units of $\hbar$.`;
      parts = [{ lbl: v === 'Lx2' ? '\\langle L_x^2\\rangle' : '\\sigma_{L_x}', ans: v === 'Lx2' ? val : Math.sqrt(val) }];
      hints = [md`By symmetry about $z$, $\langle L_x^2\rangle = \langle L_y^2\rangle$, and $L_x^2 + L_y^2 = L^2 - L_z^2$.`];
      sol = md`$\langle L_x^2\rangle = \tfrac12\langle L^2 - L_z^2\rangle = \tfrac12(${LL} - ${m * m})\hbar^2 = ${f(val)}\hbar^2$.${v === 'sLx' ? md` $\langle L_x\rangle = 0$ (it is $\tfrac12\langle L_+ + L_-\rangle$, which changes $m$), so $\sigma_{L_x} = \sqrt{${f(val)}}\,\hbar \approx ${f(Math.sqrt(val))}\hbar$.` : ''} Smallest when $|m| = \ell$ (the cone is narrowest), but never zero for $\ell \ge 1$.`;
    } else {
      const good = LL;
      const ALLOWED = [0, 2, 6, 12, 20, 30, 42];
      const pool = U.shuffle([l * l, l * l + 1, (l + 1) * (l + 1), 2 * l + 1, LL + 1, LL - 1, 3, 5, 8, 10, 15, 24].filter((b, i, arr) => b > 0 && !ALLOWED.includes(b) && arr.indexOf(b) === i));
      const bads = pool.slice(0, 3);
      const R = mix([md`$${good}\hbar^2$`].concat(bads.map((b) => md`$${b}\hbar^2$`)),
        [null].concat(bads.map((b) => (Number.isInteger(Math.sqrt(b)) ? md`$${b}$ is a perfect square, not $\ell(\ell+1)$: the classical guess $L^2 = (\ell\hbar)^2$ is wrong.` : md`$${b}$ is not of the form $\ell(\ell+1)$ (allowed: $0, 2, 6, 12, 20, 30, \dots$).`))));
      q = md`Which of these can be the result of a measurement of $L^2$?`;
      parts = [R];
      sol = md`Allowed values are $\hbar^2\ell(\ell+1) = 0, 2, 6, 12, 20, 30, \dots$ times $\hbar^2$. $${good} = ${l}\cdot${l + 1}$ is on the list.`;
    }
    return { title: 'Angular momentum spectrum', q, parts, hints, sol };
  };

  // ================================================================ 8. L± coefficients
  GENS.m2_Lpm = () => {
    const v = pick(['coef', 'coef', 'LpLm', 'Lx', 'chain']);
    const l = ri(1, 4);
    const LL = l * (l + 1);
    let q, parts, sol;
    let hints = [md`$\hat L_\pm\ket{\ell, m} = \hbar\sqrt{\ell(\ell+1) - m(m\pm1)}\,\ket{\ell, m\pm1}$.`];
    if (v === 'coef') {
      const up = Math.random() < 0.5;
      const m = ri(-l, l);
      const k = LL - m * (m + (up ? 1 : -1));
      q = md`Find the coefficient $c$ in $\hat L_${up ? '+' : '-'}\ket{${l}, ${m}} = c\,\hbar\ket{${l}, ${m + (up ? 1 : -1)}}$ (enter 0 if the result is zero).`;
      parts = [{ lbl: 'c', ans: Math.sqrt(k) }];
      sol = md`$c = \sqrt{\ell(\ell+1) - m(m${up ? '+' : '-'}1)} = \sqrt{${LL} - (${m})(${m + (up ? 1 : -1)})} = ${rt(k)}${k ? md` \approx ${f(Math.sqrt(k))}` : ''}$.${k === 0 ? md` The ladder ends: ${up ? md`$m = \ell$ is the top rung, so $\hat L_+$ gives zero` : md`$m = -\ell$ is the bottom rung, so $\hat L_-$ gives zero`}.` : md` Largest in the middle of the ladder, zero past the ends.`}`;
    } else if (v === 'LpLm') {
      const m = ri(-l, l);
      const pm = Math.random() < 0.5;
      const val = pm ? LL - m * m + m : LL - m * m - m;
      q = md`Find $\bra{${l}, ${m}}\hat L_${pm ? '+' : '-'}\hat L_${pm ? '-' : '+'}\ket{${l}, ${m}}$ in units of $\hbar^2$.`;
      parts = [{ lbl: md`\langle\hat L_${pm ? '+' : '-'}\hat L_${pm ? '-' : '+'}\rangle`, ans: val }];
      hints = [md`$\hat L_\pm\hat L_\mp = \hat L^2 - \hat L_z^2 \pm\hbar\hat L_z$.`];
      sol = md`$\hat L_${pm ? '+' : '-'}\hat L_${pm ? '-' : '+'} = \hat L^2 - \hat L_z^2 ${pm ? '+' : '-'}\hbar\hat L_z$, so the expectation value is $${LL} - ${m * m} ${pm ? '+' : '-'} (${m}) = ${val}$. It equals $|c|^2$ for $\hat L_${pm ? '-' : '+'}\ket{${l},${m}}$: a squared length, never negative.`;
    } else if (v === 'Lx') {
      const up = Math.random() < 0.5;
      const m = up ? ri(-l, l - 1) : ri(-l + 1, l);
      const k = LL - m * (m + (up ? 1 : -1));
      const val = Math.sqrt(k) / 2;
      q = md`Find $\bra{${l}, ${m + (up ? 1 : -1)}}\hat L_x\ket{${l}, ${m}}$ in units of $\hbar$.`;
      parts = [{ lbl: md`\langle\hat L_x\rangle_{\text{off}}`, ans: val }];
      hints = [md`$\hat L_x = \tfrac12(\hat L_+ + \hat L_-)$.`];
      sol = md`$\hat L_x = \tfrac12(\hat L_+ + \hat L_-)$; only $\hat L_${up ? '+' : '-'}$ reaches $m = ${m + (up ? 1 : -1)}$: $\tfrac12\sqrt{${LL} - (${m})(${m + (up ? 1 : -1)})} = \tfrac12${rt(k)} \approx ${f(val)}$. ${l === 1 ? md`For $\ell = 1$ every such element is $\tfrac{1}{\sqrt2}$, giving $L_x = \tfrac{\hbar}{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix}$.` : md`These fill the two off-diagonals of the $L_x$ matrix.`}`;
    } else {
      const m = ri(-l, l - 2);
      const k1 = LL - m * (m + 1), k2 = LL - (m + 1) * (m + 2);
      const val = Math.sqrt(k1 * k2);
      q = md`Find $\bra{${l}, ${m + 2}}\hat L_+^2\ket{${l}, ${m}}$ in units of $\hbar^2$.`;
      parts = [{ lbl: md`\langle\hat L_+^2\rangle_{\text{off}}`, ans: val }];
      sol = md`Two steps up: $\sqrt{${LL} - (${m})(${m + 1})}\cdot\sqrt{${LL} - (${m + 1})(${m + 2})} = ${rt(k1)}\cdot${rt(k2)} \approx ${f(val)}$.${val === 0 ? ' Zero: the ladder runs out.' : ''}`;
    }
    return { title: 'Ladder operators for L', q, parts, hints, sol };
  };

  // ================================================================ 9. measuring L
  const LXV = { 1: [0.5, Math.SQRT1_2, 0.5], 0: [Math.SQRT1_2, 0, -Math.SQRT1_2], '-1': [0.5, -Math.SQRT1_2, 0.5] };   // Lx eigenvectors in (m = 1, 0, -1)
  const coefTex = (c) => (c === 1 ? '' : c === -1 ? '-' : `${c}`);
  const lin = (terms) => {           // [[coef, tex], ...] -> "2Y + Y - 3Y"
    let s = '';
    terms.filter((t) => t[0] !== 0).forEach(([c, t], i) => {
      if (i === 0) s += `${coefTex(c)}${t}`;
      else s += ` ${c < 0 ? '-' : '+'} ${coefTex(Math.abs(c))}${t}`;
    });
    return s;
  };
  const lt = (k) => (k === 1 ? '+\\hbar' : k === -1 ? '-\\hbar' : '0');
  GENS.m2_L_measure = () => {
    const v = pick(['lz', 'lz', 'mixL', 'lx', 'lx', 'cart', 'cart', 'chain']);
    let q, parts, sol, hints;
    const triple = () => { let t; do { t = [ri(-2, 2), ri(-2, 2), ri(-2, 2)]; } while (t.filter((x) => x).length < 2); return t; };
    if (v === 'lz') {
      const [a, b, c] = triple();
      const N = a * a + b * b + c * c;
      const m = pick([1, 0, -1].filter((k) => [a, b, c][1 - k] !== 0));
      const P = [a, b, c][1 - m] ** 2 / N, Lz = (a * a - c * c) / N;
      const st = lin([[a, 'Y_1^1'], [b, 'Y_1^0'], [c, 'Y_1^{-1}']]);
      q = md`A particle has angular wavefunction $Y(\theta,\phi) = A\left[${st}\right]$. Find $P(L_z = ${m === 1 ? '' : m === -1 ? '-' : '0'}${m ? '\\hbar' : ''})$ and $\langle L_z\rangle$ in units of $\hbar$.`;
      parts = [{ lbl: md`P(L_z = ${lt(m)})`, ans: P }, { lbl: '\\langle L_z\\rangle/\\hbar', ans: Lz }];
      hints = [md`The $Y_\ell^m$ are orthonormal: $|A|^2(${a}^2 + ${b}^2 + ${c}^2) = 1$.`];
      sol = md`$|A|^2 = 1/${N}$. Each $Y_1^m$ is an $L_z$ eigenstate, so $P(m) = |\text{coefficient}|^2/${N}$: $P(L_z = ${lt(m)}) = ${fr([a, b, c][1 - m] ** 2, N)}$. $\langle L_z\rangle = \hbar\,\dfrac{(+1)${a * a} + 0\cdot${b * b} + (-1)${c * c}}{${N}} = ${fr(a * a - c * c, N)}\hbar$. $L^2 = 2\hbar^2$ with certainty.`;
    } else if (v === 'mixL') {
      let a, b, c; do { a = ri(0, 3); b = ri(0, 3); c = ri(0, 3); } while ([a, b, c].filter((x) => x).length < 2);
      const m1 = ri(-1, 1), m2 = ri(-2, 2);
      const N = a * a + b * b + c * c;
      const askL2 = Math.random() < 0.5;
      const st = lin([[a, 'Y_0^0'], [b, `Y_1^{${m1}}`], [c, `Y_2^{${m2}}`]]);
      const L2 = (2 * b * b + 6 * c * c) / N, P6 = c * c / N, Lz = (m1 * b * b + m2 * c * c) / N;
      q = md`$\psi = R(r)\,A\left[${st}\right]$ with $R$ normalized. Find $P(L^2 = 6\hbar^2)$ and ${askL2 ? md`$\langle L^2\rangle$ in units of $\hbar^2$` : md`$\langle L_z\rangle$ in units of $\hbar$`}.`;
      parts = [{ lbl: 'P(L^2 = 6\\hbar^2)', ans: P6 }, askL2 ? { lbl: '\\langle L^2\\rangle/\\hbar^2', ans: L2 } : { lbl: '\\langle L_z\\rangle/\\hbar', ans: Lz }];
      sol = md`$|A|^2 = 1/${N}$. $L^2 = 6\hbar^2$ means $\ell = 2$: only the $Y_2$ term, $P = ${fr(c * c, N)}$. `
        + (askL2 ? md`$\langle L^2\rangle = \hbar^2\,\dfrac{0\cdot${a * a} + 2\cdot${b * b} + 6\cdot${c * c}}{${N}} = ${fr(2 * b * b + 6 * c * c, N)}\hbar^2$.`
          : md`$\langle L_z\rangle = \hbar\,\dfrac{0\cdot${a * a} + (${m1})${b * b} + (${m2})${c * c}}{${N}} = ${fr(m1 * b * b + m2 * c * c, N)}\hbar$.`);
    } else if (v === 'lx') {
      const [a, b, c] = triple();
      const N = a * a + b * b + c * c;
      const lam = pick([1, 0, -1]);
      const u = LXV[lam];
      const amp = u[0] * a + u[1] * b + u[2] * c;
      const P = amp * amp / N, Lx = Math.SQRT2 * b * (a + c) / N;
      const st = lin([[a, '\\ket{1,1}'], [b, '\\ket{1,0}'], [c, '\\ket{1,-1}']]);
      q = md`An $\ell = 1$ particle is in $\ket\psi = A\left[${st}\right]$ (real coefficients, standard phases). $L_x$ is measured. Find $P(L_x = ${lam === 1 ? '+\\hbar' : lam === -1 ? '-\\hbar' : '0'})$ and $\langle L_x\rangle$ in units of $\hbar$.`;
      parts = [{ lbl: md`P(L_x = ${lt(lam)})`, ans: P }, { lbl: '\\langle L_x\\rangle/\\hbar', ans: clean(Lx) }];
      hints = [md`$L_x = \dfrac{\hbar}{\sqrt2}\begin{pmatrix}0&1&0\\1&0&1\\0&1&0\end{pmatrix}$ in the basis $m = 1, 0, -1$. Eigenvectors: $+\hbar$: $(\tfrac12, \tfrac{1}{\sqrt2}, \tfrac12)$; $0$: $(\tfrac{1}{\sqrt2}, 0, -\tfrac{1}{\sqrt2})$; $-\hbar$: $(\tfrac12, -\tfrac{1}{\sqrt2}, \tfrac12)$.`];
      sol = md`$|A|^2 = 1/${N}$. The $L_x = ${lam}\hbar$ eigenvector is $(${f(u[0])}, ${f(u[1])}, ${f(u[2])})$; its overlap with $(${a}, ${b}, ${c})$ is $${f(amp)}$, so $P = ${f(amp)}^2/${N} = ${f(P)}$. $\langle L_x\rangle = \bra\psi\hat L_x\ket\psi = \dfrac{\hbar}{\sqrt2}\cdot\dfrac{2\cdot${b}\,(${a} + ${c})}{${N}} = ${f(Lx)}\hbar$ (only neighbors in $m$ connect). Sharp $L_z$ components still give a spread of $L_x$ outcomes: the two do not commute.`;
    } else if (v === 'cart') {
      const complexV = Math.random() < 0.4;
      if (complexV) {
        const s = pick([1, -1]), r = ri(1, 3);
        const P = 2 / (2 + r * r);
        q = md`A particle has $\psi(\mathbf r) = (x ${s > 0 ? '+' : '-'} iy ${r === 1 ? '+' : `+ ${r}`}z)\,f(r)$. Find $P(L_z = ${s > 0 ? '+' : '-'}\hbar)$ and $\langle L_z\rangle$ in units of $\hbar$.`;
        parts = [{ lbl: md`P(L_z = ${s > 0 ? '+' : '-'}\hbar)`, ans: P }, { lbl: '\\langle L_z\\rangle/\\hbar', ans: s * P }];
        hints = [md`$x \pm iy = r\sin\theta\,e^{\pm i\phi} \propto Y_1^{\pm1}$ and $z = r\cos\theta \propto Y_1^0$. Normalization: $x, y, z$ each have the same norm over angles.`];
        sol = md`$x ${s > 0 ? '+' : '-'} iy = r\sin\theta\,e^{${s > 0 ? '' : '-'}i\phi}$ is pure $m = ${s}$; $z$ is pure $m = 0$. Over angles, $|x \pm iy|^2$ integrates to twice $|z|^2$ (it is $|x|^2 + |y|^2$), so the weights are $2 : ${r * r}$: $P(L_z = ${s}\hbar) = \dfrac{2}{2 + ${r * r}} = ${fr(2, 2 + r * r)}$, $\langle L_z\rangle = ${s > 0 ? '' : '-'}${fr(2, 2 + r * r)}\hbar$. Everything is $\ell = 1$.`;
      } else {
        let a, b, c; do { a = ri(0, 2); b = ri(0, 2); c = ri(0, 2); } while (a + b + c === 0 || (a === 0 && b === 0));
        const N = a * a + b * b + c * c;
        const askZero = c > 0 && Math.random() < 0.4;
        const P = askZero ? c * c / N : (a * a + b * b) / (2 * N);
        const st = lin([[a, 'x'], [b, 'y'], [c, 'z']]);
        q = md`A particle has $\psi(\mathbf r) = (${st})\,f(r)$. Find $P(L_z = ${askZero ? '0' : '+\\hbar'})$ and $\langle L_z\rangle$ in units of $\hbar$.`;
        parts = [{ lbl: md`P(L_z = ${askZero ? '0' : '\\hbar'})`, ans: P }, { lbl: '\\langle L_z\\rangle/\\hbar', ans: 0 }];
        hints = [md`$x = \tfrac12[(x + iy) + (x - iy)]$, $y = \tfrac{1}{2i}[(x + iy) - (x - iy)]$; $x \pm iy \propto Y_1^{\pm1}$, $z \propto Y_1^0$.`];
        const cpl = (x, y, sg) => (y ? `(${x}${sg}${y === 1 ? '' : y}i)` : `${x}`);
        sol = md`Use $x = \tfrac12[(x + iy) + (x - iy)]$ and $y = \tfrac{1}{2i}[(x + iy) - (x - iy)]$: $${st} = \tfrac12${cpl(a, b, '-')}(x + iy) + \tfrac12${cpl(a, b, '+')}(x - iy)${c ? md` + ${c === 1 ? '' : c}z` : ''}$, with $x \pm iy \propto Y_1^{\pm1}$ and $z \propto Y_1^0$. Over angles $\int|x \pm iy|^2d\Omega = \int(x^2 + y^2)d\Omega = 2\int z^2d\Omega$, so in units of the weight of $z$: $m = +1$ and $m = -1$ each get $2\cdot\tfrac14\cdot${a * a + b * b} = ${fr(a * a + b * b, 2)}$, and $m = 0$ gets $${c * c}$ (total $${N}$ ✓). So $P(\pm\hbar) = ${fr(a * a + b * b, 2 * N)}$ each and $P(0) = ${fr(c * c, N)}$. Asked: $${f(P)}$. A real wavefunction always has $\langle L_z\rangle = 0$ (equal weights for $\pm m$): a standing wave in $\phi$, no circulation.`;
      }
    } else {
      const m1 = pick([1, 0, -1]), lam = pick([1, 0, -1]), m2 = pick([1, 0, -1]);
      const u = LXV[lam];
      const p1 = u[1 - m1] ** 2, p2 = u[1 - m2] ** 2;
      const P = p1 * p2;
      q = md`A particle is in $\ket{1, ${m1}}$. $L_x$ is measured and gives $${lt(lam)}$; then $L_z$ is measured. Find the probability of this whole sequence ending with $L_z = ${lt(m2)}$.`;
      parts = [{ lbl: 'P', ans: P }];
      hints = [md`$L_x$ eigenvectors in $(m = 1, 0, -1)$: $+\hbar$: $(\tfrac12, \tfrac{1}{\sqrt2}, \tfrac12)$; $0$: $(\tfrac{1}{\sqrt2}, 0, -\tfrac{1}{\sqrt2})$; $-\hbar$: $(\tfrac12, -\tfrac{1}{\sqrt2}, \tfrac12)$.`];
      sol = md`$P(L_x = ${lt(lam)}) = |\braket{u_{${lam}}|1,${m1}}|^2 = ${f(p1)}$; the state collapses to $u_{${lam}}$; then $P(L_z = ${lt(m2)}) = |\braket{1,${m2}|u_{${lam}}}|^2 = ${f(p2)}$. Product: $${f(P)}$.${p1 * p2 > 0 && m1 !== m2 ? md` The $L_x$ measurement erased the original $L_z$ value: a value different from the first one is now possible.` : ''}${P === 0 ? ' Zero: one of the overlaps vanishes.' : ''}`;
    }
    return { title: 'Measuring angular momentum', q, parts, hints, sol };
  };

  // ================================================================ 10. rigid rotor
  GENS.m2_rotor = () => {
    const v = pick(['spacing', 'degen', 'lines', 'top', 'top', 'mm', 'zeeman']);
    const l = ri(0, 5);
    let q, parts, sol, hints = [md`$E_\ell = \dfrac{\hbar^2\ell(\ell+1)}{2I}$, each $(2\ell+1)$-fold degenerate.`];
    if (v === 'spacing') {
      q = md`For a rigid rotor $\hat H = \hat L^2/2I$, find $E_{${l + 1}} - E_{${l}}$ in units of $\hbar^2/I$.`;
      parts = [{ lbl: md`E_{${l + 1}} - E_{${l}}`, ans: l + 1 }];
      sol = md`$\dfrac{\hbar^2}{2I}[(${l + 1})(${l + 2}) - ${l}(${l + 1})] = \dfrac{\hbar^2}{2I}\cdot2(${l + 1}) = ${l + 1}\,\dfrac{\hbar^2}{I}$. Spacings grow linearly with $\ell$ (unlike the oscillator's equal steps), so rotational lines are equally spaced in frequency.`;
    } else if (v === 'degen') {
      const K = l * (l + 1);
      q = md`A rigid rotor $\hat H = \hat L^2/2I$ has a level at $E = ${K}\,\hbar^2/2I$. How many states have this energy?`;
      parts = [{ lbl: '\\text{degeneracy}', ans: 2 * l + 1 }];
      sol = md`$\ell(\ell+1) = ${K}$ gives $\ell = ${l}$: $m = -${l}, \dots, ${l}$, so $${2 * l + 1}$ states. Full rotational symmetry: rotating the state cannot change its energy, and rotations mix the $m$'s.`;
    } else if (v === 'lines') {
      const r = (l + 2) / (l + 1);
      q = md`Photon energies of rotor transitions $\ell \to \ell + 1$. Find the ratio of the $${l + 1} \to ${l + 2}$ photon energy to the $${l} \to ${l + 1}$ photon energy.`;
      parts = [{ lbl: '\\text{ratio}', ans: r }];
      sol = md`$E_{\ell+1} - E_\ell = (\ell+1)\hbar^2/I$, so the ratio is $\dfrac{${l + 2}}{${l + 1}} \approx ${f(r)}$. The lines sit at $1, 2, 3, \dots$ times $\hbar^2/I$: an evenly spaced comb.`;
    } else if (v === 'top') {
      const EP = pick([[0.25, '\\tfrac14'], [0.5, '\\tfrac12'], [1, '1'], [-0.2, '-\\tfrac15'], [0.1, '0.1']]);
      const eps = EP[0];
      const L = ri(1, 3), m = ri(-L, L);
      const askCount = Math.random() < 0.35;
      const E = L * (L + 1) - eps / (1 + eps) * m * m;
      q = askCount
        ? md`A symmetric top has $I_x = I_y = I$, $I_z = (1+\epsilon)I$ with $\epsilon = ${EP[1]}$, so $\hat H = \dfrac{\hat L^2}{2I} - \dfrac{\epsilon}{1+\epsilon}\dfrac{\hat L_z^2}{2I}$. How many **distinct** energies does the $\ell = ${L}$ multiplet split into?`
        : md`A symmetric top has $\hat H = \dfrac{\hat L^2}{2I} - \dfrac{\epsilon}{1+\epsilon}\dfrac{\hat L_z^2}{2I}$ with $\epsilon = ${EP[1]}$. Find $E_{\ell m}$ for $\ell = ${L}$, $m = ${m}$ in units of $\hbar^2/2I$.`;
      parts = [askCount ? { lbl: '\\text{distinct levels}', ans: L + 1 } : { lbl: md`E_{${L},${m}}`, ans: E }];
      sol = askCount
        ? md`$E_{\ell m} = \tfrac{\hbar^2}{2I}[\ell(\ell+1) - \tfrac{\epsilon}{1+\epsilon}m^2]$ depends on $m^2$: $m$ and $-m$ stay together. Values $|m| = 0, 1, \dots, ${L}$: $${L + 1}$ distinct levels. The leftover $\pm m$ pairing is protected by the symmetry that flips the sense of rotation about $z$.`
        : md`$\hat H$ is built from $\hat L^2$ and $\hat L_z$, so $Y_\ell^m$ are exact eigenstates: $E = ${L * (L + 1)} - \tfrac{${f(eps)}}{${f(1 + eps)}}(${m * m}) = ${f(E)}$ units. ${eps > 0 ? md`For $\epsilon > 0$ the large-$|m|$ states lie lowest: cheaper to spin about the axis with the larger moment of inertia.` : md`For $\epsilon < 0$ the large-$|m|$ states lie highest.`}`;
    } else if (v === 'mm') {
      const M = pick([['HCl', 1.31], ['CO', 0.239], ['HF', 2.56], ['NaCl', 0.0271]]);
      const L = ri(0, 3);
      const dE = 2 * M[1] * (L + 1);
      const lam = 1.23984 / dE;
      q = md`A ${M[0]} molecule has rotational constant $B = \hbar^2/2I = ${M[1]}$ meV. Find the wavelength (in mm) of the photon absorbed in $\ell = ${L} \to ${L + 1}$.`;
      parts = [{ lbl: '\\lambda', ans: lam, unit: 'mm' }];
      hints = [md`$hc = 1240$ eV·nm $= 1.240$ meV·mm.`];
      sol = md`$\Delta E = B[(${L + 1})(${L + 2}) - ${L}(${L + 1})] = 2(${L + 1})B = ${f(dE, 4)}$ meV, so $\lambda = \dfrac{1.240\ \text{meV·mm}}{${f(dE, 4)}\ \text{meV}} = ${f(lam, 3)}$ mm: microwave/far infrared, where rotational spectra live.`;
    } else {
      const L = ri(1, 4);
      const x = pick([0.5, 1, 2]);
      const Emin = L * (L + 1) - x * L;
      const askCount = Math.random() < 0.4;
      q = askCount
        ? md`A rotor in a magnetic field: $\hat H = \dfrac{\hat L^2}{2I} - \omega_0\hat L_z$. Into how many distinct energies does the $\ell = ${L}$ level split?`
        : md`A rotor in a magnetic field: $\hat H = \dfrac{\hat L^2}{2I} - \omega_0\hat L_z$ with $\hbar\omega_0 = ${x}\,\hbar^2/2I$. Find the lowest energy in the $\ell = ${L}$ multiplet, in units of $\hbar^2/2I$.`;
      parts = [askCount ? { lbl: '\\text{distinct levels}', ans: 2 * L + 1 } : { lbl: md`E_{\min}(\ell = ${L})`, ans: Emin }];
      sol = askCount
        ? md`$E = \tfrac{\hbar^2\ell(\ell+1)}{2I} - \hbar\omega_0m$ is linear in $m$: all $${2 * L + 1}$ values of $m$ give different energies, equally spaced by $\hbar\omega_0$. A term linear in $L_z$ breaks the $\pm m$ symmetry (it knows the sense of rotation).`
        : md`$E_{\ell m} = ${L * (L + 1)} - ${x}m$ in units of $\hbar^2/2I$; lowest for $m = +\ell = ${L}$: $${L * (L + 1)} - ${x}\cdot${L} = ${f(Emin)}$.`;
    }
    return { title: 'Rigid rotor', q, parts, hints, sol };
  };

  // ================================================================ 11. effective potential (Coulomb)
  GENS.m2_veff = () => {
    const v = pick(['rmin', 'depth', 'turn', 'turn', 'turn0', 'exists', 'free']);
    let q, parts, sol;
    const hints = [md`With $a = \hbar^2/mk$ and $|E_1| = k/2a$: $V_{\text{eff}}/|E_1| = -\dfrac{2}{\rho} + \dfrac{\ell(\ell+1)}{\rho^2}$, $\rho = r/a$.`];
    if (v === 'rmin' || v === 'depth') {
      const l = ri(1, 4), LL = l * (l + 1);
      q = v === 'rmin' ? md`For hydrogen, $V_{\text{eff}} = -\dfrac{k}{r} + \dfrac{\hbar^2\ell(\ell+1)}{2mr^2}$. Find the position of the minimum for $\ell = ${l}$, in units of the Bohr radius $a$.`
        : md`For hydrogen with $\ell = ${l}$, find the depth $V_{\text{eff}}(r_{\min})$ of the effective potential in units of $|E_1| = 13.6$ eV (enter a negative number).`;
      parts = [v === 'rmin' ? { lbl: 'r_{\\min}/a', ans: LL } : { lbl: 'V_{\\text{eff}}(r_{\\min})/|E_1|', ans: -1 / LL }];
      sol = md`$\dfrac{dV_{\text{eff}}}{dr} = \dfrac{k}{r^2} - \dfrac{\hbar^2\ell(\ell+1)}{mr^3} = 0 \Rightarrow r_{\min} = \ell(\ell+1)\dfrac{\hbar^2}{mk} = ${LL}a$. There $V_{\text{eff}} = -\dfrac{2}{${LL}} + \dfrac{${LL}}{${LL * LL}} = -\dfrac{1}{${LL}}$ in units of $|E_1|$ $\approx ${f(-RY / LL, 3)}$ eV. Larger $\ell$: the well moves out ($\propto\ell^2$) and gets shallower ($\propto1/\ell^2$).`;
    } else if (v === 'turn') {
      const l = ri(1, 3), n = ri(l + 1, l + 3), LL = l * (l + 1);
      const s = Math.sqrt(1 - LL / (n * n));
      const outer = Math.random() < 0.5;
      const val = n * n * (1 + (outer ? s : -s));
      q = md`A hydrogen electron has $E = E_1/${n * n}$ (that is, $n = ${n}$) and $\ell = ${l}$. Find the ${outer ? 'outer' : 'inner'} classical turning point of $V_{\text{eff}}$, in units of $a$.`;
      parts = [{ lbl: md`r_{\text{${outer ? 'outer' : 'inner'}}}/a`, ans: val }];
      sol = md`Set $V_{\text{eff}} = E$: $-\dfrac{2}{\rho} + \dfrac{${LL}}{\rho^2} = -\dfrac{1}{${n * n}}$, i.e. $\rho^2 - ${2 * n * n}\rho + ${LL * n * n} = 0$, so $\rho = ${n * n}\left(1 \pm\sqrt{1 - ${LL}/${n * n}}\right)$. ${outer ? 'Outer' : 'Inner'}: $${f(val)}$. Between the two the electron is classically allowed and $u(r)$ oscillates; inside the inner point the centrifugal barrier keeps it away from the nucleus.`;
    } else if (v === 'turn0') {
      const n = ri(1, 4);
      q = md`An $s$-state ($\ell = 0$) of hydrogen has $E = E_1/${n * n}$. Find its classical turning point in units of $a$.`;
      parts = [{ lbl: 'r_t/a', ans: 2 * n * n }];
      sol = md`$\ell = 0$: $V_{\text{eff}} = -k/r$. $-\dfrac{k}{r} = -\dfrac{k}{2a\cdot${n * n}}$ gives $r = ${2 * n * n}a$. For the ground state the turning point is $2a$, twice the most probable radius; the electron spends some time beyond it (about 24%).`;
    } else if (v === 'exists') {
      const n = ri(1, 4), l = ri(Math.max(1, n - 2), n + 1);
      const ok = l <= n - 1;
      const R = ok
        ? mix([md`Yes: $E$ lies above the bottom of the $\ell = ${l}$ well`, md`No: $E$ lies below the bottom of the $\ell = ${l}$ well`, md`No: $\ell$ must equal $n$`, md`Yes: any $\ell$ works at any energy`],
          [null, md`Compare: bottom $= E_1/${l * (l + 1)}$ vs $E = E_1/${n * n}$; $E$ is the higher of the two.`, md`$\ell$ runs from 0 to $n - 1$.`, md`Not true: for large $\ell$ the well is too shallow.`])
        : mix([md`No: $E$ lies below the bottom of the $\ell = ${l}$ well`, md`Yes: $E$ lies above the bottom of the $\ell = ${l}$ well`, md`Yes: any $\ell$ works at any energy`, md`No: $\ell$ must be odd`],
          [null, md`Bottom of the $\ell = ${l}$ well is $E_1/${l * (l + 1)}$, which is above $E_1/${n * n}$.`, md`For large $\ell$ the well is too shallow: no allowed region.`, md`Parity has nothing to do with it.`]);
      q = md`Can hydrogen have a bound state with $E = E_1/${n * n}$ and $\ell = ${l}$? Decide from the effective potential (bottom of the $\ell$ well at $E_1/\ell(\ell+1)$ for $\ell \ge 1$).`;
      parts = [R];
      sol = md`The $\ell = ${l}$ well bottoms out at $E_1/${l * (l + 1)} = ${f(-RY / (l * (l + 1)), 3)}$ eV, while $E = E_1/${n * n} = ${f(-RY / (n * n), 3)}$ eV. ${ok ? md`$E$ is above the bottom: there is an allowed region, consistent with $\ell \le n - 1$.` : md`$E$ is below the bottom: no allowed region anywhere, so no state. This is the effective-potential reason for $\ell \le n - 1$, since $(n-1)n < n^2 < n(n+1)$.`}`;
    } else {
      const l = ri(1, 5);
      q = md`A free particle ($V = 0$) with wavenumber $k$ and angular momentum $\ell = ${l}$. Find the inner turning point $r_1$ of $V_{\text{eff}}$, as $kr_1$.`;
      parts = [{ lbl: 'kr_1', ans: Math.sqrt(l * (l + 1)) }];
      sol = md`$E = \dfrac{\hbar^2k^2}{2m} = \dfrac{\hbar^2\ell(\ell+1)}{2mr_1^2}$, so $kr_1 = \sqrt{${l * (l + 1)}} \approx ${f(Math.sqrt(l * (l + 1)))}$. Classically: impact parameter $b = L/p = \sqrt{\ell(\ell+1)}/k$. Inside, $j_\ell(kr)$ is tiny (the spherical Bessel function starts like $r^\ell$).`;
    }
    return { title: 'Effective potential', q, parts, hints, sol };
  };

  // ================================================================ 12. spherical and cubic boxes
  // zeros of the spherical Bessel functions: beta_{N l}
  const BZ = [
    { l: 0, N: 1, b: 3.1416 }, { l: 1, N: 1, b: 4.4934 }, { l: 2, N: 1, b: 5.7635 }, { l: 0, N: 2, b: 6.2832 },
    { l: 3, N: 1, b: 6.9879 }, { l: 1, N: 2, b: 7.7253 }, { l: 4, N: 1, b: 8.1826 }, { l: 2, N: 2, b: 9.0950 }, { l: 0, N: 3, b: 9.4248 },
  ];
  const SPD = 'spdfghi';
  const TABLE = md`$\beta_{N\ell}$: $\ell = 0$: 3.14, 6.28, 9.42; $\ell = 1$: 4.49, 7.73; $\ell = 2$: 5.76, 9.10; $\ell = 3$: 6.99; $\ell = 4$: 8.18.`;
  GENS.m2_box3d = () => {
    const v = pick(['ratio', 'level', 'count', 'electron', 'cube', 'cube']);
    let q, parts, sol, hints = [md`Spherical box of radius $b$: $E_{N\ell} = \dfrac{\hbar^2\beta_{N\ell}^2}{2mb^2}$, ${TABLE}`];
    if (v === 'ratio') {
      const s = pick(BZ.slice(1));
      const r = (s.b / Math.PI) ** 2;
      q = md`A particle in a spherical box. Find $E_{N\ell}/E_{10}$ for the level $N = ${s.N}$, $\ell = ${s.l}$ (${s.N}${SPD[s.l]}).`;
      parts = [{ lbl: md`E_{${s.N}${s.l}}/E_{10}`, ans: r }];
      sol = md`$E \propto \beta^2$: $\left(\dfrac{${s.b}}{\pi}\right)^2 = ${f(r)}$.${s.l > 0 ? md` At the same $N$, higher $\ell$ costs more: the centrifugal term $\hbar^2\ell(\ell+1)/2mr^2$ adds rotational kinetic energy.` : ''}`;
    } else if (v === 'level') {
      const k = ri(1, 9), s = BZ[k - 1];
      const askDeg = Math.random() < 0.5;
      q = askDeg ? md`List the spherical-box levels in order of energy. How many states (ignore spin) does the ${['', 'lowest', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'][k]} level have?`
        : md`List the spherical-box levels in order of energy. What is $\ell$ for the ${['', 'lowest', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'][k]} level?`;
      parts = [askDeg ? { lbl: '\\text{degeneracy}', ans: 2 * s.l + 1 } : { lbl: '\\ell', ans: s.l }];
      sol = md`In order of $\beta$: 1s (3.14), 1p (4.49), 1d (5.76), 2s (6.28), 1f (6.99), 2p (7.73), 1g (8.18), 2d (9.10), 3s (9.42). Level ${k} is ${s.N}${SPD[s.l]}: $\ell = ${s.l}$, $2\ell + 1 = ${2 * s.l + 1}$ states. Each level is exactly one $\ell$ multiplet: no accidental degeneracy (unlike hydrogen).`;
    } else if (v === 'count') {
      const k = ri(1, 9);
      let tot = 0; for (let i = 0; i < k; i++) tot += 2 * (2 * BZ[i].l + 1);
      q = md`Nuclear shell model in a spherical box: each orbital state holds two nucleons (spin up and down). How many protons fill the lowest ${k} level${k > 1 ? 's' : ''} completely?`;
      parts = [{ lbl: '\\text{number}', ans: tot }];
      sol = md`Levels in order: 1s, 1p, 1d, 2s, 1f, 2p, 1g, 2d, 3s with $2\ell + 1 = 1, 3, 5, 1, 7, 3, 9, 5, 1$ orbitals. Two per orbital, cumulative: 2, 8, 18, 20, 34, 40, 58, 68, 70. Answer: $${tot}$.${[2, 8, 20].includes(tot) ? ' This is one of the magic numbers the box reproduces.' : ''}`;
    } else if (v === 'electron') {
      const b = pick([0.5, 1, 2, 5, 0.3]);
      const s = pick([BZ[0], BZ[1], BZ[2]]);
      const E = 0.0381 * s.b * s.b / (b * b);
      q = md`An electron is trapped in a spherical cavity (infinite walls) of radius $b = ${b}$ nm. Find the energy of the ${s.N}${SPD[s.l]} level in eV.`;
      parts = [{ lbl: md`E_{${s.N}${s.l}}`, ans: E, unit: 'eV' }];
      hints = [md`$\hbar^2/2m_e = 0.0381$ eV·nm²; ${TABLE}`];
      sol = md`$E = \dfrac{\hbar^2}{2m}\dfrac{\beta^2}{b^2} = 0.0381\times\dfrac{${s.b}^2}{${b}^2} = ${f(E, 3)}$ eV. (A quantum dot: smaller $b$, larger energies, as $1/b^2$.)`;
    } else {
      // cubic box: degeneracy of E = S * (pi^2 hbar^2 / 2 m a^2)
      const S = pick([3, 6, 9, 11, 12, 14, 17, 18, 19, 21, 27, 22, 24]);
      let deg = 0, sets = new Set();
      for (let a = 1; a < 7; a++) for (let b = 1; b < 7; b++) for (let c = 1; c < 7; c++) if (a * a + b * b + c * c === S) { deg++; sets.add([a, b, c].sort().join('')); }
      q = md`A particle in a cubic box of side $L$: $E = \dfrac{\pi^2\hbar^2}{2mL^2}(n_x^2 + n_y^2 + n_z^2)$. How many states have $n_x^2 + n_y^2 + n_z^2 = ${S}$?`;
      parts = [{ lbl: '\\text{degeneracy}', ans: deg }];
      hints = [md`Find all sets of positive integers with squares summing to ${S}, then count their distinct orderings.`];
      sol = md`Sets: ${[...sets].map((s) => `$(${s.split('').join(',')})$`).join(', ')}. Counting orderings: $${deg}$ states.${sets.size > 1 ? ' Two different sets give the same energy: an accidental degeneracy on top of the cube\'s symmetry.' : ' The permutations come from the cube\'s symmetry (x, y, z equivalent).'}`;
    }
    return { title: 'Particle in a 3D box', q, parts, hints, sol };
  };

  // ================================================================ 13. hydrogen spectrum
  GENS.m2_hydrogen = () => {
    const v = pick(['En', 'lambda', 'lambda', 'degen', 'nl', 'ion', 'limit', 'Z', 'valid']);
    let q, parts, sol, hints = [md`$E_n = -\dfrac{13.6\ \text{eV}}{n^2}$; $\lambda = hc/\Delta E$ with $hc = 1240$ eV·nm.`];
    if (v === 'En') {
      const n = ri(1, 6);
      q = md`Find the energy of the $n = ${n}$ level of hydrogen in eV.`;
      parts = [{ lbl: md`E_{${n}}`, ans: -RY / (n * n), unit: 'eV' }];
      sol = md`$E_{${n}} = -13.6/${n * n} = ${f(-RY / (n * n), 4)}$ eV. Levels crowd together below 0 as $n$ grows.`;
    } else if (v === 'lambda') {
      const nf = pick([1, 2, 2, 3]), ni = nf + ri(1, 3);
      const dE = RY * (1 / (nf * nf) - 1 / (ni * ni));
      const lam = HC / dE;
      q = md`A hydrogen atom drops from $n = ${ni}$ to $n = ${nf}$. Find the wavelength of the emitted photon in nm.`;
      parts = [{ lbl: '\\lambda', ans: lam, unit: 'nm' }];
      sol = md`$\Delta E = 13.6\left(\dfrac{1}{${nf * nf}} - \dfrac{1}{${ni * ni}}\right) = ${f(dE, 4)}$ eV, $\lambda = 1240/${f(dE, 4)} = ${f(lam, 4)}$ nm (${nf === 1 ? 'Lyman series, ultraviolet' : nf === 2 ? (lam < 400 ? 'Balmer series, near ultraviolet' : 'Balmer series, visible') : 'Paschen series, infrared'}).`;
    } else if (v === 'degen') {
      const n = ri(1, 6);
      q = md`Ignoring spin, how many states of hydrogen have energy $E_{${n}}$?`;
      parts = [{ lbl: '\\text{degeneracy}', ans: n * n }];
      sol = md`$\ell = 0, \dots, ${n - 1}$, each with $2\ell + 1$ values of $m$: $\sum_{\ell=0}^{${n - 1}}(2\ell+1) = ${n}^2 = ${n * n}$. Rotational symmetry explains the $2\ell + 1$; the equality across different $\ell$ is the "accidental" degeneracy of $1/r$.`;
    } else if (v === 'nl') {
      const n = ri(2, 6), l = ri(0, n - 1);
      const askL = Math.random() < 0.5;
      q = askL ? md`How many states (ignoring spin) of hydrogen have $n = ${n}$ and $\ell = ${l}$?` : md`For hydrogen with $n = ${n}$, how many radial nodes does the $\ell = ${l}$ radial function $u(r)$ have (not counting $r = 0$ and $r = \infty$)?`;
      parts = [askL ? { lbl: '\\text{number of states}', ans: 2 * l + 1 } : { lbl: '\\text{radial nodes}', ans: n - l - 1 }];
      sol = askL ? md`$m = -${l}, \dots, ${l}$: $${2 * l + 1}$ states.` : md`$n = N + \ell$ where $u$ has $N - 1$ nodes: $N = ${n - l}$, so $${n - l - 1}$ radial nodes. Larger $\ell$ at fixed $n$: fewer radial wiggles, more angular ones.`;
    } else if (v === 'ion') {
      const n = ri(1, 5);
      q = md`How much energy (in eV) ionizes hydrogen from the $n = ${n}$ level?`;
      parts = [{ lbl: '\\text{ionization energy}', ans: RY / (n * n), unit: 'eV' }];
      sol = md`From $E_{${n}} = ${f(-RY / (n * n), 4)}$ eV up to $0$: $${f(RY / (n * n), 4)}$ eV.`;
    } else if (v === 'limit') {
      const nf = pick([1, 2, 3]);
      const lam = HC * nf * nf / RY;
      q = md`Find the shortest wavelength in the series of hydrogen lines that end on $n = ${nf}$ (the series limit), in nm.`;
      parts = [{ lbl: '\\lambda_{\\min}', ans: lam, unit: 'nm' }];
      sol = md`The largest $\Delta E$ comes from $n_i \to \infty$: $\Delta E = 13.6/${nf * nf} = ${f(RY / (nf * nf), 4)}$ eV, $\lambda = ${f(lam, 4)}$ nm. Lines pile up toward this limit.`;
    } else if (v === 'Z') {
      const Z = pick([2, 3]), n = ri(1, 3);
      const askE = Math.random() < 0.6;
      q = askE ? md`A hydrogen-like ion with $Z = ${Z}$ (one electron, $k \to Zk$). Find $E_{${n}}$ in eV.` : md`A hydrogen-like ion with $Z = ${Z}$ ($k \to Zk$). Find its "Bohr radius" $a_Z = \hbar^2/mZk$ in units of $a$.`;
      parts = [askE ? { lbl: md`E_{${n}}`, ans: -RY * Z * Z / (n * n), unit: 'eV' } : { lbl: 'a_Z/a', ans: 1 / Z }];
      sol = askE ? md`$E_n \propto mk^2/\hbar^2$, so $k \to ${Z}k$ multiplies energies by $${Z * Z}$: $E_{${n}} = -13.6\cdot${Z * Z}/${n * n} = ${f(-RY * Z * Z / (n * n), 4)}$ eV.`
        : md`$a \propto 1/k$: $a_Z = a/${Z}$. A stronger nucleus pulls the electron ${Z} times closer.`;
    } else {
      const n = ri(1, 4);
      const good = [n, ri(0, n - 1), 0]; good[2] = ri(-good[1], good[1]);
      const R = mix([md`$(${good.join(', ')})$`, md`$(${n}, ${n}, 0)$`, md`$(${n}, ${n - 1}, ${n})$`, md`$(${n}, -1, 0)$`],
        [null, md`$\ell \le n - 1 = ${n - 1}$.`, md`$|m| \le \ell = ${n - 1}$.`, md`$\ell \ge 0$.`]);
      q = md`Which $(n, \ell, m)$ is an allowed hydrogen state?`;
      parts = [R];
      sol = md`Rules: $\ell = 0, \dots, n - 1$ and $m = -\ell, \dots, \ell$. $(${good.join(', ')})$ satisfies both.`;
    }
    return { title: 'Hydrogen spectrum', q, parts, hints, sol };
  };

  // ================================================================ 14. hydrogen ground state in space
  const Pin = (x) => 1 - Math.exp(-2 * x) * (1 + 2 * x + 2 * x * x);   // P(r < x a) in the ground state
  GENS.m2_hydrogen_r = () => {
    const v = pick(['in', 'in', 'out', 'mean', 'circ', 'energy', 'dens', 'nuc']);
    let q, parts, sol, hints = [md`$\psi_{100} = \dfrac{e^{-r/a}}{\sqrt{\pi a^3}}$, $P(r)\,dr = 4\pi r^2|\psi|^2dr = \dfrac{4r^2}{a^3}e^{-2r/a}dr$.`];
    if (v === 'in' || v === 'out') {
      const x = pick([0.5, 1, 1.5, 2, 3, 0.25]);
      const P = v === 'in' ? Pin(x) : 1 - Pin(x);
      q = md`An electron is in the hydrogen ground state. Find the probability that it is found ${v === 'in' ? 'inside' : 'outside'} $r = ${x}a$.`;
      parts = [{ lbl: md`P(r ${v === 'in' ? '<' : '>'} ${x}a)`, ans: P }];
      hints.push(md`$\int_0^{b}\dfrac{4r^2}{a^3}e^{-2r/a}dr = 1 - e^{-2\beta}(1 + 2\beta + 2\beta^2)$ with $\beta = b/a$.`);
      sol = md`With $\beta = ${x}$: $P(r < ${x}a) = 1 - e^{-${2 * x}}(1 + ${2 * x} + ${f(2 * x * x)}) = ${f(Pin(x), 4)}$${v === 'out' ? md`, so outside: $${f(P, 4)}$` : ''}.${x === 1 ? ' Only about a third of the probability lies inside the Bohr radius, even though r = a is the most probable radius: the long tail.' : ''}`;
    } else if (v === 'mean') {
      const w = pick(['r', 'r2', 'sr', 'inv']);
      const A = { r: [1.5, '\\langle r\\rangle/a'], r2: [3, '\\langle r^2\\rangle/a^2'], sr: [Math.sqrt(3) / 2, '\\sigma_r/a'], inv: [1, 'a\\langle 1/r\\rangle'] }[w];
      const QT = { r: md`$\langle r\rangle$ in units of $a$`, r2: md`$\langle r^2\rangle$ in units of $a^2$`, sr: md`the spread $\sigma_r$ in units of $a$`, inv: md`$\langle 1/r\rangle$ in units of $1/a$` }[w];
      q = md`For the hydrogen ground state, find ${QT}.`;
      parts = [{ lbl: A[1], ans: A[0] }];
      hints.push(md`$\int_0^\infty r^ne^{-2r/a}dr = n!\,(a/2)^{n+1}$.`);
      sol = md`$\langle r^k\rangle = \dfrac{4}{a^3}\int_0^\infty r^{k+2}e^{-2r/a}dr = \dfrac{4}{a^3}(k+2)!\left(\dfrac a2\right)^{k+3}$: $\langle r\rangle = \tfrac32a$, $\langle r^2\rangle = 3a^2$, $\langle 1/r\rangle = 1/a$, so $\sigma_r = \sqrt{3 - 9/4}\,a = \tfrac{\sqrt3}{2}a$. Answer: $${f(A[0])}$. The mean ($1.5a$) lies beyond the most probable radius ($a$) because of the tail.`;
    } else if (v === 'circ') {
      const n = ri(1, 4);
      q = md`For the hydrogen state with $\ell = n - 1$ and $n = ${n}$ (a "circular" state, $R \propto r^{n-1}e^{-r/na}$), find the most probable radius in units of $a$.`;
      parts = [{ lbl: 'r_{\\text{mp}}/a', ans: n * n }];
      sol = md`$P(r) \propto r^2R^2 \propto r^{2n}e^{-2r/na}$. $\dfrac{d}{dr}$: $\dfrac{2n}{r} = \dfrac{2}{na}$, so $r = n^2a = ${n * n}a$: the Bohr-model radius. Circular states are the most classical-looking ones.`;
    } else if (v === 'energy') {
      const askV = Math.random() < 0.5;
      q = askV ? md`In the hydrogen ground state, find $\langle V\rangle = -k\langle 1/r\rangle$ in eV.` : md`In the hydrogen ground state, find the average kinetic energy $\langle T\rangle$ in eV.`;
      parts = [{ lbl: askV ? '\\langle V\\rangle' : '\\langle T\\rangle', ans: askV ? -2 * RY : RY, unit: 'eV' }];
      sol = md`$\langle 1/r\rangle = 1/a$, so $\langle V\rangle = -k/a = 2E_1 = -27.2$ eV, and $\langle T\rangle = E_1 - \langle V\rangle = +13.6$ eV. Virial theorem for $1/r$: $\langle T\rangle = -E$, $\langle V\rangle = 2E$.`;
    } else if (v === 'dens') {
      const x = pick([0.5, 1, 2, 3]);
      q = md`In the hydrogen ground state, find the ratio of the probability **density** $|\psi|^2$ at $r = ${x}a$ to that at the nucleus.`;
      parts = [{ lbl: '|\\psi(r)|^2/|\\psi(0)|^2', ans: Math.exp(-2 * x) }];
      sol = md`$|\psi|^2 \propto e^{-2r/a}$: $e^{-${2 * x}} = ${f(Math.exp(-2 * x), 3)}$. The density is largest at the nucleus, but the radial probability $4\pi r^2|\psi|^2$ vanishes there: the shell volume $4\pi r^2dr$ is tiny.`;
    } else {
      const R = pick([[1, '1 fm'], [0.84, '0.84 fm (the proton radius)'], [1.2, '1.2 fm']]);
      const beta = R[0] * 1e-6 / A0;
      const P = (4 / 3) * beta ** 3 * (1 - 1.5 * beta);
      q = md`Estimate the probability that the ground-state electron of hydrogen is inside the nucleus, radius $b = ${R[1]}$ ($a = 0.0529$ nm $= 52\,900$ fm). Enter it in units of $10^{-15}$.`;
      parts = [{ lbl: md`P\ (\times10^{-15})`, ans: P * 1e15 }];
      hints.push(md`For $b \ll a$, $|\psi|^2 \approx |\psi(0)|^2 = 1/\pi a^3$ inside: $P \approx \tfrac43\pi b^3\cdot\tfrac{1}{\pi a^3}$.`);
      sol = md`$P \approx \dfrac43\left(\dfrac ba\right)^3 = \dfrac43(${f(beta, 3)})^3 = ${f(P, 3)}$, i.e. $${f(P * 1e15, 3)}\times10^{-15}$. Tiny, but nonzero only for $s$ states ($R(0) \ne 0$): this is why electron capture and the hyperfine contact term involve $s$ electrons.`;
    }
    return { title: 'Hydrogen ground state in space', q, parts, hints, sol };
  };

  // ================================================================ 15. 3D isotropic oscillator
  GENS.m2_osc3d = () => {
    const v = pick(['deg', 'E', 'nl', 'ells', 'top', 'fill', 'twoD']);
    const N = ri(0, 6);
    let q, parts, sol, hints = [md`$E = \hbar\omega\left(N + \tfrac32\right)$ with $N = n_x + n_y + n_z$; in spherical language $N = 2N_r + \ell$.`];
    const ells = []; for (let l = N; l >= 0; l -= 2) ells.push(l);
    if (v === 'deg') {
      q = md`How many states of the 3D isotropic oscillator have $E = ${fr(2 * N + 3, 2)}\hbar\omega$?`;
      parts = [{ lbl: '\\text{degeneracy}', ans: (N + 1) * (N + 2) / 2 }];
      sol = md`$N = ${N}$; the number of ways to write $N = n_x + n_y + n_z$ is $\dfrac{(N+1)(N+2)}{2} = ${(N + 1) * (N + 2) / 2}$. In spherical language: $\ell = ${ells.join(', ')}$, and $\sum(2\ell+1) = ${ells.map((l) => 2 * l + 1).join(' + ')} = ${(N + 1) * (N + 2) / 2}$ ✓.`;
    } else if (v === 'E') {
      const [a, b, c] = [ri(0, 3), ri(0, 3), ri(0, 3)];
      q = md`A 3D isotropic oscillator is in the Cartesian state $(n_x, n_y, n_z) = (${a}, ${b}, ${c})$. Find its energy in units of $\hbar\omega$.`;
      parts = [{ lbl: 'E/\\hbar\\omega', ans: a + b + c + 1.5 }];
      sol = md`Three independent 1D oscillators: $E = \hbar\omega(n_x + n_y + n_z + \tfrac32) = ${fr(2 * (a + b + c) + 3, 2)}\hbar\omega$. The zero-point energy is $\tfrac32\hbar\omega$: $\tfrac12$ per dimension.`;
    } else if (v === 'nl') {
      q = md`The 3D isotropic oscillator level $N = ${N}$ contains several $\ell$ multiplets. How many different values of $\ell$?`;
      parts = [{ lbl: '\\text{number of }\\ell\\text{ values}', ans: ells.length }];
      sol = md`$\ell = N, N - 2, \dots$ down to ${N % 2 ? 1 : 0}: $\ell = ${ells.join(', ')}$, so $${ells.length}$ values. Parity $(-1)^N = (-1)^\ell$ forces $\ell$ to have the parity of $N$.`;
    } else if (v === 'ells') {
      const N2 = ri(2, 5);
      const e2 = []; for (let l = N2; l >= 0; l -= 2) e2.push(l);
      const all = []; for (let l = 0; l <= N2; l++) all.push(l);
      const R = mix([md`$\ell = ${e2.join(', ')}$`, md`$\ell = ${all.join(', ')}$`, md`$\ell = ${N2}$ only`, md`$\ell = ${all.slice(0, -1).join(', ')}$`],
        [null, md`Parity: $(-1)^\ell$ must equal $(-1)^N$, so $\ell$ jumps by 2.`, md`Count states: $2\ell+1 = ${2 * N2 + 1}$ is less than $${(N2 + 1) * (N2 + 2) / 2}$.`, md`That is the hydrogen rule ($\ell \le n - 1$), not the oscillator's.`]);
      q = md`Which $\ell$ values occur in the 3D isotropic oscillator level $N = ${N2}$?`;
      parts = [R];
      sol = md`$\ell = N, N-2, \dots$: $${e2.join(', ')}$. Check: $${e2.map((l) => 2 * l + 1).join(' + ')} = ${(N2 + 1) * (N2 + 2) / 2} = \tfrac{(N+1)(N+2)}{2}$ ✓. Different $\ell$ at the same energy: an accidental degeneracy, like hydrogen's.`;
    } else if (v === 'top') {
      q = md`In the 3D isotropic oscillator level $N = ${N}$, how many states have the largest possible $\ell$?`;
      parts = [{ lbl: '\\text{states}', ans: 2 * N + 1 }];
      sol = md`The largest $\ell$ is $N = ${N}$, with $2\ell + 1 = ${2 * N + 1}$ values of $m$.`;
    } else if (v === 'fill') {
      const N2 = ri(0, 4);
      const tot = (N2 + 1) * (N2 + 2) * (N2 + 3) / 3;
      q = md`Fermions in a 3D isotropic oscillator, two per orbital state (spin). How many fill all levels up to and including $N = ${N2}$?`;
      parts = [{ lbl: '\\text{number}', ans: tot }];
      sol = md`Orbitals per level: $\tfrac{(N+1)(N+2)}{2} = 1, 3, 6, 10, 15$. Doubled and summed: $2, 8, 20, 40, 70$. Answer: $${tot}$. (Magic numbers 2, 8, 20 again, as in the spherical box.)`;
    } else {
      const N2 = ri(0, 6);
      const askE = Math.random() < 0.4;
      q = askE ? md`A 2D isotropic oscillator: find the energy of the level with $n_x + n_y = ${N2}$, in units of $\hbar\omega$.` : md`A 2D isotropic oscillator: how many states have $n_x + n_y = ${N2}$?`;
      parts = [askE ? { lbl: 'E/\\hbar\\omega', ans: N2 + 1 } : { lbl: '\\text{degeneracy}', ans: N2 + 1 }];
      sol = askE ? md`$E = \hbar\omega(n_x + n_y + 1) = ${N2 + 1}\hbar\omega$ (zero-point $\tfrac12$ per dimension).`
        : md`$n_x = 0, \dots, ${N2}$ fixes $n_y$: $${N2 + 1}$ states. In polar language they carry $L_z = m\hbar$ with $m = ${N2}, ${N2 - 2}, \dots, ${-N2}$.`;
    }
    return { title: '3D isotropic oscillator', q, parts, hints, sol };
  };
})();

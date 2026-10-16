/* Loaded after every content file. Puts each study unit's lessons in topic order, builds the question bank (one quiz
   per topic from EM.BANK, plus "random from the whole bank"), the formula sheet (#/sheet) and mixed practice (#/quiz).
   Mixed practice draws its rapid-fire cards and problems from whatever generators the topic lessons use, so a new
   topic joins it automatically. */
(function () {
  'use strict';
  const { R, G } = C;
  const STUDY = ['u0', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6'];
  const study = COURSE.units.filter((u) => STUDY.includes(u.id));

  // topic order inside each unit (stable: lessons without a number keep their place)
  const key = (l, i) => (l.order ?? (typeof l.topic === 'number' ? l.topic : i / 1000));
  study.forEach((u) => { u.lessons = u.lessons.map((l, i) => [key(l, i), i, l]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map((x) => x[2]); });

  // ---------------------------------------------------------------- question bank
  const bankUnit = COURSE.units.find((u) => u.id === 'e2-mcq');
  const topics = [].concat(...study.map((u) => u.lessons)).filter((l) => (EM.BANK[l.id] || []).length);
  const total = topics.reduce((s, l) => s + EM.BANK[l.id].length, 0);
  bankUnit.lessons.push({
    id: 'mcq-all', title: 'Random from the whole bank', kind: 'quiz',
    steps: [R(md`${total} questions across ${topics.length} topics, drawn at random with no repeats until the pool runs out. Options are shuffled every time; every option explains itself after you answer. Each card links to its topic.`), G('concept', { units: ['e2-mcq'], need: 40 })],
  });
  topics.forEach((l) => bankUnit.lessons.push({
    id: `mcq-${l.id}`, title: `${l.topic ?? ''}${l.topic !== undefined ? ' · ' : ''}${l.title}`, kind: 'quiz', hideHome: true,
    steps: [R(md`${EM.BANK[l.id].length} questions on [${l.title}](#/l/${l.id}). Options are shuffled every time.`), ...EM.BANK[l.id]],
  }));

  // ---------------------------------------------------------------- generators used by the lessons, for mixed practice
  const gens = new Set();
  study.forEach((u) => u.lessons.forEach((l) => l.steps.forEach((s) => { if (s.t === 'gen' && s.name !== 'concept') (s.opts.pool || [s.name]).forEach((g) => gens.add(g)); })));
  const RFG = [...gens].filter((g) => /^rf_/.test(g)), PG = [...gens].filter((g) => !/^rf_/.test(g));

  EM.lesson('e2-x', {
    id: 'e2-sheet', title: 'Formula sheet', kind: 'read',
    steps: [
      R(md`
        This is the course's **Midterm 2 formula sheet**, typed. You are given everything in the first part; the second part is what is **not** on it, which you must carry in your head or on your own card. Where each equation comes from and when it fails: [Every equation, explained](#/l/e2-eqs).

        ### Given: Maxwell's equations, force, continuity

        $$\mathbf F = q(\mathbf E + \mathbf v\times\mathbf B) = m\mathbf a \qquad \nabla\cdot\mathbf J + \frac{\partial\rho}{\partial t} = 0$$

        | Integral form | Differential form |
        |---|---|
        | $\oint_S\mathbf D\cdot d\mathbf S = \int_V\rho\,dV$ | $\nabla\cdot\mathbf D = \rho$ |
        | $\oint_S\mathbf B\cdot d\mathbf S = 0$ | $\nabla\cdot\mathbf B = 0$ |
        | $\oint_C\mathbf H\cdot d\mathbf l = \int_S\mathbf J\cdot d\mathbf S + \dfrac{d}{dt}\int_S\mathbf D\cdot d\mathbf S$ | $\nabla\times\mathbf H = \mathbf J + \dfrac{\partial\mathbf D}{\partial t}$ |
        | $\oint_C\mathbf E\cdot d\mathbf l = -\dfrac{d}{dt}\int_S\mathbf B\cdot d\mathbf S$ | $\nabla\times\mathbf E = -\dfrac{\partial\mathbf B}{\partial t}$ |

        ### Given: boundary conditions ($\hat n$ points from region − into region +)

        $$\hat n\times(\mathbf E^+ - \mathbf E^-) = 0 \qquad \hat n\cdot(\mathbf D^+ - \mathbf D^-) = \rho_s \qquad \hat n\cdot(\mathbf B^+ - \mathbf B^-) = 0 \qquad \hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s \qquad \mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat n$$

        ### Given: statics

        $$\nabla\times\mathbf E = 0 \qquad \oint_C\mathbf E\cdot d\mathbf l = 0 \qquad \mathbf E = -\nabla V \qquad \nabla^2V = -\rho/\epsilon \qquad V_A - V_B = \int_A^B\mathbf E\cdot d\mathbf l \qquad C = Q/V$$

        ### Given: static fields in vacuum

        | Source | Field |
        |---|---|
        | point charge $Q$ at the origin | $\mathbf E = \hat r\dfrac{Q}{4\pi\epsilon_0r^2}$ |
        | line charge $\rho_l$ on the $z$-axis | $\mathbf E = \hat r\dfrac{\rho_l}{2\pi\epsilon_0r}$ |
        | surface charge $\rho_s$ on $z = 0$ | $\mathbf E = \pm\hat z\dfrac{\rho_s}{2\epsilon_0}$ for $z \gtrless 0$ |
        | slab $\rho$ for $-\tfrac W2 \le z \le \tfrac W2$ | $\mathbf E = \hat z\dfrac{\rho z}{\epsilon_0}$ inside, $\pm\hat z\dfrac{\rho W}{2\epsilon_0}$ outside |
        | cylinder $\rho$, radius $R$, on the $z$-axis | $\mathbf E = \hat r\dfrac{\rho r}{2\epsilon_0}$ ($r \le R$), $\hat r\dfrac{\rho R^2}{2\epsilon_0r}$ ($r \ge R$) |
        | line current $I$ on the $z$-axis | $\mathbf B = \hat\phi\dfrac{\mu_0I}{2\pi r}$ |
        | sheet $\mathbf J_s = J_s\hat x$ on $z = 0$ | $\mathbf B = \mp\hat y\dfrac{\mu_0J_s}{2}$ for $z \gtrless 0$ |
        | slab $\mathbf J = J\hat x$ for $-\tfrac W2 \le z \le \tfrac W2$ | $\mathbf B = -\hat y\mu_0Jz$ inside, $\mp\hat y\dfrac{\mu_0JW}{2}$ for $z \gtrless \pm\tfrac W2$ |

        Here $r$ is the distance from the $z$-axis (cylindrical) for lines and cylinders, and from the origin for the point charge.

        ### Given: materials

        $$\mathbf D = \epsilon_0\mathbf E + \mathbf P = \epsilon\mathbf E \qquad \mathbf H = \frac{\mathbf B}{\mu_0} - \mathbf M = \frac{\mathbf B}{\mu} \qquad \mathbf J_{\text{free}} = \sigma\mathbf E \qquad \rho_{\text{bound}} = -\nabla\cdot\mathbf P \qquad \mathbf J_{\text{bound}} = \nabla\times\mathbf M + \frac{\partial\mathbf P}{\partial t}$$
        $$\mathbf P = \epsilon_0\chi_e\mathbf E \qquad \mathbf M = \chi_m\mathbf H \qquad \epsilon = \epsilon_0\epsilon_r = \epsilon_0(1 + \chi_e) \qquad \mu = \mu_0\mu_r = \mu_0(1 + \chi_m)$$

        ### Given: plane waves

        For $\mathbf E = E_x(z,t)\hat x$ launched by a sheet $\mathbf J_s = -J_s(t)\hat x$ on $z = 0$:
        $$\frac{\partial^2E_x}{\partial z^2} = \mu\epsilon\frac{\partial^2E_x}{\partial t^2} \qquad E_x = \frac{\eta}{2}J_s\left(t \mp \frac{z}{v_p}\right) \qquad H_y = \pm\frac12J_s\left(t \mp \frac{z}{v_p}\right) \qquad (z \gtrless 0)$$
        $$v_p = \frac{1}{\sqrt{\mu\epsilon}} \qquad c = \frac{1}{\sqrt{\mu_0\epsilon_0}} = 3\times10^8\ \text{m/s} \qquad \eta = \sqrt{\frac\mu\epsilon} \qquad \eta_0 = \sqrt{\frac{\mu_0}{\epsilon_0}} = 120\pi\ \Omega$$
        For $\mathbf J_s = -\cos(\omega t + \phi)\hat x$: $\;E_x = \dfrac{\eta}{2}\cos(\omega t \mp \beta z + \phi)$ for $z \gtrless 0$, with
        $$v_p = \frac\omega\beta = \lambda f \qquad \beta = \frac{2\pi}{\lambda} \qquad \omega = \frac{2\pi}{T} = 2\pi f$$

        ### Not on the sheet: know these

        - **Constants:** $\mu_0 = 4\pi\times10^{-7}$ H/m, $\epsilon_0 \approx 8.854\times10^{-12}$ F/m $\approx \frac{1}{36\pi}\times10^{-9}$ F/m.
        - **Faraday:** $\emf = -N\,d\Psi/dt$, $\Psi = \int_S\mathbf B\cdot d\mathbf S$ (Wb); $C$ and $d\mathbf S$ tied by the right-hand rule. Moving path: $\emf = \oint(\mathbf E + \mathbf v\times\mathbf B)\cdot d\mathbf l$; motional part $\oint(\mathbf v\times\mathbf B)\cdot d\mathbf l$, a bar of length $\ell$: $vB\ell$.
        - **Forces:** $d\mathbf F = I\,d\mathbf l\times\mathbf B$; parallel wires $F/\ell = \mu_0I_1I_2/2\pi d$, attract if the currents are parallel.
        - **Biot–Savart:** $d\mathbf B = \dfrac{\mu_0}{4\pi}\dfrac{I\,d\mathbf l\times\hat R}{R^2}$. Loop of radius $a$, on its axis: $B_z = \dfrac{\mu_0Ia^2}{2(a^2 + z^2)^{3/2}}$, center $\mu_0I/2a$, far away $\mu_0Ia^2/2z^3$.
        - **Ampère shapes:** solenoid ($n$ turns/m) $H = nI$ inside, 0 outside; toroid $H_\phi = NI/2\pi r$ inside; thick wire $H_\phi = Ir/2\pi a^2$ inside; coax $H_\phi = I/2\pi r$ between, 0 outside. Sheet: $\mathbf H = \tfrac12\mathbf J_s\times\hat n$ ($\hat n$ from the sheet toward the point).
        - **Potentials:** $\mathbf B = \nabla\times\mathbf A$, $\mathbf E = -\nabla\Phi - \partial\mathbf A/\partial t$.
        - **Circuits from fields:** $R = \ell/\sigma A$; parallel plate $C = \epsilon A/d$; coax $C' = 2\pi\epsilon/\ln(b/a)$; spheres $C = 4\pi\epsilon\,ab/(b - a)$, isolated sphere $4\pi\epsilon a$. Same geometry: $G/C = \sigma/\epsilon$, and $RC = \epsilon/\sigma$.
        - **Inductance:** $L = N\Psi/I = \Lambda/I$; solenoid $L = \mu N^2A/\ell$; toroid (rectangular section $h$, radii $a$, $b$) $L = \dfrac{\mu N^2h}{2\pi}\ln\dfrac ba$; coax $L' = \dfrac{\mu}{2\pi}\ln\dfrac ba$; parallel-plate line $L' = \mu d/w$. Same transmission line: $L'C' = \mu\epsilon$. Mutual $L_{ab} = \Psi_{ab}/I_a$. Energy $\tfrac12LI^2$.
        - **Relaxation:** $\rho(t) = \rho(0)e^{-t/\tau}$, $\tau = \epsilon/\sigma$; inside a conductor in steady state $\rho = 0$, $\mathbf E = 0$.
        - **Energy and power:** $w_e = \tfrac12\epsilon E^2$, $w_m = \tfrac12\mu H^2$ (J/m³); Poynting $\mathbf S = \mathbf E\times\mathbf H$ (W/m²), it points along the travel direction; a plane wave has $|\mathbf E| = \eta|\mathbf H|$ and $w_e = w_m$.
        - **Waves:** $f(t - z/v_p)$ travels toward $+z$, $f(t + z/v_p)$ toward $-z$; $\mathbf E\times\mathbf H$ points along the travel; in a medium $v_p = c/\sqrt{\mu_r\epsilon_r}$ and $\eta = \eta_0\sqrt{\mu_r/\epsilon_r}$.
      `),
    ],
  });

  EM.lesson('e2-x', {
    id: 'e2-mix', title: 'Mixed practice', kind: 'review',
    steps: [
      R(md`
        Questions from every topic in random order, with nothing telling you which topic they come from. That is how the exam asks them. Every card links back to its lesson, so a miss shows you exactly what to reread.

        ### Concepts
      `),
      G('concept', { need: 15, units: [...STUDY, 'e2-mcq'] }),
      ...(RFG.length ? [R(md`### Rapid fire from every topic`), G(RFG[0], { pool: RFG, need: 20 })] : []),
      ...(PG.length ? [R(md`### Problems with new numbers`), G(PG[0], { pool: PG, need: 10 })] : []),
    ],
  });
})();

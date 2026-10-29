/* Hour Exam II, round 2: intuition-first "picture" lessons, and the exam-format skills Hour Exam I actually tested
   (fields → div/curl/potential/energy, overlapping shapes, images, sphere in a uniform field), translated to Exam II
   material. zz-scope.js places each lesson on the study path. */
(function () {
  'use strict';
  const { R, RF, P, Q } = C;

  // ------------------------------------------------------------------ small drawings (currentColor, so they follow the theme)
  const S = (w, h, body) => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.4" font-family="Inter, sans-serif" font-size="12">${body}</svg>`;
  const T = (x, y, s, extra = '') => `<text x="${x}" y="${y}" fill="currentColor" stroke="none" text-anchor="middle" ${extra}>${s}</text>`;

  // a block of dipoles, uniform P to the right: interior charges pair up, the end faces are left bare
  const FIG_CHAIN = (() => {
    let b = '<rect x="20" y="20" width="300" height="100" rx="4" stroke-dasharray="4 3" opacity="0.6"/>';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      const x = 32 + c * 49, y = 38 + r * 22;
      b += `<ellipse cx="${x + 18}" cy="${y}" rx="20" ry="7" opacity="0.5"/>` + T(x + 6, y + 4, '−') + T(x + 30, y + 4, '+');
    }
    b += '<rect x="20" y="20" width="12" height="100" fill="currentColor" opacity="0.12" stroke="none"/><rect x="308" y="20" width="12" height="100" fill="currentColor" opacity="0.12" stroke="none"/>';
    b += T(42, 138, 'σ_b = −P') + T(298, 138, 'σ_b = +P') + T(170, 138, 'inside: + meets −');
    b += '<path d="M130 152 h80" marker-end="url(#ah)"/>' + T(240, 156, 'P');
    return S(340, 166, '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="currentColor" stroke="none"/></marker></defs>' + b);
  })();

  // a slab tiled with little current loops: neighbours cancel, the rim survives
  const FIG_LOOPS = (() => {
    let b = '';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const x = 30 + c * 52, y = 20 + r * 40;
      b += `<rect x="${x + 6}" y="${y + 6}" width="38" height="28" rx="3" opacity="0.55"/><path d="M${x + 25} ${y + 6} h6" marker-end="url(#ah2)" opacity="0.8"/>`;
    }
    b += '<rect x="30" y="20" width="260" height="120" rx="4" stroke-width="2.6"/>';
    b += '<path d="M150 20 h20" stroke-width="2.6" marker-end="url(#ah2)"/><path d="M170 140 h-20" stroke-width="2.6" marker-end="url(#ah2)"/>';
    b += T(160, 160, 'neighbors cancel; the rim current survives');
    return S(320, 168, '<defs><marker id="ah2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="currentColor" stroke="none"/></marker></defs>' + b);
  })();

  // two overlapping balls, +ρ and −ρ, offset by d: uniform field in the overlap
  const FIG_OVERLAP = S(300, 170,
    '<defs><marker id="ah3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="currentColor" stroke="none"/></marker></defs>' +
    '<circle cx="130" cy="80" r="62" opacity="0.8"/><circle cx="170" cy="80" r="62" stroke-dasharray="5 3" opacity="0.8"/>' +
    T(92, 40, '+ρ') + T(212, 40, '−ρ') +
    '<path d="M180 64 h-50" marker-end="url(#ah3)"/><path d="M180 80 h-50" marker-end="url(#ah3)"/><path d="M180 96 h-50" marker-end="url(#ah3)"/>' +
    '<circle cx="130" cy="80" r="2.5" fill="currentColor"/><circle cx="170" cy="80" r="2.5" fill="currentColor"/>' +
    T(150, 162, 'overlap: E = −ρ d / 3ε₀, uniform (d from − center to + center)'));

  C.unit({
    id: 'h-e2-more', num: '', title: 'Exam II: intuition and exam-format skills (holding)',
    lessons: [
      // ================================================================== the exam
      {
        id: 'e2-format', title: 'Read this first: what Exam I looked like, so what Exam II will', kind: 'read',
        steps: [
          R(md`
            **Hour Exam I (50 minutes, four problems):**

            1. Given some fields: divergence, curl, potential, then a **nasty integral** for the total stored energy.
            2. An infinite **slab and a sphere overlapping**: find $\vb E$ outside by superposition.
            3. **Images** with an infinite sheet held at $V_0$.
            4. A **grounded sphere in a uniform field**.

            The pattern: every problem is a standard setup with **one twist**, and the real enemy is the clock (about 12 minutes a problem). None of it is conceptually exotic. You lose points by grinding through algebra a shortcut would skip, or by running out of time before the last problem.

            ### The same four problems, translated to Exam II material

            | Exam I problem | Most likely Exam II version | Practice it in |
            |---|---|---|
            | Div/curl/potential + energy | Given $\vb P$ → $\rho_b$, $\sigma_b$, $\vb E$, $V$, then $W$. Given $\vb B$ or $\vb A$ → $\vb J$, check $\nabla\cdot\vb B = 0$. Given $\vb M$ → $\vb J_b$, $\vb K_b$, $\vb B$. Energy with a dielectric: $\tfrac12\int\vb D\cdot\vb E$ | [Given a field](#/l/e2-fields), [Energy integrals](#/l/e2-energyint) |
            | Overlapping slab and sphere | Overlapping polarized or current-carrying shapes; holes and cavities | [Overlapping shapes](#/l/e2-overlap) |
            | Images, sheet at $V_0$ | Point charge above a **dielectric** half-space (partial image); dipole above a plane (HW 4.6) | [Images with dielectrics](#/l/e2-dielimg) |
            | Grounded sphere in $\vb E_0$ | **Dielectric** sphere in $\vb E_0$; conductor coated with dielectric (HW 4.24); cavity in a dielectric | [Boundary conditions](#/l/e2-dielbc) |
            | (new material) | Biot–Savart bent wires, Ampère, spinning spheres, $\vb m$ | Units 5–7 |

            !!method The 50-minute plan
                **0–2 min:** read all four. Write down every standard result you will need (a 10-second job each if you know the setups table).
                **2–42 min:** ~10 minutes per problem. Easiest first. When a part stalls for 3 minutes, write the setup (the integral, the BCs, the Ampère loop) and move on.
                **42–50 min:** come back to stalled parts; do limit and unit checks on the answers you have.

            !!key Partial credit is mostly in the setup
                "Correct form of $V$ in each region, correct BCs" or "Gaussian surface drawn, $Q_{f,\text{enc}}$ written" is most of the points. An unfinished integral with the right limits and integrand beats a finished wrong one.
          `),
        ],
      },

      // ================================================================== pictures
      {
        id: 'e2-pic-P', title: 'The picture: what a dielectric actually does',
        steps: [
          RF(md`
            Forget the formulas for a minute. A dielectric is made of molecules with their charges bound together. Put it in a field and each molecule **stretches** a tiny bit: its $+$ end slides along $\vb E$, its $-$ end slides back. Nothing leaves its molecule. That's the whole physics.

            [[fig:chain]]

            Now look at a block of stretched molecules. Inside, every $+$ end sits next to the $-$ end of the neighbor, so the interior still looks neutral. But on the face where the $\vb P$ arrows **exit**, the $+$ ends have no partners: a thin layer of $+$ charge. On the face where they **enter**, a layer of $-$. That's $\sigma_b = \vb P\cdot\uv n$: positive where $\vb P$ leaves, negative where it enters.

            !!intuition When does the inside stop being neutral?
                When the stretching isn't the same everywhere. If $\vb P$ grows to the right, each molecule's $+$ end is a bit bigger than the next one's $-$ end can cancel. Wherever more $\vb P$ arrows leave a little box than enter it, $-$ charge is left behind: $\rho_b = -\nabla\cdot\vb P$. Uniform $\vb P$ → nothing inside. **Linear and homogeneous** with no free charge → nothing inside either, because then $\nabla\cdot\vb P\propto\nabla\cdot\vb D = 0$.

            !!intuition Why the field inside gets weaker
                The bound charge on the faces is $-$ next to the $+$ plate and $+$ next to the $-$ plate. It partly cancels the plate charge, so $\vb E$ inside drops by $\varepsilon_r$. Same free charge, less field, less voltage: **more capacitance**. That's the entire reason capacitors are filled with dielectric.

            !!intuition What D really is
                $\vb D$ is "the field the free charge **would** make if the bound charge weren't there", in units of C/m². It ignores bound charge by construction. That makes it easy to find (Gauss, free charge only), but it's only determined by free charge when symmetry pins it down. Then $\vb E = \vb D/\varepsilon$ puts the material back in.

            ### Boundary conditions you can see

            - **$E_\parallel$ continuous:** walk a tiny loop across the interface. $\oint\vb E\cdot d\vb l = 0$, so what you gain along one side you lose on the other.
            - **$D_\perp$ jumps by $\sigma_f$ only:** a pillbox only cares about free charge for $\vb D$. Bound surface charge changes $E_\perp$, not $D_\perp$.

            So at a dielectric interface with no free charge: the parallel part of $\vb E$ goes straight through, the perpendicular part shrinks by $\varepsilon_1/\varepsilon_2$. Field lines **bend toward the surface** as they enter the denser material.

            ### Rough numbers

            Air $\varepsilon_r\approx1.0006$, glass ~5, silicon ~12, water ~80. Bound charge is a fraction $\chi_e/\varepsilon_r = 1 - 1/\varepsilon_r$ of the free charge it sits against: 0 for vacuum, 80% for glass, 99% for water.
          `, { chain: { svg: FIG_CHAIN, cap: 'Uniform polarization: the interior pairs cancel; only the two end faces carry bound charge.' } }),
          Q(md`A slab of glass ($\varepsilon_r = 5$) fills a capacitor whose plates carry $\pm\sigma$. The bound charge on the glass face next to the $+$ plate is`,
            [md`$-\tfrac45\sigma$`, md`$-\sigma$`, md`$+\tfrac45\sigma$`, md`$-\tfrac15\sigma$`], 0,
            [null, md`That's a conductor (complete cancellation).`, md`Sign: the $-$ ends of the molecules face the $+$ plate.`, md`$\tfrac15\sigma$ is what's **left** after the bound charge cancels: the net charge $\sigma/\varepsilon_r$.`],
            md`$|\sigma_b| = P = D(1 - 1/\varepsilon_r) = \tfrac45\sigma$, negative next to the positive plate. Net charge at that face: $\sigma - \tfrac45\sigma = \sigma/5$, which is why $E$ dropped by 5.`),
          Q(md`Inside a linear dielectric, $\vb P$ points everywhere radially outward from a free point charge $q>0$ at the center, with $|\vb P|\propto1/r^2$. Where is the bound charge?`,
            [md`A $-$ point-like cloud at the center and $+$ on the outer surface`, md`Spread uniformly through the volume`, md`Only on the outer surface`, md`Nowhere`], 0,
            [null, md`$\nabla\cdot(\uv r/r^2) = 0$ away from the origin, so $\rho_b = 0$ in the bulk.`, md`The $-$ ends of the molecules nearest $q$ face it: a negative cloud hugs $q$.`, md`$\vb P\ne0$, so there is bound charge; it just isn't in the bulk.`],
            md`$\vb P\propto\uv r/r^2$ has zero divergence except at the origin (the delta function from Exam I!). So $\rho_b$ is a $-$ point charge $-q\chi_e/(1+\chi_e)$ at the center and the compensating $+$ is on the outer surface.`),
          Q(md`A field line goes from vacuum into a dielectric with $\varepsilon_r = 10$. Which statement is right?`,
            [md`$E_\parallel$ is unchanged and $E_\perp$ drops 10×, so the line tilts toward the surface`, md`Both components drop 10×, so the direction is unchanged`, md`$E_\perp$ is unchanged and $E_\parallel$ drops 10×`, md`The line bends toward the normal, like light entering glass`], 0,
            [null, md`Only $E_\perp$ feels the bound surface charge.`, md`Swapped: the loop argument protects $E_\parallel$.`, md`Light refraction follows different rules (it's a wave). Static field lines bend away from the normal.`],
            md`$E_\parallel$ continuous (loop), $\varepsilon E_\perp$ continuous (pillbox, no free charge). Big $\varepsilon$ means small $E_\perp$: the line hugs the surface.`),
        ],
      },
      {
        id: 'e2-pic-B', title: 'The picture: seeing B before you calculate it',
        steps: [
          R(md`
            On the exam you'll save the most time by knowing **which way $\vb B$ points and which components vanish** before you write an integral. Here are the arguments; each is one sentence you can write as justification.

            ### Right-hand rules (only two to remember)

            - **Straight current:** thumb along $I$, fingers curl the way $\vb B$ circles.
            - **Loop:** fingers along $I$, thumb gives $\vb m$ and $\vb B$ through the middle of the loop.

            ### Symmetry arguments for a long straight wire

            - **No radial component:** if $B_s\ne0$, there would be net flux out of a coaxial cylinder (the end caps cancel by symmetry). $\oint\vb B\cdot d\vb a = 0$ forbids it.
            - **No $z$ component:** Ampère around a rectangle with sides parallel to the wire, one side at infinity, encloses no current, so $B_z$ is the same everywhere and equal to its value at infinity: 0.
            - **What's left:** $B_\phi(s)$ only. That's exactly what Ampère's circle needs.

            ### For a sheet

            $\vb B$ is parallel to the sheet, perpendicular to $\vb K$, same magnitude on both sides, opposite directions. The jump across it is $\mu_0K$, so each side gets half: $\mu_0K/2$. **The field doesn't fall off with distance** (infinite sheet), just like $\sigma/2\varepsilon_0$.

            ### For a solenoid

            Inside: along the axis, uniform. Outside: zero. Why zero? Ampère with a rectangle entirely outside says $B_{\text{out}}$ is the same at every distance; it must vanish far away, so it's zero everywhere outside. Then a rectangle straddling the winding gives $B_{\text{in}}L = \mu_0nIL$.

            !!intuition B compared with E
                $\vb E$ points **away** from its source (radial from a charge). $\vb B$ points **around** its source (circling a current). Divergence measures "away", curl measures "around". So $\nabla\cdot\vb E = \rho/\varepsilon_0$ and $\nabla\times\vb B = \mu_0\vb J$ are the same statement for the two fields. And there's no $\vb B$ "charge": field lines never start or stop. They close.

            !!method Biot–Savart or Ampère?
                **Ampère** when one of the four symmetric shapes fits (line, plane, solenoid, toroid), including superpositions of them. **Biot–Savart** for anything finite: loops, arcs, segments, a point on the axis of a ring. Never use Ampère for a finite segment: $\vb B$ isn't constant around your loop and $I_{\text{enc}}$ isn't even well defined (the current doesn't close).

            ### Size check

            $\mu_0 = 4\pi\times10^{-7}$ T·m/A. A 1 A wire at 1 cm: $\mu_0I/2\pi s = 2\times10^{-5}$ T = 20 μT, about half the Earth's field. A solenoid with 1000 turns/m at 1 A: $\mu_0nI\approx1.3$ mT.
          `),
          Q(md`For an infinite straight wire, why is there no component of $\vb B$ along the wire?`,
            [md`Ampère around a rectangle with sides parallel to the wire (one at infinity) encloses no current, so $B_z$ equals its value at infinity: 0`, md`Biot–Savart: $d\vb l\times\uv{\srm}$ is perpendicular to $d\vb l$, which is along $z$`, md`$\nabla\cdot\vb B = 0$`, md`Both of the first two arguments work`], 3,
            [md`Valid, but not the only valid argument.`, md`Valid, but not the only valid argument.`, md`Divergence kills the **radial** component, not $B_z$.`, null],
            md`Either works. Biot–Savart: every $d\vb l\parallel\hat{\mathbf z}$, and $\hat{\mathbf z}\times\uv{\srm}$ has no $z$ component. Ampère: the rectangle argument. Write one sentence of either on the exam.`),
          Q(md`A long solenoid's field outside is zero. Which argument is correct?`,
            [md`Ampère around a rectangle outside: $B$ is the same at every distance, and it must vanish far away`, md`The turns' fields cancel by Biot–Savart, exactly, at every outside point`, md`$\nabla\cdot\vb B = 0$ forces it`, md`It isn't zero; it's $\mu_0nI/2$`], 0,
            [null, md`That's true but not how you'd show it quickly; the Ampère argument is one line.`, md`Divergence alone doesn't fix it.`, md`$\mu_0nI/2$ is at the mouth of a semi-infinite solenoid, on the axis.`],
            md`The rectangle encloses no current, so $B(s_1) = B(s_2)$ for any two outside distances; $B\to0$ far away, hence zero everywhere outside.`),
          Q(md`A circular loop lies flat on the table with current running clockwise seen from above. Inside the loop, $\vb B$ points`,
            [md`down, into the table`, md`up`, md`around the wire`, md`zero at the center`], 0,
            [null, md`Curl your fingers clockwise (seen from above): your thumb points down.`, md`Near the wire itself it circles, but through the middle of the loop it's along the axis.`, md`The center is where all elements add: $\mu_0I/2R$.`],
            md`Fingers along the current, thumb gives $\vb B$ inside: clockwise from above → down.`),
        ],
      },
      {
        id: 'e2-pic-M', title: 'The picture: magnets as tiny current loops',
        steps: [
          RF(md`
            Every atom with a net magnetic moment is a tiny current loop. A magnetized material is a slab tiled with them, all circulating the same way.

            [[fig:loops]]

            Where two loops touch, their currents run in **opposite** directions and cancel. The only current left is around the rim: $\vb K_b = \vb M\times\uv n$, flowing on the faces **parallel** to $\vb M$. If $\vb M$ isn't uniform, neighboring loops don't cancel exactly and a leftover volume current appears: $\vb J_b = \nabla\times\vb M$.

            !!intuition A bar magnet is a solenoid; an electret is a capacitor
                Long bar magnetized along its length: the rim current runs around the sides, exactly a solenoid with $nI = M$. So $\vb B\approx\mu_0\vb M$ inside, strong. Long electret polarized along its length: bound charge only on the two **ends**, far apart, so $\vb E\approx0$ inside. Same geometry, opposite answers, because one makes currents on the sides and the other charges on the ends.

            !!intuition What H is (and why it points backward inside a bar magnet)
                $\vb B$ lines always close: out the north end, around, back in the south end, and **through** the magnet from south to north. $\vb H = \vb B/\mu_0 - \vb M$ behaves like $\vb E$ in an electret: it starts on the north-end "poles" and ends on the south-end ones, so inside a short magnet $\vb H$ points **backward** (against $\vb M$). $\vb H$ is the field from free currents and poles; $\vb B$ is the total.

            ### Para, dia, ferro, physically

            - **Paramagnet:** unpaired spins already have moments; $\vb B$ torques them into line. Thermal jiggling fights it, so the effect is weak ($\chi_m\sim10^{-5}$).
            - **Diamagnet:** no permanent moments. Turning on $\vb B$ speeds up or slows down orbits so as to **oppose** the change (Lenz's law at the atomic scale). Always present, always weak ($\chi_m\sim-10^{-5}$).
            - **Ferromagnet:** neighboring spins lock together in domains; a tiny field swings whole domains. Not linear; keeps $\vb M$ after the field is gone.

            !!key The one-line test for any magnetization problem
                Find $\vb J_b$ and $\vb K_b$. Then ask: **is this a current distribution I've already solved?** Rim current on a sphere ∝ $\sin\theta$ → spinning shell. Rim current around a cylinder → solenoid. $\hat{\boldsymbol\phi}$-directed $\vb M$ → $\vb J_b$, $\vb K_b$ along $z$ that cancel → field confined inside. And if there's no free current and the shape is symmetric, skip all of it: $\vb H = 0$, $\vb B = \mu_0\vb M$.
          `, { loops: { svg: FIG_LOOPS, cap: 'Uniform magnetization: neighboring loops cancel; only the rim current survives.' } }),
          Q(md`A short, fat cylinder (a "button" magnet) is magnetized along its axis. Inside it, compared with $\vb M$, $\vb H$ points`,
            [md`backward (against $\vb M$), and $\vb B$ forward`, md`forward, like $\vb B$`, md`$\vb H = 0$ exactly`, md`backward, and $\vb B$ backward too`], 0,
            [null, md`That's a long rod, where $\vb H\approx0$; a button is close to the slab limit where $\vb H\approx-\vb M$.`, md`$\vb H = 0$ needs symmetry plus no poles; a finite magnet has poles on its faces.`, md`$\vb B$ lines go through the magnet from S to N, along $\vb M$.`],
            md`$\vb H_{\text{in}} = -N\vb M$ with $N$ close to 1 for a flat shape, while $\vb B = \mu_0(1 - N)\vb M$ is small but still forward.`),
          Q(md`A slab is magnetized along $\hat{\mathbf x}$ with $\vb M = ky\,\hat{\mathbf x}$ (stronger as $y$ grows). Is there a bound volume current?`,
            [md`Yes, $\vb J_b = -k\hat{\mathbf z}$`, md`Yes, $\vb J_b = +k\hat{\mathbf z}$`, md`No, only surface currents`, md`Yes, along $\hat{\mathbf x}$`], 0,
            [null, md`Sign: $(\nabla\times\vb M)_z = \partial_xM_y - \partial_yM_x = -k$.`, md`$\vb M$ varies, so neighboring loops don't cancel.`, md`$\vb J_b = \nabla\times\vb M$ is perpendicular to $\vb M$ here.`],
            md`$(\nabla\times\vb M)_z = \partial_xM_y - \partial_yM_x = -k$. Picture: the little loops lie in the $yz$ plane and get stronger as $y$ grows, so where two rows touch, their $z$-directed edges no longer cancel. The leftover is a uniform current along $-\hat{\mathbf z}$.`),
        ],
      },

      // ================================================================== given a field
      {
        id: 'e2-fields', title: 'Given a field: divergence, curl, sources, potential',
        steps: [
          R(md`
            Exam I opened with "here are some fields; find div, curl, potential". Expect the same with Exam II fields. The physics is a dictionary:

            | You're given | Divergence tells you | Curl tells you | Potential |
            |---|---|---|---|
            | $\vb E$ (static) | $\rho_{\text{total}}/\varepsilon_0$ | must be $0$ (else not electrostatic) | $V = -\int\vb E\cdot d\vb l$ |
            | $\vb D$ | $\rho_f$ | $\nabla\times\vb P$ | none in general |
            | $\vb P$ | $-\rho_b$ | (not used) | — |
            | $\vb B$ | must be $0$ (else not a magnetic field) | $\mu_0\vb J$ | $\vb A$ with $\nabla\times\vb A = \vb B$ |
            | $\vb A$ | gauge choice ($0$ in Coulomb gauge) | $\vb B$ | — |
            | $\vb M$ | (poles, $-\nabla\cdot\vb M$, source $\vb H$) | $\vb J_b$ | — |
            | $\vb H$ | $-\nabla\cdot\vb M$ | $\vb J_f$ | — |

            !!intuition Divergence = "spreads out", curl = "swirls"
                Picture a tiny paddlewheel and a tiny balloon dropped in the field. The balloon swells where field lines leave (divergence $>0$: a source). The paddlewheel spins where the field is stronger on one side than the other (curl: circulation). A wire's $\vb B = \frac{\mu_0I}{2\pi s}\hat{\boldsymbol\phi}$ swirls **around** the wire, yet away from the wire a paddlewheel doesn't spin: the faster flow near the wire is exactly compensated by the shorter path. Curl is zero except **on** the wire, where all the current is.

            ### The one-liners (memorize: they cover 90% of exam fields)

            | Field | Divergence | Curl |
            |---|---|---|
            | $F(r)\,\uv r$ | $\dfrac{1}{r^2}\dfrac{d}{dr}(r^2F)$ | $0$ |
            | $F(s)\,\hat{\mathbf s}$ | $\dfrac1s\dfrac{d}{ds}(sF)$ | $0$ |
            | $F(s)\,\hat{\boldsymbol\phi}$ | $0$ | $\dfrac1s\dfrac{d}{ds}(sF)\,\hat{\mathbf z}$ |
            | $F(s)\,\hat{\mathbf z}$ | $0$ | $-\dfrac{dF}{ds}\,\hat{\boldsymbol\phi}$ |
            | $F(z)\,\hat{\mathbf x}$ | $0$ | $\dfrac{dF}{dz}\,\hat{\mathbf y}$ |
            | $F(r,\theta)\,\hat{\boldsymbol\phi}$ (spinning things) | $0$ | use the full spherical curl |

            !!method Speed trick: never write the full curl formula
                Identify which single component the field has and what it depends on, then write only the surviving term from the table. Writing out all nine partial derivatives in spherical coordinates costs two minutes and invites a slip.

            !!trap Hidden sources at the origin (Exam I callback)
                $\uv r/r^2$ has zero divergence everywhere except $r = 0$, where it's $4\pi\delta^3(\vb r)$: a point charge. $\hat{\boldsymbol\phi}/s$ has zero curl except on the axis, where it's $2\pi\delta^2\hat{\mathbf z}$: a line current. If a field blows up like $1/r^2$ or $1/s$ at the origin, say what's hiding there.

            !!method Getting a potential fast
                **$V$:** integrate $\vb E$ inward from infinity (or from wherever $V$ is fixed), region by region, keeping $V$ continuous at boundaries. Check by differentiating: 15 seconds. **$\vb A$:** use $\oint\vb A\cdot d\vb l = \Phi_B$ with the symmetry of $\vb B$, or for $\vb B = B(s)\hat{\boldsymbol\phi}$ use $\vb A = A_z(s)\hat{\mathbf z}$ with $B_\phi = -dA_z/ds$.

            ### Worked example (Exam I style, with Exam II fields)

            $\vb B = ks^2\,\hat{\boldsymbol\phi}$ for $s<a$, $\vb B = \dfrac{ka^3}{s}\hat{\boldsymbol\phi}$ for $s>a$.

            1. **Valid magnetic field?** $\hat{\boldsymbol\phi}$-only, depends on $s$: divergence 0 ✓.
            2. **Current:** inside $\mu_0J_z = \frac1s\frac{d}{ds}(ks^3) = 3ks$. Outside $\frac1s\frac{d}{ds}(ka^3) = 0$. Continuous at $s = a$ ($ka^2$ both sides), so no surface current.
            3. **Total current:** $B(a)\cdot2\pi a = \mu_0I$ gives $I = 2\pi ka^3/\mu_0$. Check: $\int_0^a\frac{3ks}{\mu_0}2\pi s\,ds = \frac{2\pi ka^3}{\mu_0}$ ✓.
            4. **$\vb A$** (pick $A_z(0) = 0$): $A_z = -\int_0^sks'^2\,ds' = -\frac{ks^3}{3}$ inside; outside $A_z = -\frac{ka^3}{3} - ka^3\ln\frac sa$.

            Four steps, each one line. That's the speed you want.

            ### Another: is it E, B, both, or neither?

            | Field | div | curl | Verdict |
            |---|---|---|---|
            | $k(x\hat{\mathbf x} + y\hat{\mathbf y})$ | $2k$ | $0$ | electrostatic ($\rho = 2\varepsilon_0k$, $V = -\tfrac k2(x^2+y^2)$), **not** magnetic |
            | $k(-y\hat{\mathbf x} + x\hat{\mathbf y})$ | $0$ | $2k\hat{\mathbf z}$ | magnetic ($\vb J = 2k/\mu_0\,\hat{\mathbf z}$: inside a wire), **not** electrostatic |
            | $k(y\hat{\mathbf x} + x\hat{\mathbf y})$ | $0$ | $0$ | both ($V = -kxy$; a current-free $\vb B$) |
            | $k(x\hat{\mathbf y})$ | $0$ | $k\hat{\mathbf z}$ | magnetic only |
          `),
          Q(md`$\vb B = k\,s\,\hat{\mathbf s}$ (cylindrical). Could this be a magnetostatic field?`,
            [md`No: $\nabla\cdot\vb B = 2k\ne0$`, md`Yes, produced by $\vb J = 2k/\mu_0\,\hat{\mathbf z}$`, md`Yes, it's current-free`, md`Only inside a magnetized material`], 0,
            [null, md`Its curl is zero, so there's no current anyway, but the real problem is the divergence.`, md`It fails $\nabla\cdot\vb B = 0$.`, md`$\nabla\cdot\vb B = 0$ holds even inside materials.`],
            md`$\frac1s\frac{d}{ds}(s\cdot ks) = 2k$. No magnetic field anywhere, in any material, has a divergence.`),
          Q(md`$\vb B = \dfrac{\mu_0I}{2\pi s}\hat{\boldsymbol\phi}$ everywhere. What is $\nabla\times\vb B$?`,
            [md`$0$ for $s>0$, and a line current $\mu_0I\delta^2(s)\hat{\mathbf z}$ on the axis`, md`$0$ everywhere`, md`$\mu_0I/(2\pi s^2)\,\hat{\mathbf z}$`, md`$-\mu_0I/(2\pi s^2)\,\hat{\mathbf z}$`], 0,
            [null, md`Then $\oint\vb B\cdot d\vb l$ around the axis would be 0, but it's $\mu_0I$.`, md`$\frac1s\frac{d}{ds}(s\cdot\frac{c}{s}) = 0$: no $1/s^2$ survives.`, md`Same: the derivative of a constant is zero.`],
            md`$\frac1s\frac{d}{ds}\left(s\cdot\frac{\mu_0I}{2\pi s}\right) = 0$ for $s>0$. Stokes says the circulation is $\mu_0I$, so all of it sits on the axis: the wire.`),
          P({
            id: 'e2-fields-p1', title: 'Exam I problem 1, Exam II version: given E, everything',
            q: md`Inside a sphere of radius $R$, $\vb E = kr^3\,\uv r$; outside, $\vb E = \dfrac{kR^5}{r^2}\uv r$. Find (a) $\rho$ inside, (b) $V$ at the center ($V(\infty) = 0$), (c) the total energy $W = \frac{\varepsilon_0}{2}\int E^2\,d\tau$.`,
            hints: [md`$\rho = \varepsilon_0\frac{1}{r^2}\frac{d}{dr}(r^2E)$.`, md`$V(0) = \int_0^\infty E\,dr$, split at $R$.`, md`$\int_0^Rk^2r^6\,4\pi r^2dr + \int_R^\infty\frac{k^2R^{10}}{r^4}4\pi r^2dr$.`],
            parts: [
              { lbl: md`(a) $\rho$`, expr: '5*eps0*k*r^2', vars: { eps0: [0.5, 2], k: [1, 3], r: [0.2, 0.9] } },
              { lbl: md`(b) $V(0)$`, expr: '5*k*R^4/4', vars: { k: [1, 3], R: [0.5, 2] } },
              { lbl: md`(c) $W$`, expr: '20*pi*eps0*k^2*R^9/9', vars: { eps0: [0.5, 2], k: [1, 2], R: [0.5, 1.5] } },
            ],
            sol: md`
              (a) $\varepsilon_0\frac{1}{r^2}\frac{d}{dr}(kr^5) = 5\varepsilon_0kr^2$. Outside, $r^2E$ is constant, so $\rho = 0$ ✓.

              (b) Outside: $\int_R^\infty\frac{kR^5}{r^2}dr = kR^4$. Inside: $\int_0^Rkr^3dr = \frac{kR^4}{4}$. Total $\frac54kR^4$.

              (c) $\frac{\varepsilon_0}{2}4\pi k^2\left[\frac{R^9}{9} + R^{10}\cdot\frac1R\right] = 2\pi\varepsilon_0k^2R^9\cdot\frac{10}{9} = \frac{20\pi\varepsilon_0k^2R^9}{9}$.

              **Check by the other route:** $\frac12\int\rho V\,d\tau$ with $V_{\text{in}} = \frac k4(5R^4 - r^4)$ gives $\frac{5\pi\varepsilon_0k^2}{2}\left(R^9 - \frac{R^9}{9}\right) = \frac{20\pi\varepsilon_0k^2R^9}{9}$ ✓. On the exam, pick whichever integral looks easier. Here $\int E^2$ wins: no need to find $V(r)$ first.
            `,
          }),
          P({
            id: 'e2-fields-p2', title: 'Given B, find J, total current, and A',
            q: md`$\vb B = ks^2\hat{\boldsymbol\phi}$ for $s<a$, $\vb B = \dfrac{ka^3}{s}\hat{\boldsymbol\phi}$ for $s>a$. Find (a) $J_z$ inside, (b) the total current, (c) $A_z$ inside with $A_z(0) = 0$.`,
            hints: [md`$\mu_0J_z = \frac1s\frac{d}{ds}(sB_\phi)$.`, md`$B_\phi = -\frac{dA_z}{ds}$.`],
            parts: [
              { lbl: md`(a) $J_z$`, expr: '3*k*s/mu0', vars: { k: [1, 3], s: [0.1, 0.5], mu0: [0.5, 2] } },
              { lbl: md`(b) $I$`, expr: '2*pi*k*a^3/mu0', vars: { k: [1, 3], a: [0.5, 2], mu0: [0.5, 2] } },
              { lbl: md`(c) $A_z$`, expr: '-k*s^3/3', vars: { k: [1, 3], s: [0.1, 0.5] } },
            ],
            sol: md`(a) $\frac{1}{\mu_0s}\frac{d}{ds}(ks^3) = \frac{3ks}{\mu_0}$. (b) Ampère at $s = a$: $ka^2\cdot2\pi a = \mu_0I$. (c) $A_z = -\int_0^sks'^2ds' = -ks^3/3$. Check: $-\frac{d}{ds}(-ks^3/3) = ks^2$ ✓.`,
          }),
          P({
            id: 'e2-fields-p3', title: 'Given P: the frozen sphere, and the energy surprise',
            q: md`A sphere of radius $R$ has $\vb P = kr^2\,\uv r$ and no free charge. Find (a) $\rho_b$, (b) $\sigma_b$, (c) $E_r$ inside, (d) $V(0)$, (e) $\frac{\varepsilon_0}2\int E^2\,d\tau$. (f) What is $\frac12\int\vb D\cdot\vb E\,d\tau$?`,
            hints: [md`No free charge + spherical symmetry: $\vb D = 0$.`, md`$V(0) = \int_0^RE_r\,dr$ (outside, $E = 0$ so $V(R) = 0$).`],
            parts: [
              { lbl: md`(a) $\rho_b$`, expr: '-4*k*r', vars: { k: [1, 3], r: [0.2, 0.9] } },
              { lbl: md`(b) $\sigma_b$`, expr: 'k*R^2', vars: { k: [1, 3], R: [0.5, 2] } },
              { lbl: md`(c) $E_r$`, expr: '-k*r^2/eps0', vars: { k: [1, 3], r: [0.2, 0.9], eps0: [0.5, 2] } },
              { lbl: md`(d) $V(0)$`, expr: '-k*R^3/(3*eps0)', vars: { k: [1, 3], R: [0.5, 2], eps0: [0.5, 2] } },
              { lbl: md`(e) $W$`, expr: '2*pi*k^2*R^7/(7*eps0)', vars: { k: [1, 3], R: [0.5, 1.5], eps0: [0.5, 2] } },
              { lbl: md`(f) $\tfrac12\int\vb D\cdot\vb E$`, mc: [md`$0$`, md`the same as (e)`, md`(e) divided by $\varepsilon_r$`, md`not defined`], a: 0,
                why: [null, md`$\vb D = 0$ everywhere here.`, md`There's no $\varepsilon_r$: $\vb P$ is frozen in, not linear.`, md`It's defined; it's just zero.`] },
            ],
            sol: md`
              (a) $-\frac{1}{r^2}\frac{d}{dr}(kr^4) = -4kr$. (b) $kR^2$. Check: $kR^2\cdot4\pi R^2 - \int_0^R4kr\cdot4\pi r^2dr = 4\pi kR^4 - 4\pi kR^4 = 0$ ✓.

              (c) $\vb D = 0$, so $\vb E = -\vb P/\varepsilon_0$. (d) $V(0) = V(R) - \int_R^0E_r\,dr = \int_0^R\left(-\frac{kr^2}{\varepsilon_0}\right)dr = -\frac{kR^3}{3\varepsilon_0}$.

              (e) $\frac{\varepsilon_0}{2}\int_0^R\frac{k^2r^4}{\varepsilon_0^2}4\pi r^2dr = \frac{2\pi k^2R^7}{7\varepsilon_0}$.

              (f) Zero. **Physics:** $\frac12\int\vb D\cdot\vb E$ is the work done on **free** charge, and there is none. $\frac{\varepsilon_0}2\int E^2$ is the energy of assembling the bound charge distribution itself. Kuo-style trap: know which one they're asking for.
            `,
          }),
        ],
      },

      // ================================================================== energy integrals
      {
        id: 'e2-energyint', title: 'Nasty energy integrals, done fast',
        steps: [
          R(md`
            Exam I ended its first problem with "find the total energy stored", and the integral was ugly. Here's how to make every such integral routine.

            ### Pick the route

            | Route | Use when |
            |---|---|
            | $\frac{\varepsilon_0}{2}\int E^2\,d\tau$ | no dielectric, or they ask for the energy of **all** charge (bound included) |
            | $\frac12\int\vb D\cdot\vb E\,d\tau = \frac12\int\frac{D^2}{\varepsilon}d\tau$ | linear dielectrics; "the energy of this configuration" |
            | $\frac12\int\rho_fV\,d\tau$ | you already have $V$ and the charge is confined to a small region (no integral to infinity) |
            | $\tfrac12QV$, $\tfrac12CV^2$, $Q^2/2C$ | conductors and capacitors: no integral at all |

            !!method The five moves
                1. **Shells immediately:** $d\tau = 4\pi r^2dr$ (sphere), $2\pi s\ell\,ds$ (cylinder), $A\,dz$ (slab). Never leave a triple integral.
                2. **One region at a time.** Split at every boundary. In each region $E^2$ is (constant)² × (a power of $r$). Pull the constants out **before** integrating.
                3. **Use $D$, not $E$, with dielectrics:** $D$ comes straight from free charge, and $\frac{D^2}{2\varepsilon}$ puts $\varepsilon$ in one place.
                4. **Outside a sphere** the field is always $\frac{Q}{4\pi\varepsilon_0r^2}$, so that piece is always $\frac{Q^2}{8\pi\varepsilon_0R}$. Write it down without integrating.
                5. **Check a limit:** $\varepsilon_r\to1$, or uniform ball $\frac{3Q^2}{20\pi\varepsilon_0R}$, or shell $\frac{Q^2}{8\pi\varepsilon_0R}$.

            !!trap Infinite lines and sheets have infinite energy
                $\int\frac{ds}{s}$ to infinity diverges. If the setup is an infinite line or cylinder, the energy is asked **per length** and **between** two radii (coax: $\frac{W}{L} = \frac{\lambda^2}{4\pi\varepsilon}\ln\frac ba$), or of a finite region.

            ### Memorize these

            | Configuration | $W$ |
            |---|---|
            | Shell, charge $Q$ | $\dfrac{Q^2}{8\pi\varepsilon_0R}$ |
            | Uniform ball | $\dfrac{3Q^2}{20\pi\varepsilon_0R}$ (inside part $\frac{Q^2}{40\pi\varepsilon_0R}$, outside $\frac{Q^2}{8\pi\varepsilon_0R}$) |
            | Uniform ball made of dielectric $\varepsilon_r$ (free $\rho$) | $\dfrac{Q^2}{8\pi\varepsilon_0R}\left(1 + \dfrac{1}{5\varepsilon_r}\right)$ |
            | Conductor $Q$, dielectric shell to $b$ (HW 4.26) | $\dfrac{Q^2}{8\pi\varepsilon_0}\left[\dfrac1{\varepsilon_r}\left(\dfrac1a - \dfrac1b\right) + \dfrac1b\right]$ |
            | Coax, per length | $\dfrac{\lambda^2}{4\pi\varepsilon}\ln\dfrac ba$ |

            ### Worked: the ugly one, in 90 seconds

            Conductor (radius $a$, charge $Q$) inside a shell of dielectric whose permittivity varies, $\varepsilon(r) = \varepsilon_0\,r/a$, out to $b$.

            - $D = \dfrac{Q}{4\pi r^2}$ (free charge only). $\dfrac{D^2}{2\varepsilon} = \dfrac{Q^2}{32\pi^2r^4}\cdot\dfrac{a}{\varepsilon_0r}$.
            - Shell: $\displaystyle\int_a^b\frac{Q^2a}{32\pi^2\varepsilon_0r^5}4\pi r^2dr = \frac{Q^2a}{8\pi\varepsilon_0}\int_a^b\frac{dr}{r^3} = \frac{Q^2a}{16\pi\varepsilon_0}\left(\frac1{a^2} - \frac1{b^2}\right)$.
            - Outside: $\dfrac{Q^2}{8\pi\varepsilon_0b}$ (move 4, no integral).

            $$W = \frac{Q^2}{16\pi\varepsilon_0a}\left(1 - \frac{a^2}{b^2}\right) + \frac{Q^2}{8\pi\varepsilon_0b}.$$

            Check $b\to a$: $\frac{Q^2}{8\pi\varepsilon_0a}$, the bare conductor ✓.
          `),
          P({
            id: 'e2-eint-p1', title: 'A ball of dielectric with free charge',
            q: md`A ball of radius $R$ made of linear dielectric $\varepsilon_r$ holds uniform free charge $Q$. Find the energy (a) stored inside the ball, (b) total.`,
            hints: [md`Inside $D = \frac{Qr}{4\pi R^3}$.`, md`$\frac12\int\frac{D^2}{\varepsilon}4\pi r^2dr$ inside; outside is $\frac{Q^2}{8\pi\varepsilon_0R}$.`],
            parts: [
              { lbl: md`(a) $W_{\text{in}}$`, expr: 'Q^2/(40*pi*eps0*epsr*R)', vars: { Q: [1, 3], eps0: [0.5, 2], epsr: [1.5, 5], R: [0.5, 2] } },
              { lbl: md`(b) $W$`, expr: 'Q^2/(8*pi*eps0*R)*(1 + 1/(5*epsr))', vars: { Q: [1, 3], eps0: [0.5, 2], epsr: [1.5, 5], R: [0.5, 2] } },
            ],
            sol: md`
              (a) $\frac{1}{2\varepsilon}\int_0^R\frac{Q^2r^2}{16\pi^2R^6}4\pi r^2dr = \frac{Q^2}{8\pi\varepsilon R^6}\cdot\frac{R^5}{5} = \frac{Q^2}{40\pi\varepsilon_0\varepsilon_rR}$.

              (b) Add $\frac{Q^2}{8\pi\varepsilon_0R}$: $\frac{Q^2}{8\pi\varepsilon_0R}\left(1 + \frac1{5\varepsilon_r}\right)$. Check $\varepsilon_r = 1$: $\frac{6}{5}\cdot\frac{Q^2}{8\pi\varepsilon_0R} = \frac{3Q^2}{20\pi\varepsilon_0R}$ ✓.
            `,
          }),
          P({
            id: 'e2-eint-p2', title: 'Spherical capacitor with ε ∝ 1/r',
            q: md`A spherical capacitor (radii $a<b$, charges $\pm Q$) is filled with $\varepsilon(r) = \varepsilon_0\,b/r$. Find (a) $V$ between the shells, (b) $C$, (c) the stored energy.`,
            hints: [md`$E = \frac{D}{\varepsilon} = \frac{Q}{4\pi\varepsilon_0br}$.`, md`$W = Q^2/2C$ once you have $C$.`],
            parts: [
              { lbl: md`(a) $V$`, expr: 'Q*ln(b/a)/(4*pi*eps0*b)', vars: { Q: [1, 3], eps0: [0.5, 2], a: [0.3, 0.6], b: [1, 2] } },
              { lbl: md`(b) $C$`, expr: '4*pi*eps0*b/ln(b/a)', vars: { eps0: [0.5, 2], a: [0.3, 0.6], b: [1, 2] } },
              { lbl: md`(c) $W$`, expr: 'Q^2*ln(b/a)/(8*pi*eps0*b)', vars: { Q: [1, 3], eps0: [0.5, 2], a: [0.3, 0.6], b: [1, 2] } },
            ],
            sol: md`(a) $\int_a^b\frac{Q\,dr}{4\pi\varepsilon_0br} = \frac{Q}{4\pi\varepsilon_0b}\ln\frac ba$. (b) $Q/V$. (c) $Q^2/2C$, no integral. (A $\ln$ in a **spherical** capacitor is the giveaway that $\varepsilon$ varies as $1/r$.)`,
          }),
        ],
      },

      // ================================================================== overlapping shapes
      {
        id: 'e2-overlap', title: 'Overlapping shapes: superposition (Exam I problem 2, Exam II style)',
        steps: [
          RF(md`
            Exam I had an infinite slab overlapping a sphere. The method is always the same: **each shape alone is a Gauss (or Ampère) problem you can do in your sleep; the overlap is just the sum.** Holes and cavities are a **negative** copy of the missing shape.

            ### The building blocks (field inside and outside, uniform charge density $\rho$)

            | Shape | Inside | Outside |
            |---|---|---|
            | Ball radius $R$, center $\vb c$ | $\dfrac{\rho}{3\varepsilon_0}(\vb r - \vb c)$ | $\dfrac{Q}{4\pi\varepsilon_0}\dfrac{\vb r - \vb c}{|\vb r - \vb c|^3}$ |
            | Cylinder radius $a$, axis through $\vb c$ | $\dfrac{\rho}{2\varepsilon_0}(\vb s - \vb c)$ | $\dfrac{\lambda}{2\pi\varepsilon_0}\dfrac{\vb s - \vb c}{|\vb s - \vb c|^2}$ |
            | Slab $|z|<a$ | $\dfrac{\rho z}{\varepsilon_0}\hat{\mathbf z}$ | $\pm\dfrac{\rho a}{\varepsilon_0}\hat{\mathbf z}$, **constant** |
            | Current: wire, uniform $\vb J$ | $\dfrac{\mu_0}{2}\vb J\times(\vb s - \vb c)$ | $\dfrac{\mu_0I}{2\pi s'}\hat{\boldsymbol\phi}'$ |
            | Current: slab $|z|<a$, $J\hat{\mathbf x}$ | $-\mu_0Jz\,\hat{\mathbf y}$ | $\mp\mu_0Ja\,\hat{\mathbf y}$, constant |

            Write each piece in **vector** form with its own center. Then the sum is algebra, not geometry.

            [[fig:ov]]

            !!intuition Why the overlap of two offset balls has a uniform field
                $\frac{\rho}{3\varepsilon_0}(\vb r - \vb c_+) - \frac{\rho}{3\varepsilon_0}(\vb r - \vb c_-) = -\frac{\rho}{3\varepsilon_0}(\vb c_+ - \vb c_-)$. The $\vb r$'s cancel. Shrink the offset $\vb d = \vb c_+ - \vb c_-$ while keeping $\rho\vb d = \vb P$ fixed and you get the uniformly polarized sphere, $\vb E = -\vb P/3\varepsilon_0$. That's how Griffiths derives it, and it's an exam favorite.

            ### The Exam II versions

            - **Polarized slab with a spherical cavity** ($\vb P\perp$ faces): slab alone gives $-\vb P/\varepsilon_0$ inside, $0$ outside. The cavity is a ball with $-\vb P$: it adds $+\vb P/3\varepsilon_0$ inside itself and a dipole $-\frac43\pi R^3\vb P$ outside itself. In the cavity: $-\frac{2\vb P}{3\varepsilon_0}$. Outside the slab: just that dipole's field.
            - **Wire with an off-center hole:** $\vb B = \frac{\mu_0}2\vb J\times\vb d$ in the hole, uniform.
            - **Two overlapping wires with opposite $\vb J$** (centers $\vb c_+$, $\vb c_-$): in the overlap $\vb B = \frac{\mu_0}{2}\vb J\times(\vb c_- - \vb c_+)$, uniform, with **no current there**.
            - **Slab of charge plus ball of charge** (the literal Exam I problem): outside both, $\vb E = \pm\frac{\rho_1a}{\varepsilon_0}\hat{\mathbf z} + \frac{Q_2}{4\pi\varepsilon_0}\frac{\uv r}{r^2}$. If they overlap, the overlap region simply has density $\rho_1 + \rho_2$; superposition handles it automatically, you don't need to treat it specially.

            !!trap Signs of the hole
                A hole in a $+\rho$ object is a $-\rho$ copy. A hole in a polarized object is a $-\vb P$ copy. A hole in a current-carrying wire is a $-\vb J$ copy. Write the vector from the **hole's** center for the negative piece; that's where most sign errors come from.
          `, { ov: { svg: FIG_OVERLAP, cap: 'Two balls of opposite charge density, offset: the field in the overlap is uniform.' } }),
          Q(md`An infinite slab $|z|<a$ has charge density $\rho$. A point at height $z = 5a$ sees a field of`,
            [md`$\rho a/\varepsilon_0$, the same as at $z = 2a$`, md`$\rho a/(5\varepsilon_0)$`, md`$\rho a/(25\varepsilon_0)$`, md`$0$`], 0,
            [null, md`Infinite planar things don't fall off with distance.`, md`Same mistake.`, md`The slab has net charge per area $2\rho a$; it's a thick sheet.`],
            md`Outside, the slab acts like a sheet with $\sigma = 2\rho a$: $\frac{\sigma}{2\varepsilon_0} = \frac{\rho a}{\varepsilon_0}$ at any distance.`),
          Q(md`A uniformly polarized slab ($\vb P\perp$ faces) contains a spherical cavity. The field in the cavity is`,
            [md`$-\tfrac{2}{3}\vb P/\varepsilon_0$`, md`$-\vb P/\varepsilon_0$`, md`$+\vb P/3\varepsilon_0$`, md`$0$`], 0,
            [null, md`That's the slab material away from the cavity.`, md`That's only the cavity's own contribution; add the slab's $-\vb P/\varepsilon_0$.`, md`A cavity in a conductor would be field-free; this is a dielectric.`],
            md`$-\frac{\vb P}{\varepsilon_0}$ (slab) $+\frac{\vb P}{3\varepsilon_0}$ (the $-\vb P$ ball) $= -\frac{2\vb P}{3\varepsilon_0}$.`),
          P({
            id: 'e2-ov-p1', title: 'Exam I problem 2, literally: slab plus ball',
            q: md`An infinite slab $|z|<a$ carries uniform charge density $\rho_1$. A ball of radius $R$ ($R<a$) centered at the origin carries an **additional** uniform density $\rho_2$ (so inside the ball the density is $\rho_1 + \rho_2$). Find $E_z$ (a) on the $z$ axis at $z = h>a$, (b) at the point $(0, 0, R/2)$.`,
            hints: [md`Superpose: slab ($\rho_1$) + ball ($\rho_2$).`, md`Slab inside: $\rho_1z/\varepsilon_0$. Ball inside: $\rho_2r/3\varepsilon_0$.`],
            parts: [
              { lbl: md`(a) $E_z(h)$`, expr: 'rho1*a/eps0 + rho2*R^3/(3*eps0*h^2)', vars: { rho1: [1, 3], rho2: [1, 3], a: [1.5, 2], R: [0.5, 1], eps0: [0.5, 2], h: [3, 5] } },
              { lbl: md`(b) $E_z(R/2)$`, expr: 'rho1*R/(2*eps0) + rho2*R/(6*eps0)', vars: { rho1: [1, 3], rho2: [1, 3], R: [0.5, 1], eps0: [0.5, 2] } },
            ],
            sol: md`(a) Slab: $\frac{\rho_1a}{\varepsilon_0}$. Ball: $\frac{Q_2}{4\pi\varepsilon_0h^2}$ with $Q_2 = \frac43\pi R^3\rho_2$, i.e. $\frac{\rho_2R^3}{3\varepsilon_0h^2}$. (b) $\frac{\rho_1(R/2)}{\varepsilon_0} + \frac{\rho_2(R/2)}{3\varepsilon_0}$. Two Gauss problems, no overlap bookkeeping.`,
          }),
          P({
            id: 'e2-ov-p2', title: 'Polarized slab with a spherical cavity',
            q: md`An infinite slab $|z|<a$ has frozen-in $\vb P = P\hat{\mathbf z}$. A spherical cavity of radius $R<a$ is centered at the origin. Find $E_z$ (a) in the cavity, (b) in the slab material far from the cavity, (c) on the axis at $z = h>a$.`,
            hints: [md`Slab alone: $-P/\varepsilon_0$ inside, $0$ outside. Cavity = ball with $-\vb P$.`, md`A ball with polarization $\vb P'$ is a dipole $\frac43\pi R^3\vb P'$ outside. On its axis: $\frac{2p}{4\pi\varepsilon_0h^3}$.`],
            parts: [
              { lbl: md`(a) $E_z$ in cavity`, expr: '-2*P/(3*eps0)', vars: { P: [1, 3], eps0: [0.5, 2] } },
              { lbl: md`(b) $E_z$ in slab`, expr: '-P/eps0', vars: { P: [1, 3], eps0: [0.5, 2] } },
              { lbl: md`(c) $E_z(h)$`, expr: '-2*P*R^3/(3*eps0*h^3)', vars: { P: [1, 3], R: [0.5, 1], eps0: [0.5, 2], h: [2, 4] } },
            ],
            sol: md`(a) $-\frac{P}{\varepsilon_0} + \frac{P}{3\varepsilon_0}$. (b) The cavity's dipole field dies off far away. (c) Only the cavity contributes outside: $p = -\frac43\pi R^3P$, $E_z = \frac{2p}{4\pi\varepsilon_0h^3} = -\frac{2PR^3}{3\varepsilon_0h^3}$.`,
          }),
          P({
            id: 'e2-ov-p3', title: 'Two overlapping wires with opposite currents',
            q: md`Two long cylinders of radius $a$ have axes along $z$ through $(\pm d/2, 0)$, with $d<2a$. The one centered at $+d/2$ carries $\vb J = J\hat{\mathbf z}$; the one at $-d/2$ carries $-J\hat{\mathbf z}$. In the overlap the currents cancel. Find $B_y$ in the overlap.`,
            hints: [md`$\vb B = \frac{\mu_0}2\vb J\times(\vb c_- - \vb c_+)$ for the $\pm\vb J$ pair.`],
            parts: [{ lbl: md`$B_y$`, expr: '-mu0*J*d/2', vars: { mu0: [0.5, 2], J: [1, 3], d: [0.2, 1] } }],
            sol: md`$\frac{\mu_0}{2}J\hat{\mathbf z}\times(\vb r - \vb c_+) - \frac{\mu_0}{2}J\hat{\mathbf z}\times(\vb r - \vb c_-) = \frac{\mu_0J}{2}\hat{\mathbf z}\times(\vb c_- - \vb c_+) = \frac{\mu_0J}{2}\hat{\mathbf z}\times(-d\,\hat{\mathbf x}) = -\frac{\mu_0Jd}{2}\hat{\mathbf y}$. Uniform, in a region with no current at all. (This is how you build a uniform transverse field: the "cos θ coil" in MRI and accelerator magnets.)`,
          }),
        ],
      },

      // ================================================================== images with dielectrics
      {
        id: 'e2-dielimg', title: 'Images with dielectrics: the partial image',
        steps: [
          R(md`
            Exam I had images with conductors. With a **dielectric** instead of a conductor, the method still works; the image is just a **fraction** of the charge.

            **Point charge $q$ at height $d$ above a dielectric half-space ($\varepsilon_r$, filling $z<0$).** Guess:

            - Above ($z>0$): $q$ at $(0,0,d)$ plus an image $q'$ at $(0,0,-d)$.
            - Below ($z<0$): a single charge $q''$ at $(0,0,d)$ (the real charge's location), seen through the dielectric.

            Match at $z = 0$ (where both distances are equal): $V$ continuous gives $q + q' = q''$; $\varepsilon\,\partial_zV$ continuous gives $q - q' = \varepsilon_rq''$. So

            $$q' = -\frac{\varepsilon_r - 1}{\varepsilon_r + 1}q = -\frac{\chi_e}{\chi_e + 2}q,\qquad q'' = \frac{2q}{\varepsilon_r + 1}.$$

            !!intuition The image is the bound charge
                $q'$ is exactly the total bound charge on the surface. It's negative (it's attracted to $q$), it's a fraction of $q$ that grows with $\varepsilon_r$, and as $\varepsilon_r\to\infty$ it becomes $-q$: the conductor. As $\varepsilon_r\to1$ it vanishes. **Both limits are checks you should write on the exam.**

            Results:

            - **Force on $q$:** $F = \dfrac{1}{4\pi\varepsilon_0}\dfrac{qq'}{(2d)^2} = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{\chi_e}{\chi_e + 2}\dfrac{q^2}{4d^2}$, toward the dielectric.
            - **Bound surface charge:** $\sigma_b = -\dfrac{1}{2\pi}\dfrac{\chi_e}{\chi_e+2}\dfrac{qd}{(s^2 + d^2)^{3/2}}$. Same shape as the conductor's induced charge, scaled by $\frac{\chi_e}{\chi_e+2}$.
            - **Energy to bring $q$ in from infinity:** half the "interaction with the image", as for conductors: $W = -\dfrac{1}{4\pi\varepsilon_0}\dfrac{\chi_e}{\chi_e+2}\dfrac{q^2}{4d}$.

            !!trap Which region does each guess cover?
                The image $q'$ sits **below** the surface and is only used for $V$ **above**. Below, you use $q''$ sitting **above** the surface. Each image must be outside the region it describes (that's what uniqueness needs).

            ### The "held at $V_0$" trick (Exam I) still works

            A conducting plane at $V_0$ instead of grounded: $V = V_0 + (\text{grounded answer})$. A constant solves Laplace and shifts the boundary value. Same idea with a uniform field: a sphere in $\vb E_0$ **plus** a charge $Q$ on it is (sphere in $\vb E_0$) + (point charge). **Superpose the known solutions; never re-solve from scratch.**

            ### General sphere and cylinder formulas (cover cavities too)

            Object of permittivity $\varepsilon_{\text{in}}$ in a medium $\varepsilon_{\text{out}}$ with far field $\vb E_0$:

            $$\text{sphere: }\vb E_{\text{in}} = \frac{3\varepsilon_{\text{out}}}{\varepsilon_{\text{in}} + 2\varepsilon_{\text{out}}}\vb E_0,\qquad\text{cylinder (⊥ axis): }\vb E_{\text{in}} = \frac{2\varepsilon_{\text{out}}}{\varepsilon_{\text{in}} + \varepsilon_{\text{out}}}\vb E_0.$$

            Dielectric sphere in vacuum: $\frac{3}{\varepsilon_r + 2}$. **Spherical cavity in a dielectric:** $\frac{3\varepsilon_r}{1 + 2\varepsilon_r}$, **larger** than $E_0$. Conductor: $\varepsilon_{\text{in}}\to\infty$ gives 0 ✓.
          `),
          Q(md`A charge $q$ sits above a dielectric with $\varepsilon_r = 3$. The image charge is`,
            [md`$-q/2$`, md`$-q$`, md`$-q/3$`, md`$-2q/3$`], 0,
            [null, md`That's a conductor ($\varepsilon_r\to\infty$).`, md`It's not $q/\varepsilon_r$: it's $\frac{\varepsilon_r - 1}{\varepsilon_r + 1}q$.`, md`$\frac{3-1}{3+1} = \frac12$.`],
            md`$q' = -\frac{\varepsilon_r - 1}{\varepsilon_r + 1}q = -\frac24q$.`),
          Q(md`A spherical air bubble sits inside a large block of dielectric ($\varepsilon_r$) with a uniform field $\vb E_0$ far away. The field in the bubble is`,
            [md`stronger than $E_0$: $\frac{3\varepsilon_r}{1 + 2\varepsilon_r}E_0$`, md`weaker: $\frac{3}{\varepsilon_r + 2}E_0$`, md`exactly $E_0$`, md`zero`], 0,
            [null, md`That's a dielectric ball in vacuum, the reverse situation.`, md`The bubble's surface carries bound charge.`, md`Only a conducting shell shields its inside.`],
            md`Swap roles: $\varepsilon_{\text{in}} = \varepsilon_0$, $\varepsilon_{\text{out}} = \varepsilon_r\varepsilon_0$. The surrounding material's bound charge on the bubble wall adds to the field inside.`),
          P({
            id: 'e2-dimg-p1', title: 'Point charge above a dielectric',
            q: md`A charge $q$ sits at height $d$ above a dielectric half-space with susceptibility $\chi_e$. Find (a) the image charge, (b) the force on $q$ ($F_z$, negative = toward the dielectric), (c) $\sigma_b$ directly below $q$, (d) $V$ at a point inside the dielectric at depth $d$ directly below $q$.`,
            hints: [md`$q' = -\frac{\chi_e}{\chi_e + 2}q$, $q'' = \frac{2q}{\varepsilon_r + 1} = \frac{2q}{\chi_e + 2}$.`, md`Below, $V = \frac{1}{4\pi\varepsilon_0}\frac{q''}{R}$ with $R$ measured from the real charge's location. At depth $d$, $R = 2d$.`],
            parts: [
              { lbl: md`(a) $q'$`, expr: '-chi*q/(chi+2)', vars: { chi: [0.5, 4], q: [1, 3] } },
              { lbl: md`(b) $F_z$`, expr: '-chi*q^2/((chi+2)*16*pi*eps0*d^2)', vars: { chi: [0.5, 4], q: [1, 3], eps0: [0.5, 2], d: [0.5, 2] } },
              { lbl: md`(c) $\sigma_b(s = 0)$`, expr: '-chi*q/((chi+2)*2*pi*d^2)', vars: { chi: [0.5, 4], q: [1, 3], d: [0.5, 2] } },
              { lbl: md`(d) $V$`, expr: 'q/(4*pi*eps0*(chi+2)*d)', vars: { chi: [0.5, 4], q: [1, 3], eps0: [0.5, 2], d: [0.5, 2] } },
            ],
            sol: md`
              (a) $-\frac{\chi_e}{\chi_e + 2}q$. (b) $\frac{qq'}{4\pi\varepsilon_0(2d)^2}$. (c) $s = 0$ in $\sigma_b = -\frac{1}{2\pi}\frac{\chi_e}{\chi_e + 2}\frac{qd}{(s^2+d^2)^{3/2}}$ gives $-\frac{\chi_eq}{2\pi(\chi_e + 2)d^2}$.

              (d) $\frac{1}{4\pi\varepsilon_0}\cdot\frac{2q}{\chi_e + 2}\cdot\frac{1}{2d} = \frac{q}{4\pi\varepsilon_0(\chi_e + 2)d}$.

              **Checks:** $\chi_e\to0$: no image, $V = \frac{q}{4\pi\varepsilon_0\cdot2d}$ (bare charge at distance $2d$) ✓. $\chi_e\to\infty$: image $-q$, $V\to0$ inside (conductor) ✓.
            `,
          }),
          P({
            id: 'e2-dimg-p2', title: 'Conductor with charge, in a dielectric, in a field (superpose!)',
            q: md`A conducting sphere (radius $a$, charge $Q$) sits in an infinite dielectric $\varepsilon_r$ with a uniform far field $\vb E_0 = E_0\hat{\mathbf z}$. Find the free surface charge $\sigma_f(\theta)$ on the conductor.`,
            hints: [md`Superpose: (uncharged conductor in $\vb E_0$) + (charge $Q$). Outside $V = -E_0\left(r - \frac{a^3}{r^2}\right)\cos\theta + \frac{Q}{4\pi\varepsilon r}$.`, md`$\sigma_f = D_r(a) = -\varepsilon\,\partial_rV|_a$.`],
            parts: [{ lbl: md`$\sigma_f$`, expr: '3*eps0*epsr*E0*cos(theta) + Q/(4*pi*a^2)', vars: { eps0: [0.5, 2], epsr: [1.5, 5], E0: [1, 3], theta: [0.1, 3], Q: [1, 3], a: [0.5, 2] } }],
            sol: md`$-\partial_rV|_a = 3E_0\cos\theta + \frac{Q}{4\pi\varepsilon a^2}$. Times $\varepsilon = \varepsilon_0\varepsilon_r$: $\sigma_f = 3\varepsilon_0\varepsilon_rE_0\cos\theta + \frac{Q}{4\pi a^2}$. The uniform part is just $Q$ spread out; the $\cos\theta$ part is $\varepsilon_r$ times the vacuum answer, because in a dielectric the conductor has to supply more free charge to make the same $E_0$ far away.`,
          }),
        ],
      },
    ],
  });
})();

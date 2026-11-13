/* Hour Exam II, part 3: magnetic fields in matter (Lectures 25–27, Griffiths 6.1–6.4, HW 9).
   Lecture 27 (H) is not in the notes provided; this follows Griffiths 6.3–6.4. */
(function () {
  'use strict';
  const { R, P, Q } = C;

  C.unit({
    id: 'h-e2-matter', num: '', title: 'Exam II: magnetic matter (holding)',
    lessons: [
      // ------------------------------------------------------------------ dipoles in B, para/dia
      {
        id: 'e2-mdip', title: 'Magnetic dipoles in a field; para- and diamagnetism',
        steps: [
          R(md`
            Everything from the electric dipole carries over with $\vb p\to\vb m$, $\vb E\to\vb B$:

            $$\vb N = \vb m\times\vb B,\qquad U = -\vb m\cdot\vb B,\qquad\vb F = \nabla(\vb m\cdot\vb B).$$

            Torque lines $\vb m$ up **with** $\vb B$. That's why compass needles point north, and why atoms with a net moment (an unpaired electron spin) line up with an applied field.

            | | Paramagnet | Diamagnet | Ferromagnet |
            |---|---|---|---|
            | $\vb M$ vs $\vb B$ | along | opposite | keeps $\vb M$ with no field |
            | $\chi_m$ | small, $>0$ | small, $<0$ | not linear |
            | Mechanism | spin torque aligns $\vb m$ | orbit speeds up / slows down | domains |
            | Pulled toward strong field? | yes | **pushed away** | yes (strongly) |

            !!intuition Why diamagnetism opposes $\vb B$ (Lecture 25)
                An orbiting electron is a tiny current loop. Turn on $\vb B$: the extra force $-e\vb v\times\vb B$ changes the centripetal force, so the orbit speed shifts. Work it through and $\Delta\vb m = -\dfrac{e^2R^2}{4m_e}\vb B$, **opposite** $\vb B$, for either orbit direction. Every material has it; it's tiny, and it's only visible when there are no unpaired spins (even electron count).

            **HW 6.3 (two coaxial dipoles, distance $r$, both along the axis):** the field of $m_1$ on its axis is $\dfrac{\mu_0m_1}{2\pi z^3}$, so $F = m_2\dfrac{dB}{dz} = -\dfrac{3\mu_0m_1m_2}{2\pi r^4}$: attraction, magnitude $\dfrac{3\mu_0m_1m_2}{2\pi r^4}$. Same algebra as the electric pair.
          `),
          Q(md`A small paramagnetic sample sits near the end of a bar magnet. It is`,
            [md`attracted toward the magnet (stronger field)`, md`repelled from the magnet`, md`not affected; paramagnets only feel torque`, md`attracted only if it is a conductor`], 0,
            [null, md`That's a diamagnet ($\chi_m<0$).`, md`The field is nonuniform near the magnet's end; aligned moments feel $\nabla(\vb m\cdot\vb B)$ toward strong $B$.`, md`Conductivity has nothing to do with it in statics.`],
            md`$\vb M\parallel\vb B$, so $U = -\vb m\cdot\vb B<0$ is lowest where $B$ is largest: pulled in.`),
          Q(md`Which atoms are typically diamagnetic?`,
            [md`Atoms with an even number of electrons (all spins paired)`, md`Atoms with an odd number of electrons`, md`Iron, nickel, cobalt`, md`Only superconductors`], 0,
            [null, md`An unpaired spin gives a permanent moment; its paramagnetism swamps the diamagnetism.`, md`Those are ferromagnets.`, md`Superconductors are perfect diamagnets, but ordinary matter (water, copper, carbon) is weakly diamagnetic too.`],
            md`Diamagnetism is always present but tiny. You only see it when paired spins cancel, i.e. no paramagnetism to hide it.`),
        ],
      },

      // ------------------------------------------------------------------ bound currents
      {
        id: 'e2-boundJ', title: 'Magnetization and bound currents',
        steps: [
          R(md`
            $\vb M$ = magnetic dipole moment per volume (units A/m, same as $K$). A magnetized object is exactly equivalent to

            $$\boxed{\vb J_b = \nabla\times\vb M}\qquad\boxed{\vb K_b = \vb M\times\uv n}$$

            and then you do ordinary Biot–Savart / Ampère with those currents.

            !!intuition Why uniform $\vb M$ only shows up at the edges
                Tile a slab with little current loops, all circulating the same way. Where two loops touch, their currents run opposite and cancel. Only the outer rim is left uncanceled: a current running around the **side** of the object. Uniform $\vb M$ → $\vb J_b = 0$, $\vb K_b$ on faces **parallel** to $\vb M$.

            !!key The electric/magnetic swap (Kuo loves to test this contrast)
                | | Electric ($\vb P$) | Magnetic ($\vb M$) |
                |---|---|---|
                | Bound source | $\sigma_b = \vb P\cdot\uv n$, $\rho_b = -\nabla\cdot\vb P$ | $\vb K_b = \vb M\times\uv n$, $\vb J_b = \nabla\times\vb M$ |
                | Uniform: which faces? | faces **pierced** by $\vb P$ (caps) | faces **parallel** to $\vb M$ (sides) |
                | Sphere, field inside | $-\vb P/3\varepsilon_0$ (against $\vb P$) | $+\tfrac23\mu_0\vb M$ (along $\vb M$) |
                | Long rod along axis | $\approx 0$ | $\mu_0\vb M$ (a solenoid!) |
                | Thin disk/slab ⊥ | $-\vb P/\varepsilon_0$ | $\approx 0$ |

                Same depolarizing factor $N$ in both: $\vb E_{\text{in}} = -N\vb P/\varepsilon_0$, $\vb B_{\text{in}} = \mu_0(1 - N)\vb M$, $\vb H_{\text{in}} = -N\vb M$.

            ### Uniformly magnetized sphere (Lecture 26)

            $\vb K_b = M\hat{\mathbf z}\times\uv r = M\sin\theta\,\hat{\boldsymbol\phi}$. That's the spinning shell with $\sigma\omega R\to M$. So, for free:

            $$\vb B_{\text{in}} = \tfrac23\mu_0\vb M\ (\text{uniform}),\qquad\text{outside: dipole with }\vb m = \tfrac43\pi R^3\vb M.$$

            !!method Speed trick: recognize the current, reuse the answer
                $\vb K_b\propto\sin\theta\,\hat{\boldsymbol\phi}$ on a sphere → spinning shell. Uniform $\vb M$ along a long rod → $\vb K_b = M\hat{\boldsymbol\phi}$ on the side → **solenoid** with $nI = M$, so $B = \mu_0M$ inside, $0$ outside. $\vb M$ along $\hat{\boldsymbol\phi}$ in a cylinder → like a **toroid**, field stays inside. Most magnetization problems are a source you've already solved in disguise.

            **HW 6.8** ($\vb M = ks^2\hat{\boldsymbol\phi}$ in a long cylinder radius $R$): $\vb J_b = \frac1s\frac{d}{ds}(s\cdot ks^2)\hat{\mathbf z} = 3ks\,\hat{\mathbf z}$; $\vb K_b = kR^2\hat{\boldsymbol\phi}\times\hat{\mathbf s} = -kR^2\hat{\mathbf z}$. Net current: $\int_0^R3ks\cdot2\pi s\,ds - kR^2\cdot2\pi R = 0$. So $B = 0$ outside, and inside Ampère gives $B\cdot2\pi s = \mu_0\cdot2\pi ks^3$, i.e. $\vb B = \mu_0ks^2\hat{\boldsymbol\phi} = \mu_0\vb M$.

            **HW 6.12** ($\vb M = ks\,\hat{\mathbf z}$, long cylinder): $\vb J_b = \nabla\times\vb M = -\dfrac{\partial M_z}{\partial s}\hat{\boldsymbol\phi} = -k\hat{\boldsymbol\phi}$, $\vb K_b = kR\,\hat{\mathbf z}\times\hat{\mathbf s} = kR\,\hat{\boldsymbol\phi}$. Nested solenoids. Result: $\vb B = \mu_0ks\,\hat{\mathbf z} = \mu_0\vb M$ inside, $0$ outside. Method (b) in the next lesson does it in one line.
          `),
          Q(md`A long cylinder is uniformly magnetized **along its axis**. Where are the bound currents?`,
            [md`$\vb K_b = M\hat{\boldsymbol\phi}$ around the curved side; nothing on the end caps`, md`On the end caps only`, md`Throughout the volume`, md`Nowhere: uniform $\vb M$ has no bound current`], 0,
            [null, md`That's the electric case ($\sigma_b$ on the caps). On the caps $\uv n\parallel\vb M$, so $\vb M\times\uv n = 0$.`, md`$\nabla\times$(uniform) $= 0$.`, md`Uniform $\vb M$ has no volume current but does have surface current on faces parallel to $\vb M$.`],
            md`$\vb K_b = \vb M\times\uv n$: on the side $M\hat{\mathbf z}\times\hat{\mathbf s} = M\hat{\boldsymbol\phi}$. A solenoid with $nI = M$.`),
          Q(md`Inside a uniformly magnetized sphere, $\vb B$ is`,
            [md`$\tfrac23\mu_0\vb M$, along $\vb M$`, md`$-\tfrac13\mu_0\vb M$, against $\vb M$`, md`$\mu_0\vb M$`, md`$0$`], 0,
            [null, md`That's $\mu_0\vb H_{\text{in}} = -\tfrac13\mu_0\vb M$, or copying the electric sign. $\vb B$ itself is $\mu_0(\vb H + \vb M) = \tfrac23\mu_0\vb M$.`, md`That's the long rod ($N = 0$).`, md`That's the flat slab ⊥ $\vb M$ ($N = 1$).`],
            md`$\vb K_b = M\sin\theta\,\hat{\boldsymbol\phi}$ is the spinning-shell current with $\sigma\omega R = M$: $\vb B = \tfrac23\mu_0\vb M$.`),
          Q(md`A large flat slab is uniformly magnetized **perpendicular** to its faces. Far from the edges, $\vb B$ inside is`,
            [md`$\approx0$`, md`$\mu_0\vb M$`, md`$\tfrac23\mu_0\vb M$`, md`$-\mu_0\vb M$`], 0,
            [null, md`That's magnetization **parallel** to the faces (or a long rod).`, md`That's the sphere.`, md`That would be $\mu_0\vb H$ inside, not $\vb B$.`],
            md`$\vb K_b = \vb M\times\uv n = 0$ on both faces (they're ⊥ $\vb M$), and the only current is around the far-away rim. So $\vb B\approx0$ while $\vb H = -\vb M$. Opposite of the electric slab, where $\vb E = -\vb P/\varepsilon_0$.`),
          P({
            id: 'e2-boundJ-p1', title: 'HW 6.8: M = k s² φ̂',
            q: md`A long cylinder of radius $R$ has $\vb M = ks^2\hat{\boldsymbol\phi}$. Find (a) $J_{b,z}$, (b) $K_{b,z}$ on the surface, (c) $B_\phi$ inside, (d) $B$ outside.`,
            hints: [md`$(\nabla\times\vb M)_z = \frac1s\partial_s(sM_\phi)$.`, md`$\hat{\boldsymbol\phi}\times\hat{\mathbf s} = -\hat{\mathbf z}$.`],
            parts: [
              { lbl: md`(a) $J_{b,z}$`, expr: '3*k*s', vars: { k: [1, 3], s: [0.1, 0.5] } },
              { lbl: md`(b) $K_{b,z}$`, expr: '-k*R^2', vars: { k: [1, 3], R: [0.5, 2] } },
              { lbl: md`(c) $B_\phi$ inside`, expr: 'mu0*k*s^2', vars: { mu0: [0.5, 2], k: [1, 3], s: [0.1, 0.5] } },
              { lbl: md`(d) $B$ outside`, mc: [md`$0$`, md`$\mu_0kR^3/s$`, md`$\mu_0kR^2$`, md`$\mu_0kR^3/2s$`], a: 0,
                why: [null, md`$\mu_0I_{	ext{net}}/2\pi s$ with $I_{	ext{net}} = 2\pi kR^3 - 2\pi kR^3 = 0$.`, md`That's the inside value at $s = R$; the surface current cancels it outside.`, md`The volume current alone; the surface current cancels it.`] },
            ],
            sol: md`(a) $\frac1s\frac{d}{ds}(ks^3) = 3ks$. (b) $kR^2\,\hat{\boldsymbol\phi}\times\hat{\mathbf s} = -kR^2\hat{\mathbf z}$. (c) $I_{\text{enc}}(s) = 2\pi ks^3$, so $B_\phi = \mu_0ks^2$, i.e. $\mu_0\vb M$. (d) Net bound current is zero: $B = 0$.`,
          }),
        ],
      },

      // ------------------------------------------------------------------ H
      {
        id: 'e2-H', title: 'The auxiliary field H and linear magnetic media',
        steps: [
          R(md`
            *(Lecture 27 is not in your notes; this follows Griffiths 6.3–6.4, which the lecture covers.)*

            Split current into free (in wires, that you control) and bound (from $\vb M$). Define

            $$\vb H = \frac{\vb B}{\mu_0} - \vb M\qquad\Rightarrow\qquad\nabla\times\vb H = \vb J_f,\qquad\oint\vb H\cdot d\vb l = I_{f,\text{enc}}.$$

            This is $\vb D$'s twin: Ampère with free current only.

            !!trap Same trap as $\vb D$
                $\nabla\cdot\vb H = -\nabla\cdot\vb M\neq0$ in general. So $\vb H$ is **not** determined by free current alone. Example: a bar magnet has no free current but $\vb H\neq0$ (it's $-\vb M$-ish inside, and $\vb B/\mu_0$ outside). Ampère for $\vb H$ only works with **symmetry** (line, plane, solenoid, toroid).

            !!method Speed trick: no free current plus symmetry means H = 0
                HW 6.12 method (b): $\vb M = ks\,\hat{\mathbf z}$, no free current, infinite cylinder. A rectangular Ampère loop with one side outside gives $\vb H = 0$ everywhere, so $\vb B = \mu_0\vb M = \mu_0ks\,\hat{\mathbf z}$ inside and $0$ outside. One line, versus bound currents and nested solenoids. HW 6.8 too: $\vb H = 0$ by circular symmetry, $\vb B = \mu_0\vb M$.

            ### Linear media

            $\vb M = \chi_m\vb H$, so $\vb B = \mu\vb H$ with $\mu = \mu_0(1 + \chi_m)$. Recipe, identical to dielectrics:

            1. Ampère on free current → $\vb H$.
            2. $\vb B = \mu\vb H$.
            3. $\vb M = \chi_m\vb H$.
            4. $\vb J_b = \nabla\times\vb M$, $\vb K_b = \vb M\times\uv n$ (check: they add to the right $\vb B$).

            In a homogeneous linear medium $\vb J_b = \chi_m\vb J_f$: no free current inside, no bound volume current.

            **HW 6.16 (coax filled with $\chi_m$).** $\vb H = \dfrac{I}{2\pi s}\hat{\boldsymbol\phi}$, $\vb B = \dfrac{\mu_0(1+\chi_m)I}{2\pi s}\hat{\boldsymbol\phi}$, $\vb M = \dfrac{\chi_mI}{2\pi s}\hat{\boldsymbol\phi}$. $\vb J_b = \frac1s\frac{d}{ds}(sM)\hat{\mathbf z} = 0$. $\vb K_b$ on the inner surface ($\uv n = -\hat{\mathbf s}$): $\dfrac{\chi_mI}{2\pi a}\hat{\mathbf z}$, total $\chi_mI$ **along** $I$. Check: Ampère with $I + \chi_mI$ enclosed gives the same $\vb B$ ✓. Paramagnet: bound current reinforces the free current.

            ### Boundary conditions with $\vb H$

            $$B^\perp\text{ continuous},\qquad\vb H^\parallel_{\text{above}} - \vb H^\parallel_{\text{below}} = \vb K_f\times\uv n.$$

            With no free surface current: $H^\parallel$ continuous and $\mu_1H_1^\perp = \mu_2H_2^\perp$. Same refraction rule as dielectrics with $\varepsilon\to\mu$.

            !!method Speed trick: the analogy table for linear media
                Every dielectric answer becomes a magnetic answer by $\vb E\to\vb H$, $\vb D\to\vb B$, $\varepsilon\to\mu$, $\rho_f\to\vb J_f$ (as far as the symmetric-Ampère/Gauss setups go). The sphere in a uniform field: a linear magnetic sphere in uniform $\vb B_0$ has uniform $\vb H_{\text{in}} = \dfrac{3}{\mu_r + 2}\vb H_0$, just like $\vb E_{\text{in}} = \dfrac{3}{\varepsilon_r + 2}\vb E_0$.
          `),
          Q(md`A long straight wire of radius $a$, made of linear material $\chi_m$, carries uniform free current $I$. Inside, at radius $s$, $B$ is`,
            [md`$\dfrac{\mu_0(1+\chi_m)Is}{2\pi a^2}$`, md`$\dfrac{\mu_0Is}{2\pi a^2}$`, md`$\dfrac{\mu_0(1+\chi_m)I}{2\pi s}$`, md`$\dfrac{\mu_0\chi_mIs}{2\pi a^2}$`], 0,
            [null, md`That's $\mu_0H$; inside the material $B = \mu H$.`, md`That's outside (in a medium $\chi_m$); inside only part of $I$ is enclosed.`, md`That's $\mu_0M$, missing the $\mu_0H$ part.`],
            md`$H = \dfrac{Is}{2\pi a^2}$ from free current, then $B = \mu_0(1+\chi_m)H$.`),
          Q(md`A bar magnet (permanent $\vb M$, no free current). Which is true?`,
            [md`$\oint\vb H\cdot d\vb l = 0$ for every loop, yet $\vb H\neq0$`, md`$\vb H = 0$ everywhere since $I_f = 0$`, md`$\vb B = 0$ outside the magnet`, md`$\nabla\cdot\vb H = 0$`], 0,
            [null, md`$\nabla\times\vb H = 0$ but $\nabla\cdot\vb H = -\nabla\cdot\vb M\neq0$ at the poles. No symmetry, so no conclusion that $\vb H = 0$.`, md`A bar magnet clearly has a field outside.`, md`At the ends $\nabla\cdot\vb M\ne0$.`],
            md`Curl-free isn't zero. The "magnetic charges" $-\nabla\cdot\vb M$ at the poles source $\vb H$.`),
          Q(md`Coax filled with a **diamagnetic** material ($\chi_m<0$). The bound surface current on the inner conductor's surface is`,
            [md`opposite to $I$, reducing $B$`, md`along $I$, increasing $B$`, md`zero`, md`along $\hat{\boldsymbol\phi}$`], 0,
            [null, md`That's paramagnetic ($\chi_m>0$).`, md`$\chi_mI\ne0$.`, md`$\vb K_b = \vb M\times\uv n$ with $\vb M\parallel\hat{\boldsymbol\phi}$ and $\uv n = \pm\hat{\mathbf s}$ points along $\pm\hat{\mathbf z}$.`],
            md`Total $\chi_mI$ along $\hat{\mathbf z}$: negative for diamagnets, so it opposes $I$ and $B = \mu_0(1+\chi_m)I/2\pi s$ is smaller.`),
          P({
            id: 'e2-H-p1', title: 'HW 6.12: M = k s ẑ, the fast way',
            q: md`An infinite cylinder of radius $R$ has $\vb M = ks\,\hat{\mathbf z}$ and no free current. Find (a) $H$ inside, (b) $B_z$ inside, (c) $J_{b,\phi}$, (d) $K_{b,\phi}$.`,
            hints: [md`Rectangular Ampère loop, one long side outside. $I_f = 0$.`, md`$(\nabla\times\vb M)_\phi = \partial_zM_s - \partial_sM_z$.`],
            parts: [
              { lbl: md`(a) $\vb H$ inside`, mc: [md`$0$`, md`$ks\,\hat{\mathbf z}$`, md`$-ks\,\hat{\mathbf z}$`, md`$kR\,\hat{\mathbf z}$`], a: 0,
                why: [null, md`That's $\vb M$. $\vb H = \vb B/\mu_0 - \vb M$ and there's no free current.`, md`That would be $\vb H$ for a thin disk ($N = 1$), not a long cylinder.`, md`No free current is enclosed by any loop.`] },
              { lbl: md`(b) $B_z$`, expr: 'mu0*k*s', vars: { mu0: [0.5, 2], k: [1, 3], s: [0.1, 0.5] } },
              { lbl: md`(c) $J_{b,\phi}$`, expr: '-k', vars: { k: [1, 3] } },
              { lbl: md`(d) $K_{b,\phi}$`, expr: 'k*R', vars: { k: [1, 3], R: [0.5, 2] } },
            ],
            sol: md`
              (a) $\oint\vb H\cdot d\vb l = 0$ and $\vb H\to0$ far outside, with symmetry ($H$ along $\hat{\mathbf z}$, depends only on $s$): $\vb H = 0$. (b) $\vb B = \mu_0\vb M = \mu_0ks\,\hat{\mathbf z}$.

              (c) $-\partial_s(ks) = -k$. (d) $\vb M\times\hat{\mathbf s} = kR\,\hat{\mathbf z}\times\hat{\mathbf s} = kR\,\hat{\boldsymbol\phi}$.

              **Check with (a):** Ampère loop from $s$ to outside encloses $\int_s^R(-k)\,ds' + kR = ks$ per length, so $B = \mu_0ks$ ✓.
            `,
          }),
          P({
            id: 'e2-H-p2', title: 'HW 6.16: coax with χm',
            q: md`Coax, inner tube radius $a$ carrying $I$ on its surface, outer tube radius $b$ carrying $-I$, filled with $\chi_m$. Find (a) $B$ between, (b) the total bound current on the inner surface (along $I$ positive).`,
            hints: [md`$H = I/2\pi s$.`, md`$K_b = M(a)$, times circumference $2\pi a$.`],
            parts: [
              { lbl: md`(a) $B$`, expr: 'mu0*(1+chi)*I/(2*pi*s)', vars: { mu0: [0.5, 2], chi: [0.1, 2], I: [1, 3], s: [1, 2] } },
              { lbl: md`(b) $I_b$`, expr: 'chi*I', vars: { chi: [0.1, 2], I: [1, 3] } },
            ],
            sol: md`(a) $\mu H = \dfrac{\mu_0(1+\chi_m)I}{2\pi s}$. (b) $K_b = \dfrac{\chi_mI}{2\pi a}$, times $2\pi a$: $\chi_mI$. The outer surface carries $-\chi_mI$, so outside everything cancels ✓.`,
          }),
        ],
      },
    ],
  });
})();

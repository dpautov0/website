/* Spring 2026 Hour Exam II (the real exam, formalized by a student; PDF in sp26-exam2.pdf), with answers and full solutions. */
(function () {
  'use strict';
  const { R } = C;

  C.unit({
    id: 'h-e2-s26', num: '', title: 'Spring 2026 Exam II (holding)',
    lessons: [
      {
        id: 'e2-s26', title: 'Spring 2026 Exam II (the real problems)', kind: 'exam',
        steps: [
          R(md`
            Last spring's Hour Exam II, all four problems, typed from the exam. Original: [sp26-exam2.pdf](sp26-exam2.pdf). Do it on paper in 50 minutes with your formula sheet and cheat sheet, then open the answers and solutions.
          `),
          {
            t: 'paper',
            html: '<div class="pp-title"><span>PHYS 435 · Spring 2026 · Hour Exam II</span><span>4 problems</span></div><div class="pp-meta"><span>50 minutes</span><span>Formula sheet allowed</span></div>',
            items: [
              {
                q: md`
                  **Problem 1.** A point charge $-Q$ (with $Q>0$) is embedded at the center of a solid sphere of radius $R$. The sphere is made of a linear, isotropic, homogeneous dielectric with electric susceptibility $\chi_e$. There is no other free charge anywhere.

                  (a) Find the electric displacement $\vb D$ inside the dielectric ($0<r\le R$). Then find the electric field $\vb E$ in the same region.

                  (b) Find the polarization $\vb P$ inside the dielectric.

                  (c) Find the bound surface charge density $\sigma_b$ on the outer surface of the sphere ($r = R$) and the bound volume charge density $\rho_b$ everywhere inside the sphere. Be careful at the origin.
                `,
                ans: md`
                  - (a) $\vb D = -\dfrac{Q}{4\pi r^2}\uv r$; $\vb E = -\dfrac{Q}{4\pi\varepsilon_0(1+\chi_e)r^2}\uv r$.
                  - (b) $\vb P = -\dfrac{\chi_eQ}{4\pi(1+\chi_e)r^2}\uv r$.
                  - (c) $\sigma_b(R) = -\dfrac{\chi_eQ}{4\pi(1+\chi_e)R^2}$; $\rho_b = 0$ for $0<r<R$, plus a point bound charge at the origin: $\rho_b = +\dfrac{\chi_eQ}{1+\chi_e}\,\delta^3(\vb r)$.
                `,
                sol: md`
                  **(a)** Spherical symmetry and only free charge $-Q$ at the center: a Gaussian sphere of radius $r$ gives $D\cdot4\pi r^2 = -Q$, so $\vb D = -\frac{Q}{4\pi r^2}\uv r$ (it points inward, toward the negative charge). Linear dielectric: $\vb E = \vb D/\varepsilon$ with $\varepsilon = \varepsilon_0(1+\chi_e)$.

                  **(b)** $\vb P = \varepsilon_0\chi_e\vb E = \frac{\chi_e}{1+\chi_e}\vb D = -\frac{\chi_eQ}{4\pi(1+\chi_e)r^2}\uv r$.

                  **(c)** $\sigma_b = \vb P\cdot\uv n$ with $\uv n = \uv r$ on the outer surface: $-\frac{\chi_eQ}{4\pi(1+\chi_e)R^2}$ (negative: the $-$ ends of the molecules point outward).

                  $\rho_b = -\nabla\cdot\vb P = \frac{\chi_eQ}{4\pi(1+\chi_e)}\nabla\cdot\frac{\uv r}{r^2}$. Away from the origin $\nabla\cdot(\uv r/r^2) = 0$, but $\nabla\cdot(\uv r/r^2) = 4\pi\delta^3(\vb r)$, so there is a point bound charge $+\frac{\chi_eQ}{1+\chi_e}$ at the center: the $+$ ends of the molecules crowd around $-Q$ and partially screen it.

                  **Check:** total bound charge $= +\frac{\chi_eQ}{1+\chi_e} - \frac{\chi_eQ}{4\pi(1+\chi_e)R^2}\cdot4\pi R^2 = 0$ ✓. Net charge at the center $-Q + \frac{\chi_eQ}{1+\chi_e} = -\frac{Q}{1+\chi_e}$, which is exactly what makes $\vb E$ smaller by $1+\chi_e$ ✓.
                `,
              },
              {
                q: md`
                  **Problem 2.** (a) A large parallel-plate capacitor consists of two infinite, thin plates parallel to the $xz$-plane. The lower plate lies in the plane $y = 0$ and carries uniform surface charge density $-\sigma$. The upper plate lies in the plane $y = d$ and carries $+\sigma$ ($\sigma>0$). Both plates move together with constant velocity $\vb v = v\,\hat{\mathbf x}$ ($\hat{\mathbf z}$ points out of the page). Find the magnetic field $\vb B$ (magnitude and direction) between the plates, $0<y<d$.

                  (b) A long, straight cylindrical wire of radius $a$ has a cylindrical hole of radius $c$ drilled through its entire length. The axis of the hole is parallel to the axis of the wire and displaced from it by a distance $b$ along $\hat{\mathbf x}$, with $b + c<a$. The wire carries a total steady current $I$ in the $+\hat{\mathbf z}$ direction (out of the page), distributed uniformly over the remaining cross-section. Find $\vb B$ (magnitude and direction) at a point inside the hole.
                `,
                ans: md`
                  - (a) $\vb B = -\mu_0\sigma v\,\hat{\mathbf z}$ (into the page), magnitude $\mu_0\sigma v$; zero above and below the plates.
                  - (b) $\vb B = \dfrac{\mu_0Ib}{2\pi(a^2 - c^2)}\,\hat{\mathbf y}$, uniform throughout the hole.
                `,
                sol: md`
                  **(a)** Each moving plate is a surface current $\vb K = \sigma_{\text{plate}}\vb v$: upper $\vb K_u = \sigma v\,\hat{\mathbf x}$, lower $\vb K_\ell = -\sigma v\,\hat{\mathbf x}$. An infinite sheet gives $\vb B = \frac{\mu_0}{2}\vb K\times\uv n$, with $\uv n$ pointing from the sheet toward the field point.

                  Between the plates: upper sheet, point below it, $\uv n = -\hat{\mathbf y}$: $\frac{\mu_0\sigma v}{2}\hat{\mathbf x}\times(-\hat{\mathbf y}) = -\frac{\mu_0\sigma v}{2}\hat{\mathbf z}$. Lower sheet, point above it, $\uv n = +\hat{\mathbf y}$: $\frac{\mu_0}{2}(-\sigma v\hat{\mathbf x})\times\hat{\mathbf y} = -\frac{\mu_0\sigma v}{2}\hat{\mathbf z}$. They add: $\vb B = -\mu_0\sigma v\,\hat{\mathbf z}$. Outside, the two contributions are opposite and cancel.

                  **(b)** Area ratio first: the current flows through area $\pi(a^2 - c^2)$, so $\vb J = \frac{I}{\pi(a^2-c^2)}\hat{\mathbf z}$. Superpose a solid cylinder of radius $a$ carrying $+\vb J$ (current $I_+ = \frac{Ia^2}{a^2-c^2}$) and a solid cylinder of radius $c$ at the hole carrying $-\vb J$ (current $I_- = -\frac{Ic^2}{a^2-c^2}$).

                  Inside a uniform cylinder, Ampère gives $\vb B = \frac{\mu_0}{2}\vb J\times\vb s$, with $\vb s$ measured from that cylinder's axis. In the hole: $\vb B = \frac{\mu_0}{2}\vb J\times\vb s - \frac{\mu_0}{2}\vb J\times(\vb s - b\hat{\mathbf x}) = \frac{\mu_0}{2}\vb J\times b\hat{\mathbf x} = \frac{\mu_0Jb}{2}\hat{\mathbf y}$.

                  With $J = \frac{I}{\pi(a^2-c^2)}$: $\vb B = \frac{\mu_0Ib}{2\pi(a^2-c^2)}\hat{\mathbf y}$, the same everywhere in the hole, perpendicular to the displacement.
                `,
              },
              {
                q: md`
                  **Problem 3.** An infinitely long straight wire of radius $R$ lies along the $z$-axis. It carries a steady current with volume current density $\vb J(s) = ks^2\,\hat{\mathbf z}$ for $0\le s\le R$, where $s$ is the distance from the axis and $k>0$. Find the magnetic vector potential $\vb A$ (magnitude and direction) inside the wire, $0\le s\le R$. Take $\vb A = 0$ on the axis.
                `,
                ans: md`
                  - $\vb A = -\dfrac{\mu_0ks^4}{16}\,\hat{\mathbf z}$.
                `,
                sol: md`
                  The integral $\frac{\mu_0}{4\pi}\int\frac{\vb J}{\srm}d\tau'$ diverges for an infinite wire, so use $\nabla\times\vb A = \vb B$.

                  **B first (Ampère):** $I_{\text{enc}}(s) = \int_0^sks'^2\,2\pi s'\,ds' = \frac{\pi ks^4}{2}$, so $B_\phi = \frac{\mu_0I_{\text{enc}}}{2\pi s} = \frac{\mu_0ks^3}{4}$.

                  **A from the curl:** $\vb A$ is parallel to $\vb J$: $\vb A = A_z(s)\hat{\mathbf z}$, whose curl is $-\frac{dA_z}{ds}\hat{\boldsymbol\phi}$. So $-\frac{dA_z}{ds} = \frac{\mu_0ks^3}{4}$, giving $A_z = -\frac{\mu_0ks^4}{16} + C$, and $A_z(0) = 0$ fixes $C = 0$.

                  **Check:** $\nabla^2A_z = \frac1s\frac{d}{ds}\left(s\cdot\left(-\frac{\mu_0ks^3}{4}\right)\right) = -\mu_0ks^2 = -\mu_0J_z$ ✓, and $\nabla\cdot\vb A = \partial_zA_z = 0$ (Coulomb gauge) ✓.
                `,
              },
              {
                q: md`
                  **Problem 4.** An infinite slab of linear magnetic material with magnetic susceptibility $\chi_m$ occupies $-d/2\le z\le d/2$ and extends to infinity in $x$ and $y$. The slab carries a uniform free current density $\vb J_f = J_0\,\hat{\mathbf x}$ ($J_0>0$). Outside the slab is vacuum. (The figure shows a cross-section in the $yz$-plane, with $\hat{\mathbf x}$, and the free current, out of the page.)

                  (a) Find $\vb H$, $\vb M$ and $\vb B$ inside the slab, $-d/2<z<d/2$. Give magnitude and direction.

                  (b) Find the bound volume current density $\vb J_b$ inside the slab and the bound surface current density $\vb K_b$ on the top ($z = d/2$) and bottom ($z = -d/2$) surfaces.
                `,
                ans: md`
                  - (a) $\vb H = -J_0z\,\hat{\mathbf y}$; $\vb M = -\chi_mJ_0z\,\hat{\mathbf y}$; $\vb B = -\mu_0(1+\chi_m)J_0z\,\hat{\mathbf y}$.
                  - (b) $\vb J_b = \chi_mJ_0\,\hat{\mathbf x}$; $\vb K_b = -\dfrac{\chi_mJ_0d}{2}\hat{\mathbf x}$ on both the top and the bottom surface.
                `,
                sol: md`
                  **(a)** By symmetry (infinite slab, current along $x$), $\vb H = H(z)\hat{\mathbf y}$ with $H(-z) = -H(z)$, so $H(0) = 0$. Ampère for $\vb H$ (free current only) around a rectangle in the $yz$-plane with sides at heights $\pm z$, length $\ell$ along $y$, traversed counterclockwise as seen from $+x$: $\oint\vb H\cdot d\vb l = -2H(z)\ell = J_0(2z)\ell$, so $\vb H = -J_0z\,\hat{\mathbf y}$ (it points along $-\hat{\mathbf y}$ above the midplane, $+\hat{\mathbf y}$ below, the same pattern as a slab of current in vacuum).

                  Linear material: $\vb M = \chi_m\vb H = -\chi_mJ_0z\,\hat{\mathbf y}$ and $\vb B = \mu_0(1+\chi_m)\vb H = -\mu_0(1+\chi_m)J_0z\,\hat{\mathbf y}$. (Outside: $\vb H = \mp\frac{J_0d}{2}\hat{\mathbf y}$ above/below, $\vb B = \mu_0\vb H$.)

                  **(b)** $\vb J_b = \nabla\times\vb M$; with $\vb M = M_y(z)\hat{\mathbf y}$ only the $x$ component survives: $(\nabla\times\vb M)_x = -\partial_zM_y = \chi_mJ_0$, so $\vb J_b = \chi_mJ_0\hat{\mathbf x} = \chi_m\vb J_f$ (as always in a homogeneous linear medium).

                  $\vb K_b = \vb M\times\uv n$. Top ($\uv n = \hat{\mathbf z}$, $\vb M = -\frac{\chi_mJ_0d}{2}\hat{\mathbf y}$): $-\frac{\chi_mJ_0d}{2}\hat{\mathbf y}\times\hat{\mathbf z} = -\frac{\chi_mJ_0d}{2}\hat{\mathbf x}$. Bottom ($\uv n = -\hat{\mathbf z}$, $\vb M = +\frac{\chi_mJ_0d}{2}\hat{\mathbf y}$): $\frac{\chi_mJ_0d}{2}\hat{\mathbf y}\times(-\hat{\mathbf z}) = -\frac{\chi_mJ_0d}{2}\hat{\mathbf x}$.

                  **Check:** total bound current per unit length in $y$: $\chi_mJ_0d - 2\cdot\frac{\chi_mJ_0d}{2} = 0$ ✓, so outside the slab only the free current matters, consistent with $\vb B = \mu_0\vb H$ there.
                `,
              },
            ],
          },
        ],
      },
    ],
  });
})();

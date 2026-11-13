/* Hour Exam II: three more 50-minute mock exams in Hour Exam I's format (four problems, 25 points each).
   Mock C mirrors Exam I problem by problem; D leans magnetic; E is short-and-tricky. */
(function () {
  'use strict';
  const { R } = C;

  const paper = (title, items) => ({
    t: 'paper',
    html: `<div class="pp-title"><span>PHYS 435 · ${title}</span><span>100 pts</span></div><div class="pp-meta"><span>50 minutes · 4 problems</span><span>Formula sheet allowed</span></div>`,
    items,
  });
  const intro = (s) => R(md`50 minutes, closed book, formula sheet only, on paper. ${s} Every solution ends with **the trick**: the one move that keeps the problem under 12 minutes. If you didn't use it, that's what to drill.`);

  C.unit({
    id: 'h-e2-mocks', num: '', title: 'Exam II mocks (holding)',
    lessons: [
      // ================================================================== C
      {
        id: 'e2-mockC', title: 'Mock Exam II (C): Exam I, problem by problem, in Exam II material', kind: 'mock',
        steps: [
          intro('Same four problem types as your Exam I: fields + energy, overlapping shapes, images, sphere in a uniform field.'),
          paper('Mock Hour Exam II (C)', [
            {
              q: md`
                **Problem 1 (25 pts).** A ball of radius $R$ is made of linear dielectric $\varepsilon_r$ and carries free charge density $\rho_f = kr$. Outside is vacuum.

                (a) Find $\vb D$ and $\vb E$ everywhere. (b) Find $\rho_b$ and $\sigma_b$. (c) Find $V$ at the center ($V(\infty) = 0$). (d) Find the energy $W = \tfrac12\int\vb D\cdot\vb E\,d\tau$.
              `,
              ans: md`
                - (a) Inside $D = \dfrac{kr^2}{4}$, $E = \dfrac{kr^2}{4\varepsilon_0\varepsilon_r}$; outside $D = \dfrac{kR^4}{4r^2}$, $E = \dfrac{kR^4}{4\varepsilon_0r^2}$ (all radial).
                - (b) $\rho_b = -\dfrac{\chi_e}{\varepsilon_r}kr$, $\sigma_b = \dfrac{\chi_e}{\varepsilon_r}\dfrac{kR^2}{4}$.
                - (c) $V(0) = \dfrac{kR^3}{4\varepsilon_0}\left(1 + \dfrac{1}{3\varepsilon_r}\right)$.
                - (d) $W = \dfrac{\pi k^2R^7}{8\varepsilon_0}\left(1 + \dfrac{1}{7\varepsilon_r}\right)$.
              `,
              sol: md`
                **(a)** $Q_f(r) = \int_0^rkr'\,4\pi r'^2dr' = \pi kr^4$, so $D = \frac{\pi kr^4}{4\pi r^2} = \frac{kr^2}{4}$. Total $Q = \pi kR^4$. $E = D/\varepsilon$ inside, $D/\varepsilon_0$ outside.

                **(b)** $\rho_b = -\frac{\chi_e}{1+\chi_e}\rho_f$ (homogeneous linear). $\sigma_b = P(R) = \frac{\chi_e}{\varepsilon_r}D(R)$. Check: $-\frac{\chi_e}{\varepsilon_r}\pi kR^4 + \frac{\chi_e}{\varepsilon_r}\frac{kR^2}{4}4\pi R^2 = 0$ ✓.

                **(c)** Outside: $\frac{Q}{4\pi\varepsilon_0R} = \frac{kR^3}{4\varepsilon_0}$. Inside: $\int_0^R\frac{kr^2}{4\varepsilon}dr = \frac{kR^3}{12\varepsilon_0\varepsilon_r}$.

                **(d)** Inside: $\frac{1}{2\varepsilon}\int_0^R\frac{k^2r^4}{16}4\pi r^2dr = \frac{\pi k^2R^7}{56\varepsilon_0\varepsilon_r}$. Outside: $\frac{Q^2}{8\pi\varepsilon_0R} = \frac{\pi k^2R^7}{8\varepsilon_0}$ (no integral).

                **The trick:** $\rho_b = -\frac{\chi_e}{1+\chi_e}\rho_f$ in one line, and the outside energy is always $Q^2/8\pi\varepsilon_0R$.
              `,
            },
            {
              q: md`
                **Problem 2 (25 pts).** Two balls of radius $R$ overlap. Ball 1 (center $+\tfrac d2\hat{\mathbf z}$) has uniform charge density $+\rho$; ball 2 (center $-\tfrac d2\hat{\mathbf z}$) has $-\rho$; $d<2R$.

                (a) Find $\vb E$ in the overlap. (b) Find $E_z$ far away on the $z$ axis at $z = h\gg R$. (c) Let $d\to0$ with $\rho d = P$ fixed. What object is this, and what is the surface charge on it? (d) A uniform external field $E_0\hat{\mathbf z}$ is added. What $E_0$ makes the field in the overlap zero?
              `,
              ans: md`
                - (a) $\vb E = -\dfrac{\rho d}{3\varepsilon_0}\hat{\mathbf z}$, uniform.
                - (b) $E_z\approx\dfrac{2\rho R^3d}{3\varepsilon_0h^3}$.
                - (c) A uniformly polarized sphere, $\vb P = P\hat{\mathbf z}$; $\sigma = P\cos\theta$.
                - (d) $E_0 = \dfrac{\rho d}{3\varepsilon_0}$.
              `,
              sol: md`
                **(a)** $\frac{\rho}{3\varepsilon_0}(\vb r - \tfrac d2\hat{\mathbf z}) - \frac{\rho}{3\varepsilon_0}(\vb r + \tfrac d2\hat{\mathbf z}) = -\frac{\rho d}{3\varepsilon_0}\hat{\mathbf z}$. Points from the $+$ center toward the $-$ center.

                **(b)** Far away: two point charges $\pm Q$, $Q = \frac43\pi R^3\rho$, separated by $d$. Dipole $p = Qd$, on axis $E = \frac{2p}{4\pi\varepsilon_0h^3}$.

                **(c)** The overlap fills the whole ball; the two thin crescents at the edges become surface charge $\rho d\cos\theta = P\cos\theta$. Field inside $-\vb P/3\varepsilon_0$ ✓ (from (a)).

                **(d)** Cancel (a).

                **The trick:** write each ball's interior field in vector form with its own center; the $\vb r$'s cancel.
              `,
            },
            {
              q: md`
                **Problem 3 (25 pts).** An infinite line charge $\lambda$ runs parallel to the $x$ axis at height $d$ above a dielectric half-space ($z<0$, constant $\varepsilon_r$).

                (a) Find the image line charge for the region $z>0$, and the effective line charge for $z<0$. (b) Find the force per length on the line charge. (c) Find $\sigma_b$ directly below the line. (d) Instead, the half-space is a **conductor held at $V_0$**. Write $V(y, z)$ for $z>0$.
              `,
              ans: md`
                - (a) $\lambda' = -\dfrac{\varepsilon_r - 1}{\varepsilon_r + 1}\lambda$ at $z = -d$; $\lambda'' = \dfrac{2\lambda}{\varepsilon_r + 1}$ at $z = d$.
                - (b) $\dfrac{F}{L} = \dfrac{\lambda\lambda'}{2\pi\varepsilon_0(2d)} = -\dfrac{\varepsilon_r - 1}{\varepsilon_r + 1}\dfrac{\lambda^2}{4\pi\varepsilon_0d}$ (attractive).
                - (c) $\sigma_b = -\dfrac{\chi_e}{\chi_e + 2}\dfrac{\lambda}{\pi d}$.
                - (d) $V = V_0 + \dfrac{\lambda}{2\pi\varepsilon_0}\ln\dfrac{\sqrt{y^2 + (z+d)^2}}{\sqrt{y^2 + (z-d)^2}}$.
              `,
              sol: md`
                **(a)** Same matching as for a point charge: $V$ continuous gives $\lambda + \lambda' = \lambda''$, $\varepsilon\partial_zV$ continuous gives $\lambda - \lambda' = \varepsilon_r\lambda''$.

                **(b)** The field of $\lambda'$ at the real line, times $\lambda$.

                **(c)** Below, the field is that of $\lambda''$ at distance $d$: $E_z = -\frac{\lambda''}{2\pi\varepsilon_0d}$. $\sigma_b = P_z = \varepsilon_0\chi_eE_z = -\frac{\chi_e\lambda''}{2\pi d} = -\frac{\chi_e}{\chi_e + 2}\frac{\lambda}{\pi d}$. Check: as $\chi_e\to\infty$ this becomes $-\lambda/\pi d$, a grounded conductor's induced charge under a line ✓.

                **(d)** Exam I's trick: (grounded answer with image $-\lambda$) + $V_0$.

                **The trick:** the dielectric image is the conductor image times $\frac{\varepsilon_r - 1}{\varepsilon_r + 1}$. Line, point, same fraction.
              `,
            },
            {
              q: md`
                **Problem 4 (25 pts).** A dielectric sphere (radius $R$, constant $\varepsilon_r$) sits in a uniform field $E_0\hat{\mathbf z}$.

                (a) Write the general forms of $V_{\text{in}}$ and $V_{\text{out}}$ and the boundary conditions. (b) Solve for $V$. (c) Find $\sigma_b(\theta)$. (d) Find $E_r$ just **outside** the north pole. (e) Check both $\varepsilon_r\to1$ and $\varepsilon_r\to\infty$.
              `,
              ans: md`
                - (a) $V_{\text{in}} = Ar\cos\theta$, $V_{\text{out}} = -E_0r\cos\theta + \dfrac{B\cos\theta}{r^2}$; $V$ continuous and $\varepsilon_r\partial_rV_{\text{in}} = \partial_rV_{\text{out}}$ at $R$.
                - (b) $A = -\dfrac{3E_0}{\varepsilon_r + 2}$, $B = \dfrac{\varepsilon_r - 1}{\varepsilon_r + 2}E_0R^3$.
                - (c) $\sigma_b = 3\varepsilon_0\dfrac{\varepsilon_r - 1}{\varepsilon_r + 2}E_0\cos\theta$.
                - (d) $E_r = \dfrac{3\varepsilon_r}{\varepsilon_r + 2}E_0$.
                - (e) $\varepsilon_r = 1$: $A = -E_0$, $B = 0$ ✓. $\varepsilon_r\to\infty$: $A\to0$, $B\to E_0R^3$, $E_r\to3E_0$: grounded conductor ✓.
              `,
              sol: md`
                **(a)** Only $\ell = 1$ appears because the far field is pure $P_1$. Inside must be finite at $r = 0$.

                **(b)** $AR = -E_0R + B/R^2$ and $\varepsilon_rA = -E_0 - 2B/R^3$. Eliminate $B$.

                **(c)** $\sigma_b = \vb P\cdot\uv r$ with $\vb P = \varepsilon_0(\varepsilon_r - 1)\vb E_{\text{in}}$, $\vb E_{\text{in}} = -A\hat{\mathbf z}$.

                **(d)** $E_r = E_0 + \frac{2B}{R^3}$ at $\theta = 0$. **Faster:** $D_r$ is continuous, so $E_r^{\text{out}} = \varepsilon_rE_r^{\text{in}} = \varepsilon_r\frac{3E_0}{\varepsilon_r + 2}$.

                **The trick:** the setup in (a) is most of the points; (d) is one line from $D_\perp$ continuity.
              `,
            },
          ]),
        ],
      },

      // ================================================================== D
      {
        id: 'e2-mockD', title: 'Mock Exam II (D): magnetic-heavy', kind: 'mock',
        steps: [
          intro('Weighted toward Units 5–8, since Exam I had no magnetism at all.'),
          paper('Mock Hour Exam II (D)', [
            {
              q: md`
                **Problem 1 (25 pts).** A spherical shell (radius $R$, total charge $Q$ spread uniformly) spins at angular velocity $\omega$ about the $z$ axis.

                (a) Find $\vb K$. (b) Find $\vb m$. (c) The field outside is a pure dipole. Use the boundary condition at the equator to find $\vb B$ just inside, and say why it's the field everywhere inside. (d) Find $\vb A$ outside. (e) A small loop with moment $m_2\hat{\mathbf z}$ sits on the axis at $z\gg R$. Find the force on it.
              `,
              ans: md`
                - (a) $\vb K = \dfrac{Q\omega\sin\theta}{4\pi R}\hat{\boldsymbol\phi}$.
                - (b) $\vb m = \dfrac{Q\omega R^2}{3}\hat{\mathbf z}$.
                - (c) $\vb B_{\text{in}} = \dfrac{\mu_0Q\omega}{6\pi R}\hat{\mathbf z}$.
                - (d) $\vb A = \dfrac{\mu_0Q\omega R^2\sin\theta}{12\pi r^2}\hat{\boldsymbol\phi}$.
                - (e) $F_z = -\dfrac{3\mu_0mm_2}{2\pi z^4}$ (attractive), $m = Q\omega R^2/3$.
              `,
              sol: md`
                **(a)** $\sigma\omega R\sin\theta$ with $\sigma = Q/4\pi R^2$. **(b)** $m = \frac{Q}{2M}\cdot\frac23MR^2\omega$.

                **(c)** At the equator, outside: $\vb B = \frac{\mu_0m}{4\pi R^3}\hat{\boldsymbol\theta} = -\frac{\mu_0m}{4\pi R^3}\hat{\mathbf z}$. $\vb B_{\text{out}} - \vb B_{\text{in}} = \mu_0\vb K\times\uv r = \mu_0K\hat{\boldsymbol\theta} = -\mu_0\sigma\omega R\,\hat{\mathbf z}$. So $B_{\text{in}} = \mu_0\sigma\omega R - \frac{\mu_0\sigma\omega R}{3} = \frac23\mu_0\sigma\omega R = \frac{\mu_0Q\omega}{6\pi R}$. Uniform because the $\sin\theta$ current is the one distribution that gives a uniform interior (Griffiths Ex. 5.11).

                **(d)** $\vb A_{\text{dip}} = \frac{\mu_0}{4\pi}\frac{\vb m\times\uv r}{r^2} = \frac{\mu_0m\sin\theta}{4\pi r^2}\hat{\boldsymbol\phi}$ (exact outside).

                **(e)** $F = m_2\frac{dB_z}{dz}$ with $B_z = \frac{\mu_0m}{2\pi z^3}$.

                **The trick:** (b) from $Q/2M$; (c) from one boundary condition at one point.
              `,
            },
            {
              q: md`
                **Problem 2 (25 pts).** Inside a long cylinder of radius $a$, $\vb B = B_0\left(1 - \dfrac{s^2}{a^2}\right)\hat{\mathbf z}$; outside, $\vb B = 0$.

                (a) Is this a valid magnetostatic field? (b) Find $\vb J$. (c) Is there a surface current at $s = a$? (d) Find the current per unit length (along $z$) circulating around the axis. (e) Find $\vb A$ inside (Coulomb gauge, regular on the axis).
              `,
              ans: md`
                - (a) Yes, $\nabla\cdot\vb B = 0$.
                - (b) $\vb J = \dfrac{2B_0s}{\mu_0a^2}\hat{\boldsymbol\phi}$.
                - (c) No: $\vb B$ is continuous at $s = a$ (both sides zero).
                - (d) $B_0/\mu_0$.
                - (e) $\vb A = B_0\left(\dfrac s2 - \dfrac{s^3}{4a^2}\right)\hat{\boldsymbol\phi}$.
              `,
              sol: md`
                **(a)** $\hat{\mathbf z}$-only and depends on $s$: divergence 0.

                **(b)** $\mu_0J_\phi = -\frac{dB_z}{ds} = \frac{2B_0s}{a^2}$.

                **(d)** $\int_0^aJ_\phi\,ds = \frac{B_0}{\mu_0}$. Like a solenoid, $B$ on the axis $= \mu_0\times$(current per length) ✓.

                **(e)** $A_\phi\cdot2\pi s = \Phi(s) = \int_0^sB_0(1 - s'^2/a^2)2\pi s'ds' = 2\pi B_0\left(\frac{s^2}{2} - \frac{s^4}{4a^2}\right)$.

                **The trick:** one-line curl from the table; Stokes for $\vb A$.
              `,
            },
            {
              q: md`
                **Problem 3 (25 pts).** A sphere of radius $R$ has frozen-in uniform magnetization $M\hat{\mathbf z}$ and sits in a uniform external field $B_0\hat{\mathbf z}$.

                (a) Find $\vb J_b$ and $\vb K_b$. (b) Find $\vb B$ inside and outside. (c) Find $\vb H$ inside. (d) The sphere is turned so $\vb M$ makes angle $\alpha$ with $\vb B_0$. Find the torque and the net force.
              `,
              ans: md`
                - (a) $\vb J_b = 0$, $\vb K_b = M\sin\theta\,\hat{\boldsymbol\phi}$.
                - (b) Inside $\vb B = \left(B_0 + \tfrac23\mu_0M\right)\hat{\mathbf z}$; outside $B_0\hat{\mathbf z}$ + dipole with $\vb m = \tfrac43\pi R^3M\hat{\mathbf z}$.
                - (c) $\vb H = \left(\dfrac{B_0}{\mu_0} - \dfrac M3\right)\hat{\mathbf z}$.
                - (d) $N = \tfrac43\pi R^3MB_0\sin\alpha$; $\vb F = 0$.
              `,
              sol: md`
                **(b)** Superpose: external field + the sphere's own field ($\frac23\mu_0\vb M$ inside, dipole outside). **(c)** $\vb H = \vb B/\mu_0 - \vb M$. **(d)** $\vb N = \vb m\times\vb B_0$; uniform field, no net force.

                **The trick:** the frozen $\vb M$ doesn't respond to $\vb B_0$, so it's pure superposition. (Compare: a **linear** sphere would need the boundary-value solution.)
              `,
            },
            {
              q: md`
                **Problem 4 (25 pts).** A coaxial cable (inner conductor radius $a$ carrying $I$, outer conductor radius $b$ carrying $-I$) is filled with two **half-cylinders** of different linear magnetic materials: $\mu_1$ for $0<\phi<\pi$ and $\mu_2$ for $\pi<\phi<2\pi$.

                (a) Argue that $B$ is the same in both halves at a given $s$. (b) Find $B(s)$. (c) Find $H$ in each half. (d) Check the limit $\mu_1 = \mu_2$.
              `,
              ans: md`
                - (a) $\vb B\parallel\hat{\boldsymbol\phi}$ crosses the interfaces (the planes $\phi = 0, \pi$) normally, and $B^\perp$ is continuous.
                - (b) $B = \dfrac{\mu_1\mu_2}{\mu_1 + \mu_2}\dfrac{I}{\pi s}$.
                - (c) $H_1 = \dfrac{\mu_2}{\mu_1 + \mu_2}\dfrac{I}{\pi s}$, $H_2 = \dfrac{\mu_1}{\mu_1 + \mu_2}\dfrac{I}{\pi s}$.
                - (d) $\mu_1 = \mu_2 = \mu$: $B = \dfrac{\mu I}{2\pi s}$ ✓.
              `,
              sol: md`
                **(b)** Ampère for $\vb H$: $H_1\pi s + H_2\pi s = I$ with $H_i = B/\mu_i$.

                **The trick:** this is the magnetic version of "half-filled capacitor": decide which quantity is shared across the interface ($B^\perp$ here, like $D^\perp$ for stacked dielectrics), then Ampère/Gauss gives the rest. The dielectric twin (coax half-filled with $\varepsilon_1$, $\varepsilon_2$ by angle) shares $E$ instead, because $\vb E$ is radial and lies **along** those interfaces.
              `,
            },
          ]),
        ],
      },

      // ================================================================== E
      {
        id: 'e2-mockE', title: 'Mock Exam II (E): short, tricky, no slack', kind: 'mock',
        steps: [
          intro('Each problem looks long and is short if you see the trick. Give yourself 10 minutes each, then move on no matter what.'),
          paper('Mock Hour Exam II (E)', [
            {
              q: md`
                **Problem 1 (25 pts).** For each field ($k$ a constant), find the divergence and curl, say whether it could be an electrostatic field, a magnetostatic field, both or neither, and give the source ($\rho$ or $\vb J$) and a potential where one exists.

                (a) $k(z\hat{\mathbf x} + x\hat{\mathbf z})$ (b) $k(-z\hat{\mathbf y} + y\hat{\mathbf z})$ (c) $kr\,\uv r$ (spherical) (d) $\dfrac ks\hat{\mathbf s}$ (cylindrical, $s>0$)
              `,
              ans: md`
                - (a) div 0, curl 0: both. $V = -kxz$; no source.
                - (b) div 0, curl $2k\hat{\mathbf x}$: magnetic only, $\vb J = \dfrac{2k}{\mu_0}\hat{\mathbf x}$.
                - (c) div $3k$, curl 0: electric only, $\rho = 3\varepsilon_0k$, $V = -\tfrac12kr^2$.
                - (d) div 0 and curl 0 for $s>0$, but it's the field of a **line charge** $\lambda = 2\pi\varepsilon_0k$ on the axis: electrostatic, $V = -k\ln s$. Not magnetic: it would need a "magnetic line charge".
              `,
              sol: md`
                **(b)** $(\nabla\times\vb F)_x = \partial_yF_z - \partial_zF_y = k + k$. It's the field inside a wire along $x$.

                **(d)** The trap: $\nabla\cdot(\hat{\mathbf s}/s) = 2\pi\delta^2(s)$ on the axis. Flux through any cylinder around the axis is $2\pi k\ne0$, so it can't be a $\vb B$.

                **The trick:** one-line div/curl from the table; always ask what's hiding at $s = 0$ or $r = 0$.
              `,
            },
            {
              q: md`
                **Problem 2 (25 pts).** A long wire runs along the $x$ axis from $-\infty$ to $x = -R$, follows a semicircle of radius $R$ through the upper half-plane ($y>0$) to $x = +R$, then continues along the $x$ axis to $+\infty$. Current $I$ flows in the $+x$ direction.

                (a) Find $\vb B$ at the origin. (b) The whole circuit sits in a uniform field $B_0\hat{\mathbf z}$. Find the force on the semicircle. (c) The semicircle is replaced by three sides of a square (up from $(-R, 0)$ to $(-R, 2R)$, across to $(R, 2R)$, down to $(R, 0)$). Find $B$ at the origin.
              `,
              ans: md`
                - (a) $\dfrac{\mu_0I}{4R}$, along $-\hat{\mathbf z}$.
                - (b) $\vb F = -2IRB_0\,\hat{\mathbf y}$.
                - (c) $\dfrac{\sqrt5\,\mu_0I}{4\pi R}$, along $-\hat{\mathbf z}$.
              `,
              sol: md`
                **(a)** The straight parts lie on the $x$ axis, through the origin's line: zero. The semicircle runs clockwise about the origin (from $-R$ over the top to $+R$): $\frac{\mu_0I}{4R}$ into the page.

                **(b)** **Trick:** in a uniform field, a curved wire feels the same force as a straight wire joining its ends. Chord $2R\hat{\mathbf x}$: $\vb F = I(2R\hat{\mathbf x})\times B_0\hat{\mathbf z} = -2IRB_0\hat{\mathbf y}$.

                **(c)** Vertical sides: distance $R$, from the foot ($\theta = 0$) to $\sin\theta = 2/\sqrt5$: each $\frac{\mu_0I}{4\pi R}\frac{2}{\sqrt5}$. Top: distance $2R$, $\sin\theta = \pm1/\sqrt5$: $\frac{\mu_0I}{4\pi(2R)}\frac{2}{\sqrt5}$. Total $\frac{\mu_0I}{4\pi R}\cdot\frac{4 + 1}{\sqrt5} = \frac{\sqrt5\,\mu_0I}{4\pi R}$, all into the page.
              `,
            },
            {
              q: md`
                **Problem 3 (25 pts).** A parallel-plate capacitor (area $A$, gap $d$) is divided into two halves side by side. The left half is filled completely with $\varepsilon_{r1}$. The right half is filled with $\varepsilon_{r2}$ in its lower half-thickness and vacuum in its upper half-thickness.

                (a) Find $C$. (b) With voltage $V$, find $E$ in each of the three regions. (c) Find the free charge on the left half of the top plate.
              `,
              ans: md`
                - (a) $C = \dfrac{\varepsilon_0A}{d}\left[\dfrac{\varepsilon_{r1}}{2} + \dfrac{\varepsilon_{r2}}{1 + \varepsilon_{r2}}\right]$.
                - (b) Left: $V/d$. Right, dielectric: $\dfrac{2V}{d(1 + \varepsilon_{r2})}$. Right, vacuum: $\dfrac{2\varepsilon_{r2}V}{d(1 + \varepsilon_{r2})}$.
                - (c) $\dfrac{\varepsilon_0\varepsilon_{r1}AV}{2d}$.
              `,
              sol: md`
                **(a)** Left half: $\frac{\varepsilon_0\varepsilon_{r1}(A/2)}{d}$. Right half: two layers of thickness $d/2$ in series, each $C_i = \frac{\varepsilon_0\varepsilon_{ri}(A/2)}{d/2}$: series gives $\frac{\varepsilon_0A}{d}\frac{\varepsilon_{r2}}{1 + \varepsilon_{r2}}$. Parallel: add.

                **(b)** Right half: same $D$ in both layers, $E_2 = E_{\text{vac}}/\varepsilon_{r2}$, and $E_2\frac d2 + E_{\text{vac}}\frac d2 = V$.

                **(c)** $\sigma_f = D = \varepsilon_0\varepsilon_{r1}V/d$ on area $A/2$.

                **The trick:** springs in series and parallel. No Gauss, no integrals.
              `,
            },
            {
              q: md`
                **Problem 4 (25 pts).** A long cylinder of radius $R$ has frozen-in magnetization $\vb M = ks\,\hat{\boldsymbol\phi}$.

                (a) Find $\vb J_b$ and $\vb K_b$. (b) Find $\vb B$ inside and outside. (c) A thin wire along the axis now carries free current $I$. Find $\vb H$ and $\vb B$ inside and outside.
              `,
              ans: md`
                - (a) $\vb J_b = 2k\hat{\mathbf z}$, $\vb K_b = -kR\,\hat{\mathbf z}$.
                - (b) Inside $\vb B = \mu_0ks\,\hat{\boldsymbol\phi}$; outside $0$.
                - (c) $\vb H = \dfrac{I}{2\pi s}\hat{\boldsymbol\phi}$ everywhere. $\vb B = \left(\dfrac{\mu_0I}{2\pi s} + \mu_0ks\right)\hat{\boldsymbol\phi}$ inside, $\dfrac{\mu_0I}{2\pi s}\hat{\boldsymbol\phi}$ outside.
              `,
              sol: md`
                **(a)** $\frac1s\frac{d}{ds}(ks^2) = 2k$. $\vb M\times\hat{\mathbf s} = kR\,\hat{\boldsymbol\phi}\times\hat{\mathbf s} = -kR\,\hat{\mathbf z}$. Net: $2k\pi R^2 - kR\cdot2\pi R = 0$ ✓.

                **(b)** No free current, circular symmetry: $\vb H = 0$, so $\vb B = \mu_0\vb M$.

                **(c)** Ampère for $\vb H$ sees only the free $I$. Then $\vb B = \mu_0(\vb H + \vb M)$.

                **The trick:** $\vb H$ from free current, then add $\mu_0\vb M$. Ten seconds instead of finding bound currents.
              `,
            },
          ]),
        ],
      },
    ],
  });
})();

/* Exam I toolkit — the formula sheet typed out, what is NOT on it, and the concept quiz.
   (The method chooser and the mock exam are added by u9-mock.js.) */
(function () {
  'use strict';
  const { R, RF, G } = C;

  // spherical / cylindrical coordinate pictures, as on the sheet
  const sphPic = () => {
    const f = PF.fig({ proj: { ox: 70, oy: 150, s: 1 } });
    f.axes3(110, { labels: ['x', 'y', 'z'] });
    const P = f.p3(40, 70, 70), O = f.p3(0, 0, 0), F = f.p3(40, 70, 0);
    f.line(O[0], O[1], P[0], P[1], { cls: 'thick', arrow: 'end' });
    f.dot(P[0], P[1], 3.4);
    f.line(P[0], P[1], F[0], F[1], { cls: 'dash dim' }); f.line(O[0], O[1], F[0], F[1], { cls: 'dash dim' });
    f.label(P[0] + 8, P[1] - 6, '\\vb r = r\\,\\uv r', 'bl');
    f.label((O[0] + P[0]) / 2 + 8, (O[1] + P[1]) / 2 + 4, 'r', 'l');
    const Z = f.p3(0, 0, 40);
    f.arc(O[0], O[1], 26, 90, 58, { cls: 'dim' }); f.label(O[0] + 6, O[1] - 36, '\\theta', 'c', 'small');
    f.arc(O[0], O[1], 20, 215, 335, { cls: 'dim' }); f.label(O[0] - 2, O[1] + 28, '\\phi', 'c', 'small');
    return f.svg();
  };
  const cylPic = () => {
    const f = PF.fig({ proj: { ox: 70, oy: 150, s: 1 } });
    f.axes3(110, { labels: ['x', 'y', 'z'] });
    const P = f.p3(40, 70, 70), O = f.p3(0, 0, 0), F = f.p3(40, 70, 0), Zt = f.p3(0, 0, 70);
    f.line(O[0], O[1], P[0], P[1], { cls: 'thick', arrow: 'end' });
    f.dot(P[0], P[1], 3.4);
    f.line(P[0], P[1], F[0], F[1], { cls: 'dash dim' }); f.line(O[0], O[1], F[0], F[1], { cls: 'dash dim' });
    f.line(Zt[0], Zt[1], P[0], P[1], { cls: 'dash dim' });
    f.label((Zt[0] + P[0]) / 2, (Zt[1] + P[1]) / 2 - 4, 's', 'b', 'small');
    f.label(P[0] + 8, P[1] - 6, '\\vb r = s\\,\\uv s + z\\,\\uv z', 'bl');
    f.label(O[0] - 8, O[1] - 40, 'z', 'r', 'small');
    f.arc(O[0], O[1], 20, 215, 335, { cls: 'dim' }); f.label(O[0] - 2, O[1] + 28, '\\phi', 'c', 'small');
    return f.svg();
  };

  C.unit({
    id: 'x', num: 'Exam', title: 'Exam I toolkit',
    blurb: 'The formula sheet typed out, what you must know that is not on it, a concept quiz drawing from every unit, a method chooser, and a mock exam.',
    lessons: [
      {
        id: 'x-sheet', title: 'The formula sheet', kind: 'read',
        steps: [
          RF(md`
            This is what you get in the exam (two pages), typed out. Know where everything is on it so you don't waste time looking.

            ### Page 1

            **Fields and potentials from charges**

            $$\vb E(\vb r) = \frac{1}{4\pi\varepsilon_0}\int dq\,\frac{\vb r - \vb r_q}{|\vb r - \vb r_q|^3} \qquad V(\vb r) = \frac{1}{4\pi\varepsilon_0}\int \frac{dq}{|\vb r - \vb r_q|}$$

            where $dq = \rho\, dV_q$ or $\sigma\, dA_q$ or $\lambda\, dl_q$, and

            $$\vb E = -\nabla V \qquad V(\vb r) = -\int_{\vb r_0}^{\vb r} \vb E\cdot d\vb l$$

            **Maxwell's equations**

            $$\nabla\cdot\vb E = \frac{\rho}{\varepsilon_0} \qquad \nabla\cdot\vb B = 0 \qquad \nabla\times\vb E = -\frac{\partial \vb B}{\partial t} \qquad \nabla\times\vb B = \mu_0\vb J + \mu_0\varepsilon_0\frac{\partial\vb E}{\partial t}$$

            Current: $\vb J = \dfrac{d\vb I}{dA_\perp}$, $I = \displaystyle\int_{\text{surface}} \vb J\cdot d\vb A$. Biot–Savart: $\vb B(\vb r) = \dfrac{\mu_0}{4\pi}\displaystyle\int \vb I\,dl_q \times \frac{\vb r - \vb r_q}{|\vb r - \vb r_q|^3}$ (with $\vb I\,dl_q$ or $\vb J\,dV_q$).

            **The fundamental theorems** (the sheet labels them GGS)

            $$\int_a^b \nabla f\cdot d\vb l = f(\vb r_b) - f(\vb r_a) \qquad \int_{\text{area}} (\nabla\times\vb E)\cdot d\vb A = \oint_{\partial\text{area}} \vb E\cdot d\vb l \qquad \int_{\text{vol}} \nabla\cdot\vb E\, dV = \oint_{\partial\text{vol}} \vb E\cdot d\vb A$$

            **From Physics 212**

            | Result | Situation |
            |---|---|
            | $E = \dfrac{Q}{4\pi\varepsilon_0 r^2}$ | charged sphere (exterior) |
            | $E = \dfrac{\lambda}{2\pi\varepsilon_0 s}$ | charged infinite line |
            | $E = \dfrac{\sigma}{2\varepsilon_0}$ | charged infinite sheet |
            | $B = \dfrac{\mu_0 I}{2\pi s}$, $B = \mu_0 n I$, $B = \mu_0 N I$ | wire, solenoid, toroid |

            Force: $\vb F = q(\vb E + \vb v\times\vb B)$. Energy: $W = \dfrac{\varepsilon_0}{2}\displaystyle\int E^2\, d\tau$ (work = volume integral of the energy density).

            ### Page 2: coordinates

            [[fig:coords]]

            **Spherical.** $x = r\sin\theta\cos\phi$, $y = r\sin\theta\sin\phi$, $z = r\cos\theta$; $d\vb l = dr\,\uv r + r\,d\theta\,\hat{\boldsymbol\theta} + r\sin\theta\,d\phi\,\hat{\boldsymbol\phi}$.

            $$\nabla V = \frac{\partial V}{\partial r}\uv r + \frac1r\frac{\partial V}{\partial\theta}\hat{\boldsymbol\theta} + \frac{1}{r\sin\theta}\frac{\partial V}{\partial\phi}\hat{\boldsymbol\phi}$$

            $$\nabla^2 V = \frac{1}{r^2}\frac{\partial}{\partial r}\left(r^2\frac{\partial V}{\partial r}\right) + \frac{1}{r^2\sin\theta}\frac{\partial}{\partial\theta}\left(\sin\theta\frac{\partial V}{\partial\theta}\right) + \frac{1}{r^2\sin^2\theta}\frac{\partial^2 V}{\partial\phi^2}$$

            $$\nabla\cdot\vb E = \frac{1}{r^2}\frac{\partial}{\partial r}(r^2E_r) + \frac{1}{r\sin\theta}\frac{\partial}{\partial\theta}(\sin\theta\,E_\theta) + \frac{1}{r\sin\theta}\frac{\partial E_\phi}{\partial\phi}$$

            $$\nabla\times\vb E = \frac{\uv r}{r\sin\theta}\left[\frac{\partial}{\partial\theta}(\sin\theta\,E_\phi) - \frac{\partial E_\theta}{\partial\phi}\right] + \frac{\hat{\boldsymbol\theta}}{r}\left[\frac{1}{\sin\theta}\frac{\partial E_r}{\partial\phi} - \frac{\partial}{\partial r}(rE_\phi)\right] + \frac{\hat{\boldsymbol\phi}}{r}\left[\frac{\partial}{\partial r}(rE_\theta) - \frac{\partial E_r}{\partial\theta}\right]$$

            Unit vectors: $\uv r = \sin\theta\cos\phi\,\uv x + \sin\theta\sin\phi\,\uv y + \cos\theta\,\uv z$, $\hat{\boldsymbol\theta} = \cos\theta\cos\phi\,\uv x + \cos\theta\sin\phi\,\uv y - \sin\theta\,\uv z$, $\hat{\boldsymbol\phi} = -\sin\phi\,\uv x + \cos\phi\,\uv y$, and $\uv z = \cos\theta\,\uv r - \sin\theta\,\hat{\boldsymbol\theta}$. The sheet also tabulates the derivatives of the unit vectors: $\partial_\theta\uv r = \hat{\boldsymbol\theta}$, $\partial_\phi\uv r = \sin\theta\,\hat{\boldsymbol\phi}$, $\partial_\theta\hat{\boldsymbol\theta} = -\uv r$, $\partial_\phi\hat{\boldsymbol\theta} = \cos\theta\,\hat{\boldsymbol\phi}$, $\partial_\phi\hat{\boldsymbol\phi} = -\sin\theta\,\uv r - \cos\theta\,\hat{\boldsymbol\theta}$ (all $\partial_r$ are zero).

            **Cylindrical.** $x = s\cos\phi$, $y = s\sin\phi$, $z = z$; $d\vb l = ds\,\uv s + s\,d\phi\,\hat{\boldsymbol\phi} + dz\,\uv z$.

            $$\nabla V = \frac{\partial V}{\partial s}\uv s + \frac1s\frac{\partial V}{\partial\phi}\hat{\boldsymbol\phi} + \frac{\partial V}{\partial z}\uv z \qquad \nabla^2 V = \frac1s\frac{\partial}{\partial s}\left(s\frac{\partial V}{\partial s}\right) + \frac{1}{s^2}\frac{\partial^2 V}{\partial\phi^2} + \frac{\partial^2V}{\partial z^2}$$

            $$\nabla\cdot\vb E = \frac1s\frac{\partial}{\partial s}(sE_s) + \frac1s\frac{\partial E_\phi}{\partial\phi} + \frac{\partial E_z}{\partial z}$$

            $$\nabla\times\vb E = \left[\frac1s\frac{\partial E_z}{\partial\phi} - \frac{\partial E_\phi}{\partial z}\right]\uv s + \left[\frac{\partial E_s}{\partial z} - \frac{\partial E_z}{\partial s}\right]\hat{\boldsymbol\phi} + \frac1s\left[\frac{\partial}{\partial s}(sE_\phi) - \frac{\partial E_s}{\partial\phi}\right]\uv z$$

            Unit vectors: $\uv s = \cos\phi\,\uv x + \sin\phi\,\uv y$, $\hat{\boldsymbol\phi} = -\sin\phi\,\uv x + \cos\phi\,\uv y$; $\partial_\phi\uv s = \hat{\boldsymbol\phi}$, $\partial_\phi\hat{\boldsymbol\phi} = -\uv s$.
          `, { coords: PF.row([{ svg: sphPic(), cap: 'Spherical' }, { svg: cylPic(), cap: 'Cylindrical' }]) }),
          R(md`
            ### Not on the sheet: know these cold

            !!key Gauss's law and boundary conditions
              $\oint \vb E\cdot d\vb a = \Qenc/\varepsilon_0$; pick a sphere, coaxial cylinder or pillbox so $E$ is constant and parallel to $d\vb a$ on the useful part of the surface.
              At a surface charge: $E^\perp_{\text{above}} - E^\perp_{\text{below}} = \sigma/\varepsilon_0$, $E^\parallel$ continuous, $V$ continuous, $\dfrac{\partial V_{\text{above}}}{\partial n} - \dfrac{\partial V_{\text{below}}}{\partial n} = -\dfrac{\sigma}{\varepsilon_0}$.

            !!key Conductors
              $\vb E = 0$ and $\rho = 0$ inside, charge on the surface, one potential, $\vb E = (\sigma/\varepsilon_0)\,\uv n$ just outside (not $\sigma/2\varepsilon_0$), $\sigma = -\varepsilon_0\,\partial V/\partial n$, pressure $\sigma^2/2\varepsilon_0$. $C = Q/V$, $W = \tfrac12 CV^2$.

            !!key Energy
              $W = \tfrac12\sum_i q_i V(\vb r_i)$ (V from the others) $= \tfrac12\int\rho V\,d\tau = \tfrac{\varepsilon_0}{2}\int E^2 d\tau$. Not superposable.

            !!key Laplace and uniqueness
              In charge-free regions $\nabla^2V = 0$: no local maxima or minima, $V$ = average over any sphere. If $V$ (or the charge on each conductor) is given on every boundary, the solution is unique, so any guess that works is the answer.

            !!key Images
              Plane: $-q$ at the mirror point; $\sigma = -\dfrac{qd}{2\pi(x^2+y^2+d^2)^{3/2}}$, total $-q$; force $\dfrac{q^2}{4\pi\varepsilon_0(2d)^2}$ toward the plane; energy is **half** the two-charge energy: $W = -\dfrac{q^2}{4\pi\varepsilon_0\,4d}$.
              Grounded sphere ($q$ at distance $a$ from the centre): $q' = -\dfrac{R}{a}q$ at $b = \dfrac{R^2}{a}$. Neutral isolated sphere: add $+\dfrac{R}{a}q$ at the centre.

            !!key Separation of variables, Cartesian
              $X'' = k^2X$, $Y'' = -k^2Y$: oscillating ($\sin$, $\cos$) in the direction with two zero boundaries, growing/decaying ($e^{\pm kx}$, $\sinh$, $\cosh$) in the other. $k = n\pi/a$. Fourier trick: $\int_0^a \sin\tfrac{n\pi y}{a}\sin\tfrac{m\pi y}{a}\,dy = \tfrac a2\delta_{nm}$, so $C_n = \tfrac2a\int_0^a V_0(y)\sin\tfrac{n\pi y}{a}\,dy$; for constant $V_0$: $C_n = \dfrac{4V_0}{n\pi}$ for odd $n$, $0$ for even.

            !!key Separation of variables, spherical (azimuthal symmetry)
              $V(r,\theta) = \sum_\ell \left(A_\ell r^\ell + \dfrac{B_\ell}{r^{\ell+1}}\right)P_\ell(\cos\theta)$; inside keep $r^\ell$, outside keep $r^{-(\ell+1)}$.
              $P_0 = 1$, $P_1 = x$, $P_2 = \tfrac12(3x^2-1)$, $P_3 = \tfrac12(5x^3-3x)$; $\int_0^\pi P_\ell P_{\ell'}\sin\theta\,d\theta = \dfrac{2}{2\ell+1}\delta_{\ell\ell'}$.
              Grounded or neutral metal sphere in a uniform field $E_0\uv z$: $V = -E_0\left(r - \dfrac{R^3}{r^2}\right)\cos\theta$, $\sigma = 3\varepsilon_0E_0\cos\theta$.
          `),
        ],
      },
      {
        id: 'x-quiz', title: 'Concept quiz (every unit)', kind: 'quiz', noBank: true,
        steps: [
          R(md`
            Random multiple-choice questions from every lesson on the site, with the options shuffled. No repeats until the pool runs out. Each card links back to the lesson it came from.

            ### Everything
          `),
          G('concept', { need: 15 }),
          R(md`### Images, separation of variables and boundary conditions (last year's exam focus)`),
          G('concept', { need: 10, units: ['u5', 'u6', 'u7', 'ub'] }),
          R(md`### Boundary conditions only`),
          G('concept', { need: 8, units: ['ub'] }),
          R(md`### Fields, Gauss, potential`),
          G('concept', { need: 8, units: ['u0', 'u1', 'u2'] }),
          R(md`### Energy, conductors, Laplace and uniqueness`),
          G('concept', { need: 8, units: ['u3', 'u4'] }),
        ],
      },
    ],
  });
})();

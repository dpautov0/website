/* Exam 3 reference (unit e3-x): the official formula sheet typed in full (v8, three pages, its own order and symbols),
   with what each group is for and where it is derived; then every formula of pages 2 and 3 derived compactly from first
   principles; then what goes on the 4x6 card (notecard-e3.html) and why. The site routes #/sheet to e3-sheet and
   #/derive to e3-derive. */
(function () {
  'use strict';
  const { R, RF, Q } = C;

  // ---------------------------------------------------------------- figures for the derivations
  // a current sheet edge-on at z = 0 (x up, z right, y out of the page), with the two waves it launches
  function sheetFig() {
    const g = PF.fig({ alt: 'a current sheet seen edge-on at z equals 0, its current pointing down along minus x. A wave leaves to the right and a wave leaves to the left. E points up on both sides. H points out of the page on the right and into the page on the left.' });
    g.sheet(220, 24, 176);
    g.arrow(234, 70, 234, 130, { hs: 7 });
    g.label(220, 188, '\\mathbf J_s = -J_s(t)\\,\\hat x', 't', 'small');
    g.arrow(300, 128, 300, 62, { cls: 'thick', hs: 9 });
    g.label(308, 64, '\\mathbf E', 'l');
    g.odot(350, 96, 7, { lab: '\\mathbf H', at: 'r' });
    g.arrow(262, 152, 392, 152, { hs: 7 });
    g.label(327, 144, '\\text{travel } +\\hat z', 'b', 'small');
    g.arrow(140, 128, 140, 62, { cls: 'thick', hs: 9 });
    g.label(132, 64, '\\mathbf E', 'r');
    g.otimes(90, 96, 7, { lab: '\\mathbf H', at: 'l' });
    g.arrow(178, 152, 48, 152, { hs: 7 });
    g.label(113, 144, '\\text{travel } -\\hat z', 'b', 'small');
    g.arrow(28, 214, 64, 214, { cls: 'dim', hs: 6 });
    g.label(68, 214, 'z', 'l', 'small');
    g.arrow(28, 214, 28, 180, { cls: 'dim', hs: 6 });
    g.label(28, 176, 'x', 'b', 'small');
    g.odot(28, 214, 4);
    g.label(20, 222, 'y', 'tr', 'small');
    return g.svg();
  }
  // normal incidence on a flat boundary: incident, reflected and transmitted waves
  function boundaryFig() {
    const g = PF.fig({ alt: 'a flat boundary at z equals 0. Medium 1, with eta 1, is on the left; medium 2, with eta 2, is on the right. The incident wave travels right in medium 1, the reflected wave travels left in medium 1, and the transmitted wave travels right in medium 2.' });
    g.rect(210, 14, 170, 138, { cls: 'shade' });
    g.line(210, 14, 210, 152, { cls: 'thick' });
    g.label(110, 24, '\\text{medium 1: }\\eta_1', 'c', 'small');
    g.label(295, 24, '\\text{medium 2: }\\eta_2', 'c', 'small');
    g.arrow(40, 62, 196, 62, { hs: 8 });
    g.label(118, 56, '\\tilde E_i', 'b');
    g.arrow(196, 108, 40, 108, { hs: 8 });
    g.label(118, 102, '\\tilde E_r = \\Gamma\\tilde E_i', 'b');
    g.arrow(224, 86, 370, 86, { hs: 8 });
    g.label(297, 80, '\\tilde E_t = \\tau\\tilde E_i', 'b');
    g.label(210, 160, 'z = 0', 't', 'small');
    return g.svg();
  }
  // a parallel-plate line seen along its length (travel into the page): x up, y right
  function plateFig() {
    const g = PF.fig({ alt: 'a parallel-plate line seen end-on, travel into the page. The bottom plate is the plus conductor and the top plate the minus conductor, width W, gap d. E points up from the bottom plate to the top plate. H points to the right. Current flows into the page on the bottom plate and out of the page on the top plate.' });
    g.line(40, 36, 280, 36, { cls: 'thick' });
    g.line(40, 124, 280, 124, { cls: 'thick' });
    g.label(30, 124, '+', 'r');
    g.label(30, 36, '-', 'r');
    [70, 115, 160].forEach((x) => g.arrow(x, 118, x, 44, { hs: 7 }));
    g.label(166, 80, '\\mathbf E', 'l');
    g.arrow(196, 80, 268, 80, { cls: 'dash', hs: 7 });
    g.label(232, 74, '\\mathbf H', 'b');
    g.otimes(232, 138, 6, { lab: 'I', at: 'r' });
    g.odot(232, 22, 6, { lab: 'I', at: 'r' });
    g.dim(40, 162, 280, 162, 'W', { at: 'b' });
    g.dim(304, 36, 304, 124, 'd', { at: 'r' });
    return g.svg();
  }

  // ================================================================ 1. the sheet, typed
  EM.lesson('e3-x', {
    id: 'e3-sheet', order: 1, kind: 'read', title: 'Exam 3 formula sheet', ref: 'official sheet, v8',
    sub: 'The official three pages, typed, with what each part is for and what is missing',
    steps: [
      R(md`
        This is the **official Exam 3 formula sheet** (version 8, three pages), typed in full, in its own order and with its own symbols. You get a printed copy in the exam. Read it once now, so that on Monday you know where every line sits and what it is for. After each group there is one line on **what it is for** and a link to the lesson that derives it. Every formula on pages 2 and 3 is also rebuilt from scratch, compactly, in [Every formula on the sheet, derived](#/l/e3-derive). At the end: what the sheet does **not** give you, which goes on your 4″×6″ card ([what to write on it](#/l/e3-card), and the printable layout <a href="notecard-e3.html">notecard-e3.html</a>).

        !!trap Symbols that mean different things on this sheet
          - **Three taus.** On page 2, $\tau$ is the **angle of $\eta$** ($\eta = |\eta|e^{j\tau}$). On page 3, $\tau = 1 + \Gamma$ is the **transmission coefficient** of a boundary. On lines, $\tau_g = Z_0/(R_g + Z_0)$ is the **injection coefficient** of the generator. Always say which one you mean.
          - **Four Gammas.** $\Gamma$ (a boundary between two media), $\Gamma_L$ (the load of a line), $\Gamma_g$ (the generator end), $\Gamma(d)$ (the reflection coefficient seen at distance $d$ from the load).
          - **Two z's on page 3.** In the time-domain section $z$ is the position, measured from the generator ($z = 0$) to the load ($z = l$). In the phasor section the position is $d$, measured **back from the load** ($d = 0$ at the load), and $z(d) = Z(d)/Z_0$ is the **normalized impedance**.
          - **Script letters.** $\mathcal L$ and $\mathcal C$ are the inductance and capacitance **per unit length** of a line (H/m and F/m).
          - **The ± signs** "for $z \gtrless 0$": the upper sign is for $z > 0$ (a wave going toward $+z$), the lower one for $z < 0$ (toward $-z$). A single wave going toward $+z$ uses the upper signs everywhere.

        ## Page 1

        ### Vector calculus

        $$\nabla\cdot\mathbf A = \frac{\partial A_x}{\partial x} + \frac{\partial A_y}{\partial y} + \frac{\partial A_z}{\partial z}$$
        $$\nabla f = \hat x\frac{\partial f}{\partial x} + \hat y\frac{\partial f}{\partial y} + \hat z\frac{\partial f}{\partial z}$$
        $$\begin{aligned}\nabla\times\mathbf A = {}&\hat x\Bigl(\frac{\partial A_z}{\partial y} - \frac{\partial A_y}{\partial z}\Bigr)\\ &+ \hat y\Bigl(\frac{\partial A_x}{\partial z} - \frac{\partial A_z}{\partial x}\Bigr)\\ &+ \hat z\Bigl(\frac{\partial A_y}{\partial x} - \frac{\partial A_x}{\partial y}\Bigr)\end{aligned}$$
        $$\nabla\cdot\nabla\times\mathbf A = 0 \qquad \nabla\times\nabla f = 0$$
        $$\nabla\times\nabla\times\mathbf A = \nabla(\nabla\cdot\mathbf A) - \nabla^2\mathbf A$$

        **What it is for.** Turning Maxwell's curl equations into the one-dimensional equations of a plane wave or a line: when the fields depend only on $z$, each curl component keeps a single $\partial/\partial z$ term. Derived in [Topic 2](#/l/w1-maxwell) and [Topic 5](#/l/w2-gamma).

        ### Field laws

        $$\mathbf F = q(\mathbf E + \mathbf v\times\mathbf B) = m\mathbf a = m\frac{\partial\mathbf v}{\partial t}$$
        $$\nabla\cdot\mathbf J + \frac{\partial\rho}{\partial t} = 0$$
        $$\oint_S\mathbf D\cdot d\mathbf S = \int_V\rho\,dV \qquad \nabla\cdot\mathbf D = \rho$$
        $$\oint_S\mathbf B\cdot d\mathbf S = 0 \qquad \nabla\cdot\mathbf B = 0$$
        $$\oint_C\mathbf H\cdot d\mathbf l = \int_S\mathbf J\cdot d\mathbf S + \frac{d}{dt}\int_S\mathbf D\cdot d\mathbf S$$
        $$\nabla\times\mathbf H = \mathbf J + \frac{\partial\mathbf D}{\partial t}$$
        $$\oint_C\mathbf E\cdot d\mathbf l = -\frac{d}{dt}\int_S\mathbf B\cdot d\mathbf S \qquad \nabla\times\mathbf E = -\frac{\partial\mathbf B}{\partial t}$$

        Boundary conditions ($\hat n$ points from region − into region +):
        $$\hat n\times(\mathbf E^+ - \mathbf E^-) = 0 \qquad \hat n\cdot(\mathbf D^+ - \mathbf D^-) = \rho_s$$
        $$\hat n\cdot(\mathbf B^+ - \mathbf B^-) = 0 \qquad \hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$$
        $$\mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat n$$

        For static conditions:
        $$\nabla\times\mathbf E = 0 \qquad \mathbf E = -\nabla V \qquad V_A - V_B = \int_A^B\mathbf E\cdot d\mathbf l$$
        $$\oint_C\mathbf E\cdot d\mathbf l = 0 \qquad \nabla^2V = -\rho/\epsilon \qquad C = Q/V$$

        **What it is for.** Faraday's and Ampère's laws are where everything on pages 2 and 3 starts ([Topic 2](#/l/w1-maxwell)). The boundary conditions give $\Gamma$ and $\tau$ (tangential $\mathbf E$ and $\mathbf H$ continuous, [Topic 11](#/l/w4-gamma)), the field of a current sheet ($\mathbf H$ jumps by $\mathbf J_s$, [Topic 10](#/l/w3-antenna)) and the current on a conductor's surface ($\mathbf J_s = \hat n\times\mathbf H$). The static lines give the voltage between two conductors and $C = Q/V$, which is how you get $\mathcal C$ of a line ([Topic 13](#/l/w5-telegraph)).

        ### Some static E fields (in a vacuum)

        - point charge $Q$ [C] at the origin: $\;\mathbf E = \hat r\dfrac{Q}{4\pi r^2\epsilon_0}$
        - line charge $\rho_l$ [C/m] along the $z$-axis: $\;\mathbf E = \hat r\dfrac{\rho_l}{2\pi r\epsilon_0}$
        - surface charge $\rho_s$ [C/m²] in the $z = 0$ plane: $\;\mathbf E = \pm\hat z\dfrac{\rho_s}{2\epsilon_0}$ (for $z \gtrless 0$)
        - slab charge $\rho$ [C/m³] at $-\tfrac W2 \le z \le \tfrac W2$:
        $$\mathbf E = \begin{cases}-\hat z\,\dfrac{\rho W}{2\epsilon_0} & z \le -\tfrac W2\\[4pt] \hat z\,\dfrac{\rho}{\epsilon_0}z & -\tfrac W2 \le z \le \tfrac W2\\[4pt] \hat z\,\dfrac{\rho W}{2\epsilon_0} & z \ge \tfrac W2\end{cases}$$
        - cylindrical charge $\rho$ [C/m³] of radius $R$ along the $z$-axis:
        $$\mathbf E = \begin{cases}\hat r\,\dfrac{\rho R^2}{2\epsilon_0r} & r \ge R\\[4pt] \hat r\,\dfrac{\rho}{2\epsilon_0}r & r \le R\end{cases}$$

        **What it is for.** Exam 1 material, kept for lines: the line-charge field gives the coax capacitance $\mathcal C = 2\pi\epsilon/\ln(b/a)$, and the sheet-charge field gives the parallel-plate $\mathcal C = \epsilon W/d$. Derived in [what you need from Exam 2](#/l/e3-refresh) and used in [Topic 13](#/l/w5-telegraph).

        ## Page 2

        ### Some static B fields (in a vacuum)

        - line current $I$ [A] along the $z$-axis: $\;\mathbf B = \hat\phi\dfrac{\mu_0I}{2\pi r}$
        - surface current $\mathbf J_s = J_s\hat x$ [A/m] at the $z = 0$ plane: $\;\mathbf B = \mp\hat y\dfrac{\mu_0J_s}{2}$ (for $z \gtrless 0$)
        - slab current $\mathbf J = J\hat x$ [A/m²] at $-\tfrac W2 \le z \le \tfrac W2$ (as printed):
        $$\mathbf B = \begin{cases}-\hat y\,\mu_0J\tfrac W2 & z \ge \tfrac W2\\[4pt] \hat y\,\mu_0Jz & -\tfrac W2 \le z \le \tfrac W2\\[4pt] \hat y\,\mu_0J\tfrac W2 & z \le -\tfrac W2\end{cases}$$

        !!trap The middle line has a sign typo
          Inside the slab the field is $-\hat y\,\mu_0Jz$, not $+\hat y\,\mu_0Jz$. Check it at the top face $z = W/2$: the printed middle line gives $+\hat y\,\mu_0JW/2$, but the line for $z \ge W/2$ gives $-\hat y\,\mu_0JW/2$, and $\mathbf B$ cannot jump where no surface current flows. Ampère's law, $-dB_y/dz = \mu_0J$, gives $B_y = -\mu_0Jz$ ([derivation](#/l/e3-derive)). The Exam 2 sheet on this site shows the corrected form.

        **What it is for.** The line-current field gives the coax inductance $\mathcal L = (\mu/2\pi)\ln(b/a)$ ([Topic 13](#/l/w5-telegraph)). The sheet field, $|\mathbf H| = J_s/2$ on each side, is the zero-frequency version of what a current-sheet antenna does ([Topic 10](#/l/w3-antenna)).

        ### E and B fields in material media

        $$\mathbf D = \epsilon_0\mathbf E + \mathbf P = \epsilon\mathbf E \qquad \mathbf H = \frac{\mathbf B}{\mu_0} - \mathbf M = \frac{\mathbf B}{\mu}$$
        $$\mathbf J_{\text{free}} = \sigma\mathbf E \qquad \rho_{\text{bound}} = -\nabla\cdot\mathbf P$$
        $$\mathbf J_{\text{bound}} = \nabla\times\mathbf M + \frac{d\mathbf P}{dt}$$
        $$\mathbf P = \epsilon_0\chi_e\mathbf E \qquad \mathbf M = \chi_m\mathbf H$$
        $$\epsilon = \epsilon_0\epsilon_r = \epsilon_0(1 + \chi_e)\ \text{[F/m]}$$
        $$\mu = \mu_0\mu_r = \mu_0(1 + \chi_m)\ \text{[H/m]}$$

        **What it is for.** $\mathbf J_{\text{free}} = \sigma\mathbf E$ is the one new piece on Exam 3: it is the **conduction current** that makes a material lossy, and it is where $\sigma$ enters $\gamma$ and $\eta$. $\epsilon$ and $\mu$ set the speed and the impedance. Derived in [Topic 5](#/l/w2-gamma).

        ### TEM waves (in perfect dielectrics)

        For $\mathbf E = E_x(z,t)\hat x$ generated by the source $\mathbf J_s = -J_s(t)\hat x$ at $z = 0$:
        $$\frac{\partial^2E_x}{\partial z^2} = \mu\epsilon\frac{\partial^2E_x}{\partial t^2}$$
        $$E_x(z,t) = \frac\eta2J_s\Bigl(t \mp \frac{z}{v_p}\Bigr)\quad(\text{for } z \gtrless 0)$$
        $$H_y(z,t) = \pm\frac12J_s\Bigl(t \mp \frac{z}{v_p}\Bigr)\quad(\text{for } z \gtrless 0)$$
        $$v_p = \frac{1}{\sqrt{\mu\epsilon}} \qquad c = \frac{1}{\sqrt{\mu_0\epsilon_0}} = 3\times10^8\ \text{m/s}$$
        $$\eta = \sqrt{\frac\mu\epsilon} \qquad \eta_0 = \sqrt{\frac{\mu_0}{\epsilon_0}} = 120\pi\ [\Omega]$$
        $$\hat e\times\hat h = \hat v_p \qquad \mathbf S = \mathbf E\times\mathbf H$$
        $$\nabla\cdot\mathbf S + \frac{\partial}{\partial t}\Bigl(\tfrac12\mathbf D\cdot\mathbf E + \tfrac12\mathbf B\cdot\mathbf H\Bigr) + \mathbf J\cdot\mathbf E = 0$$

        **What it is for.** A current sheet as an antenna: its $E$ is $\eta/2$ times the sheet current and its $H$ is $\pm\frac12$ of it. The rule $\hat e\times\hat h = \hat v_p$ gives the direction of $\mathbf H$ from $\mathbf E$ and the travel, or the travel from $\mathbf E$ and $\mathbf H$. The last line is the **Poynting theorem**, energy conservation for fields. Derived in [Topic 3](#/l/w1-poynting) and [Topic 10](#/l/w3-antenna).

        ### Cosinusoidal TEM waves (in material media)

        $$\frac{\partial^2E_x}{\partial z^2} = \mu\sigma\frac{\partial E_x}{\partial t} + \mu\epsilon\frac{\partial^2E_x}{\partial t^2}$$
        $$E_x(z,t) = E_0e^{\mp\alpha z}\cos(\omega t \mp \beta z + \phi)$$
        $$\tilde{\mathbf E} = \hat xE_0e^{\mp\gamma z}e^{j\phi}\quad(\text{for } z \gtrless 0)$$
        $$H_y(z,t) = \pm\frac{E_0}{|\eta|}e^{\mp\alpha z}\cos(\omega t \mp \beta z + \phi - \tau)$$
        $$\tilde{\mathbf H} = \pm\hat y\frac{E_0}{|\eta|}e^{\mp\gamma z}e^{j\phi}e^{-j\tau}\quad(\text{for } z \gtrless 0)$$
        $$\gamma = \alpha + j\beta = j\omega\sqrt{\mu(\epsilon - j\sigma/\omega)}$$
        $$\eta = \sqrt{\mu/(\epsilon - j\sigma/\omega)} = |\eta|e^{j\tau} \qquad \tau = \frac12\tan^{-1}\Bigl(\frac{\sigma}{\omega\epsilon}\Bigr)$$
        $$\eta\gamma = j\omega\mu \qquad \frac\gamma\eta = \sigma + j\omega\epsilon \qquad \langle\mathbf S\rangle = \frac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$$
        $$\sigma = \Re\{\gamma/\eta\} \qquad \mu = \gamma\eta/j\omega \qquad \epsilon = (1/\omega)\Im\{\gamma/\eta\}$$
        $$v_p = \frac\omega\beta = \lambda f \qquad \beta = \frac{2\pi}{\lambda} \qquad \omega = \frac{2\pi}{T} = 2\pi f$$

        The printed sheet has a stray "q" after $j\omega\epsilon$ in $\gamma/\eta = \sigma + j\omega\epsilon$. It is a typo; ignore it.

        **What it is for.** Any single-frequency wave in any material: build $\gamma$ and $\eta$ from $\sigma$, $\epsilon$, $\mu$, $\omega$; write $E$ and $H$ ($H$ lags $E$ by $\tau$); find the average power; or read the material back from a measured $\gamma$ and $\eta$. Derived in [Topic 1](#/l/w1-phasor), [Topic 4](#/l/w1-avg), [Topic 5](#/l/w2-gamma) and [Topic 6](#/l/w2-read).

        ## Page 3

        ### The three loss limits

        For $\sigma = 0$:
        $$\alpha = 0 \qquad \beta = \omega\sqrt{\mu\epsilon} \qquad |\eta| = \sqrt{\frac\mu\epsilon} \qquad \tau = 0$$
        For $1 \gg \dfrac{\sigma}{\omega\epsilon}$:
        $$\alpha \approx \frac\sigma2\sqrt{\frac\mu\epsilon} \qquad \beta = \omega\sqrt{\mu\epsilon}$$
        $$\eta \approx \sqrt{\frac\mu\epsilon}\Bigl(1 + j\frac{\sigma}{2\omega\epsilon}\Bigr)$$
        For $1 \ll \dfrac{\sigma}{\omega\epsilon}$:
        $$\alpha \approx \sqrt{\omega\mu\sigma/2} \qquad \beta \approx \alpha \qquad |\eta| = \sqrt{\frac{\omega\mu}{\sigma}} \qquad \tau \approx \frac\pi4$$

        **What it is for.** Compute the loss tangent $\sigma/\omega\epsilon$ first, then use the matching line instead of the exact square root. Derived in [Topic 7](#/l/w2-limits).

        ### Reflection and transmission

        $$\text{reflection coefficient: } \Gamma = \frac{E_r}{E_i} = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$$
        $$\text{transmission coefficient: } \tau = \frac{E_t}{E_i} = 1 + \Gamma$$

        **What it is for.** A wave hitting a flat boundary head-on (normal incidence), coming from medium 1: the reflected and transmitted fields at the boundary, then standing waves and the power split. Derived in [Topic 11](#/l/w4-gamma) and [Topic 12](#/l/w4-standing).

        ### Guided TEM waves on lossless transmission lines: time-domain equations

        $$-\frac{\partial V}{\partial z} = \mathcal L\frac{\partial I}{\partial t} \qquad -\frac{\partial I}{\partial z} = \mathcal C\frac{\partial V}{\partial t}$$
        $$\frac{\partial^2V}{\partial z^2} - \mathcal L\mathcal C\frac{\partial^2V}{\partial t^2} = 0$$
        $$\begin{aligned}V(z,t) = {}&\tau_g\sum_n(\Gamma_L\Gamma_g)^n\\ &\quad\times\delta\Bigl(t - \frac zv - n\frac{2l}{v}\Bigr)\\ &+ \tau_g\Gamma_L\sum_n(\Gamma_L\Gamma_g)^n\\ &\quad\times\delta\Bigl(t + \frac zv - (n+1)\frac{2l}{v}\Bigr)\end{aligned}$$
        $$\begin{aligned}I(z,t) = {}&\frac{\tau_g}{Z_0}\sum_n(\Gamma_L\Gamma_g)^n\\ &\quad\times\delta\Bigl(t - \frac zv - n\frac{2l}{v}\Bigr)\\ &- \frac{\tau_g}{Z_0}\Gamma_L\sum_n(\Gamma_L\Gamma_g)^n\\ &\quad\times\delta\Bigl(t + \frac zv - (n+1)\frac{2l}{v}\Bigr)\end{aligned}$$
        $$Z_0 = \sqrt{\frac{\mathcal L}{\mathcal C}} = \sqrt{\frac\mu\epsilon}\,\frac{1}{GF} = \pm\frac{V^\pm}{I^\pm}$$
        $$v_p = \frac{1}{\sqrt{\mathcal L\mathcal C}} = \frac{1}{\sqrt{\mu\epsilon}}$$
        $$\tau_g = \frac{Z_0}{R_g + Z_0} \qquad \Gamma_L = \frac{R_L - Z_0}{R_L + Z_0} \qquad \Gamma_g = \frac{R_g - Z_0}{R_g + Z_0}$$

        **What it is for.** Bounce diagrams: what the generator launches ($\tau_g$), what each end sends back ($\Gamma_L$, $\Gamma_g$), and the speed and $Z_0$ of a line from its geometry ($GF$ is the geometric factor). The two sums are the line's response to an **impulse** $v_g(t) = \delta(t)$; for a step or a pulse, replace each $\delta(\cdot)$ by that input's shape. Derived in [Topic 13](#/l/w5-telegraph), [Topic 14](#/l/w5-launch), [Topic 15](#/l/w5-bounce) and [Topic 16](#/l/w5-multi).

        ### Phasor equations

        $$-\frac{\partial\tilde V}{\partial z} = j\omega\mathcal L\tilde I \qquad -\frac{\partial\tilde I}{\partial z} = j\omega\mathcal C\tilde V$$
        $$\frac{\partial^2\tilde V}{\partial z^2} - (j\omega)^2\mathcal L\mathcal C\tilde V = 0$$
        $$\begin{aligned}\tilde V(d) &= \tilde V^+e^{j\beta d} + \tilde V^-e^{-j\beta d}\\ &= \tilde V^+e^{j\beta d}(1 + \Gamma_Le^{-j2\beta d})\\ &= \tilde V^+e^{j\beta d}(1 + \Gamma(d))\end{aligned}$$
        $$\begin{aligned}\tilde I(d) &= \tilde I^+e^{j\beta d} + \tilde I^-e^{-j\beta d}\\ &= \frac{\tilde V^+}{Z_0}e^{j\beta d}(1 - \Gamma_Le^{-j2\beta d})\\ &= \frac{\tilde V^+}{Z_0}e^{j\beta d}(1 - \Gamma(d))\end{aligned}$$
        $$Z(d) = \frac{\tilde V(d)}{\tilde I(d)} = Z_0\frac{1 + \Gamma(d)}{1 - \Gamma(d)} = Y\Bigl(d \pm \frac\lambda4\Bigr)$$
        $$z(d) = \frac{Z(d)}{Z_0} = \frac{1}{y(d)} = z\Bigl(d \pm \frac\lambda2\Bigr) = r(d) + jx(d)$$
        $$\begin{aligned}P(d) &= \tfrac12\Re\{\tilde V(d)\tilde I^*(d)\}\\ &= \frac{|\tilde V^+|^2}{2Z_0} - \frac{|\tilde V^-|^2}{2Z_0} = \tfrac12\Re\{\tilde V_L\tilde I_L^*\}\end{aligned}$$
        $$VSWR = \frac{|\tilde V(d)|_{max}}{|\tilde V(d)|_{min}} = \frac{1 + |\Gamma_L|}{1 - |\Gamma_L|} = z(d_{max})$$
        $$\tilde V(l) = \tilde F\frac{Z(l)}{Z_g + Z(l)} \qquad \Gamma_L = \frac{V_L^-}{V_L^+} = |\Gamma_L|e^{j\theta_L}$$

        Read $Z(d) = Y(d \pm \tfrac\lambda4)$ in normalized form, $z(d) = y(d \pm \tfrac\lambda4)$: a quarter wavelength turns an impedance into its inverse. In ohms, $Z(d \pm \tfrac\lambda4) = Z_0^2/Z(d)$. $\tilde F$ is the generator's phasor voltage and $Z_g$ its impedance; $Y = 1/Z$ and $Y_0 = 1/Z_0$.

        **What it is for.** A line driven by a sinusoid, in steady state: voltage and current anywhere on it, the impedance looking toward the load, the power delivered, the standing-wave ratio, and the input voltage from the generator circuit. Derived in [Topic 17](#/l/w6-vd) and [Topic 19](#/l/w6-qw).

        ### Short and open

        For a short-circuit load, $Z_L = 0$:
        $$\tilde V(d) = j2\tilde V^+\sin(\beta d) \qquad Z(d) = jZ_0\tan(\beta d)$$
        For an open-circuit load, $Z_L = \infty$:
        $$\tilde V(d) = 2\tilde V^+\cos(\beta d) \qquad Y(d) = jY_0\tan(\beta d)$$

        **What it is for.** Stubs: a shorted or open line is a pure reactance, so it can resonate, and it can block or pass one frequency (a filter). Derived in [Topic 18](#/l/w6-stubs).
      `),
      R(md`
        ## Not on the sheet: carry these on your card

        The sheet is silent on all of the following, and Prof. Chen's exams use them. Each one is explained, with its trap, in [What to write on your 4×6 card](#/l/e3-card). Same symbols as the sheet.

        **Constants and quick numbers**
        - $\mu_0 = 4\pi\times10^{-7}$ H/m and $\epsilon_0 = \dfrac{10^{-9}}{36\pi}$ F/m (the sheet gives only $c$ and $\eta_0$). $\mu_0c = \eta_0$ and $\epsilon_0c\eta_0 = 1$, so $\omega\mu_0 = k_0\eta_0$ and $\omega\epsilon_0 = k_0/\eta_0$ with $k_0 = \omega/c$.
        - $c = 0.3$ m/ns; at 300 MHz, $\lambda_0 = 1$ m. Loss tangent in one step: $\dfrac{\sigma}{\omega\epsilon} = \dfrac{60\,\sigma\lambda_0}{\epsilon_r}$ ($\sigma$ in S/m, $\lambda_0$ in m). [Topic 7](#/l/w2-limits)

        **Phasors** ([Topic 1](#/l/w1-phasor), [Topic 4](#/l/w1-avg))
        - $\sin x = \cos(x - 90°)$, so $\sin\leftrightarrow -j$; $\tfrac1j = -j$; $\sqrt j = e^{j45°} = \tfrac{1+j}{\sqrt2}$.
        - Time average of a product: $\langle\Re\{Ae^{j\omega t}\}\,\Re\{Be^{j\omega t}\}\rangle = \tfrac12\Re\{AB^*\}$.

        **Lossy media and power** ([Topic 7](#/l/w2-limits), [Topic 8](#/l/w2-loss))
        - Skin depth $\delta = 1/\alpha$; for a good conductor $\delta = \dfrac{1}{\sqrt{\pi f\mu\sigma}}$, so $\gamma = \dfrac{1+j}{\delta}$ and $\eta = \dfrac{1+j}{\sigma\delta}$.
        - Power of one lossy wave: $\langle S\rangle = \dfrac{E_0^2}{2|\eta|}\cos\tau\,e^{-2\alpha z}$. Field falls as $e^{-\alpha z}$, power as $e^{-2\alpha z}$.
        - Loss in decibels: $10\log_{10}\dfrac{P_1}{P_2} = 8.686\,\alpha z$ dB (1 Np = 8.686 dB).
        - Surface resistance $R_s = \dfrac{1}{\sigma\delta} = \sqrt{\dfrac{\pi f\mu}{\sigma}}$; loss per area $\tfrac12R_s|\tilde J_s|^2$ with $\tilde{\mathbf J}_s = \hat n\times\tilde{\mathbf H}$ at the surface. A good-conductor mirror absorbs the fraction $4R_s/\eta_0$.

        **Polarization and antennas** ([Topic 9](#/l/w3-pol), [Topic 10](#/l/w3-antenna))
        - Linear: components in phase or $180°$ apart. Circular: equal sizes, $90°$ apart. Anything else: elliptical.
        - Handedness: write $\tilde{\mathbf E} = \mathbf a + j\mathbf b$ at one plane. $\mathbf E$ turns from $\mathbf a$ toward $-\mathbf b$, so its spin axis is $\mathbf b\times\mathbf a$. Along the travel: right-handed. Against: left-handed. For travel toward $+z$, $\hat x - j\hat y$ is right-handed.
        - A reflected circular wave has the **opposite** handedness: it keeps turning the same way but travels the other way.
        - A sheet $\tilde{\mathbf J}_s$ at $z = z_s$ radiates $\tilde{\mathbf E} = -\dfrac\eta2\tilde{\mathbf J}_se^{-j\beta|z - z_s|}$ on both sides, and $\tilde{\mathbf H} = \tfrac12\tilde{\mathbf J}_s\times\hat n\,e^{-j\beta|z - z_s|}$ ($\hat n$ from the sheet toward the point).

        **Reflection** ([Topic 11](#/l/w4-gamma), [Topic 12](#/l/w4-standing))
        - The reflected $\tilde H$ carries $-\Gamma$. Power fractions: $|\Gamma|^2$ reflected, $1 - |\Gamma|^2 = \dfrac{\eta_1}{\eta_2}|\tau|^2$ transmitted (lossless media).
        - Standing-wave envelope: maximum $(1 + |\Gamma|)E_0$, minimum $(1 - |\Gamma|)E_0$, a quarter wavelength apart. $\Gamma < 0$ puts a minimum on the boundary.
        - Radiation pressure: $2\langle S_i\rangle/c$ on a perfect mirror, $\langle S_i\rangle/c$ on a perfect absorber.

        **Lines in time** ([Topic 13](#/l/w5-telegraph), [Topic 14](#/l/w5-launch), [Topic 16](#/l/w5-multi))
        - Geometric factor: parallel plate $GF = W/d$; coax $GF = 2\pi/\ln(b/a)$. Then $\mathcal L = \mu/GF$, $\mathcal C = \epsilon GF$; coax $Z_0 = \dfrac{60}{\sqrt{\epsilon_r}}\ln\dfrac ba$.
        - Current reflects with $-\Gamma$. A junction to two lines in parallel sees $Z_{0b}\|Z_{0c}$.
        - Steady state (after all the bounces, for a DC source): the line disappears, $V = V_g\dfrac{R_L}{R_g + R_L}$.

        **Lines in phasors** ([Topic 17](#/l/w6-vd), [Topic 18](#/l/w6-stubs), [Topic 19](#/l/w6-qw))
        - $Z_{in} = Z_0\dfrac{Z_L + jZ_0\tan\beta l}{Z_0 + jZ_L\tan\beta l}$. A $\lambda/4$ line inverts ($Z_{in} = Z_0^2/Z_L$); a $\lambda/2$ line repeats ($Z_{in} = Z_L$).
        - Quarter-wave matching: $Z_0 = \sqrt{R_{in}R_L}$.
        - Shorted stub: $Z = 0$ at $f = \dfrac{nv}{2l}$, $Z = \infty$ at $f = \dfrac{(2n-1)v}{4l}$. Open stub: the other way round.
        - Power to the load: $P_L = \dfrac{|\tilde V^+|^2}{2Z_0}(1 - |\Gamma_L|^2)$.

        ### Check: do you know the sheet?
      `),
      Q(md`In the sheet's line $H_y(z,t) = \pm\frac{E_0}{|\eta|}e^{\mp\alpha z}\cos(\omega t \mp \beta z + \phi - \tau)$, the symbol $\tau$ is…`,
        [md`the angle of $\eta$, from $\eta = |\eta|e^{j\tau}$`, md`the transmission coefficient $1 + \Gamma$`, md`the injection coefficient $Z_0/(R_g + Z_0)$`, md`a time delay, in seconds`], 0,
        [null, md`That $\tau$ is on page 3 and belongs to a boundary between two media. Here $\tau$ sits inside a cosine next to $\phi$, so it is an angle.`, md`That is $\tau_g$. It always carries its subscript and belongs to transmission lines.`, md`It is added to $\omega t$, which is an angle in radians. A delay would appear as $t - t_0$ inside the argument.`],
        md`Page 2 defines $\eta = |\eta|e^{j\tau}$ with $\tau = \frac12\tan^{-1}(\sigma/\omega\epsilon)$. Dividing $\tilde E$ by $\eta$ subtracts $\tau$ from the phase, so $H$ lags $E$ by $\tau$.`),
      Q(md`On page 3 the sheet writes $z(d) = Z(d)/Z_0$. In this line, $z(d)$ is…`,
        ['the normalized impedance, a pure number', 'the position on the line, in meters', 'the impedance looking toward the load, in ohms', 'the distance from the generator, in wavelengths'], 0,
        [null, md`In the phasor section the position is $d$. The same letter $z$ is the position only in the time-domain section.`, md`That is $Z(d)$, capital. Dividing by $Z_0$ removes the ohms.`, md`$Z(d)/Z_0$ is a ratio of two impedances, not a distance.`],
        md`$z(d) = Z(d)/Z_0 = \frac{1 + \Gamma(d)}{1 - \Gamma(d)} = r(d) + jx(d)$: the impedance in units of $Z_0$. A matched load has $z = 1$.`),
      Q(md`Which of these is **not** on the official sheet, so it has to go on your card?`,
        [md`the skin depth $\delta = 1/\sqrt{\pi f\mu\sigma}$`, md`$\tau \approx \pi/4$ for a good conductor`, md`$\langle\mathbf S\rangle = \frac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$`, md`$VSWR = \frac{1 + |\Gamma_L|}{1 - |\Gamma_L|}$`, md`$Z_0 = \sqrt{\mu/\epsilon}\,\frac{1}{GF}$`], 0,
        [null, md`That is on page 3, in the good-conductor line ($1 \ll \sigma/\omega\epsilon$).`, md`That is on page 2, next to $\eta\gamma = j\omega\mu$.`, md`That is on page 3, in the phasor section.`, md`That is on page 3, in the time-domain section (only the formula for $GF$ itself is missing).`],
        md`The sheet gives $\alpha \approx \sqrt{\omega\mu\sigma/2}$ but never names $\delta = 1/\alpha$. With $\omega = 2\pi f$, $\delta = 1/\sqrt{\pi f\mu\sigma}$. Put it on your card.`),
      Q(md`The sheet's sum $V(z,t) = \tau_g\sum_n(\Gamma_L\Gamma_g)^n\delta(\cdots) + \cdots$ is the line's response to which generator voltage?`,
        [md`a unit impulse, $v_g(t) = \delta(t)$`, md`a unit step, $v_g(t) = u(t)$`, md`a cosine, $v_g(t) = \cos\omega t$`, md`any $v_g(t)$, with no change`], 0,
        [null, md`A step response is made of steps, not spikes. For a step, replace each $\delta(\cdot)$ by $u(\cdot)$ with the same argument.`, md`A cosine in steady state is the phasor section's job, with $\tilde F$.`, md`The sum is built from $\delta$'s. For another input, replace every $\delta(\cdot)$ by the input's own shape, with the same argument.`],
        md`Each term is one trip along the line: $\tau_g$ launches it, and every round trip multiplies it by $\Gamma_L\Gamma_g$ and delays it by $2l/v$. The line is linear, so any other input just replaces the spike by its own shape.`),
      Q(md`Inside the slab of current $\mathbf J = J\hat x$ ($-\tfrac W2 \le z \le \tfrac W2$), which $\mathbf B$ is correct?`,
        [md`$-\hat y\,\mu_0Jz$`, md`$+\hat y\,\mu_0Jz$, as printed`, md`$-\hat y\,\mu_0J\tfrac W2$ at every point inside`, md`$0$ at every point inside`], 0,
        [null, md`At $z = W/2$ that gives $+\hat y\,\mu_0JW/2$, but the sheet's own line just above the slab is $-\hat y\,\mu_0JW/2$. $\mathbf B$ cannot jump where there is no surface current.`, md`That is the field just above the slab. Inside, the current below you and above you partly cancel, so the field shrinks to 0 at the middle.`, md`That is true only on the mid-plane $z = 0$.`],
        md`Ampère's law, $x$-component: $-dB_y/dz = \mu_0J$, so $B_y = -\mu_0Jz$, zero in the middle by symmetry. It joins $-\mu_0JW/2$ at the top face. The printed $+\hat y\,\mu_0Jz$ is a sign typo.`),
      Q(md`The sheet writes $Z(d) = Y(d \pm \tfrac\lambda4)$. Which statement is right?`,
        [md`$z(d) = y(d \pm \tfrac\lambda4)$: it holds for the normalized values`, md`it holds in ohms exactly as written`, md`$Z(d) = Z(d \pm \tfrac\lambda4)$`, md`$Z(d) = 1/Z(d \pm \tfrac\lambda4)$, in ohms`], 0,
        [null, md`$Z$ is in ohms and $Y$ in siemens. They can only be equal as pure numbers, after dividing by $Z_0$ and $Y_0$.`, md`Impedance repeats every $\lambda/2$, not every $\lambda/4$.`, md`Units again: $1/Z$ is in siemens. In ohms the rule is $Z(d \pm \tfrac\lambda4) = Z_0^2/Z(d)$.`],
        md`Over a quarter wavelength $\Gamma(d) = \Gamma_Le^{-j2\beta d}$ turns by $2\beta\cdot\tfrac\lambda4 = \pi$, so $\Gamma \to -\Gamma$, and $\frac{1+\Gamma}{1-\Gamma}$ becomes its inverse: $z(d \pm \tfrac\lambda4) = 1/z(d) = y(d)$.`),
      Q(md`In the sheet's phasor section, the distance $d$ is measured…`,
        ['from the load back toward the generator', 'from the generator toward the load', 'from the nearest voltage maximum', 'in wavelengths, from the generator'], 0,
        [null, md`That is the $z$ of the time-domain section. In phasors, $d = 0$ is the load, because $\Gamma(0) = \Gamma_L$.`, md`$d = 0$ gives $\Gamma(d) = \Gamma_L$: the origin is the load, wherever the maxima are.`, md`$d$ is a length in meters; $\beta d$ turns it into an angle. And it starts at the load.`],
        md`$\Gamma(d) = \Gamma_Le^{-j2\beta d}$ equals $\Gamma_L$ at $d = 0$. So $d$ starts at the load and grows toward the generator, which sits at $d = l$: that is why the input voltage is $\tilde V(l)$.`),
      Q(md`In $\Gamma = \dfrac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$, medium 1 is…`,
        ['the medium the incident wave travels in', md`the medium with the larger $\eta$`, 'the medium the transmitted wave travels in', 'free space, always'], 0,
        [null, md`Either medium can have the larger $\eta$; that only sets the sign of $\Gamma$.`, md`That is medium 2. Swapping the media flips the sign of $\Gamma$.`, md`Medium 1 is wherever the wave starts. It can be glass, water or a conductor.`],
        md`$\Gamma = E_r/E_i$ at the boundary. The incident and reflected waves are in medium 1; the transmitted wave is in medium 2. Going from a high $\eta$ into a low one ($\eta_2 < \eta_1$) gives $\Gamma < 0$.`),
    ],
  });

  // ================================================================ 2. every formula on pages 2 and 3, derived
  EM.lesson('e3-x', {
    id: 'e3-derive', order: 2, kind: 'read', title: 'Every formula on the sheet, derived', ref: 'sheet pages 2 and 3',
    sub: 'Pages 2 and 3 rebuilt from Maxwell and Kirchhoff, one line at a time',
    steps: [
      R(md`
        Every formula on pages 2 and 3 of the [official sheet](#/l/e3-sheet), rebuilt from first principles. The only starting points are Maxwell's equations and the boundary conditions from page 1, Ohm's law at a point ($\mathbf J = \sigma\mathbf E$), the phasor rule ($\partial/\partial t \to j\omega$), and Euler's formula $e^{jx} = \cos x + j\sin x$. Each derivation is compact: one move per line, a short sentence saying the move, every step shown, a check at the end, and a link to the lesson that builds it slowly, with pictures and practice.

        !!method How to use this page
          1. When a line of the sheet feels like magic, read its derivation here, then do the full lesson.
          2. The night before the exam, cover a derivation, rebuild the boxed result on paper, then compare. If you can rebuild it, you will also remember its signs.

        ## Page 2: static B fields

        ### The line current: $\mathbf B = \hat\phi\,\mu_0I/2\pi r$

        A long straight wire on the $z$-axis carries $I$ toward $+z$. By symmetry $\mathbf H = H_\phi(r)\hat\phi$: it circles the wire and depends only on the distance $r$. Take a circle of radius $r$ as the path in Ampère's law (static, so no $d/dt$ term):
        $$\oint_C\mathbf H\cdot d\mathbf l = I$$
        Along the circle $d\mathbf l = \hat\phi\,r\,d\phi$ and $H_\phi$ is constant, so the integral is $H_\phi$ times the circumference:
        $$H_\phi\cdot2\pi r = I$$
        Divide by $2\pi r$ and multiply by $\mu_0$:
        $$\boxed{\mathbf B = \hat\phi\,\frac{\mu_0I}{2\pi r}}$$
        **Check.** Right thumb along $+z$: the fingers curl along $+\hat\phi$ ✓. Twice as far away, half the field ✓. Full lesson: [what you need from Exam 2](#/l/e3-refresh).

        ### The current sheet: $\mathbf B = \mp\hat y\,\mu_0J_s/2$

        A sheet on $z = 0$ carries $\mathbf J_s = J_s\hat x$ (amperes per meter of width). Mirror the picture through $z = 0$: the sheet looks the same, so $\mathbf B$ has the same size on both sides and points opposite ways, along $\pm\hat y$. Take a rectangle in the $yz$-plane, length $L$ along $y$, one long side above the sheet and one below. Going around it, both long sides run along $\mathbf H$, the short sides are perpendicular to $\mathbf H$, and the enclosed current is $J_sL$:
        $$\oint\mathbf H\cdot d\mathbf l = HL + HL = J_sL$$
        Solve:
        $$H = \frac{J_s}{2}$$
        For the direction use $\mathbf H = \tfrac12\mathbf J_s\times\hat n$, with $\hat n$ pointing from the sheet toward the point. Above the sheet $\hat n = \hat z$, and $\hat x\times\hat z = -\hat y$:
        $$\boxed{\mathbf B = \mp\hat y\,\frac{\mu_0J_s}{2}\quad(z \gtrless 0)}$$
        **Check.** $\mathbf H^+ - \mathbf H^- = -J_s\hat y$, and $\hat z\times(-J_s\hat y) = J_s\hat x = \mathbf J_s$: the boundary condition on page 1 ✓. Full lesson: [Topic 10](#/l/w3-antenna).

        ### The slab current, and the sign typo

        A slab $-\tfrac W2 \le z \le \tfrac W2$ carries $\mathbf J = J\hat x$ (A/m²). Inside, use Ampère's law at a point, $\nabla\times\mathbf B = \mu_0\mathbf J$. Its $x$-component, from the curl on page 1:
        $$\frac{\partial B_z}{\partial y} - \frac{\partial B_y}{\partial z} = \mu_0J$$
        There is no $B_z$, and $B_y$ depends only on $z$:
        $$\frac{dB_y}{dz} = -\mu_0J$$
        Integrate. By the mirror symmetry of the slab $B_y = 0$ on the mid-plane, so the constant is zero:
        $$\boxed{B_y = -\mu_0Jz\quad(\text{inside})}$$
        Outside, the whole slab acts like one sheet with $J_s = JW$, so $B_y = \mp\mu_0JW/2$ above and below.

        **Check.** At the top face $z = W/2$ the inside formula gives $-\mu_0JW/2$, the same as just outside ✓. The sheet prints the inside line as $+\hat y\,\mu_0Jz$, which fails this check: that sign is a typo.

        ## Page 2: material media

        ### $\mathbf D$, $\mathbf H$, $\epsilon$ and $\mu$

        Matter adds **bound** charge and current to the free ones. Where the polarization $\mathbf P$ (dipole moment per volume) spreads out, it leaves charge behind:
        $$\rho_{\text{bound}} = -\nabla\cdot\mathbf P$$
        Gauss's law in its vacuum form counts every charge, free and bound:
        $$\nabla\cdot(\epsilon_0\mathbf E) = \rho - \nabla\cdot\mathbf P$$
        Move the $\mathbf P$ term to the left:
        $$\nabla\cdot(\epsilon_0\mathbf E + \mathbf P) = \rho$$
        The bracket depends only on the free charge $\rho$, so it gets a name:
        $$\boxed{\mathbf D = \epsilon_0\mathbf E + \mathbf P}$$
        In a linear material $\mathbf P = \epsilon_0\chi_e\mathbf E$. Substitute and factor:
        $$\mathbf D = \epsilon_0(1 + \chi_e)\mathbf E = \epsilon\mathbf E$$
        Magnetism goes the same way. Ampère's law in its vacuum form counts the bound current $\nabla\times\mathbf M + \partial\mathbf P/\partial t$ too:
        $$\begin{aligned}\nabla\times\frac{\mathbf B}{\mu_0} = {}&\mathbf J + \nabla\times\mathbf M\\ &+ \frac{\partial\mathbf P}{\partial t} + \epsilon_0\frac{\partial\mathbf E}{\partial t}\end{aligned}$$
        Move $\nabla\times\mathbf M$ to the left, and combine the two time derivatives into $\partial\mathbf D/\partial t$:
        $$\nabla\times\Bigl(\frac{\mathbf B}{\mu_0} - \mathbf M\Bigr) = \mathbf J + \frac{\partial\mathbf D}{\partial t}$$
        The bracket is $\mathbf H = \mathbf B/\mu_0 - \mathbf M$. With $\mathbf M = \chi_m\mathbf H$, this gives $\mathbf B = \mu_0(1 + \chi_m)\mathbf H = \mu\mathbf H$. Last, the free current in a conductor is Ohm's law at a point: the field drives the charges at a drift speed proportional to $\mathbf E$, so $\mathbf J_{\text{free}} = \sigma\mathbf E$.

        **Check.** Vacuum: $\mathbf P = \mathbf M = 0$, so $\mathbf D = \epsilon_0\mathbf E$ and $\mathbf H = \mathbf B/\mu_0$ ✓. Full lesson: [Topic 5](#/l/w2-gamma).

        ## Page 2: TEM waves in perfect dielectrics

        ### The two wave equations

        Take a plane wave, $\mathbf E = E_x(z,t)\hat x$ and $\mathbf H = H_y(z,t)\hat y$, depending only on $z$ and $t$. Faraday's law, $y$-component: $(\nabla\times\mathbf E)_y = \partial E_x/\partial z - \partial E_z/\partial x$, and only the first term survives:
        $$\frac{\partial E_x}{\partial z} = -\mu\frac{\partial H_y}{\partial t}\qquad\text{(1)}$$
        Ampère's law, $x$-component, with $\mathbf J = \sigma\mathbf E$: $(\nabla\times\mathbf H)_x = \partial H_z/\partial y - \partial H_y/\partial z$, and only the second term survives:
        $$-\frac{\partial H_y}{\partial z} = \sigma E_x + \epsilon\frac{\partial E_x}{\partial t}\qquad\text{(2)}$$
        Differentiate (1) with respect to $z$ (the order of the $z$- and $t$-derivatives does not matter):
        $$\frac{\partial^2E_x}{\partial z^2} = -\mu\frac{\partial}{\partial t}\frac{\partial H_y}{\partial z}$$
        Equation (2) says what $-\partial H_y/\partial z$ is. Substitute it:
        $$\boxed{\frac{\partial^2E_x}{\partial z^2} = \mu\sigma\frac{\partial E_x}{\partial t} + \mu\epsilon\frac{\partial^2E_x}{\partial t^2}}$$
        That is the line for material media. A perfect dielectric has $\sigma = 0$:
        $$\boxed{\frac{\partial^2E_x}{\partial z^2} = \mu\epsilon\frac{\partial^2E_x}{\partial t^2}}$$
        **Check.** Units: $\mu\epsilon$ is $1/(\text{m/s})^2$, so both sides of the last line are (V/m)/m² ✓. Full lessons: [what you need from Exam 2](#/l/e3-refresh), [Topic 2](#/l/w1-maxwell).

        ### $v_p = 1/\sqrt{\mu\epsilon}$ and $c$

        Guess a shape $f$ that slides along $z$ at speed $v$ without changing: $E_x = f(t - z/v)$. Write $f'$ and $f''$ for the derivatives of $f$ with respect to its argument. Each $z$-derivative brings a factor $-1/v$ (chain rule):
        $$\frac{\partial^2E_x}{\partial z^2} = \Bigl(-\frac1v\Bigr)^2f'' = \frac{f''}{v^2}$$
        Each $t$-derivative brings a factor 1:
        $$\frac{\partial^2E_x}{\partial t^2} = f''$$
        The wave equation needs $f''/v^2 = \mu\epsilon f''$, so
        $$\boxed{v_p = \frac{1}{\sqrt{\mu\epsilon}}}$$
        In vacuum, with $\mu_0 = 4\pi\times10^{-7}$ and $\epsilon_0 = 10^{-9}/36\pi$, the $\pi$'s cancel:
        $$\mu_0\epsilon_0 = \frac{4\pi\times10^{-16}}{36\pi} = \frac{10^{-16}}{9}$$
        So $c = 1/\sqrt{\mu_0\epsilon_0} = 3\times10^8$ m/s ✓. The same steps work for $f(t + z/v)$, a shape moving toward $-z$.

        **Check.** In glass with $\epsilon_r = 4$, $v_p = c/2$: a denser material, a slower wave ✓. Full lesson: [what you need from Exam 2](#/l/e3-refresh).

        ### $\eta = \sqrt{\mu/\epsilon}$ and $\eta_0 = 120\pi$

        Put $E_x = f(t - z/v)$ into (1). The left side brings $-1/v$:
        $$-\frac1vf' = -\mu\frac{\partial H_y}{\partial t}$$
        Integrate both sides in time ($f'$ integrates to $f$):
        $$H_y = \frac{f}{\mu v}$$
        With $v = 1/\sqrt{\mu\epsilon}$, $\mu v = \mu/\sqrt{\mu\epsilon} = \sqrt{\mu/\epsilon}$. So the ratio of $E_x$ to $H_y$ is a constant of the material:
        $$\boxed{\eta = \frac{E_x}{H_y} = \sqrt{\frac\mu\epsilon}}$$
        In vacuum:
        $$\frac{\mu_0}{\epsilon_0} = 4\pi\times10^{-7}\cdot36\pi\times10^9 = 144\pi^2\times10^2$$
        Its root is $12\pi\times10 = 120\pi\ \Omega$ ✓. For $f(t + z/v)$ the left side brings $+1/v$, which gives $H_y = -E_x/\eta$.

        **Check.** Units: $\sqrt{(\text{H/m})/(\text{F/m})} = \sqrt{\text{H/F}} = \Omega$ ✓. Full lesson: [what you need from Exam 2](#/l/e3-refresh).
      `),
      RF(md`
        ### The sheet source: $E_x = \frac\eta2J_s(t \mp z/v_p)$

        [[fig:sheet]]

        A sheet on $z = 0$ carries $\mathbf J_s = -J_s(t)\hat x$. Nothing comes in from far away, so the only waves are the two leaving the sheet: $f(t - z/v)$ above it and $g(t + z/v)$ below it.

        **Condition 1.** Tangential $\mathbf E$ is continuous at $z = 0$, so both waves start with the same field there. Call it $E(t)$.

        **Condition 2.** $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$ with $\hat n = \hat z$. Since $\hat z\times\hat y = -\hat x$:
        $$-\hat x\,(H_y^+ - H_y^-) = -J_s(t)\,\hat x$$
        So $H_y$ jumps up by $J_s(t)$ across the sheet:
        $$H_y^+ - H_y^- = J_s(t)$$
        **Now use $\eta$.** The upward wave has $H_y^+ = E/\eta$; the downward one has $H_y^- = -E/\eta$:
        $$\frac{E}{\eta} + \frac{E}{\eta} = J_s(t)$$
        Solve for the field at the sheet:
        $$E(t) = \frac\eta2J_s(t)$$
        Each wave carries it away with its own delay $|z|/v_p$:
        $$\boxed{E_x = \frac\eta2J_s\Bigl(t \mp \frac{z}{v_p}\Bigr)\quad(z \gtrless 0)}$$
        and $H_y = \pm E_x/\eta = \pm\frac12J_s(t \mp z/v_p)$.

        **Check.** The ½: the sheet feeds two waves, and their two $H$'s share the jump $J_s$ equally. $\mathbf E$ is the same on both sides (even in $z$) while $\mathbf H$ flips (odd), so $\mathbf E\times\mathbf H$ points away from the sheet on both sides ✓. Full lesson: [Topic 10](#/l/w3-antenna).

        ### $\hat e\times\hat h = \hat v_p$

        For the forward wave $H_y = +E_x/\eta$. When $E_x > 0$, $\hat e = \hat x$ and $\hat h = \hat y$:
        $$\hat x\times\hat y = \hat z = \hat v_p$$
        For the backward wave $H_y = -E_x/\eta$, so $\hat h = -\hat y$:
        $$\hat x\times(-\hat y) = -\hat z = \hat v_p$$
        Both give the direction of travel. Nothing here depended on calling the field direction $x$, so for any TEM wave
        $$\boxed{\hat e\times\hat h = \hat v_p}$$
        **Use.** Given $\mathbf E$ and the travel, $\mathbf H$ points along $\hat v_p\times\hat e$. Given $\mathbf E$ and $\mathbf H$, the wave travels along $\hat e\times\hat h$.

        **Check.** $\hat v_p\times\hat e = \hat z\times\hat x = \hat y$ for the forward wave ✓. Full lesson: [Topic 3](#/l/w1-poynting).

        ### $\mathbf S = \mathbf E\times\mathbf H$ and the Poynting theorem

        Start from the product rule for the divergence of a cross product (a vector identity, like $(fg)' = f'g + fg'$):
        $$\nabla\cdot(\mathbf E\times\mathbf H) = \mathbf H\cdot\nabla\times\mathbf E - \mathbf E\cdot\nabla\times\mathbf H$$
        Replace the two curls by Faraday's and Ampère's laws:
        $$\begin{aligned}\nabla\cdot(\mathbf E\times\mathbf H) = {}&-\mathbf H\cdot\frac{\partial\mathbf B}{\partial t}\\ &- \mathbf E\cdot\mathbf J - \mathbf E\cdot\frac{\partial\mathbf D}{\partial t}\end{aligned}$$
        In a linear material $\mathbf B = \mu\mathbf H$, and the product rule run backward gives
        $$\mathbf H\cdot\frac{\partial\mathbf B}{\partial t} = \mu\mathbf H\cdot\frac{\partial\mathbf H}{\partial t} = \frac{\partial}{\partial t}\Bigl(\tfrac12\mathbf B\cdot\mathbf H\Bigr)$$
        The same step with $\mathbf D = \epsilon\mathbf E$ gives $\mathbf E\cdot\partial\mathbf D/\partial t = \partial(\tfrac12\mathbf D\cdot\mathbf E)/\partial t$. Name $\mathbf S = \mathbf E\times\mathbf H$ and move everything to the left:
        $$\boxed{\begin{aligned}\nabla\cdot\mathbf S &+ \frac{\partial}{\partial t}\Bigl(\tfrac12\mathbf D\cdot\mathbf E + \tfrac12\mathbf B\cdot\mathbf H\Bigr)\\ &+ \mathbf J\cdot\mathbf E = 0\end{aligned}}$$
        **Read it at a point.** Power flowing out, plus the growth of the stored energy, plus the power turned into heat, is zero: energy is conserved, and $\mathbf S$ (W/m²) is the flow of power.

        **Check.** Units: $\mathbf J\cdot\mathbf E$ is (A/m²)(V/m) = W/m³, and $\nabla\cdot\mathbf S$ is (W/m²)/m = W/m³ ✓. Full lesson: [Topic 3](#/l/w1-poynting).
      `, { sheet: { svg: sheetFig(), cap: 'A current sheet seen edge-on. $\\mathbf E$ is the same on both sides; $\\mathbf H$ flips, so $\\mathbf E\\times\\mathbf H$ points away from the sheet on both sides.' } }),
      R(md`
        ## Page 2: cosinusoidal TEM waves in material media

        ### The phasor wave equation and $\gamma$

        At one frequency every field is $\Re\{\text{phasor}\times e^{j\omega t}\}$, and $\partial/\partial t$ becomes multiplication by $j\omega$ ([Topic 1](#/l/w1-phasor)). Do that to the material wave equation:
        $$\frac{d^2\tilde E_x}{dz^2} = \bigl(j\omega\mu\sigma + (j\omega)^2\mu\epsilon\bigr)\tilde E_x$$
        Factor out $j\omega\mu$:
        $$\frac{d^2\tilde E_x}{dz^2} = j\omega\mu(\sigma + j\omega\epsilon)\,\tilde E_x$$
        The coefficient is one complex constant; call it $\gamma^2$. To match the sheet, pull $j\omega$ out of the bracket, using $1/j = -j$:
        $$\sigma + j\omega\epsilon = j\omega\Bigl(\epsilon - j\frac\sigma\omega\Bigr)$$
        So $\gamma^2 = (j\omega)^2\mu(\epsilon - j\sigma/\omega)$. Take the root whose real and imaginary parts are positive:
        $$\boxed{\gamma = \alpha + j\beta = j\omega\sqrt{\mu(\epsilon - j\sigma/\omega)}}$$
        **Check.** $\sigma = 0$ gives $\gamma = j\omega\sqrt{\mu\epsilon}$: no decay, and $\beta = \omega/v_p$, as on Exam 2 ✓. Full lesson: [Topic 5](#/l/w2-gamma).

        ### $E_x(z,t)$ and $\tilde{\mathbf E}$

        The equation says: second derivative = $\gamma^2$ times the function. Exponentials do that, since $(\mp\gamma)^2 = \gamma^2$:
        $$\tilde E_x = E^+e^{-\gamma z} + E^-e^{+\gamma z}$$
        Take the wave above the sheet, $e^{-\gamma z}$, and write its constant as a size and a phase, $E^+ = E_0e^{j\phi}$:
        $$\tilde{\mathbf E} = \hat xE_0e^{-\gamma z}e^{j\phi}$$
        Multiply by $e^{j\omega t}$ and split $\gamma = \alpha + j\beta$:
        $$\tilde E_xe^{j\omega t} = E_0e^{-\alpha z}e^{j(\omega t - \beta z + \phi)}$$
        $E_0e^{-\alpha z}$ is real, and $\Re\{e^{j\theta}\} = \cos\theta$:
        $$\boxed{E_x = E_0e^{-\alpha z}\cos(\omega t - \beta z + \phi)}$$
        Below the sheet the wave is $e^{+\gamma z}$: those are the lower signs on the sheet.

        **Check.** The crest moves toward $+z$ (see $v_p$ below), and the amplitude shrinks the way the wave goes ✓. Full lesson: [Topic 5](#/l/w2-gamma).

        ### $\eta$, $\eta\gamma = j\omega\mu$ and $\gamma/\eta = \sigma + j\omega\epsilon$

        Faraday's law (1) in phasors is $d\tilde E_x/dz = -j\omega\mu\tilde H_y$. For the forward wave the derivative pulls down $-\gamma$:
        $$-\gamma\tilde E_x = -j\omega\mu\tilde H_y$$
        So $\tilde E_x/\tilde H_y$ is the same constant everywhere. That constant is $\eta$:
        $$\eta \equiv \frac{\tilde E_x}{\tilde H_y} = \frac{j\omega\mu}{\gamma}\quad\Rightarrow\quad\boxed{\eta\gamma = j\omega\mu}$$
        Ampère's law (2) in phasors is $d\tilde H_y/dz = -(\sigma + j\omega\epsilon)\tilde E_x$. The same move:
        $$-\gamma\tilde H_y = -(\sigma + j\omega\epsilon)\tilde E_x$$
        $$\eta = \frac{\gamma}{\sigma + j\omega\epsilon}\quad\Rightarrow\quad\boxed{\frac\gamma\eta = \sigma + j\omega\epsilon}$$
        Now put $\gamma$ into $\eta = j\omega\mu/\gamma$. The $j\omega$ cancels, and $\mu/\sqrt\mu = \sqrt\mu$:
        $$\boxed{\eta = \sqrt{\frac{\mu}{\epsilon - j\sigma/\omega}}}$$
        **Read the material back.** The real and imaginary parts of $\gamma/\eta = \sigma + j\omega\epsilon$ give $\sigma = \Re\{\gamma/\eta\}$ and $\epsilon = (1/\omega)\Im\{\gamma/\eta\}$, and $\eta\gamma = j\omega\mu$ gives $\mu = \gamma\eta/j\omega$.

        **Check.** $\sigma = 0$ gives $\eta = \sqrt{\mu/\epsilon}$ ✓. Units: $\gamma/\eta$ is (1/m)/Ω = S/m, the units of $\sigma$ ✓. Full lessons: [Topic 5](#/l/w2-gamma), [Topic 6](#/l/w2-read).

        ### $\tau = \frac12\tan^{-1}(\sigma/\omega\epsilon)$ and the two $H$ lines

        Square $\eta$ and pull $\epsilon$ out of the bottom:
        $$\eta^2 = \frac{\mu/\epsilon}{1 - j\sigma/\omega\epsilon}$$
        The number $1 - j\sigma/\omega\epsilon$ is a right triangle: 1 along the real axis and $\sigma/\omega\epsilon$ down. Its angle is $-\theta$, with
        $$\theta = \tan^{-1}\frac{\sigma}{\omega\epsilon}$$
        It sits in the denominator, so $\eta^2$ has the angle $+\theta$. The square root halves the angle:
        $$\boxed{\tau = \frac12\tan^{-1}\Bigl(\frac{\sigma}{\omega\epsilon}\Bigr)}$$
        Now $\tilde H_y = \tilde E_x/\eta$, and dividing by $|\eta|e^{j\tau}$ divides the size and subtracts the angle:
        $$\tilde H_y = \frac{E_0}{|\eta|}e^{-\gamma z}e^{j\phi}e^{-j\tau}$$
        Back to time, exactly as for $E$:
        $$\boxed{H_y = \frac{E_0}{|\eta|}e^{-\alpha z}\cos(\omega t - \beta z + \phi - \tau)}$$
        For the backward wave the derivative pulls down $+\gamma$, and (1) gives $\tilde H_y = -\tilde E_x/\eta$: that is the $\pm$ in front.

        **Check.** $\tan^{-1}$ stays below $90°$, so $\tau$ stays below $45°$, and the good-conductor value $\tau \approx \pi/4$ is the limit ✓. $H$ lags $E$ ✓. Full lesson: [Topic 5](#/l/w2-gamma).

        ### $\langle\mathbf S\rangle = \frac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$

        The real fields are $\mathbf E = \Re\{\tilde{\mathbf E}e^{j\omega t}\}$ and $\mathbf H = \Re\{\tilde{\mathbf H}e^{j\omega t}\}$. For any complex number $X$, $\Re\{X\} = \frac12(X + X^*)$, so
        $$\mathbf E = \tfrac12\bigl(\tilde{\mathbf E}e^{j\omega t} + \tilde{\mathbf E}^*e^{-j\omega t}\bigr)$$
        and the same for $\mathbf H$. Multiply out $\mathbf E\times\mathbf H$: four terms, with a factor $\frac14$. Two of them carry $e^{\pm j2\omega t}$; they oscillate and average to zero over a period. The other two have no $t$ in them:
        $$\langle\mathbf S\rangle = \tfrac14\bigl(\tilde{\mathbf E}\times\tilde{\mathbf H}^* + \tilde{\mathbf E}^*\times\tilde{\mathbf H}\bigr)$$
        The second term is the conjugate of the first, and $X + X^* = 2\Re\{X\}$:
        $$\boxed{\langle\mathbf S\rangle = \tfrac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}}$$
        **For one lossy wave** (not on the sheet): in $\tilde{\mathbf E}\times\tilde{\mathbf H}^*$, the factor $e^{-\gamma z}(e^{-\gamma z})^*$ is $e^{-2\alpha z}$ (the $\beta$ phases cancel), and $e^{-j\tau}$ conjugates to $e^{+j\tau}$:
        $$\langle\mathbf S\rangle = \hat z\frac{E_0^2}{2|\eta|}\cos\tau\,e^{-2\alpha z}$$
        **Check.** Lossless: $E_0^2/2\eta$, half the peak $E_0^2/\eta$, because $\cos^2$ averages to $\frac12$ ✓. Full lesson: [Topic 4](#/l/w1-avg).

        ### $v_p = \omega/\beta = \lambda f$, $\beta = 2\pi/\lambda$, $\omega = 2\pi/T = 2\pi f$

        Ride on a crest: its phase $\omega t - \beta z + \phi$ stays constant. Differentiate that in time:
        $$\omega - \beta\frac{dz}{dt} = 0$$
        So the crest moves at
        $$\boxed{v_p = \frac{dz}{dt} = \frac\omega\beta}$$
        Freeze time. The cosine repeats when $\beta z$ grows by $2\pi$, and that distance is the wavelength: $\beta\lambda = 2\pi$, so $\beta = 2\pi/\lambda$. Now sit at one $z$. The cosine repeats when $\omega t$ grows by $2\pi$, and that time is the period: $\omega T = 2\pi$, and with $f = 1/T$, $\omega = 2\pi f$. Combine:
        $$v_p = \frac{\omega}{\beta} = \frac{2\pi f}{2\pi/\lambda} = \lambda f$$
        **Check.** 300 MHz in vacuum: $\lambda = c/f = 1$ m ✓. Loss makes $\beta$ larger than $\omega\sqrt{\mu\epsilon}$, so a lossy wave is slower ✓. Full lesson: [Topic 1](#/l/w1-phasor).
      `),
      R(md`
        ## Page 3: the three loss limits

        ### $\sigma = 0$

        $\gamma = j\omega\sqrt{\mu\epsilon}$ is purely imaginary, so $\alpha = 0$ and $\beta = \omega\sqrt{\mu\epsilon}$. $\eta = \sqrt{\mu/\epsilon}$ is real, so $|\eta| = \sqrt{\mu/\epsilon}$ and $\tau = 0$.

        ### Low loss: $1 \gg \sigma/\omega\epsilon$

        Call the loss tangent $x = \sigma/\omega\epsilon$. Pull $\epsilon$ out of the root:
        $$\gamma = j\omega\sqrt{\mu\epsilon}\,\sqrt{1 - jx}$$
        For a small $u$, $\sqrt{1 + u} \approx 1 + u/2$. With $u = -jx$:
        $$\gamma \approx j\omega\sqrt{\mu\epsilon}\Bigl(1 - j\frac x2\Bigr)$$
        Multiply out, using $j\cdot(-j) = 1$:
        $$\gamma \approx \omega\sqrt{\mu\epsilon}\,\frac x2 + j\omega\sqrt{\mu\epsilon}$$
        The real part simplifies: $\omega\sqrt{\mu\epsilon}\cdot\frac{\sigma}{2\omega\epsilon} = \frac\sigma2\sqrt{\frac\mu\epsilon}$. So
        $$\boxed{\alpha \approx \frac\sigma2\sqrt{\frac\mu\epsilon}} \qquad \boxed{\beta \approx \omega\sqrt{\mu\epsilon}}$$
        For $\eta$, use $(1 + u)^{-1/2} \approx 1 - u/2$ with the same $u = -jx$:
        $$\boxed{\eta \approx \sqrt{\frac\mu\epsilon}\Bigl(1 + j\frac{\sigma}{2\omega\epsilon}\Bigr)}$$
        **Check.** $\alpha$ is $\frac\sigma2$ times the lossless $\eta$, with no $\omega$ in it ✓. The angle of $\eta$ is about $x/2$, which is $\tau = \frac12\tan^{-1}x$ for a small $x$ ✓. Full lesson: [Topic 7](#/l/w2-limits).

        ### Good conductor: $1 \ll \sigma/\omega\epsilon$

        Now the conduction current wins by far, so drop $\epsilon$ next to $\sigma/\omega$:
        $$\epsilon - j\frac\sigma\omega \approx -j\frac\sigma\omega$$
        Then
        $$\gamma \approx j\omega\sqrt{-j\mu\sigma/\omega}$$
        Bring $j\omega$ inside the root as $(j\omega)^2 = -\omega^2$; then $-\omega^2\cdot(-j\mu\sigma/\omega) = j\omega\mu\sigma$:
        $$\gamma \approx \sqrt{j\omega\mu\sigma}$$
        Since $\sqrt j = e^{j45°} = \frac{1 + j}{\sqrt2}$:
        $$\gamma \approx \sqrt{\omega\mu\sigma}\,\frac{1 + j}{\sqrt2}$$
        The real and imaginary parts are equal:
        $$\boxed{\alpha \approx \beta \approx \sqrt{\omega\mu\sigma/2}}$$
        For $\eta$, divide $j\omega\mu$ by this $\gamma$:
        $$\eta \approx \frac{j\omega\mu}{\sqrt{j\omega\mu\sigma}} = \sqrt{\frac{j\omega\mu}{\sigma}}$$
        Its size is $\sqrt{\omega\mu/\sigma}$, and its angle is the angle of $\sqrt j$:
        $$\boxed{|\eta| = \sqrt{\frac{\omega\mu}{\sigma}}} \qquad \boxed{\tau \approx \frac\pi4}$$
        **Check.** With the skin depth $\delta = 1/\alpha$, $\gamma = (1 + j)/\delta$ and $\lambda = 2\pi/\beta = 2\pi\delta$: the wave dies within about one wavelength ✓. Full lesson: [Topic 7](#/l/w2-limits).
      `),
      RF(md`
        ## Page 3: reflection and transmission

        ### $\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$ and $\tau = 1 + \Gamma$

        [[fig:boundary]]

        Medium 1 ($z < 0$) holds the incident and the reflected wave; medium 2 ($z > 0$) holds the transmitted one. At $z = 0$, write each $\tilde H$ from its $\tilde E$ with $\hat e\times\hat h = \hat v_p$. The reflected wave travels toward $-z$, so its $\tilde H$ flips:
        $$\tilde H_i = \frac{\tilde E_i}{\eta_1} \qquad \tilde H_r = -\frac{\tilde E_r}{\eta_1} \qquad \tilde H_t = \frac{\tilde E_t}{\eta_2}$$
        No surface current flows on an ordinary boundary, so tangential $\tilde E$ and tangential $\tilde H$ are both continuous:
        $$\tilde E_i + \tilde E_r = \tilde E_t$$
        $$\frac{\tilde E_i - \tilde E_r}{\eta_1} = \frac{\tilde E_t}{\eta_2}$$
        Put the first into the second and multiply by $\eta_1\eta_2$:
        $$\eta_2(\tilde E_i - \tilde E_r) = \eta_1(\tilde E_i + \tilde E_r)$$
        Collect $\tilde E_i$ on the left and $\tilde E_r$ on the right:
        $$\tilde E_i(\eta_2 - \eta_1) = \tilde E_r(\eta_2 + \eta_1)$$
        $$\boxed{\Gamma = \frac{\tilde E_r}{\tilde E_i} = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}}$$
        Divide the first condition by $\tilde E_i$: $1 + \Gamma = \tilde E_t/\tilde E_i$.
        $$\boxed{\tau = \frac{\tilde E_t}{\tilde E_i} = 1 + \Gamma}$$
        **Check.** Same media: $\Gamma = 0$, $\tau = 1$ ✓. A perfect conductor ($\eta_2 = 0$): $\Gamma = -1$ and $\tau = 0$, so the total $E$ on the wall is zero ✓. Full lesson: [Topic 11](#/l/w4-gamma).
      `, { boundary: { svg: boundaryFig(), cap: 'Normal incidence. The incident and reflected waves share medium 1; the transmitted wave is in medium 2. All three fields are taken at $z = 0$.' } }),
      RF(md`
        ## Page 3: lines in the time domain

        ### The telegrapher's equations, from the fields

        [[fig:plates]]

        Take two parallel plates of width $W$ and gap $d$, with $W \gg d$ so the field between them is uniform. A TEM wave runs along $z$ between them: $E_x$ points from the + plate to the − plate, and $H_y$ runs across. The voltage is the field times the gap ($V_A - V_B = \int_A^B\mathbf E\cdot d\mathbf l$), and the current is the surface current $|\hat n\times\mathbf H| = H_y$ times the width:
        $$V = E_xd \qquad I = H_yW$$
        Faraday's law (1), with $E_x = V/d$ and $H_y = I/W$:
        $$\frac1d\frac{\partial V}{\partial z} = -\frac\mu W\frac{\partial I}{\partial t}$$
        Multiply by $-d$:
        $$-\frac{\partial V}{\partial z} = \frac{\mu d}{W}\frac{\partial I}{\partial t} = \mathcal L\frac{\partial I}{\partial t}$$
        Ampère's law (2) with $\sigma = 0$, the same substitution, then multiply by $W$:
        $$-\frac{\partial I}{\partial z} = \frac{\epsilon W}{d}\frac{\partial V}{\partial t} = \mathcal C\frac{\partial V}{\partial t}$$
        Name the geometric factor $GF = W/d$. Then
        $$\boxed{\mathcal L = \frac{\mu}{GF}} \qquad \boxed{\mathcal C = \epsilon\,GF}$$
        Another cross-section only changes $GF$ (coax: $GF = 2\pi/\ln(b/a)$). Differentiate the first equation in $z$ and substitute the second, exactly as for $E_x$:
        $$\frac{\partial^2V}{\partial z^2} - \mathcal L\mathcal C\frac{\partial^2V}{\partial t^2} = 0$$
        **Check.** Each meter of line reads like an inductor ($v = L\,di/dt$) and a capacitor ($i = C\,dv/dt$) ✓. Full lesson: [Topic 13](#/l/w5-telegraph).

        ### $Z_0$, $v_p$ and $\pm V^\pm/I^\pm$

        The wave equation for $V$ is the one for $E_x$ with $\mu\epsilon$ replaced by $\mathcal L\mathcal C$, so $V = f(t \mp z/v)$ with
        $$v_p = \frac{1}{\sqrt{\mathcal L\mathcal C}}$$
        And $\mathcal L\mathcal C = \frac{\mu}{GF}\cdot\epsilon\,GF = \mu\epsilon$, so $v_p = 1/\sqrt{\mu\epsilon}$: the wave on the line moves at the speed of light in its filling. Now find $I$. Put $V = f(t - z/v)$ into the second telegrapher's equation:
        $$-\frac{\partial I}{\partial z} = \mathcal Cf'$$
        Integrate in $z$. Since $\partial f/\partial z = -f'/v$, the function whose $z$-derivative is $-\mathcal Cf'$ is $\mathcal Cvf$:
        $$I = \mathcal Cv\,f = \frac{V}{Z_0}$$
        with
        $$Z_0 = \frac{1}{\mathcal Cv} = \frac{\sqrt{\mathcal L\mathcal C}}{\mathcal C} = \sqrt{\frac{\mathcal L}{\mathcal C}}$$
        In terms of the fields, $\mathcal L/\mathcal C = \mu/(\epsilon\,GF^2)$:
        $$\boxed{Z_0 = \sqrt{\frac{\mathcal L}{\mathcal C}} = \sqrt{\frac\mu\epsilon}\,\frac{1}{GF}}$$
        For $f(t + z/v)$ the sign flips, $I^- = -V^-/Z_0$. Together: $Z_0 = \pm V^\pm/I^\pm$.

        **Check.** Parallel plates: $Z_0 = \eta\,d/W$, the wave impedance times gap over width ✓. Full lesson: [Topic 13](#/l/w5-telegraph).

        ### $\tau_g$, $\Gamma_L$ and $\Gamma_g$

        **Launch.** At $t = 0^+$ the wave has not reached the load, so the generator sees only the line, and the forward wave obeys $V = Z_0I$: the line looks like a resistor $Z_0$. Voltage divider:
        $$V^+ = V_g\frac{Z_0}{R_g + Z_0} = \tau_gV_g$$
        **Load.** At $z = l$ the total voltage and current obey Ohm's law, $V^+ + V^- = R_L(I^+ + I^-)$. Use $I^+ = V^+/Z_0$ and $I^- = -V^-/Z_0$:
        $$V^+ + V^- = \frac{R_L}{Z_0}(V^+ - V^-)$$
        Multiply by $Z_0$ and collect $V^-$ on the left:
        $$V^-(Z_0 + R_L) = V^+(R_L - Z_0)$$
        $$\boxed{\Gamma_L = \frac{V^-}{V^+} = \frac{R_L - Z_0}{R_L + Z_0}}$$
        **Generator.** A returning wave meets $R_g$ in series with the source. The source has already launched its own wave, so by superposition the returning wave sees $R_g$ alone (set $V_g = 0$). The same algebra with $R_g$ in place of $R_L$:
        $$\boxed{\Gamma_g = \frac{R_g - Z_0}{R_g + Z_0}}$$
        **Check.** Matched load, $R_L = Z_0$: $\Gamma_L = 0$, nothing comes back ✓. Short: $-1$. Open: $+1$ ✓. Full lesson: [Topic 14](#/l/w5-launch).

        ### The bounce sums $V(z,t)$ and $I(z,t)$

        Let the generator voltage be a unit impulse, $v_g(t) = \delta(t)$. The line launches
        $$\tau_g\,\delta\Bigl(t - \frac zv\Bigr)$$
        It reaches the load at $t = l/v$ and reflects with $\Gamma_L$. The reflected spike travels toward $-z$, and it must be at $z = l$ at $t = l/v$:
        $$\tau_g\Gamma_L\,\delta\Bigl(t + \frac zv - \frac{2l}{v}\Bigr)$$
        Check the argument: at $z = l$ it is zero when $t = l/v$ ✓, and at $z = 0$ when $t = 2l/v$ ✓. At the generator it reflects with $\Gamma_g$ and starts over, one round trip $2l/v$ late:
        $$\tau_g\Gamma_L\Gamma_g\,\delta\Bigl(t - \frac zv - \frac{2l}{v}\Bigr)$$
        Every round trip multiplies by $\Gamma_L\Gamma_g$ and adds $2l/v$. Summing over $n$ round trips gives the two sums on the sheet: forward spikes $\tau_g(\Gamma_L\Gamma_g)^n$ and backward spikes $\tau_g\Gamma_L(\Gamma_L\Gamma_g)^n$. The current is $+V/Z_0$ for forward waves and $-V/Z_0$ for backward ones: that is the minus sign in $I(z,t)$.

        **Check.** The line is linear and does not change with time, so for a step input every $\delta$ becomes a $u$: that is a bounce diagram ✓. Full lessons: [Topic 15](#/l/w5-bounce), [Topic 16](#/l/w5-multi).
      `, { plates: { svg: plateFig(), cap: 'A parallel-plate line seen end-on, the wave traveling into the page. $V = E_xd$ between the plates; $I = H_yW$ flows into the page on the + plate and back on the − plate.' } }),
      R(md`
        ## Page 3: lines in phasors

        ### The phasor equations

        At one frequency, $\partial/\partial t \to j\omega$ in both telegrapher's equations:
        $$-\frac{d\tilde V}{dz} = j\omega\mathcal L\tilde I \qquad -\frac{d\tilde I}{dz} = j\omega\mathcal C\tilde V$$
        Differentiate the first in $z$ and substitute the second:
        $$\frac{d^2\tilde V}{dz^2} = -j\omega\mathcal L\frac{d\tilde I}{dz} = (j\omega)^2\mathcal L\mathcal C\,\tilde V$$
        The exponentials $e^{\mp j\beta z}$ solve it: their second derivative brings $(\mp j\beta)^2 = -\beta^2$, which matches $(j\omega)^2\mathcal L\mathcal C = -\omega^2\mathcal L\mathcal C$ when
        $$\beta = \omega\sqrt{\mathcal L\mathcal C} = \frac{\omega}{v_p}$$
        **Check.** That is $\omega\sqrt{\mu\epsilon}$ for the material filling the line ✓. Full lesson: [Topic 17](#/l/w6-vd).

        ### $\tilde V(d)$ and $\Gamma(d)$

        The general solution is $\tilde V = Ae^{-j\beta z} + Be^{+j\beta z}$. The load is at $z = l$; measure $d = l - z$ back from it. Then $e^{-j\beta z} = e^{-j\beta l}e^{j\beta d}$, and the constant $e^{-j\beta l}$ goes into the amplitude:
        $$\tilde V(d) = \tilde V^+e^{j\beta d} + \tilde V^-e^{-j\beta d}$$
        Factor out the forward term:
        $$\tilde V(d) = \tilde V^+e^{j\beta d}\Bigl(1 + \frac{\tilde V^-}{\tilde V^+}e^{-j2\beta d}\Bigr)$$
        At the load ($d = 0$) the ratio is $\Gamma_L = \tilde V^-/\tilde V^+ = V_L^-/V_L^+$. Name the whole second term:
        $$\Gamma(d) = \Gamma_Le^{-j2\beta d}$$
        $$\boxed{\tilde V(d) = \tilde V^+e^{j\beta d}\bigl(1 + \Gamma(d)\bigr)}$$
        **Check.** $|\Gamma(d)| = |\Gamma_L|$ at every $d$; only its angle turns, by $2\beta d$ ✓. Full lesson: [Topic 17](#/l/w6-vd).

        ### $\tilde I(d)$

        With $d = l - z$, a $z$-derivative is minus a $d$-derivative, so the first telegrapher's equation reads $d\tilde V/dd = j\omega\mathcal L\tilde I$. Solve for $\tilde I$ and differentiate $\tilde V(d)$ term by term:
        $$\tilde I = \frac{1}{j\omega\mathcal L}\bigl(j\beta\tilde V^+e^{j\beta d} - j\beta\tilde V^-e^{-j\beta d}\bigr)$$
        The $j$'s cancel, and $\frac{\beta}{\omega\mathcal L} = \frac{\sqrt{\mathcal L\mathcal C}}{\mathcal L} = \sqrt{\frac{\mathcal C}{\mathcal L}} = \frac{1}{Z_0}$:
        $$\tilde I(d) = \frac{\tilde V^+}{Z_0}e^{j\beta d} - \frac{\tilde V^-}{Z_0}e^{-j\beta d}$$
        So $\tilde I^+ = \tilde V^+/Z_0$ and $\tilde I^- = -\tilde V^-/Z_0$. Factor as before:
        $$\boxed{\tilde I(d) = \frac{\tilde V^+}{Z_0}e^{j\beta d}\bigl(1 - \Gamma(d)\bigr)}$$
        **Check.** The minus sign: the backward wave's current flows toward the generator ✓. Full lesson: [Topic 17](#/l/w6-vd).

        ### $Z(d)$, $z(d)$, $\Gamma_L$ from $Z_L$, and the $\lambda/4$ and $\lambda/2$ rules

        Divide $\tilde V(d)$ by $\tilde I(d)$. The common factor $\tilde V^+e^{j\beta d}$ cancels:
        $$\boxed{Z(d) = Z_0\frac{1 + \Gamma(d)}{1 - \Gamma(d)}}$$
        At the load, $Z(0) = Z_L$. Solve $Z_L(1 - \Gamma_L) = Z_0(1 + \Gamma_L)$ for $\Gamma_L$:
        $$\Gamma_L = \frac{Z_L - Z_0}{Z_L + Z_0}$$
        **A quarter wavelength.** Moving by $\lambda/4$ turns $\Gamma(d)$ by $2\beta\cdot\frac\lambda4 = 2\cdot\frac{2\pi}{\lambda}\cdot\frac\lambda4 = \pi$, so $\Gamma \to -\Gamma$:
        $$z\Bigl(d \pm \frac\lambda4\Bigr) = \frac{1 - \Gamma(d)}{1 + \Gamma(d)} = \frac{1}{z(d)} = y(d)$$
        That is the sheet's $Z(d) = Y(d \pm \lambda/4)$, read in normalized units. **A half wavelength** turns $\Gamma$ by $2\pi$, so nothing changes: $z(d \pm \lambda/2) = z(d)$.

        **Check.** A $\lambda/4$ line ending in a short ($z = 0$) looks open ($z = \infty$) ✓. Full lessons: [Topic 17](#/l/w6-vd), [Topic 19](#/l/w6-qw).

        ### $P(d) = \frac{|\tilde V^+|^2}{2Z_0} - \frac{|\tilde V^-|^2}{2Z_0}$

        Average power, exactly as for $\langle\mathbf S\rangle$: $P = \frac12\Re\{\tilde V\tilde I^*\}$. Call the forward part $a = \tilde V^+e^{j\beta d}$ and the backward part $b = \tilde V^-e^{-j\beta d}$, so $\tilde V = a + b$ and $Z_0\tilde I = a - b$:
        $$Z_0\tilde V\tilde I^* = (a + b)(a^* - b^*) = |a|^2 - |b|^2 + (ba^* - ab^*)$$
        The bracket is $w - w^*$ with $w = ba^*$, and $w - w^* = 2j\Im\{w\}$ is purely imaginary, so it drops out of the real part. And $|a| = |\tilde V^+|$, $|b| = |\tilde V^-|$:
        $$\boxed{P(d) = \frac{|\tilde V^+|^2}{2Z_0} - \frac{|\tilde V^-|^2}{2Z_0}}$$
        No $d$ is left: on a lossless line the same power passes every point, including the load, so it also equals $\frac12\Re\{\tilde V_L\tilde I_L^*\}$.

        **Check.** With $|\tilde V^-| = |\Gamma_L||\tilde V^+|$: $P = \frac{|\tilde V^+|^2}{2Z_0}(1 - |\Gamma_L|^2)$, the forward power minus the reflected power ✓. Full lesson: [Topic 17](#/l/w6-vd).

        ### $VSWR = \frac{1 + |\Gamma_L|}{1 - |\Gamma_L|} = z(d_{max})$

        Take sizes in $\tilde V(d) = \tilde V^+e^{j\beta d}(1 + \Gamma(d))$, with $|e^{j\beta d}| = 1$:
        $$|\tilde V(d)| = |\tilde V^+|\,|1 + \Gamma(d)|$$
        $\Gamma(d)$ has the fixed size $|\Gamma_L|$ and an angle that turns with $d$. The sum $1 + \Gamma(d)$ is longest when $\Gamma(d)$ points along $+1$, and shortest when it points along $-1$:
        $$|\tilde V|_{max} = |\tilde V^+|(1 + |\Gamma_L|) \qquad |\tilde V|_{min} = |\tilde V^+|(1 - |\Gamma_L|)$$
        Divide:
        $$\boxed{VSWR = \frac{1 + |\Gamma_L|}{1 - |\Gamma_L|}}$$
        At $d_{max}$, $\Gamma(d) = +|\Gamma_L|$ is real, so $z(d_{max}) = \frac{1 + |\Gamma_L|}{1 - |\Gamma_L|}$, the same number.

        **Check.** Matched load: VSWR = 1. Short or open: $\infty$ ✓. Full lesson: [Topic 17](#/l/w6-vd).

        ### $\tilde V(l) = \tilde F\frac{Z(l)}{Z_g + Z(l)}$

        At the generator end ($d = l$) the line and its load act as one impedance, $Z(l)$. The source $\tilde F$, with its impedance $Z_g$, drives it, so a voltage divider gives the input voltage:
        $$\boxed{\tilde V(l) = \tilde F\frac{Z(l)}{Z_g + Z(l)}}$$
        Then $\tilde V^+$ follows from $\tilde V(l) = \tilde V^+e^{j\beta l}(1 + \Gamma(l))$, and with it the voltage everywhere.

        **Check.** A matched line with $Z_g = Z_0$: $Z(l) = Z_0$ and $\tilde V(l) = \tilde F/2$ ✓. Full lesson: [Topic 19](#/l/w6-qw).

        ### Short and open

        **Short**, $Z_L = 0$, so $\Gamma_L = -1$. Using $e^{jx} - e^{-jx} = 2j\sin x$:
        $$\tilde V(d) = \tilde V^+(e^{j\beta d} - e^{-j\beta d}) = j2\tilde V^+\sin\beta d$$
        The current has a plus sign, and $e^{jx} + e^{-jx} = 2\cos x$:
        $$\tilde I(d) = \frac{\tilde V^+}{Z_0}(e^{j\beta d} + e^{-j\beta d}) = \frac{2\tilde V^+}{Z_0}\cos\beta d$$
        Divide:
        $$\boxed{Z(d) = jZ_0\tan\beta d}$$
        **Open**, $Z_L = \infty$, so $\Gamma_L = +1$. The roles swap: $\tilde V(d) = 2\tilde V^+\cos\beta d$ and $\tilde I(d) = j\frac{2\tilde V^+}{Z_0}\sin\beta d$. Divide the other way:
        $$\boxed{Y(d) = \frac{\tilde I(d)}{\tilde V(d)} = jY_0\tan\beta d}$$
        **Check.** Both are purely imaginary, so no average power goes into a short or an open ✓. A short seen through $\lambda/4$: $\tan90° = \infty$, an open ✓. Full lesson: [Topic 18](#/l/w6-stubs).

        ### Check: can you rebuild them?
      `),
      Q(md`To derive $\Gamma = \frac{\eta_2 - \eta_1}{\eta_2 + \eta_1}$, which two conditions do you use at the boundary?`,
        [md`tangential $\tilde E$ continuous and tangential $\tilde H$ continuous`, md`normal $\tilde D$ continuous and normal $\tilde B$ continuous`, md`tangential $\tilde E$ continuous and $\tilde H$ jumping by $\tilde J_s$`, 'conservation of power alone'], 0,
        [null, md`A TEM wave at normal incidence has no normal components, so those conditions only say $0 = 0$.`, md`That is the condition at a current sheet. An ordinary boundary between two materials carries no surface current.`, md`Power gives one equation, $|\Gamma|^2 + \frac{\eta_1}{\eta_2}|\tau|^2 = 1$, and it cannot fix the sign of $\Gamma$.`],
        md`$\tilde E_i + \tilde E_r = \tilde E_t$ and $(\tilde E_i - \tilde E_r)/\eta_1 = \tilde E_t/\eta_2$: two equations for the two unknowns $\tilde E_r$ and $\tilde E_t$.`),
      Q(md`Where does the $\frac12$ in $E_x = \frac\eta2J_s(t \mp z/v_p)$ come from?`,
        [md`the jump $J_s$ in $H_y$ is shared by two waves, one on each side`, md`the time average of $\cos^2$`, md`the square root in $\eta = \sqrt{\mu/\epsilon}$`, 'half of the current flows on each face of the sheet'], 0,
        [null, md`This holds for any waveform $J_s(t)$, at every instant; nothing is averaged.`, md`$\eta$ appears whole; the $\frac12$ is a separate factor.`, md`An ideal sheet has no thickness and no faces. The $\frac12$ comes from $H_y^+ - H_y^- = J_s$ with $H_y^\pm = \pm E/\eta$.`],
        md`$E/\eta - (-E/\eta) = J_s$, so $2E/\eta = J_s$ and $E = \eta J_s/2$.`),
      Q(md`In $P(d) = \frac12\Re\{\tilde V\tilde I^*\}$, why do the terms with $e^{\pm j2\beta d}$ drop out?`,
        [md`together they form $w - w^*$, which is purely imaginary`, 'they are zero at the load, so they are zero everywhere', 'they average to zero over one period in time', md`because $|\Gamma_L| < 1$`], 0,
        [null, md`At the load they are $\tilde V^-\tilde V^{+*} - \tilde V^+\tilde V^{-*}$, which is not zero unless $\Gamma_L = 0$. They drop out of the real part, not out of the product.`, md`The phasors have already removed the time. Averaging over time is exactly what $\frac12\Re\{\cdots\}$ does.`, md`The cancellation works for any $\Gamma_L$, even $|\Gamma_L| = 1$.`],
        md`With $a = \tilde V^+e^{j\beta d}$ and $b = \tilde V^-e^{-j\beta d}$: $(a + b)(a^* - b^*) = |a|^2 - |b|^2 + (ba^* - ab^*)$, and $ba^* - ab^* = w - w^* = 2j\Im\{w\}$.`),
      Q(md`Which single approximation turns the exact $\gamma$ into the good-conductor line $\alpha \approx \beta \approx \sqrt{\omega\mu\sigma/2}$?`,
        [md`$\epsilon - j\sigma/\omega \approx -j\sigma/\omega$`, md`$\sqrt{1 - jx} \approx 1 - jx/2$`, md`$\epsilon - j\sigma/\omega \approx \epsilon$`, md`$\tan^{-1}x \approx x$`], 0,
        [null, md`That is the low-loss step, valid when $x = \sigma/\omega\epsilon$ is small.`, md`That drops the loss altogether: the $\sigma = 0$ line.`, md`That small-angle step gives the low-loss $\tau \approx \sigma/2\omega\epsilon$.`],
        md`Then $\gamma \approx \sqrt{j\omega\mu\sigma} = \sqrt{\omega\mu\sigma}\,e^{j45°}$, whose real and imaginary parts are both $\sqrt{\omega\mu\sigma/2}$.`),
      Q(md`Why is the launched voltage $\tau_gV_g = V_g\frac{Z_0}{R_g + Z_0}$, with no $R_L$ in it?`,
        [md`at first the generator sees only the line, which acts like a resistor $Z_0$`, 'the load is always matched at the start', 'the line stores no energy at first', md`$R_L$ cancels between the top and the bottom of the divider`], 0,
        [null, md`The load can be anything. The wave simply has not reached it yet, so it cannot matter yet.`, md`True, but not the reason. The divider uses the ratio $V^+/I^+ = Z_0$ of the forward wave.`, md`$R_L$ never enters the divider. It shows up later, through $\Gamma_L$, when the wave comes back at $t = 2l/v$.`],
        md`For $t < 2l/v$ the generator cannot know what is at the far end. The forward wave has $V^+/I^+ = Z_0$, so the line is a resistor $Z_0$ in series with $R_g$.`),
      Q(md`In deriving $\langle\mathbf S\rangle = \frac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$, what happens to the term $\tilde{\mathbf E}\times\tilde{\mathbf H}\,e^{j2\omega t}$?`,
        ['it averages to zero over one period', 'it doubles the result', 'it is the reactive power, and it is kept', 'it cancels only when the medium is lossless'], 0,
        [null, md`It oscillates at $2\omega$; a cosine averages to zero over whole periods, so it adds nothing to the average.`, md`It is dropped. The reactive power is $\frac12\Im\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$, built from the other pair of terms.`, md`It averages away in every medium, lossy or not.`],
        md`$\mathbf E\times\mathbf H$ has four terms. The two with $e^{\pm j2\omega t}$ average to zero; the two without $t$ give $\frac14(\tilde{\mathbf E}\times\tilde{\mathbf H}^* + \text{c.c.}) = \frac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$.`),
      Q(md`Why does $Z(d)$ repeat every $\lambda/2$ along a line?`,
        [md`$\Gamma(d) = \Gamma_Le^{-j2\beta d}$ turns by $2\beta\cdot\frac\lambda2 = 2\pi$`, md`$\tilde V(d)$ itself repeats every $\lambda/2$`, md`$e^{j\beta d}$ repeats every $\lambda/2$`, 'the line is lossless, so nothing changes along it'], 0,
        [null, md`$\tilde V(d)$ carries $e^{j\beta d}$, which changes sign over $\lambda/2$. Only the ratio $\tilde V/\tilde I$ repeats.`, md`$e^{j\beta d}$ repeats every $\lambda$, and it cancels out of $Z(d)$ anyway.`, md`A lossless line still changes $Z$ from point to point; it only repeats after $\lambda/2$.`],
        md`$Z(d) = Z_0\frac{1 + \Gamma(d)}{1 - \Gamma(d)}$ depends on $d$ only through $\Gamma(d)$, and $e^{-j2\beta d}$ comes back to itself when $2\beta d$ grows by $2\pi$, that is, when $d$ grows by $\lambda/2$.`),
      Q(md`A parallel-plate line has width $W = 10$ mm, gap $d = 1$ mm, and air between the plates. What is $Z_0$?`,
        [md`$12\pi\ \Omega$`, md`$1200\pi\ \Omega$`, md`$120\pi\ \Omega$`, md`$1.2\pi\ \Omega$`], 0,
        [null, md`That uses $d/W$ instead of $W/d$. A wide line has a large $\mathcal C$ and so a low $Z_0$.`, md`That is $\eta_0$ itself; the geometry divides it by $GF = 10$.`, md`That divides by $GF^2$. $Z_0 = \sqrt{\mathcal L/\mathcal C} = \eta/GF$: one power of $GF$.`],
        md`$GF = W/d = 10$, so $Z_0 = \eta_0/GF = 120\pi/10 = 12\pi \approx 37.7\ \Omega$.`),
    ],
  });

  // ================================================================ 3. the 4x6 card, explained
  EM.lesson('e3-x', {
    id: 'e3-card', order: 3, kind: 'read', title: 'What to write on your 4×6 card', ref: 'notecard-e3.html',
    sub: 'What the sheet leaves out, and the speed rules, line by line',
    steps: [
      R(md`
        The exam allows **one 4″×6″ card of handwritten notes**, next to the official sheet. The sheet already gives you most formulas ([typed here](#/l/e3-sheet)), so the card should hold only what the sheet leaves out, plus the speed rules that save minutes. The printable layout is <a href="notecard-e3.html">notecard-e3.html</a> (<a href="notecard-e3.pdf">PDF</a>, one card side per page, at about 6.6 pt). Print it at actual size and copy it by hand: the card must be handwritten.

        !!method Making the card (about 40 minutes)
          1. Print the PDF at actual size, so you see how small you must write.
          2. Copy the front (waves), then the back (lines). As you write each line, say what it means and when you use it: the notes below give you both. Copying this way is studying.
          3. Write the red items in a second color. They are the slips that cost the most points.
          4. Leave out any line you already know cold, and use the room for your own weak spots.
          5. Do one timed practice exam with only the sheet and your card before Monday, and fix whatever you had to look for.

        Below is every line of the card, in the card's order: what it means, when you use it, and the slip it prevents.

        ## Front: waves

        **The header.** $\mu_0 = 4\pi\times10^{-7}$ H/m and $\epsilon_0 = \frac{10^{-9}}{36\pi}$ F/m: the sheet gives $c$ and $\eta_0$ but neither of these as a number. $\mu_0c = \eta_0$ and $\epsilon_0c\eta_0 = 1$ let you write $\omega\mu_0 = k_0\eta_0$ and $\omega\epsilon_0 = k_0/\eta_0$ (with $k_0 = \omega/c$) instead of multiplying powers of ten.

        ### Phasors, no calculator

        - $X(t) = \Re\{\tilde Xe^{j\omega t}\}$ and $\partial_t \to j\omega$: the two rules that turn calculus into algebra. Reading a time function into a phasor: $\cos \to 1$, $\sin \to -j$ (because $\sin x = \cos(x - 90°)$ and $e^{-j90°} = -j$), $-\cos \to -1$. **Slip:** writing $+j$ for a sine. [Topic 1](#/l/w1-phasor)
        - $\frac1j = -j$, $\sqrt j = \frac{1+j}{\sqrt2}$, $\sqrt{-j} = \frac{1-j}{\sqrt2}$, $e^{j\pi} = -1$: the values that come up in $\gamma$ and $\eta$. $\sqrt j$ is where the good conductor's $45°$ comes from.
        - $\cos x$ and $\sin x$ as sums of exponentials: to simplify $e^{-j\beta z} \pm e^{+j\beta z}$ in standing waves and two-sheet problems. Prof. Chen printed these inside his Spring 2024 problem; do not count on that.
        - Divide by multiplying by the conjugate; in polar form, divide the sizes and subtract the angles. Use polar for $\times$, $\div$ and $\sqrt{\ }$, rectangular for $+$ and $-$. [Complex numbers from zero](#/l/e3-complex)
        - $\langle\Re\{Ae^{j\omega t}\}\Re\{Be^{j\omega t}\}\rangle = \frac12\Re\{AB^*\}$: every time-averaged power ($\langle S\rangle$, $\frac12\Re\{\tilde V\tilde I^*\}$, $\frac12\sigma|\tilde E|^2$) is this one rule. **Slip:** the $\frac12$, or the missing conjugate. [Topic 4](#/l/w1-avg)
        - The three triangles: the loss tangents an exam without a calculator uses are 1 ($45°$), $\sqrt3$ ($60°$), $1/\sqrt3$ ($30°$) and $3/4$ ($36.9°$, with hypotenuse $5/4$).
        - Travel: $e^{-j\beta z}$, or $\omega t - \beta z$ with opposite signs, means the wave goes toward $+z$.

        ### Lossy medium

        - $x = \frac{\sigma}{\omega\epsilon} = \frac{60\,\sigma\lambda_0}{\epsilon_r}$, with $\lambda_0 = c/f$ in meters. Why: $\omega\epsilon_0 = k_0/\eta_0 = \frac{2\pi/\lambda_0}{120\pi} = \frac{1}{60\lambda_0}$. Seawater ($\sigma = 4$, $\epsilon_r = 81$) at 1 MHz ($\lambda_0 = 300$ m): $x = 60\cdot4\cdot300/81 \approx 890$, a good conductor. The regimes: below about 0.1 use the low-loss line of the sheet, above about 10 the good-conductor line, in between the exact formulas. [Topic 7](#/l/w2-limits)
        - **The method** for the exact case: the lossless $k = \omega\sqrt{\mu\epsilon}$ and $\eta_i = \sqrt{\mu/\epsilon}$ first; then $1 - jx = \rho e^{-j\theta}$; then $\gamma = jk\sqrt\rho\,e^{-j\theta/2}$, $\eta = (\eta_i/\sqrt\rho)e^{j\theta/2}$, $\tau = \theta/2$. [Topic 5](#/l/w2-gamma)
        - **Check (red):** the angles of $\gamma$ and $\eta$ add to $90°$ and $|\gamma||\eta| = \omega\mu$. Ten seconds; it catches most algebra slips.
        - $\beta^2 - \alpha^2 = k^2$ and $2\alpha\beta = \omega\mu\sigma$: from the real and imaginary parts of $\gamma^2$. Given one of $\alpha$, $\beta$, they give the other.
        - **Good conductor:** $\delta = 1/\alpha = 1/\sqrt{\pi f\mu\sigma}$ (the sheet's $\sqrt{\omega\mu\sigma/2}$ with $\omega = 2\pi f$), $\gamma = (1+j)/\delta$, $\eta = (1+j)/(\sigma\delta)$. The Spring 2024 exam gave $\delta = 1$ mm and asked for $\gamma$: $(1 + j)\times10^3$ 1/m, done.
        - Inside a conductor $\lambda = 2\pi\delta$ and $v_p = \omega\delta$: tiny and slow. At $z = \delta$ the field is down to $e^{-1} = 37\%$ and the power to $e^{-2} = 13.5\%$.
        - $H$ lags $E$ by $\tau$, and both decay together.

        ### Reading a wave

        - From $E_0e^{-\alpha z}\cos(\omega t - \beta z + \phi)$, read $\lambda = 2\pi/\beta$, $v_p = \omega/\beta$ and the $1/e$ distance $1/\alpha$. [Topic 6](#/l/w2-read)
        - $H$ from $E$: divide the size by $|\eta|$, subtract $\tau$ from the phase, and point it along $\hat k\times\hat e$.
        - $\tan\tau = \alpha/\beta$: since $\angle\gamma = 90° - \tau$ and $\tan\angle\gamma = \beta/\alpha$. It gives $\tau$ straight from a written wave, without $\sigma$.
        - Copper ($\sigma = 5.8\times10^7$ S/m) has $\delta \approx 66\ \mu$m at 1 MHz, shrinking as $1/\sqrt f$; seawater has $\sigma \approx 4$ S/m and $\epsilon_r \approx 81$. Sanity checks for your answers.

        ### Power and loss

        - $\langle S\rangle = \frac{E_0^2}{2|\eta|}\cos\tau\,e^{-2\alpha z} = \frac12|H_0|^2\Re\{\eta\}e^{-2\alpha z}$: the sheet's $\frac12\Re\{\tilde{\mathbf E}\times\tilde{\mathbf H}^*\}$, worked out for one lossy wave. **Slips:** dropping $\cos\tau$; writing $e^{-\alpha z}$. The field decays as $e^{-\alpha z}$, the power as $e^{-2\alpha z}$ (red). [Topic 8](#/l/w2-loss)
        - Loss in dB: $10\log_{10}e^{2\alpha z} = 20\alpha z\log_{10}e = 8.69\,\alpha z$. Then 3 dB is a half, 10 dB a tenth, 20 dB a hundredth.
        - Heat per volume $\frac12\sigma|\tilde E|^2 = -\nabla\cdot\langle\mathbf S\rangle$: the time-averaged Poynting theorem, where the stored energy averages out.
        - $R_s = 1/\sigma\delta = \sqrt{\pi f\mu/\sigma}$, and a good conductor's $\eta = (1+j)R_s$. The power lost per area of a conductor's surface is $\frac12R_s|\tilde J_s|^2$, with $\tilde{\mathbf J}_s = \hat n\times\tilde{\mathbf H}$ at the surface; on a mirror $|\tilde J_s| = 2|\tilde H_i|$. The fraction a good-conductor mirror absorbs is $1 - |\Gamma|^2 \approx 4R_s/\eta_0$.
        - Radiation pressure: a wave carries momentum flux $\langle S\rangle/c$. An absorber stops it ($\langle S_i\rangle/c$); a mirror reverses it ($2\langle S_i\rangle/c$). Units N/m². [Topic 11](#/l/w4-gamma)
        - $\langle w_e\rangle = \frac14\epsilon|\tilde E|^2$ and $\langle w_m\rangle = \frac14\mu|\tilde H|^2$: one $\frac12$ from the energy, one from the time average. In a lossless wave they are equal, and $\langle S\rangle = v_p(\langle w_e\rangle + \langle w_m\rangle)$: energy moving at $v_p$.
        - **Red:** $-\nabla\cdot\mathbf S = \partial_t(w_e + w_m) + \mathbf J\cdot\mathbf E$ has both terms. A statement that leaves one out (Spring 2024, Problem 2c) is false; on average only $\mathbf J\cdot\mathbf E$ is left. [Topic 3](#/l/w1-poynting)

        ### Polarization

        - Linear: the two components in phase or $180°$ apart. Circular: equal sizes and $90°$ apart. Anything else: elliptical. [Topic 9](#/l/w3-pol)
        - **Handedness.** Write $\tilde{\mathbf E} = \mathbf a + j\mathbf b$ at one plane. Then $\mathbf E(t) = \mathbf a\cos\omega t - \mathbf b\sin\omega t$: along $\mathbf a$ at $t = 0$, along $-\mathbf b$ a quarter period later. So it spins about $\mathbf a\times(-\mathbf b) = \mathbf b\times\mathbf a$. Along the travel: right-handed; against: left-handed. Example: $(\hat z + j\hat y)e^{j\beta x}$ has $\mathbf b\times\mathbf a = \hat y\times\hat z = \hat x$, but it travels toward $-x$: left-handed.
        - The same rule with your hand: right thumb along the travel; if the fingers curl the way $\mathbf E$ turns, it is right-handed.
        - Toward $+z$: $\hat x - j\hat y$ is right-handed and $\hat x + j\hat y$ left-handed; in time, $\cos\psi\,\hat x + \sin\psi\,\hat y$ with $\psi = \omega t - \beta z$ is right-handed.
        - **Red:** reflection flips the hand. With a real $\Gamma$ the reflected field turns the same way, but it travels the other way.
        - $\langle S\rangle = (|\tilde E_x|^2 + |\tilde E_y|^2)/2\eta$: the two components carry power separately and it adds.

        ### Current sheets

        - A sheet $\tilde{\mathbf J}_s$ at $z_s$ radiates $\tilde{\mathbf E} = -\frac\eta2\tilde{\mathbf J}_se^{-jk|z - z_s|}$ on both sides: the phasor form of the sheet's $E_x = \frac\eta2J_s(t \mp z/v_p)$ (the sheet's current is $-J_s\hat x$, hence the minus here). $\mathbf E$ is even in $z - z_s$. In a lossy medium use $e^{-\gamma|z - z_s|}$. [Topic 10](#/l/w3-antenna)
        - $\tilde{\mathbf H} = \frac12\tilde{\mathbf J}_s\times\hat n\,e^{-jk|z - z_s|}$, with $\hat n$ from the sheet toward the point: $\mathbf H$ is odd and jumps by $J_s$.
        - To radiate a chosen field $\tilde{\mathbf E}_0$ next to the sheet, use $\tilde{\mathbf J}_s = -\frac2\eta\tilde{\mathbf E}_0$. Each side then carries $\langle S\rangle = \frac\eta8|\tilde J_s|^2$.
        - Two sheets: add the two fields, each with its own $|z - z_k|$. Between the sheets one term goes as $e^{-jkz}$ and the other as $e^{+jkz}$, which combine into a cosine or a sine.
        - Equal sheets at $0$ and $d$: between them $\tilde{\mathbf E} = -\eta\tilde{\mathbf J}_se^{-jkd/2}\cos k(z - \frac d2)$ and $\tilde{\mathbf H} = -j(\tilde{\mathbf J}_s\times\hat z)e^{-jkd/2}\sin k(z - \frac d2)$; beyond $d$, $-\frac\eta2\tilde{\mathbf J}_s(1 + e^{jkd})e^{-jkz}$. Spring 2024 Problem 1 ($\tilde{\mathbf J}_s = -2\hat x$ A/m, $d = 0.5$ m, $\lambda = 1$ m): between, $\tilde{\mathbf E} = -j240\pi\sin(2\pi z)\,\hat x$ V/m and $\tilde{\mathbf H} = 2\cos(2\pi z)\,\hat y$ A/m; outside, zero. (The posted key writes $-240j$ and drops the $\pi$.)
        - Spacing $\lambda/2$ with equal currents: zero outside, a standing wave between. Spacing $\lambda/4$ with $\tilde J_2 = -j\tilde J_1$: everything goes toward sheet 2's side, nothing toward sheet 1's.

        ### Reflection, standing waves

        - $\tilde E_r = \Gamma\tilde E_i$, but **the reflected $\tilde H$ gets $-\Gamma$** (red), because the reflected wave travels backward. Going into a lower $\eta$ ($\eta_2 < \eta_1$, a denser or conducting medium) gives $\Gamma < 0$. [Topic 11](#/l/w4-gamma)
        - Power: $|\Gamma|^2$ comes back and $1 - |\Gamma|^2 = \frac{\eta_1}{\eta_2}|\tau|^2$ goes through (lossless media, real $\eta$). **Slip:** $|\tau|^2$ alone is not the transmitted fraction.
        - The envelope in medium 1, at a distance $\ell$ from the boundary, is $E_0|1 + \Gamma e^{-j2\beta\ell}|$: maximum $(1 + |\Gamma|)E_0$, minimum $(1 - |\Gamma|)E_0$, a quarter wavelength apart. $\Gamma < 0$ puts a minimum on the boundary. [Topic 12](#/l/w4-standing)
        - A perfect conductor at $z = 0$: $\mathbf E_1 = 2E_0\sin\beta z\sin\omega t\,\hat x$, $\mathbf H_1 = \frac{2E_0}{\eta}\cos\beta z\cos\omega t\,\hat y$, and the wall carries $\mathbf J_s = \frac{2E_0}{\eta}\cos\omega t\,\hat x$. $E$ and $H$ are $90°$ apart in time, so $\langle S\rangle = 0$.
        - $E$ is zero on the wall and every $\lambda/2$ from it; $H$ is largest on the wall.
        - A $\lambda/4$ layer with $\eta_2 = \sqrt{\eta_1\eta_3}$ removes the reflection (the wave version of the quarter-wave transformer); a $\lambda/2$ slab is invisible. [Topic 19](#/l/w6-qw)

        ## Back: lines

        **The header.** $v = c/\sqrt{\epsilon_r}$ and the one-way time $T = l/v$ set every bounce diagram. $\beta\lambda/8 = 45°$, $\beta\lambda/4 = 90°$ and $\beta\lambda/2 = 180°$ turn lengths into angles for $\tan\beta l$ and $e^{-j2\beta d}$.

        ### Line from the fields

        - $\mathcal L = \mu/GF$, $\mathcal C = \epsilon\,GF$, $G = \sigma GF$: one geometric factor sets all three. Hence $\mathcal L\mathcal C = \mu\epsilon$ and $G/\mathcal C = \sigma/\epsilon$. [Topic 13](#/l/w5-telegraph)
        - $GF$: plates $W/d$, coax $2\pi/\ln(b/a)$, twin lead $\pi/\cosh^{-1}(D/2a)$. Spring 2024 Problem 3 gave the coax $\mathcal C = 2\pi\epsilon/\ln(b/a)$ and asked for the rest: $GF = 2\pi/\ln(b/a)$, so $\mathcal L = \frac{\mu}{2\pi}\ln\frac ba$, $Z_0 = \frac{1}{2\pi}\sqrt{\frac\mu\epsilon}\ln\frac ba$ and $v_p = 1/\sqrt{\mu\epsilon}$.
        - Coax $Z_0 = \frac{\eta}{2\pi}\ln\frac ba = \frac{60}{\sqrt{\epsilon_r}}\ln\frac ba$; plates $Z_0 = \eta\,d/W$.
        - $V$ and $I$ from the fields: plates $V = E_xd$, $I = H_yW$; coax $V = \int_a^bE_r\,dr$, $I = 2\pi rH_\phi$.
        - $Z_0 = 1/(v\mathcal C) = v\mathcal L$: if you know $\mathcal C$ (or $\mathcal L$) and the speed, you have $Z_0$. $\mathcal C$ is the charge per meter over $V$; $\mathcal L$ is the flux per meter over $I$.

        ### Launch, reflect, steady state

        - $V^+ = \tau_gV_g$: at first the line looks like a resistor $Z_0$. $I^\pm = \pm V^\pm/Z_0$, so **current reflects with $-\Gamma$** (red). [Topic 14](#/l/w5-launch)
        - $\Gamma$: matched 0, short $-1$, open $+1$; a resistor larger than $Z_0$ gives $\Gamma > 0$.
        - At the load, $V_L = (1 + \Gamma_L)V^+$ and $I_L = (1 - \Gamma_L)V^+/Z_0$.
        - A joint from $Z_a$ into $Z_b$: $\Gamma = \frac{Z_b - Z_a}{Z_b + Z_a}$, $\tau = 1 + \Gamma$. **From $b$'s side** (red) the signs swap: $-\Gamma$ and $1 - \Gamma$. Spring 2024 Problem 4 ($150\ \Omega$ into $50\ \Omega$): $\Gamma_{12} = -\frac12$, $\tau_{12} = \frac12$; back the other way $\Gamma_{21} = +\frac12$, $\tau_{21} = \frac32$. [Topic 16](#/l/w5-multi)
        - Two lines leaving a joint look like $Z_b\|Z_c$ in parallel; a resistor at the joint looks like $R\|Z_b$.
        - **Steady state** with a DC source: after the bounces die out, the line is just two wires, so $V = V_g\frac{R_L}{R_g + R_L}$ and $I = \frac{V_g}{R_g + R_L}$. The geometric sum of the bounces, $\tau_gV_g\frac{1 + \Gamma_L}{1 - \Gamma_L\Gamma_g}$, gives the same number.
        - A capacitor load is a short at first ($\Gamma = -1$) and an open at the end ($+1$); an inductor is the reverse.

        ### Bounce diagrams

        - Time runs down, $z$ across; each wave is a line of slope $\pm v$; write its value on it. [Topic 15](#/l/w5-bounce)
        - $V(z,t)$ is the sum of every wave whose front has passed $z$ by time $t$.
        - At a point $z$ the waves arrive at $z/v$, $(2l - z)/v$, $(2l + z)/v$, $(4l - z)/v$, …
        - A snapshot at time $t$ has its fronts at $z = vt$, $2l - vt$, …. **Red:** the part of a pulse sent first is the part farthest down the line.
        - A pulse of width $w$ is $u(t) - u(t - w)$, and it is $vw$ long on the line.
        - An impulse makes spikes of size $\tau_g(\Gamma_L\Gamma_g)^n$: the sheet's two sums.
        - Reading a scope trace at $z = 0$ backward: the first level is $\tau_gV_g$; the jump at $2T$ is $\tau_gV_g\Gamma_L(1 + \Gamma_g)$, which gives $\Gamma_L$; the time $2T$ gives the length $l = vT$. [Topic 16](#/l/w5-multi)
        - With junctions, each joint has its own $\Gamma$ and $\tau$, and every transmitted wave starts new bounces.

        ### Phasor lines

        - $Z_{in} = Z_0\frac{Z_L + jZ_0\tan\beta l}{Z_0 + jZ_L\tan\beta l}$: the same as the sheet's $Z_0\frac{1 + \Gamma(l)}{1 - \Gamma(l)}$, already worked out. [Topic 17](#/l/w6-vd)
        - $\lambda/4$: $Z_{in} = Z_0^2/Z_L$, it inverts. $\lambda/2$: $Z_{in} = Z_L$, it repeats.
        - To match $R_L$ to $R_{in}$, put a $\lambda/4$ section of $Z_0 = \sqrt{R_{in}R_L}$ between them. It works at that frequency and its odd multiples only. [Topic 19](#/l/w6-qw)
        - $\Gamma(d) = \Gamma_Le^{-j2\beta d}$ keeps its size and turns clockwise as you move toward the generator.
        - $|\tilde V|$ is largest where $\Gamma(d)$ is real and positive: $2\beta d_{max} = \theta_L + 2\pi n$. The minima sit $\lambda/4$ from the maxima.
        - A real load: $R_L > Z_0$ puts a maximum at the load and VSWR $= R_L/Z_0$; $R_L < Z_0$ puts a minimum there and VSWR $= Z_0/R_L$.
        - $P_L = \frac{|\tilde V^+|^2}{2Z_0}(1 - |\Gamma_L|^2)$ is the power delivered, and on a lossless line it is also the power into the input.
        - $\tilde V^+ = \tilde V(l)/[e^{j\beta l}(1 + \Gamma(l))]$: after the input divider, this gives the wave amplitude and so the voltage anywhere.

        ### Stubs and resonance

        - A shorted stub, $Z = jZ_0\tan\beta l$: shorter than $\lambda/4$ it is an inductor; $Z = 0$ at $l = n\lambda/2$ and $Z = \infty$ at $l = (2n - 1)\lambda/4$. [Topic 18](#/l/w6-stubs)
        - An open stub, $Z = -jZ_0\cot\beta l$ (the sheet's $Y = jY_0\tan\beta l$ turned over): shorter than $\lambda/4$ it is a capacitor; $\infty$ at $n\lambda/2$ and 0 at $(2n - 1)\lambda/4$.
        - In frequency, with $\beta l = 2\pi fl/v$: a shorted stub is $Z = 0$ at $f = nv/2l$ and $Z = \infty$ at $f = (2n - 1)v/4l$; an open stub the other way round.
        - A short line ($\beta l \ll 1$) is an inductor $L = \mathcal Ll$ if shorted and a capacitor $C = \mathcal Cl$ if open.
        - Filters: a stub in shunt that is a short at $f$ kills $f$ there (a notch); one that is open at $f$ is invisible; a stub in series that is $\infty$ at $f$ blocks it.
        - A line left ringing: equal ends (short-short or open-open) oscillate at $f = nv/2l$, period $2l/v$; mixed ends (short-open) at $f = (2n - 1)v/4l$, period $4l/v$.

        ### Speed rules and numbers

        1. Lossless numbers first, then the loss tangent, then the matching line of the sheet.
        2. $\tilde{\mathbf H} = \frac1\eta\hat k\times\tilde{\mathbf E}$ and $\tilde{\mathbf E} = \eta\tilde{\mathbf H}\times\hat k$, with $\hat k$ the travel: never guess a direction.
        3. Get the sign of $\Gamma$ first: a smaller $\eta$ or $R$ ahead means $\Gamma < 0$, and a minimum on the boundary or at the load.
        4. $\lambda/4$ inverts and $\lambda/2$ repeats; a short under $\lambda/4$ is an L, an open under $\lambda/4$ a C.
        5. The last level of a bounce diagram must equal the DC divider. Check it.
        6. At a joint, $V$ is continuous and the currents add: that is all $\tau = 1 + \Gamma$ says.
        7. **Red:** three different $\tau$'s (the angle of $\eta$, $1 + \Gamma$, and $\tau_g$). Write which one you mean.

        The numbers ($e^{-1}$ to $e^{-5}$, $\ln2$, $\ln10$, $\sqrt2$, $\sqrt3$, $\pi^2$) are there because the exam allows no calculator; at 300 MHz, $\lambda_0 = 1$ m and $k_0 = 2\pi$ rad/m. The units line catches the most common lost point: a number without its unit.
      `),
    ],
  });
})();

/* Topic 6 — Sheets, slabs, superposition, delta-function currents (Lecture 13). The infinite sheet H = ½ Js × n̂ from
   symmetry and Ampère; pairs of sheets; slabs (center plane, outside, linear inside); superposition with holes (the
   uniform field in an off-axis hole); delta-function current densities as lines and sheets; and the boundary condition
   H⁺ − H⁻ = Js × n̂. Round shapes (wire, coax, solenoid, toroid) are Topic 5. */
(function () {
  'use strict';
  const { R, RF, Q, G } = C;
  const { f, p, MC, one, N, sol } = EM;
  const { pick } = U;
  const r3 = (x) => +x.toPrecision(3);
  const MU0 = 4 * Math.PI * 1e-7;

  // ---------------------------------------------------------------- small vector helpers (local)
  const AX = ['x', 'y', 'z'];
  const e = (k, s = 1) => { const v = [0, 0, 0]; v[AX.indexOf(k)] = s; return v; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const add = (...vs) => vs.reduce((s, v) => s.map((x, i) => x + v[i]), [0, 0, 0]);
  const sc = (k, v) => v.map((x) => k * x);
  const sgn = (x) => (x > 0 ? 1 : -1);
  // a vector as TeX: [2, 0, 3] -> '2\hat x + 3\hat z'
  const vecT = (v) => {
    const t = [];
    v.forEach((x, i) => { if (Math.abs(x) > 1e-9) { const m = r3(Math.abs(x)); t.push(`${t.length ? (x > 0 ? ' + ' : ' - ') : (x > 0 ? '' : '-')}${m === 1 ? '' : m}\\hat ${AX[i]}`); } });
    return t.length ? t.join('') : '0';
  };
  const joinT = (s, t) => (t.startsWith('-') ? `${s} - ${t.slice(1)}` : `${s} + ${t}`);
  const unitT = (v) => { const i = v.findIndex((x) => Math.abs(x) > 1e-12); return `$${v[i] > 0 ? '+' : '-'}\\hat ${AX[i]}$`; };
  // a numeric part, or a fixed multiple choice when the exact answer is zero (relative tolerance cannot check 0)
  const numOrZero = (lbl, val, unit, s) => (Math.abs(val) > 1e-9 ? N(lbl, val, unit)
    : { lbl: `$${lbl}$ (${unit})`, mc: ['$0$', `$+${p(r3(s))}$`, `$-${p(r3(s))}$`], a: 0, fixed: true, why: [null, 'The contributions cancel here: add them with their signs.', 'The contributions cancel here: add them with their signs.'] });

  // ---------------------------------------------------------------- figures
  // one sheet edge-on, current out of the page; H up on the right, down on the left; an Amperian rectangle straddles it
  function sheetFig() {
    const g = PF.fig({ scale: 1.2, alt: 'a current sheet seen edge-on with current out of the page; to the right the field points up, to the left it points down, with the same size at every distance; a dashed rectangle straddles the sheet' });
    const x = 120;
    g.sheet(x, 14, 186);
    for (let y = 26; y <= 176; y += 25) g.odot(x, y, 5);
    g.loopRect(92, 58, 56, 84, { dir: 'ccw', cls: 'dash' });
    g.label(150, 146, 'C', 'tl', 'small');
    for (const xx of [178, 214]) g.arrow(xx, 130, xx, 70, { hs: 8 });
    for (const xx of [62, 26]) g.arrow(xx, 70, xx, 130, { hs: 8 });
    g.label(220, 64, '\\mathbf H', 'bl', 'small');
    g.label(20, 136, '\\mathbf H', 'tr', 'small');
    g.label(x + 8, 14, '\\mathbf J_s\\ \\text{out}', 'bl', 'small');
    g.arrow(x + 4, 196, x + 40, 196, { cls: 'dim', hs: 6 });
    g.label(x + 44, 196, '\\hat n', 'l', 'small');
    g.arrow(x - 4, 196, x - 40, 196, { cls: 'dim', hs: 6 });
    g.label(x - 44, 196, '\\hat n', 'r', 'small');
    return g.svg();
  }

  // two sheets with opposite currents: H = Js between, 0 outside
  function pairFig() {
    const g = PF.fig({ scale: 1.2, alt: 'two parallel sheets seen edge-on, the left one with current out of the page and the right one into the page; between them the field points up with size Js; outside it is zero' });
    const x1 = 80, x2 = 170;
    g.sheet(x1, 14, 166); g.sheet(x2, 14, 166);
    for (let y = 26; y <= 156; y += 26) { g.odot(x1, y, 5); g.otimes(x2, y, 5); }
    for (const xx of [108, 142]) g.arrow(xx, 120, xx, 60, { cls: 'thick', hs: 8 });
    g.label(125, 172, '\\mathbf H = J_s', 't', 'small');
    g.label(30, 90, '\\mathbf H = 0', 'c', 'small');
    g.label(222, 90, '\\mathbf H = 0', 'c', 'small');
    return g.svg();
  }

  // a slab edge-on with current out of the page, and its field profile
  function slabFig() {
    const g = PF.fig({ scale: 1.2, alt: 'a slab of current out of the page seen edge-on; outside it the field is constant, up on the right and down on the left; inside it varies linearly and is zero on the center plane' });
    const x0 = 100, x1 = 160, xc = 130;
    g.rect(x0, 14, x1 - x0, 156, { cls: 'shade' });
    g.line(x0, 14, x0, 170, { cls: 'thick' }); g.line(x1, 14, x1, 170, { cls: 'thick' });
    g.line(xc, 14, xc, 170, { cls: 'dim dash thin' });
    g.marks('dot', x0 + 10, 30, x1 - 10, 154, 3, 6, { r: 1.8 });
    for (const xx of [190, 222]) g.arrow(xx, 122, xx, 62, { hs: 8 });
    for (const xx of [70, 38]) g.arrow(xx, 62, xx, 122, { hs: 8 });
    g.arrow(146, 104, 146, 80, { hs: 6 });
    g.arrow(114, 80, 114, 104, { hs: 6 });
    g.label(xc, 176, '\\text{center plane}', 't', 'small');
    g.dim(x0, 6, x1, 6, 'W', { at: 't' });
    return g.svg();
  }
  function slabPlot() {
    return PF.plot({ w: 270, h: 170, x: [-2.2, 2.2], y: [-1.3, 1.3], zero: true, xl: 's', yl: 'H',
      xt: [[-1, '-W/2'], [1, 'W/2']], yt: [[1, 'JW/2'], [-1, '-JW/2']],
      curves: [{ f: (s) => Math.max(-1, Math.min(1, s)) }] });
  }

  // a uniform round current with an off-axis hole: H is uniform in the hole, perpendicular to the offset
  function holeFig() {
    const g = PF.fig({ scale: 1.2, alt: 'a cylinder of current out of the page with an off-axis hole; inside the hole the field arrows are all parallel, pointing up, perpendicular to the offset d' });
    const cx = 100, cy = 100, a = 72, hx = 140, b = 26;
    g.circle(cx, cy, a, { cls: 'shade' });
    g.circle(cx, cy, a, { cls: 'thick' });
    g.circle(hx, cy, b, { cls: 'bgfill thick' });
    for (const [x, y] of [[62, 70], [62, 130], [88, 50], [88, 150], [52, 100], [118, 160], [118, 40], [160, 60], [160, 140], [86, 100]]) g.dot(x, y, 1.8, { cls: 'dimfill' });
    for (const xx of [128, 140, 152]) g.arrow(xx, 114, xx, 86, { hs: 6 });
    g.dot(cx, cy, 2.2);
    g.dim(cx, cy + a + 12, hx, cy + a + 12, 'd', { at: 'b' });
    g.line(cx, cy, cx, cy + a + 12, { cls: 'dim thin dash' });
    g.line(hx, cy + b, hx, cy + a + 12, { cls: 'dim thin dash' });
    g.label(hx + b + 6, cy - b, '\\mathbf H', 'bl', 'small');
    return g.svg();
  }

  // Summer 2020 #2(a): 2 A along +x on the x-axis, 4 A along -y on the y-axis; B at (1,1,0); B = 0 on x = -2y
  function deltaFig() {
    const g = PF.fig({ scale: 1.2, alt: 'top view of the z = 0 plane: 2 A flows along +x on the x-axis and 4 A along minus y on the y-axis; at (1, 1) the field points out of the page; along the dashed line x = -2y the field is zero' });
    const O = [140, 110], s = 44, P = (x, y) => [O[0] + s * x, O[1] - s * y];
    g.line(...P(-2.9, 0), ...P(2.9, 0), { cls: 'thick' });
    g.line(...P(0, 2.2), ...P(0, -2.2), { cls: 'thick' });
    g.head(...P(1.9, 0), 1, 0, { hs: 9 });
    g.head(...P(0, -1.5), 0, 1, { hs: 9 });
    g.label(...P(2.0, -0.12), '2\\ \\text{A}', 't', 'small');
    g.label(...P(0.12, -1.6), '4\\ \\text{A}', 'l', 'small');
    g.label(...P(3.0, 0), 'x', 'l', 'small accent');
    g.label(...P(0, 2.3), 'y', 'b', 'small accent');
    g.odot(...P(1, 1), 6, { lab: '\\mathbf B\\ (1,1)', at: 'r' });
    g.line(...P(-2.8, 1.4), ...P(2.8, -1.4), { cls: 'dash' });
    g.dot(...P(-2, 1), 3);
    g.label(...P(-2, 1.12), '(-2,1)', 'b', 'small');
    g.label(...P(2.2, -1.25), 'x = -2y', 'tl', 'small');
    return g.svg();
  }

  // Summer 2019 #2(a): the two slabs, and H_y(x) before and after the sheet on x = 0
  const S19 = { s: [[-2, -1, 4], [1, 3, -2]] };
  const slabHy = (x, slabs) => slabs.reduce((h, [lo, hi, J]) => h + J * Math.max(-(hi - lo) / 2, Math.min((hi - lo) / 2, x - (lo + hi) / 2)), 0);
  function s19Fig() {
    const g = PF.fig({ scale: 1.15, alt: 'two slabs seen edge-on along the x-axis: slab 1 from x = -2 to -1 carries 4 A per square meter out of the page, slab 2 from x = 1 to 3 carries 2 A per square meter into the page' });
    const X = (x) => 150 + 40 * x;
    g.rect(X(-2), 30, 40, 80, { cls: 'shade' }); g.rect(X(1), 30, 80, 80, { cls: 'shade' });
    g.rect(X(-2), 30, 40, 80, {}); g.rect(X(1), 30, 80, 80, {});
    for (const y of [50, 90]) { g.odot(X(-1.5), y, 5); g.otimes(X(1.6), y, 5); g.otimes(X(2.4), y, 5); }
    g.arrow(X(-3.4), 128, X(3.6), 128, { cls: 'dim', hs: 6 });
    for (const x of [-2, -1, 0, 1, 3]) { g.line(X(x), 124, X(x), 132, { cls: 'dim' }); g.label(X(x), 134, String(x), 't', 'small'); }
    g.label(X(3.7), 128, 'x\\ (\\text{m})', 'l', 'small accent');
    g.label(X(-1.5), 26, '4\\ \\text{A/m}^2', 'b', 'small');
    g.label(X(2), 26, '-2\\ \\text{A/m}^2', 'b', 'small');
    return g.svg();
  }
  function s19Plot() {
    return PF.plot({ w: 340, h: 210, x: [-3.2, 3.4], y: [-1.6, 5.6], zero: true, xl: 'x', yl: 'H_y\\ (\\text{A/m})',
      xt: [[-3, '-3'], [-2, '-2'], [-1, '-1'], [1, '1'], [2, '2'], [3, '3']], yt: [[-1, '-1'], [1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5']],
      curves: [{ f: (x) => slabHy(x, S19.s), from: -3, to: 3.3 },
        { f: (x) => slabHy(x, S19.s) + (x < 0 ? -1 : 1), from: -3, to: 3.3, cls: 'dash', n: 661 }] });
  }

  // ---------------------------------------------------------------- the lesson
  EM.lesson('u2', {
    id: 't6-sheets', topic: 6, ref: 'Lecture 13', title: 'Sheets, slabs, superposition, delta currents',
    steps: [
      R(md`
        !!key Why you care
          HW 5 #2 (pairs of sheets), #3 (a slab) and #4(c)(d) (a cylinder with a hole) are this topic. Summer 2019 #2(a) and its conflict exam #2(a): two slabs, $\mathbf H$ at listed points, a plot, then add a sheet. Summer 2017 #1(a), Summer 2018 #1(b) and Summer 2020 #2(a) write currents with delta functions and ask for the field at a point or where it vanishes. Spring 2018 1(vi) is the boundary condition; Spring 2018 #3 is two plates, i.e. two opposite sheets. The formula sheet gives the sheet and slab only for $\mathbf J\parallel\hat x$; every other orientation is reading a cross product right.

        ### Notation

        - $\mathbf J_s$: **surface current density**, A/m: the current per meter of width, measured across the flow. A strip of width $w$ carries $I = J_sw$.
        - $\hat n$: unit normal **from the sheet toward the field point**. It flips when you cross the sheet.
        - $\mathbf J$: volume current density, A/m². A **slab** fills the region between two parallel planes, thickness $W$; its **center plane** is halfway between them.
        - $\mathbf r_\perp$: vector from a cylinder's axis to the field point, perpendicular to the axis.
        - $\delta(x)$: the Dirac delta, in **1/m**: zero except at $x = 0$, with $\int\delta(x)\,dx = 1$.
        - $\mathbf H^+$, $\mathbf H^-$: the fields just on the two sides of a sheet; for the boundary condition $\hat n$ points from side − into side +.
        - $\text{sgn}(y)$: $+1$ for $y > 0$, $-1$ for $y < 0$.

        ### The idea

        An infinite flat sheet of current makes a field that **does not weaken with distance**:
        $$\mathbf H = \tfrac12\,\mathbf J_s\times\hat n$$
        Size $J_s/2$, parallel to the sheet, perpendicular to the current, reversed on the two sides. Pairs of sheets, slabs, slabs plus sheets: all are sums of this one result. Cylinders with holes and delta-function currents are the same move with lines and cylinders: split the source into pieces whose fields you know, and add vectors.
      `),
      RF(md`
        ### Step 1: one sheet, from symmetry and Ampère

        Lecture 13's sheet: $\mathbf J_s = J_{s0}\hat z$ on the plane $y = 0$. Slice it into strips of width $dx$; each is a line current $J_{s0}\,dx$. At a point $(0, y, 0)$, the strips at $+x$ and $-x$ give fields whose $y$-parts cancel and whose $x$-parts add. So $\mathbf H = H_x(y)\,\hat x$, reversed on the other side by mirror symmetry.

        [[fig:sheet]]

        Ampère on a rectangle straddling the sheet, long sides of length $L$ parallel to $\mathbf H$: each long side gives $|H|L$, the short sides cross $\mathbf H$ at right angles, and $J_{s0}L$ passes through:
        $$2|H|L = J_{s0}L \quad\Rightarrow\quad |H| = \frac{J_{s0}}{2}, \qquad \mathbf H = -\frac{J_{s0}}{2}\,\text{sgn}(y)\,\hat x$$
        The rectangle's width never entered: **$H$ is the same at any distance.** For any orientation, $\mathbf H = \tfrac12\mathbf J_s\times\hat n$. Check: for $y > 0$, $\hat n = \hat y$ and $\hat z\times\hat y = -\hat x$. ✓ (Formula sheet: $\mathbf J_s = J_s\hat x$ on $z = 0$ gives $\mathbf B = \mp\hat y\,\mu_0J_s/2$ for $z \gtrless 0$; the same rule.)
      `, { sheet: { svg: sheetFig(), cap: 'Js out of the page. On the right n̂ points right and Js × n̂ points up; on the left it points down. The rectangle’s two long sides each give |H|L.' } }),
      Q(md`**Predict.** You measure $|\mathbf H|$ at $1$ cm from an infinite current sheet, then at $1$ km. The second reading is…`,
        ['the same', '$10^{-5}$ of the first', '$10^{-10}$ of the first', 'zero'], 0,
        [null, 'That is a line current ($1/r$). A sheet\'s field does not fall off.', 'That would be $1/r^2$, like a point source.', 'An infinite sheet\'s field never dies away; a real sheet\'s does once you are far compared with its size.'],
        md`Farther strips tilt their fields more, and from farther away you see more strips at a given angle; the two effects cancel exactly. $|H| = J_s/2$ everywhere.`),
      RF(md`
        ### Step 2: two sheets

        Add the two $\tfrac12\mathbf J_s\times\hat n$, each with its own $\hat n$.
        - **Opposite currents** (a parallel-plate line, Spring 2018 #3): the fields add between the sheets, $|\mathbf H| = J_s$, and cancel outside.
        - **Same direction:** they cancel between and add outside, $J_s$, pointing opposite ways on the two sides.
        - **Different directions** (HW 5 #2(c): one along $\hat y$, one along $\hat z$): the two contributions are perpendicular; add them as vectors.

        [[fig:pair]]
      `, { pair: { svg: pairFig(), cap: 'Left sheet out of the page, right sheet into it: between them both give "up". Outside, the two cancel.' } }),
      Q(md`**Predict.** A sheet on $x = -d$ carries $\mathbf J_s = J_s\hat z$; a sheet on $x = +d$ carries $-J_s\hat z$. At the origin, $\mathbf H = $`,
        ['$J_s\\,\\hat y$', '$0$', '$-J_s\\,\\hat y$', '$\\tfrac12J_s\\,\\hat y$'], 0,
        [null, 'Opposite currents cancel **outside**; between them they add.', 'For the left sheet $\\hat n = +\\hat x$ and $\\hat z\\times\\hat x = +\\hat y$.', 'Both sheets give $\\tfrac12J_s\\hat y$ here; add them.'],
        md`Left: $\tfrac12J_s\,\hat z\times\hat x = \tfrac12J_s\hat y$. Right: $\tfrac12(-J_s)\,\hat z\times(-\hat x) = \tfrac12J_s\hat y$. Sum: $J_s\hat y$.`),
      RF(md`
        ### Step 3: slabs

        A slab of uniform $\mathbf J$ and thickness $W$ is a stack of thin sheets $\mathbf J\,dz$.
        - **Outside**, every layer is on the same side of you: the slab acts as one sheet with $\mathbf J_s = \mathbf JW$. $\mathbf H = \tfrac12(\mathbf JW)\times\hat n$, constant.
        - **On the center plane** the layers above and below balance: $\mathbf H = 0$. That is the slab's center, not $z = 0$ unless the slab is centered there.
        - **Inside**, at distance $s$ from the center plane: Ampère on a rectangle symmetric about the center plane, $2|H|L = J(2s)L$, so $|H| = Js$. Linear, and it meets the outside value $JW/2$ at the faces.

        [[fig:slab]]

        In vectors, with $\hat n$ the slab's normal and $s$ measured from the center plane along $\hat n$: $\mathbf H = (\mathbf J\times\hat n)\,s$ inside. HW 5 #3, $\mathbf J = 2\hat y$ A/m² in $-3 < z < 1$: center plane $z = -1$, $\mathbf H = 2(z + 1)\,\hat x$ inside and $\pm4\hat x$ A/m outside.
      `, { slab: PF.row([{ svg: slabFig(), cap: 'J out of the page. Outside: constant, like a sheet JW. Inside: grows from zero at the center plane.' }, { svg: slabPlot(), cap: 'The upward component of H across the slab (s from the center plane).' }]) }),
      Q(md`**Predict.** A slab occupies $-3 < z < 1$ m and carries a uniform $\mathbf J = 2\hat y$ A/m². Where is $\mathbf H = 0$?`,
        ['on the plane $z = -1$', 'on the plane $z = 0$', 'on the faces $z = -3$ and $z = 1$', 'nowhere'], 0,
        [null, 'The field vanishes at the slab\'s center plane; this slab is not centered on $z = 0$.', 'At the faces $|H| = JW/2$, its largest value.', 'On the center plane the layers above and below cancel exactly.'],
        md`Center plane: $(-3 + 1)/2 = -1$ m. There the half above and the half below give equal and opposite fields. (HW 5 #3(b).)`),
      RF(md`
        ### Step 4: superposition with a hole

        Inside a uniform round current $\mathbf J = J\hat z$, Topic 5's $H_\phi = Jr/2$ is, as a vector, $\mathbf H = \tfrac12\mathbf J\times\mathbf r_\perp$.

        A cylinder with an empty off-axis hole = the **full** cylinder carrying $\mathbf J$ + a cylinder filling the hole carrying $-\mathbf J$. At a point in the hole, with $\mathbf d$ the vector from the big axis to the hole's axis:
        $$\mathbf H = \tfrac12\mathbf J\times\mathbf r_\perp - \tfrac12\mathbf J\times(\mathbf r_\perp - \mathbf d) = \tfrac12\,\mathbf J\times\mathbf d$$
        **Uniform** in the whole hole, size $Jd/2$, perpendicular to the offset. Center the hole ($d = 0$) and the field inside vanishes, as in a tube. For a fixed total current $I$, $J = I/\pi(a^2 - b^2)$: larger than $I/\pi a^2$, since the same current squeezes into less area (HW 5 #4(c)).

        [[fig:hole]]
      `, { hole: { svg: holeFig(), cap: 'J out of the page, hole offset to the right by d: ½ J ẑ × d x̂ points up, the same at every point of the hole.' } }),
      Q(md`**Predict.** In the hole, compare $|\mathbf H|$ at the hole's center with $|\mathbf H|$ at a point on the hole's rim.`,
        ['they are equal', 'larger at the center', 'larger at the rim', 'zero at the center'], 0,
        [null, 'The two cylinders\' $\\mathbf r_\\perp$ terms cancel at every point of the hole, not just the center.', 'The field in the hole does not depend on position.', 'At the hole\'s center only the hole cylinder\'s field vanishes; the big cylinder\'s field there is $\\tfrac12Jd$.'],
        md`$\mathbf H = \tfrac12\mathbf J\times\mathbf d$ contains no position at all.`),
      RF(md`
        ### Step 5: delta-function currents

        A delta function says **where** the current is. $\delta(x)$ has units 1/m, so:
        - $\mathbf J = I\,\delta(x)\delta(y)\,\hat z$ (A/m²) integrates over the $xy$-plane to $I$: a **line current** of $I$ amperes on the $z$-axis. $I$ is in **A**, because $\delta(x)\delta(y)$ carries 1/m².
        - $\mathbf J = K\,\delta(z)\,\hat x$ integrates across $z$ to $K\hat x$ per meter of width: a **sheet** $\mathbf J_s = K\hat x$ on $z = 0$, with $K$ in **A/m**.
        - $\delta(z - 2)$ puts the sheet on $z = 2$.

        Read off each piece (where, which way, how much), then add line fields ($I/2\pi r$, $\hat\phi = \hat I\times\hat r$) and sheet fields ($\tfrac12\mathbf J_s\times\hat n$).

        **Summer 2017 #1(a):** $I_0[\delta(x)\delta(y)\hat z + \delta(y)\delta(z)\hat x]$ is a line on the $z$-axis and one on the $x$-axis. At $(1, 0, -1)$ each is 1 m away and each gives $\frac{I_0}{2\pi}\hat y$ ($\hat z\times\hat x = \hat y$; $\hat x\times(-\hat z) = \hat y$). Given $\mathbf H = 4\hat y$: $I_0/\pi = 4$, $I_0 = 4\pi$ A.

        [[fig:delta]]

        **Summer 2020 #2(a):** $2\hat x\,\delta(y)\delta(z) - 4\hat y\,\delta(x)\delta(z)$ is 2 A along $+x$ on the $x$-axis and 4 A along $-y$ on the $y$-axis. In the plane $z = 0$ both fields are along $\hat z$ ($\hat x\times\hat y = \hat z$, $(-\hat y)\times\hat x = \hat z$, signs carried by $x$ and $y$):
        $$B_z = \frac{\mu_0}{2\pi}\left(\frac{2}{y} + \frac{4}{x}\right)$$
        At $(1, 1, 0)$: $B_z = 3\mu_0/\pi$ T. $\mathbf B = 0$ where $2/y = -4/x$: the whole line $x = -2y$ in $z = 0$, e.g. $(-2, 1, 0)$. Off that plane the $x$-axis wire's field has a $\hat y$ part and the $y$-axis wire's an $\hat x$ part, so nothing cancels.
      `, { delta: { svg: deltaFig(), cap: 'Summer 2020 #2(a) from above: the two line currents, B out of the page at (1, 1), and the line x = −2y where B = 0.' } }),
      Q(md`**Predict.** In $\mathbf J = K\,\delta(z)\,\hat x$ (A/m²), what are the units of $K$?`,
        ['A/m', 'A', 'A/m²', 'A·m'], 0,
        [null, 'A is the coefficient of $\\delta(x)\\delta(y)$: two deltas, two factors of 1/m.', 'That would need no delta at all (a uniform volume current).', 'Deltas divide by meters; they never multiply.'],
        md`$[\mathbf J] = \text{A/m}^2 = [K]\cdot[\delta(z)] = [K]\cdot\text{m}^{-1}$, so $[K] = \text{A/m}$: a surface current.`),
      R(md`
        ### Step 6: the boundary condition

        Crossing a sheet, its own field flips: from $-\tfrac12\mathbf J_s\times\hat n$ to $+\tfrac12\mathbf J_s\times\hat n$. Every other source's field is continuous there. So, with $\hat n$ from side − into side +,
        $$\mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat n$$
        Only the **tangential** part of $\mathbf H$ jumps; the normal part of $\mathbf B$ is continuous ($\oint\mathbf B\cdot d\mathbf S = 0$). The formula sheet also writes it as $\hat n\times(\mathbf H^+ - \mathbf H^-) = \mathbf J_s$. Spring 2018 1(vi) is one line of this.
      `),
      Q(md`**Predict.** A sheet $\mathbf J_s = 4\hat x$ A/m lies on $z = 0$. Just below it $\mathbf H = 2\hat y$ A/m. Just above it, $\mathbf H = $`,
        ['$-2\\hat y$ A/m', '$6\\hat y$ A/m', '$2\\hat y + 4\\hat x$ A/m', '$0$'], 0,
        [null, 'That uses $\\hat n\\times\\mathbf J_s$; the jump is $\\mathbf J_s\\times\\hat n = 4\\hat x\\times\\hat z = -4\\hat y$.', 'The jump is perpendicular to $\\mathbf J_s$, not along it.', 'That uses half the jump, $\\tfrac12\\mathbf J_s\\times\\hat n$; crossing the sheet flips its field, a change of the full $\\mathbf J_s\\times\\hat n$.'],
        md`$\hat n = +\hat z$ (from below into above). $\mathbf J_s\times\hat n = 4\,\hat x\times\hat z = -4\hat y$. $\mathbf H^+ = 2\hat y - 4\hat y = -2\hat y$ A/m.`),
      RF(md`
        ### The method

        !!method Planar and superposition problems
          1. **Split the source** into pieces with known fields: sheets $\tfrac12\mathbf J_s\times\hat n$; slabs (a sheet $\mathbf JW$ outside, $(\mathbf J\times\hat n)s$ inside, zero on the center plane); lines $I/2\pi r$ with $\hat\phi = \hat I\times\hat r$; uniform cylinders $\tfrac12\mathbf J\times\mathbf r_\perp$ inside; holes as negative current.
          2. **For each piece**, find $\hat n$ (from the piece toward the point) or $\hat r$, and the direction from the cross product.
          3. **Add vectors**, component by component.
          4. **Check:** $\mathbf H$ is continuous through volume currents and jumps by $\mathbf J_s\times\hat n$ across a sheet; far outside a set of sheets and slabs whose currents add to zero, $\mathbf H = 0$.

        ### Worked example

        !!graded Problem
          (Summer 2019 #2(a).) Two infinite slabs carry $\mathbf J = J_z\hat z$: slab 1 fills $-2 < x < -1$ m with $J_{1z} = 4$ A/m²; slab 2 fills $1 < x < 3$ m with $J_{2z} = -2$ A/m². (i) Find $\mathbf H$ on the $x$-axis at $x = -3, -1.5, 0, 1.5, 3$ m. (ii) Plot $H_x(x)$ and $H_y(x)$ for $-3 < x < 3$ m. (iii) What changes if a sheet $2\hat z$ A/m is added on $x = 0$?

        [[fig:s19]]

        **1. Each slab alone.** For $\mathbf J\parallel\hat z$ and normal $\hat x$: $\hat z\times\hat x = \hat y$, so only $H_y$ appears, and $H_x = 0$ everywhere. Inside, $H_y = J(x - x_c)$; outside, $\pm JW/2$ ($+$ on the $+x$ side).
        - Slab 1: $x_c = -1.5$ m, $J_{s,\text{eq}} = (4)(1) = 4$ A/m: $H_{1y} = -2$ for $x < -2$, $4(x + 1.5)$ inside, $+2$ A/m for $x > -1$.
        - Slab 2: $x_c = 2$ m, $J_{s,\text{eq}} = (-2)(2) = -4$ A/m: $H_{2y} = +2$ for $x < 1$, $-2(x - 2)$ inside, $-2$ A/m for $x > 3$.

        **2. (i) Add.**

        | $x$ (m) | $-3$ | $-1.5$ | $0$ | $1.5$ | $3$ |
        |---|---|---|---|---|---|
        | $H_{1y}$ | $-2$ | $0$ | $2$ | $2$ | $2$ |
        | $H_{2y}$ | $2$ | $2$ | $2$ | $1$ | $-2$ |
        | $H_y$ (A/m) | $0$ | $2$ | $4$ | $3$ | $0$ |

        **3. (ii)** $H_x = 0$. $H_y$: zero for $x < -2$, rising linearly to 4 A/m at $x = -1$, flat to $x = 1$, falling linearly to 0 at $x = 3$ (solid curve below).

        **4. (iii)** The sheet adds $\tfrac12(2\hat z)\times(\pm\hat x) = \pm\hat y$ A/m: $-1$ for $x < 0$, $+1$ for $x > 0$. New values: $-\hat y$, $\hat y$, then at $x = 0$ a jump from $3\hat y$ to $5\hat y$ (on the sheet itself $\mathbf H$ is not defined), $4\hat y$, $\hat y$ A/m (dashed curve).

        [[fig:s19p]]

        **5. Check.** The slabs' currents add to zero ($4 - 4 = 0$ A/m), so $\mathbf H = 0$ outside both. ✓ The sheet's jump: $\mathbf J_s\times\hat x = 2\hat z\times\hat x = 2\hat y$, from 3 to 5. ✓ The key agrees, except that at $x = 0$ it lists $4\hat y$, the average of the two sides. The conflict exam's #2(a) is this problem turned (slabs in $y$, $\mathbf J$ along $\hat x$, sheet $-2\hat x$ A/m on $y = 0$): (i) $0, 3\hat z, 4\hat z, 2\hat z, 0$; (iii) $\hat z, 4\hat z$, a jump from $5\hat z$ to $3\hat z$, then $\hat z, -\hat z$ A/m. Its handwritten key lists (iii) wrongly.

        !!mistake Common mistakes
          - $\hat n$ pointing **toward** the sheet. It points from the sheet to the point, and flips across the sheet.
          - Using $J$ (A/m²) as a sheet current. A slab acts outside like $J_s = JW$.
          - Putting the zero of a slab's field at $z = 0$ instead of at its center plane.
          - Adding magnitudes of perpendicular contributions. Sheets with currents along $\hat y$ and $\hat z$ give fields along different axes.
          - Delta units: $\delta(x)$ is 1/m, so the coefficient of $\delta(x)\delta(y)$ is in A and that of $\delta(z)$ in A/m.
          - Asking for $\mathbf H$ **on** a sheet. It jumps there; give the values on the two sides.
          - Using the jump condition for the normal component. Only tangential $\mathbf H$ jumps; normal $\mathbf B$ is continuous.

        ### Check questions
      `, { s19: { svg: s19Fig(), cap: 'Summer 2019 #2(a): slab 1 (4 A/m², out of the page) and slab 2 (−2 A/m², into the page).' }, s19p: { svg: s19Plot(), cap: 'H_y(x): slabs alone (solid), and with the 2ẑ A/m sheet on x = 0 (dashed).' } }),
      Q(md`A sheet current $\mathbf J_s = 2\hat y$ A/m lies on the $z = 0$ plane in free space. The field in $z < 0$ is $\mathbf H = 3\hat z$ A/m. The field in $z > 0$ is…`,
        ['$\\mathbf H = 2\\hat x + 3\\hat z$ A/m', '$\\mathbf H = 1\\hat z$ A/m', '$\\mathbf H = 5\\hat z$ A/m', '$\\mathbf H = -2\\hat x + 3\\hat z$ A/m', '$\\mathbf H = -2\\hat y + 3\\hat z$ A/m'], 0,
        [null, 'The normal component is continuous; the jump is tangential.', 'The normal component is continuous; the jump is tangential.', 'That is $\\hat n\\times\\mathbf J_s$: the order is $\\mathbf J_s\\times\\hat n$.', 'The jump is perpendicular to $\\mathbf J_s$, not along it.'],
        md`$\mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat n = 2\,\hat y\times\hat z = 2\hat x$. So $\mathbf H^+ = 2\hat x + 3\hat z$ A/m. (Spring 2018, 1(vi), where it is option (d).)`, { src: 'Spring 2018 Exam 2' }),
      Q(md`In $\mathbf J(x, y, z) = I_0[\delta(x)\delta(y)\,\hat z + \delta(y)\delta(z)\,\hat x]$ A/m² (coordinates in meters), the parameter $I_0$ has units of…`,
        ['A', 'A/m', 'A/m²', 'A·m'], 0,
        [null, 'That would go with a single delta function (a sheet).', 'That would go with no delta at all.', 'Deltas carry 1/m each; they never multiply by meters.'],
        md`$\delta(x)\delta(y)$ is in 1/m², so $I_0 = [\mathbf J]\cdot\text{m}^2$ is in A: each term is a line current of $I_0$ amperes. (Summer 2017, 1(a)(i).)`, { src: 'Summer 2017 Exam 2' }),
      Q(md`For the same $\mathbf J = I_0[\delta(x)\delta(y)\,\hat z + \delta(y)\delta(z)\,\hat x]$, the field at $(1, 0, -1)$ is $\mathbf H = 4\hat y$ A/m. Then $I_0 = $`,
        ['$4\\pi$ A', '$8\\pi$ A', '$2\\pi$ A', '$4$ A'], 0,
        [null, 'That counts only one of the two wires; both give $I_0/2\\pi$ along $\\hat y$.', 'Each wire gives $I_0/2\\pi$, not $I_0/\\pi$.', 'That drops the $2\\pi$ of the line-current field.'],
        md`$z$-axis wire: $\frac{I_0}{2\pi(1)}\,\hat z\times\hat x = \frac{I_0}{2\pi}\hat y$. $x$-axis wire: $\frac{I_0}{2\pi(1)}\,\hat x\times(-\hat z) = \frac{I_0}{2\pi}\hat y$. Sum $\frac{I_0}{\pi} = 4$, so $I_0 = 4\pi$ A. (Summer 2017, 1(a)(iii).)`, { src: 'Summer 2017 Exam 2' }),
      Q(md`In $\mathbf J = P\,\delta(x)\delta(y)\,\hat z + Q\,\delta(z)\,\hat x$ A/m², the units of $P$ and $Q$ are…`,
        ['$P$ in A, $Q$ in A/m', '$P$ in A/m, $Q$ in A', 'both in A', 'both in A/m²'], 0,
        [null, 'Reversed: two deltas make a line (A), one makes a sheet (A/m).', 'One delta leaves one factor of meters: A/m.', 'Each delta removes a factor of 1/m from A/m².'],
        md`$P\delta(x)\delta(y)$: line current $P$ in A on the $z$-axis. $Q\delta(z)$: sheet $Q\hat x$ in A/m on $z = 0$. (Summer 2018, 1(b)(i).)`, { src: 'Summer 2018 Exam 2' }),
      Q(md`With $P = Q = 1$ in $\mathbf J = P\,\delta(x)\delta(y)\,\hat z + Q\,\delta(z)\,\hat x$, $\mathbf H(1, 0, 1) = $`,
        ['$\\frac{1 - \\pi}{2\\pi}\\,\\hat y$ A/m', '$\\frac{2 - \\pi}{2\\pi}\\,\\hat y$ A/m', '$\\frac{1 + \\pi}{2\\pi}\\,\\hat y$ A/m', '$\\frac{1}{2\\pi}\\,\\hat y$ A/m'], 0,
        [null, 'That is the handwritten key\'s answer, an arithmetic slip: $\\frac{1}{2\\pi} - \\frac12 = \\frac{1 - \\pi}{2\\pi}$.', 'The sheet\'s field above $z = 0$ is $\\tfrac12\\hat x\\times\\hat z = -\\tfrac12\\hat y$: it subtracts.', 'The sheet contributes too.'],
        md`Line: $\frac{1}{2\pi(1)}\,\hat z\times\hat x = \frac{1}{2\pi}\hat y$. Sheet, point above it: $\tfrac12\,\hat x\times\hat z = -\tfrac12\hat y$. Sum: $\left(\frac{1}{2\pi} - \frac12\right)\hat y = \frac{1 - \pi}{2\pi}\hat y \approx -0.341\,\hat y$ A/m. (Summer 2018, 1(b)(iii); the key's $(2 - \pi)/2\pi$ is an arithmetic error.)`, { src: 'Summer 2018 Exam 2' }),
      Q(md`$\mathbf J = 2\hat x\,\delta(y)\delta(z) - 4\hat y\,\delta(x)\delta(z)$ A/m². The DC flux density at $(1, 1, 0)$ m is…`,
        ['$\\dfrac{3\\mu_0}{\\pi}\\hat z$ T', '$\\dfrac{\\mu_0}{\\pi}\\hat z$ T', '$-\\dfrac{3\\mu_0}{\\pi}\\hat z$ T', '$\\dfrac{3\\mu_0}{2\\pi}\\hat z$ T'], 0,
        [null, 'That is only the 2 A wire; the 4 A wire adds $2\\mu_0/\\pi$ in the same direction.', 'Both wires give $+\\hat z$ there: $\\hat x\\times\\hat y = \\hat z$ and $(-\\hat y)\\times\\hat x = \\hat z$.', 'Each wire is $\\mu_0I/2\\pi r$ with $r = 1$: $\\mu_0/\\pi + 2\\mu_0/\\pi$.'],
        md`2 A on the $x$-axis: $\frac{\mu_0(2)}{2\pi(1)}\hat z$. 4 A along $-\hat y$ on the $y$-axis: $\frac{\mu_0(4)}{2\pi(1)}\,(-\hat y)\times\hat x = \frac{2\mu_0}{\pi}\hat z$. Sum $3\mu_0/\pi\,\hat z$. (Summer 2020, 2(a)(i).)`, { src: 'Summer 2020 Exam 2' }),
      Q(md`For the same $\mathbf J$, a point where $\mathbf B = 0$ is…`,
        ['$(-2, 1, 0)$', '$(2, 1, 0)$', '$(1, -2, 0)$', '$(0, 0, 1)$'], 0,
        [null, 'In the first quadrant both wires give $+\\hat z$: they add.', 'There the two fields are opposite but unequal: $\\frac{\\mu_0}{2\\pi}(-1 + 4)$. The null line is $x = -2y$, not $y = -2x$.', 'Off the $z = 0$ plane each wire\'s field has a part the other cannot cancel.'],
        md`In $z = 0$: $B_z = \frac{\mu_0}{2\pi}\left(\frac{2}{y} + \frac{4}{x}\right) = 0$ on $x = -2y$. (Summer 2020, 2(a)(ii).)`, { src: 'Summer 2020 Exam 2' }),
      Q(md`Two wide parallel plates (width $w$, spacing $d \ll w$) carry $I$ out along the top plate and back along the bottom one. Between the plates, $B = $`,
        ['$\\mu_0I/w$', '$\\mu_0I/2w$', '$0$', '$\\mu_0I/2\\pi d$'], 0,
        [null, 'That is one plate. Between opposite sheets the two fields add.', 'Opposite sheets cancel **outside**, not between.', 'That is a line current; wide plates act as sheets, $J_s = I/w$.'],
        md`Each plate is a sheet $J_s = I/w$; between them the fields add: $H = J_s$, $B = \mu_0I/w$. Outside they cancel. (Spring 2018 #3(b).)`),
      Q(md`Two parallel sheets carry equal currents in the **same** direction. Between them $\mathbf H$ is…`,
        ['zero', '$J_s$', '$J_s/2$', 'along the currents'], 0,
        [null, 'That is the opposite-current case.', 'That is one sheet alone.', 'A sheet\'s field is always perpendicular to its current.'],
        md`Between the sheets the two $\hat n$s point opposite ways, so the two $\tfrac12\mathbf J_s\times\hat n$ cancel.`),
      Q(md`Outside a slab of thickness $W$ carrying uniform $J$, $|\mathbf H|$ is…`,
        ['$JW/2$, at any distance', '$JW$', '$J/2$', '$JW/2$, falling off with distance'], 0,
        [null, 'That is twice too big: the slab acts as a sheet $JW$, and a sheet gives half of its $J_s$.', 'That treats $J$ (A/m²) as a sheet current; multiply by $W$ first.', 'Like a sheet, the slab\'s field outside does not fall off.'],
        md`Outside, the slab is equivalent to one sheet with $J_s = JW$: $|\mathbf H| = JW/2$.`),
      R(md`
        ### Rapid fire: one sheet

        **The trick:** $\hat n$ from the sheet toward the point, then $\tfrac12\mathbf J_s\times\hat n$ by the cyclic order $\hat x\to\hat y\to\hat z\to\hat x$. Across a sheet, add the whole $\mathbf J_s\times\hat n$ (from side − to side +).

        Short questions with a new situation every time: reason, answer in 10–20 seconds. Eight right completes a card.
      `),
      Object.assign(G('rf_t6_sheet', { need: 8 }), { id: 't6-sheets.r0' }),
      R(md`
        ### Rapid fire: superposition

        **The trick:** pairs: opposite currents fill the gap ($J_s$) and leave the outside empty; same currents do the reverse. Slabs: $JW/2$ outside, $Js$ inside. Holes: $\tfrac12Jd$. Deltas: each one costs a factor of 1/m.
      `),
      Object.assign(G('rf_t6_super', { need: 8 }), { id: 't6-sheets.r1' }),
      R(md`
        ### Problems with new numbers every time

        Press **New problem** for fresh values. Two correct answers without opening the solution complete each one.
      `),
      G('t6_pair', { need: 2 }),
      G('t6_slabs', { need: 2 }),
      G('t6_hole', { need: 2 }),
      G('t6_delta', { need: 2 }),
    ],
  });

  // ---------------------------------------------------------------- rapid fire
  GENS.rf_t6_sheet = () => one([
    // direction of H from one sheet
    () => {
      const n = pick(AX), c = pick(AX.filter((k) => k !== n)), sc0 = pick([1, -1]), side = pick([1, -1]);
      const H = sc(side, cross(e(c, sc0), e(n)));
      return MC('One sheet', md`A sheet on the plane $${n} = 0$ carries $\mathbf J_s$ along $${sc0 > 0 ? '+' : '-'}\hat ${c}$. At a point with $${n} ${side > 0 ? '> 0' : '< 0'}$, $\mathbf H$ points along…`, unitT(H),
        [[unitT(sc(-1, H)), '$\\hat n$ points from the sheet **toward** the point; that flips with the side.'], [unitT(e(c, sc0)), 'A sheet\'s field is perpendicular to its current.'], [unitT(e(n, side)), 'A sheet\'s field is parallel to the sheet, never along its normal.']],
        md`$\hat n = ${side > 0 ? '+' : '-'}\hat ${n}$. $\tfrac12\mathbf J_s\times\hat n\ \propto\ (${sc0 > 0 ? '+' : '-'}\hat ${c})\times(${side > 0 ? '+' : '-'}\hat ${n}) = ${unitT(H).slice(1, -1)}$.`);
    },
    // boundary condition
    () => {
      const n = pick(AX), c = pick(AX.filter((k) => k !== n)), K = pick([1, 2, 3, 4]) * pick([1, -1]);
      const t = AX.find((k) => k !== n && k !== c);
      const Hm = add(sc(pick([1, 2, 3]) * pick([1, -1]), e(t)), sc(pick([0, 1, 2]), e(n)));
      const jump = cross(sc(K, e(c)), e(n));
      const o = (v) => `$${vecT(v)}$ A/m`;
      return MC('Across a sheet', md`A sheet $\mathbf J_s = ${K}\hat ${c}$ A/m lies on $${n} = 0$. Just on the $${n} < 0$ side, $\mathbf H = ${vecT(Hm)}$ A/m. Just on the $${n} > 0$ side, $\mathbf H = $`, o(add(Hm, jump)),
        [[o(add(Hm, sc(-1, jump))), 'That uses $\\hat n\\times\\mathbf J_s$; the jump is $\\mathbf J_s\\times\\hat n$ with $\\hat n$ from − to +.'], [o(add(Hm, sc(0.5, jump))), 'Crossing the sheet flips its own field: the change is the full $\\mathbf J_s\\times\\hat n$, not half.'], [o(add(Hm, sc(K, e(c)))), 'The jump is perpendicular to $\\mathbf J_s$.'], [o(Hm), 'A sheet current makes tangential $\\mathbf H$ jump.']],
        md`$\hat n = +\hat ${n}$. $\mathbf J_s\times\hat n = ${K}\,\hat ${c}\times\hat ${n} = ${vecT(jump)}$; add it to $\mathbf H^-$. The normal part is unchanged.`);
    },
    // magnitude, any distance
    () => {
      const K = pick([2, 4, 5, 10, 20]), d = pick([0.01, 0.5, 2, 100]), wantB = pick([true, false]);
      const H = K / 2;
      const o = (x) => (wantB ? `${p(r3(MU0 * x * 1e6))} µT` : `${p(r3(x))} A/m`);
      return MC('How strong', md`An infinite sheet carries $J_s = ${K}$ A/m. ${wantB ? '$B$' : '$H$'} at $${p(d)}$ m from it is…`, o(H),
        [[o(K), 'That is two sheets with opposite currents; one sheet gives $J_s/2$.'], [o(K / (2 * Math.PI * d)), 'That is a line current\'s $1/2\\pi r$; a sheet\'s field does not fall off.'], [o(K / (2 * d)), 'The distance does not enter.']],
        md`$H = J_s/2 = ${p(H)}$ A/m${wantB ? `, $B = \\mu_0H = ${p(r3(MU0 * H * 1e6))}\\ \\mu\\text{T}$` : ''}, at any distance.`);
    },
  ]);

  GENS.rf_t6_super = () => one([
    // pairs
    () => {
      const same = pick([true, false]), where = pick(['between', 'outside']), K = pick([2, 4, 6, 10]);
      const ans = (same === (where === 'outside')) ? `$${K}$ A/m` : '$0$';
      const other = ans === '$0$' ? `$${K}$ A/m` : '$0$';
      return MC('Two sheets', md`Two parallel sheets carry $${K}$ A/m each, in ${same ? 'the **same** direction' : '**opposite** directions'}. $|\mathbf H|$ ${where === 'between' ? 'between them' : 'outside them'} is…`, ans,
        [[other, same ? 'Same-direction sheets cancel between and add outside.' : 'Opposite sheets add between and cancel outside.'], [`$${K / 2}$ A/m`, 'That is one sheet alone; here two sheets either add or cancel.'], [`$${2 * K}$ A/m`, 'Each sheet gives $J_s/2$; two add to $J_s$.']],
        md`Each sheet gives $J_s/2$. ${same ? 'Same direction' : 'Opposite directions'}: they ${(same === (where === 'outside')) ? 'add' : 'cancel'} ${where}.`);
    },
    // slab
    () => {
      const J = pick([1, 2, 3, 4, 5]), [where, s] = pick([['outside', null], ['on the center plane', 0], ['inside, 0.5 m from the center plane', 0.5], ['inside, 1 m from the center plane', 1]]), W = pick(s === 1 ? [4, 6] : [2, 4, 6]);
      const val = s === null ? J * W / 2 : J * s;
      const o = (x) => `$${p(r3(x))}$ A/m`;
      return MC('A slab', md`A slab of thickness $${W}$ m carries a uniform $J = ${J}$ A/m². $|\mathbf H|$ ${where} is…`, val === 0 ? '$0$' : o(val),
        [[o(J * W), 'Outside, the slab is a sheet $JW$, and a sheet gives half of it.'], [o(J / 2), 'That treats $J$ (A/m²) as a sheet current.'], [s === 0 ? o(J * W / 2) : '$0$', s === 0 ? 'On the center plane the two halves cancel.' : 'Only the center plane has zero field.'], [o(J * W / 4), 'Outside it is $JW/2$; inside it is $J$ times the distance from the center plane.']],
        md`Outside: $JW/2 = ${p(J * W / 2)}$ A/m. Inside: $J\times$(distance from the center plane). Center plane: 0.`);
    },
    // delta units
    () => {
      const [form, ans, why] = pick([
        ['K\\,\\delta(z)\\,\\hat x', 'A/m', [['A', 'One delta leaves A/m: a sheet.'], ['A/m²', 'The delta carries 1/m.'], ['A·m', 'Deltas divide by meters.']]],
        ['I\\,\\delta(x)\\delta(y)\\,\\hat z', 'A', [['A/m', 'Two deltas: 1/m² comes from them.'], ['A/m²', 'The deltas carry 1/m².'], ['A·m', 'Deltas divide by meters.']]],
        ['K\\,\\delta(y - 3)\\,\\hat z', 'A/m', [['A', 'One delta: a sheet, A/m (on the plane $y = 3$).'], ['A/m²', 'The delta carries 1/m.'], ['A·m', 'Deltas divide by meters.']]],
        ['J_0\\,\\hat y\\ \\text{(no delta)}', 'A/m²', [['A/m', 'With no delta the coefficient is the volume density itself.'], ['A', 'With no delta the coefficient is the volume density itself.'], ['A·m', 'With no delta the coefficient is the volume density itself.']]],
      ]);
      return MC('Delta units', md`$\mathbf J = ${form}$ is in A/m². The coefficient is in…`, ans, why, md`Each $\delta$ carries 1/m. Line: A. Sheet: A/m. Volume: A/m².`);
    },
    // the hole
    () => {
      const [q, r, w] = pick([
        ['You double the offset $d$ of the hole, same $J$. The field in the hole', 'doubles', [['stays the same', '$|\\mathbf H| = Jd/2$.'], ['quadruples', 'Linear in $d$.'], ['halves', 'A larger offset means a larger field.']]],
        ['You enlarge the hole\'s radius $b$, same $J$ and $d$ (it still fits). The field in the hole', 'stays the same', [['grows', '$\\tfrac12\\mathbf J\\times\\mathbf d$ has no $b$ in it.'], ['shrinks', '$\\tfrac12\\mathbf J\\times\\mathbf d$ has no $b$ in it.'], ['becomes nonuniform', 'It is uniform for any hole that fits.']]],
        ['You move the hole to the center ($d = 0$). The field in the hole', 'becomes zero', [['stays the same', '$\\tfrac12\\mathbf J\\times\\mathbf d$ vanishes for $d = 0$.'], ['doubles', 'A centered hole is a tube: no field inside.'], ['becomes $J b/2$', 'A centered hole is a tube: no field inside.']]],
        ['$\\mathbf J = J\\hat z$ and the hole is offset along $+\\hat y$. The field in the hole points along', '$-\\hat x$', [['$+\\hat x$', '$\\hat z\\times\\hat y = -\\hat x$.'], ['$+\\hat y$', 'The field is perpendicular to the offset.'], ['$+\\hat z$', 'The field is perpendicular to the current.']]],
      ]);
      return MC('A hole', md`A long cylinder carries uniform $\mathbf J$ and has an empty off-axis hole. ${q}…`, r, w, md`In the hole $\mathbf H = \tfrac12\mathbf J\times\mathbf d$: uniform, $\propto d$, perpendicular to $\mathbf d$ and to $\mathbf J$.`);
    },
    // plates
    () => {
      const I = pick([1, 2, 5, 10]), wc = pick([1, 2, 5, 10]);
      const H = I / (wc / 100);
      const o = (x) => `${p(r3(x))} A/m`;
      return MC('Two plates', md`Two plates $${wc}$ cm wide, close together, carry $${I}$ A out along one and back along the other. $H$ between them is…`, o(H),
        [[o(H / 2), 'That is one plate. Opposite sheets add between.'], [o(I / wc), 'Convert the width to meters.'], ['$0$', 'Opposite sheets cancel outside, not between.']],
        md`$J_s = I/w = ${p(H)}$ A/m on each plate; between them $H = J_s$.`);
    },
  ]);

  // ---------------------------------------------------------------- problems with new numbers
  // HW 5 #2 style: two sheets x = -d1 and x = +d2, currents along y or z; H at a point on the x-axis
  GENS.t6_pair = () => {
    const d1 = pick([1, 2, 3]), d2 = pick([1, 2, 3]);
    const a1 = pick(['y', 'z']), a2 = pick(['y', 'z']), K1 = pick([1, 2, 3, 4, 6]) * pick([1, -1]), K2 = pick([1, 2, 3, 4, 6]) * pick([1, -1]);
    const x0 = pick([0, 0, -d1 - 1, d2 + 1]);
    const H = add(sc(0.5, cross(sc(K1, e(a1)), e('x', sgn(x0 + d1)))), sc(0.5, cross(sc(K2, e(a2)), e('x', sgn(x0 - d2)))));
    const s = Math.max(Math.abs(K1), Math.abs(K2)) / 2;
    const n1 = sgn(x0 + d1) > 0 ? '+' : '-', n2 = sgn(x0 - d2) > 0 ? '+' : '-';
    return {
      title: 'Two current sheets',
      q: md`Sheet 1 on the plane $x = -${d1}$ m carries $\mathbf J_s = ${K1}\,\hat ${a1}$ A/m. Sheet 2 on $x = ${d2}$ m carries $\mathbf J_s = ${K2}\,\hat ${a2}$ A/m. Find $\mathbf H$ at $P = (${x0}, 0, 0)$ m: give $H_y$ and $H_z$.`,
      parts: [numOrZero('H_y', H[1], 'A/m', s), numOrZero('H_z', H[2], 'A/m', s)],
      hints: [`$\\hat n$ points from each sheet toward $P$: here $${n1}\\hat x$ for sheet 1 and $${n2}\\hat x$ for sheet 2.`, 'Each sheet gives $\\tfrac12\\mathbf J_s\\times\\hat n$; use $\\hat y\\times\\hat x = -\\hat z$ and $\\hat z\\times\\hat x = \\hat y$. Add the two.'],
      sol: sol({
        eq: md`$\mathbf H = \tfrac12\mathbf J_{s1}\times\hat n_1 + \tfrac12\mathbf J_{s2}\times\hat n_2$, with each $\hat n$ from its sheet toward $P$.`,
        sym: md`$\hat n_1 = ${n1}\hat x$, $\hat n_2 = ${n2}\hat x$.`,
        sub: md`$$\mathbf H = \tfrac12(${K1})\,\hat ${a1}\times(${n1}\hat x) + \tfrac12(${K2})\,\hat ${a2}\times(${n2}\hat x) = ${joinT(vecT(sc(0.5, cross(sc(K1, e(a1)), e('x', sgn(x0 + d1))))), vecT(sc(0.5, cross(sc(K2, e(a2)), e('x', sgn(x0 - d2))))))}$$`,
        ans: md`$\mathbf H(P) = ${vecT(H)}$ A/m: $H_y = ${r3(H[1])}$, $H_z = ${r3(H[2])}$ A/m.`,
        check: md`The distances never entered: only which side of each sheet $P$ is on. ${a1 === a2 ? 'Both currents are along the same axis, so the field has one component.' : 'The currents are perpendicular, so their fields are too.'}`,
      }),
    };
  };

  // Summer 2019 #2(a), HW 5 #3 style: one or two slabs along x with J along z, optionally a sheet; H_y at three points
  GENS.t6_slabs = () => {
    const two = pick([true, true, false]);
    let slabs;
    if (two) {
      const lo1 = pick([-4, -3]), hi1 = lo1 + pick([1, 2]), lo2 = pick([0, 1]), hi2 = lo2 + pick([1, 2]);
      slabs = [[lo1, hi1, pick([1, 2, 3, 4]) * pick([1, -1])], [lo2, hi2, pick([1, 2, 3, 4]) * pick([1, -1])]];
    } else {
      const lo = pick([-4, -3, -2]), hi = lo + pick([2, 4]);
      slabs = [[lo, hi, pick([1, 2, 3, 4]) * pick([1, -1])]];
    }
    const sheet = pick([null, null, [pick([-1, 0, 2]).toString(), pick([1, 2, -2])]]);
    const s0 = sheet ? +sheet[0] : null, K = sheet ? sheet[1] : 0;
    const Hy = (x) => slabHy(x, slabs) + (sheet ? 0.5 * K * sgn(x - s0) : 0);
    const cands = [-4.5, -3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5].filter((x) => !sheet || Math.abs(x - s0) > 0.1);
    const pts = U.shuffle(cands).slice(0, 3).sort((a, b) => a - b);
    const sz = Math.max(...slabs.map(([lo, hi, J]) => Math.abs(J) * (hi - lo) / 2));
    const desc = slabs.map(([lo, hi, J], i) => `${two ? `slab ${i + 1}` : 'a slab'} fills $${lo} < x < ${hi}$ m with $J_z = ${J}$ A/m²`).join('; ');
    return {
      title: two ? 'Two slabs' : 'A slab',
      q: md`${two ? 'Infinite slabs carry' : 'An infinite slab carries'} $\mathbf J = J_z\hat z$: ${desc}.${sheet ? ` A sheet $\\mathbf J_s = ${K}\\,\\hat z$ A/m lies on $x = ${s0}$ m.` : ''} Find $H_y$ on the $x$-axis at $x = ${pts.join(', ')}$ m.`,
      parts: pts.map((x) => numOrZero(`H_y(${x})`, Hy(x), 'A/m', sz)),
      hints: ['$\\hat z\\times\\hat x = \\hat y$: each slab gives $H_y = +JW/2$ on its $+x$ side, $-JW/2$ on its $-x$ side, and $J(x - x_c)$ inside ($x_c$ its center).', sheet ? 'The sheet adds $\\pm\\tfrac12J_s$ to $H_y$: $+$ for $x$ above its plane, $-$ below.' : 'Add the slabs\' contributions point by point.'],
      sol: sol({
        eq: md`Each slab: $H_y = J\,\text{clamp}(x - x_c, -W/2, W/2)$ (sheet $JW$ outside, linear inside, zero at the center plane)${sheet ? '; the sheet: $H_y = \\tfrac12J_s\\,\\text{sgn}(x - x_s)$' : ''}. Superpose.`,
        sym: md`${slabs.map(([lo, hi, J], i) => `Slab ${i + 1}: $x_c = ${(lo + hi) / 2}$, $W = ${hi - lo}$, $JW/2 = ${J * (hi - lo) / 2}$ A/m.`).join(' ')}`,
        sub: md`${pts.map((x) => `$H_y(${x}) = ${slabs.map(([lo, hi, J]) => `(${r3(J * Math.max(-(hi - lo) / 2, Math.min((hi - lo) / 2, x - (lo + hi) / 2)))})`).join(' + ')}${sheet ? ` + (${0.5 * K * sgn(x - s0)})` : ''} = ${r3(Hy(x))}$ A/m`).join('; ')}.`,
        ans: md`${pts.map((x) => `$H_y(${x}) = ${r3(Hy(x))}$`).join(', ')} A/m; $H_x = H_z = 0$.`,
        check: md`Far to the left, $H_y = -\tfrac12(\text{total } J_s) = ${r3(-0.5 * (slabs.reduce((s, [lo, hi, J]) => s + J * (hi - lo), 0) + K))}$ A/m; far to the right, the opposite. $H_y$ is continuous everywhere except across the sheet.`,
      }),
    };
  };

  // HW 5 #4(c)(d): a cylinder with an off-axis hole
  GENS.t6_hole = () => {
    const acm = pick([2, 3, 4, 5]), bf = pick([0.2, 0.3, 0.4]), df = pick([0.4, 0.5]), I = pick([5, 10, 20, 50]), sI = pick([1, -1]), off = pick(['x', 'y']);
    const a = acm / 100, b = bf * a, d = df * a;
    const Jc = I / (Math.PI * (a * a - b * b));
    const Jv = e('z', sI * Jc), dv = sc(d, e(off));
    // H of a uniform round current (J along z) centered at c with radius R, at P (in the xy-plane)
    const Hcyl = (Jvec, c, Rr, P) => { const rp = [P[0] - c[0], P[1] - c[1], 0]; const r2 = rp[0] ** 2 + rp[1] ** 2; return sc(0.5 * (r2 < Rr * Rr ? 1 : Rr * Rr / r2), cross(Jvec, rp)); };
    const Bat = (P) => sc(MU0, add(Hcyl(Jv, [0, 0, 0], a, P), sc(-1, Hcyl(Jv, dv, b, P))));
    const Bh = Bat(dv), P2 = sc(-1, dv), B2 = Bat(P2);
    const ax = off === 'x' ? 1 : 0;                                    // the axis the hole field lies along
    const DIRS = ['$+\\hat x$', '$-\\hat x$', '$+\\hat y$', '$-\\hat y$'];
    const di = Bh[0] > 1e-15 ? 0 : Bh[0] < -1e-15 ? 1 : Bh[1] > 0 ? 2 : 3;
    const comp = AX[ax];
    return {
      title: 'A cylinder with a hole',
      q: md`A long cylinder of radius $a = ${acm}$ cm on the $z$-axis carries $I = ${I}$ A along $${sI > 0 ? '+' : '-'}\hat z$, uniformly over its conducting cross-section. It has an empty hole of radius $b = ${p(b * 100)}$ cm whose axis is parallel to $\hat z$ and passes through $${off === 'x' ? `(${p(d * 100)}\\,\\text{cm}, 0)` : `(0, ${p(d * 100)}\\,\\text{cm})`}$. Find the current density, $|\mathbf B|$ and its direction in the hole, and $B_${comp}$ at the point $${off === 'x' ? `(-${p(d * 100)}\\,\\text{cm}, 0)` : `(0, -${p(d * 100)}\\,\\text{cm})`}$ on the far side of the axis.`,
      parts: [
        N('|\\mathbf J|', Jc / 1000, 'kA/m²'),
        N('|\\mathbf B|\\ \\text{in the hole}', Math.hypot(...Bh) * 1e6, 'µT'),
        { lbl: 'In the hole $\\mathbf B$ points along', mc: DIRS, a: di, fixed: true, why: DIRS.map((_, i) => (i === di ? null : 'Use $\\tfrac12\\mathbf J\\times\\mathbf d$, with $\\mathbf d$ from the cylinder\'s axis to the hole\'s axis.')) },
        N(`B_${comp}\\ \\text{at the far point}`, B2[ax] * 1e6, 'µT'),
      ],
      hints: ['$J = I/\\pi(a^2 - b^2)$. Treat the hole as the full cylinder ($\\mathbf J$) plus a hole-sized cylinder carrying $-\\mathbf J$.', 'In the hole: $\\mathbf H = \\tfrac12\\mathbf J\\times\\mathbf d$. At the far point the hole cylinder is a line current $-J\\pi b^2$ at distance $2d$: $H = \\dfrac{Jb^2}{2(2d)}$, direction by $\\hat I\\times\\hat r$.'],
      sol: sol({
        eq: md`Superposition: $\mathbf H = \mathbf H_{\text{full}}(\mathbf J) + \mathbf H_{\text{hole}}(-\mathbf J)$, with $\tfrac12\mathbf J\times\mathbf r_\perp$ inside a uniform cylinder and $\dfrac{JR^2}{2r}\hat\phi$ outside it.`,
        sym: md`$J = \dfrac{I}{\pi(a^2 - b^2)}$. In the hole: $\mathbf B = \tfrac12\mu_0\mathbf J\times\mathbf d$, $|\mathbf B| = \mu_0Jd/2$. At $-\mathbf d$: $\mathbf B = \tfrac12\mu_0\mathbf J\times(-\mathbf d) - \mu_0\dfrac{b^2}{2(2d)^2}\mathbf J\times(-2\mathbf d)$, i.e. $\left(-\dfrac{d}{2} + \dfrac{b^2}{4d}\right)\mu_0\,\mathbf J\times\hat d$.`,
        sub: md`$$J = \frac{${I}}{\pi\left((${p(a)})^2 - (${p(b)})^2\right)} = ${f(Jc)}\ \text{A/m}^2, \qquad |\mathbf B| = \frac{(4\pi\times10^{-7})(${f(Jc)})(${p(d)})}{2} = ${f(Math.hypot(...Bh) * 1e6)}\ \mu\text{T}$$ $$B_${comp}(-\mathbf d) = ${f(B2[ax] * 1e6)}\ \mu\text{T}$$`,
        ans: md`$J = ${f(Jc / 1000)}$ kA/m², larger than $I/\pi a^2 = ${f(I / (Math.PI * a * a) / 1000)}$ kA/m². In the hole $|\mathbf B| = ${f(Math.hypot(...Bh) * 1e6)}$ µT along ${DIRS[di]}, uniform. At the far point $B_${comp} = ${f(B2[ax] * 1e6)}$ µT.`,
        check: md`$\mathbf J\times\mathbf d$: $(${sI > 0 ? '+' : '-'}\hat z)\times\hat ${off} = ${DIRS[di].slice(1, -1)}$. ✓ At the far point the full cylinder alone would give $-\tfrac12\mu_0Jd$ along that axis; the missing current in the hole reduces it.`,
      }),
    };
  };

  // Summer 2017 #1(a), Summer 2018 #1(b), Summer 2020 #2(a): currents written with delta functions
  GENS.t6_delta = () => one([
    // a line on the z-axis plus a sheet on z = 0
    () => {
      const P = pick([1, 2, 4, -2]), Qv = pick([1, 2, 3, -1, -2]), x0 = pick([1, 2, -1]), z0 = pick([1, 2, -1, -2]);
      const Hy = P / (2 * Math.PI * x0) - 0.5 * Qv * sgn(z0);
      return {
        title: 'A line and a sheet',
        q: md`$\mathbf J(x, y, z) = ${P}\,\delta(x)\delta(y)\,\hat z ${Qv < 0 ? '-' : '+'} ${Math.abs(Qv)}\,\delta(z)\,\hat x$ A/m², coordinates in meters. Find $H_y$ at $(${x0}, 0, ${z0})$ m, and say what each term is.`,
        parts: [
          N(`H_y(${x0}, 0, ${z0})`, Hy, 'A/m'),
          { lbl: 'The two terms are', mc: ['a line current of ' + Math.abs(P) + ' A on the $z$-axis and a sheet of ' + Math.abs(Qv) + ' A/m on $z = 0$', 'two sheets', 'two line currents', 'a sheet on $x = 0$ and a line on the $z$-axis'], a: 0, fixed: true, why: [null, 'Two deltas make a line; one makes a sheet.', 'One delta makes a sheet, not a line.', '$\\delta(z)$ puts the second term on $z = 0$.'] },
        ],
        hints: ['Line: $H = I/2\\pi r$ with $\\hat\\phi = \\hat z\\times\\hat r$; at $(x_0, 0, z_0)$, $\\hat r = \\text{sgn}(x_0)\\hat x$ and $r = |x_0|$.', 'Sheet $\\mathbf J_s = Q\\hat x$ on $z = 0$: $\\tfrac12Q\\,\\hat x\\times(\\pm\\hat z) = \\mp\\tfrac12Q\\,\\hat y$ for $z \\gtrless 0$.'],
        sol: sol({
          eq: md`$\mathbf H = \dfrac{I}{2\pi r}\,\hat I\times\hat r + \tfrac12\mathbf J_s\times\hat n$.`,
          sym: md`Line ($I = ${P}$ A along $\hat z$): $H_y = \dfrac{${P}}{2\pi x_0}$. Sheet ($\mathbf J_s = ${Qv}\hat x$ A/m): $\hat n = ${z0 > 0 ? '+' : '-'}\hat z$, $H_y = ${z0 > 0 ? '-' : '+'}\tfrac12(${Qv})$.`,
          sub: md`$$H_y = \frac{${P}}{2\pi(${x0})} ${z0 > 0 ? '-' : '+'} \frac{${Qv}}{2} = ${f(P / (2 * Math.PI * x0))} ${-0.5 * Qv * sgn(z0) >= 0 ? '+' : '-'} ${f(Math.abs(0.5 * Qv))} = ${f(Hy)}\ \text{A/m}$$`,
          ans: md`$H_y = ${f(Hy)}$ A/m ($H_x = H_z = 0$ there).`,
          check: md`Units: ${Math.abs(P)} A from $\delta(x)\delta(y)$ (1/m²), ${Math.abs(Qv)} A/m from $\delta(z)$ (1/m). ✓ This is Summer 2018 #1(b) with new numbers.`,
        }),
      };
    },
    // two perpendicular lines in z = 0
    () => {
      let I1, I2, x0, y0, Bz;
      do {
        I1 = pick([1, 2, 3, 4]) * pick([1, -1]); I2 = pick([1, 2, 3, 4]) * pick([1, -1]); x0 = pick([1, 2, -1, -2]); y0 = pick([1, 2, -1, -2]);
        Bz = MU0 / (2 * Math.PI) * (I1 / y0 - I2 / x0);
      } while (Math.abs(Bz) < 1e-12);
      const k = I2 / I1;
      return {
        title: 'Two crossed line currents',
        q: md`$\mathbf J(x, y, z) = ${I1}\,\hat x\,\delta(y)\delta(z) ${I2 < 0 ? '-' : '+'} ${Math.abs(I2)}\,\hat y\,\delta(x)\delta(z)$ A/m², coordinates in meters. Find $B_z$ at $(${x0}, ${y0}, 0)$ m. In the plane $z = 0$, $\mathbf B = 0$ along a line $x = ky$: find $k$.`,
        parts: [N(`B_z(${x0}, ${y0}, 0)`, Bz * 1e6, 'µT'), N('k', k, '')],
        hints: ['Line along $\\hat x$ with current $I_1$: at $(x, y, 0)$, $B_z = \\dfrac{\\mu_0I_1}{2\\pi y}$ (from $\\hat x\\times\\hat y = \\hat z$, signs included).', 'Line along $\\hat y$ with current $I_2$: $\\hat y\\times\\hat x = -\\hat z$, so $B_z = -\\dfrac{\\mu_0I_2}{2\\pi x}$. Zero when $I_1/y = I_2/x$.'],
        sol: sol({
          eq: md`$\mathbf B = \dfrac{\mu_0I}{2\pi r}\,\hat I\times\hat r$ for each line; superpose.`,
          sym: md`$B_z = \dfrac{\mu_0}{2\pi}\left(\dfrac{I_1}{y} - \dfrac{I_2}{x}\right)$ in $z = 0$; $B_z = 0$ when $x = \dfrac{I_2}{I_1}y$.`,
          sub: md`$$B_z = (2\times10^{-7})\left(\frac{${I1}}{${y0}} - \frac{${I2}}{${x0}}\right) = ${f(Bz * 1e6)}\ \mu\text{T}, \qquad k = \frac{${I2}}{${I1}} = ${f(k)}$$`,
          ans: md`$B_z = ${f(Bz * 1e6)}$ µT; $\mathbf B = 0$ on $x = ${f(k)}\,y$ in the plane $z = 0$.`,
          check: md`Off the plane $z = 0$ each wire has a field component the other cannot cancel, so the zeros lie only on that line. This is Summer 2020 #2(a) with new numbers (there $k = -2$).`,
        }),
      };
    },
    // Summer 2017 #1(a): find I0 from a measured field
    () => {
      let x0, z0;
      do { x0 = pick([1, 2, -1, -2]); z0 = pick([1, 2, -1, -2]); } while (Math.abs(1 / x0 - 1 / z0) < 1e-9);
      const kk = pick([1, 2, 3, 4, 6]);
      const I0 = kk * Math.PI;
      const h = (I0 / (2 * Math.PI)) * (1 / x0 - 1 / z0);
      return {
        title: 'Find the current',
        q: md`$\mathbf J(x, y, z) = I_0\left[\delta(x)\delta(y)\,\hat z + \delta(y)\delta(z)\,\hat x\right]$ A/m², coordinates in meters. The field it makes at $(${x0}, 0, ${z0})$ m is $\mathbf H = ${p(h)}\,\hat y$ A/m. Find $I_0$.`,
        parts: [N('I_0', I0, 'A')],
        hints: ['Two line currents of $I_0$: one on the $z$-axis along $+\\hat z$, one on the $x$-axis along $+\\hat x$.', 'At $(x_0, 0, z_0)$: the $z$-axis wire gives $\\dfrac{I_0}{2\\pi x_0}\\hat y$; the $x$-axis wire gives $-\\dfrac{I_0}{2\\pi z_0}\\hat y$ (signs included).'],
        sol: sol({
          eq: md`$\mathbf H = \dfrac{I}{2\pi r}\,\hat I\times\hat r$ for each line.`,
          sym: md`$H_y = \dfrac{I_0}{2\pi}\left(\dfrac{1}{x_0} - \dfrac{1}{z_0}\right) \Rightarrow I_0 = \dfrac{2\pi H_y}{1/x_0 - 1/z_0}$.`,
          sub: md`$$I_0 = \frac{2\pi(${p(h)})}{1/(${x0}) - 1/(${z0})} = ${f(I0)}\ \text{A} = ${kk === 1 ? '' : kk}\pi\ \text{A}$$`,
          ans: md`$I_0 = ${kk === 1 ? '' : kk}\pi$ A $= ${f(I0)}$ A.`,
          check: md`Units: $\delta(x)\delta(y)$ is 1/m², so $I_0$ is in A. ✓ For $(1, 0, -1)$ and $\mathbf H = 4\hat y$ this gives Summer 2017's $4\pi$ A.`,
        }),
      };
    },
  ]);

  // ---------------------------------------------------------------- extra questions for the bank
  EM.BANK['t6-sheets'] = [
    Q(md`Why does an infinite sheet's field not weaken with distance?`,
      ['Farther away, the strips you see at a given angle are wider, which exactly makes up for the larger distance', 'Because $\\nabla\\cdot\\mathbf B = 0$', 'It does weaken, as $1/r$', 'Because the current is infinite'], 0,
      [null, 'That rules out sources of $\\mathbf B$ but says nothing about how it falls off.', 'That is a line current. A sheet\'s field is $J_s/2$ at every distance.', 'The current per meter is finite; only its extent is infinite.'],
      md`The Ampère rectangle never involves the distance: $2HL = J_sL$ for any width of rectangle.`),
    Q(md`A strip 5 cm wide carries 2 A spread evenly across its width. Its surface current density is…`,
      ['40 A/m', '0.1 A/m', '2 A/m', '0.4 A/m'], 0,
      [null, 'That multiplies by the width; divide.', 'The width matters: $J_s = I/w$.', 'That leaves the width in cm: 5 cm is 0.05 m.'],
      md`$J_s = I/w = 2/0.05 = 40$ A/m.`),
    Q(md`$B$ next to an infinite sheet with $J_s = 10$ A/m is…`,
      ['6.28 µT', '12.6 µT', '5 µT', '1.0 µT'], 0,
      [null, 'That is $\\mu_0J_s$: two opposite sheets.', 'That is $H = 5$ A/m, not $B$.', 'That divides by $2\\pi$ as for a line.'],
      md`$B = \mu_0J_s/2 = (4\pi\times10^{-7})(5) = 6.28$ µT.`),
    Q(md`Two sheets carry $J_s\hat y$ (on $x = -1$) and $J_s\hat z$ (on $x = +1$), each $J_s = 2$ A/m. At the origin $|\mathbf H|$ is…`,
      ['$\\sqrt2$ A/m', '$2$ A/m', '$0$', '$1$ A/m'], 0,
      [null, 'That adds magnitudes of perpendicular vectors.', 'Perpendicular contributions cannot cancel.', 'That is one sheet alone.'],
      md`Each gives 1 A/m, one along $\hat z$ and one along $\hat y$ ($\hat y\times\hat x = -\hat z$, $\hat z\times(-\hat x) = -\hat y$). $|\mathbf H| = \sqrt{1 + 1}$.`),
    Q(md`Inside a slab of current, the field changes with depth at a rate equal to…`,
      ['$J$, the volume current density', '$J/2$', '$JW$', 'zero: the field is uniform inside'], 0,
      [null, 'Each thin layer $J\\,dz$ makes $H$ jump by $J\\,dz$ (its full $\\mathbf J_s\\times\\hat n$), not half.', 'That is the equivalent sheet current, a field value, not a slope.', 'It is uniform only outside.'],
      md`$\nabla\times\mathbf H = \mathbf J$: for $\mathbf J = J_y\hat y$ and $\mathbf H = H_x(z)\hat x$, $dH_x/dz = J_y$.`),
    Q(md`A slab between $z = 0$ and $z = 4$ m carries a uniform $\mathbf J = 3\hat x$ A/m². $\mathbf H$ at $z = 3$ m is…`,
      ['$-3\\hat y$ A/m', '$+3\\hat y$ A/m', '$-9\\hat y$ A/m', '$-6\\hat y$ A/m'], 0,
      [null, '$\\hat x\\times\\hat z = -\\hat y$: above the center plane the field points along $-\\hat y$.', 'That measures from $z = 0$ instead of the center plane, $z = 2$.', 'That is the outside value, $JW/2$.'],
      md`Center plane $z = 2$; at $s = 1$ m above it, $\mathbf H = (\mathbf J\times\hat z)s = 3(\hat x\times\hat z)(1) = -3\hat y$ A/m.`),
    Q(md`The field inside an off-axis hole in a uniform current-carrying cylinder is…`,
      ['uniform, perpendicular to the offset and to $\\mathbf J$', 'zero', 'largest at the hole\'s center', 'radial from the hole\'s axis'], 0,
      [null, 'Zero only for a centered hole.', 'It is the same everywhere in the hole.', 'Fields of line-like currents circle, they are never radial.'],
      md`$\mathbf H = \tfrac12\mathbf J\times\mathbf d$.`),
    Q(md`For a fixed total current $I$, drilling an off-axis hole in a wire makes the current density…`,
      ['larger: $I/\\pi(a^2 - b^2)$', 'smaller', 'unchanged: $I/\\pi a^2$', 'zero near the hole'], 0,
      [null, 'The same current crosses a smaller area.', 'The area changed; $J$ must too.', 'The current is uniform over the remaining conductor.'],
      md`Less area, same current: HW 5 #4(c).`),
    Q(md`$\int_{-\infty}^{\infty}f(x)\,\delta(x - 3)\,dx = $`,
      ['$f(3)$', '$f(0)$', '$1$', '$3f(3)$'], 0,
      [null, 'The delta sits at $x = 3$.', 'That is the integral of the delta alone.', 'The delta picks out the value; it adds no factor.'],
      md`The sifting property: a delta picks the value of $f$ where it sits.`),
    Q(md`$\mathbf J = 5\,\delta(z - 2)\,\hat y$ A/m² describes…`,
      ['a sheet of 5 A/m along $\\hat y$ on the plane $z = 2$', 'a line of 5 A along $\\hat y$ through $z = 2$', 'a sheet on $z = -2$', 'a slab of thickness 2 m'], 0,
      [null, 'One delta pins one coordinate: a plane, not a line.', '$\\delta(z - 2)$ is nonzero where $z = 2$.', 'A delta has zero thickness.'],
      md`One delta: a surface. Its argument vanishes on $z = 2$; the coefficient is in A/m.`),
    Q(md`Across a current sheet, which field component is continuous?`,
      ['the normal component of $\\mathbf B$', 'the tangential component of $\\mathbf H$', 'all of $\\mathbf H$', 'none'], 0,
      [null, 'That is the one that jumps, by $\\mathbf J_s\\times\\hat n$.', 'The tangential part jumps.', 'Normal $\\mathbf B$ is continuous because $\\oint\\mathbf B\\cdot d\\mathbf S = 0$.'],
      md`$\hat n\cdot(\mathbf B^+ - \mathbf B^-) = 0$, $\;\mathbf H^+ - \mathbf H^- = \mathbf J_s\times\hat n$.`),
    Q(md`Three parallel sheets on $z = 0, 1, 2$ m carry $2\hat x$, $-4\hat x$, $2\hat x$ A/m. For $z > 2$, $\mathbf H = $`,
      ['$0$', '$-4\\hat y$ A/m', '$4\\hat y$ A/m', '$-2\\hat y$ A/m'], 0,
      [null, 'Outside, all three act as one sheet with the total current, $2 - 4 + 2 = 0$.', 'Outside, all three act as one sheet with the total current, $2 - 4 + 2 = 0$.', 'The middle sheet cancels the other two.'],
      md`Above all of them, each $\hat n = +\hat z$: $\tfrac12(2 - 4 + 2)\,\hat x\times\hat z = 0$.`),
    Q(md`For the same three sheets ($2\hat x$, $-4\hat x$, $2\hat x$ A/m on $z = 0, 1, 2$), $\mathbf H$ for $0 < z < 1$ is…`,
      ['$-2\\hat y$ A/m', '$+2\\hat y$ A/m', '$0$', '$-4\\hat y$ A/m'], 0,
      [null, 'Sign: above the bottom sheet $\\hat n = +\\hat z$, and $\\hat x\\times\\hat z = -\\hat y$.', 'They cancel only outside all three.', 'That is the middle sheet\'s full $J_s$; each sheet gives half of its own.'],
      md`Bottom sheet (point above it): $\tfrac12(2)\,\hat x\times\hat z = -\hat y$. The other two (point below them, $\hat n = -\hat z$): $\tfrac12(-4 + 2)\,\hat x\times(-\hat z) = -\hat y$. Total $-2\hat y$ A/m. Faster: below $z = 0$ the field is zero (total current 0), and crossing the bottom sheet adds $\mathbf J_s\times\hat z = 2\hat x\times\hat z = -2\hat y$.`),
    Q(md`A real sheet is $1$ m wide. Close to its middle (1 mm away), compared with an infinite sheet of the same $J_s$, its field is…`,
      ['almost the same, $\\approx J_s/2$', 'much smaller', 'zero', 'twice as big'], 0,
      [null, 'From 1 mm away the sheet looks infinite.', 'Only far away (compared with 1 m) does it fall off, like a line.', 'Nothing doubles it.'],
      md`"Infinite" means large compared with your distance from it.`),
    Q(md`The fields of a line current and a sheet differ how?`,
      ['the line\'s falls as $1/r$; the sheet\'s is constant', 'both fall as $1/r$', 'the sheet\'s falls as $1/r^2$', 'the line\'s is constant'], 0,
      [null, 'A sheet\'s field does not depend on distance.', 'A sheet\'s field does not depend on distance.', 'A line\'s falls as $1/r$.'],
      md`Line: $I/2\pi r$. Sheet: $J_s/2$.`),
    Q(md`$\mathbf J = I_0\,\delta(x - 1)\delta(y)\,\hat z$ is…`,
      ['a line current $I_0$ along $\\hat z$ through $(1, 0)$', 'a line current through the origin', 'a sheet on $x = 1$', 'a sheet on $y = 0$'], 0,
      [null, '$\\delta(x - 1)$ is nonzero at $x = 1$.', 'Two deltas pin two coordinates: a line.', 'Two deltas pin two coordinates: a line.'],
      md`The deltas fix $x = 1$, $y = 0$; the current runs along $z$.`),
    Q(md`Between two oppositely directed sheets of $J_s$ each, the field is $J_s$. You double the spacing between them. The field between becomes…`,
      ['$J_s$, unchanged', '$J_s/2$', '$2J_s$', '$J_s/4$'], 0,
      [null, 'Sheet fields do not depend on distance.', 'Sheet fields do not depend on distance.', 'Sheet fields do not depend on distance.'],
      md`The spacing never enters. (The **flux** per meter of length between them doubles.)`),
  ];
})();

/* widgets.js — interactive figures. Each WG.name(opts) returns a lesson step (C.W).
   Heat maps use a blue (negative) / grey (zero) / red (positive) scale with banded contours. */
(function () {
  'use strict';
  const WG = {};
  const $ = (el, q) => el.querySelector(q);
  const TM = (el) => { if (window.Engine) Engine.renderMath(el); };
  const fmt = (x, d = 3) => (Math.abs(x) < 5e-13 ? '0' : (+x.toPrecision(d)).toString());

  // ---------------------------------------------------------------- colour + heat map
  function cmap(t) {            // t in [-1, 1]
    t = Math.max(-1, Math.min(1, t));
    const A = [59, 76, 192], Z = [205, 205, 205], B = [180, 4, 38];
    const [c0, c1, u] = t < 0 ? [Z, A, -t] : [Z, B, t];
    return [0, 1, 2].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * Math.pow(u, 0.85)));
  }
  // draw f(x,y) (x right, y up) on a canvas over [x0,x1]x[y0,y1]; values scaled by vmax; bands for contours
  // The map is computed at the canvas's logical size (data-w/h) and drawn at device resolution, so text stays crisp.
  function heat(cv, f, box, vmax, o = {}) {
    if (!cv.dataset.w) { cv.dataset.w = cv.width; cv.dataset.h = cv.height; }
    const [x0, x1, y0, y1] = box, W = +cv.dataset.w, H = +cv.dataset.h;
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const octx = off.getContext('2d');
    const img = octx.createImageData(W, H), bands = o.bands ?? 10;
    for (let j = 0; j < H; j++) {
      const y = y1 - (y1 - y0) * (j + 0.5) / H;
      for (let i = 0; i < W; i++) {
        const x = x0 + (x1 - x0) * (i + 0.5) / W;
        let v = f(x, y), k = (j * W + i) * 4;
        if (v === null || !isFinite(v)) { img.data[k] = img.data[k + 1] = img.data[k + 2] = 90; img.data[k + 3] = 255; continue; }
        let t = v / vmax;
        if (bands) t = Math.round(t * bands) / bands;
        const c = cmap(t);
        img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    const dpr = Math.min(3, Math.max(1, window.devicePixelRatio || 1));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px';
    const ctx = cv.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const P = (x, y) => [(x - x0) / (x1 - x0) * W, (y1 - y) / (y1 - y0) * H];
    return { ctx, P, W, H };
  }
  function mark(ctx, x, y, sign, dashed) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, 7, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 1.4; ctx.setLineDash(dashed ? [3, 2.5] : []); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); if (sign > 0) { ctx.moveTo(x, y - 4); ctx.lineTo(x, y + 4); } ctx.stroke();
    ctx.restore();
  }
  const legend = (lo, hi, posOnly) => `<div class="w-note" style="display:flex;align-items:center;gap:8px;font-size:13px">
    <span>${lo}</span><span style="display:inline-block;width:140px;height:9px;background:linear-gradient(90deg,${posOnly ? '' : 'rgb(59,76,192),'}rgb(205,205,205),rgb(180,4,38))"></span><span>${hi}</span></div>`;
  // boundary annotations drawn on the heat map: thick edges + boxed text
  function edge(ctx, a, b, live) {
    ctx.save(); ctx.strokeStyle = live ? '#111' : '#333'; ctx.lineWidth = live ? 5 : 3;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.restore();
  }
  function ctext(ctx, x, y, s, align = 'center') {
    ctx.save();
    ctx.font = '13px "Times New Roman", Times, serif';
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    const w = ctx.measureText(s).width, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    ctx.fillStyle = 'rgba(255,255,255,.88)'; ctx.fillRect(x0 - 3, y - 9, w + 6, 18);
    ctx.fillStyle = '#111'; ctx.fillText(s, x, y + 0.5);
    ctx.restore();
  }

  // numeric helpers
  function simpson(f, a, b, n = 2000) {
    if (n % 2) n++;
    const h = (b - a) / n;
    let s = f(a) + f(b);
    for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
    return s * h / 3;
  }
  function legendre(l, x) {
    if (l === 0) return 1;
    let p0 = 1, p1 = x;
    for (let k = 2; k <= l; k++) { const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; }
    return p1;
  }
  WG.legendreP = legendre;

  // ---------------------------------------------------------------- 1. Cartesian separation of variables
  // modes: slot (Ex 3.3: plates y=0,a grounded, end x=0 at V0(y), x -> infinity)
  //        pipe (Prob 3.17: x=0, y=0, y=a grounded; x=b at V0(y))
  //        pipe2 (Ex 3.4: y=0,a grounded; x=+-b both at V0(y))
  const BC = {
    const: { lab: 'V_0(y) = V_0', f: () => 1 },
    strips: { lab: '+V_0 \\text{ for } y<a/2,\\; -V_0 \\text{ for } y>a/2', f: (y) => (y < 0.5 ? 1 : -1) },
    half: { lab: 'V_0 \\text{ for } y<a/2,\\; 0 \\text{ above}', f: (y) => (y < 0.5 ? 1 : 0) },
    ramp: { lab: 'V_0(y) = V_0\\, y/a', f: (y) => y },
    sine: { lab: 'V_0(y) = V_0 \\sin(\\pi y/a)', f: (y) => Math.sin(Math.PI * y) },
  };
  WG.sep = (o = {}) => C.W(`
    <div class="w-title">${o.title || 'Separation of variables: watch the Fourier series build the boundary'}</div>
    <div class="w-row">
      <label>Boundary <select class="bc">${Object.entries(BC).map(([k, v]) => `<option value="${k}" ${k === (o.bc || 'const') ? 'selected' : ''}>${k === 'const' ? 'constant V₀' : k === 'strips' ? '±V₀ strips (Prob 3.15)' : k === 'half' ? 'V₀ on lower half' : k === 'ramp' ? 'ramp V₀y/a' : 'single sine'}</option>`).join('')}</select></label>
      <label>Geometry <select class="geo">
        <option value="slot" ${o.geo !== 'pipe' && o.geo !== 'pipe2' ? 'selected' : ''}>infinite slot (Ex 3.3)</option>
        <option value="pipe" ${o.geo === 'pipe' ? 'selected' : ''}>pipe, V at x = b (Prob 3.17)</option>
        <option value="pipe2" ${o.geo === 'pipe2' ? 'selected' : ''}>pipe, V at x = ±b (Ex 3.4)</option>
      </select></label>
    </div>
    <div class="w-row"><label>Terms kept <input class="nt" type="range" min="1" max="60" value="${o.n || 1}"></label><span class="w-out ntv"></span>
      <label>b / a <input class="ba" type="range" min="0.4" max="2" step="0.1" value="1"></label><span class="w-out bav"></span></div>
    <div class="w-grid"><div class="w-plot p1"></div><div><canvas class="cv" width="300" height="200"></canvas>${legend('−V₀', '+V₀')}</div></div>
    <div class="w-note coef"></div>`, (el) => {
    const cv = $(el, '.cv');
    const coef = (bc, n) => 2 * simpson((y) => BC[bc].f(y) * Math.sin(n * Math.PI * y), 0, 1, 4000);   // C_n / V0 (a = 1)
    const cache = {};
    const C = (bc, n) => { const k = bc + n; if (!(k in cache)) cache[k] = coef(bc, n); return cache[k]; };
    function draw() {
      const bc = $(el, '.bc').value, geo = $(el, '.geo').value, N = +$(el, '.nt').value, b = +$(el, '.ba').value;
      $(el, '.ntv').textContent = N; $(el, '.bav').textContent = b.toFixed(1);
      $(el, '.ba').disabled = geo === 'slot';
      const X = (n, x) => {           // x-dependence, normalised to 1 on the driven face
        const k = n * Math.PI;
        if (geo === 'slot') return Math.exp(-k * x);
        if (geo === 'pipe') return Math.sinh(k * x) / Math.sinh(k * b);
        return Math.cosh(k * x) / Math.cosh(k * b);
      };
      const V = (x, y) => { let s = 0; for (let n = 1; n <= N; n++) { const c = C(bc, n); if (Math.abs(c) > 1e-12) s += c * X(n, x) * Math.sin(n * Math.PI * y); } return s; };
      const xd = geo === 'slot' ? 0 : b;                   // the driven face
      const svg = PF.plot({ w: 330, h: 210, x: [0, 1], y: [-1.4, 1.4], zero: true, xl: 'y/a', yl: `V(${geo === 'slot' ? '0' : 'b'},y)/V_0`,
        xt: [[0.5, '\\tfrac12'], [1, '1']], yt: [[1, '1'], [-1, '-1']],
        curves: [{ f: (y) => BC[bc].f(y), cls: 'dim dash', from: 0.0005, to: 0.9995 }, { f: (y) => V(xd, y), n: 500 }] });
      $(el, '.p1').innerHTML = svg;
      // heat map of the region
      const box = geo === 'slot' ? [0, 1.5, 0, 1] : geo === 'pipe' ? [0, b, 0, 1] : [-b, b, 0, 1];
      const ar = (box[3] - box[2]) / (box[1] - box[0]);
      if (300 * ar > 260) { cv.dataset.h = 260; cv.dataset.w = Math.round(260 / ar); } else { cv.dataset.w = 300; cv.dataset.h = Math.round(300 * ar); }
      const { ctx, W, H } = heat(cv, (x, y) => V(x, y), box, 1, { bands: 10 });
      edge(ctx, [0, 1.5], [W, 1.5], false); edge(ctx, [0, H - 1.5], [W, H - 1.5], false);      // plates y = a (top) and y = 0 (bottom)
      ctext(ctx, W - 6, 14, 'y = a:  V = 0', 'right'); ctext(ctx, W - 6, H - 14, 'y = 0:  V = 0', 'right');
      if (geo === 'slot') { edge(ctx, [2, 0], [2, H], true); ctext(ctx, 10, H / 2, 'x = 0:  V₀(y)', 'left'); ctext(ctx, W - 6, H / 2, 'x → ∞', 'right'); }
      else if (geo === 'pipe') { edge(ctx, [2, 0], [2, H], false); edge(ctx, [W - 2, 0], [W - 2, H], true); ctext(ctx, 10, H / 2, 'V = 0', 'left'); ctext(ctx, W - 10, H / 2, 'V₀(y)', 'right'); }
      else { edge(ctx, [2, 0], [2, H], true); edge(ctx, [W - 2, 0], [W - 2, H], true); ctext(ctx, 10, H / 2, 'V₀(y)', 'left'); ctext(ctx, W - 10, H / 2, 'V₀(y)', 'right'); }
      const nz = [];
      for (let n = 1; n <= Math.min(N, 12); n++) { const c = C(bc, n); nz.push(Math.abs(c) < 1e-9 ? `C_{${n}}=0` : `C_{${n}}=${fmt(c, 3)}V_0`); }
      $(el, '.coef').innerHTML = `<p>Boundary data on the live face: $${BC[bc].lab}$. Coefficients $C_n = \\tfrac{2}{a}\\int_0^a V_0(y)\\sin\\tfrac{n\\pi y}{a}\\,dy$: $${nz.join(',\\ ')}${N > 12 ? ',\\dots' : ''}$</p>
        <p>${geo === 'slot' ? 'Each term dies off like $e^{-n\\pi x/a}$: by $x\\approx a$ only $n=1$ survives, so far from the end the potential looks like a single sine.' : geo === 'pipe' ? 'Each term grows like $\\sinh(n\\pi x/a)/\\sinh(n\\pi b/a)$: zero on the grounded face $x=0$, exactly the boundary value at $x=b$.' : 'Each term is $\\cosh(n\\pi x/a)/\\cosh(n\\pi b/a)$: even in $x$, equal to the boundary value at $x=\\pm b$, smallest in the middle.'} Near a jump in $V_0(y)$ the partial sums overshoot by about 9% no matter how many terms you keep (Gibbs); the series still converges everywhere inside.</p>`;
      TM(el);
    }
    el.querySelectorAll('select,input').forEach((i) => i.addEventListener('input', draw));
    draw();
  });

  // ---------------------------------------------------------------- 2. cube with a live top face (Prob 3.18)
  WG.cube = () => C.W(`
    <div class="w-title">Cube, five faces grounded, top at $V_0$: the slice $y = a/2$</div>
    <div class="w-row"><label>Max $n, m$ kept <input class="nt" type="range" min="1" max="25" step="2" value="1"></label><span class="w-out ntv"></span>
      <span>Center: <b class="ctr"></b> (exact $V_0/6$)</span></div>
    <canvas class="cv" width="260" height="260"></canvas>${legend('0', 'V₀', true)}
    <div class="w-note">Six faces, one of them live: by symmetry and superposition, the center sees exactly $\\tfrac16$ of $V_0$. The series has to agree, and it does once a few terms are kept.</div>`, (el) => {
    const cv = $(el, '.cv');
    function V(x, y, z, N) {
      let s = 0;
      for (let n = 1; n <= N; n += 2) for (let m = 1; m <= N; m += 2) {
        const g = Math.PI * Math.hypot(n, m);
        s += 16 / (Math.PI * Math.PI * n * m) * Math.sin(n * Math.PI * x) * Math.sin(m * Math.PI * y) * Math.sinh(g * z) / Math.sinh(g);
      }
      return s;
    }
    function draw() {
      const N = +$(el, '.nt').value;
      $(el, '.ntv').textContent = N;
      $(el, '.ctr').textContent = `${V(0.5, 0.5, 0.5, N).toFixed(4)} V₀`;
      const { ctx, W, H } = heat(cv, (x, z) => V(x, 0.5, z, N), [0, 1, 0, 1], 1, { bands: 10 });
      edge(ctx, [0, 2], [W, 2], true); edge(ctx, [0, H - 1.5], [W, H - 1.5], false); edge(ctx, [1.5, 0], [1.5, H], false); edge(ctx, [W - 1.5, 0], [W - 1.5, H], false);
      ctext(ctx, W / 2, 16, 'top face z = a:  V₀'); ctext(ctx, W / 2, H - 14, 'bottom:  V = 0');
      ctext(ctx, 8, H / 2, 'V = 0', 'left'); ctext(ctx, W - 8, H / 2, 'V = 0', 'right');
      ctx.save(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(W / 2, H / 2, 3, 0, 2 * Math.PI); ctx.fill(); ctx.restore();
      ctext(ctx, W / 2 + 10, H / 2 + 14, 'center', 'left');
      TM(el);
    }
    $(el, '.nt').addEventListener('input', draw);
    draw();
  });

  // ---------------------------------------------------------------- 3. Legendre polynomials and sphere problems
  const SPH = {
    cos: { lab: 'k\\cos\\theta', f: (t) => Math.cos(t) },
    cos2: { lab: 'k\\cos^2\\theta', f: (t) => Math.cos(t) ** 2 },
    sin2h: { lab: 'k\\sin^2(\\theta/2)', f: (t) => Math.sin(t / 2) ** 2 },
    step: { lab: '+k \\text{ (north)},\\ -k \\text{ (south)}', f: (t) => (t < Math.PI / 2 ? 1 : -1) },
    cos3: { lab: 'k\\cos 3\\theta', f: (t) => Math.cos(3 * t) },
  };
  WG.sphere = (o = {}) => C.W(`
    <div class="w-title">Sphere with surface potential $V_0(\\theta)$: Legendre series inside and outside</div>
    <div class="w-row"><label>$V_0(\\theta)$ <select class="bc">${Object.entries(SPH).map(([k, v]) => `<option value="${k}" ${k === (o.bc || 'sin2h') ? 'selected' : ''}>${{ cos: 'k cos θ', cos2: 'k cos²θ', sin2h: 'k sin²(θ/2)', step: '±k hemispheres', cos3: 'k cos 3θ' }[k]}</option>`).join('')}</select></label>
      <label>Terms $\\ell \\le$ <input class="nt" type="range" min="0" max="20" value="${o.n ?? 1}"></label><span class="w-out ntv"></span></div>
    <div class="w-grid"><div class="w-plot p1"></div><div><canvas class="cv" width="260" height="260"></canvas>${legend('−k', '+k')}</div></div>
    <div class="w-note coef"></div>`, (el) => {
    const cv = $(el, '.cv');
    const cache = {};
    const A = (bc, l) => { const key = bc + l; if (!(key in cache)) cache[key] = (2 * l + 1) / 2 * simpson((t) => SPH[bc].f(t) * legendre(l, Math.cos(t)) * Math.sin(t), 0, Math.PI, 3000); return cache[key]; };
    function draw() {
      const bc = $(el, '.bc').value, N = +$(el, '.nt').value;
      $(el, '.ntv').textContent = N;
      const Vs = (th) => { let s = 0; for (let l = 0; l <= N; l++) s += A(bc, l) * legendre(l, Math.cos(th)); return s; };
      $(el, '.p1').innerHTML = PF.plot({ w: 320, h: 210, x: [0, Math.PI], y: [-1.4, 1.4], zero: true, xl: '\\theta', yl: 'V(R,\\theta)/k',
        xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']], yt: [[1, '1'], [-1, '-1']],
        curves: [{ f: (t) => SPH[bc].f(t), cls: 'dim dash', from: 0.001, to: Math.PI - 0.001 }, { f: Vs, n: 400 }] });
      // r/R in [0, 2]: inside A_l r^l / R^l, outside A_l (R/r)^(l+1)
      heat(cv, (x, z) => {
        const r = Math.hypot(x, z); if (r < 1e-9) return A(bc, 0);
        const c = z / r; let s = 0;
        for (let l = 0; l <= N; l++) s += A(bc, l) * legendre(l, c) * (r <= 1 ? Math.pow(r, l) : Math.pow(1 / r, l + 1));
        return s;
      }, [-2, 2, -2, 2], 1, { bands: 10 });
      const ctx = cv.getContext('2d');
      ctx.strokeStyle = 'rgba(20,20,20,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(130, 130, 65, 0, 2 * Math.PI); ctx.stroke();
      ctx.save(); ctx.strokeStyle = 'rgba(20,20,20,.6)'; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(130, 250); ctx.lineTo(130, 10); ctx.stroke(); ctx.restore();
      ctext(ctx, 130, 14, 'z  (θ = 0)'); ctext(ctx, 130, 246, 'θ = π'); ctext(ctx, 199, 130, 'r = R', 'left');
      const list = []; for (let l = 0; l <= Math.min(N, 8); l++) { const a = A(bc, l); list.push(Math.abs(a) < 1e-9 ? `A_{${l}}=0` : `A_{${l}}=${fmt(a, 3)}k`); }
      $(el, '.coef').innerHTML = `<p>$V_0(\\theta)=${SPH[bc].lab}$. Coefficients $A_\\ell=\\tfrac{2\\ell+1}{2}\\int_0^\\pi V_0(\\theta)P_\\ell(\\cos\\theta)\\sin\\theta\\,d\\theta$: $${list.join(',\\ ')}${N > 8 ? ',\\dots' : ''}$</p>
        <p>Inside: $V=\\sum A_\\ell (r/R)^\\ell P_\\ell(\\cos\\theta)$. Outside: $V=\\sum A_\\ell (R/r)^{\\ell+1} P_\\ell(\\cos\\theta)$. Same coefficients, because both must equal $V_0(\\theta)$ at $r=R$. The map is the $xz$-plane out to $r = 2R$ ($z$ up); the circle is the sphere. A polynomial in $\\cos\\theta$ of degree $n$ needs only $\\ell\\le n$: the series stops.</p>`;
      TM(el);
    }
    el.querySelectorAll('select,input').forEach((i) => i.addEventListener('input', draw));
    draw();
  });

  WG.legendrePlot = () => C.W(`
    <div class="w-title">Legendre polynomials $P_\\ell(x)$, $x = \\cos\\theta$</div>
    <div class="w-row"><label>$\\ell$ <input class="nt" type="range" min="0" max="6" value="2"></label><span class="w-out ntv"></span></div>
    <div class="w-plot p1"></div><div class="w-note nt2"></div>`, (el) => {
    const F = { 0: '1', 1: 'x', 2: '\\tfrac12(3x^2-1)', 3: '\\tfrac12(5x^3-3x)', 4: '\\tfrac18(35x^4-30x^2+3)', 5: '\\tfrac18(63x^5-70x^3+15x)', 6: '\\tfrac1{16}(231x^6-315x^4+105x^2-5)' };
    function draw() {
      const l = +$(el, '.nt').value;
      $(el, '.ntv').textContent = l;
      const curves = [];
      for (let k = 0; k <= 6; k++) if (k !== l) curves.push({ f: (x) => legendre(k, x), cls: 'dim thin' });
      curves.push({ f: (x) => legendre(l, x) });
      $(el, '.p1').innerHTML = PF.plot({ w: 360, h: 220, x: [-1, 1], y: [-1.1, 1.1], zero: true, xl: 'x', yl: 'P_\\ell(x)', xt: [[-1, '-1'], [0, '0'], [1, '1']], yt: [[1, '1'], [-1, '-1']], curves, ml: 30 });
      $(el, '.nt2').innerHTML = `<p>$P_{${l}}(x) = ${F[l]}$. It has $${l}$ zero${l === 1 ? '' : 's'} in $(-1,1)$, $P_\\ell(1)=1$, $P_\\ell(-1)=(-1)^\\ell$, and it is ${l % 2 ? 'odd' : 'even'} in $x$.</p>`;
      TM(el);
    }
    $(el, '.nt').addEventListener('input', draw);
    draw();
  });

  // ---------------------------------------------------------------- 4. method of images
  WG.imagePlane = () => C.W(`
    <div class="w-title">Charge $q$ above a grounded plane = $q$ and $-q$ with no plane</div>
    <div class="w-row"><label>$d$ (height) <input class="d" type="range" min="0.3" max="1.6" step="0.05" value="1"></label><span class="w-out dv"></span>
      <label><input class="show" type="checkbox" checked> show the region below</label></div>
    <div class="w-grid"><div><canvas class="cv" width="280" height="280"></canvas>${legend('−', '+')}</div><div class="w-plot p1"></div></div>
    <div class="w-note">The pair $\\pm q$ makes $V=0$ on the whole plane $z=0$ (every point there is equidistant from both). Above the plane that is exactly the boundary problem, so by uniqueness it is the answer there. Below the plane the pair is fiction: the real conductor has $V=0$ there. The plot is the induced charge $\\sigma(x)=-\\dfrac{qd}{2\\pi(x^2+d^2)^{3/2}}$ along a line through the foot of the charge; its total is $-q$.</div>`, (el) => {
    const cv = $(el, '.cv');
    function draw() {
      const d = +$(el, '.d').value, show = $(el, '.show').checked;
      $(el, '.dv').textContent = d.toFixed(2);
      const V = (x, z) => {
        if (!show && z < 0) return 0;
        const a = Math.hypot(x, z - d), b = Math.hypot(x, z + d);
        return 0.25 * (1 / a - 1 / b);
      };
      const { ctx, P, W, H } = heat(cv, V, [-2, 2, -2, 2], 1, { bands: 12 });
      ctx.strokeStyle = 'rgba(20,20,20,.9)'; ctx.lineWidth = 2;
      const [x0, y0] = P(-2, 0), [x1] = P(2, 0); ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke();
      const [mx, my] = P(0, d); mark(ctx, mx, my, 1, false); ctext(ctx, mx + 14, my, '+q (real)', 'left');
      if (show) { const [nx, ny] = P(0, -d); mark(ctx, nx, ny, -1, true); ctext(ctx, nx + 14, ny, '−q (image)', 'left'); }
      else ctext(ctx, W / 2, H * 0.75, 'conductor: V = 0, E = 0');
      ctext(ctx, W - 6, y0 - 14, 'plane z = 0:  V = 0', 'right');
      $(el, '.p1').innerHTML = PF.plot({ w: 300, h: 200, x: [-3, 3], y: [-0.35, 0.05], xl: 'x', yl: '\\sigma\\;(q\\text{ per unit}^2)', zero: true,
        xt: [[-2, '-2'], [0, '0'], [2, '2']], yt: [[-0.3, '-0.3']], curves: [{ f: (x) => -d / (2 * Math.PI * Math.pow(x * x + d * d, 1.5)) }] });
      TM(el);
    }
    el.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
    draw();
  });

  WG.imageSphere = () => C.W(`
    <div class="w-title">Charge $q$ outside a grounded sphere: image $q'=-\\tfrac{R}{a}q$ at $b=\\tfrac{R^2}{a}$</div>
    <div class="w-row"><label>$a/R$ <input class="a" type="range" min="1.15" max="4" step="0.05" value="2"></label><span class="w-out av"></span>
      <span>$q'/q$ = <b class="qp"></b>, $b/R$ = <b class="bp"></b></span></div>
    <div class="w-grid"><div><canvas class="cv" width="280" height="280"></canvas>${legend('−', '+')}</div><div class="w-plot p1"></div></div>
    <div class="w-note">The sphere's circle is exactly the $V=0$ contour of the pair $q, q'$. As $a\\to R$ the image approaches the surface and $q'\\to -q$ (it looks like a plane). As $a\\to\\infty$, $q'\\to 0$: a far charge induces little. The plot is the induced $\\sigma(\\theta)$ (in units of $q/R^2$): most of it gathers on the side facing $q$, and it integrates to $q'$, not $-q$.</div>`, (el) => {
    const cv = $(el, '.cv');
    function draw() {
      const a = +$(el, '.a').value, R = 1, qp = -R / a, b = R * R / a;
      $(el, '.av').textContent = a.toFixed(2); $(el, '.qp').textContent = qp.toFixed(3); $(el, '.bp').textContent = b.toFixed(3);
      const V = (x, z) => { const r = Math.hypot(x, z); if (r < R) return 0; return 0.25 * (1 / Math.hypot(x, z - a) + qp / Math.hypot(x, z - b)); };
      const { ctx, P } = heat(cv, V, [-2.4, 2.4, -2, 2.8 + Math.max(0, a - 2.4)], 0.6, { bands: 12 });
      const [cx, cy] = P(0, 0), [, ry] = P(0, 1);
      ctx.strokeStyle = 'rgba(20,20,20,.9)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, cy - ry, 0, 2 * Math.PI); ctx.stroke();
      { const [x1, y1] = P(0, a); mark(ctx, x1, y1, 1, false); ctext(ctx, x1 + 14, y1, 'q', 'left');
        const [x2, y2] = P(0, b); mark(ctx, x2, y2, -1, true); ctext(ctx, x2 + 14, y2, "q′ (image)", 'left');
        ctext(ctx, cx - (cy - ry) - 6, cy + 4, 'V = 0', 'right'); }
      // sigma(theta) = -q (a^2 - R^2) / (4 pi R (R^2 + a^2 - 2 a R cos th)^(3/2))
      const sig = (t) => -(a * a - R * R) / (4 * Math.PI * R * Math.pow(R * R + a * a - 2 * a * R * Math.cos(t), 1.5));
      $(el, '.p1').innerHTML = PF.plot({ w: 300, h: 200, x: [0, Math.PI], y: [Math.min(-0.2, sig(0) * 1.1), 0.02], xl: '\\theta', yl: '\\sigma\\,(q/R^2)', zero: true,
        xt: [[Math.PI / 2, '\\tfrac{\\pi}{2}'], [Math.PI, '\\pi']], curves: [{ f: sig }] });
      TM(el);
    }
    $(el, '.a').addEventListener('input', draw);
    draw();
  });

  // ---------------------------------------------------------------- 5. vector-field gallery (divergence and curl intuition)
  const FIELDS = {
    radial: { lab: '\\mathbf v = \\hat{\\mathbf r}/r^2 \\text{ (point charge)}', f: (x, y) => { const r = Math.hypot(x, y); return [x / r ** 3, y / r ** 3]; }, div: '0 \\text{ everywhere except } r=0 \\;(4\\pi\\delta^3)', curl: '0' },
    spread: { lab: '\\mathbf v = \\mathbf r = x\\hat{\\mathbf x}+y\\hat{\\mathbf y}', f: (x, y) => [x, y], div: '2 \\text{ in 2-D } (3 \\text{ for } \\mathbf r \\text{ in 3-D})', curl: '0' },
    swirl: { lab: '\\mathbf v = -y\\hat{\\mathbf x}+x\\hat{\\mathbf y}', f: (x, y) => [-y, x], div: '0', curl: '2\\hat{\\mathbf z}' },
    shear: { lab: '\\mathbf v = y\\,\\hat{\\mathbf x}', f: (x, y) => [y, 0], div: '0', curl: '-\\hat{\\mathbf z}' },
    stretch: { lab: '\\mathbf v = x\\,\\hat{\\mathbf x}', f: (x, y) => [x, 0], div: '1', curl: '0' },
    vortex: { lab: '\\mathbf v = \\hat{\\boldsymbol\\phi}/s \\text{ (around a wire)}', f: (x, y) => { const s2 = x * x + y * y; return [-y / s2, x / s2]; }, div: '0', curl: '0 \\text{ except on the axis}' },
    uniform: { lab: '\\mathbf v = \\hat{\\mathbf x}', f: () => [1, 0], div: '0', curl: '0' },
  };
  WG.fields = (o = {}) => C.W(`
    <div class="w-title">Divergence and curl by eye</div>
    <div class="w-row"><label>Field <select class="fs">${Object.keys(FIELDS).map((k) => `<option value="${k}" ${k === (o.f || 'swirl') ? 'selected' : ''}>${k}</option>`).join('')}</select></label>
      <label><input class="rev" type="checkbox"> reveal div and curl</label></div>
    <div class="w-plot p1"></div><div class="w-note nt2"></div>`, (el) => {
    function draw() {
      const k = $(el, '.fs').value, F = FIELDS[k], rev = $(el, '.rev').checked;
      const f = PF.fig();
      const S = 26, n = 9, c = (n - 1) / 2;
      f.rect(-S * 0.5, -S * 0.5, S * (n - 1) + S, S * (n - 1) + S, { cls: 'dim thin' });
      f.field((X, Y) => { const x = (X / S - c) * 0.5, y = -(Y / S - c) * 0.5; if (Math.hypot(x, y) < 0.08 && (k === 'radial' || k === 'vortex')) return null; const v = F.f(x, y); return [v[0], -v[1]]; }, [0, 0, S * (n - 1), S * (n - 1)], n, n, { len: 18, mag: true });
      $(el, '.p1').innerHTML = f.svg();
      $(el, '.nt2').innerHTML = `<p>$${F.lab}$</p>` + (rev ? `<p>$\\nabla\\cdot\\mathbf v = ${F.div}$, $\\nabla\\times\\mathbf v = ${F.curl}$.</p>` : '<p>Divergence: do more arrows leave a small box than enter it? Curl: would a tiny paddle wheel spin? Decide, then reveal.</p>');
      TM(el);
    }
    el.querySelectorAll('select,input').forEach((i) => i.addEventListener('input', draw));
    draw();
  });

  // ---------------------------------------------------------------- 6. disk -> point charge and -> infinite sheet (Prob 2.6)
  WG.disk = () => C.W(`
    <div class="w-title">Field on the axis of a charged disk vs. its two limits</div>
    <div class="w-row"><label>Disk radius $R$ <input class="R" type="range" min="0.2" max="6" step="0.1" value="1"></label><span class="w-out Rv"></span></div>
    <div class="w-plot p1"></div>
    <div class="w-note">Solid: the disk, $E_z = \\dfrac{\\sigma}{2\\varepsilon_0}\\Big(1-\\dfrac{z}{\\sqrt{z^2+R^2}}\\Big)$. Dashed: an infinite sheet, $\\sigma/2\\varepsilon_0$. Dotted: a point charge $Q=\\sigma\\pi R^2$. Close to the disk ($z\\ll R$) it looks like the sheet; far away ($z\\gg R$) like the point charge.</div>`, (el) => {
    function draw() {
      const R = +$(el, '.R').value;
      $(el, '.Rv').textContent = R.toFixed(1);
      $(el, '.p1').innerHTML = PF.plot({ w: 360, h: 220, x: [0, 6], y: [0, 1.15], xl: 'z', yl: 'E_z\\;(\\sigma/2\\varepsilon_0)', xt: [[R, 'R']], yt: [[1, '1']],
        curves: [{ f: () => 1, cls: 'dim dash' }, { f: (z) => R * R / (2 * z * z), cls: 'dim thin', from: 0.05 }, { f: (z) => 1 - z / Math.sqrt(z * z + R * R) }] });
      TM(el);
    }
    $(el, '.R').addEventListener('input', draw);
    draw();
  });

  window.WG = WG;
})();

/* mathinput.js — Desmos-style answer boxes.
   Every numeric/symbolic answer <input> gets a MathLive <math-field> on top of it (type sqrt, ^, /, pi, theta …),
   and the field's LaTeX is translated into the plain syntax the checker (expr.js) already understands.
   If MathLive didn't load, the plain text boxes stay as they are. */
(function () {
  'use strict';

  const GREEK = {
    alpha: 'alpha', beta: 'beta', gamma: 'gamma', delta: 'delta', epsilon: 'epsilon', varepsilon: 'epsilon', zeta: 'zeta', eta: 'eta',
    theta: 'theta', vartheta: 'theta', iota: 'iota', kappa: 'kappa', lambda: 'lambda', mu: 'mu', nu: 'nu', xi: 'xi', pi: 'pi', varpi: 'pi',
    rho: 'rho', varrho: 'rho', sigma: 'sigma', varsigma: 'sigma', tau: 'tau', upsilon: 'upsilon', phi: 'phi', varphi: 'phi', chi: 'chi',
    psi: 'psi', omega: 'omega', Gamma: 'Gamma', Delta: 'Delta', Theta: 'Theta', Lambda: 'Lambda', Pi: 'pi', Sigma: 'Sigma', Phi: 'Phi', Psi: 'Psi', Omega: 'Omega',
  };
  const FUNCS = new Set(['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'sinh', 'cosh', 'tanh', 'coth', 'ln', 'log', 'exp', 'arcsin', 'arccos', 'arctan']);
  const SKIP = new Set([',', ';', ':', '!', ' ', 'quad', 'qquad', 'left', 'right', 'displaystyle', 'textstyle', 'limits', 'big', 'Big', 'bigl', 'bigr', 'Bigl', 'Bigr']);

  // ---------------------------------------------------------------- LaTeX -> checker syntax
  function tokenize(s) {
    const t = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (c === '\\') {
        const m = /^\\([A-Za-z]+|.)/.exec(s.slice(i));
        t.push({ k: 'cmd', v: m[1] }); i += m[0].length;
      } else if (/\s/.test(c)) { i++; }
      else if (/[0-9.]/.test(c)) { const m = /^[0-9]*\.?[0-9]+|^[0-9]+\.?/.exec(s.slice(i)); t.push({ k: 'num', v: m[0] }); i += m[0].length; }
      else if (/[A-Za-z]/.test(c)) { t.push({ k: 'let', v: c }); i++; }
      else { t.push({ k: 'sym', v: c }); i++; }
    }
    return t;
  }

  function latexToExpr(latex) {
    const T = tokenize(String(latex || ''));
    let p = 0;
    const peek = () => T[p];
    const isSym = (tok, v) => tok && tok.k === 'sym' && tok.v === v;
    const isCmd = (tok, v) => tok && tok.k === 'cmd' && tok.v === v;

    // {...} group, or a single token as an argument
    function arg() {
      if (isSym(peek(), '{')) { p++; const s = seq('}'); p++; return s; }
      // without braces an argument is ONE character: \sqrt23 is sqrt(2)*3, x^23 is x^2*3
      const nx = peek();
      if (nx && nx.k === 'num' && nx.v.length > 1) { T[p] = { k: 'num', v: nx.v.slice(1) }; return nx.v[0]; }
      const tok = T[p++];
      if (!tok) return '';
      return one(tok);
    }
    // optional [...] argument
    function optArg() {
      if (!isSym(peek(), '[')) return null;
      p++; const s = seq(']'); p++; return s;
    }
    // subscript text attached to a name: V_0 -> V0, \epsilon_0 -> epsilon0, r_{12} -> r12
    function subscript() {
      if (!isSym(peek(), '_')) return '';
      p++;
      const raw = isSym(peek(), '{') ? (() => { p++; let s = ''; while (p < T.length && !isSym(peek(), '}')) { const tk = T[p++]; s += tk.k === 'cmd' ? (GREEK[tk.v] || tk.v) : tk.v; } p++; return s; })() : (() => {
        const tk = T[p];
        if (tk && tk.k === 'num' && tk.v.length > 1) { T[p] = { k: 'num', v: tk.v.slice(1) }; return tk.v[0]; }   // V_03 = V_0 * 3
        p++; return tk ? (tk.k === 'cmd' ? (GREEK[tk.v] || tk.v) : tk.v) : '';
      })();
      return raw.replace(/[^A-Za-z0-9]/g, '');
    }
    function power() {
      if (!isSym(peek(), '^')) return '';
      p++;
      return `^(${arg()})`;
    }
    // the argument of \sin etc.: a parenthesised group, or one factor
    function funcArg() {
      if (isCmd(peek(), 'left')) p++;
      if (isSym(peek(), '(')) {
        p++; const s = seq(')'); p++;
        if (isCmd(T[p - 2], 'right')) { /* already consumed */ }
        return s;
      }
      const tok = T[p++];
      if (!tok) return '';
      let s = one(tok);
      s += power();
      return s;
    }

    function one(tok) {
      if (tok.k === 'num') return tok.v;
      if (tok.k === 'let') {
        if (tok.v === 'e' && isSym(peek(), '^')) { p++; return ` exp(${arg()})`; }
        const name = `${tok.v}${subscript()}`;
        return isSym(peek(), '^') ? ` ${name}` : name;      // a power binds to this letter only (kR^5 = k R^5)            // letters typed side by side stay glued (eps0, qR): the checker splits them
      }
      if (tok.k === 'sym') {
        const v = tok.v;
        if (v === '{') { const s = seq('}'); p++; return `(${s})`; }
        if (v === '(' || v === '[') { const s = seq(v === '(' ? ')' : ']'); p++; return `(${s})`; }
        if (v === '|') { const s = seq('|'); p++; return ` abs(${s})`; }
        if (v === "'") return '';
        if ('+-*/,'.includes(v)) return v;
        if (v === '^') return `^(${arg()})`;
        return '';
      }
      // commands
      const c = tok.v;
      if (SKIP.has(c)) return '';
      if (c === 'frac' || c === 'dfrac' || c === 'tfrac' || c === 'cfrac') { const a = arg(), b = arg(); return `((${a})/(${b}))`; }
      if (c === 'sqrt') { const n = optArg(); const a = arg(); return n ? `((${a})^(1/(${n})))` : ` sqrt(${a})`; }
      if (c === 'cdot' || c === 'times' || c === 'ast') return '*';
      if (c === 'div') return '/';
      if (c === 'pm') return '+';
      if (c === 'mathrm' || c === 'text' || c === 'mathit' || c === 'mathbf' || c === 'operatorname' || c === 'mathnormal') {
        const inner = arg().replace(/\s+/g, '');
        if (FUNCS.has(inner)) { const pw = power(); const a = funcArg(); return pw ? ` (${inner}(${a}))${pw}` : ` ${inner}(${a})`; }
        return ` ${inner}${subscript()} `;
      }
      if (FUNCS.has(c)) {
        const pw = power();                       // \cos^2\theta -> (cos(theta))^(2)
        const a = funcArg();
        const f = c === 'arcsin' ? 'asin' : c === 'arccos' ? 'acos' : c === 'arctan' ? 'atan' : c;
        return pw ? ` (${f}(${a}))${pw}` : ` ${f}(${a})`;
      }
      if (GREEK[c]) return ` ${GREEK[c]}${subscript()} `;
      if (c === 'infty') return ' Infinity ';
      if (c === '{' || c === '}') return '';
      if (c === 'lbrace' || c === 'rbrace') return '';
      return '';
    }

    function seq(end) {
      let out = '';
      while (p < T.length) {
        const tok = peek();
        if (end && isSym(tok, end)) break;
        if (end === ')' && isCmd(tok, 'right') && isSym(T[p + 1], ')')) { p++; break; }
        if (end === '|' && isCmd(tok, 'right') && isSym(T[p + 1], '|')) { p++; break; }
        p++;
        if (isCmd(tok, 'left')) {             // \left( ... \right)   \left| ... \right|
          const open = T[p++];
          if (open && open.v === '|') { const s = seq('|'); p++; out += ` abs(${s})`; }
          else if (open && (open.v === '(' || open.v === '[' || open.v === '.')) { const s = seq(')'); p++; out += `(${s})`; }
          continue;
        }
        out += one(tok);
        out += power();
      }
      return out;
    }

    let s = seq(null);
    // tidy: collapse spaces, glue single letters typed side by side ("e p s 0" -> "eps0") only when no command split them
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }

  // ---------------------------------------------------------------- upgrade the answer boxes in a problem card
  function upgrade(host) {
    if (!window.MathfieldElement || !host) return;
    host.querySelectorAll('.part.num input.ans, .part.expr input.ans').forEach((inp) => {
      if (inp.dataset.mf) return;
      inp.dataset.mf = '1';
      const mf = new window.MathfieldElement();
      mf.className = 'mf';
      mf.setAttribute('aria-label', inp.getAttribute('aria-label') || 'answer');
      mf.smartFence = true;
      mf.mathVirtualKeyboardPolicy = 'auto';
      try { mf.menuItems = []; } catch (e) { /* older builds */ }
      inp.insertAdjacentElement('beforebegin', mf);
      inp.classList.add('mf-shadow');
      inp._mf = mf;
      const sync = () => {
        inp.value = latexToExpr(mf.value);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
      };
      mf.addEventListener('input', sync);
      mf.addEventListener('change', sync);         // fires on blur too: only Enter (below) runs the check
      mf.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sync(); const chk = host.querySelector('.chk'); if (chk) chk.click(); } });
    });
  }

  window.MathInput = { latexToExpr, upgrade };
})();

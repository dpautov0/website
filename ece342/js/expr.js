/* expr.js — a small, safe expression parser used to check typed answers.
   Supports numbers, + - * / ^, parentheses, implicit multiplication,
   the parallel operator ||, and functions sqrt, par, exp, ln, log, abs.
   Variable names are matched case-insensitively with underscores ignored,
   so R_D, RD and rd are the same variable; "gmRD" splits into gm*RD. */
(function () {
  'use strict';

  class ExprError extends Error {}

  const FUNCS = {
    sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp, ln: Math.log, log: Math.log10,
    log10: Math.log10, sin: Math.sin, cos: Math.cos,
    par: (...a) => 1 / a.reduce((s, x) => s + 1 / x, 0),
  };
  const CONSTS = { pi: Math.PI };
  const norm = (s) => s.toLowerCase().replace(/_/g, '');

  function tokenize(src) {
    const s = String(src).trim()
      .replace(/[×·⋅]/g, '*').replace(/[−–]/g, '-').replace(/∥/g, '||').replace(/÷/g, '/')
      .replace(/\*\*/g, '^')
      .replace(/[{[]/g, '(').replace(/[}\]]/g, ')')
      .replace(/[µμ]/g, 'u');
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        const m = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(s.slice(i));
        if (!m) throw new ExprError(`Could not read a number near "${s.slice(i, i + 5)}"`);
        toks.push({ t: 'num', v: parseFloat(m[0]) });
        i += m[0].length;
        continue;
      }
      if (/[A-Za-z_]/.test(c)) {
        const m = /^[A-Za-z_][A-Za-z0-9_]*/.exec(s.slice(i));
        toks.push({ t: 'id', v: m[0] });
        i += m[0].length;
        continue;
      }
      if (s.startsWith('||', i)) { toks.push({ t: 'op', v: '||' }); i += 2; continue; }
      if (c === '|') throw new ExprError('Use || (two bars) for "in parallel with".');
      if ('+-*/^(),'.includes(c)) { toks.push({ t: 'op', v: c }); i++; continue; }
      throw new ExprError(`Unexpected character "${c}".`);
    }
    return toks;
  }

  function splitVars(s, V) {
    const names = [...V.keys()].sort((a, b) => b.length - a.length);
    const memo = new Map();
    const go = (i) => {
      if (i === s.length) return [];
      if (memo.has(i)) return memo.get(i);
      for (const nm of names) {
        if (s.startsWith(nm, i)) {
          const r = go(i + nm.length);
          if (r) { const out = [V.get(nm), ...r]; memo.set(i, out); return out; }
        }
      }
      memo.set(i, null);
      return null;
    };
    return go(0);
  }

  function parse(src, vars = [], dispNames = null) {
    const toks = tokenize(src);
    if (!toks.length) throw new ExprError('Type an answer first.');
    const V = new Map(vars.map((v) => [norm(v), v]));
    let p = 0;
    const peek = () => toks[p];
    const next = () => toks[p++];
    const isOp = (t, v) => t && t.t === 'op' && t.v === v;
    const expect = (v) => { if (!isOp(peek(), v)) throw new ExprError(`Expected "${v}".`); p++; };
    const startsAtom = (t) => t && (t.t === 'num' || t.t === 'id' || isOp(t, '('));

    function parseAdd() {
      let a = parsePar();
      while (isOp(peek(), '+') || isOp(peek(), '-')) {
        const op = next().v;
        a = { k: 'bin', op, a, b: parsePar() };
      }
      return a;
    }
    function parsePar() {
      let a = parseMul();
      while (isOp(peek(), '||')) { next(); a = { k: 'bin', op: '||', a, b: parseMul() }; }
      return a;
    }
    function parseMul() {
      let a = parseUnary();
      for (;;) {
        const t = peek();
        if (isOp(t, '*') || isOp(t, '/')) { next(); a = { k: 'bin', op: t.v, a, b: parseUnary() }; }
        else if (startsAtom(t)) { a = { k: 'bin', op: '*', a, b: parseUnary(), imp: true }; }
        else break;
      }
      return a;
    }
    function parseUnary() {
      if (isOp(peek(), '-')) { next(); return { k: 'neg', a: parseUnary() }; }
      if (isOp(peek(), '+')) { next(); return parseUnary(); }
      return parsePow();
    }
    function parsePow() {
      const a = parseAtom();
      if (isOp(peek(), '^')) { next(); return { k: 'bin', op: '^', a, b: parseUnary() }; }
      return a;
    }
    function parseAtom() {
      const t = next();
      if (!t) throw new ExprError('The expression ends too early.');
      if (t.t === 'num') return { k: 'num', v: t.v };
      if (isOp(t, '(')) { const e = parseAdd(); expect(')'); return e; }
      if (t.t === 'id') {
        const n = norm(t.v);
        if (V.has(n)) return { k: 'var', n: V.get(n) };
        if (FUNCS[n] && isOp(peek(), '(')) {
          next();
          const args = [];
          if (!isOp(peek(), ')')) {
            args.push(parseAdd());
            while (isOp(peek(), ',')) { next(); args.push(parseAdd()); }
          }
          expect(')');
          return { k: 'call', f: n, args };
        }
        if (CONSTS[n] !== undefined) return { k: 'num', v: CONSTS[n], name: n };
        const split = V.size ? splitVars(n, V) : null;
        if (split) {
          return split.reduce((acc, v) => (acc ? { k: 'bin', op: '*', a: acc, b: { k: 'var', n: v }, imp: true } : { k: 'var', n: v }), null);
        }
        if (!V.size) throw new ExprError(`"${t.v}" isn't a number. Enter just the value in the unit shown.`);
        const allowed = vars.map((v) => (dispNames && dispNames[v]) ? v : v).join(', ');
        throw new ExprError(`Unknown symbol "${t.v}". Allowed: ${allowed}.`);
      }
      throw new ExprError(`Unexpected "${t.v}".`);
    }

    const ast = parseAdd();
    if (p < toks.length) throw new ExprError(`Unexpected "${toks[p].v}".`);
    return ast;
  }

  function evaluate(ast, env) {
    switch (ast.k) {
      case 'num': return ast.v;
      case 'var':
        if (!(ast.n in env)) throw new ExprError(`No value for ${ast.n}.`);
        return env[ast.n];
      case 'neg': return -evaluate(ast.a, env);
      case 'call': return FUNCS[ast.f](...ast.args.map((x) => evaluate(x, env)));
      case 'bin': {
        const a = evaluate(ast.a, env), b = evaluate(ast.b, env);
        switch (ast.op) {
          case '+': return a + b;
          case '-': return a - b;
          case '*': return a * b;
          case '/': return a / b;
          case '^': return Math.pow(a, b);
          case '||': return (a * b) / (a + b);
        }
      }
    }
    throw new ExprError('Bad expression.');
  }

  // Render a parsed expression back to TeX so the learner sees how it was read.
  const PREC = { '+': 1, '-': 1, '||': 2, '*': 3, '/': 6, '^': 5 };
  function toTeX(ast, disp = {}, parent = 0) {
    const wrap = (s, prec) => (prec < parent ? `\\left(${s}\\right)` : s);
    switch (ast.k) {
      case 'num': return ast.name === 'pi' ? '\\pi' : U.fmt(ast.v, 6);
      case 'var': return disp[ast.n] || ast.n;
      case 'neg': return wrap(`-${toTeX(ast.a, disp, 3)}`, 3);
      case 'call': {
        const args = ast.args.map((x) => toTeX(x, disp, 0));
        if (ast.f === 'sqrt') return `\\sqrt{${args[0]}}`;
        if (ast.f === 'par') return wrap(args.join(' \\parallel '), 2);
        return `\\operatorname{${ast.f}}\\left(${args.join(',')}\\right)`;
      }
      case 'bin': {
        const pr = PREC[ast.op];
        if (ast.op === '/') return `\\frac{${toTeX(ast.a, disp, 0)}}{${toTeX(ast.b, disp, 0)}}`;
        if (ast.op === '^') return `{${toTeX(ast.a, disp, 6)}}^{${toTeX(ast.b, disp, 0)}}`;
        const L = toTeX(ast.a, disp, pr);
        const R = toTeX(ast.b, disp, ast.op === '-' ? pr + 0.5 : pr + (ast.op === '||' ? 0.5 : 0));
        if (ast.op === '*') {
          const numNum = /\d$/.test(L) && /^\d/.test(R);
          return wrap(`${L}${numNum ? ' \\cdot ' : '\\,'}${R}`, pr);
        }
        if (ast.op === '||') return wrap(`${L} \\parallel ${R}`, pr);
        return wrap(`${L} ${ast.op} ${R}`, pr);
      }
    }
    return '?';
  }

  // Numeric answers: parse (arithmetic allowed) and compare with a tolerance.
  function parseNumber(str) {
    return evaluate(parse(str, []), {});
  }

  function compareNumber(u, ans, tol = {}) {
    const rel = tol.rel ?? 0.015;
    const abs = tol.abs ?? 1e-9;
    const ok = Math.abs(u - ans) <= Math.max(abs, rel * Math.abs(ans));
    if (ok) return { ok: true };
    const near = (r, t) => Math.abs(r - t) <= 0.03 * Math.abs(t);
    if (ans !== 0 && Math.abs(u + ans) <= Math.max(abs, rel * Math.abs(ans))) return { ok: false, msg: 'Right size, wrong sign. Recheck your current direction or polarity.' };
    if (ans !== 0 && u !== 0) {
      const r = u / ans;
      if (near(r, 1000) || near(r, 1e-3) || near(r, 1e6) || near(r, 1e-6)) return { ok: false, msg: 'Off by a power of 1000. Check the unit shown next to the box (mA vs A, kΩ vs Ω).' };
      if (near(r, 2) || near(r, 0.5)) return { ok: false, msg: 'Off by a factor of 2. A missing ½, or a term counted twice?' };
      if (near(r, 4) || near(r, 0.25)) return { ok: false, msg: 'Off by a factor of 4. Check anything that gets squared.' };
      if (Math.abs(r - 1) < 0.06) return { ok: false, msg: 'Very close. Check your rounding; carry more digits.' };
    }
    return { ok: false, msg: 'Not quite.' };
  }

  // Symbolic answers: evaluate both expressions at random points.
  function checkExpr(input, ref, spec) {
    const names = Object.keys(spec.vars);
    let ua;
    try { ua = parse(input, names, spec.disp); } catch (e) { return { ok: false, err: e.message }; }
    const ra = parse(ref, names);
    let good = 0, bad = 0, neg = 0, valid = 0;
    for (let t = 0; t < 20 && valid < 8; t++) {
      const env = {};
      for (const n of names) {
        const [lo, hi] = spec.vars[n];
        env[n] = (lo > 0 && hi / lo > 10) ? Math.exp(U.rand(Math.log(lo), Math.log(hi))) : U.rand(lo, hi);
      }
      const r = evaluate(ra, env);
      if (!isFinite(r) || Math.abs(r) < 1e-300) continue;
      let u;
      try { u = evaluate(ua, env); } catch (e) { return { ok: false, err: e.message }; }
      valid++;
      const tol = 1e-6 * Math.max(Math.abs(r), Math.abs(u));
      if (Math.abs(u - r) <= tol) good++;
      else { bad++; if (Math.abs(u + r) <= 1e-6 * Math.abs(r)) neg++; }
    }
    if (!valid) return { ok: false, err: 'Could not evaluate that expression.' };
    if (!bad) return { ok: true };
    if (neg === bad && !good) return { ok: false, msg: 'Right magnitude, wrong sign.' };
    return { ok: false, msg: 'Not equivalent to the expected answer.' };
  }

  window.Expr = { ExprError, tokenize, parse, evaluate, toTeX, parseNumber, compareNumber, checkExpr, norm };
})();

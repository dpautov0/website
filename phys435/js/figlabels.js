/* figlabels.js — figure labels live in an HTML layer laid over the drawing, not inside the SVG.
   The drawing code still writes each label as a <foreignObject>; lift() moves it into a <div> on top of the SVG
   at the same spot (in the SVG's own units) and the layer is scaled with the drawing. Safari draws KaTeX inside a
   <foreignObject> in the wrong place whenever the SVG is shrunk (every figure on a phone), so nothing is left there.
   A figure is never shrunk so far that its labels drop below MIN of their size: past that it scrolls sideways instead of turning
   its labels into specks. */
(function () {
  'use strict';
  const MIN = 0.6;
  const ro = window.ResizeObserver ? new ResizeObserver((es) => es.forEach((e) => scale(e.target))) : null;

  // the layer's coordinates are SVG user units; one transform maps them onto the drawing as it is shown
  function scale(box) {
    const svg = box.querySelector(':scope > svg'), lay = box.querySelector(':scope > .figov');
    if (!svg || !lay) return;
    const vb = svg.viewBox.baseVal, w = svg.getBoundingClientRect().width;
    if (!w || !vb || !vb.width) return;
    lay.style.width = `${vb.width}px`;
    lay.style.height = `${vb.height}px`;
    lay.style.transform = `scale(${w / vb.width})`;
  }

  // place each label from its user-space position (data-x/y); call again after the view box changes
  function relayout(svg) {
    const box = svg.parentElement;
    if (!box || !box.classList.contains('figbox')) return;
    const vb = svg.viewBox.baseVal;
    box.querySelectorAll(':scope > .figov > .flab').forEach((d) => {
      d.style.left = `${+d.dataset.x - vb.x}px`;
      d.style.top = `${+d.dataset.y - vb.y}px`;
    });
    const nat = +svg.getAttribute('width') || vb.width;
    box.style.width = `${nat}px`;
    box.style.minWidth = `${Math.round(Math.min(nat, vb.width * MIN))}px`;      // labels never below MIN of their size
    scale(box);
  }

  function liftSvg(svg) {
    const fos = [...svg.querySelectorAll('foreignObject')];
    if (!fos.length) return;
    let box = svg.parentElement;
    if (!box.classList.contains('figbox')) {
      box = document.createElement('div');
      box.className = 'figbox';
      svg.replaceWith(box);
      box.appendChild(svg);
    }
    let lay = box.querySelector(':scope > .figov');
    if (!lay) {
      lay = document.createElement('div');
      lay.className = `figov ${svg.getAttribute('class') || ''}`;
      lay.setAttribute('aria-hidden', 'true');
      box.appendChild(lay);
    }
    for (const fo of fos) {
      const d = document.createElement('div');
      d.className = `flab ${fo.getAttribute('class') || ''}`;
      d.dataset.x = fo.getAttribute('x');
      d.dataset.y = fo.getAttribute('y');
      d.style.width = `${fo.getAttribute('width')}px`;
      d.style.height = `${fo.getAttribute('height')}px`;
      while (fo.firstChild) d.appendChild(fo.firstChild);
      lay.appendChild(d);
      fo.remove();
    }
    // the drawing keeps its accessible name; the labels are read from the SVG's aria-label or skipped
    relayout(svg);
    if (ro) ro.observe(box);
  }

  function lift(root) {
    if (!root) return;
    root.querySelectorAll('svg').forEach((svg) => { if (svg.querySelector('foreignObject')) { try { liftSvg(svg); } catch (e) { /* never break the page */ } } });
  }

  // a figure's labels as [{el, span}] (for declutter)
  function labels(svg) {
    const box = svg.parentElement;
    if (!box || !box.classList.contains('figbox')) return [];
    return [...box.querySelectorAll(':scope > .figov > .flab')].map((el) => ({ el, sp: el.querySelector('div > span') }));
  }

  window.addEventListener('resize', () => document.querySelectorAll('.figbox').forEach(scale));
  window.FigLabels = { lift, relayout, labels, scale };
})();

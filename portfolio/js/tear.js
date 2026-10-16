/* =========================================================
   Torn-paper edges as animated clip-path polygons.
   Tear.top(p)    → visible from the top down to a ragged line at p (0..1)
   Tear.bottom(p) → visible from a ragged line at 1-p down to the bottom
   ========================================================= */
(function () {
  const STEPS = 90;
  let edge = [];
  function reseed() {
    // jagged high-frequency fibres + a slow wave, in % of viewport height
    const phase = Math.random() * 10, lean = (Math.random() - 0.5) * 6;
    edge = [];
    for (let i = 0; i <= STEPS; i++) {
      const x = i / STEPS;
      const jag = (Math.random() - 0.5) * 2.4 + (i % 2 ? 0.8 : -0.8) * Math.random();
      const wave = Math.sin(x * 6 + phase) * 1.6 + Math.sin(x * 17 + phase * 2) * 0.7;
      edge.push(jag + wave + lean * (x - 0.5));
    }
  }
  reseed();
  const AMP = 6; // how far the tear wanders, in vh-%

  function line(p) {
    // y position of the tear for progress p, overshooting so 0/1 fully hide/show
    const base = p * (100 + AMP * 2) - AMP;
    return edge.map((e, i) => `${((i / STEPS) * 100).toFixed(2)}% ${(base + e).toFixed(2)}%`);
  }
  window.Tear = {
    reseed,
    top(p) { return `polygon(0% -10%, 100% -10%, ${line(p).reverse().join(', ')})`; },
    bottom(p) { return `polygon(${line(1 - p).join(', ')}, 100% 110%, 0% 110%)`; },
    /** animate an element's clip from one shape to another */
    animate(el, kind, from, to, opts = {}) {
      const o = { p: from };
      el.style.clipPath = Tear[kind](from);
      return gsap.to(o, {
        p: to, duration: opts.duration || 0.9, ease: opts.ease || 'power3.inOut', delay: opts.delay || 0,
        onUpdate: () => { el.style.clipPath = Tear[kind](o.p); },
        onComplete: opts.onComplete,
      });
    },
  };
})();

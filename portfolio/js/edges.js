/* =========================================================
   Living page edges (after Hello Monday's sticky, gooey frame).
   A thin ink border runs around the whole screen. The left and right
   edges are chains of springs: only when the cursor (or a finger) is
   right next to one does it pull into a small bulge that ripples along
   the edge. The top (nav) and bottom stay still. The right edge opens
   the menu when clicked.
   ========================================================= */
(function () {
  const canvas = document.getElementById('edges');
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const INK = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#0d0d0d';
  let W = 0, H = 0, dpr = 1, base = 8, reach = 170, maxPull = 80;
  const pointer = { x: -9999, y: -9999, active: false, t: 0 };

  // one spring chain per edge: 0 top, 1 right, 2 bottom, 3 left
  const edges = [0, 1, 2, 3].map((i) => ({ i, n: 0, d: null, v: null }));
  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    base = W < 700 ? 4 : 6;
    reach = W < 700 ? 80 : 130;
    maxPull = W < 700 ? 26 : 46;
    edges.forEach((e) => {
      const len = e.i % 2 === 0 ? W : H;
      e.n = Math.max(12, Math.round(len / 28));
      e.d = new Float32Array(e.n + 1);
      e.v = new Float32Array(e.n + 1);
    });
  }
  window.addEventListener('resize', () => { build(); drawn = false; });
  build();

  const setPointer = (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; pointer.t = performance.now(); };
  window.addEventListener('pointermove', setPointer, { passive: true });
  window.addEventListener('pointerdown', setPointer, { passive: true });
  document.addEventListener('pointerleave', () => (pointer.active = false));
  window.addEventListener('blur', () => (pointer.active = false));

  // distance from the pointer to an edge, and its position along that edge
  function relate(e) {
    switch (e.i) {
      case 0: return [pointer.y, pointer.x, W];
      case 1: return [W - pointer.x, pointer.y, H];
      case 2: return [H - pointer.y, pointer.x, W];
      default: return [pointer.x, pointer.y, H];
    }
  }

  let energy = 1, drawn = false;
  function step(time) {
    energy = 0;
    const touchStale = performance.now() - pointer.t > 1200 && window.matchMedia('(hover: none)').matches;
    const live = pointer.active && !touchStale;
    for (const e of edges) {
      const [dist, along, len] = relate(e);
      // only the side edges ripple; the top (nav) and bottom stay still
      const still = e.i === 0 || e.i === 2;
      const seg = len / e.n;
      const near = !still && live && dist < reach && dist > -20 ? Math.pow(1 - Math.max(0, dist) / reach, 2) : 0;
      const spread = Math.max(75, len * 0.075);
      for (let k = 0; k <= e.n; k++) {
        const pos = k * seg;
        let target = 0;
        if (near > 0) target = near * maxPull * Math.exp(-Math.pow((pos - along) / spread, 2));
        const left = k > 0 ? e.d[k - 1] : 0, right = k < e.n ? e.d[k + 1] : 0;
        const force = (target - e.d[k]) * 0.06 + (left + right - 2 * e.d[k]) * 0.22;
        e.v[k] = (e.v[k] + force) * 0.9;
      }
      for (let k = 0; k <= e.n; k++) e.d[k] = Math.max(-base + 1, e.d[k] + e.v[k]);
      // corners stay pinned so the four chains meet cleanly
      e.d[0] *= 0.6; e.d[e.n] *= 0.6;
      for (let k = 0; k <= e.n; k++) energy = Math.max(energy, Math.abs(e.d[k]) + Math.abs(e.v[k]));
    }
  }

  function point(e, k) {
    const len = e.i % 2 === 0 ? W : H, t = (k / e.n) * len, o = base + e.d[k];
    switch (e.i) {
      case 0: return [t, o];
      case 1: return [W - o, t];
      case 2: return [W - t, H - o];
      default: return [o, H - t];
    }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.rect(0, 0, W, H);
    // inner outline: walk the four edges clockwise (point() already runs bottom and left backwards)
    const ordered = [];
    for (let k = 0; k < edges[0].n; k++) ordered.push(point(edges[0], k));
    for (let k = 0; k < edges[1].n; k++) ordered.push(point(edges[1], k));
    for (let k = 0; k < edges[2].n; k++) ordered.push(point(edges[2], k));
    for (let k = 0; k < edges[3].n; k++) ordered.push(point(edges[3], k));
    const N = ordered.length;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let m = mid(ordered[N - 1], ordered[0]);
    ctx.moveTo(m[0], m[1]);
    for (let j = 0; j < N; j++) {
      const p = ordered[j], q = ordered[(j + 1) % N], mm = mid(p, q);
      ctx.quadraticCurveTo(p[0], p[1], mm[0], mm[1]);
    }
    ctx.closePath();
    ctx.fill('evenodd');

    // the right edge doubles as a menu tab: label it when it bulges out
    const r = edges[1];
    let peak = 0, at = 0;
    for (let k = 0; k <= r.n; k++) if (r.d[k] > peak) { peak = r.d[k]; at = k; }
    if (peak > 22) {
      const y = (at / r.n) * H;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (peak - 22) / 14);
      ctx.translate(W - base - peak * 0.5, y);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#efede7';
      ctx.font = '500 10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(document.body.classList.contains('menu-open') ? 'CLOSE' : 'MENU', 0, 4);
      ctx.restore();
    }
  }

  // the frame only redraws while an edge is moving; at rest the last drawing simply stays on the canvas
  function frame(time) {
    if (!reduce) step(time);
    if (energy > 0.02 || !drawn) { draw(); drawn = true; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // clicking the right edge opens (or closes) the menu
  const tab = document.getElementById('edge-tab');
  if (tab) tab.addEventListener('click', () => document.getElementById('menu-btn').click());
})();

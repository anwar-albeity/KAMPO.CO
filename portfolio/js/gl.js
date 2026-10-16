/* =========================================================
   One full-screen WebGL canvas that redraws every [data-gl]
   image/video on the page with a monochrome ink shader:
   - black & white with print contrast and film grain
   - halftone dots + ripple around the cursor on hover
   - bends with scroll speed
   - bottom-up reveal when it enters the viewport
   Flipbook photos: <img data-gl data-frames="a.jpg,b.jpg" data-fps="8">
   If WebGL is unavailable, DOM images are shown instead.
   ========================================================= */
(function () {
  const canvas = document.getElementById('gl');
  const flipbooks = new Set(); // DOM flipbook fallback
  const noop = { enabled: false, scan: scanFallback, setVelocity() {}, clear() {} };

  let gl = null;
  try { gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false }); } catch (e) {}
  if (!gl) { window.GL = noop; startFallbackLoop(); return; }

  const VERT = `
    attribute vec2 aUv;
    uniform vec4 uRect;   // x, y, w, h in CSS px (y from top)
    uniform vec2 uView;
    uniform vec2 uMouse;
    uniform float uVel, uHover, uTime, uReveal, uCrumple;
    uniform vec4 uCornerA;   // corner offsets in px: top-left.xy, top-right.xy
    uniform vec4 uCornerB;   // bottom-left.xy, bottom-right.xy
    varying vec2 vUv;
    varying float vShade;
    float hash(vec2 q) { return fract(sin(dot(q, vec2(127.1, 311.7))) * 43758.5453); }
    float vnoise(vec2 q) {
      vec2 i = floor(q), f = fract(q); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + 1.0), f.x), f.y);
    }
    void main() {
      vUv = aUv;
      float w = uRect.z, h = uRect.w;
      vec3 p = vec3(aUv.x * w, aUv.y * h, 0.0);
      float fold = 1.0 - uReveal;            // 1 = folded shut, 0 = flat (can overshoot → paper bounce)
      float shade = 0.0;

      // a printed sheet folded along its middle crease opens up as it enters the page
      if (aUv.y > 0.5) {
        float a = fold * 3.0;
        float d = (aUv.y - 0.5) * h;
        p.y = 0.5 * h + d * cos(a);
        p.z = d * sin(a);
        shade = (1.0 - cos(a)) * 0.35;
      } else {
        float a = fold * 0.7;
        float d = (0.5 - aUv.y) * h;
        p.y = 0.5 * h - d * cos(a);
        p.z = d * sin(a);
        shade = (1.0 - cos(a)) * 0.25;
      }

      // Hello Monday-style hover: the four corners are pulled in by springs that follow
      // the cursor, and the sheet crumples and twitches while the pointer moves over it
      vec2 top = mix(uCornerA.xy, uCornerA.zw, aUv.x);
      vec2 bot = mix(uCornerB.xy, uCornerB.zw, aUv.x);
      p.xy += mix(top, bot, aUv.y);
      float tick = floor(uTime * 12.0);                       // stepped time = twitchy, hand-made feel
      vec2 cr = vec2(vnoise(aUv * 5.0 + tick * 1.7), vnoise(aUv * 5.0 + 31.0 + tick * 1.3)) - 0.5;
      float edgeFree = 0.35 + 0.65 * (1.0 - (1.0 - 4.0 * aUv.x * (1.0 - aUv.x)) * (1.0 - 4.0 * aUv.y * (1.0 - aUv.y)));
      p.xy += cr * uCrumple * 16.0 * edgeFree;
      p.z += (vnoise(aUv * 6.0 + tick) - 0.5) * uCrumple * 40.0;
      float facet = (vnoise(aUv * 7.0 + 9.0 + tick * 0.5) - 0.5) * uCrumple * 0.45;

      // the paper's edges ripple: the outline goes wavy and uneven, strongest at the border
      float edgeW = pow(max(abs(aUv.x - 0.5), abs(aUv.y - 0.5)) * 2.0, 3.0);
      float t2 = uTime * 3.0;
      vec2 ew = vec2(
        sin(aUv.y * 13.0 + t2 + aUv.x * 4.0) * 0.6 + (vnoise(aUv * 9.0 + tick * 2.1 + 50.0) - 0.5) * 1.6,
        sin(aUv.x * 11.0 - t2 * 1.2 + aUv.y * 3.0) * 0.6 + (vnoise(aUv * 9.0 + tick * 1.9 + 80.0) - 0.5) * 1.6
      );
      p.xy += ew * edgeW * uHover * (5.0 + uCrumple * 9.0);
      facet += (ew.x + ew.y) * edgeW * uHover * 0.04;

      // scrolling makes the sheet curl
      float curl = sin(aUv.x * 3.14159);
      p.z += curl * abs(uVel) * 0.9;
      p.y += curl * uVel * 0.5;

      shade += facet;

      // perspective around the sheet's centre
      float f = 1500.0;
      vec2 c = vec2(w, h) * 0.5;
      vec2 px = uRect.xy + c + (p.xy - c) * (f / (f - p.z));
      vShade = shade;
      vec2 clip = px / uView * 2.0 - 1.0;
      clip.y *= -1.0;
      gl_Position = vec4(clip, 0.0, 1.0);
    }`;

  const FRAG = `
    precision highp float;
    varying vec2 vUv;
    varying float vShade;
    uniform sampler2D uTex;
    uniform vec2 uImg;
    uniform vec4 uRect;
    uniform vec2 uMouse;
    uniform float uHover, uTime, uReveal, uDim;
    float rand(vec2 c) { return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec3 ink = vec3(0.051), paper = vec3(0.937, 0.929, 0.906);
      float fold = clamp(1.0 - uReveal, 0.0, 1.0);
      float alpha = smoothstep(0.0, 0.15, uReveal);

      // the back of the folded flap is blank paper
      // (clip-space y is flipped, so the printed side reports as back-facing)
      if (gl_FrontFacing) {
        float g = (rand(vUv * uRect.zw) - 0.5) * 0.05;
        gl_FragColor = vec4((paper * (0.86 - vShade * 0.3) + g) * (1.0 - uDim), alpha);
        return;
      }

      float ra = uRect.z / uRect.w;
      float ri = uImg.x / uImg.y;
      vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);
      vec2 tuv = (vUv - 0.5) * s + 0.5;
      tuv = (tuv - 0.5) * (1.0 - 0.05 * uHover) + 0.5;            // hover zoom

      vec2 d = vUv - uMouse; d.x *= ra;
      float dist = length(d);
      float near = smoothstep(0.38, 0.0, dist) * uHover;

      vec3 c = texture2D(uTex, tuv).rgb;
      float l = dot(c, vec3(0.299, 0.587, 0.114));
      l = clamp((l - 0.5) * 1.3 + 0.52, 0.0, 1.0);                  // print contrast

      // rotated halftone grid, revealed around the cursor
      vec2 p = vUv * uRect.zw;
      p = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p;
      vec2 cell = fract(p / 7.0) - 0.5;
      float dotInk = 1.0 - smoothstep(0.0, 0.08, length(cell) - (1.0 - l) * 0.62);
      l = mix(l, 1.0 - dotInk, near * 0.6);

      l += (rand(vUv * uRect.zw + fract(uTime) * 100.0) - 0.5) * 0.09;  // grain
      l -= vShade;                                                      // light falling on the bent sheet
      // the crease stays faintly visible, like a fold in a real magazine
      float crease = exp(-pow((vUv.y - 0.5) * 140.0, 2.0));
      l -= crease * (0.08 + fold * 0.35);
      l += exp(-pow((vUv.y - 0.507) * 160.0, 2.0)) * 0.05;
      gl_FragColor = vec4(mix(ink, paper, clamp(l, 0.0, 1.0)) * (1.0 - uDim), alpha);
    }`;

  function shader(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { console.warn('[gl] disabled:', e); window.GL = noop; startFallbackLoop(); return; }
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // subdivided quad so the scroll bend is smooth
  const SEG = 24, uvs = [];
  for (let y = 0; y < SEG; y++) for (let x = 0; x < SEG; x++) {
    const a = [x / SEG, y / SEG], b = [(x + 1) / SEG, y / SEG], c = [x / SEG, (y + 1) / SEG], d = [(x + 1) / SEG, (y + 1) / SEG];
    uvs.push(...a, ...b, ...c, ...b, ...d, ...c);
  }
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
  const aUv = gl.getAttribLocation(prog, 'aUv');
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
  const U = {};
  ['uRect', 'uView', 'uVel', 'uTex', 'uImg', 'uMouse', 'uHover', 'uTime', 'uReveal', 'uCrumple', 'uCornerA', 'uCornerB', 'uDim'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));
  const VCOUNT = uvs.length / 2;

  const planes = [];
  const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, speed: 0 };
  let vel = 0, velTarget = 0, view = { w: 1, h: 1, dpr: 1 };
  // phones and tablets have no hover: a touch (or a scroll) plays the same paper effect
  const touchOnly = window.matchMedia('(hover: none)').matches;
  let lastTouch = -1e9;
  const onPointer = (e) => {
    if (e.type === 'pointermove') { mouse.vx = e.clientX - mouse.x; mouse.vy = e.clientY - mouse.y; }
    mouse.x = e.clientX; mouse.y = e.clientY;
    if (e.pointerType && e.pointerType !== 'mouse') lastTouch = performance.now();
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('pointerdown', onPointer, { passive: true });

  function resize() {
    view.dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.w = window.innerWidth; view.h = window.innerHeight;
    canvas.width = view.w * view.dpr; canvas.height = view.h * view.dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  window.addEventListener('resize', resize); resize();

  function disable(reason) {
    console.warn('[gl] falling back to DOM images:', reason);
    document.documentElement.classList.remove('gl-on');
    planes.forEach((p) => { if (p.frames) flipbooks.add(p); });
    planes.length = 0;
    api.enabled = false;
    gl.clear(gl.COLOR_BUFFER_BIT);
    startFallbackLoop();
  }

  function upload(p, source) {
    gl.bindTexture(gl.TEXTURE_2D, p.tex);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
    } catch (e) {
      // e.g. opened from file:// — the browser blocks images in WebGL. Use a local server.
      disable(e.message); return false;
    }
    return true;
  }

  function makeTex() {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([200, 200, 200]));
    return tex;
  }

  function makePlane(el) {
    const tex = makeTex();
    const p = { el, tex, ready: false, img: [1, 1], hover: 0, mx: 0.5, my: 0.5, cx: new Float32Array(8), cv: new Float32Array(8), crumple: 0, reveal: el.hasAttribute('data-gl-instant') ? 1 : 0, revealed: el.hasAttribute('data-gl-instant') };
    initSource(p);
    planes.push(p);
  }

  function initSource(p) {
    const el = p.el;
    if (el.tagName === 'VIDEO') {
      p.video = el; el.muted = true; el.play().catch(() => {});
      return;
    }
    const frames = el.dataset.frames ? el.dataset.frames.split(',') : null;
    if (frames && frames.length > 1) {
      p.frames = frames.map((src) => { const i = new Image(); i.src = src; return i; });
      p.fps = +el.dataset.fps || 8; p.frame = -1; p.start = performance.now(); p.texs = [];
      return;
    }
    const img = new Image();
    img.onload = () => { if (upload(p, img)) { p.img = [img.naturalWidth, img.naturalHeight]; p.ready = true; } };
    img.src = el.currentSrc || el.src;
  }

  function scan(root = document) {
    // drop planes whose element left the page
    for (let i = planes.length - 1; i >= 0; i--) if (!planes[i].el.isConnected) { const q = planes[i]; new Set([q.tex, ...(q.texs || [])]).forEach((t) => t && gl.deleteTexture(t)); planes.splice(i, 1); }
    if (!api.enabled) return scanFallback(root);
    root.querySelectorAll('[data-gl]').forEach((el) => { if (!planes.some((p) => p.el === el)) makePlane(el); });
  }

  // corner springs: each corner is pulled inward, more strongly the closer the cursor is,
  // and nudged along the pointer's motion; springs overshoot so the sheet wobbles back
  const CORNERS = [[0, 0], [1, 0], [0, 1], [1, 1]];
  function springCorners(p, r, inside, pt) {
    const diag = Math.hypot(r.width, r.height);
    const h = p.hover;
    for (let i = 0; i < 4; i++) {
      const cx = r.left + CORNERS[i][0] * r.width, cy = r.top + CORNERS[i][1] * r.height;
      let tx = 0, ty = 0;
      if (h > 0.01) {
        const near = Math.max(0, 1 - Math.hypot(pt.x - cx, pt.y - cy) / diag);
        const k = h * (0.05 + near * near * 0.16);
        tx = (r.left + r.width / 2 - cx) * k + (pt.x - cx) * k * 0.25 + pt.vx * near * h * 0.9;
        ty = (r.top + r.height / 2 - cy) * k + (pt.y - cy) * k * 0.25 + pt.vy * near * h * 0.9;
      }
      const ix = i * 2, iy = ix + 1;
      p.cv[ix] = (p.cv[ix] + (tx - p.cx[ix]) * 0.2) * 0.72; p.cx[ix] += p.cv[ix];
      p.cv[iy] = (p.cv[iy] + (ty - p.cx[iy]) * 0.2) * 0.72; p.cx[iy] += p.cv[iy];
    }
    const target = inside ? 0.25 + Math.min(1, pt.speed / 25) * 0.75 : 0;
    p.crumple += (target - p.crumple) * (target > p.crumple ? 0.3 : 0.08);
  }

  const t0 = performance.now();
  let idle = false;
  function render() {
    if (!api.enabled) return;
    vel += (velTarget - vel) * 0.12;
    mouse.speed += (Math.hypot(mouse.vx, mouse.vy) - mouse.speed) * 0.25;
    mouse.vx *= 0.6; mouse.vy *= 0.6;
    velTarget *= 0.9;
    // nothing on screen to draw (most of Services, Contact): clear once, then hide the full-screen canvas so the
    // browser stops compositing an empty layer over the page every frame
    let any = false;
    for (const p of planes) { const r = p.el.getBoundingClientRect(); if (r.width >= 2 && r.bottom >= -50 && r.top <= view.h + 50) { any = true; break; } }
    if (!any) { if (!idle) { gl.disable(gl.SCISSOR_TEST); gl.clear(gl.COLOR_BUFFER_BIT); canvas.style.visibility = 'hidden'; idle = true; } return; }
    if (idle) { canvas.style.visibility = ''; idle = false; }
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const time = (performance.now() - t0) / 1000;
    gl.uniform2f(U.uView, view.w, view.h);
    gl.uniform1f(U.uTime, time);
    gl.uniform1f(U.uVel, Math.max(-40, Math.min(40, vel)));
    for (const p of planes) {
      const r = p.el.getBoundingClientRect();
      if (r.width < 2 || r.bottom < -50 || r.top > view.h + 50) continue;
      // first time on screen → reveal
      if (!api.held && !p.revealed && r.top < view.h * 0.92) { p.revealed = true; gsap.to(p, { reveal: 1, duration: 2, ease: 'back.out(1.5)', delay: 0.1 }); }
      // flipbook / video sources
      if (p.frames) {
        const f = Math.floor(((performance.now() - p.start) / 1000) * p.fps) % p.frames.length;
        const im = p.frames[f];
        // each flipbook frame goes up to the GPU once; after that a frame change is just a texture switch
        if (f !== p.frame && im.complete && im.naturalWidth) {
          if (p.texs[f]) p.tex = p.texs[f];
          else { p.tex = p.texs.length || p.frame >= 0 ? makeTex() : p.tex; if (!upload(p, im)) return; p.texs[f] = p.tex; }
          p.frame = f; p.img = [im.naturalWidth, im.naturalHeight]; p.ready = true;
        }
      } else if (p.video && p.video.readyState >= 2) {
        if (!upload(p, p.video)) return; p.img = [p.video.videoWidth, p.video.videoHeight]; p.ready = true;
      }
      if (!p.ready) continue;
      let pt = mouse;
      let inside = mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom;
      if (touchOnly || performance.now() - lastTouch < 3000) {
        const touching = inside && performance.now() - lastTouch < 900;
        // while scrolling, the image crossing the middle of the screen crumples as if touched
        const mid = view.h * 0.5;
        const scrolled = !touching && Math.abs(vel) > 0.6 && r.top < mid && r.bottom > mid;
        inside = touching || scrolled;
        if (scrolled) pt = { x: r.left + r.width * 0.5, y: mid, vx: 0, vy: -vel * 0.6, speed: Math.abs(vel) * 1.5 };
      }
      p.hover += ((inside ? 1 : 0) - p.hover) * 0.08;
      if (inside) { p.mx += ((pt.x - r.left) / r.width - p.mx) * 0.2; p.my += ((pt.y - r.top) / r.height - p.my) * 0.2; }
      const op = parseFloat(getComputedStyle(p.el.closest('.media') || p.el).opacity);
      if (op < 0.01) continue;
      // on the front page a later spread is laid over this one: cut the image off at that sheet's top edge
      // and darken it with the sheet underneath
      if (p.spread === undefined) { const sp = p.el.closest('.spread'); p.spread = sp; p.over = sp ? [...document.querySelectorAll('.spread')] : null; }
      let cut = view.h, dim = 0;
      if (p.spread) {
        const list = p.over, k = list.indexOf(p.spread), nx = list[k + 1];
        if (nx) cut = Math.max(0, nx.getBoundingClientRect().top);
        const sh = p.spread.querySelector(':scope > .spread__shade'); if (sh) dim = parseFloat(sh.style.opacity) || 0;
        if (cut <= r.top) continue;
      }
      if (cut < view.h) { gl.enable(gl.SCISSOR_TEST); gl.scissor(0, Math.round((view.h - cut) * view.dpr), canvas.width, Math.round(cut * view.dpr)); } else gl.disable(gl.SCISSOR_TEST);
      gl.uniform1f(U.uDim, dim);
      springCorners(p, r, inside, pt);
      gl.bindTexture(gl.TEXTURE_2D, p.tex);
      gl.uniform4f(U.uCornerA, p.cx[0], p.cx[1], p.cx[2], p.cx[3]);
      gl.uniform4f(U.uCornerB, p.cx[4], p.cx[5], p.cx[6], p.cx[7]);
      gl.uniform1f(U.uCrumple, p.crumple);
      gl.uniform4f(U.uRect, r.left, r.top, r.width, r.height);
      gl.uniform2f(U.uImg, p.img[0], p.img[1]);
      gl.uniform2f(U.uMouse, p.mx, p.my);
      gl.uniform1f(U.uHover, p.hover);
      gl.uniform1f(U.uReveal, p.reveal);
      gl.drawArrays(gl.TRIANGLES, 0, VCOUNT);
    }
  }

  // ---- DOM fallback: still animate flipbooks by swapping src ----
  function scanFallback(root = document) {
    root.querySelectorAll('img[data-frames]').forEach((el) => {
      if ([...flipbooks].some((f) => f.el === el)) return;
      const frames = el.dataset.frames.split(',');
      frames.forEach((s) => { new Image().src = s; });
      flipbooks.add({ el, frames, fps: +el.dataset.fps || 8, start: performance.now(), frame: 0 });
    });
  }
  let fallbackRunning = false;
  function startFallbackLoop() {
    if (fallbackRunning) return; fallbackRunning = true;
    scanFallback();
    (function tick() {
      flipbooks.forEach((f) => {
        if (!f.el.isConnected) return flipbooks.delete(f);
        const list = Array.isArray(f.frames) && typeof f.frames[0] === 'string' ? f.frames : f.frames.map((i) => i.src);
        const i = Math.floor(((performance.now() - f.start) / 1000) * f.fps) % list.length;
        if (i !== f.frame) { f.frame = i; f.el.src = list[i]; }
      });
      requestAnimationFrame(tick);
    })();
  }

  const api = {
    enabled: true,
    held: false, // true while the opening spin plays, so images wait to unfold
    scan,
    setVelocity(v) { velTarget = v * 1.6; },
  };
  window.GL = api;
  document.documentElement.classList.add('gl-on');
  gsap.ticker.add(render);
})();

/* =========================================================
   App: router + torn-paper transitions, smooth scroll,
   menu, cursor, drag carousels, bookshelf, reveals.
   ========================================================= */
(function () {
  const S = window.SITE;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[c]);
  const page = $('#page');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- chrome ---------- */
  const logo = $('.topbar__logo');
  if (S.logo) logo.innerHTML = `<img src="${S.logo}" alt="${S.studio}">`; else logo.textContent = S.studio;
  $('#menu-socials').innerHTML = S.socials.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>`).join('');
  const tick = [`Now booking new projects`, S.email, ...S.socials.map((s) => s.label), S.location].map((t) => `<span>${t}</span>`).join('');
  $('#bottombar').innerHTML = `<div class="bottombar__ticker">${tick}${tick}${tick}${tick}</div>`;
  const meta = $('#topbar-meta');
  const clock = () => { meta.textContent = `${S.issue} · ${S.location} · ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' })}`; };
  clock(); setInterval(clock, 30000);

  /* ---------- smooth scroll ---------- */
  // After a page turn, the swipe that turned it is still coasting (trackpads keep sending wheel events for a second or
  // more). That leftover input is swallowed until the hand is still or a fresh swipe starts, so the next page opens
  // at its top and its first scroll animation plays from the reader's own scroll, not from the old page's momentum.
  const hush = { on: false, last: 0, prev: 0, until: 0 };
  const hushed = (dy) => {
    if (!hush.on) return false;
    const now = performance.now(), a = Math.abs(dy), gap = now - hush.last, prev = hush.prev;
    hush.last = now; hush.prev = a;
    // free again when: the wheel went quiet, a new swipe begins (input jumps up after dying away), or the cap runs out
    if (now > hush.until && (gap > 200 || (a > 12 && a > prev * 1.8) || now > hush.until + 1800)) { hush.on = false; return false; }
    return true;
  };
  // lerp 0.1 keeps the glide but follows a trackpad closely, so a swipe moves the page as far and as fast as it would natively
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: !reduce, wheelMultiplier: 1, virtualScroll: (e) => {
    if (!e.event.type.includes('wheel') || !hushed(e.deltaY)) return true;
    if (e.event.cancelable) e.event.preventDefault(); // Lenis skips its own preventDefault when this says no
    return false;
  } });
  lenis.on('scroll', (e) => { ScrollTrigger.update(); GL.setVelocity(e.velocity); });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  /* ---------- cursor ---------- */
  const cursor = $('#cursor'), label = $('#cursor-label');
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.12, ease: 'power3' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.12, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest('[data-cursor]');
    if (t) { label.textContent = t.dataset.cursor; cursor.classList.add('is-big'); gsap.to(cursor, { width: 84, height: 84, margin: -42, duration: 0.35 }); }
    else if (e.target.closest('a,button')) { cursor.classList.remove('is-big'); gsap.to(cursor, { width: 32, height: 32, margin: -16, duration: 0.3 }); }
    else { cursor.classList.remove('is-big'); gsap.to(cursor, { width: 12, height: 12, margin: -6, duration: 0.3 }); }
  });

  /* ---------- menu (torn paper) ---------- */
  const menu = $('#menu'), menuBtn = $('#menu-btn');
  let menuOpen = false, menuBusy = false;
  function openMenu() {
    if (menuBusy || menuOpen) return; menuBusy = true; menuOpen = true;
    Tear.reseed(); lenis.stop();
    menu.style.visibility = 'visible'; menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open'); menuBtn.textContent = 'Close'; menuBtn.setAttribute('aria-expanded', 'true');
    Tear.animate(menu, 'top', 0, 1, { duration: 1, ease: 'power4.inOut', onComplete: () => (menuBusy = false) });
    gsap.fromTo($$('.menu__nav a', menu), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.07, delay: 0.45, duration: 0.8, ease: 'expo.out' });
  }
  function closeMenu(cb) {
    if (!menuOpen) return cb && cb();
    if (menuBusy) return; menuBusy = true;
    Tear.reseed();
    Tear.animate(menu, 'top', 1, 0, {
      duration: 0.85, ease: 'power4.inOut',
      onComplete: () => {
        menu.style.visibility = 'hidden'; menu.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-open'); menuBtn.textContent = 'Menu'; menuBtn.setAttribute('aria-expanded', 'false');
        menuOpen = false; menuBusy = false; lenis.start(); cb && cb();
      },
    });
  }
  menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- router ---------- */
  const sheet = $('#sheet'), sheetTitle = $('#sheet-title');
  let busy = false, first = true, flip = null, cleanups = [], current = '/', silentHash = null;
  const parse = (h) => (h || '#/').replace(/^#/, '') || '/';

  function view(path) {
    const parts = path.split('/').filter(Boolean);
    if (!parts.length) return { html: Pages.index(), name: 'Index' };
    if (parts[0] === 'work' && parts[1]) {
      const html = Pages.project(parts[1]);
      const p = S.projects.find((x) => x.slug === parts[1]);
      return html ? { html, name: p.title } : { html: Pages.notFound(), name: '404' };
    }
    if (parts[0] === 'work') return { html: Pages.index(), name: 'Index' }; // old link: the work now lives on the front page
    if (parts[0] === 'services') return { html: Pages.services(), name: 'Services' };
    if (parts[0] === 'about') return { html: Pages.about(), name: 'About' };
    if (parts[0] === 'contact') return { html: Pages.contact(), name: 'Contact' };
    return { html: Pages.notFound(), name: '404' };
  }

  let returnTo = null;
  document.addEventListener('click', (e) => { const a = e.target.closest('a[data-return]'); if (a) returnTo = a.dataset.return; }, true);
  // Esc closes a project page
  /* ---------- the brief: pick services, give an email, then one question per screen, in place ---------- */
  const quiz = { open: false };
  const qVals = (f) => {
    const all = (n) => [...f.querySelectorAll(`input[name="${n}"]:checked`)].map((x) => x.value);
    const v = (n) => (f.elements[n] && f.elements[n].value || '').trim();
    return { all, one: (n) => all(n)[0] || '', v };
  };
  // Three doors, one flow. The door decides the first screens (a bundle and its list, the areas and a list
  // for each, or the custom-build scoping); then one short follow-up for each area, three at most; then when,
  // where to send the price, and a last look.
  const DOOR = { 'Ready-made package': 'bundle', 'Pick and mix': 'mix', 'Custom build': 'custom' };
  const qDoor = (f) => DOOR[qVals(f).one('door')] || '';
  const qPicked = (f) => [...f.querySelectorAll('input[name^="svc_"]:checked')].map((x) => x.value).filter((x) => x !== '__other');
  const qScreens = (f) => {
    const box = f.closest('[data-quizx]'), door = qDoor(f);
    const kit = door === 'bundle' || door === 'mix', needs = kit ? [...new Set(qPicked(f).flatMap(svcNeed))] : [];
    const count = {}; let more = 0;
    const picked = kit ? qPicked(f) : [], areas = new Set(S.offer.pillars.filter((p) => p.services.some((x) => picked.includes(x[0]))).map((p) => p.key));
    return [...f.querySelectorAll('.qx:not(.qx--done)')].filter((q) => {
      const k = q.dataset.q;
      if (k === 'door') return box.dataset.doorset !== '1';
      if (k === 'bundle') return door === 'bundle' && box.dataset.packset !== '1';
      if (q.dataset.door && q.dataset.door !== door) return false;
      if (k === 'menu') return kit;
      if (k === 'mixCustom') return kit && !!f.querySelector('input[name=wantCustom]:checked');
      if (k === 'idea') return door !== 'custom';
      // tailored: an area's shared screen when anything in it is ticked, then one screen per ticked service
      if (q.dataset.area) return kit && areas.has(q.dataset.area);
      if (q.dataset.svc) return kit && picked.includes(q.dataset.svc);
      if (!q.dataset.show) return true;
      if (!needs.includes(q.dataset.show) || count[q.dataset.show] || more >= 3) return false;
      count[q.dataset.show] = 1; more += 1; return true;
    });
  };
  const qMsg = (box) => $('.flow__msg', box);
  function qGo(box, i, dir = 1) {
    const f = $('[data-quiz]', box), list = qScreens(f), n = list.length;
    if (dir === 1 && box.dataset.ret === '1') i = n - 1; // changed an answer from the last look: straight back to it
    i = Math.max(0, Math.min(i, n - 1)); box.dataset.i = i;
    if (i === n - 1) box.dataset.ret = '0';
    const prev = f.querySelector('.qx:not([hidden])'), q = list[i];
    f.querySelectorAll('.qx').forEach((x) => { x.hidden = x !== q; });
    // the total is only known once the door, bundle or areas are chosen, so it is not shown before then
    $('.flow__count', box).textContent = q.dataset.q === 'sum' ? 'Last look' : ['door', 'bundle', 'menu'].includes(q.dataset.q) ? `Question ${i + 1}` : `${i + 1} of ${n - 1}`;
    const qn = $('[data-qn]', q); if (qn) qn.textContent = String(i + 1).padStart(2, '0');
    // the side: which of the four stages this question belongs to
    const k = q.dataset.q, st = ['biz', 'goal', 'idea', 'when'].includes(k) ? 1 : k === 'name' ? 2 : ['call', 'sum'].includes(k) ? 3 : 0;
    $$('.flow__steps li', box).forEach((li, j) => { li.classList.toggle('is-now', j === st); li.classList.toggle('is-done', j < st); });
    if (q.dataset.q === 'sum') qSum(box);
    if (q.dataset.q === 'menu' && box.dataset.focus) { const g = $(`.qmenu[data-area="${box.dataset.focus}"]`, q); box.dataset.focus = ''; if (g) setTimeout(() => { g.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); g.classList.add('is-flash'); setTimeout(() => g.classList.remove('is-flash'), 1600); }, 500); }
    gsap.to($('.flow__bar i', box), { scaleX: 0.2 + 0.8 * (i + 1) / n, duration: 0.8, ease: 'expo.out' }); // starts part full: you are already on your way
    $('[data-quiz-back]', box).style.visibility = i ? 'visible' : 'hidden';
    $('[data-quiz-next]', box).hidden = i >= n - 2; $('[data-quiz-sum]', box).hidden = i !== n - 2; $('[data-quiz-send]', box).hidden = i !== n - 1; $('[data-quiz-wa]', box).hidden = i !== n - 1;
    qMsg(box).textContent = '';
    if (!reduce && prev !== q) {
      gsap.fromTo($('.qx__q', q), { yPercent: 60 * dir, opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { yPercent: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.out' });
      gsap.fromTo($$('.qx__for, .qx__hint, .chip, .qx__line:not([hidden]), .qx__enter, .sum li', q), { y: 24 * dir, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: { each: 0.025, from: 'start' }, delay: 0.08 });
    }
    $('.flow__main', box).scrollTop = 0;
    const first = q.querySelector('.qx__line:not([hidden]) input, .qx__write textarea');
    setTimeout(() => { if (first && (innerWidth > 760 || !q.querySelector('.chip'))) first.focus({ preventScroll: true }); else $('.flow__main', box).focus({ preventScroll: true }); }, 80);
  }
  function qCheck(box) {
    const f = $('[data-quiz]', box), q = qScreens(f)[+box.dataset.i || 0], req = q.dataset.req, { all, v } = qVals(f);
    if (!req) return true;
    const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'));
    const ok = req === 'menu' ? qPicked(f).length || v('bundleAdd') || f.querySelector('input[name=wantCustom]:checked') : req === 'need' ? all('need').length : req === 'name' ? v('name') && mailOk : req === 'call' ? v('callDay') && v('callTime') : v(req);
    if (!ok) {
      qMsg(box).textContent = req === 'menu' ? 'Tick at least one service, or tell us what you need.' : req === 'need' ? 'Pick at least one area.' : req === 'door' || req === 'bundle' ? 'Pick one to go on.' : req === 'custom' || req === 'extra' ? 'Tell us a little about what to build.' : req === 'call' ? (!v('callDay') ? 'Pick a day for your call.' : 'Pick a time for your call.') : req === 'industry' ? 'Tell us in a few words what your business does.' : !v('name') ? 'Add your name so we know who is writing.' : 'Add an email so we can send your quote.';
      const bad = req === 'name' ? (!v('name') ? f.elements.name : f.elements.email) : req === 'industry' ? f.elements.industry : null; if (bad) bad.focus();
      if (!reduce) gsap.fromTo(q, { x: -10 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, .3)' });
    }
    return !!ok;
  }
  const secOf = (box) => box._sec || box.closest('[data-brief]');
  const boxOf = (sec) => sec._box || $('[data-quizx]', sec);
  function qOpen(box) {
    const sec = secOf(box);
    box._sec = sec; sec._box = box; box.dataset.ret = '0';
    quiz.open = box; sec.classList.add('is-flow'); document.body.classList.add('brief-open');
    document.body.append(box); box.hidden = false; lenis.stop(); qGo(box, 0);
    if (!reduce) gsap.fromTo(box, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'expo.inOut', clearProps: 'clipPath' });
  }
  // open the flow behind a door: 'bundle', 'mix' or 'custom'; areas can arrive already picked
  function build(door, need = [], pack = '', picks = null) {
    const sec = $('#brief', page); if (!sec) return false;
    const box = boxOf(sec), f = $('[data-quiz]', box), label = Object.keys(DOOR).find((k) => DOOR[k] === door);
    $$('input[name=door]', f).forEach((x) => { x.checked = x.value === label; });
    box.dataset.doorset = label ? '1' : '0'; box.dataset.packset = '0';
    if (door === 'bundle' && pack) { const r = $$('input[name=bundle]', f).find((x) => x.value === pack); if (r) { r.checked = true; bundleFill(f); box.dataset.packset = '1'; if (picks) $$('input[name^="svc_"]', f).forEach((x) => { x.checked = picks.includes(x.value); }); } }
    // a fresh pick and mix starts empty, not with an earlier bundle still ticked
    if (door === 'mix' && f.dataset.base) { $$('input[name^="svc_"]', f).forEach((x) => { x.checked = false; }); delete f.dataset.base; $$('[data-in-base]', f).forEach((x) => x.removeAttribute('data-in-base')); menuHint(f); }
    if (door === 'mix' && picks) $$('input[name^="svc_"]', f).forEach((x) => { x.checked = picks.includes(x.value); });
    const area = need.length && S.offer.pillars.find((p) => p.name === need[0]); box.dataset.focus = area ? area.key : '';
    if (!box.hidden) qGo(box, 0); else qOpen(box);
    return true;
  }
  // a bundle is a base: it ticks its services on the same full menu, and the client adds or removes from there
  function menuHint(f) {
    const el = $('[data-menu-hint]', f), pk = f.dataset.base && (S.offer.packages || []).find((k) => k.name === qVals(f).one('bundle'));
    if (el) el.textContent = pk ? `The ${pk.name} package is ticked. Untick what you don’t need, tick anything to add.` : 'Tick what you need, in any area. Each one you tick gets its own short set of questions.';
  }
  function bundleFill(f) {
    const pk = (S.offer.packages || []).find((k) => k.name === qVals(f).one('bundle')); if (!pk) return;
    const all = $$('input[name^="svc_"]', f);
    all.forEach((x) => { const on = pk.services.includes(x.value); x.checked = on; x.closest('label').toggleAttribute('data-in-base', on); });
    f.dataset.base = JSON.stringify(pk.services); menuHint(f);
  }
  document.addEventListener('change', (e) => {
    if (e.target.name === 'bundle') bundleFill(e.target.form);
    const ow = e.target.closest('.own'); if (ow && e.target.closest('.own__list')) { const n = $$('.own__list input:checked', ow).length; $$('[data-own-n]', ow).forEach((x) => { x.textContent = n; }); $('[data-own-w]', ow).textContent = n === 1 ? 'service' : 'services'; ow.classList.toggle('is-on', n > 0); }
    const card = e.target.closest('.pkg'); if (card) { const n = $$('.pkg__opts input:checked', card).length; $('[data-pk-n]', card).textContent = n; card.classList.toggle('is-edited', $$('.pkg__opts input', card).some((x) => x.checked !== x.defaultChecked)); }
  });
  function qClose(box) {
    const sec = secOf(box), menu = $('.brief__menu', sec);
    const done = () => { box.hidden = true; if (sec.isConnected) menu.after(box); quiz.open = false; sec.classList.remove('is-flow'); document.body.classList.remove('brief-open'); lenis.start(); cartPaint(); };
    if (reduce) return done();
    gsap.to(box, { clipPath: 'inset(100% 0 0 0)', duration: 0.6, ease: 'expo.inOut', onComplete: () => { gsap.set(box, { clearProps: 'clipPath' }); done(); } });
  }
  // every answer, in the order asked, labelled with its question
  const qAnswers = (f, only) => {
    const out = {}, { v } = qVals(f);
    (only ? [only] : qScreens(f)).forEach((q) => {
      const head = q.querySelector('.qx__q').textContent.trim().replace(/[.?!]+$/, '');
      const names = [...new Set($$('input:not([type=hidden]), textarea', q).map((x) => x.name))];
      names.forEach((n) => {
        // a tailored question is labelled with its service (or area) and its own wording
        const tq = (x) => { const el = q.querySelector(`[name="${x}"]`), qs = el && el.closest('.qsub'); return qs ? `${q.dataset.svc || $('.qx__for span', q).textContent.trim()} · ${qs.querySelector('.qsub__h').firstChild.textContent.trim().replace(/[?.]$/, '')}` : ''; };
        if (n.endsWith('__other')) { const t = v(n), key = tq(n.replace(/__other$/, '')) || head; if (t) out[key] = (out[key] ? out[key] + ', ' : '') + `Other: ${t}`; return; }
        const els = $$(`[name="${n}"]`, q), multi = els[0].type === 'checkbox' || els[0].type === 'radio';
        const tk = tq(n); if (tk) { const val = multi ? els.filter((x) => x.checked && x.value !== '__other').map((x) => x.value).join(', ') : v(n); if (val) out[tk] = out[tk] ? `${val}, ${out[tk]}` : val; return; }
        const val = multi ? els.filter((x) => x.checked && x.value !== '__other').map((x) => x.value).join(', ') : v(n);
        if (!val) return;
        const fl = !multi && els[0].closest('.qx__line--f'), sub = fl ? fl.querySelector('span').textContent.trim() : '';
        const LB = { heard: 'Heard about us', when: 'When needed', callDay: 'Meeting day', callTime: 'Meeting time (EAT)', callHow: 'Meeting by' };
        const area = n.startsWith('svc_') && S.offer.pillars.find((p) => 'svc_' + p.key === n);
        const lbl = multi ? (area ? area.name : n === 'wantCustom' ? 'Custom' : LB[n] || head) : /^Your answer/.test(sub) || !sub ? head : sub.replace(/\s*\(optional\)/, '').replace(/\?$/, '');
        out[lbl] = val;
      });
    });
    return out;
  };
  // the last look: every answer on its own line; tap one to go back and change it
  function qSum(box) {
    const f = $('[data-quiz]', box), list = qScreens(f), ol = $('[data-sum]', box);
    ol.innerHTML = list.map((q, k) => {
      if (q.dataset.q === 'sum') return '';
      const a = qAnswers(f, q), head = $('.qx__q', q).textContent.trim();
      const val = q.dataset.q === 'name' ? Object.values(a).join(' · ') : q.querySelector('.qsub') ? Object.entries(a).map(([k2, x]) => `${k2.split(' · ').pop()}: ${x}`).join(' · ') : Object.values(a).join(', ');
      return `<li><button type="button" class="sum__row" data-sum-go="${k}"><span class="sum__q">${esc(head)}</span><span class="sum__a">${val ? esc(val) : '<i>Skipped</i>'}</span><em class="mono">Change</em></button></li>`;
    }).join('');
  }
  // the same brief as a WhatsApp message: on phones it is often the quicker way to ask
  const waBrief = (f) => {
    const { all, v } = qVals(f), T = f.dataset.tailored ? JSON.parse(f.dataset.tailored) : null;
    const lines = [`Hi ${S.name}, I would like a quote.`];
    if (T && T.pack) lines.push(`Package: ${T.pack}`);
    Object.entries(briefHead(f)).forEach(([k, x]) => lines.push(`${k}: ${x}`));
    Object.entries(qAnswers(f)).forEach(([k, x]) => { if (!/Where should we send/.test(k)) lines.push(`${k.replace(/\?$/, '')}: ${x}`); });
    if (v('name')) lines.push(`Name: ${v('name')}${v('business') ? `, ${v('business')}` : ''}`);
    if (v('about')) lines.push(v('about'));
    return `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  };
  // the thank-you card: the call time they picked, with one tap to put it in their own calendar
  function booked(f) {
    const { v } = qVals(f), day = f.querySelector('input[name=callDay]:checked'), t = v('callTime'), how = v('callHow');
    const when = $('[data-booked]', f), acts = $('[data-booked-acts]', f); if (!when) return;
    when.textContent = day ? `${day.value} · ${t}` : 'To be agreed';
    $('[data-booked-how]', f).textContent = `${how || 'Meeting'} · Mombasa time (EAT)`;
    if (!day || !/^\d\d:\d\d$/.test(t)) { acts.innerHTML = ''; return; }
    const [y, m, d] = day.dataset.iso.split('-').map(Number), [hh, mm] = t.split(':').map(Number);
    const a = new Date(Date.UTC(y, m - 1, d, hh - 3, mm)), b = new Date(a.getTime() + 20 * 6e4);
    const z = (x) => x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const title = `Meeting with ${S.name}, ${S.studio}`, det = `Free 20-minute meeting about your brief. ${S.name} confirms by email with the link or number. ${S.email}`;
    const g = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${z(a)}/${z(b)}&details=${encodeURIComponent(det)}&location=${encodeURIComponent(how || '')}`;
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kampo Co.//Call//EN', 'BEGIN:VEVENT', `UID:${z(a)}-${Math.random().toString(36).slice(2)}@kampo`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(a)}`, `DTEND:${z(b)}`, `SUMMARY:${title}`, `DESCRIPTION:${det}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    acts.innerHTML = `<a class="btn" href="${g}" target="_blank" rel="noopener"><span>Add to Google Calendar</span><i aria-hidden="true"></i></a><a class="btn btn--ghost" href="data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}" download="kampo-call.ics"><span>Apple or Outlook</span><i aria-hidden="true"></i></a>`;
  }
  // the top of every brief we receive: how they came in, and the full list of services in one line
  function briefHead(f) {
    const { all, one, v } = qVals(f), door = qDoor(f), list = qPicked(f), own = [v('extra'), v('custom')].filter(Boolean).length;
    const head = { 'Way in': one('door') || 'Pick and mix' };
    if (door === 'bundle' && one('bundle')) {
      head.Package = one('bundle');
      const base = JSON.parse(f.dataset.base || '[]'), add = list.filter((x) => !base.includes(x)), cut = base.filter((x) => !list.includes(x));
      head['Package changes'] = add.length || cut.length ? [add.length ? `Added: ${add.join(', ')}` : '', cut.length ? `Removed: ${cut.join(', ')}` : ''].filter(Boolean).join('. ') : 'None, as it comes';
    }
    const extra = [v('bundleAdd'), door !== 'custom' && f.querySelector('input[name=wantCustom]:checked') ? 'a custom build (see below)' : ''].filter(Boolean);
    head['All services'] = door === 'custom' ? 'Custom build (see below)' : list.concat(extra).join(', ') || 'Not sure yet';
    return head;
  }
  async function qSend(box) {
    const S = window.SITE, f = $('[data-quiz]', box), { all, v } = qVals(f), msg = qMsg(box), send = $('[data-quiz-send]', box);
    if (!qCheck(box)) return;
    const T = f.dataset.tailored ? JSON.parse(f.dataset.tailored) : null;
    const answers = { ...briefHead(f), ...qAnswers(f) };
    const done = () => {
      f.querySelectorAll('[data-fill]').forEach((el) => { el.textContent = el.dataset.fill === 'name' ? (v('name').split(' ')[0] || 'friend') + '.' : v('email'); });
      f.querySelectorAll('.qx').forEach((q) => { q.hidden = !q.classList.contains('qx--done'); });
      booked(f);
      $('.flow__nav', box).hidden = true; $('.flow__count', box).textContent = 'Sent'; $$('.flow__steps li', box).forEach((li) => { li.classList.remove('is-now'); li.classList.add('is-done'); });
      gsap.to($('.flow__bar i', box), { scaleX: 1, duration: 0.6 });
      if (!reduce) gsap.fromTo($('.qx--done', box).children, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.08 });
    };
    const body = Object.entries(answers).map(([k, x]) => `${k}\n${x}\n`).join('\n');
    if (!S.web3formsKey) {
      // no form service yet: hand the brief to the visitor's email app, addressed to the studio
      location.href = `mailto:${S.email}?subject=${encodeURIComponent('Project brief · ' + (v('business') || v('name')))}&body=${encodeURIComponent(`Hi ${S.name},\n\n${body}`)}`;
      return done();
    }
    msg.textContent = 'Sending…'; send.classList.add('is-loading'); send.disabled = true;
    try {
      const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: S.web3formsKey, subject: `New brief + meeting request · ${v('name')} · ${v('callDay') ? `${v('callDay')} ${v('callTime')}` : 'time to agree'}`, from_name: v('business') ? `${v('name')} (${v('business')})` : v('name'), replyto: v('email'), email: v('email'), ...answers }) });
      const j = await r.json();
      if (!j.success) throw new Error(j.message);
      done();
    } catch (err) { msg.innerHTML = `That didn’t send. <a href="mailto:${S.email}?subject=${encodeURIComponent('Project brief · ' + v('business'))}&body=${encodeURIComponent(body)}">Send it by email instead</a>.`; }
    finally { send.classList.remove('is-loading'); send.disabled = false; }
  }
  document.addEventListener('submit', (e) => {
    const start = e.target.closest('[data-quiz-start]'); if (!start) return;
    e.preventDefault();
    const bx = boxOf(start.closest('[data-brief]')); bx.dataset.tailored = '0'; delete $('[data-quiz]', bx).dataset.tailored;
    qOpen(bx);
  });
  document.addEventListener('click', (e) => {
    const box = e.target.closest('[data-quizx]'); if (!box) return;
    const i = +box.dataset.i || 0;
    if (e.target.closest('[data-quiz-close]')) return qClose(box);
    if (e.target.closest('[data-quiz-next]')) { if (qCheck(box)) qGo(box, i + 1); return; }
    if (e.target.closest('[data-quiz-back]')) return qGo(box, i - 1, -1);
    if (e.target.closest('[data-quiz-send]')) return qSend(box);
    if (e.target.closest('[data-quiz-sum]')) { if (qCheck(box)) qGo(box, i + 1); return; }
    const sg = e.target.closest('[data-sum-go]'); if (sg) { box.dataset.ret = '1'; return qGo(box, +sg.dataset.sumGo, -1); }
    if (e.target.closest('[data-quiz-wa]')) return window.open(waBrief($('[data-quiz]', box)), '_blank', 'noopener');
    const wb = e.target.closest('[data-wa-brief]'); if (wb) { wb.href = waBrief($('[data-quiz]', box)); return; }
    // single-choice screens move on by themselves, unless the screen has more to fill in
    const pick = e.target.closest('.qx input[type=radio], .qx input[type=checkbox]');
    if (!pick) return;
    const q = pick.closest('.qx'), grp = pick.closest('.qsub') || q, own = grp.querySelector('.qx__line--oth'), oth = grp.querySelector(`input[name="${pick.name}"][value="__other"]`);
    if (own && oth) { const was = own.hidden; own.hidden = !oth.checked; if (oth.checked && was) { setTimeout(() => $('input', own).focus({ preventScroll: false }), 30); if (!reduce) gsap.fromTo(own, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }); } }
    if (pick.type === 'radio' && pick.value !== '__other' && !q.querySelector('.qx__line--f, .slots, .qsub')) setTimeout(() => { if (qCheck(box)) qGo(box, i + 1); }, 360);
  });
  document.addEventListener('keydown', (e) => {
    const box = e.target.closest && e.target.closest('[data-quizx]'); if (!box || box.hidden) return;
    if (e.key === 'Escape') { e.stopPropagation(); return qClose(box); }
    const typing = e.target.matches && e.target.matches('input[type=text], input[type=email], input[type=tel]');
    if (e.key === 'Enter' && e.shiftKey && e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
      e.preventDefault();
      if (typing && e.target.closest('.qx__fields')) { const ins = $$('input', e.target.closest('.qx__fields')), k = ins.indexOf(e.target); if (k < ins.length - 1) return ins[k + 1].focus(); }
      if ($('.flow__nav', box).hidden) return;
      const i = +box.dataset.i || 0;
      if (!$('[data-quiz-send]', box).hidden) qSend(box); else if (qCheck(box)) qGo(box, i + 1);
      return;
    }
    if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && /^[a-p]$/i.test(e.key)) {
      const q = $$('.qx', box).find((x) => !x.hidden), c = q && !q.querySelector('.slots, .qx__menu, .qsub') && $$('.chip input', q)['ABCDEFGHIJKLMNOP'.indexOf(e.key.toUpperCase())];
      if (c) { e.preventDefault(); c.click(); }
    }
  }, true);
  // "Start a project", anywhere on the site: straight to the brief, with the service already ticked when the
  // button knows it. From a page without a brief it opens Contact and lands on the brief there.
  let pendingCta = null;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-cta]'); if (!a) return;
    e.preventDefault(); e.stopPropagation();
    // every ask leads to the six boxes on Services; a button that knows the service opens that box
    const need = (a.dataset.need || '').split(',').filter(Boolean);
    const land = (instant) => {
      if (!$('#brief', page)) return;
      const g = need.length && S.offer.pillars.find((p) => need.includes(p.name));
      if (g) setTimeout(() => build('mix', [g.name]), instant ? 600 : 300);
      else {
        // no service named: land where the services begin, and tell them to scroll
        const st = $('#street', page);
        lenis.scrollTo(st || 0, { offset: st ? -56 : 0, immediate: instant, duration: 1.2, force: true });
        const cue = st && $('.street__cue', st);
        if (cue) { cue.classList.remove('is-call'); void cue.offsetWidth; cue.classList.add('is-call'); }
      }
    };
    const run = () => { if (current === '/services') land(false); else { pendingCta = () => land(true); location.hash = '#/services'; } };
    menuOpen ? closeMenu(run) : run();
  }, true);
  // ---------- Services: choose a package (or start empty), tick or untick, get a price ----------
  // One panel does it all: what the package holds (tap to remove), a few popular extras (tap to add) and,
  // folded away, every service. "Get my free price" carries the exact list into the brief.
  const cart = { set: new Set(), pack: null };
  let pendingGrp = null;
  const packOf = (k) => (S.offer.packages || []).find((x) => x.key === k);
  const cho = () => $('body > .cho') || $('[data-cho-box]', page);
  function cartPaint() {
    const n = cart.set.size, pk = cart.pack && packOf(cart.pack);
    $$('.bchip').forEach((b) => b.setAttribute('aria-pressed', cart.set.has(b.dataset.svc)));
    $$('[data-grp-n]', page).forEach((el) => {
      const p = S.offer.pillars.find((x) => x.key === el.dataset.grpN), k = p.services.filter((x) => cart.set.has(x[0])).length;
      el.textContent = k ? `${k} picked` : `${p.services.length} services`; el.closest('.six__tile').classList.toggle('is-picked', !!k);
    });
    const box = cho(); if (box) $('[data-cho-count]', box).textContent = `${n} service${n === 1 ? '' : 's'}`;
    const tray = $('[data-tray]', page); if (!tray) return;
    const same = pk && pk.services.length === n && pk.services.every((x) => cart.set.has(x));
    $('.tray__count', tray).innerHTML = `${pk ? `<small class="tray__pk">${pk.name}${same ? '' : ', changed'}</small>` : ''}${n} service${n === 1 ? '' : 's'}`;
    const show = n > 0 && !document.body.classList.contains('brief-open') && !document.body.classList.contains('cho-open');
    if (show && tray.hidden) { tray.hidden = false; if (!reduce) gsap.fromTo(tray, { yPercent: 140 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' }); }
    else if (!show && !tray.hidden) tray.hidden = true;
  }
  function doorShow(key, go = true) {
    const panel = $(`[data-panel="${key}"]`, page); if (!panel) return;
    const was = panel.hidden;
    $$('[data-panel]', page).forEach((x) => { x.hidden = x !== panel; });
    $$('[data-door]', page).forEach((d) => d.classList.toggle('is-on', d.dataset.door === key));
    lenis.resize(); ScrollTrigger.refresh();
    if (go) lenis.scrollTo(panel, { offset: -64, duration: 1.3, force: true });
    if (was && !reduce) gsap.fromTo($$('.pillars__head, .six li, .bun__list li', panel), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.04, delay: go ? 0.25 : 0 });
  }
  const svcNeed = (name) => { const pl = S.offer.pillars.find((p) => p.services.some((x) => x[0] === name)); return pl ? [pl.need || pl.name] : []; };
  const chipFor = (box, name) => { const c = $$('.cho__all .bchip', box).find((b) => b.dataset.svc === name); return c ? c.cloneNode(true) : null; };
  function choOpen(key, keep) {
    const box = cho(); if (!box) return;
    if (box.parentNode !== document.body) document.body.append(box);
    const fill = (sel, list) => { const el = $(sel, box); el.innerHTML = ''; list.forEach((t) => { const c = chipFor(box, t); if (c) el.append(c); }); };
    if (key && key.startsWith('grp:')) doorShow('mix', false);
    const gi = key && key.startsWith('grp:') ? S.offer.pillars.findIndex((p) => p.key === key.slice(4)) : -1, grp = S.offer.pillars[gi];
    $$('.cho__grp', box).forEach((g) => { g.hidden = !!grp && g.dataset.grp === grp.key; });
    if (grp) {
      // one box: its services, ticked or not; whatever was picked in other boxes stays picked
      $('[data-cho-who]', box).textContent = `0${gi + 1} of 06`;
      $('[data-cho-name]', box).textContent = grp.name;
      $('[data-cho-lab]', box).innerHTML = `${esc(grp.line)} <span class="mono">tap to pick</span>`;
      $('[data-cho-sum]', box).textContent = 'The other five';
      fill('[data-cho-in]', grp.services.map((x) => x[0]));
      $('[data-cho-mine]', box).hidden = false; $('[data-cho-extra]', box).hidden = true; $('[data-cho-all]', box).open = false;
    } else {
      const pk = key ? packOf(key) : null;
      if (!keep) { cart.pack = pk ? pk.key : cart.pack; if (pk) pk.services.forEach((x) => cart.set.add(x)); } // a bundle adds to what is already picked
      const p2 = cart.pack && packOf(cart.pack);
      $('[data-cho-who]', box).textContent = p2 ? p2.who : 'Your list';
      $('[data-cho-name]', box).textContent = p2 ? p2.name : 'What you picked';
      $('[data-cho-lab]', box).innerHTML = p2 ? 'In your bundle <span class="mono">tap to remove</span>' : 'Your picks <span class="mono">tap to remove</span>';
      $('[data-cho-sum]', box).textContent = p2 ? 'Everything else' : 'All six boxes';
      fill('[data-cho-in]', p2 ? p2.services : [...cart.set]);
      fill('[data-cho-add]', p2 ? (p2.extras || []).filter((t) => !p2.services.includes(t)) : []);
      $('[data-cho-mine]', box).hidden = !p2 && !cart.set.size; $('[data-cho-extra]', box).hidden = !p2; $('[data-cho-all]', box).open = !p2 && !cart.set.size;
    }
    cartPaint();
    box.hidden = false; document.body.classList.add('cho-open'); lenis.stop(); cartPaint();
    $('.cho__body', box).scrollTop = 0;
    if (!reduce) {
      const wide = innerWidth > 760;
      gsap.fromTo($('.cho__back', box), { opacity: 0 }, { opacity: 1, duration: 0.4 });
      gsap.fromTo($('.cho__panel', box), wide ? { xPercent: 100, yPercent: 0 } : { yPercent: 100, xPercent: 0 }, { xPercent: 0, yPercent: 0, duration: 0.7, ease: 'expo.out' });
      gsap.fromTo($$('[data-cho-in] .bchip, [data-cho-add] .bchip', box), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out', stagger: 0.03, delay: 0.2 });
    }
    setTimeout(() => $('.cho__x', box).focus({ preventScroll: true }), 60);
  }
  function choClose(after) {
    const box = cho(); if (!box || box.hidden) return after && after();
    const done = () => { box.hidden = true; document.body.classList.remove('cho-open'); lenis.start(); cartPaint(); after && after(); };
    if (reduce) return done();
    const wide = innerWidth > 760;
    gsap.to($('.cho__back', box), { opacity: 0, duration: 0.35 });
    gsap.to($('.cho__panel', box), { ...(wide ? { xPercent: 100 } : { yPercent: 100 }), duration: 0.45, ease: 'expo.in', onComplete: done });
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('cho-open')) choClose(); });
  document.addEventListener('toggle', (e) => { if (e.target.matches && e.target.matches('.pk__more, .faq__q')) { clearTimeout(cart.t); cart.t = setTimeout(() => ScrollTrigger.refresh(), 60); } }, true);
  // Services: package tiles open in place. The panel slides in under the tapped tile's row, showing that package only.
  function pktPlace(panel, tile) {
    const grid = panel.parentNode, li = tile.closest('li'), was = panel.hidden; panel.hidden = true;
    const lis = [...grid.children].filter((x) => x !== panel), top = li.offsetTop;
    lis.filter((x) => x.offsetTop === top).pop().after(panel); panel.hidden = was;
  }
  function pktOpen(tile) {
    const grid = tile.closest('.pkt'), panel = $('.pkt__panel', grid), key = tile.dataset.pkt;
    if (!panel.hidden && panel.dataset.on === key) return pktClose(panel, tile);
    $$('[data-pkt]', grid).forEach((t) => { const on = t === tile; t.classList.toggle('is-on', on); t.setAttribute('aria-expanded', String(on)); });
    pktPlace(panel, tile); panel.dataset.on = key; panel.hidden = false;
    $$('.pk', panel).forEach((x) => { x.hidden = x.dataset.key !== key; });
    dispatchEvent(new Event('resize'));
    const art = $(`.pk[data-key="${key}"] .pkg`, panel);
    if (!reduce) gsap.fromTo([$('.pk__side', art), $('.pk__body', art), $('.pk__facts', art)], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.07, clearProps: 'transform,opacity' });
    requestAnimationFrame(() => lenis.scrollTo(panel, { offset: -150, duration: 1.1 }));
  }
  function pktClose(panel, tile) {
    if (!panel || panel.hidden) return;
    panel.hidden = true; delete panel.dataset.on;
    $$('[data-pkt]', panel.parentNode).forEach((t) => { t.classList.remove('is-on'); t.setAttribute('aria-expanded', 'false'); });
    dispatchEvent(new Event('resize'));
    if (tile) requestAnimationFrame(() => lenis.scrollTo(tile, { offset: -110, duration: 0.9 }));
  }
  let pktW = innerWidth;
  addEventListener('resize', () => { if (innerWidth === pktW) return; pktW = innerWidth; const panel = $('.pkt__panel:not([hidden])', page), t = panel && $('[data-pkt].is-on', panel.parentNode); if (t) pktPlace(panel, t); });

  document.addEventListener('click', (e) => {
    const chip = e.target.closest('.bchip');
    if (chip) {
      const k = chip.dataset.svc; cart.set.has(k) ? cart.set.delete(k) : cart.set.add(k);
      if (!reduce) gsap.fromTo(chip, { scale: 0.96 }, { scale: 1, duration: 0.5, ease: 'expo.out' });
      return cartPaint();
    }
    const door = e.target.closest('[data-door]'); if (door) return doorShow(door.dataset.door);
    const open = e.target.closest('[data-cho]');
    if (open) { e.preventDefault(); return choOpen(open.dataset.cho); }
    if (e.target.closest('[data-cho-reopen]')) return choOpen(cart.pack, true);
    const bd = e.target.closest('[data-build]'); if (bd) { e.preventDefault(); return build(bd.dataset.build); }
    const og = e.target.closest('[data-own-go]');
    if (og) { e.preventDefault(); const picks = $$('.own__list input:checked', og.closest('.own')).map((x) => x.value); return build('mix', [], '', picks.length ? picks : null); }
    const pt = e.target.closest('[data-pkt]'); if (pt) { e.preventDefault(); return pktOpen(pt); }
    const px = e.target.closest('[data-pkt-x]'); if (px) { e.preventDefault(); const t = $('.pkt [data-pkt].is-on', page); return pktClose(px.closest('.pkt__panel'), t); }
    const pkb = e.target.closest('[data-pack]');
    if (pkb) { e.preventDefault(); const card = pkb.closest('.pkg'), picks = card ? $$('.pkg__opts input:checked', card).map((x) => x.value) : null; return build('bundle', [], pkb.dataset.pack, picks); }
    const go = e.target.closest('[data-grp-go]');
    if (go) {
      e.preventDefault();
      const p = S.offer.pillars.find((x) => x.key === go.dataset.grpGo);
      if (!build('mix', [p.name])) { pendingGrp = p.name; location.hash = '#/services'; }
      return;
    }
    if (e.target.closest('[data-cho-close]')) return choClose();
    const twa = e.target.closest('[data-tray-wa]');
    if (twa) { const pk = cart.pack && packOf(cart.pack); twa.href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(`Hi ${S.name}, I would like a quote.\n${pk ? `Package: ${pk.name}\n` : ''}Services: ${[...cart.set].join(', ') || 'not sure yet'}`)}`; return; }
    const own = e.target.closest('[data-custom]');
    if (own || e.target.closest('[data-tray-go]')) {
      const sec = $('#brief', page); if (!sec) return;
      choClose(() => {
        const needs = new Set([...cart.set].flatMap(svcNeed)); if (own) needs.add('Custom build');
        $$('input[name=pick]', sec).forEach((x) => { x.checked = needs.has(x.value); });
        const pk = cart.pack && packOf(cart.pack);
        $('[data-quiz]', sec).dataset.tailored = JSON.stringify({ pack: pk ? pk.name : '', list: [...cart.set] });
        $('[data-tray]', page).hidden = true;
        pickNote(sec);
        qOpen(boxOf(sec));
      });
      return;
    }
    const jump = e.target.closest('[data-jump]');
    if (jump) { e.preventDefault(); const t = $('#' + jump.dataset.jump, page); if (t) lenis.scrollTo(t, { offset: -70, duration: 1.4 }); }
  });

  // fields say they are right as soon as you leave them, and stop complaining the moment they are fixed
  const fieldOk = (el) => el.name === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()) : el.name === 'phone' ? !el.value.trim() || /^(\+?254|0)?\s*[17]\d{2}\s*\d{3}\s*\d{3}$/.test(el.value.replace(/[\s-]/g, '')) : !!el.value.trim();
  document.addEventListener('focusout', (e) => {
    const el = e.target; if (!el.closest || !el.closest('[data-quiz] .field') || !['name', 'email', 'phone'].includes(el.name)) return;
    const box = el.closest('.field'), ok = fieldOk(el), empty = !el.value.trim();
    box.classList.toggle('is-ok', ok && !empty); box.classList.toggle('is-bad', !ok && !empty);
  });
  document.addEventListener('input', (e) => { const box = e.target.closest && e.target.closest('[data-quiz] .field.is-bad'); if (box && fieldOk(e.target)) { box.classList.remove('is-bad'); box.classList.add('is-ok'); } });
  // the start button says what has been picked so far
  const pickNote = (sec) => {
    const el = $('.brief__picked', sec); if (!el) return;
    const names = $$('input[name=pick]:checked', sec).map((x) => x.closest('.svc__pick').querySelector('.svc__name').textContent);
    el.textContent = names.length ? `${names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names.slice(-1) : names[0]} picked.` : 'Tap what you need, or just start.';
    if (names.length && !reduce) gsap.fromTo(el, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'expo.out' });
  };
  // picking a service lights the way to the next step: the start button pulses, and while it is off screen
  // a small "Next: start my brief" pill waits at the bottom and takes you straight to it
  // the pill lives on the body so no held sheet or colophon can ever sit on top of it
  const pill = document.createElement('button');
  pill.type = 'button'; pill.className = 'gostart'; pill.hidden = true;
  pill.innerHTML = '<span class="gostart__n">1</span><span>Next: start my brief</span><i aria-hidden="true">→</i>';
  document.body.append(pill);
  const goStart = (sec) => {
    const go = sec && $('.brief__start .btn', sec);
    if (!go || sec.classList.contains('is-flow')) { pill.hidden = true; return; }
    const n = $$('input[name=pick]:checked', sec).length;
    $('.gostart__n', pill).textContent = n;
    const r = go.getBoundingClientRect(), off = r.bottom < 60 || r.top > innerHeight - 50;
    const show = n > 0 && off && !document.body.classList.contains('brief-open');
    if (show && pill.hidden) { pill.hidden = false; if (!reduce) gsap.fromTo(pill, { yPercent: 160 }, { yPercent: 0, duration: 0.6, ease: 'expo.out' }); }
    else if (!show) pill.hidden = true;
  };
  document.addEventListener('change', (e) => {
    if (e.target.name !== 'pick') return;
    const sec = e.target.closest('[data-brief]'); pickNote(sec); goStart(sec);
    const go = $('.brief__start .btn', sec); go.classList.toggle('is-ready', !!$('input[name=pick]:checked', sec));
    if (!reduce && e.target.checked) gsap.fromTo(go, { scale: 1 }, { scale: 1.07, duration: 0.22, yoyo: true, repeat: 1, ease: 'power2.inOut' });
  });
  lenis.on('scroll', () => goStart($('[data-brief]', page)));
  pill.addEventListener('click', () => {
    const sec = $('[data-brief]', page); pill.hidden = true; if (!sec) return;
    lenis.scrollTo($('.brief__head', sec), { offset: -80, duration: 1.1, onComplete: () => { const go = $('.brief__start .btn', sec); if (!reduce) gsap.fromTo(go, { scale: 1 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 3, ease: 'power2.inOut' }); go.focus({ preventScroll: true }); } });
  });
  // the page turn: a fresh sheet slides up over the screen, the page moves underneath it, and the sheet lifts away
  function turnTo(target, label, done) {
    const jump = () => { lenis.scrollTo(target, { offset: 0, immediate: true, force: true }); ScrollTrigger.update(); };
    if (reduce) { jump(); return done && done(); }
    let sh = $('.pgturn'); if (!sh) { sh = document.createElement('div'); sh.className = 'pgturn'; sh.setAttribute('aria-hidden', 'true'); sh.innerHTML = '<span class="pgturn__rule"></span><p class="pgturn__label"></p><span class="pgturn__rule"></span>'; document.body.append(sh); }
    $('.pgturn__label', sh).textContent = label;
    lenis.stop();
    gsap.timeline({ onComplete: () => { sh.style.visibility = 'hidden'; lenis.start(); if (done) done(); } })
      .set(sh, { visibility: 'visible', clipPath: 'inset(100% 0 0 0)' })
      .set($('.pgturn__label', sh), { yPercent: 60, opacity: 0 })
      .to(sh, { clipPath: 'inset(0% 0 0 0)', duration: 0.65, ease: 'expo.inOut' })
      .to($('.pgturn__label', sh), { yPercent: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }, '-=0.25')
      .add(() => { lenis.start(); jump(); lenis.stop(); })
      .to($('.pgturn__label', sh), { yPercent: -60, opacity: 0, duration: 0.45, ease: 'expo.in' }, '+=0.25')
      .to(sh, { clipPath: 'inset(0 0 100% 0)', duration: 0.75, ease: 'expo.inOut' }, '-=0.15');
  }
  // links that jump to the brief can pre-pick services (comma list) or an industry
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-scroll-to]'); if (!a) return;
    const target = $('#' + a.dataset.scrollTo, page); if (!target) return;
    e.preventDefault();
    const box = boxOf(target);
    if (box && !box.hidden) qClose(box);
    if (a.dataset.need) { const want = a.dataset.need.split(','); $$('input[name=pick]', target).forEach((x) => { if (want.includes(x.value)) x.checked = true; }); }
    if (a.dataset.industry) { const r = $$('input[name=industry]', target).find((x) => x.value === a.dataset.industry); if (r) r.checked = true; }
    pickNote(target);
    const land = () => { const go = $('[data-quiz-start] button', target); if (go) go.focus({ preventScroll: true }); };
    // a short hop glides; a long one (past the scroll story and its sheets) turns the page instead of racing through it
    const far = Math.abs(target.getBoundingClientRect().top) > innerHeight * 1.6;
    if (!far) return lenis.scrollTo(target, { offset: -70, duration: 1.4, onComplete: land });
    turnTo(target, a.dataset.label || target.getAttribute('aria-label') || '', land);
  });
  // sectors: pick one, see what we would build for it
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sector]'); if (!b) return;
    const wrap = b.closest('[data-sectors]'), i = b.dataset.sector;
    wrap.querySelectorAll('[data-sector]').forEach((x) => { const on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
    wrap.querySelectorAll('[data-sector-card]').forEach((c) => { const on = c.dataset.sectorCard === i; c.hidden = !on; c.classList.toggle('is-on', on);
      if (on && !reduce) gsap.fromTo(c.children, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: 'expo.out', stagger: 0.06 }); });
  });

  // the CV: rows open to their points; a lens opens the rows that have something for it and dims the rest
  document.addEventListener('click', (e) => {
    const top = e.target.closest('.job__top');
    if (top) { const li = top.closest('.job'), on = !li.classList.contains('is-open'); li.classList.toggle('is-open', on); top.setAttribute('aria-expanded', on); setTimeout(() => ScrollTrigger.refresh(), 650); return; }
    const pick = e.target.closest('[data-lens-pick]');
    if (!pick) return;
    const cv = pick.closest('[data-cv]'), k = pick.dataset.lensPick;
    pick.closest('.cvx__lens').classList.remove('is-hint');
    cv.dataset.lensOn = k;
    $$('[data-lens-pick]', cv).forEach((b) => b.setAttribute('aria-pressed', b === pick));
    $$('.job', cv).forEach((li, i) => { const on = k === 'all' ? i === 0 : li.dataset.lens.split(' ').includes(k); li.classList.toggle('is-open', on); $('.job__top', li).setAttribute('aria-expanded', on); });
    setTimeout(() => ScrollTrigger.refresh(), 650);
  });

  /* ---------- opening messages ----------
     Every WhatsApp and email link opens with a message already written, so the visitor only has to press send.
     Links that carry their own message (a brief, a package, the free check) keep it; plain ones get the
     opening message from data.js, plus the project the visitor is reading about when they are on a case study. */
  const seenOn = () => {
    const [kind, slug] = current.split('/').filter(Boolean);
    const p = kind === 'work' && S.projects.find((x) => x.slug === slug);
    return p ? `I saw your work for ${p.title}.` : '';
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    const h = a.getAttribute('href');
    if (h.startsWith('https://wa.me/')) {
      const t = decodeURIComponent((h.split('text=')[1] || '').replace(/\+/g, ' '));
      if (t && t !== S.whatsappText) return;
      a.href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent([S.whatsappText, seenOn()].filter(Boolean).join(' '))}`;
    } else if (h.startsWith('mailto:') && !/[?&]body=/.test(h) && S.emailText) {
      const to = h.slice(7).split('?')[0], line = seenOn();
      const body = line ? S.emailText.replace('\n\n', `\n\n${line} `) : S.emailText;
      a.href = `mailto:${to}?subject=${encodeURIComponent(S.emailSubject || 'Project enquiry')}&body=${encodeURIComponent(body)}`;
    }
  }, true);

  /* ---------- floating WhatsApp button ---------- */
  (() => {
    const wa = document.createElement('a');
    wa.className = 'wa-fab'; wa.href = `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(S.whatsappText || '')}`;
    wa.target = '_blank'; wa.rel = 'noopener'; wa.setAttribute('aria-label', `Chat with ${S.name} on WhatsApp`);
    wa.innerHTML = `
      <svg class="wa-fab__ring" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="wa-c" d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0"/></defs>
        <text><textPath href="#wa-c">CHAT ON WHATSAPP ✦ ${S.studio.toUpperCase().replace(/\.$/, '')} ✦ </textPath></text></svg>
      <span class="wa-fab__disc"><svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3C8.86 3 3.02 8.83 3.02 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.74A13 13 0 0 0 16.04 29C23.2 29 29 23.17 29 16S23.2 3 16.04 3Zm0 23.8c-2.02 0-4-.54-5.72-1.57l-.41-.24-3.97 1.03 1.06-3.86-.27-.4A10.78 10.78 0 0 1 5.2 16c0-5.97 4.86-10.82 10.84-10.82 5.97 0 10.8 4.85 10.8 10.82 0 5.97-4.83 10.8-10.8 10.8Zm5.93-8.1c-.33-.16-1.93-.95-2.23-1.06-.3-.11-.52-.16-.73.17-.22.32-.84 1.05-1.03 1.27-.19.22-.38.24-.7.08-.33-.16-1.38-.51-2.62-1.62-.97-.86-1.62-1.93-1.81-2.25-.19-.33-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.33.33-.54.11-.22.05-.41-.03-.57-.08-.16-.73-1.76-1-2.41-.26-.63-.53-.55-.73-.56h-.62c-.22 0-.57.08-.87.41-.3.32-1.14 1.11-1.14 2.71s1.17 3.15 1.33 3.36c.16.22 2.3 3.5 5.56 4.91.78.34 1.39.54 1.86.69.78.25 1.5.21 2.06.13.63-.09 1.93-.79 2.2-1.55.27-.76.27-1.42.19-1.55-.08-.14-.3-.22-.62-.38Z"/></svg></span>
      <span class="wa-fab__label"><b>Chat with ${S.name}</b><i>Tell us about your project</i></span>
      <span class="wa-fab__dot" aria-hidden="true"></span>`;
    document.body.appendChild(wa);
    if (!reduce) gsap.from(wa, { scale: 0, rotate: -120, duration: 1.2, ease: 'elastic.out(1, 0.55)', delay: 1.6 });
  })();
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menuOpen && current.startsWith('/work/')) { returnTo = 'work'; location.hash = '#/'; } });
  function mount(path) {
    quiz.open = false; document.body.classList.remove('brief-open', 'cho-open');
    $$('body > .cho, body > .flow').forEach((x) => x.remove()); lenis.start(); $$('body > .gostart').forEach((x) => (x.hidden = true));
    cleanups.forEach((f) => f()); cleanups = [];
    ScrollTrigger.getAll().forEach((t) => t.kill());
    const v = view(path);
    page.innerHTML = v.html;
    lenis.scrollTo(0, { immediate: true, force: true });
    $$('.topbar__nav a').forEach((a) => a.classList.toggle('is-active', parse(a.getAttribute('href')) === '/' + (path.split('/')[1] || '')));
    GL.scan(page);
    initPage();
    // coming back from a project: land on Featured Work, not the top of the front page
    const back = returnTo && $('#' + returnTo, page); returnTo = null;
    if (back) { lenis.resize(); lenis.scrollTo(back, { immediate: true, force: true, offset: -70 }); requestAnimationFrame(() => { lenis.resize(); lenis.scrollTo(back, { immediate: true, force: true, offset: -70 }); ScrollTrigger.refresh(); }); }
    const pj = path.startsWith('/work/') && S.projects.find((x) => '/work/' + x.slug === path);
    document.title = pj ? `${pj.title} · ${S.studio}` : ({ '/services': `Services · ${S.studio}`, '/about': `About ${S.fullName || S.name} · ${S.studio}`, '/contact': `Contact · ${S.studio}, ${S.location}` }[path] || `${S.studio} · Business setup, branding, websites, marketing and systems · ${S.location}`);
    current = path;
    Turn.update();
    railMount(path);
    if (pendingGrp && $('#brief', page)) { const g = pendingGrp; pendingGrp = null; setTimeout(() => build('mix', [g]), 700); }
    if (pendingCta && current === '/services') { const f = pendingCta; pendingCta = null; requestAnimationFrame(() => requestAnimationFrame(f)); }
    return v;
  }

  // ---------- the chapter rail: a quiet "where am I" down the right edge, one mark per part of the page ----------
  // Tap a mark to go there. Positions come from the page's normal flow, so the sticky sheets don't confuse it.
  const CH = {
    '/': [],
    '/services': [['.journey', 'Services'], ...S.offer.pillars.map((p) => ['#cap-' + p.key, p.label]), ['.own-sec', 'Custom package'], ['.jr', 'The process'], ['.why', 'Why us'], ['.faq', 'Questions']],
    '/contact': [['.ct-pen', 'Hello'], ['.ct-ways', 'Ways in'], ['.ct-how', 'What happens next'], ['.faq', 'Questions'], ['#brief', 'Your brief']],
    '/about': [['.ab-front', 'The profile'], ['.ab-record', 'Qualifications']],
  };
  const rail = document.createElement('nav'); rail.className = 'rail'; rail.setAttribute('aria-label', 'Parts of this page'); rail.hidden = true; document.body.append(rail);
  const bar = document.createElement('div'); bar.className = 'rail__bar'; bar.setAttribute('aria-hidden', 'true'); bar.hidden = true; document.body.append(bar);
  let railTops = [], railOn = -1;
  function railMeasure() {
    const kids = [...page.children]; let y = 0; const top = new Map();
    kids.forEach((k) => { top.set(k, y); y += k.offsetHeight; });
    railTops = $$('.rail__mark', rail).map((m) => { const el = m._el; const k = kids.find((x) => x === el || x.contains(el)); return k ? top.get(k) + (k === el ? 0 : el.offsetTop) : 0; });
  }
  function railPaint(y) {
    if (rail.hidden) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    bar.style.transform = `scaleX(${Math.min(1, y / max)})`;
    let i = 0; railTops.forEach((t, k) => { if (y + innerHeight * 0.45 >= t) i = k; });
    if (i === railOn) return; const first = railOn < 0; railOn = i;
    if (!first) { rail.classList.add('is-flash'); clearTimeout(rail._t); rail._t = setTimeout(() => rail.classList.remove('is-flash'), 1400); }
    $$('.rail__mark', rail).forEach((m, k) => { m.classList.toggle('is-on', k === i); m.classList.toggle('is-past', k < i); if (k === i) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current'); });
  }
  function railMount(path) {
    const list = (CH[path] || []).map(([sel, label]) => [$(sel, page), label]).filter(([el]) => el);
    rail.innerHTML = list.map(([, label], k) => `<button type="button" class="rail__mark"><span class="rail__no mono">0${k + 1}</span><span class="rail__label">${esc(label)}</span><i aria-hidden="true"></i></button>`).join('');
    $$('.rail__mark', rail).forEach((m, k) => { m._el = list[k][0]; });
    rail.hidden = bar.hidden = list.length < 3; railOn = -1;
    requestAnimationFrame(() => { railMeasure(); railPaint(lenis.scroll || scrollY); });
  }
  rail.addEventListener('click', (e) => {
    const m = e.target.closest('.rail__mark'); if (!m) return;
    railMeasure(); const k = $$('.rail__mark', rail).indexOf(m);
    lenis.scrollTo(railTops[k] + (k ? 2 : 0), { duration: 1.6, force: true });
  });
  lenis.on('scroll', ({ scroll }) => railPaint(scroll));
  ScrollTrigger.addEventListener('refresh', () => { railMeasure(); railOn = -1; railPaint(lenis.scroll || scrollY); });

  function intro() {
    if (reduce) return;
    gsap.fromTo($$('.line > span', page), { yPercent: 110 }, { yPercent: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out', delay: 0.1 });
    gsap.fromTo($$('.masthead__row, .byline, .crosshead', page).slice(0, 4), { opacity: 0 }, { opacity: 1, duration: 0.8, stagger: 0.05 });
  }

  // first load: the paper flies up from below and spins into place,
  // like the newspaper in an old film (after niccolomiranda.com)
  function pressIntro() {
    if (reduce) return;
    const root = document.documentElement;
    root.classList.add('is-intro');
    lenis.stop();
    GL.held = true;
    const bars = [$('.topbar'), $('#bottombar')];
    const tl = gsap.timeline({
      onComplete() {
        root.classList.remove('is-intro');
        gsap.set(page, { clearProps: 'transform' });
        GL.held = false;
        lenis.start();
        gsap.fromTo(bars[0], { yPercent: -100 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' });
        gsap.fromTo(bars[1], { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', onComplete: () => gsap.set(bars, { clearProps: 'transform' }) });
        gsap.fromTo(['#gl', '#edges'], { opacity: 0 }, { opacity: 1, duration: 0.6, clearProps: 'opacity' });
      },
    });
    // park the sheet below the screen, then start once fonts and images are in (or after 2.5s at most)
    gsap.set(page, { transformOrigin: '50% 50vh', y: '100vh', scale: 0.6, rotate: 0 });
    tl.pause();
    const loaded = new Promise((res) => (document.readyState === 'complete' ? res() : window.addEventListener('load', res, { once: true })));
    Promise.race([Promise.all([loaded, document.fonts ? document.fonts.ready : 0]), new Promise((r) => setTimeout(r, 2500))]).then(() => tl.play());
    tl.to(page, { y: '3vh', duration: 1, ease: 'power3.out', delay: 0.2 })
      .to(page, { y: 0, rotate: 360, scale: 1, duration: 0.9, ease: 'power3.inOut' });
  }

  // a route asked for mid-animation is shown as soon as the animation ends, never dropped
  const catchUp = () => setTimeout(() => { const p = parse(location.hash); if (!busy && p !== current) go(p); }, 0);
  function go(path) {
    if (busy) return;
    if (first) { first = false; mount(path); pressIntro(); return; }
    busy = true;
    const v = view(path);
    // shared-element flip from a book on the shelf
    if (flip) return flipTo(path);
    Tear.reseed();
    sheetTitle.textContent = v.name;
    sheet.style.visibility = 'visible';
    gsap.fromTo(sheetTitle, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, delay: 0.35, ease: 'expo.out' });
    Tear.animate(sheet, 'bottom', 0, 1, {
      duration: 0.8, ease: 'power4.inOut',
      onComplete: () => {
        mount(path);
        Tear.reseed();
        gsap.to(sheetTitle, { yPercent: -40, opacity: 0, duration: 0.4 });
        Tear.animate(sheet, 'top', 1, 0, {
          duration: 0.9, ease: 'power4.inOut', delay: 0.15,
          onComplete: () => { sheet.style.visibility = 'hidden'; busy = false; catchUp(); },
        });
        intro();
      },
    });
  }

  // the cover zooms out of the book into the project's hero image
  function flipTo(path) {
    const { book, cover } = flip; flip = null;
    const r = book.getBoundingClientRect();
    const ghost = document.createElement('div');
    ghost.className = 'media';
    ghost.style.cssText = `position:fixed;z-index:70;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
    ghost.innerHTML = `<img src="${cover}" alt="">`;
    document.body.appendChild(ghost);
    const tl = gsap.timeline();
    tl.to(book, { y: -60, rotate: -4, duration: 0.35, ease: 'power2.out' })
      .to(page, { opacity: 0, duration: 0.35 }, '<0.1')
      .add(() => {
        mount(path);
        gsap.set(page, { opacity: 1 });
        const hero = $('#project-hero');
        gsap.set(hero, { opacity: 0 });
        const h = hero.getBoundingClientRect();
        gsap.to(ghost, {
          left: h.left, top: h.top, width: h.width, height: h.height, duration: 1.1, ease: 'expo.inOut',
          onComplete: () => {
            gsap.set(hero, { opacity: 1 });
            gsap.to(ghost, { opacity: 0, duration: 0.3, delay: 0.1, onComplete: () => ghost.remove() });
            busy = false; catchUp();
          },
        });
        gsap.from($$('.project-head, .project-body', page), { opacity: 0, y: 40, duration: 1, delay: 0.7, stagger: 0.1, ease: 'expo.out' });
        intro();
      });
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#/"]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    if (a.dataset.dragged === '1') return;
    const href = a.getAttribute('href');
    const book = a.classList.contains('book') ? a : null;
    if (book) flip = { book, cover: S.projects.find((p) => p.slug === book.dataset.slug).cover };
    const nav = () => { if (location.hash === href) go(parse(href)); else location.hash = href; };
    menuOpen ? closeMenu(nav) : nav();
  });
  window.addEventListener('hashchange', () => {
    const path = parse(location.hash);
    if (silentHash === path) { silentHash = null; return; } // already shown by a page turn
    go(path);
  });

  /* ---------- page turn ----------
     At the bottom of every page a dog-eared corner appears. Click it, drag it,
     or keep scrolling and the current page is lifted off as a paper leaf and
     flipped over to reveal the next page underneath. */
  const Turn = (() => {
    const layer = $('#turn'), shadow = $('#turn-shadow'), ear = $('#dogear'), earNext = $('#dogear-next');
    const ORDER = ['/', '/services', '/about', '/contact'];
    let leaf = null, prev = null, settling = false, state = { p: 0 }, dragging = false, startX = 0, overscroll = 0, overTimer;

    function nextOf(path) {
      const parts = path.split('/').filter(Boolean);
      if (parts[0] === 'work' && parts[1]) {
        const i = S.projects.findIndex((p) => p.slug === parts[1]);
        return i < 0 ? '/' : '/work/' + S.projects[(i + 1) % S.projects.length].slug;
      }
      const i = ORDER.indexOf(path);
      return ORDER[(i + 1) % ORDER.length];
    }
    // the page's name only (rendering the whole next page just to read its name ran on every scroll)
    const nameOf = (path) => {
      const parts = path.split('/').filter(Boolean);
      if (parts[0] === 'work' && parts[1]) { const p = S.projects.find((x) => x.slug === parts[1]); return p ? p.title : '404'; }
      return { services: 'Services', about: 'About', contact: 'Contact' }[parts[0]] || (parts.length && parts[0] !== 'work' ? '404' : 'Index');
    };

    // the page height is measured once per layout change, not on every scroll (reading it there forced a layout)
    let maxCache = -1;
    const remeasure = () => { maxCache = -1; };
    ScrollTrigger.addEventListener('refresh', remeasure);
    if (window.ResizeObserver) new ResizeObserver(remeasure).observe(page);
    function atBottom() {
      if (maxCache < 0) maxCache = document.documentElement.scrollHeight - window.innerHeight;
      return maxCache <= 4 || window.scrollY >= maxCache - Math.max(80, window.innerHeight * 0.06);
    }
    function update() {
      const label = nameOf(nextOf(current)) + ' →';
      if (earNext.textContent !== label) earNext.textContent = label;
      const on = atBottom() && !busy && !leaf;
      ear.classList.toggle('is-on', on); document.body.classList.toggle('at-end', on);
    }

    // snapshot only what is on screen as a leaf: each visible block is copied and pinned where it sits right now,
    // so the leaf stays light (no full-page clone) and held spreads keep their place and their shade
    function snapshot() {
      const snap = document.createElement('div'); snap.className = 'leaf__snap';
      const blocks = $$(':scope > *, :scope > .works > *', page).filter((el) => !el.classList.contains('works'));
      blocks.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (!r.height || r.bottom < 0 || r.top > innerHeight) return;
        const c = el.cloneNode(true);
        c.removeAttribute('id'); c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
        c.querySelectorAll('[data-gl]').forEach((n) => n.removeAttribute('data-gl'));
        c.style.position = 'absolute'; c.style.left = r.left + 'px'; c.style.top = r.top + 'px'; c.style.width = r.width + 'px'; c.style.height = r.height + 'px'; c.style.margin = '0';
        snap.append(c);
      });
      return snap;
    }
    function lift() {
      const scrollY = window.scrollY;
      const folio = String((ORDER.indexOf(current) + 1) || 1).padStart(2, '0');
      leaf = document.createElement('div');
      leaf.className = 'leaf';
      const front = document.createElement('div'); front.className = 'leaf__front';
      const snap = snapshot();
      const light = document.createElement('div'); light.className = 'leaf__light';
      front.append(snap, light);
      const back = document.createElement('div'); back.className = 'leaf__back';
      back.dataset.folio = `p.${folio} — ${S.studio}`;
      const ghost = snap.cloneNode(true); ghost.classList.add('leaf__ghost'); // show-through ink, mirrored
      back.appendChild(ghost);
      leaf.append(front, back);
      layer.appendChild(leaf);
      layer.classList.add('is-on');
      prev = { path: current, scrollY };
      ear.classList.remove('is-on'); document.body.classList.remove('at-end'); lenis.stop();
      Object.assign(hush, { on: true, last: performance.now(), prev: 0, until: Infinity });
      // the next page is printed underneath while the leaf still lies flat
      busy = true;
      mount(nextOf(current));
      render(0);
    }

    function render(p) {
      state.p = p;
      if (!leaf) return;
      // swing the leaf around its spine, lifting off the desk mid-turn, with the light raking across it
      const up = Math.sin(p * Math.PI);
      leaf.style.transform = `translateZ(${up * 40}px) rotateY(${p * 180}deg) rotateX(${up * 2.5}deg)`;
      leaf.querySelector('.leaf__light').style.opacity = Math.min(1, p * 1.8);
      leaf.style.setProperty('--curl', up.toFixed(3));
      shadow.style.opacity = (1 - p) * Math.min(1, p * 5);
    }

    function finish(commit) {
      const target = commit ? 1 : 0;
      if (settling) return; settling = true; clearTimeout(overTimer);
      gsap.killTweensOf(state);
      gsap.to(state, {
        p: target, duration: commit ? 0.5 + (1 - state.p) * 0.85 : 0.55, ease: commit ? 'power2.inOut' : 'expo.out',
        onUpdate: () => render(state.p),
        onComplete: () => {
          if (commit) {
            silentHash = current;
            location.hash = '#' + current;
            intro();
          } else {
            mount(prev.path);
            lenis.scrollTo(prev.scrollY, { immediate: true, force: true });
          }
          leaf.remove(); leaf = null; layer.classList.remove('is-on'); shadow.style.opacity = 0;
          busy = false; settling = false; overscroll = 0; hush.until = performance.now(); if (!commit) hush.on = false; lenis.start(); update(); catchUp();
        },
      });
    }

    // lift first, let the next page settle underneath for two frames, then turn
    function turn() { if (busy || leaf) return; if (menuOpen) return; lift(); requestAnimationFrame(() => requestAnimationFrame(() => finish(true))); }

    // click / keyboard
    ear.addEventListener('click', (e) => { if (ear.dataset.dragged === '1') return; turn(); });
    // drag the corner across the page
    ear.addEventListener('pointerdown', (e) => {
      if (busy || leaf) return;
      dragging = true; startX = e.clientX; ear.dataset.dragged = '0';
      ear.setPointerCapture(e.pointerId);
    });
    ear.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const dx = startX - e.clientX;
      if (!leaf && dx > 8) { lift(); ear.dataset.dragged = '1'; }
      if (leaf) render(Math.max(0, Math.min(1, dx / (window.innerWidth * 0.85))));
    });
    const release = () => {
      if (!dragging) return; dragging = false;
      if (leaf) finish(state.p > 0.28);
      setTimeout(() => (ear.dataset.dragged = '0'), 50);
    };
    ear.addEventListener('pointerup', release);
    ear.addEventListener('pointercancel', release);

    // Turning by scroll has to be meant. Momentum that carries you to the end of a page never turns it:
    // you arrive, the corner lifts a little to show it can turn, and only a fresh scroll after a short pause
    // peels it further. Lift your hand early and it falls flat again.
    let armed = false, lastWheel = 0;
    // about half a screen of deliberate scroll: one easy trackpad swipe or a few mouse-wheel notches
    const need = () => Math.max(300, Math.min(460, innerHeight * 0.45));
    window.addEventListener('wheel', (e) => {
      const now = performance.now(), gap = now - lastWheel; lastWheel = now;
      if (busy || leaf || menuOpen || !atBottom() || e.deltaY <= 0) { overscroll = 0; armed = false; return; }
      if (!armed) { if (gap < 320) return; armed = true; overscroll = 0; }
      overscroll += Math.min(e.deltaY, 120);
      const k = Math.min(1, overscroll / need());
      gsap.to(ear, { '--fold': `${64 + k * 150}px`, duration: 0.3, ease: 'power3.out' });
      ear.classList.toggle('is-peel', k > 0.05);
      clearTimeout(overTimer);
      if (k >= 1) { overscroll = 0; armed = false; ear.classList.remove('is-peel'); gsap.set(ear, { '--fold': '64px' }); turn(); return; }
      overTimer = setTimeout(() => { overscroll = 0; armed = false; ear.classList.remove('is-peel'); gsap.to(ear, { '--fold': '64px', duration: 0.6, ease: 'expo.out' }); }, 450);
    }, { passive: true });

    lenis.on('scroll', update);
    window.addEventListener('resize', () => { remeasure(); update(); });
    return { update: () => { remeasure(); update(); }, turn };
  })();

  /* ---------- per-page behaviour ---------- */
  // The scroll journey: one scrubbed cartoon. Time units are stretches of scroll: 0–2 brand, 2–4 footprint, 4–6 system.
  function journey() {
    const el = $('.journey', page), J = (s) => $$(s, el), O = { svgOrigin: '0 0' };
    const caps = J('.journey__cap');
    J('.jy__draw').forEach((p) => { const n = Math.ceil(p.getTotalLength ? p.getTotalLength() : 1000); p.style.strokeDasharray = n; p.style.strokeDashoffset = n; });
    let shown = -1;
    // one caption at a time: the old one leaves quickly, the new one waits until it is gone, so two never overlap
    const showCap = (i) => { if (i === shown) return; const from = shown; shown = i;
      caps.forEach((c, k) => { if (k !== i) gsap.to(c, { autoAlpha: 0, y: k < i ? -24 : 24, duration: 0.18, ease: 'power2.in', overwrite: true }); });
      gsap.fromTo(caps[i], { autoAlpha: 0, y: from < i ? 24 : -24 }, { autoAlpha: 1, y: 0, duration: 0.4, delay: from < 0 ? 0 : 0.2, ease: 'power3.out', overwrite: true }); };
    if (reduce) { J('.jy__draw').forEach((p) => (p.style.strokeDashoffset = 0)); gsap.set(J('.jy__brand, .jy__foot'), { autoAlpha: 0 }); showCap(3); return () => {}; }
    const f = (s) => J('.f__' + s), c = (s) => J('.c__' + s);
    // a walk: legs scissor, arms swing, body bobs, all in time with the distance
    const walk = (who, x0, x1, t, d, arms = true) => {
      const n = Math.max(2, Math.round(d / 0.12)) | 1;
      tl.fromTo(J('.' + who), { x: x0 }, { x: x1, duration: d, ease: 'none', immediateRender: false }, t)
        .fromTo(J(`.${who}__legL`), { rotation: -24, ...O }, { rotation: 24, ...O, duration: d / n, repeat: n - 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, t)
        .fromTo(J(`.${who}__legR`), { rotation: 24, ...O }, { rotation: -24, ...O, duration: d / n, repeat: n - 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, t)
        .fromTo(J(`.${who}__bob`), { y: 0 }, { y: -7, duration: d / n / 2, repeat: n * 2 - 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, t)
        .to(J(`.${who}__legL, .${who}__legR`), { rotation: 0, ...O, duration: 0.1 }, t + d);
      if (arms) tl.fromTo(J(`.${who}__armL`), { rotation: 20, ...O }, { rotation: -20, ...O, duration: d / n, repeat: n - 1, yoyo: true, immediateRender: false }, t)
        .fromTo(J(`.${who}__armR`), { rotation: -20, ...O }, { rotation: 20, ...O, duration: d / n, repeat: n - 1, yoyo: true, immediateRender: false }, t);
    };
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: el, start: 'top top+=56', end: 'bottom bottom', scrub: 0.4 },
      onUpdate: () => { const t = tl.time(); showCap(t >= 6 ? 3 : t >= 4 ? 2 : t >= 2 ? 1 : 0); } });
    gsap.set(J('.jy__disc'), { scale: 0, ...O });
    gsap.set(J('.jy__stamp'), { y: -560, autoAlpha: 0 });
    gsap.set(J('.jy__bang, .jy__web, .jy__phone, .jy__map, .jy__screen, .jy__spec, .jy__step, .jy__stars, .jy__dot, .jy__joy, .jy__sys, .f__held'), { autoAlpha: 0 });
    gsap.set(J('.jy__pop'), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(J('.jy__bar'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(c('mouth'), { scaleY: -1, svgOrigin: '0 -82' });
    gsap.set(f('armR'), { rotation: -95, ...O });

    // act 1, brand: he sketches the mark with a giant pencil, then a stamp slams it into ink
    tl.to(J('.jy__ring'), { strokeDashoffset: 0, duration: 0.9, ease: 'none' }, 0)
      .to(J('.jy__k'), { strokeDashoffset: 0, duration: 0.35, stagger: 0.3, ease: 'none' }, 0.25)
      .fromTo(f('armR'), { rotation: -80, ...O }, { rotation: -118, ...O, duration: 0.1, repeat: 11, yoyo: true, ease: 'sine.inOut' }, 0)
      .fromTo(f('head'), { rotation: -4, svgOrigin: '0 -76' }, { rotation: 6, svgOrigin: '0 -76', duration: 0.3, repeat: 3, yoyo: true }, 0)
      .to(J('.jy__spec'), { autoAlpha: 1, duration: 0.2 }, 0.9)
      .to(J('.f__pencil'), { autoAlpha: 0, duration: 0.1 }, 1.2)
      .to(f('armR'), { rotation: -20, ...O, duration: 0.15 }, 1.2)
      .to(J('.jy__stamp'), { autoAlpha: 1, duration: 0.01 }, 1.2)
      .to(J('.jy__stamp'), { y: 0, duration: 0.3, ease: 'power4.in' }, 1.22)
      .set(J('.jy__disc'), { scale: 1, ...O }, 1.52)
      .set(J('.jy__k'), { stroke: 'var(--paper)' }, 1.52)
      .fromTo(J('.jy__bang'), { autoAlpha: 1, scale: 0.7, transformOrigin: '50% 50%' }, { scale: 1.15, autoAlpha: 0, duration: 0.35, ease: 'power2.out', immediateRender: false }, 1.52)
      .to(f('bob'), { y: -46, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' }, 1.52)
      .to(f('armL'), { rotation: 150, ...O, duration: 0.14 }, 1.52).to(f('armR'), { rotation: -150, ...O, duration: 0.14 }, 1.52)
      .to(J('.jy__stamp'), { y: -620, duration: 0.35, ease: 'power2.in' }, 1.62)

    // act 2, footprint: the mark shrinks into his hands and he carries it past a site, a phone and a map sign
      .to(J('.jy__brand > :not(.jy__mark)'), { autoAlpha: 0, duration: 0.3 }, 2.0)
      .to(J('.jy__mark'), { x: 380, y: 275, scale: 0.364, duration: 0.4 }, 2.0)
      .set(J('.jy__mark'), { autoAlpha: 0 }, 2.4).set(f('held'), { autoAlpha: 1 }, 2.4)
      .to(f('armL'), { rotation: 130, ...O, duration: 0.2 }, 2.2).to(f('armR'), { rotation: -130, ...O, duration: 0.2 }, 2.2)
      .set(J('.jy__web'), { autoAlpha: 1 }, 2.35).set(J('.jy__phone'), { autoAlpha: 1 }, 2.85).set(J('.jy__map'), { autoAlpha: 1 }, 3.2)
      .to(J('.jy__web .jy__draw'), { strokeDashoffset: 0, duration: 0.45, stagger: 0.05, ease: 'none' }, 2.35)
      .to(J('.jy__phone .jy__draw'), { strokeDashoffset: 0, duration: 0.4, stagger: 0.05, ease: 'none' }, 2.85)
      .to(J('.jy__map .jy__draw'), { strokeDashoffset: 0, duration: 0.4, stagger: 0.05, ease: 'none' }, 3.2)
      .to(J('.jy__stars'), { autoAlpha: 1, duration: 0.15 }, 3.55);
    walk('f', 380, 1010, 2.4, 1.5, false);
    [2.92, 3.62, 3.88].forEach((t, i) => tl.to(J('.jy__pop')[i], { scale: 1, duration: 0.18, ease: 'back.out(3)' }, t));
    tl.to(J('.jy__step'), { autoAlpha: 1, duration: 0.04, stagger: 0.125, ease: 'none' }, 2.45)

    // act 3, system: a client drowning in paper; the screen swallows the pile and the numbers climb
      .to(J('.jy__foot'), { autoAlpha: 0, duration: 0.3 }, 4.0)
      .to(f('held'), { autoAlpha: 0, y: -40, duration: 0.2 }, 4.0)
      .to(f('armL'), { rotation: 0, ...O, duration: 0.15 }, 4.0).to(f('armR'), { rotation: 0, ...O, duration: 0.15 }, 4.0)
      .to(J('.jy__sys'), { autoAlpha: 1, duration: 0.25 }, 4.05)
      .fromTo(c('armL'), { rotation: 120, ...O }, { rotation: 170, ...O, duration: 0.08, repeat: 7, yoyo: true }, 4.1)
      .fromTo(c('armR'), { rotation: -120, ...O }, { rotation: -170, ...O, duration: 0.08, repeat: 7, yoyo: true }, 4.1)
      .fromTo(J('.jy__pile'), { rotation: -3, svgOrigin: '490 500' }, { rotation: 3, svgOrigin: '490 500', duration: 0.1, repeat: 7, yoyo: true }, 4.1)
      .fromTo(c('sweat'), { y: 0 }, { y: 8, duration: 0.15, repeat: 5, yoyo: true }, 4.1);
    walk('f', 1010, 910, 4.1, 0.5);
    tl.to(f('armL'), { rotation: 95, ...O, duration: 0.15 }, 4.65)
      .set(J('.jy__screen'), { autoAlpha: 1 }, 4.65)
      .to(J('.jy__screen .jy__draw:not(.jy__line)'), { strokeDashoffset: 0, duration: 0.4, stagger: 0.05, ease: 'none' }, 4.65)
      .to(J('.jy__sheet').reverse(), { x: 205, y: (i) => -104 + (8 - i) * 11, rotation: (i) => (i % 2 ? 1 : -1) * (60 + i * 20), scale: 0.15, autoAlpha: 0, transformOrigin: '50% 50%', duration: 0.3, stagger: 0.06, ease: 'power2.in' }, 4.95)
      .to(J('.jy__bar'), { scaleY: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(2)' }, 5.35)
      .to(J('.jy__line'), { strokeDashoffset: 0, duration: 0.4, ease: 'none' }, 5.4)
      .to(J('.jy__dot'), { autoAlpha: 1, duration: 0.1 }, 5.8)
      .to(c('sweat'), { autoAlpha: 0, duration: 0.15 }, 5.5)
      .to(c('mouth'), { scaleY: 1, svgOrigin: '0 -82', duration: 0.1 }, 5.5)
      .to(c('armL'), { rotation: 150, ...O, duration: 0.15 }, 5.65).to(c('armR'), { rotation: -150, ...O, duration: 0.15 }, 5.65)
      .to(f('armL'), { rotation: 150, ...O, duration: 0.15 }, 5.65).to(f('armR'), { rotation: -150, ...O, duration: 0.15 }, 5.65)
      .to(J('.f__bob, .c__bob'), { y: -34, duration: 0.12, yoyo: true, repeat: 3, ease: 'power2.out' }, 5.7)
      .to(J('.jy__joy'), { autoAlpha: 1, duration: 0.15 }, 5.7)
      .to({}, { duration: 1.6 }, 6.0);
    // on a phone the stage is narrow, so a camera pans and zooms to follow the action
    if (matchMedia('(max-width: 760px)').matches) {
      gsap.set(el.querySelector('.journey__art'), { attr: { viewBox: '330 60 640 580' } });
      tl.to('.journey__art', { attr: { viewBox: '300 40 640 610' }, duration: 0.5 }, 1.9)
        .to('.journey__art', { attr: { viewBox: '600 40 600 610' }, duration: 1.4, ease: 'none' }, 2.6)
        .to('.journey__art', { attr: { viewBox: '240 220 760 420' }, duration: 0.5 }, 4.0);
    }
    showCap(0);
    return () => tl.scrollTrigger && tl.scrollTrigger.kill();
  }

  // The street: one long drawing and a camera. Every stop takes three stretches of scroll: one to walk there,
  // two to build it. The figure stays put on screen while the street slides under his feet.
  function streetScene() {
    const el = $('.street', page), Q = (s) => $$(s, el), O = { svgOrigin: '0 0' };
    const svg = $('.street__art', el), stage = $('.street__stage', el), cue = $('.street__cue', el), caps = Q('.st-cap'), marks = Q('.street__mark');
    const N = caps.length - 1, U = 3, END = N * U + 1.6;
    // a mark for every stop, so the rail and the hero list can scroll straight to it
    const place = () => { const run = el.offsetHeight - stage.offsetHeight; marks.forEach((m) => { m.style.top = Math.round(((+m.dataset.i * U + 1.4) / END) * run) + 'px'; }); };
    place(); ScrollTrigger.addEventListener('refresh', place);
    if (reduce) { el.classList.add('is-still'); return () => ScrollTrigger.removeEventListener('refresh', place); }
    const phone = matchMedia('(max-width: 760px)').matches, W = phone ? 600 : 900, CX = phone ? 190 : 0;
    const cam = (i) => `${i * 900 + CX} 0 ${W} 560`;
    svg.setAttribute('viewBox', cam(0));
    Q('.st-draw').forEach((p) => { const n = Math.ceil(p.getTotalLength ? p.getTotalLength() : 1000); p.style.strokeDasharray = n; p.style.strokeDashoffset = n; });
    let shown = -1;
    const showCap = (i) => { if (i === shown) return; const from = shown; shown = i;
      caps.forEach((c, k) => { if (k !== i) gsap.to(c, { autoAlpha: 0, y: k < i ? -24 : 24, duration: 0.18, ease: 'power2.in', overwrite: true }); });
      gsap.fromTo(caps[i], { autoAlpha: 0, y: from < i ? 24 : -24 }, { autoAlpha: 1, y: 0, duration: 0.4, delay: from < 0 ? 0 : 0.2, ease: 'power3.out', overwrite: true });
      gsap.fromTo($$('.st-cap__list li', caps[i]), { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.05, delay: 0.3, ease: 'power2.out', overwrite: true }); };
    // the caption follows the drawing itself (the timeline's own ticks), so it is right even after a long jump
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: el, start: 'top top+=56', end: 'bottom bottom', scrub: 0.4 },
      onUpdate: () => { const t = tl.time(); cue.classList.toggle('is-gone', t > 0.5); showCap(t >= N * U ? N : Math.min(N - 1, Math.floor(t / U))); } });
    const w = (s) => Q('.w__' + s), sc = (i, s) => $$(s, $(`.st-sc[data-i="${i}"]`, el));
    const walk = (x0, x1, t, d) => {
      const n = Math.max(2, Math.round(d / 0.12)) | 1;
      tl.fromTo(Q('.w'), { x: x0 }, { x: x1, duration: d, ease: 'none', immediateRender: false }, t)
        .fromTo(w('legL'), { rotation: -24, ...O }, { rotation: 24, ...O, duration: d / n, repeat: n - 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, t)
        .fromTo(w('legR'), { rotation: 24, ...O }, { rotation: -24, ...O, duration: d / n, repeat: n - 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, t)
        .fromTo(w('bob'), { y: 0 }, { y: -7, duration: d / n / 2, repeat: n * 2 - 1, yoyo: true, ease: 'sine.inOut', immediateRender: false }, t)
        .fromTo(w('armL'), { rotation: 20, ...O }, { rotation: -20, ...O, duration: d / n, repeat: n - 1, yoyo: true, immediateRender: false }, t)
        .fromTo(w('armR'), { rotation: -20, ...O }, { rotation: 20, ...O, duration: d / n, repeat: n - 1, yoyo: true, immediateRender: false }, t)
        .to(w('legL, .w__legR, .w__armL, .w__armR'), { rotation: 0, ...O, duration: 0.1 }, t + d);
    };
    const hop = (t) => tl.to(w('bob'), { y: -40, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out' }, t)
      .to(w('armL'), { rotation: 150, ...O, duration: 0.14 }, t).to(w('armR'), { rotation: -150, ...O, duration: 0.14 }, t)
      .to(w('armL, .w__armR'), { rotation: 0, ...O, duration: 0.2 }, t + 0.35);
    gsap.set(Q('.f__pencil, .f__held'), { autoAlpha: 0 });
    gsap.set(Q('.st-pop, .st-photo'), { scale: 0, transformOrigin: '50% 50%' });
    gsap.set(Q('.st-stamp'), { y: -420 });
    gsap.set(Q('.st-ink__in'), { autoAlpha: 0, scale: 1.5, ...O });
    gsap.set(Q('.st-roller'), { x: 400, y: 236, autoAlpha: 0 });
    gsap.set(Q('.st-phone'), { y: 120, autoAlpha: 0 });
    gsap.set(Q('.st-cursor'), { x: 640, y: 430, autoAlpha: 0 });
    gsap.set(Q('.st-bar'), { scaleY: 0, transformOrigin: '50% 100%' });
    gsap.set(Q('.st-waves path, .st-rays path'), { autoAlpha: 0 });
    gsap.set(Q('.st-mega, .st-open, .st-txt'), { autoAlpha: 0 });
    gsap.set(Q('.st-mini'), { x: 520 });

    // the walk in, then every stop: walk the camera and him one block along, then build
    walk(-140, 260, 0.1, 1.0);
    for (let i = 1; i < N; i++) {
      const t = i * U;
      walk((i - 1) * 900 + 260, i * 900 + 260, t, 1.0);
      tl.fromTo(svg, { attr: { viewBox: cam(i - 1) } }, { attr: { viewBox: cam(i) }, duration: 1.0, ease: 'none', immediateRender: false }, t);
    }
    let t = 1.2;
    // 01 setup
    tl.to(sc(0, '.st-draw'), { strokeDashoffset: 0, duration: 0.5, stagger: 0.08, ease: 'none' }, t)
      .to(Q('.st-txt'), { autoAlpha: 1, duration: 0.1 }, t + 0.3)
      .to(w('armR'), { rotation: -140, ...O, duration: 0.2 }, t + 0.5)
      .to(Q('.st-stamp'), { y: 194, duration: 0.3, ease: 'power4.in' }, t + 0.6)
      .to(Q('.st-ink__in'), { autoAlpha: 1, scale: 1, ...O, duration: 0.12 }, t + 0.9)
      .to(Q('.st-stamp'), { y: -420, duration: 0.35, ease: 'power2.in' }, t + 1.0)
      .to(w('armR'), { rotation: 0, ...O, duration: 0.2 }, t + 1.0)
      .to(sc(0, '.st-pop'), { scale: 1, duration: 0.2, stagger: 0.12, ease: 'back.out(3)' }, t + 1.15);
    hop(t + 0.9);
    // 02 brand
    t = U + 1.2;
    tl.to(sc(1, '.st-draw'), { strokeDashoffset: 0, duration: 0.3, ease: 'none' }, t)
      .to(Q('.st-roller'), { autoAlpha: 1, duration: 0.05 }, t + 0.3)
      .to(Q('.st-roller'), { x: 800, duration: 0.7, ease: 'none' }, t + 0.3)
      .to(Q('.st-paint'), { attr: { width: 400 }, duration: 0.7, ease: 'none' }, t + 0.3)
      .fromTo(w('armR'), { rotation: -100, ...O }, { rotation: -150, ...O, duration: 0.1, repeat: 6, yoyo: true, immediateRender: false }, t + 0.3)
      .to(Q('.st-roller'), { autoAlpha: 0, duration: 0.1 }, t + 1.0)
      .to(w('armR'), { rotation: 0, ...O, duration: 0.15 }, t + 1.0)
      .to(sc(1, '.st-pop'), { scale: 1, duration: 0.2, stagger: 0.1, ease: 'back.out(3)' }, t + 1.05);
    // 03 web
    t = 2 * U + 1.2;
    tl.to(sc(2, '.st-draw'), { strokeDashoffset: 0, duration: 0.6, stagger: 0.05, ease: 'none' }, t)
      .to(w('armR'), { rotation: -110, ...O, duration: 0.2 }, t + 0.1)
      .to(Q('.st-phone'), { y: 0, autoAlpha: 1, duration: 0.35, ease: 'back.out(1.6)' }, t + 0.6)
      .to(Q('.st-cursor'), { autoAlpha: 1, duration: 0.05 }, t + 0.8)
      .to(Q('.st-cursor'), { x: 478, y: 282, duration: 0.4, ease: 'power2.inOut' }, t + 0.8)
      .to(Q('.st-cursor'), { scale: 0.8, duration: 0.06, yoyo: true, repeat: 1, transformOrigin: '0 0' }, t + 1.2)
      .to(Q('.st-btn'), { fill: 'var(--spot)', stroke: 'var(--spot)', duration: 0.08 }, t + 1.22)
      .to(w('armR'), { rotation: 0, ...O, duration: 0.2 }, t + 1.3);
    // 04 software
    t = 3 * U + 1.2;
    tl.to(sc(3, '.st-draw:not(.st-rise)'), { strokeDashoffset: 0, duration: 0.4, stagger: 0.05, ease: 'none' }, t)
      .to(w('armR'), { rotation: -95, ...O, duration: 0.15 }, t)
      .fromTo(Q('.st-gear--a'), { rotation: 0, ...O }, { rotation: 300, ...O, duration: 1.5, ease: 'none' }, t + 0.1)
      .fromTo(Q('.st-gear--b'), { rotation: 0, ...O }, { rotation: -470, ...O, duration: 1.5, ease: 'none' }, t + 0.1)
      .to(Q('.st-bar'), { scaleY: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(2)' }, t + 0.5)
      .to(Q('.street .st-sc[data-i="3"] .st-rise'), { strokeDashoffset: 0, duration: 0.4, ease: 'none' }, t + 0.9)
      .to(w('armR'), { rotation: 0, ...O, duration: 0.2 }, t + 1.4);
    hop(t + 1.3);
    // 05 growth
    t = 4 * U + 1.2;
    tl.to(sc(4, '.st-draw:not(.st-rise)'), { strokeDashoffset: 0, duration: 0.35, stagger: 0.05, ease: 'none' }, t)
      .to(Q('.st-open'), { autoAlpha: 1, duration: 0.1 }, t + 0.35)
      .to(w('armR'), { rotation: -100, ...O, duration: 0.15 }, t + 0.2)
      .to(Q('.st-mega'), { autoAlpha: 1, duration: 0.05 }, t + 0.3)
      .to(Q('.st-waves path'), { autoAlpha: 1, duration: 0.08, stagger: 0.08, repeat: 3, yoyo: true }, t + 0.35)
      .to(Q('.st-mini'), { x: 0, duration: 0.9, stagger: 0.1, ease: 'power1.out' }, t + 0.4)
      .fromTo(Q('.st-mini__bob'), { y: 0 }, { y: -6, duration: 0.06, repeat: 15, yoyo: true, ease: 'sine.inOut', immediateRender: false }, t + 0.4)
      .to(Q('.street .st-sc[data-i="4"] .st-rise'), { strokeDashoffset: 0, duration: 0.4, ease: 'none' }, t + 1.2)
      .to(Q('.st-mega'), { autoAlpha: 0, duration: 0.1 }, t + 1.6)
      .to(w('armR'), { rotation: 0, ...O, duration: 0.15 }, t + 1.6);
    // 06 creative
    t = 5 * U + 1.2;
    tl.to(sc(5, '.st-draw'), { strokeDashoffset: 0, duration: 0.3, ease: 'none' }, t)
      .to(w('armR'), { rotation: -60, ...O, duration: 0.15 }, t + 0.3)
      .to(Q('.st-rays path'), { autoAlpha: 1, duration: 0.05 }, t + 0.55)
      .to(Q('.st-flash'), { opacity: 0.92, duration: 0.05, ease: 'none' }, t + 0.55)
      .to(Q('.st-flash'), { opacity: 0, duration: 0.35, ease: 'power2.out' }, t + 0.6)
      .to(Q('.st-rays path'), { autoAlpha: 0, duration: 0.2 }, t + 0.8)
      .to(Q('.st-photo'), { scale: 1, duration: 0.25, stagger: 0.15, ease: 'back.out(2.4)' }, t + 0.8)
      .to(w('armR'), { rotation: 0, ...O, duration: 0.15 }, t + 1.3);
    // the end: he jumps, the whole street behind him
    hop(N * U + 0.2); hop(N * U + 0.8);
    tl.to({}, { duration: 0.2 }, END - 0.2);
    // the words float: within each stop the title, the line and the list drift up at slightly different speeds
    caps.forEach((c, i) => {
      const at = i * U, d = i === N ? END - at : U;
      [['.st-cap__title', 18], ['.cap__tag', 12], ['.st-cap__text', 8], ['.st-cap__list', 5]].forEach(([q, a]) => { const x = $(q, c); if (x) tl.fromTo(x, { y: a }, { y: -a / 3, duration: d, ease: 'none', immediateRender: i === 0 }, at); });
    });
    showCap(0);
    return () => { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); ScrollTrigger.removeEventListener('refresh', place); };
  }

  // Services, below the street: headings rise out of their fold, the journey's road draws itself as its sheet
  // slides in and each step floats up as the road reaches it, the promises drift at their own pace.
  function svcFloat() {
    const kills = [], add = (t) => kills.push(t);
    $$('.jr__big .line > span, .why__big .line > span, .own-sec .cap__title, .faq__title .ws__mask > span', page).forEach((el) =>
      add(gsap.fromTo(el, { yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } })));
    $$('.jr__deck, .why__deck, .own-sec .cap__tag, .own-sec .cap__text', page).forEach((el) =>
      add(gsap.fromTo(el, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } })));
    // between sections: no sheet slides over another; each section's content rises a little slower than the
    // page as it comes in, and the heading drifts against its text, so the page reads in layers
    $$('.own-sec, .jr, .why, .faq', page).forEach((sec) => {
      const kids = $$(':scope > *:not(.spread__shade)', sec);
      add(gsap.fromTo(kids, { y: (k) => 46 + k * 22 }, { y: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top 35%', scrub: 0.5 } }));
      const big = $('.cap__big, .faq__title, .svc-end__title, .own .cap__title', sec);
      if (!big) return;
      // the two lines of a heading part slowly as the section passes: the roman line drifts left,
      // the italic line drifts right and lags a little, so the words seem to hang at different depths
      const ls = $$(':scope > .line', big), span = { trigger: sec, start: 'top 85%', end: 'bottom top', scrub: 0.6 };
      if (ls.length > 1) {
        add(gsap.fromTo(ls[0], { x: 12 }, { x: -10, ease: 'none', scrollTrigger: span }));
        add(gsap.fromTo(ls[1], { x: -8, y: 0 }, { x: 30, y: -12, ease: 'none', scrollTrigger: { ...span } }));
      }
      add(gsap.fromTo(big, { yPercent: 6 }, { yPercent: -14, ease: 'none', scrollTrigger: { ...span } }));
      const deck = $('.jr__deck, .why__deck, .svc-end__deck, .own .cap__tag', sec);
      if (deck) add(gsap.fromTo(deck, { y: 18 }, { y: -26, ease: 'none', scrollTrigger: { ...span } }));
    });
    const jr = $('.jr', page);
    if (jr) {
      const steps = $$('.jr__step', jr);
      const tl = gsap.timeline({ scrollTrigger: { trigger: jr, start: 'top 80%', end: 'top 15%', scrub: 0.45 } });
      tl.fromTo($('.jr__road', jr), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1, ease: 'none' }, 0);
      steps.forEach((el, k) => tl.fromTo(el, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }, 0.08 + k * 0.22)
        .fromTo($('.jr__dot', el), { scale: 0 }, { scale: 1, duration: 0.12, ease: 'back.out(3)' }, 0.08 + k * 0.22));
      add(tl);
      // the big numbers float a touch slower than the words under them
      $$('.jr__n', jr).forEach((el, k) => add(gsap.fromTo(el, { y: 18 + k * 6 }, { y: -18 - k * 6, ease: 'none', scrollTrigger: { trigger: jr, start: 'top bottom', end: 'bottom top', scrub: true } })));
    }
    const why = $('.why', page);
    if (why) {
      $$('.why__row', why).forEach((el, k) => {
        add(gsap.fromTo(el, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
        add(gsap.fromTo($('.why__l', el), { y: 34 }, { y: -34, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } }));
      });
    }
    return () => kills.forEach((k) => { if (k.scrollTrigger) k.scrollTrigger.kill(); k.kill(); });
  }

  // Services ending: no card, no effect. As "Let's build it, together." scrolls up, the paper, the bars and the
  // ink simply blend into night with the scroll, so the black section and the page become one
  function svcNight() {
    const end = $('.svc-end', page), root = document.documentElement, logo = $('.topbar__logo img');
    if (!end) return () => {};
    const vars = ['--paper', '--ink', '--ink-soft', '--rule'];
    const night = { '--paper': '#0d0d0d', '--ink': '#efede7', '--ink-soft': '#b9b5aa', '--rule': '#efede7' };
    const day = { '--paper': '#efede7', '--ink': '#0d0d0d', '--ink-soft': '#3a3a3a', '--rule': '#0d0d0d' };
    // Changing the colours on the whole document restyled every element of this long page on every frame, which made
    // the change stutter. Only what can be on screen during it is recoloured as you scroll: the last few sections, the
    // bars and the page behind them. The rest of the document follows once, after the scroll has settled at night.
    // (the panel itself keeps its own colours, so it is left alone)
    const live = [end.previousElementSibling, end.previousElementSibling && end.previousElementSibling.previousElementSibling,
      ...$$('.svc-end ~ *', page), $('.topbar'), $('#bottombar'), $('.wa-fab')].filter(Boolean);
    const bg = [root, document.body];
    const mix = { p: 0 };
    const lerp = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
    let whole = false;
    const paint = (t) => {
      const c = {}; vars.forEach((v) => (c[v] = lerp(day[v], night[v], t)));
      live.forEach((el) => vars.forEach((v) => el.style.setProperty(v, c[v])));
      bg.forEach((el) => (el.style.backgroundColor = c['--paper']));
      if (logo) logo.style.filter = `invert(${t.toFixed(3)})`;
      if (whole && t < 1) { whole = false; vars.forEach((v) => root.style.removeProperty(v)); }
    };
    const settle = () => { if (mix.p >= 1 && !whole) { whole = true; vars.forEach((v) => root.style.setProperty(v, night[v])); } };
    const tl = gsap.to(mix, { p: 1, ease: 'none', onUpdate: () => paint(mix.p), scrollTrigger: { trigger: end, start: 'top 85%', end: 'top 30%', scrub: true } });
    ScrollTrigger.addEventListener('scrollEnd', settle);
    return () => {
      ScrollTrigger.removeEventListener('scrollEnd', settle); tl.scrollTrigger.kill(); tl.kill();
      [...live, root].forEach((el) => vars.forEach((v) => el.style.removeProperty(v)));
      bg.forEach((el) => (el.style.backgroundColor = '')); if (logo) logo.style.filter = '';
    };
  }

  // Contact, the last page: you arrive at a carved door, scroll through it, and find "Let's talk." being written in one
  // pen line; the signature follows the scroll. The three ways in come into focus one by one, and one pen line joins the steps.
  function contactPage() {
    const kills = [], add = (t) => { kills.push(t); return t; };
    // "Let's talk." writes itself in one fine pen line as the page opens; scrolling lets him sign it
    const sec = $('.ct-pen', page);
    if (sec) {
      const rig = (svg) => {
        if (!svg || !svg.querySelector('.ct-pen__s')) return null;
        const ps = $$('.ct-pen__s', svg), nib = $('.ct-pen__nib', svg), dot = $('.ct-pen__dot', svg);
        const lens = ps.map((p) => p.getTotalLength()), total = lens.reduce((a, b) => a + b, 0);
        ps.forEach((p, k) => { p.style.strokeDasharray = `${lens[k] + 1} ${lens[k] + 1}`; });
        let last = -1;
        const draw = (t) => {
          t = Math.min(1, Math.max(0, t)); if (t === last || (t > 0 && t < 1 && Math.abs(t - last) < 0.0005)) return; last = t;
          let left = t * total, tip = null;
          ps.forEach((p, k) => {
            const l = Math.min(lens[k], Math.max(0, left)); left -= lens[k];
            p.style.strokeDashoffset = lens[k] + 1 - l;
            if (l > 0 && l < lens[k]) tip = p.getPointAtLength(l);
          });
          if (nib) { if (tip && t < 1) { nib.setAttribute('cx', tip.x); nib.setAttribute('cy', tip.y); nib.style.opacity = 1; } else nib.style.opacity = 0; }
          if (dot) dot.classList.toggle('is-on', t >= 1);
        };
        return draw;
      };
      const word = rig($('.ct-pen__word', sec)), sign = rig($('.ct-pen__sign', sec));
      const deck = $('.ct-deck', sec), hint = $('.ct-hint', sec), yours = $('.ct-pen__yours', sec);
      const dr = $('.ct-door', sec), cam = dr && $('.ct-door__cam', dr), room = $('.ct-room', sec);
      if (reduce) { word && word(1); sign && sign(1); sec.classList.add('is-signed'); if (dr) dr.hidden = true; }
      else {
        // you arrive at a carved door; scrolling swings it open and carries you through, into the room where the letter is
        let wrote = false;
        const write = () => { if (wrote || !word) return; wrote = true; const pr = { t: 0 }; add(gsap.to(pr, { t: 1, duration: 4, ease: 'sine.inOut', onUpdate: () => word(pr.t) })); };
        if (word) word(0); if (sign) sign(0);
        if (!dr) write();
        const st = { t: 0 };
        const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.6, onUpdate: (s) => { if (s.progress > 0.2) write(); } } });
        if (dr) {
          // on a narrow screen the camera starts closer, so the door fills the frame
          if (matchMedia('(max-width: 760px)').matches) $('.ct-door__svg', dr).setAttribute('viewBox', '10 -60 580 1000');
          // the door inks itself in, then its labels fade up; once drawn, the dashes are dropped so the lines stay whole at any zoom
          add(gsap.delayedCall(3.6, () => { dr.classList.add('is-inked'); $$('[pathLength]', dr).forEach((e) => e.removeAttribute('pathLength')); }));
          add(gsap.fromTo($$('.ct-door__k, .ct-door__hint', dr), { opacity: 0 }, { opacity: 1, duration: 1.2, delay: 1.6, stagger: 0.5, ease: 'sine.out' }));
          gsap.set(hint, { opacity: 0 });
          tl.to($$('.ct-door__hint, .ct-door__k', dr), { opacity: 0, duration: 0.05 }, 0.01)
            .to($('.ct-door__leaf--l', dr), { scaleX: 0.1, skewY: 7, transformOrigin: '0% 50%', duration: 0.24, ease: 'sine.inOut' }, 0.03)
            .to($('.ct-door__leaf--r', dr), { scaleX: 0.1, skewY: -7, transformOrigin: '100% 50%', duration: 0.24, ease: 'sine.inOut' }, 0.03)
            .fromTo(cam, { scale: 1 }, { scale: 11, svgOrigin: '300 500', duration: 0.32, ease: 'power2.in' }, 0.12)
            .fromTo(room, { scale: 0.8 }, { scale: 1, duration: 0.34, ease: 'power1.out' }, 0.12)
            .to(dr, { autoAlpha: 0, duration: 0.05 }, 0.4);
        }
        if (dr) tl.to(hint, { opacity: 1, duration: 0.05 }, 0.42);
        tl.to(hint, { opacity: 0, duration: 0.05 }, 0.55)
          .fromTo(yours, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.6)
          .to(st, { t: 1, duration: 0.24, ease: 'sine.inOut', onUpdate: () => sign && sign(st.t) }, 0.62)
          .fromTo(deck, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.1, ease: 'sine.out' }, 0.86)
          .to({}, { duration: 0.04 }, 0.96);
        add(tl);
      }
    }
    // each way in floats far off and out of focus; it comes sharp as it reaches reading distance, then drifts past
    $$('.ct-way', page).forEach((el) => {
      el.style.setProperty('--f', 1);
      if (reduce) return;
      const blur = matchMedia('(max-width: 760px)').matches ? 4 : 8;
      add(gsap.fromTo(el, { scale: 0.8, opacity: 0.12, y: 50, filter: `blur(${blur}px)` }, { scale: 1, opacity: 1, y: 0, filter: 'blur(0px)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 100%', end: 'center 56%', scrub: 0.5 } }));
      add(gsap.fromTo(el, { scale: 1, opacity: 1, filter: 'blur(0px)' }, { scale: 1.03, opacity: 0.25, filter: `blur(${blur * 0.6}px)`, ease: 'none', immediateRender: false, scrollTrigger: { trigger: el, start: 'center 26%', end: 'bottom 0%', scrub: 0.5 } }));
    });
    // the four steps are joined by one fine pen line, drawn through their numbers as you read down
    const how = $('.ct-how', page), trail = how && $('.ct-trail', how);
    if (trail) {
      const path = $('path', trail), tale = $('.ct-tale', how);
      let len = 0, cur = 0;
      const lay = () => {
        const nums = $$('.ct-beat__n', how); const box = how.getBoundingClientRect();
        if (getComputedStyle(trail).display === 'none' || nums.length < 2) return;
        const rs = nums.map((n) => n.getBoundingClientRect());
        let d = '';
        for (let i = 1; i < rs.length; i++) {
          // along the number's line, down the gutter beside the next step, then into its number: it never crosses text
          const a = rs[i - 1], b = rs[i], x0 = a.right - box.left + 16, y0 = a.top - box.top + a.height * 0.55;
          const gx = b.left - box.left - 22, y1 = b.top - box.top + b.height * 0.55, x1 = b.left - box.left - 8, r = Math.min(30, (y1 - y0) / 2, (gx - x0) / 2);
          d += `${i === 1 ? 'M' : ' L'}${x0} ${y0} H${gx - r} Q${gx} ${y0} ${gx} ${y0 + r} V${y1 - r} Q${gx} ${y1} ${gx + r * 0.4} ${y1} H${x1}`;
        }
        trail.setAttribute('width', box.width); trail.setAttribute('height', box.height); path.setAttribute('d', d);
        len = path.getTotalLength(); path.style.strokeDasharray = `${len} ${len}`; path.style.strokeDashoffset = reduce ? 0 : len * (1 - cur);
      };
      lay();
      if (!reduce) {
        const pr = { t: 0 };
        add(gsap.to(pr, { t: 1, ease: 'none', scrollTrigger: { trigger: tale, start: 'top 78%', end: 'bottom 88%', scrub: 0.7 }, onUpdate: () => { cur = pr.t; path.style.strokeDashoffset = len * (1 - cur); } }));
      }
      ScrollTrigger.addEventListener('refresh', lay); kills.push({ kill: () => ScrollTrigger.removeEventListener('refresh', lay) });
    }
    const beats = $$('.ct-beat', page);
    if (beats.length) {
      if (reduce) beats.forEach((b) => b.classList.add('is-on'));
      else beats.forEach((b) => add(ScrollTrigger.create({ trigger: b, start: 'top 72%', onEnter: () => b.classList.add('is-on'), onLeaveBack: () => b.classList.remove('is-on') })));
    }
    return () => kills.forEach((k) => { if (k.scrollTrigger) k.scrollTrigger.kill(); k.kill(); });
  }

  // About: no sheets, no slides. The page is laid out like a printed profile; scrolling only lets things drift.
  // Words float up once into place; the name, the photo, the notes and the big glyphs move at their own pace.
  function bioPage() {
    const kills = [];
    $$('[data-float]', page).forEach((el) => kills.push(gsap.fromTo(el, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })));
    $$('.bio [data-speed]', page).forEach((el) => {
      const v = +el.dataset.speed * 90;
      kills.push(gsap.fromTo(el, { y: -v }, { y: v, ease: 'none', scrollTrigger: { trigger: el.closest('.bio'), start: 'top bottom', end: 'bottom top', scrub: true } }));
    });
    return () => kills.forEach((k) => { if (k.scrollTrigger) k.scrollTrigger.kill(); k.kill(); });
  }

  // Sheet over sheet: each spread of the front page holds still once its bottom reaches the screen, and the next
  // one is laid over it. The sheet underneath darkens as it is covered; footprints walk in along the new one's top.
  function spreads() {
    const els = $$('.spread:not(.flat)', page);
    if (els.length < 2 || reduce) return () => {};
    const shade = els.map((el) => { const d = document.createElement('i'); d.className = 'spread__shade'; d.setAttribute('aria-hidden', 'true'); el.append(d); return d; });
    const fit = () => els.forEach((el, k) => { el.style.zIndex = k + 1; if (!el.classList.contains('spread--last')) el.style.top = Math.min(56, innerHeight - 40 - el.offsetHeight) + 'px'; });
    // ScrollTrigger measures with every spread back in plain flow, so a held sheet never skews a start or end
    const loose = () => els.forEach((el) => el.classList.add('is-loose'));
    const tight = () => { els.forEach((el) => el.classList.remove('is-loose')); fit(); tick(); };
    const tick = () => {
      const H = innerHeight;
      // a sheet that is folded away (a closed door on Services) neither covers nor is covered
      const on = els.filter((el) => !el.hidden);
      shade.forEach((d, k) => { if (els[k].hidden || els[k] === on[on.length - 1]) d.style.opacity = 0; });
      for (let k = 1; k < on.length; k++) {
        const p = Math.min(1, Math.max(0, 1 - (on[k].getBoundingClientRect().top - 56) / (H - 56)));
        shade[els.indexOf(on[k - 1])].style.opacity = (p * p * 0.62).toFixed(3);
        on[k].style.setProperty('--in', p.toFixed(3));
      }
    };
    ScrollTrigger.addEventListener('refreshInit', loose); ScrollTrigger.addEventListener('refresh', tight);
    fit(); tick(); lenis.on('scroll', tick); addEventListener('resize', fit);
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', loose); ScrollTrigger.removeEventListener('refresh', tight);
      lenis.off('scroll', tick); removeEventListener('resize', fit); shade.forEach((d) => d.remove());
    };
  }

  // The front page's later spreads: the work titles rise out of a fold, the coupon clock runs its twenty minutes,
  // the clients' words take turns on one held stage.
  // The front page is one broadsheet. A shop sits pinned in the middle column; reading down the page lifts its
  // shutter, and each story that passes the middle of the screen names the stage: the caption changes, the sign
  // inks in, the lights come on. Pictures and headlines drift a little against the text for depth.
  function frontPage() {
    const np = $('.np', page), body = $('.np-body', np), fig = $('.np-fig', np), shut = $('.shop__shutter', fig), cap = $('[data-cap]', fig);
    const kills = [], phone = matchMedia('(max-width: 900px)').matches;
    const lift = (p) => { gsap.set(shut, { y: -384 * p }); fig.style.setProperty('--open', p.toFixed(3)); fig.classList.toggle('is-open', p > 0.97); };
    lift(reduce ? 1 : 0);
    if (!reduce) {
      // desktop: the whole page lifts it; phone: the shop is in the column and opens while it is on screen
      const st = ScrollTrigger.create(phone
        ? { trigger: fig, start: 'top 70%', end: 'bottom 45%', scrub: 0.45, onUpdate: (s) => lift(s.progress) }
        : { trigger: body, start: 'top 20%', end: 'bottom bottom', scrub: 0.5, onUpdate: (s) => lift(s.progress) });
      kills.push(st);
    }
    let on = -1;
    const say = (el) => { const k = +el.dataset.stage; if (k === on) return; on = k; fig.dataset.st = k; const t = el.dataset.cap; if (cap.textContent === t) return;
      if (reduce) { cap.textContent = t; return; }
      gsap.to(cap, { opacity: 0, y: -6, duration: 0.2, onComplete: () => { cap.textContent = t; gsap.fromTo(cap, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }); } }); };
    if (!phone) $$('.np-story', np).forEach((el) => kills.push(ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onEnter: () => say(el), onEnterBack: () => say(el) })));
    else {
      // phone: one caption while shut, the last one once the shutter is up
      fig.dataset.st = '9';
      const first = $('.np-story[data-cap]', np), last = $$('.np-story[data-cap]', np).pop();
      kills.push(ScrollTrigger.create({ trigger: fig, start: 'bottom 45%', onEnter: () => say(last), onLeaveBack: () => say(first) }));
    }
    if (!reduce) {
      // depth: pictures drift against the text; headlines rise once out of a fold
      $$('[data-speed]', np).forEach((el) => kills.push(gsap.fromTo(el, { y: -36 }, { y: 36, ease: 'none', scrollTrigger: { trigger: el.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } })));
      $$('.np-headline .line > span, .np-h, .np-adh', np).forEach((el) => kills.push(gsap.fromTo(el, { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } })));
      $$('.np-dek, .np-list, .np-go, .np-letter, .np-also li, .np-toc li', np).forEach((el) => kills.push(gsap.fromTo(el, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 92%' } })));
    }
    return () => kills.forEach((k) => (k.scrollTrigger ? k.scrollTrigger.kill() : k.kill && k.kill()));
  }

  function frontSpreads() {
    const kills = [];
    $$('.ws, .person, .wk__card', page).forEach((el) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 62%' } });
      tl.fromTo($('.ws__mask > span', el), { yPercent: 108 }, { yPercent: 0, duration: 1.3, ease: 'expo.out' })
        .fromTo($$('.ws__kind, .ws__line, .person__text, .btn, .ws__more', el), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.08 }, 0.15);
      const pic = $('.ws__pic .media, .person__pic', el);
      if (pic) gsap.fromTo(pic, { scale: 0.84 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 30%', scrub: 0.45 } });
      kills.push(tl);
    });
    const cp = $('.coupon', page);
    if (cp) {
      const sweep = $('.coupon__sweep', cp), o = { a: 0 };
      const arc = () => { const r = 92, t = (o.a - 90) * Math.PI / 180; sweep.setAttribute('d', `M0 0 L0 -${r} A${r} ${r} 0 ${o.a > 180 ? 1 : 0} 1 ${(r * Math.cos(t)).toFixed(2)} ${(r * Math.sin(t)).toFixed(2)} Z`); };
      const tl = gsap.timeline({ scrollTrigger: { trigger: cp, start: 'top 85%', end: 'center 45%', scrub: 0.45 } });
      tl.fromTo($('.coupon__min', cp), { rotate: 0 }, { rotate: 120, svgOrigin: '0 0', ease: 'none', duration: 1 }, 0)
        .fromTo($('.coupon__hour', cp), { rotate: 0 }, { rotate: 10, svgOrigin: '0 0', ease: 'none', duration: 1 }, 0)
        .fromTo(o, { a: 0 }, { a: 120, ease: 'none', duration: 1, onUpdate: arc }, 0)
        .fromTo($('.coupon__num > span', cp), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'expo.out', duration: 0.5 }, 0)
        .fromTo($$('.coupon__copy > *', cp), { y: 30, opacity: 0 }, { y: 0, opacity: 1, ease: 'expo.out', duration: 0.4, stagger: 0.06 }, 0.25);
      const arm = $('.cf__armR', cp);
      if (arm) {
        gsap.set(arm, { rotate: -100, svgOrigin: '0 0' });
        const wave = gsap.to(arm, { rotate: -128, svgOrigin: '0 0', duration: 0.42, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true });
        const st = ScrollTrigger.create({ trigger: cp, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? wave.play() : wave.pause()) });
        kills.push(wave, st);
      }
      kills.push(tl);
    }
    const word = $('.word', page);
    if (word) {
      const qs = $$('.word__q', word), dots = $$('.word__dots i', word);
      const tl = gsap.timeline({ scrollTrigger: { trigger: word, start: 'top 65%', end: 'bottom bottom', scrub: 0.4 } });
      qs.forEach((q, i) => {
        const at = i * 2, bq = $('blockquote', q);
        tl.fromTo(q, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, at)
          .fromTo(bq, { yPercent: 18, clipPath: 'inset(0 0 100% 0)' }, { yPercent: 0, clipPath: 'inset(0 0 -10% 0)', duration: 0.6, ease: 'expo.out' }, at)
          .fromTo($('figcaption', q), { opacity: 0 }, { opacity: 1, duration: 0.3 }, at + 0.35)
          .to(dots[i], { scaleX: 1, duration: 1.6, ease: 'none' }, at);
        if (i < qs.length - 1) tl.to(q, { autoAlpha: 0, y: -40, duration: 0.4, ease: 'power2.in' }, at + 1.6);
      });
      tl.to({}, { duration: 1 }, qs.length * 2 - 0.4);
      kills.push(tl);
    }
    return () => kills.forEach((k) => { if (k.scrollTrigger) k.scrollTrigger.kill(); k.kill(); });
  }

  function initPage() {
    // One transition language for the whole site. Each section is laid onto the page like a fresh sheet:
    // it rises and its edges open as you scroll, tied to the scroll so it never jumps. Headings rise out of
    // a fold; smaller blocks ink in, sharpening from a soft blur. No bounces, no flips.
    const sheets = $$(':scope > :is(.freecheck, .toon, .carousel, .sectors, .process, .story, .quotes, .brief, .cta, .case, .pj-gallery, .pj-next, .about-block, .grid, section)', page)
      .filter((el) => !el.matches('.cover, .statement, .journey, .street, .bio, .offers, .masthead, .hero, .brief.is-flow, .spread') && !el.closest('.cover, .spread'));
    if (!reduce) sheets.forEach((el) => {
      gsap.fromTo(el, { y: 110, clipPath: 'inset(9% 3.5% 0% 3.5%)' }, { y: 0, clipPath: 'inset(-12% -3% -3% -3%)', ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 45%', scrub: 0.5 } });
    });
    $$('.crosshead', page).forEach((el) => {
      if (reduce) return;
      const h = $('h2', el), rest = $$(':scope > :not(h2)', el);
      gsap.fromTo(h, { yPercent: 70, clipPath: 'inset(0 0 100% 0)' }, { yPercent: 0, clipPath: 'inset(0 0 -20% 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
      if (rest.length) gsap.fromTo(rest, { opacity: 0 }, { opacity: 1, duration: 1, delay: 0.3, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    $$('[data-reveal], .index-row, .exp-row, .stat, .card__meta', page).forEach((el) => {
      if (reduce) return;
      gsap.fromTo(el, { y: 36, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.3, ease: 'expo.out', clearProps: 'filter',
        scrollTrigger: { trigger: el, start: 'top 90%' } });
    });
    // counters
    $$('[data-count]', page).forEach((el) => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 2, ease: 'power2.out', snap: { v: 1 }, scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => (el.textContent = o.v) });
    });
    // parallax on big headlines
    $$('.headline--xl', page).forEach((el) => {
      gsap.to(el, { yPercent: -12, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
    });
    // What We Do: full-screen panels stack like pages landing on a desk; the one underneath sinks back
    const panels = $$('.offer-panel', page);
    panels.forEach((el, k) => {
      gsap.fromTo($('.offer__mask > span', el), { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 70%' } });
      gsap.fromTo($$('.offer__body > *, .offer-panel__work', el), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.07, scrollTrigger: { trigger: el, start: 'top 55%' } });
      const nxt = panels[k + 1];
      if (nxt && !reduce) gsap.to($('.offer-panel__inner', el), { scale: 0.9, opacity: 0.35, rotate: k % 2 ? 0.6 : -0.6, ease: 'none', scrollTrigger: { trigger: nxt, start: 'top bottom', end: 'top 60px', scrub: true } });
    });
    // the statement: each word inks in as you scroll past
    $$('[data-words]', page).forEach((el) => {
      const walk = (n) => [...n.childNodes].forEach((c) => {
        if (c.nodeType === 3) { const frag = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) frag.append(w); else { const sp = document.createElement('span'); sp.className = 'w'; sp.textContent = w; frag.append(sp); } }); c.replaceWith(frag); }
        else walk(c);
      });
      walk(el);
      if (reduce) return;
      // the big statement: held on screen while each word springs up out of the fold, then the key words get inked over
      if (el.closest('.statement')) {
        const st = gsap.timeline({ scrollTrigger: { trigger: el.closest('.statement'), start: 'top 70%', end: 'bottom bottom', scrub: 0.35 } });
        st.fromTo($$('.w', el), { yPercent: 115, rotate: 8, opacity: 0, transformOrigin: '0% 100%' }, { yPercent: 0, rotate: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.6)' }, 0);
        $$('em', el).forEach((em, k) => st.to(em, { '--hl': 1, color: 'var(--paper)', duration: 0.5, ease: 'power2.inOut' }, 1.2 + k * 0.45));
        st.to(el, { scale: 0.92, opacity: 0.25, duration: 0.6, ease: 'power1.in' }, '+=0.6');
        return;
      }
      gsap.fromTo($$('.w', el), { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });
    // founder photo: a torch of sharp image follows the cursor through the blur (drifts by itself on touch)
    $$('[data-torch]', page).forEach((el) => {
      const pos = { x: 50, y: 40 }, set = () => { el.style.setProperty('--tx', pos.x + '%'); el.style.setProperty('--ty', pos.y + '%'); };
      const tx = gsap.quickTo(pos, 'x', { duration: 0.18, ease: 'power3', onUpdate: set }), ty = gsap.quickTo(pos, 'y', { duration: 0.18, ease: 'power3', onUpdate: set });
      set();
      if (matchMedia('(hover: none)').matches) {
        if (!reduce) { el.classList.add('is-lit'); const drift = gsap.timeline({ repeat: -1, yoyo: true, onUpdate: set }).to(pos, { x: 30, y: 30, duration: 3, ease: 'sine.inOut' }).to(pos, { x: 68, y: 52, duration: 3.4, ease: 'sine.inOut' }).to(pos, { x: 45, y: 72, duration: 3, ease: 'sine.inOut' }); cleanups.push(() => drift.kill()); }
        return;
      }
      const move = (e) => { const r = el.getBoundingClientRect(); tx((e.clientX - r.left) / r.width * 100); ty((e.clientY - r.top) / r.height * 100); };
      const on = () => el.classList.add('is-lit'), off = () => el.classList.remove('is-lit');
      el.addEventListener('pointermove', move); el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off);
      cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerenter', on); el.removeEventListener('pointerleave', off); });
    });
    $$('[data-drag]', page).forEach((el) => cleanups.push(dragger(el)));
    if ($('.shelf', page)) cleanups.push(shelf());
    if ($('.toon', page)) cleanups.push(toon());
    if ($('.phone', page)) cleanups.push(phone());
    if ($('.journey', page)) cleanups.push(journey());
    if ($('.street', page)) cleanups.push(streetScene());
    if ($('.jr', page) && !reduce) cleanups.push(svcFloat());
    if ($('.svc-end', page)) cleanups.push(svcNight());
    if ($('.ct', page)) cleanups.push(contactPage());
    if ($('.bio', page) && !reduce) cleanups.push(bioPage());
    // About: the story inks in as you read, the pull quote is drawn across, the CV rows open as they arrive,
    // and the one thing you tap (the lens) nudges until it is used
    $$('.pullquote', page).forEach((el) => { if (!reduce) gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 50%', scrub: 0.4 } }); });
    // About: the name rises (intro), the roles take turns, the object types itself in, the photo leans toward
    // the pointer; the story rises line by line; the three sides deal in; the record runs on the same rail as the services
    { const hero = $('.abh', page);
      if (hero) {
        const roles = $$('[data-role]', hero); let r = 0;
        const turn = () => { roles.forEach((x, k) => x.classList.toggle('is-on', k === r)); r = (r + 1) % roles.length; };
        turn(); if (!reduce) { const t = setInterval(turn, 1600); cleanups.push(() => clearInterval(t)); }
        const lns = $$('.abh__ln', hero), caret = $('.abh__caret', hero);
        if (reduce) lns.forEach((l) => l.classList.add('is-typed'));
        else { const tl = gsap.timeline({ delay: 0.9 }); lns.forEach((l) => { const n = +l.style.getPropertyValue('--n'); tl.fromTo(l, { '--w': 0 }, { '--w': n, duration: Math.max(0.25, n * 0.028), ease: `steps(${n})`, onStart: () => { l.classList.add('is-typing'); l.append(caret); }, onComplete: () => l.classList.add('is-typed') }); }); cleanups.push(() => tl.kill()); }
        const picEl = $('[data-tilt]', hero);
        if (picEl && !reduce && matchMedia('(hover: hover)').matches) {
          const rx = gsap.quickTo(picEl, 'rotationX', { duration: 0.8, ease: 'expo.out' }), ry = gsap.quickTo(picEl, 'rotationY', { duration: 0.8, ease: 'expo.out' });
          const mv = (e) => { const b = picEl.getBoundingClientRect(); ry(((e.clientX - b.left) / b.width - 0.5) * 10); rx(-((e.clientY - b.top) / b.height - 0.5) * 8); };
          const lv = () => { rx(0); ry(0); };
          hero.addEventListener('pointermove', mv); hero.addEventListener('pointerleave', lv);
          cleanups.push(() => { hero.removeEventListener('pointermove', mv); hero.removeEventListener('pointerleave', lv); });
        }
      } }
    $$('[data-rise]', page).forEach((el) => {
      if (reduce) return;
      gsap.fromTo(el, { y: 60, opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { y: 0, opacity: 1, clipPath: 'inset(0 0 -10% 0)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
      $$('em', el).forEach((em, k) => gsap.to(em, { '--hl': 1, duration: 0.8, ease: 'expo.inOut', delay: 0.5 + k * 0.25, scrollTrigger: { trigger: el, start: 'top 70%', once: true } }));
    });
    if (!reduce) $$('.abt__card', page).forEach((c, k) => gsap.fromTo(c, { y: 120, rotation: (k - 1) * 4, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: k * 0.12, scrollTrigger: { trigger: c.parentNode, start: 'top 80%', once: true } }));
    // Contact: the local time in Mombasa, the ways to reach us dealt in one by one, a one-tap copy for the email,
    // and the four steps joined by a line that draws as you read
    { const ck = $$('[data-clock]', page);
      if (ck.length) { const tick = () => ck.forEach((el) => { el.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }) + ' EAT'; }); tick(); const t = setInterval(tick, 20000); cleanups.push(() => clearInterval(t)); } }
    if (!reduce) $$('.ch', page).forEach((ul) => gsap.fromTo($$(':scope > li', ul), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: 0.09, delay: 0.5 }));
    $$('[data-copy]', page).forEach((b) => b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); } catch (e) { const r = document.createRange(); r.selectNodeContents(b.previousElementSibling.querySelector('.ch__v')); const sl = getSelection(); sl.removeAllRanges(); sl.addRange(r); try { document.execCommand('copy'); } catch (e2) {} sl.removeAllRanges(); }
      b.textContent = 'Copied'; b.classList.add('is-done'); clearTimeout(b._t); b._t = setTimeout(() => { b.textContent = 'Copy'; b.classList.remove('is-done'); }, 1800);
    }));
    $$('.route', page).forEach((rt) => {
      const steps = $$('.route__step', rt);
      if (reduce) { steps.forEach((st) => st.classList.add('is-on')); return; }
      const wide = matchMedia('(min-width: 901px)').matches;
      gsap.fromTo($('.route__line i', rt), { [wide ? 'scaleX' : 'scaleY']: 0 }, { [wide ? 'scaleX' : 'scaleY']: 1, ease: 'none', scrollTrigger: { trigger: rt, start: 'top 80%', end: wide ? 'top 35%' : 'bottom 60%', scrub: 0.4 } });
      steps.forEach((st, k) => gsap.fromTo(st, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', delay: wide ? k * 0.18 : 0, onStart: () => st.classList.add('is-on'), scrollTrigger: { trigger: st, start: 'top 90%', once: true } }));
    });
    // Services: the menu inks in column by column; the how-we-work rail fills as you read and each step lights up
    if (!reduce) $$('.smenu__col', page).forEach((col, k) => gsap.fromTo([$('.smenu__top, .pkg__top', col), ...$$('.smenu__list li, .pkg__opt', col), $('.smenu__go, .pkg__go', col)].filter(Boolean), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.035, delay: (k % 3) * 0.08, scrollTrigger: { trigger: col, start: 'top 85%', once: true } }));
    $$('.work__steps', page).forEach((wk) => {
      {
        if (!reduce) gsap.fromTo($('.work__rail i', wk), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: wk, start: 'top 70%', end: 'bottom 60%', scrub: 0.4 } });
        $$('.work__step', wk).forEach((st) => ScrollTrigger.create({ trigger: st, start: 'top 68%', end: 'bottom 30%', onToggle: (s) => { if (s.isActive || s.direction > 0) st.classList.add('is-on'); else if (s.progress === 0) st.classList.remove('is-on'); } }));
        if (reduce) $$('.work__step', wk).forEach((st) => st.classList.add('is-on'));
      } });
    $$('.cvx .job', page).forEach((li) => ScrollTrigger.create({ trigger: li, start: 'top 75%', once: true, onEnter: () => { if ($('.cvx', page).dataset.lensOn !== 'all') return; li.classList.add('is-open'); $('.job__top', li).setAttribute('aria-expanded', 'true'); } }));
    { const lens = $('.cvx__lens', page); if (lens && !reduce) ScrollTrigger.create({ trigger: lens, start: 'top 85%', once: true, onEnter: () => lens.classList.add('is-hint') }); }
    // Services: headings rise out of a fold, chips ink in row by row, the cart repaints for this page
    $$('.pk__title .ws__mask > span, .build__title .ws__mask > span, .bp__name .ws__mask > span, .pillars__title .ws__mask > span, .faq__title .ws__mask > span, .how__title .ws__mask > span', page).forEach((el) => { if (!reduce) gsap.fromTo(el, { yPercent: 108 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }); });
    $$('.bl, .pk__grid, .pillars__list', page).forEach((el) => { if (!reduce) gsap.fromTo($$(':scope > .bp, .pk__card, .pillars__row', el), { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.035, scrollTrigger: { trigger: el, start: 'top 80%' } }); });
    if ($('[data-tray]', page)) cartPaint();
    $$('.cvx__title .ws__mask > span', page).forEach((el) => { if (!reduce) gsap.fromTo(el, { yPercent: 108 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }); });
    if ($('.spread', page)) { cleanups.push(spreads()); if (!reduce) cleanups.push(frontSpreads()); }
    if ($('.np', page)) cleanups.push(frontPage());
    ScrollTrigger.refresh();
    // images and fonts landing late change the page height; re-measure so the scroll scenes stay in step
    let rt; const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 150); });
    ro.observe(page); cleanups.push(() => { ro.disconnect(); clearTimeout(rt); });
  }

  /* drag-to-scroll with inertia; works for carousels and the shelf */
  function dragger(wrap) {
    const track = wrap.firstElementChild;
    let x = 0, target = 0, startX = 0, startT = 0, down = false, moved = 0, lastX = 0, v = 0;
    const max = () => Math.min(0, wrap.clientWidth - track.scrollWidth - 0);
    const onDown = (e) => { down = true; moved = 0; startX = lastX = e.clientX; startT = target; v = 0; wrap.classList.add('is-dragging'); };
    const onMove = (e) => {
      if (!down) return;
      const dx = e.clientX - startX; moved = Math.max(moved, Math.abs(dx));
      v = e.clientX - lastX; lastX = e.clientX;
      target = startT + dx * 1.2;
    };
    const onUp = () => {
      if (!down) return; down = false; wrap.classList.remove('is-dragging');
      target += v * 14;
      $$('a', track).forEach((a) => (a.dataset.dragged = moved > 6 ? '1' : '0'));
      setTimeout(() => $$('a', track).forEach((a) => (a.dataset.dragged = '0')), 50);
    };
    const onWheel = (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) { target -= e.deltaX; e.preventDefault(); } };
    wrap.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    wrap.addEventListener('wheel', onWheel, { passive: false });
    wrap.addEventListener('dragstart', (e) => e.preventDefault());
    const loop = () => {
      target = Math.max(max(), Math.min(0, target));
      x += (target - x) * 0.1;
      track.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
      // cards skew a touch with speed
      const skew = Math.max(-6, Math.min(6, (target - x) * 0.02));
      track.style.setProperty('--skew', skew);
      track.querySelectorAll('.card').forEach((c) => (c.style.transform = `skewX(${skew}deg)`));
    };
    gsap.ticker.add(loop);
    return () => { gsap.ticker.remove(loop); window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }

  /* the studio cartoon: a looping little film of two characters, drawn in boiling ink,
     plus a word that cycles underneath (after Hello Monday's home hero) */
  function toon() {
    const root = $('.toon', page), q = (s) => $(s, root);
    const word = q('.toon__word'), words = word ? word.dataset.words.split('|') : [];
    const ink = q('.toon__ink');
    let w = 0;
    // hand-drawn jitter: the whole drawing shifts a hair a few times a second, like cel animation
    const boil = setInterval(() => !reduce && gsap.set(ink, { x: gsap.utils.random(-0.8, 0.8), y: gsap.utils.random(-0.6, 0.6), rotate: gsap.utils.random(-0.25, 0.25), svgOrigin: '300 220' }), 125);
    const cycle = setInterval(() => {
      if (!word) return;
      w = (w + 1) % words.length;
      gsap.to(word, { opacity: 0, duration: 0.25, onComplete: () => { word.textContent = words[w]; gsap.to(word, { opacity: 1, duration: 0.35 }); } });
    }, 2200);
    if (reduce) return () => { clearInterval(boil); clearInterval(cycle); };

    const READ_L = 'M212 182 Q190 180 178 165', READ_R = 'M246 182 Q285 180 302 165';
    const LOW_L = 'M212 182 Q192 205 178 225', LOW_R = 'M246 182 Q285 205 302 225';
    const HER_DOWN = 'M383 184 Q396 212 398 240', HER_UP = 'M383 184 Q402 160 404 128';
    const HER_L = 'M357 184 Q344 212 342 240', HER_HOLD = 'M357 184 Q336 176 306 160';
    const UP_L = 'M212 162 Q196 130 186 100', UP_R = 'M248 162 Q264 130 274 100';
    const DN_L = 'M212 162 Q198 198 196 234', DN_R = 'M248 162 Q262 198 264 234';
    const WIDE_L = 'M212 162 Q186 160 160 150', WIDE_R = 'M248 162 Q274 160 300 150';
    const BEAR_L = 'M448 196 Q426 232 440 270', BEAR_LIFT = 'M448 196 Q426 160 436 120';
    const K0 = 100 / 682; // the pool photo, shrunk to fit the frame she holds up

    // every piece in its opening pose; the loop ends by putting them all back here
    const home = (tl, t) => {
      const set = (sel, v) => (tl ? tl.set(q(sel), v, t) : gsap.set(q(sel), v));
      set('.toon__him', { opacity: 1 }); set('.toon__her', { opacity: 1, x: 0, y: 0, rotate: 0, scaleX: 1 });
      set('.toon__ground', { opacity: 1 }); set('.toon__stool', { opacity: 1, rotate: 0 });
      set('.toon__paper', { scaleX: 1, scaleY: 1, opacity: 1, y: 0 });
      set('.toon__armL', { attr: { d: READ_L } }); set('.toon__armR', { attr: { d: READ_R } });
      set('.toon__hishead', { x: 0, rotate: 0 }); set('.toon__herhead', { x: 0, rotate: 0 });
      set('.toon__herArmL', { attr: { d: HER_L } }); set('.toon__herArmR', { attr: { d: HER_DOWN } });
      set('.toon__bang', { scale: 0 }); set('.toon__plane', { x: 0, y: 0, rotate: 0, scale: 0, opacity: 0 });
      set('.toon__stand', { opacity: 0, x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 });
      set('.toon__sArmL', { attr: { d: DN_L } }); set('.toon__sArmR', { attr: { d: DN_R } }); set('.toon__shead', { x: 0, rotate: 0 });
      set('.toon__bear', { opacity: 0, x: 330, rotate: 0 }); set('.toon__bearArmL', { attr: { d: BEAR_LIFT } }); set('.toon__bearArmR', { rotate: 0 });
      set('.toon__bearPlane', { opacity: 1 }); set('.toon__bonk', { scale: 0 });
      set('.toon__rays', { opacity: 0, rotate: 0 }); set('.toon__notes', { opacity: 0 });
      set('.toon__frame', { opacity: 0, scale: 0 }); set('.toon__flash', { opacity: 0 });
      set('.toon__photo', { opacity: 0, scale: K0 }); set('.toon__photoBg', { opacity: 1 }); set('.toon__splash', { opacity: 0, y: 0 });
    };
    gsap.set(q('.toon__leaf'), { svgOrigin: '240 158' });
    gsap.set(q('.toon__paper'), { svgOrigin: '240 158' });
    gsap.set(q('.toon__her'), { svgOrigin: '370 338' });
    gsap.set(q('.toon__bang'), { svgOrigin: '394 120' });
    gsap.set(q('.toon__plane'), { svgOrigin: '240 150' });
    gsap.set(q('.toon__stand'), { svgOrigin: '230 338' });
    gsap.set(q('.toon__stool'), { svgOrigin: '264 338' });
    gsap.set(q('.toon__bear'), { svgOrigin: '500 338' });
    gsap.set(q('.toon__bearArmR'), { svgOrigin: '552 196' });
    gsap.set(q('.toon__bonk'), { svgOrigin: '574 72' });
    gsap.set(q('.toon__rays'), { svgOrigin: '300 210' });
    gsap.set(q('.toon__frame'), { svgOrigin: '230 123' });
    gsap.set(q('.toon__flash'), { svgOrigin: '230 123' });
    gsap.set(q('.toon__photo'), { svgOrigin: '218 111.5' });
    gsap.set(q('.toon__splash'), { svgOrigin: '420 300' });
    gsap.set(q('.toon__flood'), { y: 420 });
    home(null);

    // later scenes must not paint their start state over the first one, so nothing renders before its time
    const tl = gsap.timeline({ repeat: -1, defaults: { immediateRender: false } });
    // 1. reading the paper; she leans in to peek, he turns a page
    tl.to(q('.toon__her'), { rotate: -7, duration: 0.7, ease: 'power2.inOut' }, 0.4)
      .to(q('.toon__leaf'), { scaleX: -1, duration: 0.5, ease: 'power2.inOut' }, 0.9)
      .set(q('.toon__leaf'), { scaleX: 1 }, 1.7)
      .to(q('.toon__leaf'), { scaleX: -1, duration: 0.5, ease: 'power2.inOut' }, 1.8)
      .set(q('.toon__leaf'), { scaleX: 1 }, 2.6)
      // he lowers the paper, she straightens up with an idea
      .to(q('.toon__her'), { rotate: 0, duration: 0.5, ease: 'back.out(2)' }, 2.6)
      .to(q('.toon__paper'), { y: 60, duration: 0.5, ease: 'power2.inOut' }, 2.8)
      .to(q('.toon__armL'), { attr: { d: LOW_L }, duration: 0.5, ease: 'power2.inOut' }, 2.8)
      .to(q('.toon__armR'), { attr: { d: LOW_R }, duration: 0.5, ease: 'power2.inOut' }, 2.8)
      .to(q('.toon__hishead'), { x: 5, rotate: 6, svgOrigin: '228 160', duration: 0.3 }, 3.2)
      .to(q('.toon__herArmR'), { attr: { d: HER_UP }, duration: 0.35, ease: 'back.out(2)' }, 3.4)
      .to(q('.toon__bang'), { scale: 1, duration: 0.35, ease: 'back.out(3)' }, 3.5)
      .to(q('.toon__herhead'), { rotate: -6, svgOrigin: '370 165', duration: 0.2, yoyo: true, repeat: 3 }, 3.6)
      // he folds the paper into a plane and throws it clean off the page
      .to(q('.toon__bang'), { scale: 0, duration: 0.2 }, 4.6)
      .to(q('.toon__herArmR'), { attr: { d: HER_DOWN }, duration: 0.4 }, 4.6)
      .to(q('.toon__paper'), { scaleX: 0.15, scaleY: 0.3, y: 0, opacity: 0, duration: 0.4, ease: 'power3.in' }, 4.7)
      .to(q('.toon__armL'), { attr: { d: READ_L }, duration: 0.4 }, 4.7)
      .to(q('.toon__armR'), { attr: { d: READ_R }, duration: 0.4 }, 4.7)
      .to(q('.toon__plane'), { scale: 1, opacity: 1, duration: 0.2 }, 5.0)
      .to(q('.toon__armR'), { attr: { d: 'M246 182 Q280 150 310 120' }, duration: 0.18, ease: 'power3.out' }, 5.25)
      .to(q('.toon__plane'), { keyframes: [
        { x: 120, y: -70, rotate: -12, duration: 0.45, ease: 'none' },
        { x: 260, y: -110, rotate: 2, duration: 0.4, ease: 'none' },
        { x: 400, y: -80, rotate: 14, duration: 0.35, ease: 'none' },
      ] }, 5.3)
      .to(q('.toon__hishead'), { x: 8, rotate: -10, duration: 0.6 }, 5.3)
      .to(q('.toon__herhead'), { rotate: -14, x: 4, duration: 0.6 }, 5.4)
      .to(q('.toon__armR'), { attr: { d: READ_R }, duration: 0.5 }, 5.8)
      .set(q('.toon__plane'), { opacity: 0 }, 6.5)

    // 2. offstage: bonk! a bear walks in holding the plane. he leaps off the stool, she freezes
      .fromTo(q('.toon__bonk'), { scale: 0, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.3, ease: 'back.out(4)' }, 6.7)
      .to(q('.toon__her'), { rotate: -5, duration: 0.15, yoyo: true, repeat: 1 }, 6.75)
      .to(q('.toon__bonk'), { scale: 0, duration: 0.2 }, 7.3)
      .set(q('.toon__bear'), { opacity: 1 }, 7.1)
      .to(q('.toon__bear'), { x: 0, duration: 1.4, ease: 'power1.out' }, 7.1)
      .fromTo(q('.toon__bear'), { rotate: -3 }, { rotate: 3, duration: 0.2, yoyo: true, repeat: 6, ease: 'sine.inOut' }, 7.1)
      .to(q('.toon__bear'), { rotate: 0, duration: 0.2 }, 8.5)
      // he jumps up: squash, stretch, land; the stool goes over
      .set(q('.toon__him'), { opacity: 0 }, 7.7)
      .set(q('.toon__stand'), { opacity: 1, x: -50 }, 7.7)
      .to(q('.toon__stand'), { keyframes: [
        { scaleX: 1.25, scaleY: 0.6, y: 0, duration: 0 },
        { scaleX: 0.88, scaleY: 1.18, y: -40, duration: 0.18, ease: 'power2.out' },
        { scaleX: 1, scaleY: 1, y: 0, duration: 0.22, ease: 'power2.in' },
        { scaleX: 1.1, scaleY: 0.9, duration: 0.08 },
        { scaleX: 1, scaleY: 1, duration: 0.15 },
      ] }, 7.7)
      .to(q('.toon__sArmL'), { attr: { d: UP_L }, duration: 0.15, yoyo: true, repeat: 1 }, 7.7)
      .to(q('.toon__sArmR'), { attr: { d: UP_R }, duration: 0.15, yoyo: true, repeat: 1 }, 7.7)
      .to(q('.toon__stool'), { rotate: 84, duration: 0.6, ease: 'bounce.out' }, 7.75)
      .to(q('.toon__bang'), { scale: 1, duration: 0.3, ease: 'back.out(3)' }, 7.8)
      .to(q('.toon__her'), { rotate: -10, duration: 0.25, ease: 'back.out(3)' }, 7.8)
      .to(q('.toon__her'), { x: 2, duration: 0.05, yoyo: true, repeat: 9 }, 8.05)
      .to(q('.toon__herhead'), { x: 0, rotate: 0, duration: 0.3 }, 7.8)
      // the bear lets the plane go, then waves hello
      .set(q('.toon__bearPlane'), { opacity: 0 }, 8.7)
      .set(q('.toon__plane'), { opacity: 1, scale: 1, x: 198, y: -34, rotate: 0 }, 8.7)
      .to(q('.toon__plane'), { x: -360, y: -250, rotate: -24, duration: 1.3, ease: 'power1.in' }, 8.7)
      .to(q('.toon__bearArmL'), { attr: { d: BEAR_L }, duration: 0.35 }, 8.8)
      .to(q('.toon__bearArmR'), { rotate: -70, duration: 0.3, yoyo: true, repeat: 3 }, 9.1)
      .to(q('.toon__bang'), { scale: 0, duration: 0.2 }, 9.4)
      .to(q('.toon__her'), { rotate: 0, x: 0, duration: 0.4, ease: 'back.out(2)' }, 9.4)
      .to(q('.toon__sArmR'), { attr: { d: UP_R }, duration: 0.25, yoyo: true, repeat: 3 }, 9.5)

    // 3. the bear starts humming, the room lights up and everyone dances
      .to(q('.toon__rays'), { opacity: 1, duration: 0.5 }, 10.5)
      .to(q('.toon__rays'), { rotate: 60, duration: 4.6, ease: 'none' }, 10.5)
      .to(q('.toon__notes'), { opacity: 1, duration: 0.2 }, 10.5)
      .fromTo(q('.toon__notes').children, { y: 0 }, { y: -60, duration: 1.4, stagger: 0.25, ease: 'none', repeat: 2 }, 10.5)
      .fromTo(q('.toon__bear'), { rotate: 0 }, { keyframes: [{ rotate: -6, duration: 0.25 }, { rotate: 6, duration: 0.5, repeat: 7, yoyo: true, ease: 'sine.inOut' }, { rotate: 0, duration: 0.25 }] }, 10.6)
      .to(q('.toon__stand'), { y: -12, duration: 0.25, yoyo: true, repeat: 15, ease: 'sine.inOut' }, 10.7)
      .to(q('.toon__stand'), { x: 0, duration: 2, ease: 'sine.inOut' }, 10.7)
      .to(q('.toon__sArmL'), { attr: { d: UP_L }, duration: 0.25, yoyo: true, repeat: 15 }, 10.7)
      .to(q('.toon__sArmR'), { attr: { d: UP_R }, duration: 0.25, yoyo: true, repeat: 15 }, 10.95)
      .to(q('.toon__her'), { y: -10, duration: 0.25, yoyo: true, repeat: 15, ease: 'sine.inOut' }, 10.8)
      .to(q('.toon__herArmR'), { attr: { d: HER_UP }, duration: 0.3, yoyo: true, repeat: 9 }, 10.8)
      .to(q('.toon__her'), { scaleX: -1, duration: 0.35, yoyo: true, repeat: 1, ease: 'power2.inOut' }, 12.3)
      .to(q('.toon__notes'), { opacity: 0, duration: 0.3 }, 14.4)
      .to(q('.toon__rays'), { opacity: 0, duration: 0.4 }, 14.7)

    // 4. "everybody in!" she lifts a frame for a picture; the bear squeezes in; flash
      .to(q('.toon__her'), { x: -48, duration: 0.6, ease: 'power2.inOut' }, 15.0)
      .to(q('.toon__herArmL'), { attr: { d: HER_HOLD }, duration: 0.4 }, 15.4)
      .to(q('.toon__frame'), { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 15.55)
      .to(q('.toon__bear'), { x: -50, rotate: -8, duration: 0.6, ease: 'power2.inOut' }, 15.5)
      .to(q('.toon__shead'), { rotate: -8, svgOrigin: '230 140', duration: 0.3 }, 16.0)
      .to(q('.toon__sArmR'), { attr: { d: 'M248 162 Q270 150 262 128' }, duration: 0.3 }, 16.0)
      .to(q('.toon__whiteout'), { opacity: 1, duration: 0.1, ease: 'power2.in' }, 16.6)
      .fromTo(q('.toon__flash'), { opacity: 1, scale: 0.6 }, { scale: 1.6, duration: 0.3 }, 16.6)
      // the flash develops the picture: their pool day is in the frame
      .set(q('.toon__frame'), { opacity: 0 }, 16.75)
      .set(q('.toon__photo'), { opacity: 1 }, 16.75)
      .set(q('.toon__flash'), { opacity: 0 }, 16.9)
      .to(q('.toon__whiteout'), { opacity: 0, duration: 0.6, ease: 'power2.out' }, 16.8)
      .to(q('.toon__swimArm'), { rotate: -20, svgOrigin: '486 298', duration: 0.25, yoyo: true, repeat: 3 }, 17.3)
      // ...and we push straight through the frame into it
      .to(q('.toon__photo'), { scale: 1, duration: 1.3, ease: 'expo.in' }, 17.6);

    // 5. inside the picture: he drops in from the sky onto the diving board and dives
    ['.toon__her', '.toon__bear', '.toon__stool', '.toon__ground'].forEach((s) => tl.set(q(s), { opacity: 0 }, 18.9));
    const board = q('.toon__board');
    gsap.set(board, { svgOrigin: '110 249' });
    tl.set(q('.toon__photoBg'), { opacity: 0 }, 18.9)
      .set(q('.toon__stand'), { x: -60, y: -460, rotate: 0, scaleX: 1, scaleY: 1 }, 18.9)
      .set(q('.toon__shead'), { rotate: 0 }, 18.9)
      .set(q('.toon__sArmR'), { attr: { d: UP_R } }, 18.9)
      .set(q('.toon__sArmL'), { attr: { d: UP_L } }, 18.9)
      // he drops in, the board takes his weight and wobbles back
      .to(q('.toon__stand'), { y: -94, duration: 0.5, ease: 'power3.in' }, 19.0)
      .to(q('.toon__stand'), { keyframes: [{ scaleX: 1.16, scaleY: 0.82, duration: 0.08, ease: 'power2.out' }, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' }] }, 19.5)
      .to(board, { keyframes: [{ rotate: 3, duration: 0.08 }, { rotate: 0, duration: 0.9, ease: 'elastic.out(1, 0.3)' }] }, 19.5)
      .to(q('.toon__sArmL'), { attr: { d: WIDE_L }, duration: 0.4, ease: 'power2.out' }, 19.55)
      .to(q('.toon__sArmR'), { attr: { d: WIDE_R }, duration: 0.4, ease: 'power2.out' }, 19.55)
      .to(q('.toon__swimArm'), { rotate: -20, svgOrigin: '486 298', duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 19.8)
      // finds his balance
      .to(q('.toon__stand'), { keyframes: [{ rotate: 5, duration: 0.35 }, { rotate: -4, duration: 0.4 }, { rotate: 2, duration: 0.35 }, { rotate: 0, duration: 0.3 }], ease: 'sine.inOut' }, 19.9)
      // two steps to the end of the board
      .to(q('.toon__stand'), { x: -20, duration: 0.6, ease: 'sine.inOut' }, 21.3)
      .to(q('.toon__stand'), { y: -98, duration: 0.15, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 21.3)
      .to(q('.toon__sArmL'), { attr: { d: UP_L }, duration: 0.35, ease: 'power2.out' }, 21.95)
      .to(q('.toon__sArmR'), { attr: { d: UP_R }, duration: 0.35, ease: 'power2.out' }, 21.95)
      // one bounce to load the board, then the launch
      .to(q('.toon__stand'), { keyframes: [
        { y: -89, scaleY: 0.9, duration: 0.16, ease: 'power2.in' },
        { y: -132, scaleY: 1.05, duration: 0.26, ease: 'power2.out' },
        { y: -88, scaleY: 0.88, duration: 0.24, ease: 'power2.in' },
      ] }, 22.15)
      .to(board, { keyframes: [{ rotate: 2.5, duration: 0.16, ease: 'power2.in' }, { rotate: -1, duration: 0.26 }, { rotate: 4, duration: 0.24, ease: 'power2.in' }, { rotate: 0, duration: 1, ease: 'elastic.out(1, 0.25)' }] }, 22.15);

    // the dive: one continuous arc, his body turning to follow the direction he is moving, head first into the water
    const stand = q('.toon__stand');
    const P0 = [210, 150], P1 = [330, 20], P2 = [420, 480];
    const bez = (p, i) => (1 - p) * (1 - p) * P0[i] + 2 * (1 - p) * p * P1[i] + p * p * P2[i];
    const pose = (p) => {
      const tx = 2 * (1 - p) * (P1[0] - P0[0]) + 2 * p * (P2[0] - P1[0]);
      const ty = 2 * (1 - p) * (P1[1] - P0[1]) + 2 * p * (P2[1] - P1[1]);
      const r = (Math.atan2(tx, -ty) * 180) / Math.PI * Math.min(1, p / 0.12);
      return { x: bez(p, 0), y: bez(p, 1), r };
    };
    let hit = 0.8; // where his head meets the water
    for (let p = 0.4; p <= 1; p += 0.005) { const o = pose(p); if (o.y - 118 * Math.cos((o.r * Math.PI) / 180) >= 300) { hit = p; break; } }
    const DIVE = 22.81, DUR = 1.05, SPLASH = DIVE + hit * DUR, F = SPLASH + 0.75;
    const arc = { p: 0 }, ripples = root.querySelectorAll('.toon__ripple');
    gsap.set(ripples, { svgOrigin: '420 301' });
    tl.to(arc, { p: 1, duration: DUR, ease: 'none', onUpdate: () => {
      const o = pose(arc.p);
      stand.setAttribute('transform', `translate(${(o.x - 230).toFixed(2)} ${(o.y - 240).toFixed(2)}) rotate(${o.r.toFixed(2)} 230 240)`);
    } }, DIVE)
      .to(q('.toon__sArmL'), { attr: { d: 'M212 162 Q206 128 214 96' }, duration: 0.3 }, DIVE)
      .to(q('.toon__sArmR'), { attr: { d: 'M248 162 Q254 128 246 96' }, duration: 0.3 }, DIVE)
      .set(stand, { opacity: 0 }, DIVE + DUR)
      .fromTo(q('.toon__splash'), { opacity: 1, scale: 0.1, y: 0 }, { scale: 1.2, duration: 0.45, ease: 'power3.out' }, SPLASH)
      .to(q('.toon__splash'), { opacity: 0, y: 12, duration: 0.5, ease: 'power1.in' }, SPLASH + 0.4)
      .fromTo(ripples, { opacity: 1, scale: 0.3 }, { opacity: 0, scale: 2.4, duration: 1.3, stagger: 0.3, ease: 'power2.out' }, SPLASH)
      .to(q('.toon__swimmer'), { y: -7, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, SPLASH + 0.1)

    // 6. the splash keeps coming: a wave floods the page, then drains away to the newspaper again
      .to(q('.toon__flood'), { y: -20, duration: 0.8, ease: 'power2.in' }, F)
      .fromTo(q('.toon__flood'), { x: -30 }, { x: 30, duration: 0.4, yoyo: true, repeat: 3, ease: 'sine.inOut' }, F)
      .set(q('.toon__splash'), { opacity: 0 }, F + 0.8)
      .set(board, { rotate: 0 }, F + 0.8);
    home(tl, F + 0.9);
    tl.to(q('.toon__flood'), { y: 420, duration: 0.9, ease: 'power2.inOut' }, F + 1.1)
      .set(q('.toon__drips'), { opacity: 1 }, F + 1.6)
      .fromTo(root.querySelectorAll('.toon__drip'), { y: 0, opacity: 1 }, { y: 120, opacity: 0, duration: 0.7, stagger: 0.25, ease: 'power2.in' }, F + 1.6)
      .set(q('.toon__drips'), { opacity: 0 }, F + 2.9)
      .to({}, { duration: 0.3 }, F + 2.9);

    // only play while it is on screen
    const st = ScrollTrigger.create({ trigger: root, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? tl.play() : tl.pause()) });
    return () => { clearInterval(boil); clearInterval(cycle); tl.kill(); st.kill(); };
  }

  /* the studio line: the landline rings every few seconds; hover lifts the receiver a little,
     a click picks it up and spins the dial while the link opens WhatsApp in a new tab */
  function phone() {
    const root = $('.phone', page), q = (s) => $(s, root);
    const hand = q('.phone__handset'), cord = q('.phone__cord'), ring = q('.phone__ring'), body = q('.phone__body');
    const dial = q('.phone__dial'); // the finger wheel turns; the numbers stay put underneath, like the real thing
    gsap.set(hand, { svgOrigin: '300 214' });
    gsap.set(dial, { svgOrigin: '300 352' });
    gsap.set(body, { svgOrigin: '300 462' });
    gsap.set(ring, { svgOrigin: '300 180', opacity: 0 });

    // a coiled cord from the end of the receiver, round the side and into the base, redrawn as the receiver moves
    const END = [176, 446];
    const drawCord = () => {
      const x = gsap.getProperty(hand, 'x'), y = gsap.getProperty(hand, 'y'), r = (gsap.getProperty(hand, 'rotation') * Math.PI) / 180;
      const px = 152 - 300, py = 230 - 214;
      const A = [300 + px * Math.cos(r) - py * Math.sin(r) + x, 214 + px * Math.sin(r) + py * Math.cos(r) + y];
      const C1 = [A[0] - 80, A[1] + 70], C2 = [END[0] - 110, END[1] - 30];
      const bz = (t, i) => (1 - t) ** 3 * A[i] + 3 * (1 - t) ** 2 * t * C1[i] + 3 * (1 - t) * t * t * C2[i] + t ** 3 * END[i];
      let d = '';
      const N = 220, loops = 22;
      for (let k = 0; k <= N; k++) {
        const t = k / N, e = 0.002;
        const tx = bz(Math.min(1, t + e), 0) - bz(Math.max(0, t - e), 0), ty = bz(Math.min(1, t + e), 1) - bz(Math.max(0, t - e), 1);
        const l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
        const ph = t * loops * Math.PI * 2, amp = 7 * Math.min(1, t * 12, (1 - t) * 12);
        const X = bz(t, 0) + nx * amp * Math.sin(ph) + (tx / l) * amp * 0.7 * Math.cos(ph);
        const Y = bz(t, 1) + ny * amp * Math.sin(ph) + (ty / l) * amp * 0.7 * Math.cos(ph);
        d += (k ? 'L' : 'M') + X.toFixed(1) + ' ' + Y.toFixed(1);
      }
      cord.setAttribute('d', d);
    };
    drawCord();
    gsap.ticker.add(drawCord);

    // brrring: the receiver rattles in its cradle, the bell lines pulse
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.8, paused: reduce });
    tl.to(ring, { opacity: 1, duration: 0.08 }, 0)
      .fromTo(ring, { scale: 0.9 }, { scale: 1.08, duration: 0.12, yoyo: true, repeat: 7, ease: 'sine.inOut' }, 0)
      .to(hand, { keyframes: Array.from({ length: 12 }, (_, i) => ({ rotate: i % 2 ? -4 : 4, y: i % 2 ? -4 : -9, duration: 0.07 })).concat([{ rotate: 0, y: 0, duration: 0.15 }]) }, 0)
      .to(body, { keyframes: Array.from({ length: 12 }, (_, i) => ({ rotate: i % 2 ? -0.8 : 0.8, duration: 0.07 })).concat([{ rotate: 0, duration: 0.15 }]) }, 0)
      .to(ring, { opacity: 0, duration: 0.2 }, 0.95)
      .to(hand, { keyframes: Array.from({ length: 12 }, (_, i) => ({ rotate: i % 2 ? -4 : 4, y: i % 2 ? -4 : -9, duration: 0.07 })).concat([{ rotate: 0, y: 0, duration: 0.15 }]) }, 1.5)
      .to(ring, { opacity: 1, duration: 0.08 }, 1.5)
      .to(ring, { opacity: 0, duration: 0.2 }, 2.45);

    let resume, busy = false;
    const enter = () => {
      if (busy) return;
      resume && resume.kill(); tl.pause();
      gsap.to(ring, { opacity: 0, duration: 0.2, overwrite: 'auto' });
      gsap.to(body, { rotate: 0, duration: 0.2, overwrite: 'auto' });
      gsap.to(hand, { x: 0, y: -22, rotate: -5, duration: 0.5, ease: 'back.out(2)', overwrite: 'auto' });
      gsap.to(dial, { rotate: 18, duration: 0.6, ease: 'power2.out', overwrite: 'auto' });
    };
    const leave = () => {
      if (busy) return;
      gsap.to(hand, { x: 0, y: 0, rotate: 0, duration: 0.6, ease: 'bounce.out', overwrite: 'auto' });
      gsap.to(dial, { rotate: 0, duration: 0.8, ease: 'power2.inOut', overwrite: 'auto' });
      resume = gsap.delayedCall(1.4, () => !reduce && tl.restart());
    };
    // picking up: the receiver swings up to the ear, the dial spins and whirrs back
    const click = () => {
      busy = true; resume && resume.kill(); tl.pause();
      gsap.timeline({ onComplete: () => { busy = false; leave(); } })
        .to(hand, { x: -110, y: -150, rotate: -32, duration: 0.6, ease: 'power3.out', overwrite: 'auto' }, 0)
        .to(dial, { rotate: 160, duration: 0.45, ease: 'power2.out', overwrite: 'auto' }, 0.1)
        .to(dial, { rotate: 0, duration: 1.1, ease: 'power1.inOut' }, 0.6)
        .to(hand, { x: 0, y: 0, rotate: 0, duration: 0.7, ease: 'bounce.out' }, 2.2);
    };
    root.addEventListener('pointerenter', enter);
    root.addEventListener('pointerleave', leave);
    root.addEventListener('click', click);
    return () => {
      tl.kill(); resume && resume.kill(); gsap.ticker.remove(drawCord);
      root.removeEventListener('pointerenter', enter); root.removeEventListener('pointerleave', leave); root.removeEventListener('click', click);
    };
  }

  /* bookshelf hover: lift the book, float its cover next to the cursor */
  function shelf() {
    const preview = $('#book-preview'), pimg = $('img', preview);
    const px = gsap.quickTo(preview, 'x', { duration: 0.5, ease: 'power3' });
    const py = gsap.quickTo(preview, 'y', { duration: 0.5, ease: 'power3' });
    const move = (e) => { px(e.clientX + 24); py(e.clientY - 180); };
    window.addEventListener('pointermove', move);
    $$('.book:not(.book--filler)', page).forEach((b) => {
      const p = S.projects.find((x) => x.slug === b.dataset.slug);
      b.addEventListener('pointerenter', () => {
        pimg.src = p.cover;
        gsap.to(b, { y: -36, duration: 0.5, ease: 'expo.out' });
        gsap.to(preview, { opacity: 1, scale: 1, rotate: -3, duration: 0.4 });
      });
      b.addEventListener('pointerleave', () => {
        gsap.to(b, { y: 0, rotate: 0, duration: 0.6, ease: 'expo.out' });
        gsap.to(preview, { opacity: 0, scale: 0.9, rotate: 0, duration: 0.3 });
      });
    });
    gsap.from($$('.book', page), { y: '110%', duration: 1.2, stagger: 0.06, ease: 'expo.out', delay: 0.4 });
    return () => window.removeEventListener('pointermove', move);
  }

  go(parse(location.hash));
})();

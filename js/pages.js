/* =========================================================
   Page templates. Each returns an HTML string built from SITE.
   ========================================================= */
(function () {
  const S = window.SITE;
  const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lines = (arr, cls = '') => arr.map((t) => `<span class="line ${cls}"><span>${t}</span></span>`).join('');
  const pad = (n) => String(n).padStart(2, '0');
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  function photo(p, cls = '') {
    if (p.video) return `<div class="media ${cls}"><video data-gl src="${esc(p.video)}" muted loop playsinline autoplay></video></div>`;
    const f = p.frames || [];
    return `<div class="media ${cls}"><img data-gl src="${esc(f[0])}" data-frames="${esc(f.join(','))}" data-fps="${p.fps || 8}" alt="Portrait of ${esc(S.name)}"></div>`;
  }
  const yrOf = (t) => (String(t || '').match(/\d{4}/) || [''])[0];
  const img = (src, alt, extra = '') => `<div class="media"><img data-gl ${extra} src="${esc(src)}" alt="${esc(alt)}" loading="eager"></div>`;

  const stamp = (text) => `
    <div class="stamp" aria-hidden="true">
      <svg viewBox="0 0 120 120"><defs><path id="c" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs>
      <text font-family="IBM Plex Mono, monospace" font-size="10" letter-spacing="3.2" fill="currentColor"><textPath href="#c">${esc(text)}</textPath></text></svg>
      <span>★</span>
    </div>`;

  const card = (p, i) => `
    <a class="card" href="#/work/${p.slug}" data-cursor="View">
      ${img(p.cover, p.title)}
      <h3 class="card__title">${esc(p.title)}</h3>
      ${(p.offers || []).length ? `<p class="card__tags mono">${p.offers.concat(p.caseStudy ? ['Case study'] : []).map(esc).join(' · ')}</p>` : ''}
    </a>`;

  // the one closing ask, the same on every page: start a project (straight into the brief), or just talk
  const cta = (need = '', title = ['Got an idea?', 'Let’s make it loud.']) => `
    <section class="cta">
      <h2 class="cta__title">${lines(title.map(esc))}</h2>
      <div class="cta__acts">
        <a class="btn" href="#/services" data-cta${need ? ` data-need="${esc(need)}"` : ''}><span>Tell us what you need</span><i aria-hidden="true"></i></a>
        <a class="btn btn--ghost" href="${esc(waLink())}" target="_blank" rel="noopener"><span>Chat on WhatsApp</span><i aria-hidden="true"></i></a>
      </div>
    </section>`;

  // the six things we do, the same boxes on the front page and the Services page. A box opens its list.
  const six = (mode) => `<ol class="six" role="list">${(S.offer ? S.offer.pillars : []).map((p, i) => `<li><${mode === 'a' ? `a href="#/services" data-grp-go="${p.key}"` : `button type="button" data-cho="grp:${p.key}"`} class="six__tile">
      <span class="six__no mono">0${i + 1}</span>
      <b class="six__name">${esc(p.name)}</b>
      <span class="six__line">${esc(p.line)}</span>
      ${mode === 'a' ? '<i class="six__go" aria-hidden="true">→</i>' : `<span class="six__foot mono"><span data-grp-n="${p.key}">${p.services.length} services</span><i aria-hidden="true">→</i></span>`}
    </${mode === 'a' ? 'a' : 'button'}></li>`).join('')}</ol>`;

  // what every ask carries: it is free, it binds you to nothing, and you see the price first
  const assure = () => `<ul class="assure" role="list"><li>Free quote</li><li>No obligation</li><li>Price agreed before anything starts</li>${S.replyPromise ? `<li>Reply ${esc(S.replyPromise)}</li>` : ''}</ul>`;
  // the person who reads the brief, with one client's words beside them
  const founder = () => { const pic = ((S.aboutPortrait || S.portrait).frames || [])[0] || ''; const t = (S.testimonials || [])[2] || (S.testimonials || [])[0];
    return `<figure class="reader"><img src="${esc(pic)}" alt="${esc(S.name)}"><figcaption><b>${esc(S.name)} reads every brief.</b></figcaption></figure>${t ? `<blockquote class="reader__q">“${esc(t.quote)}”<cite>${esc(t.author)}, ${esc(t.country || t.role)}</cite></blockquote>` : ''}`; };
  // what happens after you ask: four plain steps, so nobody wonders what comes next
  const nextSteps = (from = 0) => `<ol class="next" role="list">${[
    ['You tell us', 'what you need, here or on WhatsApp.'],
    ['We reply', `on WhatsApp or email${S.replyPromise ? `, ${esc(S.replyPromise)}` : ''}.`],
    ['We talk', 'for 20 minutes, free, to get it right.'],
    ['You get a price', 'in writing. Nothing starts until you say yes.'],
  ].slice(from).map(([a, b], i) => `<li><b class="next__n mono">${i + 1 + from}</b><span><strong>${a}</strong> ${b}</span></li>`).join('')}</ol>`;
  // the questions people ask before they get in touch, answered in one or two short lines each
  // the six service areas as numbered sheets, shared by the front page and the Services page
  const caps = (max = 99) => { const O = S.offer; return `${O.pillars.slice(0, max).map((p, i) => `
      <section class="spread cap" id="cap-${p.key}" aria-label="${esc(p.title)}">
        <div class="cap__side">
          <p class="cap__kick mono">0${i + 1} / ${esc(p.label)}</p>
          <h2 class="cap__title">${esc(p.title)}</h2>
          <p class="cap__tag">${esc(p.line)}</p>
          <p class="cap__text">${esc(p.text)}</p>
          <a class="btn" href="#brief" data-grp-go="${p.key}"><span>${esc(p.cta)}</span><i aria-hidden="true"></i></a>
        </div>
        <div class="cap__main">
          <ol class="cap__list" role="list">${p.services.map(([t, partner], k) => `<li><span class="mono">0${k + 1}</span>${esc(t)}${partner ? '<sup title="With a licensed partner">*</sup>' : ''}</li>`).join('')}</ol>
          <dl class="cap__facts"><div><dt class="mono">Engagement</dt><dd>${esc(p.kind)}</dd></div><div><dt class="mono">Investment</dt><dd>Quoted to your project’s size</dd></div></dl>
          ${p.services.some((x) => x[1]) ? '<p class="cap__note mono">* Signed off with a licensed advocate or tax agent.</p>' : ''}
        </div>
      </section>`).join('')}`; };
  // 07, the custom package: tick any services from any area, then get them quoted as one package
  const own = () => { const O = S.offer, n = O.pillars.length + 1; return `
        <div class="brief__menu own">
          <div class="cap__side">
            <p class="cap__kick mono">0${n} / Custom Package</p>
            <h2 class="cap__title">Build your own <em>package.</em></h2>
            <p class="cap__tag">Tick what you need. We quote it as one.</p>
            <p class="cap__text">Mix services from any area into one package, sized for your business. Pick as many or as few as you like.</p>
            <p class="own__sum"><span class="mono">Your package</span><b data-own-n>0</b> <span data-own-w>services</span></p>
            <button type="button" class="btn" data-own-go><span>Get my package quoted</span><i aria-hidden="true"></i></button>
            <p class="own__alt">Something not on the list? <button type="button" data-build="custom">Tell us about it</button>.</p>
          </div>
          <div class="own__list">${O.pillars.map((p, i) => `
            <fieldset class="own__grp"><legend class="mono">0${i + 1} · ${esc(p.label)}</legend>${p.services.map(([t]) => `<label class="pkg__opt"><input type="checkbox" value="${esc(t)}"><span>${esc(t)}</span></label>`).join('')}</fieldset>`).join('')}
            <button type="button" class="btn own__go2" data-own-go><span>Get my package quoted · <b data-own-n>0</b></span><i aria-hidden="true"></i></button>
          </div>
        </div>`; };

  // a carved Old Town (Swahili) door in fine line: a carved frame and lintel, two studded leaves, a centre post with a lotus
  const swahiliDoor = () => {
    const r = (n) => Math.round(n * 10) / 10;
    const L = (x1, y1, x2, y2) => `<line x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" pathLength="1"/>`;
    const R = (x, y, w, h, rx = 0) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"${rx ? ` rx="${rx}"` : ''} pathLength="1"/>`;
    const C = (x, y, rr) => `<circle cx="${r(x)}" cy="${r(y)}" r="${rr}" pathLength="1"/>`;
    const P = (d) => `<path d="${d}" pathLength="1"/>`;
    let wall = '', frame = '', lint = '', left = '', right = '', post = '';
    // wall: a few courses of lime plaster either side, fading out
    for (let y = 20, k = 0; y < 880; y += 58, k++) {
      wall += L(-260, y, 90, y) + L(510, y, 860, y);
      for (let x = -240 + (k % 2) * 60; x < 60; x += 120) wall += L(x, y, x, y + 58);
      for (let x = 600 + (k % 2) * 60; x < 860; x += 120) wall += L(x, y, x, y + 58);
    }
    // jambs: a rope band outside, a chain of rings inside
    for (const [a, b] of [[90, 150], [450, 510]]) {
      frame += R(a, 150, b - a, 700) + L(a + 18, 150, a + 18, 850) + L(b - 18, 150, b - 18, 850);
      const ropeX = a < 300 ? a : b - 18, ringX = a < 300 ? a + 39 : b - 39;
      for (let y = 156; y < 846; y += 11) frame += L(ropeX + 3, y + 8, ropeX + 15, y);
      for (let y = 168; y < 840; y += 19) frame += C(ringX, y, 9);
    }
    // lintel: dentils on top, a band of rosettes between two of lozenges
    lint += R(60, 40, 480, 110) + L(60, 62, 540, 62) + L(60, 128, 540, 128);
    for (let x = 66; x < 534; x += 16) lint += R(x, 44, 9, 12);
    for (let x = 92; x < 520; x += 52) { lint += C(x, 95, 20) + C(x, 95, 5); for (let k = 0; k < 6; k++) { const t = k * Math.PI / 3; lint += P(`M${r(x + 7 * Math.cos(t))} ${r(95 + 7 * Math.sin(t))} Q${r(x + 22 * Math.cos(t + .5))} ${r(95 + 22 * Math.sin(t + .5))} ${r(x + 17 * Math.cos(t))} ${r(95 + 17 * Math.sin(t))}`); } }
    for (let x = 72; x < 532; x += 26) lint += P(`M${x} 136 L${x + 13} 131 L${x + 26} 136 L${x + 13} 141 Z`);
    // the leaves: panels, rails and rows of brass studs
    const leaf = (x0, w) => {
      let s = R(x0, 150, w, 700) + R(x0 + 14, 166, w - 28, 668);
      for (const y of [330, 510, 690]) s += L(x0 + 14, y, x0 + w - 14, y);
      for (let y = 166 + 30; y < 834; y += 90) for (const fx of [0.3, 0.7]) { const cx = x0 + w * fx; s += C(cx, y, 9) + C(cx, y, 4.5) + C(cx, y, 1.4); }
      return s;
    };
    left = leaf(150, 150); right = leaf(300, 150);
    // centre post on the right leaf: a carved zigzag, and a lotus at its foot
    post += R(288, 150, 24, 700);
    let z = 'M294 160'; for (let y = 160, k = 0; y < 760; y += 12, k++) z += ` L${k % 2 ? 294 : 306} ${y + 12}`; post += P(z);
    post += P('M300 838 C282 820 282 792 300 770 C318 792 318 820 300 838 Z') + P('M300 838 C270 832 262 808 270 790 C284 800 294 818 300 838') + P('M300 838 C330 832 338 808 330 790 C316 800 306 818 300 838');
    post += C(300, 760, 5) + C(300, 470, 5) + C(300, 497, 22) + C(300, 497, 17);
    // threshold
    frame += R(70, 850, 460, 26) + R(40, 876, 520, 22) + L(-260, 898, 860, 898);
    return { wall, frame, lint, left, right, post };
  };

  const faq = () => `<section class="spread faq" aria-label="Questions">
      <h2 class="faq__title"><span class="ws__mask"><span>Good questions.</span></span></h2>
      <div class="faq__list">${(S.faq || []).map(([q, a2], i) => `<details class="faq__q"${i ? '' : ' open'}><summary><span>${esc(q)}</span><i aria-hidden="true"></i></summary><p>${esc(a2)}</p></details>`).join('')}</div>
    </section>`;
  const rich = (t) => esc(t).replace(/&lt;(\/?)(em|b)&gt;/g, '<$1$2>');

  // "Tell us what you need": a service menu (hover a service to read what it covers), then an email,
  // then the brief opens in place, asking only the questions for the services picked. Websites lead.
  // Send goes to the studio inbox (Web3Forms) with the client's email as reply-to.
  const chips = (name, list, type = 'checkbox') => list.map((n) => `<label class="chip chip--${type}"><input type="${type}" name="${name}" value="${esc(n)}"><span>${esc(n)}</span></label>`).join('');
  const btn = (label, attrs = '', mod = '') => `<button type="button" class="btn ${mod}" ${attrs}><span>${label}</span><i aria-hidden="true"></i></button>`;
  const brief = (id, menu = '') => {
    const B = S.brief || {}, SV = B.services || [];
    const inds = (S.industries || []).map((x) => x.name).concat('Other');
    // key, question, body, the services it belongs to (comma list), required field
    const q = (key, title, body, show = '', req = '', door = '', tag = show) => `<section class="qx" data-q="${key}"${show ? ` data-show="${show}"` : ''}${req ? ` data-req="${req}"` : ''}${door ? ` data-door="${door}"` : ''} hidden><p class="qx__for mono"><b data-qn>01</b>${tag ? `<span>${esc(tag)}</span>` : ''}</p><h3 class="qx__q">${title}</h3>${body}</section>`;
    // options are short rows with a letter key (A, B, C…); the last one, "Other", opens a line to type on
    const KEYS = 'ABCDEFGHIJKLMNOP';
    const opts = (name, list, type = 'radio', own = true) => `<div class="qx__opts qx__opts--rows" data-type="${type}">${list.concat(own ? ['Other'] : []).map((n, i) => `<label class="chip chip--${type}${n === 'Other' && own ? ' chip--oth' : ''}"><input type="${type}" name="${name}" value="${n === 'Other' && own ? '__other' : esc(n)}"><span><kbd>${KEYS[i]}</kbd>${esc(n)}</span></label>`).join('')}</div>${own ? `<label class="qx__line qx__line--oth" hidden><span class="sr-only">Your answer</span><input type="text" name="${name}__other" maxlength="140" autocomplete="off" enterkeyhint="next"></label>` : ''}`;
    const big = (name, list, type = 'radio') => `<div class="qx__opts qx__opts--rows" data-type="${type}">${list.map(([v, t, sm], i) => `<label class="chip chip--${type} chip--big"><input type="${type}" name="${name}" value="${esc(v)}"><span><kbd>${KEYS[i]}</kbd><em class="opt"><b>${esc(t)}</b>${sm ? `<small>${esc(sm)}</small>` : ''}</em></span></label>`).join('')}</div>`;
    // the call: the next six working days (Mombasa time), a few set times, and how to talk
    const slots = () => {
      const days = [], fmt = (d, o) => d.toLocaleDateString('en-GB', { timeZone: 'Africa/Nairobi', ...o });
      for (let k = 1; days.length < 6 && k < 14; k++) {
        const d = new Date(Date.now() + k * 864e5); if (fmt(d, { weekday: 'short' }) === 'Sun') continue;
        days.push({ iso: d.toLocaleDateString('en-CA', { timeZone: 'Africa/Nairobi' }), wd: fmt(d, { weekday: 'short' }), dm: fmt(d, { day: 'numeric', month: 'short' }) });
      }
      const chip = (name, val, inner, extra = '') => `<label class="chip chip--radio slot"><input type="radio" name="${name}" value="${esc(val)}"${extra}><span>${inner}</span></label>`;
      return `<div class="slots">
        <p class="slots__k mono">Day</p><div class="slots__days">${days.map((d) => chip('callDay', `${d.wd} ${d.dm}`, `<b>${d.wd}</b><i>${d.dm}</i>`, ` data-iso="${d.iso}"`)).join('')}</div>
        <p class="slots__k mono">Time <small>Mombasa time, EAT</small></p><div class="slots__times">${['10:00', '11:30', '14:00', '15:30', '17:00'].map((t) => chip('callTime', t, t)).join('')}</div>
        <p class="slots__k mono">How we meet</p><div class="slots__how">${['Video meeting', 'Phone call', 'WhatsApp call', 'In person, Mombasa'].map((t, k) => chip('callHow', t, t, k ? '' : ' checked')).join('')}</div>
      </div>`;
    };
    // a question answered in your own words, on one line
    const line = (name, label = 'Your answer') => `<label class="qx__line"><span class="sr-only">${label}</span><input type="text" name="${name}" maxlength="200" autocomplete="off" enterkeyhint="next"></label><p class="qx__enter mono">Press Enter ↵ <span>or skip</span></p>`;
    const hint = (t) => `<p class="qx__hint">${t}</p>`;
    // Tailored questions: one short screen for every ticked service, after one shared screen for its area.
    // The questions live in data.js (serviceQuestions, areaQuestions); every one is optional.
    const slug = (t) => String(t).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const subQ = (base, [key, label, kind, list = [], tip = '']) => {
      const name = `${base}__${key}`;
      if (kind === 'text') return `<div class="qsub"><p class="qsub__h" id="${name}-h">${esc(label)}</p><label class="qx__line qx__line--f qsub__line"><span class="sr-only">${esc(label)}</span><input type="text" name="${name}" maxlength="240" autocomplete="off" enterkeyhint="next" placeholder="${esc(tip)}" aria-labelledby="${name}-h"></label></div>`;
      const type = kind === 'many' ? 'checkbox' : 'radio', other = kind === 'many';
      return `<div class="qsub"><p class="qsub__h">${esc(label)}${kind === 'many' ? ' <small>Pick any</small>' : ''}</p>${tip ? `<p class="qsub__tip">${esc(tip)}</p>` : ''}<div class="qx__opts qsub__opts" data-type="${type}" role="group" aria-label="${esc(label)}">${list.concat(other ? ['Other'] : []).map((n) => `<label class="chip chip--${type} qsub__chip${n === 'Other' && other ? ' chip--oth' : ''}"><input type="${type}" name="${name}" value="${n === 'Other' && other ? '__other' : esc(n)}"><span>${esc(n)}</span></label>`).join('')}</div>${other ? `<label class="qx__line qx__line--oth qsub__line" hidden><span class="sr-only">Other: ${esc(label)}</span><input type="text" name="${name}__other" maxlength="140" autocomplete="off" enterkeyhint="next" placeholder="Tell us"></label>` : ''}</div>`;
    };
    const screen = (key, attrs, title, lead, subs, tag) => `<section class="qx qx--svc" data-q="${key}" ${attrs} hidden><p class="qx__for mono"><b data-qn>01</b><span>${esc(tag)}</span></p><h3 class="qx__q">${title}</h3>${lead ? `<p class="qx__hint">${esc(lead)}</p>` : ''}<div class="qsubs">${subs}</div><p class="qx__enter mono">Every question here is optional <span>· Next when you are ready</span></p></section>`;
    const tailored = () => S.offer.pillars.map((p) => {
      const A = (S.areaQuestions || {})[p.key], SQ = S.serviceQuestions || {};
      const area = A ? screen(`area_${p.key}`, `data-area="${p.key}"`, A.title, '', A.qs.map((x) => subQ(`aq_${p.key}`, x)).join(''), p.label) : '';
      return area + p.services.map(([n]) => { const Q = SQ[n]; if (!Q) return '';
        return screen(`svc_${slug(n)}`, `data-svc="${esc(n)}" data-area-of="${p.key}"`, `${esc(n)}<em>.</em>`, Q.lead, Q.qs.map((x) => subQ(`sq_${slug(n)}`, x)).join(''), `${p.label} · your ${n.toLowerCase()}`); }).join('');
    }).join('');
    const field = (name, label, type = 'text', extra = '') => `<label class="qx__line qx__line--f"><span>${label}</span><input name="${name}" type="${type}" ${extra} enterkeyhint="next"></label>`;
    return `
    <section class="brief" id="${id}" data-brief>
      ${menu || `      <div class="brief__menu">
        <header class="pillars__head"><h2 class="doors__title">${lines(['How do you', 'want to start?'])}</h2><p class="pillars__deck">Pick one. Every way ends with a free, written quote.</p></header>
        <ol class="guide" role="list" aria-label="How to get a quote">
          <li>Tick the services you need, or tell us about something custom.</li>
          <li>Answer a few short questions about your business.</li>
          <li>Book a free meeting. Your written quote follows.</li>
        </ol>
        <ol class="six six--3 six--two" role="list">
          <li><button type="button" class="six__tile" data-build="mix"><span class="six__no mono">01</span><b class="six__name">Pick services</b><span class="six__line">Choose only the services you need.</span><span class="six__foot mono"><span>${S.offer.pillars.length} areas · ${S.offer.pillars.reduce((n, p) => n + p.services.length, 0)} services</span><i aria-hidden="true">→</i></span></button></li>
          <li><button type="button" class="six__tile" data-build="custom"><span class="six__no mono">02</span><b class="six__name">Custom build</b><span class="six__line">An app, a platform or a tool that is not on the list.</span><span class="six__foot mono"><span>Scoped and quoted</span><i aria-hidden="true">→</i></span></button></li>
        </ol>
        <p class="doors__alt">A few minutes, one question at a time. Every question is optional. Rather talk? <a href="${esc(waLink())}" target="_blank" rel="noopener">WhatsApp us</a>.</p>
      </div>`}

      <div class="flow" data-quizx hidden aria-label="Project brief">
        <header class="flow__top"><span class="flow__brand mono">${esc(S.studio)} · Your brief</span><span class="flow__count mono" aria-live="polite"></span><button type="button" class="flow__x" data-quiz-close aria-label="Close the brief">✕</button></header>
        <div class="flow__bar" aria-hidden="true"><i></i></div>
        <aside class="flow__side" aria-label="Your progress">
          <p class="flow__side-h">Your brief</p>
          <p class="flow__side-d">A few minutes, one question at a time. Every question is optional. Your written quote follows our meeting.</p>
          <ol class="flow__steps" role="list">${['Your project', 'Your business', 'Your details', 'Your meeting'].map((t, k) => `<li data-st="${k}"><i aria-hidden="true">${k + 1}</i><span>${t}</span></li>`).join('')}</ol>
          <div class="flow__meet"><p class="mono">The meeting</p><p>20 minutes with ${esc(S.name)}, free. By video, phone or WhatsApp call, or in person in ${esc((S.location || '').split(',')[0])}.</p></div>
        </aside>
        <form class="flow__form" data-quiz novalidate onsubmit="return false">
          <div class="flow__main" tabindex="-1" data-lenis-prevent>
          ${q('door', 'How do you want to <em>start?</em>', big('door', [['Pick and mix', 'Pick services', 'Choose only what you need'], ['Custom build', 'Custom build', 'Something not on the list']]), '', 'door')}
          ${q('menu', 'Your <em>services.</em>', `<p class="qx__hint" data-menu-hint>Tick what you need, in any area. Each one you tick gets its own short set of questions.</p><div class="qx__menu">${S.offer.pillars.map((p, k) => `<fieldset class="qmenu" data-area="${p.key}"><legend class="qmenu__h"><span class="mono">0${k + 1}</span><b>${esc(p.name)}</b><small>${esc(p.line)}</small></legend><div class="qmenu__list">${p.services.map((x) => `<label class="chip chip--checkbox qmenu__chip"><input type="checkbox" name="svc_${p.key}" value="${esc(x[0])}"><span>${esc(x[0])}</span></label>`).join('')}</div></fieldset>`).join('')}<fieldset class="qmenu qmenu--own"><legend class="qmenu__h"><span class="mono">+</span><b>Something else</b><small>Not on the list? Add it here.</small></legend><div class="qmenu__list"><label class="chip chip--checkbox qmenu__chip"><input type="checkbox" name="wantCustom" value="Something custom"><span>Something custom, built for us</span></label>${field('bundleAdd', 'Anything else (optional)', 'text', 'maxlength="300" autocomplete="off"')}</div></fieldset></div>`, '', 'menu', '', 'Your services')}
          ${q('mixCustom', 'What else should we <em>build?</em>', `${hint('In your own words: what it is, who uses it and what it should do.')}<label class="qx__write"><span class="sr-only">What else should we build</span><textarea name="extra" rows="5" maxlength="4000" enterkeyhint="next"></textarea></label><p class="qx__enter mono">Enter ↵ to go on <span>· Shift + Enter for a new line</span></p>`, '', 'extra', '', 'Something custom')}

          ${q('custom', 'What should we <em>build?</em>', `${hint('In your own words: what it does, who uses it, and the problem it solves.')}<label class="qx__write"><span class="sr-only">What should we build</span><textarea name="custom" rows="6" maxlength="4000" enterkeyhint="next"></textarea></label><p class="qx__enter mono">Enter ↵ to go on <span>· Shift + Enter for a new line</span></p>`, '', 'custom', 'custom', 'Custom build')}
          ${q('customKind', 'What kind of <em>thing</em> is it?', opts('customKind', ['Website', 'Web app or portal', 'Phone app', 'Office system', 'Automation or bot', 'Not sure']), '', '', 'custom', 'Custom build')}
          ${q('customUsers', 'Who will <em>use it?</em>', `${hint('Pick all that apply.')}${opts('customUsers', ['Our customers', 'Our staff', 'Partners or suppliers', 'Just me'], 'checkbox', false)}`, '', '', 'custom', 'Custom build')}
          ${q('customFeat', 'What must it <em>do?</em>', `${hint('Pick all that apply.')}${opts('customFeat', ['Logins and accounts', 'M-Pesa or card payments', 'Dashboards and reports', 'Bookings', 'SMS, WhatsApp or email alerts', 'Maps and tracking', 'Admin panel', 'Connect to our software'], 'checkbox')}`, '', '', 'custom', 'Custom build')}
          ${q('customHave', 'What do you have <em>already?</em>', opts('customHave', ['Nothing yet', 'An idea on paper', 'Designs or a prototype', 'A system to replace'], 'radio', false), '', '', 'custom', 'Custom build')}
          ${q('customScale', 'How many people will use it <em>at first?</em>', opts('customScale', ['Under 50', '50 to 500', 'Over 500', 'Not sure'], 'radio', false), '', '', 'custom', 'Custom build')}
          ${q('customLink', 'Must it connect to <em>anything?</em>', `${hint('Pick all that apply.')}${opts('customConnect', ['M-Pesa', 'KRA eTIMS', 'QuickBooks or other accounts', 'Our website', 'Nothing', 'Not sure'], 'checkbox')}`, '', '', 'custom', 'Custom build')}

          ${tailored()}

          ${q('biz', 'Tell us about your <em>business.</em>', `${hint('So we can prepare before we meet. Only the first line is needed.')}<div class="qx__fields">${field('industry', 'What does your business do?', 'text', 'maxlength="200" autocomplete="off"')}${field('business', 'Business name (optional)', 'text', 'maxlength="120" autocomplete="organization"')}${field('where', 'Where are you based? (optional)', 'text', 'maxlength="120" autocomplete="address-level2"')}${field('link', 'Website or social page (optional)', 'text', 'maxlength="300" autocomplete="url" inputmode="url"')}</div>`, '', 'industry', '', 'About you')}
          ${q('goal', 'What would make this a <em>success?</em>', `${hint('Pick all that apply.')}${opts('goal', ['More customers', 'Look more professional', 'Sell or take payments online', 'Save time and paperwork', 'See my numbers clearly', 'Launch something new'], 'checkbox')}`, '', '', '', 'Your goal')}
          ${q('idea', 'Anything else we should <em>know?</em>', `${hint('Ideas, links, worries, a budget in mind: whatever helps. Your own words are perfect.')}<label class="qx__write"><span class="sr-only">Anything else</span><textarea name="idea" rows="4" maxlength="4000" enterkeyhint="next"></textarea></label><p class="qx__enter mono">Enter ↵ to go on <span>· Shift + Enter for a new line · or skip</span></p>`)}
          ${q('when', 'When do you <em>need it?</em>', opts('when', ['As soon as possible', 'In 1 to 3 months', 'In 3 to 6 months', 'Just looking'], 'radio', false))}
          ${q('name', 'Where should we send <em>your price?</em>', `<div class="qx__fields">${field('name', 'Your name', 'text', 'autocomplete="name"')}${field('email', 'Email', 'email', 'autocomplete="email" inputmode="email"')}${field('phone', 'WhatsApp (optional)', 'tel', 'autocomplete="tel" inputmode="tel"')}</div>`, '', 'name')}
          ${q('call', 'Book your free <em>meeting.</em>', `<p class="qx__meet mono"><span>20 minutes</span><span>Free, no obligation</span><span>Video, phone or WhatsApp call</span></p>${hint(`A short meeting with ${esc(S.name)} to go through your brief together. Pick a time that suits you and we confirm it by email.`)}${slots()}`, '', 'call', '', 'Your meeting')}
          <section class="qx qx--sum" data-q="sum" hidden><h3 class="qx__q">Here is <em>your brief.</em></h3><p class="qx__hint">Check it, then send. Tap any line to change it.</p><ol class="sum" role="list" data-sum></ol></section>
          <section class="qx qx--done" data-q="done" hidden><h3 class="qx__q">Thank you, <em data-fill="name">friend.</em></h3><p class="qx__lede">Your brief is with ${esc(S.name)}, and your meeting is pencilled in.</p>
            <div class="booked"><p class="booked__k mono">Your meeting</p><p class="booked__when" data-booked>Soon</p><p class="booked__how mono" data-booked-how></p><p class="booked__note">${esc(S.name)} confirms it by email${S.replyPromise ? ` ${esc(S.replyPromise)}` : ''}, with the link or number to use.</p><p class="booked__acts" data-booked-acts></p></div>
            <p class="qx__lede">What happens next:</p>${nextSteps(1)}<p class="qx__lede">Want to talk sooner? <a href="#" data-wa-brief target="_blank" rel="noopener">Send it on WhatsApp</a>.</p></section>
          </div>
          <p class="flow__msg" role="status" aria-live="polite"></p>
          <footer class="flow__nav">
            ${btn('Back', 'data-quiz-back', 'btn--ghost btn--back')}
            <span class="flow__enter mono">press Enter ↵</span>
            ${btn('Next', 'data-quiz-next')}
            ${btn('Send on WhatsApp', 'data-quiz-wa hidden', 'btn--ghost')}
            ${btn('Check my brief', 'data-quiz-sum hidden')}
            ${btn(`Send and book my meeting`, 'data-quiz-send hidden')}
          </footer>
        </form>
      </div>
    </section>`;
  };

  // the free first step
  // The scroll journey: a stick-figure cartoon in the same ink as the studio toon, played by the scroll.
  // Anwar draws a mark and stamps it (brand), carries it across a website, a phone and a map sign (footprint),
  // then feeds a client's paper pile into one dashboard (system). Dashboard marks are illustrative.
  const fig = (cls, who) => `<g class="${cls}"><g class="${cls}__bob">
      <g class="${cls}__legL"><path d="M0 0 L-6 66 L-20 70" stroke-width="5"/></g>
      <g class="${cls}__legR"><path d="M0 0 L6 66 L20 70" stroke-width="5"/></g>
      <path d="M0 2 V-76" stroke-width="5.5"/>
      ${who === 'client' ? '<path d="M-3 -70 L0 -40 L3 -70 Z" fill="var(--ink)" stroke-width="2"/>' : ''}
      <g transform="translate(0 -60)"><g class="${cls}__armL"><path d="M0 0 L-10 26 L-14 52" stroke-width="5"/></g></g>
      <g transform="translate(0 -60)"><g class="${cls}__armR"><path d="M0 0 L10 26 L14 52" stroke-width="5"/>${who === 'me' ? '<g class="f__pencil" transform="translate(14 52) rotate(-20)"><path d="M-5 0 H5 V70 L0 84 L-5 70 Z" fill="var(--paper)" stroke-width="3"/><path d="M-5 70 H5" stroke-width="2"/><path d="M-1.5 78 L0 84 L1.5 78 Z" fill="var(--ink)"/></g>' : ''}</g></g>
      <g class="${cls}__head">
        <circle cx="0" cy="-100" r="25" fill="var(--paper)" stroke-width="3.5"/>
        ${who === 'me'
          ? '<path d="M-25 -104 Q-24 -128 0 -128 Q24 -128 25 -104 Q12 -114 0 -113 Q-12 -114 -25 -104 Z" fill="var(--ink)"/><path d="M-22 -90 Q-20 -71 0 -71 Q20 -71 22 -90 Q14 -82 0 -82 Q-14 -82 -22 -90 Z" fill="var(--ink)" stroke-width="1.5"/><path d="M-6 -80 Q0 -76 6 -80" stroke="var(--paper)" stroke-width="2"/>'
          : '<path d="M-25 -98 Q-24 -128 0 -127 Q24 -128 25 -98 Q12 -114 -14 -108 Z" fill="var(--ink)"/><circle cx="0" cy="-134" r="10" fill="var(--ink)"/><path class="c__mouth" d="M-7 -84 Q0 -80 7 -84"/>'}
        <circle cx="-9" cy="-98" r="2.6" fill="var(--ink)" stroke="none"/><circle cx="9" cy="-98" r="2.6" fill="var(--ink)" stroke="none"/>
      </g>
      ${who === 'me' ? '<g class="f__held" transform="translate(0 -160)"><use href="#jy-mark" x="-34" y="-34" width="68" height="68"/></g>' : '<g class="c__sweat" fill="var(--ink)" stroke="none"><path d="M30 -118 q-5 9 0 12 q5 -3 0 -12 Z"/><path d="M38 -96 q-4 7 0 9 q4 -2 0 -9 Z"/></g>'}
    </g></g>`;
  const mk = (x, y, r, cls) => `<g class="${cls}" transform="translate(${x} ${y})"><use href="#jy-mark" x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}"/></g>`;
  function journey() {
    const acts = [
      ['Brand.', 'A look people remember.'],
      ['Online.', 'Easy to find and trust.'],
      ['Systems.', 'Your business on one screen.'],
    ];
    const steps = Array.from({ length: 12 }, (_, k) => `<g class="jy__step" transform="translate(${400 + k * 52} ${k % 2 ? 646 : 634}) rotate(90) scale(.55)"><use href="#jy-foot" ${k % 2 ? 'transform="scale(-1 1)"' : ''}/></g>`).join('');
    const sheets = Array.from({ length: 9 }, (_, i) => `<g class="jy__sheet"><rect x="${452 + (i % 3) * 3}" y="${484 - i * 11}" width="78" height="9" fill="var(--paper)" stroke-width="2.4"/></g>`).join('');
    return `
      <section class="journey" id="journey" aria-label="How Kampo Co. works: brand, then digital footprint, then the system behind it">
        <div class="journey__stage">
          <div class="journey__caps">${acts.map((a, i) => `<div class="journey__cap" data-act="${i}"><h3>${a[0]}</h3><p>${a[1]}</p></div>`).join('')}
            <div class="journey__cap journey__cap--end" data-act="3"><h3>That is the whole idea.</h3><a class="journey__next" href="#what" data-scroll-to="what"><span>See the six things we do</span><i aria-hidden="true">↓</i></a></div></div>
          <svg class="journey__art" viewBox="0 0 1200 660" aria-hidden="true">
            <defs>
              <symbol id="jy-foot" viewBox="-14 -26 28 52" width="28" height="52" x="-14" y="-26" overflow="visible"><path d="M-7 -6 C-9 -18 -4 -24 1 -24 C7 -24 9 -16 7 -4 C6 4 5 10 -1 10 C-6 10 -6 2 -7 -6 Z"/><path d="M-5 14 C-6 20 -2 25 1 25 C5 25 6 20 5 14 C3 12 -3 12 -5 14 Z"/></symbol>
              <symbol id="jy-mark" viewBox="-150 -150 300 300"><circle r="140" fill="var(--ink)"/><path d="M-50 -100 V100 M-50 12 L58 -100 M-10 -28 L65 100" stroke="var(--paper)" stroke-width="30" fill="none"/></symbol>
            </defs>
            <g fill="none" stroke="var(--ink)" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
              <line class="jy__ground" x1="40" x2="1160" y1="620" y2="620" stroke-width="2"/>

              <!-- act 1: easel, the drawn mark, the stamp -->
              <g class="jy__brand">
                <path class="jy__easel" d="M600 500 L572 620 M900 500 L928 620 M750 500 V620" stroke-width="4"/>
                <rect class="jy__sheetbig" x="560" y="110" width="380" height="390" fill="var(--paper)" stroke-width="3"/>
                <g class="jy__mark" transform="translate(750 300)">
                  <circle class="jy__disc" r="140" fill="var(--ink)" stroke="none"/>
                  <circle class="jy__ring jy__draw" r="140" stroke-width="8"/>
                  <path class="jy__k jy__draw" d="M-50 -100 V100" stroke-width="30" stroke-linecap="butt"/>
                  <path class="jy__k jy__draw" d="M-50 12 L58 -100" stroke-width="30" stroke-linecap="butt"/>
                  <path class="jy__k jy__draw" d="M-10 -28 L65 100" stroke-width="30" stroke-linecap="butt"/>
                </g>
                <g class="jy__spec"><text class="jy__aa" x="580" y="160" fill="var(--ink)" stroke="none">Aa</text>
                  <rect x="846" y="128" width="24" height="24" fill="var(--ink)" stroke="none"/><rect x="876" y="128" width="24" height="24" fill="var(--paper)" stroke-width="2"/><rect x="906" y="128" width="24" height="24" fill="#8a8578" stroke="none"/></g>
                <g class="jy__stamp"><circle cx="750" cy="40" r="34" fill="var(--paper)" stroke-width="4"/><rect x="732" y="72" width="36" height="70" fill="var(--paper)" stroke-width="4"/><rect x="590" y="140" width="320" height="320" rx="14" fill="var(--paper)" stroke-width="5"/><path d="M610 440 H890" stroke-width="10"/></g>
                <g class="jy__bang" stroke-width="4"><path d="M560 90 L530 60 M940 90 L970 60 M540 300 L500 300 M960 300 L1000 300 M560 510 L530 540 M940 510 L970 540"/></g>
              </g>

              <!-- act 2: website, phone, map sign -->
              <g class="jy__foot">
                <g class="jy__web" transform="translate(0 -50)"><rect class="jy__draw" x="400" y="90" width="400" height="240" fill="var(--paper)" stroke-width="3"/><path class="jy__draw" d="M400 118 H800" stroke-width="2"/>
                  <path class="jy__draw" d="M500 160 H640 M500 184 H610 M430 230 H560 M430 252 H540 M430 274 H555" stroke-width="5"/><rect class="jy__draw" x="600" y="210" width="170" height="96" stroke-width="2"/>
                  ${mk(455, 172, 24, 'jy__pop')}</g>
                <g class="jy__phone"><rect class="jy__draw" x="840" y="360" width="130" height="258" rx="20" fill="var(--paper)" stroke-width="3"/><path class="jy__draw" d="M885 376 H925" stroke-width="3"/>
                  <path class="jy__draw" d="M858 500 H950 M858 520 H930 M858 540 H945 M858 580 H900" stroke-width="2.4"/>${mk(905, 440, 34, 'jy__pop')}</g>
                <g class="jy__map"><path class="jy__draw" d="M1100 620 V330" stroke-width="6"/><rect class="jy__draw" x="1010" y="160" width="180" height="170" fill="var(--paper)" stroke-width="3"/>
                  <path class="jy__draw" d="M1010 210 L1060 190 L1110 230 L1190 200" stroke-width="1.6"/>
                  <text class="jy__stars" x="1030" y="300" fill="var(--ink)" stroke="none">★★★★★</text>${mk(1100, 240, 30, 'jy__pop')}</g>
                <g class="jy__walk" fill="var(--ink)" stroke="none">${steps}</g>
              </g>

              <!-- act 3: a client buried in paper; the dashboard eats the pile -->
              <g class="jy__sys">
                ${fig('c', 'client').replace('<g class="c">', '<g class="c" transform="translate(380 515) scale(1.5)">')}
                <path class="jy__desk" d="M270 500 H830 M300 500 V620 M800 500 V620" stroke-width="5"/>
                <rect x="270" y="500" width="560" height="22" fill="var(--paper)" stroke-width="3" class="jy__desk"/>
                <g class="jy__screen"><rect class="jy__draw" x="580" y="290" width="230" height="170" fill="var(--paper)" stroke-width="4"/><path class="jy__draw" d="M695 460 V500 M660 500 H730" stroke-width="5"/>
                  <path class="jy__draw" d="M598 312 H640 M650 312 H692 M702 312 H744" stroke-width="7"/>
                  ${[16, 30, 24, 42, 36, 54].map((h, i) => `<rect class="jy__bar" x="${598 + i * 16}" y="${440 - h}" width="10" height="${h}" fill="var(--ink)" stroke="none"/>`).join('')}
                  <path class="jy__draw jy__line" d="M705 438 C725 430 735 400 750 404 C765 408 775 370 792 356" stroke-width="3.5"/><circle class="jy__dot" cx="792" cy="356" r="6" fill="var(--ink)" stroke="none"/></g>
                <g class="jy__pile">${sheets}</g>
                <g class="jy__joy" stroke-width="3" stroke-dasharray="2 10"><path d="M380 360 L380 300 M330 380 L290 340 M430 380 L470 340 M695 260 V210 M640 270 L610 236 M750 270 L780 236"/></g>
              </g>

              ${fig('f', 'me').replace('<g class="f">', '<g class="f" transform="translate(380 515) scale(1.5)">')}
            </g>
          </svg>
        </div>
      </section>`;
  }

  // The street: the same stick figure walks one street, and at each stop builds one service with his own hands.
  // The scroll drives a camera along one long drawing; the panel on the left names the stop and lists the work.
  const gear = (r, n) => { let d = ''; for (let k = 0; k < n * 2; k++) { const a0 = (k / (n * 2)) * Math.PI * 2, a1 = ((k + 1) / (n * 2)) * Math.PI * 2, R = k % 2 ? r : r + 14;
    d += `${k ? 'L' : 'M'}${(R * Math.cos(a0)).toFixed(1)} ${(R * Math.sin(a0)).toFixed(1)} L${(R * Math.cos(a1)).toFixed(1)} ${(R * Math.sin(a1)).toFixed(1)} `; } return d + 'Z'; };
  const mini = (x, k) => `<g transform="translate(${x} 500)"><g class="st-mini" data-k="${k}"><g class="st-mini__bob">
      <circle cx="0" cy="-80" r="13" fill="var(--paper)" stroke-width="3"/><path d="M0 -67 V-24 M0 -24 L-9 0 M0 -24 L9 0 M0 -56 L-12 -36 M0 -56 L12 -36" stroke-width="3.5"/></g></g></g>`;
  function street() {
    const O = S.offer, P = O.pillars;
    const X = (i) => i * 900;
    const scene = [
      // 01 setup: a certificate on a desk; a giant stamp comes down; the PIN card and the eTIMS slip pop up
      `<path d="M420 384 H790 M440 400 V500 M770 400 V500" stroke-width="5"/><rect x="420" y="380" width="370" height="16" fill="var(--paper)" stroke-width="3"/>
       <rect class="st-draw" x="450" y="150" width="230" height="230" fill="var(--paper)" stroke-width="3"/>
       <text x="565" y="196" text-anchor="middle" class="st-mono st-txt" fill="var(--ink)" stroke="none">CERTIFICATE</text>
       <path class="st-draw" d="M480 214 H650 M480 252 H640 M480 274 H610 M480 296 H630" stroke-width="2.4"/>
       <g class="st-ink" transform="translate(565 330)"><g class="st-ink__in"><circle r="40" stroke="var(--spot)" stroke-width="4"/><circle r="32" stroke="var(--spot)" stroke-width="1.5"/>
         <path d="M-12 -20 V20 M-12 3 L12 -20 M-3 -5 L14 20" stroke="var(--spot)" stroke-width="7" stroke-linecap="butt"/></g></g>
       <g class="st-stamp"><circle cx="565" cy="40" r="24" fill="var(--paper)" stroke-width="4"/><rect x="554" y="62" width="22" height="46" fill="var(--paper)" stroke-width="4"/><rect x="510" y="106" width="110" height="30" rx="6" fill="var(--paper)" stroke-width="4"/></g>
       <g class="st-pop"><rect x="700" y="314" width="78" height="50" rx="4" fill="var(--paper)" stroke-width="3"/><text x="739" y="336" text-anchor="middle" class="st-mono" fill="var(--ink)" stroke="none">KRA PIN</text><path d="M712 350 H766" stroke-width="2"/></g>
       <g class="st-pop"><path d="M712 230 H770 V300 L762 294 L754 300 L746 294 L738 300 L730 294 L722 300 L712 294 Z" fill="var(--paper)" stroke-width="3"/><text x="741" y="252" text-anchor="middle" class="st-mono" fill="var(--ink)" stroke="none">eTIMS</text><path d="M722 266 H760 M722 278 H750" stroke-width="2"/></g>`,
      // 02 brand: a blank shop sign; he paints the name across it, then the colours and the type pop out
      `<path d="M450 240 V500 M750 240 V500" stroke-width="6"/><rect class="st-draw" x="400" y="110" width="400" height="130" fill="var(--paper)" stroke-width="4"/>
       <text x="600" y="196" text-anchor="middle" class="st-sign" fill="var(--ink)" stroke="none" clip-path="url(#st-paint)">YOUR NAME</text>
       <g class="st-roller"><path d="M0 0 V-34" stroke-width="3"/><rect x="-10" y="-60" width="20" height="28" rx="4" fill="var(--paper)" stroke-width="3"/></g>
       <g class="st-pop"><rect x="478" y="290" width="62" height="62" fill="var(--ink)" stroke="none"/></g>
       <g class="st-pop"><rect x="560" y="290" width="62" height="62" fill="var(--paper)" stroke-width="3"/></g>
       <g class="st-pop"><rect x="642" y="290" width="62" height="62" fill="var(--spot)" stroke="none"/></g>
       <g class="st-pop"><text x="600" y="446" text-anchor="middle" class="st-aa" fill="var(--ink)" stroke="none">Aa</text></g>`,
      // 03 web: a screen draws itself on a desk, a phone slides up beside it, a cursor clicks the button
      `<path d="M380 444 H820 M400 456 V500 M800 456 V500" stroke-width="5"/><rect x="380" y="440" width="440" height="14" fill="var(--paper)" stroke-width="3"/>
       <path class="st-draw" d="M580 360 V440 M545 440 H615" stroke-width="5"/>
       <rect class="st-draw" x="400" y="110" width="360" height="250" fill="var(--paper)" stroke-width="3"/><path class="st-draw" d="M400 138 H760" stroke-width="2"/>
       <path class="st-draw" d="M430 180 H580 M430 210 H560 M430 230 H570" stroke-width="7"/><rect class="st-draw" x="600" y="168" width="130" height="112" stroke-width="2"/><path class="st-draw" d="M600 280 L640 230 L670 256 L700 214 L730 280" stroke-width="2"/>
       <rect class="st-btn" x="430" y="270" width="110" height="36" fill="var(--paper)" stroke-width="3"/>
       <g class="st-phone"><rect x="700" y="270" width="96" height="170" rx="14" fill="var(--paper)" stroke-width="3"/><path d="M732 284 H764 M716 330 H780 M716 348 H770 M716 366 H778" stroke-width="2.4"/><rect x="716" y="394" width="40" height="18" fill="var(--spot)" stroke="none"/></g>
       <g class="st-cursor"><path d="M0 0 L0 30 L8 22 L14 36 L20 33 L14 20 L25 20 Z" fill="var(--paper)" stroke-width="2.4"/></g>`,
      // 04 software: two gears start turning, a dashboard on a stand fills with bars and a rising line
      `<g transform="translate(500 250)"><g class="st-gear st-gear--a"><path d="${gear(62, 10)}" fill="var(--paper)" stroke-width="3.5"/><circle r="20" stroke-width="3.5"/><circle r="4" fill="var(--ink)"/></g></g>
       <g transform="translate(608 352)"><g class="st-gear st-gear--b"><path d="${gear(40, 8)}" fill="var(--paper)" stroke-width="3.5"/><circle r="13" stroke-width="3.5"/><circle r="3" fill="var(--ink)"/></g></g>
       <path d="M608 410 V500 M500 326 V500" stroke-width="5"/>
       <path class="st-draw" d="M770 300 V500 M730 500 H810" stroke-width="5"/>
       <rect class="st-draw" x="680" y="150" width="180" height="150" fill="var(--paper)" stroke-width="3.5"/>
       ${[22, 40, 32, 56, 48, 72].map((h, k) => `<rect class="st-bar" x="${700 + k * 22}" y="${284 - h}" width="14" height="${h}" fill="var(--ink)" stroke="none"/>`).join('')}
       <path class="st-draw st-rise" d="M698 220 C730 210 750 190 770 196 C790 202 810 170 842 164" stroke="var(--spot)" stroke-width="3.5"/>`,
      // 05 growth: he lifts a megaphone; people walk in to the open shop; the line climbs
      `<g class="st-mega"><path d="M318 300 L378 272 V338 L318 314 Z" fill="var(--paper)" stroke-width="3.5"/><path d="M318 300 V314" stroke-width="6"/></g>
       <g class="st-waves" stroke-width="3.5"><path d="M398 282 Q412 305 398 328"/><path d="M416 268 Q438 305 416 342"/><path d="M434 254 Q464 305 434 356"/></g>
       <rect class="st-draw" x="560" y="170" width="200" height="330" fill="var(--paper)" stroke-width="4"/><rect class="st-draw" x="560" y="130" width="200" height="40" fill="var(--paper)" stroke-width="4"/>
       <text x="660" y="158" text-anchor="middle" class="st-mono st-open" fill="var(--ink)" stroke="none">OPEN</text>
       <path class="st-draw st-rise" d="M470 120 L520 96 L560 106 L620 60 M600 58 L622 58 L620 80" stroke="var(--spot)" stroke-width="4"/>
       ${[0, 1, 2, 3].map((k) => mini(480 + k * 64, k)).join('')}`,
      // 06 creative: a camera on a tripod; the flash goes; the pictures land on the wall
      `<path d="M560 330 L516 500 M560 330 L604 500 M560 330 V500" stroke-width="4"/>
       <rect class="st-draw" x="496" y="258" width="128" height="76" rx="8" fill="var(--paper)" stroke-width="4"/><rect x="514" y="242" width="34" height="16" fill="var(--paper)" stroke-width="3"/>
       <circle cx="560" cy="296" r="26" fill="var(--paper)" stroke-width="4"/><circle cx="560" cy="296" r="13" fill="var(--ink)" stroke="none"/>
       <g class="st-rays" stroke-width="3.5"><path d="M531 232 L520 206 M538 228 L540 200 M546 232 L560 210 M524 238 L500 228"/></g>
       ${[[660, 110, 100, 76], [790, 120, 70, 92], [680, 214, 84, 64]].map(([x, y, w, h]) => `<g class="st-photo"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--paper)" stroke-width="3"/><path d="M${x + 8} ${y + h - 8} L${x + w * 0.4} ${y + h * 0.45} L${x + w * 0.6} ${y + h * 0.65} L${x + w * 0.75} ${y + h * 0.5} L${x + w - 8} ${y + h - 8}" stroke-width="2"/><circle cx="${x + w * 0.75}" cy="${y + 16}" r="6" stroke-width="2"/></g>`).join('')}`,
    ];
    const cap = (p, i) => `
          <div class="st-cap" data-i="${i}">
            <p class="cap__kick mono">0${i + 1} / ${esc(p.label)}</p>
            <h2 class="st-cap__title">${esc(p.title)}</h2>
            <p class="cap__tag">${esc(p.line)}</p>
            <p class="st-cap__text">${esc(p.text)}</p>
            <ol class="st-cap__list${p.services.length > 5 ? ' st-cap__list--two' : ''}" role="list">${p.services.map(([t, partner]) => `<li>${esc(t)}${partner ? '<sup title="With a licensed partner">*</sup>' : ''}</li>`).join('')}</ol>
            <p class="st-cap__facts mono">${esc(p.kind)} · Quoted to your project’s size${p.services.some((x) => x[1]) ? ' · * With a licensed advocate or tax agent' : ''}</p>
            <a class="btn" href="#brief" data-grp-go="${p.key}"><span>${esc(p.cta)}</span><i aria-hidden="true"></i></a>
          </div>`;
    return `
      <section class="street" id="street" aria-label="The six things we do">
        ${P.map((p, i) => `<i class="street__mark" id="cap-${p.key}" data-i="${i}" aria-hidden="true"></i>`).join('')}
        <div class="street__stage">
          <p class="street__cue mono" aria-hidden="true"><span>Scroll to see every service</span><i>↓</i></p>
          <div class="street__caps">${P.map(cap).join('')}
            <div class="st-cap st-cap--end" data-i="${P.length}">
              <p class="cap__kick mono">0${P.length + 1} / Custom Package</p>
              <h2 class="st-cap__title">Six trades. One team.</h2>
              <p class="st-cap__text">Need a bit of each? Tick the services you want and we quote them as one package.</p>
              <a class="btn" href="#own" data-scroll-to="own" data-label="Custom package"><span>Build your own package</span><i aria-hidden="true"></i></a>
            </div>
          </div>
          <svg class="street__art" viewBox="0 0 900 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs><clipPath id="st-paint"><rect class="st-paint" x="400" y="110" width="0" height="130"/></clipPath></defs>
            <g fill="none" stroke="var(--ink)" stroke-linecap="round" stroke-linejoin="round" stroke-width="3">
              <line x1="-400" x2="${X(P.length) + 400}" y1="500" y2="500" stroke-width="2"/>
              ${Array.from({ length: P.length * 9 + 4 }, (_, k) => `<path d="M${-200 + k * 100} 500 l-14 14" stroke-width="1.6"/>`).join('')}
              ${scene.map((s, i) => `<g class="st-sc" data-i="${i}" transform="translate(${X(i)} 0)">${s}</g>`).join('')}
              ${fig('w', 'me').replace('<g class="w">', '<g class="w" transform="translate(260 416) scale(1.2)">')}
              <rect class="st-flash" x="${X(5) - 200}" y="-200" width="1300" height="960" fill="var(--paper)" stroke="none" opacity="0"/>
            </g>
          </svg>
        </div>
      </section>`;
  }

  const freeCheck = () => { const F = S.freeCheck; if (!F) return ''; return `
    <section class="freecheck rule-t rule-b" data-reveal>
      <h2 class="freecheck__title">${F.title.map((t) => `<span>${esc(t).replace(/&lt;(\/?)em&gt;/g, '<$1em>')}</span>`).join('')}</h2>
      <div class="freecheck__side">
        <p class="freecheck__text">${esc(F.text)}</p>
        <a class="btn freecheck__btn" href="https://wa.me/${esc(S.whatsapp)}?text=${encodeURIComponent(F.whatsappText || '')}" target="_blank" rel="noopener"><span>Book my free check</span><i aria-hidden="true"></i></a>
        <a class="mono freecheck__alt" href="#brief" data-scroll-to="brief" data-need="Not sure yet">Or start a short brief instead</a>
      </div>
    </section>`; };

  // every business in Kenya: a big inline list of sectors; picking one shows what the studio would build
  const industries = () => { const I = S.industries || []; if (!I.length) return ''; return `
    <div class="crosshead rule-t"><h2>For Every Business in Kenya</h2><span class="mono">Pick yours</span></div>
    <section class="sectors" data-sectors>
      <p class="sectors__list">${I.map((x, i) => `<button type="button" class="sector${i ? '' : ' is-on'}" data-sector="${i}" aria-pressed="${i ? 'false' : 'true'}">${esc(x.name)}</button>`).join('<span class="sectors__sep" aria-hidden="true">/</span>')}</p>
      <div class="sectors__panel" aria-live="polite">
        ${I.map((x, i) => `<div class="sector-card${i ? '' : ' is-on'}" data-sector-card="${i}"${i ? ' hidden' : ''}>
          <h3 class="sector-card__name">${esc(x.name)}</h3>
          <dl class="sector-card__grid">
            <div><dt class="mono">Brand</dt><dd>${esc(x.brand)}</dd></div>
            <div><dt class="mono">Digital footprint</dt><dd>${esc(x.web)}</dd></div>
            <div><dt class="mono">System</dt><dd>${esc(x.system)}</dd></div>
          </dl>
          <a class="offer__see mono" href="#brief" data-scroll-to="brief" data-industry="${esc(x.name)}">Start a brief for my ${esc(x.name.toLowerCase())} business <i>→</i></a>
        </div>`).join('')}
      </div>
    </section>`; };

  // a project's case study: before, what was built, after, and real results once they exist
  const caseStudy = (p) => { const c = p.caseStudy; if (!c) return ''; const li = (a) => (a || []).map((t) => `<li>${esc(t)}</li>`).join(''); return `
    <section class="case">
      <p class="mono case__label">Case study · ${esc(p.client || p.title)}</p>
      <div class="case__chapter" data-reveal><h2 class="case__h">Before</h2><div><p class="case__lead">${esc(c.before)}</p><ul class="case__points mono">${li(c.beforePoints)}</ul></div></div>
      <div class="case__chapter" data-reveal><h2 class="case__h"><em>What we built</em></h2><div><p class="case__lead">${esc(c.build)}</p>
        <ol class="case__modules">${(c.modules || []).map((m) => `<li><h3>${esc(m.name)}</h3><p>${esc(m.text)}</p></li>`).join('')}</ol></div></div>
      <div class="case__chapter" data-reveal><h2 class="case__h">After</h2><div><p class="case__lead">${esc(c.after)}</p><ul class="case__points mono">${li(c.afterPoints)}</ul></div></div>
      ${(c.results || []).length ? `<div class="case__results">${c.results.map((r) => `<div><p class="case__num">${esc(r.value)}</p><p class="mono">${esc(r.label)}</p></div>`).join('')}</div>` : ''}
      <a class="case__cta" href="#/" data-return="brief" data-cursor="Start">Want this for <em>your business?</em> →</a>
    </section>`; };

  const imprint = () => `
    <div class="imprint rule-t mono">
      <span>${esc(S.studio)} © ${new Date().getFullYear()}</span>
      <span>${esc(S.location)} · East Africa Time (GMT+3)</span>
      ${S.socials.length ? `<span>${S.socials.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(' · ')}</span>` : ''}
    </div>
    <p class="end-hint mono">End of page · tap the corner to turn ↘</p>`;


  // the studio line: an ink rotary landline. Lifting the receiver opens WhatsApp
  const waLink = () => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(S.whatsappText || '')}`;
  const waPretty = () => String(S.whatsapp).replace(/^(\d{3})(\d{3})(\d{3})(\d+)$/, '+$1 $2 $3 $4');
  function phoneHTML() {
    const holes = Array.from({ length: 10 }, (_, i) => {
      const a = ((-120 + i * 27) * Math.PI) / 180;
      return `<circle cx="${(300 + Math.cos(a) * 62).toFixed(1)}" cy="${(352 + Math.sin(a) * 62).toFixed(1)}" r="12.5" fill="var(--paper)"/>`;
    }).join('');
    const nums = Array.from({ length: 10 }, (_, i) => {
      const a = ((-120 + i * 27) * Math.PI) / 180;
      return `<text x="${(300 + Math.cos(a) * 62).toFixed(1)}" y="${(352 + Math.sin(a) * 62 + 4).toFixed(1)}">${(i + 1) % 10}</text>`;
    }).join('');
    const shade = Array.from({ length: 26 }, (_, i) => `<line x1="${330 + i * 9}" y1="200" x2="${250 + i * 9}" y2="480"/>`).join('');
    return `
      <a class="phone" href="${esc(waLink())}" target="_blank" rel="noopener" data-cursor="Call" aria-label="Call ${esc(S.studio)} on WhatsApp">
        <svg class="phone__art" viewBox="0 0 600 520" aria-hidden="true">
          <defs><clipPath id="phone-body"><path d="M152 462 L196 252 Q206 222 246 218 L354 218 Q394 222 404 252 L448 462 Z"/></clipPath></defs>
          <g class="phone__ink" fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="300" cy="472" rx="200" ry="14" fill="var(--ink)" stroke="none" opacity=".12"/>
            <g class="phone__body">
              <path d="M152 462 L196 252 Q206 222 246 218 L354 218 Q394 222 404 252 L448 462 Z" fill="var(--paper)"/>
              <g clip-path="url(#phone-body)" stroke-width="1.3" opacity=".55">${shade}</g>
              <path d="M152 462 L196 252 Q206 222 246 218 L354 218 Q394 222 404 252 L448 462 Z"/>
              <path d="M140 462 H460" stroke-width="5"/>
              <path d="M222 218 L226 196 H254 L258 218 M342 218 L346 196 H374 L378 218" fill="var(--paper)"/>
              <g class="phone__dial">
                <circle cx="300" cy="352" r="84" fill="var(--paper)"/>
                <circle cx="300" cy="352" r="84" stroke-width="1.4" transform="translate(3 3)" opacity=".4"/>
                ${holes}
              </g>
              <g class="phone__nums" font-family="IBM Plex Mono, monospace" font-size="11" text-anchor="middle" fill="var(--ink)" stroke="none">${nums}</g>
              <circle cx="300" cy="352" r="30" fill="var(--ink)" stroke="none"/>
              <text x="300" y="349" text-anchor="middle" font-family="UnifrakturCook, serif" font-size="13" fill="var(--paper)" stroke="none">${esc(S.studio.replace(/\.$/, ''))}</text>
              <text x="300" y="363" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="7.5" letter-spacing="1" fill="var(--paper)" stroke="none">WHATSAPP</text>
              <path class="phone__stop" d="M366 402 Q376 394 380 384" stroke-width="5"/>
            </g>
            <path class="phone__cord" d="" stroke-width="2.4"/>
            <g class="phone__handset">
              <path d="M150 214 Q146 176 196 166 L404 166 Q454 176 450 214 L430 224 Q426 200 392 196 L208 196 Q174 200 170 224 Z" fill="var(--ink)"/>
              <ellipse cx="166" cy="216" rx="40" ry="17" fill="var(--ink)"/><ellipse cx="434" cy="216" rx="40" ry="17" fill="var(--ink)"/>
              <path d="M206 176 Q300 168 394 176" stroke="var(--paper)" stroke-width="2" opacity=".7"/>
            </g>
            <g class="phone__ring" stroke-width="3">
              <path class="phone__wave" d="M112 150 Q98 180 112 210 M92 136 Q72 180 92 224"/>
              <path class="phone__wave" d="M488 150 Q502 180 488 210 M508 136 Q528 180 508 224"/>
              <text x="300" y="112" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-weight="900" font-size="40" fill="var(--ink)" stroke="none">Brrring!</text>
            </g>
          </g>
        </svg>
      </a>`;
  }

  // "Meanwhile, at the studio": a hand-drawn ink cartoon of two characters looping little scenes,
  // with a word underneath that cycles through the services (after Hello Monday's home hero)
  function toonHTML() {
    const stripes = Array.from({ length: 14 }, (_, i) => `<line x1="320" x2="420" y1="${182 + i * 9}" y2="${182 + i * 9}"/>`).join('');
    const rays = Array.from({ length: 9 }, (_, k) => { const a = (20 + k * 17.5) * Math.PI / 180, c = Math.cos(a), n = Math.sin(a); return `<path d="M${(210 + c * 24).toFixed(1)} ${(204 + n * 24).toFixed(1)} L${(210 + c * 74).toFixed(1)} ${(204 + n * 74).toFixed(1)}"/>`; }).join('');
    const words = S.toonWords || S.services.map((x) => x.title);
    return `
      <section class="toon" aria-label="Animated illustration of the studio">
        <svg class="toon__art" viewBox="0 0 600 380" role="img" aria-label="A paper plane hits a bear, the bear brings it back and starts a dance, a photo of the moment turns into a pool day, and the splash floods back to the newspaper">
          <defs>
            <clipPath id="dress"><path d="M356 176 L384 176 L408 300 L332 300 Z"/></clipPath>
          </defs>
          <g class="toon__ink" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <!-- party rays behind the dance -->
            <g class="toon__rays" opacity="0" stroke-width="1.4" stroke-dasharray="2 9">${rays}</g>
            <line class="toon__ground" x1="120" x2="480" y1="340" y2="340" stroke-width="1.6"/>

            <!-- the stool (tips over when he jumps up) -->
            <g class="toon__stool">
              <line x1="204" y1="258" x2="196" y2="338"/><line x1="256" y1="258" x2="264" y2="338"/><line x1="200" y1="300" x2="260" y2="300"/>
              <rect x="192" y="250" width="76" height="9" rx="3" fill="var(--paper)"/>
            </g>

            <!-- him: seated, reading -->
            <g class="toon__him">
              <path d="M214 246 L272 248" stroke-width="20"/><path d="M272 250 L274 330" stroke-width="16"/>
              <path d="M264 336 Q276 330 290 338 Z" fill="var(--ink)"/>
              <path d="M206 176 Q228 168 250 176 L254 246 L204 246 Z" fill="var(--ink)"/>
              <path d="M214 176 L222 196 M242 176 L234 196" stroke="var(--paper)" stroke-width="2"/>
              <g class="toon__hishead">
                <circle cx="228" cy="142" r="21" fill="var(--paper)"/>
                <path d="M207 140 Q208 116 228 116 Q249 116 249 140 Z" fill="var(--ink)"/>
                <circle cx="221" cy="148" r="2" fill="var(--ink)"/><circle cx="236" cy="148" r="2" fill="var(--ink)"/>
                <path class="toon__beard" d="M209 153 Q210 169 228 169 Q246 169 247 153 Q241 159 228 158 Q215 159 209 153 Z" fill="var(--ink)" stroke-width="1.4"/>
                <path d="M224 162.5 Q229 165 234 162.5" stroke="var(--paper)" stroke-width="1.8"/>
              </g>
              <path class="toon__armL" d="M212 182 Q190 180 178 165"/>
              <path class="toon__armR" d="M246 182 Q285 180 302 165"/>
              <g class="toon__paper">
                <rect x="175" y="110" width="130" height="96" fill="var(--paper)"/>
                <line x1="240" y1="110" x2="240" y2="206" stroke-width="1.6"/>
                <text x="207" y="128" text-anchor="middle" font-family="UnifrakturCook, serif" font-size="13" fill="var(--ink)" stroke="none">${esc(S.name)}</text>
                <path d="M184 136 H231 M184 144 H231 M184 152 H222 M184 166 H231 M184 174 H231 M184 182 H214 M184 192 H231" stroke-width="1.4"/>
                <rect x="249" y="120" width="47" height="34" fill="var(--ink)" stroke="none"/>
                <path d="M249 164 H296 M249 172 H296 M249 180 H288 M249 190 H296" stroke-width="1.4"/>
                <g class="toon__leaf"><rect x="240" y="110" width="65" height="96" fill="var(--paper)"/>
                  <path d="M249 124 H296 M249 132 H296 M249 140 H284 M249 156 H296 M249 164 H296 M249 172 H290 M249 186 H296" stroke-width="1.4"/></g>
              </g>
            </g>
            <!-- still dripping after the flood -->
            <g class="toon__drips" fill="var(--ink)" stroke="none" opacity="0">
              <path class="toon__drip" d="M186 210 q-4 7 0 9 q4 -2 0 -9 Z"/><path class="toon__drip" d="M262 210 q-4 7 0 9 q4 -2 0 -9 Z"/><path class="toon__drip" d="M298 210 q-4 7 0 9 q4 -2 0 -9 Z"/>
            </g>

            <!-- her: striped dress -->
            <g class="toon__her">
              <line x1="362" y1="298" x2="360" y2="336"/><line x1="380" y1="298" x2="382" y2="336"/>
              <path d="M352 338 L364 338 M376 338 L390 338" stroke-width="4"/>
              <path d="M356 176 L384 176 L408 300 L332 300 Z" fill="var(--paper)"/>
              <g clip-path="url(#dress)" stroke-width="2.2">${stripes}</g>
              <path d="M356 176 L384 176 L408 300 L332 300 Z"/>
              <path class="toon__herArmL" d="M357 184 Q344 212 342 240"/>
              <path class="toon__herArmR" d="M383 184 Q396 212 398 240"/>
              <g class="toon__herhead">
                <circle cx="370" cy="148" r="17" fill="var(--paper)"/>
                <path d="M353 146 Q354 128 370 129 Q386 129 387 146 Q378 136 362 140 Z" fill="var(--ink)"/>
                <circle cx="372" cy="122" r="7" fill="var(--ink)"/>
                <circle cx="364" cy="151" r="1.8" fill="var(--ink)"/><circle cx="377" cy="151" r="1.8" fill="var(--ink)"/>
                <path d="M366 159 Q371 162 376 159"/>
              </g>
              <g class="toon__bang"><path d="M396 98 L392 116 M391 124 L390.5 125" stroke-width="3"/><path d="M380 104 L384 112 M408 106 L402 114" stroke-width="1.6"/></g>
            </g>

            <!-- him, standing -->
            <g class="toon__stand" opacity="0">
              <path class="toon__legL" d="M222 250 L218 334" stroke-width="13"/><path class="toon__legR" d="M240 250 L244 334" stroke-width="13"/>
              <path d="M206 336 Q218 330 226 338 Z M238 338 Q248 330 260 336 Z" fill="var(--ink)"/>
              <path d="M208 154 Q230 146 252 154 L254 254 L206 254 Z" fill="var(--ink)"/>
              <path d="M216 154 L224 174 M244 154 L236 174" stroke="var(--paper)" stroke-width="2"/>
              <path class="toon__sArmL" d="M212 162 Q198 198 196 234"/>
              <path class="toon__sArmR" d="M248 162 Q262 198 264 234"/>
              <g class="toon__shead">
                <circle cx="230" cy="122" r="21" fill="var(--paper)"/>
                <path d="M209 120 Q210 96 230 96 Q251 96 251 120 Z" fill="var(--ink)"/>
                <circle cx="223" cy="128" r="2" fill="var(--ink)"/><circle cx="238" cy="128" r="2" fill="var(--ink)"/>
                <path class="toon__beard" d="M211 133 Q212 149 230 149 Q248 149 249 133 Q243 139 230 138 Q217 139 211 133 Z" fill="var(--ink)" stroke-width="1.4"/>
                <path d="M226 142.5 Q231 145 236 142.5" stroke="var(--paper)" stroke-width="1.8"/>
              </g>
            </g>

            <!-- music notes -->
            <g class="toon__notes" stroke="none" fill="var(--ink)" font-family="Fraunces, serif" font-size="30" opacity="0">
              <text class="toon__note" x="300" y="120">&#9834;</text><text class="toon__note" x="268" y="96">&#9835;</text><text class="toon__note" x="440" y="70">&#9834;</text><text class="toon__note" x="520" y="96">&#9835;</text>
            </g>

            <!-- the bear who caught the plane -->
            <g class="toon__bear" opacity="0">
              <ellipse cx="500" cy="236" rx="58" ry="92" fill="var(--paper)"/>
              <ellipse cx="500" cy="250" rx="32" ry="52" stroke-width="1.6"/>
              <path d="M470 324 L466 338 M530 324 L534 338" stroke-width="8"/>
              <path class="toon__bearArmL" d="M448 196 Q426 232 440 270" stroke-width="7"/>
              <path class="toon__bearPlane" d="M420 116 L460 106 L434 126 Z M434 126 L438 116 L460 106" fill="var(--paper)" stroke-width="2.2"/>
              <path class="toon__bearArmR" d="M552 196 Q574 232 560 270" stroke-width="7"/>
              <g class="toon__bearHead">
                <circle cx="472" cy="122" r="13" fill="var(--paper)"/><circle cx="528" cy="122" r="13" fill="var(--paper)"/>
                <circle cx="500" cy="146" r="38" fill="var(--paper)"/>
                <ellipse cx="500" cy="160" rx="16" ry="12" fill="var(--paper)"/><ellipse cx="500" cy="154" rx="6" ry="4" fill="var(--ink)"/>
                <circle cx="486" cy="138" r="2.4" fill="var(--ink)"/><circle cx="514" cy="138" r="2.4" fill="var(--ink)"/>
                <path d="M492 168 Q500 173 508 168" stroke-width="1.8"/>
              </g>
            </g>
            <!-- offstage collision -->
            <g class="toon__bonk">
              <path d="M572 62 L590 50 M576 80 L596 84 M560 92 L562 110 M556 58 L552 40" stroke-width="2.4"/>
              <text x="560" y="80" text-anchor="middle" font-family="Fraunces, serif" font-style="italic" font-weight="900" font-size="20" fill="var(--ink)" stroke="none">bonk!</text>
            </g>

            <!-- the empty frame she holds up -->
            <rect class="toon__frame" x="180" y="90" width="100" height="66" stroke-width="5" opacity="0"/>
            <g class="toon__flash" opacity="0"><path d="M160 70 L172 82 M300 70 L288 82 M150 123 L166 123 M310 123 L294 123 M168 176 L178 166 M292 176 L282 166" stroke-width="2.4"/></g>

            <!-- the photo that comes out of the flash: a pool day. drawn full size, shrunk into the frame, then zoomed into -->
            <g class="toon__photo" opacity="0">
              <rect class="toon__photoBg" x="-41" y="-35" width="682" height="450" fill="var(--paper)" stroke="none"/>
              <g class="toon__sun"><circle cx="512" cy="74" r="22" fill="var(--paper)"/>
                <path d="M512 36 V24 M512 112 V124 M474 74 H462 M550 74 H562 M485 47 L477 39 M539 101 L547 109 M539 47 L547 39 M485 101 L477 109" stroke-width="2"/></g>
              <path d="M90 92 q8 -16 24 -8 q8 -14 24 -2 q16 -2 14 12 Z" fill="var(--paper)" stroke-width="1.8"/>
              <rect class="toon__underground" x="-41" y="339" width="682" height="80" fill="var(--paper)" stroke="none"/>
              <line x1="20" x2="580" y1="339" y2="339" stroke-width="1.6"/>
              <rect x="70" y="250" width="40" height="88" fill="var(--paper)"/>
              <rect class="toon__board" x="70" y="244" width="190" height="10" rx="3" fill="var(--paper)"/>
              <path d="M300 338 L300 298 L540 298 L540 338" fill="none"/>
              <g class="toon__swimmer">
                <circle cx="470" cy="290" r="15" fill="var(--paper)"/>
                <path d="M455 288 Q456 272 470 273 Q484 273 485 288 Q476 280 462 283 Z" fill="var(--ink)"/>
                <circle cx="472" cy="267" r="6" fill="var(--ink)"/>
                <circle cx="465" cy="292" r="1.6" fill="var(--ink)"/><circle cx="476" cy="292" r="1.6" fill="var(--ink)"/>
                <path class="toon__swimArm" d="M486 298 Q500 282 504 262"/>
              </g>
              <g class="toon__water">
                <path d="M302 300 Q320 292 338 300 T374 300 T410 300 T446 300 T482 300 T518 300 T538 300 L538 336 L302 336 Z" fill="var(--paper)"/>
                <path d="M320 318 H350 M400 326 H440 M480 316 H510" stroke-width="1.6"/>
              </g>
              <g class="toon__ripples" stroke-width="1.6"><ellipse class="toon__ripple" cx="420" cy="301" rx="40" ry="5" opacity="0"/><ellipse class="toon__ripple" cx="420" cy="301" rx="40" ry="5" opacity="0"/></g>
              <g class="toon__splash" opacity="0">
                <path d="M410 296 L398 262 M420 292 L420 250 M430 296 L444 260 M402 300 L380 282 M440 300 L462 282" stroke-width="2.6"/>
                <circle cx="392" cy="244" r="3" fill="var(--ink)"/><circle cx="452" cy="242" r="3" fill="var(--ink)"/><circle cx="421" cy="232" r="3" fill="var(--ink)"/>
              </g>
              <rect class="toon__photoEdge" x="-41" y="-35" width="682" height="450" stroke-width="5" vector-effect="non-scaling-stroke"/>
            </g>

            <!-- the paper plane -->
            <path class="toon__plane" d="M222 150 L262 140 L236 160 Z M236 160 L240 150 L262 140" fill="var(--paper)"/>

            <!-- camera flash white-out -->
            <rect class="toon__whiteout" x="-20" y="-20" width="640" height="420" fill="var(--paper)" stroke="none" opacity="0"/>
            <!-- the splash becomes a wave that floods the whole page, then drains away -->
            <g class="toon__flood">
              <path d="M-80 0 Q-50 -18 -20 0 T40 0 T100 0 T160 0 T220 0 T280 0 T340 0 T400 0 T460 0 T520 0 T580 0 T640 0 T700 0 L700 520 L-80 520 Z" fill="var(--paper)"/>
              <path d="M40 40 H90 M180 70 H240 M330 46 H370 M450 80 H520 M110 130 H170 M390 150 H440" stroke-width="1.6"/>
            </g>
          </g>
        </svg>
      </section>`;
  }

  // The CV: one lede, a lens to read it through (designer, developer, accountant), then the work as rows
  // that open to their points. Picking a lens opens the rows that have something for it and dims the rest.
  function cvHTML() {
    const C = S.cv; if (!C) return '';
    const L = (x) => ` data-lens="${esc(x)}"`;
    const row = (k, inner) => `<div class="cvx__block" data-reveal><h3 class="cvx__label">${k}</h3>${inner}</div>`;
    return `
      <section class="cvx" id="cv" data-cv data-lens-on="all" aria-label="Curriculum vitae">
        <header class="cvx__head">
          <h2 class="cvx__title"><span class="ws__mask"><span>The record.</span></span></h2>
          <p class="cvx__lede">${esc(C.lede)}</p>
          <div class="cvx__lens" role="group" aria-label="Read it as">
            <span class="cvx__read">Tap to read it as</span>
            ${C.lenses.map(([k, t], i) => `<button type="button" class="cvx__chip" data-lens-pick="${k}" aria-pressed="${i ? 'false' : 'true'}">${esc(t)}</button>`).join('')}
          </div>
        </header>
        ${row('Work', `<ol class="cvx__jobs" role="list">${C.jobs.map((j, i) => {
          const lens = [...new Set(j.points.flatMap((p) => p[0].split(' ')))].join(' ');
          return `<li class="job${i ? '' : ' is-open'}"${L(lens)}>
            <button type="button" class="job__top" aria-expanded="${i ? 'false' : 'true'}">
              <span class="job__years">${esc(j.years)}</span>
              <span class="job__place">${esc(j.place)}</span>
              <span class="job__role">${esc(j.role)}</span>
              <i class="job__plus" aria-hidden="true"></i>
            </button>
            <div class="job__body"><div><ul role="list">${j.points.map((p) => `<li${L(p[0])}>${esc(p[1])}</li>`).join('')}</ul>
              ${j.work ? `<a class="job__link" href="#/work/${j.work}">See the system it became</a>` : ''}</div></div>
          </li>`; }).join('')}</ol>`)}
        ${row('Study', `<ul class="cvx__rows" role="list">${C.study.map((x) => `<li class="cvx__row"${L(x.lens)}><span class="job__years">${esc(x.years)}</span><span class="cvx__place">${esc(x.place)}</span><span class="cvx__what">${esc(x.role)}</span></li>`).join('')}</ul>`)}
        ${row('Skills', `<div class="cvx__skills">${C.skills.map((g) => `<div class="cvx__skill"${L(g.lens)}><h4>${esc(g.group)}</h4><ul role="list">${g.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`).join('')}</div>`)}
        ${row('Certificates', `<ul class="cvx__rows" role="list">${C.certs.map((x) => `<li class="cvx__row"${L(x.lens)}><span class="cvx__place">${esc(x.name).replace(/\+/g, '<span class="pl">+</span>')}</span><span class="cvx__what">${esc(x.note)}</span></li>`).join('')}${(S.languages || []).length ? `<li class="cvx__row"><span class="cvx__place">Languages</span><span class="cvx__what">${S.languages.map(esc).join(', ')}</span></li>` : ''}</ul>`)}
      </section>`;
  }

  // the front page's one object: a Mombasa shopfront behind a roll-up shutter stamped with the Kampo K.
  // The shutter (.shop__shutter) is lifted by the scroll; the sign and the lights come on with the stories.
  const shopSVG = () => {
    const slats = Array.from({ length: 28 }, (_, k) => { const y = 164 + k * 14; return `<path d="M52 ${y} H368"/><path class="shop__thin" d="M52 ${y + 5} H368"/>`; }).join('');
    const rays = Array.from({ length: 9 }, (_, k) => { const a = (-160 + k * 17.5) * Math.PI / 180; return `<path d="M${(210 + Math.cos(a) * 26).toFixed(1)} ${(204 - Math.sin(a) * -26).toFixed(1)} L${(210 + Math.cos(a) * 70).toFixed(1)} ${(204 - Math.sin(a) * -70).toFixed(1)}"/>`; }).join('');
    return `<svg class="shop" viewBox="0 0 420 600" role="img" aria-label="A shopfront in Mombasa. Its shutter, stamped with the Kampo K, rises as you read.">
      <defs>
        <clipPath id="shop-door"><rect x="52" y="150" width="316" height="400"/></clipPath>
        <pattern id="shop-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0 V7" stroke="currentColor" stroke-width="1"/></pattern>
        <path id="shop-ring" d="M146 345 a64 64 0 1 1 128 0 a64 64 0 1 1 -128 0"/>
      </defs>
      <g class="shop__frame" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round">
        <path d="M10 42 H410 M18 42 V22 H402 V42"/>
        <path d="M22 22 V14 H70 V22 M350 22 V14 H398 V22"/>
        <rect x="20" y="42" width="380" height="528"/>
        <rect x="40" y="58" width="340" height="54"/>
        <path d="M44 112 V570 M376 112 V570"/>
        <path d="M0 570 H420 M0 586 H420" />
        <path class="shop__thin" d="M30 586 l-8 12 M90 586 l-8 12 M150 586 l-8 12 M210 586 l-8 12 M270 586 l-8 12 M330 586 l-8 12 M390 586 l-8 12"/>
        <rect x="52" y="550" width="316" height="20"/>
      </g>
      <text class="shop__sign" x="210" y="96" text-anchor="middle">YOUR BUSINESS</text>
      <g clip-path="url(#shop-door)">
        <g class="shop__inside" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="52" y="150" width="316" height="400" fill="url(#shop-hatch)" stroke="none" opacity=".22"/>
          <path d="M210 150 V190"/><circle cx="210" cy="200" r="10" fill="var(--paper)"/>
          <path d="M172 150 L160 236 M248 150 L260 236"/>
          <rect x="146" y="236" width="128" height="44" fill="var(--paper)"/>
          <text class="shop__open" x="210" y="268" text-anchor="middle" stroke="none">OPEN</text>
          <path d="M62 300 H150 M62 372 H150 M270 300 H358 M270 372 H358"/>
          <path d="M72 300 v-26 h18 v26 M98 300 v-34 h14 v34 M120 300 v-20 h22 v20 M72 372 v-22 h26 v22 M106 372 v-30 h12 v30 M126 372 v-18 h16 v18"/>
          <path d="M280 300 v-30 h20 v30 M308 300 v-22 h14 v22 M328 300 v-34 h22 v34 M282 372 v-18 h30 v18 M318 372 v-28 h12 v28 M336 372 v-22 h14 v22"/>
          <path d="M84 452 H336 V550 M84 452 V550"/><rect x="84" y="452" width="252" height="98" fill="url(#shop-hatch)" stroke="none" opacity=".35"/>
        </g>
        <g class="shop__light" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">${rays}</g>
        <g class="shop__shutter">
          <rect x="52" y="150" width="316" height="400" fill="var(--paper)"/>
          <g fill="none" stroke="currentColor" stroke-width="1.6">${slats}</g>
          <g class="shop__stamp" transform="rotate(-8 210 345)">
            <circle cx="210" cy="345" r="76" fill="none" stroke="currentColor" stroke-width="4"/>
            <circle cx="210" cy="345" r="54" fill="none" stroke="currentColor" stroke-width="2"/>
            <text class="shop__ring"><textPath href="#shop-ring" startOffset="0">KAMPO CO. · MOMBASA · EST. 2025 · KAMPO CO. · </textPath></text>
            <text class="shop__k" x="210" y="378" text-anchor="middle">K</text>
          </g>
          <rect x="52" y="532" width="316" height="18" fill="var(--paper)" stroke="currentColor" stroke-width="2.6"/>
          <path d="M120 541 h28 M272 541 h28" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
        </g>
      </g>
      <g fill="var(--paper)" stroke="currentColor" stroke-width="2.2">
        <rect x="44" y="118" width="332" height="34"/>
        <path d="M44 135 H376" fill="none" class="shop__thin"/>
        <circle cx="58" cy="135" r="3"/><circle cx="362" cy="135" r="3"/>
      </g>
    </svg>`;
  };

  window.Pages = {
    index() {
      const st = S.story, O = S.offer;
      const P = S.promise || ['We print', 'businesses', 'into being.'];
      const works = ['rb-perfumes', 'contingent-haulage'].map((slug) => S.projects.find((x) => x.slug === slug)).filter(Boolean);
      const pic = ((S.aboutPortrait || S.portrait).frames || [])[0] || '';
      const intro = S.personLine || st.paragraphs[0];
      const three = O.pillars.slice(0, 3), rest = O.pillars.slice(3);
      // a front page laid out as one broadsheet: stories in the outer columns, the shop in the middle one.
      // Each story names a stage; as it passes, the shutter rises and the caption under the shop changes.
      const story = (cls, stage, cap, body) => `<article class="np-story ${cls}" data-stage="${stage}" data-cap="${esc(cap)}">${body}</article>`;
      const svc = (p, i) => story('np-svc', i + 1, p.line, `
          <p class="np-kick mono">${esc(p.label)}</p>
          <h3 class="np-h">${esc(p.title)}</h3>
          <p class="np-dek">${esc(p.text)}</p>
          <p class="np-list">${p.services.map(([t]) => esc(t)).join(' · ')}</p>`);
      const fig = (p, k) => story('np-work', 5 + k, k ? 'Every truck, every invoice, one screen.' : 'A shop that sells online.', `
          <a class="np-pic" data-speed="1" href="#/work/${p.slug}" data-return="work" aria-label="${esc(p.title)} case study"><span class="np-pic__in media"><img data-gl src="${esc(p.cover || p.hero)}" alt="${esc(p.title)}" loading="lazy"></span></a>
          <p class="np-figcap mono">Fig. ${k + 1} · ${esc(p.category)} · ${esc(String(p.year))}</p>
          <h3 class="np-h">${esc(p.title)}</h3>
          <p class="np-dek">${esc(p.line || p.category)}</p>
          <a class="np-go" href="#/work/${p.slug}" data-return="work">Read the case study <i aria-hidden="true">→</i></a>`);
      return `
      <div class="np">
        <header class="np-mast">
          <div class="np-mast__row mono"><span>Vol. 01</span><span>${today}</span><span>${esc(S.location)}</span></div>
          <h1 class="masthead__name np-mast__name"><span class="line"><span>${S.logo ? `<img class="masthead__logo" src="${esc(S.logo)}" alt="${esc(S.studio)}">` : esc(S.studio)}</span></span></h1>
          <div class="np-mast__row np-mast__row--b mono"><span>Business setup · Branding · Websites · Software · Growth</span><span>Every quote free and written</span></div>
        </header>

        <div class="np-body">
          <div class="np-obj">
            <figure class="np-fig" data-st="0">
              ${shopSVG()}
              <figcaption class="np-cap mono" data-cap aria-live="polite">A shop in Mombasa, still shut.</figcaption>
            </figure>
          </div>

          ${story('np-lead np-l', 0, 'A shop in Mombasa, still shut.', `
          <p class="np-kick mono">Lead story · ${esc(S.location)}</p>
          <h2 class="np-headline">${lines([esc(P[0]), esc(P[1]), esc(P[2])])}</h2>
          <p class="np-stand">${esc(S.standfirst)}</p>
          <p class="np-by mono">By ${esc(S.name)}, founder</p>
          <p class="np-acts"><a class="btn" href="#/services" data-cta><span>Start a project</span><i aria-hidden="true"></i></a></p>`)}

          ${story('np-inside np-r', 0, 'A shop in Mombasa, still shut.', `
          <p class="np-kick mono">Inside this edition</p>
          <ol class="np-toc" role="list">
            ${three.map((p, i) => `<li><a href="#np-${p.key}" data-scroll-to="np-${p.key}"><span>${esc(p.label)}</span><i class="mono">p. ${i + 1}</i></a></li>`).join('')}
            <li><a href="#np-more" data-scroll-to="np-more"><span>Also inside</span><i class="mono">p. 4</i></a></li>
            <li><a href="#work" data-scroll-to="work"><span>Selected work</span><i class="mono">p. 5</i></a></li>
            <li><a href="#np-anwar" data-scroll-to="np-anwar"><span>Meet ${esc(S.name)}</span><i class="mono">p. 6</i></a></li>
            <li><a href="#np-ads" data-scroll-to="np-ads"><span>Classifieds</span><i class="mono">p. 7</i></a></li>
          </ol>
          ${stamp('NOW BOOKING · NEW PROJECTS · ')}`)}

          ${svc(three[0], 0).replace('<article', `<article id="np-${three[0].key}"`).replace('np-svc', 'np-svc np-l')}
          ${svc(three[1], 1).replace('<article', `<article id="np-${three[1].key}"`).replace('np-svc', 'np-svc np-r')}
          ${svc(three[2], 2).replace('<article', `<article id="np-${three[2].key}"`).replace('np-svc', 'np-svc np-l')}

          ${story('np-more np-r', 4, 'Systems, growth and creative, all under one roof.', `
          <div class="np-box" id="np-more">
            <p class="np-kick mono">Also inside</p>
            <ul class="np-also" role="list">${rest.map((p) => `<li><b>${esc(p.title)}</b><span>${esc(p.line)}</span></li>`).join('')}<li><b>Custom Package</b><span>Tick any services and get them quoted as one.</span></li></ul>
            <a class="btn" href="#/services"><span>See all services</span><i aria-hidden="true"></i></a>
          </div>`)}

          <h2 class="np-cross np-l" id="work">Selected work</h2>
          <p class="np-cross np-cross--r np-r mono">Two shops we have already opened</p>
          ${fig(works[0], 0).replace('np-work', 'np-work np-l')}
          ${works[1] ? fig(works[1], 1).replace('np-work', 'np-work np-r') : ''}

          ${story('np-anwar np-l', 7, 'Opened by hand, in Mombasa.', `
          <div id="np-anwar"></div>
          <p class="np-kick mono">The founder</p>
          <a class="np-hed media--torch" href="#/about" data-torch aria-label="Meet ${esc(S.fullName || S.name)}"><img class="torch__blur" src="${esc(pic)}" alt="" loading="lazy"><img class="torch__sharp" src="${esc(pic)}" alt="${esc(S.fullName || S.name)}, founder of ${esc(S.studio)}" loading="lazy"></a>
          <h3 class="np-h">Meet ${esc(S.name)}.</h3>
          <p class="np-dek">${esc(intro)}</p>
          <a class="np-go" href="#/about">Read the full story <i aria-hidden="true">→</i></a>`)}

          ${story('np-letters np-r', 8, 'Opened by hand, in Mombasa.', `
          <p class="np-kick mono">Letters</p>
          <h3 class="np-h">What clients say.</h3>
          ${S.testimonials.map((t) => `<blockquote class="np-letter"><p>${esc(t.quote)}</p><footer class="mono">${esc(t.author)}, ${esc(t.country || t.role)}</footer></blockquote>`).join('')}`)}

          ${story('np-ad np-l', 9, 'Open for business. Yours is next.', `
          <div class="wanted" id="np-ads">
            <i class="wanted__nail" aria-hidden="true"></i><i class="wanted__nail" aria-hidden="true"></i><i class="wanted__nail" aria-hidden="true"></i><i class="wanted__nail" aria-hidden="true"></i>
            <p class="wanted__top mono"><span>Classified</span><span>No. 07</span><span>${esc(S.location)}</span></p>
            <h3 class="wanted__h">Wanted</h3>
            <p class="wanted__sub">Your business</p>
            <figure class="wanted__pic" aria-hidden="true">
              <svg viewBox="0 0 240 200"><g fill="none" stroke="var(--ink)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
                <path d="M20 186 H220" stroke-width="2"/>
                <rect x="58" y="44" width="124" height="142" fill="var(--paper)"/><rect x="48" y="24" width="144" height="22" fill="var(--paper)"/>
                <path d="M66 62 H174 M66 74 H174 M66 86 H174 M66 98 H174 M66 110 H174 M66 122 H174 M66 134 H174 M66 146 H174 M66 158 H174 M66 170 H174" stroke-width="1.6"/>
                <text x="120" y="140" text-anchor="middle" class="wanted__q" fill="var(--ink)" stroke="none">?</text>
                <path d="M30 40 l-10 -10 M210 40 l10 -10 M24 100 h-14 M216 100 h14" stroke-width="2.4"/>
              </g></svg>
            </figure>
            <p class="wanted__seen">Last seen needing a name, a website or a system to replace the spreadsheets.</p>
            <div class="wanted__reward"><span class="mono">Reward</span><b>A free, written quote</b></div>
            <p class="wanted__fine mono">Report to ${esc(S.studio)} · ${esc(S.email)}</p>
            <a class="btn" href="#/services" data-cta><span>Start a project</span><i aria-hidden="true"></i></a>
            <span class="wanted__stamp mono" aria-hidden="true">Now booking</span>
          </div>`)}

          ${story('np-contact np-r', 9, 'Open for business. Yours is next.', `
          <p class="np-kick mono">Reach us</p>
          <ul class="np-reach" role="list">
            <li><span class="mono">WhatsApp</span><a href="${esc(waLink())}" target="_blank" rel="noopener">${esc(waPretty())}</a></li>
            <li><span class="mono">Email</span><a href="mailto:${esc(S.email)}">${esc(S.email)}</a></li>
            <li><span class="mono">Studio</span><span>${esc(S.location)}</span></li>
          </ul>`)}
        </div>
      </div>
      ${imprint()}`;
    },

    project(slug) {
      const i = S.projects.findIndex((p) => p.slug === slug);
      if (i < 0) return null;
      const p = S.projects[i], next = S.projects[(i + 1) % S.projects.length];
      // manifesto lines may carry <em>/<b>; everything else is escaped
      const rich = (t) => esc(t).replace(/&lt;(\/?)(em|b)&gt;/g, '<$1$2>');
      return `
      <div class="pj-closebar"><a class="pj-close mono" href="#/" data-return="work" data-cursor="Close" aria-label="Close project and go back to Featured Work">Close <span aria-hidden="true">✕</span></a></div>
      <section class="pj-title"><h1 class="headline pj-name">${lines([esc(p.title)])}</h1>${(p.offers || []).length ? `<p class="mono pj-tags">${p.offers.map(esc).join(' · ')}</p>` : ''}</section>
      <section class="grid project-hero"><div class="media" id="project-hero"><img data-gl data-gl-instant src="${esc(p.hero || p.cover)}" alt="${esc(p.title)}"></div></section>
      ${p.manifesto ? `<section class="manifesto">
        ${p.manifesto.map((t, k) => `<p class="manifesto__line${k % 2 ? ' is-right' : ''}" data-reveal>${rich(t)}</p>`).join('')}
        <h2 class="manifesto__motto" data-reveal>${esc(p.motto || p.title)}</h2>
        <p class="mono manifesto__sign">The ${esc(S.studio)} motto</p>
      </section>` : ''}
      ${caseStudy(p)}
      <section class="grid gallery">${(p.images || []).map((src, k) => img(src, `${p.title} image ${k + 1}`)).join('')}</section>
      ${cta(p.need || '', ['Want one', 'like this?'])}
      <a class="next double" href="#/work/${next.slug}" data-cursor="Next">
        <p class="mono">Next</p>
        <h2 class="headline pj-next">${esc(next.title)} →</h2>
      </a>
      ${imprint()}`;
    },

    services() {
      const O = S.offer;
      // how a job runs: four phases, each with what happens in it
      const J = [
        ['Talk', 'A free call to understand your business and what you need.', ['Your goals and customers', 'What you have already', 'The scope, agreed together']],
        ['Quote', 'One written price for the whole job. Nothing starts until you say yes.', ['A written quote', 'A timeline you agree to', 'No surprise costs later']],
        ['Build', 'We design and build in stages and share the work as it grows.', ['Design and build', 'Previews to review', 'Changes while it is easy']],
        ['Launch', 'We go live and hand everything over in your name.', ['Go live and testing', 'Every file, login and password', 'Training for your team']],
      ];
      // why us: four plain promises, each backed by how we work
      const Y = [
        ['Everything in one place', 'One team from registration to brand, website and systems.', ['One point of contact', 'Nothing lost between suppliers', 'Every part made to fit']],
        ['Built, not templated', 'Sites and systems made for your business, not bought off a shelf.', ['Hand coded websites', 'Systems shaped to how you work', 'Fast on any phone']],
        ['Numbers checked twice', 'Run by a trained auditor, so tax and invoicing are done right.', ['KRA and eTIMS ready', 'Clear written quotes', 'Reports you can read']],
        ['Yours to keep', 'When we finish, everything is handed over in your name.', ['Your domain and accounts', 'All files and logins', 'Help after launch if you want it']],
      ];
      // the hero is the stick-figure journey; then the same figure walks the street and builds each service
      const hero = journey()
        .replace('<section class="journey"', '<section class="journey svc-hero"')
        .replace('<div class="journey__stage">', `<div class="journey__stage"><header class="svc-hero__head"><p class="cap__crumb mono">/ Services</p><h1 class="svc-hero__title">What we <em>do.</em></h1></header>`)
        .replace('href="#what" data-scroll-to="what"', 'href="#street" data-scroll-to="street" data-label="The six things we do"');
      return `
${hero}
${street()}
      <section class="spread flat own-sec" id="own" aria-label="Build your own package">${brief('brief', own())}</section>

      <section class="spread flat jr" aria-label="Our project journey">
        <header class="jr__head"><p class="cap__kick mono">0${O.pillars.length + 2} / The process</p><h2 class="cap__big jr__big">${lines(['Our project', '<em>journey.</em>'])}</h2><p class="jr__deck">Four steps, the same for every job. You always know what comes next.</p></header>
        <div class="jr__route">
          <svg class="jr__road" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true"><path class="jr__path" d="M20 70 C140 20 220 110 340 66 S560 22 670 70 S880 112 980 54" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-dasharray="2 12" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>
          <ol class="jr__steps" role="list">${J.map(([t, d, list], k) => `
            <li class="jr__step" data-k="${k}">
              <span class="jr__dot" aria-hidden="true"></span>
              <p class="jr__n" aria-hidden="true">0${k + 1}</p>
              <h3 class="jr__h">${t}</h3>
              <p class="jr__d">${d}</p>
              <ul class="jr__list" role="list">${list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
            </li>`).join('')}
          </ol>
        </div>
      </section>

      <section class="spread flat why" aria-label="Why ${esc(S.studio)}">
        <header class="why__head"><p class="cap__kick mono">0${O.pillars.length + 3} / Why choose us</p><h2 class="cap__big why__big">${lines(['Why', '<em>' + esc(S.studio) + '?</em>'])}</h2><p class="why__deck">Four promises behind every job, big or small.</p></header>
        <ol class="why__list" role="list">${Y.map(([t, d, list], k) => `
          <li class="why__row" data-k="${k}">
            <p class="why__l" aria-hidden="true">${'ABCD'[k]}</p>
            <div class="why__body"><h3 class="why__h">${t}</h3><p class="why__d">${d}</p><p class="why__pts mono">${list.map((x) => `<span>${esc(x)}</span>`).join('')}</p></div>
          </li>`).join('')}
        </ol>
      </section>

      ${faq().replace('class="spread faq"', 'class="spread flat faq"').replace('<span>Good questions.</span>', '<span>Good <em>questions.</em></span>')}

      <section class="spread flat svc-end" aria-label="Start a project">
        <p class="cap__kick mono">Ready when you are</p>
        <h2 class="svc-end__title">${lines(['Let’s build it,', '<em>together.</em>'])}</h2>
        <p class="svc-end__deck">A new business, a rebrand or a system to replace the spreadsheets. Tell us what you need and get a free written quote.</p>
        <div class="svc-end__acts"><a class="btn svc-end__go" href="#brief" data-build="mix"><span>Start a project</span><i aria-hidden="true"></i></a><a class="btn btn--ghost svc-end__wa" href="${esc(waLink())}" target="_blank" rel="noopener"><span>Chat on WhatsApp</span><i aria-hidden="true"></i></a></div>
        <p class="svc-end__mail mono">Prefer email? <a href="mailto:${esc(S.email)}">${esc(S.email)}</a></p>
      </section>
      ${imprint()}`;
    },

    contact() {
      // the last page of the paper: "Let's talk." is written by hand in one fine pen line, then signed
      const word = 'Let’s talk.', L = window.SCRIPT_LINE || {};
      const pen = (o, cls, label) => o && o.paths ? `<svg class="${cls}" viewBox="${o.vb}" role="img" aria-label="${esc(label)}" preserveAspectRatio="xMidYMid meet">${o.paths.map((d) => `<path class="ct-pen__s" d="${d}"/>`).join('')}${o.dot ? `<circle class="ct-pen__dot" cx="${o.dot[0]}" cy="${o.dot[1]}" r="24"/>` : ''}<circle class="ct-pen__nib" r="9" cx="0" cy="0"/></svg>` : `<span>${esc(label)}</span>`;
      const ways = [
        ['01', 'Meet', 'Book a free meeting', '#brief', 'data-scroll-to="brief"', 'Twenty minutes, free. By video, phone, or in person in Mombasa.', ''],
        ['02', 'WhatsApp', waPretty(), waLink(), 'target="_blank" rel="noopener"', 'The quickest way to reach us. Voice notes are welcome.', ''],
        ['03', 'Email', S.email, `mailto:${S.email}?subject=Project%20request`, '', 'Best for briefs, files and longer thoughts.', S.email],
      ];
      const story = [
        ['You write in', 'Tell us what you need in the brief below, and choose a time that suits you.'],
        ['We confirm', 'We reply on WhatsApp or by email to confirm the meeting.'],
        ['We talk', 'Twenty minutes, free. We listen, ask the right questions, and say what we would do first.'],
        ['You decide', 'You receive a written quote. Nothing starts until you say yes.'],
      ];
      return `
      <section class="spread flat ct ct-pen" aria-label="Get in touch">
        <div class="ct-pen__pin">
          <div class="ct-room">
          <div class="ct-paper" aria-hidden="true"><i class="ct-paper__margin"></i></div>
          <p class="ct-row mono"><span>Correspondence</span><span>${esc(S.location)}</span><span data-clock>EAT</span></p>
          <p class="ct-date" aria-hidden="true"><span>${esc(S.location)}</span><span>${esc(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }))}</span></p>
          <h1 class="ct-pen__h">${pen(L.word, 'ct-pen__word', word)}</h1>
          <p class="ct-pen__by"><span class="ct-pen__yours">Yours,</span>${pen(L.sign, 'ct-pen__sign', S.name)}</p>
          <div class="ct-after">
            <p class="ct-deck">Tell us what you are building. ${esc(S.name)} reads every message and replies personally.</p>
            <p class="ct-hint mono">Scroll to sign <i aria-hidden="true">↓</i></p>
          </div>
          </div>
          ${(() => { const d = swahiliDoor(); return `<div class="ct-door" aria-hidden="true">
            <svg class="ct-door__svg" viewBox="-220 -70 1040 1000" preserveAspectRatio="xMidYMid meet"><g class="ct-door__cam">
              <path class="ct-door__wallfill" fill-rule="evenodd" d="M-6000 -6000H6600V7000H-6000Z M150 150V850H450V150Z"/>
              <g class="ct-door__wall">${d.wall}</g>
              <g class="ct-door__frame">${d.frame}${d.lint}</g>
              <g class="ct-door__leaf ct-door__leaf--l">${d.left}</g>
              <g class="ct-door__leaf ct-door__leaf--r">${d.right}${d.post}</g>
            </g></svg>
            <p class="ct-door__k mono"><span>${esc(S.studio)}</span><span>${esc(S.location)}</span></p>
            <p class="ct-door__hint mono">Scroll to come in <i>↓</i></p>
          </div>`; })()}
        </div>
      </section>

      <section class="spread flat ct ct-ways" aria-label="Ways to reach us">
        <header class="ct-head"><div><p class="ct-k mono">How to reach us</p><h2 class="ct-h">Three ways <em>in.</em></h2><p class="ct-aside">Pick whichever suits you. Every route lands on the same desk, and ${esc(S.name)} answers each one.</p></div><p class="ct-post" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="ct-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0"/></defs><circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" stroke-width="1"/><text font-family="IBM Plex Mono, monospace" font-size="9.5" letter-spacing="2.4" fill="currentColor"><textPath href="#ct-ring">${esc(S.location.toUpperCase())} · ${esc(S.studio.toUpperCase())} ·</textPath></text><text x="60" y="58" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="currentColor">${esc(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase())}</text><text x="60" y="72" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="10" fill="currentColor">${new Date().getFullYear()}</text></svg></p></header>
        <ol class="ct-list" role="list">${ways.map(([n, k, v, href, attrs, note, copy]) => `
          <li class="ct-way">
            <a class="ct-way__a" href="${esc(href)}" ${attrs}>
              <span class="ct-way__r" aria-hidden="true">${['i', 'ii', 'iii'][+n - 1]}.</span>
              <span class="ct-way__n mono">${k}</span>
              <span class="ct-way__v ch__v">${esc(v)}</span>
              <span class="ct-way__note">${note}</span>
              <span class="ct-way__go" aria-hidden="true">→</span>
            </a>${copy ? `<button class="ct-copy mono" type="button" data-copy="${esc(copy)}" aria-label="Copy the email address">Copy</button>` : ''}
          </li>`).join('')}
        </ol>
      </section>

      <section class="spread flat ct ct-how" aria-label="What happens next">
        <p class="ct-k mono">What happens next</p>
        <h2 class="ct-h">From hello <em>to yes.</em></h2>
        <svg class="ct-trail" aria-hidden="true"><path class="ct-trail__p" d=""/></svg>
        <ol class="ct-tale" role="list">${story.map(([a2, b2], i) => `<li class="ct-beat"><span class="ct-beat__n">0${i + 1}</span><b>${a2}.</b><span>${b2}</span></li>`).join('')}</ol>
      </section>

      ${faq().replace('class="spread faq"', 'class="spread flat faq ct-faq"').replace('<h2 class="faq__title"', '<div class="ct-faq__head"><h2 class="faq__title"').replace('</h2>', `</h2><p class="ct-aside ct-faq__aside">Not answered here? Ask on <a href="${esc(waLink())}" target="_blank" rel="noopener">WhatsApp</a> or write to <a href="mailto:${esc(S.email)}">${esc(S.email)}</a>.</p></div>`)}

      <div class="spread flat ct-brief">${brief('brief')}</div>
      ${imprint()}`;
    },

    about() {
      const st = S.story, C = S.cv || {}, pic = S.aboutPortrait || S.portrait;
      const name = S.fullName || S.name, [first, ...rest] = name.split(' ');
      const job = (C.jobs || []).find((j) => /audit/i.test(j.role));
      const sk = (k) => ((C.skills || []).find((g) => g.lens === k) || { items: [] }).items;
      // the record, read like the back of a book: what was studied, what was certified, where the work was done
      const study = C.study || [], certs = C.certs || [], jobs = C.jobs || [];
      const crafts = [
        ['Aa', 'Designer', 'Brands, layouts and type with a point of view.', sk('design')],
        ['</>', 'Developer', 'Websites and business systems, coded by hand.', sk('code')],
        ['±', 'Auditor', 'Controls, reports and numbers that add up.', sk('numbers')],
      ];
      const yr = (t) => esc(String(t).replace(/ to /, '–'));
      return `
      <section class="bio ab-front" aria-label="Profile">
        <header class="ab-flag">
          <p class="ab-flag__row mono"><span>Vol. 01 · Page 3</span><span>${esc(today)}</span><span>${esc(S.location)}</span></p>
          <p class="ab-flag__name" data-float>The Profile</p>
          <p class="ab-flag__row ab-flag__row--sub mono"><span>Design</span><span>Development</span><span>Audit</span><span>A short biography</span></p>
        </header>

        <div class="ab-lead">
          <article class="ab-main">
            <p class="ab-kick mono">${esc(st.kicker || 'Profile')} · ${esc(S.location)}</p>
            <h1 class="ab-name" data-float>${esc(first)} <em>${esc(rest.join(' '))}</em></h1>
            <p class="ab-roles" data-float>Designer, developer and auditor.</p>
            <p class="ab-deck" data-float>${esc(C.lede || '')}</p>
            <p class="ab-by mono"><span>${esc(st.byline || '')}</span><span>Founder, ${esc(S.studio)}</span></p>

            <div class="ab-body">
              <figure class="ab-pic">
                <div class="ab-pic__frame" data-speed="0.16">${photo(pic)}</div>
                <figcaption><b class="mono">Fig. 1</b> ${esc(name)}, founder of ${esc(S.studio)}, in ${esc(S.location)}.</figcaption>
              </figure>
              <div class="ab-story">
                <h2 class="ab-h" data-float>${st.headline.map(esc).join(' ')}.</h2>
                <div class="ab-cols">
                  ${st.paragraphs.map((t, k) => `<p${k ? '' : ' class="ab-first"'}>${rich(t)}</p>`).join('')}
                </div>
                <blockquote class="ab-q" data-float><p>${esc(st.pullquote)}</p></blockquote>
                <p class="ab-sign mono">${esc(st.signoff || '')} ■</p>
              </div>
            </div>
          </article>

          <aside class="ab-side">
            <section class="ab-box" aria-label="At a glance">
              <h3 class="ab-box__h mono">At a glance</h3>
              <dl class="ab-facts">
                <div><dt class="mono">Based</dt><dd>${esc(S.location)}</dd></div>
                ${study.map((x) => `<div><dt class="mono">${/CPA/.test(x.role) ? 'Qualifying' : 'Studied'}</dt><dd>${esc(x.role)}, ${esc(x.place)}</dd></div>`).join('')}
                ${job ? `<div><dt class="mono">By day</dt><dd>${esc(job.role)}, ${esc(job.place)}</dd></div>` : ''}
                <div><dt class="mono">Founded</dt><dd>${esc(S.studio)}, ${esc(yrOf(jobs[0] && jobs[0].years))}</dd></div>
              </dl>
            </section>
            <section class="ab-crafts" aria-label="The crafts">
              <h3 class="ab-box__h ab-box__h--line mono">One person, three crafts</h3>
              ${crafts.map(([g, t, l, items]) => `
              <div class="ab-craft">
                <p class="ab-craft__t"><span class="ab-craft__g" aria-hidden="true">${esc(g)}</span>${t}</p>
                <p class="ab-craft__l">${l}</p>
                <p class="ab-craft__s">${items.map(esc).join(' · ')}</p>
              </div>`).join('')}
            </section>
          </aside>
        </div>
      </section>

      <section class="bio ab-record" id="cv" aria-label="Qualifications">
        <header class="ab-record__head">
          <p class="ab-kick mono">Qualifications</p>
          <h2 class="ab-record__h" data-float>The record, <em>on paper.</em></h2>
        </header>
        <div class="ab-record__cols">
          <div class="ab-rc" data-float><h3 class="ab-rc__h mono">Education</h3>
            ${study.map((x) => `<div class="ab-ri"><p class="ab-ri__y mono">${yr(x.years)}</p><p class="ab-ri__t">${esc(x.role)}</p><p class="ab-ri__s">${esc(x.place)}</p></div>`).join('')}</div>
          <div class="ab-rc" data-float><h3 class="ab-rc__h mono">Certificates</h3>
            ${certs.map((c) => `<div class="ab-ri"><p class="ab-ri__t">${esc(c.name)}</p><p class="ab-ri__s">${esc(c.note)}</p></div>`).join('')}</div>
          <div class="ab-rc" data-float><h3 class="ab-rc__h mono">Experience</h3>
            ${jobs.map((j) => `<div class="ab-ri"><p class="ab-ri__y mono">${yr(j.years)}</p><p class="ab-ri__t">${esc(j.role)}</p><p class="ab-ri__s">${esc(j.place)}</p>${j.work ? `<a class="ab-ri__go" href="#/work/${j.work}">See the system it became <i aria-hidden="true">→</i></a>` : ''}</div>`).join('')}</div>
        </div>
      </section>

      ${cta()}${imprint()}`;
    },

    notFound() {
      return `<section class="cta"><h1 class="headline headline--xl">${lines(['Page', '<em>misprinted.</em>'])}</h1><p class="mono"><a href="#/">Back to the front page →</a></p></section>`;
    },
  };
})();

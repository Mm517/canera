/* ============================================================
   sections.js — حركة الأقسام الإضافية (بتتحمّل قبل pro.js):
   ليه بُنّ؟ (بينتو + تيلت + سبوت لايت) · ٣ خطوات (كوباية بتتملي مع السكرول)
   · على مزاجك · مقارنة · أسئلة وأجوبة · اشتراك · حبوب باراللاكس · زرار للأعلى
   النصوص والألوان بتتسحب من config.js (P و K) عشان تفضل متزامنة.
   ============================================================ */
(() => {
  const RMo = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const A2 = n => Number(n).toLocaleString('ar-EG', { useGrouping: false });
  const q = (s, r = document) => r.querySelector(s), qa = (s, r = document) => [...r.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) };

  /* لو عندك خدمة فورم (Formspree / Mailchimp proxy / API بتاعك) حط الرابط هنا.
     لو فاضي: الفورم بيشتغل شكلًا بس، والإيميل مابيتبعتش لأي مكان. */
  const FORM_ENDPOINT = '';

  const more = q('#more'); if (!more || typeof gsap === 'undefined') return;
  document.documentElement.classList.add('sxj');
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- ١) تقسيم العناوين كلمة كلمة (بيطلعوا من ورا قناع) ---------- */
  qa('[data-split]').forEach(h => {
    let w = 0;
    const walk = n => [...n.childNodes].map(c => {
      if (c.nodeType === 3) return c.textContent.split(/(\s+)/).map(t => /^\s*$/.test(t) ? t : `<span class="mw"><i style="--w:${w++}">${t}</i></span>`).join('');
      if (c.nodeName === 'BR') return '<br>';
      if (c.nodeType === 1) { const tag = c.nodeName.toLowerCase(), cls = c.className ? ` class="${c.className}"` : ''; return `<${tag}${cls}>${walk(c)}</${tag}>` }
      return '';
    }).join('');
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = walk(h);
    qa('.mw', h).forEach(e => e.setAttribute('aria-hidden', 'true'));
  });

  /* ---------- ٢) دخول العناصر مع السكرول (مرّة واحدة) ---------- */
  const inCb = new Map();
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in'); io.unobserve(e.target);
    const f = inCb.get(e.target); if (f) f(e.target);
  }), { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  const onIn = (el, f) => { if (el) inCb.set(el, f) };
  qa('#more [data-rv],#more [data-split],#after [data-rv],#after [data-split]').forEach(e => io.observe(e));

  /* ---------- ٣) الشريط المتحرّك ---------- */
  qa('.tick').forEach(t => {
    const row = q('.tick-t', t); row.innerHTML += row.innerHTML;
    new IntersectionObserver(es => t.classList.toggle('is-run', es[0].isIntersecting)).observe(t);
  });

  /* ---------- ٤) ليه بُنّ؟ ---------- */
  // ١٠٠ نقطة بتنوّر واحدة واحدة + عدّاد
  const d100 = q('.d100'); if (d100) d100.innerHTML = Array.from({ length: 100 }, (_, i) => `<i style="--k:${i}"></i>`).join('');
  const cnt = q('[data-cnt]');
  if (cnt) onIn(cnt.closest('.bc'), () => {
    const n = +cnt.dataset.cnt, o = { v: 0 };
    if (RMo) return;
    gsap.to(o, { v: n, duration: 2.2, ease: 'power3.out', delay: .3, onUpdate: () => cnt.textContent = A2(Math.round(o.v)) });
    cnt.textContent = A2(0);
  });
  // الحبوب التلاتة بلون التحميص الحقيقي من config
  const b3 = q('.beans3');
  if (b3 && typeof P !== 'undefined') {
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t)), L = [186, 128, 74], D = [36, 21, 14], hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
    b3.innerHTML = P.map((p, i) => { const t = Math.min(1, Math.max(0, (p.r - 30) / 65)); return `<div class="bn3" style="--k:${i}"><svg viewBox="0 0 100 140" style="--bf:${hex(mix(L, D, t))};--bs:${hex(mix([60, 30, 16], [8, 4, 3], t))}"><use href="#bean"/></svg><span>${p.n}</span></div>` }).join('');
  }
  // تيلت + سبوت لايت (للماوس بس)
  qa('.bc-i').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px');
      if (fine && !RMo) { c.style.setProperty('--rx', ((y / r.height - .5) * -5).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x / r.width - .5) * 5).toFixed(2) + 'deg') }
    }, { passive: true });
    c.addEventListener('pointerleave', () => { c.style.setProperty('--rx', '0deg'); c.style.setProperty('--ry', '0deg') });
  });
  // علامات الصح في المقارنة بتتأخّر واحدة واحدة
  qa('.cmp-c.new li').forEach((li, i) => li.style.setProperty('--k', i));

  /* ---------- ٥) ٣ خطوات: كوباية بتتملي مع السكرول ---------- */
  (function steps() {
    const svg = q('#sxsvg'), list = q('#sxl'); if (!svg || !list) return;
    const g = s => q(s, svg), sp = g('#sxsp'), kt = g('#sxkt'), st = g('#sxst'), stR = g('#sxstr'), liq = g('#sxliq'), liqd = g('#sxliqd'), wv = g('#sxwv'),
      pile = g('#sxpile'), glow = g('#sxglow'), steam = g('#sxsteam'), sw = g('#sxsw'), sparks = g('#sxsparks'), grp = g('#sxgr');
    const steps = qa('.sx-s', list), cap = q('#sxcap');

    // حبيبات بتنزل من الملعقة
    const N = 18, grs = [];
    for (let i = 0; i < N; i++) {
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', (2.5 + rnd(i) * 2.3).toFixed(1)); c.setAttribute('cx', (208 + (rnd(i + 40) - .5) * 30).toFixed(1)); c.setAttribute('cy', '100');
      c.setAttribute('fill', i % 3 ? '#e0b266' : '#f4d58d'); c.setAttribute('opacity', '0'); grp.appendChild(c); grs.push(c);
    }
    // الملعقة والغلاية بيلفّوا حوالين نقطة (٠،٠) بتاعتهم
    gsap.set([sp, kt], { svgOrigin: '0 0' }); gsap.set(kt, { svgOrigin: '0 12' });
    gsap.set(sp, { x: 400, y: 60, rotation: 60, opacity: 0 });
    gsap.set(kt, { x: 340, y: -30, rotation: 0, opacity: 0 });
    gsap.set(liq, { y: 170 });
    gsap.set(pile, { scaleY: 0, svgOrigin: '210 346' });
    gsap.set(stR, { scaleY: 0, transformOrigin: '50% 0%' });
    gsap.set(sw, { transformOrigin: '50% 50%' });
    gsap.set([st, steam, sparks], { opacity: 0 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    // ١) ملعقة + حبيبات
    tl.to(sp, { opacity: 1, x: 214, y: 98, rotation: 44, duration: .08, ease: 'power2.out' }, 0)
      .to(sp, { rotation: 78, duration: .07, ease: 'power1.inOut' }, .08);
    grs.forEach((c, i) => {
      const t = .09 + i * .0055, dy = 328 - 100 - rnd(i + 9) * 22;
      tl.fromTo(c, { y: 0, opacity: 0 }, { y: dy, opacity: 1, duration: .07, ease: 'power2.in' }, t).to(c, { opacity: 0, duration: .008 }, t + .07);
    });
    tl.to(pile, { scaleY: 1, duration: .1, ease: 'power1.out' }, .15)
      .to(sp, { x: 404, y: 40, rotation: 60, opacity: 0, duration: .07, ease: 'power2.in' }, .24)
      // ٢) ماية سخنة
      .to(kt, { opacity: 1, x: 214, y: 72, duration: .06, ease: 'power2.out' }, .29)
      .to(kt, { rotation: -26, duration: .04, ease: 'power1.inOut' }, .34)
      .to(st, { opacity: 1, duration: .01 }, .375)
      .to(stR, { scaleY: 1, duration: .03, ease: 'power1.in' }, .375)
      .to(liq, { y: 10, duration: .26, ease: 'power1.out' }, .39)
      .to(pile, { opacity: 0, duration: .1 }, .46)
      .to(liqd, { opacity: 1, duration: .16 }, .5)
      .to(wv, { fill: '#6a3a1c', duration: .16 }, .5)
      .to(glow, { opacity: .9, duration: .2 }, .5)
      .to(st, { opacity: 0, duration: .02 }, .65)
      .to(kt, { rotation: 0, duration: .03 }, .65)
      .to(kt, { x: 340, y: -30, opacity: 0, duration: .05, ease: 'power2.in' }, .68)
      .to(steam, { opacity: .9, duration: .16 }, .62)
      // ٣) تقليب
      .set(sp, { x: 350, y: 150, rotation: 50 }, .72)
      .to(sp, { opacity: 1, x: 208, y: 292, rotation: 16, duration: .06, ease: 'power2.out' }, .72)
      .to(sw, { opacity: .6, duration: .04 }, .78)
      .to(sw, { rotation: 560, duration: .16, ease: 'sine.inOut' }, .78)
      .to(sw, { opacity: 0, duration: .04 }, .92)
      .to(sp, { x: 238, duration: .035, ease: 'sine.inOut' }, .78)
      .to(sp, { x: 180, duration: .05, ease: 'sine.inOut' }, .815)
      .to(sp, { x: 236, duration: .05, ease: 'sine.inOut' }, .865)
      .to(sp, { x: 208, duration: .035, ease: 'sine.inOut' }, .915)
      .to(sp, { x: 350, y: 130, rotation: 50, opacity: 0, duration: .05, ease: 'power2.in' }, .95)
      .to(sparks, { opacity: 1, duration: .04 }, .96)
      .to({}, { duration: .01 }, .99);

    if (RMo) tl.progress(1);
    else ScrollTrigger.create({ animation: tl, trigger: list, start: 'top 62%', end: 'bottom 82%', scrub: .6 });

    // خط التقدّم + إضاءة الخطوة الحالية
    if (!RMo) ScrollTrigger.create({ trigger: list, start: 'top 55%', end: 'bottom 55%', scrub: true, animation: gsap.to('#sxf', { scaleY: 1, ease: 'none' }) });
    else gsap.set('#sxf', { scaleY: 1 });
    steps.forEach((li, i) => ScrollTrigger.create({
      trigger: li, start: 'top 60%', end: 'bottom 60%',
      onToggle: s => { li.classList.toggle('is-on', s.isActive); if (s.isActive && cap) cap.textContent = `الخطوة ${A2(i + 1)} من ${A2(steps.length)}` }
    }));
    if (RMo) steps.forEach(l => l.classList.add('is-on'));
  })();

  /* ---------- ٦) على مزاجك ---------- */
  (function mood() {
    const box = q('#mdq'), card = q('#mdr'); if (!box || !card || typeof P === 'undefined' || typeof K === 'undefined') return;
    const IC = {
      sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
      bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
      chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z"/>',
      snow: '<path d="M12 2v20M4 7l16 10M20 7L4 17"/>'
    };
    const MOODS = [
      { n: 'صحيت متأخر', e: 'sun', p: 0, k: 0, w: 'محتاج كوباية سريعة ومتوازنة من غير تعقيد. كلاسيك سادة جاهزة في ثواني.' },
      { n: 'محتاج أركّز', e: 'bolt', p: 2, k: 0, w: 'دارك سادة: جسم تقيل ومرارة حلوة تصحّيك وتخليك في الشغل.' },
      { n: 'قعدة هادية', e: 'chat', p: 1, k: 1, w: 'غولد بالحليب: ناعمة وكريمية، ومعاها حلاوة فاكهية خفيفة للحكاية.' },
      { n: 'الجو حر', e: 'snow', p: 1, k: 2, w: 'غولد مثلّجة: منعشة وخفيفة، والتلج يعمل الباقي.' }
    ];
    // طبقات الكوباية من تحت لفوق (لون، نسبة)
    const LAY = [[['#2a1209', 1], ['#2a1209', 0], ['#2a1209', 0]], [['#8a5a35', .56], ['#ecd9bb', .44], ['#ecd9bb', 0]], [['#ecd9bb', .34], ['#4a2614', .66], ['#4a2614', 0]]];
    const L = [q('#mdl1'), q('#mdl2'), q('#mdl3')], TOP = 98, BOT = 250;
    box.innerHTML = MOODS.map((m, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[m.e]}</svg>${m.n}</button>`).join('');
    const el = id => q(id), txt = [el('#mdn'), el('#mdw'), el('#mdch'), q('.md-m'), q('.md-rc')];
    let cur = -1, ready = false;

    function fillCup(k, animate) {
      const lay = LAY[k], tot = BOT - TOP; let y = BOT;
      lay.forEach(([c, f], j) => {
        const h = f * tot; y -= h;
        const a = { y: BOT - lay.slice(0, j + 1).reduce((s, l) => s + l[1], 0) * tot, height: h, fill: c };
        animate ? gsap.to(L[j], { attr: a, duration: .8, ease: 'power3.out', delay: j * .05 }) : gsap.set(L[j], { attr: a });
      });
      const ice = K[k].ice;
      gsap.to('#mdice', { opacity: ice ? 1 : 0, y: ice ? 0 : -14, duration: animate ? .6 : 0 });
      gsap.to('#mdsteam', { opacity: ice ? 0 : .9, duration: animate ? .6 : 0 });
    }
    function paint(i) {
      const m = MOODS[i], p = P[m.p], k = K[m.k];
      el('#mdn').textContent = p.n; el('#mdw').textContent = m.w;
      el('#mdch').innerHTML = p.notes.map(n => `<span>${n}</span>`).join('');
      el('#mdm').textContent = k.n; el('#mdr2').textContent = k.r;
      const vals = [p.r, k.b[0], k.b[1]];
      vals.forEach((v, j) => { el('#mdv' + j).textContent = j ? A2(v) + '٪' : p.rl; el('#mdb' + j).style.width = (ready ? v : 0) + '%' });
    }
    function set(i, instant) {
      if (i === cur) return; cur = i; const m = MOODS[i], p = P[m.p];
      [...box.children].forEach((b, j) => b.setAttribute('aria-pressed', j === i));
      gsap.to(card, { '--c': p.c, '--c2': p.c2, '--a': p.a, '--t': p.t, duration: instant || RMo ? 0 : .8, ease: 'power2.out' });
      if (instant || RMo) { paint(i); fillCup(m.k, false); return }
      gsap.timeline().to(txt, { opacity: 0, y: -10, duration: .16, ease: 'power1.in' }).add(() => paint(i))
        .fromTo(txt, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, stagger: .06, ease: 'power3.out' });
      fillCup(m.k, true);
      gsap.fromTo('#mdsvg', { rotation: -4, y: 6 }, { rotation: 0, y: 0, duration: .9, ease: 'elastic.out(1,.5)', transformOrigin: '50% 90%' });
    }
    box.addEventListener('click', e => { const b = e.target.closest('button'); if (b) set(+b.dataset.i) });
    set(0, true);
    onIn(card, () => { ready = true; [0, 1, 2].forEach(j => { const v = [P[MOODS[cur].p].r, K[MOODS[cur].k].b[0], K[MOODS[cur].k].b[1]][j]; el('#mdb' + j).style.width = v + '%' }) });
  })();

  /* ---------- ٧) أسئلة وأجوبة ---------- */
  const fq = q('#fq');
  if (fq) fq.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const item = b.closest('.fq-i'), open = !item.classList.contains('is-open');
    qa('.fq-i', fq).forEach(i => { i.classList.remove('is-open'); q('button', i).setAttribute('aria-expanded', 'false') });
    if (open) { item.classList.add('is-open'); b.setAttribute('aria-expanded', 'true') }
    setTimeout(() => ScrollTrigger.refresh(), 700);
  });

  /* ---------- ٨) الاشتراك ---------- */
  (function join() {
    const f = q('#jf'), jn = q('#jn'); if (!f) return;
    const inp = q('input', f), btn = q('button', f), msg = q('#jm'), burst = q('.jn-b', jn);
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const say = (t, c) => { msg.textContent = t; msg.className = 'jn-m ' + (c || '') };
    function beans() {
      if (RMo) return;
      const r = btn.getBoundingClientRect(), b = burst.getBoundingClientRect(), cx = r.left + r.width / 2 - b.left, cy = r.top + r.height / 2 - b.top;
      const cols = ['#6b3b22', '#8a5a35', '#e8bd78', '#3a2014'];
      for (let i = 0; i < 26; i++) {
        const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 100 140'); s.style.setProperty('--bf', cols[i % 4]); s.innerHTML = '<use href="#bean"/>'; burst.appendChild(s);
        const a = Math.PI * (1.05 + Math.random() * .9), v = 160 + Math.random() * 360, sc = .5 + Math.random() * .9;
        gsap.set(s, { x: cx - 17, y: cy - 24, scale: sc, rotation: Math.random() * 360 });
        gsap.timeline({ onComplete: () => s.remove() })
          .to(s, { x: cx - 17 + Math.cos(a) * v, y: cy - 24 + Math.sin(a) * v, rotation: '+=' + (Math.random() * 500 - 250), duration: .9, ease: 'power2.out' })
          .to(s, { y: '+=' + (260 + Math.random() * 240), opacity: 0, duration: 1.2, ease: 'power1.in' }, .55);
      }
    }
    f.addEventListener('submit', async e => {
      e.preventDefault(); const v = inp.value.trim();
      if (!ok.test(v)) { inp.setAttribute('aria-invalid', 'true'); say('اكتب إيميل صحيح من فضلك.', 'er'); inp.focus(); inp.style.animation = 'none'; void inp.offsetWidth; inp.style.animation = ''; return }
      inp.removeAttribute('aria-invalid'); btn.disabled = true; say('ثواني…');
      try {
        if (FORM_ENDPOINT) { const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ email: v }) }); if (!r.ok) throw new Error(r.status) }
        else { console.warn('[sections.js] FORM_ENDPOINT فاضي: الإيميل ماتبعتش لأي مكان. حط رابط خدمة الفورم في أول الملف.'); await new Promise(r => setTimeout(r, 500)) }
        say('تمام! هتوصلك أخبارنا قريب.', 'ok'); jn.classList.add('done'); inp.value = ''; beans();
      } catch (err) { say('حصلت مشكلة. جرّب تاني بعد شوية.', 'er') }
      btn.disabled = false;
    });
    inp.addEventListener('input', () => { if (inp.getAttribute('aria-invalid')) { inp.removeAttribute('aria-invalid'); say('') } });
  })();

  /* ---------- ٩) حبوب بتطفو (باراللاكس) ---------- */
  qa('.mx-beans').forEach((box, k) => {
    const host = box.parentElement, cols = ['#6b3b22', '#8a5a35', '#4a2a18', '#a8743f'];
    const n = host.id === 'more' ? 9 : 5;
    for (let i = 0; i < n; i++) {
      const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 100 140'); s.innerHTML = '<use href="#bean"/>';
      const sz = 34 + rnd(i * 3 + k) * 70; s.style.setProperty('--w', sz + 'px'); s.style.setProperty('--bf', cols[i % 4]);
      s.style.insetInlineStart = (rnd(i * 5 + 2 + k) * 92) + '%'; s.style.top = ((i + .3 + rnd(i + 7)) / n * 92) + '%'; s.style.opacity = (.07 + rnd(i + 11) * .11).toFixed(2);
      box.appendChild(s);
      if (RMo) continue;
      gsap.fromTo(s, { y: 120 + sz, rotation: rnd(i + 20) * 120 - 60 }, { y: -(120 + sz * 1.4), rotation: rnd(i + 30) * 360 - 180, ease: 'none', scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true } });
    }
  });

  /* ---------- ١٠) لما نبقى جوّه الأقسام دي مفيش داعي نرسم المشهد ثلاثي الأبعاد ---------- */
  qa('#more,#after').forEach(el => ScrollTrigger.create({
    trigger: el, start: 'top 50%', end: 'bottom 50%',
    onToggle: s => { if (s.isActive && typeof setActive === 'function') try { setActive('story') } catch (e) { } }
  }));

  /* ---------- ١١) زرار للأعلى + حلقة التقدّم ---------- */
  const up = q('#up'), upp = q('#upp');
  if (up) {
    let tk = false;
    const upd = () => {
      tk = false; const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), y = scrollY;
      up.classList.toggle('on', y > innerHeight * 1.2); upp.style.setProperty('--o', (1 - Math.min(1, y / max)).toFixed(4));
    };
    addEventListener('scroll', () => { if (!tk) { tk = true; requestAnimationFrame(upd) } }, { passive: true }); upd();
    up.addEventListener('click', () => (typeof lenis !== 'undefined' && lenis) ? lenis.scrollTo(0, { duration: 2.4 }) : scrollTo({ top: 0, behavior: RMo ? 'auto' : 'smooth' }));
  }
})();

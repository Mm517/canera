/* ============================================================
   pro.js — الطبقة الأخيرة (بتتحمّل بعد v9):
   لودر بعدّاد + تسخين المشاهد (مفيش نهتّة وقت الانتقال) + قائمة + كيرسر + مغناطيس
   + مؤشّر الفصل + حكايتنا (نص بيتنوّر، ماركي، عدّادات)
   ============================================================ */
(() => {
  const RMo = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const fine = matchMedia('(pointer:fine)').matches;
  const A2 = n => Number(n).toLocaleString('ar-EG', { useGrouping: false });
  const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ---------- اللودر: عدّاد ناعم ---------- */
  const ldn = q('#ldn'), ldl = q('#ldl'), ldt = q('#ldt');
  const MSG = ['بنجهّز المزرعة…', 'بنحمّص الحبوب…', 'بنظبط الإضاءة…', 'بنقفل البرطمان…'];
  let target = .06, shown = 0, finished = false, lv = -1, resolveDone;
  const doneP = new Promise(r => resolveDone = r);
  (function tick() {
    shown += (target - shown) * (RMo ? 1 : .14);
    if (target - shown < .0008) shown = target;
    const v = Math.round(shown * 100);
    if (v !== lv && ldn) { lv = v; ldn.textContent = A2(v); ldt.textContent = MSG[Math.min(3, (v / 26) | 0)] }
    if (ldl) ldl.style.transform = `scaleX(${shown})`;
    if (finished && shown >= 1) { resolveDone(); return }
    requestAnimationFrame(tick);
  })();

  window.PRO = {
    progress(f) { target = Math.max(target, .06 + f * .94) },

    /* بنرسم كل مشهد مرّة واحدة ورا اللودر: كده الـ shaders بتتبني والتكسشرات بتترفع
       قبل ما اليوزر يوصلها، وبالتالي الانتقال بين الفصول بيبقى سلس من غير تهنيج */
    async warm() {
      const R = GL.R, S = GL.S, C = GL.C, ids = Object.keys(SC), keep = X.intro;
      const hide = () => { Object.values(ST).forEach(s => s.g.visible = false); J.root.visible = false; ORB.visible = false };
      X.intro = 1;
      for (let i = 0; i < ids.length; i++) {
        const sc = SC[ids[i]];
        try {
          hide(); if (sc.stage) sc.stage.g.visible = true; J.root.visible = !!sc.jar; ORB.visible = !!sc.orbit;
          S.fog = sc.fog ? new THREE.Fog(sc.fog[0], sc.fog[1], sc.fog[2]) : null;
          const c = sc.update(.001, .5); C.position.copy(c.p); C.lookAt(c.l);
          if (sc.jar) {
            const jt = sc.jt || JT, r = J.root, s = jt.s || 1, sx = jt.sx || 1;
            r.position.set(jt.x || 0, jt.y || 0, jt.z || 0); r.rotation.set(jt.rx || 0, jt.ry || 0, 0); r.scale.set(s * sx, s, s * sx);
          }
          R.render(S, C);
        } catch (e) { console.warn('warm:', ids[i], e) }
        PRO.progress((i + 1) / ids.length);
        await wait(RMo ? 0 : 24);
      }
      hide(); S.fog = null; X.intro = keep;
    },

    async done() {
      finished = true; target = 1;
      await Promise.race([doneP, wait(4000)]);
      await wait(RMo ? 0 : 280);
    }
  };

  /* ---------- مؤشّر الفصل الحالي في النافبار ---------- */
  const ORDER = ['hero', 'farm', 'harvest', 'process', 'roast', 'extract', 'fill', 'cup', 'layers', 'places', 'market', 'prod', 'cust', 'why', 'steps', 'mood', 'compare', 'story', 'end', 'faq', 'join'];
  const NAMES = { why: 'ليه بُنّ؟', steps: '٣ خطوات', mood: 'على مزاجك', compare: 'الفرق في البساطة', faq: 'أسئلة وأجوبة', join: 'خلّيك قريب', hero: 'الغلاف', farm: 'الزراعة', harvest: 'القطف', process: 'المعالجة والتجفيف', roast: 'التحميص', extract: 'الاستخلاص', fill: 'التعبئة', cup: 'الكوباية', layers: 'جوّه الكوباية', places: 'في أي مكان', market: 'في السوبر ماركت', prod: 'التشكيلة', cust: 'طريقتك', story: 'حكايتنا', end: 'الختام' };
  const ci = q('#ci'), cin = q('#cin'), cit = q('#cit'); let curCh = '', chT = 0;
  function chap(id) {
    if (id === curCh || !ci) return; curCh = id; const i = ORDER.indexOf(id); ci.classList.add('sw'); clearTimeout(chT);
    chT = setTimeout(() => { cin.textContent = (i < 9 ? '٠' : '') + A2(i + 1); cit.textContent = NAMES[id]; ci.classList.remove('sw') }, 170);
  }
  ORDER.forEach(id => { const el = document.getElementById(id); if (el) ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: s => { if (s.isActive) chap(id) } }) });

  /* ---------- القائمة الكاملة ---------- */
  const menu = q('#menu'), mb = q('#mb');
  if (menu && mb) {
    const items = qa('#menu .mi b'), foot = q('.mn-f'); let open = false;
    const CLOSED = 'inset(0% 0% 100% 0%)', OPEN = 'inset(0% 0% 0% 0%)', OUT = 'inset(100% 0% 0% 0%)';
    menu.inert = true; gsap.set(menu, { clipPath: CLOSED }); gsap.set(items, { yPercent: 115 });
    const setMenu = o => {
      if (o === open) return; open = o;
      mb.setAttribute('aria-expanded', o); menu.setAttribute('aria-hidden', !o); menu.inert = !o;
      if (typeof lenis !== 'undefined' && lenis) o ? lenis.stop() : lenis.start(); else document.documentElement.style.overflow = o ? 'hidden' : '';
      gsap.killTweensOf([menu, items, foot]);
      if (o) {
        menu.classList.add('on');
        gsap.timeline().fromTo(menu, { clipPath: CLOSED }, { clipPath: OPEN, duration: .85, ease: 'power4.inOut' })
          .to(items, { yPercent: 0, duration: .9, stagger: .055, ease: 'power4.out' }, .35)
          .fromTo(foot, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .6, ease: 'power3.out' }, .8);
        setTimeout(() => { const a = menu.querySelector('a'); a && a.focus({ preventScroll: true }) }, 600);
      } else {
        gsap.timeline().to(items, { yPercent: -115, duration: .38, stagger: .018, ease: 'power3.in' })
          .to(menu, { clipPath: OUT, duration: .7, ease: 'power4.inOut' }, .14)
          .add(() => { menu.classList.remove('on'); gsap.set(items, { yPercent: 115 }); gsap.set(menu, { clipPath: CLOSED }) });
      }
    };
    mb.addEventListener('click', () => setMenu(!open));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false) });
    addEventListener('keydown', e => { if (e.key === 'Escape' && open) { setMenu(false); mb.focus() } });
  }

  /* ---------- كيرسر مخصّص + أزرار مغناطيسية (للماوس بس) ---------- */
  const hero = q('#hero'); if (hero) hero.dataset.cur = 'اسحب';
  if (fine && !RMo) {
    const H = document.documentElement; H.classList.add('cc');
    const cr = document.createElement('div'), cd = document.createElement('div'); cr.id = 'cr'; cd.id = 'cd'; cr.innerHTML = '<span></span>'; document.body.append(cr, cd);
    const lab = cr.firstChild;
    const xr = gsap.quickTo(cr, 'x', { duration: .5, ease: 'power3' }), yr = gsap.quickTo(cr, 'y', { duration: .5, ease: 'power3' });
    const xd = gsap.quickTo(cd, 'x', { duration: .1, ease: 'none' }), yd = gsap.quickTo(cd, 'y', { duration: .1, ease: 'none' });
    let lastL = '';
    addEventListener('pointermove', e => {
      H.classList.add('cv'); xr(e.clientX); yr(e.clientY); xd(e.clientX); yd(e.clientY);
      const t = e.target.closest && e.target.closest('a,button,[data-cur]'), l = t && t.dataset.cur ? t.dataset.cur : '';
      cr.classList.toggle('h', !!t && !l); cr.classList.toggle('l', !!l); if (l !== lastL) { lastL = l; if (l) lab.textContent = l }
    }, { passive: true });
    document.addEventListener('pointerleave', () => H.classList.remove('cv'));
    addEventListener('pointerdown', () => cr.classList.add('d')); addEventListener('pointerup', () => cr.classList.remove('d'));

    qa('.btn,.mb,.logo').forEach(b => {
      const xq = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' }), yq = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); xq((e.clientX - r.left - r.width / 2) * .28); yq((e.clientY - r.top - r.height / 2) * .35) });
      b.addEventListener('pointerleave', () => { xq(0); yq(0) });
    });
  }

  /* ---------- حكايتنا: نص بيتنوّر كلمة كلمة + عدّادات + ماركي بيتأثّر بالسكرول ---------- */
  const sh = q('#story h2.big');
  if (sh) {
    sh.innerHTML = sh.innerHTML.split(/<br\s*\/?>/i).map(l => l.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ')).join('<br>');
    const ws = qa('#story h2.big .w'), paint = s => { const k = s.progress * ws.length * 1.1; ws.forEach((w, i) => { const on = i < k; if (on !== w._on) { w._on = on; w.classList.toggle('l', on) } }) };
    ScrollTrigger.create({ trigger: sh, start: 'top 84%', end: 'bottom 50%', onUpdate: paint, onRefresh: paint });
  }
  qa('.stats b[data-n]').forEach(b => {
    const n = +b.dataset.n, pre = b.dataset.pre || '', suf = b.dataset.suf || '', o = { v: 0 }, set = v => b.textContent = pre + A2(Math.round(v)) + suf;
    if (!RMo) set(0);
    ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: () => { if (RMo) return set(n); gsap.to(o, { v: n, duration: 2.2, ease: 'power3.out', onUpdate: () => set(o.v) }) } });
  });

  const rows = qa('.mqr'), story = q('#story');
  if (rows.length && story && !RMo) {
    let vis = false, lastY = scrollY, vel = 0; const pos = rows.map(() => 0); let per = rows.map(() => 1);
    const measure = () => { per = rows.map(r => Math.max(1, r.scrollWidth / 3)) };
    new IntersectionObserver(es => { vis = es[0].isIntersecting; if (vis) measure() }).observe(story);
    addEventListener('resize', measure); if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    gsap.ticker.add((t, dt) => {
      const y = scrollY; vel += ((y - lastY) - vel) * .15; lastY = y; if (!vis) return;
      const v = Math.max(-80, Math.min(80, vel));
      rows.forEach((r, i) => {
        const d = +r.dataset.d || 1; pos[i] += d * (dt * .05 + v * .35);
        r.style.transform = `translate3d(${-(((pos[i] % per[i]) + per[i]) % per[i])}px,0,0)`;
      });
    });
  }
})();

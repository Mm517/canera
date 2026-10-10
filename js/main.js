/* ============================================================
   main.js — Lenis (سكرول ناعم) + GSAP/ScrollTrigger (ربط السكرول بالمشاهد والنصوص)
   ============================================================ */
gsap.registerPlugin(ScrollTrigger);
const AR = n => Number(n).toLocaleString('ar-EG', { useGrouping: false });
const narrow = () => innerWidth < 760;
let lenis = null, J, ORB, ST = {}, ACTIVE = 'hero', READY = false, SNAP = true;
const PR = {}, CUR = {}, X = { spin: 0, sq: 0, intro: 0 };
const JT = { x: 0, y: 0, z: 0, rx: 0, ry: 0, s: 1 };
const LJ = { hemi: ['#dfeee8', '#2a1d14', .6], key: ['#fff0d8', 1.4, [4, 7, 5]], rim: ['#ffc88a', 1, [-5, 3, -4]], exp: 1.1 };
const cam = { p: new THREE.Vector3(0, .3, 9.5), l: new THREE.Vector3() }, camPos = new THREE.Vector3(0, .3, 9.5), camLook = new THREE.Vector3();
const mouse = { x: 0, y: 0, tx: 0, ty: 0 }, shift = { x: 0, y: 0 };
let pi = 0, kc = 0, railOn = '';

/* ---------- واجهة: التشكيلة وطرق التحضير ---------- */
function tabs(el, arr, fn) {
  el.innerHTML = arr.map((p, i) => `<button data-i="${i}" aria-pressed="${i == 0}">${p.n}</button>`).join('');
  el.onclick = e => { const b = e.target.closest('button'); if (!b) return;[...el.children].forEach(x => x.setAttribute('aria-pressed', x == b)); fn(+b.dataset.i) };
}
function setP(i, first) {
  pi = i; const p = P[i]; $('#pn').textContent = p.n; $('#pd0').textContent = p.d; $('#prv').textContent = p.rl; $('#prb').style.width = p.r + '%';
  $('#pnt').innerHTML = p.notes.map(n => `<span>${n}</span>`).join(''); $('#pdx').textContent = p.x;
  document.documentElement.style.setProperty('--ac', i === 2 ? '#e8bd78' : i === 1 ? '#f2cf7e' : '#eab87a');
  if (!GL.ok || first) { if (J) J.setVariant(i); return }
  gsap.timeline().to(X, { sq: 1, duration: .28, ease: 'power2.in' }).add(() => J.setVariant(i)).to(X, { sq: 0, duration: .7, ease: 'back.out(2.2)' })
    .to(X, { spin: '+=6.2832', duration: 1.1, ease: 'power3.inOut' }, 0);
}
function setK(i) {
  kc = i; const k = K[i]; $('#kn').textContent = k.n; $('#kd').textContent = k.d; $('#kr').textContent = k.r;
  k.b.forEach((v, j) => { $('#b' + j).style.width = v + '%'; $('#v' + j).textContent = AR(v) + '٪' });
  if (ST.cup) ST.cup.setMethod(i);
}
tabs($('#pt'), P, setP); tabs($('#kt'), K, setK);
$('#pdb').onclick = function () { const o = $('#pdx').classList.toggle('on'); this.setAttribute('aria-expanded', o); this.textContent = o ? 'إخفاء التفاصيل' : 'تفاصيل المنتج' };

/* ---------- كروت الشرح (بتتبدّل مع تقدّم الفصل) ---------- */
const CAPS = {};
Object.keys(CH).forEach(id => {
  const d = CH[id], el = $(`.cap[data-ch="${id}"]`); if (!el) return;
  el.innerHTML = `<div class="cn"><span class="num">${d.num}</span><span class="kick">${d.kick}</span></div><h2 class="ct"></h2><p class="cp"></p><ol class="dots">${d.steps.map(() => '<li></li>').join('')}</ol>`;
  CAPS[id] = { el, ct: el.querySelector('.ct'), cp: el.querySelector('.cp'), li: [...el.querySelectorAll('li')], idx: -1, steps: d.steps };
  capSet(id, 0, true);
});
function capSet(id, idx, instant) {
  const c = CAPS[id], s = c.steps[idx]; c.idx = idx; c.li.forEach((l, j) => { l.classList.toggle('on', j === idx); l.classList.toggle('dn', j < idx) });
  if (instant) { c.ct.textContent = s.t; c.cp.textContent = s.p; return }
  gsap.killTweensOf([c.ct, c.cp]);
  gsap.timeline().to([c.ct, c.cp], { opacity: 0, y: -10, duration: .16, ease: 'power1.in' }).add(() => { c.ct.textContent = s.t; c.cp.textContent = s.p })
    .fromTo([c.ct, c.cp], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, stagger: .06, ease: 'power2.out' });
}
function capUpdate(id, p) {
  const c = CAPS[id]; if (!c) return; let k = 0; c.steps.forEach((s, i) => { if (p >= s.at - .0001) k = i }); if (k !== c.idx) capSet(id, k);
}

/* ---------- المشاهد الثلاثية ---------- */
const SC = {};
function buildScenes() {
  J = makeJar(); GL.S.add(J.root); J.root.visible = false;
  ORB = Orbit(J); GL.S.add(ORB); ORB.visible = false;
  const pl = Plantation(), pr = Process(), ro = Roast(), ex = Extract(), fi = Fill(J), cu = Cup();
  [pl, pr, ro, ex, fi, cu].forEach(s => { s.g.visible = false; GL.S.add(s.g) }); ST = { plantation: pl, process: pr, roast: ro, extract: ex, fill: fi, cup: cu };
  const jarCam = (z, y = .25, ly = .1) => { cam.p.set(0, y, z); cam.l.set(0, ly, 0); return cam };
  SC.hero = { jar: true, orbit: true, light: LJ, bg: BG.hero, shift: [.16, .0], update(p, t) {
    const e = X.intro; Object.assign(JT, { x: 0, y: p * 1.0, z: 0, rx: .1 + p * .25, ry: t * .35 + p * 3 - (1 - e) * 5, s: Math.max(.001, e * (1 - p * .2)) }); ORB.update(t, p, e); return jarCam(mx(9.6, 11, p), .3, .1 + p * .6) } };
  SC.farm = { stage: pl, light: pl.light, bg: BG.farm, fog: pl.fog, shift: [.15, .0], update: (p, t) => pl.farm(p, t) };
  SC.harvest = { stage: pl, light: pl.light, bg: BG.harvest, fog: pl.fog, shift: [.17, .0], update: (p, t) => pl.harvest(p, t) };
  SC.process = { stage: pr, light: pr.light, bg: pr.bg, shift: [.15, 0], update: (p, t) => pr.update(p, t) };
  SC.roast = { stage: ro, light: ro.light, bg: ro.bg, shift: [.14, 0], update: (p, t) => ro.update(p, t) };
  SC.extract = { stage: ex, light: ex.light, bg: ex.bg, shift: [.12, 0], update: (p, t) => ex.update(p, t) };
  SC.fill = { stage: fi, jar: true, light: fi.light, bg: fi.bg, shift: [.16, 0], update: (p, t) => { const c = fi.update(p, t); return c }, jt: fi.jt };
  SC.cup = { stage: cu, light: cu.light, bg: cu.bg, shift: [.15, 0], update: (p, t) => cu.update(p, t) };
  SC.prod = { jar: true, orbit: true, light: LJ, bg: BG.prod, shift: [.16, 0], update(p, t) {
    const sq = 1 - .5 * Math.sin(X.sq * Math.PI / 2); Object.assign(JT, { x: 0, y: Math.sin(t * .8) * .05, rx: .08, ry: p * 7.2 + X.spin + .3, s: 1 }); JT.sx = sq; ORB.update(t, p * .6, .8); return jarCam(8.8, .35, .05) } };
  SC.cust = { stage: cu, light: cu.light, bg: BG.cust, shift: [.16, 0], update: (p, t) => cu.showcase(p, t) };
  SC.story = { light: LJ, bg: BG.story, shift: [0, 0], update: () => jarCam(10) };
  SC.end = { jar: true, orbit: true, light: LJ, bg: BG.end, shift: [0, 0], update(p, t) {
    Object.assign(JT, { x: 0, y: .9 + Math.sin(t * .8) * .05, rx: .08, ry: (1 - p) * 6.283 + .35, s: .85 }); ORB.update(t, p * .5, 1); return jarCam(mx(8.6, 10.4, p), .5, .2) } };
  setP(0, true); setK(0);
}

function lightTo(pre, instant) {
  const { hemi, key, rim, R } = GL, set = (c, h) => { const l = lin(h); instant ? c.copy(l) : gsap.to(c, { r: l.r, g: l.g, b: l.b, duration: .8 }) }, num = (o, k, v) => instant ? o[k] = v : gsap.to(o, { [k]: v, duration: .8 });
  set(hemi.color, pre.hemi[0]); set(hemi.groundColor, pre.hemi[1]); num(hemi, 'intensity', pre.hemi[2]);
  set(key.color, pre.key[0]); num(key, 'intensity', pre.key[1]); key.position.set(...pre.key[2]);
  set(rim.color, pre.rim[0]); num(rim, 'intensity', pre.rim[1]); rim.position.set(...pre.rim[2]); num(R, 'toneMappingExposure', pre.exp);
}
function applyScene(id) {
  const sc = SC[id]; if (!sc || !GL.ok) return;
  Object.values(ST).forEach(s => s.g.visible = false); if (sc.stage) sc.stage.g.visible = true;
  J.root.visible = !!sc.jar; ORB.visible = !!sc.orbit;
  GL.S.fog = sc.fog ? new THREE.Fog(sc.fog[0], sc.fog[1], sc.fog[2]) : null;
  if (id !== 'roast') GL.warm.intensity = 0;
  J.lidG.position.set(0, J.lidY, 0); J.lidG.rotation.set(0, 0, 0); if (id !== 'fill') J.setFill(1);
  lightTo(sc.light || LJ, false); SNAP = true;
}
function setActive(id) {
  if (id === ACTIVE && READY) return; ACTIVE = id; const sc = SC[id];
  $('#rail').classList.toggle('on', !!CAPS[id]); $$('#rail li').forEach(l => l.classList.toggle('on', l.dataset.id === id)); $('#rhud').classList.toggle('on', id === 'roast');
  gsap.to(document.body, { '--bg': BG[id], duration: 1, overwrite: 'auto' });
  if (!READY) { applyScene(id); return }
  const veil = $('#veil'); gsap.killTweensOf(veil); veil.style.background = (sc && sc.bg) || BG[id];
  gsap.timeline().to(veil, { opacity: 1, duration: .16, ease: 'power1.in' }).add(() => applyScene(ACTIVE)).to(veil, { opacity: 0, duration: .55, ease: 'power2.out' });
}
document.body.style.setProperty('--bg', BG.hero);

/* ---------- حلقة الرسم ---------- */
let lastT = 0, slow = 0, dprNow = 0;
function frame(time) {
  const t = RM ? 0 : time, dt = Math.min(.1, time - lastT); lastT = time;
  if (lenis) lenis.raf(time * 1000);
  $('#bar').style.width = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) * 100 + '%';
  if (!GL.ok) return;
  const sc = SC[ACTIVE]; if (!sc) return;
  CUR[ACTIVE] += ((PR[ACTIVE] || 0) - CUR[ACTIVE]) * (SNAP ? 1 : Math.min(1, dt * 7)); const p = CUR[ACTIVE] || 0;
  const c = sc.update(p, RM ? 0 : time);
  const k = SNAP ? 1 : Math.min(1, dt * 6);
  camPos.lerp(c.p, k); camLook.lerp(c.l, k); GL.C.position.copy(camPos); GL.C.lookAt(camLook);
  SNAP = false;
  mouse.x += (mouse.tx - mouse.x) * .06; mouse.y += (mouse.ty - mouse.y) * .06;
  if (sc.jar) {
    const jt = sc.jt || JT, r = J.root; r.position.set(jt.x, jt.y, jt.z); r.rotation.set((jt.rx || 0) + mouse.y * .06, (jt.ry || 0) + mouse.x * .25, 0);
    const sx = (jt.sx || 1); r.scale.set(jt.s * sx, jt.s, jt.s * sx); if (jt === JT) JT.sx = 1;
    if (ACTIVE === 'hero' || ACTIVE === 'end' || ACTIVE === 'prod') { J.lidG.position.set(0, J.lidY, 0) }
  }
  if (ACTIVE !== 'roast') GL.warm.intensity = 0;
  if (ACTIVE === 'roast') { const h = sc.stage.hud(); $('#rtemp').textContent = AR(h.temp); $('#rname').textContent = h.name; $('#rbar').style.transform = `scaleX(${1 - h.t})` }
  // إزاحة الكادر: المجسّم على جنب والكلام على الجنب التاني
  const nar = narrow(), tx = nar ? 0 : sc.shift[0], ty = nar ? (sc.shift[0] ? (ACTIVE === 'hero' ? .32 : .2) : 0) : sc.shift[1];
  shift.x += (tx - shift.x) * .08; shift.y += (ty - shift.y) * .08;
  const w = innerWidth, h = innerHeight;
  if (Math.abs(shift.x) + Math.abs(shift.y) > .0005) GL.C.setViewOffset(w, h, shift.x * w, shift.y * h, w, h); else GL.C.clearViewOffset();
  capUpdate(ACTIVE, p); if (railOn !== ACTIVE) { railOn = ACTIVE; $('#rail').classList.toggle('on', !!CAPS[ACTIVE]); $$('#rail li').forEach(l => l.classList.toggle('on', l.dataset.id === ACTIVE)); $('#rhud').classList.toggle('on', ACTIVE === 'roast') }
  GL.R.render(GL.S, GL.C);
  // جودة تكيّفية
  if (dt > .034) slow += dt; else slow = Math.max(0, slow - dt * .5);
  if (slow > 2.5 && dprNow !== 1) { dprNow = 1; GL.R.setPixelRatio(1); size() }
}
function size() { const w = innerWidth, h = innerHeight; if (!GL.ok) return; GL.R.setSize(w, h, false); GL.C.aspect = w / h; GL.C.fov = w / h < .8 ? 44 : 36; GL.C.updateProjectionMatrix() }

/* ---------- السكرول: Lenis + ScrollTrigger ---------- */
function setupScroll() {
  if (!RM) {
    lenis = new Lenis({ lerp: .085, wheelMultiplier: .95, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
  }
  gsap.ticker.lagSmoothing(0);
  const ids = ['hero', 'farm', 'harvest', 'process', 'roast', 'extract', 'fill', 'cup', 'prod', 'cust', 'story', 'end'];
  ids.forEach(id => {
    const el = document.getElementById(id); CUR[id] = 0; PR[id] = 0;
    ScrollTrigger.create({ trigger: el, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (s.isActive) setActive(id) } });
    ScrollTrigger.create({ trigger: el, start: id === 'hero' ? 'top top' : 'top top', end: id === 'hero' || id === 'story' ? 'bottom top' : 'bottom bottom', onUpdate: s => PR[id] = s.progress, onRefresh: s => PR[id] = s.progress });
  });
  ScrollTrigger.create({ start: 40, end: 99999, onToggle: s => $('#nv').classList.toggle('s', s.isActive) });
  // دخول عناصر "حكايتنا"
  gsap.utils.toArray('[data-reveal]').forEach(e => gsap.from(e, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: e, start: 'top 85%' } }));
  // الروابط الداخلية
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const id = a.getAttribute('href').slice(1), t = document.getElementById(id); if (!t) return; e.preventDefault(); lenis ? lenis.scrollTo(t, { duration: 2.2 }) : t.scrollIntoView() }));
  // شريط المراحل
  const rail = $('#rail'), RL = { farm: 'الزراعة', harvest: 'القطف', process: 'التجفيف', roast: 'التحميص', extract: 'الاستخلاص', fill: 'التعبئة', cup: 'الكوباية' };
  rail.innerHTML = Object.keys(RL).map(id => `<li data-id="${id}"><button aria-label="${RL[id]}"><i></i><span>${RL[id]}</span></button></li>`).join('');
  rail.onclick = e => { const li = e.target.closest('li'); if (li) { const t = document.getElementById(li.dataset.id); lenis ? lenis.scrollTo(t, { duration: 2.4 }) : t.scrollIntoView() } };
}

/* ---------- الإقلاع ---------- */
async function boot() {
  try { await Promise.race([Promise.all(['700 100px "Reem Kufi"', '500 40px "Tajawal"', '400 30px "Tajawal"', '700 30px "Tajawal"'].map(f => document.fonts.load(f, 'بُنّ قهوة'))), new Promise(r => setTimeout(r, 2500))]) } catch (e) { }
  if (BRAND.logo) await new Promise(r => { const im = new Image(); im.onload = () => { BRAND._img = im; r() }; im.onerror = r; im.src = BRAND.logo });
  const ok = initGL($('#gl'));
  if (ok) { try { buildScenes(); size() } catch (e) { console.error(e); GL.ok = false } }
  if (!GL.ok) { document.body.classList.add('nogl'); setP(0, true); setK(0) }
  setupScroll(); addEventListener('resize', () => { size(); ScrollTrigger.refresh() });
  addEventListener('pointermove', e => { mouse.tx = e.clientX / innerWidth * 2 - 1; mouse.ty = e.clientY / innerHeight * 2 - 1; const c = $('#cur'); c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; c.classList.toggle('h', !!e.target.closest('a,button')) }, { passive: true });
  if (matchMedia('(pointer:fine)').matches) $('#cur').style.display = 'block';
  ScrollTrigger.refresh(); READY = true; setActive(ACTIVE === 'hero' && scrollY < 10 ? 'hero' : ACTIVE); applyScene(ACTIVE);
  gsap.ticker.add(frame);
  // مقدّمة الغلاف
  const tl = gsap.timeline({ delay: .2 });
  tl.add(() => $('#loader').classList.add('off'))
    .from('#hc .ln>span', { yPercent: 115, duration: 1.1, stagger: .12, ease: 'power4.out' }, .35).from('#hc .eye,#hc .sub,#hc .btn', { y: 20, opacity: 0, duration: .9, stagger: .12, ease: 'power3.out' }, .8)
    .from('#nv', { y: -40, opacity: 0, duration: .9, ease: 'power3.out' }, .8)
    .to(X, { intro: 1, duration: 2.2, ease: 'elastic.out(1,.7)' }, .4);
  if (!GL.ok) X.intro = 1;
  window.__ready = true;
}
boot();

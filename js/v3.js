/* v3.js — أرض وشجرة أطبع، كوباية عالية الجودة، طبقات القهوة بالأسهم، وكروت "في أي مكان" */
(() => {
  /* ---------- الأرض والشجرة ---------- */
  const P1 = Plantation;
  Plantation = function () {
    const s = P1(), g = s.g, r = rand(31), o = new THREE.Object3D();
    const trunk = s.shrub.children[0];
    if (trunk && trunk.material) { trunk.material.map = noiseTex(128, 256, '#b58a5a', 600, 3, true); trunk.material.color.set(0xffffff); trunk.material.needsUpdate = true }
    const N = LOW ? 260 : 620, bl = new THREE.InstancedMesh(new THREE.ConeGeometry(.018, .3, 3).translate(0, .15, 0), new THREE.MeshStandardMaterial({ roughness: .9 }), N); bl.frustumCulled = false;
    for (let i = 0; i < N; i++) { const a = r() * 6.283, d = 1.5 + Math.sqrt(r()) * 4.5, h = .5 + r() * 1.1; o.position.set(Math.cos(a) * d, 0, Math.sin(a) * d); o.rotation.set((r() - .5) * .5, r() * 6, (r() - .5) * .5); o.scale.set(1, h, 1); o.updateMatrix(); bl.setMatrixAt(i, o.matrix); bl.setColorAt(i, ramp([[0, '#3d6e2c'], [.6, '#6b9a3a'], [1, '#a3b84a']], r())) }
    g.add(bl);
    const fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.035, 0), new THREE.MeshStandardMaterial({ roughness: .6 }), 46);
    for (let i = 0; i < 46; i++) { const a = r() * 6.283, d = 2 + r() * 4; o.position.set(Math.cos(a) * d, .22 + r() * .12, Math.sin(a) * d); o.rotation.set(0, 0, 0); o.scale.set(1, 1, 1); o.updateMatrix(); fl.setMatrixAt(i, o.matrix); fl.setColorAt(i, lin(r() > .5 ? '#fff6d8' : '#f2c94c')) }
    g.add(fl);
    const st = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), M('#8a8478', .95), 26);
    for (let i = 0; i < 26; i++) { const a = r() * 6.283, d = 1.4 + r() * 5, k = .04 + r() * .09; o.position.set(Math.cos(a) * d, k * .3, Math.sin(a) * d); o.rotation.set(r() * 3, r() * 3, 0); o.scale.set(k * 1.3, k * .7, k); o.updateMatrix(); st.setMatrixAt(i, o.matrix) }
    g.add(st);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, .05, 6, 40), M('#3a2414', 1)); ring.rotation.x = -Math.PI / 2; ring.position.y = .03; g.add(ring);
    const f0 = s.farm; s.farm = (p, t) => { const c = f0(p, t); bl.rotation.y = RM ? 0 : Math.sin(t * .6) * .02; return c };
    return s;
  };

  /* ---------- الكوباية ---------- */
  const C0 = Cup;
  Cup = function () {
    const s = C0(), g = s.g, cs = g.children.filter(c => c.geometry && c.geometry.type === 'CircleGeometry'), foam = cs[1];
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'), gr = x.createRadialGradient(256, 256, 10, 256, 256, 256);
    gr.addColorStop(0, '#e9cfa2'); gr.addColorStop(.6, '#b98650'); gr.addColorStop(1, '#6a3a1a'); x.fillStyle = gr; x.fillRect(0, 0, 512, 512);
    x.fillStyle = '#fbf0da'; for (let i = 0; i < 6; i++) { const y = 150 + i * 42, w = 150 - i * 20; x.beginPath(); x.ellipse(256, y, w, 30, 0, 0, 7); x.fill() }
    x.strokeStyle = '#6a3a1a'; x.lineWidth = 7; x.beginPath(); x.moveTo(256, 120); x.lineTo(256, 400); x.stroke();
    const tx = new THREE.CanvasTexture(c); tx.encoding = THREE.sRGBEncoding; if (foam) { foam.material.map = tx; foam.material.color.set(0xffffff); foam.material.needsUpdate = true }
    const gold = new THREE.Mesh(new THREE.TorusGeometry(.835, .011, 8, 72), M('#d9b45a', .25, 1)); gold.rotation.x = Math.PI / 2; gold.position.y = 1.07; g.add(gold);
    const ck = new THREE.Mesh(new THREE.CylinderGeometry(.26, .26, .05, 24), M('#a8703a', .9)); ck.position.set(1.0, .13, .5); g.add(ck);
    for (let i = 0; i < 6; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 6), M('#2a160b')); d.position.set(1.0 + (Math.random() - .5) * .3, .17, .5 + (Math.random() - .5) * .3); g.add(d) }
    const bk = puffs(14, { color: '#ffcf8a', additive: true }); const r = rand(9); for (let i = 0; i < 14; i++) setPuff(bk, i, (r() - .5) * 14, 1 + r() * 4, -5 - r() * 3, 1.4 + r() * 1.6, .14 + r() * .12); flushPuffs(bk); g.add(bk);
    return s;
  };

  /* ---------- أقسام جديدة: طبقات القهوة + في أي مكان ---------- */
  const prod = document.getElementById('prod'); if (!prod) return;
  const sec = (id, h, html) => { const e = document.createElement('section'); e.className = 'v3 chap'; e.id = id; e.style.height = h; e.innerHTML = `<div class="st v3s">${html}</div>`; prod.before(e); return e };
  const R = y => 96 + 34 * y / 262, Y0 = 500, CX = 380;
  const LY = [{ n: 'حبيبات ذهبية', s: 'قهوة سريعة بتدوب في ثواني', a: 0, b: 55, c: ['#c48a52', '#e0a869'] }, { n: 'ماية سخنة', s: '٨٥° بتفتح الحبيبات وتسحب النكهة', a: 55, b: 120, c: ['#8a5a30', '#a8723e'] }, { n: 'قهوة مركّزة', s: 'القلب الغامق وفيه الطعم والكافيين', a: 120, b: 225, c: ['#3a1c0e', '#5a2c14'] }, { n: 'رغوة ذهبية', s: 'طبقة ناعمة بتحبس الريحة فوق', a: 225, b: 262, c: ['#d9b987', '#f1dcb2'] }];
  const sl = (l, i) => { const ra = R(l.a), rb = R(l.b), ya = Y0 - l.a, yb = Y0 - l.b, d = `M${CX - rb} ${yb}L${CX - ra} ${ya}A${ra} ${ra * .2} 0 0 0 ${CX + ra} ${ya}L${CX + rb} ${yb}Z`;
    return `<g class="ly"><path d="${d}" fill="${l.c[0]}"/><path d="${d}" fill="url(#sh)"/><ellipse cx="${CX}" cy="${yb}" rx="${rb}" ry="${rb * .2}" fill="${l.c[1]}"/>${i === 0 ? `<ellipse cx="${CX}" cy="${yb}" rx="${rb}" ry="${rb * .2}" fill="url(#dt)"/>` : ''}</g>` };
  const SH = i => -(i - 1.5) * 56;
  const arrows = LY.map((l, i) => { const side = i % 2 ? 1 : -1, y = Y0 - (l.a + l.b) / 2 + SH(i), x1 = CX + side * (R((l.a + l.b) / 2) + 14), x2 = CX + side * (R(l.b) + 150);
    return `<g class="ar" data-s="${side}"><path d="M${x2} ${y}L${x1} ${y}" pathLength="1" marker-end="url(#ah)"/><text x="${x2 + side * 10}" y="${y - 6}" text-anchor="${side > 0 ? 'start' : 'end'}" class="t1">${l.n}</text><text x="${x2 + side * 10}" y="${y + 18}" text-anchor="${side > 0 ? 'start' : 'end'}" class="t2">${l.s}</text></g>` }).join('');
  const L = sec('layers', '420vh', `<div class="lyc"><p class="eye">جوّه الكوباية</p><h2 id="lyh">بتتطبع طبقة طبقة</h2></div>
    <svg id="lysv" viewBox="0 0 760 680" aria-label="طبقات القهوة"><defs><linearGradient id="sh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".4" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient><pattern id="dt" width="10" height="8" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.6" fill="#6a3a1e"/><circle cx="8" cy="6" r="1.2" fill="#f0c590"/></pattern><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#e8bd78"/></marker></defs>
    <ellipse cx="${CX}" cy="${Y0 + 90}" rx="150" ry="16" fill="#000" opacity=".35"/>${LY.map(sl).join('')}<rect id="ph" x="${CX - 150}" y="0" width="300" height="3" rx="2" fill="#e8bd78"/>${arrows}</svg>`);
  const lys = [...L.querySelectorAll('.ly')], ars = [...L.querySelectorAll('.ar')], ph = L.querySelector('#ph'), lyh = L.querySelector('#lyh');
  let lt = '';
  ScrollTrigger.create({ trigger: L, start: 'top top', end: 'bottom bottom', onUpdate: s => { const p = s.progress, pp = rng(0, .38, p), sp = sm(rng(.4, .62, p));
    lys.forEach((e, i) => { const t = cl(pp * 4.4 - i); e.style.opacity = t; e.style.transform = `translateY(${(1 - sm(t)) * -46 + SH(i) * sp}px)` });
    ph.setAttribute('y', Y0 - pp * 262 + (1 - cl(pp * 4.4 - 3)) * 0); ph.style.opacity = pp > 0 && pp < 1 ? 1 : 0;
    ars.forEach((e, i) => { const q = sm(rng(.64 + i * .07, .74 + i * .07, p)); e.style.setProperty('--q', q); e.style.opacity = q });
    const T = p < .4 ? 'بتتطبع طبقة طبقة' : p < .64 ? 'وبعدين بتتفتح قدامك' : 'وكل طبقة ليها دور'; if (T !== lt) { lt = T; gsap.fromTo(lyh, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, onStart: () => lyh.textContent = T }) } } });

  const jar = (i, cls = '') => `<svg class="jr ${cls}" viewBox="0 0 80 112"><rect x="14" y="4" width="52" height="14" rx="4" fill="${P[i].lid}"/><rect x="8" y="16" width="64" height="92" rx="12" fill="#10241d" opacity=".9"/><rect x="8" y="44" width="64" height="52" fill="${P[i].c}"/><rect x="8" y="44" width="64" height="5" fill="${P[i].a}"/><text x="40" y="78" text-anchor="middle" font-family="Reem Kufi" font-size="22" font-weight="700" fill="${P[i].a}">${BRAND.name}</text></svg>`;
  const cup = `<svg class="cp" viewBox="0 0 120 120"><path class="st1" d="M45 40q-8-10 0-20M62 40q-8-10 0-20M79 40q-8-10 0-20"/><g class="sip"><path d="M24 50h66v22a33 33 0 0 1-66 0z" fill="#f3eee4"/><ellipse cx="57" cy="50" rx="33" ry="7" fill="#5a2c14"/><ellipse cx="57" cy="50" rx="22" ry="4" fill="#d9b987"/><path d="M90 56q22 0 18 18t-24 10" fill="none" stroke="#f3eee4" stroke-width="8"/></g></svg>`;
  const PL = [['🏠', 'في البيت', 'أول كوباية في الصبح، والبرطمان قاعد على رخامة المطبخ.', '🪴', '#2a4a3f', '#173029'], ['💼', 'في الشغل', 'ثواني بين اجتماعين من غير ماكينة ولا انتظار.', '🖥️', '#2b3f5c', '#16202f'], ['🚗', 'في الطريق', 'ماية سخنة من الترمس وملعقة، وتكمّل مشوارك.', '🧭', '#5a3a22', '#2a1a0e'], ['⛺', 'في الرحلة', 'خفيف وسهل يتشال في الشنطة وسط الجبل.', '🏔️', '#3a5a3a', '#1a2c1f'], ['📚', 'وقت المذاكرة', 'سهرة طويلة؟ كوباية سريعة تصحّيك.', '📖', '#4a2f5a', '#22142c']];
  const track = PL.map((c, i) => `<article class="pc" style="--g1:${c[4]};--g2:${c[5]}"><span class="pn">٠${AR(i + 1)}</span><div class="pi">${c[0]}</div><div class="pj">${c[3]}</div>${jar(i % 3, 'jj')}${cup}<h3>${c[1]}</h3><p>${c[2]}</p></article>`).reverse().join('');
  const PS = sec('places', '520vh', `<div class="pt"><p class="eye">في أي مكان</p><h2>العلبة معاك في كل حتة</h2></div><div class="trk">${track}</div>`);
  const tk = PS.querySelector('.trk');
  ScrollTrigger.create({ trigger: PS, start: 'top top', end: 'bottom bottom', onUpdate: s => { const w = tk.scrollWidth - innerWidth; tk.style.transform = `translateX(${-w * (1 - s.progress)}px)`; tk.querySelectorAll('.jj').forEach((j, i) => j.style.transform = `translateY(${Math.sin(s.progress * 9 + i) * 8}px) rotate(${Math.sin(s.progress * 6 + i) * 6}deg)`) } });
  [L, PS].forEach(e => ScrollTrigger.create({ trigger: e, start: 'top 60%', end: 'bottom 40%', onToggle: s => document.body.classList.toggle('nv3', s.isActive) }));
  addEventListener('load', () => ScrollTrigger.refresh());
})();

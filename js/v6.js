/* ============================================================
   v6.js — الغلاف: علبة في الوش بتتفتح وتتفكّك (Exploded view) مع كول-أوتس ذكية
   ترتيب الفك: الغطا يتفك ويطلع ← ختم الألومنيوم يتقشّر ← الليبل يتفرد ←
               الحبيبات تطلع في دوّامة ← الزجاج يشفّ ← تتجمّع تاني قبل الفصل اللي بعده
   ============================================================ */
(() => {
  const PI = Math.PI, TAU = PI * 2, E = (a, b, p) => sm(rng(a, b, p));
  const HE = { p: 0 }, hc = document.getElementById('hc');
  const hx = document.createElement('div'); hx.id = 'hx';
  const CO = [
    { k: 'lid', t: 'الغطا', d: 'بيتقفل بإحكام علشان الريحة تفضل طازة', at: [.27, .33], dx: .17, dy: .06 },
    { k: 'foil', t: 'ختم الألومنيوم', d: 'بيحمي الطعم لحد أول مرة تفتح', at: [.36, .42], dx: -.2, dy: -.03 },
    { k: 'lab', t: 'الليبل', d: 'بيحكي حكاية كل نوع وخلطته', at: [.47, .53], dx: -.02, dy: .24 },
    { k: 'gran', t: 'الحبيبات الذهبية', d: '٢٠٠ جم تكفي حوالي ١٠٠ كوباية', at: [.54, .6], dx: .19, dy: .0 },
    { k: 'glass', t: 'الزجاج', d: 'شفاف علشان تشوف الحبيبات جواه', at: [.64, .7], dx: .17, dy: .1 }
  ];
  hx.innerHTML = '<svg><g id="hxl"></g></svg>' + CO.map((c, i) => `<div class="co" data-k="${c.k}"><b><i>٠${AR(i + 1)}</i>${c.t}</b><span>${c.d}</span></div>`).join('') + '<div class="cm"><b></b><span></span></div>';
  document.body.append(hx);
  const SVG = hx.querySelector('#hxl'), cos = [...hx.querySelectorAll('.co')], cm = hx.querySelector('.cm'), cmb = cm.querySelector('b'), cms = cm.querySelector('span');
  const NS = 'http://www.w3.org/2000/svg';
  const lines = CO.map(() => { const pl = document.createElementNS(NS, 'polyline'), ci = document.createElementNS(NS, 'circle'); ci.setAttribute('r', 5); SVG.append(pl, ci); return [pl, ci] });
  let cmIdx = -1;

  let built = false, dirty = false, lab2, lab2g, foilG, foilM, gran, gd, ring, ring2, spk, glow, anch = {};
  const V = new THREE.Vector3();

  function build() {
    built = true;
    // ----- ليبل بيتفرد من أسطوانة لمسطّح
    const SEG = 96, r = 1.012, h = 1.62, arc = PI * 1.2, n = (SEG + 1) * 2;
    lab2g = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), idx = [];
    for (let i = 0; i <= SEG; i++) for (let j = 0; j < 2; j++) { const k = i * 2 + j; uv[k * 2] = i / SEG; uv[k * 2 + 1] = j }
    for (let i = 0; i < SEG; i++) { const a = i * 2, b = a + 1, c = a + 2, d = a + 3; idx.push(a, c, b, b, c, d) }
    lab2g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); lab2g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); lab2g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); lab2g.setIndex(idx);
    const lm = J.labMat.clone(); lm.side = THREE.DoubleSide; lab2 = new THREE.Mesh(lab2g, lm); lab2.frustumCulled = false; lab2.visible = false; lab2.userData = { SEG, r, h, arc }; J.inner.add(lab2);
    setBend(0);
    // ----- ختم الألومنيوم
    foilG = new THREE.Group(); foilG.position.set(-.7, 1.708, 0); J.inner.add(foilG);
    foilM = new THREE.MeshStandardMaterial({ color: lin('#d6d9dc'), metalness: .95, roughness: .26, envMapIntensity: 1.8 });
    const fd = new THREE.Mesh(new THREE.CylinderGeometry(.7, .7, .012, 56), foilM); fd.position.x = .7; foilG.add(fd);
    const fr = new THREE.Mesh(new THREE.RingGeometry(.52, .6, 56), new THREE.MeshStandardMaterial({ color: lin('#b78a2e'), metalness: .9, roughness: .3, side: THREE.DoubleSide })); fr.rotation.x = -PI / 2; fr.position.set(.7, .008, 0); foilG.add(fr);
    const tab = new THREE.Mesh(new THREE.TorusGeometry(.09, .018, 8, 20), foilM); tab.rotation.x = PI / 2; tab.position.set(.06, .012, 0); foilG.add(tab); foilG.visible = false;
    // ----- سحابة الحبيبات
    const N = LOW ? 120 : 220; gran = granuleMesh(N); gran.material = new THREE.MeshStandardMaterial({ color: lin('#5a2c14'), roughness: .35, metalness: .2, envMapIntensity: 1.3 }); gran.visible = false; J.inner.add(gran);
    const rr = rand(12); gd = Array.from({ length: N }, () => ({ rh: Math.sqrt(rr()) * .84, ah: rr() * TAU, yh: -1.45 + rr() * 2.1, rt: Math.sqrt(rr()) * .78, yt: 1.8 + rr() * 1.0, d: rr() * .45, s: .05 + rr() * .045, rot: rr() * 6, sp: .4 + rr() * .6 }));
    // ----- حلقات أرضية + وميض + شرارات
    const rm = () => new THREE.MeshBasicMaterial({ color: 0xffd48a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
    ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.035, 96), rm()); ring2 = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.02, 96), rm());
    [ring, ring2].forEach(m => { m.rotation.x = -PI / 2; m.position.y = -1.72; m.visible = false; J.inner.add(m) });
    spk = puffs(70, { color: '#ffd9a0', additive: true }); spk.visible = false; J.inner.add(spk);
    glow = puffs(2, { color: '#ffb25a', additive: true }); glow.visible = false; J.inner.add(glow);
    ['lid', 'foil', 'lab', 'gran', 'glass'].forEach(k => { anch[k] = new THREE.Object3D(); J.inner.add(anch[k]) });
  }
  function setBend(k) {            // k: 0 = ملفوف على العلبة, 1 = مسطّح
    const { SEG, r, h, arc } = lab2.userData, p = lab2g.attributes.position, nr = lab2g.attributes.normal, kap = (1 - k) / r;
    for (let i = 0; i <= SEG; i++) {
      const s = (-.5 + i / SEG) * arc * r; let x, z, nx, nz;
      if (kap < 1e-4) { x = s; z = r; nx = 0; nz = 1 } else { x = Math.sin(kap * s) / kap; z = Math.cos(kap * s) / kap - 1 / kap + r; nx = Math.sin(kap * s); nz = Math.cos(kap * s) }
      for (let j = 0; j < 2; j++) { const q = i * 2 + j; p.setXYZ(q, x, (j - .5) * h, z); nr.setXYZ(q, nx, 0, nz) }
    }
    p.needsUpdate = nr.needsUpdate = true;
  }

  function restore() {
    dirty = false; J.label.visible = true; if (lab2) lab2.visible = false; if (foilG) foilG.visible = false; if (gran) gran.visible = false;
    [ring, ring2, spk, glow].forEach(m => m && (m.visible = false));
    J.glass.material.opacity = .28; J.glass.scale.set(1, 1, 1); J.glass.position.y = 0; J.setFill(1); hx.style.opacity = 0; cos.forEach(c => c.style.opacity = 0);
  }

  /* ---------- الفك ---------- */
  function explode(t) {
    const hero = ACTIVE === 'hero';
    if (!hero) { if (dirty) restore(); return }
    if (!built) build();
    dirty = true; const p = HE.p, Rz = 1 - E(.86, .97, p);
    const lidA = E(.2, .36, p) * Rz, foilP = E(.3, .38, p) * Rz, foilF = E(.36, .48, p) * Rz, labA = E(.4, .56, p) * Rz, labB = E(.36, .52, p) * Rz, gA = E(.48, .7, p) * Rz, glA = E(.58, .72, p) * Rz, ex = E(.12, .5, p) * Rz;
    // الغطا: بيتفك وبيطلع
    J.lidG.position.set(0, J.lidY + 2.7 * lidA, 0); J.lidG.rotation.set(.18 * lidA, lidA * TAU * 1.5 + t * .35 * lidA, -.12 * lidA * Math.sin(t * .6));
    // الختم: تقشير ثم طفو
    const peel = 2.25 * foilP, flat = TAU - 2.25;
    foilG.visible = lidA > .02 || foilP > 0;
    foilG.position.set(mx(-.7, 0, foilF), mx(1.708, 1.708 + 1.7, foilF), 0); foilG.rotation.set(0, foilF * (TAU * .5) + t * .3 * foilF, peel + (foilP >= 1 ? foilF * flat * 0 : 0));
    foilG.children[0].position.x = mx(.7, 0, foilF); foilG.children[1].position.x = mx(.7, 0, foilF); foilG.children[2].position.x = mx(.06, -.64, foilF);
    foilG.rotation.z = mx(peel, TAU - .0, foilF * foilF) * 1;
    // الليبل
    J.label.visible = false; lab2.visible = true; if (lab2.material.map !== J.labMat.map) { lab2.material.map = J.labMat.map; lab2.material.needsUpdate = true }
    setBend(labB); const lp = ez3(labA);
    lab2.position.set(mx(0, -4.15, lp), mx(-.38, 1.0, lp), mx(0, 1.1, lp)); lab2.rotation.set(0, -J.root.rotation.y * lp, 0); lab2.scale.setScalar(mx(1, 1.12, lp));
    // الحبيبات
    gran.visible = gA > .001; J.setFill(1 - .92 * E(.0, 1, gA * 1.0));
    for (let i = 0; i < gd.length; i++) {
      const d = gd[i], q = ez3(rng(d.d, d.d + .5, gA)), a = d.ah + q * TAU * 1.4 + t * (.35 + d.sp * .5) * q, rad = mx(d.rh, d.rt, q) * (1 + Math.sin(q * PI) * .35), y = mx(d.yh, d.yt, q) + Math.sin(q * PI) * .5 + Math.sin(t * 1.3 + i) * .03 * q;
      const s = d.s * (q > 0 ? 1 : 0) * (1 - ez3(rng(0, .06, q)) * 0); put(gran, i, Math.cos(a) * rad, y, Math.sin(a) * rad, s * 1.3, s * .8, s, t + d.rot, d.rot, 0);
    } gran.instanceMatrix.needsUpdate = true;
    // الزجاج
    J.glass.material.opacity = .28 - .13 * glA; J.glass.scale.set(1 + .05 * glA, 1, 1 + .05 * glA); J.glass.position.y = -.3 * glA; J.fill.position.y = -1.53 - .3 * glA; J.mound.position.y -= .3 * glA; J.root.updateMatrixWorld(true);
    // حلقات + شرارات
    [ring, ring2].forEach((m, i) => { m.visible = ex > .01; const k = (t * .35 + i * .5) % 1; m.scale.setScalar(1.2 + ex * 1.6 + k * 2.4); m.material.opacity = ex * (1 - k) * .45 });
    spk.visible = ex > .01; for (let i = 0; i < 70; i++) { const u = (t * .12 + i / 70) % 1, an = i * 2.4 + t * .5; setPuff(spk, i, Math.cos(an) * (1.2 + (i % 5) * .35) * (.6 + ex * .8), -1.4 + u * 7.4, Math.sin(an) * (1.2 + (i % 4) * .4) * (.6 + ex * .8), .16 + (i % 3) * .05, Math.sin(u * PI) * .65 * ex) } flushPuffs(spk);
    glow.visible = true; setPuff(glow, 0, 0, 1.3, -1.2, 7 + ex * 4, .1 + ex * .12); setPuff(glow, 1, 0, 2.4, -1.4, 3 + gA * 5, .25 * gA); flushPuffs(glow);
    // نصوص الغلاف
    hc.style.opacity = 1 - E(.03, .12, p); hc.style.pointerEvents = p < .08 ? '' : 'none'; hc.style.transform = `translateY(${-E(.03, .14, p) * 30}px)`;
    // كول-أوتس
    const on = p > .22 && p < .95, wide = innerWidth > 760; hx.style.opacity = on ? 1 : 0;
    anch.lid.position.set(0, J.lidY + 2.7 * lidA + .1, 0); anch.foil.position.copy(foilG.position); anch.lab.position.copy(lab2.position); anch.gran.position.set(.65, 2.4, 0); anch.glass.position.set(.98 * (1 + .05 * glA), -.7 - .3 * glA, .2);
    J.inner.updateMatrixWorld(true);
    const W = innerWidth, H = innerHeight;
    CO.forEach((c, i) => {
      const a = E(c.at[0], c.at[1], p) * Rz, el = cos[i], [pl, ci] = lines[i]; anch[c.k].getWorldPosition(V); V.project(GL.C);
      const ax = (V.x * .5 + .5) * W, ay = (-V.y * .5 + .5) * H;
      if (!wide || a < .01) { el.style.opacity = 0; pl.setAttribute('points', ''); ci.setAttribute('r', 0); return }
      const bw = el.offsetWidth || 240, bh = el.offsetHeight || 64, tx = ax + c.dx * W, ty = ay + c.dy * H;
      const left = c.dx > .01 ? tx : c.dx < -.01 ? tx - bw : tx - bw / 2, top = ty - bh / 2;
      el.style.transform = `translate(${Math.round(left)}px,${Math.round(top)}px)`; el.style.opacity = a;
      const ex2 = c.dx > .01 ? left : c.dx < -.01 ? left + bw : tx, ey2 = Math.abs(c.dx) > .03 ? ty : (c.dy > 0 ? top : top + bh);
      pl.setAttribute('points', `${ax},${ay} ${ex2 - Math.sign(c.dx) * 0},${ey2}`); pl.style.opacity = a; ci.setAttribute('cx', ax); ci.setAttribute('cy', ay); ci.setAttribute('r', 5 * a); ci.style.opacity = a;
    });
    // الشريط الصغير للشاشات الضيقة
    if (!wide) { let k = -1; CO.forEach((c, i) => { if (p >= c.at[0] && p < .9) k = i }); cm.style.opacity = k >= 0 ? 1 : 0; if (k !== cmIdx) { cmIdx = k; if (k >= 0) { cmb.textContent = CO[k].t; cms.textContent = CO[k].d } } }
  }
  const ez3 = x => { x = cl(x); return x * x * (3 - 2 * x) };

  /* ---------- ربط المشهد ---------- */
  const B3 = buildScenes;
  buildScenes = function () {
    B3();
    const h = SC.hero; h.shift = [.13, 0];
    h.update = (p, t) => {
      HE.p = p; const e = X.intro, Rz = 1 - E(.86, .97, p), ex = E(.12, .5, p) * Rz, dr = window.__DR || { a: 0, b: 0 };
      h.shift[0] = mx(.13, 0, E(.05, .2, p));
      const sway = Math.sin(t * .5) * .16 * ex, spin = (t * .3 + p * 3) * (1 - ex);
      Object.assign(JT, { x: 0, y: .02 + Math.sin(t * 1.1) * .03, z: 0, rx: .1 + ex * .06 + dr.b * (1 - ex), ry: spin + sway + dr.a * (1 - E(.08, .2, p)) - (1 - e) * 5, s: Math.max(.001, e * (1.06 - ex * .04)) });
      ORB.update(t, p, e * (1 - ex * .75));
      cam.p.set(Math.sin(t * .3) * .25 * ex, mx(.45, 1.9, ex), mx(7.2, 16, ex)); cam.l.set(0, mx(.1, 1.2, ex), 0); return cam;
    };
    const r1 = GL.R.render.bind(GL.R); GL.R.render = (s, c) => { try { explode(performance.now() / 1000) } catch (e) { console.error(e) } r1(s, c) };
  };
})();

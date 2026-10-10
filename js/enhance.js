/* ============================================================
   enhance.js — بيتحمّل بعد main.js
   1) مزارعين بيزرعوا الشتلة (حفر ← زرع ← ري) + مزارعين في المدرّجات
   2) مطبخ بيت حواليين العلبة في الغلاف + تفاعل (سحب/ضغط/تغيير النوع)
   3) انتقالات سينمائية بين الفصول
   ============================================================ */
(() => {
  const DR = { a: 0, b: 0, v: 0, lid: 0, rot: 0, down: false, moved: 0, x: 0, y: 0 };
  const M = (c, r = .8, m = 0) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: m });
  const PI = Math.PI; window.__DR = DR;

  /* ---------- المزرعة: زرع حقيقي بشخصيات 3D (people.js) ---------- */
  const P0 = Plantation;
  Plantation = function () {
    const s = P0(), g = s.g, ter = g.children.find(c => c.isMesh && c.geometry.type === 'PlaneGeometry');
    const rc = new THREE.Raycaster(), dn = new THREE.Vector3(0, -1, 0);
    const hy = (x, z) => { if (!ter) return 0; rc.set(new THREE.Vector3(x, 60, z), dn); const h = rc.intersectObject(ter)[0]; return h ? h.point.y : 0 };
    const main = Person({ shirt: '#b4452f', pants: '#3b4a5a', vest: '#4a3a2a', hat: 'straw', hatC: '#e3c27a', seed: 4, beard: true }); g.add(main.g); main.g.scale.setScalar(.62);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(.13, 20), new THREE.MeshBasicMaterial({ color: 0x1c0f07 })); hole.rotation.x = -PI / 2; hole.position.y = .02; g.add(hole);
    const mound = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 8, 0, PI * 2, 0, PI / 2), M('#4a2f1a', 1)); mound.scale.y = .35; g.add(mound);
    const drops = puffs(16, { color: '#cfeaff' }); g.add(drops);
    const dust = puffs(10, { color: '#b79468' }); g.add(dust);
    const bgPos = [[7, -6], [-9, -12], [12, -2], [-14, 5], [5, -18], [-6, 12], [-3, 7], [9, 8]];
    const looks = [{ shirt: '#2f6f8f', hat: 'cap', hatC: '#efe9da', seed: 2, vest: '#3a2a1a', beard: true }, { shirt: '#8a5a2b', hat: 'straw', seed: 3, pants: '#3a3430' }, { shirt: '#6d3b8a', hat: 'wrap', hatC: '#c8b27a', seed: 5 }, { shirt: '#3d7a4a', hat: 'straw', seed: 6, vest: '#5a4630', hatBand: '#2f6f8f' }, { shirt: '#a8472f', hat: 'scarf', hatC: '#7a3a5a', skirt: true, pants: '#3a2a2a', seed: 7 }, { shirt: '#2f6f8f', hat: 'straw', seed: 8, beard: true }, { shirt: '#c8a24a', hat: 'cap', hatC: '#2f6f8f', seed: 9 }, { shirt: '#7a3a3a', hat: 'wrap', hatC: '#e8e0cc', seed: 10, vest: '#2a3a4a' }];
    const bg = bgPos.map((q, i) => { const f = Person(looks[i]); f.home = new THREE.Vector3(q[0], hy(q[0], q[1]), q[1]); f.g.position.copy(f.home); f.g.rotation.y = i * 1.7; f.g.scale.setScalar(.8); f.kind = i % 3; g.add(f.g); return { f, i } });
    const sv = new THREE.Vector3();
    function extra(p, t, harvest) {
      const arrive = sm(rng(.06, .2, p)), dig = rng(.2, .3, p), plant = rng(.3, .37, p), water = rng(.37, .5, p), leave = sm(rng(.52, .66, p));
      const F = main, x0 = 5.5, xS = .58, xP = .44, xe = 4.8;
      let x = harvest ? 9 : mx(mx(x0, xS, arrive), xe, leave); if (!harvest && p >= .3 && p < .52) x = mx(xS, xP, sm(rng(.29, .32, p))) + (p > .42 ? sm(rng(.42, .45, p)) * (xS - xP) : 0);
      if (!harvest && p >= .52) x = mx(xS, xe, leave);
      F.g.visible = !harvest && p > .05 && p < .7; F.g.position.set(x, hy(x, 0), 0); F.g.rotation.y = mx(-PI / 2, PI / 2, sm(rng(.5, .56, p)));
      const walk = p < .2 ? (x0 - x) * 12 : p >= .52 ? x * 12 : 0;
      if (harvest) { F.g.visible = true; F.g.position.set(-.42, hy(-.42, .55), .55); F.g.rotation.y = 1.15; F.act('pick', t * .55, t, {}) }
      else if (F.g.visible) {
        if (p < .2 && arrive < 1) F.act('walk', walk, t, { amp: arrive > 0 ? 1 : 0 });
        else if (p < .3) F.act('dig', dig * 3.2 + .0, t, {});
        else if (p < .37) F.act('plant', plant < .12 ? plant / .12 : 1, t, { gz: .5 });
        else if (p < .52) { F.act('water', rng(.38, .44, p) * (1 - rng(.48, .52, p)), t, {}) }
        else F.act('walk', walk, t, { amp: leave > 0 && leave < 1 ? 1 : 0 });
        if (p > .3 && p < .345 && F.tool !== 'seed') F.T.seed.visible = false;
        if (p >= .345 && F.T.seed) F.T.seed.visible = false;
      }
      hole.visible = p > .22 && p < .36 && !harvest; hole.scale.setScalar(.2 + sm(dig) * .8);
      mound.visible = p > .3 && !harvest; mound.scale.set(1, .35, 1); mound.scale.multiplyScalar(sm(rng(.3, .38, p)) * .01 + .0001 + sm(rng(.3, .38, p)) * 1.0);
      s.shrub.scale.setScalar(Math.max(.001, sm(rng(.32, .4, p)))); s.shrub.visible = harvest || p > .31;
      const wOn = F.g.visible && p > .39 && p < .5 ? 1 : 0, dOn = p > .2 && p < .3 ? 1 : 0;
      if (wOn) { F.g.updateMatrixWorld(true); F.T.can.localToWorld(sv.set(0, .15, .36)) } else sv.set(0, 0, 0);
      for (let i = 0; i < 16; i++) { const u = (t * 1.6 + i / 16) % 1, ty = Math.max(.03, sv.y); setPuff(drops, i, mx(sv.x, 0.03, u) + Math.sin(i * 3) * .03, ty * (1 - u * u) + .02, mx(sv.z, 0, u) + Math.sin(i * 5) * .03, .1, (1 - u * .5) * .8 * wOn) } flushPuffs(drops);
      for (let i = 0; i < 10; i++) { const u = (t * 1.1 + i / 10) % 1; setPuff(dust, i, Math.sin(i * 2.3) * .22 * u, .06 + u * .4, Math.cos(i * 1.7) * .22 * u, .22 + u * .3, (1 - u) * .45 * dOn * (Math.sin(dig * PI * 6) > 0 ? 1 : .3)) } flushPuffs(dust);
      bg.forEach(({ f, i }) => {
        const k = f.kind, h = f.home;
        if (k === 1 && !harvest) { const a = t * .25 + i, rx = h.x + Math.cos(a) * 1.8, rz = h.z + Math.sin(a) * 1.8; f.g.position.set(rx, hy(rx, rz), rz); f.g.rotation.y = Math.atan2(-Math.sin(a) * 1, Math.cos(a)) * 1 + PI / 2 + (PI); f.act('carry', t * 5.2 + i, t, { amp: 1 }) }
        else if (k === 2 && !harvest) { f.g.position.copy(h); f.act('dig', t * .55 + i * .3, t, {}) }
        else { f.g.position.copy(h); f.act('pick', t * .5 + i * .37, t, {}) }
      });
      s.shrub.rotation.x = RM ? 0 : Math.sin(t * .7 + 1) * .005;
    }
    const f0 = s.farm, h0 = s.harvest;
    s.farm = function (p, t) {
      const c = f0(p, t); extra(p, t, 0);
      const w = sm(rng(.06, .16, p)) * (1 - sm(rng(.4, .5, p))), k = rng(.06, .5, p);
      c.p.set(mx(c.p.x, -.35 + k * .5, w), mx(c.p.y, .95 + k * .25, w), mx(c.p.z, 3.0 - k * .3, w)); c.l.set(mx(c.l.x, .55, w), mx(c.l.y, .5, w), mx(c.l.z, 0, w)); return c;
    };
    s.harvest = function (p, t) { extra(p, t, 1); return h0(p, t) };
    return s;
  };

  /* ---------- مطبخ البيت (الغلاف) ---------- */
  function Home() {
    const g = new THREE.Group(); let wt = null; try { wt = woodTex(); wt.repeat.set(4, 1) } catch (e) { }
    const top = new THREE.Mesh(new THREE.BoxGeometry(24, .5, 8), wt ? new THREE.MeshStandardMaterial({ map: wt, roughness: .45, envMapIntensity: .9 }) : M('#7a5230', .5));
    top.position.set(0, -1.985, 1.4); g.add(top);
    const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d'); x.fillStyle = '#1c342d'; x.fillRect(0, 0, 512, 512);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { const gr = x.createLinearGradient(0, j * 64, 0, j * 64 + 64); gr.addColorStop(0, '#2b4e44'); gr.addColorStop(1, '#223f37'); x.fillStyle = gr; x.fillRect(i * 64 + 2, j * 64 + 2, 60, 60); x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(i * 64 + 4, j * 64 + 4, 56, 3) }
    const tt = new THREE.CanvasTexture(c); tt.encoding = THREE.sRGBEncoding; tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(5, 2);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshStandardMaterial({ map: tt, roughness: .35, envMapIntensity: .6 })); wall.position.set(0, 4.5, -3.4); g.add(wall);
    const wc = document.createElement('canvas'); wc.width = 256; wc.height = 320; const wx = wc.getContext('2d'), wg = wx.createLinearGradient(0, 0, 0, 320); wg.addColorStop(0, '#fff6dc'); wg.addColorStop(1, '#ffd48a'); wx.fillStyle = wg; wx.fillRect(0, 0, 256, 320);
    wx.strokeStyle = '#2a1d14'; wx.lineWidth = 10; wx.strokeRect(5, 5, 246, 310); wx.beginPath(); wx.moveTo(128, 0); wx.lineTo(128, 320); wx.moveTo(0, 160); wx.lineTo(256, 160); wx.stroke();
    const win = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(wc), toneMapped: false })); win.position.set(-6.2, 2.6, -3.38); g.add(win);
    const lamp = new THREE.PointLight(0xffc27a, 1.4, 22); lamp.position.set(-4, 3, -1); g.add(lamp);
    const sh = blobShadow(2.4, .6); sh.position.set(0, -1.73, 0); g.add(sh);
    // نبتة
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(.34, .26, .5, 18), M('#b4693f', .8)); pot.position.set(-3.6, -1.48, -.4); g.add(pot);
    for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.2, 10, 8), M('#2f7a3a', .6)); l.scale.set(.5, 1.6, .2); const a = i / 9 * PI * 2; l.position.set(-3.6 + Math.cos(a) * .22, -.9 + (i % 3) * .12, -.4 + Math.sin(a) * .22); l.rotation.set(Math.sin(a) * .6, 0, -Math.cos(a) * .6); g.add(l) }
    // مج
    const cer = new THREE.MeshPhysicalMaterial({ color: lin('#f3eee4'), roughness: .2, clearcoat: 1, side: THREE.DoubleSide });
    const mug = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.4, 0], [.44, .1], [.46, .75], [.42, .75], [.4, .1], [0, .05]].map(a => new THREE.Vector2(a[0], a[1])), 40), cer); mug.position.set(3.3, -1.735, .5); g.add(mug);
    const mh = new THREE.Mesh(new THREE.TorusGeometry(.2, .05, 10, 20, PI * 1.2), cer); mh.position.set(3.78, -1.35, .5); mh.rotation.z = -PI * .6; g.add(mh);
    return g;
  }

  /* ---------- تفاعل مع العلبة ---------- */
  const OK = ['hero', 'prod', 'end'];
  addEventListener('pointerdown', e => { if (!OK.includes(ACTIVE) || e.target.closest('a,button,.panel,.cap,nav,.vp')) return; DR.down = true; DR.moved = 0; DR.x = e.clientX; DR.y = e.clientY });
  addEventListener('pointermove', e => { if (!DR.down) return; const dx = e.clientX - DR.x, dy = e.clientY - DR.y; DR.x = e.clientX; DR.y = e.clientY; DR.a += dx * .011; DR.v = dx * .011; DR.b = cl(DR.b + dy * .003, -.45, .45); DR.moved += Math.abs(dx) + Math.abs(dy) });
  addEventListener('pointerup', () => { if (!DR.down) return; DR.down = false; if (DR.moved < 7 && ACTIVE === 'hero') popLid() });
  function popLid() { gsap.killTweensOf(DR); gsap.timeline().to(DR, { lid: 1.3, rot: .6, duration: .38, ease: 'power3.out' }).to(DR, { lid: 0, rot: 0, duration: .9, ease: 'bounce.out' }); DR.v = .1 }

  let home = null;
  const B0 = buildScenes;
  buildScenes = function () {
    B0(); home = Home(); home.visible = false; GL.S.add(home);
    ['hero', 'prod', 'end'].forEach(id => { const u = SC[id].update; SC[id].update = (p, t) => { const c = u(p, t); JT.ry += DR.a; JT.rx += DR.b; if (id === 'hero') JT.y += Math.sin(t * 1.1) * .03; return c } });
    const r0 = GL.R.render.bind(GL.R);
    GL.R.render = (s, c) => { if (!DR.down) { DR.a += DR.v; DR.v *= .93; DR.b *= .95 } if (OK.includes(ACTIVE) && DR.lid > .001) { J.lidG.position.y += DR.lid; J.lidG.position.x += DR.lid * .35; J.lidG.rotation.z = DR.rot } r0(s, c) };
  };
  const A0 = applyScene;
  applyScene = function (id) { A0(id); if (home) home.visible = id === 'hero' };

  /* ---------- واجهة الغلاف: أنواع + تلميح ---------- */
  const hc = document.getElementById('hc');
  if (hc) {
    const vp = document.createElement('div'); vp.className = 'vp';
    vp.innerHTML = '<span>جرّب العلبة:</span>' + P.map((p, i) => `<button data-i="${i}" aria-pressed="${i == 0}">${p.n}</button>`).join('');
    vp.onclick = e => { const b = e.target.closest('button'); if (!b) return;[...vp.querySelectorAll('button')].forEach(x => x.setAttribute('aria-pressed', x == b)); setP(+b.dataset.i); DR.v = .35 };
    hc.append(vp);
    const h = document.createElement('p'); h.className = 'hint'; h.textContent = 'اسحب علشان تلفّ العلبة · اضغط عليها علشان تفتح الغطا'; hc.append(h);
  }

  /* ---------- انتقالات سينمائية ---------- */
  const W = document.createElement('div'); W.id = 'wipe'; W.innerHTML = '<b></b><span></span>'; document.body.append(W);
  const wb = W.querySelector('b'), ws = W.querySelector('span');
  setActive = function (id) {
    if (id === ACTIVE && READY) return; ACTIVE = id; const sc = SC[id];
    $('#rail').classList.toggle('on', !!CAPS[id]); $$('#rail li').forEach(l => l.classList.toggle('on', l.dataset.id === id)); $('#rhud').classList.toggle('on', id === 'roast');
    gsap.to(document.body, { '--bg': BG[id], duration: 1, overwrite: 'auto' });
    if (!READY) { applyScene(id); return }
    const d = CH[id]; wb.textContent = d ? d.num : ''; ws.textContent = d ? d.kick : '';
    W.style.background = (sc && sc.bg) || BG[id];
    gsap.killTweensOf([W, wb, ws]);
    const tl = gsap.timeline();
    if (!W._c) tl.set(W, { clipPath: 'inset(100% 0% 0% 0%)', opacity: 1 });
    tl.to(W, { clipPath: 'inset(0% 0% 0% 0%)', duration: .42, ease: 'power3.inOut', onComplete: () => W._c = true })
      .add(() => applyScene(ACTIVE))
      .fromTo([wb, ws], { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .35, stagger: .06, ease: 'power3.out' }, '-=.05')
      .to([wb, ws], { y: -16, opacity: 0, duration: .25, ease: 'power2.in' }, '+=.1')
      .to(W, { clipPath: 'inset(0% 0% 100% 0%)', duration: .6, ease: 'power3.inOut', onComplete: () => W._c = false }, '-=.1');
  };
})();

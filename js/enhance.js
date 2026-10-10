/* ============================================================
   enhance.js — بيتحمّل بعد main.js
   1) مزارعين بيزرعوا الشتلة (حفر ← زرع ← ري) + مزارعين في المدرّجات
   2) مطبخ بيت حواليين العلبة في الغلاف + تفاعل (سحب/ضغط/تغيير النوع)
   3) انتقالات سينمائية بين الفصول
   ============================================================ */
(() => {
  const DR = { a: 0, b: 0, v: 0, lid: 0, rot: 0, down: false, moved: 0, x: 0, y: 0 };
  const M = (c, r = .8, m = 0) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: m });
  const PI = Math.PI;

  /* ---------- مزارع مجسّم بسيط بمفاصل ---------- */
  function Farmer(shirt, hatC) {
    const g = new THREE.Group(), hip = new THREE.Group(); hip.position.y = .46; g.add(hip);
    [-1, 1].forEach(s => { const l = new THREE.Mesh(new THREE.CylinderGeometry(.05, .04, .46, 8).translate(0, -.23, 0), M('#3b4a5a')); l.position.set(s * .065, .46, 0); g.add(l) });
    hip.add(new THREE.Mesh(new THREE.CylinderGeometry(.1, .13, .5, 10).translate(0, .25, 0), M(shirt)));
    const neck = new THREE.Group(); neck.position.y = .52; hip.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.085, 14, 10), M('#c58b5e', .7)); head.position.y = .1; neck.add(head);
    const hb = new THREE.Mesh(new THREE.CylinderGeometry(.21, .21, .012, 24), M(hatC, .9)); hb.position.y = .17; neck.add(hb);
    const ht = new THREE.Mesh(new THREE.CylinderGeometry(.075, .1, .08, 16), M(hatC, .9)); ht.position.y = .21; neck.add(ht);
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * .15, .46, 0); a.add(new THREE.Mesh(new THREE.CylinderGeometry(.034, .03, .42, 8).translate(0, -.21, 0), M(shirt))); hip.add(a); return a });
    const hoe = new THREE.Group(); hoe.position.y = -.42; hoe.add(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .9, 6).translate(0, -.3, 0), M('#6e4620')));
    const bl = new THREE.Mesh(new THREE.BoxGeometry(.015, .1, .16), M('#9aa0a6', .4, .8)); bl.position.set(0, -.76, .06); bl.rotation.x = .5; hoe.add(bl); arms[1].add(hoe);
    const can = new THREE.Group(); can.position.y = -.42; can.visible = false;
    const cb = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .16, 14), M('#4f8a5b', .5, .4)); cb.position.y = -.05; can.add(cb);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(.012, .02, .28, 8).translate(0, .14, 0), M('#4f8a5b', .5, .4)); sp.position.set(0, -.05, .09); sp.rotation.x = 1.0; can.add(sp); arms[1].add(can);
    return { g, hip, arms, hoe, can, pose(bend, arm) { hip.rotation.x = bend; hip.position.y = .46 - bend * .07; arms[0].rotation.x = arm; arms[1].rotation.x = arm } };
  }

  /* ---------- المزرعة: زرع حقيقي ---------- */
  const P0 = Plantation;
  Plantation = function () {
    const s = P0(), g = s.g, ter = g.children.find(c => c.isMesh && c.geometry.type === 'PlaneGeometry');
    const rc = new THREE.Raycaster(), dn = new THREE.Vector3(0, -1, 0);
    const hy = (x, z) => { if (!ter) return 0; rc.set(new THREE.Vector3(x, 60, z), dn); const h = rc.intersectObject(ter)[0]; return h ? h.point.y : 0 };
    const main = Farmer('#b4452f', '#e3c27a'); g.add(main.g);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(.13, 20), new THREE.MeshBasicMaterial({ color: 0x1c0f07 })); hole.rotation.x = -PI / 2; hole.position.y = .02; g.add(hole);
    const mound = new THREE.Mesh(new THREE.SphereGeometry(.2, 16, 8, 0, PI * 2, 0, PI / 2), M('#4a2f1a', 1)); mound.scale.y = .35; g.add(mound);
    const drops = puffs(16, { color: '#cfeaff' }); g.add(drops);
    const dust = puffs(10, { color: '#b79468' }); g.add(dust);
    const bgPos = [[7, -6], [-9, -12], [12, -2], [-14, 5], [5, -18], [-6, 12]], cols = ['#2f6f8f', '#8a5a2b', '#6d3b8a', '#3d7a4a', '#a8472f', '#2f6f8f'];
    const bg = bgPos.map((q, i) => { const f = Farmer(cols[i], i % 2 ? '#e3c27a' : '#c9a24d'); f.g.position.set(q[0], hy(q[0], q[1]), q[1]); f.g.rotation.y = i * 1.7; f.g.scale.setScalar(1.15); f.hoe.visible = false; g.add(f.g); return { f, i } });
    function extra(p, t, harvest) {
      const arrive = sm(rng(.06, .2, p)), dig = rng(.2, .3, p), plant = rng(.3, .37, p), water = rng(.37, .5, p), leave = sm(rng(.52, .66, p));
      const F = main, x = harvest ? 9 : mx(mx(5.5, 1.05, arrive), 4.8, leave);
      F.g.visible = !harvest && p > .05 && p < .7; F.g.position.set(x, 0, mx(.1, -.3, leave) + (1 - arrive) * .6);
      F.g.rotation.y = mx(-PI / 2, PI / 2, sm(rng(.5, .56, p)));
      const walking = (arrive < 1 && arrive > 0) || (leave > 0 && leave < 1), wb = walking ? Math.sin(t * 9) * .02 : 0;
      F.hoe.visible = p < .3; F.can.visible = p >= .36 && p < .56;
      if (p < .3) F.pose(.5 * sm(rng(.18, .22, p)) + .05, -1.8 + Math.sin(dig * PI * 6) * .7 * sm(dig * 6) * (dig > 0 ? 1 : 0));
      else if (p < .37) F.pose(mx(.5, .95, sm(plant)), mx(-1.8, -1.1, sm(plant)));
      else if (p < .52) F.pose(mx(.95, .15, sm(rng(.37, .42, p))), -1.15 - sm(rng(.4, .46, p)) * .35);
      else F.pose(.05 + wb * 4, Math.sin(t * 9) * .35 * (leave > 0 && leave < 1 ? 1 : 0));
      F.hip.position.y += wb;
      if (F.can.visible) F.can.rotation.x = -sm(rng(.4, .46, p)) * .7 * (1 - sm(rng(.48, .52, p)));
      hole.visible = p > .22 && p < .36 && !harvest; hole.scale.setScalar(.2 + sm(dig) * .8);
      mound.visible = p > .3 && !harvest; mound.scale.set(1, .35, 1); mound.scale.multiplyScalar(sm(rng(.3, .38, p)) * .01 + .0001 + sm(rng(.3, .38, p)) * 1.0);
      s.shrub.scale.setScalar(Math.max(.001, sm(rng(.32, .4, p)))); s.shrub.visible = harvest || p > .31;
      const wOn = F.can.visible && water > .22 && water < .85 ? 1 : 0, dOn = p > .2 && p < .3 ? 1 : 0;
      for (let i = 0; i < 16; i++) { const u = (t * 1.6 + i / 16) % 1; setPuff(drops, i, mx(x - .6, .03, u) + Math.sin(i * 3) * .03, .5 - u * u * .46, Math.sin(i * 5) * .04, .1, (1 - u * .5) * .8 * wOn) } flushPuffs(drops);
      for (let i = 0; i < 10; i++) { const u = (t * 1.1 + i / 10) % 1; setPuff(dust, i, Math.sin(i * 2.3) * .22 * u, .06 + u * .4, Math.cos(i * 1.7) * .22 * u, .22 + u * .3, (1 - u) * .45 * dOn * (Math.sin(dig * PI * 6) > 0 ? 1 : .3)) } flushPuffs(dust);
      bg.forEach(({ f, i }) => { const k = Math.max(0, Math.sin(t * .9 + i * 2)); f.pose(.2 + k * .7, harvest ? -2.2 + Math.sin(t * 1.4 + i) * .4 : -1.1 - k * .4) });
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

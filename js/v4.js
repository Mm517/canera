/* v4.js — ترقية مراحل المعالجة والتحميص والاستخلاص: عمّال + إضاءة + تفاصيل مكان */
(() => {
  const PI = Math.PI, MS = (c, r = .9, m = 0) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: m });
  const sack = (g, x, y, z, s, c = '#b79b6b') => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.34, .42, .7, 14), new THREE.MeshStandardMaterial({ map: noiseTex(64, 64, c, 300, 5, true), roughness: 1 }));
    m.scale.setScalar(s); m.position.set(x, y + .35 * s, z); m.rotation.y = x; g.add(m);
    const n = new THREE.Mesh(new THREE.ConeGeometry(.2, .24, 10), MS(c)); n.scale.setScalar(s); n.position.set(x, y + .8 * s, z); g.add(n);
  };
  const ray = () => {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, 'rgba(255,220,150,.5)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 256);
    return new THREE.Mesh(new THREE.PlaneGeometry(2.4, 9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  };

  /* ---- المعالجة: عمّال بيقلّبوا الحبوب على سرير التجفيف + شوالات + أشعة شمس ---- */
  const Pr0 = Process;
  Process = function () {
    const s = Pr0(), g = s.g, u = s.update;
    const w = [Farmer('#6d3b8a', '#efe9da'), Farmer('#2f6f8f', '#e3c27a')];
    w[0].g.position.set(0, 0, -2.7); w[1].g.position.set(3.1, 0, -.9); w[1].g.rotation.y = -PI / 2; w.forEach(f => { f.g.scale.setScalar(1.3); g.add(f.g) });
    [[-3.6, .2, .2, 1.1], [-3.2, 0, 1.1, .9], [3.8, 0, 1.6, 1], [-4.2, 0, -1.3, 1.2]].forEach(a => sack(g, a[0], 0, a[2], a[3]));
    const rays = [-3, 0, 3].map((x, i) => { const m = ray(); m.position.set(x, 4.2, -2.5 + i); m.rotation.z = .45; g.add(m); return m }), dust = puffs(36, { color: '#ffe2b0', additive: true }); g.add(dust);
    s.update = (p, t) => {
      const c = u(p, t), k = sm(rng(.45, .55, p)); w.forEach((f, i) => { f.g.visible = p > .4; f.pose(.4 + k * .15, -.9 + Math.sin(t * 2.2 + i * 1.7) * .5 * k) });
      w[0].g.position.x = Math.sin(t * .45) * 1.4; w[1].g.position.z = -.9 + Math.sin(t * .4 + 1) * .8;
      rays.forEach((m, i) => m.material.opacity = .6 + Math.sin(t * .6 + i) * .25);
      for (let i = 0; i < 36; i++) { const q = (t * .08 + i / 36) % 1; setPuff(dust, i, Math.sin(i * 4.1) * 4, .6 + q * 4.5, Math.cos(i * 2.7) * 2 - 1, .09 + Math.sin(i) * .03, Math.sin(q * PI) * .55) } flushPuffs(dust);
      return c;
    };
    return s;
  };

  /* ---- التحميص: محمّص بيراقب + شوالات بن أخضر + عدّاد حرارة حقيقي ---- */
  const Ro0 = Roast;
  Roast = function () {
    const s = Ro0(), g = s.g, u = s.update, FY = -3.2, R = 1.5;
    const w = Farmer('#e8eef0', '#efe9da'); w.g.position.set(3.7, FY, .6); w.g.rotation.y = -PI / 2; w.g.scale.setScalar(1.9); w.hoe.visible = false; g.add(w.g);
    [[-3.6, 1.3, 1.5], [-4.4, 1.0, 1.3], [-3.9, 2.0, 1.4]].forEach(a => sack(g, a[0], FY, a[1], a[2], '#a89468'));
    const gc = document.createElement('canvas'); gc.width = gc.height = 256; const x = gc.getContext('2d'); x.fillStyle = '#14110f'; x.beginPath(); x.arc(128, 128, 124, 0, 7); x.fill(); x.strokeStyle = '#d9b45a'; x.lineWidth = 6; x.stroke(); x.strokeStyle = '#f4efe6'; x.lineWidth = 3;
    for (let i = 0; i <= 10; i++) { const a = PI * .8 + i * PI * 1.4 / 10; x.beginPath(); x.moveTo(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100); x.lineTo(128 + Math.cos(a) * 116, 128 + Math.sin(a) * 116); x.stroke() }
    const gauge = new THREE.Mesh(new THREE.CircleGeometry(.42, 40), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gc) })); gauge.position.set(-R - .9, .5, .67); g.add(gauge);
    const nd = new THREE.Mesh(new THREE.BoxGeometry(.02, .3, .01).translate(0, .15, .01), MS('#ff6a2a', .4)); gauge.add(nd);
    s.update = (p, t) => {
      const c = u(p, t), T = s.hud().t, k = Math.max(0, Math.sin(t * .8));
      w.pose(.12, -1.1 - k * .9); nd.rotation.z = mx(2.2, -2.2, T) + (RM ? 0 : Math.sin(t * 20) * .015); return c;
    };
    return s;
  };

  /* ---- الاستخلاص: فنّي معمل + مواسير + لمبات بيان ---- */
  const Ex0 = Extract;
  Extract = function () {
    const s = Ex0(), g = s.g, u = s.update;
    const w = Farmer('#e8eef0', '#efe9da'); w.g.scale.setScalar(1.7); w.g.position.set(-3.1, 0, 1.7); w.hoe.visible = false; g.add(w.g);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, 12.4, 12).rotateZ(PI / 2), MS('#b9bec4', .3, .95)); pipe.position.set(0, 3.4, -1.8); g.add(pipe);
    const lamps = [-6, -3, 0, 3, 6].map(x => { const m = new THREE.Mesh(new THREE.SphereGeometry(.1, 12, 10), new THREE.MeshStandardMaterial({ color: 0x113a22, emissive: lin('#3dff8a'), emissiveIntensity: 1 })); m.position.set(x, 3.4, -1.68); g.add(m); return m });
    s.update = (p, t) => {
      const c = u(p, t), a = Math.sin(t * .9) * .5 + .5; w.pose(.05, -1.2 - a * .6);
      w.g.position.x += (c.l.x - 2.3 - w.g.position.x) * .06; lamps.forEach((l, i) => l.material.emissiveIntensity = 1.2 + Math.sin(t * 3 + i * 1.3));
      return c;
    };
    return s;
  };
})();

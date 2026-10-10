/* ============================================================
   stage_jar.js — التعبئة · الكوباية · مشاهد عرض العلبة (hero / التشكيلة / الختام)
   ============================================================ */
/* حبوب بن بتدور حوالين العلبة */
function Orbit(J) {
  const N = LOW ? 26 : 46, g = new THREE.Group(), m = beanMesh(N, { rough: .38 }), r = rand(77), cc = new THREE.Color();
  const D = Array.from({ length: N }, () => ({ a: r() * 6.28, rr: 2.2 + r() * 2.2, y: (r() - .5) * 4.4, sp: .25 + r() * .5, s: .1 + r() * .17, v: r(), z: (r() - .5) * 2.4 }));
  D.forEach((d, i) => m.setColorAt(i, cc.copy(ramp([[0, '#6a3a1c'], [.5, '#4a2410'], [1, '#2e160a']], d.v)).multiplyScalar(.85 + d.v * .3))); m.instanceColor.needsUpdate = true; g.add(m);
  g.update = (t, p, k = 1) => { for (let i = 0; i < N; i++) { const d = D[i], a = d.a + t * .25 * d.sp + p * 2.2, s = d.s * k;
    put(m, i, Math.cos(a) * d.rr, d.y + Math.sin(t * .6 + d.a) * .15, Math.sin(a) * d.rr * .6 + d.z - 1.2, s, s, s, t * d.sp + d.a, t * .6 * d.sp, d.a) } m.instanceMatrix.needsUpdate = true };
  return g;
}

/* ---------- مشهد التعبئة ---------- */
function Fill(J) {
  const g = new THREE.Group(), r = rand(55), N = LOW ? 80 : 150;
  const steel = new THREE.MeshStandardMaterial({ color: lin('#b9bec4'), roughness: .28, metalness: .95, side: THREE.DoubleSide, envMapIntensity: 1.4 });
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(.62, .2, .9, 40, 1, true), steel); noz.position.y = 4.7; g.add(noz);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, 6, 24), steel); pipe.position.y = 8.1; g.add(pipe);
  const gr = granuleMesh(N); g.add(gr);
  const D = Array.from({ length: N }, () => ({ u: r(), a: r() * 6.28, rr: Math.sqrt(r()) * .3, s: .028 + r() * .028, rot: r() * 6 }));
  const glow = puffs(20, { color: '#ffd9a0', additive: true }); g.add(glow);
  const cam = { p: new THREE.Vector3(), l: new THREE.Vector3() };
  const eo = x => 1 - Math.pow(1 - cl(x), 3);
  return {
    id: 'fill', g, jar: true, orbit: false, fog: null, bg: '#17302a',
    light: { hemi: ['#dfeee8', '#2a1d14', .6], key: ['#fff0d8', 1.4, [4, 7, 6]], rim: ['#ffc88a', 1, [-5, 3, -4]], exp: 1.1 },
    jt: { x: 0, y: 0, z: 0, rx: 0, ry: 0, s: 1 },
    update(p, t) {
      const lv = sm(rng(.04, .7, p)); J.setFill(.02 + lv * .98);
      const top = -.13 + (-1.53 + 2.28 * (.02 + lv * .98)) + .12, on = p > .03 && p < .72 ? 1 : 0;
      for (let i = 0; i < N; i++) { const d = D[i], u = (d.u + t * .9) % 1, y = mx(4.35, top, u * u * .85 + u * .15), k = 1 - .3 * u, a = d.a + t * 2;
        put(gr, i, Math.cos(a) * d.rr * k, y, Math.sin(a) * d.rr * k, d.s * on, d.s * on, d.s * on, d.rot + t * 4, d.rot, 0) } gr.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < 20; i++) { const u = (t * .5 + i / 20) % 1; setPuff(glow, i, Math.sin(i * 2) * .2, 4.2 - u * 1.2, 0, .5, (1 - u) * .25 * on) } flushPuffs(glow);
      // الغطا
      const q0 = sm(rng(.7, .79, p)), q1 = rng(.79, .9, p), e = eo(q1), over = Math.sin(q1 * Math.PI) * .07 * (1 - q1);
      const x = mx(-3.0, 0, q0), y = q1 <= 0 ? mx(2.3, 3.4, q0) : mx(3.4, J.lidY, e) - over, rz = mx(-.55, 0, q0);
      J.lidG.position.set(x, y, 0); J.lidG.rotation.set(0, (1 - e) * 6.28, rz);
      J.lidG.visible = true;
      this.jt.ry = sm(rng(.88, 1, p)) * 6.283 + Math.sin(p * 6) * .06; this.jt.rx = .04;
      const k = sm(p); cam.p.set(0, mx(1.1, .9, k), mx(11.8, 10.4, k)); cam.l.set(0, mx(1.2, .9, k), 0); return cam;
    }
  };
}

/* ---------- الكوباية ---------- */
function Cup() {
  const g = new THREE.Group(), r = rand(66);
  const wt = woodTex(); wt.repeat.set(2, 2);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, .2, 80), new THREE.MeshStandardMaterial({ map: wt, roughness: .6, metalness: 0 })); table.position.y = -.1; g.add(table);
  const cer = new THREE.MeshPhysicalMaterial({ color: lin('#f3eee4'), roughness: .16, metalness: 0, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: 1.3, side: THREE.DoubleSide });
  const saucer = new THREE.Mesh(new THREE.LatheGeometry([[0, .02], [.9, .02], [1.1, .05], [1.35, .16], [1.38, .18], [1.33, .18], [1.1, .09], [.85, .07], [0, .07]].map(a => new THREE.Vector2(a[0], a[1])), 64), cer); g.add(saucer);
  const mug = new THREE.Mesh(new THREE.LatheGeometry([[0, .16], [.62, .16], [.73, .35], [.78, 1.0], [.82, 1.02], [.84, .98], [.84, .35], [.74, .1], [0, .08]].map(a => new THREE.Vector2(a[0], a[1] + .06)), 72), cer); g.add(mug);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(.33, .065, 14, 30, Math.PI * 1.25), cer); hd.position.set(.84, .62, 0); hd.rotation.z = -Math.PI * .62; g.add(hd);
  const sw = document.createElement('canvas'); sw.width = sw.height = 256; const x = sw.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 5; k++) { x.strokeStyle = `rgba(0,0,0,${.05 + k * .01})`; x.lineWidth = 9; x.beginPath(); for (let a = 0; a < 18; a += .1) { const rr = 6 + a * 7 + k * 3, px = 128 + Math.cos(a + k * 1.3) * rr, py = 128 + Math.sin(a + k * 1.3) * rr; a ? x.lineTo(px, py) : x.moveTo(px, py) } x.stroke() }
  const stx = new THREE.CanvasTexture(sw); stx.encoding = THREE.sRGBEncoding;
  const liqMat = new THREE.MeshStandardMaterial({ color: lin('#c98a3a'), map: stx, roughness: .1, metalness: 0, envMapIntensity: 1.8, transparent: true, opacity: .96 });
  const liq = new THREE.Mesh(new THREE.CircleGeometry(1, 64), liqMat); liq.rotation.x = -Math.PI / 2; g.add(liq);
  const foam = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.MeshStandardMaterial({ color: lin('#e8cfa6'), map: stx, roughness: .6, transparent: true, opacity: 0 })); foam.rotation.x = -Math.PI / 2; g.add(foam);
  const gran = granuleMesh(46); g.add(gran); const gd = Array.from({ length: 46 }, () => ({ d: r() * .7, x: (r() - .5) * .14, z: (r() - .5) * .14, rx: (r() - .5) * .5, rz: (r() - .5) * .5, s: .028 + r() * .02, rot: r() * 6 }));
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(.05, .045, 1, 14).translate(0, -.5, 0), new THREE.MeshStandardMaterial({ color: lin('#d9efff'), transparent: true, opacity: .55, roughness: .05, envMapIntensity: 2 })); g.add(stream);
  const steel = new THREE.MeshStandardMaterial({ color: lin('#c3c8cf'), roughness: .25, metalness: .95, envMapIntensity: 1.4 });
  const spoon = new THREE.Group(); const bowl = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 12), steel); bowl.scale.set(1, .32, 1.5); spoon.add(bowl);
  const hdl = new THREE.Mesh(new THREE.CylinderGeometry(.025, .04, 1.5, 10), steel); hdl.rotation.x = Math.PI / 2; hdl.position.z = 1.0; hdl.rotation.z = 0; spoon.add(hdl); g.add(spoon);
  const spg = granuleMesh(10); spoon.add(spg); for (let i = 0; i < 10; i++) put(spg, i, (r() - .5) * .16, .06 + r() * .04, (r() - .5) * .3, .035);
  const kettle = new THREE.Group(), kb = new THREE.Mesh(new THREE.CylinderGeometry(.5, .6, .8, 32), steel), ks = new THREE.Mesh(new THREE.CylinderGeometry(.07, .12, .6, 14), steel); ks.position.set(-.55, -.15, 0); ks.rotation.z = Math.PI * .72; kettle.add(kb, ks); g.add(kettle);
  const ice = new THREE.Group(); const iceM = new THREE.MeshPhysicalMaterial({ color: lin('#e4f6ff'), roughness: .05, transparent: true, opacity: .55, clearcoat: 1, envMapIntensity: 2.2 });
  [[-.25, .1, .1], [.2, .08, -.2], [.1, .2, .25]].forEach((a, i) => { const c = new THREE.Mesh(new THREE.BoxGeometry(.3, .3, .3), iceM); c.position.set(a[0], 0, a[2]); c.rotation.set(i, i * 2, i * .5); ice.add(c) }); g.add(ice); ice.visible = false;
  const steam = puffs(30, { color: '#f4efe6' }); g.add(steam);
  const cam = { p: new THREE.Vector3(), l: new THREE.Vector3() };
  const state = { method: 0 }; const baseCol = new THREE.Color();
  const lvY = l => mx(.24, .98, l), lvR = l => mx(.62, .77, l) - .01;
  function show(level, dis, foamK, steamK, t, stream0) {
    const y = lvY(level) + .0; liq.position.y = y; liq.scale.setScalar(lvR(level)); liq.visible = level > .01;
    foam.position.y = y + .004; foam.scale.setScalar(lvR(level) * .96); foam.material.opacity = foamK * (state.method === 1 ? .55 : .8);
    for (let i = 0; i < 30; i++) { const u = (t * .22 + i / 30) % 1; setPuff(steam, i, Math.sin(i * 2.7 + t * .5) * .25 * u, y + .1 + u * 1.9, Math.cos(i * 1.9) * .25 * u, .5 + u * .9, Math.sin(u * Math.PI) * .26 * steamK) } flushPuffs(steam);
    ice.position.y = y - .05; ice.children.forEach((c, i) => c.position.y = Math.sin(t * 1.2 + i) * .02 + .02);
    liq.rotation.z = foam.rotation.z = RM ? 0 : t * .25;
  }
  return {
    id: 'cup', g, jar: false, fog: null, bg: '#1c2c27', state, show, liqMat, ice,
    light: { hemi: ['#ffe9cf', '#2a1d14', .6], key: ['#fff0d8', 1.6, [4, 7, 5]], rim: ['#ffb870', 1, [-5, 3, -4]], exp: 1.12 },
    setMethod(k, instant) { state.method = k; const K0 = K[k]; ice.visible = K0.ice; const c = lin(K0.liquid); if (instant) liqMat.color.copy(c); else gsap.to(liqMat.color, { r: c.r, g: c.g, b: c.b, duration: .8 }) },
    update(p, t) {
      const pourK = rng(.24, .64, p), lvl = sm(pourK) * .93 + .02, dis = sm(rng(.3, .72, p));
      state.method = 0; ice.visible = false;
      liqMat.color.copy(ramp([[0, '#d6a05a'], [.5, '#7a4318'], [1, '#2a1209']], dis)); liqMat.opacity = mx(.6, .96, sm(rng(.24, .34, p)));
      const spA = rng(.0, .24, p), cx = mx(-1.4, 0, sm(rng(0, .06, p))) , tilt = sm(rng(.05, .18, p));
      spoon.position.set(cx * 0 + mx(1.6, 0, sm(rng(0, .08, p))), mx(2.4, 1.9, sm(rng(0, .08, p))), 0); spoon.rotation.set(0, -Math.PI / 2, -tilt * .0); spoon.rotation.x = 0; spoon.rotation.z = 0; spoon.children[0].rotation.x = 0;
      spoon.rotation.set(tilt * .9, Math.PI / 2 * 0 + 0, 0); spoon.rotation.y = Math.PI; spoon.visible = p < .24;
      for (let i = 0; i < 46; i++) { const d = gd[i], q = rng(.05 + d.d * .12, .13 + d.d * .12, p), s = d.s * (q > 0 ? 1 : 0) * (1 - sm(rng(.34, .6, p)) * .95); put(gran, i, d.x * q + mx(0, d.rx, q), mx(1.85, .22, q * q), d.z + d.rz * q, Math.max(.0001, s), Math.max(.0001, s), Math.max(.0001, s), d.rot, d.rot, 0) } gran.instanceMatrix.needsUpdate = true;
      const ks = sm(rng(.18, .28, p)) * (1 - sm(rng(.62, .72, p)));
      kettle.position.set(mx(-.2, -.7, 1) , mx(4.2, 3.6, ks) + (1 - ks) * 1.5, 0); kettle.rotation.z = -ks * .55; kettle.visible = ks > .01;
      const surf = lvY(lvl), top = kettle.position.y - .25; stream.position.set(0, top, 0); stream.scale.set(1, Math.max(.001, (top - surf)), 1); stream.visible = pourK > 0 && pourK < 1 && ks > .5;
      stream.position.x = -.0;
      show(pourK > 0 ? lvl : 0, dis, sm(rng(.62, .8, p)), sm(rng(.45, .8, p)), t);
      const o = RM ? 0 : rng(.7, 1, p) * 1.2, k = sm(p); cam.p.set(Math.sin(o) * mx(5.4, 4.2, k), mx(3.9, 2.9, k), Math.cos(o) * mx(5.8, 4.4, k)); cam.l.set(0, mx(1.4, .8, k), 0); return cam;
    },
    showcase(p, t) {         // لقسم "طريقتك": كوباية جاهزة بالطريقة المختارة
      liqMat.color.copy(lin(K[state.method].liquid)); liqMat.opacity = .96; ice.visible = K[state.method].ice; show(.9, 1, state.method === 1 ? 1 : .6, .75, t); spoon.visible = false; kettle.visible = false; stream.visible = false; for (let i = 0; i < 46; i++) put(gran, i, 0, 0, 0, .0001); gran.instanceMatrix.needsUpdate = true;
      const o = t * .25 + p * 1.2; cam.p.set(Math.sin(o) * 4.8, 3.3, Math.cos(o) * 5.2); cam.l.set(0, .8, 0); return cam;
    }
  };
}

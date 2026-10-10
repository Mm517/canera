/* ============================================================
   stage_proc.js — المعالجة والتجفيف · التحميص · الاستخلاص
   ============================================================ */
const woodTex = () => { const c = document.createElement('canvas'); c.width = 512; c.height = 512; const x = c.getContext('2d'), r = rand(4);
  for (let i = 0; i < 8; i++) { x.fillStyle = `hsl(28,${28 + r() * 10}%,${22 + r() * 8}%)`; x.fillRect(0, i * 64, 512, 62); x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, i * 64 + 62, 512, 2); for (let j = 0; j < 40; j++) { x.fillStyle = `rgba(0,0,0,${r() * .08})`; x.fillRect(r() * 512, i * 64 + r() * 60, 40 + r() * 140, 1) } }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t };

/* ---------------- المعالجة: كرز → حبوب خضرا → تجفيف ---------------- */
function Process() {
  const g = new THREE.Group(), r = rand(21), NC = 140, NB = 280;
  const wt = woodTex(); wt.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ map: wt, roughness: .75, metalness: 0 })); floor.rotation.x = -Math.PI / 2; g.add(floor);
  // سرير التجفيف
  const bed = new THREE.Group(), mc = document.createElement('canvas'); mc.width = mc.height = 128; const mxx = mc.getContext('2d'); mxx.fillStyle = '#7a5a36'; mxx.fillRect(0, 0, 128, 128); mxx.strokeStyle = '#2a1c10'; mxx.lineWidth = 3; for (let i = 0; i <= 128; i += 8) { mxx.beginPath(); mxx.moveTo(i, 0); mxx.lineTo(i, 128); mxx.moveTo(0, i); mxx.lineTo(128, i); mxx.stroke() }
  const mt = new THREE.CanvasTexture(mc); mt.encoding = THREE.sRGBEncoding; mt.wrapS = mt.wrapT = THREE.RepeatWrapping; mt.repeat.set(22, 12);
  const top = new THREE.Mesh(new THREE.BoxGeometry(4.6, .06, 2.6), new THREE.MeshStandardMaterial({ map: mt, roughness: .8 })); top.position.y = .6; bed.add(top);
  const wood = new THREE.MeshStandardMaterial({ color: lin('#5a3a1e'), roughness: .8 });
  [[-2.3, -1.3], [2.3, -1.3], [-2.3, 1.3], [2.3, 1.3]].forEach(([x, z]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(.12, .6, .12), wood); l.position.set(x, .3, z); bed.add(l) });
  [[0, -1.3, 4.7, .1, .1], [0, 1.3, 4.7, .1, .1]].forEach(a => { const b = new THREE.Mesh(new THREE.BoxGeometry(a[2], a[3], a[4]), wood); b.position.set(a[0], .63, a[1]); bed.add(b) });
  [[-2.3, 0], [2.3, 0]].forEach(([x]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(.1, .1, 2.7), wood); b.position.set(x, .63, 0); bed.add(b) });
  bed.position.set(0, 0, -.9); g.add(bed);
  const BP = new THREE.Vector3(0, 0, 1.9), basket = makeBasket(); basket.position.copy(BP); g.add(basket);
  const sh = blobShadow(1.1, .5); sh.position.set(BP.x, .005, BP.z); g.add(sh);
  const shB = blobShadow(3.4, .55); shB.scale.set(1.5, 1, 1); shB.position.set(0, .01, -.9); g.add(shB);
  const chM = cherryMesh(NC), bnM = beanMesh(NB, { rough: .55 }), slots = BASKET_SLOTS(NC, 9);
  g.add(chM, bnM);
  const red = lin('#b3141c'), cc = new THREE.Color();
  for (let i = 0; i < NC; i++) chM.setColorAt(i, cc.copy(red).multiplyScalar(.55 + r() * .3));
  const gz = [[0, '#7f9a52'], [.5, '#97a864'], [1, '#b2b27a']];
  const bedPos = [], bs = Math.ceil(Math.sqrt(NB * 2.2 / 1.0)), cols = 28, rows = 10;
  for (let i = 0; i < NB; i++) { const cx = i % cols, cy = Math.floor(i / cols); bedPos.push([(cx / (cols - 1) - .5) * 4.0 + (r() - .5) * .12, .665, -.9 + (cy / (rows - 1) - .5) * 2.1 + (r() - .5) * .12, r() * 6]) }
  const orderB = Array.from({ length: NB }, (_, i) => r());
  const cam = { p: new THREE.Vector3(), l: new THREE.Vector3() }; let lastC = -1;
  return {
    id: 'process', g, fog: null, bg: '#241810',
    light: { hemi: ['#ffe7c4', '#3a2616', .7], key: ['#ffe2b0', 2.0, [3, 7, 4]], rim: ['#ffc080', .6, [-5, 3, -4]], exp: 1.15 },
    update(p, t) {
      const sp = sm(rng(.26, .46, p)), cs = sm(rng(.24, .38, p));
      for (let i = 0; i < NC; i++) { const s = slots[i], sc = .068 * (1 - cs) * (1 + Math.sin(t * 9 + i) * .03 * cs);
        put(chM, i, BP.x + s[0], BP.y + s[1] + .03, BP.z + s[2], Math.max(.0001, sc), Math.max(.0001, sc * 1.03), Math.max(.0001, sc), i, i * 2, 0) }
      chM.instanceMatrix.needsUpdate = true;
      const dry = sm(rng(.62, 1, p));
      for (let i = 0; i < NB; i++) {
        const ci = i >> 1, s = slots[ci % NC], side = i & 1 ? 1 : -1, ox = side * .028, f0 = .5 + orderB[i] * .3, q = sm(rng(f0, f0 + .16, p)), e = bedPos[i];
        const px = mx(BP.x + s[0] + ox, e[0], q), py = mx(BP.y + s[1] + .03, e[1], q) + Math.sin(q * Math.PI) * .9 * (1 - 0), pz = mx(BP.z + s[2], e[2], q);
        const sc = .07 * sp;
        put(bnM, i, px, py, pz, Math.max(.0001, sc), Math.max(.0001, sc), Math.max(.0001, sc), q * 5 + i, e[3] + q * 4, i * .3);
      }
      bnM.instanceMatrix.needsUpdate = true;
      const dq = Math.round(dry * 40); if (dq !== lastC) { lastC = dq; for (let i = 0; i < NB; i++) bnM.setColorAt(i, cc.copy(ramp(gz, dry * .9 + orderB[i] * .15)).multiplyScalar(.86 + orderB[(i * 7) % NB] * .25)); bnM.instanceColor.needsUpdate = true }
      basket.position.x = mx(0, -3.6, sm(rng(.82, .98, p))); sh.position.x = basket.position.x;
      const a = sm(rng(.0, .45, p)), b = sm(rng(.5, .78, p));
      const P = [mx(mx(.5, .3, a), 2.6, b), mx(mx(1.9, 2.0, a), 3.0, b), mx(mx(4.4, 4.2, a), 5.4, b)], L = [mx(mx(0, 0, a), 0, b), mx(.3, .5, b), mx(mx(1.9, 1.7, a), -.5, b)];
      const orb = rng(.8, 1, p) * .5; P[0] += Math.sin(orb) * 0; cam.p.set(P[0], P[1], P[2]); cam.l.set(L[0], L[1], L[2]); return cam;
    }
  };
}

/* ---------------- التحميص: أسطوانة تلف + حبوب خضرا → بنّي غامق ---------------- */
function Roast() {
  const g = new THREE.Group(), r = rand(33), R = 1.5, D = 1.3, N = LOW ? 130 : 230;
  const steel = new THREE.MeshStandardMaterial({ color: lin('#b9bec4'), roughness: .3, metalness: .95, side: THREE.DoubleSide, envMapIntensity: 1.3 });
  const dark = new THREE.MeshStandardMaterial({ color: lin('#2a2d31'), roughness: .55, metalness: .5 });
  const drum = new THREE.Group(); g.add(drum);
  const shell = new THREE.Mesh(new THREE.CylinderGeometry(R, R, D, 72, 1, true), steel); shell.rotation.x = Math.PI / 2; drum.add(shell);
  const pc = document.createElement('canvas'); pc.width = pc.height = 512; const px = pc.getContext('2d'); px.fillStyle = '#6f757c'; px.fillRect(0, 0, 512, 512);
  for (let y = 12; y < 512; y += 24) for (let x = (y / 24 % 2) * 12 + 6; x < 512; x += 24) { px.fillStyle = '#15171a'; px.beginPath(); px.arc(x, y, 5, 0, 7); px.fill() }
  const pt = new THREE.CanvasTexture(pc); pt.encoding = THREE.sRGBEncoding;
  const back = new THREE.Mesh(new THREE.CircleGeometry(R, 72), new THREE.MeshStandardMaterial({ map: pt, roughness: .4, metalness: .85, emissive: lin('#ff5a10'), emissiveIntensity: 0 })); back.position.z = -D / 2; drum.add(back);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .2, 24), steel); hub.rotation.x = Math.PI / 2; hub.position.z = -D / 2 + .1; drum.add(hub);
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(.1, .42, D - .06), steel); const a = i * Math.PI / 2 + .4; f.position.set(Math.cos(a) * (R - .2), Math.sin(a) * (R - .2), 0); f.rotation.z = a; drum.add(f) }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R + .06, .1, 18, 90), steel); ring.position.z = D / 2; g.add(ring);
  const face = new THREE.Mesh(new THREE.RingGeometry(R + .1, R + 1.6, 72), dark); face.position.z = D / 2 + .02; g.add(face);
  const bolts = new THREE.InstancedMesh(new THREE.SphereGeometry(.045, 10, 8), steel, 20); for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283; put(bolts, i, Math.cos(a) * (R + .5), Math.sin(a) * (R + .5), D / 2 + .04, 1) } g.add(bolts);
  const chim = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, 1.2, 20), steel); chim.position.set(1.7, R + .8, -.1); g.add(chim);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: lin('#0d0705'), roughness: .95, metalness: 0, envMapIntensity: .1 })); fl.rotation.x = -Math.PI / 2; fl.position.y = -R - 1.7; g.add(fl);
  const sh = blobShadow(3.4, .6); sh.position.y = -R - 1.69; g.add(sh);
  const bn = beanMesh(N, { rough: .5 }); g.add(bn);
  const B = Array.from({ length: N }, (_, i) => ({ u: r(), d: r(), z: (r() - .5) * (D - .3), v: r(), sp: .8 + r() * .5, rot: r() * 6 }));
  const smoke = puffs(40, { color: '#cfc7bd' }); g.add(smoke); const glow = puffs(24, { color: '#ff7a1a', additive: true }); g.add(glow);
  const RS = [[0, '#86a24f'], [.3, '#a9b052'], [.55, '#cfa84a'], [.74, '#b4803c'], [.84, '#8a5427'], [.92, '#5a2f16'], [1, '#2e170c']];
  const cc = new THREE.Color(); let lastQ = -1;
  const cam = { p: new THREE.Vector3(), l: new THREE.Vector3() };
  const stageName = t => t < .3 ? 'تجفيف' : t < .62 ? 'اصفرار' : t < .8 ? 'تحمير' : t < .9 ? 'الفرقعة الأولى' : t < .97 ? 'تطوّر النكهة' : 'تحميص غامق';
  let hud = { temp: 25, name: 'تجفيف', t: 0 };
  return {
    id: 'roast', g, fog: null, bg: '#160b06', hud: () => hud,
    light: { hemi: ['#ffb070', '#1a0c06', .35], key: ['#ffd9b0', 1.3, [3, 5, 6]], rim: ['#ff8a40', 1.1, [-5, 1, -3]], exp: 1.12 },
    update(p, t) {
      const T = sm(rng(0, .96, p)), tempC = 25 + 205 * T; hud = { temp: Math.round(tempC), name: stageName(T), t: T };
      drum.rotation.z = RM ? p * 8 : t * .9 + p * 3;
      const puff = .2 * sm(rng(.83, .97, T)), sc = .125 * (1 + puff);
      for (let i = 0; i < N; i++) {
        const b = B[i], u = (b.u + t * .1 * b.sp + (RM ? p * 2 : 0)) % 1, rr = R * (.93 - b.d * .5);
        let x, y; const a0 = -1.75, a1 = -.2;
        if (u < .62) { const a = mx(a0, a1, u / .62); x = Math.cos(a) * rr; y = Math.sin(a) * rr }
        else { const k = (u - .62) / .38, ke = k * k * (.5 + .5 * k), pa = [Math.cos(a1) * rr, Math.sin(a1) * rr], pb = [Math.cos(a0 - .35) * rr * .9, Math.sin(a0 - .2) * rr * .95]; x = mx(pa[0], pb[0], ke); y = mx(pa[1], pb[1], ke) + Math.sin(k * Math.PI) * .12 }
        put(bn, i, x, y + .05, b.z, sc * (.9 + b.v * .2), sc * (.9 + b.v * .2), sc * (.9 + b.v * .2), b.rot + t * 2 * b.sp, b.rot * 2 + u * 9, b.rot);
      }
      bn.instanceMatrix.needsUpdate = true; bn.material.roughness = mx(.55, .28, rng(.85, 1, T));
      const q = Math.round(T * 60); if (q !== lastQ) { lastQ = q; for (let i = 0; i < N; i++) bn.setColorAt(i, cc.copy(ramp(RS, cl(T + (B[i].v - .5) * .08))).multiplyScalar(.9 + B[i].v * .2)); bn.instanceColor.needsUpdate = true }
      back.material.emissiveIntensity = .25 * T; GL.warm.color.set('#ff7a20'); GL.warm.intensity = 1.6 + T * 3.2; GL.warm.position.set(0, -2.2, 2.4);
      for (let i = 0; i < 40; i++) { const u = (t * .22 + i / 40) % 1; setPuff(smoke, i, 1.7 + Math.sin(i * 2.3 + t) * .12 * u * 2, R + 1.5 + u * 3.2, -.1 + Math.cos(i) * .1 * u, (.45 + u * 1.3) * 1, Math.sin(u * Math.PI) * .32 * rng(.35, .8, T)) } flushPuffs(smoke);
      for (let i = 0; i < 24; i++) { const u = (t * .6 + i / 24) % 1; setPuff(glow, i, Math.sin(i * 1.7) * 1.3, -R - .5 + u * .6, .4 + Math.cos(i * 2.1) * .5, .5 * (1 - u * .5), (1 - u) * .45 * (.3 + T)) } flushPuffs(glow);
      const k = sm(rng(0, 1, p)); cam.p.set(mx(2.6, 1.2, k), mx(.9, .5, k), mx(8.6, 6.0, k)); cam.l.set(0, 0, 0); return cam;
    }
  };
}

/* ---------------- الاستخلاص: طحن → استخلاص بالماية السخنة → تجميد وتجفيف ---------------- */
function Extract() {
  const g = new THREE.Group(), r = rand(44);
  const steel = new THREE.MeshStandardMaterial({ color: lin('#b9bec4'), roughness: .3, metalness: .95, side: THREE.DoubleSide, envMapIntensity: 1.3 });
  const darkS = new THREE.MeshStandardMaterial({ color: lin('#262b30'), roughness: .45, metalness: .8 });
  const glassM = () => new THREE.MeshPhysicalMaterial({ color: lin('#0e2830'), roughness: .03, metalness: 0, transparent: true, opacity: .22, clearcoat: 1, envMapIntensity: 2.2, side: THREE.DoubleSide, depthWrite: false });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshStandardMaterial({ color: lin('#142229'), roughness: .5, metalness: .3, envMapIntensity: .4 })); fl.rotation.x = -Math.PI / 2; g.add(fl);
  const wc = document.createElement('canvas'); wc.width = 512; wc.height = 256; const wx = wc.getContext('2d'); wx.fillStyle = '#1b2d36'; wx.fillRect(0, 0, 512, 256); wx.strokeStyle = 'rgba(120,200,220,.14)'; wx.lineWidth = 2; for (let i = 0; i <= 512; i += 128) { wx.beginPath(); wx.moveTo(i, 0); wx.lineTo(i, 256); wx.stroke() } wx.beginPath(); wx.moveTo(0, 128); wx.lineTo(512, 128); wx.stroke();
  const wt2 = new THREE.CanvasTexture(wc); wt2.encoding = THREE.sRGBEncoding; wt2.wrapS = wt2.wrapT = THREE.RepeatWrapping; wt2.repeat.set(5, 1);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 12), new THREE.MeshStandardMaterial({ map: wt2, roughness: .7, envMapIntensity: .3 })); wall.position.set(0, 6, -4); g.add(wall);
  const lineM = new THREE.LineBasicMaterial({ color: 0x59c1d6, transparent: true, opacity: .35 });
  // ===== 1) الطاحونة
  const S1 = new THREE.Group(); S1.position.x = -6; g.add(S1);
  const hop = new THREE.Mesh(new THREE.CylinderGeometry(1.0, .36, 1.3, 40, 1, true), steel); hop.position.y = 2.75; S1.add(hop);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.9, 1.5), darkS); body.position.y = 1.0; S1.add(body);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.2, .5, .05), steel); panel.position.set(0, 1.4, .78); S1.add(panel);
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .1, 24), steel); knob.rotation.x = Math.PI / 2; knob.position.set(0, .85, .8); S1.add(knob);
  const tray = new THREE.Mesh(new THREE.CylinderGeometry(.7, .75, .12, 32), steel); tray.position.y = .06; S1.add(tray); body.position.y = 1.15;
  const gBeans = beanMesh(36, { rough: .4 }), gPow = granuleMesh(160), pile = new THREE.Mesh(new THREE.ConeGeometry(.55, .5, 24).translate(0, .25, 0), new THREE.MeshStandardMaterial({ color: lin('#3a1c0e'), roughness: .8 })); pile.position.y = .1; S1.add(gBeans, gPow, pile);
  const cb = new THREE.Color(lin('#3a1c0e')); for (let i = 0; i < 36; i++) gBeans.setColorAt(i, cb.clone().multiplyScalar(.8 + r() * .5));
  const pow = Array.from({ length: 160 }, () => ({ u: r(), x: (r() - .5) * .2, z: (r() - .5) * .2, s: .016 + r() * .016 })), gb = Array.from({ length: 36 }, () => ({ u: r(), x: (r() - .5) * .6, z: (r() - .5) * .6, rot: r() * 6 }));
  // ===== 2) عمود الاستخلاص
  const S2 = new THREE.Group(); S2.position.x = 0; g.add(S2);
  const col = new THREE.Mesh(new THREE.CylinderGeometry(.78, .78, 3.7, 56, 1, true), glassM()); col.position.y = 2.2; col.renderOrder = 3; S2.add(col);
  [.35, 4.05].forEach(y => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.86, .86, .22, 56), steel); c.position.y = y; S2.add(c) });
  const gTex = noiseTex(256, 128, '#3a1b0d', 1200, 3, true); gTex.repeat.set(3, 1);
  const bed = new THREE.Mesh(new THREE.CylinderGeometry(.72, .72, .95, 40), new THREE.MeshStandardMaterial({ color: lin('#6a4326'), map: gTex, roughness: .9 })); bed.position.y = 1.05; S2.add(bed);
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(.74, .74, 1, 40).translate(0, .5, 0), new THREE.MeshStandardMaterial({ color: lin('#8a4a18'), transparent: true, opacity: .75, roughness: .15, metalness: 0, envMapIntensity: 1.6 })); liq.position.y = .47; S2.add(liq);
  const nozz = new THREE.Mesh(new THREE.CylinderGeometry(.08, .2, .6, 20), steel); nozz.position.y = 4.5; S2.add(nozz);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 6, 14), steel); pipe.position.y = 7.3; S2.add(pipe);
  const drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 10), new THREE.MeshStandardMaterial({ color: lin('#bfe6ff'), roughness: .05, transparent: true, opacity: .9, envMapIntensity: 2 }), 36); S2.add(drops);
  const steam = puffs(30, { color: '#e8eef0' }); S2.add(steam);
  const dr = Array.from({ length: 36 }, () => ({ u: r(), x: (r() - .5) * .5, z: (r() - .5) * .5 }));
  // ===== 3) غرفة التجميد والتجفيف
  const S3 = new THREE.Group(); S3.position.x = 6; g.add(S3);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.5, 2.0), new THREE.MeshPhysicalMaterial({ color: lin('#0e2830'), roughness: .08, transparent: true, opacity: .18, clearcoat: 1, envMapIntensity: 2, depthWrite: false })); cab.position.y = 1.4; cab.renderOrder = 3; S3.add(cab);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(cab.geometry), lineM); edges.position.copy(cab.position); S3.add(edges);
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.6, .2, 2.2), darkS); base.position.y = .1; S3.add(base);
  const top3 = new THREE.Mesh(new THREE.BoxGeometry(3.6, .25, 2.2), darkS); top3.position.y = 2.75; S3.add(top3);
  const trayM = new THREE.Mesh(new THREE.BoxGeometry(2.8, .06, 1.5), steel); trayM.position.y = 1.0; S3.add(trayM);
  const NS = 170, shard = granuleMesh(NS); shard.material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .25, metalness: .05, envMapIntensity: 1.5 }); S3.add(shard);
  const sp = Array.from({ length: NS }, () => ({ x: (r() - .5) * 2.5, z: (r() - .5) * 1.3, s: .075 + r() * .06, rot: r() * 6, v: r() })), cc = new THREE.Color(); let lastQ = -1;
  const cold = puffs(36, { color: '#bfe3ff' }); S3.add(cold);
  const cam = { p: new THREE.Vector3(), l: new THREE.Vector3() };
  return {
    id: 'extract', g, fog: null, bg: '#0d1b22',
    light: { hemi: ['#bfe8f2', '#10181d', .7], key: ['#e8f6ff', 1.6, [2, 8, 7]], rim: ['#6cc4d8', 1.1, [-6, 3, -3]], exp: 1.1 },
    update(p, t) {
      // طحن
      const s1 = rng(0, .38, p), grind = sm(rng(.0, .36, p));
      for (let i = 0; i < 36; i++) { const b = gb[i], u = (b.u + t * .5) % 1, y = mx(4.4, 3.0, u), k = mx(1, .3, rng(.55, 1, u)); put(gBeans, i, b.x * k, y, b.z * k, .1, .1, .1, b.rot + t * 3, b.rot, 0) } gBeans.instanceMatrix.needsUpdate = true; gBeans.visible = p < .42;
      for (let i = 0; i < 160; i++) { const d = pow[i], u = (d.u + t * .55) % 1, y = mx(1.5, .35, u * u), a = p < .02 ? 0 : 1; put(gPow, i, d.x * (1 + u * 1.2), y, d.z * (1 + u * 1.2) + .1, d.s * (p < .42 ? 1 : 0)) } gPow.instanceMatrix.needsUpdate = true;
      pile.scale.set(.2 + grind * 1.2, .1 + grind * 1.1, .2 + grind * 1.2);
      knob.rotation.z = t * 2;
      // استخلاص
      const e = sm(rng(.3, .7, p)), lv = mx(.05, 2.7, e); liq.scale.y = Math.max(.01, lv); liq.material.color.copy(ramp([[0, '#c98a3a'], [.5, '#8a4a18'], [1, '#2a1209']], e)); liq.material.opacity = mx(.5, .92, e);
      for (let i = 0; i < 36; i++) { const d = dr[i], u = (d.u + t * .9) % 1, y = mx(4.2, 1.55 + lv * .85, u * u), on = p > .28 && p < .75 ? 1 : 0; put(drops, i, d.x, y, d.z, .035 * on, .05 * on, .035 * on) } drops.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < 30; i++) { const u = (t * .25 + i / 30) % 1; setPuff(steam, i, Math.sin(i * 3.1) * .35 * u, 4.2 + u * 1.6, Math.cos(i * 2.2) * .3 * u, .6 + u * 1.0, Math.sin(u * Math.PI) * .22 * rng(.3, .6, p)) } flushPuffs(steam);
      // تجميد وتجفيف
      const f = sm(rng(.62, .98, p)), q = Math.round(f * 50);
      for (let i = 0; i < NS; i++) { const s = sp[i], sc = s.s * mx(1.15, .85, f) * sm(rng(.58, .72, p)); put(shard, i, s.x, 1.07 + sc * .5, s.z, sc, sc * .8, sc, 0, s.rot, 0) } shard.instanceMatrix.needsUpdate = true;
      if (q !== lastQ) { lastQ = q; for (let i = 0; i < NS; i++) shard.setColorAt(i, cc.copy(ramp([[0, '#d6eefc'], [.4, '#b4cbd6'], [.7, '#6b4a34'], [1, '#4a2312']], cl(f * 1.1 - sp[i].v * .12)))); shard.instanceColor.needsUpdate = true }
      for (let i = 0; i < 36; i++) { const u = (t * .18 + i / 36) % 1; setPuff(cold, i, Math.sin(i * 1.3) * 1.4, 1.2 + u * 1.2, Math.cos(i * 1.9) * .6, .7 + u, Math.sin(u * Math.PI) * .22 * (1 - f * .8) * sm(rng(.58, .7, p))) } flushPuffs(cold);
      const cx = mx(mx(-6, 0, sm(rng(.28, .4, p))), 6, sm(rng(.62, .74, p)));
      cam.p.set(cx + .5, mx(2.9, 2.6, sm(p)), mx(11.2, 10.4, Math.sin(Math.PI * p) * .7)); cam.l.set(cx, 1.9, 0); return cam;
    }
  };
}

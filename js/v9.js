/* ============================================================
   v9.js — «سوبر ماركت»: مشي بمنظور شخص أول من الباب لحد الكاشير
   باب زجاج بينفتح · ممرات رفوف · ركن قهوة بُنّ · عربية · كاشير
   ============================================================ */
(() => {
  const { MS, BX, CY, SP, GLO, cvs, TEXM, EMI } = window.__v8;
  const PI = Math.PI, TAU = PI * 2;
  const E = (a, b, t) => sm(rng(a, b, t));

  /* ---------- خامات ---------- */
  const PRODS = [['أرز', '#e8c24a', '#8a3a1a'], ['مكرونة', '#d94a3a', '#fff0c8'], ['زيت', '#6aa83a', '#fff8d0'], ['سكر', '#f4f4f4', '#2a5a9a'], ['شاي', '#2f6a4a', '#f2d27a'], ['عصير', '#f08a2a', '#fff'], ['بسكويت', '#7a3a1a', '#ffd9a0'], ['لبن', '#4a8ad0', '#fff'], ['صلصة', '#b02a2a', '#ffe0c0'], ['حبوب', '#c9a24a', '#3a2a14']];
  const prodTex = (i) => cvs(256, 320, (x, w, h) => {
    const [n, c1, c2] = PRODS[i]; const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, c1); gr.addColorStop(1, c1); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.fillStyle = c2; x.fillRect(0, 0, w, 36); x.fillRect(0, h - 28, w, 28);
    x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.arc(w / 2, h * .46, 78, 0, TAU); x.fill();
    x.fillStyle = c2; x.beginPath(); x.arc(w / 2, h * .46, 56, 0, TAU); x.fill();
    x.fillStyle = c1; x.font = '900 46px Cairo,Tahoma,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n, w / 2, h * .46 + 2);
    x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(20, h - 70, w - 40, 10); x.fillRect(40, h - 54, w - 80, 8);
  });
  const sign = (txt, bg, fg, w = 512, h = 160, fs = 84) => cvs(w, h, (x) => { x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = fg; x.lineWidth = 6; x.strokeRect(10, 10, w - 20, h - 20); x.fillStyle = fg; x.font = `900 ${fs}px Cairo,Tahoma,sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, w / 2, h / 2 + 4) });
  const floorTex = () => cvs(512, 512, (x, w, h) => { const n = 4, s = w / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { x.fillStyle = (i + j) % 2 ? '#d8d4ca' : '#c4bfb2'; x.fillRect(i * s, j * s, s, s); } x.strokeStyle = 'rgba(0,0,0,.18)'; x.lineWidth = 3; for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, h); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(w, i * s); x.stroke() } });
  const wireTex = () => cvs(128, 128, (x, w, h) => { x.clearRect(0, 0, w, h); x.strokeStyle = 'rgba(220,226,232,.95)'; x.lineWidth = 5; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 32); x.lineTo(w, i * 32); x.stroke() } });
  const beltTex = () => { const t = cvs(64, 256, (x, w, h) => { x.fillStyle = '#26282d'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3d44'; for (let i = 0; i < 16; i++) x.fillRect(0, i * 16, w, 6) }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t };

  function Market() {
    const g = new THREE.Group(), anim = [], D = new THREE.Object3D();
    const jars = [makeJar(), makeJar(), makeJar()]; jars.forEach((j, i) => j.setVariant(i));
    const jarAt = (x, y, z, s = .1, v = 0, ry = 0) => { const j = jars[v % 3].root.clone(true); j.visible = true; j.position.set(x, y + 1.73 * s, z); j.scale.setScalar(s); j.rotation.y = ry; g.add(j); return j };
    const person = (o, x, z, ry, s = 1.7) => { const p = Person(o); p.g.position.set(x, 0, z); p.g.rotation.y = ry; p.g.scale.setScalar(s); g.add(p.g); return p };

    /* ===== العالم الخارجي ===== */
    const dome = new THREE.Mesh(new THREE.SphereGeometry(140, 24, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'varying vec3 vP;void main(){float h=clamp(vP.y,0.,1.);vec3 c=mix(vec3(.95,.82,.62),vec3(.28,.52,.82),pow(h,.5));gl_FragColor=vec4(c,1.);}' })); g.add(dome);
    const walk = new THREE.Mesh(new THREE.PlaneGeometry(80, 14), MS('#b8b4a8', .85)); walk.rotation.x = -PI / 2; walk.position.set(0, -.01, 16); g.add(walk);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(160, 22), MS('#2a2c30', .9)); road.rotation.x = -PI / 2; road.position.set(0, -.02, 34); g.add(road);
    const dashes = []; for (let i = 0; i < 14; i++) { const d = BX(g, 2.4, .02, .22, -30 + i * 4.6, .0, 34, '#e8e4d0', .8); dashes.push(d) }
    const trees = []; [-12, -5, 6, 13].forEach((x, i) => { const tr = new THREE.Group(); CY(tr, .14, .2, 2.2, 0, 1.1, 0, '#5a3a22', .9); const cr = SP(tr, 1.3, 0, 3.1, 0, '#3f8a3a', 1, [1, .9, 1]); SP(tr, .9, .7, 3.6, .2, '#4a9a42', 1); tr.position.set(x, 0, 12.4); g.add(tr) });
    const bld = (x, w, h, c) => { const b = BX(g, w, h, 10, x, h / 2, 70, c, .9); return b }; [[-34, 18, 22, '#c8a98a'], [-10, 16, 30, '#8a9aa8'], [16, 20, 18, '#d8c4a0'], [40, 16, 26, '#a89a8a']].forEach(a => bld(...a));
    const cars = []; [['#c0392b', -8, 1], ['#2f6f8f', 22, -1]].forEach((c, i) => { const car = new THREE.Group(); BX(car, 4.2, .8, 1.8, 0, .6, 0, c[0], .35, .4); BX(car, 2.2, .7, 1.6, -.1, 1.25, 0, c[0], .35, .4); BX(car, 2.0, .5, 1.62, -.1, 1.28, 0, '#9fc4e0', .1, .6); [[-1.4, .8], [1.4, .8], [-1.4, -.8], [1.4, -.8]].forEach(w => { const wh = CY(car, .38, .38, .3, w[0], .38, w[1], '#16181c', .8); wh.rotation.x = PI / 2 }); car.userData = { x0: c[1], dir: c[2] }; car.position.set(c[1], 0, 30 + (i ? 4 : -2)); if (c[2] < 0) car.rotation.y = PI; g.add(car); cars.push(car) });
    const pw = person({ shirt: '#d9402f', pants: '#2a2f3a', hat: 'none', hair: '#2a1a10', seed: 71 }, 4, 13.6, -PI / 2, 1.7); const pw2 = person({ shirt: '#3d7a4a', pants: '#3a3a44', hat: 'scarf', hatC: '#7a3a5a', skirt: true, seed: 72 }, -6, 14.4, PI / 2, 1.7);

    /* ===== هيكل المحل ===== */
    const FL = -26, FZ = 9;                       // z الخلفي والواجهة
    const flT = floorTex(); flT.wrapS = flT.wrapT = THREE.RepeatWrapping; flT.repeat.set(7, 9);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(28, 36), new THREE.MeshStandardMaterial({ map: flT, roughness: .22, metalness: .05, envMapIntensity: .8 })); floor.rotation.x = -PI / 2; floor.position.set(0, 0, (FZ + FL) / 2); g.add(floor);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(28, 36), MS('#f2f0ea', .9)); ceil.rotation.x = PI / 2; ceil.position.set(0, 4.6, (FZ + FL) / 2); g.add(ceil);
    const wallM = MS('#efe9dc', .9);
    const wB = new THREE.Mesh(new THREE.PlaneGeometry(28, 4.6), wallM); wB.position.set(0, 2.3, FL); g.add(wB);
    [-1, 1].forEach(s => { const w = new THREE.Mesh(new THREE.PlaneGeometry(36, 4.6), wallM); w.rotation.y = -s * PI / 2; w.position.set(s * 14, 2.3, (FZ + FL) / 2); g.add(w); BX(g, .1, .9, 36, s * 13.95, .45, (FZ + FL) / 2, '#2f6f5a', .6) });
    BX(g, 28, 1.0, .1, 0, .5, FL + .05, '#2f6f5a', .6);
    // ألواح إضاءة السقف (instanced)
    const pan = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, .06, .5), new THREE.MeshBasicMaterial({ color: 0xfff6e0, toneMapped: false }), 30); let pi = 0;
    for (let zi = 0; zi < 10; zi++) for (let xi = 0; xi < 3; xi++) { D.position.set(-6 + xi * 6, 4.56, 6 - zi * 3.4); D.rotation.set(0, 0, 0); D.updateMatrix(); pan.setMatrixAt(pi++, D.matrix) } g.add(pan);
    // واجهة زجاج
    const glassM = new THREE.MeshStandardMaterial({ color: 0xbfe0f0, roughness: .05, metalness: .1, transparent: true, opacity: .22, depthWrite: false });
    [[-8, 12], [8, 12]].forEach(a => { const gl = new THREE.Mesh(new THREE.PlaneGeometry(a[1], 3.6), glassM); gl.position.set(a[0], 1.8, FZ); g.add(gl); for (let i = 0; i <= 4; i++) BX(g, .08, 3.6, .1, a[0] - a[1] / 2 + i * a[1] / 4, 1.8, FZ, '#2a2d33', .4, .6) });
    BX(g, 28, 1.0, .3, 0, 4.1, FZ, '#2a2d33', .6); BX(g, 28, .1, .12, 0, 3.6, FZ, '#2a2d33', .4, .6); BX(g, 28, .1, .12, 0, .05, FZ, '#2a2d33', .4, .6);
    const doorG = [-1, 1].map(s => { const d = new THREE.Group(); const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 3.4), glassM); gl.position.set(s * 1, 1.75, 0); d.add(gl); BX(d, .08, 3.4, .06, s * .04, 1.75, 0, '#c9ced4', .3, .8); BX(d, .08, 3.4, .06, s * 1.96, 1.75, 0, '#c9ced4', .3, .8); BX(d, 1.95, .08, .06, s * 1, 3.44, 0, '#c9ced4', .3, .8); BX(d, 1.95, .08, .06, s * 1, .06, 0, '#c9ced4', .3, .8); d.position.z = FZ + .02; g.add(d); return d });
    const sgn = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.2), EMI(sign('سوبر ماركت الحي', '#1f5c46', '#ffe9a8', 1024, 140, 92))); sgn.position.set(0, 4.1, FZ + .17); g.add(sgn);

    /* ===== الرفوف ===== */
    const levels = [.3, .75, 1.2, 1.65, 2.1];
    const groups = PRODS.map(() => []);
    const rr = rand(9), gonds = [[-3.4, 7, -17], [3.4, 7, -17], [-9, 6, -22], [9, 6, -22]];
    const frameM = MS('#dfe3e8', .4, .5), edgeM = MS('#d63a2a', .5);
    const gondola = (gx, z0, z1, skip) => {
      const L = z0 - z1, cz = (z0 + z1) / 2;
      BX(g, 1.0, .12, L, gx, .06, cz, '#3a3d44', .5, .3); BX(g, .06, 2.3, L, gx, 1.2, cz, frameM);
      levels.forEach(y => { [-1, 1].forEach(s => { BX(g, .46, .04, L, gx + s * .25, y - .02, cz, frameM); BX(g, .02, .09, L, gx + s * .49, y + .0, cz, edgeM) }) });
      [-1, 1].forEach(s => BX(g, .02, .3, L, gx + s * .5, 2.4, cz, '#d63a2a', .5));
      for (let z = z0 - .15; z > z1 + .1; z -= .3) levels.forEach(y => [-1, 1].forEach(s => {
        if (skip && skip(s, z, y)) return; if (rr() < .06) return;
        const k = Math.floor(rr() * PRODS.length), hh = .34 + rr() * .06; D.position.set(gx + s * .3, y + hh / 2, z); D.rotation.set(0, s * PI / 2, 0); D.scale.set(1, hh / .38, 1); D.updateMatrix(); groups[k].push(D.matrix.clone()); D.scale.set(1, 1, 1)
      }));
    };
    gonds.forEach(a => gondola(a[0], a[1], a[2], a[0] === -3.4 ? (s, z, y) => s === 1 && z < -8.6 && z > -15.2 && y > .5 && y < 1.9 : null));
    const pg = new THREE.BoxGeometry(.22, .38, .28), pm = []; // العرض x ← يدور ±90° ليبقى الوجه ناحية الممر
    groups.forEach((arr, k) => { if (!arr.length) return; const m = new THREE.InstancedMesh(pg, new THREE.MeshStandardMaterial({ map: prodTex(k), roughness: .55 }), arr.length); arr.forEach((mt, i) => m.setMatrixAt(i, mt)); g.add(m); pm.push(m) });
    // الوجه الأمامي للصندوق (+z محلياً) يلف ناحية الممر بعد الدوران ±90°، فبنعكس أبعاد الصندوق: العمق .22 والعرض .28
    // لافتات الممرات المعلّقة
    [[-3.4, 2, 'مكرونة وأرز'], [3.4, -4, 'عصائر ومشروبات'], [-3.4, -12, 'قهوة ومشروبات ساخنة']].forEach(a => { const s = new THREE.Mesh(new THREE.PlaneGeometry(2.6, .8), EMI(sign(a[2], a[2].startsWith('قهوة') ? '#4a2a14' : '#1f5c46', '#ffe9a8', 640, 200, 74))); s.position.set(a[0] * .6, 3.8, a[1]); g.add(s); [-1, 1].forEach(q => CY(g, .01, .01, .8, a[0] * .6 + q * 1.1, 4.2, a[1], '#555')) });
    // ركن القهوة على الرف
    const cs = new THREE.Mesh(new THREE.PlaneGeometry(2.4, .5), EMI(sign('☕ قهوة بُنّ', '#3a2014', '#f2c97a', 640, 130, 68))); cs.rotation.y = PI / 2; cs.position.set(-2.88, 2.4, -12); g.add(cs);
    for (let z = -9.2; z > -15.1; z -= .46) [.75, 1.2, 1.65].forEach((y, r) => jarAt(-3.05, y, z, .09, (Math.floor(-z * 2) + r) % 3, PI / 2 * 0 + 0));
    const cbg = BX(g, .04, 1.5, 6.0, -2.9, 1.2, -12.1, '#2a1a10', .9); cbg.visible = false;

    /* ===== طاولة عرض هرمية (البطل) ===== */
    const PX = 1.6, PZ = -8.6; const disp = new THREE.Group(); disp.position.set(PX, 0, PZ); g.add(disp);
    CY(disp, .95, 1.0, .5, 0, .25, 0, '#2a1a10', .6); CY(disp, .95, .95, .05, 0, .525, 0, '#c9a24a', .3, .8); CY(disp, .62, .66, .06, 0, .98, 0, '#2a1a10', .6); CY(disp, .3, .34, .06, 0, 1.38, 0, '#2a1a10', .6); CY(disp, .08, .08, .45, 0, .75, 0, '#2a1a10', .6); CY(disp, .08, .08, .4, 0, 1.18, 0, '#2a1a10', .6);
    const ring = (n, rad, y, s, v0) => { for (let i = 0; i < n; i++) { const a = i / n * TAU; const j = jarAt(PX + Math.cos(a) * rad, y, PZ + Math.sin(a) * rad, s, v0 + i % 3, -a + PI / 2); } };
    ring(7, .66, .55, .1, 0); ring(4, .32, 1.01, .095, 1);
    const topY = 1.42, HP = new THREE.Vector3(PX, topY + 1.73 * .1, PZ);
    const hero = jars[0].root.clone(true); hero.visible = true; hero.scale.setScalar(.1); hero.position.copy(HP); g.add(hero);
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.4), EMI(cvs(360, 480, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a2014'); gr.addColorStop(1, '#6a3a1c'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#f2c97a'; x.font = '900 120px Cairo,Tahoma'; x.textAlign = 'center'; x.fillText('بُنّ', w / 2, 170); x.font = '700 40px Cairo,Tahoma'; x.fillText('قهوة مختصة', w / 2, 240); x.fillStyle = '#fff'; x.font = '900 70px Cairo,Tahoma'; x.fillText('خصم ٢٠٪', w / 2, 370); x.font = '700 30px Cairo,Tahoma'; x.fillText('لفترة محدودة', w / 2, 420) }))); ban.position.set(PX + .8, 3.0, PZ - .8); g.add(ban); CY(g, .01, .01, 1.6, PX + .8, 3.9, PZ - .8, '#444');
    const spot = new THREE.PointLight(0xffd9a0, 1.8, 7); spot.position.set(PX - .4, 2.8, PZ + .2); g.add(spot);

    /* ===== الكاشير ===== */
    const CZ = -20.2;
    const lane = (x, active) => {
      BX(g, 4.4, 1.0, .9, x - .4, .5, CZ, '#2f6f5a', .5); BX(g, 4.6, .06, 1.0, x - .4, 1.03, CZ + .02, '#e8e4dc', .3, .2);
      const bt = beltTex(); bt.repeat.set(1, 3); const bm = new THREE.Mesh(new THREE.PlaneGeometry(.7, 3.4), new THREE.MeshStandardMaterial({ map: bt, roughness: .8 })); bm.rotation.set(-PI / 2, 0, PI / 2); bm.position.set(x - 1.3, 1.07, CZ + .12); g.add(bm);
      BX(g, 1.4, 1.0, .9, x + 2.4, .5, CZ, '#2f6f5a', .5); BX(g, 1.5, .06, 1.0, x + 2.4, 1.03, CZ, '#e8e4dc', .3, .2);
      const sc = BX(g, .5, .02, .35, x + .7, 1.1, CZ + .1, '#111', .3); const scl = new THREE.Mesh(new THREE.PlaneGeometry(.4, .04), new THREE.MeshBasicMaterial({ color: 0xff2a2a, toneMapped: false })); scl.rotation.x = -PI / 2; scl.position.set(x + .7, 1.115, CZ + .1); g.add(scl);
      const scr = BX(g, .55, .38, .05, x + 2.2, 1.45, CZ - .1, '#16181c', .3); const sct = new THREE.Mesh(new THREE.PlaneGeometry(.5, .32), EMI(cvs(256, 160, (c, w, h) => { c.fillStyle = '#0c2a22'; c.fillRect(0, 0, w, h); c.fillStyle = '#7dffb8'; c.font = '700 26px Cairo,Tahoma'; c.textAlign = 'center'; c.fillText('الإجمالي', w / 2, 44); c.font = '900 48px Cairo,Tahoma'; c.fillText(active ? '٢٤٫٥٠' : '٠٫٠٠', w / 2, 110) }))); sct.position.set(x + 2.2, 1.45, CZ - .07); sct.rotation.y = 0; sct.rotation.y = PI; sct.position.z = CZ - .13; g.add(sct); sct.visible = false;
      const scr2 = new THREE.Mesh(new THREE.PlaneGeometry(.5, .32), EMI(cvs(256, 160, (c, w, h) => { c.fillStyle = '#0c2a22'; c.fillRect(0, 0, w, h); c.fillStyle = '#7dffb8'; c.font = '700 26px Cairo,Tahoma'; c.textAlign = 'center'; c.fillText('الإجمالي', w / 2, 44); c.font = '900 48px Cairo,Tahoma'; c.fillText(active ? '٢٤٫٥٠ ج' : '٠٫٠٠', w / 2, 110) }))); scr2.position.set(x + 2.2, 1.45, CZ + .0); scr2.rotation.set(-.2, 0, 0); scr2.position.z = CZ + .0; g.add(scr2); scr2.position.y = 1.45; scr2.position.x = x + 2.2; scr2.position.z = CZ - .1 + .06;
      const rs = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .5), EMI(sign(active ? 'كاشير ٣' : 'كاشير ' + (x < 0 ? '٢' : '٤'), '#16181c', active ? '#7dffb8' : '#ff8a6a', 480, 150, 70))); rs.position.set(x + .8, 3.5, CZ + .3); g.add(rs); CY(g, .01, .01, 1.1, x + .8, 4.05, CZ + .3, '#555');
      const gum = BX(g, 3.4, .12, .3, x - .6, .52 + .55, CZ + .52, '#d63a2a', .5); gum.visible = false;
      BX(g, 4.4, .05, .08, x - .4, 1.1, CZ + .5, '#c9ced4', .3, .8);
    };
    lane(0, true); lane(-7.5, false); lane(7.5, false);
    // كرسي + كاشير
    const stool = new THREE.Group(); CY(stool, .3, .3, .08, 0, .66, 0, '#2a2f38', .6); CY(stool, .05, .05, .6, 0, .33, 0, '#9aa0a6', .3, .9); CY(stool, .3, .3, .04, 0, .02, 0, '#9aa0a6', .3, .9); stool.position.set(2.2, 0, CZ - 1.0); g.add(stool);
    const cashier = person({ shirt: '#1f5c46', pants: '#2a2f3a', hat: 'none', seed: 91, hair: '#2a1a10', apron: true }, 2.2, CZ - 1.0, 0, 1.7); cashier.g.position.y = .05;
    anim.push(t => cashier.act('type', 0, t, {}));
    // مقعد وكاشير في الحارات التانية + عميل
    const stool2 = stool.clone(); stool2.position.set(-5.3, 0, CZ - 1.0); g.add(stool2); const cashier2 = person({ shirt: '#1f5c46', pants: '#2a2f3a', hat: 'cap', hatC: '#1f5c46', seed: 92 }, -5.3, CZ - 1.0, 0, 1.7); cashier2.g.position.y = .05; anim.push(t => cashier2.act('type', 0, t, {}));
    const cust = person({ shirt: '#a8472f', pants: '#2a2f3a', hat: 'none', seed: 95, beard: true, hair: '#3a2410' }, -7.0, CZ + 1.4, PI, 1.7); anim.push(t => cust.act('idle', 0, t, {}));
    // عمود دعاية وعبوات حلويات عند الكاشير
    for (let i = 0; i < 6; i++) BX(g, .2, .1, .14, 3.2 + i * .2, 1.12, CZ + .38, ['#d63a2a', '#2f6f8f', '#d9a441'][i % 3], .6);

    /* ===== الباب الأمامي: بوابة دخول ===== */
    BX(g, .1, .6, .1, -2.02, .3, FZ - .5, '#1f5c46').visible = false;
    // أكياس الخبز والخضار بجانب الباب (ديكور)
    const veg = new THREE.Group(); BX(veg, 3.2, .8, 1.1, 0, .4, 0, '#6a4a2c', .8); [['#d63a2a', -1.0], ['#7cc04a', -.35], ['#f08a2a', .3], ['#c9a24a', .95]].forEach(a => { for (let i = 0; i < 12; i++) SP(veg, .1, a[1] + (rr() - .5) * .45, .88 + rr() * .08, (rr() - .5) * .7, a[0], .6) }); veg.position.set(-6, 0, 6.4); g.add(veg);
    const veg2 = veg.clone(true); veg2.position.set(6, 0, 6.4); g.add(veg2);
    // الشعارات على الحيطة الخلفية
    const bs = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.2), EMI(sign('طازج كل يوم', '#2f6f5a', '#fff', 900, 150, 84))); bs.position.set(0, 3.7, FL + .08); g.add(bs);
    // أضواء المحل
    const L1 = new THREE.PointLight(0xfff0d8, 1.4, 18); L1.position.set(0, 3.8, 0); g.add(L1);
    const L2 = new THREE.PointLight(0xfff0d8, 1.0, 14); L2.position.set(0, 3.8, -16); g.add(L2);

    /* ===== المتسوقون ===== */
    const sh1 = person({ shirt: '#6d3b8a', pants: '#2a2f3a', hat: 'none', seed: 101, hair: '#1a1008' }, -1.5, 0, PI, 1.7);
    const sh2 = person({ shirt: '#e8eef0', pants: '#3a3a44', hat: 'scarf', hatC: '#c85a7a', skirt: true, seed: 102 }, -2, -5.5, 0, 1.7);
    const cartS = new THREE.Group(); BX(cartS, .5, .05, .7, 0, .45, 0, '#c9ced4', .3, .8); BX(cartS, .5, .3, .04, 0, .62, -.35, '#c9ced4', .3, .8); CY(cartS, .01, .01, .6, 0, .9, .4, '#c9ced4', .3, .9).rotation.z = PI / 2; cartS.scale.setScalar(1.3); g.add(cartS);
    const sh3 = person({ shirt: '#2f6f8f', pants: '#2a2a2a', hat: 'cap', hatC: '#efe9da', seed: 103, glasses: true }, -2.55, -3.2, -PI / 2, 1.7); const sh4 = person({ shirt: '#d9a441', pants: '#2a2f3a', hat: 'none', seed: 104, hair: '#4a2a14', beard: true }, 2.55, -13.6, PI / 2, 1.7); const sh5 = person({ shirt: '#3d7a4a', pants: '#3a3a44', hat: 'none', seed: 105, hair: '#2a1a10' }, 2.2, 3.8, PI, 1.7);
    anim.push(t => {
      const z1 = 4 - ((t * .55) % 14); sh1.g.position.set(-.9, 0, z1); sh1.act('walk', t * 6.2, t, { amp: 1 });
      const z2 = -13 + ((t * .5 + 6) % 18); sh2.g.position.set(-2.0, 0, z2); sh2.g.rotation.y = 0; sh2.act('walk', t * 6.0, t, { amp: 1 }); cartS.position.set(-2.0, 0, z2 + .85); cartS.rotation.y = 0;
      sh3.act('pick', t * .22, t, {}); sh4.act('pick', t * .2 + .4, t, { x: -.2 }); sh5.act('idle', 0, t, {});
      pw.g.position.x = 10 - ((t * .8) % 24); pw.act('walk', t * 6.4, t, { amp: 1 }); pw.g.rotation.y = -PI / 2; pw2.g.position.x = -12 + ((t * .75) % 24); pw2.act('walk', t * 6.2, t, { amp: 1 }); pw2.g.rotation.y = PI / 2;
      cars.forEach(c => c.position.x = ((c.userData.x0 + t * 5 * c.userData.dir + 40) % 80) - 40);
      dashes.forEach((d, k) => d.position.x = ((-30 + k * 4.6 + t * 2) % 64) - 32);
    });

    /* ===== العربية (تتبع الكاميرا) ===== */
    const cart = new THREE.Group();
    const wt = wireTex(); const wm = new THREE.MeshBasicMaterial({ map: wt, transparent: true, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }); const mkW = (w, h, x, y, z, ry, rx = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wm); p.position.set(x, y, z); p.rotation.set(rx, ry, 0); cart.add(p); return p };
    wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(3, 2);
    BX(cart, .62, .02, .9, 0, .0, 0, '#c9ced4', .3, .8); mkW(.62, .3, 0, .15, -.45, 0); mkW(.9, .3, -.31, .15, 0, PI / 2); mkW(.9, .3, .31, .15, 0, PI / 2); mkW(.62, .3, 0, .15, .45, 0);
    [[-.31, -.45], [.31, -.45], [-.31, .45], [.31, .45]].forEach(a => BX(cart, .02, .02, .02, a[0], .3, a[1], '#c9ced4', .3, .9)); BX(cart, .64, .03, .03, 0, .31, .46, '#d63a2a', .4); CY(cart, .018, .018, .66, 0, .55, .62, '#d63a2a', .4).rotation.z = PI / 2; [-.3, .3].forEach(x => { const r = CY(cart, .012, .012, .35, x, .43, .54, '#c9ced4', .3, .9); r.rotation.x = -.6 });
    const cItems = new THREE.Group(); cart.add(cItems); [[PRODS.length - 1, -.15, -.2], [3, .12, -.25], [8, -.1, .08], [1, .15, .12]].forEach((a, i) => { const m = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ map: prodTex(a[0]), roughness: .55 })); m.scale.setScalar(.7); m.position.set(a[1], .15, a[2]); m.rotation.y = i * .6; cItems.add(m) });
    cart.scale.setScalar(1.15); g.add(cart);
    const beltItems = new THREE.Group(); g.add(beltItems); [[3, 0], [9, .5], [1, 1.0]].forEach((a) => { const m = new THREE.Mesh(pg, new THREE.MeshStandardMaterial({ map: prodTex(a[0]), roughness: .55 })); m.userData.o = a[1]; beltItems.add(m) });
    const bag = new THREE.Group(); BX(bag, .5, .5, .3, 0, .25, 0, '#a8844a', .9); const hd = new THREE.Mesh(new THREE.TorusGeometry(.12, .012, 6, 16, PI), MS('#a8844a', .9)); hd.position.y = .5; bag.add(hd); bag.position.set(1.55, 1.06, CZ); bag.scale.setScalar(.01); g.add(bag);
    const beep = new THREE.Mesh(new THREE.PlaneGeometry(.5, .5), new THREE.MeshBasicMaterial({ color: 0xff3a3a, transparent: true, opacity: 0, toneMapped: false, depthWrite: false })); beep.rotation.x = -PI / 2; beep.position.set(.7, 1.13, CZ + .1); g.add(beep);
    const spark = puffs(24, { color: '#ffe9a8', additive: true }); g.add(spark);

    /* ===== حركة الجرة البطل ===== */
    const cartPos = new THREE.Vector3(), cartFwd = new THREE.Vector3(), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
    let P = 0;
    const BELT0 = new THREE.Vector3(-1.9, 1.07, CZ + .12), SCAN = new THREE.Vector3(.7, 1.07, CZ + .12), BAGP = new THREE.Vector3(1.55, 1.1, CZ);
    function follow() {
      const c = GL.C; cartFwd.set(0, 0, -1).applyQuaternion(c.quaternion); cartFwd.y = 0; if (cartFwd.lengthSq() < 1e-4) cartFwd.set(0, 0, -1); cartFwd.normalize();
      const vis = E(.06, .14, P), park = E(.78, .86, P); // عند الكاشير العربية تقف وراء الكاميرا
      cart.visible = vis > .01 && P < .9; cart.scale.setScalar(1.15 * vis);
      cartPos.copy(c.position).addScaledVector(cartFwd, 1.15 - park * .2); cartPos.y = .62 + Math.sin(performance.now() * .003) * .004 * (1 - park); cart.position.copy(cartPos); cart.rotation.y = Math.atan2(-cartFwd.x, -cartFwd.z);
      cItems.visible = P < .78;
      // الجرة: من الهرم ← العربية (٥٢–٦٢٪) ← الحزام (٧٨–٨٦٪) ← الماسح ← الكيس
      const a = E(.5, .62, P), b = E(.8, .88, P), sc = E(.88, .94, P), bg = E(.94, 1, P);
      tmp.set(0, .32, 0).applyAxisAngle(THREE.Object3D.DefaultUp, cart.rotation.y).add(cartPos).add(tmp2.set(0, 0, 0));
      if (P < .78) { hero.position.lerpVectors(HP, tmp, a); hero.position.y += Math.sin(a * PI) * .75; hero.scale.setScalar(mx(.1, .085, a)); hero.rotation.set(Math.sin(a * PI) * .5, a * TAU * 1.5, Math.sin(a * PI) * .3) }
      else { tmp2.lerpVectors(tmp, BELT0.clone().setY(BELT0.y + 1.73 * .085), b); tmp2.y += Math.sin(b * PI) * .6; hero.position.copy(tmp2); hero.scale.setScalar(.085); hero.rotation.set(0, mx(a * TAU * 1.5, TAU * 2, b), 0); if (b >= 1) { hero.position.lerpVectors(BELT0.clone().setY(BELT0.y + 1.73 * .085), SCAN.clone().setY(BELT0.y + 1.73 * .085), sc); if (sc >= 1) hero.position.lerpVectors(SCAN.clone().setY(BELT0.y + 1.73 * .085), BAGP.clone().setY(1.2), bg).y += Math.sin(bg * PI) * .15 } }
      hero.visible = bg < .9;
      // بقية المنتجات على الحزام
      beltItems.visible = P > .79; beltItems.children.forEach((m, i) => { const u = E(.8 + m.userData.o * .02, .86 + m.userData.o * .03, P), w = E(.9 + m.userData.o * .02, .98, P); m.position.set(mx(-2.6 + m.userData.o * .3, 1.15, 0) + (E(.8 + m.userData.o * .02, .9, P) - u) * 0, 1.07 + .19 * .7, CZ + .12); m.position.x = mx(mx(-3.1 + i * .35, -1.2 + i * .35, u), 1.5, w); m.scale.setScalar(.7 * (1 - w * .9)); m.rotation.y = i * .5 });
      beep.material.opacity = Math.max(0, Math.sin(clock() * 18)) * (sc > .02 && sc < .98 ? 1 : 0);
      bag.scale.setScalar(.01 + E(.9, .98, P) * 1.0); bag.visible = P > .9;
    }
    const clock = () => performance.now() * .001;
    // لف الجرة المعروضة على الهرم + لمعة
    const orig = GL.R.render.bind(GL.R); if (!GL.R.__mk) { GL.R.render = function (s, c) { if (typeof ACTIVE !== 'undefined' && ACTIVE === 'market' && g.__follow) g.__follow(); return orig(s, c) }; GL.R.__mk = true }
    g.__follow = follow;

    /* ===== الكاميرا ===== */
    const cam = { p: new THREE.Vector3(), l: new THREE.Vector3() };
    // [p, x, y, z, lx, ly, lz]
    const K = [[0, 0, 1.75, 17, 0, 1.9, 6], [.12, 0, 1.68, 10.5, 0, 1.8, -2], [.28, 0, 1.66, 1.5, -.3, 1.6, -9], [.4, 0, 1.62, -3.4, 1.3, 1.1, -9.3], [.5, -.1, 1.6, -5.2, 1.6, 1.15, -8.8], [.62, -.15, 1.6, -5.6, 1.0, 1.0, -9.0], [.72, 0, 1.8, -11.5, -.2, 1.3, -18], [.86, .3, 2.3, -14.4, .5, 1.0, -20.4], [1, .5, 2.2, -14.8, 1.0, 1.0, -20.4]];
    const steam = puffs(1, {});
    return {
      id: 'market', g, fog: null, bg: '#bcd0e0', light: { hemi: ['#fff6e8', '#9a8f80', .75], key: ['#fff0d8', .9, [3, 8, 6]], rim: ['#cfe4ff', .5, [-5, 4, -4]], exp: 1.05 },
      update(p, t) {
        P = p; anim.forEach(a => a(t));
        const open = E(.0, .1, p) * (1 - E(.2, .26, p) * .0); doorG[0].position.x = -open * 1.9; doorG[1].position.x = open * 1.9;
        let i = 0; while (i < K.length - 2 && p > K[i + 1][0]) i++; const A = K[i], B = K[i + 1], u = sm(rng(A[0], B[0], p));
        const sx = Math.sin(t * .6) * .01, bob = Math.sin(t * 5.2 * (p > .02 && p < .72 ? 1 : .0)) * .012 * (p > .02 && p < .72 ? 1 : 0);
        cam.p.set(mx(A[1], B[1], u) + sx + mouse.x * .12, mx(A[2], B[2], u) + bob, mx(A[3], B[3], u)); cam.l.set(mx(A[4], B[4], u) + mouse.x * .25, mx(A[5], B[5], u) - mouse.y * .12, mx(A[6], B[6], u));
        spot.intensity = 1.2 + E(.3, .5, p) * 1.6 - E(.62, .7, p) * 1.2;
        return cam;
      }
    };
  }

  const MC = [['بتدخل السوبر ماركت', 'الباب بيتفتح لوحده، وريحة القهوة سابقاك من أول الممر.'], ['ماشي في الممر', 'رفوف من هنا ومن هنا… بس عينك على ركن القهوة.'], ['لقيتها', 'علبة بُنّ متشافة من بعيد، متراصّة وعليها الخصم.'], ['في العربية', 'تمسك العلبة وتحطها وسط مشترياتك.'], ['عند الكاشير', 'تتحاسب في ثواني، وتروّح بقهوة بتاعتك.']];
  const host = document.getElementById('places');
  if (host) {
    const MS_ = document.createElement('section'); MS_.className = 'chap'; MS_.id = 'market'; MS_.style.height = '620vh';
    MS_.innerHTML = `<div class="st"><div class="cap"><div class="cn"><span class="num">٠٢</span><span class="kick">في السوبر ماركت</span></div><h2 class="ct"></h2><p class="cp"></p><ol class="dots">${MC.map(() => '<li></li>').join('')}</ol></div></div>`;
    host.after(MS_);
    const el = MS_.querySelector('.cap'); const AT = [.12, .3, .5, .72];
    CAPS.market = { el, ct: el.querySelector('.ct'), cp: el.querySelector('.cp'), li: [...el.querySelectorAll('li')], idx: -1, steps: MC.map((c, i) => ({ at: i ? AT[i - 1] : 0, t: c[0], p: c[1] })) };
    capSet('market', 0, true); PR.market = 0; CUR.market = 0; BG.market = '#bcd0e0';
    ScrollTrigger.create({ trigger: MS_, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (s.isActive) setActive('market') } });
    ScrollTrigger.create({ trigger: MS_, start: 'top top', end: 'bottom bottom', onUpdate: s => PR.market = s.progress, onRefresh: s => PR.market = s.progress });
    ScrollTrigger.create({ trigger: MS_, start: 'top 60%', end: 'bottom 40%', onToggle: s => document.body.classList.toggle('nv3', s.isActive) });
  }
  const B9 = buildScenes;
  buildScenes = function () { B9(); const m = Market(); m.g.visible = false; GL.S.add(m.g); ST.market = m; SC.market = { stage: m, light: m.light, bg: m.bg, shift: [.13, 0], update: (p, t) => m.update(p, t) } };
})();

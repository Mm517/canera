/* ============================================================
   v8.js — «العلبة معاك في كل حتة»: خمس مشاهد ثلاثية الأبعاد بشخصيات حقيقية
   بيت · شغل · عربية · رحلة · مذاكرة
   ============================================================ */
(() => {
  const PI = Math.PI, TAU = PI * 2;
  const MS = (c, r = .8, m = 0, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: r, metalness: m }, o));
  const BX = (g, w, h, d, x, y, z, c, r = .8, m = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), c.isMaterial ? c : MS(c, r, m)); o.position.set(x, y, z); g.add(o); return o };
  const CY = (g, rt, rb, h, x, y, z, c, r = .6, m = 0, seg = 24) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), c.isMaterial ? c : MS(c, r, m)); o.position.set(x, y, z); g.add(o); return o };
  const SP = (g, rad, x, y, z, c, r = .6, sc) => { const o = new THREE.Mesh(new THREE.SphereGeometry(rad, 16, 12), c.isMaterial ? c : MS(c, r)); o.position.set(x, y, z); if (sc) o.scale.set(...sc); g.add(o); return o };
  const GLO = (g, w, h, x, y, z, c, ry = 0) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(c), toneMapped: false })); o.position.set(x, y, z); o.rotation.y = ry; g.add(o); return o };
  const cvs = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); fn(x, w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t };
  const TEXM = (tex, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ map: tex, roughness: .7 }, o));
  const EMI = (tex) => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  window.__v8 = { MS, BX, CY, SP, GLO, cvs, TEXM, EMI };

  const tileTex = (c1, c2, n = 8) => cvs(512, 512, (x, w, h) => { x.fillStyle = c1; x.fillRect(0, 0, w, h); const s = w / n; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const gr = x.createLinearGradient(0, j * s, 0, j * s + s); gr.addColorStop(0, c2); gr.addColorStop(1, c1); x.fillStyle = gr; x.fillRect(i * s + 2, j * s + 2, s - 4, s - 4); x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(i * s + 4, j * s + 4, s - 8, 3) } });
  const skyline = () => cvs(512, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1230'); g.addColorStop(1, '#2a2f5a'); x.fillStyle = g; x.fillRect(0, 0, w, h); const r = rand(5); for (let i = 0; i < 90; i++) { x.fillStyle = 'rgba(255,255,255,' + r() * .8 + ')'; x.fillRect(r() * w, r() * 100, 1.5, 1.5) } let px = 0; while (px < w) { const bw = 26 + r() * 40, bh = 60 + r() * 130; x.fillStyle = '#10142e'; x.fillRect(px, h - bh, bw, bh); for (let yy = h - bh + 8; yy < h - 8; yy += 12) for (let xx = px + 5; xx < px + bw - 6; xx += 10) { if (r() > .45) { x.fillStyle = r() > .5 ? '#ffd98a' : '#8fd0ff'; x.fillRect(xx, yy, 5, 6) } } px += bw + 2 } });

  function Places() {
    const g = new THREE.Group(), jj = makeJar(), jars = [makeJar(), makeJar(), makeJar()]; jars.forEach((j, i) => j.setVariant(i)); jj.setVariant(0);
    const steamPos = [], S = 22, anim = [];
    const jar = (x, y, z, s = .17, ry = 0, v = 0) => { const j = jars[v % 3].root.clone(true); j.visible = true; j.position.set(x, y + 1.73 * s, z); j.scale.setScalar(s); j.rotation.y = ry; g.add(j); return j };
    const mug = (x, y, z, s = 1) => { const m = new THREE.Group(); CY(m, .17, .13, .3, 0, .15, 0, MS('#f3eee4', .25, 0, { envMapIntensity: .9 })); CY(m, .15, .15, .02, 0, .29, 0, '#4a2614', .1); const h = new THREE.Mesh(new THREE.TorusGeometry(.09, .025, 8, 16, PI * 1.2), MS('#f3eee4', .25)); h.position.set(.18, .16, 0); h.rotation.z = -PI * .6; m.add(h); m.position.set(x, y, z); m.scale.setScalar(s); g.add(m); steamPos.push([x, y + .35 * s, z]); return m };
    const floorWood = (x, z0 = 0, w = 13, d = 10) => { const t = woodTex(); t.repeat.set(4, 3); const f = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: t, roughness: .5, envMapIntensity: .6 })); f.rotation.x = -PI / 2; f.position.set(x, 0, z0); g.add(f) };
    const wall = (x, z, w, h, mat) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); o.position.set(x, h / 2, z); g.add(o); return o };
    const person = (o, x, z, ry, s = 1.75) => { const p = Person(o); p.g.position.set(x, 0, z); p.g.rotation.y = ry; p.g.scale.setScalar(s); g.add(p.g); return p };
    const chair = (x, z, ry) => { const c = new THREE.Group(); BX(c, 1.0, .12, 1.0, 0, .62, 0, '#2a2f38', .6); BX(c, 1.0, 1.2, .1, 0, 1.25, .48, '#2a2f38', .6); CY(c, .06, .06, .6, 0, .3, 0, '#9aa0a6', .3, .9); for (let i = 0; i < 5; i++) { const a = i * TAU / 5, l = BX(c, .08, .05, .55, Math.sin(a) * .28, .05, Math.cos(a) * .28, '#9aa0a6', .3, .9); l.rotation.y = a } c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); return c };
    const lampW = (x, y, z, col = '#ffe2a8') => { const l = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(col), toneMapped: false })); l.position.set(x, y, z); g.add(l) };

    /* ========== 1) البيت: مطبخ ========== */
    const K = 0; floorWood(K);
    wall(K, -3.4, 13, 7.5, TEXM(tileTex('#1c342d', '#2b4e44', 10), { roughness: .35, envMapIntensity: .5 }));
    BX(g, 7.2, 1.0, 2.0, K, .5, -2.2, '#a67a48', .45); BX(g, 7.5, .12, 2.3, K, 1.06, -2.2, '#e8e0d2', .2, .05);
    [-2.4, -.8, .8, 2.4].forEach(x => { BX(g, 1.45, .8, .04, K + x, .5, -1.18, '#8a6238', .5); BX(g, .35, .04, .05, K + x, .78, -1.14, '#c9a24a', .3, .9) });
    [-1, 1].forEach(s => { BX(g, 2.6, 1.6, .9, K + 2.2 + s * 1.4, 4.4, -2.95, '#8a6238', .5); BX(g, .05, .5, .05, K + 2.2 + s * 1.4 + .3, 3.7, -2.47, '#c9a24a', .3, .9) });
    const win = BX(g, 3.0, 3.2, .08, K - 2.8, 4.0, -3.36, '#2a1d14'); GLO(g, 2.7, 2.9, K - 2.8, 4.0, -3.3, '#ffe9b8'); BX(g, .1, 2.9, .06, K - 2.8, 4.0, -3.26, '#2a1d14'); BX(g, 2.7, .1, .06, K - 2.8, 4.0, -3.26, '#2a1d14');
        const pend = new THREE.Group(); CY(pend, .01, .01, 1.6, 0, 1.2, 0, '#222'); const sh = new THREE.Mesh(new THREE.ConeGeometry(.6, .45, 24, 1, true), MS('#c9a24a', .35, .6, { side: THREE.DoubleSide })); sh.position.y = .22; pend.add(sh); GLO(pend, .5, .5, 0, .05, 0, '#fff0c8').rotation.x = PI / 2; pend.position.set(K, 5.2, -1.2); g.add(pend);
    const lp = new THREE.PointLight(0xffd9a0, 3.0, 16); lp.position.set(K - 1, 4.4, -.6); g.add(lp);
    // غلاية
    const kt = new THREE.Group(); const kb = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.34, 0], [.4, .1], [.38, .5], [.26, .62], [.1, .66], [0, .66]].map(a => new THREE.Vector2(a[0], a[1])), 28), MS('#c3c8cf', .25, .95)); kt.add(kb);
    const sp = CY(kt, .04, .08, .5, .46, .38, 0, '#c3c8cf', .25, .95); sp.rotation.z = -.9; const hd = new THREE.Mesh(new THREE.TorusGeometry(.22, .03, 8, 18, PI), MS('#2a2a2a', .6)); hd.position.set(-.05, .66, 0); kt.add(hd); kt.position.set(K - 2.5, 1.12, -2.3); g.add(kt);
    const st1 = [[K - 2.0, 1.2, -2.3]];
    // وعاء فاكهة
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(.5, 20, 10, 0, TAU, PI / 2, PI / 2), MS('#e8e0d2', .3)); bowl.position.set(K + 2.5, 1.38, -2.3); g.add(bowl);
    [['#d9402f', 0, 0], ['#f2a33a', .3, .1], ['#e8c830', -.25, .1], ['#7aa83a', .05, .22]].forEach(a => SP(g, .17, K + 2.5 + a[1], 1.36 + a[2] * 1.5, -2.3 + a[2] * .2, a[0], .4));
    // نبتة
    CY(g, .34, .26, .45, K - 4.1, 1.3, -2.6, '#b4693f', .8); for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), MS('#2f7a3a', .55)); l.scale.set(.45, 1.6, .2); const a = i / 9 * TAU; l.position.set(K - 4.1 + Math.cos(a) * .2, 1.9 + (i % 3) * .14, -2.6 + Math.sin(a) * .2); l.rotation.set(Math.sin(a) * .6, 0, -Math.cos(a) * .6); g.add(l) }
    jar(K + .1, 1.12, -2.2, .17, .3, 0); jar(K + .8, 1.12, -2.0, .15, -.4, 1); mug(K + 1.5, 1.12, -1.7);
    const pK = person({ shirt: '#d9d2c0', pants: '#3a3a44', hat: 'none', seed: 21, beard: true, sleeves: 'long', vest: '#2a4a3f' }, K - 1.1, -.7, .5);
    anim.push(t => { pK.act('drink', .5 + .5 * Math.sin(t * .7), t, {}) });

    /* ========== 2) الشغل: مكتب ========== */
    const O = S; { const f = new THREE.Mesh(new THREE.PlaneGeometry(13, 10), new THREE.MeshStandardMaterial({ color: lin('#3a3f48'), roughness: .8 })); f.rotation.x = -PI / 2; f.position.set(O, 0, 0); g.add(f) }
    wall(O, -3.4, 13, 7.5, MS('#2a3d5c', .85));
    BX(g, 13, .35, .1, O, .18, -3.3, '#1c2840');
    BX(g, 6.4, .14, 2.6, O, 1.0, -1.8, '#d9c9a8', .45); [-3, 3].forEach(x => BX(g, .16, 1.0, 2.4, O + x, .5, -1.8, '#9aa0a6', .4, .6));
    BX(g, 2.8, .5, 2.0, O + 2.4, .5, -1.8, '#c8bfa8', .5).visible = false;
    // شاشة
    const stand = BX(g, .25, .5, .25, O, 1.32, -2.7, '#9aa0a6', .3, .85); BX(g, 1.0, .05, .6, O, 1.09, -2.65, '#9aa0a6', .3, .85);
    BX(g, 3.0, 1.75, .08, O, 2.3, -2.8, '#12161d', .3, .4);
    const scrT = cvs(512, 288, (x, w, h) => { x.fillStyle = '#10161f'; x.fillRect(0, 0, w, h); x.fillStyle = '#1b2a40'; x.fillRect(0, 0, w, 26); ['#ff6a5a', '#ffd25a', '#5aff8a'].forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.arc(14 + i * 18, 13, 5, 0, 7); x.fill() }); const r = rand(3); for (let i = 0; i < 16; i++) { x.fillStyle = ['#7fb7ff', '#ffb86b', '#9aff9a', '#d8a8ff'][i % 4]; x.fillRect(30 + (i % 3) * 22, 44 + i * 14, 40 + r() * 230, 6) } x.fillStyle = '#1b2a40'; x.fillRect(330, 44, 160, 210); x.fillStyle = '#e8bd78'; for (let i = 0; i < 6; i++) x.fillRect(344 + i * 22, 230 - (20 + r() * 150), 14, 20 + r() * 150) });
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.58), EMI(scrT)); scr.position.set(O, 2.3, -2.755); g.add(scr);
    const scl = new THREE.PointLight(0x9ac6ff, 1.2, 7); scl.position.set(O, 2.2, -1.5); g.add(scl);
    BX(g, 1.8, .06, .6, O, 1.1, -.95, '#222831', .5); BX(g, .3, .06, .45, O + 1.3, 1.1, -.9, '#222831', .5);
    // لمبة مكتب + شبّاك + ساعة + رف
    CY(g, .05, .05, 1.2, O - 2.4, 1.7, -2.4, '#c3c8cf', .3, .9); const ls = new THREE.Mesh(new THREE.ConeGeometry(.4, .35, 20, 1, true), MS('#e8bd78', .4, .3, { side: THREE.DoubleSide })); ls.position.set(O - 2.0, 2.4, -2.3); ls.rotation.z = .6; g.add(ls); lampW(O - 1.9, 2.25, -2.3, '#fff0c8');
    BX(g, 4.2, 2.8, .08, O + 3.9, 4.2, -3.36, '#12161d'); const sk = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 2.6), EMI(skyline())); sk.position.set(O + 3.9, 4.2, -3.3); g.add(sk);
    const clk = new THREE.Group(); CY(clk, .5, .5, .06, 0, 0, 0, '#f4efe6', .4).rotation.x = PI / 2; const h1 = BX(clk, .05, .3, .03, 0, .12, .05, '#222'), h2 = BX(clk, .03, .42, .03, 0, .18, .06, '#a8301c'); h1.geometry.translate(0, .1, 0); h2.geometry.translate(0, .14, 0); h1.position.set(0, 0, .05); h2.position.set(0, 0, .06); clk.position.set(O - 3.0, 5.3, -3.28); g.add(clk);
    [0, 1].forEach(i => BX(g, 2.6, .08, .5, O - 4.2 + (i ? 0 : 0), 3.3 + i * 1.3, -3.1, '#6a4a2c')); const bk = ['#a8472f', '#2f6f8f', '#d9a441', '#3d7a4a', '#6d3b8a', '#e8e0cc']; for (let i = 0; i < 16; i++) BX(g, .16, .6 + (i % 3) * .08, .36, O - 5.2 + i * .17, 3.65 + (i % 3) * .04, -3.1, bk[i % 6], .8);
    CY(g, .34, .26, .5, O + 4.7, .3, -2.4, '#b4693f', .8); for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.22, 10, 8), MS('#2f7a3a', .55)); l.scale.set(.45, 1.6, .2); const a = i / 9 * TAU; l.position.set(O + 4.7 + Math.cos(a) * .2, .9 + (i % 3) * .14, -2.4 + Math.sin(a) * .2); l.rotation.set(Math.sin(a) * .6, 0, -Math.cos(a) * .6); g.add(l) }
    jar(O + 2.3, 1.07, -1.9, .17, -.5, 2); jar(O + 1.8, 1.07, -1.4, .14, .2, 0); mug(O - 1.4, 1.07, -1.2);
    chair(O, .0, PI);
    const pO = person({ shirt: '#e8eef0', pants: '#2a2f3a', hat: 'none', seed: 24, glasses: true, sleeves: 'long', hair: '#3a2a1a' }, O, .05, PI, 1.75);
    anim.push(t => { const ph = t % 9; pO.act(ph < 6 ? 'type' : 'drink', ph < 6 ? 0 : cl((ph - 6) / 1.5, 0, 1) * (1 - cl((ph - 8) / .8, 0, 1)), t, { sit: true, hands: null }) ; clk.children.forEach(() => { }); h1.rotation.z = -t * .02; h2.rotation.z = -t * .24 });

    /* ========== 3) العربية: كابينة من ورا السواق ========== */
    const C = 2 * S;
    const sky3 = new THREE.Mesh(new THREE.SphereGeometry(90, 24, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'varying vec3 vP;void main(){float h=clamp(vP.y,0.,1.);vec3 c=mix(vec3(1.,.62,.3),vec3(.25,.35,.62),pow(h,.5));float s=max(dot(vP,normalize(vec3(.1,.12,-1.))),0.);c+=vec3(1.,.8,.5)*(pow(s,80.)*1.6+pow(s,6.)*.25);gl_FragColor=vec4(c,1.);}' })); sky3.position.set(C, 0, -10); g.add(sky3);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 120), MS('#25272c', .85)); road.rotation.x = -PI / 2; road.position.set(C, -.9, -50); g.add(road);
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(160, 120), MS('#5a7a3a', 1)); gr.rotation.x = -PI / 2; gr.position.set(C, -.95, -50); g.add(gr);
    const lanes = Array.from({ length: 14 }, (_, i) => { const l = BX(g, .2, .02, 2.2, C, -.88, 0, '#f4efe6', .9); return l });
    const poles = Array.from({ length: 10 }, (_, i) => { const p = new THREE.Group(); CY(p, .1, .12, 6, 0, 3, 0, '#4a3a2a', .9); BX(p, 1.6, .12, .12, 0, 5.8, 0, '#4a3a2a', .9); p.position.set(C + 6.2, -.9, 0); g.add(p); return p });
    const mts = [[-30, -80, 22], [-6, -90, 30], [28, -85, 26], [55, -78, 20]].forEach(m => { const o = new THREE.Mesh(new THREE.ConeGeometry(m[2], m[2] * 1.2, 5), MS('#3a4a6a', 1)); o.position.set(C + m[0], m[2] * .5 - 1, m[1]); g.add(o) });
    const cw = [...Array(8)].map((_, i) => { const t = new THREE.Mesh(new THREE.ConeGeometry(1.1 + (i % 3) * .3, 3.5, 6), MS('#2f5a3a', 1)); t.position.set(C - 8 - (i % 4) * 3, 1, -10); g.add(t); return t });
    // الكابينة
    BX(g, 8, .3, 6, C, -.2, 1.2, '#1c1f24', .8); BX(g, 7.4, 1.0, 1.8, C, .45, -2.8, '#2a2d34', .55); BX(g, 7.4, .12, 1.9, C, 1.0, -2.75, '#1c1f24', .6);
    BX(g, 2.0, .6, .14, C - 1.6, 1.15, -2.0, '#14161a', .5); const clu = cvs(256, 128, (x, w, h) => { x.fillStyle = '#05080c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7dffb0'; x.lineWidth = 3; x.beginPath(); x.arc(70, 64, 40, PI * .8, PI * 2.2); x.stroke(); x.beginPath(); x.arc(186, 64, 40, PI * .8, PI * 2.2); x.stroke(); x.fillStyle = '#ffd48a'; x.font = '700 30px monospace'; x.textAlign = 'center'; x.fillText('٨٠', 128, 76) }); const cluM = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .5), EMI(clu)); cluM.position.set(C - 1.6, 1.15, -1.92); g.add(cluM);
    const wh = new THREE.Group(); const tor = new THREE.Mesh(new THREE.TorusGeometry(.62, .09, 12, 36), MS('#14161a', .55)); wh.add(tor); [0, 1, 2].forEach(i => { const sp2 = BX(wh, .06, .62, .05, 0, 0, 0, '#2a2d34', .5); sp2.rotation.z = i * TAU / 3 + PI / 2 * 0 }); CY(wh, .16, .16, .1, 0, 0, 0, '#2a2d34', .4, .5).rotation.x = PI / 2; wh.position.set(C - 1.6, 1.85, -.9); wh.rotation.x = -.55; g.add(wh);
    BX(g, .3, 1.4, .3, C - 1.6, 1.0, -1.4, '#14161a'); BX(g, 1.1, .1, 1.3, C + .6, 1.2, -1.6, '#14161a');
    // مقاعد
    const seat = (x, z) => { BX(g, 1.5, .3, 1.5, x, .55, z, '#3a3f48', .8); BX(g, 1.4, 1.8, .3, x, 1.45, z + .8, '#3a3f48', .8); BX(g, .8, .5, .25, x, 2.6, z + .85, '#33373e', .8) }; seat(C - 1.6, .4); seat(C + 1.6, .4);
    // كوباية ترمس + علبة على كرسي الراكب
    CY(g, .17, .15, .7, C + .15, 1.55, -1.6, '#2f6f8f', .35, .6); jar(C + 1.6, .72, .2, .2, 2.4, 1); mug(C + .1, 1.06, -1.5, .9);
    // أعمدة وسقف
    [-1, 1].forEach(s => { const a = BX(g, .3, 3.4, .3, C + s * 4.0, 2.4, -2.4, '#1c1f24'); a.rotation.z = -s * .12; a.rotation.x = .3 }); BX(g, 8.4, .3, .5, C, 4.15, -3.6, '#1c1f24');
    const mir = BX(g, .8, .3, .06, C, 3.7, -3.4, '#14161a'); BX(g, .76, .26, .02, C, 3.7, -3.37, '#5a7ea8', .1, .8);
    const pC = person({ shirt: '#2f6f8f', pants: '#2a2f3a', hat: 'cap', hatC: '#efe9da', seed: 33, beard: true, sleeves: 'long' }, C - 1.6, .45, PI, 1.75);
    anim.push(t => { pC.act('drive', 0, t, {}); wh.rotation.z = Math.sin(t * .5) * .08 });
    const sunl = new THREE.PointLight(0xffa860, 2.4, 22); sunl.position.set(C, 3, -9); g.add(sunl);

    /* ========== 4) الرحلة: كامب جبلي ========== */
    const T = 3 * S;
    const sk4 = new THREE.Mesh(new THREE.SphereGeometry(90, 24, 12), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'varying vec3 vP;void main(){float h=clamp(vP.y,0.,1.);vec3 c=mix(vec3(.3,.22,.38),vec3(.02,.04,.14),pow(h,.45));gl_FragColor=vec4(c,1.);}' })); sk4.position.set(T, 0, 0); g.add(sk4);
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(30, 40), MS('#2a4a2c', 1)); gnd.rotation.x = -PI / 2; gnd.position.set(T, 0, -12); g.add(gnd);
    [[-12, -22, 12], [2, -26, 15], [16, -22, 11], [-26, -20, 10], [28, -24, 12]].forEach(m => { const o = new THREE.Mesh(new THREE.ConeGeometry(m[2], m[2] * 1.4, 5), MS('#1a2840', 1)); o.position.set(T + m[0], m[2] * .7, m[1]); g.add(o); const cap = new THREE.Mesh(new THREE.ConeGeometry(m[2] * .3, m[2] * .42, 5), MS('#dfe8f0', .9)); cap.position.set(T + m[0], m[2] * 1.3, m[1]); g.add(cap) });
    const rr = rand(15); for (let i = 0; i < 40; i++) { const x = T + (rr() - .5) * 28, z = -6 - rr() * 14; if (Math.abs(x - T) < 6 && z > -9) continue; const tr = new THREE.Group(); CY(tr, .12, .16, 1, 0, .5, 0, '#4a3320', .9); [0, .8, 1.5].forEach((y, k) => { const c = new THREE.Mesh(new THREE.ConeGeometry(1.2 - k * .3, 1.7, 7), MS('#1c4a2c', 1)); c.position.y = 1.3 + y; tr.add(c) }); tr.position.set(x, 0, z); tr.scale.setScalar(.8 + rr() * .8); g.add(tr) }
    const tent = new THREE.Group(); { const sh2 = new THREE.Shape(); sh2.moveTo(-1.8, 0); sh2.lineTo(0, 2.2); sh2.lineTo(1.8, 0); const ex = new THREE.ExtrudeGeometry(sh2, { depth: 3, bevelEnabled: false }); const m = new THREE.Mesh(ex, MS('#d9a441', .85, 0, { side: THREE.DoubleSide })); m.position.z = -1.5; tent.add(m); BX(tent, .02, 1.3, .02, 0, 0, 0, '#222').visible = false; const door = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.5), MS('#3a2a14', .9)); door.position.set(0, .7, 1.52); tent.add(door) } tent.position.set(T - 4.4, 0, -4.4); tent.rotation.y = .5; g.add(tent);
    const fireG = new THREE.Group(); fireG.position.set(T + .2, 0, -1.2); g.add(fireG); for (let i = 0; i < 6; i++) { const l = CY(fireG, .1, .1, 1.1, 0, .12, 0, '#4a2f1a', .95); l.rotation.z = PI / 2; l.rotation.y = i * 1.05; l.position.set(Math.cos(i * 1.05) * .3, .12, Math.sin(i * 1.05) * .3) } for (let i = 0; i < 12; i++) { const s = SP(fireG, .1, Math.cos(i * .52) * 1.0, .06, Math.sin(i * .52) * 1.0, '#6a6a6a', .95); s.scale.set(1, .6, 1) }
    const fire = puffs(26, { color: '#ff8a30', additive: true }), embers = puffs(30, { color: '#ffd18a', additive: true }); g.add(fire, embers); const fl = new THREE.PointLight(0xff8a30, 3.2, 14); fl.position.set(T + .2, 1.1, -1.0); g.add(fl);
    const stars = puffs(90, { color: '#ffffff', additive: true }); g.add(stars); const sr = rand(8); for (let i = 0; i < 90; i++) setPuff(stars, i, T + (sr() - .5) * 60, 8 + sr() * 24, -40, .12 + sr() * .1, .4 + sr() * .5); flushPuffs(stars);
    const moon = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), new THREE.MeshBasicMaterial({ color: 0xfff6d8, toneMapped: false })); moon.position.set(T + 10, 15, -42); g.add(moon);
    // ترايبود وغلاية
    for (let i = 0; i < 3; i++) { const a = i * TAU / 3, l = CY(fireG, .03, .03, 2.0, Math.cos(a) * .35, 1.0, Math.sin(a) * .35, '#5a3a22', .9); l.rotation.set(Math.sin(a) * .35, 0, -Math.cos(a) * .35) }
    const kk = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.3, 0], [.34, .1], [.3, .45], [.12, .55], [0, .55]].map(a => new THREE.Vector2(a[0], a[1])), 22), MS('#2a2d34', .4, .6)); kk.position.set(0, 1.35, 0); fireG.add(kk);
    // كراسي + مدفأة + علبة على جذع
    const logS = CY(g, .5, .5, .5, T + 2.4, .25, .3, '#6a4a2c', .95); jar(T + 2.4, .5, .3, .17, .5, 2); const logS2 = CY(g, .4, .4, .45, T - 1.8, .22, -.6, '#6a4a2c', .95); mug(T - 1.8, .45, -.6, .9);
    const cch = new THREE.Group(); BX(cch, 1.3, .1, 1.0, 0, .75, 0, '#2f6f8f', .8); BX(cch, 1.3, 1.0, .1, 0, 1.3, .5, '#2f6f8f', .8); [[-.6, -.45], [.6, -.45], [-.6, .45], [.6, .45]].forEach(a => CY(cch, .04, .04, .8, a[0], .38, a[1], '#9aa0a6', .3, .9)); cch.position.set(T + 1.8, 0, 1.5); cch.rotation.y = .53; g.add(cch);
    const pT = person({ shirt: '#a8472f', pants: '#3a3a44', hat: 'wrap', hatC: '#c8b27a', seed: 44, vest: '#2f3a4a', beard: true }, T + 1.85, 1.55, PI + .53, 1.75); pT.g.position.y = .12;
    const pT2 = person({ shirt: '#3d7a4a', pants: '#2a2a2a', hat: 'cap', hatC: '#e8e0cc', seed: 46 }, T - 2.0, .6, 1.2, 1.75);
    anim.push(t => { pT.act('sit', 0, t, { lean: -.05, nod: .1, yaw: .0, tool: 'mug', toolMode: 'mug', hands: [new THREE.Vector3(-.2, .1, .3), new THREE.Vector3(.14, .38, .4)] }); pT2.act('drink', .5 + .5 * Math.sin(t * .5 + 1), t, {}) });
    const lant = new THREE.Group(); CY(lant, .16, .16, .4, 0, .25, 0, '#222', .4, .6); const lg = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .34, 12), new THREE.MeshBasicMaterial({ color: 0xffe0a0, toneMapped: false })); lg.position.y = .25; lant.add(lg); lant.position.set(T - 3.2, .0, 1.2); g.add(lant); 

    /* ========== 5) المذاكرة ========== */
    const D = 4 * S; { const f = new THREE.Mesh(new THREE.PlaneGeometry(13, 10), new THREE.MeshStandardMaterial({ color: lin('#3a2a22'), roughness: .75 })); f.rotation.x = -PI / 2; f.position.set(D, 0, 0); g.add(f) }
    wall(D, -3.4, 13, 7.5, MS('#2f2542', .9)); BX(g, 13, .3, .1, D, .15, -3.3, '#1a1426');
    BX(g, 6.4, .14, 2.6, D, 1.0, -1.8, '#7a5230', .5); [-3, 3].forEach(x => BX(g, .16, 1.0, 2.4, D + x, .5, -1.8, '#5a3a22', .7));
    const win5 = BX(g, 3.4, 3.4, .08, D + 3.6, 4.2, -3.36, '#1a1426'); const sk5 = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), EMI(skyline())); sk5.position.set(D + 3.6, 4.2, -3.3); g.add(sk5); const mn = new THREE.Mesh(new THREE.CircleGeometry(.35, 24), new THREE.MeshBasicMaterial({ color: 0xfff6d8, toneMapped: false })); mn.position.set(D + 4.3, 5.2, -3.27); g.add(mn);
    const cork = BX(g, 3.0, 2.0, .08, D - 3.2, 4.3, -3.34, '#b08850', .9); [['#ffd25a', -1], ['#7fd4ff', 0], ['#ff9fb2', 1]].forEach((n, i) => { const p = BX(g, .6, .6, .02, D - 3.2 + n[1] * .9, 4.3 + (i % 2) * .4 - .2, -3.28, n[0], .9); p.rotation.z = (i - 1) * .12 });
    [0, 1, 2, 3].forEach(i => BX(g, 1.2 - i * .1, .2, .9, D - 2.0, 1.17 + i * .2, -1.5, ['#a8472f', '#2f6f8f', '#d9a441', '#3d7a4a'][i], .8));
    const lap = new THREE.Group(); BX(lap, 1.6, .06, 1.1, 0, 0, 0, '#9aa0a6', .3, .85); const lsc = BX(lap, 1.6, 1.0, .05, 0, .5, -.55, '#9aa0a6', .3, .85); lsc.rotation.x = -.18; GLO(lap, 1.45, .88, 0, .5, -.51, '#bfe0ff').rotation.x = -.18; lap.position.set(D + .9, 1.1, -1.7); g.add(lap);
    const nb = BX(g, 1.2, .04, .9, D - .3, 1.09, -1.0, '#efe9da', .9); nb.rotation.y = .1;
    CY(g, .05, .05, 1.3, D + 2.4, 1.7, -2.5, '#c3c8cf', .3, .9); const sh3 = new THREE.Mesh(new THREE.ConeGeometry(.55, .45, 20, 1, true), MS('#d9a441', .5, 0, { side: THREE.DoubleSide })); sh3.position.set(D + 2.4, 2.4, -2.5); g.add(sh3); lampW(D + 2.4, 2.25, -2.5, '#fff0c8');
    const lp5 = new THREE.PointLight(0xffc27a, 2.6, 9); lp5.position.set(D + 2.3, 2.3, -2.0); g.add(lp5);
    jar(D - 1.2, 1.07, -2.3, .17, .4, 1); jar(D - 1.8, 1.07, -2.0, .14, -.3, 2); mug(D + .2, 1.07, -.6);
    chair(D, .0, PI);
    const pD = person({ shirt: '#d9402f', pants: '#2a2f3a', hat: 'none', seed: 55, hair: '#2a1a10', sleeves: 'long' }, D, .05, PI, 1.75);
    const hp = new THREE.Mesh(new THREE.TorusGeometry(.2, .04, 8, 18, PI), MS('#14161a', .4)); hp.position.set(0, .16, 0); pD.head.add(hp);
    anim.push(t => { pD.act('read', 0, t, {}) });
    const steam = puffs(40, { color: '#f4efe6' }); g.add(steam);
    const cam = { p: new THREE.Vector3(), l: new THREE.Vector3() }, fb = puffs(24, { color: '#ffe27a', additive: true }); g.add(fb);
    return {
      id: 'places', g, fog: null, bg: '#101a1a', light: { hemi: ['#dfe8f0', '#2a1d14', .55], key: ['#ffe8c8', 1.0, [3, 7, 6]], rim: ['#ffb870', .8, [-5, 3, -4]], exp: 1.1 },
      update(p, t) {
        const f = Math.min(4, p * 4.999), i = Math.floor(f), pos = i >= 4 ? 4 : i + sm(rng(.6, 1, f - i));
        anim.forEach(a => a(t));
        steamPos.forEach((s, k) => { for (let j = 0; j < 8; j++) { const u = (t * .3 + j / 8 + k * .13) % 1; setPuff(steam, k * 8 + j, s[0] + Math.sin(j * 2 + t) * .06 * u, s[1] + u * 1.0, s[2], .35 + u * .5, Math.sin(u * PI) * .25) } }); flushPuffs(steam);
        for (let j = 0; j < 26; j++) { const u = (t * .7 + j / 26) % 1; setPuff(fire, j, T + .2 + Math.sin(j * 3) * .3 * (1 - u), .2 + u * 1.4, -1.2 + Math.cos(j * 2) * .25, .8 * (1 - u * .6), (1 - u) * .8) } flushPuffs(fire);
        for (let j = 0; j < 30; j++) { const u = (t * .25 + j / 30) % 1; setPuff(embers, j, T + .2 + Math.sin(j * 5 + t) * (.3 + u), .6 + u * 4, -1.2 + Math.cos(j * 3) * (.3 + u), .1, (1 - u) * .8) } flushPuffs(embers);
        for (let j = 0; j < 24; j++) { const a = j * 2.4 + t * .3; setPuff(fb, j, T - 5 + Math.sin(a) * 5, 1 + Math.sin(a * 1.7) * .8 + (j % 3), -1 + Math.cos(a * 1.3) * 4, .12, (.5 + .5 * Math.sin(t * 2 + j)) * .6) } flushPuffs(fb);
        fl.intensity = 3 + Math.sin(t * 9) * .5 + Math.sin(t * 13) * .3;
        lanes.forEach((l, k) => l.position.z = -26 + ((t * 14 + k * 4) % 56) - 28 + 0 + 18); poles.forEach((q, k) => q.position.z = ((t * 10 + k * 12) % 120) - 110 + 20);
        cw.forEach((c, k) => c.position.z = ((t * 6 + k * 14) % 100) - 80);
        const o = Math.sin(t * .25) * .5, rel = [[0, 3.0, 8.8, 0, 2.2, -1.5], [0, 3.2, 8.4, 0, 2.0, -1.0], [2.4, 3.9, 6.4, -1.0, 1.7, -2.5], [1, 3.0, 8.6, 0, 1.5, -1.5], [0, 3.0, 8.4, 0, 2.0, -1.2]];
        const i0 = Math.min(4, Math.floor(pos)), i1 = Math.min(4, i0 + 1), u = pos - i0, A = rel[i0], B = rel[i1];
        cam.p.set(mx(i0 * S + A[0], i1 * S + B[0], u) + o, mx(A[1], B[1], u), mx(A[2], B[2], u)); cam.l.set(mx(i0 * S + A[3], i1 * S + B[3], u), mx(A[4], B[4], u), mx(A[5], B[5], u));
        return cam;
      }
    };
  }
  const PLC = [['في البيت', 'أول كوباية في الصبح، والبرطمان قاعد على رخامة المطبخ جنب الغلاية.'], ['في الشغل', 'ثواني بين اجتماعين من غير ماكينة ولا انتظار.'], ['في الطريق', 'ماية سخنة من الترمس وملعقة، وتكمّل مشوارك.'], ['في الرحلة', 'خفيف وسهل يتشال في الشنطة، وسط الجبل وحوالين النار.'], ['وقت المذاكرة', 'سهرة طويلة؟ كوباية سريعة تصحّيك وتكمّل.']];
  const PS = document.getElementById('places');
  if (PS) {
    PS.className = 'chap'; PS.style.height = '640vh'; PS.innerHTML = `<div class="st"><div class="cap"><div class="cn"><span class="num">٠١</span><span class="kick">في أي مكان</span></div><h2 class="ct"></h2><p class="cp"></p><ol class="dots">${PLC.map(() => '<li></li>').join('')}</ol></div></div>`;
    const el = PS.querySelector('.cap'); CAPS.places = { el, ct: el.querySelector('.ct'), cp: el.querySelector('.cp'), li: [...el.querySelectorAll('li')], idx: -1, steps: PLC.map((c, i) => ({ at: i ? [.16, .36, .56, .76][i - 1] : 0, t: c[0], p: c[1] })) };
    capSet('places', 0, true); PR.places = 0; CUR.places = 0; BG.places = '#101a1a';
    ScrollTrigger.create({ trigger: PS, start: 'top 50%', end: 'bottom 50%', onToggle: s => { if (s.isActive) setActive('places') } });
    ScrollTrigger.create({ trigger: PS, start: 'top top', end: 'bottom bottom', onUpdate: s => PR.places = s.progress, onRefresh: s => PR.places = s.progress });
  }
  const B8 = buildScenes;
  buildScenes = function () { B8(); const pl = Places(); pl.g.visible = false; GL.S.add(pl.g); ST.places = pl; SC.places = { stage: pl, light: pl.light, bg: pl.bg, shift: [.15, 0], update: (p, t) => pl.update(p, t) } };
})();

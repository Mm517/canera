/* ============================================================
   v7.js — مرحلة التجفيف بأسرّة أفريقية واقعية (شبك + أخشاب + أدوات + عمّال)
   ============================================================ */
(() => {
  const PI = Math.PI;
  const MT = (c, r = .85, m = 0, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: r, metalness: m }, o));
  const box = (g, w, h, d, x, y, z, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); g.add(m); return m };
  const woodMat = () => { const t = woodTex(); t.repeat.set(1, 1); return new THREE.MeshStandardMaterial({ map: t, roughness: .8, color: 0xcfa27a }) };
  function meshTex(rep) {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.clearRect(0, 0, 128, 128);
    x.strokeStyle = '#2a2a28'; x.lineWidth = 5; for (let i = 0; i <= 128; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.moveTo(0, i); x.lineTo(128, i); x.stroke() }
    x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 1.5; for (let i = 0; i <= 128; i += 16) { x.beginPath(); x.moveTo(i - 1.5, 0); x.lineTo(i - 1.5, 128); x.moveTo(0, i - 1.5); x.lineTo(128, i - 1.5); x.stroke() }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = 8; t.encoding = THREE.sRGBEncoding; return t;
  }
  function makeBed(L, W, H) {      // سرير تجفيف مرتفع بالشبك
    const g = new THREE.Group(), wd = woodMat();
    const nx = Math.round(L / 1.2) + 1;
    for (let i = 0; i < nx; i++) [-1, 1].forEach(s => { const x = -L / 2 + i * L / (nx - 1); box(g, .1, H, .1, x, H / 2, s * (W / 2 - .05), wd) });
    [-1, 1].forEach(s => { box(g, L + .1, .07, .06, 0, H - .08, s * (W / 2 - .05), wd); box(g, L + .1, .06, .05, 0, .25, s * (W / 2 - .05), wd) });
    for (let i = 0; i < nx; i++) { const x = -L / 2 + i * L / (nx - 1); box(g, .07, .06, W - .1, x, H - .08, 0, wd) }
    for (let i = 0; i < nx - 1; i++) [-1, 1].forEach(s => { const b = box(g, .05, .05, .9, -L / 2 + (i + .5) * L / (nx - 1), .42, s * (W / 2 - .05), wd); b.rotation.x = 0; b.scale.set(1, 1, 1); b.rotation.y = PI / 2; b.scale.z = 1.1; b.rotation.z = .8 });
    const mt = meshTex([L * 5, W * 5]), mesh = new THREE.Mesh(new THREE.PlaneGeometry(L, W), new THREE.MeshStandardMaterial({ map: mt, transparent: true, alphaTest: .25, side: THREE.DoubleSide, roughness: .5, metalness: .7 }));
    mesh.rotation.x = -PI / 2; mesh.position.y = H; g.add(mesh);
    [-1, 1].forEach(s => box(g, L, .14, .035, 0, H + .05, s * W / 2, wd)); [-1, 1].forEach(s => box(g, .035, .14, W, s * L / 2, H + .05, 0, wd));
    g.userData.top = H + .02; return g;
  }
  function sackMesh(label) {
    const c = document.createElement('canvas'); c.width = 128; c.height = 192; const x = c.getContext('2d'); x.fillStyle = '#b79b6b'; x.fillRect(0, 0, 128, 192);
    for (let i = 0; i < 192; i += 3) { x.fillStyle = i % 6 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.08)'; x.fillRect(0, i, 128, 1) } for (let i = 0; i < 128; i += 3) { x.fillStyle = i % 6 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.07)'; x.fillRect(i, 0, 1, 192) }
    x.fillStyle = '#2a4a3f'; x.font = '700 34px "Reem Kufi",Tahoma'; x.textAlign = 'center'; x.fillText('بُنّ', 64, 80); x.font = '500 15px Tajawal,Tahoma'; x.fillText(label, 64, 106); x.strokeStyle = '#2a4a3f'; x.lineWidth = 3; x.strokeRect(14, 40, 100, 80);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    const g = new THREE.Group(), m = new THREE.Mesh(new THREE.CylinderGeometry(.3, .38, .8, 20), new THREE.MeshStandardMaterial({ map: t, roughness: 1 })); m.position.y = .4; g.add(m);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(.24, .3, .12, 16), new THREE.MeshStandardMaterial({ color: lin('#a28a5e'), roughness: 1 })); top.position.y = .84; g.add(top);
    const tie = new THREE.Mesh(new THREE.TorusGeometry(.2, .02, 6, 16), new THREE.MeshStandardMaterial({ color: lin('#5a3a22'), roughness: .9 })); tie.rotation.x = PI / 2; tie.position.y = .78; g.add(tie); return g;
  }
  function rakeProp() {
    const g = new THREE.Group(), wd = MT('#8a6238', .75); const h = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1.5, 8), wd); h.position.y = .75; g.add(h);
    box(g, .45, .03, .04, 0, 0, 0, wd); for (let i = 0; i < 9; i++) { const t = box(g, .016, .016, .12, -.2 + i * .05, -.02, .07, wd) } return g;
  }
  function dialTex(txt, bg = '#101a14', fg = '#7dffb0') {
    const c = document.createElement('canvas'); c.width = 128; c.height = 64; const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 128, 64); x.fillStyle = fg; x.font = '700 34px monospace'; x.textAlign = 'center'; x.fillText(txt, 64, 44);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }

  Process = function () {
    const g = new THREE.Group(), r = rand(21), NC = 140, NB = LOW ? 650 : 1200;
    // ----- سما + تلال
    const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: {}, vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}', fragmentShader: 'varying vec3 vP;void main(){float h=clamp(vP.y,0.,1.);vec3 c=mix(vec3(1.,.82,.55),vec3(.32,.55,.78),pow(h,.45));gl_FragColor=vec4(c,1.);}' }));
    g.add(sky);
    const hills = new THREE.Group(); [[-30, -34, 14, '#4a6a3a'], [-6, -40, 18, '#3f5f34'], [26, -36, 15, '#52703e'], [48, -30, 12, '#456534']].forEach(h => { const m = new THREE.Mesh(new THREE.SphereGeometry(h[2], 24, 12, 0, PI * 2, 0, PI / 2), MT(h[3], 1)); m.position.set(h[0], -1.2, h[1]); m.scale.y = .45; hills.add(m) }); g.add(hills);
    // ----- أرضية الباحة (خرسانة بفواصل)
    const fc = document.createElement('canvas'); fc.width = fc.height = 512; const fx = fc.getContext('2d'); fx.fillStyle = '#9a9387'; fx.fillRect(0, 0, 512, 512); const fr2 = rand(3);
    for (let i = 0; i < 2600; i++) { fx.fillStyle = fr2() > .5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.07)'; fx.fillRect(fr2() * 512, fr2() * 512, 1 + fr2() * 3, 1 + fr2() * 3) }
    fx.strokeStyle = 'rgba(40,36,30,.55)'; fx.lineWidth = 4; fx.strokeRect(0, 0, 512, 512); fx.beginPath(); fx.moveTo(256, 0); fx.lineTo(256, 512); fx.moveTo(0, 256); fx.lineTo(512, 256); fx.stroke();
    const ft = new THREE.CanvasTexture(fc); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(8, 8); ft.anisotropy = 8; ft.encoding = THREE.sRGBEncoding;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ map: ft, roughness: .9 })); floor.rotation.x = -PI / 2; g.add(floor);
    // ----- الأسرّة
    const BL = 6, BW = 3, BH = .62, bed = makeBed(BL, BW, BH); bed.position.set(0, 0, -.9); g.add(bed);
    const bed2 = makeBed(BL, BW, BH); bed2.position.set(0, 0, -5.2); g.add(bed2);
    const shB = blobShadow(4.4, .5); shB.scale.set(1.4, 1, .8); shB.position.set(0, .01, -.9); g.add(shB); const shB2 = shB.clone(); shB2.position.z = -5.2; g.add(shB2);
    // شبكة تظليل فوق السرير التاني
    [-1, 1].forEach(sx => [-1, 1].forEach(sz => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 2.4, 8), MT('#6a4a2c', .8)); p.position.set(sx * 3.2, 1.2, -5.2 + sz * 1.7); g.add(p) }));
    const sn = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 3.6), new THREE.MeshStandardMaterial({ map: meshTex([30, 16]), color: lin('#2f5a3a'), transparent: true, alphaTest: .2, side: THREE.DoubleSide, roughness: 1 })); sn.rotation.x = -PI / 2; sn.position.set(0, 2.4, -5.2); g.add(sn);
    // ----- حبوب
    const BP = new THREE.Vector3(0, 0, 3.0), basket = makeBasket(); basket.position.copy(BP); g.add(basket);
    const sh = blobShadow(1.1, .5); sh.position.set(BP.x, .005, BP.z); g.add(sh);
    const chM = cherryMesh(NC), bnM = beanMesh(NB, { rough: .55 }), slots = BASKET_SLOTS(NC, 9); g.add(chM, bnM);
    const red = lin('#b3141c'), cc = new THREE.Color(); for (let i = 0; i < NC; i++) chM.setColorAt(i, cc.copy(red).multiplyScalar(.55 + r() * .3));
    const gz = [[0, '#7f9a52'], [.5, '#97a864'], [1, '#b2b27a']], cols = 48, rows = Math.ceil(NB / cols), bedPos = [];
    for (let i = 0; i < NB; i++) { const cx = i % cols, cy = Math.floor(i / cols); bedPos.push([(cx / (cols - 1) - .5) * (BL - .35) + (r() - .5) * .08, BH + .045, -.9 + (cy / (rows - 1) - .5) * (BW - .35) + (r() - .5) * .08, r() * 6]) }
    const orderB = Array.from({ length: NB }, () => r());
    const NB2 = LOW ? 500 : 900, bn2 = beanMesh(NB2, { rough: .55 }); g.add(bn2);
    for (let i = 0; i < NB2; i++) { const cx = i % 40, cy = Math.floor(i / 40); put(bn2, i, (cx / 39 - .5) * (BL - .4) + (r() - .5) * .08, BH + .045, -5.2 + (cy / (Math.ceil(NB2 / 40) - 1) - .5) * (BW - .4) + (r() - .5) * .08, .068, .068, .068, r() * 6, r() * 6, r() * 3); bn2.setColorAt(i, cc.copy(ramp([[0, '#5f4a2a'], [1, '#8a6a3a']], r())).multiplyScalar(.8 + r() * .3)) }
    bn2.instanceMatrix.needsUpdate = true; bn2.instanceColor.needsUpdate = true;
    // ----- أدوات وإكسسوار
    const rk = rakeProp(); rk.position.set(-4.2, .75, -5.2); rk.rotation.set(0, 0, 1.2); rk.rotation.y = .3; g.add(rk);
    const rk2 = rakeProp(); rk2.position.set(3.6, 0, -2.6); rk2.rotation.set(-.18, .5, 0); rk2.position.y = .0; g.add(rk2);
    [[-4.3, 1.2, 1.1, 'أخضر · ٦٠ كجم'], [-3.6, 1.6, .95, 'أخضر · ٦٠ كجم'], [4.6, .6, 1.05, 'أخضر · ٦٠ كجم'], [-4.8, -1.8, 1.0, 'أخضر · ٦٠ كجم']].forEach(a => { const s = sackMesh(a[3]); s.scale.setScalar(a[2]); s.position.set(a[0], 0, a[1]); s.rotation.y = a[0]; g.add(s) });
    const tbl = new THREE.Group(); box(tbl, 1.3, .06, .7, 0, .72, 0, woodMat()); [[-.6, -.3], [.6, -.3], [-.6, .3], [.6, .3]].forEach(a => box(tbl, .06, .7, .06, a[0], .36, a[1], woodMat())); tbl.position.set(4.9, 0, -1.6); tbl.rotation.y = -.5; g.add(tbl);
    const meter = new THREE.Group(); box(meter, .2, .32, .09, 0, 0, 0, MT('#e8e0cc', .5)); const scr = new THREE.Mesh(new THREE.PlaneGeometry(.15, .08), new THREE.MeshBasicMaterial({ map: dialTex('11.2%') })); scr.position.set(0, .07, .047); meter.add(scr); box(meter, .1, .05, .02, 0, -.06, .05, MT('#c8503a', .5)); meter.position.set(4.7, .93, -1.6); meter.rotation.set(-.35, -.5, 0); g.add(meter);
    const ts = new THREE.Group(); box(ts, .8, .06, .7, 0, .3, 0, MT('#33363a', .4, .5)); box(ts, .7, .03, .6, 0, .35, 0, MT('#b9bec4', .3, .9)); const dial = new THREE.Mesh(new THREE.PlaneGeometry(.3, .15), new THREE.MeshBasicMaterial({ map: dialTex('٦٠٫٠', '#14110f', '#ffd48a') })); dial.position.set(0, .3, .36); ts.add(dial); ts.position.set(5.2, 0, -.2); g.add(ts);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.4, 8), MT('#6a4a2c', .8)); pole.position.set(-3.7, .7, 1.9); g.add(pole); box(g, .26, .34, .06, -3.7, 1.35, 1.9, MT('#efe9da', .6)); const th = new THREE.Mesh(new THREE.PlaneGeometry(.2, .1), new THREE.MeshBasicMaterial({ map: dialTex('٣٢°', '#efe9da', '#a8301c') })); th.position.set(-3.7, 1.38, 1.935); g.add(th);
    // ----- عمّال
    const W = [Person({ shirt: '#6d3b8a', hat: 'wrap', hatC: '#c8b27a', seed: 5 }), Person({ shirt: '#2f6f8f', hat: 'straw', seed: 3, beard: true, vest: '#3a2a1a' }), Person({ shirt: '#a8472f', hat: 'scarf', hatC: '#7a3a5a', skirt: true, pants: '#3a2a2a', seed: 7 }), Person({ shirt: '#e8eef0', hat: 'cap', hatC: '#efe9da', seed: 12, glasses: true, coat: true })];
    W.forEach(w => { w.g.scale.setScalar(1.05); g.add(w.g) }); W[1].g.rotation.y = 0; W[3].g.position.set(4.3, 0, -.8); W[3].g.rotation.y = -1.9;
    const rays = [-3, 0, 3].map((x, i) => { const c = document.createElement('canvas'); c.width = 64; c.height = 256; const q = c.getContext('2d'), gr = q.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(255,230,170,.5)'); gr.addColorStop(1, 'rgba(255,220,150,0)'); q.fillStyle = gr; q.fillRect(0, 0, 64, 256); const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 11), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.position.set(x * 1.4, 4.6, -2 + i); m.rotation.z = .5; g.add(m); return m });
    const dust = puffs(36, { color: '#ffe2b0', additive: true }); g.add(dust);
    const cam = { p: new THREE.Vector3(), l: new THREE.Vector3() }; let lastC = -1; const hp = new THREE.Vector3();
    return {
      id: 'process', g, fog: null, bg: '#7ab0d8',
      light: { hemi: ['#fff0d8', '#6a5a46', .85], key: ['#ffe2b0', 2.2, [3, 8, 5]], rim: ['#ffc080', .6, [-5, 3, -4]], exp: 1.12 },
      update(p, t) {
        const sp = sm(rng(.26, .46, p)), cs = sm(rng(.24, .38, p));
        for (let i = 0; i < NC; i++) { const s = slots[i], sc = .068 * (1 - cs) * (1 + Math.sin(t * 9 + i) * .03 * cs); put(chM, i, BP.x + s[0], BP.y + s[1] + .03, BP.z + s[2], Math.max(.0001, sc), Math.max(.0001, sc * 1.03), Math.max(.0001, sc), i, i * 2, 0) } chM.instanceMatrix.needsUpdate = true;
        const dry = sm(rng(.62, 1, p));
        for (let i = 0; i < NB; i++) {
          const ci = i % NC, s = slots[ci], f0 = .46 + orderB[i] * .3, q = sm(rng(f0, f0 + .16, p)), e = bedPos[i], sc = .07 * sp;
          put(bnM, i, mx(BP.x + s[0], e[0], q), mx(BP.y + s[1] + .03, e[1], q) + Math.sin(q * PI) * 1.1, mx(BP.z + s[2], e[2], q), Math.max(.0001, sc), Math.max(.0001, sc), Math.max(.0001, sc), q * 5 + i, e[3] + q * 4, i * .3);
        } bnM.instanceMatrix.needsUpdate = true;
        const dq = Math.round(dry * 40); if (dq !== lastC) { lastC = dq; for (let i = 0; i < NB; i++) bnM.setColorAt(i, cc.copy(ramp(gz, dry * .9 + orderB[i] * .15)).multiplyScalar(.86 + orderB[(i * 7) % NB] * .25)); bnM.instanceColor.needsUpdate = true }
        basket.position.x = mx(0, -4.6, sm(rng(.82, .98, p))); sh.position.x = basket.position.x;
        // عمّال بيقلّبوا الحبوب
        const wk = sm(rng(.4, .5, p)), cyc = t * .45;
        W[0].g.visible = W[1].g.visible = p > .38; W[2].g.visible = true; W[3].g.visible = true;
        const sw = Math.sin(cyc * Math.PI * 2) * 1.2;
        W[0].g.position.set(sw, 0, .66 + .5); W[0].g.rotation.y = PI; W[0].act('rake', cyc * 1 + .0, t, {});
        W[1].g.position.set(-sw * .8, 0, -.9 - 1.5 - .5); W[1].g.rotation.y = 0; W[1].act('rake', cyc + .5, t, {});
        const a = t * .35; W[2].g.position.set(-3 + Math.cos(a) * 1.2, 0, 1.8 + Math.sin(a) * .8); W[2].g.rotation.y = a + PI / 2 + PI; W[2].act('carry', t * 5, t, { amp: 1, tool: 'sack' });
        W[3].act('lab', 0, t, {}); W[3].g.rotation.y = -1.9;
        rays.forEach((m, i) => m.material.opacity = .6 + Math.sin(t * .6 + i) * .25);
        for (let i = 0; i < 36; i++) { const q = (t * .08 + i / 36) % 1; setPuff(dust, i, Math.sin(i * 4.1) * 5, .6 + q * 4.5, Math.cos(i * 2.7) * 3 - 1, .09 + Math.sin(i) * .03, Math.sin(q * PI) * .55) } flushPuffs(dust);
        const a1 = sm(rng(0, .45, p)), b1 = sm(rng(.5, .78, p));
        const P = [mx(mx(.8, .5, a1), 3.6, b1), mx(mx(2.2, 2.2, a1), 3.6, b1), mx(mx(5.6, 5.4, a1), 6.8, b1)], L = [0, mx(.5, .5, b1), mx(mx(2.2, 1.0, a1), -1.4, b1)];
        cam.p.set(P[0], P[1], P[2]); cam.l.set(L[0], L[1], L[2]); return cam;
      }
    };
  };
})();

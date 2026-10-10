/* ============================================================
   people.js — شخصيات بشرية ثلاثية الأبعاد بمفاصل (IK للأيدي) وحركات إجرائية
   Person(opts) -> { g, act(mode, a, t, o), tools, ... }
   الوحدات داخلية بالمتر (طول الشخص ≈ ١٫٧٨) ثم بتتصغّر لتناسب مقياس المشاهد.
   ============================================================ */
(() => {
  const PI = Math.PI, TAU = PI * 2, V = THREE.Vector3;
  window.M = window.M || ((c, r = .8, m = 0) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: m }));
  const cache = {};
  const M = (c, r = .85, m = 0, e = .5) => new THREE.MeshStandardMaterial({ color: lin(c), roughness: r, metalness: m, envMapIntensity: e });
  const fabTex = (c, seed) => { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d'), r = rand(seed + 3); x.fillStyle = c; x.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 128; i += 2) { x.fillStyle = i % 4 ? 'rgba(255,255,255,.045)' : 'rgba(0,0,0,.06)'; x.fillRect(i, 0, 1, 128); x.fillStyle = i % 4 ? 'rgba(0,0,0,.035)' : 'rgba(255,255,255,.04)'; x.fillRect(0, i, 128, 1) }
    for (let i = 0; i < 500; i++) { x.fillStyle = r() > .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'; x.fillRect(r() * 128, r() * 128, 1 + r() * 2, 1) }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t };
  const fab = (c, seed, rep = 3) => { const k = c + '|' + seed; if (!cache[k]) { const m = M('#ffffff', .93); m.map = fabTex(c, seed); m.map.repeat.set(rep, rep); cache[k] = m } return cache[k] };
  const strawMat = () => {
    if (cache.straw) return cache.straw;
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#d9b869'; x.fillRect(0, 0, 128, 128);
    for (let i = -128; i < 256; i += 6) { x.strokeStyle = i % 12 ? 'rgba(120,80,20,.38)' : 'rgba(255,238,175,.4)'; x.lineWidth = 2; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 128, 128); x.stroke(); x.beginPath(); x.moveTo(i + 128, 0); x.lineTo(i, 128); x.stroke() }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 3); t.anisotropy = 4;
    const m = M('#ffffff', .92); m.map = t; m.side = THREE.DoubleSide; return cache.straw = m;
  };
  const SKIN = ['#c68a5a', '#a8704a', '#8d5a3a', '#d9a577', '#6e4630', '#b97c52'];
  const ez = t => t * t * (3 - 2 * t), fr = x => x - Math.floor(x), cl2 = (v, a, b) => Math.min(b, Math.max(a, v));
  const _ = { S: new V(), v: new V(), u: new V(), w: new V(), p: new V(), b: new V(), X: new V(), Y: new V(), Z: new V(), m: new THREE.Matrix4(), q: new THREE.Quaternion(), q2: new THREE.Quaternion(), UP: new V(0, 1, 0) };

  function Person(o = {}) {
    o = Object.assign({ shirt: '#b4452f', pants: '#3b4a5a', vest: null, skin: null, hat: 'straw', hatC: '#e3c27a', coat: false, beard: false, hair: '#1b130e', boots: '#2f2118', seed: 1, skirt: false, height: 1, sleeves: 'short', apron: null, glasses: false }, o);
    const R = rand(o.seed * 97 + 3), skinC = o.skin || SKIN[Math.floor(R() * SKIN.length)];
    const sk = M(skinC, .6, 0, .35), cloth = fab(o.coat ? '#eef2f4' : o.shirt, o.seed), trs = fab(o.pants, o.seed + 5), dark = M('#1a1008', .5), hairM = M(o.hair, .7);
    const g = new THREE.Group(), body = new THREE.Group(); body.scale.setScalar(.72 * o.height); g.add(body);
    const add = (geo, mat, parent, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m };
    const sph = (r, ws = 14, hs = 10) => new THREE.SphereGeometry(r, ws, hs);
    const lim = (r1, r2, L, seg = 10) => new THREE.CylinderGeometry(r1, r2, L, seg).translate(0, -L / 2, 0);
    const pel = new THREE.Group(); pel.position.y = .95; body.add(pel);
    add(sph(.17, 16, 12), trs, pel).scale.set(1.05, .7, .72);
    const spine = new THREE.Group(); pel.add(spine);
    add(new THREE.CylinderGeometry(.19, .16, .34, 18).translate(0, .17, 0), cloth, spine).scale.z = .66;
    const chest = new THREE.Group(); chest.position.y = .3; spine.add(chest);
    add(sph(.215, 20, 14), cloth, chest, 0, .1, 0).scale.set(1, .85, .66);
    const belt = add(new THREE.TorusGeometry(.175, .016, 6, 24), M('#2a1d12', .6), spine, 0, .03, 0); belt.rotation.x = PI / 2; belt.scale.set(1, .68, 1);
    add(new THREE.BoxGeometry(.04, .035, .01), M('#c9a24a', .3, .9), spine, 0, .03, .125);
    if (o.vest) { const vm = fab(o.vest, o.seed + 9); vm.side = THREE.DoubleSide; const v = add(new THREE.CylinderGeometry(.228, .205, .46, 22, 1, true, PI * .22, PI * 1.56), vm, spine, 0, .22, 0); v.scale.z = .7 }
    if (o.coat) { const cm = cloth.clone(); cm.side = THREE.DoubleSide; add(new THREE.CylinderGeometry(.2, .27, .66, 22, 1, true), cm, pel, 0, -.3, 0).scale.z = .74 }
    if (o.apron) { const am = fab(o.apron, o.seed + 11); const a = add(new THREE.BoxGeometry(.3, .5, .014), am, spine, 0, .15, .125); a.scale.set(1, 1, 1); a.rotation.x = .04 }
    if (o.skirt) { const sm2 = trs.clone(); sm2.side = THREE.DoubleSide; add(new THREE.CylinderGeometry(.19, .32, .8, 24, 1, true), sm2, pel, 0, -.4, 0).scale.z = .85 }
    /* رقبة ورأس */
    const neck = new THREE.Group(); neck.position.y = .27; chest.add(neck);
    add(new THREE.CylinderGeometry(.05, .058, .12, 12).translate(0, .04, 0), sk, neck);
    const head = new THREE.Group(); head.position.y = .1; neck.add(head);
    add(sph(.1, 22, 16), sk, head, 0, .08, 0).scale.set(.92, 1.12, 1);
    add(sph(.078, 16, 12), sk, head, 0, .015, .018).scale.set(1, .85, .95);
    const eyes = [-1, 1].map(s => {
      const e = new THREE.Group(); e.position.set(s * .036, .088, .084); head.add(e);
      add(sph(.017, 10, 8), M('#f2eee6', .35), e).scale.set(1, .85, .7);
      add(sph(.0095, 8, 6), dark, e, 0, 0, .0105);
      const br = add(new THREE.BoxGeometry(.044, .009, .012), hairM, head, s * .036, .118, .088); br.rotation.z = -s * .12; return e;
    });
    add(sph(.021, 10, 8), sk, head, 0, .045, .102).scale.set(.85, 1.25, 1.15);
    add(new THREE.BoxGeometry(.05, .006, .01), M('#6a2f26', .6), head, 0, .006, .095);
    [-1, 1].forEach(s => add(sph(.02, 8, 6), sk, head, s * .093, .07, -.004).scale.set(.45, 1, .7));
    if (o.glasses) { [-1, 1].forEach(s => { const r = add(new THREE.TorusGeometry(.024, .003, 6, 16), M('#222', .3, .6), head, s * .036, .088, .098) }); add(new THREE.BoxGeometry(.03, .004, .004), M('#222', .3, .6), head, 0, .092, .1) }
    if (o.beard) { add(sph(.082, 16, 12), hairM, head, 0, .008, .02).scale.set(1, .78, .9); add(new THREE.BoxGeometry(.05, .006, .01), M('#6a2f26', .6), head, 0, .006, .104); add(sph(.02, 8, 6), hairM, head, 0, .032, .099).scale.set(2.4, .55, .8) }
    else if (R() > .5 && !o.skirt) add(sph(.02, 8, 6), hairM, head, 0, .03, .098).scale.set(2.3, .55, .8);
    /* غطا الراس */
    const hat = o.hat; const hairC = add(new THREE.SphereGeometry(.104, 18, 12, 0, TAU, 0, PI * .4), hairM, head, 0, .082, -.008); hairC.scale.set(.93, 1.14, 1.04);
    if (hat === 'straw') {
      const sm3 = strawMat();
      const brim = add(new THREE.LatheGeometry([[.085, .0], [.19, -.012], [.29, .004], [.33, .03], [.315, .034], [.2, .02], [.09, .02]].map(a => new THREE.Vector2(a[0], a[1])), 36), sm3, head, 0, .135, 0); brim.rotation.x = -.06;
      const crown = add(new THREE.LatheGeometry([[0, .13], [.05, .128], [.088, .112], [.1, .06], [.102, 0]].map(a => new THREE.Vector2(a[0], a[1])), 28), sm3, head, 0, .135, 0); crown.rotation.x = -.06;
      const bd = add(new THREE.TorusGeometry(.1, .01, 6, 28), M(o.hatBand || '#8a3b24', .8), head, 0, .15, 0); bd.rotation.x = PI / 2 - .06;
    } else if (hat === 'cap') {
      const c = add(new THREE.SphereGeometry(.108, 18, 10, 0, TAU, 0, PI * .5), M(o.hatC === '#e3c27a' ? '#efe9da' : o.hatC, .85), head, 0, .115, -.002); c.scale.set(.95, 1, 1.05);
      const v = add(new THREE.BoxGeometry(.13, .008, .08), M(o.hatC === '#e3c27a' ? '#efe9da' : o.hatC, .85), head, 0, .124, .115); v.rotation.x = .14;
    } else if (hat === 'wrap') {
      const wm = fab(o.hatC, o.seed + 13);
      for (let i = 0; i < 3; i++) { const t = add(new THREE.TorusGeometry(.097 + i * .004, .026, 8, 26), wm, head, 0, .13 + i * .028, -.004); t.rotation.x = PI / 2 + (i - 1) * .12 }
      add(sph(.1, 14, 10), wm, head, 0, .17, -.004).scale.set(.95, .7, 1);
    } else if (hat === 'scarf') {
      const wm = fab(o.hatC, o.seed + 14); wm.side = THREE.DoubleSide;
      const sc = add(new THREE.SphereGeometry(.118, 22, 16, PI / 2 + .75, TAU - 1.5, 0, PI * .72), wm, head, 0, .075, -.006); sc.scale.set(.98, 1.16, 1.05);
      const dr = add(new THREE.CylinderGeometry(.115, .2, .3, 20, 1, true, PI + .6, TAU - 1.2), wm, head, 0, -.1, -.03); dr.scale.z = .85;
    } else if (hat === 'hairnet') {
      const c = add(new THREE.SphereGeometry(.108, 18, 10, 0, TAU, 0, PI * .5), M('#f4f6f8', .8), head, 0, .115, -.002); c.scale.set(.95, 1, 1.05);
    } else if (hat === 'hard') {
      const c = add(new THREE.SphereGeometry(.112, 18, 10, 0, TAU, 0, PI * .5), M(o.hatC, .5), head, 0, .115, 0); c.scale.set(.95, 1, 1.08);
      const rim = add(new THREE.CylinderGeometry(.118, .12, .01, 20), M(o.hatC, .5), head, 0, .118, .005); rim.scale.z = 1.1;
    }
    /* أدرع (IK) */
    const mkArm = s => {
      const sh = new THREE.Group(); sh.position.set(s * .215, .17, 0); chest.add(sh);
      add(sph(.058, 12, 10), cloth, sh);
      add(lim(.052, .043, .3), cloth, sh);
      const el = new THREE.Group(); el.position.y = -.3; sh.add(el);
      add(sph(.044, 10, 8), o.sleeves === 'long' || o.coat ? cloth : sk, el);
      add(lim(.04, .031, .27), o.sleeves === 'long' || o.coat ? cloth : sk, el);
      if (o.sleeves !== 'long' && !o.coat) { const cf = add(new THREE.TorusGeometry(.049, .012, 6, 14), cloth, el, 0, -.02, 0); cf.rotation.x = PI / 2 }
      const hand = new THREE.Group(); hand.position.y = -.27; el.add(hand);
      add(new THREE.BoxGeometry(.074, .08, .032), sk, hand, 0, -.04, 0);
      const fg = new THREE.Group(); fg.position.y = -.08; fg.rotation.x = -.45; hand.add(fg); add(new THREE.BoxGeometry(.07, .07, .026), sk, fg, 0, -.035, 0);
      const th = add(new THREE.BoxGeometry(.022, .05, .022), sk, hand, -s * .04, -.045, .02); th.rotation.set(-.4, 0, -s * .5);
      return { sh, el, hand, s };
    };
    const A = { L: mkArm(-1), R: mkArm(1) };
    /* أرجل */
    const mkLeg = s => {
      const hp = new THREE.Group(); hp.position.set(s * .095, 0, 0); pel.add(hp);
      add(lim(.085, .062, .44), trs, hp); const kn = new THREE.Group(); kn.position.y = -.44; hp.add(kn);
      add(sph(.063, 10, 8), trs, kn); add(lim(.058, .044, .42), trs, kn);
      const ft = new THREE.Group(); ft.position.y = -.42; kn.add(ft);
      add(new THREE.CylinderGeometry(.052, .05, .13, 10).translate(0, .03, 0), M(o.boots, .6), ft);
      add(new THREE.BoxGeometry(.09, .06, .24), M(o.boots, .6), ft, 0, -.06, .06);
      add(sph(.046, 8, 6), M(o.boots, .6), ft, 0, -.05, .17).scale.set(1, .8, 1);
      add(new THREE.BoxGeometry(.095, .02, .26), M('#151010', .9), ft, 0, -.09, .06);
      return { hp, kn, ft };
    };
    const Lg = { L: mkLeg(-1), R: mkLeg(1) };

    /* ---------------- أدوات ---------------- */
    const T = {}, wood = M('#8a6238', .75), steel = M('#9aa0a6', .35, .85, 1);
    const hoe = new THREE.Group(); add(new THREE.CylinderGeometry(.017, .017, 1.35, 8).translate(0, .675, 0), wood, hoe);
    add(new THREE.BoxGeometry(.025, .12, .02), steel, hoe, 0, 1.38, .02).rotation.x = -.5;
    const blade = add(new THREE.BoxGeometry(.17, .012, .15), steel, hoe, 0, 1.43, .07); blade.rotation.x = .25; T.hoe = hoe;
    const rake = new THREE.Group(); add(new THREE.CylinderGeometry(.016, .016, 1.5, 8).translate(0, .75, 0), wood, rake);
    add(new THREE.BoxGeometry(.4, .025, .035), wood, rake, 0, 1.5, 0);
    for (let i = 0; i < 9; i++) { const t = add(new THREE.BoxGeometry(.014, .014, .1), wood, rake, -.18 + i * .045, 1.5, .065); t.rotation.x = .1 } T.rake = rake;
    const can = new THREE.Group(); const cmat = M('#4f8a5b', .45, .5, 1);
    add(new THREE.CylinderGeometry(.085, .09, .17, 16), cmat, can); add(new THREE.TorusGeometry(.085, .007, 6, 18), cmat, can, 0, .085, 0).rotation.x = PI / 2;
    const sp = add(new THREE.CylinderGeometry(.012, .02, .3, 8).translate(0, .15, 0), cmat, can, 0, -.02, .09); sp.rotation.x = 1.0;
    add(new THREE.ConeGeometry(.045, .05, 14), cmat, can, 0, .15, .36).rotation.x = 1.0 + PI;
    const ch = add(new THREE.TorusGeometry(.07, .008, 6, 14, PI), cmat, can, 0, .04, -.075); ch.rotation.y = PI / 2; T.can = can;
    const seed = new THREE.Group(); add(sph(.035, 8, 6), M('#4a2f1a', 1), seed, 0, 0, 0).scale.y = .8; add(new THREE.CylinderGeometry(.004, .005, .11, 5), M('#5a8a3a', .8), seed, 0, .08, 0);
    [-1, 1].forEach(s => { const l = add(sph(.03, 8, 6), M('#2f7a3a', .5), seed, s * .03, .13, 0); l.scale.set(1, .35, .6); l.rotation.z = s * .4 }); T.seed = seed;
    const mug = new THREE.Group(); add(new THREE.CylinderGeometry(.04, .035, .09, 14), M('#f3eee4', .25), mug); add(new THREE.CylinderGeometry(.036, .036, .004, 14), M('#4a2614', .1), mug, 0, .043, 0); add(new THREE.TorusGeometry(.025, .007, 6, 12, PI * 1.2), M('#f3eee4', .25), mug, .045, 0, 0).rotation.z = -PI * .6; T.mug = mug;
    const pad = new THREE.Group(); add(new THREE.BoxGeometry(.2, .014, .27), M('#222a30', .4, .3), pad); add(new THREE.BoxGeometry(.18, .002, .24), new THREE.MeshBasicMaterial({ color: 0x6fa8ff }), pad, 0, .008, 0); T.pad = pad;
    const bask = makeBasket(); bask.scale.setScalar(.34); T.basket = bask;
    const sack = new THREE.Group(); add(new THREE.CylinderGeometry(.14, .17, .34, 12), new THREE.MeshStandardMaterial({ map: noiseTex(64, 64, '#b79b6b', 300, 5, true), roughness: 1 }), sack); T.sack = sack;
    Object.keys(T).forEach(k => { T[k].visible = false; chest.add(T[k]) });

    /* ---------------- حالة وحركة ---------------- */
    const S = { lean: 0, twist: 0, tilt: 0, nod: 0, yaw: 0, hl: 0, hr: 0, kl: .04, kr: .04, sit: 0, hlx: 0, hrx: 0, hL: new V(-.235, .1, .03), hR: new V(.235, .1, .03), tilt2: 0 };
    const G = { lean: 0, twist: 0, tilt: 0, nod: 0, yaw: 0, hl: 0, hr: 0, kl: .04, kr: .04, sit: 0, hlx: 0, hrx: 0, hL: new V(-.235, .1, .03), hR: new V(.235, .1, .03), tilt2: 0, tool: null, toolMode: '', pitch: 0, toolA: 0 };
    let lastT = 0, bob = 0, blinkT = 3 + R() * 3, handOn = { L: 1, R: 1 };
    const P = { g, body, pel, spine, chest, neck, head, A, Lg, T, S, o, tool: null, mode: 'idle', ws: () => .72 * o.height * g.scale.x };

    const legH = (h, k) => .44 * Math.cos(h) + .42 * Math.cos(h - k) + .09;
    function ik(arm, tg) {
      const l1 = .3, l2 = .27, sh = arm.sh, el = arm.el, s = arm.s;
      _.S.copy(sh.position); _.v.subVectors(tg, _.S); const d = _.v.length(), dd = cl2(d, .1, l1 + l2 - .003); _.v.normalize();
      const A1 = Math.acos(cl2((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1)), E = Math.acos(cl2((l1 * l1 + l2 * l2 - dd * dd) / (2 * l1 * l2), -1, 1)), f = PI - E;
      _.p.set(s * .22, -1, -.75); _.p.addScaledVector(_.v, -_.p.dot(_.v)); if (_.p.lengthSq() < 1e-6) _.p.set(s * 1, 0, 0); _.p.normalize();
      _.u.copy(_.v).multiplyScalar(Math.cos(A1)).addScaledVector(_.p, Math.sin(A1));
      _.w.copy(_.S).addScaledVector(_.v, dd).addScaledVector(_.u, -l1); const wl = _.w.length() || 1; _.w.multiplyScalar(1 / wl);
      _.b.copy(_.w).addScaledVector(_.u, -_.w.dot(_.u)); if (_.b.lengthSq() < 1e-6) _.b.copy(_.p); _.b.normalize();
      _.Y.copy(_.u).negate(); _.Z.copy(_.b); _.X.crossVectors(_.Y, _.Z).normalize();
      _.m.makeBasis(_.X, _.Y, _.Z); sh.quaternion.setFromRotationMatrix(_.m); el.rotation.set(-f, 0, 0);
    }
    // نقطة من إطار الحوض → إطار الصدر
    const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _c = new V();
    function pelToChest(vv, out) {
      _e.set(spine.rotation.x, 0, 0); _q.setFromEuler(_e); _c.set(0, .3, 0).applyQuaternion(_q);
      _e.set(0, chest.rotation.y, chest.rotation.z); const q2 = new THREE.Quaternion().setFromEuler(_e); _q.multiply(q2);
      return out.copy(vv).sub(_c).applyQuaternion(_q.invert());
    }
    const hl = new V(), hr = new V(), tmp = new V();

    /* ------- أوضاع الحركة (الأهداف بإطار الحوض) ------- */
    const modes = {
      idle(a, t) { G.lean = .03; G.yaw = Math.sin(t * .4) * .3; G.nod = Math.sin(t * .3) * .04; G.hL.set(-.25, -.04 + Math.sin(t * 1.6) * .006, .03); G.hR.set(.25, -.04 + Math.sin(t * 1.6 + 1) * .006, .03) },
      walk(a, t, op = {}) {
        const amp = op.amp == null ? 1 : op.amp, s = Math.sin(a), c = Math.cos(a);
        G.hl = .55 * s * amp; G.hr = -.55 * s * amp; G.kl = .1 + amp * .95 * Math.max(0, c); G.kr = .1 + amp * .95 * Math.max(0, -c);
        G.lean = .06 * amp; G.twist = s * .12 * amp; G.yaw = -s * .1 * amp;
        G.hR.set(.25, -.03 + .05 * Math.abs(s) * amp, .03 + .26 * s * amp); G.hL.set(-.25, -.03 + .05 * Math.abs(s) * amp, .03 - .26 * s * amp);
        if (op.carry) { G.hL.set(-.12, .35, .42); G.hR.set(.12, .35, .42); G.lean = .02 }
      },
      dig(c, t) {
        const u = fr(c), up = u < .55, e = up ? ez(u / .55) : 1 - (1 - ez((u - .55) / .45)) * 0 , strike = up ? 0 : Math.pow((u - .55) / .45, 1.7);
        const k = up ? ez(u / .55) : 1 - strike; // 0 = ضربة , 1 = مرفوعة
        G.lean = .5 - .25 * k; G.hl = .32; G.hr = -.18; G.kl = .45; G.kr = .5; G.yaw = .05;
        G.hL.set(.0, .08 + .6 * k, .5 - .38 * k); G.hR.set(.02, -.05 + .85 * k, .62 - .22 * k);
        G.tool = 'hoe'; G.toolMode = 'two';
      },
      plant(a, t, op = {}) {
        const k = ez(cl2(a, 0, 1)), gz = op.gz == null ? .5 : op.gz;
        G.hl = .35 + .95 * k; G.hr = .1 + .85 * k; G.kl = .6 + 1.4 * k; G.kr = .5 + 1.3 * k; G.lean = .15 + .55 * k; G.nod = .3 * k;
        const py = legPel(G.hl, G.kl, G.hr, G.kr);
        G.hR.set(.05, -py + .1 + (1 - k) * .7, gz * (.6 + .4 * k) + .02); G.hL.set(-.2, .0 + (1 - k) * .3, .38 + .06 * k);
        G.tool = 'seed'; G.toolMode = 'hand';
      },
      water(a, t) {
        const k = ez(cl2(a, 0, 1)); G.lean = .12; G.hl = .1; G.hr = .0; G.kl = .1; G.kr = .1; G.nod = .2;
        G.hR.set(.16, .38, .5); G.hL.set(-.1, .3, .4); G.tool = 'can'; G.toolMode = 'one'; G.pitch = k * .75;
      },
      pick(c, t, op = {}) {
        const u = fr(c), up = ez(cl2(u / .35, 0, 1)) * (1 - ez(cl2((u - .5) / .25, 0, 1))), to = ez(cl2((u - .52) / .2, 0, 1)) * (1 - ez(cl2((u - .85) / .15, 0, 1)));
        G.lean = .08 + .1 * up; G.hl = .05; G.hr = -.05; G.kl = .1; G.kr = .12; G.yaw = .25 * up - .2 * to; G.nod = -.15 * up + .15 * to;
        const wx = op.x == null ? .22 : op.x;
        G.hR.set(wx * (1 - up) + wx * up + (.0) * to, .25 + .5 * up - .02 * to - .0, .35 + .25 * up - .0 * to);
        G.hR.lerp(tmp.set(.1, .15, .38), to); G.hL.set(-.2, .05, .28);
        G.tool = null;
      },
      rake(c, t, op = {}) {
        const s = Math.sin(c * TAU), s2 = Math.cos(c * TAU);
        G.lean = .32 + .05 * s; G.hl = .25 + .12 * s; G.hr = -.1 - .12 * s; G.kl = .3; G.kr = .25; G.twist = .06 * s; G.yaw = -.1;
        G.hL.set(-.02, .3, .22 + .24 * s); G.hR.set(.05, -.02, .55 + .24 * s);
        G.tool = 'rake'; G.toolMode = 'two';
      },
      carry(a, t, op = {}) {
        const amp = op.amp == null ? 1 : op.amp; modes.walk(a, t, { amp, carry: true }); G.tool = op.tool || 'basket'; G.toolMode = 'carry';
      },
      lab(a, t, op = {}) {
        const w = Math.sin(t * .8) * .5 + .5; G.lean = .1; G.nod = .2; G.yaw = Math.sin(t * .5) * .35; G.hl = .05; G.kl = .1; G.hr = -.05; G.kr = .1;
        G.hR.set(.18, .32 + .05 * w, .5 + Math.sin(t * 2.2) * .03); G.hL.set(-.2, .22, .4); G.tool = op.tool === undefined ? 'pad' : op.tool; G.toolMode = 'pad';
      },
      sit(a, t, op = {}) {
        const w = Math.sin(t * .9) * .5 + .5; G.sit = 1; G.hl = 1.5; G.hr = 1.5; G.kl = 1.56; G.kr = 1.56; G.lean = op.lean == null ? .12 : op.lean; G.nod = op.nod == null ? .18 : op.nod; G.yaw = op.yaw == null ? Math.sin(t * .35) * .3 : op.yaw;
        if (op.hands) { G.hL.copy(op.hands[0]); G.hR.copy(op.hands[1]) } else { G.hL.set(-.22, .1, .3); G.hR.set(.22, .1, .3) }
        G.tool = op.tool || null; G.toolMode = op.toolMode || 'hand';
      },
      drink(a, t, op = {}) {
        const k = ez(cl2(a, 0, 1)), sit = op.sit ? 1 : 0; if (sit) { G.sit = 1; G.hl = 1.5; G.hr = 1.5; G.kl = 1.56; G.kr = 1.56 } G.lean = .02; G.nod = -.1 * k; G.yaw = 0;
        G.hR.set(.14 - .1 * k, .45 + .17 * k, .38 + .08 * (1 - k)); G.hL.set(-.22, sit ? .05 : .15, .25); G.tool = 'mug'; G.toolMode = 'mug'; G.pitch = -k * .5;
      },
      type(a, t, op = {}) {
        G.lean = .1; G.nod = .25; G.yaw = Math.sin(t * .3) * .12; G.sit = 1; G.hl = 1.5; G.hr = 1.5; G.kl = 1.56; G.kr = 1.56;
        G.hL.set(-.12, .12 + Math.abs(Math.sin(t * 9)) * .02, .5 + Math.sin(t * 7) * .02); G.hR.set(.12, .12 + Math.abs(Math.sin(t * 8 + 1)) * .02, .5 + Math.sin(t * 6) * .02); G.tool = null;
      },
      drive(a, t, op = {}) {
        const w = Math.sin(t * .6) * .05; G.sit = 1; G.hl = 1.05; G.hr = 1.05; G.kl = 1.35; G.kr = 1.35; G.lean = -.05; G.nod = -.05; G.yaw = Math.sin(t * .3) * .12;
        G.hL.set(-.18 + w, .3, .5); G.hR.set(.18 + w, .3, .5); G.tool = null;
      },
      read(a, t, op = {}) {
        G.sit = 1; G.hl = 1.5; G.hr = 1.5; G.kl = 1.56; G.kr = 1.56; G.lean = .22; G.nod = .5; G.yaw = Math.sin(t * .4) * .05;
        const f = Math.sin(t * .7) > .85 ? 1 : 0; G.hL.set(-.1, .2, .4); G.hR.set(.12 + f * .08, .22 + f * .08, .4); G.tool = null;
      },
      manual(a, t, op) { /* Farmer.pose المتوافق */ }
    };
    const legPel = (h1, k1, h2, k2) => Math.max(legH(h1, k1), legH(h2, k2));

    P.act = function (mode, a = 0, t = 0, op = {}) {
      const dt = Math.min(.1, Math.max(0, t - lastT)) || .016; lastT = t;
      // افتراضيات
      G.lean = 0; G.twist = 0; G.tilt = 0; G.nod = 0; G.yaw = 0; G.hl = 0; G.hr = 0; G.kl = .04; G.kr = .04; G.sit = 0; G.pitch = 0; G.tool = null; G.toolMode = '';
      G.hL.set(-.25, -.03, .03); G.hR.set(.25, -.03, .03);
      (modes[mode] || modes.idle)(a, t, op); P.mode = mode;
      if (op.override) op.override(G);
      const k = 1 - Math.exp(-dt * (op.snap ? 200 : 14)), kf = 1 - Math.exp(-dt * (op.snap ? 200 : 26));
      ['lean', 'twist', 'tilt', 'nod', 'yaw', 'sit'].forEach(n => S[n] += (G[n] - S[n]) * k);
      ['hl', 'hr', 'kl', 'kr'].forEach(n => S[n] += (G[n] - S[n]) * kf);
      S.hL.lerp(G.hL, k * 1.3 > 1 ? 1 : k * 1.3); S.hR.lerp(G.hR, k * 1.3 > 1 ? 1 : k * 1.3);
      // تطبيق
      spine.rotation.x = S.lean; chest.rotation.y = S.twist; chest.rotation.z = S.tilt; neck.rotation.x = S.nod * .5; head.rotation.x = S.nod * .5; head.rotation.y = S.yaw; neck.rotation.y = 0;
      Lg.L.hp.rotation.x = -S.hl; Lg.R.hp.rotation.x = -S.hr; Lg.L.kn.rotation.x = S.kl; Lg.R.kn.rotation.x = S.kr;
      Lg.L.ft.rotation.x = S.hl - S.kl; Lg.R.ft.rotation.x = S.hr - S.kr;
      const sp = S.sit * .06; Lg.L.hp.rotation.z = Lg.R.hp.rotation.z = 0; Lg.L.hp.rotation.y = -sp * .4; Lg.R.hp.rotation.y = sp * .4;
      pel.position.y = legPel(S.hl, S.kl, S.hr, S.kr) + (mode === 'idle' ? Math.sin(t * 1.6) * .004 : 0);
      chest.scale.y = 1 + (Math.sin(t * 1.7) * .006);
      blinkT -= dt; const bl = blinkT < 0 ? (blinkT < -.12 ? (blinkT = 2.5 + Math.random() * 4, 1) : .12) : 1; eyes.forEach(e => e.scale.y = bl);
      if (mode === 'manual') { spine.rotation.x = op.bend || 0; pel.position.y = .95 - (op.bend || 0) * .1; }
      // أيدي (IK)
      pelToChest(S.hL, hl); pelToChest(S.hR, hr);
      ik(A.L, hl); ik(A.R, hr);
      // الأداة
      Object.keys(T).forEach(n => T[n].visible = false);
      const tn = G.tool; P.tool = tn;
      if (tn && T[tn]) {
        const tl = T[tn]; tl.visible = true; const tm = G.toolMode;
        if (tm === 'two') { _.v.copy(hr).sub(hl).normalize(); tl.position.copy(hl).addScaledVector(_.v, -.2); _.q.setFromUnitVectors(_.UP, _.v); tl.quaternion.copy(_.q) }
        else if (tm === 'one' || tm === 'hand' || tm === 'mug' || tm === 'pad') {
          tl.position.copy(hr); tl.position.y -= tm === 'pad' ? -.04 : 0;
          if (tn === 'can') { tl.rotation.set(G.pitch, 0, 0); tl.position.y += .02; tl.position.z += .02 }
          else if (tn === 'seed') { tl.rotation.set(0, 0, 0); tl.position.y -= .08 }
          else if (tn === 'mug') { tl.rotation.set(G.pitch, 0, 0); tl.position.y += .04 }
          else if (tn === 'pad') { tl.position.copy(hl).add(tmp.set(.06, .0, .05)); tl.rotation.set(-.5, 0, 0) }
        } else if (tm === 'carry') { tl.position.set(0, .2, .42); tl.rotation.set(0, 0, 0); if (tn === 'basket') tl.position.y = .0 }
      }
      return P;
    };
    P.look = (yaw) => { head.rotation.y = yaw };
    P.setHandsRest = () => { };
    return P;
  }

  /* توافق مع الكود القديم: Farmer(shirt, hat) + pose(bend, arm) */
  function Farmer(shirt, hatC) {
    const straw = hatC === '#e3c27a';
    const P = Person({ shirt, vest: straw ? null : null, hat: straw ? 'straw' : 'cap', hatC, seed: (shirt.charCodeAt(2) + shirt.charCodeAt(4)) % 11 + 1, beard: straw && shirt.charCodeAt(1) % 2 === 0, vest: straw ? '#4a3a2a' : null });
    const dummy = () => { const d = new THREE.Object3D(); return d };
    P.hoe = dummy(); P.can = dummy(); P.hip = P.pel; let man = { bend: 0, arm: 0 };
    const act0 = P.act;
    P.pose = (bend, arm) => { man.bend = bend; man.arm = arm; P.update(performance.now() / 1000) };
    P.update = (t, op = {}) => {
      const a = man.arm, b = man.bend; const lean = b;
      return act0('idle', 0, t, Object.assign({
        override: G => {
          G.lean = lean; const rr = .5, dir = new V(0, -Math.cos(a), -Math.sin(a));
          G.hL.set(-.21 + .02, .47 + dir.y * rr - Math.sin(lean) * 0, dir.z * rr + .0 + Math.sin(lean) * .3); G.hR.set(.21 - .02, .47 + dir.y * rr, dir.z * rr + Math.sin(lean) * .3);
        }
      }, op));
    };
    return P;
  }
  window.Person = Person; window.Farmer = Farmer;
})();

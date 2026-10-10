/* ============================================================
   stage_farm.js — المزرعة: تلال مدرّجة + شجرة بن بتكبر (بذرة → زهور → كرز أخضر → أحمر) + القطف في السلّة
   ============================================================ */
const _q = new THREE.Quaternion(), _v = new THREE.Vector3(), _s = new THREE.Vector3(), _m = new THREE.Matrix4();
function putQ(mesh, i, x, y, z, q, sx, sy = sx, sz = sx) { _v.set(x, y, z); _s.set(sx, sy, sz); _m.compose(_v, q, _s); mesh.setMatrixAt(i, _m) }

function makeBasket() {
  const g = new THREE.Group(), c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#9a6a38'; x.fillRect(0, 0, 256, 128);
  for (let j = 0; j < 8; j++) for (let i = 0; i < 16; i++) { x.fillStyle = (i + j) % 2 ? '#b07d45' : '#85582b'; x.fillRect(i * 16 + (j % 2) * 8 - 8, j * 16, 14, 14); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(i * 16 + (j % 2) * 8 - 8, j * 16 + 14, 14, 2) }
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 1);
  const prof = [[0, .02], [.36, .02], [.45, .06], [.55, .33], [.58, .4], [.54, .4], [.5, .34], [.4, .1], [0, .08]];
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof.map(a => new THREE.Vector2(a[0], a[1])), 48), new THREE.MeshStandardMaterial({ map: t, roughness: .85, side: THREE.DoubleSide, bumpMap: t, bumpScale: 1.5 }));
  g.add(body);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(.56, .028, 8, 48), new THREE.MeshStandardMaterial({ color: lin('#6e4620'), roughness: .8 })); rim.rotation.x = Math.PI / 2; rim.position.y = .4; g.add(rim);
  const hd = new THREE.Mesh(new THREE.TorusGeometry(.56, .024, 8, 40, Math.PI), new THREE.MeshStandardMaterial({ color: lin('#6e4620'), roughness: .8 })); hd.position.y = .4; g.add(hd);
  return g;
}
const BASKET_SLOTS = (n, seed = 9) => { const r = rand(seed), a = []; for (let i = 0; i < n; i++) { const rr = Math.sqrt(r()) * .4, th = r() * 6.283; a.push([Math.cos(th) * rr, .1 + (i / n) * .24 + r() * .04, Math.sin(th) * rr]) } return a };

function Plantation() {
  const g = new THREE.Group(), r = rand(5);
  // ---------- السما
  const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color('#4f98c6') }, hor: { value: new THREE.Color('#f4e6c8') }, sun: { value: new THREE.Vector3(-.55, .38, -.75).normalize() } },
    vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 top;uniform vec3 hor;uniform vec3 sun;varying vec3 vP;void main(){float h=clamp(vP.y,0.,1.);vec3 c=mix(hor,top,pow(h,.5));float s=max(dot(vP,sun),0.);c+=vec3(1.,.82,.5)*(pow(s,60.)*1.2+pow(s,8.)*.3);gl_FragColor=vec4(c,1.);}'
  }));
  g.add(sky);
  // ---------- التضاريس المدرّجة
  const SZ = 150, NS = LOW ? 100 : 150, tg = new THREE.PlaneGeometry(SZ, SZ, NS, NS); tg.rotateX(-Math.PI / 2);
  const Hh = (x, z) => {
    const d = Math.hypot(x, z), fl = sm((d - 5.5) / 12);
    const raw = Math.sin(x * .05 + 1) * Math.cos(z * .045) * 5 + Math.sin(x * .13 + z * .09) * 1.2 + Math.max(0, -z) * .2 + Math.max(0, d - 22) * .05;
    const t = raw / 1.25, f = Math.floor(t), fr = t - f;
    return { h: (f + sm((fr - .78) / .16)) * 1.25 * fl, riser: fr > .8 && fr < .95 && fl > .5 };
  };
  const tp = tg.attributes.position, tc = new Float32Array(tp.count * 3), cA = lin('#3c7a38'), cB = lin('#7aa94c'), cE = lin('#7a5c3a'), cS = lin('#5a3b22'), tmp = new THREE.Color();
  for (let i = 0; i < tp.count; i++) {
    const x = tp.getX(i), z = tp.getZ(i), o = Hh(x, z); tp.setY(i, o.h);
    const n = Math.sin(x * .7) * Math.sin(z * .6) * .5 + .5; tmp.copy(cA).lerp(cB, n * .7 + cl(o.h / 14) * .3);
    if (o.riser) tmp.lerp(cE, .6); const d = Math.hypot(x, z); if (d < 2.6) tmp.lerp(cS, 1 - sm((d - 1.2) / 1.4));
    tc[i * 3] = tmp.r; tc[i * 3 + 1] = tmp.g; tc[i * 3 + 2] = tmp.b;
  }
  tg.setAttribute('color', new THREE.BufferAttribute(tc, 3)); tg.computeVertexNormals();
  g.add(new THREE.Mesh(tg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .95, metalness: 0, envMapIntensity: .3 })));
  // ---------- صفوف شجيرات البن على المدرّجات
  const lump = (geo, amp, ys) => { const p = geo.attributes.position, col = new Float32Array(p.count * 3), rad = new THREE.Vector3(); let mn = 1e9, mxv = -1e9; for (let i = 0; i < p.count; i++) { mn = Math.min(mn, p.getY(i)); mxv = Math.max(mxv, p.getY(i)) }
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + amp * (Math.sin(x * 5.1 + y * 3.3) * Math.sin(z * 4.7 - y * 2.1) + Math.sin(x * 9 + z * 7) * .4); p.setXYZ(i, x * n, y * n * ys, z * n); const k = .5 + .5 * cl((y - mn) / (mxv - mn)); col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = k }
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals(); weldNormals(geo); return geo };
  const bg = lump(new THREE.SphereGeometry(.85, 18, 12), .16, .72);
  const maxB = LOW ? 700 : 1700, bushes = new THREE.InstancedMesh(bg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8, envMapIntensity: .4 }), maxB); bushes.frustumCulled = false;
  let nb = 0; const step = LOW ? 2.8 : 2.2;
  for (let x = -62; x < 62 && nb < maxB; x += step) for (let z = -66; z < 34 && nb < maxB; z += step * .95) {
    const px = x + (r() - .5) * .7, pz = z + (r() - .5) * .5, o = Hh(px, pz); if (o.riser || Math.hypot(px, pz) < 6.5 || r() > .88) continue;
    const s = .75 + r() * .5; put(bushes, nb, px, o.h + .3 * s, pz, s, s, s, 0, r() * 6, 0);
    bushes.setColorAt(nb, ramp([[0, '#1f5a2c'], [.5, '#2f7a35'], [1, '#4f9a3a']], r())); nb++;
  }
  bushes.count = nb; g.add(bushes);
  // أشجار ضلّ
  const trees = new THREE.InstancedMesh(lump(new THREE.SphereGeometry(1.6, 18, 12), .18, .62), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .85, envMapIntensity: .3 }), 22), trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.1, .17, 5, 6), new THREE.MeshStandardMaterial({ color: lin('#4a3320'), roughness: .9 }), 22);
  for (let i = 0; i < 22; i++) { const a = r() * 6.28, d = 18 + r() * 44, x = Math.cos(a) * d, z = Math.sin(a) * d - 10, o = Hh(x, z), s = .8 + r() * .5; put(trunks, i, x, o.h + 2.5 * s, z, s); put(trees, i, x, o.h + 5.2 * s, z, s * 1.2, s, s * 1.2, 0, r() * 6, 0); trees.setColorAt(i, ramp([[0, '#1a4a2a'], [1, '#3a7a3a']], r())) }
  g.add(trees, trunks);

  const soilT = noiseTex(256, 256, '#5a3b22', 900, 17, true); soilT.repeat.set(3, 3);
  const soil = new THREE.Mesh(new THREE.CircleGeometry(2.1, 48), new THREE.MeshStandardMaterial({ map: soilT, roughness: 1, color: lin('#8a6a48') })); soil.rotation.x = -Math.PI / 2; soil.position.y = .012; g.add(soil);
  // ---------- الشجرة البطلة
  const shrub = new THREE.Group(); g.add(shrub);
  const T = 8, MAXB = T * 2, barkMat = new THREE.MeshStandardMaterial({ color: lin('#6a4a2c'), roughness: .85 });
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.028, .05, 1, 10).translate(0, .5, 0), barkMat); shrub.add(trunk);
  const brGeo = new THREE.CylinderGeometry(.006, .014, 1, 6).translate(0, .5, 0), brM = new THREE.InstancedMesh(brGeo, barkMat, MAXB); brM.frustumCulled = false; shrub.add(brM);
  const br = [], leaves = [], cher = [];
  const X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  for (let t = 0; t < T; t++) for (let k = 0; k < 2; k++) {
    const a = t * 1.9 + k * Math.PI + (r() - .5) * .4, e = -.1 + r() * .12, L = (1.0 - t * .055 + r() * .15) * (LOW ? 1 : 1);
    const dir = new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)).normalize(), q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
    const b = { t, L, dir, q, onset: .02 + t / (T - 1) * .4 }; br.push(b); const bi = br.length - 1;
    [.28, .42, .56, .7, .84, 1].forEach((s, si) => [-1, 1].forEach(side => {
      if (s === 1 && side === 1) return; const sd = s === 1 ? 0 : side, d2 = dir.clone().applyAxisAngle(UP, sd * (.8 + r() * .4)).normalize(); d2.y -= .05 + r() * .12; d2.normalize();
      Y.copy(d2); X.crossVectors(Y, UP).normalize(); Z.crossVectors(X, Y).normalize(); _m.makeBasis(X, Y, Z); const lq = new THREE.Quaternion().setFromRotationMatrix(_m); lq.multiply(_q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), (r() - .3) * .5));
      leaves.push({ b: bi, s, q: lq.clone(), size: (.3 + r() * .1) * (s === 1 ? .8 : 1) * (1 - t * .02), col: ramp([[0, '#1f5b2e'], [.5, '#2d7a3a'], [1, '#3f8f3c']], r()) });
    }));
    [.34, .52, .7, .88].forEach(s => { const n = 1 + (r() > .45 ? 1 : 0) + (r() > .8 ? 1 : 0); for (let c = 0; c < n; c++) cher.push({ b: bi, s: s + (r() - .5) * .06, off: [(r() - .5) * .07, -.07 - r() * .05, (r() - .5) * .07], v: r(), sz: .046 + r() * .014 }) });
  }
  const NL = leaves.length + 2, NC = cher.length;
  const leafM = leafMesh(NL), cherM = cherryMesh(NC), flowM = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: lin('#fffdf5'), roughness: .5, emissive: lin('#fff6d8'), emissiveIntensity: .25 }), NC);
  flowM.frustumCulled = false; shrub.add(leafM, cherM, flowM);
  leaves.forEach((l, i) => leafM.setColorAt(i, l.col)); leafM.setColorAt(leaves.length, lin('#6fae45')); leafM.setColorAt(leaves.length + 1, lin('#6fae45')); leafM.instanceColor.needsUpdate = true;
  const cotQ = [new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.2, 0, 0)), new THREE.Quaternion().setFromEuler(new THREE.Euler(-1.2, Math.PI, 0))]; cotQ.forEach((q, i) => q.premultiply(new THREE.Quaternion().setFromAxisAngle(UP, i * Math.PI + .6)));
  // ترتيب القطف + مكان كل كرزة في السلّة
  const BP = new THREE.Vector3(.12, 0, 1.15), slots = BASKET_SLOTS(NC, 9), ord = new Float32Array(NC);
  const heightRank = cher.map((c, i) => [i, br[c.b].t + r() * 3]).sort((a, b) => b[1] - a[1]); heightRank.forEach((e, k) => ord[e[0]] = k / NC);
  const stay = cher.map(c => c.v > .86);
  const basket = makeBasket(); basket.position.copy(BP); g.add(basket);
  const cc = new THREE.Color(); let lastRipe = -1;
  const RIPE = [[0, '#6aa03a'], [.25, '#9bb73a'], [.45, '#e3c33a'], [.65, '#e8821f'], [.85, '#c4161c'], [1, '#8f0f18']];
  const hang = new THREE.Vector3(), bpv = new THREE.Vector3();
  function setShrub(S) {
    const h = mx(.2, 1.55, sm(S.grow)), tr = .55 + .45 * sm(S.grow); trunk.scale.set(tr, h, tr);
    const sbs = br.map(b => sm(rng(b.onset, b.onset + .28, S.grow)));
    br.forEach((b, i) => { const y0 = h * (.1 + .85 * b.t / (T - 1)), sb = sbs[i]; putQ(brM, i, 0, y0, 0, b.q, 1, Math.max(.0001, b.L * sb), 1) }); brM.instanceMatrix.needsUpdate = true;
    leaves.forEach((l, i) => { const b = br[l.b], sb = sbs[l.b], y0 = h * (.1 + .85 * b.t / (T - 1)), sl = sm(rng(b.onset + .06 + l.s * .1, b.onset + .36 + l.s * .1, S.grow)) * sb;
      const k = l.s * b.L * sb; putQ(leafM, i, b.dir.x * k, y0 + b.dir.y * k, b.dir.z * k, l.q, l.size * Math.max(.0001, sl)) });
    const co = 1 - sm(rng(.18, .34, S.grow)), cs = .16 + .06 * sm(S.grow), ci = leaves.length; // أوراق البذرة
    cotQ.forEach((q, j) => putQ(leafM, ci + j, 0, h, 0, q, Math.max(.0001, cs * (co * .9 + .1) * (S.grow < .3 ? 1 : 0))));
    leafM.instanceMatrix.needsUpdate = true;
    const fl = sm(rng(0, .3, S.flower)) * (1 - sm(rng(.65, 1, S.flower))), fr = sm(S.fruit);
    cher.forEach((c, i) => {
      const b = br[c.b], sb = sbs[c.b], y0 = h * (.1 + .85 * b.t / (T - 1)), k = c.s * b.L * sb, vis = sm(rng(.55, .95, sb));
      hang.set(b.dir.x * k + c.off[0], y0 + b.dir.y * k + c.off[1], b.dir.z * k + c.off[2]);
      let f = 0; if (S.fall > 0 && !stay[i]) f = sm(rng(ord[i] * .78, ord[i] * .78 + .22, S.fall));
      let px = hang.x, py = hang.y, pz = hang.z, sc = c.sz * (.25 + .75 * sm(rng(0, .85, S.fruit))) * fr * vis;
      if (f > 0) { const s2 = slots[i]; bpv.set(BP.x + s2[0], BP.y + s2[1], BP.z + s2[2]); const fy = f * f; px = mx(hang.x, bpv.x, f); pz = mx(hang.z, bpv.z, f); py = mx(hang.y, bpv.y, fy) + Math.sin(f * Math.PI) * .0; sc = c.sz * 1.08 * (fr * vis) }
      put(cherM, i, px, py, pz, sc, sc * 1.02, sc, f * 6 * (i % 3 ? 1 : -1), f * 4, 0);
      put(flowM, i, hang.x, hang.y + .04, hang.z, .03 * fl * vis, .01 * fl * vis, .03 * fl * vis, .3, i, 0);
    });
    cherM.instanceMatrix.needsUpdate = flowM.instanceMatrix.needsUpdate = true;
    const rq = Math.round(S.ripe * 50);
    if (rq !== lastRipe) { lastRipe = rq; cher.forEach((c, i) => { const rp = cl(S.ripe * 1.3 - c.v * .36); cherM.setColorAt(i, cc.copy(ramp(RIPE, rp))) }); cherM.instanceColor.needsUpdate = true }
  }
  setShrub({ grow: 0, flower: 0, fruit: 0, ripe: 0, fall: 0 });
  const cam = { p: new THREE.Vector3(), l: new THREE.Vector3() };
  return {
    id: 'plantation', g, shrub, basket, sky, setShrub,
    fog: [0xf0e2c4, 20, 130],
    light: { hemi: ['#cfe6f0', '#4a3a24', .9], key: ['#fff1d6', 1.5, [-6, 9, 6]], rim: ['#ffcf8a', .5, [5, 3, -6]], exp: 1.05 },
    farm(p, t) {
      const grow = rng(.42, .62, p), flower = rng(.56, .76, p), fruit = rng(.7, .86, p), ripe = rng(.8, .98, p); basket.visible = false;
      setShrub({ grow, flower, fruit, ripe, fall: 0 }); shrub.rotation.z = RM ? 0 : Math.sin(t * .8) * .006;
      const a = sm(rng(0, .3, p)), b = sm(rng(.3, .42, p)), c = rng(.42, 1, p), sg = sm(grow), dist = mx(.95, 3.1, sg), ang = -.5 + c * 1.3;
      const p0 = [-26, 15, 32], l0 = [0, 3, -8], p1 = [-5, 3.8, 11], l1 = [0, 1.2, 0], p2 = [Math.sin(ang) * dist, mx(.4, 1.15, sg), Math.cos(ang) * dist], l2 = [0, mx(.2, .78, sg), 0];
      const P = p0.map((v, i) => mx(mx(v, p1[i], a), p2[i], b)), L = l0.map((v, i) => mx(mx(v, l1[i], a), l2[i], b));
      cam.p.set(...P); cam.l.set(...L); return cam;
    },
    harvest(p, t) {
      basket.visible = true; setShrub({ grow: 1, flower: 1, fruit: 1, ripe: 1, fall: rng(.08, .86, p) }); shrub.rotation.z = RM ? 0 : Math.sin(t * 1.4) * .004 * (1 - rng(.86, 1, p));
      const k = sm(rng(.0, 1, p)); cam.p.set(mx(1.9, .95, k), mx(1.05, 1.35, k), mx(3.2, 2.55, k)); cam.l.set(mx(0, .12, k), mx(.85, .4, k), mx(.2, 1.05, k)); return cam;
    }
  };
}

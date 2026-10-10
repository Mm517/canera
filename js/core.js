/* ============================================================
   core.js — أدوات مشتركة + الرندر + الإضاءة + مجسّمات (حبّة البن، الكرزة، الورقة…)
   ============================================================ */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const mx = (a, b, t) => a + (b - a) * t;
const sm = t => { t = cl(t); return t * t * (3 - 2 * t) };
const rng = (a, b, t) => cl((t - a) / (b - a));          // تطبيع جزء من المدى
const RM = matchMedia('(prefers-reduced-motion:reduce)').matches;
const LOW = (navigator.hardwareConcurrency || 4) <= 4 || innerWidth < 700;
function rand(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
const lin = h => new THREE.Color(h).convertSRGBToLinear();     // لون sRGB → خطي
const ramp = (stops, t) => {                                  // تدرّج لوني [[t,'#hex'],…]
  t = cl(t); let i = 0; while (i < stops.length - 2 && t > stops[i + 1][0]) i++;
  const a = stops[i], b = stops[i + 1], k = cl((t - a[0]) / (b[0] - a[0]));
  return lin(a[1]).lerp(lin(b[1]), sm(k));
};

const GL = { ok: false };
function initGL(canvas) {
  try {
    const q0 = Math.min(devicePixelRatio, LOW ? 1 : 1.5);   // سقف الدقة: أخف بكتير من ٢ وفرق العين شبه معدوم
    const R = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: devicePixelRatio < 1.5 && !LOW, stencil: false, powerPreference: 'high-performance' });
    R.setPixelRatio(q0); GL.q0 = q0;
    R.outputEncoding = THREE.sRGBEncoding;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.1;
    const S = new THREE.Scene();
    const C = new THREE.PerspectiveCamera(36, 1, .05, 400);
    S.environment = makeEnv(R);
    const hemi = new THREE.HemisphereLight(0xdfeee8, 0x2a1d14, .6); S.add(hemi);
    const key = new THREE.DirectionalLight(0xfff0d8, 1.3); key.position.set(4, 7, 5); S.add(key);
    const rim = new THREE.DirectionalLight(0xffc88a, .8); rim.position.set(-5, 3, -4); S.add(rim);
    const warm = new THREE.PointLight(0xff8a30, 0, 14); warm.position.set(0, -1, 2); S.add(warm);
    Object.assign(GL, { ok: true, R, S, C, hemi, key, rim, warm });
  } catch (e) { console.warn('WebGL unavailable', e); GL.ok = false }
  return GL.ok;
}

/* بيئة انعكاسات "استوديو" مرسومة بالكود — بتدّي الزجاج والغطا لمعة حقيقية */
function makeEnv(R) {
  const s = new THREE.Scene(), c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#a9c9bf'); g.addColorStop(.48, '#5a786d'); g.addColorStop(.52, '#3a4b43'); g.addColorStop(1, '#1d2a24');
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
  s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide })));
  const box = (w, h, pos, i, tint = [1, .95, .85]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(i * tint[0], i * tint[1], i * tint[2]), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m)
  };
  box(20, 12, [-22, 14, 20], 7); box(5, 28, [28, 6, 12], 5); box(16, 4, [0, 32, -6], 6); box(12, 8, [0, -4, -32], 2.5, [1, .7, .45]); box(8, 20, [-30, 2, -14], 3, [.8, .9, 1]);
  const pm = new THREE.PMREMGenerator(R), rt = pm.fromScene(s, .03); pm.dispose(); return rt.texture;
}

/* ---------- حبّة بن حقيقية: بيضاوية + شقّ على شكل S + نعومة ---------- */
function beanGeometry() {
  const g = new THREE.SphereGeometry(1, 36, 26), p = g.attributes.position, n = p.count, col = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    let X = x, Y = y * .6, Z = z * .78, dark = 1;
    if (y > 0) {
      const zc = z - .13 * Math.sin(x * 3.1), f = Math.exp(-(zc * zc) / (2 * .11 * .11)), tp = Math.sqrt(Math.max(0, 1 - x * x));
      Y -= f * .26 * tp * y; dark = 1 - f * .6 * tp;
    }
    p.setXYZ(i, X, Y, Z); col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = dark;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.computeVertexNormals(); weldNormals(g); return g;
}
function weldNormals(g) {          // نخلّي الـ normals ملساء عند خط اللحام
  const p = g.attributes.position, nr = g.attributes.normal, m = new Map(), k = i => `${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
  for (let i = 0; i < p.count; i++) { const key = k(i), v = m.get(key) || [0, 0, 0]; v[0] += nr.getX(i); v[1] += nr.getY(i); v[2] += nr.getZ(i); m.set(key, v) }
  for (let i = 0; i < p.count; i++) { const v = m.get(k(i)), l = Math.hypot(...v) || 1; nr.setXYZ(i, v[0] / l, v[1] / l, v[2] / l) }
}
function noiseTex(w, h, base, spots, seed = 1, enc = false) {   // تكسشر حبيبي بسيط
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), r = rand(seed);
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < spots; i++) { const a = r(); x.fillStyle = `rgba(${a > .5 ? '255,255,255' : '0,0,0'},${.03 + r() * .09})`; x.beginPath(); x.ellipse(r() * w, r() * h, 2 + r() * 12, 1 + r() * 5, r() * 3, 0, 7); x.fill() }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (enc) t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t;
}
function granuleTex(rep = [5, 2.5]) {            // تكسشر حبيبات قهوة سريعة: شظايا دقيقة
  const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d'), r = rand(13);
  x.fillStyle = '#3a1b0d'; x.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 16000; i++) { const px = r() * 1024, py = r() * 512, s = 1.5 + r() * 4.5, a = r(); x.fillStyle = a > .93 ? '#c48a52' : a > .6 ? '#6a3a1e' : a > .3 ? '#4d2713' : '#1f0e06'; x.beginPath(); x.moveTo(px, py); x.lineTo(px + s, py + s * .3 * (r() - .3)); x.lineTo(px + s * .6, py + s); x.lineTo(px - s * .3, py + s * .5); x.fill() }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; t.repeat.set(rep[0], rep[1]); return t;
}
let _bean;
function beanMesh(n, { rough = .4 } = {}) {
  _bean = _bean || beanGeometry();
  const c0 = document.createElement('canvas'); c0.width = 128; c0.height = 64; const x0 = c0.getContext('2d'), r0 = rand(7); x0.fillStyle = '#e6e6e6'; x0.fillRect(0, 0, 128, 64);
  for (let i = 0; i < 70; i++) { x0.fillStyle = `rgba(${r0() > .5 ? '255,255,255' : '0,0,0'},${.03 + r0() * .05})`; x0.beginPath(); x0.ellipse(r0() * 128, r0() * 64, 6 + r0() * 18, 3 + r0() * 8, r0() * 3, 0, 7); x0.fill() }
  const tex = new THREE.CanvasTexture(c0); tex.encoding = THREE.sRGBEncoding;
  const m = new THREE.InstancedMesh(_bean, new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, roughness: rough, metalness: .03, vertexColors: true, envMapIntensity: 1.15 }), n);
  m.frustumCulled = false; const c = new THREE.Color(0xffffff); for (let i = 0; i < n; i++) m.setColorAt(i, c); return m;
}

/* ---------- كرزة البن ---------- */
function cherryMesh(n) {
  const g = new THREE.SphereGeometry(1, 22, 16), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const r = Math.hypot(x, z);
    if (y < -.78) { const k = (-.78 - y) / .22; y += k * k * .1 * (1 - cl(r * 2.2)); }   // نقرة الكرزة
    p.setXYZ(i, x * 1, y * 1.04, z * .96);
  }
  g.computeVertexNormals(); weldNormals(g);
  const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .42, metalness: 0, envMapIntensity: .7 }), n);
  m.frustumCulled = false; const c = new THREE.Color(0xffffff); for (let i = 0; i < n; i++) m.setColorAt(i, c); return m;
}

/* ---------- ورقة بن لامعة ---------- */
function leafMesh(n) {
  const g = new THREE.PlaneGeometry(1, 1, 4, 10), p = g.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) + .5, v = p.getY(i) + .5, w = Math.pow(Math.sin(Math.PI * Math.pow(v, .8)), .75) * .32;
    const x = (u - .5) * 2 * w, wav = Math.sin(v * 9) * .015 * Math.abs(u - .5) * 4;
    p.setXYZ(i, x, v, -.12 * v * v + Math.abs(x) * .45 + wav);
    const sh = .65 + .35 * v; col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = sh * (1 - Math.abs(u - .5) * .35);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .38, metalness: 0, side: THREE.DoubleSide, vertexColors: true, envMapIntensity: 1, emissive: lin('#174a22'), emissiveIntensity: .45 }), n);
  m.frustumCulled = false; const c = new THREE.Color(0xffffff); for (let i = 0; i < n; i++) m.setColorAt(i, c); return m;
}

/* ---------- حبيبات القهوة السريعة (شظايا غير منتظمة) ---------- */
function granuleMesh(n, size = 1) {
  const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position, r = rand(11);
  for (let i = 0; i < p.count; i++) { const k = .72 + r() * .55; p.setXYZ(i, p.getX(i) * k * 1.15, p.getY(i) * k * .62, p.getZ(i) * k) }
  g.computeVertexNormals();
  const m = new THREE.InstancedMesh(g, new THREE.MeshStandardMaterial({ color: lin('#4a2312'), roughness: .38, metalness: .15, envMapIntensity: 1.2 }), n);
  m.frustumCulled = false; return m;
}

/* ---------- نقاط دخان/بخار بشفافية لكل نقطة ---------- */
function puffs(n, { color = '#ffffff', additive = false } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.4, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute('aS', new THREE.BufferAttribute(new Float32Array(n), 1)); geo.setAttribute('aA', new THREE.BufferAttribute(new Float32Array(n), 1));
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: new THREE.CanvasTexture(c) }, col: { value: new THREE.Color(color) }, k: { value: 1 } },
    vertexShader: 'attribute float aS;attribute float aA;varying float vA;uniform float k;void main(){vA=aA;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=aS*k*(300./-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform sampler2D map;uniform vec3 col;varying float vA;void main(){vec4 t=texture2D(map,gl_PointCoord);gl_FragColor=vec4(col,t.a*vA);}',
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending
  });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.userData.n = n; return pts;
}
function setPuff(pts, i, x, y, z, s, a) {
  const g = pts.geometry; g.attributes.position.setXYZ(i, x, y, z); g.attributes.aS.setX(i, s); g.attributes.aA.setX(i, a);
}
function flushPuffs(pts) { const g = pts.geometry; g.attributes.position.needsUpdate = g.attributes.aS.needsUpdate = g.attributes.aA.needsUpdate = true }

/* ظل ناعم تحت الأجسام */
function blobShadow(r, a = .55) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 1; return m;
}

/* وضع instance مريح */
const _o = new THREE.Object3D();
function put(mesh, i, x, y, z, sx, sy = sx, sz = sx, rx = 0, ry = 0, rz = 0) {
  _o.position.set(x, y, z); _o.scale.set(sx, sy, sz); _o.rotation.set(rx, ry, rz); _o.updateMatrix(); mesh.setMatrixAt(i, _o.matrix);
}

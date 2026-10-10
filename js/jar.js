/* ============================================================
   jar.js — برطمان القهوة السريعة: زجاج + حبيبات جوّه + غطا مضلّع + ليبل ملفوف
   ============================================================ */
function drawLabel(p) {
  const W = 1536, H = 640, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'), cx = W / 2;
  const bg = x.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, p.c); bg.addColorStop(.5, p.c); bg.addColorStop(1, p.c2); x.fillStyle = bg; x.fillRect(0, 0, W, H);
  const rg = x.createRadialGradient(cx, H * .45, 20, cx, H * .45, 520); rg.addColorStop(0, 'rgba(255,255,255,.2)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H);
  x.globalAlpha = .08; x.strokeStyle = p.a; x.lineWidth = 2;                       // خطوط إشعاع خفيفة
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; x.beginPath(); x.moveTo(cx, H * .45); x.lineTo(cx + Math.cos(a) * 1400, H * .45 + Math.sin(a) * 1400); x.stroke() } x.globalAlpha = 1;
  x.fillStyle = p.a; x.fillRect(0, 0, W, 22); x.fillRect(0, H - 22, W, 22);        // شرايط الأعلى والأسفل
  x.fillRect(0, 36, W, 3); x.fillRect(0, H - 39, W, 3);
  x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = p.t; x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 18; x.shadowOffsetY = 6;
  if (BRAND.logo && BRAND._img) { const im = BRAND._img, h = 230, w = im.width / im.height * h; x.drawImage(im, cx - w / 2, 90, w, h) }
  else { x.fillStyle = p.a; x.font = '700 250px "Reem Kufi",Tahoma'; x.fillText(BRAND.name, cx, 295) }
  x.shadowBlur = 0; x.shadowOffsetY = 0;
  [[-1, 1], [1, 1]].forEach(([s]) => bean(x, cx + s * 330, 220, 46, s * .5, p.a));        // حبتين بن على الجنب
  x.fillStyle = p.t; x.font = '700 62px Tajawal,Tahoma'; x.fillText(BRAND.tagline, cx, 385);
  x.strokeStyle = p.a; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 250, 420); x.lineTo(cx - 20, 420); x.moveTo(cx + 20, 420); x.lineTo(cx + 250, 420); x.stroke();
  x.fillStyle = p.a; x.save(); x.translate(cx, 420); x.rotate(Math.PI / 4); x.fillRect(-8, -8, 16, 16); x.restore();
  x.font = '700 76px "Reem Kufi",Tahoma'; x.fillStyle = p.a; x.fillText(p.n, cx, 515);
  x.font = '500 30px Tajawal,Tahoma'; x.fillStyle = p.t; x.globalAlpha = .85; x.fillText(BRAND.net + '  ·  ' + BRAND.latin, cx, 570); x.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; return t;
}
function bean(x, cx, cy, r, rot, color) {            // أيقونة حبّة بن مرسومة
  x.save(); x.translate(cx, cy); x.rotate(rot); x.fillStyle = color; x.beginPath(); x.ellipse(0, 0, r * 1.3, r, 0, 0, 7); x.fill();
  x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = r * .16; x.lineCap = 'round'; x.beginPath(); x.moveTo(-r * 1.1, 0); x.bezierCurveTo(-r * .4, -r * .5, r * .4, r * .5, r * 1.1, 0); x.stroke(); x.restore();
}

function makeJar() {
  const root = new THREE.Group(), inner = new THREE.Group(); inner.position.y = -.13; root.add(inner);
  // --- الزجاج
  const prof = [[0, -1.6], [.7, -1.6], [.9, -1.56], [.99, -1.45], [1, -1.3], [1, .68], [.985, .88], [.93, 1.07], [.82, 1.22], [.72, 1.31], [.67, 1.4], [.66, 1.62], [.7, 1.64], [.71, 1.7], [.65, 1.7]];
  const glassGeo = new THREE.LatheGeometry(prof.map(a => new THREE.Vector2(a[0], a[1])), 96);
  const glass = new THREE.Mesh(glassGeo, new THREE.MeshPhysicalMaterial({ color: lin('#10241d'), metalness: 0, roughness: .03, transparent: true, opacity: .28, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 2.4, side: THREE.DoubleSide, depthWrite: false }));
  glass.renderOrder = 3; inner.add(glass);
  // --- الحبيبات جوّه
  const gTex = granuleTex([3, 1.6]);
  const fillMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: gTex, roughness: .5, metalness: .1, envMapIntensity: 1.1 });
  const fillGeo = new THREE.CylinderGeometry(.935, .935, 1, 64, 1); fillGeo.translate(0, .5, 0);
  const fill = new THREE.Mesh(fillGeo, fillMat); fill.position.y = -1.53; inner.add(fill);
  const mound = new THREE.Mesh(new THREE.SphereGeometry(.935, 40, 12, 0, Math.PI * 2, 0, Math.PI / 2), fillMat); mound.scale.y = .13; inner.add(mound);
  // --- الغطا
  const lp = [[0, .25], [.58, .25], [.7, .23], [.75, .17], [.76, .1], [.76, -.2], [.77, -.25], [.73, -.27], [.69, -.25], [.68, -.17], [0, -.17]];
  const lg = new THREE.LatheGeometry(lp.map(a => new THREE.Vector2(a[0], a[1])), 120), lpos = lg.attributes.position;
  for (let i = 0; i < lpos.count; i++) { const X = lpos.getX(i), Y = lpos.getY(i), Z = lpos.getZ(i), r = Math.hypot(X, Z); if (r > .7 && Y < .12 && Y > -.22) { const a = Math.atan2(Z, X), k = 1 + .014 * Math.pow(Math.max(0, Math.cos(a * 64)), .6); lpos.setXYZ(i, X * k, Y, Z * k) } }
  lg.computeVertexNormals();
  const lidMat = new THREE.MeshPhysicalMaterial({ color: lin('#1b1412'), roughness: .32, metalness: .1, clearcoat: .8, clearcoatRoughness: .2, envMapIntensity: 1.4 });
  const lid = new THREE.Mesh(lg, lidMat); const lidG = new THREE.Group(); lidG.add(lid);
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(.75, .75, .03, 64), new THREE.MeshStandardMaterial({ color: lin('#e9e3d2'), roughness: .5 })); seal.position.y = -.285; lidG.add(seal);
  const lidY = 1.6; lidG.position.y = lidY; inner.add(lidG);
  // --- الليبل
  const arc = Math.PI * 1.2, labGeo = new THREE.CylinderGeometry(1.012, 1.012, 1.62, 128, 1, true, -arc / 2, arc);
  const labMat = new THREE.MeshStandardMaterial({ map: null, roughness: .46, metalness: .05, envMapIntensity: .7, side: THREE.FrontSide });
  const label = new THREE.Mesh(labGeo, labMat); label.position.y = -.38; inner.add(label);
  const shadow = blobShadow(2.2, .5); shadow.position.y = -1.74; inner.add(shadow);
  const api = {
    root, inner, lidG, fill, mound, label, lidY, labMat, lidMat, glass, shadow, level: 0, v: -1,
    setVariant(i) { if (api.v === i) return; api.v = i; const p = P[i]; if (labMat.map) labMat.map.dispose(); labMat.map = drawLabel(p); labMat.needsUpdate = true; lidMat.color.copy(lin(p.lid)) },
    refresh() { const i = api.v; api.v = -1; api.setVariant(i < 0 ? 0 : i) },
    setFill(l) { api.level = l; const h = Math.max(.001, l * 2.28); fill.scale.y = h; fill.visible = l > .002; mound.visible = l > .002; mound.position.y = -1.53 + h; mound.scale.y = .13 * (1 - cl((l - .9) / .1) * .6) }
  };
  api.setVariant(0); api.setFill(1); return api;
}

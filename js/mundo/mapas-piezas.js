'use strict';
/* ======================================================================
   PIEZAS DE LOS MAPAS GRANDES (las usa js/mundo/mapas-decorado.js)
   Materiales con las texturas de entorno (assets/texturas/entorno.png), geometría
   con más detalle y luz pintada en los vértices, como en los últimos juegos de
   PS1: sombra en la base, musgo, nieve donde da arriba, halos de luz en el suelo.
   También el terreno (tres texturas mezcladas y colinas) y la hierba instanciada.
   ====================================================================== */

/* ---------- Ruido determinista (no gasta rnd()) ---------- */
const mpHash = (x, y, z = 0) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
function mpRuido(x, z){
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  return lerp(lerp(mpHash(xi, zi), mpHash(xi + 1, zi), u), lerp(mpHash(xi, zi + 1), mpHash(xi + 1, zi + 1), u), v);
}
const mpFbm = (x, z, o = 4) => { let s = 0, a = 1, t = 0; for (let i = 0; i < o; i++){ s += mpRuido(x, z) * a; t += a; a *= 0.5; x = x * 2.03 + 17; z = z * 2.03 + 9; } return s / t; };
function mpRuido3(x, y, z){
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), f = t => t * t * (3 - 2 * t), u = f(x - xi), v = f(y - yi), w = f(z - zi);
  const h = (a, b, c) => mpHash(xi + a, yi + b, zi + c);
  return lerp(lerp(lerp(h(0, 0, 0), h(1, 0, 0), u), lerp(h(0, 1, 0), h(1, 1, 0), u), v), lerp(lerp(h(0, 0, 1), h(1, 0, 1), u), lerp(h(0, 1, 1), h(1, 1, 1), u), v), w);
}
const mpSmooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

/* ---------- Materiales ---------- */
function mpTex(n, mip = true){   // de cerca, píxel nítido; de lejos, con mipmaps para que no parpadee
  const t = texAsset('entorno/' + n); if (mip){ t.minFilter = THREE.NearestMipmapLinearFilter; t.generateMipmaps = true; } return t;
}
const MPT = {}; for (const n of ['ruinas-losas', 'ruinas-tierra', 'ruinas-hierba', 'ruinas-muro', 'ruinas-fuste', 'sakura-losas', 'sakura-hierba', 'sakura-tierra', 'sakura-corteza',
  'sakura-copa', 'madera-laca', 'tejas', 'nieve', 'roca', 'hielo', 'pino-corteza', 'pino-agujas', 'cumbre-grava']) MPT[n] = mpTex(n);
MPT['sakura-flores'] = mpTex('sakura-flores', false);
const mpMat = (tex, color = 0xffffff, o = {}) => makeMat(color, Object.assign({ map: tex, vc: true }, o));
const MPM = {
  muro: mpMat(MPT['ruinas-muro']), fuste: mpMat(MPT['ruinas-fuste']), rocaR: mpMat(MPT['roca'], 0xc4b8d4), roca: mpMat(MPT['roca']), rocaClara: mpMat(MPT['roca'], 0xe8e2ea),
  corteza: mpMat(MPT['sakura-corteza']), copa: mpMat(MPT['sakura-copa']), flores: mpMat(MPT['sakura-flores'], 0xffffff, { side: THREE.DoubleSide }),
  laca: mpMat(MPT['madera-laca']), negro: makeMat(0x1a1418, { vc: true }), tejas: mpMat(MPT['tejas'], 0xffffff, { side: THREE.DoubleSide }),
  pinoC: mpMat(MPT['pino-corteza']), agujas: mpMat(MPT['pino-agujas'], 0xffffff, { side: THREE.DoubleSide }), hielo: mpMat(MPT['hielo'], 0xffffff, { emissive: 0.15 }),
  papel: mpMat(texAsset('mundo/castillo-shoji'), 0xffffff, { emissive: 0.35 }), madera: mpMat(MPT['pino-corteza'], 0xb08a6a)
};

/* ---------- Color por vértice ---------- */
const _mgC = new THREE.Color();
function mpColores(geo, fn){   // fn(color, x, y, z, nx, ny, nz) -> pinta la luz «horneada» de cada vértice
  const p = geo.attributes.position, n = geo.attributes.normal, c = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++){ _mgC.setRGB(1, 1, 1); fn(_mgC, p.getX(i), p.getY(i), p.getZ(i), n.getX(i), n.getY(i), n.getZ(i)); c[i * 3] = _mgC.r; c[i * 3 + 1] = _mgC.g; c[i * 3 + 2] = _mgC.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(c, 3)); return geo;
}
const mpAO = (c, y, alto = 1.1, min = 0.5) => c.multiplyScalar(min + (1 - min) * mpSmooth(0, alto, y));   // oscuro al pie
const MUSGO = new THREE.Color(0.62, 0.86, 0.58), NIEVE = new THREE.Color(1.25, 1.3, 1.4);
const mpCache = new Map(), mpGeo = (k, f) => mpCache.has(k) ? mpCache.get(k) : (mpCache.set(k, f()), mpCache.get(k));

/* ---------- Columnas ---------- */
function mpFusteGeo(h, rota, sem){
  const g = new THREE.CylinderGeometry(0.34, 0.38, h, 24, Math.max(2, Math.round(h * 2.5))); g.translate(0, h / 2, 0);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++){
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i); const r = Math.hypot(x, z), a = Math.atan2(z, x);
    if (r > 0.05){ const k = 1 - 0.07 * (0.5 + 0.5 * Math.cos(a * 16)); x *= k; z *= k; }                       // estrías
    if (rota && y > h - 0.01) y -= 0.12 + 0.75 * mpFbm(Math.cos(a) * 1.4 + sem, Math.sin(a) * 1.4 + sem, 3);     // rotura
    p.setXYZ(i, x, y, z); uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * h / 1.6);
  }
  g.computeVertexNormals();
  return mpColores(g, (c, x, y, z) => { mpAO(c, y, 1.2, 0.45); if (y < 0.9 && mpRuido3(x * 4 + sem, y * 3, z * 4) > 0.5) c.multiply(MUSGO); if (!rota && y > h - 0.25) c.multiplyScalar(0.8); });
}
function mpColumna(parent, x, z, h, o = {}){
  const g = new THREE.Group(), sem = x * 3.1 + z; g.position.set(x, 0, z); g.rotation.y = mpHash(x, z) * 6; parent.add(g);
  const plinto = mpGeo('plinto', () => { const b = new THREE.BoxGeometry(1.0, 0.26, 1.0, 2, 1, 2); b.translate(0, 0.13, 0); return mpColores(b, (c, x, y) => mpAO(c, y, 0.3, 0.55)); });
  const toro = mpGeo('toroCol', () => mpColores(new THREE.TorusGeometry(0.4, 0.07, 6, 24), c => c.multiplyScalar(0.85)));
  g.add(new THREE.Mesh(plinto, MPM.muro));
  const t1 = new THREE.Mesh(toro, MPM.fuste); t1.rotation.x = Math.PI / 2; t1.position.y = 0.3; g.add(t1);
  const f = new THREE.Mesh(mpFusteGeo(h, !!o.rota, sem), MPM.fuste); f.position.y = 0.3; g.add(f);
  if (!o.rota){ const t2 = new THREE.Mesh(toro, MPM.fuste); t2.rotation.x = Math.PI / 2; t2.position.y = 0.3 + h; g.add(t2);
    const cap = new THREE.Mesh(plinto, MPM.muro); cap.position.y = 0.32 + h; cap.scale.set(0.95, 0.9, 0.95); g.add(cap); }
  return g;
}

/* ---------- Muros en ruinas ---------- */
function mpMuroGeo(L, h, t, ruina, sem){
  const g = new THREE.BoxGeometry(L, h, t, Math.max(1, Math.ceil(L / 0.4)), Math.max(1, Math.ceil(h / 0.45)), 1); g.translate(0, h / 2, 0);
  const p = g.attributes.position, n = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++){
    let x = p.getX(i), y = p.getY(i); const z = p.getZ(i);
    if (y > h - 0.01 && ruina) y -= ruina * h * 0.6 * Math.pow(mpFbm(x * 0.8 + sem, sem * 1.7, 3), 1.6);   // remate derruido
    p.setXYZ(i, x, y, z);
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
    uv.setXY(i, ay > 0.5 ? x / 2 : ax > 0.5 ? z / 2 : x / 2, ay > 0.5 ? z / 2 : y / 2);
  }
  g.computeVertexNormals();
  return mpColores(g, (c, x, y, z, nx, ny) => { mpAO(c, y, 1.0, 0.5); if (ny > 0.5 || mpRuido3(x * 2 + sem, y * 2.5, z * 2) > 0.62) c.multiply(MUSGO); });
}
function mpMuro(parent, x0, z0, x1, z1, h, t, ruina = 0.8){
  const dx = x1 - x0, dz = z1 - z0, L = Math.hypot(dx, dz), m = new THREE.Mesh(mpMuroGeo(L, h, t, ruina, x0 * 1.3 + z0), MPM.muro);
  m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.rotation.y = Math.atan2(-dz, dx); parent.add(m); return m;
}

/* ---------- Rocas ---------- */
function mpRocaGeo(r, det, sem, tipo){
  return mpGeo(`roca|${r.toFixed(2)}|${det}|${sem}|${tipo}`, () => {
    const g = new THREE.IcosahedronGeometry(r, det), p = g.attributes.position;
    for (let i = 0; i < p.count; i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + 0.3 * (mpRuido3(x * 1.6 / r + sem, y * 1.6 / r, z * 1.6 / r) - 0.5) + 0.12 * (mpRuido3(x * 4 / r, y * 4 / r + sem, z * 4 / r) - 0.5);
      p.setXYZ(i, x * k, Math.max(y * k * 0.78, -r * 0.25), z * k); }
    const uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + p.getZ(i) * 0.7) / 1.4, p.getY(i) / 1.4);
    g.computeVertexNormals();
    return mpColores(g, (c, x, y, z, nx, ny) => { mpAO(c, y + r * 0.25, r * 0.9, 0.45);
      if (tipo === 'nieve' && ny > 0.35 + 0.3 * mpRuido3(x * 3, y * 3, z * 3 + sem)) c.lerp(NIEVE, 0.85);
      if (tipo === 'musgo' && ny > 0.55 && mpRuido3(x * 3 + sem, y, z * 3) > 0.4) c.multiply(MUSGO); });
  });
}
function mpRoca(parent, x, z, r, mat = MPM.roca, tipo = '', det = 1){
  const m = new THREE.Mesh(mpRocaGeo(r, det, Math.floor(mpHash(x, z) * 4), tipo), mat); m.position.set(x, r * 0.18, z); m.rotation.y = mpHash(z, x) * 6;
  m.scale.set(1 + mpHash(x, 1) * 0.35, 0.85 + mpHash(2, z) * 0.3, 1 + mpHash(z, 3) * 0.25); parent.add(m); mpRocasPend.push([m, r]); return m;
}
// Todas las rocas chocan: mpColisionRocas(id) les pone su obstáculo (en su sitio real, ya dentro de grupos)
// con el radio y la altura de la roca; las bajas se saltan. Se llama al final del decorado de cada mapa.
const mpRocasPend = [], _mpV = new V3();
function mpColisionRocas(id){
  const M = mpMapa(id);
  for (const [m, r] of mpRocasPend){ let t = m; while (t.parent) t = t.parent; t.updateMatrixWorld(true); m.getWorldPosition(_mpV);
    const ws = m.getWorldScale(new V3()), rr = r * Math.max(ws.x, ws.z) * 0.9, h = _mpV.y + r * 0.78 * ws.y;
    if (rr < 0.12 || Math.hypot(_mpV.x, _mpV.z) > ARENA_GRANDE + rr) continue;
    if (M.pads.some(p => Math.hypot(p.x - _mpV.x, p.z - _mpV.z) < 1.6)) continue;   // las piedras de adorno de los trampolines no tapan la entrada
    if (M.obst.some(o => Math.hypot(o.x - _mpV.x, o.z - _mpV.z) + rr * 0.6 < o.r)) continue;   // ya la cubre otro obstáculo
    M.obst.push({ x: _mpV.x, z: _mpV.z, r: rr, h: Math.max(0.25, h), o: null }); }
  mpRocasPend.length = 0;
}

/* ---------- Cerezo ---------- */
function mpTroncoGeo(h, r0, r1, curva, sem){
  const g = new THREE.CylinderGeometry(r1, r0, h, 8, 6, true); g.translate(0, h / 2, 0);
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++){ const y = p.getY(i), k = y / h; p.setX(i, p.getX(i) + Math.sin(k * 2.2 + sem) * curva + k * k * curva * 0.8); p.setZ(i, p.getZ(i) + Math.cos(k * 1.7 + sem) * curva * 0.5);
    uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * h / 1.2); }
  g.computeVertexNormals(); return mpColores(g, (c, x, y) => mpAO(c, y, 1.0, 0.45));
}
const mpCopaGeo = [0, 1, 2].map(v => mpGeo('copa' + v, () => {
  const g = new THREE.IcosahedronGeometry(0.72, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + 0.35 * (mpRuido3(x * 2.5 + v * 7, y * 2.5, z * 2.5) - 0.5); p.setXYZ(i, x * k, y * k * 0.78, z * k); }
  const uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + p.getZ(i)) * 0.9, p.getY(i) * 0.9);
  g.computeVertexNormals(); return mpColores(g, (c, x, y) => c.multiplyScalar(0.62 + 0.5 * mpSmooth(-0.6, 0.5, y)));
}));
const mpTarjeta = mpGeo('tarjeta', () => { const g = new THREE.PlaneGeometry(1.1, 0.9); g.translate(0, 0.1, 0); return mpColores(g, (c, x, y) => c.multiplyScalar(0.8 + 0.3 * (y + 0.35))); });
function mpCerezo(parent, x, z, s){
  const g = new THREE.Group(), sem = mpHash(x, z) * 10; g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = sem; parent.add(g);
  g.add(new THREE.Mesh(mpTroncoGeo(2.3, 0.22, 0.12, 0.14, sem), MPM.corteza));
  for (let i = 0; i < 3; i++){ const a = i / 3 * TAU + sem, rama = new THREE.Mesh(mpGeo('rama', () => mpTroncoGeo(1.25, 0.08, 0.04, 0.06, 1)), MPM.corteza);
    rama.position.set(Math.cos(a) * 0.1, 1.55 + i * 0.12, Math.sin(a) * 0.1); rama.rotation.set(Math.sin(a) * 0.85, 0, -Math.cos(a) * 0.85); g.add(rama); }
  for (let i = 0; i < 8; i++){ const a = i / 7 * TAU + sem, r = i ? 0.75 + mpHash(i, sem) * 0.45 : 0, cl = new THREE.Mesh(mpCopaGeo[i % 3], MPM.copa);
    cl.position.set(Math.cos(a) * r, 2.55 + (i ? mpHash(sem, i) * 0.55 : 0.55), Math.sin(a) * r); cl.scale.setScalar(0.85 + mpHash(i, i + sem) * 0.4); g.add(cl); }
  for (let i = 0; i < 7; i++){ const a = i / 7 * TAU + sem * 0.5, t = new THREE.Mesh(mpTarjeta, MPM.flores);   // tarjetas de flores: rompen la silueta
    t.position.set(Math.cos(a) * 1.25, 2.4 + mpHash(i, sem) * 0.7, Math.sin(a) * 1.25); t.rotation.set((mpHash(sem, i) - 0.5) * 0.6, -a + Math.PI / 2, (mpHash(i, 3) - 0.5) * 0.5); g.add(t); }
  return g;
}

/* ---------- Pino nevado por capas ---------- */
const mpCapaGeo = [0, 1, 2, 3].map(k => mpGeo('capa' + k, () => {
  const r = [1.3, 1.05, 0.78, 0.46][k], h = [1.15, 1.0, 0.9, 0.8][k], g = new THREE.ConeGeometry(r, h, 12, 3, true), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++){ const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x);
    if (y < -h / 2 + 0.01){ const j = (Math.round(a / TAU * 12) % 2 ? 0.14 : -0.06) + (mpHash(a, k) - 0.5) * 0.08; p.setXYZ(i, x * (1 + j * 0.6), y - j, z * (1 + j * 0.6)); }   // borde de ramas
    uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 1.2); }
  g.computeVertexNormals();
  return mpColores(g, (c, x, y, z) => { const t = (y + h / 2) / h; c.multiplyScalar(0.55 + 0.45 * t); if (t > 0.45 + 0.35 * mpRuido3(x * 3, y * 3 + k, z * 3)) c.lerp(NIEVE, 0.8); });
}));
function mpPinoNuevo(parent, x, z, s){
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = mpHash(x, z) * 6; parent.add(g);
  g.add(new THREE.Mesh(mpGeo('troncoPino', () => mpTroncoGeo(1.6, 0.17, 0.08, 0.02, 2)), MPM.pinoC));
  [0.85, 1.55, 2.2, 2.75].forEach((y, k) => { const m = new THREE.Mesh(mpCapaGeo[k], MPM.agujas); m.position.y = y; m.rotation.y = k * 0.7; g.add(m); });
  return g;
}

/* ---------- Farol de piedra, torii y santuario ---------- */
const mpFarolGeos = mpGeo('farol', () => {
  const ao = (g, y0) => mpColores(g, (c, x, y) => mpAO(c, y + y0, 1.2, 0.55));
  const base = new THREE.CylinderGeometry(0.3, 0.36, 0.16, 8); base.translate(0, 0.08, 0);
  const pie = new THREE.CylinderGeometry(0.09, 0.12, 0.62, 8); pie.translate(0, 0.47, 0);
  const plat = new THREE.CylinderGeometry(0.3, 0.24, 0.1, 8); plat.translate(0, 0.83, 0);
  const caja = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 6); caja.translate(0, 1.03, 0);
  const tejado = new THREE.ConeGeometry(0.42, 0.3, 6); tejado.translate(0, 1.33, 0);
  const remate = new THREE.SphereGeometry(0.06, 6, 4); remate.translate(0, 1.52, 0);
  return [base, pie, plat, caja, tejado, remate].map((g, i) => { const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * 0.6, uv.getY(k) * 0.4); return ao(g, 0); });
});
const mpVentana = mpGeo('ventana', () => { const g = new THREE.CylinderGeometry(0.205, 0.205, 0.16, 6, 1, true); g.translate(0, 1.03, 0); return g; });
function mpFarolNuevo(parent, x, z, s = 1){
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = mpHash(x, z) * 6; parent.add(g);
  for (const geo of mpFarolGeos) g.add(new THREE.Mesh(geo, MPM.rocaClara));
  g.add(new THREE.Mesh(mpVentana, Mw.win)); return g;
}
function mpToriiNuevo(parent, x, z, rot, s){
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; g.scale.setScalar(s); parent.add(g);
  const poste = mpGeo('posteT', () => { const c = new THREE.CylinderGeometry(0.16, 0.2, 3.2, 10); c.translate(0, 1.6, 0); const uv = c.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), uv.getY(i) * 3);
    return mpColores(c, (k, x, y) => mpAO(k, y, 1, 0.55)); });
  const kasagi = mpGeo('kasagi', () => { const b = new THREE.BoxGeometry(4.6, 0.26, 0.48, 16, 1, 1), p = b.attributes.position;
    for (let i = 0; i < p.count; i++){ const x = p.getX(i); p.setY(i, p.getY(i) + 0.32 * Math.pow(Math.abs(x) / 2.3, 2.2)); } b.computeVertexNormals(); return mpColores(b, () => {}); });
  const viga = mpGeo('vigaT', () => { const b = new THREE.BoxGeometry(3.9, 0.2, 0.36, 8, 1, 1), p = b.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + 0.12 * Math.pow(Math.abs(p.getX(i)) / 1.95, 2)); b.computeVertexNormals(); return mpColores(b, c => c.multiplyScalar(0.9)); });
  for (const sx of [-1, 1]){ const pt = new THREE.Mesh(poste, MPM.laca); pt.position.x = 1.3 * sx; g.add(pt);
    const pie = new THREE.Mesh(mpGeo('pieT', () => mpColores(new THREE.CylinderGeometry(0.25, 0.27, 0.32, 10), c => c.multiplyScalar(0.7))), MPM.negro); pie.position.set(1.3 * sx, 0.16, 0); g.add(pie); }
  const k1 = new THREE.Mesh(kasagi, MPM.negro); k1.position.y = 3.36; g.add(k1);
  const k2 = new THREE.Mesh(viga, MPM.laca); k2.position.y = 3.12; g.add(k2);
  const nuki = new THREE.Mesh(mpGeo('nuki', () => mpColores(new THREE.BoxGeometry(3.3, 0.18, 0.24), c => c.multiplyScalar(0.85))), MPM.laca); nuki.position.y = 2.55; g.add(nuki);
  const gaku = new THREE.Mesh(mpGeo('gaku', () => mpColores(new THREE.BoxGeometry(0.24, 0.42, 0.16), () => {})), MPM.negro); gaku.position.y = 2.85; g.add(gaku);
  return g;
}
function mpTejado(parent, w, d, h, y, z0 = 0){   // tejado a cuatro aguas con aleros que se curvan hacia arriba
  const g = new THREE.ConeGeometry(1, 1, 4, 3, true), p = g.attributes.position; g.rotateY(Math.PI / 4);
  for (let i = 0; i < p.count; i++){ const yy = p.getY(i), k = 0.5 - yy; p.setXYZ(i, p.getX(i) * w * 0.72, yy * h + Math.pow(k, 3) * h * 0.35, p.getZ(i) * d * 0.72); }
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * 1.5, uv.getY(i) * h * 2);
  g.computeVertexNormals(); mpColores(g, (c, x, yy) => c.multiplyScalar(0.7 + 0.35 * (yy / h + 0.5)));
  const m = new THREE.Mesh(g, MPM.tejas); m.position.set(0, y, z0); parent.add(m);
  const cumbrera = new THREE.Mesh(mpGeo('cumbrera', () => mpColores(new THREE.BoxGeometry(0.5, 0.14, 0.14), c => c.multiplyScalar(0.8))), MPM.negro); cumbrera.position.set(0, y + h / 2, z0); parent.add(cumbrera);
  return m;
}
function mpSantuario(parent, x, z, rot){
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; parent.add(g);
  const caja = (w, h, d, mat, px, py, pz, ao = 0.6) => { const b = new THREE.BoxGeometry(w, h, d, Math.ceil(w * 2), 1, Math.ceil(d * 2)); const uv = b.attributes.uv, n = b.attributes.normal;
    for (let i = 0; i < uv.count; i++){ const ay = Math.abs(n.getY(i)); uv.setXY(i, uv.getX(i) * (ay > 0.5 ? w : Math.abs(n.getX(i)) > 0.5 ? d : w) / 1.2, uv.getY(i) * (ay > 0.5 ? d : h) / 1.2); }
    mpColores(b, (c, x2, y2) => c.multiplyScalar(ao + (1 - ao) * (y2 / h + 0.5))); const m = new THREE.Mesh(b, mat); m.position.set(px, py, pz); g.add(m); return m; };
  caja(3.4, 0.32, 2.9, MPM.rocaClara, 0, 0.16, 0); caja(1.4, 0.14, 0.6, MPM.rocaClara, 0, 0.07, 1.75);                    // basamento y escalón
  caja(2.4, 1.5, 1.8, MPM.papel, 0, 1.07, -0.15, 0.8);                                                                   // paredes de papel
  for (const [px, pz] of [[-1.2, 0.75], [1.2, 0.75], [-1.2, -1.05], [1.2, -1.05]]){ const c = new THREE.Mesh(mpGeo('pilarS', () => { const cy = new THREE.CylinderGeometry(0.09, 0.1, 1.6, 8); cy.translate(0, 0.8, 0); return mpColores(cy, (k, a, y) => mpAO(k, y, 1, 0.6)); }), MPM.laca); c.position.set(px, 0.32, pz); g.add(c); }
  caja(2.7, 0.14, 2.1, MPM.laca, 0, 1.95, -0.15, 0.8);                                                                   // viga
  mpTejado(g, 3.6, 3.0, 1.0, 2.45, -0.15);
  const cuerda = new THREE.Mesh(mpGeo('shime', () => mpColores(new THREE.TorusGeometry(1.0, 0.06, 5, 14, Math.PI), c => c.setRGB(0.95, 0.88, 0.7))), MPM.negro);
  cuerda.material = makeMat(0xffffff, { vc: true }); cuerda.position.set(0, 1.85, 0.77); cuerda.rotation.z = Math.PI; g.add(cuerda);
  for (const sx of [-0.5, 0, 0.5]){ const sh = new THREE.Mesh(mpGeo('shide', () => mpColores(new THREE.BoxGeometry(0.08, 0.28, 0.01), () => {})), makeMat(0xffffff, { vc: true, emissive: 0.2 })); sh.position.set(sx, 1.55, 0.79); sh.rotation.z = 0.2; g.add(sh); }
  return g;
}

/* ---------- Terreno ---------- */
// cfg: { tex: [a, b, c], esc: [kb, kc], alt(x, z), mezcla(x, z) -> [wa, wb, wc], luces: [{ x, z, r, col: [r, g, b] }], sombras: [{ x, z, r, k }] }
function mpTerreno(parent, cfg){
  const N = 112, S = 124, g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, uv = g.attributes.uv, sp = new Float32Array(p.count * 3), col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++){ const x = p.getX(i), z = p.getZ(i); p.setY(i, cfg.alt(x, z)); uv.setXY(i, x / 3, z / 3);
    const w = cfg.mezcla(x, z), t = w[0] + w[1] + w[2] || 1; sp[i * 3] = w[0] / t; sp[i * 3 + 1] = w[1] / t; sp[i * 3 + 2] = w[2] / t; }
  g.computeVertexNormals();
  const [ldx, ldz] = [0.77, -0.63];   // las sombras caen al contrario que la luz principal
  for (let i = 0; i < p.count; i++){
    const x = p.getX(i), z = p.getZ(i); let r = 0.9 + 0.16 * mpFbm(x * 0.15, z * 0.15, 3), gg = r, b = r;
    for (const s of cfg.sombras){ const d = Math.hypot(x - (s.x + ldx * s.r * 0.6), z - (s.z + ldz * s.r * 0.6)), k = 1 - (s.k || 0.45) * (1 - mpSmooth(s.r * 0.6, s.r * 1.7, d)); r *= k; gg *= k; b *= k; }
    for (const l of cfg.luces){ const d = Math.hypot(x - l.x, z - l.z); if (d < l.r){ const k = Math.pow(1 - d / l.r, 1.6); r += l.col[0] * k; gg += l.col[1] * k; b += l.col[2] * k; } }
    col[i * 3] = r; col[i * 3 + 1] = gg; col[i * 3 + 2] = b;
  }
  g.setAttribute('splat', new THREE.BufferAttribute(sp, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = makeMat(0xffffff, { map: cfg.tex[0], terreno: [cfg.tex[1], cfg.tex[2]], esc: cfg.esc || [1, 1], vc: true, relleno: false });   // el suelo ya recibe la luz de lleno
  for (const t of mpTrozos(g, N, 4)) parent.add(new THREE.Mesh(t, mat));
}
// Parte una rejilla de (N+1)x(N+1) vértices en KxK trozos (con las normales de la rejilla entera, sin costuras):
// cada trozo tiene su esfera y la cámara descarta los que no ve
function mpTrozos(g, N, K){
  const out = [], q = N / K, w = q + 1, A = g.attributes, idx = [];
  for (let r = 0; r < q; r++) for (let c = 0; c < q; c++){ const a = r * w + c, b = a + w; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  for (let tj = 0; tj < K; tj++) for (let ti = 0; ti < K; ti++){
    const sub = new THREE.BufferGeometry();
    for (const k in A){ const a = A[k], n = a.itemSize, arr = new Float32Array(w * w * n);
      for (let r = 0; r < w; r++) for (let c = 0; c < w; c++){ const s0 = ((tj * q + r) * (N + 1) + ti * q + c) * n, d = (r * w + c) * n; for (let m = 0; m < n; m++) arr[d + m] = a.array[s0 + m]; }
      sub.setAttribute(k, new THREE.BufferAttribute(arr, n)); }
    sub.setIndex(idx); sub.computeBoundingSphere(); out.push(sub); }
  return out;
}
// Colinas alrededor del mapa: llano dentro de los 19 m y luego sube (con ruido) hasta cerrar el valle
const mpColina = (x, z, alto, rugo) => { const r = Math.hypot(x, z); if (r < 19.2) return 0;
  return mpSmooth(19.2, 34, r) * alto * (0.65 + 0.7 * mpFbm(x * 0.06 + 3, z * 0.06, 4)) + mpSmooth(24, 40, r) * rugo * (mpFbm(x * 0.2, z * 0.2, 3) - 0.3); };

/* ---------- Hierba y pétalos: miles de copias fundidas por parcelas (la hierba se mueve con el viento) ---------- */
function mpMataGeo(alto, base, punta){
  const pos = [], nor = [], col = [], uvs = [], cB = new THREE.Color(base), cP = new THREE.Color(punta);
  for (let i = 0; i < 6; i++){ const a = i / 6 * Math.PI + mpHash(i, alto) * 0.6, inc = 0.18 + mpHash(alto, i) * 0.22, h = alto * (0.7 + mpHash(i, 7) * 0.5), w = 0.05;
    const ox = Math.cos(a) * w, oz = Math.sin(a) * w, tx = Math.cos(a + 1.57) * inc * h, tz = Math.sin(a + 1.57) * inc * h;
    pos.push(-ox, 0, -oz, ox, 0, oz, tx, h, tz); for (let k = 0; k < 3; k++) nor.push(0, 1, 0);
    for (const c of [cB, cB, cP]) col.push(c.r, c.g, c.b); uvs.push(0, 0, 1, 0, 0.5, 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); return g;
}
function mpInstancias(parent, geo, mat, n, sitio, escala = [0.8, 1.3], alt = null){
  // Copias de una mata en 4x4 parcelas de 13 m, fundidas en una malla por parcela: la cámara descarta las que no ve
  // y es mucho más ligero que instanciar miles de copias. En uv.y queda la altura de cada vértice para el viento.
  const q = new THREE.Quaternion(), e = new THREE.Euler(), v = new V3(), s = new V3(), celdas = [...Array(16)].map(() => []); let k = 0;
  for (let i = 0; i < n * 8 && k < n; i++){ const x = (mpR() - 0.5) * 2 * 26, z = (mpR() - 0.5) * 2 * 26; if (!sitio(x, z)) continue;
    const sc = escala[0] + mpR() * (escala[1] - escala[0]); e.set(0, mpR() * TAU, 0); q.setFromEuler(e);
    celdas[clamp(Math.floor((z + 26) / 13), 0, 3) * 4 + clamp(Math.floor((x + 26) / 13), 0, 3)].push(new THREE.Matrix4().compose(v.set(x, alt ? alt(x, z) : 0, z), q, s.set(sc, sc, sc))); k++; }
  if (geo.index) geo = geo.toNonIndexed();
  const P = geo.attributes.position, Nn = geo.attributes.normal, Cc = geo.attributes.color, nv = P.count, nm = new THREE.Matrix3();
  for (const L of celdas){ if (!L.length) continue;
    const pos = new Float32Array(L.length * nv * 3), nor = new Float32Array(L.length * nv * 3), col = new Float32Array(L.length * nv * 3), uv = new Float32Array(L.length * nv * 2);
    L.forEach((M4, j) => { nm.getNormalMatrix(M4); const sc = M4.getMaxScaleOnAxis();
      for (let i = 0; i < nv; i++){ const o = (j * nv + i) * 3; v.fromBufferAttribute(P, i); uv[(j * nv + i) * 2 + 1] = v.y * sc; v.applyMatrix4(M4); pos[o] = v.x; pos[o + 1] = v.y; pos[o + 2] = v.z;
        v.fromBufferAttribute(Nn, i).applyMatrix3(nm).normalize(); nor[o] = v.x; nor[o + 1] = v.y; nor[o + 2] = v.z;
        col[o] = Cc ? Cc.getX(i) : 1; col[o + 1] = Cc ? Cc.getY(i) : 1; col[o + 2] = Cc ? Cc.getZ(i) : 1; } });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.computeBoundingSphere(); parent.add(new THREE.Mesh(g, mat)); }
}
function mpPetaloGeo(){
  const g = new THREE.PlaneGeometry(0.09, 0.06); g.rotateX(-Math.PI / 2); g.translate(0, 0.02, 0);
  return mpColores(g, c => c.setRGB(1.0, 0.72, 0.84));
}

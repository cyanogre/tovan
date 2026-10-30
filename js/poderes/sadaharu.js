'use strict';
/* ======================================================================
   EL PERRO GIGANTE · SADAHARU (Gintama) · prefijo sad
   Sustituye a la cabeza de icosaedros de mkDog. Un perrazo blanco y
   peludo (sombras lilas horneadas en los vértices),
   orejas de punta con el interior rosa, ojillos negros con brillo, hocico
   corto con colmillos y lengua, patas delanteras con dedos y la cola
   enroscada asomando del suelo un poco más atrás.
   El ataque (perroSale / perroTick, desde js/poderes/anime/mecanicas.js):
   el suelo se agrieta, sale de golpe frente a Tovan (se le ve la cara),
   echa la cabeza atrás con la boca abierta, se lanza y muerde al enemigo
   por la cabeza, lo zarandea con el chorro de sangre de la serie y se
   vuelve a hundir moviendo la cola. Sin rótulos.
   Cada pieza es una sola malla esculpida: formas fundidas con funciones
   de distancia (sadCuerpoSDF, sadCabezaSDF…) y una superficie sacada por
   surface nets (sadMalla); el pelo estira la propia malla (sadPelaje) y
   los colores (nariz, boca, interior de las orejas) van en los vértices.
   Se construye una vez, al coger el poder (con su propio PRNG), y se clona.
   ====================================================================== */
const SAD = { proto: null, mats: null };
const SAD_ESC = 0.7;                       // tamaño (a 1 mide unos 4,8 m hasta la punta de las orejas; así, unos 3,4 m)
const SAD_PIVOTE = [0, 2.3, 0];            // cuello: donde gira la cabeza al lanzarse
const SAD_BOCA = [0, 0.4, 1.36];           // centro de la boca en el marco del cuello

/* ---------- Modelo ---------- */
function sadMats(){ if (SAD.mats) return SAD.mats;
  const vc = (e, o) => makeMat(0xffffff, Object.assign({ vc: true, emissive: e }, o || {}));
  return (SAD.mats = { pelo: vc(0.3), rosa: vc(0.32), boca: makeMat(0x4a0a14, { emissive: 0.15 }), negro: makeMat(0x0e0e12, { emissive: 0.08 }), brillo: makeMat(0xffffff, { emissive: 1 }), diente: makeMat(0xfbf8ee, { emissive: 0.55 }) }); }
// pelo blanco con la sombra lila de los dibujos (corte casi de cel) y un toque cálido arriba
const sadPelo = N => { const k = clamp((-N.y + 0.02) / 0.45, 0, 1), c = vehMezcla([1, 0.99, 0.97], [0.54, 0.54, 0.76], k * 0.85); return vehMezcla(c, [1.04, 1.0, 0.95], clamp((N.y - 0.6) / 0.4, 0, 1) * 0.5); };
const sadRosa = N => { const k = clamp(-N.y, 0, 1); return vehMezcla([1, 0.58, 0.66], [0.7, 0.32, 0.45], k * 0.6); };
const sadBola = (rx, ry, rz, seg = 20) => { const g = new THREE.SphereGeometry(1, seg, Math.max(8, seg * 0.7 | 0)); g.scale(rx, ry, rz); return g; };
const sadV = new THREE.Vector3(), sadY = new THREE.Vector3(0, 1, 0);

/* ---------- Escultura: campos de distancia fundidos y una sola malla por pieza ---------- */
// cada pieza (cuerpo, cabeza, mandíbula, cola) es una función de distancia hecha con formas fundidas (smin), así no hay bolas
// pegadas ni costuras; sadMalla saca la superficie (surface nets) y sadPelaje estira la propia malla en mechones peinados
const sadLen = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
const sadMin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
const sadMax = (a, b, k) => -sadMin(-a, -b, k);
function sdElip(x, y, z, cx, cy, cz, rx, ry, rz){ const px = (x - cx) / rx, py = (y - cy) / ry, pz = (z - cz) / rz, k0 = sadLen(px, py, pz), k1 = sadLen(px / rx, py / ry, pz / rz); return k1 < 1e-9 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1; }
function sdCono(x, y, z, ax, ay, az, bx, by, bz, ra, rb){ const ux = bx - ax, uy = by - ay, uz = bz - az, px = x - ax, py = y - ay, pz = z - az, t = clamp((px * ux + py * uy + pz * uz) / (ux * ux + uy * uy + uz * uz), 0, 1); return sadLen(px - ux * t, py - uy * t, pz - uz * t) - (ra + (rb - ra) * t); }
// superficie de la función f (negativa dentro) en la caja [min, max] con paso h: un vértice por celda cortada y un quad por arista cortada
function sadMalla(f, min, max, h){
  const nx = Math.ceil((max[0] - min[0]) / h) + 1, ny = Math.ceil((max[1] - min[1]) / h) + 1, nz = Math.ceil((max[2] - min[2]) / h) + 1, V = new Float32Array(nx * ny * nz), I = (i, j, k) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) V[I(i, j, k)] = f(min[0] + i * h, min[1] + j * h, min[2] + k * h);
  const C = (i, j, k) => i + (nx - 1) * (j + (ny - 1) * k), vid = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1), pos = [];
  const E = [[0, 0, 0, 1, 0, 0], [0, 1, 0, 1, 1, 0], [0, 0, 1, 1, 0, 1], [0, 1, 1, 1, 1, 1], [0, 0, 0, 0, 1, 0], [1, 0, 0, 1, 1, 0], [0, 0, 1, 0, 1, 1], [1, 0, 1, 1, 1, 1], [0, 0, 0, 0, 0, 1], [1, 0, 0, 1, 0, 1], [0, 1, 0, 0, 1, 1], [1, 1, 0, 1, 1, 1]];
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++){ let sx = 0, sy = 0, sz = 0, n = 0;
    for (const e of E){ const a = V[I(i + e[0], j + e[1], k + e[2])], b = V[I(i + e[3], j + e[4], k + e[5])]; if ((a < 0) === (b < 0)) continue; const t = a / (a - b);
      sx += e[0] + (e[3] - e[0]) * t; sy += e[1] + (e[4] - e[1]) * t; sz += e[2] + (e[5] - e[2]) * t; n++; }
    if (n){ vid[C(i, j, k)] = pos.length / 3; pos.push(min[0] + (i + sx / n) * h, min[1] + (j + sy / n) * h, min[2] + (k + sz / n) * h); } }
  const idx = [], quad = (a, b, c, d, eje, s) => { if (a < 0 || b < 0 || c < 0 || d < 0) return;   // gira el quad para que mire hacia fuera (el lado positivo de la arista)
    const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2], vx = pos[c * 3] - pos[a * 3], vy = pos[c * 3 + 1] - pos[a * 3 + 1], vz = pos[c * 3 + 2] - pos[a * 3 + 2];
    const nn = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx][eje]; if (nn * s >= 0) idx.push(a, b, c, a, c, d); else idx.push(a, c, b, a, d, c); };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++){ const a = V[I(i, j, k)], b = V[I(i + 1, j, k)]; if ((a < 0) !== (b < 0)) quad(vid[C(i, j - 1, k - 1)], vid[C(i, j, k - 1)], vid[C(i, j, k)], vid[C(i, j - 1, k)], 0, a < 0 ? 1 : -1); }
  for (let k = 1; k < nz - 1; k++) for (let j = 0; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++){ const a = V[I(i, j, k)], b = V[I(i, j + 1, k)]; if ((a < 0) !== (b < 0)) quad(vid[C(i - 1, j, k - 1)], vid[C(i - 1, j, k)], vid[C(i, j, k)], vid[C(i, j, k - 1)], 1, a < 0 ? 1 : -1); }
  for (let k = 0; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++){ const a = V[I(i, j, k)], b = V[I(i, j, k + 1)]; if ((a < 0) !== (b < 0)) quad(vid[C(i - 1, j - 1, k)], vid[C(i, j - 1, k)], vid[C(i, j, k)], vid[C(i - 1, j, k)], 2, a < 0 ? 1 : -1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// pelaje: mechones que salen de la propia malla (sin raíz a la vista). grupos = [{ n, filtro(p, n), peine (vector o función de p), largo, R (radio en metros) }]
// pinta(p, n, w) da el color de cada vértice (w = cuánto mechón tiene: entre mechones el pelo queda un poco más oscuro)
function sadPelaje(g, grupos, R, pinta){
  const p = g.attributes.position, nr = g.attributes.normal, n = p.count, a = new THREE.Vector3(), b = new THREE.Vector3(), m = [];
  for (const G of grupos){ let k = 0, tries = 0;
    while (k < G.n && tries++ < G.n * 80){ const i = Math.floor(R() * n); a.fromBufferAttribute(p, i); b.fromBufferAttribute(nr, i); if (!G.filtro(a, b)) continue;
      if (m.some(q => q.c.distanceTo(a) < G.R * 0.7)) continue;
      m.push({ c: a.clone(), n: b.clone(), dir: b.clone().add(typeof G.peine === 'function' ? G.peine(a) : G.peine).normalize(), l: G.largo * (0.7 + R() * 0.6), R: G.R * (0.8 + R() * 0.4) }); k++; } }
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++){ a.fromBufferAttribute(p, i); b.fromBufferAttribute(nr, i); let mejor = null, pm = 0;
    for (const q of m){ const d = q.c.distanceTo(a); if (d < q.R && b.dot(q.n) > 0.2){ const v = Math.pow(1 - d / q.R, 1.6); if (v > pm){ pm = v; mejor = q; } } }
    if (mejor){ a.addScaledVector(mejor.dir, mejor.l * pm); p.setXYZ(i, a.x, a.y, a.z); } w[i] = pm; }
  g.computeVertexNormals(); const col = [];
  for (let i = 0; i < n; i++){ a.fromBufferAttribute(p, i); b.fromBufferAttribute(nr, i); col.push(...pinta(a, b, w[i])); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return g;
}
const sadPeloW = (N, w) => { const c = sadPelo(N), k = 0.84 + 0.16 * Math.min(1, w * 2.5); return [c[0] * k, c[1] * k, c[2] * k]; };

/* ---------- Las piezas ---------- */
// cuerpo (marco de la raíz): pecho, base, hombros, patas, manos y dedos, todo fundido
function sadCuerpoSDF(x, y, z){ const ax = Math.abs(x);
  let d = sdElip(x, y, z, 0, 1.25, -0.1, 1.18, 1.5, 1.0);
  d = sadMin(d, sdElip(x, y, z, 0, -0.15, -0.35, 1.35, 0.8, 1.05), 0.5);
  d = sadMin(d, sdElip(ax, y, z, 0.7, 1.2, 0.3, 0.5, 0.66, 0.5), 0.35);                         // hombros
  d = sadMin(d, sdCono(ax, y, z, 0.78, 1.05, 0.5, 0.86, 0.32, 1.08, 0.34, 0.26), 0.28);           // patas
  d = sadMin(d, sdElip(ax, y, z, 0.86, 0.2, 1.22, 0.42, 0.22, 0.5), 0.2);                         // manos
  for (const dx of [-0.18, 0, 0.18]) d = sadMin(d, sdElip(ax, y, z, 0.86 + dx, 0.14, 1.62, 0.13, 0.12, 0.13), 0.07);   // dedos
  return d; }
// cabeza (marco del cuello): cráneo, mofletes, hocico, nariz y orejas fundidos; la boca es una cavidad tallada por debajo y las orejas, un cuenco por delante
const sadNariz = (x, y, z) => sdElip(x, y, z, 0, 0.8, 1.6, 0.16, 0.11, 0.1);
const sadCavidad = (x, y, z) => sdElip(x, y, z, 0, 0.24, 1.0, 0.46, 0.17, 0.62);
const sadOreja = (ax, y, z) => sdCono(ax, y, (z - 0.12) * 2.4 + 0.12, 0.52, 1.45, 0.12, 0.86, 2.42, 0.06, 0.3, 0.035) * 0.6;
const sadOrejaIn = (ax, y, z) => sdCono(ax, y, (z - 0.25) * 3.2 + 0.12, 0.56, 1.62, 0.12, 0.83, 2.28, 0.12, 0.17, 0.02) * 0.45;
function sadCabezaSDF(x, y, z){ const ax = Math.abs(x);
  let d = sdElip(x, y, z, 0, 0.85, 0.3, 1.02, 0.92, 0.92);
  d = sadMin(d, sdElip(ax, y, z, 0.5, 0.52, 0.62, 0.55, 0.48, 0.5), 0.35);                      // mofletes
  d = sadMin(d, sdElip(x, y, z, 0, 0.6, 1.1, 0.5, 0.32, 0.52), 0.3);                             // hocico
  d = sadMin(d, sadNariz(x, y, z), 0.06);
  d = sadMin(d, sadOreja(ax, y, z), 0.2);
  d = sadMax(d, -sadOrejaIn(ax, y, z), 0.04);
  return sadMax(d, -sadCavidad(x, y, z), 0.04); }
function sadCabezaColor(p, N, w){ const ax = Math.abs(p.x);
  if (sadNariz(p.x, p.y, p.z) < 0.035) return [0.05, 0.05, 0.06];
  const cav = sadCavidad(p.x, p.y, p.z); if (Math.abs(cav) < 0.04 && N.y < 0.3) return p.z > 0.75 ? vehMezcla([0.95, 0.5, 0.6], [0.6, 0.16, 0.24], clamp((1.3 - p.z) / 0.5, 0, 1)) : [0.3, 0.04, 0.08];
  if (Math.abs(sadOrejaIn(ax, p.y, p.z)) < 0.055 && N.z > 0.0) return sadRosa(N);
  return sadPeloW(N, w); }
// mandíbula (marco de la mandíbula): el suelo de la boca tallado y la lengua encima
const sadSuelo = (x, y, z) => sdElip(x, y, z, 0, 0.07, 0.38, 0.36, 0.1, 0.42), sadLengua = (x, y, z) => sdElip(x, y, z, 0, 0.0, 0.42, 0.26, 0.06, 0.33);
function sadMandSDF(x, y, z){ let d = sdElip(x, y, z, 0, -0.1, 0.4, 0.44, 0.17, 0.5); d = sadMax(d, -sadSuelo(x, y, z), 0.03); return sadMin(d, sadLengua(x, y, z), 0.04); }
function sadMandColor(p, N, w){ if (sadLengua(p.x, p.y, p.z) < 0.03) return [1, 0.55, 0.62]; if (Math.abs(sadSuelo(p.x, p.y, p.z)) < 0.03 && N.y > 0) return [0.38, 0.05, 0.1]; return sadPeloW(N, w); }
// cola enroscada: conos fundidos a lo largo de la curva
const SAD_COLA = [[0, -0.3, 0, 0.34], [0, 0.85, 0.12, 0.32], [0, 1.4, -0.08, 0.3], [0, 1.68, -0.5, 0.26], [0, 1.55, -0.88, 0.2]];
function sadColaSDF(x, y, z){ let d = 1e9; for (let i = 0; i < SAD_COLA.length - 1; i++){ const a = SAD_COLA[i], b = SAD_COLA[i + 1]; d = sadMin(d, sdCono(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], a[3], b[3]), 0.15); } return d; }
// punto de la superficie de la cabeza delante de (x, y), mirando desde +z
function sadSuperficie(x, y){ for (let z = 2.2; z > 0; z -= 0.005) if (sadCabezaSDF(x, y, z) < 0) return z; return 1; }
// cono (para los dientes)
function sadDiente(parent, mat, x, y, z, dir, largo, radio){
  const geo = new THREE.ConeGeometry(radio, largo, 5); geo.translate(0, largo / 2, 0);
  const m = mesh(geo, mat, x, y, z, parent); m.quaternion.setFromUnitVectors(sadY, sadV.copy(dir).normalize()); return m;
}
function sadConstruye(){
  const M = sadMats(), R = mulberry32(2003), V = (x, y, z) => new THREE.Vector3(x, y, z);
  const raiz = new THREE.Group(), cuerpo = new THREE.Group(), cuello = new THREE.Group(), cabeza = new THREE.Group(), mand = new THREE.Group(), cola = new THREE.Group();
  cuello.position.set(...SAD_PIVOTE); cuello.add(cabeza); raiz.add(cuello);
  // cuerpo de una pieza, con la gorguera y una melena alrededor del cuello que tapa dónde entra la cabeza
  const gc = sadPelaje(sadMalla(sadCuerpoSDF, [-1.9, -0.75, -1.55], [1.9, 2.95, 2.0], 0.068), [
    { n: 34, filtro: (p, n) => n.z > 0.2 && p.y > 0.7 && p.y < 2.3 && Math.abs(p.x) < 0.95, peine: V(0, -0.9, 0.35), largo: 0.42, R: 0.26 },
    { n: 16, filtro: (p, n) => Math.abs(n.x) > 0.6 && p.y > 0.9, peine: V(0, -0.5, -0.4), largo: 0.4, R: 0.28 },
    { n: 16, filtro: (p, n) => p.y > 2.1, peine: V(0, 0.15, 0.5), largo: 0.38, R: 0.26 },
    { n: 10, filtro: (p, n) => n.z < -0.4 && p.y > 1.2, peine: V(0, -0.5, -0.6), largo: 0.32, R: 0.28 },
    { n: 10, filtro: (p, n) => n.z < -0.2 && p.y > 0.42 && p.y < 1.0 && Math.abs(p.x) > 0.5, peine: V(0, -0.7, -0.4), largo: 0.2, R: 0.17 }], R, (p, n, w) => sadPeloW(n, w));
  cuerpo.add(new THREE.Mesh(gc, M.pelo)); raiz.add(cuerpo);
  // cabeza de una pieza: mofletes de mechones, mechones subiendo por las orejas y la nuca
  const cab = new THREE.Group();
  mesh(sadPelaje(sadMalla(sadCabezaSDF, [-1.35, -0.25, -0.7], [1.35, 2.6, 1.85], 0.048), [
    { n: 24, filtro: (p, n) => Math.abs(p.x) > 0.5 && p.y < 0.75 && p.z > -0.3 && p.z < 0.95 && n.y < 0.4, peine: V(0, -0.75, -0.25), largo: 0.4, R: 0.24 },
    { n: 10, filtro: (p, n) => p.z < -0.25 && p.y > 0.2, peine: V(0, -0.6, -0.5), largo: 0.32, R: 0.26 },
    { n: 3, filtro: (p, n) => p.y > 1.68 && Math.abs(p.x) < 0.25, peine: V(0, 0.3, -0.6), largo: 0.2, R: 0.22 },
    { n: 8, filtro: (p, n) => Math.abs(p.x) > 0.3 && Math.abs(p.x) < 0.75 && p.y > 1.3 && p.y < 1.62 && p.z > -0.25 && p.z < 0.1, peine: p => V(0.3 * Math.sign(p.x), 1, -0.2), largo: 0.24, R: 0.2 }], R, sadCabezaColor), M.pelo, 0, 0, 0, cab);
  // ojos: casi enterrados en la superficie, con su brillo; brillo de la nariz
  for (const s of [-1, 1]){ const zs = sadSuperficie(0.42 * s, 1.12), o = mesh(sadBola(0.13, 0.16, 0.07, 12), M.negro, 0.42 * s, 1.12, zs - 0.035, cab); o.rotation.y = 0.35 * s;
    mesh(sadBola(0.034, 0.038, 0.02, 6), M.brillo, 0.42 * s + 0.035, 1.17, zs + 0.03, cab); }
  mesh(sadBola(0.045, 0.03, 0.02, 6), M.brillo, 0.06, 0.86, sadSuperficie(0.06, 0.86) + 0.012, cab);
  // colmillos de arriba
  for (const s of [-1, 1]) sadDiente(cab, M.diente, 0.26 * s, 0.35, 1.4, V(0, -1, 0.1), 0.24, 0.06);
  for (const x of [-0.12, -0.04, 0.04, 0.12]) sadDiente(cab, M.diente, x, 0.35, 1.5, V(0, -1, 0.05), 0.1, 0.03);
  mpFusiona(cab, cabeza);
  // mandíbula: pivote bajo el hocico (rotation.x > 0 abre)
  mand.position.set(0, 0.28, 0.72); cabeza.add(mand); const mj = new THREE.Group();
  mesh(sadPelaje(sadMalla(sadMandSDF, [-0.6, -0.4, -0.2], [0.6, 0.25, 1.05], 0.03), [{ n: 6, filtro: (p, n) => n.y < -0.5, peine: V(0, -0.8, -0.2), largo: 0.14, R: 0.14 }], R, sadMandColor), M.pelo, 0, 0, 0, mj);
  for (const s of [-1, 1]) sadDiente(mj, M.diente, 0.25 * s, 0.02, 0.74, V(0, 1, 0.1), 0.2, 0.05);
  mpFusiona(mj, mand);
  // la cola enroscada, asomando del suelo detrás
  cola.position.set(0, 0, -2.3); raiz.add(cola);
  cola.add(new THREE.Mesh(sadPelaje(sadMalla(sadColaSDF, [-0.6, -0.5, -1.4], [0.6, 2.2, 0.6], 0.055), [{ n: 16, filtro: () => true, peine: V(0, 0.2, -0.6), largo: 0.22, R: 0.2 }], R, (p, n, w) => sadPeloW(n, w)), M.pelo));
  // el marcador de la boca, para colocar el mordisco
  const boca = new THREE.Object3D(); boca.position.set(...SAD_BOCA); cuello.add(boca);
  cuello.name = 'sadCuello'; cabeza.name = 'sadCabeza'; mand.name = 'sadMand'; cola.name = 'sadCola'; boca.name = 'sadBoca';
  raiz.scale.setScalar(SAD_ESC); return raiz;
}
// sustituye al modelo viejo: devuelve un perro nuevo en la escena, con sus piezas en userData
function mkDog(){
  if (!SAD.proto) SAD.proto = sadConstruye();
  const g = SAD.proto.clone(); scene.add(g);
  g.userData = { cuello: g.getObjectByName('sadCuello'), head: g.getObjectByName('sadCabeza'), jaw: g.getObjectByName('sadMand'), cola: g.getObjectByName('sadCola'), boca: g.getObjectByName('sadBoca') };
  return g;
}

/* ---------- Sonidos ---------- */
Object.assign(SFX, {
  sadRetumba: () => { noise({ dur: 0.5, vol: 0.18, f0: 160, type: 'lowpass', rv: 0.3 }); tone({ type: 'sine', f0: 70, f1: 38, dur: 0.5, vol: 0.2 }); },
  sadSale: () => { noise({ dur: 0.35, vol: 0.22, f0: 900, f1: 200, type: 'lowpass', rv: 0.3 }); tone({ type: 'sine', f0: 120, f1: 40, dur: 0.3, vol: 0.25 });
    [0, 0.16].forEach(w => { tone({ type: 'sawtooth', f0: 330, f1: 190, dur: 0.13, vol: 0.12, when: 0.12 + w, rv: 0.35 }); noise({ dur: 0.1, vol: 0.08, f0: 900, type: 'bandpass', q: 2, when: 0.12 + w }); }); },   // ¡guau, guau!
  sadMuerde: () => { noise({ dur: 0.12, vol: 0.3, f0: 1800, type: 'bandpass', q: 0.8 }); tone({ type: 'square', f0: 90, f1: 50, dur: 0.14, vol: 0.18 }); noise({ dur: 0.4, vol: 0.1, f0: 3000, f1: 800, type: 'bandpass', when: 0.08 }); },
  sadMastica: () => { noise({ dur: 0.07, vol: 0.12, f0: 1400, type: 'bandpass', q: 1.2 }); }
});

/* ---------- El ataque ---------- */
// el ángulo del cuello que deja la boca a la altura yT (en el marco de la raíz, sin escalar)
function sadAngulo(yT){ let mejor = 0.5, err = 1e9;
  for (let a = 0.2; a <= 1.15; a += 0.025){ const y = SAD_PIVOTE[1] + SAD_BOCA[1] * Math.cos(a) - SAD_BOCA[2] * Math.sin(a); if (Math.abs(y - yT) < err){ err = Math.abs(y - yT); mejor = a; } }
  return mejor; }
function perroSale(e){
  const ex = e.g.position.x, ez = e.g.position.z, f = angTo(ex, ez, camera.position.x, camera.position.z);   // sale detrás del enemigo visto desde la cámara y mira a cámara (se le ve la cara y no tapa la imagen)
  const yT = clamp((e.numY || 1.4) * 0.72, 1.0, 2.4) / SAD_ESC, a = sadAngulo(yT), alcance = (SAD_BOCA[1] * Math.sin(a) + SAD_BOCA[2] * Math.cos(a)) * SAD_ESC;
  const x = ex - Math.sin(f) * alcance, z = ez - Math.cos(f) * alcance, g = mkDog();
  g.position.set(x, -6, z); g.rotation.y = f;
  P6.dogs.push({ g, e, x, z, f, a, t: 0, fase: 0, chorro: 0, masca: 0, ya: new Set() });
  ringFx(x, z, 0xd8c8b0, 0.4, 2.6, 0.4); puffAt(x, z, 8, 2.2); play('sadRetumba'); shake = Math.max(shake, 0.12);
}
// chorro de sangre de tebeo desde la boca
function sadChorro(D, n){ const b = D.g.userData.boca; b.getWorldPosition(sadV);
  for (let i = 0; i < n; i++){ const a = rnd() * TAU, v = 1.5 + rnd() * 2.5; spawnFx(sadV.x + Math.sin(a) * 0.3, sadV.y, sadV.z + Math.cos(a) * 0.3, Math.sin(a) * v, 4 + rnd() * 4, Math.cos(a) * v, rnd() < 0.6 ? 0xd8101a : 0xff3a48, 0.08 + rnd() * 0.05, 0.7, 14, 0); } }
function perroTick(dt){
  if (!SAD.proto && lvl('bigdog')) SAD.proto = sadConstruye();   // se esculpe al coger el poder, no en mitad del primer mordisco
  for (let i = P6.dogs.length - 1; i >= 0; i--){ const D = P6.dogs[i], U = D.g.userData, t = (D.t += dt), e = D.e; if (!U.cuello) continue;
    const sm = smooth, k = (a, b) => clamp((t - a) / (b - a), 0, 1);
    // altura: sale de golpe con un rebote y al final se hunde
    D.g.position.y = t < 0.35 ? -6 : t < 0.6 ? lerp(-6, 0.25, 1 - Math.pow(1 - k(0.35, 0.6), 3)) : t < 0.72 ? lerp(0.25, 0, sm(k(0.6, 0.72))) : t < 1.95 ? 0 : lerp(0, -6.5, Math.pow(k(1.95, 2.5), 2));
    // cuello y cabeza: atrás con la boca abierta, se lanza, muerde, zarandea y suelta
    const atras = sm(k(0.6, 0.82)) * (1 - k(0.82, 0.9)), lanza = sm(k(0.82, 0.92)) * (1 - sm(k(1.75, 1.95))), zara = t > 0.95 && t < 1.75 ? Math.sin((t - 0.95) * 22) * (1 - k(1.5, 1.75)) : 0;
    U.cuello.rotation.x = -0.18 * atras + D.a * lanza; U.head.rotation.x = -0.32 * atras + 0.08 * lanza; U.head.rotation.z = 0.24 * zara; U.head.rotation.y = 0.12 * Math.sin((t - 0.95) * 22 + 1) * (zara ? 1 : 0);
    U.jaw.rotation.x = t < 0.6 ? 0.15 : t < 0.88 ? lerp(0.15, 1.05, sm(k(0.6, 0.8))) : t < 0.93 ? lerp(1.05, 0.06, k(0.88, 0.93)) : t < 1.75 ? 0.06 + 0.08 * Math.abs(Math.sin((t - 0.95) * 11)) : lerp(0.14, 0.6, k(1.75, 1.9));
    // si aun así tapa a Tovan (el enemigo estaba entre la cámara y él), se vuelve transparente
    { const cx = camera.position.x, cz = camera.position.z, tx = hero.position.x - cx, tz = hero.position.z - cz, L2 = tx * tx + tz * tz || 1, dx = D.g.position.x - cx, dz = D.g.position.z - cz, q = (dx * tx + dz * tz) / L2;
      fundeObj(D.g, q > 0 && q < 1.05 && Math.abs(dx * tz - dz * tx) / Math.sqrt(L2) < 1.9 && D.g.position.y > -3 ? 0.3 : 1, dt); }
    U.cola.rotation.z = Math.sin(t * 15) * 0.5; U.cola.position.y = t < 0.5 ? lerp(-3, 0, k(0.3, 0.5)) : 0;
    // la salida: rocas, polvo y el golpe de las patas
    if (D.fase === 0 && t >= 0.35){ D.fase = 1; play('sadSale'); shake = Math.max(shake, 0.35);
      for (let j = 0; j < 16; j++){ const a = rnd() * TAU, v = 2 + rnd() * 4; spawnFx(D.x + Math.sin(a) * 0.8, 0.3, D.z + Math.cos(a) * 0.8, Math.sin(a) * v, 4 + rnd() * 5, Math.cos(a) * v, rnd() < 0.5 ? 0x6a5a4a : 0x9a8a78, 0.12 + rnd() * 0.1, 0.8, 16, 0); }
      puffAt(D.x, D.z, 14, 3.2, 0xd8d0c4); ringFx(D.x, D.z, 0xffffff, 0.5, 3.4, 0.35); }
    // el mordisco
    if (D.fase === 1 && t >= 0.92){ D.fase = 2; play('sadMuerde'); shake = Math.max(shake, 0.5); hitStop = Math.max(hitStop, 0.08); sadChorro(D, 18);
      if (e.alive){ hitEnemy(e, rdmg(70), true, 0, 0, 0, 4, false, { src: 'aoe' }); if (e.alive) stunE(e, 1.1); }
      U.boca.getWorldPosition(sadV); ringFx(sadV.x, sadV.z, 0xff3a48, 0.3, 1.6, 0.25); }
    // zarandeo: mordiscos pequeños y más chorros
    if (D.fase === 2 && t < 1.75){ D.chorro -= dt; if (D.chorro <= 0){ D.chorro = 0.16; sadChorro(D, 6); }
      D.masca -= dt; if (D.masca <= 0 && t > 1.1){ D.masca = 0.25; play('sadMastica'); if (e.alive) hitEnemy(e, rdmg(8), false, 0, 0, 0, 0, false, { src: 'aoe' }); } }
    if (D.fase === 2 && t >= 1.95){ D.fase = 3; puffAt(D.x, D.z, 10, 2.4, 0xd8d0c4); play('sadRetumba'); }
    if (t > 2.55){ scene.remove(D.g); P6.dogs.splice(i, 1); } }
}

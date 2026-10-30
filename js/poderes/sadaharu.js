'use strict';
/* ======================================================================
   EL PERRO GIGANTE · SADAHARU (Gintama) · prefijo sad
   Sustituye a la cabeza de icosaedros de mkDog. Como en el anime: un
   perrazo blanco de pelo liso (picos solo en mofletes y pecho), cabeza
   redonda y ancha de hocico muy corto, orejas de punta rosas por dentro,
   ojos grandes con brillos, cejas en espiral marrones, naricilla marrón y
   boca en «w», collar granate, contorno de dibujo, patas delanteras con
   dedos y la cola enroscada asomando del suelo un poco más atrás.
   El ataque (perroSale / perroTick, desde js/poderes/anime/mecanicas.js):
   el suelo se agrieta, sale de golpe frente a Tovan (se le ve la cara),
   echa la cabeza atrás con la boca abierta, se lanza y muerde al enemigo
   por la cabeza, lo zarandea con el chorro de sangre de la serie y se
   vuelve a hundir moviendo la cola. Sin rótulos.
   Cada pieza es una sola malla esculpida: formas fundidas con funciones
   de distancia (sadCuerpoSDF, sadCabezaSDF…) y una superficie sacada por
   surface nets (sadMalla); el pelo estira la propia malla (sadPelaje) y
   los colores (boca, interior de las orejas) van en los vértices; ojos,
   cejas y hocico son calcomanías pegadas a la superficie (sadCalco), y
   una textura de mechoncitos (sadPintaPelo, proyección cilíndrica por
   pieza) lo hace esponjoso.
   Se construye una vez, al coger el poder (con su propio PRNG), y se clona.
   ====================================================================== */
const SAD = { proto: null, mats: null };
const SAD_ESC = 0.7;                       // tamaño (a 1 mide unos 4,8 m hasta la punta de las orejas; así, unos 3,4 m)
const SAD_PIVOTE = [0, 2.3, 0];            // cuello: donde gira la cabeza al lanzarse
const SAD_BOCA = [0, 0.36, 1.12];           // centro de la boca en el marco de la cabeza
const SAD_CABEZA = 1.25;                   // la cabeza, más grande que el cuerpo (como en el anime)

/* ---------- Modelo ---------- */
function sadMats(){ if (SAD.mats) return SAD.mats;
  const vc = (e, o) => makeMat(0xffffff, Object.assign({ vc: true, emissive: e }, o || {}));
  const T = sadTexturas(), cara = (map, e) => makeMat(0xffffff, { map, emissive: e || 0.55 });
  return (SAD.mats = { pelo: vc(0.3, { map: T.pelo }), collar: vc(0.3), linea: makeMat(0x3a3246, { emissive: 1, side: THREE.BackSide }), diente: makeMat(0xfbf8ee, { emissive: 0.55 }), ojo: cara(T.ojo, 0.85), ceja: cara(T.ceja), hocico: cara(T.hocico) }); }
// pelo blanco con la sombra lila de los dibujos (corte casi de cel) y un toque cálido arriba
const sadPelo = N => { const k = clamp((-N.y + 0.02) / 0.45, 0, 1), c = vehMezcla([1, 0.99, 0.97], [0.54, 0.54, 0.76], k * 0.85); return vehMezcla(c, [1.04, 1.0, 0.95], clamp((N.y - 0.6) / 0.4, 0, 1) * 0.5); };
const sadRosa = N => { const k = clamp(-N.y, 0, 1); return vehMezcla([1, 0.58, 0.66], [0.7, 0.32, 0.45], k * 0.6); };
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
function sadPelaje(g, grupos, R, pinta, cil){
  const p = g.attributes.position, nr = g.attributes.normal, n = p.count, a = new THREE.Vector3(), b = new THREE.Vector3(), m = [];
  for (const G of grupos){ let k = 0, tries = 0;
    while (k < G.n && tries++ < G.n * 80){ const i = Math.floor(R() * n); a.fromBufferAttribute(p, i); b.fromBufferAttribute(nr, i); if (!G.filtro(a, b)) continue;
      if (m.some(q => q.c.distanceTo(a) < G.R * 0.7)) continue;
      m.push({ c: a.clone(), n: b.clone(), dir: b.clone().add(typeof G.peine === 'function' ? G.peine(a) : G.peine).normalize(), l: G.largo * (0.7 + R() * 0.6), R: G.R * (0.8 + R() * 0.4) }); k++; } }
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++){ a.fromBufferAttribute(p, i); b.fromBufferAttribute(nr, i); let mejor = null, pm = 0;
    for (const q of m){ const d = q.c.distanceTo(a); if (d < q.R && b.dot(q.n) > 0.2){ const v = Math.pow(1 - d / q.R, 1.6); if (v > pm){ pm = v; mejor = q; } } }
    if (mejor){ a.addScaledVector(mejor.dir, mejor.l * pm); p.setXYZ(i, a.x, a.y, a.z); } w[i] = pm; }
  g.computeVertexNormals(); const col = [], lis = [];
  for (let i = 0; i < n; i++){ a.fromBufferAttribute(p, i); b.fromBufferAttribute(nr, i); const c = pinta(a, b, w[i]); col.push(c[0], c[1], c[2]); lis.push(c[3] ? 1 : 0); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('liso', new THREE.Float32BufferAttribute(lis, 1));
  // textura de pelo: proyección cilíndrica alrededor del eje de la pieza (cil = [cx, cz, y0, vueltas, alto]); se arregla la costura triángulo a triángulo
  const gn = g.toNonIndexed(), P = gn.attributes.position, Li = gn.attributes.liso, uv = new Float32Array(P.count * 2), [cx, cz, y0, K, H] = cil;
  for (let t = 0; t < P.count; t += 3){ const us = [];
    for (let k = 0; k < 3; k++){ a.fromBufferAttribute(P, t + k); us.push((Math.atan2(a.x - cx, a.z - cz) / TAU + 0.5) * K); uv[(t + k) * 2 + 1] = (a.y - y0) / H; }
    if (Math.max(...us) - Math.min(...us) > K / 2) for (let k = 0; k < 3; k++) if (us[k] < K / 2) us[k] += K;
    for (let k = 0; k < 3; k++){ uv[(t + k) * 2] = us[k]; if (Li.getX(t + k)) { uv[(t + k) * 2] = 0.02; uv[(t + k) * 2 + 1] = 0.98; } } }
  gn.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); gn.deleteAttribute('liso'); return gn;
}
// la textura de pelo: mechoncitos finos peinados hacia abajo (lila en sombra y blancos de brillo), repetible por los cuatro lados;
// el rincón de arriba a la izquierda queda limpio para la boca y el interior de las orejas
function sadPintaPelo(g){ const R = mulberry32(2004), W = 128; g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, W); g.lineCap = 'round';
  const trazo = (x, y, l, a, cur, col, ancho) => { for (const ox of [-W, 0, W]) for (const oy of [-W, 0, W]){ const X = x + ox, Y = y + oy; if (X < -20 || X > W + 20 || Y < -20 || Y > W + 20) continue;
      g.strokeStyle = col; g.lineWidth = ancho; g.beginPath(); g.moveTo(X, Y); g.quadraticCurveTo(X + Math.sin(a) * l * 0.5 + cur, Y + Math.cos(a) * l * 0.5, X + Math.sin(a) * l, Y + Math.cos(a) * l); g.stroke(); } };
  for (let i = 0; i < 26; i++){ const x = R() * W, y = R() * W, gr = g.createRadialGradient(x, y, 1, x, y, 14); gr.addColorStop(0, 'rgba(176,170,214,0.22)'); gr.addColorStop(1, 'rgba(176,170,214,0)'); g.fillStyle = gr; g.fillRect(x - 14, y - 14, 28, 28); }   // matas
  for (let i = 0; i < 420; i++){ const x = R() * W, y = R() * W, l = 6 + R() * 10, a = (R() - 0.5) * 0.7, cur = (R() - 0.5) * 4;
    trazo(x, y, l, a, cur, `rgba(${150 + R() * 30 | 0},${146 + R() * 26 | 0},${196 + R() * 20 | 0},${0.28 + R() * 0.2})`, 1 + R() * 0.8);
    if (R() < 0.6) trazo(x + 1.2, y - 0.5, l * 0.8, a, cur, 'rgba(255,255,255,0.85)', 1); }
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 10, 10); }
const sadPeloW = (N, w) => { const c = sadPelo(N), k = 0.88 + 0.12 * Math.min(1, w * 2.5); return [c[0] * k, c[1] * k, c[2] * k]; };

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
// cabeza (marco del cuello), como en el anime: cráneo redondo y ancho, mofletes, hocico muy corto con la naricilla, orejas de punta fundidas;
// la boca es una cavidad tallada por debajo y las orejas, un cuenco por delante
const sadNariz = (x, y, z) => sdElip(x, y, z, 0, 0.74, 1.2, 0.11, 0.075, 0.06);
const sadCavidad = (x, y, z) => sdElip(x, y, z, 0, 0.3, 0.88, 0.4, 0.14, 0.42);
const sadOreja = (ax, y, z) => sdCono(ax, y, (z - 0.2) * 2.4 + 0.2, 0.55, 1.45, 0.2, 0.92, 2.35, 0.12, 0.32, 0.04) * 0.6;
const sadOrejaIn = (ax, y, z) => sdCono(ax, y, (z - 0.33) * 3.2 + 0.2, 0.6, 1.62, 0.2, 0.88, 2.2, 0.2, 0.19, 0.02) * 0.45;
function sadCabezaSDF(x, y, z){ const ax = Math.abs(x);
  let d = sdElip(x, y, z, 0, 0.9, 0.3, 1.0, 0.9, 0.9);
  d = sadMin(d, sdElip(ax, y, z, 0.5, 0.55, 0.55, 0.55, 0.45, 0.48), 0.35);                     // mofletes
  d = sadMin(d, sdElip(x, y, z, 0, 0.58, 0.92, 0.4, 0.3, 0.36), 0.3);                           // hocico corto
  d = sadMin(d, sadNariz(x, y, z), 0.05);
  d = sadMin(d, sadOreja(ax, y, z), 0.2);
  d = sadMax(d, -sadOrejaIn(ax, y, z), 0.04);
  return sadMax(d, -sadCavidad(x, y, z), 0.04); }
function sadCabezaColor(p, N, w){ const ax = Math.abs(p.x);
  const cav = sadCavidad(p.x, p.y, p.z); if (Math.abs(cav) < 0.04 && N.y < 0.3) return [...(p.z > 0.65 ? vehMezcla([0.95, 0.5, 0.6], [0.6, 0.16, 0.24], clamp((1.15 - p.z) / 0.5, 0, 1)) : [0.3, 0.04, 0.08]), 1];
  if (Math.abs(sadOrejaIn(ax, p.y, p.z)) < 0.055 && N.z > 0.0) return [...sadRosa(N), 1];
  return sadPeloW(N, w); }
// mandíbula (marco de la mandíbula): el suelo de la boca tallado y la lengua encima
const sadSuelo = (x, y, z) => sdElip(x, y, z, 0, 0.06, 0.3, 0.3, 0.09, 0.34), sadLengua = (x, y, z) => sdElip(x, y, z, 0, 0.0, 0.32, 0.22, 0.05, 0.27);
function sadMandSDF(x, y, z){ let d = sdElip(x, y, z, 0, -0.08, 0.32, 0.38, 0.15, 0.4); d = sadMax(d, -sadSuelo(x, y, z), 0.03); return sadMin(d, sadLengua(x, y, z), 0.04); }
function sadMandColor(p, N, w){ if (sadLengua(p.x, p.y, p.z) < 0.03) return [1, 0.55, 0.62, 1]; if (Math.abs(sadSuelo(p.x, p.y, p.z)) < 0.03 && N.y > 0) return [0.38, 0.05, 0.1, 1]; return sadPeloW(N, w); }
// cola enroscada: conos fundidos a lo largo de la curva
const SAD_COLA = [[0, -0.3, 0, 0.3], [0, 0.85, 0.12, 0.28], [0, 1.4, -0.08, 0.26], [0, 1.68, -0.5, 0.22], [0, 1.55, -0.88, 0.16]];
function sadColaSDF(x, y, z){ let d = 1e9; for (let i = 0; i < SAD_COLA.length - 1; i++){ const a = SAD_COLA[i], b = SAD_COLA[i + 1]; d = sadMin(d, sdCono(x, y, z, a[0], a[1], a[2], b[0], b[1], b[2], a[3], b[3]), 0.15); } return d; }
// gradiente (normal) de una función de distancia
function sadGrad(f, x, y, z, v){ const e = 0.004; return v.set(f(x + e, y, z) - f(x - e, y, z), f(x, y + e, z) - f(x, y - e, z), f(x, y, z + e) - f(x, y, z - e)).normalize(); }
// punto de la superficie de la cabeza delante de (x, y), mirando desde +z
function sadSuperficie(x, y){ for (let z = 2.2; z > 0; z -= 0.005) if (sadCabezaSDF(x, y, z) < 0) return z; return 1; }
// calcomanía pegada a la superficie: una rejilla centrada en el punto de la cara delante de (x, y), de semiancho hw y semialto hh,
// proyectada sobre la superficie y separada un pelo (sin solaparse ni flotar). espejo = la textura dada la vuelta (la ceja izquierda)
function sadCalco(f, x, y, hw, hh, mat, parent, espejo){
  const c = new THREE.Vector3(x, y, sadSuperficie(x, y)), n = sadGrad(f, c.x, c.y, c.z, new THREE.Vector3()), der = new THREE.Vector3(0, 1, 0).cross(n).normalize(), arr = new THREE.Vector3().crossVectors(n, der);
  const N = 8, pos = [], nor = [], uv = [], idx = [], p = new THREE.Vector3(), g = new THREE.Vector3();
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++){ const u = i / N * 2 - 1, v = j / N * 2 - 1;
    p.copy(c).addScaledVector(der, u * hw).addScaledVector(arr, v * hh);
    for (let k = 0; k < 4; k++){ sadGrad(f, p.x, p.y, p.z, g); p.addScaledVector(g, -f(p.x, p.y, p.z)); }
    sadGrad(f, p.x, p.y, p.z, g); p.addScaledVector(g, 0.008); pos.push(p.x, p.y, p.z); nor.push(g.x, g.y, g.z); uv.push(espejo ? 1 - i / N : i / N, j / N); }
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++){ const a = j * (N + 1) + i, b = a + 1, cc = a + N + 1, d = cc + 1; idx.push(a, b, d, a, d, cc); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  return mesh(geo, mat, 0, 0, 0, parent);
}
// la cara del dibujo: ojos grandes con brillos, cejas en espiral marrones, naricilla marrón y boca en «w»
const sadLienzo = (w, h, pinta) => vehLienzoTex(w, h, pinta);
let SAD_TEX = null;
function sadTexturas(){ if (SAD_TEX) return SAD_TEX;
  const pelo = new THREE.CanvasTexture(foilLienzo(128, 128, sadPintaPelo)); pelo.wrapS = pelo.wrapT = THREE.RepeatWrapping;
  return (SAD_TEX = { pelo,
    ojo: sadLienzo(64, 64, g => { const gr = g.createRadialGradient(32, 40, 4, 32, 34, 30); gr.addColorStop(0, '#585868'); gr.addColorStop(0.5, '#26262e'); gr.addColorStop(1, '#0c0c10');
      g.fillStyle = '#121216'; g.beginPath(); g.arc(32, 32, 31, 0, TAU); g.fill(); g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 28, 0, TAU); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(41, 20, 10, 9, -0.4, 0, TAU); g.fill(); g.beginPath(); g.arc(22, 42, 4.5, 0, TAU); g.fill(); }),
    ceja: sadLienzo(64, 32, g => { g.strokeStyle = '#8a6448'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath();
      for (let k = 0; k <= 40; k++){ const t = k / 40, a = Math.PI * 0.5 + t * Math.PI * 1.7, r = 3 + t * 8; g.lineTo(18 + Math.cos(a) * r, 17 - Math.sin(a) * r); }   // la espiral
      g.quadraticCurveTo(38, 4, 58, 14); g.stroke(); }),
    hocico: sadLienzo(64, 64, g => { g.fillStyle = '#7a4c44'; g.beginPath(); g.moveTo(20, 12); g.quadraticCurveTo(32, 6, 44, 12); g.quadraticCurveTo(44, 22, 32, 28); g.quadraticCurveTo(20, 22, 20, 12); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.7)'; g.beginPath(); g.ellipse(28, 13, 4, 2.2, -0.2, 0, TAU); g.fill();
      g.strokeStyle = '#5a3832'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(32, 28); g.lineTo(32, 38); g.quadraticCurveTo(26, 46, 18, 38); g.moveTo(32, 38); g.quadraticCurveTo(38, 46, 46, 38); g.stroke(); }) }); }
// contorno de dibujo: la misma malla hinchada un poco y vista por dentro
function sadContorno(geo, grosor, mat, parent){ const g = geo.clone(), p = g.attributes.position, n = g.attributes.normal;
  for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + n.getX(i) * grosor, p.getY(i) + n.getY(i) * grosor, p.getZ(i) + n.getZ(i) * grosor);
  g.deleteAttribute('color'); return mesh(g, mat, 0, 0, 0, parent); }
// cono (para los dientes)
function sadDiente(parent, mat, x, y, z, dir, largo, radio){
  const geo = new THREE.ConeGeometry(radio, largo, 5); geo.translate(0, largo / 2, 0);
  const m = mesh(geo, mat, x, y, z, parent); m.quaternion.setFromUnitVectors(sadY, sadV.copy(dir).normalize()); return m;
}
function sadConstruye(){
  const M = sadMats(), T = sadTexturas(), R = mulberry32(2003), V = (x, y, z) => new THREE.Vector3(x, y, z), L = 0.028;   // L = grosor del contorno
  const raiz = new THREE.Group(), cuerpo = new THREE.Group(), cuello = new THREE.Group(), cabeza = new THREE.Group(), mand = new THREE.Group(), cola = new THREE.Group();
  cuello.position.set(...SAD_PIVOTE); cuello.add(cabeza); raiz.add(cuello); cabeza.scale.setScalar(SAD_CABEZA);
  // cuerpo de una pieza: pelo liso con unos picos en el pecho, los costados y detrás de las patas
  const gc = sadPelaje(sadMalla(sadCuerpoSDF, [-1.9, -0.75, -1.55], [1.9, 2.95, 2.0], 0.085), [
    { n: 18, filtro: (p, n) => n.z > 0.35 && p.y > 1.0 && p.y < 2.2 && Math.abs(p.x) < 0.75, peine: V(0, -1.2, 0.25), largo: 0.24, R: 0.15 }], R, (p, n, w) => sadPeloW(n, w), [0, -0.1, -0.5, 12, 0.6]);
  const cu = new THREE.Group(); mesh(gc, M.pelo, 0, 0, 0, cu); sadContorno(gc, L, M.linea, cu); mpFusiona(cu, cuerpo); raiz.add(cuerpo);
  // collar granate al pie de la cabeza (tapa dónde entra el cuello)
  const collar = mesh(new THREE.TorusGeometry(0.84, 0.085, 8, 36), M.collar, 0, 0.02, 0.18, cuello); collar.rotation.x = Math.PI / 2 + 0.38; vehColorea(collar, vehLaca([0.42, 0.09, 0.09], [0.8, 0.4, 0.38], [0.5, 0.2, 0.22], 0.6));
  // cabeza de una pieza: mofletes con picos hacia fuera, nuca y la base de las orejas
  const cab = new THREE.Group();
  const gh = sadPelaje(sadMalla(sadCabezaSDF, [-1.3, -0.2, -0.65], [1.3, 2.5, 1.4], 0.056), [
    { n: 18, filtro: (p, n) => (Math.abs(p.x) > 0.66 || (Math.abs(p.x) > 0.45 && p.y < 0.45)) && p.y < 0.85 && p.z > -0.3 && n.y < 0.4, peine: p => V(0.5 * Math.sign(p.x), -0.7, -0.1), largo: 0.2, R: 0.16 },
    { n: 6, filtro: (p, n) => p.z < -0.25 && p.y > 0.2, peine: V(0, -0.6, -0.5), largo: 0.15, R: 0.18 },
    { n: 2, filtro: (p, n) => p.y > 1.72 && Math.abs(p.x) < 0.2, peine: V(0, 0.3, -0.6), largo: 0.12, R: 0.16 },
    { n: 6, filtro: (p, n) => Math.abs(p.x) > 0.35 && Math.abs(p.x) < 0.75 && p.y > 1.3 && p.y < 1.6 && p.z > -0.2 && p.z < 0.15, peine: p => V(0.3 * Math.sign(p.x), 1, -0.2), largo: 0.14, R: 0.15 }], R, sadCabezaColor, [0, 0.3, 0, 9, 0.6]);
  mesh(gh, M.pelo, 0, 0, 0, cab); sadContorno(gh, L, M.linea, cab);
  // la cara: ojos, cejas y hocico, pegados a la superficie
  for (const s of [-1, 1]){ sadCalco(sadCabezaSDF, 0.37 * s, 0.97, 0.19, 0.21, M.ojo, cab); sadCalco(sadCabezaSDF, 0.38 * s, 1.35, 0.2, 0.1, M.ceja, cab, s < 0); }
  sadCalco(sadCabezaSDF, 0, 0.62, 0.2, 0.2, M.hocico, cab);
  // colmillos de arriba
  for (const s of [-1, 1]) sadDiente(cab, M.diente, 0.22 * s, 0.4, 1.1, V(0, -1, 0.1), 0.18, 0.05);
  for (const x of [-0.1, -0.035, 0.035, 0.1]) sadDiente(cab, M.diente, x, 0.4, 1.17, V(0, -1, 0.05), 0.08, 0.025);
  mpFusiona(cab, cabeza);
  // mandíbula: pivote bajo el hocico (rotation.x > 0 abre)
  mand.position.set(0, 0.3, 0.62); cabeza.add(mand); const mj = new THREE.Group();
  const gm = sadPelaje(sadMalla(sadMandSDF, [-0.55, -0.35, -0.2], [0.55, 0.22, 0.85], 0.03), [{ n: 4, filtro: (p, n) => n.y < -0.5, peine: V(0, -0.8, -0.2), largo: 0.1, R: 0.12 }], R, sadMandColor, [0, 0.3, -0.4, 3, 0.4]);
  mesh(gm, M.pelo, 0, 0, 0, mj); sadContorno(gm, L * 0.7, M.linea, mj);
  for (const s of [-1, 1]) sadDiente(mj, M.diente, 0.2 * s, 0.02, 0.62, V(0, 1, 0.1), 0.16, 0.045);
  mpFusiona(mj, mand);
  // la cola enroscada, asomando del suelo detrás
  cola.position.set(0, 0, -2.3); raiz.add(cola); const cl = new THREE.Group();
  const gt = sadPelaje(sadMalla(sadColaSDF, [-0.6, -0.5, -1.35], [0.6, 2.15, 0.55], 0.075), [{ n: 10, filtro: () => true, peine: V(0, 0.2, -0.6), largo: 0.14, R: 0.16 }], R, (p, n, w) => sadPeloW(n, w), [0, -0.3, 0, 4, 0.5]);
  mesh(gt, M.pelo, 0, 0, 0, cl); sadContorno(gt, L, M.linea, cl); mpFusiona(cl, cola);
  // el marcador de la boca, para colocar el mordisco
  const boca = new THREE.Object3D(); boca.position.set(...SAD_BOCA).multiplyScalar(SAD_CABEZA); cuello.add(boca);
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
  for (let a = 0.2; a <= 1.15; a += 0.025){ const y = SAD_PIVOTE[1] + (SAD_BOCA[1] * Math.cos(a) - SAD_BOCA[2] * Math.sin(a)) * SAD_CABEZA; if (Math.abs(y - yT) < err){ err = Math.abs(y - yT); mejor = a; } }
  return mejor; }
function perroSale(e){
  const ex = e.g.position.x, ez = e.g.position.z, f = angTo(ex, ez, camera.position.x, camera.position.z);   // sale detrás del enemigo visto desde la cámara y mira a cámara (se le ve la cara y no tapa la imagen)
  const yT = clamp((e.numY || 1.4) * 0.72, 1.0, 2.4) / SAD_ESC, a = sadAngulo(yT), alcance = (SAD_BOCA[1] * Math.sin(a) + SAD_BOCA[2] * Math.cos(a)) * SAD_CABEZA * SAD_ESC;
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
    U.jaw.rotation.x = t < 0.6 ? 0.03 : t < 0.88 ? lerp(0.03, 1.05, sm(k(0.6, 0.8))) : t < 0.93 ? lerp(1.05, 0.06, k(0.88, 0.93)) : t < 1.75 ? 0.06 + 0.08 * Math.abs(Math.sin((t - 0.95) * 11)) : lerp(0.14, 0.6, k(1.75, 1.9));
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

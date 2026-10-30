'use strict';
/* ======================================================================
   VEHÍCULOS · prefijo veh
   La moto roja (vehMoto), copiada de la réplica de la moto de Kaneda:
   carenado delantero en cuña sobre la rueda, con la cúpula grande y las
   pegatinas; quilla roja baja con cajas laterales y tapones cromados,
   asiento marrón con respaldo, colín por paneles sobre la rueda de atrás,
   neumáticos muy gordos y tapacubos rojos abombados (el de delante, con
   pegatinas). Las letras de las pegatinas son garabatos, sin marcas.
   La carrocería son superficies por secciones (vehPieza + vehSup:
   superelipses a lo largo de z) y el brillo de la laca va horneado en los
   colores de los vértices, porque el shader PS1 no tiene brillo especular.
   Los lienzos se pintan al construir la primera moto, con mulberry32.
   ====================================================================== */
const vehLienzoTex = (w, h, pinta) => { const t = new THREE.CanvasTexture(foilLienzo(w, h, pinta)); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; };
const vehBrillo = foilSprite(foilLienzo(64, 64, g => { const gr = g.createRadialGradient(32, 32, 1, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,250,220,0.7)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), true);
function vehLuz(parent, x, y, z, col, s){ const m = vehBrillo.clone(); m.color = new THREE.Color(col); const sp = new THREE.Sprite(m); sp.position.set(x, y, z); sp.scale.setScalar(s); sp.renderOrder = 6; parent.add(sp); return sp; }

/* ---------- Superficies por secciones ---------- */
// interpolación cúbica monótona (no se pasa de los puntos): P = [[x, y], …] ordenados por x
function vehCurva(P){
  const n = P.length, d = [], m = [];
  for (let i = 0; i < n - 1; i++) d.push((P[i + 1][1] - P[i][1]) / (P[i + 1][0] - P[i][0]));
  m[0] = d[0]; m[n - 1] = d[n - 2]; for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++){ if (d[i] === 0){ m[i] = m[i + 1] = 0; continue; } const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b; if (s > 9){ const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; } }
  return x => { if (x <= P[0][0]) return P[0][1]; if (x >= P[n - 1][0]) return P[n - 1][1]; let i = 0; while (x > P[i + 1][0]) i++;
    const h = P[i + 1][0] - P[i][0], t = (x - P[i][0]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * P[i][1] + (t3 - 2 * t2 + t) * h * m[i] + (3 * t2 - 2 * t3) * P[i + 1][1] + (t3 - t2) * h * m[i + 1]; };
}
// una pieza: estaciones [z, yAbajo, yArriba, semiancho]; la sección es una superelipse (n alto = más cuadrada) que se estrecha arriba (pin).
// Los extremos se redondean con o.A (atrás) y o.D (delante) = { L, modo }: 'abajo' baja el techo hasta el filo de abajo (morro de casco), 'centro' lo encoge hacia el centro.
function vehPieza(E, o = {}){
  E = E.slice().sort((a, b) => a[0] - b[0]);
  const fb = vehCurva(E.map(e => [e[0], e[1]])), ft = vehCurva(E.map(e => [e[0], e[2]])), fw = vehCurva(E.map(e => [e[0], e[3]])), ex = 2 / (o.n || 3), pin = o.pin == null ? 0.18 : o.pin;
  const pz = { z0: E[0][0], z1: E[E.length - 1][0] };
  pz.sec = z => { let yb = fb(z), yt = ft(z), hw = fw(z), k = 1, C = null;
    if (o.D && z > pz.z1 - o.D.L){ C = o.D; k = Math.sqrt(Math.max(0, 1 - ((z - pz.z1 + C.L) / C.L) ** 2)); }
    else if (o.A && z < pz.z0 + o.A.L){ C = o.A; k = Math.sqrt(Math.max(0, 1 - ((pz.z0 + C.L - z) / C.L) ** 2)); }
    if (C){ if (C.modo === 'abajo'){ hw *= Math.pow(k, 0.55); yt = yb + (yt - yb) * k; } else { const c = (yb + yt) / 2, h = (yt - yb) / 2 * Math.pow(k, 0.8); hw *= Math.pow(k, 0.8); yb = c - h; yt = c + h; } }
    return [yb, yt, hw]; };
  pz.P = (z, a, v) => { const [yb, yt, hw] = pz.sec(z), c = Math.cos(a), s = Math.sin(a);
    return v.set(hw * Math.sign(c) * Math.pow(Math.abs(c), ex) * (1 - pin * Math.max(0, s)), (yb + yt) / 2 + (yt - yb) / 2 * Math.sign(s) * Math.pow(Math.abs(s), ex), z); };
  return pz;
}
// malla de un trozo de superficie: z de z0 a z1 (nz trozos; o.cos = más denso en los extremos) y a de a0 a a1 (na trozos; a = 0 el costado derecho, π/2 arriba).
// o.off(z, a) = separación hacia fuera (pegatinas, cúpula); o.uv(z, a, P) → [u, v]; o.pinta(N, P) → [r, g, b] (colores por vértice)
const vehV = [0, 1, 2, 3, 4].map(() => new THREE.Vector3());
function vehSup(pz, z0, z1, a0, a1, nz, na, o = {}){
  const pos = [], nor = [], uvs = [], col = [], idx = [], [P, N, d1, d2, Q] = vehV, e = 1e-3, mid = (pz.z0 + pz.z1) / 2;
  for (let i = 0; i <= nz; i++){ let t = i / nz; if (o.cos) t = lerp(t, 0.5 - 0.5 * Math.cos(Math.PI * t), o.cos); const z = lerp(z0, z1, t);
    for (let j = 0; j <= na; j++){ const a = lerp(a0, a1, j / na);
      pz.P(z, a + e, d1).sub(pz.P(z, a - e, Q)); pz.P(z + e, a, d2).sub(pz.P(z - e, a, Q)); N.crossVectors(d1, d2);
      if (N.lengthSq() < 1e-14) N.set(0, 0, z > mid ? 1 : -1); else N.normalize();
      pz.P(z, a, P); if (o.off) P.addScaledVector(N, o.off(z, a));
      pos.push(P.x, P.y, P.z); nor.push(N.x, N.y, N.z); uvs.push(...(o.uv ? o.uv(z, a, P) : [t, j / na]));
      if (o.pinta) col.push(...o.pinta(N, P)); } }
  const flip = (a1 < a0) !== (z1 < z0), W = na + 1;
  for (let i = 0; i < nz; i++) for (let j = 0; j < na; j++){ const A = i * W + j, B = A + 1, C = A + W, D = C + 1; if (flip) idx.push(A, C, B, B, C, D); else idx.push(A, B, C, B, D, C); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  if (o.pinta) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); return g;
}
// tapa plana en un extremo (cara de atrás del carenado)
function vehTapa(pz, z, na, haciaDelante, pinta){
  const [yb, yt] = pz.sec(z), P = vehV[0], pos = [0, (yb + yt) / 2, z], idx = [], s = haciaDelante ? 1 : -1;
  for (let j = 0; j <= na; j++){ pz.P(z, j / na * TAU, P); pos.push(P.x, P.y, P.z); if (j) idx.push(...(haciaDelante ? [0, j, j + 1] : [0, j + 1, j])); }
  const g = new THREE.BufferGeometry(), n = pos.length / 3; g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(n).fill(0).flatMap(() => [0, 0, s]), 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(n * 2).fill(0), 2));
  if (pinta){ const c = pinta(new THREE.Vector3(0, 0, s)); g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(n).fill(0).flatMap(() => c), 3)); }
  g.setIndex(idx.slice(0, na * 3)); return g;
}
// colores por vértice de una malla ya colocada (normales en el marco de la moto)
function vehColorea(m, pinta){
  m.updateMatrix(); const g = m.geometry.clone(), nm = new THREE.Matrix3().getNormalMatrix(m.matrix), n = g.attributes.normal, N = vehV[1], P = vehV[0], c = [];
  for (let i = 0; i < n.count; i++){ N.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(); P.fromBufferAttribute(g.attributes.position, i).applyMatrix4(m.matrix); c.push(...pinta(N, P)); }
  g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); m.geometry = g; return m;
}

/* ---------- Brillos horneados ---------- */
const vehGauss = (x, c, w) => Math.exp(-(((x - c) / w) ** 2));
const vehMezcla = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
// laca: oscura por debajo, una línea oscura de horizonte y el reflejo del estudio en el canto de arriba
function vehLaca(base, brillo, cielo, fuerza = 1){ return N => { const ny = N.y, sub = ny < 0 ? 0.42 + 0.58 * (1 + ny) : 1;
  let c = base.map(v => v * sub * (1 - 0.32 * vehGauss(ny, 0.3, 0.09)));
  c = vehMezcla(c, cielo, 0.4 * clamp((ny - 0.8) / 0.2, 0, 1)); return vehMezcla(c, brillo, 0.85 * fuerza * vehGauss(ny, 0.62, 0.1)); }; }
// cromo: cielo arriba, horizonte negro y suelo cálido abajo
const vehCromo = N => { const ny = N.y; return ny > 0.08 ? vehMezcla([0.62, 0.66, 0.74], [1.0, 1.0, 1.06], clamp(ny, 0, 1)) : ny > -0.12 ? [0.1, 0.1, 0.12] : vehMezcla([0.5, 0.44, 0.4], [0.3, 0.27, 0.26], clamp(-ny, 0, 1)); };
// goma: brillo apagado en los hombros del neumático (simétrico al girar)
const vehGoma = N => { const k = vehGauss(Math.abs(N.x), 0.62, 0.16); return [0.075 + 0.16 * k, 0.075 + 0.16 * k, 0.085 + 0.18 * k]; };
// tapacubos: el reflejo es un aro (no cambia al girar la rueda)
function vehCupula(base, brillo){ return N => { const r = Math.hypot(N.y, N.z); let c = base.map(v => v * (0.8 + 0.2 * Math.abs(N.x)) * (1 - 0.4 * clamp((r - 0.5) / 0.1, 0, 1)));
  return vehMezcla(c, brillo, 0.8 * vehGauss(r, 0.33, 0.07) + 0.25 * vehGauss(r, 0.05, 0.08)); }; }
const VEH_ROJO = [0.8, 0.04, 0.055], VEH_ROJO_BR = [1.0, 0.66, 0.62], VEH_ROJO_CI = [0.95, 0.3, 0.36];

/* ---------- Pegatinas ---------- */
// garabatos con forma de letra de palo (no se leen: sin marcas)
const VEH_LETRAS = ['LTB', 'LRM', 'LTMB', 'LTRB', 'LB', 'TC', 'LRB', 'LTM', 'LTRM', 'C', 'TMBR', 'LMRB', 'TRMLB'];
function vehTexto(g, x, y, h, n, col, R){ const w = Math.max(3, Math.round(h * 0.62)), s = Math.max(1, Math.round(h / 5)); g.fillStyle = col;
  for (let i = 0; i < n; i++){ const L = VEH_LETRAS[Math.floor(R() * VEH_LETRAS.length)], X = x + i * (w + s);
    for (const k of L){ if (k === 'L') g.fillRect(X, y, s, h); if (k === 'R') g.fillRect(X + w - s, y, s, h); if (k === 'C') g.fillRect(X + (w - s) / 2 | 0, y, s, h);
      if (k === 'T') g.fillRect(X, y, w, s); if (k === 'M') g.fillRect(X, y + (h - s) / 2 | 0, w, s); if (k === 'B') g.fillRect(X, y + h - s, w, s); } }
  return n * (w + s) - s; }
function vehEstrella(g, x, y, r, col){ g.fillStyle = col; g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.42 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.fill(); }
// el costado del carenado: px = 3,75 mm. derecha: el morro a la izquierda del lienzo; izquierda, al revés (así los garabatos se leen bien en los dos lados)
const VEH_CZ = [0.14, 1.1], VEH_CY = [0.28, 1.0];
function vehPintaLado(der){ return vehLienzoTex(256, 192, g => { const W = 256, H = 192;
  const X = z => (der ? (VEH_CZ[1] - z) : (z - VEH_CZ[0])) / (VEH_CZ[1] - VEH_CZ[0]) * W, Y = y => (VEH_CY[1] - y) / (VEH_CY[1] - VEH_CY[0]) * H;
  const placa = (z, y, w, h, giro, f) => { g.save(); g.translate(X(z), Y(y)); g.rotate(der ? giro : -giro); f(w / 0.00375, h / 0.00375); g.restore(); };
  // la escarapela con la estrella y las barras
  placa(0.88, 0.79, 0.25, 0.085, -0.06, (w, h) => { g.fillStyle = '#f4f4f4'; g.fillRect(-w / 2, -h * 0.32, w, h * 0.64); g.fillStyle = '#c8202c'; g.fillRect(-w / 2, -h * 0.07, w, h * 0.14);
    g.fillStyle = '#1c3a8c'; g.beginPath(); g.arc(0, 0, h / 2, 0, TAU); g.fill(); vehEstrella(g, 0, 0, h * 0.42, '#f4f4f4'); });
  // placa negra con letras blancas
  placa(0.36, 0.82, 0.34, 0.07, -0.26, (w, h) => { g.fillStyle = '#16161a'; g.fillRect(-w / 2, -h / 2, w, h); g.fillStyle = '#f0f0f0'; g.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, 1); g.fillRect(-w / 2 + 2, h / 2 - 3, w - 4, 1);
  });
  // placa blanca con letras rojas
  placa(0.6, 0.69, 0.4, 0.09, -0.2, (w, h) => { g.fillStyle = '#16161a'; g.fillRect(-w / 2 - 1, -h / 2 - 1, w + 2, h + 2); g.fillStyle = '#f6f6f2'; g.fillRect(-w / 2, -h / 2, w, h); });
  // la pegatina redonda verde y blanca
  placa(0.66, 0.6, 0.13, 0.13, 0, (w) => { const r = w / 2; g.fillStyle = '#16161a'; g.beginPath(); g.arc(0, 0, r + 1.5, 0, TAU); g.fill();
    for (let i = 0; i < 4; i++){ g.fillStyle = i % 2 ? '#f4f4f0' : '#1f9a5a'; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, i * Math.PI / 2 - Math.PI / 4, (i + 1) * Math.PI / 2 - Math.PI / 4); g.fill(); }
    g.fillStyle = '#16161a'; g.fillRect(-r, -0.5, 2 * r, 1); });
  // la cápsula
  placa(0.3, 0.5, 0.17, 0.068, -0.3, (w, h) => { const r = h / 2; g.fillStyle = '#16161a'; g.beginPath(); g.arc(-w / 2 + r, 0, r + 1, Math.PI / 2, Math.PI * 1.5); g.arc(w / 2 - r, 0, r + 1, -Math.PI / 2, Math.PI / 2); g.fill();
    g.fillStyle = '#f4f4f0'; g.beginPath(); g.arc(-w / 2 + r, 0, r, Math.PI / 2, Math.PI * 1.5); g.lineTo(0, -r); g.lineTo(0, r); g.fill();
    g.fillStyle = '#d81e28'; g.beginPath(); g.moveTo(0, -r); g.arc(w / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2); g.lineTo(0, r); g.fill(); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(-w / 2 + r, -r + 2, w - 2 * r, 1.5); });
  // las letras van aparte para que no las gire la placa
  const R2 = mulberry32(77);
  g.save(); g.translate(X(0.36), Y(0.82)); g.rotate(der ? -0.26 : 0.26); { const h = 9, n = 7, w = n * (Math.round(h * 0.62) + 1); vehTexto(g, -w / 2, -h / 2, h, n, '#f2f2f2', R2); } g.restore();
  g.save(); g.translate(X(0.6), Y(0.69)); g.rotate(der ? -0.2 : 0.2); { const h = 14, n = 5, w = n * (Math.round(h * 0.62) + 2); vehTexto(g, -w / 2, -h / 2, h, n, '#d81e28', mulberry32(5)); } g.restore();
}); }
// el tapacubos de delante (lienzo = el disco, de lado a lado)
function vehPintaTapa(der){ return vehLienzoTex(128, 128, g => { g.save(); if (!der){ g.translate(128, 0); g.scale(-1, 1); }
  // óvalo amarillo con un garabato rojo
  g.fillStyle = '#16161a'; g.beginPath(); g.ellipse(40, 46, 15, 24, -0.15, 0, TAU); g.fill(); g.fillStyle = '#f2c81e'; g.beginPath(); g.ellipse(40, 46, 13, 22, -0.15, 0, TAU); g.fill();
  g.fillStyle = '#c8202c'; g.fillRect(36, 30, 8, 3); g.fillRect(39, 30, 3, 30); g.fillRect(33, 40, 14, 3); g.fillRect(34, 49, 12, 3); g.fillRect(33, 57, 15, 3); g.fillRect(34, 44, 3, 8); g.fillRect(43, 44, 3, 8);
  // triángulo de colores
  g.fillStyle = '#16161a'; g.beginPath(); g.moveTo(80, 30); g.lineTo(108, 30); g.lineTo(94, 56); g.fill(); g.fillStyle = '#f2c81e'; g.beginPath(); g.moveTo(83, 32); g.lineTo(105, 32); g.lineTo(94, 52); g.fill();
  g.fillStyle = '#1c3a8c'; g.beginPath(); g.moveTo(88, 34); g.lineTo(100, 34); g.lineTo(94, 46); g.fill(); g.fillStyle = '#c8202c'; g.fillRect(92, 37, 4, 3);
  g.restore();
  // placa blanca con borde negro y letras negras abajo (las letras sin espejo)
  g.fillStyle = '#16161a'; g.fillRect(30, 80, 68, 22); g.fillStyle = '#f4f4f0'; g.fillRect(32, 82, 64, 18); g.fillStyle = '#16161a'; g.fillRect(34, 84, 60, 14);
  vehTexto(g, 40, 86, 10, 5, '#f4f4f0', mulberry32(9));
}); }

/* ---------- La moto ---------- */
const VEH_RUEDA = { r: 0.36, ancho: 0.29, disco: 0.235, domo: 0.075 }, VEH_MOTO = { zr: -0.96, zf: 0.98 };   // ruedas: z de los ejes (atrás, delante)
let VEH_MAT = null;
function vehMatsMoto(){ if (VEH_MAT) return VEH_MAT;
  const vc = (e, o = {}) => makeMat(0xffffff, Object.assign({ vc: true, emissive: e }, o));
  VEH_MAT = { laca: vc(0.36), cuero: vc(0.18), goma: vc(0.06), cromo: vc(0.5), tapa: vc(0.3), negro: makeMat(0x141418), mate: vc(0.12),
    cristal: new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.42, depthWrite: false, side: THREE.DoubleSide }), canto: makeMat(0xdceaf8, { emissive: 0.7 }), visera: makeMat(0x0c0c10, { emissive: 0.15 }),
    faro: makeMat(0xfff6dc, { emissive: 1 }), piloto: makeMat(0xff2a34, { emissive: 1 }), oro: vc(0.4),
    ladoD: vc(0.3, { map: vehPintaLado(true) }), ladoI: vc(0.3, { map: vehPintaLado(false) }), tapaD: vc(0.3, { map: vehPintaTapa(true) }), tapaI: vc(0.3, { map: vehPintaTapa(false) }) };
  return VEH_MAT; }
const VEH_BRAZO = vehPieza([[-1.13, 0.27, 0.45, 0.042], [-0.96, 0.22, 0.5, 0.05], [-0.8, 0.26, 0.56, 0.055], [-0.62, 0.32, 0.64, 0.055], [-0.44, 0.36, 0.7, 0.05]], { n: 3.2, pin: 0.1, A: { L: 0.13, modo: 'centro' }, D: { L: 0.08, modo: 'centro' } }), VEH_BRAZO_X = 0.25;   // grande y alargado, en diagonal: sale alto de detrás del asiento y acaba redondo pasado el eje
function vehMoto(){
  const M = vehMatsMoto(), laca = vehLaca(VEH_ROJO, VEH_ROJO_BR, VEH_ROJO_CI), cuero = vehLaca([0.42, 0.26, 0.15], [0.78, 0.6, 0.46], [0.5, 0.36, 0.28], 0.6), grisM = vehLaca([0.2, 0.2, 0.23], [0.55, 0.55, 0.6], [0.3, 0.3, 0.34], 0.7);
  const ZR = VEH_MOTO.zr, ZF = VEH_MOTO.zf, RY = VEH_RUEDA.r;
  const g = new THREE.Group(), piv = new THREE.Group(), src = new THREE.Group(); g.rotation.order = 'YXZ'; g.add(piv); piv.position.z = ZR;   // el pivote del caballito, en la rueda de atrás
  const p = (geo, mat, x = 0, y = 0, z = 0) => mesh(geo, mat, x, y, z - ZR, src);
  // carrocería: carenado delantero en cuña, quilla baja y colín
  const A = vehPieza([[0.02, 0.1, 0.93, 0.25], [0.15, 0.14, 0.935, 0.26], [0.35, 0.3, 0.925, 0.27], [0.55, 0.5, 0.9, 0.27], [0.75, 0.56, 0.87, 0.26], [1.0, 0.56, 0.82, 0.24], [1.24, 0.56, 0.75, 0.21]], { n: 3.6, pin: 0.2, D: { L: 0.26, modo: 'abajo' } });
  const Bq = vehPieza([[-0.62, 0.22, 0.5, 0.18], [-0.48, 0.08, 0.5, 0.2], [-0.2, 0.06, 0.5, 0.2], [0.12, 0.08, 0.52, 0.2]], { n: 3.6, pin: 0.1, A: { L: 0.12, modo: 'centro' } });
  const Cc = vehPieza([[-0.9, 0.8, 0.86, 0.09], [-0.82, 0.75, 0.94, 0.17], [-0.72, 0.7, 1.0, 0.2], [-0.6, 0.66, 1.04, 0.21], [-0.5, 0.5, 1.03, 0.2]], { n: 4.4, pin: 0.2, A: { L: 0.05, modo: 'centro' }, D: { L: 0.05, modo: 'centro' } });   // el colín: alto, detrás del asiento y por delante de la rueda, que va al descubierto por arriba
  p(vehSup(A, 0.02, 1.24, -Math.PI / 2, Math.PI * 1.5, 44, 48, { cos: 0.7, pinta: laca }), M.laca); p(vehTapa(A, 0.02, 48, false, laca), M.laca);
  p(vehSup(Bq, -0.62, 0.12, -Math.PI / 2, Math.PI * 1.5, 24, 40, { cos: 0.5, pinta: laca }), M.laca);
  p(vehSup(Cc, -0.9, -0.5, -Math.PI / 2, Math.PI * 1.5, 24, 48, { cos: 0.7, pinta: laca }), M.laca);
  const hueco = p(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 16), M.negro, 0, 1.035, -0.62); hueco.rotation.x = -0.1;   // el agujero de arriba del colín
  // los amortiguadores, entre el colín y la quilla
  for (const s of [-1, 1]){ p(new THREE.CylinderGeometry(0.022, 0.022, 0.3, 8), M.negro, 0.1 * s, 0.56, -0.6);
    for (let k = 0; k < 4; k++){ const r = p(new THREE.TorusGeometry(0.036, 0.008, 4, 12), M.mate, 0.1 * s, 0.52 + k * 0.04, -0.6); r.rotation.x = Math.PI / 2; vehColorea(r, grisM); } }
  // paneles del colín: una junta oscura y la chapa encima, un poco levantada
  const junta = vehLaca([0.16, 0.01, 0.02], [0.4, 0.2, 0.2], [0.25, 0.08, 0.1], 0.5);
  for (const [a0, a1] of [[-0.42, 0.62], [Math.PI + 0.42, Math.PI - 0.62]]){ const s = Math.sign(a1 - a0), m = 0.05;
    p(vehSup(Cc, -0.76, -0.54, a0 - s * m, a1 + s * m, 10, 12, { off: () => 0.007, pinta: junta }), M.laca);
    p(vehSup(Cc, -0.74, -0.56, a0, a1, 10, 12, { off: () => 0.016, pinta: laca }), M.laca); }
  // cajas bajas a los lados de la quilla (los reposapiés), de una pieza que la abraza
  const Cj = vehPieza([[-0.64, 0.07, 0.34, 0.27], [-0.4, 0.06, 0.36, 0.29], [-0.08, 0.08, 0.3, 0.26]], { n: 4, pin: 0.15, A: { L: 0.1, modo: 'centro' }, D: { L: 0.12, modo: 'centro' } });
  p(vehSup(Cj, -0.64, -0.08, -Math.PI / 2, Math.PI * 1.5, 14, 36, { cos: 0.6, pinta: laca }), M.laca);
  // pegatinas del carenado (se separan 5 mm; v sale de la altura, así no se estiran en la parte que baja)
  const pg = (z, a, P) => [(z - VEH_CZ[0]) / (VEH_CZ[1] - VEH_CZ[0]), (P.y - VEH_CY[0]) / (VEH_CY[1] - VEH_CY[0])], pgD = (z, a, P) => { const q = pg(z, a, P); q[0] = 1 - q[0]; return q; };
  const pegLaca = vehLaca([1, 1, 1], [1.5, 1.5, 1.5], [1.1, 1.1, 1.15], 0.6);
  p(vehSup(A, VEH_CZ[0], VEH_CZ[1], -0.85, 0.95, 30, 22, { off: () => 0.005, uv: pgD, pinta: pegLaca }), M.ladoD);
  p(vehSup(A, VEH_CZ[0], VEH_CZ[1], Math.PI + 0.85, Math.PI - 0.95, 30, 22, { off: () => 0.005, uv: pg, pinta: pegLaca }), M.ladoI);
  // la cúpula: el techo del carenado levantado, más cuanto más atrás
  const cup = (z, a) => 0.014 + 0.2 * Math.pow(clamp((1.04 - z) / 0.94, 0, 1), 1.2) * (0.42 + 0.58 * Math.max(0, Math.sin(a))), reflejo = (N, P) => { const q = P.z + 1.4 * P.y, k = vehGauss(q, 1.96, 0.05) + 0.7 * vehGauss(q, 1.8, 0.025); return vehMezcla([0.16, 0.2, 0.27], [1, 1, 1], clamp(k, 0, 1)); };
  const cris = new THREE.Mesh(vehSup(A, 0.12, 1.04, Math.PI / 2 - 1.22, Math.PI / 2 + 1.22, 20, 22, { off: cup, pinta: reflejo }), M.cristal); cris.position.z = -ZR; cris.renderOrder = 3;
  p(vehSup(A, 0.1, 0.125, Math.PI / 2 - 1.22, Math.PI / 2 + 1.22, 1, 22, { off: cup }), M.canto);
  // el morro: visera negra y el faro
  p(vehSup(A, 1.07, 1.215, 0.25, Math.PI - 0.25, 8, 20, { off: () => 0.004, pinta: grisM }), M.visera);
  p(vehSup(A, 1.11, 1.19, Math.PI / 2 - 0.75, Math.PI / 2 + 0.75, 4, 12, { off: () => 0.008 }), M.faro);
  // la tira de pilotos, alrededor de la cola
  for (const [a0, a1] of [[-0.22, 0.22], [Math.PI - 0.22, Math.PI + 0.22]]) p(vehSup(Cc, -0.89, -0.84, a0, a1, 4, 4, { off: () => 0.005 }), M.piloto);
  // asiento marrón con respaldo
  p(vehSup(vehPieza([[-0.46, 0.49, 0.58, 0.15], [-0.25, 0.49, 0.575, 0.155], [-0.02, 0.49, 0.6, 0.15]], { n: 3, pin: 0.15, A: { L: 0.05, modo: 'centro' }, D: { L: 0.06, modo: 'centro' } }), -0.46, -0.02, -Math.PI / 2, Math.PI * 1.5, 12, 24, { pinta: cuero }), M.cuero);
  const resp = p(roundedBoxGeo(0.3, 0.46, 0.1, 0.4), M.cuero, 0, 0.76, -0.5); resp.rotation.x = -0.32; vehColorea(resp, cuero);
  // cajas laterales con los tapones cromados y la portilla de la quilla
  const tapon = s => { const r = 0.068, h = 0.03, R2 = (r * r + h * h) / (2 * h), q = new THREE.SphereGeometry(R2, 20, 5, 0, TAU, 0, Math.asin(r / R2)); q.rotateZ(-s * Math.PI / 2); q.translate(s * (h - R2), 0, 0); return q; };
  for (const s of [-1, 1]){
    for (const [z, y] of [[-0.24, 0.2], [-0.48, 0.21]]){ vehColorea(p(tapon(s), M.cromo, 0.285 * s, y, z), vehCupula([0.62, 0.64, 0.7], [1.25, 1.25, 1.3]));
      const a = p(new THREE.TorusGeometry(0.072, 0.012, 6, 20), M.negro, 0.285 * s, y, z); a.rotation.y = Math.PI / 2; }
    const pt = p(new THREE.TorusGeometry(0.05, 0.009, 5, 16), M.negro, 0.205 * s, 0.43, -0.12); pt.rotation.y = Math.PI / 2; p(B(0.004, 0.012, 0.09), M.negro, 0.205 * s, 0.43, -0.12);
    // manillar: tetones negros bajo la cúpula
    vehColorea(p(roundedBoxGeo(0.08, 0.05, 0.13, 0.4), M.mate, 0.15 * s, 0.97, 0.07), grisM);
    // brazo de la rueda de atrás: baja en diagonal desde debajo del colín hasta el eje, con un tapón rojo y otro cromado encima del buje
    const brazo = vehSup(VEH_BRAZO, -1.13, -0.44, -Math.PI / 2, Math.PI * 1.5, 20, 24, { pinta: laca }); brazo.translate(VEH_BRAZO_X * s, 0, 0); p(brazo, M.laca);
    p(B(0.004, 0.3, 0.008), M.negro, (VEH_BRAZO_X + 0.057) * s, 0.445, -0.72);
    vehColorea(p(tapon(s).scale(1.6, 1.6, 1.6), M.laca, (VEH_BRAZO_X + 0.048) * s, RY, ZR), vehCupula(VEH_ROJO, VEH_ROJO_BR));
    vehColorea(p(tapon(s).scale(0.6, 0.6, 0.6), M.cromo, (VEH_BRAZO_X + 0.088) * s, RY, ZR), vehCupula([0.62, 0.64, 0.7], [1.25, 1.25, 1.3])); }
  vehColorea(p(roundedBoxGeo(0.2, 0.025, 0.025, 0.4), M.oro, 0, 0.99, 0.13), vehLaca([0.8, 0.6, 0.2], [1.2, 1.1, 0.7], [1, 0.85, 0.5]));
  const cuerpo = new THREE.Group(); mpFusiona(src, cuerpo); piv.add(cuerpo); piv.add(cris);
  // ruedas: neumático gordo y tapacubos rojos abombados (el de delante con pegatinas; el de atrás con botones)
  const R = VEH_RUEDA, perfil = [[0.215, -0.125], [0.27, -0.142], [0.318, -0.138], [0.345, -0.118], [0.358, -0.075], [0.362, 0], [0.358, 0.075], [0.345, 0.118], [0.318, 0.138], [0.27, 0.142], [0.215, 0.125]].map(([r, y]) => new THREE.Vector2(r, y * R.ancho / 0.29));
  const goma = new THREE.LatheGeometry(perfil, 36); goma.rotateZ(Math.PI / 2);
  const rs = (R.disco * R.disco + R.domo * R.domo) / (2 * R.domo), th = Math.asin(R.disco / rs), xBase = R.ancho / 2 - 0.035;
  const cupula = (s, extra = 0) => { const q = new THREE.SphereGeometry(rs + extra, 32, 7, 0, TAU, 0, th); q.rotateZ(-s * Math.PI / 2); q.translate(s * (xBase + R.domo - rs), 0, 0); return q; };
  const ruedas = [ZR, ZF].map((z, i) => { const w = new THREE.Group(), ws = new THREE.Group(); w.position.set(0, RY, z - ZR); piv.add(w);
    vehColorea(mesh(goma, M.goma, 0, 0, 0, ws), vehGoma);
    for (const s of [-1, 1]){ vehColorea(mesh(cupula(s), M.tapa, 0, 0, 0, ws), vehCupula(VEH_ROJO, VEH_ROJO_BR));
      const ar = mesh(new THREE.TorusGeometry(R.disco + 0.004, 0.012, 5, 32), M.negro, s * xBase, 0, 0, ws); ar.rotation.y = Math.PI / 2;
      if (i === 1){ const d = cupula(s, 0.004), pa = d.attributes.position, uv = d.attributes.uv; for (let k = 0; k < pa.count; k++) uv.setXY(k, 0.5 + s * pa.getZ(k) / (2 * R.disco) * -1, 0.5 + pa.getY(k) / (2 * R.disco));
        vehColorea(mesh(d, s > 0 ? M.tapaD : M.tapaI, 0, 0, 0, ws), vehCupula([1, 1, 1], [1.4, 1.4, 1.4])); }
      else for (let k = 0; k < 4; k++){ const a = k / 4 * TAU + 0.4, b = mesh(new THREE.SphereGeometry(0.03, 10, 5, 0, TAU, 0, 1.2), M.tapa, s * (xBase + R.domo - 0.012), Math.sin(a) * 0.14, Math.cos(a) * 0.14, ws); b.rotation.z = -s * Math.PI / 2; vehColorea(b, vehCupula(VEH_ROJO, VEH_ROJO_BR)); } }
    mpFusiona(ws, w); return w; });
  vehLuz(piv, 0, 0.66, 1.25 - ZR, 0xfff2c8, 0.9);
  for (const s of [-1, 1]) vehLuz(piv, 0.11 * s, 0.84, -0.88 - ZR, 0xff3040, 0.35);
  const luces = [-1, 1].map(s => { const o = new THREE.Object3D(); o.position.set(0.11 * s, 0.84, -0.88 - ZR); piv.add(o); return o; });
  return { g, piv, ruedas, luces };
}

/* ---------- La moto de luz (Tron: Legacy) ---------- */
// Carrocería negra brillante de una pieza que tapa la mitad de arriba de las dos ruedas, sillín hundido en medio, morro y cola
// en punta, una línea de neón por los costados y por encima de los guardabarros, y ruedas sin buje: neumático gordo con dos aros
// de luz y tres arcos que dejan ver el giro. El neón es un solo material (M.neon): foil-cine-a.js le cambia el color en cada viaje.
const VEH_TRON = { r: 0.41, y: 0.41, zr: -0.95, zf: 0.95, cola: -1.4 };
function vehTron(){
  const T = VEH_TRON, M = { laca: makeMat(0xffffff, { vc: true, emissive: 0.3 }), goma: makeMat(0xffffff, { vc: true, emissive: 0.05 }), neon: makeMat(0x3af0ff, { emissive: 1 }), oscuro: makeMat(0x0a0c12, { emissive: 0.15 }) };
  const g = new THREE.Group(), src = new THREE.Group(), laca = vehLaca([0.03, 0.035, 0.045], [0.42, 0.5, 0.62], [0.1, 0.12, 0.16]);
  const C = vehPieza([[-1.42, 0.6, 0.68, 0.05], [-1.22, 0.47, 0.86, 0.15], [-0.95, 0.42, 0.92, 0.2], [-0.62, 0.37, 0.82, 0.19], [-0.3, 0.31, 0.62, 0.16], [0.08, 0.31, 0.6, 0.15],
    [0.5, 0.37, 0.8, 0.18], [0.95, 0.42, 0.92, 0.2], [1.25, 0.48, 0.82, 0.15], [1.47, 0.57, 0.66, 0.05]], { n: 3.4, pin: 0.25, A: { L: 0.12, modo: 'centro' }, D: { L: 0.14, modo: 'centro' } });
  mesh(vehSup(C, -1.42, 1.47, -Math.PI / 2, Math.PI * 1.5, 72, 32, { cos: 0.4, pinta: laca }), M.laca, 0, 0, 0, src);
  for (const [a0, a1] of [[-0.3, -0.17], [Math.PI + 0.17, Math.PI + 0.3]]) mesh(vehSup(C, -1.34, 1.4, a0, a1, 72, 2, { off: () => 0.006 }), M.neon, 0, 0, 0, src);   // la línea de los costados
  for (const [z0, z1] of [[-1.28, -0.58], [0.52, 1.32]]) mesh(vehSup(C, z0, z1, Math.PI / 2 - 0.06, Math.PI / 2 + 0.06, 24, 1, { off: () => 0.006 }), M.neon, 0, 0, 0, src);   // y la de encima
  mesh(vehSup(C, 0.3, 0.62, Math.PI / 2 - 0.7, Math.PI / 2 + 0.7, 10, 8, { off: () => 0.004 }), M.oscuro, 0, 0, 0, src);   // el hueco del piloto, delante del sillín
  const cuerpo = new THREE.Group(); mpFusiona(src, cuerpo); g.add(cuerpo);
  const goma = new THREE.TorusGeometry(0.31, 0.1, 10, 40); goma.rotateY(Math.PI / 2);
  const ruedas = [T.zr, T.zf].map(z => { const w = new THREE.Group(), ws = new THREE.Group(); w.position.set(0, T.y, z); g.add(w);
    vehColorea(mesh(goma, M.goma, 0, 0, 0, ws), vehGoma);
    for (const s of [-1, 1]){ const a = mesh(new THREE.TorusGeometry(0.255, 0.014, 4, 40), M.neon, 0.085 * s, 0, 0, ws); a.rotation.y = Math.PI / 2;
      for (let k = 0; k < 3; k++){ const arco = mesh(new THREE.TorusGeometry(0.34, 0.012, 3, 10, 0.9), M.neon, 0.1 * s, 0, 0, ws); arco.rotation.set(k * TAU / 3, Math.PI / 2, 0, 'YXZ'); } }
    mpFusiona(ws, w); return w; });
  const cola = new THREE.Object3D(); cola.position.set(0, 0, T.cola); g.add(cola);
  const luces = [vehLuz(g, 0, 0.64, T.cola - 0.03, 0x3af0ff, 0.55), vehLuz(g, 0, 0.62, 1.5, 0xffffff, 0.6)];
  return { g, ruedas, M, cola, luces };
}

/* ---------- Camión-kun ---------- */
// el camión de cabina japonés: cabina chata blanca con franja azul y cantos redondeados, parabrisas grande con reflejo, rejilla de cromo,
// faros encendidos, espejos de brazo largo, caja de aluminio ondulado y ruedas con tapacubos. Va todo fundido (las ruedas no giran).
const VEH_CAJA = vehLienzoTex(64, 64, g => { g.fillStyle = '#c8ccd4'; g.fillRect(0, 0, 64, 64); for (let x = 0; x < 64; x += 4){ g.fillStyle = '#e6e9ee'; g.fillRect(x, 0, 2, 64); g.fillStyle = '#9aa0aa'; g.fillRect(x + 3, 0, 1, 64); } });
const VEH_PARABRISAS = vehLienzoTex(64, 32, g => { const gr = g.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#5a7aa0'); gr.addColorStop(0.5, '#1e2a40'); gr.addColorStop(1, '#0e1420'); g.fillStyle = gr; g.fillRect(0, 0, 64, 32);
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.moveTo(8, 0); g.lineTo(22, 0); g.lineTo(10, 32); g.lineTo(0, 32); g.fill(); g.beginPath(); g.moveTo(28, 0); g.lineTo(32, 0); g.lineTo(20, 32); g.lineTo(16, 32); g.fill(); });
const VEH_REJILLA = vehLienzoTex(32, 16, g => { g.fillStyle = '#2a2c32'; g.fillRect(0, 0, 32, 16); g.fillStyle = '#d8dee8'; for (let y = 1; y < 16; y += 3) g.fillRect(1, y, 30, 1); g.fillRect(0, 0, 32, 1); g.fillRect(0, 15, 32, 1); });
// rueda de coche: neumático torneado con hombros, y tapacubos abombado por fuera (s = lado)
function vehRuedaCoche(parent, x, y, z, r, ancho, s, matGoma, matTapa, pintaTapa){
  const w = new THREE.Group(); w.position.set(x, y, z); parent.add(w);
  const perfil = [[0.6, -0.5], [0.8, -0.5], [0.93, -0.44], [0.99, -0.28], [1, 0], [0.99, 0.28], [0.93, 0.44], [0.8, 0.5], [0.6, 0.5]].map(([q, a]) => new THREE.Vector2(q * r, a * ancho)), t = new THREE.LatheGeometry(perfil, 20); t.rotateZ(Math.PI / 2);
  vehColorea(mesh(t, matGoma, 0, 0, 0, w), vehGoma);
  const rd = r * 0.6, h = r * 0.14, R2 = (rd * rd + h * h) / (2 * h), q = new THREE.SphereGeometry(R2, 16, 4, 0, TAU, 0, Math.asin(rd / R2)); q.rotateZ(-s * Math.PI / 2); q.translate(s * (ancho / 2 - 0.02 + h - R2), 0, 0);
  vehColorea(mesh(q, matTapa, 0, 0, 0, w), pintaTapa); return w;
}
function vehCamion(){
  const vc = (e, o) => makeMat(0xffffff, Object.assign({ vc: true, emissive: e }, o || {}));
  const blanco = vc(0.2), azul = vc(0.25), negro = makeMat(0x16161a), gris = makeMat(0x4a4c54), cromo = vc(0.45), caja = vc(0.12, { map: VEH_CAJA }), goma = vc(0.06),
    parab = makeMat(0xffffff, { map: VEH_PARABRISAS, emissive: 0.45 }), rejilla = makeMat(0xffffff, { map: VEH_REJILLA, emissive: 0.3 }), faro = makeMat(0xfff4c8, { emissive: 1 }), naranja = makeMat(0xffa020, { emissive: 1 }), rojo = makeMat(0xff2a2a, { emissive: 1 });
  const lB = vehLaca([0.9, 0.9, 0.88], [1.25, 1.25, 1.25], [0.82, 0.88, 1], 0.6), lA = vehLaca([0.08, 0.3, 0.82], [0.6, 0.8, 1.2], [0.3, 0.5, 0.95]), lC = vehLaca([0.9, 0.92, 0.95], [1.2, 1.2, 1.25], [0.95, 1, 1.08], 0.4), plata = vehCupula([0.66, 0.68, 0.74], [1.3, 1.3, 1.35]);
  const g = new THREE.Group(), src = new THREE.Group(), m = (geo, mat, x, y, z, pinta) => { const o = mesh(geo, mat, x, y, z, src); if (pinta) vehColorea(o, pinta); return o; }, RB = roundedBoxGeo;
  // cabina chata
  m(RB(1.74, 1.42, 1.22, 0.1), blanco, 0, 1.25, 1.24, lB); m(RB(1.66, 0.14, 1.14, 0.4), blanco, 0, 2.0, 1.22, lB); m(RB(1.78, 0.16, 1.26, 0.3), azul, 0, 0.98, 1.24, lA);
  m(B(1.5, 0.7, 0.04), parab, 0, 1.56, 1.86); m(B(1.24, 0.3, 0.04), rejilla, 0, 0.98, 1.875);
  for (const s of [-1, 1]){ m(B(0.34, 0.16, 0.05), faro, 0.62 * s, 0.76, 1.865); m(B(0.1, 0.1, 0.05), naranja, 0.84 * s, 0.98, 1.87);
    m(B(0.04, 0.55, 0.85), parab, 0.875 * s, 1.55, 1.25);                                                 // ventanillas
    m(B(0.5, 0.025, 0.025), negro, 0.98 * s, 1.72, 1.72); m(B(0.025, 0.4, 0.025), negro, 1.22 * s, 1.55, 1.72); m(RB(0.09, 0.34, 0.2, 0.3), negro, 1.24 * s, 1.5, 1.68);   // espejos de brazo largo
    m(B(0.3, 0.06, 0.25), gris, 0.7 * s, 0.4, 1.55); }                                                    // estribo
  m(RB(1.86, 0.22, 0.22, 0.3), gris, 0, 0.5, 1.86); m(RB(1.86, 0.05, 0.05, 0.4), cromo, 0, 0.62, 1.97, vehCromo);   // parachoques
  // caja de aluminio
  m(RB(1.84, 2.2, 3.4, 0.04), caja, 0, 1.6, -1.12, lC); m(RB(1.86, 0.08, 3.42, 0.4), cromo, 0, 2.72, -1.12, vehCromo); m(RB(1.86, 0.16, 3.42, 0.3), azul, 0, 0.6, -1.12, lA);
  m(B(1.7, 2.06, 0.04), caja, 0, 1.62, -2.84, lC); for (const s of [-1, 1]) m(B(0.12, 0.1, 0.05), rojo, 0.75 * s, 0.75, -2.86);
  m(B(1.1, 0.26, 4.5), negro, 0, 0.42, -0.2);                                                               // bastidor
  for (const s of [-1, 1]) for (const z of [0.66, -1.56]) m(B(0.04, 0.32, 0.36), negro, 0.92 * s, 0.38, z);   // guardabarros
  for (const s of [-1, 1]) for (const z of [1.22, -1.95, -2.4]) vehRuedaCoche(src, 0.8 * s, 0.42, z, 0.42, 0.3, s, goma, cromo, plata);
  mpFusiona(src, g);
  for (const s of [-1, 1]) vehLuz(g, 0.62 * s, 0.76, 2.0, 0xfff0c0, 1.4);
  return g;
}

/* ---------- El coche del tiempo ---------- */
// cuña de acero cepillado con cantos redondeados, puertas de ala de gaviota marcadas, persianas negras atrás, bobinas azules,
// el reactor y el condensador encendidos y luz azul por debajo
const VEH_ACERO = vehLienzoTex(64, 64, g => { const R = mulberry32(1985); g.fillStyle = '#b0b6c0'; g.fillRect(0, 0, 64, 64);
  for (let y = 0; y < 64; y++){ const v = 160 + Math.floor(R() * 40); g.fillStyle = `rgb(${v},${v + 4},${v + 10})`; g.fillRect(0, y, 64, 1); } });
const VEH_DLR_LADO = vehLienzoTex(128, 32, g => { g.fillStyle = '#000000'; g.fillRect(0, 24, 128, 8);   // la franja negra de abajo
  g.strokeStyle = '#2a2c30'; g.lineWidth = 1.5; g.strokeRect(44, 2, 40, 21); g.beginPath(); g.moveTo(44, 12); g.lineTo(84, 12); g.stroke();   // el contorno de la puerta
  g.fillStyle = '#ff7a1a'; g.fillRect(122, 18, 5, 3); g.fillRect(1, 18, 5, 3); });
function vehDelorean(){
  const vc = (e, o) => makeMat(0xffffff, Object.assign({ vc: true, emissive: e }, o || {}));
  const acero = vc(0.15, { map: VEH_ACERO }), lado = vc(0.15, { map: VEH_DLR_LADO }), negro = makeMat(0x141418), cristal = makeMat(0x24384a, { emissive: 0.4 }), goma = vc(0.06), llanta = vc(0.3),
    faro = makeMat(0xffffff, { emissive: 1 }), piloto = makeMat(0xff2a2a, { emissive: 1 }), azul = makeMat(0x7ad8ff, { emissive: 1 }), flujo = makeMat(0xffd84a, { emissive: 1 }), blanco = makeMat(0xf0f0f0, { emissive: 0.3 }), gris = makeMat(0x5a5c62);
  const lS = vehLaca([0.98, 0.98, 1], [1.4, 1.4, 1.45], [1.05, 1.1, 1.18], 0.7), plata = vehCupula([0.7, 0.72, 0.78], [1.3, 1.3, 1.35]);
  const g = new THREE.Group(), src = new THREE.Group(), m = (geo, mat, x, y, z, pinta) => { const o = mesh(geo, mat, x, y, z, src); if (pinta) vehColorea(o, pinta); return o; }, RB = roundedBoxGeo;
  m(RB(1.56, 0.34, 3.5, 0.18), acero, 0, 0.44, 0, lS);                                                       // caja de abajo
  for (const s of [-1, 1]) m(B(0.012, 0.3, 3.3), lado, 0.785 * s, 0.44, 0, lS).scale.x = s;                  // costados con la puerta marcada
  const capo = m(RB(1.52, 0.1, 1.35, 0.4), acero, 0, 0.6, 1.08); capo.rotation.x = 0.1; vehColorea(capo, lS);   // el capó en cuña
  m(RB(1.32, 0.3, 1.25, 0.3), acero, 0, 0.76, -0.25, lS);                                                    // la cabina
  const par = m(B(1.26, 0.04, 0.62), cristal, 0, 0.77, 0.55); par.rotation.x = -0.6;                        // parabrisas
  for (const s of [-1, 1]) m(B(0.02, 0.2, 0.9), cristal, 0.665 * s, 0.8, -0.22);                             // ventanillas
  m(RB(1.5, 0.18, 1.05, 0.3), acero, 0, 0.66, -1.3, lS);
  for (let i = 0; i < 7; i++) m(B(1.3, 0.035, 0.07), negro, 0, 0.77, -0.86 - i * 0.12);                     // las persianas de atrás
  m(B(1.5, 0.12, 0.05), negro, 0, 0.47, 1.76); for (const s of [-1, 1]) for (const x of [0.32, 0.56]) m(B(0.18, 0.08, 0.03), faro, x * s, 0.47, 1.78);   // rejilla y cuatro faros
  m(B(1.5, 0.16, 0.05), negro, 0, 0.5, -1.76); for (const s of [-1, 1]) m(B(0.36, 0.1, 0.03), piloto, 0.46 * s, 0.5, -1.78);
  // la máquina del tiempo: bobinas, reactor, tubos y el condensador
  for (const s of [-1, 1]){ const b = m(C(0.07, 0.07, 0.5, 8), azul, 0.5 * s, 0.6, -1.86); b.rotation.x = Math.PI / 2; m(B(0.06, 0.3, 0.06), gris, 0.62 * s, 0.86, -1.5); }
  m(C(0.13, 0.16, 0.3, 10), blanco, 0.36, 0.88, -1.55); m(C(0.06, 0.06, 0.08, 8), negro, 0.36, 1.06, -1.55);
  m(B(0.28, 0.34, 0.04), flujo, 0, 0.92, -0.6); for (let i = 0; i < 3; i++) m(B(0.02, 0.14, 0.02), faro, 0, 1.0, -0.62).rotation.z = i / 3 * Math.PI * 2;
  m(B(1.3, 0.04, 3.2), azul, 0, 0.24, 0);                                                                     // luz azul por debajo
  for (const s of [-1, 1]) for (const z of [1.12, -1.12]){ const w = vehRuedaCoche(src, 0.66 * s, 0.33, z, 0.33, 0.26, s, goma, llanta, plata);
    for (let i = 0; i < 5; i++){ const r = mesh(B(0.04, 0.26, 0.05), llanta, s * 0.135, 0, 0, w); r.rotation.x = i / 5 * TAU; vehColorea(r, plata); } }   // los cinco radios
  mpFusiona(src, g);
  for (const s of [-1, 1]) vehLuz(g, 0.44 * s, 0.47, 1.9, 0xffffff, 0.9);
  const brillo = vehLuz(g, 0, 0.15, 0, 0x5ac8ff, 3.6); brillo.scale.set(3.4, 1.0, 1);
  return g;
}

/* ---------- Camión-kun cambia de modelo (las copias de truckMeshes y el del final «Otra vez no» salen de él) ---------- */
{ const c = vehCamion(); while (truck.children.length) truck.remove(truck.children[0]); while (c.children.length) truck.add(c.children[0]); }

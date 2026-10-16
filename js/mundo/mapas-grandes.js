'use strict';
/* ======================================================================
   MAPAS GRANDES: en las oleadas normales de las Ruinas, el Santuario y la Cumbre
   el mapa pasa de 6,3 m de radio a 18. Hay obstáculos con colisión (los bajos se
   saltan), trampolines, hielo que resbala, cobertura contra los orbes, un radar y
   los enemigos llegan por «frentes» alrededor del jugador. Las oleadas de jefe
   vuelven a la plaza central (el radio de siempre) con una barrera visible.
   El decorado de cada mapa está en js/mundo/mapas-decorado.js.
   ====================================================================== */
const ARENA_PEQ = 6.3, ARENA_GRANDE = 18, MP_BIOMAS = ['ruinas', 'sakura', 'cumbre'];
const MP = { on: false, mapas: {}, frentes: [], frI: 0, oc: [], rdT: 0 };
const mpR = mulberry32(2026);   // azar propio para el decorado (no gasta rnd(): no cambia nada de lo que viene después)
// Cada mapa: obst = [{ x, z, r, h, o }] (h: altura, por encima se salta; o: objeto que se oculta si tapa la cámara),
// ocl = [{ x, z, r, o }] (solo se ocultan), pads = trampolines, hielo / agua = zonas circulares [{ x, z, r }]
function mpMapa(id){ return MP.mapas[id] || (MP.mapas[id] = { obst: [], ocl: [], pads: [], hielo: [], agua: [] }); }
const mpActual = () => MP.on ? MP.mapas[BIOMES[curBiome].id] || null : null;
function mpObst(id, x, z, r, h = 99, o = null){ mpMapa(id).obst.push({ x, z, r, h, o }); }
function mpOcl(id, x, z, r, o){ mpMapa(id).ocl.push({ x, z, r, o }); }
const mpEnZona = (L, p, m = 0) => L.some(c => Math.hypot(p.x - c.x, p.z - c.z) < c.r + m);

/* ---------- Tamaño del mapa en cada oleada ---------- */
function mpDebeSerGrande(n){ const B = BIOMES[curBiome]; return !!B && MP_BIOMAS.includes(B.id) && n % 5 !== 0 && n < FINAL_WAVE && !special; }
function mpPonTam(grande){
  MP.on = grande; mpDesoculta();
  const R = grande ? ARENA_GRANDE : ARENA_PEQ; if (ARENA === R) return; ARENA = R;
  if (grande) return;
  if (Math.hypot(hero.position.x, hero.position.z) > ARENA - 0.5){   // de vuelta a la plaza central
    puffAt(hero.position.x, hero.position.z, 8, 1.4); hero.position.set(0, 0, 0); MOV11.vx = MOV11.vz = 0; player.kx = player.kz = 0; puff(8); }
  for (let i = pickups.length - 1; i >= 0; i--){ const p = pickups[i].m.position; if (Math.hypot(p.x, p.z) > ARENA - 0.4){ scene.remove(pickups[i].m); pickups.splice(i, 1); } }
}
function mpEmpiezaOleada(n){
  const k = n >= 8 ? 3 : 2, a0 = rnd() * TAU; MP.frentes = []; MP.frI = 0;
  for (const M of Object.values(MP.mapas)) if (M.rej) M.rej.campos.clear();   // olvida las metas de la oleada anterior
  for (let i = 0; i < k; i++) MP.frentes.push(a0 + i * TAU / k + (rnd() - 0.5) * 0.6);
  if (n > 1){ const v = mpSitio(9, 15, 0.6); dropPickup(v.x, v.z); pickups[pickups.length - 1].t = -30; }   // una curación lejos: invita a moverse
  if (n === 1) later(9, () => barkOnce('mp_grande', 'Esto es más grande de lo que parecía. Rueda y salta a la vez para el salto largo; en el aire, rueda otra vez para impulsarte.'));
  if (n === 2) later(3, () => barkOnce('mp_radar', 'Mira el radar de la esquina: las flechas rojas marcan por dónde llegan. Y los pilares paran los orbes.'));
}

/* ---------- Sitios libres ---------- */
function mpLibre(x, z, rad = 0.5){
  if (Math.hypot(x, z) > ARENA - rad) return false;
  if (braz.visible && Math.hypot(x - BRAZ.x, z - BRAZ.z) < 0.9 + rad) return false;
  const M = mpActual(); if (!M) return true;
  return !M.obst.some(o => Math.hypot(x - o.x, z - o.z) < o.r + rad) && !mpEnZona(M.agua, { x, z }, rad);
}
function mpSitio(dMin, dMax, rad = 0.6){   // un punto libre a cierta distancia del jugador
  const H = hero.position, v = new V3();
  for (let i = 0; i < 40; i++){ const a = rnd() * TAU, d = dMin + rnd() * (dMax - dMin); v.set(H.x + Math.sin(a) * d, 0, H.z + Math.cos(a) * d);
    if (mpLibre(v.x, v.z, rad)) return v; }
  for (let i = 0; i < 40; i++){ const a = rnd() * TAU, r = rnd() * (ARENA - 1); v.set(Math.sin(a) * r, 0, Math.cos(a) * r); if (mpLibre(v.x, v.z, rad)) return v; }
  return v.set(0, 0, 0);
}
// Rumbo de huida (ladrones, capitán): el más parecido a «a0» que no se dé contra nada en los próximos metros
function mpRumbo(x, z, a0){
  if (!mpActual()) return a0;
  for (const da of [0, 0.45, -0.45, 0.9, -0.9, 1.35, -1.35, 1.8, -1.8]){ const a = a0 + da; let ok = true;
    for (let d = 1; d <= 4 && ok; d++) ok = mpLibre(x + Math.sin(a) * d, z + Math.cos(a) * d, 0.5);
    if (ok) return a; }
  return a0;
}
// Enemigos sin posición fija: por uno de los frentes de la oleada, a 9-13 m del jugador
const _spawnSpotMP = spawnSpot;
spawnSpot = function(type){
  if (!MP.on) return _spawnSpotMP(type);
  const H = hero.position;
  for (let i = 0; i < 16; i++){
    const f = MP.frentes.length ? MP.frentes[MP.frI++ % MP.frentes.length] : rnd() * TAU, a = f + (rnd() - 0.5) * 0.7, d = 9 + rnd() * 4;
    const v = clampArena(new V3(H.x + Math.sin(a) * d, 0, H.z + Math.cos(a) * d), ARENA - 1);
    if (Math.hypot(v.x - H.x, v.z - H.z) > 6 && mpLibre(v.x, v.z, 0.8)) return [v.x, v.z];
  }
  const v = mpSitio(7, 14, 0.8); return [v.x, v.z];
};

/* ---------- Colisiones: obstáculos, cobertura y cámara ---------- */
function mpEmpuja(p, rad, y){
  const M = mpActual(); if (!M) return;
  for (const o of M.obst){ if (y > o.h - 0.1) continue;
    const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz), m = o.r + rad;
    if (d < m){ if (d < 1e-4){ p.x = o.x + m; continue; } p.x = o.x + dx / d * m; p.z = o.z + dz / d * m; } }
}
const _separateEnemiesMP = separateEnemies;
separateEnemies = function(){
  _separateEnemiesMP(); if (!MP.on) return;
  for (const e of enemies) if (e.alive && e.spawnT <= 0 && !e.noSep && e.type !== 'dragon' && e.type !== 'puesto') mpEmpuja(e.g.position, e.r * 0.8, e.g.position.y);
};

/* ---------- Rodeos: los enemigos no se quedan atascados detrás de un muro ---------- */
// Rejilla de 0,6 m con las celdas libres de cada mapa y, cuatro veces por segundo, la distancia de cada celda hasta la meta
// (Tovan, o lo que diga e.mpMeta(): el paquete para el ladrón, null para quien huye). Quien va a por su meta sin verla
// en línea recta cambia el rumbo del paso que ha dado su IA por el del camino (a la misma velocidad).
const MP_CEL = 0.6;
function mpRejilla(M){
  if (M.rej) return M.rej;
  const n = Math.ceil(ARENA_GRANDE * 2 / MP_CEL), libre = new Uint8Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++){ const x = -ARENA_GRANDE + (i + 0.5) * MP_CEL, z = -ARENA_GRANDE + (j + 0.5) * MP_CEL;
    libre[j * n + i] = Math.hypot(x, z) < ARENA_GRANDE - 0.6 && !M.obst.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.4) ? 1 : 0; }
  return M.rej = { n, libre, cola: new Int32Array(n * n), campos: new Map() };
}
const mpCelda = (R, x, z) => { const i = Math.floor((x + ARENA_GRANDE) / MP_CEL), j = Math.floor((z + ARENA_GRANDE) / MP_CEL); return i < 0 || j < 0 || i >= R.n || j >= R.n ? -1 : j * R.n + i; };
function mpDistancias(R, dist, hx, hz){   // anchura primero desde la celda libre más cercana a la meta
  const { n, libre, cola } = R; dist.fill(-1);
  let c = mpCelda(R, hx, hz);
  if (c < 0 || !libre[c]){ let bd = 1e9; c = -1; for (let k = 0; k < n * n; k++) if (libre[k]){ const d = (-ARENA_GRANDE + (k % n + 0.5) * MP_CEL - hx) ** 2 + (-ARENA_GRANDE + ((k / n | 0) + 0.5) * MP_CEL - hz) ** 2; if (d < bd){ bd = d; c = k; } } }
  if (c < 0) return; let h = 0, t = 0; cola[t++] = c; dist[c] = 0;
  while (h < t){ const k = cola[h++], i = k % n, d = dist[k] + 1;
    if (i > 0 && libre[k - 1] && dist[k - 1] < 0){ dist[k - 1] = d; cola[t++] = k - 1; }
    if (i < n - 1 && libre[k + 1] && dist[k + 1] < 0){ dist[k + 1] = d; cola[t++] = k + 1; }
    if (k >= n && libre[k - n] && dist[k - n] < 0){ dist[k - n] = d; cola[t++] = k - n; }
    if (k < n * n - n && libre[k + n] && dist[k + n] < 0){ dist[k + n] = d; cola[t++] = k + n; } }
}
function mpCampo(R, k, p){   // distancias hasta la meta k, como mucho de hace 0,25 s
  let C = R.campos.get(k); if (!C) R.campos.set(k, C = { dist: new Int32Array(R.n * R.n), t: -1 });
  if (time - C.t > 0.25 || C.t > time){ C.t = time; mpDistancias(R, C.dist, p.x, p.z); }
  return C.dist;
}
function mpCamino(R, D, x, z){   // rumbo [dx, dz] hacia la celda que está tres pasos más cerca de la meta
  const n = R.n; let c = mpCelda(R, x, z);
  if (c < 0 || D[c] < 0){   // pegado a un obstáculo, su celda cuenta como ocupada: parte de la libre más cercana (de su lado del muro)
    const i0 = Math.floor((x + ARENA_GRANDE) / MP_CEL), j0 = Math.floor((z + ARENA_GRANDE) / MP_CEL); let bd = 1e9; c = -1;
    for (let r = 1; r <= 2 && c < 0; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++){ const i = i0 + di, j = j0 + dj, k = j * n + i;
      if (i < 0 || j < 0 || i >= n || j >= n || D[k] < 0) continue;
      const d = (-ARENA_GRANDE + (i + 0.5) * MP_CEL - x) ** 2 + (-ARENA_GRANDE + (j + 0.5) * MP_CEL - z) ** 2; if (d < bd){ bd = d; c = k; } }
    if (c < 0) return null; }
  for (let s = 0; s < 3 && D[c] > 0; s++){ const i = c % n; let best = c;
    for (const [di, dj] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]){ const ii = i + di, k = c + di + dj * n;
      if (ii < 0 || ii >= n || k < 0 || k >= n * n || D[k] < 0) continue;
      if (di && dj && (D[c + di] < 0 || D[c + dj * n] < 0)) continue;   // sin cortar esquinas
      if (D[k] < D[best]) best = k; }
    if (best === c) break; c = best; }
  const tx = -ARENA_GRANDE + (c % n + 0.5) * MP_CEL - x, tz = -ARENA_GRANDE + ((c / n | 0) + 0.5) * MP_CEL - z, l = Math.hypot(tx, tz);
  return l > 0.05 ? [tx / l, tz / l] : null;
}
function mpVe(M, x, z, p, r){   // ¿línea recta libre desde (x, z) hasta p?
  const dx = p.x - x, dz = p.z - z, L2 = dx * dx + dz * dz; if (L2 < 0.01) return true;
  for (const o of M.obst){ const t = clamp(((o.x - x) * dx + (o.z - z) * dz) / L2, 0, 1), px = x + dx * t - o.x, pz = z + dz * t - o.z; if (px * px + pz * pz < (o.r + r) ** 2) return false; }
  return true;
}
const _updateEnemyMP = updateEnemy;
updateEnemy = function(e, dt){
  const M = mpActual();
  if (!M || !e.alive || e.spawnT > 0 || e.state !== 'chase' || e.noSep || e.type === 'dragon' || e.type === 'puesto') return _updateEnemyMP(e, dt);
  const p = e.g.position, x0 = p.x, z0 = p.z, meta = e.mpMeta ? e.mpMeta() : hero.position; _updateEnemyMP(e, dt);
  if (!meta) return;
  const dx = p.x - x0, dz = p.z - z0, d = Math.hypot(dx, dz), mx = meta.x - x0, mz = meta.z - z0;
  if (!e.alive || e.state !== 'chase' || p.y > 0.3 || d < 1e-5 || dx * mx + dz * mz < d * Math.hypot(mx, mz) * 0.5) return;   // solo si su IA va hacia la meta
  if (!(time < e.mpVeT)){ e.mpVeT = time + 0.2; e.mpVeo = mpVe(M, x0, z0, meta, e.r * 0.8); }
  if (e.mpVeo) return;
  const R = mpRejilla(M), f = mpCamino(R, mpCampo(R, meta === hero.position ? 'tovan' : meta, meta), x0, z0); if (!f) return;
  p.x = x0 + f[0] * d; p.z = z0 + f[1] * d; e.g.rotation.y = Math.atan2(f[0], f[1]);
};
function mpBalas(){   // lo alto para los orbes enemigos: sirve de cobertura
  const M = mpActual(); if (!M) return;
  for (let i = projectiles.length - 1; i >= 0; i--){ const p = projectiles[i]; if (p.owner !== 'enemy') continue;
    for (const o of M.obst) if (o.h > 1.2 && Math.hypot(p.m.position.x - o.x, p.m.position.z - o.z) < o.r){
      sparks(p.m.position.x, p.m.position.y, p.m.position.z, 5, 0xff5ad8); scene.remove(p.m); projectiles.splice(i, 1); break; } }
}
function mpDesoculta(){ for (const o of MP.oc) o.visible = true; MP.oc.length = 0; }
function mpOcluye(){   // lo que queda entre la cámara y Tovan se esconde
  mpDesoculta(); const M = mpActual(); if (!M) return;
  const cx = camera.position.x, cz = camera.position.z, dx = hero.position.x - cx, dz = hero.position.z - cz, L2 = dx * dx + dz * dz; if (L2 < 0.01) return;
  const mira = L => { for (const o of L){ if (!o.o || (o.h != null && o.h < 1.4) || !o.o.visible) continue;
    const t = ((o.x - cx) * dx + (o.z - cz) * dz) / L2; if (t <= 0 || t >= 0.94) continue;
    const px = cx + dx * t - o.x, pz = cz + dz * t - o.z; if (px * px + pz * pz < (o.r + 0.6) ** 2){ o.o.visible = false; MP.oc.push(o.o); } } };
  mira(M.obst); mira(M.ocl);
}

/* ---------- Trampolines y hielo ---------- */
function mpPads(dt){
  const M = mpActual(); if (!M) return;
  for (const p of M.pads){ p.cd -= dt; if (p.anim) p.anim(p, dt);
    if (p.cd > 0 || !grounded || state !== 'normal' || player.dead || Math.hypot(hero.position.x - p.x, hero.position.z - p.z) > 0.85) continue;
    p.cd = 0.8; const a = inputMag > 0.12 ? inputHeading : hero.rotation.y;
    grounded = false; vy = 12.5; MOV11.vx = Math.sin(a) * 7; MOV11.vz = Math.cos(a) * 7; heading = a; hero.rotation.y = a;
    AC12.lj = true; AC12.airDash = false; AC12.chain = 0; startFlip12('x', 1, 0.75); MOV11.sqv += 2.5;
    ringFx(p.x, p.z, p.col, 0.3, 2.6, 0.4); lightFlash(p.x, 1, p.z, p.col, 1.6, 5); play('superOn'); stat('trampolines');
    for (let i = 0; i < 14; i++){ const b = rnd() * TAU; spawnFx(p.x + Math.cos(b) * 0.4, 0.2, p.z + Math.sin(b) * 0.4, Math.cos(b) * 1.5, 4 + rnd() * 3, Math.sin(b) * 1.5, p.col, 0.08, 0.6, 6, 0); }
    barkOnce('mp_pad', '¡Trampolín! Desde ahí arriba se rompen las piezas «desde el aire» de los capitanes.');
  }
}
const _mov11MP = mov11;
mov11 = function(tx, tz, dt, moving){   // sobre el hielo cuesta arrancar y frenar
  const M = mpActual();
  if (!M || !M.hielo.length || !grounded || !mpEnZona(M.hielo, hero.position)) return _mov11MP(tx, tz, dt, moving);
  const vx = MOV11.vx, vz = MOV11.vz; _mov11MP(tx, tz, dt, moving);
  const nx = vx + (MOV11.vx - vx) * 0.16, nz = vz + (MOV11.vz - vz) * 0.16;
  hero.position.x += (nx - MOV11.vx) * dt; hero.position.z += (nz - MOV11.vz) * dt; MOV11.vx = nx; MOV11.vz = nz;
  if (Math.hypot(nx, nz) > 1.5 && rnd() < dt * 14) spawnFx(hero.position.x, 0.06, hero.position.z, (rnd() - 0.5), 0.6, (rnd() - 0.5), 0xdff6ff, 0.06, 0.4, 2, 0);
  barkOnce('mp_hielo', '¡Hielo! Aquí se resbala: frena antes de lo que crees.');
};

/* ---------- Barrera de la plaza en las oleadas de jefe ---------- */
const mpAro = mesh(new THREE.CylinderGeometry(ARENA_PEQ + 0.15, ARENA_PEQ + 0.15, 1.6, 48, 1, true), makeMat(0xff8a4a, { emissive: 1, opacity: 0.16, side: THREE.DoubleSide }), 0, 0.8, 0);
mpAro.visible = false;
function mpAroTick(){
  const B = BIOMES[curBiome], on = !MP.on && !!B && MP_BIOMAS.includes(B.id) && wave % 5 === 0 && (gameState === 'play' || gameState === 'paused');
  mpAro.visible = on; if (on) mpAro.material.uniforms.uOpacity.value = 0.12 + 0.06 * Math.sin(time * 3);
}

/* ---------- Radar ---------- */
const mpRadar = document.createElement('canvas'); mpRadar.id = 'mpRadar'; mpRadar.width = mpRadar.height = 132; mpRadar.hidden = true; document.body.appendChild(mpRadar);
const mpRx = mpRadar.getContext('2d');
// Colores del radar (los cambia cada tema de la interfaz: js/interfaz/temas.js)
const MP_RCOL_CLASICA = { fondo: 'rgba(8,10,40,.78)', borde: 'rgba(238,240,255,.85)', bordeW: 2, agua: 'rgba(70,140,220,.6)', hielo: 'rgba(190,232,255,.45)', bajo: 'rgba(150,150,190,.55)', alto: 'rgba(170,175,215,.85)',
  pad: '#7ff5ff', sello: '#d07aff', selloOk: '#ffd23a', paquete: '#ffd23a', robo: '#ff6a3a', perim: 'rgba(255,210,58,.8)', cura: '#7dff8a', puesto: '#d04aff', cap1: '#ff8a3a', cap2: '#ffd23a',
  enemigo: '#ff4a4a', elite: '#ffd970', ladron: '#ffb0ff', frente: '#ff4a4a', heroe: '#ffffff', heroeBorde: null };
const MP_RCOL = Object.assign({}, MP_RCOL_CLASICA);
function mpDibujaRadar(){
  const show = MP.on && !hud.hidden && (gameState === 'play' || gameState === 'paused');
  if (mpRadar.hidden !== !show){ mpRadar.hidden = !show; if (typeof objColT === 'number') objColT = 0; }
  if (!show || !mpRx) return;
  const g = mpRx, W = mpRadar.width, C = W / 2, R = C - 7, k = R / ARENA, M = mpActual(), P = MP_RCOL;
  const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = -fz, rz = fx;   // arriba = hacia donde mira la cámara
  const X = (x, z) => C + (x * rx + z * rz) * k, Y = (x, z) => C - (x * fx + z * fz) * k;
  const dot = (x, z, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(X(x, z), Y(x, z), r, 0, TAU); g.fill(); };
  g.clearRect(0, 0, W, W);
  g.fillStyle = P.fondo; g.beginPath(); g.arc(C, C, R + 5, 0, TAU); g.fill();
  if (M){ for (const z of M.agua) dot(z.x, z.z, z.r * k, P.agua); for (const z of M.hielo) dot(z.x, z.z, z.r * k, P.hielo);
    for (const o of M.obst) dot(o.x, o.z, Math.max(1.2, o.r * k), o.h < 1.4 ? P.bajo : P.alto);
    g.strokeStyle = P.pad; g.lineWidth = 1.5; for (const p of M.pads){ g.beginPath(); g.arc(X(p.x, p.z), Y(p.x, p.z), 3, 0, TAU); g.stroke(); } }
  if (P.bordeW){ g.strokeStyle = P.borde; g.lineWidth = P.bordeW; g.beginPath(); g.arc(C, C, R, 0, TAU); g.stroke(); }
  const o = typeof OBJ !== 'undefined' ? OBJ.cur : null;
  if (o && o.tipo === 'sello'){ g.strokeStyle = o.ok ? P.selloOk : P.sello; g.lineWidth = 2; g.beginPath(); g.arc(X(o.x, o.z), Y(o.x, o.z), Math.max(3, OBJ_SR * k), 0, TAU); g.stroke(); }
  if (o && o.tipo === 'paquete' && !o.pk.lost){ const p = o.pk.g.position;
    if (o.pk.hx != null){ g.setLineDash([3, 3]); g.strokeStyle = P.perim; g.lineWidth = 1.5; g.beginPath(); g.arc(X(o.pk.hx, o.pk.hz), Y(o.pk.hx, o.pk.hz), OBJ_PK_R * k, 0, TAU); g.stroke(); g.setLineDash([]); }
    g.fillStyle = Math.sin(time * 10) > 0 || !o.pk.carrier ? P.paquete : P.robo; g.fillRect(X(p.x, p.z) - 3, Y(p.x, p.z) - 3, 6, 6); }
  for (const p of pickups) dot(p.m.position.x, p.m.position.z, 1.6, P.cura);
  for (const e of enemies){ if (!e.alive) continue; const x = e.g.position.x, z = e.g.position.z;
    if (e.type === 'puesto'){ g.fillStyle = P.puesto; g.fillRect(X(x, z) - 3, Y(x, z) - 3, 6, 6); }
    else if (e.cap) dot(x, z, 4, Math.sin(time * 8) > 0 ? P.cap1 : P.cap2);
    else dot(x, z, e.heavy ? 2.6 : 2, e.elite ? P.elite : e.type === 'ladron' ? P.ladron : P.enemigo); }
  if (queue.length && Math.sin(time * 6) > -0.3) for (const f of MP.frentes){   // por dónde llegan
    const sx = Math.sin(f), sz = Math.cos(f), px = sx * rx + sz * rz, py = -(sx * fx + sz * fz), ax = C + px * (R - 2), ay = C + py * (R - 2);
    g.fillStyle = P.frente; g.beginPath(); g.moveTo(ax + px * 6, ay + py * 6); g.lineTo(ax - py * 5, ay + px * 5); g.lineTo(ax + py * 5, ay - px * 5); g.fill(); }
  const hx = X(hero.position.x, hero.position.z), hy = Y(hero.position.x, hero.position.z), ha = hero.rotation.y, sx = Math.sin(ha), sz = Math.cos(ha);
  const ux = sx * rx + sz * rz, uy = -(sx * fx + sz * fz);
  g.fillStyle = P.heroe; g.beginPath(); g.moveTo(hx + ux * 6, hy + uy * 6); g.lineTo(hx - ux * 4 - uy * 4, hy - uy * 4 + ux * 4); g.lineTo(hx - ux * 4 + uy * 4, hy - uy * 4 - ux * 4); g.closePath(); g.fill();
  if (P.heroeBorde){ g.strokeStyle = P.heroeBorde; g.lineWidth = 1.5; g.stroke(); }
}

/* ---------- Ganchos ---------- */
// En los tres escenarios grandes el suelo plano de siempre se cambia por su terreno (js/mundo/mapas-decorado.js)
const _applyBiomeMP = applyBiome;
applyBiome = function(b){
  const viejo = BIOMES[curBiome] && MP_BIOMAS.includes(BIOMES[curBiome].id), nuevo = BIOMES[b] && MP_BIOMAS.includes(BIOMES[b].id);
  if (viejo && !nuevo) ground.visible = true;
  _applyBiomeMP(b); if (nuevo) ground.visible = false;
};
if (MP_BIOMAS.includes(BIOMES[curBiome].id)) ground.visible = false;
const _startWaveMP = startWave;
startWave = function(n){ const grande = mpDebeSerGrande(n); mpPonTam(grande); _startWaveMP(n); if (grande) try { mpEmpiezaOleada(n); } catch (err) { console.error(err); } };
const _startSpecialWaveMP = startSpecialWave;
startSpecialWave = function(){ mpPonTam(false); _startSpecialWaveMP(); };
const _toTitleMP = toTitle;
toTitle = function(){ mpPonTam(false); _toTitleMP(); };
function mpTick(dt, pdt, playing){
  if (MP.on && playing){ mpEmpuja(hero.position, 0.35, hero.position.y); mpPads(pdt); mpBalas(); }
  const M = MP.on ? mpActual() : null; if (M) for (const z of M.agua) if (z.anim) z.anim(z, pdt);
  mpOcluye(); mpAroTick();
  if ((MP.rdT ^= 1)) mpDibujaRadar();
}
const _v3UpdateMP = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateMP(dt, pdt, playing); try { mpTick(dt, pdt, playing); } catch (err) { console.error(err); } };

/* ---------- Fusión del decorado pequeño (menos llamadas de dibujo) ---------- */
// Junta todas las mallas de un grupo suelto en una por material y las mete en «dst».
function mpFusiona(src, dst){
  src.updateMatrixWorld(true); const porMat = new Map();
  src.traverse(o => { if (!o.isMesh) return; const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
    if (!porMat.has(o.material)) porMat.set(o.material, []); porMat.get(o.material).push(g); });
  for (const [mat, gs] of porMat){
    const geo = new THREE.BufferGeometry();
    for (const at of ['position', 'normal', 'uv', 'color']){ if (at === 'color' && !mat.vertexColors) continue;
      const n = at === 'uv' ? 2 : 3, tot = gs.reduce((s, g) => s + g.attributes.position.count, 0), arr = new Float32Array(tot * n).fill(1); let off = 0;
      for (const g of gs){ const a = g.attributes[at], c = g.attributes.position.count; if (a) arr.set(a.array, off); off += c * n; }
      geo.setAttribute(at, new THREE.BufferAttribute(arr, n)); }
    geo.computeBoundingSphere(); dst.add(new THREE.Mesh(geo, mat));
  }
}

'use strict';
/* ======================================================================
   DECORADO DE LOS MAPAS GRANDES (sistemas en js/mundo/mapas-grandes.js,
   piezas en js/mundo/mapas-piezas.js)
   La plaza central de cada escenario sigue en su sitio, pero sus piezas se
   cambian por versiones detalladas y ganan colisión. Alrededor se abre el resto
   del mapa hasta 18 m y unas colinas cierran el valle. Todo se coloca con mpR
   (azar propio), así que no cambia la secuencia de rnd() del resto del juego.
   ====================================================================== */
const mpA = (a, r) => [Math.cos(a) * r, Math.sin(a) * r];   // ángulo (rad) y radio → x, z
const mpDeg = d => d * Math.PI / 180;
const mpLejos = (L, x, z, d) => L.every(p => Math.hypot(p[0] - x, p[1] - z) >= d);
// Construye algo en un grupo suelto y lo funde en una malla por material dentro de «g» (menos llamadas de dibujo)
function mpFundido(parent, x, z, rot, s, crea){
  const g = new THREE.Group(), src = new THREE.Group(); crea(src); mpFusiona(src, g);
  g.position.set(x, 0, z); g.rotation.y = rot; g.scale.setScalar(s); parent.add(g); return g;
}
function mpPad(id, parent, x, z, col, viste){   // trampolín: un círculo que te lanza por los aires
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  const disc = mesh(new THREE.CircleGeometry(0.85, 20), M.rune, 0, 0.04, 0, g); disc.rotation.x = -Math.PI / 2;
  const aro = mesh(new THREE.TorusGeometry(0.85, 0.06, 4, 24), makeMat(col, { emissive: 1 }), 0, 0.06, 0, g); aro.rotation.x = Math.PI / 2;
  if (viste) viste(g);
  mpMapa(id).pads.push({ x, z, col, cd: 0, g, aro, anim(p, dt){ p.aro.scale.setScalar(1 + 0.08 * Math.sin(time * 5 + p.x)); p.aro.position.y = 0.06 + (p.cd > 0 ? 0.3 * p.cd : 0);
    if (rnd() < dt * 6) spawnFx(p.x + (rnd() - 0.5) * 1.2, 0.1, p.z + (rnd() - 0.5) * 1.2, 0, 1.6 + rnd(), 0, p.col, 0.06, 0.6, -0.5, 0); } });
}
const mpSombras = id => mpMapa(id).obst.map(o => ({ x: o.x, z: o.z, r: Math.max(0.5, o.r) * (o.h > 1.4 ? 1.25 : 0.9), k: o.h > 1.4 ? 0.5 : 0.32 }))
  .concat(mpMapa(id).ocl.filter(o => o.r < 1.8).map(o => ({ x: o.x, z: o.z, r: o.r * 1.1, k: 0.3 })));   // copas: sombra suave
// ¿Sitio libre al construir? (aún no vale mpLibre: ARENA es la de la plaza)
const mpLibreEn = (id, x, z, rad) => !mpMapa(id).obst.some(o => Math.hypot(x - o.x, z - o.z) < o.r + rad) && !mpEnZona(mpMapa(id).agua, { x, z }, rad);

/* ---------- Ruinas del Ocaso ---------- */
{ const id = 'ruinas', G = ruinsGroup, F = new THREE.Group(), alt = (x, z) => mpColina(x, z, 7, 2.2), luces = [], copas = [];
  const sube = (o, x, z) => { o.position.y = alt(x, z); return o; };
  // la plaza de siempre, con piezas nuevas en el mismo sitio
  const H = [3.2, 2.1, 3.2, 1.2, 3.2, 2.6, 0.8, 3.2, 1.8];
  for (const c of [...G.children]){
    if (c.isGroup && c.children[0] && c.children[0].material === M.grass){ c.visible = false; continue; }   // la hierba plana se cambia por la instanciada
    if (c.isGroup && c.children[0] && c.children[0].material === M.stone){                                   // columnas de la plaza
      const i = H.findIndex((h, k) => { const a = k / 9 * TAU + 0.2; return Math.hypot(Math.cos(a) * 7.2 - c.position.x, Math.sin(a) * 7.2 - c.position.z) < 0.01; }); if (i < 0) continue;
      c.visible = false; const h = H[i], col = mpFundido(G, c.position.x, c.position.z, c.rotation.y, 1, s => mpColumna(s, 0, 0, h, { rota: h < 3 }));
      mpObst(id, c.position.x, c.position.z, 0.5, h + 0.3, h + 0.3 >= 1.4 ? col : null); continue; }
    if (c.isMesh && c.material === M.stone && c.geometry.type === 'CylinderGeometry'){                       // columna caída
      c.visible = false; const f = new THREE.Mesh(mpFusteGeo(2.6, true, 4), MPM.fuste); f.position.set(4.2 + 1.0, 0.36, 3.6 - 0.85); f.rotation.set(0, 0.7, Math.PI / 2); G.add(f);
      for (const k of [-0.8, 0, 0.8]) mpObst(id, 4.2 - 0.765 * k, 3.6 + 0.644 * k, 0.42, 0.75); continue; }
    if (c.isMesh && c.material === M.rock && c.geometry.type === 'IcosahedronGeometry'){ c.visible = false; mpRoca(F, c.position.x, c.position.z, c.geometry.parameters.radius * c.scale.x, MPM.rocaR, 'musgo'); }
  }
  luces.push({ x: BRAZ.x, z: BRAZ.z, r: 5.5, col: [0.5, 0.26, 0.08] });
  // muralla exterior (al pie de las colinas) con tres puertas
  for (let i = 0; i < 30; i++){ if (mpR() < 0.18) continue; const a0 = i / 30 * TAU, a1 = a0 + TAU / 30 * (0.7 + mpR() * 0.25), [x0, z0] = mpA(a0, 19.1), [x1, z1] = mpA(a1, 19.1);
    const m = mpMuro(G, x0, z0, x1, z1, 1.2 + mpR() * 1.8, 0.85, 0.9); mpOcl(id, (x0 + x1) / 2, (z0 + z1) / 2, 1.6, m); }
  for (const d of [90, 210, 330]){ const a = mpDeg(d), t = [-Math.sin(a), Math.cos(a)], [cx, cz] = mpA(a, 18.9);
    for (const s of [-1, 1]){ const x = cx + t[0] * 1.8 * s, z = cz + t[1] * 1.8 * s, col = mpFundido(G, x, z, 0, 1, g => mpColumna(g, 0, 0, 3.6)); mpOcl(id, x, z, 0.8, col); }
    const lin = mpMuro(G, cx - t[0] * 2.3, cz - t[1] * 2.3, cx + t[0] * 2.3, cz + t[1] * 2.3, 0.7, 1.0, 0.15); lin.position.y = 4.1; mpOcl(id, cx, cz, 2.4, lin); }
  // seis barrios en ruinas: muros en L con una columna
  for (let k = 0; k < 6; k++){
    const a = mpDeg(k * 60 + 30), t = [-Math.sin(a), Math.cos(a)], u = [Math.cos(a), Math.sin(a)], [cx, cz] = mpA(a, 12.6);
    const walls = [[cx - t[0] * 1.9, cz - t[1] * 1.9, cx + t[0] * 1.5, cz + t[1] * 1.5, 1.6 + mpR() * 1.2], [cx + t[0] * 1.5, cz + t[1] * 1.5, cx + t[0] * 1.5 + u[0] * 2.5, cz + t[1] * 1.5 + u[1] * 2.5, 0.9 + mpR() * 1.1]];
    for (const [x0, z0, x1, z1, h] of walls){ const m = mpMuro(G, x0, z0, x1, z1, h, 0.6, 0.7), L = Math.hypot(x1 - x0, z1 - z0);
      for (let i = 0, n = Math.round(L / 0.55); i <= n; i++) mpObst(id, x0 + (x1 - x0) * i / n, z0 + (z1 - z0) * i / n, 0.42, h * 0.75, h * 0.75 >= 1.4 ? m : null); }
    const px = cx - t[0] * 2.5 + u[0] * 1.2, pz = cz - t[1] * 2.5 + u[1] * 1.2, ph = 2.2 + mpR() * 1.2, col = mpFundido(G, px, pz, mpR() * 6, 1, g => mpColumna(g, 0, 0, ph, { rota: true }));
    mpObst(id, px, pz, 0.5, ph + 0.3, col);
    for (let i = 0; i < 6; i++) mpRoca(F, cx + (mpR() - 0.5) * 4.4, cz + (mpR() - 0.5) * 4.4, 0.14 + mpR() * 0.26, MPM.rocaR, 'musgo'); }
  for (const d of [45, 135, 225, 315]){ const [x, z] = mpA(mpDeg(d), 10.2), col = mpFundido(G, x, z, mpR() * 6, 1, g => mpColumna(g, 0, 0, 3.4)); mpObst(id, x, z, 0.5, 3.7, col); }
  for (const d of [0, 60, 120, 180, 240, 300]){ const a = mpDeg(d), t = [-Math.sin(a), Math.cos(a)], [cx, cz] = mpA(a, 15.6);   // muretes que se saltan
    mpMuro(G, cx - t[0] * 1.3, cz - t[1] * 1.3, cx + t[0] * 1.3, cz + t[1] * 1.3, 0.62, 0.5, 0.25);
    for (const k of [-1, -0.5, 0, 0.5, 1]) mpObst(id, cx + t[0] * 1.3 * k, cz + t[1] * 1.3 * k, 0.35, 0.62); }
  for (const d of [0, 120, 240]){ const [x, z] = mpA(mpDeg(d), 9.4); luces.push({ x, z, r: 2.6, col: [0.08, 0.28, 0.32] });
    mpPad(id, G, x, z, 0x7ff5ff, g => { for (let i = 0; i < 6; i++){ const a = i / 6 * TAU; mpRoca(g, Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0.22, MPM.rocaR, 'musgo'); } }); }
  for (let i = 0; i < 6; i++){ const [x, z] = mpA(mpR() * TAU, 11 + mpR() * 5), y = 2.6 + mpR() * 1.6;   // más cristales flotantes
    const m = mesh(new THREE.OctahedronGeometry(0.3, 0), floatMat, x, y, z, G); m.scale.y = 1.8; m.userData = { y, i: i + 3 }; floaters.push(m); }
  for (let i = 0; i < 60; i++){ const [x, z] = mpA(mpR() * TAU, 8.5 + mpR() * 10); if (mpMapa(id).obst.some(o => Math.hypot(o.x - x, o.z - z) < o.r + 0.4)) continue; mpRoca(F, x, z, 0.1 + mpR() * 0.22, MPM.rocaR, 'musgo'); }
  for (let i = 0; i < 26; i++){ const [x, z] = mpA(mpR() * TAU, 21 + mpR() * 12); sube(mpRoca(F, x, z, 0.6 + mpR() * 1.2, MPM.rocaR, 'musgo', 2), x, z); }   // rocas en las colinas
  mpFusiona(F, G);
  // terreno: losas en la plaza y en los caminos a las puertas, hierba y tierra alrededor
  const camino = (x, z) => [90, 210, 330].some(d => { const a = mpDeg(d), u = [Math.cos(a), Math.sin(a)], along = x * u[0] + z * u[1], perp = Math.abs(-x * u[1] + z * u[0]); return along > 6 && along < 19 && perp < 1.2 + mpRuido(along, d) * 0.5; });
  mpTerreno(G, { tex: [MPT['ruinas-losas'], MPT['ruinas-hierba'], MPT['ruinas-tierra']], alt, luces, sombras: mpSombras(id),
    mezcla: (x, z) => { const r = Math.hypot(x, z), n = mpFbm(x * 0.18, z * 0.18, 3), losa = r < 7.9 + n * 1.2 || camino(x, z) ? 1 : 0;
      return losa ? [1, 0, 0.15 * n] : [0, n > 0.52 ? 0.25 : 1, n > 0.45 ? 1 : 0.2]; } });
  const hierbaMat = makeMat(0xffffff, { vc: true, viento: true, side: THREE.DoubleSide });
  mpInstancias(G, mpMataGeo(0.42, 0x1f3328, 0x6fa05a), hierbaMat, 3600, (x, z) => { const r = Math.hypot(x, z); if (r < 8.6 || r > 25 || camino(x, z)) return false;
    return mpFbm(x * 0.18, z * 0.18, 3) <= 0.5 && mpLibreEn(id, x, z, 0.3) || r > 19.5; }, [0.8, 1.3], alt);
}

/* ---------- Santuario de los Cerezos ---------- */
{ const id = 'sakura', G = sakuraGroup, F = new THREE.Group(), alt = (x, z) => mpColina(x, z, 6, 1.4), luces = [];
  const sube = (o, x, z) => { o.position.y = alt(x, z); return o; };
  const arbol = (x, z, s, choca = true) => { const g = mpFundido(G, x, z, mpHash(x, z) * 6, s, t => mpCerezo(t, 0, 0, 1)); if (choca) mpObst(id, x, z, 0.3 * s); mpOcl(id, x, z, 1.3 * s, g); return g; };
  for (const c of [...G.children]){
    if (!c.isGroup || !c.children[0]) continue; const m0 = c.children[0].material, s = c.scale.x, x = c.position.x, z = c.position.z;
    if (m0 === M.grass){ c.visible = false; continue; }
    if (c.children.some(m => m.material === Mw.red)){ c.visible = false; const t = mpFundido(G, x, z, c.rotation.y, s, g => mpToriiNuevo(g, 0, 0, 0, 1));   // torii
      for (const sx of [-1, 1]){ const lx = 1.3 * sx * s; mpObst(id, x + lx * Math.cos(c.rotation.y), z - lx * Math.sin(c.rotation.y), 0.26 * s, 99, t); } continue; }
    if (m0 === Mw.bark){ c.visible = false; arbol(x, z, s); continue; }                                        // cerezo
    if (m0 === Mw.stoneL){ c.visible = false; mpFarolNuevo(F, x, z, 1.15 * s); mpObst(id, x, z, 0.38 * s, 1.6 * s); luces.push({ x, z, r: 2.2, col: [0.3, 0.2, 0.08] }); }   // farol
  }
  const caminos = [30, 150, 270], sitios = [];
  for (const d of caminos){ const a = mpDeg(d), u = [Math.cos(a), Math.sin(a)], t = [-u[1], u[0]];
    for (const r of [9.4, 12.4]) for (const s of [-1, 1]){ const x = u[0] * r + t[0] * 1.45 * s, z = u[1] * r + t[1] * 1.45 * s; mpFarolNuevo(F, x, z, 1); mpObst(id, x, z, 0.3, 1.5); luces.push({ x, z, r: 2.0, col: [0.3, 0.2, 0.08] }); }
    const [cx, cz] = mpA(a, 15.9), rot = Math.atan2(-u[0], -u[1]); sitios.push([cx, cz]);
    const sant = mpFundido(G, cx, cz, rot, 1, g => mpSantuario(g, 0, 0, 0)); mpObst(id, cx, cz, 1.6, 99, sant);
    const tx = cx - u[0] * 2.6, tz = cz - u[1] * 2.6, tor = mpFundido(G, tx, tz, rot, 0.62, g => mpToriiNuevo(g, 0, 0, 0, 1));   // torii pequeño delante
    for (const s of [-1, 1]) mpObst(id, tx + t[0] * 0.8 * s, tz + t[1] * 0.8 * s, 0.18, 99, tor);
    luces.push({ x: cx - u[0] * 1.2, z: cz - u[1] * 1.2, r: 3.2, col: [0.32, 0.22, 0.1] }); }
  // estanque con carpas: se cruza de un salto largo
  const [px, pz] = mpA(mpDeg(90), 11.6), agua = mesh(new THREE.CircleGeometry(2.75, 28), makeMat(0x2f6aa8, { emissive: 0.45 }), px, 0.04, pz, G); agua.rotation.x = -Math.PI / 2;
  const brillo = mesh(new THREE.RingGeometry(1.2, 1.35, 24), makeMat(0x9fd8ff, { emissive: 1, opacity: 0.5 }), px, 0.05, pz, G); brillo.rotation.x = -Math.PI / 2;
  for (let i = 0; i < 18; i++){ const a = i / 18 * TAU, [x, z] = mpA(a, 2.95 + mpR() * 0.15); mpRoca(F, px + x, pz + z, 0.22 + mpR() * 0.16, MPM.rocaClara, 'musgo'); }
  for (let i = 0; i < 6; i++){ const [x, z] = mpA(mpR() * TAU, mpR() * 2.1); mesh(C(0.2, 0.2, 0.02, 10), makeMat(0x4a8a3a), px + x, 0.06, pz + z, G); }
  const kois = [0, 1, 2, 3].map(i => { const k = mesh(B(0.12, 0.05, 0.34), makeMat(i % 2 ? 0xff7a2a : 0xf4efe2, { emissive: 0.25 }), px, 0.06, pz, G); k.userData = { a: i * 1.6, r: 0.9 + i * 0.38, v: 0.6 + i * 0.15 }; return k; });
  mpMapa(id).agua.push({ x: px, z: pz, r: 2.75, anim(zn, dt){ brillo.scale.setScalar(1 + 0.25 * Math.sin(time * 1.3)); for (const k of kois){ const u = k.userData; u.a += dt * u.v; k.position.set(px + Math.cos(u.a) * u.r, 0.06, pz + Math.sin(u.a) * u.r); k.rotation.y = -u.a; } } });
  mpObst(id, px, pz, 2.75, 0.3);
  const pads = [0, 120, 240].map(d => mpA(mpDeg(d), 9.5));
  for (const [x, z] of pads){ luces.push({ x, z, r: 2.4, col: [0.3, 0.12, 0.2] });
    mpPad(id, G, x, z, 0xff9ac8, g => { for (let i = 0; i < 7; i++){ const a = i / 7 * TAU; mesh(C(0.05, 0.06, 0.5 + (i % 3) * 0.22, 6), makeMat(0x6aa84a), Math.cos(a) * 1.05, 0.3, Math.sin(a) * 1.05, g); } }); }
  // arboledas y el bosque del borde
  const arboles = []; for (const o of mpMapa(id).obst) if (o.r < 0.45) arboles.push([o.x, o.z]);
  for (let n = 0, tries = 0; n < 16 && tries < 400; tries++){ const a = mpR() * TAU, r = 10.5 + mpR() * 6.8, [x, z] = mpA(a, r);
    if (caminos.some(d => Math.abs(((a - mpDeg(d)) % TAU + TAU + Math.PI) % TAU - Math.PI) < 0.24) && r < 15.5) continue;
    if (!mpLejos(sitios, x, z, 3.4) || !mpLejos(pads, x, z, 2.6) || Math.hypot(x - px, z - pz) < 4.5 || !mpLejos(arboles, x, z, 2.4)) continue;
    arboles.push([x, z]); arbol(x, z, 0.9 + mpR() * 0.45); n++; }
  for (let i = 0; i < 20; i++){ const a = i / 20 * TAU + mpR() * 0.15, [x, z] = mpA(a, 19.8 + mpR() * 2.5); sube(arbol(x, z, 1.1 + mpR() * 0.5, false), x, z); }
  for (let i = 0; i < 44; i++){ const a0 = i / 44 * TAU, [x, z] = mpA(a0, 18.7), [x1, z1] = mpA(a0 + TAU / 44, 18.7), L = Math.hypot(x1 - x, z1 - z);   // valla lacada
    mesh(mpGeo('posteValla', () => mpColores(new THREE.BoxGeometry(0.1, 0.85, 0.1), (c, xx, y) => mpAO(c, y + 0.42, 0.8, 0.6))), MPM.laca, x, 0.42, z, F);
    for (const y of [0.4, 0.74]){ const r = mesh(mpGeo('larguero', () => mpColores(new THREE.BoxGeometry(1, 0.07, 0.05), () => {})), MPM.laca, (x + x1) / 2, y, (z + z1) / 2, F); r.scale.x = L; r.rotation.y = Math.atan2(-(z1 - z), x1 - x); } }
  mpFusiona(F, G);
  const camino = (x, z) => caminos.some(d => { const a = mpDeg(d), u = [Math.cos(a), Math.sin(a)], along = x * u[0] + z * u[1], perp = Math.abs(-x * u[1] + z * u[0]); return along > 6 && along < 15 && perp < 0.95; });
  mpTerreno(G, { tex: [MPT['sakura-losas'], MPT['sakura-hierba'], MPT['sakura-tierra']], alt, luces, sombras: mpSombras(id),
    mezcla: (x, z) => { const r = Math.hypot(x, z), n = mpFbm(x * 0.16 + 5, z * 0.16, 3);
      if (r < 7.7 || camino(x, z)) return [1, 0, 0.1];
      if (r < 9.2 || sitios.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 3.3)) return [0.1, 0.2, 1];
      return [0, 1, n > 0.6 ? 0.6 : 0.05]; } });
  const hierbaMat = makeMat(0xffffff, { vc: true, viento: true, side: THREE.DoubleSide });
  mpInstancias(G, mpMataGeo(0.48, 0x24422a, 0x8ac060), hierbaMat, 4200, (x, z) => { const r = Math.hypot(x, z); if (r < 9.4 || r > 26 || camino(x, z)) return false;
    return mpLibreEn(id, x, z, 0.3) && !sitios.some(([sx, sz]) => Math.hypot(x - sx, z - sz) < 3.4) || r > 19.5; }, [0.8, 1.3], alt);
  mpInstancias(G, mpPetaloGeo(), makeMat(0xffffff, { vc: true, emissive: 0.15 }), 1600, (x, z) => Math.hypot(x, z) < 22 && !mpEnZona(mpMapa(id).agua, { x, z }), [0.8, 1.6]);
}

/* ---------- Cumbre Nevada ---------- */
{ const id = 'cumbre', G = snowGroup, F = new THREE.Group(), alt = (x, z) => mpColina(x, z, 10, 3.2), luces = [];
  const sube = (o, x, z) => { o.position.y = alt(x, z); return o; };
  const pinos = [], pino = (x, z, s, choca = true) => { const g = mpFundido(G, x, z, mpHash(x, z) * 6, s, t => mpPinoNuevo(t, 0, 0, 1));
    if (choca){ mpObst(id, x, z, 0.32 * s); pinos.push([x, z]); } mpOcl(id, x, z, 1.0 * s, g); return g; };
  for (const c of [...G.children]){
    const s = c.scale.x, x = c.position.x, z = c.position.z;
    if (c.isGroup && c.children.some(m => m.material === Mw.pine)){ c.visible = false; pino(x, z, s); continue; }
    if (c.isMesh && c.material === Mw.rockS && c.geometry.type === 'IcosahedronGeometry'){ c.visible = false; const r = c.geometry.parameters.radius * s; mpRoca(F, x, z, r, MPM.roca, 'nieve'); mpObst(id, x, z, r * 0.95, 0.6); continue; }
    if (c.isMesh && c.material === Mw.ice){ mpObst(id, x, z, 0.32, 2); luces.push({ x, z, r: 1.6, col: [0.05, 0.16, 0.22] }); continue; }
    if (c.isGroup && c.children[0] && c.children[0].material === Mw.rockS){ mpObst(id, x, z, 0.7, 99, c); luces.push({ x: x + 0.5, z: z + 0.5, r: 2.5, col: [0.3, 0.2, 0.08] }); }   // cabaña
  }
  // lago helado: resbala
  const [lx, lz] = mpA(mpDeg(200), 11.2), hg = new THREE.CircleGeometry(4.3, 32); hg.rotateX(-Math.PI / 2);
  { const uv = hg.attributes.uv, p = hg.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / 3, p.getZ(i) / 3); }
  mpColores(hg, (c, x, y, z) => c.multiplyScalar(0.8 + 0.3 * (1 - Math.hypot(x, z) / 4.3)));
  const hielo = new THREE.Mesh(hg, MPM.hielo); hielo.position.set(lx, 0.03, lz); G.add(hielo);
  for (let i = 0; i < 22; i++){ const a = i / 22 * TAU, [x, z] = mpA(a, 4.55 + mpR() * 0.4); mpRoca(F, lx + x, lz + z, 0.35 + mpR() * 0.3, MPM.roca, 'nieve'); }
  for (let i = 0; i < 9; i++){ const a = mpR() * TAU, [x, z] = mpA(a, 4.4 + mpR() * 0.6), c = mesh(new THREE.OctahedronGeometry(0.3, 0), Mw.ice, lx + x, 0.6, lz + z, G); c.scale.set(1, 2.2 + mpR(), 1); mpObst(id, lx + x, lz + z, 0.3, 2); }
  mpMapa(id).hielo.push({ x: lx, z: lz, r: 4.2 });
  luces.push({ x: lx, z: lz, r: 5.5, col: [0.04, 0.1, 0.16] });
  const pads = [30, 150, 270].map(d => mpA(mpDeg(d), 9.5));
  for (const [x, z] of pads){ luces.push({ x, z, r: 2.5, col: [0.1, 0.18, 0.24] });
    mpPad(id, G, x, z, 0xdff6ff, g => { for (let i = 0; i < 7; i++){ const a = i / 7 * TAU; mpRoca(g, Math.cos(a) * 1.1, Math.sin(a) * 1.1, 0.24, MPM.roca, 'nieve'); } }); }
  // grandes rocas: las altas tapan los orbes, las medianas se saltan
  const rocas = [];
  for (let n = 0, tries = 0; n < 7 && tries < 200; tries++){ const a = mpR() * TAU, r = 12 + mpR() * 4.5, [x, z] = mpA(a, r);
    if (Math.hypot(x - lx, z - lz) < 6.5 || !mpLejos(pads, x, z, 3.5) || !mpLejos(rocas, x, z, 5)) continue;
    rocas.push([x, z]); const R = 1.2 + mpR() * 0.6, big = mpRoca(G, x, z, R, MPM.roca, 'nieve', 2); mpObst(id, x, z, R * 1.05, 99, big);
    for (let k = 0; k < 2; k++){ const b = mpR() * TAU, rr = 0.45 + mpR() * 0.3, mx = x + Math.cos(b) * (R + 0.9), mz = z + Math.sin(b) * (R + 0.9); mpRoca(F, mx, mz, rr, MPM.roca, 'nieve'); mpObst(id, mx, mz, rr * 1.05, 0.8); } n++; }
  for (let n = 0, tries = 0; n < 20 && tries < 400; tries++){ const a = mpR() * TAU, r = 10.5 + mpR() * 7, [x, z] = mpA(a, r);
    if (Math.hypot(x - lx, z - lz) < 5.6 || !mpLejos(pads, x, z, 2.6) || !mpLejos(rocas, x, z, 3) || !mpLejos(pinos, x, z, 2.2)) continue;
    pinos.push([x, z]); pino(x, z, 1 + mpR() * 0.6); n++; }
  for (let i = 0; i < 24; i++){ const a = i / 24 * TAU + mpR() * 0.12, [x, z] = mpA(a, 19.6 + mpR() * 3); sube(pino(x, z, 1.3 + mpR() * 0.6, false), x, z); }
  for (let i = 0; i < 30; i++){ const [x, z] = mpA(mpR() * TAU, 21 + mpR() * 12); sube(mpRoca(F, x, z, 0.8 + mpR() * 1.6, MPM.roca, 'nieve', 2), x, z); }
  mpFusiona(F, G);
  mpTerreno(G, { tex: [MPT['nieve'], MPT['roca'], MPT['cumbre-grava']], esc: [0.7, 1], alt, luces, sombras: mpSombras(id),
    mezcla: (x, z) => { const r = Math.hypot(x, z), n = mpFbm(x * 0.14 + 9, z * 0.14, 3), cuesta = mpSmooth(23, 32, r) * (n > 0.45 ? 1 : 0.2);
      return [1, cuesta, n > 0.62 && r < 19 ? 0.7 : 0]; } });
  mpInstancias(G, mpMataGeo(0.32, 0x4a3a2a, 0xb8a888), makeMat(0xffffff, { vc: true, viento: true, side: THREE.DoubleSide }), 900, (x, z) => { const r = Math.hypot(x, z);
    return r > 8 && r < 24 && mpFbm(x * 0.3, z * 0.3, 2) > 0.55 && mpLibreEn(id, x, z, 0.3) && Math.hypot(x - lx, z - lz) > 4.8; }, [0.6, 1.1], alt);
}

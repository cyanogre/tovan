'use strict';
/* ======================================================================
   PODERES FOIL · JUEGOS (B)
   Cinco foil sacados de videojuegos, cada uno con su estética y su prefijo:
     · Dinosaurio verde (de un amigo del fontanero) [yos]: saltar en el aire
       (doble salto) rompe un huevo de motas bajo Tovan y sale el dinosaurio:
       montura de 15 s. Atacar = lengua que se traga a los enemigos (a los
       jefes les pega); con la boca llena, el siguiente ataque lanza un huevo
       que rebota y estalla (los huevos le siguen en fila). Saltar = salto con
       revoloteo que pisa al caer; rodar = embestida (suelo) o culetazo (aire).
     · Invocación: Rey dragón (de una fantasía que nunca es final) [bah]:
       especial = invocación guionizada de ~4,5 s (Tovan intocable): el cielo
       se oscurece, un círculo de runas, el rey dragón baja, carga y suelta el
       «Megafulgor»: cúpula blanca, anillos, escombros y números enormes.
     · ¡Ataque total! (de unos ladrones fantasma) [prs]: los críticos y los
       remates derriban (4 s, estrellitas, «¡1 MÁS!»); con 3 derribados, el
       siguiente remate lanza el ataque total: viñetas en diagonal, nubes de
       pelea de dibujos animados y una tarjeta de letras recortadas.
     · Estilo SSS (de un cazador de demonios) [dmc]: medidor de estilo D…SSS
       (+6 % de daño por rango) que premia variar; al llegar a SSS, «¡Gatillo
       demoníaco!»: 10 s con alas, ojos rojos, aura y tajos rojos.
     · Lluvia de tetriminós (de un juego ruso) [tet]: el remate tira cuatro
       piezas de cubos biselados sobre los más cercanos; si aciertan las
       cuatro, «¡TETRIS!» y un láser de línea completada.
   Nada usa rnd() al cargar: los lienzos se pintan con mulberry32 y los
   modelos se construyen la primera vez que hacen falta.
   ====================================================================== */

/* ========== 1 · DINOSAURIO VERDE (yos) ========== */
const YOS = { m: null, F: null, cd: 0, boca: 0, lenguaE: null, huevos: [], hist: [], fase: 0, aire: false, revol: 0, nRevol: 0, pisaT: new Map(), carrera: 0, ya: null, culo: false, despide: null, llegaT: 0, abre: 0, marca: '' };
const YOS_DUR = 15, YOS_CD = 10, YOS_ALTO = 0.56, YOS_LMAX = 5;
const yosIco = (r, d = 1) => new THREE.IcosahedronGeometry(r, d);
function yosModelo(){
  if (YOS.m) return YOS.m;
  const M_ = { verde: makeMat(0x4cc83e), blanco: makeMat(0xf7f5ea), rojo: makeMat(0xe02a1e), naranja: makeMat(0xff8c1a), negro: makeMat(0x101014, { emissive: 0.2 }), rosa: makeMat(0xff6fa8, { emissive: 0.3 }) };
  const raiz = new THREE.Group(); raiz.visible = false; hero.add(raiz);
  // el cuerpo (lo que no se mueve), fundido por material
  const fija = new THREE.Group(); let m;
  m = mesh(yosIco(0.5), M_.verde, 0, 0.84, -0.06, fija); m.scale.set(0.95, 0.9, 1.22);
  m = mesh(yosIco(0.4), M_.blanco, 0, 0.76, 0.17, fija); m.scale.set(0.85, 0.92, 0.8);                               // barriga
  m = mesh(new THREE.ConeGeometry(0.2, 0.8, 6), M_.verde, 0, 0.66, -0.78, fija); m.rotation.x = -1.9;                 // cola
  m = mesh(C(0.17, 0.25, 0.56, 7), M_.verde, 0, 1.2, 0.3, fija); m.rotation.x = 0.45;                                 // cuello
  m = mesh(yosIco(0.36), M_.rojo, 0, 1.2, -0.14, fija); m.scale.set(1, 0.36, 1.12);                                   // silla
  m = mesh(new THREE.TorusGeometry(0.34, 0.05, 4, 12), M_.blanco, 0, 1.16, -0.14, fija); m.rotation.x = Math.PI / 2; m.scale.set(1, 1.12, 1);
  for (const s of [-1, 1]){ m = mesh(C(0.06, 0.08, 0.32, 5), M_.verde, 0.34 * s, 0.98, 0.38, fija); m.rotation.set(-0.9, 0, 0.5 * s);   // bracitos
    mesh(yosIco(0.07, 0), M_.blanco, 0.42 * s, 0.9, 0.52, fija); }
  for (let i = 0; i < 3; i++){ m = mesh(new THREE.ConeGeometry(0.07, 0.18, 4), M_.rojo, 0, 1.12 - i * 0.2, -0.52 - i * 0.14, fija); m.rotation.x = -0.8 - i * 0.25; }   // púas
  const cuerpo = new THREE.Group(); mpFusiona(fija, cuerpo); raiz.add(cuerpo);
  // la cabeza: nariz redonda, ojos grandes, carrillos blancos y la mandíbula aparte
  const cab = new THREE.Group(); cab.position.set(0, 1.5, 0.42); raiz.add(cab);
  const cf = new THREE.Group();
  m = mesh(yosIco(0.33), M_.verde, 0, 0.06, -0.04, cf); m.scale.set(1, 0.95, 1.05);
  m = mesh(yosIco(0.31), M_.verde, 0, 0, 0.36, cf); m.scale.set(1.08, 0.86, 1.02);
  m = mesh(yosIco(0.25), M_.blanco, 0, -0.15, 0.22, cf); m.scale.set(1.08, 0.55, 1.15);
  for (const s of [-1, 1]){ m = mesh(yosIco(0.13), M_.blanco, 0.12 * s, 0.32, 0.1, cf); m.scale.set(0.8, 1.3, 0.75);
    m = mesh(yosIco(0.06), M_.negro, 0.125 * s, 0.33, 0.19, cf); m.scale.set(0.75, 1.35, 0.5);
    mesh(yosIco(0.03, 0), M_.blanco, 0.11 * s, 0.39, 0.215, cf); }
  for (let i = 0; i < 3; i++){ m = mesh(new THREE.ConeGeometry(0.075, 0.2, 4), M_.rojo, 0, 0.22 - i * 0.17, -0.32 - i * 0.03, cf); m.rotation.x = -1.6; }
  mpFusiona(cf, cab);
  const mand = new THREE.Group(); mand.position.set(0, -0.14, 0.12); cab.add(mand);
  { const jf = new THREE.Group(); const q = mesh(yosIco(0.22), M_.blanco, 0, -0.05, 0.2, jf); q.scale.set(1, 0.45, 1.25); mpFusiona(jf, mand); }
  // patas con zapatos naranjas
  const patas = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(0.3 * s, 0.62, -0.02); raiz.add(g); const pf = new THREE.Group();
    const q = mesh(yosIco(0.21), M_.verde, 0, -0.04, 0, pf); q.scale.set(0.9, 1, 1.05);
    mesh(C(0.1, 0.12, 0.36, 6), M_.verde, 0, -0.3, 0.02, pf); mesh(roundedBoxGeo(0.26, 0.2, 0.4, 0.4, 3), M_.naranja, 0, -0.52, 0.08, pf);
    mpFusiona(pf, g); return g; });
  // la lengua: un tubo rosa que se estira en z y una bola en la punta
  const lg = new THREE.Group(); lg.position.set(0, 1.36, 0.92); lg.visible = false; raiz.add(lg);
  const tg = C(0.06, 0.07, 1, 6); tg.rotateX(Math.PI / 2); tg.translate(0, 0, 0.5);
  const tubo = mesh(tg, M_.rosa, 0, 0, 0, lg), punta = mesh(yosIco(0.15), M_.rosa, 0, 0, 1, lg);
  // huevo de motas (se clona la geometría fundida para cada huevo) y las dos mitades del cascarón grande
  const motas = [[0.3, 0.5], [2.2, 0.35], [4.1, 0.7], [1.2, 1.45], [3.3, 1.8], [5.2, 1.3], [0.6, 2.3], [2.8, 2.6], [4.6, 2.2]];
  const hf = new THREE.Group(); m = mesh(yosIco(0.24), M_.blanco, 0, 0, 0, hf); m.scale.set(1, 1.28, 1);
  for (const [a, f] of motas) mesh(yosIco(0.07, 0), M_.verde, Math.sin(f) * Math.cos(a) * 0.235, Math.cos(f) * 0.3, Math.sin(f) * Math.sin(a) * 0.235, hf);
  const huevoG = new THREE.Group(); mpFusiona(hf, huevoG);
  const mitad = (arriba) => { const g = new THREE.Group(), t = new THREE.Group(); const q = mesh(new THREE.SphereGeometry(0.24, 10, 4, 0, TAU, arriba ? 0 : Math.PI / 2, Math.PI / 2), M_.blanco, 0, 0, 0, t); q.scale.y = 1.28; q.material = makeMat(0xf7f5ea, { side: THREE.DoubleSide });
    for (const [a, f] of motas) if ((f < Math.PI / 2) === arriba) mesh(yosIco(0.07, 0), M_.verde, Math.sin(f) * Math.cos(a) * 0.235, Math.cos(f) * 0.3, Math.sin(f) * Math.sin(a) * 0.235, t);
    mpFusiona(t, g); g.visible = false; scene.add(g); return g; };
  const casc = { entero: huevoG.clone(), arriba: mitad(true), abajo: mitad(false) }; casc.entero.visible = false; scene.add(casc.entero);
  YOS.m = { raiz, cuerpo, cab, mand, patas, lg, tubo, punta, huevoG, casc, M: M_ };
  return YOS.m;
}
const yosTragable = e => !foilJefe(e) && !e.cap && e.type !== 'puesto' && !e.noSep && e.reach !== false && !e.colFase && !e.terFase;
/* ---------- Llegada: el huevo se rompe bajo Tovan ---------- */
function yosLlega(){
  const F = foilForma({ id: 'yosMontura', nom: 'DINOSAURIO VERDE', col: '#7ee86a', dur: YOS_DUR, velK: 1.35, camK: 1.16, alto: 0,
    empieza: yosEmpieza, ataque: yosAtaca, saltar: yosSalta, rodar: yosRueda, pose: yosPose, postPose: yosPostPose, fin: yosFin });
  if (!F) return false;
  YOS.F = F; return true;
}
function yosEmpieza(){
  const m = yosModelo(); yosGuarda(); m.raiz.visible = true; m.raiz.scale.setScalar(0.01);
  Object.assign(YOS, { boca: 0, fase: 0, aire: true, revol: 0, nRevol: 0, carrera: 0, culo: false, lenguaE: null, llegaT: 0, abre: 0 }); YOS.pisaT.clear(); YOS.hist.length = 0;
  vy = Math.max(vy, 4.4); grounded = false; MOV11.cut = true; MOV11.held = false;
  yosCascaron(hero.position.x, hero.position.y, hero.position.z);
  flash('#eaffd8', 0.35); shake = Math.max(shake, 0.2); play('yosRompe'); play('yosGorjeo');
  foilRotulo('<b>¡HUEVO!</b>', 'yosRot', 1.1); foilGrito('¡Dinosaurio verde!', '#8af07a');
  barkOnce('foil_yos', '¿Un huevo con patas? Ah, no: un dinosaurio. Y te deja subirte. Qué majo. Yo no me fiaría de esa lengua.');
}
function yosCascaron(x, y, z){
  const C_ = YOS.m.casc, by = Math.max(0.2, y - 0.25);
  C_.entero.visible = true; C_.entero.position.set(x, by, z); C_.entero.scale.setScalar(0.01); C_.entero.rotation.set(0, 0, 0);
  const vA = new V3((rnd() - 0.5) * 3, 6, (rnd() - 0.5) * 3), vB = new V3((rnd() - 0.5) * 2, -1, (rnd() - 0.5) * 2); let roto = false;
  foilFx.push({ t: 0, upd(dt){
      if (this.t < 0.16){ C_.entero.scale.setScalar(lerp(0.4, 3.2, this.t / 0.16)); C_.entero.rotation.z = Math.sin(this.t * 90) * 0.15; return true; }
      if (!roto){ roto = true; C_.entero.visible = false;
        for (const q of [C_.arriba, C_.abajo]){ q.visible = true; q.position.set(x, by, z); q.scale.setScalar(3.2); q.rotation.set(0, rnd() * TAU, 0); }
        for (let i = 0; i < 16; i++){ const a = rnd() * TAU; spawnFx(x, by + 0.3, z, Math.cos(a) * 4, 2 + rnd() * 4, Math.sin(a) * 4, i % 3 ? 0xf7f5ea : 0x4cc83e, 0.09, 0.6, 12, 0); } }
      const k = this.t - 0.16; if (k > 0.75) return false;
      vA.y -= 18 * dt; C_.arriba.position.addScaledVector(vA, dt); C_.arriba.rotation.x += dt * 9; C_.arriba.rotation.z += dt * 5;
      vB.y -= 18 * dt; C_.abajo.position.addScaledVector(vB, dt); if (C_.abajo.position.y < 0.05){ C_.abajo.position.y = 0.05; vB.set(0, 0, 0); }
      const s = 3.2 * (k > 0.45 ? Math.max(0.01, 1 - (k - 0.45) / 0.3) : 1); C_.arriba.scale.setScalar(s); C_.abajo.scale.setScalar(s);
      return true; },
    fin(){ C_.entero.visible = C_.arriba.visible = C_.abajo.visible = false; } });
}
/* ---------- Mandos de la montura ---------- */
function yosApunta(R){
  let f = inputMag > 0.12 ? inputHeading : hero.rotation.y, best = null, bd = 1e9;
  for (const e of foilEnemigos(hero.position, R)){ const dx = e.g.position.x - hero.position.x, dz = e.g.position.z - hero.position.z;
    let da = Math.atan2(dx, dz) - f; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) > (inputMag > 0.12 ? 0.8 : Math.PI)) continue;
    const sc = Math.hypot(dx, dz) - e.r + Math.abs(da) * 2; if (sc < bd){ bd = sc; best = e; } }
  if (best) f = Math.atan2(best.g.position.x - hero.position.x, best.g.position.z - hero.position.z);
  return f;
}
function yosAtaca(){
  if (YOS.lenguaE || YOS.llegaT < 0.25 || YOS.culo) return;
  if (YOS.boca > 0){ yosLanzaHuevo(); return; }
  const f = yosApunta(YOS_LMAX + 1.5); heading = f; hero.rotation.y = f;
  YOS.lenguaE = { t: 0, f, L: 0, presa: null, fase: 'sale' }; YOS.m.lg.visible = true; play('yosLengua');
}
function yosSalta(){
  if (YOS.lenguaE && YOS.lenguaE.presa) return true;
  if (grounded){ grounded = false; vy = 8.6 * jumpMul(); YOS.nRevol = 0; YOS.revol = 0; YOS.culo = false; MOV11.cut = true; MOV11.held = false; play('yosSalto'); puff(6, 1.2); return true; }
  if (YOS.nRevol < 2 && !YOS.culo){ YOS.nRevol++; YOS.revol = 0.7; play('yosAleteo'); }
  return true;
}
function yosRueda(){
  if (YOS.lenguaE) return true;
  if (!grounded){ if (!YOS.culo){ YOS.culo = true; YOS.revol = 0; vy = -17; player.inv = Math.max(player.inv, 0.5); play('yosCulo0'); } return true; }
  if (YOS.carrera > 0) return true;
  const a = inputMag > 0.12 ? inputHeading : hero.rotation.y;
  MOV11.vx = Math.sin(a) * 12.5; MOV11.vz = Math.cos(a) * 12.5; heading = a; hero.rotation.y = a;
  YOS.carrera = 0.42; YOS.ya = new Set(); player.inv = Math.max(player.inv, 0.3); play('roll'); play('yosGorjeo'); puff(6, 1.6);
  return true;
}
/* ---------- Cada fotograma ---------- */
const yosV0 = new V3();
function yosPunta(T, v){ const k = hero.scale.x, s = Math.sin(T.f), c = Math.cos(T.f), z = 0.92 + T.L; return v.set(hero.position.x + s * z * k, hero.position.y + 1.36 * k, hero.position.z + c * z * k); }
function yosLenguaTick(dt){
  const T = YOS.lenguaE, m = YOS.m; if (!T) return;
  T.t += dt; hero.rotation.y = heading = T.f;
  const k = hero.scale.x, s = Math.sin(T.f), c = Math.cos(T.f), bx = hero.position.x + s * 0.92 * k, bz = hero.position.z + c * 0.92 * k;
  if (T.fase === 'sale'){
    T.L = Math.min(YOS_LMAX, T.L + dt * 38);
    let best = null, bd = 1e9;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || e.yosTrag) continue;
      const dx = e.g.position.x - bx, dz = e.g.position.z - bz, al = dx * s + dz * c, pe = Math.abs(dx * c - dz * s);
      if (al > -0.4 && al < T.L * k + e.r * 0.6 && pe < e.r + 0.3 && al < bd){ bd = al; best = e; } }
    if (best){ T.L = clamp(bd / k, 0.4, YOS_LMAX); T.fase = 'vuelve'; T.L0 = T.L;
      if (yosTragable(best)){ T.presa = best; best.yosTrag = true; best.vx = best.vz = 0; if (best.tele) best.tele.visible = false; play('yosAtrapa'); }
      else { foilGolpea(best, rdmg(28), s, c, 3, null, 1); sparks(best.g.position.x, 1, best.g.position.z, 8, 0xff8fc0, 4); play('yosAtrapa'); } }
    else if (T.L >= YOS_LMAX){ T.fase = 'vuelve'; T.L0 = T.L; }
  } else {
    T.L = Math.max(0, T.L - dt * 30);
    const e = T.presa;
    if (e){ if (!e.alive){ T.presa = null; e.yosTrag = false; }
      else { yosPunta(T, yosV0); e.g.position.set(yosV0.x, Math.max(0, yosV0.y - 0.7 * e.scale), yosV0.z); e.g.scale.setScalar(e.scale * (0.45 + 0.55 * T.L / Math.max(0.1, T.L0))); } }
    if (T.L <= 0.02){ if (T.presa) yosTraga(T.presa); YOS.lenguaE = null; m.lg.visible = false; }
  }
  m.tubo.scale.z = Math.max(0.01, T.L); m.punta.position.z = T.L;
}
function yosTraga(e){
  e.yosTrag = false; if (!e.alive) return;
  const x = e.g.position.x, z = e.g.position.z; e.g.visible = false; e.g.position.y = 0; e.g.scale.setScalar(e.scale);
  tA.set(hero.position.x, hero.position.y + 2.6, hero.position.z); spawnNumber(tA, '¡Ñam!', 'react', '#ff9ccc');
  killEnemy(e); for (let i = 0; i < 6; i++){ const a = rnd() * TAU; spawnFx(x, 1.4, z, Math.cos(a) * 1.5, 1.5, Math.sin(a) * 1.5, 0xff9ccc, 0.06, 0.35, 4, 0); }
  if (YOS.boca < 3){ YOS.boca++; yosHuevoSigue(); } play('yosTraga');
}
// Huevos: los de la boca siguen al dinosaurio en fila; al lanzarlos rebotan y estallan
function yosHuevoCoge(){
  let h = YOS.huevos.find(q => !q.modo); if (!h){ if (YOS.huevos.length >= 6) return null; h = { g: YOS.m.huevoG.clone(), v: new V3() }; scene.add(h.g); YOS.huevos.push(h); }
  h.g.visible = true; h.g.scale.setScalar(1); h.t = 0; h.reb = 0; return h;
}
function yosHuevoSuelta(h){ h.modo = null; h.g.visible = false; }
function yosHuevoSigue(){ const h = yosHuevoCoge(); if (!h) return; h.modo = 'sigue'; h.i = YOS.huevos.filter(q => q.modo === 'sigue').length - 1; h.g.position.set(hero.position.x, 0.3, hero.position.z); h.g.scale.setScalar(0.01); }
function yosLanzaHuevo(){
  const L = YOS.huevos.filter(q => q.modo === 'sigue').sort((a, b) => a.i - b.i); YOS.boca = Math.max(0, YOS.boca - 1);
  const h = L[0] || yosHuevoCoge(); if (!h) return;
  for (const q of L) if (q !== h) q.i--;
  const f = yosApunta(10); heading = f; hero.rotation.y = f; YOS.abre = 0.25;
  h.modo = 'vuela'; h.t = 0; h.reb = 0; h.g.scale.setScalar(1.25);
  h.g.position.set(hero.position.x + Math.sin(f) * 1.1, hero.position.y + 1.45, hero.position.z + Math.cos(f) * 1.1); h.v.set(Math.sin(f) * 11, 3.4, Math.cos(f) * 11);
  play('yosHuevo'); foilGrito('¡Huevo va!', '#bdf7a8');
}
function yosRevienta(h){
  const p = h.g.position, d = rdmg(44), ya = new Set();
  for (const e of foilEnemigos(p, 2.4)){ const dx = e.g.position.x - p.x, dz = e.g.position.z - p.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, d, dx / l, dz / l, 5, null, 1, ya); }
  ringFx(p.x, p.z, 0x8af07a, 0.3, 2.6, 0.35); ringFx(p.x, p.z, 0xffffff, 0.2, 1.6, 0.25, 0.4); lightFlash(p.x, 1, p.z, 0xc8ffb0, 1.6, 6); shake = Math.max(shake, 0.25);
  for (let i = 0; i < 18; i++){ const a = rnd() * TAU; spawnFx(p.x, Math.max(0.3, p.y), p.z, Math.cos(a) * 5, 2 + rnd() * 4, Math.sin(a) * 5, i % 3 ? 0xf7f5ea : 0x4cc83e, 0.1, 0.6, 12, 0); }
  play('yosRevienta'); yosHuevoSuelta(h);
}
function yosHuevosTick(dt){
  const H = YOS.hist;
  for (const h of YOS.huevos){ if (!h.modo) continue; const g = h.g;
    if (h.modo === 'sigue'){ if (!YOS.F){ puffAt(g.position.x, g.position.z, 5, 1, 0xf7f5ea); yosHuevoSuelta(h); continue; }
      const q = H[Math.min(H.length - 1, (h.i + 1) * 7)]; if (!q) continue;
      const tx = q[0] - Math.sin(q[2]) * 0.75, tz = q[1] - Math.cos(q[2]) * 0.75; g.position.x += (tx - g.position.x) * Math.min(1, dt * 14); g.position.z += (tz - g.position.z) * Math.min(1, dt * 14);
      g.position.y = 0.32 + Math.abs(Math.sin(time * 9 + h.i * 1.3)) * 0.18; g.rotation.set(0, q[2], Math.sin(time * 9 + h.i) * 0.2); g.scale.setScalar(Math.min(1, g.scale.x + dt * 6)); continue; }
    h.t += dt; h.v.y -= 20 * dt; g.position.addScaledVector(h.v, dt); g.rotation.x += dt * 14; g.rotation.z += dt * 6;
    if (g.position.y < 0.3 && h.v.y < 0){ g.position.y = 0.3; h.v.y = Math.max(3.2, -h.v.y * 0.62); h.v.x *= 0.85; h.v.z *= 0.85; h.reb++; play('yosBota'); puffAt(g.position.x, g.position.z, 3, 0.8, 0xe8f0d0); }
    let pega = h.reb >= 3 || h.t > 2.4;
    if (!pega) for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue; if (Math.hypot(e.g.position.x - g.position.x, e.g.position.z - g.position.z) < e.r + 0.4 && g.position.y < 1.8 * e.scale){ pega = true; break; } }
    if (pega) yosRevienta(h); }
}
function yosPisa(e){
  YOS.pisaT.set(e, time); const dx = e.g.position.x - hero.position.x, dz = e.g.position.z - hero.position.z, l = Math.max(0.01, Math.hypot(dx, dz));
  foilGolpea(e, rdmg(30), dx / l, dz / l, 2, null, 1); vy = 7.4; YOS.revol = 0; YOS.nRevol = 0; YOS.culo = false;
  sparks(e.g.position.x, e.numY * 0.8, e.g.position.z, 10, 0xffe66a, 4); ringFx(e.g.position.x, e.g.position.z, 0xffe66a, 0.2, 1.4, 0.25, 0.3); play('yosPisa');
  tA.set(e.g.position.x, e.numY + 0.6, e.g.position.z); spawnNumber(tA, '¡Pisotón!', 'react', '#ffe66a');
}
function yosAterriza(){
  const O = hero.position, big = YOS.culo, R = big ? 2.8 : 1.5, d = rdmg(big ? 40 : 14), ya = new Set();
  for (const e of foilEnemigos(O, R)){ const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, d, dx / l, dz / l, big ? 6 : 3, null, 1, ya); }
  ringFx(O.x, O.z, big ? 0xffd23a : 0x8af07a, 0.3, R + 0.4, 0.35); puffAt(O.x, O.z, big ? 14 : 6, big ? 3 : 1.6, 0xe8f0d0);
  if (big){ shake = Math.max(shake, 0.45); for (let i = 0; i < 10; i++){ const a = i / 10 * TAU; spawnFx(O.x + Math.cos(a), 0.3, O.z + Math.sin(a), Math.cos(a) * 4, 3, Math.sin(a) * 4, 0xffe66a, 0.09, 0.5, 10, 0); } play('yosCulo'); }
  else play('yosPaso');
  YOS.culo = false; YOS.nRevol = 0; YOS.revol = 0;
}
function yosFormaTick(dt){
  const F = YOS.F; YOS.llegaT += dt; F.alto = YOS_ALTO * Math.min(1, YOS.llegaT / 0.18);
  YOS.hist.unshift([hero.position.x, hero.position.z, hero.rotation.y]); if (YOS.hist.length > 30) YOS.hist.length = 30;
  const sp = Math.hypot(MOV11.vx, MOV11.vz); YOS.fase += dt * sp * 2.6; if (YOS.abre > 0) YOS.abre -= dt;
  if (!grounded){
    YOS.aire = true;
    if (YOS.revol > 0){ YOS.revol -= dt; vy = lerp(vy, 2.1, 1 - Math.exp(-dt * 9)); if (rnd() < dt * 14) spawnFx(hero.position.x + (rnd() - 0.5) * 0.6, hero.position.y + 0.1, hero.position.z + (rnd() - 0.5) * 0.6, 0, -1, 0, 0xffffff, 0.06, 0.3, 0, 0.5); }
    else if (vy < 0.4 && YOS.nRevol === 0 && !YOS.culo && YOS.llegaT > 0.4){ YOS.nRevol = 1; YOS.revol = 0.85; play('yosAleteo'); }
    else if (!YOS.culo && vy < -4.2) vy = -4.2;                                               // cae despacio
    if (vy < 0 && hero.position.y < 1.6) for (const e of foilEnemigos(hero.position, 0.35)) if (time - (YOS.pisaT.get(e) || -9) > 0.4 && hero.position.y > 0.15){ yosPisa(e); break; }
  } else if (YOS.aire){ YOS.aire = false; yosAterriza(); }
  if (YOS.carrera > 0){ YOS.carrera -= dt; const a = hero.rotation.y;
    for (const e of foilEnemigos(hero.position, 0.9)) if (!YOS.ya.has(e)){ YOS.ya.add(e); foilGolpea(e, rdmg(16), Math.sin(a), Math.cos(a), 7, null, 1); sparks(e.g.position.x, 0.8, e.g.position.z, 6, 0xbdf7a8, 4); }
    if (rnd() < dt * 30) spawnFx(hero.position.x, 0.1, hero.position.z, (rnd() - 0.5) * 2, 0.8, (rnd() - 0.5) * 2, 0xd8cfc0, 0.12, 0.4, 0, 1.4); }
  yosLenguaTick(dt);
}
/* ---------- Pose de jinete y animación del dinosaurio ---------- */
function yosPose(){
  for (const [L, s] of [[P.legL, -1], [P.legR, 1]]){ bl(L.hip.rotation, 'x', -1.2, 1); bl(L.hip.rotation, 'z', 0.62 * s, 1); bl(L.knee.rotation, 'x', 1.25, 1); }
  bl(P.spine.rotation, 'x', 0.18, 1);
  const apunta = YOS.lenguaE || YOS.abre > 0;
  if (YOS.revol > 0 && !grounded){ for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', (2.1 + Math.sin(time * 24) * 0.3) * s, 1); bl(A.el.rotation, 'x', -0.3, 1); } }
  else { bl(P.armR.sh.rotation, 'x', -0.55, 1); bl(P.armR.el.rotation, 'x', -0.9, 1); bl(P.armR.sh.rotation, 'z', 0.25, 1);
    bl(P.armL.sh.rotation, 'x', apunta ? -1.55 : -0.55, 1); bl(P.armL.el.rotation, 'x', apunta ? -0.1 : -0.9, 1); bl(P.armL.sh.rotation, 'z', -0.25, 1); }
  if (YOS.culo) bl(P.spine.rotation, 'x', 0.55, 1);
}
function yosPostPose(){
  const m = YOS.m; if (!m || !YOS.F) return;
  const sc = Math.min(1, YOS.llegaT / 0.22); m.raiz.scale.setScalar(Math.max(0.01, sc < 1 ? sc * (1 + 0.3 * Math.sin(sc * Math.PI)) : 1));
  yosAnda(m, Math.min(1, Math.hypot(MOV11.vx, MOV11.vz) / 3), YOS.fase, grounded, YOS.revol > 0);
  m.cab.rotation.x = (YOS.lenguaE ? -0.12 : 0) + (YOS.culo ? 0.35 : 0); m.cab.scale.set(1 + 0.07 * YOS.boca, 1, 1 + 0.03 * YOS.boca);
  m.mand.rotation.x = YOS.lenguaE || YOS.abre > 0 ? 0.6 : 0.05;
}
function yosAnda(m, w, fase, suelo, aleteo){
  const a = suelo ? Math.sin(fase) * 0.8 * w : aleteo ? Math.sin(time * 38) * 0.95 : 0;
  m.patas[0].rotation.x = suelo || aleteo ? a : -0.5; m.patas[1].rotation.x = suelo || aleteo ? -a : 0.35;
  m.raiz.position.y = suelo ? Math.abs(Math.sin(fase)) * 0.06 * w : 0; m.cab.position.y = 1.5 + Math.sin(fase * 2) * 0.03 * w;
}
/* ---------- Fin: el dinosaurio se despide y se va ---------- */
function yosGuarda(){ const m = YOS.m; if (!m) return; m.raiz.visible = false; if (m.raiz.parent !== hero) hero.add(m.raiz); m.raiz.position.set(0, 0, 0); m.raiz.rotation.set(0, 0, 0); m.raiz.scale.setScalar(1); m.lg.visible = false; YOS.despide = null; }
function yosFin(motivo){
  const m = YOS.m; YOS.F = null; YOS.cd = YOS_CD;
  const T = YOS.lenguaE; if (T && T.presa){ const e = T.presa; e.yosTrag = false; e.g.position.y = 0; e.g.scale.setScalar(e.scale); } YOS.lenguaE = null; YOS.boca = 0;
  if (!m) return; m.lg.visible = false;
  if (motivo === 'tiempo' && gameState === 'play' && !player.dead) yosAdios(); else yosGuarda();
}
function yosAdios(){
  const m = YOS.m, ry = hero.rotation.y; scene.add(m.raiz); m.raiz.position.set(hero.position.x, 0, hero.position.z); m.raiz.rotation.set(0, ry, 0); m.raiz.scale.setScalar(1);
  hero.position.y += YOS_ALTO; grounded = false; vy = Math.max(vy, 5.5); MOV11.vx += Math.cos(ry) * 2.5; MOV11.vz -= Math.sin(ry) * 2.5;   // Tovan se baja de un salto
  YOS.despide = { t: 0, ry0: ry, fase: 0, puf: false }; play('yosGorjeo'); foilGrito('¡Adiós, dino!', '#8af07a');
}
function yosDespideTick(dt){
  const D = YOS.despide, m = YOS.m; if (!D) return;
  D.t += dt; const r = m.raiz;
  if (D.t < 0.7){ r.rotation.y = lerpAngle(r.rotation.y, camYaw, 1 - Math.exp(-dt * 10)); r.position.y = Math.abs(Math.sin(D.t * 11)) * 0.35; m.cab.rotation.x = Math.sin(D.t * 18) * 0.25; yosAnda(m, 0, 0, true, false); }   // mira a la cámara y saluda
  else if (D.t < 1.7){ const a = camYaw + Math.PI; r.rotation.y = lerpAngle(r.rotation.y, a, 1 - Math.exp(-dt * 12)); D.fase += dt * 16;
    r.position.x += Math.sin(r.rotation.y) * 7 * dt; r.position.z += Math.cos(r.rotation.y) * 7 * dt; yosAnda(m, 1, D.fase, true, false); m.cab.rotation.x = 0;
    if (rnd() < dt * 20) spawnFx(r.position.x, 0.1, r.position.z, 0, 0.6, 0, 0xd8cfc0, 0.1, 0.35, 0, 1.2); }
  else { for (let i = 0; i < 16; i++){ const a = rnd() * TAU; spawnFx(r.position.x, 0.4 + rnd() * 1.2, r.position.z, Math.cos(a) * 2, 1 + rnd(), Math.sin(a) * 2, 0xffffff, 0.16, 0.5, 0, 2); }
    ringFx(r.position.x, r.position.z, 0xffffff, 0.3, 1.8, 0.3); play('yosPuf'); yosGuarda(); }
}
function yosLimpia(){
  if (YOS.F && FOILX.forma !== YOS.F) YOS.F = null;
  const T = YOS.lenguaE; if (T && T.presa){ T.presa.yosTrag = false; T.presa.g.scale.setScalar(T.presa.scale); T.presa.g.position.y = 0; } YOS.lenguaE = null;
  for (const h of YOS.huevos) yosHuevoSuelta(h); YOS.boca = 0;
  if (YOS.m){ const C_ = YOS.m.casc; C_.entero.visible = C_.arriba.visible = C_.abajo.visible = false; }
  if (!YOS.F) yosGuarda();
}
function yosMarca(){
  const el = foilMarcador('yos', 'yosMarca'), txt = YOS.F ? '' : YOS.cd > 0 ? Math.ceil(YOS.cd) + ' s' : 'doble salto';
  el.hidden = !txt; if (txt !== YOS.marca){ YOS.marca = txt; if (txt) el.innerHTML = `<i class="yosHuevoIc"></i><b>${txt}</b>`; el.classList.toggle('yosListo', YOS.cd <= 0); }
}
const yosUpdateEnemyPrev = updateEnemy;
updateEnemy = function(e, dt){ if (e.yosTrag && e.alive){ if (e.flash > 0) e.flash -= dt; applyFlash(e); return; } yosUpdateEnemyPrev(e, dt); };
foilPoder({ id: 'foilDino', ic: '🦖', name: 'Dinosaurio verde', tags: ['otaku'],
  desc: 'De un amigo del fontanero. Salta en el aire (doble salto) y un huevo de motas se rompe bajo tus pies: montas un dinosaurio 15 s. Su lengua se traga a los enemigos (a los jefes les pega) y con la boca llena lanza huevos que rebotan; saltar revolotea y pisa, rodar embiste (o culetazo en el aire).',
  saltar(){ if (grounded || FOILX.forma || YOS.cd > 0 || YOS.despide || state === 'roll' || hero.position.y < 0.15 || !foilEscenario()) return false; return yosLlega(); },
  tick(dt, jugando){ if (YOS.F && FOILX.forma !== YOS.F) yosFin('escenario');
    if (dt > 0){ if (YOS.F) yosFormaTick(dt); else if (YOS.cd > 0) YOS.cd -= dt; yosHuevosTick(dt); yosDespideTick(dt); }
    if (jugando) yosMarca(); },
  limpia(){ yosLimpia(); },
  reset(){ yosLimpia(); YOS.cd = 0; YOS.marca = ''; } });
Object.assign(SFX, {
  yosGorjeo: () => { tone({ type: 'sine', f0: 1100, f1: 1750, dur: 0.09, vol: 0.12, rv: 0.15 }); tone({ type: 'square', f0: 1500, f1: 2300, dur: 0.13, vol: 0.04, when: 0.1, rv: 0.2 }); tone({ type: 'sine', f0: 1450, f1: 2500, dur: 0.14, vol: 0.12, when: 0.1, rv: 0.2 }); },
  yosRompe: () => { noise({ dur: 0.18, vol: 0.3, f0: 3000, type: 'highpass', q: 0.7 }); tone({ type: 'triangle', f0: 880, f1: 440, dur: 0.12, vol: 0.1 }); },
  yosLengua: () => { noise({ dur: 0.12, vol: 0.18, f0: 900, f1: 4200, q: 1.5, rv: 0.05 }); tone({ type: 'triangle', f0: 380, f1: 1600, dur: 0.09, vol: 0.1 }); },
  yosAtrapa: () => tone({ type: 'square', f0: 900, f1: 500, dur: 0.06, vol: 0.06 }),
  yosTraga: () => { tone({ type: 'sine', f0: 520, f1: 140, dur: 0.2, vol: 0.22, rv: 0.1 }); tone({ type: 'square', f0: 1400, f1: 1900, dur: 0.06, vol: 0.05, when: 0.18 }); },
  yosHuevo: () => tone({ type: 'square', f0: 700, f1: 260, dur: 0.12, vol: 0.08 }),
  yosBota: () => tone({ type: 'sine', f0: 260, f1: 620, dur: 0.08, vol: 0.12 }),
  yosRevienta: () => { SFX.boom(); noise({ dur: 0.15, vol: 0.25, f0: 3500, type: 'highpass' }); },
  yosSalto: () => { tone({ type: 'square', f0: 330, f1: 990, dur: 0.15, vol: 0.08, rv: 0.1 }); SFX.yosGorjeo(); },
  yosAleteo: () => { for (let i = 0; i < 8; i++) tone({ type: 'square', f0: 520 + (i % 2) * 160, dur: 0.05, vol: 0.05, when: i * 0.07, rv: 0.05 }); },
  yosPisa: () => { tone({ type: 'square', f0: 220, f1: 880, dur: 0.1, vol: 0.1 }); noise({ dur: 0.08, vol: 0.2, f0: 700, type: 'lowpass' }); },
  yosPaso: () => noise({ dur: 0.1, vol: 0.2, f0: 400, type: 'lowpass' }),
  yosCulo0: () => tone({ type: 'sine', f0: 900, f1: 200, dur: 0.25, vol: 0.12 }),
  yosCulo: () => { SFX.slam(); tone({ type: 'square', f0: 160, f1: 60, dur: 0.2, vol: 0.12 }); },
  yosPuf: () => noise({ dur: 0.35, vol: 0.22, f0: 1200, f1: 300, q: 0.6, rv: 0.3 })
});

/* ========== 2 · INVOCACIÓN: REY DRAGÓN (bah) ========== */
const BAH = { on: null, m: null, base: null, escrito: null, num: false };
const BAH_DUR = 4.7, BAH_ESC = 0.78;
const BAH_OSC = { top: new THREE.Color(0x04030a), mid: new THREE.Color(0x120a22), hor: new THREE.Color(0x2a1240), fog: new THREE.Color(0x0c0716), amb: new THREE.Color(0x2a2048), light: new THREE.Color(0x4a4070) };
// Círculo mágico: aros, banda de runas, hexagrama y sello central (pintado al cargar, sin rnd())
const bahCirculoTex = (() => { const c = foilLienzo(512, 512, g => { const R = mulberry32(4501); g.translate(256, 256); g.strokeStyle = '#ffffff'; g.lineCap = 'round'; g.lineJoin = 'round';
    const aro = (r, w) => { g.beginPath(); g.arc(0, 0, r, 0, TAU); g.lineWidth = w; g.stroke(); };
    aro(248, 6); aro(236, 2); aro(198, 2); aro(186, 4);
    for (let i = 0; i < 40; i++){ g.save(); g.rotate(i / 40 * TAU); g.translate(0, -217); g.lineWidth = 2.6; g.beginPath();   // runas
      const n = 2 + Math.floor(R() * 3); for (let k = 0; k < n; k++){ g.moveTo((R() - 0.5) * 15, (R() - 0.5) * 22); g.lineTo((R() - 0.5) * 15, (R() - 0.5) * 22); }
      if (R() < 0.45){ g.moveTo(5, (R() - 0.5) * 8); g.arc(0, 0, 5, 0, TAU); } g.stroke(); g.restore(); }
    g.lineWidth = 3.5; for (const r0 of [0, Math.PI]){ g.beginPath(); for (let k = 0; k <= 3; k++){ const a = r0 + k / 3 * TAU - Math.PI / 2; g[k ? 'lineTo' : 'moveTo'](Math.cos(a) * 186, Math.sin(a) * 186); } g.stroke(); }
    for (let k = 0; k < 6; k++){ const a = k / 6 * TAU - Math.PI / 2; g.beginPath(); g.arc(Math.cos(a) * 186, Math.sin(a) * 186, 15, 0, TAU); g.lineWidth = 2.5; g.stroke(); }
    aro(108, 3); aro(94, 1.5); aro(32, 3);
    for (let k = 0; k < 8; k++){ const a = k / 8 * TAU; g.beginPath(); g.moveTo(Math.cos(a) * 32, Math.sin(a) * 32); g.lineTo(Math.cos(a) * 90, Math.sin(a) * 90); g.lineWidth = 2; g.stroke(); }
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, 252); gr.addColorStop(0, 'rgba(255,255,255,0.4)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.06)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(-256, -256, 512, 512); });
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t; })();
// La esfera de energía de la boca: blanca, cian y violeta, con rayos
const bahOrbeMat = foilSprite(foilLienzo(128, 128, g => { const R = mulberry32(4502);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 62); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.2, 'rgba(230,242,255,1)'); gr.addColorStop(0.45, 'rgba(130,170,255,0.65)'); gr.addColorStop(0.75, 'rgba(150,70,255,0.22)'); gr.addColorStop(1, 'rgba(90,20,200,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineCap = 'round';
  for (let k = 0; k < 18; k++){ const a = R() * TAU, r0 = 10 + R() * 8, r1 = 34 + R() * 26; g.lineWidth = 1 + R() * 2; g.beginPath(); g.moveTo(64 + Math.cos(a) * r0, 64 + Math.sin(a) * r0); g.lineTo(64 + Math.cos(a) * r1, 64 + Math.sin(a) * r1); g.stroke(); } }), true);
const bahHaloMat = foilSprite(foilLienzo(128, 128, g => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(190,150,255,0.85)'); gr.addColorStop(0.35, 'rgba(120,80,230,0.45)'); gr.addColorStop(0.7, 'rgba(60,30,160,0.15)'); gr.addColorStop(1, 'rgba(20,0,80,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }), true);
// El haz del Megafulgor (aditivo): núcleo blanco, anillos que bajan y energía que corre
TRAZO_FS.bah = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  float a = abs(vUV.y), m = vUV.x * uLen;
  float flujo = n2(vec2(m * 0.9 - uTime * 26.0, vUV.y * 3.0 + uSeed)) * 0.6 + n2(vec2(m * 2.3 - uTime * 41.0, vUV.y * 7.0)) * 0.4;
  float core = 1.0 - smoothstep(0.0, 0.3, a), halo = pow(1.0 - a, 1.5);
  float anillo = smoothstep(0.8, 0.95, fract(m * 0.2 - uTime * 3.0)) * (1.0 - smoothstep(0.45, 0.9, a));
  vec3 col = uC * halo * (0.55 + 0.6 * flujo) + uB * smoothstep(0.8, 0.15, a) * (0.7 + 0.5 * flujo) + uA * (core * 1.4 + anillo * 0.8);
  gl_FragColor = vec4(col, uAlpha * clamp(halo * 1.25, 0.0, 1.0) * smoothstep(0.0, 0.02, vUV.x));
}`;
const BAH_HAZ = [0xffffff, 0x9fdcff, 0x8a52ff, 0], BAH_HAZ2 = [0xffffff, 0xe8f4ff, 0xb48cff, 0];
function bahHueso(p, q, r, mat, padre){ const d = new V3().subVectors(q, p), L = d.length(), m = mesh(C(r * 0.6, r, L, 4), mat, (p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2, padre);
  m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.normalize()); return m; }
function bahAla(M_){   // abanico de membrana con el borde festoneado y los huesos que brillan (x hacia fuera, y arriba, z atrás)
  const R = new V3(0, 0, 0), W = new V3(2.7, 1.7, -0.5), T = [new V3(6.8, 2.5, -1.4), new V3(7.2, 0.3, -2.2), new V3(5.6, -1.5, -2.6), new V3(3.2, -1.8, -2.4), new V3(0.5, -0.9, -2.0)];
  const pos = [], tri = (a, b, c) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let i = 0; i < T.length - 1; i++){ const s = new V3().addVectors(T[i], T[i + 1]).multiplyScalar(0.5).lerp(W, 0.24); tri(W, T[i], s); tri(W, s, T[i + 1]); }
  tri(R, T[0], W); tri(R, W, T[T.length - 1]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(pos.length / 3 * 2).fill(0), 2)); geo.computeVertexNormals();
  const t = new THREE.Group(); mesh(geo, M_.membrana, 0, 0, 0, t);
  bahHueso(R, W, 0.16, M_.escama, t); for (let i = 0; i < 4; i++) bahHueso(W, T[i], 0.1 - i * 0.012, M_.escama, t);
  bahHueso(R, W, 0.09, M_.veta, t).position.y += 0.1; for (let i = 0; i < 4; i++) bahHueso(W, T[i], 0.07, M_.veta, t).position.y += 0.06;
  for (let i = 0; i < T.length - 1; i++){ const s = new V3().addVectors(T[i], T[i + 1]).multiplyScalar(0.5).lerp(W, 0.24); bahHueso(T[i], s, 0.05, M_.veta, t); bahHueso(s, T[i + 1], 0.05, M_.veta, t); }   // el borde festoneado, encendido
  mesh(new THREE.ConeGeometry(0.12, 0.5, 4), M_.oro, W.x, W.y + 0.25, W.z, t);
  const g = new THREE.Group(); mpFusiona(t, g); return g;
}
function bahModelo(){
  if (BAH.m) return BAH.m;
  const M_ = { escama: makeMat(0x2c3054, { emissive: 0.2 }), placas: makeMat(0x4c4070, { emissive: 0.18 }), membrana: makeMat(0x40267a, { side: THREE.DoubleSide, emissive: 0.32 }),
    veta: makeMat(0x7fd8ff, { emissive: 1 }), ojo: makeMat(0xfff0a0, { emissive: 1 }), oro: makeMat(0xd8a838, { emissive: 0.35 }) };
  const raiz = new THREE.Group(); raiz.visible = false; scene.add(raiz);
  const ico = (r, d = 1) => new THREE.IcosahedronGeometry(r, d);
  const t = new THREE.Group(); let m;
  m = mesh(ico(1), M_.escama, 0, 0, 0, t); m.scale.set(1.25, 1.1, 2.1);
  m = mesh(ico(0.9), M_.placas, 0, -0.38, 0.35, t); m.scale.set(1.0, 0.78, 1.7);
  for (let i = 0; i < 4; i++){ m = mesh(ico(0.62 - i * 0.07), M_.escama, 0, 0.75 + i * 0.6, 1.75 + i * 0.55, t); m.scale.set(1, 1, 1.35); m.rotation.x = -0.7;
    m = mesh(new THREE.ConeGeometry(0.12, 0.55, 4), M_.oro, 0, 1.3 + i * 0.6, 1.5 + i * 0.55, t); m.rotation.x = -0.9; }
  for (let i = 0; i < 6; i++){ m = mesh(ico(0.8 - i * 0.12), M_.escama, 0, -0.15 - i * 0.28, -2.0 - i * 0.95, t); m.scale.set(1, 0.9, 1.4);
    m = mesh(new THREE.ConeGeometry(0.1, 0.45, 4), M_.oro, 0, 0.55 - i * 0.36, -1.9 - i * 0.95, t); m.rotation.x = -0.6; }
  m = mesh(new THREE.ConeGeometry(0.2, 1.2, 4), M_.oro, 0, -1.9, -8.0, t); m.rotation.x = -1.75;
  for (let i = 0; i < 3; i++){ m = mesh(new THREE.ConeGeometry(0.16, 0.7, 4), M_.oro, 0, 1.05, 0.9 - i * 0.9, t); m.rotation.x = -0.5; }
  for (const s of [-1, 1]){
    m = mesh(ico(0.6), M_.escama, 1.05 * s, -0.8, -0.7, t); m.scale.set(0.8, 1.25, 1);
    m = mesh(C(0.3, 0.22, 1.3, 5), M_.escama, 1.12 * s, -1.85, -0.35, t); m.rotation.x = 0.35;
    m = mesh(C(0.22, 0.16, 1.1, 5), M_.escama, 0.95 * s, -0.55, 1.5, t); m.rotation.x = 0.7;
    for (let k = -1; k <= 1; k++){ m = mesh(new THREE.ConeGeometry(0.08, 0.42, 4), M_.oro, 1.12 * s + k * 0.16, -2.5, 0.05, t); m.rotation.x = 1.4;
      m = mesh(new THREE.ConeGeometry(0.06, 0.3, 4), M_.oro, 0.95 * s + k * 0.12, -1.05, 1.95, t); m.rotation.x = 1.2; }
    bahHueso(new V3(1.2 * s, 0.35, -1.6), new V3(1.22 * s, 0.1, 1.6), 0.05, M_.veta, t); bahHueso(new V3(0.95 * s, -0.5, -1.2), new V3(0.5 * s, -0.75, 1.6), 0.04, M_.veta, t);
    bahHueso(new V3(0.52 * s, 0.9, 1.7), new V3(0.4 * s, 2.5, 3.3), 0.045, M_.veta, t); }
  const cuerpo = new THREE.Group(); mpFusiona(t, cuerpo); raiz.add(cuerpo);
  // la cabeza (cabecea al cargar) con la mandíbula aparte
  const cab = new THREE.Group(); cab.position.set(0, 2.95, 3.5); raiz.add(cab);
  const tc = new THREE.Group();
  m = mesh(ico(0.72), M_.escama, 0, 0.15, 0.4, tc); m.scale.set(0.95, 0.8, 1.35);
  const hoc = C(0.3, 0.58, 1.5, 6); hoc.rotateX(Math.PI / 2); mesh(hoc, M_.escama, 0, 0.02, 1.45, tc);
  for (const s of [-1, 1]){ m = mesh(new THREE.ConeGeometry(0.2, 1.9, 5), M_.oro, 0.42 * s, 0.6, 0.0, tc); m.rotation.set(-2.05, 0, 0.28 * s);
    m = mesh(new THREE.ConeGeometry(0.12, 1.0, 4), M_.oro, 0.62 * s, 0.25, 0.1, tc); m.rotation.set(-1.9, 0, 0.6 * s);
    m = mesh(B(0.34, 0.1, 0.14), M_.ojo, 0.42 * s, 0.32, 0.98, tc); m.rotation.set(0, 0.4 * s, -0.25 * s);
    bahHueso(new V3(0.3 * s, 0.05, 1.0), new V3(0.18 * s, 0.0, 2.1), 0.035, M_.veta, tc); }
  mpFusiona(tc, cab);
  const mand = new THREE.Group(); mand.position.set(0, -0.22, 0.75); cab.add(mand);
  { const tj = new THREE.Group(); const q = C(0.2, 0.42, 1.4, 6); q.rotateX(Math.PI / 2); mesh(q, M_.escama, 0, -0.08, 0.7, tj); mesh(B(0.3, 0.05, 1.1), M_.veta, 0, 0.07, 0.7, tj); mpFusiona(tj, mand); }
  const alas = [1, -1].map(s => { const g = bahAla(M_); g.position.set(1.0 * s, 0.9, 0.6); g.scale.x = s; raiz.add(g); return g; });
  const rueda = new THREE.Group(); rueda.position.set(0, 1.9, -1.4); raiz.add(rueda);
  { const tr = new THREE.Group(); mesh(new THREE.TorusGeometry(2.5, 0.09, 4, 36), M_.veta, 0, 0, 0, tr); mesh(new THREE.TorusGeometry(2.1, 0.04, 3, 36), M_.veta, 0, 0, 0, tr);
    for (let k = 0; k < 12; k++){ const a = k / 12 * TAU, q = mesh(new THREE.ConeGeometry(0.1, 0.5, 4), M_.oro, Math.cos(a) * 2.75, Math.sin(a) * 2.75, 0, tr); q.rotation.z = a - Math.PI / 2; }
    mpFusiona(tr, rueda); }
  const circMat = new THREE.MeshBasicMaterial({ map: bahCirculoTex, color: 0x8fdcff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  const circMat2 = circMat.clone(); circMat2.color.setHex(0xffd27a);
  const pl = new THREE.PlaneGeometry(1, 1); pl.rotateX(-Math.PI / 2);
  const circ = new THREE.Mesh(pl, circMat), circ2 = new THREE.Mesh(pl, circMat2); circ.visible = circ2.visible = false; circ.renderOrder = circ2.renderOrder = 4; scene.add(circ); scene.add(circ2);
  const domoG = new THREE.SphereGeometry(1, 18, 8, 0, TAU, 0, Math.PI / 2);
  const domo = new THREE.Mesh(domoG, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  const domo2 = new THREE.Mesh(domoG, new THREE.MeshBasicMaterial({ color: 0x8fb8ff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  domo.visible = domo2.visible = false; domo.renderOrder = domo2.renderOrder = 6; scene.add(domo); scene.add(domo2);
  const halo = new THREE.Sprite(bahHaloMat); halo.visible = false; halo.renderOrder = 1; scene.add(halo);
  const orbe = new THREE.Sprite(bahOrbeMat), orbe2 = new THREE.Sprite(bahOrbeMat); orbe.visible = orbe2.visible = false; orbe.renderOrder = orbe2.renderOrder = 7; scene.add(orbe); scene.add(orbe2);
  raiz.scale.setScalar(BAH_ESC);
  BAH.m = { raiz, cuerpo, cab, mand, alas, rueda, circ, circ2, domo, domo2, orbe, orbe2, halo };
  return BAH.m;
}
const bahPuede = () => grounded && !BAH.on && !COL.montado && !TER.montado && !SH3.montado && !MG.active && !chActive && state !== 'attack';
function bahCielo(k){
  const U = skyMat.uniforms, L = [['top', U.uTop.value], ['mid', U.uMid.value], ['hor', U.uHor.value], ['fog', shared.uFogCol.value], ['amb', shared.uAmb.value], ['light', shared.uLightCol.value]];
  if (!BAH.base){ if (k <= 0) return; BAH.base = {}; BAH.escrito = {}; for (const [n, c] of L){ BAH.base[n] = c.clone(); BAH.escrito[n] = c.clone(); } }
  for (const [n, c] of L){ if (!c.equals(BAH.escrito[n])) BAH.base[n].copy(c);   // si otro lo cambió (otro bioma), esa es la base nueva
    c.copy(BAH.base[n]).lerp(BAH_OSC[n], k); BAH.escrito[n].copy(c); }
  if (k <= 0){ BAH.base = null; BAH.escrito = null; }
}
function bahEmpieza(){
  const m = bahModelo(), O = hero.position;
  // el estallido va donde están los enemigos (o delante, si no hay)
  const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw); let gx = 0, gz = 0, n = 0;
  for (const e of foilEnemigos(O, 11)){ gx += e.g.position.x; gz += e.g.position.z; n++; }
  const G = n ? new V3(gx / n, 0, gz / n) : new V3(O.x + fx * 5, 0, O.z + fz * 5);
  if (Math.hypot(G.x - O.x, G.z - O.z) < 3){ G.x = O.x + fx * 4; G.z = O.z + fz * 4; }
  clampArena(G, ARENA - 1);
  const ry = camYaw, C0 = new V3(G.x + fx * 3.4, 7.2, G.z + fz * 3.4);   // de cara a la cámara, con la cabeza sobre el estallido
  BAH.on = { t: 0, G, C0, ry, px: O.x, pz: O.z, ya: new Set(), cola: [], haz: null, haz2: null, boom: false, rot1: false, rot2: false, rugido: false, carga: false, pose: 0, cam: 0 };
  m.raiz.visible = true; m.raiz.position.set(C0.x, C0.y + 16, C0.z); m.raiz.rotation.set(0, ry, 0); m.cab.rotation.x = 0; m.mand.rotation.x = 0;
  m.circ.visible = m.circ2.visible = true; m.circ.position.set(C0.x, 13.5, C0.z); m.circ2.position.set(C0.x, 13.3, C0.z); m.circ.scale.setScalar(0.01); m.circ2.scale.setScalar(0.01);
  state = 'normal'; MOV11.vx = MOV11.vz = 0; flash('#1a1030', 0.45); play('bahInvoca');
  foilRotulo('<i class="bahMano"></i>Invocación<small>Rey dragón</small>', 'bahVentana', 1.8);
  barkOnce('foil_bah', '¿Esa linterna también invoca dragones? Pues que no se entere el del colosal, que se pone celoso.');
}
const bahV0 = new V3(), bahW0 = new V3(), bahL0 = new V3(), bahO0 = new V3();
function bahBoca(v){ BAH.m.raiz.updateMatrixWorld(true); return BAH.m.mand.localToWorld(v.set(0, 0.1, 1.45)); }
function bahGolpea(e){
  const B_ = BAH.on, dx = e.g.position.x - B_.G.x, dz = e.g.position.z - B_.G.z, l = Math.max(0.01, Math.hypot(dx, dz));
  BAH.num = true; try { foilGolpea(e, foilJefe(e) ? rdmg(85) : rdmg(185), dx / l, dz / l, 8, null, 1, B_.ya); } finally { BAH.num = false; }
}
const bahEnPantalla = e => { bahV0.set(e.g.position.x, e.numY * 0.5, e.g.position.z).project(camera); return bahV0.z < 1 && Math.abs(bahV0.x) < 1.05 && Math.abs(bahV0.y) < 1.05; };
function bahTick(dt){
  const B_ = BAH.on, m = BAH.m; if (!B_) return;
  B_.t += dt; const t = B_.t, G = B_.G;
  hero.position.x = B_.px; hero.position.z = B_.pz; MOV11.vx = MOV11.vz = 0; player.inv = Math.max(player.inv, 0.05);
  B_.pose = Math.min(1, t / 0.35) * (t > 4.1 ? Math.max(0, 1 - (t - 4.1) / 0.4) : 1);
  B_.cam = smooth(Math.min(1, t / 0.7)) * (t > 3.9 ? Math.max(0, 1 - (t - 3.9) / 0.8) : 1);
  bahCielo(smooth(Math.min(1, t / 0.6)) * (t > 3.5 ? Math.max(0, 1 - (t - 3.5) / 0.9) : 1));
  // el círculo de runas
  const kc = smooth(clamp((t - 0.2) / 0.55, 0, 1)) * (t > 3.4 ? Math.max(0, 1 - (t - 3.4) / 0.6) : 1);
  m.circ.visible = m.circ2.visible = kc > 0.01; m.circ.scale.setScalar(Math.max(0.01, 15 * kc)); m.circ2.scale.setScalar(Math.max(0.01, 9.5 * kc));
  m.circ.rotation.y = t * 0.6; m.circ2.rotation.y = -t * 1.1; m.circ.material.opacity = 0.95 * Math.min(1, kc * 1.5); m.circ2.material.opacity = 0.8 * Math.min(1, kc * 1.5);
  if (t > 0.3 && t < 1.8 && rnd() < dt * 24){ const a = rnd() * TAU, r = rnd() * 6; spawnFx(B_.C0.x + Math.cos(a) * r, 13.4, B_.C0.z + Math.sin(a) * r, 0, -2 - rnd() * 2, 0, rnd() < 0.5 ? 0x9fdcff : 0xffffff, 0.08, 0.8, 0, 0); }
  // el dragón baja desde el círculo, carga, dispara y se va
  const C0 = B_.C0, r = m.raiz;
  if (t < 3.15){ const kb = smooth(clamp((t - 0.6) / 1.1, 0, 1)); r.position.set(C0.x, C0.y + 16 * (1 - kb) + Math.sin(t * 2.2) * 0.25, C0.z); r.rotation.set(0.1 * (1 - kb), B_.ry, 0); }
  else { const k = t - 3.15; r.rotation.x = lerp(r.rotation.x, -0.9, 1 - Math.exp(-dt * 3)); r.position.y += (4 + k * 14) * dt; r.position.x -= Math.sin(B_.ry) * (3 + k * 10) * dt; r.position.z -= Math.cos(B_.ry) * (3 + k * 10) * dt; }
  { const kh = clamp((t - 0.7) / 0.6, 0, 1) * (t > 3.1 ? Math.max(0, 1 - (t - 3.1) / 0.5) : 1); m.halo.visible = kh > 0.01;   // contraluz violeta: que la silueta se lea contra el cielo oscuro
    if (m.halo.visible){ m.halo.position.set(r.position.x - Math.sin(B_.ry) * 3, r.position.y + 1, r.position.z - Math.cos(B_.ry) * 3); m.halo.scale.setScalar(17 + Math.sin(t * 3) * 0.6); bahHaloMat.opacity = 0.75 * kh; } }
  const aleteo = t < 3.15 ? Math.sin(t * 4.6) * 0.32 : Math.sin(t * 9) * 0.5;
  m.alas[0].rotation.set(0, -0.25, aleteo + 0.12); m.alas[1].rotation.set(0, 0.25, -aleteo - 0.12); m.rueda.rotation.z = t * 0.8;
  if (!B_.rugido && t > 1.15){ B_.rugido = true; play('bahRugido'); shake = Math.max(shake, 0.35); }
  const carga = clamp((t - 1.75) / 0.8, 0, 1), dispara = t > 2.55 && t < 3.2;
  m.cab.rotation.x = lerp(m.cab.rotation.x, t > 1.6 && t < 3.3 ? 0.55 : 0, 1 - Math.exp(-dt * 5)); m.mand.rotation.x = lerp(m.mand.rotation.x, carga > 0 && t < 3.3 ? 0.55 : 0, 1 - Math.exp(-dt * 8));
  bahBoca(bahW0);
  m.orbe.visible = m.orbe2.visible = carga > 0 && t < 3.2;
  if (m.orbe.visible){ const s = dispara ? 2.6 + Math.sin(t * 60) * 0.3 : 0.3 + 2.3 * carga * carga; m.orbe.position.copy(bahW0); m.orbe2.position.copy(bahW0); m.orbe.scale.setScalar(s); m.orbe2.scale.setScalar(s * 1.6 * (0.8 + 0.2 * Math.sin(t * 31))); bahOrbeMat.rotation = t * 3;
    if (!dispara && rnd() < dt * 40){ const a = rnd() * TAU, b = rnd() * 2 - 1, rr = 3 + rnd() * 2; bahV0.set(bahW0.x + Math.cos(a) * rr * Math.sqrt(1 - b * b), bahW0.y + b * rr, bahW0.z + Math.sin(a) * rr * Math.sqrt(1 - b * b));
      spawnFx(bahV0.x, bahV0.y, bahV0.z, (bahW0.x - bahV0.x) * 2.2, (bahW0.y - bahV0.y) * 2.2, (bahW0.z - bahV0.z) * 2.2, rnd() < 0.5 ? 0xbfe4ff : 0xb48cff, 0.08, 0.42, 0, -0.5); }
    if (rnd() < dt * 8) lightFlash(bahW0.x, bahW0.y, bahW0.z, 0x9fb8ff, 1.6, 9); }
  if (!B_.carga && carga > 0){ B_.carga = true; play('bahCarga'); }
  if (!B_.rot2 && t > 1.95){ B_.rot2 = true; foilRotulo('Megafulgor', 'bahVentana bahTecnica', 2.3); }
  // el Megafulgor: haz de la boca al suelo, cúpula blanca, anillos y escombros
  if (t > 2.55 && !B_.haz){ B_.haz = tintaCoge(BAH_HAZ, 0, 'bah'); B_.haz2 = tintaCoge(BAH_HAZ2, 0, 'bah'); B_.haz.mat.blending = B_.haz2.mat.blending = THREE.AdditiveBlending; play('bahRayo'); }
  if (B_.haz){ const kh = Math.min(1, (t - 2.55) / 0.12), fade = clamp((t - 3.15) / 0.3, 0, 1), P0 = bahW0.clone();
    const P = (s, v) => v.lerpVectors(P0, bahL0.set(G.x, 0.05, G.z), s);
    if (fade < 1){ tintaPinta(B_.haz, P, 0, kh, q => (2.6 + Math.sin(t * 50) * 0.25) * (0.55 + 0.45 * q) * (1 - fade * 0.6)); tintaPinta(B_.haz2, P, 0, kh, () => 0.7);
      B_.haz.mat.uniforms.uAlpha.value = B_.haz2.mat.uniforms.uAlpha.value = 1 - fade; }
    else if (B_.haz.usada){ tintaSuelta(B_.haz); tintaSuelta(B_.haz2); } }
  if (!B_.boom && t > 2.68){ B_.boom = true; m.domo.visible = m.domo2.visible = true; m.domo.position.set(G.x, 0, G.z); m.domo2.position.set(G.x, 0, G.z);
    flash('#ffffff', 0.85); shake = Math.max(shake, 0.9); hitStop = Math.max(hitStop, 0.06); play('bahBoom'); lightFlash(G.x, 2, G.z, 0xffffff, 4, 20);
    ringFx(G.x, G.z, 0xffffff, 0.5, 11, 0.6); ringFx(G.x, G.z, 0x9fdcff, 0.4, 8, 0.5, 0.4); ringFx(G.x, G.z, 0xb48cff, 0.3, 13, 0.8, 0.15);
    for (let i = 0; i < 36; i++){ const a = rnd() * TAU, sp = 4 + rnd() * 8; spawnFx(G.x + Math.cos(a) * 1.5, 0.4, G.z + Math.sin(a) * 1.5, Math.cos(a) * sp, 5 + rnd() * 8, Math.sin(a) * sp, i % 4 ? 0x6a6070 : 0xdfe8ff, 0.12 + rnd() * 0.12, 1.1, 14, 0); }
    B_.cola = enemies.filter(e => e.alive && e.spawnT <= 0 && e.reach !== false && (bahEnPantalla(e) || Math.hypot(e.g.position.x - G.x, e.g.position.z - G.z) < 10)); }
  if (B_.boom){ const k = t - 2.68, rad = 9.5 * (1 - Math.pow(1 - Math.min(1, k / 0.45), 3)), fd = clamp((k - 0.45) / 0.7, 0, 1);
    m.domo.scale.set(Math.max(0.01, rad), Math.max(0.01, rad * 0.8), Math.max(0.01, rad)); m.domo2.scale.setScalar(Math.max(0.01, rad * 1.18));
    m.domo.material.opacity = 0.85 * (1 - fd); m.domo2.material.opacity = 0.45 * (1 - fd); m.domo.visible = m.domo2.visible = fd < 1;
    for (let i = B_.cola.length - 1; i >= 0; i--){ const e = B_.cola[i]; if (!e.alive){ B_.cola.splice(i, 1); continue; }
      if (Math.hypot(e.g.position.x - G.x, e.g.position.z - G.z) - e.r < rad || k > 0.5){ bahGolpea(e); B_.cola.splice(i, 1); } } }
  if (t >= BAH_DUR) bahFin();
}
function bahFin(){
  const B_ = BAH.on; BAH.on = null; BAH.num = false; bahCielo(0);
  if (B_ && B_.haz){ tintaSuelta(B_.haz); tintaSuelta(B_.haz2); }
  const m = BAH.m; if (m){ m.raiz.visible = m.circ.visible = m.circ2.visible = m.domo.visible = m.domo2.visible = m.orbe.visible = m.orbe2.visible = m.halo.visible = false; }
}
function bahPose(){ const B_ = BAH.on; if (!B_ || B_.pose <= 0) return; const w = B_.pose;
  bl(P.armL.sh.rotation, 'z', -2.75, w); bl(P.armR.sh.rotation, 'z', 2.75, w); bl(P.armL.sh.rotation, 'x', -0.2, w); bl(P.armR.sh.rotation, 'x', -0.2, w);
  bl(P.armL.el.rotation, 'x', -0.15, w); bl(P.armR.el.rotation, 'x', -0.15, w); bl(P.spine.rotation, 'x', -0.22, w); bl(P.neck.rotation, 'x', -0.45, w);
  P.scarf.forEach((g, i) => { g.rotation.x += 0.6 * w + Math.sin(time * 14 - i) * 0.12 * w; }); }
function bahCamara(){   // cámara baja y lejos, mirando hacia arriba: se ve el círculo, el dragón y el suelo del estallido
  const B_ = BAH.on; if (!B_ || B_.cam <= 0.001 || cs.active || lcut) return; const w = B_.cam, alto = innerWidth < innerHeight;
  const hx = Math.sin(camYaw), hz = Math.cos(camYaw), d = alto ? 13.5 : 10, O = hero.position;
  bahO0.set(O.x + hx * d, alto ? 2.6 : 2.1, O.z + hz * d); camera.position.lerp(bahO0, w);
  bahL0.copy(camTarget).lerp(bahV0.set(lerp(O.x, B_.G.x, 0.6), alto ? 6.4 : 5.6, lerp(O.z, B_.G.z, 0.6)), w); camera.lookAt(bahL0); }
const bahSpawnNumberPrev = spawnNumber;
spawnNumber = function(pos, text, cls = '', color){
  if (BAH.num && (cls === '' || cls === 'crit')){ const n = Math.round(+text); return bahSpawnNumberPrev(pos, isFinite(n) ? String(Math.min(9999, n)) : text, 'bahNum'); }
  return bahSpawnNumberPrev(pos, text, cls, color);
};
const bahDoAttackPrev = doAttack; doAttack = function(){ if (BAH.on && gameState === 'play') return; bahDoAttackPrev(); };
const bahDoSpecialPrev = doSpecial; doSpecial = function(){ if (BAH.on && gameState === 'play') return; bahDoSpecialPrev(); };
foilPoder({ id: 'foilBahamut', ic: '🐉', name: 'Invocación: Rey dragón', tags: ['otaku'],
  desc: 'De una fantasía que nunca es final. Especial (con el ímpetu lleno): el cielo se oscurece, se abre un círculo de runas y baja el rey dragón a soltar el «Megafulgor», un rayo que estalla en una cúpula blanca y castiga a todos los enemigos a la vista. Mientras dura la invocación eres intocable.',
  especial(){ if (!bahPuede()) return false; bahEmpieza(); return true; },
  rodar(){ return !!BAH.on; }, saltar(){ return !!BAH.on; }, herido(){ return BAH.on ? 'none' : null; },
  tick(dt){ if (dt > 0) bahTick(dt); }, pose(){ bahPose(); }, post(){ bahCamara(); },
  limpia(){ bahFin(); }, reset(){ bahFin(); } });
Object.assign(SFX, {
  bahInvoca: () => { [57, 64, 69, 72, 76, 81, 84].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 1.4, vol: 0.06, attack: 0.15, when: i * 0.11, rv: 0.9 })); tone({ type: 'sine', f0: NOTE(33), dur: 2.2, vol: 0.22, attack: 0.4, rv: 0.6 }); },
  bahRugido: () => { tone({ type: 'sawtooth', f0: 95, f1: 48, dur: 1.4, vol: 0.24, rv: 0.7 }); tone({ type: 'sawtooth', f0: 102, f1: 50, dur: 1.4, vol: 0.18, rv: 0.7 }); noise({ dur: 1.2, vol: 0.18, f0: 420, type: 'lowpass', rv: 0.6 }); },
  bahCarga: () => { tone({ type: 'sine', f0: 70, f1: 520, dur: 0.85, vol: 0.2, rv: 0.5 }); tone({ type: 'square', f0: 220, f1: 1400, dur: 0.85, vol: 0.04, rv: 0.5 }); noise({ dur: 0.85, vol: 0.12, f0: 300, f1: 5000, q: 2, rv: 0.4 }); },
  bahRayo: () => { noise({ dur: 0.7, vol: 0.3, f0: 6000, f1: 600, q: 0.8, rv: 0.5 }); tone({ type: 'sawtooth', f0: 880, f1: 110, dur: 0.6, vol: 0.1, rv: 0.5 }); },
  bahBoom: () => { SFX.specialBoom(); SFX.bossSlam(); noise({ dur: 1.4, vol: 0.3, f0: 2400, f1: 80, type: 'lowpass', q: 0.6, rv: 0.8 }); }
});

/* ========== 3 · ¡ATAQUE TOTAL! (prs) ========== */
const PRS = { tot: null, est: [], nubes: [], masT: -9, marca: '', oculto: false, blob: true };
const PRS_DER = 4, PRS_NUBES = 8;
// Sprites de la nube de pelea (pintados al cargar, con su PRNG): puño de guante, bota, estrella y «¡PAF!»
const prsLienzo = (w, h, pinta) => foilSprite(foilLienzo(w, h, pinta), false);
const prsRR = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const prsPunoMat = prsLienzo(128, 128, g => { g.lineWidth = 6; g.strokeStyle = '#000'; g.fillStyle = '#fff'; g.lineJoin = 'round';
  prsRR(g, 92, 50, 26, 50, 6); g.fill(); g.stroke();                                                            // puño de la manga
  prsRR(g, 18, 36, 82, 70, 24); g.fill(); g.stroke();
  for (let i = 0; i < 4; i++){ g.beginPath(); g.arc(30 + i * 18, 40, 12, Math.PI, 0); g.fill(); g.stroke(); }   // nudillos
  g.beginPath(); g.ellipse(40, 86, 24, 12, -0.2, 0, TAU); g.fill(); g.stroke();                                 // pulgar
  g.lineWidth = 3; for (let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(52 + i * 14, 62); g.lineTo(52 + i * 14, 76); g.stroke(); }
  g.strokeStyle = '#e60012'; g.lineWidth = 4; for (let i = 0; i < 3; i++){ g.beginPath(); g.moveTo(8, 50 + i * 16); g.lineTo(0, 46 + i * 18); g.stroke(); } });
const prsBotaMat = prsLienzo(128, 128, g => { g.lineWidth = 6; g.strokeStyle = '#000'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(28, 14); g.lineTo(62, 14); g.lineTo(64, 64); g.quadraticCurveTo(112, 64, 114, 94); g.lineTo(114, 104); g.lineTo(24, 104); g.lineTo(26, 70); g.closePath(); g.fillStyle = '#e60012'; g.fill(); g.stroke();
  g.fillStyle = '#fff'; prsRR(g, 20, 100, 98, 16, 6); g.fill(); g.stroke(); g.beginPath(); g.moveTo(30, 34); g.lineTo(58, 34); g.lineWidth = 4; g.stroke(); });
const prsEstrMat = prsLienzo(128, 128, g => { g.beginPath(); for (let k = 0; k < 10; k++){ const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 24 : 54; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } g.closePath();
  g.fillStyle = '#ffd400'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#000'; g.lineJoin = 'round'; g.stroke(); g.fillStyle = '#fff'; g.beginPath(); g.arc(54, 52, 7, 0, TAU); g.fill(); });
const prsPafMat = prsLienzo(160, 128, g => { const R = mulberry32(5301); g.beginPath();
  for (let k = 0; k < 24; k++){ const a = k / 24 * TAU, r = (k % 2 ? 34 : 62) + R() * 8; g.lineTo(80 + Math.cos(a) * r * 1.2, 64 + Math.sin(a) * r * 0.95); } g.closePath();
  g.fillStyle = '#ffd400'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#000'; g.lineJoin = 'round'; g.stroke();
  g.font = 'italic 900 40px Impact, "Arial Black", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeText('¡PAF!', 80, 66); g.fillStyle = '#e60012'; g.fillText('¡PAF!', 80, 66); });
// Las estrellitas que dan vueltas sobre la cabeza del derribado
const prsGiraMat = prsLienzo(128, 64, g => { g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 3; g.setLineDash([6, 6]); g.beginPath(); g.ellipse(64, 32, 52, 18, 0, 0, TAU); g.stroke(); g.setLineDash([]);
  for (const [x, y, r] of [[18, 30, 13], [64, 50, 15], [108, 28, 12]]){ g.beginPath(); for (let k = 0; k < 10; k++){ const a = -Math.PI / 2 + k * Math.PI / 5, q = k % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } g.closePath();
    g.fillStyle = '#ffe14a'; g.fill(); g.lineWidth = 3; g.strokeStyle = '#000'; g.stroke(); } });
const PRS_SPR = [prsPunoMat, prsPunoMat, prsBotaMat, prsEstrMat, prsPafMat]; for (const m of PRS_SPR) m.depthTest = false;   // asoman siempre por delante de la nube
const prsDerribable = e => e.alive && e.spawnT <= 0 && !foilJefe(e) && !e.cap && e.type !== 'puesto' && e.type !== 'dragon' && !e.noSep && e.reach !== false && !e.yosTrag && !e.colFase && !e.terFase;
const prsEsRemate = () => state === 'attack' && curMove && seqI < 96 && !curMove.special && weaponSeq().length > 1 && seqI === weaponSeq().length - 1;
// Letras recortadas, como una nota de rescate (cada letra con su papel, su letra y su giro)
function prsRecorte(txt){ let i = 0;
  return txt.split(' ').map(pal => '<span class="prsPal">' + [...pal].map(ch => { const c = ch.codePointAt(0), k = (i * 7 + c * 3) % 6, r = ((i * 37 + c * 13) % 17) - 8; i++;
    return `<span class="prsL prsL${k}" style="--r:${r}deg">${ch}</span>`; }).join('') + '</span>').join('<span class="prsEsp"> </span>'); }
function prsDerriba(e){
  const nuevo = !(e.prsDer > 0); e.prsDer = PRS_DER; if (!nuevo) return;
  e.prsCae = 0; e.g.rotation.order = 'YXZ'; e.state = 'chase'; e.t = 0; e.vx *= 0.5; e.vz *= 0.5; if (e.tele) e.tele.visible = false;
  prsEstrella(e); player.meter = Math.min(100, player.meter + 3);
  if (time - PRS.masT > 0.6){ PRS.masT = time; foilRotulo('<b>¡1 MÁS!</b>', 'prsMas', 1.0); play('prsMas'); }
  barkOnce('foil_prs', '¡Al suelo! Ahora que están tumbados, Tovan… remátalos con estilo. Con mucho estilo. Con guantes, si puede ser.');
}
function prsLevanta(e){ e.prsDer = 0; e.g.rotation.x = 0; e.g.rotation.order = 'XYZ'; e.state = 'chase'; e.t = 0; e.cd = Math.max(e.cd || 0, 0.6); }
function prsTumbado(e, dt){
  e.prsDer -= dt; e.prsCae += dt;
  updateStatuses(e, dt); if (!e.alive) return;
  if (e.flash > 0) e.flash -= dt; if (e.orbCd > 0) e.orbCd -= dt;
  e.g.position.x += e.vx * dt; e.g.position.z += e.vz * dt; const kd = Math.exp(-dt * 7); e.vx *= kd; e.vz *= kd;
  const caer = Math.min(1, e.prsCae / 0.22), lev = e.prsDer < 0.3 ? Math.max(0, e.prsDer / 0.3) : 1, bote = caer < 1 ? 0 : Math.sin(Math.min(1, (e.prsCae - 0.22) / 0.25) * Math.PI) * 0.15;
  e.g.rotation.x = (-1.3 * smooth(caer) + bote) * lev;
  if (e.prsDer <= 0) prsLevanta(e);
  applyFlash(e);
}
function prsEstrella(e){
  let q = PRS.est.find(x => !x.e); if (!q){ const s = new THREE.Sprite(prsGiraMat); s.renderOrder = 6; s.visible = false; scene.add(s); q = { s, e: null }; PRS.est.push(q); }
  q.e = e; q.s.visible = true;
}
function prsEstrellasTick(){
  for (const q of PRS.est){ const e = q.e; if (!e) continue;
    if (!e.alive || !(e.prsDer > 0) || e.prsNube){ q.e = null; q.s.visible = false; continue; }
    const y = e.g.rotation.y, b = -Math.min(1.6, e.numY * 0.62), sc = Math.max(0.6, e.scale);
    q.s.position.set(e.g.position.x + Math.sin(y) * b, 0.55 + 0.25 * sc + Math.sin(time * 6) * 0.06, e.g.position.z + Math.cos(y) * b); q.s.scale.set(1.15 * sc * Math.cos(time * 5), 0.58 * sc, 1); }
}
// La nube de pelea: bolas blancas fundidas con su silueta negra, y puños, botas y estrellas que asoman
function prsNube(){
  let n = PRS.nubes.find(x => !x.on); if (n) return n; if (PRS.nubes.length >= PRS_NUBES) return null;
  if (!PRS.geo){ const t = new THREE.Group(), w = makeMat(0xffffff);
    for (const [x, y, z, r] of [[0, 0, 0, 0.9], [0.78, 0.12, 0, 0.62], [-0.78, 0.1, 0.05, 0.66], [0, 0.6, 0.15, 0.7], [0.42, -0.25, 0.6, 0.55], [-0.45, 0.38, -0.5, 0.6], [0.25, 0.32, -0.68, 0.55], [-0.55, -0.28, 0.5, 0.52], [0.5, 0.55, 0.45, 0.45]]) mesh(new THREE.IcosahedronGeometry(r, 1), w, x, y, z, t);
    const d = new THREE.Group(); mpFusiona(t, d); PRS.geo = d.children[0].geometry; PRS.matB = makeMat(0xffffff, { emissive: 0.5 }); PRS.matN = makeMat(0x0a0a0a, { emissive: 1, side: THREE.BackSide }); }
  const g = new THREE.Group(); g.visible = false; scene.add(g);
  const b = new THREE.Mesh(PRS.geo, PRS.matB), o = new THREE.Mesh(PRS.geo, PRS.matN); o.scale.setScalar(1.09); g.add(b); g.add(o);
  const spr = [0, 1, 2].map(() => { const s = new THREE.Sprite(prsPunoMat); s.visible = false; s.renderOrder = 7; scene.add(s); return { s, t: 1, dur: 0.2, a: 0 }; });
  n = { g, b, o, spr, on: false }; PRS.nubes.push(n); return n;
}
function prsAtaqueTotal(L){
  L = L.sort((a, b) => Math.hypot(a.g.position.x - hero.position.x, a.g.position.z - hero.position.z) - Math.hypot(b.g.position.x - hero.position.x, b.g.position.z - hero.position.z));
  for (const e of enemies) if (e.alive && e.prsDer > 0) e.prsDer = Math.max(e.prsDer, 3.4);
  const pares = [];
  for (const e of L){ const n = prsNube(); if (n){ n.on = true; n.g.visible = true; n.e = e; e.prsNube = true; e.g.visible = false; for (const q of n.spr) q.t = 9; pares.push(n); } }
  PRS.tot = { t: 0, L, pares, px: hero.position.x, pz: hero.position.z, golpe: 0.15, fin: false, ya: false };
  PRS.blob = blob.visible; flash('#e60012', 0.35); shake = Math.max(shake, 0.3); hitStop = Math.max(hitStop, 0.08); play('prsTotal');
  foilRotulo('<i class="prsP prsP1"></i><i class="prsP prsP2"></i><i class="prsP prsP3"></i><div class="prsTitulo">' + prsRecorte('¡ATAQUE TOTAL!') + '</div>', 'prsPaneles', 1.05);
}
const prsR0 = new V3();
function prsTotTick(dt){
  const T = PRS.tot; if (!T) return;
  T.t += dt; hero.position.x = T.px; hero.position.z = T.pz; MOV11.vx = MOV11.vz = 0;
  const rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
  if (T.t < 1.6){
    for (const n of T.pares){ const e = n.e, k = Math.min(1, T.t / 0.15), sc = 0.5 * Math.max(0.9, e.scale) * Math.max(1, e.r / 0.55) * k;
      n.g.position.set(e.g.position.x + Math.sin(time * 31 + e.seed) * 0.08, 0.6 * Math.max(0.8, e.scale) + Math.abs(Math.sin(time * 17 + e.seed)) * 0.15, e.g.position.z + Math.cos(time * 27 + e.seed) * 0.08);
      n.g.scale.set(sc * (1 + 0.1 * Math.sin(time * 23 + e.seed)), sc * (1 + 0.12 * Math.sin(time * 19 + e.seed * 2)), sc); n.g.rotation.y += dt * 4;
      for (const q of n.spr){ q.t += dt;
        if (q.t > q.dur){ q.t = 0; q.dur = 0.14 + rnd() * 0.12; q.a = rnd() * TAU; q.s.material = PRS_SPR[Math.floor(rnd() * PRS_SPR.length)]; q.fl = rnd() < 0.5 ? -1 : 1; q.s.visible = true; }
        const p = Math.min(1, q.t / q.dur), out = Math.sin(p * Math.PI), rr = sc * (1.35 + 0.7 * out);
        q.s.position.set(n.g.position.x + (rx * Math.cos(q.a)) * rr, n.g.position.y + Math.sin(q.a) * rr * 0.85, n.g.position.z + (rz * Math.cos(q.a)) * rr);
        q.s.scale.set(0.85 * out * q.fl * (Math.cos(q.a) < 0 ? -1 : 1), 0.85 * out, 1); }
      if (rnd() < dt * 10) spawnFx(n.g.position.x + (rnd() - 0.5) * 1.6, 0.2, n.g.position.z + (rnd() - 0.5) * 1.6, (rnd() - 0.5) * 3, 1, (rnd() - 0.5) * 3, 0xd8cfc0, 0.14, 0.4, 2, 1.5); }
    T.golpe -= dt;
    if (T.golpe <= 0){ T.golpe = 0.16; play('prsPum');
      for (const e of T.L) if (e.alive) hitEnemy(e, foilDano(rdmg(11)), rnd() < up.crit, 0, 0, 0, 0.3, false, { src: 'aoe' }); }
  } else if (!T.fin){ T.fin = true; prsNubesFuera(true);
    flash('#ffffff', 0.6); shake = Math.max(shake, 0.6); hitStop = Math.max(hitStop, 0.1); play('prsFin'); lightFlash(T.px, 2, T.pz, 0xff3040, 3, 14);
    for (const e of T.L){ if (!e.alive) continue; const dx = e.g.position.x - T.px, dz = e.g.position.z - T.pz, l = Math.max(0.01, Math.hypot(dx, dz)); e.prsDer = Math.min(e.prsDer, 0.6);
      hitEnemy(e, foilDano(rdmg(62)), true, dx / l, dz / l, 7, 1, false, { src: 'aoe' }); }
    foilRotulo('<div class="prsFrase">' + prsRecorte('¡FIN DEL ESPECTÁCULO!') + '</div><small>Te hemos robado el corazón.</small>', 'prsTarjeta', 1.9); }
  if (T.t > 2.5) prsTotFin();
}
function prsNubesFuera(estalla){
  const T = PRS.tot; if (!T) return;
  for (const n of T.pares){ const e = n.e; n.on = false; n.g.visible = false; for (const q of n.spr) q.s.visible = false; if (e){ e.prsNube = false; if (e.g) e.g.visible = true; }
    if (estalla){ const p = n.g.position; for (let i = 0; i < 8; i++){ const a = rnd() * TAU; spawnFx(p.x, p.y, p.z, Math.cos(a) * 4, 1 + rnd() * 3, Math.sin(a) * 4, i % 2 ? 0xffffff : 0xffd400, 0.14, 0.5, 6, 1); } ringFx(p.x, p.z, 0xe60012, 0.3, 2.2, 0.3); } }
  T.pares = [];
}
function prsTotFin(){ if (!PRS.tot) return; prsNubesFuera(false); PRS.tot = null; if (PRS.oculto){ PRS.oculto = false; blob.visible = PRS.blob; } }
function prsPose(){ const T = PRS.tot; if (!T || T.t < 1.6) return; const w = Math.min(1, (T.t - 1.6) / 0.15) * Math.max(0, Math.min(1, (2.5 - T.t) / 0.2));   // la pose: la mano a la cara, como quien se ajusta la máscara
  bl(P.armL.sh.rotation, 'x', -2.4, w); bl(P.armL.sh.rotation, 'z', 0.35, w); bl(P.armL.el.rotation, 'x', -2.1, w);
  bl(P.armR.sh.rotation, 'z', 0.9, w); bl(P.armR.sh.rotation, 'x', 0.3, w); bl(P.spine.rotation, 'y', 0.35, w); bl(P.neck.rotation, 'x', 0.2, w); bl(P.neck.rotation, 'z', -0.15, w); }
function prsPost(){ const T = PRS.tot;
  if (T && T.t < 1.6){ if (!PRS.oculto){ PRS.oculto = true; PRS.blob = blob.visible; } hero.visible = false; blob.visible = false; }
  else if (PRS.oculto){ PRS.oculto = false; blob.visible = PRS.blob; } }
function prsMarca(){
  let n = 0; for (const e of enemies) if (e.alive && e.prsDer > 0) n++;
  const txt = PRS.tot ? '' : n >= 3 ? 'listo' : n ? String(n) : '', el = foilMarcador('prs', 'prsMarca');
  el.hidden = !txt; if (txt !== PRS.marca){ PRS.marca = txt; if (txt) el.innerHTML = n >= 3 ? '<b>¡ATAQUE TOTAL!</b><i>remata ya</i>' : `<b>DERRIBADOS</b><i>${n} / 3</i>`; el.classList.toggle('prsListo', n >= 3); }
}
function prsLimpia(){ prsTotFin(); for (const q of PRS.est){ q.e = null; q.s.visible = false; } for (const e of enemies) if (e.prsDer > 0){ prsLevanta(e); e.g.visible = true; } }
const prsHitEnemyPrev = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee, o){
  const r = prsHitEnemyPrev(e, val, crit, nx, nz, knock, meterGain, melee, o);
  try { if (r && !PRS.tot && lvl('foilPersona') && gameState === 'play' && prsDerribable(e)){ const src = o && o.src || (melee ? 'melee' : 'other');
      if (src !== 'dot' && (crit || ((melee || src === 'melee') && prsEsRemate()))) prsDerriba(e); } } catch (err) { console.error(err); }
  return r;
};
const prsUpdateEnemyPrev = updateEnemy;
updateEnemy = function(e, dt){ if (e.prsDer > 0 && e.alive && e.dying <= 0 && e.spawnT <= 0){ prsTumbado(e, dt); return; } prsUpdateEnemyPrev(e, dt); };
const prsDoAttackPrev = doAttack; doAttack = function(){ if (PRS.tot && gameState === 'play') return; prsDoAttackPrev(); };
foilPoder({ id: 'foilPersona', ic: '🎭', name: '¡Ataque total!', tags: ['otaku'],
  desc: 'De unos ladrones fantasma. Los críticos y los remates derriban a los enemigos (no a los jefes): 4 s en el suelo viendo estrellitas. ¡1 más! Con tres o más derribados, el siguiente remate lanza el ATAQUE TOTAL: una nube de pelea sobre cada uno, muchos golpes y un final con mucho estilo.',
  remate(){ if (PRS.tot) return; const L = enemies.filter(e => e.alive && e.prsDer > 0 && e.spawnT <= 0); if (L.length >= 3) prsAtaqueTotal(L); },
  rodar(){ return !!PRS.tot; }, saltar(){ return !!PRS.tot; }, herido(){ return PRS.tot ? 'none' : null; },
  tick(dt, jugando){ if (dt > 0) prsTotTick(dt); prsEstrellasTick(); if (jugando) prsMarca(); },
  pose(){ prsPose(); }, post(){ prsPost(); },
  limpia(){ prsLimpia(); }, reset(){ prsLimpia(); PRS.marca = ''; } });
Object.assign(SFX, {
  prsMas: () => { noise({ dur: 0.22, vol: 0.22, f0: 1800, f1: 9000, q: 1.2, rv: 0.2 }); tone({ type: 'triangle', f0: NOTE(91), dur: 0.35, vol: 0.1, when: 0.05, rv: 0.5 }); tone({ type: 'square', f0: NOTE(84), dur: 0.12, vol: 0.05, when: 0.02 }); },
  prsTotal: () => { [57, 61, 64, 68].forEach((n, i) => tone({ type: 'sawtooth', f0: NOTE(n), dur: 0.35, vol: 0.06, when: i * 0.03, rv: 0.3 })); noise({ dur: 0.3, vol: 0.25, f0: 2500, f1: 400, rv: 0.2 }); tone({ type: 'square', f0: NOTE(69), f1: NOTE(81), dur: 0.25, vol: 0.06, when: 0.15 }); },
  prsPum: () => { const f = 140 + Math.random() * 120; tone({ type: 'square', f0: f, f1: f * 0.35, dur: 0.08, vol: 0.12 }); noise({ dur: 0.07, vol: 0.22, f0: 900 + Math.random() * 900, type: 'lowpass', q: 0.6 }); },
  prsFin: () => { SFX.specialBoom(); noise({ dur: 0.5, vol: 0.3, f0: 6000, f1: 800, q: 0.8, rv: 0.5 }); [69, 73, 76, 81].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.6, vol: 0.06, when: 0.08 + i * 0.05, rv: 0.6 })); }
});

/* ========== 4 · ESTILO SSS (dmc) ========== */
const DMC = { s: 0, r: 0, mov: null, hist: [], quieto: 0, F: null, marca: '', ancho: -1, alas: null, ojos: null, aura: null, cupo: 6, reintenta: 0, cura: 0 };
const DMC_UMB = [15, 85, 170, 265, 370, 480, 600];   // D, C, B, A, S, SS, SSS
const DMC_RANGO = [['D', 'Discreto'], ['C', 'Cruel'], ['B', 'Bestial'], ['A', 'Arrasador'], ['S', 'Salvaje'], ['SS', 'Sobresaliente'], ['SSS', '¡Soberbio, sublime, sensacional!']];
// letras góticas: las de fraktur negrita del bloque matemático de Unicode (no hace falta cargar ninguna fuente)
const dmcGotica = t => [...t].map(ch => { const c = ch.charCodeAt(0); return c >= 65 && c <= 90 ? String.fromCodePoint(0x1D56C + c - 65) : c >= 97 && c <= 122 ? String.fromCodePoint(0x1D586 + c - 97) : ch; }).join('');
// El tajo rojo del gatillo: núcleo al rojo blanco, cuerpo carmesí, borde mellado y grietas negras
TRAZO_FS.dmc = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  float u = vUV.x, a = abs(vUV.y), m = u * uLen;
  float n = n2(vec2(m * 3.0 + uSeed, vUV.y * 4.0)), borde = 0.62 + 0.38 * n * (0.4 + 0.6 * u);
  if (a > borde) discard;
  float t = a / borde;
  vec3 col = mix(uA, uB, smoothstep(0.0, 0.32, t)); col = mix(col, uC, smoothstep(0.55, 0.95, t));
  float grieta = step(0.9, n2(vec2(m * 8.0 - uSeed, vUV.y * 2.5 + uTime * 3.0)));
  col = mix(col, uE, grieta * smoothstep(0.25, 0.6, t));
  gl_FragColor = vec4(col * (1.0 + 0.4 * (1.0 - t)), uAlpha * smoothstep(0.0, 0.12, u));
}`;
const DMC_TAJO = [0xfff0f2, 0xff1a2e, 0x4a0008, 0x050002];
const dmcAuraMat = foilSprite(foilLienzo(128, 192, g => { const R = mulberry32(6601);
  const gr = g.createRadialGradient(64, 120, 6, 64, 110, 70); gr.addColorStop(0, 'rgba(255,60,70,0.55)'); gr.addColorStop(0.6, 'rgba(160,0,20,0.3)'); gr.addColorStop(1, 'rgba(60,0,10,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 192);
  g.filter = 'blur(3px)'; for (let k = 0; k < 22; k++){ const x = 18 + R() * 92, h = 50 + R() * 110, w = 6 + R() * 12, y0 = 176 - R() * 30;
    g.beginPath(); g.moveTo(x - w, y0); g.quadraticCurveTo(x - w * 0.4 + (R() - 0.5) * 20, y0 - h * 0.6, x + (R() - 0.5) * 16, y0 - h); g.quadraticCurveTo(x + w * 0.5, y0 - h * 0.5, x + w, y0); g.closePath();
    g.fillStyle = R() < 0.5 ? 'rgba(255,40,50,0.45)' : 'rgba(255,140,120,0.35)'; g.fill(); } }), true);
function dmcRango(s){ let r = 0; while (r < 7 && s >= DMC_UMB[r]) r++; return r; }
function dmcSube(g){
  if (DMC.F) return; DMC.quieto = 0; DMC.s = Math.min(DMC_UMB[6] + 30, DMC.s + g);
  const r = dmcRango(DMC.s); if (r > DMC.r){ DMC.r = r; dmcAnuncia(r); } else DMC.r = r;
}
function dmcAnuncia(r){
  dmcMarca(true); if (r >= 5) play('dmcRango'); else if (r >= 3) play('dmcRango0');
  if (r === 7){ DMC.reintenta = 0; dmcGatillo(); }
  if (r === 1) barkOnce('foil_dmc', 'Te están puntuando, Tovan. Variar suma; repetir aburre; que te den quita. Y no, no sé quién puntúa.');
}
function dmcPuntua(src, crit, melee){
  let g = 0;
  if (melee || src === 'melee'){ const M = DMC.mov;
    if (!M || time - M.t > 1.6) g = 4;
    else if (M.hits++) g = 2;
    else { const rep = DMC.hist.slice(-4, -1).filter(x => x === M.name).length; g = 10 * (rep >= 2 ? 0.45 : rep ? 0.85 : 1.6);
      if (M.name === 'dive') g += 24; else if (M.name === 'dash') g += 22; else if (M.name === 'special') g += 60; else if (M.name === 'flurry') g += 12; else if (M.fin) g += 16;
      if (M.aire) g += 14; }
    if (crit) g += 4;
  } else if (DMC.cupo >= 1){ DMC.cupo -= 1; g = 2; }
  if (g) dmcSube(g);
}
function dmcHerido(){
  if (DMC.F || DMC.r <= 0) return;
  const r = Math.max(0, DMC.r - 2); DMC.s = r ? DMC_UMB[r - 1] + 4 : 0; DMC.r = r; DMC.quieto = 0;
  const el = foilMarcador('dmc', 'dmcMarca'); el.classList.remove('dmcCae'); void el.offsetWidth; el.classList.add('dmcCae'); play('dmcCae'); dmcMarca(true);
}
function dmcMarca(forzar){
  const el = foilMarcador('dmc', 'dmcMarca'), r = DMC.F ? 7 : DMC.r; el.hidden = r <= 0;
  if (r <= 0){ DMC.marca = ''; return; }
  const clave = r + (DMC.F ? 'F' : '');
  if (clave !== DMC.marca || forzar){ const sube = forzar && clave !== DMC.marca; DMC.marca = clave; const [L, W] = DMC_RANGO[r - 1];
    el.innerHTML = `<div class="dmcLetra">${L}</div><div class="dmcPal">${W}</div><i class="dmcBarra"><u></u></i>`; el.className = `foilMarca dmcMarca dmcR${r}${DMC.F ? ' dmcGat' : ''}`; DMC.ancho = -1;
    if (sube){ void el.offsetWidth; el.classList.add('dmcSube'); } }
  const k = DMC.F ? Math.max(0, 1 - DMC.F.t / DMC.F.dur) : r >= 7 ? 1 : clamp((DMC.s - DMC_UMB[r - 1]) / (DMC_UMB[r] - DMC_UMB[r - 1]), 0, 1), w = Math.round(k * 100);
  if (w !== DMC.ancho){ DMC.ancho = w; const u = el.querySelector('.dmcBarra u'); if (u) u.style.width = w + '%'; }
}
/* ---------- ¡Gatillo demoníaco! ---------- */
function dmcPiezas(){
  if (DMC.alas) return;
  const mM = makeMat(0x2a0408, { side: THREE.DoubleSide, emissive: 0.3 }), mH = makeMat(0xc0101e, { emissive: 0.8 });
  const R = new V3(0, 0, 0), W = new V3(0.42, 0.34, -0.05), T = [new V3(0.98, 0.56, -0.12), new V3(1.06, 0.1, -0.16), new V3(0.84, -0.3, -0.12), new V3(0.44, -0.4, -0.08), new V3(0.08, -0.24, -0.02)];
  const pos = [], tri = (a, b, c) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let i = 0; i < T.length - 1; i++){ const s = new V3().addVectors(T[i], T[i + 1]).multiplyScalar(0.5).lerp(W, 0.28); tri(W, T[i], s); tri(W, s, T[i + 1]); } tri(R, T[0], W); tri(R, W, T[T.length - 1]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(pos.length / 3 * 2).fill(0), 2)); geo.computeVertexNormals();
  DMC.alas = [1, -1].map(s => { const t = new THREE.Group(); mesh(geo, mM, 0, 0, 0, t); bahHueso(R, W, 0.035, mH, t); for (let i = 0; i < 4; i++) bahHueso(W, T[i], 0.022, mH, t);
    mesh(new THREE.ConeGeometry(0.03, 0.14, 4), mH, W.x, W.y + 0.07, W.z, t);
    const g = new THREE.Group(); mpFusiona(t, g); g.position.set(0.1 * s, 0.52, -0.22); g.scale.x = s; g.visible = false; P.spine.add(g); return g; });
  const ojoM = makeMat(0xff1a1a, { emissive: 1 });
  DMC.ojos = [-1, 1].map(s => { const o = mesh(B(0.075, 0.034, 0.03), ojoM, 0.085 * s, 0.32, 0.234, P.neck); o.rotation.z = -0.22 * s; o.visible = false; return o; });
  DMC.aura = new THREE.Sprite(dmcAuraMat); DMC.aura.visible = false; DMC.aura.renderOrder = 4; scene.add(DMC.aura);
}
function dmcGatillo(){
  if (DMC.F || FOILX.forma) return false;
  const F = foilForma({ id: 'dmcGatillo', nom: 'GATILLO DEMONÍACO', col: '#ff2a3a', dur: 10, velK: 1.3, danoK: 1.5, camK: 1.06,
    empieza: dmcEmpieza, golpe: dmcTajo, remate: dmcRemata, pose: dmcPose, postPose: dmcPost, fin: dmcFin });
  if (!F){ DMC.reintenta = 1; return false; }
  DMC.F = F; return true;
}
function dmcEmpieza(){
  dmcPiezas(); for (const a of DMC.alas) a.visible = true; for (const o of DMC.ojos) o.visible = true; DMC.aura.visible = true; DMC.cura = 0;
  const O = hero.position; flash('#ff1a2a', 0.5); shake = Math.max(shake, 0.5); hitStop = Math.max(hitStop, 0.1); lightFlash(O.x, 1.5, O.z, 0xff2030, 3.5, 12); play('dmcGatillo');
  ringFx(O.x, O.z, 0xff1a2e, 0.3, 4.5, 0.5); ringFx(O.x, O.z, 0x200004, 0.2, 3, 0.4, 0.4);
  for (let i = 0; i < 30; i++){ const a = rnd() * TAU; spawnFx(O.x, 0.4 + rnd() * 1.4, O.z, Math.cos(a) * 5, 1 + rnd() * 3, Math.sin(a) * 5, i % 3 ? 0xff2030 : 0x1a0004, 0.1, 0.7, 2, 0); }
  foilRotulo(`<b>¡${dmcGotica('Gatillo demoniaco')}!</b><small>${dmcGotica('Sublime')} · 10 s</small>`, 'dmcRot', 2.2);
  heal(Math.round(player.maxHp * 0.05)); dmcMarca(true);
}
function dmcFin(){
  DMC.F = null; DMC.s = DMC_UMB[3] + 5; DMC.r = dmcRango(DMC.s); DMC.reintenta = 0;
  if (DMC.alas) for (const a of DMC.alas) a.visible = false; if (DMC.ojos) for (const o of DMC.ojos) o.visible = false; if (DMC.aura) DMC.aura.visible = false;
  if (gameState === 'play') play('dmcFin'); dmcMarca(true);
}
function dmcTajo(f, idx){
  tintaArco(DMC_TAJO, 1.9, f, idx % 2 ? -1 : 1, 0.75, 0.3, 0.95, O => { const d = rdmg(10);
    for (const e of enemies){ const n = enCono(O, e, f, 2.7, 1.4); if (n && foilGolpea(e, d, n[0], n[1], 2, null, 0.6)) sparks(e.g.position.x, 1, e.g.position.z, 5, 0xff3040, 3); } }, 'dmc');
  play('dmcTajo');
}
function dmcRemata(f){   // dos tajos cruzados en X delante de Tovan
  const O = hero.position.clone(), fx = Math.sin(f), fz = Math.cos(f), rx = Math.cos(f), rz = -Math.sin(f), ya = new Set(), dmg = rdmg(30);
  const cs_ = [tintaCoge(DMC_TAJO, 0, 'dmc'), tintaCoge(DMC_TAJO, 0, 'dmc')];
  const camino = sg => (s, v) => { const l = lerp(-1.6, 1.6, s) * sg, h = lerp(2.5, 0.2, s), b = 1.5 + Math.sin(s * Math.PI) * 0.5; return v.set(O.x + fx * b + rx * l, O.y + h, O.z + fz * b + rz * l); };
  const P1 = camino(1), P2 = camino(-1); let pegado = false;
  flash('#ff1a2a', 0.2); shake = Math.max(shake, 0.3); play('dmcTajo'); play('swingBig');
  foilFx.push({ t: 0, cintas: cs_, upd(){ const k1 = Math.min(1, this.t / 0.09), k2 = clamp((this.t - 0.07) / 0.09, 0, 1), fade = Math.max(0, (this.t - 0.25) / 0.3); if (fade >= 1) return false;
      tintaPinta(cs_[0], P1, Math.max(0, k1 - 0.9), k1, q => 0.95 * Math.sin(q * Math.PI)); if (k2 > 0) tintaPinta(cs_[1], P2, Math.max(0, k2 - 0.9), k2, q => 0.95 * Math.sin(q * Math.PI));
      cs_[0].mat.uniforms.uAlpha.value = 1 - fade; cs_[1].mat.uniforms.uAlpha.value = k2 > 0 ? 1 - fade : 0;
      if (!pegado && k2 >= 1){ pegado = true; for (const e of enemies){ const n = enCono(O, e, f, 3.2, 1.0); if (n && foilGolpea(e, dmg, n[0], n[1], 5, null, 1, ya)) sparks(e.g.position.x, 1.1, e.g.position.z, 10, 0xff3040, 5); } }
      return true; } });
}
function dmcPose(){ if (!DMC.alas) return; P.spine.rotation.x += 0.06; }
function dmcPost(){
  const F = DMC.F; if (!F || !DMC.alas) return;
  const a = Math.sin(time * 7) * 0.25; DMC.alas[0].rotation.set(0.15, -0.55 + a, 0.25); DMC.alas[1].rotation.set(0.15, 0.55 - a, -0.25);
  const cx = camera.position.x - hero.position.x, cz = camera.position.z - hero.position.z, l = Math.max(0.01, Math.hypot(cx, cz)), k = 0.95 + 0.08 * Math.sin(time * 23) + 0.05 * Math.sin(time * 37);
  DMC.aura.position.set(hero.position.x - cx / l * 0.45, hero.position.y + 1.15, hero.position.z - cz / l * 0.45); DMC.aura.scale.set(2.5 * k, 3.4 * k, 1);
  dmcAuraMat.opacity = Math.min(1, F.t / 0.3) * (F.dur - F.t < 1 ? Math.max(0.2, (F.dur - F.t) * (0.6 + 0.4 * Math.sin(time * 30))) : 1);
}
function dmcFormaTick(dt){
  const F = DMC.F; if (!F) return;
  DMC.cura += player.maxHp * 0.015 * dt; if (DMC.cura >= 1){ const v = Math.floor(DMC.cura); DMC.cura -= v; heal(v, true); }
  if (rnd() < dt * 26){ const a = rnd() * TAU, r = 0.3 + rnd() * 0.4; spawnFx(hero.position.x + Math.cos(a) * r, hero.position.y + 0.2 + rnd() * 1.4, hero.position.z + Math.sin(a) * r, 0, 1.4 + rnd(), 0, rnd() < 0.7 ? 0xff2030 : 0x1a0004, 0.06, 0.6, -1, 0); }
}
function dmcLimpia(){ if (DMC.alas) for (const a of DMC.alas) a.visible = false; if (DMC.ojos) for (const o of DMC.ojos) o.visible = false; if (DMC.aura) DMC.aura.visible = false; if (DMC.F && FOILX.forma !== DMC.F) DMC.F = null; }
const dmcStartMovePrev = startMove;
startMove = function(name, idx){
  dmcStartMovePrev(name, idx);
  if (lvl('foilDante')){ const seq = weaponSeq(); DMC.mov = { name: idx >= 96 || name === 'special' ? name : 'c' + idx, t: time, hits: 0, fin: idx < 96 && seq.length > 1 && idx === seq.length - 1, aire: !grounded && hero.position.y > 0.3 };
    DMC.hist.push(DMC.mov.name); if (DMC.hist.length > 6) DMC.hist.shift(); }
};
const dmcHurtPlayerPrev = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){ const h0 = player.hp, r = dmcHurtPlayerPrev(dmg, sx, sz, knock); if (player.hp < h0 && lvl('foilDante')) try { dmcHerido(); } catch (err) { console.error(err); } return r; };
const dmcAtkSpdPrev = atkSpd; atkSpd = function(){ return dmcAtkSpdPrev() * (DMC.F ? 1.2 : 1); };
foilPoder({ id: 'foilDante', ic: '😈', name: 'Estilo SSS', tags: ['otaku'],
  desc: 'De un cazador de demonios. Un medidor de estilo te puntúa de D a SSS (+6 % de daño por rango): sube con cada golpe y mucho más si variás (remate, picado, estocada en voltereta, especial, golpes en el aire); baja con el tiempo y cae dos rangos si te hieren. En SSS: «¡Gatillo demoníaco!», 10 s con alas, más rápido, mucho más daño y curándote.',
  dano(e, val, o, crit, melee){ const src = o && o.src || (melee ? 'melee' : 'other'); if (src !== 'dot' && gameState === 'play' && e.alive) dmcPuntua(src, crit, melee); return val * (1 + 0.06 * (DMC.F ? 7 : DMC.r)); },
  tick(dt, jugando){
    if (DMC.F && FOILX.forma !== DMC.F){ DMC.F = null; dmcLimpia(); }
    if (dt > 0){ DMC.cupo = Math.min(6, DMC.cupo + dt * 6);
      if (DMC.F) dmcFormaTick(dt);
      else { DMC.quieto += dt; const r = DMC.r; DMC.s = Math.max(0, DMC.s - (2 + 3 * r) * (DMC.quieto > 2.5 ? 2.2 : 1) * dt); DMC.r = dmcRango(DMC.s);
        if (DMC.r >= 7 && !FOILX.forma && foilEscenario() && (DMC.reintenta -= dt) <= 0) dmcGatillo(); } }
    if (jugando) dmcMarca(false); },
  limpia(){ dmcLimpia(); }, reset(){ dmcLimpia(); Object.assign(DMC, { s: 0, r: 0, mov: null, quieto: 0, F: null, marca: '', reintenta: 0 }); DMC.hist.length = 0; } });
Object.assign(SFX, {
  dmcTajo: () => { noise({ dur: 0.14, vol: 0.2, f0: 5200, f1: 1200, q: 1.4, rv: 0.1 }); tone({ type: 'sawtooth', f0: 520, f1: 160, dur: 0.1, vol: 0.05 }); },
  dmcRango0: () => { tone({ type: 'triangle', f0: NOTE(76), dur: 0.25, vol: 0.08, rv: 0.6 }); tone({ type: 'triangle', f0: NOTE(83), dur: 0.35, vol: 0.07, when: 0.06, rv: 0.6 }); },
  dmcRango: () => { [40, 47, 52].forEach(n => tone({ type: 'sawtooth', f0: NOTE(n), dur: 0.5, vol: 0.07, rv: 0.4 })); tone({ type: 'triangle', f0: NOTE(88), dur: 0.5, vol: 0.07, when: 0.05, rv: 0.7 }); noise({ dur: 0.2, vol: 0.12, f0: 3000, type: 'highpass' }); },
  dmcCae: () => { tone({ type: 'sawtooth', f0: 330, f1: 90, dur: 0.35, vol: 0.08, rv: 0.3 }); },
  dmcGatillo: () => { [28, 35, 40, 47].forEach((n, i) => tone({ type: 'sawtooth', f0: NOTE(n), dur: 1.2, vol: 0.08, when: i * 0.02, rv: 0.6 })); tone({ type: 'sawtooth', f0: 110, f1: 45, dur: 1.1, vol: 0.2, rv: 0.6 }); noise({ dur: 0.9, vol: 0.25, f0: 900, f1: 120, type: 'lowpass', rv: 0.6 }); tone({ type: 'square', f0: NOTE(76), f1: NOTE(64), dur: 0.6, vol: 0.05, when: 0.2, rv: 0.5 }); },
  dmcFin: () => tone({ type: 'sawtooth', f0: 220, f1: 70, dur: 0.6, vol: 0.08, rv: 0.4 })
});

/* ========== 5 · LLUVIA DE TETRIMINÓS (tet) ========== */
const TET = { piezas: [], geos: {}, frase: 0, fraseT: -9, alto: 16 };   // (alto: desde dónde caen; la mutación dorada las suelta más bajo, desde sus portales)
const TET_L = 0.82, TET_MAX = 12;
const TET_FORMAS = { I: [[0, 0], [1, 0], [2, 0], [3, 0]], O: [[0, 0], [1, 0], [0, 1], [1, 1]], T: [[0, 0], [1, 0], [2, 0], [1, 1]], S: [[0, 0], [1, 0], [1, 1], [2, 1]],
  Z: [[1, 0], [2, 0], [0, 1], [1, 1]], L: [[0, 0], [1, 0], [2, 0], [2, 1]], J: [[0, 0], [1, 0], [2, 0], [0, 1]] };
const TET_COL = { I: 0x00f0f0, O: 0xf0f000, T: 0xa000f0, S: 0x00f000, Z: 0xf00000, L: 0xf0a000, J: 0x2040ff };
// Cubo biselado: borde claro arriba y a la izquierda, oscuro abajo y a la derecha, como los bloques de siempre
const tetBiselTex = (() => { const c = foilLienzo(32, 32, g => {
    g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, 32, 32);
    g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(0, 0); g.lineTo(32, 0); g.lineTo(26, 6); g.lineTo(6, 6); g.lineTo(6, 26); g.lineTo(0, 32); g.closePath(); g.fill();
    g.fillStyle = '#3c3c3c'; g.beginPath(); g.moveTo(32, 32); g.lineTo(0, 32); g.lineTo(6, 26); g.lineTo(26, 26); g.lineTo(26, 6); g.lineTo(32, 0); g.closePath(); g.fill();
    g.fillStyle = '#c4c4c4'; g.fillRect(6, 6, 20, 20); g.fillStyle = '#f2f2f2'; g.fillRect(8, 8, 7, 3); g.fillRect(8, 8, 3, 7); });
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; return t; })();
// El láser de línea completada (aditivo): núcleo blanco y bloques de los siete colores que corren
TRAZO_FS.tet = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
void main(){
  float a = abs(vUV.y), m = vUV.x * uLen;
  float h = fract(floor(m * 1.2 - uTime * 16.0) / 7.0);
  vec3 c7 = h < 0.14 ? vec3(0.0, 0.94, 0.94) : h < 0.28 ? vec3(0.94, 0.94, 0.0) : h < 0.42 ? vec3(0.63, 0.0, 0.94) : h < 0.57 ? vec3(0.0, 0.94, 0.0) : h < 0.71 ? vec3(0.94, 0.0, 0.0) : h < 0.85 ? vec3(0.94, 0.63, 0.0) : vec3(0.12, 0.3, 1.0);
  float core = 1.0 - smoothstep(0.08, 0.4, a), raya = step(0.5, fract(m * 2.4)) * 0.18, bloque = step(0.12, fract(m * 1.2 - uTime * 16.0));
  vec3 col = mix(c7 * (1.0 + raya) * bloque, uA, core);
  gl_FragColor = vec4(col * 1.3, uAlpha * step(a, 0.9) * smoothstep(0.0, 0.015, vUV.x) * smoothstep(1.0, 0.985, vUV.x));
}`;
const TET_LASER = [0xffffff, 0xffffff, 0xffffff, 0];
function tetGeo(tipo){
  if (TET.geos[tipo]) return TET.geos[tipo];
  const F = TET_FORMAS[tipo], w = Math.max(...F.map(c => c[0])) + 1, h = Math.max(...F.map(c => c[1])) + 1, t = new THREE.Group(), m0 = makeMat(0xffffff);
  for (const [x, y] of F) mesh(B(TET_L * 0.98, TET_L * 0.98, TET_L * 0.98), m0, (x - w / 2 + 0.5) * TET_L, (y - h / 2 + 0.5) * TET_L, 0, t);
  const d = new THREE.Group(); mpFusiona(t, d); return (TET.geos[tipo] = { geo: d.children[0].geometry, w, h });
}
function tetPieza(tipo){
  let p = TET.piezas.find(q => !q.on);
  if (!p){ if (TET.piezas.length >= TET_MAX) return null;
    const mat = makeMat(0xffffff, { map: tetBiselTex, emissive: 0.5 }), ghMat = makeMat(0xffffff, { emissive: 1, opacity: 0.35 });
    p = { mat, ghMat, m: new THREE.Mesh(tetGeo('I').geo, mat), gh: new THREE.Mesh(tetGeo('I').geo, ghMat) }; p.m.visible = p.gh.visible = false; scene.add(p.m); scene.add(p.gh); TET.piezas.push(p); }
  const G = tetGeo(tipo); p.on = true; p.tipo = tipo; p.G = G; p.m.geometry = p.gh.geometry = G.geo; p.col = TET_COL[tipo];
  p.mat.uniforms.uColor.value.setHex(p.col); p.mat.uniforms.uEmissive.value = 0.5; p.ghMat.uniforms.uColor.value.setHex(p.col); p.m.scale.setScalar(1);
  return p;
}
function tetSuelta(p){ p.on = false; p.m.visible = p.gh.visible = false; }
function tetLluvia(f){
  const O = hero.position, fx = Math.sin(f), fz = Math.cos(f), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
  const cerca = foilEnemigos(O, 12).sort((a, b) => Math.hypot(a.g.position.x - O.x, a.g.position.z - O.z) - Math.hypot(b.g.position.x - O.x, b.g.position.z - O.z)).slice(0, 4);
  const bolsa = Object.keys(TET_FORMAS); for (let i = bolsa.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [bolsa[i], bolsa[j]] = [bolsa[j], bolsa[i]]; }   // la bolsa de siete, barajada
  const R = { ps: [], tetris: false, laser: null, laser2: null, C: new V3(), ya: new Set() };
  for (let i = 0; i < 4; i++){ const p = tetPieza(bolsa[i]); if (!p) continue;
    let x, z, e = null;
    if (cerca.length){ e = cerca[i % cerca.length]; const rep = Math.floor(i / cerca.length), o = rep ? (rep % 2 ? 0.55 : -0.55) * Math.ceil(rep / 2) : 0; x = e.g.position.x + rx * o; z = e.g.position.z + rz * o; }
    else { x = O.x + fx * 3.4 + rx * (i - 1.5) * 2; z = O.z + fz * 3.4 + rz * (i - 1.5) * 2; }
    p.o = cerca.length ? (Math.floor(i / cerca.length) ? (Math.floor(i / cerca.length) % 2 ? 0.55 : -0.55) : 0) : 0; const v = clampArena(new V3(x, 0, z), ARENA - 0.6); p.rot = Math.floor(rnd() * 4); p.x = v.x; p.z = v.z; p.ry = camYaw; p.t0 = 0.05 + i * 0.09; p.cayo = false; p.pega = false; p.e = e;
    const imp = p.rot % 2 === 1, alto = (imp ? p.G.w : p.G.h) * TET_L / 2; p.yf = alto;
    p.gh.position.set(p.x, alto, p.z); p.gh.rotation.set(0, p.ry, p.rot * Math.PI / 2); p.gh.visible = true;
    p.m.rotation.set(0, p.ry, p.rot * Math.PI / 2); p.m.visible = false; R.ps.push(p); R.C.x += p.x / 4; R.C.z += p.z / 4; }
  if (!R.ps.length) return;
  if (R.ps.length < 4){ R.C.set(0, 0, 0); for (const p of R.ps){ R.C.x += p.x / R.ps.length; R.C.z += p.z / R.ps.length; } }
  tetMelodia(); barkOnce('foil_tet', 'Están cayendo piezas del cielo. Si encajan cuatro… no, Tovan, no desaparece el suelo. Creo.');
  const ultimo = 0.05 + (R.ps.length - 1) * 0.09 + 0.2;
  foilFx.push({ t: 0, cintas: [], upd(dt){
      const t = this.t;
      for (const p of R.ps){ if (!p.on) continue;
        if (!p.cayo){ const k = (t - p.t0) / 0.2;
          if (p.e && p.e.alive && k < 1){ const v = clampArena(tetV0.set(p.e.g.position.x + p.o * Math.cos(p.ry), 0, p.e.g.position.z - p.o * Math.sin(p.ry)), ARENA - 0.6); p.x = v.x; p.z = v.z; p.gh.position.x = p.x; p.gh.position.z = p.z; }   // sigue a su blanco hasta el último momento
          if (k < 0) continue; p.m.visible = true;
          if (k < 1){ p.m.position.set(p.x, lerp(TET.alto, p.yf, k * k), p.z); if (rnd() < 0.6) spawnFx(p.x + (rnd() - 0.5) * 1.2, p.m.position.y + 1, p.z, 0, 4, 0, p.col, 0.06, 0.25, 0, 0); }
          else { p.cayo = true; p.m.position.set(p.x, p.yf, p.z); p.gh.visible = false; tetCae(p, R); } }
        else if (t > 2.3){ const k = (t - 2.3) / 0.28;   // la línea completada: parpadea en blanco y se deshace
          if (k >= 1){ for (let i = 0; i < 6; i++) spawnFx(p.x + (rnd() - 0.5) * 2, p.yf + (rnd() - 0.5), p.z + (rnd() - 0.5) * 2, (rnd() - 0.5) * 3, 2, (rnd() - 0.5) * 3, i % 2 ? 0xffffff : p.col, 0.08, 0.4, 4, 0); tetSuelta(p); continue; }
          const blanco = Math.floor(k * 8) % 2 === 0; p.mat.uniforms.uColor.value.setHex(blanco ? 0xffffff : p.col); p.mat.uniforms.uEmissive.value = blanco ? 1 : 0.5; p.m.scale.set(1, Math.max(0.02, 1 - Math.max(0, k - 0.5) * 2), 1); } }
      if (!R.decidido && t >= ultimo){ R.decidido = true; if (R.ps.length === 4 && R.ps.every(p => p.pega)) tetTetris(R); else if (R.ps.some(p => p.pega)) play('tetLinea'); }
      if (R.laser) tetLaserTick(R, t);
      if (t > 2.65){ return false; }
      return true; },
    fin(){ for (const p of R.ps) if (p.on) tetSuelta(p); if (R.laser){ tintaSuelta(R.laser); tintaSuelta(R.laser2); R.laser = null; } } });
}
const tetV0 = new V3();
function tetCae(p, R){
  const rx = Math.cos(p.ry), rz = -Math.sin(p.ry), imp = p.rot % 2 === 1, med = (imp ? p.G.h : p.G.w) * TET_L / 2, d = rdmg(32);
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
    const dx = e.g.position.x - p.x, dz = e.g.position.z - p.z, lx = dx * rx + dz * rz, lz = Math.abs(dx * Math.sin(p.ry) + dz * Math.cos(p.ry));
    if ((Math.abs(lx) < med + e.r + 0.15 && lz < TET_L * 0.5 + e.r + 0.35) || (e === p.e && Math.hypot(dx, dz) < e.r + 1)){ const l = Math.max(0.01, Math.hypot(dx, dz)); if (foilGolpea(e, d, dx / l, dz / l, 1.2, null, 1, R.ya)) p.pega = true; else if (R.ya.has(e)) p.pega = true; } }
  shake = Math.max(shake, 0.22); play('tetCae'); puffAt(p.x, p.z, 8, 2.2, 0xd8cfc0); ringFx(p.x, p.z, p.col, 0.3, med + 1.2, 0.3);
  for (let i = 0; i < 8; i++){ const a = rnd() * TAU; spawnFx(p.x + Math.cos(a) * med, 0.2, p.z + Math.sin(a) * med, Math.cos(a) * 3, 2 + rnd() * 2, Math.sin(a) * 3, p.col, 0.08, 0.45, 10, 0); }
}
function tetTetris(R){
  R.tetris = true; R.laserT = 0.08; R.laserHit = false; R.ya = new Set();
  foilRotulo('<b>' + [...'¡TETRIS!'].map((ch, i) => `<span class="tetB tetB${i % 7}">${ch}</span>`).join('') + '</b>', 'tetRot', 1.9);
  play('tetTetris'); flash('#ffffff', 0.35); shake = Math.max(shake, 0.4); hitStop = Math.max(hitStop, 0.06);
  R.laser = tintaCoge(TET_LASER, 0, 'tet'); R.laser2 = tintaCoge(RAYO_CIAN, 0, 'rayo'); R.laser.mat.blending = THREE.AdditiveBlending; R.laser.mat.uniforms.uAlpha.value = 0;
  R.t0 = null;
}
function tetLaserTick(R, t){
  if (R.t0 == null) R.t0 = t;
  const k = t - R.t0, rx = Math.cos(camYaw), rz = -Math.sin(camYaw), L = Math.min(ARENA + 3, 22), C = R.C;
  const P = (s, v) => v.set(C.x + rx * (s * 2 - 1) * L, 1.0, C.z + rz * (s * 2 - 1) * L);
  const ext = Math.min(1, k / 0.14), col = k > 0.55 ? Math.min(1, (k - 0.55) / 0.16) : 0;
  if (col >= 1){ tintaSuelta(R.laser); tintaSuelta(R.laser2); R.laser = null; return; }
  const ancho = 2.4 * (1 - col) * (1 + 0.08 * Math.sin(t * 60));
  tintaPinta(R.laser, P, 0.5 - ext / 2, 0.5 + ext / 2, q => ancho); tintaPinta(R.laser2, P, 0.5 - ext / 2, 0.5 + ext / 2, () => 0.5 * (1 - col));
  R.laser.mat.uniforms.uAlpha.value = 1; R.laser2.mat.uniforms.uAlpha.value = 1 - col;
  if (!R.laserHit && ext >= 1){ R.laserHit = true; play('tetLaser'); lightFlash(C.x, 1.2, C.z, 0xffffff, 3, 16); const d = rdmg(55), fx = -Math.sin(camYaw), fz = -Math.cos(camYaw);
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue; const dx = e.g.position.x - C.x, dz = e.g.position.z - C.z, perp = dx * fx + dz * fz, al = Math.abs(dx * rx + dz * rz);
      if (Math.abs(perp) < 1.3 + e.r && al < L){ foilGolpea(e, d, Math.sign(perp) * fx || fx, Math.sign(perp) * fz || fz, 5, null, 1, R.ya); sparks(e.g.position.x, 1, e.g.position.z, 10, 0xffffff, 5); } }
    for (let i = 0; i < 24; i++){ const s = rnd(); P(s, bahV0); spawnFx(bahV0.x, 1, bahV0.z, 0, (rnd() - 0.5) * 6, 0, [0x00f0f0, 0xf0f000, 0xa000f0, 0x00f000, 0xf00000, 0xf0a000, 0x2040ff][i % 7], 0.12, 0.5, 0, 0); } }
}
// Una frase de la melodía popular rusa (Korobeiniki, de dominio público) en 8 bits: cada lluvia toca la frase siguiente
const TET_FRASES = [
  [[76, 2], [71, 1], [72, 1], [74, 2], [72, 1], [71, 1], [69, 2], [69, 1], [72, 1], [76, 2], [74, 1], [72, 1]],
  [[71, 3], [72, 1], [74, 2], [76, 2], [72, 2], [69, 2], [69, 4]],
  [[74, 3], [77, 1], [81, 2], [79, 1], [77, 1], [76, 3], [72, 1], [76, 2], [74, 1], [72, 1]],
  [[71, 2], [71, 1], [72, 1], [74, 2], [76, 2], [72, 2], [69, 2], [69, 4]]];
const TET_BAJO = [[40, 45], [44, 45], [38, 36], [40, 45]];
const TET_CORCHEA = 0.12;
function tetMelodia(){ const ahora = performance.now() / 1000; if (ahora - TET.fraseT < TET_CORCHEA * 16 + 0.1) return; TET.fraseT = ahora; play('tetFrase' + TET.frase); TET.frase = (TET.frase + 1) % 4; }
const tetToca = i => () => { let at = 0; for (const [n, d] of TET_FRASES[i]){ tone({ type: 'square', f0: NOTE(n), dur: d * TET_CORCHEA * 0.92, vol: 0.06, when: at, rv: 0.08 }); at += d * TET_CORCHEA; }
  TET_BAJO[i].forEach((n, c) => { for (let k = 0; k < 8; k++) tone({ type: 'triangle', f0: NOTE(n + (k % 2 ? 12 : 0)), dur: TET_CORCHEA * 0.85, vol: 0.06, when: (c * 8 + k) * TET_CORCHEA, rv: 0 }); }); };
foilPoder({ id: 'foilTetris', ic: '🧩', name: 'Lluvia de tetriminós', tags: ['otaku'],
  desc: 'De un juego ruso. El remate del combo hace caer del cielo cuatro piezas de bloques sobre los enemigos más cercanos (o delante de ti), con daño donde caen; a los 2 s desaparecen como una línea completada. Si aciertan las cuatro: ¡TETRIS! y un láser de línea completada que barre toda la franja.',
  remate(f){ tetLluvia(f); },
  limpia(){ for (const p of TET.piezas) tetSuelta(p); }, reset(){ for (const p of TET.piezas) tetSuelta(p); TET.frase = 0; } });
Object.assign(SFX, {
  tetFrase0: tetToca(0), tetFrase1: tetToca(1), tetFrase2: tetToca(2), tetFrase3: tetToca(3),
  tetCae: () => { tone({ type: 'square', f0: 420, f1: 110, dur: 0.09, vol: 0.09 }); noise({ dur: 0.12, vol: 0.25, f0: 500, type: 'lowpass', q: 0.6 }); },
  tetLinea: () => [72, 76, 79, 84].forEach((n, i) => tone({ type: 'square', f0: NOTE(n), dur: 0.08, vol: 0.06, when: i * 0.05 })),
  tetTetris: () => { [72, 76, 79, 84, 88, 91, 96].forEach((n, i) => tone({ type: 'square', f0: NOTE(n), dur: 0.12, vol: 0.07, when: i * 0.045, rv: 0.3 })); tone({ type: 'triangle', f0: NOTE(48), dur: 0.8, vol: 0.15, rv: 0.4 }); },
  tetLaser: () => { noise({ dur: 0.5, vol: 0.25, f0: 1200, f1: 7000, q: 1.5, rv: 0.4 }); tone({ type: 'square', f0: 220, f1: 1760, dur: 0.4, vol: 0.07, rv: 0.4 }); }
});

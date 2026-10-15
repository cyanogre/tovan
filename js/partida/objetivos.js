'use strict';
/* ======================================================================
   OBJETIVOS DE OLEADA (como las misiones de Hyrule Warriors)
   En la 2.ª y la 4.ª oleada de cada capítulo hay una misión con premio:
     · Paquete: vienen ladrones a por él; si uno lo saca del mapa, se pierde.
     · Puestos: tres puestos corruptos sueltan enemigos hasta que los rompes.
     · Botín: un capitán lleva el botín y huye si no lo tumbas a tiempo.
     · Sello: purifica la zona quedándote dentro; hasta entonces llegan refuerzos
       y la oleada no se cierra.
   En la 3.ª oleada, desde el capítulo 2, se presenta un capitán (js/enemigos/capitanes.js).
   ====================================================================== */
const OBJ = { cur: null, bolsa: [], n: 0, last: null, bonus: 0, bonusMax: 0, capT: -1 };
const OBJ_INFO = {
  paquete: { ic: '📦', tit: 'Protege el paquete', fallo: 'Paquete perdido: sin propina' },
  puestos: { ic: '🏯', tit: 'Destruye los puestos', fallo: '' },
  capitan: { ic: '💰', tit: 'Caza al capitán del botín', fallo: 'El capitán escapó con el botín' },
  sello:   { ic: '⛩️', tit: 'Purifica la zona', fallo: 'La zona se corrompió: sin premio' }
};
const OBJ_SR = 1.4, OBJ_CAP_T = 50, OBJ_SELLO_T = 70, OBJ_PUESTO_MAX = 6;   // radio y tiempo del sello · segundos antes de que huya el capitán · enemigos por puesto
const objPaqMat = makeMat(0xffffff, { map: texAsset('cinematica/paquete') }), objCintaMat = makeMat(0xe8c040), objMarcaMat = makeMat(0x7dff8a, { emissive: 1 });
const objAroMat = makeMat(0xffd23a, { emissive: 1 });
const objMorado = new THREE.Color(0xb04aff), objOro = new THREE.Color(0xffd23a), objRojo = new THREE.Color(0xff3a2a), _objC = new THREE.Color();
const objPuesto = n => (n - 1) % 5 + 1;   // lugar de la oleada en su capítulo (1-5; la 5.ª es la del jefe)
function objPuede(n){ return n > 1 && n < FINAL_WAVE && n % 5 !== 0 && !special && !chActive && !RF8.on && !isCorruptW8(n); }
function objSiguiente(n){   // el primero siempre es el paquete; luego, una bolsa barajada sin repetir seguido
  if (!OBJ.n++) return OBJ.last = 'paquete';
  for (let k = 0; k < 8; k++){
    if (!OBJ.bolsa.length){ OBJ.bolsa = ['paquete', 'puestos', 'capitan', 'sello']; for (let i = 3; i > 0; i--){ const j = rnd() * (i + 1) | 0; [OBJ.bolsa[i], OBJ.bolsa[j]] = [OBJ.bolsa[j], OBJ.bolsa[i]]; } }
    const t = OBJ.bolsa.shift();
    if (t === OBJ.last || (t === 'capitan' && n < 7)){ OBJ.bolsa.push(t); continue; }   // el capitán del botín, desde el capítulo 2
    return OBJ.last = t;
  }
  return OBJ.last = 'puestos';
}
function objSitio(r0, r1, dHero){
  const v = new V3();
  for (let i = 0; i < 24; i++){ const a = rnd() * TAU, r = r0 + rnd() * (r1 - r0); v.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    if (braz.visible && Math.hypot(v.x - BRAZ.x, v.z - BRAZ.z) < 1.8) continue;
    if (Math.hypot(v.x - hero.position.x, v.z - hero.position.z) < dHero) continue;
    break; }
  return v;
}
function objMinion(){   // refuerzos: diablillos y, a veces, un enemigo del escenario
  const ex = BIOME_EX[BIOMES[curBiome].id];
  if (!ex || rnd() < 0.65) return 'imp';
  const tot = ex.reduce((s, p) => s + p[2], 0); let r = rnd() * tot; for (const p of ex){ r -= p[2]; if (r <= 0) return p[0]; } return ex[0][0];
}
const objCuenta = t => queue.filter(q => q === t).length + enemies.filter(e => e.alive && e.type === t).length;

/* ---------- Ladrón: va a por el paquete y huye con él hacia el borde ---------- */
function makeLadron(){
  const e = MAKERS.imp(); e.type = 'ladron'; e.hp = 70; e.speed = 3.1; e.upd = updLadron;
  const mask = makeMat(0x101018), sack = makeMat(0x9a6a3a), knot = makeMat(0xd8c08a);
  mesh(B(0.5, 0.1, 0.5), mask, 0, 0.1, 0, e.body);                             // antifaz de ladrón (los ojos asoman por delante)
  mesh(new THREE.IcosahedronGeometry(0.2, 1), sack, 0, 0.05, -0.34, e.body); mesh(new THREE.IcosahedronGeometry(0.06, 0), knot, 0, 0.24, -0.34, e.body);
  e.mats.push({ m: mask, c: 0x101018, base: 0x101018, em: 0 }, { m: sack, c: 0x9a6a3a, base: 0x9a6a3a, em: 0 }, { m: knot, c: 0xd8c08a, base: 0xd8c08a, em: 0 });
  return e;
}
function updLadron(e, dt, dist, toP, face, move){
  const o = OBJ.cur, pk = o && o.tipo === 'paquete' ? o.pk : null, Bd = e.body;
  if (!pk || pk.lost || (pk.carrier && pk.carrier !== e)){   // sin paquete que robar, pelea como un diablillo
    if (!/^(hurt|chase|windup|lunge|recover)$/.test(e.state)) e.state = 'chase';
    return updImp(e, dt, dist, toP, face, move); }
  if (e.state === 'hurt'){ Bd.rotation.x = -0.35; if (e.t <= 0) e.state = 'chase'; return; }
  if (pk.carrier === e){
    const x = e.g.position.x, z = e.g.position.z, r = Math.hypot(x, z);
    if (e.fleeA == null) e.fleeA = r > 0.5 ? Math.atan2(x, z) : Math.atan2(x - hero.position.x, z - hero.position.z);
    face(e.fleeA, 10); move(e.fleeA, 1.7); Bd.rotation.x = 0.3; Bd.position.y = 0.52 + Math.abs(Math.sin(time * 12 + e.seed)) * 0.1;
    if (r > ARENA - 0.45) objPaquetePerdido(e);
    return;
  }
  const px = pk.g.position.x, pz = pk.g.position.z, d = Math.hypot(px - e.g.position.x, pz - e.g.position.z), a = Math.atan2(px - e.g.position.x, pz - e.g.position.z);
  face(a, 10);
  if (e.state === 'grab'){ Bd.rotation.x = 0.7; Bd.position.y = 0.42;
    if (d > 0.9){ e.state = 'chase'; return; }
    if (e.t <= 0){ pk.carrier = e; e.fleeA = null; e.state = 'chase'; play('objGrab'); starShout(e, '¡Mío!');
      barkOnce('obj_robo', '¡Se lleva el paquete! Párale los pies antes de que llegue al borde.'); }
    return; }
  e.state = 'chase'; Bd.rotation.x = 0.15;
  if (d > 0.6){ move(a, e.speed); Bd.position.y = 0.52 + Math.abs(Math.sin(time * 9 + e.seed)) * 0.12; } else { e.state = 'grab'; e.t = 0.7; }
}
function objPaquetePerdido(e){
  const o = OBJ.cur, pk = o.pk, x = e.g.position.x, z = e.g.position.z;
  pk.lost = true; pk.carrier = null; pk.g.visible = false;
  e.alive = false; e.dying = 0.4;   // se escapa: no cuenta como baja
  puffAt(x, z, 14, 2); ringFx(x, z, 0xb8a898, 0.3, 2, 0.4); play('objFail');
  banner('¡Paquete perdido!<small>El ladrón se ha escapado con él</small>', 1.8);
  bark('Se lo ha llevado… Pondremos «no había nadie en casa».');
}

/* ---------- Puesto corrupto: suelta un enemigo cada pocos segundos hasta que lo rompes ---------- */
function makePuesto(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0x6a5a7a], [0x2a1a30], [0xd04aff, 1], [0xf0e6c8]]);
  const body = new THREE.Group(); g.add(body);
  mesh(B(0.8, 0.26, 0.8), S[1].m, 0, 0.13, 0, body); mesh(C(0.2, 0.28, 1.1, 6), S[0].m, 0, 0.8, 0, body); mesh(B(0.62, 0.12, 0.62), S[1].m, 0, 1.38, 0, body);
  const crys = mesh(new THREE.OctahedronGeometry(0.24, 0), S[2].m, 0, 1.75, 0, body); crys.scale.y = 1.5;
  const ring = mesh(new THREE.TorusGeometry(0.42, 0.03, 4, 14), S[2].m, 0, 1.75, 0, body); ring.rotation.x = Math.PI / 2;
  mesh(new THREE.ConeGeometry(0.55, 0.36, 4), S[1].m, 0, 2.2, 0, body).rotation.y = Math.PI / 4;
  for (const s of [-1, 1]){ const p = mesh(B(0.13, 0.32, 0.01), S[3].m, 0.21 * s, 0.85, 0.27, body); p.rotation.z = 0.25 * s; }   // ofudas rotos
  const tele = mesh(circleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.4 }), 0, 0.05, 0); tele.visible = false;
  return newEnemy('puesto', g, body, S, { hp: 160, r: 0.55, speed: 0, numY: 2.4, heavy: true, crys, ring, tele, sp: 3 + rnd() * 2, hechos: 0, upd: updPuesto });
}
function updPuesto(e, dt){
  if (e.px == null){ e.px = e.g.position.x; e.pz = e.g.position.z; const a = Math.atan2(-e.px, -e.pz); e.sx = e.px + Math.sin(a) * 1.3; e.sz = e.pz + Math.cos(a) * 1.3; }
  e.g.position.set(e.px, 0, e.pz); e.vx = e.vz = 0;   // no se mueve ni a empujones
  e.crys.rotation.y += dt * 2; e.ring.rotation.z += dt * 1.4; e.crys.position.y = 1.75 + Math.sin(time * 3 + e.seed) * 0.08;
  e.tele.visible = false; if (e.hechos >= OBJ_PUESTO_MAX) return;   // agotado: ya no suelta más
  e.sp -= dt;
  if (e.sp < 0.9){ e.tele.visible = true; e.tele.position.set(e.sx, 0.05, e.sz); e.tele.scale.setScalar(0.8); e.tele.material.uniforms.uOpacity.value = 0.3 + 0.3 * Math.abs(Math.sin(time * 12)); }
  if (e.sp > 0) return;
  e.sp = 7 + rnd() * 2;
  if (player.dead || enemies.filter(o => o.alive).length >= maxAlive() + 2) return;
  spawnEnemy(objMinion(), [e.sx, e.sz]); waveTotal++; e.hechos++;
  if (e.hechos >= OBJ_PUESTO_MAX) e.mats[2].c = e.mats[2].base = 0x4a3a5a;   // el cristal se apaga
  ringFx(e.sx, e.sz, 0xd04aff, 0.2, 1.4, 0.4); lightFlash(e.px, 1.8, e.pz, 0xd04aff, 1.4, 5);
}
Object.assign(MAKERS, { ladron: makeLadron, puesto: makePuesto });

/* ---------- Los cuatro objetivos ---------- */
const OBJ_DEF = {
  paquete: {
    empieza(o){
      const v = objSitio(0.6, 1.6, 1.3), g = new THREE.Group(); g.position.copy(v); scene.add(g); o.objs.push(g);
      mesh(B(0.56, 0.42, 0.56), objPaqMat, 0, 0.21, 0, g);
      for (const r of [0, Math.PI / 2]) mesh(B(0.58, 0.44, 0.1), objCintaMat, 0, 0.21, 0, g).rotation.y = r;
      const mark = mesh(new THREE.OctahedronGeometry(0.13, 0), objMarcaMat, 0, 1.2, 0, g); mark.scale.y = 1.6;
      const ring = mesh(new THREE.TorusGeometry(0.5, 0.03, 3, 20), objAroMat, 0, 0.04, 0, g); ring.rotation.x = Math.PI / 2;
      o.pk = { g, mark, ring, carrier: null, lost: false };
      const n = Math.min(4, 2 + Math.floor(wave / 6));   // los ladrones se reparten por la oleada
      for (let k = 0; k < n; k++){ const i = Math.floor((k + 0.3) / n * queue.length);
        if (i < queue.length && queue[i] !== 'ladron') queue[i] = 'ladron'; else { queue.splice(i, 0, 'ladron'); waveTotal++; } }
      later(1.2, () => barkOnce('obj_paquete', '¡Un paquete! Vienen ladrones a por él: si uno lo saca del mapa, adiós propina. Y somos repartidores, ¿eh?'));
    },
    tick(o, edt){
      const pk = o.pk; if (pk.lost) return;
      pk.mark.position.y = 1.2 + Math.sin(time * 4) * 0.12; pk.mark.rotation.y += edt * 3;
      const e = pk.carrier;
      if (e){ pk.g.position.set(e.g.position.x, e.numY * 0.8, e.g.position.z); pk.g.rotation.y = e.g.rotation.y; pk.ring.visible = false; }
      else { pk.g.position.y = 0; pk.ring.visible = true; }
    },
    alerta: o => !!o.pk.carrier,
    linea: o => o.pk.lost ? 'Se lo llevó un ladrón' : o.pk.carrier ? '¡Un ladrón se lo lleva! Párale los pies' : `A salvo · ladrones: ${objCuenta('ladron')}`,
    premio(o){ if (o.pk.lost) return null; castleBonus += 12; heal(Math.round(player.maxHp * 0.15)); return 'Paquete a salvo · +12 ✦ de propina y algo de vida'; }
  },
  puestos: {
    empieza(o){
      const a0 = rnd() * TAU; o.left = o.total = 3;
      for (let k = 0; k < 3; k++){ let a = a0 + k * TAU / 3, x = 0, z = 0;
        for (let i = 0; i < 6; i++){ x = Math.sin(a) * (ARENA - 1.1); z = Math.cos(a) * (ARENA - 1.1); if (!braz.visible || Math.hypot(x - BRAZ.x, z - BRAZ.z) > 1.8) break; a += 0.35; }
        spawnEnemy('puesto', [x, z]); waveTotal++; }
      later(1.2, () => barkOnce('obj_puestos', 'Esos puestos corruptos no paran de soltar bichos. Rómpelos y se acaba el grifo.'));
    },
    tick(){},
    prog: o => (o.total - o.left) / o.total,
    linea: o => `Rotos: ${o.total - o.left} de ${o.total}` + (o.left ? ' · siguen saliendo enemigos' : ''),
    premio(o){ if (o.left) return null; castleBonus += 6; return 'Puestos destruidos · +6 ✦ (más 4 ✦ por cada uno)'; }
  },
  capitan: {
    empieza(o){ o.spawnT = 3.5; o.time = OBJ_CAP_T; o.e = null; },
    tick(o, edt){
      if (!o.e){ o.spawnT -= edt; if (o.spawnT > 0) return;
        const e = spawnCaptain(); if (!e){ o.spawnT = 2; return; }
        o.e = e; objCofre(e);
        e.cap.onDie = () => { o.ok = true; o.cofre.visible = false; const x = e.g.position.x, z = e.g.position.z;
          for (let i = 0; i < 20; i++){ const a = rnd() * TAU; spawnFx(x, 1.5, z, Math.cos(a) * 3, 3 + rnd() * 3, Math.sin(a) * 3, 0xffd23a, 0.1, 0.9, 9, 0); }
          banner(`¡Botín conseguido!<small>${e.cap.name} derrotado · carta extra al acabar la oleada</small>`, 2); play('objOk'); };
        e.cap.onEscape = () => { o.ok = false; banner('¡Se ha escapado con el botín!', 1.8); play('objFail'); };
        return; }
      const e = o.e, c = e.cap;
      if (o.cofre){ o.cofre.position.y = o.cofreY + Math.sin(time * 3) * 0.08; o.cofre.rotation.y += edt * 1.5; }
      if (!e.alive || c.flee) return;
      if (e.spawnT <= 0) o.time -= edt;
      c.info = '💰 Lleva el botín';
      if (o.time <= 12) barkOnce('obj_capfuga', '¡Se le acaba la paciencia! Como no lo tumbes ya, se larga con el botín.');
      if (o.time <= 0){ capHuir(e); c.info = '💰 ¡Huye!'; banner('¡El capitán huye con el botín!<small>Alcánzalo antes de que salga del mapa</small>', 1.6); }
    },
    alerta: o => !!(o.e && o.e.alive && (o.e.cap.flee || o.time <= 12)),
    prog: o => o.e ? Math.max(0, o.time / OBJ_CAP_T) : 1,
    linea: o => !o.e ? 'Se acerca un capitán con el botín…' : o.ok === true ? 'Botín conseguido' : o.ok === false ? 'Se escapó con el botín'
      : o.e.cap.flee ? '¡Huye! Alcánzalo antes del borde' : `Túmbalo antes de ${Math.max(0, Math.ceil(o.time))} s`,
    premio(o){ if (!o.ok) return null; OBJ.bonus = OBJ.bonusMax = 1; castleBonus += 10; return 'Botín del capitán · carta extra y +10 ✦'; }
  },
  sello: {
    empieza(o){
      const v = objSitio(2.0, 3.2, 2.2), g = new THREE.Group(); g.position.copy(v); scene.add(g); o.objs.push(g);
      o.x = v.x; o.z = v.z; o.p = 0; o.rfT = 6; o.ok = false; o.lim = OBJ_SELLO_T; o.roto = false;
      o.aro = mesh(capRingGeo, makeMat(0xb04aff, { emissive: 1 }), 0, 0.05, 0, g); o.aro.scale.setScalar(OBJ_SR);
      o.disco = mesh(circleGeo, makeMat(0xb04aff, { emissive: 1, opacity: 0.16 }), 0, 0.03, 0, g); o.disco.scale.setScalar(OBJ_SR);
      const pg = new THREE.CylinderGeometry(1, 1, 1, 16, 1, true); pg.translate(0, 0.5, 0);
      o.pilar = mesh(pg, makeMat(0xffe08a, { emissive: 1, opacity: 0.22, side: THREE.DoubleSide }), 0, 0, 0, g); o.pilar.scale.set(0.55, 0.05, 0.55);
      mesh(new THREE.IcosahedronGeometry(0.32, 0), makeMat(0x5a5466), 0, 0.22, 0, g).scale.y = 0.75;   // la piedra del sello, con su shimenawa
      mesh(new THREE.TorusGeometry(0.3, 0.04, 4, 12), makeMat(0xe8dcc0), 0, 0.3, 0, g).rotation.x = Math.PI / 2;
      for (const s of [-1, 1]) mesh(B(0.07, 0.2, 0.01), makeMat(0xffffff), 0.2 * s, 0.18, 0.2, g);
      clearT = 0;   // con clearT a 0 la oleada no se da por superada hasta purificar la zona
      later(1.2, () => barkOnce('obj_sello', 'Esa zona está corrupta. Quédate dentro del círculo para purificarla; si hay enemigos dentro, no avanza. Hasta entonces seguirán llegando.'));
    },
    tick(o, edt){
      const dentro = Math.hypot(hero.position.x - o.x, hero.position.z - o.z) < OBJ_SR && hero.position.y < 1.5,
        disputa = enemies.some(e => e.alive && e.spawnT <= 0 && Math.hypot(e.g.position.x - o.x, e.g.position.z - o.z) < OBJ_SR + e.r * 0.5);
      o.dentro = dentro; o.disputa = disputa;
      if (!o.ok && !o.roto){
        o.lim -= edt;
        if (o.lim <= 0){ o.roto = true; clearT = -1; queue.length = 0; play('objFail'); banner('¡La zona se ha corrompido!<small>Ya no se puede purificar · acaba con los que quedan</small>', 1.8); return; }
        if (o.lim <= 15) barkOnce('obj_sellofin', '¡La zona se va a corromper del todo! Métete en el círculo y despéjalo, ¡ya!');
        if (clearT < 0) clearT = 0;
        if (dentro && !disputa && !player.dead) o.p = Math.min(1, o.p + edt / 9); else if (!dentro) o.p = Math.max(0, o.p - edt * 0.02);
        o.rfT -= edt;
        if (!queue.length && o.rfT <= 0 && enemies.filter(e => e.alive).length < 3){
          const k = Math.min(5, 2 + Math.floor(wave / 8)); for (let i = 0; i < k; i++) queue.push(objMinion());
          waveTotal += k; spawnTimer = Math.min(spawnTimer, 0.5); o.rfT = 5; play('glitch');
          banner('¡Refuerzos!<small>Purifica la zona para que dejen de llegar</small>', 1.1); }
        if (o.p >= 1) objPurifica(o);
      }
      const col = o.ok ? objOro : o.roto ? objRojo : disputa && Math.sin(time * 14) > 0 ? objRojo : _objC.copy(objMorado).lerp(objOro, o.p);
      o.aro.material.uniforms.uColor.value.copy(col); o.disco.material.uniforms.uColor.value.copy(col);
      o.disco.material.uniforms.uOpacity.value = (o.ok ? 0.1 : 0.12 + (dentro ? 0.1 : 0)) + 0.05 * Math.sin(time * 4);
      o.pilar.scale.y = lerp(o.pilar.scale.y, o.ok || o.roto ? 0.01 : 0.05 + o.p * 4.5, 1 - Math.exp(-edt * 6));
      if (!o.ok && !o.roto && dentro && !disputa && rnd() < edt * 14) spawnFx(o.x + (rnd() - 0.5) * 2, 0.1, o.z + (rnd() - 0.5) * 2, 0, 2.5, 0, 0xffe08a, 0.07, 0.8, -1, 0);
    },
    alerta: o => !o.ok && !o.roto && (o.disputa || o.lim <= 15),
    prog: o => o.p,
    linea: o => o.ok ? 'Zona purificada' : o.roto ? 'La zona se ha corrompido' : `${Math.floor(o.p * 100)} % · quedan ${Math.max(0, Math.ceil(o.lim))} s`
      + (o.disputa ? ' · ¡hay enemigos dentro!' : o.dentro ? '' : ' · entra en el círculo'),
    premio: o => o.ok ? 'Zona purificada · ÍMP al máximo y +10 ✦' : null
  }
};
function objPurifica(o){   // la luz del sello: corta los refuerzos, castiga a los que quedan y cierra la oleada al acabar con ellos
  o.ok = true; clearT = -1; queue.length = 0; player.meter = 100; castleBonus += 10;
  for (const e of enemies) if (e.alive && !e.cap && !e.isBoss && e.spawnT <= 0) hitEnemy(e, Math.max(1, Math.round(e.maxHp * 0.3)), false, 0, 0, 0, 0, false, { src: 'aoe' });
  shake = Math.max(shake, 0.4); flash('#fff3c0', 0.45); ringFx(o.x, o.z, 0xffd23a, 0.5, 9, 0.7); lightFlash(o.x, 2, o.z, 0xffe08a, 3, 12); play('objOk'); play('specialBoom');
  for (let i = 0; i < 30; i++){ const a = rnd() * TAU; spawnFx(o.x, 0.3, o.z, Math.cos(a) * 5, 2 + rnd() * 4, Math.sin(a) * 5, 0xffe08a, 0.1, 0.9, 6, 0); }
  banner('¡Zona purificada!<small>Dejan de llegar refuerzos · ÍMP al máximo</small>', 1.8);
}
function objCofre(e){   // el botín flota sobre la cabeza del capitán
  const o = OBJ.cur, g = new THREE.Group(), s = 1 / e.scale, wood = makeMat(0x7a4a22), gold = makeMat(0xffd23a, { emissive: 0.4 });
  mesh(B(0.5, 0.3, 0.34), wood, 0, 0, 0, g); mesh(B(0.52, 0.12, 0.36), wood, 0, 0.2, 0, g);
  for (const x of [-0.2, 0.2]) mesh(B(0.05, 0.44, 0.37), gold, x, 0.07, 0, g); mesh(B(0.1, 0.1, 0.04), gold, 0, 0.08, 0.18, g);
  o.cofreY = e.numY / e.scale + 0.45; g.position.y = o.cofreY; g.scale.setScalar(s * 1.1); e.g.add(g); o.cofre = g;
}

/* ---------- Ciclo: empezar, seguir, resolver y limpiar ---------- */
function objEmpieza(n){
  OBJ.capT = -1;
  if (!objPuede(n)) return;
  const pos = objPuesto(n);
  if (pos === 3 && n >= 8){ OBJ.capT = 7 + rnd() * 4; return; }   // se presenta un capitán a media oleada
  if (pos !== 2 && pos !== 4) return;
  const tipo = objSiguiente(n), o = OBJ.cur = { tipo, ok: null, fin: false, objs: [] }, I = OBJ_INFO[tipo];
  OBJ_DEF[tipo].empieza(o);
  banner(`Oleada ${n}<small>${I.ic} ${I.tit}</small>`, 2.4); play('objStart'); stat('objetivos');
}
function objResuelve(o){
  o.fin = true;
  const txt = OBJ_DEF[o.tipo].premio(o); o.ok = !!txt;
  if (txt){ banner(`¡Oleada superada!<small>✔ ${txt}</small>`, 1.7); play('objOk'); stat('objetivosOk'); }
  else if (OBJ_INFO[o.tipo].fallo) banner(`¡Oleada superada!<small>✘ ${OBJ_INFO[o.tipo].fallo}</small>`, 1.7);
}
function objFin(){
  const o = OBJ.cur; OBJ.cur = null; OBJ.capT = -1;
  if (o) for (const g of o.objs) scene.remove(g);
  objBox.hidden = true; objKey = ''; objColT = 0;
}
function objTick(dt, pdt, playing){
  if (playing){
    const edt = pdt * (slowT > 0 ? 0.3 : 1) * (timeStopT > 0 ? 0 : 1) * (invActive ? 0 : 1);
    if (OBJ.capT > 0 && clearT < 0){ OBJ.capT -= edt; if (OBJ.capT <= 0){ OBJ.capT = -1; spawnCaptain(); } }
    const o = OBJ.cur;
    if (o && !o.fin){ OBJ_DEF[o.tipo].tick(o, edt, pdt); if (clearT > 0) objResuelve(o); }
  }
  objHud();
}

/* ---------- Panel del objetivo (encima del panel del capitán) ---------- */
const objBox = document.createElement('div'); objBox.className = 'win'; objBox.id = 'objBox'; objBox.hidden = true; objCol.insertBefore(objBox, capBox);
objBox.innerHTML = '<div class="objtit"><span id="objIc"></span><span id="objTit"></span></div><div id="objLin"></div><span class="wprog"><i id="objProg"></i></span>';
const objIcEl = document.getElementById('objIc'), objTitEl = document.getElementById('objTit'), objLinEl = document.getElementById('objLin'), objProgEl = document.getElementById('objProg');
let objKey = '';
function objHud(){
  const o = OBJ.cur, show = !!o && !special && (gameState === 'play' || gameState === 'paused');
  if (objBox.hidden !== !show){ objBox.hidden = !show; objColT = 0; }
  if (!show){ objKey = ''; return; }
  const D = OBJ_DEF[o.tipo], I = OBJ_INFO[o.tipo], lin = o.fin ? (o.ok ? '✔ ¡Conseguido!' : '✘ Fallido') : D.linea(o), prog = D.prog ? D.prog(o) : null, alerta = !o.fin && D.alerta ? D.alerta(o) : false;
  const key = o.tipo + '|' + lin + '|' + (prog == null ? '' : Math.round(prog * 100)) + '|' + alerta;
  if (key === objKey) return; objKey = key;
  objIcEl.textContent = I.ic; objTitEl.textContent = I.tit; objLinEl.textContent = lin; objColT = 0;
  objProgEl.parentNode.hidden = prog == null; if (prog != null) objProgEl.style.width = Math.round(prog * 100) + '%';
  objBox.classList.toggle('alerta', alerta); objBox.classList.toggle('ok', o.fin && o.ok); objBox.classList.toggle('mal', o.fin && !o.ok);
}

/* ---------- Ganchos ---------- */
const _startWaveObj = startWave;
startWave = function(n){ objFin(); _startWaveObj(n); try { objEmpieza(wave); } catch (err) { console.error(err); } };
const _startSpecialWaveObj = startSpecialWave;
startSpecialWave = function(){ objFin(); _startSpecialWaveObj(); };
const _killEnemyObj = killEnemy;
killEnemy = function(e){
  const was = e.alive; _killEnemyObj(e);
  const o = OBJ.cur; if (!was || !o) return;
  const x = e.g.position.x, z = e.g.position.z;
  if (e.type === 'ladron' && o.pk && o.pk.carrier === e){   // al caer el ladrón, el paquete se queda donde estaba
    const v = clampArena(new V3(x, 0, z), ARENA - 1.2); o.pk.carrier = null; o.pk.g.position.set(v.x, 0, v.z); o.pk.g.rotation.y = 0;
    sparks(v.x, 0.5, v.z, 10, 0x7dff8a); play('pickup'); bark('¡Recuperado! Y sin una abolladura. Casi.'); }
  if (e.type === 'puesto' && o.tipo === 'puestos'){
    o.left--; castleBonus += 4; for (let i = 0; i < 2; i++) dropPickup(x + (rnd() - 0.5) * 1.2, z + (rnd() - 0.5) * 1.2);
    for (let i = 0; i < 18; i++){ const a = rnd() * TAU; spawnFx(x, 1.6, z, Math.cos(a) * 3, 2 + rnd() * 3, Math.sin(a) * 3, 0xd04aff, 0.1, 0.7, 9, 0); }
    lightFlash(x, 1.8, z, 0xd04aff, 2, 7); shake = Math.max(shake, 0.25);
    banner(o.left ? `Puesto destruido<small>Quedan ${o.left}</small>` : '¡Todos los puestos destruidos!<small>Ya no salen más enemigos</small>', 1.4);
  }
};
const _spawnAnimObj = spawnAnim;
spawnAnim = function(e, dt){   // los puestos salen del suelo
  if (e.type !== 'puesto') return _spawnAnimObj(e, dt);
  const k = smooth(clamp(1 - e.spawnT / 0.7, 0.01, 1)); e.g.scale.setScalar(e.scale); e.g.position.y = -2.6 * (1 - k);
  if (rnd() < 0.6) puffAt(e.g.position.x, e.g.position.z, 1, 1.2, 0x6a5a7a);
  if (e.spawnT - dt <= 0){ e.g.position.y = 0; shake = Math.max(shake, 0.15); play('land'); }
};
// el botín del capitán da una carta extra (como el premio del ERROR 404)
const _openUpgradesObj = openUpgrades;
openUpgrades = function(){
  _openUpgradesObj();
  if (OBJ.bonusMax && OBJ.bonus < OBJ.bonusMax){ const t = document.querySelector('#upScr .uptitle'); if (t) t.textContent = 'Botín del capitán · carta extra'; }
};
const _afterUpgradeObj = afterUpgrade;
afterUpgrade = function(){
  if (OBJ.bonus > 0 && gameState === 'play'){ OBJ.bonus--; openUpgrades(); return; }
  OBJ.bonusMax = 0; _afterUpgradeObj();
};
const _clearWorldObj = clearWorld;
clearWorld = function(){ _clearWorldObj(); objFin(); };
const _startRunObj = startRun;
startRun = function(){ Object.assign(OBJ, { cur: null, bolsa: [], n: 0, last: null, bonus: 0, bonusMax: 0, capT: -1 }); _startRunObj(); };
const _v3UpdateObj = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateObj(dt, pdt, playing); try { objTick(dt, pdt, playing); } catch (err) { console.error(err); } };

Object.assign(SFX, {
  objStart: () => { [0, 4, 7].forEach((s, i) => tone({ type: 'square', f0: NOTE(64 + s), dur: 0.12, vol: 0.06, when: i * 0.08, rv: 0.3 })); },
  objOk:    () => { [0, 4, 7, 12].forEach((s, i) => tone({ type: 'square', f0: NOTE(72 + s), dur: 0.14, vol: 0.07, when: i * 0.07, rv: 0.4 })); },
  objFail:  () => { [0, -3, -6].forEach((s, i) => tone({ type: 'triangle', f0: NOTE(60 + s), dur: 0.22, vol: 0.09, when: i * 0.14, rv: 0.4 })); },
  objGrab:  () => { tone({ type: 'square', f0: 700, f1: 1100, dur: 0.12, vol: 0.07, rv: 0.2 }); noise({ dur: 0.12, vol: 0.08, f0: 3000, q: 1.5, rv: 0.1 }); }
});

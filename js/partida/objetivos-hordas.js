'use strict';
/* ======================================================================
   OBJETIVOS 2: la horda del paquete y los puestos que se defienden
   (amplía js/partida/objetivos.js; el premio foil está en js/poderes/foil.js)
     · Paquete: llega una HORDA de ladrones en tres asaltos (decenas).
       Si ninguno se lo lleva, el remitente paga con una carta FOIL.
       Si se lo llevan, reclamación: −10 ✦ y se acaban los asaltos.
     · Puestos: son anclas de la corrupción. Mientras quede uno en pie,
       la oleada no se acaba y no paran de salir bichos. Cada puesto
       invoca defensores atados a él (se ven los hilos): mientras viva
       alguno, el puesto tiene escudo. Si te acercas o le pegas, llama a
       más. Al romperlo, sus defensores caen con él.
   Las dos retienen el final de la oleada con clearT = 0 (como el sello).
   ====================================================================== */
const HORDA_ASALTOS = [0.25, 0.35, 0.4], HORDA_MAX_VIVOS = 18;

/* ---------- Paquete: la horda ---------- */
const _mkLadronH = MAKERS.ladron;
MAKERS.ladron = function(){ const e = _mkLadronH(); const o = OBJ.cur; if (o && o.horda){ e.hp = 30; e.speed = 3.3; } return e; };
const _pkEmpieza = OBJ_DEF.paquete.empieza;
OBJ_DEF.paquete.empieza = function(o){
  _pkEmpieza(o);
  for (let i = queue.length - 1; i >= 0; i--) if (queue[i] === 'ladron'){ queue.splice(i, 1); waveTotal--; }   // los ladrones sueltos de antes, fuera
  const quita = Math.floor(queue.length * 0.6); queue.splice(queue.length - quita, quita); waveTotal -= quita;   // menos enemigos normales: la oleada es la horda
  const total = Math.min(36, Math.round(14 + wave * 1.2));
  o.horda = { total, salidos: 0, asalto: 0, t: 3.5 };
  waveTotal += total;
  pendingBark(1.2, 'obj_horda', '¡Viene una horda de ladrones a por el paquete! Si ninguno se lo lleva, el remitente paga con algo especial: una técnica legendaria, de las que brillan.');
};
function pendingBark(t, k, txt){ later(t, () => { if (gameState === 'play'){ barkT = 0; barkSaid[k] = false; barkOnce(k, txt); } }); }
function hordaAsalto(o){
  const H = o.horda, n = H.asalto < 2 ? Math.round(H.total * HORDA_ASALTOS[H.asalto]) : H.total - H.salidos;
  H.asalto++; H.t = 16;
  banner(`¡Asalto ${H.asalto} de 3!<small>${n} ladrones a por el paquete</small>`, 1.6); play('roar'); shake = Math.max(shake, 0.25);
  for (let i = 0; i < n; i++) later(0.15 + i * 0.09, () => {
    if (!OBJ.cur || OBJ.cur !== o || o.pk.lost || player.dead) return;
    if (enemies.filter(e => e.alive && e.type === 'ladron').length >= HORDA_MAX_VIVOS){ queue.push('ladron'); H.salidos++; return; }   // si hay demasiados, a la cola
    spawnEnemy('ladron'); H.salidos++; });
}
const _pkTick = OBJ_DEF.paquete.tick;
OBJ_DEF.paquete.tick = function(o, edt){
  _pkTick(o, edt);
  const H = o.horda; if (!H) return;
  if (o.pk.lost){ if (clearT === 0) clearT = -1; return; }   // perdido: se acaban los asaltos
  if (H.asalto < 3){
    if (clearT < 0) clearT = 0;   // la oleada no se cierra hasta el último asalto
    H.t -= edt;
    const vivos = enemies.filter(e => e.alive && e.type === 'ladron').length;
    if (H.t <= 0 || (H.asalto > 0 && vivos < 3 && H.t < 13)) hordaAsalto(o);
  } else if (clearT === 0) clearT = -1;
};
OBJ_DEF.paquete.prog = o => o.horda ? Math.min(1, (o.horda.salidos - objCuenta('ladron')) / o.horda.total) : null;
OBJ_DEF.paquete.linea = o => o.pk.lost ? 'Se lo llevó un ladrón' : o.pk.carrier ? '¡Un ladrón se lo lleva! Párale los pies'
  : o.horda ? (o.horda.asalto ? `Asalto ${o.horda.asalto}/3 · ladrones: ${objCuenta('ladron')}` : 'Se acerca una horda…') : `A salvo · ladrones: ${objCuenta('ladron')}`;
OBJ_DEF.paquete.premio = function(o){
  if (o.pk.lost){ castleBonus -= 10; banner('Reclamación del cliente<small>Paquete perdido · −10 ✦</small>', 1.8); return null; }
  castleBonus += 20; heal(Math.round(player.maxHp * 0.15)); FOIL.pend++;
  later(0.4, () => { barkT = 0; bark('¡Ni un rasguño en el paquete! El remitente te manda una carta… y brilla. Mucho.'); });
  return 'Paquete intacto · +20 ✦ y una carta FOIL';
};

/* ---------- Puestos: anclas que se defienden ---------- */
const puestoHiloMat = makeMat(0xd04aff, { emissive: 1 }), puestoEscMat = makeMat(0xd04aff, { emissive: 1, opacity: 0.22 });
const _mkPuestoH = MAKERS.puesto;
MAKERS.puesto = function(){
  const e = _mkPuestoH();
  e.hp = 220; e.def = []; e.alarma = 0; e.llamaCd = 2;
  e.hilos = [0, 1, 2, 3].map(() => { const m = mesh(B(0.05, 0.05, 1), puestoHiloMat, 0, -10, 0); m.visible = false; return m; });
  e.esc = mesh(new THREE.SphereGeometry(1.15, 14, 10), puestoEscMat, 0, 1.1, 0, e.g); e.esc.visible = false;
  e.parts = (e.parts || []).concat(e.hilos);
  e.upd = updPuestoH; return e;
};
const puestoDef = e => e.def.filter(d => d.alive);
function puestoInvoca(e, n, grito){
  for (let i = 0; i < n; i++){
    const a = Math.atan2(hero.position.x - e.px, hero.position.z - e.pz) + (i - (n - 1) / 2) * 0.9;
    let x = e.px + Math.sin(a) * 1.5, z = e.pz + Math.cos(a) * 1.5;
    if (MP.on && !mpLibre(x, z, 0.5)){ x = e.sx; z = e.sz; }
    const d = spawnEnemy(objMinion(), [x, z]); if (!d) continue; d.dueno = e; e.def.push(d); waveTotal++;
    ringFx(x, z, 0xd04aff, 0.2, 1.4, 0.4); bolt(e.px, 1.75, e.pz, x, 0.8, z, 0xd04aff, 0.06);
  }
  lightFlash(e.px, 1.8, e.pz, 0xd04aff, 1.6, 6); play('glitch');
  if (grito){ tA.set(e.px, 3, e.pz); spawnNumber(tA, '¡Defendedme!', 'react', '#e08aff'); }
}
function updPuestoH(e, dt){
  if (e.px == null){ e.px = e.g.position.x; e.pz = e.g.position.z; const a = Math.atan2(hero.position.x - e.px, hero.position.z - e.pz); e.sx = e.px + Math.sin(a) * 1.3; e.sz = e.pz + Math.cos(a) * 1.3; }
  e.g.position.set(e.px, 0, e.pz); e.vx = e.vz = 0;
  e.crys.rotation.y += dt * 2; e.ring.rotation.z += dt * 1.4; e.crys.position.y = 1.75 + Math.sin(time * 3 + e.seed) * 0.08;
  const def = puestoDef(e), vivos = enemies.filter(o => o.alive).length, cerca = Math.hypot(hero.position.x - e.px, hero.position.z - e.pz) < 5.5;
  // hilos hasta sus defensores y escudo mientras quede alguno
  e.hilos.forEach((m, i) => { const d = def[i]; m.visible = !!d;
    if (d){ _fV.set(e.px, 1.75, e.pz); _fW.set(d.g.position.x, 0.9 * d.scale, d.g.position.z); m.position.lerpVectors(_fV, _fW, 0.5); m.lookAt(_fW); m.scale.z = Math.max(0.1, _fV.distanceTo(_fW)); } });
  e.esc.visible = def.length > 0; if (e.esc.visible){ e.esc.rotation.y += dt; e.esc.scale.setScalar(1 + Math.sin(time * 4) * 0.04); }
  // invoca: poco a poco siempre; de golpe si te acercas o le pegas
  e.llamaCd -= dt; e.sp -= dt; e.alarma = Math.max(0, e.alarma - dt);
  e.tele.visible = e.sp < 0.9; if (e.tele.visible){ e.tele.position.set(e.sx, 0.05, e.sz); e.tele.scale.setScalar(0.8); e.tele.material.uniforms.uOpacity.value = 0.3 + 0.3 * Math.abs(Math.sin(time * 12)); }
  if (player.dead) return;
  if ((cerca || e.alarma > 0) && e.llamaCd <= 0 && def.length < 3 && vivos < maxAlive() + 4){ e.llamaCd = 6; puestoInvoca(e, Math.min(2, 3 - def.length), true); }
  else if (e.sp <= 0){ e.sp = 6 + rnd() * 2; if (vivos < maxAlive() + 2) puestoInvoca(e, def.length < 3 ? 1 : 0, false); }
}
const _hitEnemyPuesto = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee, o){
  if (e.type === 'puesto' && e.alive && e.spawnT <= 0){ e.alarma = 2;
    if (e.def && puestoDef(e).length){ val = Math.max(1, Math.round(val * 0.3)); if (time - (e.escT || 0) > 0.6){ e.escT = time; tA.set(e.px, 2.6, e.pz); spawnNumber(tA, 'Escudo', 'react', '#e08aff'); }
      barkOnce('puesto_escudo', 'Mientras tenga defensores atados, el puesto aguanta casi todo. Tumba a los que tienen hilo morado y luego a por él.'); } }
  return _hitEnemyPuesto(e, val, crit, nx, nz, knock, meterGain, melee, o);
};
const _killEnemyPuesto = killEnemy;
killEnemy = function(e){
  const was = e.alive; _killEnemyPuesto(e);
  if (!was) return;
  if (e.type === 'puesto' && e.def){ for (const h of e.hilos) h.visible = false; e.esc.visible = false;
    for (const d of puestoDef(e)){ burstDef(d); killEnemy(d); }
    barkOnce('puesto_cae', 'Sin su ancla, sus defensores se deshacen. Así se trabaja.'); }
  if (e.dueno && e.dueno.alive && puestoDef(e.dueno).length === 0){ tA.set(e.dueno.px, 2.6, e.dueno.pz); spawnNumber(tA, '¡Escudo roto!', 'react', '#ffd23a'); play('shatter'); }
};
function burstDef(d){ for (let i = 0; i < 8; i++){ const a = rnd() * TAU; spawnFx(d.g.position.x, 0.8, d.g.position.z, Math.cos(a) * 3, 2 + rnd() * 2, Math.sin(a) * 3, 0xd04aff, 0.08, 0.5, 8, 0); } }
const _ptEmpieza = OBJ_DEF.puestos.empieza;
OBJ_DEF.puestos.empieza = function(o){
  _ptEmpieza(o);
  pendingBark(1.4, 'obj_puestos2', 'Esos puestos son anclas de la corrupción: mientras quede uno en pie, la oleada no se acaba y no dejarán de salir bichos. Y se defienden: cuidado al acercarte.');
};
OBJ_DEF.puestos.tick = function(o){
  if (o.left > 0){ if (clearT < 0) clearT = 0; }   // mientras quede un puesto, la oleada sigue
  else if (clearT === 0) clearT = -1;
};
OBJ_DEF.puestos.alerta = o => o.left > 0 && enemies.some(e => e.alive && e.type === 'puesto' && e.def && puestoDef(e).length >= 3);
OBJ_DEF.puestos.linea = o => o.left ? `Quedan ${o.left} de ${o.total} · mientras quede uno, no se acaba` : 'Puestos destruidos';
OBJ_DEF.puestos.premio = function(o){ if (o.left) return null; castleBonus += 6; return 'Puestos destruidos · +6 ✦ (más 4 ✦ por cada uno)'; };
// el rótulo de la oleada también lo dice
const _objEmpiezaH = objEmpieza;
objEmpieza = function(n){
  _objEmpiezaH(n);
  const o = OBJ.cur; if (!o) return;
  if (o.tipo === 'puestos') banner(`Oleada ${n}<small>🏯 Destruye los puestos · mientras quede uno, no se acaba</small>`, 2.6);
  if (o.tipo === 'paquete') banner(`Oleada ${n}<small>📦 Protege el paquete de la horda · premio: carta FOIL</small>`, 2.6);
};

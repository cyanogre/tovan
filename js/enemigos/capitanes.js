'use strict';
/* ======================================================================
   CAPITANES: enemigos grandes con piezas que se rompen (al estilo Monster Hunter)
   Cada pieza solo se daña desde un lado: de frente, por la espalda o desde el aire
   (golpeando en pleno salto). Al romperse sale volando y el capitán cambia su forma
   de luchar. Los sacan los objetivos de oleada (js/partida/objetivos.js) con spawnCaptain().
   ====================================================================== */
const CAP_ZONA = { frente: 'de frente', espalda: 'por la espalda', aire: 'desde el aire' };
const CAP_DEF = {
  caponi: { name: 'Capitán Kanabō', r: 0.55, numY: 2.4, hp: 520, speed: 1.6,
    intro: 'Un capitán. Mira sus piezas: la maza se rompe de frente, los cuernos saltando y la calabaza de sake por la espalda. Cada pieza rota le cambia el estilo.',
    parts: [
      { id: 'maza', name: 'Kanabō', zone: 'frente', frac: 0.24, txt: '¡Sin maza! Ahora pelea a puñetazos y embestidas: más rápido, pero de más cerca.' },
      { id: 'cuernos', name: 'Cuernos', zone: 'aire', frac: 0.16, txt: 'Sin cuernos no hay grito de guerra: ya no puede llamar refuerzos.' },
      { id: 'calabaza', name: 'Calabaza', zone: 'espalda', frac: 0.18, txt: 'Adiós al sake: ya no se cura. Eso sí, se lo ha echado encima y anda haciendo eses.' }] },
  capgolem: { name: 'Capitán Muralla', r: 0.62, numY: 1.9, hp: 600, speed: 1.15,
    intro: 'Un capitán de piedra. El escudo le para los golpes de frente: rodéalo y dale al núcleo de la espalda, o salta a por el ojo de cristal.',
    parts: [
      { id: 'escudo', name: 'Escudo', zone: 'frente', frac: 0.26, guard: 0.5, txt: '¡Escudo roto! Ya no para golpes ni embiste. Ahora te tira los cascotes: mira al suelo.' },
      { id: 'nucleo', name: 'Núcleo', zone: 'espalda', frac: 0.2, txt: 'Sin núcleo no hay onda expansiva: ya no salta, solo pisotea.' },
      { id: 'ojo', name: 'Ojo de cristal', zone: 'aire', frac: 0.16, txt: 'Le has partido el ojo: se acabó el láser.' }] }
};
const CAP_LZ = 7.5;                                     // alcance del láser del Capitán Muralla
const capDebris = [], capFx = [];                       // piezas que salen volando · rocas en el aire
const _capC = new THREE.Color(), _capDmg = new THREE.Color(0x2a0c0c), _capV = new V3(), _capV2 = new V3();
const capRingMat = makeMat(0xff8a3a, { emissive: 1 }), capRockGeo = new THREE.IcosahedronGeometry(0.24, 0), capRockMat = makeMat(0x8a8494);
const capRingGeo = new THREE.RingGeometry(0.9, 1, 40); capRingGeo.rotateX(-Math.PI / 2);
const capPart = (e, id) => e.cap.parts.find(p => p.id === id);
const capHas = (e, id) => { const p = capPart(e, id); return !!p && !p.broken; };

/* ---------- Piezas: materiales propios (para oscurecerlas con el daño) ---------- */
function capMat(e, color, o = {}){
  const m = makeMat(color, o); if (m.uniforms && m.uniforms.uGlitch) m.uniforms.uGlitch = { value: 0 };   // se leen bien aunque el mundo esté corrupto
  const s = { m, c: color, base: color, em: o.emissive || 0 }; e.mats.push(s); return s;
}
function capPieza(e, id, node, mats, col){
  const p = capPart(e, id); p.node = node; p.mats = mats; p.col = col;
  node.userData.home = node.position.clone(); node.userData.homeR = node.rotation.clone();
}
function capBase(e, kind, sc){
  const d = CAP_DEF[kind];
  e.type = kind; e.scale = sc; e.r = d.r * sc; e.numY = d.numY * sc; e.hp = d.hp; e.speed = d.speed; e.heavy = true; e.spawnT = e.spawnT0 = 1.1;
  e.g.scale.setScalar(sc);
  const ring = mesh(new THREE.TorusGeometry(0.62, 0.035, 3, 18), capRingMat, 0, 0.05, 0, e.g); ring.rotation.x = Math.PI / 2;
  const tele = () => makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 });
  const c = e.cap = { kind, name: d.name, parts: d.parts.map(p => Object.assign({ hp: 1, max: 1, broken: false, fxT: 0 }, p)), init: false,
    cryCd: 7, drinkCd: 0, laserCd: 2.5, slamCd: 5, blockT: 0, drinkDmg: 0, healed: 0, info: '',
    tLine: mesh(teleGeo, tele(), 0, 0.04, 0), tRing: mesh(capRingGeo, tele(), 0, 0.05, 0), tCirc: mesh(circleGeo, tele(), 0, 0.05, 0), beam: null };
  c.tLine.visible = c.tRing.visible = c.tCirc.visible = false;
  e.parts = (e.parts || []).concat([c.tLine, c.tRing, c.tCirc]);
  const f0 = e.flair; e.flair = (q, dt) => { if (f0) f0(q, dt); capFlair(q, dt); };
  return c;
}

/* ---------- Capitán Kanabō (oni rojo con maza, cuernos de casco y calabaza de sake) ---------- */
function makeCapOni(){
  const e = MAKERS.oni(); e.red = true;
  e.mats[0].c = e.mats[0].base = 0xc83a3a; e.mats[6].c = e.mats[6].base = 0x7a1818;
  capBase(e, 'caponi', 1.55); e.upd = updCapOni;
  const R = e.arms[1], old = R.children.filter(o => o.isGroup).pop(); if (old) old.visible = false;   // su maza de siempre se cambia por la de capitán
  const iron = capMat(e, 0x3a3644), gold = capMat(e, 0xe0b048), spk = capMat(e, 0xf0e6c8);
  const club = new THREE.Group(); club.position.set(0, -0.52, 0.08); club.rotation.x = 1.45; R.add(club);
  mesh(C(0.05, 0.05, 0.45, 6), iron.m, 0, 0.1, 0, club); mesh(C(0.21, 0.1, 1.5, 7), iron.m, 0, 1.05, 0, club);
  for (const y of [0.55, 1.15, 1.72]){ const b = mesh(new THREE.TorusGeometry(0.115 + (y - 0.3) * 0.075, 0.03, 4, 10), gold.m, 0, y, 0, club); b.rotation.x = Math.PI / 2; }
  for (let i = 0; i < 15; i++){ const a = i * 2.4, y = 0.7 + (i % 5) * 0.21, r = 0.12 + (y - 0.3) * 0.074;
    const s = mesh(new THREE.ConeGeometry(0.035, 0.13, 4), spk.m, Math.cos(a) * r, y, Math.sin(a) * r, club); s.rotation.set(Math.sin(a) * 1.57, 0, -Math.cos(a) * 1.57); }
  capPieza(e, 'maza', club, [iron, gold, spk], 0x8a8494);
  const horn = capMat(e, 0xe8b84a, { emissive: 0.15 }), crest = capMat(e, 0xd8322a);
  const hg = new THREE.Group(); hg.position.set(0, 0.42, 0.14); e.head.add(hg);
  for (const s of [-1, 1]){ const h = mesh(new THREE.ConeGeometry(0.06, 0.5, 5), horn.m, 0.13 * s, 0.22, 0, hg); h.rotation.set(-0.2, 0, -0.55 * s); }
  mesh(C(0.09, 0.09, 0.03, 10), crest.m, 0, 0.06, 0.05, hg).rotation.x = Math.PI / 2;
  capPieza(e, 'cuernos', hg, [horn, crest], 0xe8b84a);
  const gourd = capMat(e, 0xd08a3a), cord = capMat(e, 0xd8322a);
  const gd = new THREE.Group(); gd.position.set(-0.3, 0.52, -0.26); e.body.add(gd);
  mesh(new THREE.IcosahedronGeometry(0.14, 1), gourd.m, 0, 0, 0, gd); mesh(new THREE.IcosahedronGeometry(0.1, 1), gourd.m, 0, 0.19, 0, gd);
  mesh(new THREE.TorusGeometry(0.07, 0.02, 4, 8), cord.m, 0, 0.1, 0, gd).rotation.x = Math.PI / 2; mesh(C(0.03, 0.035, 0.07, 6), cord.m, 0, 0.31, 0, gd);
  capPieza(e, 'calabaza', gd, [gourd, cord], 0xd08a3a);
  const cloth = capMat(e, 0xf4efe2), pole = capMat(e, 0x2a1a14), mark = capMat(e, 0xd8322a);   // sashimono: la bandera de capitán
  const fl = new THREE.Group(); fl.position.set(0.16, 0.5, -0.3); e.torso.add(fl);
  mesh(C(0.018, 0.018, 1.25, 5), pole.m, 0, 0.55, 0, fl); mesh(B(0.34, 0.6, 0.02), cloth.m, 0.18, 0.85, 0, fl);
  mesh(C(0.09, 0.09, 0.025, 10), mark.m, 0.18, 0.9, 0.012, fl).rotation.x = Math.PI / 2;
  return e;
}
/* ---------- Capitán Muralla (gólem de piedra con escudo, núcleo y ojo de cristal) ---------- */
function makeCapGolem(){
  const e = MAKERS.brute(); e.mats[0].c = e.mats[0].base = 0xb0b4c8;
  const c = capBase(e, 'capgolem', 1.45); e.upd = updCapGolem;
  const stone = capMat(e, 0x9a96a8), rim = capMat(e, 0x5a4a40), rune = capMat(e, 0x7ff5ff, { emissive: 1 });
  stone.m.uniforms.uMap.value = gStoneTex; stone.m.uniforms.uHasMap.value = 1;
  const sh = new THREE.Group(); sh.position.set(-0.05, 0.28, 0.56); sh.rotation.y = 0.1; e.torso.add(sh);
  mesh(B(0.92, 0.76, 0.15), stone.m, 0, 0, 0, sh); for (const y of [-0.38, 0.38]) mesh(B(1.0, 0.1, 0.19), rim.m, 0, y, 0, sh);
  mesh(B(0.26, 0.26, 0.04), rune.m, 0, 0.02, 0.09, sh).rotation.z = Math.PI / 4;
  capPieza(e, 'escudo', sh, [stone, rim, rune], 0x9a96a8);
  const cry = capMat(e, 0x7ff5ff, { emissive: 1 }), gold = capMat(e, 0xd9a441);
  const co = new THREE.Group(); co.position.set(0, 0.52, -0.44); e.torso.add(co);
  const c1 = mesh(new THREE.OctahedronGeometry(0.17, 0), cry.m, 0, 0, -0.04, co); c1.scale.y = 1.5;
  for (const s of [-1, 1]){ const c2 = mesh(new THREE.OctahedronGeometry(0.1, 0), cry.m, 0.17 * s, -0.05, 0, co); c2.scale.y = 1.6; c2.rotation.z = 0.5 * s; }
  mesh(new THREE.TorusGeometry(0.24, 0.04, 4, 10), gold.m, 0, 0, 0, co);
  capPieza(e, 'nucleo', co, [cry, gold], 0x7ff5ff);
  const eye = capMat(e, 0xff3a3a, { emissive: 1 }), mount = capMat(e, 0xd9a441);
  const ey = new THREE.Group(); ey.position.set(0, 0.95, 0.4); e.torso.add(ey);
  mesh(new THREE.OctahedronGeometry(0.11, 0), eye.m, 0, 0.05, 0, ey).scale.y = 1.6;
  mesh(new THREE.TorusGeometry(0.11, 0.03, 4, 8), mount.m, 0, 0, 0, ey).rotation.x = Math.PI / 2;
  capPieza(e, 'ojo', ey, [eye, mount], 0xff3a3a);
  const bg = new THREE.BoxGeometry(0.14, 0.14, 1); bg.translate(0, 0, 0.5);
  c.beam = mesh(bg, makeMat(0xff7060, { emissive: 1 })); c.beam.visible = false; e.parts.push(c.beam);
  return e;
}
Object.assign(MAKERS, { caponi: makeCapOni, capgolem: makeCapGolem });

/* ---------- Daño por zonas ---------- */
// Desde dónde llega un golpe: n = dirección atacante → capitán. Por delante, d < 0; por detrás, d > 0.
function capZona(e, nx, nz, melee){
  if (melee && hero.position.y > 0.45) return 'aire';
  if (!nx && !nz) return null;
  const a = e.g.rotation.y, d = nx * Math.sin(a) + nz * Math.cos(a);
  return d < -0.1 ? 'frente' : d > 0.35 ? 'espalda' : null;
}
function capInit(e){ e.cap.init = true; for (const p of e.cap.parts) p.max = p.hp = Math.max(1, Math.round(e.maxHp * p.frac)); }
function capFlair(e, dt){
  const c = e.cap; if (!c.init) capInit(e);
  c.blockT -= dt;
  for (const p of c.parts){ if (p.broken) continue; p.fxT -= dt; const k = 1 - p.hp / p.max;
    for (const s of p.mats){ _capC.setHex(s.base).lerp(_capDmg, k * 0.6); s.c = _capC.getHex(); } }
  if (e.type === 'caponi' && /^(sweepW|sweep|punch|tackleW|tackle|cry)$/.test(e.state)){ const fm = e.mats[7] && e.mats[7].m; if (fm && fm.uniforms && fm.uniforms.uMap) fm.uniforms.uMap.value = ONI_FACES.red.angry; }
  if (c.drunk && rnd() < dt * 2.5) spawnFx(e.g.position.x + (rnd() - 0.5) * 0.6, e.numY * 0.85, e.g.position.z + (rnd() - 0.5) * 0.6, 0, 0.8, 0, 0xffc8e8, 0.07, 0.7, -0.6, 0.5);
}
const _hitEnemyCap = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  const c = e && e.cap;
  if (!c || !e.alive || e.spawnT > 0) return _hitEnemyCap(e, val, crit, nx, nz, knock, meterGain, melee, o);
  if (!c.init) capInit(e);
  const src = o.src || (melee ? 'melee' : 'other'), zona = src === 'dot' ? null : capZona(e, nx, nz, melee);
  const p = zona && c.parts.find(q => q.zone === zona && !q.broken), guard = p && p.guard ? p.guard : 1;
  if (guard < 1 && c.blockT <= 0){ c.blockT = 0.5; tA.set(e.g.position.x, e.numY * 0.7, e.g.position.z); spawnNumber(tA, '¡Bloqueado!', 'react', '#cfd6ff'); play('clonk'); }
  const hp0 = e.hp, st = e.state, t = e.t;
  const r = _hitEnemyCap(e, guard < 1 ? Math.max(1, Math.round(val * guard)) : val, crit, nx, nz, knock, meterGain, melee, o);
  if (!r) return r;
  e.vx *= 0.5; e.vz *= 0.5;
  if (e.alive && e.state === 'hurt' && st !== 'hurt'){ e.state = st; e.t = t; }   // un golpe normal no los interrumpe
  const dealt = Math.max(0, hp0 - Math.max(0, e.hp));
  if (st === 'drink') c.drinkDmg += dealt;
  if (p && e.alive && dealt > 0){
    p.hp -= dealt / guard;
    if (p.fxT <= 0){ p.fxT = 0.12; p.node.getWorldPosition(_capV); sparks(_capV.x, _capV.y, _capV.z, 5, p.col, 4); }
    if (p.hp <= 0) capBreak(e, p);
  }
  return r;
};
function capBreak(e, p){
  const c = e.cap, n = p.node; p.broken = true; p.hp = 0;
  n.getWorldPosition(_capV); const x = _capV.x, y = _capV.y, z = _capV.z;
  scene.attach(n);                                                   // la pieza sale volando
  const a = Math.atan2(x - hero.position.x, z - hero.position.z);
  capDebris.push({ m: n, vx: Math.sin(a) * 2.6 + (rnd() - 0.5), vy: 5 + rnd() * 2, vz: Math.cos(a) * 2.6 + (rnd() - 0.5), sx: (rnd() - 0.5) * 12, sz: (rnd() - 0.5) * 12, t: 0, s0: n.scale.x });
  for (const s of p.mats) s.c = s.base;
  e.mats = e.mats.filter(s => !p.mats.includes(s));
  sparks(x, y, z, 18, p.col, 6); ringFx(e.g.position.x, e.g.position.z, 0xffd23a, 0.3, 2.6, 0.4); lightFlash(x, y, z, 0xffe0a0, 2.2, 7);
  for (let i = 0; i < 14; i++){ const b = rnd() * TAU; spawnFx(x, y, z, Math.cos(b) * 3, 2 + rnd() * 3, Math.sin(b) * 3, p.col, 0.09, 0.7, 9, 0); }
  shake = Math.max(shake, 0.35); hitStop = Math.max(hitStop, 0.12); flash('#fff3c0', 0.25); play('capBreak');
  tA.set(x, y + 0.6, z); spawnNumber(tA, `¡${p.name}: roto!`, 'react', '#ffd23a');
  e.state = 'broken'; e.t = p.id === 'cuernos' ? 2.4 : 1.5; e.vx = e.vz = 0; e.g.position.y = 0; e.noSep = false; e.body.rotation.y = 0;
  c.tLine.visible = c.tRing.visible = c.tCirc.visible = false; if (e.tele) e.tele.visible = false; if (c.beam) c.beam.visible = false;
  if (p.id === 'maza') e.speed *= 1.3;
  if (p.id === 'calabaza'){ c.drunk = true; for (let i = 0; i < 20; i++){ const b = rnd() * TAU; spawnFx(x, y, z, Math.cos(b) * 2.5, 1 + rnd() * 3, Math.sin(b) * 2.5, 0xbfe8ff, 0.07, 0.6, 9, 0); } }
  dropPickup(x, z); castleBonus += 3; stat('piezas');
  barkOnce('cap_' + p.id, p.txt);
  if (c.onBreak) c.onBreak(e, p);
}

/* ---------- Ayudas de los ataques ---------- */
function capLine(m, x, z, a, w, len, op){ m.visible = true; m.position.set(x, 0.045, z); m.rotation.y = a; m.scale.set(w, 1, len); m.material.uniforms.uOpacity.value = op != null ? op : 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); }
function capCirc(m, x, z, r){ m.visible = true; m.position.set(x, 0.05, z); m.scale.setScalar(r); m.material.uniforms.uOpacity.value = 0.3 + 0.3 * Math.abs(Math.sin(time * 12)); }
function capWave(x, z, max, dmg){   // onda expansiva: se esquiva saltando
  const m = mesh(new THREE.RingGeometry(0.93, 1, 40), makeMat(0xff8a3a, { emissive: 1, opacity: 0.9, side: THREE.DoubleSide }), x, 0.06, z); m.rotation.x = -Math.PI / 2;
  eRings.push({ m, r: 0.8, speed: 6.5, max, dmg, hit: false });
}
function capRock(e, tx, tz, dur){
  const x0 = e.g.position.x, z0 = e.g.position.z, y0 = 2.6, dm = e.dm;
  const m = mesh(capRockGeo, capRockMat, x0, y0, z0), t = mesh(circleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.45 }), tx, 0.05, tz);
  capFx.push({ objs: [m, t], mats: [t.material], t: 0, upd(dt){
    this.t += dt; const k = Math.min(1, this.t / dur);
    m.position.set(lerp(x0, tx, k), lerp(y0, 0.2, k) + Math.sin(k * Math.PI) * 3, lerp(z0, tz, k)); m.rotation.x += dt * 8; m.rotation.z += dt * 6;
    t.material.uniforms.uOpacity.value = 0.2 + 0.5 * k;
    if (k < 1) return true;
    puffAt(tx, tz, 8, 1.6); ringFx(tx, tz, 0xb8a898, 0.2, 1.3, 0.3); play('land');
    if (Math.hypot(hero.position.x - tx, hero.position.z - tz) < 1.05 && hero.position.y < 0.7) hurtPlayer(14 * dm, tx, tz, 5);
    return false; } });
}
function capFxKill(f){ for (const o of f.objs) scene.remove(o); for (const m of f.mats) m.dispose(); }
function capGourd(e, hand){   // la calabaza pasa de la cadera a la mano para beber, y vuelve
  const p = capPart(e, 'calabaza'); if (!p || p.broken) return; const n = p.node;
  if (hand){ e.arms[0].add(n); n.position.set(0, -0.66, 0.16); n.rotation.set(Math.PI, 0, 0); }
  else { e.body.add(n); n.position.copy(n.userData.home); n.rotation.copy(n.userData.homeR); }
}
function capCry(e){   // grito de guerra: los demás enemigos van más rápido y pegan más, y llegan dos diablillos
  const x = e.g.position.x, z = e.g.position.z;
  shake = Math.max(shake, 0.3); flash('#ff3a2a', 0.2); ringFx(x, z, 0xff3a2a, 0.5, 7, 0.6); lightFlash(x, 2, z, 0xff3a2a, 2, 9); starShout(e, '¡A MÍ, ONIS!');
  for (const o of enemies) if (o.alive && o !== e && !o.cap && !o.isBoss && o.speed && Math.hypot(o.g.position.x - x, o.g.position.z - z) < 8){
    if (!o.cryOn){ o.cryOn = true; o.speed *= 1.35; o.dm *= 1.2; } o.cryT = 6; }
  if (enemies.filter(o => o.alive).length < 9) for (const s of [-1, 1]){ const a = e.g.rotation.y + 1.3 * s;
    const v = clampArena(new V3(x + Math.sin(a) * 1.8, 0, z + Math.cos(a) * 1.8)); spawnEnemy('imp', [v.x, v.z]); waveTotal++; }
  barkOnce('cap_cry', '¡Ha llamado a los suyos y los ha puesto a tope! Rómpele los cuernos y se le acaba el grito.');
}
// Huida (objetivo del botín): corre hacia el borde y, si llega, se escapa
function capFlee(e, face, move, walk){
  const c = e.cap; if (!c.flee) return false;
  const x = e.g.position.x, z = e.g.position.z, r = Math.hypot(x, z), a = r > 0.3 ? Math.atan2(x, z) : Math.atan2(x - hero.position.x, z - hero.position.z);
  face(a, 8); move(a, e.speed * 1.6); walk(11); e.torso.rotation.x = 0.3; e.g.position.y = 0;
  if (r > ARENA - 0.6) capEscape(e);
  return true;
}
function capHuir(e){   // deja lo que esté haciendo y sale corriendo
  const c = e.cap; c.flee = true; e.state = 'chase'; e.noSep = false; e.g.position.y = 0; e.body.rotation.y = 0; e.vx = e.vz = 0;
  if (e.tele) e.tele.visible = false; c.tLine.visible = c.tRing.visible = c.tCirc.visible = false; if (c.beam) c.beam.visible = false;
  if (e.type === 'caponi') capGourd(e, false);
}
function capEscape(e){
  const c = e.cap, x = e.g.position.x, z = e.g.position.z; e.alive = false; e.dying = 0.4; c.escaped = true;
  hideTeles(e); if (c.beam) c.beam.visible = false;
  puffAt(x, z, 16, 2.4); ringFx(x, z, 0xb8a898, 0.3, 2.2, 0.4); play('dash');
  if (c.onEscape) c.onEscape(e);
}

/* ---------- IA del Capitán Kanabō ---------- */
function updCapOni(e, dt, dist, toP, face, move){
  const c = e.cap, R = e.arms[1], L = e.arms[0], maza = capHas(e, 'maza');
  const to = (o, v, k = 10) => { o.rotation.x = lerp(o.rotation.x, v, 1 - Math.exp(-dt * k)); };
  const walk = sp => { const a = sp ? Math.sin(time * sp) * 0.5 : 0; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; };
  e.tele.visible = c.tLine.visible = c.tRing.visible = false; c.cryCd -= dt; c.drinkCd -= dt;
  if (e.state === 'broken'){ walk(0); e.torso.rotation.x = -0.45 + Math.sin(time * 16) * 0.08; to(R, 0.4); to(L, 0.4); e.body.position.x = Math.sin(time * 28) * 0.03;
    if (e.t <= 0){ e.body.position.x = 0; e.state = 'recover'; e.t = 0.4; } return; }
  if (capFlee(e, face, move, walk)) return;
  if (e.state === 'chase' || e.state === 'hurt'){
    e.state = 'chase'; face(toP + (c.drunk ? Math.sin(time * 2.1 + e.seed) * 0.55 : 0), 6); e.torso.rotation.x = 0.1;
    to(R, maza ? -0.35 + Math.sin(time * 5) * 0.1 : -0.15); to(L, Math.sin(time * 5) * 0.25);
    if (!player.dead && dist > (maza ? 2.0 : 1.2)){ move(e.g.rotation.y, e.speed); walk(7); } else walk(0);
    if (c.drunk && rnd() < dt * 0.12){ e.state = 'broken'; e.t = 0.7; starShout(e, '¡Hip!'); return; }
    if (player.dead || e.cd > 0) return;
    if (capHas(e, 'calabaza') && e.hp < e.maxHp * 0.55 && c.drinkCd <= 0){ e.state = 'retreat'; e.t = 1.1; return; }
    if (capHas(e, 'cuernos') && c.cryCd <= 0){ e.state = 'cry'; e.t = 1.2; c.cried = false; play('capCry'); return; }
    if (maza){ if (dist < 1.9){ e.state = 'sweepW'; e.t = 0.8; } else if (dist < 3.4){ e.state = 'windup'; e.t = 0.85; e.hitOnce = false; play('oniRoar'); } }
    else if (dist < 1.7){ e.state = 'punch'; e.t = 0.32; c.punchN = 3; e.hitOnce = false; play('swing'); }
    else if (dist < 6.5){ e.state = 'tackleW'; e.t = 0.65; e.dir = toP; play('bruteWarn'); }
  } else if (e.state === 'windup'){   // mazazo con onda expansiva
    if (e.t > 0.35) face(toP, 8);
    const a = e.g.rotation.y, reach = 1.35 * e.scale;
    e.ix = e.g.position.x + Math.sin(a) * reach; e.iz = e.g.position.z + Math.cos(a) * reach;
    e.tele.visible = true; e.tele.position.set(e.ix, 0.05, e.iz); e.tele.scale.setScalar(1.7); e.tele.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12));
    to(R, -3.0, 8); to(L, -0.6, 8); e.torso.rotation.x = -0.25; walk(0);
    if (e.t <= 0){ e.state = 'smash'; e.t = 0.18; }
  } else if (e.state === 'smash'){
    to(R, -0.5, 30); e.torso.rotation.x = 0.35;
    if (!e.hitOnce && e.t <= 0.1){ e.hitOnce = true;
      ringFx(e.ix, e.iz, 0xffa060, 0.2, 2.0, 0.3); puffAt(e.ix, e.iz, 10, 2.2); shake = Math.max(shake, 0.25); play('slam');
      if (Math.hypot(hero.position.x - e.ix, hero.position.z - e.iz) < 1.9 && hero.position.y < 0.8) hurtPlayer(22 * e.dm, e.ix, e.iz, 8);
      capWave(e.ix, e.iz, 4.4, 14 * e.dm); }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.9; }
  } else if (e.state === 'sweepW'){   // barrido de 360°: se esquiva saltando o alejándose
    face(toP, 6); to(R, -1.5, 8); e.torso.rotation.x = -0.1; walk(0); e.body.rotation.y = lerp(e.body.rotation.y, 0.9, 1 - Math.exp(-dt * 8));
    capCirc(c.tRing, e.g.position.x, e.g.position.z, 2.6);
    if (e.t <= 0){ e.state = 'sweep'; e.t = 0.42; e.hitOnce = false; play('swingBig'); }
  } else if (e.state === 'sweep'){
    e.body.rotation.y += dt * TAU / 0.42; to(R, -1.5, 20);
    if (!e.hitOnce && dist < 2.6 && hero.position.y < 0.7){ const r = hurtPlayer(18 * e.dm, e.g.position.x, e.g.position.z, 9); if (r !== 'dodge') e.hitOnce = true; }
    if (rnd() < 0.5) puffAt(e.g.position.x, e.g.position.z, 1, 1.8);
    if (e.t <= 0){ e.body.rotation.y = 0; e.state = 'recover'; e.t = 0.8; }
  } else if (e.state === 'punch'){   // sin maza: tres puñetazos rápidos
    const arm = c.punchN % 2 ? R : L, k = 1 - e.t / 0.32; to(arm, k < 0.5 ? -1.7 : -0.6, 25); to(arm === R ? L : R, -0.3); e.torso.rotation.x = 0.25; face(toP, 10);
    if (k < 0.5) move(e.g.rotation.y, 2.4);
    if (!e.hitOnce && k > 0.35 && dist < 1.6 && hero.position.y < 0.9 && Math.abs(lerpAngle(e.g.rotation.y, toP, 1) - e.g.rotation.y) < 1){
      const r = hurtPlayer(9 * e.dm, e.g.position.x, e.g.position.z, 4); if (r !== 'dodge') e.hitOnce = true; }
    if (e.t <= 0){ if (--c.punchN > 0){ e.t = 0.3; e.hitOnce = false; play('swing'); } else { e.state = 'recover'; e.t = 0.6; } }
  } else if (e.state === 'tackleW'){   // sin maza: embestida en línea recta
    if (e.t > 0.25) e.dir = lerpAngle(e.dir, toP + (c.drunk ? (rnd() - 0.5) * 0.4 : 0), 1 - Math.exp(-dt * 6));
    face(e.dir, 20); to(R, 0.6); to(L, 0.6); e.torso.rotation.x = 0.45; walk(0);
    capLine(c.tLine, e.g.position.x, e.g.position.z, e.dir, 1.0 * e.scale, 5.5);
    if (e.t <= 0){ e.state = 'tackle'; e.t = 0.5; e.hitOnce = false; play('charge'); }
  } else if (e.state === 'tackle'){
    move(e.dir, 10); face(e.dir, 20); walk(16); e.torso.rotation.x = 0.5;
    if (!e.hitOnce && dist < e.r + 0.5 && hero.position.y < 1.0){ const r = hurtPlayer(16 * e.dm, e.g.position.x, e.g.position.z, 8); if (r !== 'dodge') e.hitOnce = true; }
    if (rnd() < 0.5) puffAt(e.g.position.x, e.g.position.z, 1, 0.8);
    const wall = Math.hypot(e.g.position.x, e.g.position.z) > ARENA - 0.3;
    if (e.t <= 0 || wall){ e.state = 'recover'; e.t = wall ? 1.4 : 0.8; if (wall){ shake = Math.max(shake, 0.2); play('wall'); } }
  } else if (e.state === 'cry'){
    to(R, -2.8, 8); to(L, -2.8, 8); e.torso.rotation.x = -0.35; walk(0);
    if (!c.cried && e.t <= 0.5){ c.cried = true; capCry(e); }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.5; c.cryCd = 15 + rnd() * 5; }
  } else if (e.state === 'retreat'){   // se aleja para beber
    face(toP + Math.PI, 8); move(e.g.rotation.y, e.speed * 1.4); walk(9); to(R, -0.3); to(L, 0);
    if (e.t <= 0 || dist > 5){ e.state = 'drink'; e.t = 1.8; c.drinkDmg = 0; c.healed = 0; capGourd(e, true);
      barkOnce('cap_drink', '¡Está bebiendo para curarse! Interrúmpelo a golpes o rómpele la calabaza por la espalda.'); }
  } else if (e.state === 'drink'){
    face(toP, 2); walk(0); to(L, -2.5, 8); e.torso.rotation.x = -0.3;
    const want = e.maxHp * 0.13 * (1 - Math.max(0, e.t) / 1.8); if (want > c.healed){ e.hp = Math.min(e.maxHp, e.hp + want - c.healed); c.healed = want; }
    if (rnd() < dt * 10) spawnFx(e.g.position.x, e.numY * 0.8, e.g.position.z, (rnd() - 0.5), 1.2, (rnd() - 0.5), 0x7dff8a, 0.07, 0.5, -1, 0);
    const end = (choke) => { capGourd(e, false); c.drinkCd = choke ? 10 : 14; tA.set(e.g.position.x, e.numY, e.g.position.z);
      if (c.healed >= 1) spawnNumber(tA, '+' + Math.round(c.healed), 'heal'); };
    if (c.drinkDmg > e.maxHp * 0.06){ end(true); e.state = 'broken'; e.t = 1.0; starShout(e, '¡Cof, cof!'); }
    else if (e.t <= 0){ end(false); e.state = 'recover'; e.t = 0.5; }
  } else if (e.state === 'recover'){ to(R, -0.4, 4); to(L, 0, 4); e.torso.rotation.x = 0.15; walk(0); e.body.rotation.y = 0;
    if (e.t <= 0){ e.state = 'chase'; e.cd = (maza ? 1.3 : 0.8) + rnd() * 0.7; } }
  else e.state = 'chase';
}

/* ---------- IA del Capitán Muralla ---------- */
function updCapGolem(e, dt, dist, toP, face, move){
  const c = e.cap, esc = capHas(e, 'escudo');
  const walk = sp => { const a = sp ? Math.sin(time * sp) * 0.45 : 0; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; };
  const armsTo = (x, k = 10) => { for (const A of e.arms) A.rotation.x = lerp(A.rotation.x, x, 1 - Math.exp(-dt * k)); };
  e.tele.visible = c.tLine.visible = c.tCirc.visible = c.beam.visible = false; e.body.position.x = 0; c.laserCd -= dt; c.slamCd -= dt;
  if (e.state === 'broken'){ walk(0); armsTo(0.5); e.torso.rotation.x = -0.35 + Math.sin(time * 14) * 0.06; e.body.position.x = Math.sin(time * 26) * 0.04;
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.4; } return; }
  if (capFlee(e, face, move, walk)) return;
  if (e.state === 'chase' || e.state === 'hurt'){
    e.state = 'chase'; face(toP, 4); e.torso.rotation.x = 0.08; armsTo(Math.sin(time * 3) * 0.2); e.body.position.y = 0;
    if (!player.dead && dist > e.r + 0.7){ move(toP, e.speed); walk(6); } else walk(0);
    if (player.dead || e.cd > 0) return;
    // elige entre los ataques que le quedan según la distancia (cada pieza rota quita uno)
    const ops = [];
    if (dist < 2.2) ops.push(['stomp', 3]);
    if (capHas(e, 'ojo') && c.laserCd <= 0 && dist < CAP_LZ) ops.push(['laser', 2.5]);
    if (capHas(e, 'nucleo') && c.slamCd <= 0) ops.push(['slam', dist < 2.2 ? 1.2 : 2]);
    if (esc && dist > 2.0 && dist < 7) ops.push(['charge', 2.5]);
    if (!esc && dist > 2.4) ops.push(['throw', 2.5]);
    if (!ops.length){ e.cd = 0.4; return; }
    let r = rnd() * ops.reduce((s, o) => s + o[1], 0), op = ops[0][0]; for (const o of ops){ r -= o[1]; if (r <= 0){ op = o[0]; break; } }
    if (op === 'stomp'){ e.state = 'stompW'; e.t = 0.65; play('bruteWarn'); }
    else if (op === 'laser'){ e.state = 'laserW'; e.t = 1.0; c.lzSide = rnd() < 0.5 ? -1 : 1; play('sentCharge');
      barkOnce('cap_laser', '¡Va a barrer con el láser del ojo! Salta por encima o rueda a través.'); }
    else if (op === 'slam'){ e.state = 'crouch'; e.t = 0.6; play('roar'); }
    else if (op === 'charge'){ e.state = 'windup'; e.t = 0.9; e.dir = toP; play('bruteWarn'); }
    else { e.state = 'throwW'; e.t = 0.8; }
  } else if (e.state === 'windup'){   // embestida con el escudo por delante
    if (e.t > 0.3) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 6));
    face(e.dir, 20); e.body.position.x = (rnd() - 0.5) * 0.05; armsTo(-0.6); e.torso.rotation.x = 0.25; walk(0); showTele(e, 6.4);
    if (e.t <= 0){ e.state = 'charge'; e.t = 0.6; e.hitOnce = false; play('charge'); }
  } else if (e.state === 'charge'){
    move(e.dir, 9.5); face(e.dir, 20); walk(16); armsTo(-0.7); e.torso.rotation.x = 0.4;
    if (!e.hitOnce && dist < e.r + 0.45 && hero.position.y < 1.0){ const r = hurtPlayer(22 * e.dm, e.g.position.x, e.g.position.z, 9); if (r !== 'dodge') e.hitOnce = true; }
    if (rnd() < 0.5) puffAt(e.g.position.x, e.g.position.z, 1, 0.8);
    const wall = Math.hypot(e.g.position.x, e.g.position.z) > ARENA - 0.3;
    if (e.t <= 0 || wall){ e.state = 'recover'; e.t = wall ? 1.6 : 1.0; if (wall){ shake = Math.max(shake, 0.25); play('wall'); sparks(e.g.position.x, 1.4, e.g.position.z, 10, 0xfff0a0); } }
  } else if (e.state === 'crouch'){   // salto con onda expansiva (lo alimenta el núcleo)
    face(toP, 8); e.body.position.y = -0.1; armsTo(0.8); walk(0);
    if (e.t <= 0){ e.state = 'air'; e.t = 0.8; e.from = [e.g.position.x, e.g.position.z]; e.noSep = true;
      const v = clampArena(new V3(hero.position.x, 0, hero.position.z), ARENA - 1); e.to = [v.x, v.z]; }
  } else if (e.state === 'air'){
    const p = clamp(1 - e.t / 0.8, 0, 1); e.vx = e.vz = 0;
    e.g.position.x = lerp(e.from[0], e.to[0], p); e.g.position.z = lerp(e.from[1], e.to[1], p); e.g.position.y = Math.sin(p * Math.PI) * 3.4;
    armsTo(-2.6); e.body.position.y = 0; capCirc(c.tCirc, e.to[0], e.to[1], 1.4);
    if (e.t <= 0){ e.g.position.y = 0; e.noSep = false; capWave(e.g.position.x, e.g.position.z, 7.5, 22 * e.dm);
      shake = Math.max(shake, 0.45); play('bossSlam'); puffAt(e.g.position.x, e.g.position.z, 14, 2.4);
      if (dist < e.r + 0.9) hurtPlayer(26 * e.dm, e.g.position.x, e.g.position.z, 9);
      e.state = 'recover'; e.t = 1.2; c.slamCd = 9 + rnd() * 3; }
  } else if (e.state === 'stompW'){   // pisotón: el ataque que le queda siempre
    face(toP, 3); armsTo(-2.4, 8); e.torso.rotation.x = -0.2; walk(0); capCirc(c.tCirc, e.g.position.x, e.g.position.z, 2.1);
    if (e.t <= 0){ e.state = 'stomp'; e.t = 0.2; e.hitOnce = false; }
  } else if (e.state === 'stomp'){
    armsTo(0.6, 30); e.torso.rotation.x = 0.4;
    if (!e.hitOnce){ e.hitOnce = true; ringFx(e.g.position.x, e.g.position.z, 0xffa060, 0.3, 2.3, 0.3); puffAt(e.g.position.x, e.g.position.z, 10, 2.2); shake = Math.max(shake, 0.25); play('slam');
      if (dist < 2.2 && hero.position.y < 0.6) hurtPlayer(16 * e.dm, e.g.position.x, e.g.position.z, 7); }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.8; }
  } else if (e.state === 'laserW'){   // apunta por un lado…
    face(toP, 3); walk(0); armsTo(0.3); e.torso.rotation.x = -0.1;
    c.lzA0 = e.g.rotation.y - 0.85 * c.lzSide; capLine(c.tLine, e.g.position.x, e.g.position.z, c.lzA0, 0.5, CAP_LZ);
    if (rnd() < dt * 20){ capPart(e, 'ojo').node.getWorldPosition(_capV); sparks(_capV.x, _capV.y, _capV.z, 1, 0xff3a3a, 1.5); }
    if (e.t <= 0){ e.state = 'laser'; e.t = 1.6; c.lzHit = 0; play('capLaser'); }
  } else if (e.state === 'laser'){   // …y barre hacia el otro
    walk(0); const a = c.lzA0 + 1.7 * c.lzSide * (1 - Math.max(0, e.t) / 1.6); e.g.rotation.y = a;
    const x0 = e.g.position.x, z0 = e.g.position.z, ex = x0 + Math.sin(a) * CAP_LZ, ez = z0 + Math.cos(a) * CAP_LZ;
    capLine(c.tLine, x0, z0, a, 0.42, CAP_LZ, 0.85);
    capPart(e, 'ojo').node.getWorldPosition(_capV); _capV2.set(ex, 0.05, ez);
    c.beam.visible = true; c.beam.position.copy(_capV); c.beam.lookAt(_capV2); c.beam.scale.set(1, 1, _capV.distanceTo(_capV2));
    if (rnd() < 0.5) sparks(ex, 0.1, ez, 2, 0xff6a4a);
    const hx = hero.position.x - x0, hz = hero.position.z - z0, along = hx * Math.sin(a) + hz * Math.cos(a), perp = Math.abs(hx * Math.cos(a) - hz * Math.sin(a));
    c.lzHit -= dt;
    if (c.lzHit <= 0 && along > 0 && along < CAP_LZ && perp < 0.45 && hero.position.y < 1.1){ if (hurtPlayer(12 * e.dm, x0 + Math.sin(a) * along, z0 + Math.cos(a) * along, 5) === 'hit') c.lzHit = 0.5; }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.9; c.laserCd = 10 + rnd() * 3; }
  } else if (e.state === 'throwW'){   // sin escudo: lanza los cascotes
    face(toP, 6); walk(0); armsTo(-2.7, 8); e.torso.rotation.x = -0.3;
    if (e.t <= 0){ for (let k = 0; k < 3; k++){ const v = clampArena(new V3(hero.position.x + (k ? (rnd() - 0.5) * 3 : 0), 0, hero.position.z + (k ? (rnd() - 0.5) * 3 : 0)), ARENA - 0.6); capRock(e, v.x, v.z, 0.9 + k * 0.18); }
      play('capThrow'); e.state = 'recover'; e.t = 0.9; }
  } else if (e.state === 'recover'){ armsTo(0.3); e.torso.rotation.x = 0.25; walk(0); e.body.position.y = 0; e.g.position.y = 0;
    if (e.t <= 0){ e.state = 'chase'; e.cd = 1.2 + rnd() * 0.8; } }
  else e.state = 'chase';
}

/* ---------- Aparición, muerte y limpieza ---------- */
function spawnCaptain(kind){
  if (enemies.some(e => e.cap && e.alive)) return null;
  kind = kind || (rnd() < 0.5 ? 'caponi' : 'capgolem');
  let x = 0, z = 0;
  for (let i = 0; i < 12; i++){   // al otro lado del jugador y lejos del brasero
    const a = Math.atan2(hero.position.x, hero.position.z) + Math.PI + (rnd() - 0.5) * 1.6, r = ARENA - 1.6;
    x = Math.sin(a) * r; z = Math.cos(a) * r; if (!braz.visible || Math.hypot(x - BRAZ.x, z - BRAZ.z) > 1.8) break; }
  const e = spawnEnemy(kind, [x, z]); if (!e) return null;
  waveTotal++; play('roar'); stat('capitanes');
  banner(`¡Capitán a la vista!<small>${e.cap.name} · rómpele las piezas</small>`, 1.8);
  later(1.4, () => barkOnce('cap_' + kind, CAP_DEF[kind].intro));
  return e;
}
const _spawnAnimCap = spawnAnim;
spawnAnim = function(e, dt){   // los capitanes caen del cielo
  if (!e.cap) return _spawnAnimCap(e, dt);
  const k = smooth(clamp(1 - e.spawnT / (e.spawnT0 || 0.7), 0.01, 1)); e.g.scale.setScalar(e.scale); e.g.position.y = 9 * (1 - k) * (1 - k);
  if (e.spawnT - dt <= 0){ e.g.position.y = 0; shake = Math.max(shake, 0.4); puffAt(e.g.position.x, e.g.position.z, 16, 2.8); play('land'); ringFx(e.g.position.x, e.g.position.z, 0xffb040, 0.3, 2.8, 0.4); }
};
const _killEnemyCap = killEnemy;
killEnemy = function(e){
  const was = e.alive; _killEnemyCap(e);
  if (!was || !e.cap) return;
  const c = e.cap, x = e.g.position.x, z = e.g.position.z; c.dead = true;
  hideTeles(e); c.tLine.visible = c.tRing.visible = c.tCirc.visible = false; if (c.beam) c.beam.visible = false; e.g.position.y = 0;
  if (e.type === 'caponi') capGourd(e, false);
  for (let i = 0; i < 2; i++) dropPickup(x + (rnd() - 0.5) * 1.4, z + (rnd() - 0.5) * 1.4);
  castleBonus += 5; slowT = Math.max(slowT, 0.8); shake = Math.max(shake, 0.5); flash('#fff3c0', 0.35); lightFlash(x, 1.5, z, 0xffd070, 2.4, 9);
  for (let i = 0; i < 24; i++){ const a = rnd() * TAU; spawnFx(x, 1 + rnd(), z, Math.cos(a) * 4, 3 + rnd() * 3, Math.sin(a) * 4, rnd() < 0.5 ? 0xffd23a : 0xff8a3a, 0.12, 0.8, 9, 0.4); }
  const rotas = c.parts.filter(p => p.broken).length;
  banner(`¡${c.name} derrotado!<small>${rotas ? `${rotas} de ${c.parts.length} piezas rotas` : 'Sin romperle ninguna pieza'}</small>`, 1.8);
  if (rotas === c.parts.length) stat('capCompleto');
  if (c.onDie) c.onDie(e);
};
function capLimpia(todo){
  for (const f of capFx) capFxKill(f); capFx.length = 0;
  if (todo){ for (const d of capDebris) scene.remove(d.m); capDebris.length = 0; capBox.hidden = true; capHudKey = ''; objColT = 0; }
}
const _clearWorldCap = clearWorld;
clearWorld = function(){ _clearWorldCap(); capLimpia(true); };
const _sweepHazardsCap = sweepHazards;
sweepHazards = function(){ _sweepHazardsCap(); capLimpia(false); };

/* ---------- Panel del capitán: vida y estado de cada pieza ---------- */
const objCol = document.createElement('div'); objCol.id = 'objCol'; document.body.appendChild(objCol);
const capBox = document.createElement('div'); capBox.className = 'win'; capBox.id = 'capBox'; capBox.hidden = true; objCol.appendChild(capBox);
capBox.innerHTML = '<div class="caphead"><span id="capName"></span><span id="capInfo"></span></div><div class="bar boss"><i id="capFill"></i></div><div id="capParts"></div>';
const capNameEl = document.getElementById('capName'), capInfoEl = document.getElementById('capInfo'), capFillEl = document.getElementById('capFill'), capPartsEl = document.getElementById('capParts');
let capHudKey = '', objColT = 0;
// Coloca la columna de paneles bajo la caja de la oleada (y, en móvil, bajo las etiquetas) y publica dónde acaba
// (--objfin) para que el rótulo, el comentario de Lumen y el combo se aparten.
function objColAjusta(){
  const on = !capBox.hidden || (typeof objBox !== 'undefined' && !objBox.hidden);
  document.body.classList.toggle('con-obj', on); if (!on) return;
  const w = waveBox.getBoundingClientRect(), tg = innerWidth <= 720 && !tagsEl.hidden ? tagsEl.getBoundingClientRect() : null;
  objCol.style.top = Math.round(Math.max(w.bottom, tg && tg.height ? tg.bottom : 0, 40) + 8) + 'px';
  document.body.style.setProperty('--objfin', Math.round(objCol.getBoundingClientRect().bottom) + 'px');
}
function capHud(playing){
  const e = playing || gameState === 'paused' ? enemies.find(q => q.cap && q.alive) : null;
  if (capBox.hidden !== !e){ capBox.hidden = !e; objColT = 0; }
  if (!e){ capHudKey = ''; return; }
  const c = e.cap; if (!c.init) capInit(e);
  capFillEl.style.width = Math.max(0, e.hp / e.maxHp * 100) + '%';
  const key = c.name + '|' + c.info + '|' + c.parts.map(p => p.broken ? 'x' : Math.ceil(p.hp / p.max * 20)).join(',');
  if (key === capHudKey) return; capHudKey = key;
  capNameEl.textContent = c.name; capInfoEl.textContent = c.info || '';
  capPartsEl.innerHTML = c.parts.map(p => `<span class="cpart${p.broken ? ' roto' : ''}"><b>${p.name}</b><i><u style="width:${p.broken ? 0 : Math.max(0, p.hp / p.max * 100)}%"></u></i><em>${p.broken ? '¡Rota!' : CAP_ZONA[p.zone]}</em></span>`).join('');
}

/* ---------- Bucle: piezas volando, rocas, gritos de guerra y panel ---------- */
function capTick(dt, pdt, playing){
  if ((objColT -= dt) <= 0){ objColT = 0.25; objColAjusta(); }
  const edt = playing ? pdt * (slowT > 0 ? 0.3 : 1) * (timeStopT > 0 ? 0 : 1) * (invActive ? 0 : 1) : 0;
  for (let i = capDebris.length - 1; i >= 0; i--){
    const d = capDebris[i], m = d.m; d.t += pdt; d.vy -= 18 * pdt;
    m.position.x += d.vx * pdt; m.position.y += d.vy * pdt; m.position.z += d.vz * pdt; m.rotation.x += d.sx * pdt; m.rotation.z += d.sz * pdt;
    if (m.position.y < 0.12){ m.position.y = 0.12; d.vy = Math.abs(d.vy) * 0.3; d.vx *= 0.6; d.vz *= 0.6; d.sx *= 0.6; d.sz *= 0.6; }
    if (d.t > 2.4) m.scale.setScalar(d.s0 * Math.max(0.01, 1 - (d.t - 2.4) / 0.5));
    if (d.t > 2.9){ scene.remove(m); capDebris.splice(i, 1); }
  }
  if (edt > 0) for (let i = capFx.length - 1; i >= 0; i--){ const f = capFx[i]; if (!f.upd(edt)){ capFxKill(f); capFx.splice(i, 1); } }
  for (const o of enemies) if (o.cryOn){ o.cryT -= edt;
    if (o.alive && rnd() < edt * 8) spawnFx(o.g.position.x, 0.4 + rnd() * o.numY * 0.6, o.g.position.z, 0, 1.6, 0, 0xff3a2a, 0.07, 0.4, -1, 0);
    if (o.cryT <= 0){ o.cryOn = false; o.speed /= 1.35; o.dm /= 1.2; } }
  capHud(playing);
}
const _v3UpdateCap = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateCap(dt, pdt, playing); try { capTick(dt, pdt, playing); } catch (err) { console.error(err); } };

Object.assign(SFX, {
  capBreak: () => { noise({ dur: 0.35, vol: 0.32, f0: 2400, f1: 300, q: 0.8, rv: 0.4 }); tone({ type: 'square', f0: 220, f1: 70, dur: 0.3, vol: 0.12, rv: 0.4 });
                    for (let i = 0; i < 4; i++) tone({ type: 'triangle', f0: 900 + i * 380, dur: 0.12, vol: 0.06, when: 0.06 + i * 0.05, rv: 0.5 }); },
  capCry:   () => { tone({ type: 'sawtooth', f0: 110, f1: 165, dur: 0.7, vol: 0.14, rv: 0.6 }); tone({ type: 'sawtooth', f0: 165, f1: 220, dur: 0.6, vol: 0.1, when: 0.12, rv: 0.6 });
                    noise({ dur: 0.6, vol: 0.12, f0: 600, f1: 200, q: 0.8, rv: 0.5 }); },
  capLaser: () => { tone({ type: 'sawtooth', f0: 880, f1: 660, dur: 1.5, vol: 0.07, rv: 0.3 }); tone({ type: 'square', f0: 1320, f1: 990, dur: 1.5, vol: 0.04, rv: 0.3 }); },
  capThrow: () => { noise({ dur: 0.3, vol: 0.18, f0: 500, f1: 1500, q: 1, rv: 0.2 }); }
});

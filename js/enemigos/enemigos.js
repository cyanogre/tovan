'use strict';
/* ---------- Enemigos ---------- */
const orbGeo = new THREE.OctahedronGeometry(0.15, 0);
const orbMatE = makeMat(0xff5ad8, { emissive: 1 }), orbMatP = makeMat(0x8ff6ff, { emissive: 1 });
const pickGeo = new THREE.OctahedronGeometry(0.16, 0), pickMat = makeMat(0x7dff8a, { emissive: 1 });
const teleGeo = new THREE.PlaneGeometry(1, 1); teleGeo.rotateX(-Math.PI / 2); teleGeo.translate(0, 0, 0.5);
const flameGeo = new THREE.ConeGeometry(0.16, 0.42, 5);
function matSet(list){ return list.map(([c, em]) => ({ m: makeMat(c, { emissive: em || 0 }), c, base: c, em: em || 0 })); }
function newEnemy(type, g, body, mats, o){
  const e = Object.assign({ type, g, body, mats, state: 'chase', t: 0, cd: 0.8 + rnd(), vx: 0, vz: 0, flash: 0, spawnT: 0.7, alive: true, dying: 0,
    seed: rnd() * 10, side: rnd() < 0.5 ? -1 : 1, hitOnce: false, dir: 0, orbCd: 0, scale: 1, dm: 1, heavy: false,
    burnT: 0, burnS: 0, burnTick: 0.5, chill: 0, chillT: 0, frozenT: 0, shockT: 0, reactCd: 0, tempCd: 0 }, o);
  e.maxHp = e.hp; enemies.push(e);
  for (const x of mats) if (x.m.uniforms && x.m.uniforms.uGlitch && x.m.uniforms.uMap.value !== missTex) x.m.uniforms.uGlitch = { value: 0 };   // los enemigos se leen bien aunque el mundo esté corrupto
  return e;
}
function makeImp(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0x3a2450], [0x221430], [0xffd23a, 1], [0xd9c6a0]]);
  const body = new THREE.Group(); body.position.y = 0.52; g.add(body);
  const torso = mesh(new THREE.OctahedronGeometry(0.34, 0), S[0].m, 0, 0, 0, body); torso.scale.set(1, 1.25, 0.9);
  for (const s of [-1, 1]){
    const h = mesh(new THREE.ConeGeometry(0.07, 0.28, 4), S[3].m, 0.15 * s, 0.38, -0.02, body); h.rotation.z = -0.5 * s;
    mesh(B(0.08, 0.05, 0.04), S[2].m, 0.1 * s, 0.1, 0.26, body);
    const cl = mesh(new THREE.ConeGeometry(0.06, 0.22, 4), S[3].m, 0.33 * s, -0.1, 0.12, body); cl.rotation.set(1.3, 0, 0.3 * s);
    mesh(B(0.1, 0.16, 0.1), S[1].m, 0.13 * s, -0.43, 0, body);
  }
  const tl = mesh(new THREE.ConeGeometry(0.06, 0.36, 4), S[1].m, 0, -0.15, -0.32, body); tl.rotation.x = -2.2;
  return newEnemy('imp', g, body, S, { hp: 60, r: 0.42, speed: 2.8, numY: 1.3, eye: S[2] });
}
function makeSentinel(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0x8a8296], [0x2a2432], [0xfff2d0, 1], [0xff5ad8, 1]]);
  const body = new THREE.Group(); body.position.y = 1.35; g.add(body);
  mesh(new THREE.IcosahedronGeometry(0.34, 0), S[0].m, 0, 0, 0, body);
  const eyeG = new THREE.Group(); eyeG.position.z = 0.3; body.add(eyeG);
  mesh(B(0.26, 0.2, 0.08), S[2].m, 0, 0, 0, eyeG);
  mesh(B(0.1, 0.12, 0.04), S[1].m, 0, 0, 0.05, eyeG);
  const ring = mesh(new THREE.TorusGeometry(0.52, 0.045, 4, 8), S[3].m, 0, 0, 0, body); ring.rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++){ const a = i / 3 * TAU; const c = mesh(new THREE.ConeGeometry(0.06, 0.24, 4), S[3].m, Math.cos(a) * 0.3, -0.34, Math.sin(a) * 0.3, body); c.rotation.x = Math.PI; }
  return newEnemy('sentinel', g, body, S, { hp: 45, r: 0.45, speed: 1.9, numY: 2.1, eyeG, ring });
}
function makeBrute(boss){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[boss ? 0x5e5a66 : 0x6e6258], [0x3a322c], [boss ? 0xff3a3a : 0xff7a2a, 1], [0x4f6a3a], [0x9ff3ff, 1]]);
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.26 * s, 0.42, 0); body.add(L); mesh(B(0.3, 0.42, 0.34), S[1].m, 0, -0.21, 0, L); return L; });
  const torso = new THREE.Group(); torso.position.y = 0.42; body.add(torso);
  mesh(B(1.0, 0.72, 0.7), S[0].m, 0, 0.38, 0, torso);
  mesh(B(1.04, 0.1, 0.74), S[3].m, 0, 0.76, 0, torso);
  mesh(B(0.42, 0.32, 0.38), S[0].m, 0, 0.9, 0.14, torso);
  mesh(B(0.28, 0.05, 0.03), S[2].m, 0, 0.92, 0.34, torso);
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.64 * s, 0.6, 0); torso.add(A);
    mesh(B(0.28, 0.46, 0.3), S[1].m, 0, -0.2, 0, A); mesh(B(0.4, 0.36, 0.4), S[0].m, 0, -0.56, 0.02, A); return A; });
  if (boss) for (let i = 0; i < 3; i++){ const c = mesh(new THREE.OctahedronGeometry(0.12, 0), S[4].m, (i - 1) * 0.15, 1.16 + (i === 1 ? 0.06 : 0), 0.14, torso); c.scale.y = 1.8; }
  const tele = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.04, 0); tele.visible = false;
  const sc = boss ? 1.75 : 1; g.scale.setScalar(sc);
  return newEnemy(boss ? 'boss' : 'brute', g, body, S, { isBoss: !!boss, bossName: 'Guardián de las ruinas', hp: boss ? 900 : 220, r: 0.62 * sc, speed: boss ? 1.6 : 1.3, numY: 1.9 * sc,
    legs, arms, torso, tele, heavy: true, scale: sc, chargesLeft: 0, bt: 2 });
}
// dificultad: lineal al principio y cuadrática desde la oleada 8 (la partida sin fin siempre acaba)
const hpScale = w => 1 + 0.17 * (w - 1) + 0.028 * Math.max(0, w - 8) ** 2;
const dmgScale = w => 1 + 0.1 * (w - 1) + 0.007 * Math.max(0, w - 8) ** 2;
function spawnEnemy(type, at){
  const e = (MAKERS[type] || (() => makeBrute(type === 'boss')))();
  if (type === 'dragon'){
    const a = rnd() * TAU; placeDragon(e, Math.cos(a) * 11, Math.sin(a) * 11);
    e.hp = e.maxHp = Math.round(1800 * BOSS_HP_MUL * hpScale(wave) / hpScale(5)); e.dm = dmgScale(wave);
    play('dragonRoar'); bossBox.hidden = false; bossE = e; bossNameEl.textContent = e.bossName; roundBoss(e); return e;
  }
  let x, z;
  if (at){ [x, z] = at; }
  else [x, z] = spawnSpot(type);
  if (!at && chMode === 'arcade'){ x = (rnd() < 0.5 ? -1 : 1) * 9; z = (rnd() - 0.5) * 3; }
  e.g.position.set(x, 0, z); e.g.rotation.y = angTo(x, z, hero.position.x, hero.position.z);
  e.hp = e.maxHp = Math.round(e.isBoss ? (e.bossHp || 1150) * BOSS_HP_MUL * hpScale(wave) / hpScale(5) : e.hp * hpScale(wave));
  e.dm = dmgScale(wave);
  if (!e.isBoss && !at && wave >= 6 && rnd() < 0.1 + 0.015 * (wave - 6)){
    barkOnce('elite', 'Ese brilla. Los que brillan pegan más. Lo digo por experiencia.');
    e.elite = true; e.hp = e.maxHp = Math.round(e.hp * 2.5); e.dm *= 1.3; e.speed *= 1.12; e.scale *= 1.22; e.r *= 1.22; e.numY *= 1.22;
    e.mats[0].c = e.mats[0].base = 0xc9a24a;
    const ring = mesh(new THREE.TorusGeometry(0.62, 0.035, 3, 14), eliteMat, 0, 0.05, 0, e.g); ring.rotation.x = Math.PI / 2;
  }
  play(e.isBoss ? 'roar' : 'spawn');
  if (type === 'oni') barkOnce('oni', '¡Un oni! Recuerda: ni una palabra sobre lo azul.');
  e.g.scale.setScalar(0.01);
  if (e.onSpawn) e.onSpawn(e);
  roundBoss(e);
  ringFx(x, z, 0x9a4aff, 0.2, 1.3 * e.scale, 0.7);
  for (let i = 0; i < 8; i++){ const a = rnd() * TAU; spawnFx(x + Math.cos(a) * 0.6, 0.1, z + Math.sin(a) * 0.6, 0, 1.5 + rnd(), 0, 0x9a4aff, 0.08, 0.6, 0, 0.5); }
  if (e.isBoss){ bossBox.hidden = false; bossE = e; bossNameEl.textContent = e.bossName; }
  return e;
}
// Dónde aparece un enemigo sin posición fija (los mapas grandes lo sustituyen para que salgan alrededor del jugador)
function spawnSpot(type){
  let x, z, tries = 0; do { const a = rnd() * TAU, r = type === 'boss' ? 4.2 : 5.0 + rnd() * 1.0; x = Math.cos(a) * r; z = Math.sin(a) * r; }
  while (++tries < 14 && Math.hypot(x - hero.position.x, z - hero.position.z) < 3.3);
  return [x, z];
}
let bossE = null, waveTotal = 1, ghostPct = 100;
const eliteMat = makeMat(0xffd970, { emissive: 1 });
const bossBox = document.getElementById('bossBox'), bossFill = document.getElementById('bossFill'), bossNameEl = document.getElementById('bossName');
function applyFlash(e){
  const f = e.flash > 0 || e.dying > 0;
  for (const s of e.mats){ if (s.std){ s.m.emissive.setHex(f ? 0xffffff : (s.glow || 0)); s.m.emissiveIntensity = f ? 0.6 : 1; continue; } if (f) s.m.uniforms.uColor.value.setHex(0xffffff); else s.m.uniforms.uColor.value.copy(statusTint(e, s)); s.m.uniforms.uEmissive.value = f ? 1 : s.em; }
}
function hitEnemy(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  if (!e.alive || e.spawnT > 0) return false;
  const src = o.src || (melee ? 'melee' : 'other');
  if (e.weak && src !== 'dot') val = Math.round(val * 1.5);
  val = Math.round(val * cosDmgMul(e, src));
  if (timeStopT > 0 && src !== 'dot'){ e.tsDmg = (e.tsDmg || 0) + val; e.tsNx = nx; e.tsNz = nz; e.flash = 0.08; addCombo(); play('hit');
    sparks(e.g.position.x - nx * e.r * 0.8, 0.9 * e.scale, e.g.position.z - nz * e.r * 0.8, 3, 0xffe070); return true; }
  if (e.frozenT > 0 && setOn('hielo') && !crit && src !== 'dot'){ crit = true; val = Math.round(val * 1.75); }
  e.hp -= val; e.flash = src === 'dot' ? 0.05 : 0.1;
  if (e.frozenT > 0) knock = 0;
  const armor = e.isBoss || (e.type === 'brute' && (e.state === 'windup' || e.state === 'charge')) || (e.type === 'oni' && (e.state === 'windup' || e.state === 'smash'));
  if (e.isBoss && e.hp < e.maxHp * 0.5) barkOnce('half_' + e.type, e.type === 'dragon' ? '¡Le duele! ¡Creo! Es difícil leer caras de dragón.' : '¡Ya flaquea! Y apártate cuando salte, que no es un abrazo.');
  const kb = knock * (e.heavy ? 0.3 : 1) * (armor ? 0.3 : 1);
  if (!(e.isBoss && (e.state === 'air' || e.type === 'dragon'))){ e.vx += nx * kb; e.vz += nz * kb; }
  if (!armor && e.hp > 0 && knock > 0){ e.state = 'hurt'; e.t = e.heavy ? 0.3 : 0.28; for (const s of e.mats) s.c = s.base; if (e.eyeG) e.eyeG.scale.setScalar(1); }
  tA.set(e.g.position.x, e.numY, e.g.position.z); spawnNumber(tA, val, src === 'dot' ? 'dot' : crit ? 'crit' : '');
  if (src !== 'dot'){ addCombo(); if (src !== 'aoe') play(crit ? 'crit' : 'hit'); onoPop(e); }
  if (src === 'melee' && meta.cos.effect === 'confetti') confetti(e.g.position.x, 1.0 * e.scale, e.g.position.z, 7);
  if (src !== 'dot') sparks(e.g.position.x - nx * e.r * 0.8, 0.9 * e.scale, e.g.position.z - nz * e.r * 0.8, crit ? 10 : 5, crit ? 0xffe066 : 0xfff0c0);
  const wasFull = player.meter >= 100; player.meter = Math.min(100, player.meter + meterGain * up.meterRate);
  if (!wasFull && player.meter >= 100){ play('meter'); banner('¡Especial listo!', 0.9); }
  if (up.lifesteal && melee) heal(up.lifesteal, true);
  if (setOn('sangre') && (src === 'melee' || src === 'bolt')) heal(1, true);
  if (e.hp <= 0) killEnemy(e);
  else if (o.el) applyStatus(e, o.el, o.power || 1);
  synergyOnHit(e, val, src, o);
  cosOnHit(e, src, crit);
  return true;
}
function killEnemy(e){
  e.alive = false; e.dying = e.dieTime || (e.type === 'dragon' ? 2.2 : 0.4); kills++; onKill(e); onKillOtaku(e); onKillSyn(e);
  addTrust(1500 * (1 + combo / 25) * (e.isBoss ? 20 : e.heavy ? 3 : 1)); onoPop(e, true); play(e.isBoss ? 'bossDie' : 'die');
  if (e.isBoss) bossKills++; if (e.elite) eliteKills++;
  if (e.type === 'oni' && stat('oni') >= 50) unlock('oni50');
  cosOnKill(e);
  if (e.isBoss){ (meta.bosses = meta.bosses || {})[e.type] = 1; saveMeta();
    if (e.type === 'finalcat'){ finalBeaten = true; stopEpic(); for (const o of enemies) if (o.alive && o !== e) killEnemy(o); }
    unlock({ boss: 'guardian', dragon: 'dragon', skeleton: 'skeleton', teapot: 'teapot', error: 'error', sixeyes: 'sixeyes', star: 'star' }[e.type]); if (meta.cos.body === 'mini') unlock('mini'); }
  if (e.tele) e.tele.visible = false; hideTeles(e);
  const col = e.type === 'imp' ? 0x9a4aff : e.type === 'sentinel' ? 0xff5ad8 : e.type === 'oni' ? 0x3f6fd8 : e.type === 'dragon' ? 0x7fe8c8 : 0xb8a898;
  for (let i = 0; i < (e.heavy ? 18 : 10); i++){ const a = rnd() * TAU;
    spawnFx(e.g.position.x, 0.6 * e.scale, e.g.position.z, Math.cos(a) * 2.5, 2 + rnd() * 2, Math.sin(a) * 2.5, col, 0.1 * e.scale, 0.6, 8, 0.5); }
  const chance = e.elite ? 1 : { imp: 0.12, sentinel: 0.15, brute: 0.5, oni: 0.35, boss: 1, dragon: 1 }[e.type];
  if (rnd() < chance) for (let i = 0; i < (e.isBoss ? 3 : 1); i++) dropPickup(e.g.position.x + (rnd() - 0.5) * 1.2, e.g.position.z + (rnd() - 0.5) * 1.2);
  if (e.isBoss){ bossBox.hidden = true; bossE = null; slowT = 1.2; shake = 0.6; flash('#fff3c0', 0.5);
    banner(`¡${e.bossName.split(',')[0]} derrotado!`, 2); stopBossTrack(false); setSong(BIOMES[curBiome].music); document.body.classList.remove('glitch-hard');
    for (const f of fballs){ scene.remove(f.m); f.circle.visible = false; } fballs.length = 0;
    pendingWin = 'win_' + e.type; }
}
function dropPickup(x, z){
  const r = Math.hypot(x, z); if (r > ARENA - 0.4){ x *= (ARENA - 0.4) / r; z *= (ARENA - 0.4) / r; }
  pickups.push({ m: mesh(pickGeo, pickMat, x, 0.5, z), t: 0, seed: rnd() * 6 });
}
function fireOrb(e, a){
  const m = mesh(orbGeo, orbMatE, e.g.position.x + Math.sin(a) * 0.5, 1.05, e.g.position.z + Math.cos(a) * 0.5);
  projectiles.push({ m, vx: Math.sin(a) * 4.8, vz: Math.cos(a) * 4.8, life: 3.2, owner: 'enemy', dmg: 12 * e.dm }); play('shoot');
}
function slamRing(e){
  const mat = makeMat(0xff8a3a, { emissive: 1, opacity: 0.9, side: THREE.DoubleSide });
  const m = mesh(new THREE.RingGeometry(0.93, 1, 40), mat, e.g.position.x, 0.06, e.g.position.z); m.rotation.x = -Math.PI / 2;
  eRings.push({ m, r: 0.8, speed: 6.5, max: 9.5, dmg: 22 * e.dm * (e.ringMul || 1), hit: false });
  shake = Math.max(shake, 0.45); play('bossSlam');
  for (let i = 0; i < 16; i++){ const a = i / 16 * TAU; spawnFx(e.g.position.x + Math.cos(a), 0.1, e.g.position.z + Math.sin(a), Math.cos(a) * 4, 0.8, Math.sin(a) * 4, 0xb8a898, 0.18, 0.6, 0, 2); }
}
function showTele(e, len){
  e.tele.visible = true; e.tele.position.set(e.g.position.x, 0.04, e.g.position.z); e.tele.rotation.y = e.dir;
  e.tele.scale.set(1.1 * e.scale, 1, len); e.tele.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12));
}

const BOSS_HP_MUL = 2.2;   // los jefes aguantan bastante más
// Frenesí: al bajar del 66 % y del 33 % (y cada ~20 s) el jefe ruge y va un 60 % más rápido durante 5 s
function bossFrenzy(e, dt){
  if (!e.isBoss || player.dead) return 1;
  if (e.fzT == null){ e.fzT = 16 + rnd() * 6; e.fzOn = 0; e.fzWarn = 0; e.fzMarks = [0.66, 0.33]; }
  const x = e.g.position.x, z = e.g.position.z;
  if (e.fzOn > 0){ e.fzOn -= dt;
    if (rnd() < dt * 40){ const a = rnd() * TAU, r = e.r * (0.6 + rnd() * 0.6); spawnFx(x + Math.cos(a) * r, 0.2 + rnd() * e.numY * 0.8, z + Math.sin(a) * r, 0, 2.2, 0, rnd() < 0.6 ? 0xff3a2a : 0xffa030, 0.09, 0.5, -1.5, 0); }
    if (rnd() < dt * 6) lightFlash(x, 1.5, z, 0xff3a2a, 1.4, 6);
    if (e.fzOn <= 0) e.fzT = 18 + rnd() * 6;
    return e.fzMul || 1.6; }
  if (e.fzWarn > 0){ e.fzWarn -= dt; shake = Math.max(shake, 0.15); if (e.fzWarn <= 0) e.fzOn = 5; return 1; }
  let go = false;
  if (e.fzMarks.length && e.hp / e.maxHp < e.fzMarks[0]){ e.fzMarks.shift(); go = true; }
  e.fzT -= dt; if (e.fzT <= 0) go = true;
  if (go){ e.fzWarn = 0.8; e.fzT = 99; starShout(e, '¡FRENESÍ!'); play('roar'); flash('#ff3a2a', 0.25); ringFx(x, z, 0xff3a2a, 0.3, e.r * 3, 0.4); barkOnce('frenzy', '¡Se ha puesto rojo! ¡Cuidado, ahora va más rápido!'); }
  return 1;
}
function updateEnemy(e, dt){
  if (e.flair && e.alive) e.flair(e, dt);
  if (e.dying > 0){
    if (e.type === 'dragon'){ dragonDying(e, dt); return; }
    if (e.onDying){ e.onDying(e, dt); return; }
    e.dying -= dt; const k = Math.max(0, e.dying / 0.4);
    e.g.scale.setScalar(e.scale * (0.3 + 0.7 * k)); applyFlash(e);
    if (e.dying <= 0){ scene.remove(e.g); if (e.tele) scene.remove(e.tele); e.remove = true; }
    return;
  }
  if (e.spawnT > 0){ spawnAnim(e, dt); e.spawnT -= dt; if (e.spawnT <= 0) e.g.scale.setScalar(e.scale); return; }
  updateStatuses(e, dt);
  if (!e.alive){ applyFlash(e); return; }
  const px = hero.position.x, pz = hero.position.z;
  const dx = px - e.g.position.x, dz = pz - e.g.position.z, dist = Math.max(0.001, Math.hypot(dx, dz)), toP = Math.atan2(dx, dz);
  if (e.flash > 0) e.flash -= dt; if (e.orbCd > 0) e.orbCd -= dt; if (e.tempCd > 0) e.tempCd -= dt;
  e.g.position.x += e.vx * dt; e.g.position.z += e.vz * dt; const kd = Math.exp(-dt * 7); e.vx *= kd; e.vz *= kd;
  if (e.frozenT > 0){ if (e.tele) e.tele.visible = false; applyFlash(e); return; }   // congelado: no piensa ni se mueve
  const adt = dt * (1 - 0.1 * Math.min(4, e.chill)) * bossFrenzy(e, dt);           // el frío ralentiza; el frenesí acelera
  e.t -= adt; e.cd -= adt;
  const face = (a, k = 8) => { e.g.rotation.y = lerpAngle(e.g.rotation.y, a, 1 - Math.exp(-adt * k)); };
  const move = (a, sp) => { e.g.position.x += Math.sin(a) * sp * adt; e.g.position.z += Math.cos(a) * sp * adt; };
  if (e.type === 'imp') updImp(e, adt, dist, toP, face, move);
  else if (e.upd) e.upd(e, adt, dist, toP, face, move);
  else if (e.type === 'sentinel') updSentinel(e, adt, dist, toP, face, move);
  else if (e.type === 'oni') updOni(e, adt, dist, toP, face, move);
  else if (e.type === 'dragon') updDragon(e, adt);
  else updBrute(e, adt, dist, toP, face, move);
  applyFlash(e);
}
function updImp(e, dt, dist, toP, face, move){
  const Bd = e.body;
  if (e.state === 'hurt'){ Bd.rotation.x = -0.35; if (e.t <= 0) e.state = 'chase'; }
  else if (e.state === 'chase'){
    face(toP, 10); Bd.rotation.x = 0.1;
    if (!player.dead && dist > 0.95){ move(toP, e.speed); Bd.position.y = 0.52 + Math.abs(Math.sin(time * 9 + e.seed)) * 0.12; }
    if (!player.dead && dist < 1.8 && e.cd <= 0){ e.state = 'windup'; e.t = 0.45; play('impWarn'); }
  } else if (e.state === 'windup'){
    face(toP, 12); Bd.rotation.x = -0.45; Bd.position.y = 0.46; e.eye.c = Math.sin(time * 40) > 0 ? 0xff3030 : 0xffd23a;
    if (e.t <= 0){ e.state = 'lunge'; e.t = 0.24; e.dir = toP; e.hitOnce = false; e.eye.c = e.eye.base; }
  } else if (e.state === 'lunge'){
    move(e.dir, 7.5); face(e.dir, 20); Bd.rotation.x = 0.55; Bd.position.y = 0.62;
    if (!e.hitOnce && dist < e.r + 0.5 && hero.position.y < 0.9){ const r = hurtPlayer(10 * e.dm, e.g.position.x, e.g.position.z, 4); if (r !== 'dodge') e.hitOnce = true; }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.55; }
  } else if (e.state === 'recover'){
    Bd.rotation.x = 0.2; Bd.position.y = 0.52; if (e.t <= 0){ e.state = 'chase'; e.cd = 0.9 + rnd() * 0.7; }
  }
}
function updSentinel(e, dt, dist, toP, face, move){
  e.body.position.y = 1.35 + Math.sin(time * 2 + e.seed) * 0.1;
  e.ring.rotation.z += dt * (e.state === 'windup' ? 10 : 2);
  if (e.state === 'hurt'){ if (e.t <= 0) e.state = 'chase'; return; }
  face(toP, 6);
  if (e.state === 'chase'){
    if (!player.dead){
      if (dist > 5.4) move(toP, e.speed); else if (dist < 3.6) move(toP + Math.PI, e.speed * 1.1); else move(toP + e.side * Math.PI / 2, e.speed * 0.7);
    }
    if (rnd() < dt * 0.4) e.side *= -1;
    if (!player.dead && e.cd <= 0 && dist < 9){ e.state = 'windup'; e.t = 0.75; play('sentCharge'); }
  } else if (e.state === 'windup'){
    e.eyeG.scale.setScalar(1 + (0.75 - e.t) * 0.9);
    e.mats[2].c = Math.sin(time * 40) > 0 ? 0xff5ad8 : 0xfff2d0;
    if (e.t <= 0){ e.mats[2].c = e.mats[2].base; e.eyeG.scale.setScalar(1); fireOrb(e, toP); e.state = 'recover'; e.t = 0.35; }
  } else if (e.state === 'recover'){ if (e.t <= 0){ e.state = 'chase'; e.cd = 2.3 + rnd() * 1.3; } }
}
function updBrute(e, dt, dist, toP, face, move){
  const boss = e.type === 'boss';
  const walk = sp => { const a = sp ? Math.sin(time * sp) * 0.45 : 0; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; };
  const armsTo = x => { for (const A of e.arms) A.rotation.x = lerp(A.rotation.x, x, 1 - Math.exp(-dt * 10)); };
  e.tele.visible = false; e.body.position.x = 0;
  if (e.state === 'hurt'){ e.torso.rotation.x = -0.15; if (e.t <= 0){ e.state = 'chase'; e.torso.rotation.x = 0; } return; }
  if (e.state === 'chase'){
    face(toP, 5); e.torso.rotation.x = 0.08; armsTo(Math.sin(time * 3) * 0.2); e.body.position.y = 0;
    if (!player.dead && dist > e.r + 0.5){ move(toP, e.speed); walk(6); } else walk(0);
    if (player.dead) return;
    if (boss){
      e.bt -= dt;
      if (e.bt <= 0){
        const others = enemies.filter(o => o.alive && o !== e).length, r = rnd();
        if (r < 0.38){ e.chargesLeft = 1; e.state = 'windup'; e.t = 0.9; e.dir = toP; play('bruteWarn'); }
        else if (r < 0.75 || others >= 4){ e.state = 'crouch'; e.t = 0.55; play('roar'); }
        else { e.state = 'raise'; e.t = 0.9; play('roar'); }
      }
    } else if (dist < 5.5 && e.cd <= 0){ e.state = 'windup'; e.t = 0.9; e.dir = toP; play('bruteWarn'); }
  } else if (e.state === 'windup'){
    if (e.t > 0.3) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 6));
    face(e.dir, 20); e.body.position.x = (rnd() - 0.5) * 0.05; armsTo(-1.3); e.torso.rotation.x = -0.1;
    showTele(e, boss ? 6.8 : 5.6);
    if (e.t <= 0){ e.state = 'charge'; e.t = boss ? 0.55 : 0.6; e.hitOnce = false; play('charge'); }
  } else if (e.state === 'charge'){
    move(e.dir, boss ? 11.5 : 9.5); face(e.dir, 20); walk(16); armsTo(-1.5); e.torso.rotation.x = 0.35;
    if (!e.hitOnce && dist < e.r + 0.45 && hero.position.y < 1.0){ const r = hurtPlayer((boss ? 24 : 20) * e.dm, e.g.position.x, e.g.position.z, 8); if (r !== 'dodge') e.hitOnce = true; }
    if (rnd() < 0.5) puffAt(e.g.position.x, e.g.position.z, 1, 0.8);
    const rr = Math.hypot(e.g.position.x, e.g.position.z), wall = rr > ARENA - 0.25;
    if (e.t <= 0 || wall){
      if (boss && e.chargesLeft > 0 && !wall){ e.chargesLeft--; e.state = 'windup'; e.t = 0.55; e.dir = toP; }
      else { e.state = 'recover'; e.t = wall ? 1.5 : 1.0;
        if (wall){ shake = Math.max(shake, 0.2); play('wall'); sparks(e.g.position.x, 1.2 * e.scale, e.g.position.z, 8, 0xfff0a0); } }
    }
  } else if (e.state === 'recover'){
    face(toP, 2); armsTo(0.3); e.torso.rotation.x = 0.25; walk(0); e.body.position.y = 0;
    if (e.t <= 0){ e.state = 'chase'; e.cd = 2.0 + rnd() * 1.2; e.bt = 1.4 + rnd(); }
  } else if (e.state === 'crouch'){
    face(toP, 8); e.body.position.y = -0.08; armsTo(0.8);
    if (e.t <= 0){
      e.state = 'air'; e.t = 0.75; e.from = [e.g.position.x, e.g.position.z];
      let tx = hero.position.x, tz = hero.position.z; const r = Math.hypot(tx, tz); if (r > ARENA - 1){ tx *= (ARENA - 1) / r; tz *= (ARENA - 1) / r; }
      e.to = [tx, tz]; ringFx(tx, tz, 0xff3a2a, 2.4, 0.7, 0.75);
    }
  } else if (e.state === 'air'){
    const p = clamp(1 - e.t / 0.75, 0, 1);
    e.vx = e.vz = 0;
    e.g.position.x = lerp(e.from[0], e.to[0], p); e.g.position.z = lerp(e.from[1], e.to[1], p); e.g.position.y = Math.sin(p * Math.PI) * 3.2;
    armsTo(-2.6); e.body.position.y = 0;
    if (e.t <= 0){ e.g.position.y = 0; slamRing(e);
      if (dist < e.r + 0.6) hurtPlayer(26 * e.dm, e.g.position.x, e.g.position.z, 9);
      e.state = 'recover'; e.t = 1.1; }
  } else if (e.state === 'raise'){
    armsTo(-2.8); face(toP, 4); e.torso.rotation.x = -0.2;
    if (e.t <= 0){
      for (let k = 0; k < 2; k++){ const a = e.g.rotation.y + (k ? 1.2 : -1.2);
        let x = e.g.position.x + Math.sin(a) * 1.8, z = e.g.position.z + Math.cos(a) * 1.8; const r = Math.hypot(x, z);
        if (r > ARENA - 0.6){ x *= (ARENA - 0.6) / r; z *= (ARENA - 0.6) / r; }
        spawnEnemy('imp', [x, z]); }
      e.state = 'recover'; e.t = 0.6;
    }
  }
}
function separateEnemies(){
  for (let i = 0; i < enemies.length; i++){
    const a = enemies[i]; if (!a.alive || a.spawnT > 0 || a.type === 'dragon' || a.noSep) continue;
    for (let j = i + 1; j < enemies.length; j++){
      const b = enemies[j]; if (!b.alive || b.spawnT > 0 || b.type === 'dragon' || b.noSep) continue;
      const dx = b.g.position.x - a.g.position.x, dz = b.g.position.z - a.g.position.z, d = Math.hypot(dx, dz), m = a.r + b.r;
      if (d < m && d > 0.0001){ const o = (m - d) / 2, nx = dx / d, nz = dz / d;
        const wa = a.heavy && !b.heavy ? 0.2 : b.heavy && !a.heavy ? 1.8 : 1;
        a.g.position.x -= nx * o * wa; a.g.position.z -= nz * o * wa; b.g.position.x += nx * o * (2 - wa); b.g.position.z += nz * o * (2 - wa); }
    }
    // jugador (la voltereta atraviesa enemigos)
    if (state !== 'roll' && !(a.type === 'boss' && a.state === 'air')){
      const dx = a.g.position.x - hero.position.x, dz = a.g.position.z - hero.position.z, d = Math.hypot(dx, dz), m = a.r + 0.35;
      if (d < m && d > 0.0001){ const o = m - d, nx = dx / d, nz = dz / d;
        if (a.heavy){ hero.position.x -= nx * o; hero.position.z -= nz * o; } else { a.g.position.x += nx * o; a.g.position.z += nz * o; } }
    }
    const r = Math.hypot(a.g.position.x, a.g.position.z);
    if (!clampEnemyCh(a) && r > ARENA && !(a.type === 'boss' && a.state === 'air')){ a.g.position.x *= ARENA / r; a.g.position.z *= ARENA / r; }
    const bx = a.g.position.x - BRAZ.x, bz = a.g.position.z - BRAZ.z, bd = Math.hypot(bx, bz), br = 0.75 + a.r;
    if (braz.visible && bd < br && bd > 0.0001){ a.g.position.x = BRAZ.x + bx / bd * br; a.g.position.z = BRAZ.z + bz / bd * br; }
  }
}

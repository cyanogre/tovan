'use strict';
/* ---------- Mecánicas ---------- */
function spawnBot(){ if (!lvl('gunpla') || player.dead) return; for (const b of P6.bots) scene.remove(b.g); P6.bots.length = 0;
  const n = lvl('gunpla'); for (let k = 0; k < n; k++){ const a = rnd() * TAU, v = clampArena(new V3(hero.position.x + Math.cos(a) * 1.6, 0, hero.position.z + Math.sin(a) * 1.6), ARENA - 1);
    const g = mkBot(); g.position.copy(v); P6.bots.push({ g, t: 18, cd: 0.6 + k * 0.4, build: 0 }); for (let i = 0; i < 10; i++) spawnFx(v.x, 0.5, v.z, (rnd() - 0.5) * 3, 2, (rnd() - 0.5) * 3, rnd() < 0.5 ? 0x2a5ad8 : 0xf0f0f4, 0.07, 0.5, 6, 0); }
  tA.set(hero.position.x, hero.position.y + 2.5, hero.position.z); spawnNumber(tA, '¡Maqueta montada!', 'react', '#9fc8ff'); play('clonk'); }
const GADGETS = [['gorro', 'Gorrocóptero', 'Un salto más en el aire y caes despacio si mantienes saltar.'], ['encoge', 'Linterna encogedora', 'Los enemigos de esta oleada salen pequeños y con un 25 % menos de vida.'],
  ['guante', 'Guante de superfuerza', '+30 % de daño durante esta oleada.'], ['puerta', 'Puerta a cualquier parte', 'La primera vez que bajes del 25 % de PV, te escapas al otro lado de la arena.']];
function pickGadget(){ const g = GADGETS[Math.floor(rnd() * GADGETS.length)]; P6.gadget = g[0]; P6.doorUsed = false; P6.gadgetJ = 0;
  banner(`Bolsillo mágico: ¡${g[1]}!<small>${g[2]}</small>`, 1.8); play('tier'); }
const CARDS = ['Fuego', 'Agua', 'Viento', 'Escudo', 'Salto', 'Espada', 'Flor', 'Tiempo'];
function playCard(){
  const c = CARDS[Math.floor(rnd() * CARDS.length)], hx = hero.position.x, hz = hero.position.z, f = hero.rotation.y;
  const m = mesh(new THREE.PlaneGeometry(0.55, 0.82), cardMat, hx, hero.position.y + 2.6, hz); hzFx({ upd(dt){ this.t += dt; m.position.set(hero.position.x, hero.position.y + 2.6 + this.t * 0.4, hero.position.z); m.rotation.y += dt * 12; m.scale.setScalar(Math.max(0.01, 1 - Math.max(0, this.t - 0.8) * 3)); return this.t > 1.1; }, end(){ scene.remove(m); } });
  tA.set(hx, hero.position.y + 3.2, hz); spawnNumber(tA, `¡Carta ${c}!`, 'react', '#ff8ac8'); play('chargeLv2');
  if (c === 'Fuego') explode(hx, hz, 3.2, 0xff6a30, 40, { el: 'fire', kind: 'nova', knock: 5 });
  else if (c === 'Agua'){ for (let k = 0; k < 4; k++) waterWave(hx, hz, f + k * Math.PI / 2, 20); }
  else if (c === 'Viento'){ const g = new THREE.Group(); scene.add(g); g.position.set(hx + Math.sin(f) * 1.6, 0, hz + Math.cos(f) * 1.6);
    const mats = [makeMat(0xffffff, { emissive: 0.8, opacity: 0.45, side: THREE.DoubleSide }), makeMat(0xb8f0d8, { emissive: 0.8, opacity: 0.45, side: THREE.DoubleSide })]; const rings = [];
    for (let k = 0; k < 6; k++){ const r = mesh(new THREE.TorusGeometry(0.35 + k * 0.28, 0.06, 4, 14), mats[k % 2], 0, 0.2 + k * 0.42, 0, g); r.rotation.x = Math.PI / 2; rings.push(r); }
    tornados.push({ g, rings, mats, x: g.position.x, z: g.position.z, dir: f, t: 2.4, r: 2.6, pull: 4.5, tick: 0, lv: 1 }); }
  else if (c === 'Escudo'){ player.inv = Math.max(player.inv, 2.5); P6.shieldT = 2.5; play('block'); }
  else if (c === 'Salto'){ if (grounded && state === 'normal'){ vy = 11; grounded = false; P6.cardJump = true; play('jump'); } else explode(hx, hz, 2.4, 0xffd0e8, 30, { kind: 'impact', knock: 6 }); }
  else if (c === 'Espada'){ P6.cardCritT = 3; }
  else if (c === 'Flor'){ heal(Math.round(player.maxHp * 0.04)); for (let i = 0; i < 24; i++){ const a = rnd() * TAU; spawnFx(hx, 1.2, hz, Math.cos(a) * 3, 2 + rnd() * 2, Math.sin(a) * 3, rnd() < 0.5 ? 0xff9ac8 : 0xffffff, 0.08, 1, 3, 0); } }
  else if (c === 'Tiempo'){ slowT = Math.max(slowT, 1.5); flash('#ffd0e8', 0.25); }
}
function waterWave(hx, hz, f, base){
  if (P6.waterBusy) return; P6.waterBusy = true;
  try { const fX = Math.sin(f), fZ = Math.cos(f);
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
      const ex = e.g.position.x - hx, ez = e.g.position.z - hz, d = Math.max(0.001, Math.hypot(ex, ez));
      if (d - e.r < 4.6 && (ex * fX + ez * fZ) / d > 0.5) hitEnemy(e, rdmg(base), rnd() < up.crit, ex / d, ez / d, 6, 2, false, { src: 'aoe', el: 'ice', power: 0.8 }); }
    windArches(hx, hz, f, 0x4ab8ff); for (let i = 0; i < 12; i++){ const a = f + (rnd() - 0.5) * 0.8, sp = 4 + rnd() * 4; spawnFx(hx + fX, 0.6, hz + fZ, Math.sin(a) * sp, 1 + rnd() * 2, Math.cos(a) * sp, rnd() < 0.5 ? 0x4ab8ff : 0xdff6ff, 0.08, 0.5, 6, 0); }
    play('whoosh'); } finally { P6.waterBusy = false; }
}
function throwBallAt(e){
  const g = mkBall(); const from = new V3(hero.position.x, 1.4, hero.position.z), to = e.g.position.clone();
  hzFx({ upd(dt){ this.t += dt; const k = Math.min(1, this.t / 0.45); g.position.lerpVectors(from, to, k); g.position.y = lerp(1.4, 0.9 * e.scale, k) + Math.sin(k * Math.PI) * 1.6; g.rotation.x += dt * 14;
      if (k >= 1){ if (e.alive && !e.isBoss) captureEnemy(e); return true; } return false; }, end(){ scene.remove(g); } }); play('boomerang');
}
function captureEnemy(e){
  const x = e.g.position.x, z = e.g.position.z, cl = e.g.clone(true);
  cl.traverse(o => { if (o.isMesh) o.material = A6.ally; }); cl.scale.setScalar(e.scale); scene.add(cl); cl.position.set(x, 0, z);
  const ring = mesh(new THREE.RingGeometry(0.6, 0.75, 20), A6.ally, x, 0.06, z); ring.rotation.x = -Math.PI / 2;
  killEnemy(e); tA.set(x, 2.2, z); spawnNumber(tA, '¡Capturado!', 'react', '#8fd8ff'); play('tier'); ringFx(x, z, 0x8fd8ff, 0.3, 1.6, 0.4);
  P6.allies.push({ g: cl, ring, t: 12, cd: 0, r: e.r, sp: Math.max(2.6, e.speed || 2) * 1.2 });
}
function updAnime(dt, pdt, playing){
  if (!playing){ return; }
  const edt = pdt * (slowT > 0 ? 0.3 : 1) * (timeStopT > 0 ? 0 : 1) * (invActive ? 0 : 1);
  const hx = hero.position.x, hz = hero.position.z, any = enemies.some(e => e.alive && e.spawnT <= 0);
  for (const k of ['culCd', 'alchCd', 'toyaCd']) if (P6[k] > 0) P6[k] -= pdt;
  if (P6.cardCritT > 0) P6.cardCritT -= pdt; if (P6.shieldT > 0) P6.shieldT -= pdt; shieldM.visible = shieldM.visible || P6.shieldT > 0;
  // Linterna vampírica: sangre que vuela y número acumulado
  { const lsCap = player.maxHp * (0.07 + 0.03 * lvl('life')); P6.lsBudget = Math.min(lsCap, P6.lsBudget + lsCap * pdt); }
  P6.lsShowT -= pdt; if (P6.lsShowT <= 0 && P6.lsAcc >= 1){ P6.lsShowT = 0.55; tA.set(hx + 0.4, hero.position.y + 2.2, hz); spawnNumber(tA, '+' + Math.round(P6.lsAcc) + ' 🩸', 'heal', '#ff4a6a'); P6.lsAcc = 0; }
  if (P6.lsGlow > 0){ P6.lsGlow -= pdt * 2.5; M.crystal.uniforms.uColor.value.setHex(P6.lsGlow > 0 ? 0xff2a4a : 0x7ff5ff); if (rnd() < pdt * 30) spawnFx(hx + (rnd() - 0.5) * 0.7, 0.4 + rnd() * 1.4, hz + (rnd() - 0.5) * 0.7, 0, 1.2, 0, 0xff2a4a, 0.05, 0.5, -0.8, 0); }
  if (invActive || player.dead) return;
  // gadget
  if (P6.gadget === 'gorro' && !grounded && vy < -1.3 && jumpHeld() && state !== 'attack'){ vy = -1.3; if (rnd() < 0.4) spawnFx(hx, hero.position.y + 2.4, hz, (rnd() - 0.5) * 2, 0.5, (rnd() - 0.5) * 2, 0xffd23a, 0.05, 0.3, 0, 0); }
  if (P6.gadget === 'puerta' && !P6.doorUsed && player.hp > 0 && player.hp < player.maxHp * 0.25){ P6.doorUsed = true;
    const a = Math.atan2(hx, hz) + Math.PI, v = clampArena(new V3(Math.sin(a) * (ARENA - 1.5), 0, Math.cos(a) * (ARENA - 1.5)));
    ringFx(hx, hz, 0xff8ac8, 0.3, 1.5, 0.4); hero.position.x = v.x; hero.position.z = v.z; player.inv = Math.max(player.inv, 2); flash('#ffd0e8', 0.4); play('dash'); banner('¡Puerta a cualquier parte!', 1); }
  // bola de captura
  if (lvl('capture') && any){ P6.capT -= pdt; if (P6.capT <= 0){ let best = null; for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.isBoss || e.reach === false) continue;
        if (Math.hypot(e.g.position.x - hx, e.g.position.z - hz) > 8) continue; if (!best || e.hp / e.maxHp < best.hp / best.maxHp) best = e; }
      if (best){ P6.capT = Math.max(6, 16 - 4 * S10('capture')); throwBallAt(best); tA.set(hx, hero.position.y + 2.5, hz); spawnNumber(tA, '¡Te elijo a ti!', 'react', '#3ab86a'); } else P6.capT = 1; } }
  for (let i = P6.allies.length - 1; i >= 0; i--){ const A = P6.allies[i]; A.t -= edt; A.cd -= edt; const p = A.g.position;
    const t = nearestFrom(p.x, p.z, 12); if (t){ const a = angTo(p.x, p.z, t.g.position.x, t.g.position.z), d = Math.hypot(t.g.position.x - p.x, t.g.position.z - p.z);
      A.g.rotation.y = lerpAngle(A.g.rotation.y, a, 1 - Math.exp(-edt * 8)); if (d > t.r + A.r) { p.x += Math.sin(a) * A.sp * edt; p.z += Math.cos(a) * A.sp * edt; }
      else if (A.cd <= 0){ A.cd = 0.6; hitEnemy(t, rdmg(16), false, Math.sin(a), Math.cos(a), 3, 1, false, { src: 'aoe' }); sparks(t.g.position.x, 0.9, t.g.position.z, 6, 0x8fd8ff); play('hit'); } }
    p.y = Math.abs(Math.sin(time * 8 + i)) * 0.1; A.ring.position.set(p.x, 0.06, p.z);
    if (A.t <= 0){ ringFx(p.x, p.z, 0x8fd8ff, 0.3, 1.2, 0.3); tA.set(p.x, 2, p.z); spawnNumber(tA, '¡Vuelve!', 'react', '#8fd8ff'); scene.remove(A.g); scene.remove(A.ring); P6.allies.splice(i, 1); } }
  // rayo del Ultrahéroe
  if (lvl('kamen') && any){ P6.kamT -= pdt; if (P6.kamT <= 0){ const t = nearestFrom(hx, hz, 8); if (t){ P6.kamT = Math.max(3, 9 - 2.5 * (lvl('kamen') - 1)); const a = angTo(hx, hz, t.g.position.x, t.g.position.z), L = 8.5;
        const m = mesh(B(0.5, 0.5, L), A6.beam, hx + Math.sin(a) * L / 2, 1.1, hz + Math.cos(a) * L / 2); m.rotation.y = a;
        hzFx({ upd(dt){ this.t += dt; m.scale.set(1 - this.t * 3, 1 - this.t * 3, 1); return this.t > 0.3; }, end(){ scene.remove(m); } });
        for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue; const ex = e.g.position.x - hx, ez = e.g.position.z - hz, along = ex * Math.sin(a) + ez * Math.cos(a), side = Math.abs(ex * Math.cos(a) - ez * Math.sin(a));
          if (along > 0 && along < L && side < 0.6 + e.r) hitEnemy(e, rdmg(28 + 10 * lvl('kamen')), rnd() < up.crit, Math.sin(a), Math.cos(a), 4, 3, false, { src: 'beam', el: 'shock' }); }
        tA.set(hx, hero.position.y + 2.6, hz); spawnNumber(tA, '¡JA, JA, JA!', 'react', '#ffe86a'); play('beam'); lightFlash(hx, 1.5, hz, 0xffe86a, 2, 8); } else P6.kamT = 0.5; } }
  // cartas
  if (lvl('cards') && any){ P6.cardT -= pdt; if (P6.cardT <= 0){ P6.cardT = Math.max(4, 11 - 3 * S10('cards')); playCard(); } }
  if (P6.cardJump && grounded){ P6.cardJump = false; explode(hx, hz, 2.8, 0xff8ac8, 45, { kind: 'impact', knock: 6 }); }
  // perro gigante
  if (lvl('bigdog') && any){ P6.dogT -= pdt; if (P6.dogT <= 0){ let best = null; for (const e of enemies) if (e.alive && e.spawnT <= 0 && e.reach !== false && (!best || e.hp > best.hp)) best = e;
      if (best){ P6.dogT = Math.max(4, 10 - 2.5 * S10('bigdog')); const g = mkDog(), x = best.g.position.x, z = best.g.position.z; g.position.set(x, -2.5, z); g.rotation.y = angTo(x, z, hx, hz) + Math.PI;
        P6.dogs.push({ g, e: best, x, z, t: 0, bit: false }); play('roar'); } else P6.dogT = 1; } }
  for (let i = P6.dogs.length - 1; i >= 0; i--){ const D = P6.dogs[i]; D.t += edt; const U = D.g.userData;
    D.g.position.y = D.t < 0.35 ? lerp(-2.5, 0.6, D.t / 0.35) : D.t < 1.1 ? 0.6 : lerp(0.6, -2.6, (D.t - 1.1) / 0.4); U.jaw.rotation.x = D.t < 0.45 ? 0.7 : D.t < 0.6 ? lerp(0.7, -0.05, (D.t - 0.45) / 0.15) : -0.05;
    if (!D.bit && D.t >= 0.55){ D.bit = true; shake = Math.max(shake, 0.3); play('slam'); tA.set(D.x, 3, D.z); spawnNumber(tA, '¡ÑAM!', 'react', '#ffffff');
      if (D.e.alive){ hitEnemy(D.e, rdmg(90), true, 0, 0, 0, 4, false, { src: 'aoe' }); if (D.e.alive) stunE(D.e, 1.5); } puffAt(D.x, D.z, 10, 2, 0xf6f2ea); }
    if (D.t > 1.6){ scene.remove(D.g); P6.dogs.splice(i, 1); } }
  // ranas
  if (lvl('frogs') && any){ P6.frogT -= pdt; if (P6.frogT <= 0){ P6.frogT = Math.max(5, 10 - 2 * S10('frogs')); for (let k = 0; k < 2 + lvl('frogs'); k++){ const g = mkFrog(), a = rnd() * TAU; g.position.set(hx + Math.cos(a) * 0.8, 0, hz + Math.sin(a) * 0.8); P6.frogs.push({ g, t: 6, hop: 0, tgt: null, st: 'hop', lick: 0 }); } play('squeak'); tA.set(hx, hero.position.y + 2.6, hz); spawnNumber(tA, '¡Gero gero!', 'react', '#6ad84a'); } }
  for (let i = P6.frogs.length - 1; i >= 0; i--){ const F = P6.frogs[i]; F.t -= edt; const p = F.g.position, tg = F.g.userData.tg;
    if (!F.tgt || !F.tgt.alive) F.tgt = nearestFrom(p.x, p.z, 10);
    if (F.st === 'hop' && F.tgt){ const a = angTo(p.x, p.z, F.tgt.g.position.x, F.tgt.g.position.z), d = Math.hypot(F.tgt.g.position.x - p.x, F.tgt.g.position.z - p.z); F.g.rotation.y = a;
      F.hop += edt * 3; p.y = Math.abs(Math.sin(F.hop * Math.PI)) * 0.5; if (d > F.tgt.r + 1.4){ p.x += Math.sin(a) * 4.5 * edt; p.z += Math.cos(a) * 4.5 * edt; } else if (p.y < 0.1){ F.st = 'lick'; F.lick = 0; play('pew'); } }
    else if (F.st === 'lick'){ F.lick += edt; const d = F.tgt ? Math.hypot(F.tgt.g.position.x - p.x, F.tgt.g.position.z - p.z) : 1; tg.scale.z = Math.max(0.01, Math.sin(Math.min(1, F.lick / 0.35) * Math.PI) * d / 1.3);
      if (F.lick > 0.17 && !F.hit && F.tgt && F.tgt.alive){ F.hit = true; hitEnemy(F.tgt, rdmg(18 + 6 * lvl('frogs')), false, 0, 0, 1, 1, false, { src: 'aoe' }); if (F.tgt.alive) stunE(F.tgt, 0.8); tA.set(F.tgt.g.position.x, F.tgt.numY, F.tgt.g.position.z); spawnNumber(tA, '¡Lengüetazo!', 'react', '#ff8aa8'); }
      if (F.lick > 0.4){ F.st = 'hop'; F.hit = false; F.tgt = null; } }
    if (F.t <= 0){ puffAt(p.x, p.z, 4, 0.6, 0x5ac84a); scene.remove(F.g); P6.frogs.splice(i, 1); } }
  // maquetas
  for (let i = P6.bots.length - 1; i >= 0; i--){ const R_ = P6.bots[i]; R_.t -= edt; R_.cd -= edt; const p = R_.g.position, t = nearestFrom(p.x, p.z, 7.5);
    if (t){ R_.g.rotation.y = lerpAngle(R_.g.rotation.y, angTo(p.x, p.z, t.g.position.x, t.g.position.z), 1 - Math.exp(-edt * 8));
      if (R_.cd <= 0){ R_.cd = 0.9; R_.g.userData.gun.getWorldPosition(tA); bolt(tA.x, tA.y, tA.z, t.g.position.x, 0.9 * t.scale, t.g.position.z, 0x9fc8ff, 0.05); play('zap'); hitEnemy(t, rdmg(12), rnd() < 0.15, 0, 0, 1, 1, false, { src: 'bolt' }); } }
    if (R_.t <= 0){ puffAt(p.x, p.z, 6, 0.8, 0xf0f0f4); scene.remove(R_.g); P6.bots.splice(i, 1); } }
  // tiara lunar
  if (lvl('tiara') && any){ P6.tiaraT -= pdt; if (P6.tiaraT <= 0){ P6.tiaraT = Math.max(2.2, 6 - 1.8 * (lvl('tiara') - 1)); const t = nearestFrom(hx, hz, 9), a = t ? angTo(hx, hz, t.g.position.x, t.g.position.z) : hero.rotation.y;
      const g = mkTiara(); g.position.set(hx, 1.1, hz); P6.tiaras.push({ g, a, d: 0, back: false, hitA: new Set(), hitB: new Set(), t: 0 }); if (!P6.moonSaid){ P6.moonSaid = true; tA.set(hx, hero.position.y + 2.6, hz); spawnNumber(tA, '¡En el nombre de la Luna!', 'react', '#ffd84a'); } play('boomerang'); } }
  for (let i = P6.tiaras.length - 1; i >= 0; i--){ const T = P6.tiaras[i], p = T.g.position; T.t += edt; T.g.rotation.z += edt * 18;
    if (!T.back){ const sp = 13; T.a += edt * 0.6; p.x += Math.sin(T.a) * sp * edt; p.z += Math.cos(T.a) * sp * edt; T.d += sp * edt; if (T.d > 7.5 || Math.hypot(p.x, p.z) > ARENA + 0.5) T.back = true; }
    else { const dx = hero.position.x - p.x, dz = hero.position.z - p.z, d = Math.max(0.001, Math.hypot(dx, dz)); p.x += dx / d * Math.min(d, 15 * edt); p.z += dz / d * Math.min(d, 15 * edt); if (d < 0.6 || T.t > 4){ scene.remove(T.g); P6.tiaras.splice(i, 1); continue; } }
    const set = T.back ? T.hitB : T.hitA;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || set.has(e)) continue; if (Math.hypot(e.g.position.x - p.x, e.g.position.z - p.z) - e.r < 0.45){ set.add(e); hitEnemy(e, rdmg(20 + 6 * lvl('tiara')), rnd() < up.crit, 0, 0, 1.5, 1, false, { src: 'orbital' }); } }
    if (rnd() < 0.6) spawnFx(p.x, p.y, p.z, 0, 0.3, 0, rnd() < 0.5 ? 0xffd84a : 0xffffff, 0.05, 0.3, 0, 0); }
  // bolitas de hollín
  for (let i = P6.soots.length - 1; i >= 0; i--){ const S_ = P6.soots[i]; S_.t -= edt;
    if (!S_.on){ if (!S_.tgt || !S_.tgt.alive) S_.tgt = nearestFrom(S_.m.position.x, S_.m.position.z, 6);
      if (S_.tgt){ const a = angTo(S_.m.position.x, S_.m.position.z, S_.tgt.g.position.x, S_.tgt.g.position.z); S_.m.position.x += Math.sin(a) * 5 * edt; S_.m.position.z += Math.cos(a) * 5 * edt; S_.m.position.y = 0.15 + Math.abs(Math.sin(time * 20 + i)) * 0.12;
        if (Math.hypot(S_.tgt.g.position.x - S_.m.position.x, S_.tgt.g.position.z - S_.m.position.z) < S_.tgt.r + 0.1){ S_.on = S_.tgt; S_.t = 3; S_.tick = 0; } } }
    else { const e = S_.on; if (!e.alive){ S_.t = 0; } else { S_.m.position.set(e.g.position.x + Math.sin(time * 9 + i) * e.r * 0.8, 0.5 * e.scale + Math.cos(time * 7 + i) * 0.2, e.g.position.z + Math.cos(time * 9 + i) * e.r * 0.8);
        S_.tick -= edt; if (S_.tick <= 0){ S_.tick = 0.5; hitEnemy(e, rdmg(3 + 2 * lvl('soot')), false, 0, 0, 0, 0, false, { src: 'dot' }); applyStatus(e, 'ice', 0.25); if (rnd() < 0.3) applyStatus(e, 'fire', 0.5); } } }
    if (S_.t <= 0){ puffAt(S_.m.position.x, S_.m.position.z, 2, 0.4, 0x2a2a30); scene.remove(S_.m); P6.soots.splice(i, 1); } }
  // ¡BAN-KAI!
  if (P6.bankaiT > 0){ P6.bankaiT -= pdt; staff.scale.setScalar(P6.bankaiT > 0 ? 1.55 : 1); staffTip.getWorldPosition(tA);
    if (rnd() < pdt * 40) spawnFx(tA.x + (rnd() - 0.5) * 0.6, tA.y + (rnd() - 0.5) * 0.6, tA.z + (rnd() - 0.5) * 0.6, 0, 1, 0, rnd() < 0.6 ? 0x16141a : 0xff2a3a, 0.09, 0.5, -1, 0); }
  // Campo AT
  if (lvl('atfield') && !P6.atReady){ P6.atT -= pdt; if (P6.atT <= 0){ P6.atReady = true; tA.set(hx, hero.position.y + 2.4, hz); spawnNumber(tA, 'Campo AT listo', 'react', '#ff9a2a'); } }
  for (let i = P6.hexes.length - 1; i >= 0; i--){ const H = P6.hexes[i]; H.t -= pdt; H.m.material.uniforms.uOpacity.value = Math.max(0, H.t * 1.4); H.m.scale.setScalar(1 + (0.5 - H.t) * 0.6); if (H.t <= 0){ scene.remove(H.m); P6.hexes.splice(i, 1); } }
  // corte de nuca: ahora es una maniobra con ganchos (js/poderes/corte-nuca.js)
}
const _v3UpdateA6 = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateA6(dt, pdt, playing); try { updAnime(dt, pdt, playing); } catch (err) { console.error(err); } };

/* ---------- Ganchos ---------- */
const _cosDmgMulA6 = cosDmgMul;
cosDmgMul = function(e, src){ let m = _cosDmgMulA6(e, src); if (src === 'dot') return m;
  if (e.tauntT > time) m *= 1.25;
  if (P6.milk && lvl('strawberry')) m *= 1.2 + 0.15 * S10('strawberry');
  if (P6.gadget === 'guante' && lvl('pocket')) m *= 1.3 + 0.2 * S10('pocket');
  if (P6.bankaiT > 0 && src === 'melee') m *= 1.5 + 0.25 * S10('bankai');
  return m; };
const _cosRangeA6 = cosRange;
cosRange = function(mv){ let r = _cosRangeA6(mv); if (mv && !mv.special && lvl('gomu')) r *= 1.3 + 0.15 * S10('gomu'); if (P6.bankaiT > 0) r *= 1.3; return r; };
const _knockMulA6 = knockMul;
knockMul = function(){ return _knockMulA6() * (lvl('gomu') && state === 'attack' && curMove && curMove.slam ? 2 : 1); };
const _rollMulA6 = rollMul;
rollMul = function(){ return _rollMulA6(); };   // (el Corte de nuca ya no alarga la voltereta)
const _rollDamageA6 = rollDamage;
rollDamage = function(mv){ const [v, c] = _rollDamageA6(mv); if (P6.cardCritT > 0 && !c) return [Math.round(v * critMul()), true]; return [v, c]; };
const _hitEnemyA6 = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  const src = o.src || (melee ? 'melee' : 'other'), wasAlive = e.alive;
  if (src === 'melee' && P6.janReady && wasAlive){ P6.janReady = false; val *= 3; crit = true; const x = e.g.position.x, z = e.g.position.z;
    tA.set(x, e.numY + 0.6, z); spawnNumber(tA, '¡PIEDRA!', 'react', '#ffc070'); later(0.05, () => explode(x, z, 1.9, 0xffc070, 40, { kind: 'impact', knock: 6 })); shake = Math.max(shake, 0.35); }
  const ok = _hitEnemyA6(e, val, crit, nx, nz, knock, meterGain, melee, o);
  if (!ok) return ok;
  if (src === 'melee'){
    // Linterna vampírica
    if (P6.ls > 0 && P6.lsBudget >= 0.5){ const h = Math.min(P6.ls, P6.lsBudget); P6.lsBudget -= h; const before = player.hp; heal(h, true); P6.lsAcc += player.hp - before; P6.lsGlow = 1;
      const x = e.g.position.x, y = 0.9 * e.scale, z = e.g.position.z; staffTip.getWorldPosition(tB);
      for (let i = 0; i < 6; i++){ const k = 2.6 + rnd() * 0.8; spawnFx(x + (rnd() - 0.5) * 0.3, y + (rnd() - 0.5) * 0.3, z + (rnd() - 0.5) * 0.3, (tB.x - x) * k, (tB.y - y) * k + 1, (tB.z - z) * k, i % 2 ? 0xff2a4a : 0xc8001e, 0.11, 0.36, 4, 0); }
      if (time - (P6.lsBoltT || 0) > 0.14){ P6.lsBoltT = time; bolt(x, y, z, tB.x, tB.y, tB.z, 0xff1a3a, 0.035); }
      if (time - (P6.lsRingT || 0) > 0.45){ P6.lsRingT = time; ringFx(hero.position.x, hero.position.z, 0xff2a4a, 0.5, 1.2, 0.3); } }
    if (lvl('toya') && P6.toyaCd <= 0 && e.alive && rnd() < 0.12 + 0.08 * S10('toya')){ P6.toyaCd = 0.3; const v2 = Math.round(val * (1.5 + 0.5 * S10('toya')));
      later(0.12, () => { if (!e.alive) return; _hitEnemyA6(e, v2, true, nx, nz, knock, 1, false, { src: 'aoe' }); tA.set(e.g.position.x, e.numY + 0.5, e.g.position.z); spawnNumber(tA, '¡LAGO TOYA!', 'react', '#d8a060');
        tB.set(e.g.position.x, 1, e.g.position.z); slashFx(tB, rnd() * TAU, 0xd8a060, 2.4); play('clonk'); }); }
    if (lvl('jan') && !P6.janReady){ P6.janN++; if (P6.janN >= Math.max(5, 12 - 3 * S10('jan'))){ P6.janN = 0; P6.janReady = true; tA.set(hero.position.x, hero.position.y + 2.5, hero.position.z); spawnNumber(tA, '✊ ¡Jan… ken…!', 'react', '#ffc070'); } }
    if (lvl('waterBreath') && !P6.waterBusy){ P6.wbN = (P6.wbN || 0) + 1; if (P6.wbN >= Math.max(2, 4 - S10('waterBreath'))){ P6.wbN = 0; const f = hero.rotation.y; later(0.02, () => waterWave(hero.position.x, hero.position.z, f, 18 + 8 * lvl('waterBreath'))); } }
  }
  return ok;
};
const _killEnemyA6 = killEnemy;
killEnemy = function(e){ const was = e.alive; _killEnemyA6(e);
  if (was && lvl('soot') && !e.isBoss && P6.soots.length < 16 && rnd() < 0.35 + 0.15 * lvl('soot')) for (let k = 0; k < 2; k++){
    const m = mesh(new THREE.IcosahedronGeometry(0.11, 0), A6.soot, e.g.position.x + (rnd() - 0.5) * 0.5, 0.2, e.g.position.z + (rnd() - 0.5) * 0.5); m.scale.setScalar(0.8 + rnd() * 0.5);
    P6.soots.push({ m, t: 4, on: null, tgt: null, tick: 0 }); } };
const _hurtPlayerA6 = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){
  const rolling = state === 'roll';
  dmg *= 1.15;                                                // todo pega un poco más fuerte
  if (lvl('atfield') && P6.atReady && canAct() && player.inv <= 0 && !rolling && !(state === 'tech' && tech && tech.inv)){
    P6.atReady = false; P6.atT = Math.max(3, 9 - 2.5 * S10('atfield')); player.inv = 0.5; const a = Math.atan2(sx - hero.position.x, sz - hero.position.z);
    const m = mesh(new THREE.CircleGeometry(1.2, 6), A6.hex, hero.position.x + Math.sin(a) * 0.9, 1.1, hero.position.z + Math.cos(a) * 0.9); m.rotation.y = a; m.rotation.z = Math.PI / 6;
    P6.hexes.push({ m, t: 0.5 }); play('block'); tA.set(hero.position.x, hero.position.y + 2.5, hero.position.z); spawnNumber(tA, '¡Campo AT!', 'react', '#ff9a2a'); return 'dodge'; }
  const res = _hurtPlayerA6(dmg, sx, sz, knock);
  if (res === 'hit') P6.milk = false;
  if (res === 'dodge' && rolling && lvl('culito') && P6.culCd <= 0){ P6.culCd = Math.max(1, 3 - S10('culito'));
    for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue; if (Math.hypot(e.g.position.x - hero.position.x, e.g.position.z - hero.position.z) - e.r < 3.2){ stunE(e, 1.3); e.tauntT = time + 3; } }
    tA.set(hero.position.x, hero.position.y + 2.6, hero.position.z); spawnNumber(tA, '¡Culito, culito!', 'react', '#ffb0c8'); play('squeak');
    for (let i = 0; i < 12; i++){ const a = rnd() * TAU; spawnFx(hero.position.x, 0.9, hero.position.z, Math.cos(a) * 2.5, 1.5, Math.sin(a) * 2.5, rnd() < 0.5 ? 0xff9ac8 : 0xffe24a, 0.07, 0.6, 3, 0); } }
  return res;
};
const _onRollStartA6 = onRollStart;
onRollStart = function(){ _onRollStartA6(); P6.titanSet.clear(); };
const _onSpecialA6 = onSpecial;
onSpecial = function(){ _onSpecialA6();
  if (lvl('bankai')){ P6.bankaiT = 8 + 3 * S10('bankai'); banner('¡BAN-KAI!', 1); flash('#2a0a10', 0.5); shake = Math.max(shake, 0.4); play('roar'); }
  if (lvl('diamond')){ const hx = hero.position.x, hz = hero.position.z; play('freeze'); ringFx(hx, hz, 0xdff6ff, 0.4, 5, 0.5); tA.set(hx, hero.position.y + 2.8, hz); spawnNumber(tA, '¡Polvo de diamantes!', 'react', '#dff6ff');
    for (let i = 0; i < 40; i++){ const a = rnd() * TAU, r = rnd() * 5; spawnFx(hx + Math.cos(a) * r, 0.3 + rnd() * 2, hz + Math.sin(a) * r, -Math.sin(a) * 3, 0.5, Math.cos(a) * 3, rnd() < 0.5 ? 0xffffff : 0xbfefff, 0.06, 0.8, 0, 0); }
    for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue; if (Math.hypot(e.g.position.x - hx, e.g.position.z - hz) - e.r < 5 + 1.5 * S10('diamond')){ if (e.isBoss) applyStatus(e, 'ice', 2 + S10('diamond')); else freezeEnemy(e, 2 + S10('diamond')); } } }
};
const _onLandingA6 = onLanding;
onLanding = function(){ _onLandingA6();
  if (lvl('alchemy') && P6.alchCd <= 0){ P6.alchCd = 1.2; const hx = hero.position.x, hz = hero.position.z, hit = new Set(); play('clonk'); play('slam'); shake = Math.max(shake, 0.25);
    tA.set(hx, hero.position.y + 2.4, hz); spawnNumber(tA, '👏', 'react', '#ffc070');
    for (let k = 0; k < 4; k++){ const a = hero.rotation.y + k * Math.PI / 2; for (let d = 0.8; d <= 3.4 + 1.3 * S10('alchemy'); d += 0.65){ const x = hx + Math.sin(a) * d, z = hz + Math.cos(a) * d;
        const s = mesh(new THREE.ConeGeometry(0.22, 1.1, 5), rockMat5, x, -0.6, z); hzFx({ upd(dt){ this.t += dt; s.position.y = this.t < 0.1 ? lerp(-0.6, 0.45, this.t / 0.1) : this.t > 0.5 ? lerp(0.45, -0.7, (this.t - 0.5) / 0.25) : 0.45; return this.t > 0.75; }, end(){ scene.remove(s); } });
        for (const e of enemies){ if (!e.alive || e.spawnT > 0 || hit.has(e)) continue; if (Math.hypot(e.g.position.x - x, e.g.position.z - z) - e.r < 0.5){ hit.add(e); hitEnemy(e, rdmg(26), rnd() < up.crit, Math.sin(a), Math.cos(a), 4, 2, false, { src: 'aoe' }); } } } } }
};
const _doJumpA6 = doJump;
doJump = function(){ if (!invActive && !grounded && P6.gadget === 'gorro' && lvl('pocket') && P6.gadgetJ < 1 && canAct() && state !== 'roll' && state !== 'attack'){ P6.gadgetJ++; vy = 7.4; play('boing'); return; } _doJumpA6(); if (grounded === false && hero.position.y < 0.05) P6.gadgetJ = 0; };
const _startWaveA6 = startWave;
startWave = function(n){ _startWaveA6(n); if (lvl('strawberry')) P6.milk = true; if (lvl('pocket')) pickGadget(); if (lvl('gunpla')) spawnBot(); P6.gadgetJ = 0; };
const _cosWaveClearA6 = cosWaveClear;
cosWaveClear = function(){ _cosWaveClearA6(); stat('wavesClr'); };
const _spawnEnemyA6 = spawnEnemy;
spawnEnemy = function(type, at){ const e = _spawnEnemyA6(type, at); if (e && !e.isBoss && P6.gadget === 'encoge' && lvl('pocket')){ e.hp = e.maxHp = Math.round(e.maxHp * 0.75); e.scale *= 0.8; e.r *= 0.85; e.numY *= 0.8; } return e; };
function clearA6(){
  for (const A of P6.allies){ scene.remove(A.g); scene.remove(A.ring); } P6.allies.length = 0; for (const D of P6.dogs) scene.remove(D.g); P6.dogs.length = 0;
  for (const F of P6.frogs) scene.remove(F.g); P6.frogs.length = 0; for (const R_ of P6.bots) scene.remove(R_.g); P6.bots.length = 0; for (const T of P6.tiaras) scene.remove(T.g); P6.tiaras.length = 0;
  for (const S_ of P6.soots) scene.remove(S_.m); P6.soots.length = 0; for (const H of P6.hexes) scene.remove(H.m); P6.hexes.length = 0;
  P6.bankaiT = 0; staff.scale.setScalar(1); M.crystal.uniforms.uColor.value.setHex(0x7ff5ff); P6.lsGlow = 0;
}
const _clearWorldA6 = clearWorld;
clearWorld = function(){ _clearWorldA6(); clearA6(); };
const _startRunA6 = startRun;
startRun = function(){ Object.assign(P6, { capT: 8, kamT: 6, cardT: 8, cardCritT: 0, cardJump: false, milk: false, dogT: 6, frogT: 5, tiaraT: 4, gadget: null, gadgetJ: 0, doorUsed: false, janN: 0, janReady: false,
  alchCd: 0, bankaiT: 0, atReady: true, atT: 0, ls: 0, lsBudget: 0, lsAcc: 0, culCd: 0, toyaCd: 0, wbN: 0, moonSaid: false, shieldT: 0 }); _startRunA6(); };
TTIPS.push('Hay poderes «inspirados» en muchos animes. Míralos en «Poderes» y descubre cómo se desbloquean.', 'Sin desbloquear cosas el juego es duro: cada partida suma estadísticas que abren poderes nuevos.');

'use strict';
/* ---------- Efectos del especial ---------- */
const meteorMat = makeMat(0xff7a2a, { emissive: 1 }), holeMat = makeMat(0x05020a), holeRing = makeMat(0xa86aff, { emissive: 1, opacity: 0.8, side: THREE.DoubleSide });
function specialExtras(){
  if (lvl('meteor')) for (let i = 0; i < 8 + 5 * S10('meteor'); i++) later(0.25 + i * 0.12, () => {
    const live = enemies.filter(e => e.alive && e.spawnT <= 0); let x, z;
    if (live.length){ const e = live[Math.floor(rnd() * live.length)]; x = e.g.position.x + (rnd() - 0.5); z = e.g.position.z + (rnd() - 0.5); }
    else { const a = rnd() * TAU, r = rnd() * 5; x = hero.position.x + Math.cos(a) * r; z = hero.position.z + Math.sin(a) * r; }
    const m = mesh(new THREE.DodecahedronGeometry(0.35, 0), meteorMat, x + 3, 11, z - 3); P5.flyers.push({ meteor: true, m, x, z, t: 0, dur: 0.45 }); play('fireball'); });
  if (lvl('blackhole')){
    const fX = Math.sin(hero.rotation.y), fZ = Math.cos(hero.rotation.y), v = clampArena(new V3(hero.position.x + fX * 2.5, 0, hero.position.z + fZ * 2.5));
    const g = new THREE.Group(); scene.add(g); g.position.set(v.x, 1.2, v.z);
    mesh(new THREE.IcosahedronGeometry(0.55, 1), holeMat, 0, 0, 0, g);
    const r1 = mesh(new THREE.RingGeometry(0.7, 1.25, 24), holeRing, 0, 0, 0, g); r1.rotation.x = -Math.PI / 2 + 0.3;
    P5.holes.push({ g, r1, x: v.x, z: v.z, t: 2.5 + S10('blackhole'), tick: 0 }); play('kameCharge'); flash('#2a0a4a', 0.4);
  }
}

/* ---------- Objetos de los poderes ---------- */
const parcelMat = makeMat(0xc8925a), tapeMat = makeMat(0xe8d8a0), peelMat = makeMat(0xffd84a), peelTip = makeMat(0x5a4020), candyMats = [0xff6aa8, 0x6ad8ff, 0xffd84a, 0x8aff8a].map(c => makeMat(c, { emissive: 0.5 }));
const trail5Mat = makeMat(0xfff27a, { emissive: 1, opacity: 0.7 }), trail5Geo = new THREE.PlaneGeometry(0.5, 0.5); trail5Geo.rotateX(-Math.PI / 2);
const markMat = makeMat(0xff4a3a, { emissive: 1, opacity: 0.9 }), lightMat5 = makeMat(0xffe9a0, { emissive: 1, opacity: 0.85 });
const vanWhite = makeMat(0xf4f0e8), vanBrown = makeMat(0xb0703a), vanDark = makeMat(0x1a1a22), vanGlass = makeMat(0x6ab0e8, { emissive: 0.4 });
const p5Tele = makeMat(0xffd060, { emissive: 1, opacity: 0.45 });
function makeParcel(x, z){
  const g = new THREE.Group(); scene.add(g); g.position.set(x, 0, z); g.rotation.y = rnd() * TAU;
  mesh(B(0.42, 0.32, 0.42), parcelMat, 0, 0.16, 0, g); mesh(B(0.44, 0.06, 0.1), tapeMat, 0, 0.3, 0, g); mesh(B(0.1, 0.06, 0.44), tapeMat, 0, 0.3, 0, g);
  return g;
}
function makePeel(x, z){
  const g = new THREE.Group(); scene.add(g); g.position.set(x, 0.05, z); g.rotation.y = rnd() * TAU;
  for (let i = 0; i < 4; i++){ const p = mesh(new THREE.ConeGeometry(0.1, 0.42, 4), peelMat, 0, 0.04, 0, g); p.rotation.set(Math.PI / 2 - 0.35, i / 4 * TAU, 0); p.position.set(Math.sin(i / 4 * TAU) * 0.16, 0.04, Math.cos(i / 4 * TAU) * 0.16); }
  mesh(new THREE.IcosahedronGeometry(0.09, 0), peelMat, 0, 0.07, 0, g); mesh(B(0.05, 0.08, 0.05), peelTip, 0, 0.14, 0, g);
  return g;
}
function makeVan(){
  const g = new THREE.Group(); scene.add(g);
  mesh(B(1.5, 1.2, 2.6), vanWhite, 0, 0.85, -0.2, g); mesh(B(1.5, 0.9, 1.0), vanWhite, 0, 0.7, 1.45, g); mesh(B(1.3, 0.5, 0.05), vanGlass, 0, 1.0, 1.96, g);
  mesh(B(1.52, 0.3, 2.62), vanBrown, 0, 0.75, -0.2, g);
  for (const sx of [-0.76, 0.76]) for (const sz of [-1.0, 1.3]){ const w = mesh(C(0.3, 0.3, 0.2, 10), vanDark, sx, 0.3, sz, g); w.rotation.z = Math.PI / 2; }
  return g;
}
function dropCandy(x, z){
  if (P5.candies.length > 14) return;
  const m = mesh(new THREE.IcosahedronGeometry(0.13, 0), candyMats[Math.floor(rnd() * candyMats.length)], x, 1.2, z);
  const a = rnd() * TAU; P5.candies.push({ m, vx: Math.cos(a) * 2.2, vy: 4, vz: Math.sin(a) * 2.2, t: 0 }); play('cash');
}
function clearP5(){
  for (const p of P5.parcels) scene.remove(p.g); P5.parcels.length = 0;
  for (const p of P5.peels) scene.remove(p.g); P5.peels.length = 0;
  for (const v of P5.vans){ scene.remove(v.g); if (v.c) scene.remove(v.c); } P5.vans.length = 0;
  for (const s of P5.trail) scene.remove(s.m); P5.trail.length = 0;
  for (const c of P5.candies) scene.remove(c.m); P5.candies.length = 0;
  for (const h of P5.holes) scene.remove(h.g); P5.holes.length = 0;
  for (const f of P5.flyers) if (f.m) scene.remove(f.m); P5.flyers.length = 0;
  if (P5.markM) P5.markM.visible = false; P5.mark = null; P5.ghostT = 0; P5.ghostCrit = false; P5.blizOn = 0;
}
const _clearWorld5 = clearWorld;
clearWorld = function(){ _clearWorld5(); clearP5(); };
const _startRun5 = startRun;
startRun = function(){
  Object.assign(P5, { rollT: -9, parcelT: 6, vanT: 10, airJ: 0, lastAct: 0, siestaAcc: 0, frostCd: 0, retCd: 0, blizT: 9, blizOn: 0, trailT: 0, trailTick: 0, cshCd: 0, keepCombo: false,
    ghostT: 0, ghostCd: 0, ghostCrit: false, banT: 4, lumT: 2, midasCd: 0, btCd: 0, swUsed: false, waveKills: 0, hits: 0, minor: {}, newRun: [], starFight: false, starHurt: 0 });
  _startRun5();
};

/* ---------- Bucle de los poderes ---------- */
function p5Update(dt, pdt, playing){
  P5.chkT -= dt; if (P5.chkT <= 0){ P5.chkT = 1.2; checkPowers(); hardAchCheck(); }
  if (!playing){ if (P5.markM) P5.markM.visible = false; return; }
  const edt = pdt * (slowT > 0 ? 0.3 : 1) * (timeStopT > 0 ? 0 : 1) * (invActive ? 0 : 1);
  const hx = hero.position.x, hz = hero.position.z, live = !player.dead;
  for (const k of ['frostCd', 'retCd', 'cshCd', 'ghostCd', 'midasCd', 'btCd']) if (P5[k] > 0) P5[k] -= pdt;
  if (grounded) P5.airJ = 0;
  if (bossE && bossE.type === 'star' && bossE.alive && !P5.starFight && bossE.hp > bossE.maxHp * 0.98){ P5.starFight = true; P5.starHurt = 0; }
  // modo fantasma
  if (P5.ghostT > 0){ P5.ghostT -= pdt; if (!invActive) hero.visible = P5.ghostT <= 0 || Math.sin(time * 32) > -0.2; if (P5.ghostT <= 0 && !invActive) hero.visible = true; }
  // siesta
  if (lvl('siesta') && live && time - P5.lastAct > 1.5 && state === 'normal' && player.hp < player.maxHp){
    P5.siestaAcc += player.maxHp * (0.02 + 0.01 * S10('siesta')) * pdt; if (P5.siestaAcc >= 1){ const n = Math.floor(P5.siestaAcc); P5.siestaAcc -= n; heal(n, true); }
    if (rnd() < pdt * 1.5){ tA.set(hx + 0.3, hero.position.y + 2.3, hz); spawnNumber(tA, 'z', 'react', '#c8d8ff'); } }
  if (invActive || player.dead) return;
  // paquetes
  if (lvl('parcel') && enemies.some(e => e.alive)){ P5.parcelT -= pdt;
    if (P5.parcelT <= 0 && P5.parcels.length < 3 + lvl('parcel')){ P5.parcelT = Math.max(2.4, 7 - 1.45 * (lvl('parcel') - 1)); P5.parcels.push({ g: makeParcel(hx, hz), t: 5, arm: 0.5 }); play('land'); } }
  for (let i = P5.parcels.length - 1; i >= 0; i--){ const p = P5.parcels[i]; p.t -= edt; p.arm -= edt;
    const touch = p.arm <= 0 && enemies.some(e => e.alive && e.spawnT <= 0 && Math.hypot(e.g.position.x - p.g.position.x, e.g.position.z - p.g.position.z) < e.r + 0.45);
    if (p.t < 1) p.g.scale.setScalar(1 + Math.abs(Math.sin(time * 20)) * 0.15);
    if (touch || p.t <= 0){ explode(p.g.position.x, p.g.position.z, 1.9, 0xe0a860, 34 + 14 * lvl('parcel'), { kind: 'impact', knock: 5 }); scene.remove(p.g); P5.parcels.splice(i, 1); } }
  // pieles de plátano
  if (lvl('bananas') && enemies.some(e => e.alive)){ P5.banT -= pdt; if (P5.banT <= 0 && P5.peels.length < 5){ P5.banT = Math.max(1.8, 5 - 1.5 * S10('bananas')); P5.peels.push({ g: makePeel(hx, hz), t: 12, arm: 0.6 }); } }
  for (let i = P5.peels.length - 1; i >= 0; i--){ const p = P5.peels[i]; p.t -= edt; p.arm -= edt; let used = p.t <= 0;
    if (!used && p.arm <= 0) for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.isBoss || e.fly) continue;
      if (Math.hypot(e.g.position.x - p.g.position.x, e.g.position.z - p.g.position.z) < e.r + 0.3){ used = true; stunE(e, 1.4); e.g.rotation.y += 2.5;
        hitEnemy(e, rdmg(18 + 8 * lvl('bananas')), false, 0, 0, 0, 2, false, { src: 'aoe' }); tA.set(e.g.position.x, e.numY + 0.4, e.g.position.z); spawnNumber(tA, '¡Plaf!', 'react', '#ffd84a'); play('squeak'); break; } }
    if (used){ scene.remove(p.g); P5.peels.splice(i, 1); } }
  // Lumen dispara
  if (lvl('lumen')){ P5.lumT -= pdt; if (P5.lumT <= 0){ const e = nearestFrom(hx, hz, 8);
      if (e){ P5.lumT = Math.max(0.7, 2.5 - 0.55 * (lvl('lumen') - 1)); staffTip.getWorldPosition(tA); bolt(tA.x, tA.y, tA.z, e.g.position.x, 0.9 * e.scale, e.g.position.z, 0xffe9a0, 0.07); play('zap');
        hitEnemy(e, rdmg(12 + 5 * lvl('lumen')), rnd() < up.crit, 0, 0, 1, 1, false, { src: 'bolt' }); } else P5.lumT = 0.4; } }
  // seguimiento
  if (lvl('tracking')){
    if (!P5.mark || !P5.mark.alive){ let best = null; for (const e of enemies) if (e.alive && e.spawnT <= 0 && (!best || e.hp > best.hp)) best = e; P5.mark = best; }
    if (!P5.markM){ P5.markM = new THREE.Group(); scene.add(P5.markM); const r = mesh(new THREE.TorusGeometry(0.32, 0.04, 4, 14), markMat, 0, 0, 0, P5.markM); r.rotation.x = Math.PI / 2;
      const c = mesh(new THREE.ConeGeometry(0.14, 0.3, 4), markMat, 0, 0.35, 0, P5.markM); c.rotation.x = Math.PI; }
    P5.markM.visible = !!P5.mark; if (P5.mark){ P5.markM.position.set(P5.mark.g.position.x, P5.mark.numY + 0.6 + Math.sin(time * 5) * 0.08, P5.mark.g.position.z); P5.markM.rotation.y += pdt * 3; }
  } else if (P5.markM) P5.markM.visible = false;
  // furgoneta celestial
  if (lvl('deliveryGod') && enemies.some(e => e.alive && e.spawnT <= 0)){ P5.vanT -= pdt;
    if (P5.vanT <= 0){ P5.vanT = Math.max(5, 12 - 3 * S10('deliveryGod')); let best = null; for (const e of enemies) if (e.alive && e.spawnT <= 0 && e.reach !== false && (!best || e.hp > best.hp)) best = e;
      if (best){ const v = clampArena(new V3(best.g.position.x, 0, best.g.position.z)); const c = mesh(circleGeo, p5Tele, v.x, 0.06, v.z); c.scale.setScalar(2.6);
        const g = makeVan(); g.position.set(v.x, 14, v.z); g.rotation.set(0.2, rnd() * TAU, 0.15); P5.vans.push({ g, c, x: v.x, z: v.z, t: 0, done: false }); play('truckHorn'); } } }
  for (let i = P5.vans.length - 1; i >= 0; i--){ const v = P5.vans[i]; v.t += edt;
    if (!v.done){ const k = clamp((v.t - 0.6) / 0.45, 0, 1); v.g.position.y = 14 * (1 - k * k); v.c.material.uniforms.uOpacity.value = 0.3 + 0.3 * Math.abs(Math.sin(time * 14));
      if (k >= 1){ v.done = true; v.g.position.y = 0; v.g.rotation.set(0, v.g.rotation.y, 0); scene.remove(v.c); v.c = null;
        explode(v.x, v.z, 2.8, 0xffd060, 120 * (1 + 0.3 * S10('deliveryGod')), { kind: 'impact', knock: 8 }); shake = Math.max(shake, 0.5); tA.set(v.x, 3, v.z); spawnNumber(tA, '¡ENTREGA!', 'react', '#ffd060'); } }
    else if (v.t > 2.2){ v.g.scale.setScalar(Math.max(0.01, 1 - (v.t - 2.2) * 3)); if (v.t > 2.55){ scene.remove(v.g); P5.vans.splice(i, 1); } } }
  // ventisca
  if (lvl('blizzard')){ if (P5.blizOn > 0){ P5.blizOn -= edt; P5.blizTick -= edt;
      for (let k = 0; k < 3; k++){ const a = rnd() * TAU, r = 0.5 + rnd() * 3.2; spawnFx(hx + Math.cos(a) * r, 0.3 + rnd() * 2, hz + Math.sin(a) * r, -Math.sin(a) * 5, -0.5, Math.cos(a) * 5, rnd() < 0.5 ? 0xffffff : 0xbfefff, 0.07, 0.5, 0, 0); }
      if (P5.blizTick <= 0){ P5.blizTick = 0.5; for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
          if (Math.hypot(e.g.position.x - hx, e.g.position.z - hz) - e.r < 3.4) hitEnemy(e, rdmg(7 + 4 * S10('blizzard')), false, 0, 0, 0.3, 1, false, { src: 'aoe', el: 'ice', power: 1 }); } } }
    else { P5.blizT -= pdt; if (P5.blizT <= 0 && enemies.some(e => e.alive)){ P5.blizT = Math.max(4, 9 - 2 * S10('blizzard')); P5.blizOn = 3 + S10('blizzard'); play('freeze'); ringFx(hx, hz, 0xbfefff, 0.4, 3.4, 0.5); } } }
  // estela eléctrica
  if (lvl('dashTrail') && state === 'roll'){ P5.trailT -= pdt; if (P5.trailT <= 0 && P5.trail.length < 60){ P5.trailT = 0.06; P5.trail.push({ m: mesh(trail5Geo, trail5Mat, hx, 0.05, hz), t: 2 }); } }
  if (P5.trail.length){ P5.trailTick -= edt; const tick = P5.trailTick <= 0; if (tick) P5.trailTick = 0.3;
    for (let i = P5.trail.length - 1; i >= 0; i--){ const s = P5.trail[i]; s.t -= edt; s.m.material.uniforms.uOpacity.value = Math.min(0.7, s.t); s.m.rotation.y += edt * 4;
      if (s.t <= 0){ scene.remove(s.m); P5.trail.splice(i, 1); } }
    if (tick) for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
      if (P5.trail.some(s => Math.hypot(s.m.position.x - e.g.position.x, s.m.position.z - e.g.position.z) < e.r + 0.35)){
        hitEnemy(e, rdmg(5 + 3 * lvl('dashTrail')), false, 0, 0, 0.5, 1, false, { src: 'aoe', el: 'shock', power: 1 }); if (rnd() < 0.3) play('zap'); } } }
  // imán
  if (lvl('magnet')){ for (const p of pickups){ const dx = hx - p.m.position.x, dz = hz - p.m.position.z, d = Math.hypot(dx, dz);
      if (d < 7 && d > 0.01){ p.m.position.x += dx / d * Math.min(d, 7 * pdt); p.m.position.z += dz / d * Math.min(d, 7 * pdt); }
      if (d < 0.9 && !p.mg){ p.mg = true; heal(3 * lvl('magnet'), true); } }
    for (const b of bills) if (b.st === 'floor' && Math.hypot(hx - b.m.position.x, hz - b.m.position.z) < 7) b.st = 'mag'; }
  // caramelos
  for (let i = P5.candies.length - 1; i >= 0; i--){ const c = P5.candies[i]; c.t += pdt;
    if (c.m.position.y > 0.2 || c.vy > 0){ c.vy -= 12 * pdt; c.m.position.x += c.vx * pdt; c.m.position.z += c.vz * pdt; c.m.position.y = Math.max(0.2, c.m.position.y + c.vy * pdt); if (c.m.position.y <= 0.2) c.vy = 0; }
    c.m.rotation.y += pdt * 4; clampArena(c.m.position);
    const d = Math.hypot(hx - c.m.position.x, hz - c.m.position.z);
    if (c.t > 0.4 && d < 2.5){ c.m.position.x += (hx - c.m.position.x) * Math.min(1, pdt * 8); c.m.position.z += (hz - c.m.position.z) * Math.min(1, pdt * 8); }
    if (c.t > 0.4 && d < 0.7){ heal(2, true); player.meter = Math.min(100, player.meter + 6); play('bill'); scene.remove(c.m); P5.candies.splice(i, 1); continue; }
    if (c.t > 10){ scene.remove(c.m); P5.candies.splice(i, 1); } }
  // tiempo bala
  if (lvl('bulletTime') && P5.btCd <= 0) for (const p of projectiles){ if (p.owner !== 'enemy') continue;
    const dx = hx - p.m.position.x, dz = hz - p.m.position.z, d = Math.hypot(dx, dz);
    if (d < 1.5 && (p.vx * dx + p.vz * dz) > 0){ P5.btCd = Math.max(3, 7 - 2 * S10('bulletTime')); slowT = Math.max(slowT, 0.9 + 0.3 * S10('bulletTime')); flash('#c0d8ff', 0.2); play('dodge'); tA.set(hx, hero.position.y + 2.5, hz); spawnNumber(tA, '¡Tiempo bala!', 'react', '#c0d8ff'); break; } }
  // dominó y meteoritos
  for (let i = P5.flyers.length - 1; i >= 0; i--){ const f = P5.flyers[i];
    if (f.meteor){ f.t += edt; const k = Math.min(1, f.t / f.dur); f.m.position.set(f.x + 3 * (1 - k), 11 * (1 - k), f.z - 3 * (1 - k)); f.m.rotation.x += edt * 9;
      if (rnd() < 0.8) spawnFx(f.m.position.x, f.m.position.y, f.m.position.z, 0, 0.5, 0, rnd() < 0.5 ? 0xff9a30 : 0xffe070, 0.12, 0.4, -1, 1);
      if (k >= 1){ scene.remove(f.m); P5.flyers.splice(i, 1); explode(f.x, f.z, 1.8, 0xff6a20, 55, { el: 'fire', kind: 'impact', knock: 4 }); } continue; }
    f.t -= edt; const e = f.e; if (f.t <= 0 || e.remove){ P5.flyers.splice(i, 1); continue; }
    e.g.position.x += f.vx * edt; e.g.position.z += f.vz * edt; e.g.rotation.x += edt * 14; e.g.position.y = Math.sin((0.42 - f.t) / 0.42 * Math.PI) * 0.8;
    for (const o of enemies){ if (!o.alive || o.spawnT > 0 || f.hit.has(o)) continue;
      if (Math.hypot(o.g.position.x - e.g.position.x, o.g.position.z - e.g.position.z) < o.r + 0.5){ f.hit.add(o); const sp = Math.hypot(f.vx, f.vz);
        hitEnemy(o, f.dmg, false, f.vx / sp, f.vz / sp, 5, 1, false, { src: 'aoe' }); sparks(o.g.position.x, 0.8, o.g.position.z, 8, 0xffc070); play('squeak'); } } }
  // agujero negro
  for (let i = P5.holes.length - 1; i >= 0; i--){ const h = P5.holes[i]; h.t -= edt; h.tick -= edt; h.r1.rotation.z += edt * 6; h.g.scale.setScalar(1 + Math.sin(time * 9) * 0.06);
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.isBoss || e.type === 'dragon') continue;
      const dx = h.x - e.g.position.x, dz = h.z - e.g.position.z, d = Math.hypot(dx, dz); if (d < 7.5 && d > 0.3){ const sp = 5.5 * (1.2 - d / 7.5); e.g.position.x += dx / d * sp * edt; e.g.position.z += dz / d * sp * edt; } }
    if (rnd() < 0.9){ const a = rnd() * TAU, r = 3 + rnd() * 3; spawnFx(h.x + Math.cos(a) * r, 0.4 + rnd() * 1.5, h.z + Math.sin(a) * r, -Math.cos(a) * r * 1.6, 0, -Math.sin(a) * r * 1.6, rnd() < 0.5 ? 0xa86aff : 0x2a0a4a, 0.08, 0.6, 0, 0); }
    if (h.tick <= 0){ h.tick = 0.3; for (const e of enemies) if (e.alive && e.spawnT > 0 === false && Math.hypot(e.g.position.x - h.x, e.g.position.z - h.z) < 2) hitEnemy(e, rdmg(6), false, 0, 0, 0, 1, false, { src: 'aoe' }); }
    if (h.t <= 0){ scene.remove(h.g); P5.holes.splice(i, 1); explode(h.x, h.z, 4.2, 0x8a3aff, 140, { kind: 'nova', knock: 9 }); flash('#c8a0ff', 0.4); } }
}
const _v3Update5 = v3Update;
v3Update = function(dt, pdt, playing){ _v3Update5(dt, pdt, playing); try { p5Update(dt, pdt, playing); } catch (err) { console.error(err); } };

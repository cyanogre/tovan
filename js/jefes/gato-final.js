'use strict';
/* ======================================================================
   FINAL: la azotea del anticuario, el Gato y los finales
   ====================================================================== */
const FINAL_WAVE = 31;
/* ---------- Azotea del anticuario ---------- */
const roofTex = texAsset('mundo/azotea-tejado');
const finalGroup = new THREE.Group(); scene.add(finalGroup); finalGroup.visible = false;
{ const wall = makeMat(0x5a5058), dark = makeMat(0x24222a), metal = makeMat(0x7a8088), red = makeMat(0xff2030, { emissive: 1 }), sign = makeMat(0xffffff, { map: signTex, emissive: 0.9 });
  for (let i = 0; i < 28; i++){ const a = i / 28 * TAU; const m = mesh(B(2.1, 0.8, 0.4), wall, Math.cos(a) * 9.2, 0.4, Math.sin(a) * 9.2, finalGroup); m.rotation.y = -a + Math.PI / 2; }
  const tank = new THREE.Group(); tank.position.set(-7, 0, -6.5); finalGroup.add(tank);
  for (const [x, z] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) mesh(B(0.12, 2.4, 0.12), dark, x, 1.2, z, tank);
  mesh(C(1.2, 1.2, 1.9, 10), makeMat(0x6a4a3a), 0, 3.3, 0, tank); mesh(new THREE.ConeGeometry(1.3, 0.6, 10), dark, 0, 4.55, 0, tank);
  const ant = new THREE.Group(); ant.position.set(6.5, 0, -7); finalGroup.add(ant);
  mesh(B(0.1, 6, 0.1), metal, 0, 3, 0, ant); for (let k = 0; k < 4; k++) mesh(B(1.2 - k * 0.2, 0.05, 0.05), metal, 0, 2.5 + k, 0, ant);
  finalGroup.userData.beacon = mesh(B(0.2, 0.2, 0.2), red, 0, 6.1, 0, ant);
  for (const [x, z] of [[7.4, 3], [-7.6, 2.5], [4, 7.2]]){ const ac = new THREE.Group(); ac.position.set(x, 0, z); ac.rotation.y = Math.atan2(-x, -z); finalGroup.add(ac);
    mesh(B(1.3, 0.9, 1.0), metal, 0, 0.45, 0, ac); mesh(C(0.35, 0.35, 0.05, 10), dark, 0, 0.5, 0.51, ac).rotation.x = Math.PI / 2; }
  mesh(B(5.5, 1.1, 0.12), sign, 0, 1.6, -9.6, finalGroup);
  for (let i = 0; i < 44; i++){ const a = i / 44 * TAU + rnd() * 0.1, r = 17 + rnd() * 22, w = 3 + rnd() * 4, h = 6 + rnd() * 26;
    mesh(scaleUV(B(w, h, w), w / 2.5, h / 2.5), [Mr.wA, Mr.wB, Mr.wC][i % 3], Math.cos(a) * r, h / 2 - 8, Math.sin(a) * r, finalGroup); }
  const moon = mesh(new THREE.CircleGeometry(9, 24), makeMat(0xff4a3a, { emissive: 1 }), 0, 38, -95, finalGroup); moon.lookAt(0, 0, 0); }
let lightningT = 5;
function updateFinalArena(dt){
  if (!finalGroup.visible) return;
  finalGroup.userData.beacon.visible = Math.sin(time * 3) > 0;
  lightningT -= dt;
  if (lightningT <= 0){ lightningT = 4 + rnd() * 6; flash('#dfe6ff', 0.35); lightFlash(0, 8, -6, 0xcfd8ff, 3, 40); later(0.3 + rnd() * 0.5, () => play('thunder')); }
}
BIOMES.push({ id: 'final', name: 'La azotea del anticuario', sub: 'Donde empezó todo', group: finalGroup, ground: roofTex, sky: [0x080208, 0x2a0610, 0x6a1020], moon: 0, fog: 0x1a0610,
  amb: 0x4a3a5a, light: 0xffb0a0, mount: 0x1a0610, fire: [1.2, 0.3, 0.3], braz: 'none', amb_: 'rain', music: 'finalcalm',
  enter: () => { rune.visible = false; mountainsList.forEach(m => { m.visible = false; }); ambMat.uniforms.uColor.value.setHex(0xa8b8d8); lampOverride = { pos: new V3(0, 5, -9), col: [1.3, 0.35, 0.45], range: 16 }; },
  exit: () => { rune.visible = true; mountainsList.forEach(m => { m.visible = true; }); lampOverride = null; } });
const FINAL = BIOMES.length - 1;
Object.assign(SFX, { thunder: () => { noise({ dur: 1.8, vol: 0.35, f0: 300, f1: 80, q: 0.5, rv: 0.9 }); tone({ type: 'sine', f0: 50, f1: 30, dur: 1.4, vol: 0.3, rv: 0.6 }); },
  meowBig: () => { tone({ type: 'sawtooth', f0: 180, f1: 320, dur: 0.35, vol: 0.25, rv: 0.5 }); tone({ type: 'sawtooth', f0: 320, f1: 110, dur: 0.9, vol: 0.28, when: 0.3, rv: 0.8 }); noise({ dur: 1.2, vol: 0.2, f0: 400, q: 0.6, rv: 0.8 }); },
  stamp: () => { noise({ dur: 0.12, vol: 0.4, f0: 600, q: 0.8 }); tone({ type: 'sine', f0: 90, dur: 0.2, vol: 0.3 }); } });

/* ---------- El Gato del Anticuario (versión mazada) ---------- */
const catFur = texAsset('jefes/gato-pelaje');
const catChest = texAsset('jefes/gato-pecho');
const catArm = texAsset('jefes/gato-brazo');
const catFaceN = texAsset('jefes/gato-cara'), catFaceB = texAsset('jefes/gato-cara-parpadeo'), catFaceR = texAsset('jefes/gato-cara-furia');
const beltTex = texAsset('jefes/gato-cinturon');
function makeFinalCat(){
  const g = new THREE.Group(); scene.add(g);
  const fur = texMat(catFur), chest = texMat(catChest), arm = texMat(catArm), face = texMat(catFaceN), belt = texMat(beltTex, { emissive: 0.25 });
  const pink = makeMat(0xe88a9a), claw = makeMat(0xf0ece0), eyeGlow = makeMat(0xffe040, { emissive: 1 });
  const S = [matEntry(fur), matEntry(chest), matEntry(arm), matEntry(face), matEntry(belt, 0.25), matEntry(pink), matEntry(claw)];
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.5 * s, 1.1, 0); body.add(L);
    mesh(B(0.72, 0.62, 0.72), arm, 0, -0.31, 0, L); mesh(B(0.6, 0.4, 0.6), fur, 0, -0.78, 0, L); mesh(B(0.72, 0.22, 0.9), fur, 0, -1.0, 0.1, L);
    for (let k = -1; k <= 1; k++) mesh(B(0.14, 0.08, 0.06), pink, k * 0.2, -1.06, 0.56, L); return L; });
  const torso = new THREE.Group(); torso.position.y = 1.1; body.add(torso);
  mesh(B(1.3, 0.55, 0.85), fur, 0, 0.27, 0, torso); const bt = mesh(B(1.42, 0.3, 0.95), belt, 0, 0.12, 0, torso);
  const ch = boxFace(2.6, 1.3, 1.3, chest, fur); ch.position.y = 1.15; torso.add(ch);
  mesh(B(1.2, 0.5, 0.9), fur, 0, 1.95, -0.1, torso);
  for (const s of [-1, 1]) mesh(B(0.9, 0.85, 0.95), arm, 1.55 * s, 1.55, 0, torso);
  const head = new THREE.Group(); head.position.set(0, 2.2, 0.15); torso.add(head);
  const hd = boxFace(0.44, 0.4, 0.4, face, fur); hd.position.y = 0.2; head.add(hd);
  for (const s of [-1, 1]){ const ear = mesh(new THREE.ConeGeometry(0.08, 0.18, 4), fur, 0.14 * s, 0.46, 0, head); ear.rotation.z = -0.2 * s; mesh(new THREE.ConeGeometry(0.045, 0.1, 4), pink, 0.14 * s, 0.45, 0.02, head); }
  const eyes = [-1, 1].map(s => mesh(B(0.07, 0.05, 0.02), eyeGlow, 0.1 * s, 0.24, 0.21, head));
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(1.6 * s, 1.6, 0); torso.add(A);
    mesh(B(0.85, 1.0, 0.85), arm, 0, -0.5, 0, A); mesh(B(0.5, 0.45, 0.4), arm, 0, -0.45, 0.45, A);
    const el = new THREE.Group(); el.position.y = -1.0; A.add(el); A.userData.el = el;
    mesh(B(0.72, 0.85, 0.72), fur, 0, -0.42, 0, el); mesh(B(0.82, 0.55, 0.82), fur, 0, -1.08, 0.05, el);
    for (let k = -1; k <= 1; k++){ const c = mesh(new THREE.ConeGeometry(0.06, 0.28, 4), claw, k * 0.24, -1.42, 0.35, el); c.rotation.x = Math.PI - 0.4; }
    mesh(B(0.3, 0.05, 0.3), pink, 0, -1.36, 0.05, el); return A; });
  const tail = []; let par = new THREE.Group(); par.position.set(0, 0.35, -0.45); torso.add(par);
  for (let i = 0; i < 7; i++){ mesh(B(0.2 - i * 0.015, 0.2 - i * 0.015, 0.42), fur, 0, 0, -0.2, par); tail.push(par); const n = new THREE.Group(); n.position.z = -0.4; par.add(n); par = n; }
  const line = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); line.visible = false;
  const rainC = Array.from({ length: 8 }, () => { const m = mesh(circleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); m.visible = false; return m; });
  const laser = new THREE.Group(); scene.add(laser); laser.visible = false;
  mesh(unitCyl, makeMat(0xfff0a0, { emissive: 1 }), 0, 0, 0, laser); const lzo = mesh(unitCyl, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0, 0, laser);
  const sc = 1.25; g.scale.setScalar(sc);
  return newEnemy('finalcat', g, body, S, { isBoss: true, heavy: true, noSep: false, bossName: 'El Gato del Anticuario', bossHp: 3000, hp: 3000, r: 1.25 * sc, numY: 3.2 * sc, scale: sc, speed: 2.0,
    legs, arms, torso, head, eyes, tail, line, rainC, laser, lzo, faceMat: face, parts: [line, laser, ...rainC], st: 'idle', seq: 0, phase: 1, blinkT: 2, dieTime: 3.2,
    upd: updFinalCat, flair: catFlair, onDying: catDying, onSpawn: e => { e.g.scale.setScalar(sc); e.spawnT = 0; e.t = 1.2; } });
}
MAKERS.finalcat = makeFinalCat;
function catFlair(e, dt){
  e.tail.forEach((t, i) => { t.rotation.y = Math.sin(time * 2 + i * 0.6) * 0.25; t.rotation.x = 0.25 + Math.sin(time * 1.5 + i) * 0.08; });
  for (const A of e.arms) A.userData.el.rotation.x = Math.min(0, A.rotation.x) * 0.7 - 0.15;
  e.blinkT -= dt; if (e.blinkT <= 0) e.blinkT = 2 + rnd() * 3;
  const rage = e.phase > 1 || ['chargeW', 'charge', 'laser', 'air'].includes(e.st);
  e.faceMat.uniforms.uMap.value = rage ? catFaceR : e.blinkT < 0.12 ? catFaceB : catFaceN;
  e.torso.scale.set(1 + Math.sin(time * 2) * 0.015, 1, 1 + Math.sin(time * 2) * 0.015);
  if (rnd() < dt * (8 + e.phase * 8)){ const a = rnd() * TAU; spawnFx(e.g.position.x + Math.cos(a) * 1.4, 0.3 + rnd() * 3, e.g.position.z + Math.sin(a) * 1.4, 0, 1.5, 0, e.phase === 3 ? 0xff3a2a : 0x8a3aff, 0.1, 0.8, -1, 0); }
}
function updFinalCat(e, dt, dist, toP, face, move){
  const px = hero.position.x, pz = hero.position.z, spd = e.phase === 3 ? 1.18 : e.phase === 2 ? 1.07 : 1;
  const walk = sp => { const a = sp ? Math.sin(time * sp) * 0.45 : 0; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; };
  const arm = (i, v, k = 10) => { e.arms[i].rotation.x = lerp(e.arms[i].rotation.x, v, 1 - Math.exp(-dt * k)); };
  const armZ = (i, v, k = 10) => { e.arms[i].rotation.z = lerp(e.arms[i].rotation.z, v, 1 - Math.exp(-dt * k)); };
  e.line.visible = false; e.laser.visible = false;
  const frac = e.hp / e.maxHp;
  if (e.phase === 1 && frac < 0.6) catPhase(e, 2); else if (e.phase === 2 && frac < 0.25) catPhase(e, 3);
  const acts = e.phase === 1 ? ['flex', 'dumbbell', 'charge', 'pounce'] : e.phase === 2 ? ['laser', 'charge', 'kittens', 'dumbbell', 'pounce', 'flex'] : ['meteor', 'laser', 'charge', 'pounce', 'kittens', 'flex'];
  const pick = () => { const a = acts[e.seq++ % acts.length];
    if (a === 'flex'){ e.st = 'flex'; e.t = 1.0 / spd; starShout(e, '¡MIAU! (flexiona)'); }
    else if (a === 'dumbbell' || a === 'meteor'){ e.st = 'throwAim'; e.t = 0.9 / spd; e.ri = 0; const n = a === 'meteor' ? 6 : 4;
      e.rainC.forEach((c, i) => { c.visible = i < n; if (i >= n) return; const aa = rnd() * TAU, r = i ? 1 + rnd() * 3 : 0; const v = clampArena(new V3(px + Math.cos(aa) * r, 0, pz + Math.sin(aa) * r)); c.position.set(v.x, 0.05, v.z); c.scale.setScalar(1.3); });
      if (a === 'meteor') starShout(e, '¡LLUVIA DE ZARPAS!'); }
    else if (a === 'charge'){ e.st = 'chargeW'; e.t = 0.85 / spd; e.dir = toP; play('bruteWarn'); }
    else if (a === 'pounce'){ e.st = 'crouch'; e.t = 0.45 / spd; }
    else if (a === 'laser'){ e.st = 'laserW'; e.t = 0.7; e.la = toP - 0.9; e.lb = toP + 0.9; starShout(e, '¡OJOS LÁSER!'); play('kameCharge'); }
    else { e.st = 'kittens'; e.t = 0.9; starShout(e, '¡MIS GATITOS!'); } };
  if (e.st === 'idle'){ face(toP, 5); arm(0, Math.sin(time * 2) * 0.15); arm(1, -Math.sin(time * 2) * 0.15); armZ(0, 0); armZ(1, 0);
    if (!player.dead && dist > 4){ move(toP, e.speed * spd); walk(5); } else walk(0);
    if (e.t <= 0 && !player.dead) pick(); }
  else if (e.st === 'flex'){ walk(0); arm(0, -0.3); arm(1, -0.3); armZ(0, -2.2); armZ(1, 2.2);
    if (e.t <= 0){ slamRing(e); later(0.35, () => { if (e.alive) slamRing(e); }); if (e.phase === 3) later(0.7, () => { if (e.alive) slamRing(e); }); e.st = 'idle'; e.t = 1.2 / spd; armZ(0, 0, 3); armZ(1, 0, 3); } }
  else if (e.st === 'throwAim' || e.st === 'throwGo'){ walk(0); arm(1, -2.6); e.rainC.forEach(c => { if (c.visible) c.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); });
    if (e.st === 'throwAim' && e.t <= 0){ e.st = 'throwGo'; e.t = 1.2; e.rn = 0; }
    if (e.st === 'throwGo'){ e.rn -= dt; const vis = e.rainC.filter(c => c.visible);
      if (e.rn <= 0 && e.ri < vis.length){ e.rn = 0.12; const c = vis[e.ri++]; e.head.getWorldPosition(tA);
        fballs.push({ m: mesh(B(0.5, 0.18, 0.18), makeMat(0x8a8a9a), tA.x, tA.y, tA.z), from: tA.clone(), to: c.position.clone(), t: 0, dur: 0.7, circle: c, dm: e.dm * 1.2 }); play('swingBig'); }
      if (e.t <= 0){ e.st = 'idle'; e.t = 1.0 / spd; } } }
  else if (e.st === 'chargeW'){ if (e.t > 0.3) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 8)); face(e.dir, 20); arm(0, 0.8); arm(1, 0.8); walk(0);
    e.line.visible = true; e.line.position.set(e.g.position.x, 0.05, e.g.position.z); e.line.rotation.y = e.dir; e.line.scale.set(2.8, 1, 10);
    e.line.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); if (e.t <= 0){ e.st = 'charge'; e.t = 0.6; e.hitOnce = false; play('charge'); } }
  else if (e.st === 'charge'){ move(e.dir, 15 * spd); face(e.dir, 20); walk(18); arm(0, -1.2); arm(1, -1.2);
    if (!e.hitOnce && dist < e.r + 0.6 && hero.position.y < 1.2){ if (hurtPlayer(15 * e.dm, e.g.position.x, e.g.position.z, 10) === 'hit') e.hitOnce = true; }
    if (e.t <= 0){ e.st = 'idle'; e.t = 1.1 / spd; } }
  else if (e.st === 'crouch'){ walk(0); arm(0, 0.5); arm(1, 0.5); if (e.t <= 0){ e.st = 'air'; e.t = 0.85; e.from = e.g.position.clone(); e.to = clampArena(new V3(px, 0, pz), 7); play('jump'); } }
  else if (e.st === 'air'){ const k = clamp(1 - e.t / 0.85, 0, 1); e.g.position.lerpVectors(e.from, e.to, k); e.g.position.y = Math.sin(k * Math.PI) * 4.5; arm(0, -2.8); arm(1, -2.8); e.vx = e.vz = 0;
    if (e.t <= 0){ e.g.position.y = 0; slamRing(e); shake = 0.5; if (Math.hypot(px - e.g.position.x, pz - e.g.position.z) < e.r + 0.8) hurtPlayer(16 * e.dm, e.g.position.x, e.g.position.z, 9); e.st = 'idle'; e.t = 1.2 / spd; } }
  else if (e.st === 'laserW' || e.st === 'laser'){ walk(0); face(e.st === 'laserW' ? (e.la + e.lb) / 2 : e.g.rotation.y, 6);
    e.eyes.forEach(m => m.scale.setScalar(1.5 + Math.sin(time * 30) * 0.3));
    const k = e.st === 'laser' ? clamp(1 - e.t / 1.5, 0, 1) : 0, a = lerp(e.la, e.lb, k), r = Math.min(7.5, Math.max(2.5, dist + 1));
    const gx = e.g.position.x + Math.sin(a) * r, gz = e.g.position.z + Math.cos(a) * r;
    if (e.st === 'laserW'){ e.line.visible = true; e.line.position.set(gx, 0.05, gz); e.line.rotation.y = e.lb + Math.PI / 2; e.line.scale.set(1.6, 1, 0.9); if (e.t <= 0){ e.st = 'laser'; e.t = 1.5; e.lt = 0; play('beam'); } }
    else { e.head.getWorldPosition(tA); tB.set(gx, 0.05, gz); e.laser.visible = true; boneBetween(e.laser.children[0], tA, tB, 0.08); boneBetween(e.lzo, tA, tB, 0.2);
      if (rnd() < 0.8) spawnFx(gx, 0.2, gz, (rnd() - 0.5) * 2, 2, (rnd() - 0.5) * 2, rnd() < 0.5 ? 0xff5030 : 0xffe070, 0.1, 0.4, 5, 0.5);
      e.lt -= dt; if (e.lt <= 0){ e.lt = 0.22; if (Math.hypot(px - gx, pz - gz) < 1.1 && hero.position.y < 1.0) hurtPlayer(8 * e.dm, gx, gz, 4); }
      if (e.t <= 0){ e.eyes.forEach(m => m.scale.setScalar(1)); e.st = 'idle'; e.t = 1.1 / spd; } } }
  else if (e.st === 'kittens'){ walk(0); armZ(0, -1.2); armZ(1, 1.2);
    if (e.t <= 0){ for (let k = 0; k < (e.phase === 3 ? 3 : 2); k++){ const a = rnd() * TAU, v = clampArena(new V3(e.g.position.x + Math.cos(a) * 2.2, 0, e.g.position.z + Math.sin(a) * 2.2));
        const kit = spawnEnemy('imp', [v.x, v.z]); kit.mats[0].c = kit.mats[0].base = 0x1a1822; }
      play('meow'); e.st = 'idle'; e.t = 1.3 / spd; armZ(0, 0, 3); armZ(1, 0, 3); } }
}
function catPhase(e, p){
  e.phase = p; e.st = 'idle'; e.t = 1.5; e.line.visible = false; e.laser.visible = false; e.rainC.forEach(c => { c.visible = false; });
  play('meowBig');
  startBossCut(e, p === 2 ? 'SEGUNDA VIDA' : 'NOVENA VIDA', p === 2 ? '#ff5a3a' : '#ff1a2a', () => {
    for (let k = 0; k < 3; k++) later(k * 0.3, () => { if (e.alive) slamRing(e); });
    if (p === 2){ skyMat.uniforms.uTop.value.setHex(0x1a0204); skyMat.uniforms.uMid.value.setHex(0x5a0a10); skyMat.uniforms.uHor.value.setHex(0xc82a1a); barkOnce('cat2', '¡Solo ha gastado una vida! ¡Le quedan ocho!'); }
    else { skyMat.uniforms.uTop.value.setHex(0x000000); skyMat.uniforms.uMid.value.setHex(0x1a0000); skyMat.uniforms.uHor.value.setHex(0xff0a1a); barkOnce('cat3', '¡Es su última vida! ¡Aguanta, Tovan!'); }
  });
}
let finalBeaten = false;
function catDying(e, dt){
  e.dying -= dt; applyFlash(e);
  const k = Math.max(0.05, e.dying / 3.2); e.g.scale.setScalar(e.scale * k);
  if (rnd() < 0.5){ const a = rnd() * TAU; spawnFx(e.g.position.x, 1 + rnd() * 2, e.g.position.z, Math.cos(a) * 3, 2, Math.sin(a) * 3, rnd() < 0.5 ? 0x8a3aff : 0xffe040, 0.12, 0.8, 5, 0.5); }
  if (e.dying <= 0){ e.parts.forEach(p => scene.remove(p)); scene.remove(e.g); e.remove = true; }
}

/* ---------- Presentación del jefe final ---------- */
function makeSmallCat(){ const c = new THREE.Group(); scene.add(c);
  mesh(B(0.26, 0.24, 0.4), Mr.cat, 0, 0.12, 0, c); const h = new THREE.Group(); h.position.set(0, 0.34, 0.14); c.add(h); mesh(B(0.24, 0.2, 0.2), Mr.cat, 0, 0, 0, h);
  for (const s of [-1, 1]){ const e = mesh(new THREE.ConeGeometry(0.05, 0.12, 4), Mr.cat, 0.07 * s, 0.14, 0, h); e.rotation.z = -0.2 * s; mesh(B(0.05, 0.04, 0.02), Mr.catEye, 0.055 * s, 0.02, 0.105, h); }
  return c; }
function startFinal(){
  wave = FINAL_WAVE; queue = []; waveTotal = 1; clearT = -1; dmgWave = false; protaUsed = false;
  runCine(async () => {
    const H = hero.position; H.set(0, 0, 3); heading = Math.PI; hero.rotation.y = heading;
    const kit = makeSmallCat(); kit.position.set(0, 0, -8.5); kit.rotation.y = 0;
    csShot(dollyShot([2.5, 1.2, 5.5], [1.8, 1.0, 4.6], [0, 0.6, -6], [0, 0.4, -3], 3));
    await csTween(2.2, k => { kit.position.z = lerp(-8.5, -3, k); kit.position.y = Math.abs(Math.sin(k * 20)) * 0.05; });
    play('meow'); await csSay([['gato', 'Miau.'], ['tovan', '¿Tú otra vez? ¿Qué haces en la azotea?'],
      ['lumen', 'Tovan… ese gato no es un gato. Es el Guardián de las Ruinas. El destinatario del paquete.'], ['tovan', '¿EL GATO? ¿Todo este tiempo el paquete era para el gato?'],
      ['gato', 'Miau. (Traducción: me has traído mi linterna con tres semanas de retraso.)'], ['lumen', 'Y no le ha hecho gracia que la usaras. Nada de gracia.']]);
    csShot(dollyShot([0.6, 0.5, -1.4], [0.5, 0.4, -1.8], [0, 0.35, -3], [0, 0.35, -3], 1.2));
    play('meowBig'); shake = 0.4; await csWait(1.0);
    const boss = spawnEnemy('finalcat', [0, -3]); boss.g.visible = false; boss.g.rotation.y = 0; boss.st = 'idle'; boss.t = 99;
    for (let i = 0; i < 4; i++){ flash(i % 2 ? '#8a3aff' : '#ffffff', 0.5); shake = 0.5; play('boom'); kit.scale.setScalar(1 + i * 0.6); await csWait(0.3); }
    scene.remove(kit); boss.g.visible = true; flash('#ffffff', 0.9);
    csShot(dollyShot([0, 1.2, 1.5], [0, 0.8, 1.2], [0, 7, -3], [0, 6, -3], 1.4)); await csWait(1.4);
    csShot(dollyShot([0.5, 6.6, -0.2], [0.4, 6.5, -0.6], [0, 6.4, -3], [0, 6.4, -3], 1.0)); await csWait(1.0);
    csShot(dollyShot([7, 3, 7], [9, 5, 9], [0, 3, -3], [0, 3, -3], 2.2));
    csShout('¡MIAU!'); play('meowBig'); shake = 0.7;
    document.getElementById('finalTitle').classList.add('on'); startEpic(); await csWait(2.6); document.getElementById('finalTitle').classList.remove('on');
    boss.t = 1.2;
  }, () => {
    document.getElementById('finalTitle').classList.remove('on');
    let boss = enemies.find(e => e.type === 'finalcat' && e.alive);
    if (!boss){ boss = spawnEnemy('finalcat', [0, -3]); }
    boss.g.visible = true; boss.t = Math.min(boss.t, 1.2); scene.children.filter(o => o.userData && o.userData.smallCat).forEach(o => scene.remove(o));
    if (!curTrack && song !== 'finalboss') startEpic();
    banner('Jefe final<small>El Gato del Anticuario</small>', 1.6);
  });
}

'use strict';
/* ---------- Canal X: Dron-cámara y Fan enloquecido ---------- */
const droneBeamMat = makeMat(0xfff6c0, { emissive: 1, opacity: 0.85 });
function makeDrone(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0x3a3a48], [0x16161e], [0x4ad8ff, 1], [0xff2a2a, 1], [0xc8c8d0]]); S.push({ m: makeMat(0xdde4ff, { emissive: 0.4, opacity: 0.35, side: THREE.DoubleSide }), c: 0xdde4ff, base: 0xdde4ff, em: 0.4 });
  const body = new THREE.Group(); body.position.y = 2.3; g.add(body);
  sculpt(body, [[-0.14, 0.2, 0.26, 0.22], [0.0, 0.26, 0.32, 0.28], [0.14, 0.2, 0.26, 0.22]], S[0].m, { n: 8 });
  const lens = new THREE.Group(); lens.position.set(0, -0.02, 0.3); body.add(lens);
  mesh(C(0.13, 0.15, 0.12, 12), S[1].m, 0, 0, 0, lens).rotation.x = Math.PI / 2; const glass = mesh(C(0.09, 0.09, 0.02, 12), S[2].m, 0, 0, 0.07, lens); glass.rotation.x = Math.PI / 2;
  const rec = mesh(new THREE.IcosahedronGeometry(0.035, 0), S[3].m, 0.16, 0.14, 0.22, body);
  const rotors = [];
  for (let i = 0; i < 4; i++){ const a = Math.PI / 4 + i * Math.PI / 2; const ag = new THREE.Group(); ag.rotation.y = a; ag.position.y = 0.1; body.add(ag);
    const arm = mesh(C(0.022, 0.022, 0.5, 5), S[4].m, 0, 0, 0.25, ag); arm.rotation.x = Math.PI / 2;
    const hub = mesh(C(0.04, 0.04, 0.06, 6), S[1].m, Math.sin(a) * 0.48, 0.14, Math.cos(a) * 0.48, body);
    const rot = mesh(new THREE.CircleGeometry(0.2, 10), S[5].m, Math.sin(a) * 0.48, 0.18, Math.cos(a) * 0.48, body); rot.rotation.x = -Math.PI / 2; rotors.push(rot); }
  const tele = lineTele(); const beam = mesh(B(0.12, 0.12, 1), droneBeamMat, 0, 0, 0); beam.visible = false; beam.geometry.translate(0, 0, 0.5);
  return newEnemy('drone', g, body, S, { hp: 65, r: 0.45, speed: 2.2, numY: 3.0, fly: true, lens, rec, rotors, tele, beam, parts: [beam], upd: updDrone, orbitA: rnd() * TAU });
}
function updDrone(e, dt, dist, toP, face, move){
  e.tele.visible = false; e.beam.visible = false; e.rotors.forEach(r => { r.rotation.z += dt * 40; });
  e.body.position.y = 2.3 + Math.sin(time * 3 + e.seed) * 0.12; e.rec.visible = Math.sin(time * 6) > 0;
  if (e.state === 'hurt'){ e.body.rotation.z = Math.sin(time * 40) * 0.2; if (e.t <= 0){ e.state = 'chase'; e.body.rotation.z = 0; } return; }
  if (e.state === 'chase'){ e.orbitA += dt * 0.7 * e.side; const tx = hero.position.x + Math.cos(e.orbitA) * 4.6, tz = hero.position.z + Math.sin(e.orbitA) * 4.6;
    const a = angTo(e.g.position.x, e.g.position.z, tx, tz), d = Math.hypot(tx - e.g.position.x, tz - e.g.position.z); if (d > 0.3) move(a, e.speed * Math.min(1, d)); face(toP, 8);
    e.body.rotation.x = 0.15; if (!player.dead && e.cd <= 0 && dist < 9){ e.state = 'windup'; e.t = 0.85; e.dir = toP; play('kameCharge'); } }
  else if (e.state === 'windup'){ if (e.t > 0.3) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 7)); face(e.dir, 14); e.body.rotation.x = 0.45;
    showLine(e.tele, e.g.position.x, e.g.position.z, e.dir, 1.0, 9); e.lens.scale.setScalar(1 + Math.sin(time * 40) * 0.1);
    if (e.t <= 0){ e.state = 'fire'; e.t = 0.45; e.hit = false; flash('#fff6c0', 0.15); play('beam'); } }
  else if (e.state === 'fire'){ e.lens.scale.setScalar(1); const fx = Math.sin(e.dir), fz = Math.cos(e.dir);
    e.beam.visible = true; e.beam.position.set(e.g.position.x, 1.0, e.g.position.z); e.beam.rotation.y = e.dir; e.beam.scale.set(1, 1, 9);
    if (!e.hit && inLineHit(e.g.position.x, e.g.position.z, e.dir, 9, 0.6) && hero.position.y < 1.6){ if (hurtPlayer(12 * e.dm, e.g.position.x, e.g.position.z, 3) === 'hit') e.hit = true; }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.6; } }
  else if (e.state === 'recover'){ e.body.rotation.x = 0.15; if (e.t <= 0){ e.state = 'chase'; e.cd = 2.2 + rnd(); } }
}
const fanShirt = texAsset('enemigos/fan-camiseta');
const fanFace = texAsset('enemigos/fan-cara');
const fanSign = texAsset('enemigos/fan-cartel', { borde: true });
function makeFanatic(){
  const g = new THREE.Group(); scene.add(g);
  const shirt = texMat(fanShirt), face = texMat(fanFace), sign = makeMat(0xffffff, { map: fanSign, side: THREE.DoubleSide, emissive: 0.3 });
  const S = [matEntry(shirt), matEntry(face), ...matSet([[0x3a5aa8], [0xe8b894], [0xf4f4f4], [0x5a3a1a], [0xd83a3a], [0x8a6a4a]]), matEntry(sign, 0.3)];
  const jeans = S[2].m, skin = S[3].m, shoe = S[4].m, hair = S[5].m;
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.12 * s, 0.62, 0); body.add(L);
    sculpt(L, [[-0.56, 0.08, 0.09, 0.08], [-0.3, 0.09, 0.1, 0.09], [0.0, 0.1, 0.11, 0.1]], jeans, { n: 6 }); lump(L, 0.08, shoe, 0, -0.6, 0.06, 1, 0.6, 1.6); return L; });
  const torso = new THREE.Group(); torso.position.y = 0.62; body.add(torso);
  sculpt(torso, [[0.0, 0.2, 0.15, 0.14], [0.25, 0.23, 0.17, 0.15], [0.45, 0.25, 0.17, 0.16], [0.55, 0.12, 0.1, 0.1]], shirt, { n: 8, capB: 0.2 });
  const head = new THREE.Group(); head.position.y = 0.66; torso.add(head);
  sculptHead(head, [[0.0, 0.14, 0.15, 0.13], [0.12, 0.2, 0.21, 0.19], [0.28, 0.21, 0.21, 0.2], [0.42, 0.17, 0.16, 0.17], [0.5, 0.08, 0.07, 0.09]], skin, face, [-0.22, 0.22, 0.02, 0.44], { nz: 0.4 });
  sculpt(head, [[0.3, 0.22, 0.17, 0.22, 0, -0.02], [0.42, 0.19, 0.14, 0.2, 0, -0.03], [0.53, 0.1, 0.06, 0.12, 0, -0.04]], hair, { n: 8, capB: -1 });
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.27 * s, 0.45, 0); torso.add(A);
    sculpt(A, [[-0.42, 0.055, 0.06, 0.055], [-0.2, 0.065, 0.07, 0.065], [0.0, 0.07, 0.08, 0.07]], skin, { n: 6 }); lump(A, 0.06, skin, 0, -0.46, 0.02); A.rotation.x = -2.8; return A; });
  const signG = new THREE.Group(); signG.position.set(0, 1.62, 0.12); torso.add(signG);
  mesh(new THREE.PlaneGeometry(0.9, 0.45), sign, 0, 0.18, 0.012, signG); mesh(new THREE.PlaneGeometry(0.9, 0.45), sign, 0, 0.18, -0.012, signG).rotation.y = Math.PI; mesh(C(0.02, 0.02, 0.5, 4), S[7].m, 0, -0.15, -0.01, signG);
  const tele = lineTele();
  return newEnemy('fanatic', g, body, S, { hp: 90, r: 0.42, speed: 2.4, numY: 2.4, legs, arms, torso, head, signG, tele, upd: updFanatic });
}
function updFanatic(e, dt, dist, toP, face, move){
  const walk = sp => { const a = sp ? Math.sin(time * sp) * 0.55 : 0; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; };
  e.tele.visible = false; e.weak = e.state === 'selfie';
  if (e.state === 'hurt'){ e.torso.rotation.x = -0.25; if (e.t <= 0){ e.state = 'chase'; e.torso.rotation.x = 0; } return; }
  if (e.state === 'chase'){ face(toP, 8); e.torso.rotation.x = 0.1; e.signG.rotation.z = Math.sin(time * 8 + e.seed) * 0.25; e.arms.forEach(A => { A.rotation.x = -2.8; A.rotation.z = Math.sin(time * 8) * 0.1; });
    if (!player.dead && dist > 1.2){ move(toP, e.speed); walk(12); } else walk(0);
    if (!player.dead && e.cd <= 0 && dist < 4.5){ e.state = 'windup'; e.t = 0.6; e.dir = toP; tA.set(e.g.position.x, e.numY + 0.3, e.g.position.z); spawnNumber(tA, '¡¡AAAH!!', 'react', '#ff6a9a'); play('squawk'); } }
  else if (e.state === 'windup'){ if (e.t > 0.2) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 8)); face(e.dir, 14); walk(0); e.body.position.x = (rnd() - 0.5) * 0.05;
    showLine(e.tele, e.g.position.x, e.g.position.z, e.dir, 1.0, 5); e.arms.forEach(A => { A.rotation.x = lerp(A.rotation.x, -1.5, 1 - Math.exp(-dt * 10)); });
    if (e.t <= 0){ e.state = 'hug'; e.t = 0.5; e.hitOnce = false; e.body.position.x = 0; } }
  else if (e.state === 'hug'){ move(e.dir, 9); face(e.dir, 20); walk(22); e.torso.rotation.x = 0.45;
    if (!e.hitOnce && dist < e.r + 0.55 && hero.position.y < 1.0){ if (hurtPlayer(12 * e.dm, e.g.position.x, e.g.position.z, 4) !== 'dodge'){ e.hitOnce = true; tA.set(hero.position.x, hero.position.y + 2.6, hero.position.z); spawnNumber(tA, '¡Abrazo!', 'react', '#ff6a9a'); } }
    if (e.t <= 0){ e.state = 'selfie'; e.t = 1.3; flash('#ffffff', 0.25); play('bossCard'); tA.set(e.g.position.x, e.numY + 0.3, e.g.position.z); spawnNumber(tA, '📸 ¡Selfie!', 'react', '#ffffff'); } }
  else if (e.state === 'selfie'){ walk(0); face(toP + 0.8, 6); e.torso.rotation.x = 0; e.arms[1].rotation.x = -2.0; e.arms[0].rotation.x = -1.2; e.signG.rotation.z = 0.4;
    if (e.t <= 0){ e.state = 'chase'; e.cd = 2.2 + rnd(); } }
}

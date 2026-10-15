'use strict';
/* ---------- Santuario: Kasa-obake y Chōchin-obake ---------- */
const kasaTex = texAsset('enemigos/kasa');
const kasaFace = texAsset('enemigos/kasa-cara');
const kasaBlink = texAsset('enemigos/kasa-cara-parpadeo');
function makeKasa(){
  const g = new THREE.Group(); scene.add(g);
  const paper = texMat(kasaTex), face = texMat(kasaFace), wood = makeMat(0x6a4424), tongue = makeMat(0xff4a6a), skin = makeMat(0xd8b088);
  const S = [matEntry(paper), matEntry(face), matEntry(wood), matEntry(tongue), matEntry(skin)];
  const body = new THREE.Group(); body.position.y = 0.55; g.add(body);
  sculpt(body, [[0.0, 0.34, 0.34, 0.34], [0.25, 0.3, 0.31, 0.3], [0.55, 0.22, 0.23, 0.22], [0.85, 0.12, 0.13, 0.12], [1.05, 0.04, 0.04, 0.04]], paper, { n: 8, capB: 0.15, faceMat: face, face: { box: [-0.3, 0.3, 0.2, 0.8], test: (c, n) => n.z > 0.5 && c.y > 0.2 && c.y < 0.8 } });
  mesh(C(0.03, 0.03, 0.2, 5), wood, 0, 1.12, 0, body); const knob = mesh(new THREE.TorusGeometry(0.06, 0.02, 4, 8, Math.PI), wood, 0.05, 1.24, 0, body);
  const tg = new THREE.Group(); tg.position.set(0, 0.26, 0.28); body.add(tg);
  const t1 = mesh(B(0.1, 0.02, 0.3), tongue, 0, 0, 0.15, tg); const t2 = mesh(B(0.1, 0.02, 0.18), tongue, 0, -0.06, 0.34, tg); t2.rotation.x = 0.6;
  const leg = new THREE.Group(); leg.position.y = 0.0; body.add(leg);
  mesh(C(0.05, 0.045, 0.5, 6), skin, 0, -0.25, 0, leg); lump(leg, 0.06, skin, 0, -0.18, 0.02, 1, 0.8, 1);
  mesh(B(0.18, 0.04, 0.3), wood, 0, -0.52, 0.02, leg); for (const z of [-0.08, 0.1]) mesh(B(0.16, 0.06, 0.04), wood, 0, -0.57, z + 0.02, leg);
  const tele = circTele();
  return newEnemy('kasa', g, body, S, { hp: 90, r: 0.45, speed: 2.4, numY: 2.0, tele, tg, leg, faceMat: face, upd: updKasa, hopT: 0, blinkT: 2 });
}
function updKasa(e, dt, dist, toP, face, move){
  e.tele.visible = false; e.tg.rotation.x = Math.sin(time * 6 + e.seed) * 0.3;
  e.blinkT -= dt; e.faceMat.uniforms.uMap.value = e.blinkT < 0.12 ? kasaBlink : kasaFace; if (e.blinkT <= 0) e.blinkT = 1.5 + rnd() * 3;
  if (e.state === 'hurt'){ e.body.rotation.x = -0.25; if (e.t <= 0) e.state = 'chase'; return; }
  e.body.rotation.x = lerp(e.body.rotation.x, 0, 1 - Math.exp(-dt * 6));
  if (e.state === 'chase'){ face(toP, 8); e.hopT += dt * 3.4; const h = Math.abs(Math.sin(e.hopT * Math.PI));
    e.body.position.y = 0.55 + h * 0.45; e.body.scale.set(1 + (1 - h) * 0.08, 1 - (1 - h) * 0.1, 1 + (1 - h) * 0.08);
    if (!player.dead && dist > 1.4 && h > 0.15) move(toP, e.speed);
    if (!player.dead && dist < 5 && e.cd <= 0){ e.state = 'crouch'; e.t = 0.5; play('squeak'); } }
  else if (e.state === 'crouch'){ face(toP, 10); e.body.scale.set(1.15, 0.75, 1.15); e.body.position.y = 0.5; e.spot = clampArena(new V3(hero.position.x, 0, hero.position.z));
    showCirc(e.tele, e.spot.x, e.spot.z, 1.4); if (e.t <= 0){ e.state = 'air'; e.t = 0.7; e.from = e.g.position.clone(); play('jump'); } }
  else if (e.state === 'air'){ const k = clamp(1 - e.t / 0.7, 0, 1); e.body.scale.set(0.9, 1.15, 0.9); showCirc(e.tele, e.spot.x, e.spot.z, 1.4);
    e.g.position.x = lerp(e.from.x, e.spot.x, k); e.g.position.z = lerp(e.from.z, e.spot.z, k); e.body.position.y = 0.55 + Math.sin(k * Math.PI) * 3; e.vx = e.vz = 0;
    if (e.t <= 0){ e.body.position.y = 0.55; ringFx(e.spot.x, e.spot.z, 0xff8aa0, 0.3, 1.5, 0.3); puffAt(e.spot.x, e.spot.z, 8, 1.6, 0xffc0d0); play('land'); shake = Math.max(shake, 0.15);
      hurtAt(e.spot.x, e.spot.z, 1.45, 14 * e.dm, 6); e.state = 'recover'; e.t = 0.8; } }
  else if (e.state === 'recover'){ e.body.scale.set(1.1, 0.85, 1.1); if (e.t <= 0){ e.body.scale.setScalar(1); e.state = 'chase'; e.cd = 1.4 + rnd(); } }
}
const chochinTex = texAsset('enemigos/chochin');
const chochinFace = texAsset('enemigos/chochin-cara');
const chochinBlink = texAsset('enemigos/chochin-cara-parpadeo');
const fireballMat5 = makeMat(0xff8a2a, { emissive: 1 }), fbGeo5 = new THREE.IcosahedronGeometry(0.17, 0);
function makeChochin(){
  const g = new THREE.Group(); scene.add(g);
  const paper = texMat(chochinTex, { emissive: 0.45 }), face = texMat(chochinFace, { emissive: 0.45 }), wood = makeMat(0x2a1a14), tongue = makeMat(0xff4a6a, { emissive: 0.3 });
  const S = [matEntry(paper, 0.45), matEntry(face, 0.45), matEntry(wood), matEntry(tongue, 0.3)];
  const body = new THREE.Group(); body.position.y = 1.35; g.add(body);
  sculpt(body, [[-0.36, 0.2, 0.2, 0.2], [-0.24, 0.33, 0.33, 0.33], [0, 0.38, 0.38, 0.38], [0.24, 0.33, 0.33, 0.33], [0.36, 0.2, 0.2, 0.2]], paper, { n: 10, capB: -1, capT: -1, faceMat: face, face: { box: [-0.36, 0.36, -0.26, 0.26], test: (c, n) => n.z > 0.55 } });
  mesh(C(0.22, 0.22, 0.07, 10), wood, 0, 0.39, 0, body); mesh(C(0.22, 0.22, 0.07, 10), wood, 0, -0.39, 0, body); mesh(new THREE.TorusGeometry(0.07, 0.02, 4, 8), wood, 0, 0.5, 0, body);
  const tg = mesh(B(0.12, 0.02, 0.36), tongue, 0, -0.16, 0.42, body); tg.rotation.x = 0.5;
  const glow = mesh(new THREE.IcosahedronGeometry(0.18, 0), makeMat(0xffc060, { emissive: 1, opacity: 0.5 }), 0, 0, 0, body);
  return newEnemy('chochin', g, body, S, { hp: 70, r: 0.45, speed: 1.8, numY: 2.2, fly: true, tg, glow, faceMat: face, upd: updChochin, blinkT: 2 });
}
function updChochin(e, dt, dist, toP, face, move){
  e.body.position.y = 1.35 + Math.sin(time * 2.2 + e.seed) * 0.15; e.body.rotation.z = Math.sin(time * 1.7 + e.seed) * 0.12; e.tg.rotation.x = 0.5 + Math.sin(time * 5) * 0.3;
  e.blinkT -= dt; e.faceMat.uniforms.uMap.value = e.blinkT < 0.12 ? chochinBlink : chochinFace; if (e.blinkT <= 0) e.blinkT = 1.2 + rnd() * 3;
  if (rnd() < dt * 4) spawnFx(e.g.position.x + (rnd() - 0.5) * 0.3, e.body.position.y + 0.5, e.g.position.z + (rnd() - 0.5) * 0.3, 0, 0.8, 0, 0xffb040, 0.05, 0.5, -0.5, 0);
  if (e.state === 'hurt'){ if (e.t <= 0) e.state = 'chase'; return; }
  face(toP, 6);
  if (e.state === 'chase'){ if (!player.dead){ if (dist > 5.5) move(toP, e.speed); else if (dist < 3.8) move(toP + Math.PI, e.speed * 1.1); else move(toP + e.side * Math.PI / 2, e.speed * 0.6); }
    if (rnd() < dt * 0.4) e.side *= -1;
    if (!player.dead && e.cd <= 0 && dist < 9){ e.state = 'windup'; e.t = 0.7; play('breath'); } }
  else if (e.state === 'windup'){ e.glow.scale.setScalar(1 + (0.7 - e.t) * 2.2); e.body.scale.setScalar(1 + (0.7 - e.t) * 0.15);
    if (e.t <= 0){ e.glow.scale.setScalar(1); e.body.scale.setScalar(1); for (const o of [-0.3, 0, 0.3]) shoot5(e, toP + o, 5, 10 * e.dm, fbGeo5, fireballMat5, 1.05, 2.6); play('fireball'); e.state = 'recover'; e.t = 0.5; } }
  else if (e.state === 'recover'){ if (e.t <= 0){ e.state = 'chase'; e.cd = 2.4 + rnd() * 1.2; } }
}

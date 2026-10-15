'use strict';
/* ---------- Cumbre: Muñeco de nieve y Pingüino ---------- */
const snowMat5 = makeMat(0xf4f8ff, { emissive: 0.12 }), snowballGeo = new THREE.IcosahedronGeometry(0.2, 1);
function makeSnowman(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0xf4f8ff, 0.1], [0x1a1a22], [0xff8a2a], [0x6a4424], [0xc8302a], [0x5a5a66]]);
  const body = new THREE.Group(); g.add(body);
  const b1 = mesh(new THREE.IcosahedronGeometry(0.5, 1), S[0].m, 0, 0.45, 0, body); b1.scale.y = 0.9;
  const b2 = mesh(new THREE.IcosahedronGeometry(0.36, 1), S[0].m, 0, 1.08, 0, body);
  const head = new THREE.Group(); head.position.y = 1.58; body.add(head);
  mesh(new THREE.IcosahedronGeometry(0.26, 1), S[0].m, 0, 0, 0, head);
  for (const s of [-1, 1]) lump(head, 0.035, S[1].m, 0.09 * s, 0.06, 0.23, 1, 1, 0.6);
  const nose = mesh(new THREE.ConeGeometry(0.045, 0.28, 6), S[2].m, 0, 0, 0.36, head); nose.rotation.x = Math.PI / 2;
  for (let i = 0; i < 5; i++){ const a = -0.5 + i * 0.25; lump(head, 0.022, S[1].m, Math.sin(a) * 0.17, -0.11 - Math.cos(a * 2) * 0.02, 0.2, 1, 1, 0.6); }
  for (let i = 0; i < 3; i++) lump(body, 0.04, S[1].m, 0, 1.2 - i * 0.14, 0.33 - Math.abs(i - 1) * 0.02, 1, 1, 0.6);
  const sc = mesh(new THREE.TorusGeometry(0.25, 0.06, 5, 12), S[4].m, 0, 1.38, 0, body); sc.rotation.x = Math.PI / 2; const tail = mesh(B(0.1, 0.3, 0.05), S[4].m, 0.14, 1.22, 0.22, body); tail.rotation.z = 0.3;
  mesh(C(0.17, 0.2, 0.26, 10), S[5].m, 0, 0.3, 0, head).rotation.z = 0.15;
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.3 * s, 1.12, 0); body.add(A);
    const st = mesh(C(0.025, 0.02, 0.6, 4), S[3].m, 0.28 * s, 0.1, 0, A); st.rotation.z = -1.1 * s;
    const tw = mesh(C(0.012, 0.01, 0.18, 4), S[3].m, 0.42 * s, 0.24, 0, A); tw.rotation.z = -0.3 * s; return A; });
  const ball = mesh(snowballGeo, snowMat5, 0.5, 0.25, 0, arms[1]); ball.visible = false;
  return newEnemy('snowman', g, body, S, { hp: 130, r: 0.6, speed: 0.9, numY: 2.3, heavy: true, arms, head, ball, upd: updSnowman });
}
function updSnowman(e, dt, dist, toP, face, move){
  const R = e.arms[1];
  if (e.state === 'hurt'){ e.body.rotation.z = Math.sin(time * 30) * 0.05; if (e.t <= 0){ e.state = 'chase'; e.body.rotation.z = 0; } return; }
  e.head.rotation.z = Math.sin(time * 1.5 + e.seed) * 0.08;
  if (e.state === 'chase'){ face(toP, 4); R.rotation.x = lerp(R.rotation.x, 0, 1 - Math.exp(-dt * 6));
    if (!player.dead){ if (dist > 6) move(toP, e.speed); else if (dist < 3.5) move(toP + Math.PI, e.speed); e.body.rotation.y = Math.sin(time * 6) * 0.05; }
    if (!player.dead && e.cd <= 0 && dist < 10){ e.state = 'windup'; e.t = 0.6; e.n = dist < 5 ? 1 : 3; e.ball.visible = true; } }
  else if (e.state === 'windup'){ face(toP, 8); R.rotation.x = lerp(R.rotation.x, -2.4, 1 - Math.exp(-dt * 10));
    if (e.t <= 0){ e.ball.visible = false; R.rotation.x = 0.8; play('swingBig');
      for (let k = 0; k < e.n; k++){ const a = rnd() * TAU, r = k ? 1.2 + rnd() * 1.6 : 0; const to = clampArena(new V3(hero.position.x + Math.cos(a) * r, 0, hero.position.z + Math.sin(a) * r));
        e.ball.getWorldPosition(tA); lob5(tA, to, 0.85 + k * 0.12, 12 * e.dm, snowMat5, snowballGeo, (x, z) => { puffAt(x, z, 10, 1.4, 0xf4f8ff); ringFx(x, z, 0xdff6ff, 0.3, 1.3, 0.3); play('shatter'); }); }
      e.state = 'recover'; e.t = 0.8; } }
  else if (e.state === 'recover'){ if (e.t <= 0){ e.state = 'chase'; e.cd = 2.2 + rnd() * 1.2; } }
}
const penguinBelly = texAsset('enemigos/pinguino-barriga');
function makePenguin(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0x1e2232], [0xf4f4f8], [0xff9a2a], [0xffffff], [0x101018]]); const belly = texMat(penguinBelly); S.push(matEntry(belly));
  const body = new THREE.Group(); body.position.y = 0.06; g.add(body);
  const torso = new THREE.Group(); body.add(torso);
  sculpt(torso, [[0.0, 0.2, 0.22, 0.2], [0.2, 0.28, 0.3, 0.27], [0.45, 0.26, 0.28, 0.25], [0.66, 0.18, 0.2, 0.18], [0.78, 0.14, 0.15, 0.14], [0.92, 0.15, 0.16, 0.15], [1.04, 0.1, 0.11, 0.1], [1.1, 0.03, 0.03, 0.03]], S[0].m,
    { n: 8, capB: 0.2, faceMat: belly, face: { box: [-0.3, 0.3, 0.0, 0.72], test: (c, n) => n.z > 0.4 && c.y < 0.7 } });
  for (const s of [-1, 1]){ mesh(B(0.07, 0.07, 0.02), S[3].m, 0.07 * s, 0.97, 0.14, torso); mesh(B(0.035, 0.04, 0.02), S[4].m, 0.07 * s, 0.97, 0.152, torso); }
  const beak = mesh(new THREE.ConeGeometry(0.05, 0.16, 5), S[2].m, 0, 0.9, 0.2, torso); beak.rotation.x = Math.PI / 2;
  const flips = [-1, 1].map(s => { const f = lump(torso, 0.1, S[0].m, 0.27 * s, 0.45, 0, 0.35, 1.6, 0.7); f.rotation.z = 0.25 * s; return f; });
  const feet = [-1, 1].map(s => lump(body, 0.07, S[2].m, 0.1 * s, 0.0, 0.1, 1, 0.35, 1.6));
  const tele = lineTele();
  return newEnemy('penguin', g, body, S, { hp: 60, r: 0.42, speed: 2.0, numY: 1.6, torso, flips, feet, tele, upd: updPenguin });
}
function updPenguin(e, dt, dist, toP, face, move){
  e.tele.visible = false;
  if (e.state === 'hurt'){ e.torso.rotation.x = -0.3; if (e.t <= 0){ e.state = 'chase'; e.torso.rotation.x = 0; } return; }
  if (e.state === 'chase'){ face(toP, 7); e.torso.rotation.x = lerp(e.torso.rotation.x, 0, 1 - Math.exp(-dt * 8)); e.torso.rotation.z = Math.sin(time * 12 + e.seed) * 0.15;
    e.flips.forEach((f, i) => { f.rotation.z = (i ? -1 : 1) * (0.25 + Math.abs(Math.sin(time * 12)) * 0.3); });
    if (!player.dead && dist > 1.5) move(toP, e.speed);
    if (!player.dead && e.cd <= 0 && dist < 7){ e.state = 'windup'; e.t = 0.6; e.dir = toP; play('squeak'); } }
  else if (e.state === 'windup'){ if (e.t > 0.2) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 8)); face(e.dir, 14); e.torso.rotation.x = lerp(e.torso.rotation.x, 0.5, 1 - Math.exp(-dt * 10));
    showLine(e.tele, e.g.position.x, e.g.position.z, e.dir, 1.0, 9);
    if (e.t <= 0){ e.state = 'slide'; e.t = 0.85; e.hitOnce = false; e.bounced = false; play('dash'); } }
  else if (e.state === 'slide'){ move(e.dir, 10.5); face(e.dir, 20); e.torso.rotation.x = 1.45; e.torso.rotation.z = 0; e.flips.forEach((f, i) => { f.rotation.z = (i ? -1 : 1) * 1.3; });
    if (rnd() < 0.6) spawnFx(e.g.position.x, 0.1, e.g.position.z, (rnd() - 0.5), 1, (rnd() - 0.5), 0xf4f8ff, 0.07, 0.4, 2, 0);
    if (!e.hitOnce && dist < e.r + 0.5 && hero.position.y < 0.8){ if (hurtPlayer(12 * e.dm, e.g.position.x, e.g.position.z, 7) !== 'dodge') e.hitOnce = true; }
    if (!e.bounced && Math.hypot(e.g.position.x, e.g.position.z) > ARENA - 0.6){ e.bounced = true; e.dir = angTo(e.g.position.x, e.g.position.z, 0, 0) + (rnd() - 0.5) * 0.8; play('wall'); e.t = Math.max(e.t, 0.45); }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.7; } }
  else if (e.state === 'recover'){ e.torso.rotation.x = lerp(e.torso.rotation.x, 0, 1 - Math.exp(-dt * 4)); if (e.t <= 0){ e.state = 'chase'; e.cd = 1.5 + rnd(); } }
}

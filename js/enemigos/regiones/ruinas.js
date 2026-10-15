'use strict';
/* ---------- Ruinas: Gárgola ---------- */
const wingGeo = (() => { const s = new THREE.Shape(); const P = [[0, 0.08], [0.32, 0.3], [0.78, 0.42], [0.98, 0.18], [0.8, 0.04], [0.66, -0.16], [0.5, -0.02], [0.34, -0.2], [0.18, -0.04], [0, -0.1]];
  s.moveTo(...P[0]); for (const p of P.slice(1)) s.lineTo(...p); const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); return g; })();
function makeGargoyle(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0xf0e8f8, 0.08], [0x5a5262], [0xff8a2a, 1], [0x9a92a6]]);
  S[0].m.uniforms.uMap.value = gStoneTex; S[0].m.uniforms.uHasMap.value = 1; S.push(sideMat(0x8a8098, 0.1));
  const body = new THREE.Group(); body.position.y = 1.7; body.rotation.x = 0.25; g.add(body);
  sculpt(body, [[-0.3, 0.14, 0.12, 0.14], [-0.12, 0.21, 0.2, 0.2, 0, 0.02], [0.08, 0.25, 0.24, 0.21, 0, 0.05], [0.24, 0.18, 0.18, 0.16, 0, 0.08], [0.32, 0.1, 0.1, 0.1, 0, 0.1]], S[0].m, { n: 7 });
  const head = new THREE.Group(); head.position.set(0, 0.36, 0.16); body.add(head);
  sculpt(head, [[-0.08, 0.11, 0.14, 0.1], [0.04, 0.14, 0.17, 0.13], [0.14, 0.11, 0.12, 0.1], [0.2, 0.05, 0.05, 0.05]], S[0].m, { n: 7 });
  lump(head, 0.08, S[0].m, 0, -0.01, 0.17, 1, 0.75, 1.3);
  for (const s of [-1, 1]){ const h = mesh(new THREE.ConeGeometry(0.035, 0.22, 5), S[1].m, 0.08 * s, 0.17, -0.02, head); h.rotation.set(-0.6, 0, -0.5 * s);
    mesh(B(0.05, 0.025, 0.02), S[2].m, 0.055 * s, 0.05, 0.16, head); const f = mesh(new THREE.ConeGeometry(0.018, 0.06, 4), makeMat(0xf0e6c8), 0.04 * s, -0.08, 0.21, head); f.rotation.x = Math.PI; }
  const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(0.14 * s, 0.2, -0.12); body.add(w); const m = mesh(wingGeo, S[4].m, 0, 0, 0, w); m.scale.set(1.35 * s, 1, 1.35);
    const bone = mesh(C(0.02, 0.012, 0.8, 4), S[1].m, 0.4 * s, 0.01, -0.1, w); bone.rotation.z = Math.PI / 2; bone.rotation.y = 0.3 * s; return w; });
  for (const s of [-1, 1]){ lump(body, 0.09, S[0].m, 0.13 * s, -0.32, 0.08, 1, 1.2, 1.1); lump(body, 0.05, S[1].m, 0.13 * s, -0.45, 0.16, 1.2, 0.6, 1.4, 'o');
    const a = lump(body, 0.06, S[0].m, 0.24 * s, 0.05, 0.14, 0.8, 1.4, 0.8); a.rotation.z = 0.4 * s; }
  const tail = new THREE.Group(); tail.position.set(0, -0.3, -0.16); body.add(tail);
  for (let i = 0; i < 4; i++){ const t = mesh(new THREE.ConeGeometry(0.05 - i * 0.01, 0.22, 4), S[0].m, 0, -0.06 - i * 0.12, -0.08 - i * 0.12, tail); t.rotation.x = -2.2 + i * 0.3; }
  const tele = lineTele();
  return newEnemy('gargoyle', g, body, S, { hp: 85, r: 0.5, speed: 2.6, numY: 2.5, fly: true, wings, head, tail, tele, eye: S[2], upd: updGargoyle, orbitA: rnd() * TAU });
}
function updGargoyle(e, dt, dist, toP, face, move){
  const B_ = e.body; e.tele.visible = false; const fl = Math.sin(time * (e.state === 'swoop' ? 22 : 11) + e.seed);
  e.wings.forEach((w, i) => { w.rotation.z = (i ? 1 : -1) * (0.55 + fl * 0.45); w.rotation.y = (i ? 1 : -1) * 0.3; });
  if (e.state === 'hurt'){ B_.rotation.x = -0.3; if (e.t <= 0) e.state = 'chase'; return; }
  if (e.state === 'chase'){ e.orbitA += dt * 0.9; B_.position.y = lerp(B_.position.y, 1.7 + Math.sin(time * 2 + e.seed) * 0.2, 1 - Math.exp(-dt * 4)); B_.rotation.x = 0.15;
    const tx = hero.position.x + Math.cos(e.orbitA) * 3.6, tz = hero.position.z + Math.sin(e.orbitA) * 3.6;
    const a = angTo(e.g.position.x, e.g.position.z, tx, tz), d = Math.hypot(tx - e.g.position.x, tz - e.g.position.z); if (d > 0.3) move(a, e.speed * Math.min(1, d)); face(toP, 6);
    if (!player.dead && e.cd <= 0 && dist < 7){ e.state = 'windup'; e.t = 0.75; e.dir = toP; play('sentCharge'); } }
  else if (e.state === 'windup'){ if (e.t > 0.25) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 8)); face(e.dir, 14); B_.position.y = lerp(B_.position.y, 2.4, 1 - Math.exp(-dt * 6)); B_.rotation.x = -0.4;
    e.eye.c = Math.sin(time * 40) > 0 ? 0xffe040 : 0xff3a2a; showLine(e.tele, e.g.position.x, e.g.position.z, e.dir, 1.4, 7.5);
    if (e.t <= 0){ e.state = 'swoop'; e.t = 0.62; e.hitOnce = false; e.eye.c = e.eye.base; play('dive'); } }
  else if (e.state === 'swoop'){ move(e.dir, 12); face(e.dir, 20); B_.position.y = lerp(B_.position.y, 0.7, 1 - Math.exp(-dt * 12)); B_.rotation.x = 0.9;
    if (!e.hitOnce && dist < e.r + 0.55 && hero.position.y < 1.2){ if (hurtPlayer(13 * e.dm, e.g.position.x, e.g.position.z, 6) !== 'dodge') e.hitOnce = true; }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.7; } }
  else if (e.state === 'recover'){ B_.rotation.x = 0; B_.position.y = lerp(B_.position.y, 1.7, 1 - Math.exp(-dt * 3)); if (e.t <= 0){ e.state = 'chase'; e.cd = 1.6 + rnd() * 1.2; } }
}

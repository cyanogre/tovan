'use strict';
/* ---------- Jefe del castillo: El de los Seis Ojos ---------- */
const crescentGeo = new THREE.TorusGeometry(0.6, 0.08, 3, 12, Math.PI * 0.95); crescentGeo.rotateX(Math.PI / 2);
const crescentMat = makeMat(0xc89aff, { emissive: 1 });
function makeSixEyes(){
  const e = makeOni(); e.type = 'sixeyes';
  e.mats[0].c = e.mats[0].base = 0x6a3a9a; e.mats[6].c = e.mats[6].base = 0x3a1a5a; e.mats[4].c = e.mats[4].base = 0x2a2030; e.mats[1].c = e.mats[1].base = 0x0a0a14;
  e.mats[2].c = e.mats[2].base = 0xff5a3a;
  const head = e.torso.children.find(o => o.isGroup && !e.arms.includes(o));
  if (head) for (const y of [0.37, 0.15]) for (const s of [-1, 1]) mesh(B(0.09, 0.05, 0.04), e.mats[2].m, 0.11 * s, y, 0.24, head);
  const club = e.arms[1].children.find(o => o.isGroup); if (club){ club.visible = false;
    const kat = new THREE.Group(); kat.position.copy(club.position); kat.rotation.copy(club.rotation); e.arms[1].add(kat);
    mesh(B(0.07, 0.45, 0.07), e.mats[1].m, 0, 0.1, 0, kat); mesh(B(0.3, 0.04, 0.3), makeMat(0xd9a441), 0, 0.34, 0, kat);
    mesh(B(0.06, 2.1, 0.02), makeMat(0xd8d8f0, { emissive: 0.35 }), 0, 1.4, 0, kat); }
  const sc = 1.85; e.g.scale.setScalar(sc); e.scale = sc; e.r = 0.55 * sc; e.numY = 2.4 * sc; e.speed = 2.1;
  e.isBoss = true; e.bossName = 'El de los Seis Ojos'; e.bossHp = 1500; e.hp = e.maxHp = 1500; e.upd = updSixEyes; e.seq = 0; e.cd = 1.2;
  e.line = mesh(teleGeo, redTele(), 0, 0.05, 0); e.line.visible = false; e.parts = [e.line];
  return e;
}
function crescentShot(x, z, a, sp, dmg){ const m = mesh(crescentGeo, crescentMat, x, 1.05, z); m.rotation.y = a; projectiles.push({ m, vx: Math.sin(a) * sp, vz: Math.cos(a) * sp, life: 3, owner: 'enemy', dmg }); }
function updSixEyes(e, dt, dist, toP, face, move){
  const walk = sp => { const a = sp ? Math.sin(time * sp) * 0.5 : 0; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; };
  const to = (o, v, k = 10) => { o.rotation.x = lerp(o.rotation.x, v, 1 - Math.exp(-dt * k)); };
  const R = e.arms[1]; e.tele.visible = false; e.line.visible = false;
  if (e.state === 'hurt') e.state = 'chase';
  if (e.state === 'chase'){ face(toP, 6); to(R, -0.4); if (!player.dead && dist > 3){ move(toP, e.speed); walk(7); } else walk(0);
    if (!player.dead && e.cd <= 0){ const act = ['cres', 'dash', 'moon'][e.seq++ % 3]; e.state = act + 'W'; e.t = act === 'moon' ? 0.9 : act === 'dash' ? 0.75 : 0.6; e.dir = toP; play('oniRoar'); } }
  else if (e.state === 'cresW'){ face(toP, 10); to(R, -2.8, 12); walk(0);
    if (e.t <= 0){ for (let k = -2; k <= 2; k++) crescentShot(e.g.position.x, e.g.position.z, toP + k * 0.24, 7, 11 * e.dm); play('swingBig'); e.state = 'rec'; e.t = 0.6; } }
  else if (e.state === 'dashW'){ if (e.t > 0.3) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 8)); face(e.dir, 20); to(R, -2.2, 10);
    e.line.visible = true; e.line.position.set(e.g.position.x, 0.05, e.g.position.z); e.line.rotation.y = e.dir; e.line.scale.set(2, 1, 6.5);
    e.line.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); if (e.t <= 0){ e.state = 'dash'; e.t = 0.35; e.hitOnce = false; play('swingBig'); } }
  else if (e.state === 'dash'){ move(e.dir, 17); face(e.dir, 20); to(R, -0.3, 30); walk(20);
    if (!e.hitOnce && dist < e.r + 0.6 && hero.position.y < 1.2){ if (hurtPlayer(18 * e.dm, e.g.position.x, e.g.position.z, 8) === 'hit') e.hitOnce = true; }
    if (e.t <= 0){ e.state = 'rec'; e.t = 0.8; } }
  else if (e.state === 'moonW'){ e.g.rotation.y += dt * (4 + (0.9 - e.t) * 12); to(R, -1.6, 8);
    if (e.t <= 0){ for (let k = 0; k < 14; k++) crescentShot(e.g.position.x, e.g.position.z, k / 14 * TAU, 5.5, 10 * e.dm); play('specialBoom'); ringFx(e.g.position.x, e.g.position.z, 0xc89aff, 0.3, 3, 0.4); e.state = 'rec'; e.t = 1.0; } }
  else if (e.state === 'rec'){ to(R, -0.5, 4); walk(0); if (e.t <= 0){ e.state = 'chase'; e.cd = 1.1 + rnd() * 0.5; } }
}

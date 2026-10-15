'use strict';
/* ---------- Jefe: Míster Confianza ---------- */
const oneTex = texAsset('jefes/mister-confianza-numero-uno', { borde: true });
function makeStar(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0xf0c040], [0xffffff], [0x1a1a2a], [0xe8b894], [0xd83a3a], [0x3a6ad8], [0xffffff, 1]]);
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.25 * s, 0.9, 0); body.add(L); mesh(B(0.3, 0.6, 0.32), S[0].m, 0, -0.3, 0, L); mesh(B(0.32, 0.36, 0.38), S[1].m, 0, -0.72, 0.03, L); return L; });
  const torso = new THREE.Group(); torso.position.y = 0.95; body.add(torso);
  mesh(B(0.7, 0.2, 0.46), S[4].m, 0, 0.05, 0, torso); mesh(B(1.15, 0.8, 0.6), S[0].m, 0, 0.55, 0, torso);
  mesh(new THREE.PlaneGeometry(0.4, 0.4), makeMat(0xffffff, { map: oneTex, emissive: 0.4 }), 0, 0.62, 0.31, torso);
  for (const s of [-1, 1]) mesh(B(0.38, 0.22, 0.5), S[5].m, 0.62 * s, 0.9, 0, torso);
  const head = new THREE.Group(); head.position.y = 1.02; torso.add(head);
  mesh(B(0.5, 0.52, 0.48), S[3].m, 0, 0.25, 0, head); mesh(B(0.44, 0.22, 0.2), S[3].m, 0, 0.03, 0.18, head);
  mesh(B(0.54, 0.13, 0.5), S[2].m, 0, 0.32, 0.01, head); for (const s of [-1, 1]) mesh(B(0.1, 0.05, 0.03), S[6].m, 0.12 * s, 0.32, 0.26, head);
  for (let i = 0; i < 4; i++){ const c = mesh(new THREE.ConeGeometry(0.1, 0.35, 4), S[2].m, -0.12 + i * 0.09, 0.56, 0.05 - i * 0.06, head); c.rotation.set(-1.1, 0, 0.5); }
  mesh(B(0.14, 0.03, 0.02), S[2].m, 0, 0.12, 0.26, head);
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.72 * s, 0.85, 0); torso.add(A); mesh(B(0.28, 0.6, 0.3), S[0].m, 0, -0.3, 0, A); mesh(B(0.34, 0.3, 0.34), S[1].m, 0, -0.7, 0.02, A); return A; });
  const cape = new THREE.Group(); cape.position.set(0, 0.95, -0.32); torso.add(cape);
  const capeM = mesh(new THREE.PlaneGeometry(1.3, 1.9, 1, 4), makeMat(0xd83a3a, { side: THREE.DoubleSide }), 0, -0.95, 0, cape);
  const line = mesh(teleGeo, redTele(), 0, 0.05, 0); line.visible = false;
  const beam = new THREE.Group(); scene.add(beam); beam.visible = false;
  mesh(beamGeo, makeMat(0xfff6c0, { emissive: 1 }), 0, 0, 0, beam); const bo = mesh(beamGeo, makeMat(0xffd23a, { emissive: 1, opacity: 0.5, side: THREE.DoubleSide }), 0, 0, 0, beam); bo.scale.set(1.8, 1.8, 1);
  const sc = 1.45; g.scale.setScalar(sc);
  return newEnemy('star', g, body, S, { isBoss: true, heavy: true, bossName: 'Míster Confianza', bossHp: 2000, hp: 2000, r: 0.75 * sc, numY: 3.8, scale: sc, speed: 2.4,
    legs, arms, torso, cape, capeM, line, beam, parts: [line, beam], st: 'idle', seq: 0, upd: updStar,
    onSpawn: e => { e.g.scale.setScalar(sc); e.spawnT = 0; e.t = 1.4; if (chMode === 'arcade'){ e.g.position.set(8, 0, 0); } play('superOn'); } });
}
function starShout(e, t){ tA.set(e.g.position.x, e.numY + 0.6, e.g.position.z); spawnNumber(tA, t, 'react', '#ffd23a'); }
function updStar(e, dt, dist, toP, face, move){
  const walk = sp => { const a = sp ? Math.sin(time * sp) * 0.5 : 0; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; };
  const arm = (i, v, k = 10) => { e.arms[i].rotation.x = lerp(e.arms[i].rotation.x, v, 1 - Math.exp(-dt * k)); };
  e.cape.rotation.x = 0.25 + Math.sin(time * 5) * 0.12 + (e.st === 'dash' || e.st === 'charge' ? 0.7 : 0);
  e.line.visible = false; e.beam.visible = false;
  const px = hero.position.x, pz = hero.position.z;
  const pick = () => {
    const m = chMode;
    const acts = m === 'shmup' ? ['ring', 'spiral', 'fans'] : m === 'arcade' ? ['charge', 'jump', 'fans'] : ['punch', 'beam', 'fans'];
    const act = acts[e.seq++ % acts.length];
    if (act === 'punch'){ e.st = 'punchW'; e.t = 0.75; e.dir = toP; starShout(e, '¡PUÑO DE LA CONFIANZA!'); play('oniRoar'); }
    else if (act === 'beam'){ e.st = 'beamW'; e.t = 0.9; e.dir = toP; starShout(e, '¡RAYO DEL NÚMERO UNO!'); play('kameCharge'); }
    else if (act === 'fans'){ e.st = 'fans'; e.t = 1.0; starShout(e, '¡MIS FANS!'); play('roar'); }
    else if (act === 'charge'){ e.st = 'chargeW'; e.t = 0.8; e.dir = px > e.g.position.x ? Math.PI / 2 : -Math.PI / 2; starShout(e, '¡EMBESTIDA ESTELAR!'); play('bruteWarn'); }
    else if (act === 'jump'){ e.st = 'jumpW'; e.t = 0.45; starShout(e, '¡ATERRIZAJE HEROICO!'); }
    else if (act === 'ring'){ e.st = 'ring'; e.t = 1.6; e.rn = 0; e.rk = 0; starShout(e, '¡LLUVIA DE AUTÓGRAFOS!'); }
    else { e.st = 'spiral'; e.t = 2.2; e.rn = 0; e.ra = 0; starShout(e, '¡GIRO MEDIÁTICO!'); } };
  if (e.st === 'idle'){ face(toP, 6); arm(0, Math.sin(time * 3) * 0.2); arm(1, -Math.sin(time * 3) * 0.2);
    const keep = chMode === 'shmup' ? 6 : 3.2; if (!player.dead && dist > keep){ move(toP, e.speed); walk(8); } else walk(0);
    if (e.t <= 0 && !player.dead) pick(); }
  else if (e.st === 'punchW'){ if (e.t > 0.3) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 8)); face(e.dir, 20); arm(1, 0.9); walk(0);
    e.line.visible = true; e.line.position.set(e.g.position.x, 0.05, e.g.position.z); e.line.rotation.y = e.dir; e.line.scale.set(2, 1, 7);
    e.line.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); if (e.t <= 0){ e.st = 'dash'; e.t = 0.38; e.hitOnce = false; play('swingBig'); } }
  else if (e.st === 'dash'){ move(e.dir, 17); face(e.dir, 20); arm(1, -1.6, 30); walk(20);
    if (!e.hitOnce && dist < e.r + 0.6 && hero.position.y < 1.2){ if (hurtPlayer(17 * e.dm, e.g.position.x, e.g.position.z, 9) === 'hit') e.hitOnce = true; }
    if (e.t <= 0){ e.st = 'idle'; e.t = 1.1; } }
  else if (e.st === 'beamW' || e.st === 'beamGo'){ if (e.st === 'beamW' && e.t > 0.35) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 6)); face(e.dir, 20); arm(0, -1.5); arm(1, -1.5); walk(0);
    const fx = Math.sin(e.dir), fz = Math.cos(e.dir);
    if (e.st === 'beamW'){ e.line.visible = true; e.line.position.set(e.g.position.x, 0.05, e.g.position.z); e.line.rotation.y = e.dir; e.line.scale.set(1.6, 1, 13);
      e.line.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); if (e.t <= 0){ e.st = 'beamGo'; e.t = 0.9; e.bt = 0; play('beam'); } }
    else { e.beam.visible = true; e.beam.position.set(e.g.position.x + fx * 0.8, 1.6, e.g.position.z + fz * 0.8); e.beam.rotation.y = e.dir; e.beam.scale.set(0.45, 0.45, 13);
      lightFlash(e.g.position.x + fx * 4, 1.4, e.g.position.z + fz * 4, 0xffe070, 2, 10); e.bt -= dt;
      if (e.bt <= 0){ e.bt = 0.2; const ex = px - e.g.position.x, ez = pz - e.g.position.z, along = ex * fx + ez * fz, side = Math.abs(ex * fz - ez * fx);
        if (along > 0 && along < 13 && side < 0.9 && hero.position.y < 1.6) hurtPlayer(9 * e.dm, e.g.position.x, e.g.position.z, 3); }
      if (e.t <= 0){ e.st = 'idle'; e.t = 1.2; } } }
  else if (e.st === 'fans'){ arm(0, -2.6); arm(1, -2.6); walk(0);
    if (e.t <= 0){ for (let k = 0; k < 3; k++){ const a = rnd() * TAU; let x = e.g.position.x + Math.cos(a) * 2, z = e.g.position.z + Math.sin(a) * 2;
        if (chMode === 'arcade') z = clamp(z, -1.8, 1.8); else { const v = clampArena(new V3(x, 0, z)); x = v.x; z = v.z; } spawnEnemy('imp', [x, z]); }
      e.st = 'idle'; e.t = 1.3; } }
  else if (e.st === 'chargeW'){ face(e.dir, 20); walk(0); e.line.visible = true; e.line.position.set(e.g.position.x, 0.05, e.g.position.z); e.line.rotation.y = e.dir; e.line.scale.set(2.2, 1, 18);
    e.line.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); if (e.t <= 0){ e.st = 'charge'; e.t = 1.1; e.hitOnce = false; play('charge'); } }
  else if (e.st === 'charge'){ move(e.dir, 15); face(e.dir, 20); walk(20); arm(0, -1.4); arm(1, -1.4);
    if (!e.hitOnce && dist < e.r + 0.5 && hero.position.y < 1.0){ if (hurtPlayer(16 * e.dm, e.g.position.x, e.g.position.z, 9) === 'hit') e.hitOnce = true; }
    if (e.t <= 0 || Math.abs(e.g.position.x) > 9.3){ e.st = 'idle'; e.t = 1.2; shake = Math.max(shake, 0.2); } }
  else if (e.st === 'jumpW'){ walk(0); if (e.t <= 0){ e.st = 'air'; e.t = 0.8; e.from = e.g.position.clone(); e.to = new V3(px, 0, chMode === 'arcade' ? clamp(pz, -1.8, 1.8) : pz); play('jump'); } }
  else if (e.st === 'air'){ const k = clamp(1 - e.t / 0.8, 0, 1); e.g.position.lerpVectors(e.from, e.to, k); e.g.position.y = Math.sin(k * Math.PI) * 3.5; arm(0, -2.8); arm(1, -2.8); e.vx = e.vz = 0;
    if (e.t <= 0){ e.g.position.y = 0; slamRing(e); if (dist < e.r + 0.6) hurtPlayer(16 * e.dm, e.g.position.x, e.g.position.z, 8); e.st = 'idle'; e.t = 1.2; } }
  else if (e.st === 'ring'){ e.rn -= dt; arm(0, -2); arm(1, -2);
    if (e.rn <= 0 && e.rk < 3){ e.rn = 0.5; e.rk++; for (let k = 0; k < 16; k++){ const a = k / 16 * TAU + e.rk * 0.2;
        projectiles.push({ m: mesh(orbGeo, orbMatE, e.g.position.x + Math.sin(a), 1.05, e.g.position.z + Math.cos(a)), vx: Math.sin(a) * 4.5, vz: Math.cos(a) * 4.5, life: 3.2, owner: 'enemy', dmg: 9 * e.dm }); } play('shoot'); }
    if (e.t <= 0){ e.st = 'idle'; e.t = 1.0; } }
  else if (e.st === 'spiral'){ e.rn -= dt; e.g.rotation.y += dt * 6;
    if (e.rn <= 0){ e.rn = 0.08; e.ra += 0.37; for (const off of [0, TAU / 3, TAU * 2 / 3]){ const a = e.ra + off;
        projectiles.push({ m: mesh(orbGeo, orbMatE, e.g.position.x + Math.sin(a), 1.05, e.g.position.z + Math.cos(a)), vx: Math.sin(a) * 4, vz: Math.cos(a) * 4, life: 3, owner: 'enemy', dmg: 8 * e.dm }); } }
    if (e.t <= 0){ e.st = 'idle'; e.t = 1.0; } }
}

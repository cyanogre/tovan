'use strict';
/* ---------- Jefe: La Tetera de Utah ---------- */
const potProf = [[0, 0], [0.9, 0], [1.12, 0.1], [1.36, 0.42], [1.46, 0.82], [1.4, 1.22], [1.2, 1.52], [0.95, 1.66], [0.82, 1.7]].map(([x, y]) => new THREE.Vector2(x, y));
const lidProf = [[0.84, 1.7], [0.7, 1.86], [0.36, 1.96], [0.12, 2.0], [0.001, 2.04]].map(([x, y]) => new THREE.Vector2(x, y));
const cupGeo = new THREE.LatheGeometry([[0, 0], [0.16, 0], [0.2, 0.05], [0.24, 0.22], [0.22, 0.24]].map(([x, y]) => new THREE.Vector2(x, y)), 12);
const cupMat = makeMat(0xf4f0e8, { emissive: 0.2 }), teaMat = makeMat(0x8a4a1a, { emissive: 0.25, opacity: 0.8 });
function teapotMesh(mat, parent){
  const pot = new THREE.Group(); parent.add(pot);
  const add = geo => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; pot.add(m); return m; };
  add(new THREE.LatheGeometry(potProf, 48));
  const lid = new THREE.Group(); pot.add(lid); const l1 = new THREE.Mesh(new THREE.LatheGeometry(lidProf, 40), mat); l1.castShadow = true; lid.add(l1);
  const kn = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 14), mat); kn.position.y = 2.17; lid.add(kn);
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(1.1, 0.55, 0), new V3(1.75, 0.75, 0), new V3(2.1, 1.35, 0), new V3(2.45, 1.75, 0)]), 24, 0.17, 12));
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(-1.3, 1.35, 0), new V3(-2.05, 1.45, 0), new V3(-2.15, 0.85, 0), new V3(-1.75, 0.42, 0), new V3(-1.35, 0.5, 0)]), 32, 0.12, 10));
  return { pot, lid };
}
function makeTeapot(){
  const g = new THREE.Group(); scene.add(g);
  const mat = new THREE.MeshStandardMaterial({ color: 0xf0f2f6, metalness: 1, roughness: 0.12 }); if (renderEnv){ mat.envMap = renderEnv; mat.envMapIntensity = 1.2; }
  const { pot, lid } = teapotMesh(mat, g); pot.scale.setScalar(1.35);
  const tele = mesh(coneGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5, side: THREE.DoubleSide }), 0, 0.05, 0); tele.visible = false;
  const puddles = Array.from({ length: 5 }, () => { const m = mesh(circleGeo, teaMat, 0, 0.04, 0); m.visible = false; m.userData = { life: 0 }; return m; });
  const steamC = Array.from({ length: 7 }, () => { const m = mesh(circleGeo, redTele(), 0, 0.05, 0); m.visible = false; return m; });
  return newEnemy('teapot', g, pot, [stdE(mat, 0xeef2fa)], { isBoss: true, heavy: true, bossName: 'La Tetera de Utah', bossHp: 1400, hp: 1400, r: 1.9, numY: 3.8,
    pot, lid, tele, puddles, steamC, parts: [tele, ...puddles, ...steamC], st: 'idle', seq: 0, upd: updTeapot, puddleTick: 0,
    onSpawn: e => { e.g.scale.setScalar(1); e.spawnT = 0; e.t = 1.8; e.dm *= 0.62; e.fzMul = 1.3; e.ringMul = 0.55; play('teaWhistle'); } });
}
function updTeapot(e, dt, dist, toP, face, move){
  const face2 = (a, k = 5) => { e.g.rotation.y = lerpAngle(e.g.rotation.y, a - Math.PI / 2, 1 - Math.exp(-dt * k)); };
  const px = hero.position.x, pz = hero.position.z; e.tele.visible = false;
  e.puddleTick -= dt; const tick = e.puddleTick <= 0; if (tick) e.puddleTick = 0.5;
  for (const p of e.puddles){ if (!p.visible) continue; p.userData.life -= dt; if (p.userData.life <= 0){ p.visible = false; continue; }
    if (rnd() < dt * 6) spawnFx(p.position.x + (rnd() - 0.5), 0.1, p.position.z + (rnd() - 0.5), 0, 1, 0, 0xffffff, 0.08, 0.6, -1, 1.5);
    if (tick && Math.hypot(px - p.position.x, pz - p.position.z) < 0.95 && hero.position.y < 0.4) hurtPlayer(4 * e.dm, p.position.x, p.position.z, 1); }
  const pick = () => { const act = ['hop', 'pour', 'hop', 'whistle', 'cups'][e.seq++ % 5];
    if (act === 'hop'){ e.st = 'crouch'; e.t = 0.35; e.hops = 2; }
    else if (act === 'pour'){ e.st = 'pourAim'; e.t = 1.0; play('bruteWarn'); }
    else if (act === 'whistle'){ e.st = 'whistle'; e.t = 1.25; play('teaWhistle');
      e.steamC.forEach((c, i) => { if (i >= 5){ c.visible = false; return; } const a = rnd() * TAU, r = i ? 1 + rnd() * 3 : 0; const v = clampArena(new V3(px + Math.cos(a) * r, 0, pz + Math.sin(a) * r)); c.position.set(v.x, 0.05, v.z); c.scale.setScalar(1.2); c.visible = true; }); }
    else { e.st = 'cupsWarn'; e.t = 0.75; e.cupN = 0; play('bruteWarn'); ringFx(e.g.position.x, e.g.position.z, 0xff3a2a, 0.5, 5.5, 0.7); } };
  if (e.st === 'idle'){ face2(toP); e.pot.scale.y = 1.35 * (1 + Math.sin(time * 3) * 0.02); e.pot.rotation.z = lerp(e.pot.rotation.z, 0, 1 - Math.exp(-dt * 4));
    if (!player.dead && dist > 4) move(toP, 1.2); if (e.t <= 0 && !player.dead) pick(); }
  else if (e.st === 'crouch'){ face2(toP, 8); e.pot.scale.y = lerp(e.pot.scale.y, 1.35 * 0.75, 1 - Math.exp(-dt * 12));
    if (e.t <= 0){ e.st = 'air'; e.t = 0.8; e.from = e.g.position.clone(); const d = Math.min(4, dist - 1.5); e.to = clampArena(new V3(e.g.position.x + Math.sin(toP) * d, 0, e.g.position.z + Math.cos(toP) * d), 5.3); play('jump'); } }
  else if (e.st === 'air'){ const k = clamp(1 - e.t / 0.8, 0, 1); e.pot.scale.y = 1.35 * 1.1; e.g.position.lerpVectors(e.from, e.to, k); e.g.position.y = Math.sin(k * Math.PI) * 3; e.vx = e.vz = 0;
    if (e.t <= 0){ e.g.position.y = 0; e.pot.scale.y = 1.35 * 0.8; slamRing(e); if (Math.hypot(px - e.g.position.x, pz - e.g.position.z) < e.r + 0.6) hurtPlayer(13 * e.dm, e.g.position.x, e.g.position.z, 8);
      if (--e.hops > 0){ e.st = 'crouch'; e.t = 0.55; } else { e.st = 'idle'; e.t = 1.8; } } }
  else if (e.st === 'pourAim' || e.st === 'pourGo'){
    if (e.st === 'pourAim' && e.t > 0.35) face2(toP, 8);
    e.pot.rotation.z = lerp(e.pot.rotation.z, -0.6, 1 - Math.exp(-dt * 6));
    const a = e.g.rotation.y + Math.PI / 2, fx = Math.sin(a), fz = Math.cos(a);
    const tx = e.g.position.x + fx * 2.6, tz = e.g.position.z + fz * 2.6;
    if (e.st === 'pourAim'){ e.tele.visible = true; e.tele.position.set(tx, 0.05, tz); e.tele.rotation.y = a; e.tele.scale.setScalar(4.6);
      e.tele.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); if (e.t <= 0){ e.st = 'pourGo'; e.t = 1.6; e.pn = 0; play('breath'); } }
    else { for (let i = 0; i < 4; i++){ const aa = a + (rnd() - 0.5) * 0.5, sp = 4 + rnd() * 3; spawnFx(tx, 2.4, tz, Math.sin(aa) * sp, 0.5, Math.cos(aa) * sp, rnd() < 0.5 ? 0x8a4a1a : 0xb8703a, 0.12, 0.6, 9, 0.5); }
      e.pn -= dt; if (e.pn <= 0){ e.pn = 0.4; const p = e.puddles.find(q => !q.visible); if (p){ const d = 1.2 + (1.6 - e.t) * 2.6, aa = a + (rnd() - 0.5) * 0.4;
        p.position.set(tx + Math.sin(aa) * d, 0.04, tz + Math.cos(aa) * d); clampArena(p.position); p.scale.setScalar(1.0); p.visible = true; p.userData.life = 3.8; } }
      if (e.t <= 0){ e.st = 'idle'; e.t = 1.6; } } }
  else if (e.st === 'whistle'){ e.lid.position.y = Math.abs(Math.sin(time * 25)) * 0.25;
    e.steamC.forEach(c => { if (c.visible) c.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); });
    if (e.t <= 0){ e.lid.position.y = 0; play('steam');
      e.steamC.forEach(c => { if (!c.visible) return; c.visible = false;
        for (let i = 0; i < 10; i++) spawnFx(c.position.x + (rnd() - 0.5) * 0.8, 0.2, c.position.z + (rnd() - 0.5) * 0.8, 0, 3 + rnd() * 2, 0, 0xffffff, 0.16, 0.8, -1, 2);
        if (Math.hypot(px - c.position.x, pz - c.position.z) < 1.25 && hero.position.y < 1.4) hurtPlayer(9 * e.dm, c.position.x, c.position.z, 4); });
      e.st = 'idle'; e.t = 1.7; } }
  else if (e.st === 'cupsWarn'){ e.lid.position.y = Math.abs(Math.sin(time * 30)) * 0.18; e.pot.rotation.z = Math.sin(time * 40) * 0.05;
    if (rnd() < dt * 20) spawnFx(e.g.position.x + (rnd() - 0.5) * 2, 3.2, e.g.position.z + (rnd() - 0.5) * 2, 0, 1.5, 0, 0xffffff, 0.12, 0.6, -1, 1.5);
    if (e.t <= 0){ e.lid.position.y = 0; e.pot.rotation.z = 0; e.st = 'cups'; e.t = 1.5; play('roar'); } }
  else if (e.st === 'cups'){ e.g.rotation.y += dt * 6; e.cn = (e.cn || 0) - dt;
    if (e.cn <= 0){ e.cn = 0.17; const a = e.g.rotation.y + Math.PI / 2, x = e.g.position.x + Math.sin(a) * 2.2, z = e.g.position.z + Math.cos(a) * 2.2;
      projectiles.push({ m: mesh(cupGeo, cupMat, x, 1.05, z), vx: Math.sin(a) * 4.6, vz: Math.cos(a) * 4.6, life: 3, owner: 'enemy', dmg: 7 * e.dm }); play('shoot'); }
    if (e.t <= 0){ e.st = 'idle'; e.t = 1.7; } }
}

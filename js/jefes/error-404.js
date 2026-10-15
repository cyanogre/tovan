'use strict';
/* ---------- Jefe: ERROR 404 ---------- */
const missTex = texAsset('jefes/error-404-textura-perdida');
const errLabelTex = texAsset('jefes/error-404-cartel', { borde: true });
const pixMat = makeMat(0xff2ae0, { emissive: 1 }), pixGeo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
function makeError(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0xffffff], [0xff2ae0, 1], [0x20ffe0, 1]]); S[0].m.uniforms.uMap.value = missTex; S[0].m.uniforms.uHasMap.value = 1; S[0].em = 0.6; S[0].m.uniforms.uEmissive.value = 0.6;
  const body = new THREE.Group(); body.position.y = 1.9; g.add(body);
  mesh(B(1.6, 1.6, 1.6), S[0].m, 0, 0, 0, body);
  const bits = Array.from({ length: 14 }, (_, i) => { const m = mesh(B(0.3, 0.3, 0.3), i % 2 ? S[1].m : S[2].m, 0, 0, 0, body); m.userData = { a: rnd() * TAU, r: 1.2 + rnd() * 0.6, y: (rnd() - 0.5) * 1.6 }; return m; });
  const label = mesh(new THREE.PlaneGeometry(2.4, 0.6), makeMat(0xffffff, { map: errLabelTex, emissive: 1, side: THREE.DoubleSide }), 0, 1.5, 0, body);
  const ghost = mesh(B(1.6, 1.6, 1.6), makeMat(0xff2ae0, { emissive: 1, opacity: 0.4 }), 0, -10, 0); ghost.visible = false;
  const holes = Array.from({ length: 5 }, () => { const m = mesh(B(1.7, 0.03, 1.7), makeMat(0xff2ae0, { emissive: 1, opacity: 0.6 }), 0, 0.03, 0); m.visible = false; m.userData = { st: 0, t: 0 }; return m; });
  return newEnemy('error', g, body, S, { isBoss: true, heavy: true, bossName: 'ERROR 404', bossHp: 1800, hp: 1800, r: 1.1, numY: 3.4, bits, label, ghost, holes, parts: [ghost, ...holes],
    st: 'idle', seq: 0, upd: updError, holeTick: 0, onSpawn: e => { e.g.scale.setScalar(1); e.spawnT = 0; e.t = 1.5; play('glitch'); } });
}
function updError(e, dt, dist, toP, face, move){
  const px = hero.position.x, pz = hero.position.z, fast = e.hp < e.maxHp * 0.5 ? 0.7 : 1;
  if (fast < 1) document.body.classList.add('glitch-hard');
  e.body.position.set((rnd() < 0.08 ? (rnd() - 0.5) * 0.4 : 0), 1.9 + Math.sin(time * 2) * 0.15, (rnd() < 0.08 ? (rnd() - 0.5) * 0.4 : 0));
  e.body.rotation.y += dt * 0.8; e.bits.forEach(b => { const u = b.userData; u.a += dt * 1.5; if (rnd() < 0.02) u.y = (rnd() - 0.5) * 1.6; b.position.set(Math.cos(u.a) * u.r, u.y, Math.sin(u.a) * u.r); b.rotation.x += dt * 3; });
  e.label.lookAt(camera.position);
  e.holeTick -= dt; const tick = e.holeTick <= 0; if (tick) e.holeTick = 0.4;
  for (const h of e.holes){ if (!h.visible) continue; const u = h.userData; u.t -= dt;
    if (u.st === 1){ h.material.uniforms.uColor.value.setHex(Math.sin(time * 30) > 0 ? 0xff2ae0 : 0x20ffe0); if (u.t <= 0){ u.st = 2; u.t = 3; h.material.uniforms.uColor.value.setHex(0x000000); h.material.uniforms.uOpacity.value = 1; play('glitch'); } }
    else if (u.st === 2){ if (tick && Math.abs(px - h.position.x) < 0.95 && Math.abs(pz - h.position.z) < 0.95 && hero.position.y < 0.3) hurtPlayer(8 * e.dm, h.position.x, h.position.z, 2);
      if (u.t <= 0){ h.visible = false; } } }
  const pick = () => { const act = ['blink', 'bullets', 'holes', 'blink', 'summon'][e.seq++ % 5];
    if (act === 'blink'){ let a = 0, v; let tries = 0; do { a = rnd() * TAU; v = clampArena(new V3(Math.cos(a) * (2.5 + rnd() * 3.2), 0, Math.sin(a) * (2.5 + rnd() * 3.2))); } while (++tries < 10 && Math.hypot(v.x - px, v.z - pz) < 3);
      e.dest = v; e.st = 'blink'; e.t = 0.7 * fast; }
    else if (act === 'bullets'){ e.st = 'bullets'; e.t = 2.4; e.ba = 0; e.bn = 0; play('glitch'); }
    else if (act === 'holes'){ e.holes.forEach((h, i) => { const a = rnd() * TAU, r = i ? 1.5 + rnd() * 2.5 : 0; const v = clampArena(new V3(px + Math.cos(a) * r, 0, pz + Math.sin(a) * r));
        h.position.set(v.x, 0.03, v.z); h.visible = true; h.userData.st = 1; h.userData.t = 1.0 * fast; h.material.uniforms.uOpacity.value = 0.6; }); e.st = 'idle'; e.t = 1.6 * fast; }
    else { for (let k = 0; k < 3; k++){ const a = rnd() * TAU; const v = clampArena(new V3(e.g.position.x + Math.cos(a) * 1.8, 0, e.g.position.z + Math.sin(a) * 1.8)); spawnEnemy('imp', [v.x, v.z]); } e.st = 'idle'; e.t = 1.4 * fast; play('glitch'); } };
  if (e.st === 'idle'){ face(toP, 4); if (e.t <= 0 && !player.dead) pick(); }
  else if (e.st === 'blink'){ e.ghost.visible = Math.sin(time * 40) > 0; e.ghost.position.set(e.dest.x, 1.9, e.dest.z);
    if (e.t <= 0){ e.ghost.visible = false; for (let i = 0; i < 16; i++){ const a = rnd() * TAU; spawnFx(e.g.position.x, 1.9, e.g.position.z, Math.cos(a) * 3, rnd() * 3, Math.sin(a) * 3, i % 2 ? 0xff2ae0 : 0x20ffe0, 0.12, 0.5, 4, 0); }
      e.g.position.set(e.dest.x, 0, e.dest.z); play('glitch'); flash('#ff2ae0', 0.2); e.st = 'idle'; e.t = 0.8 * fast; } }
  else if (e.st === 'bullets'){ e.bn -= dt; if (e.bn <= 0){ e.bn = 0.075 * fast; e.ba += 0.33;
      for (const off of [0, Math.PI]){ const a = e.ba + off; projectiles.push({ m: mesh(pixGeo, pixMat, e.g.position.x + Math.sin(a) * 1.2, 1.05, e.g.position.z + Math.cos(a) * 1.2), vx: Math.sin(a) * 4.3, vz: Math.cos(a) * 4.3, life: 3.2, owner: 'enemy', dmg: 8 * e.dm }); } }
    if (e.t <= 0){ e.st = 'idle'; e.t = 1.0 * fast; } }
}

'use strict';
/* ---------- Jefe: Gashadokuro ---------- */
function makeSkeleton(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0xe8e0c8], [0x1a1620], [0x7fd8ff, 1], [0xcfc6ac]]);
  const root = new THREE.Group(); scene.add(root);
  for (let i = 0; i < 8; i++) mesh(B(0.78, 0.42, 0.62), S[3].m, 0, 0.3 + i * 0.62, 0, root);
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]){ const rb = mesh(B(1.7, 0.16, 0.2), S[0].m, s * 0.95, 2.1 + i * 0.46, 0.35, root); rb.rotation.set(0, -s * 0.55, s * 0.22); }
  mesh(B(0.35, 2.6, 0.25), S[0].m, 0, 3.1, 1.0, root); mesh(B(4.4, 0.4, 0.5), S[0].m, 0, 5.15, 0.1, root);
  const skull = new THREE.Group(); skull.position.set(0, 6.4, 0.25); root.add(skull);
  mesh(B(2.0, 1.7, 2.0), S[0].m, 0, 0.2, 0, skull);
  for (const s of [-1, 1]){ mesh(B(0.56, 0.5, 0.12), S[1].m, s * 0.45, 0.25, 1.0, skull); mesh(B(0.2, 0.2, 0.1), S[2].m, s * 0.45, 0.25, 1.06, skull); }
  const nose = mesh(new THREE.ConeGeometry(0.16, 0.3, 3), S[1].m, 0, -0.2, 1.02, skull); nose.rotation.x = Math.PI;
  for (let i = 0; i < 6; i++) mesh(B(0.18, 0.2, 0.1), S[0].m, -0.55 + i * 0.22, -0.55, 0.98, skull);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.7, 0.1); skull.add(jaw);
  mesh(B(1.6, 0.35, 1.7), S[3].m, 0, -0.15, 0.05, jaw); for (let i = 0; i < 6; i++) mesh(B(0.18, 0.18, 0.1), S[0].m, -0.55 + i * 0.22, 0.08, 0.88, jaw);
  const hands = [-1, 1].map(s => { const H = new THREE.Group(); scene.add(H); mesh(B(1.5, 0.35, 1.5), S[0].m, 0, 0, 0, H);
    for (let k = 0; k < 4; k++){ const f = mesh(C(0.12, 0.1, 1.1, 5), S[3].m, -0.5 + k * 0.33, -0.05, 1.2, H); f.rotation.x = Math.PI / 2; }
    const th = mesh(C(0.13, 0.1, 0.8, 5), S[3].m, -0.85 * s, -0.05, 0.4, H); th.rotation.set(Math.PI / 2, 0, 0.8 * s);
    return { H, s, pos: new V3(3.4 * s, -3, -6), target: new V3(3.4 * s, -3, -6), up: mesh(unitCyl, S[0].m, 0, -20, 0), fo: mesh(unitCyl, S[0].m, 0, -20, 0) }; });
  const tele = mesh(circleGeo, redTele(), 0, 0.05, 0); tele.visible = false;
  const line = mesh(teleGeo, redTele(), 0, 0.05, 0); line.visible = false;
  const rainC = Array.from({ length: 6 }, () => { const m = mesh(circleGeo, makeMat(0x7fd8ff, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); m.visible = false; return m; });
  const parts = [root, tele, line, ...rainC, ...hands.flatMap(h => [h.H, h.up, h.fo])];
  return newEnemy('skeleton', g, root, S, { isBoss: true, heavy: true, noSep: true, bossName: 'Gashadokuro, el esqueleto colosal', bossHp: 1600, hp: 1600, r: 1.0, numY: 2.2,
    spawnT: 0, root, skull, jaw, hands, tele, line, rainC, parts, st: 'rise', seq: 0, reach: false, dieTime: 2.6, upd: updSkeleton, onDying: skeletonDying,
    onSpawn: e => { e.g.scale.setScalar(1); e.spawnT = 0; e.t = 2.4; root.position.set(0, -9, -10.5); shake = 0.5; play('roar'); camYaw = 0; } });
}
const ghostMat = makeMat(0x7fd8ff, { emissive: 1 });
function updSkeleton(e, dt){
  const R = e.root, px = hero.position.x, pz = hero.position.z; e.tele.visible = false; e.line.visible = false; e.weak = false;
  R.updateMatrixWorld();
  const hSel = e.hands[e.hand || 0];
  const rest = h => h.target.set(3.6 * h.s, 1.6 + Math.sin(time * 1.5 + h.s) * 0.3, -5.8);
  const pick = () => { const act = ['slam', 'slam', 'sweep', 'skulls', 'dip'][e.seq++ % 5]; e.hand = e.seq % 2;
    if (act === 'slam'){ e.st = 'slamUp'; e.t = 0.95; e.spot = clampArena(new V3(px, 0, pz), 6); play('bruteWarn'); }
    else if (act === 'sweep'){ const h = e.hands[e.hand]; e.lz = clamp(pz, -4.5, 5); e.st = 'sweepPrep'; e.t = 1.1; e.sx = 7.2 * h.s; e.hitOnce = false; play('bruteWarn'); }
    else if (act === 'skulls'){ e.st = 'skullAim'; e.t = 1.0; play('roar');
      e.rainC.forEach((c, i) => { const a = rnd() * TAU, r = i ? 1 + rnd() * 2.3 : 0; const v = clampArena(new V3(px + Math.cos(a) * r, 0, pz + Math.sin(a) * r)); c.position.set(v.x, 0.05, v.z); c.scale.setScalar(1.15); c.visible = true; }); }
    else { e.st = 'dipDown'; e.t = 1.0; play('roar'); } };
  if (e.st === 'rise'){ R.position.y = lerp(R.position.y, -1.2, 1 - Math.exp(-dt * 1.4)); if (rnd() < 0.5) puffAt((rnd() - 0.5) * 6, -7.5 + rnd(), 3, 2); if (e.t <= 0){ e.st = 'idle'; e.t = 1.2; } e.hands.forEach(rest); }
  else if (e.st === 'idle'){ R.position.y = -1.2 + Math.sin(time * 1.2) * 0.1; R.rotation.x = lerp(R.rotation.x, 0, 1 - Math.exp(-dt * 3)); e.hands.forEach(rest); if (e.t <= 0 && !player.dead) pick(); }
  else if (e.st === 'slamUp'){ if (e.t > 0.45) e.spot = clampArena(new V3(px, 0, pz), 6);
    hSel.target.set(e.spot.x, 4.8, e.spot.z); e.tele.visible = true; e.tele.position.set(e.spot.x, 0.05, e.spot.z); e.tele.scale.setScalar(1.9);
    e.tele.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); if (e.t <= 0){ e.st = 'slamDown'; e.t = 0.14; } }
  else if (e.st === 'slamDown'){ hSel.target.set(e.spot.x, 0.35, e.spot.z);
    if (e.t <= 0){ shake = Math.max(shake, 0.4); ringFx(e.spot.x, e.spot.z, 0xe8e0c8, 0.3, 2.4, 0.35); puffAt(e.spot.x, e.spot.z, 10, 2.5); play('bossSlam');
      if (Math.hypot(px - e.spot.x, pz - e.spot.z) < 2.0 && hero.position.y < 0.9) hurtPlayer(19 * e.dm, e.spot.x, e.spot.z, 8);
      e.st = 'slamStay'; e.t = 1.7; } }
  else if (e.st === 'slamStay'){ if (e.t <= 0){ e.st = 'idle'; e.t = 0.9; } }
  else if (e.st === 'sweepPrep'){ hSel.target.set(e.sx, 0.5, e.lz);
    e.line.visible = true; e.line.position.set(e.sx, 0.05, e.lz); e.line.rotation.y = -Math.sign(e.sx) * Math.PI / 2; e.line.scale.set(1.8, 1, 14.4);
    e.line.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); if (e.t <= 0){ e.st = 'sweepGo'; e.t = 1.15; play('charge'); } }
  else if (e.st === 'sweepGo'){ hSel.pos.x -= Math.sign(e.sx) * 13 * dt; hSel.target.copy(hSel.pos); hSel.target.y = 0.5; hSel.pos.y = 0.5; hSel.pos.z = e.lz;
    if (rnd() < 0.7) puffAt(hSel.pos.x, hSel.pos.z, 1, 1.5);
    if (!e.hitOnce && Math.abs(px - hSel.pos.x) < 1.0 && Math.abs(pz - hSel.pos.z) < 1.0 && hero.position.y < 0.8){ if (hurtPlayer(16 * e.dm, hSel.pos.x, hSel.pos.z, 7) === 'hit') e.hitOnce = true; }
    if (e.t <= 0){ e.st = 'idle'; e.t = 1.0; } }
  else if (e.st === 'skullAim' || e.st === 'skullFire'){ e.jaw.rotation.x = lerp(e.jaw.rotation.x, 0.6, 1 - Math.exp(-dt * 8));
    e.rainC.forEach(c => { if (c.visible) c.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); });
    if (e.st === 'skullAim' && e.t <= 0){ e.st = 'skullFire'; e.t = 1.0; e.ri = 0; e.rn = 0; }
    if (e.st === 'skullFire'){ e.rn -= dt; if (e.rn <= 0 && e.ri < e.rainC.length){ e.rn = 0.13; const c = e.rainC[e.ri++]; e.skull.getWorldPosition(tA); tA.z += 1;
        fballs.push({ m: mesh(orbGeo, ghostMat, tA.x, tA.y, tA.z), from: tA.clone(), to: c.position.clone(), t: 0, dur: 0.6, circle: c, dm: e.dm }); play('fireball'); }
      if (e.t <= 0){ e.st = 'idle'; e.t = 1.0; } } }
  else if (e.st === 'dipDown' || e.st === 'dipStay'){ R.position.y = lerp(R.position.y, -4.4, 1 - Math.exp(-dt * 3)); R.rotation.x = lerp(R.rotation.x, 0.55, 1 - Math.exp(-dt * 3)); e.hands.forEach(rest);
    if (e.st === 'dipStay') e.weak = true;
    if (e.st === 'dipDown' && e.t <= 0){ e.st = 'dipStay'; e.t = 3.2; banner('¡Su cráneo está a tu alcance!', 1.2); }
    else if (e.st === 'dipStay' && e.t <= 0){ e.st = 'idle'; e.t = 1.2; } }
  if (e.st !== 'skullAim' && e.st !== 'skullFire') e.jaw.rotation.x = lerp(e.jaw.rotation.x, Math.sin(time * 2) * 0.05, 1 - Math.exp(-dt * 5));
  for (const h of e.hands){
    if (!(e.st === 'sweepGo' && h === hSel)) h.pos.lerp(h.target, 1 - Math.exp(-dt * (e.st === 'slamDown' && h === hSel ? 30 : 5)));
    h.H.position.copy(h.pos); h.H.rotation.y = angTo(h.pos.x, h.pos.z, 0, 0);
    tA.set(2.2 * h.s, 5.15, 0.1).applyMatrix4(R.matrixWorld);
    tB.copy(tA).add(h.pos).multiplyScalar(0.5); tB.x += 1.2 * h.s; tB.y += 1.6;
    boneBetween(h.up, tA, tB, 0.28); tmpv2.copy(h.pos).addScaledVector(tmpv.set(h.pos.x - tB.x, 0, h.pos.z - tB.z).normalize(), -0.5); boneBetween(h.fo, tB, tmpv2, 0.24);
  }
  let best = null, bd = 1e9;
  for (const h of e.hands) if (h.pos.y < 1.3){ const d = Math.hypot(h.pos.x - px, h.pos.z - pz); if (d < bd){ bd = d; best = h.pos; } }
  if (e.weak){ e.skull.getWorldPosition(tA); const d = Math.hypot(tA.x - px, tA.z - pz); if (d < bd){ bd = d; best = tA.clone(); } }
  if (best){ e.g.position.set(best.x, 0, best.z); e.numY = 2.2; e.reach = true; } else { e.g.position.set(0, 0, -6.5); e.reach = false; }
}
function skeletonDying(e, dt){
  e.dying -= dt; applyFlash(e);
  e.root.position.y -= dt * 3; e.root.rotation.x += dt * 0.4; e.hands.forEach(h => { h.pos.y -= dt * 3; h.H.position.copy(h.pos); });
  if (rnd() < 0.8){ const a = rnd() * TAU; spawnFx(Math.cos(a) * 3, 1 + rnd() * 5, -8 + Math.sin(a) * 2, Math.cos(a) * 2, 2, Math.sin(a) * 2, 0xe8e0c8, 0.16, 0.8, 6, 0.4); }
  if (rnd() < 0.08){ play('boom'); shake = Math.max(shake, 0.3); }
  if (e.dying <= 0){ e.parts.forEach(p => scene.remove(p)); scene.remove(e.g); e.remove = true; }
}

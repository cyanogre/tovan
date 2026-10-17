'use strict';
/* ---------- Míster Confianza en los marcianitos ---------- */
const starSprTex = [texAsset('canal-x/marcianitos/mister-1'), texAsset('canal-x/marcianitos/mister-2'), texAsset('canal-x/marcianitos/mister-3')];
const starSpr = mesh(new THREE.PlaneGeometry(2.6, 2.6), sprMat(starSprTex[0]), 0, 11.6, 0.05, invG); starSpr.visible = false;
const starBombMat = makeMat(0xffd23a, { emissive: 1 }), starBeamMat = makeMat(0xfff6c0, { emissive: 1, opacity: 0.35 });
const starBeam = mesh(B(1.5, 11, 0.04), starBeamMat, 0, 6.2, 0.03, invG); starBeam.visible = false;
const starWarn = mesh(new THREE.PlaneGeometry(0.95, 0.95), texMat(texAsset('canal-x/marcianitos/aviso'), { side: THREE.DoubleSide, emissive: 1 }), 0, 0, 0.3, invG); starWarn.visible = false;
const SI = { on: false, t: 0, shotT: 1.4, beamT: 4, beamSt: 0, beamX: 0, bombs: [], flashT: 0, said: false, hitT: 0, y: 11.6, down: false, modeT: 3 };
function clearStarInv(){ SI.on = false; starSpr.visible = false; starBeam.visible = false; starWarn.visible = false; SI.wind = 0; for (const b of SI.bombs) invG.remove(b.m); SI.bombs.length = 0; }
function startStarInv(){
  SI.on = true; SI.t = 0; SI.shotT = 1.6; SI.beamT = 3.8; SI.beamSt = 0; SI.wind = 0; SI.y = 10.7; SI.down = false; SI.modeT = 2.5; starSpr.visible = true;
  for (const a of inv.aliens) if (a.r === 0 && a.alive){ a.alive = false; a.m.visible = false; }
  banner('¡Míster Confianza se cuela en el juego!<small>Dispárale: también le quita vida</small>', 2); play('superOn');
  barkOnce('starInv', '¿Hasta en los marcianitos sale este? Pues dale, que aquí también se le puede pegar.');
}
const _startInvaders5 = startInvaders;
startInvaders = function(){ _startInvaders5(); clearStarInv(); if (bossE && bossE.type === 'star' && bossE.alive) startStarInv(); };
const _endInvaders5 = endInvaders;
endInvaders = function(){ clearStarInv(); _endInvaders5(); };
const _updateInvaders5 = updateInvaders;
updateInvaders = function(dt){
  if (invActive && !inv.over && !SI.on && bossE && bossE.type === 'star' && bossE.alive && bossE.spawnT <= 0) startStarInv();
  if (SI.on && invActive && !inv.over && bossE && bossE.alive){ SI.t += dt;
    SI.modeT -= dt; if (SI.modeT <= 0 && SI.beamSt === 0){ SI.down = !SI.down; SI.modeT = SI.down ? 3.2 : 3.5;
      if (SI.down){ tA.set(starSpr.position.x, starSpr.position.y + 1.6, INV_Z); spawnNumber(tA, '¡Bajo a saludar a mis fans!', 'react', '#ffd23a'); play('superOn'); } }
    SI.y = lerp(SI.y, SI.down ? 6.6 : 10.7, 1 - Math.exp(-dt * 3));
    const x = Math.sin(SI.t * 0.75) * 4.6, y = SI.y + Math.sin(SI.t * 2.1) * 0.25; starSpr.position.set(x, y, 0.05);
    if (SI.flashT > 0){ SI.flashT -= dt; starSpr.scale.setScalar(1 + SI.flashT * 0.6); starSpr.material.uniforms.uColor.value.setHex(Math.sin(time * 60) > 0 ? 0xffffff : 0xff8a8a); }
    else { starSpr.scale.setScalar(1); starSpr.material.uniforms.uColor.value.setHex(0xffffff); }
    starSpr.material.uniforms.uMap.value = starSprTex[SI.beamSt ? 2 : (Math.floor(SI.t * 2.5) % 2)];
    // disparos del jugador contra él
    for (let i = inv.bullets.length - 1; i >= 0; i--){ const b = inv.bullets[i], p = b.m.position;
      if (Math.abs(p.x - x) < 1.05 && Math.abs(p.y - y) < 1.2){ invG.remove(b.m); inv.bullets.splice(i, 1);
        const crit = rnd() < up.crit, v = Math.max(1, Math.round(bossE.maxHp * 0.011 * up.dmg * (crit ? critMul() : 1)));
        bossE.hp -= v; bossE.flash = 0.1; SI.flashT = 0.15; addCombo(); play(crit ? 'crit' : 'hit');
        tA.set(invG.position.x + x + (rnd() - 0.5), invG.position.y + y + 1, INV_Z + 0.2); spawnNumber(tA, v, crit ? 'crit' : '');
        for (let k = 0; k < 6; k++){ const a = rnd() * TAU; spawnFx(x, y, INV_Z + 0.1, Math.cos(a) * 3, Math.sin(a) * 3, 0, k % 2 ? 0xffd23a : 0xffffff, 0.1, 0.35, 0, 0); }
        player.meter = Math.min(100, player.meter + 2 * up.meterRate);
        if (bossE.hp <= 0){ const b_ = bossE; killEnemy(b_); clearStarInv(); banner('¡Míster Confianza, eliminado en su propio juego!', 2.2); chT = Math.min(chT, 1.5); return _updateInvaders5(dt); }
        if (rnd() < 0.15) tA.set(x, y + 1.6, INV_Z), spawnNumber(tA, ['¡Eh!', '¡Mi pelo!', '¡Esto no cuenta!', '¡Soy el número 1!'][Math.floor(rnd() * 4)], 'react', '#ffd23a'); } }
    // sus ataques: estrellas en abanico y rayo de la fama
    if (SI.beamSt === 0) SI.shotT -= dt;
    if (SI.shotT <= 0 && !SI.wind){ SI.wind = 0.45; play('cursor');  }
    if (SI.wind){ SI.wind -= dt; starSpr.material.uniforms.uColor.value.setHex(Math.sin(time * 40) > 0 ? 0xffe070 : 0xffffff); starSpr.scale.setScalar(1.2 + 0.1 * Math.sin(time * 40)); starWarn.visible = Math.sin(time * 30) > -0.5; starWarn.position.set(x, y - 1.75, 0.3);
      if (SI.wind <= 0){ SI.wind = 0; starWarn.visible = false; SI.shotT = (bossE.hp < bossE.maxHp * 0.5 ? 1.25 : 1.7) * (SI.down ? 0.9 : 1); const sx = inv.ship.position.x, sp = SI.down ? 3.6 : 4.3;
        for (const o of [-1, 0, 1]){ const m = mesh(B(0.26, 0.26, 0.05), starBombMat, x, y - 1.2, 0.02, invG); m.rotation.z = Math.PI / 4; const a = Math.atan2(sx - x, -(y - 1)) + o * 0.36; SI.bombs.push({ m, vx: Math.sin(a) * sp, vy: Math.cos(a) * sp }); }   // (iban hacia arriba: el signo de vy estaba al revés)
        play('shoot'); } }
    SI.beamT -= dt;
    if (SI.beamSt === 0 && SI.beamT <= 0 && !SI.wind && !SI.bombs.length){ SI.beamSt = 1; SI.beamT = 1.15; SI.beamX = inv.ship.position.x; starBeam.visible = true; starBeam.position.x = SI.beamX; starBeamMat.uniforms.uOpacity.value = 0.25; play('kameCharge');
      tA.set(x, y + 1.6, INV_Z); spawnNumber(tA, '¡RAYO DE LA FAMA!', 'react', '#ffd23a'); }
    else if (SI.beamSt === 1){ starBeamMat.uniforms.uOpacity.value = 0.15 + 0.2 * Math.abs(Math.sin(time * 14)); if (SI.beamT <= 0){ SI.beamSt = 2; SI.beamT = 0.5; starBeamMat.uniforms.uOpacity.value = 0.95; play('beam'); flash('#fff6c0', 0.2); SI.hitT = 0; } }
    else if (SI.beamSt === 2){ SI.hitT -= dt; if (SI.hitT <= 0 && Math.abs(inv.ship.position.x - SI.beamX) < 0.85){ SI.hitT = 0.5; hurtPlayer(12 * dmgScale(wave) * 0.6, hero.position.x, hero.position.z, 0); }
      if (SI.beamT <= 0){ SI.beamSt = 0; SI.beamT = 4 + rnd() * 2; starBeam.visible = false; } }
    for (let i = SI.bombs.length - 1; i >= 0; i--){ const b = SI.bombs[i], p = b.m.position; p.x += b.vx * dt; p.y += b.vy * dt; b.m.rotation.z += dt * 8; let gone = p.y < 0.4 || Math.abs(p.x) > 9;
      if (!gone) for (const k of inv.blocks) if (k.alive && Math.abs(k.bx - p.x) < 0.24 && Math.abs(k.by - p.y) < 0.24){ k.alive = false; k.m.visible = false; gone = true; break; }
      if (!gone && Math.abs(inv.ship.position.x - p.x) < 0.6 && p.y < 1.4){ gone = true; hurtPlayer(9 * dmgScale(wave) * 0.6, hero.position.x, hero.position.z, 0); }
      if (gone){ invG.remove(b.m); SI.bombs.splice(i, 1); } }
  } else if (SI.on && (!bossE || !bossE.alive)) clearStarInv();
  return _updateInvaders5(dt);
};

/* ---------- Bucle ---------- */
const _v3UpdateB5 = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateB5(dt, pdt, playing); if (playing){ const edt = pdt * (slowT > 0 ? 0.3 : 1) * (timeStopT > 0 ? 0 : 1) * (invActive ? 0 : 1); updateHZ(edt); } };

'use strict';
/* ---------- Bucle principal ---------- */
hero.position.set(0, 0, 0); hero.rotation.y = camYaw; heading = camYaw;
let last = performance.now();
const camTarget = new V3(0, 1.15, 0), tmp = new V3();
function bl(o, k, v, w){ o[k] = o[k] + (v - o[k]) * w; }
let lastHud = '';

function frame(now){
  requestAnimationFrame(frame);
  const dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
  const playing = gameState === 'play', frozen = gameState === 'paused' || gameState === 'over';
  if (playing){ hitStop -= dt; if (slowT > 0) slowT -= dt; runTime += dt; }
  const pdt = frozen ? 0 : (playing && hitStop > 0 ? 0 : dt);        // jugador
  const edt = playing ? pdt * (slowT > 0 ? 0.3 : 1) * (timeStopT > 0 ? 0 : 1) * (invActive ? 0 : 1) : 0;                // enemigos (tiempo bala)
  time += pdt;
  pollPad(); musicTick(); updateDlg(dt); updateBark(dt); updateTravel(dt); csUpdate(dt);
  if (playing){ techUpdate(pdt); otakuUpdate(pdt); } updateClones(pdt);
  shared.uTime.value = time; updateCastle(pdt); updateCorrupt(pdt); chUpdate(dt, pdt, playing); updateOrbitals(pdt, playing); updateLegendCut(dt); updateTracks(dt); updateFinalArena(pdt);
  if (chActive && (chMode === 'arcade' || chMode === 'shmup')) camYaw = 0;
  if (renderGroup.visible) updateBeach(pdt);
  if (!frozen) updateAmbient(pdt, camTarget.x, camTarget.z);
  updateBolts(pdt);
  if (lflash > 0){ lflash = Math.max(0, lflash - dt * 5); shared.uP3Col.value.copy(lflashCol).multiplyScalar(lflash); }
  if (playing){ runPending(edt); if (comboTimer > 0){ comboTimer -= edt; if (comboTimer <= 0) breakCombo(); } }

  /* --- entrada y movimiento del jugador --- */
  let ix = 0, iz = 0;
  if (playing && !player.dead){
    ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + joy.x;
    iz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + joy.y;
  }
  let mag = Math.hypot(ix, iz); if (mag > 1){ ix /= mag; iz /= mag; mag = 1; }
  const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = -fz, rz = fx;
  const dx = rx * ix - fx * iz, dz = rz * ix - fz * iz;
  inputMag = mag; if (mag > 0.12) inputHeading = Math.atan2(dx, dz);
  const wantMove = mag > 0.12;
  const moving = (state === 'normal' || state === 'charge') && wantMove && !invActive;
  if (playing){
    if (comboT > 0) comboT -= pdt;
    if (player.inv > 0) player.inv -= pdt;
    if (moving){ const sp = 3.6 * up.speed * mag * (grounded ? 1 : 0.9) * (superOn ? 1.2 : 1) * cosSpd() * (state === 'charge' ? 0.36 : 1); mov11(dx * sp, dz * sp, pdt, true); heading = inputHeading; }
    else { mov11(0, 0, pdt, false); if (state === 'attack' && !grounded && wantMove){ hero.position.x += dx * 1.4 * pdt; hero.position.z += dz * 1.4 * pdt; } }
    hero.position.x += player.kx * pdt; hero.position.z += player.kz * pdt;
    const kd = Math.exp(-pdt * 8); player.kx *= kd; player.kz *= kd;
  }
  if (state === 'normal') hero.rotation.y = lerpAngle(hero.rotation.y, heading, 1 - Math.exp(-pdt * 14));

  /* --- ataque --- */
  let trailOn = false;
  if (state === 'attack'){
    const mv = curMove; stepT += pdt * (mv.special ? 1 : atkSpd()); if (mv.dive) diveHold(mv); const t = stepT / mv.dur;
    curPose = samplePose(mv.keys, Math.min(1, t));
    attackW = Math.min(1, attackW + pdt * 20);
    const [l0, l1, ld] = mv.lunge;
    if (grounded && ld && t > l0 && t < l1){ const sp = ld / ((l1 - l0) * mv.dur);
      hero.position.x += Math.sin(hero.rotation.y) * sp * pdt; hero.position.z += Math.cos(hero.rotation.y) * sp * pdt; }
    trailOn = t >= mv.trail[0] && t <= mv.trail[1];
    if (trailOn && !swingDone){ swingDone = true; play(mv.slam ? 'swingBig' : 'swing'); }
    if (!hitDone && t >= mv.hit){ hitDone = true; if (mv.custom) mv.fire(mv, 0); else resolveHit(mv); }
    moveTick(mv, t);
    if (t >= 1){
      const seq = comboSeq();
      if (queued && seqI < seq.length - 1) startMove(seq[seqI + 1], seqI + 1);
      else { state = 'normal'; comboT = mv.special ? 0 : (seqI === 1 ? 0.8 : 0.3); comboNext = seqI + 1; }
    }
  } else if (attackW > 0){
    attackW = Math.max(0, attackW - pdt / 0.3);
    if (attackW < 0.35) staffToBack();
  }

  /* --- voltereta --- */
  let rollW = 0;
  if (state === 'roll'){
    rollT += pdt; const p = Math.min(1, rollT / 0.55);
    const sp = 7.0 * (1 - p * 0.75) * (0.9 + 0.1 * up.speed) * rollMul();
    hero.position.x += Math.sin(rollDir) * sp * pdt; hero.position.z += Math.cos(rollDir) * sp * pdt;
    const arc = Math.sin(p * Math.PI);
    P.body.rotation.x = smooth(p) * TAU; P.body.scale.setScalar(1 - 0.2 * arc);
    rollW = Math.min(1, arc * 2.5);
    if (up.fireRoll){ fireDropT -= pdt; if (fireDropT <= 0){ fireDropT = 0.07;
      flames.push({ m: mesh(flameGeo, makeMat(0xff7a2a, { emissive: 1 }), hero.position.x, 0.2, hero.position.z), life: 1.6, max: 1.6 }); } }
    if (p >= 1){ state = 'normal'; P.body.rotation.x = 0; P.body.scale.setScalar(1); puff(3); }
  }

  /* --- salto --- */
  if (!grounded && pdt > 0){
    vy -= 22 * pdt; hero.position.y += vy * pdt;
    if (hero.position.y <= 0){
      hero.position.y = 0; grounded = true; vy = 0; landT = 0.18; puff(6); play('land'); if (playing) onLanding();
      if (up.quake && playing){
        const R = 2.4 * (setOn('impacto') ? 1.4 : 1); ringFx(hero.position.x, hero.position.z, 0xffc070, 0.3, R, 0.35); shake = Math.max(shake, 0.2);
        for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
          const ex = e.g.position.x - hero.position.x, ez = e.g.position.z - hero.position.z, d = Math.max(0.001, Math.hypot(ex, ez));
          if (d - e.r < R) hitEnemy(e, Math.round(28 * up.quake * up.dmg), false, ex / d, ez / d, 4, 4); }
      }
    }
  }
  if (landT > 0) landT -= pdt;
  extraUpdate(pdt, playing, wantMove); v3Update(dt, pdt, playing);

  /* --- muerte --- */
  if (state === 'dead'){ deadT += dt; P.body.rotation.x = -Math.min(1, deadT / 0.5) * 1.45; if (deadT > 1.9 && gameState === 'play') showOver(); }

  /* --- límites y brasero --- */
  const rr = Math.hypot(hero.position.x, hero.position.z);
  if (!clampHeroCh() && rr > ARENA){ hero.position.x *= ARENA / rr; hero.position.z *= ARENA / rr; }
  { const bx = hero.position.x - BRAZ.x, bz = hero.position.z - BRAZ.z, bd = Math.hypot(bx, bz);
    if (braz.visible && bd < 0.75 && bd > 0.0001){ hero.position.x = BRAZ.x + bx / bd * 0.75; hero.position.z = BRAZ.z + bz / bd * 0.75; } }

  walkW += (((moving || cs.walk) && grounded ? 1 : 0) - walkW) * (1 - Math.exp(-pdt * 10));
  runW  += ((moving && grounded ? 0.8 : 0) - runW) * (1 - Math.exp(-pdt * 8));
  airW  += ((grounded ? 0 : 1) - airW) * (1 - Math.exp(-pdt * 14));
  if ((moving || cs.walk) && grounded) phase += pdt * 10 * Math.max(0.55, mag) * (0.8 + 0.2 * up.speed);

  /* --- animación base --- */
  const s = Math.sin(phase), c = Math.cos(phase), idle = (1 - walkW) * (1 - airW), br = Math.sin(time * 2.2);
  const swing = 0.55 + 0.25 * runW;
  P.hips.position.y = 0.67 + (Math.abs(c) - 0.6) * 0.09 * walkW + br * 0.006 * idle;
  P.hips.rotation.z = Math.sin(time * 1.1) * 0.035 * idle;
  P.hips.rotation.y = s * 0.08 * walkW;
  P.spine.rotation.y = -s * 0.12 * walkW;
  P.spine.rotation.x = 0.02 + br * 0.014 * idle + 0.08 * walkW + 0.14 * runW;
  P.legL.hip.rotation.x = -s * swing * walkW;
  P.legR.hip.rotation.x =  s * swing * walkW;
  P.legL.knee.rotation.x = walkW * (0.08 + Math.max(0,  c) * (0.9 + 0.5 * runW));
  P.legR.knee.rotation.x = walkW * (0.08 + Math.max(0, -c) * (0.9 + 0.5 * runW));
  P.armL.sh.rotation.x =  s * swing * 0.9 * walkW + br * 0.03 * idle;
  P.armR.sh.rotation.x = -s * swing * 0.9 * walkW + br * 0.03 * idle;
  P.armL.sh.rotation.z = -0.14; P.armR.sh.rotation.y = 0;
  P.armL.el.rotation.x = P.armR.el.rotation.x = -(0.22 + 0.3 * walkW + 0.6 * runW);
  P.armL.el.rotation.z = 0;   // los gestos de reposo (mano en la cadera, bostezo) la giran y nadie la devolvía: el brazo se quedaba torcido
  P.neck.rotation.y = Math.sin(time * 0.6) * 0.35 * idle;
  P.neck.rotation.x = -0.04 * walkW - 0.06 * runW + Math.sin(time * 1.1) * 0.03 * idle;
  P.tail.scale.set(1 + 0.08 * walkW, 1, 1 + 0.12 * walkW + 0.1 * runW);
  const airFlare = airW * (vy < 0 ? 0.6 : 0.15) + rollW * 0.4;
  P.tailHair.forEach((g, i) => {
    g.rotation.x = (i ? 0.12 : 0.35) + walkW * (0.2 + 0.3 * runW) + Math.sin(time * 3.1 - i * 0.9) * 0.07 + s * 0.05 * walkW + airFlare;
    g.rotation.z = Math.sin(time * 2.3 - i) * 0.08;
  });
  P.scarf.forEach((g, i) => {
    g.rotation.x = 0.15 + walkW * (0.45 + 0.6 * runW) * (i ? 0.5 : 1) + Math.sin(time * 4 - i * 1.1) * 0.1 * (0.35 + walkW) + airFlare;
    g.rotation.z = Math.sin(time * 2.7 - i) * 0.07;
  });
  if (waveT > 0) waveT -= pdt;
  waveW += ((waveT > 0 ? 1 : 0) - waveW) * (1 - Math.exp(-pdt * 9));
  P.armR.sh.rotation.z = 0.14 + waveW * 2.35;
  P.armR.sh.rotation.x *= (1 - waveW);
  P.armR.el.rotation.x = P.armR.el.rotation.x * (1 - waveW) - waveW * 0.15;
  P.armR.el.rotation.z = waveW * Math.sin(time * 13) * 0.45;
  P.neck.rotation.z = -waveW * 0.14 - Math.sin(time * 1.1) * 0.03 * idle;

  if (airW > 0.001){
    const w = airW, upv = clamp(vy / 7.6, -1, 1);
    bl(P.legL.hip.rotation, 'x', -0.8, w); bl(P.legR.hip.rotation, 'x', -0.15, w);
    bl(P.legL.knee.rotation, 'x', 1.2, w); bl(P.legR.knee.rotation, 'x', 0.5, w);
    bl(P.armL.sh.rotation, 'z', -0.95, w); bl(P.armR.sh.rotation, 'z', 0.95, w);
    bl(P.armL.sh.rotation, 'x', -0.3 - 0.3 * upv, w); bl(P.armR.sh.rotation, 'x', -0.3 - 0.3 * upv, w);
    bl(P.spine.rotation, 'x', 0.1 - 0.12 * upv, w); bl(P.neck.rotation, 'x', -0.15 * upv, w);
  }
  if (attackW > 0.001){
    const w = attackW, p = curPose, A = P.armR;
    bl(A.sh.rotation, 'x', p.shX, w); bl(A.sh.rotation, 'y', p.shY, w); bl(A.sh.rotation, 'z', 0.1, w);
    bl(A.el.rotation, 'x', p.elX, w); bl(A.el.rotation, 'z', 0, w);
    bl(P.spine.rotation, 'y', p.spY, w); bl(P.spine.rotation, 'x', p.spX, w);
    if (!(curMove && curMove.noNeck && state === 'attack')) bl(P.neck.rotation, 'y', -p.spY * 0.7, w);
    P.hips.position.y += p.dy * w;
    bl(P.armL.sh.rotation, 'x', -0.25, w); bl(P.armL.sh.rotation, 'z', -0.75, w);
    if (grounded){ const k = w * (1 - walkW);
      bl(P.legL.hip.rotation, 'x', -0.35 + p.dy * 2, k); bl(P.legR.hip.rotation, 'x', 0.35, k);
      bl(P.legL.knee.rotation, 'x', 0.25 - p.dy * 5, k); bl(P.legR.knee.rotation, 'x', 0.3 - p.dy * 5, k); }
  }
  if (rollW > 0.001){
    const w = rollW;
    for (const L of [P.legL, P.legR]){ bl(L.hip.rotation, 'x', -1.4, w); bl(L.knee.rotation, 'x', 1.9, w); }
    for (const Ar of [P.armL, P.armR]){ bl(Ar.sh.rotation, 'x', -1.0, w); bl(Ar.el.rotation, 'x', -1.3, w); }
    bl(P.armL.sh.rotation, 'z', -0.2, w); bl(P.armR.sh.rotation, 'z', 0.2, w);
    bl(P.spine.rotation, 'x', 0.6, w); bl(P.neck.rotation, 'x', 0.7, w);
  }
  if (state === 'dead'){ const w = Math.min(1, deadT / 0.4);
    for (const Ar of [P.armL, P.armR]) bl(Ar.sh.rotation, 'x', -0.4, w);
    bl(P.armL.sh.rotation, 'z', -1.1, w); bl(P.armR.sh.rotation, 'z', 1.1, w); bl(P.neck.rotation, 'x', -0.3, w); }
  csApplyPose();
  applyDance(pdt, moving);
  applyTechPose();
  legendPose();
  if (playing && !player.dead && grounded && state === 'normal' && !wantMove && enemies.some(e => e.alive)){ idleT += pdt; if (idleT >= 20) unlock('idle20'); } else idleT = 0;
  if (state !== 'roll'){
    let sy = 1, sxz = 1;
    if (!grounded){ const k = Math.min(1, Math.abs(vy) / 7.6); sy = 1 + 0.07 * k; sxz = 1 - 0.035 * k; }
    if (landT > 0){ const k = landT / 0.18; sy = 1 - 0.16 * k; sxz = 1 + 0.08 * k; }
    P.body.scale.set(sxz, sy, sxz); P.body.position.y = 0.62 * sy;
  }
  if (grounded) P.body.position.y += hero.position.y - heroMinY();

  P.ahoge.rotation.x = 0.45 + Math.sin(time * 5.5) * 0.08 + walkW * 0.35 * Math.abs(s) + runW * 0.3 + airW * (vy < 0 ? 0.5 : -0.2);
  blinkT -= pdt; if (blinkT < 0){ blinkT = 2.2 + rnd() * 3.5; blinkDur = 0.13; }
  if (blinkDur > 0) blinkDur -= pdt;
  M.face.uniforms.uMap.value = (waveW > 0.5 || (gameState === 'upgrade')) ? faceHappy : (state === 'dead' || (blinkDur > 0 && state === 'normal')) ? faceBlink : faceTex;
  crystal.rotation.y += pdt * 2.2;
  hero.visible = !(playing && player.inv > 0 && !player.dead && Math.floor(player.inv * 16) % 2 === 0);
  blob.position.set(hero.position.x, 0.025, hero.position.z);
  blob.scale.setScalar(Math.max(0.4, 1 - hero.position.y * 0.35));

  if (trailOn){ staffMid.getWorldPosition(tA); staffTip.getWorldPosition(tB); pushTrail(tA, tB); trailAlpha = 1; }
  else if (trailAlpha > 0) trailAlpha = Math.max(0, trailAlpha - pdt * 4);
  updateTrail();

  /* --- mundo: enemigos, proyectiles, etc. --- */
  if (playing){
    // oleadas
    const alive = enemies.filter(e => e.alive).length;
    spawnTimer -= edt;
    if (queue.length && spawnTimer <= 0 && alive < maxAlive() && !player.dead){ spawnEnemy(queue.shift()); spawnTimer = 0.55 + rnd() * 0.4; }
    if (!queue.length && alive === 0 && clearT < 0 && !player.dead && wave > 0){
      clearT = 1.7; banner('¡Oleada superada!', 1.5); play('waveClear'); heal(Math.round(player.maxHp * 0.07));
      if (wave === 1) unlock('w1');
      if (!dmgWave && wave >= 3){ unlock('nodmg'); if (++noDmgStreak >= 3) unlock('nodmg3'); } else noDmgStreak = 0;
      celebrate(); cosWaveClear(); sweepHazards();
      for (const p of projectiles) scene.remove(p.m); projectiles.length = 0;
    }
    if (clearT > 0){ clearT -= dt; if (clearT <= 0) onWaveDone(); }

    for (const e of enemies) updateEnemy(e, edt);
    for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].remove){ const q = enemies[i]; if (q.parts) q.parts.forEach(o => scene.remove(o)); if (q.tele) scene.remove(q.tele); enemies.splice(i, 1); }
    separateEnemies();

    for (let i = projectiles.length - 1; i >= 0; i--){
      const p = projectiles[i], d_ = p.owner === 'enemy' ? edt : pdt;
      steerProjectile(p, d_);
      p.m.position.x += p.vx * d_; p.m.position.z += p.vz * d_; p.life -= d_; p.m.rotation.y += d_ * 8; p.m.rotation.x += d_ * 5;
      let gone = p.life <= 0 || Math.hypot(p.m.position.x, p.m.position.z) > Math.max(10, ARENA + 4);
      if (!gone && p.owner === 'enemy'){
        if (Math.hypot(p.m.position.x - hero.position.x, p.m.position.z - hero.position.z) < 0.5 && hero.position.y < 0.9){
          if (hurtPlayer(p.dmg, p.m.position.x, p.m.position.z, 3) === 'hit') gone = true; }
      } else if (!gone){
        for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
          const ex = e.g.position.x - p.m.position.x, ez = e.g.position.z - p.m.position.z, d = Math.max(0.001, Math.hypot(ex, ez));
          if (d < e.r + 0.3 * (p.big || 1)){ hitEnemy(e, p.pdmg || Math.round(40 * up.dmg), false, ex / d, ez / d, p.pdmg ? 0.6 : 3, p.pdmg ? 1 : 4, false, { src: 'bolt', el: p.pdmg ? null : 'shock' }); gone = true; break; } }
      }
      if (!gone && rnd() < 0.3) spawnFx(p.m.position.x, 1.05, p.m.position.z, 0, 0.2, 0, p.owner === 'enemy' ? 0xff5ad8 : 0x8ff6ff, 0.05, 0.25, 0, 0);
      if (gone){ scene.remove(p.m); projectiles.splice(i, 1); }
    }
    updateFballs(edt);
    for (let i = eRings.length - 1; i >= 0; i--){
      const r = eRings[i]; r.r += r.speed * edt; r.m.scale.setScalar(r.r);
      r.m.material.uniforms.uOpacity.value = 0.9 * (1 - r.r / r.max) + 0.1;
      const d = Math.hypot(hero.position.x - r.m.position.x, hero.position.z - r.m.position.z);
      if (!r.hit && Math.abs(d - r.r) < 0.4 && hero.position.y < 0.35){ if (hurtPlayer(r.dmg, r.m.position.x, r.m.position.z, 5) === 'hit') r.hit = true; }
      if (r.r >= r.max){ scene.remove(r.m); r.m.geometry.dispose(); r.m.material.dispose(); eRings.splice(i, 1); }
    }
    for (let i = pickups.length - 1; i >= 0; i--){
      const p = pickups[i]; p.t += edt; p.m.rotation.y += edt * 3; p.m.position.y = 0.5 + Math.sin(time * 4 + p.seed) * 0.1;
      p.m.visible = p.t < 9 || Math.floor(p.t * 8) % 2 === 0;
      if (!player.dead && Math.hypot(p.m.position.x - hero.position.x, p.m.position.z - hero.position.z) < 0.9){
        heal(Math.round(12 * (1 + 0.15 * ml('pickS')))); player.meter = Math.min(100, player.meter + 5 * ml('pickS')); play('pickup'); sparks(p.m.position.x, 0.6, p.m.position.z, 6, 0x7dff8a); scene.remove(p.m); pickups.splice(i, 1); }
      else if (p.t > 12){ scene.remove(p.m); pickups.splice(i, 1); }
    }
    fireTick -= pdt;
    const tick = fireTick <= 0; if (tick) fireTick = 0.3;
    for (let i = flames.length - 1; i >= 0; i--){
      const f = flames[i]; f.life -= pdt; const k = f.life / f.max;
      f.m.scale.set(k, k * (1 + 0.3 * Math.sin(time * 20 + i)), k);
      if (f.life <= 0){ scene.remove(f.m); f.m.material.dispose(); flames.splice(i, 1); }
    }
    if (tick && flames.length) for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
      if (flames.some(f => Math.hypot(f.m.position.x - e.g.position.x, f.m.position.z - e.g.position.z) < e.r + 0.35))
        hitEnemy(e, Math.round(5 * up.fireRoll * up.dmg), false, 0, 0, 0, 1, false, { src: 'aoe', el: 'fire', power: up.fireRoll }); }
    orbs.forEach((o, i) => {
      const a = time * (setOn('cristal') ? 4.2 : 3) + i / orbs.length * TAU;
      o.position.set(hero.position.x + Math.cos(a) * 1.25, hero.position.y + 1.0, hero.position.z + Math.sin(a) * 1.25); o.rotation.y += pdt * 6;
      for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.orbCd > 0) continue;
        const ex = e.g.position.x - o.position.x, ez = e.g.position.z - o.position.z, d = Math.max(0.001, Math.hypot(ex, ez));
        if (d < e.r + 0.25){ e.orbCd = 0.45; hitEnemy(e, Math.round(12 * up.dmg * (setOn('cristal') ? 1.5 : 1) * (1 + comboBonus())), false, ex / d, ez / d, 1.5, 2, false, { src: 'orb' });
          if (lvl('tempest') && e.tempCd <= 0 && e.alive){ e.tempCd = 0.6; chainLightning(o.position.x, o.position.y, o.position.z, e, 2 + rayoJumps() + S10('tempest'), 14 * (1 + 0.5 * S10('tempest'))); } } }
    });
    if (lvl('prism') && orbs.length){ prismT -= pdt;
      if (prismT <= 0){ prismT = Math.max(0.5, 1.3 - 0.3 * S10('prism'));
        orbs.forEach((o, i) => later(i * 0.08, () => { const e = nearestFrom(o.position.x, o.position.z, 4.2); if (!e) return;
          bolt(o.position.x, o.position.y, o.position.z, e.g.position.x, 0.9 * e.scale, e.g.position.z, 0xd8c8ff, 0.05); play('zap');
          hitEnemy(e, rdmg(12 * rayoMul()), false, 0, 0, 1, 1, false, { src: 'bolt', el: 'shock' }); })); } }
    if (bossE) bossFill.style.width = Math.max(0, bossE.hp / bossE.maxHp * 100) + '%';
  }

  /* --- efectos --- */
  for (const m of fxPool){
    if (!m.visible) continue;
    const u = m.userData; u.life -= pdt;
    if (u.life <= 0){ m.visible = false; continue; }
    u.vel.y -= u.grav * pdt; m.position.addScaledVector(u.vel, pdt);
    if (m.position.y < 0.03){ m.position.y = 0.03; u.vel.y = 0; u.vel.multiplyScalar(0.8); }
    const k = u.life / u.max;
    m.scale.setScalar(u.size * (1 + u.grow * (1 - k))); m.material.uniforms.uOpacity.value = k;
  }
  for (const m of vRings){
    if (!m.visible) continue;
    const u = m.userData; u.t += pdt; const k = u.t / u.dur;
    if (k >= 1){ m.visible = false; continue; }
    m.scale.setScalar(Math.max(0.01, lerp(u.r0, u.r1, 1 - (1 - k) * (1 - k)))); m.material.uniforms.uOpacity.value = 0.9 * (1 - k);
  }

  /* --- luces y atrezo --- */
  const fl = 0.82 + 0.12 * Math.sin(time * 17) * Math.sin(time * 7.3) + 0.06 * Math.sin(time * 31);
  if (lampOverride){ const F = lampOverride.col, k = 0.9 + 0.1 * Math.sin(time * 23) * Math.sin(time * 5); shared.uPointCol.value.setRGB(F[0] * k, F[1] * k, F[2] * k); shared.uPointPos.value.copy(lampOverride.pos); shared.uPointRange.value = lampOverride.range; }
  else { const F = fireRGB(); shared.uPointCol.value.setRGB(F[0] * fl, F[1] * fl, F[2] * fl); shared.uPointPos.value.set(BRAZ.x, 1.3, BRAZ.z); shared.uPointRange.value = 7.5; }
  if (p2Override){ shared.uP2Pos.value.copy(p2Override.pos); shared.uP2Col.value.setRGB(p2Override.col[0], p2Override.col[1], p2Override.col[2]); } else crystal.getWorldPosition(shared.uP2Pos.value);
  const meterFull = player.meter >= 100 && playing;
  const cp2 = 0.75 + 0.25 * Math.sin(time * (meterFull ? 9 : 3)) + (trailOn ? 0.5 : 0) + (meterFull ? 0.4 : 0);
  if (!p2Override){ shared.uP2Col.value.setRGB(0.28 * cp2, 0.85 * cp2, 1.0 * cp2); shared.uP2Range.value = meterFull ? 2.6 : 1.8; } else shared.uP2Range.value = p2Override.range;
  M.crystal.uniforms.uColor.value.setRGB(0.5 + 0.3 * cp2, 0.95, 1.0);
  M.rune.uniforms.uColor.value.setRGB(0.55 + 0.25 * cp2, 0.8 + 0.2 * cp2, 1.0);
  fires.forEach(f => { const k = 1 + 0.18 * Math.sin(time * (13 + f.userData.i * 4)) + 0.08 * Math.sin(time * 29 + f.userData.i);
    f.scale.set(1, k, 1); f.position.y = 1.08 + f.userData.h * k / 2; f.rotation.y += pdt * (1.5 + f.userData.i); });
  embers.forEach(e => { const u = e.userData; u.life += pdt * 0.7; if (u.life > 1){ u.life = 0; u.sx = (rnd() - 0.5) * 0.4; u.sz = (rnd() - 0.5) * 0.4; }
    e.position.set(u.sx * (1 + u.life) + Math.sin(time * 3 + u.sz * 20) * 0.08, 1.2 + u.life * 1.6, u.sz * (1 + u.life)); e.visible = u.life < 0.9; });
  floaters.forEach(f => { f.position.y = f.userData.y + Math.sin(time * 1.3 + f.userData.i * 2) * 0.2; f.rotation.y += pdt * 0.8; });

  /* --- cámara --- */
  if (gameState === 'title' || gameState === 'over') camYaw += dt * 0.15;
  { const lead = gameState === 'play' && typeof MOV11 !== 'undefined' && MOV11 ? 0.16 : 0; tmp.set(hero.position.x + (lead ? MOV11.vx * lead : 0), 1.1 + hero.position.y * (umb ? 0.85 : 0.5), hero.position.z + (lead ? MOV11.vz * lead : 0)); }
  if (gameState === 'title'){ if (innerWidth < innerHeight) tmp.y -= 1.9; else { tmp.x -= Math.cos(camYaw) * 1.7; tmp.z += Math.sin(camYaw) * 1.7; } }
  camTarget.lerp(tmp, 1 - Math.exp(-dt * 5));
  const tall = innerWidth < innerHeight;
  const dist_ = gameState === 'title' ? (tall ? 8.5 : 5) : camDist * (tall ? 1.25 : 1) * (gameState === 'cutscene' ? 0.72 : 1) * (tech && tech.phase === 'gather' ? 1.4 : 1) * (bossE && bossE.type === 'skeleton' ? 1.45 : bossE && bossE.p2x && bossE.alive ? 1.4 : 1), pitch = gameState === 'title' ? (tall ? 0.22 : 0.3) : Math.min(1.1, camPitch + (tall ? 0.18 : 0)) - (bossE && bossE.type === 'skeleton' ? 0.2 : 0);
  const cp = Math.cos(pitch);
  camera.position.set(camTarget.x + Math.sin(camYaw) * cp * dist_, camTarget.y + Math.sin(pitch) * dist_, camTarget.z + Math.cos(camYaw) * cp * dist_);
  camera.lookAt(camTarget);
  chCamera(camera);
  legendCamera(camera);
  csCamera(camera);
  if (shake > 0){ shake -= dt; const k = shake * 0.35; camera.position.x += (rnd() - 0.5) * k; camera.position.y += (rnd() - 0.5) * k; }
  sky.position.copy(camera.position);

  /* --- interfaz --- */
  for (let i = nums.length - 1; i >= 0; i--){
    const n = nums[i]; n.t += frozen ? 0 : dt;
    if (n.t > 1.1){ n.el.remove(); nums.splice(i, 1); continue; }
    pr.copy(n.pos).project(camera);
    if (pr.z > 1){ n.el.style.display = 'none'; continue; }
    n.el.style.display = '';
    const h = n.t < 0.25 ? Math.sin(n.t / 0.25 * Math.PI) * 34 : n.t < 0.42 ? Math.sin((n.t - 0.25) / 0.17 * Math.PI) * 10 : 0;
    const x = (pr.x * 0.5 + 0.5) * innerWidth, y = (-pr.y * 0.5 + 0.5) * innerHeight - h - n.t * 8;
    n.el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
    n.el.style.opacity = n.t > 0.8 ? String(1 - (n.t - 0.8) / 0.3) : '1';
  }
  if (playing || gameState === 'upgrade'){
    const hpPct = Math.max(0, player.hp) / player.maxHp * 100;
    if (ghostPct < hpPct) ghostPct = hpPct; else ghostPct = Math.max(hpPct, ghostPct - dt * 35);
    hpGhost.style.width = ghostPct + '%';
    comboBox.hidden = combo < 3 || gameState !== 'play';
    if (combo >= 3){
      comboNumEl.textContent = combo; comboPop = Math.max(0, comboPop - dt * 6);
      comboNumEl.style.transform = `scale(${1 + comboPop * 0.35})`;
      comboNumEl.style.color = TIERS[Math.max(0, comboTier - 1)] && comboTier ? TIERS[comboTier - 1][2] : '#ffffff';
      comboTimeEl.style.width = (comboTimer / 2.6 * 100) + '%';
      const b = comboBonus(); comboBonusEl.textContent = b > 0 ? `+${Math.round(b * 100)} % daño` : '';
    }
    if (comboWordT > 0){ comboWordT -= dt; comboWordEl.style.opacity = String(Math.min(1, comboWordT / 0.3)); }
  } else comboBox.hidden = true;
  tagsEl.hidden = !(playing || gameState === 'upgrade' || gameState === 'paused') || !tagsEl.innerHTML;
  if (bannerT > 0 && !frozen){ bannerT -= dt; bannerEl.style.opacity = String(Math.min(1, bannerT / 0.3)); if (bannerT <= 0) bannerEl.hidden = true; }
  if (flashA > 0){ flashA = Math.max(0, flashA - dt * 2.2); flashEl.style.opacity = String(flashA); }
  document.body.classList.toggle('slowmo', slowT > 0 && playing);
  document.body.classList.toggle('playing', playing);
  document.body.classList.toggle('bossfight', !!bossE && playing);
  if (playing || gameState === 'upgrade'){
    const hp = Math.ceil(Math.max(0, player.hp)), mp = Math.floor(player.meter);
    const fr = fragNow();
    const key = `${hp}|${player.maxHp}|${mp}|${wave}|${queue.length + enemies.filter(e => e.alive).length}|${fr}`;
    if (key !== lastHud){
      lastHud = key;
      const hpPct = hp / player.maxHp * 100;
      hpFill.style.width = hpPct + '%'; hpFill.className = hpPct < 30 ? 'low' : '';
      hud.classList.toggle('danger', hpPct < 30);
      const alive_ = queue.length + enemies.filter(e => e.alive).length;
      waveProg.style.width = clamp(100 - alive_ / Math.max(1, waveTotal) * 100, 0, 100) + '%';
      hpTxt.textContent = `${hp}/${player.maxHp}`;
      mpFill.style.width = mp + '%'; mpFill.className = mp >= 100 ? 'full' : '';
      mpTxt.textContent = mp >= 100 ? '¡LISTO!' : mp + '%';
      fragTxt.textContent = `✦ ${fr}`;
      waveTxt.textContent = special ? `Castillo · Sala ${Math.min(special.stage, special.max - 1)}${special.stage === special.max ? ' · Jefe' : ''} · ${queue.length + enemies.filter(e => e.alive).length}` : `Oleada ${wave} · ${queue.length + enemies.filter(e => e.alive).length} enemigos`;
    }
  }

  if (!(chMode === 'paper' && (++chFrame % 3 !== 0))){ renderer.render(scene, camera); renderOutline(); renderClones(); }
}
texturasListas().then(() => requestAnimationFrame(frame));   // primer fotograma con todas las texturas ya pintadas

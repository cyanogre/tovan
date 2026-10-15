'use strict';
/* ---------- Ataque cargado ---------- */
var gpAtkHeld = false, touchAtkHeld = false, mHold = null;
let chargeT = 0, chargeLvl = 0, holdT = 0, umb = null, chargeShot = null;
const CH_T1 = 0.5, CH_T2 = 1.25;
const chargeSpd = () => 1 + 0.2 * ml('chargeS');
const atkHeld = () => !!(keys.KeyJ || gpAtkHeld || touchAtkHeld || (mHold && (mHold.charging || (mHold.ok && performance.now() - mHold.t > 260))));
canvas.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) mHold = { x: e.clientX, y: e.clientY, t: performance.now(), ok: true, charging: false }; });
canvas.addEventListener('pointermove', e => { if (mHold && Math.hypot(e.clientX - mHold.x, e.clientY - mHold.y) > 6) mHold.ok = false; });
addEventListener('pointerup', e => { if (e.pointerType === 'mouse' && e.button === 0) mHold = null; });
addEventListener('pointercancel', () => { mHold = null; });
const W_COL = { staff: 0xbff6ff, baguette: 0xffc070, umbrella: 0xff6a6a, churro: 0xffb040, chancla: 0x6ab0ff, chicken: 0xffe066, katana: 0xd8d8ff };
const wCol = () => W_COL[meta.cos.weapon] || 0xbff6ff;
const chOrb = mesh(new THREE.IcosahedronGeometry(0.16, 1), makeMat(0xffffff, { emissive: 1, opacity: 0.85 }), 0, 0, 0, staffTip); chOrb.visible = false;
const thrustW = () => ['staff', 'chancla', 'chicken', 'katana'].includes(meta.cos.weapon);
function startCharge(){
  state = 'charge'; chargeT = 0; chargeLvl = 0; comboT = 0; queued = false; staffToHand(); attackW = Math.max(attackW, 0.5);
  if (mHold) mHold.charging = true; play('chargeStart');
}
function chargeTick(pdt, held, wantMove){
  chargeT += pdt * chargeSpd();
  attackW = Math.min(1, attackW + pdt * 10); staffToHand();
  const base = thrustW() ? CH_BACK : CH_UP, k = Math.min(1, chargeT / 0.25);
  curPose = samplePose([[0, HOLD], [1, base]], k);
  if (chargeLvl === 2){ curPose.spX += Math.sin(time * 60) * 0.02; curPose.shY += Math.sin(time * 47) * 0.04; }
  if (!wantMove){ const e = nearestEnemy(6); if (e) heading = angTo(hero.position.x, hero.position.z, e.g.position.x, e.g.position.z); }
  hero.rotation.y = lerpAngle(hero.rotation.y, heading, 1 - Math.exp(-pdt * 12));
  const col = chargeLvl === 2 ? 0xffd970 : wCol();
  chOrb.visible = true; chOrb.material.uniforms.uColor.value.setHex(col);
  chOrb.scale.setScalar(0.4 + Math.min(1, chargeT / CH_T2) * 1.2 + (chargeLvl === 2 ? Math.sin(time * 30) * 0.15 : 0));
  staffTip.getWorldPosition(tA);
  if (rnd() < pdt * (chargeLvl === 2 ? 50 : 26)){ const a = rnd() * TAU, b = rnd() * TAU, r = 0.9;
    const ox = Math.cos(a) * Math.sin(b) * r, oy = Math.cos(b) * r, oz = Math.sin(a) * Math.sin(b) * r;
    spawnFx(tA.x + ox, tA.y + oy, tA.z + oz, -ox * 3.2, -oy * 3.2, -oz * 3.2, col, 0.05, 0.3, 0, 0); }
  if (chargeLvl < 1 && chargeT >= CH_T1){ chargeLvl = 1; play('chargeLv1'); ringFx(hero.position.x, hero.position.z, col, 0.3, 1.4, 0.3); sparks(tA.x, tA.y, tA.z, 8, col); }
  if (chargeLvl < 2 && chargeT >= CH_T2){ chargeLvl = 2; play('chargeLv2'); ringFx(hero.position.x, hero.position.z, 0xffd970, 0.3, 2.2, 0.35); flash('#fff3c0', 0.18); lightFlash(tA.x, tA.y, tA.z, 0xffd970, 1.6, 5);
    tB.set(hero.position.x, hero.position.y + 2.7, hero.position.z); spawnNumber(tB, '¡MÁX!', 'react', '#ffd970'); }
  if (meta.cos.weapon === 'umbrella') blockFront(1.7, 0.2, 0xff8a8a);
  if (!held) releaseCharge();
}
function releaseCharge(){
  chOrb.visible = false;
  if (chargeLvl === 0){ state = 'normal'; return; }
  const lv = chargeLvl; chargeLvl = 0; chargeT = 0; if (mHold) mHold.charging = false;
  if (inputMag > 0.12) heading = inputHeading; hero.rotation.y = heading;
  chargeShot = { w: meta.cos.weapon, lv }; stat('charged'); if (lv === 2 && stat('chargeMax') >= 50) unlock('charge50');
  const w = chargeShot.w;
  if (w === 'umbrella'){ startUmbrella(lv); return; }
  const mvName = w === 'churro' ? 'chSpin' : thrustW() ? 'chThrust' : 'chSmash';
  MV[mvName].fire = chargedFire; startMove(mvName, 95); play('swingBig');
}
function cdmg(base, lv, extraCrit = 0){
  let v = base * (0.9 + rnd() * 0.2) * up.dmg * (lv === 2 ? 1.7 : 1) * (1 + 0.1 * ml('chargeS')) * (1 + comboBonus()) * otakuMul() * chMul();
  const crit = slowT > 0 || rnd() < up.crit + extraCrit + (lv === 2 ? 0.15 : 0);
  return [Math.round(v * (crit ? critMul() : 1)), crit];
}
function chHit(e, base, lv, nx, nz, knock, o = {}, extraCrit = 0){
  const [v, c] = cdmg(base, lv, extraCrit);
  const ok = hitEnemy(e, v, c, nx, nz, knock * knockMul(), 5, true, Object.assign({ src: 'melee' }, o));
  if (ok) onStaffHits([e], { slam: !!o.slam });
  return ok;
}
function chargedFire(mv, i){
  const s = chargeShot || { w: 'staff', lv: 1 }, lv = s.lv;
  const fX = Math.sin(hero.rotation.y), fZ = Math.cos(hero.rotation.y), hx = hero.position.x, hz = hero.position.z;
  if (s.w === 'staff'){
    const g = new THREE.Group(); scene.add(g); g.position.set(hx + fX * 0.8, 0.05, hz + fZ * 0.8); g.rotation.y = hero.rotation.y;
    const m = mesh(moonGeo, makeMat(0xbff6ff, { emissive: 1, opacity: 0.85, side: THREE.DoubleSide }), 0, 0.85, 0, g); m.rotation.x = -Math.PI / 2;
    const a1 = mesh(archGeo, makeMat(0xbff6ff, { emissive: 1, opacity: 0.85, side: THREE.DoubleSide }), 0, 0, 0, g); a1.rotation.x = -0.3;
    const a2 = mesh(archGeo, makeMat(0xffffff, { emissive: 1, opacity: 0.7, side: THREE.DoubleSide }), 0, 0, -0.25, g); a2.rotation.x = -0.3; a2.scale.setScalar(0.72);
    g.scale.setScalar(lv === 2 ? 1.6 : 1.15);
    waves.push({ g, vx: fX * 14, vz: fZ * 14, life: lv === 2 ? 0.75 : 0.55, w: lv === 2 ? 1.5 : 1.05, hit: new Set(), lv, kind: 'light' });
    play('lanternWave'); lightFlash(hx, 1.2, hz, 0xbff6ff, 1.8, 7); shake = Math.max(shake, 0.15);
  } else if (s.w === 'baguette'){
    const L = lv === 2 ? 6.6 : 5.0, hw = 0.95, k0 = kills;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
      const ex = e.g.position.x - hx, ez = e.g.position.z - hz, along = ex * fX + ez * fZ, side = Math.abs(ex * fZ - ez * fX);
      if (along > -0.5 && along < L + e.r && side < hw + e.r) chHit(e, 78, lv, fX, fZ, 6, { slam: true }); }
    for (let d = 0.6; d < L; d += 0.35){ const x = hx + fX * d, z = hz + fZ * d;
      for (let j = 0; j < 2; j++) spawnFx(x + (rnd() - 0.5) * 0.8, 0.15, z + (rnd() - 0.5) * 0.8, (rnd() - 0.5) * 2, 2 + rnd() * 3, (rnd() - 0.5) * 2, rnd() < 0.5 ? 0xd49a4a : 0xf0c880, 0.09, 0.7, 10, 0); }
    ringFx(hx + fX * L, hz + fZ * L, 0xffc070, 0.3, 1.8, 0.35); play('slam'); play('boing'); shake = Math.max(shake, 0.45); hitStop = Math.max(hitStop, 0.08);
    if (kills - k0 >= 4) unlock('pan4');
  } else if (s.w === 'churro'){
    const R = lv === 2 ? 3.7 : 2.9;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
      const ex = e.g.position.x - hx, ez = e.g.position.z - hz, d = Math.max(0.001, Math.hypot(ex, ez));
      if (d - e.r < R){ chHit(e, 30, lv, -ex / d * 0.5, -ez / d * 0.5, 1.5, { el: 'fire', power: lv }); if (!e.heavy){ e.vx -= ex / d * 2.5; e.vz -= ez / d * 2.5; } } }
    ringFx(hx, hz, 0xffb040, 0.3, R, 0.3); play('sugar');
    for (let j = 0; j < 22; j++){ const a = rnd() * TAU, r = rnd() * R; spawnFx(hx + Math.cos(a) * r, 0.3 + rnd() * 1.2, hz + Math.sin(a) * r, -Math.sin(a) * 4, 0.8, Math.cos(a) * 4, rnd() < 0.5 ? 0xfff8e8 : 0xff9a3a, 0.07, 0.6, 2, 0); }
  } else if (s.w === 'chancla'){
    const holder = new THREE.Group(); scene.add(holder); holder.position.set(hx + fX * 0.6, 1.0, hz + fZ * 0.6);
    const inner = WEAPONS.chancla.clone(); inner.visible = true; inner.rotation.x = Math.PI / 2; holder.add(inner); holder.scale.setScalar(lv === 2 ? 1.9 : 1.45);
    WEAPONS.chancla.visible = false;
    rangs.push({ g: holder, dir: hero.rotation.y, out: lv === 2 ? 9 : 7, d: 0, back: false, hitA: new Set(), hitB: new Set(), lv, t: 0, k0: kills });
    play('boomerang');
  } else if (s.w === 'chicken'){
    const R = lv === 2 ? 6.6 : 5.0, k0 = kills;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
      const ex = e.g.position.x - hx, ez = e.g.position.z - hz, d = Math.max(0.001, Math.hypot(ex, ez));
      if (d - e.r < R && (ex * fX + ez * fZ) / d > 0.5){ if (chHit(e, 42, lv, ex / d, ez / d, 8)) stunE(e, lv === 2 ? 1.8 : 1.2); } }
    blockFront(R, 0.5, 0xffe066, true);
    for (let j = 0; j < 4; j++) later(j * 0.06, () => { const g = new THREE.Group(); scene.add(g); g.position.set(hx + fX * 0.8, 1.0, hz + fZ * 0.8); g.rotation.y = hero.rotation.y;
      const m = mesh(archGeo, makeMat(j % 2 ? 0xffffff : 0xffe066, { emissive: 1, opacity: 0.7, side: THREE.DoubleSide }), 0, -0.9, 0, g); g.scale.setScalar(0.6);
      waves.push({ g, vx: fX * 11, vz: fZ * 11, life: R / 11, w: 0, hit: new Set(), lv, kind: 'sonic', grow: 2.6 }); });
    play('squawk'); tB.set(hx, hero.position.y + 2.6, hz); spawnNumber(tB, '¡COCOCOCÓ!', 'react', '#ffe066'); shake = Math.max(shake, 0.2);
    if (kills - k0 >= 3) unlock('pan4');
  } else if (s.w === 'katana'){
    const D = lv === 2 ? 6 : 4.5, x0 = hx, z0 = hz;
    let x1 = hx + fX * D, z1 = hz + fZ * D; const rr = Math.hypot(x1, z1); if (!chActive && rr > ARENA - 0.3){ x1 *= (ARENA - 0.3) / rr; z1 *= (ARENA - 0.3) / rr; }
    const L = Math.hypot(x1 - x0, z1 - z0), marked = [];
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
      const ex = e.g.position.x - x0, ez = e.g.position.z - z0, along = ex * fX + ez * fZ, side = Math.abs(ex * fZ - ez * fX);
      if (along > -0.4 && along < L + e.r + 0.6 && side < 0.9 + e.r) marked.push(e); }
    for (let d = 0; d < L; d += 0.25){ const x = x0 + fX * d, z = z0 + fZ * d; spawnFx(x, 0.4 + rnd() * 1.2, z, 0, 0.3, 0, rnd() < 0.5 ? 0xd8d8ff : 0xffffff, 0.08, 0.5, 0, 0); }
    hero.position.x = x1; hero.position.z = z1; player.inv = Math.max(player.inv, 0.3);
    play('sheath'); slowT = Math.max(slowT, 0.45); flash('#e8e8ff', 0.2);
    tB.set(x0, 1, z0); slashFx(tB, hero.rotation.y, 0xffffff, L + 1, true);
    later(0.38, () => { const k0 = kills; play('iaido'); flash('#ffffff', 0.35); shake = Math.max(shake, 0.35);
      for (const e of marked){ if (!e.alive) continue; tB.set(e.g.position.x, 1, e.g.position.z);
        slashFx(tB, rnd() * TAU, 0xffffff, 2.6); slashFx(tB, rnd() * TAU, 0xd8d8ff, 2.2); chHit(e, 96, lv, fX, fZ, 3, {}, 0.2); }
      if (kills - k0 >= 4) unlock('iaido4'); });
  }
}
// medias lunas (onda de linterna y graznido)
const moonGeo = new THREE.RingGeometry(0.55, 1.0, 22, 1, -Math.PI / 2 - 0.95, 1.9);
const archGeo = new THREE.RingGeometry(0.78, 1.0, 22, 1, 0.12, Math.PI - 0.24);
const waves = [];
function updateWaves(dt){
  for (let i = waves.length - 1; i >= 0; i--){
    const w = waves[i]; w.life -= dt; w.g.position.x += w.vx * dt; w.g.position.z += w.vz * dt;
    if (w.grow) w.g.scale.multiplyScalar(1 + w.grow * dt);
    w.g.children.forEach(m => { m.material.uniforms.uOpacity.value = Math.max(0, Math.min(0.85, w.life * 4)); });
    if (w.kind === 'light'){
      if (rnd() < 0.8) spawnFx(w.g.position.x + (rnd() - 0.5) * w.w * 1.4, 0.3 + rnd() * 1.2, w.g.position.z + (rnd() - 0.5) * w.w * 1.4, -w.vx * 0.05, 0.5, -w.vz * 0.05, 0xbff6ff, 0.06, 0.35, 0, 0);
      for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || w.hit.has(e)) continue;
        if (Math.hypot(e.g.position.x - w.g.position.x, e.g.position.z - w.g.position.z) - e.r < w.w){ w.hit.add(e); const sp = Math.hypot(w.vx, w.vz);
          chHit(e, 62, w.lv, w.vx / sp, w.vz / sp, 4); } }
      if (Math.hypot(w.g.position.x, w.g.position.z) > 14) w.life = 0;
    }
    if (w.life <= 0){ scene.remove(w.g); waves.splice(i, 1); }
  }
}
function blockFront(R, cone, col, all){
  const fX = Math.sin(hero.rotation.y), fZ = Math.cos(hero.rotation.y);
  for (let i = projectiles.length - 1; i >= 0; i--){ const p = projectiles[i]; if (p.owner !== 'enemy') continue;
    const dx = p.m.position.x - hero.position.x, dz = p.m.position.z - hero.position.z, d = Math.max(0.001, Math.hypot(dx, dz));
    if (d < R && (dx * fX + dz * fZ) / d > cone){ sparks(p.m.position.x, 1, p.m.position.z, 6, col); scene.remove(p.m); projectiles.splice(i, 1); play('block'); if (!all) break; } }
}
// chancla búmeran
const rangs = [];
function updateRangs(dt){
  for (let i = rangs.length - 1; i >= 0; i--){
    const r = rangs[i]; r.t += dt; r.g.rotation.y += dt * 22;
    const p = r.g.position;
    if (!r.back){
      const tgt = nearestEnemyFrom(p.x, p.z);
      if (tgt){ const a = angTo(p.x, p.z, tgt.g.position.x, tgt.g.position.z), d = ((a - r.dir + Math.PI) % TAU + TAU) % TAU - Math.PI; if (Math.abs(d) < 1.1) r.dir += clamp(d, -2.5 * dt, 2.5 * dt); }
      const sp = 12; p.x += Math.sin(r.dir) * sp * dt; p.z += Math.cos(r.dir) * sp * dt; r.d += sp * dt;
      if (r.d >= r.out || Math.hypot(p.x, p.z) > (chActive ? 14 : ARENA + 0.5)) r.back = true;
    } else {
      const dx = hero.position.x - p.x, dz = hero.position.z - p.z, d = Math.max(0.001, Math.hypot(dx, dz)), sp = 14 + r.t * 3;
      p.x += dx / d * Math.min(d, sp * dt); p.z += dz / d * Math.min(d, sp * dt); p.y += (hero.position.y + 1.0 - p.y) * (1 - Math.exp(-dt * 6));
      if (d < 0.6 || r.t > 4){ scene.remove(r.g); rangs.splice(i, 1); if (!rangs.length) WEAPONS.chancla.visible = meta.cos.weapon === 'chancla'; play('catch');
        if (kills - r.k0 >= 4 || r.hitA.size + r.hitB.size >= 8) unlock('chancla4'); continue; }
    }
    const set = r.back ? r.hitB : r.hitA;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || set.has(e)) continue;
      const ex = e.g.position.x - p.x, ez = e.g.position.z - p.z, d = Math.max(0.001, Math.hypot(ex, ez));
      if (d - e.r < 0.6 * r.g.scale.x){ set.add(e); if (chHit(e, r.base || 46, r.lv, ex / d, ez / d, 3)){ stunE(e, 0.5); play('chanclazo'); tB.set(e.g.position.x, e.numY + 0.3, e.g.position.z); if (set.size === 1) spawnNumber(tB, '¡ZAS!', 'react', '#6ab0ff'); } } }
    if (rnd() < 0.5) spawnFx(p.x, p.y, p.z, 0, 0.2, 0, rnd() < 0.5 ? 0x6ab0ff : 0xff6aa8, 0.06, 0.25, 0, 0);
  }
}
// paraguas: sube, flota y cae en picado
function startUmbrella(lv){
  state = 'normal'; vy = lv === 2 ? 11.6 : 10.2; grounded = false; umb = { lv, hang: -1, y: 0 }; puff(8, 1.6); play('umbrella');
  for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
    const ex = e.g.position.x - hero.position.x, ez = e.g.position.z - hero.position.z, d = Math.max(0.001, Math.hypot(ex, ez));
    if (d - e.r < 2.6) chHit(e, 24, lv, ex / d, ez / d, 6); }
  ringFx(hero.position.x, hero.position.z, 0xff6a6a, 0.3, 2.6, 0.35);
}
const umbCone = WEAPONS.umbrella.children.find(o => o.geometry && o.geometry.type === 'ConeGeometry');
function umbTick(pdt){
  if (umb && (state === 'attack' || state === 'roll' || state === 'dead')) umb = null;
  if (!umb) { if (umbCone) umbCone.scale.lerp(tC.set(1, 1, 1), 1 - Math.exp(-pdt * 10)); return; }
  staffToHand(); attackW = 1; curPose = pose({ shX: -3.05, shY: 0.15, spY: 0, spX: -0.1, elX: -0.05, dy: 0 });
  if (umbCone) umbCone.scale.lerp(tC.set(5.2, 0.32, 5.2), 1 - Math.exp(-pdt * 12));
  heading += pdt * 9; hero.rotation.y = heading;
  if (umb.hang < 0 && vy <= 0 && !grounded){ umb.hang = 0.35; umb.y = hero.position.y; }
  if (umb.hang > 0){ umb.hang -= pdt; hero.position.y = umb.y + Math.sin(time * 9) * 0.04; vy = 0;
    if (rnd() < 0.5){ const a = rnd() * TAU; spawnFx(hero.position.x + Math.cos(a) * 1.2, hero.position.y + 1.4, hero.position.z + Math.sin(a) * 1.2, -Math.cos(a), -0.5, -Math.sin(a), 0xff9a9a, 0.06, 0.4, 0, 0); }
    if (umb.hang <= 0){ const lv = umb.lv; umb = null; diveMul = lv === 2 ? 1.9 : 1.5; diveRMul = lv === 2 ? 1.6 : 1.3;
      const e = nearestEnemy(7); if (e){ heading = angTo(hero.position.x, hero.position.z, e.g.position.x, e.g.position.z); }
      hero.rotation.y = heading; startMove('dive', 96); } }
  if (grounded || state === 'dead') umb = null;
}
const tC = new V3();
// tajos de luz
const slashes = [];
function slashFx(p, ang, col, len, flat){
  const m = mesh(B(len, 0.05, 0.05), makeMat(col, { emissive: 1, opacity: 0.95 }), p.x, p.y, p.z);
  m.rotation.y = ang; if (!flat) m.rotation.z = (rnd() - 0.5) * 1.2; if (flat){ m.position.x += Math.sin(ang) * len / 2 - Math.sin(ang) * 0.5; m.position.z += Math.cos(ang) * len / 2 - Math.cos(ang) * 0.5; m.rotation.y = ang + Math.PI / 2; }
  slashes.push({ m, t: 0.28 });
}
function updateSlashes(dt){ for (let i = slashes.length - 1; i >= 0; i--){ const s = slashes[i]; s.t -= dt; s.m.scale.set(1, 1 + (0.28 - s.t) * 6, 1); s.m.material.uniforms.uOpacity.value = Math.max(0, s.t / 0.28);
  if (s.t <= 0){ scene.remove(s.m); s.m.material.dispose(); slashes.splice(i, 1); } } }

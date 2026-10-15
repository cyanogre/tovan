'use strict';
/* ---------- Combos especiales ---------- */
const riceFire = [];
MV.paeC.fire = () => {
  const fX = Math.sin(hero.rotation.y), fZ = Math.cos(hero.rotation.y), hx = hero.position.x, hz = hero.position.z, big = lvl('paB') ? 1.35 : 1, h0 = P5.hits;
  resolveHit(Object.assign({}, MV.paeA, { dmg: [30, 38], range: 3.4 * big, cone: 0.15, knock: 3, el: 'fire', hs: 0.05, clang: true }));
  for (let i = 0; i < 26; i++){ const a = hero.rotation.y + (rnd() - 0.5) * 1.1, sp = 2 + rnd() * 3.5 * big;
    spawnFx(hx + fX * 0.8, 1.6, hz + fZ * 0.8, Math.sin(a) * sp, 3 + rnd() * 2, Math.cos(a) * sp, rnd() < 0.6 ? 0xffd040 : rnd() < 0.5 ? 0xc8302a : 0x4f9a3a, 0.07, 0.8, 12, 0); }
  for (let k = 0; k < 4; k++){ const a = hero.rotation.y + (k - 1.5) * 0.3, d = (2 + rnd() * 1.4) * big; const x = hx + Math.sin(a) * d, z = hz + Math.cos(a) * d;
    riceFire.push({ m: mesh(flameGeo, makeMat(0xffa040, { emissive: 1 }), x, 0.2, z), t: 2.2, max: 2.2 }); }
  play('clang'); play('sugar');
  if (lvl('paB')) later(0.05, () => { const n = P5.hits - h0; if (n > 0) heal(n, false); });
};
MV.gtrC.fire = () => { const hx = hero.position.x, hz = hero.position.z, f = hero.rotation.y; sonicCone(hx, hz, f, 4.6, 0.5, 34, 6, 0xff4a8a); play('chord'); };
MV.yoD.fire = () => { yoyoWorld(3.2); if (lvl('yyB')) later(0.18, () => yoyoWorld(3.9)); };
MV.fanC.fire = () => {
  const hx = hero.position.x, hz = hero.position.z, f = hero.rotation.y, fX = Math.sin(f), fZ = Math.cos(f);
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
    const ex = e.g.position.x - hx, ez = e.g.position.z - hz, d = Math.max(0.001, Math.hypot(ex, ez));
    if (d - e.r < 5 && (ex * fX + ez * fZ) / d > 0.35){ const [v, c] = rollDamage({ dmg: [22, 28], critB: 0 });
      if (hitEnemy(e, v, c, ex / d, ez / d, 9 * knockMul(), 5, true, { src: 'melee' })) onStaffHits([e], { fanHit: true }); } }
  blockFront(5, 0.35, 0xff8aa8, true); windArches(hx, hz, f, 0xffd0e0); play('whoosh');
};
function sonicCone(hx, hz, f, R, cone, base, knock, col){
  const fX = Math.sin(f), fZ = Math.cos(f);
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
    const ex = e.g.position.x - hx, ez = e.g.position.z - hz, d = Math.max(0.001, Math.hypot(ex, ez));
    if (d - e.r < R && (ex * fX + ez * fZ) / d > cone){ const [v, c] = rollDamage({ dmg: [base * 0.9, base * 1.1] });
      if (hitEnemy(e, v, c, ex / d, ez / d, knock * knockMul(), 5, true, { src: 'melee' })) onStaffHits([e], { strum: true }); } }
  windArches(hx, hz, f, col); shake = Math.max(shake, 0.2);
}
function windArches(hx, hz, f, col){
  const fX = Math.sin(f), fZ = Math.cos(f);
  for (let j = 0; j < 4; j++) later(j * 0.06, () => { const g = new THREE.Group(); scene.add(g); g.position.set(hx + fX * 0.8, 1.0, hz + fZ * 0.8); g.rotation.y = f;
    mesh(archGeo, makeMat(j % 2 ? 0xffffff : col, { emissive: 1, opacity: 0.7, side: THREE.DoubleSide }), 0, -0.9, 0, g); g.scale.setScalar(0.6);
    waves.push({ g, vx: fX * 11, vz: fZ * 11, life: 0.42, w: 0, hit: new Set(), lv: 1, kind: 'sonic', grow: 2.6 }); });
}
function yoyoWorld(R){
  const hx = hero.position.x, hz = hero.position.z;
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
    const ex = e.g.position.x - hx, ez = e.g.position.z - hz, d = Math.max(0.001, Math.hypot(ex, ez));
    if (d - e.r < R){ const [v, c] = rollDamage({ dmg: [30, 36] }); if (hitEnemy(e, v, c, ex / d, ez / d, 4 * knockMul(), 6, true, { src: 'melee' })) onStaffHits([e], {}); } }
  ringFx(hx, hz, 0x4ad8ff, 0.4, R, 0.35); for (let i = 0; i < 16; i++){ const a = i / 16 * TAU; spawnFx(hx + Math.cos(a) * R * 0.9, 0.9, hz + Math.sin(a) * R * 0.9, -Math.sin(a) * 4, 0.3, Math.cos(a) * 4, 0x9ff6ff, 0.07, 0.4, 0, 0); }
  play('yoyo');
}

/* ---------- Cargados nuevos ---------- */
const discs = [], rollers = [], tornados = [], cracks = [], puddles5 = [], chicks = [], eggs = [], rifts = [];
const NEW_CH = { paella: 'chPaella', guitar: 'chGuitar', yoyo: 'chYoyo', fan: 'chFan', hammer: 'chHammer' };
const _releaseCharge5w = releaseCharge;
releaseCharge = function(){
  const w = meta.cos.weapon;
  if (!NEW_CH[w] || chargeLvl === 0) return _releaseCharge5w();
  chOrb.visible = false;
  const lv = chargeLvl; chargeLvl = 0; chargeT = 0; if (mHold) mHold.charging = false;
  if (inputMag > 0.12) heading = inputHeading; hero.rotation.y = heading;
  chargeShot = { w, lv }; stat('charged'); if (lv === 2 && stat('chargeMax') >= 50) unlock('charge50');
  const n = NEW_CH[w]; MV[n].fire = newChargedFire; startMove(n, 95); play('swingBig');
  p5ChargeRelease(lv);
};
function newChargedFire(mv, i){
  const s = chargeShot || { w: meta.cos.weapon, lv: 1 }, lv = s.lv;
  const f = hero.rotation.y, fX = Math.sin(f), fZ = Math.cos(f), hx = hero.position.x, hz = hero.position.z;
  if (s.w === 'paella'){
    const holder = new THREE.Group(); scene.add(holder); holder.position.set(hx + fX * 0.7, 1.0, hz + fZ * 0.7);
    const inner = WEAPONS.paella.clone(); inner.visible = true; inner.rotation.x = Math.PI / 2; holder.add(inner); holder.scale.setScalar(lv === 2 ? 1.6 : 1.25);
    WEAPONS.paella.visible = false;
    discs.push({ g: holder, vx: fX * 13, vz: fZ * 13, left: (lv === 2 ? 5 : 3) + (lvl('paA') ? 3 : 0), hit: new Set(), t: 0, lv, back: false, tgt: null });
    play('boomerang'); play('clang');
  } else if (s.w === 'guitar'){
    const last = i === mv.hits.length - 1, R = (lv === 2 ? 4.4 : 3.5) * (lvl('gtA') ? 1.3 : 1), cols = [0xff4a8a, 0x4ad8ff, 0xffe04a, 0x7dff8a, 0xc88aff];
    const col = cols[i % cols.length], hit = new Set();
    const m = mesh(new THREE.RingGeometry(0.85, 1, 32), makeMat(col, { emissive: 1, opacity: 0.85, side: THREE.DoubleSide }), hx, 0.4, hz); m.rotation.x = -Math.PI / 2;
    tornados.push({ ring: true, m, x: hx, z: hz, r: 0.4, R, t: 0, hit, lv, stun: last || lvl('gtA') ? (lv === 2 ? 1.5 : 1) : 0 });
    lightFlash(hx, 2, hz, col, 2, 7); play('chordSolo'); shake = Math.max(shake, 0.12);
    tB.set(hx, hero.position.y + 2.7, hz); if (i === 0) spawnNumber(tB, '♪ ¡SOLO! ♪', 'react', '#ff8ad8');
    if (last && lvl('gtB')) for (let k = 0; k < 3; k++) later(0.3 + k * 0.22, () => { sonicCone(hero.position.x, hero.position.z, hero.rotation.y + (k - 1) * 0.5, 4.2, 0.55, 26, 5, 0xffe04a); play('chord'); });
  } else if (s.w === 'yoyo'){
    const disc = WEAPONS.yoyo.userData.disc.clone(); scene.add(disc); disc.position.set(hx + fX * 0.8, 0.25, hz + fZ * 0.8); disc.scale.setScalar(lv === 2 ? 2.2 : 1.8);
    const lg = new THREE.BufferGeometry().setFromPoints([new V3(), new V3()]), line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: 0xffffff })); scene.add(line);
    WEAPONS.yoyo.userData.disc.visible = false;
    rollers.push({ m: disc, line, lg, dir: f, out: lv === 2 ? 10 : 7, d: 0.8, back: false, hitA: new Set(), hitB: new Set(), lv, t: 0, trailT: 0 }); play('yoyo');
  } else if (s.w === 'fan'){
    const g = new THREE.Group(); scene.add(g); g.position.set(hx + fX * 1.6, 0, hz + fZ * 1.6);
    const mats = [makeMat(0xffffff, { emissive: 0.8, opacity: 0.45, side: THREE.DoubleSide }), makeMat(0xffb0c8, { emissive: 0.8, opacity: 0.45, side: THREE.DoubleSide })];
    const rings = []; for (let k = 0; k < 6; k++){ const r = mesh(new THREE.TorusGeometry(0.35 + k * 0.28, 0.06, 4, 14), mats[k % 2], 0, 0.2 + k * 0.42, 0, g); r.rotation.x = Math.PI / 2; rings.push(r); }
    const dur = (lv === 2 ? 4 : 2.6) * (lvl('fnA') ? 2 : 1);
    tornados.push({ g, rings, mats, x: g.position.x, z: g.position.z, dir: f, t: dur, r: lv === 2 ? 3.4 : 2.6, pull: (lv === 2 ? 6 : 4.5) * (lvl('fnA') ? 1.5 : 1), tick: 0, lv });
    play('whoosh'); play('sugar');
  } else if (s.w === 'hammer'){
    const n = lv === 2 ? 5 : 3, spread = lv === 2 ? 0.45 : 0.6, L = lv === 2 ? 8 : 6;
    for (let k = 0; k < n; k++){ const a = f + (k - (n - 1) / 2) * spread; cracks.push({ x: hx + Math.sin(a) * 0.8, z: hz + Math.cos(a) * 0.8, a, L, d: 0, hit: new Set(), lv }); }
    shake = Math.max(shake, 0.55); play('bossSlam'); play('squeak'); flash('#fff0a0', 0.25); ringFx(hx, hz, 0xffd23a, 0.4, 2.6, 0.4);
    tB.set(hx, hero.position.y + 2.7, hz); spawnNumber(tB, '¡PIIIIII!', 'react', '#ffd23a');
  }
}
function updateNewWeapons(dt){
  const hx = hero.position.x, hz = hero.position.z;
  // paella voladora
  for (let i = discs.length - 1; i >= 0; i--){ const d = discs[i], p = d.g.position; d.t += dt; d.g.rotation.y += dt * 18;
    if (!d.back){
      if (d.tgt && (!d.tgt.alive || d.hit.has(d.tgt))) d.tgt = null;
      if (d.tgt){ const a = angTo(p.x, p.z, d.tgt.g.position.x, d.tgt.g.position.z); d.vx = Math.sin(a) * 15; d.vz = Math.cos(a) * 15; }
      p.x += d.vx * dt; p.z += d.vz * dt;
      for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || d.hit.has(e)) continue;
        const ex = e.g.position.x - p.x, ez = e.g.position.z - p.z, dd = Math.max(0.001, Math.hypot(ex, ez));
        if (dd - e.r < 0.55 * d.g.scale.x){ d.hit.add(e); if (chHit(e, 52, d.lv, ex / dd, ez / dd, 4, { el: 'fire', power: 1 })){ play('clang'); sparks(p.x, 1, p.z, 8, 0xffc040); }
          d.left--; let best = null, bd = 6.5; for (const o of enemies){ if (!o.alive || o.spawnT > 0 || d.hit.has(o)) continue; const q = Math.hypot(o.g.position.x - p.x, o.g.position.z - p.z); if (q < bd){ bd = q; best = o; } }
          d.tgt = best; if (!best || d.left <= 0) d.back = true; break; } }
      if (d.t > 3.5 || Math.hypot(p.x, p.z) > (chActive ? 14 : ARENA + 0.5)) d.back = true;
    } else { const dx = hx - p.x, dz = hz - p.z, dd = Math.max(0.001, Math.hypot(dx, dz)), sp = 14 + d.t * 3;
      p.x += dx / dd * Math.min(dd, sp * dt); p.z += dz / dd * Math.min(dd, sp * dt); p.y += (hero.position.y + 1 - p.y) * (1 - Math.exp(-dt * 6));
      if (dd < 0.6 || d.t > 6){ scene.remove(d.g); discs.splice(i, 1); if (!discs.length) WEAPONS.paella.visible = meta.cos.weapon === 'paella'; play('catch'); continue; } }
    if (rnd() < 0.6) spawnFx(p.x, p.y, p.z, 0, 0.3, 0, rnd() < 0.5 ? 0xffd040 : 0xff7a2a, 0.06, 0.3, 0, 0); }
  // yoyó por el suelo
  for (let i = rollers.length - 1; i >= 0; i--){ const r = rollers[i], p = r.m.position; r.t += dt;
    if (!r.back){ const sp = 12; p.x += Math.sin(r.dir) * sp * dt; p.z += Math.cos(r.dir) * sp * dt; r.d += sp * dt;
      if (r.d >= r.out || Math.hypot(p.x, p.z) > (chActive ? 14 : ARENA + 0.3)) r.back = true; }
    else { const dx = hx - p.x, dz = hz - p.z, dd = Math.max(0.001, Math.hypot(dx, dz)), sp = 15;
      p.x += dx / dd * Math.min(dd, sp * dt); p.z += dz / dd * Math.min(dd, sp * dt);
      if (dd < 0.7 || r.t > 4){ scene.remove(r.m); scene.remove(r.line); r.lg.dispose(); rollers.splice(i, 1); WEAPONS.yoyo.userData.disc.visible = true; play('catch'); continue; } }
    r.m.rotation.x += dt * 25 * (r.back ? -1 : 1); r.m.rotation.y = r.dir;
    staffTip.getWorldPosition(tA); r.lg.attributes.position.setXYZ(0, tA.x, tA.y, tA.z); r.lg.attributes.position.setXYZ(1, p.x, p.y + 0.2, p.z); r.lg.attributes.position.needsUpdate = true;
    const set = r.back ? r.hitB : r.hitA;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || set.has(e)) continue;
      const ex = e.g.position.x - p.x, ez = e.g.position.z - p.z, dd = Math.max(0.001, Math.hypot(ex, ez));
      if (dd - e.r < 0.6){ set.add(e); if (chHit(e, 34, r.lv, ex / dd, ez / dd, r.back ? 1 : 3)) play('yoyo');
        if (r.back && r.lv === 2 && !e.heavy && !e.isBoss){ const dx = hx - e.g.position.x, dz = hz - e.g.position.z, q = Math.max(0.1, Math.hypot(dx, dz)); e.vx += dx / q * 9; e.vz += dz / q * 9; } } }
    if (lvl('yyA')){ r.trailT -= dt; if (r.trailT <= 0 && P5.trail.length < 70){ r.trailT = 0.05; P5.trail.push({ m: mesh(trail5Geo, trail5Mat, p.x, 0.05, p.z), t: 2 }); } }
    if (rnd() < 0.5) spawnFx(p.x, 0.15, p.z, 0, 0.6, 0, 0x9ff6ff, 0.05, 0.3, 0, 0); }
  // torbellinos y anillos de sonido
  for (let i = tornados.length - 1; i >= 0; i--){ const T = tornados[i];
    if (T.ring){ T.t += dt; T.r += (T.R + 0.6) * 2.6 * dt; T.m.scale.setScalar(T.r); T.m.material.uniforms.uOpacity.value = Math.max(0, 0.85 * (1 - T.r / (T.R + 0.6)));
      for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || T.hit.has(e)) continue;
        const ex = e.g.position.x - T.x, ez = e.g.position.z - T.z, d = Math.max(0.001, Math.hypot(ex, ez));
        if (d - e.r < T.r){ T.hit.add(e); if (chHit(e, 26, T.lv, ex / d, ez / d, 5) && T.stun) stunE(e, T.stun); } }
      if (T.r >= T.R + 0.6){ scene.remove(T.m); T.m.material.dispose(); tornados.splice(i, 1); } continue; }
    T.t -= dt; T.tick -= dt; T.x += Math.sin(T.dir) * 2.2 * dt; T.z += Math.cos(T.dir) * 2.2 * dt;
    const v = clampArena(new V3(T.x, 0, T.z)); T.x = v.x; T.z = v.z; T.g.position.set(T.x, 0, T.z);
    T.rings.forEach((r, k) => { r.rotation.z += dt * (8 - k * 0.6); r.position.x = Math.sin(time * 6 + k) * 0.12 * k; });
    for (let k = 0; k < 3; k++){ const a = rnd() * TAU, rr = rnd() * T.r; spawnFx(T.x + Math.cos(a) * rr, rnd() * 2.4, T.z + Math.sin(a) * rr, -Math.sin(a) * 6, 1.5, Math.cos(a) * 6, rnd() < 0.5 ? 0xffffff : 0xffb0c8, 0.06, 0.4, 0, 0); }
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.isBoss || e.type === 'dragon') continue;
      const dx = T.x - e.g.position.x, dz = T.z - e.g.position.z, d = Math.hypot(dx, dz);
      if (d < T.r + 1.2 && d > 0.2){ const k = (e.heavy ? 0.45 : 1) * T.pull * dt; e.g.position.x += (dx / d - dz / d * 0.8) * k; e.g.position.z += (dz / d + dx / d * 0.8) * k; } }
    if (T.tick <= 0){ T.tick = 0.25; for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
        if (Math.hypot(e.g.position.x - T.x, e.g.position.z - T.z) - e.r < T.r){ const [v, c] = cdmg(9, T.lv); hitEnemy(e, v, c, 0, 0, 0, 1, false, { src: 'aoe' }); } } }
    if (T.t <= 0){ scene.remove(T.g); T.mats.forEach(m => m.dispose()); tornados.splice(i, 1); } }
  // grietas del martillo
  for (let i = cracks.length - 1; i >= 0; i--){ const c = cracks[i]; const d0 = c.d; c.d += 16 * dt;
    for (let s = Math.ceil(d0 / 0.5) * 0.5; s <= Math.min(c.d, c.L); s += 0.5){ const x = c.x + Math.sin(c.a) * s, z = c.z + Math.cos(c.a) * s;
      for (let j = 0; j < 2; j++) spawnFx(x + (rnd() - 0.5) * 0.4, 0.15, z + (rnd() - 0.5) * 0.4, (rnd() - 0.5) * 1.5, 3 + rnd() * 3, (rnd() - 0.5) * 1.5, rnd() < 0.5 ? 0x8a7a68 : 0xffd23a, 0.12, 0.7, 12, 0);
      if (Math.round(s * 2) % 2 === 0) puffAt(x, z, 2, 0.6);
      for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || c.hit.has(e)) continue;
        if (Math.hypot(e.g.position.x - x, e.g.position.z - z) - e.r < 0.75){ c.hit.add(e); if (chHit(e, 58, c.lv, Math.sin(c.a), Math.cos(c.a), 6, { slam: true })) stunE(e, 1.2); } } }
    if (c.d >= c.L){ cracks.splice(i, 1);
      if (lvl('hmB')){ const x = c.x + Math.sin(c.a) * c.L, z = c.z + Math.cos(c.a) * c.L; bolt(x, 9, z, x, 0.1, z, 0xfff27a, 0.14); play('zap'); later(0.05, () => explode(x, z, 1.8, 0xffe070, 36, { el: 'shock', kind: 'overload', knock: 3 })); } } }
  // fuegos de arroz, charcos de chocolate, rifts y luz del faro
  for (let i = riceFire.length - 1; i >= 0; i--){ const f = riceFire[i]; f.t -= dt; const k = f.t / f.max; f.m.scale.set(k, k * (1 + 0.3 * Math.sin(time * 20 + i)), k);
    if (f.t <= 0){ scene.remove(f.m); f.m.material.dispose(); riceFire.splice(i, 1); } }
  for (let i = puddles5.length - 1; i >= 0; i--){ const p = puddles5[i]; p.t -= dt; p.tick -= dt; p.m.material.uniforms.uOpacity.value = Math.min(p.op, p.t * 2);
    if (p.tick <= 0){ p.tick = 0.4; for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue; if (Math.hypot(e.g.position.x - p.x, e.g.position.z - p.z) - e.r < p.r) p.fn(e); } }
    if (p.t <= 0){ scene.remove(p.m); puddles5.splice(i, 1); } }
  if (riceFire.length && rnd() < dt * 3) for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
    if (riceFire.some(f => Math.hypot(f.m.position.x - e.g.position.x, f.m.position.z - e.g.position.z) < e.r + 0.4)) hitEnemy(e, rdmg(5), false, 0, 0, 0, 1, false, { src: 'aoe', el: 'fire', power: 1 }); }
  for (let i = rifts.length - 1; i >= 0; i--){ const r = rifts[i]; r.t -= dt; r.tick -= dt; r.m.material.uniforms.uOpacity.value = Math.min(0.9, r.t * 1.5); r.m.scale.y = 1 + Math.sin(time * 30) * 0.4;
    if (r.tick <= 0){ r.tick = 0.25; for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
        const ex = e.g.position.x - r.x0, ez = e.g.position.z - r.z0, along = ex * r.fx + ez * r.fz, side = Math.abs(ex * r.fz - ez * r.fx);
        if (along > -0.3 && along < r.L + 0.3 && side < 0.55 + e.r){ hitEnemy(e, rdmg(14), rnd() < 0.3, r.fz, -r.fx, 1, 1, false, { src: 'aoe' }); if (rnd() < 0.5){ tB.set(e.g.position.x, 1, e.g.position.z); slashFx(tB, rnd() * TAU, 0xffffff, 1.6); } } } }
    if (r.t <= 0){ scene.remove(r.m); rifts.splice(i, 1); } }
  // pollitos kamikaze y huevos
  for (let i = chicks.length - 1; i >= 0; i--){ const c = chicks[i]; c.t -= dt;
    if (!c.tgt || !c.tgt.alive) c.tgt = nearestFrom(c.g.position.x, c.g.position.z, 9);
    if (c.tgt){ const a = angTo(c.g.position.x, c.g.position.z, c.tgt.g.position.x, c.tgt.g.position.z); c.g.rotation.y = a; c.g.position.x += Math.sin(a) * 6.5 * dt; c.g.position.z += Math.cos(a) * 6.5 * dt; }
    c.g.position.y = Math.abs(Math.sin(time * 18 + i)) * 0.15;
    const boom = c.t <= 0 || (c.tgt && Math.hypot(c.tgt.g.position.x - c.g.position.x, c.tgt.g.position.z - c.g.position.z) < c.tgt.r + 0.3);
    if (boom){ explode(c.g.position.x, c.g.position.z, 2, 0xffe066, 40, { sfx: 'quackC', kind: 'impact', knock: 4 }); scene.remove(c.g); chicks.splice(i, 1); } }
  for (let i = eggs.length - 1; i >= 0; i--){ const g = eggs[i]; g.t -= dt; g.m.rotation.z = Math.sin(time * 30) * 0.3 * (1 - g.t);
    if (g.t <= 0){ explode(g.m.position.x, g.m.position.z, 1.7, 0xfff0c0, 30, { kind: 'impact', knock: 3, sfx: 'quackC' }); scene.remove(g.m); eggs.splice(i, 1); } }
  // chancla teledirigida
  if (lvl('clB')) for (const r of rangs){ if (r.back) continue; if (!r.longer){ r.longer = true; r.out *= 1.4; }
    const t = nearestEnemyFrom(r.g.position.x, r.g.position.z); if (t){ const a = angTo(r.g.position.x, r.g.position.z, t.g.position.x, t.g.position.z), d = ((a - r.dir + Math.PI) % TAU + TAU) % TAU - Math.PI; r.dir += clamp(d, -6 * dt, 6 * dt); } }
}

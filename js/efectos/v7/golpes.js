'use strict';
/* ---------- Golpes, críticos y muertes ---------- */
function critFx7(x, y, z){
  const c = lvl('crit');
  pa(x, y + 0.2, z, 0, 0, 0, 0xfff0a0, 1.1 + 0.3 * c, 0.2, 0, 0, 1.7, SH7.star);
  burst7(PA7, x, y, z, 8 + 3 * c, [0xffe070, 0xffffff, 0xffb040], 6, 0.15, 0.4, 4, 2, 0, SH7.star);
  const a = rnd() * TAU, L = 1.3 + 0.25 * c; streak7(x, y + 0.2, z, Math.cos(a), 0.4, Math.sin(a), L, 0xfff0a0, 0.18, 0.05); streak7(x, y + 0.2, z, Math.cos(a + 1.6), -0.4, Math.sin(a + 1.6), L, 0xfff0a0, 0.18, 0.05);
  if (c) gring(x, 0.08, z, 0xff4a4a, 0.3, 1.2 + 0.25 * c, 0.3);
  if (lvl('lucky')) burst7(PA7, x, y + 0.3, z, 7 + 3 * lvl('lucky'), [0x4aff6a, 0x9aff8a, 0x2ad84a], 4, 0.24, 0.75, 3, 1.5, 0.4, SH7.heart, 2);
  if (lvl('midas')){ burst7(PN7, x, y + 0.3, z, 12, [0xffd23a, 0xffe98a, 0xd8a020], 4.5, 0.14, 1.3, 14, 0.3, 1, SH7.dot, 4); if (rnd() < 0.4) play('cash'); }
}
function e7OnHit(e, val, crit, melee, o, was){
  const src = o.src || (melee ? 'melee' : 'other'); if (src === 'dot') return;
  const x = e.g.position.x, y = 0.9 * (e.scale || 1), z = e.g.position.z;
  if (src === 'melee'){
    const dl = lvl('dmg'); if (dl) burst7(PA7, x, y, z, 2 + dl, [0x9ff6ff, 0xffffff, 0x7fd8ff], 4.5, 0.15, 0.4, 6, 1, 0, SH7.dia, 1.5);
    if (lvl('fireEdge')) burst7(PA7, x, y, z, 5 + 2 * lvl('fireEdge'), EL7.fire, 3, 0.2, 0.5, -3, 2, 0.2, SH7.dot, 1);
    if (lvl('frost')) burst7(PA7, x, y, z, 6, EL7.ice, 3.5, 0.14, 0.55, 5, 2, 0.3, SH7.star);
    if (lvl('venomBlade') || lvl('poison')) burst7(PN7, x, y, z, 5, EL7.poison, 3, 0.13, 0.6, 9, 0.5, 0.6, SH7.dot, 1.5);
    if (lvl('storm')) for (let k = 0; k < 2; k++){ const a = rnd() * TAU; streak7(x, y, z, Math.cos(a), rnd() - 0.5, Math.sin(a), 0.5, 0xfff27a, 0.12, 0.03, 4); }
    if (lvl('avatar')) burst7(PA7, x, y, z, 9, [0xff6a10, 0x9fe8ff, 0xfff27a], 4, 0.17, 0.45, 2, 1, 0, SH7.star);
    if (lvl('cafe') && rnd() < 0.5) burst7(PN7, x, y, z, 3, [0x6a3a1a, 0x8a5a2a], 3, 0.1, 0.5, 10, 0, 1, SH7.dot, 1);
    if (P6.gadget === 'guante' && lvl('pocket')){ burst7(PA7, x, y + 0.3, z, 8, [0xffe24a, 0xff4a3a, 0xffffff], 5, 0.24, 0.25, 0, 3, 0, SH7.star); if (rnd() < 0.2) shout7('¡POW!', '#ffe24a', x, (e.numY || 2) + 0.3, z); }
    if (P6.bankaiT > 0) burst7(PN7, x, y, z, 6, [0x0a0408, 0x3a0a10], 4, 0.2, 0.5, 0, 3, 1.5, SH7.sq, 0);
    if (lvl('glassCannon') && time - E7.glass > 0.22){ E7.glass = time; glassShot7(x, y, z); }
    if (lvl('gomu') && rnd() < 0.6) gring(x, y, z, 0xffe0c0, 0.2, 0.9, 0.2, angTo(hero.position.x, hero.position.z, x, z));
    if (P6.milk && lvl('strawberry')) burst7(PA7, x, y, z, 3, [0xff9ac8, 0xffffff], 3, 0.14, 0.4, 0, 1, 0, SH7.heart);
    if (superOn) burst7(PA7, x, y, z, 4, [0xffe070, 0xfff6c0], 5, 0.12, 0.35, 0, 2, 0, SH7.star);
    const nW = wpOwned7(); if (nW) burst7(PA7, x, y, z, 2 + 2 * nW, [wCol(), 0xffffff], 4, 0.13, 0.35, 0, 1, 0, SH7.star);
    if (lvl('bgA') && curW() === 'baguette' && rnd() < 0.5) burst7(PN7, x, y, z, 6, [0xd8a060, 0xf0d0a0], 3.5, 0.1, 0.6, 12, 0, 1, SH7.sq, 2);
    if (lvl('fnB') && curW() === 'fan') burst7(PA7, x, y, z, 5, [0x7dff5a, 0xff7ab0], 3, 0.15, 0.6, 1, 1.5, 0.5, SH7.heart);
  }
  if (lvl('titan') && state === 'roll' && src === 'aoe'){ const a = rnd() * TAU; streak7(x, y, z, Math.cos(a), 0.3, Math.sin(a), 1.8, 0xdff4ff, 0.2, 0.06); streak7(x, y, z, Math.cos(a + 1.5), -0.3, Math.sin(a + 1.5), 1.8, 0xdff4ff, 0.2, 0.06);
    burst7(PN7, x, y, z, 6, 0xffffff, 2, 0.2, 0.5, 0, 1, 2.5, SH7.dot, 0); }
  if ((src === 'orb' || src === 'orbital') && lvl('vampOrbs') && time - E7.vamp > 0.12){ E7.vamp = time; bolt(x, y, z, hero.position.x, hero.position.y + 1.1, hero.position.z, 0xff2a4a, 0.025); burst7(PA7, x, y, z, 4, 0xff2a4a, 2, 0.12, 0.4, 0, 1, 0, SH7.heart); }
  if (crit && time - E7.crit > 0.05){ E7.crit = time; critFx7(x, y, z); }
}
function glassShot7(x, y, z){
  const g = ACC7.glass; if (!g || !g.visible) return; g.userData.muzzle.getWorldPosition(t7a);
  const dx = x - t7a.x, dy = y - t7a.y, dz = z - t7a.z, d = Math.hypot(dx, dy, dz);
  streak7((t7a.x + x) / 2, (t7a.y + y) / 2, (t7a.z + z) / 2, dx, dy, dz, d, 0x9ff6ff, 0.14, 0.05);
  pa(t7a.x, t7a.y, t7a.z, 0, 0, 0, 0xffffff, 0.55, 0.12, 0, 0, 1.5, SH7.star); burst7(PA7, x, y, z, 6, [0x9ff6ff, 0xffffff], 4, 0.11, 0.35, 8, 0, 1, SH7.dia); g.userData.kick = 1;
}
function swordAt7(e){
  const g = swordProto7.clone(); scene.add(g); const x = e.g.position.x, z = e.g.position.z, a = angTo(hero.position.x, hero.position.z, x, z); g.position.set(x - Math.sin(a) * 0.4, 0, z - Math.cos(a) * 0.4); g.rotation.order = 'YXZ'; g.rotation.y = a;
  const mats = []; g.traverse(o => { if (o.isMesh){ o.material = o.material.clone(); mats.push(o.material); } });
  ob7({ m: g, upd(o){ const k = o.t; g.rotation.x = k < 0.13 ? lerp(-1.4, 1.35, smooth(k / 0.13)) : 1.35; mats.forEach(m => { m.uniforms.uAlpha.value = k < 0.25 ? 0.95 : 0.95 * Math.max(0, 1 - (k - 0.25) / 0.3); });
      if (k >= 0.13 && !o.hit){ o.hit = true; shake = Math.max(shake, 0.3); gring(x, 0.1, z, 0xd8a060, 0.3, 2.6, 0.4); crack7(x, z, 4, 1.4, false); burst7(PN7, x, 0.4, z, 14, [0xc08a50, 0x8a5a2a, 0xf0d0a0], 5, 0.13, 0.7, 14, 0, 1, SH7.sq, 3); }
      return k > 0.56; }, end(){ mats.forEach(m => m.dispose()); } });
}
function janFist7(e){
  const g = fistProto7.clone(); scene.add(g); const x = e.g.position.x, y = 0.9 * (e.scale || 1), z = e.g.position.z, a = angTo(hero.position.x, hero.position.z, x, z);
  const sx = x - Math.sin(a) * 2.6, sz = z - Math.cos(a) * 2.6;
  ob7({ m: g, upd(o){ const k = Math.min(1, o.t / 0.1); g.position.set(lerp(sx, x, k), y + 0.2, lerp(sz, z, k)); g.lookAt(x, y + 0.2, z); g.scale.setScalar(1.1 + 0.5 * k);
      if (k >= 1 && !o.hit){ o.hit = true; for (let i = 0; i < 3; i++) gring(x, y, z, i ? 0xffc070 : 0xffffff, 0.3, 2 + i, 0.3 + i * 0.08, a); gring(x, 0.1, z, 0xffc070, 0.3, 3.2, 0.45);
        burst7(PA7, x, y, z, 26, [0xffc070, 0xffffff, 0xff8a2a], 8, 0.22, 0.4, 2, 2, 0, SH7.star); for (let i = 0; i < 6; i++){ const b = a + (rnd() - 0.5) * 1.2; streak7(x, y, z, Math.sin(b), (rnd() - 0.3) * 0.5, Math.cos(b), 1.6, 0xffe0a0, 0.2, 0.05, 6); } }
      if (k >= 1) g.scale.setScalar(Math.max(0.01, 1.6 * (1 - (o.t - 0.1) / 0.18))); return o.t > 0.28; } });
}
function stamp7(x, y, z){
  const d = decal7(stampTex7, x, y + 1.4, z, 1, 0xff2a3a, 0.9, 0, true); d.m.lookAt(camera.position); d.m.scale.set(1.6, 0.8, 1); const base = d.upd;
  d.upd = (o, dt) => { const k = Math.min(1, o.t / 0.12); o.m.scale.set(1.6 * (2.4 - 1.4 * k), 0.8 * (2.4 - 1.4 * k), 1); return base(o, dt); };
  burst7(PN7, x, y, z, 16, [0x1a2a6a, 0x2a3a8a, 0xff2a3a], 4, 0.15, 0.7, 10, 0, 1, SH7.dot, 2); gring(x, 0.08, z, 0xff2a3a, 0.3, 1.8, 0.35);
}
function e7OnKill(e){
  const x = e.g.position.x, z = e.g.position.z, y = 0.8 * (e.scale || 1);
  if (lvl('meterKill')) wisp7(x, y, z, lvl('meterKill') > 1 ? 0xb06aff : 0x6ab8ff);
  if (lvl('feast')) drumstick7(x, y, z);
  if (lvl('stonks') && stonks < 60) streak7(hero.position.x + 0.45, hero.position.y + 2.4, hero.position.z, 0.5, 1, 0, 0.6, 0x4aff6a, 0.3, 0.06, 3);
  if (lvl('plague') && e.poisonS > 0){ burst7(PN7, x, 0.6, z, 16, [0x7dff5a, 0x4ac83a, 0xa8ff7a], 2.2, 0.35, 0.9, -0.5, 1.5, 2.2, SH7.dot, 0); gring(x, 0.1, z, 0x7dff5a, 0.3, 2.4, 0.5); }
}
function wisp7(x, y, z, col){
  if (E7.wisps > 14) return; E7.wisps++; const a = rnd() * TAU;
  ob7({ x, y, z, vx: Math.cos(a) * 4, vy: 3 + rnd() * 2, vz: Math.sin(a) * 4, col,
    upd(o, dt){ const hx = hero.position.x, hy = hero.position.y + 1.1, hz = hero.position.z, dx = hx - o.x, dy = hy - o.y, dz = hz - o.z, d = Math.max(0.01, Math.hypot(dx, dy, dz)), pull = 18 + o.t * 50;
      o.vx += dx / d * pull * dt; o.vy += dy / d * pull * dt; o.vz += dz / d * pull * dt; const dr = Math.exp(-dt * 3); o.vx *= dr; o.vy *= dr; o.vz *= dr;
      o.x += o.vx * dt; o.y += o.vy * dt; o.z += o.vz * dt;
      pa(o.x, o.y, o.z, 0, 0, 0, o.col, 0.24, 0.25, 0, 0, 0, SH7.dot); pa(o.x, o.y, o.z, (rnd() - 0.5), (rnd() - 0.5), (rnd() - 0.5), 0xffffff, 0.08, 0.3, 0, 0, 0, SH7.star);
      if (d < 0.45 || o.t > 2){ gring(hx, hy - 1, hz, o.col, 0.3, 1.1, 0.25); burst7(PA7, hx, hy, hz, 6, o.col, 3, 0.12, 0.3, 0, 2, 0, SH7.star); return true; } return false; },
    end(){ E7.wisps--; } });
}
function drumstick7(x, y, z){
  if (E7.drums > 3) return; E7.drums++; const g = drumProto7.clone(); scene.add(g); g.scale.setScalar(1.8);
  ob7({ m: g, upd(o, dt){ const k = Math.min(1, o.t / 0.5), hx = hero.position.x, hz = hero.position.z, hy = hero.position.y + 1.3;
      g.position.set(lerp(x, hx, k), lerp(y, hy, k) + Math.sin(k * Math.PI) * 1.4, lerp(z, hz, k)); g.rotation.z += dt * 14; g.rotation.y += dt * 6;
      if (rnd() < 0.5) pa(g.position.x, g.position.y, g.position.z, 0, 0.5, 0, 0xffb060, 0.1, 0.3, 0, 0, 0, SH7.dot);
      if (k >= 1){ burst7(PA7, hx, hy, hz, 8, [0xff5a6a, 0xffb060], 3, 0.18, 0.5, -1, 1, 0, SH7.heart); if (rnd() < 0.3) shout7('¡Ñam!', '#ffb060', hx, hy + 1.3, hz); return true; } return false; },
    end(){ E7.drums--; } });
}
function parcel7(att){
  if (!att) return; const g = parcelProto7.clone(); scene.add(g); const sx = hero.position.x, sz = hero.position.z, x = att.g.position.x, z = att.g.position.z;
  ob7({ m: g, upd(o, dt){ const k = Math.min(1, o.t / 0.16); g.position.set(lerp(sx, x, k), 1.1 + Math.sin(k * Math.PI) * 0.8, lerp(sz, z, k)); g.rotation.x += dt * 20; g.rotation.y += dt * 13; g.scale.setScalar(1.4);
      if (k >= 1){ burst7(PN7, x, 1, z, 14, [0xc8925a, 0xe8d8a0, 0x8a5a2a], 5, 0.16, 0.7, 12, 0, 1, SH7.sq, 3); burst7(PA7, x, 1, z, 12, [0xffd060, 0xffffff], 6, 0.18, 0.3, 0, 2, 0, SH7.star); gring(x, 0.1, z, 0xe0a860, 0.3, 2.2, 0.35); return true; } return false; } });
}
function phoenix7(){
  const hx = hero.position.x, hz = hero.position.z, g = new THREE.Group(); const m1 = addMat7(0xff6a10, 1), m2 = addMat7(0xffd040, 1); buildWings7(g, m1, m2); g.position.set(hx, 1.4, hz); scene.add(g);
  g.lookAt(camera.position.x, 1.4, camera.position.z); g.rotateY(Math.PI);
  shoutHero7('¡FÉNIX!', '#ffb060', 3.2);
  for (let i = 0; i < 4; i++) later(i * 0.12, () => gring(hx, 0.1, hz, i % 2 ? 0xffd040 : 0xff6a10, 0.4, 3 + i * 1.4, 0.5));
  ob7({ m: g, upd(o, dt){ const k = o.t / 1.8; g.scale.setScalar(0.5 + 3.2 * smooth(Math.min(1, o.t / 0.35))); g.position.y = 1.4 + k * 1.2;
      g.userData.w.forEach((w, i) => { w.rotation.y = (i ? 1 : -1) * (0.2 + 0.6 * Math.sin(o.t * 9)); }); m1.uniforms.uAlpha.value = m2.uniforms.uAlpha.value = Math.max(0, 1 - k);
      for (let n = 0; n < 6; n++){ const a = rnd() * TAU, r = rnd() * 1.2; pa(hx + Math.cos(a) * r, 0.2 + rnd() * 0.5, hz + Math.sin(a) * r, Math.cos(a), 6 + rnd() * 6, Math.sin(a), EL7.fire[n % 3], 0.3, 0.7, 0, 1, 0.2, SH7.dot); }
      return k >= 1; }, end(){ m1.dispose(); m2.dispose(); } });
}
function atField7(sx, sz){
  const hx = hero.position.x, hz = hero.position.z, a = angTo(hx, hz, sx, sz), x = hx + Math.sin(a) * 0.9, z = hz + Math.cos(a) * 0.9;
  for (let i = 0; i < 4; i++) later(i * 0.07, () => octRing7(x + Math.sin(a) * i * 0.25, 1.1, z + Math.cos(a) * i * 0.25, i % 2 ? 0xffb040 : 0xff8a1a, 0.4, 1.6 + i * 0.6, 0.5, a));
  ring7(PA7, x, 1.1, z, 18, [0xff9a2a, 0xffe070], 4, 0.15, 0.4, 0, 2, 0, SH7.dia); shoutHero7('¡CAMPO A.T.!', '#ff9a2a', 3);
}
function clock7(){
  const hx = hero.position.x, hz = hero.position.z, d = decal7(clockTex7, hx, 0.07, hz, 4.4, 0xbff6ff, 1.2, -1.5); decal7(clockTex7, hx, 0.09, hz, 2.2, 0x8fe8ff, 1.2, 2.5);
  const hg = new THREE.BoxGeometry(0.07, 0.02, 1.4); hg.translate(0, 0, 0.7); const hand = addMesh7(hg, addMat7(0xffffff, 0.9)); hand.position.set(hx, 0.09, hz);
  ob7({ m: hand, own: true, upd(o){ hand.rotation.y = -o.t * 9; hand.material.uniforms.uAlpha.value = Math.max(0, 1 - o.t / 1.2); return o.t > 1.2; }, end(){ hand.geometry.dispose(); } });
  for (let i = 0; i < 3; i++) later(i * 0.15, () => gring(hx, 1, hz, 0x8fe8ff, 0.3, 2.5 + i, 0.5, hero.rotation.y + i));
}
function waterCrest7(hx, hz, f){
  ob7({ upd(o){ const k = o.t / 0.38, R = 0.8 + 4 * k;
      for (let n = 0; n < 9; n++){ const u = rnd(), a = f + (u - 0.5) * 1.5, h = Math.sin(u * Math.PI) * 1.3 * (1 - k * 0.5);
        pn(hx + Math.sin(a) * R, 0.15 + h * rnd(), hz + Math.cos(a) * R, Math.sin(a) * 3, 1.5 + rnd(), Math.cos(a) * 3, rnd() < 0.6 ? 0x2a8aff : 0x6ac8ff, 0.2, 0.45, 6, 0, 1, SH7.dot, 0.9);
        if (rnd() < 0.5) pa(hx + Math.sin(a) * (R + 0.2), 0.2 + h, hz + Math.cos(a) * (R + 0.2), Math.sin(a) * 2, 2, Math.cos(a) * 2, 0xffffff, 0.13, 0.4, 5, 0, 0.5, SH7.dot); }
      return k >= 1; } });
  for (let i = 0; i < 3; i++) later(i * 0.06, () => gring(hx + Math.sin(f) * (1.2 + i), 0.9, hz + Math.cos(f) * (1.2 + i), 0x4ab8ff, 0.3, 1.6, 0.3, f));
}
function crystals7(hx, hz, n, R){
  for (let i = 0; i < n; i++){ const a = rnd() * TAU, r = 1 + rnd() * (R - 1), x = hx + Math.cos(a) * r, z = hz + Math.sin(a) * r, m = new THREE.Mesh(shardProto7, MA7.crystal); scene.add(m);
    const s = 0.7 + rnd() * 0.8; m.position.set(x, -1, z); m.rotation.set((rnd() - 0.5) * 0.6, rnd() * 3, (rnd() - 0.5) * 0.6);
    ob7({ m, upd(o, dt){ const k = o.t - i * 0.03; if (k < 0) return false; m.position.y = k < 0.12 ? lerp(-1, 0.55 * s, k / 0.12) : 0.55 * s; m.scale.set(s, s * 2.4, s); m.rotation.y += dt * 2;
        if (k > 0.85){ burst7(PA7, x, 0.6 * s, z, 10, [0xdff8ff, 0x8ff6ff, 0xffffff], 5, 0.14, 0.5, 8, 0.5, 1, SH7.dia); return true; } return false; } }); }
}
function pillar7(x, z, col, col2, dur, r){
  const m = addMesh7(new THREE.CylinderGeometry(r, r * 1.2, 16, 16, 1, true), addMat7(col, 0)); m.position.set(x, 8, z);
  ob7({ m, own: true, upd(o){ const k = o.t / dur; m.material.uniforms.uAlpha.value = (k < 0.1 ? k / 0.1 : 1 - k) * (0.75 + 0.25 * Math.sin(o.t * 40)); m.scale.set(1 + k * 0.6, 1, 1 + k * 0.6); m.rotation.y += 0.1;
      for (let n = 0; n < 4; n++){ const a = rnd() * TAU; pa(x + Math.cos(a) * r, 0.2, z + Math.sin(a) * r, 0, 8 + rnd() * 6, 0, rnd() < 0.5 ? col : col2, 0.25, 0.6, 0, 0.5, 0.3, SH7.sq); }
      return k >= 1; }, end(){ m.geometry.dispose(); } });
}
function firePillar7(x, z){
  ob7({ upd(o){ for (let n = 0; n < 6; n++){ const a = rnd() * TAU, r = rnd() * 0.5; pa(x + Math.cos(a) * r, 0.2, z + Math.sin(a) * r, Math.cos(a) * 0.5, 5 + rnd() * 5, Math.sin(a) * 0.5, EL7.fire[n % 3], 0.32, 0.55, 0, 1, 0.2, SH7.dot); } return o.t > 0.35; } });
  gring(x, 0.1, z, 0xff6a10, 0.3, 2.6, 0.4);
}
function iceSpikes7(hx, hz, R){
  for (let i = 0; i < 10; i++){ const a = i / 10 * TAU, x = hx + Math.cos(a) * R, z = hz + Math.sin(a) * R, m = new THREE.Mesh(shardProto7, MA7.crystal); scene.add(m); m.rotation.set(Math.cos(a) * 0.4, 0, -Math.sin(a) * 0.4);
    ob7({ m, upd(o){ const k = o.t; m.position.set(x, k < 0.08 ? lerp(-0.8, 0.3, k / 0.08) : 0.3, z); m.scale.set(0.5, 1.6 * (k < 0.5 ? 1 : Math.max(0.01, 1 - (k - 0.5) * 4)), 0.5); return k > 0.75; } }); }
}

/* ---------- Ganchos ---------- */
const _hitEnemyE7 = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  const was = e.alive, jan = P6.janReady, toya = P6.toyaCd, sigOk = lvl('signature') && !e.isBoss;
  const ok = _hitEnemyE7(e, val, crit, nx, nz, knock, meterGain, melee, o);
  if (ok) try {
    e7OnHit(e, val, crit, melee, o, was);
    if (jan && !P6.janReady) janFist7(e);
    if (P6.toyaCd > toya + 0.2) swordAt7(e);
    if (sigOk && was && !e.alive && e.hp > 0) stamp7(e.g.position.x, 0.9, e.g.position.z);
  } catch (err) { console.error(err); }
  return ok;
};
const _killEnemyE7 = killEnemy;
killEnemy = function(e){ const was = e.alive; _killEnemyE7(e); if (was && !e.alive) try { e7OnKill(e); } catch (err) { console.error(err); } };
const _hurtPlayerE7 = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){
  const c = { hp: player.hp, at: P6.atReady, milk: P6.milk, csh: lvl('comboShield') && combo >= 30 && P5.cshCd <= 0, sw: P5.swUsed, gh: P5.ghostCd, ret: P5.retCd, fcd: P5.frostCd, ph: phoenixLeft, cul: P6.culCd, perf: perfectAt };
  const res = _hurtPlayerE7(dmg, sx, sz, knock);
  try { e7OnHurt(res, c, sx, sz); } catch (err) { console.error(err); }
  return res;
};
function e7OnHurt(res, c, sx, sz){
  const hx = hero.position.x, hy = hero.position.y, hz = hero.position.z;
  if (c.ph > phoenixLeft) phoenix7();
  if (res === 'hit'){
    if (lvl('armor')){ const a = angTo(hx, hz, sx, sz), x = hx + Math.sin(a) * 0.5, z = hz + Math.cos(a) * 0.5;
      burst7(PA7, x, hy + 1.1, z, 10 + 4 * lvl('armor'), [0xffc040, 0xffffff, 0xff8a2a], 6, 0.11, 0.35, 12, 0, 0.5, SH7.sq); pa(x, hy + 1.1, z, 0, 0, 0, 0xffffff, 1, 0.14, 0, 0, 1.4, SH7.star);
      shout7('¡CLANG!', '#dfe6f0', hx, hy + 2.6, hz); }
    if (lvl('thorns')){ const n = 10 + 6 * lvl('thorns'); for (let k = 0; k < n; k++){ const a = k / n * TAU; streak7(hx + Math.sin(a) * 0.5, hy + 1 + (rnd() - 0.5) * 0.6, hz + Math.cos(a) * 0.5, Math.sin(a), 0.05, Math.cos(a), 0.45, 0xb8ff6a, 0.3, 0.035, 9); }
      const att = nearestFrom(sx, sz, 3); if (att) burst7(PA7, att.g.position.x, 1, att.g.position.z, 10, [0x9aff6a, 0xfff6c8], 4, 0.12, 0.4, 6, 0, 1, SH7.dia); }
    if (lvl('frostArmor') && c.fcd <= 0 && P5.frostCd > 0){ burst7(PA7, sx, 0.9, sz, 22, EL7.ice, 5, 0.18, 0.6, 6, 1, 0.3, SH7.dia, 2); gring(sx, 0.1, sz, 0x9fe8ff, 0.3, 2.2, 0.4); gring(hx, 1, hz, 0xbff4ff, 0.3, 1.8, 0.3, angTo(hx, hz, sx, sz)); }
    if (lvl('glassCannon')){ burst7(PA7, hx, hy + 1.1, hz, 18, [0xdff8ff, 0x9ff6ff, 0xffffff], 5, 0.13, 0.6, 10, 0.5, 1, SH7.dia, 2); play('shatter'); }
    if (c.milk && !P6.milk && lvl('strawberry')){ burst7(PN7, hx, hy + 1.6, hz, 26, [0xff9ac8, 0xffd0e8, 0xffffff], 4.5, 0.14, 0.9, 12, 0.3, 1, SH7.dot, 3); shout7('¡MI LECHE!', '#ff9ac8', hx, hy + 2.9, hz); }
    if (c.csh && P5.cshCd > 0){ for (let i = 0; i < 3; i++) gring(hx, 1.1, hz, 0xffd84a, 0.4, 1.4 + i * 0.5, 0.35 + i * 0.08, hero.rotation.y + i * 1.05); burst7(PA7, hx, hy + 1.2, hz, 16, [0xffd84a, 0xffffff], 4, 0.16, 0.5, 0, 1, 0, SH7.star); }
    if (!c.sw && P5.swUsed){ E7.swT = 2; for (let i = 0; i < 4; i++) later(i * 0.1, () => gring(hero.position.x, 0.1 + i * 0.5, hero.position.z, 0x7affc8, 0.4, 2.6, 0.45)); }
  } else if (res === 'dodge'){
    if (c.at && !P6.atReady) atField7(sx, sz);
    if (c.gh <= 0 && P5.ghostCd > 0){ burst7(PA7, hx, hy + 1, hz, 20, [0xc8d8ff, 0xffffff], 3, 0.2, 0.7, -1, 1, 0.3, SH7.dot); gring(hx, 0.1, hz, 0xc8d8ff, 0.3, 2.2, 0.4); }
    if (c.ret <= 0 && P5.retCd > 0) parcel7(nearestFrom(sx, sz, 3.5));
    if (P6.culCd > c.cul + 1){ E7.wigQ = 1; ring7(PA7, hx, hy + 1, hz, 20, [0xff8ac8, 0xffe24a], 4, 0.22, 0.6, 0, 1, 0.3, SH7.heart); gring(hx, 0.1, hz, 0xff8ac8, 0.3, 3.2, 0.5); }
    if (perfectAt !== c.perf) clock7();
  }
}
const _onKillE7 = onKill;
onKill = function(e){ const burn = e.burnT > 0, x = e.g.position.x, z = e.g.position.z; _onKillE7(e); if (burn && (lvl('pyre') || setOn('fuego'))) later(0.12, () => firePillar7(x, z)); };
const _onRollStartE7 = onRollStart;
onRollStart = function(){ _onRollStartE7(); const hx = hero.position.x, hz = hero.position.z;
  if (up.fireRoll > 0){ gring(hx, 0.1, hz, 0xff7a2a, 0.3, 1.6, 0.3); }
  if (lvl('titan')){ burst7(PN7, hx, 0.6, hz, 10, 0xffffff, 2.5, 0.22, 0.5, 0, 1, 2.5, SH7.dot, 0); }
  if (lvl('static')){ for (let k = 0; k < 6; k++){ const a = rnd() * TAU; streak7(hx + Math.cos(a) * 0.6, 0.6, hz + Math.sin(a) * 0.6, Math.cos(a), rnd() - 0.5, Math.sin(a), 0.8, 0xfff27a, 0.12, 0.035); } }
};
const _onLandingE7 = onLanding;
onLanding = function(){ const al = P6.alchCd; _onLandingE7(); const hx = hero.position.x, hz = hero.position.z;
  try {
    if (up.quake){ const R = 2.4 * (setOn('impacto') ? 1.4 : 1); crack7(hx, hz, 6 + up.quake, R * 0.8, setOn('impacto')); burst7(PN7, hx, 0.2, hz, 16 + 4 * up.quake, [0x8a7a6a, 0x6a5a4a, 0xb8a898], 6, 0.18, 0.9, 16, 0.3, 1, SH7.sq, 5); gring(hx, 0.1, hz, 0xffc070, 0.3, R + 0.6, 0.4); }
    if (lvl('glacial')) iceSpikes7(hx, hz, 2.1 * (setOn('impacto') ? 1.4 : 1));
    if (lvl('alchemy') && P6.alchCd > al + 0.5){ E7.clapT = 0.35; decal7(alchTex7, hx, 0.07, hz, 4.6, 0x6ab8ff, 0.9, 1.2);
      for (let k = 0; k < 4; k++){ const a = hero.rotation.y + k * Math.PI / 2; bolt(hx, 0.15, hz, hx + Math.sin(a) * 3.4, 0.15, hz + Math.cos(a) * 3.4, 0x6ab8ff, 0.06); }
      ring7(PA7, hx, 0.3, hz, 20, [0x6ab8ff, 0xffffff], 4, 0.15, 0.5, 0, 1, 0, SH7.star, 2); }
  } catch (err) { console.error(err); }
};
const _onSpecialE7 = onSpecial;
onSpecial = function(){ _onSpecialE7(); const hx = hero.position.x, hz = hero.position.z;
  try {
    if (lvl('bigSpecial')){ for (let i = 0; i < 3; i++) later(i * 0.12, () => { gring(hx, 0.1, hz, 0xffe070, 0.5, 6 + i * 1.5, 0.55); gring(hx, 1.2, hz, 0xffffff, 0.4, 4 + i, 0.45, i * 1.05); });
      pillar7(hx, hz, 0xffe070, 0xffffff, 0.9, 1.1); shoutHero7('¡ESPECIAL XL!', '#ffe070', 3.2); }
    if (lvl('bankai')){ pillar7(hx, hz, 0xff1a2a, 0xffffff, 1.4, 1.3); burst7(PN7, hx, 1, hz, 40, [0x0a0408, 0x3a0010], 6, 0.3, 1, -2, 1.5, 1.5, SH7.sq, 2); for (let i = 0; i < 3; i++) later(i * 0.1, () => gring(hx, 0.1, hz, 0xff1a2a, 0.5, 5 + i * 1.5, 0.5)); }
    if (lvl('diamond')) crystals7(hx, hz, 12, 5);
    if (lvl('thunder')) for (let i = 0; i < 3; i++) later(0.1 + i * 0.5, () => gring(hx, 6, hz, 0xfff27a, 1, 7, 0.6));
  } catch (err) { console.error(err); }
};
const _waterWaveE7 = waterWave;
waterWave = function(hx, hz, f, base){ const busy = P6.waterBusy; _waterWaveE7(hx, hz, f, base); if (!busy) try { waterCrest7(hx, hz, f); } catch (err) { console.error(err); } };
const _playCardE7 = playCard;
playCard = function(){ _playCardE7(); const hx = hero.position.x, hz = hero.position.z; decal7(starTex7, hx, 0.07, hz, 3.8, 0xff8ac8, 1.3, 1.5);
  for (let i = 0; i < 16; i++){ const a = rnd() * TAU; pa(hx + Math.cos(a) * 1.4, 2.6, hz + Math.sin(a) * 1.4, Math.cos(a) * 0.5, -0.6, Math.sin(a) * 0.5, rnd() < 0.5 ? 0xff9ac8 : 0xffffff, 0.2, 1.4, 0.4, 0.5, 0.6, SH7.heart); } };
const _dropCandyE7 = dropCandy;
dropCandy = function(x, z){ _dropCandyE7(x, z); burst7(PN7, x, 1.3, z, 24, [0xff6aa8, 0x6ad8ff, 0xffd84a, 0x8aff8a, 0xffffff], 5, 0.12, 1.4, 6, 1.2, 1, SH7.sq, 3); };
const _spawnEnemyE7 = spawnEnemy;
spawnEnemy = function(type, at){ const e = _spawnEnemyE7(type, at);
  if (e && !e.isBoss && P6.gadget === 'encoge' && lvl('pocket') && ACC7.torch && ACC7.torch.visible){ E7.torchT = 0.5; const x = e.g.position.x, z = e.g.position.z;
    later(0.05, () => { leftHand7(t7a); bolt(t7a.x, t7a.y, t7a.z, x, 0.7, z, 0xfff2a0, 0.08); burst7(PA7, x, 0.8, z, 12, [0xfff2a0, 0xffffff], 2.5, 0.14, 0.5, 0, 1, 0, SH7.star); }); }
  return e; };
const _updateTrailE7 = updateTrail;
updateTrail = function(){ _updateTrailE7();
  if (meta.cos && (meta.cos.effect === 'rainbow' || meta.cos.effect === 'rainbow2')) return;
  const cols = []; if (lvl('fireEdge')) cols.push(0xff8a2a); if (lvl('frost')) cols.push(0x9fe8ff); if (lvl('storm')) cols.push(0xfff27a); if (lvl('venomBlade') || lvl('poison')) cols.push(0x7dff5a);
  if (lvl('midas')) cols.push(0xffd23a); if (lvl('avatar')) cols.push(0xff6a10, 0x9fe8ff, 0xfff27a);
  if (P6.bankaiT > 0) trailMat.uniforms.uColor.value.setHex(0xff1a2a);
  else if (cols.length) trailMat.uniforms.uColor.value.setHex(cols[Math.floor(time * 6) % cols.length]);
  else if (wpOwned7() >= 2) trailMat.uniforms.uColor.value.setHex(wCol()); };
const _legendPoseE7 = legendPose;
legendPose = function(){ _legendPoseE7(); try { e7Pose(); } catch (err) { console.error(err); } };
function e7Pose(){
  if (gameState !== 'play') return;
  if (E7.wigT > 0 && state !== 'roll'){ const k = E7.wigT, w = Math.sin(k * 34), env = Math.min(1, k * 3);
    P.hips.rotation.y += w * 0.55 * env; P.hips.rotation.z += Math.sin(k * 17) * 0.2 * env; P.spine.rotation.y -= w * 0.45 * env; P.spine.rotation.x += 0.35 * env; }
  if (E7.kamPose > 0 && state === 'normal'){ const w = Math.min(1, E7.kamPose * 5);
    bl(P.armR.sh.rotation, 'x', -1.55, w); bl(P.armR.sh.rotation, 'y', 0, w); bl(P.armR.el.rotation, 'x', 0, w); bl(P.armL.sh.rotation, 'x', -0.3, w); bl(P.armL.sh.rotation, 'z', -2.1, w); bl(P.armL.el.rotation, 'x', -1.7, w); }
  if (E7.clapT > 0 && state === 'normal'){ const w = Math.min(1, E7.clapT * 6);
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -1.45, w); bl(A.sh.rotation, 'z', -0.42 * s, w); bl(A.el.rotation, 'x', -0.45, w); } }
}
const _chooseUpgradeE7 = chooseUpgrade;
chooseUpgrade = function(i){
  const u = gameState === 'upgrade' ? offer[i] : null; const hp0 = player.hp;
  _chooseUpgradeE7(i);
  if (!u || gameState !== 'play') return;
  try {
    powerPop7(u); const hx = hero.position.x, hz = hero.position.z, col = parseInt(((RAR[u.r] || ['', '#ffffff'])[1]).slice(1), 16) || 0xffffff;
    for (let k = 0; k < 3; k++) later(k * 0.1, () => gring(hero.position.x, 0.08, hero.position.z, col, 0.3, 2.2 + k * 0.8, 0.5));
    ob7({ upd(o){ for (let n = 0; n < 5; n++){ const a = rnd() * TAU, r = 0.5 + rnd() * 0.4; pa(hero.position.x + Math.cos(a) * r, 0.1, hero.position.z + Math.sin(a) * r, 0, 4 + rnd() * 4, 0, rnd() < 0.5 ? col : 0xffffff, 0.15, 0.6, 0, 0.5, 0.3, SH7.star); } return o.t > 0.6; } });
    if (u.minor){ const c2 = MINOR_COL7[u.id] || col; ob7({ upd(o){ for (let n = 0; n < 4; n++) pa(hero.position.x + (rnd() - 0.5) * 0.5, 0.1, hero.position.z + (rnd() - 0.5) * 0.5, 0, 6 + rnd() * 3, 0, c2, 0.2, 0.5, 0, 0, 0.4, SH7.plus); return o.t > 0.7; } }); }
    if (u.id === 'potion' || u.id === 'hp'){ ob7({ upd(o){ for (let n = 0; n < 3; n++) pa(hero.position.x + (rnd() - 0.5) * 0.6, hero.position.y + 3, hero.position.z + (rnd() - 0.5) * 0.6, 0, -3, 0, u.id === 'hp' ? 0xff4a6a : 0x7dff8a, 0.2, 0.6, 2, 0, 0.6, u.id === 'hp' ? SH7.heart : SH7.dot);
        if (o.t > 0.5 && rnd() < 0.5) pa(hero.position.x + (rnd() - 0.5), 0.3, hero.position.z + (rnd() - 0.5), 0, 2, 0, 0xffffff, 0.12, 0.6, 0, 0, 0.5, SH7.plus); return o.t > 1; } }); }
    if (u.id === 'phoenix') for (let i = 0; i < 3; i++) later(i * 0.1, () => gring(hero.position.x, 1, hero.position.z, 0xff6a10, 0.4, 3, 0.4, i));
  } catch (err) { console.error(err); }
};
const _clearWorldE7 = clearWorld;
clearWorld = function(){ _clearWorldE7(); clearObjs7(); clearPts7(PA7); clearPts7(PN7); for (const m of GR7) m.visible = false; for (const m of OCT7) m.visible = false; for (const m of SK7) m.visible = false; for (const m of CR7) m.visible = false;
  E7.wigT = E7.kamPose = E7.clapT = E7.swT = E7.btT = 0; E7.anchors = null; wires7.forEach(w => { w.visible = false; }); bars7.classList.remove('on'); gpsBeam7.visible = false; ret7.visible = false; laser7.visible = false; sigRings7.forEach(r => { r.visible = false; }); };

/* ---------- Bucle principal ---------- */
function e7Update(dt, pdt, playing){
  renderer.getDrawingBufferSize(_v2e7); const sc = _v2e7.y * camera.projectionMatrix.elements[5] * 0.5; PA7.mat.uniforms.uScale.value = sc; PN7.mat.uniforms.uScale.value = sc;
  if (pdt > 0){ updPts7(PA7, pdt); updPts7(PN7, pdt); }
  updRings7(pdt); updStreaks7(pdt); updObjs7(pdt); updCracks7(pdt); updPop7(dt);
  const live = gameState !== 'title' && gameState !== 'over' && !invActive && !player.dead;
  e7Acc(pdt, live); e7Arms(pdt, live); e7Aura(pdt, live);
  if (!live || !playing){ ret7.visible = ret7.visible && live; laser7.visible = laser7.visible && live; gpsBeam7.visible = gpsBeam7.visible && live; if (!live){ avat7.forEach(m => { m.visible = false; }); sigRings7.forEach(r => { r.visible = false; }); wires7.forEach(w => { w.visible = false; }); E7.anchors = null; } bars7.classList.remove('on'); }
  if (!playing || !live || pdt <= 0) return;
  e7Emit(pdt); e7Detect(pdt);
}
const _v3UpdateE7 = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateE7(dt, pdt, playing); try { e7Update(dt, pdt, playing); } catch (err) { console.error(err); } };

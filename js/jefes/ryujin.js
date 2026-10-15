'use strict';
/* ---------- Ryūjin, el dragón de jade ---------- */
const DRG_N = 20, DRG_SP = 0.66;
const dScaleTex = texAsset('jefes/ryujin-escamas');
const coneGeo = (() => { const pos = [0, 0, 0], idx = [], half = 0.42, n = 10;
  for (let i = 0; i <= n; i++){ const a = -half + (i / n) * half * 2; pos.push(Math.sin(a), 0, Math.cos(a)); }
  for (let i = 1; i <= n; i++) idx.push(0, i, i + 1);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(pos.length).fill(0).map((_, i) => i % 3 === 1 ? 1 : 0), 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((pos.length / 3) * 2).fill(0), 2)); g.setIndex(idx); return g; })();
const fballs = [];
const dMane = makeMat(0xff4a2a, { emissive: 0.35 });
function makeDragon(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0xffffff], [0xf0dca0], [0xe0b040], [0xff4030, 1], [0xf6f0e0], [0x1a4a44]]);
  S[0].m.uniforms.uMap.value = dScaleTex; S[0].m.uniforms.uHasMap.value = 1;
  const parts = [], segs = [];
  for (let i = 0; i < DRG_N; i++){
    const k = i / (DRG_N - 1), r = lerp(0.62, 0.15, Math.pow(k, 1.1));
    const sg = new THREE.Group(); scene.add(sg); parts.push(sg); segs.push(sg);
    const body = mesh(new THREE.CylinderGeometry(r, r * 0.92, DRG_SP * 1.3, 7), S[0].m, 0, 0, 0, sg); body.rotation.x = Math.PI / 2;
    mesh(B(r * 1.15, r * 0.45, DRG_SP * 1.1), S[1].m, 0, -r * 0.62, 0, sg);
    if (i % 2 === 0){ const sp = mesh(new THREE.ConeGeometry(r * 0.35, r * 1.2, 4), S[2].m, 0, r * 1.05, -0.05, sg); sp.rotation.x = -0.55; }
    if (i === 3 || i === 11){ sg.userData.legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(r * 0.95 * s, -r * 0.3, 0); sg.add(L);
      mesh(B(0.14, 0.5, 0.14), S[0].m, 0, -0.25, 0.05, L); const cl = mesh(new THREE.ConeGeometry(0.1, 0.26, 4), S[2].m, 0, -0.55, 0.15, L); cl.rotation.x = 1.2; return L; }); }
    if (i === DRG_N - 1){ for (const s of [-1, 1]){ const fin = mesh(new THREE.ConeGeometry(0.3, 1.0, 4), S[2].m, 0.12 * s, 0.05, -0.55, sg); fin.rotation.set(-1.7, 0, 0.5 * s); fin.scale.z = 0.35; } }
    if (i > 0 && i % 3 === 0 && i < 15){ const m2 = mesh(new THREE.ConeGeometry(r * 0.28, r * 1.4, 4), dMane, 0, r * 0.95, 0.2, sg); m2.rotation.x = -0.9; }
  }
  const head = new THREE.Group(); scene.add(head); parts.push(head);
  const hs = new THREE.Group(); hs.scale.setScalar(1.55); head.add(hs);
  const mane = makeMat(0xff4a2a, { emissive: 0.35 }), plain = makeMat(0x2f9a8a), white = S[4].m, gold = S[2].m;
  mesh(B(0.74, 0.52, 0.7), S[0].m, 0, 0.06, -0.02, hs);                               // cráneo
  mesh(B(0.5, 0.28, 0.95), plain, 0, 0.02, 0.78, hs);                                 // hocico largo
  mesh(B(0.56, 0.2, 0.22), gold, 0, 0.08, 1.3, hs);                                   // nariz dorada
  for (const s_ of [-1, 1]) mesh(B(0.08, 0.06, 0.04), S[5].m, 0.13 * s_, 0.12, 1.42, hs);   // orificios
  mesh(B(0.52, 0.08, 0.9), white, 0, -0.12, 0.8, hs);                                 // encía superior
  const jaw = new THREE.Group(); jaw.position.set(0, -0.16, 0.3); hs.add(jaw);
  mesh(B(0.46, 0.14, 1.0), S[1].m, 0, -0.08, 0.5, jaw);
  mesh(B(0.3, 0.06, 0.9), makeMat(0xb03040), 0, 0.0, 0.45, jaw);                     // lengua
  for (const s_ of [-1, 1]){
    for (let k = 0; k < 3; k++){ const t = mesh(new THREE.ConeGeometry(0.045, 0.16, 4), white, 0.19 * s_, 0.06, 0.25 + k * 0.28, jaw); }
    const f = mesh(new THREE.ConeGeometry(0.05, 0.22, 4), white, 0.2 * s_, -0.22, 1.12, hs); f.rotation.x = Math.PI;   // colmillos
    mesh(B(0.2, 0.13, 0.08), S[3].m, 0.3 * s_, 0.22, 0.34, hs);                        // ojos
    mesh(B(0.06, 0.1, 0.09), makeMat(0x200808), 0.3 * s_, 0.22, 0.36, hs);             // pupila
    const brow = mesh(B(0.26, 0.08, 0.28), gold, 0.3 * s_, 0.33, 0.3, hs); brow.rotation.z = 0.35 * s_;
    const hg = new THREE.Group(); hg.position.set(0.22 * s_, 0.32, -0.2); hs.add(hg);
    const h1 = mesh(new THREE.ConeGeometry(0.09, 1.1, 5), white, 0, 0.4, -0.25, hg); h1.rotation.set(-1.0, 0, -0.3 * s_);
    const h2 = mesh(new THREE.ConeGeometry(0.055, 0.45, 5), white, 0.12 * s_, 0.38, 0.02, hg); h2.rotation.set(-0.2, 0, -0.7 * s_);
    const wh = new THREE.Group(); wh.position.set(0.28 * s_, 0.0, 1.25); hs.add(wh); wh.userData.s = s_;
    mesh(C(0.03, 0.012, 1.6, 4), gold, 0, -0.8, 0, wh); wh.rotation.set(0.5, 0, 1.3 * s_);
    if (!head.userData.wh) head.userData.wh = []; head.userData.wh.push(wh);
    for (let k = 0; k < 3; k++){ const m = mesh(new THREE.ConeGeometry(0.08, 0.45, 4), mane, 0.4 * s_, 0.0 - k * 0.12, -0.05 - k * 0.12, hs); m.rotation.set(-1.6, 0, -1.1 * s_); }
  }
  for (let i = 0; i < 7; i++){ const a = (i / 6 - 0.5) * 2.4; const m = mesh(new THREE.ConeGeometry(0.11, 0.7, 4), mane, Math.sin(a) * 0.36, 0.18 + Math.cos(a) * 0.22, -0.42, hs); m.rotation.set(-2.0, 0, a * 0.45); }
  for (let i = 0; i < 3; i++){ const m = mesh(new THREE.ConeGeometry(0.07, 0.4, 4), white, (i - 1) * 0.12, -0.3, 0.7, jaw); m.rotation.x = Math.PI + 0.3; }
  const teleCone = mesh(coneGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5, side: THREE.DoubleSide }), 0, 0.05, 0); teleCone.visible = false; parts.push(teleCone);
  const teleLine = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); teleLine.visible = false; parts.push(teleLine);
  const rainC = Array.from({ length: 6 }, () => { const m = mesh(circleGeo, makeMat(0xff5a20, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); m.visible = false; parts.push(m); return m; });
  const e = newEnemy('dragon', g, head, S, { hp: 1250, r: 0.85, speed: 0, numY: 2.2, isBoss: true, heavy: true, bossName: 'Ryūjin, el dragón de jade',
    segs, head, jaw, parts, teleCone, teleLine, rainC, hist: [], vel: new V3(), pa: rnd() * TAU, state: 'enter', t: 0, contactCd: 0, breathTick: 0, reach: true, spawnT: 0, lastAtk: '' });
  return e;
}
function placeDragon(e, x, z){
  e.head.position.set(x, 2.6, z);
  const back = tmpv.set(x, 0, z).normalize();
  e.hist.length = 0; for (let j = 0; j < 90; j++) e.hist.push(new V3(x + back.x * j * 0.2, 2.6 + Math.sin(j * 0.3) * 0.4, z + back.z * j * 0.2));
  e.vel.set(-back.x * 4, 0, -back.z * 4);
  dragonBody(e);
}
function dragonBody(e){
  const hp = e.head.position, H = e.hist;
  if (!H.length || H[0].distanceTo(hp) > 0.06){ H.unshift(hp.clone()); if (H.length > 420) H.pop(); }
  let acc = 0, idx = 0, prev = hp;
  for (let i = 0; i < e.segs.length; i++){
    const need = (i + 1) * DRG_SP + 0.4;
    while (idx < H.length - 1){ const d = H[idx].distanceTo(H[idx + 1]); if (acc + d >= need) break; acc += d; idx++; }
    const sg = e.segs[i];
    if (idx >= H.length - 1) sg.position.copy(H[H.length - 1]);
    else { const d = H[idx].distanceTo(H[idx + 1]); sg.position.copy(H[idx]).lerp(H[idx + 1], d > 0 ? (need - acc) / d : 0); }
    sg.lookAt(prev); prev = sg.position;
    sg.visible = sg.position.distanceTo(camera.position) > 2.3;          // no tapar la cámara
    if (sg.userData.legs) sg.userData.legs.forEach((L, j) => { L.rotation.x = Math.sin(time * 7 + i + j * 3) * 0.6; });
  }
  e.head.visible = hp.distanceTo(camera.position) > 2.6;
  tmpv2.copy(hp).add(e.vel); if (!e.lockLook && e.vel.lengthSq() > 0.01) e.head.lookAt(tmpv2);
  for (const w of e.head.userData.wh) w.rotation.x = 0.5 + Math.sin(time * 4 + w.userData.s) * 0.25;
}
function dSteer(e, tx, ty, tz, speed, turn, dt){
  tmpv.set(tx - e.head.position.x, ty - e.head.position.y, tz - e.head.position.z);
  const d = tmpv.length(); if (d > 0.001) tmpv.multiplyScalar(speed / d);
  e.vel.lerp(tmpv, 1 - Math.exp(-dt * turn)); e.head.position.addScaledVector(e.vel, dt);
  return d;
}
function mouthPos(e, out){ out.set(0, -0.1, 1.4).applyMatrix4(e.head.matrixWorld); return out; }
function updDragon(e, dt){
  const H = e.head.position, px = hero.position.x, pz = hero.position.z;
  e.contactCd -= dt; e.teleCone.visible = false; e.teleLine.visible = false;
  let jaw = 0.1;
  const pick = () => {
    const opts = ['breath', 'dive', 'rain'].filter(o => o !== e.lastAtk), o = opts[Math.floor(rnd() * opts.length)]; e.lastAtk = o;
    if (o === 'breath'){ let a = rnd() * TAU, tries = 0; do { a = rnd() * TAU; } while (++tries < 10 && Math.hypot(Math.cos(a) * 5 - px, Math.sin(a) * 5 - pz) < 3.6);
      e.spot = [Math.cos(a) * 5, Math.sin(a) * 5]; e.state = 'toBreath'; e.t = 3; }
    else if (o === 'dive'){ const a = rnd() * TAU, dx_ = Math.sin(a), dz_ = Math.cos(a), b = px * dx_ + pz * dz_, c = px * px + pz * pz;
      const tt = b + Math.sqrt(Math.max(0, b * b - c + 7.5 * 7.5));                     // inicio del picado sobre el círculo de 7,5
      e.ddir = a; e.dstart = [px - dx_ * tt, pz - dz_ * tt]; e.state = 'toDive'; e.t = 3.5; }
    else { e.state = 'toRain'; e.t = 3; }
  };
  if (e.state === 'enter'){ dSteer(e, 0, 2.2, 0, 6.5, 2.6, dt); if (Math.hypot(H.x, H.z) < 5){ e.state = 'cruise'; e.t = 1.8; play('dragonRoar'); shake = Math.max(shake, 0.35); } }
  else if (e.state === 'cruise'){
    e.pa += dt * 0.55;
    dSteer(e, Math.cos(e.pa) * 4.6 + Math.sin(e.pa * 2.3) * 1.1, 1.5 + Math.sin(e.pa * 2.1) * 0.6, Math.sin(e.pa * 1.3) * 4.6, 5.5, 2.2, dt);
    if (e.t <= 0 && !player.dead) pick();
  } else if (e.state === 'toBreath'){
    const d = dSteer(e, e.spot[0], 1.7, e.spot[1], 7.5, 2.8, dt);
    if (d < 0.9 || e.t <= 0){ e.state = 'aim'; e.t = 0.95; e.bdir = angTo(H.x, H.z, px, pz); play('dragonRoar'); }
  } else if (e.state === 'aim'){
    e.vel.multiplyScalar(Math.exp(-dt * 5)); e.head.position.addScaledVector(e.vel, dt);
    if (e.t > 0.3) e.bdir = lerpAngle(e.bdir, angTo(H.x, H.z, px, pz), 1 - Math.exp(-dt * 6));
    tmpv2.set(H.x + Math.sin(e.bdir), H.y - 0.25, H.z + Math.cos(e.bdir)); e.head.lookAt(tmpv2);
    e.teleCone.visible = true; e.teleCone.position.set(H.x, 0.05, H.z); e.teleCone.rotation.y = e.bdir; e.teleCone.scale.setScalar(6.8);
    e.teleCone.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12));
    jaw = 0.3 + (0.95 - e.t) * 0.4;
    if (e.t <= 0){ e.state = 'breath'; e.t = 1.4; e.breathTick = 0; play('breath'); }
  } else if (e.state === 'breath'){
    e.vel.multiplyScalar(Math.exp(-dt * 5)); jaw = 0.75;
    tmpv2.set(H.x + Math.sin(e.bdir), H.y - 0.25, H.z + Math.cos(e.bdir)); e.head.lookAt(tmpv2);
    e.head.updateMatrixWorld(); mouthPos(e, tA);
    for (let i = 0; i < 5; i++){ const a = e.bdir + (rnd() - 0.5) * 0.7, sp = 6 + rnd() * 3;
      spawnFx(tA.x, tA.y, tA.z, Math.sin(a) * sp, -1 - rnd() * 1.5, Math.cos(a) * sp, rnd() < 0.3 ? 0xfff0a0 : rnd() < 0.6 ? 0xff9a30 : 0xff4a20, 0.14, 0.55, -1, 2.4); }
    lightFlash(tA.x, 1, tA.z, 0xff8a30, 1.4, 7);
    e.breathTick -= dt;
    if (e.breathTick <= 0){ e.breathTick = 0.22;
      const dx = px - H.x, dz = pz - H.z, d = Math.hypot(dx, dz), ang = Math.abs(((Math.atan2(dx, dz) - e.bdir + Math.PI) % TAU + TAU) % TAU - Math.PI);
      if (d < 6.8 && ang < 0.45 && hero.position.y < 1.4) hurtPlayer(9 * e.dm, H.x, H.z, 2.5); }
    if (e.t <= 0){ e.state = 'cruise'; e.t = 2.2 + rnd() * 1.2; }
  } else if (e.state === 'toDive'){
    const d = dSteer(e, e.dstart[0], 3.2, e.dstart[1], 9.5, 3, dt);
    if (d < 1.2 || e.t <= 0){ e.state = 'diveAim'; e.t = 0.9; play('dragonRoar'); }
  } else if (e.state === 'diveAim'){
    e.vel.multiplyScalar(Math.exp(-dt * 4)); e.head.position.addScaledVector(e.vel, dt);
    tmpv2.set(H.x + Math.sin(e.ddir), H.y - 0.3, H.z + Math.cos(e.ddir)); e.head.lookAt(tmpv2);
    e.teleLine.visible = true; e.teleLine.position.set(H.x, 0.05, H.z); e.teleLine.rotation.y = e.ddir; e.teleLine.scale.set(2.0, 1, 16);
    e.teleLine.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12));
    jaw = 0.4;
    if (e.t <= 0){ e.state = 'dive'; e.t = 1.3; e.hitOnce = false; play('charge'); }
  } else if (e.state === 'dive'){
    e.vel.set(Math.sin(e.ddir) * 13, (0.9 - H.y) * 5, Math.cos(e.ddir) * 13); e.head.position.addScaledVector(e.vel, dt); jaw = 0.5;
    if (rnd() < 0.6) puffAt(H.x, H.z, 1, 1.5);
    if (!e.hitOnce && Math.hypot(px - H.x, pz - H.z) < 1.4 && hero.position.y < 1.3){ const r = hurtPlayer(24 * e.dm, H.x, H.z, 9); if (r === 'hit') e.hitOnce = true; }
    if (e.t <= 0 || Math.hypot(H.x, H.z) > 8.5){ e.state = 'cruise'; e.t = 2 + rnd(); }
  } else if (e.state === 'toRain'){
    const d = dSteer(e, 0, 4.8, 0, 7, 2.5, dt);
    if (d < 1.2 || e.t <= 0){ e.state = 'rainAim'; e.t = 1.0; play('dragonRoar');
      e.rainC.forEach((c, i) => { const a = rnd() * TAU, r = i === 0 ? 0 : 1 + rnd() * 2.2;
        let x = px + Math.cos(a) * r, z = pz + Math.sin(a) * r; const rr = Math.hypot(x, z); if (rr > ARENA){ x *= ARENA / rr; z *= ARENA / rr; }
        c.position.set(x, 0.05, z); c.scale.setScalar(1.15); c.visible = true; c.userData.fired = false; }); }
  } else if (e.state === 'rainAim' || e.state === 'rain'){
    e.pa += dt * 1.2; dSteer(e, Math.cos(e.pa) * 1.2, 4.8, Math.sin(e.pa) * 1.2, 3, 2, dt); jaw = 0.55;
    e.rainC.forEach(c => { if (c.visible) c.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12)); });
    if (e.state === 'rainAim' && e.t <= 0){ e.state = 'rain'; e.t = 1.2; e.rainI = 0; e.rainNext = 0; }
    if (e.state === 'rain'){
      e.rainNext -= dt;
      if (e.rainNext <= 0 && e.rainI < e.rainC.length){ e.rainNext = 0.12; const c = e.rainC[e.rainI++];
        e.head.updateMatrixWorld(); mouthPos(e, tA);
        fballs.push({ m: mesh(orbGeo, fballMat, tA.x, tA.y, tA.z), from: tA.clone(), to: c.position.clone(), t: 0, dur: 0.55, circle: c, dm: e.dm });
        play('fireball'); }
      if (e.t <= 0){ e.state = 'cruise'; e.t = 2.2 + rnd(); }
    }
  }
  e.jaw.rotation.x = lerp(e.jaw.rotation.x, jaw, 1 - Math.exp(-dt * 12));
  e.lockLook = e.state === 'aim' || e.state === 'breath' || e.state === 'diveAim';
  dragonBody(e);
  if (e.contactCd <= 0 && e.state !== 'dive' && tmpv.set(px, hero.position.y + 1, pz).distanceTo(H) < 1.15){ e.contactCd = 0.9; hurtPlayer(14 * e.dm, H.x, H.z, 6); }
  // ancla de impacto: el tramo del cuerpo más cercano y al alcance del bastón
  let best = null, bd = 1e9;
  for (const o of [e.head, ...e.segs]){ if (o.position.y > 2.5) continue; const d = Math.hypot(o.position.x - px, o.position.z - pz); if (d < bd){ bd = d; best = o; } }
  if (best){ e.g.position.set(best.position.x, 0, best.position.z); e.numY = best.position.y + 0.9; e.reach = true; }
  else { e.g.position.set(H.x, 0, H.z); e.numY = H.y + 1; e.reach = false; }
}
const fballMat = makeMat(0xff7a2a, { emissive: 1 });
function updateFballs(dt){
  for (let i = fballs.length - 1; i >= 0; i--){
    const f = fballs[i]; f.t += dt; const k = Math.min(1, f.t / f.dur);
    f.m.position.lerpVectors(f.from, f.to, k); f.m.position.y += Math.sin(k * Math.PI) * 1.5; f.m.scale.setScalar(1.6); f.m.rotation.y += dt * 10;
    if (rnd() < 0.7) spawnFx(f.m.position.x, f.m.position.y, f.m.position.z, 0, 0.5, 0, rnd() < 0.5 ? 0xff9a30 : 0xffe070, 0.1, 0.35, -1, 1);
    if (k >= 1){
      const x = f.to.x, z = f.to.z; f.circle.visible = false;
      ringFx(x, z, 0xff7a2a, 0.2, 1.5, 0.3); sparks(x, 0.3, z, 8, 0xffc060, 4); lightFlash(x, 1, z, 0xff8a30, 1.3, 5); play('boom');
      for (let j = 0; j < 8; j++){ const a = rnd() * TAU; spawnFx(x, 0.3, z, Math.cos(a) * 2, 1.5 + rnd() * 2, Math.sin(a) * 2, 0xff6a20, 0.12, 0.5, -1, 1.5); }
      if (Math.hypot(hero.position.x - x, hero.position.z - z) < 1.3 && hero.position.y < 1) hurtPlayer(14 * f.dm, x, z, 5);
      scene.remove(f.m); fballs.splice(i, 1);
    }
  }
}
function dragonDying(e, dt){
  e.dying -= dt; applyFlash(e);
  const all = [...e.segs].reverse().concat([e.head]), k = 1 - Math.max(0, e.dying) / 2.2, n = Math.floor(k * (all.length + 1));
  e.parts.forEach(p => { if (p === e.teleCone || p === e.teleLine || e.rainC.includes(p)) p.visible = false; });
  for (let i = 0; i < Math.min(n, all.length); i++){
    const o = all[i]; if (!o.visible) continue; o.visible = false;
    const x = o.position.x, y = o.position.y, z = o.position.z;
    ringFx(x, z, 0x7fe8c8, 0.2, 1.4, 0.3, Math.max(0.05, y - 0.5));
    for (let j = 0; j < 8; j++){ const a = rnd() * TAU; spawnFx(x, y, z, Math.cos(a) * 3, 2 + rnd() * 2, Math.sin(a) * 3, rnd() < 0.5 ? 0x7fe8c8 : 0xffe070, 0.12, 0.6, 8, 0.5); }
    lightFlash(x, y, z, 0x9fffe0, 1.2, 5); if (i % 3 === 0) play('boom');
  }
  if (e.dying <= 0){ e.parts.forEach(p => scene.remove(p)); scene.remove(e.g); e.remove = true; }
}

applyBiome(0);

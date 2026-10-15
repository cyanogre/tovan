'use strict';
/* ---------- Playa: Cangrejo (realista) ---------- */
function makeCrab(){
  const g = new THREE.Group(); scene.add(g);
  const shell = new THREE.MeshStandardMaterial({ color: 0xd8542a, roughness: 0.45, metalness: 0.05 }), dark = new THREE.MeshStandardMaterial({ color: 0x8a2a14, roughness: 0.5 }), eye = new THREE.MeshStandardMaterial({ color: 0x101010, roughness: 0.15 });
  if (renderEnv){ shell.envMap = renderEnv; shell.envMapIntensity = 0.5; }
  const body = new THREE.Group(); body.position.y = 0.42; g.add(body);
  const add = (geo, mat, x, y, z, p = body) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
  const sh = add(new THREE.SphereGeometry(0.5, 24, 14), shell, 0, 0, 0); sh.scale.set(1.15, 0.42, 0.85);
  for (let i = 0; i < 5; i++){ const s = add(new THREE.SphereGeometry(0.06, 8, 6), dark, -0.3 + i * 0.15, 0.17, 0.3 - Math.abs(i - 2) * 0.05); s.scale.y = 0.5; }
  const eyes = [-1, 1].map(s => { const st = add(new THREE.CylinderGeometry(0.025, 0.03, 0.22, 6), shell, 0.12 * s, 0.25, 0.32); add(new THREE.SphereGeometry(0.05, 10, 8), eye, 0.12 * s, 0.38, 0.32); return st; });
  const legs = []; for (const s of [-1, 1]) for (let i = 0; i < 3; i++){ const L = new THREE.Group(); L.position.set(0.48 * s, -0.02, 0.2 - i * 0.22); body.add(L);
    const u = add(new THREE.CylinderGeometry(0.035, 0.03, 0.42, 6), shell, 0.18 * s, 0.1, 0, L); u.rotation.z = -1.0 * s;
    const lo = add(new THREE.CylinderGeometry(0.03, 0.012, 0.48, 6), shell, 0.42 * s, -0.12, 0, L); lo.rotation.z = 0.6 * s; L.userData = { s, i }; legs.push(L); }
  const claws = [-1, 1].map(s => { const C_ = new THREE.Group(); C_.position.set(0.42 * s, 0.05, 0.42); body.add(C_);
    const arm = add(new THREE.CylinderGeometry(0.05, 0.06, 0.36, 8), shell, 0.08 * s, 0, 0.12, C_); arm.rotation.x = Math.PI / 2; arm.rotation.z = 0.4 * s;
    const pal = add(new THREE.SphereGeometry(0.17, 14, 10), shell, 0.12 * s, 0.02, 0.36, C_); pal.scale.set(0.8, 0.65, 1.25);
    const fA = add(new THREE.ConeGeometry(0.06, 0.24, 8), dark, 0.1 * s, 0.07, 0.56, C_); fA.rotation.x = Math.PI / 2;
    const fB = new THREE.Group(); fB.position.set(0.14 * s, -0.04, 0.46); C_.add(fB); const fb = add(new THREE.ConeGeometry(0.05, 0.22, 8), dark, 0, 0, 0.1, fB); fb.rotation.x = Math.PI / 2;
    C_.userData.fB = fB; return C_; });
  const tele = mesh(coneGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5, side: THREE.DoubleSide }), 0, 0.05, 0); tele.visible = false;
  return newEnemy('crab', g, body, [stdE(shell, 0xd8542a), stdE(dark, 0x8a2a14)], { hp: 95, r: 0.62, speed: 2.0, numY: 1.4, legs, claws, eyes, tele, upd: updCrab });
}
function updCrab(e, dt, dist, toP, face, move){
  e.tele.visible = false; const walking = e.state === 'chase';
  e.legs.forEach(L => { const u = L.userData; L.rotation.x = walking ? Math.sin(time * 16 + u.i * 2 + (u.s > 0 ? 0 : Math.PI)) * 0.35 : 0; });
  e.eyes.forEach((s, i) => { s.rotation.z = Math.sin(time * 3 + i) * 0.15; });
  if (e.state === 'hurt'){ e.body.rotation.z = Math.sin(time * 30) * 0.1; if (e.t <= 0){ e.state = 'chase'; e.body.rotation.z = 0; } return; }
  if (e.state === 'chase'){ face(toP, 6); if (!player.dead){ if (dist > 2.2) move(toP, e.speed * 0.6); move(toP + e.side * Math.PI / 2, e.speed); }
    if (rnd() < dt * 0.6) e.side *= -1;
    e.claws.forEach(C_ => { C_.userData.fB.rotation.y = Math.max(0, Math.sin(time * 5 + e.seed)) * 0.4 * Math.sign(C_.position.x); });
    if (!player.dead && e.cd <= 0 && dist < 2.6){ e.state = 'windup'; e.t = 0.6; e.dir = toP; play('bruteWarn'); } }
  else if (e.state === 'windup'){ face(e.dir, 12); e.claws.forEach(C_ => { C_.rotation.x = lerp(C_.rotation.x, -0.8, 1 - Math.exp(-dt * 10)); C_.userData.fB.rotation.y = 0.6 * Math.sign(C_.position.x); });
    e.tele.visible = true; e.tele.position.set(e.g.position.x, 0.05, e.g.position.z); e.tele.rotation.y = e.dir; e.tele.scale.setScalar(2.6); pulse(e.tele);
    if (e.t <= 0){ e.state = 'snap'; e.t = 0.25; play('chanclazo'); e.claws.forEach(C_ => { C_.rotation.x = 0.3; C_.userData.fB.rotation.y = 0; });
      const ex = hero.position.x - e.g.position.x, ez = hero.position.z - e.g.position.z, d = Math.hypot(ex, ez), ang = Math.abs(((Math.atan2(ex, ez) - e.dir + Math.PI) % TAU + TAU) % TAU - Math.PI);
      if (d < 2.7 && ang < 0.5 && hero.position.y < 0.9) hurtPlayer(14 * e.dm, e.g.position.x, e.g.position.z, 6); } }
  else if (e.state === 'snap'){ if (e.t <= 0){ e.state = 'recover'; e.t = 0.6; } }
  else if (e.state === 'recover'){ e.claws.forEach(C_ => { C_.rotation.x = lerp(C_.rotation.x, 0, 1 - Math.exp(-dt * 5)); }); if (e.t <= 0){ e.state = 'chase'; e.cd = 1.4 + rnd(); } }
}

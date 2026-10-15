'use strict';
/* ======================================================================
   EXPANSIÓN: enemigos nuevos y jefes
   ====================================================================== */
const UPV = new V3(0, 1, 0), unitCyl = new THREE.CylinderGeometry(1, 1, 1, 6);
function boneBetween(m, a, b, r){ tmpv.subVectors(b, a); const L = Math.max(0.01, tmpv.length()); m.position.copy(a).addScaledVector(tmpv, 0.5); m.quaternion.setFromUnitVectors(UPV, tmpv.normalize()); m.scale.set(r, L, r); }
const stdE = (m, c) => ({ m, c, base: c, em: 0, std: true });
const redTele = () => makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 });
const clampArena = (v, r = ARENA - 0.5) => { const d = Math.hypot(v.x, v.z); if (d > r){ v.x *= r / d; v.z *= r / d; } return v; };

/* ---------- Capítulo 4: enemigos «realistas» ---------- */
function makeOrb(){
  const g = new THREE.Group(); scene.add(g);
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.07 }); if (renderEnv) mat.envMap = renderEnv;
  const body = new THREE.Group(); body.position.y = 0.45; g.add(body);
  const sph = new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 24), mat); sph.castShadow = true; body.add(sph);
  return newEnemy('orb', g, body, [stdE(mat, 0xffffff)], { hp: 70, r: 0.45, speed: 2.9, numY: 1.3, sph, upd: updOrb });
}
function updOrb(e, dt, dist, toP, face, move){
  const s = e.mats[0];
  if (e.state === 'hurt'){ if (e.t <= 0) e.state = 'chase'; return; }
  if (e.state === 'chase'){ s.glow = 0; face(toP, 10); if (!player.dead && dist > 0.9){ move(toP, e.speed); e.sph.rotation.x += e.speed * dt / 0.45; }
    if (!player.dead && dist < 1.9 && e.cd <= 0){ e.state = 'windup'; e.t = 0.5; play('impWarn'); } }
  else if (e.state === 'windup'){ face(toP, 12); e.body.position.x = (rnd() - 0.5) * 0.06; s.glow = Math.sin(time * 40) > 0 ? 0x801010 : 0;
    if (e.t <= 0){ e.state = 'lunge'; e.t = 0.28; e.dir = toP; e.hitOnce = false; e.body.position.x = 0; s.glow = 0; } }
  else if (e.state === 'lunge'){ move(e.dir, 8.5); e.sph.rotation.x += 8.5 * dt / 0.45;
    if (!e.hitOnce && dist < e.r + 0.5 && hero.position.y < 0.9){ if (hurtPlayer(11 * e.dm, e.g.position.x, e.g.position.z, 4) !== 'dodge') e.hitOnce = true; }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.6; } }
  else if (e.state === 'recover'){ if (e.t <= 0){ e.state = 'chase'; e.cd = 1 + rnd() * 0.6; } }
}
function makeGlass(){
  const g = new THREE.Group(); scene.add(g);
  const mat = new THREE.MeshPhysicalMaterial({ color: 0xd8f0ff, roughness: 0.03, metalness: 0, transparent: true, opacity: 0.38, clearcoat: 1 }); if (renderEnv) mat.envMap = renderEnv;
  const body = new THREE.Group(); body.position.y = 0.55; g.add(body);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), mat); cube.castShadow = true; body.add(cube);
  body.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.1, 1.1, 1.1)), new THREE.LineBasicMaterial({ color: 0xffffff })));
  const tele = mesh(circleGeo, redTele(), 0, 0.05, 0); tele.visible = false;
  return newEnemy('glass', g, body, [stdE(mat, 0xd8f0ff)], { hp: 160, r: 0.65, speed: 1.5, numY: 1.9, heavy: true, tele, upd: updGlass });
}
function updGlass(e, dt, dist, toP, face, move){
  e.tele.visible = false;
  if (e.state === 'hurt'){ if (e.t <= 0) e.state = 'chase'; return; }
  if (e.state === 'chase'){ face(toP, 4); e.body.rotation.y += dt * 0.6; e.body.position.y = 0.55;
    if (!player.dead && dist > 1.4) move(toP, e.speed);
    if (!player.dead && dist < 3.4 && e.cd <= 0){ e.state = 'rise'; e.t = 0.75; e.spot = new V3(hero.position.x, 0, hero.position.z); play('sentCharge'); } }
  else if (e.state === 'rise'){ e.body.position.y = lerp(e.body.position.y, 2.2, 1 - Math.exp(-dt * 6)); e.body.rotation.y += dt * 8;
    if (e.t > 0.3) e.spot.set(hero.position.x, 0, hero.position.z);
    e.tele.visible = true; e.tele.position.set(e.spot.x, 0.05, e.spot.z); e.tele.scale.setScalar(1.4); e.tele.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12));
    if (e.t <= 0){ e.state = 'fall'; e.t = 0.16; } }
  else if (e.state === 'fall'){ e.g.position.lerp(e.spot, 1 - Math.exp(-dt * 25)); e.body.position.y = lerp(e.body.position.y, 0.55, 1 - Math.exp(-dt * 30));
    if (e.t <= 0){ ringFx(e.spot.x, e.spot.z, 0xbfe8ff, 0.2, 1.8, 0.3); sparks(e.spot.x, 0.3, e.spot.z, 10, 0xdff6ff, 4); shake = Math.max(shake, 0.2); play('shatter');
      if (Math.hypot(hero.position.x - e.spot.x, hero.position.z - e.spot.z) < 1.6 && hero.position.y < 0.8) hurtPlayer(16 * e.dm, e.spot.x, e.spot.z, 6);
      e.state = 'recover'; e.t = 1.0; } }
  else if (e.state === 'recover'){ if (e.t <= 0){ e.state = 'chase'; e.cd = 1.8 + rnd(); } }
}
function makeRedOni(){ const e = makeOni(); e.mats[0].c = e.mats[0].base = 0xc83a3a; e.mats[6].c = e.mats[6].base = 0x7a1818; return e; }

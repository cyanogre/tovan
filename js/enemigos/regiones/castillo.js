'use strict';
/* ---------- Castillo: Ninja de sombra ---------- */
const ninjaFace = texAsset('enemigos/ninja-cara');
const shurikenGeo = (() => { const s = new THREE.Shape(); for (let i = 0; i < 8; i++){ const a = i / 8 * TAU, r = i % 2 ? 0.08 : 0.24; if (i) s.lineTo(Math.cos(a) * r, Math.sin(a) * r); else s.moveTo(r, 0); } const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); return g; })();
const shurikenMat = makeMat(0xc8ccd8, { emissive: 0.5, side: THREE.DoubleSide });
function makeNinja(){
  const g = new THREE.Group(); scene.add(g);
  const face = texMat(ninjaFace); const S = [...matSet([[0x1e1e30], [0x2a2a40], [0xc8302a], [0x0e0e18]]), matEntry(face)]; S.push(sideMat(0xc8302a));
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.11 * s, 0.6, 0); body.add(L);
    sculpt(L, [[-0.58, 0.07, 0.1, 0.07], [-0.3, 0.09, 0.1, 0.09], [0.0, 0.11, 0.12, 0.11]], S[0].m, { n: 6 }); return L; });
  const torso = new THREE.Group(); torso.position.y = 0.62; body.add(torso);
  sculpt(torso, [[0.0, 0.16, 0.13, 0.12], [0.22, 0.21, 0.15, 0.14], [0.42, 0.24, 0.16, 0.15], [0.52, 0.1, 0.09, 0.09]], S[1].m, { n: 8, capB: 0.2 });
  const belt = mesh(new THREE.TorusGeometry(0.17, 0.03, 4, 10), S[2].m, 0, 0.05, 0, torso); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.8, 1);
  const head = new THREE.Group(); head.position.y = 0.62; torso.add(head);
  sculptHead(head, [[0.0, 0.11, 0.13, 0.11], [0.1, 0.15, 0.16, 0.15], [0.24, 0.16, 0.16, 0.16], [0.36, 0.13, 0.12, 0.13], [0.43, 0.05, 0.05, 0.05]], S[0].m, face, [-0.17, 0.17, 0.02, 0.4], { nz: 0.4 });
  const scarf = new THREE.Group(); scarf.position.set(0, 0.5, -0.12); torso.add(scarf); const sp = mesh(new THREE.PlaneGeometry(0.12, 0.7, 1, 4), S[5].m, 0, -0.32, 0, scarf); sp.rotation.x = 0.4;
  const knot = mesh(new THREE.TorusGeometry(0.15, 0.04, 4, 10), S[2].m, 0, 0.5, 0, torso); knot.rotation.x = Math.PI / 2;
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.24 * s, 0.42, 0); torso.add(A);
    sculpt(A, [[-0.4, 0.05, 0.055, 0.05], [-0.2, 0.06, 0.065, 0.06], [0.0, 0.065, 0.07, 0.065]], S[0].m, { n: 6 }); lump(A, 0.05, S[3].m, 0, -0.44, 0.02); return A; });
  const star = mesh(shurikenGeo, shurikenMat, 0, -0.5, 0.06, arms[1]); star.rotation.x = Math.PI / 2;
  return newEnemy('ninja', g, body, S, { hp: 75, r: 0.42, speed: 3.0, numY: 2.2, legs, arms, torso, head, scarf, star, upd: updNinja, hidden: false });
}
function ninjaPuff(x, z){ for (let i = 0; i < 16; i++){ const a = rnd() * TAU; spawnFx(x + Math.cos(a) * 0.3, 0.3 + rnd() * 1.6, z + Math.sin(a) * 0.3, Math.cos(a) * 1.5, 0.8, Math.sin(a) * 1.5, rnd() < 0.5 ? 0x2a2a3a : 0x5a5a6a, 0.22, 0.8, -0.5, 2); } play('dash'); }
function updNinja(e, dt, dist, toP, face, move){
  const walk = sp => { const a = sp ? Math.sin(time * sp) * 0.6 : 0; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; };
  e.scarf.rotation.x = 0.4 + Math.sin(time * 9 + e.seed) * 0.25; e.reach = !e.hidden;
  if (e.state === 'hurt'){ e.torso.rotation.x = -0.25; if (e.t <= 0){ e.state = 'chase'; e.torso.rotation.x = 0; } return; }
  if (e.state === 'chase'){ face(toP, 9); walk(0); e.torso.rotation.x = 0.25; e.arms.forEach((A, i) => { A.rotation.x = -0.5 + (i ? 0.3 : 0); });
    if (!player.dead && dist > 3.5) { move(toP, e.speed); walk(16); }
    if (!player.dead && e.cd <= 0){ e.state = 'throwW'; e.t = 0.45; e.star.visible = true; } }
  else if (e.state === 'throwW'){ face(toP, 12); e.arms[1].rotation.x = lerp(e.arms[1].rotation.x, -2.6, 1 - Math.exp(-dt * 12)); e.torso.rotation.y = -0.4;
    if (e.t <= 0){ e.torso.rotation.y = 0; e.arms[1].rotation.x = 0.4; for (const o of [-0.22, 0, 0.22]){ const m = shoot5(e, toP + o, 7.5, 9 * e.dm, shurikenGeo, shurikenMat, 1.05, 2.4); m.userData.spin = true; } play('sheath'); e.state = 'vanishW'; e.t = 0.35; } }
  else if (e.state === 'vanishW'){ if (e.t <= 0){ ninjaPuff(e.g.position.x, e.g.position.z); e.g.visible = false; e.hidden = true; e.state = 'hidden'; e.t = 0.9 + rnd() * 0.6; } }
  else if (e.state === 'hidden'){ if (e.t <= 0){ let v, tries = 0; do { const a = rnd() * TAU, r = 3 + rnd() * 1.5; v = clampArena(new V3(hero.position.x + Math.cos(a) * r, 0, hero.position.z + Math.sin(a) * r)); } while (++tries < 6 && Math.hypot(v.x, v.z) > ARENA - 0.8);
      e.g.position.set(v.x, 0, v.z); e.g.visible = true; e.hidden = false; ninjaPuff(v.x, v.z); e.state = 'chase'; e.cd = 0.8 + rnd() * 0.6; } }
}

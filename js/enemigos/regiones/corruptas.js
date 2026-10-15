'use strict';
/* ---------- Ruinas corruptas: Ventana emergente y Cursor ---------- */
const popupTex = texAsset('enemigos/ventana-emergente', { borde: true });
const arrowShape = (() => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(0, -0.9); s.lineTo(0.22, -0.68); s.lineTo(0.38, -1.02); s.lineTo(0.52, -0.96); s.lineTo(0.36, -0.62); s.lineTo(0.66, -0.62); s.lineTo(0, 0); return s; })();
const arrowGeo = (() => { const g = new THREE.ExtrudeGeometry(arrowShape, { depth: 0.1, bevelEnabled: false }); g.translate(-0.25, 0.5, -0.05); return g; })();
const cursorShotMat = makeMat(0xffffff, { emissive: 1 }), cursorShotGeo = (() => { const g = new THREE.ConeGeometry(0.1, 0.32, 3); g.rotateX(Math.PI / 2); return g; })();
function makePopup(){
  const g = new THREE.Group(); scene.add(g);
  const front = makeMat(0xffffff, { map: popupTex, emissive: 0.6 }), back = makeMat(0xa0a0a8);
  const S = [{ m: front, c: 0xffffff, base: 0xffffff, em: 0.6 }, ...matSet([[0xa0a0a8], [0x000080, 0.6]])];
  const body = new THREE.Group(); body.position.y = 1.6; g.add(body);
  mesh(B(1.44, 0.96, 0.08), S[1].m, 0, 0, -0.01, body); mesh(new THREE.PlaneGeometry(1.44, 0.96), front, 0, 0, 0.035, body);
  mesh(B(1.46, 0.06, 0.1), S[2].m, 0, 0.46, 0, body);
  return newEnemy('popup', g, body, S, { hp: 60, r: 0.55, speed: 1.6, numY: 2.4, fly: true, upd: updPopup, tpT: 3 + rnd() * 2 });
}
function updPopup(e, dt, dist, toP, face, move){
  e.body.position.y = 1.6 + Math.sin(time * 2 + e.seed) * 0.1; e.body.rotation.z = Math.sin(time * 1.3 + e.seed) * 0.06;
  face(toP, 5); e.tpT -= dt;
  if (e.state === 'hurt'){ e.body.position.x = (rnd() - 0.5) * 0.15; if (e.t <= 0){ e.state = 'chase'; e.body.position.x = 0; } return; }
  if (e.tpT <= 0 && e.state === 'chase'){ e.tpT = 3.5 + rnd() * 2; let v, tries = 0; do { const a = rnd() * TAU, r = 3 + rnd() * 2.5; v = clampArena(new V3(hero.position.x + Math.cos(a) * r, 0, hero.position.z + Math.sin(a) * r)); } while (++tries < 8 && Math.hypot(v.x - hero.position.x, v.z - hero.position.z) < 2.5);
    for (let i = 0; i < 10; i++) spawnFx(e.g.position.x, 1.6, e.g.position.z, (rnd() - 0.5) * 4, (rnd() - 0.5) * 3, (rnd() - 0.5) * 4, i % 2 ? 0xff2ae0 : 0x20ffe0, 0.1, 0.4, 0, 0);
    e.g.position.set(v.x, 0, v.z); play('glitch'); }
  if (e.state === 'chase'){ if (!player.dead && dist > 6) move(toP, e.speed); if (!player.dead && e.cd <= 0 && dist < 9){ e.state = 'windup'; e.t = 0.55; play('sentCharge'); } }
  else if (e.state === 'windup'){ e.body.scale.setScalar(1 + Math.sin(time * 40) * 0.06); if (e.t <= 0){ e.body.scale.setScalar(1);
      for (const o of [-0.25, 0, 0.25]){ const m = shoot5(e, toP + o, 5.5, 9 * e.dm, cursorShotGeo, cursorShotMat, 1.05, 2.8); m.rotation.y = toP + o; } play('shoot'); e.state = 'recover'; e.t = 0.5; } }
  else if (e.state === 'recover'){ if (e.t <= 0){ e.state = 'chase'; e.cd = 2 + rnd(); } }
}
function makeCursor(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0xffffff, 0.7], [0x101010]]);
  const body = new THREE.Group(); body.position.y = 3; g.add(body);
  const a = mesh(arrowGeo, S[0].m, 0, 0, 0, body); const o = mesh(arrowGeo, S[1].m, 0, 0, -0.03, body); o.scale.set(1.18, 1.12, 0.9); o.position.set(-0.03, 0.03, -0.03);
  body.rotation.z = 0.5; body.scale.setScalar(1.25);
  const tele = circTele();
  return newEnemy('cursor', g, body, S, { hp: 55, r: 0.5, speed: 2.8, numY: 4.0, fly: true, tele, upd: updCursor, reach: true });
}
function updCursor(e, dt, dist, toP, face, move){
  e.tele.visible = false; const B_ = e.body; B_.rotation.y = Math.sin(time * 2 + e.seed) * 0.3; e.reach = B_.position.y < 2.2 || e.state === 'chase';
  if (e.state === 'hurt'){ if (e.t <= 0) e.state = 'chase'; return; }
  if (e.state === 'chase'){ B_.position.y = lerp(B_.position.y, 3, 1 - Math.exp(-dt * 4)); if (!player.dead && dist > 0.6) move(toP, e.speed);
    if (!player.dead && e.cd <= 0 && dist < 3){ e.state = 'aim'; e.t = 0.75; e.spot = clampArena(new V3(hero.position.x, 0, hero.position.z)); e.clicks = 2; play('tick'); } }
  else if (e.state === 'aim'){ const a = angTo(e.g.position.x, e.g.position.z, e.spot.x, e.spot.z); if (Math.hypot(e.spot.x - e.g.position.x, e.spot.z - e.g.position.z) > 0.1) move(a, 6);
    showCirc(e.tele, e.spot.x, e.spot.z, 1.25); if (e.t <= 0){ e.state = 'click'; e.t = 0.14; } }
  else if (e.state === 'click'){ showCirc(e.tele, e.spot.x, e.spot.z, 1.25); B_.position.y = lerp(B_.position.y, 0.6, 1 - Math.exp(-dt * 30));
    if (e.t <= 0){ ringFx(e.spot.x, e.spot.z, 0xffffff, 0.3, 1.3, 0.25); play('clonk'); shake = Math.max(shake, 0.15); hurtAt(e.spot.x, e.spot.z, 1.25, 12 * e.dm, 5);
      tA.set(e.spot.x, 1.5, e.spot.z); spawnNumber(tA, 'clic', 'react', '#ffffff'); e.clicks--; e.state = e.clicks > 0 ? 'unclick' : 'recover'; e.t = e.clicks > 0 ? 0.22 : 0.9; } }
  else if (e.state === 'unclick'){ showCirc(e.tele, e.spot.x, e.spot.z, 1.25); B_.position.y = lerp(B_.position.y, 1.8, 1 - Math.exp(-dt * 20)); if (e.t <= 0){ e.state = 'click'; e.t = 0.12; } }
  else if (e.state === 'recover'){ B_.position.y = lerp(B_.position.y, 3, 1 - Math.exp(-dt * 3)); if (e.t <= 0){ e.state = 'chase'; e.cd = 1.6 + rnd(); } }
}

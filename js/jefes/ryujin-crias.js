'use strict';
/* ---------- Crías de dragón: Ryūjin ya no pelea solo ---------- */
const dlFire9 = makeMat(0xff7a2a, { emissive: 1 }), dlFireGeo9 = new THREE.IcosahedronGeometry(0.2, 1);
function makeDragonling(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0xd8402a, 0.18], [0xffc040, 0.35], [0xffe070, 1], [0x5a1a10], [0xff8a3a, 0.3]]);
  const body = new THREE.Group(); body.position.y = 1.9; g.add(body);
  const head = new THREE.Group(); body.add(head);
  const sk = mesh(new THREE.IcosahedronGeometry(0.25, 1), S[0].m, 0, 0, 0, head); sk.scale.set(0.95, 0.85, 1.15);
  mesh(B(0.22, 0.14, 0.32), S[0].m, 0, -0.05, 0.26, head);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.11, 0.12); head.add(jaw); mesh(B(0.19, 0.05, 0.3), S[4].m, 0, 0, 0.14, jaw);
  const wings = [];
  for (const s of [-1, 1]){ mesh(B(0.07, 0.05, 0.03), S[2].m, 0.1 * s, 0.07, 0.22, head);
    const h = mesh(new THREE.ConeGeometry(0.045, 0.26, 4), S[1].m, 0.1 * s, 0.2, -0.1, head); h.rotation.x = -0.9;
    const wi = new THREE.Group(); wi.position.set(0.16 * s, 0.05, -0.22); head.add(wi); const wm = mesh(wingGeo, S[4].m, 0, 0, 0, wi); wm.scale.set(0.9 * s, 1, 0.75); wings.push(wi); }
  const segs = [];
  for (let i = 0; i < 8; i++){ const r = 0.21 - i * 0.02, m = mesh(new THREE.IcosahedronGeometry(r, 1), i % 2 ? S[4].m : S[0].m, 0, -20, 0); m.scale.set(1, 0.9, 1.2);
    if (i < 6){ const sp = mesh(new THREE.ConeGeometry(0.035, 0.14, 4), S[1].m, 0, r * 0.9, 0, m); } segs.push(m); }
  const tele = lineTele();
  const e = newEnemy('dragonling', g, body, S, { hp: 150, r: 0.45, speed: 3.2, numY: 2.7, fly: true, head, jaw, wings, segs, tele, parts: [...segs, tele], trail: [],
    upd: updDragonling, flair: dlFlair, onDying: dlDying, orbitA: rnd() * TAU, dieT: 0.6 });
  return e;
}
function dlFlair(e, dt){
  const B_ = e.body; e.trail.unshift([e.g.position.x, B_.position.y, e.g.position.z]); if (e.trail.length > 60) e.trail.pop();
  e.segs.forEach((m, i) => { const p = e.trail[Math.min(e.trail.length - 1, (i + 1) * 3)]; m.position.set(p[0], p[1] + Math.sin(time * 8 - i * 0.7) * 0.06, p[2]); m.visible = e.g.visible; });
}
function dlDying(e, dt){
  e.dieT -= dt; const k = Math.max(0.01, e.dieT / 0.6); e.g.scale.setScalar(e.scale * k); applyFlash(e);
  e.segs.forEach((m, i) => { m.position.y = Math.max(0.1, m.position.y - dt * (3 + i)); m.scale.setScalar(k); });
  if (e.dieT <= 0){ scene.remove(e.g); e.parts.forEach(o => scene.remove(o)); e.remove = true; }
}
function updDragonling(e, dt, dist, toP, face, move){
  const B_ = e.body; e.tele.visible = false; const fl = Math.sin(time * 15 + e.seed);
  e.wings.forEach((w, i) => { w.rotation.z = (i ? 1 : -1) * (0.45 + fl * 0.55); });
  if (e.state === 'hurt'){ B_.rotation.x = -0.3; if (e.t <= 0) e.state = 'chase'; return; }
  B_.rotation.x = 0;
  if (e.state === 'chase'){ e.orbitA += dt * 1.15; const R = 4.3, tx = hero.position.x + Math.cos(e.orbitA) * R, tz = hero.position.z + Math.sin(e.orbitA) * R;
    const a = angTo(e.g.position.x, e.g.position.z, tx, tz), d = Math.hypot(tx - e.g.position.x, tz - e.g.position.z); if (d > 0.3) move(a, e.speed * Math.min(1, d)); face(a, 5);
    B_.position.y = lerp(B_.position.y, 1.9 + Math.sin(time * 2.5 + e.seed) * 0.35, 1 - Math.exp(-dt * 4)); e.jaw.rotation.x = 0;
    if (!player.dead && e.cd <= 0 && dist < 8.5){ if (rnd() < 0.5){ e.state = 'aim'; e.t = 0.8; e.dir = toP; play('sentCharge'); } else { e.state = 'spit'; e.t = 0.75; e.spat = false; } } }
  else if (e.state === 'aim'){ if (e.t > 0.25) e.dir = lerpAngle(e.dir, toP, 1 - Math.exp(-dt * 8)); face(e.dir, 14); B_.position.y = lerp(B_.position.y, 2.5, 1 - Math.exp(-dt * 6)); e.jaw.rotation.x = 0.5;
    showLine(e.tele, e.g.position.x, e.g.position.z, e.dir, 1.3, 7.5); if (e.t <= 0){ e.state = 'dive'; e.t = 0.6; e.hitOnce = false; play('dive'); } }
  else if (e.state === 'dive'){ move(e.dir, 12); face(e.dir, 20); B_.position.y = lerp(B_.position.y, 0.85, 1 - Math.exp(-dt * 12)); e.jaw.rotation.x = 0.6;
    if (rnd() < 0.6) spawnFx(e.g.position.x, B_.position.y, e.g.position.z, 0, 0.5, 0, rnd() < 0.5 ? 0xff9a30 : 0xffe070, 0.1, 0.35, -1, 1);
    if (!e.hitOnce && dist < e.r + 0.55 && hero.position.y < 1.3){ if (hurtPlayer(12 * e.dm, e.g.position.x, e.g.position.z, 6) !== 'dodge') e.hitOnce = true; }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.6; } }
  else if (e.state === 'spit'){ face(toP, 8); e.jaw.rotation.x = 0.7; B_.position.y = lerp(B_.position.y, 2.2, 1 - Math.exp(-dt * 4));
    if (!e.spat && e.t < 0.35){ e.spat = true; e.head.getWorldPosition(tA); const to = clampArena(new V3(hero.position.x, 0, hero.position.z)); lob5(tA.clone(), to, 0.75, 10 * e.dm, dlFire9, dlFireGeo9); play('fireball'); }
    if (e.t <= 0){ e.state = 'recover'; e.t = 0.5; } }
  else if (e.state === 'recover'){ B_.position.y = lerp(B_.position.y, 1.9, 1 - Math.exp(-dt * 3)); e.jaw.rotation.x = 0; if (e.t <= 0){ e.state = 'chase'; e.cd = 1.5 + rnd() * 1.5; } }
}
MAKERS.dragonling = makeDragonling;
EX_INTRO.dragonling = '¡Crías de dragón! Pican desde el aire y escupen fuego. Ojo a la línea y al círculo rojos.';
dropOf.dragonling = 0.35;
function spawnLings9(n, msg){
  for (let k = 0; k < n; k++){ const a = rnd() * TAU, x = Math.cos(a) * 5.6, z = Math.sin(a) * 5.6; const e = spawnEnemy('dragonling', [x, z]);
    if (e) for (let i = 0; i < 14; i++) spawnFx(x, 1.8, z, (rnd() - 0.5) * 4, rnd() * 3, (rnd() - 0.5) * 4, rnd() < 0.5 ? 0xff7a2a : 0xffe070, 0.12, 0.6, 2, 0.5); }
  if (msg){ banner(msg, 1.4); play('dragonRoar'); }
}
function lings9(pdt){
  if (!(bossE && bossE.type === 'dragon' && bossE.alive && gameState === 'play' && !invActive)) return;
  const D = bossE.dl9 || (bossE.dl9 = { t: 3.2, p2: false, re: 16 }); const n = enemies.filter(e => e.alive && e.type === 'dragonling').length;
  if (D.t > 0){ D.t -= pdt; if (D.t <= 0) spawnLings9(2, '¡Ryūjin llama a sus crías!<small>Dos dragoncitos se unen a la pelea</small>'); return; }
  if (!D.p2 && bossE.hp < bossE.maxHp * 0.5){ D.p2 = true; spawnLings9(2, '¡Más crías!<small>Ryūjin está furioso</small>'); }
  if (n === 0){ D.re -= pdt; if (D.re <= 0){ D.re = 15; spawnLings9(1, null); } } else D.re = Math.max(D.re, 8);
}
const _killEnemyDL9 = killEnemy;
killEnemy = function(e){ const was = e.alive; _killEnemyDL9(e); if (was && e.type === 'dragon') for (const o of enemies) if (o.alive && o.type === 'dragonling') _killEnemyDL9(o); };

const _v3UpdateX9 = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateX9(dt, pdt, playing); if (!playing) return; try { super9(pdt); lings9(pdt); } catch (err) { console.error(err); } };

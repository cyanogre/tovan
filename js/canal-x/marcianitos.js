'use strict';
/* ---------- Minijuego: ¡Marcianitos! ---------- */
const INV_Z = -90;
const invG = new THREE.Group(); invG.position.set(0, 0, INV_Z); scene.add(invG); invG.visible = false;
const invTex = { imp: [texAsset('canal-x/marcianitos/imp-1'), texAsset('canal-x/marcianitos/imp-2')],
  oni: [texAsset('canal-x/marcianitos/oni-1'), texAsset('canal-x/marcianitos/oni-2')], eye: [texAsset('canal-x/marcianitos/ojo-1'), texAsset('canal-x/marcianitos/ojo-2')] };
const sprMat = tex => makeMat(0xffffff, { map: tex, emissive: 1, side: THREE.DoubleSide });
const inv = { aliens: [], bullets: [], bombs: [], blocks: [], ship: null, ufo: null, fx: 0, fy: 0, dir: 1, stepT: 0, frame: 0, shotT: 0, bombT: 1, ufoT: 8, score: 0, over: false };
{ const rowsDef = ['eye', 'imp', 'imp', 'oni', 'oni'];
  rowsDef.forEach((kind, r) => { for (let c = 0; c < 8; c++){ const m = mesh(new THREE.PlaneGeometry(0.9, 0.72), sprMat(invTex[kind][0]), 0, 0, 0, invG);
    inv.aliens.push({ m, kind, r, c, alive: true }); } });
  inv.ship = mesh(new THREE.PlaneGeometry(1.5, 0.86), sprMat(texAsset('canal-x/marcianitos/nave')), 0, 1.0, 0, invG);
  inv.ufo = mesh(new THREE.PlaneGeometry(1.8, 0.78), sprMat(texAsset('canal-x/marcianitos/ovni')), 0, 11, 0, invG); inv.ufo.visible = false;
  const starM = makeMat(0xffffff, { emissive: 1 });
  for (let i = 0; i < 90; i++){ const s = mesh(B(0.05, 0.05, 0.05), starM, (rnd() - 0.5) * 34, rnd() * 18 - 2, -6 - rnd() * 8, invG); s.scale.setScalar(0.6 + rnd() * 1.4); }
  mesh(new THREE.CircleGeometry(2.4, 24), makeMat(0x6a4ad8, { emissive: 0.9 }), 9, 11, -9, invG);
  mesh(new THREE.RingGeometry(3, 3.4, 24), makeMat(0xc89aff, { emissive: 1, side: THREE.DoubleSide }), 9, 11, -8.9, invG).rotation.x = 0.4;
  mesh(B(20, 0.05, 0.05), makeMat(0x4ad8ff, { emissive: 1 }), 0, 0.45, 0, invG);
  const bm = makeMat(0x7dff8a, { emissive: 0.9 });
  for (const bx of [-4.5, 0, 4.5]) for (let y = 0; y < 3; y++) for (let x = 0; x < 6; x++){ if (y === 2 && (x === 0 || x === 5)) continue; if (y === 0 && (x === 2 || x === 3)) continue;
    inv.blocks.push({ m: mesh(B(0.28, 0.28, 0.1), bm, bx - 0.75 + x * 0.3, 2.1 + y * 0.3, 0, invG), alive: true, bx: bx - 0.75 + x * 0.3, by: 2.1 + y * 0.3 }); } }
const invShotMat = makeMat(0x7ff5ff, { emissive: 1 }), invBombMat = makeMat(0xff5ad8, { emissive: 1 });
function alienPos(a){ return [inv.fx + (a.c - 3.5) * 1.35, 10.2 - a.r * 1.05 + inv.fy]; }
function startInvaders(){
  invActive = true; invG.visible = true; inv.over = false; inv.fx = 0; inv.fy = 0; inv.dir = 1; inv.stepT = 0.5; inv.bombT = 1.2; inv.ufoT = 6 + rnd() * 4; inv.score = 0;
  inv.aliens.forEach(a => { a.alive = true; a.m.visible = true; }); inv.blocks.forEach(b => { b.alive = true; b.m.visible = true; });
  inv.bullets.forEach(b => invG.remove(b.m)); inv.bombs.forEach(b => invG.remove(b.m)); inv.bullets.length = 0; inv.bombs.length = 0;
  inv.ship.position.x = 0; inv.ufo.visible = false; hero.visible = false; placeAliens();
  barkOnce('inv', '¿Nos han metido en OTRO videojuego? ¡Dispara, que el sueldo no te lo paga nadie!');
}
function endInvaders(){
  if (!invActive) return;
  invActive = false; invG.visible = false; hero.visible = true;
  inv.bullets.forEach(b => invG.remove(b.m)); inv.bombs.forEach(b => invG.remove(b.m)); inv.bullets.length = 0; inv.bombs.length = 0;
}
function placeAliens(){ for (const a of inv.aliens){ if (!a.alive) continue; const [x, y] = alienPos(a); a.m.position.set(x, y, 0); } }
function invShoot(){
  if (inv.bullets.length >= 4) return;
  const m = mesh(B(0.08, 0.36, 0.05), invShotMat, inv.ship.position.x + 0.35, 1.5, 0, invG); inv.bullets.push({ m }); play('pew');
}
function invDash(){ const d = (keys.KeyA || keys.ArrowLeft || joy.x < -0.2) ? -1 : 1; inv.ship.position.x = clamp(inv.ship.position.x + d * 2.2, -6.6, 6.6); player.inv = Math.max(player.inv, 0.45); play('roll');
  for (let i = 0; i < 8; i++) spawnFx(invG.position.x + inv.ship.position.x, 1, INV_Z + 0.1, -d * 3, (rnd() - 0.5), 0, 0x7ff5ff, 0.08, 0.3, 0, 0); }
function invSpecial(){
  const x = inv.ship.position.x; player.meter = 0; flash('#bff6ff', 0.5); shake = 0.4; play('beam');
  const beam = mesh(B(1.4, 11, 0.05), makeMat(0xbff6ff, { emissive: 1, opacity: 0.8 }), x, 6.5, 0.02, invG); later(0.4, () => invG.remove(beam));
  for (const a of inv.aliens) if (a.alive && Math.abs(a.m.position.x - x) < 1.2) killAlien(a);
}
function killAlien(a){
  a.alive = false; a.m.visible = false; const p = a.m.position;
  for (let i = 0; i < 10; i++){ const ang = rnd() * TAU; spawnFx(p.x, p.y, INV_Z + 0.1, Math.cos(ang) * 3, Math.sin(ang) * 3, 0, a.kind === 'oni' ? 0x3f6fd8 : a.kind === 'imp' ? 0x8a4aff : 0xff5ad8, 0.12, 0.45, 0, 0); }
  const pts = a.kind === 'eye' ? 30 : a.kind === 'imp' ? 20 : 10; inv.score += pts; addTrust(pts * 120); play('die');
  player.meter = Math.min(100, player.meter + 3 * up.meterRate); addCombo(); kills++;
}
function updateInvaders(dt){
  if (!invActive || inv.over) return;
  // nave
  const ix = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0) + (Math.abs(joy.x) > 0.15 ? joy.x : 0);
  inv.ship.position.x = clamp(inv.ship.position.x + clamp(ix, -1, 1) * 7.5 * dt, -6.6, 6.6);
  inv.ship.position.y = 1.0 + Math.sin(time * 6) * 0.04; inv.ship.visible = !(player.inv > 0 && Math.sin(time * 40) > 0);
  inv.shotT -= dt; if (inv.shotT <= 0){ inv.shotT = 0.34; invShoot(); }
  // flota
  const alive = inv.aliens.filter(a => a.alive);
  if (!alive.length){ inv.over = true; banner('¡Invasión repelida!<small>+25 % PV · +5.000 de confianza</small>', 2); heal(Math.round(player.maxHp * 0.25)); addTrust(5000); play('waveClear'); chT = Math.min(chT, 1.2); return; }
  inv.stepT -= dt;
  if (inv.stepT <= 0){ inv.stepT = 0.07 + 0.45 * alive.length / inv.aliens.length; inv.frame ^= 1;
    for (const a of alive) a.m.material.uniforms.uMap.value = invTex[a.kind][inv.frame];
    const xs = alive.map(a => alienPos(a)[0]), edge = inv.dir > 0 ? Math.max(...xs) > 6.4 : Math.min(...xs) < -6.4;
    if (edge){ inv.dir *= -1; inv.fy -= 0.42; } else inv.fx += inv.dir * 0.28;
    play('tick'); placeAliens();
    if (Math.min(...alive.map(a => alienPos(a)[1])) < 2.9){ inv.over = true; banner('¡Te han invadido!', 1.6); hurtPlayer(player.maxHp * 0.15, hero.position.x, hero.position.z, 0); chT = Math.min(chT, 1.2); return; } }
  // bombas enemigas
  inv.bombT -= dt;
  if (inv.bombT <= 0){ inv.bombT = 0.5 + rnd() * 0.7; const cols = {}; for (const a of alive){ if (!cols[a.c] || a.r > cols[a.c].r) cols[a.c] = a; }
    const shooters = Object.values(cols), s = shooters[Math.floor(rnd() * shooters.length)];
    if (s){ const m = mesh(B(0.14, 0.34, 0.05), invBombMat, s.m.position.x, s.m.position.y - 0.4, 0, invG); inv.bombs.push({ m }); } }
  // ovni: Camión-kun espacial
  inv.ufoT -= dt;
  if (inv.ufoT <= 0 && !inv.ufo.visible){ inv.ufo.visible = true; inv.ufo.userData.dir = rnd() < 0.5 ? 1 : -1; inv.ufo.position.set(-8.5 * inv.ufo.userData.dir, 11.2, 0); inv.ufo.scale.x = inv.ufo.userData.dir; play('truckHorn'); }
  if (inv.ufo.visible){ inv.ufo.position.x += inv.ufo.userData.dir * 3.2 * dt; if (Math.abs(inv.ufo.position.x) > 9){ inv.ufo.visible = false; inv.ufoT = 9 + rnd() * 6; } }
  // disparos del jugador
  for (let i = inv.bullets.length - 1; i >= 0; i--){ const b = inv.bullets[i], p = b.m.position; p.y += 13 * dt; let gone = p.y > 12;
    for (const a of alive){ if (!a.alive) continue; if (Math.abs(a.m.position.x - p.x) < 0.45 && Math.abs(a.m.position.y - p.y) < 0.38){ killAlien(a); gone = true; break; } }
    if (!gone && inv.ufo.visible && Math.abs(inv.ufo.position.x - p.x) < 0.9 && Math.abs(inv.ufo.position.y - p.y) < 0.4){ inv.ufo.visible = false; inv.ufoT = 12; gone = true;
      addTrust(4000); heal(Math.round(player.maxHp * 0.1)); banner('¡Camión-kun espacial!<small>+4.000 de confianza · +10 % PV</small>', 1.5); play('specialBoom'); }
    if (!gone) for (const k of inv.blocks) if (k.alive && Math.abs(k.bx - p.x) < 0.18 && Math.abs(k.by - p.y) < 0.2){ k.alive = false; k.m.visible = false; gone = true; break; }
    if (gone){ invG.remove(b.m); inv.bullets.splice(i, 1); } }
  // bombas
  for (let i = inv.bombs.length - 1; i >= 0; i--){ const b = inv.bombs[i], p = b.m.position; p.y -= 5 * dt; p.x += Math.sin(time * 20 + i) * 0.01; let gone = p.y < 0.4;
    for (const k of inv.blocks) if (k.alive && Math.abs(k.bx - p.x) < 0.2 && Math.abs(k.by - p.y) < 0.2){ k.alive = false; k.m.visible = false; gone = true; break; }
    if (!gone && Math.abs(inv.ship.position.x - p.x) < 0.5 && p.y < 1.4){ gone = true; hurtPlayer(10 * dmgScale(wave) * (bossE && bossE.type === 'star' ? 0.6 : 0.7), hero.position.x, hero.position.z, 0); }
    if (gone){ invG.remove(b.m); inv.bombs.splice(i, 1); } }
}
Object.assign(SFX, { pew: () => tone({ type: 'square', f0: 1400, f1: 500, dur: 0.07, vol: 0.04, rv: 0 }) });

'use strict';
/* ---------- Pasivas ---------- */
function onKillOtaku(e){
  if (lvl('stonks') && stonks < 60 + 30 * S10('stonks')){ const s0 = stonks; stonks = Math.min(60 + 30 * S10('stonks'), stonks + lvl('stonks')); if (Math.floor(stonks / 10) !== Math.floor(s0 / 10)){ tB.set(hero.position.x, hero.position.y + 2.8, hero.position.z); spawnNumber(tB, `STONKS 📈 +${stonks} %`, 'react', '#7dff8a'); play('stonks'); } }
  if (e.truckHit){ tA.set(e.g.position.x, e.numY + 0.4, e.g.position.z); spawnNumber(tA, 'Enviado a otro mundo', 'react', '#ffe070'); if (stat('isekai') >= 25) unlock('isekai'); }
  if (e.markT > 0 || e.nani){ if (stat('nani') >= 20) unlock('nani'); }
  if (e.noteDone){ tB.set(hero.position.x, hero.position.y + 2.8, hero.position.z); spawnNumber(tB, '*coge una patata frita…*', 'react', '#ffffff');
    later(0.9, () => { tB.set(hero.position.x, hero.position.y + 2.8, hero.position.z); spawnNumber(tB, '*…y se la come*', 'react', '#ffffff'); play('crunch'); }); }
}
function onHurtOtaku(){
  if (lvl('stonks') && stonks > 1){ stonks = Math.floor(stonks / 2); tB.set(hero.position.x, hero.position.y + 3.2, hero.position.z); spawnNumber(tB, 'NOT STONKS 📉', 'react', '#ff6a5a'); play('notstonks'); }
  if (setOn('otaku') && !protaUsed && player.hp > 0 && player.hp < player.maxHp * 0.2){
    protaUsed = true; player.hp = Math.max(player.hp, Math.round(player.maxHp * 0.3)); player.inv = 3;
    bigShout('¡Todavía no!'); flash('#ff9ae0', 0.5); play('revive'); ringFx(hero.position.x, hero.position.z, 0xff7ad8, 0.3, 4, 0.5);
  }
}
const goldHairTex = texAsset('jugador/tovan-pelo-dorado');
function setSuper(on){
  if (on === superOn) return; superOn = on;
  if (on){ M.hair.uniforms.uMap.value = goldHairTex; M.hair.uniforms.uColor.value.setHex(0xffffff); M.hair.uniforms.uEmissive.value = 0.55; bigShout('¡Súper Repartidor!'); play('superOn'); flash('#fff3a0', 0.5); ringFx(hero.position.x, hero.position.z, 0xffe070, 0.3, 3.5, 0.5); }
  else { M.hair.uniforms.uMap.value = hairTex; const i = HERO_MATS.indexOf(M.hair); M.hair.uniforms.uColor.value.setHex(goldOn ? 0xffd878 : heroMatOrig[i][0]); M.hair.uniforms.uEmissive.value = goldOn ? 0.22 : heroMatOrig[i][1]; }
}
// camión
const truck = new THREE.Group(); scene.add(truck); truck.visible = false;
{ const w = makeMat(0xf2f2f2), r = makeMat(0xd8322a), d = makeMat(0x1a2440, { emissive: 0.4 }), t = makeMat(0x1a1a1e), l = makeMat(0xfff4c0, { emissive: 1 });
  mesh(B(1.7, 2.1, 3.3), w, 0, 1.45, -1.1, truck); mesh(B(1.72, 0.3, 3.32), r, 0, 1.0, -1.1, truck);
  mesh(B(1.6, 1.5, 1.3), w, 0, 1.15, 1.2, truck); mesh(B(1.4, 0.6, 0.05), d, 0, 1.45, 1.86, truck); mesh(B(1.5, 0.3, 0.06), t, 0, 0.7, 1.86, truck);
  for (const s of [-1, 1]){ mesh(B(0.3, 0.16, 0.05), l, 0.55 * s, 0.75, 1.88, truck); for (const z of [1.2, -0.4, -2.2]){ const wh = mesh(C(0.38, 0.38, 0.3, 10), t, 0.8 * s, 0.38, z, truck); wh.rotation.z = Math.PI / 2; } } }
const truckTele = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.45 }), 0, 0.05, 0); truckTele.visible = false;
let truckRun = null;

const truckExtras = [];
function truckMeshes(n){ while (truckExtras.length < n){ const t = truck.clone(); t.visible = false; scene.add(t); truckExtras.push(t); } return [truck].concat(truckExtras.slice(0, n)); }
function hideTrucks(){ truck.visible = false; truckExtras.forEach(t => { t.visible = false; }); truckTele.visible = false; }
function launchTruck(){
  const live = enemies.filter(e => e.alive && e.spawnT <= 0); if (!live.length) return false;
  let best = live[0], bn = -1; for (const e of live){ const k = live.filter(o => Math.hypot(o.g.position.x - e.g.position.x, o.g.position.z - e.g.position.z) < 2.5).length; if (k > bn){ bn = k; best = e; } }
  const a = rnd() * TAU, fx = Math.sin(a), fz = Math.cos(a);
  const aimP = !isekaiRun && !special && rnd() < (meta.isekaiSeen ? 0.3 : 0.55);
  const ox = aimP ? hero.position.x : best.g.position.x, oz = aimP ? hero.position.z : best.g.position.z;
  const lanes = [0]; for (let k = 1; k <= lvl('mirror'); k++) lanes.push(2.6 * k, -2.6 * k);
  const big = bigMul();
  if (lanes.length > 1) discover('truck_mirror', 'Caravana de camiones', 'Espejo + Camión-kun: vienen en grupo.');
  if (lvl('giant')) discover('truck_giant', 'Camión articulado', 'Seta gigante + Camión-kun: tamaño XXL.');
  startTruckRun({ a, fx, fz, sx: ox - fx * 13, sz: oz - fz * 13, aimP, lanes, big, back: false });
  if (!barkSaid.truck){ barkSaid.truck = true; bigShout('¡Camión-kun!'); }
  return true;
}
function startTruckRun(o){
  truckTele.visible = true; truckTele.position.set(o.sx, 0.05, o.sz); truckTele.rotation.y = o.a;
  truckTele.scale.set((2.2 + (o.lanes.length - 1) * 2.6) * o.big, 1, 26);
  truckRun = Object.assign({ t: 0, hit: new Set() }, o); play('truckHorn');
}
function updateTruck(dt){
  if (!truckRun) return;
  const R = truckRun; R.t += dt;
  truckTele.material.uniforms.uOpacity.value = 0.3 + 0.3 * Math.abs(Math.sin(time * 12));
  if (R.t < 1.2) return;
  const meshes = truckMeshes(R.lanes.length - 1);
  if (!truck.visible){ meshes.forEach(m => { m.visible = true; }); play('charge'); }
  const d = (R.t - 1.2) * 24, qx = R.fz, qz = -R.fx;
  R.lanes.forEach((off, i) => { const m = meshes[i];
    m.position.set(R.sx + R.fx * d + qx * off, 0, R.sz + R.fz * d + qz * off); m.rotation.y = R.a; m.scale.setScalar(R.big);
    if (rnd() < 0.5) puffAt(m.position.x, m.position.z, 1, R.big);
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || R.hit.has(e)) continue;
      const ex = e.g.position.x - m.position.x, ez = e.g.position.z - m.position.z, along = ex * R.fx + ez * R.fz, side = ex * R.fz - ez * R.fx;
      if (Math.abs(along) < 2.2 * R.big && Math.abs(side) < 1.1 * R.big + e.r){ R.hit.add(e); e.truckHit = true;
        const v = e.isBoss ? Math.round(e.maxHp * 0.08) : rdmg(140);
        hitEnemy(e, v, true, R.fx * 0.7 + (side > 0 ? R.fz : -R.fz) * 0.7, R.fz * 0.7 + (side > 0 ? -R.fx : R.fx) * 0.7, 12, 3, false, { src: 'truck' }); play('slam'); shake = Math.max(shake, 0.25); } } });
  { const hx = hero.position.x - truck.position.x, hz = hero.position.z - truck.position.z;
    if (!R.near && Math.abs(hx * R.fx + hz * R.fz) < 2 && Math.abs(hx * R.fz - hz * R.fx) < 1.4){ R.near = true;
      if (R.aimP && !isekaiRun && !special && state !== 'roll' && hero.position.y < 0.8 && gameState === 'play' && !player.dead){ startIsekai(); return; }
      tB.set(hero.position.x, hero.position.y + 2.8, hero.position.z); spawnNumber(tB, '¡Uf, por poco!', 'react', '#ffffff'); } }
  if (d > 26){ hideTrucks(); truckRun = null;
    if (lvl('echo') && !R.back){ discover('truck_echo', 'Camión de ida y vuelta', 'Eco + Camión-kun: vuelve por donde ha venido.');
      later(0.4, () => { if (!truckRun) startTruckRun({ a: R.a + Math.PI, fx: -R.fx, fz: -R.fz, sx: R.sx + R.fx * 26, sz: R.sz + R.fz * 26, aimP: false, lanes: R.lanes, big: R.big, back: true }); }); } }
}
// clones de sombra
const cloneP = [new V3(), new V3()];
function cloneSmoke(){ cloneP.forEach(c => { for (let i = 0; i < 10; i++){ const a = rnd() * TAU; spawnFx(c.x, 0.5 + rnd(), c.z, Math.cos(a) * 1.5, 1, Math.sin(a) * 1.5, 0xd8d0e8, 0.18, 0.6, 0, 2); } }); play('ignite'); }
function updateClones(dt){
  if (!lvl('clones')) return;
  const rx = Math.cos(hero.rotation.y), rz = -Math.sin(hero.rotation.y);
  cloneP.forEach((c, i) => { const s = i ? 1 : -1; tA.set(hero.position.x + rx * 1.5 * s, hero.position.y, hero.position.z + rz * 1.5 * s); c.lerp(tA, 1 - Math.exp(-dt * 10)); });
}
let cloneMats = null;
function renderClones(){
  if (!lvl('clones') || player.dead || !(gameState === 'play' || gameState === 'upgrade' || gameState === 'paused')) return;
  if (!cloneMats){ const s = new Set(); hero.traverse(o => { o.layers.enable(1); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.uniforms && m.uniforms.uColor) s.add(m); }); }); cloneMats = [...s]; }
  const saved = cloneMats.map(m => [m.uniforms.uColor.value.getHex(), m.uniforms.uEmissive.value, m.uniforms.uOpacity.value]);
  cloneMats.forEach(m => { m.uniforms.uColor.value.setHex(0x7a5aff); m.uniforms.uEmissive.value = 0.6; m.uniforms.uOpacity.value = 0.55; });
  const pos = hero.position.clone(), vis = hero.visible; hero.visible = true;
  renderer.autoClear = false; camera.layers.set(1);
  for (const c of cloneP){ hero.position.copy(c); hero.updateMatrixWorld(true); renderer.render(scene, camera); }
  camera.layers.set(0); renderer.autoClear = true; hero.position.copy(pos); hero.visible = vis; hero.updateMatrixWorld(true);
  cloneMats.forEach((m, i) => { m.uniforms.uColor.value.setHex(saved[i][0]); m.uniforms.uEmissive.value = saved[i][1]; m.uniforms.uOpacity.value = saved[i][2]; });
}
function cloneHits(mv, range){
  if (!lvl('clones') || mv.special) return;
  const fX = Math.sin(hero.rotation.y), fZ = Math.cos(hero.rotation.y);
  for (const c of cloneP){
    if (mv.slam) ringFx(c.x + fX, c.z + fZ, 0x9a7aff, 0.2, range * 0.7, 0.3);
    for (const e of enemies){
      if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
      const dx = e.g.position.x - c.x, dz = e.g.position.z - c.z, dist = Math.max(0.001, Math.hypot(dx, dz));
      if (dist - e.r > range * 0.9) continue;
      if (!mv.slam && (dx * fX + dz * fZ) / dist < mv.cone) continue;
      const [val, crit] = rollDamage(mv);
      hitEnemy(e, Math.max(1, Math.round(val * (0.5 + 0.25 * S10('clones')))), crit, dx / dist, dz / dist, mv.knock * 0.6, 1, false, { src: 'clone' });
    }
  }
}
// marca de «Tú ya estás muerto» y cuaderno
function onFinisherMarks(list){
  if (!lvl('omae') || !list.length) return;
  let any = false;
  for (const e of list) if (e.alive && !(e.markT > 0)){ e.markT = 3; any = true; }
  if (any){ tB.set(hero.position.x, hero.position.y + 2.9, hero.position.z); spawnNumber(tB, 'Tú ya estás muerto', 'react', '#ff5a6a'); play('omae'); }
}
function updateMarks(e, dt){
  updatePoison(e, dt);
  if (e.markT > 0){
    e.markT -= dt; if (rnd() < dt * 12) spawnFx(e.g.position.x + (rnd() - 0.5) * e.r, 0.5 + rnd() * e.scale, e.g.position.z + (rnd() - 0.5) * e.r, 0, 1, 0, 0xff3a4a, 0.05, 0.4, 0, 0);
    if (e.markT <= 0 && e.alive){ tA.set(e.g.position.x, e.numY + 0.3, e.g.position.z); spawnNumber(tA, '¿NANI?!', 'react', '#ffffff'); play('nani'); e.nani = true;
      const x = e.g.position.x, z = e.g.position.z; later(0.35, () => explode(x, z, 1.6 * (1 + 0.25 * S10('omae')), 0xff4a5a, 85 * (1 + 0.6 * S10('omae')), { sfx: 'boom', kind: 'nani', knock: 5 })); }
  }
  if (e.noteT > 0){
    e.noteT -= dt; if (rnd() < dt * 8) spawnFx(e.g.position.x, 1 + rnd() * e.scale, e.g.position.z, 0, 0.6, 0, 0x202020, 0.08, 0.6, -0.5, 1);
    if (e.noteT <= 0 && e.alive){ tA.set(e.g.position.x, e.numY + 0.3, e.g.position.z); spawnNumber(tA, '💀 Ataque al corazón', 'react', '#ff8a8a'); play('bossDie');
      e.noteDone = !e.isBoss; hitEnemy(e, e.isBoss ? Math.round(e.maxHp * (0.15 + 0.05 * S10('note'))) : e.hp + 9999, true, 0, 0, 0, 0, false, { src: 'aoe' }); }
  }
}
function otakuUpdate(dt){
  if (lvl('truck') && !truckRun && !special && !invActive){ truckT -= dt; if (truckT <= 0){ truckT = [20, 13, 9, 6.5][Math.min(3, lvl('truck') - 1)]; if (!launchTruck()) truckT = 2; } }
  updateTruck(dt);
  if (lvl('note')){ noteT -= dt; if (noteT <= 0){ noteT = Math.max(7, 16 - 4 * S10('note'));
    const live = enemies.filter(e => e.alive && e.spawnT <= 0 && !(e.noteT > 0)); if (live.length){ const tgt = live.reduce((a, b) => (b.hp > a.hp ? b : a));
      tgt.noteT = 4; tA.set(tgt.g.position.x, tgt.numY + 0.4, tgt.g.position.z); spawnNumber(tA, '✍️ Anotado', 'react', '#ffffff'); play('pen'); } } }
  if (superOn){ for (let i = 0; i < 2; i++){ const a = rnd() * TAU; spawnFx(hero.position.x + Math.cos(a) * 0.5, hero.position.y + rnd() * 1.5, hero.position.z + Math.sin(a) * 0.5, 0, 2.5, 0, rnd() < 0.5 ? 0xffe070 : 0xfff6c0, 0.06, 0.5, -1, 0); } }
  const wantFine = lvl('fine') && player.hp < player.maxHp * (0.4 + 0.1 * S10('fine')) && !player.dead;
  if (wantFine && !fineOn){ tB.set(hero.position.x, hero.position.y + 2.8, hero.position.z); spawnNumber(tB, 'Esto está bien ☕🔥', 'react', '#ffb060'); }
  fineOn = wantFine;
  if (fineOn){ if (rnd() < 0.7){ const a = rnd() * TAU; spawnFx(hero.position.x + Math.cos(a) * 0.4, hero.position.y + 0.3 + rnd() * 1.2, hero.position.z + Math.sin(a) * 0.4, 0, 1.6, 0, rnd() < 0.5 ? 0xff7a2a : 0xffc040, 0.08, 0.45, -2, -0.5); }
    fineTick -= dt; if (fineTick <= 0){ fineTick = 0.5; for (const e of enemies){ if (e.alive && e.spawnT <= 0 && Math.hypot(e.g.position.x - hero.position.x, e.g.position.z - hero.position.z) - e.r < 1.8) applyStatus(e, 'fire', 1); } } }
  if (timeStopT > 0){ timeStopT -= dt; document.body.classList.add('timestop'); if (Math.floor(timeStopT * 2) !== Math.floor((timeStopT + dt) * 2)) play('tick'); if (timeStopT <= 0){ tsApply(); if (tech && tech.id === 'worldRun') tech = null; } }
}
function resetOtaku(){ stonks = 0; setSuper(false); fineOn = false; protaUsed = false; truckT = 20; noteT = 16; timeStopT = 0; cancelTech(); truckRun = null; hideTrucks(); document.body.classList.remove('timestop'); }

/* ---------- Logros nuevos ---------- */
ACH.splice(ACH.length - 1, 0,
  { id: 'nani', ic: '👉', name: 'Ya estabas muerto', desc: 'Remata a 20 enemigos con «Tú ya estás muerto».', prog: () => [meta.stats.nani || 0, 20], rw: [['title', 'Ya estabas muerto']] },
  { id: 'isekai', ic: '🚚', name: 'Isekai', desc: 'Manda a 25 enemigos a otro mundo con Camión-kun.', prog: () => [meta.stats.isekai || 0, 25], rw: [['title', 'Conductor de camión']] },
  { id: 'zawarudo', ic: '⏱️', name: 'Toki yo tomare', desc: 'Acumula 1000 de daño en una sola detención del tiempo.', rw: [['title', 'Controlador del tiempo']] });
COS.title.push(['Ya estabas muerto', 'Ya estabas muerto', '🏷️'], ['Conductor de camión', 'Conductor de camión', '🏷️'], ['Controlador del tiempo', 'Controlador del tiempo', '🏷️']);

Object.assign(SFX, {
  kameCharge: () => { tone({ type: 'sine', f0: 200, f1: 900, dur: 1.2, vol: 0.12, attack: 0.3, rv: 0.5 }); tone({ type: 'triangle', f0: 400, f1: 1800, dur: 1.2, vol: 0.05, attack: 0.5, rv: 0.6 }); },
  beam:       () => { noise({ dur: 1.2, vol: 0.34, f0: 800, f1: 3000, type: 'bandpass', q: 0.6, rv: 0.5, attack: 0.02 }); tone({ type: 'sawtooth', f0: 110, f1: 80, dur: 1.1, vol: 0.14, rv: 0.4 }); tone({ type: 'sine', f0: 60, dur: 1.1, vol: 0.3, rv: 0.2 }); },
  zawarudo:   () => { noise({ dur: 0.9, vol: 0.25, f0: 6000, f1: 200, type: 'bandpass', q: 1, rv: 0.8, attack: 0.5 }); tone({ type: 'sine', f0: 80, f1: 30, dur: 1.2, vol: 0.5, when: 0.45, rv: 0.6 }); },
  tick:       () => tone({ type: 'square', f0: 1800, dur: 0.02, vol: 0.05, rv: 0.4 }),
  genki:      () => [48, 55, 60, 64, 67].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 1.8, vol: 0.06, attack: 0.5, when: i * 0.05, rv: 0.9 })),
  omae:       () => seq_([[64, 0.2], [63, 0.2], [58, 0.5]], 'square', 0.18, 0.06, 0.5),
  nani:       () => { tone({ type: 'square', f0: 520, f1: 900, dur: 0.18, vol: 0.08, rv: 0.3 }); tone({ type: 'sawtooth', f0: 90, f1: 60, dur: 0.4, vol: 0.2, when: 0.15, rv: 0.4 }); },
  stonks:     () => seq_([[72, 0.08], [76, 0.08], [79, 0.2]], 'square', 0.06, 0.06, 0.3),
  notstonks:  () => seq_([[67, 0.1], [63, 0.1], [58, 0.3]], 'square', 0.09, 0.07, 0.3),
  truckHorn:  () => { tone({ type: 'square', f0: 440, dur: 0.25, vol: 0.1, rv: 0.2 }); tone({ type: 'square', f0: 554, dur: 0.25, vol: 0.08, rv: 0.2 }); tone({ type: 'square', f0: 440, dur: 0.45, vol: 0.1, when: 0.35, rv: 0.3 }); tone({ type: 'square', f0: 554, dur: 0.45, vol: 0.08, when: 0.35, rv: 0.3 }); },
  pen:        () => { for (let i = 0; i < 4; i++) noise({ dur: 0.08, vol: 0.1, f0: 4000, q: 2, when: i * 0.09, rv: 0.1 }); },
  crunch:     () => { noise({ dur: 0.12, vol: 0.2, f0: 2500, q: 0.8 }); noise({ dur: 0.1, vol: 0.15, f0: 1800, q: 0.8, when: 0.14 }); },
  superOn:    () => { noise({ dur: 1.0, vol: 0.2, f0: 300, f1: 4000, q: 1, rv: 0.6, attack: 0.1 }); [60, 64, 67, 72, 76].forEach((n, i) => tone({ type: 'square', f0: NOTE(n), dur: 0.8, vol: 0.05, when: i * 0.06, rv: 0.6 })); }
});

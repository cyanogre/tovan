'use strict';
/* ---------- Ganchos de combate ---------- */
function onStaffHits(hitList, mv){
  if (!hitList.length) return;
  if (mv.slam && !mv.special) onFinisherMarks(hitList);
  for (const e of hitList){
    if (!e.alive) continue;
    if (lvl('fireEdge')) applyStatus(e, 'fire', 1);
    if (lvl('frost')) applyStatus(e, 'ice', 0.8 + 0.4 * (lvl('frost') - 1));
    if (mv.slam && !mv.special && setOn('impacto')){ applyStatus(e, 'fire', 1); applyStatus(e, 'ice', 1.5); applyStatus(e, 'shock', 1); }
    if (mv.slam && !mv.special && lvl('zero') && e.alive) freezeEnemy(e, (setOn('hielo') ? 2.8 : 2) + 0.8 * S10('zero'));
  }
  if (lvl('storm')){ stormCount++; if (stormCount % 3 === 0){ const t = hitList.find(e => e.alive) || hitList[0];
    chainLightning(hero.position.x, 1.6, hero.position.z, t.alive ? t : nearestFrom(hero.position.x, hero.position.z, 4), 1 + lvl('storm') + rayoJumps(), 14 + 6 * lvl('storm')); } }
}
function onSlam(cx, cz, range){
  if (lvl('after')) later(0.35, () => {
    const r = range * (1.3 + 0.15 * (lvl('after') - 1)) * (setOn('impacto') ? 1.4 : 1);
    explode(cx, cz, r, 0xffc070, 30 + 12 * lvl('after'), { el: lvl('fireEdge') ? 'fire' : lvl('frost') ? 'ice' : null, sfx: 'slam', kind: 'impact', knock: 4 });
  });
}
function onSpecial(){
  if (lvl('thunder')){
    for (let i = 0; i < 12 + 6 * S10('thunder'); i++) later(0.12 + i * 0.15, () => {
      const live = enemies.filter(e => e.alive && e.spawnT <= 0); if (live.length) skyStrike(live[Math.floor(rnd() * live.length)], 40); });
  }
  if (lvl('supernova')){
    [3, 4.6, 6.4, 8.2, 10].slice(0, 3 + S10('supernova')).forEach((r, i) => later(0.3 + i * 0.3, () => {
      explode(hero.position.x, hero.position.z, r, i === 1 ? 0xfff27a : 0xff7a2a, 45 + i * 15, { el: 'fire', el2: 'shock', sfx: 'boom', kind: 'nova', knock: 5 });
      flash('#ffe9b0', 0.35);
    }));
  }
}
function onRollStart(){
  if (lvl('static')){
    const seen = new Set(), n = 2 + lvl('static') + rayoJumps();
    for (let i = 0; i < n; i++){
      const e = nearestFrom(hero.position.x, hero.position.z, 3.6, seen); if (!e) break; seen.add(e);
      later(i * 0.05, () => { if (!e.alive) return; bolt(hero.position.x, 1.1, hero.position.z, e.g.position.x, 0.9 * e.scale, e.g.position.z); play('zap');
        hitEnemy(e, rdmg(15 * rayoMul()), false, 0, 0, 1.5, 2, false, { src: 'bolt', el: 'shock' }); });
    }
  }
}
function onLanding(){
  if (lvl('glacial')){
    const R = 2.4 * (setOn('impacto') ? 1.4 : 1);
    ringFx(hero.position.x, hero.position.z, 0x9fe8ff, 0.3, R, 0.4);
    for (let i = 0; i < 16; i++){ const a = i / 16 * TAU; spawnFx(hero.position.x, 0.2, hero.position.z, Math.cos(a) * 3.5, 0.8, Math.sin(a) * 3.5, 0xc8f6ff, 0.1, 0.5, 0, 1); }
    play('freeze');
    for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
      if (Math.hypot(e.g.position.x - hero.position.x, e.g.position.z - hero.position.z) - e.r < R){ hitEnemy(e, rdmg(10), false, 0, 0, 0, 1, false, { src: 'aoe', el: 'ice', power: 1.5 + lvl('glacial') }); } }
  }
}
function onKill(e){
  const x = e.g.position.x, z = e.g.position.z;
  if (e.burnT > 0 && (lvl('pyre') || setOn('fuego'))){
    const big = lvl('pyre') ? 1 : 0.65;
    later(0.12, () => explode(x, z, 2.4 * big * (1 + 0.2 * S10('pyre')), 0xff6a20, (lvl('pyre') ? 42 : 24) * (1 + 0.5 * S10('pyre')), { el: 'fire', sfx: 'boom', kind: 'pyre' }));
  }
  if (lvl('shards') && (e.frozenT > 0 || e.chill >= 2)){
    later(0.1, () => explode(x, z, 2.2 * (1 + 0.2 * S10('shards')), 0x9fe8ff, 30 * (1 + 0.5 * S10('shards')), { el: 'ice', power: 2.5 + S10('shards'), sfx: 'shatter', kind: 'shatter' }));
  }
  if (lvl('feast')){ heal(5 * lvl('feast'), true); player.meter = Math.min(100, player.meter + 6 * lvl('feast') * up.meterRate); }
  if (e.ice) e.ice.visible = false;
}
function updateStatuses(e, dt){
  updateMarks(e, dt);
  if (e.reactCd > 0) e.reactCd -= dt;
  if (e.shockT > 0){ e.shockT -= dt; if (rnd() < dt * 10) spawnFx(e.g.position.x + (rnd() - 0.5) * e.r * 2, 0.4 + rnd() * e.scale, e.g.position.z + (rnd() - 0.5) * e.r * 2, 0, 0, 0, 0xfff6a0, 0.05, 0.12, 0, 0); }
  if (e.chillT > 0){ e.chillT -= dt; if (e.chillT <= 0) e.chill = 0; }
  if (e.burnT > 0){
    e.burnT -= dt; e.burnTick -= dt;
    if (rnd() < dt * 16) spawnFx(e.g.position.x + (rnd() - 0.5) * e.r * 1.6, 0.3 + rnd() * 0.8 * e.scale, e.g.position.z + (rnd() - 0.5) * e.r * 1.6, 0, 0.8, 0, rnd() < 0.5 ? 0xff7a2a : 0xffc040, 0.08, 0.45, -2, -0.6);
    if (e.burnTick <= 0){ e.burnTick = 0.5; hitEnemy(e, Math.max(1, Math.round(burnDps(e) * 0.5)), false, 0, 0, 0, 0, false, { src: 'dot' }); }
    if (e.burnT <= 0) e.burnS = 0;
  }
  if (e.frozenT > 0){
    e.frozenT -= dt;
    if (e.frozenT <= 0){ if (e.ice) e.ice.visible = false; for (let i = 0; i < 6; i++){ const a = rnd() * TAU; spawnFx(e.g.position.x, 0.6, e.g.position.z, Math.cos(a) * 2, 2, Math.sin(a) * 2, 0xc8f6ff, 0.07, 0.4, 10, 0); } }
  }
}
const _tint = new THREE.Color(), ICE_C = new THREE.Color(0xbff4ff), FIRE_C = new THREE.Color(0xff7a30), CHILL_C = new THREE.Color(0x7fb8ff), SHOCK_C = new THREE.Color(0xfff27a);
function statusTint(e, s){
  _tint.setHex(s.c);
  if (e.frozenT > 0) _tint.lerp(ICE_C, 0.65);
  else {
    if (e.chill > 0) _tint.lerp(CHILL_C, 0.12 * Math.min(4, e.chill));
    if (e.burnT > 0 && Math.sin(time * 22 + e.seed) > 0) _tint.lerp(FIRE_C, 0.45);
    if (e.shockT > 0 && Math.sin(time * 35 + e.seed) > 0.6) _tint.lerp(SHOCK_C, 0.6);
  }
  return _tint;
}

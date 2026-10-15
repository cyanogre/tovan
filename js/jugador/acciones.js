'use strict';
/* ---------- Acciones del jugador ---------- */
const canAct = () => gameState === 'play' && !player.dead;
function nearestEnemy(maxD){
  let best_ = null, bd = maxD;
  for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
    const d = Math.hypot(e.g.position.x - hero.position.x, e.g.position.z - hero.position.z) - e.r;
    if (d < bd){ bd = d; best_ = e; } }
  return best_;
}
function startMove(name, idx){
  state = 'attack'; curMove = MV[name]; curMove.name = name; seqI = idx; stepT = 0; queued = false; hitDone = false; waveT = 0;
  staffToHand(); trailSamples.length = 0; swingDone = false;
  if (name === 'special') play('specialCharge');
  if (inputMag > 0.12) heading = inputHeading;
  else { const e = nearestEnemy(3.5); if (e) heading = angTo(hero.position.x, hero.position.z, e.g.position.x, e.g.position.z); }
  hero.rotation.y = heading;
}
function doAttack(){
  if (invActive){ if (canAct()) invShoot(); return; }
  if (state === 'roll' && canAct() && rollT > 0.1){            // estocada en voltereta (contraataque si acabas de esquivar)
    state = 'normal'; P.body.rotation.x = 0; P.body.scale.setScalar(1); startMove('dash', 97); player.inv = Math.max(player.inv, 0.18); play('swingBig');
    if (counterT > 0){ tA.set(hero.position.x, hero.position.y + 2.6, hero.position.z); spawnNumber(tA, '¡Contraataque!', 'react', '#8fe8ff'); play('dodge'); }
    return; }
  if (!canAct() || state === 'roll' || state === 'tech' || state === 'charge') return;
  if (!grounded && hero.position.y > 0.3 && state !== 'attack'){ if (umb && typeof umbDive13 === 'function'){ umbDive13(); return; } umb = null; startMove('dive', 96); return; }   // picado
  const seq = comboSeq();
  if (state === 'attack'){ if (!curMove.special && !curMove.custom && !curMove.hits && !curMove.dive && !curMove.pierce && stepT > curMove.dur * 0.3 && seqI < seq.length - 1) queued = true; return; }
  if (comboT > 0 && comboNext === 2 && comboT < 0.52){ startMove('flurry', 98); return; }              // combo con pausa: ráfaga
  if (comboT > 0 && comboNext < seq.length) startMove(seq[comboNext], comboNext); else startMove(seq[0], 0);
}
function doSpecial(){
  if (invActive){ if (canAct() && player.meter >= 100) invSpecial(); return; }
  if (!canAct() || state === 'roll' || state === 'tech' || !grounded || player.meter < 100 || timeStopT > 0 || lcut) return;
  if (!lcutBypass){ const ln = legendNames(); if (ln.length){ startLegendCut(ln, () => { lcutBypass = true; doSpecial(); lcutBypass = false; }); return; } }
  player.meter = 0; if (lcutBypass) legendFx();
  if (techSet().length){ startTech(); return; } startMove('special', 99); flash('#bff6ff', 0.35);
}
function doJump(){ if (invActive) return; if (!canAct() || state === 'roll' || state === 'tech') return;
  if (!grounded){ if (meta.cos.hat === 'duck' && !duckJump && !umb && state !== 'attack'){ duckJump = true; vy = 7.2; play('quack');
      for (let i = 0; i < 8; i++){ const a = rnd() * TAU; spawnFx(hero.position.x, hero.position.y + 0.4, hero.position.z, Math.cos(a) * 1.6, -0.5, Math.sin(a) * 1.6, 0xffd23a, 0.07, 0.5, 4, 0); } }
    return; }
  if (state === 'charge') state = 'normal';
  vy = 7.6 * jumpMul(); grounded = false; puff(4, 0.8); play('jump'); }
function doRoll(){
  if (invActive){ if (canAct()) invDash(); return; }
  if (state === 'tech'){ if (tech && !tech.inv) cancelTech(); else return; }
  if (!canAct() || !grounded || state === 'roll' || (state === 'attack' && curMove.special)) return;
  comboT = 0; state = 'roll'; rollT = 0; rollDir = inputMag > 0.12 ? inputHeading : hero.rotation.y;
  heading = rollDir; hero.rotation.y = rollDir; attackW = 0; trailAlpha = 0; staffToBack(); puff(5); play('roll'); onRollStart();
  if (stat('rolls') >= 300) unlock('roll300');
}
function rollDamage(mv){
  let v = mv.dmg[0] + rnd() * (mv.dmg[1] - mv.dmg[0]);
  v *= up.dmg; if (mv.slam && !mv.special) v *= 1 + 0.5 * up.slamBoost;
  v *= (1 + comboBonus()) * otakuMul() * chMul();
  const crit = slowT > 0 || rnd() < up.crit + (mv.critB || 0) || perfectMove === mv;
  return [Math.round(v * (crit ? critMul() : 1)), crit];
}
function resolveHit(mv){
  const fX = Math.sin(hero.rotation.y), fZ = Math.cos(hero.rotation.y);
  const k0 = kills;
  const range = mv.range * (mv.slam && !mv.special ? 1 + 0.5 * up.slamBoost : 1) * (mv.slam && setOn('impacto') ? 1.4 : 1) * cosRange(mv);
  let any = false; const hitList = [];
  for (const e of enemies){
    if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
    const dx = e.g.position.x - hero.position.x, dz = e.g.position.z - hero.position.z, dist = Math.max(0.001, Math.hypot(dx, dz));
    if (dist - e.r > range || hero.position.y > 1.6) continue;
    if (!mv.slam && (dx * fX + dz * fZ) / dist < mv.cone) continue;
    const [val, crit] = rollDamage(mv);
    if (hitEnemy(e, val, crit, dx / dist, dz / dist, mv.knock * knockMul(), mv.meter, true, { src: 'melee' })){ any = true; hitList.push(e); }
  }
  onStaffHits(hitList, mv);
  cloneHits(mv, range);
  if (kills - k0 >= 5) unlock('multi5');
  if (up.reflect) for (const p of projectiles){
    if (p.owner !== 'enemy') continue;
    const dx = p.m.position.x - hero.position.x, dz = p.m.position.z - hero.position.z, d = Math.max(0.001, Math.hypot(dx, dz));
    if (d > range + 0.3 || (!mv.slam && (dx * fX + dz * fZ) / d < mv.cone)) continue;
    const tgt = nearestEnemyFrom(p.m.position.x, p.m.position.z);
    const a = tgt ? angTo(p.m.position.x, p.m.position.z, tgt.g.position.x, tgt.g.position.z) : Math.atan2(dx, dz);
    p.owner = 'player'; p.m.material = orbMatP; p.vx = Math.sin(a) * 8; p.vz = Math.cos(a) * 8; p.life = 2.5;
    sparks(p.m.position.x, 1, p.m.position.z, 6, 0xa8f2ff); any = true;
  }
  if (any) hitStop = mv.hs != null ? mv.hs : mv.slam ? 0.09 : 0.05;
  if (mv.slam){
    play(mv.special ? 'specialBoom' : 'slam');
    lightFlash(hero.position.x, 1.5, hero.position.z, mv.special ? 0xbff6ff : 0xa8f2ff, mv.special ? 2.6 : 1.4, mv.special ? 12 : 6);
    const cx = mv.special || mv.centered ? hero.position.x : hero.position.x + fX * 1.3, cz = mv.special || mv.centered ? hero.position.z : hero.position.z + fZ * 1.3;
    ringFx(cx, cz, mv.special ? 0xbff6ff : 0xa8f2ff, 0.3, mv.special ? 4.6 : range + 0.3, mv.special ? 0.5 : 0.35);
    if (mv.special){ ringFx(cx, cz, 0xffe9a0, 0.2, 3.4, 0.4, 0.3); flash('#dff9ff', 0.55); }
    shake = mv.special ? 0.5 : 0.3;
    for (let i = 0; i < 12; i++){ const a = i / 12 * TAU; spawnFx(cx, 0.1, cz, Math.cos(a) * 3.2, 0.6, Math.sin(a) * 3.2, 0xb8a898, 0.14, 0.5, 0, 1.8); }
    sparks(cx, 0.3, cz, mv.special ? 16 : 8, 0xa8f2ff);
    if (mv.special) onSpecial(); else onSlam(cx, cz, range);
  }
}
function nearestEnemyFrom(x, z){
  let b = null, bd = 1e9;
  for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue; const d = Math.hypot(e.g.position.x - x, e.g.position.z - z); if (d < bd){ bd = d; b = e; } }
  return b;
}
function heal(v, quiet){
  const before = player.hp; player.hp = Math.min(player.maxHp, player.hp + v);
  const got = Math.round(player.hp - before);
  if (!quiet && got > 0){ tA.set(hero.position.x, hero.position.y + 2.4, hero.position.z); spawnNumber(tA, '+' + got, 'heal'); }
}
function hurtPlayer(dmg, sx, sz, knock){
  if (state === 'tech' && tech && tech.inv) return 'none';
  if (!canAct()) return 'none';
  if (state === 'roll' && rollT > 0.02 && rollT < 0.46){
    if (up.perfect && slowT <= 0 && rollT < 0.2 && time - perfectAt > Math.max(1.5, 5 - 1.5 * S10('perfect'))){ perfectAt = time; slowT = 1.1; flash('#8fe8ff', 0.3); banner('¡Esquiva perfecta!', 0.9); play('dodge'); }
    counterT = 0.7; return 'dodge';
  }
  if (state === 'attack' && curMove.special) return 'none';
  if (player.inv > 0) return 'none';
  { const r = cosPreHurt(); if (r) return r; }
  const v = Math.max(1, Math.round(dmg * (1 - Math.min(0.75, up.armor)) * chMul() * cosTakenMul()));
  addTrust(-trust * 0.08);
  player.hp -= v; player.inv = 0.8; dmgWave = true;
  if (state === 'tech') cancelTech(); onHurtOtaku();
  const dx = hero.position.x - sx, dz = hero.position.z - sz, d = Math.max(0.001, Math.hypot(dx, dz));
  player.kx = dx / d * knock; player.kz = dz / d * knock;
  hitStop = 0.08; shake = Math.max(shake, 0.25); flash('#ff2a2a', 0.35); play('hurt');
  if (player.hp > 0 && player.hp < player.maxHp * 0.3) barkOnce('low', '¡Vas justo de vida! Bebe algo. ¿No tienes? Pues esquiva.');
  if (combo >= 10){ tB.set(hero.position.x, hero.position.y + 2.9, hero.position.z); spawnNumber(tB, 'Combo roto', 'react', '#ff8a8a'); }
  breakCombo(); portrait.classList.remove('hurt'); void portrait.offsetWidth; portrait.classList.add('hurt');
  tA.set(hero.position.x, hero.position.y + 2.4, hero.position.z); spawnNumber(tA, v, 'hurt');
  if ((state === 'attack' && !curMove.armor) || state === 'charge'){ state = 'normal'; comboT = 0; chargeLvl = 0; }
  if (player.hp <= 0 && catSave()){}
  else if (player.hp <= 0){
    if (phoenixLeft > 0){
      phoenixLeft--; player.hp = Math.round(player.maxHp * 0.6); player.inv = 2.4; slowT = 1.2;
      banner('¡Fénix!<small>Renaces entre las llamas</small>', 2); flash('#ffb060', 0.7); play('specialBoom');
      later(0.1, () => explode(hero.position.x, hero.position.z, 5, 0xff7a2a, 150, { el: 'fire', sfx: 'boom', kind: 'nova', knock: 8 }));
      later(0.35, () => explode(hero.position.x, hero.position.z, 3, 0xffe070, 60, { el: 'fire', sfx: 'boom', kind: 'nova', knock: 4 }));
    } else if (reviveLeft > 0){
      reviveLeft--; player.hp = Math.round(player.maxHp * 0.34); player.inv = 2.2; slowT = 1.0;
      banner('¡Segundo aliento!', 1.6); flash('#fff3c0', 0.6); play('revive'); bark('Te dije que cobro en fragmentos. Esta va a tu cuenta.');
      ringFx(hero.position.x, hero.position.z, 0xfff3c0, 0.3, 4.5, 0.5);
      for (const e of enemies){ if (!e.alive) continue; const ex = e.g.position.x - hero.position.x, ez = e.g.position.z - hero.position.z, d = Math.max(0.001, Math.hypot(ex, ez));
        if (d < 4.5){ e.vx += ex / d * 8; e.vz += ez / d * 8; } }
    } else { player.hp = 0; die(); }
  }
  return 'hit';
}
function die(){
  cancelTech(); if (timeStopT > 0){ timeStopT = 0; document.body.classList.remove('timestop'); }
  player.dead = true; state = 'dead'; deadT = 0; attackW = 0; staffToBack(); hero.visible = true;
  slowT = 0; shake = 0.4; flash('#ff2a2a', 0.6); banner('Tovan ha caído…', 2.2); play('playerDeath'); setSong(null); applyMusVol();
}

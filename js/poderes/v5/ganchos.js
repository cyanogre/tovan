'use strict';
/* ---------- Ganchos: daño, críticos, muertes, golpes recibidos ---------- */
const _cosDmgMul5 = cosDmgMul;
cosDmgMul = function(e, src){
  let m = _cosDmgMul5(e, src);
  if (src === 'dot') return m;
  if (lvl('express') && time - P5.rollT < 1.5) m *= 1.15 + 0.1 * lvl('express');
  if (P5.mark === e) m *= 1.4 + 0.2 * S10('tracking');
  if (setOn('reparto')) m *= 1 + Math.min(0.25, 0.01 * P5.waveKills);
  if (lvl('bigSpecial') && src === 'melee' && state === 'attack' && curMove && curMove.special) m *= 1 + 0.4 * lvl('bigSpecial');
  return m;
};
const _cosRange5 = cosRange;
cosRange = function(mv){ let r = _cosRange5(mv); if (mv && mv.special && lvl('bigSpecial')) r *= 1 + 0.3 * lvl('bigSpecial'); return r; };
const _atkSpd5 = atkSpd;
atkSpd = function(){
  let s = _atkSpd5() * (1 + 0.15 * lvl('cafe')) * (1 + 0.01 * (P5.minor.mAtk || 0));
  if (lvl('berserk')) s *= 1 + (0.45 + 0.25 * S10('berserk')) * clamp((0.75 - player.hp / player.maxHp) / 0.45, 0, 1);
  return s;
};
const _cosFragMul5 = cosFragMul;
cosFragMul = function(){ return _cosFragMul5() * (lvl('midas') ? 1 + 0.25 * lvl('midas') : 1) * (setOn('reparto') ? 1.2 : 1) * (1 + 0.01 * (P5.minor.mFrag || 0)); };
function forceCrit(v, crit){ if (P5.ghostCrit){ P5.ghostCrit = false; if (!crit){ v = Math.round(v * critMul()); crit = true; } } return [v, crit]; }
const _rollDamage5 = rollDamage;
rollDamage = function(mv){ const [v, c] = _rollDamage5(mv); return forceCrit(v, c); };
const _cdmg5 = cdmg;
cdmg = function(base, lv, extraCrit){ const [v, c] = _cdmg5(base, lv, extraCrit); return forceCrit(v, c); };

const _hitEnemy5 = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  const ok = _hitEnemy5(e, val, crit, nx, nz, knock, meterGain, melee, o);
  if (!ok) return ok;
  const src = o.src || (melee ? 'melee' : 'other');
  if (src === 'melee') P5.hits++;
  if (crit && src !== 'dot'){ stat('crits');
    if (lvl('lucky')) player.meter = Math.min(100, player.meter + 2 * lvl('lucky'));
    if ((e.elite || e.isBoss) && P5.midasCd <= 0 && (lvl('midas') || lvl('pinata'))){ P5.midasCd = 0.5;
      if (lvl('midas')) dropBills(e.g.position.x, e.g.position.z, 2 * lvl('midas'));
      if (lvl('pinata')) for (let k = 0; k < lvl('pinata'); k++) dropCandy(e.g.position.x, e.g.position.z); } }
  if ((src === 'orb' || src === 'orbital') && lvl('vampOrbs')) heal(lvl('vampOrbs'), true);
  if (lvl('signature') && e.alive && !e.isBoss && src !== 'dot' && e.hp / e.maxHp < (lvl('signature') > 1 ? 0.2 : 0.12)){
    tA.set(e.g.position.x, e.numY + 0.5, e.g.position.z); spawnNumber(tA, '¡Firmado!', 'react', '#e0a860'); play('stamp'); killEnemy(e); }
  return ok;
};
const _killEnemy5 = killEnemy;
killEnemy = function(e){
  const wasAlive = e.alive;
  _killEnemy5(e);
  if (!wasAlive) return;
  stat('k_' + e.type); if (e.elite) stat('elites');
  if (state === 'attack' && curMove && curMove.dive) stat('diveK');
  const w = curW(); (meta.wk || (meta.wk = {}))[w] = (meta.wk[w] || 0) + 1;
  if (e.isBoss){ (meta.wb || (meta.wb = {}))[w] = 1; if (e.type === 'star' && P5.starFight){ P5.starFight = false; if (P5.starHurt < 60) unlock('guitarAch'); } }
  P5.waveKills++;
  if (lvl('meterKill')) player.meter = Math.min(100, player.meter + 4 * lvl('meterKill') * up.meterRate);
  if (P5.mark === e){ P5.mark = null; dropPickup(e.g.position.x, e.g.position.z); }
  if (lvl('domino') && !e.isBoss && e.type !== 'dragon'){
    const dx = e.g.position.x - hero.position.x, dz = e.g.position.z - hero.position.z, d = Math.max(0.001, Math.hypot(dx, dz));
    P5.flyers.push({ e, vx: dx / d * 9, vz: dz / d * 9, t: 0.42, hit: new Set([e]), dmg: rdmg(18 + 12 * lvl('domino')) });
  }
};
const _hurtPlayer5 = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){
  const hp0 = player.hp, rolling = state === 'roll';
  let shielded = false;
  if (lvl('comboShield') && combo >= 30 - 8 * S10('comboShield') && P5.cshCd <= 0 && player.inv <= 0 && !rolling && canAct()){ dmg *= Math.max(0.15, 0.5 - 0.15 * S10('comboShield')); P5.keepCombo = true; shielded = true; }
  const res = _hurtPlayer5(dmg, sx, sz, knock);
  P5.keepCombo = false;
  if (res === 'dodge' && rolling){ stat('dodges');
    const att = nearestFrom(sx, sz, 3.5);
    if (lvl('returns') && att && P5.retCd <= 0){ P5.retCd = 0.4; hitEnemy(att, rdmg(42 + 22 * (lvl('returns') - 1)), true, 0, 0, 3, 3, false, { src: 'aoe' }); stunE(att, 1);
      tA.set(att.g.position.x, att.numY + 0.4, att.g.position.z); spawnNumber(tA, '¡Devuelto!', 'react', '#e0a860'); }
    if (lvl('ghost') && P5.ghostCd <= 0){ P5.ghostCd = Math.max(1.5, 4 - S10('ghost')); P5.ghostT = 1.5 + 0.5 * S10('ghost'); P5.ghostCrit = true; player.inv = Math.max(player.inv, P5.ghostT); play('dodge');
      tA.set(hero.position.x, hero.position.y + 2.5, hero.position.z); spawnNumber(tA, '¡Buuu!', 'react', '#c8d8ff'); }
  }
  if (res === 'hit'){ stat('hurts'); P5.lastAct = time;
    if (P5.starFight) P5.starHurt += Math.max(0, hp0 - player.hp);
    if (shielded){ P5.cshCd = Math.max(3, 8 - 2.5 * S10('comboShield')); tA.set(hero.position.x, hero.position.y + 2.8, hero.position.z); spawnNumber(tA, '¡Ritmo!', 'react', '#9fe8ff'); }
    const taken_ = Math.max(0, hp0 - Math.max(0, player.hp)), att = nearestFrom(sx, sz, 3);
    if (att && lvl('thorns') && taken_ > 0){ const v = Math.round(taken_ * (1 + lvl('thorns')));
      hitEnemy(att, v, false, 0, 0, 2, 0, false, { src: 'aoe' }); sparks(att.g.position.x, 1, att.g.position.z, 8, 0x8ad86a);
      for (const o of enemies){ if (o === att || !o.alive || o.spawnT > 0) continue; if (Math.hypot(o.g.position.x - att.g.position.x, o.g.position.z - att.g.position.z) < 2) hitEnemy(o, Math.round(v / 2), false, 0, 0, 1, 0, false, { src: 'aoe' }); } }
    if (att && att.alive && lvl('frostArmor') && P5.frostCd <= 0){ P5.frostCd = Math.max(1, 3 - 0.8 * S10('frostArmor')); freezeEnemy(att, 1.2 + 0.6 * S10('frostArmor')); }
    if (lvl('secondWind') && !P5.swUsed && player.hp > 0 && player.hp < player.maxHp * 0.3){ P5.swUsed = true; heal(Math.round(player.maxHp * (0.08 + 0.06 * S10('secondWind')))); player.inv = 2 + S10('secondWind');
      ringFx(hero.position.x, hero.position.z, 0x9fe8ff, 0.3, 3, 0.5); banner('¡Respiro!<small>Tres segundos para pensar</small>', 1.2); play('revive'); }
  }
  return res;
};
const _breakCombo5 = breakCombo;
breakCombo = function(){ if (P5.keepCombo) return; _breakCombo5(); };
const _addCombo5 = addCombo;
addCombo = function(){ _addCombo5(); if (combo > (meta.bestCombo || 0)) meta.bestCombo = combo; };
const _stunE5 = stunE;
stunE = function(e, t){ const was = e.alive && !e.isBoss && e.spawnT <= 0; _stunE5(e, t); if (was) stat('stuns'); };
const _applyStatus5 = applyStatus;
applyStatus = function(e, el, power = 1){ const fresh = el === 'poison' && !(e.poisonS > 0); const r = _applyStatus5(e, el, power); if (fresh && e.poisonS > 0) stat('poisoned'); return r; };
const _noteReaction5 = noteReaction;
noteReaction = function(){ _noteReaction5(); stat('reactions'); };
const _cosWaveClear5 = cosWaveClear;
cosWaveClear = function(){ _cosWaveClear5(); if (player.hp < player.maxHp * 0.2 && !player.dead) stat('lowclear'); };
const _doSpecial5 = doSpecial;
doSpecial = function(){ const m0 = player.meter; _doSpecial5(); if (m0 >= 100 && player.meter < 100 && !invActive) stat('specials'); };
const _onSpecial5 = onSpecial;
onSpecial = function(){ _onSpecial5(); specialExtras(); };
const _onRollStart5 = onRollStart;
onRollStart = function(){ _onRollStart5(); P5.rollT = time; };
const _doJump5 = doJump;
doJump = function(){
  if (!invActive && !grounded && lvl('springs') && canAct() && state !== 'roll' && state !== 'tech' && state !== 'attack' && !umb){
    const duck = meta.cos.hat === 'duck';
    if (P5.airJ < lvl('springs') && (!duck || duckJump)){ P5.airJ++; vy = 7.4; play('boing'); for (let i = 0; i < 8; i++){ const a = rnd() * TAU; spawnFx(hero.position.x, hero.position.y + 0.2, hero.position.z, Math.cos(a) * 1.8, -0.4, Math.sin(a) * 1.8, 0xffffff, 0.06, 0.4, 2, 0); } return; }
  }
  const g0 = grounded; _doJump5(); if (g0 && !grounded) stat('jumps');
};
const _doAttack5 = doAttack;
doAttack = function(){ P5.lastAct = time; _doAttack5(); };
const _releaseCharge5 = releaseCharge;
releaseCharge = function(){ const lv0 = chargeLvl; _releaseCharge5(); p5ChargeRelease(lv0); };
function p5ChargeRelease(lv0){
  if (lv0 === 2 && lvl('overcharge')) for (let i = 0; i < 3; i++) later(0.18 + i * 0.12, () => {
    const t = nearestFrom(hero.position.x, hero.position.z, 7); if (t) chainLightning(hero.position.x, 1.8, hero.position.z, t, 2 + lvl('overcharge') + rayoJumps(), 18 + 8 * lvl('overcharge')); });
}
const _startMove5 = startMove;
startMove = function(name, idx){ _startMove5(name, idx); if (name === 'dive' && lvl('pogo')){ diveMul *= 1 + 0.25 + 0.25 * lvl('pogo'); P5.pogoHits = P5.hits; } };
const _diveHold5 = diveHold;
diveHold = function(mv){
  const was = hitDone; _diveHold5(mv);
  if (!was && hitDone && lvl('pogo') && P5.hits > (P5.pogoHits || 0)){
    state = 'normal'; vy = 9.2; grounded = false; hero.position.y = 0.05; P5.airJ = 0; play('boing');
    tA.set(hero.position.x, hero.position.y + 2.4, hero.position.z); spawnNumber(tA, '¡Boing!', 'react', '#ffc070'); }
};
const _onStaffHits5 = onStaffHits;
onStaffHits = function(list, mv){
  _onStaffHits5(list, mv);
  if (lvl('avatar')) for (const e of list){ if (!e.alive) continue; const ak = 1 + 0.5 * S10('avatar'); applyStatus(e, 'fire', 0.8 * ak); applyStatus(e, 'shock', 0.8 * ak); if (e.alive) applyStatus(e, 'ice', 0.5 * ak); }
};
const _startWave5 = startWave;
startWave = function(n){ P5.waveKills = 0; P5.swUsed = false; _startWave5(n); };

'use strict';
/* ======================================================================
   AJUSTES v8: el nivel del bug va directo al jefe (con oleadas de refuerzos
   mientras peleas) y el Gato del final deja de ser imposible
   ====================================================================== */
const CORRUPT8 = BIOMES.findIndex(b => b.id === 'corrupt');
const isCorruptW8 = n => n < FINAL_WAVE && biomeOfWave(n) === CORRUPT8;
const RF8 = { on: false, n: 0, t: 0, bonus: 0, bonusMax: 0 };
const ERR_HP8 = 0.6, ERR_DM8 = 0.85, RF_HP8 = 0.3, CAT_HP8 = 0.42, CAT_DM8 = 0.55, KIT_HP8 = 0.3;

/* ---------- Nivel del bug: sin oleadas previas, directo a ERROR 404 ---------- */
const _buildWave8 = buildWave;
buildWave = function(n){ if (isCorruptW8(n) && n % 5 === 0) return ['error', 'popup', 'cursor']; return _buildWave8(n); };
const _startWave8 = startWave;
startWave = function(n){
  if (isCorruptW8(n) && n % 5 !== 0) n = Math.ceil(n / 5) * 5;                 // 26-29 se saltan: se empieza por el jefe
  RF8.on = isCorruptW8(n) && n % 5 === 0; RF8.n = 0; RF8.t = 7;
  _startWave8(n);
  if (RF8.on) later(2.4, () => bark('No hay tiempo para oleadas: el ERROR va a ir soltando procesos mientras peleamos. ¡Ciérralo!'));
};
function reinforce8(k){
  const n = Math.min(8, 3 + k), q = [];
  for (let i = 0; i < n; i++){ const r = rnd(); q.push(r < 0.3 ? 'popup' : r < 0.55 ? 'cursor' : r < 0.82 ? 'imp' : r < 0.94 ? 'oni' : 'brute'); }
  return q;
}
function rf8Update(pdt){
  if (!RF8.on || gameState !== 'play' || player.dead) return;
  const boss = enemies.find(e => e.alive && e.type === 'error');
  if (!boss) return;
  const minions = enemies.filter(e => e.alive && !e.isBoss).length;
  RF8.t -= pdt;
  if (!queue.length && ((minions <= 1 && RF8.t <= 0) || (RF8.t <= -9 && minions < 5))){
    RF8.n++; RF8.t = 6; const q = reinforce8(RF8.n); queue.push(...q); waveTotal += q.length; spawnTimer = Math.min(spawnTimer, 0.4);
    banner(`¡Refuerzos corruptos ${RF8.n}!<small>El ERROR abre ${q.length} procesos nuevos</small>`, 1.3); play('glitch');
    for (let i = 0; i < 3; i++) later(i * 0.12, () => gring(boss.g.position.x, 0.1, boss.g.position.z, i % 2 ? 0x20ffe0 : 0xff2ae0, 0.5, 5 + i, 0.5));
  }
}
const _spawnEnemy8 = spawnEnemy;
spawnEnemy = function(type, at){
  const e = _spawnEnemy8(type, at); if (!e) return e;
  if (e.type === 'finalcat'){ e.hp = e.maxHp = Math.round(e.maxHp * CAT_HP8); e.dm *= CAT_DM8; }
  else if (!e.isBoss && enemies.some(o => o.alive && o.type === 'finalcat')){ e.hp = e.maxHp = Math.max(1, Math.round(e.maxHp * KIT_HP8)); e.dm *= 0.5; }   // gatitos
  if (RF8.on){
    if (e.type === 'error'){ e.hp = e.maxHp = Math.round(e.maxHp * ERR_HP8); e.dm *= ERR_DM8; }
    else if (!e.isBoss){ e.hp = e.maxHp = Math.max(1, Math.round(e.maxHp * RF_HP8)); }
  }
  return e;
};
// al caer el ERROR se cierran todos sus procesos y hay cartas extra
const _killEnemy8 = killEnemy;
killEnemy = function(e){
  const was = e.alive; _killEnemy8(e);
  if (was && e.type === 'error' && RF8.on){
    RF8.on = false; queue.length = 0; RF8.bonus = RF8.bonusMax = 2;
    const left = enemies.filter(o => o.alive && !o.isBoss);
    left.forEach((o, i) => later(0.15 + i * 0.06, () => { if (!o.alive) return; const x = o.g.position.x, z = o.g.position.z;
      burst7(PA7, x, 0.8, z, 14, [0xff2ae0, 0x20ffe0, 0xffffff], 5, 0.18, 0.5, 2, 1, 0.5, SH7.sq); killEnemy(o); }));
    later(0.3, () => banner('¡Procesos cerrados!<small>Todo lo que había abierto el ERROR se apaga con él</small>', 1.6));
  }
};
const _openUpgrades8 = openUpgrades;
openUpgrades = function(){
  _openUpgrades8();
  const t = document.querySelector('#upScr .uptitle');
  if (t) t.textContent = RF8.bonusMax && RF8.bonus < RF8.bonusMax ? `Premio por arreglar el ERROR · carta extra ${RF8.bonusMax - RF8.bonus} de ${RF8.bonusMax}` : 'Elige una mejora';
};
const _afterUpgrade8 = afterUpgrade;
afterUpgrade = function(){
  if (RF8.bonus > 0 && gameState === 'play'){ RF8.bonus--; openUpgrades(); return; }
  RF8.bonusMax = 0; _afterUpgrade8();
};

/* ---------- El Gato del final: menos vida, menos daño y más respiro ---------- */
if (typeof BX !== 'undefined' && BX.finalcat){ const r0 = BX.finalcat.reset; BX.finalcat.reset = e => { r0(e); e.x5cd = (e.x5cd || 0) + 2.2; }; }

const _clearWorld8 = clearWorld;
clearWorld = function(){ _clearWorld8(); RF8.on = false; };
const _startRun8 = startRun;
startRun = function(){ Object.assign(RF8, { on: false, n: 0, t: 0, bonus: 0, bonusMax: 0 }); _startRun8(); };
const _v3Update8 = v3Update;
v3Update = function(dt, pdt, playing){ _v3Update8(dt, pdt, playing); if (playing) try { rf8Update(pdt); } catch (err) { console.error(err); } };

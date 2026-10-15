'use strict';
/* ---------- Combo ---------- */
let combo = 0, comboTimer = 0, comboMax = 0, comboTier = 0, comboPop = 0;
const TIERS = [[10, '¡Bien!', '#9fe8ff'], [25, '¡Genial!', '#7dff8a'], [50, '¡Brutal!', '#ffd970'], [100, '¡Imparable!', '#ff8a3a'], [200, '¡LEGENDARIO!', '#ff6ae0']];
function comboBonus(){
  const f = lvl('frenzy'), rate = 0.01 * (1 + f), cap = 0.2 * (1 + f);
  let b = Math.min(cap, Math.floor(combo / 5) * rate);
  if (setOn('sangre') && player.hp < player.maxHp * 0.5) b += 0.15;
  return b;
}
function addCombo(){
  combo++; comboTimer = 2.6 + 0.6 * ml('comboS'); comboPop = 1; if (combo > comboMax) comboMax = combo;
  if (combo === 100) unlock('combo100'); if (combo === 250) unlock('combo250');
  if (combo >= 50 - 12 * S10('super') && lvl('super')) setSuper(true);
  if (comboTier < TIERS.length && combo >= TIERS[comboTier][0]){
    const T = TIERS[comboTier]; comboTier++;
    if (T[0] === 50) barkOnce('combo', '¡Eso! ¡Así se reparte, repartidor!'); if (T[0] === 100) barkOnce('combo100', '¡Imparable! Te subo la propina.');
    comboWordEl.textContent = T[1]; comboWordEl.style.color = T[2]; comboWordT = 1.4;
    const c = parseInt(T[2].slice(1), 16);
    ringFx(hero.position.x, hero.position.z, c, 0.4, 2.8 + comboTier * 0.4, 0.5);
    for (let i = 0; i < 14 + comboTier * 4; i++){ const a = rnd() * TAU; spawnFx(hero.position.x, 1.2, hero.position.z, Math.cos(a) * 3.5, 2 + rnd() * 2, Math.sin(a) * 3.5, c, 0.07, 0.7, 6, 0); }
    play('tier');
  }
}
function breakCombo(){ combo = 0; comboTier = 0; comboTimer = 0; setSuper(false); }
const TRAIL_COLS = [0xd8fbff, 0x9fe8ff, 0x7dff8a, 0xffd970, 0xff8a3a, 0xff6ae0];

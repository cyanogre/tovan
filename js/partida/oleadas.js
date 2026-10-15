'use strict';
/* ---------- Oleadas ---------- */
function buildWave(n){
  const bi = biomeOfWave(n), loop = n > 30;
  if (n % 5 === 0){ const q = [bossOfWave(n)]; for (let k = 0; k < 1 + Math.floor(n / 5); k++) q.push(bi === 3 ? 'orb' : bi > 0 && k % 2 ? 'oni' : 'imp'); return q; }
  const q = []; let budget = Math.round(4 + n * 2.2);
  const pool = [['imp', 1, 1]];
  if (bi === 0){ if (n >= 2) pool.push(['sentinel', 2, 0.8]); if (n >= 3) pool.push(['brute', 4, 0.55]); if (loop) pool.push(['oni', 3, 0.6]); }
  else if (bi === 1){ pool[0][2] = 0.8; pool.push(['oni', 3, 0.9], ['sentinel', 2, 0.6]); if (loop) pool.push(['brute', 4, 0.4]); }
  else if (bi === 2){ pool[0][2] = 0.7; pool.push(['oni', 3, 0.6], ['brute', 4, 0.5], ['sentinel', 2, 0.6]); }
  else if (bi === 3){ pool.length = 0; pool.push(['orb', 1, 1], ['glass', 3, 0.7], ['oni', 3, 0.35]); }
  else if (bi === 6){ pool[0][2] = 0.8; pool.push(['sentinel', 2, 0.6], ['oni', 3, 0.6], ['brute', 4, 0.4]); }
  else { pool[0][2] = 0.8; pool.push(['sentinel', 2, 0.6], ['brute', 4, 0.5], ['oni', 3, 0.6]); }
  while (budget > 0){
    const ok = pool.filter(p => p[1] <= budget); const tot = ok.reduce((s, p) => s + p[2], 0);
    let r = rnd() * tot, pick = ok[0]; for (const p of ok){ r -= p[2]; if (r <= 0){ pick = p; break; } }
    q.push(pick[0]); budget -= pick[1];
  }
  for (let i = q.length - 1; i > 0; i--){ const j = rnd() * (i + 1) | 0; [q[i], q[j]] = [q[j], q[i]]; }
  return q;
}
const maxAlive = () => Math.min(11, 4 + Math.floor(wave * 0.8));
function startWave(n){
  if (n === FINAL_WAVE){ startFinal(); return; }
  wave = n; queue = buildWave(n); waveTotal = queue.length; spawnTimer = 1.0; clearT = -1; dmgWave = false; protaUsed = false;
  if (lvl('clones')) cloneSmoke();
  if (n >= 16) unlock('wave16');
  const bossW = n % 5 === 0, bt = bossW ? bossOfWave(n) : null;
  play('waveStart'); if (bossW) playBossTrack(bt, BOSS_SONG[bt]); else { stopBossTrack(false); setSong(BIOMES[curBiome].music); applyMusVol(); }
  banner(bossW ? `Oleada ${n}<small>${BOSS_BANNER[bt]}</small>` : `Oleada ${n}`, 1.8);
  if (bossW) sayOnce('boss_' + bt, STORY['boss_' + bt]);
}

'use strict';
/* ---------- Ciclo de la partida: empezar, limpiar, pausar, perder y volver al título ----------
   Varias capas posteriores amplían estas funciones envolviéndolas
   (busca «const _startRun», «const _clearWorld», «const _showOver»…). */
function clearWorld(){
  for (const e of enemies){ scene.remove(e.g); if (e.tele) scene.remove(e.tele); if (e.parts) e.parts.forEach(q => scene.remove(q)); } enemies.length = 0;
  for (const f of fballs) scene.remove(f.m); fballs.length = 0;
  for (const p of projectiles) scene.remove(p.m); projectiles.length = 0;
  for (const r of eRings) scene.remove(r.m); eRings.length = 0;
  for (const p of pickups) scene.remove(p.m); pickups.length = 0;
  for (const f of flames) scene.remove(f.m); flames.length = 0;
  for (const o of orbs) scene.remove(o); orbs.length = 0;
  for (const n of nums) n.el.remove(); nums.length = 0;
  bossBox.hidden = true; bossE = null;
}
function startRun(){
  clearWorld();
  initAudio(); up = UP0(); taken = {}; up.dmg = 1 + 0.08 * ml('str');
  const mhp = 150 + 15 * ml('vit');
  Object.assign(player, { hp: mhp, maxHp: mhp, meter: Math.min(100, 30 * ml('meterS')), inv: 0, kx: 0, kz: 0, dead: false }); applyRunPowers();
  rerolls = ml('reroll'); reviveLeft = ml('revive'); bossKills = 0; eliteKills = 0;
  breakCombo(); comboMax = 0; phoenixLeft = 0; stormCount = 0; prismT = 0; reactionsRun = 0; pending.length = 0; lflash = 0; ghostPct = 100;
  tagCnt = {}; setsOn = {}; shownLeg.clear(); renderTagChips(); drawPortrait();
  state = 'normal'; attackW = 0; comboT = 0; staffToBack(); trailAlpha = 0;
  hero.position.set(0, 0, 0); hero.visible = true; vy = 0; grounded = true; landT = 0;
  P.body.rotation.set(0, 0, 0); P.body.scale.setScalar(1);
  kills = 0; runTime = 0; slowT = 0; hitStop = 0; deadT = 0;
  titleScr.hidden = true; overScr.hidden = true; pauseScr.hidden = true; upScr.hidden = true; shrineScr.hidden = true;
  hud.hidden = false; waveBox.hidden = false;
  runSyn = new Set(); pendingWin = null; special = null; isekaiRun = false; castleBonus = 0; forceLegend = false; applyBiome(0); resetOtaku(); applyCosmetics(false); dmgWave = false; noDmgStreak = 0; idleT = 0; celebT = 0; barkSaid = {}; travel = null; fadeEl.style.opacity = '0'; chapEl.hidden = true; dlgEl.hidden = true; barkEl.hidden = true;
  gameState = 'play';
  if (!meta.intro2 || forceIntro){ meta.intro2 = true; meta.introSeen = true; saveMeta(); forceIntro = false; runIntro(); }
  else startWave(1);
}
function showOver(){
  stopEpic(); gameState = 'over';
  const rec = wave > best; if (rec) best = wave;
  const gain = fragNow(); meta.frag += gain; meta.runs++; meta.kills += kills; meta.best = best; stat('frag', gain); saveMeta();
  if (meta.stats.frag >= 1000) unlock('frag1000'); if (meta.runs >= 10) unlock('runs10'); if (wave === 1) unlock('die1');
  document.getElementById('fragGain').innerHTML = `+${gain} ✦ fragmentos <span>(tienes ${meta.frag})</span>`;
  const mm = Math.floor(runTime / 60), ss = String(Math.floor(runTime % 60)).padStart(2, '0');
  const ups = Object.entries(taken).map(([id, n]) => UPGRADES.find(u => u.id === id).name + (n > 1 ? ` ×${n}` : '')).join(', ') || 'Ninguna';
  document.getElementById('overStats').innerHTML =
    `<div><b>Oleada</b>${wave}${rec ? ' <em>¡Nuevo récord!</em>' : ''}</div><div><b>Capítulo</b>${Math.floor((wave - 1) / 5) + 1} · ${BIOMES[curBiome].name}</div><div><b>Enemigos</b>${kills}</div>` +
    `<div><b>Tiempo</b>${mm}:${ss}</div><div><b>Combo máx.</b>${comboMax}</div><div><b>Reacciones</b>${reactionsRun}</div><div><b>Récord</b>Oleada ${best}</div><div class="ups"><b>Mejoras</b>${ups}</div>`;
  document.getElementById('overTip').textContent = `Lumen dice: «${TIPS[Math.floor(Math.random() * TIPS.length)]}»`;
  overScr.hidden = false; hud.hidden = true; waveBox.hidden = true; bossBox.hidden = true;
}
function togglePause(){
  if (gameState === 'play'){ gameState = 'paused'; pauseScr.hidden = false; play('cursor'); renderPauseTabs(); }
  else if (gameState === 'paused'){ gameState = 'play'; pauseScr.hidden = true; play('confirm'); }
  applyMusVol();
}
function toTitle(){
  stopBossTrack(true); if (fadeTrack){ try { fadeTrack.a.pause(); } catch (err) {} fadeTrack = null; } homeGroup.visible = false; finalBeaten = false; lcut = null; document.body.classList.remove('cine', 'sepia'); cutInEl.className = ''; setScene(0);
  clearWorld(); gameState = 'title'; pauseScr.hidden = true; overScr.hidden = true; hud.hidden = true; waveBox.hidden = true;
  player.dead = false; state = 'normal'; hero.visible = true; P.body.rotation.set(0, 0, 0); hero.position.set(0, 0, 0);
  titleScr.hidden = false; updateBest(); applyBiome(0); dlgEl.hidden = true; barkEl.hidden = true; setSong('title'); applyMusVol();
}
function updateBest(){
  refreshPct();
  document.getElementById('bestTxt').innerHTML = best
    ? `Récord: oleada ${best} · Partidas: ${meta.runs} · Reacciones: ${Object.keys(meta.reacts || {}).length}/3 · <span class="fr">✦ ${meta.frag}</span>`
    : 'Aún no hay récord. ¿Cuánto aguantarás?';
}

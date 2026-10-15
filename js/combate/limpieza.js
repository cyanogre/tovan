'use strict';
/* ======================================================================
   v3: limpieza de restos, estilos de arma, entradas de jefe y menús
   ====================================================================== */

/* ---------- Limpieza: telegrafías, glitch y orbes ---------- */
function hideTeles(e){
  const hide = o => o.traverse(m => { if (m.isMesh && m.material && m.material.userData && m.material.userData.tele) m.visible = false; });
  if (e.tele) e.tele.visible = false; if (e.line) e.line.visible = false;
  hide(e.g); if (e.parts) e.parts.forEach(hide);
}
function sweepTeles(){ for (let i = TELES.length - 1; i >= 0; i--){ const m = TELES[i]; if (!m.parent){ TELES.splice(i, 1); continue; } m.visible = false; } }
function sweepHazards(){
  sweepTeles();
  for (const r of eRings){ scene.remove(r.m); } eRings.length = 0;
  for (const f of fballs){ scene.remove(f.m); if (f.circle) f.circle.visible = false; } fballs.length = 0;
  for (let i = projectiles.length - 1; i >= 0; i--) if (projectiles[i].owner === 'enemy'){ scene.remove(projectiles[i].m); projectiles.splice(i, 1); }
}
function resetGlitch(force){
  document.body.classList.remove('glitch-hard');
  if (force || !BIOMES[curBiome] || BIOMES[curBiome].id !== 'corrupt'){ document.body.classList.remove('glitch'); shared.uGlitch.value = 0; if (typeof errWin !== 'undefined') errWin.hidden = true; }
}
let sweepT = 0;
function cleanupTick(dt, playing){
  sweepT -= dt;
  if (sweepT <= 0){ sweepT = 0.4;
    if (!enemies.some(e => e.alive) || gameState === 'travel' || gameState === 'title' || gameState === 'over') sweepTeles();
    if (!bossE || bossE.type !== 'error') document.body.classList.remove('glitch-hard'); }
}
const _die = die;
die = function(){
  _die();
  for (const o of orbs) o.visible = false;
  for (let i = projectiles.length - 1; i >= 0; i--) if (projectiles[i].owner !== 'enemy'){ scene.remove(projectiles[i].m); projectiles.splice(i, 1); }
  for (const w of waves) scene.remove(w.g); waves.length = 0;
  for (const r of rangs) scene.remove(r.g); rangs.length = 0;
  chOrb.visible = false; shieldM.visible = false; umb = null;
  document.body.classList.remove('glitch-hard', 'timestop');
};
const _clearWorld2 = clearWorld;
clearWorld = function(){ _clearWorld2(); sweepHazards(); resetGlitch(false); };
const _applyBiome3 = applyBiome;
applyBiome = function(b){ _applyBiome3(b); if (BIOMES[b].id !== 'corrupt') resetGlitch(true); sweepHazards(); };

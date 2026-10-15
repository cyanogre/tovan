'use strict';
/* ---------- Viaje entre escenarios ---------- */
const fadeEl = document.getElementById('fadeScr'), chapEl = document.getElementById('chapter');
let travel = null;
function nextWave(n){
  const b = biomeOfWave(n);
  if (b !== curBiome) travelTo(b, n); else startWave(n);
}
function travelTo(b, n, noDialog){ if (b === 2) unlock('biome2'); gameState = 'travel'; travel = { t: 0, b, n, swapped: false, noDialog, crash: !!BIOMES[b].crash }; crashPh = -1; play('travel'); setSong(null); applyMusVol(); }
function updateTravel(dt){
  if (!travel) return;
  const T = (travel.t += dt), CR = travel.crash ? 5.2 : 0;
  fadeEl.style.opacity = String(T < 0.8 ? T / 0.8 : T < 3.2 + CR ? 1 : Math.max(0, 1 - (T - 3.2 - CR) / 0.8));
  if (travel.crash){ crashEl.hidden = !(T > 0.8 && T < 0.8 + CR); if (!crashEl.hidden) updateCrash(T - 0.8); }
  if (T >= 0.8 + CR && !travel.swapped){
    travel.swapped = true; applyBiome(travel.b);
    hero.position.set(0, 0, 0); heading = camYaw + Math.PI; hero.rotation.y = heading;
    for (const p of pickups) scene.remove(p.m); pickups.length = 0;
    for (const f of flames) scene.remove(f.m); flames.length = 0;
    const B = BIOMES[travel.b], ch = Math.floor((travel.n - 1) / 5) + 1;
    chapEl.querySelector('.cnum').textContent = B === BIOMES[FINAL] ? 'Capítulo final' : `Capítulo ${ch}`;
    chapEl.querySelector('.cname').textContent = B.name;
    chapEl.querySelector('.csub').textContent = B.sub;
    chapEl.hidden = false;
  }
  const Tc = T - CR;
  chapEl.style.opacity = String(Tc < 1.0 ? 0 : Tc < 1.5 ? (Tc - 1) / 0.5 : Tc < 3.1 ? 1 : Math.max(0, 1 - (Tc - 3.1) / 0.5));
  if (T >= 4.0 + CR){
    const { b, n, noDialog } = travel; crashEl.hidden = true; travel = null; fadeEl.style.opacity = '0'; chapEl.hidden = true;
    gameState = 'play';
    const key = b === 0 ? 'loop' : 'biome_' + b;
    if (noDialog) startWave(n); else sayOnce(key, STORY[key], () => startWave(n));
  }
}

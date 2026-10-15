'use strict';
/* ---------- Desbloqueo y avisos ---------- */
const toastBox = document.getElementById('toasts');
function rewardText(a){ return 'Desbloqueas: ' + a.rw.map(([c, id]) => c === 'title' ? `título «${id}»` : cosName(c, id)).join(' y '); }
function unlock(id){
  if (meta.ach[id]) return;
  const a = ACH.find(x => x.id === id); if (!a) return;
  meta.ach[id] = Date.now(); saveMeta(); play('achieve');
  const el = document.createElement('div'); el.className = 'win toast';
  el.innerHTML = `<span class="ti">${a.ic}</span><div><div class="tt">¡Logro desbloqueado!</div><div class="tn">${a.name}</div><div class="tr">${rewardText(a)}</div></div>`;
  toastBox.appendChild(el); setTimeout(() => el.classList.add('out'), 4600); setTimeout(() => el.remove(), 5200);
  if (id !== 'hats5' && COS.hat.filter(x => x[0] !== 'none' && cosUnlocked('hat', x[0])).length >= 5) unlock('hats5');
  if (id !== 'all' && ACH.every(x => x.id === 'all' || meta.ach[x.id])) unlock('all');
}
const achCheck = { reactT: [] };
function noteReaction(){ const t = runTime; achCheck.reactT.push(t); achCheck.reactT = achCheck.reactT.filter(x => t - x < 3); if (achCheck.reactT.length >= 10) unlock('chain10'); }
function noteWave(){ const n = stat('waves'); if (n >= 25) unlock('wave25'); }

/* ---------- Efectos, celebraciones y detalles ---------- */
const CONF = [0xff4a6a, 0xffd23a, 0x4ad8ff, 0x7dff8a, 0xc98aff, 0xffffff];
function confetti(x, y, z, n = 8){ for (let i = 0; i < n; i++){ const a = rnd() * TAU; spawnFx(x, y, z, Math.cos(a) * 2.5, 2 + rnd() * 2.5, Math.sin(a) * 2.5, CONF[i % CONF.length], 0.07, 0.9, 7, 0); } }
function money(x, z){ for (let i = 0; i < 12; i++){ const a = rnd() * TAU; spawnFx(x + Math.cos(a) * 0.3, 1.4 + rnd(), z + Math.sin(a) * 0.3, Math.cos(a) * 1.4, 1.5 + rnd(), Math.sin(a) * 1.4, i % 4 ? 0x3aa848 : 0xffd23a, 0.1, 1.3, 2.5, 0); } }
let celebT = 0, glassDropT = 0;
function celebrate(){
  celebT = 2.2;
  if (meta.cos.dance === 'wave') waveT = 1.8;
  if (meta.cos.glasses === 'pixel'){ glassDropT = 0.7; tB.set(hero.position.x, hero.position.y + 3 * hero.scale.y, hero.position.z); later(0.7, () => spawnNumber(tB, 'Así se hace', 'react', '#ffffff')); }
}
function applyDance(pdt, moving){
  const g = GLASSES.pixel;
  if (glassDropT > 0){ glassDropT -= pdt; g.position.y = 0.29 + Math.max(0, glassDropT / 0.7) * 1.3; } else g.position.y = 0.29;
  const halo = HATS.halo.g; halo.position.y = 0.92 + Math.sin(time * 2.5) * 0.04; halo.rotation.y += pdt * 1.5;
  const cat_ = HATS.cat.g; if (cat_.visible){ cat_.userData.tail.rotation.y = Math.sin(time * 2.2) * 0.6; cat_.userData.head.rotation.y = Math.sin(time * 0.7) * 0.5; }
  if (celebT <= 0 || moving || state !== 'normal') return;
  celebT -= pdt; const k = Math.min(1, celebT * 3, (2.2 - celebT) * 5);
  if (meta.cos.dance === 'dance'){
    const s = Math.sin(time * 11);
    bl(P.armL.sh.rotation, 'z', -1.6 - s * 0.7, k); bl(P.armR.sh.rotation, 'z', 1.6 - s * 0.7, k); bl(P.armL.el.rotation, 'x', -0.9, k); bl(P.armR.el.rotation, 'x', -0.9, k);
    P.hips.rotation.z += s * 0.18 * k; P.hips.position.y += Math.abs(Math.cos(time * 11)) * 0.06 * k; bl(P.neck.rotation, 'z', s * 0.2, k);
  } else if (meta.cos.dance === 'dab'){
    bl(P.armR.sh.rotation, 'z', 2.3, k); bl(P.armR.sh.rotation, 'x', -0.5, k); bl(P.armR.el.rotation, 'x', -0.05, k);
    bl(P.armL.sh.rotation, 'x', -1.5, k); bl(P.armL.sh.rotation, 'z', 0.6, k); bl(P.armL.el.rotation, 'x', -1.7, k);
    bl(P.neck.rotation, 'x', 0.45, k); bl(P.neck.rotation, 'y', -0.6, k); bl(P.spine.rotation, 'z', 0.15, k);
  }
}

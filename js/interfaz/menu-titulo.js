'use strict';
/* ---------- Menú de título: contadores, consejos y navegación ---------- */
const TTIPS = ['Mantén atacar para cargar un golpe; cada arma tiene el suyo.', 'Ataca en el aire para caer en picado. Cuanto más alto, más duele.',
  'Ataca mientras ruedas: estocada. Si acabas de esquivar, contraataque crítico.', 'Ataca, ataca, espera un pelín y ataca: ráfaga de siete golpes.',
  'Cada arma cambia tu forma de jugar: prueba el paraguas para planear.', 'Combina Fuego, Hielo y Rayo para provocar reacciones en cadena.',
  'Tres cartas de una misma familia activan su bonus.', 'El Santuario guarda lo que ganas aunque caigas.', 'Los estéticos del Vestidor tienen poderes. Combínalos.',
  'La katana premia el ritmo: encadena justo al final del golpe para un corte perfecto.', 'El pollo de goma manda enemigos a rebotar contra otros. Pinball.'];
let ttipI = Math.floor(rnd() * TTIPS.length);
function refreshTitleMenu(){
  const el = id => document.getElementById(id);
  if (el('tdAch')) el('tdAch').textContent = `${ACH.filter(a => meta.ach[a.id]).length}/${ACH.length}`;
  if (el('tdEnd')) el('tdEnd').textContent = `${Object.keys(meta.endings || {}).length}/${ENDINGS.length}`;
  if (el('tdShrine')) el('tdShrine').textContent = `✦ ${meta.frag} fragmentos`;
  if (el('tdWard')){ let t = 0, g = 0; for (const c of Object.keys(COS)) for (const [i] of COS[c]){ t++; if (cosUnlocked(c, i)) g++; } el('tdWard').textContent = `${g}/${t}`; }
  if (el('tipTxt')) el('tipTxt').textContent = 'Consejo: ' + TTIPS[ttipI++ % TTIPS.length];
}
const _updateBest = updateBest;
updateBest = function(){ _updateBest(); refreshTitleMenu(); };
function focusTitle(){ setTimeout(() => { const b = document.getElementById('startBtn'); if (b && !titleScr.hidden && gameState === 'title') b.focus({ preventScroll: true }); }, 60); }
const _toTitle = toTitle;
toTitle = function(){ _toTitle(); focusTitle(); };
addEventListener('keydown', e => {
  if (gameState !== 'title' || titleScr.hidden) return;
  if (e.code !== 'ArrowDown' && e.code !== 'ArrowUp') return;
  const bs = [...titleScr.querySelectorAll('.tbtn')]; let i = bs.indexOf(document.activeElement);
  e.preventDefault(); i = i < 0 ? 0 : (i + (e.code === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length; bs[i].focus(); play('cursor');
}, true);
let gpTitlePrev = [];
function padTitle(){
  if (!(gameState === 'title' || gameState === 'over') || !shrineScr.hidden || !wardScr.hidden || !achScr.hidden) { gpTitlePrev = []; return; }
  const pads = navigator.getGamepads ? navigator.getGamepads() : null; if (!pads) return;
  let gp = null; for (const p of pads) if (p && p.connected){ gp = p; break; } if (!gp) return;
  const pr = i => gp.buttons[i] && gp.buttons[i].pressed && !gpTitlePrev[i];
  const scr = gameState === 'title' ? titleScr : overScr, bs = [...scr.querySelectorAll('button')].filter(b => b.offsetParent);
  if (pr(13) || pr(12)){ let i = bs.indexOf(document.activeElement); i = i < 0 ? 0 : (i + (pr(13) ? 1 : -1) + bs.length) % bs.length; if (bs[i]){ bs[i].focus(); play('cursor'); } }
  gpTitlePrev = gp.buttons.map(b => b.pressed);
}
const _v3Update = v3Update;
v3Update = function(dt, pdt, playing){ _v3Update(dt, pdt, playing); padTitle(); };
refreshTitleMenu(); focusTitle();

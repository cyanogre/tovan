'use strict';
/* ---------- Entrada ---------- */
const keys = {};
addEventListener('keydown', e => {
  keys[e.code] = true;
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code) && !(e.target && e.target.tagName === 'BUTTON' && e.code === 'Space')) e.preventDefault();
  if (e.repeat) return;
  if (!shrineScr.hidden){ if (e.code === 'Escape') closeShrine(); return; }
  if (!achScr.hidden){ if (e.code === 'Escape') closeAch(); return; }
  if (!wardScr.hidden){ if (e.code === 'Escape') closeWard(); return; }
  if (gameState === 'cutscene'){ if (['Enter', 'Space', 'KeyE', 'KeyJ'].includes(e.code)) advanceDlg(); if (e.code === 'Escape'){ if (cs.active) csAbort(); else { play('confirm'); endDlg(); } } return; }
  if (gameState === 'travel') return;
  if (gameState === 'upgrade' && e.code === 'KeyR'){ doReroll(); return; }
  if (gameState === 'title' && (e.code === 'Enter' || e.code === 'Space') && !(e.target && e.target.tagName === 'BUTTON')){ e.preventDefault(); startRun(); return; }
  if (gameState === 'over' && e.code === 'Enter' && !(e.target && e.target.tagName === 'BUTTON')){ e.preventDefault(); startRun(); return; }
  if (gameState === 'upgrade' && /^Digit[123]$/.test(e.code)){ chooseUpgrade(+e.code.slice(-1) - 1); return; }
  if (e.code === 'Escape' || e.code === 'KeyP'){ togglePause(); return; }
  if (gameState !== 'play') return;
  if (e.code === 'Space') doJump();
  if (e.code === 'KeyJ') doAttack();
  if (e.code === 'KeyK' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') doRoll();
  if (e.code === 'KeyL') doSpecial();
  if (e.code === 'KeyQ' && state === 'normal'){ waveT = 1.8; noteWave(); }
});
addEventListener('keyup', e => { keys[e.code] = false; });
addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (gameState === 'play') togglePause(); });

let camYaw = 0.55, camPitch = 0.55, camDist = 7, dragging = false, dragId = null, lx = 0, ly = 0, downX = 0, downY = 0, downT = 0;
canvas.addEventListener('pointerdown', e => {
  dragging = true; dragId = e.pointerId; lx = downX = e.clientX; ly = downY = e.clientY; downT = performance.now();
  canvas.setPointerCapture(e.pointerId); canvas.classList.add('drag');
});
canvas.addEventListener('pointermove', e => {
  if (!dragging || e.pointerId !== dragId) return;
  camYaw -= (e.clientX - lx) * 0.006;
  camPitch = Math.min(1.1, Math.max(0.12, camPitch + (e.clientY - ly) * 0.004));
  lx = e.clientX; ly = e.clientY;
});
const endDrag = e => {
  if (e.pointerId !== dragId) return;
  if (e.type === 'pointerup' && e.pointerType === 'mouse' && e.button === 0 &&
      Math.hypot(e.clientX - downX, e.clientY - downY) < 6 && performance.now() - downT < 300){ if (gameState === 'cutscene') advanceDlg(); else doAttack(); }
  dragging = false; dragId = null; canvas.classList.remove('drag');
};
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('contextmenu', e => { e.preventDefault(); doSpecial(); });
canvas.addEventListener('wheel', e => { e.preventDefault(); camDist = Math.min(10, Math.max(4, camDist + e.deltaY * 0.004)); }, { passive: false });

const joyEl = document.getElementById('joy'), knob = document.getElementById('knob');
const joy = { x: 0, y: 0, m: 0, id: null };
function joyMove(e){
  const r = joyEl.getBoundingClientRect(), R = r.width / 2;
  let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
  const d = Math.hypot(dx, dy), max = R - 10;
  if (d > max){ dx *= max / d; dy *= max / d; }
  joy.x = dx / max; joy.y = dy / max; joy.m = Math.min(1, d / max);
  knob.style.transform = `translate(${dx}px,${dy}px)`;
}
joyEl.addEventListener('pointerdown', e => { joy.id = e.pointerId; joyEl.setPointerCapture(e.pointerId); joyMove(e); });
joyEl.addEventListener('pointermove', e => { if (e.pointerId === joy.id) joyMove(e); });
const joyEnd = e => { if (e.pointerId === joy.id){ joy.id = null; joy.x = joy.y = joy.m = 0; knob.style.transform = ''; } };
joyEl.addEventListener('pointerup', joyEnd); joyEl.addEventListener('pointercancel', joyEnd);
document.querySelectorAll('#pad button').forEach(b => {
  b.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    if (b.dataset.act === 'attack') touchAtkHeld = true; if (b.dataset.act === 'jump') touchJumpHeld = true;
    ({ attack: doAttack, jump: doJump, roll: doRoll, special: doSpecial })[b.dataset.act]();
  });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, () => { if (b.dataset.act === 'attack') touchAtkHeld = false; if (b.dataset.act === 'jump') touchJumpHeld = false; });
});

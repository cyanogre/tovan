'use strict';
/* ---------- Mando ---------- */
let gpPrev = [], gpActive = false;
function pollPad(){ gpAtkHeld = false;
  const pads = navigator.getGamepads ? navigator.getGamepads() : null; if (!pads) return;
  let gp = null; for (const p of pads) if (p && p.connected){ gp = p; break; } if (!gp) return;
  const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0, m = Math.hypot(ax, ay);
  if (joy.id === null){ if (m > 0.2){ joy.x = ax; joy.y = ay; joy.m = Math.min(1, m); gpActive = true; } else if (gpActive){ joy.x = joy.y = joy.m = 0; gpActive = false; } }
  const cx = gp.axes[2] || 0, cy = gp.axes[3] || 0;
  if (Math.abs(cx) > 0.2) camYaw -= cx * 0.045;
  if (Math.abs(cy) > 0.2) camPitch = Math.min(1.1, Math.max(0.12, camPitch + cy * 0.02));
  const pressed = i => gp.buttons[i] && gp.buttons[i].pressed && !gpPrev[i];
  gpAtkHeld = !!(gp.buttons[2] && gp.buttons[2].pressed); gpJumpHeld = !!(gp.buttons[0] && gp.buttons[0].pressed);
  if (gameState === 'play'){
    if (pressed(2)) doAttack(); if (pressed(0)) doJump(); if (pressed(1) || pressed(5) || pressed(7)) doRoll(); if (pressed(3) || pressed(4) || pressed(6)) doSpecial();
    if (pressed(9)) togglePause();
  } else if (gameState === 'paused'){ if (pressed(9) || pressed(1)) togglePause(); }
  else if (gameState === 'cutscene'){ if (pressed(0) || pressed(2)) advanceDlg(); if (pressed(9)){ if (cs.active) csAbort(); else endDlg(); } }
  else if ((gameState === 'title' || gameState === 'over') && shrineScr.hidden && achScr.hidden && wardScr.hidden && document.getElementById('endScr').hidden && (pressed(0) || pressed(9))){ const ae = document.activeElement; if (pressed(0) && ae && ae.tagName === 'BUTTON' && ae.offsetParent) ae.click(); else startRun(); }
  else if (gameState === 'upgrade'){
    const bs = [...cardsEl.querySelectorAll('button')], cur = bs.indexOf(document.activeElement);
    if (pressed(15) || pressed(13)){ bs[(cur + 1) % bs.length].focus(); play('cursor'); }
    if (pressed(14) || pressed(12)){ bs[(cur - 1 + bs.length) % bs.length].focus(); play('cursor'); }
    if (pressed(0) && cur >= 0) chooseUpgrade(cur);
    if (pressed(3)) doReroll();
  }
  gpPrev = gp.buttons.map(b => b.pressed);
}

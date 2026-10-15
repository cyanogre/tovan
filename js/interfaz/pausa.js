'use strict';
/* ---------- Pausa con pestañas ---------- */
let pauseTab = 'build';
const PTABS = [['build', '🎒 Build'], ['moves', '📜 Movimientos'], ['syn', '⚗️ Sinergias'], ['ctrl', '🎮 Controles']];
function ctrlHTML(){ return `<div class="moves"><b>Mover</b><span>WASD / flechas / stick</span><b>Atacar</b><span>J o clic · mantén para cargar</span><b>Rodar</b><span>K o Shift</span><b>Saltar</b><span>Espacio${curW() === 'umbrella' ? ' · mantén en el aire para planear' : ''}</span><b>Especial</b><span>L o clic derecho</span><b>Pausa</b><span>Esc o P · Q/E cambian de pestaña</span></div>`; }
function renderPauseTabs(){
  const el = document.getElementById('pauseBuild');
  const body = pauseTab === 'build' ? buildHTML() : pauseTab === 'moves' ? movesHTML() : pauseTab === 'syn' ? synCodexHTML() : ctrlHTML();
  el.innerHTML = `<div class="ptabs">${PTABS.map(([k, n]) => `<button class="win ptab${k === pauseTab ? ' on' : ''}" data-k="${k}">${n}</button>`).join('')}</div><div class="pbody">${body}</div>`;
  el.querySelectorAll('.ptab').forEach(b => b.addEventListener('click', () => { pauseTab = b.dataset.k; renderPauseTabs(); play('cursor'); }));
}
const _movesHTML = movesHTML;
movesHTML = function(){
  const W = WSTYLE[curW()];
  return `<h3 class="synh">${cosName('weapon', curW())} · estilo ${W.style}</h3><div class="moves"><b>Combo</b><span>${W.combo}</span><b>Estilo</b><span>${W.extra}</span></div>` + _movesHTML();
};
addEventListener('keydown', e => {
  if (!wardScr.hidden){
    if (e.code === 'ArrowRight' || e.code === 'KeyD'){ e.preventDefault(); wardMove(1, 0); }
    else if (e.code === 'ArrowLeft' || e.code === 'KeyA'){ e.preventDefault(); wardMove(-1, 0); }
    else if (e.code === 'ArrowDown' || e.code === 'KeyS'){ e.preventDefault(); wardMove(0, 1); }
    else if (e.code === 'ArrowUp' || e.code === 'KeyW'){ e.preventDefault(); wardMove(0, -1); }
    else if (e.code === 'KeyE' || e.code === 'PageDown'){ wardCatStep(1); }
    else if (e.code === 'KeyQ' || e.code === 'PageUp'){ wardCatStep(-1); }
    return;
  }
  if (gameState === 'paused' && (e.code === 'KeyE' || e.code === 'KeyQ' || e.code === 'Tab')){ e.preventDefault();
    const i = PTABS.findIndex(t => t[0] === pauseTab); pauseTab = PTABS[(i + (e.code === 'KeyQ' ? -1 : 1) + PTABS.length) % PTABS.length][0]; renderPauseTabs(); play('cursor'); }
  if (e.code === 'KeyJ' && gameState === 'play' && !e.repeat) notePerfectInput();
}, true);
let gpWardPrev = [];
function padMenus(){
  const pads = navigator.getGamepads ? navigator.getGamepads() : null; if (!pads) return;
  let gp = null; for (const p of pads) if (p && p.connected){ gp = p; break; } if (!gp) return;
  const pr = i => gp.buttons[i] && gp.buttons[i].pressed && !gpWardPrev[i];
  if (!wardScr.hidden){
    if (pr(15)) wardMove(1, 0); if (pr(14)) wardMove(-1, 0); if (pr(13)) wardMove(0, 1); if (pr(12)) wardMove(0, -1);
    if (pr(5)) wardCatStep(1); if (pr(4)) wardCatStep(-1); if (pr(0) && document.activeElement && document.activeElement.click) document.activeElement.click(); if (pr(1)) closeWard();
  } else if (gameState === 'paused'){ if (pr(5) || pr(4)){ const i = PTABS.findIndex(t => t[0] === pauseTab); pauseTab = PTABS[(i + (pr(4) ? -1 : 1) + PTABS.length) % PTABS.length][0]; renderPauseTabs(); play('cursor'); } }
  if (gameState === 'play' && pr(2)) notePerfectInput();
  gpWardPrev = gp.buttons.map(b => b.pressed);
}

/* ---------- Bucle v3 ---------- */
function v3Update(dt, pdt, playing){
  cleanupTick(dt, playing);
  if (playing) weaponTick(pdt); else umbGlide = 0;
  padMenus();
}

Object.assign(SFX, {
  squeak:   () => { tone({ type: 'square', f0: 900, f1: 1400, dur: 0.08, vol: 0.07, rv: 0.1 }); tone({ type: 'square', f0: 1400, f1: 700, dur: 0.1, vol: 0.06, when: 0.07, rv: 0.1 }); },
  clonk:    () => { tone({ type: 'triangle', f0: 520, f1: 480, dur: 0.6, vol: 0.14, rv: 0.6 }); tone({ type: 'sine', f0: 1310, dur: 0.4, vol: 0.06, rv: 0.6 }); },
  applause: () => { for (let i = 0; i < 18; i++) noise({ dur: 0.05, vol: 0.08 + rnd() * 0.06, f0: 1500 + rnd() * 2500, q: 2, when: i * 0.05 + rnd() * 0.03, rv: 0.3 }); },
  bossCard: () => { tone({ type: 'sawtooth', f0: 70, f1: 45, dur: 0.9, vol: 0.18, rv: 0.6 }); noise({ dur: 0.5, vol: 0.25, f0: 300, f1: 80, type: 'lowpass', q: 0.7, rv: 0.5 });
                    tone({ type: 'square', f0: NOTE(50), dur: 0.5, vol: 0.06, when: 0.05, rv: 0.6 }); tone({ type: 'square', f0: NOTE(57), dur: 0.6, vol: 0.05, when: 0.25, rv: 0.6 }); }
});

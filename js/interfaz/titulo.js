'use strict';
/* ---------- Pantalla de título y fin de partida: botones y arranque ---------- */
applyCosmetics(false);
document.getElementById('shrineBtn').addEventListener('click', () => openShrine('title'));
document.getElementById('shrineBtn2').addEventListener('click', () => openShrine('over'));
document.getElementById('shrineBack').addEventListener('click', closeShrine);
updateBest();
document.getElementById('startBtn').addEventListener('click', startRun);
let forceIntro = false;
document.getElementById('introBtn').addEventListener('click', () => { forceIntro = true; startRun(); });
setSong('title');
document.getElementById('retryBtn').addEventListener('click', startRun);
document.getElementById('menuBtn').addEventListener('click', toTitle);
document.getElementById('resumeBtn').addEventListener('click', togglePause);
document.getElementById('quitBtn').addEventListener('click', () => { pauseScr.hidden = true; player.hp = 0; gameState = 'play'; die(); });
waveBox.addEventListener('click', togglePause);

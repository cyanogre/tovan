'use strict';
/* ===== Voz de Lumen: el doblaje (mp3 de assets/audio/lumen, voz de Sara Martín generada con ElevenLabs) ===== */
// Cada frase es el FNV-1a de 32 bits de su texto tal como sale en pantalla (ya pasado por tx13).
// VOCES (js/generado/voces.js, lo escribe herramientas/voces.py) dice qué frases tienen voz y cuánto duran;
// lo que no está ahí sigue con el «bla bla» de siempre. Suena si están activados los efectos.
const VOZ_DIR = AUDIO_DIR + 'lumen/';
const VOZ = { a: null, on: false, cache: {}, duck: 1 };
function vozId(t){ let h = 0x811c9dc5; for (let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
const vozTx = t => typeof tx13 === 'function' ? tx13(t) : t;
function vozEl(id){
  if (!VOZ.cache[id]){ const a = document.createElement('audio'); a.preload = 'auto'; try { a.src = VOZ_DIR + id + '.mp3'; } catch (err) {}
    a.addEventListener('ended', () => { if (VOZ.a === a){ VOZ.on = false; applyMusVol(); } });
    a.addEventListener('error', () => { if (VOZ.a === a){ VOZ.on = false; VOZ.a = null; applyMusVol(); } });
    VOZ.cache[id] = a; }
  return VOZ.cache[id];
}
function vozCalla(){ if (VOZ.a){ try { VOZ.a.pause(); } catch (err) {} } VOZ.a = null; if (VOZ.on){ VOZ.on = false; applyMusVol(); } }
// Devuelve la duración si la frase tiene voz (0 si no)
function vozDice(t){
  vozCalla(); if (typeof t !== 'string' || !sfxOn) return 0;
  const id = vozId(t), d = VOCES[id]; if (!d) return 0;
  const a = vozEl(id); VOZ.a = a; VOZ.on = true; a.volume = 1;
  try { a.currentTime = 0; } catch (err) {}
  let pr = null; try { pr = a.play(); } catch (err) { VOZ.on = false; VOZ.a = null; return 0; }
  if (pr && pr.catch) pr.catch(() => { if (VOZ.a === a){ VOZ.on = false; VOZ.a = null; applyMusVol(); } });
  applyMusVol(); return d;
}
// Se precargan las frases de Lumen de un diálogo al empezar (en la web tardan un poco en llegar)
function vozPrecarga(lines){ if (!Array.isArray(lines)) return; for (const l of lines) if (Array.isArray(l) && typeof l[0] === 'string' && l[0].startsWith('lumen')){ const id = vozId(vozTx(l[1])); if (VOCES[id]) vozEl(id); } }

/* ---------- Diálogos ---------- */
const _sayVoz = say; say = function(lines, done, keep){ vozPrecarga(lines); return _sayVoz(lines, done, keep); };
const _showDlgLineVoz = showDlgLine;
showDlgLine = function(){ _showDlgLineVoz(); const l = dlg.lines && dlg.lines[dlg.i]; if (l && l[0].startsWith('lumen')) vozDice(l[1]); else vozCalla(); };
const _endDlgVoz = endDlg; endDlg = function(){ vozCalla(); return _endDlgVoz(); };
// Mientras habla, fuera el «bla bla» (si el mp3 falla, vuelve)
const _playVoz = play; play = function(name){ if (name === 'talkL' && VOZ.on) return; return _playVoz(name); };

/* ---------- Comentarios ---------- */
// bark() se salta el comentario si aún se ve otro: solo habla si de verdad ha salido el suyo, y el globo dura lo que la frase
const _barkVoz = bark;
bark = function(text){
  _barkVoz(text); const t = vozTx(text);
  if (barkT === 3.4 && barkText.textContent === t){ const d = vozDice(t); if (d){ barkT = Math.max(barkT, d + 0.9); barkHabla = 0; } }
};
const _updateBarkVoz = updateBark; updateBark = function(dt){ if (gameState === 'paused' && VOZ.on) return; _updateBarkVoz(dt); };

/* ---------- Pausa, silencio y música ---------- */
// La música baja un poco mientras habla; en pausa se calla (y sigue al volver); sin efectos, muda
const _applyMusVolVoz = applyMusVol;
applyMusVol = function(){ _applyMusVolVoz(); if (actx && VOZ.on && musOn && song && gameState !== 'paused') musBus.gain.setTargetAtTime(0.42 * 0.55, actx.currentTime, 0.12); };
const _updateTracksVoz = updateTracks;
updateTracks = function(dt){
  _updateTracksVoz(dt);
  const a = VOZ.a; if (!a) return;
  if (gameState === 'paused'){ if (!a.paused) try { a.pause(); } catch (err) {} }
  else if (a.paused && VOZ.on){ const pr = a.play(); if (pr && pr.catch) pr.catch(() => {}); }
  a.volume = sfxOn ? 1 : 0;
  if (curTrack && VOZ.on) curTrack.a.volume *= 0.6;
};
const _togglePauseVoz = togglePause; togglePause = function(){ const r = _togglePauseVoz.apply(this, arguments); applyMusVol(); return r; };
const _toTitleVoz = toTitle; toTitle = function(){ vozCalla(); return _toTitleVoz.apply(this, arguments); };

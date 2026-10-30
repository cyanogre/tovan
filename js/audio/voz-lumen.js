'use strict';
/* ===== Voz de Lumen: el doblaje (mp3 de assets/audio/lumen, voz de Sara Martín generada con ElevenLabs) ===== */
// Cada frase es el FNV-1a de 32 bits de su texto tal como sale en pantalla (ya pasado por tx13).
// VOCES (js/generado/voces.js, lo escribe herramientas/voces.py) dice qué frases tienen voz y cuánto duran;
// lo que no está ahí sigue con el «bla bla» de siempre. Suena si están activados los efectos.
// En la web (http/https) la frase se descodifica y suena por WebAudio, por el mismo mezclador que la música (master:
// compresor y volumen juntos) y sin el permiso de reproducción de cada <audio> en el móvil. Con file:// (Chrome no deja
// leer los mp3 sueltos) va con un <audio> con el volumen bajado. VOZ_VOL sale de medirlo: los mp3 rondan −19 dB de media
// y la música de batalla −43 dB; antes la voz iba a volumen 1, fuera del mezclador, y tapaba todo.
const VOZ_DIR = AUDIO_DIR + 'lumen/', VOZ_VOL = 0.16, VOZ_WEB = /^https?:$/.test(location.protocol), VOZ_MAX = 14;
const VOZ = { a: null, on: false, cache: {}, buf: new Map(), pide: new Map(), src: null, g: null, b: null, t0: 0, off: 0, ficha: 0, parada: null, ritmo: 0, deBark: false };
function vozId(t){ let h = 0x811c9dc5; for (let i = 0; i < t.length; i++){ h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ('0000000' + h.toString(16)).slice(-8); }
const vozTx = t => typeof tx13 === 'function' ? tx13(t) : t;
/* ---------- WebAudio (en la web) ---------- */
function vozBuffer(id){   // promesa del AudioBuffer (se guardan las últimas VOZ_MAX)
  if (VOZ.buf.has(id)){ const b = VOZ.buf.get(id); VOZ.buf.delete(id); VOZ.buf.set(id, b); return Promise.resolve(b); }
  if (VOZ.pide.has(id)) return VOZ.pide.get(id);
  const p = fetch(VOZ_DIR + id + '.mp3').then(r => r.ok ? r.arrayBuffer() : null).then(ab => ab && actx ? new Promise((ok, mal) => actx.decodeAudioData(ab, ok, mal)) : null)
    .then(b => { VOZ.pide.delete(id); if (b){ VOZ.buf.set(id, b); while (VOZ.buf.size > VOZ_MAX) VOZ.buf.delete(VOZ.buf.keys().next().value); } return b; })
    .catch(() => { VOZ.pide.delete(id); return null; });
  VOZ.pide.set(id, p); return p;
}
function vozArranca(b, off){
  const src = actx.createBufferSource(), g = actx.createGain(); src.buffer = b; g.gain.value = sfxOn ? VOZ_VOL : 0; src.connect(g); g.connect(master);
  src.onended = () => { if (VOZ.src === src){ VOZ.src = null; VOZ.on = false; applyMusVol(); } };
  src.start(0, off); VOZ.src = src; VOZ.g = g; VOZ.b = b; VOZ.t0 = actx.currentTime - off;
}
function vozSuelta(fundido){   // para la fuente con un fundido muy corto (sin chasquido)
  const s = VOZ.src, g = VOZ.g; VOZ.src = null; if (!s) return; s.onended = null;
  try { if (fundido && actx){ g.gain.setTargetAtTime(0, actx.currentTime, 0.03); s.stop(actx.currentTime + 0.15); } else s.stop(); } catch (err) {}
}
/* ---------- <audio> (con file://) ---------- */
function vozEl(id){
  if (!VOZ.cache[id]){ const a = document.createElement('audio'); a.preload = 'auto'; try { a.src = VOZ_DIR + id + '.mp3'; } catch (err) {}
    a.addEventListener('ended', () => { if (VOZ.a === a){ VOZ.on = false; applyMusVol(); } });
    a.addEventListener('error', () => { if (VOZ.a === a){ VOZ.on = false; VOZ.a = null; applyMusVol(); } });
    VOZ.cache[id] = a; }
  return VOZ.cache[id];
}
function vozCalla(){ VOZ.ficha++; vozSuelta(true); VOZ.parada = null; VOZ.ritmo = 0; VOZ.deBark = false; if (VOZ.a){ try { VOZ.a.pause(); } catch (err) {} } VOZ.a = null; if (VOZ.on){ VOZ.on = false; applyMusVol(); } }
// Devuelve la duración si la frase tiene voz (0 si no)
function vozDice(t){
  vozCalla(); if (typeof t !== 'string' || !sfxOn) return 0;
  const id = vozId(t), d = VOCES[id]; if (!d) return 0;
  if (VOZ_WEB && actx){ const f = VOZ.ficha; VOZ.on = true;
    vozBuffer(id).then(b => { if (f !== VOZ.ficha) return; if (!b){ VOZ.on = false; applyMusVol(); return; }
      if (gameState === 'paused') VOZ.parada = { b, off: 0 }; else vozArranca(b, 0); });
    applyMusVol(); return d; }
  const a = vozEl(id); VOZ.a = a; VOZ.on = true; a.volume = VOZ_VOL;
  try { a.currentTime = 0; } catch (err) {}
  let pr = null; try { pr = a.play(); } catch (err) { VOZ.on = false; VOZ.a = null; return 0; }
  if (pr && pr.catch) pr.catch(() => { if (VOZ.a === a){ VOZ.on = false; VOZ.a = null; applyMusVol(); } });
  applyMusVol(); return d;
}
// Se precargan las frases de Lumen de un diálogo al empezar (en la web tardan un poco en llegar)
function vozPrecarga(lines){ if (!Array.isArray(lines)) return; let n = 0;
  for (const l of lines) if (Array.isArray(l) && typeof l[0] === 'string' && l[0].startsWith('lumen')){ const id = vozId(vozTx(l[1])); if (!VOCES[id]) continue;
    if (VOZ_WEB){ if (actx && n++ < VOZ_MAX - 2) vozBuffer(id); } else vozEl(id); } }

/* ---------- Diálogos ---------- */
const _sayVoz = say; say = function(lines, done, keep){ vozPrecarga(lines); return _sayVoz(lines, done, keep); };
// El texto se escribe al ritmo de la voz (acaba al 85 % de la frase): así el toque para seguir llega cuando ya ha hablado
// y no la corta a media frase (en el móvil se tocaba en cuanto salía el texto, que iba mucho más deprisa).
const _showDlgLineVoz = showDlgLine;
showDlgLine = function(){ _showDlgLineVoz(); const l = dlg.lines && dlg.lines[dlg.i];
  if (l && l[0].startsWith('lumen')){ const d = vozDice(l[1]); VOZ.ritmo = d ? clamp(l[1].length / (d * 0.85), 8, 42) : 0; } else vozCalla(); };
const _updateDlgVoz = updateDlg; updateDlg = function(dt){ return _updateDlgVoz(VOZ.ritmo && VOZ.on ? dt * VOZ.ritmo / 42 : dt); };
const _endDlgVoz = endDlg; endDlg = function(){ vozCalla(); return _endDlgVoz(); };
// Mientras habla, fuera el «bla bla» (si el mp3 falla, vuelve)
const _playVoz = play; play = function(name){ if (name === 'talkL' && VOZ.on) return; return _playVoz(name); };

/* ---------- Comentarios ---------- */
// bark() se salta el comentario si aún se ve otro: solo habla si de verdad ha salido el suyo, y el globo dura lo que la frase
const _barkVoz = bark;
bark = function(text){
  _barkVoz(text); const t = vozTx(text);
  if (barkT === 3.4 && barkText.textContent === t){ const d = vozDice(t); if (d){ barkT = Math.max(barkT, d + 0.9); barkHabla = 0; VOZ.deBark = true; } }
};
// Mientras suena la voz de un comentario, el globo no se acaba: así ningún comentario nuevo (al matar, al hacer combo…) la corta.
// En la web la frase tarda un poco en cargarse y el globo empezaba a contar antes de que sonara: caducaba con la voz aún hablando.
const _updateBarkVoz = updateBark; updateBark = function(dt){ if (gameState === 'paused' && VOZ.on) return; if (VOZ.on && VOZ.deBark) barkT = Math.max(barkT, 0.75); _updateBarkVoz(dt); };

/* ---------- Pausa, silencio y música ---------- */
// La música baja un poco mientras habla; en pausa se calla (y sigue al volver); sin efectos, muda
const _applyMusVolVoz = applyMusVol;
applyMusVol = function(){ _applyMusVolVoz(); if (actx && VOZ.on && musOn && song && gameState !== 'paused') musBus.gain.setTargetAtTime(0.42 * 0.55, actx.currentTime, 0.12); };
const _updateTracksVoz = updateTracks;
updateTracks = function(dt){
  _updateTracksVoz(dt);
  if (VOZ.src || VOZ.parada){   // WebAudio: en pausa se para guardando por dónde iba
    if (gameState === 'paused' && VOZ.src){ const off = actx.currentTime - VOZ.t0, b = VOZ.b; vozSuelta(false); VOZ.parada = { b, off }; }
    else if (gameState !== 'paused' && VOZ.parada){ const P = VOZ.parada; VOZ.parada = null; if (P.off < P.b.duration - 0.05) vozArranca(P.b, P.off); else { VOZ.on = false; applyMusVol(); } }
    if (VOZ.g) VOZ.g.gain.value = sfxOn ? VOZ_VOL : 0;
  }
  const a = VOZ.a; if (!a){ if (curTrack && VOZ.on) curTrack.a.volume *= 0.6; return; }
  if (gameState === 'paused'){ if (!a.paused) try { a.pause(); } catch (err) {} }
  else if (a.paused && VOZ.on){ const pr = a.play(); if (pr && pr.catch) pr.catch(() => {}); }
  a.volume = sfxOn ? VOZ_VOL : 0;
  if (curTrack && VOZ.on) curTrack.a.volume *= 0.6;
};
const _togglePauseVoz = togglePause; togglePause = function(){ const r = _togglePauseVoz.apply(this, arguments); applyMusVol(); return r; };
const _toTitleVoz = toTitle; toTitle = function(){ vozCalla(); return _toTitleVoz.apply(this, arguments); };

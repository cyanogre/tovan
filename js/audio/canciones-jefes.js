'use strict';
/* ---------- Canciones de jefes (mp3 en assets/audio/, o cargados desde Opciones) ---------- */
const AUDIO_DIR = 'assets/audio/';
const BOSS_FILES = { boss: 'guardian', dragon: 'ryujin', skeleton: 'gashadokuro', star: 'mister-confianza', teapot: 'tetera', error: 'error404', sixeyes: 'seis-ojos', finalcat: 'epic' };
const tracks = {};
function track(name){
  if (!tracks[name]){ const a = document.createElement('audio'); a.loop = true; a.preload = 'auto'; const t = { a, ok: false, label: name + '.mp3' };
    a.addEventListener('canplaythrough', () => { t.ok = true; }); a.addEventListener('error', () => { t.ok = false; });
    try { a.src = AUDIO_DIR + name + '.mp3'; } catch (err) {} tracks[name] = t; }
  return tracks[name];
}
Object.values(BOSS_FILES).forEach(track);
let curTrack = null, fadeTrack = null, fadeT = 0;
function playBossTrack(type, synthSong){
  stopBossTrack(true);
  const t = track(BOSS_FILES[type] || type);
  if (t.ok || t.a.readyState >= 2){
    setSong(null); applyMusVol(); t.a.currentTime = 0; t.a.volume = musOn ? 0.85 : 0;
    let pr = null; try { pr = t.a.play(); } catch (err) {}
    if (pr && pr.then){ curTrack = t; pr.catch(() => { if (curTrack === t) curTrack = null; setSong(synthSong); applyMusVol(); }); return; }
  }
  setSong(synthSong); applyMusVol();
}
function stopBossTrack(now){
  if (!curTrack) return;
  if (now){ try { curTrack.a.pause(); } catch (err) {} }
  else { if (fadeTrack) try { fadeTrack.a.pause(); } catch (err) {} fadeTrack = curTrack; fadeT = 1.5; }
  curTrack = null;
}
function updateTracks(dt){
  if (curTrack) curTrack.a.volume = musOn ? (gameState === 'paused' ? 0.25 : 0.85) : 0;
  if (fadeTrack){ fadeT -= dt; fadeTrack.a.volume = Math.max(0, fadeT / 1.5) * (musOn ? 0.85 : 0); if (fadeT <= 0){ try { fadeTrack.a.pause(); } catch (err) {} fadeTrack = null; } }
}
const tracksOk = () => Object.values(BOSS_FILES).filter(n => tracks[n] && tracks[n].ok).length;
const trackInput = document.createElement('input'); trackInput.type = 'file'; trackInput.accept = 'audio/*'; trackInput.multiple = true; trackInput.style.display = 'none'; document.body.appendChild(trackInput);
trackInput.addEventListener('change', () => {
  const names = Object.values(BOSS_FILES), used = [];
  for (const f of trackInput.files || []){ const base = f.name.toLowerCase().replace(/\.[a-z0-9]+$/, '');
    if (!names.includes(base)) continue; const t = track(base); t.a.src = URL.createObjectURL(f); t.ok = true; t.label = f.name; used.push(f.name); }
  banner(used.length ? `Canciones cargadas: ${used.length}<small>${used.join(', ')}</small>` : 'Ningún archivo coincide<small>Revisa los nombres en Opciones</small>', 1.8);
  trackInput.value = ''; refreshMenu();
});
// compatibilidad con el código del jefe final
const startEpic = () => playBossTrack('finalcat', 'finalboss');
const stopEpic = () => stopBossTrack(false);
Object.assign(SONGS, { finalboss: { bpm: 156, style: 'boss', bars: [[45, 48, 52], [41, 45, 48], [43, 47, 50], [40, 44, 47]],
  mel: [69,0,72,0,76,0,74,0,72,0,71,0,72,0,0,0, 69,0,72,0,77,0,76,0,74,0,72,0,71,0,0,0, 72,0,76,0,79,0,77,0,76,0,74,0,76,0,0,0, 81,0,0,0,79,0,0,0,76,0,0,0,80,0,0,0] },
  finalcalm: { bpm: 70, style: 'pad', bars: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]] } });

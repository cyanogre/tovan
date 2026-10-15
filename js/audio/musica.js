'use strict';
// Música: secuenciador por pasos con temas originales
const SONGS = {
  title:  { bpm: 76,  style: 'pad',   bars: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]] },
  battle: { bpm: 132, style: 'drive', bars: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]],
            mel: [76,0,0,74,0,72,0,0,69,0,0,72,0,74,0,0, 72,0,0,69,0,65,0,0,69,0,0,72,0,77,0,0, 74,0,0,71,0,67,0,0,71,0,74,0,79,0,77,0, 76,0,0,0,0,0,75,0,76,0,0,71,0,0,0,0] },
  boss:   { bpm: 150, style: 'boss',  bars: [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]],
            mel: [74,0,74,0,77,0,76,0,74,0,72,0,74,0,0,0, 70,0,70,0,74,0,72,0,70,0,69,0,70,0,0,0, 72,0,72,0,76,0,74,0,72,0,71,0,72,0,0,0, 73,0,0,0,76,0,0,0,81,0,0,0,79,0,76,0] }
};
let song = null, seqStep = 0, nextT = 0;
function setSong(name){ if (song === name) return; song = name; seqStep = 0; if (actx) nextT = actx.currentTime + 0.15; }
function applyMusVol(){
  if (!actx) return;
  musBus.gain.setTargetAtTime(musOn && song ? (gameState === 'paused' ? 0.12 : 0.42) : 0, actx.currentTime, 0.15);
  sfxBus.gain.setTargetAtTime(sfxOn ? 0.9 : 0, actx.currentTime, 0.05);
}
function musicTick(){
  if (!actx || !song || !musOn || gameState === 'paused') return;
  const S = SONGS[song], sd = 60 / S.bpm / 4, cycle = 16 * S.bars.length * 2;
  if (nextT < actx.currentTime) nextT = actx.currentTime + 0.05;
  while (nextT < actx.currentTime + 0.2){ scheduleStep(S, seqStep, nextT - actx.currentTime, sd); seqStep = (seqStep + 1) % cycle; nextT += sd; }
}
function scheduleStep(S, st, when, sd){
  const bar = Math.floor(st / 16) % S.bars.length, s = st % 16, ch = S.bars[bar], half = st >= 16 * S.bars.length;
  const mb = { bus: musBus };
  if (S.style === 'pad'){
    if (s === 0){ ch.forEach(n => tone({ type: 'triangle', f0: NOTE(n), dur: sd * 16, vol: 0.045, attack: 0.5, when, rv: 0.6, ...mb }));
                  tone({ type: 'sine', f0: NOTE(ch[0] - 12), dur: sd * 16, vol: 0.08, attack: 0.3, when, rv: 0.3, ...mb }); }
    if (s % 4 === 2) tone({ type: 'sine', f0: NOTE(ch[(s >> 2) % 3] + 24), dur: 0.7, vol: 0.03, when, rv: 0.9, ...mb });
    return;
  }
  const boss = S.style === 'boss';
  const bassPat = boss ? [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1] : [1,0,0,1,0,0,1,0,1,0,0,1,0,1,0,0];
  if (bassPat[s]) tone({ type: boss ? 'sawtooth' : 'triangle', f0: NOTE(ch[0] - 24 + (s % 8 === 7 ? 12 : 0)), dur: sd * 1.6, vol: boss ? 0.1 : 0.2, when, rv: 0.05, ...mb });
  const arp = [0,1,2,1, 0,1,2,3, 0,1,2,1, 0,2,1,3];
  if (s % 2 === 0 || boss){ const i = arp[s], n = i === 3 ? ch[0] + 12 : ch[i]; tone({ type: 'square', f0: NOTE(n + 12), dur: sd * 0.9, vol: 0.028, when, rv: 0.3, ...mb }); }
  if (half && S.mel){ const n = S.mel[(st % 64)]; if (n) tone({ type: boss ? 'sawtooth' : 'square', f0: NOTE(n), dur: sd * 2.6, vol: boss ? 0.035 : 0.045, attack: 0.01, when, rv: 0.45, ...mb }); }
  if (s === 0 || s === 8 || (!boss && s === 10) || (boss && (s === 4 || s === 12))) tone({ type: 'sine', f0: 150, f1: 40, dur: 0.14, vol: 0.32, when, rv: 0, ...mb });
  if (s === 4 || s === 12) noise({ dur: 0.12, vol: 0.16, f0: 1800, q: 0.7, when, rv: 0.25, ...mb });
  if (s % 2 === 1) noise({ dur: 0.03, vol: 0.05, f0: 8000, type: 'highpass', q: 0.7, when, rv: 0, ...mb });
}
['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, initAudio, { passive: true }));

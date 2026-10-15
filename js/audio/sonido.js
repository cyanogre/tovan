'use strict';
/* ---------- Sonido: todo sintetizado con WebAudio (sin archivos) ---------- */
let actx = null, master, sfxBus, musBus, noiseBuf, reverb, sfxOn = true, musOn = true;
const lastSfx = {};
try { const st = JSON.parse(localStorage.getItem('tovan-audio') || '{}'); if (st.sfx === false) sfxOn = false; if (st.mus === false) musOn = false; } catch (e) {}
function saveAudio(){ try { localStorage.setItem('tovan-audio', JSON.stringify({ sfx: sfxOn, mus: musOn })); } catch (e) {} }
function initAudio(){
  if (actx){ if (actx.state === 'suspended') actx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  try { actx = new AC(); } catch (e) { actx = null; return; }
  master = actx.createGain(); master.gain.value = 0.8;
  const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 9000;          // agudos recortados, como el chip de sonido de la época
  const comp = actx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(lp); lp.connect(comp); comp.connect(actx.destination);
  sfxBus = actx.createGain(); sfxBus.gain.value = sfxOn ? 0.9 : 0; sfxBus.connect(master);
  musBus = actx.createGain(); musBus.gain.value = 0; musBus.connect(master);
  noiseBuf = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
  const nd = noiseBuf.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  reverb = actx.createConvolver();                                                                 // reverb de sala sintética
  const len = Math.floor(actx.sampleRate * 1.3), ib = actx.createBuffer(2, len, actx.sampleRate);
  for (let ch = 0; ch < 2; ch++){ const d = ib.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
  reverb.buffer = ib; const rvG = actx.createGain(); rvG.gain.value = 0.28; reverb.connect(rvG); rvG.connect(master);
  applyMusVol();
}
function tone({ type = 'square', f0 = 440, f1 = 0, dur = 0.15, vol = 0.2, attack = 0.005, when = 0, bus, rv = 0.2 }){
  if (!actx) return;
  const t = actx.currentTime + Math.max(0, when);
  const o = actx.createOscillator(); o.type = type; o.frequency.setValueAtTime(f0, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus || sfxBus);
  if (rv){ const s = actx.createGain(); s.gain.value = rv; g.connect(s); s.connect(reverb); }
  o.start(t); o.stop(t + dur + 0.03);
}
function noise({ dur = 0.2, vol = 0.2, f0 = 2000, f1 = 0, type = 'bandpass', q = 1, when = 0, bus, rv = 0.15, attack = 0.003 }){
  if (!actx) return;
  const t = actx.currentTime + Math.max(0, when);
  const src = actx.createBufferSource(); src.buffer = noiseBuf;
  const flt = actx.createBiquadFilter(); flt.type = type; flt.Q.value = q; flt.frequency.setValueAtTime(f0, t);
  if (f1) flt.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  const g = actx.createGain(); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(flt); flt.connect(g); g.connect(bus || sfxBus);
  if (rv){ const s = actx.createGain(); s.gain.value = rv; g.connect(s); s.connect(reverb); }
  src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.03);
}
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
const seq_ = (notes, type = 'triangle', gap = 0.09, vol = 0.12, rv = 0.4) => notes.forEach(([n, d], i) => {
  const at = notes.slice(0, i).reduce((s, x) => s + (x[2] || gap), 0);
  tone({ type, f0: NOTE(n), dur: d, vol, when: at, rv });
});
const SFX = {
  swing:      () => noise({ dur: 0.16, vol: 0.26, f0: 3600, f1: 900, q: 1.3, rv: 0.08 }),
  swingBig:   () => noise({ dur: 0.26, vol: 0.32, f0: 2600, f1: 450, q: 1, rv: 0.15 }),
  hit:        () => { tone({ type: 'square', f0: 230, f1: 70, dur: 0.1, vol: 0.2, rv: 0.08 }); noise({ dur: 0.08, vol: 0.28, f0: 1800, type: 'lowpass', q: 0.5, rv: 0.05 }); },
  crit:       () => { SFX.hit(); tone({ type: 'triangle', f0: 1320, dur: 0.25, vol: 0.13, when: 0.02, rv: 0.45 }); tone({ type: 'triangle', f0: 1760, dur: 0.3, vol: 0.1, when: 0.06, rv: 0.45 }); },
  slam:       () => { tone({ type: 'sine', f0: 140, f1: 35, dur: 0.45, vol: 0.55, rv: 0.3 }); noise({ dur: 0.35, vol: 0.32, f0: 800, f1: 150, type: 'lowpass', q: 0.7, rv: 0.3 }); },
  specialCharge: () => [57, 64, 69, 72, 76, 81].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.4, vol: 0.09, when: i * 0.07, rv: 0.6 })),
  specialBoom:() => { tone({ type: 'sine', f0: 120, f1: 28, dur: 0.9, vol: 0.65, rv: 0.6 }); noise({ dur: 0.7, vol: 0.32, f0: 5000, f1: 300, rv: 0.6 }); tone({ type: 'triangle', f0: NOTE(88), dur: 0.8, vol: 0.08, when: 0.05, rv: 0.8 }); },
  jump:       () => tone({ type: 'square', f0: 260, f1: 640, dur: 0.12, vol: 0.09, rv: 0.1 }),
  land:       () => noise({ dur: 0.1, vol: 0.18, f0: 420, type: 'lowpass', rv: 0.05 }),
  roll:       () => noise({ dur: 0.28, vol: 0.2, f0: 600, f1: 2200, q: 0.8, rv: 0.1 }),
  hurt:       () => { tone({ type: 'sawtooth', f0: 420, f1: 110, dur: 0.25, vol: 0.18, rv: 0.2 }); noise({ dur: 0.12, vol: 0.24, f0: 1200, type: 'lowpass' }); },
  dodge:      () => { noise({ dur: 0.35, vol: 0.22, f0: 300, f1: 4000, q: 2, rv: 0.4 }); tone({ type: 'triangle', f0: NOTE(91), dur: 0.7, vol: 0.12, when: 0.1, rv: 0.8 }); },
  impWarn:    () => tone({ type: 'square', f0: 900, f1: 1400, dur: 0.08, vol: 0.06, rv: 0.1 }),
  sentCharge: () => tone({ type: 'sine', f0: 300, f1: 1300, dur: 0.72, vol: 0.08, rv: 0.35 }),
  shoot:      () => tone({ type: 'square', f0: 950, f1: 200, dur: 0.18, vol: 0.09, rv: 0.2 }),
  bruteWarn:  () => { tone({ type: 'sawtooth', f0: 72, f1: 55, dur: 0.85, vol: 0.16, rv: 0.2 }); tone({ type: 'sawtooth', f0: 74, f1: 56, dur: 0.85, vol: 0.12 }); },
  charge:     () => noise({ dur: 0.55, vol: 0.2, f0: 320, type: 'lowpass', rv: 0.1 }),
  wall:       () => { tone({ type: 'sine', f0: 90, f1: 40, dur: 0.3, vol: 0.4 }); noise({ dur: 0.2, vol: 0.28, f0: 600, type: 'lowpass' }); },
  roar:       () => { tone({ type: 'sawtooth', f0: 110, f1: 55, dur: 1.0, vol: 0.2, rv: 0.5 }); tone({ type: 'sawtooth', f0: 115, f1: 57, dur: 1.0, vol: 0.16, rv: 0.5 }); noise({ dur: 0.9, vol: 0.13, f0: 500, type: 'lowpass', rv: 0.4 }); },
  bossSlam:   () => { tone({ type: 'sine', f0: 100, f1: 24, dur: 0.85, vol: 0.75, rv: 0.5 }); noise({ dur: 0.6, vol: 0.38, f0: 600, f1: 100, type: 'lowpass', rv: 0.5 }); },
  die:        () => { noise({ dur: 0.25, vol: 0.22, f0: 1500, f1: 200, rv: 0.2 }); tone({ type: 'square', f0: 520, f1: 80, dur: 0.25, vol: 0.08, rv: 0.2 }); },
  bossDie:    () => { SFX.bossSlam(); seq_([[69, 0.2], [72, 0.2], [76, 0.2], [81, 0.9]], 'triangle', 0.12, 0.12, 0.7); },
  pickup:     () => seq_([[76, 0.12], [80, 0.12], [83, 0.12], [88, 0.2]], 'triangle', 0.045, 0.11, 0.3),
  meter:      () => seq_([[81, 0.2], [88, 0.2], [93, 0.3]], 'sine', 0.06, 0.08, 0.6),
  spawn:      () => tone({ type: 'sine', f0: 180, f1: 520, dur: 0.5, vol: 0.06, rv: 0.5 }),
  cursor:     () => tone({ type: 'square', f0: 1200, dur: 0.04, vol: 0.05, rv: 0 }),
  confirm:    () => { tone({ type: 'square', f0: 880, dur: 0.07, vol: 0.07 }); tone({ type: 'square', f0: 1320, dur: 0.12, vol: 0.07, when: 0.07, rv: 0.3 }); },
  buy:        () => seq_([[83, 0.08], [88, 0.25]], 'square', 0.07, 0.07, 0.3),
  waveStart:  () => { tone({ type: 'triangle', f0: NOTE(57), dur: 1.0, vol: 0.18, rv: 0.6 }); tone({ type: 'triangle', f0: NOTE(64), dur: 1.0, vol: 0.12, when: 0.12, rv: 0.6 }); tone({ type: 'sine', f0: NOTE(45), dur: 1.2, vol: 0.2, rv: 0.4 }); },
  waveClear:  () => seq_([[72, 0.1], [76, 0.1], [79, 0.1], [81, 0.18, 0.2], [79, 0.1], [84, 0.6]], 'square', 0.1, 0.07, 0.4),
  upgradeOpen:() => [0, 1, 2, 3, 4].forEach(i => tone({ type: 'sine', f0: NOTE(84 + [0, 4, 7, 11, 14][i]), dur: 0.5, vol: 0.05, when: i * 0.05, rv: 0.8 })),
  playerDeath:() => seq_([[64, 0.3], [62, 0.3], [60, 0.3], [57, 1.2]], 'triangle', 0.28, 0.13, 0.7),
  zap:        () => { noise({ dur: 0.12, vol: 0.2, f0: 6000, type: 'highpass', q: 0.8, rv: 0.2 }); tone({ type: 'square', f0: 1800, f1: 300, dur: 0.1, vol: 0.06, rv: 0.2 }); },
  boom:       () => { tone({ type: 'sine', f0: 120, f1: 30, dur: 0.5, vol: 0.5, rv: 0.4 }); noise({ dur: 0.45, vol: 0.34, f0: 1200, f1: 120, type: 'lowpass', q: 0.7, rv: 0.4 }); },
  steam:      () => { noise({ dur: 0.6, vol: 0.26, f0: 5000, f1: 2500, type: 'highpass', q: 0.5, rv: 0.4 }); tone({ type: 'sine', f0: 200, f1: 60, dur: 0.3, vol: 0.3, rv: 0.2 }); },
  shatter:    () => { for (let i = 0; i < 5; i++) tone({ type: 'triangle', f0: 1800 + Math.random() * 2200, dur: 0.18, vol: 0.06, when: i * 0.025, rv: 0.5 }); noise({ dur: 0.25, vol: 0.25, f0: 4000, type: 'highpass', rv: 0.3 }); },
  freeze:     () => { tone({ type: 'sine', f0: 2400, f1: 900, dur: 0.35, vol: 0.07, rv: 0.6 }); noise({ dur: 0.2, vol: 0.12, f0: 7000, type: 'highpass', rv: 0.3 }); },
  ignite:     () => noise({ dur: 0.3, vol: 0.14, f0: 700, f1: 2200, q: 0.8, rv: 0.1 }),
  tier:       () => seq_([[72, 0.1], [79, 0.1], [84, 0.1], [88, 0.3]], 'square', 0.06, 0.07, 0.5),
  setBonus:   () => { [60, 64, 67, 72, 76].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 1.0, vol: 0.08, when: i * 0.04, rv: 0.7 })); tone({ type: 'sine', f0: NOTE(48), dur: 1.2, vol: 0.2, rv: 0.5 }); },
  discover:   () => seq_([[81, 0.3], [76, 0.3], [84, 0.6]], 'sine', 0.16, 0.09, 0.8),
  legend:     () => [0, 1, 2, 3, 4, 5, 6].forEach(i => tone({ type: 'triangle', f0: NOTE(79 + [0, 4, 7, 12, 16, 19, 24][i]), dur: 0.4, vol: 0.05, when: i * 0.04, rv: 0.8 })),
  revive:     () => seq_([[60, 0.15], [64, 0.15], [67, 0.15], [72, 0.6]], 'triangle', 0.08, 0.13, 0.7)
};
function play(name){
  if ((name === 'hit' || name === 'crit') && meta.cos && meta.cos.sound !== 'normal') name = meta.cos.sound + (name === 'crit' ? 'C' : '');
  if (!actx || !sfxOn || !SFX[name]) return;
  const t = actx.currentTime; if (lastSfx[name] && t - lastSfx[name] < 0.035) return;
  lastSfx[name] = t; try { SFX[name](); } catch (e) {}
}

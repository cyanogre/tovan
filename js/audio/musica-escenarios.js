'use strict';
/* ---------- Música y sonidos nuevos ---------- */
Object.assign(SONGS, {
  sakura: { bpm: 104, style: 'wa', bars: [[57, 60, 64], [53, 57, 60], [52, 57, 59], [57, 59, 64]],
            mel: [69,0,0,71,0,72,0,0,76,0,0,77,0,76,0,0, 72,0,0,0,71,0,69,0,0,0,64,0,0,0,0,0, 69,0,0,71,0,72,0,0,71,0,69,0,65,0,64,0, 69,0,0,0,0,0,0,0,64,0,65,0,69,0,0,0] },
  dragon: { bpm: 146, style: 'wa', heavy: true, bars: [[50, 53, 57], [46, 50, 53], [45, 50, 52], [50, 52, 57]],
            mel: [74,0,74,0,76,0,77,0,81,0,82,0,81,0,77,0, 76,0,0,0,74,0,70,0,69,0,0,0,0,0,0,0, 74,0,77,0,76,0,74,0,70,0,69,0,70,0,74,0, 76,0,0,0,0,0,74,0,74,0,0,0,0,0,0,0] },
  snow:   { bpm: 124, style: 'drive', bars: [[52, 55, 59], [48, 52, 55], [50, 54, 57], [47, 50, 54]],
            mel: [76,0,0,74,0,71,0,0,67,0,0,71,0,74,0,0, 72,0,0,71,0,67,0,0,64,0,0,67,0,72,0,0, 74,0,0,72,0,69,0,0,66,0,69,0,74,0,72,0, 71,0,0,0,0,0,70,0,71,0,0,66,0,0,0,0] }
});
Object.assign(SFX, {
  oniRoar:    () => { tone({ type: 'sawtooth', f0: 95, f1: 70, dur: 0.6, vol: 0.14, rv: 0.3 }); tone({ type: 'square', f0: 190, f1: 120, dur: 0.4, vol: 0.05, rv: 0.2 }); },
  dragonRoar: () => { tone({ type: 'sawtooth', f0: 220, f1: 70, dur: 1.4, vol: 0.2, rv: 0.6 }); tone({ type: 'sawtooth', f0: 228, f1: 72, dur: 1.4, vol: 0.16, rv: 0.6 }); noise({ dur: 1.2, vol: 0.14, f0: 900, f1: 300, type: 'bandpass', q: 0.8, rv: 0.5 }); },
  breath:     () => { noise({ dur: 1.4, vol: 0.3, f0: 500, f1: 1400, type: 'lowpass', q: 0.6, rv: 0.4, attack: 0.1 }); tone({ type: 'sawtooth', f0: 80, f1: 60, dur: 1.3, vol: 0.08, rv: 0.3 }); },
  fireball:   () => noise({ dur: 0.35, vol: 0.18, f0: 1800, f1: 400, q: 1, rv: 0.2 }),
  travel:     () => { noise({ dur: 1.2, vol: 0.2, f0: 300, f1: 3000, q: 1.2, rv: 0.6, attack: 0.3 }); [0, 7, 12, 16].forEach((n, i) => tone({ type: 'sine', f0: NOTE(64 + n), dur: 1.2, vol: 0.06, when: 0.3 + i * 0.12, rv: 0.9 })); },
  talkT:      () => tone({ type: 'square', f0: 520 + Math.random() * 60, dur: 0.035, vol: 0.035, rv: 0 }),
  talkL:      () => tone({ type: 'triangle', f0: 1100 + Math.random() * 120, dur: 0.04, vol: 0.05, rv: 0.1 }),
  talkN:      () => tone({ type: 'sine', f0: 330, dur: 0.05, vol: 0.03, rv: 0.3 })
});

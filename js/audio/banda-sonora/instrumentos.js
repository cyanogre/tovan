'use strict';
/* ======================================================================
   BANDA SONORA v3: compositor con escalas del mundo e instrumentos
   sintetizados. Cada nivel suena a su región; cada jefe tiene su tema
   (si no encuentra su mp3, suena este).
   ====================================================================== */
const SCALE = {
  dorian: [0, 2, 3, 5, 7, 9, 10], mixo: [0, 2, 4, 5, 7, 9, 10], minor: [0, 2, 3, 5, 7, 8, 10], major: [0, 2, 4, 5, 7, 9, 11],
  yo: [0, 2, 5, 7, 9], inSc: [0, 1, 5, 7, 8], hira: [0, 2, 3, 7, 8], gong: [0, 2, 4, 7, 9], minpent: [0, 3, 5, 7, 10], majpent: [0, 2, 4, 7, 9],
  hijaz: [0, 1, 4, 5, 7, 8, 10], hung: [0, 2, 3, 6, 7, 8, 11], lydian: [0, 2, 4, 6, 7, 9, 11], octa: [0, 1, 3, 4, 6, 7, 9, 10]
};
const hz = m => 440 * Math.pow(2, (m - 69) / 12);
// sintetizador de una voz: oscilador → filtro → envolvente → bus de música (+ reverb)
function mOsc(o){
  if (!actx || !musBus) return;
  const t = actx.currentTime + Math.max(0, o.when || 0), dur = Math.max(0.03, o.dur || 0.2);
  const osc = actx.createOscillator(); osc.type = o.type || 'sine';
  if (o.from){ osc.frequency.setValueAtTime(o.from, t); osc.frequency.exponentialRampToValueAtTime(o.f, t + (o.glide || 0.06)); }
  else osc.frequency.setValueAtTime(o.f, t);
  if (o.f1) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t + dur);
  if (o.det) osc.detune.value = o.det;
  let node = osc;
  if (o.vib){ const l = actx.createOscillator(), lg = actx.createGain(); l.frequency.value = o.vib[0]; lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(o.f * o.vib[1], t + Math.min(dur * 0.8, o.vib[2] || 0.15)); l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.1); }
  if (o.filt){ const bq = actx.createBiquadFilter(); bq.type = o.filt[0]; bq.frequency.setValueAtTime(o.filt[1], t); bq.Q.value = o.filt[2] || 0.8;
    if (o.filt[3]) bq.frequency.exponentialRampToValueAtTime(o.filt[3], t + Math.min(dur, o.filt[4] || dur)); node.connect(bq); node = bq; }
  const g = actx.createGain(), a = Math.min(o.attack || 0.005, dur * 0.4), v = Math.max(0.0002, (o.vol || 0.05) * musGain);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a);
  if (o.sus){ const rel = Math.min(o.rel || 0.1, dur * 0.5); g.gain.setValueAtTime(v, Math.max(t + a + 0.001, t + dur - rel)); }
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  node.connect(g); g.connect(musBus);
  if (o.rv){ const s = actx.createGain(); s.gain.value = o.rv; g.connect(s); s.connect(reverb); }
  osc.start(t); osc.stop(t + dur + 0.05);
}
function mNoise(o){
  if (!actx || !musBus || !noiseBuf) return;
  const t = actx.currentTime + Math.max(0, o.when || 0), dur = Math.max(0.02, o.dur || 0.2), v = Math.max(0.0002, (o.vol || 0.1) * musGain);
  const src = actx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
  const flt = actx.createBiquadFilter(); flt.type = o.type || 'bandpass'; flt.Q.value = o.q || 1; flt.frequency.setValueAtTime(o.f0 || 2000, t);
  if (o.f1) flt.frequency.exponentialRampToValueAtTime(Math.max(20, o.f1), t + dur);
  const g = actx.createGain(), a = Math.min(o.attack || 0.003, dur * 0.6); g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(flt); flt.connect(g); g.connect(musBus);
  if (o.rv){ const sg = actx.createGain(); sg.gain.value = o.rv; g.connect(sg); sg.connect(reverb); }
  src.start(t, Math.random() * 0.8); src.stop(t + dur + 0.05);
}
let musGain = 1;

/* ---------- Instrumentos ---------- */
const INS = {
  // celtas
  whistle: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'sine', f, when: w, dur: d, vol: v, attack: 0.025, sus: true, rel: 0.06, vib: [5.6, 0.012, 0.2], rv: 0.35 });
    mOsc({ type: 'triangle', f: f * 2, when: w, dur: d, vol: v * 0.18, attack: 0.03, sus: true, rel: 0.06 }); mNoise({ dur: 0.05, vol: v * 0.9, f0: f * 2, q: 3, when: w }); },
  pipes: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'sawtooth', f, when: w, dur: d, vol: v, attack: 0.012, sus: true, rel: 0.04, filt: ['bandpass', f * 2.2, 1.6], vib: [6, 0.006, 0.25], rv: 0.25 });
    mOsc({ type: 'square', f, when: w, dur: d, vol: v * 0.35, attack: 0.012, sus: true, rel: 0.04, filt: ['lowpass', 2400, 0.7] }); },
  drone: (m, w, d, v) => { for (const k of [0, 7]) mOsc({ type: 'sawtooth', f: hz(m + k), when: w, dur: d, vol: v * (k ? 0.6 : 1), attack: 0.25, sus: true, rel: 0.3, filt: ['lowpass', 700, 0.6], det: k ? 3 : -3, rv: 0.2 }); },
  harp: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'triangle', f, when: w, dur: 1.3, vol: v, attack: 0.003, rv: 0.55 }); mOsc({ type: 'sine', f: f * 2, when: w, dur: 0.6, vol: v * 0.35, attack: 0.003, rv: 0.5 }); },
  bouzouki: (m, w, d, v) => { const f = hz(m); for (const k of [0, 1]) mOsc({ type: 'sawtooth', f: f * (k ? 2.005 : 1), when: w + k * 0.006, dur: 0.5, vol: v * (k ? 0.5 : 1), attack: 0.003, filt: ['lowpass', 2600, 1, 900], rv: 0.2 }); },
  bodhran: (m, w, d, v) => { mOsc({ type: 'sine', f: 95, f1: 55, when: w, dur: 0.22, vol: v, attack: 0.002 }); mNoise({ dur: 0.08, vol: v * 0.6, f0: 700, type: 'lowpass', q: 0.7, when: w }); },
  // Japón
  koto: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'triangle', f, from: f * 1.015, glide: 0.04, when: w, dur: 1.5, vol: v, attack: 0.002, filt: ['lowpass', 3200, 1.2, 1200, 0.6], rv: 0.45 });
    mOsc({ type: 'square', f, when: w, dur: 0.25, vol: v * 0.15, attack: 0.002, filt: ['lowpass', 2400, 0.8] }); },
  shaku: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'sine', f, from: f * 0.95, glide: 0.14, when: w, dur: d, vol: v, attack: 0.09, sus: true, rel: 0.12, vib: [5, 0.014, 0.35], rv: 0.6 });
    mNoise({ dur: Math.min(0.5, d), vol: v * 0.7, f0: f * 1.5, q: 2.5, when: w, attack: 0.06, rv: 0.5 }); },
  shamisen: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'sawtooth', f, from: f * 1.02, glide: 0.02, when: w, dur: 0.38, vol: v, attack: 0.002, filt: ['highpass', 500, 0.7], rv: 0.3 });
    mNoise({ dur: 0.03, vol: v * 1.2, f0: 3500, q: 2, when: w }); },
  taiko: (m, w, d, v) => { mOsc({ type: 'sine', f: 120, f1: 42, when: w, dur: 0.55, vol: v, attack: 0.002, rv: 0.4 }); mNoise({ dur: 0.18, vol: v * 0.55, f0: 300, type: 'lowpass', q: 0.6, when: w, rv: 0.3 }); },
  clapper: (m, w, d, v) => { mNoise({ dur: 0.035, vol: v, f0: 2600, q: 4, when: w, rv: 0.5 }); mOsc({ type: 'square', f: 1900, when: w, dur: 0.03, vol: v * 0.3 }); },
  // China / Himalaya
  erhu: (m, w, d, v, prev) => { const f = hz(m); mOsc({ type: 'sawtooth', f, from: prev ? hz(prev) : f * 0.97, glide: 0.07, when: w, dur: d, vol: v, attack: 0.05, sus: true, rel: 0.08, filt: ['lowpass', 1900, 2.2], vib: [6.2, 0.016, 0.22], rv: 0.45 }); },
  guzheng: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'triangle', f, from: f * 1.01, glide: 0.03, when: w, dur: 1.8, vol: v, attack: 0.002, rv: 0.55 }); mOsc({ type: 'sine', f: f * 3, when: w, dur: 0.3, vol: v * 0.2, attack: 0.002 }); },
  gong: (m, w, d, v) => { const f = hz(m); [1, 1.48, 2.31, 3.12].forEach((k, i) => mOsc({ type: 'sine', f: f * k, f1: f * k * 0.985, when: w, dur: 3.2 - i * 0.5, vol: v / (i + 1), attack: 0.01, rv: 0.7 })); },
  woodblock: (m, w, d, v) => { mOsc({ type: 'sine', f: 850, when: w, dur: 0.07, vol: v, attack: 0.001 }); mOsc({ type: 'sine', f: 1700, when: w, dur: 0.04, vol: v * 0.3, attack: 0.001 }); },
  bowl: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'sine', f, when: w, dur: 4, vol: v, attack: 0.05, vib: [3, 0.004, 1], rv: 0.8 }); mOsc({ type: 'sine', f: f * 2.71, when: w, dur: 2.5, vol: v * 0.3, attack: 0.05, rv: 0.8 }); },
  // pop / tele
  chip: (m, w, d, v) => { mOsc({ type: 'square', f: hz(m), when: w, dur: d, vol: v, attack: 0.004, sus: true, rel: 0.03, vib: [6.5, 0.006, 0.18] }); },
  chipArp: (m, w, d, v) => { mOsc({ type: 'square', f: hz(m), when: w, dur: Math.min(d, 0.12), vol: v, attack: 0.002 }); },
  brass: (m, w, d, v) => { const f = hz(m); for (const k of [-6, 6]) mOsc({ type: 'sawtooth', f, det: k, when: w, dur: d, vol: v * 0.6, attack: 0.04, sus: true, rel: 0.08, filt: ['lowpass', 600, 1.2, 2600, 0.12], vib: [5.5, 0.006, 0.3], rv: 0.35 }); },
  violin: (m, w, d, v) => { const f = hz(m); for (const k of [-5, 5]) mOsc({ type: 'sawtooth', f, det: k, when: w, dur: d, vol: v * 0.6, attack: 0.018, sus: true, rel: 0.05, filt: ['lowpass', 2800, 1.4], vib: [6, 0.008, 0.25], rv: 0.4 }); },
  strings: (m, w, d, v) => { const f = hz(m); for (const k of [-8, 0, 8]) mOsc({ type: 'sawtooth', f, det: k, when: w, dur: d, vol: v * 0.4, attack: 0.25, sus: true, rel: 0.3, filt: ['lowpass', 1500, 0.6], rv: 0.5 }); },
  choir: (m, w, d, v) => { const f = hz(m); for (const k of [-7, 0, 7]) mOsc({ type: 'triangle', f, det: k, when: w, dur: d, vol: v * 0.45, attack: 0.35, sus: true, rel: 0.35, filt: ['bandpass', 850, 0.9], vib: [4.5, 0.004, 0.6], rv: 0.7 }); },
  bell: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'sine', f, when: w, dur: 1.6, vol: v, attack: 0.002, rv: 0.7 }); mOsc({ type: 'sine', f: f * 2.76, when: w, dur: 0.6, vol: v * 0.3, attack: 0.002, rv: 0.7 }); },
  // playa
  uke: (m, w, d, v) => { mOsc({ type: 'triangle', f: hz(m), when: w, dur: 0.7, vol: v, attack: 0.002, filt: ['lowpass', 3000, 0.8, 1400], rv: 0.35 }); },
  steel: (m, w, d, v, prev) => { const f = hz(m); mOsc({ type: 'sine', f, from: prev ? hz(prev) : f * 0.89, glide: 0.16, when: w, dur: d, vol: v, attack: 0.03, sus: true, rel: 0.25, vib: [5, 0.01, 0.3], rv: 0.55 });
    mOsc({ type: 'triangle', f: f * 2, from: prev ? hz(prev) * 2 : f * 1.78, glide: 0.16, when: w, dur: d, vol: v * 0.25, attack: 0.03, sus: true, rel: 0.25 }); },
  shaker: (m, w, d, v) => { mNoise({ dur: 0.06, vol: v, f0: 6500, type: 'highpass', q: 0.7, when: w, attack: 0.015 }); },
  // árabe / flamenco
  oud: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'triangle', f, from: f * 1.03, glide: 0.03, when: w, dur: 0.7, vol: v, attack: 0.002, rv: 0.35 });
    mOsc({ type: 'sawtooth', f, when: w, dur: 0.35, vol: v * 0.35, attack: 0.002, filt: ['lowpass', 1600, 1, 600] }); },
  ney: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'sine', f, from: f * 0.97, glide: 0.1, when: w, dur: d, vol: v, attack: 0.07, sus: true, rel: 0.1, vib: [5.5, 0.012, 0.3], rv: 0.55 }); mNoise({ dur: Math.min(0.4, d), vol: v * 0.9, f0: f, q: 1.5, when: w, attack: 0.05 }); },
  darbuka: (m, w, d, v) => { if (m === 1){ mOsc({ type: 'sine', f: 120, f1: 70, when: w, dur: 0.28, vol: v, attack: 0.002 }); } else { mNoise({ dur: 0.05, vol: v * 0.8, f0: m === 2 ? 3400 : 1900, q: 2, when: w }); } },
  guitar: (m, w, d, v) => { const f = hz(m); mOsc({ type: 'triangle', f, when: w, dur: 1.0, vol: v, attack: 0.002, filt: ['lowpass', 2600, 0.8, 900], rv: 0.35 });
    mOsc({ type: 'sawtooth', f, when: w, dur: 0.3, vol: v * 0.25, attack: 0.002, filt: ['lowpass', 1800, 0.8] }); },
  clap: (m, w, d, v) => { for (let i = 0; i < 3; i++) mNoise({ dur: 0.03, vol: v, f0: 1400, q: 1.2, when: w + i * 0.012, rv: 0.4 }); },
  // genéricos
  bass: (m, w, d, v) => { mOsc({ type: 'triangle', f: hz(m), when: w, dur: d, vol: v, attack: 0.004, sus: true, rel: 0.05 }); mOsc({ type: 'sine', f: hz(m), when: w, dur: d, vol: v * 0.6, attack: 0.004, sus: true, rel: 0.05 }); },
  sawBass: (m, w, d, v) => { mOsc({ type: 'sawtooth', f: hz(m), when: w, dur: d, vol: v, attack: 0.004, sus: true, rel: 0.04, filt: ['lowpass', 900, 1.5, 300] }); },
  kick: (m, w, d, v) => { mOsc({ type: 'sine', f: 150, f1: 40, when: w, dur: 0.16, vol: v, attack: 0.002 }); },
  snare: (m, w, d, v) => { mNoise({ dur: 0.13, vol: v, f0: 1800, q: 0.7, when: w, rv: 0.25 }); mOsc({ type: 'triangle', f: 210, f1: 150, when: w, dur: 0.08, vol: v * 0.5 }); },
  hat: (m, w, d, v) => { mNoise({ dur: 0.03, vol: v, f0: 8000, type: 'highpass', q: 0.7, when: w }); },
  crash: (m, w, d, v) => { mNoise({ dur: 1.4, vol: v, f0: 5000, type: 'highpass', q: 0.5, when: w, rv: 0.4 }); },
  glitch: (m, w, d, v) => { mOsc({ type: 'square', f: hz(m) * (Math.random() < 0.2 ? 2 : 1), det: (Math.random() - 0.5) * 60, when: w, dur: d, vol: v, attack: 0.002 }); }
};

'use strict';
/* ---------- Temas ---------- */
const R12 = ['x-.x-.', 'x--x-.', 'x.xx-.', 'x-xx-x', 'x--x--'];              // 6/8
const R16 = ['x---x-x-x---x---', 'x-x-x---x-x-x---', 'x---x---x-x-x---', 'x--x--x-x---x---', 'x-x-x-x-x---x-x-', 'x-----x-x---x---'];
const R16s = ['x---x-----x-x---', 'x-------x---x---', 'x-----x-----x---', 'x---x---x-------'];   // lentos
const R16f = ['x-x-x-x-x-x-x-x-', 'x-xxx-x-x-xxx-x-', 'xx-xx-x-xx-xx-x-', 'x-x-xx-xx-x-x-x-'];  // rápidos
const MUSIC = {
  // Título: tema de Tovan, aire celta (dórico) con arpa y flauta
  title:    { meter: 6, sd: 0.2, len: 16, root: 62, scale: SCALE.dorian, prog: [0, 6, 0, 4, 2, 3, 0, 6], lo: 0, hi: 9, start: 4, seed: 3,
              rhythm: ['x--x--', 'x-xx--', 'x--x-x', 'x-----'], lead: 'whistle', leadOct: 12, arp: 'harp', arpPat: 'x.xx.x', drone: 'drone', pad: 'strings', drums: { bodhran: 'x.....' }, introNoDrums: true, vol: 0.8 },
  // Ruinas del Ocaso: giga celta
  battle:   { bassVol: 0.5, leadVol: 1.3, meter: 6, sd: 0.155, len: 16, root: 62, scale: SCALE.dorian, prog: [0, 6, 0, 4, 0, 6, 3, 0], lo: 2, hi: 11, start: 6, seed: 8, rhythm: R12,
              lead: 'pipes', leadOct: 0, breakUp: false, harm: -2, harmIns: 'whistle', arp: 'bouzouki', arpPat: 'x.xx.x', bassPat: 'x..f..', bassIns: 'bass', drone: 'drone',
              drums: { bodhran: 'x.tx.t', hat: '..x..x' }, breakDrums: { bodhran: 'x..x..', hat: '......' }, intro: 2 },
  // Santuario de los Cerezos: escala In (miyako-bushi), koto y shakuhachi
  sakura:   { drumVol: 0.8, meter: 16, sd: 0.15, len: 16, root: 57, scale: SCALE.inSc, prog: [0, 0, 3, 3, 1, 4, 3, 0], lo: 3, hi: 11, start: 6, seed: 21, rhythm: R16s.concat(['x---x---x-x-x---']),
              lead: 'shaku', leadOct: 0, arp: 'koto', arpPat: 'x.x.x...x.x.x.x.', arpOct: 12, bassPat: 'x.......x.......', bassIns: 'koto', pad: 'strings', padOct: 0,
              drums: { taiko: 'x.......x...x...', clapper: '........x.......' }, bellsEvery: 8, vol: 0.9 },
  // Cumbre Nevada: pentatónica china, erhu y guzheng
  snow:     { bassVol: 0.45, leadVol: 1.4, meter: 16, sd: 0.135, len: 16, root: 62, scale: SCALE.gong, prog: [0, 3, 4, 0, 1, 3, 4, 0], lo: 2, hi: 10, start: 5, seed: 33, rhythm: R16,
              lead: 'erhu', leadOct: 0, arp: 'guzheng', arpPat: 'x.x.xx.x.x.xx.x.', bassPat: 'x...x.....x.x...', bassIns: 'bass', pad: 'choir', padOct: 0,
              drums: { woodblock: '..x...x...x...x.', taiko: 'x.......x.......' }, gongEvery: 8 },
  // Canal X: opening de anime (mayor, I–V–vi–IV) con chiptune y metales
  canal:    { arpVol: 1.4, meter: 16, sd: 0.1, len: 16, root: 60, scale: SCALE.major, prog: [0, 4, 5, 3, 0, 4, 5, 3], lo: 3, hi: 12, start: 7, seed: 47, rhythm: R16.concat(R16f.slice(0, 2)),
              lead: 'chip', leadOct: 12, harm: -2, harmIns: 'brass', arp: 'chipArp', arpPat: 'xxxxxxxxxxxxxxxx', arpOct: 0, bassPat: 'x.xox.xox.xox.xo', bassIns: 'sawBass', bassLen: 0.9,
              drums: { kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.' }, crashEvery: 8, intro: 2, breakUp: true },
  // Playa del Mundo Real: slack-key hawaiano, ukelele y guitarra steel
  render:   { bassVol: 0.6, meter: 16, sd: 0.17, len: 16, root: 64, scale: SCALE.majpent, prog: [0, 3, 4, 0, 3, 4, 2, 0], lo: 2, hi: 9, start: 4, seed: 55, rhythm: R16s,
              lead: 'steel', leadOct: 0, arp: 'uke', arpPat: 's...s.s.s...s.s.', bassPat: 'x.......f.......', bassIns: 'bass', drums: { shaker: '..x...x...x...x.' }, ocean: true, vol: 0.85 },
  // Ruinas corruptas: escala octatónica y cortes de glitch
  glitch:   { arpVol: 1.5, meter: 16, sd: 0.11, len: 16, root: 57, scale: SCALE.octa, prog: [0, 0, 5, 2, 0, 4, 6, 1], lo: 2, hi: 12, start: 6, seed: 66, rhythm: R16.concat(R16f),
              lead: 'chip', leadOct: 12, arp: 'chipArp', arpPat: 'x.xx.x.xx.x.xx.x', bassPat: 'x..x..x.x..x..x.', bassIns: 'sawBass', bassLen: 0.8,
              drums: { kick: 'x..x..x...x..x..', snare: '....x.......x..x', hat: 'xxx.xx.xxx.xx.x.' }, glitchy: true, intro: 2 },
  // Castillo Infinito: escala In oscura, shamisen, koto y taiko
  castle:   { arpVol: 1.6, meter: 16, sd: 0.16, len: 16, root: 50, scale: SCALE.inSc, prog: [0, 0, 1, 0, 3, 4, 1, 0], lo: 5, hi: 13, start: 8, seed: 77, rhythm: R16s.concat(R16.slice(0, 2)),
              lead: 'shaku', leadOct: 0, arp: 'shamisen', arpPat: 'x..x..x.x..x..x.', arpOct: 12, bassPat: 'x.......x.......', bassIns: 'koto', drone: 'drone',
              drums: { taiko: 'x.....x.x.......', clapper: '............x...' }, bellsEvery: 16, vol: 0.9 },
  // Azotea (calma antes del final): guitarra flamenca en frigio dominante
  finalcalm:{ bassVol: 0.6, arpVol: 0.8, leadVol: 1.2, meter: 12, sd: 0.2, len: 16, root: 64, scale: SCALE.hijaz, prog: [[57, 60, 64], [50, 53, 57], [52, 56, 59], [52, 56, 59], [53, 57, 60], [52, 56, 59], [57, 60, 64], [52, 56, 59]],
              lo: 3, hi: 10, start: 5, seed: 88, rhythm: ['x--x--x-x-x-', 'x---x---x---', 'x--x--x--x--', 'x-----x-x---'], lead: 'guitar', leadOct: 0, arp: 'guitar', arpPat: 's.....s..s..',
              bassPat: 'x.....x.....', bassIns: 'guitar', drums: { clap: '...x..x....x' }, introNoDrums: true, vol: 0.85 },
  // ---- jefes (se usan si no está su mp3) ----
  boss:     { drumVol: 0.55, leadVol: 1.3, meter: 16, sd: 0.1, len: 16, root: 50, scale: SCALE.dorian, prog: [0, 0, 6, 6, 5, 5, 4, 4], lo: 3, hi: 12, start: 7, seed: 101, rhythm: R16.concat(R16f),
              lead: 'pipes', leadOct: 12, harm: -2, harmIns: 'strings', arp: 'bouzouki', arpPat: 'x.x.x.x.x.x.x.x.', arpOct: 12, bassPat: 'x.x.x.x.x.x.xoxo', bassIns: 'sawBass', bassLen: 0.8,
              drone: 'drone', drums: { taiko: 'x...x...x...x.x.', snare: '....x.......x...', bodhran: '..t...t...t...tt' }, crashEvery: 8, intro: 1, breakUp: true },
  dragon:   { drumVol: 0.5, leadVol: 1.4, meter: 16, sd: 0.095, len: 16, root: 52, scale: SCALE.minpent, prog: [0, 0, 3, 2, 0, 0, 4, 3], lo: 3, hi: 12, start: 6, seed: 202, rhythm: R16.concat(R16f),
              lead: 'erhu', leadOct: 0, harm: -2, harmIns: 'strings', arp: 'guzheng', arpPat: 'x.xxx.xxx.xxx.xx', arpOct: 12, bassPat: 'x.x.x...x.x.x...', bassIns: 'sawBass', bassLen: 0.8,
              drums: { taiko: 'x..x..x.x..x..x.', woodblock: '..x...x...x...x.', snare: '....x.......x...' }, gongEvery: 4, intro: 1, breakUp: true },
  bossB:    { drumVol: 0.55, leadVol: 1.3, meter: 16, sd: 0.12, len: 16, root: 50, scale: SCALE.inSc, prog: [0, 0, 1, 1, 3, 3, 4, 1], lo: 2, hi: 11, start: 5, seed: 303, rhythm: R16.concat(R16s),
              lead: 'shamisen', leadOct: 12, harm: -3, harmIns: 'shaku', arp: 'koto', arpPat: 'x..x..x.x..x..x.', arpOct: 12, bassPat: 'x.......x.x.....', bassIns: 'sawBass', pad: 'choir', padOct: 0,
              drums: { taiko: 'x..x....x..x.x..', clapper: '....x.......x...' }, intro: 1, breakUp: true },
  starB:    { bassVol: 0.6, leadVol: 1.2, meter: 16, sd: 0.1, len: 16, root: 58, scale: SCALE.mixo, prog: [0, 6, 3, 0, 0, 6, 4, 4], lo: 2, hi: 11, start: 4, seed: 404, rhythm: R16,
              lead: 'brass', leadOct: 0, harm: -2, harmIns: 'brass', arp: 'strings', arpPat: 'x...x...x...x...', arpOct: 0, bassPat: 'x.xox.xox.xox.xo', bassIns: 'sawBass', bassLen: 0.8,
              drums: { kick: 'x...x...x...x...', snare: '....x...x.x.x...', hat: 'x.x.x.x.x.x.x.x.' }, crashEvery: 4, intro: 1, breakUp: true },
  teapot:   { bassVol: 0.5, leadVol: 1.3, drumVol: 0.8, meter: 16, sd: 0.09, len: 16, root: 62, scale: SCALE.hijaz, prog: [0, 0, 1, 0, 3, 3, 1, 0], lo: 2, hi: 11, start: 4, seed: 505, rhythm: R16.concat(R16f),
              lead: 'ney', leadOct: 0, harm: -2, harmIns: 'oud', arp: 'oud', arpPat: 'x.xx.x.xx.xx.x.x', arpOct: 0, bassPat: 'x..x..x.x..x..x.', bassIns: 'bass',
              drums: { darbuka: 'X.tX.tt.X.tX.ttt', clap: '....x.......x...' }, intro: 1, breakUp: true },
  glitchB:  { drumVol: 0.85, meter: 16, sd: 0.085, len: 16, root: 57, scale: SCALE.octa, prog: [0, 3, 0, 5, 0, 3, 6, 7], lo: 3, hi: 13, start: 7, seed: 606, rhythm: R16f,
              lead: 'chip', leadOct: 12, arp: 'chipArp', arpPat: 'xxxxxxxxxxxxxxxx', arpOct: 12, bassPat: 'x.xxx.xxx.xxx.xx', bassIns: 'sawBass', bassLen: 0.6,
              drums: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x.xx', hat: 'xxxxxxxxxxxxxxxx' }, glitchy: true, crashEvery: 8, intro: 1, breakUp: true },
  sixB:     { drumVol: 0.55, leadVol: 1.3, meter: 16, sd: 0.1, len: 16, root: 50, scale: SCALE.hira, prog: [0, 0, 3, 3, 1, 1, 4, 0], lo: 3, hi: 12, start: 6, seed: 707, rhythm: R16.concat(R16f),
              lead: 'shaku', leadOct: 12, harm: -2, harmIns: 'koto', arp: 'koto', arpPat: 'xxxxxxxxxxxxxxxx', arpOct: 12, bassPat: 'x..x..x.x..x..x.', bassIns: 'sawBass', bassLen: 0.8,
              drums: { taiko: 'x.x...x.x.x...x.', clapper: '....x.......x...', snare: '............x.xx' }, intro: 1, breakUp: true },
  finalboss:{ drumVol: 0.55, leadVol: 1.5, meter: 16, sd: 0.094, len: 16, root: 52, scale: SCALE.hung, prog: [0, 0, 5, 5, 3, 3, 4, 4], lo: 3, hi: 13, start: 7, seed: 808, rhythm: R16.concat(R16f),
              lead: 'violin', leadOct: 12, harm: -2, harmIns: 'brass', arp: 'guitar', arpPat: 's.s.s.ss.s.s.s.s', arpOct: 0, bassPat: 'x.xxx.xxx.xxx.xx', bassIns: 'sawBass', bassLen: 0.7,
              pad: 'choir', padOct: 0, pad2: 'choir', drums: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x...', taiko: 'x.......x...x.x.', hat: '..x...x...x...x.' }, crashEvery: 4, intro: 1, breakUp: true }
};
const MGAIN = {title: 0.75, battle: 0.59, sakura: 0.68, snow: 0.54, canal: 0.45, render: 0.78, glitch: 0.52, castle: 0.71, finalcalm: 1.84, boss: 0.74, dragon: 0.72, bossB: 0.85, starB: 0.93, teapot: 0.73, glitchB: 0.6, sixB: 0.63, finalboss: 0.64};
for (const [k, S] of Object.entries(MUSIC)){ S.comp = true; S.gain = MGAIN[k] || 1; SONGS[k] = S; }
SONGS.render2 = SONGS.render;
// las canciones de jefe propias, por si no está el mp3
Object.assign(BOSS_SONG, { boss: 'boss', dragon: 'dragon', skeleton: 'bossB', star: 'starB', teapot: 'teapot', error: 'glitchB', sixeyes: 'sixB', finalcat: 'finalboss' });
const _scheduleStep = scheduleStep;
scheduleStep = function(S, st, when, sd){ if (S.comp) compStep(S, st, when, sd); else _scheduleStep(S, st, when, sd); };
musicTick = function(){
  if (!actx || !song || !musOn || gameState === 'paused') return;
  const S = SONGS[song]; if (!S) return;
  const sd = S.comp ? S.sd : 60 / S.bpm / 4;
  if (nextT < actx.currentTime) nextT = actx.currentTime + 0.05;
  while (nextT < actx.currentTime + 0.25){ scheduleStep(S, seqStep, nextT - actx.currentTime, sd); seqStep++; nextT += sd;
    if (S.comp){ const IB = S.intro != null ? S.intro : 4; if (seqStep >= (IB + 2 * S.len) * S.meter) seqStep = IB * S.meter; }
    else if (seqStep >= 16 * S.bars.length * 2) seqStep = 0; }
};
// jefes: primero el mp3; si no existe, el tema propio. Si el mp3 termina de cargar en mitad del combate, entra el mp3.
const _playBossTrack = playBossTrack;
let pendingTrack = null;
playBossTrack = function(type, synth){
  const own = BOSS_SONG[type] || synth; pendingTrack = null;
  _playBossTrack(type, own);
  const t = tracks[BOSS_FILES[type] || type];
  if (t && !curTrack && !t.err && !t.ok) pendingTrack = { type, t };
};
for (const t of Object.values(tracks)) t.a.addEventListener('error', () => { t.err = true; });
const _updateTracks = updateTracks;
updateTracks = function(dt){
  _updateTracks(dt);
  if (pendingTrack && pendingTrack.t.ok && bossE && bossE.alive){ const p = pendingTrack; pendingTrack = null; _playBossTrack(p.type, BOSS_SONG[p.type]); }
  else if (pendingTrack && (!bossE || !bossE.alive) && pendingTrack.type !== 'finalcat') pendingTrack = null;
};

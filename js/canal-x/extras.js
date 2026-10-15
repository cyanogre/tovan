'use strict';
/* ---------- Historia, logros y estéticos ---------- */
Object.assign(STORY, {
  biome_6: [['tovan', '¿Lumen? ¿Por qué hay un plató de televisión en mitad de la nada?'], ['lumen', 'Bienvenido al Canal X. Aquí los héroes se miden por la confianza del público.'],
    ['tovan', '¿Y cuánta confianza da un repartidor?'], ['lumen', 'Puesto 9999. Pero eso tiene arreglo: gánate a la audiencia. Y ojo, que aquí cambian de canal sin avisar.'], ['tovan', '¿Que cambian el qué?']],
  boss_star: [['star', '¡Tachán! ¡Míster Confianza, número 1 del ranking de héroes! ¿Y tú quién eres?'], ['tovan', 'Tovan. Repartidor.'],
    ['star', '¡JA! ¡Nadie confía en un repartidor!'], ['tovan', 'Bueno, el paquete sigue sin firmar, así que en eso tienes razón.']],
  win_star: [['star', '¡Imposible! ¡Mi índice de confianza…!'], ['lumen', 'Enhorabuena, Tovan. Eres el nuevo número 1.'], ['tovan', '¿Eso incluye plus de productividad?']]
});
function drawStar(c){ drawPortraitImg(c, 'retratos/mister-confianza'); }
ACH.splice(ACH.length - 1, 0,
  { id: 'star', ic: '📺', name: 'Nuevo número 1', desc: 'Derrota a Míster Confianza.', rw: [['glasses', 'heromask'], ['title', 'Número 1 del ranking']] },
  { id: 'zapping', ic: '📡', name: 'Adicto al zapping', desc: 'Pasa por los 5 canales del Canal X en una misma visita.', rw: [['title', 'Adicto al zapping']] });
COS.glasses.push(['heromask', 'Antifaz de héroe', '🦸']);
COS.title.push(['Número 1 del ranking', 'Número 1 del ranking', '🏷️'], ['Adicto al zapping', 'Adicto al zapping', '🏷️']);
glasses('heromask', 0.29, 0.23, g => { const k = makeMat(0x1a1a2a), w = makeMat(0xffffff, { emissive: 1 }); mesh(B(0.48, 0.1, 0.03), k, 0, 0, 0, g); for (const s of [-1, 1]) mesh(B(0.09, 0.04, 0.02), w, 0.1 * s, 0, 0.015, g); });
MAKERS.star = makeStar;
Object.assign(SONGS, { canal: { bpm: 140, style: 'drive', bars: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]],
  mel: [76,0,0,79,0,0,76,0,74,0,72,0,74,0,0,0, 74,0,0,79,0,0,74,0,72,0,71,0,67,0,0,0, 72,0,0,76,0,0,72,0,71,0,69,0,72,0,0,0, 69,0,72,0,77,0,76,0,74,0,72,0,71,0,0,0] } });
BOSS_SONG.star = 'boss'; BOSS_BANNER.star = '¡Míster Confianza entra en directo!';
Object.assign(SFX, {
  static: () => noise({ dur: 0.4, vol: 0.22, f0: 3000, type: 'bandpass', q: 0.3, rv: 0 }),
  pew: () => tone({ type: 'square', f0: 1400, f1: 700, dur: 0.06, vol: 0.03, rv: 0 })
});

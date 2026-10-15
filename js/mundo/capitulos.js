'use strict';
/* ---------- Registro de capítulos ---------- */
const errorGround = groundTex;
BIOMES.push(
  { id: 'render', name: 'Playa del Mundo Real', sub: 'Gráficos: ULTRA · Protector solar recomendado', group: renderGroup, ground: groundTex, sky: [0, 0, 0], moon: 0, fog: 0x000000, amb: 0x8a8a8a,
    light: 0xffffff, mount: 0x000000, fire: [1.0, 0.95, 0.85], braz: 'none', amb_: null, music: 'render', crash: true,
    enter: () => { unlock('ultra'); setRealMode(true); ground.visible = false; rune.visible = false; blob.visible = false; sky.visible = false; mountainsList.forEach(m => { m.visible = false; });
      lampOverride = { pos: new V3(0, -60, 0), col: [0, 0, 0], range: 1 }; shared.uFogCol.value.setHex(0xbcd6ea); shared.uFogNear.value = 40; shared.uFogFar.value = 90;
      scene.fog = beachFog; beachPrevLD = shared.uLightDir.value.clone(); shared.uLightDir.value.copy(SUN_DIR); shared.uLightCol.value.setRGB(1.25, 1.18, 1.05); shared.uAmb.value.setRGB(0.55, 0.62, 0.7); },
    exit: () => { scene.fog = null; if (beachPrevLD) shared.uLightDir.value.copy(beachPrevLD); setRealMode(false); ground.visible = true; rune.visible = true; blob.visible = true; sky.visible = true; mountainsList.forEach(m => { m.visible = true; }); lampOverride = null; shared.uFogNear.value = 7; shared.uFogFar.value = 34; } },
  { id: 'corrupt', name: 'Ruinas corruptas', sub: 'Error al cargar el subtítulo', group: ruinsGroup, ground: groundTex, sky: [0x0a000a, 0x5a0a4a, 0xff2ae0], moon: 1, fog: 0x2a0628, amb: 0x5a3a6a,
    light: 0xffc0f0, mount: 0x3a0a3a, fire: [1.1, 0.3, 0.9], braz: 'ruins', amb_: 'glitch', music: 'glitch',
    enter: () => { shared.uGlitch.value = 1; document.body.classList.add('glitch'); errT = 5; ambMat.uniforms.uColor.value.setHex(0xff2ae0); },
    exit: () => { shared.uGlitch.value = 0; document.body.classList.remove('glitch'); errWin.hidden = true; } },
  { id: 'castle', name: 'Castillo Infinito', sub: 'Las puertas no llevan a ningún sitio. Todas.', group: castleGroup, ground: tatamiTex, sky: [0x05020a, 0x140818, 0x2a1020], moon: 0, fog: 0x100814,
    amb: 0x4a3050, light: 0xffb888, mount: 0x100814, fire: [1.2, 0.6, 0.3], braz: 'toro', amb_: null, music: 'castle',
    enter: () => { mountainsList.forEach(m => { m.visible = false; }); rune.visible = false; },
    exit: () => { mountainsList.forEach(m => { m.visible = true; }); rune.visible = true; } }
);
let beachPrevLD = null;
const ROT = 5, CASTLE = 5;
const BOSS_ROT = ['boss', 'dragon', 'skeleton', 'teapot', 'error'];
const BOSS_SONG = { boss: 'boss', dragon: 'dragon', skeleton: 'bossB', teapot: 'teapot', error: 'glitchB', sixeyes: 'dragon' };
const BOSS_BANNER = { boss: '¡Se acerca el Guardián de las ruinas!', dragon: '¡Ryūjin desciende de las nubes!', skeleton: '¡La montaña se levanta!', teapot: '¡Algo está hirviendo!', error: '¡ERROR CRÍTICO!', sixeyes: '¡El de los Seis Ojos te espera!' };
// envolver applyBiome con entrada/salida de capítulo
const _applyBiome = applyBiome;
applyBiome = function(b){
  const prev = BIOMES[curBiome]; if (prev && prev.exit && prev !== BIOMES[b]) prev.exit();
  _applyBiome(b); const Bm = BIOMES[b]; Bm.group.visible = true;
  if (Bm.braz === 'none'){ braz.visible = false; } else braz.visible = true;
  if (Bm.enter) Bm.enter();
};

/* ---------- Música nueva ---------- */
Object.assign(SONGS, {
  render:  { bpm: 88, style: 'pad', bars: [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62]] },
  glitch:  { bpm: 138, style: 'drive', glitch: true, bars: [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]], mel: SONGS.battle.mel },
  glitchB: { bpm: 158, style: 'boss', glitch: true, bars: [[50, 53, 57], [46, 50, 53], [48, 52, 55], [45, 49, 52]], mel: SONGS.boss.mel },
  castle:  { bpm: 92, style: 'wa', bars: [[50, 53, 57], [51, 55, 58], [50, 53, 57], [49, 53, 56]], mel: [74,0,0,75,0,0,74,0,70,0,0,0,69,0,0,0, 74,0,0,75,0,77,0,0,75,0,74,0,70,0,0,0, 69,0,0,70,0,74,0,0,70,0,69,0,65,0,0,0, 62,0,0,0,0,0,63,0,62,0,0,0,0,0,0,0] },
  bossB:   { bpm: 150, style: 'boss', bars: [[52, 55, 59], [48, 52, 55], [50, 54, 57], [47, 51, 54]], mel: [76,0,76,0,79,0,78,0,76,0,74,0,76,0,0,0, 72,0,72,0,76,0,74,0,72,0,71,0,72,0,0,0, 74,0,74,0,78,0,76,0,74,0,72,0,74,0,0,0, 75,0,0,0,78,0,0,0,83,0,0,0,81,0,78,0] },
  teapot:  { bpm: 176, style: 'drive', bars: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]], mel: [72,0,76,0,79,0,76,0,77,0,74,0,72,0,0,0, 69,0,72,0,77,0,72,0,74,0,71,0,67,0,0,0, 71,0,74,0,79,0,74,0,77,0,76,0,74,0,72,0, 72,0,0,0,79,0,0,0,84,0,0,0,0,0,0,0] }
});
Object.assign(SFX, {
  glitch:   () => { for (let i = 0; i < 4; i++) tone({ type: 'square', f0: 200 + Math.random() * 1800, dur: 0.05, vol: 0.06, when: i * 0.05, rv: 0 }); noise({ dur: 0.2, vol: 0.12, f0: 3000, q: 4 }); },
  biwa:     () => { tone({ type: 'triangle', f0: NOTE(62), f1: NOTE(60), dur: 1.2, vol: 0.14, rv: 0.8 }); tone({ type: 'sawtooth', f0: NOTE(50), f1: NOTE(49), dur: 1.0, vol: 0.05, rv: 0.6 }); },
  crash:    () => { noise({ dur: 0.4, vol: 0.3, f0: 1200, q: 0.5 }); tone({ type: 'square', f0: 110, dur: 1.2, vol: 0.08, rv: 0 }); },
  bootup:   () => seq_([[60, 0.2], [67, 0.2], [72, 0.2], [79, 0.6]], 'sine', 0.12, 0.1, 0.6)
});

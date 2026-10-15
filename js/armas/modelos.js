'use strict';
/* ======================================================================
   ARMAS v5: paellera, guitarra eléctrica, yoyó, abanico y martillo de
   feria, cada una con su combo y su cargado; y dos poderes propios por
   arma que se desbloquean usándola
   ====================================================================== */
const Wm = { pan: makeMat(0x34343c), panRim: makeMat(0x55555e), rice: makeMat(0xe8b23a), pepper: makeMat(0xc8302a), bean: makeMat(0x4f9a3a), lemon: makeMat(0xf8e070, { emissive: 0.2 }),
  prawn: makeMat(0xff8a6a), gRed: makeMat(0xd8262a), gWhite: makeMat(0xf4f0e8), gWood: makeMat(0x7a4a24), gDark: makeMat(0x1a1a20), gMetal: makeMat(0xc8c8d0, { emissive: 0.3 }),
  yoA: makeMat(0x2ab8ff, { emissive: 0.25 }), yoB: makeMat(0xf4f4ff), yoGlow: makeMat(0x9ff6ff, { emissive: 1 }), hRed: makeMat(0xe8343a), hYel: makeMat(0xffd23a), fanWood: makeMat(0x5a3418) };
const fanTex = texAsset('armas/abanico');
const fanMat = makeMat(0xffffff, { map: fanTex, side: THREE.DoubleSide });
weapon('paella', g => {
  mesh(C(0.032, 0.03, 0.66, 6), Wm.pan, 0, 0.02, 0, g); mesh(C(0.045, 0.045, 0.1, 6), Wm.gDark, 0, -0.28, 0, g);
  const pan = new THREE.Group(); pan.position.y = 0.78; pan.rotation.x = Math.PI / 2; g.add(pan);
  mesh(C(0.44, 0.4, 0.07, 18), Wm.pan, 0, 0, 0, pan); const rim = mesh(new THREE.TorusGeometry(0.44, 0.025, 4, 20), Wm.panRim, 0, 0.035, 0, pan); rim.rotation.x = Math.PI / 2;
  mesh(C(0.4, 0.4, 0.02, 18), Wm.rice, 0, 0.04, 0, pan);
  for (let i = 0; i < 6; i++){ const a = i / 6 * TAU + 0.3, r = 0.24 + (i % 2) * 0.08; const s = mesh(B(0.17, 0.02, 0.04), Wm.pepper, Math.cos(a) * r, 0.055, Math.sin(a) * r, pan); s.rotation.y = -a; }
  for (let i = 0; i < 7; i++){ const a = i / 7 * TAU, r = 0.15 + (i % 3) * 0.07; const s = mesh(B(0.1, 0.025, 0.025), Wm.bean, Math.cos(a) * r, 0.055, Math.sin(a) * r, pan); s.rotation.y = a * 1.7; }
  for (let i = 0; i < 3; i++){ const a = i / 3 * TAU + 1; const p = mesh(new THREE.TorusGeometry(0.06, 0.025, 4, 7, Math.PI * 1.3), Wm.prawn, Math.cos(a) * 0.2, 0.065, Math.sin(a) * 0.2, pan); p.rotation.x = Math.PI / 2; }
  const lm = mesh(new THREE.SphereGeometry(0.07, 6, 4, 0, Math.PI), Wm.lemon, 0.05, 0.06, -0.05, pan); lm.rotation.x = -Math.PI / 2;
  const h2 = mesh(new THREE.TorusGeometry(0.07, 0.018, 4, 8, Math.PI), Wm.pan, 0, 0, 0.47, pan); h2.rotation.set(0, 0, Math.PI / 2);
});
weapon('guitar', g => {
  mesh(B(0.075, 0.82, 0.04), Wm.gWood, 0, 0.0, 0, g); mesh(B(0.12, 0.2, 0.04), Wm.gDark, 0, -0.5, 0, g);
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) mesh(B(0.03, 0.03, 0.05), Wm.gMetal, 0.075 * s, -0.56 + i * 0.06, 0.02, g);
  for (let i = 0; i < 6; i++) mesh(B(0.006, 1.25, 0.006), Wm.gMetal, -0.025 + i * 0.01, 0.18, 0.026, g);
  const b1 = mesh(C(0.26, 0.26, 0.09, 14), Wm.gRed, 0, 0.78, 0, g); b1.rotation.x = Math.PI / 2;
  const b2 = mesh(C(0.2, 0.2, 0.09, 14), Wm.gRed, 0, 0.52, 0, g); b2.rotation.x = Math.PI / 2;
  const pg = mesh(C(0.16, 0.16, 0.01, 12), Wm.gWhite, 0.07, 0.68, 0.05, g); pg.rotation.x = Math.PI / 2;
  mesh(B(0.14, 0.04, 0.02), Wm.gDark, 0, 0.62, 0.06, g); mesh(B(0.14, 0.04, 0.02), Wm.gDark, 0, 0.74, 0.06, g); mesh(B(0.1, 0.03, 0.02), Wm.gMetal, 0, 0.86, 0.06, g);
  for (const s of [-1, 1]){ const k = mesh(C(0.025, 0.025, 0.02, 6), Wm.gWhite, 0.14 * s, 0.9, 0.05, g); k.rotation.x = Math.PI / 2; }
});
weapon('yoyo', g => {
  const loop = mesh(new THREE.TorusGeometry(0.05, 0.012, 4, 8), Wm.yoB, 0, -0.02, 0, g); loop.rotation.y = Math.PI / 2;
  const str = mesh(C(0.006, 0.006, 1, 4), Wm.yoB, 0, 0.5, 0, g); str.geometry.translate(0, 0, 0); g.userData.str = str;
  const disc = new THREE.Group(); disc.position.y = 0.42; g.add(disc); g.userData.disc = disc;
  for (const s of [-1, 1]){ const d = mesh(C(0.15, 0.15, 0.045, 14), Wm.yoA, 0, 0, 0.04 * s, disc); d.rotation.x = Math.PI / 2;
    const c = mesh(C(0.07, 0.07, 0.05, 10), Wm.yoB, 0, 0, 0.045 * s, disc); c.rotation.x = Math.PI / 2; }
  const ax = mesh(C(0.03, 0.03, 0.06, 6), Wm.yoGlow, 0, 0, 0, disc); ax.rotation.x = Math.PI / 2;
});
weapon('fan', g => {
  mesh(C(0.025, 0.02, 0.32, 5), Wm.fanWood, 0, 0.0, 0, g);
  const f = mesh(new THREE.CircleGeometry(0.52, 14, 0, Math.PI), fanMat, 0, 0.16, 0, g);
  for (let i = 0; i <= 8; i++){ const a = i / 8 * Math.PI; const r = mesh(B(0.012, 0.52, 0.012), Wm.fanWood, Math.cos(a) * 0.26, 0.16 + Math.sin(a) * 0.26, 0.006, g); r.rotation.z = a - Math.PI / 2; }
  const edge = mesh(new THREE.TorusGeometry(0.52, 0.012, 3, 16, Math.PI), Wm.gDark, 0, 0.16, 0, g);
  g.userData.fan = f;
});
weapon('hammer', g => {
  mesh(C(0.045, 0.04, 1.0, 8), Wm.hYel, 0, 0.18, 0, g); mesh(C(0.055, 0.055, 0.16, 8), Wm.hRed, 0, -0.3, 0, g);
  const head = new THREE.Group(); head.position.y = 0.8; g.add(head);
  const h = mesh(C(0.17, 0.17, 0.44, 12), Wm.hRed, 0, 0, 0, head); h.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]){ const c = mesh(C(0.185, 0.185, 0.07, 12), Wm.hYel, 0.23 * s, 0, 0, head); c.rotation.z = Math.PI / 2; }
  for (let i = 0; i < 3; i++){ const r = mesh(new THREE.TorusGeometry(0.172, 0.018, 4, 12), Wm.hYel, -0.08 + i * 0.08, 0, 0, head); r.rotation.y = Math.PI / 2; }
});
COS.weapon.push(['paella', 'Paellera valenciana', '🥘'], ['guitar', 'Guitarra eléctrica', '🎸'], ['yoyo', 'Yoyó de competición', '🪀'], ['fan', 'Abanico de la feria', '🪭'], ['hammer', 'Martillo de feria', '🔨']);
Object.assign(W_COL, { paella: 0xffc040, guitar: 0xff4a8a, yoyo: 0x4ad8ff, fan: 0xff6a8a, hammer: 0xffd23a });
Object.assign(COS_POW.weapon, {
  paella: 'Cada golpe tiene un 20 % de quemar (socarrat). Cargado: Paella voladora, que rebota de enemigo en enemigo y vuelve.',
  guitar: 'Cada seis golpes sale una nota que salta a otro enemigo. Cargado: Solo de guitarra, anillos de sonido que empujan y aturden.',
  yoyo: 'Alcance enorme y golpes muy rápidos. Cargado: Paseo del perro, el yoyó rueda por el suelo, ida y vuelta.',
  fan: 'Los abanicazos empujan mucho y apartan los proyectiles de delante. Cargado: Torbellino flamenco que lo arrastra todo.',
  hammer: 'Cada golpe tiene un 25 % de aturdir. Cargado: Martillazo sísmico, grietas que revientan el suelo en abanico.'
});
Object.assign(WSTYLE, {
  paella:  { style: 'Pesado', dmg: 4, spd: 2, rng: 4, mov: 3, seq: ['paeA', 'paeB', 'paeC'], combo: 'Sartenazo · Revés · ¡Volteo de paella!',
             extra: 'Golpes anchos que suenan a gloria. El remate voltea arroz ardiendo sobre los enemigos de delante.' },
  guitar:  { style: 'Sónico', dmg: 3, spd: 3, rng: 4, mov: 3, seq: ['gtrA', 'gtrB', 'gtrC'], combo: 'Rasgueo · Rasgueo · ¡Power chord!',
             extra: 'El remate lanza una onda de sonido en cono que empuja a todo lo que pilla.' },
  yoyo:    { style: 'Látigo', dmg: 2, spd: 5, rng: 5, mov: 4, seq: ['yoA', 'yoB', 'yoC', 'yoD'], combo: 'Lanzamiento ×3 · ¡Vuelta al mundo!',
             extra: 'Pegas desde lejísimos y muy rápido. El remate da una vuelta completa a tu alrededor.' },
  fan:     { style: 'Viento', dmg: 2, spd: 4, rng: 3, mov: 5, seq: ['fanA', 'fanB', 'fanC'], combo: 'Abanicazo · Abanicazo · ¡Ráfaga!',
             extra: 'Te mueves y ruedas más. Mandas a los enemigos lejos y la ráfaga apaga los proyectiles.' },
  hammer:  { style: 'Aturdidor', dmg: 4, spd: 2, rng: 3, mov: 2, seq: ['hamA', 'hamB', 'hamC'], combo: '¡Pi! · ¡Pi! · ¡PIIIII!',
             extra: 'Lento, pero aturde. El remate es un salto con martillazo que deja a todos viendo estrellitas.' }
});
const NEW_W = new Set(['paella', 'guitar', 'yoyo', 'fan', 'hammer']);
const STRUM = pose({ shX: -1.0, shY: 1.2, spY: 0.55, spX: 0.1, elX: -1.4, dy: -0.06 }), STRUM2 = pose({ shX: -1.25, shY: 0.8, spY: 0.35, spX: 0.16, elX: -1.0, dy: -0.1 });
const BONK_UP = pose({ shX: -2.9, shY: 0.4, spY: 0.2, spX: -0.2, elX: -0.3, dy: 0.02 });
Object.assign(MV, {
  paeA: { dur: 0.5, hit: 0.52, trail: [0.32, 0.72], lunge: [0.3, 0.55, 0.35], dmg: [34, 42], range: 2.7, cone: -0.25, meter: 7, knock: 4.5, hs: 0.06, clang: true, keys: [[0, HOLD], [0.34, SWEEP_R], [0.66, SWEEP_L], [1, A_END]] },
  paeB: { dur: 0.62, hit: 0.5, trail: [0.36, 0.56], lunge: [0.36, 0.52, 0.4], dmg: [44, 54], range: 2.6, slam: true, meter: 9, knock: 5.5, clang: true,
          keys: [[0, A_END], [0.3, OVER], [0.42, pose({ shX: -3.5, shY: 0.25, spY: 0.1, spX: -0.3, elX: -0.1, dy: 0.04 })], [0.52, SMASHED], [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] },
  paeC: { dur: 0.72, hit: 0.5, trail: [0.32, 0.62], lunge: [0.3, 0.5, 0.35], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, keys: [[0, LOWCUT], [0.36, LOWCUT], [0.55, UPCUT], [1, A_END]] },
  gtrA: { dur: 0.42, hit: 0.5, trail: [0.3, 0.68], lunge: [0.28, 0.52, 0.3], dmg: [24, 30], range: 2.4, cone: 0.1, meter: 5, knock: 3, strum: true, keys: [[0, HOLD], [0.3, SWEEP_R], [0.62, SWEEP_L], [1, A_END]] },
  gtrB: { dur: 0.42, hit: 0.5, trail: [0.3, 0.68], lunge: [0.28, 0.52, 0.3], dmg: [24, 30], range: 2.4, cone: 0.1, meter: 5, knock: 3, strum: true,
          keys: [[0, A_END], [0.3, pose({ shX: -1.5, shY: -1.7, spY: -0.8, spX: 0.05 })], [0.62, pose({ shX: -1.3, shY: 1.5, spY: 0.7, spX: 0.12, dy: -0.08 })], [1, B_END]] },
  gtrC: { dur: 0.62, hit: 0.48, trail: [0.32, 0.52], lunge: [0.3, 0.46, 0.3], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, keys: [[0, B_END], [0.3, OVER], [0.46, SMASHED], [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] },
  yoA: { dur: 0.28, hit: 0.45, trail: [0.25, 0.7], lunge: [0.2, 0.4, 0.15], dmg: [15, 19], range: 3.5, cone: 0.72, meter: 3, knock: 1.6, hs: 0.03, yoyo: true, keys: [[0, HOLD], [0.35, THRUST], [0.7, THRUST], [1, HOLD]] },
  yoB: { dur: 0.28, hit: 0.45, trail: [0.25, 0.7], lunge: [0.2, 0.4, 0.15], dmg: [15, 19], range: 3.5, cone: 0.72, meter: 3, knock: 1.6, hs: 0.03, yoyo: true, keys: [[0, HOLD], [0.35, JAB1], [0.7, THRUST], [1, A_END]] },
  yoC: { dur: 0.28, hit: 0.45, trail: [0.25, 0.7], lunge: [0.2, 0.4, 0.15], dmg: [16, 20], range: 3.6, cone: 0.72, meter: 3, knock: 2, hs: 0.03, yoyo: true, keys: [[0, A_END], [0.35, THRUST], [0.7, JAB1], [1, HOLD]] },
  yoD: { dur: 0.62, hit: 0.5, trail: [0.12, 0.88], lunge: [0, 0, 0], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, noNeck: true, yoyo: 'world', keys: SPINK(1) },
  fanA: { dur: 0.3, hit: 0.5, trail: [0.28, 0.68], lunge: [0.24, 0.5, 0.3], dmg: [16, 20], range: 2.4, cone: 0, meter: 4, knock: 5.5, fanHit: true, keys: [[0, HOLD], [0.3, SWEEP_R], [0.62, SWEEP_L], [1, A_END]] },
  fanB: { dur: 0.3, hit: 0.5, trail: [0.28, 0.68], lunge: [0.24, 0.5, 0.3], dmg: [16, 20], range: 2.4, cone: 0, meter: 4, knock: 5.5, fanHit: true,
          keys: [[0, A_END], [0.3, pose({ shX: -1.5, shY: -1.7, spY: -0.8, spX: 0.05 })], [0.62, pose({ shX: -1.3, shY: 1.5, spY: 0.7, spX: 0.12, dy: -0.08 })], [1, B_END]] },
  fanC: { dur: 0.55, hit: 0.45, trail: [0.25, 0.6], lunge: [0.2, 0.45, 0.3], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, keys: [[0, B_END], [0.3, SWEEP_L], [0.5, SWEEP_R], [1, A_END]] },
  hamA: { dur: 0.52, hit: 0.55, trail: [0.38, 0.62], lunge: [0.36, 0.56, 0.3], dmg: [30, 38], range: 2.4, cone: 0.2, meter: 6, knock: 4, squeaky: true, keys: [[0, HOLD], [0.34, BONK_UP], [0.56, SMASHED], [1, A_END]] },
  hamB: { dur: 0.52, hit: 0.55, trail: [0.38, 0.62], lunge: [0.36, 0.56, 0.3], dmg: [30, 38], range: 2.4, cone: 0.2, meter: 6, knock: 4, squeaky: true, keys: [[0, A_END], [0.34, BONK_UP], [0.56, SMASHED], [1, B_END]] },
  hamC: { dur: 0.88, hit: 0.58, trail: [0.42, 0.62], lunge: [0.3, 0.58, 0.6], dmg: [56, 68], range: 2.9, slam: true, meter: 11, knock: 6, stun: 1.0, squeaky: true, armor: true, hop: true,
          keys: [[0, B_END], [0.3, CH_UP], [0.48, OVER], [0.6, SMASHED], [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] },
  // cargados nuevos
  chPaella: { dur: 0.5, hit: 0.4, trail: [0.28, 0.5], lunge: [0.25, 0.45, 0.4], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, armor: true, keys: [[0, CH_BACK], [0.3, CH_BACK], [0.45, THRUST], [1, A_END]] },
  chGuitar: { dur: 1.35, hit: 9, hits: [0.16, 0.32, 0.48, 0.64, 0.8], trail: [0.1, 0.9], lunge: [0, 0, 0], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, armor: true,
              keys: [[0, CH_UP], [0.1, STRUM], [0.2, STRUM2], [0.28, STRUM], [0.36, STRUM2], [0.44, STRUM], [0.52, STRUM2], [0.6, STRUM], [0.68, STRUM2], [0.76, STRUM], [0.84, STRUM2], [0.92, OVER], [1, A_END]] },
  chYoyo: { dur: 0.5, hit: 0.36, trail: [0.26, 0.5], lunge: [0.25, 0.45, 0.3], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, armor: true, keys: [[0, CH_BACK], [0.25, CH_BACK], [0.42, LOWCUT], [1, A_END]] },
  chFan: { dur: 0.6, hit: 0.42, trail: [0.2, 0.6], lunge: [0, 0, 0], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, armor: true, noNeck: true, keys: SPINK(1) },
  chHammer: { dur: 0.85, hit: 0.56, trail: [0.4, 0.6], lunge: [0.3, 0.55, 0.5], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, armor: true, hop: true,
              keys: [[0, CH_UP], [0.32, CH_UP], [0.5, OVER], [0.6, SMASHED], [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] }
});

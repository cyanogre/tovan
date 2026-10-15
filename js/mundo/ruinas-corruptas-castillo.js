'use strict';
/* ---------- Capítulo 5: Ruinas corruptas ---------- */
const errWin = document.getElementById('errWin');
const ERRS = ['No se encuentra «suelo_final_DEFINITIVO_v3.png».', 'Tovan.exe está usando demasiada RAM (4 KB).', 'Excepción no controlada en «realidad.dll».',
  '¿Seguro que quieres cerrar el universo? [Sí] [Sí]', 'La textura «cielo» ha dejado de funcionar.', 'Error al cargar el error.', 'Se esperaba «;» en la línea 3, columna ∞.'];
let errT = 6;
function updateCorrupt(dt){
  if (BIOMES[curBiome].id !== 'corrupt' || gameState !== 'play') { return; }
  shared.uTime.value = time;
  errT -= dt;
  if (errT <= 0){ errT = 9 + rnd() * 7;
    errWin.querySelector('.eb').textContent = ERRS[Math.floor(rnd() * ERRS.length)];
    errWin.style.left = (10 + rnd() * 55) + '%'; errWin.style.top = (22 + rnd() * 40) + '%'; errWin.hidden = false; play('glitch');
    setTimeout(() => { errWin.hidden = true; }, 2600); }
}

/* ---------- Castillo Infinito ---------- */
const tatamiTex = texAsset('mundo/castillo-tatami');
const shojiTex = texAsset('mundo/castillo-shoji');
const fusumaTex = texAsset('mundo/castillo-fusuma');
const castleGroup = new THREE.Group(); scene.add(castleGroup); castleGroup.visible = false;
const CM = { tatami: makeMat(0xffffff, { map: tatamiTex }), shoji: makeMat(0xffffff, { map: shojiTex, emissive: 0.25 }), fusuma: makeMat(0xffffff, { map: fusumaTex }),
  wood: makeMat(0x5a3a22), dark: makeMat(0x2a1a14), lamp: makeMat(0xffb060, { emissive: 1 }), roof: makeMat(0x2a2030) };
const castleRooms = [];
function castleRoom(x, y, z, rx, ry, rz, s){
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rx, ry, rz); g.scale.setScalar(s); castleGroup.add(g);
  mesh(scaleUV(B(4, 0.2, 4), 1, 1), CM.tatami, 0, 0, 0, g);
  mesh(scaleUV(B(4, 2.6, 0.12), 2, 1), CM.fusuma, 0, 1.4, -2, g);
  mesh(scaleUV(B(0.12, 2.6, 4), 1, 1), CM.shoji, -2, 1.4, 0, g);
  for (const [px_, pz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) mesh(B(0.18, 2.8, 0.18), CM.wood, px_, 1.4, pz, g);
  mesh(B(4.3, 0.25, 4.3), CM.dark, 0, 2.85, 0, g);
  if (rnd() < 0.7){ mesh(B(0.3, 0.45, 0.3), CM.lamp, 1.3, 0.35, 1.2, g); }
  if (rnd() < 0.5) for (let k = 0; k < 5; k++) mesh(B(1.2, 0.2, 0.5), CM.wood, 2.8, 0.1 + k * 0.4, -1.4 + k * 0.5, g);
  g.userData = { base: g.position.clone(), rot: g.rotation.clone(), ph: rnd() * 6, target: null };
  castleRooms.push(g); return g;
}
for (let i = 0; i < 26; i++){
  const a = rnd() * TAU, r = 11 + rnd() * 20, y = -9 + rnd() * 24;
  const flip = rnd(); castleRoom(Math.cos(a) * r, y, Math.sin(a) * r, flip < 0.2 ? Math.PI : flip < 0.35 ? Math.PI / 2 : 0, rnd() * TAU, flip > 0.85 ? Math.PI / 2 : 0, 0.9 + rnd() * 1.1);
}
for (let i = 0; i < 18; i++){ const a = rnd() * TAU, r = 9 + rnd() * 22; mesh(B(0.35, 40, 0.35), CM.wood, Math.cos(a) * r, 4, Math.sin(a) * r, castleGroup); }
for (let i = 0; i < 12; i++){ const a = i / 12 * TAU; const l = mesh(B(0.35, 0.5, 0.35), CM.lamp, Math.cos(a) * 7.2, 0.25, Math.sin(a) * 7.2, castleGroup); }
let castleShiftT = 6;
function updateCastle(dt){
  if (!castleGroup.visible) return;
  castleShiftT -= dt;
  if (castleShiftT <= 0){ castleShiftT = 5 + rnd() * 4; play('biwa');
    for (let i = 0; i < 6; i++){ const g = castleRooms[Math.floor(rnd() * castleRooms.length)]; const a = rnd() * TAU, r = 11 + rnd() * 20;
      g.userData.target = new V3(Math.cos(a) * r, -9 + rnd() * 24, Math.sin(a) * r); } }
  for (const g of castleRooms){ const u = g.userData;
    if (u.target){ g.position.lerp(u.target, 1 - Math.exp(-dt * 2.5)); if (g.position.distanceTo(u.target) < 0.05){ u.base.copy(u.target); u.target = null; } }
    else g.position.y = u.base.y + Math.sin(time * 0.6 + u.ph) * 0.3;
    g.rotation.y += dt * 0.03; }
}

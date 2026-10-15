'use strict';
/* ---------- Registro y oleadas por nivel ---------- */
Object.assign(MAKERS, { gargoyle: makeGargoyle, kasa: makeKasa, chochin: makeChochin, snowman: makeSnowman, penguin: makePenguin, drone: makeDrone, fanatic: makeFanatic,
  crab: makeCrab, popup: makePopup, cursor: makeCursor, ninja: makeNinja });
const BIOME_EX = { ruinas: [['gargoyle', 2, 1]], sakura: [['kasa', 2, 1], ['chochin', 2, 0.8]], cumbre: [['snowman', 3, 0.9], ['penguin', 1, 1]], canal: [['drone', 2, 0.9], ['fanatic', 2, 0.9]],
  render: [['crab', 3, 1]], corrupt: [['popup', 2, 0.9], ['cursor', 2, 0.9]], castle: [['ninja', 2, 1]] };
const EX_INTRO = { gargoyle: '¡Gárgolas! Bajan en picado: cuando veas la línea roja, apártate.', kasa: 'Un kasa-obake, un paraguas viejo con un ojo. Salta encima de ti: mira el círculo.',
  chochin: 'Esa linterna escupe fuego. Y yo soy una linterna que no escupe nada. Qué vergüenza.', snowman: 'Muñecos de nieve con brazo de pitcher. Ojo a los círculos.',
  penguin: 'Los pingüinos se tiran de barriga. Sal de la línea.', drone: '¡Drones con cámara! Graban todo. Y disparan un flash que quema.', fanatic: 'Fans de Míster Confianza. Abrazan muy fuerte. Después de la selfie se quedan tontos: aprovecha.',
  crab: 'Un cangrejo de verdad. Por delante tiene pinzas. Por los lados, no tanto.', popup: '¡Ventanas emergentes! Ni «Sí» ni «Sí». Rómpelas.', cursor: 'Un cursor gigante. Hace doble clic donde estés. No te quedes quieto.',
  ninja: 'Ninjas de sombra. Lanzan estrellas y desaparecen. Típico.' };
const _buildWave5 = buildWave;
buildWave = function(n){
  const q = _buildWave5(n), id = BIOMES[biomeOfWave(n)] && BIOMES[biomeOfWave(n)].id, ex = BIOME_EX[id];
  if (!ex || n >= FINAL_WAVE) return q;
  const boss = n % 5 === 0, first = (n - 1) % 5 === 0;
  let made = 0;
  for (let i = boss ? 1 : 0; i < q.length; i++){ if (q[i] === 'imp' || q[i] === 'sentinel' || q[i] === 'orb' || (!boss && rnd() < 0.25)){
      if (rnd() < (boss ? 0.4 : 0.5) || (first && made < 2)){ const tot = ex.reduce((s, p) => s + p[2], 0); let r = rnd() * tot, pick = ex[0]; for (const p of ex){ r -= p[2]; if (r <= 0){ pick = p; break; } } q[i] = pick[0]; made++; } } }
  return q;
};
const _startSpecialWave5 = startSpecialWave;
startSpecialWave = function(){ _startSpecialWave5(); if (special && special.stage < special.max) for (let i = 0; i < queue.length; i++) if (queue[i] === 'imp' && rnd() < 0.5) queue[i] = 'ninja'; waveTotal = queue.length; };
const _spawnEnemy5 = spawnEnemy;
spawnEnemy = function(type, at){ const e = _spawnEnemy5(type, at); if (e && EX_INTRO[type]) barkOnce('ex_' + type, EX_INTRO[type]); return e; };
const _killEnemyE5 = killEnemy;
killEnemy = function(e){ const was = e.alive; _killEnemyE5(e); if (was && dropOf[e.type] && rnd() < dropOf[e.type]) dropPickup(e.g.position.x, e.g.position.z);
  if (was && e.type === 'popup'){ tA.set(e.g.position.x, 2.6, e.g.position.z); spawnNumber(tA, 'Ventana cerrada', 'react', '#c0c0c0'); }
  if (was && e.type === 'ninja' && !e.g.visible){ e.g.visible = true; } };

/* ---------- Proyectiles en parábola ---------- */
function updateLobs(dt){
  for (let i = EN.lobs.length - 1; i >= 0; i--){ const L = EN.lobs[i]; L.t += dt; const k = Math.min(1, L.t / L.dur);
    L.m.position.lerpVectors(L.from, L.to, k); L.m.position.y = lerp(L.from.y, 0.2, k) + Math.sin(k * Math.PI) * 2.6; L.m.rotation.x += dt * 8; pulse(L.c);
    if (k >= 1){ L.c.visible = false; scene.remove(L.c); scene.remove(L.m); EN.lobs.splice(i, 1); if (L.onLand) L.onLand(L.to.x, L.to.z); hurtAt(L.to.x, L.to.z, 1.25, L.dmg, 5); } }
  for (const p of projectiles) if (p.m.userData.spin) p.m.rotation.y += dt * 20;
}
function clearEN(){ for (const L of EN.lobs){ scene.remove(L.m); scene.remove(L.c); } EN.lobs.length = 0; }
const _clearWorldE5 = clearWorld;
clearWorld = function(){ _clearWorldE5(); clearEN(); };
const _sweepHazards5 = sweepHazards;
sweepHazards = function(){ _sweepHazards5(); clearEN(); };

/* ---------- Los ogros parpadean (y miran) ---------- */
const ONI_FACES = { blue: {}, red: {} };
const ONI_FICHERO = { open: 'abierto', half: 'entornado', blink: 'parpadeo', left: 'izquierda', right: 'derecha', angry: 'enfadado' };
for (const m of ['open', 'half', 'blink', 'left', 'right', 'angry']){ ONI_FACES.blue[m] = texAsset('enemigos/oni/azul-' + ONI_FICHERO[m]); ONI_FACES.red[m] = texAsset('enemigos/oni/rojo-' + ONI_FICHERO[m]); }
function oniFlair(e, dt){
  const fm = e.mats[7] && e.mats[7].m; if (!fm || !fm.uniforms || !fm.uniforms.uMap) return;
  const set = e.type === 'redoni' || e.red ? ONI_FACES.red : ONI_FACES.blue;
  e.blinkT = (e.blinkT == null ? 1 + rnd() * 3 : e.blinkT) - dt; e.lookT = (e.lookT == null ? 2 + rnd() * 3 : e.lookT) - dt;
  if (e.lookT <= 0){ e.look = rnd() < 0.4 ? 'open' : rnd() < 0.5 ? 'left' : 'right'; e.lookT = 1.5 + rnd() * 3; }
  let mode = e.look || 'open';
  if (e.state === 'windup' || e.state === 'smash') mode = 'angry';
  else if (e.state === 'hurt') mode = 'blink';
  else if (e.blinkT < 0.14) mode = e.blinkT < 0.05 || e.blinkT > 0.1 ? 'half' : 'blink';
  if (e.blinkT <= 0) e.blinkT = 1.8 + rnd() * 3.5 + (rnd() < 0.2 ? -1.5 : 0);   // a veces parpadea dos veces seguidas
  fm.uniforms.uMap.value = set[mode];
}
const _mkOni5 = MAKERS.oni, _mkRed5 = MAKERS.redoni;
MAKERS.oni = () => { const e = _mkOni5(); e.flair = oniFlair; return e; };
MAKERS.redoni = () => { const e = _mkRed5(); e.red = true; e.flair = oniFlair; return e; };
// los brutos de piedra también apagan el ojo de vez en cuando
const _mkBrute5 = MAKERS.brute;
MAKERS.brute = () => { const e = _mkBrute5(); e.flair = (e_, dt) => { const s = e_.mats[2]; if (!s) return; e_.blinkT = (e_.blinkT == null ? 2 + rnd() * 3 : e_.blinkT) - dt;
  s.c = e_.blinkT < 0.13 ? 0x301008 : s.base; if (e_.blinkT <= 0) e_.blinkT = 2 + rnd() * 4; }; return e; };

const _v3UpdateE5 = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateE5(dt, pdt, playing); if (playing){ const edt = pdt * (slowT > 0 ? 0.3 : 1) * (timeStopT > 0 ? 0 : 1) * (invActive ? 0 : 1); try { updateLobs(edt); } catch (err) { console.error(err); } } };
if (!SFX.dash) SFX.dash = () => noise({ dur: 0.2, vol: 0.18, f0: 1800, f1: 600, q: 1.2, rv: 0.15 });
// el cangrejo tiene coraza por delante: pégale por los lados
const _cosDmgMulE5 = cosDmgMul;
cosDmgMul = function(e, src){ let m = _cosDmgMulE5(e, src);
  if (e.type === 'crab' && src !== 'dot'){ const f = e.g.rotation.y, dx = hero.position.x - e.g.position.x, dz = hero.position.z - e.g.position.z, d = Math.hypot(dx, dz) || 1;
    if ((Math.sin(f) * dx + Math.cos(f) * dz) / d > 0.45){ m *= 0.65; if (rnd() < 0.3){ tA.set(e.g.position.x, e.numY, e.g.position.z); spawnNumber(tA, '¡Clanc!', 'react', '#ffb08a'); } } }
  return m; };

'use strict';
/* ======================================================================
   CANAL X: el capítulo que cambia de estilo y de jugabilidad
   ====================================================================== */
const CH = [
  { id: 'anime',   t: 'El héroe que nadie pidió', s: 'Anime 3D · Todo como siempre (de momento)' },
  { id: 'manga',   t: 'Tinta y papel', s: 'Manga · Todos los golpes pegan un 30 % más. Los tuyos y los suyos' },
  { id: 'arcade',  t: '¡Recreativa!', s: 'Beat \'em up · La pelea se ve de lado' },
  { id: 'shmup',   t: 'Infierno de balas', s: 'Matamarcianos · Disparas solo, y ellos también' },
  { id: 'gameboy', t: 'Portátil de 1989', s: 'Cuatro verdes · Animación limitada · Todo va más lento' }
];
let chActive = false, chMode = null, chIdx = 0, chT = 22, chEp = 0, chFrame = 0, shotT = 0, onoT = 0, resOverride = null;
let trust = 0, trustRank = 9999, chSeen = new Set();
const epCard = document.getElementById('epCard'), tvStatic = document.getElementById('tvStatic'), trustEl = document.getElementById('trust');
tvStatic.style.backgroundImage = `url(${TEXTURAS['canal-x/estatica'][2]})`;

/* ---------- Plató ---------- */
const stageTex = texAsset('canal-x/plato-suelo');
function rankCanvas(){ const c = document.createElement('canvas'); c.width = 128; c.height = 96; return c; }
const rankC = rankCanvas(), rankTex = new THREE.CanvasTexture(rankC); rankTex.magFilter = THREE.NearestFilter; rankTex.minFilter = THREE.NearestFilter; rankTex.generateMipmaps = false;
function drawRanking(){
  const g = rankC.getContext('2d'); if (!g || !g.fillRect) return;
  g.fillStyle = '#0a0c30'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#ffd23a'; g.font = 'bold 11px monospace'; g.textBaseline = 'top';
  if (!g.fillText) return;
  g.fillText('RANKING DE HÉROES', 6, 4); g.fillStyle = '#4a5ad8'; g.fillRect(6, 17, 116, 1);
  const rows = [['1', 'MÍSTER CONFIANZA']];
  if (trustRank > 1) rows.push(['2', 'CAPITANA ESTRELLA'], ['3', 'DOBLE TURNO']);
  const tv = trustRank >= 9999 ? '9999' : String(trustRank);
  rows.push([tv, 'TOVAN (reparto)']);
  if (trustRank === 1){ rows[0] = ['1', 'TOVAN (reparto)']; rows[1] = ['2', 'MÍSTER CONFIANZA']; rows.length = 2; }
  g.font = 'bold 9px monospace';
  rows.forEach(([n, name], i) => { g.fillStyle = name.startsWith('TOVAN') ? '#7dff8a' : '#ffffff'; g.fillText(`${n.padStart(4, ' ')}. ${name}`, 3, 24 + i * 17); });
  rankTex.needsUpdate = true;
}
drawRanking();
const canalGroup = new THREE.Group(); scene.add(canalGroup); canalGroup.visible = false;
{ const scr = makeMat(0xffffff, { map: rankTex, emissive: 1 }), frame = makeMat(0x2a2a3a), onair = makeMat(0xff3040, { emissive: 1 }), cone = makeMat(0xfff0c0, { emissive: 1, opacity: 0.14 }),
    seat = makeMat(0x2a2440), phone = makeMat(0xcfe8ff, { emissive: 1 });
  for (const [x, z, ry] of [[-6.5, -8.2, 0.55], [6.5, -8.2, -0.55], [0, -9.5, 0]]){ const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; canalGroup.add(g);
    mesh(B(5.2, 4, 0.3), frame, 0, 3.2, 0, g); mesh(B(4.8, 3.6, 0.1), scr, 0, 3.2, 0.16, g); mesh(B(0.3, 1.4, 0.3), frame, 0, 0.7, 0, g); }
  mesh(B(1.6, 0.5, 0.1), onair, 0, 6.2, -9.3, canalGroup);
  const cols = [0xff5ad8, 0x4ad8ff, 0xffd23a, 0x7dff8a, 0xff8a3a, 0xc89aff];
  for (let i = 0; i < 6; i++){ const a = i / 6 * TAU + 0.3, x = Math.cos(a) * 8.5, z = Math.sin(a) * 8.5;
    mesh(C(0.1, 0.12, 6, 6), frame, x, 3, z, canalGroup); const c = mesh(new THREE.ConeGeometry(2, 6, 10, 1, true), makeMat(cols[i], { emissive: 1, opacity: 0.12, side: THREE.DoubleSide }), x * 0.55, 3, z * 0.55, canalGroup);
    c.rotation.z = Math.atan2(x * 0.45, 3) * 0.6; }
  for (let r = 0; r < 3; r++) for (let i = 0; i < 22; i++){ const a = Math.PI * 0.15 + i / 21 * Math.PI * 0.7 + Math.PI, R = 10 + r * 1.3;
    const x = Math.cos(a) * R, z = -Math.sin(a) * R; mesh(B(0.5, 0.9 + r * 0.4, 0.5), seat, x, 0.45 + r * 0.2, z, canalGroup);
    if (rnd() < 0.35) mesh(B(0.12, 0.18, 0.04), phone, x, 1.2 + r * 0.4, z + 0.2, canalGroup); } }
BIOMES.push({ id: 'canal', name: 'Canal X', sub: 'No toques el mando', group: canalGroup, ground: stageTex, sky: [0x05061a, 0x141a4a, 0x3a2a7a], moon: 0, fog: 0x0a0c2a,
  amb: 0x5a5a9a, light: 0xfff0e0, mount: 0x0a0c2a, fire: [1.2, 0.9, 0.6], braz: 'none', amb_: null, music: 'canal',
  enter: () => { chActive = true; chIdx = 0; chT = 22; chEp = 0; chSeen = new Set(); setChannel('anime'); trustEl.hidden = false; rune.visible = false; mountainsList.forEach(m => { m.visible = false; }); },
  exit: () => { chActive = false; setChannel(null); trustEl.hidden = true; rune.visible = true; mountainsList.forEach(m => { m.visible = true; }); } });
const CANAL = BIOMES.length - 1;

/* ---------- Cambio de canal ---------- */
function setChannel(mode){
  chMode = mode;
  document.body.classList.remove('ch-anime', 'ch-manga', 'ch-arcade', 'ch-shmup', 'ch-gameboy'); if (mode) document.body.classList.add('ch-' + mode);
  shared.uPalette.value = mode === 'gameboy' ? 1 : 0;
  resOverride = mode === 'gameboy' ? { h: 144 } : mode === 'arcade' ? { h: 200 } : null; resize();
  const Bm = BIOMES[curBiome];
  if (mode === 'gameboy'){ skyMat.uniforms.uTop.value.setHex(0x0f380f); skyMat.uniforms.uMid.value.setHex(0x306230); skyMat.uniforms.uHor.value.setHex(0x8bac0f); }
  else if (Bm){ skyMat.uniforms.uTop.value.setHex(Bm.sky[0]); skyMat.uniforms.uMid.value.setHex(Bm.sky[1]); skyMat.uniforms.uHor.value.setHex(Bm.sky[2]); }
  if (mode === 'arcade' || mode === 'shmup') camYaw = 0;
  if (mode){ chSeen.add(mode); if (chSeen.size >= CH.length) unlock('zapping'); }
}
function showEpCard(){
  const c = CH[chIdx];
  epCard.className = 'ep-' + c.id; epCard.querySelector('.epn').textContent = c.id === 'manga' ? `第${chEp}話 · EPISODIO ${chEp}` : c.id === 'arcade' ? `STAGE ${chEp}` : c.id === 'shmup' ? `WAVE ${chEp}` : `EPISODIO ${chEp}`;
  epCard.querySelector('.ept').textContent = c.t; epCard.querySelector('.eps').textContent = c.s;
  epCard.hidden = false; epCard.style.opacity = '1'; epCardT = 1.9;
}
let epCardT = 0, staticT = 0;
function switchChannel(){
  chEp++; chIdx = (chIdx + 1) % CH.length; chT = 22; staticT = 0.4; play('static');
  setChannel(CH[chIdx].id); showEpCard(); hitStop = Math.max(hitStop, 1.6);
  if (CH[chIdx].id === 'shmup') barkOnce('ch_shmup', '¿Por qué disparo bolas de luz? ¡Yo no sé hacer esto! …Ah, sí sé.');
  if (CH[chIdx].id === 'gameboy') barkOnce('ch_gb', 'Todo es verde. Me siento como un pepinillo.');
  if (CH[chIdx].id === 'manga') barkOnce('ch_manga', '¿Dónde han ido los colores? ¿Me he quedado sin tinta?');
}
function chUpdate(dt, pdt, playing){
  if (staticT > 0){ staticT -= dt; tvStatic.style.opacity = String(Math.min(1, staticT / 0.15)); tvStatic.style.backgroundPosition = `${Math.random() * 96}px ${Math.random() * 96}px`; }
  else tvStatic.style.opacity = '0';
  if (epCardT > 0){ epCardT -= dt; epCard.style.opacity = String(Math.min(1, epCardT / 0.3)); if (epCardT <= 0) epCard.hidden = true; }
  if (!chActive || !playing) return;
  if (chEp === 0){ chEp = 1; showEpCard(); hitStop = Math.max(hitStop, 1.4); }
  chT -= pdt; if (chT <= 0 && !player.dead) switchChannel();
  if (chMode === 'shmup' && !player.dead && state === 'normal' && pdt > 0){
    shotT -= pdt;
    if (shotT <= 0){ shotT = 0.17; const e = nearestEnemy(13); const a = e ? angTo(hero.position.x, hero.position.z, e.g.position.x, e.g.position.z) : hero.rotation.y;
      firePlayerShot(hero.position.x, hero.position.z, a, 14, 1.0, rdmg(9));
      play('pew'); }
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.isBoss) continue; e.shT = (e.shT == null ? 1 + rnd() * 2 : e.shT) - pdt;
      if (e.shT <= 0){ e.shT = 2.4 + rnd() * 1.2; fireOrb(e, angTo(e.g.position.x, e.g.position.z, hero.position.x, hero.position.z)); } }
  }
  trustEl.innerHTML = `CONFIANZA <b>${Math.round(trust).toLocaleString('es-ES')}</b> · Puesto <b>#${trustRank}</b>`;
}
const TRUST_STEPS = [0, 15000, 40000, 80000, 140000, 220000, 330000, 480000, 680000, 950000];
function addTrust(v){
  if (!chActive) return;
  trust = Math.max(0, trust + v);
  let r = 9999; for (let i = 0; i < TRUST_STEPS.length; i++) if (trust >= TRUST_STEPS[i]) r = i === 0 ? 9999 : 11 - i;
  if (bossE && bossE.type === 'star' && !bossE.alive) r = 1;
  if (r < trustRank && r !== 9999){ banner(`¡Subes al puesto #${r} del ranking!`, 1.4); play('tier'); }
  if (r !== trustRank){ trustRank = r; drawRanking(); }
}
const ONO = ['¡BAM!', '¡DOKAN!', '¡ZAS!', '¡POW!', '¡KRAK!', '¡GOGOGO!', '¡PAM!', '¡CHAS!'];
function onoPop(e, ko){
  if (chMode !== 'manga') return;
  if (!ko && onoT > time) return; onoT = time + 0.18;
  tA.set(e.g.position.x + (rnd() - 0.5), e.numY + 0.3, e.g.position.z); spawnNumber(tA, ko ? '¡K.O.!' : ONO[Math.floor(rnd() * ONO.length)], 'ono');
}
const chMul = () => chMode === 'manga' ? 1.3 : 1;
function clampHeroCh(){
  if (chMode !== 'arcade') return false;
  hero.position.x = clamp(hero.position.x, -9, 9); hero.position.z = clamp(hero.position.z, -1.8, 1.8); return true;
}
function clampEnemyCh(a){
  if (chMode !== 'arcade') return false;
  a.g.position.x = clamp(a.g.position.x, -9.5, 9.5); a.g.position.z = clamp(a.g.position.z, -2, 2); return true;
}
function chCamera(cam){
  if (!chActive || !(gameState === 'play' || gameState === 'paused' || gameState === 'upgrade')) return;
  if (chMode === 'arcade'){ cam.position.set(camTarget.x, 2.8, camTarget.z + 11.5); cam.lookAt(camTarget.x, 1.3, camTarget.z - 0.5); }
  else if (chMode === 'shmup'){ cam.position.set(camTarget.x, 17, camTarget.z + 1.2); cam.lookAt(camTarget.x, 0, camTarget.z); }
}

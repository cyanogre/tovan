'use strict';
/* ======================================================================
   CANAL X 2.0: cambios de estilo de verdad y un minijuego de marcianitos
   ====================================================================== */
CH.length = 0;
CH.push(
  { id: 'anime',    t: 'El héroe que nadie pidió', s: 'Anime cel-shading · Contornos de tinta, luz por bandas y mucho brillo' },
  { id: 'manga',    t: 'Tinta y papel', s: 'Manga · Todos los golpes pegan un 30 % más. Los tuyos y los suyos' },
  { id: 'vector',   t: 'Animación vectorial', s: 'Estilo Flash · Colores planos y formas que flotan' },
  { id: 'arcade',   t: '¡Recreativa!', s: 'Beat \'em up · La pelea se ve de lado' },
  { id: 'invaders', t: '¡Marcianitos!', s: 'Otro juego · Muévete de lado y dispara · La oleada te espera' },
  { id: 'paper',    t: 'Papel recortado', s: 'Stop-motion de cartón · Todo va a saltitos' }
);
const NATIVE = { h: 0 };
let chFx = null, chOutline = null, invActive = false;

/* ---------- Suelos y decorados por canal ---------- */
const floorAnime = texAsset('canal-x/suelo-anime');
const floorManga = texAsset('canal-x/suelo-manga');
const floorVector = texAsset('canal-x/suelo-vector');
const floorPaper = texAsset('canal-x/suelo-papel');
const studioG = new THREE.Group(); canalGroup.children.slice().forEach(o => studioG.add(o)); canalGroup.add(studioG);
const decoAnime = new THREE.Group(), decoManga = new THREE.Group(), decoVector = new THREE.Group(), decoPaper = new THREE.Group();
[decoAnime, decoManga, decoVector, decoPaper].forEach(g => { g.visible = false; canalGroup.add(g); });
// anime: nubes de dibujo y sol con rayos
{ const white = makeMat(0xffffff), sun = makeMat(0xffb040, { emissive: 1 }), ray = makeMat(0xffd878, { emissive: 1 });
  for (let i = 0; i < 9; i++){ const c = new THREE.Group(), a = i / 9 * TAU + 0.3, r = 15 + (i % 3) * 3; c.position.set(Math.cos(a) * r, 6 + (i % 4) * 1.6, Math.sin(a) * r); decoAnime.add(c);
    for (let k = 0; k < 4; k++){ const s = mesh(new THREE.IcosahedronGeometry(1.2 + (k % 2) * 0.5, 1), white, (k - 1.5) * 1.3, (k % 2) * 0.5, 0, c); s.scale.y = 0.7; } }
  const sunG = new THREE.Group(); sunG.position.set(0, 12, -26); decoAnime.add(sunG); decoAnime.userData.sun = sunG;
  mesh(new THREE.CircleGeometry(3.2, 24), sun, 0, 0, 0, sunG);
  for (let i = 0; i < 12; i++){ const r = mesh(new THREE.PlaneGeometry(0.7, 3.2), ray, 0, 0, -0.05, sunG); r.geometry.translate(0, 5, 0); r.rotation.z = i / 12 * TAU; } }
// manga: viñetas gigantes con borde negro, trama y onomatopeya
{ const panels = ['don', 'vacia-1', 'zas', 'vacia-2', 'go', 'vacia-3', 'bam', 'vacia-4'];
  for (let i = 0; i < 8; i++){ const a = i / 8 * TAU, r = 12.5; const p = mesh(new THREE.PlaneGeometry(5, 7.5), makeMat(0xffffff, { map: texAsset('canal-x/vineta-' + panels[i], { borde: true }), side: THREE.DoubleSide, emissive: 0.6 }),
    Math.cos(a) * r, 3.4 + (i % 2) * 1.2, Math.sin(a) * r, decoManga); p.lookAt(0, p.position.y, 0); p.rotation.z += (i % 3 - 1) * 0.08; } }
// vectorial: formas planas de colores que flotan y giran
{ const cols = [0xff6a9a, 0x6ad8ff, 0xffd84a, 0x8aff8a, 0xc88aff, 0xff9a4a];
  decoVector.userData.shapes = [];
  for (let i = 0; i < 26; i++){ const a = rnd() * TAU, r = 10 + rnd() * 12, kind = i % 3;
    const geo = kind === 0 ? new THREE.CircleGeometry(0.9 + rnd(), 20) : kind === 1 ? new THREE.CircleGeometry(1.2 + rnd(), 3) : new THREE.RingGeometry(0.7, 1.1, 20);
    const s = mesh(geo, makeMat(cols[i % cols.length], { emissive: 0.8, side: THREE.DoubleSide }), Math.cos(a) * r, 1.5 + rnd() * 9, Math.sin(a) * r, decoVector);
    s.lookAt(0, s.position.y, 0); s.userData = { spin: (rnd() - 0.5) * 2, bob: rnd() * 6, y: s.position.y }; decoVector.userData.shapes.push(s); } }
// papel recortado: árboles, nubes, sol y colinas de cartón sobre palitos
{ const kraft = makeMat(0xffffff, { map: floorPaper, side: THREE.DoubleSide }), green = makeMat(0x5a9a4a, { side: THREE.DoubleSide }), stick = makeMat(0x8a6a3a),
    cloud = makeMat(0xf4f0e6, { side: THREE.DoubleSide }), sunM = makeMat(0xffb040, { side: THREE.DoubleSide, emissive: 0.4 });
  decoPaper.userData.cut = [];
  const cut = (geo, mat, x, y, z) => { const g = new THREE.Group(); g.position.set(x, 0, z); decoPaper.add(g); const m = mesh(geo, mat, 0, y, 0, g); mesh(B(0.08, y, 0.08), stick, 0, y / 2, 0, g); g.lookAt(0, 0, 0); decoPaper.userData.cut.push(g); return g; };
  for (let i = 0; i < 10; i++){ const a = i / 10 * TAU + 0.2, r = 10 + (i % 2) * 3; cut(new THREE.CircleGeometry(1.6, 3), green, Math.cos(a) * r, 2.2 + (i % 3) * 0.4, Math.sin(a) * r); }
  for (let i = 0; i < 5; i++){ const a = i / 5 * TAU + 0.7, r = 16; const c = cut(new THREE.CircleGeometry(1.4, 12), cloud, Math.cos(a) * r, 6.5 + (i % 2), Math.sin(a) * r); c.children[0].scale.x = 1.8; }
  cut(new THREE.CircleGeometry(2.2, 10), sunM, 0, 9, -18);
  for (let i = 0; i < 6; i++){ const a = i / 6 * TAU, r = 20; cut(new THREE.CircleGeometry(4, 16, 0, Math.PI), kraft, Math.cos(a) * r, 0.1, Math.sin(a) * r); } }
[decoAnime, decoManga, decoVector, decoPaper].forEach(g => g.traverse(o => { if (o.isMesh) o.layers.enable(3); }));

/* ---------- Contornos de tinta (segunda pasada) ---------- */
const outlineMat = new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { uW: { value: 0.012 }, uCol: { value: new THREE.Color(0x101018) } },
  vertexShader: 'uniform float uW; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); mv.xyz += n * uW * max(1.0, -mv.z); gl_Position = projectionMatrix * mv; }',
  fragmentShader: 'uniform vec3 uCol; void main(){ gl_FragColor = vec4(uCol, 1.0); }' });
let heroInked = false;
function renderOutline(){
  if (!chActive || !chOutline || chMode === 'invaders') return;
  if (!heroInked){ hero.traverse(o => o.layers.enable(3)); heroInked = true; }
  for (const e of enemies) if (!e._ink){ e.g.traverse(o => o.layers.enable(3)); if (e.parts) e.parts.forEach(q => q.traverse(o => o.layers.enable(3))); e._ink = true; }
  outlineMat.uniforms.uCol.value.setHex(chOutline.col); outlineMat.uniforms.uW.value = chOutline.w;
  scene.overrideMaterial = outlineMat; camera.layers.set(3); renderer.autoClear = false;
  renderer.render(scene, camera);
  renderer.autoClear = true; camera.layers.set(0); scene.overrideMaterial = null;
}

/* ---------- Aplicar canal ---------- */
const CH_SKY = { anime: [0x2a7aff, 0x7ac0ff, 0xffd8f0], manga: [0xe8e8e8, 0xf4f4f4, 0xffffff], vector: [0xff9ad8, 0xffc8e8, 0x9af0ff], paper: [0xe8d8b8, 0xf0e4c8, 0xf8f0dc],
  arcade: [0x05061a, 0x141a4a, 0x3a2a7a], invaders: [0x000000, 0x02020a, 0x0a0a20] };
const CH_FLOOR = { anime: floorAnime, manga: floorManga, vector: floorVector, paper: floorPaper, arcade: stageTex };
setChannel = function(mode){
  if (chMode === 'invaders' && mode !== 'invaders') endInvaders();
  chMode = mode;
  document.body.classList.remove('ch-anime', 'ch-manga', 'ch-arcade', 'ch-shmup', 'ch-gameboy', 'ch-vector', 'ch-paper', 'ch-invaders');
  if (mode) document.body.classList.add('ch-' + mode);
  const styled = ['anime', 'manga', 'vector', 'paper'].includes(mode);
  if (styled && !chFx){ chFx = [shared.uSnap.value, shared.uAffine.value, shared.uDither.value]; shared.uSnap.value = 0; shared.uAffine.value = 0; shared.uDither.value = 0; }
  else if (!styled && chFx){ [shared.uSnap.value, shared.uAffine.value, shared.uDither.value] = chFx; chFx = null; }
  shared.uToon.value = mode === 'anime' || mode === 'manga' ? 1 : 0;
  shared.uFlat.value = mode === 'vector' || mode === 'paper' ? 1 : 0;
  shared.uPalette.value = 0;
  resOverride = styled ? NATIVE : null; resize();
  chOutline = mode === 'anime' ? { col: 0x141026, w: 0.011 } : mode === 'manga' ? { col: 0x000000, w: 0.016 } : mode === 'vector' ? { col: 0x3a1a5a, w: 0.013 } : mode === 'paper' ? { col: 0x5a3a1a, w: 0.01 } : null;
  studioG.visible = mode === 'arcade'; decoAnime.visible = mode === 'anime'; decoManga.visible = mode === 'manga'; decoVector.visible = mode === 'vector'; decoPaper.visible = mode === 'paper';
  if (mode){
    const sk = CH_SKY[mode] || CH_SKY.arcade; skyMat.uniforms.uTop.value.setHex(sk[0]); skyMat.uniforms.uMid.value.setHex(sk[1]); skyMat.uniforms.uHor.value.setHex(sk[2]);
    skyMat.uniforms.uStars.value = mode === 'invaders' || mode === 'arcade' ? 1.2 : 0;
    if (CH_FLOOR[mode]) ground.material.uniforms.uMap.value = CH_FLOOR[mode];
    ground.visible = mode !== 'invaders';
    shared.uFogCol.value.setHex(mode === 'manga' ? 0xffffff : mode === 'paper' ? 0xf0e4c8 : mode === 'vector' ? 0xffc8e8 : mode === 'anime' ? 0xbfe4ff : 0x0a0c2a);
  } else { ground.visible = true; }
  if (mode === 'arcade') camYaw = 0;
  if (mode === 'invaders') startInvaders();
  if (mode){ chSeen.add(mode); if (chSeen.size >= CH.length) unlock('zapping'); }
};
const _chUpdateOld = chUpdate;
chUpdate = function(dt, pdt, playing){
  if (staticT > 0){ staticT -= dt; tvStatic.style.opacity = String(Math.min(1, staticT / 0.15)); tvStatic.style.backgroundPosition = `${Math.random() * 96}px ${Math.random() * 96}px`; }
  else tvStatic.style.opacity = '0';
  if (epCardT > 0){ epCardT -= dt; epCard.style.opacity = String(Math.min(1, epCardT / 0.3)); if (epCardT <= 0) epCard.hidden = true; }
  if (!chActive) return;
  // decorados animados
  if (decoAnime.visible) decoAnime.userData.sun.rotation.z += dt * 0.3;
  if (decoVector.visible) for (const s of decoVector.userData.shapes){ s.rotation.z += dt * s.userData.spin; s.position.y = s.userData.y + Math.sin(time * 1.2 + s.userData.bob) * 0.5; }
  if (decoPaper.visible){ const st = Math.floor(time * 6) / 6; decoPaper.userData.cut.forEach((g, i) => { g.children[0].rotation.z = Math.sin(st * 2 + i) * 0.08; }); }
  if (!playing) return;
  if (chEp === 0){ chEp = 1; showEpCard(); hitStop = Math.max(hitStop, 1.4); }
  chT -= pdt; if (chT <= 0 && !player.dead) switchChannel();
  if (chMode === 'invaders') updateInvaders(pdt);
  trustEl.innerHTML = `CONFIANZA <b>${Math.round(trust).toLocaleString('es-ES')}</b> · Puesto <b>#${trustRank}</b>`;
};
chCamera = function(cam){
  if (!chActive || !(gameState === 'play' || gameState === 'paused' || gameState === 'upgrade')) return;
  if (chMode === 'arcade'){ cam.position.set(camTarget.x, 2.8, camTarget.z + 11.5); cam.lookAt(camTarget.x, 1.3, camTarget.z - 0.5); }
  else if (chMode === 'invaders'){ cam.position.set(0, 5.8, INV_Z + 14.5); cam.lookAt(0, 5.8, INV_Z); }
};

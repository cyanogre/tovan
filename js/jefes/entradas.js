'use strict';
/* ---------- Animaciones de aparición (enemigos normales) ---------- */
function spawnAnim(e, dt){
  const k = smooth(clamp(1 - e.spawnT / 0.7, 0.01, 1)), s = e.scale, T = e.type;
  if (e.isBoss){ e.g.scale.setScalar(s * k); return; }
  e.g.scale.setScalar(s * Math.min(1, 0.4 + k * 0.6));
  if (T === 'imp' || T === 'orb'){ e.g.position.y = -1.2 * (1 - k) + Math.sin(k * Math.PI) * 0.8; e.g.rotation.y += dt * 14 * (1 - k);
    if (rnd() < 0.5) spawnFx(e.g.position.x, 0.1, e.g.position.z, (rnd() - 0.5) * 2, 2, (rnd() - 0.5) * 2, 0x9a4aff, 0.07, 0.5, 4, 0); }
  else if (T === 'brute' || T === 'glass'){ e.g.position.y = -1.6 * (1 - k); if (rnd() < 0.6) puffAt(e.g.position.x, e.g.position.z, 1, 1.4);
    if (e.spawnT - dt <= 0){ shake = Math.max(shake, 0.12); play('land'); } }
  else if (T === 'oni' || T === 'redoni'){ e.g.position.y = 7 * (1 - k) * (1 - k);
    if (e.spawnT - dt <= 0){ e.g.position.y = 0; shake = Math.max(shake, 0.2); puffAt(e.g.position.x, e.g.position.z, 10, 2.2); play('land'); ringFx(e.g.position.x, e.g.position.z, 0xb8a898, 0.3, 1.8, 0.3); } }
  else if (T === 'sentinel'){ e.g.rotation.y += dt * 20 * (1 - k); e.g.scale.set(s * k, s * (2 - k), s * k); }
  if (e.spawnT - dt <= 0){ e.g.position.y = 0; e.g.scale.setScalar(s); }
}

/* ---------- Entradas de jefe ---------- */
const BOSS_CARDS = {
  boss:     ['GUARDIÁN DE LAS RUINAS', 'Centinela de piedra · Lleva mil años esperando un paquete', '#7ff5ff'],
  dragon:   ['RYŪJIN', 'Dragón de jade · No acepta devoluciones', '#7fe8c8'],
  skeleton: ['GASHADOKURO', 'Esqueleto colosal · Hecho de huesos de repartidores impuntuales', '#9fe0ff'],
  star:     ['MÍSTER CONFIANZA', 'Héroe nº 1 del Canal X · Sonríe a cámara', '#ffd23a'],
  teapot:   ['LA TETERA DE UTAH', 'Primitiva gráfica · Hirviendo desde 1975', '#f4f6ff'],
  error:    ['ERROR 404', 'Jefe no encontrado · Inténtalo más tarde', '#ff2ae0'],
  sixeyes:  ['EL DE LOS SEIS OJOS', 'Señor del Castillo Infinito · Ve todos tus movimientos', '#c89aff']
};
const bossCardEl = document.createElement('div'); bossCardEl.id = 'bossCard'; bossCardEl.innerHTML = '<div class="bc-bar"></div><div class="bc-n"></div><div class="bc-s"></div>'; document.body.appendChild(bossCardEl);
function showBossCard(t){ const c = BOSS_CARDS[t]; if (!c) return; bossCardEl.querySelector('.bc-n').textContent = c[0]; bossCardEl.querySelector('.bc-s').textContent = c[1];
  bossCardEl.style.setProperty('--bc', c[2]); bossCardEl.className = ''; void bossCardEl.offsetWidth; bossCardEl.className = 'on'; }
function hideBossCard(){ bossCardEl.className = ''; }
const bossHeadPos = (e, v) => { if (e.head && e.head.getWorldPosition && e.type !== 'dragon'){ e.head.getWorldPosition(v); v.y += 0.35 * (e.scale || 1); } else if (e.type === 'dragon') v.copy(e.head.position); else if (e.type === 'skeleton') e.skull.getWorldPosition(v); else v.set(e.g.position.x, e.numY * 0.8, e.g.position.z); return v; };
function orbitShot(e, a0, a1, d0, d1, h0, h1, lookY, dur){
  const P = e.g.position, f = e.g.rotation.y;
  return (cam, t) => { const k = smooth(clamp(t / dur, 0, 1)), a = f + lerp(a0, a1, k), d = lerp(d0, d1, k);
    cam.position.set(P.x + Math.sin(a) * d, lerp(h0, h1, k), P.z + Math.cos(a) * d); cam.lookAt(P.x, typeof lookY === 'function' ? lookY() : lookY, P.z); }; }
function headShot(e, dur){
  const v = new V3();
  return (cam, t) => { const k = smooth(clamp(t / dur, 0, 1)); bossHeadPos(e, v);
    if (e.type === 'dragon' || e.type === 'skeleton'){ const dx = hero.position.x - v.x, dz = hero.position.z - v.z, dl = Math.hypot(dx, dz) || 1, d = (e.type === 'dragon' ? 5 : 7.5) * (1 - k * 0.12);
      const a = Math.atan2(dx, dz) + 0.45; cam.position.set(v.x + Math.sin(a) * d, v.y - (e.type === 'dragon' ? 0.4 : 1.8), v.z + Math.cos(a) * d); cam.lookAt(v.x, v.y, v.z); return; }
    const f = e.g.rotation.y + 0.35, d = (1.4 + e.numY * 0.4) * (1 - k * 0.15);
    cam.position.set(v.x + Math.sin(f) * d, v.y - 0.45 - e.numY * 0.08, v.z + Math.cos(f) * d); cam.lookAt(v.x, v.y - 0.1, v.z); cam.rotation.z += 0.08 * (1 - k); }; }
const introDone = new WeakSet();
function bossIntro(e){
  if (!e || introDone.has(e) || !BOSS_CARDS[e.type] || gameState !== 'play' || invActive || player.dead) return;
  introDone.add(e);
  const T = e.type, P = e.g.position, sc = e.scale || 1, H = e.numY;
  if (T !== 'dragon' && T !== 'skeleton' && chMode !== 'arcade' && chMode !== 'shmup'){ e.g.rotation.y = angTo(P.x, P.z, hero.position.x, hero.position.z); }
  heading = angTo(hero.position.x, hero.position.z, P.x, P.z); hero.rotation.y = heading; state = 'normal'; attackW = 0; staffToBack();
  const fin = () => { hideBossCard(); e.g.visible = true; if (T !== 'dragon' && T !== 'skeleton') e.g.position.y = 0;
    if (!e.isFinal) e.g.scale.setScalar(sc); e.spawnT = 0; e.t = Math.max(e.t || 0, 0.9); if (e.lid) e.lid.position.y = 0;
    if (e.faceMat && T === 'boss') e.faceMat.uniforms.uMap.value = gFaceN; banner(`${BOSS_CARDS[T][0]}`, 1.2); };
  const tickAI = () => { cs.tick = dt => { try { updateEnemy(e, dt); } catch (err) {} }; };
  runCine(async () => {
    e.spawnT = 0; e.g.scale.setScalar(sc);
    if (T === 'boss'){
      e.g.position.y = -4.2;
      csShot(orbitShot(e, 1.15, 0.8, 7.5, 6.5, 0.5, 1.3, 1.6, 2.2)); play('roar'); shake = 0.5;
      await csTween(1.8, k => { e.g.position.y = -4.2 * (1 - smooth(k)); shake = Math.max(shake, 0.25);
        if (rnd() < 0.7){ const a = rnd() * TAU; spawnFx(P.x + Math.cos(a) * 1.2, 0.2, P.z + Math.sin(a) * 1.2, Math.cos(a) * 3, 4 + rnd() * 3, Math.sin(a) * 3, rnd() < 0.5 ? 0x6a6474 : 0x8a8494, 0.16, 0.9, 12, 0); }
        if (rnd() < 0.4) puffAt(P.x, P.z, 2, 2.2); });
      play('bossSlam'); ringFx(P.x, P.z, 0x7ff5ff, 0.4, 5, 0.5); flash('#7ff5ff', 0.3); if (e.faceMat) e.faceMat.uniforms.uMap.value = gFaceA;
      if (e.coreG){ await csTween(0.5, k => { e.coreG.scale.setScalar(1 + Math.sin(k * Math.PI) * 1.2); }); }
    } else if (T === 'star'){
      const y0 = 9; e.g.position.y = y0; const lp = e.legs, ap = e.arms;
      csShot(orbitShot(e, 1.0, 0.55, 7, 6, 0.4, 1.0, () => Math.max(1.5, e.g.position.y + 2), 2.2)); play('superOn');
      await csTween(2.0, k => { e.g.position.y = y0 * (1 - smooth(k)); ap.forEach((A, i) => { A.rotation.z = (i ? 1 : -1) * 0.3; A.rotation.x = -2.6 * (1 - k); });
        if (rnd() < 0.5) confetti(P.x + (rnd() - 0.5) * 4, 4 + rnd() * 2, P.z + (rnd() - 0.5) * 4, 3); if (rnd() < 0.15) lightFlash(P.x, 4, P.z, 0xffd23a, 1.6, 8); });
      play('bossSlam'); ringFx(P.x, P.z, 0xffd23a, 0.4, 4.5, 0.5); shake = 0.45; puffAt(P.x, P.z, 14, 3);
      ap.forEach(A => { A.rotation.x = 0; A.rotation.z = 0; });
      csShot(headShot(e, 1.2)); if (e.faceMat) e.faceMat.uniforms.uMap.value = e.face3 ? stFaceW3 : stFaceW; play('applause'); await csWait(0.9); if (e.faceMat) e.faceMat.uniforms.uMap.value = e.face3 ? stFaceN3 : stFaceN;
    } else if (T === 'teapot'){
      e.g.position.y = 14; csShot(orbitShot(e, 1.1, 0.8, 8.5, 7.5, 0.8, 1.4, () => Math.max(2, e.g.position.y), 1.4));
      await csTween(1.1, k => { e.g.position.y = 14 * (1 - k * k); e.g.rotation.y += 0.25; });
      e.g.position.y = 0; play('bossSlam'); play('clonk'); shake = 0.6; ringFx(P.x, P.z, 0xf0f2f6, 0.4, 5.5, 0.5); puffAt(P.x, P.z, 16, 3);
      csShot(orbitShot(e, 1.55, 1.3, 6.5, 6, 1.6, 2.6, 3.0, 1.2)); play('teaWhistle');
      await csTween(1.0, k => { if (e.lid) e.lid.position.y = Math.sin(k * Math.PI) * 0.9 + Math.abs(Math.sin(k * 40)) * 0.05;
        if (rnd() < 0.8) spawnFx(P.x + (rnd() - 0.5), 3.6, P.z + (rnd() - 0.5), (rnd() - 0.5), 3 + rnd() * 2, (rnd() - 0.5), 0xffffff, 0.18, 0.9, -1, 2); });
    } else if (T === 'error'){
      e.g.visible = false; csShot(orbitShot(e, 1.1, 0.7, 7, 6, 1.2, 2.2, 2, 1.8)); play('glitch');
      await csTween(1.4, k => { for (let i = 0; i < 3; i++){ const a = rnd() * TAU, r = 4 * (1 - k) + 0.5, y = 2 + (rnd() - 0.5) * 3 * (1 - k);
          spawnFx(P.x + Math.cos(a) * r, y, P.z + Math.sin(a) * r, -Math.cos(a) * 3, 0, -Math.sin(a) * 3, rnd() < 0.5 ? 0xff2ae0 : 0x20ffe0, 0.14, 0.4, 0, 0); }
        if (rnd() < 0.12){ flash(rnd() < 0.5 ? '#ff2ae0' : '#20ffe0', 0.25); play('glitch'); } });
      for (let i = 0; i < 6; i++){ e.g.visible = i % 2 === 0; e.g.scale.set(sc * (0.6 + rnd()), sc * (0.6 + rnd()), sc * (0.6 + rnd())); await csWait(0.08); }
      e.g.visible = true; e.g.scale.setScalar(sc); flash('#ff2ae0', 0.5); shake = 0.4; document.body.classList.add('glitch-hard'); await csWait(0.5); document.body.classList.remove('glitch-hard');
    } else if (T === 'sixeyes'){
      e.g.visible = false; csShot(orbitShot(e, 1.2, 0.85, 7.5, 6.5, 1.0, 1.6, 2.2, 2.4));
      for (let i = 0; i < 30; i++){ const a = rnd() * TAU; spawnFx(P.x + Math.cos(a) * 0.6, 0.3 + rnd() * 2.5, P.z + Math.sin(a) * 0.6, Math.cos(a) * 1.5, 0.5, Math.sin(a) * 1.5, rnd() < 0.5 ? 0x2a1a3a : 0x5a3a7a, 0.3, 1.4, -0.5, 2); }
      play('breath'); await csWait(0.9); e.g.visible = true; flash('#c89aff', 0.4); play('sheath');
      csShot(headShot(e, 1.4)); if (e.faceMat) e.faceMat.uniforms.uMap.value = sxFaceB; await csWait(0.5);
      if (e.faceMat) e.faceMat.uniforms.uMap.value = sxFaceN; play('iaido'); await csWait(0.4); if (e.faceMat) e.faceMat.uniforms.uMap.value = sxFaceR; lightFlash(P.x, 2.5, P.z, 0xc89aff, 2, 6); await csWait(0.4);
    } else if (T === 'dragon'){
      tickAI(); const v = new V3();
      csShot((cam, t) => { v.copy(e.head.position); cam.position.set(hero.position.x + 3.2, 1.2, hero.position.z + 3.2); cam.lookAt(v.x, v.y, v.z); });
      play('dragonRoar'); await csWait(2.6); cs.tick = null;
    } else if (T === 'skeleton'){
      tickAI();
      csShot((cam, t) => { cam.position.set(4.5, 0.8, 3.5); const v = new V3(); e.skull.getWorldPosition(v); cam.lookAt(v.x, Math.max(1, v.y - 1), v.z); });
      await csWait(2.6); cs.tick = null;
    }
    showBossCard(T); play('bossCard'); shake = Math.max(shake, 0.3);
    csShot(headShot(e, 2.2)); await csWait(2.2); hideBossCard();
  }, fin);
}
const _spawnEnemy3 = spawnEnemy;
spawnEnemy = function(type, at){
  const e = _spawnEnemy3(type, at);
  if (e && e.isBoss && BOSS_CARDS[e.type] && gameState === 'play') bossIntro(e);
  return e;
};

'use strict';
/* ======================================================================
   TRÁILER (menú de título → Tráiler): ridículo y épico, ~80 s
   Créditos absurdos · la calle bajo la lluvia · el portal · «ESTE OTOÑO» ·
   acción con las técnicas foil · enemigos colosales (y una tetera) · el
   Canal X · romance (Tovan y el paquete, con los cerezos al atardecer) ·
   amistad legendaria (Tovan, Lumen y el Gato ante la puesta de sol) ·
   críticas · el esqueleto colosal · logo. El jefe final no sale: no se
   destripa quién es el Guardián.
   Todo lo que se ve se mueve con el tiempo de la cinemática (csTween,
   csWait): nada de animaciones CSS, para poder grabarlo fotograma a
   fotograma (backup/herramientas-migracion/trailer_video.js).
   ====================================================================== */
const trl = document.createElement('div'); trl.id = 'trailer'; trl.hidden = true; trl.setAttribute('aria-live', 'polite');
trl.innerHTML = '<div class="tnegro"></div><div class="tcard"></div><div class="tsub"></div><div class="tgrito"></div>';
document.body.appendChild(trl);
const trlNegro = trl.querySelector('.tnegro'), trlCard = trl.querySelector('.tcard'), trlSub = trl.querySelector('.tsub'), trlGrito = trl.querySelector('.tgrito');
const trlObjs = [];
const trlEase = k => k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
// Rótulo centrado: entra, se queda y sale (fade y un poco de zoom). estilo: epico | romance | critica | logo | nota
function tCard(html, dur, estilo, negro){
  trlCard.className = 'tcard ' + (estilo || 'epico'); trlCard.innerHTML = html; if (negro != null) trlNegro.style.opacity = negro ? '1' : '0';
  return csTween(dur, k => { const t = k * dur, a = Math.min(1, t / 0.22, (dur - t) / 0.22);
    trlCard.style.opacity = String(Math.max(0, a)); trlCard.style.transform = `translate(-50%,-50%) scale(${1 + 0.06 * k})`; });
}
function tSub(quien, texto, dur){
  trlSub.innerHTML = (quien ? `<b>${quien}:</b> ` : '') + texto;
  return csTween(dur, k => { const t = k * dur; trlSub.style.opacity = String(Math.max(0, Math.min(1, t / 0.18, (dur - t) / 0.18))); });
}
function tGrito(texto, dur, col){
  trlGrito.textContent = texto; trlGrito.style.color = col || '#ffd23a';
  return csTween(dur, k => { const t = k * dur, e = Math.min(1, t / 0.12);
    trlGrito.style.opacity = String(Math.max(0, Math.min(1, (dur - t) / 0.15)) * e); trlGrito.style.transform = `translate(-50%,-50%) rotate(-7deg) scale(${(2.2 - 1.2 * trlEase(e)) * (1 + 0.04 * k)})`; });
}
const tNegro = (a, dur) => { const a0 = +trlNegro.style.opacity || 0; return csTween(dur || 0.4, k => { trlNegro.style.opacity = String(lerp(a0, a, k)); }); };
const tBlanco = dur => csTween(dur, k => { cineEls.white.style.opacity = String(1 - k); });
// cielo de atardecer y un sol enorme en el horizonte
function trlAtardecer(dirA){
  skyMat.uniforms.uTop.value.setHex(0x2a1650); skyMat.uniforms.uMid.value.setHex(0xff6a4a); skyMat.uniforms.uHor.value.setHex(0xffc46a);
  skyMat.uniforms.uMoonOn.value = 0; skyMat.uniforms.uStars.value = 0.2;
  shared.uFogCol.value.setHex(0xc8604a); shared.uAmb.value.setHex(0x6a4a6a); shared.uLightCol.value.setHex(0xffa060).multiplyScalar(0.9);
  const g = new THREE.Group(); scene.add(g); trlObjs.push(g);
  const sol = mesh(new THREE.CircleGeometry(16, 40), makeMat(0xffe08a, { emissive: 1, noFog: true }), 0, 0, 0, g);
  const halo = mesh(new THREE.RingGeometry(16, 26, 40), makeMat(0xff9a4a, { emissive: 1, opacity: 0.45, noFog: true }), 0, 0, -0.2, g);
  g.position.set(Math.sin(dirA) * 118, 15, Math.cos(dirA) * 118); g.lookAt(0, 15, 0); sol.renderOrder = halo.renderOrder = -1;
  return g;
}
function trlLimpia(){
  for (const o of trlObjs) scene.remove(o); trlObjs.length = 0;
  trl.hidden = true; trlCard.style.opacity = trlSub.style.opacity = trlGrito.style.opacity = '0'; trlNegro.style.opacity = '0';
  lanternProp.visible = false; lanternProp.scale.setScalar(1.6); vortexG.visible = false; boxG.visible = false; cs.walk = false; p2Override = null;
  Object.assign(cs.pose, { hold: 0, reach: 0, look: 0, armsUp: 0, readDown: 0 });
  setOutfit('hero'); taken = {}; FOIL.danza = 0; player.inv = 0; slowT = 0; clearT = -1; wave = 0;
  document.body.classList.remove('trailer'); cineEls.white.style.opacity = '0'; fadeEl.style.opacity = '0';
}
function trlJefe(tipo, at){   // un jefe ya aparecido, sin su cinemática de entrada
  const gs = gameState; gameState = 'cutscene'; const e = spawnEnemy(tipo, at); gameState = gs;
  if (e){ introDone.add(e); e.spawnT = 0; if (!e.isFinal) e.g.scale.setScalar(e.scale || 1); }
  return e;
}
const trlCerca = () => nearestEnemy(9);
const trlMira = () => { const e = trlCerca(); if (e){ heading = angTo(hero.position.x, hero.position.z, e.g.position.x, e.g.position.z); hero.rotation.y = heading; } return heading; };
function trlTropa(lista, r){ lista.forEach((t, i) => { const a = i / lista.length * TAU + 0.3; const e = spawnEnemy(t, [Math.sin(a) * r, Math.cos(a) * r]); if (e) e.speed *= 0.6; }); }

async function trailerScript(){
  const H = hero.position;
  document.body.classList.add('trailer'); trl.hidden = false; trlNegro.style.opacity = '1';
  setSong(null); applyMusVol();
  // ── Créditos absurdos ───────────────────────────────────────────
  await csWait(0.4);
  await tCard('<small>De los creadores de</small>«NO TE OLVIDES DEL ALBARÁN»', 2.6, 'epico');
  await tCard('<small>y de una linterna</small>QUE NO SE CALLA', 2.2, 'epico');
  // ── La calle, bajo la lluvia ────────────────────────────────────
  setScene('real'); setOutfit('delivery'); boxG.visible = true; lid.rotation.x = 0; boxInner.visible = false; cs.pose.hold = 1;
  H.set(6.5, 0.14, -1.45); heading = -Math.PI / 2; hero.rotation.y = heading; cs.walk = true;
  cs.tick = dt => { if (cs.walk){ H.x = Math.max(0.6, H.x - dt * 1.12); heading = -Math.PI / 2; hero.rotation.y = heading; } };
  csShot(cam => { cam.position.set(H.x - 1.7, 1.55, 2.9); cam.lookAt(H.x + 0.3, 1.25, -1.5); });
  setSong('title'); applyMusVol();
  tNegro(0, 0.9);
  await tCard('EN UN MUNDO…', 2.0, 'epico');
  await tCard('…DONDE LOS PAQUETES<br>NO SE ENTREGAN SOLOS…', 2.4, 'epico');
  play('doorbell'); await tCard('UN REPARTIDOR.', 1.4, 'epico');
  // ── El portal ───────────────────────────────────────────────────
  cs.walk = false; play('vortex'); flash('#ffffff', 0.8); shake = 0.5; vortexG.visible = true; vortexG.position.copy(H); boxG.visible = false; cs.pose.hold = 0;
  lanternProp.visible = true;
  cs.tick = dt => { vRingsCs.forEach((r, i) => { r.rotation.z += dt * (3 + i); r.rotation.x = Math.PI / 2 + Math.sin(cs.t * 3 + i) * 0.4; }); lanternProp.position.set(H.x + 0.4, 1.7, H.z + 0.4); lanternCrystal.rotation.y += dt * 3;
    if (rnd() < 0.6){ const a = rnd() * TAU; spawnFx(H.x + Math.cos(a) * 1.2, rnd() * 2.4, H.z + Math.sin(a) * 1.2, -Math.sin(a) * 3, 2, Math.cos(a) * 3, rnd() < 0.5 ? 0x9ff6ff : 0xffffff, 0.06, 0.5, 0, 0); } };
  const o0 = cs.t; csShot(cam => { const a = (cs.t - o0) * 2.4; cam.position.set(H.x + Math.sin(a) * 3.3, 1.6, H.z + Math.cos(a) * 3.3); cam.lookAt(H.x, 1.2, H.z); });
  await tGrito('¡¡AAAAAH!!', 0.9, '#ffffff');
  await tCard('UN DESTINO<br>QUE NADIE PIDIÓ.', 1.8, 'epico');
  await csTween(0.35, k => { cineEls.white.style.opacity = String(k); });
  // ── «ESTE OTOÑO» ────────────────────────────────────────────────
  vortexG.visible = false; lanternProp.visible = false; cs.tick = null; setOutfit('hero'); trlNegro.style.opacity = '1'; cineEls.white.style.opacity = '0';
  play('bossSlam'); shake = 0.4; await tCard('ESTE OTOÑO', 1.7, 'epico grande');
  // ── Acción ──────────────────────────────────────────────────────
  setScene(0); clearWorld(); H.set(0, 0, 0); grounded = true; vy = 0; wave = 3; queue.length = 0; clearT = 0;   // clearT = 0: la oleada no se cierra sola
  Object.assign(player, { hp: 99999, maxHp: 99999, dead: false }); player.inv = 9999; state = 'normal';
  trlTropa(['imp', 'oni', 'imp', 'brute', 'imp', 'sentinel', 'imp', 'oni'], 3.8);
  gameState = 'play'; setSong('battle'); applyMusVol();
  let f = trlMira();
  const orb = (r, y, vel, mira) => { const t0 = cs.t; return cam => { const a = heading + Math.PI + (cs.t - t0) * vel; cam.position.set(H.x + Math.sin(a) * r, y, H.z + Math.cos(a) * r); cam.lookAt(H.x, mira, H.z); }; };
  csShot(orb(6.2, 2.4, 0.45, 1.1)); tNegro(0, 0.25);
  await csWait(0.6); f = trlMira(); doAttack(); later(0.15, () => aguaDragon(f)); tGrito('¡ACCIÓN!', 1.3);
  await csWait(2.2);
  csShot(orb(7, 3.2, -0.6, 1)); f = trlMira(); doAttack(); later(0.12, () => truenoPrimera(f)); tGrito('¡MÁS ACCIÓN!', 1.3, '#9fe4ff');
  await csWait(2.0);
  csShot(orb(5.6, 1.9, 0.8, 1.2)); f = trlMira(); doAttack(); later(0.12, () => fuegoPuno(f)); tGrito('¡ACCIÓN CON FUEGO!', 1.3, '#ffb02a');
  await csWait(2.0);
  if (enemies.filter(e => e.alive).length < 4) trlTropa(['imp', 'imp', 'oni', 'imp'], 3.6);
  csShot(orb(8.5, 5.5, 0.35, 0.8)); FOIL.danza = 12; f = trlMira(); doAttack(); later(0.12, () => { fuegoRueda(f); slowT = 1.2; }); tGrito('¡ACCIÓN QUE NI SE ENTIENDE!', 1.6, '#ff6aa8');
  await csWait(2.6);
  // ── Enemigos colosales… y una tetera ────────────────────────────
  await tNegro(1, 0.2); clearWorld(); applyBiome(1); H.set(0, 0, 0); heading = 0; hero.rotation.y = 0;
  gameState = 'cutscene';   // un jefe que aparece jugando lanza su propia cinemática de entrada: aquí no
  const dr = trlJefe('dragon'); setSong('dragon'); applyMusVol();
  cs.tick = dt => { try { if (dr && dr.alive) updateEnemy(dr, dt); } catch (err) {} };
  csShot(cam => { const t = dr && dr.head ? dr.head.position : H, dx = t.x - H.x, dz = t.z - H.z, d = Math.hypot(dx, dz) || 1;
    cam.position.set(H.x - dx / d * 2.6 + dz / d * 1.2, 1.1, H.z - dz / d * 2.6 - dx / d * 1.2); cam.lookAt(t.x, Math.max(2, t.y), t.z); });
  tNegro(0, 0.25); await tCard('ENEMIGOS COLOSALES', 2.6, 'epico');
  await tNegro(1, 0.15); clearWorld(); applyBiome(0); H.set(0, 0, 2); heading = Math.PI; hero.rotation.y = heading;
  cs.tick = null; const tp = trlJefe('teapot', [0, -3.5]);
  if (tp){ const blanco = makeMat(0xe8ecf4, { emissive: 0.12 }); tp.g.traverse(o => { if (o.isMesh && o.material && o.material.isMeshStandardMaterial) o.material = blanco; }); tp.g.rotation.y = 0.5; }   // fuera de la playa, el metal sale negro
  csShot(dollyShot([2.6, 0.5, 4.2], [1.8, 0.9, 3.4], [0, 1.6, -3.5], [0, 2, -3.5], 2.6));
  tNegro(0, 0.2); await tCard('…Y UNA TETERA.', 2.4, 'epico');
  // ── El Canal X ──────────────────────────────────────────────────
  clearWorld(); applyBiome(CANAL); H.set(0, 0, 0); gameState = 'play'; trlTropa(['fanatic', 'imp', 'drone', 'imp'].map(t => MAKERS[t] ? t : 'imp'), 4);
  csShot(orb(4.4, 1.6, 0.4, 1.2)); corteXEmpieza('manga', 3, true); setSong('canal'); applyMusVol();
  await csWait(2.1); f = trlMira(); doAttack(); later(0.12, () => truenoPrimera(f));
  await tCard('ESTILOS DE DIBUJO<br>QUE CAMBIAN SIN AVISAR', 2.2, 'epico');
  corteXEmpieza('vector', 4, true); await csWait(2.2);
  // ── Romance ─────────────────────────────────────────────────────
  await tNegro(1, 0.3); applyBiome(1); clearWorld(); gameState = 'cutscene'; trlAtardecer(-2.4);
  H.set(0, 0, 0); heading = -2.4 + Math.PI; hero.rotation.y = heading; boxG.visible = true; cs.pose.hold = 1; cs.pose.look = -0.15;
  setSong('sakura'); applyMusVol();
  const r0 = cs.t; csShot(cam => { const a = heading + 0.55 - (cs.t - r0) * 0.07; cam.position.set(Math.sin(a) * 2.4, 1.05, Math.cos(a) * 2.4); cam.lookAt(0, 1.25, 0); });
  cs.tick = dt => { if (rnd() < dt * 4){ tA.set(H.x + (rnd() - 0.5) * 1.4, 1.4 + rnd() * 1.2, H.z + (rnd() - 0.5) * 1.4); spawnNumber(tA, '♥', 'react', rnd() < 0.5 ? '#ff6aa8' : '#ffd0e0'); }
    lanternCrystal.rotation.y += dt * 2; };
  tNegro(0, 0.6);
  await tCard('ESTE VERANO…', 2.0, 'romance');
  await tCard('ÉL ERA REPARTIDOR.', 1.8, 'romance');
  await tCard('ELLA ERA FRÁGIL.<small>(manipular con cuidado)</small>', 2.2, 'romance');
  await tSub('Tovan', '«Nunca había entregado nada tan… especial.»', 2.4);
  lanternProp.visible = true; lanternProp.position.set(H.x + 1.1, 1.6, H.z + 0.6); lanternProp.scale.setScalar(1.6);
  await tSub('Lumen', '«Es una caja de cartón.»', 2.0);
  await tCard('UN AMOR<br>CON CÓDIGO POSTAL', 2.4, 'romance');
  // ── Amistad legendaria, ante la puesta de sol ───────────────────
  await tNegro(1, 0.35); boxG.visible = false; cs.pose.hold = 0; cs.pose.look = 0; cs.tick = null;
  setScene(0); clearWorld(); const solA = 0.6; trlAtardecer(solA);
  H.set(0, 0, 0); heading = solA; hero.rotation.y = heading;
  const gato = makeSmallCat(); trlObjs.push(gato); gato.position.set(Math.sin(solA - Math.PI / 2) * 0.9, 0, Math.cos(solA - Math.PI / 2) * 0.9); gato.rotation.y = solA;
  lanternProp.visible = true; const lx = Math.sin(solA + Math.PI / 2) * 0.9, lz = Math.cos(solA + Math.PI / 2) * 0.9;
  cs.tick = dt => { lanternProp.position.set(lx, 1.55 + Math.sin(cs.t * 2) * 0.06, lz); lanternCrystal.rotation.y += dt * 2; };
  setSong('finalcalm'); applyMusVol();
  csShot(dollyShot([-Math.sin(solA) * 4.4, 0.45, -Math.cos(solA) * 4.4], [-Math.sin(solA) * 3.2, 0.8, -Math.cos(solA) * 3.2], [Math.sin(solA) * 6, 2.2, Math.cos(solA) * 6], [Math.sin(solA) * 6, 2.6, Math.cos(solA) * 6], 9));
  tNegro(0, 0.8);
  await tCard('UNA AMISTAD<br>LEGENDARIA', 2.4, 'epico');
  await tSub('', 'Un gato.', 1.0); await tSub('', 'Una linterna.', 1.0); await tSub('', 'Un repartidor sin horario.', 1.4);
  csShot(dollyShot([Math.sin(solA) * 3.2 + Math.cos(solA) * 0.8, 1.0, Math.cos(solA) * 3.2 - Math.sin(solA) * 0.8], [Math.sin(solA) * 2.6, 1.15, Math.cos(solA) * 2.6], [0, 0.9, 0], [0, 1.0, 0], 5));
  await tSub('Lumen', '«Prométeme que nunca firmaremos ese albarán.»', 2.2);
  await tSub('Tovan', '«…Te lo prometo.»', 1.4);
  play('meow'); await tSub('Gato', '«Miau.»', 1.0);
  csTween(0.5, k => { cs.pose.armsUp = Math.sin(k * Math.PI) * 0.9; gato.position.y = Math.sin(k * Math.PI) * 0.5; lanternProp.position.y += 0.02; });
  await csWait(0.25); flash('#fff3c0', 0.6); play('legend'); shake = 0.3; tGrito('¡CHOCA ESA!', 1.4, '#ffe08a');
  for (let i = 0; i < 24; i++){ const a = rnd() * TAU; spawnFx(0, 1.6, 0, Math.cos(a) * 3, 2 + rnd() * 3, Math.sin(a) * 3, rnd() < 0.5 ? 0xffd23a : 0xffffff, 0.08, 0.8, 6, 0); }
  await csWait(1.5);
  // ── Críticas ────────────────────────────────────────────────────
  await tNegro(1, 0.3); cs.tick = null; lanternProp.visible = false; setSong(null); applyMusVol();
  await tCard('<i>«Lo he visto entero.<br>Estaba dentro.»</i><b>★★★★★</b><small>— Lumen, linterna</small>', 2.0, 'critica');
  await tCard('<i>«Miau.»</i><b>★★★★★</b><small>— El Gato, crítico de cine</small>', 1.7, 'critica');
  await tCard('<i>«Una estrella. Llegó tres semanas tarde.»</i><b>★☆☆☆☆</b><small>— Cliente anónimo</small>', 2.0, 'critica');
  await tCard('<i>«Ganó un premio. Se lo robó un ladrón.»</i><b>★★★★☆</b><small>— Revista Paquetería Hoy</small>', 2.0, 'critica');
  // ── El esqueleto colosal (el jefe final no sale: nada de destripes) ──
  setScene(2); clearWorld(); H.set(0, 0, 3); heading = Math.PI; hero.rotation.y = heading; setSong('bossB'); applyMusVol();
  skyMat.uniforms.uTop.value.setHex(0x05070f); skyMat.uniforms.uMid.value.setHex(0x1a2440); skyMat.uniforms.uHor.value.setHex(0x3a4a6a); shared.uAmb.value.setHex(0x3a4a6a);
  const sk = trlJefe('skeleton', [0, -4]);
  cs.tick = dt => { try { if (sk && sk.alive) updateEnemy(sk, dt); } catch (err) {} };
  csShot(dollyShot([1.6, 0.35, 6.2], [1.0, 0.5, 5.4], [0, 3.6, -4], [0, 5.2, -4], 3.4));
  tNegro(0, 0.2);
  await tCard('ESTA VEZ…', 1.3, 'epico');
  flash('#dfe6ff', 0.6); lightFlash(0, 8, -4, 0xcfd8ff, 3, 30); play('thunder'); play('roar'); shake = 0.6;
  await tCard('…ES PERSONAL.', 1.8, 'epico grande');
  // ── Montaje final a toda velocidad ──────────────────────────────
  trlNegro.style.opacity = '1'; cs.tick = null; play('bossSlam');
  for (const [t, c] of [['¡DRAGONES DE TINTA!', '#9fe4ff'], ['¡HORDAS DE LADRONES!', '#ffd23a'], ['¡CINCO ESTRELLAS!', '#ffe08a'], ['¡UNA TETERA!', '#ff6aa8'], ['¡OTRA VEZ LA TETERA!', '#7dffb0']]){
    flash('#ffffff', 0.25); play('hit'); await tGrito(t, 0.6, c); }
  // ── Logo ────────────────────────────────────────────────────────
  setSong('title'); applyMusVol(); play('legend');
  await tCard('<b class="lt">TOVAN</b><span class="ls">LAS RUINAS SIN FIN</span><span class="lp">PRÓXIMAMENTE EN TU NAVEGADOR</span><span class="lx">Ya disponible, de hecho. Haz doble clic.</span><span class="lr">NO RECOMENDADO PARA GATOS</span>', 4.6, 'logo');
  await csWait(0.4);
}
function runTrailer(){
  titleScr.hidden = true; initAudio(); clearWorld(); player.dead = false;
  runCine(trailerScript, () => { trlLimpia(); toTitle(); });
}
// botón en el menú de título, tras «Introducción»
{ const b = document.createElement('button'); b.className = 'win tbtn'; b.id = 'trailerBtn';
  b.innerHTML = '<span class="ti">🎞️</span><span class="tl">Tráiler</span><span class="td">Ridículo y épico</span>';
  b.addEventListener('click', () => { play('confirm'); runTrailer(); }); document.getElementById('introBtn').after(b); }

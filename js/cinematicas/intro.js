'use strict';
/* ---------- El guion ---------- */
async function introScript(){
  const H = hero.position;
  // ── 1. EXT. CALLE — NOCHE. Llueve. ──────────────────────────────
  setScene('real'); setOutfit('delivery'); boxG.visible = true; lid.rotation.x = 0; boxInner.visible = false; csM.box.uniforms.uEmissive.value = 0;
  H.set(8.8, 0.14, -1.45); heading = -Math.PI / 2; hero.rotation.y = heading; cs.pose.hold = 1; cs.walk = true;
  cineEls.white.style.opacity = '0'; fadeEl.style.opacity = '1';
  csShot(dollyShot([11, 8, 10], [7.8, 2.2, 4.4], [2, 0.3, -2.5], [5.6, 1.1, -1.6], 5));
  cs.tick = dt => { if (cs.walk){ H.x = Math.max(0.35, H.x - dt * 1.12); heading = -Math.PI / 2; if (H.x <= 0.35) cs.walk = false; } };
  csTween(1.4, k => { fadeEl.style.opacity = String(1 - k); });
  await csWait(1.0); csCaption('El mundo real. 23:47. Llueve.');
  await csWait(3.2); csCaption('');
  // ── 2. Travelling lateral siguiendo a Tovan ─────────────────────
  csShot(cam => { cam.position.set(H.x - 1.2, 1.45, 1.9); cam.lookAt(H.x + 0.2, 1.15, -1.5); });
  while (cs.walk) await csWait(0.1);
  heading = Math.PI; await csWait(0.5);
  // ── 3. Puerta del anticuario: panorámica del cartel a Tovan ─────
  csShot(dollyShot([2.6, 1.35, -2.15], [2.25, 1.5, -2.05], [-0.4, 2.85, -3.1], [0.3, 1.65, -1.55], 2.6));
  cs.pose.look = 0.35; await csWait(2.2); cs.pose.look = 0;
  await csSay([['tovan', '¡Envíos Relámpago! Traigo un paquete para…']]);
  cs.pose.readDown = 1; await csWait(0.7); cs.pose.readDown = 0;
  await csSay([['tovan', '…«el Guardián de las Ruinas». Vaya nombre para un anticuario.']]);
  csTween(0.25, k => { cs.pose.hold = 1 - k; cs.pose.reach = k; }); await csWait(0.35);
  play('doorbell'); await csWait(0.4);
  csTween(0.3, k => { cs.pose.reach = 1 - k; cs.pose.hold = k; }); await csWait(1.4);
  await csSay([['tovan', '¿Hola? Necesito una firma.']]);
  await csWait(0.9); play('meow');
  // ── 4. Contraplano: el gato ─────────────────────────────────────
  csShot(dollyShot([-2.5, 1.4, -0.9], [-2.9, 1.3, -1.5], [-3.7, 1.25, -2.7], [-3.7, 1.3, -2.7], 2.5));
  await csSay([['gato', 'Miau.'], ['tovan', 'Tú no serás el Guardián, ¿verdad?'], ['gato', '…'], ['tovan', 'Ya me parecía.']]);
  // ── 5. Por encima del hombro: la etiqueta ───────────────────────
  csShot(dollyShot([0.9, 2.15, -2.95], [0.7, 2.05, -2.85], [0.35, 1.0, -1.95], [0.35, 1.05, -1.9], 2));
  cs.pose.readDown = 1; await csWait(0.6);
  cineEls.label.classList.add('on'); play('paper'); await csWait(0.5);
  await csSay([['tovan', '«Contenido: linterna antigua. NO ENCENDER. NO SACAR DE LA CAJA.»'], ['tovan', 'Qué dramático. Seguro que es una lámpara de mesita.', 'happy']]);
  cineEls.label.classList.remove('on'); cs.pose.readDown = 0;
  // ── 6. La caja brilla ───────────────────────────────────────────
  csShot(dollyShot([1.5, 1.45, -3.0], [1.1, 1.55, -2.85], [0.3, 1.4, -1.55], [0.3, 1.45, -1.55], 3));
  play('hum'); p2Override = { pos: new V3(), col: [0, 0, 0], range: 2.6 };
  csTween(2.2, k => { csM.box.uniforms.uEmissive.value = k * 0.6; boxG.getWorldPosition(p2Override.pos); p2Override.col = [0.3 * k * 2, 0.9 * k * 2, 1.0 * k * 2]; });
  await csWait(1.6);
  await csSay([['tovan', '…¿Por qué brilla la caja?']]);
  play('boxOpen'); boxInner.visible = true;
  await csTween(0.35, tw(0, -1.9, v => { lid.rotation.x = v; }));
  flash('#bff6ff', 0.5); shake = 0.2;
  boxG.getWorldPosition(tA); lanternProp.position.copy(tA); lanternProp.visible = true;
  const lp0 = tA.clone(), lp1 = new V3(0.35, 1.95, -2.35);
  cs.tick = dt => { lanternCrystal.rotation.y += dt * 2; lanternProp.rotation.y += dt * 0.6; p2Override.pos.copy(lanternProp.position); p2Override.col = [0.5, 1.4, 1.7]; };
  csShot(dollyShot([1.1, 1.3, -0.5], [0.95, 1.75, -0.8], [0.35, 1.3, -2.2], [0.35, 1.9, -2.3], 2.2));
  await csTween(1.8, k => { lanternProp.position.lerpVectors(lp0, lp1, smooth(k)); lanternProp.position.y += Math.sin(k * 9) * 0.03; });
  cs.tick = dt => { lanternCrystal.rotation.y += dt * 2; lanternProp.rotation.y += dt * 0.6; lanternProp.position.y = 1.95 + Math.sin(cs.t * 2) * 0.05; p2Override.pos.copy(lanternProp.position); };
  cs.pose.look = 0.3;
  await csSay([['lumen?', '…Por fin. Luz. Aire. Y… ¿eso es lluvia?'], ['tovan', '¡¿La lámpara habla?!'],
    ['lumen?', 'Linterna. Linterna sagrada, guardiana del sello. Escúchame bien, repartidor:'],
    ['lumen?', 'pase lo que pase, NO me toques con las manos moja—']]);
  // ── 7. La agarra. Portal. ───────────────────────────────────────
  csTween(0.2, k => { cs.pose.reach = k; cs.pose.hold = 1 - k; }); await csWait(0.25);
  play('vortex'); flash('#ffffff', 0.9); shake = 0.5; vortexG.visible = true; vortexG.position.copy(H); boxG.visible = false;
  csShout('¡¡AAAAAAH!!');
  cs.tick = dt => { vortexG.position.set(H.x, H.y, H.z); vRingsCs.forEach((r, i) => { r.rotation.z += dt * (3 + i); r.rotation.x = Math.PI / 2 + Math.sin(cs.t * 3 + i) * 0.4; r.scale.setScalar(1 + Math.sin(cs.t * 8 + i) * 0.08); });
    lanternProp.position.set(H.x + 0.3, 1.6, H.z + 0.4); for (let i = 0; i < 3; i++){ const a = rnd() * TAU; spawnFx(H.x + Math.cos(a) * 1.2, rnd() * 2.4, H.z + Math.sin(a) * 1.2, -Math.sin(a) * 3, 2, Math.cos(a) * 3, rnd() < 0.5 ? 0x9ff6ff : 0xffffff, 0.06, 0.5, 0, 0); }
    lightFlash(H.x, 1.5, H.z, 0x9ff6ff, 1.8, 7); };
  const o0 = cs.t; csShot(cam => { const a = (cs.t - o0) * 2.4; cam.position.set(H.x + Math.sin(a) * 3.3, 1.6 + Math.sin(a * 0.5) * 0.4, H.z + Math.cos(a) * 3.3); cam.lookAt(H.x, 1.2, H.z); });
  await csTween(1.6, k => { cineEls.white.style.opacity = String(Math.max(0, (k - 0.45) / 0.55)); });
  // ── 8. EL VACÍO: transformación ─────────────────────────────────
  setScene('void'); vortexG.visible = false; H.set(0, 1.4, 0); cs.pose.reach = 0; cs.pose.hold = 0; cs.pose.look = 0;
  lanternProp.position.set(0, 2.2, 1.1);
  setSong('title'); applyMusVol();
  let spin = 0;
  cs.tick = dt => { spin += dt * 1.6; heading = spin; hero.rotation.y = spin; H.y = 1.4 + Math.sin(cs.t * 1.8) * 0.12;
    lanternCrystal.rotation.y += dt * 2; lanternProp.position.y = 2.25 + Math.sin(cs.t * 2.3) * 0.08;
    p2Override.pos.copy(lanternProp.position); p2Override.col = [0.5, 1.4, 1.7]; p2Override.range = 4;
    if (rnd() < 0.3){ const a = rnd() * TAU; spawnFx(Math.cos(a) * 3, rnd() * 4, Math.sin(a) * 3, 0, 0.3, 0, 0x9ff6ff, 0.05, 1, -0.2, 0); } };
  const o1 = cs.t; csShot(cam => { const a = (cs.t - o1) * 0.35 + 0.4; cam.position.set(Math.sin(a) * 5.4, 2.7, Math.cos(a) * 5.4); cam.lookAt(0, 2.55, 0); });
  await csTween(0.8, k => { cineEls.white.style.opacity = String(1 - k); });
  await csSay([['lumen', 'Tranquilo. Estás entre dos mundos. Y no puedes salvar uno vestido así.']]);
  const beats = [['cap', 'La gorra, fuera.'], ['shirt', 'El uniforme…'], ['pack', 'La mochila…'], ['legs', 'Esos pantalones cortos…'], ['scarf', 'Y un toque de estilo.']];
  for (let i = 0; i < beats.length; i++){
    const [part] = beats[i];
    tA.set(0, part === 'cap' ? 2.6 : part === 'legs' ? 0.9 : 1.9, 0);
    for (let j = 0; j < 22; j++){ const a = rnd() * TAU, e = rnd() * 2; spawnFx(tA.x, tA.y + H.y - 1.4, tA.z, Math.cos(a) * 2.6, e, Math.sin(a) * 2.6, j % 3 ? 0x9ff6ff : 0xffd970, 0.07, 0.6, 2, 0.3); }
    ringFx(0, 0.3, 0x9ff6ff, 0.2, 1.8, 0.4, H.y - 0.9); flash('#dff9ff', 0.45); lightFlash(0, 2, 0, 0xbff6ff, 2, 6);
    play('transform' + i); outfitPart(part, false); csShout(['¡PUF!', '¡ZAS!', '¡CHAS!', '¡PLIN!', '¡TA-DÁ!'][i]);
    await csWait(0.85);
  }
  cs.tick = dt => { lanternCrystal.rotation.y += dt * 2; H.y = 1.4 + Math.sin(cs.t * 1.8) * 0.12; heading = lerpAngle(heading, 0.4, 1 - Math.exp(-dt * 4)); hero.rotation.y = heading; };
  await csTween(0.6, k => { cs.pose.armsUp = Math.sin(k * Math.PI) * 0.9; });
  waveT = 1.5; play('specialCharge');
  const lp2 = lanternProp.position.clone();
  await csTween(0.9, k => { staffTip.getWorldPosition(tB); lanternProp.position.lerpVectors(lp2, tB, smooth(k)); lanternProp.scale.setScalar(1.6 * (1 - k * 0.7)); });
  lanternProp.visible = false; flash('#bff6ff', 0.4); play('meter'); p2Override = null;
  await csSay([['lumen', '…Mejor. Mucho mejor. De nada.'], ['tovan', '¿Salvar el mundo? ¡¿Y mi uniforme?! ¡Me lo van a descontar del sueldo!'], ['lumen', 'Agárrate fuerte.']]);
  // ── 9. Caída en las Ruinas del Ocaso ────────────────────────────
  play('vortex'); await csTween(0.5, k => { cineEls.white.style.opacity = String(k); });
  setScene(0); H.set(0, 11, 0); heading = 0.6; hero.rotation.y = heading; grounded = false; vy = -2; cs.tick = null;
  csShot(dollyShot([4.2, 0.9, 5.6], [4.0, 1.0, 5.4], [0, 3.5, 0], [0, 1.1, 0], 1.2));
  await csTween(0.4, k => { cineEls.white.style.opacity = String(1 - k); });
  play('fall'); csShout('¡¡UAAAAH!!');
  while (!grounded) await csWait(0.05);
  shake = 0.45; flash('#ffffff', 0.3); play('bossSlam'); puff(14, 2.4); ringFx(0, 0, 0xb8a898, 0.2, 2.4, 0.4);
  await csWait(1.1);
  csShot(dollyShot([4.0, 1.0, 5.4], [2.3, 1.55, 3.3], [0, 1.1, 0], [0, 1.4, 0], 1.6));
  await csWait(0.6);
  await csSay([['lumen', 'Bienvenido a las Ruinas del Ocaso. Soy Lumen, guardiana del sello.'],
    ['tovan', 'Encantado… creo. ¿Me firmas el albarán?', 'happy'],
    ['lumen', 'Al sacarme de la caja has roto el sello. Los monstruos van a salir. En oleadas. Muchas oleadas.'],
    ['tovan', '¿Y entonces quién me firma a mí?'],
    ['lumen', '¡OLVIDA EL ALBARÁN! Agarra el bastón y pega a todo lo que tenga dientes.'],
    ['tovan', 'Que conste que esto no entra en mi horario.', 'happy'],
    ['lumen', 'Si caes, te traeré de vuelta con fragmentos de monstruo. Cobro en fragmentos, claro.']]);
}
function runIntro(){
  applyCosmetics(true);
  cs.active = true; cs.aborted = false; cs.t = 0; cs.waits = []; cs.tweens = []; cs.tick = null; cs.cam = null;
  Object.assign(cs.pose, { hold: 0, reach: 0, look: 0, armsUp: 0, readDown: 0 });
  gameState = 'cutscene'; document.body.classList.add('cine');
  hud.hidden = true; waveBox.hidden = true; tagsEl.hidden = true; cineEls.skip.hidden = false;
  setSong(null); applyMusVol();
  introScript().then(() => finishIntro(), err => { if (err !== csAbortErr) console.error(err); finishIntro(); });
}
function csAbort(){
  if (!cs.active || cs.aborted) return;
  cs.aborted = true; play('confirm');
  for (const w of cs.waits) w.rej(csAbortErr); for (const w of cs.tweens) w.rej(csAbortErr);
  cs.waits = []; cs.tweens = [];
  if (dlg.lines){ dlgEl.hidden = true; dlg.lines = null; if (cs.sayRej) cs.sayRej(csAbortErr); }
}
function finishIntro(){
  if (!cs.active) return;
  unlock('intro'); if (!cs.aborted) unlock('introFull');
  cs.active = false; cs.cam = null; cs.tick = null; cs.walk = false; Object.assign(cs.pose, { hold: 0, reach: 0, look: 0, armsUp: 0, readDown: 0 });
  document.body.classList.remove('cine'); csCaption(''); cineEls.label.classList.remove('on'); cineEls.skip.hidden = true;
  cineEls.white.style.opacity = '0'; fadeEl.style.opacity = '0'; dlgEl.hidden = true; dlg.lines = null;
  setScene(0); setOutfit('hero'); applyCosmetics(false); lanternProp.visible = false; vortexG.visible = false; p2Override = null;
  hero.position.set(0, 0, 0); grounded = true; vy = 0; heading = camYaw + Math.PI; hero.rotation.y = heading;
  camTarget.set(0, 1.1, 0);
  hud.hidden = false; waveBox.hidden = false; gameState = 'play'; startWave(1);
}
cineEls.skip.addEventListener('click', e => { e.stopPropagation(); csAbort(); });

Object.assign(SFX, {
  rain:      () => noise({ dur: 0.35, vol: 0.035, f0: 5000, f1: 3000, type: 'highpass', q: 0.4, rv: 0.1 }),
  doorbell:  () => { tone({ type: 'sine', f0: NOTE(76), dur: 0.9, vol: 0.14, rv: 0.4 }); tone({ type: 'sine', f0: NOTE(72), dur: 1.2, vol: 0.14, when: 0.45, rv: 0.4 }); },
  meow:      () => { tone({ type: 'square', f0: 700, f1: 1000, dur: 0.18, vol: 0.05, rv: 0.2 }); tone({ type: 'square', f0: 1000, f1: 520, dur: 0.35, vol: 0.05, when: 0.16, rv: 0.2 }); },
  paper:     () => noise({ dur: 0.18, vol: 0.12, f0: 3000, q: 1.5, rv: 0.05 }),
  hum:       () => { tone({ type: 'sine', f0: 110, f1: 220, dur: 2.4, vol: 0.12, attack: 0.8, rv: 0.5 }); tone({ type: 'triangle', f0: 440, f1: 880, dur: 2.4, vol: 0.04, attack: 1.2, rv: 0.8 }); },
  boxOpen:   () => { noise({ dur: 0.25, vol: 0.15, f0: 600, q: 2, rv: 0.2 }); seq_([[81, 0.4], [88, 0.4], [93, 0.8]], 'triangle', 0.08, 0.1, 0.9); },
  vortex:    () => { noise({ dur: 1.6, vol: 0.3, f0: 200, f1: 5000, q: 1.5, rv: 0.7, attack: 0.2 }); [0, 4, 7, 11, 14].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(60 + n), dur: 1.4, vol: 0.06, when: i * 0.08, rv: 0.9 })); },
  transform0: () => seq_([[72, 0.3]], 'triangle', 0.1, 0.14, 0.7), transform1: () => seq_([[76, 0.3]], 'triangle', 0.1, 0.14, 0.7),
  transform2: () => seq_([[79, 0.3]], 'triangle', 0.1, 0.14, 0.7), transform3: () => seq_([[83, 0.3]], 'triangle', 0.1, 0.14, 0.7),
  transform4: () => { seq_([[84, 0.8]], 'triangle', 0.1, 0.16, 0.9); [60, 64, 67, 72].forEach(n => tone({ type: 'sine', f0: NOTE(n), dur: 1.2, vol: 0.06, rv: 0.8 })); },
  fall:      () => tone({ type: 'sine', f0: 1400, f1: 300, dur: 1.0, vol: 0.07, rv: 0.3 })
});

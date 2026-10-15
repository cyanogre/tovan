'use strict';
/* ---------- Finales ---------- */
const ENDINGS = [
  { id: 'home',     type: 'Bueno',      name: 'Entrega completada',       desc: 'Tovan consigue la firma (con la pata) y vuelve a casa. Por fin.', rw: [['title', 'Repartidor del mes']] },
  { id: 'anime',    type: 'Bueno',      name: 'Temporada 2 confirmada',   desc: 'Tanta referencia acabó convirtiendo a Tovan en protagonista de anime.', hint: 'Lleva 3 cartas Otaku.', rw: [['title', 'Protagonista']] },
  { id: 'fired',    type: 'Malo',       name: 'Despedido',                desc: 'Tres semanas para entregar un paquete. El jefe no lo perdona.', hint: 'Llega tarde o con muy poca vida.', rw: [['title', 'Despedido']] },
  { id: 'villain',  type: 'Malo',       name: 'El nuevo Guardián',        desc: 'Tovan se sienta en el trono de las ruinas. Ya no quiere volver.', hint: 'Mucha sangre, muchas bajas.', rw: [['title', 'Guardián oscuro']] },
  { id: 'loop',     type: 'Malo',       name: 'El bucle',                 desc: 'Llega otro paquete para el Guardián de las Ruinas. Todo vuelve a empezar.', hint: 'Algo que se repite…', rw: [['title', 'Déjà vu']] },
  { id: 'beach',    type: 'Aleatorio',  name: 'Vacaciones pagadas',       desc: 'Tovan se queda a vivir en la playa del mundo real.', rw: [['title', 'Turista']] },
  { id: 'truck',    type: 'Aleatorio',  name: 'Otra vez no',              desc: 'Volviendo a casa, un camión… Volumen 2.', rw: [['title', 'Isekai en serie']] },
  { id: 'lamp',     type: 'Aleatorio',  name: 'La lámpara de mesita',     desc: 'Lumen se jubila como lámpara de mesita. No está contenta.', rw: [['title', 'Amigo de la lámpara']] },
  { id: 'glitch',   type: 'Aleatorio',  name: 'Final no encontrado',      desc: 'ERROR: final_bueno.exe no encontrado. ¿Reintentar? [Sí] [Sí]', rw: [['title', 'NullPointerException']] },
  { id: 'true',     type: 'Verdadero',  name: 'Por fin en casa',          desc: 'Tovan, Lumen y el Gato. Juntos. Y con el albarán firmado.', hint: 'Consigue todos los demás finales.', rw: [['hat', 'catears'], ['title', 'El que firmó']] }
];
function pickEnding(){
  const got = meta.endings || {};
  if (!Object.keys(got).length) return 'home';
  if (ENDINGS.every(x => x.id === 'true' || got[x.id])) return 'true';
  const otaku = UPGRADES.filter(u => (u.tags || []).includes('otaku') && lvl(u.id)).length;
  const conds = [];
  if (otaku >= 3) conds.push('anime');
  if (setOn('sangre') || kills >= 250) conds.push('villain');
  if (isekaiRun || player.hp < player.maxHp * 0.3) conds.push('fired');
  if (lvl('echo')) conds.push('loop');
  if (meta.cos.body === 'missing') conds.push('glitch');
  const lockedConds = conds.filter(id => !got[id]); if (lockedConds.length) return lockedConds[0];
  const pool = ['beach', 'truck', 'lamp', 'glitch', 'home'], locked = pool.filter(id => !got[id]);
  if (conds.length && rnd() < 0.5) return conds[Math.floor(rnd() * conds.length)];
  const from = locked.length ? locked : pool; return from[Math.floor(rnd() * from.length)];
}
// piso de Tovan (para los finales que terminan en casa)
const homeGroup = new THREE.Group(); scene.add(homeGroup); homeGroup.visible = false;
const woodFloor = texAsset('mundo/anticuario-suelo');
const wallpaper = texAsset('mundo/anticuario-pared');
{ const wood = makeMat(0x6a4028), sheet = makeMat(0xe8e4f0), blanket = makeMat(0x3a4ab8), pillow = makeMat(0xf4f4f4), wp = makeMat(0xffffff, { map: wallpaper }), fl = makeMat(0xffffff, { map: woodFloor });
  const win = makeMat(0xffffff, { map: winTexB, emissive: 0.9 }), tv = makeMat(0x101018), tvs = makeMat(0x4ad8ff, { emissive: 1 }), poster = makeMat(0xffffff, { map: packTex, emissive: 0.2 });
  mesh(scaleUV(B(12, 0.1, 12), 3, 3), fl, 0, -0.05, 0, homeGroup);
  mesh(scaleUV(B(12, 5, 0.2), 4, 2), wp, 0, 2.5, -4.5, homeGroup); mesh(scaleUV(B(0.2, 5, 12), 4, 2), wp, -5, 2.5, 0, homeGroup); mesh(scaleUV(B(0.2, 5, 12), 4, 2), wp, 5, 2.5, 0, homeGroup);
  mesh(B(2.6, 1.6, 0.1), win, 1.5, 2.6, -4.38, homeGroup); mesh(B(2.8, 0.12, 0.2), wood, 1.5, 1.75, -4.35, homeGroup);
  const bed = new THREE.Group(); bed.position.set(-2.6, 0, -2.6); homeGroup.add(bed);
  mesh(B(2.2, 0.4, 3.2), wood, 0, 0.2, 0, bed); mesh(B(2.1, 0.25, 3.1), sheet, 0, 0.52, 0, bed); mesh(B(2.12, 0.1, 2.0), blanket, 0, 0.66, 0.5, bed); mesh(B(0.9, 0.2, 0.5), pillow, 0, 0.72, -1.2, bed); mesh(B(2.2, 1.0, 0.15), wood, 0, 0.5, -1.62, bed);
  homeGroup.userData.bed = bed;
  const ns = new THREE.Group(); ns.position.set(-0.9, 0, -3.6); homeGroup.add(ns); mesh(B(0.7, 0.7, 0.6), wood, 0, 0.35, 0, ns); homeGroup.userData.ns = ns;
  mesh(B(1.8, 0.8, 0.6), wood, 3.4, 0.4, -3.8, homeGroup); mesh(B(1.4, 0.8, 0.1), tv, 3.4, 1.3, -3.9, homeGroup); mesh(B(1.25, 0.65, 0.02), tvs, 3.4, 1.3, -3.84, homeGroup);
  mesh(B(0.9, 1.2, 0.02), poster, -1.2, 2.8, -4.38, homeGroup); mesh(B(1.1, 2.2, 0.12), wood, 4.9, 1.1, 1.5, homeGroup); }
const endEl = document.getElementById('endCard');
let endingId = null;
function setWorld(kind){
  // cambia de «decorado» para las escenas de los finales
  finalGroup.visible = false; homeGroup.visible = false; realGroup.visible = false;
  if (kind === 'home'){ applyBiome(0); BIOMES[0].group.visible = false; ground.visible = false; rune.visible = false; braz.visible = false; blob.visible = true; mountainsList.forEach(m => { m.visible = false; });
    homeGroup.visible = true; skyMat.uniforms.uTop.value.setHex(0x05070f); skyMat.uniforms.uMid.value.setHex(0x0a0e1e); skyMat.uniforms.uHor.value.setHex(0x1a1e2e);
    lampOverride = { pos: new V3(-0.9, 1.6, -3.4), col: [1.3, 1.0, 0.6], range: 9 }; shared.uAmb.value.setHex(0x4a4a60); ambMode = null; ambP.forEach(p => { p.visible = false; }); }
  else if (kind === 'street'){ applyBiome(0); setScene('real'); }
  else if (typeof kind === 'number') applyBiome(kind);
}
function endingScript(id){
  return async () => {
    const H = hero.position;
    const kit = makeSmallCat(); kit.userData.smallCat = true; kit.position.set(0, 0, -2); kit.rotation.y = 0;
    H.set(0, 0, 0.5); heading = Math.PI; hero.rotation.y = heading; setOutfit('hero');
    csShot(dollyShot([2.2, 1.3, 2.5], [1.8, 1.1, 2.1], [0, 0.6, -1], [0, 0.5, -1], 3));
    await csSay([['gato', '…Miau.'], ['lumen', 'Se ha rendido. Creo. Es difícil leer caras de gato.'], ['tovan', 'Bueno, gato… Guardián… ¿Me firmas el albarán?']]);
    play('stamp'); csShout('¡PLAF!'); await csWait(0.8);
    await csSay([['tovan', '¡Con la pata! ¡Firmado! ¡Entrega completada!', 'happy']]);
    await csTween(0.6, k => { cineEls.white.style.opacity = String(k); }); scene.remove(kit);
    const cut = async (world, pos, look, dur) => { setWorld(world); await csTween(0.4, k => { cineEls.white.style.opacity = String(1 - k); }); };
    if (id === 'home' || id === 'true' || id === 'lamp'){
      setWorld('home'); H.set(3.5, 0, 2); heading = -2.3; hero.rotation.y = heading;
      const lamp = lanternProp; lamp.visible = id !== 'home'; lamp.scale.setScalar(1.6); lamp.position.set(-0.9, 0.95, -3.6);
      const cat2 = id === 'true' ? makeSmallCat() : null; if (cat2){ cat2.position.set(-2.6, 0.78, -2.2); cat2.rotation.y = 0.4; }
      csShot(dollyShot([3.5, 2.4, 4.5], [2.5, 2.0, 3.8], [0, 1, -2], [-1.5, 0.8, -2.5], 4));
      await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
      setSong(id === 'true' ? 'render' : 'finalcalm'); applyMusVol();
      cs.walk = true; await csTween(1.6, k => { H.x = lerp(3.5, -1.6, k); H.z = lerp(2, -1.8, k); heading = Math.atan2(-5.1, -3.8); }); cs.walk = false;
      if (id === 'home') await csSay([['tovan', 'Por fin en casa. Qué día. Qué tres semanas.'], ['tovan', 'Mañana… libre. ¿Verdad? ¿VERDAD?']]);
      if (id === 'lamp') await csSay([['lumen', 'Soy una linterna sagrada. Guardiana del sello. Y ahora soy… una lámpara de mesita.'], ['tovan', 'Das una luz muy bonita para leer.', 'happy'], ['lumen', 'Esto es humillante.']]);
      if (id === 'true') await csSay([['lumen', 'El Guardián dice que puedo quedarme contigo. Si me cambias las pilas.'], ['tovan', 'Tú no llevas pilas.'], ['lumen', 'Exacto.'], ['gato', 'Miau.'],
        ['tovan', '…¿Y ahora el gato vive aquí también?'], ['lumen', 'El gato vive donde quiere. Es el Guardián.'], ['tovan', 'Bienvenidos a casa.', 'happy']]);
      csShot(dollyShot([-1.2, 3, 1], [-1.5, 4, 2], [-2.6, 0.6, -2.6], [-2.6, 0.6, -2.6], 3)); await csWait(2);
      if (cat2) scene.remove(cat2); lanternProp.visible = false;
    } else if (id === 'fired' || id === 'loop' || id === 'truck'){
      setWorld('street'); setOutfit('delivery'); boxG.visible = false; H.set(3, 0.14, -1.45); heading = -Math.PI / 2;
      csShot(dollyShot([4.5, 1.6, 2.5], [3.5, 1.4, 2.2], [2, 1, -1.5], [1, 1, -1.5], 4));
      await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
      if (id === 'fired'){ play('doorbell'); await csSay([['jefe', 'Tovan. Tres semanas para entregar un paquete.'], ['tovan', '¡Es que me atropelló un camión y acabé en otro mundo! ¡Y luego en otro! ¡Y el paquete era un gato!'],
        ['jefe', 'Estás despedido.'], ['tovan', '…Por lo menos está firmado.']]); }
      if (id === 'loop'){ boxG.visible = true; cs.pose.hold = 1; await csSay([['tovan', 'Bueno, último reparto del día. A ver para quién es…'], ['tovan', '«Para: El Guardián de las Ruinas».'], ['tovan', '…Oh, no.']]); }
      if (id === 'truck'){ cs.walk = true; heading = 0; await csTween(1.2, k => { H.z = lerp(-1.45, 1.5, k); H.y = k > 0.4 ? 0 : 0.14; }); cs.walk = false; play('truckHorn');
        truck.visible = true; truck.position.set(-14, 0, 2); truck.rotation.y = Math.PI / 2; await csTween(0.6, k => { truck.position.x = lerp(-14, 0, k); });
        flash('#ffffff', 0.8); document.body.classList.add('sepia'); tbcEl.hidden = false; play('tbc'); await csWait(2.4); tbcEl.hidden = true; document.body.classList.remove('sepia'); truck.visible = false;
        lnEl.querySelector('.vol').textContent = 'VOLUMEN 2'; lnEl.querySelector('.lt').textContent = 'Me volvió a atropellar Camión-kun justo al volver a casa y ahora tengo que repartir paquetes en otro mundo otra vez'; lnEl.hidden = false; await csWait(3.5); lnEl.hidden = true; }
      cs.pose.hold = 0; setOutfit('hero');
    } else if (id === 'villain'){
      setWorld(0); H.set(0, 0.9, -1); heading = 0; const throne = new THREE.Group(); scene.add(throne); throne.position.set(0, 0, -1.4);
      const st = makeMat(0x4a4452); mesh(B(1.6, 0.9, 1.2), st, 0, 0.45, 0, throne); mesh(B(1.6, 2.4, 0.3), st, 0, 1.7, -0.5, throne); for (const s of [-1, 1]) mesh(B(0.3, 1.3, 1.2), st, 0.75 * s, 0.9, 0, throne);
      skyMat.uniforms.uHor.value.setHex(0x8a1010); shared.uAmb.value.setHex(0x5a2030);
      csShot(dollyShot([0, 0.6, 5], [0, 1.2, 3.5], [0, 2, -1], [0, 1.7, -1], 4));
      await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
      await csSay([['lumen', 'Tovan… ¿no vuelves a casa?'], ['tovan', 'Ahora YO soy el Guardián de las Ruinas.'], ['tovan', 'Y nadie firma nada sin mi permiso.'], ['lumen', 'Esto va a ser un problema.']]);
      scene.remove(throne);
    } else if (id === 'anime'){
      setWorld(CANAL); H.set(0, 0, 0); heading = 0; csShot(dollyShot([0, 1.8, 4], [0, 1.4, 2.6], [0, 1.4, 0], [0, 1.6, 0], 4));
      await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
      for (let i = 0; i < 8; i++){ setChannel(CH[i % CH.length].id); staticT = 0.2; play('static'); waveT = 1.2; await csWait(0.45); }
      setChannel('anime'); csShout('¡TEMPORADA 2!'); await csSay([['tovan', '¿Por qué suena un opening?'], ['lumen', 'Porque ahora eres el protagonista, Tovan. Temporada 2 confirmada.'], ['tovan', '¿Me pagan más?'], ['lumen', 'No.']]);
    } else if (id === 'beach'){
      setWorld(3); H.set(7.2, sandH(7.2, 8.4) + 0.1, 8.4); heading = 0.4;
      csShot(dollyShot([4, 2.2, 13], [5, 1.8, 12], [7, 0.6, 8], [7, 0.6, 8], 4));
      await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
      await csSay([['tovan', '¿Y si no vuelvo? Aquí se está genial.', 'happy'], ['lumen', 'Tovan, tienes la piel de 16 bits. Te vas a quemar en cinco minutos.'], ['tovan', 'Merece la pena.']]);
    } else if (id === 'glitch'){
      setWorld(4); H.set(0, 0, 0); csShot(dollyShot([3, 2, 4], [2.5, 1.6, 3.4], [0, 1, 0], [0, 1.2, 0], 4));
      await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
      for (let i = 0; i < 3; i++){ errWin.querySelector('.eb').textContent = ['final_bueno.exe no encontrado.', '¿Reintentar? [Sí] [Sí]', 'Error al cargar los créditos. Gracias igualmente.'][i];
        errWin.style.left = (20 + i * 15) + '%'; errWin.style.top = (25 + i * 12) + '%'; errWin.hidden = false; play('glitch'); await csWait(1.1); }
      errWin.hidden = true; await csSay([['tovan', '¿Esto es… el final?'], ['lumen', 'No lo encuentra. Tendrás que intentarlo otra vez.']]);
    }
    await csTween(0.8, k => { cineEls.white.style.opacity = String(k); });
  };
}
function runEnding(){
  const id = pickEnding(); endingId = id; clearCombat(); bossBox.hidden = true;
  if (!meta.endings) meta.endings = {}; const isNew = !meta.endings[id]; meta.endings[id] = true; meta.clears = (meta.clears || 0) + 1;
  const gain = fragNow(); meta.frag += gain; meta.runs++; meta.kills += kills; saveMeta(); stopEpic();
  unlock('clear1'); if (Object.keys(meta.endings).length >= 5) unlock('end5'); if (id === 'true') unlock('endTrue');
  runCine(endingScript(id), () => {
    cineEls.white.style.opacity = '0'; hud.hidden = true; waveBox.hidden = true; gameState = 'over';
    const E = ENDINGS.find(x => x.id === id), num = ENDINGS.indexOf(E) + 1;
    endEl.querySelector('.en').textContent = `FINAL ${num} DE ${ENDINGS.length}${isNew ? ' · ¡NUEVO!' : ''}`;
    endEl.querySelector('.et').textContent = E.name; endEl.querySelector('.ety').textContent = 'Final ' + E.type.toLowerCase();
    endEl.querySelector('.ety').className = 'ety t-' + E.type.toLowerCase();
    endEl.querySelector('.ed').textContent = E.desc;
    endEl.querySelector('.er').textContent = isNew ? 'Desbloqueas: ' + E.rw.map(([c, i]) => c === 'title' ? `título «${i}»` : cosName(c, i)).join(' y ') : '';
    endEl.querySelector('.ep').textContent = `Juego completado: ${completion()} % · +${gain} ✦`;
    endEl.hidden = false; play('achieve');
  });
}
document.getElementById('endBack').addEventListener('click', () => { endEl.hidden = true; toTitle(); });
ACH.splice(ACH.length - 1, 0,
  { id: 'clear1', ic: '📦', name: 'Entrega completada', desc: 'Derrota al jefe final y consigue un final.', rw: [['title', 'Repartidor del mes']] },
  { id: 'end5', ic: '📜', name: 'Coleccionista de finales', desc: 'Consigue 5 finales distintos.', prog: () => [Object.keys(meta.endings || {}).length, 5], rw: [['effect', 'confetti2']] },
  { id: 'endTrue', ic: '🏠', name: 'Por fin en casa', desc: 'Consigue el final verdadero.', secret: true, rw: [['body', 'gold2']] });
for (const E of ENDINGS) for (const [c, i] of E.rw) if (c === 'title' && !COS.title.some(t => t[0] === i)) COS.title.push([i, i, '🏷️']);
COS.hat.push(['catears', 'Orejas de gato', '🐱']); COS.effect.push(['confetti2', 'Confeti de fiesta final', '🎉']); COS.body.push(['gold2', 'Tovan de platino', '💿']);
hat('catears', 0.5, false, g => { const k = makeMat(0x15131c), p = makeMat(0xe88a9a); mesh(B(0.5, 0.04, 0.08), k, 0, 0.02, 0, g);
  for (const s of [-1, 1]){ const e = mesh(new THREE.ConeGeometry(0.1, 0.22, 4), k, 0.16 * s, 0.14, 0, g); e.rotation.z = -0.25 * s; mesh(new THREE.ConeGeometry(0.05, 0.12, 4), p, 0.16 * s, 0.13, 0.03, g); } });
// los estéticos de final también cuentan como desbloqueables por final
const _cosSource = cosSource;
cosSource = function(cat, id){ const a = _cosSource(cat, id); if (a) return a; const E = ENDINGS.find(x => x.rw.some(([c, i]) => c === cat && i === id)); return E ? { id: 'end_' + E.id, name: 'Final: ' + E.name, secret: false } : null; };
const _cosUnlocked = cosUnlocked;
cosUnlocked = function(cat, id){ if (_cosUnlocked(cat, id)) return true; const E = ENDINGS.find(x => x.rw.some(([c, i]) => c === cat && i === id)); return !!(E && meta.endings && meta.endings[E.id]); };

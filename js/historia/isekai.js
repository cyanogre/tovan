'use strict';
/* ---------- Isekai por Camión-kun ---------- */
const tbcEl = document.getElementById('tbc'), lnEl = document.getElementById('lnTitle');
let pendingWin = null, isekaiRun = false, special = null, castleBonus = 0, forceLegend = false;
function clearCombat(){
  for (const e of enemies){ scene.remove(e.g); if (e.tele) scene.remove(e.tele); if (e.parts) e.parts.forEach(q => scene.remove(q)); } enemies.length = 0; queue.length = 0;
  for (const p of projectiles) scene.remove(p.m); projectiles.length = 0; for (const f of fballs) scene.remove(f.m); fballs.length = 0;
  for (const r of eRings) scene.remove(r.m); eRings.length = 0; bossBox.hidden = true; bossE = null; clearT = -1; document.body.classList.remove('glitch-hard');
  truckRun = null; hideTrucks();
}
function runCine(script, done){
  cs.active = true; cs.aborted = false; cs.t = 0; cs.waits = []; cs.tweens = []; cs.tick = null; cs.cam = null;
  Object.assign(cs.pose, { hold: 0, reach: 0, look: 0, armsUp: 0, readDown: 0 });
  gameState = 'cutscene'; document.body.classList.add('cine'); cineEls.skip.hidden = false; hud.hidden = true; waveBox.hidden = true;
  const fin = () => { if (!cs.active) return; cs.active = false; cs.cam = null; cs.tick = null; document.body.classList.remove('cine', 'sepia');
    cineEls.skip.hidden = true; cineEls.white.style.opacity = '0'; tbcEl.hidden = true; lnEl.hidden = true; dlgEl.hidden = true; dlg.lines = null;
    hud.hidden = false; waveBox.hidden = false; gameState = 'play'; done(); };
  script().then(fin, err => { if (err !== csAbortErr) console.error(err); fin(); });
}
function isekaiArrive(){
  if (curBiome === CASTLE) return;
  clearCombat(); applyBiome(CASTLE); hero.position.set(0, 0, 0); grounded = true; vy = 0;
}
function startIsekai(){
  isekaiRun = true; const first = !meta.isekaiSeen; meta.isekaiSeen = true; saveMeta();
  const prevBiome = curBiome, retWave = wave, dir = truckRun ? [truckRun.fx, truckRun.fz] : [1, 0];
  cancelTech(); state = 'normal'; attackW = 0; staffToBack(); breakCombo();
  runCine(async () => {
    const H = hero.position, from = H.clone();
    play('slam'); play('truckHorn'); flash('#ffffff', 0.8); shake = 0.6;
    const o0 = cs.t; let spin = heading;
    cs.tick = dt => { const k = cs.t - o0; spin += dt * 16; heading = spin; hero.rotation.y = spin; grounded = true;
      H.set(from.x + dir[0] * k * 7, Math.sin(Math.min(k, 1) * Math.PI * 0.5) * 3.5, from.z + dir[1] * k * 7); };
    csShot(cam => { cam.position.set(from.x + 4.5, 2.2, from.z + 6); cam.lookAt(H.x, H.y + 1, H.z); });
    await csWait(0.55);
    cs.tick = null; document.body.classList.add('sepia'); tbcEl.hidden = false; play('tbc');
    await csWait(2.6);
    tbcEl.hidden = true; document.body.classList.remove('sepia');
    await csTween(0.5, k => { cineEls.white.style.opacity = String(k); });
    lnEl.hidden = false; play('bootup'); await csWait(first ? 5.5 : 3.2);
    isekaiArrive(); H.set(0, 9, 0); grounded = false; vy = -2; heading = 0.6; hero.rotation.y = heading;
    csShot(dollyShot([5, 2.2, 6.5], [4.2, 1.6, 5.2], [0, 3, 0], [0, 1.2, 0], 2));
    lnEl.hidden = true; setSong('castle'); applyMusVol();
    await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
    while (!grounded) await csWait(0.05);
    shake = 0.35; puff(12, 2); await csWait(0.7);
    const o1 = cs.t; csShot(cam => { const a = (cs.t - o1) * 0.25 + 0.6; cam.position.set(Math.sin(a) * 7, 2.6, Math.cos(a) * 7); cam.lookAt(0, 1.4, 0); });
    await csSay(first ? STORY.isekai1 : STORY.isekai2);
  }, () => {
    isekaiArrive(); hero.position.y = 0; grounded = true;
    special = { kind: 'castle', stage: 1, max: 4, retWave, retBiome: prevBiome === CASTLE ? 0 : prevBiome, done: false };
    startSpecialWave();
  });
}
function startSpecialWave(){
  const s = special; queue = [];
  if (s.stage < s.max){ let budget = Math.round(5 + wave * 1.6); while (budget > 0){ const t = rnd() < 0.55 ? 'redoni' : 'imp'; queue.push(t); budget -= t === 'redoni' ? 3 : 1; } }
  else queue = ['sixeyes', 'redoni', 'redoni'];
  waveTotal = queue.length; spawnTimer = 1.0; clearT = -1; dmgWave = false; protaUsed = false;
  const last = s.stage === s.max;
  play('waveStart'); if (last) playBossTrack('sixeyes', 'dragon'); else { setSong('castle'); applyMusVol(); }
  banner(last ? `Castillo Infinito<small>${BOSS_BANNER.sixeyes}</small>` : `Castillo Infinito<small>Sala ${s.stage} de ${s.max - 1}</small>`, 1.8);
  if (last) sayOnce('boss_sixeyes', STORY.boss_sixeyes);
}
function onWaveDone(){
  if (pendingWin){ const k = pendingWin; pendingWin = null; sayOnce(k, STORY[k], onWaveDone); return; }
  if (finalBeaten){ finalBeaten = false; runEnding(); return; }   // el diálogo de victoria va antes de las mejoras y del viaje
  if (special){
    if (special.stage < special.max){ special.stage++; startSpecialWave(); return; }
    special.done = true; castleBonus += 120; unlock('isekai2'); forceLegend = true;
    banner('¡Has escapado del castillo!<small>+120 ✦ y una carta legendaria</small>', 2);
  }
  openUpgrades();
}
function afterUpgrade(){
  if (special && special.done){ const s = special; special = null; travelTo(s.retBiome, s.retWave, true); return; }
  nextWave(wave + 1);
}

/* ---------- Logros y estéticos nuevos ---------- */
ACH.splice(ACH.length - 1, 0,
  { id: 'skeleton', ic: '💀', name: 'Hueso duro de roer', desc: 'Derrota a Gashadokuro.', rw: [['hat', 'skull']] },
  { id: 'ultra', ic: '🏖️', name: 'Gráficos en ULTRA', desc: 'Llega a la Playa del Mundo Real.', rw: [['title', 'Tarjeta gráfica en llamas']] },
  { id: 'teapot', ic: '🫖', name: 'La hora del té', desc: 'Derrota a la Tetera de Utah.', rw: [['hat', 'teapot']] },
  { id: 'error', ic: '🔌', name: 'Apágalo y enciéndelo', desc: 'Derrota al ERROR 404.', rw: [['body', 'missing']] },
  { id: 'isekai2', ic: '🚚', name: 'Reencarnado en otro mundo', desc: 'Escapa del Castillo Infinito.', rw: [['hat', 'kitsune']] },
  { id: 'sixeyes', ic: '🌙', name: 'Seis ojos no ven más que dos', desc: 'Derrota al de los Seis Ojos.', rw: [['weapon', 'katana']] });
COS.hat.push(['skull', 'Calavera de recuerdo', '💀'], ['teapot', 'Tetera de Utah (mini)', '🫖'], ['kitsune', 'Máscara de kitsune', '🦊']);
COS.weapon.push(['katana', 'Katana lunar', '🗡️']);
COS.body.push(['missing', 'Textura perdida', '🟪']);
COS.title.push(['Tarjeta gráfica en llamas', 'Tarjeta gráfica en llamas', '🏷️']);
hat('skull', 0.52, true, g => { const bone = makeMat(0xe8e0c8), dk = makeMat(0x1a1620); mesh(B(0.34, 0.3, 0.34), bone, 0, 0.15, 0, g);
  for (const s of [-1, 1]) mesh(B(0.09, 0.08, 0.02), dk, 0.08 * s, 0.17, 0.17, g); mesh(B(0.2, 0.08, 0.26), bone, 0, 0.0, 0.03, g); });
hat('teapot', 0.5, true, g => { const t = teapotMesh(makeMat(0xeef2fa), g); t.pot.scale.setScalar(0.17); });
hat('kitsune', 0.3, false, g => { g.position.set(0.2, 0.34, 0.08); g.rotation.y = 1.0; const w = makeMat(0xf6f2ea), r = makeMat(0xd8322a);
  mesh(B(0.24, 0.28, 0.06), w, 0, 0, 0, g); for (const s of [-1, 1]){ mesh(new THREE.ConeGeometry(0.05, 0.12, 4), w, 0.08 * s, 0.18, 0, g); mesh(B(0.06, 0.02, 0.02), r, 0.06 * s, 0.03, 0.035, g); }
  mesh(B(0.02, 0.1, 0.02), r, 0, 0.1, 0.035, g); mesh(B(0.08, 0.02, 0.02), r, 0, -0.08, 0.035, g); });
weapon('katana', g => { mesh(B(0.06, 1.55, 0.02), makeMat(0xd8d8f0, { emissive: 0.35 }), 0, 0.15, 0, g); mesh(B(0.26, 0.04, 0.26), makeMat(0xd9a441), 0, -0.62, 0, g);
  mesh(B(0.07, 0.4, 0.07), makeMat(0x2a1a3a), 0, -0.84, 0, g); });

Object.assign(SFX, {
  teaWhistle: () => { tone({ type: 'sine', f0: 1800, f1: 2600, dur: 1.2, vol: 0.06, attack: 0.3, rv: 0.4 }); tone({ type: 'sine', f0: 2400, f1: 3200, dur: 1.0, vol: 0.03, when: 0.2, rv: 0.4 }); },
  tbc: () => { seq_([[45, 0.25], [45, 0.25], [52, 0.25], [50, 0.5]], 'sawtooth', 0.18, 0.08, 0.4); tone({ type: 'sine', f0: 55, dur: 1.2, vol: 0.2, rv: 0.3 }); }
});

'use strict';
/* ======================================================================
   ESTÉTICA v7 (2/2): un efecto propio y llamativo para cada poder
   ====================================================================== */
const EL7 = { fire: [0xff6a10, 0xffb030, 0xffe070], ice: [0xbff4ff, 0xffffff, 0x7fd8ff], shock: [0xfff27a, 0xffffff, 0xffd040], poison: [0x7dff5a, 0x3ac83a, 0xc8ff7a] };
const MINOR_COL7 = { mDmg: 0xff6a4a, mDef: 0xa8b4c8, mSpd: 0x9fe8ff, mCrit: 0xffd84a, mHp: 0xff4a6a, mAtk: 0xffb060, mMeter: 0x6ab8ff, mFrag: 0xd8a0ff };
const wpOwned7 = () => { const w = curW(); let n = 0; for (const u of UPGRADES) if (u.w === w && lvl(u.id)) n++; return n; };
function staffPts7(){ staffMid.getWorldPosition(t7a); staffTip.getWorldPosition(t7b); }
function onStaff7(k){ return t7c.set(lerp(t7a.x, t7b.x, k), lerp(t7a.y, t7b.y, k), lerp(t7a.z, t7b.z, k)); }
function rightHand7(v){ return P.armR.hand.localToWorld(v.set(0, -0.3, 0.02)); }
function leftHand7(v){ return P.armL.hand.localToWorld(v.set(0, -0.3, 0.02)); }

/* ---------- Accesorios: visibilidad y animación cada fotograma ---------- */
function e7Acc(dt, live){
  const L = id => (live ? lvl(id) : 0), T = time, hs = hero.scale.y;
  // Pies ligeros: botas con alas que aletean
  for (const [id, leg, s] of [['wingL', P.legL, -1], ['wingR', P.legR, 1]]){ const g = acc7(id, L('speed') > 0, leg.knee, q => buildWing7(q, s));
    if (g){ const mv = Math.min(1, walkW + (grounded ? 0 : 1) + (state === 'roll' ? 1 : 0)); g.rotation.y = s * (0.35 + (0.25 + 0.45 * mv) * Math.sin(T * (8 + 16 * mv))); g.scale.setScalar((0.95 + 0.2 * lvl('speed')) * popK7(g, dt)); } }
  // Zapatillas con muelles: salen al saltar
  for (const [id, leg] of [['sprL', P.legL], ['sprR', P.legR]]){ const g = acc7(id, L('springs') > 0 && !grounded, leg.knee, buildSpring7);
    if (g){ E7.springT = Math.max(0, E7.springT - dt); g.scale.set(1, 1 + E7.springT * 5, 1); g.userData.k = 1; } }
  // Piel de hierro: hombreras
  for (const [id, A, s] of [['paulL', P.armL, -1], ['paulR', P.armR, 1]]){ const g = acc7(id, L('armor') > 0, A.sh, q => buildPaul7(q, s));
    if (g){ g.userData.spk.visible = lvl('armor') >= 2; g.userData.tier.visible = lvl('armor') >= 3; g.scale.setScalar((0.95 + 0.1 * lvl('armor')) * popK7(g, dt));
      if (rnd() < dt * 1.5){ g.localToWorld(t7a.set(0, 0.18, 0.1)); pa(t7a.x, t7a.y, t7a.z, 0, 0, 0, 0xffffff, 0.35, 0.18, 0, 0, 1.4, SH7.star); } } }
  // Cactus: espalda y hombros con pinchos
  { const on = L('thorns') > 0, g = acc7('cactus', on, P.spine, buildCactus7); if (g) g.scale.setScalar((0.9 + 0.2 * lvl('thorns')) * popK7(g, dt));
    for (const [id, A, s] of [['cacL', P.armL, -1], ['cacR', P.armR, 1]]){ const q = acc7(id, on && !lvl('armor'), A.sh, q2 => buildCactusArm7(q2, s)); if (q) q.scale.setScalar(popK7(q, dt)); } }
  // Abrigo de escarcha: cristales de hielo y vaho
  { const on = L('frostArmor') > 0;
    for (const [id, A, s] of [['iceL', P.armL, -1], ['iceR', P.armR, 1]]){ const g = acc7(id, on, A.sh, q => { q.position.set(0.05 * s, 0.13, 0); buildIce7(q, 4, 1); }); if (g) g.scale.setScalar(popK7(g, dt) * (P5.frostCd > 0 ? 0.55 : 1)); }
    const g = acc7('iceB', on, P.spine, q => { q.position.set(0, 0.5, -0.2); q.rotation.x = -0.7; buildIce7(q, 4, 1.4); }); if (g) g.scale.setScalar(popK7(g, dt) * (P5.frostCd > 0 ? 0.55 : 1));
    if (on && rnd() < dt * 14){ const a = rnd() * TAU; pn(hero.position.x + Math.cos(a) * 0.4, hero.position.y + 1.3 + rnd() * 0.4, hero.position.z + Math.sin(a) * 0.4, Math.cos(a) * 0.3, -0.6, Math.sin(a) * 0.3, 0xdff8ff, 0.11, 0.9, 0, 0.5, 2.5, SH7.dot, 0.4); } }
  // Corazón de piedra: late a tu alrededor
  { const g = acc7('heart', L('hp') > 0, hero, buildHeart7);
    if (g){ const ph = (T * 1.25) % 1, beat = 1 + 0.25 * Math.exp(-ph * 16) + 0.16 * (ph > 0.2 ? Math.exp(-(ph - 0.2) * 16) : 0), a = T * 1.3;
      g.position.set(Math.cos(a) * 0.95, 1.5 + Math.sin(T * 2.2) * 0.08, Math.sin(a) * 0.95); g.lookAt(camera.position);
      g.scale.setScalar((0.3 + 0.045 * lvl('hp')) * beat * popK7(g, dt));
      if (ph < E7.hb0){ g.getWorldPosition(t7a); burst7(PA7, t7a.x, t7a.y, t7a.z, 4, [0xff2a4a, 0xff8a9a], 1.6, 0.12, 0.4, -1, 1, 0, SH7.heart); } E7.hb0 = ph; } }
  // Ímpetu: círculo de runas a tus pies (brilla con la barra)
  { const g = acc7('rune', L('meter') > 0, hero, q => { const m = addMesh7(planeGeo7, addMat7(0x6ab8ff, 0, runeTex7), q); m.rotation.x = -Math.PI / 2; m.position.y = 0.05; q.userData.m = m; });
    if (g){ const f = player.meter / 100, full = f >= 1, m = g.userData.m; m.rotation.z += dt * (0.4 + 2.6 * f); m.scale.setScalar((2.1 + 0.25 * lvl('meter')) * popK7(g, dt));
      m.material.uniforms.uAlpha.value = 0.22 + 0.55 * f + (full ? 0.25 * Math.sin(T * 12) : 0); m.material.uniforms.uColor.value.setHex(full ? 0xbff6ff : 0x6ab8ff);
      if (full && rnd() < dt * 30){ const a = rnd() * TAU, r = 0.6 + rnd() * 0.5; pa(hero.position.x + Math.cos(a) * r, 0.1, hero.position.z + Math.sin(a) * r, 0, 2.5 + rnd() * 2, 0, rnd() < 0.5 ? 0x9fe8ff : 0xffffff, 0.12, 0.6, 0, 0, 0.4, SH7.star); } } }
  // Ojo certero: monóculo, mira láser y retícula sobre el objetivo
  { const g = acc7('mono', L('crit') > 0, P.neck, buildMono7); if (g) g.scale.setScalar((1 + 0.12 * lvl('crit')) * popK7(g, dt));
    const t = g && state !== 'roll' ? nearestFrom(hero.position.x, hero.position.z, 7) : null;
    ret7.visible = !!t; laser7.visible = !!t;
    if (t){ const sc = (t.r + 0.5) * (1 + 0.08 * Math.sin(T * 9)); ret7.position.set(t.g.position.x, 0.07, t.g.position.z); ret7.scale.setScalar(sc); ret7.rotation.y += dt * 2.4;
      g.getWorldPosition(t7a); line7(laser7, t7a.x, t7a.y, t7a.z, t.g.position.x, 0.9 * (t.scale || 1), t.g.position.z, 0.018); laser7.material.uniforms.uAlpha.value = 0.4 + 0.25 * Math.sin(T * 20);
      if (rnd() < dt * 2) pa(t7a.x, t7a.y, t7a.z, 0, 0, 0, 0xffffff, 0.35, 0.15, 0, 0, 1.4, SH7.star); } }
  // Trébol de cuatro hojas: gira sobre tu cabeza
  { const g = acc7('clover', L('lucky') > 0, P.neck, q => { q.position.set(0, 0.86, -0.02); buildClover7(q); });
    if (g){ g.rotation.y += dt * 2.2; g.rotation.x = 0.35; g.position.y = 0.86 + Math.sin(T * 3) * 0.04; g.scale.setScalar((0.95 + 0.2 * lvl('lucky')) * popK7(g, dt));
      if (rnd() < dt * 4){ g.getWorldPosition(t7a); pa(t7a.x + (rnd() - 0.5) * 0.4, t7a.y, t7a.z + (rnd() - 0.5) * 0.4, 0, -0.8, 0, 0x7dff8a, 0.1, 0.7, 0, 0, 0.3, SH7.star); } } }
  // Toque de Midas: guantes de oro que sueltan purpurina
  for (const [id, A, s] of [['ggL', P.armL, -1], ['ggR', P.armR, 1]]){ const g = acc7(id, L('midas') > 0, A.hand, q => buildGG7(q, s));
    if (g){ g.scale.setScalar(popK7(g, dt)); if (rnd() < dt * 9){ A.hand.localToWorld(t7a.set((rnd() - 0.5) * 0.25, -0.3, 0)); pa(t7a.x, t7a.y, t7a.z, (rnd() - 0.5) * 0.6, -0.5, (rnd() - 0.5) * 0.6, rnd() < 0.5 ? 0xffd23a : 0xfff6c0, 0.09, 0.6, 1, 0, 0.4, SH7.star); } } }
  // Café de máquina: vaso en la mano izquierda con humo
  { const torch = live && lvl('pocket') && P6.gadget === 'encoge', g = acc7('cup', L('cafe') > 0 && !torch, P.armL.hand, buildCup7);
    if (g){ g.scale.setScalar((0.95 + 0.15 * lvl('cafe')) * popK7(g, dt)); if (rnd() < dt * 7){ g.userData.top.getWorldPosition(t7a); pn(t7a.x, t7a.y, t7a.z, (rnd() - 0.5) * 0.2, 0.9, (rnd() - 0.5) * 0.2, 0xffffff, 0.14, 1.0, -0.2, 0.6, 3, SH7.dot, 0.5); } } }
  // Bolsillos con imán: imán flotante
  { const g = acc7('mag', L('magnet') > 0, hero, buildMag7);
    if (g){ g.position.set(0.62, 1.85 + Math.sin(T * 3) * 0.07, -0.25); g.rotation.set(0, Math.sin(T * 1.3) * 0.5, Math.sin(T * 2.1) * 0.15); g.scale.setScalar(1.35 * popK7(g, dt)); } }
  // Copa de cristal: cañón de cristal al hombro
  { const g = acc7('glass', L('glassCannon') > 0, P.spine, buildCannon7);
    if (g){ const u = g.userData; u.kick = Math.max(0, u.kick - dt * 6); u.br.position.z = 0.05 - u.kick * 0.14; g.scale.setScalar(popK7(g, dt));
      if (rnd() < dt * 3){ u.muzzle.getWorldPosition(t7a); pa(t7a.x, t7a.y, t7a.z, 0, 0, 0, 0xffffff, 0.3, 0.15, 0, 0, 1.4, SH7.star); } } }
  // Fénix: alas de fuego mientras te quede la resurrección
  { const g = acc7('pho', L('phoenix') > 0 && phoenixLeft > 0, P.spine, q => { q.position.set(0, 0.5, -0.24); buildWings7(q); });
    if (g){ const fl = Math.sin(T * 6); g.userData.w.forEach((w, i) => { const s = i ? 1 : -1; w.rotation.y = s * (0.55 + 0.4 * fl); w.rotation.z = 0.12 * fl; });
      g.scale.setScalar(popK7(g, dt) * (1 + 0.05 * Math.sin(T * 13)));
      for (let k = 0; k < 2; k++) if (rnd() < 0.7){ const w = g.userData.w[k]; w.localToWorld(t7a.set(0.2 + rnd() * 0.7, (rnd() - 0.2) * 0.6, 0)); pa(t7a.x, t7a.y, t7a.z, (rnd() - 0.5) * 0.4, 0.8 + rnd(), (rnd() - 0.5) * 0.4, rnd() < 0.5 ? 0xff7a2a : 0xffd040, 0.12, 0.6, -0.5, 0.5, 0.2, SH7.dot); } } }
  // Espada del lago Toya: espada de madera al cinto
  { const g = acc7('bokken', L('toya') > 0, P.hips, buildBokken7); if (g) g.scale.setScalar(popK7(g, dt)); }
  // Leche de fresa: el cartón flota contigo mientras dure
  { const g = acc7('milk', L('strawberry') > 0 && P6.milk, hero, buildMilk7);
    if (g){ g.position.set(-0.6, 1.6 + Math.sin(T * 2.6) * 0.08, -0.15); g.rotation.y += dt * 1.6; g.scale.setScalar(1.25 * popK7(g, dt));
      if (rnd() < dt * 6){ g.getWorldPosition(t7a); pa(t7a.x, t7a.y, t7a.z, (rnd() - 0.5), 0.5, (rnd() - 0.5), rnd() < 0.5 ? 0xff9ac8 : 0xffffff, 0.12, 0.6, 0, 1, 0.3, SH7.heart); } } }
  // Corte de nuca: equipo de maniobras
  { const g = acc7('titan', L('titan') > 0, P.hips, buildTitan7); if (g) g.scale.setScalar(popK7(g, dt)); }
  // Bolsillo mágico: cachivaches visibles
  { const gad = live && lvl('pocket') ? P6.gadget : null;
    const hat = acc7('prop', gad === 'gorro', P.neck, buildProp7);
    if (hat){ hat.userData.rotor.rotation.y += dt * (grounded ? 9 : 45); hat.scale.setScalar(popK7(hat, dt)); if (!grounded && rnd() < dt * 20){ hat.userData.rotor.getWorldPosition(t7a); pn(t7a.x, t7a.y, t7a.z, (rnd() - 0.5) * 2, -1.5, (rnd() - 0.5) * 2, 0xffffff, 0.12, 0.35, 0, 1, 2, SH7.dot, 0.5); } }
    const torch = acc7('torch', gad === 'encoge', P.armL.hand, buildTorch7);
    if (torch){ torch.scale.setScalar(popK7(torch, dt)); beamMat7.uniforms.uAlpha.value = 0.08 + 0.03 * Math.sin(T * 9) + (E7.torchT > 0 ? 0.25 : 0); E7.torchT = Math.max(0, (E7.torchT || 0) - dt); }
    const glove = acc7('boxg', gad === 'guante', P.armR.hand, buildBoxG7); if (glove) glove.scale.setScalar(popK7(glove, dt));
    const door = acc7('mdoor', gad === 'puerta' && !P6.doorUsed, P.spine, buildMiniDoor7); if (door) door.scale.setScalar(popK7(door, dt)); }
  // Devolver orbes: escudo-espejo en el brazo izquierdo
  { const g = acc7('mirror', L('reflect') > 0, P.armL.el, buildMirror7); if (g){ g.scale.setScalar(popK7(g, dt)); if (rnd() < dt * 2.5){ g.getWorldPosition(t7a); pa(t7a.x - 0.05, t7a.y + 0.08, t7a.z, 0, 0, 0, 0xffffff, 0.4, 0.15, 0, 0, 1.5, SH7.star); } } }
  // Frenesí: vena de enfado y vapor
  { const g = acc7('vein', L('frenzy') > 0 && combo >= 10, P.neck, buildVein7);
    if (g){ g.lookAt(camera.position); g.scale.setScalar((1 + 0.25 * Math.max(0, Math.sin(T * 14)) + Math.min(0.6, combo / 120)) * popK7(g, dt));
      if (combo >= 25 && rnd() < dt * 10){ P.neck.localToWorld(t7a.set((rnd() - 0.5) * 0.3, 0.55, 0)); pn(t7a.x, t7a.y, t7a.z, (rnd() - 0.5) * 0.8, 1.6, (rnd() - 0.5) * 0.8, 0xffffff, 0.16, 0.6, 0, 1, 2.5, SH7.dot, 0.6); } } }
  // Furia ciega: ojos rojos
  { const g = acc7('eyes', L('berserk') > 0 && player.hp < player.maxHp * 0.5, P.neck, buildEyes7);
    if (g && (walkW > 0.5 || state === 'attack') && rnd() < dt * 20){ g.children[0].getWorldPosition(t7a); pa(t7a.x, t7a.y, t7a.z, 0, 0.2, 0, 0xff1a1a, 0.09, 0.35, 0, 0, 0.3, SH7.sq); g.children[1].getWorldPosition(t7a); pa(t7a.x, t7a.y, t7a.z, 0, 0.2, 0, 0xff1a1a, 0.09, 0.35, 0, 0, 0.3, SH7.sq); } }
  // Ritmo protector: notas musicales que te rodean (escudo listo)
  { const g = acc7('notes', L('comboShield') > 0 && combo >= 30 && P5.cshCd <= 0, hero, buildNotes7);
    if (g){ g.userData.n.forEach((n, i) => { const a = T * 2.4 + i / 3 * TAU; n.position.set(Math.cos(a) * 0.9, 1.25 + Math.sin(T * 5 + i) * 0.15, Math.sin(a) * 0.9); n.lookAt(camera.position); });
      g.scale.setScalar(popK7(g, dt)); if (rnd() < dt * 8){ const n = g.userData.n[Math.floor(rnd() * 3)]; n.getWorldPosition(t7a); pa(t7a.x, t7a.y, t7a.z, 0, 0.3, 0, 0xffd84a, 0.1, 0.4, 0, 0, 0.3, SH7.star); } } }
  // Modo fantasma: un fantasmita te acompaña
  { const g = acc7('ghost', live && P5.ghostT > 0, hero, buildGhost7);
    if (g){ const a = T * 4; g.position.set(Math.cos(a) * 0.95, 1.4 + Math.sin(T * 7) * 0.15, Math.sin(a) * 0.95); g.lookAt(camera.position); g.scale.setScalar(1.3 * popK7(g, dt));
      if (rnd() < 0.6){ g.getWorldPosition(t7a); pa(t7a.x, t7a.y - 0.2, t7a.z, 0, -0.3, 0, 0xc8d8ff, 0.14, 0.5, 0, 0, 0.2, SH7.dot, 0.7); } } }
  // Siesta: pompa de moco
  { const sleeping = live && lvl('siesta') && time - P5.lastAct > 1.5 && state === 'normal' && player.hp < player.maxHp && !player.dead;
    const g = acc7('bubble', sleeping, P.neck, q => mesh(new THREE.IcosahedronGeometry(0.06, 1), MA7.bubble, 0.03, 0.21, 0.25, q));
    if (g){ g.children[0].scale.setScalar(0.6 + 1.1 * (0.5 + 0.5 * Math.sin(T * 2.2))); g.userData.k = 1;
      if (rnd() < dt * 5){ const a = rnd() * TAU; pa(hero.position.x + Math.cos(a) * 0.5, hero.position.y + 0.3 + rnd(), hero.position.z + Math.sin(a) * 0.5, 0, 0.8, 0, 0x7dff8a, 0.13, 0.7, 0, 0, 0.5, SH7.plus); } } }
  // Stonks: flecha verde que crece (y roja si te pegan)
  { const g = acc7('stonks', L('stonks') > 0 && stonks > 0 && E7.notStonksT <= 0, P.neck, q => { q.position.set(0.12, 1.02, 0); q.rotation.z = -0.6; buildStonks7(q, true); });
    if (g) g.scale.setScalar((0.6 + Math.min(1.4, stonks / 60 * 1.4)) * popK7(g, dt));
    E7.notStonksT = Math.max(0, E7.notStonksT - dt);
    const r = acc7('nstonks', E7.notStonksT > 0, P.neck, q => { q.position.set(0.12, 1.02, 0); q.rotation.z = Math.PI + 0.6; buildStonks7(q, false); });
    if (r) r.scale.setScalar(1.3 * popK7(r, dt)); }
  // Pogo: palo saltarín durante el picado
  { const g = acc7('pogo', L('pogo') > 0 && state === 'attack' && curMove && curMove.dive, hero, buildPogo7);
    if (g){ g.position.set(0, 0, 0.22); g.userData.sp.scale.y = 1 + 0.3 * Math.sin(T * 30); g.scale.setScalar(popK7(g, dt)); } }
  // Filo de cristal: cristales que orbitan la punta del arma
  { const n = L('dmg'), g = acc7('crys', n > 0, staffTip, buildCrystals7);
    if (g){ g.userData.c.forEach((c, i) => { c.visible = i < n; const a = T * 4 + i / n * TAU; c.position.set(Math.cos(a) * 0.24, Math.sin(T * 6 + i) * 0.06, Math.sin(a) * 0.24); c.rotation.y += dt * 6; });
      g.scale.setScalar(popK7(g, dt)); } }
  // Avatar elemental: tres orbes alrededor del arma
  { const on = L('avatar') > 0; avat7.forEach((m, i) => { m.visible = on; if (!on) return; staffTip.getWorldPosition(t7a); const a = T * 5 + i / 3 * TAU;
      m.position.set(t7a.x + Math.cos(a) * 0.38, t7a.y + Math.sin(T * 7 + i * 2) * 0.12, t7a.z + Math.sin(a) * 0.38); m.scale.setScalar(1 + 0.2 * Math.sin(T * 15 + i));
      if (rnd() < 0.5) pa(m.position.x, m.position.y, m.position.z, 0, 0, 0, [0xff6a10, 0x9fe8ff, 0xfff27a][i], 0.12, 0.25, 0, 0, 0, SH7.dot); }); }
  // Cuaderno de la muerte: libro negro que escribe
  { E7.bookT = Math.max(0, (E7.bookT || 0) - dt); const g = acc7('book', live && E7.bookT > 0, hero, buildBook7);
    if (g){ g.position.set(0.55, 2.3, 0.2); g.rotation.set(0.5, T * 0.6, Math.sin(T * 9) * 0.1); g.scale.setScalar(1.2 * popK7(g, dt)); if (rnd() < 0.5){ g.getWorldPosition(t7a); pn(t7a.x + (rnd() - 0.5) * 0.3, t7a.y + 0.08, t7a.z + (rnd() - 0.5) * 0.2, 0, 0.5, 0, 0x101014, 0.08, 0.6, 0, 0, 1, SH7.sq, 0.9); } } }
}
const ret7 = new THREE.Group(); scene.add(ret7); ret7.visible = false;
{ const m = addMat7(0xff3a4a, 0.85), r = addMesh7(new THREE.RingGeometry(0.82, 1, 24), m, ret7); r.rotation.x = -Math.PI / 2;
  for (let k = 0; k < 4; k++){ const a = k / 4 * TAU, t = addMesh7(new THREE.BoxGeometry(0.09, 0.02, 0.42), m, ret7); t.position.set(Math.sin(a) * 1.05, 0, Math.cos(a) * 1.05); t.rotation.y = a; } }
const laser7 = addMesh7(new THREE.BoxGeometry(1, 1, 1), addMat7(0xff2a3a, 0.5)); laser7.visible = false;
const avat7 = [0xff6a10, 0x9fe8ff, 0xfff27a].map(c => { const m = addMesh7(new THREE.IcosahedronGeometry(0.1, 1), addMat7(c, 1)); m.visible = false; return m; });
const gpsBeam7 = addMesh7(new THREE.CylinderGeometry(0.1, 0.22, 9, 8, 1, true), addMat7(0xff4a3a, 0.35)); gpsBeam7.visible = false;
const sigRings7 = Array.from({ length: 12 }, () => { const m = addMesh7(new THREE.RingGeometry(0.78, 1, 12), addMat7(0xff3a5a, 0.8)); m.rotation.x = -Math.PI / 2; m.visible = false; return m; });
const wires7 = [0, 1].map(() => { const m = addMesh7(new THREE.BoxGeometry(1, 1, 1), addMat7(0xd8e4f0, 0.8)); m.visible = false; return m; });

'use strict';
/* ---------- Culito visible ---------- */
const butt13 = new THREE.Group(); butt13.position.set(0, -0.05, -0.14); P.hips.add(butt13); butt13.visible = false;
const cheekGeo13 = new THREE.IcosahedronGeometry(0.115, 1);
const cheeks13 = [-1, 1].map(s => { const m = mesh(cheekGeo13, M.skin, 0.098 * s, 0, 0, butt13); m.scale.set(1, 0.95, 0.82); return m; });
mesh(B(0.012, 0.13, 0.02), makeMat(0x8a4a3a), 0, 0.005, -0.075, butt13);
let buttK13 = 0;
function buttPose13(dt){
  const show = gameState === 'play' && lvl('culito') > 0 && !player.dead && (state === 'roll' || (E7 && E7.wigT > 0) || P13.buttT > 0);
  if (show && buttK13 <= 0) for (let i = 0; i < 6; i++){ const a = rnd() * TAU; pa(hero.position.x, hero.position.y + 0.6, hero.position.z, Math.cos(a) * 1.5, 1.4, Math.sin(a) * 1.5, rnd() < 0.5 ? 0xff9ac8 : 0xffe24a, 0.12, 0.5, 2, 1, 0.3, SH7.heart); }
  buttK13 = clamp(buttK13 + (show ? dt * 9 : -dt * 7), 0, 1);
  butt13.visible = buttK13 > 0.01;
  if (buttK13 > 0.5){ if (P13.tailPrev == null) P13.tailPrev = P.tail.visible; P.tail.visible = false; } else if (P13.tailPrev != null){ P.tail.visible = P13.tailPrev; P13.tailPrev = null; }
  if (!butt13.visible) return;
  const wob = 1 + 0.12 * Math.sin(time * 38) * (E7 && E7.wigT > 0 ? 1 : 0.4);
  butt13.scale.setScalar(Math.max(0.01, buttK13 * (1 + 0.25 * (1 - buttK13))));
  cheeks13.forEach((c, i) => { c.scale.set(wob, 0.95 / wob, 0.82); c.position.y = 0.012 * Math.sin(time * 38 + i * 2); });
}

/* ---------- Pose: rodilla en el suelo ---------- */
const _legendPose13 = legendPose;
legendPose = function(){ _legendPose13();
  try {
    if (P13.kneelT > 0 && state !== 'roll' && gameState === 'play'){ const w = Math.min(1, P13.kneelT * 4);
      P.hips.position.y -= 0.24 * w; P.legL.hip.rotation.x = lerp(P.legL.hip.rotation.x, -1.45, w); P.legL.knee.rotation.x = lerp(P.legL.knee.rotation.x, 1.45, w);
      P.legR.hip.rotation.x = lerp(P.legR.hip.rotation.x, 0.25, w); P.legR.knee.rotation.x = lerp(P.legR.knee.rotation.x, 1.9, w);
      P.spine.rotation.x += 0.35 * w; P.armL.sh.rotation.x = lerp(P.armL.sh.rotation.x, 0.6, w); P.armL.sh.rotation.z = lerp(P.armL.sh.rotation.z, -0.3, w); }
  } catch (err) { console.error(err); } };

/* ---------- Bucle ---------- */
function tick13(dt, pdt){
  const H = hero.position;
  // dinámicos
  const novato = lvl('novato13') && (time - P13.waveT0 < 8 + 4 * S10('novato13') || (syn13('novatoSuerte') && P13.coin === 'cara')) ? 0.2 : 0;
  if (novato && syn13('novatoSuerte') && P13.coin === 'cara' && time - P13.waveT0 > 12) discover('s13_novatoSuerte', 'Novato con suerte', SYNM13.novatoSuerte[4]);
  const lim = syn13('alLimite') && player.hp < player.maxHp * 0.35 ? 0.25 : 0;
  if (lim) discover('s13_alLimite', 'Al límite', SYNM13.alLimite[4]);
  const ca = novato + lim; if (Math.abs(ca - P13.critAdd) > 1e-4){ up.crit += ca - P13.critAdd; P13.critAdd = ca; }
  if (P13.turboT > 0){ P13.turboT -= pdt; if (rnd() < 0.4) streak7(H.x, H.y + 0.5 + rnd(), H.z, -Math.sin(heading), 0, -Math.cos(heading), 0.8, 0x3ad8c0, 0.15, 0.03, 1); }
  if (P13.impT > 0) P13.impT -= pdt;
  if (P13.refundT > 0) P13.refundT -= pdt;
  if (P13.kneelT > 0) P13.kneelT -= pdt;
  if (P13.buttT > 0) P13.buttT -= pdt;
  // regeneración
  if (!player.dead){
    if (lvl('tiritas13')){ P13.regT += pdt; const per = [4, 3.2, 2.5][Math.min(2, lvl('tiritas13') - 1)] / (syn13('botiquin') ? 2 : 1);
      if (P13.regT >= per){ P13.regT = 0; heal(1, true); if (syn13('botiquin')) discover('s13_botiquin', 'Botiquín', SYNM13.botiquin[4]); } }
    if (setOn('coraza') && time - P13.lastHurt > 3){ P13.setRegT += pdt; if (P13.setRegT >= 1){ P13.setRegT = 0; heal(1, true); } }
  }
  // impulsos aéreos: se recargan al tocar el suelo
  if (grounded) P13.dashLeft = lvl('parkour13') + (setOn('acrobacia') ? 1 : 0);
  // doble salto con muelles = acrobacia (Circo del Sol)
  if (P5.airJ > P13.airJ0 && syn13('circo')){ acroCrit13(); P13.circoT = time + 2; }
  P13.airJ0 = P5.airJ;
  dashTick13(pdt);
  // rueda tóxica
  if (state === 'roll' && lvl('ruedaToxica13')){
    if (!P13.rolling){ P13.rolling = true; P13.rollSet = new Set(); }
    for (const e of liveE10()){ if (P13.rollSet.has(e)) continue; if (Math.hypot(e.g.position.x - H.x, e.g.position.z - H.z) - e.r < 0.95){ P13.rollSet.add(e);
      applyStatus(e, 'poison', 1 + lvl('ruedaToxica13')); if (syn13('neumatico')){ applyStatus(e, 'fire', 1.5); discover('s13_neumatico', 'Neumático quemado', SYNM13.neumatico[4]); }
      for (let j = 0; j < 5; j++) pa(e.g.position.x, 0.6, e.g.position.z, (rnd() - 0.5) * 2, 1.2, (rnd() - 0.5) * 2, 0x7dff5a, 0.12, 0.5, 0, 1, 0.3, SH7.dot); } }
  } else P13.rolling = false;
  // granizo
  if (lvl('granizo13')){ P13.hailT -= pdt; if (P13.hailT <= 0){ P13.hailT = [4, 3.3, 2.7][Math.min(2, lvl('granizo13') - 1)] / (syn13('tormentaGranizo') ? 2 : 1); hail13(); } }
  // combustión espontánea
  if (lvl('combustion13')){ P13.combT -= pdt; if (P13.combT <= 0){ P13.combT = lvl('combustion13') > 1 ? 4.5 : 6;
      const L = liveE10().sort((a, b) => Math.hypot(a.g.position.x - H.x, a.g.position.z - H.z) - Math.hypot(b.g.position.x - H.x, b.g.position.z - H.z)).slice(0, syn13('fuegoCruzado') ? 2 : 1);
      L.forEach(e => { applyStatus(e, 'fire', 2); hitEnemy(e, rdmg(10), false, 0, 0, 0, 1, false, { src: 'aoe', el: 'fire' }); pillar7(e.g.position.x, e.g.position.z, 0xff6a20, 0xffe070, 0.4, 0.5);
        tA.set(e.g.position.x, e.numY + 0.6, e.g.position.z); spawnNumber(tA, pick10(['¿Huele a quemado?', 'Combustión espontánea', 'Inexplicable']), 'react', '#ffb060'); });
      if (L.length > 1) discover('s13_fuegoCruzado', 'Fuego cruzado', SYNM13.fuegoCruzado[4]); } }
  // escudo de cristal: los cristales rompen proyectiles
  if (lvl('escudoCristal13') && projectiles.length){
    const guards = orbs.concat(typeof orbitals !== 'undefined' ? orbitals.map(o => o.m) : []);
    for (let i = projectiles.length - 1; i >= 0; i--){ const p = projectiles[i]; if (p.owner !== 'enemy') continue;
      for (const g of guards){ if (!g || !g.visible) continue; if (g.position.distanceTo(p.m.position) < 0.6){
        if (syn13('espejoBlindado')){ const t = nearestFrom(p.m.position.x, p.m.position.z, 12, null), a = t ? angTo(p.m.position.x, p.m.position.z, t.g.position.x, t.g.position.z) : rnd() * TAU;
          p.owner = 'player'; p.m.material = orbMatP; p.vx = Math.sin(a) * 9; p.vz = Math.cos(a) * 9; p.life = 2.5; p.pdmg = rdmg(22); discover('s13_espejoBlindado', 'Espejo blindado', SYNM13.espejoBlindado[4]); }
        else { scene.remove(p.m); projectiles.splice(i, 1); }
        sparks(g.position.x, g.position.y, g.position.z, 6, 0xb69cff); play('block'); break; } } }
  }
  // Fortaleza
  if (P13.fort){ const F = P13.fort; F.t -= pdt; F.m.position.set(H.x, H.y + 1, H.z); F.m.rotation.y += pdt * 1.5; F.m.scale.setScalar(1 + 0.05 * Math.sin(time * 8) + 0.25 * F.got / F.cap); if (F.t <= 0 || player.dead) fortEnd13(); }
  // Salto del millón
  if (P13.mega){ P13.mega.t += pdt;
    const busy = state === 'tech' || state === 'dead' || (state === 'attack' && curMove && curMove.special);
    if (!busy || P13.mega.t > 2.5){ const k = P13.mega.k; P13.mega = null;
      if (state !== 'dead'){ state = 'normal'; umb = null; grounded = false; vy = 15; H.y = Math.max(H.y, 0.05); if (typeof MOV11 !== 'undefined'){ MOV11.vx = MOV11.vz = 0; MOV11.cut = true; }
        startFlip12('x', 1, 0.95); player.inv = Math.max(player.inv, 2.5); P13.megaK = k; P13.megaUp = true; play('superOn'); gring(H.x, 0.1, H.z, 0x7ab8ff, 0.3, 2.5, 0.35);
        for (let i = 0; i < 10; i++){ const a = rnd() * TAU; pa(H.x, 0.2, H.z, Math.cos(a) * 3, 1, Math.sin(a) * 3, 0xdff0ff, 0.2, 0.5, 1, 2, 1.6, SH7.dot, 0.7); } } } }
  if (P13.megaUp && !grounded && vy < 1.5 && state === 'normal'){ P13.megaUp = false; diveMul = 3 * P13.megaK; diveRMul = 2.2; P13.megaDive = true;
    const e = nearestEnemy(10); if (e){ heading = angTo(H.x, H.z, e.g.position.x, e.g.position.z); hero.rotation.y = heading; } startMove('dive', 96); }
  if (P13.megaUp && grounded) P13.megaUp = false;
}
const _v3Update13 = v3Update;
v3Update = function(dt, pdt, playing){ _v3Update13(dt, pdt, playing);
  try { if (playing && gameState === 'play') tick13(dt, pdt); buttPose13(dt); } catch (err) { console.error(err); } };

/* ---------- v13.1 · marcianitos: el HUD no tapa a Míster Confianza ---------- */
/* (estilos de esta parte: css/marcianitos-v13.css) */

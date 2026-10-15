'use strict';
/* ---------- Cráteres, granizo y otros efectos ---------- */
function crater13(x, z, R, dur){
  const v = clampArena(new V3(x, 0, z)), m = mesh(new THREE.CircleGeometry(R, 14), craterMat13, v.x, 0.06, v.z); m.rotation.x = -Math.PI / 2;
  let tick = 0;
  hzFx({ upd(dt){ this.t += dt; tick -= dt; m.material.opacity = 0.55 * Math.min(1, (dur - this.t) / 0.5) * (0.85 + 0.15 * Math.sin(this.t * 14));
      if (rnd() < 0.7){ const a = rnd() * TAU, r = rnd() * R; pa(v.x + Math.cos(a) * r, 0.15, v.z + Math.sin(a) * r, 0, 1.6 + rnd(), 0, rnd() < 0.5 ? 0xff7a2a : 0xffd040, 0.16, 0.5, -1, 1, 0.2, SH7.dot, 0.8); }
      if (tick <= 0){ tick = 0.4; for (const e of liveE10()) if (Math.hypot(e.g.position.x - v.x, e.g.position.z - v.z) - e.r < R){
          hitEnemy(e, rdmg(syn13('piromano') ? 10 : 7), false, 0, 0, 0, 0.5, false, { src: 'aoe', el: 'fire' }); applyStatus(e, 'fire', 1); } }
      return this.t > dur; }, end(){ scene.remove(m); m.geometry.dispose(); } });
}
function hail13(){
  const L = liveE10(); if (!L.length) return; const e = pick10(L), x = e.g.position.x, z = e.g.position.z;
  const m = mesh(crisGeo13, hailMat13, x, 10, z); m.scale.setScalar(1.3);
  hzFx({ upd(dt){ this.t += dt; const tx = e.alive ? e.g.position.x : x, tz = e.alive ? e.g.position.z : z; m.position.set(tx, 10 * (1 - Math.min(1, this.t / 0.4) ** 2), tz); m.rotation.y += dt * 8;
      if (this.t >= 0.4 && !this.hit){ this.hit = true; explode(tx, tz, 1.3, 0x9fe8ff, 22, { el: 'ice', kind: 'shatter', sfx: 'shatter', knock: 2 });
        if (syn13('tormentaGranizo') && e.alive){ const n = nearestFrom(tx, tz, 4, new Set([e])); bolt(tx, 6, tz, tx, 0.2, tz, 0xfff27a, 0.08); if (n) chainLightning(tx, 1, tz, n, 1, 14); discover('s13_tormentaGranizo', 'Tormenta de granizo', SYNM13.tormentaGranizo[4]); }
        if (syn13('metralla')){ for (const o of liveE10()) if (Math.hypot(o.g.position.x - tx, o.g.position.z - tz) < 2.4) applyStatus(o, 'ice', 2); crystals7(tx, tz, 6, 1.6); discover('s13_metralla', 'Metralla helada', SYNM13.metralla[4]); } }
      return this.t > 0.5; }, end(){ scene.remove(m); } });
}
function landFx13(){
  // efectos al caer de un picado (con golpe o sin él)
  const H = hero.position, x = H.x, z = H.z;
  if (lvl('superheroe13')){
    const culo = syn13('culazo'), R = (2.2 + 0.6 * S10('superheroe13')) * (culo ? 2 : 1), st = 1 + 0.5 * S10('superheroe13');
    for (const e of liveE10()) if (Math.hypot(e.g.position.x - x, e.g.position.z - z) - e.r < R){ stunE(e, st); if (culo) e.tauntT = time + 3; }
    player.inv = Math.max(player.inv, 0.8); if (grounded) P13.kneelT = 0.6; gring(x, 0.1, z, 0xffffff, 0.3, R, 0.35);
    if (culo){ P13.buttT = 1.3; tA.set(x, H.y + 2.6, z); spawnNumber(tA, pick10(['Con todo el respeto', 'Sin comentarios', 'Aterrizaje técnico']), 'react', '#ffb0c8'); play('squeak'); discover('s13_culazo', 'Aterrizaje de culo', SYNM13.culazo[4]); }
    if (syn13('sismico')){ explode(x, z, 3.4, 0xffc070, 20 + 12 * up.quake, { kind: 'impact', knock: 5, sfx: 'slam' }); crack7(x, z, 8, 3, true); shake = Math.max(shake, 0.35); discover('s13_sismico', 'Aterrizaje sísmico', SYNM13.sismico[4]); }
  }
  if (lvl('meteoro13')){ const dur = (3 + S10('meteoro13')) * (syn13('piromano') ? 2 : 1); crater13(x, z, 1.6 + 0.4 * S10('meteoro13'), dur); if (syn13('piromano')) discover('s13_piromano', 'Pirómano', SYNM13.piromano[4]); }
  if (lvl('saltoElec13')){
    const n = (syn13('thor') && curW() === 'hammer' ? 3 : 1) + (syn13('monzon') ? 1 : 0), dmg = 26 * (1 + 0.3 * S10('saltoElec13'));
    if (syn13('thor') && curW() === 'hammer') discover('s13_thor', 'Thor de mercadillo', SYNM13.thor[4]);
    for (let i = 0; i < n; i++) later(0.05 + i * 0.14, () => { const t = nearestFrom(hero.position.x, hero.position.z, 4.5, null);
      if (t){ skyStrike(t, dmg); const c = nearestFrom(t.g.position.x, t.g.position.z, 4, new Set([t])); if (c) chainLightning(t.g.position.x, 1, t.g.position.z, c, 2 + S10('saltoElec13'), 16); }
      else { bolt(x, 9, z, x, 0.1, z, 0xfff27a, 0.1); explode(x, z, 1.6, 0xfff27a, 18, { el: 'shock', kind: 'overload', knock: 2 }); } });
  }
}

/* ---------- Picados: altura, cráteres, rayos, rebote ---------- */
const _startMove13 = startMove;
startMove = function(name, idx){ _startMove13(name, idx);
  if (name === 'dive'){ if (lvl('altura13')) diveMul *= 1 + 0.2 * lvl('altura13'); if (lvl('meteoro13')) diveRMul *= 1.4; } };
const _diveHold13 = diveHold;
diveHold = function(mv){
  const was = hitDone, boosted = diveMul > 1.2 && curW() === 'umbrella', mega = P13.megaDive;
  _diveHold13(mv);
  if (was || !hitDone) return;
  try {
    const H = hero.position;
    if (mega){ P13.megaDive = false; const k = P13.megaK; explode(H.x, H.z, 5.2, 0x7ab8ff, 60 * k, { kind: 'nova', knock: 9, sfx: 'slam' }); pillar7(H.x, H.z, 0x7ab8ff, 0xffffff, 0.8, 1.2); crack7(H.x, H.z, 10, 4.5, true); shake = Math.max(shake, 0.7); flash('#dff0ff', 0.3); }
    landFx13();
    if (boosted && lvl('umB2')){
      if (syn13('monzon')){ discover('s13_monzon', 'Monzón', SYNM13.monzon[4]);
        for (let k = 0; k < 4; k++) later(0.5 + k * 0.1, () => { const a = k / 4 * TAU + 1.2, px_ = H.x + Math.cos(a) * 3.6, pz_ = H.z + Math.sin(a) * 3.6;
          bolt(px_, 9, pz_, px_, 0.1, pz_, 0xfff27a, 0.12); play('zap'); explode(px_, pz_, 1.7, 0xffe070, 34, { el: 'shock', kind: 'overload', knock: 3 }); }); }
      if (syn13('tropical') || setOn('rayo')){ if (syn13('tropical')) discover('s13_tropical', 'Tormenta tropical', SYNM13.tropical[4]);
        later(0.55, () => { const t = nearestFrom(H.x, H.z, 6, null); if (t) chainLightning(H.x, 1.5, H.z, t, 3 + (setOn('rayo') ? 2 : 0), 20); }); }
    }
    // el pogo ha rebotado
    if (state === 'normal' && !grounded && vy > 8.5){
      if (syn13('vertigo')){ vy *= 1.3; discover('s13_vertigo', 'Vértigo extremo', SYNM13.vertigo[4]); }
      if (syn13('saltamontes')){ explode(H.x, H.z, 2.3, 0xfff27a, 18, { el: 'shock', kind: 'overload', knock: 2 }); discover('s13_saltamontes', 'Saltamontes eléctrico', SYNM13.saltamontes[4]); }
      if (typeof MOV11 !== 'undefined') MOV11.cut = true;
    }
  } catch (err) { console.error(err); }
};
const _jumpMul13 = jumpMul; jumpMul = function(){ return _jumpMul13() * (1 + 0.12 * lvl('altura13')); };

/* ---------- Acrobacias: críticos tras un mortal, impulsos aéreos extra, rebufo ---------- */
const acroCrit13 = () => { if (lvl('mortal13')) P13.acroUntil = time + 1.5 + S10('mortal13'); };
const _startFlip13 = startFlip12; startFlip12 = function(ax, dir, dur){ _startFlip13(ax, dir, dur); acroCrit13(); };
const _longJump13 = longJump12; longJump12 = function(){ _longJump13(); acroCrit13(); if (typeof MOV11 !== 'undefined') MOV11.cut = true; };
const _doRoll13 = doRoll;
doRoll = function(){
  const air = !grounded && state === 'normal' && !umb && canAct() && !invActive && !(typeof mgOverlay === 'function' && mgOverlay());
  if (air && AC12.airDash && P13.dashLeft > 0){ AC12.airDash = false; P13.dashLeft--; }
  const d0 = AC12.airDash; _doRoll13();
  if (air && !d0 && AC12.airDash){ P13.dashT = 0.42; P13.dashSet = new Set(); if (typeof MOV11 !== 'undefined') MOV11.cut = true; }
};
function dashTick13(pdt){
  if (P13.dashT <= 0) return;
  P13.dashT -= pdt; const H = hero.position, kami = syn13('kamikaze');
  if (lvl('rebufo13')){
    for (const e of liveE10()){ if (P13.dashSet.has(e)) continue; const dx = e.g.position.x - H.x, dz = e.g.position.z - H.z, d = Math.hypot(dx, dz);
      if (d - e.r < 1.05){ P13.dashSet.add(e); hitEnemy(e, rdmg(16 * (1 + 0.5 * S10('rebufo13')) * (kami ? 2 : 1)), rnd() < up.crit, dx / (d || 1), dz / (d || 1), 3, 2, false, { src: 'aoe' });
        streak7(e.g.position.x, 1.1, e.g.position.z, Math.sin(heading), 0, Math.cos(heading), 1.4, 0xdff0ff, 0.18, 0.05, 6); } }
    if (P13.dashT <= 0){ const R = kami ? 3 : 1.9; explode(H.x, H.z, R, 0x7ab8ff, 14 * (1 + 0.5 * S10('rebufo13')) * (kami ? 2 : 1), { kind: 'impact', knock: 3 }); gring(H.x, Math.max(0.1, H.y), H.z, 0xdff0ff, 0.2, R, 0.3);
      if (kami) discover('s13_kamikaze', 'Kamikaze', SYNM13.kamikaze[4]); }
  }
}

/* ---------- Golpes: siete, críticos, apuesta, calderilla ---------- */
const RANGED13 = new Set(['bolt', 'beam', 'orb', 'orbital', 'shot', 'truck', 'clone', 'chain']);
const _hitEnemy13 = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  const src = (o && o.src) || (melee ? 'melee' : 'other');
  if (e && e.alive && e.spawnT <= 0 && src !== 'dot' && gameState === 'play'){
    const isMelee = melee || src === 'melee';
    if (isMelee && lvl('siete13')){ P13.hits7++;
      if (P13.hits7 >= 7){ P13.hits7 = 0; const k = syn13('sieteYMedio') ? 3 : 1.77 + 0.77 * S10('siete13'); if (!crit){ crit = true; val *= critMul(); } val *= k;
        tA.set(e.g.position.x, e.numY + 0.9, e.g.position.z); spawnNumber(tA, '7', 'react', '#e8ff5a'); if (syn13('sieteYMedio')) discover('s13_sieteYMedio', 'Siete y medio', SYNM13.sieteYMedio[4]); } }
    if (isMelee && !crit && time < P13.acroUntil){ crit = true; val *= critMul(); if (syn13('circo') && P13.circoT > time) discover('s13_circo', 'Circo del Sol', SYNM13.circo[4]); }
    if (crit){ if (lvl('apuesta13')){ val *= syn13('allIn') ? 2 : 1.6; if (syn13('allIn')) discover('s13_allIn', 'All-in', SYNM13.allIn[4]); } if (setOn('fortuna')) val *= 1.2; }
    val = Math.max(1, Math.round(val));
  }
  const ok = _hitEnemy13(e, val, crit, nx, nz, knock, meterGain, melee, o);
  if (ok && crit && src !== 'dot' && lvl('monedas13') && e && rnd() < (0.08 + 0.05 * S10('monedas13')) * (syn13('bancoCentral') ? 2 : 1)){
    dropPickup(e.g.position.x + (rnd() - 0.5), e.g.position.z + (rnd() - 0.5)); if (syn13('bancoCentral')) discover('s13_bancoCentral', 'Banco central', SYNM13.bancoCentral[4]); }
  return ok;
};
const _cosDmgMul13 = cosDmgMul;
cosDmgMul = function(e, src){ let m = _cosDmgMul13(e, src);
  if (src === 'dot') return m * (lvl('toxicologia13') && e.poisonS > 0 ? 1 + 0.15 * lvl('toxicologia13') : 1);
  if (src === 'melee' && setOn('acrobacia') && (!grounded || (state === 'attack' && curMove && curMove.dive))) m *= 1.4;
  if (lvl('caraCruz13') && P13.coin === 'cara') m *= 1.3;
  if (syn13('segundaJuventud') && player.hp < player.maxHp * 0.35){ m *= 1.25; discover('s13_segundaJuventud', 'Segunda juventud', SYNM13.segundaJuventud[4]); }
  if (lvl('concentracion13') && player.meter >= 100) m *= 1.25 + 0.15 * S10('concentracion13');
  if (lvl('urgente13') && RANGED13.has(src)) m *= 1.2 + 0.15 * S10('urgente13');
  if (syn13('mensajeria') && (src === 'orbital' || src === 'orb')){ m *= 1.4; discover('s13_mensajeria', 'Mensajería celeste', SYNM13.mensajeria[4]); }
  if (syn13('portes') && src === 'truck'){ m *= 2; discover('s13_portes', 'Portes gratis', SYNM13.portes[4]); }
  if (lvl('tsundere13') && e === P13.tsun) m *= syn13('noMeToques') ? 2 : 1.5;
  if (lvl('toxicologia13') && e.poisonS > 0){ m *= 1 + 0.15 * lvl('toxicologia13') + (syn13('quimica') ? 0.15 : 0); if (syn13('quimica')) discover('s13_quimica', 'Química avanzada', SYNM13.quimica[4]); }
  return m; };
const _cosSpd13 = cosSpd;
cosSpd = function(){ let m = _cosSpd13();
  if (gameState !== 'play') return m;
  if (lvl('parkour13')) m *= 1 + 0.08 * lvl('parkour13');
  if (P13.turboT > 0) m *= syn13('dobleExpreso') ? 1.5 : 1.3;
  if (lvl('caraCruz13') && P13.coin === 'cruz') m *= 1.3;
  if (lvl('adrenalina13') && player.hp < player.maxHp * 0.35) m *= 1.2;
  if (syn13('zen') && player.meter >= 100) m *= 1.15;
  return m; };
const _atkSpd13 = atkSpd;
atkSpd = function(){ let m = _atkSpd13();
  if (P13.turboT > 0) m *= syn13('dobleExpreso') ? 1.5 : 1.3;
  if (P13.impT > 0) m *= 1.25;
  return m; };
const _cosFragMul13 = cosFragMul; cosFragMul = function(){ return _cosFragMul13() * (lvl('caraCruz13') && P13.coin === 'cruz' ? 1.3 : 1); };

/* ---------- Recibir golpes ---------- */
const _hurtPlayer13 = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){
  let d = dmg; const play_ = gameState === 'play' && !player.dead;
  const charging = state === 'charge' || (state === 'attack' && curMove && curMove.special);
  if (play_){
    if (lvl('muralla13') && charging) d *= lvl('muralla13') > 1 ? 0.3 : 0.5;
    if (lvl('adrenalina13') && player.hp < player.maxHp * 0.35) d *= 0.7;
    if (lvl('apuesta13')) d *= 1.2;
    const F = P13.fort;
    if (F && canAct() && player.inv <= 0 && state !== 'roll' && grounded){ const a = Math.min(d, F.cap - F.got);
      if (a > 0){ F.got += a; d -= a; player.inv = Math.max(player.inv, 0.35); tA.set(hero.position.x, hero.position.y + 2.5, hero.position.z); spawnNumber(tA, 'Absorbido', 'react', '#dfe6f0'); play('block');
        if (d <= 0.5) return 'none'; } }
  }
  if (up.armor > 0.65) d *= 0.35 / Math.max(0.05, 1 - up.armor);            // la defensa no pasa del 65 %
  const s0 = slowT, res = _hurtPlayer13(d, sx, sz, knock);
  if (!play_) return res;
  if (res === 'hit'){
    P13.lastHurt = time;
    if (lvl('tsundere13')){ const e = nearestFrom(sx, sz, 4, null); if (e){ P13.tsun = e; tA.set(e.g.position.x, e.numY + 0.6, e.g.position.z); spawnNumber(tA, '💢 Apuntado', 'react', '#ff7ad8'); if (syn13('noMeToques')) discover('s13_noMeToques', 'No me toques', SYNM13.noMeToques[4]); } }
    if (lvl('chaleco13')){ const at = syn13('atestado'), R = at ? 3.6 : 2.5; flash('#fff6a0', 0.12); gring(hero.position.x, 0.1, hero.position.z, 0xfff27a, 0.3, R, 0.3);
      for (const e of liveE10()) if (Math.hypot(e.g.position.x - hero.position.x, e.g.position.z - hero.position.z) - e.r < R) stunE(e, at ? 1.2 : 0.6);
      if (at) discover('s13_atestado', 'Atestado', SYNM13.atestado[4]); }
    if (syn13('erizo') && charging){ explode(hero.position.x, hero.position.z, 2.7, 0xffc070, 32, { kind: 'impact', knock: 6 }); crystals7(hero.position.x, hero.position.z, 8, 1.8); discover('s13_erizo', 'Erizo', SYNM13.erizo[4]); }
  }
  if (res === 'dodge' && slowT > s0 + 0.5 && syn13('matrix')){ AC12.airDash = false; P13.dashLeft = Math.max(P13.dashLeft, 1); slowT += 0.6; discover('s13_matrix', 'Matrix', SYNM13.matrix[4]); }
  return res;
};

/* ---------- Derrotas, oleadas, especial, combo ---------- */
const _killEnemy13 = killEnemy;
killEnemy = function(e){
  const was = e && e.alive; _killEnemy13(e);
  if (!was || gameState !== 'play' || MG.active) return;
  if (lvl('sed13')){ heal(lvl('sed13') * (syn13('banquete') ? 3 : 1), true); if (syn13('banquete')) discover('s13_banquete', 'Banquete', SYNM13.banquete[4]); }
  if (setOn('fortuna') && !e.isBoss && rnd() < 0.08) dropPickup(e.g.position.x, e.g.position.z);
  if (P13.refundT > 0 && lvl('reembolso13')){ const per = 6 + 4 * S10('reembolso13'), cap = syn13('propina') ? 999 : 40;
    const add = Math.max(0, Math.min(per, cap - P13.refundGot)); if (add > 0){ P13.refundGot += add; player.meter = Math.min(100, player.meter + add); }
    if (syn13('propina') && P13.refundGot > 40) discover('s13_propina', 'Propina', SYNM13.propina[4]); }
  if (lvl('tragaperras13')){ P13.slotN++; const need = syn13('casino') ? 12 : lvl('tragaperras13') > 1 ? 14 : 20; if (P13.slotN >= need){ P13.slotN = 0; slotPull13(); } }
  if (e === P13.tsun) P13.tsun = null;
};
const _startWave13 = startWave;
startWave = function(n){ _startWave13(n);
  P13.waveT0 = time;
  if (lvl('caraCruz13')){ P13.coin = rnd() < 0.5 ? 'cara' : 'cruz'; later(0.6, () => banner(P13.coin === 'cara' ? '🪙 Cara<small>+30 % de daño esta oleada</small>' : '🪙 Cruz<small>+30 % de velocidad y de fragmentos esta oleada</small>', 1.4)); }
};
const _doSpecial13 = doSpecial;
doSpecial = function(){ const m0 = player.meter; _doSpecial13();
  if (!(m0 >= 100 && player.meter < 100) || invActive || MG.active || gameState !== 'play') return;
  if (lvl('turbo13')){ P13.turboT = (5 + 2 * S10('turbo13')) * (syn13('dobleExpreso') ? 2 : 1); if (syn13('dobleExpreso')) discover('s13_dobleExpreso', 'Doble expreso', SYNM13.dobleExpreso[4]); }
  if (lvl('reembolso13')){ P13.refundT = 1.8; P13.refundGot = 0; }
  if (setOn('impetu')) P13.impT = 4;
  if (syn13('lluviaLava')){ discover('s13_lluviaLava', 'Lluvia de lava', SYNM13.lluviaLava[4]);
    later(1.2, () => { const L = liveE10(); for (let i = 0; i < 4; i++){ const e = L.length ? pick10(L) : null; if (e) crater13(e.g.position.x, e.g.position.z, 1.7, 3); } }); }
};
const _addCombo13 = addCombo;
addCombo = function(){ _addCombo13();
  if (lvl('racha13') && combo > 0 && combo % 10 === 0){ player.meter = Math.min(100, player.meter + (5 + 3 * S10('racha13')) * (syn13('aRitmo') ? 2 : 1)); if (syn13('aRitmo')) discover('s13_aRitmo', 'A ritmo', SYNM13.aRitmo[4]); } };
const _chooseUpgrade13 = chooseUpgrade;
chooseUpgrade = function(i){ _chooseUpgrade13(i); try { synCheck13(); } catch (err) { console.error(err); } };
const _startRun13 = startRun;
startRun = function(){
  Object.assign(P13, { spdK: 1, critAdd: 0, acroUntil: 0, hits7: 0, coin: null, waveT0: 0, lastHurt: -99, regT: 0, setRegT: 0, hailT: 3, combT: 4, turboT: 0, impT: 0, refundT: 0, refundGot: 0,
    slotN: 0, dashLeft: 0, dashT: 0, tsun: null, kneelT: 0, buttT: 0, mega: null, megaUp: false, megaDive: false, airJ0: 0, circoT: 0 });
  if (P13.fort){ scene.remove(P13.fort.m); P13.fort = null; } slotEl13.hidden = true;
  _startRun13();
};

/* ---------- Cartas: qué sinergia completas ---------- */
const _renderCards13 = renderCards10;
renderCards10 = function(){ _renderCards13();
  try { [...cardsEl.children].forEach((b, i) => { const u = offer[i]; if (!u) return;
      const done = SYN13.filter(s => (s[1] === u.id && lvl(s[2]) && !lvl(s[1])) || (s[2] === u.id && lvl(s[1]) && !lvl(s[2])));
      let html = done.map(s => `<span class="csyn go">⚗️ ¡Sinergia con ${upName13(s[1] === u.id ? s[2] : s[1])}!: <b>${s[3]}</b> · ${s[4]}</span>`).join('');
      if (!html && !lvl(u.id)){ const parts = SYN13.filter(s => s[1] === u.id || s[2] === u.id).map(s => upName13(s[1] === u.id ? s[2] : s[1])).slice(0, 2);
        if (parts.length) html = `<span class="csyn dim">⚗️ Combina con: ${parts.join(', ')}</span>`; }
      if (!html) return; const lv = b.querySelector('.lvl'); if (lv) lv.insertAdjacentHTML('beforebegin', html); else b.insertAdjacentHTML('beforeend', html); }); } catch (err) { console.error(err); }
};

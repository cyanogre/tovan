'use strict';
/* ---------- Bucle de las mejoras (se llama desde frame) ---------- */
let prevState = 'normal';
function extraUpdate(pdt, playing, wantMove){
  if (playing){
    if (state === 'charge' && invActive){ state = 'normal'; chOrb.visible = false; }
    const held = atkHeld() && !invActive;
    holdT = held ? holdT + pdt : 0;
    const thr = keys.KeyJ || gpAtkHeld || touchAtkHeld ? 0.3 : 0.01;
    if (held && holdT > thr && canAct() && grounded && !lcut && timeStopT <= 0 && !umb &&
        (state === 'normal' || (state === 'attack' && hitDone && !queued && !curMove.special && !curMove.custom && !curMove.dive && !curMove.hits && stepT / curMove.dur > 0.5))) startCharge();
    if (state === 'charge') chargeTick(pdt, held, wantMove); else chOrb.visible = false;
    if (state === 'roll' && prevState !== 'roll') cosOnRollStart();
    if (state === 'roll' && meta.cos.hat === 'kitsune'){
      if (rnd() < 0.6) spawnFx(hero.position.x + (rnd() - 0.5) * 0.5, 0.2 + rnd() * 0.5, hero.position.z + (rnd() - 0.5) * 0.5, 0, 1.2, 0, rnd() < 0.5 ? 0x5ab8ff : 0xbfe8ff, 0.08, 0.45, -1, 1);
      for (const e of enemies){ if (!e.alive || e.spawnT > 0 || kitsuneSet.has(e)) continue;
        if (Math.hypot(e.g.position.x - hero.position.x, e.g.position.z - hero.position.z) - e.r < 0.7){ kitsuneSet.add(e); hitEnemy(e, rdmg(16), false, 0, 0, 1.5, 3, false, { src: 'aoe', el: 'fire', power: 1.5 }); } } }
    if (honkCd > 0) honkCd -= pdt; if (danceBuffT > 0) danceBuffT -= pdt; if (counterT > 0) counterT -= pdt;
    if (combo === 0) churroSt = 0;
    if (meta.cos.hat === 'halo' && !player.dead){ haloT += pdt; if (haloT >= 3){ haloT = 0; heal(1, true); } }
    if (grounded) duckJump = false;
    // combo con pausa: aviso de que ya puedes rematar con la ráfaga
    if (state === 'normal' && comboT > 0 && comboNext === 2 && comboT < 0.52 && !pauseCue){ pauseCue = true; play('cue');
      for (let i = 0; i < 8; i++){ const a = i / 8 * TAU; spawnFx(hero.position.x + Math.cos(a) * 0.5, 1.9, hero.position.z + Math.sin(a) * 0.5, Math.cos(a) * 0.6, 0.6, Math.sin(a) * 0.6, 0xffd970, 0.05, 0.35, 0, 0); } }
    shieldM.visible = lumenShield; if (lumenShield) shieldM.rotation.y += pdt;
  } else if (state === 'charge'){ state = 'normal'; chargeLvl = 0; chOrb.visible = false; }
  umbTick(pdt);
  if (pdt > 0){ updateWaves(pdt); updateRangs(pdt); updateSlashes(pdt); updateBills(pdt); }
  if (state !== 'attack' || curMove !== MV.chSmash) WEAPONS.baguette.scale.y += (1 - WEAPONS.baguette.scale.y) * Math.min(1, pdt * 12);
  prevState = state;
}
function clearExtras(){
  for (const w of waves) scene.remove(w.g); waves.length = 0;
  for (const r of rangs) scene.remove(r.g); rangs.length = 0; WEAPONS.chancla.visible = meta.cos.weapon === 'chancla';
  for (const s of slashes) scene.remove(s.m); slashes.length = 0;
  for (const b of bills) scene.remove(b.m); bills.length = 0;
  chOrb.visible = false; shieldM.visible = false; umb = null; WEAPONS.baguette.scale.y = 1; if (umbCone) umbCone.scale.set(1, 1, 1);
}
const _clearWorld = clearWorld;
clearWorld = function(){ _clearWorld(); clearExtras(); };

/* ---------- Oleadas: té, baile, escudo, kit de bienvenida y consejos ---------- */
const _startWave = startWave;
startWave = function(n){
  if (n === 1 && kitPending){ kitPending = false; kitAfter = true; wave = 0; openUpgrades(); banner('Kit de bienvenida<small>Elige con qué empiezas</small>', 1.6); return; }
  _startWave(n);
  if (meta.cos.hat === 'teapot') player.meter = Math.min(100, player.meter + 20);
  if (danceNext){ danceNext = false; danceBuffT = 10; tA.set(hero.position.x, hero.position.y + 2.6, hero.position.z); spawnNumber(tA, '¡A tope!', 'react', '#ff8ad8'); }
  if (ml('shieldS')) lumenShield = true;
  if ((n === 2 || n === 4 || n === 7) && (meta.tipMoves || 0) < 3){ meta.tipMoves = (meta.tipMoves || 0) + 1; saveMeta();
    const tip = n === 2 ? 'Truco: mantén atacar para cargar un golpe. Cada arma tiene el suyo.' : n === 4 ? 'Si atacas en el aire caes en picado. Cuanto más alto, más duele.' : 'Ataca, ataca, espera un pelín y ataca: ráfaga. Y si atacas mientras ruedas, estocada.';
    later(2.2, () => bark(tip)); }
};
const _afterUpgrade = afterUpgrade;
afterUpgrade = function(){ if (kitAfter){ kitAfter = false; startWave(1); return; } _afterUpgrade(); };

/* ---------- Lista de movimientos (pausa) ---------- */
function movesHTML(){
  const w = meta.cos.weapon, wn = cosName('weapon', w), equipped = COS_CATS.map(([k, n]) => [k, n, meta.cos[k]]).filter(([k, , id]) => cosPow(k, id));
  return `<h3 class="synh">📜 Movimientos</h3><div class="moves">` +
    `<b>Ráfaga</b><span>J J · pausa · J: siete golpes rápidos y remate. Un destello dorado te avisa.</span>` +
    `<b>Cargado</b><span>Mantén J y suelta al brillar (dorado = carga máxima). Con ${wn}: ${(COS_POW.weapon[w] || '').split('Cargado: ')[1] || ''}</span>` +
    `<b>Picado</b><span>Salta y J en el aire. Cuanto más alto, más fuerte.</span>` +
    `<b>Estocada</b><span>J mientras ruedas: atraviesa a todos. Si acabas de esquivar un golpe, es un contraataque crítico.</span>` +
    `<b>Especial</b><span>L con la barra ÍMP llena.</span></div>` +
    (equipped.length ? `<h3 class="synh">👕 Poderes del vestidor</h3><div class="moves">${equipped.map(([k, n, id]) => `<b>${cosName(k, id)}</b><span>${cosPow(k, id)}</span>`).join('')}</div>` : '');
}

/* ---------- Logros nuevos ---------- */
ACH.splice(ACH.length - 1, 0,
  { id: 'charge50', ic: '🔆', name: 'Paciencia de maestro', desc: 'Suelta 50 ataques cargados al máximo.', prog: () => [meta.stats.chargeMax || 0, 50], rw: [['title', 'Maestro de la carga']] },
  { id: 'chancla4', ic: '🩴', name: 'La chancla nunca falla', desc: 'Golpea a 8 enemigos con un solo lanzamiento de chancla (ida y vuelta cuentan).', rw: [['title', 'Abuela honoraria']] },
  { id: 'dive3', ic: '☄️', name: 'Meteorito', desc: 'Derrota a 3 enemigos de un solo picado.', rw: [['title', 'Meteorito']] },
  { id: 'iaido4', ic: '🗡️', name: 'Ya estaban cortados', desc: 'Derrota a 4 enemigos con un solo Iaido.', rw: [['title', 'Samurái de reparto']] },
  { id: 'pan4', ic: '🥖', name: 'Pan para hoy', desc: 'Derrota a 4 enemigos con un solo barrazo de pan (o a 3 con un graznido).', rw: [['title', 'Panadero de guardia']] },
  { id: 'bills300', ic: '💸', name: 'Lluvia de millones', desc: 'Recoge 300 billetes.', prog: () => [meta.stats.bills || 0, 300], rw: [['title', 'Influencer financiero']] });
COS.title.push(['Maestro de la carga', 'Maestro de la carga', '🏷️'], ['Abuela honoraria', 'Abuela honoraria', '🏷️'], ['Meteorito', 'Meteorito', '🏷️'],
  ['Samurái de reparto', 'Samurái de reparto', '🏷️'], ['Panadero de guardia', 'Panadero de guardia', '🏷️'], ['Influencer financiero', 'Influencer financiero', '🏷️']);

/* ---------- Sonidos nuevos ---------- */
Object.assign(SFX, {
  chargeStart: () => { tone({ type: 'sine', f0: 220, f1: 440, dur: 0.5, vol: 0.06, rv: 0.3 }); noise({ dur: 0.4, vol: 0.05, f0: 600, f1: 2400, q: 3, rv: 0.2 }); },
  chargeLv1:  () => { tone({ type: 'triangle', f0: NOTE(84), dur: 0.18, vol: 0.1, rv: 0.4 }); tone({ type: 'triangle', f0: NOTE(88), dur: 0.25, vol: 0.08, when: 0.06, rv: 0.4 }); },
  chargeLv2:  () => { seq_([[84, 0.1], [88, 0.1], [91, 0.1], [96, 0.4]], 'square', 0.04, 0.07, 0.6); noise({ dur: 0.4, vol: 0.1, f0: 5000, type: 'highpass', q: 0.7, rv: 0.5 }); },
  lanternWave:() => { noise({ dur: 0.45, vol: 0.25, f0: 1200, f1: 5000, q: 1.5, rv: 0.4 }); tone({ type: 'sine', f0: 880, f1: 1760, dur: 0.35, vol: 0.12, rv: 0.6 }); },
  boing:      () => tone({ type: 'sine', f0: 180, f1: 520, dur: 0.3, vol: 0.18, rv: 0.2 }),
  sugar:      () => { noise({ dur: 0.7, vol: 0.18, f0: 900, f1: 3500, q: 2, rv: 0.3 }); tone({ type: 'triangle', f0: NOTE(79), dur: 0.5, vol: 0.06, when: 0.1, rv: 0.6 }); },
  boomerang:  () => { for (let i = 0; i < 6; i++) noise({ dur: 0.12, vol: 0.12, f0: 1400 + i * 120, q: 4, when: i * 0.1, rv: 0.1 }); },
  catch:      () => { tone({ type: 'square', f0: NOTE(79), dur: 0.06, vol: 0.06, rv: 0.1 }); tone({ type: 'square', f0: NOTE(86), dur: 0.1, vol: 0.06, when: 0.05, rv: 0.2 }); },
  chanclazo:  () => { noise({ dur: 0.09, vol: 0.4, f0: 1800, q: 0.8, rv: 0.1 }); tone({ type: 'square', f0: 260, f1: 120, dur: 0.08, vol: 0.12, rv: 0.1 }); },
  squawk:     () => { for (let i = 0; i < 4; i++){ tone({ type: 'sawtooth', f0: 900 - i * 60, f1: 500, dur: 0.12, vol: 0.1, when: i * 0.1, rv: 0.2 }); } noise({ dur: 0.5, vol: 0.12, f0: 2000, q: 2, rv: 0.4 }); },
  sheath:     () => { noise({ dur: 0.08, vol: 0.2, f0: 6000, type: 'highpass', q: 1, rv: 0.1 }); tone({ type: 'sine', f0: 2600, dur: 0.06, vol: 0.06, rv: 0.3 }); },
  iaido:      () => { noise({ dur: 0.3, vol: 0.35, f0: 7000, f1: 1500, q: 1.2, rv: 0.5 }); tone({ type: 'triangle', f0: NOTE(93), dur: 0.6, vol: 0.08, when: 0.05, rv: 0.8 }); },
  umbrella:   () => { noise({ dur: 0.18, vol: 0.25, f0: 500, f1: 2400, q: 1, rv: 0.2 }); tone({ type: 'triangle', f0: NOTE(72), f1: NOTE(84), dur: 0.4, vol: 0.08, rv: 0.4 }); },
  dive:       () => { tone({ type: 'sine', f0: 1400, f1: 300, dur: 0.3, vol: 0.08, rv: 0.2 }); noise({ dur: 0.25, vol: 0.15, f0: 3000, f1: 600, q: 1, rv: 0.1 }); },
  cue:        () => tone({ type: 'triangle', f0: NOTE(96), dur: 0.12, vol: 0.05, rv: 0.6 }),
  block:      () => { tone({ type: 'square', f0: 1200, f1: 800, dur: 0.06, vol: 0.07, rv: 0.2 }); noise({ dur: 0.08, vol: 0.12, f0: 4000, q: 2, rv: 0.2 }); },
  cash:       () => { seq_([[88, 0.08], [93, 0.14]], 'square', 0.05, 0.05, 0.3); noise({ dur: 0.15, vol: 0.06, f0: 6000, type: 'highpass', q: 1, rv: 0.2 }); },
  bill:       () => tone({ type: 'triangle', f0: NOTE(91 + Math.floor(rnd() * 5)), dur: 0.08, vol: 0.05, rv: 0.2 })
});

/* ---------- Tovan más vivo: gestos cuando se queda quieto ---------- */
let restT = 0, idleI = 0, idleW = 0, idleKind = null, idleLast = 'look', idleK = 0;
const IDLE_SEQ = ['look', 'stretch', 'hips', 'lantern', 'tap', 'look', 'yawn'];
const _applyDance = applyDance;
applyDance = function(pdt, moving){
  _applyDance(pdt, moving);
  const still = (gameState === 'play' || gameState === 'title' || gameState === 'over') && state === 'normal' && grounded && !moving && celebT <= 0 && waveT <= 0 && !player.dead && attackW < 0.05 && !(tech && tech.phase);
  restT = still ? restT + pdt : 0;
  if (still && restT > 2.6 && !idleKind){ idleKind = idleLast = IDLE_SEQ[idleI++ % IDLE_SEQ.length]; idleK = 0;
    if (gameState === 'play' && idleKind === 'tap' && enemies.some(e => e.alive)) barkOnce('idleTap', '¿Vamos? Que el albarán no se firma solo.'); }
  if (idleKind){ idleK += pdt; if (!still || idleK > (idleKind === 'stretch' || idleKind === 'yawn' ? 2.4 : 3.4)){ idleKind = null; restT = still ? 0.8 : 0; } }
  idleW += ((idleKind ? 1 : 0) - idleW) * (1 - Math.exp(-pdt * (idleKind ? 5 : 9)));
  if (idleW < 0.01) return;
  const w = idleW, k = idleK, L = P.armL, R = P.armR;
  const hips = (wl, wr) => { bl(L.sh.rotation, 'z', -0.62, wl); bl(L.sh.rotation, 'x', 0.25, wl); bl(L.el.rotation, 'z', 1.5, wl); bl(L.el.rotation, 'x', -0.3, wl);
    bl(R.sh.rotation, 'z', 0.62, wr); bl(R.sh.rotation, 'x', 0.25, wr); bl(R.el.rotation, 'z', -1.5, wr); bl(R.el.rotation, 'x', -0.3, wr); };
  switch (idleLast){
    case 'look':     // mira a un lado y a otro, mano en la cadera
      hips(w, 0); bl(P.neck.rotation, 'y', Math.sin(k * 1.7) * 0.85, w); bl(P.neck.rotation, 'x', -0.08, w); bl(P.spine.rotation, 'y', Math.sin(k * 1.7) * 0.15, w); break;
    case 'stretch': { // se estira hacia arriba
      const s = Math.min(1, k / 0.6) * (1 + Math.sin(k * 9) * 0.03);
      bl(L.sh.rotation, 'z', -2.75 * s, w); bl(R.sh.rotation, 'z', 2.75 * s, w); bl(L.el.rotation, 'x', -0.25, w); bl(R.el.rotation, 'x', -0.25, w);
      bl(P.spine.rotation, 'x', -0.22 * s, w); bl(P.neck.rotation, 'x', 0.35 * s, w); P.hips.position.y += 0.03 * s * w; break; }
    case 'hips':     // brazos en jarra y cabeza ladeada
      hips(w, w); bl(P.neck.rotation, 'z', 0.22, w); bl(P.neck.rotation, 'y', -0.25, w); break;
    case 'tap':      // impaciente: brazos en jarra y pie que golpea el suelo
      hips(w, w); bl(P.legR.hip.rotation, 'x', -0.25 - Math.max(0, Math.sin(k * 11)) * 0.25, w); bl(P.legR.knee.rotation, 'x', 0.3 + Math.max(0, Math.sin(k * 11)) * 0.2, w);
      bl(P.neck.rotation, 'x', 0.1, w); bl(P.neck.rotation, 'y', Math.sin(k * 0.9) * 0.3, w);
      if (Math.sin(k * 11) > 0.97 && rnd() < 0.5) puffAt(hero.position.x + 0.15, hero.position.z + 0.1, 1, 0.4); break;
    case 'lantern':  // se rasca la cabeza y mira al cielo
      bl(R.sh.rotation, 'z', 1.15, w); bl(R.sh.rotation, 'x', -1.6, w); bl(R.el.rotation, 'x', -1.9, w); bl(R.el.rotation, 'z', -0.4 + Math.sin(k * 14) * 0.25, w);
      bl(P.neck.rotation, 'x', 0.18, w); bl(P.neck.rotation, 'z', -0.15, w); break;
    case 'yawn': {   // bostezo con la mano en la boca
      const s = Math.min(1, k / 0.5);
      bl(L.sh.rotation, 'x', -2.05, w); bl(L.sh.rotation, 'z', 0.3, w); bl(L.el.rotation, 'x', -2.25, w); bl(L.el.rotation, 'z', 0.3, w);
      bl(R.sh.rotation, 'z', 0.9 * s, w); bl(P.neck.rotation, 'x', 0.3 * s, w); bl(P.spine.rotation, 'x', -0.12 * s, w); break; }
  }
};

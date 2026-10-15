'use strict';
/* ======================================================================
   FAMILIA OTAKU: técnicas y poderes (parodias con cariño)
   ====================================================================== */
TAGS.otaku = { n: 'Otaku', ic: '📺', col: '#ff7ad8', bonus: 'Energía de protagonista: la primera vez que bajas del 20 % de PV en cada oleada, te levantas con un 30 % y 3 s de invulnerabilidad.' };
TAG_KEYS.push('otaku');
UPGRADES.push(
  { id: 'kame',   r: 'epica',   tags: ['otaku'], ic: '🌊', tech: true, name: 'Onda Kame-hame-ja', desc: 'Técnica: tu especial se convierte en un rayo de energía que arrasa todo en línea recta. Cargarlo te deja vendido un segundo.', max: 1, apply: () => { up.tech = 'kame'; } },
  { id: 'world',  r: 'epica',   tags: ['otaku'], ic: '⏱️', tech: true, name: '¡Za Warudo!', desc: 'Técnica: tu especial detiene el tiempo 4 segundos. Todo el daño que hagas entra de golpe cuando vuelve a correr.', max: 1, apply: () => { up.tech = 'world'; } },
  { id: 'genki',  r: 'epica',   tags: ['otaku'], ic: '🔵', tech: true, name: 'Genki-bola', desc: 'Técnica: alza los brazos y reúne energía en una bola gigante. Cuantos más enemigos haya, más grande y más daño.', max: 1, apply: () => { up.tech = 'genki'; } },
  { id: 'omae',   r: 'epica',   tags: ['otaku'], ic: '👉', name: 'Tú ya estás muerto', desc: 'Los enemigos que reciben tu golpe final quedan marcados. Tres segundos después… ¿NANI?', max: 1, apply: () => {} },
  { id: 'clones', r: 'leyenda', tags: ['otaku'], ic: '👥', name: 'Multiclones de sombra', desc: 'Dos clones de sombra te acompañan e imitan cada golpe con la mitad de fuerza.', max: 1, req: () => has('otaku', 2), apply: () => { cloneP.forEach(c => c.copy(hero.position)); cloneSmoke(); } },
  { id: 'super',  r: 'rara',    tags: ['otaku'], ic: '💛', name: 'Súper Repartidor', desc: 'Con combo 50 o más, tu pelo se vuelve dorado: +40 % de daño y +20 % de velocidad hasta que se rompa el combo.', max: 1, apply: () => {} },
  { id: 'stonks', r: 'rara',    tags: ['otaku'], ic: '📈', name: 'Stonks', desc: 'Cada enemigo derrotado da +1 % de daño (hasta +60 %). Si te golpean, pierdes la mitad. Not stonks.', max: 1, apply: () => {} },
  { id: 'truck',  r: 'rara',    tags: ['otaku'], ic: '🚚', name: 'Camión-kun', desc: 'Cada cierto tiempo un camión cruza la arena y manda a los enemigos a otro mundo. A ti te esquiva. Casi siempre.', max: 2, apply: () => { truckT = 3; } },
  { id: 'note',   r: 'epica',   tags: ['otaku'], ic: '📓', name: 'Cuaderno de la muerte', desc: 'Cada 16 s apuntas el nombre del enemigo más duro. Cuatro segundos después, cae fulminado. A los jefes les quita un 15 %.', max: 1, apply: () => { noteT = 4; } },
  { id: 'fine',   r: 'rara',    tags: ['otaku'], ic: '☕', name: 'Esto está bien', desc: 'Con menos del 40 % de PV ardes: +50 % de daño y quemas a quien se acerque. Todo está bien. Todo.', max: 1, apply: () => {} }
);
const TECH_NAMES = { kame: 'Onda Kame-hame-ja', world: '¡Za Warudo!', genki: 'Genki-bola' };
let stonks = 0, superOn = false, fineOn = false, protaUsed = false, truckT = 20, noteT = 16, timeStopT = 0, fineTick = 0;
const otakuMul = () => (superOn ? 1.4 + 0.15 * S10('super') : 1) * (1 + stonks * 0.01) * (fineOn ? 1.5 + 0.25 * S10('fine') : 1);
const bigShout = t => { csShout(t); };

/* ---------- Técnicas (sustituyen el especial) ---------- */
const Ot = { cyan: makeMat(0x8ff6ff, { emissive: 1 }), core: makeMat(0xffffff, { emissive: 1 }), outer: makeMat(0x49d8ff, { emissive: 1, opacity: 0.55 }),
  genki: makeMat(0xcfeaff, { emissive: 1 }), genkiO: makeMat(0x7fc8ff, { emissive: 1, opacity: 0.5 }), shadow: 0x3a2a6a };
const kameOrb = mesh(new THREE.IcosahedronGeometry(0.2, 1), Ot.cyan, 0, -10, 0); kameOrb.visible = false;
const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 12, 1, true); beamGeo.rotateX(Math.PI / 2); beamGeo.translate(0, 0, 0.5);
const beamG = new THREE.Group(); scene.add(beamG); beamG.visible = false;
const beamCore = mesh(beamGeo, Ot.core, 0, 0, 0, beamG), beamOut = mesh(beamGeo, Ot.outer, 0, 0, 0, beamG);
beamOut.material.side = THREE.DoubleSide;
const genkiBall = mesh(new THREE.IcosahedronGeometry(1, 1), Ot.genki, 0, -10, 0); genkiBall.visible = false;
const genkiGlow = mesh(new THREE.IcosahedronGeometry(1.25, 1), Ot.genkiO, 0, 0, 0, genkiBall);
let tech = null;
const techSet = () => ['world', 'genki', 'kame'].filter(id => lvl(id));
const TECH_CALL = { world: '¡ZA WARUDO!', genki: '¡Prestadme vuestra energía!', kame: null, 'kame+world': '¡ZA KAME-HAME-JA!', 'genki+kame': '¡GENKI-HAME-JA!',
  'genki+world': '¡GENKI EN TIEMPO DETENIDO!', 'genki+kame+world': '¡TÉCNICA DEFINITIVA DEL REPARTIDOR!' };
const TECH_SYN = { 'kame+world': 'Kame-hame-ja + Za Warudo: todo el daño del rayo estalla cuando el tiempo vuelve a correr.', 'genki+kame': 'Genki-bola + Kame-hame-ja: la bola sale disparada como un rayo gigante.',
  'genki+world': 'Genki-bola + Za Warudo: reúnes la energía con el mundo congelado.', 'genki+kame+world': 'Las tres técnicas a la vez.' };
const beamPool = [];
function beamAt(i){ while (beamPool.length <= i){ const g = new THREE.Group(); scene.add(g); g.visible = false; beamPool.push({ g, c: mesh(beamGeo, Ot.core, 0, 0, 0, g), o: mesh(beamGeo, Ot.outer, 0, 0, 0, g) }); } return beamPool[i]; }
function startTech(){
  const set = techSet(); if (!set.length) return;
  const key = set.slice().sort().join('+');
  state = 'tech'; waveT = 0; staffToBack(); trailAlpha = 0;
  const e = nearestEnemy(9); if (e) heading = angTo(hero.position.x, hero.position.z, e.g.position.x, e.g.position.z); hero.rotation.y = heading;
  tech = { set: new Set(set), key, t: 0, pt: 0, dir: heading, inv: false, phase: '', R: 0.3, n: 0, width: 1, dmgMul: 1 };
  const call = TECH_CALL[key]; if (call) bigShout(call);
  if (set.length > 1) discover('tech_' + key, call.replace(/[¡!]/g, ''), TECH_SYN[key]);
  if (tech.set.has('world')){ timeStopT = 4.35 + 1.5 * S10('world'); tech.inv = true; play('zawarudo'); flash('#ffe070', 0.6); ringFx(hero.position.x, hero.position.z, 0xffe070, 0.3, 14, 0.4, 1); }
  if (tech.set.has('genki')){ tech.phase = 'gather'; tech.gdur = tech.set.has('world') ? 0.9 : 1.5; play('genki'); }
  else if (tech.set.has('kame')) toKame(1.2);
  else { tech.phase = 'done'; state = 'normal'; }
}
function toKame(dur){ tech.phase = 'charge'; tech.pt = 0; tech.cdur = tech.set.has('world') ? Math.min(dur, 0.6) : dur; tech.wi = -1; play('kameCharge'); }
function techBeams(){
  const hp = hero.position, list = [[hp.x, hp.z, 0]];
  for (let k = 1; k <= lvl('mirror'); k++) list.push([hp.x, hp.z, 0.32 * k], [hp.x, hp.z, -0.32 * k]);
  if (lvl('clones')) cloneP.forEach(c => list.push([c.x, c.z, 0]));
  return list;
}
function genkiTargets(){
  const live = enemies.filter(e => e.alive && e.spawnT <= 0);
  const scored = live.map(e => [e, live.filter(o => Math.hypot(o.g.position.x - e.g.position.x, o.g.position.z - e.g.position.z) < 3).length]).sort((a, b) => b[1] - a[1]);
  const count = 1 + 2 * lvl('mirror'), balls = [];
  for (let i = 0; i < count; i++){ const t = scored.length ? scored[i % scored.length][0] : null;
    const to = t ? new V3(t.g.position.x, 0, t.g.position.z) : new V3(hero.position.x + Math.sin(tech.dir) * 4, 0, hero.position.z + Math.cos(tech.dir) * 4);
    const m = i === 0 ? genkiBall : mesh(genkiBall.geometry, genkiBall.material, genkiBall.position.x, genkiBall.position.y, genkiBall.position.z);
    if (i) m.scale.setScalar(tech.R * 0.55);
    balls.push({ m, from: genkiBall.position.clone(), to, tgt: t, s: i ? 0.55 : 1 }); }
  if (count > 1) discover('genki_mirror', 'Lluvia de Genki', 'Espejo + Genki-bola: varias bolas a la vez.');
  if (lvl('homing')) discover('genki_homing', 'Genki teledirigida', 'Teledirigido + Genki-bola: la bola persigue a su objetivo.');
  if (lvl('giant')) discover('genki_giant', 'Genki colosal', 'Seta gigante + Genki-bola.');
  return balls;
}
function endTech(){ kameOrb.visible = false; genkiBall.visible = false; beamPool.forEach(b => { b.g.visible = false; }); if (tech) tech.phase = 'done'; if (state === 'tech') state = 'normal'; if (timeStopT <= 0) tech = null; }
function cancelTech(){ if (!tech) return; kameOrb.visible = false; beamG.visible = false; genkiBall.visible = false; beamPool.forEach(b => { b.g.visible = false; }); tech = null; if (state === 'tech') state = 'normal'; }
function techUpdate(dt){
  if (!tech) return;
  if (tech.phase === 'done'){ if (timeStopT <= 0) tech = null; return; }
  if (state !== 'tech'){ cancelTech(); return; }
  tech.t += dt; tech.pt += dt; const P = tech.pt, hp = hero.position;
  if (tech.phase === 'gather'){
    const n = enemies.filter(e => e.alive).length; tech.n = n;
    tech.R = Math.max(0.3, Math.min(3.4, 1.2 + n * 0.18) * bigMul() * Math.min(1, P / tech.gdur));
    genkiBall.visible = true; genkiBall.position.set(hp.x, 3.3 + tech.R * 0.45, hp.z); genkiBall.scale.setScalar(tech.R); genkiBall.rotation.y += dt;
    lightFlash(hp.x, 5, hp.z, 0xbfe6ff, 1.6, 12);
    for (let i = 0; i < 3; i++){ const a = rnd() * TAU; spawnFx(hp.x + Math.cos(a) * 9, 1 + rnd() * 6, hp.z + Math.sin(a) * 9, -Math.cos(a) * 9, 3, -Math.sin(a) * 9, 0xbfe6ff, 0.06, 0.9, 0, 0); }
    if (P >= tech.gdur){ if (tech.set.has('kame')){ tech.fromBall = true; toKame(0.45); } else { tech.phase = 'throw'; tech.pt = 0; tech.inv = true; tech.balls = genkiTargets(); play('fireball'); } }
  } else if (tech.phase === 'charge'){
    const words = ['KA…', 'ME…', 'HA…', 'ME…'], wi = Math.floor(P / (tech.cdur / 4));
    if (wi < 4 && wi !== tech.wi){ tech.wi = wi; tB.set(hp.x, hp.y + 2.9 * hero.scale.y, hp.z); spawnNumber(tB, words[wi], 'react', '#8ff6ff'); play('tier'); }
    const fx = Math.sin(tech.dir), fz = Math.cos(tech.dir);
    tA.set(hp.x - fx * 0.35 + fz * 0.45, 1.0, hp.z - fz * 0.35 - fx * 0.45);
    if (tech.fromBall){ genkiBall.position.lerp(tA, 1 - Math.exp(-dt * 8)); genkiBall.scale.setScalar(Math.max(0.4, genkiBall.scale.x * (1 - dt * 2))); }
    else { kameOrb.visible = true; kameOrb.position.copy(tA); kameOrb.scale.setScalar(0.4 + P / tech.cdur * 1.1); kameOrb.rotation.y += dt * 8; }
    lightFlash(tA.x, 1, tA.z, 0x8ff6ff, 1 + P, 4);
    if (P >= tech.cdur){ tech.phase = 'beam'; tech.pt = 0; tech.inv = true; bigShout(tech.fromBall ? '¡GENKI-HAME-JAAAA!' : '¡JAAAAA!'); play('beam'); flash('#bff6ff', 0.6); shake = 0.5;
      kameOrb.visible = false; genkiBall.visible = false;
      tech.width = (tech.fromBall ? 1 + tech.R * 0.55 : 1) * bigMul(); tech.dmgMul = tech.fromBall ? 1.6 + tech.n * 0.06 : 1;
      if (lvl('mirror')) discover('beam_mirror', 'Rayo múltiple', 'Espejo + Kame-hame-ja: rayos en abanico.');
      if (lvl('clones')) discover('beam_clones', 'Clones Kame-hame-ja', 'Clones de sombra + Kame-hame-ja: ellos también disparan.');
      if (lvl('giant')) discover('beam_giant', 'Rayo colosal', 'Seta gigante + Kame-hame-ja.'); }
  } else if (tech.phase === 'beam'){
    const dur = 1.1;
    if (lvl('homing')){ const t = nearestEnemy(14); if (t) tech.dir = lerpAngle(tech.dir, angTo(hp.x, hp.z, t.g.position.x, t.g.position.z), 1 - Math.exp(-dt * 1.8)); discover('beam_homing', 'Rayo curvo', 'Teledirigido + Kame-hame-ja: el rayo persigue.'); }
    hero.rotation.y = heading = tech.dir;
    const beams = techBeams(), w = Math.min(1, P * 6) * Math.min(1, (dur - P) * 4), pul = 1 + Math.sin(tech.t * 40) * 0.08, W = tech.width;
    beams.forEach(([ox, oz, off], i) => { const b = beamAt(i), a = tech.dir + off, fx = Math.sin(a), fz = Math.cos(a);
      b.g.visible = true; b.g.position.set(ox + fx * 0.6, 1.05, oz + fz * 0.6); b.g.rotation.y = a;
      b.c.scale.set(0.45 * pul * w * W, 0.45 * pul * w * W, 16); b.o.scale.set(0.95 * pul * w * W, 0.95 * pul * w * W, 16);
      if (i < 3) lightFlash(ox + fx * 4, 1.2, oz + fz * 4, 0x8ff6ff, 2.2, 12);
      if (rnd() < 0.8){ const d = rnd() * 16; spawnFx(ox + fx * d, 1 + (rnd() - 0.5) * W, oz + fz * d, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2, rnd() < 0.5 ? 0xffffff : 0x8ff6ff, 0.08, 0.3, 0, 1); } });
    for (let i = beams.length; i < beamPool.length; i++) beamPool[i].g.visible = false;
    shake = Math.max(shake, 0.2);
    tech.tick = (tech.tick || 0) - dt;
    if (tech.tick <= 0){ tech.tick = 0.1;
      for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
        for (const [ox, oz, off] of beams){ const a = tech.dir + off, fx = Math.sin(a), fz = Math.cos(a), ex = e.g.position.x - ox, ez = e.g.position.z - oz;
          const along = ex * fx + ez * fz, side = Math.abs(ex * fz - ez * fx);
          if (along > -0.5 && along < 16 && side < 1.1 * W + e.r){ hitEnemy(e, Math.round(rdmg(30) * tech.dmgMul * (off ? 0.7 : 1)), rnd() < up.crit, fx, fz, 2.5, 0, false, { src: 'beam' }); break; } } } }
    if (P >= dur) endTech();
  } else if (tech.phase === 'throw'){
    const k = Math.min(1, P / 0.6);
    for (const b of tech.balls){ if (lvl('homing') && b.tgt && b.tgt.alive) b.to.set(b.tgt.g.position.x, 0, b.tgt.g.position.z); b.m.position.lerpVectors(b.from, b.to, k * k); }
    if (k >= 1){ for (const b of tech.balls){ explode(b.to.x, b.to.z, 4.6 * b.s, 0xbfe6ff, (110 + 15 * tech.n) * b.s, { sfx: 'specialBoom', kind: 'nova', knock: 8 }); if (b.m !== genkiBall) scene.remove(b.m); }
      flash('#eaf6ff', 0.7); shake = 0.6; endTech(); }
  }
}
function applyTechPose(){
  if (!tech || state !== 'tech') return;
  const ph = tech.phase;
  if (ph === 'charge' || ph === 'beam'){ const fire = ph === 'beam';
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){
      if (!fire){ bl(A.sh.rotation, 'x', 0.7, 1); bl(A.sh.rotation, 'z', 0.35 * s, 1); bl(A.el.rotation, 'x', -1.3, 1); }
      else { bl(A.sh.rotation, 'x', -1.55, 1); bl(A.sh.rotation, 'z', -0.12 * s, 1); bl(A.el.rotation, 'x', -0.05, 1); }
      bl(A.sh.rotation, 'y', 0, 1); }
    bl(P.spine.rotation, 'y', fire ? 0 : 0.7, 1); bl(P.spine.rotation, 'x', fire ? 0.25 : -0.1, 1);
    P.legL.hip.rotation.x = -0.5; P.legR.hip.rotation.x = 0.5; P.legL.knee.rotation.x = 0.5; P.legR.knee.rotation.x = 0.4;
  } else if (ph === 'gather' || ph === 'throw'){
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', 2.7 * s, 1); bl(A.sh.rotation, 'x', -0.2, 1); bl(A.el.rotation, 'x', -0.1, 1); bl(A.sh.rotation, 'y', 0, 1); }
    bl(P.neck.rotation, 'x', -0.5, 1);
  }
}
// daño acumulado durante el tiempo detenido
function tsApply(){
  document.body.classList.remove('timestop');
  let total = 0;
  for (const e of enemies){ if (!e.tsDmg || !e.alive) { e.tsDmg = 0; continue; } const v = e.tsDmg; e.tsDmg = 0; total += v; hitEnemy(e, v, true, e.tsNx || 0, e.tsNz || 0, 6, 0, false, { src: 'aoe' }); }
  bigShout('Y el tiempo vuelve a correr'); play('specialBoom'); flash('#ffffff', 0.4);
  if (total >= 1000) unlock('zawarudo');
}

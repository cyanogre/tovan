'use strict';
/* ---------- Pasivas y ganchos de las armas ---------- */
const _onStaffHitsW = onStaffHits;
onStaffHits = function(list, mv){
  _onStaffHitsW(list, mv);
  if (!list.length) return;
  const w = curW();
  if (mv.clang) play('clang');
  if (mv.strum) play('strum');
  if (mv.fanHit) play('whoosh');
  if (mv.squeaky) play('squeak');
  for (const e of list){ if (!e.alive) continue;
    if (w === 'paella' && rnd() < 0.2) applyStatus(e, 'fire', 1);
    if (w === 'hammer' && rnd() < 0.25) stunE(e, 0.8);
    if (w === 'baguette' && lvl('bgA') && rnd() < 0.2) stunE(e, 0.9);
    if (w === 'fan' && lvl('fnB')) applyStatus(e, 'poison', 1);
    if (mv === MV.bonkC && lvl('ckA')){ const m = mesh(new THREE.IcosahedronGeometry(0.16, 1), makeMat(0xfff4e0), e.g.position.x, 0.2, e.g.position.z); m.scale.set(1, 1.3, 1); eggs.push({ m, t: 1 }); }
  }
  if (w === 'guitar' && (cosHits % 6 === 0)){ const src = list.find(e => e.alive) || list[0], t = nearestExcept(src.g.position.x, src.g.position.z, 5, src);
    if (t){ bolt(src.g.position.x, 1.4, src.g.position.z, t.g.position.x, 1.2, t.g.position.z, 0xff8ad8, 0.05); hitEnemy(t, rdmg(14), false, 0, 0, 2, 1, false, { src: 'bolt' });
      tB.set(t.g.position.x, t.numY + 0.3, t.g.position.z); spawnNumber(tB, '♪', 'react', '#ff8ad8'); } }
  if (w === 'hammer' && lvl('hmA') && cosHits % 3 === 0){ const x = hero.position.x, z = hero.position.z;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue; if (Math.hypot(e.g.position.x - x, e.g.position.z - z) - e.r < 2.3) stunE(e, 0.8); }
    for (let i = 0; i < 10; i++){ const a = i / 10 * TAU; spawnFx(x + Math.cos(a) * 0.6, 1.4, z + Math.sin(a) * 0.6, Math.cos(a) * 3, 1, Math.sin(a) * 3, 0xffe066, 0.09, 0.6, 2, 0); } play('pipi'); }
  if (w === 'churro' && lvl('chB') && cosHits % 5 === 0) firePlayerShot(hero.position.x, hero.position.z, hero.rotation.y, 12, 0.7, rdmg(16));
  if (w === 'katana' && lvl('ktB') && perfectMove && mv === perfectMove) lightWave(hero.position.x, hero.position.z, hero.rotation.y, 1, 0xd8d8ff, 36);
};
function lightWave(hx, hz, ang, lv, col = 0xbff6ff, base = 62){
  const fX = Math.sin(ang), fZ = Math.cos(ang);
  const g = new THREE.Group(); scene.add(g); g.position.set(hx + fX * 0.8, 0.05, hz + fZ * 0.8); g.rotation.y = ang;
  const m = mesh(moonGeo, makeMat(col, { emissive: 1, opacity: 0.85, side: THREE.DoubleSide }), 0, 0.85, 0, g); m.rotation.x = -Math.PI / 2;
  const a1 = mesh(archGeo, makeMat(col, { emissive: 1, opacity: 0.85, side: THREE.DoubleSide }), 0, 0, 0, g); a1.rotation.x = -0.3;
  g.scale.setScalar(lv === 2 ? 1.5 : 1.05);
  waves.push({ g, vx: fX * 14, vz: fZ * 14, life: lv === 2 ? 0.7 : 0.5, w: lv === 2 ? 1.4 : 1, hit: new Set(), lv, kind: 'light', base });
}
function breadLine(ang, L, lv){
  const hx = hero.position.x, hz = hero.position.z, fX = Math.sin(ang), fZ = Math.cos(ang);
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
    const ex = e.g.position.x - hx, ez = e.g.position.z - hz, along = ex * fX + ez * fZ, side = Math.abs(ex * fZ - ez * fX);
    if (along > -0.5 && along < L + e.r && side < 0.95 + e.r) chHit(e, 78, lv, fX, fZ, 6, { slam: true }); }
  for (let d = 0.6; d < L; d += 0.35){ const x = hx + fX * d, z = hz + fZ * d; spawnFx(x + (rnd() - 0.5) * 0.8, 0.15, z + (rnd() - 0.5) * 0.8, (rnd() - 0.5) * 2, 2 + rnd() * 3, (rnd() - 0.5) * 2, rnd() < 0.5 ? 0xd49a4a : 0xf0c880, 0.09, 0.7, 10, 0); }
  ringFx(hx + fX * L, hz + fZ * L, 0xffc070, 0.3, 1.8, 0.35);
}
const _chargedFire5 = chargedFire;
chargedFire = function(mv, i){
  const s = chargeShot || { w: 'staff', lv: 1 }, lv = s.lv, f = hero.rotation.y, hx = hero.position.x, hz = hero.position.z, n0 = rangs.length;
  _chargedFire5(mv, i);
  if (s.w === 'staff' && lvl('stA')) for (const o of [-0.38, 0.38]) lightWave(hx, hz, f + o, lv);
  if (s.w === 'baguette' && lvl('bgB')) for (const o of [-Math.PI / 2, Math.PI / 2]) breadLine(f + o, lv === 2 ? 5.2 : 4, lv);
  if (s.w === 'churro' && lvl('chA')) chocoPuddle(hx, hz, lv === 2 ? 3 : 2.4);
  if (s.w === 'chancla' && lvl('clA') && rangs.length > n0) twinChancla(rangs[rangs.length - 1]);
  if (s.w === 'chicken' && lvl('ckB')) for (let k = 0; k < 3; k++){ const g = new THREE.Group(); scene.add(g); const a = f + (k - 1) * 0.6;
    g.position.set(hx + Math.sin(a) * 0.8, 0, hz + Math.cos(a) * 0.8); const b = WEAPONS.chicken.clone(); b.visible = true; b.rotation.x = -Math.PI / 2; b.position.y = 0.3; b.scale.setScalar(0.6); g.add(b);
    chicks.push({ g, t: 3, tgt: null }); }
  if (s.w === 'katana' && lvl('ktA')){ const D = lv === 2 ? 6 : 4.5, fX = Math.sin(f), fZ = Math.cos(f);
    const m = mesh(B(0.12, 0.04, D), makeMat(0xffffff, { emissive: 1, opacity: 0.9 }), hx + fX * D / 2, 0.08, hz + fZ * D / 2); m.rotation.y = f;
    rifts.push({ m, x0: hx, z0: hz, fx: fX, fz: fZ, L: D, t: 1.5, tick: 0.3 }); }
};
function chocoPuddle(x, z, r){
  const m = mesh(circleGeo, makeMat(0x5a2a10, { emissive: 0.2, opacity: 0.8 }), x, 0.05, z); m.scale.setScalar(r);
  puddles5.push({ m, x, z, r, t: 3, tick: 0, op: 0.8, fn: e => { hitEnemy(e, rdmg(6), false, 0, 0, 0, 1, false, { src: 'aoe', el: 'fire', power: 0.6 }); if (e.alive) applyStatus(e, 'ice', 0.4); } });
}
function twinChancla(r){
  if (!r) return;
  const holder = new THREE.Group(); scene.add(holder); holder.position.copy(r.g.position);
  const inner = WEAPONS.chancla.clone(); inner.visible = true; inner.rotation.x = Math.PI / 2; holder.add(inner); holder.scale.copy(r.g.scale);
  r.dir -= 0.3; rangs.push(Object.assign({}, r, { g: holder, dir: r.dir + 0.6, hitA: new Set(), hitB: new Set() }));
}
const _throwChancla5 = throwChancla;
throwChancla = function(lv){ const n0 = rangs.length; _throwChancla5(lv); if (lvl('clA') && rangs.length > n0) twinChancla(rangs[rangs.length - 1]); };
const _onSlam5 = onSlam;
onSlam = function(cx, cz, range){
  _onSlam5(cx, cz, range);
  if (curW() === 'staff' && lvl('stB')){ const m = mesh(circleGeo, makeMat(0xfff0b0, { emissive: 1, opacity: 0.4 }), cx, 0.06, cz); m.scale.setScalar(range * 0.9);
    puddles5.push({ m, x: cx, z: cz, r: range * 0.9, t: 3, tick: 0, op: 0.4, fn: e => { hitEnemy(e, rdmg(8), false, 0, 0, 0, 1, false, { src: 'aoe', el: 'fire', power: 0.5 }); if (e.alive) applyStatus(e, 'ice', 0.3); } }); }
};
const _blockFront5 = blockFront;
blockFront = function(R, cone, col, all){
  if (!(curW() === 'umbrella' && lvl('umA2'))) return _blockFront5(R, cone, col, all);
  const fX = Math.sin(hero.rotation.y), fZ = Math.cos(hero.rotation.y);
  for (const p of projectiles){ if (p.owner !== 'enemy') continue;
    const dx = p.m.position.x - hero.position.x, dz = p.m.position.z - hero.position.z, d = Math.max(0.001, Math.hypot(dx, dz));
    if (d < R && (dx * fX + dz * fZ) / d > cone){ const t = nearestEnemyFrom(p.m.position.x, p.m.position.z), a = t ? angTo(p.m.position.x, p.m.position.z, t.g.position.x, t.g.position.z) : Math.atan2(dx, dz);
      p.owner = 'player'; p.m.material = orbMatP; p.vx = Math.sin(a) * 9; p.vz = Math.cos(a) * 9; p.life = 2.5; p.pdmg = rdmg(22); sparks(p.m.position.x, 1, p.m.position.z, 6, col); play('block'); if (!all) break; } }
};
const _diveHoldW = diveHold;
diveHold = function(mv){
  const was = hitDone, boosted = diveMul > 1.2 && curW() === 'umbrella';
  _diveHoldW(mv);
  if (!was && hitDone && boosted && lvl('umB2')){ const x = hero.position.x, z = hero.position.z;
    for (let k = 0; k < 4; k++) later(0.08 + k * 0.1, () => { const a = k / 4 * TAU + 0.4, px_ = x + Math.cos(a) * 2.4, pz_ = z + Math.sin(a) * 2.4;
      bolt(px_, 9, pz_, px_, 0.1, pz_, 0xfff27a, 0.12); play('zap'); explode(px_, pz_, 1.7, 0xffe070, 34, { el: 'shock', kind: 'overload', knock: 3 }); }); }
};
// movilidad y empuje de las armas nuevas
const _rollMul5 = rollMul;
rollMul = function(){ const w = curW(); return w === 'fan' ? 1.18 : w === 'yoyo' ? 1.08 : w === 'hammer' ? 0.9 : w === 'paella' ? 0.95 : _rollMul5(); };
const _cosSpd5 = cosSpd;
cosSpd = function(){ const w = meta.cos.weapon; return _cosSpd5() * (w === 'fan' ? 1.07 : w === 'yoyo' ? 1.04 : w === 'hammer' ? 0.94 : w === 'paella' ? 0.97 : 1); };
const _knockMul5 = knockMul;
knockMul = function(){ const w = meta.cos.weapon; return _knockMul5() * (w === 'fan' ? 1.3 : w === 'hammer' ? 1.15 : 1); };
// el yoyó se estira al atacar; el abanico se abre; el martillo salta
function weaponTick5(pdt){
  const w = curW(), Y = WEAPONS.yoyo.userData;
  if (w === 'yoyo' && Y.disc){ let ext = 0;
    if (state === 'attack' && curMove && curMove.yoyo){ const t = stepT / curMove.dur; ext = curMove.yoyo === 'world' ? 2.2 * Math.sin(Math.min(1, t) * Math.PI) : 2.6 * Math.max(0, Math.sin(clamp((t - 0.25) / 0.55, 0, 1) * Math.PI)); }
    Y.disc.position.y = 0.42 + ext; Y.disc.rotation.z += pdt * 30; Y.str.scale.y = Math.max(0.05, Y.disc.position.y); Y.str.position.y = Y.disc.position.y / 2; }
  if (w === 'fan' && state === 'attack' && curMove && (curMove.fanHit || curMove === MV.fanC)) blockFront(1.8, 0.2, 0xff8aa8, true);
  if (gameState === 'play' && grounded){ const hop = state === 'attack' && curMove && curMove.hop;
    if (hop){ const t = stepT / curMove.dur; hero.position.y = t > 0.3 && t < 0.55 ? Math.sin((t - 0.3) / 0.25 * Math.PI) * 0.9 : 0; }
    else if (hero.position.y > 0 && hero.position.y < 1) hero.position.y = 0; }
}
function clearW5(){
  for (const d of discs) scene.remove(d.g); discs.length = 0; for (const r of rollers){ scene.remove(r.m); scene.remove(r.line); } rollers.length = 0;
  for (const T of tornados){ scene.remove(T.g || T.m); } tornados.length = 0; cracks.length = 0;
  for (const f of riceFire) scene.remove(f.m); riceFire.length = 0; for (const p of puddles5) scene.remove(p.m); puddles5.length = 0;
  for (const c of chicks) scene.remove(c.g); chicks.length = 0; for (const g of eggs) scene.remove(g.m); eggs.length = 0; for (const r of rifts) scene.remove(r.m); rifts.length = 0;
  if (WEAPONS.paella) WEAPONS.paella.visible = meta.cos.weapon === 'paella'; if (WEAPONS.yoyo) WEAPONS.yoyo.userData.disc.visible = true;
}
const _clearWorldW = clearWorld;
clearWorld = function(){ _clearWorldW(); clearW5(); };
const _v3UpdateW = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateW(dt, pdt, playing); try { if (pdt > 0) updateNewWeapons(pdt); weaponTick5(pdt); } catch (err) { console.error(err); } };

/* ---------- Poderes de arma (se desbloquean usándola) ---------- */
const WPOW = [
  ['staff', 'stA', 'rara', '🔦', 'Linterna de bolsillo', 'El haz de linterna cargado se abre en tres.'],
  ['staff', 'stB', 'epica', '🗼', 'Faro', 'El golpe de suelo del combo deja 3 s una zona de luz que quema y ralentiza.'],
  ['baguette', 'bgA', 'rara', '🥖', 'Pan duro', 'Los golpes de baguette tienen un 20 % de aturdir. Es de ayer.'],
  ['baguette', 'bgB', 'epica', '✝️', 'Barra doble', 'El barrazo cargado sale también hacia los lados, en cruz.'],
  ['umbrella', 'umA2', 'rara', '☂️', 'Paraguas reforzado', 'Los proyectiles que paras con el paraguas salen rebotados hacia los enemigos.'],
  ['umbrella', 'umB2', 'epica', '🌩️', 'Tormenta de verano', 'El picado del paraguas cargado llama a cuatro rayos a tu alrededor.'],
  ['churro', 'chA', 'rara', '🍫', 'Chocolate caliente', 'El remolino cargado deja un charco de chocolate que quema y ralentiza.'],
  ['churro', 'chB', 'epica', '🥨', 'Azúcar glas', 'Cada quinto golpe lanza un churrito que sale disparado.'],
  ['chancla', 'clA', 'rara', '🩴', 'Par de chanclas', 'Lanzas dos chanclas a la vez, en V.'],
  ['chancla', 'clB', 'epica', '🎯', 'La chancla de la madre', 'La chancla persigue a los enemigos con muchísima más puntería y llega un 40 % más lejos.'],
  ['chicken', 'ckA', 'rara', '🥚', 'Huevo sorpresa', 'El porrazo gigante deja un huevo en cada enemigo. Al segundo, ¡pum!'],
  ['chicken', 'ckB', 'epica', '🐣', 'Gallinero', 'El graznido cargado suelta tres pollos de goma que corren hacia los enemigos y explotan.'],
  ['katana', 'ktA', 'rara', '🌑', 'Corte del vacío', 'El Iaido deja una grieta durante 1,5 s que corta a todo lo que la cruza.'],
  ['katana', 'ktB', 'epica', '🌬️', 'Viento cortante', 'Los cortes perfectos lanzan una media luna de viento.'],
  ['paella', 'paA', 'rara', '🍤', 'Socarrat', 'La paella voladora rebota en tres enemigos más.'],
  ['paella', 'paB', 'epica', '🍚', 'Paella para veinte', 'El volteo llega más lejos y cada enemigo alcanzado te cura 1 PV.'],
  ['guitar', 'gtA', 'rara', '🔊', 'Distorsión', 'Los anillos del solo son un 30 % más grandes y todos aturden.'],
  ['guitar', 'gtB', 'epica', '🤘', 'Otra, otra', 'Al acabar el solo, tres power chords seguidos de propina.'],
  ['yoyo', 'yyA', 'rara', '⚡', 'Yoyó luminoso', 'El paseo del perro deja un rastro eléctrico.'],
  ['yoyo', 'yyB', 'epica', '🌍', 'Doble vuelta al mundo', 'La vuelta al mundo golpea dos veces, la segunda más amplia.'],
  ['fan', 'fnA', 'rara', '💃', '¡Olé!', 'El torbellino dura el doble y arrastra con más fuerza.'],
  ['fan', 'fnB', 'epica', '🗡️', 'Abanico de acero', 'Los abanicazos cortan: envenenan a todo lo que tocan.'],
  ['hammer', 'hmA', 'rara', '⭐', 'Pi-pi-pi', 'Cada tercer golpe suelta estrellitas que aturden a los de alrededor.'],
  ['hammer', 'hmB', 'epica', '⚡', 'Martillo eléctrico', 'Al final de cada grieta del martillazo cae un rayo.']
];
const wName = w => (COS.weapon.find(c => c[0] === w) || [w, w])[1];
for (const [w, id, r, ic, name, desc] of WPOW){
  UPGRADES.push({ id, w, r, ic, name, desc, max: 1, apply: () => {} });
  if (r === 'rara') pwRule(id, () => wkOf(w) >= 80, `Derrota a 80 enemigos con ${wName(w)}.`, () => [wkOf(w), 80]);
  else pwRule(id, () => !!(meta.wb || {})[w], `Derrota a un jefe llevando ${wName(w)}.`);
}

/* ---------- Cómo se consiguen las armas nuevas ---------- */
ACH.splice(ACH.length - 1, 0,
  { id: 'paellaAch', ic: '🥘', name: 'Paella de domingo', desc: 'Prende fuego a 400 enemigos.', prog: () => [st5('burned'), 400], rw: [['weapon', 'paella']] },
  { id: 'guitarAch', ic: '🎸', name: 'Rockstar', desc: 'Derrota a Míster Confianza recibiendo menos de 60 de daño en ese combate.', rw: [['weapon', 'guitar']] },
  { id: 'yoyoAch', ic: '🪀', name: 'El rey del truco', desc: 'Suelta 120 ataques cargados al máximo.', prog: () => [st5('chargeMax'), 120], rw: [['weapon', 'yoyo']] },
  { id: 'fanAch', ic: '🪭', name: '¡Olé!', desc: 'Esquiva 150 golpes rodando.', prog: () => [st5('dodges'), 150], rw: [['weapon', 'fan']] },
  { id: 'hammerAch', ic: '🔨', name: 'Topo aplastado', desc: 'Aturde a 200 enemigos.', prog: () => [st5('stuns'), 200], rw: [['weapon', 'hammer']] });
const WEAPON_ACH = { paellaAch: () => st5('burned') >= 400, yoyoAch: () => st5('chargeMax') >= 120, fanAch: () => st5('dodges') >= 150, hammerAch: () => st5('stuns') >= 200 };
const _hardAchCheckW = hardAchCheck;
hardAchCheck = function(){ _hardAchCheckW(); for (const [id, c] of Object.entries(WEAPON_ACH)) if (!meta.ach[id] && c()) unlock(id); };
TTIPS.push('La paellera voladora rebota de enemigo en enemigo. Y vuelve. Como la abuela.', 'El yoyó pega desde lejísimos: mantén la distancia.',
  'Con el abanico, la ráfaga del tercer golpe apaga los proyectiles.', 'Las cartas de arma solo salen con esa arma equipada. Úsala para desbloquearlas.');

Object.assign(SFX, {
  clang: () => { tone({ type: 'square', f0: 1250, f1: 900, dur: 0.18, vol: 0.07, rv: 0.4 }); tone({ type: 'triangle', f0: 2480, dur: 0.25, vol: 0.05, rv: 0.5 }); noise({ dur: 0.06, vol: 0.18, f0: 4000, q: 2, rv: 0.2 }); },
  strum: () => { [0, 7, 12].forEach((k, i) => tone({ type: 'sawtooth', f0: NOTE(52 + k), dur: 0.22, vol: 0.05, when: i * 0.012, rv: 0.25 })); },
  chord: () => { [0, 7, 12, 19].forEach((k, i) => tone({ type: 'sawtooth', f0: NOTE(45 + k), f1: NOTE(45 + k) * 0.99, dur: 0.6, vol: 0.06, when: i * 0.01, rv: 0.4 })); noise({ dur: 0.3, vol: 0.12, f0: 900, q: 0.8, rv: 0.3 }); },
  chordSolo: () => { const b = 64 + [0, 3, 5, 7, 10, 12][Math.floor(rnd() * 6)]; tone({ type: 'sawtooth', f0: NOTE(b), f1: NOTE(b + 2), dur: 0.22, vol: 0.07, rv: 0.45 }); tone({ type: 'square', f0: NOTE(b - 12), dur: 0.2, vol: 0.04, rv: 0.3 }); },
  yoyo: () => { tone({ type: 'sine', f0: 600, f1: 1300, dur: 0.12, vol: 0.06, rv: 0.2 }); noise({ dur: 0.1, vol: 0.08, f0: 3000, q: 3, rv: 0.1 }); },
  whoosh: () => noise({ dur: 0.3, vol: 0.2, f0: 700, f1: 2600, q: 0.8, rv: 0.3 }),
  pipi: () => { tone({ type: 'square', f0: 1700, f1: 2300, dur: 0.07, vol: 0.05, rv: 0.1 }); tone({ type: 'square', f0: 1700, f1: 2300, dur: 0.07, vol: 0.05, when: 0.09, rv: 0.1 }); }
});

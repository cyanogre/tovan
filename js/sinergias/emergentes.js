'use strict';
/* ======================================================================
   SINERGIAS EMERGENTES (a lo Isaac): todo lo que hace daño hereda tus efectos
   ====================================================================== */
TAGS.veneno = { n: 'Veneno', ic: '🧪', col: '#7dff5a', bonus: 'Tu veneno dura más, se acumula más y hace un 50 % más de daño.' };
TAG_KEYS.push('veneno');
Object.assign(REACT, {
  gas:      { name: '¡Gas inflamable!', color: 0x9aff3a, css: '#c8ff7a', r: 2.5, dmg: 42, sfx: 'boom', el: 'fire' },
  toxfrost: { name: '¡Escarcha tóxica!', color: 0x7affc8, css: '#9affd8', r: 2.2, dmg: 34, sfx: 'shatter', el: 'poison' },
  neuro:    { name: '¡Neurotoxina!', color: 0xd8ff3a, css: '#e8ff7a', r: 2.3, dmg: 30, sfx: 'boom', el: 'poison' }
});
Object.assign(reactHint, { gas: 'Veneno + Fuego', toxfrost: 'Veneno + Hielo', neuro: 'Veneno + Rayo' });
const bigMul = () => 1 + 0.3 * lvl('giant');
function carriedEls(){
  const a = [];
  if (lvl('fireEdge') || lvl('pyre') || lvl('supernova') || lvl('phoenix') || setOn('fuego')) a.push('fire');
  if (lvl('frost') || lvl('glacial') || lvl('shards') || lvl('zero') || setOn('hielo')) a.push('ice');
  if (lvl('storm') || lvl('static') || lvl('thunder') || lvl('tempest') || setOn('rayo')) a.push('shock');
  if (lvl('poison')) a.push('poison');
  return a;
}
const EL_COL = { fire: 0xff8a3a, ice: 0x9fe8ff, shock: 0xffe070, poison: 0x7dff5a };
const CARRY = { aoe: 0.35, bolt: 0.5, beam: 0.22, clone: 0.5, chain: 0.5, orbital: 0.5, truck: 1, other: 0.3 };
const SRC_LABEL = { truck: 'Camión-kun', beam: 'Kame-hame-ja', orbital: 'Orbitales', clone: 'Clones', bolt: 'Disparos', chain: 'Rebote', aoe: 'Explosiones', melee: 'Bastón' };
const EL_LABEL = { fire: 'Fuego', ice: 'Hielo', shock: 'Rayo', poison: 'Veneno' };
const CARRY_SYN = {
  truck:   { fire: 'Camión en llamas', ice: 'Camión frigorífico', shock: 'Camión eléctrico', poison: 'Camión de residuos tóxicos' },
  beam:    { fire: 'Kame-hame-ja flambeado', ice: 'Rayo congelador', shock: 'Rayo de rayos', poison: 'Rayo tóxico' },
  orbital: { fire: 'Anillo de fuego', ice: 'Órbita helada', shock: 'Satélites eléctricos', poison: 'Luna tóxica' },
  clone:   { fire: 'Clones incendiarios', ice: 'Clones de escarcha', shock: 'Clones cargados', poison: 'Clones venenosos' },
  bolt:    { fire: 'Balas trazadoras', ice: 'Balas de hielo', shock: 'Balas tesla', poison: 'Dardos venenosos' },
  chain:   { fire: 'Rebote ardiente', ice: 'Rebote helado', shock: 'Rebote eléctrico', poison: 'Rebote tóxico' },
  aoe:     { fire: 'Explosiones incendiarias', ice: 'Explosiones de escarcha', shock: 'Explosiones eléctricas', poison: 'Explosiones tóxicas' }
};
const CHAIN_SYN = { orbital: 'Órbita en cadena', truck: 'Atropello en cadena', beam: 'Rayo ramificado', clone: 'Clones en cadena', bolt: 'Balas rebotadoras', aoe: 'Onda en cadena' };
const BOOM_SYN = { orbital: 'Orbitales explosivos', truck: 'Camión bomba', beam: 'Rayo detonante', clone: 'Clones kamikaze', bolt: 'Balas explosivas', chain: 'Cadena explosiva' };
let runSyn = new Set();
function discover(key, name, desc){
  if (!meta.syn) meta.syn = {};
  if (runSyn.has(key)) return; runSyn.add(key);
  if (!meta.syn[key]){ meta.syn[key] = [name, desc || '']; saveMeta(); banner(`¡Sinergia descubierta!<small>${name}</small>`, 1.6); play('tier');
    if (Object.keys(meta.syn).length >= 10) unlock('syn10'); if (Object.keys(meta.syn).length >= 25) unlock('syn25'); }
  else { tB.set(hero.position.x, hero.position.y + 3 * hero.scale.y, hero.position.z); spawnNumber(tB, name, 'react', '#c8ff9a'); }
}
function nearestExcept(x, z, r, not){ let best = null, bd = r; for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e === not) continue; const d = Math.hypot(e.g.position.x - x, e.g.position.z - z); if (d < bd){ bd = d; best = e; } } return best; }
function synergyOnHit(e, val, src, o){
  if (src === 'dot' || src === 'poison') return;
  const depth = o.depth || 0, x = e.g.position.x, z = e.g.position.z;
  if (src !== 'melee' && !o.el){
    const els = carriedEls(), ch = CARRY[src] != null ? CARRY[src] : 0.3;
    for (const el of els) if (rnd() < ch){ applyStatus(e, el, 1);
      if (CARRY_SYN[src]) discover(`carry_${src}_${el}`, CARRY_SYN[src][el], `${SRC_LABEL[src]} + ${EL_LABEL[el]}: también aplica ${EL_LABEL[el].toLowerCase()}.`); }
  }
  if (lvl('poison')) applyStatus(e, 'poison', src === 'melee' && lvl('venomBlade') ? 1 + lvl('venomBlade') : 1);
  if (lvl('chain') && depth < 3 && rnd() < 0.14 * lvl('chain') + (setOn('rayo') ? 0.08 : 0)){
    const t = nearestExcept(x, z, 4 * bigMul(), e);
    if (t){ const els = carriedEls(); bolt(x, 1, z, t.g.position.x, 1, t.g.position.z, els.length ? EL_COL[els[0]] : 0xbfe8ff, 0.06);
      later(0.05, () => hitEnemy(t, Math.max(1, Math.round(val * 0.6)), false, 0, 0, 1, 0, false, { src: 'chain', depth: depth + 1 }));
      if (CHAIN_SYN[src]) discover('chain_' + src, CHAIN_SYN[src], `Rebote + ${SRC_LABEL[src]}.`); }
  }
  if (lvl('boom') && src !== 'aoe' && depth < 3 && rnd() < 0.1 * lvl('boom') + (setOn('impacto') ? 0.05 : 0)){
    const els = carriedEls();
    later(0.04, () => explode(x, z, 1.25, els.length ? EL_COL[els[0]] : 0xffa050, 14 + 8 * lvl('boom'), { kind: 'boom', depth: depth + 1, knock: 2 }));
    if (BOOM_SYN[src]) discover('boom_' + src, BOOM_SYN[src], `Munición explosiva + ${SRC_LABEL[src]}.`);
  }
}
function updatePoison(e, dt){
  if (!(e.poisonT > 0)) return;
  e.poisonT -= dt; e.pTick = (e.pTick || 0) - dt;
  if (e.pTick <= 0){ e.pTick = 0.5; hitEnemy(e, Math.max(1, Math.round(rdmg(2.2) * e.poisonS * (setOn('veneno') ? 1.5 : 1) * (1 + 0.6 * S10('poison')))), false, 0, 0, 0, 0, false, { src: 'dot' }); }
  if (rnd() < dt * (3 + e.poisonS)) spawnFx(e.g.position.x + (rnd() - 0.5) * e.r * 1.6, 0.3 + rnd() * e.scale, e.g.position.z + (rnd() - 0.5) * e.r * 1.6, 0, 0.9, 0, rnd() < 0.7 ? 0x7dff5a : 0xc8ff9a, 0.06, 0.6, -0.6, 0);
  if (e.poisonT <= 0) e.poisonS = 0;
}
function onKillSyn(e){
  if (lvl('plague') && e.poisonS > 0){
    const r = 2.8 * bigMul() * (1 + 0.25 * S10('plague')), x = e.g.position.x, z = e.g.position.z; ringFx(x, z, 0x7dff5a, 0.3, r, 0.35);
    for (let i = 0; i < 12; i++){ const a = rnd() * TAU; spawnFx(x, 0.5, z, Math.cos(a) * 3, 1.5, Math.sin(a) * 3, 0x7dff5a, 0.09, 0.6, 3, 1); }
    for (const o of enemies) if (o.alive && o !== e && Math.hypot(o.g.position.x - x, o.g.position.z - z) < r) applyStatus(o, 'poison', Math.ceil(e.poisonS / 2) + lvl('plague'));
    discover('plague', 'Plaga', 'El veneno salta de los caídos a los vivos.');
  }
}

/* ---------- Orbitales ---------- */
const orbitals = [], orbGeoO = new THREE.OctahedronGeometry(0.16, 0);
function updateOrbitals(dt, playing){
  const n = lvl('orbit') ? 2 * lvl('orbit') + 2 * lvl('mirror') : 0;
  if (n && lvl('mirror')) discover('orbit_mirror', 'Constelación', 'Espejo + Orbitales: el doble de satélites.');
  while (orbitals.length < n){ orbitals.push({ m: mesh(orbGeoO, makeMat(0x9ff6ff, { emissive: 1 }), 0, -10, 0), cd: new Map() }); }
  const els = carriedEls(), col = els.length ? EL_COL[els[Math.floor(time * 1.5) % els.length]] : 0x9ff6ff, big = bigMul();
  const show = n && !player.dead && (gameState === 'play' || gameState === 'paused' || gameState === 'upgrade');
  orbitals.forEach((o, i) => {
    o.m.visible = show && i < n; if (!o.m.visible) return;
    const a = time * 2.6 + i / n * TAU, R = 1.35 * big;
    o.m.position.set(hero.position.x + Math.cos(a) * R, hero.position.y + 0.9 + Math.sin(time * 3 + i) * 0.15, hero.position.z + Math.sin(a) * R);
    o.m.scale.setScalar(big); o.m.rotation.y += dt * 5; o.m.material.uniforms.uColor.value.setHex(col);
    if (!playing || timeStopT > 0) return;
    if (o.cd.size > 60) o.cd.clear();
    for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
      const dx = e.g.position.x - o.m.position.x, dz = e.g.position.z - o.m.position.z, d = Math.hypot(dx, dz);
      if (d < e.r + 0.3 * big && (o.cd.get(e) || 0) < time){ o.cd.set(e, time + 0.45);
        hitEnemy(e, rdmg(9), rnd() < up.crit, dx / (d || 1), dz / (d || 1), 1.2, 1, false, { src: 'orbital' }); } }
  });
}

/* ---------- Disparos del jugador (espejo, gigante, teledirigido) ---------- */
function firePlayerShot(x, z, a, speed, life, pdmg){
  const n = 1 + 2 * lvl('mirror'), big = bigMul();
  for (let k = 0; k < n; k++){ const off = k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.2, aa = a + off;
    const m = mesh(orbGeo, orbMatP, x + Math.sin(aa) * 0.6, 1.05, z + Math.cos(aa) * 0.6); m.scale.setScalar(big);
    projectiles.push({ m, vx: Math.sin(aa) * speed, vz: Math.cos(aa) * speed, life, owner: 'player', dmg: 0, pdmg: k ? Math.round(pdmg * 0.7) : pdmg, big }); }
  if (n > 1) discover('shot_mirror', 'Escopeta de luz', 'Espejo + disparos: salen en abanico.');
}
function steerProjectile(p, dt){
  if (p.owner !== 'player' || !lvl('homing')) return;
  const t = nearestExcept(p.m.position.x, p.m.position.z, 7, null); if (!t) return;
  const sp = Math.hypot(p.vx, p.vz), a0 = Math.atan2(p.vx, p.vz), a1 = angTo(p.m.position.x, p.m.position.z, t.g.position.x, t.g.position.z);
  const a = lerpAngle(a0, a1, 1 - Math.exp(-dt * 6)); p.vx = Math.sin(a) * sp; p.vz = Math.cos(a) * sp;
  discover('shot_homing', 'Balas buscadoras', 'Teledirigido + disparos.');
}

/* ---------- Cartas nuevas ---------- */
UPGRADES.push(
  { id: 'chain', r: 'rara', tags: ['rayo'], ic: '🔗', name: 'Rebote', desc: 'Cualquier cosa que haga daño puede rebotar a un enemigo cercano con el 60 %. Los rebotes también rebotan.', max: 3, apply: () => {} },
  { id: 'boom', r: 'rara', tags: ['impacto'], ic: '💣', name: 'Munición explosiva', desc: 'Todo tu daño puede provocar pequeñas explosiones que heredan tus elementos.', max: 3, apply: () => {} },
  { id: 'poison', r: 'rara', tags: ['veneno'], ic: '🧪', name: 'Veneno', desc: 'Todo tu daño envenena. El veneno se acumula y reacciona con el fuego, el hielo y el rayo.', max: 1, apply: () => {} },
  { id: 'venomBlade', r: 'rara', tags: ['veneno'], ic: '🐍', name: 'Colmillo', desc: 'Tus golpes de bastón aplican el doble de veneno.', max: 1, req: () => lvl('poison'), apply: () => {} },
  { id: 'plague', r: 'epica', tags: ['veneno', 'sangre'], ic: '☠️', name: 'Plaga', desc: 'Al morir, los envenenados contagian su veneno a los de alrededor.', max: 1, req: () => lvl('poison'), apply: () => {} },
  { id: 'mirror', r: 'epica', tags: ['cristal'], ic: '🪞', name: 'Espejo', desc: 'Todo lo que disparas se duplica en abanico: disparos, rayos, bolas de energía, orbitales… y camiones.', max: 2, apply: () => {} },
  { id: 'giant', r: 'rara', tags: ['impacto'], ic: '🍄', name: 'Seta gigante', desc: 'Explosiones, rayos, orbitales, disparos y camiones un 30 % más grandes. Tú también creces.', max: 3, apply: () => applyCosmetics(false) },
  { id: 'homing', r: 'rara', tags: ['cristal'], ic: '🧲', name: 'Teledirigido', desc: 'Tus disparos y bolas de energía persiguen enemigos. Los rayos se curvan hacia ellos.', max: 1, apply: () => {} },
  { id: 'echo', r: 'epica', tags: ['otaku'], ic: '🔁', name: 'Eco', desc: 'Cada explosión se repite medio segundo después. Camión-kun vuelve por el otro lado.', max: 1, apply: () => {} },
  { id: 'orbit', r: 'rara', tags: ['cristal'], ic: '🪐', name: 'Orbitales', desc: 'Linternas diminutas giran a tu alrededor y golpean al contacto. Llevan todos tus efectos.', max: 3, apply: () => {} }
);
// las técnicas ya no se sustituyen: se combinan
for (const u of UPGRADES){
  if (u.id === 'kame'){ u.tech = false; u.desc = 'Técnica: tu especial dispara un rayo que arrasa en línea recta. Se combina con las demás técnicas.'; }
  if (u.id === 'world'){ u.tech = false; u.desc = 'Técnica: tu especial detiene el tiempo 4 s y el daño se acumula. Si tienes otras técnicas, las haces con el tiempo parado.'; }
  if (u.id === 'genki'){ u.tech = false; u.desc = 'Técnica: reúnes una bola gigante que crece con los enemigos. Con Kame-hame-ja, la disparas como un rayo.'; }
}
ACH.splice(ACH.length - 1, 0,
  { id: 'syn10', ic: '🧬', name: 'Científico loco', desc: 'Descubre 10 sinergias.', prog: () => [Object.keys(meta.syn || {}).length, 10], rw: [['title', 'Científico loco']] },
  { id: 'syn25', ic: '⚗️', name: 'Esto no debería funcionar', desc: 'Descubre 25 sinergias.', prog: () => [Object.keys(meta.syn || {}).length, 25], rw: [['effect', 'rainbow2']] });
COS.title.push(['Científico loco', 'Científico loco', '🏷️']);
COS.effect.push(['rainbow2', 'Estela de sinergia', '🧬']);
function synCodexHTML(){
  const list = Object.entries(meta.syn || {});
  return `<h3 class="synh">Sinergias descubiertas · ${list.length}</h3>` + (list.length ? `<div class="syncodex">${list.map(([, [n, d]]) => `<div><b>${n}</b><span>${d}</span></div>`).join('')}</div>`
    : '<p class="synnone">Aún ninguna. Combina cosas raras y mira qué pasa.</p>');
}

'use strict';
/* ---------- Estados y reacciones ---------- */
const REACT = {
  thermal:  { name: '¡Choque térmico!', color: 0xfff0e0, css: '#fff1d6', r: 2.3, dmg: 55, sfx: 'steam',   el: null },
  overload: { name: '¡Sobrecarga!',     color: 0xffa030, css: '#ffc15a', r: 2.7, dmg: 50, sfx: 'boom',    el: 'fire' },
  shatter:  { name: '¡Hielo quebrado!', color: 0x9fe8ff, css: '#aef0ff', r: 2.1, dmg: 75, sfx: 'shatter', el: 'ice' }
};
let reactionsRun = 0;
const rdmg = base => Math.max(1, Math.round(base * up.dmg * (1 + 0.12 * (wave - 1)) * (1 + comboBonus()) * otakuMul() * chMul() * (0.9 + rnd() * 0.2)));
function burnDps(e){
  return 5 * e.burnS * up.dmg * (1 + 0.12 * (wave - 1)) * (1 + 0.5 * Math.max(0, lvl('fireEdge') - 1)) * (setOn('fuego') ? 1.5 : 1);
}
function applyStatus(e, el, power = 1){
  if (!e.alive || e.spawnT > 0) return;
  const canReact = e.reactCd <= 0;
  if (el !== 'poison' && canReact && e.poisonT > 0){ e.poisonT = 0; e.poisonS = 0; reaction(el === 'fire' ? 'gas' : el === 'ice' ? 'toxfrost' : 'neuro', e); return; }
  if (el === 'fire'){
    if (canReact && (e.frozenT > 0 || e.chill >= 2)){ e.frozenT = 0; e.chill = 0; reaction('thermal', e); return; }
    if (canReact && e.shockT > 0){ e.shockT = 0; reaction('overload', e); return; }
    if (e.burnT <= 0){ play('ignite'); if (stat('burned') >= 200) unlock('burn200'); }
    e.burnT = 3.2; e.burnS = Math.min(3 + (setOn('fuego') ? 2 : 0), e.burnS + power);
  } else if (el === 'ice'){
    if (canReact && e.burnT > 0){ e.burnT = 0; e.burnS = 0; reaction('thermal', e); return; }
    if (e.frozenT > 0) return;
    e.chill += power; e.chillT = 3.5;
    if (e.chill >= 5) freezeEnemy(e, setOn('hielo') ? 2.6 : 1.6);
  } else if (el === 'shock'){
    if (canReact && e.frozenT > 0){ e.frozenT = 0; reaction('shatter', e); return; }
    if (canReact && e.burnT > 0){ e.burnT = 0; e.burnS = 0; reaction('overload', e); return; }
    e.shockT = setOn('rayo') ? 3.5 : 2.5;
  } else if (el === 'poison'){
    if (canReact && e.burnT > 0){ e.burnT = 0; e.burnS = 0; reaction('gas', e); return; }
    if (canReact && (e.frozenT > 0 || e.chill >= 2)){ e.frozenT = 0; e.chill = 0; reaction('toxfrost', e); return; }
    if (canReact && e.shockT > 0){ e.shockT = 0; reaction('neuro', e); return; }
    e.poisonT = setOn('veneno') ? 5 : 3.5; e.poisonS = Math.min(6 + (setOn('veneno') ? 3 : 0), (e.poisonS || 0) + power);
  }
}
const iceGeo = new THREE.IcosahedronGeometry(1, 0);
const iceMat = makeMat(0xc8f6ff, { emissive: 0.55, opacity: 0.62 });
function freezeEnemy(e, dur){
  if (e.isBoss){ e.chill = 4; e.chillT = 3.5; return; }        // el jefe no se congela: solo se ralentiza al máximo
  e.chill = 0; e.frozenT = dur; e.vx *= 0.2; e.vz *= 0.2;
  if (stat('frozen') >= 100) unlock('freeze100');
  if (!e.ice){ e.ice = mesh(iceGeo, iceMat, 0, 0, 0, e.g); }
  e.ice.visible = true;
  const h = e.type === 'sentinel' ? 1.35 : 0.55 * (e.heavy ? 1.3 : 1);
  e.ice.position.set(0, h, 0); e.ice.scale.set(e.r / e.scale * 1.35, (e.heavy ? 1.1 : 0.75), e.r / e.scale * 1.35); e.ice.rotation.y = rnd() * 3;
  play('freeze');
  for (let i = 0; i < 8; i++){ const a = rnd() * TAU; spawnFx(e.g.position.x + Math.cos(a) * e.r, 0.3 + rnd(), e.g.position.z + Math.sin(a) * e.r, 0, 0.6, 0, 0xc8f6ff, 0.07, 0.5, 0, 0.3); }
}
function reaction(kind, e){
  const R = REACT[kind]; e.reactCd = 0.8; reactionsRun++;
  barkOnce('react', '¡Eso ha sido química! O magia. O química mágica.');
  const x = e.g.position.x, z = e.g.position.z;
  tB.set(x, e.numY + 0.5, z); spawnNumber(tB, R.name, 'react', R.css);
  if (!meta.reacts) meta.reacts = {};
  noteReaction();
  if (!meta.reacts[kind]){ meta.reacts[kind] = true; saveMeta(); if (Object.keys(meta.reacts).length >= 3) unlock('reacts3'); later(0.3, () => { banner(`Reacción descubierta<small>${R.name.replace(/[¡!]/g, '')} · ${reactHint[kind]}</small>`, 2.4); play('discover'); }); }
  const big = setOn('impacto') ? 1.2 : 1;
  later(0.06, () => explode(x, z, R.r * big, R.color, R.dmg * (setOn('fuego') && kind === 'overload' ? 1.3 : 1),
    { el: R.el, power: kind === 'shatter' ? 2 : 1, sfx: R.sfx, kind, exclude: kind === 'thermal' ? null : e }));
}
const reactHint = { thermal: 'Fuego + Hielo', overload: 'Fuego + Rayo', shatter: 'Rayo sobre un enemigo congelado' };
function explode(x, z, r, color, base, o = {}){
  if (!o.echoed){ r *= bigMul();
    if (lvl('echo') && !o.echo){ const oo = Object.assign({}, o, { echo: true, echoed: true, exclude: null }); for (let k = 1; k <= lvl('echo'); k++) later(0.5 * k, () => explode(x, z, r * (0.9 - 0.05 * k), color, base * 0.6, oo)); discover('echo_explode', 'Eco explosivo', 'Eco + explosiones: todo estalla dos veces.'); } }
  ringFx(x, z, color, 0.3, r, 0.38); ringFx(x, z, 0xffffff, 0.2, r * 0.55, 0.26, 0.5);
  const n = Math.round(12 + r * 5);
  for (let i = 0; i < n; i++){
    const a = rnd() * TAU, sp = r * (1.4 + rnd() * 1.6);
    if (o.kind === 'thermal') spawnFx(x + Math.cos(a) * 0.3, 0.3, z + Math.sin(a) * 0.3, Math.cos(a) * sp * 0.6, 1 + rnd() * 2.5, Math.sin(a) * sp * 0.6, rnd() < 0.5 ? 0xffffff : 0xd8dce8, 0.16, 0.9, -1.5, 2.2);
    else if (o.kind === 'shatter') spawnFx(x, 0.6, z, Math.cos(a) * sp, 2 + rnd() * 3, Math.sin(a) * sp, rnd() < 0.5 ? 0x9fe8ff : 0xffffff, 0.09, 0.7, 12, 0);
    else spawnFx(x, 0.4, z, Math.cos(a) * sp, 1.5 + rnd() * 3, Math.sin(a) * sp, rnd() < 0.3 ? 0xffffff : rnd() < 0.5 ? color : 0xff5020, 0.12, 0.55, 5, 1.2);
  }
  if (o.kind === 'overload') for (let i = 0; i < 4; i++){ const a = rnd() * TAU; bolt(x, 0.8, z, x + Math.cos(a) * r, 0.2, z + Math.sin(a) * r, 0xffe070, 0.05); }
  lightFlash(x, 1.2, z, color, 2.2, r * 3.2);
  shake = Math.min(0.6, shake + 0.06 * r); hitStop = Math.max(hitStop, 0.035);
  play(o.sfx || 'boom');
  for (const e of enemies){
    if (!e.alive || e.spawnT > 0 || e === o.exclude) continue;
    const ex = e.g.position.x - x, ez = e.g.position.z - z, d = Math.max(0.001, Math.hypot(ex, ez));
    if (d - e.r > r) continue;
    hitEnemy(e, rdmg(base), false, ex / d, ez / d, o.knock != null ? o.knock : 3, 1, false, { src: 'aoe', el: o.el, power: o.power, depth: o.depth || 0 });
    if (o.el2) applyStatus(e, o.el2, 1);
  }
}

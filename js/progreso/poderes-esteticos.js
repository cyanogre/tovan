'use strict';
/* ======================================================================
   MEJORAS v2: nuevas formas de atacar, cargados por arma, poderes del
   vestidor, billetes de verdad y un santuario más grande
   ====================================================================== */

/* ---------- Santuario ampliado ---------- */
SHRINE.push(
  { id: 'armorS',  name: 'Piel curtida',         desc: '−3 % de daño recibido.', max: 4, cost: l => 120 + l * 140 },
  { id: 'spdS',    name: 'Botas de reparto',     desc: '+4 % de velocidad de movimiento.', max: 3, cost: l => 40 + l * 45 },
  { id: 'critS',   name: 'Ojo de halcón',        desc: '+3 % de probabilidad de crítico.', max: 4, cost: l => 45 + l * 45 },
  { id: 'comboS',  name: 'Ritmo del repartidor', desc: 'El combo aguanta 0,6 s más antes de romperse.', max: 3, cost: l => 40 + l * 40 },
  { id: 'chargeS', name: 'Paciencia del maestro', desc: 'Los ataques cargados cargan un 20 % antes y pegan un 10 % más.', max: 3, cost: l => 50 + l * 55 },
  { id: 'teaS',    name: 'Té de la abuela',      desc: 'Al superar una oleada recuperas un 3 % de PV extra.', max: 3, cost: l => 150 + l * 170 },
  { id: 'bossS',   name: 'Cazajefes',            desc: '+8 % de daño contra jefes.', max: 4, cost: l => 60 + l * 60 },
  { id: 'pickS',   name: 'Bolsillos hondos',     desc: 'Los orbes verdes curan un 15 % más y dan +5 de barra ÍMP.', max: 2, cost: l => 120 + l * 150 },
  { id: 'shieldS', name: 'Lumen escudo',         desc: 'Lumen bloquea el primer golpe que recibes en cada oleada.', max: 1, cost: () => 900 },
  { id: 'kit',     name: 'Kit de bienvenida',    desc: 'Empiezas cada partida eligiendo una mejora.', max: 1, cost: () => 400 }
);

/* ---------- Poderes de los estéticos ---------- */
const COS_POW = {
  hat: { cap: '+8 % de velocidad. Entregas exprés.', cat: 'Siete vidas (bueno, una): el primer golpe mortal de la partida te deja a 1 PV.',
    pot: '−10 % de daño recibido. Lo que protege a la abuela te protege a ti.', crown: '+20 % de fragmentos al acabar la partida.',
    halo: 'Regeneras 1 PV cada 3 s.', duck: 'Doble salto. Los patos vuelan. Más o menos.', cone: 'Golpes de suelo y picados con +35 % de radio. Zona señalizada.',
    tophat: '+8 % de probabilidad de crítico. Con clase.', skull: '+15 % de daño, pero −15 % de PV máximos.', teapot: 'Hora del té: empiezas cada oleada con +20 de barra ÍMP.',
    kitsune: 'Kitsune-bi: al rodar a través de enemigos los quemas con fuego zorruno.', catears: 'Reflejos felinos: atacas un 12 % más rápido.' },
  glasses: { mustache: 'De incógnito: mientras haya un jefe en pie recibes −15 % de daño.', pixel: 'Los críticos hacen ×2,1 en vez de ×1,75.',
    '3d': 'Ves en profundidad: +15 % de alcance con el arma.', heromask: 'La barra ÍMP se carga un 25 % más rápido.' },
  weapon: { staff: 'Cargado: Haz de linterna, una onda de luz que atraviesa enemigos.',
    baguette: 'Cada 15 golpes curas 3 PV. Cargado: Barra de cuarto, un barrazo de pan gigante en línea.',
    umbrella: 'Mientras cargas bloqueas los proyectiles de delante. Cargado: vuelo de paraguas y caída en picado.',
    churro: 'Cada golpe da +1 % de velocidad (hasta +15 %) mientras dure el combo. Cargado: Torbellino azucarado que quema.',
    chancla: '+30 % de empuje. Cargado: la chancla teledirigida, más grande y más lejos.',
    chicken: 'Cada golpe tiene un 15 % de aturdir. Cargado: Graznido sónico en cono que aturde y desvía proyectiles.',
    katana: '+10 % de crítico. Cargado: Iaido, cruzas la línea y el corte llega después.' },
  effect: { rainbow: 'Ánimo arcoíris: la barra ÍMP se carga un 12 % más rápido.', confetti: 'Fiesta: los enemigos tienen un 25 % de estallar en confeti al morir y dañar a los de alrededor.',
    money: 'Los enemigos sueltan billetes. Recógelos: cada uno suma fragmentos al final.', rainbow2: 'Cada 6 golpes aplicas un elemento al azar. Sinergias gratis.',
    confetti2: 'Cada 10 de combo estalla confeti: daña alrededor y te cura 2 PV.' },
  sound: { normal: '', honk: 'Bocinazo: al rodar aturdes a los enemigos cercanos (cada 4 s).', quack: 'Cada 25 golpes explota un patito de goma. ¡CUAC!' },
  body: { bighead: '+12 % de crítico, pero recibes un 10 % más de daño. Blanco fácil.', mini: '+15 % de velocidad, −15 % de PV máximos.',
    gold: '+30 % de fragmentos, pero vas un 6 % más lento. Pesa.', missing: 'Los enemigos no te renderizan bien: 12 % de esquivar cualquier golpe.',
    gold2: 'Platino: +10 % de daño, de velocidad y de defensa.' },
  dance: { wave: 'Buenos modales: al superar una oleada recuperas un 3 % de PV extra.', dance: 'Al superar una oleada, +15 % de daño los primeros 10 s de la siguiente.',
    dab: 'Al superar una oleada, +25 de barra ÍMP.' }
};
const cosPow = (cat, id) => (COS_POW[cat] || {})[id] || '';
var catLife = false, cosHits = 0, churroSt = 0, honkCd = 0, haloT = 0, danceBuffT = 0, danceNext = false, billBonus = 0, billN = 0, duckJump = false;
var lumenShield = false, counterT = 0, kitPending = false, kitAfter = false;
function applyRunPowers(){
  const c = meta.cos;
  if (c.hat === 'cap') up.speed *= 1.08;
  if (c.hat === 'pot') up.armor += 0.1;
  if (c.hat === 'tophat') up.crit += 0.08;
  if (c.hat === 'skull'){ up.dmg *= 1.15; player.maxHp = player.hp = Math.round(player.maxHp * 0.85); }
  if (c.glasses === 'heromask') up.meterRate *= 1.25;
  if (c.effect === 'rainbow') up.meterRate *= 1.12;
  if (c.weapon === 'katana') up.crit += 0.1;
  if (c.body === 'bighead') up.crit += 0.12;
  if (c.body === 'mini'){ up.speed *= 1.15; player.maxHp = player.hp = Math.round(player.maxHp * 0.85); }
  if (c.body === 'gold') up.speed *= 0.94;
  if (c.body === 'gold2'){ up.dmg *= 1.1; up.speed *= 1.1; up.armor += 0.1; }
  up.armor += 0.03 * ml('armorS'); up.speed *= 1 + 0.04 * ml('spdS'); up.crit += 0.03 * ml('critS');
  catLife = c.hat === 'cat'; cosHits = 0; churroSt = 0; honkCd = 0; haloT = 0; danceBuffT = 0; danceNext = false; billBonus = 0; billN = 0; duckJump = false;
  lumenShield = false; counterT = 0; kitPending = ml('kit') > 0; kitAfter = false;
  resetAtk();
}
function cosFragMul(){ const c = meta.cos; return (c.hat === 'crown' ? 1.2 : 1) * (c.body === 'gold' ? 1.3 : 1); }
function cosTakenMul(){ const c = meta.cos; return (c.body === 'bighead' ? 1.1 : 1) * (c.glasses === 'mustache' && bossE && bossE.alive ? 0.85 : 1); }
function cosDmgMul(e, src){ return (e.isBoss ? 1 + 0.08 * ml('bossS') : 1) * (danceBuffT > 0 && src !== 'dot' ? 1.15 : 1); }
function critMul(){ return meta.cos.glasses === 'pixel' ? 2.1 : 1.75; }
function atkSpd(){ return meta.cos.hat === 'catears' ? 1.12 : 1; }
function cosSpd(){ const w = meta.cos.weapon; return (1 + (w === 'churro' ? churroSt * 0.01 : 0)) * (w === 'baguette' ? 0.93 : w === 'churro' ? 1.06 : w === 'katana' ? 1.05 : 1); }
function knockMul(){ return meta.cos.weapon === 'chancla' ? 1.3 : 1; }
function cosRange(mv){ const c = meta.cos;
  return (c.glasses === '3d' ? 1.15 : 1) * (mv.slam && !mv.special && c.hat === 'cone' ? 1.35 : 1); }
function stunE(e, t){
  if (!e.alive || e.isBoss || e.spawnT > 0) return;
  e.state = 'hurt'; e.t = Math.max(e.t || 0, t); if (e.tele) e.tele.visible = false;
  for (let i = 0; i < 5; i++){ const a = i / 5 * TAU; spawnFx(e.g.position.x + Math.cos(a) * 0.35, e.numY * 0.9, e.g.position.z + Math.sin(a) * 0.35, -Math.sin(a) * 1.5, 0.3, Math.cos(a) * 1.5, 0xffe066, 0.07, 0.7, 0, 0); }
}
// antes de recibir daño: escudo de Lumen y esquiva por textura perdida
function cosPreHurt(){
  if (lumenShield){ lumenShield = false; player.inv = 0.6; shieldM.visible = false;
    ringFx(hero.position.x, hero.position.z, 0x9fe8ff, 0.4, 2.2, 0.4); sparks(hero.position.x, 1.2, hero.position.z, 12, 0x9fe8ff); play('block');
    tA.set(hero.position.x, hero.position.y + 2.4, hero.position.z); spawnNumber(tA, '¡Escudo!', 'react', '#9fe8ff'); return 'dodge'; }
  if (meta.cos.body === 'missing' && rnd() < 0.12){ player.inv = 0.35;
    tA.set(hero.position.x, hero.position.y + 2.4, hero.position.z); spawnNumber(tA, 'NULL', 'react', '#ff2ae0'); play('glitch'); return 'dodge'; }
  return null;
}
function catSave(){
  if (!catLife) return false;
  catLife = false; player.hp = 1; player.inv = 2.2; slowT = 1.0;
  banner('¡El gato te ha salvado!<small>A él le quedan seis vidas. A ti, ninguna extra.</small>', 2); flash('#ffe0a0', 0.5); play('revive');
  ringFx(hero.position.x, hero.position.z, 0xffe0a0, 0.3, 3.5, 0.5); return true;
}
// después de cada golpe (va al final de hitEnemy, cuando ya está todo resuelto)
function cosOnHit(e, src, crit){
  if (src !== 'melee') return;
  const c = meta.cos; cosHits++;
  if (c.weapon === 'baguette' && cosHits % 15 === 0){ heal(3); for (let i = 0; i < 6; i++){ const a = rnd() * TAU; spawnFx(hero.position.x, 1.2, hero.position.z, Math.cos(a) * 1.5, 2, Math.sin(a) * 1.5, 0xf0c880, 0.07, 0.6, 7, 0); } }
  if (c.weapon === 'churro') churroSt = Math.min(15, churroSt + 1);
  if (c.weapon === 'chicken' && e.alive && rnd() < 0.15){ stunE(e, 0.9); tA.set(e.g.position.x, e.numY + 0.4, e.g.position.z); spawnNumber(tA, '¡COCOCÓ!', 'react', '#ffe066'); play('quack'); }
  if (c.effect === 'rainbow2' && cosHits % 6 === 0 && e.alive){ const el = ['fire', 'ice', 'shock'][Math.floor(rnd() * 3)];
    later(0.01, () => { if (e.alive) applyStatus(e, el, 1); }); }
  if (c.sound === 'quack' && cosHits % 25 === 0){ const x = e.g.position.x, z = e.g.position.z;
    later(0.05, () => { explode(x, z, 2.2, 0xffd23a, 26, { sfx: 'quackC', kind: 'impact', knock: 4 }); tA.set(x, 2, z); spawnNumber(tA, '¡CUAC!', 'react', '#ffd23a');
      for (let i = 0; i < 10; i++){ const a = rnd() * TAU; spawnFx(x, 0.8, z, Math.cos(a) * 3, 3, Math.sin(a) * 3, 0xffd23a, 0.1, 0.8, 8, 0); } }); }
  if (c.effect === 'confetti2' && combo > 0 && combo % 10 === 0){ const x = hero.position.x, z = hero.position.z;
    later(0.02, () => { heal(2); explode(x, z, 2.6, 0xff6ae0, 20, { sfx: 'tier', kind: 'impact', knock: 3 }); confetti(x, 1.4, z, 24); }); }
}
function cosOnKill(e){
  const c = meta.cos, x = e.g.position.x, z = e.g.position.z;
  if (c.effect === 'money') dropBills(x, z, e.isBoss ? 24 : e.elite || e.heavy ? 6 : 3);
  if (c.effect === 'confetti2') confetti(x, 1.2, z, 22);
  if (c.effect === 'confetti' && !e.isBoss && rnd() < 0.25) later(0.1, () => { confetti(x, 1, z, 16); explode(x, z, 2, 0xff4a6a, 22, { sfx: 'tier', kind: 'impact', knock: 3 }); });
}
function cosWaveClear(){
  const c = meta.cos;
  if (c.dance === 'wave') heal(Math.round(player.maxHp * 0.03));
  if (c.dance === 'dance') danceNext = true;
  if (c.dance === 'dab'){ player.meter = Math.min(100, player.meter + 25); }
  if (ml('teaS')) heal(Math.round(player.maxHp * 0.03 * ml('teaS')));
  for (const b of bills) if (b.st !== 'got') b.st = 'mag';
}
function cosOnRollStart(){
  kitsuneSet.clear();
  if (meta.cos.sound === 'honk' && honkCd <= 0){
    honkCd = 4; play('honkC'); ringFx(hero.position.x, hero.position.z, 0xff4a6a, 0.3, 3.2, 0.35);
    for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;
      if (Math.hypot(e.g.position.x - hero.position.x, e.g.position.z - hero.position.z) - e.r < 3.2){ stunE(e, 0.8); } }
    tA.set(hero.position.x, hero.position.y + 2.6, hero.position.z); spawnNumber(tA, '¡MOC MOC!', 'react', '#ff8aa8');
  }
}

/* ---------- Escudo de Lumen (santuario) ---------- */
const shieldM = mesh(new THREE.SphereGeometry(1, 14, 10), makeMat(0x9fe8ff, { emissive: 1, opacity: 0.18 }), 0, 0.95, 0, hero); shieldM.scale.set(0.95, 1.15, 0.95); shieldM.visible = false;

'use strict';
/* ---------- Más caras en el vestidor ---------- */
glasses('clown', 0.21, 0.255, g => { mesh(new THREE.IcosahedronGeometry(0.065, 1), makeMat(0xff2a2a, { emissive: 0.35 }), 0, 0, 0.02, g); mesh(B(0.02, 0.02, 0.01), Hm.shine, -0.02, 0.03, 0.08, g); });
glasses('monocle', 0.29, 0.24, g => { const r = mesh(new THREE.TorusGeometry(0.07, 0.014, 4, 12), Hm.yellow, 0.1, 0, 0.01, g);
  mesh(new THREE.CircleGeometry(0.06, 10), makeMat(0xcff4ff, { emissive: 0.3, opacity: 0.5 }), 0.1, 0, 0.012, g);
  const ch = mesh(B(0.012, 0.2, 0.012), Hm.yellow, 0.17, -0.11, 0, g); ch.rotation.z = 0.3; });
glasses('ninja', 0.2, 0.235, g => { const navy = makeMat(0x1a2440); mesh(B(0.46, 0.13, 0.04), navy, 0, 0, 0, g);
  mesh(B(0.48, 0.055, 0.035), Hm.red, 0, 0.22, -0.01, g); for (const s of [-1, 1]){ const t = mesh(B(0.04, 0.16, 0.02), Hm.red, 0.06 * s, 0.17, -0.42, g); t.rotation.x = 0.6; t.rotation.z = 0.3 * s; } });
glasses('visor', 0.29, 0.24, g => { mesh(B(0.5, 0.085, 0.045), Hm.black, 0, 0, 0, g); mesh(B(0.43, 0.035, 0.01), makeMat(0xff2a3a, { emissive: 1 }), 0, 0, 0.025, g);
  for (const s of [-1, 1]) mesh(B(0.04, 0.12, 0.08), Hm.metal, 0.25 * s, 0, -0.03, g); });
glasses('blush', 0.215, 0.232, g => { const pk = makeMat(0xff8ab8, { emissive: 0.4 }); for (const s of [-1, 1]){ mesh(B(0.08, 0.035, 0.012), pk, 0.13 * s, 0, 0, g);
  for (let i = 0; i < 3; i++){ const l = mesh(B(0.008, 0.03, 0.006), makeMat(0xff4a8a), 0.13 * s - 0.025 + i * 0.025, 0, 0.008, g); l.rotation.z = 0.5; } } });
COS.glasses.push(['clown', 'Nariz de payaso', '🤡'], ['monocle', 'Monóculo distinguido', '🧐'], ['ninja', 'Pañuelo ninja', '🥷'], ['visor', 'Visor de ciborg', '🤖'], ['blush', 'Mofletes de anime', '😊']);
Object.assign(COS_POW.glasses, {
  clown: 'Payasadas: los enemigos aturdidos reciben un 25 % más de daño.',
  monocle: '+10 % de fragmentos y +5 % de crítico. Muy distinguido.',
  ninja: 'Ruedas un 15 % más lejos y tus impulsos aéreos van más rápido.',
  visor: 'Fijación de objetivo: +12 % de daño con rayos, disparos y orbitales.',
  blush: 'Kawaii: +12 % de velocidad de ataque mientras tengas 10 o más de combo.' });
ACH.splice(ACH.length - 1, 0,
  { id: 'acroTriple', ic: '🤸', name: '¡Ya-hu!', desc: 'Encadena tres saltos seguidos al aterrizar y haz el triple salto.', rw: [['glasses', 'clown']] },
  { id: 'acroFlip', ic: '🔄', name: 'Gimnasia rítmica', desc: 'Haz 10 mortales laterales (cambia de sentido corriendo y salta).', rw: [['glasses', 'ninja']] },
  { id: 'acroLong', ic: '🦘', name: 'Salto de longitud', desc: 'Haz 10 saltos largos (salta en mitad de una voltereta).', rw: [['glasses', 'blush']] },
  { id: 'crits500', ic: '🧐', name: 'Ojo de halcón', desc: 'Consigue 500 golpes críticos en total.', rw: [['glasses', 'monocle']] },
  { id: 'starP2', ic: '🎬', name: '¡Corten!', desc: 'Derrota a Míster Confianza cuando ya no hay guion.', rw: [['glasses', 'visor']] });

/* ---------- Títulos con ventaja ---------- */
const TB12 = {
  'Repartidor novato': ['+5 % de velocidad. Con ganas.', { spd: 1.05 }],
  'Becario': ['+10 % de fragmentos. Cobras en experiencia, pero algo cae.', { frag: 1.1 }],
  'Amigo de los gatos': ['+15 PV máximos. Siete vidas no, pero casi.', { hp: 15 }],
  'Imparable': ['El combo tarda un 25 % más en romperse.', { combo: 1.25 }],
  'Cliente VIP': ['+15 % de fragmentos.', { frag: 1.15 }],
  'Leyenda del reparto': ['+6 % de daño y +4 % de crítico.', { dmg: 1.06, crit: 0.04 }],
  'Ya estabas muerto': ['+10 % de probabilidad de crítico.', { crit: 0.1 }],
  'Conductor de camión': ['+10 % de velocidad.', { spd: 1.1 }],
  'Controlador del tiempo': ['La barra ÍMP se carga un 12 % más rápido.', { meter: 1.12 }],
  'Tarjeta gráfica en llamas': ['+8 % de daño. Huele a quemado.', { dmg: 1.08 }],
  'Número 1 del ranking': ['+5 % de daño, de velocidad y de crítico.', { dmg: 1.05, spd: 1.05, crit: 0.05 }],
  'Adicto al zapping': ['Empiezas cada oleada con +15 de barra ÍMP.', { waveMeter: 15 }],
  'Científico loco': ['Veneno y quemaduras hacen un 15 % más de daño.', { dot: 1.15 }],
  'Repartidor del mes': ['+12 % de fragmentos y +5 % de velocidad.', { frag: 1.12, spd: 1.05 }],
  'Protagonista': ['Energía de protagonista: +20 PV máximos.', { hp: 20 }],
  'Despedido': ['Ya no tienes nada que perder: +12 % de daño, −10 PV máximos.', { dmg: 1.12, hp: -10 }],
  'Guardián oscuro': ['+10 % de daño a los jefes.', { boss: 1.1 }],
  'Déjà vu': ['Empiezas la partida con un relanzamiento de cartas extra.', { reroll: 1 }],
  'Turista': ['+8 % de velocidad. Siempre con prisa por ver el siguiente sitio.', { spd: 1.08 }],
  'Isekai en serie': ['+10 % de velocidad de ataque.', { atk: 1.1 }],
  'Amigo de la lámpara': ['Lumen te cura 1 PV cada 4 s.', { regen: 4 }],
  'NullPointerException': ['Los enemigos no te encuentran: 8 % de esquivar cualquier golpe.', { dodge: 0.08 }],
  'El que firmó': ['Los enemigos (no jefes) con menos del 6 % de vida caen al siguiente golpe.', { execute: 0.06 }],
  'Maestro de la carga': ['+10 % de alcance con el arma.', { range: 1.1 }],
  'Abuela honoraria': ['+20 PV máximos. Come, que estás muy delgado.', { hp: 20 }],
  'Meteorito': ['Tus explosiones son un 12 % más grandes.', { boom: 1.12 }],
  'Samurái de reparto': ['+8 % de crítico y +5 % de velocidad de ataque.', { crit: 0.08, atk: 1.05 }],
  'Panadero de guardia': ['Te curas 1 PV por cada enemigo derrotado.', { killHeal: 1 }],
  'Influencer financiero': ['+20 % de fragmentos.', { frag: 1.2 }]
};
COS_POW.title = {}; for (const [k, v] of Object.entries(TB12)) COS_POW.title[k] = v[0];
const tb12 = () => { const t = TB12[meta.cos.title]; return t ? t[1] : {}; };
const g12 = () => { const g = meta.cos.glasses; return g; };
const _applyRunPowers12 = applyRunPowers;
applyRunPowers = function(){
  _applyRunPowers12(); const b = tb12();
  if (b.spd) up.speed *= b.spd; if (b.dmg) up.dmg *= b.dmg; if (b.crit) up.crit += b.crit; if (b.meter) up.meterRate *= b.meter;
  if (b.hp){ player.maxHp = Math.max(40, player.maxHp + b.hp); player.hp = player.maxHp; }
  if (g12() === 'monocle') up.crit += 0.05;
};
const _cosFragMul12 = cosFragMul; cosFragMul = function(){ const b = tb12(); return _cosFragMul12() * (b.frag || 1) * (g12() === 'monocle' ? 1.1 : 1); };
const _atkSpd12 = atkSpd; atkSpd = function(){ const b = tb12(); return _atkSpd12() * (b.atk || 1) * (g12() === 'blush' && combo >= 10 ? 1.12 : 1); };
const _cosRange12 = cosRange; cosRange = function(mv){ const b = tb12(); return _cosRange12(mv) * (b.range || 1); };
const _rollMul12 = rollMul; rollMul = function(){ return _rollMul12() * (g12() === 'ninja' ? 1.15 : 1); };
const _cosDmgMul12 = cosDmgMul;
cosDmgMul = function(e, src){ let m = _cosDmgMul12(e, src); const b = tb12();
  if (src === 'dot'){ if (b.dot) m *= b.dot; return m; }
  if (b.boss && e.isBoss) m *= b.boss;
  if (g12() === 'clown' && e.state === 'hurt' && !e.isBoss) m *= 1.25;
  if (g12() === 'visor' && (src === 'bolt' || src === 'beam' || src === 'orbital' || src === 'orb' || src === 'shot')) m *= 1.12;
  return m; };
const _explode12 = explode; explode = function(x, z, r, color, base, o = {}){ const b = tb12(); return _explode12(x, z, r * (b.boom && !o.echoed ? b.boom : 1), color, base, o); };
const _addCombo12 = addCombo; addCombo = function(){ _addCombo12(); const b = tb12(); if (b.combo) comboTimer *= b.combo; };
const _hurtPlayer12 = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){ const b = tb12();
  if (b.dodge && gameState === 'play' && player.inv <= 0 && rnd() < b.dodge && !player.dead){ shoutHero7('NULL', '#9fe8ff', 2.8); player.inv = 0.3; return 'dodge'; }
  return _hurtPlayer12(dmg, sx, sz, knock); };
const _hitEnemyT12 = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  const ok = _hitEnemyT12(e, val, crit, nx, nz, knock, meterGain, melee, o); const b = tb12();
  if (ok && b.execute && e.alive && !e.isBoss && (!o || o.src !== 'dot') && e.hp / e.maxHp < b.execute){ tA.set(e.g.position.x, e.numY + 0.5, e.g.position.z); spawnNumber(tA, '¡Firmado!', 'react', '#e0a860'); killEnemy(e); }
  return ok; };
const _killEnemyT12 = killEnemy;
killEnemy = function(e){ const was = e && e.alive; _killEnemyT12(e); const b = tb12();
  if (was && b.killHeal && gameState === 'play') heal(b.killHeal, true);
  if (was && e.p2x) unlock('starP2'); };
const _startWave12 = startWave; startWave = function(n){ _startWave12(n); const b = tb12(); if (b.waveMeter) player.meter = Math.min(100, player.meter + b.waveMeter); };
const _startRun12 = startRun;
startRun = function(){ _startRun12(); const b = tb12(); if (b.reroll) rerolls += b.reroll; Object.assign(AC12, { flipAx: null, chain: 0, landT: 9, lj: false, airDash: false, wasG: true }); P12.regen = 0; };
const P12 = { regen: 0, achT: 0 };

/* ---------- Bucle ---------- */
const _v3Update12 = v3Update;
v3Update = function(dt, pdt, playing){ _v3Update12(dt, pdt, playing);
  try { squash12(pdt);
    if (playing){ acro12(pdt); const b = tb12();
      if (b.regen && !player.dead){ P12.regen += pdt; if (P12.regen >= b.regen){ P12.regen = 0; heal(1, true); } }
      P12.achT -= pdt; if (P12.achT <= 0){ P12.achT = 2; if ((meta.stats.crits || 0) >= 500) unlock('crits500'); } }
  } catch (err) { console.error(err); } };

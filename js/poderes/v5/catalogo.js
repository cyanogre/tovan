'use strict';
/* ======================================================================
   PODERES v5: los poderes se desbloquean poco a poco, solo salen cartas
   que sumen algo, mejoras menores del 1 % cuando ya no queda nada y un
   montón de poderes nuevos (y más tontos)
   ====================================================================== */
const P5 = { rollT: -9, parcelT: 6, parcels: [], mark: null, markM: null, vanT: 10, vans: [], airJ: 0, lastAct: 0, siestaAcc: 0, frostCd: 0, retCd: 0,
  blizT: 9, blizOn: 0, blizTick: 0, trail: [], trailT: 0, trailTick: 0, cshCd: 0, keepCombo: false, ghostT: 0, ghostCd: 0, ghostCrit: false, banT: 4, peels: [],
  lumT: 2, flyers: [], midasCd: 0, candies: [], btCd: 0, swUsed: false, holes: [], waveKills: 0, hits: 0, minor: {}, newRun: [], chkT: 0, starHurt: 0, starFight: false };
const st5 = k => (meta.stats || {})[k] || 0;
const pwStore = () => meta.pw || (meta.pw = {});
const wkOf = w => (meta.wk || {})[w] || 0;

/* ---------- Familia nueva: Reparto ---------- */
TAGS.reparto = { n: 'Reparto', ic: '📦', col: '#e0a860', bonus: 'Cliente satisfecho: cada enemigo derrotado en la oleada da +1 % de daño (hasta +25 %) y ganas un 20 % más de fragmentos.' };
TAG_KEYS.push('reparto');
RAR.menor = ['Mejora menor', '#aab2cc', 0];

/* ---------- Poderes nuevos ---------- */
UPGRADES.push(
  // reparto
  { id: 'express', r: 'comun', tags: ['reparto'], ic: '🛵', name: 'Envío exprés', desc: '+8 % de velocidad. Durante 1,5 s después de rodar pegas un 25 % más.', max: 3, apply: () => { up.speed += 0.08; } },
  { id: 'parcel', r: 'rara', tags: ['reparto', 'impacto'], ic: '📦', name: 'Paquete sorpresa', desc: 'Cada pocos segundos dejas un paquete a tus pies. Explota cuando lo toca un enemigo (o al rato).', max: 3, apply: () => { P5.parcelT = 2; } },
  { id: 'signature', r: 'rara', tags: ['reparto'], ic: '✍️', name: 'Firme aquí', desc: 'Los enemigos (no los jefes) con menos del 12 % de vida caen al siguiente golpe. Nivel 2: 20 %.', max: 2, apply: () => {} },
  { id: 'returns', r: 'rara', tags: ['reparto'], ic: '↩️', name: 'Devolución al remitente', desc: 'Si esquivas un golpe rodando, el atacante recibe un buen golpe y se queda aturdido.', max: 2, apply: () => {} },
  { id: 'tracking', r: 'epica', tags: ['reparto'], ic: '📍', name: 'Seguimiento del envío', desc: 'El enemigo con más vida queda marcado y recibe un 40 % más de daño. Al caer suelta un orbe verde y la marca salta a otro.', max: 1, apply: () => {} },
  { id: 'deliveryGod', r: 'leyenda', tags: ['reparto', 'impacto'], ic: '🚐', name: 'Repartidor del mes', desc: 'Cada 12 s cae del cielo una furgoneta de reparto sobre el enemigo más duro. Firma aquí.', max: 1, req: () => has('reparto', 2), apply: () => { P5.vanT = 3; } },
  // generales
  { id: 'magnet', r: 'comun', ic: '🧲', name: 'Bolsillos con imán', desc: 'Los orbes verdes y los billetes vienen solos desde lejos, y los orbes curan un poco más.', max: 1, apply: () => {} },
  { id: 'cafe', r: 'comun', ic: '☕', name: 'Café de máquina', desc: '+10 % de velocidad de ataque. Sabe a rayos, pero funciona.', max: 3, apply: () => {} },
  { id: 'meterKill', r: 'comun', ic: '🌟', name: 'Hambre de gloria', desc: 'Cada enemigo derrotado carga la barra ÍMP.', max: 2, apply: () => {} },
  { id: 'springs', r: 'comun', ic: '👟', name: 'Zapatillas con muelles', desc: 'Puedes saltar otra vez en el aire. Con el patito, hasta tres saltos.', max: 1, apply: () => {} },
  { id: 'lucky', r: 'comun', ic: '🍀', name: 'Trébol de cuatro hojas', desc: '+6 % de crítico, y cada crítico carga un poco la barra ÍMP.', max: 2, apply: () => { up.crit += 0.06; } },
  { id: 'siesta', r: 'rara', tags: ['sangre'], ic: '😴', name: 'Siesta', desc: 'Si pasas 2 s sin atacar ni recibir daño, recuperas un 1 % de PV por segundo. Nivel 2: 1,8 %.', max: 2, apply: () => {} },
  { id: 'berserk', r: 'rara', tags: ['sangre'], ic: '😡', name: 'Furia ciega', desc: 'Cuanta menos vida te queda, más rápido atacas: hasta un 45 % por debajo del 30 % de PV.', max: 1, apply: () => {} },
  { id: 'thorns', r: 'rara', tags: ['impacto'], ic: '🌵', name: 'Cactus', desc: 'Quien te pega recibe el doble del daño que te hace (el triple en nivel 2), y los de al lado, la mitad.', max: 2, apply: () => {} },
  { id: 'frostArmor', r: 'rara', tags: ['hielo'], ic: '🧥', name: 'Abrigo de escarcha', desc: 'Quien te golpea se queda congelado 1,2 s (como mucho cada 3 s).', max: 1, apply: () => {} },
  { id: 'overcharge', r: 'rara', tags: ['rayo'], ic: '🔋', name: 'Sobrecarga', desc: 'Los ataques cargados al máximo sueltan tres rayos en cadena.', max: 2, apply: () => {} },
  { id: 'dashTrail', r: 'rara', tags: ['rayo'], ic: '💨', name: 'Estela eléctrica', desc: 'Al rodar dejas un rastro eléctrico que dura 2 s y electrocuta a quien lo pise.', max: 2, apply: () => {} },
  { id: 'pogo', r: 'rara', tags: ['impacto'], ic: '🦘', name: 'Pogo', desc: 'El picado pega un 50 % más y, si acierta, te impulsa hacia arriba: encadena picados.', max: 2, apply: () => {} },
  { id: 'bigSpecial', r: 'rara', ic: '💫', name: 'Especial XL', desc: 'Tu especial pega un 40 % más y llega un 30 % más lejos.', max: 2, apply: () => {} },
  { id: 'comboShield', r: 'rara', ic: '🎵', name: 'Ritmo protector', desc: 'Con combo 30 o más, el siguiente golpe que recibes hace la mitad y no rompe el combo (cada 8 s).', max: 1, apply: () => {} },
  { id: 'bananas', r: 'rara', tags: ['otaku'], ic: '🍌', name: 'Pieles de plátano', desc: 'Cada pocos segundos sueltas una piel de plátano. Quien la pisa resbala, se marea y se hace daño.', max: 2, apply: () => { P5.banT = 1.5; } },
  { id: 'lumen', r: 'rara', tags: ['cristal', 'rayo'], ic: '🏮', name: 'Lumen se harta', desc: 'Lumen dispara un haz de luz al enemigo más cercano cada poco tiempo. «Esto no estaba en mi contrato».', max: 3, apply: () => { P5.lumT = 1; barkOnce('lumenGun', '¿Ahora también disparo? Esto no estaba en mi contrato.'); } },
  { id: 'domino', r: 'rara', tags: ['impacto'], ic: '🎳', name: 'Efecto dominó', desc: 'Los enemigos derrotados salen despedidos y golpean a todo lo que pillan por el camino.', max: 2, apply: () => {} },
  { id: 'midas', r: 'rara', ic: '💰', name: 'Toque de Midas', desc: '+25 % de fragmentos, y los críticos a élites y jefes sueltan billetes.', max: 1, apply: () => {} },
  { id: 'pinata', r: 'rara', tags: ['otaku'], ic: '🪅', name: 'Piñata', desc: 'Los críticos a élites y jefes sueltan caramelos que curan y cargan la barra ÍMP.', max: 1, apply: () => {} },
  { id: 'secondWind', r: 'rara', tags: ['sangre'], ic: '🫁', name: 'Respiro', desc: 'La primera vez en cada oleada que bajas del 30 % de PV, te curas un 8 % y eres intocable 2 s.', max: 1, apply: () => {} },
  { id: 'blizzard', r: 'epica', tags: ['hielo'], ic: '🌨️', name: 'Ventisca', desc: 'Cada 9 s se forma una ventisca a tu alrededor durante 3 s: enfría y hace daño a todo lo cercano.', max: 1, req: () => has('hielo'), apply: () => { P5.blizT = 2; } },
  { id: 'meteor', r: 'epica', tags: ['fuego', 'impacto'], ic: '☄️', name: 'Lluvia de meteoritos', desc: 'Al usar el especial caen ocho meteoritos ardientes sobre los enemigos.', max: 1, apply: () => {} },
  { id: 'ghost', r: 'epica', tags: ['otaku'], ic: '👻', name: 'Modo fantasma', desc: 'Al esquivar un golpe te vuelves intocable 1,5 s y tu siguiente golpe es crítico.', max: 1, apply: () => {} },
  { id: 'bulletTime', r: 'epica', ic: '🕶️', name: 'Tiempo bala', desc: 'Cuando un proyectil está a punto de darte, el tiempo se ralentiza un instante (cada 7 s).', max: 1, apply: () => {} },
  { id: 'glassCannon', r: 'epica', tags: ['sangre'], ic: '🍷', name: 'Copa de cristal', desc: '+45 % de daño, pero −25 % de PV máximos. Frágil. Manéjese con cuidado.', max: 1,
    apply: () => { up.dmg += 0.45; player.maxHp = Math.round(player.maxHp * (lvl('glassCannon') > 1 ? 0.88 : 0.75)); player.hp = Math.min(player.hp, player.maxHp); } },
  { id: 'vampOrbs', r: 'epica', tags: ['sangre', 'cristal'], ic: '💉', name: 'Cristales sedientos', desc: 'Cada golpe de tus cristales guardianes y orbitales te cura 1 PV.', max: 1, apply: () => {} },
  { id: 'blackhole', r: 'leyenda', tags: ['cristal', 'impacto'], ic: '🕳️', name: 'Agujero negro', desc: 'Tu especial abre un agujero negro que se traga a todos los enemigos 2,5 s y luego revienta.', max: 1, req: () => has('cristal') && has('impacto', 2), apply: () => {} },
  { id: 'avatar', r: 'leyenda', tags: ['fuego', 'hielo', 'rayo'], ic: '🌀', name: 'Avatar elemental', desc: 'Cada golpe de arma aplica fuego, hielo y rayo a la vez. Reacciones por todas partes.', max: 1, req: () => has('fuego') && has('hielo') && has('rayo'), apply: () => {} }
);
// mejoras menores: solo salen cuando ya no queda nada útil que elegir
const MINORS = [
  ['mDmg', '🗡️', 'daño', () => { up.dmg += 0.01; }], ['mDef', '🛡️', 'defensa', () => { up.armor += 0.01; }], ['mSpd', '👟', 'velocidad', () => { up.speed += 0.01; }],
  ['mCrit', '🎯', 'probabilidad de crítico', () => { up.crit += 0.01; }], ['mHp', '❤️', 'PV máximos', () => { const a = Math.max(1, Math.round(player.maxHp * 0.01)); player.maxHp += a; heal(a, true); }],
  ['mAtk', '⚡', 'velocidad de ataque', () => {}], ['mMeter', '✨', 'carga de la barra ÍMP', () => { up.meterRate += 0.01; }], ['mFrag', '✦', 'fragmentos', () => {}]
].map(([id, ic, what, fn]) => ({ id, r: 'menor', minor: true, ic, name: `+1 % de ${what}`, desc: `Ya lo tienes todo. Esto es lo que queda: un 1 % más de ${what}. Se acumula sin límite.`, max: 9999,
  apply: () => { P5.minor[id] = (P5.minor[id] || 0) + 1; fn(); stat('minor'); } }));
UPGRADES.push(...MINORS);

/* ---------- Cuándo sirve cada carta ---------- */
const SHOOTERS = ['storm', 'static', 'thunder', 'kame', 'genki', 'truck', 'orbit', 'prism', 'lumen'];
const BOOMERS = ['boom', 'pyre', 'supernova', 'after', 'parcel', 'meteor', 'blackhole', 'deliveryGod', 'truck', 'shards', 'plague'];
const anyLv = ids => ids.some(id => lvl(id));
const USEFUL = {
  potion: () => player.hp < player.maxHp * 0.85, crit: () => up.crit < 0.9, lucky: () => up.crit < 0.9, armor: () => up.armor < 0.7, speed: () => up.speed < 1.9,
  reflect: () => BIOMES[curBiome].id !== 'render', mirror: () => anyLv(SHOOTERS), homing: () => anyLv(SHOOTERS), echo: () => anyLv(BOOMERS) || setOn('fuego'),
  giant: () => anyLv(SHOOTERS) || anyLv(BOOMERS), prism: () => up.orbs > 0, tempest: () => up.orbs > 0, vampOrbs: () => up.orbs > 0 || lvl('orbit') > 0,
  glassCannon: () => player.maxHp > 130, express: () => up.speed < 1.9, spin: () => !WSTYLE[curW()] || WSTYLE[curW()].seq.length <= 4
};
for (const u of UPGRADES) if (USEFUL[u.id]) u.useful = USEFUL[u.id];

'use strict';
/* =====================================================================
   v13 · familias nuevas, poderes nuevos, sinergias, culito visible,
   picado y Tormenta de verano arreglados, música del show continua
   ===================================================================== */
var P13 = { spdK: 1, critAdd: 0, acroUntil: 0, hits7: 0, coin: null, waveT0: 0, lastHurt: -99, regT: 0, setRegT: 0, hailT: 3, combT: 4,
  turboT: 0, impT: 0, refundT: 0, refundGot: 0, slotN: 0, dashLeft: 0, dashT: 0, dashSet: null, rolling: false, rollSet: null,
  tsun: null, kneelT: 0, buttT: 0, mega: null, megaUp: false, megaDive: false, megaK: 1, fort: null, airJ0: 0, lastG: true };

/* ---------- Picado: si atacas flotando con el paraguas sale el picado cargado ---------- */
function umbDive13(){
  const lv = umb ? umb.lv : 1; umb = null; diveMul = lv === 2 ? 1.9 : 1.5; diveRMul = lv === 2 ? 1.6 : 1.3;
  const e = nearestEnemy(7); if (e) heading = angTo(hero.position.x, hero.position.z, e.g.position.x, e.g.position.z);
  hero.rotation.y = heading; startMove('dive', 96);
}

/* ---------- Música: si suena la canción del jefe (mp3), el show no la corta ---------- */
const _musOverride13 = musOverride;
musOverride = function(name){ if (curTrack && curTrack.a && !curTrack.a.paused) return; _musOverride13(name); };

/* ---------- Familias nuevas ---------- */
Object.assign(TAGS, {
  acrobacia: { n: 'Acrobacia', ic: '🪽', col: '#7ab8ff', bonus: 'Tus golpes en el aire y tus picados pegan un 40 % más, y tienes un impulso aéreo extra por salto.' },
  fortuna:   { n: 'Fortuna',   ic: '🍀', col: '#e8ff5a', bonus: '+10 % de crítico, los críticos pegan un 20 % más y los enemigos sueltan más cristales verdes.' },
  coraza:    { n: 'Coraza',    ic: '🛡️', col: '#c0c8d8', bonus: 'Recibes un 15 % menos de daño y, si pasas 3 s sin que te den, regeneras 1 PV por segundo.' },
  impetu:    { n: 'Ímpetu',    ic: '🔋', col: '#3ad8c0', bonus: 'La barra ÍMP se llena un 30 % más rápido y, tras tu especial, atacas un 25 % más rápido durante 4 s.' }
});
TAG_KEYS.push('acrobacia', 'fortuna', 'coraza', 'impetu');

// los poderes que no tenían familia ahora tienen una (o dos)
const FAM13 = {
  dmg: ['cristal'], crit: ['fortuna'], hp: ['coraza'], potion: ['coraza'], speed: ['acrobacia'], armor: ['coraza'], meter: ['impetu'],
  perfect: ['acrobacia'], magnet: ['fortuna'], cafe: ['impetu'], meterKill: ['impetu'], springs: ['acrobacia'], lucky: ['fortuna'],
  bigSpecial: ['impetu'], comboShield: ['coraza', 'impetu'], midas: ['fortuna'], bulletTime: ['acrobacia'],
  stA: ['cristal'], stB: ['fuego'], bgA: ['impacto'], bgB: ['impacto'], umA2: ['coraza'], umB2: ['rayo', 'acrobacia'], chA: ['fuego'], chB: ['reparto'],
  clA: ['reparto'], clB: ['reparto', 'fortuna'], ckA: ['impacto'], ckB: ['otaku'], ktA: ['sangre'], ktB: ['acrobacia'], paA: ['reparto'], paB: ['sangre'],
  gtA: ['impacto'], gtB: ['impetu'], yyA: ['rayo'], yyB: ['acrobacia'], fnA: ['acrobacia'], fnB: ['veneno'], hmA: ['otaku'], hmB: ['rayo'], pogo: ['impacto', 'acrobacia']
};
for (const [id, t] of Object.entries(FAM13)){ const u = UPGRADES.find(x => x.id === id); if (u) u.tags = t.slice(); }

/* ---------- Poderes nuevos ---------- */
const NEW13 = [
  // Acrobacia
  { id: 'superheroe13', r: 'rara', tags: ['acrobacia', 'otaku'], ic: '🦸', name: 'Aterrizaje de superhéroe', max: 2, stk: '+0,5 s de aturdimiento y más radio',
    desc: 'Al aterrizar de un picado clavas una rodilla en el suelo: los de alrededor quedan aturdidos 1 s y tú, intocable un instante. Malo para las rodillas; buenísimo para la foto.' },
  { id: 'rebufo13', r: 'rara', tags: ['acrobacia'], ic: '💨', name: 'Rebufo', max: 3, stk: '+50 % de daño',
    desc: 'El impulso aéreo (rodar en el aire) corta a todo lo que atraviesas y termina con una onda.' },
  { id: 'parkour13', r: 'comun', tags: ['acrobacia'], ic: '🧗', name: 'Parkour', max: 2, stk: 'otro impulso aéreo y +15 % de velocidad',
    desc: '+1 impulso aéreo por salto y +15 % de velocidad. Las escaleras son una sugerencia.' },
  { id: 'mortal13', r: 'rara', tags: ['acrobacia', 'fortuna'], ic: '🤸', name: 'Mortal y crítico', max: 2, stk: '+1 s de críticos',
    desc: 'Durante 1,5 s después de un mortal, un triple salto, un salto largo o un impulso aéreo, todos tus golpes son críticos.' },
  { id: 'meteoro13', r: 'epica', tags: ['acrobacia', 'fuego'], ic: '☄️', name: 'Caída meteórica', max: 2, stk: 'cráter más grande y más largo',
    desc: 'Tus picados llegan un 40 % más lejos y dejan un cráter en llamas durante 3 s.' },
  { id: 'saltoElec13', r: 'rara', tags: ['acrobacia', 'rayo'], ic: '🌩️', name: 'Pararrayos', max: 3, stk: 'el rayo salta a un enemigo más',
    desc: 'Cada picado atrae un rayo al enemigo más cercano, que salta en cadena a otros dos. Tú eres el punto más alto del mapa.' },
  { id: 'altura13', r: 'comun', tags: ['acrobacia'], ic: '🪂', name: 'Vértigo', max: 3, stk: '+20 % de altura y +20 % de picado',
    desc: 'Saltas un 20 % más alto y tus picados pegan un 20 % más. Cuanto más alto, más duele: es física, no opinión.' },
  // Fortuna
  { id: 'monedas13', r: 'comun', tags: ['fortuna'], ic: '🪙', name: 'Calderilla', max: 3, stk: '+5 % de probabilidad',
    desc: 'Los críticos tienen un 8 % de probabilidad de soltar un cristal verde que cura.' },
  { id: 'caraCruz13', r: 'rara', tags: ['fortuna'], ic: '🪙', name: 'Cara o cruz', max: 1,
    desc: 'Al empezar cada oleada lanzas una moneda. Cara: +30 % de daño. Cruz: +30 % de velocidad y de fragmentos. Nunca pierdes; solo ganas distinto.' },
  { id: 'tragaperras13', r: 'epica', tags: ['fortuna', 'otaku'], ic: '🎰', name: 'Tragaperras', max: 2, stk: 'sale cada 14 derrotas',
    desc: 'Cada 20 derrotas tiras de la palanca. Tres iguales: premio gordo (onda dorada, curación, barra llena o lluvia de cristal). Dos iguales: algo es algo.' },
  { id: 'siete13', r: 'rara', tags: ['fortuna', 'impacto'], ic: '7️⃣', name: 'Siete de la suerte', max: 2, stk: '+77 % más',
    desc: 'Cada séptimo golpe de arma es un crítico garantizado que pega un 77 % más. Superstición con base estadística.' },
  { id: 'novato13', r: 'comun', tags: ['fortuna'], ic: '🔰', name: 'Suerte del principiante', max: 2, stk: '+4 s',
    desc: 'Durante los primeros 8 s de cada oleada tienes +20 % de probabilidad de crítico.' },
  { id: 'apuesta13', r: 'epica', tags: ['fortuna', 'sangre'], ic: '🎲', name: 'Todo al rojo', max: 1,
    desc: 'Los críticos pegan un 60 % más, pero los golpes que recibes duelen un 20 % más. La banca siempre gana, salvo hoy.' },
  // Coraza
  { id: 'muralla13', r: 'rara', tags: ['coraza', 'impacto'], ic: '🧱', name: 'Muralla', max: 2, stk: 'recibes un 70 % menos',
    desc: 'Mientras cargas un golpe o lanzas tu especial recibes la mitad de daño.' },
  { id: 'tiritas13', r: 'comun', tags: ['coraza', 'sangre'], ic: '🩹', name: 'Tiritas', max: 3, stk: 'regeneras más rápido',
    desc: 'Regeneras 2 PV cada 3 s (y cada vez más rápido si la repites). No arreglan nada, pero ayudan.' },
  { id: 'adrenalina13', r: 'rara', tags: ['coraza'], ic: '💉', name: 'Adrenalina', max: 1,
    desc: 'Con menos del 35 % de vida recibes un 40 % menos de daño y te mueves un 40 % más rápido.' },
  { id: 'chaleco13', r: 'comun', tags: ['coraza', 'reparto'], ic: '🦺', name: 'Chaleco reflectante', max: 2, stk: '+12 % de defensa',
    desc: 'Recibes un 12 % menos de daño y, cuando te golpean, un destello aturde 1 s a los de alrededor. Seguridad laboral bien entendida.' },
  { id: 'escudoCristal13', r: 'rara', tags: ['cristal', 'coraza'], ic: '🔰', name: 'Escudo de cristal', max: 1,
    desc: 'Tus cristales guardianes y orbitales destruyen los proyectiles enemigos que tocan.' },
  // Ímpetu
  { id: 'turbo13', r: 'rara', tags: ['impetu'], ic: '🏎️', name: 'Turbo', max: 2, stk: '+2 s de turbo',
    desc: 'Al usar tu especial, durante 5 s atacas y te mueves un 50 % más rápido.' },
  { id: 'reembolso13', r: 'comun', tags: ['impetu'], ic: '🧾', name: 'Reembolso', max: 2, stk: '+4 % por enemigo',
    desc: 'Tu especial te devuelve un 6 % de barra por cada enemigo que derrota (hasta un 40 %). Guarda el tique.' },
  { id: 'racha13', r: 'comun', tags: ['impetu', 'otaku'], ic: '📈', name: 'Racha', max: 3, stk: '+3 de barra',
    desc: 'Cada 10 de combo ganas +5 de barra ÍMP.' },
  { id: 'concentracion13', r: 'rara', tags: ['impetu', 'cristal'], ic: '🧘', name: 'Concentración', max: 2, stk: '+15 % de daño',
    desc: 'Con la barra ÍMP llena pegas un 25 % más. Guardarse el especial también es una estrategia.' },
  { id: 'urgente13', r: 'rara', tags: ['reparto', 'impetu'], ic: '📮', name: 'Envío urgente', max: 2, stk: '+15 % de daño',
    desc: 'Tus disparos, rayos, orbitales, clones y camiones pegan un 20 % más.' },
  // Otras familias
  { id: 'granizo13', r: 'rara', tags: ['hielo'], ic: '🧊', name: 'Granizo', max: 3, stk: 'cae más a menudo',
    desc: 'Cada 4 s cae un bloque de hielo sobre un enemigo al azar: daño y escarcha. Microclima personal.' },
  { id: 'tsundere13', r: 'rara', tags: ['otaku', 'sangre'], ic: '💢', name: 'Tsundere', max: 1,
    desc: 'El último enemigo que te ha golpeado recibe un 50 % más de daño de ti. No es que te importe. Es que lo tienes apuntado.' },
  { id: 'sed13', r: 'comun', tags: ['sangre'], ic: '🍷', name: 'Sed de sangre', max: 3, stk: '+2 PV por derrota',
    desc: 'Cada enemigo derrotado te cura 2 PV.' },
  { id: 'ruedaToxica13', r: 'comun', tags: ['veneno', 'acrobacia'], ic: '🛞', name: 'Rueda tóxica', max: 2, stk: 'veneno más fuerte',
    desc: 'Al rodar envenenas a todo lo que tocas.' },
  { id: 'toxicologia13', r: 'comun', tags: ['veneno'], ic: '🔬', name: 'Toxicología', max: 2, stk: '+15 % más',
    desc: 'Los enemigos envenenados reciben un 15 % más de daño de todo.' },
  { id: 'combustion13', r: 'rara', tags: ['fuego'], ic: '🕯️', name: 'Combustión espontánea', max: 2, stk: 'cada 4,5 s',
    desc: 'Cada 6 s, el enemigo más cercano empieza a arder sin explicación razonable.' }
];
for (const u of NEW13) UPGRADES.push(Object.assign({ apply: () => {} }, u));
UPGRADES.find(u => u.id === 'chaleco13').apply = () => { up.armor += 0.12; };
try { if (!meta.v13){ meta.v13 = 1; meta.pwNew = meta.pwNew || {}; for (const u of NEW13) meta.pwNew[u.id] = 1; saveMeta(); } } catch (err) {}

/* ---------- Sinergias ---------- */
const SYN13 = [
  ['monzon', 'umB2', 'saltoElec13', 'Monzón', 'La Tormenta de verano suelta 8 rayos y el Pararrayos atrae uno más.'],
  ['tropical', 'umB2', 'storm', 'Tormenta tropical', 'Los rayos de la Tormenta de verano saltan en cadena.'],
  ['thor', 'saltoElec13', 'hmB', 'Thor de mercadillo', 'Con el martillo, cada picado atrae tres rayos.'],
  ['saltamontes', 'saltoElec13', 'pogo', 'Saltamontes eléctrico', 'Cada rebote del pogo electrocuta a los de alrededor.'],
  ['vertigo', 'altura13', 'pogo', 'Vértigo extremo', 'Los rebotes del pogo suben un 30 % más.'],
  ['sismico', 'superheroe13', 'quake', 'Aterrizaje sísmico', 'El aterrizaje de superhéroe abre grietas y hace temblar todo.'],
  ['culazo', 'superheroe13', 'culito', 'Aterrizaje de culo', 'Aterrizas de culo: aturde el doble de lejos y marca a todos 3 s (+25 % de daño).'],
  ['kamikaze', 'rebufo13', 'parkour13', 'Kamikaze', 'El impulso aéreo corta el doble y su onda final es enorme.'],
  ['matrix', 'parkour13', 'perfect', 'Matrix', 'La esquiva perfecta te recarga los impulsos aéreos y alarga la cámara lenta.'],
  ['circo', 'mortal13', 'springs', 'Circo del Sol', 'El doble salto también cuenta como acrobacia: críticos garantizados.'],
  ['piromano', 'meteoro13', 'fire', 'Pirómano', 'Los cráteres de los picados duran el doble y queman más.'],
  ['lluviaLava', 'meteoro13', 'meteor', 'Lluvia de lava', 'Los meteoritos del especial también dejan cráteres en llamas.'],
  ['bancoCentral', 'monedas13', 'midas', 'Banco central', 'La calderilla sale el doble de a menudo.'],
  ['casino', 'tragaperras13', 'lucky', 'Casino', 'La tragaperras sale cada 12 derrotas y siempre da al menos dos iguales.'],
  ['sieteYMedio', 'siete13', 'crit', 'Siete y medio', 'El séptimo golpe pega el triple.'],
  ['novatoSuerte', 'caraCruz13', 'novato13', 'Novato con suerte', 'Si sale cara, la suerte del principiante dura toda la oleada.'],
  ['allIn', 'apuesta13', 'glassCannon', 'All-in', 'Con la Copa de cristal, los críticos pegan el doble.'],
  ['erizo', 'muralla13', 'thorns', 'Erizo', 'Si te pegan mientras cargas, revientas en pinchos a tu alrededor.'],
  ['noMeToques', 'tsundere13', 'thorns', 'No me toques', 'El último que te pegó recibe el doble de daño de ti.'],
  ['banquete', 'sed13', 'life', 'Banquete', 'Cada derrota te cura el triple.'],
  ['botiquin', 'tiritas13', 'hp', 'Botiquín', 'Las tiritas regeneran el doble de rápido.'],
  ['segundaJuventud', 'adrenalina13', 'secondWind', 'Segunda juventud', 'Con poca vida, además, pegas un 25 % más.'],
  ['alLimite', 'adrenalina13', 'berserk', 'Al límite', 'Con poca vida tienes un 25 % más de crítico.'],
  ['atestado', 'chaleco13', 'returns', 'Atestado', 'El destello del chaleco aturde el doble y llega más lejos.'],
  ['espejoBlindado', 'escudoCristal13', 'reflect', 'Espejo blindado', 'Los proyectiles que paran tus cristales vuelven contra quien los lanzó.'],
  ['dobleExpreso', 'turbo13', 'cafe', 'Doble expreso', 'El turbo dura el doble y da un 50 %.'],
  ['propina', 'reembolso13', 'bigSpecial', 'Propina', 'El reembolso no tiene tope.'],
  ['aRitmo', 'racha13', 'comboShield', 'A ritmo', 'La racha da el doble de barra.'],
  ['zen', 'concentracion13', 'meter', 'Zen', 'Con la barra llena también te mueves un 15 % más rápido.'],
  ['mensajeria', 'urgente13', 'orb', 'Mensajería celeste', 'Tus cristales guardianes pegan un 40 % más.'],
  ['portes', 'urgente13', 'truck', 'Portes gratis', 'Camión-kun pega el doble.'],
  ['tormentaGranizo', 'granizo13', 'storm', 'Tormenta de granizo', 'El granizo cae el doble de rápido y electrocuta.'],
  ['metralla', 'granizo13', 'shards', 'Metralla helada', 'Cada granizo revienta en esquirlas que hielan a los de alrededor.'],
  ['neumatico', 'ruedaToxica13', 'fire', 'Neumático quemado', 'Al rodar envenenas y quemas a la vez: ¡gas inflamable!'],
  ['quimica', 'toxicologia13', 'poison', 'Química avanzada', 'Los envenenados reciben un 15 % más todavía.'],
  ['fuegoCruzado', 'combustion13', 'pyre', 'Fuego cruzado', 'La combustión espontánea prende a dos enemigos cada vez.']
];
const SYNM13 = {}; for (const s of SYN13) SYNM13[s[0]] = s;
const syn13 = id => { const s = SYNM13[id]; return !!s && lvl(s[1]) > 0 && lvl(s[2]) > 0; };
const upName13 = id => { const u = UPGRADES.find(x => x.id === id); return u ? u.name : id; };
function synCheck13(){ for (const s of SYN13) if (lvl(s[1]) && lvl(s[2])) discover('s13_' + s[0], s[3], `${upName13(s[1])} + ${upName13(s[2])}: ${s[4]}`); }

/* ---------- Especiales de rama de las familias nuevas ---------- */
const crisGeo13 = new THREE.OctahedronGeometry(0.4, 0), coinGeo13 = new THREE.CylinderGeometry(0.32, 0.32, 0.08, 10);
const coinMat13 = makeMat(0xffd23a, { emissive: 0.8 }), hailMat13 = makeMat(0xdff6ff, { emissive: 0.7 }), craterMat13 = makeMat(0xff5a10, { emissive: 1, opacity: 0.55 });
const bubbleMat13 = makeMat(0xc8d8ff, { emissive: 1, opacity: 0.14, side: THREE.DoubleSide }), bubbleGeo13 = new THREE.IcosahedronGeometry(1.25, 1);
Object.assign(BR10, {
  acrobacia: { id: 'brAcrobacia', ic: '🚀', name: 'Salto del millón', short: 'un salto al cielo y un picado que lo arrasa todo',
    desc: 'ESPECIAL · Tras tu especial sales disparado hacia el cielo con un triple mortal y caes en un picado que pega el triple y llega el doble de lejos.',
    fx(k){ banner('¡Salto del millón!', 0.9); P13.mega = { k, t: 0 }; } },
  fortuna: { id: 'brFortuna', ic: '🎰', name: '¡Jackpot!', short: 'tres sietes: lluvia de monedas, cura y barra',
    desc: 'ESPECIAL · Tu especial tira de la palanca y siempre salen tres sietes: llueven monedas sobre los enemigos, te curas un 15 % y recuperas barra.',
    fx(k){ slotSpin13(['7️⃣', '7️⃣', '7️⃣'], () => jackpot13('7️⃣', k)); } },
  coraza: { id: 'brCoraza', ic: '🏰', name: 'Fortaleza', short: 'un escudo que absorbe y luego estalla',
    desc: 'ESPECIAL · Tu especial te envuelve 6 s en un escudo que absorbe hasta el 40 % de tu vida. Al acabar estalla y devuelve lo absorbido con intereses.',
    fx(k){ fortStart13(k); } },
  impetu: { id: 'brImpetu', ic: '🔁', name: 'Bis', short: 'repite tus otros especiales de rama',
    desc: 'ESPECIAL · Dos segundos después de tu especial, el público pide otra: se repiten tus demás especiales de rama al 60 %. Si no tienes otros, onda de energía.',
    fx(k){ later(2.0, () => { if (player.dead || gameState !== 'play') return;
      const others = Object.keys(BR10).filter(t => t !== 'impetu' && lvl(BR10[t].id));
      banner('¡Bis!<small>El público lo pide</small>', 0.9); play('superOn');
      if (!others.length){ const H = hero.position; explode(H.x, H.z, 5, 0x3ad8c0, 55 * k, { kind: 'nova', knock: 6 }); gring(H.x, 0.1, H.z, 0x3ad8c0, 0.4, 5.5, 0.45); return; }
      others.forEach((t, i) => later(0.15 + i * 0.45, () => { if (!player.dead && gameState === 'play') try { BR10[t].fx(k * 0.6); } catch (err) { console.error(err); } })); }); } }
});
for (const t of ['acrobacia', 'fortuna', 'coraza', 'impetu']){ const B = BR10[t];
  UPGRADES.push({ id: B.id, r: 'leyenda', tags: [t], ic: B.ic, name: B.name, desc: B.desc, max: 3, branch: t, stk: '+50 % de daño y efecto más grande', req: () => setOn(t), apply: () => {} }); }

// bonus de familia que se aplican al activarse
const _setActivated13 = setActivated;
setActivated = function(t){ _setActivated13(t);
  if (t === 'fortuna') up.crit += 0.1;
  if (t === 'coraza') up.armor += 0.15;
  if (t === 'impetu') up.meterRate += 0.3;
  if (t === 'acrobacia') P13.dashLeft++; };

'use strict';
/* ---------- Nuevas mejoras (con familias) ---------- */
const UP_TAGS = { life: ['sangre'], slam: ['impacto'], fire: ['fuego'], quake: ['impacto'], orb: ['cristal'], reflect: ['cristal'], spin: ['impacto'] };
for (const u of UPGRADES) u.tags = UP_TAGS[u.id] || [];
const ICONS = { dmg: '🗡️', crit: '🎯', hp: '❤️', potion: '🧪', speed: '👟', armor: '🛡️', meter: '✨', life: '🩸', slam: '💥', fire: '🔥', quake: '🌋',
  orb: '💎', spin: '🌀', reflect: '🔁', perfect: '⏳' };
const has = (t, n = 1) => (tagCnt[t] || 0) >= n;
UPGRADES.push(
  { id: 'fireEdge', r: 'rara',  tags: ['fuego'],   ic: '🔥', name: 'Filo ígneo',       desc: 'Tus golpes de bastón queman. Cada nivel quema más fuerte.', max: 3, apply: () => {} },
  { id: 'frost',    r: 'rara',  tags: ['hielo'],   ic: '❄️', name: 'Escarcha',         desc: 'Tus golpes enfrían y ralentizan. 5 cargas de frío congelan al enemigo.', max: 3, apply: () => {} },
  { id: 'glacial',  r: 'rara',  tags: ['hielo', 'impacto'], ic: '🧊', name: 'Salto glacial', desc: 'Al aterrizar de un salto, una onda helada enfría todo lo cercano.', max: 2, apply: () => {} },
  { id: 'storm',    r: 'rara',  tags: ['rayo'],    ic: '⚡', name: 'Bastón tormenta',  desc: 'Cada tercer golpe que acierta lanza un rayo que salta entre enemigos.', max: 3, apply: () => {} },
  { id: 'static',   r: 'rara',  tags: ['rayo'],    ic: '🌩️', name: 'Estática',         desc: 'Al rodar descargas rayos contra los enemigos cercanos.', max: 2, apply: () => {} },
  { id: 'after',    r: 'rara',  tags: ['impacto'], ic: '💢', name: 'Réplica',          desc: 'El golpe final provoca una segunda onda, más grande, un instante después.', max: 2, apply: () => {} },
  { id: 'frenzy',   r: 'rara',  tags: ['sangre'],  ic: '😤', name: 'Frenesí',          desc: 'El combo da el doble de bonus de daño y su tope sube.', max: 2, apply: () => {} },
  { id: 'pyre',     r: 'epica', tags: ['fuego'],   ic: '☄️', name: 'Pira',             desc: 'Los enemigos que mueren ardiendo estallan y prenden a los de alrededor.', max: 1, req: () => has('fuego'), apply: () => {} },
  { id: 'shards',   r: 'epica', tags: ['hielo'],   ic: '🔷', name: 'Esquirlas',        desc: 'Los enemigos congelados o helados que mueren estallan en esquirlas que congelan.', max: 1, req: () => has('hielo'), apply: () => {} },
  { id: 'thunder',  r: 'epica', tags: ['rayo'],    ic: '⛈️', name: 'Juicio',           desc: 'Tu especial desata una lluvia de 12 rayos sobre los enemigos.', max: 1, req: () => has('rayo'), apply: () => {} },
  { id: 'prism',    r: 'epica', tags: ['cristal', 'rayo'], ic: '🔆', name: 'Prisma', desc: 'Tus cristales guardianes disparan rayos a los enemigos cercanos.', max: 1, req: () => has('cristal'), apply: () => {} },
  { id: 'feast',    r: 'epica', tags: ['sangre'],  ic: '🍖', name: 'Festín',           desc: 'Cada enemigo derrotado te cura 3 PV y carga la barra ÍMP.', max: 1, req: () => has('sangre'), apply: () => {} },
  { id: 'supernova',r: 'leyenda', tags: ['fuego', 'rayo'], ic: '🌟', name: 'Supernova', desc: 'Tu especial encadena tres explosiones que queman y electrifican: sobrecargas por todas partes.', max: 1, req: () => has('fuego', 2) && has('rayo', 2), apply: () => {} },
  { id: 'zero',     r: 'leyenda', tags: ['hielo', 'impacto'], ic: '🥶', name: 'Cero absoluto', desc: 'El golpe final congela al instante a todo lo que alcanza.', max: 1, req: () => has('hielo', 2) && has('impacto', 2), apply: () => {} },
  { id: 'tempest',  r: 'leyenda', tags: ['cristal', 'rayo'], ic: '🌪️', name: 'Tormenta de cristal', desc: 'Cada vez que un cristal guardián golpea, lanza un rayo en cadena.', max: 1, req: () => has('cristal', 2) && has('rayo', 2), apply: () => {} },
  { id: 'phoenix',  r: 'leyenda', tags: ['fuego', 'sangre'], ic: '🪶', name: 'Fénix', desc: 'Una vez por partida, al caer renaces en una explosión de fuego con el 60 % de PV.', max: 1, req: () => has('fuego', 2) && has('sangre', 2), apply: () => { phoenixLeft++; } }
);
for (const u of UPGRADES) if (!u.ic) u.ic = ICONS[u.id] || '✦';
RAR.leyenda = ['Legendaria', '#ff9a3a', 34];
let phoenixLeft = 0, stormCount = 0, prismT = 0;
const shownLeg = new Set();

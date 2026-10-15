'use strict';
/* ======================================================================
   LOGROS Y ESTÉTICOS (absolutamente inútiles, absolutamente necesarios)
   ====================================================================== */
if (!meta.ach) meta.ach = {};
if (!meta.stats) meta.stats = {};
meta.cos = Object.assign({ hat: 'none', glasses: 'none', weapon: 'staff', effect: 'none', sound: 'normal', body: 'normal', dance: 'wave', title: 'Repartidor novato' }, meta.cos || {});
const stat = (k, n = 1) => (meta.stats[k] = (meta.stats[k] || 0) + n);

/* ---------- Logros ---------- */
const ACH = [
  { id: 'intro',     ic: '📦', name: 'Bienvenido al curro',      desc: 'Mira la introducción (o sáltala, no te juzgamos).', rw: [['hat', 'cap']] },
  { id: 'introFull', ic: '🐈', name: 'Gatófilo',                  desc: 'Mira la introducción entera sin saltarla.', rw: [['hat', 'cat'], ['title', 'Amigo de los gatos']] },
  { id: 'w1',        ic: '👶', name: 'Primer día de curro',       desc: 'Supera la oleada 1.', rw: [['title', 'Becario']] },
  { id: 'die1',      ic: '📭', name: 'Entrega fallida',           desc: 'Cae en la oleada 1. Ha costado, ¿eh?', secret: true, rw: [['glasses', 'mustache']] },
  { id: 'runs10',    ic: '⏰', name: 'Esto no entra en mi horario', desc: 'Juega 10 partidas.', prog: () => [meta.runs || 0, 10], rw: [['hat', 'pot']] },
  { id: 'guardian',  ic: '✍️', name: 'Firma aquí',                desc: 'Derrota al Guardián de las Ruinas.', rw: [['weapon', 'baguette']] },
  { id: 'dragon',    ic: '🐉', name: 'Largo, muy largo',          desc: 'Derrota a Ryūjin, el dragón de jade.', rw: [['hat', 'crown']] },
  { id: 'oni50',     ic: '👹', name: 'Azul no es un insulto',     desc: 'Derrota a 50 oni.', prog: () => [meta.stats.oni || 0, 50], rw: [['effect', 'rainbow']] },
  { id: 'reacts3',   ic: '🧪', name: 'Química mágica',            desc: 'Descubre las 3 reacciones elementales.', prog: () => [Object.keys(meta.reacts || {}).length, 3], rw: [['effect', 'confetti']] },
  { id: 'chain10',   ic: '💥', name: 'Reacción en cadena',        desc: 'Provoca 10 reacciones en menos de 3 segundos.', rw: [['hat', 'halo']] },
  { id: 'combo100',  ic: '😎', name: 'C-C-C-Combo',               desc: 'Llega a un combo de 100.', rw: [['glasses', 'pixel']] },
  { id: 'combo250',  ic: '🔥', name: 'Imparable',                 desc: 'Llega a un combo de 250.', rw: [['title', 'Imparable']] },
  { id: 'nodmg',     ic: '☂️', name: 'Sin manos mojadas',         desc: 'Supera una oleada (de la 3 en adelante) sin recibir daño.', rw: [['weapon', 'umbrella']] },
  { id: 'nodmg3',    ic: '🦆', name: 'Intocable',                 desc: 'Supera 3 oleadas seguidas sin recibir daño.', rw: [['hat', 'duck']] },
  { id: 'freeze100', ic: '🥶', name: 'Frío, frío',                desc: 'Congela a 100 enemigos.', prog: () => [meta.stats.frozen || 0, 100], rw: [['weapon', 'churro']] },
  { id: 'burn200',   ic: '🔥', name: 'Aquí huele a quemado',      desc: 'Prende fuego a 200 enemigos.', prog: () => [meta.stats.burned || 0, 200], rw: [['sound', 'honk']] },
  { id: 'multi5',    ic: '🩴', name: 'La chancla voladora',       desc: 'Derrota a 5 enemigos de un solo golpe.', rw: [['weapon', 'chancla']] },
  { id: 'biome2',    ic: '🏔️', name: 'Turismo extremo',           desc: 'Llega a la Cumbre Nevada.', rw: [['hat', 'cone']] },
  { id: 'wave16',    ic: '🎓', name: 'Vuelta al cole',            desc: 'Llega a la oleada 16.', rw: [['hat', 'tophat']] },
  { id: 'legend',    ic: '💸', name: 'Leyenda urbana',            desc: 'Elige una carta legendaria.', rw: [['effect', 'money']] },
  { id: 'sets3',     ic: '🛠️', name: 'Build rota',                desc: 'Activa 3 bonus de familia en la misma partida.', rw: [['glasses', '3d']] },
  { id: 'shrine10',  ic: '🛍️', name: 'Cliente VIP',               desc: 'Compra 10 mejoras en el Santuario.', prog: () => [Object.values(meta.lv || {}).reduce((a, b) => a + b, 0), 10], rw: [['title', 'Cliente VIP']] },
  { id: 'frag1000',  ic: '🐷', name: 'Ahorrador',                 desc: 'Gana 1000 fragmentos en total.', prog: () => [meta.stats.frag || 0, 1000], rw: [['sound', 'quack']] },
  { id: 'idle20',    ic: '🧘', name: 'Paciencia infinita',        desc: 'Quédate quieto 20 segundos en mitad de una oleada.', secret: true, rw: [['dance', 'dance']] },
  { id: 'wave25',    ic: '👋', name: 'Saludador compulsivo',      desc: 'Saluda 25 veces (Q o toca tu retrato).', prog: () => [meta.stats.waves || 0, 25], rw: [['dance', 'dab']] },
  { id: 'roll300',   ic: '🗿', name: 'Rodador profesional',       desc: 'Rueda 300 veces.', prog: () => [meta.stats.rolls || 0, 300], rw: [['body', 'bighead']] },
  { id: 'hats5',     ic: '🎩', name: 'Fashionista',               desc: 'Desbloquea 5 sombreros.', prog: () => [COS.hat.filter(x => x[0] !== 'none' && cosUnlocked('hat', x[0])).length, 5], rw: [['body', 'mini']] },
  { id: 'mini',      ic: '🐜', name: 'El tamaño no importa',      desc: 'Derrota a un jefe en modo mini.', secret: true, rw: [['weapon', 'chicken']] },
  { id: 'all',       ic: '🏆', name: 'Leyenda del reparto',       desc: 'Consigue todos los demás logros.', prog: () => [ACH.filter(a => a.id !== 'all' && meta.ach[a.id]).length, ACH.length - 1], rw: [['body', 'gold'], ['title', 'Leyenda del reparto']] }
];

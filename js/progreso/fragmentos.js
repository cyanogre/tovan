'use strict';
/* ---------- Progreso permanente: fragmentos y santuario ---------- */
let meta = { frag: 0, lv: {}, runs: 0, kills: 0, best: 0 };
try { const m = JSON.parse(localStorage.getItem('tovan-meta') || 'null'); if (m) meta = Object.assign(meta, m); } catch (e) {}
if (best > meta.best) meta.best = best;
best = meta.best;
function saveMeta(){ try { localStorage.setItem('tovan-meta', JSON.stringify(meta)); localStorage.setItem('tovan-best', String(meta.best)); } catch (e) {} }
const ml = id => meta.lv[id] || 0;
const SHRINE = [
  { id: 'vit',    name: 'Vitalidad',       desc: '+15 PV máximos al empezar cada partida.', max: 5, cost: l => 30 + l * 30 },
  { id: 'str',    name: 'Fuerza',          desc: '+8 % de daño con todo.', max: 5, cost: l => 40 + l * 35 },
  { id: 'meterS', name: 'Chispa inicial',  desc: 'Empiezas con un 30 % de barra ÍMP.', max: 3, cost: l => 40 + l * 40 },
  { id: 'reroll', name: 'Relanzar',        desc: '+1 relanzamiento de cartas de mejora por partida.', max: 3, cost: l => 50 + l * 50 },
  { id: 'luck',   name: 'Fortuna',         desc: 'Más probabilidad de mejoras raras y épicas.', max: 3, cost: l => 60 + l * 60 },
  { id: 'loot',   name: 'Botín',           desc: '+25 % de fragmentos al terminar la partida.', max: 3, cost: l => 70 + l * 70 },
  { id: 'choice', name: 'Cuarta carta',    desc: 'Eliges entre 4 mejoras en lugar de 3.', max: 1, cost: () => 300 },
  { id: 'revive', name: 'Segundo aliento', desc: 'Al caer te levantas con la mitad de PV. Una vez por partida y nivel.', max: 2, cost: l => 350 + l * 400 }
];
let perfectAt = -99, rerolls = 0, reviveLeft = 0, bossKills = 0, eliteKills = 0, swingDone = false;
const fragNow = () => Math.round((kills + Math.max(0, wave - 1) * 4 + bossKills * 25 + eliteKills * 4 + (typeof castleBonus === 'number' ? castleBonus : 0) + (typeof billBonus === 'number' ? billBonus : 0)) * (1 + 0.25 * ml('loot')) * cosFragMul());

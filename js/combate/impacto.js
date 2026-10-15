'use strict';
/* ======================================================================
   v12 · Golpes con más impacto, números por elemento, acrobacias,
         más caras en el vestidor y títulos con ventaja
   ====================================================================== */
var AC12 = { flipAx: null, flipDir: 1, flipT0: 0, flipDur: 0.5, chain: 0, landT: 9, lj: false, airDash: false, wasG: true };
const CK12 = { x: 0, z: 0 };
const ELC12 = { fire: '#ff9a3a', ice: '#9fe8ff', shock: '#fff27a', poison: '#8dff3a', blood: '#ff4a5a' };
let NUMC12 = null, DOT12 = null;
/* (estilos de esta parte: css/impacto-v12.css) */

/* ---------- Números de daño del color del elemento ---------- */
function numColor12(o, melee){
  o = o || {};
  if (o.el && ELC12[o.el]) return ELC12[o.el];
  if (o.src === 'dot') return DOT12 === 'poison' ? ELC12.poison : DOT12 === 'fire' ? ELC12.fire : null;
  if (o.src === 'bolt' || o.src === 'beam' && lvl('kamen')) return ELC12.shock;
  if (melee || o.src === 'melee'){
    if (lvl('poison') || lvl('venomBlade')) return ELC12.poison;
    if (lvl('frost')) return ELC12.ice;
    if (lvl('fireEdge') || fineOn) return ELC12.fire;
    if (lvl('storm') && setOn('rayo')) return ELC12.shock;
    if (P6.ls > 0 || setOn('sangre') || lvl('brSangre')) return ELC12.blood;
  }
  if ((o.src === 'orb' || o.src === 'orbital') && lvl('vampOrbs')) return ELC12.blood;
  return null;
}
const _spawnNumber12 = spawnNumber;
spawnNumber = function(pos, text, cls = '', color){
  const dmgKind = cls === '' || cls === 'crit' || cls === 'dot';
  if (!color && NUMC12 && dmgKind) color = NUMC12;
  _spawnNumber12(pos, text, cls, color);
  if (dmgKind){ const n = nums[nums.length - 1]; if (n && !n.el.querySelector('.p12')) n.el.innerHTML = `<span class="p12${cls === 'crit' ? ' c12' : ''}">${n.el.innerHTML}</span>`; }
};
const _updatePoison12 = updatePoison;
updatePoison = function(e, dt){ const p = DOT12; DOT12 = 'poison'; try { _updatePoison12(e, dt); } finally { DOT12 = p; } };
const _updateStatuses12 = updateStatuses;
updateStatuses = function(e, dt){ const p = DOT12; DOT12 = 'fire'; try { _updateStatuses12(e, dt); } finally { DOT12 = p; } };

/* ---------- Golpes con impacto ---------- */
const _hitEnemy12 = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  const prev = NUMC12; NUMC12 = numColor12(o, melee);
  let ok; try { ok = _hitEnemy12(e, val, crit, nx, nz, knock, meterGain, melee, o); } finally { NUMC12 = prev; }
  if (ok && e && (melee || (o && o.src === 'melee'))) try { meleeJuice12(e, crit, numColor12(o, melee)); } catch (err) { console.error(err); }
  else if (ok && e && !e.isBoss && o && o.src !== 'dot'){ e.sq12 = Math.max(e.sq12 || 0, 0.12); e.sqv12 = e.sqv12 || 0; }
  return ok;
};
function meleeJuice12(e, crit, col){
  const x = e.g.position.x, z = e.g.position.z, y = 0.9 * (e.scale || 1);
  let dx = x - hero.position.x, dz = z - hero.position.z; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
  e.sq12 = Math.max(e.sq12 || 0, e.isBoss ? 0.07 : crit ? 0.34 : 0.24); e.sqv12 = 0;
  const kick = crit ? 0.17 : 0.09; CK12.x += dx * kick; CK12.z += dz * kick;
  hitStop = Math.max(hitStop, crit ? 0.075 : 0.035);
  const c = col ? parseInt(col.slice(1), 16) : 0xffffff;
  pa(x - dx * 0.35, y, z - dz * 0.35, 0, 0, 0, 0xffffff, crit ? 1.5 : 0.95, 0.07, 0, 0, 1.6, SH7.star);
  const base = Math.atan2(dx, dz);
  for (let k = 0; k < (crit ? 6 : 3); k++){ const a = base + (rnd() - 0.5) * 1.3; streak7(x, y + (rnd() - 0.5) * 0.5, z, Math.sin(a), (rnd() - 0.3) * 0.7, Math.cos(a), crit ? 1.7 : 1.0, k % 2 ? c : 0xffffff, 0.16, crit ? 0.07 : 0.045, 7); }
  if (crit){ gring(x, y, z, c, 0.2, 1.9, 0.22, base); shake = Math.max(shake, 0.18); }
}
// asistencia de puntería: al empezar un golpe te giras hacia el enemigo cercano que tienes delante y das un pasito hacia él
const _startMove12 = startMove;
startMove = function(name, idx){ try { aim12(name); } catch (err) { console.error(err); } _startMove12(name, idx); };
function aim12(name){
  const mv = MV[name]; if (!mv || mv.special || invActive || player.dead) return;
  const base = inputMag > 0.12 ? inputHeading : hero.rotation.y; let best = null, bs = 1e9, bd = 0;
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
    const dx = e.g.position.x - hero.position.x, dz = e.g.position.z - hero.position.z, d = Math.hypot(dx, dz) - e.r;
    if (d > 3.0) continue; const da = Math.abs(((Math.atan2(dx, dz) - base + Math.PI) % TAU + TAU) % TAU - Math.PI); if (da > 1.1) continue;
    const s = d + da * 1.4; if (s < bs){ bs = s; best = e; bd = d; } }
  if (!best) return;
  const a = angTo(hero.position.x, hero.position.z, best.g.position.x, best.g.position.z); hero.rotation.y = a; heading = a;
  if (bd > 1.1 && grounded){ const k = Math.min(4, (bd - 0.9) * 3.2); MOV11.vx += Math.sin(a) * k; MOV11.vz += Math.cos(a) * k; }
}
// la última baja de la oleada va a cámara lenta
const _killEnemy12 = killEnemy;
killEnemy = function(e){
  const was = e && e.alive; _killEnemy12(e);
  if (!was || gameState !== 'play' || MG.active) return;
  if (e.isBoss){ slowT = Math.max(slowT, 0.9); flash('#ffffff', 0.35); return; }
  if (!queue.length && !enemies.some(o => o.alive) && wave > 0){ slowT = Math.max(slowT, 0.5); flash('#ffffff', 0.15); shoutHero7(pick10(['¡Limpio!', '¡Entregado!', '¡Y ni despeinado!', '¡Siguiente!']), '#ffe9b0', 3.0); }
};
// cámara: empujoncito hacia donde golpeas
const _legendCamera12 = legendCamera;
legendCamera = function(cam){ _legendCamera12(cam); cam.position.x += CK12.x; cam.position.z += CK12.z; };
function squash12(dt){
  const k = Math.exp(-dt * 14); CK12.x *= k; CK12.z *= k;
  for (const e of enemies){
    const b = e.scale > 0 ? e.scale : 1, gs = e.g.scale;
    if (!isFinite(gs.x) || !isFinite(gs.y) || !isFinite(gs.z)) gs.setScalar(b);            // red de seguridad: nunca escala rota
    if (!e.sq12 && !e.sqv12) continue;
    if (!e.alive || e.spawnT > 0 || e.dying > 0 || e.type === 'dragon' || e.type === 'skeleton' || e.type === 'finalcat'){ e.sq12 = e.sqv12 = 0; continue; }
    let q = +e.sq12 || 0, v = +e.sqv12 || 0; const h = Math.min(dt, 1 / 30);
    v += (-260 * q - 14 * v) * h; q += v * h;
    if (!isFinite(q) || !isFinite(v) || (Math.abs(q) < 0.003 && Math.abs(v) < 0.05)){ e.sq12 = e.sqv12 = 0; gs.setScalar(b); continue; }
    e.sq12 = q; e.sqv12 = v;
    const s = clamp(q, -0.35, 0.4); gs.set(b * (1 + s * 0.55), b * (1 - s), b * (1 + s * 0.55));
  }
}

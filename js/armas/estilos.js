'use strict';
/* ---------- Estilos de arma: cada una juega distinto ---------- */
const WSTYLE = {
  staff:    { style: 'Equilibrado', dmg: 3, spd: 3, rng: 3, mov: 3, seq: ['a', 'b', 'slam'], combo: 'Tajo · Revés · Golpe de suelo',
              extra: 'Sin trucos: el arma de referencia. Cargado: Haz de linterna.' },
  baguette: { style: 'Pesado', dmg: 5, spd: 1, rng: 4, mov: 2, seq: ['bagA', 'bagB', 'bagC'], combo: 'Barrido ancho · Mazazo · Torbellino de pan',
              extra: 'Golpes lentos y anchos que no se interrumpen aunque te peguen. Te mueves algo más lento y ruedas menos.' },
  umbrella: { style: 'Esgrima', dmg: 2, spd: 4, rng: 5, mov: 3, seq: ['umA', 'umB', 'umC', 'umD'], combo: 'Estocada ×3 · ¡Paraguas abierto!',
              extra: 'Estocadas largas y precisas. Al atacar paras los proyectiles de delante. Mantén saltar en el aire para planear.' },
  churro:   { style: 'Ráfaga', dmg: 2, spd: 5, rng: 2, mov: 5, seq: ['chuA', 'chuB', 'chuC', 'chuD', 'chuE'], combo: 'Cuatro pinchazos rápidos · Remolino de azúcar ardiente',
              extra: 'Combos de cinco golpes muy rápidos. Te mueves y ruedas más lejos. El remate quema.' },
  chancla:  { style: 'A distancia', dmg: 3, spd: 3, rng: 5, mov: 3, seq: ['slapA', 'slapB', 'throw'], combo: 'Chanclazo · Chanclazo · ¡Lanzamiento!',
              extra: 'El tercer golpe lanza la chancla, que vuelve sola. Empuja mucho más.' },
  chicken:  { style: 'Caótico', dmg: 3, spd: 2, rng: 3, mov: 3, seq: ['bonkA', 'bonkB', 'bonkC'], combo: 'Porrazo · Porrazo · ¡Porrazo gigante!',
              extra: 'Mandas a volar a los enemigos y rebotan contra otros como en un pinball. Saltas más alto.' },
  katana:   { style: 'Precisión', dmg: 4, spd: 4, rng: 2, mov: 4, seq: ['katA', 'katB', 'katC', 'katD'], combo: 'Tres cortes rápidos · Iai de remate',
              extra: 'Si encadenas el siguiente golpe justo al final del anterior, es un corte perfecto (crítico seguro).' }
};
const curW = () => WSTYLE[meta.cos.weapon] ? meta.cos.weapon : 'staff';
function weaponSeq(){
  const s = WSTYLE[curW()].seq.slice();
  if (up.spin) s.splice(s.length - 1, 0, 'spin');
  return s;
}
function rollMul(){ const w = curW(); return w === 'churro' ? 1.22 : w === 'baguette' ? 0.85 : w === 'katana' ? 1.12 : 1; }
function jumpMul(){ return curW() === 'chicken' ? 1.18 : 1; }
const SWEEP_R = pose({ shX: -1.3, shY: 2.0, spY: 0.9, spX: -0.05, elX: -0.15, dy: 0 });
const SWEEP_L = pose({ shX: -1.45, shY: -1.6, spY: -0.9, spX: 0.15, elX: -0.05, dy: -0.1 });
const UPCUT = pose({ shX: -2.6, shY: -0.6, spY: -0.4, spX: -0.1, elX: -0.1, dy: 0.02 });
const LOWCUT = pose({ shX: -0.9, shY: 1.3, spY: 0.5, spX: 0.25, elX: -0.2, dy: -0.12 });
const SPINK = (n) => [[0, SPIN_OUT], [0.15, SPIN_OUT], [0.85, pose({ shX: -1.5, shY: 1.6, spY: 0.4 - n * TAU, spX: 0.05, elX: -0.05, dy: -0.08 })],
  [0.999, pose({ shX: -1.3, shY: 1.3, spY: 0.4 - n * TAU, spX: 0.08, dy: -0.05 })], [1, pose({ shX: -1.3, shY: 1.3, spY: 0.4, spX: 0.08, dy: -0.05 })]];
Object.assign(MV, {
  // baguette: pesada y ancha
  bagA: { dur: 0.6, hit: 0.56, trail: [0.38, 0.72], lunge: [0.36, 0.62, 0.32], dmg: [40, 50], range: 3.0, cone: -0.35, meter: 8, knock: 4.5, armor: true, hs: 0.07,
          keys: [[0, HOLD], [0.36, SWEEP_R], [0.64, SWEEP_L], [1, A_END]] },
  bagB: { dur: 0.72, hit: 0.5, trail: [0.38, 0.54], lunge: [0.38, 0.52, 0.42], dmg: [55, 68], range: 2.9, slam: true, meter: 10, knock: 6, armor: true,
          keys: [[0, A_END], [0.3, OVER], [0.42, pose({ shX: -3.5, shY: 0.25, spY: 0.1, spX: -0.3, elX: -0.1, dy: 0.04 })], [0.52, SMASHED], [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] },
  bagC: { dur: 0.95, hit: 0.62, trail: [0.2, 0.86], lunge: [0.2, 0.8, 0.4], dmg: [70, 86], range: 3.3, cone: -2, meter: 12, knock: 8, armor: true, noNeck: true, keys: SPINK(1) },
  // paraguas: esgrima larga
  umA: { dur: 0.3, hit: 0.45, trail: [0.3, 0.62], lunge: [0.24, 0.5, 0.45], dmg: [17, 22], range: 3.1, cone: 0.62, meter: 4, knock: 1.5, umb: true,
         keys: [[0, pose({ shX: -1.2, shY: 0.8, spY: 0.4, elX: -1.0, dy: -0.05 })], [0.35, THRUST], [0.7, THRUST], [1, pose({ shX: -1.3, shY: 0.5, spY: 0.2, elX: -0.6, dy: -0.05 })]] },
  umB: { dur: 0.3, hit: 0.45, trail: [0.3, 0.62], lunge: [0.24, 0.5, 0.45], dmg: [17, 22], range: 3.1, cone: 0.62, meter: 4, knock: 1.5, umb: true,
         keys: [[0, pose({ shX: -1.3, shY: 0.5, spY: 0.2, elX: -0.9, dy: -0.05 })], [0.35, pose({ shX: -1.7, shY: 0.2, spY: -0.3, spX: 0.3, elX: -0.02, dy: -0.15 })], [0.7, THRUST], [1, pose({ shX: -1.3, shY: 0.6, spY: 0.3, elX: -0.7, dy: -0.05 })]] },
  umC: { dur: 0.32, hit: 0.45, trail: [0.3, 0.62], lunge: [0.24, 0.5, 0.55], dmg: [19, 24], range: 3.2, cone: 0.62, meter: 4, knock: 2, umb: true,
         keys: [[0, pose({ shX: -1.3, shY: 0.6, spY: 0.3, elX: -1.0, dy: -0.05 })], [0.35, pose({ shX: -1.55, shY: -0.2, spY: -0.5, spX: 0.35, elX: -0.02, dy: -0.18 })], [0.7, THRUST], [1, A_END]] },
  umD: { dur: 0.62, hit: 0.45, trail: [0.15, 0.85], lunge: [0, 0, 0], dmg: [32, 40], range: 2.8, cone: -2, meter: 8, knock: 6, umbOpen: true, noNeck: true, keys: SPINK(1) },
  // churro: rápido
  chuA: { dur: 0.24, hit: 0.5, trail: [0.25, 0.7], lunge: [0.2, 0.5, 0.25], dmg: [13, 17], range: 2.3, cone: 0.25, meter: 3, knock: 1, hs: 0.03, keys: [[0, HOLD], [0.3, JAB0], [0.6, JAB1], [1, JAB0]] },
  chuB: { dur: 0.24, hit: 0.5, trail: [0.25, 0.7], lunge: [0.2, 0.5, 0.25], dmg: [13, 17], range: 2.3, cone: 0.25, meter: 3, knock: 1, hs: 0.03, keys: [[0, JAB0], [0.3, LOWCUT], [0.6, JAB1], [1, JAB0]] },
  chuC: { dur: 0.24, hit: 0.5, trail: [0.25, 0.7], lunge: [0.2, 0.5, 0.25], dmg: [13, 17], range: 2.3, cone: 0.25, meter: 3, knock: 1, hs: 0.03, keys: [[0, JAB0], [0.3, JAB0], [0.6, JAB1], [1, JAB0]] },
  chuD: { dur: 0.24, hit: 0.5, trail: [0.25, 0.7], lunge: [0.2, 0.5, 0.25], dmg: [14, 18], range: 2.3, cone: 0.25, meter: 3, knock: 1.5, hs: 0.03, keys: [[0, JAB0], [0.3, LOWCUT], [0.6, JAB1], [1, B_END]] },
  chuE: { dur: 0.5, hit: 0.55, trail: [0.15, 0.85], lunge: [0.1, 0.7, 0.4], dmg: [28, 36], range: 2.6, cone: -2, meter: 6, knock: 4, el: 'fire', noNeck: true, keys: SPINK(1) },
  // chancla: golpes y lanzamiento
  slapA: { dur: 0.32, hit: 0.5, trail: [0.3, 0.65], lunge: [0.26, 0.55, 0.3], dmg: [20, 26], range: 2.2, cone: 0.2, meter: 5, knock: 3, slapSfx: true, keys: [[0, HOLD], [0.32, SWEEP_R], [0.62, SWEEP_L], [1, A_END]] },
  slapB: { dur: 0.32, hit: 0.5, trail: [0.3, 0.65], lunge: [0.26, 0.55, 0.3], dmg: [20, 26], range: 2.2, cone: 0.2, meter: 5, knock: 3, slapSfx: true, keys: [[0, A_END], [0.3, pose({ shX: -1.5, shY: -1.7, spY: -0.8, spX: 0.05 })], [0.6, pose({ shX: -1.3, shY: 1.5, spY: 0.7, spX: 0.12, dy: -0.08 })], [1, B_END]] },
  throw: { dur: 0.42, hit: 0.42, trail: [0.3, 0.5], lunge: [0.25, 0.45, 0.3], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, keys: [[0, CH_BACK], [0.3, CH_BACK], [0.45, THRUST], [1, A_END]] },
  // pollo de goma: porrazos que mandan a volar
  bonkA: { dur: 0.45, hit: 0.52, trail: [0.32, 0.62], lunge: [0.3, 0.55, 0.3], dmg: [24, 30], range: 2.5, cone: 0, meter: 5, knock: 7, pin: true, keys: [[0, HOLD], [0.3, pose({ shX: -2.4, shY: 1.2, spY: 0.6, spX: -0.1 })], [0.56, SWEEP_L], [1, A_END]] },
  bonkB: { dur: 0.45, hit: 0.52, trail: [0.32, 0.62], lunge: [0.3, 0.55, 0.3], dmg: [24, 30], range: 2.5, cone: 0, meter: 5, knock: 7, pin: true, keys: [[0, A_END], [0.3, pose({ shX: -2.4, shY: -1.2, spY: -0.6, spX: -0.1 })], [0.56, SWEEP_R], [1, B_END]] },
  bonkC: { dur: 0.78, hit: 0.5, trail: [0.36, 0.54], lunge: [0.36, 0.5, 0.4], dmg: [50, 62], range: 2.8, slam: true, meter: 10, knock: 9, pin: true, stun: 0.8,
           keys: [[0, B_END], [0.3, OVER], [0.42, pose({ shX: -3.5, shY: 0.25, spY: 0.1, spX: -0.3, elX: -0.1, dy: 0.04 })], [0.52, SMASHED], [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] },
  // katana: precisión
  katA: { dur: 0.26, hit: 0.5, trail: [0.28, 0.66], lunge: [0.26, 0.55, 0.3], dmg: [21, 27], range: 2.1, cone: 0.35, meter: 4, knock: 1.5, hs: 0.04, keys: [[0, HOLD], [0.3, SWEEP_R], [0.62, SWEEP_L], [1, A_END]] },
  katB: { dur: 0.26, hit: 0.5, trail: [0.28, 0.66], lunge: [0.26, 0.55, 0.3], dmg: [21, 27], range: 2.1, cone: 0.35, meter: 4, knock: 1.5, hs: 0.04, keys: [[0, A_END], [0.3, pose({ shX: -1.5, shY: -1.7, spY: -0.8, spX: 0.05 })], [0.62, pose({ shX: -1.3, shY: 1.5, spY: 0.7, spX: 0.12, dy: -0.08 })], [1, B_END]] },
  katC: { dur: 0.28, hit: 0.5, trail: [0.28, 0.66], lunge: [0.26, 0.55, 0.3], dmg: [22, 28], range: 2.1, cone: 0.35, meter: 4, knock: 2, hs: 0.04, keys: [[0, B_END], [0.3, LOWCUT], [0.62, UPCUT], [1, A_END]] },
  katD: { dur: 0.5, hit: 0.46, trail: [0.4, 0.56], lunge: [0.38, 0.5, 0.9], dmg: [44, 54], range: 2.5, cone: 0.15, meter: 6, knock: 3, critB: 0.25, iai: true,
          keys: [[0, CH_BACK], [0.38, CH_BACK], [0.48, THRUST], [1, A_END]] }
});
MV.throw.fire = () => throwChancla(0);
function throwChancla(lv){
  if (rangs.length){ resolveHit(Object.assign({}, MV.slapA, { dmg: [24, 30] })); return; }
  const fX = Math.sin(hero.rotation.y), fZ = Math.cos(hero.rotation.y);
  const holder = new THREE.Group(); scene.add(holder); holder.position.set(hero.position.x + fX * 0.6, 1.0, hero.position.z + fZ * 0.6);
  const inner = WEAPONS.chancla.clone(); inner.visible = true; inner.rotation.x = Math.PI / 2; holder.add(inner); holder.scale.setScalar(lv === 2 ? 1.9 : lv === 1 ? 1.45 : 1.1);
  WEAPONS.chancla.visible = false;
  rangs.push({ g: holder, dir: hero.rotation.y, out: lv === 2 ? 9 : lv === 1 ? 7 : 5.5, d: 0, back: false, hitA: new Set(), hitB: new Set(), lv, t: 0, k0: kills, base: lv ? 46 : 30 });
  play('boomerang');
}
let perfectMove = null, perfectNext = false;
const _startMove3 = startMove;
startMove = function(name, idx){
  _startMove3(name, idx); perfectMove = null;
  if (perfectNext){ perfectNext = false; perfectMove = curMove; tA.set(hero.position.x, hero.position.y + 2.5, hero.position.z); spawnNumber(tA, '¡Perfecto!', 'react', '#d8d8ff'); flash('#e8e8ff', 0.12); play('sheath'); }
};
function notePerfectInput(){
  if (curW() !== 'katana' || state !== 'attack' || !curMove || curMove.special || curMove.custom) return;
  if (stepT / curMove.dur > 0.72) perfectNext = true;
}
const _osh = onStaffHits;
onStaffHits = function(list, mv){
  _osh(list, mv);
  if (!list.length) return;
  for (const e of list){ if (!e.alive) continue;
    if (mv.el) applyStatus(e, mv.el, 1.2);
    if (mv.stun) stunE(e, mv.stun);
    if (mv.pin && !e.heavy && !e.isBoss) e.pinT = 0.6; }
  if (mv.slapSfx) play('chanclazo');
  if (mv.pin) play('squeak');
  if (mv.iai){ for (const e of list){ tB.set(e.g.position.x, 1, e.g.position.z); slashFx(tB, rnd() * TAU, 0xffffff, 2.2); } }
};
function weaponTick(pdt){
  const w = curW();
  // planeo con paraguas
  if (w === 'umbrella' && !grounded && vy < -1.15 && !umb && state !== 'attack' && jumpHeld()){ vy = -1.15; umbGlide = 0.15; }
  if (umbGlide > 0){ umbGlide -= pdt; if (umbCone) umbCone.scale.lerp(tC.set(5.2, 0.32, 5.2), 1 - Math.exp(-pdt * 14));
    staffToHand(); attackW = Math.max(attackW, 0.9); curPose = pose({ shX: -3.0, shY: 0.15, spY: 0, spX: -0.1, elX: -0.05, dy: 0 });
    if (rnd() < 0.3) spawnFx(hero.position.x + (rnd() - 0.5), hero.position.y + 2.2, hero.position.z + (rnd() - 0.5), 0, -0.5, 0, 0xffd0d0, 0.05, 0.4, 0, 0); }
  // paraguas: para proyectiles de frente mientras ataca; abierto en el remate
  if (w === 'umbrella' && state === 'attack' && curMove && (curMove.umb || curMove.umbOpen)) blockFront(curMove.umbOpen ? 2.8 : 1.6, curMove.umbOpen ? -1 : 0.3, 0xff9a9a, true);
  if (state === 'attack' && curMove && curMove.umbOpen && umbCone){ const t = stepT / curMove.dur; const k = t > 0.15 && t < 0.9 ? 1 : 0; umbCone.scale.lerp(tC.set(1 + 4.2 * k, 1 - 0.68 * k, 1 + 4.2 * k), 1 - Math.exp(-pdt * 16)); }
  // pollo: pinball
  for (const e of enemies){ if (!e.alive || !(e.pinT > 0)) continue; e.pinT -= pdt; const sp = Math.hypot(e.vx, e.vz); if (sp < 2.2) continue;
    for (const o of enemies){ if (o === e || !o.alive || o.spawnT > 0) continue;
      const dx = o.g.position.x - e.g.position.x, dz = o.g.position.z - e.g.position.z, d = Math.hypot(dx, dz);
      if (d < e.r + o.r){ e.pinT = 0; const nx = dx / (d || 1), nz = dz / (d || 1);
        hitEnemy(o, rdmg(16), false, nx, nz, 5, 2, false, { src: 'aoe' }); hitEnemy(e, rdmg(10), false, -nx, -nz, 2, 1, false, { src: 'aoe' });
        if (!o.heavy && !o.isBoss) o.pinT = 0.45; stunE(o, 0.5);
        sparks((e.g.position.x + o.g.position.x) / 2, 0.8, (e.g.position.z + o.g.position.z) / 2, 10, 0xffe066); play('squeak');
        tA.set(o.g.position.x, o.numY + 0.3, o.g.position.z); spawnNumber(tA, '¡BOING!', 'react', '#ffe066'); break; } } }
}
let umbGlide = 0;
var gpJumpHeld = false, touchJumpHeld = false;
const jumpHeld = () => !!(keys.Space || gpJumpHeld || touchJumpHeld);

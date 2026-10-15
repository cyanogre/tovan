'use strict';
/* ---------- Movimientos nuevos ---------- */
const JAB0 = pose({ shX: -1.3, shY: 0.6, spY: 0.25, spX: 0.12, elX: -0.95, dy: -0.06 });
const JAB1 = pose({ shX: -1.72, shY: 0.05, spY: -0.25, spX: 0.24, elX: -0.04, dy: -0.11 });
const OVER = pose({ shX: -3.3, shY: 0.25, spY: 0.1, spX: -0.25, elX: -0.1, dy: 0.03 });
const SMASHED = pose({ shX: -1.32, shY: 0.12, spY: 0, spX: 0.4, elX: -0.05, dy: -0.21 });
const CH_UP = pose({ shX: -2.95, shY: 0.7, spY: 0.55, spX: -0.22, elX: -0.45, dy: 0.0 });
const CH_BACK = pose({ shX: -1.15, shY: 1.55, spY: 0.95, spX: 0.08, elX: -1.15, dy: -0.09 });
const THRUST = pose({ shX: -1.62, shY: -0.12, spY: -0.42, spX: 0.3, elX: -0.02, dy: -0.16 });
Object.assign(MV, {
  dive: { dur: 0.6, hit: 9, trail: [0.4, 0.58], lunge: [0, 0, 0], dmg: [45, 58], range: 2.5, slam: true, meter: 9, knock: 6, dive: true, centered: true, armor: true,
    keys: [[0, OVER], [0.45, pose({ shX: -3.5, shY: 0.2, spY: 0, spX: -0.12, elX: -0.1, dy: 0.0 })], [0.56, SMASHED], [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] },
  dash: { dur: 0.42, hit: 9, trail: [0.04, 0.62], lunge: [0.02, 0.5, 3.4], dmg: [38, 48], range: 1.6, cone: -2, meter: 7, knock: 3.5, pierce: true,
    keys: [[0, pose({ shX: -1.5, shY: 0.5, spY: 0.5, spX: 0.2, elX: -1.1, dy: -0.1 })], [0.14, THRUST], [0.7, THRUST], [1, A_END]] },
  flurry: { dur: 0.95, hit: 9, hits: [0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.8], trail: [0.08, 0.84], lunge: [0.05, 0.75, 0.9], dmg: [11, 15], last: [34, 44], range: 2.5, cone: 0.25, meter: 3, knock: 0.6, lastKnock: 5, hs: 0.02,
    keys: [[0, B_END], [0.08, JAB0], [0.12, JAB1], [0.17, JAB0], [0.22, JAB1], [0.27, JAB0], [0.32, JAB1], [0.37, JAB0], [0.42, JAB1], [0.47, JAB0], [0.52, JAB1], [0.57, JAB0], [0.62, JAB1],
           [0.72, OVER], [0.8, SMASHED], [1, A_END]] },
  chSmash: { dur: 0.6, hit: 0.42, trail: [0.25, 0.48], lunge: [0.2, 0.42, 0.5], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, armor: true,
    keys: [[0, CH_UP], [0.28, OVER], [0.44, SMASHED], [1, pose({ shX: -1.25, shY: 0.1, spY: 0, spX: 0.28, dy: -0.12 })]] },
  chThrust: { dur: 0.5, hit: 0.36, trail: [0.26, 0.5], lunge: [0.25, 0.45, 0.6], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, armor: true,
    keys: [[0, CH_BACK], [0.25, pose({ shX: -1.25, shY: 1.5, spY: 0.9, spX: 0.1, elX: -1.1, dy: -0.08 })], [0.4, THRUST], [1, A_END]] },
  chSpin: { dur: 0.9, hit: 9, hits: [0.3, 0.55, 0.8], trail: [0.1, 0.9], lunge: [0, 0, 0], dmg: [0, 0], range: 0, meter: 0, knock: 0, custom: true, armor: true, noNeck: true,
    keys: [[0, SPIN_OUT], [0.1, SPIN_OUT], [0.9, pose({ shX: -1.5, shY: 1.6, spY: 0.4 - 2 * TAU, spX: 0.05, elX: -0.05, dy: -0.08 })],
           [0.999, pose({ shX: -1.3, shY: 1.3, spY: 0.4 - 2 * TAU, spX: 0.08, dy: -0.05 })], [1, pose({ shX: -1.3, shY: 1.3, spY: 0.4, spX: 0.08, dy: -0.05 })]] }
});
let hitIdx = 0, diveH = 0, diveMul = 1, diveRMul = 1, pauseCue = false;
const dashHit = new Set(), kitsuneSet = new Set();
const _startMove = startMove;
startMove = function(name, idx){
  hitIdx = 0; dashHit.clear(); pauseCue = false; _startMove(name, idx);
  if (name === 'dive'){ diveH = Math.max(0, hero.position.y); vy = Math.min(vy, -11); play('dive'); }
};
function resetAtk(){ hitIdx = 0; dashHit.clear(); pauseCue = false; chargeT = 0; chargeLvl = 0; holdT = 0; umb = null; diveMul = 1; diveRMul = 1; counterT = 0; }

// estado del ataque en curso (se llama desde el bucle principal)
function diveHold(mv){
  if (!grounded){ stepT = Math.min(stepT, mv.dur * 0.45); return; }
  if (hitDone) return;
  hitDone = true; stepT = Math.max(stepT, mv.dur * 0.5);
  const h = Math.min(3, diveH), k = (1 + h * 0.45) * diveMul, k0 = kills;
  resolveHit(Object.assign({}, mv, { dmg: [mv.dmg[0] * k, mv.dmg[1] * k], range: mv.range * (1 + 0.15 * h) * diveRMul }));
  for (let i = 0; i < 14; i++){ const a = rnd() * TAU; spawnFx(hero.position.x + Math.cos(a) * 0.6, 0.2, hero.position.z + Math.sin(a) * 0.6, Math.cos(a) * 1.2, 3 + rnd() * 3, Math.sin(a) * 1.2, 0x8a7a68, 0.12, 0.8, 12, 0); }
  if (diveMul > 1) ringFx(hero.position.x, hero.position.z, 0xff6a6a, 0.3, mv.range * 1.6 * diveRMul, 0.45);
  shake = Math.max(shake, 0.25 + 0.08 * h); diveMul = 1; diveRMul = 1;
  if (kills - k0 >= 3) unlock('dive3');
}
function moveTick(mv, t){
  if (mv.hits){
    while (hitIdx < mv.hits.length && t >= mv.hits[hitIdx]){
      const i = hitIdx++, last = i === mv.hits.length - 1;
      if (mv.custom) mv.fire(mv, i);
      else { resolveHit(last && mv.last ? Object.assign({}, mv, { dmg: mv.last, knock: mv.lastKnock, hs: 0.07 }) : mv); if (last) ringFx(hero.position.x + Math.sin(hero.rotation.y) * 1.3, hero.position.z + Math.cos(hero.rotation.y) * 1.3, 0xffd970, 0.2, 2.2, 0.3); }
    }
  }
  if (mv.pierce && t < 0.62){
    const counter = counterT > 0;
    for (const e of enemies){
      if (!e.alive || e.spawnT > 0 || e.reach === false || dashHit.has(e)) continue;
      const ex = e.g.position.x - hero.position.x, ez = e.g.position.z - hero.position.z, d = Math.max(0.001, Math.hypot(ex, ez));
      if (d - e.r > 1.0 * cosRange(mv)) continue;
      dashHit.add(e);
      let [val, crit] = rollDamage(mv); if (counter){ val = Math.round(val * (crit ? 1.5 : 1.5 * critMul())); crit = true; }
      if (hitEnemy(e, val, crit, ex / d, ez / d, mv.knock * knockMul(), mv.meter, true, { src: 'melee' })) onStaffHits([e], mv);
      hitStop = Math.max(hitStop, 0.03);
      tB.set(e.g.position.x, 1, e.g.position.z); slashFx(tB, hero.rotation.y + Math.PI / 2, 0xd8fbff, 1.8);
    }
  }
  if (mv === MV.chSmash && meta.cos.weapon === 'baguette'){ const g = WEAPONS.baguette; g.scale.y = 1 + 2.6 * Math.max(0, Math.sin(Math.min(1, t * 1.25) * Math.PI)); }
}

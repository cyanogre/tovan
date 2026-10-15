'use strict';
/* ======================================================================
   v9 · SÚPER REPARTIDOR a puñetazos (con su música) y CRÍAS DE DRAGÓN
   ====================================================================== */

/* ---------- Súper Repartidor ---------- */
{ const u = UPGRADES.find(x => x.id === 'super');
  if (u) u.desc = 'Con combo 50 o más te transformas: pelo dorado, música propia, vas muchísimo más rápido y peleas a puñetazos con un +40 % de daño hasta que te golpeen.'; }
SONGS.superB = { comp: true, gain: 0.85, bassVol: 0.75, leadVol: 1.35, meter: 16, sd: 0.08, len: 16, root: 57, scale: SCALE.mixo, prog: [0, 6, 3, 4, 0, 6, 3, 4], lo: 3, hi: 12, start: 7, seed: 949,
  rhythm: R16f.concat(R16), lead: 'brass', leadOct: 12, harm: -2, harmIns: 'chip', arp: 'guitar', arpPat: 's.s.s.s.s.s.s.s.', arpOct: 0, bassPat: 'x.xox.xox.xox.xo', bassIns: 'sawBass', bassLen: 0.7,
  drums: { kick: 'x.x.x.x.x.x.x.x.', snare: '....x.......x.x.', hat: 'xxxxxxxxxxxxxxxx' }, crashEvery: 4, intro: 1, breakUp: true };
Object.assign(MV, {
  supA: { dur: 0.24, hit: 0.42, trail: [2, 2], lunge: [0.1, 0.5, 0.32], dmg: [12, 16], range: 2.25, cone: 0.2, meter: 3, knock: 1.6, keys: [[0, HOLD], [1, HOLD]], punch: 1, hs: 0.03 },
  supB: { dur: 0.24, hit: 0.42, trail: [2, 2], lunge: [0.1, 0.5, 0.32], dmg: [12, 16], range: 2.25, cone: 0.2, meter: 3, knock: 1.6, keys: [[0, HOLD], [1, HOLD]], punch: -1, hs: 0.03 },
  supC: { dur: 0.8, hit: 9, hits: [0.08, 0.15, 0.22, 0.29, 0.36, 0.43, 0.5, 0.68], trail: [2, 2], lunge: [0.05, 0.62, 0.9], dmg: [8, 11], last: [44, 56], range: 2.45, cone: 0.15, meter: 2, knock: 0.5, lastKnock: 6.5, hs: 0.015,
    keys: [[0, HOLD], [1, HOLD]], punch: 2 }
});
const SU9 = { on: false, n: 0 };
const SU_WORDS = ['¡PAM!', '¡TOMA!', '¡ZAS!', '¡PUM!', '¡BAM!', '¡DA!'];
const _setSuper9 = setSuper;
setSuper = function(on){
  if (on && MG.active) return;
  const was = superOn; _setSuper9(on); if (superOn === was) return;
  if (superOn){ musOverride('superB'); banner('¡SÚPER REPARTIDOR!<small>Puños de oro · mucho más rápido · música a tope</small>', 1.4); staffToBack();
    const hx = hero.position.x, hz = hero.position.z; for (let i = 0; i < 4; i++) later(i * 0.08, () => gring(hx, 0.1 + i * 0.45, hz, i % 2 ? 0xffffff : 0xffd23a, 0.4, 3.2 + i * 0.5, 0.5));
    pillar7(hx, hz, 0xffd23a, 0xffffff, 0.9, 0.9); shake = Math.max(shake, 0.35); }
  else musRelease();
};
const _weaponSeq9 = weaponSeq;
weaponSeq = function(){ return superOn ? ['supA', 'supB', 'supA', 'supB', 'supC'] : _weaponSeq9(); };
const _startMove9 = startMove;
startMove = function(name, idx){ if (superOn && name === 'flurry') name = 'supC'; _startMove9(name, idx); if (MV[name] && MV[name].punch){ staffToBack(); trailSamples.length = 0; } };
const _atkSpd9 = atkSpd; atkSpd = function(){ return _atkSpd9() * (superOn ? 1.55 : 1); };
const _cosSpd9 = cosSpd; cosSpd = function(){ return _cosSpd9() * (superOn ? 1.45 : 1); };
// postura: puños que salen disparados y guardia de boxeo
function superPose9(){
  if (!superOn || gameState !== 'play' || player.dead) return;
  const R_ = P.armR, L_ = P.armL;
  if (state === 'attack' && curMove && curMove.punch){
    const t = clamp(stepT / curMove.dur, 0, 1); let side, ext, upc = false;
    if (curMove.punch === 2){ if (t < 0.6){ const k = t / 0.6 * 7; side = Math.floor(k) % 2 ? -1 : 1; ext = Math.sin((k % 1) * Math.PI); } else { side = 1; ext = smooth(clamp((t - 0.6) / 0.08, 0, 1)); upc = true; } }
    else { side = curMove.punch; ext = t < 0.42 ? smooth(t / 0.42) : 1 - smooth((t - 0.42) / 0.58) * 0.85; }
    const A = side > 0 ? R_ : L_, Bk = side > 0 ? L_ : R_;
    A.sh.rotation.set(upc ? lerp(-0.5, -2.75, ext) : lerp(-0.55, -1.62, ext), 0, -side * lerp(0.35, 0.06, ext)); A.el.rotation.set(upc ? lerp(-1.9, -0.25, ext) : lerp(-1.95, -0.04, ext), 0, 0);
    Bk.sh.rotation.set(-0.85, 0, side * 0.38); Bk.el.rotation.set(-2.05, 0, 0);
    P.spine.rotation.y = -side * 0.42 * ext; P.neck.rotation.y = side * 0.3 * ext;
    if (upc){ P.spine.rotation.x = -0.25 * ext; }
  } else if (state === 'normal' && grounded){
    const w = 1 - walkW * 0.7;
    for (const [A, s] of [[R_, 1], [L_, -1]]){ bl(A.sh.rotation, 'x', -0.85 + Math.sin(time * 6 + s) * 0.06, w); bl(A.sh.rotation, 'z', -s * 0.38, w); bl(A.el.rotation, 'x', -2.0, w); }
  }
}
const _legendPose9 = legendPose;
legendPose = function(){ _legendPose9(); try { superPose9(); } catch (err) { console.error(err); } };
function super9(dt){
  const on = superOn && gameState === 'play' && !invActive && !player.dead;
  if (on !== SU9.on){ SU9.on = on; if (!on) staff.visible = true; }
  if (!on || dt <= 0) return;
  staff.visible = state === 'charge';
  rightHand7(t7a); leftHand7(t7b);
  for (const v of [t7a, t7b]) for (let k = 0; k < 2; k++) pa(v.x + (rnd() - 0.5) * 0.18, v.y + (rnd() - 0.5) * 0.18, v.z + (rnd() - 0.5) * 0.18, (rnd() - 0.5) * 0.6, 0.9, (rnd() - 0.5) * 0.6, rnd() < 0.5 ? 0xffd23a : 0xfff6c0, 0.17, 0.25, -1, 0, 0.3, SH7.dot);
  if (state === 'attack' && curMove && curMove.punch){
    const t = stepT / curMove.dur, side = curMove.punch === 2 ? (t > 0.6 ? 1 : (Math.floor(t / 0.6 * 7) % 2 ? -1 : 1)) : curMove.punch;
    const A = side > 0 ? P.armR : P.armL, f = side > 0 ? t7a : t7b; A.sh.getWorldPosition(t7c);
    streak7((t7c.x + f.x) / 2, (t7c.y + f.y) / 2, (t7c.z + f.z) / 2, f.x - t7c.x, f.y - t7c.y, f.z - t7c.z, Math.max(0.2, t7c.distanceTo(f)), 0xffe070, 0.08, 0.06);
    pa(f.x, f.y, f.z, 0, 0, 0, 0xffffff, 0.45, 0.07, 0, 0, 1.3, SH7.star); }
  // estela dorada al moverse rapidísimo
  if (walkW > 0.4){ const f = heading, bx = -Math.sin(f), bz = -Math.cos(f); if (rnd() < 0.8) streak7(hero.position.x + bx * 0.5 + (rnd() - 0.5) * 0.6, 0.3 + rnd() * 1.5, hero.position.z + bz * 0.5 + (rnd() - 0.5) * 0.6, bx, 0, bz, 0.9 + rnd() * 0.6, rnd() < 0.5 ? 0xffd23a : 0xffffff, 0.16, 0.03, 6);
    if (rnd() < 0.4) pa(hero.position.x, 0.08, hero.position.z, bx * 2, 0.6, bz * 2, 0xffd23a, 0.15, 0.4, 0, 1, 0.2, SH7.star); }
}
const _hitEnemySU9 = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  const ok = _hitEnemySU9(e, val, crit, nx, nz, knock, meterGain, melee, o);
  if (ok && superOn && (o.src || (melee ? 'melee' : '')) === 'melee') try {
    const x = e.g.position.x, y = 0.9 * (e.scale || 1), z = e.g.position.z, a = angTo(hero.position.x, hero.position.z, x, z);
    gring(x - Math.sin(a) * 0.3, y, z - Math.cos(a) * 0.3, 0xffd23a, 0.2, 1.4, 0.22, a); burst7(PA7, x, y, z, 10, [0xffd23a, 0xffffff, 0xff8a3a], 6, 0.17, 0.3, 2, 2, 0, SH7.star);
    if (++SU9.n % 3 === 0) shout7(SU_WORDS[Math.floor(rnd() * SU_WORDS.length)], '#ffe24a', x, (e.numY || 2) + 0.4, z);
    shake = Math.max(shake, 0.12);
  } catch (err) { console.error(err); }
  return ok;
};

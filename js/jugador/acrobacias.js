'use strict';
/* ---------- Acrobacias ---------- */
function startFlip12(ax, dir, dur){ AC12.flipAx = ax; AC12.flipDir = dir; AC12.flipT0 = time; AC12.flipDur = dur; }
const _doJump12 = doJump;
doJump = function(){
  if (invActive || (typeof mgOverlay === 'function' && mgOverlay())) return _doJump12();
  if (state === 'roll' && grounded && rollT > 0.05 && canAct()){ longJump12(); return; }        // voltereta + salto = salto largo
  const g0 = grounded, skid = MOV11.skidT > 0, sp = Math.hypot(MOV11.vx, MOV11.vz);
  _doJump12();
  if (!(g0 && !grounded)) return;
  if (skid){                                                                                        // cambio de sentido + salto = mortal lateral
    vy *= 1.32; AC12.chain = 0; startFlip12('z', rnd() < 0.5 ? 1 : -1, 0.55); stat('flips'); shoutHero7('¡Mortal!', '#9fe8ff', 2.9);
    gring(hero.position.x, 0.1, hero.position.z, 0x9fe8ff, 0.3, 1.8, 0.3); if ((meta.stats.flips || 0) >= 10) unlock('acroFlip'); return; }
  if (AC12.landT < 0.28 && sp > 2.3 && AC12.chain > 0){                                            // saltos encadenados al aterrizar
    AC12.chain++;
    if (AC12.chain === 2){ vy *= 1.16; shoutHero7('¡Hop!', '#ffe9b0', 2.8); }
    else { vy *= 1.42; AC12.chain = 0; startFlip12('x', 1, 0.6); stat('triples'); shoutHero7('¡Ya-hu!', '#ffd23a', 3.0); play('superOn'); unlock('acroTriple');
      for (let i = 0; i < 3; i++) later(i * 0.07, () => gring(hero.position.x, 0.1, hero.position.z, i % 2 ? 0xffffff : 0xffd23a, 0.3, 2.2 + i * 0.4, 0.35)); }
  } else AC12.chain = 1;
};
function longJump12(){
  state = 'normal'; P.body.rotation.x = 0; P.body.scale.setScalar(1);
  grounded = false; vy = 6.3 * jumpMul(); AC12.lj = true; AC12.chain = 0;
  MOV11.vx = Math.sin(rollDir) * 8.8; MOV11.vz = Math.cos(rollDir) * 8.8; heading = rollDir; hero.rotation.y = rollDir; MOV11.sqv += 2.2;
  play('jump'); stat('longjumps'); shoutHero7('¡Salto largo!', '#ffe9b0', 2.9); if ((meta.stats.longjumps || 0) >= 10) unlock('acroLong');
  for (let i = 0; i < 8; i++){ const a = rnd() * TAU; pa(hero.position.x, 0.1, hero.position.z, Math.cos(a) * 2, 0.6, Math.sin(a) * 2, 0xd8cfc0, 0.16, 0.4, 1, 2, 1.6, SH7.dot, 0.7); }
}
const _doRoll12 = doRoll;
doRoll = function(){                                                                               // en el aire: impulso aéreo (una vez por salto)
  if (!grounded && !invActive && !(typeof mgOverlay === 'function' && mgOverlay()) && state === 'normal' && canAct() && !AC12.airDash && !umb){
    AC12.airDash = true; AC12.lj = true; const a = inputMag > 0.12 ? inputHeading : hero.rotation.y;
    MOV11.vx = Math.sin(a) * 9.2; MOV11.vz = Math.cos(a) * 9.2; vy = Math.max(vy, 3.2); heading = a; hero.rotation.y = a;
    startFlip12('y', 1, 0.35); play('roll'); stat('airdash');
    for (let i = 0; i < 6; i++) streak7(hero.position.x, hero.position.y + 0.4 + rnd(), hero.position.z, -Math.sin(a), 0, -Math.cos(a), 1.2, rnd() < 0.5 ? 0xffffff : 0x9fe8ff, 0.2, 0.04, 2);
    return; }
  _doRoll12();
};
function acro12(dt){
  if (grounded && !AC12.wasG){ AC12.landT = 0; AC12.lj = false; AC12.airDash = false; if (AC12.flipAx){ AC12.flipAx = null; P.body.rotation.x = 0; P.body.rotation.y = 0; } }
  if (grounded){ AC12.landT += dt; if (AC12.landT > 0.28 && AC12.chain > 0 && Math.hypot(MOV11.vx, MOV11.vz) < 0.5) AC12.chain = 0; }
  AC12.wasG = grounded;
  if (AC12.lj && !grounded && rnd() < 0.6) pa(hero.position.x, hero.position.y + 0.8, hero.position.z, 0, 0, 0, 0xffffff, 0.2, 0.25, 0, 0, 0.3, SH7.dot, 0.6);
}
function acroPose12(){
  if (!AC12.flipAx || state === 'roll' || state === 'dead') return;
  const p = clamp((time - AC12.flipT0) / AC12.flipDur, 0, 1), ang = smooth(p) * TAU * AC12.flipDir;
  if (AC12.flipAx === 'x') P.body.rotation.x = -ang; else if (AC12.flipAx === 'z') P.body.rotation.z = ang; else P.body.rotation.y = ang;
  if (p >= 1){ P.body.rotation.x = 0; P.body.rotation.y = 0; AC12.flipAx = null; }
  if (AC12.lj && AC12.flipAx !== 'x' && !grounded) P.spine.rotation.x += 0.45;          // postura de salto largo
}
const _legendPose12 = legendPose;
legendPose = function(){ _legendPose12(); try { acroPose12(); } catch (err) { console.error(err); } };

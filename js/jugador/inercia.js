'use strict';
/* ======================================================================
   Movimiento con inercia, squash & stretch, derrapes y salto con buffer
   ====================================================================== */
var MOV11 = { vx: 0, vz: 0, buf: 0, held: false, cut: false, jt: 9, sq: 0, sqv: 0, lean: 0, bank: 0, lastRot: 0, pvx: 0, pvz: 0, skidT: 0, wasG: true, airVy: 0, lastPhase: 0, wasRoll: false };
function mov11(tx, tz, dt, moving){
  const M = MOV11; if (dt <= 0) return; if (invActive){ M.vx = M.vz = 0; return; }
  const free = state === 'normal' || state === 'charge';
  if (!free){ const k = Math.exp(-dt * 14); M.vx *= k; M.vz *= k; }
  else {
    const sp = Math.hypot(M.vx, M.vz), tsp = Math.hypot(tx, tz); let acc;
    if (!grounded && typeof AC12 !== 'undefined' && AC12 && AC12.lj) acc = moving ? 3 : 1.5;
    else if (!moving) acc = grounded ? 22 : 7;
    else { const dot = sp > 0.01 && tsp > 0.01 ? (M.vx * tx + M.vz * tz) / (sp * tsp) : 1;
      acc = (grounded ? 28 : 12) * (dot < -0.2 ? 1.9 : 1);
      if (grounded && dot < -0.3 && sp > 2.4 && M.skidT <= 0) skid11(); }
    const ddx = tx - M.vx, ddz = tz - M.vz, dl = Math.hypot(ddx, ddz), step = Math.min(dl, acc * dt);
    if (dl > 1e-4){ M.vx += ddx / dl * step; M.vz += ddz / dl * step; }
  }
  hero.position.x += M.vx * dt; hero.position.z += M.vz * dt;
}
function skid11(){ const M = MOV11; M.skidT = 0.28; play('roll');
  for (let i = 0; i < 8; i++) pa(hero.position.x + (rnd() - 0.5) * 0.4, 0.1, hero.position.z + (rnd() - 0.5) * 0.4, M.vx * 0.4 + (rnd() - 0.5) * 2, 0.8 + rnd(), M.vz * 0.4 + (rnd() - 0.5) * 2, rnd() < 0.5 ? 0xd8cfc0 : 0xb8ae9c, 0.16, 0.45, 2, 2, 1.6, SH7.dot, 0.7); }
function dust11(n, sp, s){ for (let i = 0; i < n; i++){ const a = rnd() * TAU; pa(hero.position.x + Math.cos(a) * 0.25, 0.08, hero.position.z + Math.sin(a) * 0.25, Math.cos(a) * sp, 0.4 + rnd() * 0.6, Math.sin(a) * sp, rnd() < 0.5 ? 0xd8cfc0 : 0xb8ae9c, s, 0.4, 1, 2.5, 1.8, SH7.dot, 0.65); } }
const _doJump11 = doJump;
doJump = function(){
  const g0 = grounded, vy0 = vy; _doJump11();
  if (invActive) return;
  if (!grounded && vy !== vy0){ const M = MOV11; M.held = !!keys.Space; M.cut = false; M.jt = 0; M.sqv += g0 ? 2.8 : 1.8; M.buf = 0; if (g0){ dust11(6, 2.2, 0.16); } }
  else if (!g0 && vy === vy0 && canAct()) MOV11.buf = 0.15;               // salto «guardado»: si pulsas justo antes de caer, salta al tocar el suelo
};
function juice11(dt){
  const M = MOV11; if (dt <= 0 || gameState !== 'play') return;
  if (M.skidT > 0) M.skidT -= dt;
  // salto: gravedad más viva al caer, un pelín de flote en lo alto y salto corto si sueltas el botón
  // un rebote (pogo), un picado, el paraguas o un salto largo ya no es «tu» salto: nunca se recorta
  if (!grounded && (state !== 'normal' || umb || (typeof AC12 !== 'undefined' && AC12 && AC12.lj) || vy > 8.2)) M.cut = true;
  if (!grounded && state === 'normal' && !umb){ M.jt += dt;
    if (vy < 0) vy -= 22 * 0.45 * dt; else if (vy < 1.6) vy += 22 * 0.3 * dt;
    if (M.held && !M.cut && !keys.Space && vy > 2.5 && M.jt < 0.4 && hero.position.y > 0.6){ M.cut = true; vy *= 0.62; } }
  if (!grounded) M.airVy = vy;
  if (M.buf > 0){ M.buf -= dt; if (grounded && state === 'normal' && canAct()){ M.buf = 0; doJump(); } }
  // aterrizaje: aplastamiento según la caída, polvo
  if (grounded && !M.wasG){ const f = Math.min(1.6, Math.abs(M.airVy) / 9); M.sqv -= 2.2 + 2.4 * f; dust11(6 + Math.round(6 * f), 1.8 + 1.5 * f, 0.18); if (f > 0.9) shake = Math.max(shake, 0.12); }
  M.wasG = grounded;
  // fin de voltereta: conserva algo de impulso
  if (M.wasRoll && state !== 'roll' && !(typeof AC12 !== 'undefined' && AC12 && AC12.lj)){ M.vx = Math.sin(rollDir) * 2.6; M.vz = Math.cos(rollDir) * 2.6; }
  M.wasRoll = state === 'roll';
  // muelle del squash & stretch
  M.sqv += (-300 * M.sq - 16 * M.sqv) * dt; M.sq = clamp(M.sq + M.sqv * dt, -0.32, 0.3);
  // inclinación por aceleración y giro
  const ax = (M.vx - M.pvx) / dt, az = (M.vz - M.pvz) / dt; M.pvx = M.vx; M.pvz = M.vz;
  const fwd = ax * Math.sin(hero.rotation.y) + az * Math.cos(hero.rotation.y);
  M.lean = lerp(M.lean, clamp(fwd * 0.012, -0.3, 0.3), 1 - Math.exp(-dt * 10));
  let dr = hero.rotation.y - M.lastRot; while (dr > Math.PI) dr -= TAU; while (dr < -Math.PI) dr += TAU; M.lastRot = hero.rotation.y;
  const sp = Math.hypot(M.vx, M.vz);
  M.bank = lerp(M.bank, clamp(-dr / dt * 0.035 * Math.min(1, sp / 3), -0.3, 0.3), 1 - Math.exp(-dt * 8));
  // polvo al correr, en cada pisada
  if (grounded && sp > 2.6 && state === 'normal'){ const st = Math.floor(phase / Math.PI); if (st !== M.lastPhase){ M.lastPhase = st; dust11(2, 0.6, 0.12); } }
}
function juicePose11(){
  const M = MOV11; if (gameState !== 'play' && gameState !== 'upgrade') return;
  if (state !== 'roll' && state !== 'dead' && !invActive){
    const air = !grounded ? clamp(Math.abs(vy) * 0.01, 0, 0.07) : 0, s = M.sq + air;
    P.body.scale.set(1 - s * 0.55, 1 + s, 1 - s * 0.55);
    P.body.rotation.z = M.bank;
  }
  if (state === 'normal'){ P.spine.rotation.x += M.lean + (M.skidT > 0 ? -0.35 * (M.skidT / 0.28) : 0); }
}
const _legendPose11 = legendPose;
legendPose = function(){ _legendPose11(); try { juicePose11(); } catch (err) { console.error(err); } };
const _startRun11 = startRun;
startRun = function(){ Object.assign(MOV11, { vx: 0, vz: 0, buf: 0, sq: 0, sqv: 0, lean: 0, bank: 0, pvx: 0, pvz: 0, skidT: 0, wasG: true, wasRoll: false }); _startRun11(); };
const _v3Update11 = v3Update;
v3Update = function(dt, pdt, playing){ _v3Update11(dt, pdt, playing); if (playing) try { juice11(pdt); } catch (err) { console.error(err); } };

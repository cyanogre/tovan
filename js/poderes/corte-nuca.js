'use strict';
/* ======================================================================
   CORTE DE NUCA (rehecho, 2026-10): equipo de maniobras tridimensionales
   Antes solo alargaba la voltereta y cortaba lo que atravesaba rodando,
   casi sin verse. Ahora, al rodar con un enemigo cerca (y hacia donde
   apuntas, si apuntas), Tovan le clava los dos ganchos, sale propulsado
   por el aire con el gas silbando, gira y, al pasarle por encima, le raja
   la nuca con dos hojas: tajo en X, sangre, vapor, parón y rótulo.
   Aterriza detrás. Recarga 5 s (4 y 3 si la repites); mientras, ruedas
   normal. Sin enemigo a tiro, también ruedas normal (sigue siendo esquiva).
   - Va en estado 'roll' con rollT fijo en la ventana de esquiva: es
     intocable durante la maniobra y main.js no la da por terminada; la
     posición la pone nucaTick después del movimiento de main.js.
   - Los cables son wires7 (accesorios-anim.js) desde las boquillas del
     equipo (ACC7.titan); el tajo, cintas 'rayo' de foil.js.
   ====================================================================== */
const NUCA = { cd: 0, m: null, hojas: null }, NUCA_R = 9, NUCA_GANCHO = 0.12, NUCA_VUELO = 0.62, NUCA_FIN = 0.82;
const NUCA_COL = [0xffffff, 0x6ac8ff, 0xffffff, 0], NUCA_COL2 = [0xffffff, 0xff1a2e, 0xffffff, 0];
const nucaRecarga = () => Math.max(2.5, 5 - 1 * (lvl('titan') - 1));
{ const u = UPGRADES.find(x => x.id === 'titan'); if (u){ u.desc = 'Equipo de maniobras: al rodar con un enemigo a tiro, le clavas los ganchos, sales propulsado girando por el aire y le rajas la nuca (mucho daño, 50 % de crítico). Recarga 5 s; mientras, ruedas normal.'; u.stk = 'recarga 1 s antes y corta un 25 % más'; } }
Object.assign(SFX, {
  nucaGancho: () => { tone({ type: 'square', f0: 2400, f1: 1800, dur: 0.04, vol: 0.06 }); noise({ dur: 0.18, vol: 0.12, f0: 3000, f1: 900, type: 'bandpass', q: 1.2 }); },
  nucaGas: () => { noise({ dur: 0.5, vol: 0.16, f0: 5000, f1: 2500, type: 'highpass', q: 0.6, rv: 0.2 }); },
  nucaTajo: () => { noise({ dur: 0.22, vol: 0.32, f0: 7000, f1: 2500, type: 'highpass', q: 0.9, rv: 0.3 }); tone({ type: 'triangle', f0: 2600, f1: 1400, dur: 0.35, vol: 0.09, rv: 0.4 }); tone({ type: 'sawtooth', f0: 160, f1: 60, dur: 0.25, vol: 0.12 }); }
});

function nucaPuede(){
  return lvl('titan') > 0 && NUCA.cd <= 0 && !NUCA.m && gameState === 'play' && !invActive && !COL.on && canAct() && grounded
    && state !== 'roll' && state !== 'tech' && !(state === 'attack' && curMove && curMove.special);
}
function nucaBlanco(){   // el más cercano; si apuntas, el más cercano en esa dirección; prefiere los grandes
  const hx = hero.position.x, hz = hero.position.z, dir = inputMag > 0.12 ? inputHeading : null; let best = null, bs = 1e9;
  for (const e of enemies){
    if (!e.alive || e.spawnT > 0 || e.colEscama || e.type === 'puesto' || e.dying > 0) continue;
    const dx = e.g.position.x - hx, dz = e.g.position.z - hz, d = Math.hypot(dx, dz); if (d - e.r > NUCA_R || d < 0.5) continue;
    let s = d; if (dir !== null){ let da = Math.atan2(dx, dz) - dir; da = Math.abs(Math.atan2(Math.sin(da), Math.cos(da))); if (da > 1.15) continue; s += da * 3; }
    if (e.isBoss || e.heavy || e.cap) s -= 1.5;
    if (s < bs){ bs = s; best = e; } }
  return best;
}
function nucaHojas(on){   // dos hojas de acero en las manos durante la maniobra
  if (!NUCA.hojas){ const mat = makeMat(0xe8f0f8, { emissive: 0.35 }), mg = makeMat(0x3a3f4a);
    NUCA.hojas = [P.armL, P.armR].map(A => { const g = new THREE.Group(); g.position.y = -0.3; A.hand.add(g);
      mesh(B(0.07, 0.16, 0.07), mg, 0, -0.02, 0, g); mesh(B(0.05, 1.05, 0.012), mat, 0, -0.62, 0.02, g); g.visible = false; return g; }); }
  for (const g of NUCA.hojas) g.visible = on;
}
function nucaFin(M){   // el destino: detrás del enemigo, en la línea de vuelo (y dentro de la arena)
  const e = M.e, dx = e.g.position.x - M.S.x, dz = e.g.position.z - M.S.z, d = Math.max(0.01, Math.hypot(dx, dz)), ux = dx / d, uz = dz / d;
  let ex = e.g.position.x + ux * (e.r + 1.5), ez = e.g.position.z + uz * (e.r + 1.5); const rr = Math.hypot(ex, ez), lim = ARENA * 0.93;
  if (rr > lim){ ex *= lim / rr; ez *= lim / rr; }
  M.E.set(ex, 0, ez); M.f = Math.atan2(dx, dz); M.wNuca = d / Math.max(0.01, Math.hypot(ex - M.S.x, ez - M.S.z));
}
function nucaEmpieza(e){
  const M = NUCA.m = { e, t: 0, S: hero.position.clone(), E: new V3(), f: 0, wNuca: 0.75, nucaY: Math.max(1.1, (e.numY || 2) * 0.8 * (e.scale > 2 ? 0.8 : 1)), cortado: false, gas: false };
  nucaFin(M); NUCA.cd = nucaRecarga();
  comboT = 0; state = 'roll'; rollT = 0.1; rollDir = heading = hero.rotation.y = M.f; attackW = 0; trailAlpha = 0; staffToBack(); onRollStart();
  play('nucaGancho'); nucaHojas(true);
  barkOnce('nuca', '¡Ganchos dentro! Rodar cerca de un enemigo te lanza a por su nuca. Luego tarda un poco en recargar el gas.');
}
const _doRollNuca = doRoll;
doRoll = function(){ if (nucaPuede()){ const e = nucaBlanco(); if (e){ nucaEmpieza(e); return; } } _doRollNuca(); };
// mientras vuela no se ataca ni se salta (el gancho manda)
const _doAttackNuca = doAttack, _doJumpNuca = doJump, _doSpecialNuca = doSpecial;
doAttack = function(...a){ if (!NUCA.m) return _doAttackNuca(...a); };
doJump = function(...a){ if (!NUCA.m) return _doJumpNuca(...a); };
doSpecial = function(...a){ if (!NUCA.m) return _doSpecialNuca(...a); };

function nucaTajo(M){
  M.cortado = true; const e = M.e; if (!e.alive) return;
  const x = e.g.position.x, z = e.g.position.z, y = M.nucaY, lv = lvl('titan'), c = rnd() < 0.5 + up.crit;
  const dmg = Math.round(rdmg(62) * (1 + 0.25 * (lv - 1)) * (c ? critMul() : 1));
  hitEnemy(e, dmg, c, Math.sin(M.f), Math.cos(M.f), 3, 6, true, { src: 'melee' });
  hitStop = Math.max(hitStop, 0.13); shake = Math.max(shake, 0.55); flash('#ffffff', 0.18); play('nucaTajo');
  // tajo en X a la altura de la nuca, cruzado respecto a la línea de vuelo
  const Rr = Math.max(1.2, e.r * 1.7), sx = Math.cos(M.f), sz = -Math.sin(M.f), fx = Math.sin(M.f), fz = Math.cos(M.f);
  [[1, NUCA_COL], [-1, NUCA_COL2]].forEach(([s, cols], i) => {
    const cin = tintaCoge(cols, 1, 'rayo'), O = new V3(x, y, z);
    const P = (q, v) => { const w = q * 2 - 1, b = Math.sin(q * Math.PI); return v.set(O.x + sx * w * Rr + fx * b * 0.35 * Rr, O.y + s * w * 0.55 * Rr + b * 0.2 * Rr, O.z + sz * w * Rr + fz * b * 0.35 * Rr); };
    foilFx.push({ t: -i * 0.05, cintas: [cin], upd(){ if (this.t < 0){ cin.m.visible = false; return true; } const k = Math.min(1, this.t / 0.06), tail = Math.max(0, (this.t - 0.1) / 0.5); if (tail >= 1) return false;
        cin.m.visible = true; tintaPinta(cin, P, Math.min(tail, k * 0.98), k, q => 0.8 * Rr * Math.sin(Math.min(1, q) * Math.PI) * (0.35 + 0.65 * q));
        cin.mat.uniforms.uAlpha.value = 1 - Math.max(0, tail - 0.3) / 0.7; return true; } });
  });
  slashFx(tB.set(x, y, z), M.f + Math.PI / 2, 0xffffff, 2.6 * Math.max(1, e.r));
  for (let i = 0; i < 28; i++){ const a = rnd() * TAU, s = 2 + rnd() * 5; spawnFx(x + fx * 0.3, y, z + fz * 0.3, Math.cos(a) * s * 0.6 + fx * 3, 1 + rnd() * 5, Math.sin(a) * s * 0.6 + fz * 3, rnd() < 0.7 ? 0xc0101e : 0x6a0010, 0.1 + rnd() * 0.08, 0.6, 12, 0); }
  for (let i = 0; i < 12; i++) pn(x + (rnd() - 0.5) * Rr, y + 0.2 + rnd() * 0.5, z + (rnd() - 0.5) * Rr, (rnd() - 0.5) * 1.2, 1.4 + rnd() * 2, (rnd() - 0.5) * 1.2, rnd() < 0.8 ? 0xf2f2f2 : 0xffd8d8, 0.16 + rnd() * 0.14, 0.9 + rnd() * 0.5, -0.4, 1, 1.6, SH7.dot, 0.4);   // vapor (los titanes echan vapor)
  shout7(c ? '¡CORTE DE NUCA!' : '¡NUCA!', c ? '#ffffff' : '#ffd8de', x, y + 1.5, z);
}

function nucaCables(M, k){   // k: 0 = recogidos, 1 = clavados en el enemigo
  const e = M.e, ex = e.g.position.x, ez = e.g.position.z, sx = Math.cos(M.f) * Math.max(0.35, e.r * 0.6), sz = -Math.sin(M.f) * Math.max(0.35, e.r * 0.6), ay = M.nucaY;
  const noz = ACC7.titan && ACC7.titan.userData.noz;
  [-1, 1].forEach((s, i) => { const w = wires7[i]; if (k <= 0.01){ w.visible = false; return; }
    if (noz) noz[i].getWorldPosition(t7a); else t7a.set(hero.position.x, hero.position.y + 0.9, hero.position.z);
    const bx = ex + sx * s, bz = ez + sz * s; w.visible = true;
    line7(w, t7a.x, t7a.y, t7a.z, lerp(t7a.x, bx, k), lerp(t7a.y, ay, k), lerp(t7a.z, bz, k), 0.03);
    if (M.t > NUCA_GANCHO && M.t < NUCA_VUELO && rnd() < 0.8) pn(t7a.x, t7a.y, t7a.z, -Math.sin(M.f) * 2 + (rnd() - 0.5), 0.2, -Math.cos(M.f) * 2 + (rnd() - 0.5), 0xffffff, 0.2, 0.45, 0, 1, 2.6, SH7.dot, 0.7); });   // gas
}
function nucaTick(dt, pdt, playing){
  if (NUCA.cd > 0 && playing) NUCA.cd -= pdt;
  const M = NUCA.m; if (!M) return;
  if (player.dead || (gameState !== 'play' && gameState !== 'paused')){ nucaAcaba(M); return; }   // (cinemática, cartas, fin…)
  if (!playing) return;
  M.t += pdt; state = 'roll'; rollT = 0.1; grounded = true; vy = 0;
  if (!M.cortado && M.e.alive) nucaFin(M);
  const u = clamp((M.t - NUCA_GANCHO) / (NUCA_VUELO - NUCA_GANCHO), 0, 1), w = u * u * (3 - 2 * u);
  if (M.t < NUCA_GANCHO){ const k = M.t / NUCA_GANCHO; nucaCables(M, k); hero.position.set(M.S.x, 0, M.S.z); }
  else if (M.t < NUCA_VUELO){
    if (!M.gas){ M.gas = true; play('nucaGas'); }
    hero.position.set(lerp(M.S.x, M.E.x, w), Math.max(0.75, M.nucaY - 0.5) * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.95)), 0.7), lerp(M.S.z, M.E.z, w));   // las manos pasan a la altura de la nuca
    nucaCables(M, M.cortado ? Math.max(0, 1 - (u - M.uCorte) * 5) : 1);
    if (!M.cortado && w >= M.wNuca - 0.04){ M.uCorte = u; nucaTajo(M); }
    if (rnd() < 0.7) streak7(hero.position.x, hero.position.y + 0.8, hero.position.z, -Math.sin(M.f), 0, -Math.cos(M.f), 1.2, 0xe8f4ff, 0.18, 0.04);
  } else {
    if (!M.cortado) nucaTajo(M);
    const k = clamp((M.t - NUCA_VUELO) / (NUCA_FIN - NUCA_VUELO), 0, 1); nucaCables(M, 0);
    hero.position.set(M.E.x, Math.max(0, hero.position.y - pdt * 9), M.E.z);
    if (k >= 1) nucaAcaba(M);
  }
}
function nucaAcaba(M){
  NUCA.m = null; nucaHojas(false); wires7.forEach(w => { w.visible = false; }); hero.position.y = 0; grounded = true; vy = 0;
  P.body.rotation.set(0, 0, 0); P.body.scale.setScalar(1); if (player.dead) return;
  if (state === 'roll') state = 'normal'; if (gameState === 'play'){ puff(4); play('land'); }
}
// pose: tumbado hacia delante, girando como una peonza y con las hojas abiertas
const _legendPoseNuca = legendPose;
legendPose = function(){ _legendPoseNuca(); const M = NUCA.m; if (!M) return;
  const u = clamp((M.t - NUCA_GANCHO) / (NUCA_VUELO - NUCA_GANCHO), 0, 1);
  P.body.scale.setScalar(1);
  if (M.t < NUCA_GANCHO){ P.body.rotation.set(0.25, 0, 0); }
  else if (M.t < NUCA_VUELO){ P.body.rotation.set(-0.55 * Math.sin(Math.PI * u), smooth(u) * TAU * 2, 0); }
  else P.body.rotation.set(0, 0, 0);
  P.armL.sh.rotation.set(0.5, 0, -1.25); P.armR.sh.rotation.set(0.5, 0, 1.25); P.armL.el.rotation.set(-0.4, 0, 0); P.armR.el.rotation.set(-0.4, 0, 0); };
const _v3UpdateNuca = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateNuca(dt, pdt, playing); try { nucaTick(dt, pdt, playing); } catch (err) { console.error(err); } };
const _clearWorldNuca = clearWorld;
clearWorld = function(){ if (NUCA.m) nucaAcaba(NUCA.m); NUCA.cd = 0; _clearWorldNuca(); };

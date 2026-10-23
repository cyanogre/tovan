'use strict';
/* ======================================================================
   TRÁILER DE JUEGO (menú de título → «Jugabilidad»): ~45 s de partida de
   verdad, casi sin texto y con fundidos a negro entre planos. Tovan se
   mueve con los mismos controles que el jugador (joystick y botones que
   pulsa un piloto en cada plano) y los poderes salen mientras corre:
   parkur por las ruinas (muro, salto triple, trampolín y picado), esquiva
   en cámara lenta y contraataque, corte de nuca, el dragón de agua y su
   corriente, mil pájaros y el puño de fuego. La cámara es la de juego
   (atenúa lo que tapa), colocada por fuera del grupo en cada plano.
   Usa los rótulos y la limpieza del tráiler de siempre (trailer.js) y se
   graba igual (trailer_video.js, con «runTrailerJuego»).
   ====================================================================== */
const TJ = { on: false, pil: null, t: 0, giro: 0, cam0: null };
const _tjV = new V3(), _tjW = new V3();
// joystick hacia una dirección del mundo (como lo haría el jugador con la cámara en camYaw)
function tjJoy(wx, wz){
  const L = Math.hypot(wx, wz); if (L < 1e-3){ joy.x = joy.y = 0; return; } wx /= L; wz /= L;
  const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = -fz, rz = fx; joy.x = wx * rx + wz * rz; joy.y = -(wx * fx + wz * fz);
}
const tjHacia = (x, z) => tjJoy(x - hero.position.x, z - hero.position.z);
const tjSuelta = () => { joy.x = joy.y = 0; };
// cámara de juego (la de siempre, que ya atenúa lo que tapa a Tovan): rumbo, distancia, inclinación y giro lento
function tjCam(yaw, dist, pitch, giro = 0){
  csShot(null); camYaw = yaw; camDist = dist; camPitch = pitch; TJ.giro = giro;
  camTarget.set(hero.position.x, 1.1 + hero.position.y * 0.5, hero.position.z);
}
// gira la cámara poco a poco hacia un rumbo
const tjCamHacia = (yaw, dt, k = 1.5) => { let d = yaw - camYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); camYaw += d * (1 - Math.exp(-dt * k)); };
function tjEnemigo(tipo, x, z, vel = 1){ const e = spawnEnemy(tipo, [x, z]); if (e){ e.spawnT = 0; e.g.scale.setScalar(e.scale); e.speed *= vel; e.g.position.set(x, 0, z); } return e; }
function tjPrepara(bioma, grande){
  clearWorld(); applyBiome(bioma); mpPonTam(!!grande); queue.length = 0; clearT = 0; wave = 4;
  Object.assign(player, { hp: 99999, maxHp: 99999, dead: false }); player.inv = 0; player.meter = 0; state = 'normal'; grounded = true; vy = 0;
  MOV11.vx = MOV11.vz = 0; Object.assign(AC12, { flipAx: null, chain: 0, landT: 9, lj: false, airDash: false }); P.body.rotation.set(0, 0, 0);
  gameState = 'play'; camYaw = 0; tjSuelta(); FOIL.danza = 0;
}
// un plano: prepara, sale del negro, deja que el piloto juegue dur segundos y vuelve al negro
async function tjPlano(dur, prepara){
  TJ.pil = null; await tNegro(1, 0.22); TJ.giro = 0; prepara(); TJ.t = 0;
  cs.tick = dt => { TJ.t += dt; camYaw += TJ.giro * dt; if (TJ.pil) try { TJ.pil(TJ.t, dt); } catch (err) { console.error(err); } };
  tNegro(0, 0.22); await csWait(dur); TJ.pil = null; tjSuelta();
}
const tjMira = (x, z) => { heading = Math.atan2(x - hero.position.x, z - hero.position.z); hero.rotation.y = heading; };

async function trailerJuegoScript(){
  const H = hero.position;
  document.body.classList.add('trailer'); trl.hidden = false; trlNegro.style.opacity = '1';
  setSong('battle'); applyMusVol(); await csWait(0.3);

  // ── 1. Parkur por las ruinas: muro bajo, salto triple, trampolín y picado sobre el grupo ──
  await tjPlano(8.4, () => {
    tjPrepara(0, true); H.set(-10.5, 0, 0.6); heading = Math.PI / 2; hero.rotation.y = heading;
    for (const [x, z] of [[14.2, -1.4], [15.0, 1.2], [13.6, 0.3], [15.8, -0.1]]) tjEnemigo(rnd() < 0.5 ? 'imp' : 'oni', x, z, 0.15);
    tjCam(-0.55, 7.2, 0.32, 0.09);
    let paso = 0;
    TJ.pil = (t) => {
      if (paso < 9) tjJoy(1, -0.03 * (H.z - 0.2));
      if (paso === 0 && H.x > -7.7){ doJump(); paso = 1; }                                   // salta el muro bajo
      if (paso === 1 && H.x > -4.6 && grounded){ doJump(); paso = 2; }                       // salto triple: hop…
      if ((paso === 2 || paso === 3) && grounded && AC12.landT < 0.08 && AC12.landT > 0){ doJump(); paso++; }
      if (paso === 4 && grounded && H.x > 5){ paso = 5; }                                    // …al trampolín
      if (paso >= 5 && paso < 9) tjHacia(9.4, 0);
      if (paso === 5 && !grounded && vy > 9){ paso = 6; TJ.giro = 0; }
      if (paso >= 6 && paso < 9) tjJoy(1, 0);
      if (paso === 6 && !grounded && vy < -2 && H.x > 11){ tjSuelta(); doAttack(); paso = 9; slowT = Math.max(slowT, 0.6); }   // picado
      if (paso === 9 && grounded && t > 0){ paso = 10; for (let i = 0; i < 3; i++) later(0.25 + i * 0.3, () => doAttack()); }
    };
  });

  // ── 2. Esquiva en cámara lenta y contraataque ──
  await tjPlano(5.0, () => {
    tjPrepara(0, true); H.set(-3, 0, -2.5); heading = 0; hero.rotation.y = 0;
    const bru = tjEnemigo('brute', -3, 1.4, 0.8); tjEnemigo('oni', -0.8, 3.6, 0.4); tjEnemigo('imp', -5.2, 3.8, 0.4);
    tjCam(-Math.PI / 2 - 0.3, 7.2, 0.5, 0.05);
    let paso = 0, tt = 0;
    TJ.pil = (t) => {
      if (paso === 0){ tjHacia(-3, 0); if (t > 0.8){ tjSuelta(); paso = 1; } }
      if (paso === 1 && ((bru && bru.tele && bru.tele.visible) || t > 2.6)){ paso = 2; tt = t; }
      if (paso === 2 && t > tt + 0.25){ tjJoy(1, 0.2); doRoll(); slowT = Math.max(slowT, 0.8); paso = 3; }   // voltereta de lado justo antes del golpe
      if (paso === 3 && state === 'roll' && rollT > 0.16){ if (bru) tjMira(bru.g.position.x, bru.g.position.z); doAttack(); paso = 4; tt = t; }   // estocada
      if (paso === 4 && t > tt + 0.8 && state === 'normal'){ if (bru) tjMira(bru.g.position.x, bru.g.position.z); for (let i = 0; i < 3; i++) later(i * 0.32, () => doAttack()); paso = 5; }
    };
  });

  // ── 3. Corte de nuca: ganchos, vuelo y tajo ──
  await tjPlano(4.4, () => {
    tjPrepara(0, true); taken = { titan: 1 }; H.set(0, 0, -6); heading = 0; hero.rotation.y = 0;
    tjEnemigo('brute', 0.5, 3.2, 0.3); tjEnemigo('imp', -2.6, 3.6, 0.3); tjEnemigo('imp', 3.0, 3.8, 0.3);
    tjCam(Math.PI / 2 + 0.75, 8.2, 0.42, 0.06);
    let paso = 0;
    TJ.pil = (t) => {
      if (paso === 0){ tjHacia(0.5, 3.2); if (t > 0.7){ paso = 1; doRoll(); } }
      if (paso === 1 && t > 1.0){ tjSuelta(); paso = 2; }
    };
  });

  // ── 4. Dragón de agua y su corriente ──
  await tjPlano(3.7, () => {
    tjPrepara(1, false); taken = { waterBreath: 1 }; H.set(0, 0, 2.6); heading = Math.PI; hero.rotation.y = heading;
    for (const [x, z] of [[-2.2, -1.5], [1.8, -2.4], [0, -3.6], [3.2, -0.8], [-3.4, -0.2]]) tjEnemigo(rnd() < 0.5 ? 'imp' : 'oni', x, z, 0.35);
    tjCam(0.45, 7.6, 0.58, -0.08);
    let paso = 0;
    TJ.pil = (t) => {
      if (paso === 0){ tjHacia(0, -1); if (t > 0.35){ tjSuelta(); for (let i = 0; i < 3; i++) later(i * 0.34, () => doAttack()); paso = 1; } }
      if (paso === 1 && FOIL.dragon && FOIL.dragon.s > 0.5){ tjJoy(-0.3, -1); doRoll(); paso = 2; }   // fluir: a lomos de la corriente
    };
  });

  // ── 5. Mil pájaros: el relámpago que cruza a todos ──
  await tjPlano(3.5, () => {
    tjPrepara(0, false); taken = { foilChidori: 1 }; H.set(-4.4, 0, 0); heading = Math.PI / 2; hero.rotation.y = heading;
    for (const [x, z] of [[-1.6, 0.5], [0.4, -0.6], [2.2, 0.7], [4.0, -0.4]]) tjEnemigo(rnd() < 0.5 ? 'imp' : 'oni', x, z, 0.15);
    tjCam(-0.35, 8.0, 0.42, 0.07);
    let paso = 0;
    TJ.pil = (t) => {
      if (paso === 0){ tjJoy(1, 0); if (t > 0.3){ tjSuelta(); for (let i = 0; i < 3; i++) later(i * 0.34, () => { tjMira(H.x + 3, H.z); doAttack(); }); paso = 1; } }
    };
  });

  // ── 6. Puño de fuego en carrera alrededor del grupo y la Gran llamarada ──
  await tjPlano(5.2, () => {
    tjPrepara(0, false); taken = { foilHiken: 1 }; H.set(0, 0, 2.9); heading = Math.PI / 2; hero.rotation.y = heading;
    for (let i = 0; i < 6; i++){ const a = i / 6 * TAU; tjEnemigo(i % 2 ? 'imp' : 'oni', Math.sin(a) * 1.5, Math.cos(a) * 1.5, 0.2); }
    tjCam(0, 5.8, 0.8);
    let paso = 0;
    TJ.pil = (t, dt) => {
      const a = Math.atan2(H.x, H.z); tjCamHacia(a, dt, 2.2);   // la cámara, siempre por fuera: el grupo queda delante
      const cx = Math.sin(a + 1.25), cz = Math.cos(a + 1.25);  // corre en círculo alrededor del grupo
      if (paso < 3) tjJoy(cx - 0.25 * (Math.hypot(H.x, H.z) - 2.9) * Math.sin(a), cz - 0.25 * (Math.hypot(H.x, H.z) - 2.9) * Math.cos(a));
      if (paso === 0 && t > 0.7){ tjMira(0, 0); doAttack(); paso = 1; }
      if (paso === 1 && t > 1.7){ tjMira(0, 0); doAttack(); paso = 2; }
      if (paso === 2 && t > 2.7){ tjSuelta(); FOIL.danza = 12; tjMira(0, 0); for (let i = 0; i < 3; i++) later(i * 0.34, () => doAttack()); slowT = Math.max(slowT, 0.9); paso = 3; }
    };
  });

  // ── Logo ──
  await tNegro(1, 0.3); cs.tick = null; gameState = 'cutscene'; clearWorld(); setSong('title'); applyMusVol(); play('legend');
  await tCard('<b class="lt">TOVAN</b><span class="ls">LAS RUINAS SIN FIN</span>', 3.4, 'logo');
  await csWait(0.3);
}
function runTrailerJuego(){
  titleScr.hidden = true; initAudio(); clearWorld(); player.dead = false; TJ.cam0 = [camDist, camPitch]; TJ.on = true;
  runCine(trailerJuegoScript, () => { TJ.on = false; tjSuelta(); TJ.pil = null; TJ.giro = 0; [camDist, camPitch] = TJ.cam0; mpPonTam(false); trlLimpia(); toTitle(); });
}
// Tovan no recibe daño durante el tráiler (con player.inv parpadearía)
const _hurtPlayerTJ = hurtPlayer;
hurtPlayer = function(...a){ if (TJ.on) return; return _hurtPlayerTJ.apply(this, a); };
// botón en el menú de título, tras «Tráiler»
{ const b = document.createElement('button'); b.className = 'win tbtn'; b.id = 'trailerJuegoBtn';
  b.innerHTML = '<span class="ti">🎮</span><span class="tl">Jugabilidad</span><span class="td">Tráiler de partida</span>';
  b.addEventListener('click', () => { play('confirm'); runTrailerJuego(); }); document.getElementById('trailerBtn').after(b); }

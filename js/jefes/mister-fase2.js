'use strict';
/* ======================================================================
   v11 · Míster Confianza, fase 2 «¡Sin guion!» (pelea normal en 3D tras el show)
         y un movimiento de Tovan con más inercia y mejor tacto
   ====================================================================== */

/* ---------- Posturas de Míster Confianza ---------- */
// aL/aR: [rot.x, rot.z] del hombro · eL/eR: [rot.x, rot.z] del codo · tx: inclinación del torso · hx/hz: cabeza · bx: cabeceo del cuerpo (vuelo) · lg: piernas [izq, der]
const POSE11 = {
  idle:     { aL: [0.1, -0.15], aR: [0.1, 0.15], eL: [-0.2, 0], eR: [-0.2, 0], tx: 0, hx: 0, hz: 0, bx: 0, lg: [0, 0] },
  hips:     { aL: [0.3, -0.7], aR: [0.3, 0.7], eL: [-0.5, -1.5], eR: [-0.5, 1.5], tx: -0.14, hx: -0.18, hz: 0.1, bx: 0, lg: [0.12, -0.12] },
  flex:     { aL: [0, -1.5], aR: [0, 1.5], eL: [0, -1.75], eR: [0, 1.75], tx: -0.12, hx: -0.12, hz: 0, bx: 0, lg: [0.25, -0.25] },
  point:    { aL: [0.3, -0.7], aR: [-1.55, 0.12], eL: [-0.5, -1.5], eR: [0, 0], tx: 0.08, hx: 0.05, hz: -0.1, bx: 0, lg: [-0.3, 0.2] },
  superman: { aL: [0.35, -0.1], aR: [-2.95, 0.05], eL: [0, 0], eR: [0, 0], tx: 0, hx: -0.5, hz: 0, bx: 1.25, lg: [0.1, -0.05] },
  dive:     { aL: [-2.95, -0.18], aR: [-2.95, 0.18], eL: [0, 0], eR: [0, 0], tx: 0, hx: -0.6, hz: 0, bx: 1.55, lg: [0.05, -0.05] },
  land:     { aL: [-0.3, -1.25], aR: [0.9, 0.35], eL: [0, -0.4], eR: [0, 0.3], tx: 0.45, hx: -0.35, hz: 0, bx: 0, lg: [-1.15, 1.25] },
  selfie:   { aL: [-1.35, -1.15], aR: [-1.85, 0.5], eL: [0, -1.65], eR: [-0.5, 0], tx: -0.05, hx: 0.1, hz: 0.32, bx: 0, lg: [0.15, -0.1] },
  tired:    { aL: [-0.75, -0.1], aR: [-0.75, 0.1], eL: [0, 0], eR: [0, 0], tx: 0.6, hx: 0.35, hz: 0, bx: 0, lg: [-0.25, 0.25] },
  wave:     { aL: [0.1, -0.2], aR: [0, 2.6], eL: [-0.2, 0], eR: [0, 0.5], tx: -0.05, hx: 0, hz: -0.22, bx: 0, lg: [0, 0] },
  dab:      { aL: [-0.25, -1.6], aR: [-1.0, 1.15], eL: [0, 0], eR: [0, 1.95], tx: 0.15, hx: 0.5, hz: -0.45, bx: 0, lg: [0.3, -0.2] },
  windup:   { aL: [0.25, -0.35], aR: [-3.05, 0.25], eL: [0, 0], eR: [-0.5, 0], tx: -0.22, hx: -0.1, hz: 0, bx: 0, lg: [0.35, -0.3] },
  throw:    { aL: [-0.4, -0.35], aR: [-0.7, 0.2], eL: [0, 0], eR: [0, 0], tx: 0.28, hx: 0.1, hz: 0, bx: 0, lg: [-0.4, 0.4] },
  cheer:    { aL: [-2.9, -0.35], aR: [-2.9, 0.35], eL: [0, 0], eR: [0, 0], tx: -0.12, hx: -0.3, hz: 0, bx: 0, lg: [0, 0] },
  moon:     { aL: [0.2, -0.35], aR: [-0.2, 0.9], eL: [-0.4, 0], eR: [0, 1.4], tx: -0.08, hx: 0, hz: 0.18, bx: 0, lg: [0, 0] }
};
function pose11(e, name, dt, k = 10){
  const P_ = POSE11[name] || POSE11.idle, f = 1 - Math.exp(-dt * k), A = e.arms;
  const sh = (G, v) => { G.rotation.x = lerp(G.rotation.x, v[0], f); G.rotation.z = lerp(G.rotation.z, v[1], f); };
  sh(A[0], P_.aL); sh(A[1], P_.aR); sh(A[0].userData.el, P_.eL); sh(A[1].userData.el, P_.eR);
  e.torso.rotation.x = lerp(e.torso.rotation.x, P_.tx, f);
  if (e.head){ e.head.rotation.x = lerp(e.head.rotation.x, P_.hx, f); e.head.rotation.z = lerp(e.head.rotation.z, P_.hz, f); }
  e.body.rotation.x = lerp(e.body.rotation.x, P_.bx, f);
  e.legs[0].rotation.x = lerp(e.legs[0].rotation.x, P_.lg[0], f); e.legs[1].rotation.x = lerp(e.legs[1].rotation.x, P_.lg[1], f);
}
const SP11 = { cyc: ['pose', 'flex', 'fly', 'tired', 'selfie', 'trophy', 'moon', 'likes', 'fly', 'tired', 'pose'],
  poses: [['hips', '¡Mi mejor perfil!'], ['dab', '¡DAB! ¡Esto es lo que se lleva!'], ['wave', '¡Hola, mamá! ¡Salgo en la tele!'], ['flex', '¡Mirad qué bíceps!'], ['hips', '¡Esto va para el anuncio!']] };
const trophyMat11 = makeMat(0xffd23a, { emissive: 0.5 }), heartMat11 = makeMat(0xff4a8a, { emissive: 0.6 }), phoneMat11 = makeMat(0x15151f), screenMat11 = makeMat(0x9fe8ff, { emissive: 1 });
function mkTrophy11(){ const g = new THREE.Group(); scene.add(g);
  mesh(C(0.26, 0.12, 0.34, 8, true), trophyMat11, 0, 0.32, 0, g); mesh(C(0.05, 0.05, 0.16, 6), trophyMat11, 0, 0.1, 0, g); mesh(B(0.26, 0.06, 0.26), trophyMat11, 0, 0.02, 0, g);
  for (const s of [-1, 1]){ const h = mesh(new THREE.TorusGeometry(0.1, 0.025, 4, 8), trophyMat11, 0.27 * s, 0.34, 0, g); h.rotation.y = Math.PI / 2; }
  g.scale.setScalar(1.5); return g; }

function startP2_11(b){
  b.p2x = true; b.p2r = false; b.x5 = null; b.st = 'p2'; b.r11 = null; b.i11 = 0; b.pause11 = 0; b.vuln11 = 1; b.invuln11 = true;
  b.maxHp = Math.round(b.maxHp * 0.5); b.hp = b.maxHp; b.bossName = 'Míster Confianza · ¡Sin guion!'; try { bossNameEl.textContent = b.bossName; } catch (err) {}
  b.g.visible = true; b.g.position.set(0, 0, -2.5); b.g.rotation.y = 0; b.vx = b.vz = 0; b.body.position.y = 16; b.reach = false;
  if (!b.phone11){ const el = b.arms[1].userData.el, ph = new THREE.Group(); ph.position.set(0, -0.48, 0.08); el.add(ph); mesh(B(0.14, 0.24, 0.04), phoneMat11, 0, 0, 0, ph); mesh(B(0.11, 0.19, 0.01), screenMat11, 0, 0, 0.025, ph); ph.visible = false; b.phone11 = ph; }
  b.upd = updStarP2_11; b.r11 = rEnter11(b);
  staticT = 0.4; play('static');
  later(0.3, () => banner('¡SEGUNDA FASE!<small>Se acabó el programa: sin cámaras, sin guion… y muy enfadado</small>', 2.2));
  bark('¿Ya está? ¿Se ha ido? … No. Viene del cielo. Claro que viene del cielo.');
}
function updStarP2_11(e, dt, dist, toP, face, move){
  if (chT < 30) chT = 30;
  if (!e.p2r && e.hp < e.maxHp * 0.5){ e.p2r = true; e.speedK = 1.25; banner('¡Míster Confianza se pone serio!<small>(se ha despeinado y no lo soporta)</small>', 1.8); play('roar'); flash('#ffd23a', 0.3);
    for (let i = 0; i < 3; i++) later(i * 0.1, () => gring(e.g.position.x, 0.1 + i * 0.6, e.g.position.z, 0xffd23a, 0.5, 4 + i, 0.5)); }
  const K = e.speedK || 1;
  e.reach = e.body.position.y < 1.6;
  if (e.phone11) e.phone11.visible = e.r11 && e.r11.phone;
  if (e.r11){ let done = false; try { done = e.r11.upd(dt * K); } catch (err) { console.error(err); done = true; }
    if (done){ if (e.r11.end) e.r11.end(); e.r11 = null; e.vuln11 = 1; e.pause11 = (e.p2r ? 0.55 : 1.0); } return; }
  // entre ataques: se acerca andando con chulería
  e.body.position.y = lerp(e.body.position.y, 0, 1 - Math.exp(-dt * 6));
  pose11(e, 'idle', dt, 8); face(toP, 6);
  if (!player.dead && dist > 4.2){ move(toP, e.speed * 1.1 * K); const a = Math.sin(time * 9) * 0.55; e.legs[0].rotation.x = a; e.legs[1].rotation.x = -a; }
  e.pause11 -= dt * K;
  if (e.pause11 <= 0 && !player.dead && gameState === 'play'){
    const name = SP11.cyc[e.i11++ % SP11.cyc.length];
    e.r11 = ({ pose: rPose11, flex: rFlex11, fly: rFly11, tired: rTired11, selfie: rSelfie11, trophy: rTrophy11, moon: rMoon11, likes: rLikes11 })[name](e);
  }
}
/* ---- rutinas ---- */
function rEnter11(e){ let t = 0, landed = false;
  return { upd(dt){ t += dt; const B_ = e.body;
    if (t < 1.0){ pose11(e, 'superman', dt, 12); B_.position.y = 16; e.g.visible = t > 0.5; return false; }
    if (!landed){ pose11(e, 'dive', dt, 14); B_.position.y = Math.max(0, 16 * (1 - (t - 1.0) / 0.55));
      if (rnd() < 0.8) pa(e.g.position.x, B_.position.y + 1.2, e.g.position.z, 0, 4, 0, rnd() < 0.5 ? 0xffd23a : 0xffffff, 0.2, 0.35, 0, 1, 0.3, SH7.star);
      if (B_.position.y <= 0){ landed = true; B_.position.y = 0; shake = 0.7; flash('#ffffff', 0.4); play('bossSlam'); slamRing(e); crack7(e.g.position.x, e.g.position.z, 10, 3.2, true);
        burst7(PA7, e.g.position.x, 0.4, e.g.position.z, 40, [0xffd23a, 0xffffff, 0xff8a3a], 8, 0.2, 0.6, 6, 1, 0, SH7.star); hurtAt(e.g.position.x, e.g.position.z, 1.8, 18 * e.dm, 8); } return false; }
    pose11(e, t < 2.3 ? 'land' : 'hips', dt, 9);
    if (t > 2.3 && !this.said){ this.said = true; e.invuln11 = false; starShout(e, '¡Sin cámaras, sin guion… y sin piedad!'); play('superOn'); }
    return t > 3.4; } }; }
function rPose11(e){ const [p, txt] = pick10(SP11.poses); let t = 0; starShout(e, txt); play('superOn'); e.vuln11 = 1.35;
  return { upd(dt){ t += dt; pose11(e, p, dt, 9); e.vx = e.vz = 0; face11(e, dt);
    if (rnd() < dt * 7){ const a = rnd() * TAU; gring(e.g.position.x + Math.cos(a) * 2.2, 1.6 + rnd(), e.g.position.z + Math.sin(a) * 2.2, 0xffffff, 0.1, 0.8, 0.18); play('bill'); }   // flashes de los fans
    if (rnd() < dt * 10) pa(e.g.position.x + (rnd() - 0.5) * 1.6, 1 + rnd() * 3, e.g.position.z + (rnd() - 0.5) * 1.6, 0, 0.6, 0, 0xfff6a0, 0.16, 0.5, 0, 1, 0.3, SH7.star);
    if (p === 'wave'){ e.arms[1].userData.el.rotation.z = 0.5 + Math.sin(time * 14) * 0.5; }
    return t > 1.5; } }; }
function face11(e, dt){ const a = angTo(e.g.position.x, e.g.position.z, hero.position.x, hero.position.z); e.g.rotation.y = lerpAngle(e.g.rotation.y, a, 1 - Math.exp(-dt * 6)); return a; }
function rFlex11(e){ const n = e.p2r ? 4 : 3, cnt = e.p2r ? 18 : 14; let t = 0, k = 0; starShout(e, '¡BÍCEPS DE LA CONFIANZA!'); play('roar');
  return { upd(dt){ t += dt; face11(e, dt); const beat = (t - 0.5) / 0.5; pose11(e, beat > 0 && (beat % 1) < 0.3 ? 'flex' : 'hips', dt, 16);
    if (t > 0.5 + k * 0.5 && k < n){ k++; const x = e.g.position.x, z = e.g.position.z, off = k * 0.21; play('shoot'); gring(x, 1.6, z, 0xffd23a, 0.4, 2.2, 0.25);
      for (let i = 0; i < cnt; i++){ const a = off + i / cnt * TAU; projectiles.push({ m: mesh(orbGeo, orbMatE, x + Math.sin(a), 1.05, z + Math.cos(a)), vx: Math.sin(a) * 4.6, vz: Math.cos(a) * 4.6, life: 3.2, owner: 'enemy', dmg: 9 * e.dm }); } }
    return t > 0.6 + n * 0.5 + 0.3; } }; }
function rFly11(e){ const n = e.p2r ? 3 : 2; let st = 'up', t = 0, k = 0, tx = 0, tz = 0; const tele = circTele();
  starShout(e, pick10(['¡AL AIRE!', '¡Volando voy, volando vengo!', '¡Mira, mamá, sin cables!'])); play('jump');
  return { upd(dt){ t += dt; const B_ = e.body, x = e.g.position.x, z = e.g.position.z;
      if (rnd() < 0.5) pa(x, B_.position.y + 0.6, z, (rnd() - 0.5) * 0.5, -2, (rnd() - 0.5) * 0.5, rnd() < 0.5 ? 0xffd23a : 0xffffff, 0.15, 0.4, 0, 1, 0.3, SH7.dot);
      if (st === 'up'){ pose11(e, 'superman', dt, 10); B_.position.y = lerp(B_.position.y, 3.4, 1 - Math.exp(-dt * 6)); if (t > 0.6){ st = 'hover'; t = 0; } }
      else if (st === 'hover'){ pose11(e, 'superman', dt, 10); B_.position.y = 3.4 + Math.sin(time * 4) * 0.2;
        if (t < 0.65){ tx = hero.position.x; tz = hero.position.z; } const a = angTo(x, z, tx, tz), d = Math.hypot(tx - x, tz - z);
        if (d > 0.2){ const sp = Math.min(d / dt, 9); e.g.position.x += Math.sin(a) * sp * dt; e.g.position.z += Math.cos(a) * sp * dt; } e.g.rotation.y = lerpAngle(e.g.rotation.y, a, 1 - Math.exp(-dt * 8));
        showCirc(tele, tx, tz, 1.9); if (t > 0.95){ st = 'dive'; t = 0; play('dive'); starShout(e, '¡PUÑETAZO DESDE EL CIELO!'); } }
      else if (st === 'dive'){ pose11(e, 'dive', dt, 18); e.g.position.x = lerp(e.g.position.x, tx, 1 - Math.exp(-dt * 20)); e.g.position.z = lerp(e.g.position.z, tz, 1 - Math.exp(-dt * 20));
        B_.position.y = Math.max(0, 3.4 * (1 - t / 0.26)); showCirc(tele, tx, tz, 1.9);
        if (B_.position.y <= 0){ k++; tele.visible = false; shake = 0.55; play('bossSlam'); slamRing(e); crack7(tx, tz, 7, 2.4, true); hurtAt(tx, tz, 1.9, 18 * e.dm, 8);
          burst7(PA7, tx, 0.4, tz, 28, [0xffd23a, 0xffffff, 0xff8a3a], 7, 0.18, 0.5, 6, 1, 0, SH7.star); st = k < n ? 'bounce' : 'done'; t = 0; } }
      else if (st === 'bounce'){ pose11(e, 'superman', dt, 10); B_.position.y = lerp(B_.position.y, 3.4, 1 - Math.exp(-dt * 7)); if (t > 0.5){ st = 'hover'; t = 0; } }
      else { pose11(e, 'land', dt, 12); B_.position.y = 0; return t > 0.4; }
      return false; }, end(){ scene.remove(tele); e.body.position.y = 0; } }; }
function rTired11(e){ let t = 0; starShout(e, pick10(['Uf… uf… ¿esto sale en la tele?', '¡Tiempo muerto! ¡Que alguien me traiga agua!', 'Ay, la espalda… ¡Que no me graben!'])); e.vuln11 = 1.6;
  return { upd(dt){ t += dt; pose11(e, 'tired', dt, 8); e.vx = e.vz = 0; e.torso.rotation.x += Math.sin(time * 9) * 0.04;
    if (rnd() < dt * 6){ e.head.getWorldPosition(tA); pa(tA.x + (rnd() - 0.5) * 0.5, tA.y + 0.2, tA.z + (rnd() - 0.5) * 0.5, (rnd() - 0.5) * 1.5, 1.5, (rnd() - 0.5) * 1.5, 0x9fe8ff, 0.14, 0.5, 8, 0, 0.6, SH7.dot); }
    if (t > 0.3 && !this.hint){ this.hint = true; tB.set(e.g.position.x, e.numY + 1.4, e.g.position.z); spawnNumber(tB, '¡Ahora! ¡Pega fuerte!', 'react', '#7dff8a'); }
    return t > (e.p2r ? 1.6 : 2.2); } }; }
function rSelfie11(e){ let t = 0, st = 'aim', dir = 0, a0 = 0, hitCd = 0; const line = lineTele(), sweep = e.p2r ? 2.3 : 2.0;
  starShout(e, '¡SONRÍE! ¡Selfie panorámico! 📸'); play('superOn');
  return { phone: true, upd(dt){ t += dt; const x = e.g.position.x, z = e.g.position.z;
      pose11(e, 'selfie', dt, 10); e.body.position.y = lerp(e.body.position.y, 0.5, 1 - Math.exp(-dt * 5)); e.vx = e.vz = 0;
      if (st === 'aim'){ dir = angTo(x, z, hero.position.x, hero.position.z); a0 = dir - sweep / 2; e.g.rotation.y = lerpAngle(e.g.rotation.y, a0, 1 - Math.exp(-dt * 10));
        showLine(line, x, z, a0, 1.3, 11); if (t > 0.9){ st = 'sweep'; t = 0; line.visible = false; flash('#ffffff', 0.35); play('beam'); } return false; }
      const a = a0 + sweep * Math.min(1, t / 1.3); e.g.rotation.y = a;
      const fx = Math.sin(a), fz = Math.cos(a); e.beam.visible = true; e.beam.position.set(x + fx * 0.8, 0.75, z + fz * 0.8); e.beam.rotation.y = a; e.beam.scale.set(0.38, 0.38, 11);
      lightFlash(x + fx * 4, 1, z + fz * 4, 0xffffff, 1.8, 9); hitCd -= dt;
      if (hitCd <= 0){ const ex = hero.position.x - x, ez = hero.position.z - z, along = ex * fx + ez * fz, side = Math.abs(ex * fz - ez * fx);
        if (along > 0 && along < 11 && side < 0.75 && hero.position.y < 0.9){ hitCd = 0.5; if (hurtPlayer(12 * e.dm, x, z, 4) === 'hit'){ tA.set(hero.position.x, hero.position.y + 2.6, hero.position.z); spawnNumber(tA, '¡Has salido con los ojos cerrados!', 'react', '#ffffff'); } } }
      if (t > 1.3){ e.beam.visible = false; return t > 1.6; } return false; }, end(){ scene.remove(line); e.beam.visible = false; } }; }
function rTrophy11(e){ let t = 0, thrown = false; const n = e.p2r ? 2 : 1, list = []; starShout(e, '¡Toma mi premio al mejor héroe! (devuélvemelo)'); play('roar');
  return { upd(dt){ t += dt; const x = e.g.position.x, z = e.g.position.z, d0 = face11(e, dt); e.vx = e.vz = 0;
      pose11(e, t < 0.6 ? 'windup' : 'throw', dt, t < 0.6 ? 10 : 22);
      if (!thrown && t > 0.6){ thrown = true; play('swingBig');
        for (let i = 0; i < n; i++){ const side = n > 1 ? (i ? 1 : -1) : (rnd() < 0.5 ? -1 : 1), m = mkTrophy11(); m.position.set(x, 1.6, z); list.push({ m, side, k: 0, hit: false, dir: d0 }); } }
      for (const T of list){ T.k += dt / 1.8; const k = Math.min(1, T.k), ang = k * Math.PI * 2, R = 8.5, ox = Math.sin(T.dir), oz = Math.cos(T.dir), sx = Math.cos(T.dir) * T.side, sz = -Math.sin(T.dir) * T.side;
        const fwd = Math.sin(ang * 0.5) * R, lat = Math.sin(ang) * 2.6;
        T.m.position.set(x + ox * fwd + sx * lat, 1.1, z + oz * fwd + sz * lat); T.m.rotation.y += dt * 18;
        if (rnd() < 0.6) pa(T.m.position.x, 1.1, T.m.position.z, 0, 0.3, 0, 0xffd23a, 0.12, 0.35, 0, 1, 0.2, SH7.star);
        if (!T.hit && Math.hypot(hero.position.x - T.m.position.x, hero.position.z - T.m.position.z) < 0.75 && hero.position.y < 1.0){ if (hurtPlayer(12 * e.dm, T.m.position.x, T.m.position.z, 5) === 'hit') T.hit = true; } }
      return thrown && list.every(T => T.k >= 1); }, end(){ list.forEach(T => scene.remove(T.m)); } }; }
function rMoon11(e){ let t = 0, st = 'moon', dir = 0; const line = lineTele(); starShout(e, '¡Paso lunar! ✨'); play('superOn');
  return { upd(dt){ t += dt; const x = e.g.position.x, z = e.g.position.z;
      if (st === 'moon'){ const a = face11(e, dt); pose11(e, 'moon', dt, 10); const back = a + Math.PI; e.g.position.x += Math.sin(back) * 2.4 * dt; e.g.position.z += Math.cos(back) * 2.4 * dt; clampArena(e.g.position);
        const s = Math.sin(time * 8); e.legs[0].rotation.x = s * 0.35; e.legs[1].rotation.x = -s * 0.35; e.body.position.y = Math.abs(s) * 0.06;
        if (rnd() < dt * 8) pa(x, 0.1, z, 0, 0.6, 0, 0xffffff, 0.2, 0.4, 0, 1, 0.5, SH7.dot);
        if (t > 1.3){ st = 'point'; t = 0; starShout(e, '¡TÚ!'); play('bruteWarn'); } }
      else if (st === 'point'){ pose11(e, 'point', dt, 14); dir = face11(e, dt); showLine(line, x, z, dir, 2, 9); if (t > 0.6){ st = 'dash'; t = 0; line.visible = false; play('swingBig'); this.hit = false; } }
      else { pose11(e, 'dive', dt, 14); e.body.rotation.x = 0.5; e.g.position.x += Math.sin(dir) * 17 * dt; e.g.position.z += Math.cos(dir) * 17 * dt; clampArena(e.g.position);
        if (!this.hit && Math.hypot(hero.position.x - e.g.position.x, hero.position.z - e.g.position.z) < e.r + 0.6 && hero.position.y < 1.2){ if (hurtPlayer(16 * e.dm, e.g.position.x, e.g.position.z, 9) === 'hit') this.hit = true; }
        if (rnd() < 0.8) pa(e.g.position.x, 1.4, e.g.position.z, 0, 0, 0, 0xffd23a, 0.25, 0.25, 0, 0, 0.3, SH7.star);
        if (t > 0.4){ e.body.position.y = 0; return true; } }
      return false; }, end(){ scene.remove(line); } }; }
function rLikes11(e){ let t = 0; const n = e.p2r ? 14 : 10; starShout(e, '¡DADME LIKES! ¡LIKES! ¡LIKES!'); play('roar');
  for (let i = 0; i < n; i++){ const v = i % 3 === 0 ? clampArena(new V3(hero.position.x, 0, hero.position.z)) : nearHero(3.6);
    hzCircle(v.x, v.z, 0.95, 0.8 + i * 0.13, (x, z) => { const m = mesh(new THREE.OctahedronGeometry(0.34, 0), heartMat11, x, 8, z); m.scale.set(1, 1.3, 0.6);
      hzFx({ upd(dt){ this.t += dt; m.position.y = 8 * (1 - Math.min(1, this.t / 0.3) ** 2); m.rotation.y += dt * 10;
        if (this.t >= 0.3 && !this.hit){ this.hit = true; puffAt(x, z, 5, 1, 0xff8ab8); hurtAt(x, z, 1.0, 11 * e.dm, 4); tA.set(x, 1.6, z); spawnNumber(tA, rnd() < 0.5 ? '👍' : '❤️', 'react', '#ff8ab8'); }
        return this.t > 0.6; }, end(){ scene.remove(m); } }); }); }
  return { upd(dt){ t += dt; face11(e, dt); pose11(e, 'cheer', dt, 10); e.arms[0].rotation.z = -0.35 + Math.sin(time * 12) * 0.25; e.arms[1].rotation.z = 0.35 - Math.sin(time * 12) * 0.25; return t > 0.8 + n * 0.13 + 0.5; } }; }

/* ---------- Enganche con el show: al ganar los minijuegos empieza la fase 2 ---------- */
const _mgEndShow11 = mgEndShow;
mgEndShow = function(win){
  const b = bossE;
  if (win && b && b.alive && b.type === 'star' && !b.p2x){
    if (MG.game && MG.game.end) MG.game.end();
    MG.active = false; MG.game = null; MG.done = true; mgEl.hidden = true; document.body.classList.remove('mg-on');
    if (chMode === 'invaders') setChannel('anime'); invActive = false; chT = 60; musRelease();
    queue.length = 0; for (const e of enemies) if (e.alive && !e.isBoss) killEnemy(e);
    for (const q of projectiles) scene.remove(q.m); projectiles.length = 0;
    startP2_11(b); return;
  }
  _mgEndShow11(win);
};
const _mgDmg11 = mgDmg;
mgDmg = function(...a){ return MG.active ? _mgDmg11(...a) : 0; };   // golpes del RPG que lleguen tarde no cuentan en la fase 2
const _hitEnemy11 = hitEnemy;
hitEnemy = function(e, val, ...rest){
  if (e && e.p2x){ if (e.invuln11) return false; if (e.vuln11 > 1) val = Math.round(val * e.vuln11); }
  return _hitEnemy11(e, val, ...rest);
};
const _killEnemy11 = killEnemy;
killEnemy = function(e){ if (e && e.p2x && e.alive){ e.body.position.y = 0; e.body.rotation.x = 0; e.reach = true; if (e.r11 && e.r11.end) e.r11.end(); e.r11 = null; e.beam.visible = false; } _killEnemy11(e); };

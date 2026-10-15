'use strict';
/* ---------- Partículas continuas de cada poder ---------- */
function e7Emit(dt){
  const hx = hero.position.x, hy = hero.position.y, hz = hero.position.z, T = time;
  staffPts7();
  // arma elemental
  const els = []; if (lvl('fireEdge')) els.push('fire'); if (lvl('frost')) els.push('ice'); if (lvl('storm')) els.push('shock'); if (lvl('venomBlade') || lvl('poison')) els.push('poison');
  const swing = state === 'attack' || state === 'charge';
  for (const el of els){ const n = swing ? 3 : 1, C_ = EL7[el];
    for (let k = 0; k < n; k++){ if (!swing && rnd() > 0.65) continue; const p = onStaff7(rnd() * 1.25 - 0.1), c = C_[Math.floor(rnd() * 3)];
      if (el === 'fire') pa(p.x, p.y, p.z, (rnd() - 0.5) * 0.4, 1.2 + rnd(), (rnd() - 0.5) * 0.4, c, 0.15, 0.4, -2, 1, 0.2, SH7.dot);
      else if (el === 'ice') pa(p.x, p.y, p.z, (rnd() - 0.5) * 0.5, -0.4, (rnd() - 0.5) * 0.5, c, 0.1, 0.7, 0.5, 1, 0.5, SH7.star);
      else if (el === 'shock'){ if (rnd() < 0.3) streak7(p.x, p.y, p.z, rnd() - 0.5, rnd() - 0.5, rnd() - 0.5, 0.28, 0xfff27a, 0.07, 0.025); else pa(p.x, p.y, p.z, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2, (rnd() - 0.5) * 2, c, 0.07, 0.15, 0, 0, 0, SH7.sq); }
      else pn(p.x, p.y, p.z, 0, -0.2, 0, c, 0.1, 0.7, 7, 0, 0.7, SH7.dot, 0.95); } }
  // poderes del arma actual: chispas de su color
  { const n = wpOwned7(); if (n && rnd() < 0.35 * n + (swing ? 0.4 : 0)){ const p = onStaff7(rnd() * 1.2 - 0.1); pa(p.x, p.y, p.z, (rnd() - 0.5) * 0.6, 0.4, (rnd() - 0.5) * 0.6, rnd() < 0.5 ? wCol() : 0xffffff, 0.11, 0.4, 0, 1, 0.2, SH7.star); } }
  // ¡BAN-KAI!: llamas negras en el arma
  if (P6.bankaiT > 0){ for (let k = 0; k < 3; k++){ const p = onStaff7(rnd() * 1.2 - 0.1); pn(p.x, p.y, p.z, (rnd() - 0.5) * 0.6, 1 + rnd(), (rnd() - 0.5) * 0.6, rnd() < 0.7 ? 0x0a0408 : 0x5a0010, 0.16, 0.5, -1, 1, 1.4, SH7.sq, 0.9); } }
  // Pies ligeros / exprés: líneas de velocidad
  const moving = walkW > 0.4 && grounded, expr = lvl('express') && T - P5.rollT < 1.5;
  if ((lvl('speed') && (moving || state === 'roll')) || expr){ E7.speedT -= dt; if (E7.speedT <= 0){ E7.speedT = expr ? 0.025 : 0.06 - 0.01 * lvl('speed');
      const f = state === 'roll' ? rollDir : heading, bx = -Math.sin(f), bz = -Math.cos(f), sd = (rnd() - 0.5) * 0.9;
      streak7(hx + Math.cos(f) * sd + bx * 0.4, hy + 0.2 + rnd() * 1.4, hz - Math.sin(f) * sd + bz * 0.4, bx, 0, bz, 0.6 + rnd() * 0.7, expr ? 0xffa040 : 0xffffff, 0.22, 0.025, 5);
      if (lvl('speed') && rnd() < 0.5) pn(hx + bx * 0.3, 0.08, hz + bz * 0.3, bx * 0.8, 0.3, bz * 0.8, 0xffffff, 0.12, 0.4, 0, 1, 2.5, SH7.dot, 0.6);
      if (expr) pa(hx + (rnd() - 0.5) * 0.3, 0.1, hz + (rnd() - 0.5) * 0.3, 0, 0.6, 0, rnd() < 0.5 ? 0xff8a1a : 0xffe070, 0.14, 0.5, -1, 0, 0.2, SH7.dot); } }
  // Voltereta ígnea: bola de fuego al rodar
  if (state === 'roll' && up.fireRoll > 0) for (let k = 0; k < 7; k++){ const u = rnd() * 2 - 1, a = rnd() * TAU, s = Math.sqrt(1 - u * u), r = 0.45 + rnd() * 0.25;
    pa(hx + Math.cos(a) * s * r, hy + 0.55 + u * r, hz + Math.sin(a) * s * r, Math.cos(a) * s, 1 + rnd(), Math.sin(a) * s, EL7.fire[k % 3], 0.2, 0.35, -2, 1, 0.3, SH7.dot); }
  // Estática: chispas en el pelo y en la voltereta
  if (lvl('static')){ if (rnd() < dt * 8){ P.neck.localToWorld(t7a.set((rnd() - 0.5) * 0.4, 0.55 + rnd() * 0.15, (rnd() - 0.5) * 0.3)); streak7(t7a.x, t7a.y, t7a.z, rnd() - 0.5, rnd(), rnd() - 0.5, 0.18, 0xfff27a, 0.06, 0.02); }
    if (state === 'roll' && rnd() < 0.6){ const a = rnd() * TAU; streak7(hx + Math.cos(a) * 0.5, hy + 0.5 + rnd() * 0.5, hz + Math.sin(a) * 0.5, rnd() - 0.5, rnd() - 0.5, rnd() - 0.5, 0.45, 0xfff6a0, 0.08, 0.03); } }
  // Remolino: torbellino durante el giro
  if (state === 'attack' && curMove && curMove.name === 'spin') for (let k = 0; k < 5; k++){ const a = rnd() * TAU, r = 1.1 + rnd() * 0.8;
    pa(hx + Math.cos(a) * r, hy + 0.2 + rnd() * 1.4, hz + Math.sin(a) * r, -Math.sin(a) * 7, 0.8, Math.cos(a) * 7, rnd() < 0.5 ? 0xffffff : 0x9fe8ff, 0.12, 0.3, 0, 2, 0.4, SH7.sq); }
  // Sobrecarga: chispazos durante la carga máxima
  if (state === 'charge' && chargeLvl === 2 && lvl('overcharge')){ E7.spark -= dt; if (E7.spark <= 0){ E7.spark = 0.05; const a = rnd() * TAU, b = rnd() - 0.3;
      streak7(t7b.x, t7b.y, t7b.z, Math.cos(a), b, Math.sin(a), 0.7, 0xfff27a, 0.08, 0.035); pa(t7b.x, t7b.y, t7b.z, Math.cos(a) * 3, b * 3, Math.sin(a) * 3, 0xffffff, 0.08, 0.2, 0, 0, 0, SH7.sq);
      if (rnd() < 0.15){ const a2 = rnd() * TAU; bolt(t7b.x, t7b.y, t7b.z, hx + Math.cos(a2) * 1.6, 0.1, hz + Math.sin(a2) * 1.6, 0xfff27a, 0.05); } } }
  // Orbes: estelas (rojas si chupan sangre, arcoíris con Prisma, amarillas con Tormenta)
  for (let i = 0; i < orbs.length; i++){ const o = orbs[i]; let c = 0x8ff6ff;
    if (lvl('vampOrbs')) c = 0xff2a4a; else if (lvl('prism')){ _c7.setHSL((T * 0.7 + i * 0.2) % 1, 1, 0.6); c = _c7.getHex(); } else if (lvl('tempest')) c = 0xfff27a;
    pa(o.position.x, o.position.y, o.position.z, 0, 0, 0, c, 0.2, 0.3, 0, 0, 0, SH7.dia); }
  for (const o of orbitals){ if (o.m.visible && rnd() < 0.6) pa(o.m.position.x, o.m.position.y, o.m.position.z, 0, 0, 0, lvl('vampOrbs') ? 0xff4a6a : 0xfff2a0, 0.13, 0.25, 0, 0, 0, SH7.dot); }
  // Imán: los orbes y billetes vuelan dejando chispas azules
  if (lvl('magnet') && ACC7.mag){ ACC7.mag.getWorldPosition(t7a); let n = 0;
    for (const p of pickups){ if (n > 6) break; const d = Math.hypot(hx - p.m.position.x, hz - p.m.position.z); if (d > 7 || rnd() > 0.5) continue; n++;
      pa(p.m.position.x, p.m.position.y, p.m.position.z, (t7a.x - p.m.position.x) * 2, (t7a.y - p.m.position.y) * 2, (t7a.z - p.m.position.z) * 2, rnd() < 0.5 ? 0x6ab8ff : 0xffffff, 0.12, 0.45, 0, 0, 0.3, SH7.dot); }
    for (const b of bills){ if (n > 10) break; if (b.st !== 'mag' || rnd() > 0.5) continue; n++; pa(b.m.position.x, b.m.position.y, b.m.position.z, 0, 0.4, 0, 0x6ab8ff, 0.1, 0.35, 0, 0, 0.3, SH7.star); } }
  // Ventisca: remolino de nieve mucho más denso
  if (lvl('blizzard') && P5.blizOn > 0){ for (let k = 0; k < 7; k++){ const a = rnd() * TAU, r = 0.6 + rnd() * 2.9;
      pa(hx + Math.cos(a) * r, 0.2 + rnd() * 2.2, hz + Math.sin(a) * r, -Math.sin(a) * 6, -0.3, Math.cos(a) * 6, rnd() < 0.6 ? 0xffffff : 0xbff4ff, 0.13, 0.45, 0, 1, 0.5, rnd() < 0.3 ? SH7.star : SH7.sq); }
    E7.bliz = (E7.bliz || 0) - dt; if (E7.bliz <= 0){ E7.bliz = 0.35; gring(hx, 0.1, hz, 0xdff6ff, 3.2, 3.6, 0.35, null, 0.6); } }
  // Seguimiento del envío: haz de GPS sobre el objetivo y pings
  if (lvl('tracking') && P5.mark && P5.mark.alive){ const m = P5.mark; gpsBeam7.visible = true; gpsBeam7.position.set(m.g.position.x, 4.5, m.g.position.z); gpsBeam7.material.uniforms.uAlpha.value = 0.3 + 0.15 * Math.sin(T * 10);
    E7.ping -= dt; if (E7.ping <= 0){ E7.ping = 0.9; gring(m.g.position.x, 0.08, m.g.position.z, 0xff4a3a, 0.3, 1.8, 0.6); } } else gpsBeam7.visible = false;
  // Firme aquí: anillos rojos bajo los que ya se pueden rematar
  { let n = 0; if (lvl('signature')){ const thr = lvl('signature') > 1 ? 0.2 : 0.12;
      for (const e of enemies){ if (n >= sigRings7.length) break; if (!e.alive || e.isBoss || e.spawnT > 0 || e.hp / e.maxHp >= thr) continue; const r = sigRings7[n++];
        r.visible = true; r.position.set(e.g.position.x, 0.07, e.g.position.z); r.scale.setScalar((e.r + 0.35) * (1 + 0.12 * Math.sin(T * 12))); r.rotation.z += dt * 3; r.material.uniforms.uAlpha.value = 0.6 + 0.3 * Math.sin(T * 12);
        if (rnd() < dt * 4) pa(e.g.position.x, e.numY + 0.2, e.g.position.z, 0, 0.5, 0, 0xff4a6a, 0.2, 0.4, 0, 0, 1, SH7.plus); } }
    for (let i = n; i < sigRings7.length; i++) sigRings7[i].visible = false; }
  // Piedra, papel, tijera: el puño se va cargando
  if (lvl('jan')){ const k = P6.janReady ? 1 : P6.janN / 12; if (rnd() < 0.15 + k * 0.85){ rightHand7(t7a); const r = 0.12 + 0.18 * k;
      pa(t7a.x + (rnd() - 0.5) * r, t7a.y + (rnd() - 0.5) * r, t7a.z + (rnd() - 0.5) * r, 0, 0.6, 0, P6.janReady ? (rnd() < 0.5 ? 0xff9a2a : 0xffe070) : 0xffc070, 0.1 + 0.12 * k, 0.3, 0, 0, 0.3, SH7.sq);
      if (P6.janReady && rnd() < 0.3) pa(t7a.x, t7a.y, t7a.z, 0, 0, 0, 0xffb040, 0.7 + 0.2 * Math.sin(T * 20), 0.1, 0, 0, 1, SH7.dot, 0.5); } }
  // Corte de nuca: cables y gas durante la voltereta
  if (lvl('titan') && state === 'roll' && ACC7.titan){ if (!E7.anchors){ const f = rollDir; E7.anchors = [-1, 1].map(s => [hx + Math.sin(f + 0.5 * s) * 5.5, 3.2, hz + Math.cos(f + 0.5 * s) * 5.5]); }
    ACC7.titan.userData.noz.forEach((n, i) => { n.getWorldPosition(t7a); const A = E7.anchors[i]; wires7[i].visible = true; line7(wires7[i], t7a.x, t7a.y, t7a.z, A[0], A[1], A[2], 0.025);
      pn(t7a.x, t7a.y, t7a.z, (rnd() - 0.5), 0.3, (rnd() - 0.5), 0xffffff, 0.16, 0.5, 0, 1, 2.6, SH7.dot, 0.65); }); }
  else if (E7.anchors){ E7.anchors = null; wires7.forEach(w => { w.visible = false; }); }
  // Respiro: viento verde que te envuelve
  if (E7.swT > 0) for (let k = 0; k < 3; k++){ const a = T * 9 + k * 2.1, r = 0.9; pa(hx + Math.cos(a) * r, hy + 0.2 + ((T * 2 + k * 0.33) % 1) * 1.8, hz + Math.sin(a) * r, -Math.sin(a) * 3, 0.5, Math.cos(a) * 3, k ? 0x7affc8 : 0xffffff, 0.13, 0.4, 0, 1, 0.3, SH7.sq); }
  // Tiempo bala: los proyectiles dejan estela mientras el tiempo va lento
  if (lvl('bulletTime') && slowT > 0) for (const p of projectiles){ if (p.owner !== 'enemy' || rnd() > 0.7) continue; pa(p.m.position.x, p.m.position.y, p.m.position.z, 0, 0, 0, 0xc0d8ff, 0.16, 0.5, 0, 0, 0.3, SH7.dot); }
  // Estela eléctrica: chispazos que saltan del rastro
  if (P5.trail.length && rnd() < 0.6){ const s_ = P5.trail[Math.floor(rnd() * P5.trail.length)].m.position; streak7(s_.x, 0.15, s_.z, rnd() - 0.5, 1, rnd() - 0.5, 0.4, 0xfff27a, 0.08, 0.03); }
  // Lumen: destello al disparar
  if (lvl('lumen') && P5.lumT > E7.lum0 + 0.3){ pa(t7b.x, t7b.y, t7b.z, 0, 0, 0, 0xffe9a0, 0.9, 0.12, 0, 0, 1.5, SH7.star); burst7(PA7, t7b.x, t7b.y, t7b.z, 6, 0xffe9a0, 3, 0.08, 0.25, 0, 0, 0, SH7.sq); }
  E7.lum0 = P5.lumT;
}

/* ---------- Eventos que se detectan por cambios de estado ---------- */
function e7Detect(dt){
  const hx = hero.position.x, hy = hero.position.y, hz = hero.position.z;
  // momento del golpe de cada movimiento (vale para todas las armas)
  const hitNow = state === 'attack' && hitDone && (!E7.hd0 || E7.mv0 !== curMove);
  if (hitNow && curMove){ const mv = curMove, fX = Math.sin(hero.rotation.y), fZ = Math.cos(hero.rotation.y);
    if (mv.slam && !mv.special){
      const cx = hx + fX * 1.3, cz = hz + fZ * 1.3, sl = lvl('slam');
      if (sl){ crack7(cx, cz, 5 + 2 * sl, 1.2 + 0.45 * sl, setOn('impacto')); burst7(PN7, cx, 0.2, cz, 10 + 4 * sl, [0x8a7a6a, 0x6a5a4a, 0xb8a898], 5, 0.16, 0.9, 16, 0.3, 1, SH7.sq, 4); gring(cx, 0.08, cz, 0xffc070, 0.4, 2.4 + 0.5 * sl, 0.4); }
      if (lvl('gomu')) gomuPunch7();
      if (lvl('after')) later(0.35, () => { gring(cx, 1, cz, 0xffc070, 0.4, 3.4, 0.35, hero.rotation.y); gring(cx, 0.1, cz, 0xffe0a0, 0.6, 4.2, 0.45); });
    }
    if (mv.name === 'spin' && lvl('spin')){ gring(hx, 0.1, hz, 0xffffff, 0.5, 3, 0.35); gring(hx, 1, hz, 0x9fe8ff, 0.5, 2.6, 0.3); }
    if (lvl('cafe')) { const a = hero.rotation.y; streak7(hx + fX * 1.2, hy + 1, hz + fZ * 1.2, Math.cos(a), 0, -Math.sin(a), 1.4, 0xc08a50, 0.12, 0.03); }
  }
  E7.hd0 = state === 'attack' && hitDone; E7.mv0 = curMove;
  // Rayo del Ultrahéroe: pose y rayo gordo
  if (lvl('kamen') && P6.kamT > E7.kam0 + 1){ const t = nearestFrom(hx, hz, 8); E7.kamPose = 0.45;
    if (t){ const a = angTo(hx, hz, t.g.position.x, t.g.position.z), L = 8.5, core = addMesh7(new THREE.BoxGeometry(1, 1, 1), addMat7(0xfff6c0, 1));
      ob7({ m: core, own: true, upd(o){ const k = o.t / 0.4; line7(core, hx + Math.sin(a) * 0.5, 1.1, hz + Math.cos(a) * 0.5, hx + Math.sin(a) * L, 1.1, hz + Math.cos(a) * L, 0.8 * (1 - k)); core.material.uniforms.uAlpha.value = 1 - k * 0.5; return k >= 1; }, end(){ core.geometry.dispose(); } });
      for (let k = 1; k <= 4; k++) later(k * 0.04, () => gring(hx + Math.sin(a) * k * 1.8, 1.1, hz + Math.cos(a) * k * 1.8, 0xffe86a, 0.3, 1.3, 0.3, a));
      for (let k = 0; k < 30; k++){ const d = rnd() * L; pa(hx + Math.sin(a) * d, 1.1, hz + Math.cos(a) * d, (rnd() - 0.5) * 3, (rnd() - 0.5) * 3, (rnd() - 0.5) * 3, rnd() < 0.5 ? 0xffe86a : 0xffffff, 0.15, 0.4, 0, 2, 0, SH7.star); }
      flash('#fff6c0', 0.25); } }
  E7.kam0 = P6.kamT;
  // Cuaderno: aparece el libro al escribir un nombre
  if (lvl('note') && noteT > E7.note0 + 5){ E7.bookT = 1.6; }
  E7.note0 = noteT;
  // Bolsillo mágico: cachivache nuevo
  if (lvl('pocket') && P6.gadget && P6.gadget !== E7.gadget0){ ring7(PA7, hx, hy + 1.6, hz, 24, [0x6ab8ff, 0xffffff, 0xffd23a], 4, 0.18, 0.6, 0, 1, 0, SH7.star, 2); gring(hx, 0.1, hz, 0x6ab8ff, 0.3, 2.6, 0.5); }
  E7.gadget0 = P6.gadget;
  // Puerta a cualquier parte: dos puertas rosas
  if (P6.doorUsed && !E7.door0 && lvl('pocket')){ if (E7.lastX != null) doorAt7(E7.lastX, E7.lastZ); doorAt7(hx, hz); }
  E7.door0 = P6.doorUsed; E7.lastX = hx; E7.lastZ = hz;
  // Tiempo bala: barras de cine
  if (lvl('bulletTime') && P5.btCd > E7.bt0 + 3){ E7.btT = 1.1; gring(hx, 1, hz, 0xc0d8ff, 0.3, 3, 0.5, hero.rotation.y); gring(hx, 0.1, hz, 0xc0d8ff, 0.3, 3.5, 0.6); }
  E7.bt0 = P5.btCd; E7.btT = Math.max(0, E7.btT - dt); bars7.classList.toggle('on', E7.btT > 0 && gameState === 'play');
  // Zapatillas con muelles / gorrocóptero: el doble salto se nota
  if (P5.airJ > E7.airJ0){ E7.springT = 0.35; gring(hx, hy + 0.05, hz, 0xffffff, 0.2, 1.4, 0.3); ring7(PA7, hx, hy, hz, 14, [0xffffff, 0xc8d8ff], 3.5, 0.12, 0.35, 0, 2, 0, SH7.star); shoutHero7('¡Boing!', '#ffffff', 2.2); }
  E7.airJ0 = P5.airJ;
  if (P6.gadgetJ > E7.gadJ0){ gring(hx, hy + 2, hz, 0xffd23a, 0.2, 1.4, 0.3); ring7(PA7, hx, hy + 2, hz, 12, 0xffd23a, 3, 0.1, 0.3, 0, 2, 0, SH7.star); }
  E7.gadJ0 = P6.gadgetJ;
  // Pogo: rebote
  const pogoNow = lvl('pogo') && state === 'normal' && !grounded && vy > 8.5 && E7.pogo0;
  if (pogoNow){ gring(hx, hy + 0.1, hz, 0xffc070, 0.3, 2.2, 0.35); ring7(PA7, hx, hy + 0.1, hz, 16, [0xffc070, 0xffffff], 4, 0.14, 0.35, 0, 2, 0, SH7.star); }
  E7.pogo0 = state === 'attack' && curMove && curMove.dive;
  // Stonks: cuando caen, flecha roja
  if (lvl('stonks') && stonks < E7.stonks0){ E7.notStonksT = 1.4; burst7(PN7, hx, hy + 2.6, hz, 14, [0xff4a4a, 0xff8a7a], 3, 0.13, 0.7, 6, 0, 1, SH7.sq); }
  E7.stonks0 = stonks;
  // Brazos de goma: posturas
  if (E7.wigQ && state !== 'roll'){ E7.wigQ = 0; E7.wigT = 0.9; }
  E7.wigT = Math.max(0, E7.wigT - dt); E7.kamPose = Math.max(0, E7.kamPose - dt); E7.clapT = Math.max(0, E7.clapT - dt);
  if (E7.wigT > 0 && rnd() < 0.5){ pa(hx + (rnd() - 0.5) * 0.8, hy + 0.8 + rnd() * 0.6, hz + (rnd() - 0.5) * 0.8, 0, 1.2, 0, rnd() < 0.5 ? 0xff8ac8 : 0xffe24a, 0.16, 0.6, 0, 1, 0.3, SH7.heart); }
}
function doorAt7(x, z){
  const g = doorProto7.clone(); scene.add(g); g.position.set(x, 0, z); g.lookAt(camera.position.x, 0, camera.position.z); const hinge = g.children[0];
  ring7(PA7, x, 1, z, 20, [0xff8ac8, 0xffffff], 3, 0.16, 0.6, 0, 1, 0, SH7.heart, 1);
  ob7({ m: g, upd(o){ const k = o.t; g.scale.setScalar(Math.min(1, k * 6)); hinge.rotation.y = k < 0.25 ? -smooth(k / 0.25) * 1.6 : k < 0.9 ? -1.6 : -1.6 * (1 - smooth((k - 0.9) / 0.25));
    if (k > 1.15) g.scale.setScalar(Math.max(0.01, 1 - (k - 1.15) * 5)); return k > 1.35; } });
}

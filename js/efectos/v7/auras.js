'use strict';
/* ---------- Brazos de goma ----------
   La manga se queda en el codo y la mano sale disparada, unida por un brazo de goma
   que se estira, adelgaza y rebota como un muelle. */
function gomuRig7(A){
  const el = A.el, h = new THREE.Group(); el.add(h);
  [el.children[2], el.children[3]].forEach(k => h.add(k));                  // guante y pulgar pasan a la «mano»
  const geo = new THREE.CylinderGeometry(0.095, 0.095, 1, 6); geo.translate(0, -0.5, 0);
  const tube = mesh(geo, MA7.skin, 0, -0.13, 0.005, el); tube.visible = false;
  const ring = mesh(new THREE.TorusGeometry(0.075, 0.02, 4, 8), MA7.cupW, 0, -0.14, 0.005, el); ring.rotation.x = Math.PI / 2; ring.visible = false;
  A.hand = h; A.tube = tube; A.tring = ring;
}
gomuRig7(P.armL); gomuRig7(P.armR);
function setExt7(A, ext){
  A.hand.position.y = -ext; const on = ext > 0.02; A.tube.visible = on; A.tring.visible = on;
  if (on){ const th = 1 / Math.sqrt(1 + ext * 0.45); A.tube.scale.set(th, 0.15 + ext, th); }
  A.hand.scale.setScalar(1 + Math.min(0.45, ext * 0.28));
}
function e7Arms(dt, live){
  const on = live && lvl('gomu') > 0;
  if (!on){ if (E7.armOn){ E7.armOn = false; E7.armS = E7.armLS = 1; E7.armV = E7.armLV = 0; setExt7(P.armR, 0); setExt7(P.armL, 0); if (staffInHand) staff.position.y = -0.84; } return; }
  E7.armOn = true;
  let tgt = 1;
  if (state === 'attack' && curMove && !curMove.special && !curMove.dive){ const t = stepT / curMove.dur, a = curMove.trail ? curMove.trail[0] : 0.3, b = curMove.trail ? curMove.trail[1] : 0.6;
    if (t > a - 0.12 && t < b + 0.12) tgt = curMove.slam ? 4.6 : 3.4; }
  else if (state === 'charge') tgt = 1.9 + Math.sin(time * 30) * 0.15;
  if (dt > 0){ E7.armV += ((tgt - E7.armS) * 330 - E7.armV * 9) * dt; E7.armS = clamp(E7.armS + E7.armV * dt, 0.7, 5.2);
    const tl = 1 + walkW * 0.7 * Math.abs(Math.sin(phase)) + (grounded ? 0 : 0.7) + (state === 'attack' ? 0.8 : 0);
    E7.armLV += ((tl - E7.armLS) * 170 - E7.armLV * 5) * dt; E7.armLS = clamp(E7.armLS + E7.armLV * dt, 0.7, 3.2); }
  const extR = Math.max(0, E7.armS - 1) * 0.62 + (E7.puno ? E7.puno.ext : 0), extL = Math.max(0, E7.armLS - 1) * 0.5;
  setExt7(P.armR, extR); setExt7(P.armL, extL);
  { const F = P.armR.puno7, on = !!E7.puno;   // Pistola de goma: la mano se hace un puño gordo (el brazo apunta al blanco en legendPose)
    if (on) P.armR.hand.scale.setScalar(1 + 1.4 * E7.puno.k);
    if (F && F.visible !== on){ F.visible = on; P.armR.hand.children.forEach(c => { if (c !== F) c.visible = !on; }); } }
  if (staffInHand) staff.position.y = -0.84 - extR;
  // líneas elásticas a lo largo del brazo cuando se estira mucho
  if (extR > 0.6 && dt > 0) for (let k = 0; k < 2; k++){ P.armR.el.localToWorld(t7a.set((rnd() - 0.5) * 0.1, -0.2 - rnd() * extR, 0)); P.armR.el.localToWorld(t7b.set(0, -1, 0)).sub(P.armR.el.getWorldPosition(t7c));
    streak7(t7a.x, t7a.y, t7a.z, t7b.x, t7b.y, t7b.z, 0.35, 0xfff0d8, 0.08, 0.022); }
}
const _heroMinYE7 = heroMinY;
heroMinY = function(){ const r = P.armR.hand.position.y, l = P.armL.hand.position.y, sr = P.armR.hand.scale.x, sl = P.armL.hand.scale.x; if (r === 0 && l === 0) return _heroMinYE7();
  P.armR.hand.position.y = 0; P.armL.hand.position.y = 0; P.armR.hand.scale.setScalar(1); P.armL.hand.scale.setScalar(1);
  const v = _heroMinYE7(); P.armR.hand.position.y = r; P.armL.hand.position.y = l; P.armR.hand.scale.setScalar(sr); P.armL.hand.scale.setScalar(sl); return v; };
// Mientras dura la Pistola de goma, el hombro apunta al blanco (el brazo se estira a lo largo de su −y)
const _legendPoseG7 = legendPose, gomuQ7 = new THREE.Quaternion(), gomuY7 = new V3(0, -1, 0);
legendPose = function(){ _legendPoseG7(); const G = E7.puno; if (!G) return;
  const sh = P.armR.sh; sh.parent.updateWorldMatrix(true, false); sh.parent.localToWorld(t7c.copy(sh.position));
  t7d.set(G.tx - t7c.x, G.ty - t7c.y, G.tz - t7c.z).normalize(); sh.parent.getWorldQuaternion(gomuQ7).invert(); t7d.applyQuaternion(gomuQ7);
  gomuQ7.setFromUnitVectors(gomuY7, t7d); sh.quaternion.slerp(gomuQ7, Math.min(1, G.k * 3)); P.armR.el.rotation.set(0, 0, 0); };
// «¡Pistola de goma!»: el propio brazo izquierdo (P.armR, el del arma) se estira hasta el enemigo y la mano se hincha.
// Antes salía un puño con su brazo desde el hombro, junto al de verdad, y parecía que Tovan tuviera tres brazos.
function gomuPunch7(){
  const hx = hero.position.x, hz = hero.position.z, f = hero.rotation.y;
  let t = null, bd = 7.5; for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue; const dx = e.g.position.x - hx, dz = e.g.position.z - hz, d = Math.hypot(dx, dz);
    if (d < bd && (dx * Math.sin(f) + dz * Math.cos(f)) / (d || 1) > 0.55){ bd = d; t = e; } }
  const tx = t ? t.g.position.x : hx + Math.sin(f) * 5.5, tz = t ? t.g.position.z : hz + Math.cos(f) * 5.5, ty = t ? 0.9 * (t.scale || 1) : 1.1;
  if (!P.armR.puno7){ const F = P.armR.puno7 = fistProto7.clone(); F.rotation.x = Math.PI / 2; F.position.y = -0.27; F.scale.setScalar(0.6); F.visible = false; P.armR.hand.add(F); }
  const hitSet = new Set(), G = E7.puno = { tx, ty, tz, ext: 0, k: 0 };
  ob7({ upd(o, dt){ if (E7.puno !== G) return true;
      P.armR.el.getWorldPosition(t7a); const dist = Math.hypot(tx - t7a.x, ty - t7a.y, tz - t7a.z);
      const k = o.t < 0.11 ? smooth(o.t / 0.11) : o.t < 0.2 ? 1 : 1 - smooth(Math.min(1, (o.t - 0.2) / 0.22));
      G.k = k; G.ext = Math.max(0, dist - 0.45) * k * (1 + (o.t > 0.2 ? Math.sin(o.t * 50) * 0.08 * (1 - k) : 0));
      P.armR.hand.getWorldPosition(t7b);
      if (o.t < 0.11) streak7(t7b.x, t7b.y, t7b.z, tx - t7a.x, 0, tz - t7a.z, 1.2, 0xffffff, 0.12, 0.03, 0);
      if (o.t >= 0.11 && !o.hit){ o.hit = true; shake = Math.max(shake, 0.3); play('slam'); shout7('¡PISTOLA DE GOMA!', '#ffd070', tx, ty + 1.6, tz);
        gring(tx, ty, tz, 0xffffff, 0.3, 2.2, 0.3, angTo(hx, hz, tx, tz)); gring(tx, 0.1, tz, 0xffc070, 0.3, 2.6, 0.35); burst7(PA7, tx, ty, tz, 22, [0xffe070, 0xffffff, 0xffb060], 7, 0.2, 0.4, 2, 2, 0, SH7.star);
        for (const e of enemies){ if (!e.alive || e.spawnT > 0 || hitSet.has(e)) continue; const dx = e.g.position.x - tx, dz = e.g.position.z - tz, d = Math.hypot(dx, dz);
          if (d - e.r < 1.2){ hitSet.add(e); const a = angTo(hx, hz, e.g.position.x, e.g.position.z); hitEnemy(e, rdmg(16), rnd() < up.crit, Math.sin(a), Math.cos(a), 7, 2, false, { src: 'aoe' }); } } }
      return o.t > 0.42; }, end(){ if (E7.puno === G) E7.puno = null; } });
}

/* ---------- Auras ---------- */
function e7Aura(dt, live){
  let best = null; const req = (amt, c1, c2) => { if (amt > 0 && (!best || amt > best[0])) best = [amt, c1, c2]; };
  if (live){
    if (superOn) req(state === 'attack' ? 0.32 : 0.72, 0xffd23a, 0xfff6c0);   // más fina al pegar: que se vean los puños
    if (P6.bankaiT > 0) req(1.05, 0xff1a2a, 0x3a0008);
    if (lvl('berserk') && player.hp < player.maxHp * 0.45) req(0.5 + (0.45 - player.hp / player.maxHp) * 1.6, 0xd8001a, 0x5a0008);
    if (fineOn) req(0.8, 0xff6a10, 0xffd040);
    if (lvl('frenzy') && combo >= 25) req(Math.min(0.95, 0.35 + combo / 160), 0xff3a2a, 0xffa080);
    if (lvl('express') && time - P5.rollT < 1.5) req(0.75 * (1 - (time - P5.rollT) / 1.5) + 0.2, 0xff8a1a, 0xffe070);
    if (P5.ghostT > 0) req(0.7, 0xa8c8ff, 0xffffff);
    if (E7.swT > 0) req(0.85, 0x7affc8, 0xffffff);
    if (lvl('strawberry') && P6.milk) req(0.22, 0xff8ac8, 0xffd0e8);
    if (P6.janReady && lvl('jan')) req(0.45, 0xff9a2a, 0xffe070);
    if (state === 'charge' && chargeLvl === 2 && lvl('overcharge')) req(0.8, 0xfff27a, 0xffffff);
    if (P6.gadget === 'guante' && lvl('pocket')) req(0.18, 0xff3a3a, 0xffb0a0);
  }
  E7.swT = Math.max(0, E7.swT - dt);
  const tgt = best ? Math.min(1.2, best[0]) : 0;
  E7.auraA += (tgt - E7.auraA) * (1 - Math.exp(-dt * 8));
  const on = E7.auraA > 0.02;
  aura7.forEach((m, i) => { m.visible = on; if (!on) return; const u = m.material.uniforms; u.uAmt.value = E7.auraA * (i ? 1.1 : 0.85); u.uT.value = time * (i ? 1.3 : 1);
    if (best){ u.uColor.value.setHex(i ? best[2] : best[1]); u.uColor2.value.setHex(i ? best[1] : best[2]); } m.rotation.y += dt * (i ? -2 : 1.4); });
  if (on && best && dt > 0 && rnd() < E7.auraA * 1.2){ const a = rnd() * TAU, r = 0.35 + rnd() * 0.35;
    pa(hero.position.x + Math.cos(a) * r, hero.position.y + rnd() * 0.6, hero.position.z + Math.sin(a) * r, 0, 3 + rnd() * 3, 0, rnd() < 0.5 ? best[1] : best[2], 0.11, 0.45, 0, 0.5, 0.3, SH7.sq); }
  if (live && superOn && dt > 0 && rnd() < dt * 5){ const a = rnd() * TAU; streak7(hero.position.x + Math.cos(a) * 0.5, hero.position.y + 0.6 + rnd() * 1.2, hero.position.z + Math.sin(a) * 0.5, rnd() - 0.5, rnd() - 0.5, rnd() - 0.5, 0.5, 0xbff6ff, 0.08, 0.03); }
}

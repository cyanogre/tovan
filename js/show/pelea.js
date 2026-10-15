'use strict';
/* ======================================================================
   JUEGO 1 · PELEA DE LA FAMA (lucha 2D)
   ====================================================================== */
const FAT9 = {
  jab:   { dur: 0.24, a: [0.07, 0.15], reach: 34, dmg: 1.0, knock: 55, stun: 0.3, pose: 'jab', snd: 'swing' },
  cross: { dur: 0.3, a: [0.1, 0.18], reach: 40, dmg: 1.3, knock: 75, stun: 0.34, pose: 'jab', snd: 'swing' },
  upper: { dur: 0.46, a: [0.12, 0.24], reach: 32, dmg: 2.0, knock: 95, stun: 0.7, launch: 190, pose: 'upper', snd: 'swingBig' },
  akick: { dur: 0.42, a: [0.05, 0.34], reach: 32, dmg: 1.6, knock: 85, stun: 0.42, pose: 'akick', snd: 'swing', air: true },
  onda:  { dur: 0.46, a: [0.2, 0.2], proj: true, pose: 'cast', snd: 'beam' }
};
const EAT9 = {
  jab:   { w: 0.46, act: 0.1, dur: 0.8, reach: 32, dmg: 6, pose: ['windup', 'jab'] },
  kick:  { w: 0.48, act: 0.36, dur: 1.1, reach: 32, dmg: 8, pose: ['jump', 'akick'], jump: true },
  flash: { w: 0.62, act: 0.05, dur: 0.95, proj: true, dmg: 7, pose: ['phone', 'phone'], txt: '¡SELFIE!' },
  dash:  { w: 0.75, act: 0.38, dur: 1.3, reach: 28, dmg: 11, pose: ['windup', 'dash'], txt: '¡FIRMA RELÁMPAGO!', dash: true },
  taunt: { w: 1.1, act: 0, dur: 1.1, pose: ['taunt', 'taunt'], txt: '¡Soy el número 1!' }
};
const FT9 = {
  overlay: true, song: 'mgFight', title: ['PROGRAMA 1', '¡Pelea de la Fama!', 'Lucha 1 contra 1 · J golpea (pulsa seguido para el combo) · L lanza una onda · K esquiva · mantén atrás para cubrirte'], ep: 'ep-arcade',
  start(){
    this.p = { x: 92, y: GROUND9, vx: 0, vy: 0, face: 1, pose: cpPose9(POSE9.idle), atk: null, atkT: 0, hit: false, queued: false, chain: 0, dashT: 0, dodge: 0, hitstun: 0, flash: 0, block: false };
    this.e = { x: 228, y: GROUND9, vx: 0, vy: 0, face: -1, pose: cpPose9(POSE9.taunt), atk: null, atkT: 0, hitDone: false, hitstun: 0, flash: 0, cd: 1.0, hits: 0, comboT: 0, ko: 0 };
    this.proj = []; this.intro = 2.0; this.ko = 0; this.freeze = 0; this.hintT = 8;
    big9('ROUND 1', '¡PELEA!', 1.6);
  },
  btn(b){
    const p = this.p; if (this.intro > 0 || this.ko || p.hitstun > 0) return;
    const ground = p.y >= GROUND9 - 0.5;
    if (b === 'jump' && ground && !p.atk && p.dashT <= 0){ p.vy = -265; play('jump'); burst9(p.x, p.y, 6, ['#d8d0e8'], 40, 2, 0.3, 0); }
    else if (b === 'attack'){ if (p.atk){ if (!p.atk.air && p.atkT > p.atk.a[0] && p.chain < 2) p.queued = true; return; } this.pAtk(ground ? 'jab' : 'akick'); }
    else if (b === 'roll' && (!p.atk || (!p.atk.proj && p.atkT > p.atk.a[1])) && p.dashT <= 0){ p.atk = null; const ax = mgAxis().x; p.dashDir = Math.abs(ax) > 0.3 ? Math.sign(ax) : -p.face; p.dashT = 0.2; p.dodge = 0.34; play('roll');
      for (let i = 0; i < 6; i++) part9(p.x, p.y - 20 - rnd() * 20, -p.dashDir * 60, 0, '#9fe8ff', 3, 0.3, 0); }
    else if (b === 'special' && !p.atk){ if (player.meter >= 25){ player.meter -= 25; this.pAtk('onda'); } else { num9(p.x, p.y - 66, 'Falta ÍMP', '#9fe8ff', 7); play('cursor'); } }
  },
  pAtk(n){ const p = this.p; p.atk = FAT9[n]; p.atkN = n; p.atkT = 0; p.hit = false; p.queued = false; p.chain = n === 'cross' ? 1 : n === 'upper' ? 2 : 0; play(p.atk.snd); if (!p.atk.air) p.vx = p.face * 50; },
  upd(dt){
    const p = this.p, e = this.e, ax = mgAxis();
    p.flash = Math.max(0, p.flash - dt * 6); e.flash = Math.max(0, e.flash - dt * 6); this.hintT -= dt;
    if (this.freeze > 0){ this.freeze -= dt; return; }
    if (this.ko){ this.ko -= dt * 0.5; e.hitstun = 1; lerpPose9(e.pose, POSE9.ko, 1 - Math.exp(-dt * 6)); e.vx *= Math.exp(-dt * 2); e.x = clamp(e.x + e.vx * dt, 16, 304);
      lerpPose9(p.pose, POSE9.win, 1 - Math.exp(-dt * 8)); if (this.ko <= 0) MG.endT = 0.01; return; }
    if (this.intro > 0){ this.intro -= dt; lerpPose9(e.pose, POSE9.taunt, 1 - Math.exp(-dt * 8)); lerpPose9(p.pose, POSE9.guard, 1 - Math.exp(-dt * 8)); if (this.intro < 1.2 && !this.said){ this.said = true; num9(e.x, e.y - 72, '¡A por mis fans!', '#ffd23a', 8); } return; }
    // --- Tovan ---
    const ground = p.y >= GROUND9 - 0.5, dist = Math.abs(e.x - p.x);
    p.dodge = Math.max(0, p.dodge - dt);
    if (p.hitstun > 0){ p.hitstun -= dt; p.vx *= Math.exp(-dt * 5); lerpPose9(p.pose, POSE9.hurt, 1 - Math.exp(-dt * 14)); }
    else if (p.atk){ p.atkT += dt; const A = p.atk, k = p.atkT / A.dur;
      lerpPose9(p.pose, POSE9[A.pose], 1 - Math.exp(-dt * 30)); p.vx *= Math.exp(-dt * 8);
      if (A.proj && !p.hit && p.atkT >= A.a[0]){ p.hit = true; this.proj.push({ x: p.x + p.face * 22, y: p.y - 34, vx: p.face * 230, own: 'p', r: 9, life: 2 }); MG.flashA = 0.2; MG.flashC = '#bff6ff'; }
      if (!A.proj && !p.hit && p.atkT >= A.a[0] && p.atkT <= A.a[1]){ const dx = (e.x - p.x) * p.face;
        if (dx > -8 && dx < A.reach + 10 && Math.abs(e.y - p.y) < (A.air ? 46 : 34)) { p.hit = true; this.hitE(A); } }
      if (p.atkT >= A.dur){ const nx = p.queued ? (p.atkN === 'jab' ? 'cross' : p.atkN === 'cross' ? 'upper' : null) : null; p.atk = null; if (nx && ground) this.pAtk(nx); } }
    else if (p.dashT > 0){ p.dashT -= dt; p.vx = p.dashDir * 280; lerpPose9(p.pose, POSE9.dash, 1 - Math.exp(-dt * 20)); if (rnd() < 0.6) part9(p.x, p.y - 10 - rnd() * 30, -p.dashDir * 30, 0, '#9fe8ff', 2, 0.25, 0); }
    else { p.face = e.x > p.x ? 1 : -1; p.vx = ax.x * 82; p.block = ground && ax.x * p.face < -0.3;
      if (p.block){ p.vx *= 0.45; lerpPose9(p.pose, POSE9.block, 1 - Math.exp(-dt * 16)); }
      else if (!ground) lerpPose9(p.pose, POSE9.jump, 1 - Math.exp(-dt * 12));
      else if (Math.abs(ax.x) > 0.2) lerpPose9(p.pose, Math.sin(MG.t * 12) > 0 ? POSE9.walkA : POSE9.walkB, 1 - Math.exp(-dt * 12));
      else lerpPose9(p.pose, POSE9.guard, 1 - Math.exp(-dt * 10)); }
    if (!ground || p.vy < 0){ p.vy += 760 * dt; p.y += p.vy * dt; if (p.y >= GROUND9){ p.y = GROUND9; p.vy = 0; burst9(p.x, p.y, 4, ['#d8d0e8'], 30, 2, 0.25, 0); } }
    p.x = clamp(p.x + p.vx * dt, 14, 306);
    // --- Míster Confianza ---
    this.eUpd(dt);
    // empujarse
    if (Math.abs(p.x - e.x) < 18 && Math.abs(p.y - e.y) < 30){ const s = p.x < e.x ? -1 : 1, o = (18 - Math.abs(p.x - e.x)) / 2; p.x = clamp(p.x + s * o, 14, 306); e.x = clamp(e.x - s * o, 14, 306); }
    // proyectiles
    for (let i = this.proj.length - 1; i >= 0; i--){ const q = this.proj[i]; q.x += q.vx * dt; q.life -= dt; let gone = q.life <= 0 || q.x < -20 || q.x > MGW + 20;
      if (rnd() < 0.8) part9(q.x, q.y + (rnd() - 0.5) * q.r, -q.vx * 0.1, (rnd() - 0.5) * 20, q.own === 'p' ? '#7ff5ff' : '#fff6a0', 3, 0.3, 0);
      for (const o of this.proj) if (o !== q && o.own !== q.own && Math.abs(o.x - q.x) < 12){ gone = true; o.life = 0; burst9(q.x, q.y, 18, ['#ffffff', '#7ff5ff', '#fff6a0'], 90, 3, 0.4, 0); play('boom'); }
      if (!gone && q.own === 'p' && Math.abs(q.x - e.x) < 12 && e.hitstun < 0.5){ gone = true; this.hitE({ dmg: 3.4, knock: 110, stun: 0.6 }, q.x); burst9(q.x, q.y, 20, ['#7ff5ff', '#ffffff'], 100, 3, 0.4, 0); }
      if (!gone && q.own === 'e' && Math.abs(q.x - p.x) < 10 && p.y > GROUND9 - 30){ gone = true; this.hitP(q.dmg, q.x); }
      if (gone) this.proj.splice(i, 1); }
  },
  hitE(A, hx){
    const p = this.p, e = this.e; if (e.ko) return;
    e.hitstun = A.stun; e.atk = null; e.vx = p.face * A.knock; if (A.launch) e.vy = -A.launch; e.flash = 1; e.hits++; e.comboT = 1.2;
    const x = hx != null ? hx : e.x - p.face * 8; mgDmg(A.dmg, e.x, e.y - 66); burst9(x, e.y - 34, 14, ['#ffffff', '#ffd23a', '#ff8a3a'], 110, 3, 0.35, 120);
    MG.shake = Math.max(MG.shake, 0.12); this.freeze = 0.06;
    if (e.hits >= 2) num9(e.x, e.y - 82, `${e.hits} GOLPES`, '#ff8ad8', 8);
    if (rnd() < 0.18) num9(e.x + 10, e.y - 92, ['¡Mi pelo!', '¡Eso no cuenta!', '¡Ay, el traje!', '¡Mis fans miran!'][Math.floor(rnd() * 4)], '#ffd23a', 7);
  },
  hitP(dmg, hx){
    const p = this.p, e = this.e;
    if (p.dodge > 0){ num9(p.x, p.y - 66, '¡Esquivado!', '#9fe8ff', 8); return; }
    if (p.block){ const r = mgHurt(dmg * 0.15, p.x, p.y - 60); p.vx = -p.face * 90; burst9(hx != null ? hx : p.x + p.face * 10, p.y - 36, 10, ['#9fe8ff', '#ffffff'], 70, 2, 0.3, 0); num9(p.x, p.y - 74, '¡Bloqueo!', '#9fe8ff', 8); play('block'); return r; }
    const r = mgHurt(dmg, p.x, p.y - 60); if (r === 'hit'){ p.hitstun = 0.38; p.atk = null; p.vx = e.face * 100; p.flash = 1; e.calm = 0.9; burst9(p.x, p.y - 36, 12, ['#ff5a5a', '#ffffff'], 90, 3, 0.35, 120); }
    return r;
  },
  eUpd(dt){
    const p = this.p, e = this.e, ground = e.y >= GROUND9 - 0.5, dist = Math.abs(p.x - e.x), fast = bossE && bossE.hp < bossE.maxHp * 0.86 ? 0.9 : 1; e.fastK = fast; if (e.calm > 0) e.calm -= dt;
    if (e.comboT > 0){ e.comboT -= dt; if (e.comboT <= 0) e.hits = 0; }
    if (!ground || e.vy < 0){ e.vy += 760 * dt; e.y += e.vy * dt; if (e.y >= GROUND9){ e.y = GROUND9; e.vy = 0; } }
    e.x = clamp(e.x + e.vx * dt, 14, 306);
    if (e.hitstun > 0){ e.hitstun -= dt; e.vx *= Math.exp(-dt * 5); lerpPose9(e.pose, POSE9.hurt, 1 - Math.exp(-dt * 14)); if (e.hitstun <= 0) e.cd = Math.min(e.cd, 0.35 + rnd() * 0.4); return; }
    if (e.atk){ const A = e.atk; e.atkT += dt; const w = A.w * fast, act = e.atkT >= w && e.atkT <= w + A.act;
      lerpPose9(e.pose, POSE9[A.pose[e.atkT < w ? 0 : 1]], 1 - Math.exp(-dt * (e.atkT < w ? 10 : 26)));
      if (e.atkT < w && A.dash && rnd() < 0.5) part9(e.x + (rnd() - 0.5) * 20, e.y - rnd() * 50, 0, -20, '#ffe24a', 2, 0.3, 0);
      if (A.jump && !e.jumped && e.atkT >= w * 0.6){ e.jumped = true; e.vy = -230; e.vx = e.face * 110; }
      if (A.dash && act) e.vx = e.face * 330; else if (!A.jump) e.vx *= Math.exp(-dt * 8);
      if (A.proj && act && !e.hitDone){ e.hitDone = true; this.proj.push({ x: e.x + e.face * 18, y: e.y - 36, vx: e.face * 175, own: 'e', r: 8, life: 2.4, dmg: A.dmg }); MG.flashA = 0.3; MG.flashC = '#ffffff'; play('pew'); }
      if (!A.proj && A.reach && act && !e.hitDone){ const dx = (p.x - e.x) * e.face;
        if (dx > -10 && dx < A.reach + 8 && (A.jump ? Math.abs(p.y - e.y) < 46 : p.y > GROUND9 - 28)){ e.hitDone = true; this.hitP(A.dmg, e.x + e.face * 16); } }
      if (e.atkT >= A.dur * (A.dash ? 1 : fast)){ e.atk = null; e.jumped = false; e.cd = (0.45 + rnd() * 0.75) * fast; }
      return; }
    e.face = p.x > e.x ? 1 : -1; e.cd -= dt;
    if (e.cd <= 0 && !(e.calm > 0) && !player.dead){ let n; const r = rnd();
      if (dist < 44) n = r < 0.5 ? 'jab' : r < 0.72 ? 'kick' : r < 0.86 ? 'dash' : 'taunt';
      else if (dist < 110) n = r < 0.35 ? 'dash' : r < 0.65 ? 'flash' : r < 0.85 ? 'kick' : 'taunt';
      else n = r < 0.5 ? 'flash' : r < 0.85 ? 'dash' : 'taunt';
      e.atk = EAT9[n]; e.atkT = 0; e.hitDone = false; e.jumped = false; if (e.atk.txt) num9(e.x, e.y - 76, e.atk.txt, '#ffd23a', 8); if (n === 'dash') play('charge'); else if (n !== 'taunt') play('cursor'); return; }
    const want = dist > 70 ? 1 : dist < 30 ? -1 : 0; e.vx = want * e.face * 58;
    lerpPose9(e.pose, want ? (Math.sin(MG.t * 10) > 0 ? POSE9.walkA : POSE9.walkB) : POSE9.idle, 1 - Math.exp(-dt * 10));
  },
  finish(){ this.ko = 1.6; this.e.vx = this.p.face * 120; this.e.vy = -150; big9('K.O.', '¡Míster Confianza besa la lona!', 1.6, '#ff4a5a'); play('specialBoom'); MG.flashA = 0.6; MG.flashC = '#ffffff'; MG.shake = 0.5;
    burst9(this.e.x, this.e.y - 40, 40, ['#ffd23a', '#ffffff', '#ff5a5a'], 150, 3, 0.8, 100); },
  draw(t){
    const p = this.p, e = this.e; bgStudio9(t);
    shadow9(p.x, GROUND9 + 1, 12); shadow9(e.x, GROUND9 + 1, 12);
    puppet9('star', e.x, e.y, e.face, e.pose, 1.08, { flash: e.flash, shine: true, ph: 1.3, weapon: e.atk === EAT9.flash ? 'phone' : null });
    if (e.atk && e.atk !== EAT9.taunt && e.atkT < e.atk.w * (e.fastK || 1)){ const k = e.atkT / (e.atk.w * (e.fastK || 1)), dash = e.atk.dash, cx = Math.round(e.x), cy = Math.round(e.y - 92 - (1 - k) * 4);
      rect9(cx - 7, cy - 7, 14, 15, dash ? '#ff3a4a' : '#ffd23a'); rect9(cx - 6, cy - 6, 12, 13, dash ? '#ff8a8a' : '#fff2a0'); txt9(dash ? '!!' : '!', cx, cy - 5, 10, '#2a0e30', 'center', false);
      if (dash) txt9('SALTA O ESQUIVA', cx, cy - 18, 7, '#ff8a8a', 'center'); }
    puppet9('tovan', p.x, p.y, p.face, p.pose, 1, { flash: p.flash, weapon: 'staff', alpha: p.dodge > 0 ? 0.55 : 1, hurt: p.hitstun > 0 });
    for (const q of this.proj){ const c = q.own === 'p' ? ['#2a8aff', '#7ff5ff', '#ffffff'] : ['#ffb020', '#fff6a0', '#ffffff'];
      mgX.fillStyle = c[0]; mgX.beginPath(); mgX.arc(q.x, q.y, q.r + 2 + Math.sin(t * 30) * 1.5, 0, TAU); mgX.fill(); mgX.fillStyle = c[1]; mgX.beginPath(); mgX.arc(q.x, q.y, q.r - 1, 0, TAU); mgX.fill(); rect9(q.x - 2, q.y - 2, 4, 4, c[2]); }
    drawP9(); drawN9();
    // HUD de lucha
    bar9(8, 22, 128, 8, player.hp / player.maxHp, '#ffd23a', '#5a0a14'); txt9('TOVAN', 8, 32, 8, '#ffffff');
    const bf = bossE ? bossE.hp / bossE.maxHp : 0; bar9(184, 22, 128, 8, bf, '#ffd23a', '#5a0a14', true); txt9('MÍSTER CONFIANZA', 312, 32, 8, '#ffffff', 'right');
    for (const th of MG_THR) if (th > 0) rect9(184 + Math.round(128 * (1 - th)), 21, 1, 10, '#000');
    txt9('VS', 160, 20, 11, '#ff4a5a', 'center'); bar9(8, 170, 50, 4, player.meter / 100, '#7ff5ff', '#0a1a3a'); txt9('ÍMP', 62, 167, 7, '#7ff5ff');
    if (this.hintT > 0) txt9('J golpe · L onda · K esquiva · ← cubrirse · «!» = va a atacar', 196, 168, 7, '#d8d0ff', 'center');
  },
  end(){}
};

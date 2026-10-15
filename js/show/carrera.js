'use strict';
/* ======================================================================
   JUEGO 2 · CARRERA CONFIANZA (runner disparando)
   ====================================================================== */
const RN9 = {
  overlay: true, song: 'mgRun', title: ['PROGRAMA 2', '¡Carrera Confianza!', 'Runner · Espacio salta (doble salto) · K se desliza · J dispara (mantén) · L rayo (50 ÍMP)'], ep: 'ep-run',
  start(){
    this.p = { x: 72, y: GROUND9, vy: 0, jumps: 0, slide: 0, flash: 0, shotT: 0, pose: cpPose9(POSE9.run1), inv: 0 };
    this.e = { x: 262, y: 70, ty: 70, t: 0, atkT: 2.2, flash: 0, pose: cpPose9(POSE9.fly), retT: 1.5 };
    this.obs = []; this.shots = []; this.scroll = 0; this.speed = 125; this.dist = 0; this.beam = 0; this.intro = 1.4; this.ko = 0; this.hintT = 8; this.clk = 0; this.wind = null;
    big9('¡A CORRER!', 'Esquiva sus regalos y dispárale', 1.4, '#ffe24a');
  },
  btn(b){
    const p = this.p; if (this.intro > 0 || this.ko) return; const ground = p.y >= GROUND9 - 0.5;
    if (b === 'jump'){ if (ground){ p.vy = -255; p.jumps = 1; p.slide = 0; play('jump'); } else if (p.jumps < 2){ p.vy = -225; p.jumps = 2; play('boing'); burst9(p.x, p.y - 4, 8, ['#ffffff', '#9fe8ff'], 50, 2, 0.3, 0); } }
    else if (b === 'roll' && !ground){ p.vy = Math.max(p.vy, 420); p.slideQ = true; }            // en el aire: cae rápido y se desliza al tocar suelo
    else if (b === 'roll' && ground){ p.slide = 0.55; play('roll'); for (let i = 0; i < 6; i++) part9(p.x - 6, p.y - 2, -60 - rnd() * 40, -rnd() * 20, '#d8d0e8', 2, 0.35, 0); }
    else if (b === 'attack') this.shoot();
    else if (b === 'special'){ if (player.meter >= 50 && this.beam <= 0){ player.meter -= 50; this.beam = 0.9; play('beam'); MG.flashA = 0.4; MG.flashC = '#bff6ff'; MG.shake = 0.3; } else num9(p.x, p.y - 60, 'Falta ÍMP', '#9fe8ff', 7); }
  },
  shoot(){ const p = this.p; if (p.shotT > 0) return; p.shotT = 0.18; const y = p.y - (p.slide > 0 ? 12 : 32); this.shots.push({ x: p.x + 18, y }); play('pew');
    part9(p.x + 18, y, 40, 0, '#ffffff', 4, 0.08, 0); },
  upd(dt){
    const p = this.p, e = this.e, ax = mgAxis();
    p.flash = Math.max(0, p.flash - dt * 6); e.flash = Math.max(0, e.flash - dt * 6); p.shotT -= dt; this.hintT -= dt;
    const spd = this.speed * (this.ko ? 0.4 : 1); this.scroll += spd * dt; this.dist += spd * dt / 12; this.clk += dt;
    // Tovan
    const ground = p.y >= GROUND9 - 0.5;
    if (!this.ko && this.intro <= 0) p.x = clamp(p.x + ax.x * 75 * dt, 34, 170);
    if (!ground || p.vy < 0){ p.vy += 700 * dt; p.y += p.vy * dt; if (p.y >= GROUND9){ p.y = GROUND9; p.vy = 0; p.jumps = 0; burst9(p.x, p.y, 4, ['#d8d0e8'], 30, 2, 0.25, 0); if (p.slideQ){ p.slideQ = false; p.slide = 0.55; play('roll'); } } }
    if (p.slide > 0) p.slide -= dt;
    lerpPose9(p.pose, p.slide > 0 ? POSE9.slide : !ground ? POSE9.jump : (Math.sin(MG.t * 14) > 0 ? POSE9.run1 : POSE9.run2), 1 - Math.exp(-dt * (p.slide > 0 ? 25 : 16)));
    if (ground && p.slide <= 0 && rnd() < dt * 12) part9(p.x - 4, p.y - 1, -spd * 0.4, -10, '#8a84a8', 2, 0.3, 0);
    if (this.intro > 0){ this.intro -= dt; }
    else if (!this.ko && (atkHeld() || keys.KeyJ)) this.shoot();
    // rayo especial
    if (this.beam > 0){ this.beam -= dt; this.beamTick = (this.beamTick || 0) - dt; const by = p.y - (p.slide > 0 ? 12 : 32);
      for (let i = 0; i < 4; i++) part9(p.x + 20 + rnd() * 280, by + (rnd() - 0.5) * 12, 60, (rnd() - 0.5) * 30, rnd() < 0.5 ? '#7ff5ff' : '#ffffff', 3, 0.25, 0);
      if (this.beamTick <= 0){ this.beamTick = 0.1; if (Math.abs(e.y - by) < 22 && !this.ko){ mgDmg(0.6, e.x, e.y - 40); e.flash = 1; } for (const o of this.obs) if (o.kind !== 'banner' && Math.abs(o.y - o.h / 2 - by) < o.h / 2 + 10 && o.x > p.x) o.dead = true; } }
    // Míster Confianza volando
    e.t += dt; e.retT -= dt; if (e.retT <= 0){ e.retT = 1.3 + rnd() * 1.4; e.ty = 44 + rnd() * 84; }
    e.y = lerp(e.y, e.ty + Math.sin(e.t * 3) * 4, 1 - Math.exp(-dt * 2.2)); e.x = 262 + Math.sin(e.t * 0.8) * 14;
    lerpPose9(e.pose, e.throwT > 0 ? POSE9.throw : POSE9.fly, 1 - Math.exp(-dt * 12)); if (e.throwT > 0) e.throwT -= dt;
    if (rnd() < 0.8) part9(e.x - 3, e.y + 30, -spd * 0.3, 40 + rnd() * 30, rnd() < 0.5 ? '#ffb020' : '#ff5a20', 3, 0.3, 0);
    if (this.intro <= 0 && !this.ko && !player.dead){ e.atkT -= dt;
      if (e.atkT <= 0){ const hpF = bossE ? bossE.hp / bossE.maxHp : 1; e.atkT = (hpF < 0.62 ? 1.05 : 1.3) + rnd() * 0.6; e.throwT = 0.3; const r = rnd();
        if (r < 0.26) this.ground9({ kind: 'box', x: MGW + 10, y: GROUND9, w: 14, h: 14, vx: 30, hp: 2 });
        else if (r < 0.44) this.ground9({ kind: 'banner', x: MGW + 10, y: GROUND9 - 18, w: 16, h: GROUND9 - 18, vx: 0, hp: 99 });
        else if (r < 0.62) this.ground9({ kind: 'fan', x: MGW + 10, y: GROUND9, w: 10, h: 26, vx: 55, hp: 2 });
        else { this.wind = { t: 0.45, three: r >= 0.84 }; e.throwT = 0.5; play('cursor'); } }
      if (this.wind){ this.wind.t -= dt; if (this.wind.t <= 0){ const W = this.wind; this.wind = null;
        if (!W.three){ const a = Math.atan2((p.y - 30) - e.y, p.x - e.x); this.obs.push({ kind: 'photo', x: e.x - 10, y: e.y, w: 10, h: 8, vx: 0, px: Math.cos(a) * 145, py: Math.sin(a) * 145, hp: 1 }); play('pew'); }
        else { for (const o of [-0.34, 0, 0.34]){ const a = Math.atan2((p.y - 30) - e.y, p.x - e.x) + o; this.obs.push({ kind: 'photo', x: e.x - 10, y: e.y, w: 10, h: 8, vx: 0, px: Math.cos(a) * 135, py: Math.sin(a) * 135, hp: 1 }); } num9(e.x, e.y - 60, '¡Autógrafos para todos!', '#ffd23a', 7); play('pew'); } } } }
    // obstáculos
    const pTop = p.y - (p.slide > 0 ? 13 : 30);
    for (let i = this.obs.length - 1; i >= 0; i--){ const o = this.obs[i];
      if (o.kind === 'photo'){ o.x += o.px * dt; o.y += o.py * dt; } else o.x -= (spd + o.vx) * dt;
      let gone = o.dead || o.x < -30 || o.y > 190 || o.y < -20;
      if (!gone && p.inv <= 0 && Math.abs(o.x - p.x) < o.w / 2 + 5 && o.y > pTop && o.y - o.h < p.y){ if (this.hitP(o.kind === 'banner' ? 8 : o.kind === 'fan' ? 7 : 6, o.x) === 'hit' && o.kind !== 'banner') gone = true; }
      if (gone){ if (o.dead) burst9(o.x, o.y - o.h / 2, 10, o.kind === 'fan' ? ['#d83a3a', '#ffd23a'] : ['#c8925a', '#ffffff'], 70, 3, 0.4, 80); this.obs.splice(i, 1); } }
    p.inv = Math.max(0, p.inv - dt);
    // disparos
    for (let i = this.shots.length - 1; i >= 0; i--){ const s = this.shots[i]; s.x += 330 * dt; let gone = s.x > MGW + 10;
      if (!gone && !this.ko && Math.abs(s.x - e.x) < 15 && Math.abs(s.y - (e.y - 8)) < 26){ gone = true; mgDmg(0.34, e.x, e.y - 44); e.flash = 1; burst9(s.x, s.y, 8, ['#7ff5ff', '#ffffff'], 70, 2, 0.3, 0); }
      if (!gone) for (const o of this.obs){ if (o.kind === 'banner') continue; if (Math.abs(s.x - o.x) < o.w / 2 + 3 && s.y > o.y - o.h - 2 && s.y < o.y + 2){ gone = true; o.hp--; if (o.hp <= 0){ o.dead = true; play('die'); } else play('hit'); break; } }
      if (gone) this.shots.splice(i, 1); }
    if (this.ko){ this.ko -= dt * 0.5; e.ty = 200; e.flash = Math.sin(MG.t * 30) > 0 ? 1 : 0; if (this.ko <= 0) MG.endT = 0.01; }
  },
  ground9(o){ const p = this.p, sp = this.speed + o.vx; let arr = this.clk + (o.x - p.x) / sp;
    for (let k = 0; k < 4; k++){ let moved = false;
      for (const q of this.obs){ if (q.kind === 'photo' || q.dead || q.arr == null) continue; if (Math.abs(q.arr - arr) < 0.8){ arr = q.arr + 0.8; moved = true; } }
      if (!moved) break; }
    o.arr = arr; o.x = p.x + (arr - this.clk) * sp; this.obs.push(o); },
  hitP(dmg, x){ const p = this.p; const r = mgHurt(dmg, p.x, p.y - 56); if (r === 'hit'){ p.flash = 1; p.inv = 1.0; burst9(x, p.y - 20, 12, ['#ff5a5a', '#ffffff'], 80, 3, 0.35, 100); } return r; },
  finish(){ this.ko = 1.4; big9('¡FUERA DE CARRERA!', 'Míster Confianza se estrella contra su propia valla', 1.6, '#ff8a3a'); play('specialBoom'); MG.shake = 0.5; MG.flashA = 0.5; MG.flashC = '#ffffff';
    burst9(this.e.x, this.e.y, 36, ['#ffd23a', '#ffffff', '#ff5a5a'], 140, 3, 0.8, 120); },
  draw(t){
    const p = this.p, e = this.e; bgCity9(t, this.scroll);
    for (const o of this.obs){ const x = Math.round(o.x - o.w / 2), y = Math.round(o.y - o.h);
      if (o.kind === 'box'){ rect9(x, y, o.w, o.h, '#c8925a'); rect9(x, y + 5, o.w, 3, '#e8d8a0'); rect9(x + 5, y, 3, o.h, '#e8d8a0'); mgX.drawImage(starFace9(), x + 1, y + 1, 6, 6); }
      else if (o.kind === 'banner'){ const by = Math.round(o.y), sy = by - 24; rect9(x + 6, 0, 3, sy + 2, '#3a3456');          // pancarta colgando a la altura de la cabeza
        rect9(x - 5, sy, o.w + 10, 22, '#d83a3a'); rect9(x - 3, sy + 2, o.w + 6, 18, '#f0c040'); txt9('VOTA', x + o.w / 2, sy + 3, 6, '#d83a3a', 'center', false); txt9('YO', x + o.w / 2, sy + 11, 6, '#d83a3a', 'center', false); rect9(x - 5, by - 3, o.w + 10, 3, '#ff3a3a');
        if (o.x > this.p.x && Math.sin(MG.t * 12) > -0.3){ tri9([x + o.w / 2 - 5, by + 2], [x + o.w / 2 + 5, by + 2], [x + o.w / 2, by + 8], '#9fe8ff'); txt9('K', x + o.w / 2 + 10, by + 1, 7, '#9fe8ff', 'center'); } }
      else if (o.kind === 'fan'){ const b = Math.abs(Math.sin(MG.t * 16)) * 2; rect9(x, y + 8 - b, o.w, o.h - 8, '#d83a3a'); rect9(x + 1, y - b, 8, 8, '#efc29c'); rect9(x, y - 2 - b, 10, 3, '#3a1a0a'); rect9(x - 3, y + 2 - b, 3, 8, '#ffd23a'); rect9(x + 3, y + 9 - b, 4, 3, '#ffffff'); }
      else { rect9(x, y, o.w, o.h + 2, '#ffffff'); rect9(x + 1, y + 1, o.w - 2, o.h - 3, '#4a6ad8'); rect9(x + 3, y + 2, 4, 4, '#efc29c'); } }
    puppet9('star', e.x, e.y + 30, -1, e.pose, 0.95, { flash: e.flash, shine: true, ph: 0.7 });
    if (this.wind){ const cx = Math.round(e.x), cy = Math.round(e.y - 34); rect9(cx - 7, cy - 7, 14, 15, '#ffd23a'); rect9(cx - 6, cy - 6, 12, 13, '#fff2a0'); txt9(this.wind.three ? '!!' : '!', cx, cy - 5, 10, '#2a0e30', 'center', false); }
    if (this.beam > 0){ const by = p.y - (p.slide > 0 ? 12 : 32), h = 10 + Math.sin(t * 40) * 3; rect9(p.x + 18, by - h / 2 - 3, MGW, h + 6, 'rgba(60,140,255,.45)'); rect9(p.x + 18, by - h / 2, MGW, h, '#9ff6ff'); rect9(p.x + 18, by - 2, MGW, 4, '#ffffff'); }
    for (const s of this.shots){ rect9(Math.round(s.x) - 5, Math.round(s.y) - 1, 8, 3, '#7ff5ff'); rect9(Math.round(s.x) - 1, Math.round(s.y) - 2, 4, 5, '#ffffff'); }
    shadow9(p.x, GROUND9 + 1, 10);
    if (!(p.inv > 0 && Math.sin(MG.t * 40) > 0)) puppet9('tovan', p.x, p.y, 1, p.pose, 1, { flash: p.flash, weapon: 'staff' });
    drawP9(); drawN9();
    bar9(8, 22, 110, 7, player.hp / player.maxHp, '#7dff8a', '#0a2a14'); txt9('TOVAN', 8, 31, 7, '#ffffff');
    const bf = bossE ? bossE.hp / bossE.maxHp : 0; bar9(202, 22, 110, 7, bf, '#ffd23a', '#5a0a14', true); txt9('MÍSTER CONFIANZA', 312, 31, 7, '#ffffff', 'right');
    for (const th of MG_THR) if (th > 0) rect9(202 + Math.round(110 * (1 - th)), 21, 1, 9, '#000');
    txt9(`${Math.round(this.dist)} m`, 160, 20, 9, '#ffffff', 'center'); bar9(8, 170, 50, 4, player.meter / 100, '#7ff5ff', '#0a1a3a'); txt9('ÍMP', 62, 167, 7, '#7ff5ff');
    if (this.hintT > 0) txt9('Espacio salta ×2 · K desliza (pancartas) · J dispara · L rayo', 196, 168, 7, '#ffffff', 'center');
  },
  end(){}
};

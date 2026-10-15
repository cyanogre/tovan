'use strict';
/* ======================================================================
   JUEGO 4 · LA FANTASÍA FINAL (combate por turnos con barras de tiempo)
   ====================================================================== */
const RP_TECH9 = [
  { id: 'beam', name: 'Haz de linterna', cost: 20, desc: 'Rayo de luz · daño medio' },
  { id: 'rush', name: 'Ráfaga del repartidor', cost: 40, desc: '5 golpes · pulsa J a tiempo en cada uno' },
  { id: 'truck', name: '¡Camión-kun!', cost: 70, desc: 'Daño enorme y le retrasa el turno' }
];
const RP9 = {
  overlay: true, song: 'mgRpg', title: ['PROGRAMA FINAL', 'La Fantasía Final', 'Por turnos · Elige con W/S o el joystick · J confirma · K bloquea cuando el aro azul se cierra'], ep: 'ep-rpg',
  start(){
    this.st = 'intro'; this.t = 1.6; this.atbP = 0.55; this.atbE = 0.15; this.menu = 'main'; this.sel = 0; this.items = { pot: 2, cafe: 1 };
    this.defend = false; this.buff = 0; this.charge = false; this.act = null; this.msg = ''; this.msgT = 0; this.ep = { x: 88, y: 112, flash: 0, pose: cpPose9(POSE9.idle), dx: 0 };
    this.pp = { x: 238, y: 110, flash: 0, pose: cpPose9(POSE9.guard), dx: 0 }; this.qte = null; this.blockWin = null; this.lastBlockPress = -9; this.lastAtkPress = -9; this.win = 0; this.hint = true;
    big9('¡APARECE MÍSTER CONFIANZA!', '', 1.5, '#ffffff');
  },
  menuItems(){
    if (this.menu === 'main') return [['Atacar', true], ['Técnicas', true], ['Objeto', true], ['Defender', true]];
    if (this.menu === 'tech') return RP_TECH9.map(T => [`${T.name}  ${T.cost}`, player.meter >= T.cost]);
    return [[`Poción ×${this.items.pot}`, this.items.pot > 0], [`Café de máquina ×${this.items.cafe}`, this.items.cafe > 0]];
  },
  btn(b){
    if (this.st === 'menu'){
      if (b === 'attack' || b === 'jump') this.choose(this.sel);
      else if (b === 'roll' && this.menu !== 'main'){ this.menu = 'main'; this.sel = 0; play('cursor'); }
      return; }
    if (b === 'attack') this.lastAtkPress = MG.t;
    if (b === 'roll' || b === 'jump') this.lastBlockPress = MG.t;
    if (this.qte && b === 'attack' && !this.qte.done) this.qteHit();
  },
  choose(i){
    const items = this.menuItems(); if (!items[i]) return; if (!items[i][1]){ play('cursor'); num9(this.pp.x, this.pp.y - 70, this.menu === 'tech' ? 'Falta ÍMP' : 'No te quedan', '#9fe8ff', 7); return; }
    play('confirm');
    if (this.menu === 'main'){
      if (i === 0) this.startAct('attack'); else if (i === 1){ this.menu = 'tech'; this.sel = 0; } else if (i === 2){ this.menu = 'item'; this.sel = 0; } else this.startAct('defend'); }
    else if (this.menu === 'tech'){ const T = RP_TECH9[i]; player.meter -= T.cost; this.startAct(T.id); }
    else this.startAct(i === 0 ? 'pot' : 'cafe');
  },
  pick(px, py){ if (this.st !== 'menu') return; const items = this.menuItems(); for (let i = 0; i < items.length; i++){ const y = 126 + i * 11; if (px > 4 && px < (this.menu === 'tech' ? 180 : 112) && py > y - 1 && py < y + 10){ this.sel = i; this.choose(i); return; } } },
  say(s, d){ this.msg = s; this.msgT = d || 1.4; },
  startAct(id){ this.st = 'act'; this.act = { id, t: 0, flags: {} }; this.menu = 'main'; this.sel = 0; this.defend = false;
    const names = { attack: 'Atacar', defend: 'Defender', pot: 'Poción', cafe: 'Café de máquina', beam: 'Haz de linterna', rush: 'Ráfaga del repartidor', truck: '¡Camión-kun!' }; this.say(names[id]); },
  qteHit(){ const q = this.qte; q.done = true; const d = Math.abs(q.r - 11); q.res = d <= 3 ? 1.6 : d <= 8 ? 1 : 0.55; num9(this.ep.x, this.ep.y - 92, q.res > 1.5 ? '¡PERFECTO!' : q.res >= 1 ? '¡Bien!' : 'Flojo…', q.res > 1.5 ? '#ffe24a' : '#ffffff', 9); if (q.res > 1.5) play('tier'); },
  hitE(pct, mul){ const v = mgDmg(pct * (mul || 1) * (this.buffP || 1), this.ep.x, this.ep.y - 86); this.ep.flash = 1; this.ep.dx = -8; MG.shake = Math.max(MG.shake, 0.15); burst9(this.ep.x + 10, this.ep.y - 50, 14, ['#ffffff', '#ffd23a'], 100, 3, 0.4, 60); return v; },
  hitP(base){ let mul = (this.buff > 0 ? 1.35 : 1) * (this.defend ? 0.5 : 1); const dt_ = MG.t - this.lastBlockPress, blocked = dt_ < 0.45, perfect = dt_ < 0.17;
    if (perfect){ num9(this.pp.x, this.pp.y - 80, '¡Parada perfecta!', '#ffe24a', 9); play('tier'); burst9(this.pp.x - 10, this.pp.y - 40, 16, ['#ffe24a', '#ffffff'], 100, 3, 0.35, 0); this.hitE(0.5); return 'none'; }
    if (blocked){ mul *= 0.3; num9(this.pp.x, this.pp.y - 80, '¡Bloqueo!', '#9fe8ff', 9); play('block'); burst9(this.pp.x - 10, this.pp.y - 40, 10, ['#9fe8ff', '#ffffff'], 80, 2, 0.3, 0); }
    player.inv = 0; const r = mgHurt(base * mul, this.pp.x, this.pp.y - 74); if (r === 'hit'){ this.pp.flash = 1; this.pp.dx = 6; } return r; },
  upd(dt){
    const ep = this.ep, pp = this.pp; ep.flash = Math.max(0, ep.flash - dt * 5); pp.flash = Math.max(0, pp.flash - dt * 5); ep.dx *= Math.exp(-dt * 8); pp.dx *= Math.exp(-dt * 8);
    if (this.msgT > 0) this.msgT -= dt;
    // navegación del menú
    const ax = mgAxis(); if (this.st === 'menu'){ const n = this.menuItems().length; if (ax.y > 0.5 && MG.axPrev.y <= 0.5){ this.sel = (this.sel + 1) % n; play('cursor'); } if (ax.y < -0.5 && MG.axPrev.y >= -0.5){ this.sel = (this.sel + n - 1) % n; play('cursor'); } }
    MG.axPrev = ax;
    if (this.win){ this.win -= dt; lerpPose9(pp.pose, POSE9.win, 1 - Math.exp(-dt * 6)); lerpPose9(ep.pose, POSE9.ko, 1 - Math.exp(-dt * 4)); if (rnd() < 0.3) part9(pp.x + (rnd() - 0.5) * 30, 40 + rnd() * 30, 0, 20, ['#ffd23a', '#ffffff', '#ff8ad8'][Math.floor(rnd() * 3)], 2, 1, 10); if (this.win <= 0) MG.endT = 0.01; return; }
    if (this.st === 'intro'){ this.t -= dt; lerpPose9(ep.pose, POSE9.taunt, 1 - Math.exp(-dt * 6)); if (this.t <= 0) this.st = 'atb'; return; }
    if (this.st === 'atb'){ this.atbP += dt / 2.3; this.atbE += dt / (this.charge ? 3.2 : 4.2);
      lerpPose9(pp.pose, this.defend ? POSE9.block : POSE9.guard, 1 - Math.exp(-dt * 8)); lerpPose9(ep.pose, this.charge ? POSE9.taunt : POSE9.idle, 1 - Math.exp(-dt * 6));
      if (this.atbP >= 1){ this.atbP = 1; this.st = 'menu'; this.menu = 'main'; this.sel = 0; play('cursor'); }
      else if (this.atbE >= 1){ this.atbE = 0; this.startEnemy(); } return; }
    if (this.st === 'menu'){ lerpPose9(pp.pose, POSE9.guard, 1 - Math.exp(-dt * 8)); return; }
    if (this.st === 'act') this.updAct(dt); else if (this.st === 'eact') this.updEnemy(dt);
  },
  endTurn(player_){ if (player_){ this.atbP = 0; } this.st = 'atb'; this.act = null; this.qte = null; },
  updAct(dt){
    const A = this.act, pp = this.pp, ep = this.ep; A.t += dt; const t = A.t, F = A.flags;
    const home = 238, near = 128;
    if (A.id === 'attack'){
      if (t < 0.35){ pp.x = lerp(home, near, t / 0.35); lerpPose9(pp.pose, Math.sin(MG.t * 14) > 0 ? POSE9.run1 : POSE9.run2, 0.5); }
      else if (!F.q){ F.q = true; this.qte = { r: 34, done: false, res: 0.55 }; if (this.hint) num9(160, 108, '¡Pulsa J cuando coincidan los aros!', '#ffffff', 7); }
      if (this.qte && !this.qte.done){ this.qte.r -= dt * 38; lerpPose9(pp.pose, POSE9.windup, 0.3); if (this.qte.r <= 5){ this.qte.done = true; this.qte.res = 0.55; num9(ep.x, ep.y - 92, 'Flojo…', '#ffffff', 9); } }
      if (this.qte && this.qte.done && !F.hit){ F.hit = true; F.ht = t; this.hint = false; lerpPose9(pp.pose, POSE9.upper, 1); this.hitE(2.6, this.qte.res); play('swingBig'); player.meter = Math.min(100, player.meter + 12); }
      if (F.hit){ if (t - F.ht > 0.3){ pp.x = lerp(pp.x, home, 1 - Math.exp(-dt * 10)); lerpPose9(pp.pose, POSE9.guard, 0.2); } if (t - F.ht > 0.75){ pp.x = home; this.endTurn(true); } } }
    else if (A.id === 'defend'){ lerpPose9(pp.pose, POSE9.block, 0.3); if (!F.d){ F.d = true; this.defend = true; player.meter = Math.min(100, player.meter + 15); num9(pp.x, pp.y - 76, '+15 ÍMP', '#7ff5ff', 8); } if (t > 0.6){ this.endTurn(true); this.defend = true; } }
    else if (A.id === 'pot' || A.id === 'cafe'){ lerpPose9(pp.pose, POSE9.taunt, 0.25);
      if (!F.u && t > 0.35){ F.u = true; if (A.id === 'pot'){ this.items.pot--; const h0 = player.hp; heal(Math.round(player.maxHp * 0.3), true); num9(pp.x, pp.y - 80, '+' + Math.round(player.hp - h0), '#7dff8a', 11); burst9(pp.x, pp.y - 30, 24, ['#7dff8a', '#ffffff'], 50, 3, 0.9, -40); play('pickup'); }
        else { this.items.cafe--; player.meter = Math.min(100, player.meter + 50); num9(pp.x, pp.y - 80, '+50 ÍMP', '#7ff5ff', 11); burst9(pp.x, pp.y - 30, 18, ['#c08a50', '#ffffff'], 50, 3, 0.9, -40); play('tier'); } }
      if (t > 1.0) this.endTurn(true); }
    else if (A.id === 'beam'){ lerpPose9(pp.pose, POSE9.cast, 0.3);
      if (t > 0.45 && t < 1.0){ for (let i = 0; i < 4; i++) part9(lerp(pp.x - 20, ep.x + 20, rnd()), ep.y - 42 + (rnd() - 0.5) * 14, (rnd() - 0.5) * 40, (rnd() - 0.5) * 40, rnd() < 0.5 ? '#7ff5ff' : '#ffffff', 3, 0.3, 0); }
      if (!F.h && t > 0.6){ F.h = true; this.hitE(4.6); play('beam'); MG.flashA = 0.35; MG.flashC = '#bff6ff'; }
      if (t > 1.3) this.endTurn(true); }
    else if (A.id === 'rush'){ const beats = [0.55, 0.75, 0.95, 1.15, 1.45];
      if (t < 0.4){ pp.x = lerp(home, near, t / 0.4); lerpPose9(pp.pose, POSE9.dash, 0.5); }
      F.i = F.i || 0;
      if (F.i < beats.length){ const bt = beats[F.i]; if (t > bt - 0.16 && !F['s' + F.i]){ F['s' + F.i] = true; num9(ep.x - 4, ep.y - 96, '!', '#ffe24a', 12); }
        if (t >= bt + 0.06){ const good = Math.abs(this.lastAtkPress - (MG.t - (t - bt))) < 0.14; const last = F.i === beats.length - 1;
          lerpPose9(pp.pose, last ? POSE9.upper : F.i % 2 ? POSE9.jab : POSE9.akick, 1); this.hitE(last ? 2.4 : 1.3, good ? 1.5 : 1); if (good) num9(pp.x, pp.y - 84, '¡Perfecto!', '#ffe24a', 8); play(last ? 'swingBig' : 'swing'); F.i++; } }
      else { pp.x = lerp(pp.x, home, 1 - Math.exp(-dt * 8)); lerpPose9(pp.pose, POSE9.guard, 0.2); if (t > 2.1){ pp.x = home; this.endTurn(true); } } }
    else if (A.id === 'truck'){ lerpPose9(pp.pose, POSE9.taunt, 0.25); if (!F.horn){ F.horn = true; play('truckHorn'); num9(pp.x, pp.y - 84, '¡CAMIÓN-KUN!', '#ffffff', 10); }
      F.x = lerp(MGW + 60, -80, clamp((t - 0.3) / 1.0, 0, 1));
      if (!F.h && F.x < ep.x + 20){ F.h = true; this.hitE(8.5); this.atbE = 0; ep.dx = -30; MG.shake = 0.6; play('slam'); num9(ep.x, ep.y - 104, '¡ISEKAI!', '#ff8ad8', 12); }
      if (t > 1.6) this.endTurn(true); }
  },
  startEnemy(){
    let id; const r = rnd();
    if (this.charge) id = 'ray';
    else if (r < 0.38) id = 'selfie'; else if (r < 0.68) id = 'autos'; else if (r < 0.83 && this.buff <= 0) id = 'speech'; else id = 'comb';
    this.st = 'eact'; this.act = { id, t: 0, flags: {} };
    const names = { selfie: 'Selfie cegador', autos: 'Lluvia de autógrafos', speech: 'Discurso motivacional', comb: 'Peinado legendario', ray: '¡RAYO DE LA FAMA!' }; this.say(names[id], 1.6);
  },
  updEnemy(dt){
    const A = this.act, pp = this.pp, ep = this.ep; A.t += dt; const t = A.t, F = A.flags;
    const warn = tt => { if (!F['w' + tt] && t > tt - 0.7){ F['w' + tt] = true; num9(pp.x, pp.y - 92, '¡K!', '#9fe8ff', 11); (F.rings = F.rings || []).push(tt); } };
    if (A.id === 'selfie'){ lerpPose9(ep.pose, POSE9.phone, 0.3); warn(0.8);
      if (!F.h && t > 0.8){ F.h = true; MG.flashA = 0.8; MG.flashC = '#ffffff'; play('crit'); this.hitP(9); }
      if (t > 1.3) this.endEnemy(); }
    else if (A.id === 'autos'){ lerpPose9(ep.pose, POSE9.throw, 0.3); const hits = [0.7, 1.05, 1.4]; F.papers = F.papers || [];
      hits.forEach((ht, i) => { warn(ht); if (!F['p' + i] && t > ht - 0.45){ F['p' + i] = true; F.papers.push({ t0: ht - 0.45, ht }); } if (!F['h' + i] && t > ht){ F['h' + i] = true; this.hitP(4); } });
      if (t > 1.8) this.endEnemy(); }
    else if (A.id === 'speech'){ lerpPose9(ep.pose, POSE9.taunt, 0.2); if (!F.s){ F.s = true; num9(ep.x, ep.y - 98, '«¡Cree en ti! Bueno… en mí.»', '#ffd23a', 7); play('superOn'); }
      if (t > 0.5 && rnd() < 0.4) part9(ep.x + (rnd() - 0.5) * 30, ep.y - rnd() * 60, 0, -30, '#ffd23a', 2, 0.6, 0);
      if (t > 1.4){ this.buff = 2; this.endEnemy(); } }
    else if (A.id === 'comb'){ lerpPose9(ep.pose, POSE9.phone, 0.2); if (!F.s){ F.s = true; num9(ep.x, ep.y - 98, 'Se está peinando… ¡algo gordo se avecina!', '#ff8ad8', 7); }
      if (t > 1.3){ this.charge = true; this.endEnemy(); num9(pp.x, pp.y - 92, 'Consejo: ¡Defiende!', '#9fe8ff', 7); } }
    else if (A.id === 'ray'){ lerpPose9(ep.pose, POSE9.cast, 0.3); warn(1.1);
      if (t > 0.3 && t < 1.1 && rnd() < 0.8) part9(ep.x + 20 + rnd() * 8, ep.y - 46 + (rnd() - 0.5) * 20, 30, (rnd() - 0.5) * 30, '#fff6a0', 3, 0.3, 0);
      if (!F.h && t > 1.1){ F.h = true; MG.flashA = 0.7; MG.flashC = '#fff6c0'; MG.shake = 0.5; play('beam'); this.hitP(20); this.charge = false; }
      if (t > 1.7) this.endEnemy(); }
  },
  endEnemy(){ if (this.buff > 0 && this.act.id !== 'speech') this.buff--; this.st = 'atb'; this.act = null; },
  finish(){ this.win = 3.4; this.st = 'win'; big9('¡VICTORIA!', 'Obtienes 0 EXP: la fama no da experiencia', 2.6, '#ffffff'); play('waveClear'); later(0.4, () => play('tier')); MG.flashA = 0.5; MG.flashC = '#ffffff'; },
  draw(t){
    const ep = this.ep, pp = this.pp; bgRpg9(t);
    shadow9(ep.x, ep.y + 2, 20); shadow9(pp.x, pp.y + 2, 11);
    puppet9('star', ep.x + ep.dx, ep.y + Math.sin(t * 2) * 1.5, 1, ep.pose, 1.65, { flash: ep.flash, shine: true, weapon: this.act && this.act.id === 'selfie' ? 'phone' : null, tint: this.buff > 0 ? 'rgba(255,90,90,.18)' : null });
    puppet9('tovan', pp.x + pp.dx, pp.y, -1, pp.pose, 1.15, { flash: pp.flash, weapon: 'staff' });
    // Lumen flotando
    const lx = pp.x + 16, ly = pp.y - 74 + Math.sin(t * 3) * 3; rect9(lx - 3, ly - 4, 6, 8, '#e0b048'); rect9(lx - 2, ly - 3, 4, 6, '#7ff5ff'); if (rnd() < 0.3) part9(lx, ly, (rnd() - 0.5) * 10, -10, '#bff6ff', 2, 0.5, 0);
    // efectos de acciones
    const A = this.act;
    if (A && A.id === 'beam' && A.t > 0.45 && A.t < 1.0){ const h = 6 + Math.sin(t * 40) * 2; rect9(ep.x + 10, pp.y - 46 - h / 2 - 2, pp.x - ep.x - 24, h + 4, 'rgba(60,140,255,.5)'); rect9(ep.x + 10, pp.y - 46 - h / 2, pp.x - ep.x - 24, h, '#bff6ff'); }
    if (A && A.id === 'truck' && A.flags.x != null){ const x = Math.round(A.flags.x), y = 92; rect9(x, y, 46, 26, '#f2f2f2'); rect9(x, y + 14, 46, 4, '#d8322a'); rect9(x - 16, y + 8, 16, 18, '#f2f2f2'); rect9(x - 14, y + 10, 10, 7, '#1a2440');
      for (const wx of [x - 10, x + 12, x + 36]){ rect9(wx - 4, y + 24, 9, 9, '#1a1a1e'); rect9(wx - 1, y + 27, 3, 3, '#9a9aa8'); } rect9(x - 17, y + 20, 3, 3, '#fff4c0'); for (let i = 0; i < 3; i++) part9(x + 46, y + 22, 40, -10, '#b8a898', 4, 0.4, 0); }
    if (A && A.id === 'autos' && A.flags.papers) for (const pa of A.flags.papers){ const k = clamp((A.t - pa.t0) / (pa.ht - pa.t0), 0, 1); if (k >= 1) continue; const x = lerp(ep.x + 20, pp.x, k), y = lerp(ep.y - 50, pp.y - 40, k) - Math.sin(k * Math.PI) * 26;
      rect9(x - 4, y - 3, 8, 6, '#ffffff'); rect9(x - 3, y - 1, 6, 1, '#4a4a6a'); rect9(x - 3, y + 1, 4, 1, '#4a4a6a'); }
    if (A && A.id === 'ray' && A.t > 1.1 && A.t < 1.45){ rect9(ep.x + 16, pp.y - 60, pp.x - ep.x - 16, 30, 'rgba(255,240,170,.6)'); rect9(ep.x + 16, pp.y - 52, pp.x - ep.x - 16, 14, '#ffffff'); }
    if (A && this.st === 'eact' && A.flags.rings) for (const ht of A.flags.rings){ const k = (ht - A.t) / 0.7; if (k < -0.05 || k > 1) continue; const r = 12 + Math.max(0, k) * 30;
      mgX.strokeStyle = '#9fe8ff'; mgX.lineWidth = 2; mgX.beginPath(); mgX.arc(pp.x, pp.y - 40, 12, 0, TAU); mgX.stroke();
      mgX.strokeStyle = k < 0.25 ? '#ffe24a' : '#ffffff'; mgX.lineWidth = 1; mgX.beginPath(); mgX.arc(pp.x, pp.y - 40, r, 0, TAU); mgX.stroke(); }
    if (this.qte && !this.qte.done){ mgX.strokeStyle = '#ffe24a'; mgX.lineWidth = 2; mgX.beginPath(); mgX.arc(ep.x + 6, ep.y - 46, 11, 0, TAU); mgX.stroke();
      mgX.strokeStyle = '#ffffff'; mgX.lineWidth = 1; mgX.beginPath(); mgX.arc(ep.x + 6, ep.y - 46, Math.max(1, this.qte.r), 0, TAU); mgX.stroke(); }
    drawP9(); drawN9();
    // ventanas
    if (this.msgT > 0){ win9(96, 4, 128, 16); txt9(this.msg, 160, 7, 8, '#ffffff', 'center', false); }
    win9(2, 120, 112, 58); win9(116, 120, 202, 58);
    txt9('MÍSTER', 10, 126, 8, '#ffffff', 'left', false); txt9('CONFIANZA', 10, 136, 8, '#ffffff', 'left', false);
    const bf = bossE ? bossE.hp / bossE.maxHp : 0; bar9(10, 150, 96, 4, bf / 0.25, '#ffd23a', '#3a0a14');
    if (this.buff > 0) txt9('Motivado ↑', 10, 158, 7, '#ff8a8a', 'left', false); else if (this.charge) txt9('¡Cargando!', 10, 158, 7, Math.sin(t * 8) > 0 ? '#ffe24a' : '#ff8ad8', 'left', false);
    txt9('TOVAN', 124, 126, 8, '#ffffff', 'left', false); txt9(`PV ${Math.max(0, Math.round(player.hp))}/${player.maxHp}`, 170, 126, 8, player.hp < player.maxHp * 0.25 ? '#ffe24a' : '#ffffff', 'left', false);
    txt9(`ÍMP ${Math.round(player.meter)}`, 124, 138, 8, '#7ff5ff', 'left', false); if (this.defend) txt9('En guardia', 190, 138, 7, '#9fe8ff', 'left', false);
    txt9('TIEMPO', 124, 152, 7, '#c8ccff', 'left', false); bar9(170, 153, 110, 5, this.atbP, this.atbP >= 1 ? '#ffe24a' : '#7ff5ff', '#0a0a3a');
    if (this.st === 'menu'){ const items = this.menuItems(); const h = items.length * 11 + 8; win9(4, 122, this.menu === 'tech' ? 176 : 108, h);
      items.forEach(([lab, ok], i) => { const y = 126 + i * 11; if (i === this.sel){ const bx = 10 + Math.abs(Math.sin(t * 8)) * 2; tri9([bx, y + 1], [bx + 6, y + 4], [bx, y + 7], '#ffffff'); }
        txt9(lab, 20, y, 8, ok ? '#ffffff' : '#7a7aa8', 'left', false); });
      const help = this.menu === 'tech' ? (RP_TECH9[this.sel] || {}).desc : this.menu === 'main' ? 'J elige · W/S cambia' : 'Poción: +30 % PV · Café: +50 ÍMP';
      if (help) txt9(help, 160, 170, 7, '#ffffff', 'center'); }
  },
  end(){}
};
const MG_GAMES = { fight: FT9, run: RN9, inv: INV9G, rpg: RP9 };

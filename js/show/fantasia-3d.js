'use strict';
/* ======================================================================
   PROGRAMA FINAL · LA FANTASÍA FINAL (por turnos, en 3D)
   Sustituye al combate pixelado: los dos modelos de verdad, frente a
   frente en el plató, cámara de RPG clásico y ventanas nítidas en el DOM.
   - Menú: W/S (o el joystick) elige, J confirma, K vuelve. También se
     puede tocar o pinchar cada opción.
   - Atacar: Tovan corre hasta él y pega con su golpe de verdad; pulsa J
     cuando el aro blanco se cierra sobre el amarillo (¡Perfecto! = +60 %).
   - Bloquear: cuando el aro azul se cierra sobre ti, pulsa K (parada
     perfecta = le devuelves el golpe).
   - Técnicas (ÍMP): Haz de linterna, Ráfaga del repartidor (5 golpes a
     ritmo) y ¡Camión-kun! (le atropella y le retrasa el turno).
   La lógica de turnos es la del programa viejo (fantasia-final.js).
   ====================================================================== */
const RP3_POS = { yo: [3.2, 0.7], el: [-3.3, -0.4], cerca: [-1.35, -0.2] };
const RP3_NOM = { attack: 'Atacar', defend: 'Defender', pot: 'Poción', cafe: 'Café de máquina', beam: 'Haz de linterna', rush: 'Ráfaga del repartidor', truck: '¡Camión-kun!',
  selfie: 'Selfie cegador', autos: 'Lluvia de autógrafos', speech: 'Discurso motivacional', comb: 'Peinado legendario', ray: '¡RAYO DE LA FAMA!' };
const rp3UI = document.createElement('div'); rp3UI.className = 's3rpg'; rp3UI.hidden = true;
rp3UI.innerHTML = `<div class="r3msg" hidden></div>
  <div class="r3qte" hidden><i class="r3fijo"></i><i class="r3aro"></i></div>
  <div class="r3abajo"><div class="r3win r3izq"><div class="r3menu" hidden></div><div class="r3ene"><b>MÍSTER CONFIANZA</b><div class="r3bar"><i></i></div><small class="r3est"></small></div></div>
  <div class="r3win r3der"><div class="r3fila"><b>TOVAN</b><span class="r3pv"></span></div><div class="r3fila"><span class="r3imp"></span><span class="r3guard"></span></div>
  <div class="r3fila"><span>TIEMPO</span><div class="r3atb"><i></i></div></div><small class="r3ayuda"></small></div></div>`;
sh3UI.appendChild(rp3UI);
const r3 = s => rp3UI.querySelector(s);
const RP3 = {
  overlay: false, quieto: true, song: 'mgRpg', title: ['PROGRAMA FINAL', 'La Fantasía Final', 'Por turnos · W/S elige · J confirma · K vuelve (y bloquea cuando el aro azul se cierra)'], ep: 'ep-rpg',
  start(){
    this.vivo = true; sh3Empieza(this); document.body.classList.add('sh3-rpg'); rp3UI.hidden = false;
    const e = sh3TomaJefe(this, (e_, dt) => this.ia(e_, dt)); this.e = e;
    e.g.position.set(RP3_POS.el[0], 0, RP3_POS.el[1]); e.g.rotation.y = Math.PI / 2;
    this.pos = new V3(RP3_POS.yo[0], 0, RP3_POS.yo[1]); hero.position.copy(this.pos); heading = -Math.PI / 2; hero.rotation.y = heading; vy = 0; grounded = true; camYaw = 0;
    this.st = 'intro'; this.t = 2.0; this.atbP = 0.55; this.atbE = 0.15; this.menu = 'main'; this.sel = 0; this.items = { pot: 2, cafe: 1 };
    this.defend = false; this.buff = 0; this.charge = false; this.act = null; this.qte = null; this.lastBlock = -9; this.lastAtk = -9; this.hint = true; this.win = 0; this.ePose = 'hips'; this.axY = 0;
    this.sinDano = true; musOverride(this.song); play('superOn');
    sh3Grande('¡APARECE MÍSTER CONFIANZA!', 'Combate por turnos', 2.2, 'rpg');
    this.camT = 0;
    SH3.cam = cam => { this.camT += 0.016; const s = Math.sin(this.camT * 0.4) * 0.5, k = camera.aspect < 1 ? 1.8 : camera.aspect < 1.4 ? 1.25 : 1; cam.position.set((1.4 + s) * k * 0.6, 3.1 + (k - 1) * 1.2, 9.6 * k); cam.lookAt(-0.2, camera.aspect < 1 ? 0.6 : 1.5, 0); };
    this.pintaMenu();
  },
  bloqueo(){ return true; },   // los botones van al menú (btn); nada de golpes sueltos
  btn(b){
    if (!this.vivo) return true;
    if (this.st === 'menu'){
      if (b === 'attack' || b === 'jump') this.choose(this.sel);
      else if (b === 'roll' && this.menu !== 'main'){ this.menu = 'main'; this.sel = 0; play('cursor'); this.pintaMenu(); }
      return true; }
    if (b === 'attack') this.lastAtk = MG.t;
    if (b === 'roll' || b === 'jump') this.lastBlock = MG.t;
    if (this.qte && b === 'attack' && !this.qte.done) this.qteHit();
    return true;
  },
  nav(d){ if (this.st !== 'menu') return; const n = this.menuItems().length; this.sel = (this.sel + d + n) % n; play('cursor'); this.pintaMenu(); },
  menuItems(){
    if (this.menu === 'main') return [['Atacar', true], ['Técnicas', true], ['Objeto', true], ['Defender', true]];
    if (this.menu === 'tech') return RP_TECH9.map(T => [`${T.name}`, player.meter >= T.cost, `${T.cost} ÍMP`]);
    return [[`Poción ×${this.items.pot}`, this.items.pot > 0], [`Café de máquina ×${this.items.cafe}`, this.items.cafe > 0]];
  },
  pintaMenu(){
    const M = r3('.r3menu'), on = this.st === 'menu'; M.hidden = !on; r3('.r3ene').hidden = on; if (!on) return;
    M.innerHTML = this.menuItems().map(([lab, ok, extra], i) => `<button class="r3op${i === this.sel ? ' sel' : ''}${ok ? '' : ' no'}" data-i="${i}">${lab}${extra ? `<small>${extra}</small>` : ''}</button>`).join('');
    M.querySelectorAll('.r3op').forEach(b => b.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); this.sel = +b.dataset.i; this.choose(this.sel); }));
    const help = this.menu === 'tech' ? (RP_TECH9[this.sel] || {}).desc : this.menu === 'main' ? 'W/S elige · J confirma' : 'Poción: +30 % PV · Café: +50 ÍMP · K vuelve';
    r3('.r3ayuda').textContent = help || '';
  },
  choose(i){
    const items = this.menuItems(); if (!items[i]) return; if (!items[i][1]){ play('cursor'); this.say(this.menu === 'tech' ? 'Falta ÍMP' : 'No te quedan', 0.8); return; }
    play('confirm');
    if (this.menu === 'main'){ if (i === 0) this.startAct('attack'); else if (i === 1){ this.menu = 'tech'; this.sel = 0; this.pintaMenu(); } else if (i === 2){ this.menu = 'item'; this.sel = 0; this.pintaMenu(); } else this.startAct('defend'); }
    else if (this.menu === 'tech'){ const T = RP_TECH9[i]; player.meter -= T.cost; this.startAct(T.id); }
    else this.startAct(i === 0 ? 'pot' : 'cafe');
  },
  say(s, d){ const el = r3('.r3msg'); el.textContent = s; el.hidden = false; this.msgT = d || 1.4; },
  startAct(id){ this.st = 'act'; this.act = { id, t: 0, F: {} }; this.menu = 'main'; this.sel = 0; this.defend = false; this.say(RP3_NOM[id]); this.pintaMenu(); },
  endTurn(){ this.atbP = 0; this.st = 'atb'; this.act = null; this.qte = null; r3('.r3qte').hidden = true; this.pintaMenu(); },
  // ---- golpes ----
  pega(pct, mul){ const e = this.e; tB.set(e.g.position.x, 2.4, e.g.position.z); const v = sh3Dano(pct * (mul || 1), tB); e.flash = 0.3; this.ePose = 'golpeado'; this.eGolpe = 0.4;
    burst7(PA7, e.g.position.x + 0.6, 2.2, e.g.position.z, 14, [0xffffff, 0xffd23a], 6, 0.16, 0.4, 4, 1, 0, SH7.star); shake = Math.max(shake, 0.2); return v; },
  hitP(base){ let mul = (this.buff > 0 ? 1.35 : 1) * (this.defend ? 0.5 : 1); const d = MG.t - this.lastBlock, blocked = d < 0.45, perfect = d < 0.17;
    tA.set(hero.position.x, 2.6, hero.position.z);
    if (perfect){ spawnNumber(tA, '¡Parada perfecta!', 'react', '#ffe24a'); play('tier'); gring(hero.position.x, 1.2, hero.position.z, 0xffe24a, 0.25, 1.8, 0.3); this.pega(0.5); return 'none'; }
    if (blocked){ mul *= 0.3; spawnNumber(tA, '¡Bloqueo!', 'react', '#9fe8ff'); play('block'); gring(hero.position.x, 1.2, hero.position.z, 0x9fe8ff, 0.25, 1.6, 0.3); }
    player.inv = 0; return mgHurt(base * mul); },
  qteHit(){ const q = this.qte; q.done = true; const d = Math.abs(q.r - 1); q.res = d <= 0.12 ? 1.6 : d <= 0.35 ? 1 : 0.55;
    tA.set(this.e.g.position.x, 4.2, this.e.g.position.z); spawnNumber(tA, q.res > 1.5 ? '¡PERFECTO!' : q.res >= 1 ? '¡Bien!' : 'Flojo…', 'react', q.res > 1.5 ? '#ffe24a' : '#ffffff'); },
  aro(sobre, r, col){   // aro que se cierra (DOM, encima de quien toque)
    const el = r3('.r3qte'); el.hidden = r == null; if (r == null) return;
    const v = tA.set(sobre.x, sobre.y, sobre.z).project(camera), x = (v.x * 0.5 + 0.5) * innerWidth, y = (-v.y * 0.5 + 0.5) * innerHeight;
    el.style.transform = `translate(${x.toFixed(0)}px,${y.toFixed(0)}px)`; el.style.setProperty('--r', Math.max(0.2, r).toFixed(3)); el.dataset.col = col; },
  golpeReal(){ try { _doAttackSh3(); } catch (err) { console.error(err); } },   // la animación de verdad (sin daño: lo pone el programa)
  upd(dt){
    if (!this.vivo) return;
    if (this.msgT > 0 && (this.msgT -= dt) <= 0) r3('.r3msg').hidden = true;
    // Tovan, quieto en su sitio (salvo cuando el programa le mueve)
    hero.position.x = this.pos.x; hero.position.z = this.pos.z; if (state !== 'attack'){ heading = Math.atan2(this.e.g.position.x - this.pos.x, this.e.g.position.z - this.pos.z); hero.rotation.y = heading; }
    // navegación con el joystick
    const ay = Math.abs(joy.y) > 0.5 ? Math.sign(joy.y) : 0; if (ay && ay !== this.axY) this.nav(ay); this.axY = ay;
    // ventanas
    const bf = clamp((bossE.hp / bossE.maxHp - MG_THR[MG.round]) / Math.max(0.01, (MG.round ? MG_THR[MG.round - 1] : 1) - MG_THR[MG.round]), 0, 1);
    r3('.r3bar i').style.width = (bf * 100).toFixed(1) + '%'; r3('.r3est').textContent = this.buff > 0 ? 'Motivado ↑' : this.charge ? '¡Cargando algo gordo!' : '';
    r3('.r3pv').textContent = `PV ${Math.max(0, Math.round(player.hp))}/${player.maxHp}`; r3('.r3pv').classList.toggle('bajo', player.hp < player.maxHp * 0.25);
    r3('.r3imp').textContent = `ÍMP ${Math.round(player.meter)}`; r3('.r3guard').textContent = this.defend ? 'En guardia' : '';
    r3('.r3atb i').style.width = (Math.min(1, this.atbP) * 100).toFixed(1) + '%'; r3('.r3atb').classList.toggle('lleno', this.atbP >= 1);
    if (this.win > 0){ this.win -= dt; return; }
    if (this.st === 'intro'){ this.t -= dt; if (this.t <= 0) this.st = 'atb'; return; }
    if (this.st === 'atb'){ this.atbP += dt / 2.3; this.atbE += dt / (this.charge ? 3.2 : 4.2);
      if (this.atbP >= 1){ this.atbP = 1; this.st = 'menu'; this.menu = 'main'; this.sel = 0; play('cursor'); this.pintaMenu(); }
      else if (this.atbE >= 1){ this.atbE = 0; this.startEnemy(); } return; }
    if (this.st === 'act') this.updAct(dt); else if (this.st === 'eact') this.updEnemy(dt);
  },
  updAct(dt){
    const A = this.act, F = A.F, e = this.e; A.t += dt; const t = A.t, yo = RP3_POS.yo, cerca = RP3_POS.cerca;
    const ve = (k) => { this.pos.set(lerp(yo[0], cerca[0], k), 0, lerp(yo[1], cerca[1], k)); };
    if (A.id === 'attack'){
      if (t < 0.35){ ve(smooth(t / 0.35)); }
      else if (!F.q){ F.q = true; this.qte = { r: 3, done: false, res: 0.55 }; if (this.hint) this.say('¡Pulsa J cuando el aro blanco toque el amarillo!', 2); }
      if (this.qte && !this.qte.done){ this.qte.r -= dt * 3.4; this.aro({ x: e.g.position.x, y: 2.4, z: e.g.position.z }, this.qte.r, 'ama'); if (this.qte.r <= 0.15){ this.qte.done = true; this.qte.res = 0.55; tA.set(e.g.position.x, 4.2, e.g.position.z); spawnNumber(tA, 'Flojo…', 'react', '#ffffff'); } }
      if (this.qte && this.qte.done && !F.hit){ F.hit = true; F.ht = t; this.hint = false; this.aro(null); this.golpeReal(); later(0.12, () => { if (this.vivo) this.pega(2.6, this.qte ? this.qte.res : 1); }); play('swingBig'); player.meter = Math.min(100, player.meter + 12); }
      if (F.hit){ if (t - F.ht > 0.45) ve(1 - smooth(Math.min(1, (t - F.ht - 0.45) / 0.35))); if (t - F.ht > 0.95){ ve(0); this.endTurn(); } } }
    else if (A.id === 'defend'){ if (!F.d){ F.d = true; this.defend = true; player.meter = Math.min(100, player.meter + 15); tA.set(hero.position.x, 2.6, hero.position.z); spawnNumber(tA, '+15 ÍMP', 'react', '#7ff5ff'); gring(hero.position.x, 1, hero.position.z, 0x9fe8ff, 0.4, 1.6, 0.4); }
      if (t > 0.6){ this.endTurn(); this.defend = true; } }
    else if (A.id === 'pot' || A.id === 'cafe'){
      if (!F.u && t > 0.35){ F.u = true; const x = hero.position.x, z = hero.position.z;
        if (A.id === 'pot'){ this.items.pot--; heal(Math.round(player.maxHp * 0.3)); burst7(PA7, x, 1.2, z, 26, [0x7dff8a, 0xffffff], 3, 0.16, 0.9, -2, 1, 0, SH7.star); play('pickup'); }
        else { this.items.cafe--; player.meter = Math.min(100, player.meter + 50); tA.set(x, 2.6, z); spawnNumber(tA, '+50 ÍMP', 'react', '#7ff5ff'); burst7(PA7, x, 1.2, z, 18, [0xc08a50, 0xffffff], 3, 0.16, 0.9, -2, 1, 0, SH7.dot); play('tier'); } }
      if (t > 1.0) this.endTurn(); }
    else if (A.id === 'beam'){
      if (!F.rayo){ F.rayo = mesh(new THREE.CylinderGeometry(0.22, 0.22, 1, 10), makeMat(0xbff6ff, { emissive: 1, opacity: 0.9 }), 0, 0, 0); F.rayo.visible = false; }
      const on = t > 0.45 && t < 1.0; F.rayo.visible = on;
      if (on){ const a = new V3(hero.position.x - 0.4, 1.6, hero.position.z), b = new V3(e.g.position.x + 0.5, 2.2, e.g.position.z), d = a.distanceTo(b); F.rayo.position.copy(a).add(b).multiplyScalar(0.5); F.rayo.lookAt(b); F.rayo.rotateX(Math.PI / 2); F.rayo.scale.set(1 + Math.sin(time * 40) * 0.3, d, 1 + Math.sin(time * 40) * 0.3);
        lightFlash(b.x, b.y, b.z, 0x9fe8ff, 2, 7); if (rnd() < 0.8) pa(b.x, b.y, b.z, (rnd() - 0.5) * 4, rnd() * 3, (rnd() - 0.5) * 4, rnd() < 0.5 ? 0x7ff5ff : 0xffffff, 0.14, 0.3, 4, 1, 0.3, SH7.star); }
      if (!F.h && t > 0.6){ F.h = true; this.pega(4.6); play('beam'); flash('#bff6ff', 0.3); }
      if (t > 1.3){ scene.remove(F.rayo); this.endTurn(); } }
    else if (A.id === 'rush'){ const beats = [0.55, 0.8, 1.05, 1.3, 1.65];
      if (t < 0.4) ve(smooth(t / 0.4));
      F.i = F.i || 0;
      if (F.i < beats.length){ const bt = beats[F.i]; if (t > bt - 0.22){ this.aro({ x: e.g.position.x, y: 2.4, z: e.g.position.z }, 1 + Math.max(0, bt - t) * 8, 'ama'); }
        if (t >= bt + 0.06){ const good = Math.abs(this.lastAtk - (MG.t - (t - bt))) < 0.15, last = F.i === beats.length - 1;
          this.golpeReal(); this.pega(last ? 2.4 : 1.3, good ? 1.5 : 1); if (good){ tA.set(hero.position.x, 2.8, hero.position.z); spawnNumber(tA, '¡Perfecto!', 'react', '#ffe24a'); } play(last ? 'swingBig' : 'swing'); F.i++; this.aro(null); } }
      else { if (!F.vuelta) F.vuelta = t; ve(1 - smooth(Math.min(1, (t - F.vuelta) / 0.4))); if (t - F.vuelta > 0.5){ ve(0); this.endTurn(); } } }
    else if (A.id === 'truck'){ if (!F.horn){ F.horn = true; play('truckHorn'); tA.set(hero.position.x, 2.8, hero.position.z); spawnNumber(tA, '¡CAMIÓN-KUN!', 'react', '#ffffff'); F.cam = this.camion(); }
      const k = clamp((t - 0.3) / 1.0, 0, 1); F.cam.position.set(lerp(9, -12, k), 0, e.g.position.z + 0.1); F.cam.visible = k > 0 && k < 1;
      if (!F.h && F.cam.position.x < e.g.position.x + 1.4){ F.h = true; this.pega(8.5); this.atbE = 0; shake = 0.6; play('slam'); tA.set(e.g.position.x, 4.4, e.g.position.z); spawnNumber(tA, '¡ISEKAI!', 'react', '#ff8ad8'); this.eVuela = 1.2; }
      if (t > 1.6){ scene.remove(F.cam); this.endTurn(); } }
  },
  camion(){ const g = new THREE.Group(), c = truck.clone(); c.visible = true; c.position.set(0, 0, 0); c.scale.setScalar(1); c.rotation.set(0, -Math.PI / 2, 0); g.add(c); scene.add(g); return g; },   // Camión-kun de verdad, de lado hacia -x
  startEnemy(){
    let id; const r = rnd();
    if (this.charge) id = 'ray'; else if (r < 0.38) id = 'selfie'; else if (r < 0.68) id = 'autos'; else if (r < 0.83 && this.buff <= 0) id = 'speech'; else id = 'comb';
    this.st = 'eact'; this.act = { id, t: 0, F: {} }; this.say(RP3_NOM[id], 1.6); this.pintaMenu();
  },
  updEnemy(dt){
    const A = this.act, F = A.F, e = this.e; A.t += dt; const t = A.t, yo = hero.position;
    const aviso = tt => { const k = (tt - t) / 0.7; if (k <= 1 && k >= -0.05){ this.aro({ x: yo.x, y: 1.3, z: yo.z }, 1 + Math.max(0, k) * 2.4, 'azul'); if (!F['w' + tt]){ F['w' + tt] = true; tA.set(yo.x, 2.9, yo.z); spawnNumber(tA, '¡K!', 'react', '#9fe8ff'); } } else if (F['w' + tt] && !F['x' + tt]){ F['x' + tt] = true; this.aro(null); } };
    if (A.id === 'selfie'){ this.ePose = 'selfie'; e.phone11.visible = true; aviso(0.8);
      if (!F.h && t > 0.8){ F.h = true; flash('#ffffff', 0.8); play('crit'); this.hitP(9); }
      if (t > 1.3){ e.phone11.visible = false; this.endEnemy(); } }
    else if (A.id === 'autos'){ this.ePose = 'lanza'; const hits = [0.7, 1.05, 1.4]; F.pap = F.pap || [];
      hits.forEach((ht, i) => { aviso(ht); if (!F['p' + i] && t > ht - 0.45){ F['p' + i] = true; const m = mesh(B(0.5, 0.36, 0.02), makeMat(0xffffff, { emissive: 0.3 }), e.g.position.x, 2.4, e.g.position.z); F.pap.push({ m, t0: ht - 0.45, ht }); }
        if (!F['h' + i] && t > ht){ F['h' + i] = true; this.hitP(4); } });
      for (const P_ of F.pap){ const k = clamp((t - P_.t0) / (P_.ht - P_.t0), 0, 1); P_.m.visible = k < 1; P_.m.position.set(lerp(e.g.position.x + 0.6, yo.x, k), lerp(2.4, 1.3, k) + Math.sin(k * Math.PI) * 1.4, lerp(e.g.position.z, yo.z, k)); P_.m.rotation.z += dt * 14; P_.m.rotation.y = 0.6; }
      if (t > 1.8){ F.pap.forEach(P_ => scene.remove(P_.m)); this.endEnemy(); } }
    else if (A.id === 'speech'){ this.ePose = 'cheer'; if (!F.s){ F.s = true; starShout(e, '«¡Cree en ti! Bueno… en mí.»'); play('superOn'); }
      if (t > 0.5 && rnd() < 0.4) pa(e.g.position.x + (rnd() - 0.5) * 2, 1 + rnd() * 3, e.g.position.z, 0, 1, 0, 0xffd23a, 0.14, 0.6, 0, 1, 0.3, SH7.star);
      if (t > 1.4){ this.buff = 2; this.endEnemy(); } }
    else if (A.id === 'comb'){ this.ePose = 'hips'; if (!F.s){ F.s = true; starShout(e, 'Se está peinando… ¡algo gordo se avecina!'); }
      if (t > 1.3){ this.charge = true; this.endEnemy(); this.say('Consejo: ¡Defiende!', 1.6); } }
    else if (A.id === 'ray'){ this.ePose = 'point'; aviso(1.1);
      if (t > 0.3 && t < 1.1 && rnd() < 0.8) pa(e.g.position.x + 0.8, 2.3, e.g.position.z, 1, (rnd() - 0.5), 0, 0xfff6a0, 0.16, 0.3, 0, 1, 0.3, SH7.star);
      e.beam.visible = t > 1.1 && t < 1.45;
      if (e.beam.visible){ const a = angTo(e.g.position.x, e.g.position.z, yo.x, yo.z), d = Math.hypot(yo.x - e.g.position.x, yo.z - e.g.position.z); e.beam.position.set(e.g.position.x + Math.sin(a) * 0.8, 1.6, e.g.position.z + Math.cos(a) * 0.8); e.beam.rotation.y = a; e.beam.scale.set(0.6, 0.6, d); }
      if (!F.h && t > 1.1){ F.h = true; flash('#fff6c0', 0.7); shake = 0.5; play('beam'); this.hitP(20); this.charge = false; }
      if (t > 1.7){ e.beam.visible = false; this.endEnemy(); } }
  },
  endEnemy(){ if (this.buff > 0 && this.act.id !== 'speech') this.buff--; this.st = 'atb'; this.act = null; this.ePose = 'hips'; this.aro(null); this.pintaMenu(); },
  ia(e, dt){
    if (this.eVuela > 0){ this.eVuela -= dt; e.body.position.y = Math.sin(this.eVuela / 1.2 * Math.PI) * 2.2; e.body.rotation.x -= dt * 9; if (this.eVuela <= 0){ e.body.position.y = 0; e.body.rotation.x = 0; } return; }
    e.g.position.set(RP3_POS.el[0], 0, RP3_POS.el[1]); e.g.rotation.y = lerpAngle(e.g.rotation.y, angTo(e.g.position.x, e.g.position.z, hero.position.x, hero.position.z), 1 - Math.exp(-dt * 6));
    if (this.win > 0){ pose11(e, 'ko', dt, 6); return; }
    if (this.eGolpe > 0){ this.eGolpe -= dt; pose11(e, 'golpeado', dt, 16); return; }
    pose11(e, this.st === 'intro' ? 'hips' : this.st === 'eact' ? this.ePose : this.charge ? 'hips' : 'guardia', dt, 8);
    e.body.position.y = Math.sin(time * 2) * 0.05;
  },
  finish(){ this.win = 3.4; this.st = 'win'; this.aro(null); r3('.r3menu').hidden = true; sh3Grande('¡VICTORIA!', 'Obtienes 0 EXP: la fama no da experiencia', 2.8, 'rpg'); play('waveClear'); later(0.4, () => play('tier')); flash('#ffffff', 0.5); MG.endT = 3.2; },
  end(){ if (!this.vivo) return; this.vivo = false; rp3UI.hidden = true; this.aro(null); if (this.act && this.act.F){ const F = this.act.F; if (F.rayo) scene.remove(F.rayo); if (F.cam) scene.remove(F.cam); if (F.pap) F.pap.forEach(P_ => scene.remove(P_.m)); } this.act = null; sh3Acaba(this); }
};
MG_GAMES.rpg = RP3;
// W/S/flechas navegan el menú y no mueven a Tovan
addEventListener('keydown', ev => { if (SH3.prog !== RP3 || gameState !== 'play') return; const k = ev.code;
  if (['KeyW', 'KeyS', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'ArrowLeft', 'ArrowRight'].includes(k)){ ev.stopImmediatePropagation(); ev.preventDefault(); if (k === 'KeyW' || k === 'ArrowUp') RP3.nav(-1); else if (k === 'KeyS' || k === 'ArrowDown') RP3.nav(1); }
  else if (k === 'Enter' && RP3.st === 'menu'){ ev.preventDefault(); RP3.choose(RP3.sel); } }, true);
// sin daño «de verdad» en el RPG: los golpes de la animación no cuentan (el daño lo pone el programa)
const _hitEnemyRp3 = hitEnemy;
hitEnemy = function(e, ...a){ if (SH3.prog && SH3.prog.sinDano && e === bossE) return; return _hitEnemyRp3(e, ...a); };

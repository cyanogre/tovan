'use strict';
/* ======================================================================
   PROGRAMA 2 · ¡HUMOR CONFIANZA! (prueba de obstáculos en el plató)
   Sustituye a la carrera en pixel art. Míster Confianza mira desde su
   podio y Tovan, en el escenario, tiene que pulsar los botones verdes
   (J, cerca del botón) para que le caiga un castigo: guantazo, cubo de
   agua o tarta en la cara. Mientras tanto:
   · Barredor ROJO a ras de suelo: SALTA (Espacio) cuando pase.
   · Barredor AZUL a la altura de la cabeza (a partir de media ronda):
     RUEDA (K) por debajo.
   · Pelotas gigantes que él tira rodando (franja roja): apártate o rueda.
   Cámara fija de plató, para ver venir las barras.
   ====================================================================== */
const HA3_R = 8.4;
const HA3 = {
  overlay: false, barras: true, song: 'mgRun', title: ['PROGRAMA 2', '¡Humor Confianza!', 'Prueba de obstáculos · salta la barra roja · rueda bajo la azul · pulsa el botón verde'], ep: 'ep-run',
  construye(){
    if (this.g) return; const g = this.g = new THREE.Group(); g.visible = false; scene.add(g);
    const raya = (c1, c2) => { const t = sh3Lienzo(64, 16, (x, w, h) => { for (let k = 0; k < 8; k++){ x.fillStyle = k % 2 ? c2 : c1; x.fillRect(k * 8, 0, 8, h); } }); t.wrapS = THREE.RepeatWrapping; t.repeat.set(10, 1); return t; };
    const barra = (col, tex, y) => { const b = new THREE.Group(); g.add(b); const m = mesh(new THREE.CylinderGeometry(0.24, 0.24, HA3_R - 0.6, 10), makeMat(0xffffff, { map: tex }), (HA3_R + 0.6) / 2, y, 0, b); m.rotation.z = Math.PI / 2;
      mesh(new THREE.IcosahedronGeometry(0.34, 1), makeMat(col, { emissive: 0.5 }), HA3_R, y, 0, b); return b; };
    this.baja = barra(0xff3a3a, raya('#ff3a3a', '#ffffff'), 0.38); this.alta = barra(0x3a8aff, raya('#2a6aff', '#ffffff'), 1.5);
    mesh(new THREE.CylinderGeometry(0.62, 0.8, 2.2, 14), makeMat(0x3a3450), 0, 1.1, 0, g); mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.2, 14), makeMat(0xffd23a, { emissive: 0.5 }), 0, 2.25, 0, g);
    // podio de Míster Confianza al fondo
    const pod = new THREE.Group(); pod.position.set(0, 0, -HA3_R - 0.6); g.add(pod);
    mesh(B(3.4, 1.6, 2), makeMat(0xd8322a), 0, 0.8, 0, pod); mesh(B(3.6, 0.14, 2.2), makeMat(0xffd23a, { emissive: 0.4 }), 0, 1.66, 0, pod);
    mesh(new THREE.PlaneGeometry(1.4, 0.7), makeMat(0xffffff, { map: sh3Lienzo(128, 64, (x) => { x.fillStyle = '#ffd23a'; x.fillRect(0, 0, 128, 64); x.fillStyle = '#d8322a'; x.font = "bold 44px 'Pixelify Sans', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Nº 1', 64, 34); }), emissive: 0.4 }), 0, 0.9, 1.01, pod);
    // pulsadores
    this.botones = [[-5, 2.6], [5, 2.6], [-3.4, -4.6], [3.4, -4.6], [0, 5.6]].map(([x, z]) => { const b = new THREE.Group(); b.position.set(x, 0, z); g.add(b);
      mesh(new THREE.CylinderGeometry(0.42, 0.55, 0.9, 12), makeMat(0x2a2440), 0, 0.45, 0, b);
      const dom = mesh(new THREE.SphereGeometry(0.36, 14, 6, 0, TAU, 0, Math.PI / 2), makeMat(0x5a1a1a, { emissive: 0.2 }), 0, 0.9, 0, b);
      const col = mesh(new THREE.CylinderGeometry(0.5, 0.5, 9, 14, 1, true), makeMat(0x7dff8a, { emissive: 1, opacity: 0.18, side: THREE.DoubleSide }), 0, 5.4, 0, b); col.visible = false;
      return { g: b, dom, col, on: false, x, z }; });
    // pelotas
    const bola = sh3Lienzo(128, 64, (x) => { const c = ['#ff3a3a', '#ffffff', '#3a8aff', '#ffd23a', '#ffffff', '#7dff8a']; c.forEach((k, i) => { x.fillStyle = k; x.fillRect(i * 22, 0, 22, 64); }); });
    this.bolaMat = makeMat(0xffffff, { map: bola }); this.bolaGeo = new THREE.SphereGeometry(0.85, 16, 10);
    this.lin = lineTele();
    // castigos: guante con muelle, cubo y tarta
    this.guante = new THREE.Group(); g.add(this.guante); mesh(new THREE.IcosahedronGeometry(0.55, 1), makeMat(0xd8222a), 0, 0, 0, this.guante); mesh(B(0.5, 0.5, 0.5), makeMat(0xffffff), 0, 0, -0.55, this.guante);
    this.cubo = new THREE.Group(); g.add(this.cubo); mesh(new THREE.CylinderGeometry(0.55, 0.42, 0.7, 12, 1, true), makeMat(0x8a94a8, { side: THREE.DoubleSide }), 0, 0, 0, this.cubo);
    this.tarta = new THREE.Group(); g.add(this.tarta); mesh(new THREE.CylinderGeometry(0.42, 0.38, 0.2, 12), makeMat(0xd8a050), 0, 0, 0, this.tarta); mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 12), makeMat(0xffb8d8), 0, 0.14, 0, this.tarta);
    for (const o of [this.guante, this.cubo, this.tarta]) o.visible = false;
  },
  start(){
    this.vivo = true; this.construye(); sh3Empieza(this); document.body.classList.add('sh3-pelea', 'sh3-abajo'); sh3Barras(true); this.g.visible = true;
    const e = sh3TomaJefe(this, (e_, dt) => this.ia(e_, dt)); this.e = e;
    e.g.position.set(0, 0, -HA3_R - 0.6); e.g.rotation.y = 0; e.body.position.y = 1.7;
    hero.position.set(0, 0, 5.2); heading = Math.PI; hero.rotation.y = heading; vy = 0; grounded = true; camYaw = 0;
    this.intro = 2.6; this.angB = Math.PI * 0.5; this.angA = -Math.PI * 0.5; this.prevB = null; this.prevA = null; this.alta.visible = false; this.altaOn = false;
    this.bolas = []; this.bolaT = 4; this.btnT = 1.2; this.castigo = null; this.vuln = 1; this.golpeT = 0; this.hechos = 0;
    for (const b of this.botones){ b.on = false; b.col.visible = false; b.dom.material.uniforms.uColor.value.setHex(0x5a1a1a); }
    musOverride(this.song); play('superOn');
    sh3Grande('¡HUMOR CONFIANZA!', 'Pulsa los botones verdes… y que no te barran', 2.4, 'ronda');
    sh3Teclas([['M', 'moverte'], ['E', 'salta la barra ROJA'], ['K', 'rueda bajo la AZUL'], ['J', 'pulsa el botón VERDE']]);
    later(1.2, () => { if (this.vivo) starShout(e, '¡Bienvenido a mi programa! ¡Que te barran!'); });
    SH3.cam = cam => { const k = camera.aspect < 1 ? 1.3 : 1; cam.position.set(hero.position.x * 0.25, 11.5 * k, (15.5 + hero.position.z * 0.12) * k); cam.lookAt(hero.position.x * 0.2, 0.6, -2.6); };
  },
  bloqueo(){ return this.intro > 0; },
  btn(b){
    if (b !== 'attack' || !this.vivo || this.intro > 0) return false;
    const B_ = this.botones.find(o => o.on && Math.hypot(hero.position.x - o.x, hero.position.z - o.z) < 1.7);
    if (B_) this.pulsa(B_); return false;   // (el golpe sale igual: el botón se pulsa de un bastonazo)
  },
  fase(){ return FT3.fase(); },
  enciende(){ const libres = this.botones.filter(o => !o.on && Math.hypot(hero.position.x - o.x, hero.position.z - o.z) > 3); const B_ = libres[Math.floor(rnd() * libres.length)] || this.botones[0];
    B_.on = true; B_.col.visible = true; B_.dom.material.uniforms.uColor.value.setHex(0x7dff8a); play('tier'); sh3Aviso('¡Botón verde encendido! Ve y pulsa J a su lado'); },
  pulsa(B_){
    B_.on = false; B_.col.visible = false; B_.dom.material.uniforms.uColor.value.setHex(0x5a1a1a); this.btnT = 1.6; this.hechos++; sh3Aviso(null);
    play('confirm'); flash('#7dff8a', 0.2); gring(B_.x, 1, B_.z, 0x7dff8a, 0.3, 2.4, 0.35);
    const tipo = ['guante', 'cubo', 'tarta'][this.hechos % 3]; this.castigo = { tipo, t: 0, hecho: false };
    sh3Anuncio(tipo === 'guante' ? '¡CASTIGO! ¡GUANTAZO!' : tipo === 'cubo' ? '¡CASTIGO! ¡CUBO DE AGUA!' : '¡CASTIGO! ¡TARTAZO!', '');
  },
  castiga(dt){
    const C_ = this.castigo, e = this.e, cab = e.g.position, y = e.body.position.y + e.numY * 0.78; C_.t += dt; let fin = false;
    if (C_.tipo === 'guante'){ const k = Math.min(1, C_.t / 0.22); this.guante.visible = true; this.guante.position.set(lerp(-6, cab.x - 0.6, k), y, cab.z + 0.4); this.guante.rotation.y = Math.PI / 2;
      if (k >= 1 && !C_.hecho){ C_.hecho = true; this.golpea(4, 'guantazo'); gring(cab.x, y, cab.z, 0xffffff, 0.2, 2, 0.3); } fin = C_.t > 0.55; if (C_.t > 0.3) this.guante.position.x -= dt * 14; }
    else if (C_.tipo === 'cubo'){ this.cubo.visible = true; const k = Math.min(1, C_.t / 0.4); this.cubo.position.set(cab.x, y + 3.2 - k * 1.4, cab.z); this.cubo.rotation.z = k * Math.PI;
      if (k >= 1 && !C_.hecho){ C_.hecho = true; this.golpea(4, 'chof');
        for (let i = 0; i < 40; i++) pa(cab.x + (rnd() - 0.5) * 0.8, y + 1.2, cab.z + (rnd() - 0.5) * 0.8, (rnd() - 0.5) * 2, -3 - rnd() * 3, (rnd() - 0.5) * 2, rnd() < 0.6 ? 0x6ac8ff : 0xffffff, 0.16, 0.7, 6, 1, 0.4, SH7.dot); }
      fin = C_.t > 0.9; }
    else { const k = Math.min(1, C_.t / 0.35); this.tarta.visible = true; this.tarta.position.set(lerp(6, cab.x + 0.3, k), y + Math.sin(k * Math.PI) * 1.5, cab.z + 0.5); this.tarta.rotation.z = -k * 1.4;
      if (k >= 1 && !C_.hecho){ C_.hecho = true; this.golpea(4, 'plaf'); for (let i = 0; i < 26; i++){ const a = rnd() * TAU; pa(cab.x, y, cab.z + 0.5, Math.cos(a) * 3, Math.sin(a) * 3, 1, rnd() < 0.6 ? 0xffb8d8 : 0xffffff, 0.18, 0.6, 4, 1, 0.3, SH7.dot); } }
      fin = C_.t > 0.8; }
    if (fin){ this.castigo = null; this.guante.visible = this.cubo.visible = this.tarta.visible = false; }
  },
  golpea(pct, txt){ const e = this.e; tB.set(e.g.position.x, e.body.position.y + e.numY * 0.5, e.g.position.z); sh3Dano(pct, tB, ''); e.flash = 0.3; shake = Math.max(shake, 0.3); this.golpeT = 0.8;
    play('slam'); starShout(e, pick10(['¡Mi pelo!', '¡Eso no estaba en el guion!', '¡Corten! ¡CORTEN!', '¡Mi traje nuevo!', '¡Mis fans me están viendo!'])); },
  barra(B_, ang, prev, alta, dt){   // devuelve el nuevo «prev» (ángulo relativo de Tovan respecto a la barra)
    B_.rotation.y = -ang; const p = hero.position, rh = Math.hypot(p.x, p.z); if (rh < 0.7 || rh > HA3_R + 0.4) return null;
    const ph = Math.atan2(p.z, p.x); let d = ph - ang; d = Math.atan2(Math.sin(d), Math.cos(d));
    if (prev !== null && Math.sign(d) !== Math.sign(prev) && Math.abs(d) < 0.6 && player.inv <= 0){
      const pasa = alta ? state === 'roll' : p.y > 0.55;
      if (!pasa){ const sx = Math.cos(ang) * rh - Math.sin(ang) * Math.sign(prev) * 0.6, sz = Math.sin(ang) * rh + Math.cos(ang) * Math.sign(prev) * 0.6;
        if (hurtPlayer((alta ? 10 : 9) * this.e.dm, sx, sz, 9) === 'hit'){ shake = Math.max(shake, 0.4); tA.set(p.x, p.y + 2.4, p.z); spawnNumber(tA, alta ? '¡Rueda por debajo!' : '¡Salta!', 'react', alta ? '#9fd0ff' : '#ff8a8a'); } }
      else { tA.set(p.x, p.y + 2.2, p.z); spawnNumber(tA, '¡Bien!', 'react', '#7dff8a'); } }
    return d;
  },
  upd(dt){
    if (!this.vivo) return; const f = this.fase();
    if (this.intro > 0){ this.intro -= dt; if (this.intro <= 0){ this.enciende(); sh3Teclas([['E', 'barra ROJA: salta'], ['K', 'barra AZUL: rueda'], ['J', 'botón VERDE']]); } return; }
    // barredores
    const wB = 1.05 + 0.75 * (1 - f); this.angB += wB * dt; this.prevB = this.barra(this.baja, this.angB, this.prevB, false, dt);
    if (!this.altaOn && f < 0.6){ this.altaOn = true; this.alta.visible = true; sh3Anuncio('¡BARREDOR ALTO!', 'rojo'); sh3Aviso('La barra AZUL va a la altura de la cabeza: rueda (K) por debajo'); play('bruteWarn'); }
    if (this.altaOn){ this.angA -= (0.8 + 0.5 * (1 - f)) * dt; this.prevA = this.barra(this.alta, this.angA, this.prevA, true, dt); }
    // pulsadores
    if (!this.botones.some(o => o.on) && !this.castigo){ this.btnT -= dt; if (this.btnT <= 0) this.enciende(); }
    for (const o of this.botones) if (o.on){ o.col.material.uniforms.uOpacity.value = 0.12 + 0.12 * Math.abs(Math.sin(time * 6)); o.dom.position.y = 0.9 + Math.abs(Math.sin(time * 8)) * 0.05; }
    if (this.castigo) this.castiga(dt);
    // pelotas
    for (let i = this.bolas.length - 1; i >= 0; i--){ const P_ = this.bolas[i]; P_.t += dt;
      if (P_.t < 0.8){ showLine(this.lin, P_.x0, P_.z0, P_.a, 1.8, 18); continue; } if (P_.t - dt < 0.8){ this.lin.visible = false; play('boing'); }
      const m = P_.m; m.position.x += Math.sin(P_.a) * 7.5 * dt; m.position.z += Math.cos(P_.a) * 7.5 * dt; m.rotation.x += dt * 8; m.position.y = 0.85;
      if (!P_.hit && Math.hypot(hero.position.x - m.position.x, hero.position.z - m.position.z) < 1.25 && hero.position.y < 1.4){ if (hurtPlayer(8 * this.e.dm, m.position.x, m.position.z, 10) !== 'none') P_.hit = true; }
      if (Math.hypot(m.position.x, m.position.z) > HA3_R + 2){ scene.remove(m); this.bolas.splice(i, 1); } }
  },
  ia(e, dt){
    e.g.position.set(0, 0, -HA3_R - 0.6); e.body.position.y = 1.7; e.g.rotation.y = lerpAngle(e.g.rotation.y, angTo(0, -HA3_R, hero.position.x, hero.position.z), 1 - Math.exp(-dt * 4));
    if (this.golpeT > 0){ this.golpeT -= dt; pose11(e, 'golpeado', dt, 14); return; }
    if (this.intro > 0){ pose11(e, 'wave', dt, 8); e.arms[1].userData.el.rotation.z = 0.5 + Math.sin(time * 14) * 0.5; return; }
    this.bolaT -= dt * (1.2 - 0.5 * this.fase());
    if (this.bolaT < 0.6 && this.bolaT > 0){ pose11(e, 'windup', dt, 10); sh3Signo('uno', e); return; }
    if (this.bolaT <= 0){ this.bolaT = 3.4 + rnd() * 1.4; sh3Signo(null, e); const a = angTo(0, -HA3_R + 0.5, hero.position.x, hero.position.z), m = mesh(this.bolaGeo, this.bolaMat, 0, 0.85, -HA3_R + 0.9);
      this.bolas.push({ m, a, t: 0, x0: 0, z0: -HA3_R + 0.9, hit: false }); play('swingBig'); starShout(e, pick10(['¡Pelotita!', '¡Esquiva esto!', '¡Regalo para ti!'])); }
    sh3Signo(null, e); pose11(e, this.bolaT > 2.8 ? 'lanza' : Math.sin(time * 2) > 0 ? 'cheer' : 'point', dt, 8);
  },
  finish(){
    sh3Grande('¡PRUEBA SUPERADA!', 'Míster Confianza, empapado y despeinado', 2.4, 'ronda'); play('waveClear'); flash('#ffffff', 0.4);
    for (const o of this.botones){ o.on = false; o.col.visible = false; } this.alta.visible = false; MG.endT = 2.6; this.castigo = null;
  },
  end(){ if (!this.vivo) return; this.vivo = false; for (const P_ of this.bolas) scene.remove(P_.m); this.bolas = []; if (this.lin) this.lin.visible = false; if (this.g) this.g.visible = false; sh3Acaba(this); }
};
MG_GAMES.run = HA3;

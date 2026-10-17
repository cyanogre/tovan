'use strict';
/* ======================================================================
   PROGRAMA 1 · ¡PELEA DE LA FAMA! (lucha de lado, en 3D)
   Tovan pelea con su repertorio de siempre: J combo, K esquiva (con sus
   fotogramas de invulnerabilidad), Espacio salto y L especial. Cámara de
   lado que se aleja cuando se separan, barras grandes, RONDA y K.O.
   Míster Confianza avisa cada golpe: «!» amarillo (golpe) o «!!» rojo
   (sal de ahí: salta o rueda), su nombre en grande y una franja roja en
   el suelo cuando el golpe cruza el escenario. Tras cada ataque se queda
   vendido un momento; con la pose de chulito, le duele un 50 % más.
   ====================================================================== */
const FT3_X = 7.4;
const FT3_ATQ = {
  directo: { nom: '¡PUÑETAZO DE LA FAMA!', signo: 'uno' },
  patada:  { nom: '¡PATADA ESTELAR!', signo: 'dos' },
  selfie:  { nom: '¡SELFIE CEGADOR!', signo: 'dos', pista: 'Salta por encima del flash' },
  firma:   { nom: '¡FIRMA RELÁMPAGO!', signo: 'dos', pista: 'Salta o rueda a través de él' },
  trofeo:  { nom: '¡TROFEO BUMERÁN!', signo: 'uno', pista: 'Salta cuando pase (va y vuelve)' },
  pose:    { nom: '¡MIRAD QUÉ BÍCEPS!', signo: null }
};
const FT3 = {
  overlay: false, lado: true, barras: true, song: 'mgFight', title: ['PROGRAMA 1', '¡Pelea de la Fama!', 'Lucha de lado · tus controles de siempre · ¡ojo a sus avisos!'], ep: 'ep-arcade',
  start(){
    this.vivo = true; sh3Empieza(this); document.body.classList.add('sh3-pelea'); sh3Barras(true);
    const e = sh3TomaJefe(this, (e_, dt) => this.ia(e_, dt)); this.e = e;
    e.g.position.set(3.6, 0, 0); e.g.rotation.y = -Math.PI / 2;
    hero.position.set(-3.6, 0, 0); heading = Math.PI / 2; hero.rotation.y = heading; vy = 0; grounded = true; camYaw = 0;
    this.intro = 2.4; this.ko = 0; this.atk = null; this.cd = 1.0; this.ult = ''; this.vuln = 1; this.tocado = 0; this.lin = this.lin || lineTele();
    musOverride(this.song); play('superOn');
    sh3Grande(`RONDA ${MG.round + 1}`, '¡PELEA!', 2.2, 'ronda');
    sh3Teclas([['M', 'moverte'], ['J', 'golpe (púlsalo seguido: combo)'], ['K', 'esquiva'], ['E', 'salto'], ['L', 'especial']]);
    later(1.0, () => { if (this.vivo) starShout(e, '¡A por mis fans!'); });
    SH3.cam = cam => { const hx = hero.position.x, ex = this.e.g.position.x, mx = clamp((hx + ex) / 2, -3.2, 3.2), d = Math.abs(hx - ex);
      const k = camera.aspect < 1 ? 1.75 : camera.aspect < 1.4 ? 1.25 : 1, z = (8.6 + clamp(d - 3, 0, 8) * 0.75) * k, y = 2.3 + (k - 1) * 0.8 + Math.max(0, hero.position.y * 0.4); cam.position.set(mx, y, z); cam.lookAt(mx, 1.35 + hero.position.y * 0.25, 0); };
  },
  bloqueo(){ return this.intro > 0 || this.ko > 0; },
  upd(dt){
    if (!this.vivo) return;
    // el escenario es una línea: Tovan no se sale de ella
    hero.position.z = clamp(hero.position.z, -0.45, 0.45); hero.position.x = clamp(hero.position.x, -FT3_X, FT3_X);
    if (this.intro > 0){ this.intro -= dt; if (this.intro <= 0) sh3Teclas([['J', 'golpe'], ['K', 'esquiva'], ['E', 'salto'], ['L', 'especial']]); }
    if (this.ko > 0){ this.ko -= dt; }
    if (this.tocado > 0) this.tocado -= dt;
    if (this.e && this.e.flash > 0.09 && this.tocado <= 0 && !this.atk && !this.ko){ this.tocado = 0.25; }
  },
  ia(e, dt){
    const p = hero.position, x = e.g.position.x, dx = p.x - x, dist = Math.abs(dx), dir = Math.sign(dx) || 1;
    e.g.position.z = lerp(e.g.position.z, 0, 1 - Math.exp(-dt * 8)); e.g.position.x = clamp(e.g.position.x, -FT3_X, FT3_X);
    if (this.ko > 0){ pose11(e, 'ko', dt, 7); e.body.position.y = lerp(e.body.position.y, 0.15, 1 - Math.exp(-dt * 5)); sh3Signo(null); return; }
    e.g.rotation.y = lerpAngle(e.g.rotation.y, dir > 0 ? Math.PI / 2 : -Math.PI / 2, 1 - Math.exp(-dt * 10));
    if (this.intro > 0){ pose11(e, this.intro > 1.2 ? 'hips' : 'guardia', dt, 8); return; }
    if (this.atk){ let fin = false; try { fin = this.atk.upd(dt); } catch (err) { console.error(err); fin = true; }
      sh3Signo(this.atk && !fin && this.atk.aviso ? this.atk.aviso() : null, e);
      if (fin){ if (this.atk.end) this.atk.end(); this.atk = null; this.vuln = 1; sh3Aviso(null); const f = this.fase(); this.cd = (0.75 + rnd() * 0.6) * (f > 0.5 ? 1 : 0.7); } return; }
    sh3Signo(null);
    // tocado: se encoge un instante (pero no se interrumpe un ataque)
    if (this.tocado > 0){ pose11(e, 'golpeado', dt, 18); e.g.position.x -= dir * 1.5 * dt; return; }
    // en guardia: busca la distancia buena, con saltitos de boxeador
    const want = dist > 4.2 ? 1 : dist < 1.9 ? -1 : 0, sp = 2.4 * (this.fase() > 0.5 ? 1 : 1.25);
    e.g.position.x += want * dir * sp * dt; pose11(e, 'guardia', dt, 10);
    const bote = Math.sin(time * 9); e.body.position.y = Math.abs(bote) * 0.06; if (want){ const G = POSE11.guardia.lg; e.legs[0].rotation.x = G[0] + bote * 0.4; e.legs[1].rotation.x = G[1] - bote * 0.4; }   // (asignado, no sumado: sumarlo cada fotograma lo acumulaba y las piernas giraban como un remolino)
    this.cd -= dt; if (this.cd <= 0 && !player.dead && gameState === 'play') this.elige(e, dist);
  },
  fase(){ const b = bossE, r = Math.max(0, MG.round), top = r ? MG_THR[r - 1] : 1, bot = MG_THR[r]; return b ? clamp((b.hp / b.maxHp - bot) / Math.max(0.01, top - bot), 0, 1) : 1; },
  elige(e, dist){
    const ops = dist < 2.3 ? [['directo', 5], ['patada', 1.5], ['selfie', 1.5], ['pose', 1], ['firma', 1.5]] : dist < 5 ? [['patada', 3], ['firma', 2.5], ['selfie', 2.5], ['trofeo', 2], ['directo', 1.5], ['pose', 0.7]] : [['firma', 3.5], ['selfie', 3], ['trofeo', 2.5], ['patada', 1]];
    const lista = ops.filter(o => o[0] !== this.ult), tot = lista.reduce((s, o) => s + o[1], 0); let rr = rnd() * tot, n = lista[0][0];
    for (const [k, w] of lista){ rr -= w; if (rr <= 0){ n = k; break; } }
    this.ult = n; const A = FT3_ATQ[n]; this.atk = this['a_' + n](e); this.atk.nombre = n;
    sh3Anuncio(A.nom, A.signo === 'dos' ? 'rojo' : ''); if (A.pista) sh3Aviso(A.pista); play(A.signo === 'dos' ? 'bruteWarn' : 'cursor');
  },
  golpea(e, dmg, kn){ const r = hurtPlayer(dmg * e.dm, e.g.position.x, 0, kn || 7); if (r === 'hit'){ shake = Math.max(shake, 0.35); } return r; },
  // ---- ataques ----
  a_directo(e){ let t = 0, n = this.fase() < 0.5 ? 2 : 1, k = 0, pegado = false; const T0 = 0.5;
    return { aviso: () => t < T0 ? 'uno' : null, upd: dt => { t += dt; const dir = Math.sign(hero.position.x - e.g.position.x) || 1;
      if (t < T0){ pose11(e, 'windup', dt, 12); e.flash = Math.max(e.flash, Math.sin(time * 30) > 0 ? 0.06 : 0); return false; }
      const u = t - T0;
      if (u < 0.2){ pose11(e, 'directo', dt, 30); e.g.position.x += dir * 9 * dt;
        if (!pegado && Math.abs(hero.position.x - (e.g.position.x + dir * 1.0)) < 1.0 && hero.position.y < 1.4){ pegado = true; this.golpea(e, 9, 8); gring(e.g.position.x + dir * 1.2, 1.4, 0, 0xffd23a, 0.2, 1.4, 0.2); }
        if (u > 0.04 && u - dt <= 0.04) play('swingBig'); return false; }
      if (u < 0.5){ pose11(e, 'directo', dt, 8); return false; }
      if (++k < n){ t = T0 - 0.15; pegado = false; return false; }
      pose11(e, 'tired', dt, 6); return u > 0.95; } }; },
  a_patada(e){ let t = 0, x0 = 0, x1 = 0, st = 'agacha', pegado = false;
    return { aviso: () => st === 'agacha' ? 'dos' : null, upd: dt => { t += dt;
      if (st === 'agacha'){ pose11(e, 'agachado', dt, 12); e.body.position.y = 0; if (t > 0.5){ st = 'vuela'; t = 0; x0 = e.g.position.x; x1 = clamp(hero.position.x, -FT3_X, FT3_X); play('jump'); } return false; }
      if (st === 'vuela'){ const k = Math.min(1, t / 0.62); e.g.position.x = lerp(x0, x1, k); e.body.position.y = Math.sin(k * Math.PI) * 2.3; pose11(e, k < 0.45 ? 'superman' : 'patada', dt, 14);
        if (rnd() < 0.7) pa(e.g.position.x, e.body.position.y + 1, 0, 0, 0.5, 0, rnd() < 0.5 ? 0xffd23a : 0xffffff, 0.2, 0.3, 0, 1, 0.3, SH7.star);
        if (!pegado && k > 0.45 && Math.abs(hero.position.x - e.g.position.x) < 1.1 && Math.abs(hero.position.y - e.body.position.y) < 1.5){ pegado = true; this.golpea(e, 10, 9); }
        if (k >= 1){ st = 'cae'; t = 0; e.body.position.y = 0; shake = 0.4; play('bossSlam'); slamRing(e); hurtAt(e.g.position.x, 0, 1.5, 7 * e.dm, 6); } return false; }
      pose11(e, 'land', dt, 10); return t > 0.75; } }; },
  a_selfie(e){ let t = 0, dir = 0, hitCd = 0; const L = this.lin;
    return { aviso: () => t < 0.85 ? 'dos' : null, end(){ L.visible = false; e.beam.visible = false; e.phone11.visible = false; }, upd: dt => { t += dt; e.phone11.visible = true;
      if (t < 0.85){ dir = Math.sign(hero.position.x - e.g.position.x) || 1; pose11(e, 'selfie', dt, 10); showLine(L, e.g.position.x, 0, dir > 0 ? Math.PI / 2 : -Math.PI / 2, 1.3, 15); return false; }
      if (t - dt < 0.85){ L.visible = false; flash('#ffffff', 0.45); play('beam'); }
      const a = dir > 0 ? Math.PI / 2 : -Math.PI / 2; e.beam.visible = t < 1.25; e.beam.position.set(e.g.position.x + dir * 0.8, 0.95, 0); e.beam.rotation.y = a; e.beam.scale.set(0.5, 0.5, 15);
      lightFlash(e.g.position.x + dir * 3, 1.2, 0, 0xffffff, 2, 9); hitCd -= dt;
      if (t < 1.25 && hitCd <= 0 && (hero.position.x - e.g.position.x) * dir > 0 && hero.position.y < 0.95){ hitCd = 0.5; if (this.golpea(e, 9, 5) === 'hit'){ tA.set(hero.position.x, hero.position.y + 2.6, 0); spawnNumber(tA, '¡Has salido con los ojos cerrados!', 'react', '#ffffff'); } }
      if (t >= 1.25){ pose11(e, 'hips', dt, 8); e.beam.visible = false; } return t > 1.7; } }; },
  a_firma(e){ let t = 0, dir = 0, pegado = false, xF = 0, quieto = 0; const L = this.lin;
    return { aviso: () => t < 0.8 ? 'dos' : null, end(){ L.visible = false; }, upd: dt => { t += dt;
      if (t < 0.8){ dir = Math.sign(hero.position.x - e.g.position.x) || 1; xF = dir * FT3_X; pose11(e, 'point', dt, 12); showLine(L, e.g.position.x, 0, dir > 0 ? Math.PI / 2 : -Math.PI / 2, 1.6, Math.abs(xF - e.g.position.x));
        if (rnd() < 0.5) pa(e.g.position.x + (rnd() - 0.5), rnd() * 2.5, 0, 0, 1, 0, 0xffe24a, 0.15, 0.3, 0, 1, 0.3, SH7.star); return false; }
      if (t - dt < 0.8){ L.visible = false; play('swingBig'); play('charge'); }
      pose11(e, 'dive', dt, 16); e.body.rotation.x = 0.4; e.body.position.y = 0.4; const vx = dir * 19; e.g.position.x += vx * dt;
      if (rnd() < 0.9) pa(e.g.position.x, 1.3, 0, -vx * 0.05, 0, 0, 0xffd23a, 0.25, 0.3, 0, 0, 0.3, SH7.star);
      if (!pegado && Math.abs(hero.position.x - e.g.position.x) < 0.9 && hero.position.y < 1.25){ pegado = true; this.golpea(e, 12, 10); }
      if ((e.g.position.x - xF) * dir >= 0){ e.g.position.x = xF; e.body.position.y = 0; e.body.rotation.x = 0; pose11(e, 'tired', dt, 6); quieto += dt; return quieto > 0.6; }
      return false; } }; },
  a_trofeo(e){ let t = 0, dir = 0, m = null, x0 = 0, pegado = 0;
    return { aviso: () => t < 0.6 ? 'uno' : null, end(){ if (m) scene.remove(m); }, upd: dt => { t += dt;
      if (t < 0.6){ dir = Math.sign(hero.position.x - e.g.position.x) || 1; pose11(e, 'windup', dt, 10); return false; }
      if (!m){ m = mkTrophy11(); x0 = e.g.position.x; play('swingBig'); }
      pose11(e, t < 1.0 ? 'lanza' : 'hips', dt, 14);
      const k = Math.min(1, (t - 0.6) / 2.0), fwd = Math.sin(k * Math.PI) * 9.5; m.position.set(clamp(x0 + dir * fwd, -FT3_X - 1, FT3_X + 1), 1.0, 0); m.rotation.y += dt * 18;
      if (rnd() < 0.6) pa(m.position.x, 1.0, 0, 0, 0.3, 0, 0xffd23a, 0.12, 0.35, 0, 1, 0.2, SH7.star);
      if (pegado <= 0 && Math.abs(hero.position.x - m.position.x) < 0.7 && hero.position.y < 0.85){ pegado = 0.6; this.golpea(e, 10, 6); } pegado -= dt;
      return k >= 1; } }; },
  a_pose(e){ let t = 0; const p = rnd() < 0.5 ? 'flex' : 'dab'; this.vuln = 1.5; starShout(e, p === 'flex' ? '¡Mirad qué bíceps!' : '¡DAB! ¡Esto se lleva!'); sh3Aviso('¡Ahora! Le duele un 50 % más');
    return { aviso: () => null, upd: dt => { t += dt; pose11(e, p, dt, 9); if (rnd() < dt * 8){ const a = rnd() * TAU; gring(e.g.position.x + Math.cos(a) * 1.6, 1.6 + rnd(), Math.sin(a) * 1.6, 0xffffff, 0.1, 0.8, 0.18); }
      return t > 1.6; } }; },
  finish(){
    this.ko = 3; this.atk && this.atk.end && this.atk.end(); this.atk = null; sh3Signo(null); sh3Aviso(null);
    sh3Grande('K.O.', '¡Míster Confianza besa la lona!', 2.4, 'ko'); play('specialBoom'); flash('#ffffff', 0.6); shake = 0.6; hitStop = Math.max(hitStop, 0.25);
    const e = this.e; burst7(PA7, e.g.position.x, 1.4, 0, 40, [0xffd23a, 0xffffff, 0xff5a5a], 8, 0.2, 0.7, 6, 1, 0, SH7.star);
    MG.endT = 2.6;
  },
  end(){ if (!this.vivo) return; this.vivo = false; if (this.atk && this.atk.end) this.atk.end(); this.atk = null; if (this.lin) this.lin.visible = false; sh3Acaba(this); }
};
MG_GAMES.fight = FT3;

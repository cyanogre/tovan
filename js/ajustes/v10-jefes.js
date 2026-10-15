'use strict';
/* ======================================================================
   AJUSTES v10
   · El Guardián (primer jefe): −25 % de vida, ondas avisadas, patrón fijo
   · Todas las ondas de jefe: muro visible, contorno oscuro y aviso «¡SALTA!»
   · Esqueleto: el aullido helado avisa antes y sus ondas se ven
   · Invulnerable en el aire y rodando
   · Poderes acumulables, especiales de rama, bonus explicados y más comedia
   ====================================================================== */
var DEAL10 = false;                                    // var: pwOn puede consultarlo antes de que se ejecute este módulo
function S10(id){ return Math.max(0, lvl(id) - 1); }   // copias extra de un poder
function pwFam10(id){ if (!DEAL10) return false; const u = UPGRADES.find(x => x.id === id); return !!(u && u.tags && u.tags.some(t => setOn(t))); }
const pick10 = a => a[Math.floor(rnd() * a.length)];
const P10 = { force: [], airT: -9, cueT: -9, comT: 20, deathT: -9, spawnT: -9, lowW: -1, idleT: 0, lastPos: [0, 0] };

const GU10 = { hp: 0.75, ringSpd: 5.2, pause: 1.5, pause2: 1.1,
  cyc: ['charge', 'jump', 'pillars', 'charge', 'jump', 'rocks', 'raise'] };
const RB10 = [];
const waveGeo10 = C(1, 1, 0.6, 48, true), waveOutGeo10 = new THREE.RingGeometry(1.0, 1.08, 48);
const isGu10 = e => e && e.type === 'boss' && e.isBoss;
const _c10 = new THREE.Color(), _w10 = new THREE.Color(0xffffff);

/* ---------- Ondas de jefe: muro brillante + contorno oscuro + «¡SALTA!» ---------- */
const _slamRing10 = slamRing;
slamRing = function(e){
  const n0 = eRings.length; _slamRing10(e); if (eRings.length <= n0) return;
  const r = eRings[eRings.length - 1];
  if (isGu10(e)){ r.speed = GU10.ringSpd;
    barkOnce('ondas10', '¡Cada golpe al suelo suelta una onda! Salta justo cuando te llegue: te aviso con un «¡SALTA!».'); }
  gring(r.m.position.x, 0.1, r.m.position.z, 0xffd070, 0.4, 2.2, 0.3);
};
function deco10(r){
  r.d10 = true; const u = r.m.material.uniforms, x = r.m.position.x, z = r.m.position.z;
  _c10.copy(u.uColor.value).lerp(_w10, r.vivid ? 0.1 : 0.45); const col = _c10.getHex();
  const band = mesh(waveGeo10, makeMat(col, { emissive: 1, opacity: 0.62, side: THREE.DoubleSide }), x, 0.31, z);
  const out = mesh(waveOutGeo10, makeMat(0x07040e, { opacity: 0.7, side: THREE.DoubleSide }), x, 0.045, z); out.rotation.x = -Math.PI / 2;
  RB10.push({ r, band, out, cue: false, col: u.uColor.value.getHex() });
}
function rb10(dt){
  for (const r of eRings) if (!r.d10) deco10(r);
  for (let i = RB10.length - 1; i >= 0; i--){ const o = RB10[i], r = o.r;
    if (!eRings.includes(r)){ scene.remove(o.band); scene.remove(o.out); o.band.material.dispose(); o.out.material.dispose(); RB10.splice(i, 1); continue; }
    const k = 1 - r.r / r.max;
    o.band.scale.set(r.r, 1, r.r); o.band.material.uniforms.uOpacity.value = 0.62 * k + 0.15;
    o.out.scale.setScalar(r.r * 1.02); o.out.material.uniforms.uOpacity.value = 0.7 * k + 0.1;
    if (dt > 0){ const cx = r.m.position.x, cz = r.m.position.z;
      for (let j = 0; j < 3; j++){ const a = rnd() * TAU; pa(cx + Math.cos(a) * r.r, 0.12 + rnd() * 0.5, cz + Math.sin(a) * r.r, Math.cos(a) * 2, 1.4 + rnd(), Math.sin(a) * 2, rnd() < 0.5 ? o.col : 0xffffff, 0.13, 0.3, -2, 1, 0.3, SH7.sq); }
      if (!o.cue && !player.dead && gameState === 'play'){ const d = Math.hypot(hero.position.x - cx, hero.position.z - cz), ahead = (d - r.r) / r.speed;
        if (ahead > 0.12 && ahead < 0.42 && hero.position.y < 0.3){ o.cue = true; if (time - P10.cueT > 0.9){ P10.cueT = time; shoutHero7('¡SALTA!', '#ffb03a'); } } } }
  }
}
function waveWarn10(x, z, col){
  shout7('¡ONDA!', '#dff8ff', x, 2.4, z); play('bruteWarn');
  for (let k = 0; k < 4; k++) later(k * 0.11, () => gring(x, 0.1, z, k % 2 ? 0xffffff : col, 3.4, 0.6, 0.26));
  const m = circTele(); showCirc(m, x, z, 1.5); hzAdd({ t: 0, upd(dt){ this.t += dt; pulse(m); return this.t > 0.6; }, end(){ scene.remove(m); } });
}

/* ---------- La onda de «lluvia de escombros» del Guardián ya no sale de golpe ---------- */
if (BX.boss){
  const rocks0 = BX.boss.rocks;
  BX.boss.rocks = function(e){
    const T = 1.0; let t = T, k = -1, inner = null; const m = circTele();
    starShout(e, '¡ONDA EXPANSIVA!'); play('bruteWarn');
    return {
      upd(dt){
        if (inner) return inner.upd(dt);
        t -= dt; const x = e.g.position.x, z = e.g.position.z, p = 1 - t / T;
        e.arms.forEach(A => { A.rotation.x = lerp(A.rotation.x, -2.9, 1 - Math.exp(-dt * 8)); }); e.torso.rotation.x = -0.25; e.body.position.y = -0.1 * p;
        showCirc(m, x, z, e.r + 0.6 + p * 0.8);
        if ((p * 7 | 0) !== k){ k = p * 7 | 0; gring(x, 0.08, z, 0xff8a3a, 4.2, e.r + 0.3, 0.3); if (k % 2 === 0) play('tick'); }
        if (rnd() < 0.6){ const a = rnd() * TAU; pa(x + Math.cos(a) * 3, 0.15, z + Math.sin(a) * 3, -Math.cos(a) * 7, 0.6, -Math.sin(a) * 7, 0xff9a3a, 0.14, 0.4, 0, 0, 0.3, SH7.sq); }
        if (t <= 0){ m.visible = false; e.body.position.y = 0; inner = rocks0(e); return !inner; }
        return false;
      },
      end(){ scene.remove(m); if (inner && inner.end) inner.end(); }
    };
  };
}

/* ---------- Guardián: patrón fijo, misma pausa y frenesí suave ---------- */
function gu10Pick(e, toP){
  let a = GU10.cyc[e.g10i++ % GU10.cyc.length];
  const others = enemies.filter(o => o.alive && o !== e).length;
  if (a === 'raise' && others >= 3) a = 'jump';
  if (a === 'charge'){ e.chargesLeft = e.p2 ? 1 : 0; e.state = 'windup'; e.t = 1.0; e.dir = toP; play('bruteWarn'); }
  else if (a === 'jump'){ e.state = 'crouch'; e.t = 0.85; play('roar'); }
  else if (a === 'raise'){ e.state = 'raise'; e.t = 0.9; play('roar'); }
  else { const atk = BX.boss[a](e); if (atk){ e.x5 = atk; e.x5last = a; } }
}
function gu10Pre(e, dt, toP){
  e.x5cd = 1e9;
  if (e.fzOn <= 0 && e.fzWarn <= 0 && e.fzT < 1e8) e.fzT = 1e9;
  if (e.x5) return;
  if (e.state === 'chase' && e.bt - dt <= 0){
    if (!player.dead && e.spawnT <= 0 && !invActive && gameState === 'play'){ e.bt = 99; gu10Pick(e, toP); }
    else e.bt = 0.3;
  }
}
function gu10Post(e, pv){
  const st = e.state;
  if (pv !== 'chase' && st === 'chase' && !e.x5) e.bt = e.p2 ? GU10.pause2 : GU10.pause;
  if (pv === 'charge' && st === 'windup') e.t = Math.max(e.t, 0.8);
  if (st === 'crouch'){ const k = Math.floor(e.t * 7); if (k !== e.g10k){ e.g10k = k; gring(e.g.position.x, 0.08, e.g.position.z, 0xff8a3a, 3.2, e.r + 0.2, 0.25); } }
  if (pv === 'crouch' && st === 'air' && e.to){
    const tx = e.to[0], tz = e.to[1], m = circTele(); showCirc(m, tx, tz, e.r + 0.7);
    shout7('¡ONDA!', '#ffb03a', tx, 1.5, tz);
    hzAdd({ t: 0, k: -1, upd(dt){ this.t += dt; pulse(m); const k = Math.floor(this.t * 6);
        if (k !== this.k){ this.k = k; gring(tx, 0.08, tz, 0xff8a3a, e.r + 0.5, 3.6, 0.4); }
        return !e.alive || e.state !== 'air' || this.t > 2; }, end(){ scene.remove(m); } });
  }
}
const _spawnEnemy10 = spawnEnemy;
spawnEnemy = function(type, at){
  const e = _spawnEnemy10(type, at);
  if (isGu10(e) && !e.g10){
    e.g10 = true; e.g10i = 0; e.hp = e.maxHp = Math.round(e.maxHp * GU10.hp);
    e.fzT = 1e9; e.fzOn = 0; e.fzWarn = 0; e.fzMarks = [0.66, 0.33]; e.fzMul = 1.3;
    const u = e.upd || updBrute;
    e.upd = function(q, dt, dist, toP, face, move){ try { gu10Pre(q, dt, toP); } catch (err) { console.error(err); }
      const pv = q.state; u(q, dt, dist, toP, face, move); try { gu10Post(q, pv); } catch (err) { console.error(err); } };
  }
  if (e && e.isBoss) later(1.6, () => { if (e.alive && BOSS_Q10[e.type]) bark(BOSS_Q10[e.type]); });
  else if (e && rnd() < 0.05 && time - P10.spawnT > 7){ P10.spawnT = time; later(0.7, () => { if (!e.alive) return; tA.set(e.g.position.x, (e.numY || 2) + 0.5, e.g.position.z); spawnNumber(tA, pick10(SPAWN_Q10), 'react', '#ffd0e8'); }); }
  return e;
};

/* ---------- Invulnerable en el aire y rodando ---------- */
const AIR_Q10 = ['¡Por los pelos!', '¡Olé!', '¡Ni me rozas!', '¡Hoy no!', '¡Fallaste!', '¡Salto de fe!', '¡Parkour!', '¡Física de dibujos!'];
function airDodge10(){
  if (time - P10.airT < 0.9) return; P10.airT = time;
  shoutHero7(pick10(AIR_Q10), '#dff6ff', 3.0); gring(hero.position.x, hero.position.y + 0.6, hero.position.z, 0xffffff, 0.3, 1.8, 0.25);
  barkOnce('air10', 'Truco: mientras estás en el aire o rodando, nada te toca. Física de dibujos animados, la mejor física.');
}
const _hurtPlayer10 = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){
  if (gameState === 'play' && !invActive && !MG.active && !player.dead){
    if (state !== 'roll' && !grounded && hero.position.y > 0.05){ airDodge10(); return 'dodge'; }
    if (state === 'roll' && !(rollT > 0.02 && rollT < 0.46)){ const r0 = rollT; rollT = 0.3; let res; try { res = _hurtPlayer10(dmg, sx, sz, knock); } finally { rollT = r0; } return res; }
  }
  return _hurtPlayer10(dmg, sx, sz, knock);
};

/* ---------- Linterna vampírica: cura bastante más ---------- */
{ const u = UPGRADES.find(x => x.id === 'life');
  if (u){ u.desc = 'Cada golpe te roba 3,5 PV por nivel: la sangre vuela hasta tu linterna. Tope: un 10 % de tu vida por segundo (+3 % por nivel).'; u.apply = () => { P6.ls += 3.5; }; } }
{ const u = UPGRADES.find(x => x.id === 'feast'); if (u) u.desc = 'Cada enemigo derrotado te cura 5 PV y carga la barra ÍMP.'; }

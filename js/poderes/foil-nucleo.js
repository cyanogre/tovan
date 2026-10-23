'use strict';
/* ======================================================================
   PODERES FOIL · NÚCLEO DE LOS NUEVOS
   Los foil de foil.js (agua, mil pájaros, puño de fuego) van a mano; los
   nuevos se registran con foilPoder(def) y este núcleo les da:
   - Ganchos (todos opcionales en def): golpe(f, idx, fin) en cada golpe
     normal y remate(f) en el último del combo (f = rumbo, en el momento del
     impacto); rodar() / saltar() / especial() (devuelven true si se comen
     la acción; especial solo con el ímpetu lleno, y lo gasta); tick(dt,
     jugando) cada fotograma; herido(dmg, sx, sz, knock) (devuelve 'none'
     para anular el golpe); dano(e, val, o) (devuelve el daño nuevo);
     mata(e); oleada(n); pose() (después de la animación de Tovan);
     post() (justo antes de pintar: ya están puestas la cara y la altura);
     limpia() (al cambiar de escenario, morir, volver al título…); reset()
     (al empezar partida) y coge() (al elegir la carta).
   - Formas (transformaciones y monturas, una a la vez): foilForma({ id, nom,
     col, dur, … }) con tick, ataque (sustituye al J), rodar, saltar,
     especial, golpe/remate, pose, intocable, velK (velocidad), danoK (daño),
     camK (distancia de cámara), escala (de Tovan), alto (sube a Tovan,
     para montarse), contacto { r, dmg, cd, knock, el } (atropella) y
     fin(motivo). Se acaban solas al pasar dur, al morir o al entrar en un
     escenario propio (colosal, TOVAN.EXE, el show, el Canal X…).
   - Rótulos grandes (foilRotulo), marcadores en la columna de la derecha
     (foilMarcador) y foilVel(id, k) para cambiar la velocidad sin forma.
   - El reparto: la pantalla foil ofrece 3 al azar de las que no tengas.
   ====================================================================== */
const FOILP = [];
const FOILX = { forma: null, camK: 1, esc: 1, escBase: 1, espec: 0, vel: {}, yb: null, altoPuesto: 0 };
function foilPoder(def){
  FOILP.push(def); FOIL_IDS.push(def.id);
  UPGRADES.push({ id: def.id, r: 'foil', tags: def.tags || ['otaku'], ic: def.ic, name: def.name, max: 1, req: () => FOIL.premio, desc: def.desc,
    apply: () => { try { if (def.coge) def.coge(); } catch (err) { console.error(def.id, err); } } });
  return def;
}
const foilVivos = () => FOILP.filter(d => lvl(d.id));
function foilTodos(fn, ...a){ for (const d of FOILP) if (d[fn] && lvl(d.id)){ try { d[fn](...a); } catch (err) { console.error(d.id, fn, err); } } }
function foilPrimero(fn, ...a){ for (const d of FOILP) if (d[fn] && lvl(d.id)){ try { const r = d[fn](...a); if (r) return r; } catch (err) { console.error(d.id, fn, err); } } return null; }
// para probar: foilDa('foilTitan')
function foilDa(id){ const u = UPGRADES.find(x => x.id === id); if (!u) return false; taken[id] = 1; u.apply(); try { recountTags(); } catch (err) {} return true; }
const foilPuede = () => gameState === 'play' && !player.dead && !invActive && !cs.active && !lcut;
// escenarios propios, donde no caben transformaciones ni monturas
const foilEscenario = () => !COL.montado && !TER.montado && !SH3.montado && !MG.active && !chActive && !special && !(typeof ENG !== 'undefined' && ENG.montado);
const foilEnemigos = (O, R) => enemies.filter(e => e.alive && e.spawnT <= 0 && e.reach !== false && Math.hypot(e.g.position.x - O.x, e.g.position.z - O.z) - e.r < R);
const foilJefe = e => !!(e && (e.isBoss || e.elite || e.colEscama));

/* ---------- Capa de rótulos y columna de marcadores ---------- */
const foilCapaEl = document.createElement('div'); foilCapaEl.id = 'foilCapa'; document.body.appendChild(foilCapaEl);
const foilColEl = document.createElement('div'); foilColEl.id = 'foilCol'; document.body.appendChild(foilColEl);
// rótulo a pantalla: html con la clase de cada poder (su estilo en su CSS); se quita solo a los dur segundos
function foilRotulo(html, clase, dur = 1.6){
  const el = document.createElement('div'); el.className = 'foilRot ' + (clase || ''); el.innerHTML = html; foilCapaEl.appendChild(el);
  el.style.setProperty('--dur', dur + 's'); setTimeout(() => el.remove(), dur * 1000); return el;
}
// marcador fijo (contadores, medidores…): uno por id, en la columna de la derecha
function foilMarcador(id, clase){
  let el = document.getElementById('foilM-' + id);
  if (!el){ el = document.createElement('div'); el.id = 'foilM-' + id; el.className = 'foilMarca ' + (clase || ''); foilColEl.appendChild(el); }
  return el;
}
function foilVel(id, k){ if (k === 1 || k == null) delete FOILX.vel[id]; else FOILX.vel[id] = k; }

/* ---------- Formas: transformaciones y monturas ---------- */
const foilFormaEl = document.createElement('div'); foilFormaEl.id = 'foilForma'; foilFormaEl.hidden = true; foilFormaEl.innerHTML = '<b></b><i><u></u></i>'; document.body.appendChild(foilFormaEl);
function foilForma(o){
  if (FOILX.forma || !foilPuede() || !foilEscenario()) return null;
  const F = Object.assign({ t: 0, toques: new Map() }, o); FOILX.forma = F; FOILX.escBase = hero.scale.x / FOILX.esc;
  foilFormaEl.hidden = !F.nom; if (F.nom){ foilFormaEl.querySelector('b').textContent = F.nom; foilFormaEl.style.setProperty('--c', F.col || '#ffd23a'); }
  try { if (F.empieza) F.empieza(); } catch (err) { console.error(F.id, err); }
  return F;
}
function foilFormaAcaba(motivo = 'fin'){
  const F = FOILX.forma; if (!F) return; FOILX.forma = null; foilFormaEl.hidden = true;
  try { if (F.fin) F.fin(motivo); } catch (err) { console.error(F.id, err); }
}
const foilEn = id => !!(FOILX.forma && FOILX.forma.id === id);
function foilFormaTick(dt){
  const F = FOILX.forma; if (!F) return;
  if (player.dead || !foilEscenario() || (gameState !== 'play' && gameState !== 'paused' && gameState !== 'upgrade' && gameState !== 'cutscene')){ foilFormaAcaba(player.dead ? 'muerte' : 'escenario'); return; }
  if (dt <= 0) return;
  F.t += dt; try { if (F.tick) F.tick(dt); } catch (err) { console.error(F.id, err); }
  if (FOILX.forma !== F) return;
  if (F.dur){ foilFormaEl.style.setProperty('--k', Math.max(0, 1 - F.t / F.dur).toFixed(3)); if (F.t >= F.dur){ foilFormaAcaba('tiempo'); return; } }
  if (F.contacto){ const C = F.contacto, O = hero.position;
    for (const e of foilEnemigos(O, C.r)){ const u = F.toques.get(e) || 0; if (time - u < (C.cd || 0.5)) continue; F.toques.set(e, time);
      const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.01, Math.hypot(dx, dz));
      foilGolpea(e, typeof C.dmg === 'function' ? C.dmg(e) : rdmg(C.dmg), dx / d, dz / d, C.knock || 4, C.el || null, C.power || 1);
      if (C.al) try { C.al(e); } catch (err) { console.error(err); } } }
}
// después de la animación de Tovan (csCamera va justo antes de pintar): altura de la montura, escala y cámara
function foilPost(cam){
  const F = FOILX.forma, alto = F && F.alto || 0;
  if (FOILX.altoPuesto && P.body.position.y === FOILX.yb) P.body.position.y -= FOILX.altoPuesto;   // (en la voltereta main.js no la recoloca)
  P.body.position.y += alto; FOILX.altoPuesto = alto; FOILX.yb = P.body.position.y;
  const esc = F && F.escala || 1, k = 1 - Math.exp(-Math.min(0.1, dtCam()) * 4);
  if (Math.abs(FOILX.esc - esc) > 0.002 || FOILX.esc !== 1){ FOILX.esc += (esc - FOILX.esc) * k; if (Math.abs(FOILX.esc - esc) < 0.003) FOILX.esc = esc; hero.scale.setScalar(FOILX.escBase * FOILX.esc); }
  if (F && F.postPose) try { F.postPose(); } catch (err) { console.error(F.id, err); }
  foilTodos('post');
  FOILX.camK += ((F && F.camK || 1) - FOILX.camK) * k;
  if (!cs.active && !lcut && Math.abs(FOILX.camK - 1) > 0.002 && foilEscenario()) cam.position.sub(camTarget).multiplyScalar(FOILX.camK).add(camTarget);
}
let _dtCamT = null;
function dtCam(){ const d = _dtCamT == null ? 0 : clamp(time - _dtCamT, 0, 0.1); _dtCamT = time; return d; }

/* ---------- Ganchos ---------- */
const _startMoveFX = startMove;
startMove = function(name, idx){
  _startMoveFX(name, idx);
  try {
    const F = FOILX.forma; if (!foilPuede() || (!F && !FOILP.some(d => lvl(d.id)))) return;
    const mv = MV[name]; if (!mv || name === 'special' || mv.special || mv.dive || idx >= 96) return;
    const seq = weaponSeq(), fin = seq.length > 1 && idx === seq.length - 1, f = heading, dl = Math.max(0.05, (mv.dur || 0.42) * (mv.hit || 0.5) * 0.8);
    later(dl, () => { if (!foilPuede()) return; const G = FOILX.forma;
      if (G){ try { if (fin && G.remate) G.remate(f); else if (G.golpe) G.golpe(f, idx, fin); } catch (err) { console.error(G.id, err); } if (G.soloForma) return; }
      for (const d of foilVivos()){ try { if (fin && d.remate) d.remate(f); else if (d.golpe) d.golpe(f, idx, fin); } catch (err) { console.error(d.id, err); } } });
  } catch (err) { console.error(err); }
};
const _doAttackFX = doAttack;
doAttack = function(){ const F = FOILX.forma; if (F && F.ataque && canAct() && !invActive){ try { F.ataque(); } catch (err) { console.error(F.id, err); } return; } _doAttackFX(); };
const _doRollFX = doRoll;
doRoll = function(){
  if (canAct() && !invActive && foilPuede()){ const F = FOILX.forma;
    if (F && F.rodar){ try { if (F.rodar()) return; } catch (err) { console.error(F.id, err); } }
    if (foilPrimero('rodar')) return; }
  _doRollFX();
};
const _doJumpFX = doJump;
doJump = function(){
  if (canAct() && !invActive && foilPuede()){ const F = FOILX.forma;
    if (F && F.saltar){ try { if (F.saltar()) return; } catch (err) { console.error(F.id, err); } }
    if (foilPrimero('saltar')) return; }
  _doJumpFX();
};
const _doSpecialFX = doSpecial;
doSpecial = function(){
  if (canAct() && !invActive && foilPuede() && player.meter >= 100 && state !== 'roll' && state !== 'tech' && timeStopT <= 0){
    const F = FOILX.forma;
    if (F && F.especial){ try { if (F.especial()){ player.meter = 0; return; } } catch (err) { console.error(F.id, err); } }
    const L = foilVivos().filter(d => d.especial);
    for (let i = 0; i < L.length; i++){ const d = L[(FOILX.espec + i) % L.length]; let ok = false; try { ok = d.especial(); } catch (err) { console.error(d.id, err); }
      if (ok){ FOILX.espec = (FOILX.espec + i + 1) % L.length; player.meter = 0; return; } }   // (con varios, se van turnando)
  }
  _doSpecialFX();
};
const _hurtPlayerFX = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){
  if (!player.dead && gameState === 'play'){
    const F = FOILX.forma; if (F && F.intocable) return 'none';
    if (F && F.herido){ let r = null; try { r = F.herido(dmg, sx, sz, knock); } catch (err) { console.error(F.id, err); } if (r === 'none') return 'none'; }
    if (foilPrimero('herido', dmg, sx, sz, knock) === 'none') return 'none';
  }
  return _hurtPlayerFX(dmg, sx, sz, knock);
};
const _hitEnemyFX = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee, o){
  try { const F = FOILX.forma; if (F && F.danoK) val = Math.round(val * F.danoK);
    for (const d of FOILP) if (d.dano && lvl(d.id)){ const v = d.dano(e, val, o, crit, melee); if (typeof v === 'number' && isFinite(v)) val = Math.round(v); } } catch (err) { console.error(err); }
  return _hitEnemyFX(e, val, crit, nx, nz, knock, meterGain, melee, o);
};
const _killEnemyFX = killEnemy;
killEnemy = function(e){ const vivo = e.alive; _killEnemyFX(e); if (vivo && !e.alive && !e.colFase && !e.terFase && gameState === 'play'){ const F = FOILX.forma; if (F && F.mata) try { F.mata(e); } catch (err) { console.error(err); } foilTodos('mata', e); } };
const _startWaveFX = startWave;
startWave = function(n){ _startWaveFX(n); foilTodos('oleada', n); };
const _cosSpdFX = cosSpd;
cosSpd = function(){ let k = _cosSpdFX() * (FOILX.forma && FOILX.forma.velK || 1); for (const v of Object.values(FOILX.vel)) k *= v; return k; };
const _legendPoseFX = legendPose;
legendPose = function(){ _legendPoseFX(); const F = FOILX.forma; if (F && F.pose) try { F.pose(); } catch (err) { console.error(F.id, err); } foilTodos('pose'); };
const _csCameraFX = csCamera;
csCamera = function(cam){ _csCameraFX(cam); try { foilPost(cam); } catch (err) { console.error(err); } };
const _v3UpdateFX = v3Update;
v3Update = function(dt, pdt, playing){
  _v3UpdateFX(dt, pdt, playing);
  if (!foilFormaEl.hidden){   // el nombre de la forma, bajo la barra del jefe si la hay (en el móvil la tapaba)
    const r = bossBox.hidden ? null : bossBox.getBoundingClientRect(), top = r && r.height && r.top < innerHeight * 0.3 ? Math.round(r.bottom + 6) + 'px' : '';
    if (foilFormaEl.style.top !== top) foilFormaEl.style.top = top; }
  document.body.classList.toggle('foilFuera', gameState === 'title' || gameState === 'over' || player.dead);   // marcadores solo en partida
  try { const d = playing ? pdt : 0; for (const p of FOILP) if (p.tick && lvl(p.id)){ try { p.tick(d, playing); } catch (err) { console.error(p.id, err); } } foilFormaTick(d); } catch (err) { console.error(err); }
};
function foilLimpia(motivo){ foilFormaAcaba(motivo); for (const d of FOILP) if (d.limpia){ try { d.limpia(motivo); } catch (err) { console.error(d.id, err); } } foilCapaEl.textContent = ''; }
const _clearWorldFX = clearWorld;
clearWorld = function(){ foilLimpia('mundo'); _clearWorldFX(); };
const _toTitleFX = toTitle;
toTitle = function(){ foilLimpia('titulo'); _toTitleFX(); };
const _limpiaEfectosFX = limpiaEfectos;
limpiaEfectos = function(){ _limpiaEfectosFX(); foilLimpia('escenario'); };
const _startRunFX = startRun;
startRun = function(){ foilLimpia('partida'); FOILX.vel = {}; FOILX.espec = 0; foilColEl.textContent = ''; for (const d of FOILP) if (d.reset){ try { d.reset(); } catch (err) { console.error(d.id, err); } } _startRunFX(); };

/* ---------- El reparto: 3 foil al azar (no siempre los mismos) ---------- */
const _dealCardsFX = dealCards;
dealCards = function(){
  _dealCardsFX();
  if (!FOIL.premio || offer.length <= 3) return;
  const L = offer.slice(); for (let i = L.length - 1; i > 0; i--){ const j = Math.floor(rnd() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; }
  offer = L.slice(0, 3); try { renderCards10(); } catch (err) { console.error(err); } foilDecora();
};

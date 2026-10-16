'use strict';
/* ======================================================================
   DIFICULTAD (ajustes de 2026-10): el juego se había quedado blando
   · Los enemigos pegan un 30 % más y piensan un 10 % más rápido; los
     jefes, un 22 % más rápido (amagos más cortos, menos tiempo para
     esquivar). No hay más enemigos por oleada.
   · ESCUDO DE JEFE (como los de The Binding of Isaac): cada jefe sale con
     un escudo azul que se come casi todo el daño (pasa un 25 %). Al
     romperlo, el jefe se queda aturdido un momento y durante 5 s le dueles
     más; luego, a los 6 s, el escudo se recarga. La barra va bajo la vida.
   · Brazos de goma: con tantas cartas nuevas casi no salía; ahora tiene el
     peso de una común y suele salir en los dos primeros repartos.
   Las mejoras del santuario (vida, fuerza…) son las que lo compensan:
   cuesta sobre todo al principio.
   ====================================================================== */
const DIF = { danoEnemigo: 1.3, velNormal: 1.1, velJefe: 1.22, escudo: 0.13, escPasa: 0.25, vulnT: 5, vulnMul: 1.35, esperaT: 6, recargaT: 1.6, aturde: 1.1, repartos: 0 };
const ESC_TIPOS = new Set(['boss', 'dragon', 'skeleton', 'star', 'teapot', 'error', 'sixeyes', 'finalcat']);
const ESC_SIN_BURBUJA = new Set(['dragon', 'skeleton', 'finalcat']);   // los alargados o enormes: solo chispas y barra

/* ---------- Enemigos: más daño y más rápidos ---------- */
const _bossFrenzyDif = bossFrenzy;
bossFrenzy = function(e, dt){ return _bossFrenzyDif(e, dt) * (e.colEscama ? 1 : e.isBoss ? DIF.velJefe : DIF.velNormal); };

/* ---------- Escudo de jefe ---------- */
const escBurbujaGeo = new THREE.IcosahedronGeometry(1, 1);
const escMat = makeMat(0x7fe8ff, { emissive: 1, opacity: 0.1, side: THREE.DoubleSide }), escMalla = new THREE.MeshBasicMaterial({ color: 0x9ff4ff, wireframe: true, transparent: true, opacity: 0.25, depthWrite: false });
const escBarEl = document.createElement('div'); escBarEl.id = 'bossEsc'; escBarEl.hidden = true; escBarEl.innerHTML = '<span class="et">Escudo</span><div class="eb"><i></i></div>';
document.querySelector('#bossBox .bar.boss').after(escBarEl);
const escFill = escBarEl.querySelector('i');
Object.assign(SFX, {
  escTin: () => { tone({ type: 'triangle', f0: 1700, f1: 1300, dur: 0.09, vol: 0.06, rv: 0.25 }); },
  escRoto: () => { noise({ dur: 0.5, vol: 0.3, f0: 6500, f1: 1200, type: 'highpass', q: 0.7, rv: 0.4 }); tone({ type: 'triangle', f0: 1900, f1: 300, dur: 0.6, vol: 0.16, rv: 0.4 }); tone({ type: 'square', f0: 220, f1: 110, dur: 0.3, vol: 0.08 }); },
  escCarga: () => { tone({ type: 'sine', f0: 300, f1: 1400, dur: 1.4, vol: 0.08, attack: 0.3, rv: 0.4 }); }
});
function escPone(e){
  const E = e.escJ = { max: Math.max(1, Math.round(e.maxHp * DIF.escudo)), v: 0, est: 'arriba', t: 0, golpe: 0, tin: 0 };
  E.v = E.max;
  if (!ESC_SIN_BURBUJA.has(e.type)){ const g = new THREE.Group(); scene.add(g); mesh(escBurbujaGeo, escMat, 0, 0, 0, g); mesh(escBurbujaGeo, escMalla, 0, 0, 0, g).scale.setScalar(1.01); E.burbuja = g; }
}
function escQuita(e){ if (e.escJ && e.escJ.burbuja){ scene.remove(e.escJ.burbuja); e.escJ.burbuja = null; } }
function escRompe(e, x, y, z){
  const E = e.escJ; E.est = 'roto'; E.t = DIF.vulnT; E.v = 0; e.escAturde = DIF.aturde;
  play('escRoto'); shake = Math.max(shake, 0.5); flash('#bff6ff', 0.35); hitStop = Math.max(hitStop, 0.1);
  ringFx(e.g.position.x, e.g.position.z, 0x9ff4ff, 0.4, 3.2 * (e.scale || 1), 0.45);
  for (let i = 0; i < 26; i++){ const a = rnd() * TAU, s = 3 + rnd() * 4; spawnFx(x, y, z, Math.cos(a) * s, 1 + rnd() * 5, Math.sin(a) * s, rnd() < 0.5 ? 0x9ff4ff : 0xffffff, 0.12, 0.7, 9, 0); }
  tA.set(x, y + 1, z); spawnNumber(tA, '¡Escudo roto!', 'react', '#9ff4ff');
  if (E.burbuja) E.burbuja.visible = false;
  barkOnce('escRoto', '¡Le has roto el escudo! Ahora, todo lo que tengas: le duele más… durante poco.');
}
const _hitEnemyDif = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee = false, o = {}){
  const E = e && e.escJ;
  if (E && e.alive && e.spawnT <= 0 && val > 0 && timeStopT <= 0){
    const src = (o && o.src) || (melee ? 'melee' : 'other'), x = e.g.position.x - (nx || 0) * e.r * 0.8, y = (e.numY || 1.5) * 0.55, z = e.g.position.z - (nz || 0) * e.r * 0.8;
    if (E.est === 'arriba'){
      E.v -= val * (src === 'dot' ? 0.5 : 1); E.golpe = 0.15;
      val = Math.max(1, Math.round(val * DIF.escPasa));
      if (src !== 'dot'){ for (let i = 0; i < 4; i++){ const a = rnd() * TAU; spawnFx(x, y, z, Math.cos(a) * 2, 1 + rnd() * 2, Math.sin(a) * 2, 0x9ff4ff, 0.07, 0.3, 4, 0); }
        if (E.tin <= 0){ E.tin = 0.07; play('escTin'); } }
      if (E.v <= 0) escRompe(e, x, y, z);
      barkOnce('escudo', 'Ese brillo azul es un escudo: se come casi todo. Rómpelo a golpes y luego, a por él.');
    } else if (E.est === 'roto') val = Math.round(val * DIF.vulnMul);
  }
  return _hitEnemyDif(e, val, crit, nx, nz, knock, meterGain, melee, o);
};
// aturdido al romperse el escudo: no piensa ni se mueve
const _updateEnemyDif = updateEnemy;
updateEnemy = function(e, dt){
  if (e.escAturde > 0 && e.alive && e.dying <= 0){ e.escAturde -= dt; e.flash = Math.max(e.flash, Math.sin(time * 30) > 0 ? 0.05 : 0); applyFlash(e); if (e.tele) e.tele.visible = false; return; }
  _updateEnemyDif(e, dt);
};
function escTick(dt, playing){
  let jefe = null;
  for (const e of enemies){
    if (!e.difOk && e.alive){ e.difOk = true; e.dm = (e.dm || 1) * DIF.danoEnemigo; }
    if (!e.escJ && e.alive && e.isBoss && ESC_TIPOS.has(e.type) && e.spawnT <= 0) escPone(e);
    const E = e.escJ; if (!E) continue;
    if (!e.alive){ escQuita(e); continue; }
    if (!jefe && e === bossE) jefe = e;
    if (playing){
      E.golpe = Math.max(0, E.golpe - dt); E.tin -= dt; E.t -= dt;
      if (E.est === 'roto' && E.t <= 0){ E.est = 'espera'; E.t = DIF.esperaT; }
      else if (E.est === 'espera' && E.t <= 0){ E.est = 'recarga'; E.t = DIF.recargaT; play('escCarga'); }
      else if (E.est === 'recarga'){ E.v = E.max * (1 - Math.max(0, E.t) / DIF.recargaT); if (E.t <= 0){ E.est = 'arriba'; E.v = E.max; if (E.burbuja) E.burbuja.visible = true; ringFx(e.g.position.x, e.g.position.z, 0x7fe8ff, 3, 0.8, 0.4); } }
    }
    if (E.burbuja){ const R = Math.max(0.95, e.r * 1.3 + 0.25);
      E.burbuja.position.set(e.g.position.x, e.g.position.y + (e.numY || 2) * 0.5, e.g.position.z); E.burbuja.scale.set(R, Math.max(R, (e.numY || 2) * 0.58), R);
      E.burbuja.visible = (E.est === 'arriba' || E.est === 'recarga') && e.g.visible !== false && e.spawnT <= 0;
      const k = E.est === 'recarga' ? 1 - Math.max(0, E.t) / DIF.recargaT : 1;
      E.burbuja.rotation.y += dt * 0.6; escMat.uniforms.uOpacity.value = (0.05 + E.golpe * 2) * k + 0.03; escMalla.opacity = (0.18 + E.golpe * 3) * k; }
  }
  // barra bajo la vida del jefe
  const E = jefe && jefe.escJ; escBarEl.hidden = !E || bossBox.hidden;
  if (E){ escFill.style.width = (E.est === 'roto' || E.est === 'espera' ? 0 : Math.max(0, E.v / E.max) * 100) + '%';
    escBarEl.dataset.est = E.est; escBarEl.querySelector('.et').textContent = E.est === 'roto' ? '¡Escudo roto! · Le duele más' : E.est === 'espera' ? 'Escudo · se recarga pronto' : E.est === 'recarga' ? 'Escudo · recargando' : 'Escudo'; }
}
const _v3UpdateDif = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateDif(dt, pdt, playing); try { escTick(pdt, playing); } catch (err) { console.error(err); } };
const _clearWorldDif = clearWorld;
clearWorld = function(){ for (const e of enemies) escQuita(e); escBarEl.hidden = true; _clearWorldDif(); };

/* ---------- Reparto: los Brazos de goma vuelven a salir pronto ---------- */
{ const g = UPGRADES.find(u => u.id === 'gomu'); if (g) g.r = 'comun'; }
const _dealCardsDif = dealCards;
dealCards = function(){
  _dealCardsDif();
  if (FOIL.premio) return;
  DIF.repartos++;
  const g = UPGRADES.find(u => u.id === 'gomu');
  if (!g || offer.includes(g) || (taken.gomu || 0) >= g.max || !pwOn('gomu') || (g.req && !g.req())) return;
  if (rnd() >= (DIF.repartos === 1 ? 0.6 : DIF.repartos === 2 ? 0.4 : 0)) return;
  let k = offer.length - 1; while (k > 0 && (offer[k].r === 'leyenda' || offer[k].branch || offer[k].w)) k--;
  offer[k] = g;
  try { renderCards10(); foilDecora(); valCabecera(); } catch (err) { console.error(err); }
};
const _startRunDif = startRun;
startRun = function(){ DIF.repartos = 0; _startRunDif(); };

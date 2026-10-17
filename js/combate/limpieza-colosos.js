'use strict';
/* ======================================================================
   LIMPIEZA AL CAMBIAR DE ESCENARIO (Ryūjin colosal y TOVAN.EXE)
   Al montar o desmontar su escenario propio (en mitad de la cinemática,
   tras el fogonazo), se quitan los efectos que había en pantalla: agujeros
   negros, técnicas foil y otaku (la respiración del agua, el kamehameha…),
   aliados y bichos de los poderes, cráteres, peligros de los jefes,
   proyectiles, partículas, anillos, rayos y números de daño. Antes se
   quedaban flotando en el cielo o en el vacío. La partida no se toca (vida,
   cartas, orbitales, enemigos y recogidas los gestiona cada jefe). Además,
   la barrera de la plaza de los mapas grandes (el aro dorado) no sale en
   esos escenarios. También se usa al entrar en el plató del show.
   ====================================================================== */
function limpiaEfectos(){
  const f_ = (nombre, fn) => { try { fn(); } catch (err) { console.error(nombre, err); } };
  f_('peligros', () => sweepHazards());   // (con sus ganchos: avisos, anillos, bolas de fuego, peligros de los jefes y los efectos de los poderes que van por hzFx)
  f_('proyectiles', () => { for (const p of projectiles) scene.remove(p.m); projectiles.length = 0; for (const f of flames) scene.remove(f.m); flames.length = 0; });
  f_('poderes', () => { clearP5(); clearA6(); clearExtras(); clearW5(); });
  f_('golpes', () => { clearObjs7(); clearPts7(PA7); clearPts7(PN7); for (const L of [GR7, OCT7, SK7, CR7]) for (const m of L) m.visible = false;
    E7.wigT = E7.kamPose = E7.clapT = E7.swT = E7.btT = 0; E7.anchors = null; wires7.forEach(w => { w.visible = false; }); bars7.classList.remove('on');
    gpsBeam7.visible = false; ret7.visible = false; laser7.visible = false; sigRings7.forEach(r => { r.visible = false; }); });
  f_('foil', () => { for (const f of foilFx){ for (const c of f.cintas || []) tintaSuelta(c); if (f.fin) f.fin(); } foilFx.length = 0; FOIL.dragon = null; FOIL.fluir = null; });
  f_('nuca', () => { if (NUCA.m) nucaAcaba(NUCA.m); });
  f_('tecnicas', () => { if (tech) cancelTech(); kameOrb.visible = false; beamG.visible = false; genkiBall.visible = false; beamPool.forEach(b => { b.g.visible = false; }); });
  f_('cintas', () => { for (const c of tintaPool) if (c.usada) tintaSuelta(c); });
  f_('particulas', () => { for (const m of fxPool){ m.visible = false; m.userData.life = 0; } for (const m of vRings) m.visible = false; for (const b of bolts) b.m.visible = false; });
  f_('numeros', () => { for (const n of nums) n.el.remove(); nums.length = 0; });
  f_('camion', () => { truckRun = null; hideTrucks(); });
  f_('aro', () => { mpAro.visible = false; });
}
const _colMontaL = colMonta; colMonta = function(){ if (!COL.montado) limpiaEfectos(); _colMontaL(); };
const _colDesmontaL = colDesmonta; colDesmonta = function(){ if (COL.montado) limpiaEfectos(); _colDesmontaL(); };
const _terMontaL = terMonta; terMonta = function(){ if (!TER.montado) limpiaEfectos(); _terMontaL(); };
const _terDesmontaL = terDesmonta; terDesmonta = function(){ if (TER.montado) limpiaEfectos(); _terDesmontaL(); };
const _sh3MontaL = sh3Monta; sh3Monta = function(){ if (!SH3.montado) limpiaEfectos(); _sh3MontaL(); };
const _mpAroTickL = mpAroTick; mpAroTick = function(){ _mpAroTickL(); if (COL.montado || TER.montado || SH3.montado) mpAro.visible = false; };

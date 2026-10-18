'use strict';
/* ======================================================================
   ENCUADRE DE LOS JEFES ALTOS
   Con la cámara de siempre, a un jefe alto (el gato del final, el
   Gashadokuro…) se le salía la cabeza por arriba y quedaba debajo de su
   propia barra de vida, sobre todo con el móvil en horizontal (poca
   altura). Si la cabeza del jefe queda por encima del borde de abajo de la
   barra, la cámara se aleja un poco, se pone algo más baja y mira más
   arriba, poco a poco, hasta que se le ve la cara; cuando deja de hacer
   falta, vuelve sola. No toca las cinemáticas ni los escenarios con cámara
   propia (colosal, TOVAN.EXE, el show, el Canal X).
   ====================================================================== */
const ENC = { k: 0, lim: 1, limT: 0, t: null, alto: 3 };
const _encV = new V3(), _encT = new V3(), _encO = new V3(), _encB = new THREE.Box3();
function encuadrePuede(e){ return !!(e && e.alive && e.g && e.numY > 2.2 && gameState === 'play' && !cs.active && !lcut && !COL.montado && !TER.montado && !SH3.montado && !MG.active && !chActive); }
function encuadreJefe(cam){
  const dt = ENC.t == null ? 0 : clamp(time - ENC.t, 0, 0.1); ENC.t = time;
  const e = bossE, puede = encuadrePuede(e);
  if (!puede && ENC.k <= 0) return;
  if ((ENC.limT -= dt) <= 0){ ENC.limT = 0.3;   // el borde de abajo de la barra, en coordenadas de pantalla (-1 abajo, 1 arriba)
    const r = bossBox.hidden ? null : bossBox.getBoundingClientRect(); ENC.lim = r && r.height ? 1 - 2 * (r.bottom + 10) / innerHeight : 0.92;
    if (puede){ _encB.setFromObject(e.g); ENC.alto = isFinite(_encB.max.y) ? Math.max(e.numY * 0.88, _encB.max.y - 0.35) : e.numY * 0.88; } }   // (la cabeza de verdad: hay jefes que se ponen de pie)
  // la corrección de ahora: más lejos, más baja y mirando más arriba
  const k = smooth(ENC.k), alto = ENC.alto;
  if (k > 0.001){
    _encO.subVectors(cam.position, camTarget); _encO.y *= 1 - 0.6 * k; _encO.multiplyScalar(1 + 0.6 * k);
    _encT.copy(camTarget); _encT.y += k * Math.min(4.2, alto * 0.55);
    cam.position.copy(_encT).add(_encO); cam.lookAt(_encT); cam.updateMatrixWorld();
  }
  if (!puede){ ENC.k = Math.max(0, ENC.k - dt * 0.8); return; }
  // ¿se le ve la cabeza? (solo si está delante: si no lo miras, no hace falta)
  _encV.set(e.g.position.x, alto, e.g.position.z).project(cam);
  const delante = _encV.z < 1 && Math.abs(_encV.x) < 1.15;
  if (delante && _encV.y > ENC.lim - 0.06) ENC.k = Math.min(1, ENC.k + dt * 1.3);
  else if (!delante || _encV.y < ENC.lim - 0.3) ENC.k = Math.max(0, ENC.k - dt * 0.6);
}
const _csCameraEnc = csCamera;
csCamera = function(cam){ _csCameraEnc(cam); try { encuadreJefe(cam); } catch (err) { console.error(err); } };

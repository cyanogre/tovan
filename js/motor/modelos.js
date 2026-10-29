'use strict';
/* ======================================================================
   MODELOS DE KILN (js/generado/modelos.js, que escribe herramientas/modelos.py)
   modeloAsset(nombre, o) devuelve un THREE.Group con una malla por material,
   pintada con el shader PS1 del juego (makeMat) en vez de los materiales PBR
   del GLB. La geometría se crea una vez por modelo y se comparte entre
   copias; los materiales también, salvo con { propios: true } (para
   cambiarles el color o la opacidad a una copia sin tocar las demás).
   o: { escala, emissive (extra para todos), propios, padre }.
   modeloExiste(nombre) dice si está empaquetado.
   ====================================================================== */
const MODELO_CACHE = {};
const modeloExiste = n => typeof MODELOS !== 'undefined' && !!MODELOS[n];
function modeloB64(s, Tipo){ const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return new Tipo(u.buffer); }
function modeloDatos(n){
  if (MODELO_CACHE[n]) return MODELO_CACHE[n];
  if (!modeloExiste(n)){ console.warn('modelo sin empaquetar:', n); return null; }
  return (MODELO_CACHE[n] = MODELOS[n].map(([col, em, pos, nor]) => {
    const g = new THREE.BufferGeometry(), p = modeloB64(pos, Float32Array), q = modeloB64(nor, Int8Array);
    g.setAttribute('position', new THREE.BufferAttribute(p, 3)); g.setAttribute('normal', new THREE.BufferAttribute(q, 3, true)); g.computeBoundingSphere();
    return { g, col, em, mat: null };
  }));
}
function modeloAsset(n, o = {}){
  const grupo = new THREE.Group(), datos = modeloDatos(n); if (!datos) return grupo;
  for (const d of datos){
    const opc = { emissive: Math.min(1, (d.em ? 0.9 : 0) + (o.emissive || 0)) };
    const mat = o.propios ? makeMat(d.em || d.col, opc) : (d.mat = d.mat || makeMat(d.em || d.col, opc));
    grupo.add(new THREE.Mesh(d.g, mat));
  }
  if (o.escala) grupo.scale.setScalar(o.escala);
  if (o.padre) o.padre.add(grupo);
  return grupo;
}

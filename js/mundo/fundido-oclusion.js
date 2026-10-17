'use strict';
/* ======================================================================
   FUNDIDO DE LO QUE SE QUITA DE EN MEDIO
   Lo que tapa la cámara se esconde para no molestar, pero antes lo hacía
   de golpe (visible = false) y quedaba raro. Ahora se desvanece y vuelve
   a aparecer poco a poco:
   - mapas grandes: árboles, muros y columnas entre la cámara y Tovan (mpOcluye);
   - Ryūjin colosal: los anillos del cuerpo y la cabeza cuando la cámara se mete
     dentro (colCamara) y la columna de luz de los sellos al acercarte (colTick).
   Cada uno decide igual que antes si debe verse; aquí solo se cambia el cómo.
   La transparencia es la de trama del shader (uOpacity, sin ordenar): cada malla
   que se funde usa una copia de su material con su propio uOpacity (los demás
   uniformes, compartidos) y, al volver del todo, recupera el suyo.
   ====================================================================== */
const FUNDE_SALE = 0.22, FUNDE_ENTRA = 0.35;   // segundos en desvanecerse y en volver
const FUNDE = { mapa: new Set(), t: {} };
function fundeDt(clave){ const a = FUNDE.t[clave], d = a == null ? 0 : clamp(time - a, 0, 0.1); FUNDE.t[clave] = time; return d; }
function fundeCopia(m){
  const c = new THREE.ShaderMaterial({ uniforms: Object.assign({}, m.uniforms, { uOpacity: { value: 1 } }), vertexShader: m.vertexShader, fragmentShader: m.fragmentShader, side: m.side });
  if (m.defines) c.defines = Object.assign({}, m.defines);
  c.vertexColors = m.vertexColors; c.transparent = m.transparent; c.depthWrite = m.depthWrite; c.depthTest = m.depthTest; c.blending = m.blending;
  return c;
}
// Lleva el objeto hacia «obj» (1 = visible, 0 = oculto). Devuelve true cuando ya está entero y con sus materiales.
function fundeObj(o, obj, dt){
  let F = o.userData.funde;
  if (!F){ if (obj >= 1) return true;
    F = o.userData.funde = { k: 1, ms: [] };
    o.traverse(m => { if (m.isMesh && m.material && !Array.isArray(m.material) && m.material.uniforms && m.material.uniforms.uOpacity) F.ms.push(m); }); }
  F.k = obj < F.k ? Math.max(obj, F.k - dt / FUNDE_SALE) : Math.min(obj, F.k + dt / FUNDE_ENTRA);
  if (F.k >= 1){ fundeQuita(o); return true; }
  o.visible = F.k > 0.02;
  for (const m of F.ms){ const u = m.userData;
    if (m.material !== u.fundeMat) u.fundeOrig = m.material;
    if (!u.fundeMat || u.fundeMat.userData.de !== u.fundeOrig){ u.fundeMat = fundeCopia(u.fundeOrig); u.fundeMat.userData.de = u.fundeOrig; }
    m.material = u.fundeMat; u.fundeMat.uniforms.uOpacity.value = u.fundeOrig.uniforms.uOpacity.value * F.k; }
  return false;
}
function fundeQuita(o){   // entero ya, con sus materiales de siempre
  const F = o.userData.funde; if (!F) return;
  for (const m of F.ms) if (m.userData.fundeOrig && m.material === m.userData.fundeMat) m.material = m.userData.fundeOrig;
  o.userData.funde = null; o.visible = true;
}

/* ---------- Mapas grandes ---------- */
const _mpOcluyeF = mpOcluye;
mpOcluye = function(){
  for (const o of FUNDE.mapa) o.visible = true;   // (el original solo mira lo visible: lo que se está fundiendo también cuenta)
  _mpOcluyeF();   // (deja en MP.oc lo que tapa, oculto de golpe)
  const dt = fundeDt('mapa'), tapan = new Set(MP.oc);
  for (const o of tapan){ FUNDE.mapa.add(o); fundeObj(o, 0, dt); }
  for (const o of FUNDE.mapa) if (!tapan.has(o)){ o.visible = true; if (fundeObj(o, 1, dt)) FUNDE.mapa.delete(o); }
};
const _mpPonTamF = mpPonTam;
mpPonTam = function(grande){ for (const o of FUNDE.mapa) fundeQuita(o); FUNDE.mapa.clear(); _mpPonTamF(grande); };   // (al cambiar de mapa, todo entero)

/* ---------- Ryūjin colosal ---------- */
const _colCamaraF = colCamara;
colCamara = function(cam){
  _colCamaraF(cam);
  if (!COL.montado || cs.active || lcut) return;
  const dt = fundeDt('colCam');
  for (const sg of COL.segs){ const v = sg.visible; sg.visible = true; fundeObj(sg, v ? 1 : 0, dt); }
  const v = COL.cab.visible; COL.cab.visible = true; fundeObj(COL.cab, v ? 1 : 0, dt);
};
const _colTickF = colTick;
colTick = function(dt, pdt, playing){
  _colTickF(dt, pdt, playing);
  if (!COL.montado) return;
  const d = fundeDt('colPilar');
  for (const s of [...COL.sellos, COL.perla]) if (s && s.alive && s.pilar){ const v = s.pilar.visible; s.pilar.visible = true; fundeObj(s.pilar, v ? 1 : 0, d); }
};
const _colMontaF = colMonta;
colMonta = function(){ if (COL.segs) for (const sg of COL.segs) fundeQuita(sg); if (COL.cab) fundeQuita(COL.cab); _colMontaF(); };

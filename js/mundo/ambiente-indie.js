'use strict';
/* ======================================================================
   AMBIENTE INDIE (prefijo luz; Opciones → Ambiente, localStorage 'tovan-luz')
   Encima del look PS1, sin tocarlo:
     · Haces de luz: cintas de luz que bajan en la dirección del sol
       (shared.uLightDir) por la arena, con el color de la luz del bioma,
       bandas que se mueven despacio y la misma trama (bayer) que el resto
       del juego. Todas en una malla (una llamada de dibujo); se apagan
       cerca de la cámara para no tapar.
     · Motas de polvo: puntos de 1–3 px que flotan alrededor de Tovan y
       titilan (también una sola malla; se mueven en el shader).
     · Tono (#luzTono, css/ambiente-indie.css): una fuga de luz cálida que
       sale del lado del sol en pantalla y una viñeta teñida con la niebla.
   Se colocan con mulberry32 (nada de rnd()). Se esconden donde el juego ya
   tiene su propio escenario o filtro (Canal X, show, colosal, TOVAN.EXE,
   el mecanismo del Guardián, salas especiales).
   ====================================================================== */
const LUZ = { on: true, haces: null, charcos: null, motas: null, clave: '', el: null, t: 0, ver: false };
try { LUZ.on = localStorage.getItem('tovan-luz') !== 'clasico'; } catch (e) {}
const LUZ_N = 14;
const LUZ_VS = `
attribute vec3 aBase; attribute vec4 aForma;   // forma: ancho, largo, semilla, intensidad
uniform vec3 uDir;
varying vec2 vU; varying float vSeed; varying float vI; varying float vCam;
void main(){
  vU = vec2(position.x + 0.5, position.y); vSeed = aForma.z; vI = aForma.w;
  vec3 P = aBase + uDir * (position.y * aForma.y);
  vec3 toCam = normalize(cameraPosition - P);
  vec3 lado = normalize(cross(uDir, toCam));
  P += lado * position.x * aForma.x * (1.0 - 0.35 * position.y);
  vCam = distance(cameraPosition, P);
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}`;
const LUZ_FS = `
uniform vec3 uCol; uniform float uTime; uniform float uInt;
varying vec2 vU; varying float vSeed; varying float vI; varying float vCam;
${DITHER_GLSL}
void main(){
  float borde = 1.0 - abs(vU.x * 2.0 - 1.0); borde = borde * borde * borde;
  float largo = smoothstep(0.0, 0.18, vU.y) * (1.0 - smoothstep(0.45, 1.0, vU.y));
  float bandas = 0.68 + 0.32 * sin(vU.x * 9.0 + uTime * 0.5 + vSeed * 13.0) * sin(vU.y * 4.0 - uTime * 0.25 + vSeed * 7.0);
  float a = borde * largo * bandas * smoothstep(1.5, 6.5, vCam) * uInt * vI * (0.75 + 0.25 * sin(uTime * 0.4 + vSeed * 20.0));
  a = floor(a * 7.0 + bayer4(gl_FragCoord.xy)) / 7.0;
  if (a <= 0.0) discard;
  gl_FragColor = vec4(uCol * a, 1.0);
}`;
const LUZ_CHARCO_VS = `
attribute vec3 aBase; attribute vec4 aForma;
uniform vec3 uDir;
varying vec2 vQ; varying float vSeed; varying float vI;
void main(){
  vQ = vec2(position.x * 2.0, position.y * 2.0 - 1.0); vSeed = aForma.z; vI = aForma.w;
  vec2 f = normalize(uDir.xz + vec2(0.0001)), r = vec2(f.y, -f.x); float w = aForma.x;
  vec3 P = aBase + vec3(r.x, 0.0, r.y) * vQ.x * w * 0.9 + vec3(f.x, 0.0, f.y) * vQ.y * w * 1.4; P.y = 0.04;
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}`;
const LUZ_CHARCO_FS = `
uniform vec3 uCol; uniform float uTime; uniform float uInt;
varying vec2 vQ; varying float vSeed; varying float vI;
${DITHER_GLSL}
void main(){
  float a = (1.0 - smoothstep(0.1, 1.0, length(vQ))) * uInt * 0.5 * vI * (0.8 + 0.2 * sin(uTime * 0.4 + vSeed * 20.0));
  a = floor(a * 7.0 + bayer4(gl_FragCoord.xy)) / 7.0;
  if (a <= 0.0) discard;
  gl_FragColor = vec4(uCol * a, 1.0);
}`;
function luzHaces(){
  if (LUZ.haces) return LUZ.haces;
  const g = new THREE.BufferGeometry(), N = LUZ_N, pos = [], base = new Float32Array(N * 4 * 3), forma = new Float32Array(N * 4 * 4), idx = [];
  for (let i = 0; i < N; i++){ pos.push(-0.5, 0, 0, 0.5, 0, 0, -0.5, 1, 0, 0.5, 1, 0); const a = i * 4; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aBase', new THREE.BufferAttribute(base, 3)); g.setAttribute('aForma', new THREE.BufferAttribute(forma, 4)); g.setIndex(idx);
  const mat = new THREE.ShaderMaterial({ vertexShader: LUZ_VS, fragmentShader: LUZ_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uDir: { value: new THREE.Vector3() }, uCol: { value: new THREE.Color() }, uTime: shared.uTime, uInt: { value: 0.4 } } });
  LUZ.haces = new THREE.Mesh(g, mat); LUZ.haces.frustumCulled = false; LUZ.haces.renderOrder = 4; LUZ.haces.visible = false; scene.add(LUZ.haces);
  // los charcos de luz donde cae cada haz (la misma geometría, tumbada en el suelo)
  LUZ.charcos = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: LUZ_CHARCO_VS, fragmentShader: LUZ_CHARCO_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, uniforms: mat.uniforms }));
  LUZ.charcos.frustumCulled = false; LUZ.charcos.renderOrder = 3; LUZ.haces.add(LUZ.charcos); return LUZ.haces;
}
// dónde caen los haces: según el bioma y el tamaño de la arena (siempre los mismos)
function luzColoca(){
  const m = luzHaces(), R = mulberry32(900 + curBiome * 31 + (ARENA > 10 ? 7 : 0)), B = m.geometry.attributes.aBase, F = m.geometry.attributes.aForma, grande = ARENA > 10;
  for (let i = 0; i < LUZ_N; i++){ const on = i < (grande ? 14 : 9), a = R() * TAU, r = (0.15 + 0.8 * R()) * ARENA, w = (grande ? 1.3 : 1) * (0.45 + R() * 1.05), L = 14 + R() * 6, s = R(), k = on ? 0.6 + R() * 0.4 : 0;
    for (let v = 0; v < 4; v++){ B.setXYZ(i * 4 + v, Math.sin(a) * r, 0, Math.cos(a) * r); F.setXYZW(i * 4 + v, w, L, s, k); } }
  B.needsUpdate = true; F.needsUpdate = true;
}
const LUZ_MOTAS_VS = `
attribute vec4 aM;   // posición en la caja (x, y, z) y semilla
uniform vec3 uCentro; uniform float uTime; uniform float uEsc;
varying float vA;
void main(){
  float s = aM.w, t = uTime;
  vec3 p = aM.xyz + vec3(sin(t * 0.21 + s * 6.0) * 0.8, sin(t * 0.33 + s * 4.0) * 0.3 + t * 0.06, cos(t * 0.17 + s * 5.0) * 0.8);
  p.xz = uCentro.xz + mod(p.xz - uCentro.xz + 9.0, 18.0) - 9.0; p.y = mod(p.y, 4.5) + 0.15;
  vec4 mv = viewMatrix * vec4(p, 1.0);
  vA = (0.45 + 0.55 * sin(t * (1.2 + s * 2.0) + s * 40.0)) * smoothstep(1.0, 3.0, -mv.z) * (1.0 - smoothstep(14.0, 20.0, -mv.z));
  gl_PointSize = clamp(uEsc * (1.0 + s * 1.6) * 6.0 / -mv.z, 1.0, 3.0 * uEsc);
  gl_Position = projectionMatrix * mv;
}`;
const LUZ_MOTAS_FS = 'uniform vec3 uCol; varying float vA; void main(){ if (vA < 0.12) discard; gl_FragColor = vec4(uCol * vA, 1.0); }';
function luzMotas(){
  if (LUZ.motas) return LUZ.motas;
  const N = 240, R = mulberry32(911), m = new Float32Array(N * 4), g = new THREE.BufferGeometry();
  for (let i = 0; i < N; i++) m.set([(R() - 0.5) * 18, R() * 4.5, (R() - 0.5) * 18, R()], i * 4);
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute('aM', new THREE.BufferAttribute(m, 4));
  const mat = new THREE.ShaderMaterial({ vertexShader: LUZ_MOTAS_VS, fragmentShader: LUZ_MOTAS_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uCentro: { value: new THREE.Vector3() }, uTime: shared.uTime, uEsc: { value: 1 }, uCol: { value: new THREE.Color() } } });
  LUZ.motas = new THREE.Points(g, mat); LUZ.motas.frustumCulled = false; LUZ.motas.renderOrder = 4; LUZ.motas.visible = false; scene.add(LUZ.motas); return LUZ.motas;
}
// ¿se ven? (los escenarios con look propio se quedan como están)
const luzCabe = () => LUZ.on && !chActive && !MG.active && !special && !COL.montado && !TER.montado && !SH3.montado && !(typeof ENG !== 'undefined' && ENG.montado) && !(typeof VAC !== 'undefined' && VAC.F);
const luzV = new V3(), luzC1 = new THREE.Color(), luzC2 = new THREE.Color();
function luzTick(dt){
  const ver = luzCabe(), H = luzHaces(), M_ = luzMotas();
  if (ver !== LUZ.ver){ LUZ.ver = ver; document.body.classList.toggle('luzOn', ver); }
  H.visible = M_.visible = ver; if (!ver) return;
  const clave = curBiome + ':' + ARENA; if (clave !== LUZ.clave){ LUZ.clave = clave; luzColoca(); }
  const Bm = BIOMES[curBiome] || {}, noche = !!Bm.moon;
  H.material.uniforms.uDir.value.copy(shared.uLightDir.value);
  luzC1.copy(shared.uLightCol.value).lerp(luzC2.setHex(0xfff2d8), 0.3); H.material.uniforms.uCol.value.copy(luzC1); H.material.uniforms.uInt.value = noche ? 0.85 : 1.2;
  M_.material.uniforms.uCol.value.copy(luzC1).multiplyScalar(noche ? 0.7 : 0.9); M_.material.uniforms.uCentro.value.copy(hero.position); M_.material.uniforms.uEsc.value = Math.max(1, shared.uRes.value.y / 240);
  if ((LUZ.t -= dt) <= 0){ LUZ.t = 0.25;   // la fuga de luz sale del lado del sol, en pantalla
    luzV.copy(hero.position).addScaledVector(shared.uLightDir.value, 30).project(camera); if (luzV.z > 1){ luzV.x = -luzV.x; luzV.y = 1.6; }   // (sol detrás de la cámara: la luz entra por arriba)
    const x = clamp((luzV.x * 0.5 + 0.5) * 100, -20, 120), y = clamp((0.5 - luzV.y * 0.5) * 100, -30, 60), el = LUZ.el;
    if (el){ el.style.setProperty('--lx', x.toFixed(0) + '%'); el.style.setProperty('--ly', y.toFixed(0) + '%');
      const c = luzC1, f = shared.uFogCol.value; el.style.setProperty('--luz', `${c.r * 255 | 0},${c.g * 255 | 0},${c.b * 255 | 0}`); el.style.setProperty('--sombra', `${f.r * 160 | 0},${f.g * 160 | 0},${f.b * 160 | 0}`); } }
}
function luzAplica(on){ LUZ.on = on; try { localStorage.setItem('tovan-luz', on ? 'indie' : 'clasico'); } catch (e) {} }
const _v3UpdateLuz = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateLuz(dt, pdt, playing); try { luzTick(dt); } catch (err) { console.error(err); } };
LUZ.el = document.createElement('div'); LUZ.el.id = 'luzTono'; LUZ.el.setAttribute('aria-hidden', 'true');
(document.querySelector('.vignette') || document.getElementById('c')).after(LUZ.el);
document.addEventListener('DOMContentLoaded', () => {
  const o = { label: 'Ambiente', get: () => LUZ.on ? 'Indie' : 'Clásico', act: () => luzAplica(!LUZ.on) };
  const i = options.findIndex(q => q.label === 'Cámara') + 1 || options.length;
  options.splice(i, 0, o);   // tras «Cámara»
  const li = document.createElement('li'), b = document.createElement('button');
  b.innerHTML = '<span class="cur">▶</span><span>Ambiente</span><span class="val"></span>';
  const val = b.querySelector('.val'); val.textContent = o.get();
  b.addEventListener('click', () => { o.act(); val.textContent = o.get(); b.blur(); play('cursor'); });
  li.appendChild(b); const l = document.getElementById('menuList'); l.insertBefore(li, l.children[i] || null);
});

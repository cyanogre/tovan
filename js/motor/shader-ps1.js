'use strict';
/* ---------- Uniforms compartidos (look PS1) ---------- */
var TELES = [];
const shared = {
  uRes:       { value: new THREE.Vector2(320, 240) },
  uSnap:      { value: 1 },
  uAffine:    { value: 1 },
  uDither:    { value: 1 },
  uLightDir:  { value: new THREE.Vector3(-0.55, 0.75, 0.45).normalize() },
  uLightCol:  { value: new THREE.Color(0xf2b89a).multiplyScalar(0.8) },
  uAmb:       { value: new THREE.Color(0x40386e) },
  uPointPos:  { value: new THREE.Vector3(0, 1, 0) },
  uPointCol:  { value: new THREE.Color(0xff8a3a) },
  uPointRange:{ value: 7.5 },
  uP2Pos:     { value: new THREE.Vector3(0, 1, 0) },
  uP2Col:     { value: new THREE.Color(0x49d8ff) },
  uP2Range:   { value: 1.8 },
  uP3Pos:     { value: new THREE.Vector3(0, -50, 0) },
  uGlitch:    { value: 0 },
  uPalette:   { value: 0 },
  uToon:      { value: 0 },
  uFlat:      { value: 0 },
  uTime:      { value: 0 },
  uP3Col:     { value: new THREE.Color(0x000000) },
  uP3Range:   { value: 6 },
  uFogCol:    { value: new THREE.Color(0x2e2140) },
  uFogNear:   { value: 7 },
  uFogFar:    { value: 34 }
};

const DITHER_GLSL = `
float bayer2(vec2 a){ a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 a){ return bayer2(0.5 * a) * 0.25 + bayer2(a); }
`;

const VS = `
#ifndef GLITCH_AMP
#define GLITCH_AMP 0.14
#endif
uniform vec2 uRes; uniform float uSnap; uniform float uAffine;
uniform vec3 uLightDir; uniform vec3 uLightCol; uniform vec3 uAmb;
uniform vec3 uPointPos; uniform vec3 uPointCol; uniform float uPointRange;
uniform vec3 uP2Pos; uniform vec3 uP2Col; uniform float uP2Range;
uniform vec3 uP3Pos; uniform vec3 uP3Col; uniform float uP3Range;
uniform float uFogNear; uniform float uFogFar; uniform float uGlitch; uniform float uTime;
varying vec3 vLight; varying vec3 vUvW; varying float vFog;
#ifdef USE_COLOR
varying vec3 vCol;
#endif
#ifdef TERRENO
attribute vec3 splat; varying vec3 vSplat;
#endif
void main(){
  vec3 pos = position;
#ifdef VIENTO
  { vec4 w0 = modelMatrix * vec4(pos, 1.0); pos.xz += vec2(sin(uTime * 1.7 + w0.x * 0.6 + w0.z * 0.4), cos(uTime * 1.3 + w0.z * 0.7)) * 0.09 * uv.y; }   // uv.y = altura sobre la base
#endif
  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vec3 n = normalize(mat3(modelMatrix) * normal);
#ifdef RELLENO
  float hl = 0.5 + 0.5 * dot(n, uLightDir);   // luz envolvente y relleno de cielo: las caras a contraluz no se van a negro
  vec3 L = uAmb * (1.05 + 0.45 * n.y) + uLightCol * hl * hl * 1.15;
#else
  vec3 L = uAmb + uLightCol * max(dot(n, uLightDir), 0.0);
#endif
  vec3 d1 = uPointPos - wp.xyz; float l1 = max(length(d1), 0.001);
  L += uPointCol * max(dot(n, d1 / l1), 0.0) * pow(clamp(1.0 - l1 / uPointRange, 0.0, 1.0), 1.4);
  vec3 d2 = uP2Pos - wp.xyz; float l2 = max(length(d2), 0.001);
  L += uP2Col * max(dot(n, d2 / l2), 0.0) * clamp(1.0 - l2 / uP2Range, 0.0, 1.0);
  vec3 d3 = uP3Pos - wp.xyz; float l3 = max(length(d3), 0.001);
  L += uP3Col * (0.35 + 0.65 * max(dot(n, d3 / l3), 0.0)) * clamp(1.0 - l3 / uP3Range, 0.0, 1.0);
  vLight = L;
  vec4 mv = viewMatrix * wp;
  vec4 p = projectionMatrix * mv;
  if (uSnap > 0.5 && p.w > 0.0) {            // vértices "enganchados" a la rejilla de píxeles
    vec2 g = uRes * 0.5;
    p.xy = floor(p.xy / p.w * g + 0.5) / g * p.w;
  }
  if (uGlitch > 0.5){ float h = fract(sin(dot(floor(position * 3.0) + floor(uTime * 6.0), vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    if (h > 0.92) p.xy += (vec2(h, fract(h * 7.13)) - 0.5) * GLITCH_AMP * p.w; }
  gl_Position = p;
  float w = uAffine > 0.5 ? p.w : 1.0;       // mapeo afín: se deshace la corrección de perspectiva
  vUvW = vec3(uv * w, w);
#ifdef USE_COLOR
  vCol = color;                              // luz y sombras pintadas en los vértices
#endif
#ifdef TERRENO
  vSplat = splat;
#endif
  vFog = clamp((-mv.z - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
}`;

const FS = `
uniform vec3 uColor; uniform sampler2D uMap; uniform float uHasMap;
uniform float uEmissive; uniform float uOpacity; uniform float uDither; uniform float uFogAmt; uniform float uGlitch; uniform float uPalette; uniform float uToon; uniform float uFlat;
uniform vec3 uFogCol;
varying vec3 vLight; varying vec3 vUvW; varying float vFog;
#ifdef USE_COLOR
varying vec3 vCol;
#endif
#ifdef TERRENO
uniform sampler2D uMap2; uniform sampler2D uMap3; uniform vec2 uEsc; varying vec3 vSplat;
#endif
${DITHER_GLSL}
void main(){
  vec2 uv = vUvW.xy / vUvW.z;
  vec4 t = vec4(1.0);
  if (uHasMap > 0.5) t = texture2D(uMap, uv);
#ifdef TERRENO
  t = t * vSplat.x + texture2D(uMap2, uv * uEsc.x) * vSplat.y + texture2D(uMap3, uv * uEsc.y) * vSplat.z;   // terreno: tres texturas mezcladas
#endif
#ifdef USE_COLOR
  t.rgb *= vCol;
#endif
  if (uGlitch > 0.5 && uEmissive < 0.5){ vec2 q = floor(uv * 4.0); t = vec4(mod(q.x + q.y, 2.0) > 0.5 ? vec3(1.0, 0.0, 0.86) : vec3(0.04), t.a < 0.5 ? t.a : 1.0); }
  float b = bayer4(gl_FragCoord.xy);
  float a = t.a * uOpacity;
  float thr = uOpacity < 0.999 ? b + 0.001 : 0.5;   // transparencia por trama (screen-door)
  if (a < thr) discard;
  vec3 L = vLight;
  if (uToon > 0.5){ float l = dot(L, vec3(0.333)); float q = l < 0.42 ? 0.55 : l < 0.95 ? 0.88 : 1.15; L = L / max(l, 0.001) * q; }   // luz por bandas (cel)
  if (uFlat > 0.5) L = vec3(1.0);                                                                                                        // colores planos
  vec3 c = uColor * t.rgb * mix(L, vec3(1.0), uEmissive);
  if (uToon > 0.5 || uFlat > 0.5){ float gl = dot(c, vec3(0.3, 0.59, 0.11)); c = mix(vec3(gl), c, 1.25); }
  c = mix(c, uFogCol, vFog * uFogAmt * (1.0 - 0.75 * max(uToon, uFlat)));
  if (uDither > 0.5) { c += (b - 0.5) / 22.0; c = floor(c * 31.0 + 0.5) / 31.0; }  // 15 bits + trama
  if (uPalette > 0.5){ float l = dot(c, vec3(0.3, 0.59, 0.11)) + (b - 0.5) * 0.16;
    c = l < 0.2 ? vec3(0.06, 0.22, 0.06) : l < 0.42 ? vec3(0.19, 0.38, 0.19) : l < 0.66 ? vec3(0.55, 0.67, 0.06) : vec3(0.61, 0.74, 0.06); }
  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);
}`;

function makeMat(color, o = {}){
  const mm = new THREE.ShaderMaterial({
    uniforms: Object.assign({}, shared, {
      uColor:    { value: new THREE.Color(color) },
      uMap:      { value: o.map || null },
      uHasMap:   { value: o.map ? 1 : 0 },
      uEmissive: { value: o.emissive || 0 },
      uOpacity:  { value: o.opacity == null ? 1 : o.opacity },
      uFogAmt:   { value: o.noFog ? 0 : 1 }
    }),
    vertexShader: VS, fragmentShader: FS,
    side: o.side || THREE.FrontSide
  });
  // Opciones de los mapas grandes (no cambian nada si no se piden): colores por vértice (con luz de relleno), viento y terreno de tres texturas
  if (o.vc){ mm.vertexColors = true; if (o.relleno !== false) mm.defines = Object.assign(mm.defines || {}, { RELLENO: '' }); }
  if (o.viento) mm.defines = Object.assign(mm.defines || {}, { VIENTO: '' });
  if (o.terreno){ mm.defines = Object.assign(mm.defines || {}, { TERRENO: '' }); Object.assign(mm.uniforms, { uMap2: { value: o.terreno[0] }, uMap3: { value: o.terreno[1] }, uEsc: { value: new THREE.Vector2(o.esc ? o.esc[0] : 1, o.esc ? o.esc[1] : 1) } }); }
  if ((color === 0xff3a2a || color === 0xff5a20) && o.opacity != null && o.opacity < 1) mm.userData.tele = true;
  return mm;
}
function mesh(geo, mat, x = 0, y = 0, z = 0, parent = scene){
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m);
  if (mat && mat.userData && mat.userData.tele) TELES.push(m);
  return m;
}
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
// cajas redondeadas para que los jefes sean menos cúbicos (siguen siendo low-poly)
const rbCache = new Map();
function roundedBoxGeo(w, h, d, frac = 0.42, seg = 4){
  const key = [w, h, d, frac].map(v => v.toFixed(3)).join('|'); if (rbCache.has(key)) return rbCache.get(key);
  const g = new THREE.BoxGeometry(w, h, d, seg, seg, seg), p = g.attributes.position, r = Math.min(w, h, d) * frac;
  const hx = w / 2 - r, hy = h / 2 - r, hz = d / 2 - r, v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++){ v.set(p.getX(i), p.getY(i), p.getZ(i)); c.set(Math.max(-hx, Math.min(hx, v.x)), Math.max(-hy, Math.min(hy, v.y)), Math.max(-hz, Math.min(hz, v.z)));
    v.sub(c); if (v.lengthSq() > 1e-8) v.normalize().multiplyScalar(r); v.add(c); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); rbCache.set(key, g); return g;
}
function roundify(root, frac){ if (root) root.traverse(o => { if (o.isMesh && o.geometry && o.geometry.type === 'BoxGeometry'){ const q = o.geometry.parameters; o.geometry = roundedBoxGeo(q.width, q.height, q.depth, frac); } }); }
function roundBoss(e){ return; if (!e.isBoss || e.type === 'error' || e.type === 'teapot') return; roundify(e.g); roundify(e.body); if (e.parts) e.parts.forEach(q => roundify(q)); if (e.segs) e.segs.forEach(q => roundify(q.m || q)); }
const C = (rt, rb, h, s = 6, open = false, ts = 0, tl = Math.PI * 2) => new THREE.CylinderGeometry(rt, rb, h, s, 1, open, ts, tl);
function scaleUV(geo, su, sv){ const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; }

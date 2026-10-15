'use strict';
/* ======================================================================
   ESTÉTICA v7 (1/2): sistemas para que TODOS los poderes se vean
   Partículas en GPU (miles en una sola pasada), anillos y estelas que brillan,
   auras de anime, calcomanías en el suelo y accesorios en el personaje
   ====================================================================== */
const t7a = new V3(), t7b = new V3(), t7c = new V3(), t7d = new V3(), _c7 = new THREE.Color(), _v2e7 = new THREE.Vector2(), UP7 = new V3(0, 1, 0);
const SH7 = { sq: 0, dia: 1, star: 2, ring: 3, dot: 4, heart: 5, plus: 6 };
const E7 = { hitN: 0, crit: 0, glass: 0, vamp: 0, armS: 1, armV: 0, armLS: 1, armLV: 0, armOn: false, wigQ: 0, wigT: 0, kamPose: 0, clapT: 0, swT: 0, btT: 0,
  stonks0: 0, notStonksT: 0, kam0: 0, lum0: 0, note0: 16, door0: false, gadget0: null, jan0: false, bt0: 0, hd0: false, mv0: null, ping: 0, emit: 0, steam: 0,
  auraA: 0, auraB: 0, wisps: 0, drums: 0, popT: 0, ghostT: 0, pogo0: false, airJ0: 0, gadJ0: 0, fistT: 0, speedT: 0, spark: 0, anchors: null, csh0: false };

/* ---------- Partículas en GPU ---------- */
const PT7_VS = `attribute float aSize; attribute vec3 aCol; attribute float aAlpha; attribute float aShape;
varying vec3 vCol; varying float vA; varying float vS; uniform float uScale;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  if (aAlpha <= 0.003){ gl_Position = vec4(2.0, 2.0, 2.0, 1.0); gl_PointSize = 0.0; }
  else { gl_Position = projectionMatrix * mv; gl_PointSize = clamp(aSize * uScale / max(0.2, -mv.z), 1.0, 120.0); }
  vCol = aCol; vA = aAlpha; vS = aShape; }`;
const PT7_FS = `varying vec3 vCol; varying float vA; varying float vS; uniform float uAdd;
void main(){
  vec2 p = gl_PointCoord - 0.5; float ax = abs(p.x), ay = abs(p.y);
  if (vS > 0.5 && vS < 1.5 && ax + ay > 0.5) discard;                                    // rombo
  if (vS > 1.5 && vS < 2.5 && min(ax, ay) > 0.09 && ax + ay > 0.27) discard;             // estrella de 4 puntas
  if (vS > 2.5 && vS < 3.5){ float r = length(p); if (r > 0.5 || r < 0.3) discard; }    // aro
  if (vS > 3.5 && vS < 4.5 && length(p) > 0.5) discard;                                  // círculo
  if (vS > 4.5 && vS < 5.5){ vec2 q = vec2(p.x, 0.06 - p.y) * 2.5; float a = q.x * q.x + q.y * q.y - 1.0; if (a * a * a - q.x * q.x * q.y * q.y * q.y > 0.0) discard; } // corazón
  if (vS > 5.5 && vS < 6.5 && ax > 0.15 && ay > 0.15) discard;                           // cruz
  if (uAdd > 0.5) gl_FragColor = vec4(vCol * vA, 1.0); else gl_FragColor = vec4(vCol, vA); }`;
function mkPts7(N, add){
  const S = { N, i: 0, pos: new Float32Array(N * 3), col: new Float32Array(N * 3), sz: new Float32Array(N), al: new Float32Array(N), sh: new Float32Array(N),
    vel: new Float32Array(N * 3), life: new Float32Array(N), max: new Float32Array(N), grav: new Float32Array(N), drag: new Float32Array(N), s0: new Float32Array(N), s1: new Float32Array(N), a0: new Float32Array(N) };
  const g = new THREE.BufferGeometry(), dyn = (a, n) => new THREE.BufferAttribute(a, n).setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('position', dyn(S.pos, 3)); g.setAttribute('aCol', dyn(S.col, 3)); g.setAttribute('aSize', dyn(S.sz, 1)); g.setAttribute('aAlpha', dyn(S.al, 1)); g.setAttribute('aShape', dyn(S.sh, 1));
  S.mat = new THREE.ShaderMaterial({ uniforms: { uScale: { value: 200 }, uAdd: { value: add ? 1 : 0 } }, vertexShader: PT7_VS, fragmentShader: PT7_FS,
    transparent: true, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending });
  S.pts = new THREE.Points(g, S.mat); S.pts.frustumCulled = false; S.pts.renderOrder = add ? 8 : 7; S.g = g; scene.add(S.pts);
  return S;
}
const PA7 = mkPts7(2200, true), PN7 = mkPts7(1200, false);
function pf(S, x, y, z, vx, vy, vz, col, size, life, grav, drag, end, shape, alpha){
  const i = S.i; S.i = (i + 1) % S.N; const j = i * 3;
  S.pos[j] = x; S.pos[j + 1] = y; S.pos[j + 2] = z; S.vel[j] = vx; S.vel[j + 1] = vy; S.vel[j + 2] = vz;
  _c7.setHex(col); S.col[j] = _c7.r; S.col[j + 1] = _c7.g; S.col[j + 2] = _c7.b;
  S.s0[i] = size; S.sz[i] = size; S.s1[i] = end == null ? 0 : end; S.life[i] = life; S.max[i] = life;
  S.grav[i] = grav || 0; S.drag[i] = drag || 0; S.sh[i] = shape || 0; S.a0[i] = alpha == null ? 1 : alpha; S.al[i] = S.a0[i];
}
function pa(x, y, z, vx, vy, vz, col, size, life, grav, drag, end, shape, alpha){ pf(PA7, x, y, z, vx, vy, vz, col, size, life, grav, drag, end, shape, alpha); }
function pn(x, y, z, vx, vy, vz, col, size, life, grav, drag, end, shape, alpha){ pf(PN7, x, y, z, vx, vy, vz, col, size, life, grav, drag, end, shape, alpha); }
function updPts7(S, dt){
  const P_ = S.pos, V = S.vel;
  for (let i = 0; i < S.N; i++){
    if (S.life[i] <= 0) continue;
    S.life[i] -= dt; if (S.life[i] <= 0){ S.al[i] = 0; continue; }
    const j = i * 3, k = 1 - S.life[i] / S.max[i];
    if (S.drag[i]){ const d = Math.exp(-S.drag[i] * dt); V[j] *= d; V[j + 1] *= d; V[j + 2] *= d; }
    V[j + 1] -= S.grav[i] * dt;
    P_[j] += V[j] * dt; P_[j + 1] += V[j + 1] * dt; P_[j + 2] += V[j + 2] * dt;
    if (S.grav[i] > 0 && P_[j + 1] < 0.04){ P_[j + 1] = 0.04; if (V[j + 1] < 0) V[j + 1] *= -0.35; V[j] *= 0.82; V[j + 2] *= 0.82; }
    S.sz[i] = S.s0[i] * (1 + (S.s1[i] - 1) * k);
    S.al[i] = S.a0[i] * (k < 0.65 ? 1 : (1 - k) / 0.35);
  }
  const A = S.g.attributes; A.position.needsUpdate = true; A.aCol.needsUpdate = true; A.aSize.needsUpdate = true; A.aAlpha.needsUpdate = true; A.aShape.needsUpdate = true;
}
function clearPts7(S){ S.life.fill(0); S.al.fill(0); const A = S.g.attributes; A.aAlpha.needsUpdate = true; }
// ráfaga esférica
function burst7(S, x, y, z, n, cols, sp, size, life, grav, drag, end, shape, up){
  for (let k = 0; k < n; k++){ const u = rnd() * 2 - 1, a = rnd() * TAU, s = Math.sqrt(1 - u * u), v = sp * (0.35 + rnd() * 0.65);
    pf(S, x, y, z, Math.cos(a) * s * v, u * v + (up || 0), Math.sin(a) * s * v, typeof cols === 'number' ? cols : cols[k % cols.length],
      size * (0.7 + rnd() * 0.6), life * (0.7 + rnd() * 0.6), grav, drag, end, shape); }
}
// ráfaga en anillo horizontal
function ring7(S, x, y, z, n, cols, sp, size, life, grav, drag, end, shape, up){
  for (let k = 0; k < n; k++){ const a = k / n * TAU + rnd() * 0.2, v = sp * (0.8 + rnd() * 0.4);
    pf(S, x, y, z, Math.cos(a) * v, (up || 0) * (0.6 + rnd() * 0.8), Math.sin(a) * v, typeof cols === 'number' ? cols : cols[k % cols.length], size, life * (0.8 + rnd() * 0.4), grav, drag, end, shape); }
}

/* ---------- Materiales que brillan (aditivos) ---------- */
const AD7_VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const AD7_FS = `uniform vec3 uColor; uniform float uAlpha; uniform sampler2D uMap; uniform float uHasMap; varying vec2 vUv;
void main(){ float t = uHasMap > 0.5 ? texture2D(uMap, vUv).r : 1.0; gl_FragColor = vec4(uColor * uAlpha * t, 1.0); }`;
function addMat7(col, alpha, map){
  return new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(col) }, uAlpha: { value: alpha == null ? 1 : alpha }, uMap: { value: map || null }, uHasMap: { value: map ? 1 : 0 }, uEmissive: { value: 1 }, uOpacity: { value: 1 } },
    vertexShader: AD7_VS, fragmentShader: AD7_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
}
function addMesh7(geo, mat, parent){ const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; (parent || scene).add(m); return m; }

/* ---------- Anillos y octógonos luminosos ---------- */
function ringPool7(n, seg){ return Array.from({ length: n }, () => { const m = addMesh7(new THREE.RingGeometry(0.8, 1, seg), addMat7(0xffffff)); m.visible = false; m.userData = { t: 0, dur: 1, r0: 0, r1: 1, a: 1 }; return m; }); }
const GR7 = ringPool7(28, 32), OCT7 = ringPool7(8, 8);
let gr7I = 0, oct7I = 0;
function gring(x, y, z, col, r0, r1, dur, yaw, a){
  const m = GR7[gr7I++ % GR7.length]; ringSet7(m, x, y, z, col, r0, r1, dur, yaw, a); return m;
}
function octRing7(x, y, z, col, r0, r1, dur, yaw, a){ const m = OCT7[oct7I++ % OCT7.length]; ringSet7(m, x, y, z, col, r0, r1, dur, yaw, a); m.rotation.z = Math.PI / 8; return m; }
function ringSet7(m, x, y, z, col, r0, r1, dur, yaw, a){
  m.visible = true; m.position.set(x, y, z);
  if (yaw == null) m.rotation.set(-Math.PI / 2, 0, 0); else m.rotation.set(0, yaw, 0);
  m.material.uniforms.uColor.value.setHex(col); Object.assign(m.userData, { t: 0, dur, r0, r1, a: a == null ? 1 : a }); m.scale.setScalar(Math.max(0.01, r0));
}
function updRings7(dt){
  for (const L of [GR7, OCT7]) for (const m of L){ if (!m.visible) continue; const u = m.userData; u.t += dt; const k = u.t / u.dur;
    if (k >= 1){ m.visible = false; continue; }
    const e = 1 - (1 - k) * (1 - k); m.scale.setScalar(Math.max(0.01, lerp(u.r0, u.r1, e))); m.material.uniforms.uAlpha.value = u.a * (1 - k * k); }
}

/* ---------- Estelas (líneas de velocidad, cortes, agujas) ---------- */
const SK7 = Array.from({ length: 48 }, () => { const m = addMesh7(new THREE.BoxGeometry(1, 1, 1), addMat7(0xffffff)); m.visible = false; m.userData = { t: 0, dur: 0.2, vx: 0, vy: 0, vz: 0, w: 0.04 }; return m; });
let sk7I = 0;
function streak7(x, y, z, dx, dy, dz, len, col, dur, w, sp){
  const m = SK7[sk7I++ % SK7.length], d = Math.max(1e-4, Math.hypot(dx, dy, dz)); dx /= d; dy /= d; dz /= d;
  m.visible = true; m.position.set(x, y, z); t7c.set(x + dx, y + dy, z + dz); m.lookAt(t7c); w = w || 0.04; m.scale.set(w, w, Math.max(0.01, len));
  m.material.uniforms.uColor.value.setHex(col); m.material.uniforms.uAlpha.value = 1;
  Object.assign(m.userData, { t: 0, dur: dur || 0.2, vx: dx * (sp || 0), vy: dy * (sp || 0), vz: dz * (sp || 0), w });
}
function line7(m, ax, ay, az, bx, by, bz, w){   // coloca una línea fija entre dos puntos
  const d = Math.max(1e-4, Math.hypot(bx - ax, by - ay, bz - az)); m.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2); t7c.set(bx, by, bz); m.lookAt(t7c); m.scale.set(w, w, d);
}
function updStreaks7(dt){
  for (const m of SK7){ if (!m.visible) continue; const u = m.userData; u.t += dt; const k = u.t / u.dur;
    if (k >= 1){ m.visible = false; continue; }
    m.position.x += u.vx * dt; m.position.y += u.vy * dt; m.position.z += u.vz * dt;
    m.material.uniforms.uAlpha.value = 1 - k; m.scale.x = m.scale.y = u.w * (1 - k * 0.6); }
}

/* ---------- Grietas en el suelo ---------- */
const crackGeo7 = new THREE.BoxGeometry(1, 0.03, 0.07); crackGeo7.translate(0.5, 0, 0);
const CR7 = Array.from({ length: 22 }, () => { const m = new THREE.Mesh(crackGeo7, makeMat(0x1a0e08, { opacity: 0.95 })); m.visible = false; scene.add(m);
  const glow = addMesh7(crackGeo7, addMat7(0xff8a2a, 0.9), m); glow.scale.set(1, 1.4, 0.45); glow.position.y = 0.012; m.userData = { t: 0, dur: 1, glow }; return m; });
let cr7I = 0;
function crack7(x, z, n, len, hot){
  for (let k = 0; k < n; k++){ const m = CR7[cr7I++ % CR7.length], a = k / n * TAU + rnd() * 0.5, L = len * (0.6 + rnd() * 0.6);
    m.visible = true; m.position.set(x + Math.cos(a) * 0.3, 0.03, z + Math.sin(a) * 0.3); m.rotation.set(0, -a, 0); m.scale.set(0.01, 1, 0.8 + rnd() * 0.8);
    m.userData.t = 0; m.userData.dur = 1.4; m.userData.L = L; m.userData.glow.visible = !!hot; m.material.uniforms.uOpacity.value = 0.95; }
}
function updCracks7(dt){
  for (const m of CR7){ if (!m.visible) continue; const u = m.userData; u.t += dt; const k = u.t / u.dur;
    if (k >= 1){ m.visible = false; continue; }
    m.scale.x = u.L * Math.min(1, u.t / 0.08); m.material.uniforms.uOpacity.value = 0.95 * (1 - Math.max(0, k - 0.5) * 2); u.glow.material.uniforms.uAlpha.value = 0.9 * (1 - k); }
}

/* ---------- Aura de anime (llamas que suben, pixeladas) ---------- */
const AURA7_FS = `uniform vec3 uColor; uniform vec3 uColor2; uniform float uAmt; uniform float uT; varying vec2 vUv;
float h7(float x){ return fract(sin(x * 91.7) * 43758.5453); }
void main(){
  float c = floor(vUv.x * 22.0), y = vUv.y;
  float top = 0.3 + 0.7 * h7(c * 1.7 + floor(uT * 10.0) * 3.1);
  float band = step(0.45, fract(y * 4.0 - uT * 3.0 + h7(c)));
  float a = (1.0 - smoothstep(top - 0.3, top, y)) * (0.35 + 0.65 * band) * uAmt * smoothstep(0.0, 0.08, y);
  vec3 col = mix(uColor2, uColor, smoothstep(0.0, 0.6, y));
  gl_FragColor = vec4(col * a, 1.0); }`;
const auraGeo7 = new THREE.CylinderGeometry(0.42, 0.7, 2.6, 22, 1, true); auraGeo7.translate(0, 1.3, 0);
const aura7 = [0, 1].map(i => { const m = new THREE.Mesh(auraGeo7, new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color() }, uColor2: { value: new THREE.Color() }, uAmt: { value: 0 }, uT: { value: 0 }, uEmissive: { value: 1 }, uOpacity: { value: 1 } },
  vertexShader: AD7_VS, fragmentShader: AURA7_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  m.frustumCulled = false; m.visible = false; hero.add(m); if (i) m.scale.set(0.72, 0.8, 0.72); return m; });

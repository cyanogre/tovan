'use strict';
/* ======================================================================
   EXPANSIÓN: capítulos 4 y 5, Castillo Infinito y rupturas de estilo
   ====================================================================== */
// los materiales del héroe no se corrompen (salvo con el estético «textura perdida»)
const heroGlitch = [];
hero.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m.uniforms && m.uniforms.uGlitch && !heroGlitch.includes(m)){ m.uniforms.uGlitch = { value: 0 }; heroGlitch.push(m); } }); });
const setHeroGlitch = v => heroGlitch.forEach(m => { m.uniforms.uGlitch.value = v; });

/* ---------- Capítulo 4: la Playa del Mundo Real (fotorrealismo) ---------- */
const renderGroup = new THREE.Group(); scene.add(renderGroup); renderGroup.visible = false;
renderGroup.userData.knot = new THREE.Object3D();
let renderEnv = null;
const WATER_Y = -0.35, SUN_DIR = new THREE.Vector3(-0.35, 0.5, -0.8).normalize();
const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function sandH(x, z){
  const r = Math.hypot(x, z), flat = sstep(6.6, 9.5, r);
  let h = 0;
  if (z < -8.5) h -= (-8.5 - z) * 0.16;
  const inland = Math.max(0, z - 7);
  h += inland * 0.1 + Math.sin(x * 0.33 + z * 0.21) * 0.45 * Math.min(1, inland / 6);
  h += (Math.sin(x * 1.3 + z * 0.4) * 0.035 + Math.sin(x * 0.52 - z * 0.9) * 0.07 + Math.sin(x * 0.17 + z * 0.13) * 0.15) * Math.min(1, Math.max(0, z + 12) / 4);
  return h * flat;
}
const SAND_H_GLSL = `
float sstep(float a, float b, float x){ float t = clamp((x - a) / (b - a), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
float sandH(float x, float z){
  float r = length(vec2(x, z)), fl = sstep(6.6, 9.5, r), h = 0.0;
  if (z < -8.5) h -= (-8.5 - z) * 0.16;
  float inland = max(0.0, z - 7.0);
  h += inland * 0.1 + sin(x * 0.33 + z * 0.21) * 0.45 * min(1.0, inland / 6.0);
  h += (sin(x * 1.3 + z * 0.4) * 0.035 + sin(x * 0.52 - z * 0.9) * 0.07 + sin(x * 0.17 + z * 0.13) * 0.15) * min(1.0, max(0.0, z + 12.0) / 4.0);
  return h * fl;
}`;
const CAUSTIC_GLSL = `
float caustic(vec2 uv, float t){
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0; vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 4; n++){ float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y), sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten), p.y / (cos(i.y + tt) / inten))); }
  c /= 4.0; c = 1.17 - pow(c, 1.4); return pow(abs(c), 8.0);
}`;
// texturas realistas: filtro suave, anisotropía y color sRGB (salvo los mapas de relieve)
function hiTex(nombre, srgb = true){ const t = texAsset(nombre, { suave: true }); t.anisotropy = 8; if (srgb) t.encoding = THREE.sRGBEncoding; return t; }
const sandTex = hiTex('mundo/playa/arena');
sandTex.repeat.set(40, 40);
const sandBump = hiTex('mundo/playa/arena-relieve', false);
sandBump.repeat.set(40, 40);
// arena: malla con dunas, zona húmeda y cáusticas bajo el agua
const causticUniforms = { uTime: { value: 0 } };
const sandMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: sandTex, bumpMap: sandBump, bumpScale: 0.02, roughness: 0.95, metalness: 0, vertexColors: true });
sandMat.onBeforeCompile = sh => {
  sh.uniforms.uTime = causticUniforms.uTime;
  sh.vertexShader = 'varying vec3 vWPos;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vWPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
  sh.fragmentShader = 'uniform float uTime; varying vec3 vWPos;\n' + CAUSTIC_GLSL + '\n' + sh.fragmentShader.replace('gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
    `float uw = clamp((${WATER_Y.toFixed(2)} - vWPos.y) / 0.25, 0.0, 1.0) * clamp(1.0 - (${WATER_Y.toFixed(2)} - vWPos.y) / 3.5, 0.0, 1.0);
  vec2 cuv = vWPos.xz * 0.22;
  vec3 cau = vec3(caustic(cuv, uTime * 0.55), caustic(cuv + 0.004, uTime * 0.55), caustic(cuv + 0.008, uTime * 0.55));
  outgoingLight = mix(outgoingLight, outgoingLight * vec3(0.55, 0.85, 0.9), uw * 0.7) + cau * uw * 0.55;
  gl_FragColor = vec4( outgoingLight, diffuseColor.a );`);
};
{ const geo = new THREE.PlaneGeometry(220, 220, 240, 240); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++){ const x = pos.getX(i), z = pos.getZ(i), h = sandH(x, z); pos.setY(i, h);
    const wet = sstep(WATER_Y + 0.35, WATER_Y - 0.05, h), dark = 1 - wet * 0.38; col[i * 3] = dark * 1.0; col[i * 3 + 1] = dark * 0.97; col[i * 3 + 2] = dark * (0.95 + wet * 0.05); }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3)); geo.computeVertexNormals();
  const sand = new THREE.Mesh(geo, sandMat); sand.receiveShadow = true; renderGroup.add(sand); }
// agua: olas, profundidad, fresnel, brillo del sol y espuma
const waterMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uTime: causticUniforms.uTime, uSun: { value: SUN_DIR }, uCam: { value: new THREE.Vector3() } },
  vertexShader: `uniform float uTime; varying vec3 vW; varying vec3 vN;
    void main(){ vec3 p = position; vec4 w = modelMatrix * vec4(p, 1.0);
      float a1 = 0.05, a2 = 0.03, a3 = 0.018;
      float f1 = w.x * 0.18 + w.z * 0.42 + uTime * 1.1, f2 = w.x * -0.5 + w.z * 0.7 + uTime * 1.7, f3 = w.x * 1.3 + w.z * 1.1 + uTime * 2.6;
      w.y += a1 * sin(f1) + a2 * sin(f2) + a3 * sin(f3);
      vec3 n = normalize(vec3(-(a1 * 0.18 * cos(f1) - a2 * 0.5 * cos(f2) + a3 * 1.3 * cos(f3)), 1.0, -(a1 * 0.42 * cos(f1) + a2 * 0.7 * cos(f2) + a3 * 1.1 * cos(f3))));
      vW = w.xyz; vN = n; gl_Position = projectionMatrix * viewMatrix * w; }`,
  fragmentShader: `uniform float uTime; uniform vec3 uSun; uniform vec3 uCam; varying vec3 vW; varying vec3 vN;
    ${SAND_H_GLSL}
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
    vec3 sky(vec3 d){ float h = max(d.y, 0.0); vec3 c = mix(vec3(0.72, 0.84, 0.95), vec3(0.16, 0.4, 0.82), pow(h, 0.5)); return c; }
    void main(){
      float depth = max(0.0, ${WATER_Y.toFixed(2)} - sandH(vW.x, vW.z));
      vec3 V = normalize(uCam - vW);
      vec3 n = normalize(vN + vec3(vnoise(vW.xz * 3.0 + uTime * 0.6) - 0.5, 0.0, vnoise(vW.zx * 3.0 - uTime * 0.5) - 0.5) * 0.18);
      float fres = 0.02 + 0.98 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
      vec3 shallow = vec3(0.35, 0.86, 0.82), mid = vec3(0.06, 0.55, 0.66), deep = vec3(0.02, 0.2, 0.36);
      vec3 body = mix(shallow, mid, smoothstep(0.0, 1.2, depth)); body = mix(body, deep, smoothstep(1.2, 6.0, depth));
      vec3 R = reflect(-V, n); vec3 refl = sky(R);
      float spec = pow(max(dot(R, uSun), 0.0), 350.0) * 6.0 + pow(max(dot(R, uSun), 0.0), 40.0) * 0.25;
      vec3 col = mix(body, refl, fres * 0.85) + vec3(1.0, 0.95, 0.85) * spec;
      float wash = 0.1 + 0.07 * sin(uTime * 0.9) + 0.05 * sin(uTime * 2.3 + vW.x * 0.6);
      float foam = smoothstep(wash, wash - 0.08, depth) * smoothstep(0.35, 0.75, vnoise(vW.xz * 4.0 + vec2(uTime * 0.4, 0.0)) + 0.35);
      foam += smoothstep(0.02, 0.0, depth) * 0.6;
      col = mix(col, vec3(0.97, 0.98, 1.0), clamp(foam, 0.0, 1.0));
      float alpha = mix(0.28, 0.96, smoothstep(0.0, 1.6, depth)); alpha = max(alpha, foam * 0.9); alpha = max(alpha, fres * 0.9);
      float far = smoothstep(60.0, 240.0, length(vW.xz)); col = mix(col, vec3(0.7, 0.82, 0.92), far);
      gl_FragColor = vec4(col, alpha);
    }`
});
{ const w = new THREE.Mesh(new THREE.PlaneGeometry(700, 500, 160, 120), waterMat); w.rotation.x = -Math.PI / 2; w.position.set(0, WATER_Y, -255); renderGroup.add(w); }
// cielo fotorrealista con sol y nubes
const beachSkyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: { uSun: { value: SUN_DIR } },
  vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: `uniform vec3 uSun; varying vec3 vD;
    void main(){ vec3 d = normalize(vD); float h = max(d.y, 0.0);
      vec3 c = mix(vec3(0.74, 0.85, 0.95), vec3(0.14, 0.38, 0.8), pow(h, 0.45));
      float s = max(dot(d, uSun), 0.0); c += vec3(1.0, 0.92, 0.75) * (pow(s, 900.0) * 9.0 + pow(s, 12.0) * 0.3 + pow(s, 3.0) * 0.08);
      if (d.y < 0.0) c = mix(vec3(0.7, 0.82, 0.92), vec3(0.08, 0.3, 0.46), min(1.0, -d.y * 5.0));
      gl_FragColor = vec4(c, 1.0); }`
});
const beachSky = new THREE.Mesh(new THREE.SphereGeometry(380, 48, 24), beachSkyMat); beachSky.frustumCulled = false; renderGroup.add(beachSky);
const cloudTex = hiTex('mundo/playa/nubes');
const clouds = [];
for (let i = 0; i < 9; i++){ const m = new THREE.Mesh(new THREE.PlaneGeometry(90 + Math.random() * 60, 30 + Math.random() * 20), new THREE.MeshBasicMaterial({ map: cloudTex, transparent: true, depthWrite: false, opacity: 0.85, fog: false }));
  const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4; m.position.set(Math.cos(a) * 260, 50 + Math.random() * 60, Math.sin(a) * 260); m.lookAt(0, m.position.y * 0.4, 0); renderGroup.add(m); clouds.push(m); }
// palmeras
const barkTex = hiTex('mundo/playa/palmera-tronco');
barkTex.repeat.set(2, 6);
const leafTex = hiTex('mundo/playa/palmera-hoja');
const barkMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.9 });
const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.7 });
const leafDepth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: leafTex, alphaTest: 0.45 });
const coconutMat = new THREE.MeshStandardMaterial({ color: 0x5a4020, roughness: 0.6 });
function palm(x, z, s, lean, dir){
  const g = new THREE.Group(); g.position.set(x, sandH(x, z) - 0.1, z); g.rotation.y = dir; g.scale.setScalar(s); renderGroup.add(g);
  let px_ = 0, py = 0, prev = new THREE.Vector3();
  const segs = 14, H = 7;
  for (let i = 0; i < segs; i++){ const t = i / segs, t2 = (i + 1) / segs;
    const a = new THREE.Vector3(Math.pow(t, 2) * lean, t * H, 0), b = new THREE.Vector3(Math.pow(t2, 2) * lean, t2 * H, 0);
    const r = 0.22 - t * 0.08; const seg = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r, a.distanceTo(b) * 1.05, 14), barkMat);
    seg.position.copy(a).add(b).multiplyScalar(0.5); seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize()); seg.castShadow = seg.receiveShadow = true; g.add(seg); prev = b; }
  const top = prev;
  for (let i = 0; i < 12; i++){ const geo = new THREE.PlaneGeometry(1.1, 4.4, 2, 12); const pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++){ const y = pos.getY(k) + 2.2; pos.setZ(k, -y * y * 0.09); pos.setX(k, pos.getX(k) * (1 - Math.abs(pos.getX(k)) * 0.2)); }
    geo.translate(0, 2.2, 0); geo.computeVertexNormals();
    const f = new THREE.Mesh(geo, leafMat); f.customDepthMaterial = leafDepth; f.castShadow = true; f.position.copy(top);
    f.rotation.set(0, i / 12 * Math.PI * 2 + Math.random() * 0.3, 0); f.rotateX(-0.95 - Math.random() * 0.5); g.add(f); }
  for (let i = 0; i < 4; i++){ const c = new THREE.Mesh(new THREE.SphereGeometry(0.2, 18, 14), coconutMat); c.position.set(top.x + Math.cos(i * 1.6) * 0.25, top.y - 0.3, top.z + Math.sin(i * 1.6) * 0.25); c.castShadow = true; g.add(c); }
  return g;
}
[[-9.5, 3, 1.05, 1.8, 0.4], [-12, 8, 1.2, 2.4, 0.9], [10, 4.5, 1.1, 2.1, 2.6], [13.5, 10, 1.25, 1.6, 2.2], [-4, 12, 1.0, 1.4, -0.4], [6, 13, 1.15, 2.5, 3.4], [-17, 1, 1.3, 2.8, 0.2], [18, 2, 1.1, 2.2, 2.9]]
  .forEach(([x, z, s, l, d]) => palm(x, z, s, l, d));
// rocas: ruido coherente por posición y normales suavizadas (sin grietas en las costuras)
const rockTex = hiTex('mundo/playa/roca');
rockTex.repeat.set(2, 2);
const rockMat = new THREE.MeshStandardMaterial({ map: rockTex, roughness: 0.88, bumpMap: sandBump, bumpScale: 0.05 });
const rockNoise = (x, y, z, s) => Math.sin(x * 2.1 + s) * Math.sin(y * 1.7 + s * 1.3) * 0.5 + Math.sin(x * 4.3 + z * 3.1 + s) * 0.18 + Math.sin(y * 5.7 + z * 4.9 + s) * 0.08 + Math.sin(z * 1.3 + s * 2.1) * 0.3;
function smoothByPos(geo){
  const pos = geo.attributes.position, nrm = geo.attributes.normal, groups = new Map();
  for (let i = 0; i < pos.count; i++){ const k = pos.getX(i).toFixed(4) + ',' + pos.getY(i).toFixed(4) + ',' + pos.getZ(i).toFixed(4);
    let a = groups.get(k); if (!a){ a = [0, 0, 0, []]; groups.set(k, a); } a[0] += nrm.getX(i); a[1] += nrm.getY(i); a[2] += nrm.getZ(i); a[3].push(i); }
  for (const a of groups.values()){ const l = Math.hypot(a[0], a[1], a[2]) || 1; for (const i of a[3]) nrm.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  nrm.needsUpdate = true;
}
function makeRock(x, z, s, seed){
  const geo = new THREE.IcosahedronGeometry(1, s < 0.3 ? 1 : 3), pos = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++){ v.set(pos.getX(i), pos.getY(i), pos.getZ(i)); v.multiplyScalar(1 + rockNoise(v.x, v.y, v.z, seed) * 0.28);
    v.y *= v.y > 0 ? 0.62 : 0.4; pos.setXYZ(i, v.x * (1 + (seed % 3) * 0.12), v.y, v.z); }
  geo.computeVertexNormals(); smoothByPos(geo);
  const m = new THREE.Mesh(geo, rockMat); m.position.set(x, sandH(x, z) + 0.05 * s, z); m.scale.setScalar(s); m.rotation.y = seed; m.castShadow = m.receiveShadow = true; renderGroup.add(m);
}
[[-9, -9.5, 1.3], [-10.5, -8.3, 0.8], [11, -10, 1.6], [9.3, -8.6, 0.7], [-14, -6, 1.1], [15, -5, 0.9], [2.5, -12.5, 0.9]].forEach(([x, z, s], i) => makeRock(x, z, s, i * 1.7 + 0.4));
for (let i = 0; i < 26; i++){ const a = i * 2.39, r = 8 + (i * 37 % 13); makeRock(Math.cos(a) * r, Math.sin(a) * r - 1, 0.08 + (i % 5) * 0.035, i * 3.1); }
// hierba de duna (instanciada)
{ const blade = new THREE.PlaneGeometry(0.06, 0.7, 1, 3); blade.translate(0, 0.35, 0); const bp = blade.attributes.position; for (let i = 0; i < bp.count; i++){ const y = bp.getY(i); bp.setX(i, bp.getX(i) * (1 - y / 0.75)); bp.setZ(i, y * y * 0.25); }
  blade.computeVertexNormals();
  const gm = new THREE.MeshStandardMaterial({ color: 0x9aa860, roughness: 0.8, side: THREE.DoubleSide });
  const N = 2600, inst = new THREE.InstancedMesh(blade, gm, N), M4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(), p = new THREE.Vector3();
  let k = 0; while (k < N){ const x = (Math.random() - 0.5) * 60, z = 9 + Math.random() * 22; if (Math.random() > 0.35 + Math.sin(x * 0.4) * 0.3) continue;
    for (let c = 0; c < 8 && k < N; c++, k++){ const bx = x + (Math.random() - 0.5) * 0.8, bz = z + (Math.random() - 0.5) * 0.8;
      p.set(bx, sandH(bx, bz), bz); e.set((Math.random() - 0.5) * 0.4, Math.random() * 6, (Math.random() - 0.5) * 0.4); q.setFromEuler(e); const s = 0.6 + Math.random() * 0.9; sc.set(s, s, s); M4.compose(p, q, sc); inst.setMatrixAt(k, M4);
      inst.setColorAt && inst.setColorAt(k, new THREE.Color().setHSL(0.17 + Math.random() * 0.05, 0.35, 0.35 + Math.random() * 0.2)); } }
  inst.castShadow = true; renderGroup.add(inst); }
// sombrilla, toalla y castillo de arena
{ const stripe = hiTex('mundo/playa/sombrilla');
  const um = new THREE.Group(); um.position.set(8.2, sandH(8.2, 7), 7); um.rotation.z = 0.12; renderGroup.add(um);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.6, 12), new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.8, roughness: 0.3 })); pole.position.y = 1.3; pole.castShadow = true; um.add(pole);
  const can = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.55, 32, 1, true), new THREE.MeshStandardMaterial({ map: stripe, side: THREE.DoubleSide, roughness: 0.8 })); can.position.y = 2.5; can.castShadow = true; um.add(can);
  const towelTex = hiTex('mundo/playa/toalla');
  const towel = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.1, 8, 8), new THREE.MeshStandardMaterial({ map: towelTex, roughness: 1 })); towel.rotation.x = -Math.PI / 2; towel.rotation.z = 0.4;
  towel.position.set(7.4, sandH(7.4, 8.4) + 0.02, 8.4); towel.receiveShadow = true; renderGroup.add(towel);
  const castle = new THREE.Group(); castle.position.set(-7.5, 0, -7.2); renderGroup.add(castle);
  const cm = new THREE.MeshStandardMaterial({ map: sandTex, color: 0xcdb48a, roughness: 1 });
  for (const [x, z, r, h] of [[0, 0, 0.45, 0.6], [0.7, 0.2, 0.25, 0.8], [-0.6, 0.3, 0.25, 0.8], [0.1, -0.6, 0.25, 0.7]]){ const t = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r, h, 24), cm); t.position.set(x, sandH(-7.5 + x, -7.2 + z) + h / 2, z); t.castShadow = true; castle.add(t);
    const c = new THREE.Mesh(new THREE.ConeGeometry(r * 0.9, h * 0.5, 24), cm); c.position.set(x, t.position.y + h * 0.75, z); c.castShadow = true; castle.add(c); } }
// luz del sol
const sunL = new THREE.DirectionalLight(0xfff1dc, 2.1); sunL.position.copy(SUN_DIR).multiplyScalar(40); sunL.target.position.set(0, 0, 0);
sunL.castShadow = true; sunL.shadow.mapSize.set(2048, 2048); sunL.shadow.bias = -0.0005; sunL.shadow.normalBias = 0.02;
Object.assign(sunL.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: 1, far: 90 }); renderGroup.add(sunL); renderGroup.add(sunL.target);
renderGroup.add(new THREE.HemisphereLight(0xbfdcff, 0xd8c29a, 0.75));
const beachFog = new THREE.FogExp2(0xbcd6ea, 0.0065);
function updateBeach(dt){ causticUniforms.uTime.value += dt; waterMat.uniforms.uCam.value.copy(camera.position); beachSky.position.copy(camera.position); }
function buildEnv(){
  if (renderEnv) return;
  // entorno para reflejos: cielo arriba, arena abajo y el sol hacia el mar (sin generadores frágiles)
  const face = kind => assetCanvas('mundo/playa/entorno-' + kind);
  const cube = new THREE.CubeTexture([face('lado'), face('lado'), face('arriba'), face('abajo'), face('lado'), face('sol')]);
  cube.encoding = THREE.sRGBEncoding; cube.needsUpdate = true; renderEnv = cube;
  [coconutMat].forEach(m => { m.envMap = renderEnv; m.envMapIntensity = 0.5; m.needsUpdate = true; });
}
let realOn = false, realPrev = null;
function setRealMode(on){
  if (on === realOn) return; realOn = on;
  if (on){
    buildEnv(); realPrev = [shared.uSnap.value, shared.uAffine.value, shared.uDither.value, resIdx];
    shared.uSnap.value = 0; shared.uAffine.value = 0; shared.uDither.value = 0; resIdx = 2; resize();
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.85; renderer.outputEncoding = THREE.sRGBEncoding;
    hero.traverse(o => { if (o.isMesh) o.castShadow = true; });
    scene.traverse(o => { if (o.material && o.material.isMeshStandardMaterial) o.material.needsUpdate = true; });
    document.body.classList.add('realmode');
  } else {
    [shared.uSnap.value, shared.uAffine.value, shared.uDither.value, resIdx] = realPrev || [1, 1, 1, 0]; resize();
    renderer.shadowMap.enabled = false; renderer.toneMapping = THREE.NoToneMapping; renderer.outputEncoding = THREE.LinearEncoding;
    document.body.classList.remove('realmode');
  }
}

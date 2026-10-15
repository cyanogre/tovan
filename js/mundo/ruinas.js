'use strict';
/* ---------- Escenario ---------- */
const ground = mesh(scaleUV(new THREE.PlaneGeometry(120, 120, 40, 40), 40, 40), makeMat(0xffffff, { map: groundTex }));
ground.rotation.x = -Math.PI / 2;
const rune = mesh(new THREE.CircleGeometry(2.2, 16), M.rune, 0, 0.012, 0);
rune.rotation.x = -Math.PI / 2;

const skyMat = new THREE.ShaderMaterial({
  uniforms: {
    uDither: shared.uDither,
    uTop: { value: new THREE.Color(0x14123a) }, uMid: { value: new THREE.Color(0x5b3a78) }, uHor: { value: new THREE.Color(0xe0836b) },
    uMoon: { value: new THREE.Vector3(-0.45, 0.32, -0.83).normalize() }, uMoonOn: { value: 1 }, uStars: { value: 1 }
  },
  vertexShader: `varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uHor; uniform vec3 uMoon; uniform float uDither; uniform float uMoonOn; uniform float uStars;
    varying vec3 vDir;
    ${DITHER_GLSL}
    float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
    void main(){
      vec3 d = normalize(vDir); float h = d.y;
      vec3 c = mix(uHor, uMid, smoothstep(0.0, 0.22, h));
      c = mix(c, uTop, smoothstep(0.18, 0.7, h));
      if (h < 0.0) c = mix(uHor, uMid * 0.5, smoothstep(0.0, -0.25, h));
      float m = dot(d, uMoon);
      c += vec3(0.9, 0.85, 1.0) * smoothstep(0.975, 1.0, m) * 0.22 * uMoonOn;
      if (uMoonOn > 0.5 && m > 0.9985) c = vec3(0.96, 0.93, 0.84) - step(0.99935, m) * step(hash(floor(d * 300.0)), 0.3) * 0.08;
      float s = step(0.9965, hash(floor(d * 150.0))) * smoothstep(0.15, 0.55, h);
      c += s * 0.8 * uStars;
      if (uDither > 0.5) { float b = bayer4(gl_FragCoord.xy); c += (b - 0.5) / 22.0; c = floor(c * 31.0 + 0.5) / 31.0; }
      gl_FragColor = vec4(c, 1.0);
    }`,
  side: THREE.BackSide, depthWrite: false
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 16, 10), skyMat);
sky.frustumCulled = false; sky.renderOrder = -1; scene.add(sky);

for (let i = 0; i < 22; i++){
  const a = i / 22 * Math.PI * 2 + rnd() * 0.2, r = 48 + rnd() * 14, h = 7 + rnd() * 12;
  const m = mesh(new THREE.ConeGeometry(5 + rnd() * 6, h, 5), M.mount, Math.cos(a) * r, h / 2 - 1.5, Math.sin(a) * r);
  m.rotation.y = rnd() * 6;
}

const __ruinsStart = scene.children.length;
// columnas en ruinas
const pillarH = [3.2, 2.1, 3.2, 1.2, 3.2, 2.6, 0.8, 3.2, 1.8];
pillarH.forEach((h, i) => {
  const a = i / pillarH.length * Math.PI * 2 + 0.2, r = 7.2;
  const g = new THREE.Group(); g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); g.rotation.y = rnd() * 3; scene.add(g);
  mesh(scaleUV(B(0.95, 0.28, 0.95), 1, 0.3), M.stone, 0, 0.14, 0, g);
  mesh(scaleUV(C(0.33, 0.37, h, 8), 3, h * 1.1), M.stone, 0, 0.28 + h / 2, 0, g);
  if (h > 3){ mesh(scaleUV(B(0.9, 0.24, 0.9), 1, 0.3), M.stone, 0, 0.28 + h + 0.12, 0, g); }
  else { const chunk = mesh(new THREE.IcosahedronGeometry(0.28, 0), M.rock, 0.5, 0.2, 0.3, g); chunk.scale.set(1.2, 0.7, 1); }
});
// columna caída
{
  const fallen = mesh(scaleUV(C(0.33, 0.33, 2.6, 8), 3, 3), M.stone, 4.2, 0.33, 3.6);
  fallen.rotation.set(0, 0.7, Math.PI / 2);
}
for (let i = 0; i < 14; i++){
  const a = rnd() * Math.PI * 2, r = 4.5 + rnd() * 5;
  const m = mesh(new THREE.IcosahedronGeometry(0.2 + rnd() * 0.35, 0), M.rock, Math.cos(a) * r, 0.08, Math.sin(a) * r);
  m.scale.set(1 + rnd() * 0.6, 0.5 + rnd() * 0.5, 1 + rnd() * 0.4); m.rotation.y = rnd() * 6;
}
const tuftGeo = new THREE.PlaneGeometry(0.6, 0.4); tuftGeo.translate(0, 0.2, 0);
for (let i = 0; i < 46; i++){
  const a = rnd() * Math.PI * 2, r = 2.8 + rnd() * 6.5;
  const g = new THREE.Group(); g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); g.rotation.y = rnd() * 3; scene.add(g);
  mesh(tuftGeo, M.grass, 0, 0, 0, g); mesh(tuftGeo, M.grass, 0, 0, 0, g).rotation.y = Math.PI / 2;
}

const __ruinsEnd = scene.children.length;
// brasero
const BRAZ = new THREE.Vector3(-2.6, 0, -2.0);
const braz = new THREE.Group(); braz.position.copy(BRAZ); scene.add(braz);
mesh(scaleUV(C(0.2, 0.28, 0.8, 6), 2, 1), M.stone, 0, 0.4, 0, braz);
mesh(C(0.45, 0.22, 0.3, 6), M.iron, 0, 0.95, 0, braz);
const fires = [[0.27, 0.6, 0xff5a1a], [0.17, 0.48, 0xffb43a], [0.08, 0.3, 0xfff1b0]].map(([r, h, c], i) => {
  const m = mesh(new THREE.ConeGeometry(r, h, 5), makeMat(c, { emissive: 1 }), 0, 1.08 + h / 2, 0, braz);
  m.userData = { h, i }; return m;
});
const emberMat = makeMat(0xffb04a, { emissive: 1 });
const embers = Array.from({ length: 8 }, () => {
  const m = mesh(B(0.04, 0.04, 0.04), emberMat, 0, 0, 0, braz);
  m.userData = { life: rnd(), sx: (rnd() - 0.5) * 0.4, sz: (rnd() - 0.5) * 0.4 }; return m;
});

// cristales flotantes
const floatMat = makeMat(0xc9a8ff, { emissive: 1 });
const floaters = [[4.8, 2.4, -3.2], [-5.2, 2.9, 2.4], [1.6, 3.4, -6.0]].map(([x, y, z], i) => {
  const m = mesh(new THREE.OctahedronGeometry(0.3, 0), floatMat, x, y, z); m.scale.y = 1.8; m.userData = { y, i }; return m;
});

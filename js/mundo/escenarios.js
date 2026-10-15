'use strict';
/* ======================================================================
   MUNDO: escenarios, ambiente, oni y dragón
   ====================================================================== */
const tmpv = new THREE.Vector3(), tmpv2 = new THREE.Vector3();

/* ---------- Texturas de suelo por escenario ---------- */
const sakuraGroundTex = texAsset('mundo/santuario-suelo');
const snowGroundTex = texAsset('mundo/cumbre-suelo');

/* ---------- Grupos de atrezo ---------- */
const ruinsGroup = new THREE.Group(); scene.add(ruinsGroup);
scene.children.slice(__ruinsStart, __ruinsEnd).forEach(o => ruinsGroup.add(o));
floaters.forEach(f => ruinsGroup.add(f));
const sakuraGroup = new THREE.Group(); scene.add(sakuraGroup); sakuraGroup.visible = false;
const snowGroup = new THREE.Group(); scene.add(snowGroup); snowGroup.visible = false;

const Mw = {
  red: makeMat(0xc8302a), black: makeMat(0x1a1418), stoneL: makeMat(0x9a96a2), win: makeMat(0xffc070, { emissive: 1 }),
  bark: makeMat(0x4a2e2a), pink1: makeMat(0xf4a6c8, { emissive: 0.18 }), pink2: makeMat(0xffc8dc, { emissive: 0.18 }), pink3: makeMat(0xe888b0, { emissive: 0.15 }),
  roof: makeMat(0x2a1a26), wall: makeMat(0x8a2a2a), pine: makeMat(0x1f4a3a), snow: makeMat(0xeef4fa), ice: makeMat(0x9fe8ff, { emissive: 0.45 }), rockS: makeMat(0x8a94a6)
};
function torii(parent, x, z, rot, s = 1){
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; g.scale.setScalar(s); parent.add(g);
  for (const sx of [-1, 1]){ mesh(C(0.16, 0.19, 3.2, 8), Mw.red, 1.3 * sx, 1.6, 0, g); mesh(C(0.23, 0.23, 0.3, 8), Mw.black, 1.3 * sx, 0.15, 0, g); }
  mesh(B(4.0, 0.22, 0.42), Mw.black, 0, 3.32, 0, g); mesh(B(3.6, 0.18, 0.34), Mw.red, 0, 3.13, 0, g);
  for (const sx of [-1, 1]){ const t = mesh(B(0.5, 0.18, 0.42), Mw.black, 2.05 * sx, 3.38, 0, g); t.rotation.z = 0.25 * sx; }
  mesh(B(3.1, 0.16, 0.22), Mw.red, 0, 2.6, 0, g); mesh(B(0.2, 0.5, 0.2), Mw.black, 0, 2.86, 0, g);
  return g;
}
function toro(parent, x, z, s = 1){
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = rnd() * 3; parent.add(g);
  mesh(B(0.52, 0.14, 0.52), Mw.stoneL, 0, 0.07, 0, g); mesh(C(0.1, 0.13, 0.7, 6), Mw.stoneL, 0, 0.49, 0, g);
  mesh(B(0.46, 0.1, 0.46), Mw.stoneL, 0, 0.88, 0, g); mesh(B(0.34, 0.3, 0.34), Mw.stoneL, 0, 1.08, 0, g);
  mesh(B(0.2, 0.16, 0.36), Mw.win, 0, 1.08, 0, g); mesh(B(0.36, 0.16, 0.2), Mw.win, 0, 1.08, 0, g);
  const r = mesh(new THREE.ConeGeometry(0.44, 0.26, 4), Mw.stoneL, 0, 1.36, 0, g); r.rotation.y = Math.PI / 4;
  mesh(new THREE.IcosahedronGeometry(0.07, 0), Mw.stoneL, 0, 1.53, 0, g);
  return g;
}
function sakuraTree(parent, x, z, s){
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = rnd() * 6; parent.add(g);
  const t = mesh(C(0.14, 0.24, 2.0, 6), Mw.bark, 0, 1.0, 0, g); t.rotation.z = 0.12;
  for (let i = 0; i < 3; i++){ const b = mesh(C(0.05, 0.09, 1.1, 5), Mw.bark, 0, 1.8, 0, g); b.rotation.set(0.6 * Math.cos(i * 2.1), 0, 0.8 * Math.sin(i * 2.1)); }
  const P3 = [Mw.pink1, Mw.pink2, Mw.pink3];
  for (let i = 0; i < 7; i++){ const a = i / 7 * TAU, r = 0.5 + rnd() * 0.6;
    const f = mesh(new THREE.IcosahedronGeometry(0.6 + rnd() * 0.45, 0), P3[i % 3], Math.cos(a) * r, 2.3 + rnd() * 0.7, Math.sin(a) * r, g); f.scale.y = 0.75; }
  return g;
}
function pagoda(parent, x, z, s){
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); parent.add(g);
  for (let i = 0; i < 4; i++){ const w = 3.2 - i * 0.6, y = i * 1.9;
    mesh(B(w, 1.3, w), Mw.wall, 0, y + 0.65, 0, g);
    const r = mesh(new THREE.ConeGeometry(w * 0.95, 0.7, 4), Mw.roof, 0, y + 1.55, 0, g); r.rotation.y = Math.PI / 4; }
  mesh(C(0.05, 0.05, 2.2, 4), Mw.black, 0, 8.6, 0, g);
  return g;
}
function pine(parent, x, z, s){
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); g.rotation.y = rnd() * 6; parent.add(g);
  mesh(C(0.1, 0.15, 0.8, 5), Mw.bark, 0, 0.4, 0, g);
  for (let i = 0; i < 3; i++){ const r = 1.05 - i * 0.28, y = 0.95 + i * 0.75;
    mesh(new THREE.ConeGeometry(r, 1.1, 6), Mw.pine, 0, y, 0, g); mesh(new THREE.ConeGeometry(r * 0.55, 0.45, 6), Mw.snow, 0, y + 0.38, 0, g); }
  return g;
}
// Santuario de los Cerezos
torii(sakuraGroup, 0, -8.8, 0, 1.25);
torii(sakuraGroup, Math.sin(2.3) * 8.6, Math.cos(2.3) * 8.6, 2.3 + Math.PI, 0.9);
torii(sakuraGroup, Math.sin(-2.3) * 8.6, Math.cos(-2.3) * 8.6, -2.3 + Math.PI, 0.9);
for (let i = 0; i < 10; i++){ const a = i / 10 * TAU + 0.31; toro(sakuraGroup, Math.cos(a) * 7.1, Math.sin(a) * 7.1, 1.1); }
for (let i = 0; i < 11; i++){ const a = i / 11 * TAU + rnd() * 0.3, r = 9.5 + rnd() * 3.5; sakuraTree(sakuraGroup, Math.cos(a) * r, Math.sin(a) * r, 1 + rnd() * 0.5); }
pagoda(sakuraGroup, -6, -24, 1.3); pagoda(sakuraGroup, 20, -14, 0.9);
for (let i = 0; i < 26; i++){ const a = rnd() * TAU, r = 2.8 + rnd() * 6.5;
  const g = new THREE.Group(); g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r); g.rotation.y = rnd() * 3; sakuraGroup.add(g);
  mesh(tuftGeo, M.grass, 0, 0, 0, g); mesh(tuftGeo, M.grass, 0, 0, 0, g).rotation.y = Math.PI / 2; }
// Cumbre Nevada
for (let i = 0; i < 20; i++){ const a = i / 20 * TAU + rnd() * 0.2, r = 8.6 + rnd() * 5; pine(snowGroup, Math.cos(a) * r, Math.sin(a) * r, 1 + rnd() * 0.7); }
for (let i = 0; i < 9; i++){ const a = i / 9 * TAU + 0.15;
  const c = mesh(new THREE.OctahedronGeometry(0.35, 0), Mw.ice, Math.cos(a) * 7.2, 0.7, Math.sin(a) * 7.2, snowGroup); c.scale.set(1, 2.4 + rnd(), 1); c.rotation.set(rnd() * 0.3, rnd() * 3, rnd() * 0.3); }
for (let i = 0; i < 12; i++){ const a = rnd() * TAU, r = 4.6 + rnd() * 4.5;
  const m = mesh(new THREE.IcosahedronGeometry(0.25 + rnd() * 0.35, 0), Mw.rockS, Math.cos(a) * r, 0.1, Math.sin(a) * r, snowGroup);
  m.scale.set(1 + rnd() * 0.5, 0.6 + rnd() * 0.4, 1 + rnd() * 0.4); mesh(new THREE.IcosahedronGeometry(1, 0), Mw.snow, 0, 0.55, 0, m).scale.set(0.9, 0.35, 0.9); }
{ const h = new THREE.Group(); h.position.set(6.6, 0, -6.2); h.rotation.y = -0.8; snowGroup.add(h);
  mesh(B(0.9, 0.2, 0.9), Mw.rockS, 0, 0.1, 0, h); mesh(B(0.7, 0.8, 0.6), Mw.wall, 0, 0.6, 0, h);
  const r = mesh(new THREE.ConeGeometry(0.75, 0.45, 4), Mw.roof, 0, 1.2, 0, h); r.rotation.y = Math.PI / 4;
  mesh(new THREE.ConeGeometry(0.62, 0.2, 4), Mw.snow, 0, 1.38, 0, h).rotation.y = Math.PI / 4; }
// brasero convertido en farol de piedra en el santuario
const toroBig = new THREE.Group(); braz.add(toroBig); toroBig.visible = false;
mesh(B(0.8, 0.18, 0.8), Mw.stoneL, 0, 0.09, 0, toroBig); mesh(C(0.16, 0.2, 0.75, 6), Mw.stoneL, 0, 0.55, 0, toroBig);
mesh(B(0.72, 0.12, 0.72), Mw.stoneL, 0, 0.98, 0, toroBig);
for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) mesh(B(0.07, 0.72, 0.07), Mw.stoneL, x, 1.4, z, toroBig);
{ const r = mesh(new THREE.ConeGeometry(0.7, 0.4, 4), Mw.stoneL, 0, 1.95, 0, toroBig); r.rotation.y = Math.PI / 4; }
const brazRuins = [braz.children[0], braz.children[1]];

/* ---------- Escenarios ---------- */
const BIOMES = [
  { id: 'ruinas', name: 'Ruinas del Ocaso', sub: 'Donde empezó todo', group: ruinsGroup, ground: groundTex,
    sky: [0x14123a, 0x5b3a78, 0xe0836b], moon: 1, fog: 0x2e2140, amb: 0x40386e, light: 0xf2b89a, mount: 0x2a1f3a, fire: [1.1, 0.55, 0.22],
    braz: 'ruins', amb_: null, music: 'battle', grass: 0x4a7a3a },
  { id: 'sakura', name: 'Santuario de los Cerezos', sub: 'Los pétalos no perdonan', group: sakuraGroup, ground: sakuraGroundTex,
    sky: [0x1a1030, 0x7a3a6a, 0xff9ab0], moon: 1, fog: 0x4a2548, amb: 0x503a6a, light: 0xffc0c8, mount: 0x3a1f40, fire: [1.1, 0.62, 0.35],
    braz: 'toro', amb_: 'petals', music: 'sakura', grass: 0x5a8a4a },
  { id: 'cumbre', name: 'Cumbre Nevada', sub: 'El frío también muerde', group: snowGroup, ground: snowGroundTex,
    sky: [0x1c2a4a, 0x5a7aa8, 0xd8e6f0], moon: 0, fog: 0x6f86a8, amb: 0x5a6a8a, light: 0xe8f0ff, mount: 0x8fa2bc, fire: [1.1, 0.6, 0.3],
    braz: 'ruins', amb_: 'snow', music: 'snow', grass: 0x4a7a3a }
];
let curBiome = 0;
const biomeOfWave = w => w >= FINAL_WAVE ? FINAL : [0, 1, 2, 6, 3, 4][Math.floor((w - 1) / 5) % 6];
const bossOfWave = w => ['boss', 'dragon', 'skeleton', 'star', 'teapot', 'error'][(Math.floor(w / 5) - 1) % 6];
function applyBiome(b){
  curBiome = b; const Bm = BIOMES[b];
  BIOMES.forEach((x, i) => { x.group.visible = i === b; });
  skyMat.uniforms.uTop.value.setHex(Bm.sky[0]); skyMat.uniforms.uMid.value.setHex(Bm.sky[1]); skyMat.uniforms.uHor.value.setHex(Bm.sky[2]);
  skyMat.uniforms.uMoonOn.value = Bm.moon; skyMat.uniforms.uStars.value = Bm.moon ? 1 : 0.3;
  shared.uFogCol.value.setHex(Bm.fog); shared.uAmb.value.setHex(Bm.amb); shared.uLightCol.value.setHex(Bm.light).multiplyScalar(0.8);
  M.mount.uniforms.uColor.value.setHex(Bm.mount);
  ground.material.uniforms.uMap.value = Bm.ground;
  brazRuins.forEach(m => { m.visible = Bm.braz === 'ruins'; }); toroBig.visible = Bm.braz === 'toro';
  ambMode = Bm.amb_; for (const p of ambP) p.visible = false;
  if (ambMode === 'petals'){ ambMat.uniforms.uColor.value.setHex(0xffb8d4); } else if (ambMode === 'snow'){ ambMat.uniforms.uColor.value.setHex(0xffffff); }
}
const fireRGB = () => BIOMES[curBiome].fire;

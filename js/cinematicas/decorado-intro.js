'use strict';
/* ======================================================================
   CINEMÁTICA DE INTRODUCCIÓN: del mundo real a las Ruinas
   ====================================================================== */

/* ---------- Texturas del mundo real ---------- */
const asphaltTex = texAsset('cinematica/asfalto');
const sidewalkTex = texAsset('cinematica/acera');
const winTexA = texAsset('cinematica/ventanas-a'), winTexB = texAsset('cinematica/ventanas-b'), winTexC = texAsset('cinematica/ventanas-c');
const signTex = texAsset('cinematica/cartel-antiguedades', { borde: true });
const uniformTex = texAsset('cinematica/uniforme');
const packTex = texAsset('cinematica/paquete');
const boxTex = texAsset('cinematica/caja');

/* ---------- Decorado: calle de noche ---------- */
const realGroup = new THREE.Group(); scene.add(realGroup); realGroup.visible = false;
const Mr = {
  side: makeMat(0xffffff, { map: sidewalkTex }), curb: makeMat(0x9a9ca6), line: makeMat(0xe8e0c0, { emissive: 0.3 }),
  wA: makeMat(0xffffff, { map: winTexA, emissive: 0.35 }), wB: makeMat(0xffffff, { map: winTexB, emissive: 0.35 }), wC: makeMat(0xffffff, { map: winTexC, emissive: 0.45 }),
  door: makeMat(0x4a2a1a), shopWin: makeMat(0xffc880, { emissive: 0.9 }), sign: makeMat(0xffffff, { map: signTex, emissive: 0.85 }),
  awnR: makeMat(0xb8302a), awnW: makeMat(0xeae4d6), pole: makeMat(0x2a2c34), lamp: makeMat(0xffe0a0, { emissive: 1 }),
  cone: makeMat(0xffd89a, { emissive: 1, opacity: 0.16 }), red: makeMat(0xd8322a), black: makeMat(0x16161c), tire: makeMat(0x1a1a1e),
  pack: makeMat(0xffffff, { map: packTex }), head: makeMat(0xfff4c0, { emissive: 1 }), bin: makeMat(0x3a5a4a), puddle: makeMat(0x1a2440, { emissive: 0.25 }),
  cat: makeMat(0x141418), catEye: makeMat(0xffe040, { emissive: 1 }), hyd: makeMat(0xc83a2a), wall: makeMat(0x6a5a5a)
};
mesh(B(60, 0.14, 3.2), Mr.side, 0, 0.07, -1.6, realGroup);
mesh(B(60, 0.16, 0.22), Mr.curb, 0, 0.08, 0.06, realGroup);
for (let x = -28; x < 30; x += 2.4) mesh(B(1.2, 0.02, 0.14), Mr.line, x, 0.011, 4.2, realGroup);
for (const [x, z, r] of [[2.4, 1.6, 0.7], [-3.2, 2.8, 0.9], [6.5, 3.4, 0.6]]){ const p = mesh(circleGeo, Mr.puddle, x, 0.012, z, realGroup); p.scale.set(r * 1.4, 1, r); }
// fachadas
const facades = [[-9, 5, 7, Mr.wB], [-4.6, 3.6, 5.5, Mr.wA], [0, 5.2, 4.2, Mr.wC], [4.8, 4.4, 8, Mr.wB], [9.6, 5, 6, Mr.wA], [-14, 5, 9, Mr.wA], [14.6, 5, 7.5, Mr.wC]];
for (const [x, w, h, m] of facades) mesh(scaleUV(B(w, h, 4), w / 2.2, h / 2.2), m, x, h / 2, -5.2, realGroup);
// anticuario
mesh(B(1.0, 2.0, 0.1), Mr.door, 0.35, 1.14, -3.18, realGroup);
mesh(B(0.5, 0.5, 0.04), Mr.shopWin, 0.35, 1.6, -3.12, realGroup);
mesh(B(0.07, 0.07, 0.05), Mr.lamp, 0.95, 1.24, -3.12, realGroup);                         // timbre
mesh(B(1.9, 1.3, 0.08), Mr.shopWin, -1.4, 1.2, -3.16, realGroup);                           // escaparate
for (let i = 0; i < 6; i++){ const a = mesh(B(0.34, 0.06, 0.9), i % 2 ? Mr.awnW : Mr.awnR, -2.2 + i * 0.34, 2.15, -2.75, realGroup); a.rotation.x = 0.35; }
mesh(B(3.6, 0.62, 0.1), Mr.sign, -0.4, 2.85, -3.14, realGroup);
// farola con cono de luz
mesh(C(0.06, 0.09, 4.1, 6), Mr.pole, -2.9, 2.05, -0.35, realGroup);
mesh(B(0.07, 0.07, 1.0), Mr.pole, -2.9, 4.05, 0.1, realGroup);
mesh(B(0.38, 0.14, 0.38), Mr.lamp, -2.9, 3.95, 0.55, realGroup);
{ const c = mesh(new THREE.ConeGeometry(1.7, 3.8, 10, 1, true), Mr.cone, -2.9, 1.98, 0.55, realGroup); c.material.side = THREE.DoubleSide; }
// moto de reparto
const scooter = new THREE.Group(); scooter.position.set(5.4, 0, 1.3); scooter.rotation.y = -0.35; realGroup.add(scooter);
mesh(B(0.42, 0.32, 1.25), Mr.red, 0, 0.42, 0, scooter); mesh(B(0.38, 0.12, 0.58), Mr.black, 0, 0.64, -0.2, scooter);
mesh(B(0.4, 0.6, 0.12), Mr.red, 0, 0.72, 0.58, scooter); mesh(C(0.035, 0.035, 0.7, 5), Mr.pole, 0, 0.95, 0.6, scooter);
mesh(B(0.62, 0.05, 0.05), Mr.pole, 0, 1.28, 0.62, scooter); mesh(B(0.16, 0.1, 0.06), Mr.head, 0, 1.08, 0.66, scooter);
for (const z of [-0.5, 0.52]){ const w = mesh(C(0.24, 0.24, 0.14, 10), Mr.tire, 0, 0.24, z, scooter); w.rotation.z = Math.PI / 2; }
mesh(B(0.56, 0.46, 0.5), Mr.pack, 0, 0.95, -0.42, scooter);
// papelera, boca de riego y el gato
mesh(C(0.3, 0.26, 0.9, 8), Mr.bin, -3.7, 0.59, -2.7, realGroup);
mesh(C(0.13, 0.15, 0.5, 6), Mr.hyd, 2.6, 0.39, -0.45, realGroup); mesh(C(0.16, 0.16, 0.08, 6), Mr.hyd, 2.6, 0.66, -0.45, realGroup);
const cat = new THREE.Group(); cat.position.set(-3.7, 1.04, -2.72); cat.rotation.y = 0.5; realGroup.add(cat);
mesh(B(0.26, 0.24, 0.4), Mr.cat, 0, 0.12, 0, cat);
const catHead = new THREE.Group(); catHead.position.set(0, 0.34, 0.14); cat.add(catHead);
mesh(B(0.24, 0.2, 0.2), Mr.cat, 0, 0, 0, catHead);
for (const s of [-1, 1]){ const e = mesh(new THREE.ConeGeometry(0.05, 0.12, 4), Mr.cat, 0.07 * s, 0.14, 0, catHead); e.rotation.z = -0.2 * s;
  mesh(B(0.05, 0.04, 0.02), Mr.catEye, 0.055 * s, 0.02, 0.105, catHead); }
const catTail = new THREE.Group(); catTail.position.set(0, 0.1, -0.2); cat.add(catTail);
mesh(B(0.05, 0.05, 0.4), Mr.cat, 0, 0, -0.2, catTail);
// horizonte de la ciudad
for (let i = 0; i < 26; i++){ const w = 3 + rnd() * 4, h = 8 + rnd() * 18, x = -40 + i * 3.2 + rnd(), z = -16 - rnd() * 16;
  mesh(scaleUV(B(w, h, 3), w / 2.5, h / 2.5), [Mr.wA, Mr.wB, Mr.wC][i % 3], x, h / 2, z, realGroup); }
for (let i = 0; i < 10; i++){ const w = 4 + rnd() * 4, h = 6 + rnd() * 10, x = -30 + i * 6.5, z = 14 + rnd() * 6;
  mesh(scaleUV(B(w, h, 3), w / 2.5, h / 2.5), [Mr.wB, Mr.wC][i % 2], x, h / 2, z, realGroup); }
const mountainsList = scene.children.filter(o => o.isMesh && o.material === M.mount);

/* ---------- Atrezo del reparto ---------- */
const csM = { box: makeMat(0xffffff, { map: boxTex }), glow: makeMat(0x9ff6ff, { emissive: 1 }), cap: makeMat(0xd8322a), capD: makeMat(0xa82420),
  logo: makeMat(0xffd23a, { emissive: 0.6 }), gold: makeMat(0xd9a441), crystal: makeMat(0x7ff5ff, { emissive: 1 }), ring: makeMat(0x9ff6ff, { emissive: 1, opacity: 0.75, side: THREE.DoubleSide }) };
const capG = new THREE.Group(); capG.position.set(0, 0.44, 0.02); P.neck.add(capG);
mesh(C(0.25, 0.28, 0.17, 10), csM.cap, 0, 0.08, 0, capG); mesh(C(0.04, 0.04, 0.03, 6), csM.capD, 0, 0.18, 0, capG);
{ const v = mesh(B(0.3, 0.03, 0.24), csM.capD, 0, 0.0, 0.3, capG); v.rotation.x = 0.12; }
mesh(B(0.09, 0.09, 0.02), csM.logo, 0, 0.09, 0.265, capG);
const packG = new THREE.Group(); packG.position.set(0, 0.34, -0.44); P.spine.add(packG);
mesh(B(0.66, 0.62, 0.44), Mr.pack, 0, 0, 0, packG);
for (const s of [-1, 1]) mesh(B(0.07, 0.62, 0.04), Mr.black, 0.2 * s, 0.05, 0.25, packG);
const boxG = new THREE.Group(); boxG.position.set(0, 0.1, 0.5); P.spine.add(boxG);
mesh(B(0.46, 0.3, 0.36), csM.box, 0, 0, 0, boxG);
const boxInner = mesh(B(0.4, 0.02, 0.3), csM.glow, 0, 0.14, 0, boxG); boxInner.visible = false;
const lid = new THREE.Group(); lid.position.set(0, 0.155, -0.18); boxG.add(lid);
mesh(B(0.47, 0.04, 0.37), csM.box, 0, 0, 0.18, lid);
const lanternProp = new THREE.Group(); scene.add(lanternProp); lanternProp.visible = false;
mesh(C(0.05, 0.03, 0.08, 6), csM.gold, 0, -0.14, 0, lanternProp);
for (let i = 0; i < 4; i++){ const a = i / 4 * TAU; mesh(B(0.015, 0.24, 0.015), csM.gold, Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08, lanternProp); }
mesh(C(0.03, 0.1, 0.04, 6), csM.gold, 0, 0.13, 0, lanternProp);
const lanternCrystal = mesh(new THREE.OctahedronGeometry(0.065, 0), csM.crystal, 0, 0, 0, lanternProp);
lanternProp.scale.setScalar(1.6);
const vortexG = new THREE.Group(); scene.add(vortexG); vortexG.visible = false;
const vRingsCs = [0.35, 1.0, 1.65, 2.3].map((y, i) => { const m = mesh(new THREE.TorusGeometry(1.1 + i * 0.12, 0.035, 4, 28), csM.ring, 0, y, 0, vortexG); m.rotation.x = Math.PI / 2; return m; });
const hairTop = P.neck.children.filter(o => o.isMesh && o.material === M.hair && o.geometry.type === 'ConeGeometry' && o.position.y > 0.5);

/* ---------- Vestuario ---------- */
const outfitHero = { pants: M.pants.uniforms.uColor.value.getHex(), boot: M.boot.uniforms.uColor.value.getHex(), glove: M.glove.uniforms.uColor.value.getHex(),
  gold: M.gold.uniforms.uColor.value.getHex(), scarf: M.scarf.uniforms.uColor.value.getHex() };
function outfitPart(part, delivery){
  if (part === 'cap'){ capG.visible = delivery; hairTop.forEach(h => { h.visible = !delivery; }); }
  if (part === 'shirt'){ for (const m of [M.coat, M.coatDS]) m.uniforms.uMap.value = delivery ? uniformTex : coatTex;
    P.tail.visible = !delivery; M.gold.uniforms.uColor.value.setHex(delivery ? 0xf2f2f2 : outfitHero.gold); }
  if (part === 'pack'){ packG.visible = delivery; staff.visible = !delivery; }
  if (part === 'legs'){ M.pants.uniforms.uColor.value.setHex(delivery ? 0x2b3a5c : outfitHero.pants); M.boot.uniforms.uColor.value.setHex(delivery ? 0xe8e8f0 : outfitHero.boot);
    M.glove.uniforms.uColor.value.setHex(delivery ? 0xe8b894 : outfitHero.glove); }
  if (part === 'scarf'){ M.scarf.uniforms.uColor.value.setHex(delivery ? 0xffd23a : outfitHero.scarf); P.scarf[0].visible = !delivery; }
}
const OUTFIT_PARTS = ['cap', 'shirt', 'pack', 'legs', 'scarf'];
function setOutfit(o){ for (const p of OUTFIT_PARTS) outfitPart(p, o === 'delivery'); if (o !== 'delivery') boxG.visible = false; }
setOutfit('hero');

/* ---------- Escenario de la cinemática ---------- */
let lampOverride = null, p2Override = null;
function setScene(mode){
  const real = mode === 'real', voidM = mode === 'void';
  if (!real && !voidM){
    realGroup.visible = false; ground.visible = true; rune.visible = true; braz.visible = true; blob.visible = true;
    mountainsList.forEach(m => { m.visible = true; }); lampOverride = null; p2Override = null; applyBiome(mode); return;
  }
  BIOMES.forEach(b => { b.group.visible = false; }); mountainsList.forEach(m => { m.visible = false; });
  rune.visible = false; braz.visible = false; realGroup.visible = real; ground.visible = real; blob.visible = real;
  for (const p of ambP) p.visible = false;
  if (real){
    ground.material.uniforms.uMap.value = asphaltTex;
    skyMat.uniforms.uTop.value.setHex(0x05070f); skyMat.uniforms.uMid.value.setHex(0x141a30); skyMat.uniforms.uHor.value.setHex(0x4a3a4a);
    skyMat.uniforms.uMoonOn.value = 0; skyMat.uniforms.uStars.value = 0.12;
    shared.uFogCol.value.setHex(0x121624); shared.uAmb.value.setHex(0x2c3452); shared.uLightCol.value.setHex(0x8a9ac8).multiplyScalar(0.45);
    ambMode = 'rain'; ambMat.uniforms.uColor.value.setHex(0xa8b8d8); lampOverride = { pos: new V3(-2.9, 3.8, 0.55), col: [1.25, 0.85, 0.5], range: 9 };
  } else {
    skyMat.uniforms.uTop.value.setHex(0x010108); skyMat.uniforms.uMid.value.setHex(0x06061a); skyMat.uniforms.uHor.value.setHex(0x1a1040);
    skyMat.uniforms.uMoonOn.value = 0; skyMat.uniforms.uStars.value = 1.8;
    shared.uFogCol.value.setHex(0x06061a); shared.uAmb.value.setHex(0x3a3a70); shared.uLightCol.value.setHex(0xc8d0ff).multiplyScalar(0.7);
    ambMode = null; lampOverride = { pos: new V3(0, 3.5, 2.5), col: [0.45, 0.55, 1.1], range: 9 };
  }
}

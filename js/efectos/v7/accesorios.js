'use strict';
/* ---------- Accesorios: se crean la primera vez y se encienden/apagan ---------- */
const ACC7 = {};
function acc7(id, on, parent, build){
  let g = ACC7[id];
  if (!on){ if (g && g.visible){ g.visible = false; g.userData.k = 0; } return null; }
  if (!g){ g = new THREE.Group(); g.userData.k = 0; build(g); ACC7[id] = g; }
  if (g.parent !== parent) parent.add(g);
  g.visible = true; return g;
}
function popK7(g, dt){ const u = g.userData; u.k = Math.min(1, (u.k || 0) + dt * 2.4); const k = u.k; return k >= 1 ? 1 : Math.max(0.01, 1 - Math.cos(k * Math.PI * 3) * (1 - k)); }
function hideAcc7(){ for (const k in ACC7){ ACC7[k].visible = false; ACC7[k].userData.k = 0; } }

function buildWing7(q, s){
  q.position.set(0.13 * s, -0.12, -0.02);
  for (let k = 0; k < 4; k++){ const len = 0.36 - k * 0.06, f = mesh(B(0.025, 0.07, len), k % 2 ? MA7.wingB : MA7.wingW, 0, 0.1 - k * 0.05, -len / 2 + 0.04, q); f.rotation.x = 0.55 + k * 0.14; }
}
function buildPaul7(q, s){
  q.position.set(0.05 * s, 0.1, 0);
  const d = mesh(new THREE.SphereGeometry(0.19, 8, 4, 0, TAU, 0, Math.PI / 2), MA7.iron, 0, 0, 0, q); d.scale.set(1.15, 0.9, 1.2);
  const rim = mesh(new THREE.TorusGeometry(0.2, 0.025, 4, 12), MA7.rivet, 0, 0, 0, q); rim.rotation.x = Math.PI / 2; rim.scale.set(1.15, 1.2, 1);
  for (let k = 0; k < 3; k++) mesh(B(0.045, 0.045, 0.045), MA7.rivet, 0.07 * (k - 1), 0.15, 0.13, q);
  const spk = mesh(new THREE.ConeGeometry(0.065, 0.3, 4), MA7.ironD, 0.05 * s, 0.26, 0, q); spk.rotation.z = -0.35 * s;
  const tier = mesh(new THREE.SphereGeometry(0.21, 8, 3, 0, TAU, 0, Math.PI / 2.4), MA7.iron, 0, -0.07, 0, q); tier.scale.set(1.2, 0.7, 1.25);
  q.userData.spk = spk; q.userData.tier = tier;
}
function spikeOut7(q, cx, cy, cz, n, rx, ry, rz, mat, back){
  for (let k = 0; k < n; k++){ const a = rnd() * TAU, b = rnd() * (back ? 1.1 : 1.4);
    t7a.set(Math.cos(a) * Math.sin(b), Math.sin(a) * Math.sin(b), (back ? -1 : 1) * Math.cos(b));
    const sp = mesh(new THREE.ConeGeometry(0.024, 0.22, 3), mat, cx + t7a.x * rx, cy + t7a.y * ry, cz + t7a.z * rz, q); sp.quaternion.setFromUnitVectors(UP7, t7a.normalize()); }
}
function buildCactus7(q){
  q.position.set(0, 0.36, -0.19);
  const pad = mesh(new THREE.IcosahedronGeometry(0.2, 1), MA7.cactus, 0, 0, 0, q); pad.scale.set(1.25, 1.4, 0.55);
  for (let k = 0; k < 3; k++){ const r = mesh(B(0.02, 0.5, 0.02), MA7.cactusD, (k - 1) * 0.11, 0, -0.1, q); }
  spikeOut7(q, 0, 0, -0.02, 16, 0.24, 0.27, 0.1, MA7.spine, true);
  for (const s of [-1, 1]) mesh(new THREE.OctahedronGeometry(0.065, 0), MA7.flower, 0.09 * s, 0.29, -0.02, q);
  mesh(new THREE.OctahedronGeometry(0.05, 0), MA7.gold, 0, 0.3, -0.03, q);
}
function buildCactusArm7(q, s){ q.position.set(0.04 * s, 0.02, 0); const p = mesh(new THREE.IcosahedronGeometry(0.12, 1), MA7.cactus, 0.06 * s, 0.05, 0, q); p.scale.set(0.8, 1.1, 0.9);
  spikeOut7(q, 0.06 * s, 0.05, 0, 8, 0.1, 0.13, 0.11, MA7.spine, false); }
function buildIce7(q, n, big){
  for (let k = 0; k < n; k++){ const h = (0.24 + rnd() * 0.2) * big;
    const c = new THREE.Group(); c.position.set((rnd() - 0.5) * 0.2 * big, 0, (rnd() - 0.5) * 0.16 * big); c.rotation.set((rnd() - 0.5) * 1.0, rnd() * 3, (rnd() - 0.5) * 1.0); q.add(c);
    mesh(C(0.05 * big, 0.065 * big, h, 6), MA7.ice, 0, h / 2, 0, c); mesh(new THREE.ConeGeometry(0.05 * big, 0.1 * big, 6), MA7.ice, 0, h + 0.05 * big, 0, c); }
}
function buildHeart7(q){ mesh(heartGeo7, MA7.stone, 0, 0, 0, q); const c = mesh(heartGeo7, MA7.core, 0, 0.03, 0, q); c.scale.set(0.55, 0.55, 1.25);
  for (let k = 0; k < 4; k++){ const cr = mesh(B(0.03, 0.18, 0.21), MA7.core, (k - 1.5) * 0.15, -0.05 + (k % 2) * 0.12, 0, q); cr.rotation.z = (k % 2 ? 0.6 : -0.5); cr.scale.y = 0.8; } }
function buildClover7(q){
  for (let k = 0; k < 4; k++){ const a = k / 4 * TAU, l = mesh(heartGeo7, MA7.clover, Math.sin(a) * 0.11, 0, Math.cos(a) * 0.11, q); l.scale.set(0.22, 0.22, 0.25); l.rotation.set(-Math.PI / 2, 0, a + Math.PI); }
  const st = mesh(B(0.025, 0.025, 0.16), MA7.cactusD, 0.05, -0.02, -0.12, q); st.rotation.y = 0.5;
}
function buildMono7(q){ q.position.set(0.085, 0.315, 0.228);
  mesh(new THREE.TorusGeometry(0.06, 0.016, 4, 10), MA7.gold, 0, 0, 0, q); mesh(new THREE.CircleGeometry(0.052, 10), MA7.lens, 0, 0, -0.004, q);
  const ch = mesh(B(0.012, 0.2, 0.012), MA7.gold, 0.055, -0.11, -0.01, q); ch.rotation.z = 0.45; }
function buildGG7(q, s){ mesh(B(0.25, 0.23, 0.21), MA7.gold, 0, -0.27, 0.01, q); mesh(B(0.08, 0.12, 0.09), MA7.gold, -0.09 * s, -0.23, 0.08, q); mesh(B(0.26, 0.04, 0.22), MA7.rivet, 0, -0.17, 0.01, q); }
function buildCup7(q){ q.position.set(0.02, -0.35, 0.13);
  mesh(C(0.085, 0.065, 0.24, 8), MA7.cupW, 0, 0, 0, q); mesh(C(0.088, 0.075, 0.08, 8), MA7.cupB, 0, -0.01, 0, q); mesh(C(0.09, 0.09, 0.04, 8), MA7.lid, 0, 0.135, 0, q);
  const top = new THREE.Object3D(); top.position.y = 0.17; q.add(top); q.userData.top = top; }
function buildMag7(q){ mesh(new THREE.TorusGeometry(0.17, 0.065, 6, 12, Math.PI), MA7.magR, 0, 0, 0, q);
  for (const s of [-1, 1]) mesh(B(0.135, 0.11, 0.135), MA7.magS, 0.17 * s, -0.045, 0, q); }
function buildCannon7(q){ q.position.set(-0.42, 0.68, -0.04);
  mesh(new THREE.IcosahedronGeometry(0.13, 1), MA7.glass, 0, 0, 0, q);
  const br = new THREE.Group(); br.position.set(0, 0.05, 0.05); q.add(br);
  const tube = mesh(C(0.06, 0.085, 0.56, 8), MA7.glass, 0, 0, 0.28, br); tube.rotation.x = Math.PI / 2;
  for (const z of [0.08, 0.32, 0.54]){ mesh(new THREE.TorusGeometry(0.08, 0.017, 4, 10), MA7.gold, 0, 0, z, br); }
  const mz = new THREE.Object3D(); mz.position.z = 0.6; br.add(mz); q.userData.muzzle = mz; q.userData.br = br; q.userData.kick = 0;
}
const phoMat7 = addMat7(0xff6a10, 0.95), phoMat7b = addMat7(0xffd040, 0.95);
function buildWings7(q, m1, m2){
  q.userData.w = [];
  for (const s of [-1, 1]){ const w = new THREE.Group(); w.position.x = 0.05 * s; q.add(w); w.scale.x = s; q.userData.w.push(w);
    for (let k = 0; k < 7; k++){ const len = 0.42 + k * 0.1 - (k > 4 ? (k - 4) * 0.22 : 0), g = new THREE.BoxGeometry(len, 0.075, 0.02); g.translate(len / 2, 0, 0);
      const f = addMesh7(g, k % 2 ? (m2 || phoMat7b) : (m1 || phoMat7), w); f.rotation.z = -0.45 + k * 0.26; } }
}
function buildBokken7(q){ q.position.set(-0.47, 0.06, 0.02); q.rotation.set(1.05, 0, 0.32);
  mesh(B(0.06, 1.0, 0.08), MA7.wood, 0, -0.45, 0, q); mesh(C(0.09, 0.09, 0.03, 8), MA7.woodD, 0, 0.07, 0, q); mesh(B(0.055, 0.24, 0.065), MA7.cloth, 0, 0.2, 0, q);
  for (let k = 0; k < 3; k++) mesh(B(0.064, 0.05, 0.03), MA7.woodD, 0, -0.18 - k * 0.11, 0.035, q); }
function buildMilk7(q){ mesh(B(0.2, 0.26, 0.2), MA7.milkP, 0, 0, 0, q); const t = mesh(B(0.2, 0.11, 0.11), MA7.milkW, 0, 0.15, 0, q); t.rotation.x = Math.PI / 4;
  mesh(B(0.07, 0.07, 0.02), MA7.berry, 0, 0.02, 0.105, q); mesh(B(0.07, 0.07, 0.02), MA7.berry, 0, 0.02, -0.105, q); const st = mesh(C(0.014, 0.014, 0.22, 4), MA7.milkW, 0.05, 0.25, 0, q); st.rotation.z = -0.3; }
function buildTitan7(q){
  q.userData.noz = [];
  for (const s of [-1, 1]){ const h = new THREE.Group(); h.position.set(0.47 * s, -0.02, 0); h.rotation.set(-0.35, 0, 0.12 * s); q.add(h);
    mesh(B(0.11, 0.17, 0.46), MA7.can, 0, 0, -0.14, h); for (let k = 0; k < 2; k++) mesh(B(0.026, 0.08, 0.7), MA7.steel, (k - 0.5) * 0.045, 0.04, -0.2, h);
    const c = mesh(C(0.07, 0.07, 0.4, 6), MA7.can, 0.36 * s, 0.16, -0.3, q); c.rotation.x = Math.PI / 2;
    const n = new THREE.Object3D(); n.position.set(0.36 * s, 0.16, -0.52); q.add(n); q.userData.noz.push(n); }
}
function buildProp7(q){ q.position.set(0, 0.58, -0.01); const cap = mesh(new THREE.SphereGeometry(0.2, 8, 4, 0, TAU, 0, Math.PI / 2), MA7.propY, 0, 0, 0, q); cap.scale.set(1, 0.7, 1);
  mesh(C(0.016, 0.016, 0.16, 4), MA7.dark, 0, 0.2, 0, q); const r = new THREE.Group(); r.position.y = 0.28; q.add(r); mesh(B(0.56, 0.02, 0.08), MA7.propR, 0, 0, 0, r); mesh(C(0.035, 0.035, 0.04, 6), MA7.propY, 0, 0, 0, r); q.userData.rotor = r; }
const beamMat7 = addMat7(0xfff2a0, 0.14);
function buildTorch7(q){ q.position.set(0, -0.34, 0.1);
  const b = mesh(C(0.045, 0.05, 0.26, 6), MA7.dark, 0, 0, 0.06, q); b.rotation.x = Math.PI / 2; const h = mesh(C(0.08, 0.05, 0.09, 8), MA7.propY, 0, 0, 0.21, q); h.rotation.x = Math.PI / 2;
  mesh(new THREE.CircleGeometry(0.065, 8), MA7.light, 0, 0, 0.258, q);
  const cg = new THREE.ConeGeometry(0.6, 2.4, 12, 1, true); cg.translate(0, -1.2, 0); cg.rotateX(-Math.PI / 2); const beam = addMesh7(cg, beamMat7, q); beam.position.z = 0.26; q.userData.beam = beam; }
function buildBoxG7(q){ const gl = mesh(new THREE.IcosahedronGeometry(0.18, 1), MA7.boxR, 0, -0.34, 0.02, q); gl.scale.set(1.05, 1.15, 1.25);
  mesh(C(0.125, 0.125, 0.1, 8), MA7.milkW, 0, -0.17, 0, q); mesh(new THREE.IcosahedronGeometry(0.075, 0), MA7.boxR, -0.11, -0.28, 0.11, q); }
function buildMiniDoor7(q){ q.position.set(0, 0.32, -0.28); mesh(B(0.34, 0.5, 0.05), MA7.door, 0, 0, 0, q); mesh(B(0.38, 0.04, 0.06), MA7.doorF, 0, 0.26, 0, q); mesh(new THREE.IcosahedronGeometry(0.03, 0), MA7.knob, 0.11, -0.02, -0.035, q); }
function buildMirror7(q){ q.position.set(-0.13, -0.15, 0.01); const d = mesh(C(0.21, 0.21, 0.035, 10), MA7.mirror, 0, 0, 0, q); d.rotation.z = Math.PI / 2;
  const r = mesh(new THREE.TorusGeometry(0.21, 0.028, 4, 12), MA7.gold, -0.005, 0, 0, q); r.rotation.y = Math.PI / 2; mesh(new THREE.OctahedronGeometry(0.05, 0), MA7.gold, -0.03, 0, 0, q); }
function buildVein7(q){ q.position.set(0.17, 0.5, 0.08);
  for (let k = 0; k < 4; k++){ const p = new THREE.Group(); p.rotation.z = k / 4 * TAU + Math.PI / 4; q.add(p); mesh(B(0.028, 0.1, 0.02), MA7.vein, 0.075, 0, 0, p); mesh(B(0.065, 0.028, 0.02), MA7.vein, 0.05, 0.05, 0, p); } }
function buildEyes7(q){ for (const s of [-1, 1]){ const e = mesh(B(0.08, 0.032, 0.014), MA7.eyeR, 0.08 * s, 0.318, 0.226, q); e.rotation.z = 0.28 * s; } }
function mkNote7(parent){ const g = new THREE.Group(); parent.add(g); const h = mesh(new THREE.IcosahedronGeometry(0.075, 0), MA7.note, 0, 0, 0, g); h.scale.set(1.3, 1, 1);
  mesh(B(0.025, 0.26, 0.025), MA7.note, 0.08, 0.13, 0, g); const f = mesh(B(0.09, 0.03, 0.025), MA7.note, 0.12, 0.24, 0, g); f.rotation.z = -0.5; return g; }
function buildNotes7(q){ q.userData.n = [0, 1, 2].map(() => mkNote7(q)); }
function buildGhost7(q){ mesh(new THREE.IcosahedronGeometry(0.22, 1), MA7.ghost, 0, 0.14, 0, q); mesh(C(0.215, 0.28, 0.32, 8, true), MA7.ghostDS, 0, -0.08, 0, q);
  for (const s of [-1, 1]) mesh(B(0.05, 0.09, 0.02), MA7.ghostE, 0.075 * s, 0.17, 0.2, q); mesh(B(0.08, 0.05, 0.02), MA7.ghostE, 0, 0.05, 0.21, q); }
function buildStonks7(q, up){ const mat = up ? MA7.green : MA7.red; mesh(B(0.08, 0.38, 0.08), mat, 0, 0, 0, q); mesh(new THREE.ConeGeometry(0.13, 0.2, 4), mat, 0, 0.28, 0, q); }
function buildPogo7(q){ mesh(C(0.045, 0.045, 1.75, 6), MA7.pogo, 0, 0.18, 0, q); for (const s of [-1, 1]) mesh(B(0.24, 0.05, 0.1), MA7.dark, 0.15 * s, 0.02, 0, q);
  mesh(B(0.5, 0.06, 0.07), MA7.pogo, 0, 1.0, 0, q); for (const s of [-1, 1]) mesh(B(0.1, 0.08, 0.09), MA7.dark, 0.25 * s, 1.0, 0, q);
  const sp = new THREE.Group(); sp.position.y = -0.35; q.add(sp); for (let k = 0; k < 4; k++){ const t = mesh(new THREE.TorusGeometry(0.065, 0.016, 4, 8), MA7.magS, 0, -k * 0.06, 0, sp); t.rotation.x = Math.PI / 2; }
  mesh(C(0.07, 0.07, 0.07, 6), MA7.dark, 0, -0.26, 0, sp); q.userData.sp = sp; }
function buildSpring7(q){ q.position.set(0, -0.36, -0.02); for (let k = 0; k < 4; k++){ const t = mesh(new THREE.TorusGeometry(0.075, 0.018, 4, 8), MA7.magS, 0, -k * 0.055, 0, q); t.rotation.x = Math.PI / 2; }
  mesh(B(0.2, 0.03, 0.26), MA7.pogo, 0, -0.24, 0.04, q); }
function buildCrystals7(q){ q.userData.c = []; for (let k = 0; k < 5; k++){ const c = mesh(new THREE.OctahedronGeometry(0.075, 0), MA7.crystal, 0, 0, 0, q); c.scale.y = 1.8; q.userData.c.push(c); } }
function buildBook7(q){ mesh(B(0.42, 0.06, 0.3), MA7.book, 0, 0, 0, q); mesh(B(0.38, 0.065, 0.27), MA7.page, 0.012, 0, 0, q); mesh(B(0.42, 0.012, 0.3), MA7.book, 0, 0.035, 0, q); }

/* prototipos que se clonan (geometrías y materiales compartidos) */
const drumProto7 = new THREE.Group();
{ const b = mesh(C(0.04, 0.04, 0.34, 5), MA7.bone, 0.16, 0, 0, drumProto7); b.rotation.z = Math.PI / 2; for (const s of [-1, 1]) mesh(new THREE.IcosahedronGeometry(0.055, 0), MA7.bone, 0.34, 0.035 * s, 0, drumProto7);
  const m = mesh(new THREE.IcosahedronGeometry(0.16, 1), MA7.meat, -0.04, 0, 0, drumProto7); m.scale.set(1.35, 1, 1); }
const parcelProto7 = new THREE.Group();
{ mesh(B(0.46, 0.36, 0.46), MA7.parcel, 0, 0, 0, parcelProto7); mesh(B(0.48, 0.07, 0.11), MA7.tape, 0, 0.15, 0, parcelProto7); mesh(B(0.11, 0.07, 0.48), MA7.tape, 0, 0.15, 0, parcelProto7); }
const fistProto7 = new THREE.Group();
{ const f = mesh(new THREE.IcosahedronGeometry(0.36, 1), MA7.fist, 0, 0, 0, fistProto7); f.scale.set(1.15, 0.95, 1.05);
  for (let k = 0; k < 4; k++) mesh(B(0.13, 0.12, 0.1), MA7.fist, -0.24 + k * 0.16, 0.18, 0.3, fistProto7);
  mesh(C(0.22, 0.24, 0.2, 8), MA7.sleeve, 0, 0, -0.38, fistProto7).rotation.x = Math.PI / 2; }
const swordProto7 = new THREE.Group();
{ const swM = addMat7(0xd8a060, 0.85); addMesh7(new THREE.BoxGeometry(0.26, 2.7, 0.1), swM, swordProto7).position.y = 1.55; addMesh7(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 8), swM, swordProto7).position.y = 0.17;
  addMesh7(new THREE.BoxGeometry(0.16, 0.5, 0.14), addMat7(0xffffff, 0.8), swordProto7).position.y = -0.1; swordProto7.userData.mat = swM; }
const doorProto7 = new THREE.Group();
{ const hinge = new THREE.Group(); hinge.position.x = -0.5; doorProto7.add(hinge); mesh(B(1.0, 1.9, 0.08), MA7.door, 0.5, 0.95, 0, hinge); mesh(new THREE.IcosahedronGeometry(0.06, 0), MA7.knob, 0.85, 0.95, 0.07, hinge);
  for (const [x, y, w, h] of [[-0.56, 1.0, 0.12, 2.1], [0.56, 1.0, 0.12, 2.1], [0, 2.02, 1.24, 0.12]]) mesh(B(w, h, 0.14), MA7.doorF, x, y, 0, doorProto7);
  doorProto7.userData.hinge = hinge; }
const shardProto7 = new THREE.OctahedronGeometry(0.35, 0);

/* ---------- Ventana emergente al elegir un poder ---------- */
const pop7 = document.createElement('div'); pop7.id = 'pop7'; document.body.appendChild(pop7);
let pop7T = 0;
function powerPop7(u){
  const col = (RAR[u.r] || ['', '#ffffff'])[1];
  pop7.innerHTML = `<b>${u.ic || '✦'}</b><span style="color:${col}">${u.name}</span>`;
  pop7.classList.remove('on'); void pop7.offsetWidth; pop7.classList.add('on'); pop7T = 1.9;
}
function updPop7(dt){
  if (pop7T <= 0) return; pop7T -= dt;
  if (pop7T <= 0 || gameState === 'title' || gameState === 'over'){ pop7.classList.remove('on'); pop7T = 0; return; }
  t7d.set(hero.position.x, hero.position.y + 2.5 * hero.scale.y, hero.position.z).project(camera);
  pop7.style.transform = `translate(${(t7d.x * 0.5 + 0.5) * innerWidth}px,${(-t7d.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-100%)`;
}
/* (estilos de esta parte: css/efectos-v7.css) */
const bars7 = document.createElement('div'); bars7.id = 'bars7'; document.body.appendChild(bars7);

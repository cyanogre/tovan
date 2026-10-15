'use strict';
/* ---------- Guardián de las ruinas (primer jefe) ---------- */
function makeGuardian3(){
  const g = new THREE.Group(); scene.add(g);
  const stone = texMat(gStoneTex), rune = texMat(gRuneTex, { emissive: 0.35 }), face = texMat(gFaceN), fist = texMat(gFistTex, { emissive: 0.15 });
  const gold = makeMat(0xd9a441), core = makeMat(0x7ff5ff, { emissive: 1 }), moss = makeMat(0x5a8a3a), dark = makeMat(0x2a2632);
  const S = [matEntry(stone), matEntry(rune, 0.35), matEntry(face), matEntry(fist, 0.15), matEntry(gold), matEntry(moss), matEntry(dark)];
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.27 * s, 0.5, 0); body.add(L);
    sculpt(L, [[-0.28, 0.14, 0.15, 0.13], [-0.13, 0.17, 0.19, 0.16], [0.03, 0.15, 0.16, 0.15]], stone, { n: 7, su: 2 });
    lump(L, 0.1, rune, 0, -0.28, 0.08, 1, 0.9, 0.8);
    sculpt(L, [[-0.45, 0.15, 0.19, 0.13], [-0.36, 0.16, 0.18, 0.15], [-0.27, 0.13, 0.14, 0.13]], stone, { n: 7 });
    sculpt(L, [[-0.5, 0.17, 0.29, 0.14], [-0.45, 0.17, 0.28, 0.15], [-0.4, 0.12, 0.15, 0.11]], dark, { n: 6 });
    for (const k of [-1, 0, 1]){ const c = mesh(new THREE.ConeGeometry(0.035, 0.1, 4), rune, k * 0.08, -0.47, 0.3, L); c.rotation.x = 1.5; }
    return L; });
  const torso = new THREE.Group(); torso.position.y = 0.5; body.add(torso);
  sculpt(torso, [[-0.06, 0.33, 0.24, 0.22], [0.12, 0.34, 0.26, 0.24]], rune, { su: 3, capB: 0.2 });
  sculpt(torso, [[0.1, 0.32, 0.24, 0.23], [0.3, 0.38, 0.3, 0.27], [0.48, 0.5, 0.38, 0.32, 0, 0.02], [0.66, 0.56, 0.41, 0.36, 0, 0.05],
    [0.82, 0.5, 0.34, 0.33, 0, 0.05], [0.94, 0.32, 0.23, 0.25, 0, 0.03], [1.02, 0.16, 0.14, 0.16, 0, 0.02]], stone, { su: 3, capB: -1 });
  // musgo en la espalda y grietas con runas
  sculpt(torso, [[0.6, 0.34, 0.1, 0.39, 0, 0.0], [0.8, 0.3, 0.1, 0.36, 0, 0.02], [0.94, 0.15, 0.06, 0.26, 0, 0.03]], moss, { n: 6, capB: -1 });
  const coreG = new THREE.Group(); coreG.position.set(0, 0.62, 0.43); torso.add(coreG);
  const cr = mesh(new THREE.OctahedronGeometry(0.15, 0), core, 0, 0, 0.04, coreG); cr.scale.y = 1.4;
  mesh(new THREE.TorusGeometry(0.2, 0.045, 4, 8), gold, 0, 0, 0, coreG);
  for (const s of [-1, 1]){
    const p = lump(torso, 0.3, rune, 0.62 * s, 0.88, 0, 1.2, 0.82, 1.1); p.rotation.z = -0.3 * s;
    for (let k = 0; k < 3; k++){ const sp = mesh(new THREE.ConeGeometry(0.06, 0.24, 4), stone, (0.52 + k * 0.13) * s, 1.12 - k * 0.04, -0.12 + k * 0.1, torso); sp.rotation.z = -0.35 * s; }
    mesh(new THREE.ConeGeometry(0.08, 0.14, 4), moss, 0.8 * s, 1.04, 0.18, torso); }
  const plates = [0.27, -0.27].map(z => { const P = new THREE.Group(); P.position.set(0, -0.02, z); torso.add(P);
    sculpt(P, [[-0.42, 0.13, 0.03, 0.03], [-0.2, 0.17, 0.04, 0.04], [0, 0.19, 0.05, 0.05]], rune, { n: 6 }); return P; });
  const head = new THREE.Group(); head.position.set(0, 0.98, 0.1); torso.add(head);
  sculptHead(head, [[0.0, 0.15, 0.17, 0.15], [0.1, 0.21, 0.23, 0.2], [0.24, 0.23, 0.25, 0.22], [0.37, 0.2, 0.21, 0.2], [0.47, 0.1, 0.11, 0.12]], stone, face, [-0.24, 0.24, 0.02, 0.46], { nz: 0.5 });
  const crest = mesh(new THREE.ConeGeometry(0.09, 0.4, 4), gold, 0, 0.56, -0.06, head); crest.rotation.x = -0.35; crest.scale.set(0.35, 1, 1.6);
  for (const s of [-1, 1]){ const h = mesh(new THREE.ConeGeometry(0.06, 0.32, 5), gold, 0.27 * s, 0.34, 0, head); h.rotation.z = -1.0 * s;
    const h2 = mesh(new THREE.ConeGeometry(0.035, 0.18, 5), gold, 0.41 * s, 0.5, 0, head); h2.rotation.z = -0.25 * s; }
  mesh(new THREE.ConeGeometry(0.07, 0.12, 4), moss, -0.14, 0.45, 0.14, head);
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.66 * s, 0.8, 0); torso.add(A);
    sculpt(A, [[-0.36, 0.15, 0.16, 0.14], [-0.2, 0.19, 0.21, 0.17], [-0.04, 0.17, 0.18, 0.17]], stone, { n: 7, su: 2 });
    const el = new THREE.Group(); el.position.y = -0.36; A.add(el); A.userData.el = el;
    lump(el, 0.13, rune, 0, 0, 0);
    sculpt(el, [[-0.32, 0.18, 0.19, 0.17], [-0.17, 0.2, 0.22, 0.19], [0, 0.15, 0.16, 0.15]], rune, { n: 7, su: 2 });
    const f = lump(el, 0.27, fist, 0, -0.48, 0.03, 1.05, 0.92, 1.08);
    for (let k = 0; k < 4; k++) lump(el, 0.065, stone, -0.15 + k * 0.1, -0.42, 0.27, 1, 1, 1, 'i');
    lump(el, 0.09, fist, 0.2 * -s, -0.4, 0.15, 1, 1.3, 1);
    return A; });
  const halo = new THREE.Group(); halo.position.set(0, 1.25, -0.5); torso.add(halo);
  for (let i = 0; i < 7; i++){ const a = i / 7 * TAU; const p = lump(halo, 0.17, i % 2 ? rune : stone, Math.cos(a) * 0.64, Math.sin(a) * 0.64, 0, 0.7, 1.4, 0.5, 'o'); p.rotation.z = a; }
  const tele = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.04, 0); tele.visible = false;
  const sc = 1.8; g.scale.setScalar(sc);
  return newEnemy('boss', g, body, S, { isBoss: true, bossName: 'Guardián de las ruinas', hp: 900, r: 0.62 * sc, speed: 1.6, numY: 2.05 * sc, legs, arms, torso, tele, heavy: true, scale: sc,
    chargesLeft: 0, bt: 2, halo, coreG, plates, faceMat: face, runeMat: rune, blinkT: 2, flair: guardianFlair, head });
}

/* ---------- Míster Confianza ---------- */
const stFaceN3 = texAsset('jefes/mister-confianza-v3-cara'), stFaceW3 = texAsset('jefes/mister-confianza-v3-cara-guino');
const _starFlair = starFlair;
starFlair = function(e, dt){ _starFlair(e, dt); if (e.face3) e.faceMat.uniforms.uMap.value = e.winkT < 0.4 ? stFaceW3 : stFaceN3; };
function makeStar3(){
  const g = new THREE.Group(); scene.add(g);
  const suit = texMat(stSuit), chest = texMat(stChest), face = texMat(stFaceN3), boot = texMat(stBoot), glove = texMat(stGlove), hair = texMat(stHair), skin = makeMat(0xe8b894);
  const capeMat = texMat(stCape, { side: THREE.DoubleSide }), gold = makeMat(0xffd23a, { emissive: 0.4 }), red = makeMat(0xd83a3a);
  const S = [matEntry(suit), matEntry(chest), matEntry(face), matEntry(boot), matEntry(glove), matEntry(hair), matEntry(skin), matEntry(capeMat), matEntry(gold, 0.4), matEntry(red)];
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.19 * s, 0.9, 0); body.add(L);
    sculpt(L, [[-0.46, 0.1, 0.11, 0.1], [-0.3, 0.13, 0.15, 0.12], [-0.1, 0.15, 0.17, 0.14], [0.04, 0.14, 0.15, 0.14]], suit, { n: 7 });
    sculpt(L, [[-0.9, 0.11, 0.21, 0.11], [-0.84, 0.115, 0.22, 0.115], [-0.76, 0.1, 0.13, 0.1], [-0.52, 0.12, 0.13, 0.12], [-0.42, 0.14, 0.15, 0.14]], boot, { n: 7, capB: 0.05 });
    const cuff = mesh(new THREE.TorusGeometry(0.135, 0.03, 4, 10), gold, 0, -0.43, 0.005, L); cuff.rotation.x = Math.PI / 2;
    return L; });
  const torso = new THREE.Group(); torso.position.y = 0.95; body.add(torso);
  sculpt(torso, [[-0.06, 0.23, 0.17, 0.16], [0.13, 0.25, 0.18, 0.17]], red, { capB: 0.25 });
  const belt = mesh(new THREE.TorusGeometry(0.25, 0.035, 4, 12), gold, 0, 0.12, 0.005, torso); belt.rotation.x = Math.PI / 2; belt.scale.set(1.02, 0.74, 1);
  const buck = lump(torso, 0.07, gold, 0, 0.12, 0.19, 1, 1, 0.5, 'o'); buck.rotation.z = Math.PI / 4;
  sculpt(torso, [[0.12, 0.24, 0.17, 0.16], [0.3, 0.26, 0.19, 0.17], [0.48, 0.38, 0.28, 0.21], [0.64, 0.46, 0.3, 0.23], [0.78, 0.45, 0.26, 0.22], [0.88, 0.3, 0.17, 0.17], [0.95, 0.12, 0.1, 0.1]],
    suit, { n: 8, capB: -1, faceMat: chest, face: { box: [-0.46, 0.46, 0.26, 0.94], test: (c, nrm) => nrm.z > 0.35 && c.y > 0.3 } });
  mesh(C(0.085, 0.1, 0.22, 6), skin, 0, 0.98, 0, torso);
  const head = new THREE.Group(); head.position.y = 1.0; torso.add(head);
  sculptHead(head, [[0.0, 0.14, 0.17, 0.12], [0.06, 0.17, 0.2, 0.15], [0.17, 0.19, 0.21, 0.18], [0.3, 0.195, 0.2, 0.19], [0.4, 0.175, 0.16, 0.18], [0.48, 0.085, 0.07, 0.1]],
    skin, face, [-0.21, 0.21, -0.08, 0.5], { nz: 0.45 });
  sculpt(head, [[0.33, 0.2, 0.17, 0.2, 0, -0.012], [0.42, 0.185, 0.15, 0.19, 0, -0.02], [0.51, 0.1, 0.07, 0.12, 0, -0.03]], hair, { n: 8, capB: -1 });
  const q = lump(head, 0.1, hair, 0.04, 0.5, 0.12, 1.4, 0.6, 1.2, 'i'); q.rotation.set(-0.5, 0, 0.25);
  const curl = mesh(new THREE.TorusGeometry(0.05, 0.018, 4, 8), hair, 0.03, 0.43, 0.2, head); curl.rotation.y = 0.5;
  for (const s of [-1, 1]) lump(head, 0.04, skin, 0.185 * s, 0.26, 0, 0.5, 1, 0.8);   // orejas
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.49 * s, 0.8, 0); torso.add(A);
    lump(A, 0.16, suit, 0, -0.02, 0, 1, 0.95, 1, 'i');
    sculpt(A, [[-0.4, 0.105, 0.115, 0.1], [-0.22, 0.14, 0.17, 0.125], [-0.06, 0.15, 0.16, 0.15]], suit, { n: 7 });
    const el = new THREE.Group(); el.position.y = -0.4; A.add(el); A.userData.el = el;
    sculpt(el, [[-0.28, 0.11, 0.12, 0.11], [-0.14, 0.13, 0.14, 0.12], [0.02, 0.11, 0.11, 0.11]], glove, { n: 7 });
    sculpt(el, [[-0.1, 0.15, 0.16, 0.15], [0.02, 0.125, 0.13, 0.125]], glove, { n: 7, capB: -1, capT: -1 });
    lump(el, 0.12, glove, 0, -0.37, 0.02, 1, 1.05, 1.1);
    return A; });
  const cape = new THREE.Group(); cape.position.set(0, 0.9, -0.24); torso.add(cape);
  const cg = new THREE.PlaneGeometry(1.25, 2.0, 6, 10); cg.translate(0, -1.0, 0);
  { const pa = cg.attributes.position; for (let i = 0; i < pa.count; i++){ const y = pa.getY(i); pa.setX(i, pa.getX(i) * lerp(0.62, 1.08, -y / 2)); } }
  const capeM = mesh(cg, capeMat, 0, 0, 0, cape); capeM.userData.base = Float32Array.from(cg.attributes.position.array);
  for (const s of [-1, 1]) lump(torso, 0.07, gold, 0.3 * s, 0.9, -0.2, 1, 1, 0.6, 'o');
  const line = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); line.visible = false;
  const beam = new THREE.Group(); scene.add(beam); beam.visible = false;
  mesh(beamGeo, makeMat(0xfff6c0, { emissive: 1 }), 0, 0, 0, beam); const bo = mesh(beamGeo, makeMat(0xffd23a, { emissive: 1, opacity: 0.5, side: THREE.DoubleSide }), 0, 0, 0, beam); bo.scale.set(1.8, 1.8, 1);
  const sc = 1.45; g.scale.setScalar(sc);
  return newEnemy('star', g, body, S, { isBoss: true, heavy: true, bossName: 'Míster Confianza', bossHp: 2000, hp: 2000, r: 0.75 * sc, numY: 4.0, scale: sc, speed: 2.4,
    legs, arms, torso, cape, capeM, line, beam, parts: [line, beam], st: 'idle', seq: 0, upd: updStar, faceMat: face, winkT: 3, flair: starFlair, head, face3: true,
    onSpawn: e => { e.g.scale.setScalar(sc); e.spawnT = 0; e.t = 1.4; if (chMode === 'arcade'){ e.g.position.set(8, 0, 0); } play('superOn'); } });
}

/* ---------- Bruto de roca ---------- */
function makeBrute3(boss){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[boss ? 0xb8b0c8 : 0xd8c4b0], [0x5a4a40], [boss ? 0xff3a3a : 0xff7a2a, 1], [0x6f9a4a], [0x9ff3ff, 1]]);
  S[0].m.uniforms.uMap.value = gStoneTex; S[0].m.uniforms.uHasMap.value = 1;
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.25 * s, 0.42, 0); body.add(L);
    sculpt(L, [[-0.42, 0.16, 0.24, 0.14], [-0.33, 0.17, 0.2, 0.15], [-0.12, 0.15, 0.16, 0.14], [0.02, 0.13, 0.13, 0.13]], S[1].m, { n: 6 }); return L; });
  const torso = new THREE.Group(); torso.position.y = 0.42; body.add(torso);
  sculpt(torso, [[-0.02, 0.34, 0.27, 0.25], [0.18, 0.46, 0.37, 0.33, 0, 0.03], [0.42, 0.52, 0.42, 0.36, 0, 0.09], [0.64, 0.46, 0.37, 0.31, 0, 0.15], [0.8, 0.3, 0.26, 0.22, 0, 0.19], [0.88, 0.12, 0.12, 0.1, 0, 0.2]], S[0].m, { n: 8, su: 2 });
  sculpt(torso, [[0.6, 0.42, 0.18, 0.36, 0, 0.12], [0.78, 0.3, 0.16, 0.26, 0, 0.17], [0.9, 0.1, 0.06, 0.1, 0, 0.19]], S[3].m, { n: 7, capB: -1 });
  for (let i = 0; i < 5; i++){ const a = -1.2 + i * 0.6; lump(torso, 0.08 + (i % 2) * 0.03, S[0].m, Math.sin(a) * 0.4, 0.5 + (i % 3) * 0.1, -0.3 + Math.cos(a) * 0.05); }
  const head = new THREE.Group(); head.position.set(0, 0.72, 0.36); torso.add(head);
  sculpt(head, [[-0.12, 0.15, 0.13, 0.1], [0.04, 0.18, 0.16, 0.12], [0.16, 0.11, 0.09, 0.08]], S[0].m, { n: 7 });
  mesh(B(0.24, 0.045, 0.03), S[2].m, 0, 0.02, 0.16, head);
  for (const s of [-1, 1]) lump(head, 0.035, S[2].m, 0.07 * s, 0.03, 0.16, 1.3, 1, 0.5, 'o');
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.6 * s, 0.6, 0.04); torso.add(A);
    lump(A, 0.17, S[0].m, 0, 0.02, 0, 1.1, 0.9, 1);
    sculpt(A, [[-0.46, 0.14, 0.15, 0.13], [-0.25, 0.16, 0.18, 0.15], [-0.02, 0.14, 0.15, 0.14]], S[1].m, { n: 6 });
    lump(A, 0.24, S[0].m, 0, -0.58, 0.03, 1, 0.9, 1.05);
    if (boss) for (let k = 0; k < 3; k++){ const c = mesh(new THREE.ConeGeometry(0.05, 0.16, 4), S[4].m, -0.08 + k * 0.08, -0.6, 0.24, A); c.rotation.x = 1.4; }
    return A; });
  if (boss) for (let i = 0; i < 3; i++){ const c = mesh(new THREE.OctahedronGeometry(0.12, 0), S[4].m, (i - 1) * 0.15, 0.98 + (i === 1 ? 0.06 : 0), 0.0, torso); c.scale.y = 1.8; }
  const tele = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.04, 0); tele.visible = false;
  const sc = boss ? 1.75 : 1; g.scale.setScalar(sc);
  return newEnemy(boss ? 'boss' : 'brute', g, body, S, { isBoss: !!boss, bossName: 'Guardián de las ruinas', hp: boss ? 900 : 220, r: 0.62 * sc, speed: boss ? 1.6 : 1.3, numY: 1.9 * sc,
    legs, arms, torso, tele, heavy: true, scale: sc, chargesLeft: 0, bt: 2 });
}

/* ---------- Oni ---------- */
const oniFaceTex = texAsset('enemigos/oni/cara-azul'), oniFaceRed = texAsset('enemigos/oni/cara-roja');
const tigerTex = texAsset('enemigos/oni/piel-tigre');
function makeOni3(){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet([[0x3f6fd8], [0x1c1c2c], [0xffe040, 1], [0xf0e6c8], [0xffffff], [0x4a4450], [0x2a4aa0]]);
  S[4].m.uniforms.uMap.value = tigerTex; S[4].m.uniforms.uHasMap.value = 1;
  const faceM = texMat(oniFaceTex); S.push(matEntry(faceM));
  const gold = makeMat(0xd9a441); S.push(matEntry(gold));
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.22 * s, 0.5, 0); body.add(L);
    sculpt(L, [[-0.28, 0.12, 0.13, 0.12], [-0.12, 0.15, 0.17, 0.14], [0.04, 0.15, 0.16, 0.15]], S[0].m, { n: 7 });
    sculpt(L, [[-0.45, 0.1, 0.11, 0.1], [-0.3, 0.13, 0.15, 0.12], [-0.24, 0.12, 0.13, 0.12]], S[0].m, { n: 7 });
    const an = mesh(new THREE.TorusGeometry(0.11, 0.025, 4, 8), gold, 0, -0.4, 0, L); an.rotation.x = Math.PI / 2;
    sculpt(L, [[-0.5, 0.11, 0.2, 0.09], [-0.45, 0.11, 0.19, 0.1], [-0.42, 0.09, 0.1, 0.08]], S[6].m, { n: 6 }); return L; });
  sculpt(body, [[0.3, 0.4, 0.34, 0.33], [0.46, 0.35, 0.29, 0.28], [0.6, 0.32, 0.25, 0.24]], S[4].m, { n: 8, su: 2, capB: -1, capT: -1 });
  const belt = mesh(new THREE.TorusGeometry(0.33, 0.04, 4, 12), S[1].m, 0, 0.6, 0, body); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.78, 1);
  const torso = new THREE.Group(); torso.position.y = 0.66; body.add(torso);
  sculpt(torso, [[0.0, 0.31, 0.24, 0.22], [0.18, 0.35, 0.27, 0.22], [0.38, 0.45, 0.31, 0.26], [0.52, 0.47, 0.3, 0.27], [0.62, 0.34, 0.22, 0.21], [0.7, 0.15, 0.12, 0.12]], S[0].m, { n: 8, capB: -1 });
  for (const s of [-1, 1]){ const p = lump(torso, 0.12, S[0].m, 0.13 * s, 0.43, 0.2, 1.2, 0.8, 0.6, 'i'); }
  const head = new THREE.Group(); head.position.set(0, 0.66, 0.04); torso.add(head);
  sculptHead(head, [[0.0, 0.14, 0.17, 0.13], [0.1, 0.19, 0.21, 0.17], [0.23, 0.2, 0.21, 0.19], [0.35, 0.18, 0.17, 0.18], [0.45, 0.09, 0.08, 0.11]], S[0].m, faceM, [-0.21, 0.21, 0.0, 0.44], { nz: 0.45 });
  sculpt(head, [[0.3, 0.2, 0.15, 0.2, 0, -0.02], [0.42, 0.18, 0.12, 0.19, 0, -0.03], [0.52, 0.08, 0.05, 0.1, 0, -0.04]], S[1].m, { n: 8, capB: -1 });
  for (let i = 0; i < 5; i++){ const c = mesh(new THREE.ConeGeometry(0.08, 0.36, 4), S[1].m, (i - 2) * 0.09, 0.46, -0.1 - Math.abs(i - 2) * 0.02, head); c.rotation.set(-0.7, 0, (i - 2) * -0.35); }
  for (const s of [-1, 1]){
    const h = mesh(new THREE.ConeGeometry(0.055, 0.32, 5), S[3].m, 0.12 * s, 0.5, 0.06, head); h.rotation.z = -0.4 * s;
    const t = mesh(new THREE.ConeGeometry(0.025, 0.09, 4), S[3].m, 0.075 * s, 0.07, 0.2, head); t.rotation.x = -0.1;
    lump(head, 0.04, S[0].m, 0.205 * s, 0.24, 0, 0.5, 1.2, 0.9); }
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.5 * s, 0.54, 0); torso.add(A);
    lump(A, 0.15, S[0].m, 0, -0.02, 0, 1, 0.95, 1, 'i');
    sculpt(A, [[-0.44, 0.11, 0.12, 0.11], [-0.32, 0.12, 0.13, 0.12], [-0.16, 0.15, 0.17, 0.14], [0.0, 0.14, 0.15, 0.14]], S[0].m, { n: 7 });
    const bb = mesh(new THREE.TorusGeometry(0.125, 0.03, 4, 8), gold, 0, -0.36, 0, A); bb.rotation.x = Math.PI / 2;
    lump(A, 0.14, S[0].m, 0, -0.53, 0.02, 1, 0.95, 1.1); return A; });
  const club = new THREE.Group(); club.position.set(0, -0.52, 0.08); club.rotation.x = 1.45; arms[1].add(club);
  mesh(C(0.05, 0.05, 0.4, 6), S[1].m, 0, 0.1, 0, club);
  sculpt(club, [[0.3, 0.08, 0.08, 0.08], [0.9, 0.15, 0.15, 0.15], [1.5, 0.18, 0.18, 0.18], [1.58, 0.12, 0.12, 0.12]], S[5].m, { n: 6, capT: 0.2 });
  for (let i = 0; i < 12; i++){ const a = i / 4 * TAU / 3 + (i > 3 ? 0.4 : 0) + (i > 7 ? 0.4 : 0), y = 0.75 + Math.floor(i / 4) * 0.3, r = 0.13 + Math.floor(i / 4) * 0.025;
    const sp = mesh(new THREE.ConeGeometry(0.035, 0.12, 4), S[3].m, Math.cos(a) * r, y, Math.sin(a) * r, club); sp.rotation.set(Math.sin(a) * 1.57, 0, -Math.cos(a) * 1.57); }
  const tele = mesh(circleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); tele.visible = false;
  const sc = 1.2; g.scale.setScalar(sc);
  return newEnemy('oni', g, body, S, { hp: 170, r: 0.55 * sc, speed: 1.75, numY: 2.4 * sc, legs, arms, torso, tele, heavy: true, scale: sc, eye: S[2], head });
}

/* ---------- El de los Seis Ojos ---------- */
function makeSixEyes3(){
  const g = new THREE.Group(); scene.add(g);
  const kim = texMat(sxKimono), hak = texMat(sxHakama), skin = texMat(sxSkin), hair = texMat(sxHair), face = texMat(sxFaceN);
  const gold = makeMat(0xd9a441), wood = makeMat(0x3a2418), blade = texMat(sxBlade, { emissive: 0.35 }), wrap = texMat(sxWrap), bone = makeMat(0xe8e0d0);
  const S = [matEntry(kim), matEntry(hak), matEntry(skin), matEntry(hair), matEntry(face), matEntry(gold), matEntry(wood), matEntry(blade, 0.35), matEntry(wrap)];
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.17 * s, 0.9, 0); body.add(L);
    sculpt(L, [[-0.86, 0.24, 0.27, 0.23, 0.03 * s], [-0.55, 0.2, 0.22, 0.2, 0.015 * s], [-0.2, 0.18, 0.2, 0.18], [0.06, 0.18, 0.19, 0.18]], hak, { n: 8, su: 2, capB: 0.05 });
    sculpt(L, [[-0.9, 0.08, 0.16, 0.08], [-0.87, 0.08, 0.15, 0.08]], wood, { n: 6 }); return L; });
  const torso = new THREE.Group(); torso.position.y = 0.9; body.add(torso);
  sculpt(torso, [[-0.06, 0.31, 0.24, 0.22], [0.14, 0.31, 0.23, 0.22]], gold, { n: 8, capB: 0.2 });
  const knot = lump(torso, 0.08, gold, 0.18, 0.06, -0.22, 1.4, 0.8, 0.7, 'i');
  sculpt(torso, [[0.12, 0.3, 0.22, 0.21], [0.34, 0.33, 0.24, 0.22], [0.54, 0.36, 0.25, 0.22], [0.66, 0.29, 0.19, 0.19], [0.72, 0.12, 0.1, 0.1]], kim, { n: 8, su: 2, capB: -1 });
  for (const s of [-1, 1]){ const l = mesh(C(0.025, 0.025, 0.52, 4), makeMat(0xe8e0f0), 0.09 * s, 0.44, 0.235, torso); l.rotation.z = 0.36 * s; l.rotation.x = 0.12; }
  mesh(C(0.07, 0.08, 0.16, 6), skin, 0, 0.72, 0, torso);
  const sheath = new THREE.Group(); sheath.position.set(-0.36, 0.08, 0.1); sheath.rotation.set(0.2, 0, 1.25); torso.add(sheath);
  mesh(C(0.04, 0.035, 1.1, 6), wood, 0, 0.3, 0, sheath); for (let k = 0; k < 3; k++){ const b = mesh(new THREE.TorusGeometry(0.045, 0.012, 4, 8), gold, 0, -0.1 + k * 0.4, 0, sheath); b.rotation.x = Math.PI / 2; }
  const head = new THREE.Group(); head.position.y = 0.74; torso.add(head);
  sculptHead(head, [[0.0, 0.11, 0.14, 0.11], [0.1, 0.15, 0.18, 0.14], [0.24, 0.175, 0.19, 0.17], [0.36, 0.165, 0.16, 0.17], [0.46, 0.09, 0.08, 0.1]], skin, face, [-0.19, 0.19, -0.02, 0.48], { nz: 0.45 });
  sculpt(head, [[0.3, 0.185, 0.15, 0.19, 0, -0.012], [0.42, 0.17, 0.13, 0.18, 0, -0.02], [0.52, 0.09, 0.06, 0.11, 0, -0.03]], hair, { n: 8, capB: -1 });
  lump(head, 0.08, hair, 0, 0.56, -0.08, 1, 1.2, 1, 'i');
  for (const s of [-1, 1]){ const h = mesh(new THREE.ConeGeometry(0.04, 0.22, 5), bone, 0.13 * s, 0.56, 0.06, head); h.rotation.z = -0.35 * s; }
  const strands = []; for (let i = 0; i < 6; i++){ const st = new THREE.Group(); st.position.set(-0.17 + i * 0.068, 0.42, -0.17); head.add(st);
    const len = 0.95 - Math.abs(i - 2.5) * 0.08; mesh(C(0.045, 0.012, len, 4), hair, 0, -len / 2, 0, st); strands.push(st); }
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.38 * s, 0.64, 0); torso.add(A);
    sculpt(A, [[-0.56, 0.2, 0.25, 0.2, 0.03 * s, -0.03], [-0.32, 0.17, 0.19, 0.16], [-0.05, 0.13, 0.14, 0.13]], kim, { n: 8, su: 2, capB: -1 });
    mesh(C(0.055, 0.06, 0.2, 6), skin, 0, -0.62, 0.02, A); lump(A, 0.07, skin, 0, -0.76, 0.03, 0.9, 1.1, 1.1); return A; });
  const kat = new THREE.Group(); kat.position.set(0, -0.78, 0.08); kat.rotation.x = Math.PI / 2 - 0.3; arms[1].add(kat);
  mesh(C(0.035, 0.035, 0.34, 6), wrap, 0, 0, 0, kat); mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 8), gold, 0, 0.19, 0, kat);
  mesh(B(0.05, 1.6, 0.015), blade, 0, 1.0, 0, kat);
  const tele = mesh(circleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); tele.visible = false;
  const line = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); line.visible = false;
  const sc = 1.7; g.scale.setScalar(sc);
  return newEnemy('sixeyes', g, body, S, { isBoss: true, heavy: true, bossName: 'El de los Seis Ojos', bossHp: 1500, hp: 1500, r: 0.5 * sc, numY: 2.2 * sc, scale: sc, speed: 2.1,
    legs, arms, torso, tele, line, parts: [line], strands, faceMat: face, bladeMat: blade, blinkT: 2, seq: 0, cd: 1.2, upd: updSixEyes, flair: sixFlair, head });
}

/* ---------- El Gato del Anticuario (jefe final) ---------- */
function makeFinalCat3(){
  const g = new THREE.Group(); scene.add(g);
  const fur = texMat(catFur), chest = texMat(catChest), arm = texMat(catArm), face = texMat(catFaceN), belt = texMat(beltTex, { emissive: 0.25 });
  const pink = makeMat(0xe88a9a), claw = makeMat(0xf0ece0), eyeGlow = makeMat(0xffe040, { emissive: 1 });
  const S = [matEntry(fur), matEntry(chest), matEntry(arm), matEntry(face), matEntry(belt, 0.25), matEntry(pink), matEntry(claw)];
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.46 * s, 1.1, 0); body.add(L);
    sculpt(L, [[-0.62, 0.27, 0.29, 0.25], [-0.36, 0.36, 0.39, 0.33], [-0.08, 0.36, 0.38, 0.35], [0.06, 0.3, 0.31, 0.3]], arm, { n: 8, su: 2 });
    sculpt(L, [[-0.96, 0.22, 0.24, 0.2], [-0.78, 0.26, 0.29, 0.24], [-0.6, 0.25, 0.27, 0.23]], fur, { n: 8 });
    sculpt(L, [[-1.1, 0.3, 0.44, 0.22], [-1.02, 0.31, 0.42, 0.23], [-0.92, 0.23, 0.27, 0.2]], fur, { n: 8 });
    for (let k = -1; k <= 1; k++) lump(L, 0.07, pink, k * 0.17, -1.07, 0.44, 1, 0.6, 0.8, 'i');
    return L; });
  const torso = new THREE.Group(); torso.position.y = 1.1; body.add(torso);
  sculpt(torso, [[-0.04, 0.58, 0.42, 0.4], [0.3, 0.62, 0.45, 0.43]], fur, { n: 10, capB: 0.15 });
  sculpt(torso, [[0.0, 0.66, 0.49, 0.47], [0.24, 0.67, 0.5, 0.48]], belt, { n: 12, su: 3, capB: -1, capT: -1 });
  sculpt(torso, [[0.28, 0.62, 0.45, 0.43], [0.7, 1.02, 0.66, 0.55], [1.12, 1.3, 0.74, 0.6], [1.5, 1.22, 0.64, 0.56], [1.78, 0.82, 0.46, 0.46], [1.95, 0.4, 0.3, 0.34]],
    fur, { n: 10, capB: -1, faceMat: chest, face: { box: [-1.3, 1.3, 0.3, 1.9], test: (c, nrm) => nrm.z > 0.3 && c.y > 0.32 } });
  sculpt(torso, [[1.7, 0.72, 0.3, 0.48, 0, -0.08], [2.02, 0.42, 0.18, 0.3, 0, -0.08], [2.14, 0.14, 0.08, 0.14, 0, -0.06]], fur, { n: 8, capB: -1 });
  for (const s of [-1, 1]) lump(torso, 0.56, arm, 1.3 * s, 1.6, 0, 1, 0.88, 1, 'i');
  const head = new THREE.Group(); head.position.set(0, 2.15, 0.18); torso.add(head);
  sculptHead(head, [[0.0, 0.17, 0.17, 0.15], [0.1, 0.23, 0.22, 0.2], [0.22, 0.24, 0.21, 0.21], [0.34, 0.2, 0.17, 0.19], [0.42, 0.1, 0.08, 0.1]], fur, face, [-0.25, 0.25, 0.0, 0.42], { nz: 0.45 });
  for (const s of [-1, 1]){ const ear = mesh(new THREE.ConeGeometry(0.085, 0.2, 4), fur, 0.13 * s, 0.46, 0, head); ear.rotation.z = -0.25 * s; mesh(new THREE.ConeGeometry(0.045, 0.11, 4), pink, 0.13 * s, 0.45, 0.025, head);
    for (let k = 0; k < 2; k++){ const t = mesh(new THREE.ConeGeometry(0.04, 0.14, 4), fur, 0.22 * s, 0.1 + k * 0.07, 0.05, head); t.rotation.z = (1.9 + k * 0.3) * -s; } }
  const eyes = [-1, 1].map(s => lump(head, 0.04, eyeGlow, 0.095 * s, 0.25, 0.215, 1.3, 0.8, 0.5, 'o'));
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(1.58 * s, 1.6, 0); torso.add(A);
    sculpt(A, [[-1.0, 0.36, 0.38, 0.34], [-0.58, 0.48, 0.52, 0.42], [-0.18, 0.45, 0.48, 0.43], [0.06, 0.36, 0.38, 0.36]], arm, { n: 9, su: 2 });
    const el = new THREE.Group(); el.position.y = -1.0; A.add(el); A.userData.el = el;
    lump(el, 0.34, fur, 0, 0, 0, 1, 0.9, 1, 'i');
    sculpt(el, [[-0.86, 0.33, 0.35, 0.32], [-0.46, 0.42, 0.45, 0.39], [0.0, 0.32, 0.34, 0.32]], fur, { n: 9 });
    lump(el, 0.42, fur, 0, -1.08, 0.06, 1, 0.82, 1.05);
    for (let k = -1; k <= 1; k++){ const c = mesh(new THREE.ConeGeometry(0.06, 0.3, 4), claw, k * 0.24, -1.38, 0.38, el); c.rotation.x = Math.PI - 0.4; }
    lump(el, 0.16, pink, 0, -1.3, 0.12, 1.2, 0.4, 1, 'i'); return A; });
  const tail = []; let par = new THREE.Group(); par.position.set(0, 0.35, -0.45); torso.add(par);
  for (let i = 0; i < 7; i++){ const r = 0.13 - i * 0.012; const t = mesh(C(r, r * 0.9, 0.44, 6), fur, 0, 0, -0.2, par); t.rotation.x = Math.PI / 2; tail.push(par);
    const n2 = new THREE.Group(); n2.position.z = -0.4; par.add(n2); par = n2; }
  const line = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); line.visible = false;
  const rainC = Array.from({ length: 8 }, () => { const m = mesh(circleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); m.visible = false; return m; });
  const laser = new THREE.Group(); scene.add(laser); laser.visible = false;
  mesh(unitCyl, makeMat(0xfff0a0, { emissive: 1 }), 0, 0, 0, laser); const lzo = mesh(unitCyl, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0, 0, laser);
  const sc = 1.25; g.scale.setScalar(sc);
  return newEnemy('finalcat', g, body, S, { isBoss: true, heavy: true, noSep: false, bossName: 'El Gato del Anticuario', bossHp: 3000, hp: 3000, r: 1.25 * sc, numY: 3.2 * sc, scale: sc, speed: 2.0,
    legs, arms, torso, head, eyes, tail, line, rainC, laser, lzo, faceMat: face, parts: [line, laser, ...rainC], st: 'idle', seq: 0, phase: 1, blinkT: 2, dieTime: 3.2,
    upd: updFinalCat, flair: catFlair, onDying: catDying, onSpawn: e => { e.g.scale.setScalar(sc); e.spawnT = 0; e.t = 1.2; } });
}

/* ---------- Gashadokuro (cráneo y costillas de verdad) ---------- */
function makeSkeleton3(){
  const e = makeSkeleton();
  const bone = e.mats[0].m, dark = e.mats[1].m, glow = e.mats[2].m, bone2 = e.mats[3].m;
  const strip = grp => { for (const c of grp.children.slice()) if (c.isMesh && c.geometry && c.geometry.type === 'BoxGeometry') grp.remove(c); };
  strip(e.root); strip(e.skull); strip(e.jaw);
  const R = e.root;
  for (let i = 0; i < 8; i++){ const y = 0.3 + i * 0.62;
    sculpt(R, [[y - 0.2, 0.36, 0.3, 0.28], [y - 0.12, 0.4, 0.33, 0.31], [y + 0.12, 0.4, 0.33, 0.31], [y + 0.2, 0.34, 0.28, 0.27]], bone2, { n: 7 });
    const sp = mesh(new THREE.ConeGeometry(0.12, 0.5, 4), bone, 0, y + 0.05, -0.42, R); sp.rotation.x = -2.0; }
  for (let i = 0; i < 6; i++) for (const s of [-1, 1]){
    const rg = new THREE.Group(); rg.position.set(0, 2.1 + i * 0.46, 0.3); rg.scale.set(2.1 - i * 0.08, 1, 1); R.add(rg);
    const rib = mesh(new THREE.TorusGeometry(0.8, 0.07, 4, 12, Math.PI * 0.82), bone, 0, 0, 0, rg);
    rib.rotation.set(Math.PI / 2 + 0.12, 0, s > 0 ? -Math.PI / 2 : Math.PI * 0.68); }
  sculpt(R, [[1.9, 0.14, 0.1, 0.1], [2.6, 0.18, 0.12, 0.12], [4.4, 0.15, 0.1, 0.1]], bone, { n: 6, z: 1.0 });
  const clav = mesh(C(0.18, 0.18, 4.4, 6), bone, 0, 5.15, 0.1, R); clav.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) lump(R, 0.32, bone, 2.2 * s, 5.15, 0.1, 1, 0.8, 0.9);
  // cráneo esculpido con la cara pintada proyectada
  const face = texMat(gsSkull); e.mats.push(matEntry(face));
  sculpt(e.skull, [[-0.62, 0.62, 0.78, 0.55], [-0.3, 0.92, 1.02, 0.8], [0.1, 1.02, 1.04, 0.95], [0.55, 1.0, 0.95, 0.98], [0.95, 0.78, 0.7, 0.8], [1.2, 0.4, 0.35, 0.45]],
    bone, { n: 10, faceMat: face, face: { box: [-1.0, 1.0, -0.68, 1.0], test: (c, nrm) => nrm.z > 0.45 && c.y < 0.95 } });
  for (const s of [-1, 1]){ lump(e.skull, 0.16, glow, s * 0.45, 0.22, 1.0, 1, 0.8, 0.5, 'i'); lump(e.skull, 0.22, bone, s * 0.9, -0.2, 0.5, 0.6, 1, 1); }
  sculpt(e.jaw, [[-0.35, 0.55, 0.75, 0.45], [-0.08, 0.72, 0.88, 0.55], [0.05, 0.7, 0.86, 0.55]], bone2, { n: 10 });
  for (let i = 0; i < 6; i++){ const t = mesh(new THREE.ConeGeometry(0.08, 0.2, 4), bone, -0.5 + i * 0.2, 0.12, 0.86 - Math.abs(i - 2.5) * 0.04, e.jaw); }
  for (const h of e.hands){ strip(h.H); lump(h.H, 0.72, bone, 0, 0, 0.1, 1.1, 0.32, 1.05); }
  e.skullSculpt = true;
  return e;
}
const _upgradeSkeleton = upgradeSkeleton;
upgradeSkeleton = function(e){
  if (!e.skullSculpt) return _upgradeSkeleton(e);
  for (const s of [e.mats[0], e.mats[3]]){ s.m.uniforms.uMap.value = gsBone; s.m.uniforms.uHasMap.value = 1; s.c = s.base = 0xffffff; }
  const rope = makeMat(0xc8a060), paper = makeMat(0xf4f0e8, { side: THREE.DoubleSide });
  const shime = new THREE.Group(); shime.position.set(0, 5.3, 0.1); e.root.add(shime);
  const ring = mesh(new THREE.TorusGeometry(1.4, 0.14, 5, 16), rope, 0, 0, 0, shime); ring.rotation.x = Math.PI / 2; ring.scale.z = 0.6;
  const papers = []; for (let i = 0; i < 5; i++){ const a = -0.9 + i * 0.45, p = new THREE.Group(); p.position.set(Math.sin(a) * 1.4, -0.1, Math.cos(a) * 0.84); shime.add(p);
    for (let k = 0; k < 3; k++){ const z = mesh(new THREE.PlaneGeometry(0.22, 0.26), paper, (k % 2) * 0.08, -0.15 - k * 0.24, 0, p); z.rotation.y = a; } papers.push(p); }
  e.papers = papers; e.flair = skelFlair; return e;
};

/* ---------- Ryūjin: cabeza esculpida ---------- */
function makeDragon3(){
  const e = makeDragon();
  const hs = e.head.children[0], jaw = e.jaw, S = e.mats;
  const strip = grp => { for (const c of grp.children.slice()) if (c.isMesh && c.geometry && c.geometry.type === 'BoxGeometry') grp.remove(c); };
  strip(hs); strip(jaw);
  const plain = makeMat(0x2f9a8a), white = S[4].m, gold = S[2].m, eyeM = S[3].m, tongue = makeMat(0xb03040), pupil = makeMat(0x200808);
  S.push(matEntry(plain));
  sculpt(hs, [[-0.42, 0.3, 0.28, 0.22], [-0.15, 0.38, 0.32, 0.26], [0.2, 0.34, 0.27, 0.22], [0.5, 0.26, 0.18, 0.12], [0.95, 0.22, 0.16, 0.08], [1.32, 0.24, 0.16, 0.08], [1.42, 0.16, 0.1, 0.06]],
    S[0].m, { n: 8, axis: 'z', su: 2, capT: 0.2 });
  sculpt(hs, [[0.5, 0.24, 0.02, 0.08, 0, -0.05], [1.3, 0.22, 0.02, 0.07, 0, -0.06]], white, { n: 6, axis: 'z', capB: -1, capT: 0.2 });
  sculpt(hs, [[1.18, 0.26, 0.12, 0.05, 0, 0.1], [1.38, 0.24, 0.1, 0.04, 0, 0.1]], gold, { n: 6, axis: 'z' });
  for (const s of [-1, 1]){
    lump(hs, 0.11, eyeM, 0.29 * s, 0.2, 0.32, 1, 0.75, 1.3, 'i'); lump(hs, 0.05, pupil, 0.33 * s, 0.21, 0.36, 0.6, 1.4, 0.6, 'o');
    const brow = lump(hs, 0.13, gold, 0.3 * s, 0.32, 0.3, 1.2, 0.45, 1.2, 'd'); brow.rotation.z = 0.35 * s;
    lump(hs, 0.04, pupil, 0.12 * s, 0.13, 1.42, 1, 0.7, 0.6, 'o'); }
  sculpt(jaw, [[0.0, 0.2, 0.05, 0.1], [0.5, 0.21, 0.04, 0.1], [1.0, 0.17, 0.04, 0.09]], S[1].m, { n: 6, axis: 'z', capT: 0.25 });
  sculpt(jaw, [[0.1, 0.13, 0.03, 0.01, 0, 0.04], [0.85, 0.12, 0.03, 0.01, 0, 0.04]], tongue, { n: 6, axis: 'z' });
  return e;
}

MAKERS.boss = makeGuardian3; MAKERS.star = makeStar3; MAKERS.brute = () => makeBrute3(false); MAKERS.oni = makeOni3;
MAKERS.redoni = () => { const e = makeOni3(); e.mats[0].c = e.mats[0].base = 0xc83a3a; e.mats[6].c = e.mats[6].base = 0x7a1818;
  e.mats[7].m.uniforms.uMap.value = oniFaceRed; return e; };
MAKERS.sixeyes = makeSixEyes3; MAKERS.finalcat = makeFinalCat3; MAKERS.skeleton = () => upgradeSkeleton(makeSkeleton3()); MAKERS.dragon = makeDragon3;

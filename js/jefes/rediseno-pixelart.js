'use strict';
/* ======================================================================
   JEFES REDISEÑADOS: texturas pixel art, caras animadas y más detalle
   ====================================================================== */
const fr = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
const texMat = (tex, o = {}) => makeMat(0xffffff, Object.assign({ map: tex }, o));
const matEntry = (m, em = 0) => ({ m, c: 0xffffff, base: 0xffffff, em });
function boxFace(w, h, d, front, side){ return new THREE.Mesh(B(w, h, d), [side, side, side, side, front, side]); }

/* ---------- Guardián de las ruinas ---------- */
const gStoneTex = texAsset('jefes/guardian-piedra');
const gRuneTex = texAsset('jefes/guardian-runas');
const gFaceN = texAsset('jefes/guardian-cara'), gFaceA = texAsset('jefes/guardian-cara-enfadada'), gFaceD = texAsset('jefes/guardian-cara-apagada');
const gFistTex = texAsset('jefes/guardian-puno');
function makeGuardian(){
  const g = new THREE.Group(); scene.add(g);
  const stone = texMat(gStoneTex), rune = texMat(gRuneTex, { emissive: 0.35 }), face = texMat(gFaceN), fist = texMat(gFistTex, { emissive: 0.15 });
  const gold = makeMat(0xd9a441), core = makeMat(0x7ff5ff, { emissive: 1 }), moss = makeMat(0x5a8a3a), dark = makeMat(0x2a2632);
  const S = [matEntry(stone), matEntry(rune, 0.35), matEntry(face), matEntry(fist, 0.15), matEntry(gold), matEntry(moss), matEntry(dark)];
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.27 * s, 0.5, 0); body.add(L);
    mesh(B(0.32, 0.26, 0.34), stone, 0, -0.13, 0, L); mesh(B(0.22, 0.12, 0.08), rune, 0, -0.28, 0.17, L);
    mesh(B(0.3, 0.2, 0.32), stone, 0, -0.36, 0, L); mesh(B(0.38, 0.1, 0.48), dark, 0, -0.45, 0.05, L); return L; });
  const torso = new THREE.Group(); torso.position.y = 0.5; body.add(torso);
  mesh(B(0.8, 0.14, 0.56), rune, 0, 0.05, 0, torso); mesh(B(0.76, 0.28, 0.52), stone, 0, 0.24, 0, torso);
  mesh(B(1.12, 0.52, 0.72), stone, 0, 0.6, 0, torso);
  const coreG = new THREE.Group(); coreG.position.set(0, 0.62, 0.38); torso.add(coreG);
  const cr = mesh(new THREE.OctahedronGeometry(0.15, 0), core, 0, 0, 0.04, coreG); cr.scale.y = 1.4;
  const frame = mesh(new THREE.TorusGeometry(0.2, 0.04, 4, 8), gold, 0, 0, 0, coreG);
  for (const s of [-1, 1]){ const p = mesh(B(0.5, 0.26, 0.62), rune, 0.68 * s, 0.86, 0, torso); p.rotation.z = -0.25 * s;
    for (let k = 0; k < 3; k++){ const sp = mesh(new THREE.ConeGeometry(0.06, 0.2, 4), stone, (0.56 + k * 0.12) * s, 1.05 - k * 0.03, -0.1 + k * 0.1, torso); sp.rotation.z = -0.3 * s; }
    mesh(new THREE.ConeGeometry(0.08, 0.14, 4), moss, 0.8 * s, 1.02, 0.18, torso); }
  const plates = [0.3, -0.3].map(z => { const P = new THREE.Group(); P.position.set(0, -0.02, z); torso.add(P); mesh(B(0.38, 0.42, 0.05), rune, 0, -0.21, 0, P); return P; });
  const head = new THREE.Group(); head.position.set(0, 0.98, 0.05); torso.add(head);
  const helm = boxFace(0.48, 0.44, 0.48, face, stone); helm.position.y = 0.2; head.add(helm);
  mesh(B(0.1, 0.18, 0.44), gold, 0, 0.5, -0.02, head);
  for (const s of [-1, 1]){ const h = mesh(new THREE.ConeGeometry(0.06, 0.28, 4), gold, 0.28 * s, 0.34, 0, head); h.rotation.z = -1.1 * s; }
  mesh(new THREE.ConeGeometry(0.07, 0.12, 4), moss, -0.14, 0.45, 0.14, head);
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.68 * s, 0.78, 0); torso.add(A);
    mesh(B(0.3, 0.34, 0.32), stone, 0, -0.17, 0, A);
    const el = new THREE.Group(); el.position.y = -0.34; A.add(el); A.userData.el = el;
    mesh(B(0.34, 0.28, 0.36), rune, 0, -0.14, 0, el); mesh(B(0.46, 0.38, 0.46), fist, 0, -0.44, 0.02, el); return A; });
  const halo = new THREE.Group(); halo.position.set(0, 1.25, -0.5); torso.add(halo);
  for (let i = 0; i < 7; i++){ const a = i / 7 * TAU; const p = mesh(B(0.2, 0.34, 0.1), i % 2 ? rune : stone, Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0, halo); p.rotation.z = a; }
  const tele = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.04, 0); tele.visible = false;
  const sc = 1.8; g.scale.setScalar(sc);
  return newEnemy('boss', g, body, S, { isBoss: true, bossName: 'Guardián de las ruinas', hp: 900, r: 0.62 * sc, speed: 1.6, numY: 2.05 * sc, legs, arms, torso, tele, heavy: true, scale: sc,
    chargesLeft: 0, bt: 2, halo, coreG, plates, faceMat: face, runeMat: rune, blinkT: 2, flair: guardianFlair });
}
function guardianFlair(e, dt){
  e.halo.rotation.z += dt * 0.6; e.halo.position.y = 1.25 + Math.sin(time * 2) * 0.05;
  e.mats[1].em = 0.25 + 0.3 * (0.5 + 0.5 * Math.sin(time * 3)); e.mats[0].em = 0; 
  e.coreG.rotation.z = time * 1.5; e.coreG.scale.setScalar(1 + Math.sin(time * 6) * 0.08);
  for (const A of e.arms) A.userData.el.rotation.x = Math.min(0, A.rotation.x) * 0.6 - 0.12;
  e.plates[0].rotation.x = -Math.max(0, e.legs[0].rotation.x, e.legs[1].rotation.x) * 0.7; e.plates[1].rotation.x = Math.max(0, -e.legs[0].rotation.x, -e.legs[1].rotation.x) * 0.7;
  const angry = ['windup', 'charge', 'jumpW', 'air', 'slamW', 'summon'].includes(e.state);
  e.blinkT -= dt; const dim = e.blinkT < 0.1; if (e.blinkT <= 0) e.blinkT = 2 + rnd() * 3;
  e.faceMat.uniforms.uMap.value = angry ? gFaceA : dim ? gFaceD : gFaceN;
  if (angry && rnd() < dt * 20) spawnFx(e.g.position.x, e.numY - 0.3, e.g.position.z, (rnd() - 0.5), 1, (rnd() - 0.5), 0xff5030, 0.05, 0.3, 0, 0);
}

/* ---------- El de los Seis Ojos ---------- */
const sxKimono = texAsset('jefes/seis-ojos-kimono');
const sxHakama = texAsset('jefes/seis-ojos-hakama');
const sxSkin = texAsset('jefes/seis-ojos-piel');
const sxHair = texAsset('jefes/seis-ojos-pelo');
const sxFaceN = texAsset('jefes/seis-ojos-cara'), sxFaceB = texAsset('jefes/seis-ojos-cara-parpadeo'), sxFaceR = texAsset('jefes/seis-ojos-cara-furia');
const sxBlade = texAsset('jefes/seis-ojos-hoja');
const sxWrap = texAsset('jefes/seis-ojos-empunadura');
function makeSixEyes2(){
  const g = new THREE.Group(); scene.add(g);
  const kim = texMat(sxKimono), hak = texMat(sxHakama), skin = texMat(sxSkin), hair = texMat(sxHair), face = texMat(sxFaceN);
  const gold = makeMat(0xd9a441), wood = makeMat(0x3a2418), blade = texMat(sxBlade, { emissive: 0.35 }), wrap = texMat(sxWrap), bone = makeMat(0xe8e0d0);
  const S = [matEntry(kim), matEntry(hak), matEntry(skin), matEntry(hair), matEntry(face), matEntry(gold), matEntry(wood), matEntry(blade, 0.35), matEntry(wrap)];
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.2 * s, 0.9, 0); body.add(L);
    mesh(B(0.34, 0.5, 0.42), hak, 0, -0.25, 0, L); mesh(B(0.42, 0.32, 0.48), hak, 0, -0.62, 0, L); mesh(B(0.2, 0.07, 0.3), wood, 0, -0.86, 0.04, L); return L; });
  const torso = new THREE.Group(); torso.position.y = 0.9; body.add(torso);
  mesh(B(0.64, 0.16, 0.42), gold, 0, 0.06, 0, torso); mesh(B(0.66, 0.6, 0.4), kim, 0, 0.42, 0, torso);
  for (const s of [-1, 1]){ const l = mesh(B(0.07, 0.5, 0.02), makeMat(0xe8e0f0), 0.1 * s, 0.46, 0.205, torso); l.rotation.z = 0.35 * s; }
  const sheath = new THREE.Group(); sheath.position.set(-0.36, 0.08, 0.1); sheath.rotation.set(0.2, 0, 1.25); torso.add(sheath);
  mesh(B(0.07, 1.1, 0.06), wood, 0, 0.3, 0, sheath); for (let k = 0; k < 3; k++) mesh(B(0.09, 0.03, 0.08), gold, 0, -0.1 + k * 0.4, 0, sheath);
  const head = new THREE.Group(); head.position.y = 0.72; torso.add(head);
  const hd = boxFace(0.42, 0.46, 0.42, face, skin); hd.position.y = 0.23; head.add(hd);
  mesh(B(0.46, 0.14, 0.46), hair, 0, 0.5, -0.02, head); mesh(B(0.46, 0.4, 0.1), hair, 0, 0.3, -0.24, head);
  for (const s of [-1, 1]){ const h = mesh(new THREE.ConeGeometry(0.045, 0.2, 4), bone, 0.15 * s, 0.6, 0.06, head); h.rotation.z = -0.35 * s; }
  const strands = []; for (let i = 0; i < 6; i++){ const st = new THREE.Group(); st.position.set(-0.19 + i * 0.076, 0.44, -0.22); head.add(st);
    mesh(B(0.07, 0.95 - Math.abs(i - 2.5) * 0.08, 0.05), hair, 0, -0.45, 0, st); strands.push(st); }
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.42 * s, 0.66, 0); torso.add(A);
    mesh(B(0.34, 0.5, 0.42), kim, 0.04 * s, -0.25, 0, A); mesh(B(0.14, 0.26, 0.14), skin, 0, -0.58, 0.02, A); mesh(B(0.14, 0.12, 0.16), skin, 0, -0.76, 0.03, A); return A; });
  const kat = new THREE.Group(); kat.position.set(0, -0.78, 0.08); kat.rotation.x = Math.PI / 2 - 0.3; arms[1].add(kat);
  mesh(B(0.06, 0.34, 0.06), wrap, 0, 0, 0, kat); mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.03, 8), gold, 0, 0.19, 0, kat);
  const bl = mesh(B(0.05, 1.6, 0.015), blade, 0, 1.0, 0, kat);
  const tele = mesh(circleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); tele.visible = false;
  const line = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); line.visible = false;
  const sc = 1.7; g.scale.setScalar(sc);
  return newEnemy('sixeyes', g, body, S, { isBoss: true, heavy: true, bossName: 'El de los Seis Ojos', bossHp: 1500, hp: 1500, r: 0.5 * sc, numY: 2.2 * sc, scale: sc, speed: 2.1,
    legs, arms, torso, tele, line, parts: [line], strands, faceMat: face, bladeMat: blade, blinkT: 2, seq: 0, cd: 1.2, upd: updSixEyes, flair: sixFlair });
}
function sixFlair(e, dt){
  const rage = ['cresW', 'dashW', 'moonW', 'dash'].includes(e.state);
  e.blinkT -= dt; if (e.blinkT <= 0) e.blinkT = 2 + rnd() * 3;
  e.faceMat.uniforms.uMap.value = rage ? sxFaceR : e.blinkT < 0.12 ? sxFaceB : sxFaceN;
  const mv = Math.hypot(e.vx || 0, e.vz || 0);
  e.strands.forEach((s, i) => { s.rotation.x = 0.25 + Math.sin(time * 3 + i) * 0.08 + Math.min(0.6, mv * 0.08); s.rotation.z = Math.sin(time * 2.2 + i * 0.7) * 0.06; });
  e.mats[7].em = rage ? 0.9 : 0.3 + 0.25 * Math.abs(Math.sin(time * 4));
  if (rage && rnd() < dt * 25) spawnFx(e.g.position.x, e.numY - 0.4, e.g.position.z, (rnd() - 0.5) * 0.5, 0.8, (rnd() - 0.5) * 0.5, 0xc89aff, 0.05, 0.4, 0, 0);
}

/* ---------- Míster Confianza ---------- */
const stSuit = texAsset('jefes/mister-confianza-traje');
const stChest = texAsset('jefes/mister-confianza-pecho');
const stCape = texAsset('jefes/mister-confianza-capa');
const stBoot = texAsset('jefes/mister-confianza-bota');
const stGlove = texAsset('jefes/mister-confianza-guante');
const stFaceN = texAsset('jefes/mister-confianza-cara'), stFaceW = texAsset('jefes/mister-confianza-cara-guino');
const stHair = texAsset('jefes/mister-confianza-pelo');
function makeStar2(){
  const g = new THREE.Group(); scene.add(g);
  const suit = texMat(stSuit), chest = texMat(stChest), face = texMat(texAsset('jefes/mister-confianza-cara')), boot = texMat(stBoot), glove = texMat(stGlove), hair = texMat(stHair), skin = makeMat(0xe8b894);
  const capeMat = texMat(stCape, { side: THREE.DoubleSide }), gold = makeMat(0xffd23a, { emissive: 0.4 }), red = makeMat(0xd83a3a);
  const S = [matEntry(suit), matEntry(chest), matEntry(face), matEntry(boot), matEntry(glove), matEntry(hair), matEntry(skin), matEntry(capeMat), matEntry(gold, 0.4), matEntry(red)];
  const body = new THREE.Group(); g.add(body);
  const legs = [-1, 1].map(s => { const L = new THREE.Group(); L.position.set(0.25 * s, 0.9, 0); body.add(L); mesh(B(0.3, 0.52, 0.32), suit, 0, -0.26, 0, L); mesh(B(0.33, 0.38, 0.38), boot, 0, -0.71, 0.03, L); return L; });
  const torso = new THREE.Group(); torso.position.y = 0.95; body.add(torso);
  mesh(B(0.64, 0.14, 0.44), red, 0, 0.04, 0, torso); mesh(B(0.2, 0.12, 0.05), gold, 0, 0.04, 0.23, torso);
  mesh(B(0.6, 0.3, 0.4), suit, 0, 0.24, 0, torso);
  const ch = boxFace(1.12, 0.62, 0.6, chest, suit); ch.position.y = 0.62; torso.add(ch);
  const head = new THREE.Group(); head.position.y = 1.0; torso.add(head);
  const hd = boxFace(0.5, 0.54, 0.48, face, skin); hd.position.y = 0.26; head.add(hd);
  mesh(B(0.44, 0.16, 0.12), skin, 0, 0.04, 0.2, head);
  mesh(B(0.54, 0.14, 0.5), hair, 0, 0.56, -0.02, head);
  const q = mesh(B(0.3, 0.14, 0.32), hair, 0.05, 0.66, 0.12, head); q.rotation.set(-0.5, 0, 0.2);
  const curl = mesh(new THREE.TorusGeometry(0.06, 0.02, 4, 8), hair, 0.02, 0.5, 0.27, head); curl.rotation.y = 0.5;
  const arms = [-1, 1].map(s => { const A = new THREE.Group(); A.position.set(0.7 * s, 0.82, 0); torso.add(A);
    mesh(B(0.28, 0.42, 0.3), suit, 0, -0.21, 0, A); const el = new THREE.Group(); el.position.y = -0.42; A.add(el); A.userData.el = el;
    mesh(B(0.32, 0.36, 0.34), glove, 0, -0.18, 0.02, el); return A; });
  const cape = new THREE.Group(); cape.position.set(0, 0.95, -0.32); torso.add(cape);
  const cg = new THREE.PlaneGeometry(1.3, 2.0, 6, 10); cg.translate(0, -1.0, 0);
  const capeM = mesh(cg, capeMat, 0, 0, 0, cape); capeM.userData.base = Float32Array.from(cg.attributes.position.array);
  const line = mesh(teleGeo, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); line.visible = false;
  const beam = new THREE.Group(); scene.add(beam); beam.visible = false;
  mesh(beamGeo, makeMat(0xfff6c0, { emissive: 1 }), 0, 0, 0, beam); const bo = mesh(beamGeo, makeMat(0xffd23a, { emissive: 1, opacity: 0.5, side: THREE.DoubleSide }), 0, 0, 0, beam); bo.scale.set(1.8, 1.8, 1);
  const sc = 1.45; g.scale.setScalar(sc);
  return newEnemy('star', g, body, S, { isBoss: true, heavy: true, bossName: 'Míster Confianza', bossHp: 2000, hp: 2000, r: 0.75 * sc, numY: 4.0, scale: sc, speed: 2.4,
    legs, arms, torso, cape, capeM, line, beam, parts: [line, beam], st: 'idle', seq: 0, upd: updStar, faceMat: face, winkT: 3, flair: starFlair,
    onSpawn: e => { e.g.scale.setScalar(sc); e.spawnT = 0; e.t = 1.4; if (chMode === 'arcade'){ e.g.position.set(8, 0, 0); } play('superOn'); } });
}
function starFlair(e, dt){
  const pos = e.capeM.geometry.attributes.position, base = e.capeM.userData.base, speed = Math.hypot(e.vx || 0, e.vz || 0);
  for (let i = 0; i < pos.count; i++){ const y = base[i * 3 + 1], x = base[i * 3], d = -y / 2;
    pos.setZ(i, base[i * 3 + 2] - d * d * (0.25 + Math.min(1.2, speed * 0.15)) + Math.sin(time * 6 + y * 2.5 + x) * 0.07 * d); }
  pos.needsUpdate = true; e.capeM.geometry.computeVertexNormals();
  for (const A of e.arms) A.userData.el.rotation.x = Math.min(0, A.rotation.x) * 0.8 - 0.1;
  e.winkT -= dt; if (e.winkT <= 0){ e.winkT = 3 + rnd() * 3; }
  const wink = e.winkT < 0.4; e.faceMat.uniforms.uMap.value = wink ? stFaceW : stFaceN;
  if (wink && rnd() < dt * 10){ tA.set(e.g.position.x, e.numY - 0.9, e.g.position.z); spawnFx(tA.x + 0.2, tA.y, tA.z + 0.4, 0, 0.5, 0, 0xfff6a0, 0.07, 0.4, 0, 0); }
}

/* ---------- Gashadokuro: huesos con textura, calavera pintada y cuerda sagrada ---------- */
const gsBone = texAsset('jefes/gashadokuro-hueso');
const gsSkull = texAsset('jefes/gashadokuro-craneo');
function upgradeSkeleton(e){
  const bone = texMat(gsBone), face = texMat(gsSkull);
  for (const s of [e.mats[0], e.mats[3]]){ s.m.uniforms.uMap.value = gsBone; s.m.uniforms.uHasMap.value = 1; s.c = s.base = 0xffffff; }
  const fp = mesh(new THREE.PlaneGeometry(1.96, 1.66), face, 0, 0.2, 1.012, e.skull); e.mats.push(matEntry(face));
  const rope = makeMat(0xc8a060), paper = makeMat(0xf4f0e8, { side: THREE.DoubleSide });
  const shime = new THREE.Group(); shime.position.set(0, 5.3, 0.1); e.root.add(shime);
  const ring = mesh(new THREE.TorusGeometry(1.4, 0.14, 5, 16), rope, 0, 0, 0, shime); ring.rotation.x = Math.PI / 2; ring.scale.z = 0.6;
  const papers = []; for (let i = 0; i < 5; i++){ const a = -0.9 + i * 0.45, p = new THREE.Group(); p.position.set(Math.sin(a) * 1.4, -0.1, Math.cos(a) * 0.84); shime.add(p);
    for (let k = 0; k < 3; k++){ const z = mesh(new THREE.PlaneGeometry(0.22, 0.26), paper, (k % 2) * 0.08, -0.15 - k * 0.24, 0, p); z.rotation.y = a; } papers.push(p); }
  e.papers = papers; e.flair = skelFlair; return e;
}
function skelFlair(e, dt){
  e.papers.forEach((p, i) => { p.rotation.z = Math.sin(time * 2 + i) * 0.2; p.rotation.x = Math.sin(time * 1.7 + i * 1.3) * 0.15; });
  if (rnd() < dt * 18){ e.skull.getWorldPosition(tA); const s = rnd() < 0.5 ? -1 : 1;
    spawnFx(tA.x + 0.45 * s, tA.y + 0.35, tA.z + 1.1, (rnd() - 0.5) * 0.3, 1.2, 0.2, rnd() < 0.5 ? 0x7fd8ff : 0xc8f0ff, 0.09, 0.5, -1, 0); }
}
MAKERS.boss = makeGuardian; MAKERS.sixeyes = makeSixEyes2; MAKERS.star = makeStar2; MAKERS.skeleton = () => upgradeSkeleton(makeSkeleton());

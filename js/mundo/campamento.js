'use strict';
/* ===== Campamento: la zona de inicio entre partidas =====
   Tovan revive aquí al caer: Lumen lo recompone con fragmentos sobre el altar del centro. Se juega como una oleada
   más (gameState 'play' con wave = 0 y sin enemigos), así que se anda, se rueda y se salta igual, y se sale a la
   partida por el arco del norte. Los sitios se usan acercándose y atacando (J o el botón de atacar, que cambia de
   nombre): el armario es el vestidor (ya no está en los menús), el altar de cristal el santuario, el tablón los
   logros y el caballete los finales. El decorado crece con lo desbloqueado: sombreros y caras en el estante, armas
   en el armero, chucherías de los efectos y los cuerpos, bustos de los jefes derrotados (los demás, tapados con una
   tela), cuadros de los finales, notas de los logros, banderines de los títulos, una raya de tiza por partida y un
   cristal por cada mejora del santuario.
   Estados: HUB.fase 'revive' | 'llega' (gameState 'hubCine'), HUB.menu (gameState 'hubMenu'). Todo lo que se
   construye usa su propio azar (mulberry32): nada de rnd() al cargar. */
const HUB_R = 8.3, HUB_MURO = 9.1, HUB_REV = { frag: 1.55, forma: 0.85, despierta: 1.15 };
const HUB = { on: false, hecho: false, W: null, deco: null, M: null, fase: null, t: 0, menu: null, cerca: null, sale: -1, directo: false, prev: null, brillo: null, semilla: 1,
  camK: 0, camQuiere: false, decoMats: [], camP: new V3(), camT: new V3(), cam: new THREE.PerspectiveCamera(), dt: 0.016, padTxt: null, decoClave: '',
  obst: [], obstD: [], tapa: [], puntos: [], frags: [], llamas: [], brasas: [], luciernagas: [], cristales: [], runas: null, portal: null, granCristal: null };
// sitios fijos [x, z] y bustos de los jefes [tipo, ángulo en grados] alrededor del arco
const HUB_SITIO = { armario: [-7.45, -0.2], espejo: [-7.05, 1.75], estante: [-7.1, -2.6], armero: [-5.4, 5.0], santuario: [7.3, -0.3], tablon: [6.4, 3.5],
  caballete: [3.5, 6.75], hoguera: [-2.9, 4.7], pizarra: [-0.9, 6.7], cajas: [-3.9, 2.7] };
const HUB_BUSTOS = [['boss', -74], ['dragon', -62], ['skeleton', -50], ['star', -38], ['teapot', -106], ['error', -118], ['sixeyes', -130], ['finalcat', -142]];
const hubA = (deg, r) => [Math.cos(deg * Math.PI / 180) * r, Math.sin(deg * Math.PI / 180) * r];
const hubMira = (x, z) => Math.atan2(-x, -z);   // giro en y para que el frente (+z) mire al centro
const hubFrente = ([x, z], d) => { const r = Math.hypot(x, z) || 1; return [x - x / r * d, z - z / r * d]; };
const hubV = new V3(), hubV2 = new V3(), hubPr = new V3();

/* ---------- Música y sonidos ---------- */
SONGS.campamento = { bpm: 64, style: 'pad', bars: [[53, 57, 60], [52, 55, 60], [50, 53, 57], [48, 52, 55]] };
Object.assign(SFX, {
  hubFrag:   () => { tone({ type: 'sine', f0: 220, f1: 880, dur: 1.5, vol: 0.05, attack: 0.6, rv: 0.8 }); tone({ type: 'triangle', f0: 330, f1: 1320, dur: 1.5, vol: 0.03, attack: 0.7, rv: 0.8 });
    noise({ dur: 1.4, vol: 0.035, f0: 600, f1: 5000, q: 2, attack: 0.8, rv: 0.6 }); },
  hubBrote:  () => { seq_([[72, 0.1], [79, 0.1], [84, 0.1], [88, 0.5]], 'triangle', 0.07, 0.06, 0.8); tone({ type: 'sine', f0: NOTE(48), dur: 1.0, vol: 0.12, rv: 0.6 }); },
  hubLatido: () => { tone({ type: 'sine', f0: 72, f1: 44, dur: 0.16, vol: 0.24, rv: 0.1 }); tone({ type: 'sine', f0: 66, f1: 40, dur: 0.16, vol: 0.18, when: 0.21, rv: 0.1 }); },
  hubTic:    () => tone({ type: 'triangle', f0: 1400 + Math.random() * 900, dur: 0.05, vol: 0.025, rv: 0.4 }),
  hubPuerta: () => { noise({ dur: 0.35, vol: 0.05, f0: 900, f1: 500, q: 6, rv: 0.2 }); tone({ type: 'sawtooth', f0: 170, f1: 120, dur: 0.3, vol: 0.025, rv: 0.2 }); },
  hubSale:   () => { noise({ dur: 0.6, vol: 0.08, f0: 400, f1: 3000, q: 1.5, rv: 0.5 }); tone({ type: 'sine', f0: 300, f1: 900, dur: 0.5, vol: 0.05, rv: 0.6 }); }
});

/* ---------- Piezas ---------- */
// copia de un grupo sin userData (los estéticos guardan nodos dentro y clone() intentaría serializarlos)
function hubCopia(src){
  const g = new THREE.Group(); g.position.copy(src.position); g.rotation.copy(src.rotation); g.scale.copy(src.scale);
  for (const c of src.children){ if (!c.visible) continue;
    if (c.isMesh){ const m = new THREE.Mesh(c.geometry, c.material); m.position.copy(c.position); m.rotation.copy(c.rotation); m.scale.copy(c.scale); g.add(m); }
    else if (c.children && c.children.length) g.add(hubCopia(c)); }
  return g;
}
const hubCaja = (w, h, d, mat, x, y, z, p) => mesh(B(w, h, d), mat, x, y, z, p);
// cabeza de maniquí: la de Tovan (tres mallas: cara, pelo y piel) en madera clara, en el mismo sitio que en su cuello
function hubManiqui(g){ for (const c of headMesh.children) if (c.isMesh) mesh(c.geometry, HUB.M.maniqui, 0, 0.26, 0.02, g); }
function hubMats(){
  const T = n => texAsset(n), madera = T('mundo/anticuario-suelo');
  return {
    suelo: makeMat(0xffffff, { map: MPT['ruinas-losas'], vc: true, relleno: false }), tierra: makeMat(0xffffff, { map: MPT['ruinas-tierra'], vc: true, relleno: false }),
    madera: makeMat(0xc89a74, { map: madera }), maderaO: makeMat(0x7a5238, { map: madera }), piedra: makeMat(0xc8c2d4, { map: T('mundo/ruinas-suelo') }),
    piedraO: makeMat(0x8a8498, { map: T('mundo/ruinas-suelo') }), ladrillo: makeMat(0xb8b0c4, { map: T('mundo/ruinas-ladrillo') }),
    runas: makeMat(0x8ff6ff, { map: T('efectos/runas-linterna'), emissive: 0.4 }), cristal: makeMat(0x8ff6ff, { emissive: 0.85 }), oro: makeMat(0xffd870, { emissive: 0.75 }),
    fuego: makeMat(0xff7a22, { emissive: 1 }), fuego2: makeMat(0xffd25a, { emissive: 1 }), brasa: makeMat(0xff8a3a, { emissive: 1 }), luciernaga: makeMat(0xd8ff7a, { emissive: 1 }),
    tela: makeMat(0x3a2c4c), telaO: makeMat(0x261c34), cuerda: makeMat(0xd8c8a0), negro: makeMat(0x141418), maniqui: makeMat(0xe8d6b8), corcho: makeMat(0x9a6a42),
    papel: makeMat(0xf2ead8, { emissive: 0.12 }), chincheta: makeMat(0xd83a3a, { emissive: 0.3 }), pizarra: makeMat(0x1c2420), cristalE: makeMat(0xffffff, { map: hubPintaEspejo(), emissive: 0.55 }),
    portal: makeMat(0xffffff, { map: hubPintaPortal(), emissive: 1 }), caja: makeMat(0xffffff, { map: T('cinematica/caja') }), paquete: makeMat(0xffffff, { map: T('cinematica/paquete') }),
    ropa: [0xc83a3a, 0x3a5ac8, 0xe8dcc0, 0x3a8a5a].map(c => makeMat(c, { map: madera })), banderin: [0xd83a3a, 0xf2c13a, 0x3a8ad8, 0x4ac06a, 0xeee4d0, 0x9a5ad8].map(c => makeMat(c, { side: THREE.DoubleSide })),
    caras: { boss: T('jefes/guardian-cara'), bossP: T('jefes/guardian-piedra'), dragon: T('jefes/ryujin-escamas'), skeleton: T('jefes/gashadokuro-craneo'), star: T('jefes/mister-confianza-cara'),
      starP: T('jefes/mister-confianza-pelo'), error: T('jefes/error-404-pantallazo-azul'), sixeyes: T('jefes/seis-ojos-cara'), finalcat: T('jefes/gato-cara'), billete: T('objetos/billete') }
  };
}
function hubPintaPortal(){ return canvasTex(32, 64, (g, w, h) => { const im = g.createImageData(w, h), R = mulberry32(41);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++){ const v = y / (h - 1), u = (x - (w - 1) / 2) / ((w - 1) / 2), i = (y * w + x) * 4;
    const dentro = v > 0.2 || Math.hypot(u, (0.2 - v) / 0.2) < 1, k = Math.pow(v, 0.8), n = R() * 0.08;
    im.data[i] = 40 + 170 * k + 40 * n; im.data[i + 1] = 90 + 150 * k; im.data[i + 2] = 170 + 85 * k; im.data[i + 3] = dentro ? 255 : 0; } g.putImageData(im, 0, 0); }); }
function hubPintaEspejo(){ return canvasTex(32, 64, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#6a7ab8'); gr.addColorStop(0.5, '#28305a'); gr.addColorStop(1, '#141a34'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(220,240,255,.55)'; for (const [x0, k] of [[4, 5], [13, 2]]) for (let y = 0; y < h; y++){ const x = x0 + y * 0.35; g.fillRect(x | 0, y, k, 1); } }); }

/* ---------- El escenario (se construye una vez) ---------- */
function hubConstruye(){
  if (HUB.hecho) return; HUB.hecho = true;
  const M = HUB.M = hubMats(), W = HUB.W = new THREE.Group(), R = mulberry32(3030); W.visible = false; scene.add(W);
  const S = HUB_SITIO, ob = (x, z, r) => HUB.obst.push({ x, z, r }), tapa = (o, x, z, r, h) => { HUB.tapa.push({ o, x, z, r, h }); return o; };
  // suelo de losas con la luz de la hoguera, del santuario y del altar horneada en los vértices
  const sg = new THREE.RingGeometry(0.01, HUB_MURO + 0.6, 72, 22); sg.rotateX(-Math.PI / 2);
  { const p = sg.attributes.position, uv = sg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 2.2, p.getZ(i) / 2.2); }
  mpColores(sg, (c, x, y, z) => { const r = Math.hypot(x, z); c.multiplyScalar((0.62 + 0.16 * mpFbm(x * 0.3, z * 0.3, 3)) * (1 - 0.55 * mpSmooth(7.6, HUB_MURO + 0.4, r)));
    const pool = (px, pz, rad, cr, cg, cb) => { const d = Math.hypot(x - px, z - pz); if (d < rad){ const k = Math.pow(1 - d / rad, 1.7); c.r += cr * k; c.g += cg * k; c.b += cb * k; } };
    pool(S.hoguera[0], S.hoguera[1], 5.2, 0.62, 0.3, 0.06); pool(S.santuario[0], S.santuario[1], 3.6, 0.05, 0.3, 0.42); pool(0, 0, 2.8, 0.06, 0.22, 0.3); pool(0, -8.6, 3.2, 0.08, 0.22, 0.32); });
  W.add(new THREE.Mesh(sg, M.suelo));
  const tg = new THREE.RingGeometry(HUB_MURO + 0.4, 46, 48, 8); tg.rotateX(-Math.PI / 2); tg.translate(0, -0.01, 0);
  { const p = tg.attributes.position, uv = tg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 3, p.getZ(i) / 3); }
  mpColores(tg, (c, x, y, z) => c.multiplyScalar(0.42 * (1 - 0.6 * mpSmooth(10, 30, Math.hypot(x, z))) * (0.8 + 0.3 * mpFbm(x * 0.2, z * 0.2, 2))));
  W.add(new THREE.Mesh(tg, M.tierra));
  // muro en ruinas alrededor (bajo por el sur, que es donde suele estar la cámara) y columnas en las juntas
  const angs = []; for (let a = -72; a <= 252; a += 18) angs.push(a);
  angs.forEach((a, i) => { const [x, z] = hubA(a, HUB_MURO), alta = z < -1.5, h = alta ? 2.3 + R() * 0.7 : 1.0 + R() * 0.45;
    if (i % 2 === 0 || alta) tapa(mpColumna(W, x, z, alta ? 2.6 + R() * 0.8 : 1.2 + R() * 0.5, { rota: R() < 0.45 }), x, z, 0.5, alta ? 3.4 : 1.9);
    if (i < angs.length - 1){ const [x1, z1] = hubA(angs[i + 1], HUB_MURO), m = mpMuro(W, x, z, x1, z1, h, 0.55, 0.7); tapa(m, (x + x1) / 2, (z + z1) / 2, 1.5, h); } });
  // fuera: rocas y columnas sueltas que se pierden en la niebla
  const nRocas = mpRocasPend.length;
  for (let i = 0; i < 14; i++){ const a = R() * TAU, r = 12 + R() * 14, x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (i % 3) mpRoca(W, x, z, 0.8 + R() * 1.6, MPM.rocaR, 'musgo'); else mpColumna(W, x, z, 2 + R() * 3, { rota: true }); }
  mpRocasPend.length = nRocas;   // (estas rocas no son de ningún mapa grande)
  // el arco del norte: la salida a las ruinas
  for (const s of [-1, 1]){ tapa(mpColumna(W, 1.55 * s, -9.05, 3.1, {}), 1.55 * s, -9.05, 0.5, 3.8); ob(1.55 * s, -9.05, 0.55);
    const [ex, ez] = hubA(s > 0 ? -72 : -108, HUB_MURO); tapa(mpMuro(W, 1.95 * s, -9.0, ex, ez, 2.6, 0.55, 0.4), (1.95 * s + ex) / 2, (-9 + ez) / 2, 0.7, 2.6); }
  const din = mpColores(new THREE.BoxGeometry(4.2, 0.5, 0.9, 6, 1, 1), (c, x, y) => c.multiplyScalar(0.75 + 0.25 * (y + 0.25) / 0.5));
  { const uv = din.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 3, uv.getY(i) * 0.5); }
  const dintel = new THREE.Mesh(din, MPM.muro); dintel.position.set(0, 4.0, -9.05); W.add(dintel); tapa(dintel, 0, -9.05, 2.0, 4.3);
  HUB.portal = mesh(new THREE.PlaneGeometry(2.6, 3.7), M.portal, 0, 1.85, -9.2, W);
  const farol = mesh(new THREE.OctahedronGeometry(0.16, 0), M.cristal, 0, 3.45, -9.05, W); HUB.cristales.push({ m: farol, y: 3.45, f: 1.3 });
  mpFundido(W, 0, -10.6, 0, 1, src => { const cam = mesh(B(2.3, 0.04, 6), M.piedraO, 0, 0.01, -1.5, src); scaleUV(cam.geometry, 1, 3); });
  // el altar del centro, donde Lumen recompone a Tovan
  mpFundido(W, 0, 0, 0, 1, src => { mesh(C(1.45, 1.55, 0.06, 40), M.piedra, 0, 0.03, 0, src);
    const aro = mesh(new THREE.TorusGeometry(1.52, 0.08, 6, 40), M.piedraO, 0, 0.05, 0, src); aro.rotation.x = Math.PI / 2;
    for (let k = 0; k < 4; k++){ const [x, z] = hubA(45 + k * 90, 2.35); mesh(C(0.13, 0.22, 1.25, 4), M.piedra, x, 0.62, z, src); mesh(C(0.26, 0.28, 0.12, 4), M.piedraO, x, 0.06, z, src); } });
  HUB.runas = mesh(new THREE.PlaneGeometry(2.7, 2.7), M.runas, 0, 0.068, 0, W); HUB.runas.rotation.x = -Math.PI / 2;
  for (let k = 0; k < 4; k++){ const [x, z] = hubA(45 + k * 90, 2.35); ob(x, z, 0.3); HUB.cristales.push({ m: mesh(new THREE.OctahedronGeometry(0.15, 0), M.cristal, x, 1.55, z, W), y: 1.55, f: 1 + k * 0.3 }); }
  // el vestidor: armario abierto, espejo y estante
  hubArmario(W); hubEspejo(W); hubEstante(W); hubArmero(W);
  // el santuario: altar escalonado con el cristal grande
  const [sx, sz] = S.santuario;
  mpFundido(W, sx, sz, hubMira(sx, sz), 1, src => { mesh(C(1.2, 1.3, 0.22, 8), M.piedraO, 0, 0.11, 0, src); mesh(C(0.9, 1.0, 0.24, 8), M.piedra, 0, 0.34, 0, src);
    mesh(C(0.42, 0.55, 1.0, 6), M.piedra, 0, 0.95, 0, src); mesh(C(0.62, 0.48, 0.14, 6), M.piedraO, 0, 1.5, 0, src);
    for (let k = 0; k < 6; k++){ const a = k / 6 * TAU; mesh(C(0.06, 0.06, 0.24, 6), M.papel, Math.cos(a) * 0.98, 0.58, Math.sin(a) * 0.98, src); mesh(new THREE.OctahedronGeometry(0.04, 0), M.fuego2, Math.cos(a) * 0.98, 0.74, Math.sin(a) * 0.98, src); } });
  ob(sx, sz, 1.25);
  HUB.granCristal = mesh(new THREE.OctahedronGeometry(0.42, 0), M.cristal, sx, 2.25, sz, W); HUB.granCristal.scale.set(0.8, 1.35, 0.8);
  // tablón de los logros, caballete de los finales, pizarra de las partidas
  for (const [k, w, h] of [['tablon', 1.7, 1.15], ['caballete', 2.5, 1.4]]){ const [x, z] = S[k], rot = hubMira(x, z);
    const g = mpFundido(W, x, z, rot, 1, src => { for (const s of [-1, 1]) mesh(B(0.1, 2.25, 0.1), M.maderaO, (w / 2 + 0.05) * s, 1.12, -0.02, src);
      hubCaja(w + 0.16, h + 0.16, 0.06, M.maderaO, 0, 1.45, -0.04, src); hubCaja(w, h, 0.04, k === 'tablon' ? M.corcho : M.telaO, 0, 1.45, 0, src);
      mesh(new THREE.ConeGeometry(0.18, 0.2, 4), M.maderaO, 0, 2.3, -0.02, src).rotation.y = Math.PI / 4; });
    tapa(g, x, z, w / 2 + 0.2, 2.4); for (const s of [-1, 1]) ob(x + Math.cos(rot) * (w / 3) * s, z - Math.sin(rot) * (w / 3) * s, 0.42); }
  { const [x, z] = S.pizarra; tapa(mpFundido(W, x, z, hubMira(x, z), 1, src => { for (const s of [-1, 1]){ const pa = mesh(B(0.07, 1.5, 0.07), M.maderaO, 0.55 * s, 0.72, 0.1, src); pa.rotation.x = -0.18; }
    hubCaja(1.2, 0.86, 0.05, M.maderaO, 0, 1.08, 0.0, src).rotation.x = -0.18; }), x, z, 0.7, 1.6); ob(x, z, 0.55); }
  // la hoguera con troncos para sentarse (sitio para los personajes que vendrán)
  { const [x, z] = S.hoguera; mpFundido(W, x, z, 0, 1, src => {
      for (let k = 0; k < 9; k++){ const a = k / 9 * TAU, r = mesh(new THREE.IcosahedronGeometry(0.17, 0), M.piedraO, Math.cos(a) * 0.55, 0.08, Math.sin(a) * 0.55, src); r.scale.set(1, 0.7, 1); }
      for (let k = 0; k < 4; k++){ const l = mesh(C(0.07, 0.08, 0.85, 6), M.maderaO, 0, 0.18, 0, src); l.rotation.set(Math.PI / 2 - 0.5, k * Math.PI / 2 + 0.4, 0); }
      for (const [a, rr] of [[200, 1.75], [290, 1.7], [20, 1.8]]){ const [bx, bz] = hubA(a, rr), t = mesh(C(0.22, 0.24, 1.3, 8), M.maderaO, bx, 0.22, bz, src); t.rotation.set(0, -a * Math.PI / 180, Math.PI / 2); } });
    ob(x, z, 0.75); for (const [a, rr] of [[200, 1.75], [290, 1.7], [20, 1.8]]){ const [bx, bz] = hubA(a, rr); ob(x + bx, z + bz, 0.45); }
    for (const [h, r, mat, ox, oz, inc] of [[0.78, 0.2, M.fuego, 0, 0, 0], [0.5, 0.15, M.fuego, 0.16, 0.06, 0.35], [0.46, 0.14, M.fuego, -0.13, -0.1, -0.3], [0.42, 0.13, M.fuego, -0.04, 0.17, 0.25],
      [0.5, 0.1, M.fuego2, 0.02, 0.0, 0], [0.3, 0.08, M.fuego2, 0.1, -0.05, 0.3], [0.28, 0.07, M.fuego2, -0.09, 0.07, -0.3]]){
      const f = mesh(new THREE.ConeGeometry(r, h, 5), mat, x + ox, h / 2 + 0.12, z + oz, W); f.rotation.z = inc; HUB.llamas.push({ m: f, h, i: HUB.llamas.length }); }
    for (let k = 0; k < 10; k++){ const b = mesh(B(0.045, 0.045, 0.045), M.brasa, x, -5, z, W); HUB.brasas.push({ m: b, t: k / 10, sx: 0, sz: 0, x, z }); } }
  // paquetes apilados: es un campamento de repartidor
  { const [x, z] = S.cajas; mpFundido(W, x, z, 0.5, 1, src => { hubCaja(0.6, 0.45, 0.5, M.caja, 0, 0.225, 0, src); hubCaja(0.5, 0.4, 0.45, M.caja, 0.05, 0.65, 0.02, src).rotation.y = 0.3;
    hubCaja(0.42, 0.3, 0.36, M.paquete, 0.62, 0.15, 0.25, src).rotation.y = -0.4; hubCaja(0.35, 0.28, 0.3, M.caja, -0.55, 0.14, -0.2, src); }); ob(x, z, 0.65); }
  // luciérnagas y fragmentos para el revivir
  for (let k = 0; k < 16; k++){ const m = mesh(B(0.05, 0.05, 0.05), M.luciernaga, 0, -5, 0, W); HUB.luciernagas.push({ m, a: R() * TAU, r: 2.5 + R() * 5.5, y: 0.5 + R() * 2.2, v: 0.15 + R() * 0.25, f: R() * 6 }); }
  for (let k = 0; k < 44; k++){ const m = mesh(new THREE.OctahedronGeometry(0.06 + (k % 3) * 0.02, 0), k % 3 ? M.cristal : M.oro, 0, -5, 0, W); m.visible = false; HUB.frags.push({ m }); }
  // los sitios que se usan (el aviso sale a la altura «y»)
  HUB.puntos = [
    { id: 'vestidor', nom: 'Vestidor', x: S.armario[0] + 1.35, z: S.armario[1], r: 1.45, ax: S.armario[0], az: S.armario[1], y: 2.8, abre: () => { hubMenu('vestidor'); openWard('hub'); } },
    { id: 'santuario', nom: 'Santuario', r: 1.55, ax: sx, az: sz, y: 3.1, d: 1.6, abre: () => { hubMenu('santuario'); openShrine('hub'); } },
    { id: 'logros', nom: 'Logros', r: 1.35, ax: S.tablon[0], az: S.tablon[1], y: 2.7, d: 1.0, abre: () => { hubMenu('logros'); openAch('hub'); } },
    { id: 'finales', nom: 'Finales', r: 1.4, ax: S.caballete[0], az: S.caballete[1], y: 2.7, d: 1.0, abre: () => { hubMenu('finales'); openEndings(); } },
    { id: 'salida', nom: 'A las ruinas', x: 0, z: -7.5, r: 1.7, ax: 0, az: -9.05, y: 2.6 } ];
  for (const p of HUB.puntos) if (p.d) [p.x, p.z] = hubFrente([p.ax, p.az], p.d);
  // pedestales de los bustos (el busto o la tela, en el decorado)
  for (const [, a] of HUB_BUSTOS){ const [x, z] = hubA(a, 6.6); mpFundido(W, x, z, hubMira(x, z), 1, src => { mesh(B(0.62, 0.95, 0.62), M.piedra, 0, 0.475, 0, src); mesh(B(0.74, 0.1, 0.74), M.piedraO, 0, 0.98, 0, src); mesh(B(0.74, 0.12, 0.74), M.piedraO, 0, 0.06, 0, src); }); ob(x, z, 0.48); }
}
function hubArmario(W){
  const M = HUB.M, [x, z] = HUB_SITIO.armario;
  const g = mpFundido(W, x, z, Math.PI / 2, 1, src => {
    hubCaja(1.5, 2.3, 0.06, M.maderaO, 0, 1.2, -0.33, src); for (const s of [-1, 1]) hubCaja(0.06, 2.3, 0.7, M.madera, 0.72 * s, 1.2, 0, src);
    hubCaja(1.66, 0.12, 0.8, M.madera, 0, 2.4, 0, src); hubCaja(1.74, 0.07, 0.86, M.maderaO, 0, 2.49, 0, src); hubCaja(1.56, 0.12, 0.74, M.maderaO, 0, 0.06, 0, src); hubCaja(1.4, 0.05, 0.6, M.maderaO, 0, 0.55, -0.02, src);
    const barra = mesh(C(0.02, 0.02, 1.38, 6), M.oro, 0, 2.02, -0.05, src); barra.rotation.z = Math.PI / 2;
    [-0.48, -0.16, 0.16, 0.48].forEach((cx, i) => { hubCaja(0.3, 0.95, 0.16, M.ropa[i], cx, 1.5, -0.05, src); hubCaja(0.36, 0.05, 0.05, M.ropa[i], cx, 1.95, -0.05, src); mesh(new THREE.TorusGeometry(0.05, 0.008, 4, 8, Math.PI), M.oro, cx, 2.0, -0.05, src); });
    for (const s of [-1, 1]){ const pu = new THREE.Group(); pu.position.set(0.75 * s, 0, 0.35); pu.rotation.y = s * 1.95; src.add(pu);   // puertas abiertas hacia fuera
      hubCaja(0.72, 2.18, 0.05, M.madera, -0.36 * s, 1.2, 0, pu); hubCaja(0.5, 1.6, 0.02, M.maderaO, -0.36 * s, 1.25, 0.03, pu);
      mesh(new THREE.OctahedronGeometry(0.035, 0), M.oro, -0.66 * s, 1.2, 0.05, pu); }
  });
  HUB.tapa.push({ o: g, x, z, r: 1.0, h: 2.6 }); HUB.obst.push({ x, z: z - 0.4, r: 0.7 }, { x, z: z + 0.4, r: 0.7 });
}
function hubEspejo(W){
  const M = HUB.M, [x, z] = HUB_SITIO.espejo;
  const g = mpFundido(W, x, z, hubMira(x, z) + 0.2, 1, src => { hubCaja(0.08, 1.9, 0.08, M.maderaO, -0.42, 0.95, 0, src); hubCaja(0.08, 1.9, 0.08, M.maderaO, 0.42, 0.95, 0, src);
    hubCaja(0.92, 0.08, 0.08, M.maderaO, 0, 1.93, 0, src); hubCaja(0.92, 0.08, 0.08, M.maderaO, 0, 0.32, 0, src); for (const s of [-1, 1]) hubCaja(0.4, 0.06, 0.12, M.maderaO, 0.42 * s, 0.03, 0, src);
    mesh(new THREE.PlaneGeometry(0.76, 1.53), M.cristalE, 0, 1.12, 0.01, src); });
  HUB.tapa.push({ o: g, x, z, r: 0.5, h: 2.0 }); HUB.obst.push({ x, z, r: 0.45 });
}
function hubEstante(W){
  const M = HUB.M, [x, z] = HUB_SITIO.estante, rot = hubMira(x, z);
  const g = mpFundido(W, x, z, rot, 1, src => { hubCaja(2.5, 2.1, 0.05, M.maderaO, 0, 1.05, -0.24, src); for (const s of [-1, 1]) hubCaja(0.06, 2.1, 0.5, M.madera, 1.25 * s, 1.05, 0, src);
    for (const y of [0.05, 0.72, 1.39, 2.06]) hubCaja(2.56, 0.06, 0.52, M.madera, 0, y, 0, src); });
  HUB.tapa.push({ o: g, x, z, r: 1.3, h: 2.4 }); for (const s of [-0.85, 0, 0.85]) HUB.obst.push({ x: x + Math.cos(rot) * s, z: z - Math.sin(rot) * s, r: 0.5 });
}
function hubArmero(W){
  const M = HUB.M, [x, z] = HUB_SITIO.armero, rot = hubMira(x, z);
  const g = mpFundido(W, x, z, rot, 1, src => { for (const s of [-1, 1]) hubCaja(0.12, 2.0, 0.12, M.maderaO, 1.35 * s, 1.0, -0.12, src);
    hubCaja(2.84, 0.1, 0.14, M.madera, 0, 1.92, -0.12, src); hubCaja(2.84, 0.1, 0.3, M.madera, 0, 0.12, 0.0, src); hubCaja(2.7, 0.06, 0.1, M.maderaO, 0, 1.55, -0.1, src); });
  HUB.tapa.push({ o: g, x, z, r: 1.45, h: 2.1 }); for (const s of [-0.9, 0, 0.9]) HUB.obst.push({ x: x + Math.cos(rot) * s, z: z - Math.sin(rot) * s, r: 0.42 });
}

/* ---------- Lo que se desbloquea (se rehace al entrar y al cerrar el santuario) ---------- */
function hubClaveDeco(){
  const c = []; for (const k of Object.keys(COS)) for (const [i] of COS[k]) if (cosUnlocked(k, i)) c.push(k + i);
  return [c.join(), Object.keys(meta.bosses || {}).join(), Object.keys(meta.endings || {}).join(), Object.keys(meta.ach || {}).length, meta.runs, Object.values(meta.lv || {}).reduce((a, b) => a + b, 0)].join('|');
}
function hubDecora(){
  const clave = hubClaveDeco(); if (HUB.deco && clave === HUB.decoClave) return; HUB.decoClave = clave;
  if (HUB.deco){ HUB.W.remove(HUB.deco); HUB.deco.traverse(o => { if (o.isMesh && o.userData.hubPropia) o.geometry.dispose(); });
    for (const m of HUB.decoMats){ if (m.uniforms.uMap.value && m.userData.hubTex) m.uniforms.uMap.value.dispose(); m.dispose(); } }
  HUB.decoMats = [];
  const D = HUB.deco = new THREE.Group(), M = HUB.M, S = HUB_SITIO, R = mulberry32(77 + (meta.runs || 0)); HUB.W.add(D);
  const fija = (parent, x, z, rot, crea) => { const g = mpFundido(parent, x, z, rot, 1, crea); g.traverse(o => { if (o.isMesh) o.userData.hubPropia = true; }); return g; };
  // estante: sombreros arriba, caras abajo, chucherías encima
  { const [x, z] = S.estante; fija(D, x, z, hubMira(x, z), src => {
      const hats = COS.hat.filter(h => h[0] !== 'none'), caras = COS.glasses.filter(h => h[0] !== 'none');
      const cabeza = (px, py, s, fn) => { const g = new THREE.Group(); g.position.set(px, py, 0); g.scale.setScalar(s); src.add(g);
        hubManiqui(g); mesh(C(0.07, 0.12, 0.12, 8), M.maderaO, 0, 0.0, 0, g); fn(g); };
      hats.forEach(([id], i) => { const fila = i < 6 ? 1.43 : 0.76, col = i % 6;
        cabeza(-1.0 + col * 0.4, fila + 0.06, 0.55, g => { if (cosUnlocked('hat', id) && HATS[id]){ const h = hubCopia(HATS[id].g); h.visible = true; g.add(h); }
          else { const t = mesh(new THREE.SphereGeometry(0.3, 8, 6, 0, TAU, 0, Math.PI / 2), M.tela, 0, 0.2, 0.02, g); t.scale.set(1, 1.3, 1); } }); });
      caras.forEach(([id], i) => { if (!cosUnlocked('glasses', id) || !GLASSES[id]) return; const g = new THREE.Group(); g.position.set(-1.05 + i * 0.26, 0.11, 0.05); g.scale.setScalar(0.45); src.add(g);
        hubManiqui(g); const gl = hubCopia(GLASSES[id]); gl.visible = true; g.add(gl); });
      let k = 0; for (const [cat, id] of [['effect', 'rainbow'], ['effect', 'rainbow2'], ['effect', 'confetti'], ['effect', 'confetti2'], ['effect', 'money'], ['sound', 'honk'], ['sound', 'quack'], ['body', 'bighead'], ['body', 'mini'], ['body', 'gold'], ['body', 'gold2'], ['body', 'missing']]){
        if (!cosUnlocked(cat, id) || k >= 8) continue; const g = new THREE.Group(); g.position.set(-1.05 + k * 0.3, 2.09, 0); src.add(g); hubChucheria(g, id); k++; } }); }
  // armero
  { const [x, z] = S.armero; fija(D, x, z, hubMira(x, z), src => { const ws = COS.weapon.filter(w => w[0] !== 'staff' && cosUnlocked('weapon', w[0]) && WEAPONS[w[0]]);
      ws.forEach(([id], i) => { const n = Math.max(ws.length, 6), w = hubCopia(WEAPONS[id]); w.visible = true; w.scale.multiplyScalar(0.72); w.position.set(-1.15 + i * 2.3 / (n - 1), 1.0, 0.04); w.rotation.z = (R() - 0.5) * 0.12; src.add(w); }); }); }
  // bustos de los jefes
  for (const [t, a] of HUB_BUSTOS){ const [x, z] = hubA(a, 6.6); fija(D, x, z, hubMira(x, z), src => { const g = new THREE.Group(); g.position.y = 1.04; src.add(g);
    if ((meta.bosses || {})[t]) hubBusto(g, t); else { const t1 = mesh(new THREE.IcosahedronGeometry(0.34, 1), M.tela, 0, 0.26, 0, g); t1.scale.set(1, 1.1, 1); mesh(C(0.4, 0.44, 0.1, 10), M.tela, 0, 0.02, 0, g); } }); }
  // cristales del santuario: uno por mejora comprada
  { const [x, z] = S.santuario, n = Math.min(48, Object.values(meta.lv || {}).reduce((a, b) => a + b, 0));
    fija(D, x, z, 0, src => { for (let i = 0; i < n; i++){ const a = i * 2.39996, r = 1.05 + (i % 4) * 0.12, m = mesh(new THREE.OctahedronGeometry(0.06 + (i % 3) * 0.025, 0), i % 5 ? M.cristal : M.oro, Math.cos(a) * r, 0.5 + (i % 4) * 0.02, Math.sin(a) * r, src);
      m.scale.y = 1.6; m.rotation.set((R() - 0.5) * 0.5, R() * 3, (R() - 0.5) * 0.5); } }); }
  // notas de los logros en el tablón
  { const [x, z] = S.tablon, cols = 8, filas = Math.max(4, Math.ceil(ACH.length / cols)), w = 1.6 / cols, h = 1.05 / filas;
    fija(D, x, z, hubMira(x, z), src => ACH.forEach((a, i) => { if (!meta.ach[a.id]) return; const cx = -0.8 + w * (i % cols + 0.5), cy = 1.45 + 0.525 - h * (Math.floor(i / cols) + 0.5);
      const n = mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.82), M.papel, cx, cy, 0.03, src); n.rotation.z = (R() - 0.5) * 0.3; mesh(new THREE.SphereGeometry(0.018, 5, 4), M.chincheta, cx, cy + h * 0.32, 0.045, src); })); }
  // cuadros de los finales
  { const [x, z] = S.caballete, got = meta.endings || {}, mat = hubDM(0xffffff, { map: hubPintaFinales(got), emissive: 0.25 }); mat.userData.hubTex = true;
    fija(D, x, z, hubMira(x, z), src => ENDINGS.slice(0, 10).forEach((E, i) => { const cx = -0.94 + (i % 5) * 0.47, cy = 1.79 - Math.floor(i / 5) * 0.68;
      hubCaja(0.42, 0.5, 0.03, M.maderaO, cx, cy, 0.03, src); const q = new THREE.PlaneGeometry(0.34, 0.42), uv = q.attributes.uv;
      for (let k = 0; k < uv.count; k++) uv.setXY(k, (i % 5 + uv.getX(k)) / 5, 1 - (Math.floor(i / 5) + 1 - uv.getY(k)) / 2);
      mesh(q, got[E.id] ? mat : M.negro, cx, cy, 0.05, src); })); }
  // banderines: uno por título conseguido, en dos guirnaldas desde el arco
  { const tit = COS.title.filter(t => t[0] !== COS_DEFAULT.title && cosUnlocked('title', t[0])).length;
    fija(D, 0, 0, 0, src => { for (const s of [-1, 1]){ const A = new V3(1.55 * s, 3.55, -9.0), [bx, bz] = hubA(s > 0 ? -38 : -142, HUB_MURO), Bp = new V3(bx, 2.7, bz), n = Math.ceil(tit / 2);
      const pt = k => hubV.lerpVectors(A, Bp, k).clone().add(new V3(0, -0.55 * Math.sin(k * Math.PI), 0));
      for (let k = 0; k < 12; k++){ const a = pt(k / 12), b = pt((k + 1) / 12), c = mesh(C(0.012, 0.012, a.distanceTo(b), 3), M.cuerda, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, src); c.lookAt(b); c.rotateX(Math.PI / 2); }
      for (let k = 0; k < n && (s > 0 ? k : k + n) < tit; k++){ const u = (k + 0.7) / (n + 0.4), p = pt(u), q = pt(u + 0.02), geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute([-0.13, 0, 0, 0.13, 0, 0, 0, -0.32, 0], 3)); geo.computeVertexNormals();
        const m = new THREE.Mesh(geo, M.banderin[(k * 2 + (s > 0 ? 0 : 1)) % M.banderin.length]); m.position.copy(p); m.rotation.y = Math.atan2(q.x - p.x, q.z - p.z) - Math.PI / 2; src.add(m); } } }); }
  // pizarra: una raya de tiza por partida
  { const [x, z] = S.pizarra, mat = hubDM(0xffffff, { map: hubPintaRayas(meta.runs || 0), emissive: 0.2 }); mat.userData.hubTex = true;
    fija(D, x, z, hubMira(x, z), src => { const q = mesh(new THREE.PlaneGeometry(1.1, 0.76), mat, 0, 1.08, 0.03, src); q.rotation.x = -0.18; }); }
}
const hubDM = (c, o) => { const m = makeMat(c, o); HUB.decoMats.push(m); return m; };   // material del decorado (se libera al rehacerlo)
function hubChucheria(g, id){
  const M = HUB.M, col = c => hubDM(c, { emissive: 0.25 });
  if (id === 'rainbow' || id === 'rainbow2'){ [0xe84040, 0xf2a03a, 0xf2e04a, 0x4ac06a, 0x3a8ad8, 0x8a5ad8].forEach((c, i) => { const t = mesh(new THREE.TorusGeometry(0.13 - i * 0.017, 0.009, 4, 10, Math.PI), col(c), 0, 0.02, 0, g); }); }
  else if (id === 'confetti' || id === 'confetti2'){ const c = mesh(new THREE.ConeGeometry(0.06, 0.2, 8), col(id === 'confetti' ? 0x3a8ad8 : 0xd83ab8), 0, 0.1, 0, g); c.rotation.z = 0.5;
    for (let i = 0; i < 6; i++) mesh(B(0.025, 0.025, 0.005), col([0xf2e04a, 0xe84040, 0x4ac06a][i % 3]), -0.06 + i * 0.03, 0.2 + (i % 2) * 0.05, 0, g); }
  else if (id === 'money'){ for (let i = 0; i < 4; i++){ const b = mesh(B(0.2, 0.03, 0.1), hubDM(0xffffff, { map: M.caras.billete }), 0, 0.015 + i * 0.03, 0, g); b.rotation.y = i * 0.25; } }
  else if (id === 'honk'){ mesh(new THREE.SphereGeometry(0.06, 8, 6), col(0xd83a3a), -0.06, 0.08, 0, g); const c = mesh(new THREE.ConeGeometry(0.06, 0.18, 8, 1, true), M.oro, 0.05, 0.08, 0, g); c.rotation.z = Math.PI / 2; }
  else if (id === 'quack' && HATS.duck){ const d = hubCopia(HATS.duck.g); d.visible = true; d.position.set(0, 0.1, 0); d.scale.setScalar(0.5); g.add(d); }
  else if (id === 'bighead'){ mesh(B(0.12, 0.22, 0.12), hubDM(0x8a8a90), 0, 0.11, 0, g); mesh(B(0.14, 0.03, 0.03), hubDM(0x5a5a60), 0, 0.15, 0.065, g); }
  else if (id === 'mini'){ mesh(B(0.07, 0.04, 0.12), hubDM(0xe8e8f0), 0, 0.02, 0, g); mesh(B(0.06, 0.08, 0.06), hubDM(0x2b3a5c), 0, 0.08, -0.02, g); }
  else if (id === 'gold' || id === 'gold2'){ const m = id === 'gold' ? M.oro : hubDM(0xd8e4ff, { emissive: 0.6 });
    mesh(C(0.09, 0.04, 0.12, 10), m, 0, 0.17, 0, g); mesh(C(0.02, 0.02, 0.08, 6), m, 0, 0.07, 0, g); mesh(C(0.07, 0.08, 0.03, 8), m, 0, 0.015, 0, g); }
  else if (id === 'missing'){ mesh(B(0.14, 0.14, 0.14), hubDM(0xffffff, { map: missTex, emissive: 0.4 }), 0, 0.07, 0, g); }
}
function hubBusto(g, t){
  const M = HUB.M, X = M.caras, cara = (tex, w, h, y, z, col = 0xffffff, em = 0.2) => mesh(new THREE.PlaneGeometry(w, h), hubDM(col, { map: tex, emissive: em }), 0, y, z, g);
  if (t === 'boss'){ mesh(B(0.5, 0.5, 0.5), hubDM(0xffffff, { map: X.bossP }), 0, 0.25, 0, g); cara(X.boss, 0.48, 0.48, 0.25, 0.252); }
  else if (t === 'dragon'){ const j = hubDM(0xffffff, { map: X.dragon, emissive: 0.15 }); mesh(B(0.36, 0.3, 0.42), j, 0, 0.2, 0, g); mesh(B(0.28, 0.18, 0.3), j, 0, 0.14, 0.32, g);
    for (const s of [-1, 1]){ const c = mesh(new THREE.ConeGeometry(0.05, 0.36, 5), M.oro, 0.12 * s, 0.44, -0.1, g); c.rotation.x = -0.6; mesh(B(0.07, 0.04, 0.02), hubDM(0xffe040, { emissive: 1 }), 0.12 * s, 0.27, 0.212, g);
      const b = mesh(B(0.012, 0.012, 0.38), M.oro, 0.12 * s, 0.1, 0.5, g); b.rotation.y = 0.5 * s; } }
  else if (t === 'skeleton'){ mesh(B(0.44, 0.46, 0.44), hubDM(0xe8e0c8), 0, 0.27, 0, g); cara(X.skeleton, 0.44, 0.46, 0.27, 0.222); mesh(B(0.34, 0.1, 0.3), hubDM(0xd8d0b8), 0, 0.02, 0.04, g); }
  else if (t === 'star'){ mesh(B(0.42, 0.44, 0.4), hubDM(0xe8b894), 0, 0.22, 0, g); cara(X.star, 0.42, 0.44, 0.22, 0.202); mesh(B(0.46, 0.14, 0.44), hubDM(0xffffff, { map: X.starP }), 0, 0.48, -0.01, g);
    mesh(B(0.52, 0.08, 0.3), hubDM(0xd83a3a), 0, -0.02, -0.05, g); }
  else if (t === 'teapot'){ const w = hubDM(0xf4f6ff, { emissive: 0.1 }), pr = [[0, 0], [0.16, 0], [0.22, 0.05], [0.25, 0.14], [0.23, 0.24], [0.17, 0.3], [0.08, 0.32], [0, 0.33]].map(([r, y]) => new THREE.Vector2(r, y));
    mesh(new THREE.LatheGeometry(pr, 14), w, 0, 0, 0, g); mesh(new THREE.SphereGeometry(0.045, 8, 6), w, 0, 0.36, 0, g);
    const pi = mesh(C(0.03, 0.05, 0.26, 8), w, 0, 0.18, 0.28, g); pi.rotation.x = 0.9; const asa = mesh(new THREE.TorusGeometry(0.1, 0.025, 5, 10, Math.PI), w, 0, 0.17, -0.24, g); asa.rotation.set(0, Math.PI / 2, Math.PI / 2); }
  else if (t === 'error'){ mesh(B(0.56, 0.44, 0.46), hubDM(0xc8c4b8), 0, 0.28, 0, g); cara(X.error, 0.46, 0.3, 0.3, 0.232, 0xffffff, 0.75); mesh(B(0.2, 0.06, 0.2), hubDM(0xb8b4a8), 0, 0.03, 0, g); }
  else if (t === 'sixeyes'){ mesh(B(0.44, 0.48, 0.42), hubDM(0x9a7ac8), 0, 0.24, 0, g); cara(X.sixeyes, 0.44, 0.48, 0.24, 0.212); for (const s of [-1, 1]){ const c = mesh(new THREE.ConeGeometry(0.05, 0.22, 5), hubDM(0x2a1a3a), 0.16 * s, 0.56, 0, g); c.rotation.z = -0.3 * s; } }
  else if (t === 'finalcat'){ mesh(B(0.46, 0.42, 0.42), hubDM(0x1c1c24), 0, 0.21, 0, g); cara(X.finalcat, 0.46, 0.42, 0.21, 0.212, 0xffffff, 0.35);
    for (const s of [-1, 1]){ const c = mesh(new THREE.ConeGeometry(0.08, 0.2, 4), hubDM(0x1c1c24), 0.15 * s, 0.5, 0, g); c.rotation.z = -0.15 * s; } }
}
function hubPintaRayas(n){ return canvasTex(128, 88, (g, w, h) => {
  g.fillStyle = '#1e2622'; g.fillRect(0, 0, w, h); const R = mulberry32(5); for (let i = 0; i < 220; i++){ g.fillStyle = `rgba(255,255,255,${0.02 + R() * 0.04})`; g.fillRect(R() * w | 0, R() * h | 0, 2, 1); }
  g.fillStyle = 'rgba(240,240,232,.9)'; const m = Math.min(n, 60);
  for (let i = 0; i < m; i++){ const gr = Math.floor(i / 5), k = i % 5, gx = 8 + (gr % 6) * 20, gy = 8 + Math.floor(gr / 6) * 38;
    if (k < 4) g.fillRect(gx + k * 4, gy + (R() * 2 | 0), 2, 26);
    else for (let s = 0; s < 18; s++) g.fillRect(gx - 2 + s, gy + 22 - s * 1.1, 2, 2); }
  if (n > 60){ g.fillStyle = '#ffd970'; for (let s = 0; s < 9; s++){ g.fillRect(112, 70 + s, 2, 1); g.fillRect(108 + s, 74, 1, 2); } } }); }
// diez escenas diminutas (5 × 2, 32 px cada una): las de los finales vistos
function hubPintaFinales(got){ return canvasTex(160, 64, (g) => {
  const R = mulberry32(19), px = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  ENDINGS.slice(0, 10).forEach((E, i) => { const x = (i % 5) * 32, y = Math.floor(i / 5) * 32; if (!got[E.id]) return; g.save(); g.beginPath(); g.rect(x, y, 32, 32); g.clip();
    const id = E.id;
    if (id === 'home'){ px(x, y, 32, 32, '#16204a'); px(x + 6, y + 14, 20, 16, '#7a5238'); for (let k = 0; k < 10; k++) px(x + 4 + k, y + 14 - k, 24 - 2 * k, 1, '#a83a2a'); px(x + 10, y + 18, 6, 5, '#ffd970'); px(x + 20, y + 22, 4, 8, '#3a2418'); px(x + 24, y + 4, 3, 3, '#f4f0d0'); }
    else if (id === 'anime'){ px(x, y, 32, 32, '#ff8ac8'); g.fillStyle = '#fff'; for (let k = 0; k < 16; k++){ g.save(); g.translate(x + 16, y + 16); g.rotate(k / 16 * TAU); g.fillRect(0, -1, 18, 2); g.restore(); } vehEstrella(g, x + 16, y + 16, 8, '#ffe040'); }
    else if (id === 'fired'){ px(x, y, 32, 32, '#5a5a66'); px(x + 8, y + 10, 16, 14, '#c89a5a'); for (let k = 0; k < 18; k++){ px(x + 7 + k, y + 7 + k, 3, 3, '#e83a3a'); px(x + 24 - k, y + 7 + k, 3, 3, '#e83a3a'); } }
    else if (id === 'villain'){ px(x, y, 32, 32, '#3a0a14'); px(x + 10, y + 6, 12, 22, '#1a0a0a'); px(x + 7, y + 16, 18, 4, '#1a0a0a'); px(x + 12, y + 8, 3, 3, '#ff3a3a'); px(x + 17, y + 8, 3, 3, '#ff3a3a'); }
    else if (id === 'loop'){ px(x, y, 32, 32, '#1c3a6a'); g.strokeStyle = '#eef'; g.lineWidth = 3; g.beginPath(); g.arc(x + 16, y + 16, 9, 0.5, TAU - 0.2); g.stroke(); px(x + 22, y + 9, 6, 3, '#eef'); px(x + 25, y + 6, 3, 6, '#eef'); }
    else if (id === 'beach'){ px(x, y, 32, 14, '#6ac8f2'); px(x, y + 14, 32, 8, '#2a7ab8'); px(x, y + 22, 32, 10, '#f2d88a'); px(x + 22, y + 3, 7, 7, '#ffe040'); for (let k = 0; k < 6; k++) px(x + 2 + k * 5, y + 17, 3, 1, '#bfe8ff'); }
    else if (id === 'truck'){ px(x, y, 32, 32, '#2a2a3a'); px(x, y + 24, 32, 8, '#3a3a44'); for (let k = 0; k < 4; k++) px(x + 2 + k * 8, y + 27, 4, 1, '#f2e04a'); px(x + 4, y + 10, 16, 13, '#e8e8f0'); px(x + 4, y + 16, 16, 2, '#3a6ad8'); px(x + 20, y + 13, 8, 10, '#d8d8e0'); px(x + 22, y + 15, 4, 3, '#6ac8f2'); px(x + 7, y + 22, 4, 4, '#111'); px(x + 22, y + 22, 4, 4, '#111'); }
    else if (id === 'lamp'){ px(x, y, 32, 32, '#14101e'); g.fillStyle = 'rgba(255,220,120,.25)'; g.beginPath(); g.arc(x + 16, y + 12, 13, 0, TAU); g.fill(); px(x + 10, y + 6, 12, 9, '#ffd970'); px(x + 15, y + 15, 2, 9, '#c8a060'); px(x + 10, y + 24, 12, 3, '#7a5238'); }
    else if (id === 'glitch'){ for (let yy = 0; yy < 8; yy++) for (let xx = 0; xx < 8; xx++) px(x + xx * 4, y + yy * 4, 4, 4, (xx + yy) % 2 ? '#ff2ae0' : '#111'); for (let k = 0; k < 5; k++) px(x, y + R() * 32 | 0, 32, 2, R() < 0.5 ? '#2ae0ff' : '#fff'); }
    else { const gr = g.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, '#ff9a5a'); gr.addColorStop(1, '#5a2a6a'); g.fillStyle = gr; g.fillRect(x, y, 32, 32);
      px(x + 6, y + 14, 5, 12, '#1a1020'); px(x + 5, y + 10, 7, 5, '#1a1020'); px(x + 15, y + 18, 4, 8, '#1a1020'); px(x + 14, y + 14, 6, 5, '#ffd970'); px(x + 22, y + 20, 7, 6, '#1a1020'); px(x + 22, y + 18, 2, 2, '#1a1020'); px(x + 27, y + 18, 2, 2, '#1a1020');
      g.fillStyle = '#ff4a6a'; g.beginPath(); g.arc(x + 14, y + 6, 2.5, 0, TAU); g.arc(x + 18, y + 6, 2.5, 0, TAU); g.fill(); g.beginPath(); g.moveTo(x + 11.6, y + 7); g.lineTo(x + 16, y + 11.5); g.lineTo(x + 20.4, y + 7); g.fill(); }
    g.restore(); }); }); }

/* ---------- Montar y desmontar ---------- */
function hubMonta(){
  if (HUB.on) return; hubConstruye(); HUB.on = true;
  const U = skyMat.uniforms;
  HUB.prev = { ARENA, amb: ambMode, fogN: shared.uFogNear.value, fogF: shared.uFogFar.value, fogC: shared.uFogCol.value.getHex(), luz: shared.uLightCol.value.clone(), ambC: shared.uAmb.value.getHex(),
    top: U.uTop.value.getHex(), mid: U.uMid.value.getHex(), hor: U.uHor.value.getHex(), moon: U.uMoonOn.value, stars: U.uStars.value, lamp: lampOverride, p2: p2Override, ocultos: [] };
  const lista = [...BIOMES.map(b => b.group), ground, rune, braz, toroBig, homeGroup, renderGroup, ...brazRuins, ...mountainsList, ...ambP];
  for (const o of lista) if (o && o.visible){ o.visible = false; HUB.prev.ocultos.push(o); }
  ambMode = null; ARENA = HUB_R; MP.on = false;
  U.uTop.value.setHex(0x05060f); U.uMid.value.setHex(0x0e1230); U.uHor.value.setHex(0x30243c); U.uMoonOn.value = 1; U.uStars.value = 1.3;
  shared.uFogCol.value.setHex(0x0e1020); shared.uFogNear.value = 11; shared.uFogFar.value = 36;
  shared.uLightCol.value.setHex(0x8a98d0).multiplyScalar(0.6); shared.uAmb.value.setHex(0x4c4c6c);
  const [hx, hz] = HUB_SITIO.hoguera, [sx, sz] = HUB_SITIO.santuario;
  lampOverride = { pos: new V3(hx, 1.1, hz), col: [1.35, 0.78, 0.4], range: 11 }; p2Override = { pos: new V3(sx, 2.2, sz), col: [0.3, 0.85, 1.15], range: 7 };
  HUB.W.visible = true; document.body.classList.add('hubOn'); limpiaEfectos();
}
function hubDesmonta(){
  if (!HUB.on) return; HUB.on = false;
  const P_ = HUB.prev, U = skyMat.uniforms;
  for (const o of P_.ocultos) o.visible = true;
  ambMode = P_.amb; ARENA = P_.ARENA; lampOverride = P_.lamp; p2Override = P_.p2;
  U.uTop.value.setHex(P_.top); U.uMid.value.setHex(P_.mid); U.uHor.value.setHex(P_.hor); U.uMoonOn.value = P_.moon; U.uStars.value = P_.stars;
  shared.uFogCol.value.setHex(P_.fogC); shared.uFogNear.value = P_.fogN; shared.uFogFar.value = P_.fogF; shared.uLightCol.value.copy(P_.luz); shared.uAmb.value.setHex(P_.ambC);
  HUB.W.visible = false; for (const t of HUB.tapa) fundeQuita(t.o); for (const f of HUB.frags) f.m.visible = false;
  hubBrilloFin(); HUB.fase = null; HUB.menu = null; HUB.cerca = null; HUB.sale = -1; HUB.camK = 0; HUB.camQuiere = false;
  document.body.classList.remove('hubOn'); hubAvisoEl.hidden = true; hubPadTxt(null);
}

/* ---------- Entrar: revivir (tras caer) o llegar (desde el título) ---------- */
function hubEntra(modo){
  toTitle(); titleScr.hidden = true; overScr.hidden = true;
  hubMonta(); hubDecora();
  wave = 0; queue.length = 0; clearT = -1; spawnTimer = 999; bossE = null; special = null;
  up = UP0(); taken = {}; tagCnt = {}; setsOn = {}; try { resetOtaku(); } catch (err) {} renderTagChips();
  Object.assign(player, { hp: player.maxHp, meter: 0, inv: 0, kx: 0, kz: 0, dead: false });
  if (typeof MOV11 !== 'undefined' && MOV11){ MOV11.vx = MOV11.vz = 0; }
  state = 'normal'; vy = 0; grounded = true; attackW = 0; staffToBack(); hero.position.set(0, 0, 0); hero.rotation.y = heading = Math.PI; camYaw = 0;
  P.body.rotation.set(0, 0, 0); applyCosmetics(false); hud.hidden = true; waveBox.hidden = true; bossBox.hidden = true;
  setSong('campamento'); applyMusVol();
  HUB.t = 0; HUB.fase = modo; HUB.forma = HUB.latido = HUB.brinco = false; gameState = 'hubCine'; fadeEl.style.opacity = '1';
  if (modo === 'revive'){ state = 'dead'; deadT = 5; HUB.camQuiere = true; HUB.camK = 1; hubCamRevive(0); hubFragsEmpieza(); play('hubFrag'); }
  else { HUB.camQuiere = false; HUB.camK = 0; }
}
function hubFragsEmpieza(){
  const R = mulberry32(HUB.semilla++);
  for (const f of HUB.frags){ const a = R() * TAU, r = 3 + R() * 3.5; f.a0 = a; f.r0 = r; f.y0 = 0.4 + R() * 3.4; f.d = R() * 0.55; f.gir = (R() < 0.5 ? -1 : 1) * (1.2 + R() * 1.4);
    f.fin = [(R() - 0.5) * 0.5, 0.25 + R() * 0.2, (R() - 0.5) * 1.1]; f.llego = false; f.m.visible = false; }
}
function hubCamRevive(t){
  const k = smooth(clamp((t - 0.2) / 3.0, 0, 1)), a = 0.5 - 0.32 * k, d = 7.4 - 2.6 * k;   // entre los dos obeliscos del sur
  HUB.camP.set(Math.sin(a) * d, 3.5 - 1.4 * k, Math.cos(a) * d); HUB.camT.set(0, 0.45 + 0.65 * k, 0);
}
function hubBrillo(k){   // Tovan recién hecho brilla y se apaga
  if (!HUB.brillo) HUB.brillo = HERO_MATS.map(m => m.uniforms.uEmissive.value);
  HERO_MATS.forEach((m, i) => { m.uniforms.uEmissive.value = HUB.brillo[i] + (1 - HUB.brillo[i]) * k; });
}
function hubBrilloFin(){ if (!HUB.brillo) return; HERO_MATS.forEach((m, i) => { m.uniforms.uEmissive.value = HUB.brillo[i]; }); HUB.brillo = null; }
function hubSalta(){   // se salta la escena: Tovan de pie y a jugar
  if (gameState !== 'hubCine') return;
  for (const f of HUB.frags) f.m.visible = false; hubBrilloFin();
  state = 'normal'; deadT = 0; P.body.rotation.set(0, 0, 0); hero.visible = true; vy = 0; grounded = true; hero.position.y = 0;
  fadeEl.style.opacity = '0'; HUB.fase = null; HUB.forma = HUB.latido = HUB.brinco = false; HUB.camQuiere = false; gameState = 'play'; play('confirm');
}
function hubReviveTick(dt){
  const t = HUB.t += dt, F = HUB_REV, t1 = F.frag, t2 = t1 + F.forma, t3 = t2 + F.despierta;
  fadeEl.style.opacity = String(clamp(1 - t / 0.7, 0, 1));
  hubCamRevive(t);
  // los fragmentos vuelan en espiral hasta el altar
  for (const f of HUB.frags){ if (f.llego) continue; const k = clamp((t - f.d) / (t1 - f.d - 0.05), 0, 1);
    if (k <= 0){ f.m.visible = false; continue; } const e = k * k, a = f.a0 + f.gir * e * 2.2, r = f.r0 * (1 - e);
    f.m.visible = true; f.m.position.set(Math.cos(a) * r + f.fin[0] * e, f.y0 * (1 - e) + f.fin[1] * e, Math.sin(a) * r + f.fin[2] * e); f.m.rotation.set(t * 5 + f.a0, t * 7, 0); f.m.scale.setScalar(1 - 0.5 * e);
    if (k >= 1){ f.llego = true; f.m.visible = false; if (rnd() < 0.5) spawnFx(f.m.position.x, f.m.position.y, f.m.position.z, 0, 0.6, 0, 0x8ff6ff, 0.05, 0.3, 0, 1); if (rnd() < 0.35) play('hubTic'); } }
  HUB.M.runas.uniforms.uEmissive.value = 0.4 + 0.6 * clamp(t / t1, 0, 1) * (t < t2 ? 1 : clamp(1 - (t - t2) / 0.8, 0, 1));
  if (t >= t1 && !HUB.forma){ HUB.forma = true; flash('#e8fbff', 0.65); ringFx(0, 0, 0x8ff6ff, 0.3, 3.2, 0.6); ringFx(0, 0, 0xffd870, 0.2, 2.2, 0.45); sparks(0, 0.6, 0, 18, 0x8ff6ff, 3); play('hubBrote'); shake = 0.15; }
  if (t >= t1 + 0.45 && !HUB.latido){ HUB.latido = true; play('hubLatido'); ringFx(0, 0, 0xffffff, 0.2, 1.4, 0.35); }
  if (t >= t1) hubBrillo(clamp(1 - (t - t1) / (F.forma + 0.4), 0, 1));
  if (t >= t2){ if (state === 'dead'){ state = 'normal'; deadT = 0; }
    const k = clamp((t - t2) / 0.6, 0, 1); P.body.rotation.x = -1.45 * (1 - (1 - Math.pow(1 - k, 3)));
    if (t >= t2 + 0.62 && !HUB.brinco){ HUB.brinco = true; vy = 5.2; grounded = false; play('jump'); } }
  if (t >= t3){ HUB.forma = HUB.latido = HUB.brinco = false; hubBrilloFin(); P.body.rotation.x = 0; HUB.fase = null; HUB.camQuiere = false; gameState = 'play'; }
}
function hubLlegaTick(dt){
  const t = HUB.t += dt; fadeEl.style.opacity = String(clamp(1 - t / 0.6, 0, 1));
  if (t >= 0.15 && !HUB.forma){ HUB.forma = true; ringFx(0, 0, 0x8ff6ff, 0.3, 2.4, 0.5); sparks(0, 0.5, 0, 10, 0x8ff6ff, 2.5); }
  if (t >= 0.6){ HUB.forma = false; HUB.fase = null; gameState = 'play'; }
}

/* ---------- Usar los sitios ---------- */
const hubAvisoEl = document.createElement('div'); hubAvisoEl.id = 'hubAviso'; hubAvisoEl.hidden = true; hubAvisoEl.innerHTML = '<kbd>J</kbd><b></b>'; document.body.appendChild(hubAvisoEl);
function hubPadTxt(t){
  const b = document.querySelector('#pad button[data-act="attack"]'); if (!b) return;
  if (HUB.padTxt == null) HUB.padTxt = b.textContent;
  b.textContent = t || HUB.padTxt; b.classList.toggle('hubUsa', !!t);
}
function hubMenu(id){
  HUB.menu = id; gameState = 'hubMenu'; hubAvisoEl.hidden = true; hubPadTxt(null); for (const k in keys) keys[k] = false;
  if (id === 'vestidor'){ const P0 = HUB.puntos[0]; hero.position.set(P0.x - 0.2, 0, P0.z); heading = Math.PI / 2; HUB.camQuiere = true; play('hubPuerta'); }
}
function hubVuelve(){
  const era = HUB.menu; HUB.menu = null; HUB.camQuiere = false; if (!HUB.on) return;
  titleScr.hidden = true; overScr.hidden = true; gameState = 'play';
  if (era === 'santuario') hubDecora();
}
function hubUsa(p){ if (p.abre){ p.abre(); } }

/* ---------- Cada fotograma ---------- */
function hubTick(dt, pdt){
  HUB.dt = dt;
  if (HUB.fase === 'revive') hubReviveTick(dt); else if (HUB.fase === 'llega') hubLlegaTick(dt);
  // fuego, brasas, luciérnagas, cristales y portal
  for (const f of HUB.llamas){ const k = 1 + 0.22 * Math.sin(time * (11 + f.i * 3.7)) + 0.12 * Math.sin(time * 29 + f.i * 2); f.m.scale.set(1 - 0.1 * (k - 1), k, 1 - 0.1 * (k - 1)); f.m.position.y = 0.12 + f.h * k / 2; f.m.rotation.y += pdt * (1.5 + f.i); }
  for (const b of HUB.brasas){ b.t += pdt * 0.55; if (b.t > 1){ b.t -= 1; b.sx = (rnd() - 0.5) * 0.5; b.sz = (rnd() - 0.5) * 0.5; }
    b.m.position.set(b.x + b.sx * (1 + b.t * 2) + Math.sin(time * 3 + b.sz * 20) * 0.1, 0.4 + b.t * 2.4, b.z + b.sz * (1 + b.t * 2)); b.m.visible = b.t < 0.9; }
  for (const l of HUB.luciernagas){ l.a += pdt * l.v * 0.4; const r = l.r + Math.sin(time * 0.5 + l.f) * 0.6; l.m.position.set(Math.cos(l.a) * r, l.y + Math.sin(time * 1.3 + l.f) * 0.3, Math.sin(l.a) * r);
    l.m.visible = Math.sin(time * 2.1 + l.f * 3) > -0.2; }
  for (const c of HUB.cristales){ c.m.position.y = c.y + Math.sin(time * 1.4 * c.f) * 0.08; c.m.rotation.y += pdt * 1.2; }
  if (HUB.granCristal){ HUB.granCristal.position.y = 2.25 + Math.sin(time * 1.1) * 0.12; HUB.granCristal.rotation.y += pdt * 0.7; }
  if (HUB.portal) HUB.portal.material.uniforms.uColor.value.setScalar(0.88 + 0.12 * Math.sin(time * 2.2));
  if (!HUB.fase) HUB.M.runas.uniforms.uEmissive.value = 0.32 + 0.1 * Math.sin(time * 1.6);
  if (typeof LUZ !== 'undefined'){ if (LUZ.haces) LUZ.haces.visible = false; if (LUZ.charcos) LUZ.charcos.visible = false; }   // de noche, sin haces de sol (las motas sí)
  // choques con el decorado
  if (gameState === 'play' || gameState === 'hubMenu'){ const H = hero.position;
    for (const o of HUB.obst){ const dx = H.x - o.x, dz = H.z - o.z, d = Math.hypot(dx, dz), m = o.r + 0.3; if (d < m && d > 1e-4){ H.x = o.x + dx / d * m; H.z = o.z + dz / d * m; } } }
  // lo que tapa la cámara se desvanece
  { const cx = camera.position.x, cz = camera.position.z, cy = camera.position.y, hx = hero.position.x, hz = hero.position.z, vx = hx - cx, vz = hz - cz, L2 = vx * vx + vz * vz || 1;
    for (const T of HUB.tapa){ const k = clamp(((T.x - cx) * vx + (T.z - cz) * vz) / L2, 0, 1), px = cx + vx * k, pz = cz + vz * k, d = Math.hypot(T.x - px, T.z - pz);
      const yLinea = cy + (1.0 + hero.position.y - cy) * k, tapa = gameState !== 'hubCine' && k > 0.02 && k < 0.98 && d < T.r + 0.35 && T.h > yLinea - 0.25;
      fundeObj(T.o, tapa ? 0 : 1, dt); } }
  // el sitio que se puede usar
  let cerca = null;
  if (gameState === 'play' && !player.dead && HUB.sale < 0){ let best = 1e9;
    for (const p of HUB.puntos){ const d = Math.hypot(hero.position.x - p.x, hero.position.z - p.z); if (d < p.r && d < best){ best = d; cerca = p; } } }
  if (cerca !== HUB.cerca){ HUB.cerca = cerca; hubAvisoEl.hidden = !cerca; if (cerca){ hubAvisoEl.querySelector('b').textContent = cerca.nom; hubAvisoEl.classList.toggle('solo', !cerca.abre); }
    hubPadTxt(cerca && cerca.abre ? cerca.nom : null); }
  if (cerca){ hubPr.set(cerca.ax, cerca.y, cerca.az).project(camera);
    if (hubPr.z > 1) hubAvisoEl.style.display = 'none'; else { hubAvisoEl.style.display = ''; hubAvisoEl.style.transform = `translate(${(hubPr.x * 0.5 + 0.5) * innerWidth}px,${(-hubPr.y * 0.5 + 0.5) * innerHeight}px) translate(-50%,-100%)`; } }
  // la salida: cruzar el arco
  if (gameState === 'play' && HUB.sale < 0 && hero.position.z < -7.75 && Math.abs(hero.position.x) < 1.25){ HUB.sale = 0; play('hubSale'); hubAvisoEl.hidden = true; }
  if (HUB.sale >= 0){ HUB.sale += pdt; fadeEl.style.opacity = String(clamp(HUB.sale / 0.45, 0, 1)); hero.position.z = Math.max(hero.position.z - pdt * 2.5, -HUB_R);
    if (HUB.sale >= 0.5){ HUB.directo = true; try { startRun(); } finally { HUB.directo = false; } } }
}

/* ---------- Cámara: el revivir y el vestidor ---------- */
// El panel del vestidor va a la izquierda (horizontal) o abajo (vertical): la cámara deja a Tovan en el centro del hueco que queda
function hubCamVestidor(){
  const H = hero.position, pan = wardScr.firstElementChild, r = pan ? pan.getBoundingClientRect() : { right: 0, top: innerHeight }, W = innerWidth, Hh = innerHeight;
  const tanY = Math.tan(camera.fov * Math.PI / 360), tanX = tanY * camera.aspect, tall = W < Hh, alto = 2.8;   // Tovan mide unos 2,3 m (con la cabeza grande)
  let d, nx = 0, ny = 0;
  if (tall){ const libre = clamp(r.top / Hh, 0.3, 1); d = clamp(alto / (2 * tanY * libre * 0.9), 2.6, 9); ny = 1 - libre; }
  else { const libre = clamp((W - r.right) / W, 0.25, 1); d = clamp(Math.max(alto / (2 * tanY * 0.8), 1.7 / (2 * tanX * libre * 0.8)), 3, 9); nx = 1 - libre; }
  const cy = 1.3;   // el centro de Tovan, más o menos
  HUB.camP.set(H.x + d, cy + 0.35, H.z); HUB.camT.set(H.x, cy + 0.2 - ny * d * tanY, H.z + nx * d * tanX);
}
const _csCameraHub = csCamera;
csCamera = function(cam){
  _csCameraHub(cam);
  if (!HUB.on) return;
  if (HUB.fase === 'revive' && HUB.t < HUB_REV.frag) hero.visible = false;   // aún no está: solo los fragmentos
  else if (HUB.fase === 'revive' && HUB.t < HUB_REV.frag + 0.3) hero.visible = Math.floor(HUB.t * 30) % 3 !== 0;
  if (HUB.menu === 'vestidor') hubCamVestidor();
  HUB.camK = clamp(HUB.camK + (HUB.camQuiere ? 1 : -1) * HUB.dt / 0.55, 0, 1);
  if (HUB.camK <= 0) return;
  const k = smooth(HUB.camK); HUB.cam.position.copy(HUB.camP); HUB.cam.lookAt(HUB.camT);
  cam.position.lerp(HUB.cam.position, k); cam.quaternion.slerp(HUB.cam.quaternion, k);
};

/* ---------- Envoltorios ---------- */
const _v3UpdateHub = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateHub(dt, pdt, playing); if (HUB.on){ try { hubTick(dt, pdt); } catch (err) { console.error(err); } } };
// «Empezar» y «Revivir» llevan al campamento (la primera partida, con la introducción, va directa)
const _startRunHub = startRun;
startRun = function(){
  if (!HUB.on && !HUB.directo && !forceIntro && meta.intro2 && (gameState === 'title' || gameState === 'over')){ hubEntra(gameState === 'over' ? 'revive' : 'llega'); return; }
  if (HUB.on) hubDesmonta();
  return _startRunHub.apply(this, arguments);
};
const _selJefeEmpiezaHub = selJefeEmpieza;
selJefeEmpieza = function(){ HUB.directo = true; try { return _selJefeEmpiezaHub.apply(this, arguments); } finally { HUB.directo = false; } };
const _toTitleHub = toTitle;
toTitle = function(){ if (HUB.on) hubDesmonta(); const r = _toTitleHub.apply(this, arguments); hubRotulos(); return r; };
const _doAttackHub = doAttack;
doAttack = function(){
  if (HUB.on){ if (gameState === 'hubCine'){ hubSalta(); return; }
    if (gameState === 'play' && HUB.cerca && HUB.cerca.abre && state === 'normal' && grounded){ hubUsa(HUB.cerca); return; } }
  return _doAttackHub.apply(this, arguments);
};
addEventListener('keydown', e => { if (HUB.on && gameState === 'hubCine' && !e.repeat && ['KeyJ', 'Space', 'Enter', 'Escape', 'KeyE'].includes(e.code)) hubSalta(); });
// «Rendirse» en el campamento vuelve al título (no hay nada que perder)
const _dieHub = die;
die = function(){ if (HUB.on){ pauseScr.hidden = true; toTitle(); return; } return _dieHub.apply(this, arguments); };
const _togglePauseHub = togglePause;
togglePause = function(){ const r = _togglePauseHub.apply(this, arguments); const q = document.getElementById('quitBtn'); if (q) q.textContent = HUB.on ? 'Salir al título' : 'Rendirse'; return r; };
// las pantallas se cierran de vuelta al campamento
const _closeWardHub = closeWard; closeWard = function(){ _closeWardHub(); if (HUB.menu) hubVuelve(); };
addEventListener('DOMContentLoaded', () => {   // el santuario (interfaz/santuario.js) carga en «Arranque», después de esto
  const _closeShrineHub = closeShrine; closeShrine = function(){ _closeShrineHub(); if (HUB.menu) hubVuelve(); };
  document.getElementById('shrineBack').addEventListener('click', () => { if (HUB.menu === 'santuario') hubVuelve(); }); });
const _closeAchHub = closeAch; closeAch = function(){ _closeAchHub(); if (HUB.menu) hubVuelve(); };
// los botones «Volver» llaman a la función de antes (se cogió al cargar): estos van detrás y devuelven al campamento
for (const [id, menu] of [['endScrBack', 'finales'], ['wardBack', 'vestidor'], ['achBack', 'logros']]) document.getElementById(id).addEventListener('click', () => { if (HUB.menu === menu) hubVuelve(); });
const _mpAroTickHub = mpAroTick; mpAroTick = function(){ _mpAroTickHub(); if (HUB.on) mpAro.visible = false; };
const _showOverHub = showOver; showOver = function(){ const r = _showOverHub.apply(this, arguments); hubRotulos(); return r; };
// el vestidor solo está en el campamento: fuera de los menús en cuanto se ha visto la introducción
function hubRotulos(){
  const on = !!meta.intro2, wb = document.getElementById('wardBtn'), wb2 = document.getElementById('wardBtn2'), rb = document.getElementById('retryBtn'), td = document.querySelector('#startBtn .td');
  if (wb){ wb.hidden = on; wb.classList.toggle('tbtn', !on); } if (wb2) wb2.hidden = on;
  if (rb) rb.textContent = on ? '✦ Revivir' : '▶ Reintentar'; if (td) td.textContent = on ? 'Al campamento' : 'Nueva partida';
}
hubRotulos();

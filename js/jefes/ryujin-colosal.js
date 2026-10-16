'use strict';
/* ======================================================================
   RYŪJIN COLOSAL · la segunda vida del dragón de jade
   Al dejar a Ryūjin a cero no muere: atropella a Tovan (Camión-kun se
   ha hecho escuela), crece hasta el tamaño de una mudanza y sale volando
   con él encima. Sobre el lomo hay que romper tres sellos de jade
   aguantando sacudidas (mantener RODAR para agarrarse), púas y lluvia de
   fuego; luego se lanza en picado y hay que llegar, con viento de cara,
   hasta la perla de la cabeza. Al romperla sigue el flujo de siempre:
   «¡Ryūjin derrotado!», win_dragon, el trozo de la hoja de ruta y las cartas.
   - El lomo es una pasarela plana a y = 0 (saltos y golpes funcionan igual):
     el dragón ondula de lado y arrastra a Tovan; el que se inclina es el mundo.
   - Los sellos y la perla son enemigos (isBoss, sin frenesí) para que les
     den todos los ataques; el envoltorio de killEnemy los rompe a su manera.
   - Todo se construye la primera vez que hace falta y con su propio PRNG:
     nada de rnd() al cargar.
   ====================================================================== */
const COL_Z0 = -30, COL_N = 40, COL_SP = 1.8, COL_ZMAX = 21.5, COL_ZMIN = -15.5, COL_ZMIN_FIN = -26.4, COL_SELLOS = [14.5, 1, -11.5], COL_ZPERLA = -25.2;
const COL = { on: false, montado: false, built: false, fase: null, e: null, tt: 0, giro: 0, giroObj: 0, giroS: 1, picado: 0, banco: 0, bancoObj: 0, cabeceo: 0, boca: 0.12, temblor: 0,
  atq: null, atqCd: 0, primero: null, ultimo: '', rotas: 0, sellos: [], perla: null, aguante: 1, agarra: false, sinFuerza: 0, vu: 0, uLock: 0, zLock: 0, zMin: COL_ZMIN,
  rafaga: 0, rafagaObj: 0, cae: null, pendFinal: 0, prev: null, son: null, despS: 0, despN: 0 };
BOSS_CARDS.ryucol = ['RYŪJIN · SEGUNDA VIDA', 'Dragón de jade · Ahora en tamaño mudanza', '#7fe8c8'];

/* ---------- Forma: radio, ondulación y altura del lomo a lo largo de z ---------- */
const colR = z => z < -16 ? lerp(2.15, 2.8, smooth(clamp((z + 30) / 14, 0, 1))) : z <= 22 ? 2.8 + 0.3 * Math.sin((z + 16) / 38 * Math.PI) : lerp(2.7, 0.32, Math.pow(clamp((z - 22) / 18.5, 0, 1), 0.85));
const colHW = z => Math.max(0.6, colR(z) * 0.55);   // media anchura de la pasarela
function colC(z){   // desplazamiento lateral del espinazo: ondula como una serpiente; la cola latiguea y el cuello se gira para mirar atrás
  let x = Math.sin(z * 0.15 - COL.tt * 0.85) * (0.6 + 0.025 * Math.max(0, z - 6));
  if (z > 22) x += Math.sin(z * 0.33 - COL.tt * 2.4) * (z - 22) * 0.13;
  if (z < -15) x += COL.giro * COL.giroS * 10 * smooth(clamp((-15 - z) / 15, 0, 1));
  return x;
}
function colTop(z){   // altura de la cara de arriba (0 en la pasarela; el cuello sube hasta la cabeza y la cola cae)
  let y = 0;
  if (z < -15) y += (6 * (1 - COL.picado) + 3 * COL.giro) * smooth(clamp((-15 - z) / 15, 0, 1));
  if (z > 22){ const k = clamp((z - 22) / 18.5, 0, 1); y += -4.5 * k * k + Math.sin(z * 0.3 - COL.tt * 1.7) * 1.6 * k; }
  return y;
}
const colPeligro = () => !!COL.atq && (COL.atq.tipo === 'sacude' || COL.atq.tipo === 'rafaga');
const colTactil = () => matchMedia('(pointer:coarse)').matches;
const colV = [new V3(), new V3(), new V3(), new V3()], colMira = new THREE.Object3D();

/* ---------- Interfaz: líneas de velocidad, aviso de agarre y aguante ---------- */
const colVientoEl = document.createElement('div'); colVientoEl.id = 'colViento'; colVientoEl.hidden = true; document.body.appendChild(colVientoEl);
const colAvisoEl = document.createElement('div'); colAvisoEl.id = 'colAviso'; colAvisoEl.hidden = true; colAvisoEl.innerHTML = '<b></b><small></small>'; document.body.appendChild(colAvisoEl);
const colAgarreEl = document.createElement('div'); colAgarreEl.id = 'colAgarre'; colAgarreEl.hidden = true; document.body.appendChild(colAgarreEl);
const colBtnRodar = document.querySelector('#pad [data-act=roll]');
let colTocaRodar = false;
if (colBtnRodar){ colBtnRodar.addEventListener('pointerdown', () => { colTocaRodar = true; }); for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) colBtnRodar.addEventListener(ev, () => { colTocaRodar = false; }); }
function colPadRodar(){ try { const ps = navigator.getGamepads ? navigator.getGamepads() : null; if (ps) for (const p of ps) if (p && p.connected) return [1, 5, 7].some(i => p.buttons[i] && p.buttons[i].pressed); } catch (err) {} return false; }
function colAviso(txt){
  if (!txt){ colAvisoEl.hidden = true; if (colBtnRodar && colBtnRodar.dataset.col){ colBtnRodar.textContent = colBtnRodar.dataset.col; delete colBtnRodar.dataset.col; colBtnRodar.classList.remove('tutoOjo'); } return; }
  colAvisoEl.querySelector('b').textContent = txt; colAvisoEl.querySelector('small').textContent = colTactil() ? 'Mantén pulsado AGARRA' : 'Mantén K o Shift'; colAvisoEl.hidden = false;
  if (colBtnRodar && !colBtnRodar.dataset.col){ colBtnRodar.dataset.col = colBtnRodar.textContent; colBtnRodar.textContent = 'Agarra'; colBtnRodar.classList.add('tutoOjo'); }
}

/* ---------- Sonido: viento continuo, ráfagas, sellos rotos ---------- */
Object.assign(SFX, {
  colRafaga: () => { noise({ dur: 1.3, vol: 0.22, f0: 280, f1: 1600, type: 'bandpass', q: 0.7, attack: 0.35, rv: 0.3 }); },
  colRompe: () => { noise({ dur: 0.45, vol: 0.32, f0: 6000, f1: 900, type: 'highpass', q: 0.6, rv: 0.4 }); tone({ type: 'triangle', f0: 1500, f1: 240, dur: 0.7, vol: 0.18, rv: 0.5 }); tone({ type: 'square', f0: 990, f1: 660, dur: 0.25, vol: 0.06, when: 0.08 }); },
  colAgarre: () => { tone({ type: 'square', f0: 240, f1: 150, dur: 0.07, vol: 0.1 }); noise({ dur: 0.08, vol: 0.12, f0: 1800, q: 1.2 }); }
});
function colVientoSon(on){
  if (!actx) return;
  if (on && !COL.son){ try {
    const src = actx.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const bp = actx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = 0.8;
    const g = actx.createGain(); g.gain.value = 0; src.connect(bp); bp.connect(g); g.connect(sfxBus); src.start(); COL.son = { src, bp, g }; } catch (err) {} }
  else if (!on && COL.son){ const s = COL.son; COL.son = null; try { s.g.gain.setTargetAtTime(0, actx.currentTime, 0.15); s.src.stop(actx.currentTime + 0.8); } catch (err) {} }
}

/* ---------- Construcción (la primera vez) ---------- */
function colConstruye(){
  if (COL.built) return; COL.built = true;
  const R32 = mulberry32(4242), r = () => R32(); COL.r = r;
  const S = COL.S = matSet([[0xffffff], [0xf0dca0], [0xe0b040], [0xff4030, 1], [0xf6f0e0], [0x1a4a44]]);
  S[0].m.uniforms.uMap.value = dScaleTex; S[0].m.uniforms.uHasMap.value = 1;
  const oro = S[2].m, matTex = makeMat(0xffffff, { map: dScaleTex, vc: true, relleno: false }), matLiso = makeMat(0xffffff, { vc: true, relleno: false });
  const pieza = (geo, x, y, z, q, col, tex) => { const m = mesh(geo, oro, x, y, z, q); m.userData = { col, tex }; return m; };
  // Cuerpo: anillos aplastados con una banda de escudos dorados encima (la pasarela), púas a los lados y crin para agarrarse
  const dr = COL.dr = new THREE.Group(); dr.visible = false; scene.add(dr);
  const cyl = scaleUV(new THREE.CylinderGeometry(1, 0.94, COL_SP * 1.5, 9), 3, 1), plateG = scaleUV(B(1, 0.42, COL_SP * 1.06), 2, 1), bellyG = B(1, 0.3, COL_SP * 1.1);
  const spikeG = new THREE.ConeGeometry(0.3, 1.5, 4), maneG = new THREE.ConeGeometry(0.24, 1.3, 4);
  COL.segs = [];
  for (let i = 0; i < COL_N; i++){
    const z = COL_Z0 + i * COL_SP, R = colR(z), hw = colHW(z);
    const sg = new THREE.Group(); sg.userData = { z, R }; dr.add(sg); COL.segs.push(sg);
    const q = new THREE.Group();   // las piezas fijas del anillo se funden en dos mallas (con textura y lisa), con el color en los vértices
    const b = pieza(cyl, 0, 0, 0, q, 0xffffff, true); b.rotation.x = Math.PI / 2; b.scale.set(R, 1, R * 0.62);
    const pl = pieza(plateG, 0, R * 0.62 - 0.21, 0, q, i % 2 ? 0x8fc07a : 0x9fcf86, true); pl.scale.x = Math.min(hw * 2 + 0.5, R * 1.6);
    const bl = pieza(bellyG, 0, -R * 0.5, 0, q, 0xf0dca0); bl.scale.x = R * 1.1;
    if (i % 2 === 0 && R > 0.8) for (const s of [-1, 1]){ const sp = pieza(spikeG, s * Math.min(hw + 0.5, R * 0.9), R * 0.5, 0, q, 0xe0b040); sp.rotation.z = -0.55 * s; sp.scale.setScalar(R / 2.8); }
    if (i % 3 === 1 && R > 0.8) for (const s of [-1, 1]){ const m = pieza(maneG, s * (hw + 0.1), R * 0.62, -0.3, q, 0xff6a40); m.rotation.set(-1.0, 0, -0.35 * s); }
    if (i === COL_N - 1) for (const s of [-1, 1]){ const f = pieza(new THREE.ConeGeometry(0.9, 3.2, 4), 0.4 * s, 0.1, -1.6, q, 0xe0b040); f.rotation.set(-1.7, 0, 0.5 * s); f.scale.z = 0.35; }
    colFundeVC(q, sg, matTex, matLiso);
    if (i === 12 || i === 24) sg.userData.legs = [-1, 1].map(s => { const L = new THREE.Group(), q2 = new THREE.Group(); L.position.set(R * 0.92 * s, -R * 0.25, 0); sg.add(L);
      pieza(B(0.8, 2.6, 0.8), 0, -1.3, 0.2, q2, 0xffffff, true); for (let k = -1; k <= 1; k++){ const cl = pieza(new THREE.ConeGeometry(0.22, 0.9, 4), k * 0.3, -2.8, 0.55, q2, 0xe0b040); cl.rotation.x = 1.2; }
      colFundeVC(q2, L, matTex, matLiso); return L; });
  }
  // Cabeza: la del dragón pequeño, clonada y a escala (con materiales propios para no compartir destellos)
  const src = COL.e.head, ud = src.userData; src.userData = {}; const H = src.clone(); src.userData = ud;
  H.visible = true; H.scale.setScalar(4.6); dr.add(H); COL.cab = H;
  COL.mand = H.children[0].children[src.children[0].children.indexOf(COL.e.jaw)]; COL.bigotes = [];
  H.traverse(o => { if (o.userData && o.userData.s) COL.bigotes.push(o); if (o.isMesh){ const k = COL.e.mats.findIndex(x => x.m === o.material); if (k >= 0) o.material = S[k].m; } });
  { const hs = H.children[0], q = new THREE.Group(); for (const ch of [...hs.children]) if (ch !== COL.mand && !COL.bigotes.includes(ch)) q.add(ch); mpFusiona(q, hs); }
  // Mundo: el que se mueve (y se inclina) alrededor de Tovan
  const env = COL.env = new THREE.Group(); env.visible = false; scene.add(env);
  { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const g = cv.getContext('2d');   // campos, bosques y un río, muy abajo
    g.fillStyle = '#6f9a4a'; g.fillRect(0, 0, 64, 64);
    const cols = ['#5d8a3c', '#7fa652', '#9db463', '#b9a862', '#c9b878', '#3f6a3a', '#2f5532'];
    for (let k = 0; k < 80; k++){ g.fillStyle = cols[r() * cols.length | 0]; const x = r() * 64 | 0, y = r() * 64 | 0, w = 4 + r() * 12 | 0, h = 3 + r() * 10 | 0; for (const ox of [0, -64]) for (const oy of [0, -64]) g.fillRect(x + ox, y + oy, w, h); }
    g.strokeStyle = '#5f8fbf'; g.lineWidth = 2; g.beginPath(); for (let y = 0; y <= 64; y += 2){ const x = 32 + Math.sin(y / 64 * TAU) * 10 + Math.sin(y / 64 * TAU * 3) * 4; if (y) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
    const tx = new THREE.CanvasTexture(cv); tx.magFilter = THREE.NearestFilter; tx.minFilter = THREE.LinearMipmapLinearFilter; tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    COL.tile = 100; COL.suelo = mesh(scaleUV(new THREE.PlaneGeometry(1200, 1200, 20, 20), 12, 12), makeMat(0xffffff, { map: tx }), 0, -150, 0, env); COL.suelo.rotation.x = -Math.PI / 2; }
  { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d');   // mar de nubes (el alfa decide dónde hay nube)
    for (let k = 0; k < 70; k++){ const x = r() * 128, y = r() * 128, rad = 8 + r() * 22;
      for (const ox of [-128, 0, 128]) for (const oy of [-128, 0, 128]){ const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, 'rgba(255,255,255,0.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); } }
    const im = g.getImageData(0, 0, 128, 128); for (let k = 3; k < im.data.length; k += 4){ const a = im.data[k] / 255; im.data[k] = Math.round(255 * smooth(clamp((a - 0.28) / 0.3, 0, 1))); } g.putImageData(im, 0, 0);
    const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    COL.tile2 = 200; COL.mar = mesh(scaleUV(new THREE.PlaneGeometry(1400, 1400, 20, 20), 7, 7), makeMat(0xfff1e6, { map: tx }), 0, -42, 0, env); COL.mar.rotation.x = -Math.PI / 2; }
  const nubeMat = makeMat(0xfffaf4), nubeG = new THREE.IcosahedronGeometry(1, 1);
  COL.nubes = [];
  for (let k = 0; k < 24; k++){
    const c = new THREE.Group(), q = new THREE.Group(); env.add(c); const n = 3 + (r() * 4 | 0), s = 4 + r() * 7;
    for (let j = 0; j < n; j++){ const m = mesh(nubeG, nubeMat, (j - n / 2) * s * 0.7 + (r() - 0.5) * s * 0.4, (r() - 0.3) * s * 0.5, (r() - 0.5) * s * 0.8, q); m.scale.set(s * (0.7 + r() * 0.6), s * (0.5 + r() * 0.35), s * (0.7 + r() * 0.5)); }
    mpFusiona(q, c); colNubeSitio(c, true); COL.nubes.push(c);
  }
  const sol = new THREE.Group(); env.add(sol); sol.position.set(-140, 34, -300); sol.lookAt(0, 0, 0);
  mesh(new THREE.CircleGeometry(20, 24), makeMat(0xfff2c8, { emissive: 1, noFog: true }), 0, 0, 0, sol);
  mesh(new THREE.RingGeometry(20, 46, 24), makeMat(0xffd890, { emissive: 1, noFog: true, opacity: 0.35 }), 0, 0, -1, sol);
  COL.picos = []; const roca = makeMat(0x56648a), nieve = makeMat(0xf4f6ff);
  for (let k = 0; k < 9; k++){ const p = new THREE.Group(); env.add(p); const h = 70 + r() * 70, w = 30 + r() * 30;
    mesh(new THREE.ConeGeometry(w, h, 5), roca, 0, h / 2, 0, p); mesh(new THREE.ConeGeometry(w * 0.32, h * 0.32, 5), nieve, 0, h * 0.84 + 0.5, 0, p);
    p.position.set((r() < 0.5 ? -1 : 1) * (170 + r() * 150), -110, -360 + k * 55 + r() * 30); p.rotation.y = r() * 6; COL.picos.push(p); }
  // Vetas de viento (van con el dragón, no con el mundo)
  COL.vg = new THREE.Group(); COL.vg.visible = false; scene.add(COL.vg); COL.vetas = [];
  const vMat = makeMat(0xffffff, { emissive: 1, opacity: 0.6, noFog: true }), vGeo = B(0.09, 0.09, 1);
  for (let k = 0; k < 34; k++){ const m = mesh(vGeo, vMat, 0, 0, 0, COL.vg); m.userData.v = 38 + r() * 20; COL.vetas.push(m); }
  // Púas que salen del lomo (dos bandas) y círculos de la lluvia de fuego
  const pg = new THREE.PlaneGeometry(1, 1); pg.rotateX(-Math.PI / 2);
  const pMat = makeMat(0xffd070, { emissive: 0.5 }), pG = new THREE.ConeGeometry(0.26, 1.6, 5);
  COL.puas = [0, 1].map(() => { const g = new THREE.Group(); g.visible = false; scene.add(g);
    const tele = mesh(pg, makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0, g);
    const pinchos = Array.from({ length: 7 }, () => mesh(pG, pMat, 0, -1.1, 0, g)); return { g, tele, pinchos, z: 0, hit: false }; });
  const aroG = new THREE.RingGeometry(0.86, 1, 24); aroG.rotateX(-Math.PI / 2); const aroM = makeMat(0xffc040, { emissive: 1 });
  COL.circulos = Array.from({ length: 8 }, () => { const m = mesh(circleGeo, makeMat(0xff5a20, { emissive: 1, opacity: 0.5 }), 0, 0.05, 0); mesh(aroG, aroM, 0, 0.02, 0, m); m.visible = false; return m; });   // (el aro, para que se lea sobre el verde)
  // Chispas de jade propias (spawnFx no baja de y = 0 y el dragón se deshace también por debajo)
  COL.chispas = []; const chG = B(0.3, 0.3, 0.3), chM = [makeMat(0x9fffe0, { emissive: 1 }), makeMat(0xffe070, { emissive: 1 }), makeMat(0xffffff, { emissive: 1 })];
  for (let k = 0; k < 90; k++){ const m = mesh(chG, chM[k % 3], 0, 0, 0); m.visible = false; m.userData = { v: new V3(), t: 0 }; COL.chispas.push(m); }
  for (let k = 0; k < 34; k++) colVeta(COL.vetas[k], true);
}
function colFundeVC(src, dst, matTex, matLiso){   // como mpFusiona, pero con el color de cada pieza en sus vértices: dos llamadas de dibujo por anillo
  src.updateMatrixWorld(true); const gr = { t: [], l: [] }, c = new THREE.Color();
  src.traverse(o => { if (!o.isMesh) return; const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
    c.setHex(o.userData.col); const n = g.attributes.position.count, ca = new Float32Array(n * 3); for (let i = 0; i < n; i++){ ca[i * 3] = c.r; ca[i * 3 + 1] = c.g; ca[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(ca, 3)); gr[o.userData.tex ? 't' : 'l'].push(g); });
  for (const k of ['t', 'l']){ const gs = gr[k]; if (!gs.length) continue; const geo = new THREE.BufferGeometry(), tot = gs.reduce((s, g) => s + g.attributes.position.count, 0);
    for (const at of ['position', 'normal', 'uv', 'color']){ const n = at === 'uv' ? 2 : 3, arr = new Float32Array(tot * n); let off = 0;
      for (const g of gs){ const a = g.attributes[at], cn = g.attributes.position.count; if (a) arr.set(a.array, off); off += cn * n; }
      geo.setAttribute(at, new THREE.BufferAttribute(arr, n)); }
    geo.computeBoundingSphere(); dst.add(new THREE.Mesh(geo, k === 't' ? matTex : matLiso)); }
}
function colNubeSitio(c, cualquiera){
  const r = COL.r, s = r() < 0.5 ? -1 : 1, cerca = r() < 0.35;
  c.position.set(s * (cerca ? 24 + r() * 22 : 50 + r() * 100), cerca ? (r() < 0.5 ? -18 - r() * 14 : 16 + r() * 10) : -34 + r() * 50, cualquiera ? -300 + r() * 380 : -300 - r() * 40);
}
function colVeta(m, cualquiera){
  const r = COL.r, z = hero.position.z - 30 - r() * 30 + (cualquiera ? r() * 45 : 0), s = r() < 0.5 ? -1 : 1;
  m.position.set(colC(z) + s * (2.2 + r() * 9), -2 + r() * 9, z); m.scale.z = 2 + r() * 4;
}
function colChispa(x, y, z, vx, vy, vz){
  const m = COL.chispas.find(c => !c.visible); if (!m) return;
  m.visible = true; m.position.set(x, y, z); m.userData.v.set(vx, vy, vz); m.userData.t = 0.9 + COL.r() * 0.6; m.scale.setScalar(0.6 + COL.r());
}

/* ---------- Subir al cielo / volver al santuario ---------- */
function colMonta(){
  if (COL.montado) return; colConstruye(); COL.montado = true;
  const U = skyMat.uniforms;
  COL.prev = { ARENA, amb: ambMode, fogN: shared.uFogNear.value, fogF: shared.uFogFar.value, fogC: shared.uFogCol.value.getHex(), luz: shared.uLightCol.value.clone(), ambC: shared.uAmb.value.getHex(),
    top: U.uTop.value.getHex(), mid: U.uMid.value.getHex(), hor: U.uHor.value.getHex(), moon: U.uMoonOn.value, stars: U.uStars.value, ocultos: [] };
  const lista = [...BIOMES.map(b => b.group), ground, rune, braz, toroBig, homeGroup, renderGroup, ...brazRuins, ...mountainsList, ...ambP];
  for (const o of lista) if (o && o.visible){ o.visible = false; COL.prev.ocultos.push(o); }
  ambMode = null;                                                      // (updateAmbient volvería a enseñar sus partículas)
  for (const p of pickups) scene.remove(p.m); pickups.length = 0;     // lo que hubiera en el suelo del santuario se queda allí
  ARENA = 90;
  U.uTop.value.setHex(0x23469e); U.uMid.value.setHex(0x6a9ee2); U.uHor.value.setHex(0xffc890); U.uMoonOn.value = 0; U.uStars.value = 0;
  shared.uFogCol.value.setHex(0xf0c8a0); shared.uFogNear.value = 70; shared.uFogFar.value = 360;
  shared.uLightCol.value.setHex(0xffe6c8).multiplyScalar(0.95); shared.uAmb.value.setHex(0x6a74a6);
  COL.dr.visible = COL.env.visible = COL.vg.visible = true; for (const sg of COL.segs) sg.visible = true; COL.cab.visible = true;
  camera.zoom = 0.88; camera.updateProjectionMatrix();
  document.body.classList.add('colVuela'); colVientoEl.hidden = false; colVientoSon(true);
  if (COL.e && COL.e.parts) COL.e.parts.forEach(p => { p.visible = false; });
}
function colDesmonta(){
  if (!COL.montado) return; COL.montado = false;
  const P_ = COL.prev, U = skyMat.uniforms;
  for (const o of P_.ocultos) o.visible = true;
  ambMode = P_.amb; ARENA = P_.ARENA;
  U.uTop.value.setHex(P_.top); U.uMid.value.setHex(P_.mid); U.uHor.value.setHex(P_.hor); U.uMoonOn.value = P_.moon; U.uStars.value = P_.stars;
  shared.uFogCol.value.setHex(P_.fogC); shared.uFogNear.value = P_.fogN; shared.uFogFar.value = P_.fogF; shared.uLightCol.value.copy(P_.luz); shared.uAmb.value.setHex(P_.ambC);
  COL.dr.visible = COL.env.visible = COL.vg.visible = false; sky.rotation.set(0, 0, 0); blob.visible = true; P.spine.rotation.z = 0;
  for (const c of COL.circulos) c.visible = false; for (const p of COL.puas) p.g.visible = false; for (const c of COL.chispas) c.visible = false;
  camera.zoom = 1; camera.updateProjectionMatrix(); if (COL.pitch0 != null){ camPitch = COL.pitch0; COL.pitch0 = null; }
  document.body.classList.remove('colVuela'); colVientoEl.hidden = true; colAgarreEl.hidden = true; colAviso(null); colVientoSon(false);
}
function colQuitaAtaques(){
  COL.bancoObj = 0; COL.giroObj = 0; COL.rafagaObj = 0; COL.boca = 0.12; COL.agarra = false;
  if (COL.puas) for (const p of COL.puas) p.g.visible = false;
  colAviso(null);
}
function colLimpiaLomo(){
  for (const s of [...COL.sellos, COL.perla]) if (s){ s.alive = false; s.remove = true; scene.remove(s.g); }
  COL.sellos = []; COL.perla = null; COL.atq = null; colQuitaAtaques();
  for (let i = fballs.length - 1; i >= 0; i--) if (fballs[i].col){ scene.remove(fballs[i].m); fballs[i].circle.visible = false; fballs.splice(i, 1); }
}
function colAborta(){   // salir a medias (morir y reintentar, volver al título…)
  if (!COL.on && !COL.montado) return;
  colLimpiaLomo(); colDesmonta(); COL.on = false; COL.fase = null; COL.cae = null; COL.e = null;
  if (bossE && bossE.type === 'ryucol'){ bossE = null; bossBox.hidden = true; }
}

/* ---------- Sellos de jade y perla (enemigos quietos sobre el lomo) ---------- */
function colSello(z, perla){
  const g = new THREE.Group(); scene.add(g);
  const S = matSet(perla ? [[0xf4fff8, 0.7], [0xffe070, 1], [0x2a6a5a]] : [[0x7fffd8, 0.55], [0xffe070, 1], [0x24584c]]);
  const body = new THREE.Group(); g.add(body);
  mesh(C(1.05, 1.2, 0.34, 6), S[2].m, 0, 0.1, 0, body);
  const cr = perla ? mesh(new THREE.IcosahedronGeometry(0.62, 1), S[0].m, 0, 1.25, 0, body) : mesh(new THREE.OctahedronGeometry(0.55, 0), S[0].m, 0, 0.85, 0, body);
  if (!perla) cr.scale.y = 1.7;
  const ring = mesh(new THREE.TorusGeometry(0.9, 0.07, 4, 18), S[1].m, 0, 0.3, 0, body); ring.rotation.x = Math.PI / 2;
  const llamas = perla ? Array.from({ length: 6 }, (_, k) => mesh(new THREE.ConeGeometry(0.16, 0.7, 4), S[1].m, Math.cos(k / 6 * TAU) * 0.8, 1.25, Math.sin(k / 6 * TAU) * 0.8, body)) : [];
  const pilar = mesh(C(0.32, 0.32, 46, 6, true), makeMat(0xfff0b0, { emissive: 1, opacity: 0.28 }), 0, 23, 0, g);
  const e = newEnemy(perla ? 'perla' : 'escama', g, body, S, { hp: Math.round(COL.e.maxHp * (perla ? 0.12 : 0.13)), r: 1.0, speed: 0, numY: perla ? 2.4 : 1.9, isBoss: true, heavy: true, noSep: true, spawnT: 0,
    colEscama: true, perla, colZ: z, cr, ring, llamas, pilar, fzT: 1e9, fzMarks: [], fzOn: 0, fzWarn: 0, upd: () => {} });
  e.dm = COL.e.dm; g.position.set(colC(z), 0, z);
  return e;
}
function colBarra(){
  if (!bossE || bossE.type !== 'ryucol' || !COL.e) return;
  const hS = Math.round(COL.e.maxHp * 0.13), hP = Math.round(COL.e.maxHp * 0.12);
  bossE.maxHp = 3 * hS + hP; bossE.hp = COL.sellos.reduce((s, q) => s + Math.max(0, q.hp), 0) + (COL.perla ? Math.max(0, COL.perla.hp) : COL.fase === 'remate' ? 0 : hP);
  const t = COL.fase === 'final' ? 'Ryūjin · segunda vida · ¡la perla!' : `Ryūjin · segunda vida · sellos ${COL.rotas}/3`;
  if (bossNameEl.textContent !== t) bossNameEl.textContent = t;
}
function colRompe(e){
  if (!e.alive) return;
  e.alive = false; e.remove = true; scene.remove(e.g);
  const x = e.g.position.x, z = e.g.position.z;
  ringFx(x, z, 0x9fffe0, 0.3, 4.5, 0.5); ringFx(x, z, 0xffe070, 0.2, 2.6, 0.35, 0.6); lightFlash(x, 1.2, z, 0x9fffe0, 2.2, 9);
  for (let i = 0; i < 30; i++){ const a = rnd() * TAU, sp = 3 + rnd() * 5; spawnFx(x, 0.8, z, Math.cos(a) * sp, 3 + rnd() * 6, Math.sin(a) * sp, rnd() < 0.5 ? 0x9fffe0 : rnd() < 0.5 ? 0xffe070 : 0xffffff, 0.14, 0.9, 9, 0.4); }
  for (let i = 0; i < 14; i++){ const a = rnd() * TAU; colChispa(x, 1, z, Math.cos(a) * 4, 7 + rnd() * 6, Math.sin(a) * 4); }
  sparks(x, 1, z, 16, 0xffe070, 6); flash('#d8fff0', 0.55); shake = Math.max(shake, 0.8); hitStop = 0.12; slowT = Math.max(slowT, 0.6);
  play('colRompe'); play('dragonRoar'); play('boom'); COL.boca = 0.9; COL.temblor = 0.25;
  if (e.perla){ colRemate(); return; }
  COL.rotas++; COL.sellos = COL.sellos.filter(s => s !== e);
  banner(`¡Sello roto!<small>${COL.rotas} de 3</small>`, 1.6);
  barkT = 0; bark(['¡Uno menos! ¡Le ha dolido hasta a mí!', '¡Otro! ¡Ya casi lo tienes!', '¡Se lanza en picado! ¡Corre a la cabeza, a la perla!'][COL.rotas - 1]);
  COL.atq = null; colQuitaAtaques();
  if (COL.rotas >= 3) COL.pendFinal = 1.3;
  else { COL.atqCd = 1.2; if (COL.rotas === 1) COL.primero = 'sacude'; }   // le duele: contesta enseguida (la primera vez, sacudiéndose)
}

/* ---------- Ataques sobre el lomo ---------- */
const colEspera = () => Math.max(1.8, 3.8 - 0.55 * COL.rotas) + rnd() * 1.4;
function colFinAtq(){ COL.atq = null; COL.atqCd = colEspera(); colAviso(null); }
function colElige(){
  let t = COL.primero; COL.primero = null;
  if (!t){ const ops = (COL.fase === 'final' ? ['rafaga', 'puas', 'sacude'] : ['sacude', 'puas', 'fuego']).filter(o => o !== COL.ultimo); t = ops[Math.floor(rnd() * ops.length)]; }
  COL.ultimo = t; const A = COL.atq = { tipo: t, t: 0, n: 0, s: rnd() < 0.5 ? -1 : 1 };
  if (t === 'sacude'){ play('dragonRoar'); COL.boca = 0.7; COL.temblor = 0.15; colAviso('¡AGÁRRATE!');
    if (!COL.dijoAgarre){ COL.dijoAgarre = true; barkT = 0; bark(colTactil() ? '¡Se va a sacudir! ¡Mantén pulsado AGARRA (el botón de rodar)!' : '¡Se va a sacudir! ¡Mantén K o Shift para agarrarte!'); } }
  else if (t === 'rafaga'){ play('colRafaga'); colAviso('¡RÁFAGA!'); barkOnce('colRafaga', '¡Viento de cara! Agárrate en las ráfagas o te manda a la cola.'); }
  else if (t === 'puas'){
    const z0 = clamp(hero.position.z + (rnd() - 0.5) * 1.5, COL.zMin + 1.2, COL_ZMAX - 1.2), zs = [z0];
    if (rnd() < 0.55) zs.push(clamp(z0 + (rnd() < 0.5 ? -1 : 1) * 4.2, COL.zMin + 1.2, COL_ZMAX - 1.2));
    A.bandas = zs.length; zs.forEach((z, i) => { const P_ = COL.puas[i]; P_.z = z; P_.hit = false; P_.g.visible = true; P_.g.position.set(colC(z), 0, z); P_.tele.visible = false; });
    play('bruteWarn'); barkOnce('colPuas', '¡Púas! Salta o apártate de la franja roja.'); }
  else if (t === 'fuego'){ COL.giroS = hero.position.x - colC(hero.position.z) >= 0 ? 1 : -1; COL.giroObj = 1; barkOnce('colFuego', '¡Se da la vuelta para escupirte! ¡Fuera de los círculos!'); }
}
function colEscupe(primero){
  const Ci = COL.circulos.find(c => !c.visible); if (!Ci) return;
  let z = hero.position.z, u = hero.position.x - colC(z);
  if (!primero){ z += (rnd() - 0.5) * 5; u += (rnd() - 0.5) * 2.4; }
  z = clamp(z, COL.zMin + 0.5, COL_ZMAX - 0.5); const hw = colHW(z); u = clamp(u, -hw, hw);
  const to = new V3(colC(z) + u, 0.05, z);
  Ci.position.copy(to); Ci.scale.setScalar(1.3); Ci.visible = true; Ci.userData.z = z; Ci.userData.u = u;
  COL.cab.updateMatrixWorld(true); const from = new V3(0, -0.1, 1.4).applyMatrix4(COL.cab.matrixWorld);
  const m = mesh(orbGeo, fballMat, from.x, from.y, from.z); mesh(orbGeo, fballMat, 0, 0, 0, m).scale.setScalar(2.2);
  fballs.push({ m, from, to, t: 0, dur: 0.95, circle: Ci, dm: COL.e.dm, col: true });
  play('fireball'); lightFlash(from.x, from.y, from.z, 0xff8a30, 1.6, 8);
}
function colAtaqueTick(dt){
  const A = COL.atq;
  if (!A){ if (COL.pendFinal > 0) return; COL.atqCd -= dt; if (COL.atqCd <= 0 && !player.dead) colElige(); return; }
  A.t += dt;
  if (A.tipo === 'sacude'){
    const AV = 1.4, D = 2.8;
    if (A.t >= AV && A.t < AV + D){ const k = (A.t - AV) / D; COL.bancoObj = A.s * 0.58 * Math.sin(k * Math.PI * 2.5) * Math.min(1, (1 - k) * 4);
      if (!A.son){ A.son = true; play('colRafaga'); COL.boca = 0.2; } }
    else if (A.t >= AV + D){ COL.bancoObj = 0; colFinAtq(); }
  } else if (A.tipo === 'rafaga'){
    const AV = 1.1, D = 1.9;
    if (A.t >= AV && A.t < AV + D) COL.rafagaObj = 6.5;
    else if (A.t >= AV + D){ COL.rafagaObj = 0; colFinAtq(); }
  } else if (A.tipo === 'puas'){
    const AV = 1.15;
    for (let i = 0; i < A.bandas; i++){
      const P_ = COL.puas[i], z = P_.z, hw = colHW(z);
      P_.g.position.set(colC(z), 0, z); P_.tele.visible = A.t < AV; P_.tele.scale.set(hw * 2 + 0.4, 1, 2.2); P_.tele.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 12));
      const up = A.t < AV ? 0 : A.t < AV + 0.12 ? (A.t - AV) / 0.12 : A.t < AV + 0.75 ? 1 : Math.max(0, 1 - (A.t - AV - 0.75) / 0.3);
      P_.pinchos.forEach((c, k) => { c.position.set((k / 6 - 0.5) * 2 * hw, lerp(-1.1, 0.75, up) + (k % 2) * 0.15 * up, (k % 2 ? 0.35 : -0.35)); });
      if (up > 0.6 && !P_.hit && Math.abs(hero.position.z - z) < 1.15 && hero.position.y < 0.65){ if (hurtPlayer(18 * COL.e.dm, hero.position.x, z, 6) === 'hit') P_.hit = true; }
    }
    if (A.t >= AV && !A.son){ A.son = true; play('bossSlam'); COL.temblor = 0.2;
      for (let i = 0; i < A.bandas; i++){ const z = COL.puas[i].z; for (let k = 0; k < 10; k++) spawnFx(colC(z) + (rnd() - 0.5) * 3, 0.2, z + (rnd() - 0.5) * 1.6, 0, 3 + rnd() * 3, 0, rnd() < 0.5 ? 0xffd070 : 0xfff0c0, 0.1, 0.5, 8, 0.3); } }
    if (A.t > AV + 1.15){ for (const P_ of COL.puas) P_.g.visible = false; colFinAtq(); }
  } else if (A.tipo === 'fuego'){
    if (A.t > 0.35 && !A.son){ A.son = true; play('dragonRoar'); }
    COL.boca = A.t > 0.8 && A.t < 2.8 ? 0.75 : 0.25;
    if (A.t > 1.1 && A.n < 6 && A.t > 1.1 + A.n * 0.24){ colEscupe(A.n === 0); A.n++; }
    if (A.t > 2.9) COL.giroObj = 0;
    if (A.t > 3.7){ COL.boca = 0.12; colFinAtq(); }
  }
}

/* ---------- Caída: si te escurres por un lado, Lumen te recoge (y cobra) ---------- */
function colCae(u){
  COL.cae = { t: 0, s: Math.sign(u) || 1, v: 0, y: 0, fase0: COL.fase }; COL.fase = 'caida'; COL.agarra = false; COL.vu = 0;
  state = 'normal'; attackW = 0; staffToBack(); grounded = true; vy = 0; blob.visible = false; colAviso(null);
  play('jump'); barkT = 0; bark('¡¡Tovaaan!!');
}
function colCaeTick(dt){
  const K = COL.cae; K.t += dt; K.v += 18 * dt; K.y -= K.v * dt;
  hero.position.x += K.s * 2.4 * dt; hero.position.y = K.y; grounded = true; vy = 0; P.body.rotation.x += dt * 5;
  if (K.t < 1.25) return;
  flash('#ffffff', 0.9); P.body.rotation.x = 0; blob.visible = true;
  const z = clamp(hero.position.z, COL.zMin + 1, COL_ZMAX - 1); hero.position.set(colC(z), 0, z); grounded = true;
  const v = Math.max(0, Math.min(player.hp - 1, Math.round(player.maxHp * 0.12))); player.hp -= v; dmgWave = true;
  if (v){ colV[0].set(hero.position.x, 2.4, hero.position.z); spawnNumber(colV[0], v, 'hurt'); }
  player.inv = 1.6; play('revive'); barkT = 0; bark('¡Te tengo! …Pesas más de lo que parece. Eso te lo cobro en vida.');
  COL.fase = K.fase0; COL.cae = null; COL.aguante = 1; COL.atq = null; colQuitaAtaques(); COL.atqCd = 3; for (const p of COL.puas) p.g.visible = false;
}

/* ---------- Cada fotograma ---------- */
function colTick(dt, pdt, playing){
  if (!COL.montado) return;
  const run = gameState === 'paused' ? 0 : dt, jugando = playing && COL.on && (COL.fase === 'lomo' || COL.fase === 'final' || COL.fase === 'caida');
  const z0 = hero.position.z, c0 = colC(z0);
  // estado del dragón: ondulación, cuello, picado, alabeo
  COL.tt += run;
  COL.giro += (COL.giroObj - COL.giro) * (1 - Math.exp(-run * 2.2));
  if (COL.fase === 'final' || COL.fase === 'remate') COL.picado = Math.min(1, COL.picado + run / 2.5);
  COL.banco += (COL.bancoObj - COL.banco) * (1 - Math.exp(-run * 5));
  COL.cabeceo += (0.3 * COL.picado + 0.04 * Math.sin(COL.tt * 0.4) - COL.cabeceo) * (1 - Math.exp(-run * 2));
  COL.temblor = Math.max(0, COL.temblor - run * 0.5);
  COL.rafaga += ((COL.fase === 'final' ? 0.9 : 0) + COL.rafagaObj - COL.rafaga) * (1 - Math.exp(-run * 4));
  if (jugando) hero.position.x += colC(z0) - c0;   // el lomo arrastra a Tovan
  // cuerpo
  const S = COL.segs;
  for (const sg of S){ const z = sg.userData.z; sg.position.set(colC(z), colTop(z) - sg.userData.R * 0.62, z); }
  for (let i = 0; i < S.length; i++){ const sg = S[i];
    if (i) sg.lookAt(S[i - 1].position); else { colV[0].set(2 * sg.position.x - S[1].position.x, 2 * sg.position.y - S[1].position.y, sg.position.z - COL_SP); sg.lookAt(colV[0]); }
    if (sg.userData.legs) sg.userData.legs.forEach((L, j) => { L.rotation.x = Math.sin(COL.tt * 2.2 + i + j * 2.5) * 0.7; }); }
  // cabeza: al frente (y algo arriba), a Tovan cuando se gira, hacia abajo en el picado
  { const H = COL.cab, s0 = S[0].position, d = colV[1].copy(s0).sub(S[1].position).normalize();
    H.position.copy(s0).addScaledVector(d, 1.6); H.position.y += 0.4;
    const tg = colV[2].copy(H.position).addScaledVector(d, 10); tg.y += 1.5 - 7 * COL.picado;
    if (COL.giro > 0.02) tg.lerp(colV[3].set(hero.position.x, 1, hero.position.z), smooth(Math.min(1, COL.giro)));
    colMira.position.copy(H.position); colMira.lookAt(tg); H.quaternion.slerp(colMira.quaternion, 1 - Math.exp(-run * 4));
    if (COL.mand) COL.mand.rotation.x += (COL.boca - COL.mand.rotation.x) * (1 - Math.exp(-run * 10));
    COL.boca += (0.12 - COL.boca) * (1 - Math.exp(-run * 0.8));
    for (const w of COL.bigotes) w.rotation.x = 1.0 + Math.sin(COL.tt * 6 + w.userData.s) * 0.2; }
  // mundo alrededor de Tovan (se inclina con el alabeo y el picado)
  { const env = COL.env, vel = (28 + 18 * COL.picado) * run;
    env.position.set(hero.position.x, 0, hero.position.z); env.rotation.set(COL.cabeceo, 0, COL.banco); sky.rotation.set(COL.cabeceo, 0, COL.banco);
    COL.despS = (COL.despS + vel) % COL.tile; COL.despN = (COL.despN + vel * 1.15) % COL.tile2;
    COL.suelo.position.z = COL.despS; COL.mar.position.z = COL.despN;
    for (const c of COL.nubes){ c.position.z += vel; if (c.position.z > 90) colNubeSitio(c, false); }
    for (const p of COL.picos){ p.position.z += vel * 0.9; if (p.position.z > 140) p.position.z -= 500; }
    for (const m of COL.vetas){ m.position.z += m.userData.v * run * (1 + 0.6 * COL.picado); if (m.position.z > hero.position.z + 16) colVeta(m, false); }
    for (const m of COL.chispas){ if (!m.visible) continue; const u = m.userData; u.t -= run; if (u.t <= 0){ m.visible = false; continue; }
      u.v.y -= 9 * run; u.v.z += 12 * run; m.position.addScaledVector(u.v, run); m.rotation.x += run * 6; m.rotation.y += run * 4; } }
  // sellos y perla, pegados al lomo
  for (const s of [...COL.sellos, COL.perla]) if (s && s.alive){
    s.g.position.set(colC(s.colZ), 0, s.colZ); s.vx = s.vz = 0; s.cr.rotation.y += run * 1.4; s.ring.rotation.z += run * 2;
    s.mats[0].em = 0.45 + 0.4 * Math.abs(Math.sin(COL.tt * 3 + s.colZ)); s.pilar.visible = Math.hypot(hero.position.x - s.g.position.x, hero.position.z - s.colZ) > 5.5;
    s.llamas.forEach((c, k) => { c.scale.y = 1 + 0.4 * Math.sin(COL.tt * 9 + k * 2); c.position.y = 1.25 + 0.15 * Math.sin(COL.tt * 5 + k); });
    s.body.position.y = 0.05 * Math.sin(COL.tt * 2.5 + s.colZ); }
  for (const f of fballs) if (f.col){ f.to.x = colC(f.circle.userData.z) + f.circle.userData.u; f.circle.position.x = f.to.x; }
  // viento: líneas de velocidad y sonido
  const vk = Math.min(1, 0.2 + 0.25 * COL.picado + (COL.rafaga > 2 ? 0.4 : 0) + Math.abs(COL.banco) * 0.5);
  colVientoEl.style.setProperty('--k', vk.toFixed(2)); colVientoEl.style.setProperty('--r', ((COL.tt * 97) % 6).toFixed(1) + 'deg');
  if (COL.son && actx){ const t = actx.currentTime; COL.son.g.gain.setTargetAtTime(sfxOn && gameState !== 'paused' ? 0.05 + 0.16 * vk : 0, t, 0.15); COL.son.bp.frequency.setTargetAtTime(450 + 900 * vk + 160 * Math.sin(COL.tt * 0.7), t, 0.2); }
  if (!jugando){ colAgarreEl.hidden = true; return; }
  // --- jugando sobre el lomo ---
  clearT = 0; colBarra();
  if (COL.fase === 'caida'){ colCaeTick(pdt); return; }
  if (COL.fase === 'final' && !COL.perla && COL.picado > 0.6){ COL.perla = colSello(COL_ZPERLA, true); barkT = 0; bark('¡Ahí, entre los cuernos! ¡La perla!'); }
  COL.zMin = lerp(COL_ZMIN, COL_ZMIN_FIN, COL.picado);
  if (COL.pendFinal > 0 && (COL.pendFinal -= pdt) <= 0){ COL.fase = 'final'; COL.atq = null; COL.atqCd = 3.5; COL.primero = 'rafaga'; play('dragonRoar'); play('colRafaga'); shake = Math.max(shake, 0.8);
    banner('¡En picado!<small>Llega hasta la perla de la cabeza</small>', 2.2); }
  colAtaqueTick(pdt);
  // agarre
  const peligro = colPeligro(), held = keys.KeyK || keys.ShiftLeft || keys.ShiftRight || colTocaRodar || colPadRodar();
  if (COL.sinFuerza > 0) COL.sinFuerza -= pdt;
  const agarra = peligro && held && grounded && state !== 'roll' && COL.aguante > 0 && COL.sinFuerza <= 0 && !player.dead;
  const c1 = colC(hero.position.z);
  if (agarra && !COL.agarra){ COL.uLock = hero.position.x - c1; COL.zLock = hero.position.z; play('colAgarre'); state = state === 'charge' ? 'normal' : state; }
  COL.agarra = agarra;
  if (agarra){ COL.aguante = Math.max(0, COL.aguante - pdt * 0.21);
    if (COL.aguante <= 0){ COL.agarra = false; COL.sinFuerza = 1.4; barkT = 0; bark('¡Se te escurren las manos!'); COL.vu = Math.sign(COL.banco || 1) * 1.2; } }
  else COL.aguante = Math.min(1, COL.aguante + pdt * (peligro ? 0.05 : 0.4));
  colAvisoEl.classList.toggle('ok', COL.agarra);
  // posición sobre el lomo: deslizarse con el alabeo, viento de cara, bordes
  let z = hero.position.z, u = hero.position.x - c1;
  if (COL.agarra){ u = COL.uLock; z = COL.zLock; COL.vu = 0; }
  else {
    if (grounded && Math.abs(COL.banco) > 0.04) COL.vu += Math.sin(COL.banco) * 14 * pdt;
    COL.vu *= Math.exp(-pdt * 1.2); u += COL.vu * pdt; z += COL.rafaga * pdt;
  }
  z = clamp(z, COL.zMin, COL_ZMAX); const hw = colHW(z);
  if (Math.abs(u) > hw){
    if (!COL.agarra && Math.abs(COL.vu) > 1.6 && Math.sign(COL.vu) === Math.sign(u)){ hero.position.x = colC(z) + u; hero.position.z = z; colCae(u); return; }
    u = Math.sign(u) * hw; if (Math.sign(COL.vu) === Math.sign(u)) COL.vu = 0;
  }
  hero.position.x = colC(z) + u; hero.position.z = z;
  if (hero.position.y < 0.9) for (const s of [...COL.sellos, COL.perla]) if (s && s.alive){ const dx = hero.position.x - s.g.position.x, dz = hero.position.z - s.colZ, d = Math.hypot(dx, dz);
    if (d < 1.05 && d > 0.001){ hero.position.x = s.g.position.x + dx / d * 1.05; hero.position.z = s.colZ + dz / d * 1.05; } }
  // aro de aguante sobre Tovan
  if (COL.agarra || COL.aguante < 0.999){
    const p = colV[0].set(hero.position.x, hero.position.y + 2.3, hero.position.z).project(camera);
    colAgarreEl.hidden = p.z > 1; colAgarreEl.style.transform = `translate(${((p.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px,${((-p.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px)`;
    colAgarreEl.style.setProperty('--k', COL.aguante.toFixed(3)); colAgarreEl.classList.toggle('bajo', COL.aguante < 0.3);
  } else colAgarreEl.hidden = true;
}

/* ---------- Cámara y pose ---------- */
function colCamara(cam){
  if (!COL.montado || cs.active || lcut) return;
  cam.position.sub(camTarget).multiplyScalar(1.28).add(camTarget); cam.lookAt(camTarget);
  const j = 0.025 + 0.05 * COL.picado + (COL.rafaga > 2 ? 0.05 : 0) + COL.temblor * 0.5;
  cam.position.x += Math.sin(time * 37.1) * j; cam.position.y += Math.sin(time * 41.7 + 1) * j;
  cam.rotateZ(-COL.banco * 0.3);
}
function colPose(){
  if (!COL.montado) return;
  const w = 0.6 + 0.4 * COL.picado + (COL.rafaga > 2 ? 0.4 : 0);   // el viento tira de la bufanda y del pelo
  P.scarf.forEach((g, i) => { g.rotation.x += 0.7 * w + Math.sin(time * 18 - i) * 0.12; g.rotation.z += Math.sin(time * 11 + i) * 0.15; });
  P.tailHair.forEach((g, i) => { g.rotation.x += 0.5 * w + Math.sin(time * 16 - i) * 0.1; });
  P.ahoge.rotation.x += 0.3 * w;
  bl(P.spine.rotation, 'z', COL.fase === 'caida' ? 0 : -COL.banco * 0.6, 1);   // se echa contra el alabeo
  if (COL.agarra){   // agachado y agarrado a la crin
    bl(P.spine.rotation, 'x', 0.75, 1); bl(P.neck.rotation, 'x', -0.4, 1);
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -1.1, 1); bl(A.sh.rotation, 'z', -0.25 * s, 1); bl(A.el.rotation, 'x', -0.5, 1); }
    for (const L of [P.legL, P.legR]){ bl(L.hip.rotation, 'x', -1.0, 1); bl(L.knee.rotation, 'x', 1.6, 1); }
  }
  if (COL.fase === 'caida') for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', 2.4 * s, 1); bl(A.el.rotation, 'x', -0.2 + Math.sin(time * 20) * 0.4, 1); }
}

/* ---------- La segunda vida empieza: atropello y crecimiento ---------- */
function colPuede(e){ return e.type === 'dragon' && e.alive && !e.colHecho && !e.colFase && !special && !chActive && !invActive && !cs.active && gameState === 'play' && !player.dead; }
function colEmpieza(e){
  Object.assign(COL, { on: true, fase: 'cine', e, tt: 0, giro: 0, giroObj: 0, picado: 0, banco: 0, bancoObj: 0, cabeceo: 0, boca: 0.12, temblor: 0, atq: null, rotas: 0, sellos: [], perla: null,
    aguante: 1, agarra: false, sinFuerza: 0, vu: 0, zMin: COL_ZMIN, rafaga: 0, rafagaObj: 0, cae: null, pendFinal: 0, dijoAgarre: false });
  e.colFase = true; e.alive = false; e.hp = 0; e.flash = 0; e.burnT = e.chillT = e.frozenT = e.shockT = 0; e.chill = 0;
  hideTeles(e); if (e.x5 && e.x5.end) e.x5.end(); e.x5 = null; sweepHazards();
  for (const p of projectiles) scene.remove(p.m); projectiles.length = 0;
  clearT = 0; bossBox.hidden = true; barkSaid.half_escama = barkSaid.half_perla = true;
  colCineAtropello();   // (primero: con gameState = 'play', la última baja de la oleada lanzaría su grito de victoria)
  queue.length = 0;
  for (const o of enemies) if (o.alive && o !== e){ killEnemy(o); o.dying = 0; o.remove = true; scene.remove(o.g); if (o.tele) scene.remove(o.tele); if (o.parts) o.parts.forEach(q => scene.remove(q)); }   // las crías y los rezagados caen con el rugido
}
function colCineAtropello(){
  const e = COL.e, H = e.head.position, hp = hero.position;
  const dx0 = H.x - hp.x, dz0 = H.z - hp.z, d0 = Math.hypot(dx0, dz0) || 1, ux = dx0 / d0, uz = dz0 / d0;   // de Tovan hacia el dragón
  const alto = new V3(hp.x + ux * 7, 5.5, hp.z + uz * 7), frente = new V3(hp.x + ux * 8.5, 1.5, hp.z + uz * 8.5), meta_ = new V3();
  let fase = 'sube', glow = 0, caeV = 0, tocado = false;
  if (state === 'tech') cancelTech(); state = 'normal'; attackW = 0; staffToBack(); heading = Math.atan2(ux, uz); hero.rotation.y = heading; grounded = true; vy = 0;
  runCine(async () => {
    cs.tick = dt => {
      glow += dt;
      if (fase !== 'cielo'){
        e.mats[0].m.uniforms.uEmissive.value = 0.15 + 0.35 * Math.abs(Math.sin(glow * 6));
        if (fase === 'sube'){ dSteer(e, alto.x, alto.y, alto.z, 7, 3, dt); e.lockLook = false; e.jaw.rotation.x = 0.25; }
        else if (fase === 'mira'){ dSteer(e, frente.x, frente.y, frente.z, 6, 3, dt); meta_.set(hp.x, 1, hp.z); e.head.lookAt(meta_); e.lockLook = true; e.jaw.rotation.x = 0.75; }
        else if (fase === 'carga'){ e.lockLook = false; meta_.set(hp.x - ux * 6, 1.1, hp.z - uz * 6); dSteer(e, meta_.x, meta_.y, meta_.z, 18, 9, dt); e.jaw.rotation.x = 0.5; }
        dragonBody(e);
        if (rnd() < 0.6){ const s = e.segs[rnd() * e.segs.length | 0]; spawnFx(s.position.x, s.position.y, s.position.z, 0, 1, 0, 0x9fffe0, 0.1, 0.6, -1, 1); }
      } else if (!tocado){
        caeV += 20 * dt; hp.y = Math.max(0, hp.y - caeV * dt); hp.x = colC(hp.z); grounded = true; vy = 0; P.body.rotation.x += dt * 7;
        if (hp.y <= 0){ tocado = true; P.body.rotation.x = 0; landT = 0.18; puff(8); play('land'); shake = Math.max(shake, 0.5); ringFx(hp.x, hp.z, 0xffffff, 0.3, 2.2, 0.4); }
      } else hp.x = colC(hp.z);
    };
    // 1. No se cae: brilla y se alza
    csShot(cam => { cam.position.set(hp.x - ux * 3.6 + uz * 2.4, 0.7, hp.z - uz * 3.6 - ux * 2.4); cam.lookAt(H.x, H.y, H.z); });
    play('dragonRoar'); shake = 0.4; flash('#bff7e0', 0.35); csCaption('Lumen: ¿Ya está? …¿Por qué brilla?');
    await csWait(1.6);
    // 2. Mira a Tovan
    fase = 'mira'; play('dragonRoar'); shake = 0.6;
    csShot(cam => { cam.position.set(hp.x + ux * 2 + uz * 3.2, 1.1, hp.z + uz * 2 - ux * 3.2); cam.lookAt(H.x, H.y, H.z); });
    await csWait(1.3);
    // 3. ¡Bocina! Carga como Camión-kun
    fase = 'carga'; play('truckHorn'); csCaption('Tovan: ¿Eso es… una bocina?');
    csShot(cam => { cam.position.set(hp.x - ux * 3.4 - uz * 0.9, 1.2, hp.z - uz * 3.4 + ux * 0.9); cam.lookAt(hp.x + ux * 4, 1.5, hp.z + uz * 4); });
    { const t0 = cs.t; while (cs.t - t0 < 1.6 && Math.hypot(H.x - hp.x, H.z - hp.z) > 1.6) await csWait(0.02); }
    // ¡Atropello!
    play('boom'); play('hurt'); shake = 1.2; cineEls.white.style.opacity = '1'; csShout('¡¿OTRA VEZ?!'); csCaption('');
    await csWait(0.5);
    // 4. Arriba, entre las nubes: ahora es enorme
    colMonta(); fase = 'cielo'; e.mats[0].m.uniforms.uEmissive.value = 0;
    hp.set(colC(6), 9, 6); heading = Math.PI; hero.rotation.y = heading; COL.boca = 0.2;
    csShot((cam, t) => { const k = smooth(clamp(t / 2.8, 0, 1)); cam.position.set(colC(4) + 15 - k * 3, 4 + k * 2, 14 - k * 6); cam.lookAt(colC(0), 0.5 + k * 1.5, -6); });
    await csTween(0.6, k => { cineEls.white.style.opacity = String(1 - k); });
    play('dragonRoar'); COL.boca = 1; COL.temblor = 0.3; shake = 0.6; showBossCard('ryucol');
    await csWait(2.2);
    // 5. Detrás de Tovan, hacia la cabeza
    const x = hp.x, z = hp.z;
    csShot(dollyShot([x, 3.4, z + 8], [x, 2.7, z + 6.2], [x, 1.4, z - 6], [x, 2.2, z - 12], 2.4));
    hideBossCard(); csCaption('Lumen: Te ha atropellado un dragón. Y ahora es del tamaño de una mudanza.');
    await csWait(2.6);
    csCaption('');
  }, () => { csCaption(''); hideBossCard(); if (COL.on) colEmpiezaLomo(); });
}
function colEmpiezaLomo(){
  const e = COL.e; colMonta();
  if (e.parts) e.parts.forEach(p => { p.visible = false; }); e.mats[0].m.uniforms.uEmissive.value = 0; cineEls.white.style.opacity = '0';
  hero.position.set(colC(6), 0, 6); grounded = true; vy = 0; P.body.rotation.x = 0; state = 'normal'; heading = Math.PI; hero.rotation.y = heading; camYaw = 0; player.inv = Math.max(player.inv, 1);
  if (COL.pitch0 == null){ COL.pitch0 = camPitch; camPitch = Math.min(camPitch, 0.24); }
  COL.fase = 'lomo'; COL.atq = null; COL.atqCd = 5.5; COL.primero = 'sacude';
  COL.sellos = COL_SELLOS.map(z => colSello(z, false)); COL.perla = null;
  bossE = { type: 'ryucol', alive: true, hp: 1, maxHp: 1, g: COL.cab, isBoss: true, spawnT: 0 }; bossBox.hidden = false; colBarra();
  barkT = 0; bark('¡Las escamas que brillan son sus sellos! ¡Rómpelos!'); clearT = 0;
}

/* ---------- Remate: la perla, el dragón se deshace en jade y Tovan cae al santuario ---------- */
function colRemate(){
  COL.fase = 'remate'; COL.atq = null; colQuitaAtaques(); bossE = null; bossBox.hidden = true;
  for (let i = fballs.length - 1; i >= 0; i--) if (fballs[i].col){ scene.remove(fballs[i].m); fballs[i].circle.visible = false; fballs.splice(i, 1); }
  colCineRemate();
}
function colDeshace(i){   // 0 = la cabeza; luego el cuerpo, de delante atrás
  const o = i === 0 ? COL.cab : COL.segs[i - 1]; if (!o || !o.visible) return;
  o.visible = false; const p = o.position, n = i === 0 ? 30 : 6;
  for (let k = 0; k < n; k++){ const a = COL.r() * TAU, s = (i === 0 ? 6 : 3) * (0.4 + COL.r()); colChispa(p.x + Math.cos(a) * 1.5, p.y + (COL.r() - 0.3) * 2, p.z + Math.sin(a) * 1.5, Math.cos(a) * s, 2 + COL.r() * 5, Math.sin(a) * s); }
  lightFlash(p.x, Math.max(0.5, p.y), p.z, 0x9fffe0, 1.6, 10); if (i % 4 === 0) play('boom');
}
function colCineRemate(){
  const hp = hero.position; let rompe = -1, rT = 0, cae = false, caeV = 0;
  state = 'normal'; attackW = 0; staffToBack();
  runCine(async () => {
    // 1. ¡Entregado!
    csShout('¡ENTREGADO!'); play('specialBoom'); flash('#ffffff', 0.8); shake = 1; COL.boca = 1;
    const x0 = hp.x, z0 = hp.z;
    csShot((cam, t) => { const a = 0.9 + t * 0.25; cam.position.set(x0 + Math.sin(a) * 4.2, 1.6 + t * 0.4, z0 + Math.cos(a) * 4.2); cam.lookAt(x0, 1.1, z0 - 1); });
    await csWait(1.2);
    // 2. Se deshace en luz de jade, de la cabeza a la cola, y Tovan cae
    rompe = 0; play('dragonRoar');
    cs.tick = dt => { rT += dt;
      while (rompe >= 0 && rompe <= COL.segs.length && rT > rompe * 0.07){ colDeshace(rompe); rompe++; }
      if (rompe > 6) cae = true;
      if (cae){ caeV += 7 * dt; hp.y -= caeV * dt; P.body.rotation.x += dt * 2.5; grounded = true; vy = 0; blob.visible = false; } };
    csShot((cam, t) => { cam.position.set(x0 + 16, 2.5 - t * 2.2, z0 + 11); cam.lookAt(x0 - 2, -0.5 - t * 2.4, z0 - 7); });
    await csWait(3.3);
    // 3. Vuelta al santuario
    await csTween(0.4, k => { cineEls.white.style.opacity = String(k); });
    cs.tick = null; colLimpiaLomo(); colDesmonta();
    hp.set(0, 13, 0.5); P.body.rotation.x = 0; heading = Math.atan2(2.6, 3.9); hero.rotation.y = heading; let v = 0, toca = false;
    cs.tick = dt => { if (toca) return; v += 24 * dt; hp.y = Math.max(0, hp.y - v * dt); grounded = true; vy = 0;
      if (hp.y <= 0){ toca = true; landT = 0.18; shake = 0.9; play('boom'); play('land'); ringFx(hp.x, hp.z, 0xd8c8a8, 0.3, 3.2, 0.45); puffAt(hp.x, hp.z, 14, 2.2); } };
    csShot((cam, t) => { cam.position.set(2.6, 0.6 + t * 0.3, 4.4); cam.lookAt(0, 1.0 + Math.max(0, 1.2 - t) * 2.2, 0.5); });
    await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
    await csWait(1.1);
    csCaption('Tovan: ¿Me ha atropellado un dragón… y he ganado yo?'); await csWait(2.3);
    csCaption('Lumen: Primera vez que el camión pierde.'); await csWait(2.0);
    csCaption('');
  }, () => { csCaption(''); colTermina(); });
}
function colTermina(){
  const e = COL.e;
  colLimpiaLomo(); colDesmonta(); COL.on = false; COL.fase = null; COL.cae = null; COL.e = null;
  if (Math.hypot(hero.position.x, hero.position.z) > ARENA - 0.5 || hero.position.y !== 0) hero.position.set(0, 0, 0.5);
  grounded = true; vy = 0; P.body.rotation.x = 0; blob.visible = true; cineEls.white.style.opacity = '0';
  if (e){ e.alive = true; e.colHecho = true; e.hp = 0; e.g.position.set(hero.position.x + 1.2, 0, hero.position.z - 1.4); killEnemy(e); }
  clearT = -1;
}

/* ---------- Ganchos ---------- */
const _killEnemyCol = killEnemy;
killEnemy = function(e){
  if (e.colEscama){ colRompe(e); return; }
  if (e.type === 'dragon' && e.colFase && !e.colHecho) return;   // ya está en su segunda vida
  if (e.type === 'dragon' && colPuede(e)){ colEmpieza(e); return; }
  _killEnemyCol(e);
};
const _doRollCol = doRoll; doRoll = function(){ if (COL.on && gameState === 'play' && (colPeligro() || COL.fase === 'caida')) return; _doRollCol(); };
const _doAttackCol = doAttack; doAttack = function(){ if (COL.on && (COL.agarra || COL.fase === 'caida')) return; _doAttackCol(); };
const _doJumpCol = doJump; doJump = function(){ if (COL.on && (COL.agarra || COL.fase === 'caida')) return; _doJumpCol(); };
const _doSpecialCol = doSpecial; doSpecial = function(){ if (COL.on && (COL.agarra || COL.fase === 'caida')) return; _doSpecialCol(); };
const _v3UpdateCol = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateCol(dt, pdt, playing); try { colTick(dt, pdt, playing); } catch (err) { console.error(err); } };
const _csCameraCol = csCamera; csCamera = function(cam){ _csCameraCol(cam); try { colCamara(cam); } catch (err) { console.error(err); } };
const _legendPoseCol = legendPose; legendPose = function(){ _legendPoseCol(); try { colPose(); } catch (err) { console.error(err); } };
const _clearWorldCol = clearWorld; clearWorld = function(){ colAborta(); _clearWorldCol(); };
const _toTitleCol = toTitle; toTitle = function(){ colAborta(); _toTitleCol(); };

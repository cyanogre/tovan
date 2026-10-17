'use strict';
/* ======================================================================
   RYŪJIN COLOSAL · la segunda vida del dragón de jade
   Al dejar a Ryūjin a cero no muere: atropella a Tovan (Camión-kun se
   ha hecho escuela), crece hasta el tamaño de una mudanza y sale volando
   con él encima. Sobre el lomo hay que romper tres sellos de jade
   aguantando sacudidas (mantener RODAR para agarrarse), púas, lluvia de
   fuego y maniobras: sacudidas violentas, subidas en vertical y
   tirabuzones boca abajo. Sin agarrarse en plena maniobra te tira por un
   costado y caes por el cielo: te impulsas (RODAR), te agarras a una cría
   y, montado en ella, saltas de vuelta al lomo, mientras el dragón se
   aparta para no dejarte subir. Luego se lanza en picado y hay que
   llegar, con viento de cara, hasta la perla de la cabeza. Al romperla sigue el flujo de siempre:
   «¡Ryūjin derrotado!», win_dragon, el trozo de la hoja de ruta y las cartas.
   - El lomo es una pasarela plana a y = 0 (saltos y golpes funcionan igual):
     el dragón ondula de lado y arrastra a Tovan; el que se inclina es el mundo.
     La gravedad se calcula vista desde el dragón: de lado te escurres, en
     vertical resbalas hacia la cola y boca abajo te suelta.
   - Los sellos y la perla son enemigos (isBoss, sin frenesí) para que les
     den todos los ataques; el envoltorio de killEnemy los rompe a su manera.
   - Todo se construye la primera vez que hace falta y con su propio PRNG:
     nada de rnd() al cargar.
   ====================================================================== */
const COL_Z0 = -30, COL_N = 40, COL_SP = 1.8, COL_ZMAX = 21.5, COL_ZMIN = -15.5, COL_ZMIN_FIN = -26.4, COL_SELLOS = [14.5, 1, -11.5], COL_ZPERLA = -25.2;
const COL = { on: false, montado: false, built: false, fase: null, e: null, tt: 0, giro: 0, giroObj: 0, giroS: 1, picado: 0, banco: 0, bancoObj: 0, cabeceo: 0, boca: 0.12, temblor: 0,
  atq: null, atqCd: 0, primero: null, ultimo: '', rotas: 0, sellos: [], perla: null, aguante: 1, agarra: false, sinFuerza: 0, vu: 0, uLock: 0, zLock: 0, zMin: COL_ZMIN,
  rafaga: 0, rafagaObj: 0, cabObj: 0, vz: 0, aire: null, pendFinal: 0, prev: null, son: null, despS: 0, despN: 0, crias: [], suelto: 0, lejos: 0, yaw0: 0, yawT: 0,
  esq: { x: 0, v: 0, obj: 0, z: 0, cd: 0, n: 0, i: 0, acc: 0, h: null } };
BOSS_CARDS.ryucol = ['RYŪJIN · SEGUNDA VIDA', 'Dragón de jade · Ahora en tamaño mudanza', '#7fe8c8'];

/* ---------- Forma: radio, ondulación y altura del lomo a lo largo de z ---------- */
const colR = z => z < -16 ? lerp(2.15, 2.8, smooth(clamp((z + 30) / 14, 0, 1))) : z <= 22 ? 2.8 + 0.3 * Math.sin((z + 16) / 38 * Math.PI) : lerp(2.7, 0.32, Math.pow(clamp((z - 22) / 18.5, 0, 1), 0.85));
const colHW = z => Math.max(0.6, colR(z) * 0.55);   // media anchura de la pasarela
function colC(z){   // desplazamiento lateral del espinazo: ondula como una serpiente y la cola latiguea (el giro del cuello va en colCuello)
  let x = Math.sin(z * 0.15 - COL.tt * 0.85) * (0.6 + 0.025 * Math.max(0, z - 6));
  if (z > 22) x += Math.sin(z * 0.33 - COL.tt * 2.4) * (z - 22) * 0.13;
  return x + colEsqX(z);
}
// Esquiva (con Tovan montado en una cría, el dragón se aparta): COL.esq.x es lo que se ha apartado y llega al resto
// del cuerpo como una ola desde donde estaba la cría (COL.esq.z), a COL_ESQ_V m/s: la cabeza y la cola tardan en seguirla.
const COL_ESQ_HZ = 30, COL_ESQ_N = 120, COL_ESQ_V = 24, COL_ESQ_MAX = 3;
COL.esq.h = new Float32Array(COL_ESQ_N);
function colEsqX(z){
  const E = COL.esq, d = Math.min(COL_ESQ_N - 2, Math.abs(z - E.z) / COL_ESQ_V * COL_ESQ_HZ), k = Math.floor(d), f = d - k;
  const at = j => j === 0 ? E.x : E.h[(E.i - j + 1 + COL_ESQ_N) % COL_ESQ_N];
  return at(k) + (at(k + 1) - at(k)) * f;
}
function colEsqTick(dt){
  const E = COL.esq; if (dt <= 0) return;
  if (COL.fase !== 'aire') E.obj *= Math.exp(-dt * 0.25);   // de vuelta a su sitio, sin prisa (el lomo arrastra a Tovan)
  E.cd = Math.max(0, E.cd - dt);
  const w = 3.1; E.v += ((E.obj - E.x) * w * w - 2 * w * E.v) * dt; E.x += E.v * dt;
  E.acc += dt; while (E.acc >= 1 / COL_ESQ_HZ){ E.acc -= 1 / COL_ESQ_HZ; E.i = (E.i + 1) % COL_ESQ_N; E.h[E.i] = E.x; }
}
function colEsqReset(){ const E = COL.esq; E.x = E.v = E.obj = E.z = E.cd = E.n = E.acc = 0; E.h.fill(0); }
function colTop(z){   // altura de la cara de arriba (0 en la pasarela; el cuello sube hasta la cabeza y la cola cae)
  let y = 0;
  if (z < -15){ const t = clamp((-15 - z) / 15, 0, 1); y += 6 * (1 - COL.picado) * smooth(t) + COL.giro * 1.5 * (Math.sin(Math.PI * t) + t * t); }   // girado: el cuello hace arco y la cabeza se alza un poco
  if (z > 22){ const k = clamp((z - 22) / 18.5, 0, 1); y += -4.5 * k * k + Math.sin(z * 0.3 - COL.tt * 1.7) * 1.6 * k; }
  return y;
}
// Cuello al girarse para atacar: se estira (×1,5), avanza recto y al final hace un gancho hacia un lado, así la
// cabeza vuelve mirando a Tovan (por delante de él, donde se ve también en el móvil) en vez de darse la vuelta encima
// de su propio cuello. Primero se dobla la punta (la cabeza manda) y luego el resto.
const COL_CUELLO = 9, COL_ESTIRA = 0.5, COL_CURVA = 0.92 * Math.PI, COL_RECTO = 0.38;
function colCuello(){
  const S = COL.segs, g = smooth(Math.min(1, COL.giro)), L = 1 + COL_ESTIRA * g, p = 1.6 - 0.6 * g;
  let X = 0, Z = 0, d0 = 0;
  for (let i = COL_CUELLO - 1; i >= 0; i--){
    const sg = S[i], d = -15 - sg.userData.z; sg.scale.z = L * (1 + 0.15 * g);   // (algo más largos: en el gancho no se abren huecos)
    if (g < 0.001) continue;
    const h = (d - d0) / 4;   // rumbo integrado a lo largo del cuello (de la base a la cabeza)
    for (let k = 0; k < 4; k++){ const a = COL_CURVA * g * Math.pow(smooth(clamp(((d0 + (k + 0.5) * h) / 15 - COL_RECTO) / (1 - COL_RECTO), 0, 1)), p); X += Math.sin(a) * h * L; Z += Math.cos(a) * h * L; }
    d0 = d; sg.position.x += COL.giroS * X; sg.position.z += d - Z;
  }
}
const COL_AGARRE = new Set(['sacude', 'rafaga', 'violenta', 'vertical', 'tirabuzon']);   // los ataques en los que hay que agarrarse
const COL_SUELTA = { sacude: 0.45, violenta: 0.3, rafaga: 0.6, vertical: 0.45, tirabuzon: 0.35 };   // segundos sin agarrarse (a toda fuerza) hasta que te tira
const colPeligro = () => !!COL.atq && COL_AGARRE.has(COL.atq.tipo);
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
function colAviso(txt, sub, agarre = true){
  if (!txt || !agarre) colAvisoEl.classList.remove('mal');
  if (!txt || !agarre){ if (colBtnRodar && colBtnRodar.dataset.col){ colBtnRodar.textContent = colBtnRodar.dataset.col; delete colBtnRodar.dataset.col; colBtnRodar.classList.remove('tutoOjo'); } }
  if (txt && !agarre){ colAvisoEl.querySelector('b').textContent = txt; colAvisoEl.querySelector('small').textContent = sub || ''; colAvisoEl.hidden = false; return; }
  if (!txt){ colAvisoEl.hidden = true; if (colBtnRodar && colBtnRodar.dataset.col){ colBtnRodar.textContent = colBtnRodar.dataset.col; delete colBtnRodar.dataset.col; colBtnRodar.classList.remove('tutoOjo'); } return; }
  colAvisoEl.querySelector('b').textContent = txt; colAvisoEl.querySelector('small').textContent = sub || (colTactil() ? 'Mantén pulsado AGARRA' : 'Mantén K o Shift'); colAvisoEl.hidden = false;
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
  const pMat = makeMat(0xffa040, { emissive: 0.75 }), pG = new THREE.ConeGeometry(0.26, 1.6, 5);
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
  COL.dr.visible = COL.env.visible = COL.vg.visible = false; sky.rotation.set(0, 0, 0); blob.visible = true; P.spine.rotation.z = 0; COL.aire = null; colCriasFuera(true);
  for (const c of COL.circulos) c.visible = false; for (const p of COL.puas) p.g.visible = false; for (const c of COL.chispas) c.visible = false;
  camera.zoom = 1; camera.updateProjectionMatrix(); if (COL.pitch0 != null){ camPitch = COL.pitch0; COL.pitch0 = null; }
  document.body.classList.remove('colVuela'); colVientoEl.hidden = true; colAgarreEl.hidden = true; colAviso(null); colVientoSon(false);
}
function colQuitaAtaques(){
  if (COL.atq && COL.atq.chorro){ COL.atq.chorro.forEach(tintaSuelta); COL.atq.chorro = null; } if (COL.alTele) COL.alTele.visible = false;
  COL.bancoObj = 0; COL.giroObj = 0; COL.rafagaObj = 0; COL.cabObj = 0; COL.boca = 0.12; COL.agarra = false;
  if (COL.puas) for (const p of COL.puas) p.g.visible = false;
  colAviso(null);
}
function colFuegoFuera(){
  for (const M of COL.meteoros){ scene.remove(M.spr); tintaSuelta(M.cola); tintaSuelta(M.nucleo); M.Ci.visible = false; } COL.meteoros.length = 0;
  for (const Q of COL.quemas) scene.remove(Q.m); COL.quemas.length = 0;
  if (COL.atq && COL.atq.chorro){ COL.atq.chorro.forEach(tintaSuelta); COL.atq.chorro = null; } if (COL.alTele) COL.alTele.visible = false;
}
function colLimpiaLomo(){
  for (const s of [...COL.sellos, COL.perla]) if (s){ s.alive = false; s.remove = true; scene.remove(s.g); }
  COL.sellos = []; COL.perla = null; COL.atq = null; colQuitaAtaques();
  colFuegoFuera();
}
function colAborta(){   // salir a medias (morir y reintentar, volver al título…)
  if (!COL.on && !COL.montado) return;
  colLimpiaLomo(); colDesmonta(); COL.on = false; COL.fase = null; COL.aire = null; COL.e = null;
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
  else { COL.atqCd = 1.4; COL.primero = COL.rotas === 1 ? 'vertical' : 'tirabuzon'; }   // le duele: contesta enseguida con una maniobra nueva
}

/* ---------- Ataques sobre el lomo ---------- */
const colEspera = () => Math.max(1.8, 3.8 - 0.55 * COL.rotas) + rnd() * 1.4;
function colFinAtq(){ COL.atq = null; COL.atqCd = colEspera(); colAviso(null); }
function colElige(){
  let t = COL.primero; COL.primero = null;
  if (!t){ const ops = (COL.fase === 'final' ? ['rafaga', 'puas', 'violenta'] : ['puas', 'fuego', 'aliento', COL.rotas ? 'violenta' : 'sacude', ...(COL.rotas >= 1 ? ['vertical'] : []), ...(COL.rotas >= 2 ? ['tirabuzon'] : [])])
    .filter(o => o !== COL.ultimo); t = ops[Math.floor(rnd() * ops.length)]; }
  COL.ultimo = t; const A = COL.atq = { tipo: t, t: 0, n: 0, s: rnd() < 0.5 ? -1 : 1 };
  if (t === 'sacude'){ play('dragonRoar'); COL.boca = 0.7; COL.temblor = 0.15; colAviso('¡AGÁRRATE!');
    if (!COL.dijoAgarre){ COL.dijoAgarre = true; barkT = 0; bark(colTactil() ? '¡Se va a sacudir! ¡Mantén pulsado AGARRA (el botón de rodar)!' : '¡Se va a sacudir! ¡Mantén K o Shift para agarrarte!'); } }
  else if (t === 'rafaga'){ play('colRafaga'); colAviso('¡RÁFAGA!'); barkOnce('colRafaga', '¡Viento de cara! Agárrate en las ráfagas o te manda a la cola.'); }
  else if (t === 'violenta'){ play('dragonRoar'); COL.boca = 0.9; COL.temblor = 0.3; colAviso('¡AGÁRRATE FUERTE!'); barkOnce('colViolenta', '¡Esta vez se sacude con todo! Si no te agarras, te tira por los aires.'); }
  else if (t === 'vertical'){ play('dragonRoar'); COL.boca = 0.7; colAviso('¡SUBE EN VERTICAL!'); barkOnce('colVertical', '¡Se pone en vertical! Agárrate o resbalas hasta la cola… y fuera.'); }
  else if (t === 'tirabuzon'){ play('dragonRoar'); COL.boca = 0.7; colAviso('¡SE DA LA VUELTA!'); barkOnce('colTirabuzon', '¡Se va a poner boca abajo! Agárrate o sales volando.'); }
  else if (t === 'puas'){
    const z0 = clamp(hero.position.z + (rnd() - 0.5) * 1.5, COL.zMin + 1.2, COL_ZMAX - 1.2), zs = [z0];
    if (rnd() < 0.55) zs.push(clamp(z0 + (rnd() < 0.5 ? -1 : 1) * 4.2, COL.zMin + 1.2, COL_ZMAX - 1.2));
    A.bandas = zs.length; zs.forEach((z, i) => { const P_ = COL.puas[i]; P_.z = z; P_.hit = false; P_.g.visible = true; P_.g.position.set(colC(z), 0, z); P_.tele.visible = false; });
    play('bruteWarn'); barkOnce('colPuas', '¡Púas! Salta o apártate de la franja roja.'); }
  else if (t === 'fuego'){ COL.giroS = hero.position.x - colC(hero.position.z) >= 0 ? 1 : -1; COL.giroObj = 1; barkOnce('colFuego', '¡Se da la vuelta para escupirte! ¡Fuera de los círculos!'); }
  else if (t === 'aliento'){ A.lado = rnd() < 0.5 ? -1 : 1; COL.giroS = A.lado; COL.giroObj = 1; A.zb = clamp(hero.position.z + (rnd() - 0.5) * 1.2, COL.zMin + 1.8, COL_ZMAX - 1.8);
    barkOnce('colAliento', '¡Va a barrer el lomo con fuego! ¡Sal de la franja roja!'); }
}
function colEscupe(primero){
  const Ci = COL.circulos.find(c => !c.visible); if (!Ci) return;
  let z = hero.position.z, u = hero.position.x - colC(z);
  if (!primero){ z += (rnd() - 0.5) * 5; u += (rnd() - 0.5) * 2.4; }
  z = clamp(z, COL.zMin + 0.5, COL_ZMAX - 0.5); const hw = colHW(z); u = clamp(u, -hw, hw);
  Ci.position.set(colC(z) + u, 0.05, z); Ci.scale.setScalar(1.4); Ci.visible = true; Ci.userData.z = z; Ci.userData.u = u;
  COL.cab.updateMatrixWorld(true); const from = new V3(0, -0.1, 1.4).applyMatrix4(COL.cab.matrixWorld);
  colMeteoro(from, Ci);
  play('fireball'); lightFlash(from.x, from.y, from.z, 0xff8a30, 1.8, 9);
}
/* ---------- Fuego del colosal: meteoros con estela, columnas de llamas, quemaduras y el aliento ----------
   Usa los trazos de llama y el sol de las técnicas foil (js/poderes/foil.js). */
const colSolMat = () => COL.solM || (COL.solM = new THREE.SpriteMaterial({ map: solMat.map, transparent: true, depthWrite: false }));
COL.meteoros = []; COL.quemas = [];
function colMeteoro(from, Ci){
  const spr = new THREE.Sprite(colSolMat()); spr.renderOrder = 7; scene.add(spr);
  COL.meteoros.push({ from, to: new V3(Ci.position.x, 0.05, Ci.position.z), Ci, t: 0, dur: 1.0, spr, cola: tintaCoge(LLAMA, 1, 'fuego'), nucleo: tintaCoge(LLAMA_VIVA, 1, 'fuego') });
}
const colArco = (M, s, v) => { v.lerpVectors(M.from, M.to, s); v.y += Math.sin(s * Math.PI) * 2.4; return v; };
function colMeteorosTick(dt){
  for (let i = COL.meteoros.length - 1; i >= 0; i--){
    const M = COL.meteoros[i]; M.t += dt;
    M.to.x = colC(M.Ci.userData.z) + M.Ci.userData.u; M.Ci.position.x = M.to.x;   // el blanco va pegado al lomo
    M.Ci.material.uniforms.uOpacity.value = 0.35 + 0.3 * Math.abs(Math.sin(time * 14));
    const k = Math.min(1, M.t / M.dur);
    colArco(M, k, M.spr.position); M.spr.scale.setScalar(1.5 + Math.sin(time * 31 + i) * 0.18); COL.solM.rotation = time * 5;
    tintaPinta(M.cola, (q, v) => colArco(M, q, v), Math.max(0, k - 0.34), k, q => 0.15 + 1.25 * q);
    tintaPinta(M.nucleo, (q, v) => colArco(M, q, v), Math.max(0, k - 0.18), k, q => 0.08 + 0.5 * q);
    if (rnd() < 0.9){ const p = M.spr.position; spawnFx(p.x, p.y, p.z, (rnd() - 0.5) * 2, 1 + rnd() * 2, (rnd() - 0.5) * 2, rnd() < 0.5 ? 0xffd060 : 0xff5a14, 0.1, 0.5, -1, 0.4); }
    if (k < 1) continue;
    // impacto: columna de llamas, anillos, ascuas y quemadura
    const x = M.to.x, z = M.to.z; M.Ci.visible = false; scene.remove(M.spr); tintaSuelta(M.cola); tintaSuelta(M.nucleo); COL.meteoros.splice(i, 1);
    ringFx(x, z, 0xff7a2a, 0.3, 2.4, 0.35); ringFx(x, z, 0xffd060, 0.2, 1.4, 0.25, 0.4); lightFlash(x, 1.3, z, 0xff8a30, 2.4, 8); play('boom'); COL.temblor = Math.max(COL.temblor, 0.12);
    for (let k2 = 0; k2 < 16; k2++){ const a = rnd() * TAU, sp = 2 + rnd() * 4; spawnFx(x, 0.4, z, Math.cos(a) * sp, 2 + rnd() * 5, Math.sin(a) * sp, rnd() < 0.4 ? 0xfff0a0 : rnd() < 0.6 ? 0xffa020 : 0xff4a14, 0.12, 0.7, 7, 0.3); }
    colColumna(x, z, 3.2, 0.7); colQuemadura(M.Ci.userData.z, M.Ci.userData.u);
    if (Math.hypot(hero.position.x - x, hero.position.z - z) < 1.5 && hero.position.y < 1.1 && COL.fase !== 'aire') hurtPlayer(16 * COL.e.dm, x, z, 5);
  }
  for (let i = COL.quemas.length - 1; i >= 0; i--){ const Q = COL.quemas[i]; Q.t -= dt; Q.m.position.x = colC(Q.z) + Q.u;
    Q.m.material.uniforms.uOpacity.value = Math.min(0.9, Q.t / 2.5 * 0.9); Q.aro.material.uniforms.uOpacity.value = Math.min(1, Q.t / 2.5) * (0.6 + 0.4 * Math.sin(time * 9 + i));
    if (rnd() < dt * 6) spawnFx(Q.m.position.x + (rnd() - 0.5) * 1.4, 0.15, Q.z + (rnd() - 0.5) * 1.4, 0, 1 + rnd(), 0, rnd() < 0.5 ? 0xff7a2a : 0xffd060, 0.06, 0.5, -1, 0);
    if (Q.t <= 0){ scene.remove(Q.m); COL.quemas.splice(i, 1); } }
}
function colColumna(x, z, alto, dur){   // columna de llamas que sube del impacto
  const c1 = tintaCoge(LLAMA, 1, 'fuego'), c2 = tintaCoge(LLAMA_VIVA, 1, 'fuego');
  const P1 = (q, v) => v.set(x + Math.sin(q * 7 + time * 9) * 0.15, q * alto, z + Math.cos(q * 5 + time * 7) * 0.15);
  foilFx.push({ t: 0, cintas: [c1, c2], upd(){ const k = Math.min(1, this.t / 0.15), fade = Math.max(0, (this.t - 0.2) / dur); if (fade >= 1) return false;
      tintaPinta(c1, P1, fade * 0.6, k, q => 1.5 * (1 - q * 0.65)); tintaPinta(c2, P1, fade * 0.6, k * 0.9, q => 0.7 * (1 - q * 0.6));
      c1.mat.uniforms.uAlpha.value = c2.mat.uniforms.uAlpha.value = 1 - fade; return true; } });
}
function colQuemadura(z, u){
  const g = mesh(circleGeo, makeMat(0x2a0e06, { opacity: 0.9 }), colC(z) + u, 0.04, z); g.scale.setScalar(1.2);
  const aro = mesh(new THREE.RingGeometry(0.75, 1, 20).rotateX(-Math.PI / 2), makeMat(0xff7a2a, { emissive: 1, opacity: 0.8 }), 0, 0.01, 0, g);
  COL.quemas.push({ m: g, aro, z, u, t: 2.8 });
}
// Aliento de fuego: gira el cuello y barre una franja del lomo de lado a lado con un chorro de llamas
function colAlientoTick(A, dt){
  const AV = 1.4, SW = 1.5, zb = A.zb, hw = colHW(zb);
  if (!COL.alTele){ COL.alTele = mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), makeMat(0xff3a2a, { emissive: 1, opacity: 0.5 }), 0, 0.06, 0); COL.alTele.visible = false; }
  const T = COL.alTele; T.visible = A.t < AV + SW; T.position.set(colC(zb), 0.06, zb); T.scale.set(hw * 2 + 0.6, 1, 3.4);
  T.material.uniforms.uOpacity.value = A.t < AV ? 0.35 + 0.3 * Math.abs(Math.sin(time * 12)) : 0.15;
  COL.boca = A.t > 0.9 ? 1 : 0.45;
  if (A.t > 0.4 && !A.son){ A.son = true; play('dragonRoar'); }
  if (A.t >= AV && A.t < AV + SW){
    const k = (A.t - AV) / SW, x0 = colC(zb) + A.lado * (hw + 0.8), x1 = colC(zb) - A.lado * (hw + 0.8), ix = lerp(x0, x1, smooth(k));
    if (!A.chorro){ A.chorro = [tintaCoge(LLAMA, 1, 'fuego'), tintaCoge(LLAMA_VIVA, 1, 'fuego'), tintaCoge(LLAMA, 1, 'fuego')]; play('breath'); }
    COL.cab.updateMatrixWorld(true); const boca = colV[2].set(0, -0.1, 1.4).applyMatrix4(COL.cab.matrixWorld), imp = colV[3].set(ix, 0.3, zb);
    const P1 = (q, v) => { v.lerpVectors(boca, imp, q); v.y += Math.sin(q * Math.PI) * 0.8; v.x += Math.sin(q * 11 + time * 13) * 0.12 * q; return v; };
    tintaPinta(A.chorro[0], P1, 0, 1, q => 0.5 + 1.8 * q * q); tintaPinta(A.chorro[1], P1, 0.05, 1, q => 0.2 + 0.8 * q * q);
    tintaPinta(A.chorro[2], (q, v) => v.set(lerp(x0, ix, q), 0.35 + Math.sin(q * 9 + time * 8) * 0.08, zb + Math.sin(q * 13 + time * 6) * 0.25), 0, 1, q => 1.1 + 0.5 * q);   // el lomo ardiendo por donde pasa
    for (let n = 0; n < 3; n++){ const a = rnd() * TAU; spawnFx(ix, 0.4, zb + (rnd() - 0.5) * 2, Math.cos(a) * 3, 2 + rnd() * 3, Math.sin(a) * 3, rnd() < 0.5 ? 0xffd060 : 0xff5a14, 0.12, 0.6, 5, 0.3); }
    lightFlash(ix, 1.2, zb, 0xff8a30, 2.2, 8); COL.temblor = Math.max(COL.temblor, 0.1);
    A.cd = (A.cd || 0) - dt;
    if (A.cd <= 0 && Math.abs(hero.position.z - zb) < 1.75 && Math.abs(hero.position.x - ix) < 1.5 && hero.position.y < 1.6){ if (hurtPlayer(17 * COL.e.dm, ix, zb, 6) === 'hit') A.cd = 0.45; }
  }
  if (A.t >= AV + SW){ if (A.chorro){ A.chorro.forEach(tintaSuelta); A.chorro = null; } T.visible = false; COL.giroObj = 0; }
  if (A.t >= AV + SW + 0.6){ COL.boca = 0.12; colFinAtq(); }
}
function colAtaqueTick(dt){
  const A = COL.atq;
  if (!A){ if (COL.pendFinal > 0) return; COL.atqCd -= dt; if (COL.atqCd <= 0 && !player.dead) colElige(); return; }
  A.t += dt; A.fuerza = 0;   // (lo fuerte que zarandea ahora: sin agarrarse, te acaba tirando; ver colTick)
  if (A.tipo === 'sacude'){
    const AV = 1.4, D = 2.8;
    if (A.t >= AV && A.t < AV + D){ const k = (A.t - AV) / D; COL.bancoObj = A.s * 0.58 * Math.sin(k * Math.PI * 2.5) * Math.min(1, (1 - k) * 4); A.fuerza = Math.min(1, (1 - k) * 4);
      if (!A.son){ A.son = true; play('colRafaga'); COL.boca = 0.2; } }
    else if (A.t >= AV + D){ COL.bancoObj = 0; colFinAtq(); }
  } else if (A.tipo === 'aliento'){ colAlientoTick(A, dt);
  } else if (A.tipo === 'violenta'){   // sacudida a lo bestia que acaba en una coz: sin agarrarse, por los aires
    const AV = 1.1, D = 2.6;
    if (A.t >= AV && A.t < AV + D){ const k = (A.t - AV) / D; COL.bancoObj = A.s * 0.85 * Math.sin(k * Math.PI * 5) * Math.min(1, (1 - k) * 6); COL.temblor = Math.max(COL.temblor, 0.3); A.fuerza = Math.min(1, (1 - k) * 6);
      if (!A.son){ A.son = true; play('colRafaga'); }
      if (!A.coz && k > 0.86){ A.coz = true; shake = Math.max(shake, 0.9); play('boom'); if (!COL.agarra && grounded && !player.dead){ colLanza(Math.sign(hero.position.x - colC(hero.position.z)) || A.s, 0, true); return; } } }
    else if (A.t >= AV + D){ COL.bancoObj = 0; colFinAtq(); }
  } else if (A.tipo === 'vertical'){   // sube en vertical: la gravedad tira hacia la cola
    const AV = 1.3, D = 3.2;
    if (A.t >= AV && A.t < AV + D){ const k = (A.t - AV) / D; COL.cabObj = -1.25 * Math.min(1, k * 4, (1 - k) * 4); A.fuerza = Math.min(1, k * 4, (1 - k) * 4); if (!A.son){ A.son = true; play('colRafaga'); } }
    else if (A.t >= AV + D){ COL.cabObj = 0; colFinAtq(); }
  } else if (A.tipo === 'tirabuzon'){   // media vuelta, un rato boca abajo y la otra media
    const AV = 1.3, G1 = 0.9, HOLD = 2.0, G2 = 0.9;
    if (A.t >= AV){ const t = A.t - AV;
      COL.bancoObj = A.s * (t < G1 ? Math.PI * smooth(t / G1) : t < G1 + HOLD ? Math.PI : Math.PI * (1 + smooth(Math.min(1, (t - G1 - HOLD) / G2)))); A.fuerza = t < G1 + HOLD + G2 ? 1 : 0;
      if (!A.son){ A.son = true; play('colRafaga'); }
      if (t >= G1 + HOLD + G2 + 0.35){ COL.banco -= A.s * TAU; COL.bancoObj = 0; colFinAtq(); } }
  } else if (A.tipo === 'rafaga'){
    const AV = 1.1, D = 1.9;
    if (A.t >= AV && A.t < AV + D){ COL.rafagaObj = 6.5; A.fuerza = Math.min(1, (A.t - AV) * 3); }
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
      for (let i = 0; i < A.bandas; i++){ const z = COL.puas[i].z; lightFlash(colC(z), 1, z, 0xff8a30, 1.8, 6);
        for (let k = 0; k < 16; k++) spawnFx(colC(z) + (rnd() - 0.5) * 3, 0.2, z + (rnd() - 0.5) * 1.6, (rnd() - 0.5) * 2, 3 + rnd() * 4, (rnd() - 0.5) * 2, rnd() < 0.4 ? 0xfff0a0 : rnd() < 0.6 ? 0xffa020 : 0xff4a14, 0.1, 0.6, 7, 0.3); } }
    if (A.t > AV + 1.15){ for (const P_ of COL.puas) P_.g.visible = false; colFinAtq(); }
  } else if (A.tipo === 'fuego'){
    if (A.t > 0.35 && !A.son){ A.son = true; play('dragonRoar'); }
    COL.boca = A.t > 0.8 && A.t < 2.8 ? 0.75 : 0.25;
    if (A.t > 1.1 && A.n < 6 && A.t > 1.1 + A.n * 0.24){ colEscupe(A.n === 0); A.n++; }
    if (A.t > 2.9) COL.giroObj = 0;
    if (A.t > 3.7){ COL.boca = 0.12; colFinAtq(); }
  }
}

/* ---------- Por los aires: te ha tirado. Crías, impulso y vuelta al lomo (o Lumen te recoge, y cobra) ---------- */
const colCriaMats = () => COL.criaM || (COL.criaM = { rojo: makeMat(0xd8402a, { emissive: 0.15 }), oro: makeMat(0xffc040, { emissive: 0.3 }), panza: makeMat(0xff8a3a, { emissive: 0.25 }), ojo: makeMat(0xffe070, { emissive: 1 }),
  ala: makeMat(0xff8a3a, { emissive: 0.3, side: THREE.DoubleSide }) });
function colCriaNueva(){   // como las crías de la pelea, pero del tamaño justo para montarse
  const M = colCriaMats(), g = new THREE.Group(); g.visible = false; scene.add(g);
  const sk = mesh(new THREE.IcosahedronGeometry(0.5, 1), M.rojo, 0, 0, 0, g); sk.scale.set(0.95, 0.85, 1.15);
  mesh(B(0.44, 0.28, 0.64), M.rojo, 0, -0.1, 0.52, g); mesh(B(0.38, 0.1, 0.56), M.panza, 0, -0.24, 0.46, g);
  for (const s_ of [-1, 1]){ mesh(B(0.14, 0.1, 0.06), M.ojo, 0.2 * s_, 0.14, 0.44, g); const h = mesh(new THREE.ConeGeometry(0.09, 0.55, 4), M.oro, 0.2 * s_, 0.4, -0.2, g); h.rotation.x = -0.9; }
  if (!COL.alaG){ COL.alaG = new THREE.BufferGeometry(); COL.alaG.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1.9, 0.25, -0.5, 0.5, 0, -1.4], 3)); COL.alaG.computeVertexNormals(); }
  const alas = [-1, 1].map(s_ => { const w = new THREE.Group(); w.position.set(0.32 * s_, 0.1, -0.7); g.add(w); mesh(COL.alaG, M.ala, 0, 0, 0, w).scale.x = s_; return w; });
  const segs = Array.from({ length: 8 }, (_, i) => { const m = mesh(new THREE.IcosahedronGeometry(0.42 - i * 0.032, 1), i % 2 ? M.panza : M.rojo, 0, -50, 0); m.visible = false; return m; });
  return { g, alas, segs, rastro: [], pos: new V3(), prev: new V3(), centro: new V3(), oy: 0, fa: 0, on: false, libreT: 0, cansa: 0, fuera: 0 };
}
function colCriasSuelta(lado){   // tres crías escalonadas a lo largo de la caída (la de colAireTick sin tocar nada), hacia tu lado: guíate hasta una
  if (!COL.crias.length) COL.crias = [colCriaNueva(), colCriaNueva(), colCriaNueva()];
  const A = COL.aire, p = A.pos.clone(), v = A.vel.clone(), alto = [-3, -6.5, -10], sitios = [], h = 1 / 30;
  for (let t = 0; t < 8 && sitios.length < 3; t += h){ v.y = Math.max(-5, v.y - 7 * h); v.x *= Math.exp(-h * 0.9); v.z *= Math.exp(-h * 0.9); p.addScaledVector(v, h);
    if (p.y <= A.pos.y + alto[sitios.length]) sitios.push(p.clone()); }
  const of = [[0, -1.5], [1.4, 2], [-1.2, 3.5]];   // (de lado y en z, respecto a la caída)
  COL.crias.forEach((c, k) => { const q = sitios[k] || p; c.centro.set(q.x + lado * of[k][0], q.y, q.z + of[k][1]); c.fa = k * 2.1; c.on = true; c.libreT = 0; c.cansa = 15; c.fuera = 0;
    c.pos.set(c.centro.x + lado * 6, c.centro.y - 3, c.centro.z); c.prev.copy(c.pos); c.rastro.length = 0; c.g.visible = true; for (const m of c.segs) m.visible = true; });
}
function colCriasFuera(ya){ for (const c of COL.crias){ if (ya){ c.on = false; c.g.visible = false; for (const m of c.segs) m.visible = false; } else if (c.on && !c.fuera) c.fuera = 2.5; } }
function colCriasTick(dt){
  const A = COL.aire;
  for (const c of COL.crias){ if (!c.on) continue;
    if (!(A && A.cria === c)) c.prev.copy(c.pos);   // (la que lleva Tovan la mueve colAireTick)
    if (A && A.cria === c){ /* la lleva Tovan: la mueve colAireTick */ }
    else if (c.fuera > 0){ c.fuera -= dt; c.pos.x += Math.sign(c.pos.x - colC(c.pos.z) || 1) * 9 * dt; c.pos.y += 4 * dt; if (c.fuera <= 0){ c.on = false; c.g.visible = false; for (const m of c.segs) m.visible = false; continue; } }
    else { c.fa += dt * 1.5;
      const tx = c.centro.x + Math.cos(c.fa) * 1.6, ty = c.centro.y + Math.sin(c.fa * 1.7) * 0.6, tz = c.centro.z + Math.sin(c.fa) * 1.6;
      c.pos.x += (tx - c.pos.x) * (1 - Math.exp(-dt * 2.5)); c.pos.y += (ty - c.pos.y) * (1 - Math.exp(-dt * 2.5)); c.pos.z += (tz - c.pos.z) * (1 - Math.exp(-dt * 2.5)); }
    c.libreT = Math.max(0, c.libreT - dt);
    // modelo: la cabeza mira hacia donde vuela; las alas aletean; el cuerpo sigue el rastro
    c.g.position.copy(c.pos); colV[3].subVectors(c.pos, c.prev); if (colV[3].lengthSq() > 1e-6){ colMira.position.copy(c.pos); colMira.lookAt(colV[3].add(c.pos)); c.g.quaternion.slerp(colMira.quaternion, 1 - Math.exp(-dt * 8)); }
    const fl = Math.sin(time * 13 + c.fa); c.alas.forEach((w, i) => { w.rotation.z = (i ? 1 : -1) * (0.15 + fl * 0.6); });
    c.rastro.unshift(c.pos.clone()); if (c.rastro.length > 40) c.rastro.pop();
    c.segs.forEach((m, i) => { const q = c.rastro[Math.min(c.rastro.length - 1, (i + 1) * 3)]; m.position.copy(q); m.position.y += Math.sin(time * 8 - i * 0.7) * 0.06; });
  }
}
const colAsiento = (c, v) => v.set(0, 0.55, -0.75).applyQuaternion(c.g.quaternion).add(c.pos);
function colLanza(sx, sz, arriba){   // te ha tirado: por los aires, siempre por un costado
  if (COL.fase !== 'aire' && !(COL.yawT > 0)) COL.yaw0 = camYaw;   // (para devolver la cámara al volver al lomo)
  const fase0 = COL.fase === 'aire' && COL.aire ? COL.aire.fase0 : COL.fase, lado = Math.sign(sx) || (hero.position.x - colC(hero.position.z) >= 0 ? 1 : -1);
  COL.aire = { pos: hero.position.clone(), vel: new V3(lado * 11, arriba ? 5.5 : 3.5, sz * 2.5), t: 0, cria: null, dash: 1, fase0, lado };
  COL.fase = 'aire'; COL.agarra = false; COL.vu = COL.vz = 0; COL.suelto = 0; COL.atq = null; colQuitaAtaques(); for (const p of COL.puas) p.g.visible = false;
  COL.bancoObj = COL.cabObj = COL.rafagaObj = 0; COL.esq.n = 0; COL.esq.cd = 0.6;
  state = 'normal'; attackW = 0; staffToBack(); grounded = true; vy = 0; blob.visible = false; colAvisoEl.classList.remove('mal');
  colCriasSuelta(lado);
  play('jump'); play('colRafaga'); shake = Math.max(shake, 0.5); slowT = Math.max(slowT, 0.5);
  barkT = 0; bark('¡Te ha tirado! ¡Agárrate a una cría o te estrellas!');
}
function colAireTick(dt){
  const A = COL.aire; A.t += dt;
  const ix = inputMag > 0.12 ? Math.sin(inputHeading) * inputMag : 0, iz = inputMag > 0.12 ? Math.cos(inputHeading) * inputMag : 0;
  if (A.cria){   // montado: la cría va hacia donde le digas y sube sola hasta la altura del lomo
    const c = A.cria; c.cansa -= dt;
    A.vel.x += (ix * 9 - A.vel.x) * (1 - Math.exp(-dt * 3)); A.vel.z += (iz * 9 - A.vel.z) * (1 - Math.exp(-dt * 3)); A.vel.y += ((2.3 - c.pos.y) * 1.3 - A.vel.y) * (1 - Math.exp(-dt * 2));
    c.prev.copy(c.pos); c.pos.addScaledVector(A.vel, dt); colAsiento(c, A.pos);
    colEsquiva(c);
    { const zz = clamp(c.pos.z, COL.zMin, COL_ZMAX), dx = colC(zz) - c.pos.x, dz = zz - c.pos.z;   // la cámara se va girando hacia el dragón, en tres cuartos: se le ve entero apartarse
      if (Math.abs(dx) > 2.5 && !dragging){ const a = Math.atan2(-dx, -(dz - Math.abs(dx) * 0.7)); camYaw += Math.atan2(Math.sin(a - camYaw), Math.cos(a - camYaw)) * (1 - Math.exp(-dt * 1.4)); } }
    const sobre = Math.abs(c.pos.x - colC(c.pos.z)) < colHW(c.pos.z) + 0.6 && c.pos.z > COL.zMin && c.pos.z < COL_ZMAX && c.pos.y > -0.5, huye = Math.abs(COL.esq.v) > 2.5;
    colAviso(sobre ? '¡SALTA!' : huye ? '¡Se aparta!' : 'Vuela hasta el lomo', sobre ? 'Salta y caes encima' : c.cansa < 4 ? '¡La cría se cansa!' : huye ? '¡Persíguelo!' : 'SALTAR para soltarte', false);
    if (c.cansa <= 0){ A.cria = null; c.libreT = 3; c.fuera = 2.5; A.vel.y = 1.5; barkT = 0; bark('¡La cría se ha cansado! ¡Busca otra!'); }
    A.viento = Math.max(0, (A.viento || 0) - dt);
    if (A.viento > 0){ c.pos.x += Math.sin(time * 27) * 0.05 * A.viento; c.pos.y += Math.sin(time * 31) * 0.06 * A.viento; }   // el aire que mueve un bicho así de grande te zarandea
  } else {
    A.vel.y = Math.max(-5, A.vel.y - 7 * dt); const dr = Math.exp(-dt * 0.9);   // caída frenada por el viento, y el aire te frena de lado
    A.vel.x = A.vel.x * dr + ix * 10 * dt; A.vel.z = A.vel.z * dr + iz * 10 * dt; const h = Math.hypot(A.vel.x, A.vel.z), cap = A.t < 1 ? 12 : 7; if (h > cap){ A.vel.x *= cap / h; A.vel.z *= cap / h; }   // (el primer segundo, el tirón del lanzamiento)
    A.pos.addScaledVector(A.vel, dt);
    const encima = Math.abs(A.pos.x - colC(A.pos.z)) < colHW(clamp(A.pos.z, COL.zMin, COL_ZMAX)) + 0.5 && A.pos.y > 0 && A.pos.z > COL.zMin - 0.5 && A.pos.z < COL_ZMAX + 0.5;
    if (!A.muerto) colAviso(encima ? '¡Al lomo!' : '¡Agárrate a una cría!', encima ? 'Caes encima' : A.pos.y < -11 ? '¡O caerás al vacío!' : 'Muévete hacia ella · RODAR para impulsarte', false);
    for (const c of COL.crias) if (c.on && !c.fuera && c.libreT <= 0 && Math.hypot(A.pos.x - c.pos.x, A.pos.z - c.pos.z) < 2.1 && Math.abs(A.pos.y - c.pos.y - 0.4) < 1.6){
      A.cria = c; c.cansa = 15; play('colAgarre'); play('land'); foilGritoCol('¡Montado!'); barkOnce('colCria', '¡Eso es! Llévala hasta el lomo y salta.'); break; }
    // vuelta al lomo: cayendo por encima de la pasarela
    const cz = colC(A.pos.z), hw = colHW(A.pos.z);
    if (A.vel.y < 0 && A.pos.y <= 0 && A.pos.y > -1.4 && Math.abs(A.pos.x - cz) < hw + 0.5 && A.pos.z > COL.zMin - 0.5 && A.pos.z < COL_ZMAX + 0.5){ colAterriza(); return; }
    if (A.pos.y < -18 && !A.muerto){ colCaidaMortal(); if (!A.muerto) return; }   // (revivido: ya está en el lomo)
    if (A.muerto){ A.vel.y = -9; A.vel.x *= 0.9; A.vel.z *= 0.9; }
  }
  hero.position.copy(A.pos); grounded = true; vy = 0;
  if (Math.hypot(A.vel.x, A.vel.z) > 0.5){ heading = Math.atan2(A.vel.x, A.vel.z); hero.rotation.y = lerpAngle(hero.rotation.y, heading, 1 - Math.exp(-dt * 8)); }
}
function colEsquiva(c){   // montado en una cría: el dragón se aparta para no dejarte subir (hasta COL_ESQ_MAX veces por caída; luego se cansa)
  const E = COL.esq, z = clamp(c.pos.z, COL.zMin, COL_ZMAX), dx = c.pos.x - colC(z);
  const cerca = Math.abs(dx) < colHW(z) + 3.4 && c.pos.y > -2.6 && c.pos.z > COL.zMin - 3 && c.pos.z < COL_ZMAX + 3;
  if (!cerca || E.cd > 0 || E.n >= COL_ESQ_MAX) return;
  const s = -(Math.sign(dx) || -Math.sign(E.obj) || 1), obj = clamp(E.obj + s * 7.5, -16, 16);
  if (Math.abs(obj - E.obj) < 3) return;   // arrinconado: esta vez no puede
  E.obj = obj; E.z = c.pos.z; E.cd = 0.9; E.n++; COL.aire.viento = 0.9;
  play('colRafaga'); if (E.n === 1) play('dragonRoar'); shake = Math.max(shake, 0.45); COL.temblor = Math.max(COL.temblor, 0.4); COL.boca = 0.6;
  for (let k = 0; k < 14; k++){ const zz = c.pos.z + (rnd() - 0.5) * 9; spawnFx(colC(zz) - s * colHW(zz), 0.4 + rnd() * 1.5, zz, s * (5 + rnd() * 5), (rnd() - 0.3) * 2, (rnd() - 0.5) * 2, 0xffffff, 0.12, 0.5, 0, 0.2); }
  barkT = 0; bark(E.n === 1 ? '¡Se aparta! ¡No quiere que subas!' : E.n < COL_ESQ_MAX ? '¡Otra vez! ¡Es enorme, pero tu cría es más rápida!' : '¡Se cansa! ¡Ahora, encima!');
}
function foilGritoCol(txt){ colV[3].set(hero.position.x, hero.position.y + 2.6, hero.position.z); spawnNumber(colV[3], txt, 'react', '#bfffe6'); }
function colAireImpulso(){   // RODAR en el aire: un impulso hacia donde mires (una vez por caída)
  const A = COL.aire; if (!A || A.cria || A.dash <= 0) return;
  A.dash = 0; const a = inputMag > 0.12 ? inputHeading : hero.rotation.y; A.vel.x = Math.sin(a) * 9; A.vel.z = Math.cos(a) * 9; A.vel.y = Math.max(A.vel.y, 2.5);
  play('whoosh'); for (let i = 0; i < 10; i++) spawnFx(A.pos.x, A.pos.y + 1, A.pos.z, -Math.sin(a) * 4 + (rnd() - 0.5) * 2, (rnd() - 0.5) * 2, -Math.cos(a) * 4 + (rnd() - 0.5) * 2, 0xffffff, 0.08, 0.35, 0, 0);
}
function colAireSalta(){   // SALTAR montado: te sueltas de la cría con impulso hacia arriba
  const A = COL.aire; if (!A || !A.cria) return;
  const c = A.cria; A.cria = null; c.libreT = 2.5; A.vel.set(A.vel.x * 0.6, 8, A.vel.z * 0.6); A.dash = 1; play('jump');
}
function colAterriza(){
  const A = COL.aire, z = clamp(A.pos.z, COL.zMin, COL_ZMAX); hero.position.set(A.pos.x, 0, z); grounded = true; vy = 0; landT = 0.18; P.body.rotation.x = 0; blob.visible = true;
  COL.fase = A.fase0; COL.aire = null; COL.aguante = 1; COL.atqCd = 3; colAviso(null); colCriasFuera(false); COL.yawT = 1.8;
  puff(8); play('land'); shake = Math.max(shake, 0.35); foilGritoCol('¡De vuelta!'); player.inv = Math.max(player.inv, 1);
}
function colCaidaMortal(){   // te has caído sin pillar una cría: al vacío (si un poder te revive, vuelves al lomo)
  const A = COL.aire; colAviso(null); barkT = 0; bark('¡¡TOVAAAN!!');
  player.inv = 0; if (state === 'roll') state = 'normal';
  hurtPlayer(player.hp + player.maxHp * 10, A.pos.x, A.pos.z, 0);
  if (player.dead || player.hp <= 0){ A.muerto = true; colCriasFuera(false); return; }
  // revivido (Fénix, Segundo aliento…): de vuelta al lomo
  flash('#ffffff', 0.9); P.body.rotation.x = 0; blob.visible = true;
  const z = clamp(A.pos.z, COL.zMin + 1, COL_ZMAX - 1); hero.position.set(colC(z), 0, z); grounded = true; player.inv = Math.max(player.inv, 1.6);
  COL.fase = A.fase0; COL.aire = null; COL.aguante = 1; COL.atq = null; colQuitaAtaques(); COL.atqCd = 3; colCriasFuera(false); COL.yawT = 1.8;
}

/* ---------- Cada fotograma ---------- */
function colTick(dt, pdt, playing){
  if (!COL.montado) return;
  const run = gameState === 'paused' ? 0 : dt, jugando = playing && COL.on && (COL.fase === 'lomo' || COL.fase === 'final' || COL.fase === 'aire');
  const z0 = hero.position.z, c0 = colC(z0);
  // estado del dragón: ondulación, cuello, picado, alabeo
  COL.tt += run; colEsqTick(run);
  COL.lejos += ((COL.fase === 'aire' && COL.aire && COL.aire.cria ? 1 : 0) - COL.lejos) * (1 - Math.exp(-run * 1.5));   // montado en una cría, la cámara se aleja: se ve el dragón entero apartarse
  COL.giro += (COL.giroObj - COL.giro) * (1 - Math.exp(-run * 2.2));
  if (COL.fase === 'final' || COL.fase === 'remate') COL.picado = Math.min(1, COL.picado + run / 2.5);
  COL.banco += (COL.bancoObj - COL.banco) * (1 - Math.exp(-run * 5));
  COL.cabeceo += (0.3 * COL.picado + 0.04 * Math.sin(COL.tt * 0.4) + COL.cabObj - COL.cabeceo) * (1 - Math.exp(-run * (COL.cabObj ? 3.5 : 2)));
  COL.temblor = Math.max(0, COL.temblor - run * 0.5);
  COL.rafaga += ((COL.fase === 'final' ? 0.9 : 0) + COL.rafagaObj - COL.rafaga) * (1 - Math.exp(-run * 4));
  if (jugando && COL.fase !== 'aire') hero.position.x += colC(z0) - c0;   // el lomo arrastra a Tovan
  if (COL.crias.length) colCriasTick(run);
  // cuerpo
  const S = COL.segs;
  for (const sg of S){ const z = sg.userData.z; sg.position.set(colC(z), colTop(z) - sg.userData.R * 0.62, z); }
  colCuello();
  for (let i = 0; i < S.length; i++){ const sg = S[i];
    if (i) sg.lookAt(S[i - 1].position); else { colV[0].copy(sg.position).multiplyScalar(2).sub(S[1].position); sg.lookAt(colV[0]); }
    if (sg.userData.legs) sg.userData.legs.forEach((L, j) => { L.rotation.x = Math.sin(COL.tt * 2.2 + i + j * 2.5) * 0.7; }); }
  // cabeza: al frente (y algo arriba), a Tovan cuando se gira, hacia abajo en el picado
  { const H = COL.cab, s0 = S[0].position, d = colV[1].copy(s0).sub(S[1].position).normalize();
    H.position.copy(s0).addScaledVector(d, 1.6 + 1.35 * (S[0].scale.z - 1)); H.position.y += 0.4;
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
  if (playing && (COL.meteoros.length || COL.quemas.length)) colMeteorosTick(pdt);
  // viento: líneas de velocidad y sonido
  const vk = Math.min(1, 0.2 + 0.25 * COL.picado + (COL.rafaga > 2 ? 0.4 : 0) + Math.abs(COL.banco) * 0.5);
  colVientoEl.style.setProperty('--k', vk.toFixed(2)); colVientoEl.style.setProperty('--r', ((COL.tt * 97) % 6).toFixed(1) + 'deg');
  if (COL.son && actx){ const t = actx.currentTime; COL.son.g.gain.setTargetAtTime(sfxOn && gameState !== 'paused' ? 0.05 + 0.16 * vk : 0, t, 0.15); COL.son.bp.frequency.setTargetAtTime(450 + 900 * vk + 160 * Math.sin(COL.tt * 0.7), t, 0.2); }
  if (!jugando){ colAgarreEl.hidden = true; return; }
  // --- jugando sobre el lomo ---
  clearT = 0; colBarra();
  if (COL.fase === 'aire'){ colAireTick(pdt); colAgarreEl.hidden = true; return; }
  if (COL.fase === 'final' && !COL.perla && COL.picado > 0.6){ COL.perla = colSello(COL_ZPERLA, true); barkT = 0; bark('¡Ahí, entre los cuernos! ¡La perla!'); }
  COL.zMin = lerp(COL_ZMIN, COL_ZMIN_FIN, COL.picado);
  if (COL.pendFinal > 0 && (COL.pendFinal -= pdt) <= 0){ COL.fase = 'final'; COL.atq = null; COL.atqCd = 3.5; COL.primero = 'rafaga'; play('dragonRoar'); play('colRafaga'); shake = Math.max(shake, 0.8);
    banner('¡En picado!<small>Llega hasta la perla de la cabeza</small>', 2.2); }
  if (COL.yawT > 0){ COL.yawT -= pdt; if (!dragging) camYaw += Math.atan2(Math.sin(COL.yaw0 - camYaw), Math.cos(COL.yaw0 - camYaw)) * (1 - Math.exp(-pdt * 2.5)); }   // de vuelta en el lomo: la cámara vuelve a como estaba
  colAtaqueTick(pdt);
  if (COL.fase === 'aire') return;   // (una coz te acaba de tirar)
  // agarre
  const peligro = colPeligro(), held = keys.KeyK || keys.ShiftLeft || keys.ShiftRight || colTocaRodar || colPadRodar();
  if (COL.sinFuerza > 0) COL.sinFuerza -= pdt;
  const agarra = peligro && held && grounded && state !== 'roll' && COL.aguante > 0 && COL.sinFuerza <= 0 && !player.dead;
  const c1 = colC(hero.position.z);
  if (agarra && !COL.agarra){ COL.uLock = hero.position.x - c1; COL.zLock = hero.position.z; play('colAgarre'); state = state === 'charge' ? 'normal' : state; }
  COL.agarra = agarra;
  if (agarra){ COL.aguante = Math.max(0, COL.aguante - pdt * 0.22);
    if (COL.aguante <= 0){ COL.agarra = false; COL.sinFuerza = 1.4; barkT = 0; bark('¡Se te escurren las manos!'); COL.vu = Math.sign(COL.banco || 1) * 1.2; } }
  else COL.aguante = Math.min(1, COL.aguante + pdt * (peligro ? 0.05 : 0.4));
  colAvisoEl.classList.toggle('ok', COL.agarra);
  // posición sobre el lomo: deslizarse con el alabeo, viento de cara, bordes
  let z = hero.position.z, u = hero.position.x - c1;
  const g = colV[1].set(0, -1, 0).applyEuler(COL.env.rotation);   // la gravedad, vista desde el dragón (x: de lado · z: hacia la cola · y: contra el lomo)
  // sin agarrarse mientras zarandea (o saltando, o sin aguante): en un momento te tira por un costado
  const fz = COL.atq && COL.atq.fuerza || 0;
  if (fz > 0 && !COL.agarra && !player.dead){ COL.suelto += pdt * fz;
    if (COL.suelto >= (COL_SUELTA[COL.atq.tipo] || 0.5)){ colLanza(Math.abs(g.x) > 0.12 ? Math.sign(g.x) : Math.sign(u) || COL.atq.s || 1, 0, true); return; } }
  else COL.suelto = Math.max(0, COL.suelto - pdt * 2);
  colAvisoEl.classList.toggle('mal', COL.suelto > 0.04);
  if (COL.agarra){ u = COL.uLock; z = COL.zLock; COL.vu = COL.vz = 0; }
  else {
    if (grounded && Math.abs(g.x) > 0.04) COL.vu += g.x * 14 * pdt;
    if (grounded && Math.abs(g.z) > 0.35) COL.vz += g.z * 14 * pdt;
    COL.vu *= Math.exp(-pdt * 1.2); COL.vz *= Math.exp(-pdt * 1.2); u += COL.vu * pdt; z += (COL.rafaga + COL.vz) * pdt;
    if (grounded && g.y > -0.45 && !player.dead){ hero.position.x = colC(z) + u; hero.position.z = clamp(z, COL.zMin, COL_ZMAX); colLanza(Math.abs(g.x) > 0.12 ? Math.sign(g.x) : Math.sign(u) || 1, 0, true); return; }   // en vertical o boca abajo sin agarrarse: te caes
  }
  if (z >= COL_ZMAX && COL.vz > 2.2 && !player.dead){ hero.position.x = colC(COL_ZMAX) + u; hero.position.z = COL_ZMAX; colLanza(0, 1, false); return; }   // resbaló hasta la cola
  z = clamp(z, COL.zMin, COL_ZMAX); if (z === COL.zMin || z === COL_ZMAX) COL.vz = 0; const hw = colHW(z);
  if (Math.abs(u) > hw){
    if (!COL.agarra && Math.abs(COL.vu) > 1.6 && Math.sign(COL.vu) === Math.sign(u)){ hero.position.x = colC(z) + u; hero.position.z = z; colLanza(Math.sign(u), 0, false); return; }
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
  cam.position.sub(camTarget).multiplyScalar(1.28 + 0.55 * COL.lejos).add(camTarget); cam.position.y += 2.5 * COL.lejos; cam.lookAt(camTarget);
  const j = 0.025 + 0.05 * COL.picado + (COL.rafaga > 2 ? 0.05 : 0) + COL.temblor * 0.5;
  cam.position.x += Math.sin(time * 37.1) * j; cam.position.y += Math.sin(time * 41.7 + 1) * j;
  cam.rotateZ(-clamp(Math.atan2(Math.sin(COL.banco), Math.cos(COL.banco)), -0.7, 0.7) * 0.3);
  for (const sg of COL.segs) sg.visible = sg.position.distanceTo(cam.position) > sg.userData.R * 1.1 + 0.8;   // por debajo del dragón, la cámara no se mete dentro del cuerpo
  COL.cab.visible = COL.cab.position.distanceTo(cam.position) > 5.5;
}
function colPose(){
  if (!COL.montado) return;
  const w = 0.6 + 0.4 * COL.picado + (COL.rafaga > 2 ? 0.4 : 0);   // el viento tira de la bufanda y del pelo
  P.scarf.forEach((g, i) => { g.rotation.x += 0.7 * w + Math.sin(time * 18 - i) * 0.12; g.rotation.z += Math.sin(time * 11 + i) * 0.15; });
  P.tailHair.forEach((g, i) => { g.rotation.x += 0.5 * w + Math.sin(time * 16 - i) * 0.1; });
  P.ahoge.rotation.x += 0.3 * w;
  bl(P.spine.rotation, 'z', COL.fase === 'aire' ? 0 : -clamp(Math.atan2(Math.sin(COL.banco), Math.cos(COL.banco)), -0.9, 0.9) * 0.6, 1);   // se echa contra el alabeo
  if (COL.suelto > 0.02 && !COL.agarra && COL.fase !== 'aire'){   // sin agarrarse en plena sacudida: se tambalea y bracea
    const k = Math.min(1, COL.suelto / 0.35); P.spine.rotation.z += Math.sin(time * 24) * 0.32 * k; P.spine.rotation.x -= 0.25 * k;
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', (1.5 + Math.sin(time * 19 + s) * 0.6) * s, k); bl(A.el.rotation, 'x', -0.4, k); }
  }
  if (COL.agarra){   // agachado y agarrado a la crin
    bl(P.spine.rotation, 'x', 0.75, 1); bl(P.neck.rotation, 'x', -0.4, 1);
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -1.1, 1); bl(A.sh.rotation, 'z', -0.25 * s, 1); bl(A.el.rotation, 'x', -0.5, 1); }
    for (const L of [P.legL, P.legR]){ bl(L.hip.rotation, 'x', -1.0, 1); bl(L.knee.rotation, 'x', 1.6, 1); }
  }
  if (COL.fase === 'aire' && COL.aire){
    if (COL.aire.cria){   // montado en la cría: sentado y agarrado a los cuernos
      bl(P.spine.rotation, 'x', 0.35, 1); for (const L of [P.legL, P.legR]){ bl(L.hip.rotation, 'x', -1.45, 1); bl(L.knee.rotation, 'x', 1.3, 1); }
      for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -1.25, 1); bl(A.sh.rotation, 'z', -0.15 * s, 1); bl(A.el.rotation, 'x', -0.35, 1); }
    } else for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', 2.4 * s, 1); bl(A.el.rotation, 'x', -0.2 + Math.sin(time * 20) * 0.4, 1); bl(P.legL.knee.rotation, 'x', 0.9, 1); bl(P.legR.knee.rotation, 'x', 0.4, 1); }
  }
}

/* ---------- La segunda vida empieza: atropello y crecimiento ---------- */
function colPuede(e){ return e.type === 'dragon' && e.alive && !e.colHecho && !e.colFase && !special && !chActive && !invActive && !cs.active && gameState === 'play' && !player.dead; }
function colEmpieza(e){
  Object.assign(COL, { on: true, fase: 'cine', e, tt: 0, giro: 0, giroObj: 0, picado: 0, banco: 0, bancoObj: 0, cabeceo: 0, boca: 0.12, temblor: 0, atq: null, rotas: 0, sellos: [], perla: null,
    aguante: 1, agarra: false, sinFuerza: 0, vu: 0, vz: 0, cabObj: 0, zMin: COL_ZMIN, rafaga: 0, rafagaObj: 0, aire: null, pendFinal: 0, dijoAgarre: false, suelto: 0, lejos: 0, yawT: 0 }); colEsqReset();
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
  colFuegoFuera();
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
  colLimpiaLomo(); colDesmonta(); COL.on = false; COL.fase = null; COL.aire = null; COL.e = null;
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
const _doRollCol = doRoll; doRoll = function(){ if (COL.on && gameState === 'play' && COL.fase === 'aire'){ colAireImpulso(); return; } if (COL.on && gameState === 'play' && colPeligro()) return; _doRollCol(); };
const _doAttackCol = doAttack; doAttack = function(){ if (COL.on && (COL.agarra || COL.fase === 'aire')) return; _doAttackCol(); };
const _doJumpCol = doJump; doJump = function(){ if (COL.on && gameState === 'play' && COL.fase === 'aire'){ colAireSalta(); return; } if (COL.on && COL.agarra) return; _doJumpCol(); };
const _doSpecialCol = doSpecial; doSpecial = function(){ if (COL.on && (COL.agarra || COL.fase === 'aire')) return; _doSpecialCol(); };
const _v3UpdateCol = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateCol(dt, pdt, playing); try { colTick(dt, pdt, playing); } catch (err) { console.error(err); } };
const _csCameraCol = csCamera; csCamera = function(cam){ _csCameraCol(cam); try { colCamara(cam); } catch (err) { console.error(err); } };
const _legendPoseCol = legendPose; legendPose = function(){ _legendPoseCol(); try { colPose(); } catch (err) { console.error(err); } };
const _clearWorldCol = clearWorld; clearWorld = function(){ colAborta(); _clearWorldCol(); };
const _toTitleCol = toTitle; toTitle = function(){ colAborta(); _toTitleCol(); };

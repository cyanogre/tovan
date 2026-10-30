'use strict';
/* ======================================================================
   TOVAN.EXE (la segunda vida del ERROR 404)
   Al «matarlo», el cubo se copia del modelo de Tovan (una versión
   corrupta, con la textura perdida), crece hasta unos 13 m y se lleva la pelea
   fuera del mapa. Desde el suelo no se le hace nada: hay que trepar por
   una pierna, la espalda y la cabeza y apuñalar sus tres puntos débiles
   (cinturón, nuca y coronilla), como en Shadow of the Colossus.
   Pelea con versiones gigantes de los poderes de Tovan: Brazos de goma,
   Puño de fuego, Mil pájaros, Agujero negro y Aterrizaje de superhéroe.
   ====================================================================== */
const TER_ESC = 5.6, TER_ARENA = 15, TER_X = 0, TER_Z = -3, TER_VEL = 2.3;
const TER = { on: false, fase: null, e: null, montado: false, g: null, R: null, set: null, r: mulberry32(404), piezas: [], bits: [], rutas: [], anclas: [],
  tt: 0, yaw: 0, walkW: 0, ph: 0, pasoS: 0, atq: null, cd: 0, ultimo: null, primero: null, sellos: [], rotos: 0, trepa: null, aguante: 1, sac: null, sacT: 5, suelto: 0,
  cae: 0, agarreCd: 0, tumba: 0, tumbaT: 0, dolor: 0, carga: 0, alza: 0, cargaSon: false, punalT: 0, punalCd: 0, irrita: 0, dm: 1, total: 1, base: 1, prev: null,
  camDt: 0.016, camOk: false, imita: false, manos: new V3(), camP: new V3(), camL: new V3(), pistaTxt: '', gritoT: 0, sueloT: 0, dijo: {}, peligros: [], ondas: [], nH: new V3(0, 0, 1), pie: 0 };
// Puntos débiles: [id, nombre, parte de la vida]
const TER_SELLOS = [['lumbar', 'Cinturón', 0.3], ['nuca', 'Nuca', 0.3], ['coronilla', 'Coronilla', 0.4]];
// Ruta de escalada: [nodo, x, y, z, nx, ny, nz, punto débil], en coordenadas del nodo del modelo de Tovan (sin escalar; mira a +z)
const TER_PIERNA = [['knee', 0, -0.29, -0.17, 0, 0, -1], ['knee', 0, -0.13, -0.16, 0, 0, -1], ['knee', 0, 0.02, -0.12, 0, 0, -1], ['hip', 0, -0.15, -0.13, 0, 0, -1]];
const TER_TRONCO = [['hips', 0, -0.37, -0.44, 0, -0.3, -1], ['hips', 0, -0.12, -0.36, 0, -0.2, -1], ['spine', 0, 0.03, -0.3, 0, 0, -1, 'lumbar'],
  ['spine', -0.05, 0.24, -0.33, 0, 0, -1], ['spine', -0.05, 0.45, -0.35, 0, 0.1, -1], ['spine', -0.05, 0.63, -0.31, 0, 0.35, -1],
  ['neck', 0, 0.1, -0.2, 0, -0.1, -1, 'nuca'], ['neck', 0, 0.3, -0.3, 0, 0, -1], ['neck', 0, 0.5, -0.25, 0, 0.6, -1], ['neck', 0, 0.66, -0.03, 0, 1, 0, 'coronilla']];
const terV = [new V3(), new V3(), new V3(), new V3(), new V3()], terQ = new THREE.Quaternion(), terY = new V3(0, 1, 0);
const terBl = (o, k, v, w) => { o[k] += (v - o[k]) * w; };
const terDif = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
BOSS_CARDS.tovanerr = ['TOVAN.EXE', 'Tu copia corrupta · Ha dejado de responder', '#ff2ae0'];

/* ---------- Interfaz: pistas, gritos de técnica y la ventana del final ---------- */
const terPistaEl = document.createElement('div'); terPistaEl.id = 'terPista'; terPistaEl.hidden = true; document.body.appendChild(terPistaEl);
const terGritoEl = document.createElement('div'); terGritoEl.id = 'terGrito'; terGritoEl.hidden = true; document.body.appendChild(terGritoEl);
const terVentanaEl = document.createElement('div'); terVentanaEl.id = 'terVentana'; terVentanaEl.className = 'win'; terVentanaEl.hidden = true;
terVentanaEl.innerHTML = '<div class="tvT"><span>TOVAN.EXE</span><i>✕</i></div><div class="tvB"><b>⚠</b><p><strong>TOVAN.EXE ha dejado de funcionar.</strong>El sistema está buscando una solución al problema…</p></div><div class="tvBtns"><span>Esperar</span><span class="si">Cerrar el programa</span></div>';
document.body.appendChild(terVentanaEl);
function terGrito(txt, sub){ terGritoEl.innerHTML = `<b>${txt}</b>${sub ? `<small>${sub}</small>` : ''}`; terGritoEl.hidden = false; terGritoEl.classList.remove('on'); void terGritoEl.offsetWidth; terGritoEl.classList.add('on'); TER.gritoT = 2.3; }
function terPista(txt){ if (txt === TER.pistaTxt) return; TER.pistaTxt = txt; terPistaEl.hidden = !txt; if (txt) terPistaEl.innerHTML = txt; }
const terTactil = () => matchMedia('(pointer:coarse)').matches;
const terAgarraTecla = () => !!(keys.KeyK || keys.ShiftLeft || keys.ShiftRight || colTocaRodar || colPadRodar());
function terBotonAgarra(on){
  if (!colBtnRodar) return;
  if (on && !colBtnRodar.dataset.col){ colBtnRodar.dataset.col = colBtnRodar.textContent; colBtnRodar.textContent = 'Agarra'; }
  else if (!on && colBtnRodar.dataset.col && colAvisoEl.hidden){ colBtnRodar.textContent = colBtnRodar.dataset.col; delete colBtnRodar.dataset.col; colBtnRodar.classList.remove('tutoOjo'); }
}
// Sello de los puntos débiles: pintado al cargar (sin rnd())
const terSelloMat = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext && c.getContext('2d');
  if (g && g.beginPath && g.createRadialGradient){
    const rg = g.createRadialGradient(64, 64, 6, 64, 64, 63); rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.3, 'rgba(255,120,245,.95)'); rg.addColorStop(0.62, 'rgba(255,42,224,.6)'); rg.addColorStop(1, 'rgba(255,42,224,0)');
    g.fillStyle = rg; g.beginPath(); g.arc(64, 64, 63, 0, TAU); g.fill();
    g.strokeStyle = '#20ffe0'; g.lineWidth = 5; g.beginPath(); g.arc(64, 64, 44, 0, TAU); g.stroke(); g.lineWidth = 4;
    for (let i = 0; i < 8; i++){ const a = i / 8 * TAU; g.beginPath(); g.moveTo(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44); g.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56); g.stroke(); }
    g.fillStyle = '#1a0020'; g.font = 'bold 30px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('404', 64, 66);
  }
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter;
  return new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }); })();

/* ---------- Sonido ---------- */
Object.assign(SFX, {
  terRugido: () => { tone({ type: 'sawtooth', f0: 120, f1: 50, dur: 1.3, vol: 0.2, rv: 0.5 }); tone({ type: 'square', f0: 240, f1: 80, dur: 1.0, vol: 0.07, when: 0.05 });
    noise({ dur: 1.2, vol: 0.18, f0: 700, f1: 160, q: 0.8, rv: 0.4 }); for (let i = 0; i < 5; i++) tone({ type: 'square', f0: 880 + i * 330, f1: 440, dur: 0.05, vol: 0.05, when: 0.1 + i * 0.14 }); },
  terPaso: () => { tone({ type: 'sine', f0: 72, f1: 28, dur: 0.4, vol: 0.34 }); noise({ dur: 0.28, vol: 0.14, f0: 320, f1: 80, type: 'lowpass', q: 0.7 }); },
  terPunal: () => { noise({ dur: 0.12, vol: 0.22, f0: 4200, f1: 800, q: 1 }); tone({ type: 'square', f0: 520, f1: 130, dur: 0.18, vol: 0.12 }); tone({ type: 'square', f0: 1046, f1: 0, dur: 0.05, vol: 0.06, when: 0.07 }); },
  terRayo: () => { noise({ dur: 0.7, vol: 0.32, f0: 5200, f1: 260, type: 'highpass', q: 0.5, rv: 0.5 }); tone({ type: 'sawtooth', f0: 1300, f1: 70, dur: 0.45, vol: 0.12 }); },
  terPajaros: () => { for (let i = 0; i < 5; i++) tone({ type: 'square', f0: 2300 + (i % 3) * 420, f1: 3300, dur: 0.035, vol: 0.035, when: i * 0.045 }); noise({ dur: 0.25, vol: 0.05, f0: 6500, q: 2 }); },
  terFuego: () => { noise({ dur: 1.0, vol: 0.3, f0: 1000, f1: 180, type: 'lowpass', q: 0.6, attack: 0.05, rv: 0.3 }); tone({ type: 'sawtooth', f0: 90, f1: 50, dur: 0.8, vol: 0.1 }); },
  terAgujero: () => { tone({ type: 'sine', f0: 62, f1: 38, dur: 2.6, vol: 0.24, attack: 0.3, rv: 0.4 }); tone({ type: 'triangle', f0: 190, f1: 80, dur: 2.2, vol: 0.06, attack: 0.4 }); }
});

/* ---------- El gigante: un clon del rig de Tovan con la textura perdida ---------- */
function terMat(om){
  const U = om.uniforms, m = new THREE.ShaderMaterial({ vertexShader: om.vertexShader, fragmentShader: om.fragmentShader, side: om.side, transparent: om.transparent, defines: Object.assign({}, om.defines || {}, { GLITCH_AMP: '0.03' }),   // (a este tamaño, el temblor normal del glitch lo deshacía)
    uniforms: Object.assign({}, U, { uGlitch: { value: 1 }, uColor: { value: U.uColor.value.clone() }, uEmissive: { value: U.uEmissive.value }, uOpacity: { value: 1 }, uMap: { value: U.uMap.value }, uHasMap: { value: U.uHasMap.value } }) });
  m.vertexColors = om.vertexColors; return m;
}
const terPropio = (m, gl = 0) => { m.uniforms.uGlitch = { value: gl }; return m; };   // (el bioma corrupto pone el glitch global a 1)
function terConstruye(){
  if (TER.g) return;
  staffToBack();
  const g = new THREE.Group(); g.visible = false; scene.add(g);
  const cuerpo = P.body.clone(true); g.add(cuerpo);
  const A = [], Bc = []; P.body.traverse(o => A.push(o)); cuerpo.traverse(o => Bc.push(o));
  const mapa = new Map(); A.forEach((o, i) => mapa.set(o, Bc[i])); const q = o => mapa.get(o);
  const propios = new Map(); HERO_MATS.forEach((m, i) => { const c = terMat(m); c.uniforms.uColor.value.setHex(heroMatOrig[i][0]); c.uniforms.uEmissive.value = heroMatOrig[i][1]; propios.set(m, c); });
  for (const c of propios.values()) if (c.uniforms.uEmissive.value < 0.22) c.uniforms.uEmissive.value = 0.22;   // que se lea en el vacío oscuro (por debajo de 0,5 conserva el damero)
  propios.set(M.crystal, terMat(M.crystal)); TER.matDe = m => propios.get(m);
  for (const o of Bc){ if (!o.material) continue; const c = propios.get(o.material); if (!c){ o.visible = false; continue; } o.material = c; }
  const oculta = o => { const c = q(o); if (c) c.visible = false; };
  for (const h of Object.values(HATS)) oculta(h.g); for (const v of Object.values(GLASSES)) oculta(v); for (const v of Object.values(WEAPONS)) oculta(v);
  for (const o of [...hairTop, ...staffBase]){ const c = q(o); if (c) c.visible = true; }
  const R = TER.R = { body: cuerpo, hips: q(P.hips), spine: q(P.spine), neck: q(P.neck), ahoge: q(P.ahoge), tail: q(P.tail),
    armL: { sh: q(P.armL.sh), el: q(P.armL.el) }, armR: { sh: q(P.armR.sh), el: q(P.armR.el) }, legL: { hip: q(P.legL.hip), knee: q(P.legL.knee) }, legR: { hip: q(P.legR.hip), knee: q(P.legR.knee) },
    pelo: P.tailHair.map(q), bufanda: P.scarf.map(q) };
  R.neck.scale.set(1.45, 1.42, 1.45);
  // ojos encendidos (lo único que no lleva la textura perdida)
  const ojoM = terPropio(makeMat(0xff2a5a, { emissive: 1 }));
  TER.ojos = [-1, 1].map(s => { const o = mesh(B(0.075, 0.032, 0.03), ojoM, 0.085 * s, 0.32, 0.232, R.neck); o.rotation.z = -0.22 * s; return o; });   // [0] = el del lado del hombro derecho
  // píxeles sueltos que orbitan, como los del cubo
  const bm = [terPropio(makeMat(0xff2ae0, { emissive: 1 })), terPropio(makeMat(0x20ffe0, { emissive: 1 }))], r = TER.r;
  TER.bits = Array.from({ length: 22 }, (_, i) => { const m = mesh(B(0.06, 0.06, 0.06), bm[i % 2], 0, 0, 0, g); m.userData = { a: r() * TAU, r: 0.45 + r() * 0.35, y: 0.2 + r() * 2.0, v: 0.5 + r() * 0.8 }; return m; });
  TER.sombra = mesh(new THREE.CircleGeometry(1, 24), M.shadow, 0, 0.03, 0); TER.sombra.rotation.x = -Math.PI / 2; TER.sombra.visible = false;
  TER.g = g; g.traverse(o => { if (o.isMesh && o.visible) TER.piezas.push(o); });
  // ruta de escalada
  const ancla = (nodo, a) => ({ nodo, l: new V3(a[1], a[2], a[3]), n: new V3(a[4], a[5], a[6]).normalize(), w: new V3(), wn: new V3(), sello: a[7] || null });
  const tronco = TER_TRONCO.map(a => ancla(R[a[0]], a));
  TER.rutas = [R.legL, R.legR].map(L => [...TER_PIERNA.map(a => ancla(a[0] === 'knee' ? L.knee : L.hip, a)), ...tronco]);
  TER.anclas = [...new Set(TER.rutas.flat())];
  // avisos (círculos y carril), brazos de goma, ondas y agujero
  const telM = () => terPropio(makeMat(0xff2a6a, { emissive: 1, opacity: 0.32 })), aroM = terPropio(makeMat(0xffd0f4, { emissive: 1 }));
  TER.circ = Array.from({ length: 14 }, () => { const c = new THREE.Group(); scene.add(c); c.visible = false;
    const f = mesh(new THREE.CircleGeometry(1, 32), telM(), 0, 0, 0, c); f.rotation.x = -Math.PI / 2;
    const a = mesh(new THREE.RingGeometry(0.92, 1, 40), aroM, 0, 0.01, 0, c); a.rotation.x = -Math.PI / 2; c.userData = { f, t: 0, t0: 1 }; return c; });
  TER.carril = new THREE.Group(); scene.add(TER.carril); TER.carril.visible = false;
  { const f = mesh(new THREE.PlaneGeometry(1, 1), telM(), 0, 0, 0.5, TER.carril); f.rotation.x = -Math.PI / 2; const b = mesh(new THREE.PlaneGeometry(1, 1), telM(), 0, 0.01, 0.5, TER.carril); b.rotation.x = -Math.PI / 2;
    TER.carril.userData = { f, b }; }
  const brazoM = terMat(M.skin), guanteM = terMat(M.glove), tuboG = new THREE.CylinderGeometry(1, 1, 1, 8); tuboG.translate(0, 0.5, 0);   // goma: piel estirada y el guante, más claros
  terPropio(brazoM); terPropio(guanteM); brazoM.uniforms.uEmissive.value = 0.45; guanteM.uniforms.uEmissive.value = 0.5; guanteM.uniforms.uColor.value.setHex(0xfff4fc);   // sin damero: si no, se confundían con el cuerpo
  TER.gomas = Array.from({ length: 4 }, () => { const t = mesh(tuboG, brazoM, 0, 0, 0); const p = mesh(B(1.8, 1.7, 1.8), guanteM, 0, 0, 0); t.visible = p.visible = false; return { t, p }; });
  const ondaM = terPropio(makeMat(0xff2ae0, { emissive: 1, opacity: 0.6, side: THREE.DoubleSide })), ondaG = new THREE.CylinderGeometry(1, 1, 0.7, 56, 1, true); ondaG.translate(0, 0.35, 0);
  TER.ondaPool = Array.from({ length: 2 }, () => { const m = mesh(ondaG, ondaM, 0, 0, 0); m.visible = false; return m; });
  const ag = new THREE.Group(); scene.add(ag); ag.visible = false; TER.agujero = ag;
  mesh(new THREE.IcosahedronGeometry(1.25, 2), terPropio(makeMat(0x000000, { emissive: 1 })), 0, 0, 0, ag);
  const disco = mesh(new THREE.RingGeometry(1.5, 3.6, 48), terPropio(makeMat(0xff4af0, { emissive: 1, opacity: 0.8, side: THREE.DoubleSide })), 0, 0, 0, ag); disco.rotation.x = -Math.PI / 2 + 0.35;
  const halo = mesh(new THREE.IcosahedronGeometry(1.9, 2), terPropio(makeMat(0x8a20ff, { emissive: 1, opacity: 0.22 })), 0, 0, 0, ag);
  ag.userData = { disco, halo };
  TER.hiken = new THREE.Sprite(punoMat); TER.hiken.visible = false; scene.add(TER.hiken);
  TER.chidori = new THREE.Sprite(chidoriMat); TER.chidori.visible = false; scene.add(TER.chidori);
  TER.sellos = TER_SELLOS.map(([id, n, pct]) => { const s = new THREE.Sprite(terSelloMat.clone()); s.visible = false; scene.add(s); return { id, n, pct, spr: s, a: TER.anclas.find(a => a.sello === id), hp: 1, max: 1, roto: false }; });
}

/* ---------- Fuera del mapa: plataforma de depuración en el vacío ---------- */
function terEscenario(){
  if (TER.set) return;
  const r = TER.r, set = new THREE.Group(); set.visible = false; scene.add(set); TER.set = set;
  const losaM = terPropio(makeMat(0x1c0c26)), missM = terPropio(makeMat(0xffffff, { map: missTex })), cuboM = terPropio(makeMat(0x20ffe0, { emissive: 0.6 }));
  mesh(B(44, 0.6, 44), losaM, 0, -0.3, 0, set);
  const rej = new THREE.GridHelper(44, 22, 0xff2ae0, 0x5a1a6a); rej.position.y = 0.012; set.add(rej);
  const aro = mesh(new THREE.RingGeometry(TER_ARENA + 0.25, TER_ARENA + 0.55, 72), terPropio(makeMat(0x20ffe0, { emissive: 1, opacity: 0.55 })), 0, 0.03, 0, set); aro.rotation.x = -Math.PI / 2;
  TER.losas = [];
  for (let i = 0; i < 28; i++){ const lado = i % 4, t = r() * 2 - 1, fuera = 22.5 + r() * 4, s = 1 + r() * 2.6;
    const x = lado < 2 ? (lado ? 1 : -1) * fuera : t * 21, z = lado >= 2 ? (lado === 2 ? 1 : -1) * fuera : t * 21;
    const m = mesh(B(s, s * 0.45, s), r() < 0.5 ? missM : losaM, x, -1 - r() * 9, z, set); m.userData = { v: 0.25 + r() * 0.5, y0: m.position.y, rx: (r() - 0.5) * 0.5, rz: (r() - 0.5) * 0.5 }; TER.losas.push(m); }
  TER.trozos = [];
  for (let i = 0; i < 36; i++){ const a = r() * TAU, d = 32 + r() * 48, s = 1.5 + r() * 6;
    const m = mesh(B(s, s * (0.3 + r()), s * (0.5 + r())), [missM, losaM, cuboM][i % 3], Math.cos(a) * d, -16 + r() * 44, Math.sin(a) * d, set);
    m.rotation.set(r() * TAU, r() * TAU, r() * TAU); m.userData = { w: (r() - 0.5) * 0.25, y0: m.position.y, f: r() * TAU }; TER.trozos.push(m); }
}
function terMonta(){
  if (TER.montado) return; terEscenario(); TER.montado = true;
  const U = skyMat.uniforms;
  TER.prev = { ARENA, amb: ambMode, fogN: shared.uFogNear.value, fogF: shared.uFogFar.value, fogC: shared.uFogCol.value.getHex(), luz: shared.uLightCol.value.clone(), ambC: shared.uAmb.value.getHex(),
    top: U.uTop.value.getHex(), mid: U.uMid.value.getHex(), hor: U.uHor.value.getHex(), moon: U.uMoonOn.value, stars: U.uStars.value, glitch: shared.uGlitch.value, ocultos: [] };
  const lista = [...BIOMES.map(b => b.group), ground, rune, braz, toroBig, homeGroup, renderGroup, ...brazRuins, ...mountainsList, ...ambP];
  for (const o of lista) if (o && o.visible){ o.visible = false; TER.prev.ocultos.push(o); }
  ambMode = null; for (const p of pickups) scene.remove(p.m); pickups.length = 0;
  ARENA = TER_ARENA; shared.uGlitch.value = 0;
  U.uTop.value.setHex(0x020006); U.uMid.value.setHex(0x0c0418); U.uHor.value.setHex(0x40104e); U.uMoonOn.value = 0; U.uStars.value = 1;
  shared.uFogCol.value.setHex(0x0c0418); shared.uFogNear.value = 34; shared.uFogFar.value = 110;
  shared.uLightCol.value.setHex(0xffe4ff).multiplyScalar(0.95); shared.uAmb.value.setHex(0x6a5096);
  TER.set.visible = true; TER.sombra.visible = true; document.body.classList.add('terOn'); errWin.hidden = true; TER.camOk = false;
}
function terDesmonta(){
  if (!TER.montado) return; TER.montado = false;
  const P_ = TER.prev, U = skyMat.uniforms;
  for (const o of P_.ocultos) o.visible = true;
  ambMode = P_.amb; ARENA = P_.ARENA; shared.uGlitch.value = P_.glitch;
  U.uTop.value.setHex(P_.top); U.uMid.value.setHex(P_.mid); U.uHor.value.setHex(P_.hor); U.uMoonOn.value = P_.moon; U.uStars.value = P_.stars;
  shared.uFogCol.value.setHex(P_.fogC); shared.uFogNear.value = P_.fogN; shared.uFogFar.value = P_.fogF; shared.uLightCol.value.copy(P_.luz); shared.uAmb.value.setHex(P_.ambC);
  TER.set.visible = false; TER.sombra.visible = false; document.body.classList.remove('terOn');
}
function terColoca(x, z, yaw, esc){ TER.g.position.set(x, 0, z); TER.yaw = yaw; TER.g.rotation.y = yaw; TER.esc = esc; TER.g.scale.setScalar(esc); }

/* ---------- Animación del gigante ---------- */
function terPoseBase(){
  const R = TER.R, w = TER.walkW, s = Math.sin(TER.ph), c = Math.cos(TER.ph), br = Math.sin(TER.tt * 1.6);
  R.body.position.set(0, 0.62, 0); R.body.rotation.set(0, 0, 0); R.body.scale.setScalar(1);
  R.hips.position.y = 0.67 + (Math.abs(c) - 0.6) * 0.06 * w + br * 0.006; R.hips.rotation.set(0, s * 0.08 * w, 0);
  R.spine.rotation.set(0.05 + br * 0.015 + 0.06 * w, -s * 0.1 * w, 0);
  R.legL.hip.rotation.set(-s * 0.5 * w, 0, 0); R.legR.hip.rotation.set(s * 0.5 * w, 0, 0);
  R.legL.knee.rotation.set(w * (0.08 + Math.max(0, c) * 0.8), 0, 0); R.legR.knee.rotation.set(w * (0.08 + Math.max(0, -c) * 0.8), 0, 0);
  R.armL.sh.rotation.set(s * 0.42 * w + br * 0.03, 0, -0.16); R.armR.sh.rotation.set(-s * 0.42 * w + br * 0.03, 0, 0.16);
  R.armL.el.rotation.set(-0.25 - 0.3 * w, 0, 0); R.armR.el.rotation.set(-0.25 - 0.3 * w, 0, 0);
  // mira a Tovan
  const hp = hero.position, G = TER.g.position, dx = hp.x - G.x, dz = hp.z - G.z, d = Math.hypot(dx, dz);
  const cabY = 2.1 * TER.esc, ny = clamp(terDif(Math.atan2(dx, dz), TER.yaw), -0.75, 0.75), nx = clamp(Math.atan2(cabY - hp.y - 1, Math.max(1, d)) * 0.55, -0.2, 0.55);
  R.neck.rotation.set(TER.trepa ? 0.1 : nx, TER.trepa ? 0 : ny, 0);
  R.pelo.forEach((p, i) => { p.rotation.set((i ? 0.12 : 0.35) + Math.sin(TER.tt * 2.6 - i) * 0.08, 0, Math.sin(TER.tt * 1.9 - i) * 0.08); });
  R.bufanda.forEach((p, i) => { p.rotation.set(0.15 + Math.sin(TER.tt * 3.1 - i * 1.1) * 0.12, 0, Math.sin(TER.tt * 2.3 - i) * 0.08); });
}
const TER_POSES = {
  agacha(R, w){ terBl(R.body.position, 'y', 0.46, w); for (const L of [R.legL, R.legR]){ terBl(L.hip.rotation, 'x', -1.0, w); terBl(L.knee.rotation, 'x', 1.7, w); }
    terBl(R.spine.rotation, 'x', 0.55, w); terBl(R.armL.sh.rotation, 'x', 0.7, w); terBl(R.armR.sh.rotation, 'x', 0.7, w); terBl(R.neck.rotation, 'x', -0.35, w); },
  salto(R, w){ terBl(R.legL.hip.rotation, 'x', -1.3, w); terBl(R.legL.knee.rotation, 'x', 1.7, w); terBl(R.legR.hip.rotation, 'x', -0.4, w); terBl(R.legR.knee.rotation, 'x', 1.2, w);
    terBl(R.armL.sh.rotation, 'z', -1.6, w); terBl(R.armR.sh.rotation, 'z', 1.6, w); terBl(R.spine.rotation, 'x', -0.1, w); },
  rodilla(R, w){ terBl(R.body.position, 'y', 0.33, w); terBl(R.legL.hip.rotation, 'x', 0.1, w); terBl(R.legL.knee.rotation, 'x', 1.62, w); terBl(R.legR.hip.rotation, 'x', -1.45, w); terBl(R.legR.knee.rotation, 'x', 1.5, w);
    terBl(R.spine.rotation, 'x', 0.72, w); terBl(R.neck.rotation, 'x', -0.55, w); terBl(R.neck.rotation, 'y', 0, w);
    terBl(R.armL.sh.rotation, 'x', -0.75, w); terBl(R.armL.sh.rotation, 'z', -0.32, w); terBl(R.armL.el.rotation, 'x', -0.05, w);
    terBl(R.armR.sh.rotation, 'x', 0.6, w); terBl(R.armR.sh.rotation, 'z', 0.95, w); terBl(R.armR.el.rotation, 'x', -0.35, w); },
  rugido(R, w){ terBl(R.spine.rotation, 'x', -0.3, w); terBl(R.neck.rotation, 'x', -0.55, w); for (const [A, s] of [[R.armL, -1], [R.armR, 1]]){ terBl(A.sh.rotation, 'x', 0.5, w); terBl(A.sh.rotation, 'z', 0.95 * s, w); terBl(A.el.rotation, 'x', -0.6, w); } },
  invoca(R, w){ for (const [A, s] of [[R.armL, -1], [R.armR, 1]]){ terBl(A.sh.rotation, 'z', 2.5 * s, w); terBl(A.sh.rotation, 'x', -0.25, w); terBl(A.el.rotation, 'x', -0.15, w); } terBl(R.spine.rotation, 'x', -0.18, w); terBl(R.neck.rotation, 'x', -0.4, w); },
  carga(R, w){ terBl(R.spine.rotation, 'y', -0.6, w); terBl(R.armL.sh.rotation, 'x', 0.9, w); terBl(R.armL.sh.rotation, 'z', -0.35, w); terBl(R.armL.el.rotation, 'x', -1.7, w);
    terBl(R.armR.sh.rotation, 'x', -1.2, w); terBl(R.armR.el.rotation, 'x', -0.6, w); terBl(R.legL.hip.rotation, 'x', 0.35, w); terBl(R.legR.hip.rotation, 'x', -0.45, w); terBl(R.legR.knee.rotation, 'x', 0.5, w); },
  golpe(R, w){ terBl(R.spine.rotation, 'y', 0.55, w); terBl(R.spine.rotation, 'x', 0.25, w); terBl(R.armL.sh.rotation, 'x', -1.62, w); terBl(R.armL.sh.rotation, 'z', 0.05, w); terBl(R.armL.el.rotation, 'x', -0.02, w);
    terBl(R.armR.sh.rotation, 'x', 0.6, w); terBl(R.armR.el.rotation, 'x', -1.2, w); terBl(R.legL.hip.rotation, 'x', 0.4, w); terBl(R.legR.hip.rotation, 'x', -0.6, w); terBl(R.legR.knee.rotation, 'x', 0.5, w); },
  chidori(R, w){ terBl(R.body.position, 'y', 0.52, w); for (const L of [R.legL, R.legR]){ terBl(L.hip.rotation, 'x', -0.6, w); terBl(L.knee.rotation, 'x', 1.0, w); }
    terBl(R.spine.rotation, 'x', 0.42, w); terBl(R.armR.sh.rotation, 'x', -0.7, w); terBl(R.armR.sh.rotation, 'z', 0.2, w); terBl(R.armR.el.rotation, 'x', -1.0, w);
    terBl(R.armL.sh.rotation, 'x', -0.9, w); terBl(R.armL.sh.rotation, 'z', 0.45, w); terBl(R.armL.el.rotation, 'x', -1.1, w); terBl(R.neck.rotation, 'x', -0.2, w); },
  dolor(R, w){ terBl(R.spine.rotation, 'x', -0.28, w); terBl(R.neck.rotation, 'x', -0.5, w); terBl(R.armL.sh.rotation, 'z', -0.8, w); terBl(R.armR.sh.rotation, 'z', 0.8, w); }
};
function terPisa(R, L, w){ terBl(L.hip.rotation, 'x', -1.25, w); terBl(L.knee.rotation, 'x', 1.55, w); terBl(R.spine.rotation, 'x', -0.08, w); terBl(R.armL.sh.rotation, 'z', -0.7, w); terBl(R.armR.sh.rotation, 'z', 0.7, w); }
function terPlanta(R, L, w){ terBl(L.hip.rotation, 'x', -0.62, w); terBl(L.knee.rotation, 'x', 0.32, w); terBl(R.spine.rotation, 'x', 0.3, w); terBl(R.body.position, 'y', 0.56, w); }
function terAnima(et){
  const G = TER.g.position;
  if (!TER.imita) terPoseBase();
  if (TER.atq && TER_ATQ[TER.atq.tipo].pose) TER_ATQ[TER.atq.tipo].pose(TER.atq, TER.R);
  if (TER.tumba > 0){ const k = Math.min(1, TER.tumbaT / 0.25) * Math.min(1, TER.tumba / 0.5); TER_POSES.rodilla(TER.R, k); }
  if (TER.sac){ const S = TER.sac, k = S.t < S.aviso ? 0 : Math.min(1, (S.t - S.aviso) / 0.15) * Math.min(1, (S.aviso + S.dur - S.t) / 0.2), f = S.fuerte ? 1.4 : 1;
    if (S.t < S.aviso) TER_POSES.rugido(TER.R, Math.min(1, S.t / 0.3) * 0.6);
    TER.R.spine.rotation.z += Math.sin(TER.tt * 15) * 0.32 * k * f; TER.R.spine.rotation.y += Math.sin(TER.tt * 11 + 1) * 0.3 * k * f;
    TER.R.hips.rotation.z += Math.sin(TER.tt * 13) * 0.12 * k * f; TER.R.neck.rotation.z += Math.sin(TER.tt * 17) * 0.35 * k * f; }
  if (TER.dolor > 0) TER_POSES.dolor(TER.R, Math.min(1, TER.dolor * 3));
  TER.g.rotation.y = TER.yaw;
  // píxeles y sombra
  for (const b of TER.bits){ const u = b.userData; u.a += et * u.v; b.position.set(Math.cos(u.a) * u.r, u.y + Math.sin(TER.tt * 2 + u.a) * 0.05, Math.sin(u.a) * u.r); b.rotation.x += et * 3; b.rotation.y += et * 2; }
  TER.sombra.position.set(G.x, 0.03, G.z); TER.sombra.scale.setScalar(TER.esc * 0.75 * Math.max(0.3, 1 - G.y / 20));
  TER.g.updateMatrixWorld(true);
  for (const a of TER.anclas){ a.w.copy(a.l).applyMatrix4(a.nodo.matrixWorld); a.wn.copy(a.n).transformDirection(a.nodo.matrixWorld); }
}
// Posición de un punto del rig si la pierna L estuviera plantada (para el aviso del pisotón)
function terPiePlantado(L){
  const hx = L.hip.rotation.x, kx = L.knee.rotation.x; L.hip.rotation.x = -0.62; L.knee.rotation.x = 0.32; TER.R.body.position.y = 0.56;
  TER.g.updateMatrixWorld(true); const v = L.knee.localToWorld(new V3(0, -0.28, 0.08));
  L.hip.rotation.x = hx; L.knee.rotation.x = kx; TER.R.body.position.y = 0.62; TER.g.updateMatrixWorld(true); return v;
}
const terMano = (A, v) => A.el.localToWorld(v.set(0, -0.3, 0.02));

/* ---------- Avisos, golpes y peligros ---------- */
function terCirculo(x, z, r, t0){ const c = TER.circ.find(q => !q.visible); if (!c) return null; c.visible = true; c.position.set(x, 0.05, z); c.scale.setScalar(r); c.userData.t = 0; c.userData.t0 = t0; c.userData.f.scale.setScalar(0.02); return c; }
function terCirculosTick(et){ for (const c of TER.circ) if (c.visible){ const u = c.userData; u.t += et; const k = Math.min(1, u.t / u.t0); u.f.scale.setScalar(Math.max(0.02, k)); if (u.t >= u.t0 + 0.12) c.visible = false; } }
function terGolpe(x, z, r, dmg, alto = 1.5){
  if (TER.trepa || player.dead) return false; const hp = hero.position;
  if (hp.y < alto && Math.hypot(hp.x - x, hp.z - z) < r){ return hurtPlayer(Math.round(dmg * TER.dm), x, z, 7) === 'hit'; }
  return false;
}
function terImpacto(x, z, r, col = 0xff2ae0){
  ringFx(x, z, col, 0.3, r * 1.25, 0.45); ringFx(x, z, 0xffffff, 0.2, r * 0.8, 0.3, 0.1); puffAt(x, z, 14, r * 0.8, 0x6a3a7a);
  for (let i = 0; i < 16; i++){ const a = rnd() * TAU, s = 3 + rnd() * 5; spawnFx(x + Math.cos(a) * r * 0.5, 0.3, z + Math.sin(a) * r * 0.5, Math.cos(a) * s, 3 + rnd() * 5, Math.sin(a) * s, i % 3 ? 0xff2ae0 : i % 2 ? 0x20ffe0 : 0x111111, 0.22, 0.8, 12, 0); }
  const d = Math.hypot(hero.position.x - x, hero.position.z - z); shake = Math.max(shake, clamp(1.1 - d / 22, 0.25, 0.9));
}
function terOnda(x, z, r0){ const m = TER.ondaPool.find(o => !o.visible); if (!m) return; m.visible = true; m.position.set(x, 0, z); m.scale.set(r0, 1, r0); TER.ondas.push({ m, x, z, r: r0, toca: false }); }
function terOndasTick(et){
  for (let i = TER.ondas.length - 1; i >= 0; i--){ const o = TER.ondas[i]; o.r += et * 9.5; o.m.scale.set(o.r, 1, o.r); o.m.material.uniforms.uOpacity.value = 0.6 * clamp(1 - (o.r - 12) / 10, 0, 1);
    const hp = hero.position, d = Math.hypot(hp.x - o.x, hp.z - o.z);
    if (!o.toca && Math.abs(d - o.r) < 0.6 && hp.y < 0.6 && !TER.trepa){ o.toca = true; if (hurtPlayer(Math.round(10 * TER.dm), o.x, o.z, 6) === 'hit'){ vy = 4; grounded = false; } }
    if (o.r > 22){ o.m.visible = false; TER.ondas.splice(i, 1); } }
}
function terPeligrosFuera(){
  for (const c of TER.circ) c.visible = false; TER.carril.visible = false;
  for (const o of TER.ondas) o.m.visible = false; TER.ondas.length = 0;
  for (const g of TER.gomas){ g.t.visible = g.p.visible = false; }
  TER.agujero.visible = false; TER.hiken.visible = false; TER.chidori.visible = false;
  for (const p of TER.peligros) if (p.cintas) p.cintas.forEach(tintaSuelta); TER.peligros.length = 0;
  if (TER.atq && TER.atq.cintas){ TER.atq.cintas.forEach(tintaSuelta); TER.atq.cintas = null; }
}
function terPeligrosTick(et){
  for (let i = TER.peligros.length - 1; i >= 0; i--){ const p = TER.peligros[i]; p.t += et;
    if (p.tipo === 'rayo'){ const k = p.t / 0.32; p.cintas.forEach((c, j) => { tintaPinta(c, p.P[j], 0, 1, () => (j ? 0.7 : 1.4) * (1 - k * 0.6)); c.mat.uniforms.uAlpha.value = 1 - k; }); if (k >= 1){ p.cintas.forEach(tintaSuelta); TER.peligros.splice(i, 1); } } }
}

/* ---------- Las técnicas (versiones gigantes de los poderes de Tovan) ---------- */
const TER_ATQ = {
  pisoton: { dur: 3.0,
    empieza(a){ const R = TER.R, hp = hero.position;
      const dL = R.legL.knee.getWorldPosition(terV[1]).distanceTo(hp), dR = R.legR.knee.getWorldPosition(terV[2]).distanceTo(hp);
      a.L = dL < dR ? R.legL : R.legR; a.c = terPiePlantado(a.L); terCirculo(a.c.x, a.c.z, 2.5, 0.95); play('bruteWarn'); },
    tick(a){ if (a.t >= 1.0 && !a.hecho){ a.hecho = true; terGolpe(a.c.x, a.c.z, 2.5, 12); terImpacto(a.c.x, a.c.z, 2.5); play('terPaso'); play('boom'); } },
    pose(a, R){ const t = a.t; if (t < 0.95) terPisa(R, a.L, smooth(Math.min(1, t / 0.55)));
      else if (t < 1.08){ terPisa(R, a.L, 1 - (t - 0.95) / 0.13); terPlanta(R, a.L, (t - 0.95) / 0.13); }
      else terPlanta(R, a.L, t < 2.5 ? 1 : 1 - smooth((t - 2.5) / 0.5)); } },
  aterrizaje: { dur: 6.0,
    empieza(a){ const hp = hero.position, G = TER.g.position, r = Math.hypot(hp.x, hp.z), lim = TER_ARENA - 3.5;
      a.o = G.clone(); a.d = new V3(hp.x * Math.min(1, lim / Math.max(0.01, r)), 0, hp.z * Math.min(1, lim / Math.max(0.01, r))); a.yaw = Math.atan2(a.d.x - G.x, a.d.z - G.z);
      if (Math.hypot(a.d.x - G.x, a.d.z - G.z) < 1) a.yaw = TER.yaw;
      terCirculo(a.d.x, a.d.z, 3.6, 1.55); terGrito('¡ATERRIZAJE DE SUPERHÉROE!', 'Salta la onda expansiva'); play('terRugido'); },
    tick(a){ const t = a.t, G = TER.g.position; TER.yaw = lerpAngle(TER.yaw, a.yaw, 0.2);
      if (t > 0.55 && t < 1.55){ const k = (t - 0.55) / 1.0; G.set(lerp(a.o.x, a.d.x, k), Math.sin(Math.PI * k) * 10, lerp(a.o.z, a.d.z, k)); if (!a.sube){ a.sube = true; play('jump'); puffAt(a.o.x, a.o.z, 12, 3); } }
      if (t >= 1.55 && !a.hecho){ a.hecho = true; G.set(a.d.x, 0, a.d.z); terGolpe(a.d.x, a.d.z, 3.6, 14); terImpacto(a.d.x, a.d.z, 3.6); terOnda(a.d.x, a.d.z, 3.2);
        play('boom'); play('terPaso'); play('bossSlam'); flash('#ff2ae0', 0.3); shake = Math.max(shake, 1.0); hitStop = 0.06; }
      if (t > 2.0 && !a.dijo && !TER.trepa){ a.dijo = true; lumenTip('ter_rodillas', '¡Ahora! ¡Está de rodillas: agárrate a su pierna!'); } },
    pose(a, R){ const t = a.t; if (t < 0.55) TER_POSES.agacha(R, smooth(t / 0.4)); else if (t < 1.55) TER_POSES.salto(R, Math.min(1, (t - 0.55) / 0.2) * Math.min(1, (1.55 - t) / 0.12 + 0.3));
      else TER_POSES.rodilla(R, Math.min(1, (t - 1.55) / 0.1) * (t > 5.2 ? 1 - smooth((t - 5.2) / 0.8) : 1)); } },
  gatling: { dur: 5.2,
    empieza(a){ a.golpes = Array.from({ length: 12 }, (_, i) => ({ at: 1.5 + i * 0.27, lado: i % 2, g: TER.gomas[i % 4], ci: null, x: 0, z: 0, hecho: false }));
      terGrito('¡GOMU GOMU NO… GIGA GATLING!', 'Brazos de goma'); play('terRugido'); },
    tick(a){ const t = a.t, R = TER.R, hp = hero.position, G = TER.g.position;
      TER.yaw = lerpAngle(TER.yaw, Math.atan2(hp.x - G.x, hp.z - G.z), 0.06);
      for (const p of a.golpes){
        if (!p.ci && t >= p.at - 0.62){ const k = p === a.golpes[0] ? 0 : 0.3 + rnd() * 2.2, an = rnd() * TAU; p.x = hp.x + Math.cos(an) * k; p.z = hp.z + Math.sin(an) * k;
          const d = Math.hypot(p.x, p.z); if (d > TER_ARENA - 0.5){ p.x *= (TER_ARENA - 0.5) / d; p.z *= (TER_ARENA - 0.5) / d; } p.ci = terCirculo(p.x, p.z, 1.6, 0.62); }
        const g = p.g, k = t < p.at - 0.13 ? -1 : t < p.at ? (t - (p.at - 0.13)) / 0.13 : t < p.at + 0.16 ? 1 : 1 - (t - p.at - 0.16) / 0.18;
        if (p.ci && k >= 0 && !(t > p.at + 0.34)){
          const A = p.lado ? R.armR : R.armL, o = A.sh.getWorldPosition(terV[0]), f = terV[1].set(p.x, 0.75, p.z), fin = terV[2].lerpVectors(o, f, clamp(k, 0, 1));
          const L = Math.max(0.1, o.distanceTo(fin)); g.t.visible = g.p.visible = true; g.t.position.copy(o); g.t.scale.set(0.5, L, 0.5);
          if (k > 0 && k < 1 && rnd() < 0.7) spawnFx(fin.x, fin.y, fin.z, (rnd() - 0.5) * 2, 1, (rnd() - 0.5) * 2, 0xffffff, 0.2, 0.25, 0, 1);
          g.t.quaternion.setFromUnitVectors(terY, terV[3].subVectors(fin, o).normalize()); g.p.position.copy(fin); g.p.quaternion.copy(g.t.quaternion);
        } else if (p.ci && t > p.at + 0.34) g.t.visible = g.p.visible = false;   // (si el siguiente que usa este brazo ya ha salido, lo vuelve a enseñar después)
        if (!p.hecho && t >= p.at){ p.hecho = true; terGolpe(p.x, p.z, 1.6, 8); ringFx(p.x, p.z, 0xffffff, 0.3, 2.0, 0.3); puffAt(p.x, p.z, 6, 1.2, 0x6a3a7a); play('slam'); shake = Math.max(shake, 0.35); }
      }
      if (t > a.golpes[a.golpes.length - 1].at + 0.4) for (const g of TER.gomas){ g.t.visible = g.p.visible = false; } },
    fin(){ for (const g of TER.gomas){ g.t.visible = g.p.visible = false; } },
    pose(a, R){ const t = a.t, w = Math.min(1, t / 0.4) * Math.min(1, (a.dur - t) / 0.5), alt = Math.sin(t * 11.6) > 0;
      terBl(R.spine.rotation, 'x', 0.3, w); terBl(R.legL.hip.rotation, 'x', 0.3, w); terBl(R.legR.hip.rotation, 'x', -0.55, w); terBl(R.legR.knee.rotation, 'x', 0.5, w);
      if (t > 1.3){ terBl(R.armL.sh.rotation, 'x', alt ? -1.55 : -0.6, w); terBl(R.armR.sh.rotation, 'x', alt ? -0.6 : -1.55, w); terBl(R.spine.rotation, 'y', alt ? 0.3 : -0.3, w * 0.6); }
      else { terBl(R.armL.sh.rotation, 'x', 0.5, w); terBl(R.armR.sh.rotation, 'x', 0.5, w); terBl(R.armL.el.rotation, 'x', -1.6, w); terBl(R.armR.el.rotation, 'x', -1.6, w); } } },
  hiken: { dur: 3.7,
    empieza(a){ const hp = hero.position, G = TER.g.position; a.yaw = Math.atan2(hp.x - G.x, hp.z - G.z); a.dx = Math.sin(a.yaw); a.dz = Math.cos(a.yaw);
      const C = TER.carril, u = C.userData; C.visible = true; C.position.set(G.x + a.dx * 1.5, 0.05, G.z + a.dz * 1.5); C.rotation.y = a.yaw; C.scale.set(3.8, 1, 1);
      u.b.scale.set(1, 34, 1); u.b.position.z = 17; u.f.scale.set(1, 0.01, 1); u.f.position.z = 0;
      terGrito('¡PUÑO DE FUEGO… GIGA!', 'Apártate de la franja'); play('terFuego'); },
    tick(a, et){ const t = a.t, C = TER.carril, u = C.userData, R = TER.R; TER.yaw = lerpAngle(TER.yaw, a.yaw, 0.15);
      if (t < 1.35){ const k = t / 1.35; u.f.scale.set(1, 34 * k, 1); u.f.position.z = 17 * k; terMano(R.armL, terV[0]);
        if (rnd() < 0.7) spawnFx(terV[0].x + (rnd() - 0.5), terV[0].y + (rnd() - 0.5), terV[0].z + (rnd() - 0.5), 0, 2, 0, rnd() < 0.5 ? 0xffa020 : 0xff5a10, 0.25, 0.5, -2, 1.5); }
      if (t >= 1.35 && !a.lanza){ a.lanza = true; C.visible = false; terMano(R.armL, terV[0]); a.o = terV[0].clone(); a.o.y = Math.max(2, a.o.y); a.p = a.o.clone(); a.prev = 0;
        a.cintas = [tintaCoge(LLAMA, 0, 'fuego'), tintaCoge(LLAMA_VIVA, 0, 'fuego')]; TER.hiken.visible = true; play('terFuego'); play('specialBoom'); flash('#ffb060', 0.25); shake = Math.max(shake, 0.6); }
      if (a.lanza && TER.hiken.visible){ const L = Math.min(36, (t - 1.35) * 34);
        a.p.set(a.o.x + a.dx * L, lerp(a.o.y, 1.6, Math.min(1, L / 8)), a.o.z + a.dz * L); TER.hiken.position.copy(a.p); TER.hiken.scale.set(7, 5.2, 1);
        const P_ = (s, v) => v.lerpVectors(a.o, a.p, s).add(terV[4].set(0, Math.sin(s * 9 + time * 20) * 0.25, 0));
        a.cintas.forEach((c, j) => tintaPinta(c, P_, Math.max(0, 1 - 9 / Math.max(9, L)), 1, k => (j ? 2.2 : 3.6) * (0.3 + 0.7 * k)));
        const hp = hero.position, rx = hp.x - a.o.x, rz = hp.z - a.o.z, lo = rx * a.dx + rz * a.dz, la = Math.abs(rx * a.dz - rz * a.dx);
        if (!a.dio && la < 2.1 && lo > a.prev - 1 && lo < L + 1 && hp.y < 3){ a.dio = true; terGolpe(hp.x, hp.z, 1, 15, 3); }
        a.prev = L; if (rnd() < 0.8) spawnFx(a.p.x, a.p.y, a.p.z, (rnd() - 0.5) * 3, 1 + rnd() * 2, (rnd() - 0.5) * 3, rnd() < 0.5 ? 0xffd060 : 0xff6a14, 0.3, 0.6, -1, 1);
        if (L >= 36){ TER.hiken.visible = false; a.cintas.forEach(tintaSuelta); a.cintas = null; } } },
    fin(a){ TER.carril.visible = false; TER.hiken.visible = false; if (a.cintas){ a.cintas.forEach(tintaSuelta); a.cintas = null; } },
    pose(a, R){ const t = a.t; if (t < 1.35) TER_POSES.carga(R, smooth(Math.min(1, t / 0.6))); else TER_POSES.golpe(R, Math.min(1, (t - 1.35) / 0.1) * (t > 3.0 ? 1 - smooth((t - 3.0) / 0.7) : 1)); } },
  chidori: { dur: 5.6,
    empieza(a){ a.rayos = Array.from({ length: 6 }, (_, i) => ({ at: 1.9 + i * 0.52, ci: null, x: 0, z: 0, hecho: false })); a.pio = 0;
      a.cintas = [tintaCoge(RAYO_AZUL, 0, 'rayo'), tintaCoge(RAYO_CIAN, 0, 'rayo')]; const c0 = new V3();
      a.P = a.cintas.map((_, j) => rayoTiembla((s, v) => { terMano(TER.R.armR, c0); const an = s * TAU * 1.5 + j * 2 + time * 9; return v.set(c0.x + Math.cos(an) * (1.2 + s), c0.y + Math.sin(s * 7 + j) * 0.8, c0.z + Math.sin(an) * (1.2 + s)); }, 12, 0.4));
      terGrito('¡MIL PÁJAROS… GIGA!', 'No te quedes quieto'); play('kameCharge'); },
    tick(a, et){ const t = a.t, hp = hero.position; terMano(TER.R.armR, terV[0]);
      if (t < 4.9){ TER.chidori.visible = true; TER.chidori.position.copy(terV[0]); const s = 3.2 + Math.sin(time * 40) * 0.5; TER.chidori.scale.set(s, s, 1);
        if (a.cintas) a.cintas.forEach((c, j) => tintaPinta(c, a.P[j], 0, 1, () => j ? 0.35 : 0.6));
        a.pio -= et; if (a.pio <= 0){ a.pio = 0.16; play('terPajaros'); } }
      else { TER.chidori.visible = false; if (a.cintas){ a.cintas.forEach(tintaSuelta); a.cintas = null; } }
      for (const b of a.rayos){
        if (!b.ci && t >= b.at - 0.68){ const lead = typeof MOV11 !== 'undefined' && MOV11 ? 0.35 : 0; b.x = hp.x + (lead ? MOV11.vx * lead : 0); b.z = hp.z + (lead ? MOV11.vz * lead : 0);
          const d = Math.hypot(b.x, b.z); if (d > TER_ARENA - 0.5){ b.x *= (TER_ARENA - 0.5) / d; b.z *= (TER_ARENA - 0.5) / d; } b.ci = terCirculo(b.x, b.z, 1.9, 0.68); }
        if (!b.hecho && t >= b.at){ b.hecho = true; const x = b.x, z = b.z, top = new V3(x + (rnd() - 0.5) * 4, 30, z + (rnd() - 0.5) * 4), bot = new V3(x, 0, z);
          const base = (s, v) => v.lerpVectors(top, bot, s), cintas = [tintaCoge(RAYO_AZUL, 0, 'rayo'), tintaCoge(RAYO_CIAN, 0, 'rayo')];
          TER.peligros.push({ tipo: 'rayo', t: 0, cintas, P: [rayoTiembla(base, 16, 1.2), rayoTiembla(base, 16, 0.7)] });
          terGolpe(x, z, 1.9, 9, 2.5); ringFx(x, z, 0xbfe8ff, 0.3, 2.6, 0.35); lightFlash(x, 1.5, z, 0x8fd0ff, 2.4, 10); flash('#cfe8ff', 0.18); play('terRayo'); shake = Math.max(shake, 0.35);
          for (let i = 0; i < 10; i++){ const an = rnd() * TAU; spawnFx(x, 0.3, z, Math.cos(an) * 4, 2 + rnd() * 4, Math.sin(an) * 4, 0xbfe8ff, 0.12, 0.4, 8, 0); } } } },
    fin(a){ TER.chidori.visible = false; if (a.cintas){ a.cintas.forEach(tintaSuelta); a.cintas = null; } },
    pose(a, R){ TER_POSES.chidori(R, Math.min(1, a.t / 0.5) * Math.min(1, (a.dur - a.t) / 0.6)); } },
  agujero: { dur: 6.6,
    empieza(a){ const hp = hero.position, G = TER.g.position, dx = hp.x - G.x, dz = hp.z - G.z, d = Math.hypot(dx, dz) || 1, lado = rnd() < 0.5 ? 1 : -1;   // a un lado de Tovan (detrás taparía la cámara)
      let x = hp.x + dz / d * 6.5 * lado + dx / d, z = hp.z - dx / d * 6.5 * lado + dz / d; const r = Math.hypot(x, z), lim = TER_ARENA - 2; if (r > lim){ x *= lim / r; z *= lim / r; }
      a.p = new V3(x, 1.6, z); a.dano = 0; terCirculo(x, z, 1.7, 1.0); terGrito('¡AGUJERO NEGRO… GIGA!', '¡Corre en contra!'); play('terAgujero'); },
    tick(a, et){ const t = a.t, ag = TER.agujero, u = ag.userData, hp = hero.position;
      if (t >= 1.0 && t < 6.2){ ag.visible = true; ag.position.copy(a.p); const k = Math.min(1, (t - 1.0) / 0.6) * (t > 5.8 ? Math.max(0.05, 1 - (t - 5.8) / 0.4) : 1);
        ag.scale.setScalar(k); u.disco.rotation.z += et * 2.4; u.halo.scale.setScalar(1 + Math.sin(time * 6) * 0.06);
        for (let i = 0; i < 3; i++){ const an = rnd() * TAU, r = 5 + rnd() * 6; spawnFx(a.p.x + Math.cos(an) * r, 0.3 + rnd() * 3, a.p.z + Math.sin(an) * r, -Math.cos(an) * r * 1.4, 0, -Math.sin(an) * r * 1.4, rnd() < 0.5 ? 0xff4af0 : 0x8a20ff, 0.12, 0.6, 0, -0.5); }
        if (!TER.trepa && !player.dead && t < 5.8){ const dx = a.p.x - hp.x, dz = a.p.z - hp.z, d = Math.hypot(dx, dz) || 1, f = 3.3 * clamp(1 - d / 18, 0.35, 1) * k;
          hp.x += dx / d * f * et; hp.z += dz / d * f * et; a.dano -= et;
          if (d < 1.6 && a.dano <= 0){ a.dano = 0.45; terGolpe(hp.x, hp.z, 1, 6, 3); } } }
      if (t >= 5.8 && !a.boom){ a.boom = true; terImpacto(a.p.x, a.p.z, 3.4, 0x8a20ff); play('boom'); terGolpe(a.p.x, a.p.z, 3.4, 9, 3); }
      if (t >= 6.2) ag.visible = false; },
    fin(){ TER.agujero.visible = false; },
    pose(a, R){ TER_POSES.invoca(R, Math.min(1, a.t / 0.5) * Math.min(1, (a.dur - a.t) / 0.6)); } }
};
function terElige(d){
  const pool = ['aterrizaje', 'gatling', 'hiken']; if (TER.rotos >= 1) pool.push('chidori'); if (TER.rotos >= 2) pool.push('agujero');
  let t = TER.primero; TER.primero = null;
  if (!t && d < 4.8 && rnd() < 0.6) t = 'pisoton';
  if (!t){ const ops = pool.filter(p => p !== TER.ultimo); t = ops[Math.floor(rnd() * ops.length)]; }
  TER.ultimo = t; TER.atq = { tipo: t, t: 0, dur: TER_ATQ[t].dur }; TER_ATQ[t].empieza(TER.atq);
}
function terAtaqueFuera(){ if (TER.atq){ const D = TER_ATQ[TER.atq.tipo]; if (D.fin) D.fin(TER.atq); TER.atq = null; } }

/* ---------- Inteligencia ---------- */
function terIA(et){
  const G = TER.g.position, hp = hero.position;
  if (TER.atq){ const a = TER.atq; a.t += et; TER_ATQ[a.tipo].tick(a, et); if (a.t >= a.dur){ terAtaqueFuera(); TER.cd = [2.0, 1.6, 1.25][Math.min(2, TER.rotos)]; G.y = 0; } TER.walkW = Math.max(0, TER.walkW - et * 4); return; }
  if (TER.tumba > 0){ TER.tumba -= et; TER.tumbaT += et; TER.walkW = 0; return; }
  const dx = hp.x - G.x, dz = hp.z - G.z, d = Math.hypot(dx, dz);
  if (TER.trepa){ TER.walkW = Math.max(0, TER.walkW - et * 3); return; }   // con Tovan encima: solo sacudidas (las lleva terSacudidaTick)
  TER.yaw = lerpAngle(TER.yaw, Math.atan2(dx, dz), 1 - Math.exp(-et * 1.4));
  const anda = d > 7.5 && !player.dead;
  TER.walkW += ((anda ? 1 : 0) - TER.walkW) * (1 - Math.exp(-et * 4));
  if (TER.walkW > 0.05){ const sp = 1.7 * TER.walkW; G.x += Math.sin(TER.yaw) * sp * et; G.z += Math.cos(TER.yaw) * sp * et; TER.ph += et * 3.4 * TER.walkW;
    const r = Math.hypot(G.x, G.z), lim = TER_ARENA - 3; if (r > lim){ G.x *= lim / r; G.z *= lim / r; }
    const paso = Math.floor(TER.ph / Math.PI); if (paso !== TER.pasoS){ TER.pasoS = paso; play('terPaso'); shake = Math.max(shake, 0.25); puffAt(G.x, G.z, 5, 2.5, 0x6a3a7a); } }
  TER.cd -= et; if (TER.cd <= 0 && !player.dead) terElige(d);
}
function terSacudidaTick(et){
  if (!TER.trepa){ if (TER.sac){ TER.sac = null; colAviso(null); } return; }
  if (TER.tumba > 0) return;
  if (!TER.sac){ TER.sacT -= et; if (TER.irrita >= 1){ TER.irrita = 0; TER.sacT = Math.min(TER.sacT, 0.4); }
    if (TER.sacT <= 0 && !TER.atq){ const f = TER.rotos >= 2; TER.sac = { t: 0, aviso: f ? 0.6 : 0.85, dur: f ? 2.3 : 1.8, fuerte: f }; TER.suelto = 0; TER.alza = 0;
      colAviso('¡SACUDIDA!'); play('terRugido'); } return; }
  const S = TER.sac; S.t += et;
  if (S.t >= S.aviso && !S.empezo){ S.empezo = true; shake = Math.max(shake, 0.5); play('bossSlam'); }
  if (S.t >= S.aviso) shake = Math.max(shake, 0.18);
  if (S.t >= S.aviso + S.dur){ TER.sac = null; colAviso(null); TER.sacT = [4.4, 3.8, 3.4][Math.min(2, TER.rotos)] + rnd() * 1.2; }
}

/* ---------- Tovan: agarrarse, trepar, apuñalar y caer ---------- */
function terRutaEn(ruta, s, p, n){ const i = clamp(Math.floor(s), 0, ruta.length - 2), f = clamp(s - i, 0, 1); p.lerpVectors(ruta[i].w, ruta[i + 1].w, f); n.lerpVectors(ruta[i].wn, ruta[i + 1].wn, f).normalize(); return i; }
function terAgarrable(rad){
  const hp = hero.position; let best = null, bd = rad;
  for (const ruta of TER.rutas) for (let i = 0; i < ruta.length; i++){ const a = ruta[i]; if (a.w.y > hp.y + 3.3) continue;
    const d = Math.hypot(a.w.x - hp.x, a.w.y - (hp.y + 1.3), a.w.z - hp.z); if (d < bd){ bd = d; best = { ruta, s: i }; } }
  return best;
}
function terAgarra(c){
  TER.trepa = { ruta: c.ruta, s: c.s, fz: 0 }; if (state === 'charge') chOrb.visible = false;
  state = 'normal'; attackW = 0; staffToBack(); grounded = true; vy = 0; player.kx = player.kz = 0; TER.cae = 0; TER.alza = 0; TER.carga = 0; TER.sacT = Math.max(TER.sacT, 2.8);
  play('colAgarre'); puffAt(hero.position.x, hero.position.z, 4, 0.8, 0x6a3a7a);
  if (!TER.dijo.trepa){ TER.dijo.trepa = 1; lumenTip('ter_trepa', terTactil() ? '¡Eso! Sube con el joystick. Si tiembla, ¡mantén AGARRA!' : '¡Eso! Sube con W. Si tiembla, ¡mantén K!'); }
}
function terSuelta(motivo){
  const T = TER.trepa; if (!T) return; TER.trepa = null; TER.alza = 0; TER.carga = 0; TER.sac = null; colAviso(null); colAgarreEl.hidden = true;
  const n = TER.nH, hp = hero.position, salto = motivo === 'salto', baja = motivo === 'baja';
  TER.agarreCd = baja ? 0.6 : 1.0;
  if (hp.y > 0.05){ grounded = false; vy = salto ? 6.5 : baja ? 0 : 2.5; TER.cae = hp.y; } else { grounded = true; vy = 0; }
  const k = salto ? 5.5 : baja ? 2 : 7; player.kx = n.x * k; player.kz = n.z * k;
  if (motivo === 'sacudida' || motivo === 'cansado'){ play('hurt'); barkT = 0; bark(motivo === 'cansado' ? '¡Se te escurren las manos! Descansa abajo y vuelve a subir.' : TER.rotos ? '¡Al suelo otra vez! Lo que has roto sigue roto.' : (terTactil() ? '¡Hay que agarrarse cuando tiembla! Mantén AGARRA.' : '¡Hay que agarrarse cuando tiembla! Mantén K.')); }
}
function terSelloCerca(){
  if (!TER.trepa) return null;
  for (const s of TER.sellos) if (!s.roto && s.a.w.distanceTo(TER.manos) < 1.7) return s;
  return null;
}
function terPunal(fuerza, mult = 1){
  TER.punalT = 0.26; TER.punalCd = 0.16; play('swingBig');
  const s = terSelloCerca(); if (!s){ play('clang'); return; }
  const crit = fuerza >= 0.99, dmg = Math.max(1, Math.round(TER.base * (0.5 + 3.5 * fuerza) * (0.85 + 0.15 * up.dmg) * (crit ? 1.1 : 1) * mult));
  s.hp -= dmg; tA.copy(s.spr.position); tA.y += 1; spawnNumber(tA, dmg, crit ? 'crit' : '');
  play('terPunal'); if (crit) play('specialBoom'); hitStop = crit ? 0.14 : 0.05; shake = Math.max(shake, crit ? 0.7 : 0.3); TER.dolor = 0.3 + 0.5 * fuerza;
  const p = s.spr.position; for (let i = 0; i < (crit ? 26 : 10); i++){ const an = rnd() * TAU, v = 2 + rnd() * (crit ? 7 : 4); spawnFx(p.x, p.y, p.z, Math.cos(an) * v, 1 + rnd() * 4, Math.sin(an) * v, i % 3 ? 0xff2ae0 : i % 2 ? 0x111111 : 0x20ffe0, 0.16, 0.7, 10, 0); }
  if (crit) flash('#ff2ae0', 0.3);
  if (s.hp <= 0) terRompeSello(s); else TER.irrita += 0.15 + 0.45 * fuerza;
  terBarra();
}
function terRompeSello(s){
  s.roto = true; s.hp = 0; s.spr.visible = false; TER.rotos++; TER.irrita = 0;
  const p = s.spr.position; lightFlash(p.x, p.y, p.z, 0xff2ae0, 3, 14); flash('#ffffff', 0.5); play('colRompe'); play('terRugido'); shake = Math.max(shake, 1); hitStop = 0.15; slowT = Math.max(slowT, 0.7);
  for (let i = 0; i < 40; i++){ const an = rnd() * TAU, v = 3 + rnd() * 8; spawnFx(p.x, p.y, p.z, Math.cos(an) * v, rnd() * 8, Math.sin(an) * v, i % 3 ? 0xff2ae0 : i % 2 ? 0xffffff : 0x20ffe0, 0.22, 1.0, 9, 0.3); }
  terBarra();
  if (TER.rotos >= 3){ terRemate(); return; }
  banner(`¡Punto débil roto!<small>${s.n} · ${TER.rotos} de 3</small>`, 1.8);
  barkT = 0; bark({ lumbar: '¡En los riñones! ¡Se ha ido al suelo de rodillas!', nuca: '¡La nuca! Como en esa serie de titanes. ¡Se va a poner como loco!', coronilla: '¡La coronilla! ¡Ya casi! ¡Busca el que queda!' }[s.id]);
  if (s.id === 'lumbar' || TER.rotos === 1){ TER.tumba = 4.2; TER.tumbaT = 0; TER.sac = null; colAviso(null); }
  else { TER.sac = null; TER.sacT = 0.2; }
}
function terTrepaTick(pdt){
  const T = TER.trepa, ruta = T.ruta, n1 = ruta.length - 1, held = terAgarraTecla(), hp = hero.position;
  let iz = 0; if (!player.dead) iz = (keys.KeyS || keys.ArrowDown ? 1 : 0) - (keys.KeyW || keys.ArrowUp ? 1 : 0) + joy.y;
  const sube = clamp(-iz, -1, 1), S = TER.sac, tiembla = S && S.t >= S.aviso;
  if (tiembla){
    if (held && TER.aguante > 0){ TER.aguante = Math.max(0, TER.aguante - pdt * (S.fuerte ? 0.17 : 0.14)); TER.suelto = 0; }
    else { TER.suelto += pdt; if (TER.suelto > 0.16){ terSuelta('sacudida'); return; } }
  } else if (TER.alza <= 0 && Math.abs(sube) > 0.15 && TER.punalT <= 0){
    const i = Math.min(n1 - 1, Math.floor(T.s)), L = Math.max(0.3, ruta[i].w.distanceTo(ruta[i + 1].w)), ds = sube * TER_VEL * (held ? 0.5 : 1) * pdt / L;
    T.s = clamp(T.s + ds, 0, n1); T.fz += Math.abs(ds) * L * 2.4; TER.aguante = Math.max(0, TER.aguante - pdt * 0.02);
    if (T.s <= 0 && sube < -0.5){ terSuelta('baja'); return; }
  }
  if (!tiembla && T.s >= n1 - 0.05) TER.aguante = Math.min(1, TER.aguante + pdt * 0.1);   // de pie en la cabeza se descansa un poco
  if (TER.aguante <= 0 && !tiembla){ terSuelta('cansado'); return; }
  // colocar a Tovan sobre la superficie
  const p = terV[0], n = terV[1]; terRutaEn(ruta, T.s, p, n); TER.manos.copy(p);
  const k = smooth(clamp((n.y - 0.35) / 0.5, 0, 1)); TER.pie = k;
  const nh = TER.nH.set(n.x, 0, n.z); if (nh.lengthSq() < 1e-4) nh.set(Math.sin(TER.yaw + Math.PI), 0, Math.cos(TER.yaw + Math.PI)); nh.normalize();
  const fuera = lerp(0.36, 0.03, k), abajo = lerp(1.55, 0, k);
  hp.set(p.x + nh.x * fuera, Math.max(0, p.y - abajo), p.z + nh.z * fuera);
  heading = lerpAngle(Math.atan2(-nh.x, -nh.z), TER.yaw, k); hero.rotation.y = heading; grounded = true; vy = 0; state = 'normal'; attackW = 0; player.kx = player.kz = 0; holdT = 0;
  // apuñalar: se alza al pulsar y se clava al soltar (cuanto más se mantiene, más fuerte)
  if (TER.punalCd > 0) TER.punalCd -= pdt; if (TER.punalT > 0) TER.punalT -= pdt;
  if (tiembla) TER.alza = 0;
  else if (TER.alza <= 0 && atkHeld() && TER.punalCd <= 0 && TER.punalT <= 0){ TER.alza = 0.001; TER.carga = 0; TER.cargaSon = false; staffToHand(); }
  if (TER.alza > 0){ TER.alza += pdt;
    if (atkHeld()){ TER.carga = Math.min(1, TER.carga + pdt / 1.0); if (TER.carga >= 1 && !TER.cargaSon){ TER.cargaSon = true; play('tier'); } }
    else if (TER.alza > 0.08){ terPunal(TER.carga); TER.alza = 0; } }
  if (TER.alza > 0){ chOrb.visible = true; chOrb.material.uniforms.uColor.value.setHex(TER.carga >= 1 ? 0xffd970 : 0xff8af0); chOrb.scale.setScalar(0.4 + TER.carga * 1.3 + (TER.carga >= 1 ? Math.sin(time * 30) * 0.15 : 0)); }
  else if (TER.punalT <= 0) staffToBack();
}
// Los pies, las rodillas y las manos del gigante apartan a Tovan cuando están en el suelo
function terColisiones(){
  const hp = hero.position; if (hp.y > 3) return; const R = TER.R, puntos = [];
  for (const L of [R.legL, R.legR]){ puntos.push(L.knee.localToWorld(terV[2].set(0, -0.2, 0.04)).clone(), L.knee.getWorldPosition(terV[2]).clone()); }
  for (const A of [R.armL, R.armR]) puntos.push(terMano(A, terV[2]).clone());
  for (const q of puntos){ if (q.y > 2.4) continue; const dx = hp.x - q.x, dz = hp.z - q.z, d = Math.hypot(dx, dz), r = 1.0;
    if (d < r && d > 1e-4){ hp.x = q.x + dx / d * r; hp.z = q.z + dz / d * r; } }
}
function terTovanTick(pdt){
  const hp = hero.position;
  if (TER.agarreCd > 0) TER.agarreCd -= pdt;
  if (TER.trepa){ terTrepaTick(pdt); return; }
  if (TER.cae && grounded){ const h = TER.cae; TER.cae = 0; if (h > 3.5 && !player.dead) hurtPlayer(Math.round((3 + h * 0.8) * TER.dm), hp.x, hp.z, 0); }
  if (!grounded && vy < 0 && TER.agarreCd <= 0 && !player.dead){ const c = terAgarrable(1.2); if (c){ terAgarra(c); terTrepaTick(0); return; } }
  terColisiones();
  TER.aguante = Math.min(1, TER.aguante + pdt * 0.5);
}
function terSellosTick(){
  for (const s of TER.sellos){ if (s.roto){ s.spr.visible = false; continue; } const a = s.a; s.spr.visible = true;
    s.spr.position.copy(a.w).addScaledVector(a.wn, 0.5); const k = s.hp / s.max, pulso = 1 + Math.sin(time * (6 + 6 * (1 - k))) * 0.12 + (TER.alza > 0 && terSelloCerca() === s ? TER.carga * 0.4 : 0);
    s.spr.scale.setScalar(2.0 * pulso); s.spr.material.color.setRGB(1, 0.55 + 0.45 * k, 0.6 + 0.4 * k); }
}
function terBarra(){
  if (!bossE || bossE.type !== 'tovanerr') return;
  bossE.maxHp = TER.sellos.reduce((t, s) => t + s.max, 0); bossE.hp = TER.sellos.reduce((t, s) => t + Math.max(0, s.hp), 0);
  const t = `TOVAN.EXE · puntos débiles ${TER.rotos}/3`; if (bossNameEl.textContent !== t) bossNameEl.textContent = t;
}
function terUI(pdt){
  if (TER.gritoT > 0 && (TER.gritoT -= pdt) <= 0) terGritoEl.hidden = true;
  const tac = terTactil(), T = TER.trepa;
  if (TER.fase !== 'pelea' || gameState !== 'play'){ terPista(''); colAgarreEl.hidden = true; return; }
  let txt = '';
  if (T){ const s = terSelloCerca();
    txt = s ? (tac ? '<b>Ataque</b> apuñala · mantén para cargar' : '<b>J</b> apuñala · mantén para cargar') : (tac ? '<b>Joystick</b> trepar · <b>Saltar</b> soltarse' : '<b>W/S</b> trepar · <b>Espacio</b> soltarse');
    terBotonAgarra(true);
    const p = terV[0].set(hero.position.x, hero.position.y + 2.4, hero.position.z).project(camera);
    colAgarreEl.hidden = p.z > 1; colAgarreEl.style.transform = `translate(${((p.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px,${((-p.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px)`;
    colAgarreEl.style.setProperty('--k', TER.aguante.toFixed(3)); colAgarreEl.classList.toggle('bajo', TER.aguante < 0.3);
  } else {
    colAgarreEl.hidden = true;
    const c = grounded ? terAgarrable(1.9) : null; terBotonAgarra(!!c);
    if (c) txt = tac ? '<b>Agarra</b> ¡trépale!' : '<b>K</b> ¡agárrate!';
    else { TER.sueloT += pdt; if (TER.sueloT > 9 && !TER.dijo.pierna){ TER.dijo.pierna = 1; lumenTip('ter_pierna', '¡Por detrás! Acércate a su talón y agárrate a la pierna.'); } }
  }
  terPista(txt);
}

/* ---------- Bucle ---------- */
function terTick(dt, pdt, playing){
  if (!TER.on || !TER.g) return;
  const jugando = playing && TER.fase === 'pelea', et = jugando ? pdt * (slowT > 0 ? 0.3 : 1) * (timeStopT > 0 ? 0 : 1) : gameState === 'paused' || gameState === 'over' ? 0 : dt;
  TER.camDt = dt; TER.tt += et;
  if (TER.montado){ const t = TER.tt;
    for (const m of TER.losas){ const u = m.userData; m.position.y -= u.v * et; m.rotation.x += u.rx * et; m.rotation.z += u.rz * et; if (m.position.y < -30) m.position.y = u.y0; }
    for (const m of TER.trozos){ const u = m.userData; m.rotation.y += u.w * et; m.position.y = u.y0 + Math.sin(t * 0.3 + u.f) * 1.5; }
    if (et > 0 && rnd() < 0.5){ const an = rnd() * TAU, r = 3 + rnd() * 18; spawnFx(hero.position.x + Math.cos(an) * r, 14 + rnd() * 6, hero.position.z + Math.sin(an) * r, 0, -2, 0, rnd() < 0.5 ? 0xff2ae0 : 0x20ffe0, 0.08, 4, 1, 0); } }
  if (jugando){
    if (TER.dolor > 0) TER.dolor -= et;
    terIA(et); terSacudidaTick(et);
  }
  if (TER.g.visible) terAnima(et);
  if (jugando){ clearT = 0; terCirculosTick(et); terOndasTick(et); terPeligrosTick(et); terTovanTick(pdt); terSellosTick(); terBarra(); }
  terUI(pdt);
  // la cámara del suelo apunta al gigante: W anda hacia él
  if (jugando && !TER.trepa){ const G = TER.g.position, hp = hero.position, dx = G.x - hp.x, dz = G.z - hp.z;
    if (Math.hypot(dx, dz) > 1.2) camYaw = lerpAngle(camYaw, Math.atan2(-dx, -dz), 1 - Math.exp(-pdt * 3.5)); }
}

/* ---------- Cámara y pose de Tovan ---------- */
function terCamara(cam){
  if (!TER.montado || cs.active || lcut || !TER.g) return;
  const hp = hero.position, G = TER.g.position, tall = innerWidth < innerHeight, kd = (tall ? 1.4 : 1) * (camDist / 7), P_ = terV[3], L_ = terV[4];
  if (TER.trepa){ const n = TER.nH, rx = n.z, rz = -n.x;
    P_.set(hp.x + n.x * 7 * kd + rx * 1.6, hp.y + 2.6 + (tall ? 1.2 : 0) + TER.pie * 2.5, hp.z + n.z * 7 * kd + rz * 1.6); L_.set(hp.x, hp.y + 1.3, hp.z); }
  else { const dx = G.x - hp.x, dz = G.z - hp.z, d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d, D = 9 * kd;   // detrás de Tovan, mirando hacia arriba al gigante
    P_.set(hp.x - ux * D, hp.y + 3.6 + (tall ? 1.4 : 0), hp.z - uz * D); L_.set(hp.x + ux * Math.min(5, d * 0.5), 1.5 + clamp((d - 2) * 0.32, 0.3, 3.4) + hp.y * 0.5 + G.y * 0.4, hp.z + uz * Math.min(5, d * 0.5)); }   // (que se vean los avisos del suelo)
  if (!TER.camOk){ TER.camP.copy(P_); TER.camL.copy(L_); TER.camOk = true; }
  else { const a = 1 - Math.exp(-TER.camDt * 5); TER.camP.lerp(P_, a); TER.camL.lerp(L_, a); }
  cam.position.copy(TER.camP); cam.lookAt(TER.camL);
}
function terPoseTovan(){
  if (!TER.trepa || !TER.montado) return;
  const k = 1 - TER.pie, f = TER.trepa.fz, a = Math.sin(f), S = TER.sac, agarrado = S && S.t >= S.aviso && terAgarraTecla();
  if (k > 0.01){
    bl(P.spine.rotation, 'x', 0.12, k); bl(P.neck.rotation, 'x', -0.35, k); bl(P.neck.rotation, 'y', 0, k);
    bl(P.armL.sh.rotation, 'x', agarrado ? -2.7 : -2.45 + 0.45 * a, k); bl(P.armR.sh.rotation, 'x', agarrado ? -2.7 : -2.45 - 0.45 * a, k);
    bl(P.armL.sh.rotation, 'z', -0.3, k); bl(P.armR.sh.rotation, 'z', 0.3, k); bl(P.armR.sh.rotation, 'y', 0, k);
    bl(P.armL.el.rotation, 'x', agarrado ? -0.9 : -0.55 - 0.3 * a, k); bl(P.armR.el.rotation, 'x', agarrado ? -0.9 : -0.55 + 0.3 * a, k);
    bl(P.legL.hip.rotation, 'x', agarrado ? -1.0 : -0.7 - 0.45 * a, k); bl(P.legR.hip.rotation, 'x', agarrado ? -1.0 : -0.7 + 0.45 * a, k);
    bl(P.legL.knee.rotation, 'x', agarrado ? 1.5 : 1.1 + 0.4 * a, k); bl(P.legR.knee.rotation, 'x', agarrado ? 1.5 : 1.1 - 0.4 * a, k);
    if (agarrado) P.spine.rotation.z = Math.sin(time * 15) * 0.25;
  } else if (agarrado){ bl(P.spine.rotation, 'x', 0.8, 1); for (const L of [P.legL, P.legR]){ bl(L.hip.rotation, 'x', -1.2, 1); bl(L.knee.rotation, 'x', 1.9, 1); } for (const A of [P.armL, P.armR]){ bl(A.sh.rotation, 'x', -1.3, 1); bl(A.el.rotation, 'x', -0.4, 1); } }
  // apuñalar: el brazo del bastón se alza y se clava
  const A = P.armR;
  if (TER.alza > 0){ const w = Math.min(1, TER.alza / 0.15); bl(A.sh.rotation, 'x', -2.9 - TER.carga * 0.2, w); bl(A.sh.rotation, 'z', 0.25, w); bl(A.el.rotation, 'x', -1.3, w); bl(P.spine.rotation, 'x', -0.1 - 0.15 * TER.carga + 0.8 * TER.pie, w); }
  else if (TER.punalT > 0){ const w = Math.min(1, TER.punalT / 0.1); bl(A.sh.rotation, 'x', TER.pie > 0.5 ? -0.55 : -1.65, w); bl(A.sh.rotation, 'z', 0.1, w); bl(A.el.rotation, 'x', -0.05, w); bl(P.spine.rotation, 'x', 0.3 + 0.7 * TER.pie, w); }
}

/* ---------- La transformación ---------- */
function terPuede(e){ return e.type === 'error' && !e.terHecho && !e.terFase && !special && !chActive && !invActive && !cs.active && gameState === 'play' && !player.dead && !COL.on && !SH3.montado; }
function terEmpieza(e){
  Object.assign(TER, { on: true, fase: 'cine', e, rotos: 0, atq: null, trepa: null, sac: null, cae: 0, aguante: 1, tumba: 0, irrita: 0, dolor: 0, cd: 1.6, primero: 'aterrizaje', ultimo: null,
    walkW: 0, alza: 0, carga: 0, punalT: 0, sueloT: 0, dijo: {}, pie: 0, dm: e.dm || 1, total: e.maxHp, base: e.maxHp * 0.032 });
  e.terFase = true; e.alive = false; e.hp = 0; e.flash = 0; e.burnT = e.chillT = e.frozenT = e.shockT = 0; e.chill = 0;
  hideTeles(e); sweepHazards(); if (e.holes) e.holes.forEach(h => { h.visible = false; }); if (e.ghost) e.ghost.visible = false;
  for (const p of projectiles) scene.remove(p.m); projectiles.length = 0;
  clearT = 0; bossBox.hidden = true; document.body.classList.remove('glitch-hard');
  terConstruye(); for (const p of TER.piezas) p.visible = true; TER.g.visible = false;
  for (const s of TER.sellos){ s.max = Math.round(TER.total * s.pct); s.hp = s.max; s.roto = false; s.spr.visible = false; }
  terCineTransforma();   // (antes de barrer a los demás: con gameState = 'play', la última baja lanzaría su grito de victoria)
  queue.length = 0;
  for (const o of enemies) if (o.alive && o !== e){ killEnemy(o); o.dying = 0; o.remove = true; scene.remove(o.g); if (o.tele) scene.remove(o.tele); if (o.parts) o.parts.forEach(q => scene.remove(q)); }
}
function terCineTransforma(){
  const e = TER.e, E = e.g.position.clone(), hp = hero.position, R = TER.R;
  if (state === 'tech') cancelTech(); state = 'normal'; attackW = 0; staffToBack(); grounded = true; vy = 0; hp.y = 0; player.kx = player.kz = 0;
  const dx = hp.x - E.x, dz = hp.z - E.z, d0 = Math.hypot(dx, dz) || 1, ux = dx / d0, uz = dz / d0;
  heading = Math.atan2(-ux, -uz); hero.rotation.y = heading;
  let fase = 'quieto', tC = 0;
  const cubo = e.body, cubo0 = cubo.scale.clone();
  runCine(async () => {
    cs.tick = dt => { tC += dt;
      if (fase === 'quieto'){ cubo.position.set((rnd() - 0.5) * 0.12, 1.9, (rnd() - 0.5) * 0.12); cubo.rotation.y += dt * (2 + tC * 6); }
      else if (fase === 'pliega'){ const k = Math.max(0.02, 1 - tC / 1.0); cubo.scale.set(cubo0.x * k, cubo0.y * (1 + (1 - k) * 0.5), cubo0.z * k); cubo.rotation.y += dt * 18;
        if (rnd() < 0.8){ const a = rnd() * TAU; spawnFx(E.x + Math.cos(a) * 2.5, 1.9 + (rnd() - 0.5) * 2, E.z + Math.sin(a) * 2.5, -Math.cos(a) * 4, 0, -Math.sin(a) * 4, rnd() < 0.5 ? 0xff2ae0 : 0x20ffe0, 0.14, 0.55, 0, -0.5); } }
      else if (fase === 'copia'){ // te imita
        for (const [a, b] of [[P.hips, R.hips], [P.spine, R.spine], [P.neck, R.neck], [P.armL.sh, R.armL.sh], [P.armR.sh, R.armR.sh], [P.armL.el, R.armL.el], [P.armR.el, R.armR.el], [P.legL.hip, R.legL.hip], [P.legR.hip, R.legR.hip], [P.legL.knee, R.legL.knee], [P.legR.knee, R.legR.knee]]) b.rotation.copy(a.rotation);
        R.neck.scale.set(1.45, 1.42, 1.45); }
    };
    // 1. El cubo se queda congelado
    csShot(cam => { cam.position.set(E.x + ux * 4.4 + uz * 1.8, 2.3, E.z + uz * 4.4 - ux * 1.8); cam.lookAt(E.x, 1.8, E.z); });
    play('glitch'); csCaption('Lumen: ¿Lo hemos… apagado?'); await csWait(1.5);
    // 2. Se pliega en píxeles
    fase = 'pliega'; tC = 0; play('glitch'); flash('#ff2ae0', 0.3); csCaption(''); await csWait(1.1);
    // 3. Un Tovan con la textura perdida
    e.g.visible = false; cubo.scale.copy(cubo0); fase = 'copia'; TER.imita = true;
    terColoca(E.x, E.z, Math.atan2(ux, uz), 1); TER.g.visible = true; terAnima(0);
    for (let i = 0; i < 30; i++){ const a = rnd() * TAU; spawnFx(E.x, 1.1, E.z, Math.cos(a) * 4, 1 + rnd() * 4, Math.sin(a) * 4, i % 2 ? 0xff2ae0 : 0x20ffe0, 0.15, 0.7, 6, 0); }
    flash('#ffffff', 0.5); play('glitch'); play('specialBoom');
    const mx = (hp.x + E.x) / 2, mz = (hp.z + E.z) / 2, dl = Math.max(4.2, d0 * 0.78 + 1.6);   // plano de los dos, de lado
    csShot((cam, t) => { cam.position.set(mx + uz * dl + ux * 0.4, 1.35 + t * 0.05, mz - ux * dl + uz * 0.4); cam.lookAt(mx, 1.05, mz); });
    csCaption('Tovan: …¿Ese soy yo?'); await csWait(1.8);
    csShot((cam, t) => { cam.position.set(hp.x + ux * (3 + t * 0.15) - uz * 1.2, 2.1, hp.z + uz * (3 + t * 0.15) + ux * 1.2); cam.lookAt(E.x, 1.15, E.z); });
    csCaption('Lumen: Es una versión corrupta de ti. ¡El ERROR se ha copiado de tu modelo!'); await csWait(2.8);
    // 4. Crece a saltos y se sale del mapa
    fase = 'crece'; TER.imita = false; csCaption('');
    csShot((cam, t) => { const k = smooth(clamp(t / 2.4, 0, 1)); cam.position.set(hp.x + ux * (2 + k * 3) - uz * 1.5, 1.2 + k * 1.2, hp.z + uz * (2 + k * 3) + ux * 1.5); cam.lookAt(TER.g.position.x, 1.5 + TER.esc * 1.1 * k, TER.g.position.z); });
    for (const s of [1.5, 2.2, 3.1]){ terColoca(TER.g.position.x, TER.g.position.z, TER.yaw, s); flash('#ff2ae0', 0.3); play('glitch'); shake = 0.5; await csWait(0.38); }
    await csTween(0.25, k => { cineEls.white.style.opacity = String(k); });
    terMonta(); hero.position.set(0, 0, 8); heading = Math.PI; hero.rotation.y = heading; terColoca(TER_X, TER_Z, 0, 3.1);
    const camAbajo = (cam, t) => { const k = smooth(clamp(t / 3, 0, 1)); cam.position.set(1.6, 0.8, 10.5 - k * 0.6); cam.lookAt(0, 3 + TER.esc * 1.2 * k, TER_Z); };
    csShot(camAbajo);
    await csTween(0.4, k => { cineEls.white.style.opacity = String(1 - k); });
    for (const s of [4.2, 5.0, TER_ESC]){ terColoca(TER_X, TER_Z, 0, s); flash('#ff2ae0', 0.25); play('glitch'); shake = 0.7; await csWait(0.4); }
    // 5. Contrapicado: ruge
    fase = 'ruge'; play('terRugido'); shake = 1; showBossCard('tovanerr');
    csShot((cam, t) => { cam.position.set(2.2 - t * 0.3, 0.6, 9.5 - t * 0.4); cam.lookAt(0, 8.5, TER_Z); });
    await csWait(2.4); hideBossCard();
    // 6. Lumen
    csShot(dollyShot([0, 2.2, 13], [0, 2.6, 12], [0, 2.4, 6], [0, 6, TER_Z], 2.6));
    csCaption('Lumen: Nos ha sacado del mapa. ¡Trépale por las piernas y apuñala lo que brille!'); await csWait(2.6); csCaption('');
  }, () => { csCaption(''); hideBossCard(); cineEls.white.style.opacity = '0'; TER.imita = false; if (TER.on) terEmpiezaPelea(); });
}
function terEmpiezaPelea(){
  const e = TER.e; terMonta(); e.g.visible = false; TER.g.visible = true;
  if (TER.fase === 'cine'){ terColoca(TER_X, TER_Z, 0, TER_ESC); hero.position.set(0, 0, 8); heading = Math.PI; hero.rotation.y = heading; camYaw = 0; }
  grounded = true; vy = 0; state = 'normal'; player.inv = Math.max(player.inv, 1); TER.camOk = false;
  TER.fase = 'pelea'; TER.cd = 1.6; TER.sacT = 5;
  bossE = { type: 'tovanerr', alive: true, hp: 1, maxHp: 1, g: TER.g, isBoss: true, spawnT: 0, bossName: 'TOVAN.EXE' }; bossBox.hidden = false; terBarra();
  lumenTip('ter_pelea', terTactil() ? '¡Agárrate a su pierna (AGARRA) y apuñala lo que brille (Ataque)!' : '¡Agárrate a su pierna con K y apuñala lo que brille con J!'); clearT = 0;
}

/* ---------- Final: deja de funcionar, se deshace en cubos y volvemos al mapa ---------- */
function terRemate(){
  TER.fase = 'remate'; terAtaqueFuera(); terPeligrosFuera(); TER.sac = null; colAviso(null); colAgarreEl.hidden = true; terPista('');
  bossE = null; bossBox.hidden = true; TER.alza = 0; staffToBack();
  terCineFinal();
}
function terCineFinal(){
  const hp = hero.position; let rompe = false, rT = 0, cae = false, caeV = 0, piezas = null;
  TER.trepa = null; grounded = true; vy = 0;
  runCine(async () => {
    const x0 = hp.x, y0 = hp.y, z0 = hp.z;
    // 1. Ctrl + Alt + Supr
    csShout('¡CTRL + ALT + SUPR!'); play('specialBoom'); flash('#ffffff', 0.8); shake = 1;
    csShot((cam, t) => { const a = TER.yaw + Math.PI + 0.7 + t * 0.2; cam.position.set(x0 + Math.sin(a) * 4.5, y0 + 1.8, z0 + Math.cos(a) * 4.5); cam.lookAt(x0, y0 + 0.9, z0); });
    await csWait(1.3);
    // 2. Se cuelga
    terVentanaEl.hidden = false; play('glitch'); TER.dolor = 0;
    csShot((cam, t) => { cam.position.set(TER.g.position.x + 4, 3 + t * 0.5, TER.g.position.z + 17); cam.lookAt(TER.g.position.x, 6.5, TER.g.position.z); });
    await csWait(2.2); terVentanaEl.querySelector('.si').classList.add('pulsa'); play('confirm'); await csWait(0.4); terVentanaEl.hidden = true; terVentanaEl.querySelector('.si').classList.remove('pulsa');
    // 3. Se deshace en cubos de arriba abajo y Tovan cae
    TER.g.updateMatrixWorld(true); piezas = TER.piezas.map(m => ({ m, y: m.getWorldPosition(new V3()).y })).sort((a, b) => b.y - a.y); rompe = true; play('terRugido');
    cs.tick = dt => { rT += dt;
      const n = Math.floor(rT / 2.6 * piezas.length);
      while (piezas.length && piezas.length > TER.piezas.length - n){ const q = piezas.shift(), p = q.m.getWorldPosition(terV[0]); q.m.visible = false;
        if (rnd() < 0.6) for (let i = 0; i < 3; i++) spawnFx(p.x, p.y, p.z, (rnd() - 0.5) * 5, rnd() * 3, (rnd() - 0.5) * 5, i % 2 ? 0xff2ae0 : rnd() < 0.5 ? 0x111111 : 0x20ffe0, 0.3, 1.4, 12, 0); }
      for (const b of TER.bits) b.visible = rT < 1.2;
      if (rT > 0.5) cae = true;
      if (cae && hp.y > 0){ caeV += 22 * dt; hp.y = Math.max(0, hp.y - caeV * dt); grounded = true; vy = 0; if (hp.y <= 0){ landT = 0.18; play('land'); puffAt(hp.x, hp.z, 10, 1.6); shake = 0.6; } } };
    csShot((cam, t) => { cam.position.set(TER.g.position.x + 14, 4 + t, TER.g.position.z + 14); cam.lookAt(TER.g.position.x, 6 - t * 1.6, TER.g.position.z); });
    await csWait(3.2);
    // 4. Vuelta al mapa
    await csTween(0.4, k => { cineEls.white.style.opacity = String(k); });
    cs.tick = null; TER.g.visible = false; terDesmonta(); hp.set(0, 0, 0.5); heading = Math.PI * 0.85; hero.rotation.y = heading; grounded = true; vy = 0;
    csShot((cam, t) => { cam.position.set(2.4, 1.2 + t * 0.2, 4.2); cam.lookAt(0, 1.0, 0.5); });
    await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
    csCaption('Tovan: Que conste que yo no tengo tan mala pinta.'); await csWait(2.2);
    csCaption('Lumen: Con textura, no.'); await csWait(1.8); csCaption('');
  }, () => { csCaption(''); terVentanaEl.hidden = true; terTermina(); });
}
function terLimpia(){ terAtaqueFuera(); if (TER.circ) terPeligrosFuera(); TER.trepa = null; TER.sac = null; TER.alza = 0; colAviso(null); colAgarreEl.hidden = true; terPista(''); terGritoEl.hidden = true; terVentanaEl.hidden = true; terBotonAgarra(false);
  if (TER.g){ TER.g.visible = false; for (const s of TER.sellos) s.spr.visible = false; for (const b of TER.bits) b.visible = true; } }
function terTermina(){
  const e = TER.e;
  terLimpia(); terDesmonta(); TER.on = false; TER.fase = null; TER.e = null;
  if (Math.hypot(hero.position.x, hero.position.z) > ARENA - 0.5 || hero.position.y !== 0) hero.position.set(0, 0, 0.5);
  grounded = true; vy = 0; cineEls.white.style.opacity = '0';
  if (e){ e.alive = true; e.terHecho = true; e.hp = 0; e.g.visible = false; e.g.position.set(hero.position.x + 1.2, 0, hero.position.z - 1.4); killEnemy(e); }
  clearT = -1;
}
function terAborta(){
  if (!TER.on && !TER.montado) return;
  terLimpia(); terDesmonta(); TER.on = false; TER.fase = null; TER.e = null;
  if (bossE && bossE.type === 'tovanerr'){ bossE = null; bossBox.hidden = true; }
}

/* ---------- Ganchos ---------- */
const _killEnemyTer = killEnemy;
killEnemy = function(e){
  if (e.type === 'error' && e.terFase && !e.terHecho) return;   // ya está en su segunda vida
  if (e.type === 'error' && terPuede(e)){ terEmpieza(e); return; }
  return _killEnemyTer(e);
};
const terPelea = () => TER.on && TER.fase === 'pelea' && gameState === 'play';
const _doAttackTer = doAttack;
doAttack = function(...a){ if (terPelea()){ if (TER.trepa){ if (TER.alza <= 0 && TER.punalCd <= 0 && TER.punalT <= 0 && !(TER.sac && TER.sac.t >= TER.sac.aviso)){ TER.alza = 0.001; TER.carga = 0; TER.cargaSon = false; staffToHand(); } return; }
  const G = TER.g.position; if (Math.hypot(G.x - hero.position.x, G.z - hero.position.z) < 5 && !TER.dijo.cosquillas){ TER.dijo.cosquillas = 1; lumenTip('ter_cosquillas', '¡Desde abajo no le haces ni cosquillas! ¡Trépale!'); } }
  return _doAttackTer(...a); };
const _doRollTer = doRoll;
doRoll = function(...a){ if (terPelea() && !player.dead){ if (TER.trepa) return; if (grounded && TER.agarreCd <= 0){ const c = terAgarrable(1.9); if (c){ terAgarra(c); return; } } } return _doRollTer(...a); };
const _doJumpTer = doJump;
doJump = function(...a){ if (terPelea() && TER.trepa){ if (!(TER.sac && TER.sac.t >= TER.sac.aviso)) terSuelta('salto'); return; } return _doJumpTer(...a); };
const _doSpecialTer = doSpecial;
doSpecial = function(...a){ if (terPelea() && TER.trepa){ if (player.meter >= 100 && terSelloCerca() && !(TER.sac && TER.sac.t >= TER.sac.aviso)){ player.meter = 0; flash('#ffffff', 0.4); play('specialCharge'); terPunal(1, 2.4); } return; } return _doSpecialTer(...a); };
const _v3UpdateTer = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateTer(dt, pdt, playing); try { terTick(dt, pdt, playing); } catch (err) { console.error(err); } };
const _csCameraTer = csCamera; csCamera = function(cam){ _csCameraTer(cam); try { terCamara(cam); } catch (err) { console.error(err); } };
const _legendPoseTer = legendPose; legendPose = function(){ _legendPoseTer(); try { terPoseTovan(); } catch (err) { console.error(err); } };
const _updateCorruptTer = updateCorrupt; updateCorrupt = function(dt){ if (!TER.montado) _updateCorruptTer(dt); };   // (sus ventanitas de error tapaban la escalada)
const _clearWorldTer = clearWorld; clearWorld = function(){ terAborta(); _clearWorldTer(); };
const _toTitleTer = toTitle; toTitle = function(){ terAborta(); _toTitleTer(); };

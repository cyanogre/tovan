'use strict';
/* ======================================================================
   EL GUARDIÁN · SEGUNDA VIDA: el mecanismo del Ocaso
   Al dejar al Guardián de las ruinas a cero no cae: se da cuerda. La
   plaza era la tapa de un reloj gigante; el suelo se abre, Tovan cae al
   fondo (la esfera del reloj, con sus agujas barriendo) y el Guardián
   sale volando de lo alto del eje. Al estilo de Stallord (Twilight
   Princess):
   - Dos raíles en hélice: uno pegado a la columna central (gira con ella)
     y otro pegado a la pared del foso. RODAR junto a un raíl (o caer
     encima) te monta y lo recorres girando como una peonza.
   - SALTAR, montado, te lanza en arco hasta el otro raíl, de la columna a
     la pared o al revés: así se esquivan sus ataques… y si en el arco
     ATACAS cuando el Guardián pasa cerca, lo derribas (no basta con tocarlo).
   - Derribado, cae a la esfera con el núcleo al aire unos segundos: hay
     que bajar (RODAR te suelta del raíl) y coserlo a golpes. Al levantarse
     suelta una onda que hay que saltar. Tres derribos y el reloj se para.
   - El Guardián vuela entre la columna y la pared, a tu altura, y ataca:
     piedras de su halo, la mirada (un barrido a tu altura), embestidas y
     la campana (ondas). Si te quedas en el suelo, cae en picado sobre ti.
   - Física: Tovan sigue en y = 0 y lo que se mueve es el mundo (ENG.W está
     en -ENG.base): base es la altura absoluta del punto del raíl (o del
     arco) en el que está. Así golpes, poses y efectos funcionan igual.
   - El núcleo es un enemigo (isBoss, sin frenesí) al que solo se le puede
     pegar con el Guardián derribado (envoltorio de hitEnemy); cada derribo
     se lleva un tercio de su vida.
   - Todo se construye la primera vez que hace falta y con su propio PRNG:
     nada de rnd() al cargar.
   ====================================================================== */
const ENG_SC = 2.4, ENG_EJE_R = 1.5, ENG_EJE_TOP = 12.6, ENG_MURO_R = 13.8, ENG_ARENA = 13.2, ENG_CORE = 1.12;   // ENG_CORE: altura del núcleo en el modelo (× escala)
const ENG_RIELES = [
  { id: 'columna', r: 2.4, y0: 0.3, y1: 11.2, a0: 0, vueltas: 2.6, gira: true, v: 11 },
  { id: 'pared', r: 12.8, y0: 0.3, y1: 11.2, a0: Math.PI, vueltas: 0.9, gira: false, v: 12.5 }];   // (más rápidos que al principio: que se vaya y venga de pared a pared)
for (const R of ENG_RIELES) R.L = Math.hypot(R.vueltas * TAU * R.r, R.y1 - R.y0);
const ENG_AGUJAS = [{ L: 8.6, w: 0.13, ancho: 0.55, alto: 0.5 }, { L: 12.6, w: 0.42, ancho: 0.4, alto: 0.42 }];   // horaria y minutero
const ENG_VAPOR = [0.19, 0.3], ENG_RONDAS = 3;
const ENG = { on: false, montado: false, built: false, fase: null, e: null, t: 0, base: 0, riel: null, salto: null, vel: 1, sube: 1, ejeA: 0, agujaA: [0, 2],
  atq: null, atqCd: 0, ultimo: '', rondas: 0, nucleo: null, prev: null, son: null, ticT: 0, ticN: 0, yawT: 0, clangT: 0, giroOn: false, piedras: [], aros: [],
  cae: 0, rielCd: 0, parado: 0, dijo: {}, g: { est: 'eje', p: new V3(), v: new V3(), a: 0, r: 7, y: 6, aw: 0.4, rObj: 7, t: 0, cambio: 0, giro: 0, yaw: 0 } };
BOSS_CARDS.engcol = ['GUARDIÁN · SEGUNDA VIDA', 'Centinela de piedra · Ahora con mecanismo de relojería', '#ffd27a'];
const engV = [new V3(), new V3(), new V3(), new V3(), new V3()];
const engAng = a => Math.atan2(Math.sin(a), Math.cos(a));
const engEjeTop = () => ENG_EJE_TOP - (1 - smooth(ENG.sube)) * 16 - ENG.cae * ENG.cae * 4;
const engPies = () => ENG.base + hero.position.y;   // altura absoluta de los pies de Tovan
const engJugando = () => ENG.on && ENG.fase === 'pelea';
const engDijo = (k, txt) => { if (ENG.dijo[k]) return; ENG.dijo[k] = true; barkT = 0; bark(txt); };
function engRielP(R, s, v){ const a = R.a0 + s * R.vueltas * TAU + (R.gira ? ENG.ejeA : 0); return v.set(Math.sin(a) * R.r, lerp(R.y0, R.y1, s), Math.cos(a) * R.r); }

/* ---------- Sonido: tictac, rumor de engranajes, campana, raíl ---------- */
Object.assign(SFX, {
  engTic: () => tone({ type: 'square', f0: 1500, dur: 0.025, vol: 0.06, rv: 0.45 }),
  engToc: () => tone({ type: 'square', f0: 980, dur: 0.03, vol: 0.06, rv: 0.45 }),
  engCampana: () => { [[98, 0.24], [196, 0.14], [294, 0.08], [415, 0.05]].forEach(([f, v]) => tone({ type: 'sine', f0: f, f1: f * 0.99, dur: 2.6, vol: v, attack: 0.004, rv: 0.85 }));
    noise({ dur: 0.12, vol: 0.12, f0: 2400, q: 1, rv: 0.6 }); },
  engRompe: () => { noise({ dur: 0.5, vol: 0.3, f0: 5000, f1: 700, type: 'highpass', q: 0.6, rv: 0.45 }); tone({ type: 'triangle', f0: 1300, f1: 220, dur: 0.7, vol: 0.16, rv: 0.5 });
    tone({ type: 'square', f0: 620, f1: 300, dur: 0.3, vol: 0.07, when: 0.05 }); },
  engMonta: () => { tone({ type: 'square', f0: 330, f1: 660, dur: 0.12, vol: 0.08 }); noise({ dur: 0.18, vol: 0.14, f0: 3500, q: 0.8 }); },
  engSalto: () => { noise({ dur: 0.45, vol: 0.2, f0: 900, f1: 4000, type: 'bandpass', q: 0.7, attack: 0.01, rv: 0.3 }); tone({ type: 'square', f0: 400, f1: 900, dur: 0.18, vol: 0.07 }); },
  engLanza: () => { noise({ dur: 0.8, vol: 0.26, f0: 600, f1: 3500, type: 'bandpass', q: 0.6, attack: 0.02, rv: 0.3 }); tone({ type: 'sine', f0: 120, f1: 380, dur: 0.5, vol: 0.18 }); }
});
function engSonLoop(on){
  if (!actx) return;
  if (on && !ENG.son){ try {
    const mk = (f, q, tipo) => { const src = actx.createBufferSource(); src.buffer = noiseBuf; src.loop = true; const fl = actx.createBiquadFilter(); fl.type = tipo; fl.frequency.value = f; fl.Q.value = q;
      const g = actx.createGain(); g.gain.value = 0; src.connect(fl); fl.connect(g); g.connect(sfxBus); src.start(); return { src, fl, g }; };
    ENG.son = { rumor: mk(110, 0.7, 'lowpass'), riel: mk(2200, 1.4, 'bandpass') }; } catch (err) {} }
  else if (!on && ENG.son){ const s = ENG.son; ENG.son = null;
    for (const k of ['rumor', 'riel']){ try { s[k].g.gain.setTargetAtTime(0, actx.currentTime, 0.12); s[k].src.stop(actx.currentTime + 0.6); } catch (err) {} } }
}

/* ---------- Construcción (la primera vez) ---------- */
let engR = () => 0.5;
function engPintaEsfera(g, w, h){   // la esfera del reloj: losas, anillos dorados, horas y runas
  const R = engR, losa = assetImg('entorno/ruinas-losas');
  g.fillStyle = '#3a3036'; g.fillRect(0, 0, w, h);
  if (losa) for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) g.drawImage(losa, x, y, 128, 128);
  g.fillStyle = 'rgba(40,24,30,0.35)'; g.fillRect(0, 0, w, h);
  const c = w / 2, k = c / ENG_MURO_R, ring = (r, lw, col) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); g.arc(c, c, r * k, 0, TAU); g.stroke(); };
  ring(13.2, 12, '#c89a40'); ring(12.4, 3, '#7ff5ff'); ring(9.9, 5, '#c89a40'); ring(5.6, 4, '#8a6a30'); ring(2.0, 8, '#c89a40');
  for (let i = 0; i < 60; i++){ const a = i / 60 * TAU, big = i % 5 === 0, r0 = big ? 10.8 : 11.5, r1 = 12.2;
    g.strokeStyle = big ? '#ffd27a' : '#b08a48'; g.lineWidth = big ? 9 : 3; g.beginPath(); g.moveTo(c + Math.sin(a) * r0 * k, c - Math.cos(a) * r0 * k); g.lineTo(c + Math.sin(a) * r1 * k, c - Math.cos(a) * r1 * k); g.stroke(); }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `bold ${Math.round(1.15 * k)}px 'Pixelify Sans', monospace`;
  const NUM = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  for (let i = 0; i < 12; i++){ const a = i / 12 * TAU, x = c + Math.sin(a) * 8.7 * k, y = c - Math.cos(a) * 8.7 * k;
    g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = '#1e1418'; g.fillText(NUM[i], 3, 3); g.fillStyle = '#ffd27a'; g.fillText(NUM[i], 0, 0); g.restore(); }
  g.strokeStyle = 'rgba(127,245,255,0.55)'; g.lineWidth = 3;   // runas entre las horas
  for (let i = 0; i < 24; i++){ const a = (i + 0.5) / 24 * TAU, x = c + Math.sin(a) * 7.0 * k, y = c - Math.cos(a) * 7.0 * k, s = 0.4 * k;
    g.beginPath(); g.moveTo(x - s, y); g.lineTo(x, y - s * (1 + R())); g.lineTo(x + s, y); if (R() < 0.5){ g.moveTo(x, y - s); g.lineTo(x, y + s); } g.stroke(); }
}
function engRueda(R, th, dientes, M){   // un engranaje fundido (la cara de arriba en y = 0)
  const tmp = new THREE.Group();
  mesh(C(R, R, th, 28), M.bronce, 0, -th / 2, 0, tmp);
  const top = mesh(new THREE.CircleGeometry(R * 0.9, 28), M.piedra, 0, 0.004, 0, tmp); top.rotation.x = -Math.PI / 2;
  for (let i = 0; i < dientes; i++){ const a = i / dientes * TAU, d = mesh(B(0.42, th * 0.86, 0.36), M.bronce, Math.sin(a) * (R + 0.15), -th / 2, Math.cos(a) * (R + 0.15), tmp); d.rotation.y = a; }
  for (let i = 0; i < 3; i++) mesh(B(0.16, 0.05, R * 1.7), M.oro, 0, 0.02, 0, tmp).rotation.y = i * Math.PI / 3;
  mesh(C(0.42, 0.42, 0.12, 8), M.oro, 0, 0.05, 0, tmp);
  const g = new THREE.Group(); mpFusiona(tmp, g); return g;
}
function engRielMalla(R, M, dst){   // el raíl en hélice: un tubo dorado con dientes y soportes hasta su pared (en coordenadas del raíl sin girar)
  const curva = new THREE.Curve(), tmp = new THREE.Group(), gira = R.gira; R.gira = false;
  curva.getPoint = (t, v = new V3()) => engRielP(R, t, v);
  mesh(new THREE.TubeGeometry(curva, Math.round(R.L * 4), 0.14, 6, false), M.oro, 0, 0, 0, tmp);
  const n = Math.round(R.L / 0.5);
  for (let k = 0; k <= n; k++){ const s = k / n, p = engRielP(R, s, engV[0]), d = mesh(B(0.34, 0.12, 0.34), M.bronce, p.x, p.y - 0.13, p.z, tmp); d.rotation.y = R.a0 + s * R.vueltas * TAU; }
  const sop = Math.round(R.L / 2.2);
  for (let k = 0; k <= sop; k++){ const s = k / sop, p = engRielP(R, s, engV[0]), a = R.a0 + s * R.vueltas * TAU, r0 = R.id === 'columna' ? ENG_EJE_R - 0.1 : R.r, r1 = R.id === 'columna' ? R.r : ENG_MURO_R + 0.2, L = r1 - r0;
    const b = mesh(B(0.16, 0.16, L), M.oscuro, Math.sin(a) * (r0 + L / 2), p.y - 0.22, Math.cos(a) * (r0 + L / 2), tmp); b.rotation.y = a; }
  R.gira = gira; mpFusiona(tmp, dst);
}
function engConstruye(){
  if (ENG.built) return; ENG.built = true;
  const R32 = mulberry32(5150); engR = () => R32();
  const M = ENG.M = { piedra: texMat(gStoneTex), cara: texMat(gRuneTex, { emissive: 0.3 }), bronce: makeMat(0xa8743a), oro: makeMat(0xd9a441, { emissive: 0.1 }), oscuro: makeMat(0x2a2632),
    muro: makeMat(0x8a7a86, { map: MPT['ruinas-muro'], side: THREE.BackSide }), rojo: makeMat(0xff4a36, { emissive: 1, opacity: 0.55 }) };   // (rojo 0xff4a36: el 0xff3a2a semitransparente lo cogería sweepTeles)
  const W = ENG.W = new THREE.Group(); W.visible = false; scene.add(W);
  // la esfera del reloj (el suelo), el banco de piedra y la pared del foso
  const esfera = canvasTex(1024, 1024, engPintaEsfera);
  mesh(new THREE.CircleGeometry(ENG_MURO_R, 48), makeMat(0xffffff, { map: esfera }), 0, 0, 0, W).rotation.x = -Math.PI / 2;
  { const tmp = new THREE.Group();
    mesh(scaleUV(C(ENG_MURO_R, ENG_MURO_R, 1.1, 48, true), 12, 1), M.piedra, 0, 0.55, 0, tmp).material = M.piedra;
    for (let i = 0; i < 12; i++){ const a = i / 12 * TAU, b = mesh(B(1.4, 1.5, 0.6), i % 3 ? M.piedra : M.oro, Math.sin(a) * (ENG_MURO_R - 0.1), 0.75, Math.cos(a) * (ENG_MURO_R - 0.1), tmp); b.rotation.y = a; }
    for (let i = 0; i < 9; i++){ const a = i / 9 * TAU + 0.15, x = Math.sin(a) * (ENG_MURO_R - 0.4), z = Math.cos(a) * (ENG_MURO_R - 0.4), n = 8 + (i % 3) * 3;   // cadenas
      for (let k = 0; k < n; k++){ const l = mesh(new THREE.TorusGeometry(0.22, 0.06, 4, 8), M.oscuro, x, 27 - k * 0.42, z, tmp); l.rotation.y = k % 2 ? Math.PI / 2 : 0; } }
    mesh(scaleUV(C(ENG_MURO_R + 2, ENG_MURO_R, 1.4, 40, true), 14, 1), M.piedra, 0, 28, 0, tmp);
    mpFusiona(tmp, W); }
  mesh(scaleUV(C(ENG_MURO_R + 0.2, ENG_MURO_R + 0.2, 30, 40, true), 30, 10), M.muro, 0, 13, 0, W);
  ENG.ruedasMuro = []; const MM = { bronce: makeMat(0x5a4030), oro: makeMat(0x8a6a3a), piedra: makeMat(0x4a3e46) };   // los de la pared, más oscuros (al fondo)
  for (let i = 0; i < 7; i++){ const a = i / 7 * TAU + 0.3, y = 5 + (i % 3) * 7 + engR() * 2, Rr = 2.2 + engR() * 1.8, g = engRueda(Rr, 0.7, 14 + (i % 3) * 4, MM);
    const piv = new THREE.Group(); piv.position.set(Math.sin(a) * (ENG_MURO_R - 0.3), y, Math.cos(a) * (ENG_MURO_R - 0.3)); piv.rotation.y = a; W.add(piv);
    g.rotation.x = Math.PI / 2; piv.add(g); g.userData.w = (i % 2 ? 1 : -1) * (0.25 + engR() * 0.3); ENG.ruedasMuro.push(g); }
  ENG.luces = [0, 1].map(i => { const m = addMesh7(new THREE.CylinderGeometry(2.4 + i, 6 + i * 2, 30, 16, 1, true), addMat7(0xffc890, 0.09, null), W); m.position.set(i ? -4 : 3, 14, i ? 2 : -3); m.rotation.z = i ? 0.12 : -0.1; return m; });
  // la columna (la punta en y = 0 del grupo), con su raíl, y el raíl de la pared
  const eje = ENG.eje = new THREE.Group(); W.add(eje);
  { const tmp = new THREE.Group();
    // (la piedra y las barras acaban dentro de la tapa: antes sus caras de arriba coincidían con la de la tapa y parpadeaban)
    mesh(scaleUV(C(ENG_EJE_R, ENG_EJE_R, 29.3, 16), 4, 8), M.piedra, 0, -15.35, 0, tmp);
    for (let i = 0; i < 8; i++){ const a = i / 8 * TAU; mesh(B(0.3, 29.3, 0.3), M.bronce, Math.sin(a) * ENG_EJE_R, -15.35, Math.cos(a) * ENG_EJE_R, tmp).rotation.y = a; }
    for (let k = 0; k < 6; k++) mesh(new THREE.TorusGeometry(ENG_EJE_R + 0.08, 0.12, 4, 20), M.oro, 0, -1.2 - k * 3.4, 0, tmp).rotation.x = Math.PI / 2;
    const tapa = mesh(C(ENG_EJE_R + 0.9, ENG_EJE_R + 0.3, 0.6, 18), M.oro, 0, -0.3, 0, tmp);
    // remate: disco de bronce con dientes y un buje dorado (separados 1-2 cm de la tapa: nada de caras en el mismo plano)
    mesh(C(ENG_EJE_R + 0.45, ENG_EJE_R + 0.55, 0.12, 18), M.bronce, 0, 0.07, 0, tmp);
    for (let i = 0; i < 12; i++){ const a = i / 12 * TAU; mesh(B(0.32, 0.16, 0.34), M.bronce, Math.sin(a) * (ENG_EJE_R + 0.62), 0.09, Math.cos(a) * (ENG_EJE_R + 0.62), tmp).rotation.y = a; }
    mesh(C(0.55, 0.7, 0.3, 12), M.oro, 0, 0.27, 0, tmp); mesh(C(0.22, 0.22, 0.12, 8), M.oscuro, 0, 0.47, 0, tmp);
    mpFusiona(tmp, eje); }
  ENG.rielCol = new THREE.Group(); eje.add(ENG.rielCol); ENG.rielCol.position.y = -ENG_EJE_TOP; engRielMalla(ENG_RIELES[0], M, ENG.rielCol);
  ENG.rielPar = new THREE.Group(); W.add(ENG.rielPar); engRielMalla(ENG_RIELES[1], M, ENG.rielPar);
  ENG.pinones = ENG_RIELES.map(R => { const pin = new THREE.Group(); W.add(pin);
    const aro = addMesh7(planeGeo7, addMat7(0x7ff5ff, 0.8, clockTex7), pin); aro.rotation.x = -Math.PI / 2; aro.scale.setScalar(2.0); aro.position.y = 0.03; pin.userData.aro = aro;
    const haz = addMesh7(new THREE.CylinderGeometry(0.35, 0.6, 5, 10, 1, true), addMat7(0x7ff5ff, 0.25, null), pin); haz.position.y = 2.5; return pin; });
  // agujas del reloj (a ras de suelo, barren la esfera)
  ENG.agujas = ENG_AGUJAS.map((A, i) => { const tmp = new THREE.Group(), g = new THREE.Group();
    mesh(B(A.ancho, A.alto, A.L - 1.6), M.oscuro, 0, A.alto / 2, (A.L + 1.6) / 2, tmp);
    mesh(B(A.ancho * 0.5, 0.06, A.L - 2), M.oro, 0, A.alto + 0.03, (A.L + 1.6) / 2, tmp);
    const p = mesh(new THREE.ConeGeometry(A.ancho * 1.4, 1.4, 4), M.oro, 0, A.alto / 2, A.L + 0.5, tmp); p.rotation.x = Math.PI / 2;
    mesh(C(1.9, 1.9, A.alto + 0.1 + i * 0.12, 16), M.oro, 0, (A.alto + i * 0.12) / 2, 0, tmp);
    mpFusiona(tmp, g); W.add(g);
    const filo = addMesh7(B(0.08, 0.08, A.L - 1.6), addMat7(0xff5a3a, 0.9, null), g); filo.position.set(A.ancho / 2 + 0.05, A.alto * 0.6, (A.L + 1.6) / 2); g.userData.filo = filo;
    return g; });
  // chorros de vapor junto a la pared: te lanzan hasta su raíl
  ENG.vapores = ENG_VAPOR.map((s, i) => { const p = engRielP(ENG_RIELES[1], s, engV[0]), a = Math.atan2(p.x, p.z), g = new THREE.Group();
    g.position.set(Math.sin(a) * 12.0, 0, Math.cos(a) * 12.0); W.add(g);
    const tmp = new THREE.Group(); mesh(C(1.1, 1.25, 0.24, 12), M.bronce, 0, 0.12, 0, tmp);
    for (let k = 0; k < 4; k++) mesh(B(1.9, 0.06, 0.12), M.oscuro, 0, 0.25, -0.6 + k * 0.4, tmp);
    mpFusiona(tmp, g);
    const col = addMesh7(new THREE.CylinderGeometry(0.7, 1.1, 1, 12, 1, true), addMat7(0xfff4e8, 0.5, null), g); col.position.y = 0.5; col.visible = false;
    return { a, g, col, t: i * 2.1, est: 'quieto', lanzo: false }; });
  // piedras y avisos, la mirada, la embestida, la campana y el picado
  ENG.piedras = Array.from({ length: 5 }, () => { const m = mesh(new THREE.DodecahedronGeometry(0.7, 0), M.piedra, 0, 0, 0, W); m.visible = false;
    const tele = mesh(new THREE.RingGeometry(0.95, 1.2, 20), M.rojo, 0, 0, 0, W); tele.rotation.x = -Math.PI / 2; tele.visible = false;
    return { m, tele, on: false }; });
  { const g = ENG.mirada = new THREE.Group(); g.visible = false; W.add(g);
    const L = ENG_MURO_R - 1.6, haz = addMesh7(B(0.32, 0.32, L), addMat7(0xff7a3a, 1, null), g); haz.position.z = (ENG_MURO_R + 1.6) / 2; g.userData.haz = haz;
    const nucleo = addMesh7(B(0.12, 0.12, L), addMat7(0xffffff, 1, null), g); nucleo.position.z = (ENG_MURO_R + 1.6) / 2; g.userData.nucleo = nucleo;
    const aviso = mesh(B(0.12, 0.05, L), M.rojo, 0, 0, (ENG_MURO_R + 1.6) / 2, g); g.userData.aviso = aviso;
    ENG.rayoOjo = addMesh7(new THREE.CylinderGeometry(0.18, 0.08, 1, 6, 1, true), addMat7(0xff9a5a, 0.9, null), W); ENG.rayoOjo.visible = false; }
  ENG.linea = mesh(B(0.18, 0.18, 1), M.rojo, 0, 0, 0, W); ENG.linea.visible = false;
  ENG.aros = [0, 1].map(() => { const m = addMesh7(new THREE.TorusGeometry(1, 0.09, 4, 48), addMat7(0xffd27a, 1, null), W); m.rotation.x = Math.PI / 2; m.visible = false; return { m, r: 0, on: false, hit: false }; });
  ENG.marca = mesh(new THREE.RingGeometry(1.9, 2.2, 28), M.rojo, 0, 0, 0, W); ENG.marca.rotation.x = -Math.PI / 2; ENG.marca.visible = false;
  ENG.onda = addMesh7(new THREE.TorusGeometry(1, 0.1, 4, 48), addMat7(0xffe0a0, 1, null), W); ENG.onda.rotation.x = Math.PI / 2; ENG.onda.visible = false;
}

/* ---------- Montar y desmontar el escenario ---------- */
function engMonta(){
  if (ENG.montado) return; engConstruye(); ENG.montado = true; limpiaEfectos();
  const U = skyMat.uniforms;
  ENG.prev = { ARENA, amb: ambMode, fogN: shared.uFogNear.value, fogF: shared.uFogFar.value, fogC: shared.uFogCol.value.getHex(), luz: shared.uLightCol.value.clone(), ambC: shared.uAmb.value.getHex(),
    top: U.uTop.value.getHex(), mid: U.uMid.value.getHex(), hor: U.uHor.value.getHex(), moon: U.uMoonOn.value, stars: U.uStars.value, ocultos: [], dist: camDist, pitch: camPitch };
  const lista = [...BIOMES.map(b => b.group), ground, rune, braz, toroBig, homeGroup, renderGroup, ...brazRuins, ...mountainsList, ...ambP];
  for (const o of lista) if (o && o.visible){ o.visible = false; ENG.prev.ocultos.push(o); }
  ambMode = null;
  for (const p of pickups) scene.remove(p.m); pickups.length = 0;
  ARENA = ENG_ARENA;
  U.uTop.value.setHex(0x3a2a52); U.uMid.value.setHex(0xa2604a); U.uHor.value.setHex(0xffb878); U.uMoonOn.value = 0; U.uStars.value = 0;
  shared.uFogCol.value.setHex(0x2e2024); shared.uFogNear.value = 16; shared.uFogFar.value = 70;
  shared.uLightCol.value.setHex(0xffd8b0).multiplyScalar(0.95); shared.uAmb.value.setHex(0x6a5a72);
  ENG.W.visible = true; ENG.base = 0; ENG.W.position.y = 0;
  camDist = Math.max(camDist, 8.2); camPitch = clamp(camPitch, 0.32, 0.55);
  document.body.classList.add('engOn'); engSonLoop(true);
}
function engDesmonta(){
  if (!ENG.montado) return; ENG.montado = false; limpiaEfectos();
  const P_ = ENG.prev, U = skyMat.uniforms;
  for (const o of P_.ocultos) o.visible = true;
  ambMode = P_.amb; ARENA = P_.ARENA; camDist = P_.dist; camPitch = P_.pitch;
  U.uTop.value.setHex(P_.top); U.uMid.value.setHex(P_.mid); U.uHor.value.setHex(P_.hor); U.uMoonOn.value = P_.moon; U.uStars.value = P_.stars;
  shared.uFogCol.value.setHex(P_.fogC); shared.uFogNear.value = P_.fogN; shared.uFogFar.value = P_.fogF; shared.uLightCol.value.copy(P_.luz); shared.uAmb.value.setHex(P_.ambC);
  if (ENG.eje.userData.funde) fundeQuita(ENG.eje); for (const g of ENG.ruedasMuro) if (g.userData.funde) fundeQuita(g);
  ENG.W.visible = false; ENG.W.position.y = 0; camTarget.y -= ENG.base; hero.position.y = Math.max(0, hero.position.y); ENG.base = 0; ENG.riel = null; ENG.salto = null;
  P.body.rotation.y = 0; ENG.giroOn = false;
  document.body.classList.remove('engOn'); engSonLoop(false);
}
function engQuitaAtaques(){
  if (ENG.atq && ENG.atq.c){ ENG.atq.c.forEach(tintaSuelta); ENG.atq.c = null; }
  ENG.atq = null; for (const p of ENG.piedras){ p.on = false; p.m.visible = p.tele.visible = false; }
  ENG.mirada.visible = false; ENG.rayoOjo.visible = false; ENG.linea.visible = false; for (const A of ENG.aros){ A.on = false; A.m.visible = false; } ENG.marca.visible = false; ENG.onda.visible = false;
}
function engGuardianSuelta(){   // el Guardián vuelve a la escena tal y como era
  const e = ENG.e; if (!e || !e.g) return;
  scene.add(e.g); e.g.scale.setScalar(e.scale); e.g.rotation.set(0, e.g.rotation.y, 0); e.body.position.set(0, 0, 0); e.torso.rotation.set(0, 0, 0);
  e.legs.forEach(L => { L.visible = true; L.rotation.set(0, 0, 0); }); e.halo.scale.setScalar(1); for (const A of e.arms){ A.rotation.set(0, 0, 0); A.userData.el.rotation.set(0, 0, 0); }
  e.head.rotation.set(0, 0, 0); e.coreG.scale.setScalar(1); e.coreG.visible = true;
}
function engLimpia(){
  const n = ENG.nucleo; if (n){ n.alive = false; n.remove = true; scene.remove(n.g); }
  ENG.nucleo = null; if (ENG.built) engQuitaAtaques();
}
function engAborta(){   // salir a medias (morir y reintentar, volver al título…)
  if (!ENG.on && !ENG.montado) return;
  engLimpia(); engGuardianSuelta(); engDesmonta(); ENG.on = false; ENG.fase = null; ENG.e = null;
  if (bossE && bossE.type === 'engcol'){ bossE = null; bossBox.hidden = true; }
}

/* ---------- El mecanismo, fotograma a fotograma ---------- */
function engMeca(dt){
  const v = ENG.vel * (ENG.parado > 0 ? 0 : 1); ENG.t += dt;
  ENG.ejeA += dt * 0.3 * v;
  ENG.eje.position.y = engEjeTop(); ENG.eje.rotation.y = ENG.ejeA;
  ENG.rielPar.position.y = -ENG.cae * ENG.cae * 4;
  for (let i = 0; i < 2; i++){ const pin = ENG.pinones[i], p = engRielP(ENG_RIELES[i], 0.012, engV[0]); pin.position.set(p.x, 0, p.z);
    pin.visible = engJugando() && !ENG.riel && !ENG.salto; if (pin.visible){ pin.userData.aro.rotation.z += dt * 2; pin.userData.aro.scale.setScalar(2.0 + 0.25 * Math.sin(ENG.t * 5)); } }
  for (const g of ENG.ruedasMuro) g.rotation.y += dt * g.userData.w * v;
  ENG_AGUJAS.forEach((A, i) => { ENG.agujaA[i] += dt * A.w * v * (ENG.fase === 'cine' || ENG.fase === 'remate' ? 0.3 : 1); ENG.agujas[i].rotation.y = ENG.agujaA[i]; ENG.agujas[i].visible = ENG.sube > 0.5; });
  for (const L of ENG.luces) L.rotation.y += dt * 0.05;
  if ((ENG.ticT -= dt) <= 0 && ENG.cae <= 0 && v > 0){ ENG.ticT = 0.5 / v; play(ENG.ticN++ % 2 ? 'engToc' : 'engTic'); }   // tictac
}

/* ---------- El Guardián: en lo alto del eje, volando, derribado ---------- */
function engGuardian(dt){
  const e = ENG.e; if (!e) return;
  const G = ENG.g, H = hero.position, f = engPies(); G.t += dt;
  if (G.est === 'eje'){ G.p.set(0, engEjeTop() + ENG_CORE * ENG_SC + 0.05, 0); }
  else if (G.est === 'despega'){ const k = smooth(Math.min(1, G.t / 1.6)); G.p.set(Math.sin(G.a) * G.r * k, lerp(engEjeTop() + ENG_CORE * ENG_SC, G.y, k) + Math.sin(k * Math.PI) * 2.5, Math.cos(G.a) * G.r * k);
    if (G.t >= 1.6) engVuela(); }
  else if (G.est === 'vuela'){
    if ((G.cambio -= dt) <= 0){ G.cambio = 2.2 + rnd() * 2.2; G.rObj = 5.2 + rnd() * 3.6; if (rnd() < 0.5) G.aw = -G.aw; G.aw = Math.sign(G.aw || 1) * (0.32 + 0.12 * ENG.rondas + rnd() * 0.18); }
    const yObj = clamp((ENG.riel || ENG.salto ? f : 3) + 1.4 + Math.sin(G.t * 0.7) * 1.8, 2.6, 10.2);
    if ((ENG.riel || ENG.salto) && !(ENG.atq && ENG.atq.mueve)){   // montado: ronda por delante de ti, entre las dos paredes (cada salto puede cruzarse con él)
      const obj = Math.atan2(H.x, H.z) + Math.sign(G.aw || 1) * 0.5, da = engAng(obj - G.a), w = 0.9 + 0.25 * ENG.rondas; G.a += clamp(da, -w * dt, w * dt) * ENG.vel; }
    else G.a += G.aw * dt * ENG.vel;
    G.r += (G.rObj - G.r) * (1 - Math.exp(-dt * 1.2)); G.y += (yObj - G.y) * (1 - Math.exp(-dt * 0.9));
    if (!(ENG.atq && ENG.atq.mueve)) G.p.set(Math.sin(G.a) * G.r, G.y + Math.sin(G.t * 2.2) * 0.25, Math.cos(G.a) * G.r);
  } else if (G.est === 'cae'){
    G.v.y -= 20 * dt; G.p.addScaledVector(G.v, dt); G.giro += dt * 5;
    const rr = Math.hypot(G.p.x, G.p.z); if (rr > 10.5){ G.p.x *= 10.5 / rr; G.p.z *= 10.5 / rr; } if (rr < 3.6 && rr > 0.01){ G.p.x *= 3.6 / rr; G.p.z *= 3.6 / rr; }
    if (G.p.y <= 1.7){ G.p.y = 1.7; engAterriza(); }
  } else if (G.est === 'derribado'){
    if (G.t > 8.5) engLevanta(false);
  } else if (G.est === 'levanta'){
    const k = smooth(Math.min(1, G.t / 1.5)); G.p.y = lerp(ENG_CORE * ENG_SC, G.y, k);
    if (G.t >= 1.5){ G.r = Math.hypot(G.p.x, G.p.z); G.a = Math.atan2(G.p.x, G.p.z); engVuela(); }
  }
  // pose
  const sc = ENG_SC, abajo = G.est === 'derribado';
  e.g.scale.setScalar(sc); e.g.position.set(G.p.x, abajo ? -0.05 : G.p.y - ENG_CORE * sc, G.p.z);   // derribado: de rodillas en la esfera
  const yaw = G.est === 'cae' ? e.g.rotation.y : Math.atan2(H.x - G.p.x, H.z - G.p.z);
  e.g.rotation.y = lerpAngle(e.g.rotation.y, yaw, 1 - Math.exp(-dt * (ENG.atq && ENG.atq.tipo === 'embestida' ? 8 : 3)));
  e.g.rotation.x = G.est === 'cae' ? Math.sin(G.giro) * 0.6 : 0; e.g.rotation.z = G.est === 'cae' ? Math.cos(G.giro * 0.7) * 0.4 : G.est === 'vuela' ? -G.aw * 0.25 : 0;
  e.halo.scale.setScalar(1.6); e.halo.rotation.z += dt * (abajo ? 0.2 : 1 + 0.5 * ENG.vel + (ENG.atq && ENG.atq.tipo === 'campanada' && ENG.atq.t < 1 ? 6 : 0));
  e.coreG.rotation.z += dt * 2; e.coreG.scale.setScalar(1 + Math.sin(ENG.t * 6) * 0.1 + (abajo ? 0.5 + 0.15 * Math.sin(ENG.t * 14) : 0));
  e.mats[1].em = abajo ? 0.15 : 0.3 + 0.3 * Math.abs(Math.sin(ENG.t * 3)); e.faceMat.uniforms.uMap.value = abajo || ENG.fase === 'remate' ? gFaceD : gFaceA;
  bl(e.body.position, 'y', abajo ? -0.45 : 0, 1 - Math.exp(-dt * 10));
  bl(e.torso.rotation, 'x', abajo ? 0.75 : ENG.atq && ENG.atq.tipo === 'embestida' && ENG.atq.t > 0.9 ? 0.6 : 0.08, 1 - Math.exp(-dt * 6));
  bl(e.head.rotation, 'x', abajo ? 0.5 : clamp(-Math.atan2(f + 1 - G.p.y - 1.5, Math.max(1, Math.hypot(H.x - G.p.x, H.z - G.p.z))) * 0.6, -0.3, 0.6), 1 - Math.exp(-dt * 4));
  e.legs.forEach((L, i) => { bl(L.rotation, 'x', abajo ? -1.3 : 0.25 + Math.sin(ENG.t * 2 + i * Math.PI) * 0.2, 1 - Math.exp(-dt * 6)); });
  e.arms.forEach((Ar, i) => { let x = -0.4 + Math.sin(ENG.t * 1.6 + i * Math.PI) * 0.2, z = (i ? 1 : -1) * 0.55;
    if (abajo){ x = -0.6; z = (i ? 1 : -1) * 0.15; } else if (ENG.atq && ENG.atq.tipo === 'rocas' && ENG.atq.t < 0.5){ x = -2.4; z = 0; }
    else if (ENG.atq && ENG.atq.tipo === 'embestida'){ x = -1.5; z = (i ? 1 : -1) * 0.2; } else if (G.est === 'cae'){ x = -2.8; z = (i ? 1 : -1) * 1.2; }
    bl(Ar.rotation, 'x', x, 1 - Math.exp(-dt * 6)); bl(Ar.rotation, 'z', z, 1 - Math.exp(-dt * 6)); Ar.userData.el.rotation.x = Math.min(0, Ar.rotation.x) * 0.3 - 0.12; });
  if (G.est === 'vuela' && rnd() < 0.3){ const q = G.p; spawnFx(q.x + (rnd() - 0.5) * 2, q.y - ENG.base - 2.2, q.z + (rnd() - 0.5) * 2, 0, -1.5, 0, 0x9a8a7a, 0.16, 0.6, 2, 0.5); }
}
function engVuela(){ const G = ENG.g; G.est = 'vuela'; G.t = 0; G.cambio = 0; if (!G.aw) G.aw = 0.4; }
// ATACAR en pleno salto: un tajo dorado que solo pega mientras dura (ENG_TAJO.t); si fallas, hay que esperar un poco
const ENG_TAJO = { t: 0.28, cd: 0.55, r: 3.0, alto: 3.0 };
function engTajoAire(){
  const S = ENG.salto; if (!S || S.cd > 0) return;
  S.tajo = ENG_TAJO.t; S.cd = ENG_TAJO.cd; S.tajoT = time; play('swingBig');
  const H = hero.position, f = Math.atan2(S.dir.x, S.dir.z);
  for (let i = 0; i < 9; i++){ const a = f + (i / 8 - 0.5) * 2.6, c = Math.cos(a - f); streak7(H.x + Math.sin(a) * 1.3, H.y + 0.9 + c * 0.3, H.z + Math.cos(a) * 1.3, Math.cos(a), 0, -Math.sin(a), 0.7, i % 2 ? 0xffd27a : 0xffffff, 0.22, 0.07); }
}
function engDerriba(dir){   // le has dado en pleno salto: al suelo
  const G = ENG.g; G.est = 'cae'; G.t = 0; G.giro = 0; G.v.set(dir.x * 3, 3, dir.z * 3); ENG.atq = null; engQuitaAtaques(); ENG.parado = 1;
  const q = engV[3].copy(G.p); q.y -= ENG.base;
  flash('#fff4d0', 0.6); shake = Math.max(shake, 1.0); hitStop = 0.14; slowT = Math.max(slowT, 0.7); play('engRompe'); play('boom'); play('engCampana');
  for (let i = 0; i < 26; i++){ const a = rnd() * TAU, sp = 3 + rnd() * 5; spawnFx(q.x, q.y, q.z, Math.cos(a) * sp, rnd() * 6 - 1, Math.sin(a) * sp, rnd() < 0.5 ? 0xffd27a : rnd() < 0.5 ? 0x7ff5ff : 0xffffff, 0.14, 0.8, 8, 0.4); }
  sparks(q.x, q.y, q.z, 18, 0xffd27a, 7); lightFlash(q.x, q.y, q.z, 0xffd27a, 2.4, 10);
  // Tovan rebota y cae a la esfera
  const H = hero.position, f = engPies(); ENG.salto = null; ENG.riel = null; ENG.rielCd = 0.9; engRebase(0, true); hero.position.y = f; grounded = false; vy = 5;
  player.kx = -dir.x * 4; player.kz = -dir.z * 4; player.inv = Math.max(player.inv, 0.6);
}
function engAterriza(){
  const G = ENG.g, x = G.p.x, z = G.p.z; G.est = 'derribado'; G.t = 0; ENG.parado = 1;
  shake = Math.max(shake, 1.1); play('slam'); play('boom'); ringFx(x, z, 0xd8c8a8, 0.4, 5, 0.5, -ENG.base + 0.05); puffAt(x, z, 18, 2.6, 0x9a8a7a);
  for (let i = 0; i < 16; i++){ const a = rnd() * TAU; spawnFx(x, 0.4 - ENG.base, z, Math.cos(a) * 5, 2 + rnd() * 4, Math.sin(a) * 5, 0x7a6a62, 0.18, 0.8, 14, 0); }
}
function engLevanta(ronda){   // se levanta (onda que hay que saltar) y vuelve a volar
  const G = ENG.g; if (G.est !== 'derribado') return;
  G.est = 'levanta'; G.t = 0; G.y = 6.5; ENG.parado = 0; play('dragonRoar'); play('engCampana');
  ENG.onda.visible = true; ENG.onda.userData = { r: 1.5, x: G.p.x, z: G.p.z, hit: false };
  ENG.atqCd = 2.4;
}

/* ---------- Física: el suelo, los raíles y los saltos entre paredes ---------- */
function engRebase(y, enElAire){   // cambia el cero de Tovan a la altura y (el mundo se mueve, Tovan no)
  const d = y - ENG.base; if (!d) return;
  ENG.base = y; ENG.W.position.y = -y;
  if (enElAire){ hero.position.y -= d; camTarget.y -= d; }
}
function engRielCerca(maxD, soloBajo){   // el punto de raíl más cercano a Tovan
  const H = hero.position, f = engPies() + 0.2; let best = null, bd = maxD;
  ENG_RIELES.forEach(R => { const n = Math.round(R.L * 3);
    for (let k = 0; k <= n; k++){ const s = k / n; if (s > 0.985) break; const p = engRielP(R, s, engV[2]); if (soloBajo && Math.abs(p.y - f) > 1.1) continue;
      const d = Math.hypot(p.x - H.x, p.z - H.z, (p.y - f) * 0.8); if (d < bd){ bd = d; best = { R, s }; } } });
  return best;
}
function engRielMonta(R, s){
  ENG.riel = { R, s, giro: 0, chispa: 0 }; ENG.salto = null; state = 'normal'; grounded = true; vy = 0; attackW = 0; staffToBack(); ENG.giroOn = true;
  engRebase(engRielP(R, s, engV[0]).y, true); hero.position.y = 0; play('engMonta'); play('clang');
  engDijo('monta', colTactil() ? '¡Eso es! SALTAR te lanza a la otra pared. Si en el salto pulsas ATACAR cuando pasa cerca, lo derribas. RODAR te baja.' : '¡Eso es! SALTA para cruzar a la otra pared. Si en el salto ATACAS (J) cuando pasa cerca, lo derribas. RODAR te baja.');
}
function engRielSale(modo){   // te bajas (o te tiran) del raíl
  const R = ENG.riel; if (!R) return; ENG.riel = null; ENG.rielCd = 0.7;
  const p = engRielP(R.R, R.s, engV[0]), a = Math.atan2(p.x, p.z), dentro = R.R.id === 'pared' ? -1 : 1;
  grounded = false; vy = modo === 'golpe' ? 3 : 4.5; player.kx = Math.sin(a) * 3 * dentro; player.kz = Math.cos(a) * 3 * dentro;
}
function engCruzaDestino(R0, s0, baja = 0.4){   // el punto del otro raíl más «enfrente» y a una altura parecida (o algo más abajo)
  const p = engRielP(R0, s0, engV[0]), th = Math.atan2(p.x, p.z), R2 = ENG_RIELES[R0.id === 'columna' ? 1 : 0], n = Math.round(R2.L * 3);
  let best = 0, bc = 1e9;
  for (let k = 0; k <= n; k++){ const s = k / n * 0.97, q = engRielP(R2, s, engV[1]), da = Math.abs(engAng(Math.atan2(q.x, q.z) - th));
    const c = da * 3.2 + Math.abs(q.y - (p.y - baja)); if (c < bc){ bc = c; best = s; } }
  return { R2, s2: best };
}
function engCruza(baja){   // SALTAR montado: un arco hasta el otro raíl (al final del raíl, unos metros más abajo)
  const R = ENG.riel; if (!R) return;
  const from = engRielP(R.R, R.s, new V3()), { R2, s2 } = engCruzaDestino(R.R, R.s, baja), to = engRielP(R2, s2, engV[1]);
  const d = from.distanceTo(to);
  ENG.salto = { from, R2, s2, t: 0, T: 0.42 + d / 40, pico: 1.2 + Math.max(0, to.y - from.y) * 0.45 + d * 0.04, dir: new V3(to.x - from.x, 0, to.z - from.z).normalize(), giro: R.giro, rebote: false };
  ENG.riel = null; play('engSalto'); play('jump'); puff(4, 0.8); ENG.kick = 1;   // (la cámara se aleja un pelín: sensación de impulso)
}
function engSaltoTick(pdt){
  const S = ENG.salto, H = hero.position; S.t += pdt; S.giro += pdt * 26;
  const k = Math.min(1, S.t / S.T), to = engRielP(S.R2, S.s2, engV[1]);
  const x = lerp(S.from.x, to.x, k), z = lerp(S.from.z, to.z, k), y = lerp(S.from.y, to.y, k) + 4 * S.pico * k * (1 - k);
  engRebase(y, false); H.x = x; H.z = z; H.y = 0; grounded = true; vy = 0;
  heading = Math.atan2(S.dir.x, S.dir.z); hero.rotation.y = heading;
  if (rnd() < 0.6) spawnFx(x, 0.6, z, 0, 0, 0, rnd() < 0.5 ? 0x7ff5ff : 0xffd27a, 0.1, 0.35, 0, -0.5);
  if (pdt > 0) streak7(x, 0.7 + (rnd() - 0.5) * 0.6, z, -S.dir.x, 0, -S.dir.z, 1.4 + rnd(), rnd() < 0.5 ? 0xffe7b0 : 0xffffff, 0.16, 0.035);   // estela del salto
  // ¿le das? Solo con el tajo en el aire (ATACAR) y con él a tiro; tocarlo sin más no hace nada
  const G = ENG.g, aTiro = (G.est === 'vuela' || G.est === 'despega') && Math.hypot(G.p.x - x, G.p.z - z) < ENG_TAJO.r && Math.abs(G.p.y - (y + 0.8)) < ENG_TAJO.alto;
  if (S.cd > 0) S.cd -= pdt;
  if (S.tajo > 0){ S.tajo -= pdt; if (aTiro){ engDerriba(S.dir); return; } }
  else if (aTiro && rnd() < 0.7){ const q = G.p; spawnFx(q.x + (rnd() - 0.5) * 1.6, q.y - ENG.base + (rnd() - 0.2) * 1.6, q.z + (rnd() - 0.5) * 1.6, 0, 1.2, 0, rnd() < 0.5 ? 0xffd27a : 0xffffff, 0.1, 0.3, 0, -0.5); }   // a tiro: el núcleo chispea
  if (k >= 1){ ENG.salto = null; ENG.riel = { R: S.R2, s: S.s2, giro: S.giro, chispa: 0 }; play('clang'); sparks(x, 0.2, z, 8, 0xffd27a, 3); landT = 0.12;
    if (S.rebote && !player.dead){ ringFx(x, z, 0xffe7b0, 0.2, 1.4, 0.25, 0.1); engCruza(); } }   // saltar al final del salto: rebota en cuanto toca el raíl y vuelve
}
function engRielTick(pdt){
  const R = ENG.riel, H = hero.position;
  R.s += pdt * R.R.v / R.R.L; R.giro += pdt * 24;
  if (R.s >= 0.985){ R.s = 0.985; engCruza(4.5); return; }   // al final del raíl, salta solo al otro
  const p = engRielP(R.R, R.s, engV[0]), q = engRielP(R.R, Math.min(1, R.s + 0.01), engV[1]);
  engRebase(p.y, !grounded); H.x = p.x; H.z = p.z; heading = Math.atan2(q.x - p.x, q.z - p.z); hero.rotation.y = heading;
  if ((R.chispa -= pdt) <= 0 && grounded){ R.chispa = 0.05; const c = rnd() < 0.5 ? 0xffd27a : 0xffffff; spawnFx(H.x, 0.15, H.z, (rnd() - 0.5) * 3, 1.5 + rnd() * 2, (rnd() - 0.5) * 3, c, 0.08, 0.35, 9, 0); }
}
function engFisica(pdt){
  const H = hero.position;
  if (ENG.salto){ engSaltoTick(pdt); return; }
  if (ENG.riel){ engRielTick(pdt); return; }
  // en el suelo (la esfera) o cayendo hacia ella
  if (ENG.base !== 0) engRebase(0, true);
  if (!grounded && vy < 0 && !player.dead && ENG.rielCd <= 0){ const c = engRielCerca(0.8); if (c) engRielMonta(c.R, c.s); }   // caer sobre un raíl te engancha
  { const d = Math.hypot(H.x, H.z), r = ENG_EJE_R + 0.38; if (d < r && d > 0.0001){ H.x *= r / d; H.z *= r / d; } }   // la columna
  const G = ENG.g; if (G.est === 'derribado' || G.est === 'levanta'){ const dx = H.x - G.p.x, dz = H.z - G.p.z, d = Math.hypot(dx, dz), r = 1.9; if (d < r && d > 0.0001 && H.y < 2){ H.x = G.p.x + dx / d * r; H.z = G.p.z + dz / d * r; } }
}

/* ---------- El núcleo (solo con el Guardián derribado) ---------- */
function engNucleo(){
  const g = new THREE.Group(); scene.add(g); const body = new THREE.Group(); g.add(body);
  const e = newEnemy('nucleo', g, body, ENG.e.mats, { hp: Math.round(ENG.e.maxHp * 0.18), r: 1.3, speed: 0, numY: 1.2, isBoss: true, heavy: true, noSep: true, spawnT: 0,
    engNucleo: true, fzT: 1e9, fzMarks: [], fzOn: 0, fzWarn: 0, upd: () => {} });
  e.dm = ENG.e.dm; return e;
}
function engNucleoTick(){
  const n = ENG.nucleo; if (!n || !n.alive) return;
  ENG.e.g.updateMatrixWorld(true); ENG.e.coreG.getWorldPosition(engV[3]); n.g.position.set(engV[3].x, engV[3].y - 1.0, engV[3].z); n.absY = engV[3].y + ENG.base; n.vx = n.vz = 0;
  n.reach = ENG.g.est === 'derribado';
}
function engAlcanza(e){   // solo se le pega derribado y desde el suelo
  if (!engJugando() || ENG.riel || ENG.salto) return false;
  if (ENG.g.est !== 'derribado'){ if (ENG.clangT <= 0){ ENG.clangT = 0.5; play('clang'); } return false; }
  return Math.abs(e.absY - (engPies() + 0.8)) < 2.2;
}
function engBarra(){
  if (!bossE || bossE.type !== 'engcol' || !ENG.e || !ENG.nucleo) return;
  const hN = ENG.nucleo.maxHp; bossE.maxHp = ENG_RONDAS * hN; bossE.hp = (ENG_RONDAS - 1 - ENG.rondas) * hN + Math.max(0, ENG.nucleo.hp);
  const t = "Guardián · segunda vida"; if (bossNameEl.textContent !== t) bossNameEl.textContent = t;
}
function engRondaHecha(e){   // se ha llevado un tercio: se levanta (o, el tercero, se acaba)
  const x = e.g.position.x, y = e.g.position.y + 1, z = e.g.position.z;
  ringFx(x, z, 0x7ff5ff, 0.3, 4.5, 0.5, -ENG.base + 0.05); lightFlash(x, y, z, 0x7ff5ff, 2.2, 9); flash('#e0fbff', 0.5); shake = Math.max(shake, 0.8); hitStop = 0.12; slowT = Math.max(slowT, 0.6);
  for (let i = 0; i < 24; i++){ const a = rnd() * TAU, sp = 3 + rnd() * 5; spawnFx(x, y, z, Math.cos(a) * sp, 2 + rnd() * 6, Math.sin(a) * sp, rnd() < 0.5 ? 0x7ff5ff : 0xffffff, 0.14, 0.9, 9, 0.4); }
  play('engRompe');
  ENG.rondas++;
  if (ENG.rondas >= ENG_RONDAS){ engRemate(); return; }
  e.hp = e.maxHp; ENG.vel = 1 + 0.2 * ENG.rondas; engLevanta(true);
}

/* ---------- Ataques ---------- */
const engEspera = () => Math.max(0.9, 2.1 - 0.35 * ENG.rondas) + rnd() * 0.8;
function engPredice(t){   // dónde estará Tovan dentro de t segundos (en el raíl, si va montado)
  const R = ENG.riel, H = hero.position;
  if (R) return engRielP(R.R, Math.min(0.98, R.s + t * R.R.v / R.R.L), new V3());
  return new V3(H.x, engPies(), H.z);
}
function engElige(){
  const G = ENG.g; if (G.est !== 'vuela') return;
  const enRiel = !!(ENG.riel || ENG.salto);
  let t;
  if (!enRiel && rnd() < 0.55) t = 'aplasta';
  else { const ops = (enRiel ? ['rocas', 'mirada', 'embestida', 'llamarada', 'llamarada', ...(ENG.rondas >= 1 ? ['campanada'] : [])] : ['rocas', 'mirada']).filter(o => o !== ENG.ultimo); t = ops[Math.floor(rnd() * ops.length)]; }
  ENG.ultimo = t; const A = ENG.atq = { tipo: t, t: 0, n: 0 };
  if (t === 'rocas'){ A.total = 3 + (ENG.rondas >= 2 ? 1 : 0); play('bruteWarn'); }
  else if (t === 'mirada'){ const H = hero.position; A.y = engPies() + 0.42; A.dir = rnd() < 0.5 ? -1 : 1; A.a0 = Math.atan2(H.x, H.z) - A.dir * 1.15; A.a = A.a0; A.hit = false;
    ENG.mirada.visible = true; ENG.mirada.userData.haz.visible = ENG.mirada.userData.nucleo.visible = false; ENG.mirada.userData.aviso.visible = true; play('chargeStart'); }
  else if (t === 'llamarada'){   // escupe fuego en tu raíl, por delante de ti, y el frente corre hacia ti: a la otra pared
    const R = ENG.riel || (ENG.salto && { R: ENG.salto.R2, s: ENG.salto.s2 }); A.R = R.R; A.s0 = Math.min(0.97, R.s + 0.24); A.sf = A.s0; A.hit = false;
    A.c = [tintaCoge(LLAMA, 0, 'fuego'), tintaCoge(LLAMA_VIVA, 0, 'fuego')]; play('chargeStart'); play('engLanza'); }
  else if (t === 'campanada'){ A.y = engPies() + 0.3; play('engCampana'); for (const R of ENG.aros){ R.on = false; R.m.visible = false; } }
  else if (t === 'embestida'){ A.mueve = true; A.de = G.p.clone(); A.a = engPredice(1.25); A.a.y += 0.8; A.hit = false; ENG.linea.visible = true; play('bruteWarn'); play('chargeStart'); }
  else if (t === 'aplasta'){ A.mueve = true; const H = hero.position; A.x = H.x; A.z = H.z; const rr = Math.hypot(A.x, A.z); if (rr < 3.5){ A.x *= 3.5 / Math.max(0.01, rr); A.z *= 3.5 / Math.max(0.01, rr); }
    A.de = G.p.clone(); ENG.marca.visible = true; play('bruteWarn'); }
}
function engAtaqueTick(dt){
  ENG.clangT -= dt;
  const G = ENG.g, H = hero.position, f = engPies();
  if (!ENG.atq){ if (G.est === 'vuela' && (ENG.atqCd -= dt) <= 0) engElige(); }
  const A = ENG.atq;
  if (A){ A.t += dt;
    if (A.tipo === 'rocas'){
      while (A.n < A.total && A.t > 0.45 + A.n * 0.42){ const p = ENG.piedras.find(q => !q.on); if (!p) break; A.n++;
        const dest = engPredice(1.1); if (A.n > 1){ dest.x += (rnd() - 0.5) * 1.6; dest.z += (rnd() - 0.5) * 1.6; }
        Object.assign(p, { on: true, t: 0, de: G.p.clone(), a: dest }); p.m.visible = p.tele.visible = true; play('throw'); }
      if (A.n >= A.total && !ENG.piedras.some(p => p.on)) engFinAtq();
    } else if (A.tipo === 'mirada'){
      const M = ENG.mirada; M.position.set(0, A.y, 0);
      if (A.t < 0.85){ M.rotation.y = A.a0; M.userData.aviso.material.uniforms.uOpacity.value = 0.35 + 0.35 * Math.abs(Math.sin(A.t * 16)); }
      else { if (!M.userData.haz.visible){ M.userData.aviso.visible = false; M.userData.haz.visible = M.userData.nucleo.visible = true; ENG.rayoOjo.visible = true; play('beam'); }
        A.a += A.dir * dt * 1.7 * ENG.vel; M.rotation.y = A.a; M.userData.haz.scale.x = M.userData.nucleo.scale.x = 1 + 0.3 * Math.sin(A.t * 40);
        engRayoOjo(A);
        const ah = Math.atan2(H.x, H.z), rho = Math.hypot(H.x, H.z);
        if (!A.hit && rho > 1.6 && Math.abs(engAng(ah - A.a)) * rho < 0.45 && f < A.y + 0.18 && f > A.y - 1.8 && !ENG.salto){
          const r = hurtPlayer(Math.round(13 * ENG.e.dm), H.x - Math.sin(ah + A.dir * 0.3) * 2, H.z - Math.cos(ah + A.dir * 0.3) * 2, 5);
          if (r === 'hit'){ A.hit = true; sparks(H.x, 0.6, H.z, 8, 0xff7a3a, 3); engRielSale('golpe'); } }
        if (Math.abs(engAng(A.a - A.a0)) > 2.4){ M.visible = false; ENG.rayoOjo.visible = false; engFinAtq(); } }
    } else if (A.tipo === 'llamarada'){
      const L = A.R.L, vs = 15 / L, P_ = (s, v) => { engRielP(A.R, s, v); v.y += 0.35 - ENG.base; return v; };
      if (A.t > 0.55) A.sf = Math.max(0, A.sf - vs * dt);   // (el primer medio segundo arde en el sitio: el aviso)
      const fin = clamp((A.t - 2.3) / 0.5, 0, 1), cola = Math.max(A.sf, A.s0 - 0.12 - Math.max(0, A.t - 0.55) * vs * 0.55);
      tintaPinta(A.c[0], P_, A.sf, Math.max(A.sf + 0.002, cola), k => 1.4 * (0.5 + 0.5 * Math.sin(Math.PI * k)) * (1 - fin)); tintaPinta(A.c[1], P_, A.sf, Math.max(A.sf + 0.002, cola), k => 0.7 * (1 - fin));
      if (dt > 0 && rnd() < 0.7){ const q = P_(A.sf, engV[2]); spawnFx(q.x, q.y + 0.3, q.z, (rnd() - 0.5) * 2, 2 + rnd() * 2, (rnd() - 0.5) * 2, rnd() < 0.5 ? 0xffa020 : 0xffe060, 0.12, 0.4, -1, 0.5); }
      const R = ENG.riel; if (!A.hit && R && R.R === A.R && R.s >= A.sf - 0.6 / L && R.s <= cola + 0.4 / L && A.t > 0.55){ A.hit = true;
        const r = hurtPlayer(Math.round(14 * ENG.e.dm), H.x, H.z, 5); if (r === 'hit') engRielSale('golpe'); }
      if (fin >= 1){ A.c.forEach(tintaSuelta); A.c = null; engFinAtq(); }
    } else if (A.tipo === 'campanada'){
      ENG.aros.forEach((R, i) => { const t0 = 0.9 + i * 0.75;
        if (!R.on && A.t >= t0 && A.t < t0 + 0.1){ R.on = true; R.r = ENG_EJE_R + 0.2; R.hit = false; R.m.visible = true; if (i) play('engCampana'); shake = Math.max(shake, 0.25); }
        if (!R.on) return; R.r += dt * 8.5; R.m.position.set(0, A.y, 0); R.m.scale.set(R.r, R.r, 1);
        const rho = Math.hypot(H.x, H.z);
        if (!R.hit && Math.abs(rho - R.r) < 0.42 && f < A.y + 0.22 && f > A.y - 1.6 && !ENG.salto){ const r = hurtPlayer(Math.round(11 * ENG.e.dm), 0, 0, 5); if (r === 'hit'){ R.hit = true; engRielSale('golpe'); } }
        if (R.r > ENG_MURO_R + 1){ R.on = false; R.m.visible = false; } });
      if (A.t > 1.0 && !ENG.aros.some(R => R.on)) engFinAtq();
    } else if (A.tipo === 'embestida'){
      const L = ENG.linea, a = A.a, de = A.de;
      if (A.t < 0.9){ G.p.copy(de).addScaledVector(engV[0].set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5), 0.15);
        const m = engV[1].addVectors(de, a).multiplyScalar(0.5); L.position.copy(m); L.scale.set(1, 1, de.distanceTo(a) + 3); L.lookAt(a); L.material.uniforms.uOpacity.value = 0.3 + 0.35 * Math.abs(Math.sin(A.t * 16)); }
      else { L.visible = false; const dir = engV[1].subVectors(a, de), dl = dir.length(); dir.normalize(); A.d = (A.d || 0) + dt * 17;
        G.p.copy(de).addScaledVector(dir, Math.min(A.d, dl + 3.5)); if (rnd() < 0.8) spawnFx(G.p.x, G.p.y - ENG.base, G.p.z, 0, 0, 0, 0xd8c8a8, 0.3, 0.5, 0, 1.2);
        if (!A.hit && !ENG.salto && Math.hypot(G.p.x - H.x, G.p.z - H.z) < 2.1 && Math.abs(G.p.y - (f + 0.8)) < 2.4){ A.hit = true;
          const r = hurtPlayer(Math.round(16 * ENG.e.dm), G.p.x, G.p.z, 8); if (r === 'hit'){ engRielSale('golpe'); shake = Math.max(shake, 0.6); play('slam'); } }
        if (A.d >= dl + 3.5){ G.a = Math.atan2(G.p.x, G.p.z); G.r = clamp(Math.hypot(G.p.x, G.p.z), 4, 10); G.y = clamp(G.p.y, 2.6, 10.2); engFinAtq(); } }
    } else if (A.tipo === 'aplasta'){
      ENG.marca.position.set(A.x, 0.06, A.z); ENG.marca.material.uniforms.uOpacity.value = 0.35 + 0.35 * Math.abs(Math.sin(A.t * 14));
      if (A.t < 1.1){ const k = smooth(A.t / 1.1); G.p.set(lerp(A.de.x, A.x, k), lerp(A.de.y, 8, k), lerp(A.de.z, A.z, k)); }
      else if (!A.golpe){ G.p.y = Math.max(ENG_CORE * ENG_SC, G.p.y - dt * 26); G.p.x = A.x; G.p.z = A.z;
        if (G.p.y <= ENG_CORE * ENG_SC){ A.golpe = true; ENG.marca.visible = false; shake = Math.max(shake, 1); play('slam'); play('boom'); ringFx(A.x, A.z, 0xffd27a, 0.3, 3.6, 0.45, -ENG.base + 0.05); puffAt(A.x, A.z, 14, 2);
          if (Math.hypot(H.x - A.x, H.z - A.z) < 2.4 && f < 1.2) hurtPlayer(Math.round(18 * ENG.e.dm), A.x, A.z, 8);
          ENG.onda.visible = true; ENG.onda.userData = { r: 1.5, x: A.x, z: A.z, hit: false }; } }
      else { G.p.y = Math.min(7, G.p.y + dt * 5); if (A.t > 2.9){ G.a = Math.atan2(G.p.x, G.p.z); G.r = clamp(Math.hypot(G.p.x, G.p.z), 4, 10); G.y = G.p.y; engFinAtq(); } }
    }
  }
  // piedras en el aire (hacia donde vas a estar)
  for (const p of ENG.piedras){ if (!p.on) continue; p.t += dt;
    p.tele.position.set(p.a.x, p.a.y + 0.06, p.a.z); p.tele.material.uniforms.uOpacity.value = 0.35 + 0.35 * Math.abs(Math.sin(p.t * 14));
    const k = Math.min(1, p.t / 1.1); p.m.position.lerpVectors(p.de, p.a, k); p.m.position.y += Math.sin(k * Math.PI) * 3 + 0.7 * (1 - k); p.m.rotation.x += dt * 5; p.m.rotation.z += dt * 3;
    if (k >= 1){ p.on = false; p.m.visible = p.tele.visible = false; const fy = p.a.y - ENG.base;
      play('boom'); shake = Math.max(shake, 0.3); puffAt(p.a.x, p.a.z, 6, 1.2, 0x9a8a7a); ringFx(p.a.x, p.a.z, 0xd8c8a8, 0.3, 1.8, 0.3, fy + 0.05);
      for (let i = 0; i < 10; i++){ const a = rnd() * TAU; spawnFx(p.a.x, fy + 0.4, p.a.z, Math.cos(a) * 3, 2 + rnd() * 3, Math.sin(a) * 3, 0x7a6a62, 0.18, 0.7, 14, 0); }
      if (!ENG.salto && Math.hypot(H.x - p.a.x, H.z - p.a.z) < 1.4 && Math.abs(f - p.a.y) < 1.2){ const r = hurtPlayer(Math.round(15 * ENG.e.dm), p.a.x, p.a.z, 6); if (r === 'hit') engRielSale('golpe'); } } }
  // onda al levantarse o al aplastar: hay que saltarla
  if (ENG.onda.visible){ const O = ENG.onda.userData; O.r += dt * 9; ENG.onda.position.set(O.x, 0.2, O.z); ENG.onda.scale.set(O.r, O.r, 1);
    if (!O.hit && !ENG.riel && !ENG.salto && f < 0.45 && Math.abs(Math.hypot(H.x - O.x, H.z - O.z) - O.r) < 0.45){ const r = hurtPlayer(Math.round(10 * ENG.e.dm), O.x, O.z, 6); if (r === 'hit') O.hit = true; }
    if (O.r > 15) ENG.onda.visible = false; }
}
function engFinAtq(){ if (ENG.atq && ENG.atq.mueve){ const G = ENG.g; G.a = Math.atan2(G.p.x, G.p.z); } ENG.atq = null; ENG.atqCd = engEspera(); ENG.linea.visible = false; ENG.marca.visible = false; }
function engRayoOjo(A){   // la mirada sale del ojo y baja hasta el haz
  const e = ENG.e; e.head.getWorldPosition(engV[2]); engV[2].y += ENG.base + 0.3 * ENG_SC;
  const r = ENG_EJE_R + 0.6, to = engV[1].set(Math.sin(A.a) * r, A.y, Math.cos(A.a) * r), L = engV[2].distanceTo(to), m = ENG.rayoOjo;
  m.position.copy(engV[2]).add(to).multiplyScalar(0.5); m.scale.set(1, L, 1); m.lookAt(to.x, to.y, to.z); m.rotateX(Math.PI / 2);
}

/* ---------- En el suelo: agujas y vapor ---------- */
function engPeligros(dt){
  const H = hero.position, f = engPies(), rho = Math.hypot(H.x, H.z), ah = Math.atan2(H.x, H.z), suelo = !ENG.riel && !ENG.salto;
  ENG_AGUJAS.forEach((A, i) => { const a = ENG.agujaA[i], g = ENG.agujas[i];
    g.userData.filo.material.uniforms.uAlpha.value = ENG.parado > 0 ? 0.15 : 0.5 + 0.4 * Math.abs(Math.sin(ENG.t * 6 + i));
    if (ENG.parado > 0 || !suelo || f > A.alto + 0.12 || player.dead || rho < 1.6 || rho > A.L + 0.4) return;
    const d = engAng(ah - a);
    if (Math.abs(d) * rho < A.ancho / 2 + 0.38){ const t = Math.sign(A.w) || 1, r = hurtPlayer(Math.round(12 * ENG.e.dm), H.x - Math.cos(a) * t, H.z + Math.sin(a) * t, 7);
      if (r === 'hit'){ play('clang'); sparks(H.x, 0.5, H.z, 8, 0xffd27a, 3); } }
    else if (i === 1 && f < 0.3 && d * Math.sign(A.w) < 0 && Math.abs(d) * rho < 4 && Math.abs(d) * rho > 3.4 && (g.userData.avisoT || 0) < ENG.t){ g.userData.avisoT = ENG.t + 1; play('bruteWarn'); }
  });
  for (const V of ENG.vapores){ V.t += dt; const k = V.t % 5.2;
    if (k < 3.7){ if (V.est !== 'quieto'){ V.est = 'quieto'; V.col.visible = false; V.lanzo = false; } continue; }
    const x = V.g.position.x, z = V.g.position.z;
    if (k < 4.4){ V.est = 'aviso'; if (rnd() < 0.5) spawnFx(x + (rnd() - 0.5), -ENG.base + 0.3, z + (rnd() - 0.5), 0, 1.5 + rnd(), 0, 0xf4f0ea, 0.18, 0.5, -1, 1.2); continue; }
    if (V.est !== 'sopla'){ V.est = 'sopla'; V.col.visible = true; play('steam'); }
    const kk = (k - 4.4) / 0.8; V.col.scale.set(1 + kk * 0.3, 2 + Math.sin(kk * Math.PI) * 9, 1 + kk * 0.3); V.col.position.y = V.col.scale.y / 2;
    if (rnd() < 0.7) spawnFx(x + (rnd() - 0.5) * 1.2, -ENG.base + 1 + rnd() * 4, z + (rnd() - 0.5) * 1.2, 0, 5 + rnd() * 3, 0, 0xffffff, 0.3, 0.6, -2, 1.5);
    if (!V.lanzo && suelo && f < 0.5 && Math.hypot(H.x - x, H.z - z) < 1.3 && !player.dead){   // te lanza hasta el raíl de la pared
      V.lanzo = true; grounded = false; vy = 14; const d = Math.max(0.001, Math.hypot(x, z)); player.kx = x / d * 4.5; player.kz = z / d * 4.5; ENG.rielCd = 0.3;
      play('engLanza'); puffAt(H.x, H.z, 10, 1.4, 0xffffff); }
  }
}

/* ---------- Cámara: fijada en el Guardián (si no la mueves tú) ---------- */
function engCamYaw(dt){
  if (dragging) ENG.yawT = 2.5; if (ENG.yawT > 0){ ENG.yawT -= dt; return; }
  const H = hero.position, G = ENG.g.p, dx = H.x - G.x, dz = H.z - G.z; if (Math.hypot(dx, dz) < 0.8) return;
  camYaw += engAng(Math.atan2(dx, dz) - camYaw) * (1 - Math.exp(-dt * (ENG.salto ? 1.2 : 2)));
}
function engCamara(cam){
  if (!ENG.montado || cs.active || lcut) return;
  const G = ENG.g.p, gy = G.y - ENG.base;
  { const o = engV[0].subVectors(cam.position, camTarget), ab = ENG.g.est === 'derribado'; o.y *= ab ? 1.25 : 0.8; o.multiplyScalar((ab ? 1.05 : 1.15) * (1 + 0.1 * (ENG.kick || 0))); cam.position.copy(camTarget).add(o);
    const k = ENG.g.est === 'derribado' ? 0.25 : 0.32, tx = lerp(camTarget.x, G.x, k), ty = lerp(camTarget.y + 1.2, gy, k), tz = lerp(camTarget.z, G.z, k);
    cam.lookAt(tx, ty, tz); cam.updateMatrixWorld(); }
  // la columna se desvanece si se pone entre la cámara y Tovan
  const dt = fundeDt('eng'), H = hero.position; let tapa = false;
  for (let k = 1; k < 8 && !tapa; k++){ const u = k / 8, x = H.x + (cam.position.x - H.x) * u, z = H.z + (cam.position.z - H.z) * u, y = 1 + (cam.position.y - 1) * u + ENG.base;
    if (Math.hypot(x, z) < ENG_EJE_R + 0.9 && y < engEjeTop() + 0.6) tapa = true; }
  fundeObj(ENG.eje, tapa ? 0.25 : 1, dt);
  for (const g of ENG.ruedasMuro){ g.getWorldPosition(engV[4]); fundeObj(g, Math.hypot(engV[4].x - cam.position.x, engV[4].z - cam.position.z) < 7 ? 0 : 1, dt); }   // con la cámara fuera del foso (raíl de la pared)
}
function engPose(){
  if (!ENG.montado) return;
  const spin = ENG.riel ? ENG.riel.giro : ENG.salto ? ENG.salto.giro : null;
  if (spin != null){   // peonza: gira con los brazos abiertos y agachado
    P.body.rotation.y = spin; ENG.giroOn = true;
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', 1.45 * s, 1); bl(A.sh.rotation, 'x', -0.2, 1); bl(A.el.rotation, 'x', -0.15, 1); }
    for (const L of [P.legL, P.legR]){ bl(L.hip.rotation, 'x', ENG.salto ? -1.2 : -0.5, 1); bl(L.knee.rotation, 'x', ENG.salto ? 1.8 : 0.8, 1); }
    bl(P.spine.rotation, 'x', ENG.salto ? 0.6 : 0.25, 1);
    if (ENG.salto && ENG.salto.tajo > 0){ const k = 1 - ENG.salto.tajo / ENG_TAJO.t;   // el tajo: los dos brazos barren por delante
      for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -1.5, 1); bl(A.sh.rotation, 'z', s * lerp(1.2, -0.4, k), 1); bl(A.el.rotation, 'x', -0.1, 1); } }
  } else if (ENG.giroOn){ ENG.giroOn = false; P.body.rotation.y = 0; }
}

/* ---------- Bucle ---------- */
function engTick(dt, pdt, playing){
  if (SELJ.on && SELJ.eng && playing && !ENG.on && !cs.active){ const b = enemies.find(q => q.type === 'boss' && q.isBoss && q.alive && q.spawnT <= 0); if (b && engPuede(b)) killEnemy(b); }
  if (!ENG.montado) return;
  const run = gameState === 'paused' || gameState === 'over' ? 0 : dt;
  if (ENG.parado > 0 && ENG.g.est !== 'derribado' && ENG.g.est !== 'cae') ENG.parado = 0;
  engMeca(run); engGuardian(run); engNucleoTick();
  if (ENG.son && actx){ const t = actx.currentTime, on = sfxOn && gameState !== 'paused';
    ENG.son.rumor.g.gain.setTargetAtTime(on && ENG.cae <= 0 && !ENG.parado ? 0.08 + 0.04 * ENG.vel : 0, t, 0.2);
    ENG.son.riel.g.gain.setTargetAtTime(on && (ENG.riel || ENG.salto) ? 0.07 : 0, t, 0.06); }
  if (!(playing && engJugando())) return;
  clearT = 0; engBarra();
  ENG.rielCd -= pdt; ENG.kick = (ENG.kick || 0) * Math.exp(-pdt * 3); engFisica(pdt); if (!engJugando()) return;
  engPeligros(pdt); engAtaqueTick(pdt); engCamYaw(pdt);
}

/* ---------- La segunda vida empieza: se da cuerda y el suelo se abre ---------- */
function engPuede(e){ return e.type === 'boss' && e.isBoss && e.alive && !e.engHecho && !e.engFase && e.halo && e.coreG && !special && !chActive && !invActive && !cs.active && gameState === 'play' && !player.dead
  && !MG.active && !COL.on && !TER.on; }
function engEmpieza(e){
  Object.assign(ENG, { on: true, fase: 'cine', e, t: 0, riel: null, salto: null, vel: 1, sube: 0, atq: null, atqCd: 3, rondas: 0, nucleo: null, cae: 0, parado: 0, yawT: 0, dijo: {}, rielCd: 0 });
  Object.assign(ENG.g, { est: 'eje', t: 0, a: 0.9, r: 7, y: 6, aw: 0.4, rObj: 7, cambio: 0, giro: 0 });
  e.engFase = true; e.alive = false; e.hp = 0; e.flash = 0; e.burnT = e.chillT = e.frozenT = e.shockT = 0; e.chill = 0;
  hideTeles(e); if (e.x5 && e.x5.end) e.x5.end(); e.x5 = null; sweepHazards();
  for (const p of projectiles) scene.remove(p.m); projectiles.length = 0;
  clearT = 0; bossBox.hidden = true; barkSaid.half_nucleo = true;
  engCineDespierta();   // (primero: con gameState = 'play', la última baja de la oleada lanzaría su grito de victoria)
  queue.length = 0;
  for (const o of enemies) if (o.alive && o !== e){ killEnemy(o); o.dying = 0; o.remove = true; scene.remove(o.g); if (o.tele) scene.remove(o.tele); if (o.parts) o.parts.forEach(q => scene.remove(q)); }
}
function engCineDespierta(){
  const e = ENG.e, hp = hero.position, gp = e.g.position.clone(), a0 = Math.atan2(hp.x - gp.x, hp.z - gp.z);
  let fase = 'cuerda', gT = 0, caeV = 0, tocado = false, pT = 0, rodo = false;
  const piedra = () => ENG.piedras && ENG.piedras[0];
  if (state === 'tech') cancelTech(); state = 'normal'; attackW = 0; staffToBack(); grounded = true; vy = 0;
  heading = Math.atan2(gp.x - hp.x, gp.z - hp.z); hero.rotation.y = heading;
  runCine(async () => {
    cs.tick = dt => { gT += dt;
      if (fase === 'cuerda'){   // de rodillas, dándose cuerda: el halo gira cada vez más deprisa
        e.body.position.y = -0.3 * Math.min(1, gT / 0.5); bl(e.torso.rotation, 'x', 0.45, 1 - Math.exp(-dt * 5)); e.halo.rotation.z += dt * (1 + gT * gT * 4);
        e.coreG.scale.setScalar(1 + gT * 0.25 + Math.sin(gT * 20) * 0.08); e.mats[1].em = 0.4 + 0.5 * Math.abs(Math.sin(gT * 9)); e.faceMat.uniforms.uMap.value = gFaceA;
        if ((ENG.ticT -= dt) <= 0){ ENG.ticT = Math.max(0.08, 0.45 - gT * 0.12); play(ENG.ticN++ % 2 ? 'engToc' : 'engTic'); }
        shake = Math.max(shake, Math.min(0.5, gT * 0.18)); }
      else if (!tocado){ caeV += 22 * dt; hp.y = Math.max(0, hp.y - caeV * dt); grounded = true; vy = 0; P.body.rotation.x += dt * 6;   // (sigue cayendo aunque cambie la toma: antes se quedaba flotando a 9 m)
        if (hp.y <= 0){ tocado = true; P.body.rotation.x = 0; landT = 0.18; puff(8); play('land'); shake = Math.max(shake, 0.5); ringFx(hp.x, hp.z, 0xffffff, 0.3, 2.2, 0.4); } }
      if (fase === 'sube'){ ENG.sube = Math.min(1, ENG.sube + dt / 3.0); shake = Math.max(shake, 0.18); }
      if (fase === 'piedra'){ pT += dt; const p = piedra(), k = Math.min(1, pT / 1.1);   // la piedra vuela hacia Tovan…
        if (p && p.m.visible){ p.tele.position.set(p.a.x, p.a.y + 0.06, p.a.z); p.tele.material.uniforms.uOpacity.value = 0.35 + 0.35 * Math.abs(Math.sin(pT * 14));
          p.m.position.lerpVectors(p.de, p.a, k); p.m.position.y += Math.sin(k * Math.PI) * 3 + 0.7 * (1 - k); p.m.rotation.x += dt * 5; p.m.rotation.z += dt * 3;
          if (k >= 1){ p.m.visible = p.tele.visible = false; play('boom'); shake = Math.max(shake, 0.35); puffAt(p.a.x, p.a.z, 8, 1.3, 0x9a8a7a); ringFx(p.a.x, p.a.z, 0xd8c8a8, 0.3, 1.8, 0.3, 0.05);
            for (let i = 0; i < 10; i++){ const a = rnd() * TAU; spawnFx(p.a.x, 0.4, p.a.z, Math.cos(a) * 3, 2 + rnd() * 3, Math.sin(a) * 3, 0x7a6a62, 0.18, 0.7, 14, 0); } } }
        if (!rodo && pT >= 0.5){ rodo = true; state = 'roll'; rollT = 0; rollDir = Math.atan2(hp.x, hp.z); heading = hero.rotation.y = rollDir; puff(5); play('roll'); }   // …y rueda hacia fuera para esquivarla
        if (rodo && !ENG.riel){ const c = engRielCerca(state === 'roll' ? 0.9 : 4);   // ¡y se sube al raíl sin querer!
          if (c){ ENG.dijo.monta = true; engRielMonta(c.R, c.s); P.body.rotation.x = 0; P.body.scale.setScalar(1); sparks(hp.x, 0.3, hp.z, 12, 0xffd27a, 3.5); shake = Math.max(shake, 0.3); } } }
      if (ENG.riel && (fase === 'piedra' || fase === 'riel')) engRielTick(dt);
    };
    // 1. No se cae: se arrodilla y se da cuerda
    csShot(cam => { cam.position.set(gp.x + Math.sin(a0 + 0.7) * 5.2, 1.0, gp.z + Math.cos(a0 + 0.7) * 5.2); cam.lookAt(gp.x, 2.0, gp.z); });
    play('bruteWarn'); csCaption('Lumen: …No se ha caído. Se está dando cuerda.');
    await csWait(2.0);
    // 2. La plaza entera hace tictac… y se abre
    csShot((cam, t) => { cam.position.set(gp.x + Math.sin(a0) * (11 + t * 2), 7 + t * 1.5, gp.z + Math.cos(a0) * (11 + t * 2)); cam.lookAt(0, 0, 0); });
    csCaption('Tovan: ¿Por qué hace tictac el suelo?'); shake = 0.6; play('engCampana');
    await csWait(1.6);
    play('boom'); play('slam'); shake = 1.2; cineEls.white.style.opacity = '1'; csCaption('');
    await csWait(0.35);
    // 3. Abajo: Tovan cae al fondo del reloj y la columna se levanta con el Guardián encima
    engMonta(); ENG.W.add(e.g); fase = 'cae'; e.body.position.y = 0; e.torso.rotation.x = 0;
    const aT = Math.PI + 0.25; hp.set(Math.sin(aT) * 10, 13, Math.cos(aT) * 10); heading = aT + Math.PI; hero.rotation.y = heading; camYaw = aT;
    csShot((cam, t) => { cam.position.set(Math.sin(aT + 0.5) * 13.2, 1.6 + t * 0.5, Math.cos(aT + 0.5) * 13.2); cam.lookAt(0, 2 + Math.min(1, t / 3) * 9, 0); });
    await csTween(0.6, k => { cineEls.white.style.opacity = String(1 - k); });
    fase = 'sube'; play('engCampana'); play('dragonRoar');
    await csWait(1.4); showBossCard('engcol');
    await csWait(2.0);
    // 4. Detrás de Tovan, mirando hacia arriba
    hideBossCard(); const x = hp.x, z = hp.z;
    csShot(dollyShot([x + Math.sin(aT) * 3.5, 1.4, z + Math.cos(aT) * 3.5], [x + Math.sin(aT) * 2.8, 1.6, z + Math.cos(aT) * 2.8], [0, 7, 0], [0, 12, 0], 2.6));
    csCaption('Tovan: ¿Las ruinas eran… un reloj?'); await csWait(1.7);
    csCaption('Lumen: Y llevamos mil años de retraso.'); await csWait(1.7);
    // 5. Echa a volar y le tira una piedra: Tovan la esquiva rodando… y acaba montado en el raíl de la pared
    csCaption(''); Object.assign(ENG.g, { est: 'despega', t: 0, a: aT + Math.PI * 0.75, r: 7, y: 6 }); play('dragonRoar'); shake = Math.max(shake, 0.4);
    await csWait(0.5);
    { const p = piedra(), G = ENG.g; if (p){ p.de = G.p.clone(); p.a = new V3(hp.x, 0, hp.z); p.m.position.copy(p.de); p.m.visible = p.tele.visible = true; play('engLanza'); } }
    const aH = Math.atan2(hp.x, hp.z); fase = 'piedra'; csCaption('Lumen: ¡Cuidado!');
    csShot((cam, t) => { const H = hero.position;
      if (!ENG.riel){ cam.position.set(Math.sin(aH + 0.55) * 6.2, 2.3, Math.cos(aH + 0.55) * 6.2); cam.lookAt(H.x * 0.92, 1.2, H.z * 0.92); return; }
      const th = Math.atan2(H.x, H.z); cam.position.set(Math.sin(th - 0.5) * 8.6, 2.5, Math.cos(th - 0.5) * 8.6); cam.lookAt(H.x * 0.96, 0.9, H.z * 0.96); });   // montado: lo sigue desde dentro del foso
    for (let i = 0; i < 40 && !ENG.riel; i++) await csWait(0.05);
    fase = 'riel'; csCaption('Tovan: ¡Uoh! ¿Esto… me lleva?'); await csWait(1.5);
    csCaption('Lumen: ¡Rodando te has subido al raíl! Si saltas, cruzas a la otra pared. Y en el aire, ¡atácale cuando pase!'); await csWait(2.6);
    csCaption('');
  }, () => { csCaption(''); hideBossCard(); if (ENG.on) engEmpiezaPelea(); });
}
function engEmpiezaPelea(){
  const e = ENG.e; engMonta(); if (e.g.parent !== ENG.W) ENG.W.add(e.g);
  e.body.position.y = 0; e.torso.rotation.x = 0; cineEls.white.style.opacity = '0'; ENG.sube = 1;
  const aT = Math.PI + 0.25, monta = !!ENG.riel;   // (en la cinemática se sube al raíl rodando: si llegó a montarse, sigue montado)
  if (!monta){ if (hero.position.y > 0 || Math.hypot(hero.position.x, hero.position.z) < 4){ hero.position.set(Math.sin(aT) * 10, 0, Math.cos(aT) * 10); heading = aT + Math.PI; hero.rotation.y = heading; camYaw = aT; }
    hero.position.y = 0; ENG.base = 0; ENG.W.position.y = 0; }
  else { const H = hero.position, G = ENG.g.p; camYaw = Math.atan2(H.x - G.x, H.z - G.z); }   // (como la deja engCamYaw: detrás de Tovan, mirando al Guardián)
  grounded = true; vy = 0; P.body.rotation.x = 0; P.body.scale.setScalar(1); state = 'normal'; player.inv = Math.max(player.inv, 1);
  for (const p of ENG.piedras) if (!p.on){ p.m.visible = p.tele.visible = false; }   // (la piedra de la cinemática, si se saltó a medias)
  ENG.fase = 'pelea'; ENG.atq = null; ENG.atqCd = 4; ENG.nucleo = engNucleo();
  if (ENG.g.est !== 'despega' && ENG.g.est !== 'vuela') Object.assign(ENG.g, { est: 'despega', t: 0, a: aT + Math.PI * 0.6, r: 7, y: 6 });
  bossE = { type: 'engcol', alive: true, hp: 1, maxHp: 1, g: e.g, isBoss: true, spawnT: 0 }; bossBox.hidden = false; engBarra();
  barkT = 0; clearT = 0;
  if (monta) bark(colTactil() ? 'SALTAR hacia él y, en el aire, ATACAR cuando lo tengas cerca: así se derriba.' : 'SALTA hacia él y, en el aire, ATACA (J) cuando lo tengas cerca: así se derriba.');
  else bark(colTactil() ? '¡Ha echado a volar! Súbete al raíl: pulsa RODAR junto al piñón brillante de la pared.' : '¡Ha echado a volar! Súbete al raíl: RUEDA (K) junto al piñón brillante de la pared.');
}

/* ---------- Remate: el núcleo se rompe, el reloj se para y se desmorona ---------- */
function engRemate(){
  ENG.fase = 'remate'; engQuitaAtaques(); ENG.riel = null; ENG.salto = null; bossE = null; bossBox.hidden = true;
  if (ENG.nucleo){ ENG.nucleo.alive = false; ENG.nucleo.remove = true; scene.remove(ENG.nucleo.g); ENG.nucleo = null; }
  engCineFinal();
}
function engCineFinal(){
  const hp = hero.position, G = ENG.g; let caeT = 0;
  state = 'normal'; attackW = 0; staffToBack(); ENG.parado = 1;
  runCine(async () => {
    cs.tick = dt => { if (caeT > 0) ENG.cae = Math.min(1.6, ENG.cae + dt * 0.55); };
    // 1. El núcleo estalla y el reloj se para
    play('specialBoom'); play('engRompe'); flash('#e8fdff', 0.8); shake = 1; ENG.e.coreG.visible = false;
    { const q = engV[3].copy(G.p); q.y = 1.6 - ENG.base; for (let i = 0; i < 40; i++){ const a = rnd() * TAU, sp = 3 + rnd() * 6; spawnFx(q.x, q.y, q.z, Math.cos(a) * sp, 1 + rnd() * 6, Math.sin(a) * sp, rnd() < 0.5 ? 0x7ff5ff : 0xffffff, 0.16, 1.0, 8, 0.4); } }
    const gx = G.p.x, gz = G.p.z, a0 = Math.atan2(hp.x - gx, hp.z - gz);
    csShot((cam, t) => { const a = a0 + 0.6 + t * 0.15; cam.position.set(gx + Math.sin(a) * 8, 3.2 - ENG.base + t * 0.3, gz + Math.cos(a) * 8); cam.lookAt(gx, 1.6 - ENG.base, gz); });
    await csWait(0.9); play('engCampana'); await csWait(1.0); play('engCampana');
    csCaption('Lumen: …Se ha parado.'); await csWait(1.3); play('engCampana');
    // 2. Se desmorona: la columna se hunde y caen los raíles
    caeT = 1; csCaption(''); play('boom'); shake = 0.8;
    csShot((cam, t) => { cam.position.set(Math.sin(a0) * 12, 2 - ENG.base + t * 0.4, Math.cos(a0) * 12); cam.lookAt(0, 5 - ENG.base - t * 1.5, 0); });
    for (let i = 0; i < 4; i++){ await csWait(0.5); play('boom'); shake = Math.max(shake, 0.5); }
    // 3. Vuelta a la plaza
    await csTween(0.45, k => { cineEls.white.style.opacity = String(k); });
    cs.tick = null; engLimpia(); engGuardianSuelta(); ENG.e.g.visible = false; engDesmonta(); ENG.cae = 0; ENG.vel = 1;
    hp.set(0, 12, 0.5); P.body.rotation.x = 0; heading = 0; hero.rotation.y = 0; let v = 0, toca = false;
    cs.tick = dt => { if (toca) return; v += 24 * dt; hp.y = Math.max(0, hp.y - v * dt); grounded = true; vy = 0;
      if (hp.y <= 0){ toca = true; landT = 0.18; shake = 0.9; play('boom'); play('land'); ringFx(hp.x, hp.z, 0xd8c8a8, 0.3, 3.2, 0.45); puffAt(hp.x, hp.z, 14, 2.2); } };
    csShot((cam, t) => { cam.position.set(2.6, 0.6 + t * 0.3, 4.4); cam.lookAt(0, 1.0 + Math.max(0, 1.2 - t) * 2.2, 0.5); });
    await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
    await csWait(1.0);
    csCaption('Tovan: ¿Qué hora es?'); await csWait(1.8);
    csCaption('Lumen: La de entregar el paquete.'); await csWait(1.9);
    csCaption('');
  }, () => { csCaption(''); engTermina(); });
}
function engTermina(){
  const e = ENG.e;
  engLimpia(); engGuardianSuelta(); engDesmonta(); ENG.on = false; ENG.fase = null; ENG.e = null; ENG.cae = 0; ENG.vel = 1; ENG.parado = 0;
  if (Math.hypot(hero.position.x, hero.position.z) > ARENA - 0.5 || hero.position.y !== 0) hero.position.set(0, 0, 0.5);
  grounded = true; vy = 0; P.body.rotation.x = 0; cineEls.white.style.opacity = '0';
  if (e){ e.g.visible = true; e.alive = true; e.engHecho = true; e.hp = 0; e.g.position.set(hero.position.x + 1.2, 0, hero.position.z - 1.4); killEnemy(e); }
  clearT = -1;
}

/* ---------- Ganchos ---------- */
const _killEnemyEng = killEnemy;
killEnemy = function(e){
  if (e.engNucleo){ if (e.alive && engJugando()) engRondaHecha(e); return; }
  if (e.type === 'boss' && e.engFase && !e.engHecho) return;   // ya está en su segunda vida
  if (e.type === 'boss' && engPuede(e)){ engEmpieza(e); return; }
  _killEnemyEng(e);
};
const _hitEnemyEng = hitEnemy;
hitEnemy = function(e, ...a){ if (e && e.engNucleo && !engAlcanza(e)) return false; return _hitEnemyEng(e, ...a); };
const _doRollEng = doRoll; doRoll = function(){
  if (engJugando() && gameState === 'play'){
    if (ENG.salto) return;
    if (ENG.riel){ engRielSale('salta'); play('roll'); return; }
    if (grounded){ const c = engRielCerca(1.5, true); if (c){ engRielMonta(c.R, c.s); return; } } }
  _doRollEng();
};
const _doJumpEng = doJump; doJump = function(){ if (engJugando() && gameState === 'play' && (ENG.riel || ENG.salto)){ if (ENG.riel && !player.dead) engCruza(); else if (ENG.salto && ENG.salto.t > ENG.salto.T * 0.35) ENG.salto.rebote = true; return; } _doJumpEng(); };
const _doAttackEng = doAttack; doAttack = function(){ if (ENG.on && (ENG.riel || ENG.salto)){ if (ENG.salto && engJugando() && gameState === 'play' && !player.dead) engTajoAire(); return; } _doAttackEng(); };
const _doSpecialEng = doSpecial; doSpecial = function(){ if (ENG.on && (ENG.riel || ENG.salto)) return; _doSpecialEng(); };
/* ---------- Lo que va por el suelo se queda en la esfera ----------
   Tovan va a y = 0 y lo que baja es el mundo: sin esto, las invocaciones (ranas, aliados capturados,
   maquetas, hollín, el perro) y lo que se deja en el suelo (peladuras, paquetes, caramelos, recogidas)
   subían con él por los raíles. Justo antes de pintar se bajan ENG.base y al empezar el fotograma
   siguiente se devuelven, así la lógica de cada poder no se entera. */
const engSueloObjs = () => [...P6.frogs.map(f => f.g), ...P6.allies.flatMap(a => [a.g, a.ring]), ...P6.bots.map(b => b.g), ...P6.soots.map(q => q.m), ...P6.dogs.map(d => d.g),
  ...P5.peels.map(q => q.g), ...P5.parcels.map(q => q.g), ...P5.candies.map(q => q.m), ...pickups.map(q => q.m)];
let engBajados = null;
function engSubeSuelo(){ if (!engBajados) return; for (const [o, d] of engBajados) o.position.y += d; engBajados = null; }
function engBajaSuelo(){ engSubeSuelo(); if (!ENG.montado || ENG.base < 0.01) return; const d = ENG.base; engBajados = []; for (const o of engSueloObjs()) if (o){ o.position.y -= d; engBajados.push([o, d]); } }
const _v3UpdateEng = v3Update;
v3Update = function(dt, pdt, playing){ engSubeSuelo(); _v3UpdateEng(dt, pdt, playing); try { engTick(dt, pdt, playing); } catch (err) { console.error(err); } };
const _csCameraEng = csCamera; csCamera = function(cam){ _csCameraEng(cam); try { engCamara(cam); engBajaSuelo(); } catch (err) { console.error(err); } };
const _legendPoseEng = legendPose; legendPose = function(){ _legendPoseEng(); try { engPose(); } catch (err) { console.error(err); } };
const _clearWorldEng = clearWorld; clearWorld = function(){ engAborta(); _clearWorldEng(); };
const _toTitleEng = toTitle; toTitle = function(){ engAborta(); _toTitleEng(); };
const _camAutoPuedeEng = camAutoPuede; camAutoPuede = function(){ return !ENG.montado && _camAutoPuedeEng(); };
// selector de jefes: «Directo al mecanismo»
{ const B = SELJ_LISTA.find(b => b.id === 'boss'); if (B && !B.sub) B.sub = [['Normal', 'n'], ['Directo al mecanismo', 'eng']]; }
const _selJefeEmpiezaEng = selJefeEmpieza; selJefeEmpieza = function(B, sub){ SELJ.eng = B.id === 'boss' && sub === 'eng'; return _selJefeEmpiezaEng(B, sub); };

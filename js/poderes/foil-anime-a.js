'use strict';
/* ======================================================================
   PODERES FOIL · ANIME (A): cinco técnicas de cinco series
   Se registran con foilPoder/foilForma (js/poderes/foil-nucleo.js) y
   reutilizan las cintas, foilFx, foilGolpea y enCono de foil.js. Cada uno
   con su prefijo en todo lo global (y en el CSS, css/foil-anime-a.css):
     · Tercera marcha (de una de piratas) · g3: al rematar, Tovan se muerde
       el pulgar y sopla, el brazo del arma se infla hasta ser gigante y
       suelta la «Pistola de gigante» (un puño de goma que sale 7-8 m y
       arrasa una franja ancha). Luego se desinfla echando vapor y Tovan se
       queda en miniatura 3 s (forma 'g3mini': más rápido y voz de pito).
     · Manto de las nueve colas (de una de ninjas) · kyu: L con el ímpetu
       lleno, 12 s de modo zorro (forma): abrigo dorado con marcas de sello
       negras, llamas de energía alrededor y nueve colas de chakra (cintas
       con su propio shader). Cada golpe, una zarpa gigante en abanico; el
       remate, la «Bomba espiral»: una esfera de remolinos en la mano que
       estalla en una cúpula azul y blanca.
     · Colmillo lunar (de una de segadores de almas) · gtsu: cada golpe deja
       un tajo negro fino; el remate, una media luna negra de borde carmesí
       que vuela 12 m atravesándolo todo y deja una cicatriz en el suelo.
       Cada 3.er remate, «liberación»: abrigo negro con ribetes rojos 6 s y
       colmillos dobles en cruz, más grandes.
     · Espíritu de pelea (de una de aventuras bizarras) · ora: un espíritu
       guardián (morado y azul, translúcido, con oro) flota tras tu hombro.
       Al rematar se adelanta y suelta una ráfaga de puñetazos y uno final
       que lanza. Quieto más de 1 s, «ゴゴゴ». Cada 10 s para un golpe.
     · Golpe serio (de uno que es calvo por hobby) · opm: cada golpe que
       acierta suma 1; con 12, el siguiente remate es el golpe serio: cara de
       garabato, un puñetazo seco, una pausa incómoda y una onda de choque de
       30 m que parte las nubes (a los que no son jefes, de un golpe).
   Reglas: nada de rnd() al cargar (los lienzos se pintan con mulberry32);
   los modelos se construyen la primera vez que hacen falta y luego se
   enseñan y esconden; limpia() quita todo lo de cada uno.
   ====================================================================== */

/* ---------- 1. Tercera marcha (de una de piratas) · prefijo g3 ---------- */
const G3 = { m: null, arma: null, oculto: false };
// tiempos de la maniobra: soplar, inflar, cargar, disparar, llegar, recoger, soltar a Tovan y desinflar
const G3_T = { sopla: 0.42, infla: 0.8, tira: 1.0, llega: 1.13, vuelve: 1.5, suelta: 1.5, fin: 2.1 };
const G3_L = 5.2, G3_W = 1.7, G3_TN = 14, G3_TS = 8;   // estirón del puño, media anchura de la franja, anillos y lados del brazo de goma
const g3V = new V3(), g3W = new V3();
Object.assign(SFX, {
  g3Sopla: () => { noise({ dur: 0.4, vol: 0.2, f0: 1700, f1: 900, type: 'bandpass', q: 0.8, rv: 0.1 }); tone({ type: 'sine', f0: 210, f1: 330, dur: 0.38, vol: 0.06 }); },
  g3Infla: () => { tone({ type: 'sawtooth', f0: 80, f1: 420, dur: 0.45, vol: 0.11, rv: 0.2 }); tone({ type: 'sine', f0: 130, f1: 720, dur: 0.45, vol: 0.15 });
    for (let i = 0; i < 4; i++) tone({ type: 'square', f0: 300 + i * 130, f1: 400 + i * 150, dur: 0.05, vol: 0.04, when: 0.1 + i * 0.08 }); },
  g3Golpe: () => { tone({ type: 'sine', f0: 95, f1: 22, dur: 1.1, vol: 0.85, rv: 0.6 }); noise({ dur: 0.85, vol: 0.45, f0: 900, f1: 80, type: 'lowpass', q: 0.7, rv: 0.6 });
    noise({ dur: 0.12, vol: 0.4, f0: 3000, type: 'highpass', rv: 0.3 }); tone({ type: 'square', f0: 160, f1: 45, dur: 0.32, vol: 0.18 }); },
  g3Desinfla: () => { noise({ dur: 0.75, vol: 0.18, f0: 4500, f1: 1800, type: 'highpass', q: 0.5, rv: 0.3 });
    for (let i = 0; i < 8; i++) tone({ type: 'square', f0: 1900 - i * 170, f1: 1700 - i * 170, dur: 0.07, vol: 0.045, when: i * 0.075 }); },
  g3Pio: () => tone({ type: 'square', f0: 1500 + Math.random() * 600, f1: 2700, dur: 0.07, vol: 0.06, rv: 0.1 }),
  g3Pop: () => { tone({ type: 'sine', f0: 300, f1: 900, dur: 0.12, vol: 0.12 }); noise({ dur: 0.1, vol: 0.12, f0: 2000, rv: 0.1 }); }
});
// el brazo gigante: tubo de goma (anillos que se recolocan cada fotograma), antebrazo y puño fundidos y el puño de la manga
function g3Construye(){
  if (G3.arma) return G3.arma;
  const piel = makeMat(0xf2c09a, { emissive: 0.3 }), pielDS = makeMat(0xf2c09a, { emissive: 0.3, side: THREE.DoubleSide }), pliegue = makeMat(0xc4876a, { emissive: 0.18 });
  const raiz = new THREE.Group(); raiz.rotation.order = 'YXZ'; raiz.visible = false; scene.add(raiz);
  const N = G3_TN, S = G3_TS, pos = new Float32Array((N + 1) * S * 3), nor = new Float32Array((N + 1) * S * 3), idx = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < S; j++){ const a = i * S + j, b = i * S + (j + 1) % S, c = (i + 1) * S + (j + 1) % S, d = (i + 1) * S + j; idx.push(a, b, c, a, c, d); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array((N + 1) * S * 2), 2)); geo.setIndex(idx);
  const tubo = new THREE.Mesh(geo, pielDS); tubo.frustumCulled = false; raiz.add(tubo);
  const suelto = new THREE.Group();   // a lo largo de +z: el antebrazo detrás de la muñeca (z = 0) y el puño delante
  mesh(C(0.44, 0.56, 1.5, 9), piel, 0, 0, -0.75, suelto).rotation.x = Math.PI / 2;
  mesh(C(0.47, 0.47, 0.1, 9), pliegue, 0, 0, -0.02, suelto).rotation.x = Math.PI / 2;
  mesh(new THREE.IcosahedronGeometry(0.72, 1), piel, 0, 0.02, 0.55, suelto).scale.set(1.12, 0.92, 0.95);
  for (let k = 0; k < 4; k++){ mesh(B(0.3, 0.28, 0.3), piel, -0.48 + k * 0.32, 0.26, 1.06, suelto); mesh(B(0.27, 0.22, 0.26), pliegue, -0.48 + k * 0.32, -0.06, 1.1, suelto); }   // nudillos y dedos doblados
  mesh(B(0.3, 0.26, 0.62), piel, -0.64, -0.2, 0.74, suelto).rotation.y = 0.4;   // pulgar (hacia dentro: es el brazo izquierdo)
  const puno = new THREE.Group(); raiz.add(puno); mpFusiona(suelto, puno);
  const manga = mesh(C(0.27, 0.25, 0.32, 8), M.coat, 0, 0, 0.08, raiz); manga.rotation.x = Math.PI / 2;
  return G3.arma = { raiz, tubo, geo, pos, nor, puno };
}
// recoloca el tubo de goma: de z = 0 (hombro) a z = len, con radio r y una onda de amplitud amp
function g3Tubo(A, len, r, amp, t){
  const N = G3_TN, S = G3_TS, pos = A.pos, nor = A.nor;
  for (let i = 0; i <= N; i++){ const u = i / N, en = Math.sin(u * Math.PI), cx = amp * en * Math.sin(t * 38 + u * 7), cy = amp * 0.6 * en * Math.cos(t * 31 + u * 5), rr = r * (1 - 0.22 * en * Math.min(1, len / 4));
    for (let j = 0; j < S; j++){ const a = j / S * TAU, ca = Math.cos(a), sa = Math.sin(a), k = (i * S + j) * 3;
      pos[k] = cx + ca * rr; pos[k + 1] = cy + sa * rr; pos[k + 2] = u * len; nor[k] = ca; nor[k + 1] = sa; nor[k + 2] = 0; } }
  A.geo.attributes.position.needsUpdate = true; A.geo.attributes.normal.needsUpdate = true;
}
// estado del brazo según el momento de la maniobra: rumbo y cabeceo (desde el hombro), tamaño s, estirón d y onda de la goma
function g3Brazo(m){
  const t = m.t, T = G3_T, f = m.f, atras = f + 2.3;
  let yaw = atras, pitch = -1.0, s = 0, d = 0, amp = 0.04, vis = t >= T.sopla;
  if (t < T.infla){ const k = clamp((t - T.sopla) / (T.infla - T.sopla), 0, 1); s = 0.15 + 0.85 * (1 - Math.cos(k * Math.PI * 2.5) * Math.pow(1 - k, 2)); }
  else if (t < T.tira){ const k = (t - T.infla) / (T.tira - T.infla); s = 1 + 0.06 * Math.sin(k * Math.PI * 4); yaw = atras + 0.25 * smooth(k); pitch = -1.0 - 0.2 * smooth(k); }
  else if (t < T.vuelve){ const k = clamp((t - T.tira) / (T.llega - T.tira), 0, 1), g = smooth(Math.min(1, k * 3)); s = 1;
    yaw = lerpAngle(atras + 0.25, f, g); pitch = lerp(-1.2, 0.06, g);
    const ext = t < T.llega ? 1 - Math.pow(1 - k, 3) : t < T.llega + 0.07 ? 1 : 1 - smooth(clamp((t - T.llega - 0.07) / (T.vuelve - T.llega - 0.07), 0, 1));
    d = G3_L * ext; amp = t < T.llega ? 0.14 : 0.42 * Math.max(0, 1 - (t - T.llega) / 0.4);
    if (t >= T.llega) s = 1 + 0.08 * Math.sin((t - T.llega) * 40) * Math.max(0, 1 - (t - T.llega) / 0.3); }
  else { const k = clamp((t - T.vuelve) / (T.fin - T.vuelve), 0, 1); s = Math.max(0.12, (1 - 0.88 * k) * (1 + 0.1 * Math.sin(t * 38) * (1 - k)));
    yaw = lerpAngle(f, f + 0.5, smooth(k)); pitch = lerp(0.06, 1.2, smooth(k)); vis = k < 0.97; }
  return { yaw, pitch, s, d, amp, vis };
}
const g3Bloquea = () => !!(G3.m && G3.m.t < G3_T.suelta);
function g3Empieza(f){
  if (!foilPuede()) return;
  g3Construye(); G3.m = { t: 0, f, O: hero.position.clone(), ya: new Set(), ev: {} };
  staffToBack(); play('g3Sopla'); foilGrito('¡Tercera marcha!', '#ffd0a8');
  barkOnce('g3sopla', '¿Te has inflado el brazo… soplándote el pulgar? Eso no viene en el manual del repartidor.');
}
function g3Fin(){ G3.m = null; if (G3.arma) G3.arma.raiz.visible = false; if (G3.oculto){ P.armR.sh.visible = true; G3.oculto = false; } }
function g3Tick(dt, jugando){
  const m = G3.m; if (!m) return;
  if (player.dead || !(gameState === 'play' || gameState === 'paused' || gameState === 'upgrade')){ g3Fin(); return; }
  if (!jugando || dt <= 0) return;
  m.t += dt; const t = m.t, T = G3_T, ev = m.ev, fx = Math.sin(m.f), fz = Math.cos(m.f);
  if (t < T.suelta){ hero.position.x = m.O.x; hero.position.z = m.O.z; heading = m.f; hero.rotation.y = m.f; player.kx = player.kz = 0; if (staffInHand && state !== 'attack') staffToBack(); }
  if (t < T.sopla){ if (rnd() < 0.6){ P.neck.getWorldPosition(g3V); pn(g3V.x + fx * 0.3, g3V.y + 0.05, g3V.z + fz * 0.3, fx * 0.6 + (rnd() - 0.5) * 0.4, 0.4, fz * 0.6 + (rnd() - 0.5) * 0.4, 0xffffff, 0.18, 0.5, -0.5, 1, 1.8, SH7.dot, 0.6); } }
  if (t >= T.sopla && !ev.infla){ ev.infla = true; play('g3Infla'); shake = Math.max(shake, 0.15); }
  if (t >= T.infla && !ev.carga){ ev.carga = true; foilRotulo('<i>¡Brazo de</i><b>GIGANTE!</b>', 'g3Rot g3RotIn', 0.9); }
  if (t >= T.tira && t < T.vuelve){   // el puño barre la franja de delante mientras sale
    const b = g3Brazo(m), alc = 2.9 * b.s + b.d + 0.4;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || m.ya.has(e)) continue; const dx = e.g.position.x - m.O.x, dz = e.g.position.z - m.O.z, al = dx * fx + dz * fz, pe = Math.abs(dx * fz - dz * fx);
      if (al > -0.5 && al < alc && pe < G3_W + e.r && foilGolpea(e, rdmg(50), fx, fz, 13, null, 1.6, m.ya)){ sparks(e.g.position.x, 1, e.g.position.z, 8, 0xffe0b0, 5); } }
    if (t < T.llega && G3.arma){ G3.arma.puno.getWorldPosition(g3V); for (let i = 0; i < 2; i++) streak7(g3V.x + (rnd() - 0.5) * 1.6, g3V.y + (rnd() - 0.5) * 1.4, g3V.z + (rnd() - 0.5) * 1.6, -fx, 0, -fz, 2.4, 0xfff4e8, 0.18, 0.06); }
  }
  if (t >= T.llega && !ev.boom){ ev.boom = true;
    const x = m.O.x + fx * (G3_L + 2.6), z = m.O.z + fz * (G3_L + 2.6);
    foilRotulo('<b>ドン!</b><i>¡PISTOLA DE GIGANTE!</i>', 'g3Rot', 1.8); play('g3Golpe');
    shake = Math.max(shake, 0.85); hitStop = Math.max(hitStop, 0.14); flash('#fff4e0', 0.45); lightFlash(x, 1.5, z, 0xffd0a0, 3, 12);
    gring(x, 1.3, z, 0xffffff, 0.4, 3.8, 0.35, m.f); gring(x, 1.3, z, 0xffc890, 0.3, 2.6, 0.45, m.f); gring(x, 0.1, z, 0xffe0b0, 0.5, 5, 0.5); ringFx(x, z, 0xffc070, 0.5, 4.6, 0.5);
    crack7(x, z, 7, 2.4, false); burst7(PA7, x, 1.3, z, 30, [0xffffff, 0xffe0b0, 0xffb070], 9, 0.25, 0.45, 2, 2, 0, SH7.star); puffAt(x, z, 14, 3.2, 0xd8c8b0); }
  if (t >= T.vuelve && !ev.desinfla){ ev.desinfla = true; play('g3Desinfla'); }
  if (t >= T.vuelve && G3.arma && rnd() < 0.85){ G3.arma.puno.getWorldPosition(g3V);   // vapor al desinflarse
    pn(g3V.x + (rnd() - 0.5) * 0.6, g3V.y + (rnd() - 0.5) * 0.5, g3V.z + (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 1.5, 1.2 + rnd(), (rnd() - 0.5) * 1.5, 0xffffff, 0.3, 0.9, -1, 1, 2.4, SH7.dot, 0.55); }
  if (t >= T.vuelve + 0.18 && !ev.mini){ ev.mini = true; g3Mini(); }
  if (t >= T.fin) g3Fin();
}
// la miniatura: 3 s pequeño, un poco más rápido y con voz de pito (si ya hay otra forma, no hay miniatura)
function g3Mini(){
  return foilForma({ id: 'g3mini', nom: 'MINI TOVAN', col: '#ffb8a8', dur: 3, escala: 0.55, velK: 1.18,
    empieza(){ play('g3Pio'); later(0.12, () => play('g3Pio')); foilGrito('¡Me he quedado pequeñito!', '#ffd8c8'); barkOnce('g3mini', 'Te has desinflado de más. Ahora mides lo que un paquete pequeño. Y hablas como un globo.'); },
    golpe(){ play('g3Pio'); }, rodar(){ play('g3Pio'); return false; }, saltar(){ play('g3Pio'); return false; },
    tick(){ if (rnd() < 0.08) pn(hero.position.x + (rnd() - 0.5) * 0.4, 0.9 * hero.scale.y, hero.position.z + (rnd() - 0.5) * 0.4, 0, 0.8, 0, 0xffffff, 0.12, 0.6, -0.5, 1, 1.6, SH7.dot, 0.5); },
    fin(mot){ if (mot === 'tiempo'){ play('g3Pop'); puff(8); foilGrito('¡Ya está!', '#ffe0d0'); } } });
}
// remate en miniatura: un puñetazo de juguete
function g3Pito(f){
  play('g3Pio'); foilGrito('¡pi!', '#ffd8c8'); const O = hero.position;
  for (const e of enemies){ const n = enCono(O, e, f, 1.9, 1.0); if (n) foilGolpea(e, rdmg(6), n[0], n[1], 1, null, 0.4); }
}
function g3Pose(){
  const m = G3.m; if (!m) return; const t = m.t, T = G3_T, A = P.armR;
  if (t < T.sopla + 0.05){ const w = Math.min(1, t / 0.12);   // el pulgar a la boca y a soplar
    bl(A.sh.rotation, 'x', -2.25, w); bl(A.sh.rotation, 'y', 0, w); bl(A.sh.rotation, 'z', -0.5, w); bl(A.el.rotation, 'x', -2.1, w);
    bl(P.neck.rotation, 'x', 0.22, w); bl(P.neck.rotation, 'y', 0.25, w); bl(P.spine.rotation, 'y', 0.15, w); }
  else if (t < T.tira){ const w = Math.min(1, (t - T.sopla) / 0.15);   // se echa atrás con el brazo arriba
    bl(P.spine.rotation, 'y', 0.6, w); bl(P.spine.rotation, 'x', -0.14, w); bl(P.neck.rotation, 'y', -0.5, w);
    bl(P.armL.sh.rotation, 'x', -1.1, w); bl(P.armL.sh.rotation, 'z', -0.5, w);
    bl(P.legL.hip.rotation, 'x', -0.55, w); bl(P.legR.hip.rotation, 'x', 0.4, w); bl(P.legL.knee.rotation, 'x', 0.45, w); bl(P.legR.knee.rotation, 'x', 0.3, w); }
  else if (t < T.fin){ const w = t < T.vuelve ? Math.min(1, (t - T.tira) / 0.06) : Math.max(0, 1 - (t - T.vuelve) / 0.5);   // estocada hacia delante
    bl(P.spine.rotation, 'y', -0.7, w); bl(P.spine.rotation, 'x', 0.22, w); bl(P.neck.rotation, 'y', 0.55, w);
    bl(P.armL.sh.rotation, 'x', 0.9, w); bl(P.armL.sh.rotation, 'z', -0.4, w);
    bl(P.legL.hip.rotation, 'x', -0.8, w); bl(P.legR.hip.rotation, 'x', 0.6, w); bl(P.legL.knee.rotation, 'x', 0.6, w); bl(P.legR.knee.rotation, 'x', 0.15, w); }
}
function g3Post(){
  const A = G3.arma, m = G3.m; if (!A) return;
  if (!m){ A.raiz.visible = false; return; }
  const b = g3Brazo(m); A.raiz.visible = b.vis; G3.oculto = b.vis && b.s > 0.3; P.armR.sh.visible = !G3.oculto;
  if (!b.vis) return;
  P.armR.sh.getWorldPosition(A.raiz.position); A.raiz.rotation.set(b.pitch, b.yaw, 0); A.raiz.scale.setScalar(hero.scale.x);
  const z = 1.55 * b.s + 0.1 + b.d; A.puno.position.set(0, 0, z); A.puno.scale.setScalar(b.s);
  g3Tubo(A, Math.max(0.05, z - 1.45 * b.s), 0.34 * b.s / (1 + b.d * 0.05), b.amp, m.t);
}
foilPoder({ id: 'foilGear3', ic: '🎈', name: 'Tercera marcha', tags: ['otaku', 'impacto'],
  desc: 'Te muerdes el pulgar y soplas (lo vio en una de piratas): al rematar el combo, el brazo del arma se infla hasta ser gigante y suelta la «Pistola de gigante», un puño de goma que arrasa una franja de 8 m y lo manda todo lejos. Luego se desinfla y te quedas en miniatura 3 s (más rápido, con voz de pito).',
  remate(f){ if (foilEn('g3mini')){ g3Pito(f); return; } if (!G3.m) g3Empieza(f); },
  tick(dt, jugando){ g3Tick(dt, jugando); }, pose(){ g3Pose(); }, post(){ g3Post(); },
  herido(){ return g3Bloquea() ? 'none' : null; },   // de goma: mientras se infla y dispara, los golpes rebotan
  rodar(){ return g3Bloquea(); }, saltar(){ return g3Bloquea(); },
  limpia(){ g3Fin(); }, reset(){ g3Fin(); } });
const g3AtaqueOrig = doAttack, g3EspecialOrig = doSpecial;
doAttack = function(...a){ if (g3Bloquea()) return; return g3AtaqueOrig(...a); };
doSpecial = function(...a){ if (g3Bloquea()) return; return g3EspecialOrig(...a); };

/* ---------- Tintes de Tovan (los usan el modo zorro y la liberación) ----------
   Capas de colores (y, si se pide, sin textura: uHasMap) sobre los materiales de HERO_MATS: la primera guarda lo que había (con lo que hubiera
   puesto el vestidor) y, al quitar la última, se devuelve tal cual. Con dos a la vez, manda la última. */
const kyuTinte = { base: null, capas: [] };
function kyuTintePon(id, cols){
  const i = kyuTinte.capas.findIndex(c => c.id === id); if (i >= 0) kyuTinte.capas.splice(i, 1);
  if (!kyuTinte.base) kyuTinte.base = HERO_MATS.map(m => [m, m.uniforms.uColor.value.getHex(), m.uniforms.uEmissive.value, m.uniforms.uHasMap.value]);
  kyuTinte.capas.push({ id, cols }); kyuTinteAplica();
}
function kyuTinteQuita(id){ const i = kyuTinte.capas.findIndex(c => c.id === id); if (i < 0) return; kyuTinte.capas.splice(i, 1); kyuTinteAplica(); }
function kyuTinteAplica(){
  const B = kyuTinte.base; if (!B) return;
  for (const [m, h, em, mp] of B){ m.uniforms.uColor.value.setHex(h); m.uniforms.uEmissive.value = em; m.uniforms.uHasMap.value = mp; }
  for (const c of kyuTinte.capas) for (const [m, h, em, mp] of c.cols){ m.uniforms.uColor.value.setHex(h); if (em != null) m.uniforms.uEmissive.value = em; if (mp != null) m.uniforms.uHasMap.value = mp; }
  if (!kyuTinte.capas.length) kyuTinte.base = null;
}

/* ---------- 2. Manto de las nueve colas (de una de ninjas) · prefijo kyu ---------- */
const KYU = { forma: null, colas: [], deco: null, cupula: null, aura: 0 };
const KYU_COLA = [0xfff6c0, 0xffa424, 0xff5a12, 0], KYU_ZARPA = [0xfff2b0, 0xffb030, 0xff6a14, 0];
// la cinta de chakra: centro dorado claro, cuerpo naranja y borde rojizo que burbujea, con remolinos que corren hacia la punta
TRAZO_FS.kyu = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  float u = vUV.x, y = vUV.y, a = abs(y), m = u * uLen;
  float n = n2(vec2(m * 1.4 - uTime * 2.6 + uSeed, y * 2.2)) * 0.6 + n2(vec2(m * 3.5 - uTime * 4.0, y * 5.0 + uSeed)) * 0.4;
  float borde = 0.7 + 0.3 * n;
  if (a > borde) discard;
  float t = a / borde, esp = 0.5 + 0.5 * sin((m * 2.6 - uTime * 5.0) * 3.0 + y * 4.5 + n * 3.0);
  vec3 col = mix(uA, uB, smoothstep(0.0, 0.55, t)); col = mix(col, uC, smoothstep(0.62, 1.0, t));
  col += uA * 0.4 * smoothstep(0.55, 1.0, esp) * (1.0 - t);
  gl_FragColor = vec4(col, uAlpha * (0.5 + 0.5 * (1.0 - t)) * smoothstep(0.0, 0.08, u) * (0.72 + 0.28 * esp));
}`;
Object.assign(SFX, {
  kyuRugido: () => { tone({ type: 'sawtooth', f0: 72, f1: 38, dur: 1.3, vol: 0.26, rv: 0.6 }); tone({ type: 'sawtooth', f0: 76, f1: 40, dur: 1.3, vol: 0.2, rv: 0.6 });
    tone({ type: 'sine', f0: 55, f1: 30, dur: 1.4, vol: 0.4, rv: 0.4 }); noise({ dur: 1.2, vol: 0.2, f0: 420, f1: 160, type: 'lowpass', q: 0.8, rv: 0.6 }); },
  kyuZarpa: () => { noise({ dur: 0.22, vol: 0.24, f0: 1400, f1: 300, q: 1, rv: 0.2 }); tone({ type: 'sawtooth', f0: 160, f1: 70, dur: 0.18, vol: 0.08 }); },
  kyuBola: () => { for (let i = 0; i < 6; i++) noise({ dur: 0.12, vol: 0.12 + i * 0.02, f0: 600 + i * 400, q: 3, when: i * 0.06, rv: 0.2 }); tone({ type: 'sine', f0: 300, f1: 1400, dur: 0.45, vol: 0.08, rv: 0.3 }); },
  kyuBoom: () => { tone({ type: 'sine', f0: 140, f1: 30, dur: 1.0, vol: 0.7, rv: 0.6 }); noise({ dur: 0.9, vol: 0.38, f0: 5000, f1: 400, q: 0.6, rv: 0.6 }); tone({ type: 'triangle', f0: 1400, f1: 2200, dur: 0.5, vol: 0.06, rv: 0.6 }); },
  kyuFin: () => { for (let i = 0; i < 6; i++) tone({ type: 'triangle', f0: 1800 - i * 200, dur: 0.12, vol: 0.04, when: i * 0.04, rv: 0.5 }); noise({ dur: 0.5, vol: 0.12, f0: 3000, f1: 800, rv: 0.4 }); }
});
// la zarpa de energía (mano con cuatro garras apuntando a la derecha) y la esfera de remolinos, pintadas al cargar
const kyuZarpaMat = foilSprite(foilLienzo(256, 192, g => { const R = mulberry32(7411);
  const gr = g.createRadialGradient(110, 96, 6, 110, 96, 110); gr.addColorStop(0, 'rgba(255,240,170,0.9)'); gr.addColorStop(0.5, 'rgba(255,150,30,0.35)'); gr.addColorStop(1, 'rgba(255,90,10,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 192);
  const llama = (y0, y1) => { const q = g.createLinearGradient(0, y0, 0, y1); q.addColorStop(0, '#fff3b8'); q.addColorStop(0.5, '#ffb02a'); q.addColorStop(1, '#ff6012'); return q; };
  g.beginPath(); g.ellipse(92, 98, 44, 52, 0, 0, TAU); g.fillStyle = llama(46, 150); g.globalAlpha = 0.85; g.fill();   // palma
  for (let k = 0; k < 4; k++){ const a = -0.62 + k * 0.4, x0 = 112 + Math.cos(a) * 30, y0 = 98 + Math.sin(a) * 38, L = 92 + R() * 18, x1 = x0 + Math.cos(a) * L, y1 = y0 + Math.sin(a) * L * 0.75;
    g.beginPath(); g.moveTo(x0 - Math.sin(a) * 14, y0 + Math.cos(a) * 14); g.quadraticCurveTo((x0 + x1) / 2 - Math.sin(a) * 20, (y0 + y1) / 2 + Math.cos(a) * 16, x1, y1);
    g.quadraticCurveTo((x0 + x1) / 2 + Math.sin(a) * 10, (y0 + y1) / 2 - Math.cos(a) * 14, x0 + Math.sin(a) * 14, y0 - Math.cos(a) * 14); g.closePath(); g.fillStyle = llama(y1 - 30, y0 + 30); g.fill();
    g.beginPath(); g.moveTo(x1 - Math.cos(a) * 26 - Math.sin(a) * 6, y1 - Math.sin(a) * 20 + Math.cos(a) * 6); g.lineTo(x1 + Math.cos(a) * 16, y1 + Math.sin(a) * 12); g.lineTo(x1 - Math.cos(a) * 26 + Math.sin(a) * 6, y1 - Math.sin(a) * 20 - Math.cos(a) * 6);
    g.closePath(); g.fillStyle = '#ffffff'; g.globalAlpha = 1; g.fill(); g.globalAlpha = 0.85; }   // garra
  g.globalAlpha = 1; for (let k = 0; k < 18; k++){ g.beginPath(); g.arc(30 + R() * 200, 30 + R() * 132, 2 + R() * 6, 0, TAU); g.fillStyle = R() < 0.5 ? 'rgba(255,230,140,0.7)' : 'rgba(255,140,30,0.6)'; g.fill(); } }), true);
const kyuBolaMat = foilSprite(foilLienzo(128, 128, g => { const R = mulberry32(7417);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(190,230,255,0.95)'); gr.addColorStop(0.62, 'rgba(70,150,255,0.55)'); gr.addColorStop(1, 'rgba(30,80,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.lineCap = 'round';
  for (let k = 0; k < 16; k++){ const r = 12 + R() * 40, a0 = R() * TAU, L = 1.2 + R() * 2.2; g.beginPath(); g.arc(64, 64, r, a0, a0 + L); g.strokeStyle = R() < 0.5 ? 'rgba(255,255,255,0.9)' : 'rgba(150,210,255,0.85)'; g.lineWidth = 1.5 + R() * 3; g.stroke(); } }), true);
const kyuSelloTex = (() => { const c = foilLienzo(64, 64, g => { g.strokeStyle = '#120a06'; g.lineCap = 'round'; g.lineWidth = 3.4; g.beginPath();
    for (let i = 0; i <= 60; i++){ const a = i / 60 * TAU * 2.6, r = 2 + i * 0.36; i ? g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r) : g.moveTo(32, 32); } g.stroke();
    g.lineWidth = 2.6; for (let k = 0; k < 8; k++){ const a = k / 8 * TAU; g.beginPath(); g.moveTo(32 + Math.cos(a) * 26, 32 + Math.sin(a) * 26); g.lineTo(32 + Math.cos(a) * 31, 32 + Math.sin(a) * 31); g.stroke(); } });
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t; })();
// llamas de energía alrededor del cuerpo (aditivas), que suben y burbujean
const KYU_AURA_FS = `uniform vec3 uColor; uniform vec3 uColor2; uniform float uAmt; uniform float uT; varying vec2 vUv;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  float y = vUv.y, n = n2(vec2(vUv.x * 10.0, y * 3.0 - uT * 2.4)), b = n2(vec2(vUv.x * 26.0, y * 7.0 - uT * 4.5));
  float top = 0.42 + 0.55 * n, a = (1.0 - smoothstep(top - 0.28, top, y)) * smoothstep(0.0, 0.12, y) * (0.45 + 0.55 * b) * uAmt;
  gl_FragColor = vec4(mix(uColor2, uColor, clamp(y * 1.3 + 0.3 * n, 0.0, 1.0)) * a, 1.0); }`;
// la cúpula de la bomba espiral (aditiva): remolinos azules y blancos, más brillante en el borde
const KYU_CUP_VS = `varying vec3 vP; varying vec3 vN; varying vec3 vV; void main(){ vP = position; vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const KYU_CUP_FS = `uniform float uT; uniform float uA; varying vec3 vP; varying vec3 vN; varying vec3 vV;
void main(){
  float ang = atan(vP.z, vP.x), h = vP.y;
  float e1 = 0.5 + 0.5 * sin(ang * 5.0 + h * 9.0 - uT * 16.0), e2 = 0.5 + 0.5 * sin(ang * 9.0 - h * 14.0 + uT * 11.0);
  float rim = 1.0 - abs(dot(normalize(vN), normalize(vV)));
  vec3 col = mix(vec3(0.2, 0.5, 1.0), vec3(0.92, 0.98, 1.0), clamp(smoothstep(0.55, 1.0, e1) * 0.8 + rim * 0.55, 0.0, 1.0));
  float a = uA * (0.22 + 0.6 * pow(rim, 1.5) + 0.4 * smoothstep(0.55, 1.0, e1 * e2));
  gl_FragColor = vec4(col * a, 1.0); }`;
function kyuConstruye(){
  if (KYU.deco) return KYU.deco;
  const auraM = (c1, c2) => new THREE.ShaderMaterial({ uniforms: { uColor: { value: new THREE.Color(c1) }, uColor2: { value: new THREE.Color(c2) }, uAmt: { value: 0 }, uT: { value: 0 }, uEmissive: { value: 1 }, uOpacity: { value: 1 } },
    vertexShader: AD7_VS, fragmentShader: KYU_AURA_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const geo = new THREE.CylinderGeometry(0.46, 0.66, 2.3, 18, 1, true); geo.translate(0, 1.12, 0);
  const aura = [auraM(0xffe680, 0xff7a10), auraM(0xfff4c0, 0xffa020)].map((m, i) => { const a = new THREE.Mesh(geo, m); a.frustumCulled = false; a.renderOrder = 6; a.visible = false; hero.add(a); if (i) a.scale.set(0.74, 0.82, 0.74); return a; });
  const selloM = makeMat(0xffffff, { map: kyuSelloTex, emissive: 0.6 }), sg = new THREE.PlaneGeometry(0.34, 0.34);
  const sellos = [[0.3, 0.262, 0], [0.34, -0.262, Math.PI]].map(([y, z, r]) => { const m = mesh(sg, selloM, 0, y, z, P.spine); m.rotation.y = r; m.visible = false; return m; });   // espiral en la tripa y en la espalda
  const cuernoM = makeMat(0xffc040, { emissive: 0.9 });
  const cuernos = [-1, 1].map(s => { const m = mesh(new THREE.ConeGeometry(0.08, 0.46, 4), cuernoM, 0.14 * s, 0.72, -0.04, P.neck); m.rotation.set(-0.3, 0, -0.5 * s); m.visible = false; return m; });
  return KYU.deco = { aura, sellos, cuernos };
}
function kyuCupula(){
  if (KYU.cupula) return KYU.cupula;
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 26, 12, 0, TAU, 0, Math.PI / 2), new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uA: { value: 1 } }, vertexShader: KYU_CUP_VS, fragmentShader: KYU_CUP_FS,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  m.frustumCulled = false; m.renderOrder = 6; m.visible = false; scene.add(m); return KYU.cupula = m;
}
function kyuDeco(on){
  const D = kyuConstruye(); for (const a of D.aura) a.visible = on; for (const s of D.sellos) s.visible = on; for (const c of D.cuernos) c.visible = on;
  if (on) kyuTintePon('kyu', [[M.coat, 0xffb22a, 0.5, 0], [M.coatDS, 0xffb22a, 0.5, 0], [M.pants, 0x2a1c12, 0.08], [M.boot, 0x1a120c, 0.05], [M.glove, 0xffd060, 0.6],
    [M.skin, 0xffe2b4, 0.3], [M.hair, 0xffe7a0, 0.45], [M.scarf, 0xff7a10, 0.6], [M.gold, 0x140c06, 0], [M.belt, 0x140c06, 0]]);
  else kyuTinteQuita('kyu');
}
// las nueve colas: salen de la cadera hacia atrás en abanico, suben, se curvan hacia arriba en la punta y ondean
const kyuB = new V3(), kyuBk = new V3(), kyuRt = new V3();
function kyuColas(dt){
  if (!KYU.colas.length) return;
  const s = hero.scale.x, h = hero.rotation.y, aura = KYU.aura; P.hips.getWorldPosition(kyuB);
  kyuBk.set(-Math.sin(h), 0, -Math.cos(h)); kyuRt.set(Math.cos(h), 0, -Math.sin(h)); kyuB.addScaledVector(kyuBk, 0.22 * s);
  KYU.colas.forEach((c, i) => { const q = i / 8 - 0.5, aq = Math.abs(q) * 2, fi = q * 2.8 + Math.sin(time * 1.3 + i) * 0.08, L = (1.5 + 0.9 * aq) * s * (0.4 + 0.6 * aura), dx = Math.cos(fi), dz = Math.sin(fi);
    tintaPinta(c, (u, v) => { const ond = Math.sin(time * 3.2 + u * 3.5 + i * 0.7) * 0.35 * u * u, sube = Math.sin(time * 2.6 + u * 3 + i) * 0.25 * u * u, hz = L * u * (1 - 0.3 * u) * (0.5 + 0.5 * aq);
        return v.set(kyuB.x, kyuB.y, kyuB.z).addScaledVector(kyuBk, hz * dx).addScaledVector(kyuRt, hz * dz + ond * s).setY(kyuB.y + L * (0.2 * u + (1.05 - 0.25 * aq) * u * u) + sube * s); },
      0, 1, k => 0.5 * s * Math.pow(Math.sin(Math.PI * (0.08 + 0.84 * k)), 0.7) * (0.75 + 0.25 * k));
    c.mat.uniforms.uAlpha.value = 0.8 * aura; });
}
function kyuForma(){
  return foilForma({ id: 'kyu', nom: 'MODO ZORRO', col: '#ffb030', dur: 12, velK: 1.3, danoK: 1.35, camK: 1.1,
    empieza(){ KYU.forma = this; KYU.aura = 0; kyuDeco(true); KYU.colas = Array.from({ length: 9 }, () => tintaCoge(KYU_COLA, 0, 'kyu'));
      const x = hero.position.x, z = hero.position.z; play('kyuRugido'); flash('#ffb030', 0.5); shake = Math.max(shake, 0.5); lightFlash(x, 1.5, z, 0xffa020, 3, 12);
      ringFx(x, z, 0xffb030, 0.4, 5, 0.6); gring(x, 0.1, z, 0xffe080, 0.5, 4, 0.5); burst7(PA7, x, 1.1, z, 36, [0xffd060, 0xff8a20, 0xffffff], 7, 0.22, 0.7, -1, 1.5, 0, SH7.star);
      foilRotulo('<b>九尾</b><i>¡MODO ZORRO!</i>', 'kyuRot', 1.9);
      barkOnce('kyu', '¡Te han salido nueve colas! Muy bonitas, pero luego no te sientes en mi sofá.'); },
    tick(dt){ KYU.aura = Math.min(1, KYU.aura + dt * 3); const D = KYU.deco, x = hero.position.x, z = hero.position.z;
      for (const a of D.aura){ a.material.uniforms.uT.value = time; a.material.uniforms.uAmt.value = 0.5 * KYU.aura * (0.85 + 0.15 * Math.sin(time * 9)); }
      if (rnd() < 0.7) pa(x + (rnd() - 0.5) * 0.9, 0.2 + rnd() * 1.6 * hero.scale.y, z + (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.4, 1 + rnd(), (rnd() - 0.5) * 0.4, rnd() < 0.6 ? 0xffb030 : 0xfff0a0, 0.12, 0.6, -0.5, 1, 0.3, SH7.dot, 0.8); },
    postPose(){ kyuColas(); },
    golpe(f, idx){ kyuZarpaLanza(f, idx); }, remate(f){ kyuBomba(f); },
    pose(){ if (walkW > 0.3 && state === 'normal' && grounded){ const w = walkW;   // carrera con los brazos atrás
        bl(P.armL.sh.rotation, 'x', 1.25, w); bl(P.armR.sh.rotation, 'x', 1.25, w); bl(P.armL.sh.rotation, 'z', -0.3, w); bl(P.armR.sh.rotation, 'z', 0.3, w);
        bl(P.armL.el.rotation, 'x', -0.1, w); bl(P.armR.el.rotation, 'x', -0.1, w); bl(P.spine.rotation, 'x', 0.55, w); bl(P.neck.rotation, 'x', -0.4, w); } },
    fin(){ const x = hero.position.x, z = hero.position.z; for (const c of KYU.colas) tintaSuelta(c); KYU.colas = []; kyuDeco(false); KYU.forma = null;
      if (gameState === 'play' || gameState === 'paused'){ burst7(PA7, x, 1.1, z, 40, [0xffd060, 0xff8a20, 0xffffff], 5, 0.18, 0.8, -1, 1.2, 0, SH7.star); play('kyuFin'); } } });
}
// cada golpe: una zarpa de energía gigante que barre en abanico, con cuatro arañazos de chakra
function kyuZarpaLanza(f, idx){
  const sg = idx % 2 ? -1 : 1, O = hero.position.clone(), sp = new THREE.Sprite(kyuZarpaMat); sp.renderOrder = 7; scene.add(sp);
  for (let k = 0; k < 4; k++) tintaArco(KYU_ZARPA, 1.8 + k * 0.42, f, sg, 0.3, 0.26, 0.6 + k * 0.16, k ? null : O2 => { const d = rdmg(12);
    for (const e of enemies){ const n = enCono(O2, e, f, 3.8, 1.35); if (n && foilGolpea(e, d, n[0], n[1], 3, null, 0.8)) sparks(e.g.position.x, 1, e.g.position.z, 5, 0xffd060, 4); } }, 'kyu');
  play('kyuZarpa');
  foilFx.push({ t: 0, upd(){ const k = Math.min(1, this.t / 0.16), fade = Math.max(0, (this.t - 0.16) / 0.22); if (fade >= 1) return false;
      const a = f + sg * lerp(1.1, -1.1, smooth(k)), r = 2.1; sp.position.set(O.x + Math.sin(a) * r, O.y + 1.2, O.z + Math.cos(a) * r);
      g3V.copy(sp.position).project(camera); g3W.set(O.x + Math.sin(a) * (r + 1), O.y + 1.2, O.z + Math.cos(a) * (r + 1)).project(camera);
      kyuZarpaMat.rotation = Math.atan2((g3W.y - g3V.y) * innerHeight, (g3W.x - g3V.x) * innerWidth); kyuZarpaMat.opacity = 1 - fade; sp.scale.set(3.2 * (0.7 + 0.3 * k), 2.4 * (0.7 + 0.3 * k), 1);
      return true; }, fin(){ scene.remove(sp); } });
}
// el remate: «Bomba espiral», una esfera de remolinos en la mano que estalla en una cúpula azul y blanca
function kyuBomba(f){
  const O = hero.position.clone(), fx = Math.sin(f), fz = Math.cos(f), C = new V3(O.x + fx * 1.8, 0, O.z + fz * 1.8), bola = new THREE.Sprite(kyuBolaMat), D = kyuCupula(), ya = new Set(), dmg = rdmg(42);
  bola.renderOrder = 8; scene.add(bola); play('kyuBola'); foilGrito('¡Bomba espiral!', '#bfe4ff');
  const fx_ = { t: 0, upd(){ const t = this.t;
      if (t < 0.42){ manoDe(g3V); const k = smooth(t / 0.42); bola.position.set(lerp(g3V.x, C.x, k * k), lerp(g3V.y, 1.0, k * k), lerp(g3V.z, C.z, k * k)); bola.scale.setScalar(0.35 + 0.9 * k + Math.sin(time * 50) * 0.05); kyuBolaMat.rotation = -time * 14; kyuBolaMat.opacity = 1;
        if (rnd() < 0.9){ const a = rnd() * TAU, r = 0.9; pa(bola.position.x + Math.cos(a) * r, bola.position.y + (rnd() - 0.5) * 0.6, bola.position.z + Math.sin(a) * r, -Math.cos(a) * 2.6, 0, -Math.sin(a) * 2.6, rnd() < 0.5 ? 0xffffff : 0x7ac0ff, 0.09, 0.32, 0, 0, 0.3, SH7.dot, 1); } }
      else { if (!this.boom){ this.boom = true; D.userData.dueno = this; D.visible = true; D.position.copy(C); play('kyuBoom'); shake = Math.max(shake, 0.6); hitStop = Math.max(hitStop, 0.08);
          flash('#cfe8ff', 0.45); lightFlash(C.x, 1.5, C.z, 0x6ab8ff, 3.2, 12); ringFx(C.x, C.z, 0x9fd8ff, 0.5, 5.2, 0.5); gring(C.x, 0.12, C.z, 0xffffff, 0.4, 4.6, 0.4);
          burst7(PA7, C.x, 1, C.z, 34, [0xffffff, 0x9fd8ff, 0x3a8aff], 9, 0.2, 0.6, 1, 1.5, 0, SH7.star); crack7(C.x, C.z, 6, 2.2, false); }
        const k = Math.min(1, (t - 0.42) / 0.32), R = 4.4 * (1 - Math.pow(1 - k, 2.5)), fade = Math.max(0, (t - 0.85) / 0.4); if (fade >= 1) return false;
        bola.visible = t < 0.55; bola.scale.setScalar(1.25 + (t - 0.42) * 12); kyuBolaMat.opacity = Math.max(0, 1 - (t - 0.42) / 0.13);
        if (D.userData.dueno === this){ D.scale.set(Math.max(0.01, R), Math.max(0.01, R * 0.82), Math.max(0.01, R)); D.material.uniforms.uT.value = time; D.material.uniforms.uA.value = 1 - fade; }
        for (const e of enemies){ if (ya.has(e) || !e.alive || e.spawnT > 0) continue; const dx = e.g.position.x - C.x, dz = e.g.position.z - C.z, d = Math.hypot(dx, dz);
          if (d - e.r < R) foilGolpea(e, dmg, dx / Math.max(d, 0.01), dz / Math.max(d, 0.01), 8, null, 1.5, ya); } }
      return true; },
    fin(){ scene.remove(bola); if (D.userData.dueno === this){ D.visible = false; D.userData.dueno = null; } } };
  foilFx.push(fx_);
}
foilPoder({ id: 'foilKyubi', ic: '🦊', name: 'Manto de las nueve colas', tags: ['otaku', 'fuego'],
  desc: 'El zorro que llevas dentro (como en una de ninjas) te presta su manto: con el ímpetu lleno, el especial te da 12 s de modo zorro, con nueve colas de energía, +30 % de velocidad y +35 % de daño. Cada golpe lanza una zarpa gigante y el remate es una «Bomba espiral» que estalla en una cúpula.',
  especial(){ if (FOILX.forma) return false; return !!kyuForma(); },
  limpia(){ if (KYU.forma && FOILX.forma !== KYU.forma){ for (const c of KYU.colas) tintaSuelta(c); KYU.colas = []; KYU.forma = null; } if (KYU.deco && !KYU.forma) kyuDeco(false); if (KYU.cupula){ KYU.cupula.visible = false; KYU.cupula.userData.dueno = null; } },
  reset(){ kyuTinte.capas.length = 0; kyuTinteAplica(); } });

/* ---------- 3. Colmillo lunar (de una de segadores de almas) · prefijo gtsu ---------- */
const GTSU = { n: 0, lib: 0, sets: null, cics: null, marca: '' };
const GTSU_TAJO = [0x040006, 0x0a0008, 0xff1a2e, 0];
// el tajo fino de cada golpe: núcleo negro, filo carmesí que tiembla
TRAZO_FS.gtsu = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  float u = vUV.x, a = abs(vUV.y), m = u * uLen, n = n2(vec2(m * 2.2 - uTime * 3.0 + uSeed, vUV.y * 3.0));
  float borde = 0.74 + 0.26 * n; if (a > borde) discard;
  float t = a / borde; vec3 col = mix(uA, uC, smoothstep(0.5, 0.9, t)); col = mix(col, vec3(1.0, 0.62, 0.62), smoothstep(0.93, 1.0, t) * 0.6);
  gl_FragColor = vec4(col, uAlpha * smoothstep(0.0, 0.1, u));
}`;
// la media luna (malla propia): v = 0 en el filo interior, 1 en el borde exterior, que llamea en carmesí; BRILLO = el halo aditivo
const GTSU_VS = `varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const GTSU_FS = `uniform float uA; uniform float uT; uniform float uSeed; varying vec2 vU;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  float u = vU.x, v = vU.y, n = n2(vec2(u * 16.0 - uT * 9.0 + uSeed, v * 3.0)), tip = smoothstep(0.0, 0.1, u) * smoothstep(1.0, 0.9, u);
#ifdef BRILLO
  float g = smoothstep(0.2, 0.85, v) * (1.0 - smoothstep(0.85, 1.0, v + 0.1 * n)) * tip;
  gl_FragColor = vec4(vec3(1.0, 0.08, 0.16) * g * uA * (0.6 + 0.4 * n), 1.0);
#else
  if (v > 0.84 + 0.16 * n) discard;
  float rim = smoothstep(0.48, 0.86, v + 0.1 * n);
  vec3 col = mix(vec3(0.02, 0.0, 0.03), vec3(0.86, 0.04, 0.12), rim);
  col = mix(col, vec3(1.0, 0.6, 0.55), smoothstep(0.84, 0.98, v + 0.12 * n) * 0.75);
  col = mix(col, vec3(0.75, 0.02, 0.1), (1.0 - smoothstep(0.0, 0.12, v)) * 0.8);
  gl_FragColor = vec4(col, uA * tip);
#endif
}`;
// la cicatriz del suelo: grieta negra y dentada con los bordes al rojo
const GTSU_CIC_FS = `uniform float uA; uniform float uSeed; uniform float uL; varying vec2 vU;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  float x = abs(vU.x - 0.5) * 2.0, y = vU.y, n = n2(vec2(y * uL * 2.5 + uSeed, 0.5)) * 0.7 + n2(vec2(y * uL * 9.0 - uSeed, 2.5)) * 0.3;
  float w = (0.3 + 0.6 * n) * smoothstep(0.0, 0.06, y) * smoothstep(1.0, 0.86, y); if (x > w) discard;
  float t = x / max(w, 0.001); gl_FragColor = vec4(mix(vec3(0.03, 0.0, 0.02), vec3(0.8, 0.05, 0.1), smoothstep(0.5, 1.0, t)), uA * (1.0 - 0.35 * t)); }`;
Object.assign(SFX, {
  gtsuTajo: () => { noise({ dur: 0.55, vol: 0.34, f0: 1300, f1: 180, type: 'bandpass', q: 1.4, rv: 0.75 }); tone({ type: 'sine', f0: 110, f1: 38, dur: 0.7, vol: 0.42, rv: 0.75 }); tone({ type: 'sawtooth', f0: 220, f1: 55, dur: 0.32, vol: 0.1, rv: 0.6 }); },
  gtsuCorte: () => noise({ dur: 0.16, vol: 0.2, f0: 2600, f1: 500, q: 1.2, rv: 0.3 }),
  gtsuLib: () => { tone({ type: 'sine', f0: 60, f1: 30, dur: 1.4, vol: 0.55, rv: 0.8 }); noise({ dur: 1.2, vol: 0.24, f0: 300, f1: 3000, q: 1.5, rv: 0.6 }); tone({ type: 'sawtooth', f0: 110, f1: 220, dur: 1.0, vol: 0.07, rv: 0.6 }); }
});
function gtsuConstruye(){   // la media luna va centrada en su caja, para girarla sobre sí misma
  if (GTSU.sets) return;
  const N = 34, Mv = 4, AL = 1.45, pos = [], uv = [], idx = [];
  for (let i = 0; i <= N; i++){ const u = i / N, th = (u * 2 - 1) * AL, w = 0.42 * Math.pow(Math.cos((u * 2 - 1) * Math.PI / 2), 0.85);
    for (let j = 0; j <= Mv; j++){ const v = j / Mv, r = 1 - w + w * v; pos.push(Math.sin(th) * r, 0.56 - Math.cos(th) * r, -(1 - Math.cos(th)) * 0.4); uv.push(u, v); } }
  for (let i = 0; i < N; i++) for (let j = 0; j < Mv; j++){ const a = i * (Mv + 1) + j, b = a + Mv + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  const mat = brillo => new THREE.ShaderMaterial({ uniforms: { uA: { value: 1 }, uT: { value: 0 }, uSeed: { value: 0 } }, vertexShader: GTSU_VS, fragmentShader: GTSU_FS, defines: brillo ? { BRILLO: '' } : {},
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: brillo ? THREE.AdditiveBlending : THREE.NormalBlending });
  GTSU.sets = [0, 1].map(() => { const g = new THREE.Group(); g.rotation.order = 'YXZ'; g.visible = false; scene.add(g);
    const brillo = new THREE.Mesh(geo, mat(true)); brillo.scale.setScalar(1.12); brillo.position.z = -0.05;
    const capas = [0, 1, 2].map(k => { const m = new THREE.Mesh(geo, mat(false)); m.position.z = -k * 0.55; return m; });   // la luna y dos ecos detrás (la estela)
    for (const m of [brillo, ...capas]){ m.frustumCulled = false; m.renderOrder = 6; g.add(m); }
    return { g, brillo, capas, dueno: null }; });
  const cg = new THREE.PlaneGeometry(1, 1); cg.rotateX(-Math.PI / 2); cg.translate(0, 0, 0.5);
  GTSU.cics = [0, 1].map(() => { const m = new THREE.Mesh(cg, new THREE.ShaderMaterial({ uniforms: { uA: { value: 1 }, uSeed: { value: 0 }, uL: { value: 10 } }, vertexShader: GTSU_VS, fragmentShader: GTSU_CIC_FS,
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    m.frustumCulled = false; m.renderOrder = 1; m.visible = false; scene.add(m); m.userData.dueno = null; return m; });
}
// cada golpe normal: un tajo negro fino
function gtsuTajo(f, idx){
  tintaArco(GTSU_TAJO, 1.85, f, idx % 2 ? -1 : 1, 0.34, 0.24, 1.0, O => { const d = rdmg(9);
    for (const e of enemies){ const n = enCono(O, e, f, 2.7, 1.3); if (n && foilGolpea(e, d, n[0], n[1], 1.5, null, 0.5)) sparks(e.g.position.x, 1, e.g.position.z, 4, 0xff2a3a, 3); } }, 'gtsu');
  play('gtsuCorte');
}
// el remate: una media luna (o dos en cruz con la liberación) que vuela 12 m y deja la cicatriz
function gtsuRemate(f){
  gtsuConstruye(); GTSU.n++;
  const lib = GTSU.n % 3 === 0 || GTSU.lib > 0;
  if (GTSU.n % 3 === 0) gtsuLibera();
  foilRotulo(`<b>月牙天衝</b><i>${lib ? 'Colmillo lunar · liberado' : 'Colmillo lunar'}</i>`, 'gtsuRot' + (lib ? ' gtsuRotLib' : ''), 1.3);
  play('gtsuTajo'); shake = Math.max(shake, lib ? 0.45 : 0.3); flash(lib ? '#2a0008' : '#140008', 0.35); lightFlash(hero.position.x, 1.5, hero.position.z, 0xff1a2e, 2.4, 9);
  barkOnce('gtsu', '¿Una luna negra que corta? Eso no se reparte, Tovan: eso se denuncia.');
  const inc = lib ? [0.7, -0.7] : [(Math.PI / 2 - 0.42) * (rnd() < 0.5 ? -1 : 1)], cic = gtsuCic(f, lib);
  inc.forEach((tilt, k) => gtsuLuna(f, tilt, lib, k, cic));
  gtsuMarcaPinta();
}
function gtsuCic(f, lib){
  const c = GTSU.cics.find(m => !m.userData.dueno) || GTSU.cics[0], O = hero.position, fx = Math.sin(f), fz = Math.cos(f);
  c.position.set(O.x + fx * 0.8, 0.05, O.z + fz * 0.8); c.rotation.set(0, f, 0); c.scale.set(lib ? 1.5 : 1.05, 1, 0.01); c.visible = true;
  c.material.uniforms.uSeed.value = rnd() * 50; c.material.uniforms.uA.value = 1; c.userData.dueno = {}; return c;
}
function gtsuLuna(f, tilt, lib, k, cic){
  const S = GTSU.sets.find(q => !q.dueno) || GTSU.sets[k], O = hero.position.clone(), fx = Math.sin(f), fz = Math.cos(f), ya = new Set(), dmg = rdmg(lib ? 34 : 42), DUR = 0.8, L = 12;
  const yo = {}, cTok = cic.userData.dueno, esMia = () => k === 0 && cic.userData.dueno === cTok; S.dueno = yo; S.g.visible = true; for (const m of [S.brillo, ...S.capas]) m.material.uniforms.uSeed.value = rnd() * 40;
  let dPrev = 0.8;
  foilFx.push({ t: 0, upd(dt){
      const k = Math.min(1, this.t / DUR), d = 1.5 + (L - 0.7) * Math.pow(k, 1.45), R = (lib ? 1.2 : 0.8) + (lib ? 1.0 : 0.9) * Math.min(1, k * 2.2), hw = R * (Math.abs(Math.cos(tilt)) * 0.99 + Math.abs(Math.sin(tilt)) * 0.44) + 0.5, fade = Math.max(0, (this.t - DUR + 0.14) / 0.14);
      if (S.dueno === yo){
        if (fade < 1){ S.g.position.set(O.x + fx * d, R * (Math.abs(Math.sin(tilt)) * 0.99 + Math.abs(Math.cos(tilt)) * 0.44) + 0.12, O.z + fz * d); S.g.rotation.set(0, f, tilt); S.g.scale.setScalar(R);
          S.brillo.material.uniforms.uA.value = 1 - fade; S.capas.forEach((m, i) => { m.material.uniforms.uA.value = (1 - fade) * [1, 0.45, 0.2][i]; m.material.uniforms.uT.value = time; }); S.brillo.material.uniforms.uT.value = time;
          for (let i = 0; i < 2; i++){ const th = (rnd() * 2 - 1) * 1.3, x = Math.sin(th) * R, y = (0.56 - Math.cos(th)) * R, c = Math.cos(tilt), s = Math.sin(tilt), lx = x * c - y * s, ly = x * s + y * c + S.g.position.y;
            const wx = O.x + fx * d + Math.cos(f) * lx, wz = O.z + fz * d - Math.sin(f) * lx; (i ? pn : pa)(wx, ly, wz, -fx * 3, 0.5, -fz * 3, i ? 0x0a0008 : 0xff1a2e, i ? 0.12 : 0.12, 0.45, 0, 2, 0.4, SH7.dia, 0.9); } }
        else { S.g.visible = false; S.dueno = null; } }
      if (esMia()) cic.scale.z = Math.max(cic.scale.z, d - 0.8);   // la cicatriz se alarga detrás de la luna
      if (fade < 1) for (const e of enemies){ if (ya.has(e) || !e.alive || e.spawnT > 0) continue; const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, al = dx * fx + dz * fz, pe = Math.abs(dx * fz - dz * fx);
        if (al > dPrev - 0.8 - e.r && al < d + 0.6 + e.r && pe < hw + e.r && foilGolpea(e, dmg, fx, fz, 5, null, 1.2, ya)){ sparks(e.g.position.x, 1.2, e.g.position.z, 8, 0xff2a3a, 5); burst7(PN7, e.g.position.x, 1.2, e.g.position.z, 6, [0x0a0008, 0x3a0010], 4, 0.12, 0.5, 0, 3, 1.2, SH7.dia, 0); } }
      dPrev = d;
      if (esMia()){ const q = (this.t - DUR) / 2.2; cic.material.uniforms.uA.value = Math.max(0, 1 - Math.max(0, q)); cic.material.uniforms.uL.value = cic.scale.z; }
      return this.t < DUR + 2.2; },
    fin(){ if (S.dueno === yo){ S.g.visible = false; S.dueno = null; } if (esMia()){ cic.visible = false; cic.userData.dueno = null; } } });
}
// liberación: 6 s de abrigo negro con ribetes rojos y colmillos dobles
function gtsuLibera(){
  GTSU.lib = 6; play('gtsuLib'); flash('#1a0006', 0.6); shake = Math.max(shake, 0.4);
  kyuTintePon('gtsu', [[M.coat, 0x17151d, 0.05, 0], [M.coatDS, 0x17151d, 0.05, 0], [M.gold, 0xd8102a, 0.55], [M.belt, 0x0a0a0e, 0]]);
  const x = hero.position.x, z = hero.position.z; burst7(PN7, x, 1.1, z, 30, [0x0a0008, 0x3a0010], 6, 0.12, 0.9, -2, 1.5, 1.2, SH7.dia, 2); gring(x, 0.1, z, 0xff1a2e, 0.4, 3.6, 0.5); ringFx(x, z, 0x2a0010, 0.3, 4, 0.5);
  barkOnce('gtsuLib', 'Abrigo negro, ribetes rojos… Te queda bien, pero das un poco de miedo.');
}
function gtsuLibFin(){ if (GTSU.lib > 0 || kyuTinte.capas.some(c => c.id === 'gtsu')){ GTSU.lib = 0; kyuTinteQuita('gtsu'); gtsuMarcaPinta(); } }
function gtsuMarcaPinta(){
  const el = foilMarcador('gtsu', 'gtsuMarca'), n = GTSU.n % 3, html = GTSU.lib > 0 ? `<b>解放</b><u style="--k:${(GTSU.lib / 6).toFixed(3)}"></u>` : `<b>月牙</b><span>${[0, 1, 2].map(i => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`;
  if (el.innerHTML !== html) el.innerHTML = html; el.classList.toggle('gtsuLib', GTSU.lib > 0);
}
function gtsuTick(dt, jugando){
  const el = document.getElementById('foilM-gtsu'), ver = gameState === 'play' || gameState === 'paused' || gameState === 'upgrade';
  if (!el) gtsuMarcaPinta(); else el.hidden = !ver;
  if (GTSU.lib > 0 && jugando && dt > 0){ GTSU.lib -= dt; gtsuMarcaPinta();
    if (rnd() < 0.6){ const x = hero.position.x + (rnd() - 0.5) * 0.8, z = hero.position.z + (rnd() - 0.5) * 0.8; rnd() < 0.5 ? pn(x, 0.2 + rnd() * 1.2, z, 0, 1.2 + rnd(), 0, 0x14000a, 0.09, 0.7, -1, 1, 0.5, SH7.dia, 0.8) : pa(x, 0.3 + rnd() * 1.2, z, 0, 1.4, 0, 0xff1a2e, 0.1, 0.5, -1, 1, 0.4, SH7.dia, 0.9); }
    if (GTSU.lib <= 0) gtsuLibFin(); }
  if (player.dead && GTSU.lib > 0) gtsuLibFin();
}
foilPoder({ id: 'foilGetsuga', ic: '🌙', name: 'Colmillo lunar', tags: ['otaku', 'sangre'],
  desc: 'Tu arma aprendió a cortar almas (en una de segadores): cada golpe deja un tajo negro, y al rematar el combo sale una media luna negra de borde carmesí que vuela 12 m atravesándolo todo. Cada tercer remate, «liberación»: 6 s de abrigo negro y colmillos dobles, en cruz y más grandes.',
  golpe(f, idx){ gtsuTajo(f, idx); }, remate(f){ gtsuRemate(f); }, tick(dt, jugando){ gtsuTick(dt, jugando); },
  limpia(){ gtsuLibFin(); if (GTSU.sets){ for (const S of GTSU.sets){ S.g.visible = false; S.dueno = null; } for (const c of GTSU.cics){ c.visible = false; c.userData.dueno = null; } } },
  reset(){ GTSU.n = 0; gtsuLibFin(); }, coge(){ gtsuMarcaPinta(); } });

/* ---------- 4. Espíritu de pelea (de una de aventuras bizarras) · prefijo ora ---------- */
const ORA = { g: null, R: null, mat: null, m: null, guarda: 0, bloq: null, quieto: 0, goT: 0, go: [], fists: null, ver: 0, rot: 0, golpe: 0, capa: null };
const ORA_RUSH = 1.2, ORA_GUARDA = 10;
// translúcido con trama (como el resto del juego), borde que brilla en lila y una línea de barrido que sube
const ORA_VS = `varying vec3 vC; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ vC = color; vec4 wp = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); vY = wp.y; gl_Position = projectionMatrix * viewMatrix * wp; }`;
const ORA_FS = `uniform float uA; uniform float uT; uniform vec3 uRim; uniform vec3 uLightDir; varying vec3 vC; varying vec3 vN; varying vec3 vV; varying float vY;
${DITHER_GLSL}
void main(){
  vec3 n = normalize(vN); float l = 0.55 + 0.5 * max(dot(n, uLightDir), 0.0), fr = pow(1.0 - abs(dot(n, normalize(vV))), 2.0);
  float scan = 0.8 + 0.2 * sin(vY * 34.0 - uT * 7.0), a = uA * (0.55 + 0.45 * fr) * scan;
  if (a < bayer4(gl_FragCoord.xy) + 0.001) discard;
  gl_FragColor = vec4(vC * l * 1.05 + uRim * fr * 1.3, 1.0); }`;
Object.assign(SFX, {
  oraRafaga: () => { for (let i = 0; i < 16; i++){ noise({ dur: 0.06, vol: 0.2, f0: 700 + Math.random() * 500, type: 'lowpass', q: 0.7, when: i * 0.072, rv: 0.1 }); tone({ type: 'square', f0: 140, f1: 70, dur: 0.05, vol: 0.06, when: i * 0.072 }); }
    noise({ dur: 1.1, vol: 0.06, f0: 2400, q: 0.6, rv: 0.2 }); },
  oraFinal: () => { tone({ type: 'sine', f0: 130, f1: 35, dur: 0.6, vol: 0.6, rv: 0.4 }); noise({ dur: 0.35, vol: 0.4, f0: 1800, f1: 200, type: 'lowpass', q: 0.8, rv: 0.4 }); noise({ dur: 0.1, vol: 0.3, f0: 4000, type: 'highpass', rv: 0.2 }); },
  oraBloqueo: () => { tone({ type: 'triangle', f0: 1700, f1: 1500, dur: 0.35, vol: 0.12, rv: 0.6 }); tone({ type: 'square', f0: 240, f1: 120, dur: 0.12, vol: 0.12 }); noise({ dur: 0.12, vol: 0.24, f0: 3200, q: 1.5, rv: 0.3 }); },
  oraSale: () => { tone({ type: 'sine', f0: 200, f1: 600, dur: 0.5, vol: 0.08, rv: 0.6 }); noise({ dur: 0.5, vol: 0.1, f0: 600, f1: 2400, q: 1, rv: 0.5 }); },
  oraGo: () => { tone({ type: 'sawtooth', f0: 55, f1: 50, dur: 0.6, vol: 0.06, rv: 0.4 }); tone({ type: 'sawtooth', f0: 58, f1: 52, dur: 0.6, vol: 0.05 }); }
});
// piezas con color por vértice, fundidas en una malla por hueso (una llamada de dibujo cada una)
const _oraM4 = new THREE.Matrix4(), _oraQ = new THREE.Quaternion(), _oraE = new THREE.Euler(), _oraS = new V3(), _oraC = new THREE.Color();
function oraPieza(geo, col, x, y, z, rx, ry, rz, sx, sy, sz){
  const g = geo.index ? geo.toNonIndexed() : geo.clone(); _oraE.set(rx || 0, ry || 0, rz || 0); _oraM4.compose(new V3(x, y, z), _oraQ.setFromEuler(_oraE), _oraS.set(sx || 1, sy || 1, sz || 1)); g.applyMatrix4(_oraM4);
  const n = g.attributes.position.count, c = new Float32Array(n * 3); _oraC.setHex(col); for (let i = 0; i < n; i++){ c[i * 3] = _oraC.r; c[i * 3 + 1] = _oraC.g; c[i * 3 + 2] = _oraC.b; }
  g.setAttribute('color', new THREE.BufferAttribute(c, 3)); return g;
}
function oraFunde(piezas, mat, padre){
  const geo = new THREE.BufferGeometry(), tot = piezas.reduce((s, g) => s + g.attributes.position.count, 0);
  for (const at of ['position', 'normal', 'color']){ const arr = new Float32Array(tot * 3); let off = 0; for (const g of piezas){ arr.set(g.attributes[at].array, off); off += g.attributes[at].count * 3; } geo.setAttribute(at, new THREE.BufferAttribute(arr, 3)); }
  geo.computeBoundingSphere(); const m = new THREE.Mesh(geo, mat); m.renderOrder = 4; padre.add(m); return m;
}
function oraConstruye(){
  if (ORA.g) return ORA.g;
  const VI = 0x8a6ae8, VI2 = 0x9c80f4, AZ = 0x3a4ab8, OR = 0xffd23a, PE = 0x1c1c5a, RO = 0xd02848, OJ = 0xeaffff;
  ORA.mat = new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 }, uT: { value: 0 }, uRim: { value: new THREE.Color(0xd8b8ff) }, uLightDir: shared.uLightDir }, vertexShader: ORA_VS, fragmentShader: ORA_FS, vertexColors: true });
  const g = new THREE.Group(); g.visible = false; scene.add(g); const mat = ORA.mat, G = () => new THREE.Group();
  const cyl = (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s || 6), box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const R = ORA.R = { hips: G(), chest: G(), head: G(), arms: [], legs: [] };
  R.hips.position.y = 1.05; g.add(R.hips); R.chest.position.y = 0.14; R.hips.add(R.chest); R.head.position.y = 0.92; R.chest.add(R.head);
  oraFunde([oraPieza(box(0.44, 0.24, 0.28), AZ, 0, 0, 0), oraPieza(box(0.48, 0.08, 0.32), OR, 0, 0.1, 0), oraPieza(box(0.24, 0.32, 0.05), PE, 0, -0.24, 0.13)], mat, R.hips);
  oraFunde([oraPieza(box(0.34, 0.3, 0.24), VI, 0, 0.15, 0), oraPieza(cyl(0.48, 0.3, 0.46, 6), VI, 0, 0.52, 0, 0, Math.PI / 6, 0, 1, 1, 0.62),
    oraPieza(box(0.3, 0.2, 0.08), VI2, 0.15, 0.58, 0.15, 0, 0, 0.08), oraPieza(box(0.3, 0.2, 0.08), VI2, -0.15, 0.58, 0.15, 0, 0, -0.08),
    oraPieza(cyl(0.2, 0.25, 0.1, 8), RO, 0, 0.8, 0), oraPieza(box(0.13, 0.5, 0.04), RO, 0.12, 0.56, -0.2, 0.35, 0, 0.1), oraPieza(box(0.11, 0.42, 0.04), RO, 0.02, 0.58, -0.22, 0.45, 0, -0.15),
    oraPieza(cyl(0.09, 0.11, 0.16), VI, 0, 0.88, 0)], mat, R.chest);
  const pelo = [[0.1, 0.32, -0.12, -2.0, 0.3], [-0.1, 0.32, -0.12, -2.0, -0.3], [0, 0.36, -0.16, -2.3, 0], [0.14, 0.24, -0.16, -2.5, 0.5], [-0.14, 0.24, -0.16, -2.5, -0.5]].map(([x, y, z, rx, rz]) => oraPieza(new THREE.ConeGeometry(0.09, 0.62, 4), PE, x, y, z, rx, 0, rz));
  oraFunde([oraPieza(box(0.26, 0.3, 0.27), VI, 0, 0.14, 0), oraPieza(box(0.31, 0.12, 0.31), PE, 0, 0.31, -0.02), oraPieza(box(0.3, 0.045, 0.3), OR, 0, 0.25, 0.005), ...pelo,
    oraPieza(box(0.07, 0.03, 0.02), OJ, 0.065, 0.17, 0.14), oraPieza(box(0.07, 0.03, 0.02), OJ, -0.065, 0.17, 0.14), oraPieza(box(0.1, 0.02, 0.02), PE, 0, 0.06, 0.14)], mat, R.head);
  for (const s of [-1, 1]){ const sh = G(), el = G(); sh.position.set(0.5 * s, 0.74, 0); R.chest.add(sh); el.position.y = -0.44; sh.add(el);
    oraFunde([oraPieza(box(0.28, 0.14, 0.3), OR, 0.06 * s, 0.06, 0, 0, 0, 0.3 * s), oraPieza(cyl(0.12, 0.1, 0.42), VI, 0, -0.22, 0), oraPieza(new THREE.IcosahedronGeometry(0.1, 0), VI2, 0, -0.17, 0.05)], mat, sh);
    oraFunde([oraPieza(cyl(0.105, 0.085, 0.36), VI, 0, -0.18, 0), oraPieza(cyl(0.115, 0.115, 0.08), OR, 0, -0.3, 0), oraPieza(box(0.18, 0.17, 0.2), VI2, 0, -0.43, 0.02)], mat, el);
    R.arms.push({ sh, el, s }); }
  for (const s of [-1, 1]){ const hip = G(), knee = G(); hip.position.set(0.13 * s, -0.08, 0); R.hips.add(hip); knee.position.y = -0.48; hip.add(knee);
    oraFunde([oraPieza(cyl(0.14, 0.11, 0.48), AZ, 0, -0.24, 0)], mat, hip);
    oraFunde([oraPieza(box(0.14, 0.1, 0.08), OR, 0, 0, 0.09), oraPieza(cyl(0.11, 0.08, 0.46), AZ, 0, -0.23, 0), oraPieza(box(0.14, 0.08, 0.24), PE, 0, -0.48, 0.05)], mat, knee);
    R.legs.push({ hip, knee, s }); }
  // los puños fantasma de la ráfaga (cada uno con su material, para desvanecerse solo)
  const fg = oraFunde([oraPieza(box(0.22, 0.2, 0.24), VI2, 0, 0, 0), oraPieza(cyl(0.12, 0.1, 0.4), VI, 0, 0, -0.3, Math.PI / 2, 0, 0), oraPieza(cyl(0.13, 0.13, 0.08), OR, 0, 0, -0.14, Math.PI / 2, 0, 0)], mat, new THREE.Group()).geometry;
  ORA.fists = Array.from({ length: 12 }, () => { const m = new THREE.Mesh(fg, mat.clone()); m.material.uniforms.uLightDir = shared.uLightDir; m.visible = false; m.renderOrder = 4; m.frustumCulled = false; scene.add(m); m.userData = { t: 1, v: new V3() }; return m; });
  ORA.rot = hero.rotation.y; return ORA.g = g;
}
const oraV = new V3(), oraW = new V3();
// ¿el golpe iba a entrar? (si no, la guardia no se gasta)
const oraLlega = () => canAct() && player.inv <= 0 && !(state === 'roll' && rollT > 0.02 && rollT < 0.46) && !(state === 'attack' && curMove && curMove.special) && !(state === 'tech' && tech && tech.inv);
const oraPuedeVer = () => !player.dead && (gameState === 'play' || gameState === 'paused' || gameState === 'upgrade') && !cs.active && !lcut && !MG.active && !(chActive && chMode === 'invaders') && !SH3.montado;
function oraRemate(f){
  if (ORA.m || !ORA.g || !ORA.g.visible) return;
  const O = hero.position, P0 = new V3(O.x + Math.sin(f) * 1.5, 0, O.z + Math.cos(f) * 1.5);
  if (MP.on && !mpLibre(P0.x, P0.z, 0.4)) P0.set(O.x, 0, O.z);
  ORA.m = { t: 0, f, P: P0, hitT: 0.1, fin: false }; play('oraRafaga'); play('oraSale');
  foilRotulo('<b>¡ORA</b><b>ORA</b><b>ORA!</b>', 'oraRot', 1.6);
  barkOnce('ora', 'Ese grandullón morado pega más rápido de lo que yo hablo. Y yo hablo MUY rápido.');
}
function oraRafagaTick(dt){
  const m = ORA.m; if (!m) return; m.t += dt;
  const fx = Math.sin(m.f), fz = Math.cos(m.f), P = m.P;
  if (m.t < ORA_RUSH){
    if (m.t >= m.hitT){ m.hitT += 0.075; let pega = false;
      for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue; const n = enCono(P, e, m.f, 3.1, 0.85); if (!n) continue;
        if (hitEnemy(e, rdmg(2.8), rnd() < up.crit, n[0], n[1], 0.4, 0.3, false, { src: 'aoe' })) pega = true; }
      if (pega) play('hit'); }
    for (let i = 0; i < 2; i++){ const F = ORA.fists.find(q => q.userData.t >= 1); if (!F) break;
      const lat = (rnd() - 0.5) * 1.5, up_ = 1.3 + (rnd() - 0.5) * 0.9, fw = 0.5 + rnd() * 0.7;
      F.position.set(P.x + fx * fw + fz * lat, up_, P.z + fz * fw - fx * lat); F.rotation.set(0, m.f + (rnd() - 0.5) * 0.4, 0); F.userData.t = 0; F.userData.v.set(fx * 7, 0, fz * 7); F.visible = true;
      streak7(F.position.x - fx * 0.3, F.position.y, F.position.z - fz * 0.3, fx, 0, fz, 1.1, rnd() < 0.5 ? 0xd8b8ff : 0xfff0a0, 0.12, 0.05); } }
  else if (!m.fin){ m.fin = true;   // el último puñetazo: lanza
    const x = P.x + fx * 1.6, z = P.z + fz * 1.6; play('oraFinal'); shake = Math.max(shake, 0.5); hitStop = Math.max(hitStop, 0.1); flash('#e8d0ff', 0.3); lightFlash(x, 1.4, z, 0xb070ff, 2.6, 9);
    gring(x, 1.3, z, 0xffffff, 0.3, 2.8, 0.35, m.f); gring(x, 1.3, z, 0xc090ff, 0.3, 2, 0.45, m.f); burst7(PA7, x, 1.3, z, 26, [0xffffff, 0xd8b8ff, 0xffd23a], 8, 0.22, 0.4, 2, 2, 0, SH7.star);
    foilGrito('¡ORAAA!', '#e8c8ff'); const d = rdmg(22);
    for (const e of enemies){ const n = enCono(P, e, m.f, 3.6, 0.9); if (n) foilGolpea(e, d, n[0], n[1], 12, null, 1.4); } }
  if (m.t > ORA_RUSH + 0.35) ORA.m = null;
}
function oraFists(dt){
  if (!ORA.fists) return;
  for (const F of ORA.fists){ const u = F.userData; if (u.t >= 1){ F.visible = false; continue; } u.t += dt / 0.13; F.position.addScaledVector(u.v, dt); F.scale.setScalar(1 + u.t * 0.35); F.material.uniforms.uA.value = 0.95 * (1 - u.t); F.material.uniforms.uT.value = time; if (u.t >= 1) F.visible = false; }
}
function oraTick(dt, jugando){
  const g = oraConstruye(), ver = oraPuedeVer(); ORA.ver = Math.max(0, Math.min(1, ORA.ver + (ver ? 1 : -1) * Math.max(dt, 0.016) * 3));
  if (!ver && ORA.ver <= 0){ g.visible = false; if (ORA.m) ORA.m = null; ORA.bloq = null; }
  oraMarca(ver);
  if (!jugando || dt <= 0){ oraGoTick(0, false); return; }
  if (ORA.guarda > 0) ORA.guarda -= dt;
  if (ORA.bloq){ ORA.bloq.t += dt; if (ORA.bloq.t > 0.55) ORA.bloq = null; }
  if (ORA.golpe > 0) ORA.golpe -= dt;
  oraRafagaTick(dt); oraFists(dt);
  const quieto = inputMag < 0.12 && state === 'normal' && grounded && !ORA.m; ORA.quieto = quieto ? ORA.quieto + dt : 0;
  oraGoTick(dt, ORA.quieto > 1 && ver);
}
// pose y sitio del espíritu (después de la cámara): flota tras el hombro derecho de Tovan, con retraso
function oraPost(){
  const g = ORA.g; if (!g) return; g.visible = ORA.ver > 0.01; oraGoPinta(); if (!g.visible) return;
  const R = ORA.R, m = ORA.m, b = ORA.bloq, s = hero.scale.x, h = hero.rotation.y, dd = ORA.tUlt == null ? 0 : clamp(time - ORA.tUlt, 0, 0.1); ORA.tUlt = time;
  let tx, tz, ty, rot;
  if (m && m.t < ORA_RUSH + 0.2){ tx = m.P.x; tz = m.P.z; ty = 0.25; rot = m.f; }
  else if (b){ tx = hero.position.x + Math.sin(b.a) * 0.9 * s; tz = hero.position.z + Math.cos(b.a) * 0.9 * s; ty = 0.2; rot = b.a; }
  else { const ox = -0.95 * s, oz = -0.5 * s; tx = hero.position.x + Math.cos(h) * ox + Math.sin(h) * oz; tz = hero.position.z - Math.sin(h) * ox + Math.cos(h) * oz; ty = hero.position.y + 0.45 + Math.sin(time * 2.1) * 0.08; rot = h; }
  const kk = 1 - Math.exp(-dd * ((m && m.t < 0.15) || b ? 30 : 5.5));
  if (g.userData.nuevo === undefined || g.userData.nuevo){ g.position.set(tx, ty, tz); ORA.rot = rot; g.userData.nuevo = false; }
  g.position.x += (tx - g.position.x) * kk; g.position.z += (tz - g.position.z) * kk; g.position.y += (ty - g.position.y) * kk; ORA.rot = lerpAngle(ORA.rot, rot, kk);
  g.rotation.y = ORA.rot; g.scale.setScalar(s * (0.9 + 0.1 * ORA.ver)); ORA.mat.uniforms.uA.value = 0.97 * ORA.ver; ORA.mat.uniforms.uT.value = time;
  // pose: brazos cruzados en reposo; ráfaga alternando puños; guardia en cruz al parar un golpe
  const [aR, aL] = R.arms, t = time; R.chest.rotation.set(0, 0, 0); R.hips.rotation.set(0, 0, 0); R.head.rotation.set(-0.08, 0, 0);
  for (const L of R.legs){ L.hip.rotation.set(-0.25 + (L.s > 0 ? -0.2 : 0) + Math.sin(t * 2 + L.s) * 0.05, 0, 0.06 * L.s); L.knee.rotation.set(0.5 + (L.s > 0 ? 0.25 : 0), 0, 0); }
  const cruza = (A, w) => { A.sh.rotation.set(-0.55, 0, 0.32 * A.s); A.el.rotation.set(-1.65, 0, -1.15 * A.s); };
  if (m && m.t < ORA_RUSH){ const ph = (m.t * 16) % 1, alt = Math.floor(m.t * 16) % 2;
    [aR, aL].forEach((A, i) => { const fuera = (i === alt) ? Math.sin(ph * Math.PI) : 0; A.sh.rotation.set(lerp(-0.7, -1.57, fuera) + (rnd() - 0.5) * 0.15, (rnd() - 0.5) * 0.3, 0.12 * A.s - 0.25 * A.s * fuera); A.el.rotation.set(lerp(-1.9, 0, fuera), 0, 0); });
    R.chest.rotation.set(0.28, (alt ? 0.25 : -0.25), 0); R.head.rotation.set(-0.2, 0, 0); }
  else if (m){ const w = Math.max(0, 1 - (m.t - ORA_RUSH) / 0.35); aR.sh.rotation.set(-1.57 * w - 0.4 * (1 - w), 0, 0); aR.el.rotation.set(0, 0, 0); cruza(aL); R.chest.rotation.set(0.3 * w, -0.5 * w, 0); }
  else if (b){ for (const A of R.arms){ A.sh.rotation.set(-1.45, 0, -0.25 * A.s); A.el.rotation.set(-1.7, 0, -0.9 * A.s); } R.chest.rotation.set(-0.1, 0, 0); }
  else { cruza(aR); cruza(aL); R.chest.rotation.set(-0.06 + Math.sin(t * 2.1) * 0.03, 0, 0); }
}
// «ゴゴゴ»: letras amenazantes alrededor de Tovan cuando se queda quieto (en el DOM, proyectadas sobre el mundo)
function oraGoTick(dt, activo){
  if (!ORA.capa){ ORA.capa = document.createElement('div'); ORA.capa.id = 'oraCapa'; document.body.appendChild(ORA.capa); }
  if (activo){ ORA.goT -= dt; if (ORA.goT <= 0 && ORA.go.filter(q => q.t < q.dur).length < 6){ ORA.goT = 0.32;
      let q = ORA.go.find(o => o.t >= o.dur); if (!q){ q = { el: document.createElement('i') }; q.el.className = 'oraGo'; q.el.textContent = 'ゴ'; ORA.capa.appendChild(q.el); ORA.go.push(q); }
      const a = rnd() * TAU, r = 1.1 + rnd() * 0.9; Object.assign(q, { t: 0, dur: 1.6 + rnd() * 0.6, x: hero.position.x + Math.cos(a) * r, y: 0.7 + rnd() * 2.1, z: hero.position.z + Math.sin(a) * r, rot: (rnd() - 0.5) * 30, esc: 0.75 + rnd() * 0.6 });
      if (rnd() < 0.3) play('oraGo'); } }
  for (const q of ORA.go) if (q.t < q.dur) q.t += dt;
}
function oraGoPinta(){
  if (!ORA.capa) return; const ver = gameState === 'play' || gameState === 'paused';
  ORA.capa.hidden = !ver; if (!ver) return;
  for (const q of ORA.go){ if (q.t >= q.dur){ q.el.style.display = 'none'; continue; }
    oraV.set(q.x, q.y + q.t * 0.35, q.z).project(camera); if (oraV.z > 1){ q.el.style.display = 'none'; continue; }
    const k = q.t / q.dur, al = Math.min(1, q.t / 0.2) * (k > 0.7 ? (1 - k) / 0.3 : 1);
    q.el.style.display = ''; q.el.style.opacity = al.toFixed(3);
    q.el.style.transform = `translate(${((oraV.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px,${((-oraV.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px) translate(-50%,-50%) rotate(${q.rot.toFixed(1)}deg) scale(${(q.esc * (1 + 0.08 * Math.sin(time * 12 + q.rot))).toFixed(3)})`; }
}
function oraMarca(ver){
  const el = foilMarcador('ora', 'oraMarca'); el.hidden = !ver;
  const k = ORA.guarda > 0 ? 1 - ORA.guarda / ORA_GUARDA : 1, html = `<b>Guardia</b><u style="--k:${k.toFixed(2)}"></u>`;
  if (el.innerHTML !== html) el.innerHTML = html; el.classList.toggle('oraLista', k >= 1);
}
function oraLimpia(){
  ORA.m = null; ORA.bloq = null; ORA.quieto = 0; if (ORA.g){ ORA.g.visible = false; ORA.g.userData.nuevo = true; ORA.ver = 0; } if (ORA.fists) for (const F of ORA.fists){ F.visible = false; F.userData.t = 1; }
  for (const q of ORA.go){ q.t = q.dur || 1; q.el.style.display = 'none'; }
}
foilPoder({ id: 'foilOra', ic: '🗿', name: 'Espíritu de pelea', tags: ['otaku', 'impacto'],
  desc: 'Un espíritu guardián (sacado de una de aventuras bizarras) flota tras tu hombro. Al rematar el combo se adelanta y suelta una ráfaga de puñetazos (¡ORA ORA ORA!) con uno final que lanza. Cada 10 s para un golpe que iba a darte. Si te quedas quieto, el ambiente se pone… amenazante.',
  golpe(f){ ORA.golpe = 0.15; },
  remate(f){ oraRemate(f); }, tick(dt, jugando){ oraTick(dt, jugando); }, post(){ oraPost(); },
  herido(dmg, sx, sz){ if (ORA.guarda > 0 || !ORA.g || !ORA.g.visible || ORA.ver < 0.9 || !oraLlega()) return null;
    ORA.guarda = ORA_GUARDA; ORA.bloq = { t: 0, a: Math.atan2(sx - hero.position.x, sz - hero.position.z) }; player.inv = Math.max(player.inv, 0.35);
    const x = hero.position.x + Math.sin(ORA.bloq.a) * 0.9, z = hero.position.z + Math.cos(ORA.bloq.a) * 0.9; play('oraBloqueo'); flash('#e0c8ff', 0.25); lightFlash(x, 1.4, z, 0xb070ff, 2.2, 7);
    gring(x, 1.3, z, 0xe8d0ff, 0.3, 1.8, 0.3, ORA.bloq.a); sparks(x, 1.3, z, 12, 0xffffff, 5); foilGrito('¡Bloqueado!', '#e8c8ff');
    barkOnce('oraBloq', '¡Te ha cubierto! Cada diez segundos, más o menos. No te acostumbres.'); return 'none'; },
  limpia(){ oraLimpia(); }, reset(){ ORA.guarda = 0; oraLimpia(); },
  coge(){ oraConstruye(); play('oraSale'); barkOnce('oraCoge', 'Hay un tipo enorme y morado flotando detrás de ti. No me mires así: yo también lo veo.'); } });

/* ---------- 5. Golpe serio (de uno que es calvo por hobby) · prefijo opm ---------- */
const OPM = { n: 0, ult: -1, m: null, cara: null, cono: null, cielo: null };
const OPM_MAX = 12, OPM_T = { puno: 0.5, boom: 1.35, suelta: 2.3, fin: 3.0 };
const OPM_CONO_FS = `uniform float uA; uniform float uT; varying vec2 vU;
void main(){ float v = 1.0 - vU.y, raya = step(0.55, fract(vU.x * 28.0 + sin(vU.x * 61.0) * 0.3)), flujo = fract(v * 5.0 - uT * 4.0);
  float a = uA * (0.25 + 0.75 * raya * smoothstep(0.0, 0.6, flujo)) * smoothstep(0.0, 0.06, v) * (1.0 - smoothstep(0.75, 1.0, v));
  gl_FragColor = vec4(vec3(0.85, 0.93, 1.0) * a, 1.0); }`;
const OPM_CIELO_FS = `uniform float uA; varying vec2 vU;
void main(){ float x = abs(vU.x - 0.5) * 2.0, y = vU.y, core = 1.0 - smoothstep(0.0, 0.18, x);
  float a = uA * (1.0 - smoothstep(0.0, 1.0, x)) * smoothstep(0.0, 0.12, y) * (1.0 - smoothstep(0.7, 1.0, y));
  gl_FragColor = vec4(mix(vec3(0.6, 0.8, 1.0), vec3(1.0), core) * a * (0.55 + 0.45 * core), 1.0); }`;
Object.assign(SFX, {
  opmPff: () => tone({ type: 'sine', f0: 320, f1: 300, dur: 0.12, vol: 0.05 }),
  opmTap: () => { tone({ type: 'square', f0: 180, f1: 120, dur: 0.06, vol: 0.12 }); noise({ dur: 0.05, vol: 0.12, f0: 900, type: 'lowpass' }); },
  opmBoom: () => { tone({ type: 'sine', f0: 75, f1: 18, dur: 1.8, vol: 0.95, rv: 0.85 }); noise({ dur: 1.6, vol: 0.5, f0: 1200, f1: 60, type: 'lowpass', q: 0.6, rv: 0.85 });
    noise({ dur: 0.25, vol: 0.45, f0: 5000, f1: 1500, type: 'highpass', rv: 0.6 }); tone({ type: 'sawtooth', f0: 110, f1: 30, dur: 0.9, vol: 0.18, rv: 0.6 }); },
  opmListo: () => seq_([[60, 0.12], [60, 0.3]], 'square', 0.14, 0.06, 0.2)
});
// la cara de garabato: la de Tovan con ojos de punto, cejas de raya y boca recta (se pinta la primera vez, con las texturas ya listas)
function opmCara(){
  if (OPM.cara) return OPM.cara;
  const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext && c.getContext('2d');
  if (g && g.fillRect){ g.imageSmoothingEnabled = false; try { if (faceTex.image) g.drawImage(faceTex.image, 0, 0, 32, 32); } catch (err) {}
    g.fillStyle = 'rgb(232,184,148)'; g.fillRect(4, 11, 24, 17);
    g.fillStyle = '#2a1a14'; g.fillRect(8, 13, 4, 1); g.fillRect(20, 13, 4, 1); g.fillRect(10, 15, 2, 2); g.fillRect(20, 15, 2, 2);
    g.fillStyle = '#8a5040'; g.fillRect(14, 25, 4, 1); }
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.wrapS = t.wrapT = THREE.RepeatWrapping; return OPM.cara = t;
}
function opmConstruye(){
  if (OPM.cono) return;
  const cg = new THREE.ConeGeometry(1, 1, 24, 1, true); cg.rotateX(-Math.PI / 2); cg.translate(0, 0, 0.5);
  OPM.cono = new THREE.Mesh(cg, new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 }, uT: { value: 0 } }, vertexShader: GTSU_VS, fragmentShader: OPM_CONO_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  const pg = new THREE.PlaneGeometry(1, 1); pg.rotateX(-Math.PI / 2); pg.translate(0, 0, 0.5);
  OPM.cielo = new THREE.Mesh(pg, new THREE.ShaderMaterial({ uniforms: { uA: { value: 0 } }, vertexShader: GTSU_VS, fragmentShader: OPM_CIELO_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  for (const m of [OPM.cono, OPM.cielo]){ m.frustumCulled = false; m.visible = false; m.renderOrder = 7; scene.add(m); }
}
function opmMarca(){
  const el = foilMarcador('opm', 'opmMarca'), listo = OPM.n >= OPM_MAX, html = listo ? '<i>✊</i><b>EN SERIO</b>' : `<i>✊</i><b>${OPM.n}</b><small>/${OPM_MAX}</small>`;
  if (el.dataset.h !== html){ el.dataset.h = html; el.innerHTML = html; } el.classList.toggle('opmListo', listo);
}
const opmBloquea = () => !!(OPM.m && OPM.m.t < OPM_T.suelta);
function opmSerio(f){
  if (!foilPuede()) return;
  opmConstruye(); OPM.m = { t: 0, f, O: hero.position.clone(), ev: {} }; OPM.n = 0; opmMarca(); staffToBack();
  slowT = Math.max(slowT, 1.4); play('opmPff'); foilRotulo('Golpe serio.', 'opmRot1', 1.3);
}
function opmBoom(m){
  const O = m.O, f = m.f, fx = Math.sin(f), fz = Math.cos(f);
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue; const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, al = dx * fx + dz * fz, pe = Math.abs(dx * fz - dz * fx);
    if (al < -0.5 || al > 30 + e.r || pe > Math.max(1.8, al * 0.22) + e.r) continue;
    if (foilJefe(e)) hitEnemy(e, Math.max(1, Math.round(e.maxHp * 0.12)), true, fx, fz, 4, 0, false, { src: 'aoe' });   // a los jefes, un 12 % de su vida: daño fuerte y punto
    else { hitEnemy(e, Math.max(1, Math.ceil(e.hp)), true, fx, fz, 24, 0, false, { src: 'aoe' }); if (e.alive){ e.hp = 0; killEnemy(e); } } }   // a los demás, de un golpe
  play('opmBoom'); foilRotulo('<b>¡¡¡BRAOOOM!!!</b>', 'opmRot2', 1.9);
  shake = Math.max(shake, 1.4); hitStop = Math.max(hitStop, 0.2); flash('#ffffff', 0.85); lightFlash(O.x + fx * 6, 3, O.z + fz * 6, 0xffffff, 5, 30);
  for (let i = 0; i < 5; i++){ const d = 3 + i * 5.8; later(i * 0.04, () => gring(O.x + fx * d, 1.1, O.z + fz * d, i % 2 ? 0xdff0ff : 0xffffff, 0.5, 2 + d * 0.24, 0.5, f)); }
  for (let i = 0; i < 4; i++){ const d = 3 + i * 6; crack7(O.x + fx * d, O.z + fz * d, 4, 2.4 + i * 0.4, false); }
  for (let i = 0; i < 6; i++){ const d = 2 + i * 5; puffAt(O.x + fx * d, O.z + fz * d, 5, 4 + i * 0.6, 0xd8d0c4); }
  ringFx(O.x, O.z, 0xffffff, 0.4, 4, 0.4); burst7(PA7, O.x + fx * 1.2, 1.3, O.z + fz * 1.2, 30, [0xffffff, 0xdff0ff], 12, 0.25, 0.5, 0, 2, 0, SH7.star);
  for (const d of [35, 55]) gring(O.x + fx * d, 12, O.z + fz * d, 0xffffff, 3, 16, 1.2, f, 0.8);   // el agujero en las nubes
  const C = OPM.cono, S = OPM.cielo; C.visible = S.visible = true; C.position.set(O.x, 1.0, O.z); C.rotation.set(0, f, 0); S.position.set(O.x + fx * 12, 12, O.z + fz * 12); S.rotation.set(0, f, 0); S.scale.set(9, 1, 80);
  later(0.9, () => { if (!barkSaid.opm){ barkOnce('opm', '…¿Ya? ¿Así, sin más?'); } else if (rnd() < 0.5) bark(['…¿Ya? ¿Así, sin más?', 'Otra vez. Y ni se ha despeinado.', 'Vale. Ahora recoge todo eso.'][Math.floor(rnd() * 3)]); });
}
function opmTick(dt, jugando){
  const el = document.getElementById('foilM-opm'); if (!el) opmMarca(); else el.hidden = !(gameState === 'play' || gameState === 'paused' || gameState === 'upgrade');
  const m = OPM.m; if (!m) return;
  if (player.dead || !(gameState === 'play' || gameState === 'paused' || gameState === 'upgrade')){ opmFin(); return; }
  if (!jugando || dt <= 0) return;
  m.t += dt; const t = m.t, ev = m.ev, fx = Math.sin(m.f), fz = Math.cos(m.f);
  if (t < OPM_T.suelta){ hero.position.x = m.O.x; hero.position.z = m.O.z; heading = m.f; hero.rotation.y = m.f; player.kx = player.kz = 0; if (staffInHand && state !== 'attack') staffToBack(); }
  if (t < OPM_T.boom) slowT = Math.max(slowT, 0.2);
  if (t >= OPM_T.puno && !ev.puno){ ev.puno = true; play('opmTap'); shake = Math.max(shake, 0.05);
    P.armL.hand.getWorldPosition(g3V); gring(g3V.x, g3V.y, g3V.z, 0xffffff, 0.1, 0.5, 0.2, m.f); for (let i = 0; i < 3; i++) streak7(g3V.x, g3V.y + (rnd() - 0.5) * 0.3, g3V.z, fx, 0, fz, 0.8, 0xffffff, 0.15, 0.03); }
  if (t >= OPM_T.boom && !ev.boom){ ev.boom = true; opmBoom(m); }
  if (ev.boom){ const k = (t - OPM_T.boom), C = OPM.cono, S = OPM.cielo;
    if (C.visible){ const L = 30 * Math.min(1, k / 0.22); C.scale.set(Math.max(0.01, L * 0.22), Math.max(0.01, L * 0.22 * 0.55), Math.max(0.01, L)); C.material.uniforms.uT.value = time; C.material.uniforms.uA.value = Math.max(0, 1 - Math.max(0, k - 0.25) / 0.75); if (k > 1.05) C.visible = false; }
    if (S.visible){ S.material.uniforms.uA.value = Math.min(1, k / 0.1) * Math.max(0, 1 - Math.max(0, k - 0.4) / 1.1); if (k > 1.55) S.visible = false; }
    if (k < 0.8 && rnd() < 0.8){ const d = rnd() * 28; pn(m.O.x + fx * d + (rnd() - 0.5) * d * 0.3, 0.3, m.O.z + fz * d + (rnd() - 0.5) * d * 0.3, fx * 4, 1.5 + rnd() * 2, fz * 4, 0xd8d0c4, 0.5, 0.9, -0.3, 1, 2.2, SH7.dot, 0.5); } }
  if (t >= OPM_T.fin) opmFin();
}
function opmFin(){ OPM.m = null; if (OPM.cono){ OPM.cono.visible = false; OPM.cielo.visible = false; } M.face.uniforms.uMap.value = faceTex; }
function opmPose(){
  const m = OPM.m; if (!m) return; const t = m.t, A = P.armL;
  if (t < OPM_T.puno - 0.05){ const w = Math.min(1, t / 0.15);   // se prepara sin ganas
    bl(P.spine.rotation, 'y', -0.45, w); bl(A.sh.rotation, 'x', 0.7, w); bl(A.el.rotation, 'x', -1.6, w); bl(P.neck.rotation, 'y', 0.35, w);
    bl(P.legL.hip.rotation, 'x', 0.35, w); bl(P.legR.hip.rotation, 'x', -0.5, w); bl(P.legR.knee.rotation, 'x', 0.45, w); }
  else if (t < OPM_T.fin){ const w = t < OPM_T.suelta ? Math.min(1, (t - OPM_T.puno + 0.05) / 0.05) : Math.max(0, 1 - (t - OPM_T.suelta) / 0.5);   // el puñetazo, y se queda así
    bl(P.spine.rotation, 'y', 0.5, w); bl(A.sh.rotation, 'x', -1.57, w); bl(A.sh.rotation, 'z', 0.05, w); bl(A.el.rotation, 'x', 0, w); bl(P.neck.rotation, 'y', -0.45, w);
    bl(P.armR.sh.rotation, 'x', 0.5, w); bl(P.legL.hip.rotation, 'x', 0.5, w); bl(P.legR.hip.rotation, 'x', -0.7, w); bl(P.legR.knee.rotation, 'x', 0.55, w); bl(P.legL.knee.rotation, 'x', 0.15, w); }
}
const opmMira = new V3();
function opmPost(){
  const m = OPM.m; if (!m) return; const t = m.t;
  if (t < OPM_T.fin - 0.4) M.face.uniforms.uMap.value = opmCara();
  if (cs.active || lcut || !foilEscenario()) return;
  // la cámara: se acerca sin ganas hasta el puñetazo, sale despedida con el estruendo y mira al horizonte, donde se abren las nubes
  let k = 0, mira = 0;
  if (t < OPM_T.boom) k = 0.3 * smooth(Math.min(1, t / 0.7));
  else { const q = t - OPM_T.boom; k = q < 0.12 ? lerp(0.3, -0.3, q / 0.12) : -0.3 * Math.max(0, 1 - (q - 0.12) / 1.0); mira = q < 0.25 ? q / 0.25 : Math.max(0, 1 - (q - 0.25) / 0.9); }
  camera.position.lerp(camTarget, k);
  if (mira > 0){ opmMira.set(m.O.x + Math.sin(m.f) * 20, 5, m.O.z + Math.cos(m.f) * 20).lerp(camTarget, 1 - 0.55 * smooth(mira)); camera.lookAt(opmMira); }
}
foilPoder({ id: 'foilSaitama', ic: '👊', name: 'Golpe serio', tags: ['otaku', 'impacto'],
  desc: 'Entrenas por hobby (cien flexiones al día, como uno de una serie). Cada golpe que acierta suma 1; con 12, el siguiente remate es un golpe serio: una pausa incómoda y una onda de choque de 30 m que acaba de un golpe con todo lo que no sea jefe (a los jefes les quita un 12 % de su vida).',
  dano(e, val, o, crit, melee){ if (!e.alive || e.spawnT > 0 || OPM.m) return val;
    if (((o && o.src) || (melee ? 'melee' : '')) === 'melee' && time - OPM.ult > 0.12 && OPM.n < OPM_MAX){ OPM.ult = time; OPM.n++; opmMarca();
      if (OPM.n === OPM_MAX){ play('opmListo'); foilGrito('…Vale. En serio.', '#fff2b0'); barkOnce('opmListo', 'Tiene la misma cara que cuando espera el autobús. Eso es malo. Para los demás.'); } }
    return val; },
  remate(f){ if (OPM.n >= OPM_MAX && !OPM.m) opmSerio(f); },
  tick(dt, jugando){ opmTick(dt, jugando); }, pose(){ opmPose(); }, post(){ opmPost(); },
  herido(){ return opmBloquea() ? 'none' : null; }, rodar(){ return opmBloquea(); }, saltar(){ return opmBloquea(); },
  limpia(){ opmFin(); }, reset(){ OPM.n = 0; opmFin(); }, coge(){ opmMarca(); } });
const opmAtaqueOrig = doAttack, opmEspecialOrig = doSpecial;
doAttack = function(...a){ if (opmBloquea()) return; return opmAtaqueOrig(...a); };
doSpecial = function(...a){ if (opmBloquea()) return; return opmEspecialOrig(...a); };

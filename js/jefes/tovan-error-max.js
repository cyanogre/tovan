'use strict';
/* ======================================================================
   TOVAN.EXE · FUERA DE MEMORIA (la tercera forma)
   Al romper sus tres puntos débiles, TOVAN.EXE no se deja cerrar: «está
   usando el 100 % de la memoria» y crece hasta unos 150 m. La pelea sigue
   sobre su hombro derecho, entre nubarrones de tormenta: por debajo de los
   hombros solo hay nubes. Hay que cerrar tres procesos clavados en el
   hombro mientras su mano barre o aplasta, sus ojos disparan láseres y la
   tormenta suelta rayos; luego baja la cara para mirarte de cerca y hay
   que reventarle el ojo.
   El hombro se queda fijo en el origen (tmxFija coloca al gigante entero
   alrededor de él), así que Tovan pisa siempre y = 0.
   ====================================================================== */
const TMX_ESC = 60, TMX_ARENA = 6.4, TMX_PROC = [[-3.4, -3.4], [-3.4, 3.4], [2.9, 0]];
const TMX_CARA = { nx: 1.031, ny: -0.724, nz: 0.719, az: 1.431, ax: 0.442 };   // cara bajada hasta el hombro (hombro alzado y cabeza ladeada: el ojo queda a ~4 m); salió de una búsqueda numérica
const TMX = { on: false, fase: null, montado: false, hecho: false, set: null, r: mulberry32(405), procesos: [], ojo: null, atq: null, cd: 0, ultimo: null, primero: null,
  mano: null, tubo: null, ventanas: [], rotos: 0, cara: 0, dolor: 0, miraP: null, mx: 0, my: 0, rayoT: 1, rayos: [], mares: [], nubesG: null, padL: new V3(-0.03, 0.135, 0),
  camOk: false, camP: new V3(), camL: new V3(), ojoSpr: null, ojoAro: null, agachaT: 0, caraObj: 0 };
BOSS_CARDS.tovanmax = ['TOVAN.EXE', 'Fuera de memoria · Ya no cabe en el mapa', '#ff2ae0'];
const tmxV = [new V3(), new V3(), new V3(), new V3(), new V3(), new V3()], tmxQ = [new THREE.Quaternion(), new THREE.Quaternion()];
const TMX_VENTANA = ['<div class="tvT"><span>TOVAN.EXE</span><i>✕</i></div><div class="tvB"><b>⚠</b><p><strong>TOVAN.EXE ha dejado de funcionar.</strong>El sistema está buscando una solución al problema…</p></div><div class="tvBtns"><span>Esperar</span><span class="si">Cerrar el programa</span></div>',
  '<div class="tvT"><span>Memoria insuficiente</span><i>✕</i></div><div class="tvB"><b>⛔</b><p><strong>No se puede cerrar TOVAN.EXE.</strong>Está usando el 100 % de la memoria… y sigue creciendo.</p></div><div class="tvBtns"><span class="si">Aceptar</span></div>'];
const LASER = [0xffffff, 0xff2a8a, 0xffe0f4, 0];

/* ---------- Construcción: nubarrones, la mano gigante, ventanas y procesos ---------- */
function tmxLienzo(w, h, pinta){ const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext && c.getContext('2d'); if (g && g.fillRect) pinta(g); return c; }
function tmxConstruye(){
  if (TMX.set) return;
  const r = TMX.r, set = new THREE.Group(); set.visible = false; scene.add(set); TMX.set = set;
  const fondo = mesh(new THREE.CircleGeometry(900, 24), terPropio(makeMat(0x15111d)), 0, -70, 0, set); fondo.rotation.x = -Math.PI / 2;
  // mares de nubes (el alfa decide dónde hay nube; el shader recorta)
  const cv = tmxLienzo(128, 128, g => { if (!g.createRadialGradient) return;
    for (let k = 0; k < 80; k++){ const x = r() * 128, y = r() * 128, rad = 10 + r() * 24;
      for (const ox of [-128, 0, 128]) for (const oy of [-128, 0, 128]){ const gr = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, rad); gr.addColorStop(0, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x + ox - rad, y + oy - rad, rad * 2, rad * 2); } }
    const im = g.getImageData(0, 0, 128, 128); for (let k = 3; k < im.data.length; k += 4){ const a = im.data[k] / 255; im.data[k] = Math.round(255 * smooth(clamp((a - 0.25) / 0.3, 0, 1))); } g.putImageData(im, 0, 0); });
  TMX.mares = [[-11, 0x463c58, 9], [-25, 0x2a2438, 6]].map(([y, col, rep]) => { const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    const m = mesh(scaleUV(new THREE.PlaneGeometry(1400, 1400, 16, 16), rep, rep), terPropio(makeMat(col, { map: tx })), 0, y, 0, set); m.rotation.x = -Math.PI / 2; m.userData = { tile: 1400 / rep, v: y > -20 ? 1.6 : 0.9 }; return m; });
  // cúmulos: alrededor, abrazando al gigante donde entra en las nubes y un techo de tormenta
  const nm = [terPropio(makeMat(0x4a4258)), terPropio(makeMat(0x363044)), terPropio(makeMat(0x221c2c))], ng = new THREE.IcosahedronGeometry(1, 1);
  TMX.nubesG = new THREE.Group(); set.add(TMX.nubesG);
  const cumulo = (x, y, z, s, mat) => { const c = new THREE.Group(), q = new THREE.Group(), n = 3 + (r() * 4 | 0);
    for (let j = 0; j < n; j++){ const m = mesh(ng, mat, (j - n / 2) * s * 0.7 + (r() - 0.5) * s * 0.4, (r() - 0.3) * s * 0.4, (r() - 0.5) * s * 0.8, q); m.scale.set(s * (0.7 + r() * 0.6), s * (0.45 + r() * 0.3), s * (0.7 + r() * 0.5)); }
    mpFusiona(q, c); c.position.set(x, y, z); c.rotation.y = r() * TAU; TMX.nubesG.add(c); };
  for (let k = 0; k < 34; k++){ const a = r() * TAU, d = 22 + r() * 240; cumulo(Math.cos(a) * d, -10 + (r() - 0.5) * 6, Math.sin(a) * d, 6 + r() * 14, nm[k % 2]); }
  for (const [x, z] of [[0, 0], [10, 6], [22, 2], [34, -4], [46, 4], [23, -12], [23, 14], [-6, 9], [-6, -9]]) cumulo(x, -10 - r() * 3, z, 9 + r() * 6, nm[0]);
  for (let k = 0; k < 16; k++){ const a = r() * TAU, d = 50 + r() * 220; cumulo(Math.cos(a) * d, 95 + r() * 50, Math.sin(a) * d, 22 + r() * 30, nm[2]); }
  // la mano (la otra, la izquierda del gigante): palma, cuatro dedos y pulgar; los dedos miran a −z
  const gm = terPropio(makeMat(0xf6eef6, { emissive: 0.4 })), cm = TER.matDe(M.coat), mano = new THREE.Group(); scene.add(mano); mano.visible = false;   // guante claro y sin damero: que se lea la mano
  mesh(B(1, 0.32, 1.05), gm, 0, 0, 0, mano);
  for (let i = 0; i < 4; i++) mesh(B(0.2, 0.24, 0.72), gm, -0.36 + i * 0.24, -0.02, -0.86, mano);
  const pul = mesh(B(0.22, 0.24, 0.55), gm, 0.62, 0, -0.18, mano); pul.rotation.y = -0.6;
  mano.scale.setScalar(9); TMX.mano = mano;
  const tg = new THREE.CylinderGeometry(1, 1, 1, 10); tg.translate(0, 0.5, 0); TMX.tubo = mesh(tg, cm, 0, 0, 0); TMX.tubo.visible = false;
  // ventanas de error que caen del cielo
  const vtx = new THREE.CanvasTexture(tmxLienzo(192, 128, g => {
    g.fillStyle = '#e8e4ee'; g.fillRect(0, 0, 192, 128); g.fillStyle = '#c8307a'; g.fillRect(0, 0, 192, 24); g.fillStyle = '#ffffff'; g.font = 'bold 15px sans-serif'; g.fillText('⚠ Error', 8, 17);
    g.fillStyle = '#e8455a'; g.fillRect(166, 4, 20, 16); g.fillStyle = '#1a1424'; g.font = '14px sans-serif'; g.fillText('TOVAN.EXE no', 16, 56); g.fillText('responde.', 16, 76);
    g.strokeStyle = '#6a5a80'; g.lineWidth = 2; g.strokeRect(112, 92, 68, 24); g.fillText('Aceptar', 120, 109); g.strokeStyle = '#2a2236'; g.lineWidth = 4; g.strokeRect(2, 2, 188, 124); }));
  const vm = terPropio(makeMat(0xffffff, { map: vtx, emissive: 0.55, side: THREE.DoubleSide }));
  TMX.ventanas = Array.from({ length: 6 }, () => { const m = mesh(new THREE.PlaneGeometry(3.6, 2.4), vm, 0, -50, 0); m.visible = false; return m; });
  // rótulos de los procesos
  TMX.etiq = ['memoria.exe', 'copia.exe', 'rabia.exe'].map(n => { const t = new THREE.CanvasTexture(tmxLienzo(256, 64, g => {
    g.fillStyle = 'rgba(14,4,24,0.88)'; g.fillRect(0, 0, 256, 64); g.strokeStyle = '#ff2ae0'; g.lineWidth = 4; g.strokeRect(2, 2, 252, 60);
    g.fillStyle = '#ffffff'; g.font = 'bold 26px monospace'; g.fillText('⚙ ' + n, 14, 30); g.fillStyle = '#ff3a5a'; g.fillRect(14, 42, 228, 10); g.fillStyle = '#ffd0e0'; g.font = '11px monospace'; g.fillText('CPU 100 %', 182, 38); }));
    t.minFilter = THREE.LinearFilter; return new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }); });
  // el ojo: sello sobre el ojo de verdad y un aro en el suelo donde se le golpea
  TMX.ojoSpr = new THREE.Sprite(terSelloMat.clone()); TMX.ojoSpr.visible = false; scene.add(TMX.ojoSpr);
  TMX.ojoAro = mesh(new THREE.RingGeometry(1.35, 1.7, 32), terPropio(makeMat(0xff2ae0, { emissive: 1, opacity: 0.7 })), 0, 0.06, 0); TMX.ojoAro.rotation.x = -Math.PI / 2; TMX.ojoAro.visible = false;
}

/* ---------- Escenario: nubarrones de tormenta ---------- */
function tmxMonta(){
  if (TMX.montado) return; tmxConstruye(); TMX.montado = true;
  try { limpiaEfectos(); } catch (err) { console.error(err); }
  TER.set.visible = false; TER.sombra.visible = false; TMX.set.visible = true; TER.R.armR.sh.visible = false; TER.R.neck.rotation.order = 'YXZ';
  const U = skyMat.uniforms; U.uTop.value.setHex(0x07050c); U.uMid.value.setHex(0x221c30); U.uHor.value.setHex(0x463a58); U.uStars.value = 0;
  shared.uFogCol.value.setHex(0x2c2638); shared.uFogNear.value = 70; shared.uFogFar.value = 340;
  shared.uLightCol.value.setHex(0xb8b0e0).multiplyScalar(0.85); shared.uAmb.value.setHex(0x4a4266);
  ARENA = TMX_ARENA; colVientoEl.hidden = false; colVientoSon(true); document.body.classList.add('tmxOn');
  for (const b of TER.bits) b.visible = false;   // (a esta escala serían cubos de 4 m cruzando el hombro)
  camera.zoom = 0.68; camera.updateProjectionMatrix();   // plano abierto: Tovan y la cara del gigante a la vez
}
function tmxManoFuera(){ if (TMX.mano){ TMX.mano.visible = false; TMX.tubo.visible = false; } for (const v of TMX.ventanas) v.visible = false; }
function tmxDesmonta(){
  if (!TMX.montado) return; TMX.montado = false;
  TMX.set.visible = false; TER.R.armR.sh.visible = true; TER.R.neck.rotation.order = 'XYZ'; TER.g.quaternion.identity(); TER.g.position.set(0, 0, 0);
  colVientoEl.hidden = true; colVientoSon(false); document.body.classList.remove('tmxOn'); tmxManoFuera(); TMX.ojoSpr.visible = false; TMX.ojoAro.visible = false;
  for (const b of TER.bits) b.visible = true; camera.zoom = 1; camera.updateProjectionMatrix();
}
// Fija el hombro derecho del gigante en el origen y plano: gira y mueve al gigante entero alrededor de él
function tmxFija(){
  const g = TER.g, R = TER.R;
  g.position.set(0, 0, 0); g.quaternion.identity(); g.scale.setScalar(TER.esc); g.updateMatrixWorld(true);
  const p = R.armL.sh.localToWorld(tmxV[0].copy(TMX.padL)), q = R.armL.sh.getWorldQuaternion(tmxQ[0]);
  g.quaternion.copy(q).invert(); p.applyQuaternion(g.quaternion); g.position.set(-p.x, -p.y, -p.z); g.updateMatrixWorld(true);
}

/* ---------- Animación ---------- */
function tmxPoseCara(R, k){ const C = TMX_CARA; terBl(R.neck.rotation, 'x', C.nx, k); terBl(R.neck.rotation, 'y', C.ny, k); terBl(R.neck.rotation, 'z', C.nz, k); terBl(R.armL.sh.rotation, 'z', C.az, k); terBl(R.armL.sh.rotation, 'x', C.ax, k); }
function tmxAnima(et){
  const R = TER.R, t = TER.tt, br = Math.sin(t * 0.9);
  R.body.position.set(0, 0.62, 0); R.body.rotation.set(0, 0, 0); R.body.scale.setScalar(1); R.hips.position.y = 0.67; R.hips.rotation.set(0, 0, 0);
  R.spine.rotation.set(0.03 + br * 0.015, 0, Math.sin(t * 0.43) * 0.02);
  for (const L of [R.legL, R.legR]){ L.hip.rotation.set(0, 0, 0); L.knee.rotation.set(0.05, 0, 0); }
  R.armL.sh.rotation.set(0, 0, 0); R.armL.el.rotation.set(-0.15, 0, 0); R.armR.sh.rotation.set(0, 0, 0.2); R.armR.el.rotation.set(-0.3, 0, 0);
  // la cabeza busca a Tovan (o el punto al que dispara el láser)
  const obj = TMX.miraP || tmxV[1].set(hero.position.x, hero.position.y + 1, hero.position.z), N = R.neck.getWorldPosition(tmxV[2]);
  const d = tmxV[3].subVectors(obj, N).applyQuaternion(tmxQ[1].copy(TER.g.quaternion).invert());
  const yaw = clamp(Math.atan2(d.x, d.z), -1.45, 1.45), pitch = clamp(Math.atan2(-d.y, Math.hypot(d.x, d.z)), -0.3, 0.85), kl = 1 - Math.exp(-et * 2.2);
  TMX.my += (yaw - TMX.my) * kl; TMX.mx += (pitch - TMX.mx) * kl;
  R.neck.rotation.set(TMX.mx, TMX.my, Math.sin(t * 0.6) * 0.04);
  TMX.cara += clamp(TMX.caraObj - TMX.cara, -et * 0.45, et * 0.45);   // 0,7 = la cara a medio bajar (se le ven los ojos encima de Tovan); 1 = pegada al hombro
  if (TMX.cara > 0) tmxPoseCara(R, smooth(Math.min(1, TMX.cara)));
  if (TMX.dolor > 0){ const k = Math.min(1, TMX.dolor); R.neck.rotation.z += Math.sin(t * 19) * 0.12 * k; R.neck.rotation.x -= 0.2 * k; }
  R.pelo.forEach((p, i) => { p.rotation.set(0.5 + Math.sin(t * 3.4 - i) * 0.15, 0, Math.sin(t * 2.7 - i) * 0.12); });
  R.bufanda.forEach((p, i) => { p.rotation.set(0.6 + Math.sin(t * 5 - i * 1.1) * 0.2, 0, Math.sin(t * 3.3 - i) * 0.15); });
  tmxFija();
}
const terOjo = (i, v) => TER.ojos[i].getWorldPosition(v);

/* ---------- Golpes ---------- */
function tmxGolpe(sx, sz, dmg, knock){ if (player.dead) return false; return hurtPlayer(Math.round(dmg * TER.dm), sx, sz, knock) === 'hit'; }
function tmxManoPon(x, y, z, yaw){ const m = TMX.mano; m.visible = true; m.position.set(x, y, z); m.rotation.set(0, yaw, 0); }
function tmxTubo(){   // el brazo estirado: del hombro izquierdo del gigante a la muñeca
  if (!TMX.mano.visible){ TMX.tubo.visible = false; return; }
  const o = TER.R.armR.sh.getWorldPosition(tmxV[0]), w = TMX.mano.localToWorld(tmxV[1].set(0, 0, 0.62)), L = Math.max(0.1, o.distanceTo(w));
  TMX.tubo.visible = true; TMX.tubo.position.copy(o); TMX.tubo.scale.set(2.6, L, 2.6); TMX.tubo.quaternion.setFromUnitVectors(terY, tmxV[2].subVectors(w, o).normalize());
}
const TMX_ATQ = {
  barrido: { dur: 3.3,
    empieza(a){ a.dir = rnd() < 0.5 ? 1 : -1; const C = TER.carril, u = C.userData; C.visible = true; C.position.set(0, 0.05, -a.dir * 8.4); C.rotation.y = a.dir > 0 ? 0 : Math.PI; C.scale.set(14, 1, 1);
      u.b.scale.set(1, 16.8, 1); u.b.position.z = 8.4; u.f.scale.set(1, 0.01, 1); u.f.position.z = 0;
      terGrito('¡MANOTAZO!', terTactil() ? 'Rueda justo cuando pase' : 'Rueda (K) justo cuando pase'); play('terRugido'); },
    tick(a, et){ const t = a.t, u = TER.carril.userData;
      if (t < 1.3){ const k = t / 1.3; u.f.scale.set(1, 16.8 * k, 1); u.f.position.z = 8.4 * k; tmxManoPon(1.5, lerp(-28, 1.5, smooth(k)), -a.dir * 34, Math.PI / 2); }
      else if (t < 2.4){ TER.carril.visible = false; const k = (t - 1.3) / 1.1, z = lerp(-a.dir * 32, a.dir * 32, k); tmxManoPon(1.5, 1.5, z, Math.PI / 2);
        if (!a.son){ a.son = true; play('whoosh'); play('terFuego'); }
        const hp = hero.position; if (!a.dio && Math.abs(hp.z - z) < 4.9 && hp.y < 3.2){ a.dio = true; tmxGolpe(hp.x, z - a.dir * 5, 14, 9); shake = Math.max(shake, 0.6); }
        if (rnd() < 0.6) puffAt(1.5 + (rnd() - 0.5) * 12, z, 3, 1.5, 0x6a5a7a); }
      else { const k = (t - 2.4) / 0.9; tmxManoPon(1.5, lerp(1.5, -30, smooth(k)), a.dir * (32 + k * 6), Math.PI / 2); } },
    fin(){ TER.carril.visible = false; tmxManoFuera(); } },
  aplaston: { dur: 4.4,
    empieza(a){ const hp = hero.position, r = Math.hypot(hp.x, hp.z), k = r > 3.4 ? 3.4 / r : 1; a.x = hp.x * k; a.z = hp.z * k; terCirculo(a.x, a.z, 5, 1.45);
      terGrito('¡APLASTÓN!', 'Sal del círculo'); play('bruteWarn'); },
    tick(a){ const t = a.t;
      if (t < 1.25) tmxManoPon(a.x + 1, lerp(45, 14, smooth(t / 1.25)), a.z + 1, Math.PI / 2 + 0.3);
      else if (t < 1.45) tmxManoPon(a.x + 1, lerp(14, 1.5, (t - 1.25) / 0.2), a.z + 1, Math.PI / 2 + 0.3);
      else if (t < 3.0){ tmxManoPon(a.x + 1, 1.5, a.z + 1, Math.PI / 2 + 0.3);
        if (!a.hecho){ a.hecho = true; const hp = hero.position; if (Math.hypot(hp.x - a.x, hp.z - a.z) < 5) tmxGolpe(a.x, a.z, 16, 8); terImpacto(a.x, a.z, 5); terOnda(a.x, a.z, 4.5); play('boom'); play('terPaso'); play('bossSlam'); flash('#ff2ae0', 0.25); hitStop = 0.06; }
        const hp = hero.position, dx = hp.x - a.x, dz = hp.z - a.z, d = Math.hypot(dx, dz);   // la mano apoyada aparta a Tovan
        if (d < 4.6 && d > 1e-3 && hp.y < 3){ hp.x = a.x + dx / d * 4.6; hp.z = a.z + dz / d * 4.6; } }
      else tmxManoPon(a.x + 1, lerp(1.5, -30, smooth((t - 3.0) / 1.4)), a.z + 1 + (t - 3.0) * 8, Math.PI / 2 + 0.3); },
    fin(){ tmxManoFuera(); } },
  mirada: { dur: 3.9,
    empieza(a){ const hp = hero.position, an = rnd() * TAU, dx = Math.cos(an), dz = Math.sin(an), lim = TMX_ARENA - 0.3;
      const pt = (s) => { let x = hp.x + dx * s, z = hp.z + dz * s; const r = Math.hypot(x, z); if (r > lim){ x *= lim / r; z *= lim / r; } return new V3(x, 0.1, z); };
      a.p0 = pt(-8); a.p1 = pt(8); a.p = a.p0.clone(); const L = a.p0.distanceTo(a.p1) || 1, C = TER.carril, u = C.userData;
      C.visible = true; C.position.copy(a.p0).setY(0.05); C.rotation.y = Math.atan2(a.p1.x - a.p0.x, a.p1.z - a.p0.z); C.scale.set(2.6, 1, 1);
      u.b.scale.set(1, L, 1); u.b.position.z = L / 2; u.f.scale.set(1, 0.01, 1); u.f.position.z = 0; a.L = L; a.dano = 0;
      TMX.miraP = a.p; terGrito('¡MIRADA LÁSER!', 'Apártate de la línea'); play('kameCharge'); },
    tick(a, et){ const t = a.t, u = TER.carril.userData;
      for (const o of TER.ojos) o.material.uniforms.uColor.value.setHex(t < 1.1 && Math.sin(time * 40) > 0 ? 0xffffff : 0xff2a5a);
      if (t < 1.1){ const k = t / 1.1; u.f.scale.set(1, a.L * k, 1); u.f.position.z = a.L * k / 2; }
      else if (t < 2.7){ TER.carril.visible = false; const k = smooth((t - 1.1) / 1.6); a.p.lerpVectors(a.p0, a.p1, k);
        if (!a.cintas){ a.cintas = [tintaCoge(LASER, 0, 'rayo'), tintaCoge(LASER, 0, 'rayo'), tintaCoge(RAYO_CIAN, 0, 'rayo'), tintaCoge(RAYO_CIAN, 0, 'rayo')]; play('terRayo'); play('zap'); }
        a.cintas.forEach((c, j) => { const e0 = terOjo(j % 2, tmxV[4]).clone(); tintaPinta(c, (s, v) => v.lerpVectors(e0, a.p, s), 0, 1, k2 => (j < 2 ? 1.6 : 0.6) * (0.5 + 0.5 * k2)); });
        if (rnd() < 0.8) spawnFx(a.p.x, 0.3, a.p.z, (rnd() - 0.5) * 4, 2 + rnd() * 3, (rnd() - 0.5) * 4, rnd() < 0.5 ? 0xff2a8a : 0xffffff, 0.14, 0.4, 8, 0);
        if (rnd() < 0.15) ringFx(a.p.x, a.p.z, 0xff2a8a, 0.2, 1.6, 0.3);
        a.dano -= et; const hp = hero.position; if (a.dano <= 0 && Math.hypot(hp.x - a.p.x, hp.z - a.p.z) < 1.5 && hp.y < 1.8 && tmxGolpe(a.p.x, a.p.z, 9, 5)) a.dano = 0.45; }
      else if (a.cintas){ a.cintas.forEach(tintaSuelta); a.cintas = null; TMX.miraP = null; } },
    fin(a){ TER.carril.visible = false; if (a.cintas){ a.cintas.forEach(tintaSuelta); a.cintas = null; } TMX.miraP = null; for (const o of TER.ojos) o.material.uniforms.uColor.value.setHex(0xff2a5a); } },
  tormenta: { dur: 3.8,
    empieza(a){ a.rayos = Array.from({ length: 5 }, (_, i) => ({ at: 0.9 + i * 0.55, ci: null, x: 0, z: 0, hecho: false })); terGrito('¡TORMENTA!', 'No te quedes quieto'); play('terRugido'); },
    tick(a){ const t = a.t, hp = hero.position;
      for (const b of a.rayos){
        if (!b.ci && t >= b.at - 0.7){ b.x = hp.x; b.z = hp.z; b.ci = terCirculo(b.x, b.z, 1.9, 0.7); }
        if (!b.hecho && t >= b.at){ b.hecho = true; const top = new V3(b.x + (rnd() - 0.5) * 10, 70, b.z + (rnd() - 0.5) * 10), bot = new V3(b.x, 0, b.z), base = (s, v) => v.lerpVectors(top, bot, s);
          TER.peligros.push({ tipo: 'rayo', t: 0, cintas: [tintaCoge(RAYO_AZUL, 0, 'rayo'), tintaCoge(RAYO_CIAN, 0, 'rayo')], P: [rayoTiembla(base, 18, 2), rayoTiembla(base, 18, 1.2)] });
          if (Math.hypot(hp.x - b.x, hp.z - b.z) < 1.9 && hp.y < 2.5) tmxGolpe(b.x, b.z, 9, 4);
          ringFx(b.x, b.z, 0xbfe8ff, 0.3, 2.6, 0.35); lightFlash(b.x, 1.5, b.z, 0x8fd0ff, 2.4, 12); flash('#cfe8ff', 0.18); play('terRayo'); shake = Math.max(shake, 0.35); } } } },
  ventanas: { dur: 3.6,
    empieza(a){ const hp = hero.position; a.v = TMX.ventanas.map((m, i) => { let x, z; if (i === 0){ x = hp.x; z = hp.z; } else { const an = rnd() * TAU, r = rnd() * (TMX_ARENA - 0.8); x = Math.cos(an) * r; z = Math.sin(an) * r; }
      return { m, x, z, at: 0.9 + i * 0.32, ci: null, hecho: false, rot: rnd() * TAU }; }); terGrito('¡LLUVIA DE VENTANAS!', 'Error tras error'); play('glitch'); },
    tick(a){ const t = a.t, hp = hero.position;
      for (const w of a.v){ const m = w.m;
        if (!w.ci && t >= w.at - 0.85){ w.ci = terCirculo(w.x, w.z, 1.9, 0.85); m.visible = true; }
        if (m.visible && !w.hecho){ const k = clamp(1 - (w.at - t) / 0.85, 0, 1); m.position.set(w.x, lerp(34, 1.2, k * k), w.z); m.rotation.set(-0.3 + k * 0.3, w.rot + t * 2, 0); }
        if (!w.hecho && t >= w.at){ w.hecho = true; if (Math.hypot(hp.x - w.x, hp.z - w.z) < 1.9 && hp.y < 2) tmxGolpe(w.x, w.z, 8, 5); play('glitch'); play('slam');
          for (let i = 0; i < 14; i++){ const an = rnd() * TAU; spawnFx(w.x, 1, w.z, Math.cos(an) * 4, 2 + rnd() * 3, Math.sin(an) * 4, i % 2 ? 0xe8e4ee : 0xc8307a, 0.2, 0.6, 10, 0); } m.visible = false; } } },
    fin(){ for (const v of TMX.ventanas) v.visible = false; } }
};
function tmxAtaqueFuera(){ if (TMX.atq){ const D = TMX_ATQ[TMX.atq.tipo]; if (D.fin) D.fin(TMX.atq); TMX.atq = null; } }
function tmxElige(){
  const pool = TMX.fase === 'ojo' ? ['mirada', 'barrido', 'tormenta', 'aplaston'] : ['barrido', 'aplaston', 'mirada', 'tormenta'].concat(TMX.rotos >= 1 ? ['ventanas'] : []);
  let t = TMX.primero; TMX.primero = null;
  if (!t){ const ops = pool.filter(p => p !== TMX.ultimo); t = ops[Math.floor(rnd() * ops.length)]; }
  TMX.ultimo = t; TMX.atq = { tipo: t, t: 0, dur: TMX_ATQ[t].dur }; TMX_ATQ[t].empieza(TMX.atq);
}

/* ---------- Procesos (en el hombro) y el ojo ---------- */
function tmxProcesosCrea(){
  if (TMX.procesos.length) return;
  TMX.procesos = TMX_PROC.map(([x, z], i) => {
    const g = new THREE.Group(); scene.add(g); const S = matSet([[0xff2ae0, 0.55], [0x20ffe0, 1], [0x1a0b24]]), body = new THREE.Group(); g.add(body);
    mesh(C(0.9, 1.05, 0.3, 6), S[2].m, 0, 0.15, 0, body);
    const cr = mesh(new THREE.OctahedronGeometry(0.62, 0), S[0].m, 0, 1.35, 0, body); cr.scale.y = 1.8;
    const ring = mesh(new THREE.TorusGeometry(0.85, 0.06, 4, 18), S[1].m, 0, 0.4, 0, body); ring.rotation.x = Math.PI / 2;
    mesh(C(0.22, 0.22, 40, 6, true), terPropio(makeMat(0xff6af0, { emissive: 1, opacity: 0.25 })), 0, 20, 0, g);
    const et = new THREE.Sprite(TMX.etiq[i]); et.position.set(0, 3.4, 0); et.scale.set(2.2, 0.55, 1); g.add(et);
    const e = newEnemy('proceso', g, body, S, { hp: Math.max(1, Math.round(TER.total * 0.12)), r: 0.95, speed: 0, numY: 2.6, isBoss: true, heavy: true, noSep: true, spawnT: 0,
      tmxProceso: true, px: x, pz: z, cr, ring, fzT: 1e9, fzMarks: [], fzOn: 0, fzWarn: 0, upd: () => {} });
    e.dm = TER.dm; g.position.set(x, 0, z); return e; });
}
function tmxProcesosTick(et){
  for (const e of TMX.procesos){ if (!e.alive) continue; e.g.position.set(e.px, 0, e.pz); e.vx = e.vz = 0; e.cr.rotation.y += et * 1.5; e.ring.rotation.z += et * 2; e.body.position.y = Math.sin(TER.tt * 3 + e.px) * 0.06; }
  const o = TMX.ojo; if (!o || !o.alive) return;
  const E = terOjo(0, tmxV[0]), r = Math.hypot(E.x, E.z), lim = TMX_ARENA - 0.8, k = r > lim ? lim / r : 1;
  o.g.position.set(E.x * k, 0, E.z * k); o.vx = o.vz = 0; TMX.ojoAro.visible = true; TMX.ojoAro.position.set(E.x * k, 0.06, E.z * k); TMX.ojoAro.scale.setScalar(1 + Math.sin(time * 6) * 0.06);
  TMX.ojoSpr.visible = true; TMX.ojoSpr.position.copy(E); const s = 6.5 * (1 + Math.sin(time * 7) * 0.08), q = o.hp / o.maxHp; TMX.ojoSpr.scale.set(s, s, 1); TMX.ojoSpr.material.color.setRGB(1, 0.5 + 0.5 * q, 0.55 + 0.45 * q);
}
function tmxRompe(e){
  if (!e.alive) return; e.alive = false; e.remove = true; scene.remove(e.g);
  const x = e.g.position.x, z = e.g.position.z; TMX.rotos++; TMX.dolor = 1.3;
  ringFx(x, z, 0xff2ae0, 0.3, 5, 0.5); lightFlash(x, 1.5, z, 0xff2ae0, 2.6, 12); flash('#ffffff', 0.4); play('colRompe'); play('terRugido'); shake = Math.max(shake, 0.8); hitStop = 0.1;
  for (let i = 0; i < 30; i++){ const an = rnd() * TAU, v = 3 + rnd() * 6; spawnFx(x, 1.2, z, Math.cos(an) * v, 2 + rnd() * 6, Math.sin(an) * v, i % 3 ? 0xff2ae0 : i % 2 ? 0x20ffe0 : 0xffffff, 0.16, 0.9, 9, 0.3); }
  tmxBarra();
  if (TMX.rotos >= 3){ tmxAgacha(); return; }
  banner(`¡Proceso cerrado!<small>${TMX.rotos} de 3</small>`, 1.6); barkT = 0; bark(TMX.rotos === 1 ? '¡Uno menos! Ahora lloverán más errores.' : '¡Solo queda uno!');
}
function tmxAgacha(){   // se le acaban los procesos: baja la cara hasta el hombro para mirarte de cerca
  tmxAtaqueFuera(); TMX.fase = 'agacha'; TMX.agachaT = 0; play('terRugido'); shake = Math.max(shake, 0.9);
  banner('¡Procesos cerrados!<small>Baja la cara para verte de cerca…</small>', 2); barkT = 0; bark('¡Viene a mirarte de cerca! ¡Pégale en el ojo!');
}
function tmxOjoCrea(){
  const g = new THREE.Group(); scene.add(g); const S = matSet([[0xff2a5a, 1]]), body = new THREE.Group(); g.add(body);
  mesh(new THREE.IcosahedronGeometry(0.5, 1), S[0].m, 0, 1.2, 0, body).visible = false;
  TMX.ojo = newEnemy('ojo404', g, body, S, { hp: Math.max(1, Math.round(TER.total * 0.25)), r: 1.6, speed: 0, numY: 2.4, isBoss: true, heavy: true, noSep: true, spawnT: 0,
    tmxOjo: true, fzT: 1e9, fzMarks: [], fzOn: 0, fzWarn: 0, upd: () => {} });
  TMX.ojo.dm = TER.dm;
}
function tmxBarra(){
  if (!bossE || bossE.type !== 'tovanmax') return;
  const mp = Math.max(1, Math.round(TER.total * 0.12)), mo = Math.max(1, Math.round(TER.total * 0.25));
  bossE.maxHp = 3 * mp + mo; bossE.hp = TMX.procesos.reduce((t, e) => t + (e.alive ? Math.max(0, e.hp) : 0), 0) + (TMX.ojo ? Math.max(0, TMX.ojo.alive ? TMX.ojo.hp : 0) : mo);
  const t = TMX.fase === 'ojo' || TMX.fase === 'agacha' ? 'TOVAN.EXE · fuera de memoria · ¡el ojo!' : `TOVAN.EXE · fuera de memoria · procesos ${TMX.rotos}/3`;
  if (bossNameEl.textContent !== t) bossNameEl.textContent = t;
}

/* ---------- Ambiente: relámpagos entre las nubes, viento ---------- */
function tmxRelampago(cerca){
  const r = TMX.r, a = r() * TAU, d = cerca ? 30 + r() * 40 : 40 + r() * 170, x = Math.cos(a) * d, z = Math.sin(a) * d, alto = r() < 0.4;
  const p0 = alto ? new V3(x + (r() - 0.5) * 20, 95, z + (r() - 0.5) * 20) : new V3(x, -10 - r() * 6, z), p1 = alto ? new V3(x, -10, z) : new V3(x + (r() - 0.5) * 50, -10 - r() * 8, z + (r() - 0.5) * 50);
  const base = (s, v) => v.lerpVectors(p0, p1, s);
  TMX.rayos.push({ t: 0, cintas: [tintaCoge(RAYO_AZUL, 0, 'rayo'), tintaCoge(RAYO_CIAN, 0, 'rayo')], P: [rayoTiembla(base, 14, alto ? 4 : 3), rayoTiembla(base, 14, 2)] });
  lightFlash(x, -8, z, 0xd8c8ff, 3, alto ? 120 : 80); if (d < 90 || cerca){ flash('#e0d4ff', alto ? 0.16 : 0.09); play('terRayo'); }
}
function tmxAmbiente(dt){
  for (const m of TMX.mares){ const u = m.userData; m.position.x += u.v * dt; if (m.position.x > u.tile) m.position.x -= u.tile; }
  TMX.nubesG.rotation.y += dt * 0.004;
  if ((TMX.rayoT -= dt) <= 0){ TMX.rayoT = 0.7 + TMX.r() * 2.6; tmxRelampago(false); }
  for (let i = TMX.rayos.length - 1; i >= 0; i--){ const R_ = TMX.rayos[i]; R_.t += dt; const k = R_.t / 0.3;
    R_.cintas.forEach((c, j) => { tintaPinta(c, R_.P[j], 0, 1, () => (j ? 1.2 : 2.6) * (1 - k * 0.6)); c.mat.uniforms.uAlpha.value = 1 - k; }); if (k >= 1){ R_.cintas.forEach(tintaSuelta); TMX.rayos.splice(i, 1); } }
  colVientoEl.style.setProperty('--k', (0.32 + Math.sin(TER.tt * 0.7) * 0.06).toFixed(2)); colVientoEl.style.setProperty('--r', ((TER.tt * 97) % 6).toFixed(1) + 'deg');
  if (COL.son && actx){ const t = actx.currentTime; COL.son.g.gain.setTargetAtTime(sfxOn && gameState !== 'paused' ? 0.13 : 0, t, 0.2); COL.son.bp.frequency.setTargetAtTime(520 + 160 * Math.sin(TER.tt * 0.5), t, 0.3); }
}

/* ---------- Bucle ---------- */
function tmxTick(dt, pdt, playing){
  if (!TMX.on) return;
  const jugando = playing && (TMX.fase === 'pelea' || TMX.fase === 'agacha' || TMX.fase === 'ojo'), et = jugando ? pdt * (slowT > 0 ? 0.3 : 1) * (timeStopT > 0 ? 0 : 1) : gameState === 'paused' || gameState === 'over' ? 0 : dt;
  if (TMX.montado) tmxAmbiente(gameState === 'paused' ? 0 : dt);
  if (TMX.dolor > 0) TMX.dolor -= et;
  if (jugando){
    clearT = 0;
    if (TMX.fase === 'agacha'){ TMX.agachaT += et; TMX.caraObj = 1; if (TMX.agachaT >= 2.6){ tmxOjoCrea(); TMX.fase = 'ojo'; TMX.cd = 1.8; TMX.primero = 'mirada'; } }
    else if (TMX.atq){ const a = TMX.atq; a.t += et; TMX_ATQ[a.tipo].tick(a, et); if (a.t >= a.dur){ tmxAtaqueFuera(); TMX.cd = TMX.fase === 'ojo' ? 2.0 : [1.7, 1.4, 1.2][Math.min(2, TMX.rotos)]; } }
    else if ((TMX.cd -= et) <= 0 && !player.dead) tmxElige();
    terCirculosTick(et); terOndasTick(et); terPeligrosTick(et); tmxProcesosTick(et); tmxBarra();
    const N = TER.R.neck.getWorldPosition(tmxV[5]), hp = hero.position, dx = N.x - hp.x, dz = N.z - hp.z;   // la cámara del hombro mira hacia su cabeza: W anda hacia ella
    if (Math.hypot(dx, dz) > 1) camYaw = lerpAngle(camYaw, Math.atan2(-dx, -dz), 1 - Math.exp(-pdt * 2.5));
  }
  if (TMX.mano) tmxTubo();
}
function tmxCamara(cam){
  if (!TMX.montado || cs.active || lcut) return;
  const hp = hero.position, N = TER.R.neck.getWorldPosition(tmxV[0]), dx = N.x - hp.x, dz = N.z - hp.z, d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d;
  const tall = innerWidth < innerHeight, kd = (tall ? 1.35 : 1) * (camDist / 7), P_ = tmxV[1], L_ = tmxV[2], c = smooth(Math.min(1, TMX.cara));
  P_.set(hp.x - ux * 13 * kd + uz * 3, hp.y + 6.5 + (tall ? 2 : 0) - c * 2, hp.z - uz * 13 * kd - ux * 3);   // lejos y alto: Tovan pequeño y su cara encima
  L_.set(hp.x + ux * 7, hp.y + 8.5 - c * 5, hp.z + uz * 7);
  if (!TMX.camOk){ TMX.camP.copy(P_); TMX.camL.copy(L_); TMX.camOk = true; } else { const a = 1 - Math.exp(-TER.camDt * 5); TMX.camP.lerp(P_, a); TMX.camL.lerp(L_, a); }
  cam.position.copy(TMX.camP); cam.lookAt(TMX.camL);
}

/* ---------- La transformación (no se deja cerrar y crece) ---------- */
function tmxEmpieza(){
  Object.assign(TMX, { on: true, hecho: true, fase: 'cine', rotos: 0, atq: null, cara: 0, caraObj: 0, dolor: 0, miraP: null, procesos: [], ojo: null, camOk: false, mx: 0, my: 0, cd: 2, primero: null, ultimo: null });
  TER.fase = 'mega'; terAtaqueFuera(); terPeligrosFuera(); TER.sac = null; colAviso(null); colAgarreEl.hidden = true; terPista(''); terBotonAgarra(false);
  bossE = null; bossBox.hidden = true; TER.alza = 0; staffToBack(); TER.trepa = null; grounded = true; vy = 0; state = 'normal';
  tmxConstruye(); tmxCine();
}
function tmxCine(){
  const hp = hero.position;
  runCine(async () => {
    const x0 = hp.x, y0 = hp.y, z0 = hp.z, G = TER.g.position;
    // 1. Ctrl + Alt + Supr
    csShout('¡CTRL + ALT + SUPR!'); play('specialBoom'); flash('#ffffff', 0.8); shake = 1;
    csShot((cam, t) => { const a = TER.yaw + Math.PI + 0.7 + t * 0.2; cam.position.set(x0 + Math.sin(a) * 4.5, y0 + 1.8, z0 + Math.cos(a) * 4.5); cam.lookAt(x0, y0 + 0.9, z0); });
    await csWait(1.3);
    // 2. No se deja cerrar
    terVentanaEl.innerHTML = TMX_VENTANA[0]; terVentanaEl.hidden = false; play('glitch');
    csShot((cam, t) => { cam.position.set(G.x + 4, 3 + t * 0.5, G.z + 17); cam.lookAt(G.x, 6.5, G.z); });
    await csWait(1.6); terVentanaEl.querySelector('.si').classList.add('pulsa'); play('confirm'); await csWait(0.5);
    terVentanaEl.innerHTML = TMX_VENTANA[1]; terVentanaEl.classList.add('mal'); play('glitch'); play('terRugido'); shake = 0.8; await csWait(2.0);
    terVentanaEl.hidden = true; terVentanaEl.classList.remove('mal'); terVentanaEl.innerHTML = TMX_VENTANA[0];
    // 3. Crece sin parar
    hero.visible = false;
    csShot((cam, t) => { const k = smooth(clamp(t / 2.2, 0, 1)); cam.position.set(G.x + 6 + k * 24, 2 + k * 14, G.z + 22 + k * 46); cam.lookAt(G.x, 6 + k * 26, G.z); });
    for (const s of [8, 11, 15, 20]){ terColoca(G.x, G.z, TER.yaw, s); flash('#ff2ae0', 0.3); play('glitch'); play('terPaso'); shake = 0.9; await csWait(0.45); }
    // 4. Fuera de memoria: entre nubarrones
    await csTween(0.25, k => { cineEls.white.style.opacity = String(k); });
    tmxMonta(); TER.esc = TMX_ESC; TMX.my = -1.2; tmxAnima(0);
    csShot((cam, t) => { cam.position.set(-6 + t * 2, 3 + t * 1.6, 92 - t * 5); cam.lookAt(20, 30 + t * 2, 0); });
    await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
    play('terRugido'); shake = 0.6; tmxRelampago(true); showBossCard('tovanmax'); csCaption('Lumen: ¡Está usando toda la memoria! ¡No para de crecer!');
    await csWait(3.2); hideBossCard(); tmxRelampago(true);
    // 5. Tovan cae en su hombro
    hero.visible = true; TMX.caraObj = 0.7; hp.set(-2, 16, 1); heading = Math.PI / 2; hero.rotation.y = heading; let v = 0, toca = false;
    cs.tick = dt => { if (toca) return; v += 26 * dt; hp.y = Math.max(0, hp.y - v * dt); grounded = true; vy = 0;
      if (hp.y <= 0){ toca = true; landT = 0.18; shake = 0.7; play('land'); play('boom'); puffAt(hp.x, hp.z, 12, 2); } };
    csShot((cam, t) => { cam.position.set(-17, 5 + t * 0.5, 9); cam.lookAt(4, 9 + t * 2, -1); });
    csCaption('Tovan: Desde aquí, por debajo de sus hombros solo hay nubarrones…'); await csWait(3.0);
    // 6. Los procesos
    cs.tick = null; tmxProcesosCrea(); flash('#ff2ae0', 0.3); play('glitch');
    csShot((cam, t) => { cam.position.set(-12 - t * 0.3, 8, -8); cam.lookAt(0, 1, 0); });
    csCaption('Lumen: ¡Tiene procesos clavados en el hombro! ¡Ciérralos antes de que nos aplaste!'); await csWait(2.8); csCaption('');
  }, () => { csCaption(''); hideBossCard(); terVentanaEl.hidden = true; terVentanaEl.classList.remove('mal'); terVentanaEl.innerHTML = TMX_VENTANA[0]; cineEls.white.style.opacity = '0'; if (TMX.on) tmxPelea(); });
}
function tmxPelea(){
  tmxMonta(); TER.esc = TMX_ESC; hero.visible = true; cs.tick = null;
  if (hero.position.y !== 0 || Math.hypot(hero.position.x, hero.position.z) > TMX_ARENA) hero.position.set(-2, 0, 1);
  grounded = true; vy = 0; state = 'normal'; player.inv = Math.max(player.inv, 1); TMX.camOk = false; tmxProcesosCrea(); TMX.caraObj = 0.7;
  TMX.fase = 'pelea'; TMX.cd = 2.2; TMX.primero = 'mirada';
  bossE = { type: 'tovanmax', alive: true, hp: 1, maxHp: 1, g: TER.g, isBoss: true, spawnT: 0, bossName: 'TOVAN.EXE' }; bossBox.hidden = false; tmxBarra();
  lumenTip('tmx_procesos', terTactil() ? '¡Rompe los procesos! Cuando su mano barra el hombro, ¡rueda!' : '¡Rompe los procesos! Cuando su mano barra el hombro, ¡rueda con K!'); clearT = 0;
}

/* ---------- Final: forzar cierre, se deshace y caemos entre las nubes ---------- */
function tmxRemate(e){
  if (!e.alive) return; e.alive = false; e.remove = true; scene.remove(e.g);
  TMX.fase = 'remate'; tmxAtaqueFuera(); terPeligrosFuera(); bossE = null; bossBox.hidden = true; TMX.ojoAro.visible = false;
  tmxCineFinal();
}
function tmxCineFinal(){
  const hp = hero.position; let rT = 0, piezas = null, cae = false, caeV = 0, hombro = false;
  runCine(async () => {
    const E = terOjo(0, new V3());
    // 1. ¡Forzar cierre!
    csShout('¡FORZAR CIERRE!'); play('specialBoom'); flash('#ffffff', 0.9); shake = 1.2; TMX.dolor = 2;
    csShot((cam, t) => { cam.position.set(hp.x - 6 - t * 0.5, 2.4 + t * 0.3, hp.z + 4); cam.lookAt(E.x, E.y, E.z); });
    await csWait(1.4); TMX.ojoSpr.visible = false;
    // 2. Se cierra de verdad
    terVentanaEl.innerHTML = TMX_VENTANA[0]; terVentanaEl.hidden = false; play('glitch'); TMX.caraObj = 0; const c0 = TMX.cara;
    await csTween(1.5, k => { TMX.cara = c0 * (1 - smooth(k)); });   // levanta la cabeza: que se vea por encima de las nubes antes de deshacerse
    terVentanaEl.querySelector('.si').classList.add('pulsa'); play('confirm'); await csWait(0.45); terVentanaEl.hidden = true;
    // 3. Se deshace en cubos que caen entre las nubes; Tovan cae con su hombro
    TER.g.updateMatrixWorld(true); piezas = TER.piezas.filter(m => m.visible).map(m => ({ m, y: m.getWorldPosition(new V3()).y })).sort((a, b) => b.y - a.y); play('terRugido');
    const yTop = piezas.length ? piezas[0].y + 2 : 60;
    cs.tick = dt => { rT += dt;
      const umbral = yTop - (yTop + 14) * Math.min(1, rT / 3.6);   // se deshace por alturas, de arriba abajo
      while (piezas.length && piezas[0].y > umbral){ const q = piezas.shift(), p = q.m.getWorldPosition(tmxV[0]); q.m.visible = false;
        if (rnd() < 0.6) for (let i = 0; i < 2; i++) spawnFx(p.x, p.y, p.z, (rnd() - 0.5) * 8, rnd() * 2, (rnd() - 0.5) * 8, i % 2 ? 0xff2ae0 : rnd() < 0.5 ? 0x111111 : 0x20ffe0, 1.2, 2.2, 14, 0); }
      if (umbral < 1.5 && !hombro){ hombro = true; TER.R.armL.sh.visible = false; play('boom'); play('colRompe'); shake = 1;   // el hombro se rompe bajo los pies de Tovan
        for (let i = 0; i < 40; i++){ const an = rnd() * TAU, r = rnd() * 6; spawnFx(Math.cos(an) * r, -0.5, Math.sin(an) * r, (rnd() - 0.5) * 3, rnd() * 3, (rnd() - 0.5) * 3, i % 3 ? 0xff2ae0 : i % 2 ? 0x111111 : 0x20ffe0, 0.6 + rnd() * 0.6, 2, 12, 0); } }
      if (hombro && !cae && umbral < 0.5) cae = true;
      if (cae){ caeV += 20 * dt; hp.y -= caeV * dt; grounded = true; vy = 0; P.body.rotation.x += dt * 2; blob.visible = false; } };
    csShot((cam, t) => { cam.position.set(-42 + t * 2, 20 - t * 2, 62); cam.lookAt(16, 24 - t * 6, 0); });
    await csWait(3.4);
    csShot((cam, t) => { cam.position.set(hp.x + 7, hp.y + 1.5, hp.z + 5); cam.lookAt(hp.x, hp.y, hp.z); });   // de lado: las capas de nubes pasan de canto
    csCaption('Tovan: ¡¿Y ahora quién me recoge?!'); await csWait(1.8);
    // 4. Vuelta al mapa
    await csTween(0.4, k => { cineEls.white.style.opacity = String(k); });
    cs.tick = null; csCaption(''); tmxFin(); terDesmonta(); TER.g.visible = false;
    hp.set(0, 13, 0.5); P.body.rotation.x = 0; heading = Math.PI * 0.85; hero.rotation.y = heading; blob.visible = true; let v = 0, toca = false;
    cs.tick = dt => { if (toca) return; v += 24 * dt; hp.y = Math.max(0, hp.y - v * dt); grounded = true; vy = 0; if (hp.y <= 0){ toca = true; landT = 0.18; shake = 0.9; play('boom'); play('land'); ringFx(hp.x, hp.z, 0xff2ae0, 0.3, 3.2, 0.45); puffAt(hp.x, hp.z, 14, 2.2); } };
    csShot((cam, t) => { cam.position.set(2.6, 0.6 + t * 0.3, 4.4); cam.lookAt(0, 1.0 + Math.max(0, 1.2 - t) * 2.2, 0.5); });
    await csTween(0.5, k => { cineEls.white.style.opacity = String(1 - k); });
    await csWait(1.1);
    csCaption('Tovan: Que conste que yo no tengo tan mala pinta.'); await csWait(2.2);
    csCaption('Lumen: Con textura, no.'); await csWait(1.8); csCaption('');
  }, () => { csCaption(''); terVentanaEl.hidden = true; hero.visible = true; P.body.rotation.x = 0; blob.visible = true; tmxFin(); terTermina(); });
}
function tmxFin(){   // recoge la tercera forma (al acabar o al abortar)
  tmxAtaqueFuera(); for (const e of [...TMX.procesos, TMX.ojo]) if (e && !e.remove){ e.alive = false; e.remove = true; scene.remove(e.g); }
  TMX.procesos = []; TMX.ojo = null; for (const R_ of TMX.rayos) R_.cintas.forEach(tintaSuelta); TMX.rayos.length = 0;
  if (TMX.ojoSpr){ TMX.ojoSpr.visible = false; TMX.ojoAro.visible = false; } if (TER.ojos) for (const o of TER.ojos) o.material.uniforms.uColor.value.setHex(0xff2a5a);
  tmxDesmonta(); TMX.on = false; TMX.fase = null; TMX.cara = TMX.caraObj = 0; TMX.miraP = null; hero.visible = true; if (TER.R) TER.R.armL.sh.visible = true;
}

/* ---------- Ganchos ---------- */
const _terRemateTMX = terRemate;
terRemate = function(){ if (!TMX.hecho && TER.on){ tmxEmpieza(); return; } _terRemateTMX(); };
const _terEmpiezaTMX = terEmpieza;
terEmpieza = function(e){ TMX.hecho = false; _terEmpiezaTMX(e); };
const _terAnimaTMX = terAnima;
terAnima = function(et){ if (TMX.on && TMX.montado){ tmxAnima(et); return; } _terAnimaTMX(et); };
const _terDesmontaTMX = terDesmonta;
terDesmonta = function(){ tmxDesmonta(); _terDesmontaTMX(); };
const _terAbortaTMX = terAborta;
terAborta = function(){ if (TMX.on || TMX.montado){ tmxFin(); if (bossE && bossE.type === 'tovanmax'){ bossE = null; bossBox.hidden = true; } } _terAbortaTMX(); };
// selector de jefes: directo a la forma «fuera de memoria»
const _terEmpiezaPeleaTMX = terEmpiezaPelea;
terEmpiezaPelea = function(){ _terEmpiezaPeleaTMX(); if (SELJ.on && SELJ.max){ SELJ.max = false; for (const s of TER.sellos){ s.roto = true; s.hp = 0; s.spr.visible = false; } TER.rotos = 3; terRemate(); } };
const _killEnemyTMX = killEnemy;
killEnemy = function(e){ if (e.tmxProceso){ tmxRompe(e); return; } if (e.tmxOjo){ tmxRemate(e); return; } return _killEnemyTMX(e); };
const _v3UpdateTMX = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateTMX(dt, pdt, playing); try { tmxTick(dt, pdt, playing); } catch (err) { console.error(err); } };
const _csCameraTMX = csCamera; csCamera = function(cam){ _csCameraTMX(cam); try { tmxCamara(cam); } catch (err) { console.error(err); } };

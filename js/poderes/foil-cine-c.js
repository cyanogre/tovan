'use strict';
/* ======================================================================
   PODERES FOIL · CINE (C), sobre foil-nucleo.js. Nada de texto en
   pantalla. Prefijos:
     · Estrella de la Muerte · edm. Cada 30 de combo aparece en el cielo,
       sobre el grupo más grande, la estación espacial gris con su trinchera
       y su plato; ocho rayos verdes salen del plato y se juntan en uno que
       cae sobre el grupo y lo revienta todo.
     · El otro lado (Stranger Things) · otr. Cada golpe que recibes te
       carga; al cuarto se abre el otro lado: las luces de colores
       parpadean, el cielo se tiñe de rojo con relámpagos, flota ceniza,
       los enemigos se elevan retorciéndose y caen estampados contra el
       suelo, con un arpegio de sintetizador.
     · La roca (Indiana Jones) · ind. Al soltar el ataque cargado a tope,
       el suelo retumba, cae polvo y una roca gigante aparece rodando
       detrás de Tovan; arrolla todo lo que pilla, rebota en el borde y se
       hace pedazos.
   Lo pintado al cargar usa mulberry32 (nada de rnd() al cargar).
   ====================================================================== */

/* ======================================================================
   ESTRELLA DE LA MUERTE (edm)
   ====================================================================== */
const EDM_CADA = 30, EDM_R = 4.2;
const EDM = { est: null, plato: null, mira: 0 };
const EDM_VERDE = [0xffffff, 0x6aff6a, 0x10a020, 0];
// la superficie: paneles grises, la trinchera del ecuador y líneas de luces (lienzo con su propio PRNG)
const EDM_TEX = (() => { const t = new THREE.CanvasTexture(foilLienzo(256, 128, g => { const R = mulberry32(1977);
  g.fillStyle = '#8a8c92'; g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 260; i++){ const x = R() * 256, y = R() * 128, w = 4 + R() * 18, h = 2 + R() * 8, v = 110 + Math.floor(R() * 60); g.fillStyle = `rgb(${v},${v + 2},${v + 6})`; g.fillRect(x, y, w, h); }
  g.fillStyle = '#3a3c42'; g.fillRect(0, 61, 256, 6); g.fillStyle = '#6a6c72'; g.fillRect(0, 60, 256, 1); g.fillRect(0, 67, 256, 1);
  for (let i = 0; i < 90; i++){ g.fillStyle = R() < 0.5 ? '#fff8d0' : '#d0e8ff'; g.fillRect(R() * 256, R() * 128, 1, 1); } })); t.magFilter = THREE.NearestFilter; return t; })();
function edmModelo(){
  if (EDM.est) return EDM.est;
  const g = new THREE.Group(), esfera = new THREE.Mesh(new THREE.SphereGeometry(EDM_R, 28, 18), makeMat(0xffffff, { map: EDM_TEX, emissive: 0.4 })); g.add(esfera);
  const plato = new THREE.Group(); g.add(plato); EDM.plato = plato;
  const hueco = new THREE.Mesh(new THREE.CircleGeometry(1.15, 24), makeMat(0x4a4c52, { emissive: 0.1, side: THREE.DoubleSide })); hueco.position.z = 0.02; plato.add(hueco);
  for (const r of [0.8, 0.5]){ const a = new THREE.Mesh(new THREE.RingGeometry(r - 0.05, r, 24), makeMat(0x2a2c30, { side: THREE.DoubleSide })); a.position.z = 0.04; plato.add(a); }
  const ojo = new THREE.Mesh(new THREE.CircleGeometry(0.2, 12), makeMat(0x6aff6a, { emissive: 1, side: THREE.DoubleSide })); ojo.position.z = 0.06; plato.add(ojo); plato.userData.ojo = ojo;
  g.visible = false; scene.add(g); return (EDM.est = g);
}
function edmDispara(){
  if (!foilPuede() || !foilEscenario()) return; const e0 = xtrGrupo(hero.position, 16); if (!e0) return;
  const est = edmModelo(), T = e0.g.position.clone().setY(0);
  // sobre la arena, detrás del blanco según la cámara; la cámara levanta la vista un momento para verla (EDM.mira, en post)
  const away = xtrV.set(T.x - camera.position.x, 0, T.z - camera.position.z).normalize(), C_ = new V3(T.x + away.x * 14, 6.5, T.z + away.z * 14); EDM.mira = 0.001;
  est.position.copy(C_); est.visible = true; est.scale.setScalar(0.01);
  const dirP = T.clone().sub(C_).normalize(), P0 = C_.clone().addScaledVector(dirP, EDM_R + 0.05), F = C_.clone().addScaledVector(dirP, EDM_R + 2.4);
  EDM.plato.position.copy(dirP).multiplyScalar(EDM_R - 0.02); EDM.plato.lookAt(dirP.clone().multiplyScalar(EDM_R * 2)); est.children[0].rotation.y = Math.random() * TAU;
  const lado = new V3().crossVectors(dirP, new V3(0, 1, 0)).normalize(), arriba = new V3().crossVectors(lado, dirP).normalize();
  const finos = Array.from({ length: 8 }, (_, i) => ({ c: mtoCinta(EDM_VERDE, 'rayo'), p: P0.clone().addScaledVector(lado, Math.cos(i / 8 * TAU) * 1.0).addScaledVector(arriba, Math.sin(i / 8 * TAU) * 1.0) }));
  const gordo = [mtoCinta(EDM_VERDE, 'rayo'), mtoCinta([0xffffff, 0xffffff, 0x8aff8a, 0], 'rayo')];
  play('edmCarga');
  foilFx.push({ t: 0, cintas: [...finos.map(q => q.c), ...gordo], upd(dt){ const t = this.t;
      est.scale.setScalar(Math.min(1, t / 0.5)); est.rotation.y += dt * 0.05; EDM.mira = t; EDM.plato.userData.ojo.material.uniforms.uEmissive.value = 0.6 + 0.4 * Math.sin(t * 30);
      // 1. ocho rayos que se juntan delante del plato
      const kj = clamp((t - 0.6) / 0.6, 0, 1);
      finos.forEach(q => { q.c.m.visible = t > 0.6 && t < 2.3; if (!q.c.m.visible) return; tintaPinta(q.c, (s, v) => v.lerpVectors(q.p, F, s), 0, kj, s => 0.2); q.c.mat.uniforms.uAlpha.value = t > 2.0 ? Math.max(0, 1 - (t - 2.0) / 0.3) : 1; });
      if (t > 0.9 && dt > 0 && Math.random() < 0.8) pn(F.x, F.y, F.z, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0x8aff8a, 0.3, 0.3, 0, 2, 0, SH7.star, 1);
      // 2. el rayo gordo cae sobre el grupo
      if (t >= 1.3){ if (!this.fuego){ this.fuego = true; play('edmRayo'); flash('#a0ffa0', 0.25); }
        const kf = clamp((t - 1.3) / 0.25, 0, 1), fade = t > 2.2 ? (t - 2.2) / 0.4 : 0;
        gordo.forEach((c, i) => { c.m.visible = fade < 1; tintaPinta(c, (s, v) => v.lerpVectors(F, T, s), 0, kf, s => (i ? 0.7 : 1.8) * (1 - fade) * (0.85 + 0.15 * Math.sin(s * 40 + t * 60))); });
        shake = Math.max(shake, 0.25 * (1 - fade));
        if (kf >= 1 && !this.boom){ this.boom = true; xtrArea(T, 5.5, () => rdmg(160), 14, null, 2.5); flash('#ffffff', 0.6); shake = Math.max(shake, 1.1); hitStop = Math.max(hitStop, 0.1); lightFlash(T.x, 2, T.z, 0x6aff6a, 5, 18);
          ringFx(T.x, T.z, 0x6aff6a, 0.5, 8, 0.6); ringFx(T.x, T.z, 0xffffff, 0.3, 5, 0.4, 0.4); ring7(PN7, T.x, 0.5, T.z, 40, [0x6aff6a, 0xffffff, 0xd8ffd0], 12, 0.25, 0.8, 0, 2, 0, SH7.star, 4);
          for (let i = 0; i < 24; i++){ const a = Math.random() * TAU; pa(T.x, 0.3, T.z, Math.cos(a) * 6, 6 + Math.random() * 8, Math.sin(a) * 6, Math.random() < 0.5 ? 0x8aff8a : 0xffffff, 0.35, 0.9, 12, 0.5, 0, SH7.dot); } play('edmBoom'); } }
      est.visible = t < 3.2; if (t > 2.6) est.scale.setScalar(Math.max(0.01, 1 - (t - 2.6) / 0.6));
      return t < 3.2; }, fin(){ est.visible = false; EDM.mira = 0; } });
}
const edm_addCombo = addCombo;
addCombo = function(){ edm_addCombo(); try { if (lvl('foilEstrellaMuerte') && combo > 0 && combo % EDM_CADA === 0 && gameState === 'play') edmDispara(); } catch (err) { console.error(err); } };
Object.assign(SFX, {
  edmCarga: () => { tone({ type: 'sawtooth', f0: 60, f1: 240, dur: 1.3, vol: 0.12, attack: 0.5, rv: 0.5 }); noise({ dur: 1.3, vol: 0.15, f0: 200, f1: 3000, type: 'bandpass', q: 2, attack: 0.8, rv: 0.5 }); },
  edmRayo: () => { tone({ type: 'sawtooth', f0: 80, f1: 50, dur: 0.9, vol: 0.2, rv: 0.6 }); noise({ dur: 0.9, vol: 0.3, f0: 800, type: 'lowpass', rv: 0.6 }); },
  edmBoom: () => { tone({ type: 'sine', f0: 80, f1: 20, dur: 1.6, vol: 0.9, rv: 0.8 }); noise({ dur: 1.4, vol: 0.55, f0: 2500, f1: 80, type: 'lowpass', rv: 0.8 }); }
});
foilPoder({ id: 'foilEstrellaMuerte', ic: '🌑', name: 'Estrella de la Muerte', tags: ['otaku'],
  desc: 'Cada 30 de combo aparece en el cielo, sobre el grupo más grande, una estación espacial del tamaño de una luna; ocho rayos verdes salen de su plato, se juntan en uno y caen sobre el grupo reventándolo todo.',
  post(){ const t = EDM.mira; if (!t || cs.active || lcut) return; const k = smooth(Math.min(1, t / 0.45)) * (t > 2.6 ? Math.max(0, 1 - (t - 2.6) / 0.6) : 1); camera.rotateX(k * 0.38); },   // (levanta la vista unos 20° y vuelve)
  limpia(){ if (EDM.est) EDM.est.visible = false; EDM.mira = 0; } });

/* ======================================================================
   EL OTRO LADO (otr)
   ====================================================================== */
const OTR = { carga: 0, on: null, luces: null, cable: null, capa: null, niebla: null };
const OTR_COLS = [0xff3a3a, 0x3aff5a, 0x3a8aff, 0xffd23a, 0xff8a2a, 0xff5ad8];
const OTR_BOMBILLA = foilLienzo(32, 32, g => { const gr = g.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); });
function otrMonta(){
  if (OTR.luces) return;
  OTR.luces = Array.from({ length: 18 }, (_, i) => { const m = foilSprite(OTR_BOMBILLA, true); m.color = new THREE.Color(OTR_COLS[i % OTR_COLS.length]); const s = new THREE.Sprite(m); s.scale.setScalar(0.6); s.renderOrder = 6; s.visible = false; scene.add(s); return s; });
  OTR.cable = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 37 }, () => new V3())), new THREE.LineBasicMaterial({ color: 0x1a1a1a })); OTR.cable.visible = false; OTR.cable.frustumCulled = false; scene.add(OTR.cable);
  const c = document.createElement('div'); c.id = 'otrCapa'; Object.assign(c.style, { position: 'fixed', inset: '0', pointerEvents: 'none', opacity: '0', background: 'radial-gradient(ellipse at center, rgba(150,10,20,0.28) 20%, rgba(50,0,5,0.85) 100%)', zIndex: '4' });
  (document.querySelector('.vignette') || document.getElementById('c')).after(c); OTR.capa = c;
}
function otrAbre(){
  if (OTR.on || !foilPuede() || !foilEscenario()) return false;
  otrMonta(); OTR.carga = 0; const H = hero.position, O = new V3(H.x, 0, H.z);
  const lev = foilEnemigos(O, 13).map(e => ({ e, alto: 2.6 + Math.random() * 2.2, giro: (Math.random() - 0.5) * 8, fuerte: strFuerte(e) }));
  for (const L_ of lev) if (!L_.fuerte) L_.e.otrLev = L_;
  OTR.niebla = shared.uFogCol.value.getHex();
  const rayos = [0, 1, 2, 3].map(() => mtoCinta([0xffffff, 0xff3a3a, 0x600000, 0], 'rayo'));
  const S = OTR.on = { t: 0, O, lev, boom: false, sig: 0, nota: 0 }; player.inv = Math.max(player.inv, 3.6); play('otrAbre');
  foilFx.push({ t: 0, cintas: rayos, upd(dt){ const t = this.t, H2 = hero.position, k = Math.min(1, t / 0.5), fin = t > 3.3 ? Math.min(1, (t - 3.3) / 0.6) : 0;
      // el cielo rojo, la ceniza, las luces que parpadean y los relámpagos
      shared.uFogCol.value.setHex(OTR.niebla).lerp(xtrC.setHex(0x5a0a10), 0.75 * k * (1 - fin)); OTR.capa.style.opacity = String((0.7 + 0.3 * (Math.random() < 0.15 ? 0 : 1)) * k * (1 - fin));
      OTR.luces.forEach((s, i) => { const a = i / OTR.luces.length * TAU, x = O.x + Math.sin(a) * 4.2, z = O.z + Math.cos(a) * 4.2; s.visible = fin < 1 && Math.random() > 0.2 + (S.boom ? 0 : 0.15); s.position.set(x, 1.7 + Math.sin(a * 3) * 0.25, z); s.scale.setScalar(1.0 + (Math.random() < 0.1 ? 0.7 : 0)); });
      const pos = OTR.cable.geometry.attributes.position; for (let i = 0; i <= 36; i++){ const a = i / 36 * TAU; pos.setXYZ(i, O.x + Math.sin(a) * 4.2, 1.65 + Math.sin(a * 3) * 0.25 - 0.12 * Math.abs(Math.sin(a * 9)), O.z + Math.cos(a) * 4.2); } pos.needsUpdate = true; OTR.cable.visible = fin < 1;
      if (dt > 0 && fin < 1) for (let i = 0; i < 6; i++) pa(O.x + (Math.random() - 0.5) * 14, Math.random() * 3.5, O.z + (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 0.3, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * 0.3, Math.random() < 0.7 ? 0xe8d8d8 : 0xb08080, 0.16, 2.5, -0.05, 0.2, 0, SH7.dot);
      if (dt > 0 && fin < 1 && Math.random() < dt * 3) lightFlash(O.x + (Math.random() - 0.5) * 8, 4, O.z + (Math.random() - 0.5) * 8, 0xff2a2a, 3, 14);
      rayos.forEach((c, i) => { const vivo = fin < 1 && (Math.floor(t * 5 + i * 1.7) % 3 === 0); c.m.visible = vivo; if (!vivo) return; const a = (i / 4 + Math.floor(t * 5) * 0.37) * TAU, x = O.x + Math.sin(a) * 9, z = O.z + Math.cos(a) * 9;
        tintaPinta(c, rayoTiembla((s, v) => v.set(x + s * 3, 24 - s * 9, z - s * 2), 10, 0.8), 0, 1, q => 0.35); });
      if (t < 2.4 && t >= S.sig){ S.sig = t + 0.19; play(['otrDo', 'otrMi', 'otrSol', 'otrSi', 'otrDo2', 'otrSi', 'otrSol', 'otrMi'][S.nota++ % 8]); }
      // los enemigos se elevan retorciéndose…
      for (const L_ of S.lev){ const e = L_.e; if (!e.alive) continue; if (L_.fuerte){ if (!S.boom && dt > 0) e.g.position.x += Math.sin(t * 50) * 0.015; continue; }
        if (!S.boom){ L_.y = L_.alto * smooth(Math.min(1, t / 1.8)); e.g.rotation.y += L_.giro * dt; e.g.rotation.z = Math.sin(t * 7 + L_.giro) * 0.4; } }
      if (dt > 0 && !S.boom && Math.random() < 0.5) pa(H2.x + (Math.random() - 0.5) * 0.6, 1.6 + Math.random() * 0.4, H2.z + (Math.random() - 0.5) * 0.6, 0, 1, 0, 0xff2a2a, 0.08, 0.4, 0, 0, 0, SH7.dot);
      // …y caen estampados
      if (!S.boom && t >= 2.4){ S.boom = true; flash('#ff2a2a', 0.5); shake = Math.max(shake, 1.1); hitStop = Math.max(hitStop, 0.1); lightFlash(O.x, 2, O.z, 0xff3a3a, 4, 16); play('otrBoom');
        ringFx(O.x, O.z, 0xff3a3a, 0.5, 12, 0.6); ringFx(O.x, O.z, 0xffffff, 0.3, 7, 0.4, 0.3);
        for (const L_ of S.lev){ const e = L_.e; L_.boom = true; L_.vy = -14; e.g.rotation.z = 0; if (!e.alive) continue; const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.3, Math.hypot(dx, dz));
          foilGolpea(e, rdmg(L_.fuerte ? 115 : 100), dx / d, dz / d, L_.fuerte ? 5 : 10, null, 2); } }
      if (S.boom) for (const L_ of S.lev){ if (L_.fuerte || L_.cayo) continue; L_.vy -= 30 * dt; L_.y = Math.max(0, (L_.y || 0) + L_.vy * dt); if (L_.y <= 0){ L_.cayo = true; if (L_.e.otrLev === L_) L_.e.otrLev = null; puffAt(L_.e.g.position.x, L_.e.g.position.z, 6, 1.2, 0x6a5050); shake = Math.max(shake, 0.25); } }
      return t < 3.9; },
    fin(){ otrCierra(S); } });
  return true;
}
function otrCierra(S){
  if (OTR.on === S) OTR.on = null; if (OTR.niebla != null){ shared.uFogCol.value.setHex(OTR.niebla); OTR.niebla = null; }
  if (OTR.capa) OTR.capa.style.opacity = '0'; if (OTR.luces) OTR.luces.forEach(s => { s.visible = false; }); if (OTR.cable) OTR.cable.visible = false;
  for (const L_ of S.lev) if (L_.e.otrLev === L_){ L_.e.otrLev = null; L_.e.g.position.y = 0; L_.e.g.rotation.z = 0; }
}
const otr_updateEnemy = updateEnemy;
updateEnemy = function(e, dt){ const L_ = e.otrLev; if (L_ && e.alive && e.dying <= 0){ e.vx = e.vz = 0; if (e.flash > 0) e.flash -= dt; if (e.tele) e.tele.visible = false; applyFlash(e); e.g.position.y = L_.y || 0; return; } otr_updateEnemy(e, dt); };
const otrNota = n => () => { tone({ type: 'sawtooth', f0: NOTE(n), dur: 0.22, vol: 0.05, rv: 0.6 }); tone({ type: 'square', f0: NOTE(n) * 1.005, dur: 0.2, vol: 0.025, rv: 0.6 }); };
Object.assign(SFX, {
  otrDo: otrNota(60), otrMi: otrNota(64), otrSol: otrNota(67), otrSi: otrNota(71), otrDo2: otrNota(72),
  otrAbre: () => { tone({ type: 'sine', f0: 40, f1: 55, dur: 2.4, vol: 0.4, attack: 0.5, rv: 0.6 }); noise({ dur: 2.2, vol: 0.12, f0: 200, f1: 900, type: 'bandpass', q: 3, attack: 1, rv: 0.6 }); },
  otrBoom: () => { tone({ type: 'sine', f0: 90, f1: 20, dur: 1.4, vol: 0.9, rv: 0.8 }); noise({ dur: 1.2, vol: 0.5, f0: 2000, f1: 80, type: 'lowpass', rv: 0.8 }); }
});
foilPoder({ id: 'foilOtroLado', ic: '🎄', name: 'El otro lado', tags: ['otaku'],
  desc: 'Cada golpe que recibes te carga. Al cuarto se abre el otro lado: las luces de colores parpadean, el cielo se tiñe de rojo con relámpagos y flota ceniza; los enemigos se elevan retorciéndose y caen estampados contra el suelo.',
  herido(){ if (!OTR.on && player.inv <= 0 && !player.dead){ OTR.carga = Math.min(4, OTR.carga + 1); if (OTR.carga >= 4) try { otrAbre(); } catch (err) { console.error(err); } } return null; },
  pose(){ if (!OTR.on) return; for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', 1.3 * s, 0.6); bl(A.sh.rotation, 'x', -0.6, 0.6); } bl(P.neck.rotation, 'x', -0.25, 0.6); },
  reset(){ OTR.carga = 0; }, limpia(m){ if (OTR.on) otrCierra(OTR.on); if (m === 'titulo' || m === 'partida') OTR.carga = 0; } });

/* ======================================================================
   LA ROCA (ind)
   ====================================================================== */
const IND = { roca: null, on: null };
function indRoca(){
  if (IND.roca) return IND.roca;
  const geo = new THREE.IcosahedronGeometry(1.7, 1), p = geo.attributes.position, R = mulberry32(1981), mapa = new Map();
  for (let i = 0; i < p.count; i++){ const k = p.getX(i).toFixed(3) + ',' + p.getY(i).toFixed(3) + ',' + p.getZ(i).toFixed(3); if (!mapa.has(k)) mapa.set(k, 0.88 + R() * 0.2); const s = mapa.get(k); p.setXYZ(i, p.getX(i) * s, p.getY(i) * s, p.getZ(i) * s); }
  geo.computeVertexNormals();
  const g = new THREE.Group(), m = new THREE.Mesh(geo, makeMat(0x8a7a64, { emissive: 0.1 })); g.add(m);
  const R2 = mulberry32(1982), oscura = makeMat(0x5a4c3e, { emissive: 0.05 });
  for (let i = 0; i < 9; i++){ const a = R2() * TAU, b = (R2() - 0.5) * Math.PI, d = new V3(Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)), q = mesh(new THREE.DodecahedronGeometry(0.35 + R2() * 0.3, 0), oscura, d.x * 1.55, d.y * 1.55, d.z * 1.55, m); q.rotation.set(R2() * 3, R2() * 3, 0); }
  g.userData.giro = m; g.visible = false; scene.add(g); return (IND.roca = g);
}
function indLanza(){
  if (IND.on || !foilPuede() || !foilEscenario()) return; const r = indRoca(), H = hero.position;
  // cruza la imagen de lado (perpendicular a la cámara), por donde están los enemigos, como en la peli
  const e0 = xtrGrupo(H, 12), C0 = e0 ? e0.g.position : H, lado = xtrV.set(camera.position.z - H.z, 0, H.x - camera.position.x).normalize(), sg = Math.random() < 0.5 ? 1 : -1, dx = lado.x * sg, dz = lado.z * sg;
  const S = IND.on = { t: 0, x: C0.x - dx * 7, z: C0.z - dz * 7, vx: dx * 9, vz: dz * 9, ya: new Set(), rebotes: 0 }; play('indRetumba');
  foilFx.push({ t: 0, tic: 0, upd(dt){ const t = this.t;
      // 1. retumba y cae polvo
      if (t < 0.7){ shake = Math.max(shake, 0.25); if (dt > 0) for (let i = 0; i < 3; i++) pa(H.x + (Math.random() - 0.5) * 8, 6 + Math.random() * 3, H.z + (Math.random() - 0.5) * 8, 0, -3, 0, 0xb8a888, 0.18, 0.9, 4, 0, 0, SH7.dot); r.visible = false; return true; }
      // 2. cae detrás y echa a rodar
      r.visible = true; const k = t - 0.7;
      if (k < 0.35){ r.position.set(S.x, lerp(12, 1.7, (k / 0.35) * (k / 0.35)), S.z); if (k + dt >= 0.35 && !S.cayo){ S.cayo = true; shake = Math.max(shake, 0.7); puffAt(S.x, S.z, 14, 2, 0xb8a888); ringFx(S.x, S.z, 0xd8c8a8, 0.4, 3.5, 0.4); play('indCae'); } return true; }
      if (dt > 0){ S.x += S.vx * dt; S.z += S.vz * dt; const d = Math.hypot(S.x, S.z), lim = ARENA - 1.6;
        if (d > lim && S.rebotes < 1){ const nx = S.x / d, nz = S.z / d, dot = S.vx * nx + S.vz * nz; if (dot > 0){ S.vx -= 2 * dot * nx; S.vz -= 2 * dot * nz; S.rebotes++; shake = Math.max(shake, 0.6); play('indCae'); puffAt(S.x, S.z, 10, 1.5, 0xb8a888); } } }
      r.position.set(S.x, 1.7 + Math.abs(Math.sin(t * 9)) * 0.08, S.z); const sp = Math.hypot(S.vx, S.vz); xtrQ.setFromAxisAngle(xtrU.set(S.vz / sp, 0, -S.vx / sp), sp * dt / 1.7); r.userData.giro.quaternion.premultiply(xtrQ);
      if (dt > 0 && Math.random() < 0.6) puffAt(S.x - S.vx / sp * 1.4, S.z - S.vz / sp * 1.4, 1, 0.8, 0xb8a888);
      if ((this.tic -= dt) <= 0){ this.tic = 0.28; play('indRueda'); shake = Math.max(shake, 0.15); }
      for (const e of foilEnemigos(r.position, 2.1)){ if (S.ya.has(e)) continue; S.ya.add(e); const ex = e.g.position.x - S.x, ez = e.g.position.z - S.z, l = Math.max(0.01, Math.hypot(ex, ez)); foilGolpea(e, rdmg(95), ex / l, ez / l, 12, null, 2); sparks(e.g.position.x, 1, e.g.position.z, 8, 0xd8c8a8, 5); }
      // 3. se hace pedazos
      if (k > 3.2){ shake = Math.max(shake, 0.6); burst7(PA7, S.x, 1.5, S.z, 30, [0x8a7a64, 0x5a4c3e, 0xb8a888], 9, 0.35, 0.9, 16, 1, 0, SH7.sq, 4); puffAt(S.x, S.z, 18, 2.4, 0xb8a888); ringFx(S.x, S.z, 0xd8c8a8, 0.3, 3.5, 0.4); play('indRompe'); return false; }
      return true; },
    fin(){ if (IND.roca) IND.roca.visible = false; IND.on = null; } });
}
const ind_releaseCharge = releaseCharge;
releaseCharge = function(){ const lv = chargeLvl; ind_releaseCharge(); try { if (lv === 2 && lvl('foilRoca') && gameState === 'play') indLanza(); } catch (err) { console.error(err); } };
Object.assign(SFX, {
  indRetumba: () => { noise({ dur: 0.9, vol: 0.35, f0: 180, type: 'lowpass', attack: 0.2, rv: 0.4 }); tone({ type: 'sine', f0: 45, f1: 35, dur: 0.9, vol: 0.4 }); },
  indCae: () => { tone({ type: 'sine', f0: 70, f1: 25, dur: 0.5, vol: 0.7, rv: 0.4 }); noise({ dur: 0.4, vol: 0.4, f0: 700, f1: 100, type: 'lowpass', rv: 0.4 }); },
  indRueda: () => { noise({ dur: 0.3, vol: 0.18, f0: 220, type: 'lowpass' }); tone({ type: 'sine', f0: 50, dur: 0.25, vol: 0.18 }); },
  indRompe: () => { noise({ dur: 0.8, vol: 0.5, f0: 1500, f1: 150, type: 'lowpass', rv: 0.5 }); tone({ type: 'sine', f0: 80, f1: 30, dur: 0.6, vol: 0.5 }); }
});
foilPoder({ id: 'foilRoca', ic: '🪨', name: 'La roca', tags: ['otaku'],
  desc: 'Al soltar el ataque cargado a tope, el suelo retumba, cae polvo y una roca gigante aparece rodando detrás de ti: arrolla todo lo que pilla, rebota en el borde y se hace pedazos.',
  limpia(){ if (IND.roca) IND.roca.visible = false; IND.on = null; } });

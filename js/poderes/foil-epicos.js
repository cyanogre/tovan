'use strict';
/* ======================================================================
   PODERES FOIL · ÉPICOS (cuatro más, sobre js/poderes/foil-nucleo.js)
   Ninguno pone texto en pantalla. Cada uno con su prefijo:
     · Mil cerezos (de una de segadores de almas) · sbz. Al soltar el
       ataque cargado a tope, el arma se deshace en cientos de cuchillas
       rosas: salen en surtidor, forman ríos que serpentean entre los
       enemigos cortando todo lo que tocan y al final se cierran en una
       esfera sobre el más duro, que revienta; los pétalos caen despacio.
     · Puerta del tesoro (de una de reyes de héroes) · gob. Cada 30 de
       combo se abren en abanico, detrás de Tovan, portales dorados con
       ondas, asoman espadas, lanzas y hachas y salen en ráfaga contra los
       enemigos; se quedan clavadas en el suelo y se deshacen en oro.
     · Destello negro (de una de hechiceros con venda) · kok. A veces, al
       acertar un golpe cuerpo a cuerpo, el espacio se dobla: la imagen se
       invierte un instante, rayos negros con borde rojo salen del golpe y
       hace 2,5 veces el daño. Tras uno, 6 s «en la zona» (salen más).
     · ¡Estallido! (de una de un chaval con poderes que no se enfada) · psy.
       Cada golpe que te dan sube su emoción (se ve en el aura, no en un
       número); a la cuarta, todo flota: enemigos y piedras suben girando,
       Tovan brilla en blanco y arcoíris, una columna de luz y una onda los
       lanzan por los aires y caen de golpe.
   Lo pintado al cargar usa mulberry32 (nada de rnd() al cargar); lo que va
   por el mundo pasa por foilFx o se recoge en limpia().
   ====================================================================== */

/* ======================================================================
   MIL CEREZOS (sbz)
   ====================================================================== */
const SBZ_N = 840, SBZ_RIOS = 4, SBZ_T = { sale: 0.55, rios: 3.4, cierra: 4.1, cae: 6 };
// las cuchillas: puntos con forma de rombo, rosa y blanco, que destellan al girar
const SBZ_VS = `
attribute float aSeed; attribute float aA; uniform float uT; uniform float uPx; varying float vG; varying float vA; varying float vS;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
  vS = aSeed; vA = aA; vG = pow(max(0.0, sin(uT * 9.0 + aSeed * 37.0)), 6.0);
  gl_PointSize = uPx * (0.9 + 0.5 * fract(aSeed * 7.3)) / max(0.5, -mv.z); }`;
const SBZ_FS = `
varying float vG; varying float vA; varying float vS;
void main(){ vec2 p = gl_PointCoord - 0.5; float a = fract(vS * 5.1) * 3.1416; vec2 q = vec2(cos(a) * p.x - sin(a) * p.y, sin(a) * p.x + cos(a) * p.y);
  if (abs(q.x) * 2.6 + abs(q.y) > 0.5) discard;
  vec3 col = mix(vec3(1.0, 0.55, 0.75), vec3(1.0, 0.86, 0.92), fract(vS * 13.7)); col = mix(col, vec3(1.0), vG);
  gl_FragColor = vec4(col * (1.0 + vG), vA); }`;
const SBZ = { pts: null, pos: null, al: null, on: null, mat: null };
function sbzConstruye(){
  if (SBZ.pts) return;
  const R = mulberry32(9101), geo = new THREE.BufferGeometry(); SBZ.pos = new Float32Array(SBZ_N * 3); SBZ.al = new Float32Array(SBZ_N);
  const seed = new Float32Array(SBZ_N); for (let i = 0; i < SBZ_N; i++) seed[i] = R();
  geo.setAttribute('position', new THREE.BufferAttribute(SBZ.pos, 3).setUsage(THREE.DynamicDrawUsage)); geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aA', new THREE.BufferAttribute(SBZ.al, 1).setUsage(THREE.DynamicDrawUsage));
  SBZ.mat = new THREE.ShaderMaterial({ vertexShader: SBZ_VS, fragmentShader: SBZ_FS, uniforms: { uT: { value: 0 }, uPx: { value: 90 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  SBZ.pts = new THREE.Points(geo, SBZ.mat); SBZ.pts.frustumCulled = false; SBZ.pts.visible = false; SBZ.pts.renderOrder = 6; scene.add(SBZ.pts);
  SBZ.prm = Array.from({ length: SBZ_N }, () => ({ rio: Math.floor(R() * SBZ_RIOS), u: R(), r: 0.15 + R() * 0.75, a: R() * TAU, w: (R() < 0.5 ? -1 : 1) * (3 + R() * 5), vx: 0, vy: 0, vz: 0, x: 0, y: 0, z: 0, fall: R() }));
}
const sbzFuera = () => !SBZ.on;
function sbzLanza(){
  if (SBZ.on || !foilPuede() || !foilEscenario()) return false;
  sbzConstruye(); const H = hero.position, O = new V3(H.x, 1.2, H.z);
  const rios = Array.from({ length: SBZ_RIOS }, (_, i) => ({ h: O.clone(), v: new V3(Math.sin(i / SBZ_RIOS * TAU) * 6, 7, Math.cos(i / SBZ_RIOS * TAU) * 6), tr: [], tgt: null, toques: new Map() }));
  const L = { t: 0, O, rios, fin: null, golpe: false, cae: false };
  SBZ.on = L; SBZ.pts.visible = true;
  SBZ.prm.forEach((p, i) => { p.x = O.x; p.y = O.y; p.z = O.z; const a = (i / SBZ_N) * TAU * 7, s = 3 + p.u * 6; p.vx = Math.cos(a) * s * 0.6; p.vy = 6 + p.u * 8; p.vz = Math.sin(a) * s * 0.6; });
  play('sbzSuelta'); flash('#ffd0e4', 0.25); ringFx(O.x, O.z, 0xffa8cc, 0.3, 3.5, 0.45);
  foilFx.push({ t: 0, upd(dt){ return sbzTick(L, dt); }, fin(){ if (SBZ.on === L){ SBZ.on = null; SBZ.pts.visible = false; } } });
  return true;
}
function sbzTick(L, dt){
  if (SBZ.on !== L) return false;
  L.t += dt; const t = L.t; SBZ.mat.uniforms.uT.value += dt;
  SBZ.mat.uniforms.uPx.value = 70 * Math.min(1.6, innerHeight / 720) * (innerWidth < innerHeight ? 1.2 : 1);
  // los ríos: cada cabeza persigue a un enemigo, serpenteando; la cola guarda por dónde ha pasado
  if (t > SBZ_T.sale * 0.6 && t < SBZ_T.rios) L.rios.forEach((Ri, i) => {
    if (!Ri.tgt || !Ri.tgt.alive || (Ri.cambio = (Ri.cambio || 0) - dt) <= 0){ Ri.cambio = 0.7 + rnd() * 0.5;
      const vivos = foilEnemigos(hero.position, 14); Ri.tgt = vivos.length ? vivos[(i + Math.floor(t * 2)) % vivos.length] : null; }
    const T = Ri.tgt ? xtrV.set(Ri.tgt.g.position.x, 0.9 * Ri.tgt.scale, Ri.tgt.g.position.z) : xtrV.set(hero.position.x + Math.sin(t * 2 + i * 1.6) * 4, 2 + Math.sin(t * 3 + i), hero.position.z + Math.cos(t * 2 + i * 1.6) * 4);
    const ax = T.x - Ri.h.x, ay = T.y - Ri.h.y, az = T.z - Ri.h.z, d = Math.max(0.01, Math.hypot(ax, ay, az));
    Ri.v.x += (ax / d * 70 + Math.sin(t * 7 + i) * 30) * dt; Ri.v.y += (ay / d * 70 + Math.cos(t * 6 + i * 2) * 18) * dt; Ri.v.z += (az / d * 70 + Math.cos(t * 7.5 + i) * 30) * dt;
    const sp = Math.hypot(Ri.v.x, Ri.v.y, Ri.v.z), mx = 15; if (sp > mx) Ri.v.multiplyScalar(mx / sp);
    Ri.h.addScaledVector(Ri.v, dt); Ri.h.y = clamp(Ri.h.y, 0.35, 6);
    Ri.tr.unshift(Ri.h.clone()); if (Ri.tr.length > 34) Ri.tr.pop();
    if (dt > 0) for (const e of foilEnemigos(Ri.h, 1.3)){ const u = Ri.toques.get(e) || -9; if (t - u < 0.14) continue; Ri.toques.set(e, t);   // corta lo que toca
      const nx = e.g.position.x - Ri.h.x, nz = e.g.position.z - Ri.h.z, dd = Math.max(0.01, Math.hypot(nx, nz)); foilGolpea(e, rdmg(9), nx / dd, nz / dd, 0.6, null, 0.6);
      if (rnd() < 0.5) sparks(e.g.position.x, 0.9 * e.scale, e.g.position.z, 3, 0xffb0d0, 2.5); }
  });
  // el cierre: todas a una esfera sobre el más duro, que se encoge y revienta
  if (!L.fin && t >= SBZ_T.rios){ const e = foilEnemigos(hero.position, 14).sort((a, b) => b.hp - a.hp)[0]; L.fin = e ? new V3(e.g.position.x, 1 * e.scale, e.g.position.z) : new V3(hero.position.x + Math.sin(heading) * 3, 1.2, hero.position.z + Math.cos(heading) * 3); L.fe = e; play('sbzCierra'); }
  if (L.fin && !L.golpe && t >= SBZ_T.cierra){ L.golpe = true; const F = L.fin;
    xtrArea(F, 3.6, e => rdmg(e === L.fe ? 140 : 70), 9, null, 1.6); ringFx(F.x, F.z, 0xffc0dc, 0.4, 5, 0.5); ringFx(F.x, F.z, 0xffffff, 0.3, 3, 0.35, 0.4);
    flash('#ffe0ee', 0.45); shake = Math.max(shake, 0.8); hitStop = Math.max(hitStop, 0.08); lightFlash(F.x, F.y, F.z, 0xff9ac8, 3.5, 12); play('sbzRevienta');
    SBZ.prm.forEach(p => { const a = rnd() * TAU, b = rnd() * 2 - 1, s = 6 + rnd() * 10; p.vx = Math.cos(a) * Math.sqrt(1 - b * b) * s; p.vy = b * s + 4; p.vz = Math.sin(a) * Math.sqrt(1 - b * b) * s; }); }
  // cada cuchilla
  const P_ = SBZ.pos, A = SBZ.al, H = hero.position;
  SBZ.prm.forEach((p, i) => {
    if (t < SBZ_T.sale || L.golpe){ const drag = Math.exp(-dt * (L.golpe ? 2.2 : 1.2)); p.vx *= drag; p.vz *= drag; p.vy = p.vy * drag - (L.golpe ? 2.5 : 9) * dt;
      if (L.golpe && p.vy < -1.2){ p.vy = -1.2 + Math.sin(t * 3 + i) * 0.3; p.vx += Math.sin(t * 2 + i) * dt * 2; }   // pétalos que caen meciéndose
      p.x += p.vx * dt; p.y = Math.max(0.05, p.y + p.vy * dt); p.z += p.vz * dt; }
    else if (!L.fin || t < SBZ_T.cierra - 0.55){ const Ri = L.rios[p.rio], tr = Ri.tr; if (!tr.length) return;
      const k = Math.min(tr.length - 1, Math.floor(p.u * tr.length)), c = tr[k], n = tr[Math.max(0, k - 1)];
      const tx = n.x - c.x, tz = n.z - c.z, tl = Math.max(0.001, Math.hypot(tx, tz)), px = -tz / tl, pz = tx / tl;
      p.a += p.w * dt; const r = p.r * (0.6 + 0.4 * Math.sin(t * 3 + i)), ox = px * Math.cos(p.a) * r, oy = Math.sin(p.a) * r, oz = pz * Math.cos(p.a) * r;
      const kk = 1 - Math.exp(-dt * 14); p.x += (c.x + ox - p.x) * kk; p.y += (c.y + oy - p.y) * kk; p.z += (c.z + oz - p.z) * kk; }
    else { const F = L.fin, q = clamp((t - (SBZ_T.cierra - 0.55)) / 0.55, 0, 1), rr = lerp(3.2, 0.4, q * q), a = p.a + t * p.w * 0.6, b = (p.u - 0.5) * Math.PI;   // la esfera que se cierra
      const kk = 1 - Math.exp(-dt * 10); p.x += (F.x + Math.cos(a) * Math.cos(b) * rr - p.x) * kk; p.y += (F.y + Math.sin(b) * rr - p.y) * kk; p.z += (F.z + Math.sin(a) * Math.cos(b) * rr - p.z) * kk; }
    P_[i * 3] = p.x; P_[i * 3 + 1] = p.y; P_[i * 3 + 2] = p.z;
    A[i] = L.golpe ? Math.max(0, 1 - (t - SBZ_T.cierra) / (SBZ_T.cae - SBZ_T.cierra) * (0.6 + p.fall * 0.6)) : Math.min(1, t / 0.15);
  });
  SBZ.pts.geometry.attributes.position.needsUpdate = true; SBZ.pts.geometry.attributes.aA.needsUpdate = true;
  if (dt > 0 && t < SBZ_T.rios && (L.son = (L.son || 0) - dt) <= 0){ L.son = 0.35; play('sbzSuena'); }
  return t < SBZ_T.cae;
}
Object.assign(SFX, {
  sbzSuelta: () => { noise({ dur: 0.6, vol: 0.2, f0: 2500, f1: 7000, type: 'bandpass', q: 0.8, rv: 0.4 }); [88, 91, 95, 100].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.25, vol: 0.035, when: i * 0.04, rv: 0.8 })); },
  sbzSuena: () => { noise({ dur: 0.35, vol: 0.06, f0: 6000, f1: 3000, type: 'bandpass', q: 1.5, rv: 0.3 }); tone({ type: 'triangle', f0: NOTE(86 + Math.floor(Math.random() * 10)), dur: 0.12, vol: 0.02, rv: 0.6 }); },
  sbzCierra: () => { noise({ dur: 0.6, vol: 0.18, f0: 7000, f1: 1500, type: 'bandpass', q: 0.8, attack: 0.3, rv: 0.4 }); },
  sbzRevienta: () => { tone({ type: 'sine', f0: 90, f1: 30, dur: 0.8, vol: 0.6, rv: 0.5 }); noise({ dur: 0.5, vol: 0.35, f0: 5000, f1: 800, type: 'bandpass', rv: 0.5 }); [96, 100, 103].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.5, vol: 0.03, when: 0.05 + i * 0.05, rv: 0.9 })); }
});
const sbz_releaseCharge = releaseCharge;
releaseCharge = function(){ const lv = chargeLvl; sbz_releaseCharge(); try { if (lv === 2 && lvl('foilSakura') && gameState === 'play') sbzLanza(); } catch (err) { console.error(err); } };
foilPoder({ id: 'foilSakura', ic: '🌺', name: 'Mil cerezos', tags: ['otaku'],
  desc: 'Al soltar el ataque cargado a tope, tu arma se deshace en cientos de cuchillas de cerezo que serpentean entre los enemigos cortándolo todo y acaban cerrándose en una esfera sobre el más duro, que revienta.',
  limpia(){ if (SBZ.on){ SBZ.on = null; if (SBZ.pts) SBZ.pts.visible = false; } } });

/* ======================================================================
   PUERTA DEL TESORO (gob)
   ====================================================================== */
const GOB = { armas: [], portales: [], cada: 30 };
// portal: anillos dorados que ondulan sobre fondo oscuro (pintado al cargar)
const GOB_PORTAL = foilSprite(foilLienzo(128, 128, g => { const R = mulberry32(9201);
  const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.18, 'rgba(255,214,90,0.95)'); gr.addColorStop(0.5, 'rgba(255,170,30,0.45)'); gr.addColorStop(1, 'rgba(255,140,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  for (let k = 0; k < 6; k++){ g.beginPath(); for (let j = 0; j <= 48; j++){ const a = j / 48 * TAU, r = 16 + k * 8 + Math.sin(a * 6 + k + R() * 0.4) * 2.2; j ? g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r) : g.moveTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); }
    g.strokeStyle = `rgba(255,${230 - k * 14},${150 - k * 18},${0.9 - k * 0.12})`; g.lineWidth = 2; g.stroke(); } }), true);
let gobMats = null;
// tres armas (espada, lanza y hacha), fundidas por material, con la punta hacia +z
function gobArma(tipo){
  if (!gobMats) gobMats = { oro: makeMat(0xffc840, { emissive: 0.5 }), plata: makeMat(0xe8ecf4, { emissive: 0.35 }), rojo: makeMat(0xc82838, { emissive: 0.3 }), azul: makeMat(0x3a5ad8, { emissive: 0.3 }) };
  const { oro, plata, rojo, azul } = gobMats, src = new THREE.Group(), g = new THREE.Group();
  if (tipo === 0){ mesh(B(0.12, 0.03, 1.3), plata, 0, 0, 0.35, src); const p = mesh(new THREE.ConeGeometry(0.085, 0.3, 4), plata, 0, 0, 1.12, src); p.rotation.x = Math.PI / 2; p.scale.y = 1;
    mesh(B(0.5, 0.07, 0.08), oro, 0, 0, -0.32, src); mesh(B(0.06, 0.06, 0.4), rojo, 0, 0, -0.56, src); mesh(B(0.1, 0.1, 0.1), oro, 0, 0, -0.8, src); }
  else if (tipo === 1){ mesh(B(0.05, 0.05, 2.2), oro, 0, 0, -0.2, src); const p = mesh(new THREE.ConeGeometry(0.12, 0.55, 4), plata, 0, 0, 1.15, src); p.rotation.x = Math.PI / 2;
    mesh(B(0.3, 0.05, 0.06), azul, 0, 0, 0.82, src); }
  else { mesh(B(0.06, 0.06, 1.6), rojo, 0, 0, -0.1, src); mesh(B(0.04, 0.5, 0.4), plata, 0, 0.18, 0.55, src); mesh(B(0.045, 0.08, 0.42), oro, 0, -0.08, 0.55, src); mesh(B(0.1, 0.1, 0.1), oro, 0, 0, -0.9, src); }
  mpFusiona(src, g); g.visible = false; scene.add(g); return g;
}
function gobCoge(i){ let a = GOB.armas.find(q => !q.on); if (!a){ if (GOB.armas.length >= 36) return null; a = { g: gobArma(GOB.armas.length % 3), on: false }; GOB.armas.push(a); } a.on = true; return a; }
function gobPortal(){ let p = GOB.portales.find(q => !q.on); if (!p){ if (GOB.portales.length >= 16) return null; const s = new THREE.Sprite(GOB_PORTAL.clone()); s.renderOrder = 5; s.visible = false; scene.add(s); p = { s, on: false }; GOB.portales.push(p); } p.on = true; return p; }
function gobLanza(){
  if (!foilPuede() || !foilEscenario()) return;
  const L = foilEnemigos(hero.position, 16); if (!L.length) return;
  const H = hero.position, f0 = Math.atan2(H.x - camera.position.x, H.z - camera.position.z), n = 12;   // los portales, detrás de Tovan visto desde la cámara: entre él y la cámara tapaban
  play('gobAbre'); shake = Math.max(shake, 0.2);
  for (let i = 0; i < n; i++){
    const P = gobPortal(); if (!P) break; const lado = (i / (n - 1) - 0.5) * 2.4, alto = 1.8 + (i % 3) * 1.1 + Math.abs(lado) * 0.6;
    const pos = new V3(H.x - Math.sin(f0) * (-1.6) + Math.cos(f0) * lado * 2.4, alto, H.z - Math.cos(f0) * (-1.6) - Math.sin(f0) * lado * 2.4);
    const e = L[i % L.length], retraso = 0.1 + i * 0.07;
    const fx = { t: -i * 0.035, cintas: [], upd(dt){
        const t = this.t; if (t < 0){ P.s.visible = false; return true; }
        const ab = Math.min(1, t / 0.18), cierra = clamp((t - 1.6) / 0.25, 0, 1); P.s.visible = true; P.s.position.copy(pos); P.s.scale.setScalar(1.3 * ab * (1 - cierra) + 0.01); P.s.material.rotation += dt * 2; P.s.material.opacity = 0.95;
        for (let k = 0; k < 2; k++){ const A = this['a' + k] || (this['a' + k] = { arma: null, t0: retraso + k * 0.45, hecho: false });
          if (!A.arma && t >= A.t0 - 0.3 && !A.hecho){ A.arma = gobCoge(); if (A.arma){ A.arma.g.visible = true; A.de = pos.clone(); A.tg = e && e.alive ? new V3(e.g.position.x + (rnd() - 0.5) * 0.6, 0.15, e.g.position.z + (rnd() - 0.5) * 0.6) : new V3(H.x + Math.sin(f0) * 5, 0.1, H.z + Math.cos(f0) * 5); A.e = e; } }
          const W = A.arma; if (!W || A.hecho) continue; const g = W.g;
          if (t < A.t0){ const u = (t - (A.t0 - 0.3)) / 0.3; g.position.copy(A.de); g.lookAt(A.tg); g.position.addScaledVector(xtrV.subVectors(A.tg, A.de).normalize(), -1.4 * (1 - u)); g.scale.setScalar(1.1); }   // asoma por el portal
          else if (!A.clava){ const u = Math.min(1, (t - A.t0) / Math.max(0.08, A.de.distanceTo(A.tg) / 34)); g.position.lerpVectors(A.de, A.tg, u); g.lookAt(A.tg); if (u < 1 && dt > 0) streak7(g.position.x, g.position.y, g.position.z, A.de.x - A.tg.x, A.de.y - A.tg.y, A.de.z - A.tg.z, 1.8, 0xffe08a, 0.12, 0.05);
            if (u >= 1){ A.clava = t; g.position.copy(A.tg); play('gobClava'); puffAt(A.tg.x, A.tg.z, 3, 0.8, 0xd8c8a8); sparks(A.tg.x, 0.3, A.tg.z, 6, 0xffd060, 3);
              for (const q of foilEnemigos(A.tg, 1.4)){ const dx = q.g.position.x - A.tg.x, dz = q.g.position.z - A.tg.z, d = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(q, rdmg(26), dx / d, dz / d, 2.5, null, 1); } } }
          else { const u = (t - A.clava) / 1.1; if (u > 0.7 && dt > 0 && rnd() < 0.5) spawnFx(g.position.x, 0.4 + rnd() * 0.8, g.position.z, 0, 1.4, 0, 0xffd860, 0.06, 0.5, -1, 0);
            if (u >= 1){ A.hecho = true; g.visible = false; W.on = false; A.arma = null; } } }
        return t < 3.2; },
      fin(){ P.on = false; P.s.visible = false; for (let k = 0; k < 2; k++){ const A = this['a' + k]; if (A && A.arma){ A.arma.on = false; A.arma.g.visible = false; } } } };
    foilFx.push(fx);
  }
}
Object.assign(SFX, {
  gobAbre: () => { [76, 83, 88, 95].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.6, vol: 0.04, attack: 0.02, when: i * 0.03, rv: 0.9 })); noise({ dur: 0.5, vol: 0.12, f0: 3000, f1: 6000, type: 'bandpass', rv: 0.6 }); },
  gobClava: () => { tone({ type: 'square', f0: 1600, f1: 900, dur: 0.06, vol: 0.04, rv: 0.2 }); noise({ dur: 0.12, vol: 0.14, f0: 2500, f1: 600, type: 'bandpass', rv: 0.2 }); tone({ type: 'sine', f0: 140, f1: 60, dur: 0.15, vol: 0.15 }); }
});
const gob_addCombo = addCombo;
addCombo = function(){ gob_addCombo(); try { if (lvl('foilBabilonia') && combo > 0 && combo % GOB.cada === 0 && gameState === 'play') gobLanza(); } catch (err) { console.error(err); } };
foilPoder({ id: 'foilBabilonia', ic: '🗝️', name: 'Puerta del tesoro', tags: ['otaku'],
  desc: 'Cada 30 golpes de combo se abren detrás de ti portales dorados: asoman espadas, lanzas y hachas que salen en ráfaga contra los enemigos, se quedan clavadas en el suelo y se deshacen en oro.' });

/* ======================================================================
   DESTELLO NEGRO (kok)
   ====================================================================== */
const KOK = { cd: 0, zona: 0, el: null };
// rayo negro con borde rojo (normal: el aditivo no puede pintar de negro)
TRAZO_FS.kok = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
void main(){
  float u = vUV.x, a = abs(vUV.y);
  float core = 1.0 - smoothstep(0.25, 0.45, a), rim = smoothstep(0.35, 0.55, a) * (1.0 - smoothstep(0.75, 1.0, a));
  if (core + rim < 0.05) discard;
  vec3 col = mix(uB, uA, core); col = mix(col, uC, rim * (0.7 + 0.3 * sin(u * uLen * 8.0 - uTime * 40.0)));
  gl_FragColor = vec4(col, uAlpha * clamp(core + rim, 0.0, 1.0));
}`;
const KOK_RAYO = [0x050005, 0x1a0006, 0xff1a2a, 0];
function kokEl(){ if (KOK.el) return KOK.el; const el = document.createElement('div'); el.id = 'kokNeg'; el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:40;background:#fff;mix-blend-mode:difference;opacity:0'; document.body.appendChild(el); return (KOK.el = el); }
function kokNegativo(){ const el = kokEl(); el.style.opacity = '1'; el.style.background = '#fff'; setTimeout(() => { el.style.background = '#ff2030'; el.style.opacity = '0.45'; }, 70); setTimeout(() => { el.style.opacity = '0'; }, 170); }
function kokDestello(e){
  const x = e.g.position.x, y = 0.9 * e.scale, z = e.g.position.z;
  KOK.cd = 0.6; KOK.zona = 6; hitStop = Math.max(hitStop, 0.16); shake = Math.max(shake, 0.7); kokNegativo(); play('kokDestello'); lightFlash(x, y, z, 0xff2030, 3, 10);
  const cintas = [], rutas = [];
  for (let i = 0; i < 7; i++){ const a = i / 7 * TAU + rnd() * 0.5, el = (rnd() - 0.3) * 1.2, L = 1.6 + rnd() * 2.2, dir = new V3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)), O = new V3(x, y, z);
    cintas.push(tintaCoge(KOK_RAYO, 0, 'kok')); rutas.push(rayoTiembla((s, v) => v.copy(O).addScaledVector(dir, s * L), 8, 0.28)); }
  ringFx(x, z, 0x1a0006, 0.3, 3.2, 0.3, y); ringFx(x, z, 0xff2030, 0.2, 2.4, 0.25, y + 0.05);
  for (let i = 0; i < 16; i++){ const a = rnd() * TAU; pn(x, y, z, Math.cos(a) * 6, (rnd() - 0.3) * 5, Math.sin(a) * 6, rnd() < 0.5 ? 0x100008 : 0xff2a3a, 0.12, 0.35, 0, 3, 0, SH7.dot, 1); }
  foilFx.push({ t: 0, cintas, upd(){ const k = this.t / 0.4; if (k >= 1) return false;
      cintas.forEach((c, i) => { tintaPinta(c, rutas[i], 0, Math.min(1, this.t / 0.05), q => 0.32 * (1 - q * 0.6)); c.mat.uniforms.uAlpha.value = 1 - k * k; }); return true; } });
}
Object.assign(SFX, {
  kokDestello: () => { tone({ type: 'sine', f0: 60, f1: 25, dur: 0.7, vol: 0.8, rv: 0.5 }); noise({ dur: 0.08, vol: 0.5, f0: 5000, type: 'highpass', rv: 0.2 }); tone({ type: 'sawtooth', f0: 1200, f1: 80, dur: 0.25, vol: 0.08, when: 0.02 }); noise({ dur: 0.5, vol: 0.2, f0: 300, f1: 2500, type: 'bandpass', attack: 0.3, when: 0.15, rv: 0.4 }); }
});
foilPoder({ id: 'foilKokusen', ic: '⚫', name: 'Destello negro', tags: ['otaku'],
  desc: 'A veces, al acertar un golpe cuerpo a cuerpo, el espacio se dobla: la imagen se invierte un instante, salen rayos negros del golpe y hace 2,5 veces el daño. Después de uno estás en la zona 6 s y salen más a menudo.',
  dano(e, val, o, crit, melee){ if (!melee || KOK.cd > 0 || !e.alive || e.spawnT > 0 || gameState !== 'play') return val;
    if (rnd() < (KOK.zona > 0 ? 0.16 : 0.06)){ try { kokDestello(e); } catch (err) { console.error(err); } return val * 2.5; } return val; },
  tick(dt){ if (KOK.cd > 0) KOK.cd -= dt; if (KOK.zona > 0) KOK.zona -= dt; }, reset(){ KOK.cd = 0; KOK.zona = 0; }, limpia(){ if (KOK.el) KOK.el.style.opacity = '0'; } });

/* ======================================================================
   ¡ESTALLIDO! (psy)
   ====================================================================== */
const PSY = { emo: 0, on: null, aura: null };
const PSY_AURA = foilSprite(foilLienzo(128, 128, g => { const gr = g.createRadialGradient(64, 64, 8, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }), true);
let psyRocas = null;
function psyConstruye(){
  if (psyRocas) return; const mat = makeMat(0x8a8078, { emissive: 0.12 }), R = mulberry32(9301);
  psyRocas = Array.from({ length: 18 }, () => { const m = mesh(new THREE.DodecahedronGeometry(0.15 + R() * 0.25, 0), mat, 0, -5, 0); m.visible = false; return { m, v: new V3(), w: new V3(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(6) }; });
  PSY.aura = new THREE.Sprite(PSY_AURA.clone()); PSY.aura.visible = false; PSY.aura.renderOrder = 6; scene.add(PSY.aura);
  PSY.col = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.6, 40, 20, 1, true), new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uA; uniform float uT; varying vec2 vU; vec3 hsv(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); } void main(){ float k = pow(1.0 - vU.y, 0.7); vec3 c = mix(vec3(1.0), hsv(fract(vU.x * 2.0 + vU.y * 3.0 - uT)), 0.35); gl_FragColor = vec4(c * k * uA, 1.0); }',
    uniforms: { uA: { value: 0 }, uT: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  PSY.col.visible = false; PSY.col.frustumCulled = false; scene.add(PSY.col);
}
// el aura que crece con la emoción (sin números): unas volutas blancas que suben
function psyAuraTick(dt){
  if (!PSY.emo || PSY.on || dt <= 0 || player.dead) return; const H = hero.position, k = PSY.emo;
  if (rnd() < k * 1.2){ const a = rnd() * TAU; pn(H.x + Math.cos(a) * 0.4, H.y + 0.2 + rnd() * 1.4, H.z + Math.sin(a) * 0.4, 0, 1 + k * 2, 0, k > 0.6 ? xtrHsv(rnd()) : 0xffffff, 0.08 + k * 0.08, 0.6, -0.5, 1, 0.3, SH7.dot, 0.35 + k * 0.4); }
}
function psyEstalla(){
  if (PSY.on || !foilPuede() || !foilEscenario()) return false;
  psyConstruye(); PSY.emo = 0; const H = hero.position, O = new V3(H.x, 0, H.z);
  const lev = foilEnemigos(O, 13).map(e => ({ e, y0: 0, alto: 1.6 + rnd() * 2.2, giro: (rnd() - 0.5) * 6, fuerte: strFuerte(e) }));
  for (const L_ of lev) if (!L_.fuerte) L_.e.psyLev = L_;
  psyRocas.forEach(r => { const a = rnd() * TAU, d = 1.5 + rnd() * 7; r.m.position.set(O.x + Math.cos(a) * d, 0.1, O.z + Math.sin(a) * d); r.m.visible = true; r.v.set(0, 0.6 + rnd() * 1.2, 0); });
  const S = PSY.on = { t: 0, O, lev, boom: false };
  play('psySube'); player.inv = Math.max(player.inv, 3.2);
  foilFx.push({ t: 0, upd(dt){ return psyTick(S, dt); }, fin(){ psyFin(S); } });
  return true;
}
function psyTick(S, dt){
  if (PSY.on !== S) return false; S.t += dt; const t = S.t, O = S.O, H = hero.position;
  PSY.aura.visible = true; PSY.aura.position.set(H.x, H.y + 1, H.z); PSY.aura.scale.setScalar((t < 0.9 ? 1.5 + t * 3 : Math.max(0.01, 4.2 - (t - 0.9) * 3)) * (1 + Math.sin(t * 40) * 0.05));
  PSY.aura.material.color.setHex(xtrHsv(t * 0.8)); PSY.aura.material.opacity = 0.9;
  if (dt > 0) for (let i = 0; i < 4; i++){ const a = rnd() * TAU, r = 0.4 + rnd() * 0.6; pn(H.x + Math.cos(a) * r, H.y + rnd() * 1.8, H.z + Math.sin(a) * r, Math.cos(a) * 0.5, 2 + rnd() * 3, Math.sin(a) * 0.5, rnd() < 0.5 ? 0xffffff : xtrHsv(rnd()), 0.14, 0.6, -1, 1, 0.3, SH7.dot, 0.8); }
  // 1. todo flota
  for (const L_ of S.lev){ const e = L_.e; if (!e.alive){ continue; }
    if (L_.fuerte){ if (t < 0.9 && dt > 0) e.g.position.x += Math.sin(t * 60) * 0.02; continue; }
    if (!S.boom){ const k = smooth(Math.min(1, t / 0.9)); L_.y = L_.alto * k; e.g.rotation.y += L_.giro * dt; } }
  psyRocas.forEach(r => { if (!r.m.visible) return; if (!S.boom){ r.m.position.y += r.v.y * dt; r.m.rotation.x += r.w.x * dt * 0.3; r.m.rotation.z += r.w.z * dt * 0.3; }
    else { r.v.y -= 14 * dt; r.m.position.addScaledVector(r.v, dt); r.m.rotation.x += r.w.x * dt; if (r.m.position.y < -1) r.m.visible = false; } });
  if (!S.boom && t < 0.9 && dt > 0 && rnd() < 0.6) puffAt(O.x + (rnd() - 0.5) * 6, O.z + (rnd() - 0.5) * 6, 1, 0.4, 0xd8d0c8);
  // 2. ¡estalla!
  if (!S.boom && t >= 0.9){ S.boom = true; flash('#ffffff', 0.85); shake = Math.max(shake, 1.2); hitStop = Math.max(hitStop, 0.12); lightFlash(O.x, 2, O.z, 0xffffff, 4, 20); play('psyBoom');
    ringFx(O.x, O.z, 0xffffff, 0.5, 14, 0.6); ringFx(O.x, O.z, 0xffe0ff, 0.3, 9, 0.45, 0.3);
    ring7(PN7, O.x, 0.3, O.z, 40, [0xff6a8a, 0xffd04a, 0x6aff8a, 0x6ac8ff, 0xc86aff, 0xffffff], 14, 0.2, 0.8, 0, 2, 0, SH7.star, 4);
    for (const L_ of S.lev){ const e = L_.e; L_.boom = true; if (!e.alive) continue; const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.3, Math.hypot(dx, dz));
      foilGolpea(e, rdmg(L_.fuerte ? 110 : 95), dx / d, dz / d, L_.fuerte ? 6 : 14, null, 2); }
    psyRocas.forEach(r => { const dx = r.m.position.x - O.x, dz = r.m.position.z - O.z, d = Math.max(0.3, Math.hypot(dx, dz)); r.v.set(dx / d * (10 + rnd() * 8), 4 + rnd() * 6, dz / d * (10 + rnd() * 8)); });
    PSY.col.visible = true; }
  if (S.boom){ const u = clamp((t - 0.9) / 0.9, 0, 1); PSY.col.position.set(O.x, 20, O.z); PSY.col.scale.set(1 + u * 1.5, 1, 1 + u * 1.5); PSY.col.material.uniforms.uA.value = (1 - u) * 1.4; PSY.col.material.uniforms.uT.value += dt * 2; if (u >= 1) PSY.col.visible = false;
    // 3. caen de golpe
    for (const L_ of S.lev){ if (L_.fuerte || L_.cayo) continue; const e = L_.e; L_.vy = (L_.vy == null ? 6 : L_.vy) - 30 * dt; L_.y = Math.max(0, L_.y + L_.vy * dt);
      if (L_.y <= 0){ L_.cayo = true; if (e.psyLev === L_) e.psyLev = null; if (e.alive || e.dying > 0){ puffAt(e.g.position.x, e.g.position.z, 5, 1.2); shake = Math.max(shake, 0.2); } } } }
  return t < 2.6;
}
function psyFin(S){
  if (PSY.on === S) PSY.on = null; if (PSY.aura) PSY.aura.visible = false; if (PSY.col) PSY.col.visible = false;
  for (const L_ of S.lev) if (L_.e.psyLev === L_){ L_.e.psyLev = null; L_.e.g.position.y = 0; }
  if (psyRocas) psyRocas.forEach(r => { r.m.visible = false; });
}
// los que flotan no piensan; su altura la pone el estallido (después de moverse, para que no la pise la IA)
const psy_updateEnemy = updateEnemy;
updateEnemy = function(e, dt){ const L_ = e.psyLev; if (L_ && e.alive && e.dying <= 0){ if (L_.boom){ e.g.position.x += e.vx * dt; e.g.position.z += e.vz * dt; const kd = Math.exp(-dt * 3); e.vx *= kd; e.vz *= kd; clampArena(e.g.position, ARENA - 0.4); } else e.vx = e.vz = 0; if (e.flash > 0) e.flash -= dt; if (e.tele) e.tele.visible = false; applyFlash(e); e.g.position.y = L_.y || 0; return; } psy_updateEnemy(e, dt); if (L_) e.g.position.y = L_.y || 0; };
Object.assign(SFX, {
  psySube: () => { tone({ type: 'sine', f0: 80, f1: 320, dur: 0.95, vol: 0.3, attack: 0.3, rv: 0.6 }); noise({ dur: 0.95, vol: 0.18, f0: 400, f1: 4000, type: 'bandpass', q: 0.8, attack: 0.5, rv: 0.6 }); [60, 67, 72, 79].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.9, vol: 0.03, attack: 0.4, when: i * 0.08, rv: 0.8 })); },
  psyBoom: () => { tone({ type: 'sine', f0: 70, f1: 18, dur: 1.6, vol: 1, rv: 0.8 }); noise({ dur: 1.3, vol: 0.6, f0: 2000, f1: 80, type: 'lowpass', rv: 0.8 }); noise({ dur: 0.2, vol: 0.5, f0: 7000, type: 'highpass', rv: 0.5 }); }
});
foilPoder({ id: 'foilEstallido', ic: '💥', name: '¡Estallido!', tags: ['otaku'],
  desc: 'Cada golpe que recibes te enfada un poco más (se nota en el aura). Al cuarto, todo flota: enemigos y piedras suben girando, brillas en blanco y arcoíris y una columna de luz y una onda los lanzan por los aires.',
  herido(){ if (!PSY.on && player.inv <= 0 && !player.dead){ PSY.emo = Math.min(1, PSY.emo + 0.25); if (PSY.emo >= 1) try { psyEstalla(); } catch (err) { console.error(err); } } return null; },
  tick(dt){ psyAuraTick(dt); }, reset(){ PSY.emo = 0; }, limpia(m){ if (m === 'titulo' || m === 'partida') PSY.emo = 0; } });

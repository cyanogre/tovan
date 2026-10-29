'use strict';
/* ======================================================================
   PODERES FOIL · CINE (B), sobre foil-nucleo.js. Nada de texto en
   pantalla. Prefijos:
     · Fiebre del sábado noche · dsc. Un pulso de 120 por minuto: el suelo
       alrededor de Tovan es una pista de baile cuyas baldosas se encienden
       al compás, y un aro se cierra a sus pies en cada tiempo. Atacar a
       tiempo enciende la pista, suelta una onda y un acorde funky; machacar
       el botón rompe la racha. Ocho seguidos: baja una bola de espejos que
       gira disparando haces de colores por toda la arena, con bombo a
       negras y bajo de disco.
     · Tiburón · tbr. Cada ocho bajas, el suelo bajo el grupo más grande se
       vuelve agua, una aleta empieza a dar vueltas al son del «ta-tán» cada
       vez más rápido y el tiburón salta del agua con la boca abierta y se
       los traga.
     · Tiempo bala (Matrix) · mtx. A veces, al acertar un golpe cuerpo a
       cuerpo, el tiempo casi se para: lluvia de código verde en la
       pantalla, balas que cruzan despacio dejando ondas en el aire, y el
       golpe hace el triple. Tras uno, unos segundos «despierto» (salen más).
   ====================================================================== */

/* ======================================================================
   FIEBRE DEL SÁBADO NOCHE (dsc)
   ====================================================================== */
const DSC_BEAT = 0.5, DSC_VENTANA = 0.12, DSC_ACORDES = [[64, 67, 71], [62, 65, 69], [60, 64, 67], [65, 69, 72]];
const DSC = { t0: 0, racha: 0, ult: -9, pista: null, aro: null, bola: null, drop: null, fallo: 0, golpe: 0, pulso: -1 };
const DSC_PISTA_VS = 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
const DSC_PISTA_FS = `uniform vec3 uC; uniform float uB; uniform float uF; uniform float uLoco; uniform float uOn; varying vec3 vW;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
vec3 col(float k){ return 0.5 + 0.5 * cos(6.2831 * (k + vec3(0.0, 0.33, 0.67))); }
void main(){
  vec2 c = floor(vW.xz); vec2 f = fract(vW.xz); float d = length(vW.xz - uC.xz);
  float borde = step(0.06, f.x) * step(f.x, 0.94) * step(0.06, f.y) * step(f.y, 0.94);
  float encendida = step(0.55 - uLoco * 0.35, h(c + floor(uB) * 7.13));
  float k = encendida * (0.35 + 0.65 * (1.0 - fract(uB)) * (1.0 - fract(uB))) + uF;
  float a = borde * k * (1.0 - smoothstep(2.5, 4.6, d)) * uOn;
  gl_FragColor = vec4(col(h(c * 1.7 + floor(uB))) * a * 0.75, 1.0);
}`;
function dscMontaje(){
  if (DSC.pista) return;
  DSC.pista = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShaderMaterial({ vertexShader: DSC_PISTA_VS, fragmentShader: DSC_PISTA_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uC: { value: new THREE.Vector3() }, uB: { value: 0 }, uF: { value: 0 }, uLoco: { value: 0 }, uOn: { value: 0 } } }));
  DSC.pista.rotation.x = -Math.PI / 2; DSC.pista.renderOrder = 2; DSC.pista.frustumCulled = false; DSC.pista.visible = false; scene.add(DSC.pista);
  DSC.aro = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 40), new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  DSC.aro.rotation.x = -Math.PI / 2; DSC.aro.renderOrder = 3; DSC.aro.visible = false; scene.add(DSC.aro);
}
// la bola de espejos: facetas plateadas con brillos, y ocho haces de colores
function dscBola(){
  if (DSC.bola) return DSC.bola;
  const g = new THREE.Group(), esfera = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 2), makeMat(0xd8dce8, { emissive: 0.55 })); g.add(esfera);
  mesh(C(0.03, 0.03, 12, 4), makeMat(0x8a8a90), 0, 7, 0, g);
  const haz = new THREE.CylinderGeometry(0.02, 0.2, 1, 8, 1, true); haz.translate(0, -0.5, 0);
  g.userData.haces = [0, 1, 2, 3, 4, 5, 6, 7].map(i => { const c = new THREE.Color().setHSL(i / 8, 1, 0.6), m = new THREE.Mesh(haz, new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.renderOrder = 5; g.add(m); return m; });
  g.visible = false; scene.add(g); return (DSC.bola = g);
}
const dscFase = () => { const p = ((time - DSC.t0) % DSC_BEAT + DSC_BEAT) % DSC_BEAT; return Math.min(p, DSC_BEAT - p); };
function dscJuzga(){
  if (time - DSC.ult < 0.22) return; DSC.ult = time;
  if (dscFase() <= DSC_VENTANA){ DSC.racha++; dscOnda(); if (DSC.racha >= 8 && !DSC.drop) dscDrop(); }
  else { if (DSC.racha > 1) play('dscFallo'); DSC.racha = 0; DSC.fallo = 0.3; }
}
function dscOnda(){
  const O = hero.position, k = DSC.racha, col = new THREE.Color().setHSL((k * 0.13) % 1, 1, 0.6).getHex(); DSC.golpe = 1;
  DSC_ACORDES[(k - 1) % 4].forEach((n, i) => tone({ type: 'sawtooth', f0: NOTE(n), dur: 0.16, vol: 0.035, when: i * 0.004, rv: 0.3 })); tone({ type: 'square', f0: NOTE(DSC_ACORDES[(k - 1) % 4][0] - 24), dur: 0.12, vol: 0.05 });
  ringFx(O.x, O.z, col, 0.5, 2.6 + k * 0.2, 0.3); gring(O.x, 0.6, O.z, col, 0.4, 1.8 + k * 0.12, 0.25);
  for (const e of foilEnemigos(O, 2.6 + k * 0.2)){ const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(14 + 5 * k), dx / l, dz / l, 3, null, 1); }
}
function dscDrop(){
  const b = dscBola(), O = hero.position; DSC.drop = { t: 0, x: O.x, z: O.z, tic: 0, beat: -1 }; DSC.racha = 0; b.visible = true; b.position.set(O.x, 14, O.z);
  play('dscDrop'); flash('#ffffff', 0.3); shake = Math.max(shake, 0.4);
}
function dscDropTick(dt){
  const D = DSC.drop, b = DSC.bola; D.t += dt; const t = D.t, baja = smooth(Math.min(1, t / 0.8)), fin = t > 5.2 ? (t - 5.2) / 0.8 : 0, y = lerp(14, 5.2, baja) + fin * 9;
  b.position.set(D.x, y, D.z); b.rotation.y += dt * 1.6; b.children[0].material.uniforms.uEmissive.value = 0.5 + 0.3 * Math.sin(time * 20);
  if (dt > 0 && Math.random() < 0.6){ const a = Math.random() * TAU, e_ = Math.random() * Math.PI; pa(D.x + Math.cos(a) * Math.sin(e_) * 1.15, y + Math.cos(e_) * 1.15, D.z + Math.sin(a) * Math.sin(e_) * 1.15, 0, 0, 0, 0xffffff, 0.16, 0.2, 0, 0, 0, SH7.star); }
  const H = b.userData.haces, on = t > 0.8 && fin === 0;
  H.forEach((m, i) => { m.visible = on; if (!on) return; const a = i / H.length * TAU + t * 1.3, inc = 0.75 + 0.3 * Math.sin(t * 2 + i), L = y / Math.cos(inc);
    m.scale.set(1, L, 1); m.rotation.set(0, 0, 0); m.rotateY(a); m.rotateX(inc); m.material.opacity = 0.28 + 0.12 * Math.sin(time * 14 + i); });
  const beat = Math.floor((time - DSC.t0) / DSC_BEAT); if (on && beat !== D.beat){ D.beat = beat; play('dscBombo'); if (beat % 2) play('dscBajo'); }
  if (on && (D.tic -= dt) <= 0){ D.tic = 0.22; H.forEach((m, i) => { const a = i / H.length * TAU + t * 1.3, inc = 0.75 + 0.3 * Math.sin(t * 2 + i), r = Math.tan(inc) * y, px = D.x - Math.sin(a) * r, pz = D.z - Math.cos(a) * r;   // (el haz apunta hacia −z girado a)
      if (Math.hypot(px, pz) > ARENA + 2) return; gring(px, 0.08, pz, m.material.color.getHex(), 0.3, 1.2, 0.2);
      for (const e of foilEnemigos({ x: px, z: pz }, 1.3)) foilGolpea(e, rdmg(16), 0, 0, 2, null, 0.8); }); }
  DSC.pista.material.uniforms.uLoco.value = on ? 1 : 0;
  if (t > 6){ b.visible = false; DSC.drop = null; }
}
function dscTick(dt){
  dscMontaje(); const O = hero.position, p = ((time - DSC.t0) % DSC_BEAT + DSC_BEAT) % DSC_BEAT, k = p / DSC_BEAT, hay = enemies.some(e => e.alive && e.spawnT <= 0), U = DSC.pista.material.uniforms;
  if (DSC.golpe > 0) DSC.golpe = Math.max(0, DSC.golpe - dt * 3); if (DSC.fallo > 0) DSC.fallo -= dt;
  DSC.pista.visible = DSC.aro.visible = hay || !!DSC.drop; U.uC.value.copy(O); U.uB.value = (time - DSC.t0) / DSC_BEAT; U.uF.value = DSC.golpe * 0.8; U.uOn.value = DSC.fallo > 0 ? 0.25 : 0.6 + Math.min(0.4, DSC.racha * 0.06);
  DSC.pista.position.set(Math.round(O.x), 0.035, Math.round(O.z));
  if (hay){ DSC.aro.position.set(O.x, 0.07, O.z); DSC.aro.scale.setScalar(lerp(2.4, 0.53, k)); DSC.aro.material.color.setHSL((DSC.racha * 0.13) % 1, DSC.fallo > 0 ? 0 : 1, 0.65); DSC.aro.material.opacity = 0.25 + 0.6 * k;
    const b = Math.floor((time - DSC.t0) / DSC_BEAT); if (b !== DSC.pulso){ DSC.pulso = b; if (!DSC.drop) play(b % 2 ? 'dscCharles' : 'dscBombo'); } }
  if (DSC.drop) dscDropTick(dt);
}
function dscLimpia(){ if (DSC.pista){ DSC.pista.visible = DSC.aro.visible = false; } if (DSC.bola) DSC.bola.visible = false; DSC.drop = null; DSC.racha = 0; }
const dsc_doAttack = doAttack;
doAttack = function(){ if (lvl('foilDisco') && gameState === 'play' && foilEscenario() && canAct() && !invActive) try { dscJuzga(); } catch (err) { console.error(err); } dsc_doAttack(); };
Object.assign(SFX, {
  dscBombo: () => { tone({ type: 'sine', f0: 140, f1: 45, dur: 0.16, vol: 0.14 }); },
  dscCharles: () => { tone({ type: 'sine', f0: 120, f1: 42, dur: 0.12, vol: 0.1 }); noise({ dur: 0.12, vol: 0.05, f0: 8000, type: 'highpass', when: DSC_BEAT / 2 }); },
  dscBajo: () => { [40, 52, 40, 52].forEach((n, i) => tone({ type: 'sawtooth', f0: NOTE(n), dur: 0.11, vol: 0.06, when: i * DSC_BEAT / 4 })); noise({ dur: 0.18, vol: 0.06, f0: 8000, type: 'highpass', when: DSC_BEAT / 2 }); },
  dscFallo: () => { tone({ type: 'sawtooth', f0: 220, f1: 150, dur: 0.15, vol: 0.04 }); },
  dscDrop: () => { tone({ type: 'sine', f0: 90, f1: 30, dur: 1.2, vol: 0.5, rv: 0.4 }); noise({ dur: 0.8, vol: 0.25, f0: 300, f1: 6000, type: 'bandpass', attack: 0.6, rv: 0.4 });
    [[64, 67, 71], [62, 65, 69]].forEach((ac, j) => ac.forEach(n => tone({ type: 'sawtooth', f0: NOTE(n), dur: 0.35, vol: 0.035, when: 0.8 + j * 0.25, rv: 0.4 }))); }
});
foilPoder({ id: 'foilDisco', ic: '🪩', name: 'Fiebre del sábado noche', tags: ['otaku'],
  desc: 'El suelo a tu alrededor es una pista de baile que se enciende al compás y un aro se cierra a tus pies en cada golpe de bombo. Si atacas justo a tiempo, la pista brilla, sale una onda y suena un acorde; machacar el botón rompe la racha. Ocho seguidas: baja una bola de espejos que dispara haces de colores por toda la arena.',
  tick(dt, jugando){ if (!jugando || !foilEscenario()){ if (DSC.pista && gameState !== 'paused'){ DSC.pista.visible = DSC.aro.visible = false; } return; } if (dt > 0) dscTick(dt); },
  coge(){ DSC.t0 = time; }, reset(){ DSC.racha = 0; }, limpia(){ dscLimpia(); } });

/* ======================================================================
   TIBURÓN (tbr)
   ====================================================================== */
const TBR_BAJAS = 8;
const TBR = { bajas: 0, on: null, tib: null, aleta: null, agua: null };
const TBR_AGUA_FS = `uniform float uA; uniform float uT; varying vec2 vU;
void main(){ vec2 p = vU * 2.0 - 1.0; float d = length(p); if (d > 1.0) discard;
  float ondas = 0.5 + 0.5 * sin(d * 22.0 - uT * 5.0); float espuma = smoothstep(0.86, 1.0, d);
  vec3 c = mix(vec3(0.02, 0.12, 0.3), vec3(0.15, 0.45, 0.7), ondas * 0.6) + espuma * 0.6;
  gl_FragColor = vec4(c, uA * (0.85 + espuma * 0.15)); }`;
function tbrModelos(){
  if (TBR.tib) return;
  const gris = makeMat(0x6a7684, { emissive: 0.15 }), blanco = makeMat(0xe8ecf0, { emissive: 0.2 }), negro = makeMat(0x101014), rosa = makeMat(0xb03a4a, { emissive: 0.2 }), diente = makeMat(0xffffff, { emissive: 0.4 });
  // el tiburón mira hacia +y (sale del agua de morro); la mandíbula de abajo va aparte para abrirla
  const t = new THREE.Group(), src = new THREE.Group();
  const cuerpo = mesh(new THREE.SphereGeometry(1, 12, 8), gris, 0, 0, 0, src); cuerpo.scale.set(0.95, 2.6, 0.85);
  const tripa = mesh(new THREE.SphereGeometry(1, 12, 8), blanco, 0, -0.1, 0.32, src); tripa.scale.set(0.75, 2.3, 0.6);
  const morro = mesh(new THREE.ConeGeometry(0.75, 1.3, 10), gris, 0, 2.7, -0.05, src); morro.scale.set(1, 1, 0.85);
  mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.12, 12), rosa, 0, 2.15, 0.35, src).rotation.x = Math.PI / 2;
  for (let i = 0; i < 10; i++){ const a = -0.9 + i / 9 * 1.8, d = mesh(new THREE.ConeGeometry(0.06, 0.2, 4), diente, Math.sin(a) * 0.55, 2.35, 0.45 + Math.cos(a) * 0.12, src); d.rotation.x = Math.PI; }
  for (const s of [-1, 1]){ mesh(B(0.12, 0.12, 0.12), negro, s * 0.55, 2.55, 0.25, src); const al = mesh(B(0.08, 0.9, 0.6), gris, s * 0.9, 0.6, 0.1, src); al.rotation.z = s * 0.9; }
  const dorsal = mesh(new THREE.ConeGeometry(0.5, 1.3, 3), gris, 0, 0.6, -0.95, src); dorsal.rotation.x = -1.1;
  const cola = mesh(B(0.12, 1.4, 0.5), gris, 0, -2.9, -0.3, src); cola.rotation.x = 0.5; const cola2 = mesh(B(0.12, 1.0, 0.45), gris, 0, -2.8, 0.35, src); cola2.rotation.x = -0.6;
  mpFusiona(src, t);
  const boca = new THREE.Group(); boca.position.set(0, 1.9, 0.5); t.add(boca); const mand = mesh(B(1.0, 0.9, 0.25), gris, 0, 0.35, 0, boca);
  for (let i = 0; i < 8; i++){ const a = -0.8 + i / 7 * 1.6; mesh(new THREE.ConeGeometry(0.06, 0.2, 4), diente, Math.sin(a) * 0.45, 0.82, 0.1, boca); }
  t.userData.boca = boca; t.visible = false; scene.add(t); TBR.tib = t;
  const fs = new THREE.Shape(); fs.moveTo(-0.6, 0); fs.quadraticCurveTo(-0.1, 0.4, 0.15, 1.15); fs.quadraticCurveTo(0.25, 0.5, 0.6, 0); fs.lineTo(-0.6, 0);
  TBR.aleta = new THREE.Mesh(new THREE.ShapeGeometry(fs), makeMat(0x5a6674, { emissive: 0.15, side: THREE.DoubleSide })); TBR.aleta.visible = false; scene.add(TBR.aleta);
  TBR.agua = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 7.6), new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: TBR_AGUA_FS,
    uniforms: { uA: { value: 0 }, uT: shared.uTime }, transparent: true, depthWrite: false })); TBR.agua.rotation.x = -Math.PI / 2; TBR.agua.renderOrder = 2; TBR.agua.visible = false; scene.add(TBR.agua);
}
function tbrAtaca(){
  if (TBR.on || !foilPuede() || !foilEscenario()) return false;
  tbrModelos(); const e0 = xtrGrupo(hero.position, 14); if (!e0) return false; const P_ = e0.g.position.clone().setY(0), cx = P_.x, cz = P_.z;
  const S = TBR.on = { t: 0, cx, cz, notas: 0, sig: 0, ya: new Set() }; TBR.agua.visible = true; TBR.agua.position.set(cx, 0.03, cz); TBR.aleta.visible = true;
  foilFx.push({ t: 0, upd(dt){ const t = this.t, T = TBR.tib, a = TBR.aleta;
      TBR.agua.material.uniforms.uA.value = Math.min(1, t / 0.4) * (t > 3.6 ? Math.max(0, 1 - (t - 3.6) / 0.6) : 1);
      // 1. la aleta da vueltas, cada vez más cerca y más deprisa; el «ta-tán», cada vez más rápido
      if (t < 2.2){ const k = t / 2.2, r = lerp(3.2, 1.3, k), ang = t * (2 + k * 5); a.position.set(cx + Math.sin(ang) * r, 0.02, cz + Math.cos(ang) * r); a.rotation.set(0, ang + Math.PI / 2, 0);
        if (dt > 0 && Math.random() < 0.8) pa(a.position.x, 0.1, a.position.z, (Math.random() - 0.5), 0.6, (Math.random() - 0.5), 0xffffff, 0.12, 0.5, 0, 1, 0, SH7.dot);
        if (t >= S.sig){ play(S.notas % 2 ? 'tbrDum' : 'tbrTa'); S.notas++; S.sig = t + Math.max(0.12, 0.55 - k * 0.5); } }
      else a.visible = false;
      // 2. ¡sale!
      if (t >= 2.2 && t < 3.6){ const k = t - 2.2; if (!S.sale){ S.sale = true; T.visible = true; play('tbrSalta'); shake = Math.max(shake, 0.5);
          for (let i = 0; i < 40; i++){ const q = Math.random() * TAU, v = 3 + Math.random() * 5; pa(cx, 0.3, cz, Math.cos(q) * v * 0.5, 6 + Math.random() * 6, Math.sin(q) * v * 0.5, Math.random() < 0.5 ? 0xffffff : 0x8ac8ff, 0.3, 0.9, 16, 0.5, 0, SH7.dot); }
          ringFx(cx, cz, 0xffffff, 0.4, 3.5, 0.4); ringFx(cx, cz, 0x8ac8ff, 0.3, 2.6, 0.35, 0.2); }
        const y = k < 0.45 ? lerp(-4, 3.2, smooth(k / 0.45)) : k < 0.75 ? 3.2 + Math.sin((k - 0.45) * 8) * 0.15 : lerp(3.2, -6, smooth((k - 0.75) / 0.65));
        T.position.set(cx, y, cz); T.rotation.set(k < 0.75 ? -0.15 : -0.15 - (k - 0.75) * 2.2, k * 0.6, 0);
        T.userData.boca.rotation.x = k < 0.45 ? 0.9 : k < 0.6 ? 0.9 - (k - 0.45) * 6 : 0;
        if (!S.muerde && k >= 0.55){ S.muerde = true; play('tbrMuerde'); hitStop = Math.max(hitStop, 0.1); flash('#c8e8ff', 0.25);
          for (const e of foilEnemigos({ x: cx, z: cz }, 2.8)){ const dx = e.g.position.x - cx, dz = e.g.position.z - cz, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(130), dx / l, dz / l, 6, null, 2); sparks(e.g.position.x, 1.5, e.g.position.z, 10, 0xffffff, 6); } }
        if (!S.cae && k >= 1.1){ S.cae = true; for (let i = 0; i < 30; i++){ const q = Math.random() * TAU; pa(cx, 0.3, cz, Math.cos(q) * 3, 5 + Math.random() * 4, Math.sin(q) * 3, 0xffffff, 0.28, 0.8, 16, 0.5, 0, SH7.dot); } ringFx(cx, cz, 0xffffff, 0.3, 4, 0.4); play('tbrChapuzon'); } }
      if (t >= 3.6) T.visible = false;
      return t < 4.2; },
    fin(){ TBR.on = null; if (TBR.tib) TBR.tib.visible = false; if (TBR.aleta) TBR.aleta.visible = false; if (TBR.agua) TBR.agua.visible = false; } });
  return true;
}
Object.assign(SFX, {
  tbrTa: () => { tone({ type: 'sawtooth', f0: NOTE(40), dur: 0.28, vol: 0.12, rv: 0.3 }); tone({ type: 'sine', f0: NOTE(28), dur: 0.3, vol: 0.2 }); },
  tbrDum: () => { tone({ type: 'sawtooth', f0: NOTE(41), dur: 0.28, vol: 0.12, rv: 0.3 }); tone({ type: 'sine', f0: NOTE(29), dur: 0.3, vol: 0.2 }); },
  tbrSalta: () => { noise({ dur: 0.7, vol: 0.45, f0: 2500, f1: 300, type: 'lowpass', rv: 0.5 }); [40, 41, 47, 52].forEach((n, i) => tone({ type: 'sawtooth', f0: NOTE(n), dur: 0.8, vol: 0.06, when: i * 0.02, rv: 0.5 })); },
  tbrMuerde: () => { tone({ type: 'square', f0: 220, f1: 60, dur: 0.15, vol: 0.2 }); noise({ dur: 0.15, vol: 0.35, f0: 1500, type: 'lowpass' }); },
  tbrChapuzon: () => { noise({ dur: 0.8, vol: 0.4, f0: 1800, f1: 200, type: 'lowpass', rv: 0.5 }); }
});
foilPoder({ id: 'foilTiburon', ic: '🦈', name: 'Tiburón', tags: ['otaku'],
  desc: 'Cada ocho bajas, el suelo bajo el grupo más grande se vuelve agua, una aleta empieza a dar vueltas al son del «ta-tán», cada vez más rápido, y el tiburón salta del agua con la boca abierta y se los traga.',
  mata(e){ if (gameState !== 'play' || strFuerte(e)) return; TBR.bajas++; if (TBR.bajas >= TBR_BAJAS && tbrAtaca()) TBR.bajas = 0; },
  tick(){ if (TBR.bajas >= TBR_BAJAS && !TBR.on && gameState === 'play' && tbrAtaca()) TBR.bajas = 0; },
  reset(){ TBR.bajas = 0; }, limpia(){ TBR.on = null; if (TBR.tib) TBR.tib.visible = false; if (TBR.aleta) TBR.aleta.visible = false; if (TBR.agua) TBR.agua.visible = false; } });

/* ======================================================================
   TIEMPO BALA (mtx)
   ====================================================================== */
const MTX_SIMBOLOS = Array.from({ length: 40 }, (_, i) => { const R = mulberry32(1999 + i), s = []; for (let y = 0; y < 5; y++) for (let x = 0; x < 3; x++) if (R() < 0.55) s.push([x, y]); return s; });   // garabatos de 3×5, no letras
const MTX = { cd: 0, zona: 0, on: 0, lienzo: null, gtx: null, gotas: [], balas: [] };
const MTX_BALA = foilSprite(foilLienzo(32, 16, g => { const gr = g.createLinearGradient(0, 0, 32, 0); gr.addColorStop(0, '#6a4a20'); gr.addColorStop(0.55, '#d8a040'); gr.addColorStop(1, '#ffe8a0'); g.fillStyle = gr; g.beginPath(); g.moveTo(2, 4); g.lineTo(22, 4); g.quadraticCurveTo(31, 8, 22, 12); g.lineTo(2, 12); g.closePath(); g.fill(); }), false);
function mtxLienzo(){
  if (MTX.lienzo) return MTX.lienzo;
  const c = document.createElement('canvas'); c.id = 'mtxLluvia'; Object.assign(c.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', opacity: '0', mixBlendMode: 'screen', zIndex: '4' });
  c.width = 320; c.height = 240; (document.querySelector('.vignette') || document.getElementById('c')).after(c); MTX.lienzo = c; MTX.gtx = c.getContext('2d');
  MTX.gotas = Array.from({ length: 40 }, (_, i) => { const R = mulberry32(2003 + i); return { x: i * 8, y: -R() * 240, v: 40 + R() * 90, n: 6 + Math.floor(R() * 14), s: Math.floor(R() * 40) }; });
  return c;
}
function mtxLluviaPinta(dt, k){
  const c = mtxLienzo(), g = MTX.gtx; if (!g || !g.fillRect) return; c.style.opacity = String(k);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, 320, 240);
  for (const d of MTX.gotas){ d.y += d.v * dt; if (d.y - d.n * 7 > 240) d.y = -Math.random() * 60;
    for (let j = 0; j < d.n; j++){ const y = Math.floor(d.y - j * 7), S = MTX_SIMBOLOS[(d.s + j + Math.floor(time * 6)) % 40]; g.fillStyle = j === 0 ? '#d8ffd8' : `rgba(40,255,90,${1 - j / d.n})`;
      for (const [x, yy] of S) g.fillRect(d.x + x, y + yy, 1, 1); } }
}
function mtxEmpieza(e){
  const H = hero.position, p = e.g.position; MTX.on = 1.6; MTX.zona = 7; MTX.cd = 1.5; slowT = Math.max(slowT, 1.3); play('mtxEmpieza');
  flash('#a0ffb0', 0.25); for (let i = 0; i < 3; i++) gring(p.x, 1, p.z, 0x8aff9a, 0.3, 2 + i * 0.8, 0.9 + i * 0.25, hero.rotation.y, 0.6);
  // balas que cruzan despacio alrededor de Tovan dejando ondas
  for (let i = 0; i < 6; i++){ const a = Math.random() * TAU, de = new V3(H.x + Math.sin(a) * 5, 0.8 + Math.random() * 1.2, H.z + Math.cos(a) * 5), a2 = a + Math.PI + (Math.random() - 0.5) * 0.9, a_ = new V3(H.x + Math.sin(a2) * 5, de.y + (Math.random() - 0.5) * 0.6, H.z + Math.cos(a2) * 5), s = new THREE.Sprite(MTX_BALA); s.scale.set(0.5, 0.25, 1); s.renderOrder = 7; scene.add(s);
    const ya = new Set(); foilFx.push({ t: 0, tic: 0, upd(dt){ const k = Math.min(1, this.t / 1.6); s.position.lerpVectors(de, a_, k); s.material.rotation = Math.atan2(a_.y - de.y, 1) ; if ((this.tic -= dt) <= 0){ this.tic = 0.12; gring(s.position.x, s.position.y, s.position.z, 0xd8ffe0, 0.05, 0.5, 0.5, Math.atan2(a_.x - de.x, a_.z - de.z), 0.5); }
        for (const q of foilEnemigos(s.position, 0.6)){ if (ya.has(q)) continue; ya.add(q); foilGolpea(q, rdmg(16), 0, 0, 2, null, 0.6); } return k < 1; }, fin(){ scene.remove(s); } }); }
}
function mtxTick(dt){
  if (MTX.cd > 0) MTX.cd -= dt; if (MTX.zona > 0) MTX.zona -= dt;
  if (MTX.on > 0){ MTX.on -= dt; const k = Math.min(1, MTX.on / 0.4, (1.6 - MTX.on) / 0.2 + 0.001); mtxLluviaPinta(dt, Math.max(0, k) * 0.75); if (MTX.on <= 0 && MTX.lienzo) MTX.lienzo.style.opacity = '0'; }
}
Object.assign(SFX, {
  mtxEmpieza: () => { tone({ type: 'sine', f0: 300, f1: 40, dur: 1.2, vol: 0.4, rv: 0.7 }); noise({ dur: 1.1, vol: 0.2, f0: 3000, f1: 200, type: 'bandpass', rv: 0.7 }); tone({ type: 'sine', f0: 60, dur: 0.2, vol: 0.35, when: 0.3 }); tone({ type: 'sine', f0: 60, dur: 0.2, vol: 0.3, when: 0.9 }); }
});
foilPoder({ id: 'foilMatrix', ic: '🕶️', name: 'Tiempo bala', tags: ['otaku'],
  desc: 'A veces, al acertar un golpe cuerpo a cuerpo, el tiempo casi se para: llueve código verde, unas balas cruzan despacio dejando ondas en el aire y el golpe hace el triple de daño. Después estás unos segundos «despierto» y pasa más a menudo.',
  dano(e, val, o, crit, melee){ if (!melee || MTX.cd > 0 || !e.alive || e.spawnT > 0 || gameState !== 'play' || !foilEscenario()) return val;
    if (Math.random() < (MTX.zona > 0 ? 0.18 : 0.07)){ try { mtxEmpieza(e); } catch (err) { console.error(err); } return val * 3; } return val; },
  tick(dt){ if (dt > 0) mtxTick(dt); }, reset(){ MTX.cd = 0; MTX.zona = 0; }, limpia(){ MTX.on = 0; if (MTX.lienzo) MTX.lienzo.style.opacity = '0'; } });

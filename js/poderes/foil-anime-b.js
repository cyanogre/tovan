'use strict';
/* ======================================================================
   PODERES FOIL · GRUPO ANIME B (cinco más, sobre js/poderes/foil-nucleo.js)
     · Pelo dorado (de una de guerreros del espacio) · prefijo ssj. Ya no
       es carta (sobraba: hay un poder normal parecido); el código se queda
       porque los bloqueos de este fichero lo usan. Era así. Solo:
       al bajar del 35 % de vida (una vez por oleada; si hay otra forma,
       espera a que acabe) Tovan grita en cámara lenta, las piedras flotan,
       cae una columna de aura dorada y el pelo se le pone de punta y
       dorado. Forma de 14 s: llamas doradas que suben, chispas y rayitos
       azules; más rápido, más daño y cura un 25 %. El remate es una
       teletransportación (imagen residual) y una patada que lo lanza.
     · Titán (de una de muros) · prefijo tit. Especial con el ímpetu lleno:
       se muerde la mano, cae un rayo amarillo del cielo, estalla el vapor
       y crece hasta ~3,2 veces. Forma de 10 s: vapor por los hombros,
       aplasta lo que pisa, manotazos con onda en el suelo y un puñetazo a
       dos manos que deja un cráter.
     · Transformación mágica (de una de chicas mágicas) · prefijo mag. El
       primer remate de cada oleada: gira en el aire entre lazos rosas,
       corazones y estrellas, estalla un corazón y posa con el signo de la
       paz. Forma de 15 s: varita con corazón, cada golpe dispara corazones
       que persiguen y el remate es la «Tiara lunar», que va y vuelve.
     · Taladro espiral (de una de mechas con gafas de sol) · prefijo drl.
       Cada remate saca un taladro espiral gigante y embiste 5 m; cada
       cuarto, «¡GIGATALADRO!»: uno colosal cae del cielo delante.
     · Moto roja (de una de neo-Tokio) · prefijo mto. Rodar dos veces
       seguidas invoca la moto, que llega derrapando. Forma de 14 s: muy
       rápida, atropella y deja las estelas rojas de los pilotos. Atacar =
       caballito y embestida; rodar = derrape de lado que golpea en abanico.
   Los modelos se construyen la primera vez y luego se enseñan y esconden;
   lo pintado en lienzos usa mulberry32 (nada de rnd() al cargar). Cintas
   nuevas en TRAZO_FS: mag (satén con encaje), drl (espiral de energía) y
   mto (luz de neón, aditiva). Cada uno tiene su estética, su sonido y su
   rótulo (css/foil-anime-b.css).
   ====================================================================== */

/* ---------- Cintas propias (mismas uniformes que las de foil.js) ---------- */
// Satén pastel: brillo que corre, ribete de encaje ondulado y lunares dorados que centellean
TRAZO_FS.mag = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float u = vUV.x, a = abs(vUV.y), m = u * uLen;
  float encaje = 0.84 + 0.1 * sin(m * 16.0 + uSeed);
  if (a > encaje) discard;
  float brillo = pow(max(0.0, sin(m * 1.8 - uTime * 5.0 + uSeed)), 8.0);
  vec3 col = mix(uB, uA, (1.0 - smoothstep(0.0, 0.75, a)) * 0.45 + brillo * 0.7);
  col = mix(col, uC, smoothstep(encaje - 0.22, encaje - 0.1, a));
  vec2 q = vec2(m * 2.6, vUV.y * 1.6 + 0.5); vec2 c = fract(q) - 0.5; float id = h1(floor(q) + uSeed);
  float lun = (1.0 - step(0.15, length(c))) * step(0.5, id) * (0.55 + 0.45 * sin(uTime * 9.0 + id * 40.0));
  col = mix(col, uE, lun * (1.0 - step(0.62, a)));
  gl_FragColor = vec4(col, uAlpha * smoothstep(0.0, 0.07, u));
}`;
// Espiral de energía (aditiva): núcleo claro, halo verde y franjas en espiral que corren hacia delante
TRAZO_FS.drl = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
void main(){
  float u = vUV.x, a = abs(vUV.y), m = u * uLen;
  float core = 1.0 - smoothstep(0.05, 0.4, a), glow = pow(1.0 - a, 1.6);
  float esp = smoothstep(0.3, 0.48, abs(fract(m * 1.4 + vUV.y * 0.6 - uTime * 4.0) - 0.5));
  vec3 col = uB * glow * 1.4 + uA * core * 0.8 + uC * esp * glow * 0.9;
  gl_FragColor = vec4(col, uAlpha * smoothstep(0.0, 0.1, u) * clamp(glow + core, 0.0, 1.0));
}`;
// Luz de neón (aditiva): núcleo blanco, halo rojo, barrido que corre y la cola vieja más tenue
TRAZO_FS.mto = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
void main(){
  float u = vUV.x, a = abs(vUV.y);
  float core = 1.0 - smoothstep(0.02, 0.22, a), glow = pow(max(0.0, 1.0 - a), 1.8);
  float barrido = 0.8 + 0.2 * sin(u * uLen * 6.0 - uTime * 26.0);
  vec3 col = uB * glow * 2.2 * barrido + uA * core;
  gl_FragColor = vec4(col, uAlpha * pow(u, 1.3) * clamp(core + glow, 0.0, 1.0));
}`;
// una cinta aditiva de las nuevas (tintaCoge solo hace aditiva la del rayo)
function mtoCinta(cols, tipo){ const c = tintaCoge(cols, 0, tipo || 'mto'); c.mat.blending = THREE.AdditiveBlending; return c; }
// camino por una lista de puntos (s de 0 a 1 recorre los índices)
function mtoRuta(pts){ return (s, v) => { const n = pts.length - 1; if (n < 1) return v.copy(pts[0] || hero.position); const x = clamp(s, 0, 1) * n, i = Math.min(n - 1, Math.floor(x)); return v.lerpVectors(pts[i], pts[i + 1], x - i); }; }
const ssjV = new V3(), ssjW = new V3();
function mtoQuitaMarca(id){ const el = document.getElementById('foilM-' + id); if (el) el.remove(); }
// los marcadores solo se ven en partida (en el título y en el fin de partida se quitan)
const mtoEnPartida = () => gameState === 'play' || gameState === 'paused' || gameState === 'upgrade' || gameState === 'cutscene';

/* ---------- Bloqueo de los botones durante las escenas y maniobras de este grupo ----------
   Las formas con F.escena (las escenas guionizadas), la patada dorada y las embestidas del taladro mandan:
   mientras duran no se ataca, ni se rueda, ni se salta, ni se lanza el especial. */
function ssjBloqueado(){ const F = FOILX.forma; return !!((F && F.escena) || SSJ.patada || DRL.embiste || (DRL.giga && DRL.giga.t < 1.1) || (TIT.puno && TIT.puno.t < 0.3)); }
const ssj_doAttack = doAttack, ssj_doRoll = doRoll, ssj_doJump = doJump, ssj_doSpecial = doSpecial;
doAttack = function(){ if (canAct() && ssjBloqueado()) return; ssj_doAttack(); };
doRoll = function(){ if (canAct() && ssjBloqueado()) return; ssj_doRoll(); };
doJump = function(){ if (canAct() && ssjBloqueado()) return; ssj_doJump(); };
doSpecial = function(){ if (canAct() && ssjBloqueado()) return; ssj_doSpecial(); };

/* ======================================================================
   PELO DORADO (ssj)
   ====================================================================== */
const SSJ = { usada: false, F: null, pelo: null, aura: null, col: null, rocas: null, mechones: null, rayoT: 0, res: null, patada: null };
const SSJ_RAYO = [0xffffff, 0x4aa8ff, 0xffffff, 0];
// Aura: llamas que suben por una malla (lathe o cilindro), aditivas, más intensas en el contorno
const SSJ_AURA_VS = 'varying vec2 vU; varying float vR; void main(){ vU = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); vR = 1.0 - abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }';
const SSJ_AURA_FS = `
uniform vec3 uA; uniform vec3 uB; uniform float uTime; uniform float uAlpha; uniform float uSeed; uniform float uVel;
varying vec2 vU; varying float vR;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p, float per){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float j = mod(i.x + 1.0, per); i.x = mod(i.x, per);
  return mix(mix(h1(i), h1(vec2(j, i.y)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(vec2(j, i.y + 1.0)), f.x), f.y); }
void main(){
  float x = vU.x * 9.0, y = vU.y;
  float n = n2(vec2(x, y * 3.0 - uTime * uVel + uSeed), 9.0) * 0.6 + n2(vec2(x * 2.0, y * 7.0 - uTime * uVel * 1.8), 18.0) * 0.4;
  float lengua = smoothstep(0.0, 0.3, n + 0.35 - y * 0.95);
  float a = lengua * (0.05 + 0.95 * vR * vR) * smoothstep(0.0, 0.1, y);
  if (a < 0.02) discard;
  vec3 col = mix(uB, uA, smoothstep(0.2, 0.9, lengua * (1.0 - y * 0.6)));
  gl_FragColor = vec4(col, a * uAlpha);
}`;
function ssjAuraMat(a, b, vel){ return new THREE.ShaderMaterial({ vertexShader: SSJ_AURA_VS, fragmentShader: SSJ_AURA_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  uniforms: { uA: { value: new THREE.Color(a) }, uB: { value: new THREE.Color(b) }, uTime: { value: 0 }, uAlpha: { value: 1 }, uSeed: { value: 0 }, uVel: { value: vel } } }); }
function ssjConstruye(){
  if (SSJ.aura) return;
  const perfil = [[0.22, 0], [0.6, 0.22], [0.78, 0.66], [0.74, 1.15], [0.58, 1.65], [0.36, 2.1], [0.14, 2.55], [0.02, 2.9]].map(([r, y]) => new THREE.Vector2(r, y));
  SSJ.aura = new THREE.Mesh(new THREE.LatheGeometry(perfil, 16), ssjAuraMat(0xffe070, 0xff8a00, 5)); SSJ.aura.renderOrder = 6; SSJ.aura.frustumCulled = false; SSJ.aura.visible = false; scene.add(SSJ.aura);
  const cg = new THREE.CylinderGeometry(1.15, 1.5, 16, 16, 1, true); cg.translate(0, 8, 0);
  SSJ.col = new THREE.Mesh(cg, ssjAuraMat(0xffe890, 0xff9a10, 9)); SSJ.col.renderOrder = 6; SSJ.col.frustumCulled = false; SSJ.col.visible = false; scene.add(SSJ.col);
  const R = mulberry32(851), geo = new THREE.DodecahedronGeometry(1, 0), mat = makeMat(0x7a6c62);
  SSJ.rocas = Array.from({ length: 9 }, (_, i) => { const m = mesh(geo, mat, 0, -5, 0); m.visible = false;
    m.userData = { a: i / 9 * TAU + R() * 0.5, r: 1.1 + R() * 1.4, h: 0.7 + R() * 2.1, s: 0.07 + R() * 0.15, w: 1 + R() * 3 }; return m; });
  // el pelo: pinchos de arriba y flequillo (se ponen de punta y se devuelven tal cual)
  SSJ.mechones = P.neck.children.filter(o => o.isMesh && o.material === M.hair && o.geometry.type === 'ConeGeometry').map(o => ({ o, s: o.scale.clone(), r: o.rotation.clone(), top: o.position.y > 0.5 }));
}
function ssjPelo(on){
  const U = M.hair.uniforms;
  if (on && !SSJ.pelo){ SSJ.pelo = { c: U.uColor.value.getHex(), e: U.uEmissive.value, m: U.uHasMap.value, ah: P.ahoge.scale.clone() };
    U.uColor.value.setHex(0xffe866); U.uEmissive.value = 0.55; U.uHasMap.value = 0;
    for (const h of SSJ.mechones){ if (h.top){ h.o.scale.set(h.s.x * 1.3, h.s.y * 1.8, h.s.z * 1.3); h.o.rotation.set(h.r.x * 0.45 - 0.12, h.r.y, h.r.z * 1.2); } else h.o.scale.set(h.s.x, h.s.y * 1.3, h.s.z); }
    P.ahoge.scale.setScalar(1.5); }
  else if (!on && SSJ.pelo){ const p = SSJ.pelo; SSJ.pelo = null; U.uColor.value.setHex(p.c); U.uEmissive.value = p.e; U.uHasMap.value = p.m; P.ahoge.scale.copy(p.ah);
    for (const h of SSJ.mechones){ h.o.scale.copy(h.s); h.o.rotation.copy(h.r); } }
}
function ssjMarca(){
  if (!mtoEnPartida()){ mtoQuitaMarca('ssj'); return; }
  const el = foilMarcador('ssj', 'ssjMarca'), st = SSJ.F ? 'on' : SSJ.usada ? 'gastada' : 'lista';
  if (el.dataset.st !== st){ el.dataset.st = st; el.className = 'foilMarca ssjMarca ' + st; el.innerHTML = `<b>✦</b><span>${st === 'on' ? '¡DORADO!' : st === 'lista' ? 'Pelo dorado' : 'Gastado'}</span>`; }
}
// solo: al bajar del 35 % de vida, una vez por oleada (si hay otra forma, espera a que acabe)
function ssjVigila(dt, jugando){
  ssjMarca();
  if (!jugando || SSJ.usada || FOILX.forma || player.dead || player.hp <= 0 || player.hp >= player.maxHp * 0.35) return;
  if (!foilPuede() || !foilEscenario() || state === 'roll' || state === 'tech' || state === 'dead' || NUCA.m) return;
  ssjEmpieza();
}
function ssjEmpieza(){
  ssjConstruye();
  const F = foilForma({ id: 'ssj', nom: 'PELO DORADO', col: '#ffd84a', dur: 15.2, velK: 1.35, danoK: 1.5, intocable: true, escena: true, camK: 0.62, soloForma: true,
    tick(dt){ ssjTick(dt); }, golpe(f){ ssjGolpe(f); }, remate(f){ ssjPatada(f); }, pose(){ ssjPose(); }, postPose(){ ssjPost(); }, fin(m){ ssjFin(m); } });
  if (!F) return false;
  SSJ.usada = true; SSJ.F = F; F.S = hero.position.clone(); F.f = hero.rotation.y; F.destello = false; SSJ.rayoT = 0.3;
  state = 'normal'; attackW = 0; queued = false; comboT = 0; staffToBack(); slowT = Math.max(slowT, 1.25);
  foilRotulo('¡HAAAAAA!', 'ssjRot', 1.9); play('ssjGrito'); ssjRocas(F.S);
  return true;
}
// las piedras del suelo flotan alrededor mientras grita; en el destello salen despedidas
function ssjRocas(O){
  const L = SSJ.rocas;
  for (const m of L){ const u = m.userData; m.visible = true; m.scale.setScalar(u.s); m.position.set(O.x + Math.cos(u.a) * u.r, 0.05, O.z + Math.sin(u.a) * u.r); u.suelta = false; }
  foilFx.push({ t: 0, upd(dt){ const t = this.t;
      for (const m of L){ const u = m.userData;
        if (t < 0.9){ const k = smooth(Math.min(1, t / 0.85)); m.position.y = 0.05 + u.h * k + Math.sin(time * 30 + u.a * 7) * 0.03; m.rotation.x += dt * u.w; m.rotation.y += dt * u.w * 0.7; }
        else { if (!u.suelta){ u.suelta = true; u.vx = Math.cos(u.a) * (4 + u.w); u.vz = Math.sin(u.a) * (4 + u.w); u.vy = 3 + u.w; }
          u.vy -= 20 * dt; m.position.x += u.vx * dt; m.position.y += u.vy * dt; m.position.z += u.vz * dt; m.rotation.x += dt * u.w * 3;
          if (m.position.y < 0.05){ m.position.y = 0.05; u.vy *= -0.3; u.vx *= 0.6; u.vz *= 0.6; } } }
      if (t > 2.3) return false;
      if (t > 1.9) for (const m of L) m.scale.setScalar(m.userData.s * Math.max(0.01, 1 - (t - 1.9) / 0.4));
      return true; },
    fin(){ for (const m of L) m.visible = false; } });
}
function ssjDestello(F){
  F.destello = true; const H = hero.position;
  ssjPelo(true); heal(Math.round(player.maxHp * 0.25));
  flash('#ffe9a0', 0.4); lightFlash(H.x, 1.5, H.z, 0xffc030, 2.6, 10); shake = Math.max(shake, 0.6); hitStop = Math.max(hitStop, 0.06);
  ringFx(H.x, H.z, 0xffe14a, 0.4, 6.5, 0.55); ringFx(H.x, H.z, 0xffffff, 0.3, 4, 0.4, 0.4);
  burst7(PA7, H.x, 1.2, H.z, 34, [0xffe14a, 0xffffff, 0xffb020], 9, 0.22, 0.8, 4, 1.5, 0.3, SH7.star);
  for (const e of foilEnemigos(H, 4.5)){ const dx = e.g.position.x - H.x, dz = e.g.position.z - H.z, d = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(18), dx / d, dz / d, 8, null, 1); }
  play('ssjDestello');
  barkOnce('ssjPelo', '¡Tu pelo! ¡Brilla más que yo! Esto es una falta de respeto a las linternas.');
}
function ssjTick(dt){
  const F = SSJ.F; if (!F) return;
  const H = hero.position, A = SSJ.aura, C = SSJ.col;
  if (F.escena){
    H.x = F.S.x; H.z = F.S.z; heading = hero.rotation.y = F.f; MOV11.vx = MOV11.vz = 0; if (state === 'attack' || state === 'charge') state = 'normal';
    const k = Math.min(1, F.t / 0.9); shake = Math.max(shake, 0.1 + 0.22 * k);
    C.visible = true; C.position.set(H.x, 0, H.z);
    const w = (0.35 + 0.65 * smooth(k)) * (1 + 0.06 * Math.sin(time * 41)); C.scale.set(w, F.destello ? 1 : 0.1 + 0.9 * smooth(k), w);
    C.material.uniforms.uAlpha.value = (F.destello ? Math.max(0, 1 - (F.t - 0.9) / 0.3) : 0.3 + 0.7 * k) * 0.7;
    if (dt > 0 && rnd() < dt * 40){ const a = rnd() * TAU, r = 0.8 + rnd() * 1.2; pa(H.x + Math.cos(a) * r, 0.1, H.z + Math.sin(a) * r, 0, 3 + rnd() * 4, 0, rnd() < 0.5 ? 0xffe14a : 0xfff6c0, 0.1, 0.6, -2, 1, 0.3, SH7.dot); }
    if (dt > 0 && rnd() < dt * 12) puffAt(H.x + (rnd() - 0.5) * 2, H.z + (rnd() - 0.5) * 2, 1, 0.6, 0xb8a898);
    if (!F.destello && F.t >= 0.9) ssjDestello(F);
    if (F.t >= 1.2){ F.escena = false; F.intocable = false; F.camK = 1; C.visible = false; P.legL.hip.rotation.z = P.legR.hip.rotation.z = 0; P.spine.rotation.z = 0; }
  }
  C.material.uniforms.uTime.value = time;
  A.visible = F.destello;
  if (A.visible){ const s = hero.scale.x; A.position.set(H.x, H.y, H.z); A.scale.set(s * (1 + 0.07 * Math.sin(time * 23)), s * (1 + 0.09 * Math.sin(time * 17)), s * (1 + 0.07 * Math.sin(time * 29)));
    A.material.uniforms.uTime.value = time; A.material.uniforms.uAlpha.value = 0.6 + 0.15 * Math.sin(time * 13);
    if (SSJ.pelo) M.hair.uniforms.uEmissive.value = 0.5 + 0.15 * Math.sin(time * 9); }
  if (F.destello && dt > 0){
    if (rnd() < dt * 18){ const a = rnd() * TAU, r = 0.3 + rnd() * 0.5; pa(H.x + Math.cos(a) * r, H.y + 0.2 + rnd() * 1.4, H.z + Math.sin(a) * r, 0, 2 + rnd() * 2, 0, rnd() < 0.6 ? 0xffe14a : 0xffffff, 0.08 + rnd() * 0.06, 0.5, -1, 1, 0.3, SH7.dot); }
    SSJ.rayoT -= dt; if (SSJ.rayoT <= 0){ SSJ.rayoT = 0.25 + rnd() * 0.6; ssjRayito(); }
  }
  const Pd = SSJ.patada;
  if (Pd && dt > 0){ Pd.t += dt; H.x = Pd.x; H.z = Pd.z; MOV11.vx = MOV11.vz = 0;
    if (!Pd.hecho && Pd.t >= 0.1){ Pd.hecho = true; ssjImpacto(Pd.e); }
    if (Pd.t >= 0.42) SSJ.patada = null; }
  if (SSJ.res && dt > 0){ SSJ.res.t += dt; if (SSJ.res.t > 0.45) SSJ.res = null; }
}
// rayitos azules que saltan alrededor del cuerpo
function ssjRayito(){
  const a0 = rnd() * TAU, y0 = 0.4 + rnd() * 1.3, a1 = a0 + (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 0.8), y1 = y0 + (rnd() - 0.5) * 0.9, r0 = 0.45 + rnd() * 0.3;
  const base = (q, v) => { const H = hero.position, s = hero.scale.x, a = lerp(a0, a1, q), r = r0 + Math.sin(q * Math.PI) * 0.25; return v.set(H.x + Math.cos(a) * r * s, H.y + lerp(y0, y1, q) * s, H.z + Math.sin(a) * r * s); };
  const c = tintaCoge(SSJ_RAYO, 0, 'rayo'), Pt = rayoTiembla(base, 6, 0.09);
  foilFx.push({ t: 0, cintas: [c], upd(){ if (this.t > 0.14) return false; tintaPinta(c, Pt, 0, 1, () => 0.07); c.mat.uniforms.uAlpha.value = 1 - this.t / 0.14; return true; } });
  if (rnd() < 0.35) play('ssjChispa');
}
// cada golpe de la forma: un impacto de energía dorada
function ssjGolpe(f){
  const H = hero.position, cx = H.x + Math.sin(f) * 1.5, cz = H.z + Math.cos(f) * 1.5;
  ringFx(cx, cz, 0xffe14a, 0.2, 1.8, 0.25, 0.9); burst7(PA7, cx, 1, cz, 10, [0xffe14a, 0xffffff], 5, 0.12, 0.35, 2, 2, 0.3, SH7.dia);
  const d = rdmg(10); for (const e of enemies){ const n = enCono(H, e, f, 2.7, 1.2); if (n) foilGolpea(e, d, n[0], n[1], 2.5, null, 0.8); }
  play('ssjKi');
}
// el remate: desaparece (queda la imagen residual) y aparece detrás del más cercano con una patada que lo lanza
function ssjPatada(f){
  const H = hero.position; let e = null, bd = 10;
  for (const q of foilEnemigos(H, 10)){ if (q.type === 'puesto') continue; const d = Math.hypot(q.g.position.x - H.x, q.g.position.z - H.z) - q.r; if (d < bd){ bd = d; e = q; } }
  if (!e){ ssjOnda(f); return; }
  const ex = e.g.position.x, ez = e.g.position.z, sep = e.r + 0.85; let dx = ex - H.x, dz = ez - H.z, d = Math.hypot(dx, dz);
  if (d < 0.05){ dx = Math.sin(f); dz = Math.cos(f); d = 1; } const ux = dx / d, uz = dz / d;
  let tx = ex + ux * sep, tz = ez + uz * sep;
  for (const [ax, az] of [[-uz, ux], [uz, -ux]]) if (!mpLibre(tx, tz, 0.4)){ tx = ex + ax * sep; tz = ez + az * sep; }
  if (!mpLibre(tx, tz, 0.4)){ tx = H.x; tz = H.z; }
  SSJ.res = { x: H.x, y: H.y, z: H.z, ry: hero.rotation.y, t: 0 };
  burst7(PA7, H.x, 1, H.z, 12, [0xffe14a, 0xffffff], 3, 0.1, 0.35, 0, 2, 0.3, SH7.dot); ringFx(H.x, H.z, 0xffe14a, 0.6, 0.1, 0.2, 0.8);
  H.x = tx; H.z = tz; heading = hero.rotation.y = Math.atan2(ex - tx, ez - tz);
  state = 'normal'; attackW = 0; queued = false; staffToBack(); MOV11.vx = MOV11.vz = 0;
  ringFx(tx, tz, 0xffe14a, 0.1, 1.4, 0.2, 0.8);
  SSJ.patada = { t: 0, e, x: tx, z: tz, hecho: false };
  play('ssjTele');
}
function ssjImpacto(e){
  if (!e.alive) return;
  const H = hero.position, ex = e.g.position.x, ez = e.g.position.z, d = Math.max(0.01, Math.hypot(ex - H.x, ez - H.z)), nx = (ex - H.x) / d, nz = (ez - H.z) / d;
  const firme = foilJefe(e) || e.cap || e.noSep || e.type === 'puesto';
  foilGolpea(e, rdmg(46), nx, nz, firme ? 4 : 2, null, 1.5);
  if (!firme) ssjLanza(e, nx, nz);
  hitStop = Math.max(hitStop, 0.1); shake = Math.max(shake, 0.45); flash('#fff3b0', 0.3); lightFlash(ex, 1.2, ez, 0xffd040, 2.4, 8);
  ringFx(ex, ez, 0xffe14a, 0.3, 2.6, 0.35, 1); burst7(PA7, ex, 1.1, ez, 22, [0xffe14a, 0xffffff, 0xffb020], 8, 0.16, 0.5, 6, 1.5, 0.3, SH7.star);
  play('ssjPatada'); foilGrito('¡Patada instantánea!', '#ffe14a');
}
// por los aires: sube, da una vuelta de campana y cae (el enemigo sigue aturdido mientras vuela)
function ssjLanza(e, nx, nz){
  foilFx.push({ t: 0, upd(){ if (e.remove) return false; const k = Math.min(1, this.t / 0.95);
      e.g.position.y = 4.8 * 4 * k * (1 - k); e.g.rotation.x = -k * TAU * 1.25;
      if (e.alive){ e.state = 'hurt'; e.t = Math.max(e.t || 0, 0.12); e.vx = nx * 3.2; e.vz = nz * 3.2; }
      if (k >= 1){ puffAt(e.g.position.x, e.g.position.z, 10, 2); shake = Math.max(shake, 0.18); play('land'); return false; }
      return true; },
    fin(){ e.g.position.y = 0; e.g.rotation.x = 0; } });
}
function ssjOnda(f){   // sin nadie a tiro: una onda dorada hacia delante
  const H = hero.position, cx = H.x + Math.sin(f) * 2, cz = H.z + Math.cos(f) * 2;
  ringFx(cx, cz, 0xffe14a, 0.3, 3.4, 0.4, 0.8); burst7(PA7, cx, 1, cz, 16, [0xffe14a, 0xffffff], 7, 0.14, 0.45, 2, 2, 0.3, SH7.star);
  for (const e of enemies){ const n = enCono(H, e, f, 4.2, 0.85); if (n) foilGolpea(e, rdmg(30), n[0], n[1], 6, null, 1); }
  play('ssjKi');
}
function ssjPose(){
  const F = SSJ.F; if (!F) return;
  if (F.escena){ const k = Math.min(1, F.t / 0.25), tr = (rnd() - 0.5) * 0.06;
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', 0.3, k); bl(A.sh.rotation, 'y', 0, k); bl(A.sh.rotation, 'z', 0.55 * s, k); bl(A.el.rotation, 'x', -0.55, k); bl(A.el.rotation, 'z', 0, k); }
    bl(P.spine.rotation, 'x', -0.25 + tr, k); bl(P.spine.rotation, 'y', 0, k); P.spine.rotation.z = tr;
    bl(P.neck.rotation, 'x', -0.5, k); bl(P.neck.rotation, 'y', 0, k);
    for (const [L, s] of [[P.legL, -1], [P.legR, 1]]){ bl(L.hip.rotation, 'x', -0.25, k); bl(L.hip.rotation, 'z', 0.28 * s, k); bl(L.knee.rotation, 'x', 0.45, k); } }
  const Pd = SSJ.patada;
  if (Pd){ const k = Math.min(1, Pd.t / 0.08) * (Pd.t > 0.32 ? Math.max(0, 1 - (Pd.t - 0.32) / 0.1) : 1);
    bl(P.legL.hip.rotation, 'x', -1.75, k); bl(P.legL.knee.rotation, 'x', 0.05, k); bl(P.legR.hip.rotation, 'x', 0.25, k); bl(P.legR.knee.rotation, 'x', 0.3, k);
    bl(P.spine.rotation, 'x', -0.35, k); bl(P.armL.sh.rotation, 'z', -1.1, k); bl(P.armR.sh.rotation, 'z', 1.1, k); bl(P.armL.sh.rotation, 'x', -0.4, k); bl(P.armR.sh.rotation, 'x', -0.4, k); }
}
function ssjPost(){ const F = SSJ.F; if (F && F.escena && F.t < 0.9) M.face.uniforms.uMap.value = faceBlink; }   // grita con los ojos apretados
function ssjFin(m){
  const F = SSJ.F; SSJ.F = null; SSJ.patada = null; SSJ.res = null;
  ssjPelo(false); if (SSJ.aura) SSJ.aura.visible = false; if (SSJ.col) SSJ.col.visible = false;
  P.legL.hip.rotation.z = P.legR.hip.rotation.z = 0; P.spine.rotation.z = 0;
  if (m === 'tiempo' && F){ const H = hero.position; burst7(PA7, H.x, 1.3, H.z, 24, [0xffe14a, 0xfff6c0], 4, 0.14, 0.6, -1, 2, 0.3, SH7.dot); play('ssjApaga'); foilGrito('Se apaga el dorado', '#ffe9a0'); }
}
// la imagen residual: Tovan pintado otra vez, dorado y medio transparente, donde estaba (como los clones de sombra)
let ssjMats = null;
function ssjResiduo(){
  const R = SSJ.res; if (!R || !(gameState === 'play' || gameState === 'paused')) return;
  if (!ssjMats){ const s = new Set(); hero.traverse(o => { o.layers.enable(1); if (o.material && o.material.uniforms && o.material.uniforms.uColor) s.add(o.material); }); ssjMats = [...s]; }
  const k = Math.max(0, 1 - R.t / 0.45), guar = ssjMats.map(m => [m.uniforms.uColor.value.getHex(), m.uniforms.uEmissive.value, m.uniforms.uOpacity.value]);
  ssjMats.forEach(m => { m.uniforms.uColor.value.setHex(0xffe68a); m.uniforms.uEmissive.value = 0.85; m.uniforms.uOpacity.value = 0.7 * k; });
  const p = ssjV.copy(hero.position), ry = hero.rotation.y, vis = hero.visible; hero.visible = true; hero.position.set(R.x, R.y, R.z); hero.rotation.y = R.ry; hero.updateMatrixWorld(true);
  renderer.autoClear = false; camera.layers.set(1); renderer.render(scene, camera); camera.layers.set(0); renderer.autoClear = true;
  hero.position.copy(p); hero.rotation.y = ry; hero.visible = vis; hero.updateMatrixWorld(true);
  ssjMats.forEach((m, i) => { m.uniforms.uColor.value.setHex(guar[i][0]); m.uniforms.uEmissive.value = guar[i][1]; m.uniforms.uOpacity.value = guar[i][2]; });
}
const ssj_renderClones = renderClones;
renderClones = function(){ ssj_renderClones(); try { ssjResiduo(); } catch (err) { console.error(err); } };
function ssjLimpia(m){ SSJ.res = null; SSJ.patada = null; if (m === 'titulo' || m === 'partida') mtoQuitaMarca('ssj'); }
Object.assign(SFX, {
  ssjGrito: () => { tone({ type: 'sawtooth', f0: 170, f1: 420, dur: 1.1, vol: 0.12, attack: 0.08, rv: 0.4 }); tone({ type: 'square', f0: 340, f1: 840, dur: 1.0, vol: 0.04, attack: 0.1, rv: 0.4 });
    noise({ dur: 1.15, vol: 0.22, f0: 260, type: 'lowpass', q: 0.7, attack: 0.2, rv: 0.3 }); noise({ dur: 1.0, vol: 0.08, f0: 900, f1: 1400, q: 3, attack: 0.1, rv: 0.4 }); },
  ssjDestello: () => { tone({ type: 'sine', f0: 90, f1: 28, dur: 0.9, vol: 0.6, rv: 0.6 }); noise({ dur: 0.6, vol: 0.3, f0: 6000, f1: 700, rv: 0.6 });
    [84, 88, 91, 96].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 1.0, vol: 0.05, when: 0.04 + i * 0.03, rv: 0.8 })); },
  ssjKi: () => { noise({ dur: 0.13, vol: 0.2, f0: 1700, f1: 450, q: 1.2, rv: 0.15 }); tone({ type: 'square', f0: 520, f1: 240, dur: 0.08, vol: 0.05 }); },
  ssjTele: () => { tone({ type: 'sine', f0: 2400, f1: 500, dur: 0.07, vol: 0.12, rv: 0.2 }); tone({ type: 'sine', f0: 500, f1: 2600, dur: 0.07, vol: 0.12, when: 0.07, rv: 0.3 }); },
  ssjPatada: () => { tone({ type: 'sine', f0: 160, f1: 38, dur: 0.38, vol: 0.6, rv: 0.4 }); noise({ dur: 0.25, vol: 0.35, f0: 900, f1: 180, type: 'lowpass', rv: 0.3 }); noise({ dur: 0.08, vol: 0.2, f0: 5000, type: 'highpass' }); },
  ssjChispa: () => { noise({ dur: 0.05, vol: 0.06, f0: 7000, type: 'highpass', q: 0.8 }); tone({ type: 'square', f0: 3000, f1: 1200, dur: 0.04, vol: 0.025 }); },
  ssjApaga: () => { tone({ type: 'triangle', f0: 620, f1: 150, dur: 0.6, vol: 0.08, rv: 0.4 }); noise({ dur: 0.5, vol: 0.1, f0: 2000, f1: 300, rv: 0.3 }); }
});
// (Pelo dorado ya no es una carta: sobraba, hay un poder normal parecido. El código se queda porque los bloqueos
// de arriba y el resto del fichero lo usan; sin la carta nunca se activa.)

/* ======================================================================
   TITÁN (tit)
   ====================================================================== */
const TIT = { F: null, puno: null, crat: [], vapT: 0, pasoS: 1 };
const TIT_RAYO = [0xffffff, 0xffe060, 0xffffff, 0], TIT_RAYO2 = [0xfffbe0, 0xffa018, 0xffffff, 0];
// especial con el ímpetu lleno: se muerde la mano, cae el rayo y crece (si no se puede, el especial de siempre)
function titEspecial(){
  if (!grounded || NUCA.m || FOILX.forma || !foilEscenario()) return false;
  const F = foilForma({ id: 'tit', nom: 'TITÁN', col: '#ffcf6a', dur: 11, velK: 0.8, escala: 1, camK: 1, intocable: true, escena: true, soloForma: true,
    tick(dt){ titTick(dt); }, golpe(f){ titManotazo(f); }, remate(f){ titPunetazo(f); }, pose(){ titPose(); }, fin(m){ titFin(m); } });
  if (!F) return false;
  TIT.F = F; F.S = hero.position.clone(); F.f = hero.rotation.y; F.rayo = false; F.sangre = false; TIT.vapT = 0;
  state = 'normal'; attackW = 0; queued = false; comboT = 0; staffToBack(); MOV11.vx = MOV11.vz = 0;
  return true;
}
function titTick(dt){
  const F = TIT.F; if (!F) return; const H = hero.position;
  if (F.escena){
    H.x = F.S.x; H.z = F.S.z; heading = hero.rotation.y = F.f; MOV11.vx = MOV11.vz = 0; if (state === 'attack' || state === 'charge') state = 'normal';
    if (!F.sangre && F.t >= 0.22){ F.sangre = true; P.armL.hand.getWorldPosition(ssjV); play('titMuerde');
      for (let i = 0; i < 8; i++) spawnFx(ssjV.x, ssjV.y, ssjV.z, (rnd() - 0.5) * 2, 1 + rnd() * 2, (rnd() - 0.5) * 2, rnd() < 0.6 ? 0xc0101e : 0x7a0010, 0.06, 0.45, 9, 0); }
    if (!F.rayo && F.t >= 0.38) titRayo(F);
    if (F.t >= 1.05){ F.escena = false; F.intocable = false;
      F.contacto = { r: 1.7, dmg: 16, cd: 0.6, knock: 6, al: e => { puffAt(e.g.position.x, e.g.position.z, 4, 1.4); } }; }   // aplasta lo que pisa
  }
  if (F.rayo && dt > 0){ TIT.vapT -= dt; while (TIT.vapT <= 0){ TIT.vapT += 0.06; titVaporHombro(); } }   // vapor por los hombros, todo el rato
  if (!F.escena && dt > 0){ const s = Math.sin(phase) >= 0 ? 1 : -1; if (s !== TIT.pasoS && walkW > 0.4 && grounded) titPisada(s); TIT.pasoS = s; }
  if (TIT.puno && dt > 0){ TIT.puno.t += dt; if (TIT.puno.t > 0.5) TIT.puno = null; }
}
function titVaporHombro(){
  const s = hero.scale.x;
  for (const A of [P.armL, P.armR]){ A.sh.getWorldPosition(ssjV);
    pn(ssjV.x + (rnd() - 0.5) * 0.2 * s, ssjV.y + 0.12 * s, ssjV.z + (rnd() - 0.5) * 0.2 * s, (rnd() - 0.5) * 0.7 - Math.sin(hero.rotation.y) * 0.8, 1.4 + rnd() * 1.4, (rnd() - 0.5) * 0.7 - Math.cos(hero.rotation.y) * 0.8, rnd() < 0.7 ? 0xf6f6f6 : 0xdedede, (0.08 + rnd() * 0.06) * s, 0.8 + rnd() * 0.4, -0.4, 1, 2.2, SH7.dot, 0.45); }
}
// el rayo amarillo del cielo y la explosión de vapor: aquí empieza a crecer
function titRayo(F){
  F.rayo = true; F.escala = 3.2; F.camK = innerWidth > innerHeight * 1.4 ? 2.6 : 2.1;   // (en horizontal, más lejos: si no, se corta la cabeza)
  const O = hero.position.clone();
  const base = (s, v) => v.set(O.x + Math.sin(s * 7) * 0.5 * (1 - s), lerp(46, 0.6, s), O.z + Math.cos(s * 5) * 0.5 * (1 - s));
  const P1 = rayoTiembla(base, 22, 1.1), P2 = rayoTiembla(base, 22, 1.8), c1 = tintaCoge(TIT_RAYO, 0, 'rayo'), c2 = tintaCoge(TIT_RAYO2, 0, 'rayo');
  const ramas = [0, 1, 2, 3].map(i => { const s0 = 0.35 + i * 0.15, dir = new V3(rnd() - 0.5, -0.4 - rnd() * 0.3, rnd() - 0.5).normalize(), L = 3 + rnd() * 4, o = new V3();
    return { c: tintaCoge(TIT_RAYO2, 0, 'rayo'), P: rayoTiembla((s, v) => { base(s0, o); return v.copy(o).addScaledVector(dir, L * s); }, 4, 0.4) }; });
  const todas = [c1, c2, ...ramas.map(r => r.c)];
  foilFx.push({ t: 0, cintas: todas, upd(){ const k = Math.min(1, this.t / 0.06), fade = Math.max(0, (this.t - 0.25) / 0.3); if (fade >= 1) return false;
      tintaPinta(c2, P2, 0, k, () => 2.6); tintaPinta(c1, P1, 0, k, () => 0.9);
      for (const r of ramas) tintaPinta(r.c, r.P, 0, k, q => 0.5 * (1 - q * 0.7));
      for (const c of todas) c.mat.uniforms.uAlpha.value = (1 - fade) * (0.75 + 0.25 * Math.sin(time * 60));
      return true; } });
  flash('#fff6b0', 0.3); lightFlash(O.x, 3, O.z, 0xffe060, 3.5, 18); shake = Math.max(shake, 0.85); hitStop = Math.max(hitStop, 0.05);
  ringFx(O.x, O.z, 0xffffff, 0.5, 7, 0.6); ringFx(O.x, O.z, 0xffe080, 0.3, 4.5, 0.4, 0.3);
  for (let i = 0; i < 36; i++){ const a = rnd() * TAU, v = 3 + rnd() * 6; pn(O.x + Math.cos(a) * 0.5, 0.3 + rnd() * 2, O.z + Math.sin(a) * 0.5, Math.cos(a) * v, 1 + rnd() * 4, Math.sin(a) * v, rnd() < 0.8 ? 0xf6f6f6 : 0xffe9b0, 0.35 + rnd() * 0.3, 1.1 + rnd() * 0.5, -0.3, 2.2, 2.6, SH7.dot, 0.55); }
  for (const e of foilEnemigos(O, 4.8)){ const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(24), dx / d, dz / d, 9, 'shock', 1); }
  play('titRayo'); later(0.3, () => foilRotulo('¡TITÁN!', 'titRot', 1.8));   // primero se ve el rayo
  barkOnce('titan', '¿Te has… mordido la mano? Vale. Ahora eres un edificio. Pisa con cuidado, que debajo estoy yo.');
}
function titPisada(s){
  const f = hero.rotation.y, H = hero.position, sc = hero.scale.x, x = H.x + Math.cos(f) * 0.13 * s * sc, z = H.z - Math.sin(f) * 0.13 * s * sc;
  puffAt(x, z, 5, 1.6, 0xb8a898); ringFx(x, z, 0xc8b898, 0.2, 1.6, 0.3); shake = Math.max(shake, 0.14); play('titPaso');
}
// cada golpe: un manotazo gigante con onda en el suelo y mucho daño en un cono ancho
function titManotazo(f){
  const H = hero.position, cx = H.x + Math.sin(f) * 2.6, cz = H.z + Math.cos(f) * 2.6, d = rdmg(22);
  for (const e of enemies){ const n = enCono(H, e, f, 5.2, 1.15); if (n) foilGolpea(e, d, n[0], n[1], 7, null, 1); }
  ringFx(cx, cz, 0xe8dcc0, 0.4, 3.8, 0.4); ring7(PN7, cx, 0.15, cz, 16, [0xb8a898, 0x8a7a6a, 0xd8cfc0], 5, 0.5, 0.6, 3, 2, 2.2, SH7.dot);
  shake = Math.max(shake, 0.3); play('titManotazo');
}
// el remate: puñetazo a dos manos contra el suelo que deja un cráter
function titPunetazo(f){
  const H = hero.position, lim = clampArena(new V3(H.x + Math.sin(f) * 3.6, 0, H.z + Math.cos(f) * 3.6), ARENA - 0.5), cx = lim.x, cz = lim.z, dmg = rdmg(46);
  TIT.puno = { t: 0 };
  for (const e of foilEnemigos(lim, 4.2)){ const dx = e.g.position.x - cx, dz = e.g.position.z - cz, d = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, dmg, dx / d, dz / d, 10, null, 1.5); }
  titCrater(cx, cz, 2.4); ringFx(cx, cz, 0xffe0b0, 0.4, 6.5, 0.5); ringFx(cx, cz, 0xffffff, 0.3, 4, 0.35, 0.3);
  for (let i = 0; i < 26; i++){ const a = rnd() * TAU, v = 2 + rnd() * 5; spawnFx(cx + Math.cos(a) * 0.6, 0.3, cz + Math.sin(a) * 0.6, Math.cos(a) * v, 4 + rnd() * 5, Math.sin(a) * v, rnd() < 0.5 ? 0x7a6a5a : 0x9a8a78, 0.14 + rnd() * 0.12, 0.9, 16, 0); }
  ring7(PN7, cx, 0.2, cz, 20, [0xd8cfc0, 0xb8a898], 7, 0.8, 0.8, 2, 2.5, 2.5, SH7.dot);
  shake = Math.max(shake, 0.7); hitStop = Math.max(hitStop, 0.09); flash('#fff0d0', 0.25); lightFlash(cx, 1, cz, 0xffd8a0, 2.4, 10);
  play('bossSlam'); play('titCrater'); foilGrito('¡Puñetazo del titán!', '#ffe0a0');
}
// cráteres: dos, fundidos (disco oscuro, rocas en el borde y grietas), que se hunden y se esconden (también los usa el gigataladro)
function titCraterNuevo(){
  const R = mulberry32(907 + TIT.crat.length), src = new THREE.Group(), g = new THREE.Group(), mOsc = makeMat(0x261a14), mRoca = makeMat(0x6e6258), mGrieta = makeMat(0x120c0a);
  mesh(new THREE.CylinderGeometry(1, 0.7, 0.08, 14), mOsc, 0, 0.02, 0, src);
  for (let i = 0; i < 11; i++){ const a = i / 11 * TAU + R() * 0.3, r = 1 + R() * 0.2, s = 0.16 + R() * 0.16, m = mesh(new THREE.DodecahedronGeometry(s, 0), mRoca, Math.cos(a) * r, s * 0.4, Math.sin(a) * r, src); m.rotation.set(R() * 3, R() * 3, R() * 3); }
  for (let i = 0; i < 7; i++){ const a = i / 7 * TAU + R() * 0.4, L = 0.8 + R() * 0.9, m = mesh(B(0.04, 0.01, L), mGrieta, Math.cos(a) * (1 + L / 2), 0.03, Math.sin(a) * (1 + L / 2), src); m.rotation.y = Math.PI / 2 - a; }
  mpFusiona(src, g); g.visible = false; scene.add(g); return g;
}
function titCrater(x, z, r){
  let g = TIT.crat.find(c => !c.visible); if (!g){ if (TIT.crat.length < 2){ g = titCraterNuevo(); TIT.crat.push(g); } else g = TIT.crat[0]; }
  g.visible = true; g.position.set(x, 0.01, z); g.scale.setScalar(r * 0.6); g.rotation.y = rnd() * TAU;
  const fx = { t: 0, upd(){ if (g.userData.dueno !== fx) return false; const t = this.t;
      g.scale.setScalar(r * (t < 0.12 ? 0.6 + t / 0.12 * 0.4 : 1)); if (t > 2.8) g.position.y = 0.01 - (t - 2.8) / 0.7 * 0.5 * r;
      return t < 3.5; },
    fin(){ if (g.userData.dueno === fx){ g.visible = false; g.userData.dueno = null; } } };
  g.userData.dueno = fx; foilFx.push(fx);
}
function titPose(){
  const F = TIT.F; if (!F) return;
  if (F.escena && F.t < 0.42){ const k = Math.min(1, F.t / 0.12);   // se muerde la mano derecha
    bl(P.armL.sh.rotation, 'x', -1.95, k); bl(P.armL.sh.rotation, 'z', 0.55, k); bl(P.armL.el.rotation, 'x', -1.75, k); bl(P.neck.rotation, 'x', 0.18, k); bl(P.neck.rotation, 'y', 0, k); bl(P.spine.rotation, 'x', 0.2, k); }
  else if (F.escena){ const k = Math.min(1, (F.t - 0.42) / 0.12);   // ruge con los brazos abiertos
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -0.3, k); bl(A.sh.rotation, 'y', 0, k); bl(A.sh.rotation, 'z', 1.1 * s, k); bl(A.el.rotation, 'x', -0.6, k); }
    bl(P.spine.rotation, 'x', -0.2, k); bl(P.neck.rotation, 'x', -0.45, k); }
  else { P.spine.rotation.x += 0.12; P.neck.rotation.x -= 0.08; }   // encorvado y pesado
  const Pu = TIT.puno;
  if (Pu){ const k = Pu.t < 0.08 ? Pu.t / 0.08 : Math.max(0, 1 - (Pu.t - 0.3) / 0.2);
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -1.0, k); bl(A.sh.rotation, 'y', 0, k); bl(A.sh.rotation, 'z', -0.35 * s, k); bl(A.el.rotation, 'x', -0.2, k); }
    bl(P.spine.rotation, 'x', 0.55, k); }
}
function titFin(m){
  TIT.F = null; TIT.puno = null;
  if (m === 'tiempo'){ const H = hero.position, s = hero.scale.x;   // estallido de vapor y vuelve a su tamaño
    for (let i = 0; i < 34; i++){ const a = rnd() * TAU, v = 2 + rnd() * 4; pn(H.x + Math.cos(a) * 0.4 * s, 0.4 + rnd() * 1.6 * s, H.z + Math.sin(a) * 0.4 * s, Math.cos(a) * v, 1 + rnd() * 3, Math.sin(a) * v, rnd() < 0.8 ? 0xf6f6f6 : 0xe0e0e0, 0.3 + rnd() * 0.3, 1.1 + rnd() * 0.5, -0.3, 2, 2.6, SH7.dot, 0.6); }
    ringFx(H.x, H.z, 0xffffff, 0.5, 5, 0.5); play('titVapor'); shake = Math.max(shake, 0.4); foilGrito('…y vuelve a su tamaño', '#f4ead8'); }
}
// la cámara mira más arriba cuanto más grande es Tovan (si no, al titán se le cortaba la cabeza)
const tit_csCamera = csCamera;
csCamera = function(cam){ tit_csCamera(cam);
  try { const k = FOILX.esc - 1; if (k > 0.05 && !cs.active && !lcut && foilEscenario()){ const lift = k * (innerWidth > innerHeight * 1.4 ? 1.7 : 1.4); cam.position.y += lift * 0.8; cam.lookAt(camTarget.x, camTarget.y + lift, camTarget.z); } } catch (err) { console.error(err); } };
Object.assign(SFX, {
  titMuerde: () => { noise({ dur: 0.08, vol: 0.25, f0: 1200, q: 2 }); tone({ type: 'square', f0: 180, f1: 90, dur: 0.06, vol: 0.1, when: 0.02 }); },
  titRayo: () => { noise({ dur: 0.9, vol: 0.45, f0: 8000, f1: 400, rv: 0.7 }); tone({ type: 'sine', f0: 70, f1: 25, dur: 1.2, vol: 0.7, rv: 0.6 }); tone({ type: 'sawtooth', f0: 55, f1: 30, dur: 1.0, vol: 0.12, rv: 0.4 }); },
  titPaso: () => { tone({ type: 'sine', f0: 90, f1: 35, dur: 0.25, vol: 0.4, rv: 0.2 }); noise({ dur: 0.2, vol: 0.2, f0: 300, type: 'lowpass', rv: 0.2 }); },
  titManotazo: () => { noise({ dur: 0.3, vol: 0.35, f0: 900, f1: 200, type: 'lowpass', rv: 0.3 }); tone({ type: 'sine', f0: 120, f1: 40, dur: 0.3, vol: 0.4, rv: 0.3 }); },
  titCrater: () => { noise({ dur: 0.9, vol: 0.35, f0: 400, f1: 80, type: 'lowpass', rv: 0.5 }); tone({ type: 'triangle', f0: 60, f1: 30, dur: 0.8, vol: 0.2, rv: 0.4 }); },
  titVapor: () => { noise({ dur: 1.2, vol: 0.25, f0: 3000, f1: 1200, type: 'highpass', attack: 0.05, rv: 0.3 }); }
});
foilPoder({ id: 'foilTitan', ic: '🦴', name: 'Titán', tags: ['otaku'],
  desc: 'Especial (con el ímpetu lleno): te muerdes la mano, cae un rayo amarillo y te conviertes en un gigante de vapor durante 10 s. Aplastas lo que pisas, cada golpe es un manotazo que rompe el suelo y el remate, un puñetazo a dos manos que deja un cráter.',
  especial(){ return titEspecial(); }, limpia(){ TIT.puno = null; } });

/* ======================================================================
   TRANSFORMACIÓN MÁGICA (mag)
   ====================================================================== */
const MAG = { usada: false, F: null, vara: null, guarda: null, dedos: null, cors: [], tiara: null, gran: null };
const MAG_LAZO = [0xffffff, 0xff8ad0, 0xc8a0ff, 0xffd86a], MAG_LAZO2 = [0xfff0fa, 0xffb0e0, 0xff7ac0, 0xffffff], MAG_ESTELA = [0xffffff, 0xd8b8ff, 0xff9ad8, 0xffe08a];
const MAG_COLS = [0xff8ad0, 0xffffff, 0xffd86a, 0xc8a0ff];
function magCorazonForma(){ const s = new THREE.Shape(); s.moveTo(0, -0.5); s.bezierCurveTo(-0.62, -0.05, -0.55, 0.47, -0.27, 0.47); s.bezierCurveTo(-0.08, 0.47, 0, 0.32, 0, 0.22);
  s.bezierCurveTo(0, 0.32, 0.08, 0.47, 0.27, 0.47); s.bezierCurveTo(0.55, 0.47, 0.62, -0.05, 0, -0.5); return s; }
// corazones pintados en lienzos (la primera vez; los brillos del grande, con su propio PRNG)
let magCorMat = null, magGranMat = null;
function magPintaCor(g, w, h, c1, c2, borde){
  const k = w / 64; g.save(); g.translate(w / 2, h / 2 + 2 * k);
  g.beginPath(); g.moveTo(0, 22 * k); g.bezierCurveTo(-34 * k, -2 * k, -26 * k, -26 * k, -13 * k, -26 * k); g.bezierCurveTo(-4 * k, -26 * k, 0, -18 * k, 0, -13 * k);
  g.bezierCurveTo(0, -18 * k, 4 * k, -26 * k, 13 * k, -26 * k); g.bezierCurveTo(26 * k, -26 * k, 34 * k, -2 * k, 0, 22 * k); g.closePath();
  const gr = g.createRadialGradient(-8 * k, -12 * k, 2 * k, 0, 0, 30 * k); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.fill();
  g.lineWidth = 3 * k; g.strokeStyle = borde; g.stroke(); g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(-12 * k, -14 * k, 5 * k, 3 * k, -0.6, 0, TAU); g.fill(); g.restore();
}
function magLienzos(){
  if (magCorMat) return;
  magCorMat = foilSprite(foilLienzo(64, 64, g => { const gr = g.createRadialGradient(32, 34, 4, 32, 34, 32); gr.addColorStop(0, 'rgba(255,170,220,0.7)'); gr.addColorStop(1, 'rgba(255,170,220,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); magPintaCor(g, 64, 64, '#ff8ad0', '#e0409a', '#fff0fa'); }), false);
  magGranMat = foilSprite(foilLienzo(256, 256, g => { const R = mulberry32(761);
    for (let i = 0; i < 26; i++){ const a = R() * TAU, r = 78 + R() * 44, x = 128 + Math.cos(a) * r, y = 128 + Math.sin(a) * r, s = 4 + R() * 7; g.fillStyle = R() < 0.5 ? '#fff6a0' : '#ffffff';
      g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.3, y - s * 0.3); g.lineTo(x + s, y); g.lineTo(x + s * 0.3, y + s * 0.3); g.lineTo(x, y + s); g.lineTo(x - s * 0.3, y + s * 0.3); g.lineTo(x - s, y); g.lineTo(x - s * 0.3, y - s * 0.3); g.closePath(); g.fill(); }
    magPintaCor(g, 256, 256, '#ffb0e0', '#ff5ab0', '#ffffff'); }), false);
}
// la varita: sustituye al bastón (y a las armas del vestidor) mientras dura la forma
function magVaraConstruye(){
  if (MAG.vara) return;
  const src = new THREE.Group(), rosa = makeMat(0xff8ad0, { emissive: 0.45 }), blanco = makeMat(0xfff4fa, { emissive: 0.3 }), oro = makeMat(0xffd86a, { emissive: 0.5 });
  mesh(C(0.03, 0.03, 1.45, 6), blanco, 0, -0.05, 0, src);
  for (const y of [-0.7, -0.3, 0.3, 0.6]) mesh(C(0.045, 0.045, 0.05, 6), oro, 0, y, 0, src);
  const hg = new THREE.ExtrudeGeometry(magCorazonForma(), { depth: 0.1, bevelEnabled: false, curveSegments: 5 }); hg.translate(0, 0, -0.05);
  mesh(hg, rosa, 0, 0.92, 0, src).scale.setScalar(0.42);
  for (const s of [-1, 1]){ const ala = mesh(new THREE.ConeGeometry(0.1, 0.32, 3), blanco, 0.22 * s, 0.98, 0, src); ala.rotation.z = -1.2 * s; ala.scale.set(1, 1, 0.3); }
  mesh(new THREE.OctahedronGeometry(0.07, 0), oro, 0, 0.92, 0.07, src);
  MAG.vara = new THREE.Group(); mpFusiona(src, MAG.vara); MAG.vara.visible = false; staff.add(MAG.vara);
}
function magVara(on){
  magVaraConstruye();
  if (on && !MAG.guarda){ MAG.guarda = staff.children.map(o => [o, o.visible]); for (const [o] of MAG.guarda) if (o !== MAG.vara) o.visible = false; MAG.vara.visible = true; }
  else if (!on && MAG.guarda){ for (const [o, v] of MAG.guarda) o.visible = v; MAG.guarda = null; MAG.vara.visible = false; }
}
// el signo de la paz: dos dedos en la mano derecha (P.armL) en la pose final
function magDedos(on){
  if (!MAG.dedos){ MAG.dedos = new THREE.Group(); for (const s of [-1, 1]){ const d = mesh(B(0.045, 0.17, 0.045), M.glove, 0.035 * s, -0.42, 0.02, MAG.dedos); d.rotation.z = 0.28 * s; } P.armL.hand.add(MAG.dedos); }
  MAG.dedos.visible = on;
}
function magMarca(){
  if (!mtoEnPartida()){ mtoQuitaMarca('mag'); return; }
  const el = foilMarcador('mag', 'magMarca'), st = MAG.F ? 'on' : MAG.usada ? 'gastada' : 'lista';
  if (el.dataset.st !== st){ el.dataset.st = st; el.className = 'foilMarca magMarca ' + st; el.innerHTML = `<b>♡</b><span>${st === 'on' ? '¡Modo mágico!' : st === 'lista' ? 'Magia lista' : 'Magia: otra oleada'}</span>`; }
}
// el primer remate de cada oleada transforma (si no se puede, suelta tres corazones)
function magRemate(f){ if (MAG.usada) return; if (magTransforma()){ MAG.usada = true; return; } magCorazones(f, 3); }
function magTransforma(){
  if (!grounded || NUCA.m || FOILX.forma || !foilEscenario()) return null;
  const F = foilForma({ id: 'mag', nom: 'MODO MÁGICO', col: '#ff8ad8', dur: 16.3, intocable: true, escena: true, camK: 0.72, soloForma: true,
    tick(dt){ magTick(dt); }, golpe(f){ magCorazones(f, 2); }, remate(f){ magTiara(f); }, pose(){ magPose(); }, postPose(){ magPost(); }, fin(m){ magFin(m); } });
  if (!F) return null;
  magLienzos(); MAG.F = F; F.S = hero.position.clone(); F.f = hero.rotation.y; F.boom = false;
  state = 'normal'; attackW = 0; queued = false; comboT = 0; staffToBack(); MOV11.vx = MOV11.vz = 0;
  magLazos(F); play('magArpegio');
  return F;
}
// lazos rosas que suben en espiral y se cierran alrededor de Tovan mientras gira
function magLazos(F){
  const cs = [tintaCoge(MAG_LAZO, 0, 'mag'), tintaCoge(MAG_LAZO2, 0, 'mag'), tintaCoge(MAG_LAZO, 0, 'mag')];
  const Ps = cs.map((c, i) => (s, v) => { const t = F.t, H = hero.position, r = lerp(1.7, 0.55, smooth(Math.min(1, t / 0.85))) * (0.78 + 0.22 * Math.sin(s * 9 + i)), a = s * TAU * 2.2 + i * TAU / 3 + t * 7;
    return v.set(H.x + Math.cos(a) * r, H.y + 0.05 + s * 2.1 + 0.15 * Math.sin(s * 12 + t * 5 + i), H.z + Math.sin(a) * r); });
  foilFx.push({ t: 0, cintas: cs, upd(){ const t = this.t; if (t > 1.25 || MAG.F !== F) return false;
      const crece = Math.min(1, t / 0.5), fuera = t > 0.92 ? Math.min(1, (t - 0.92) / 0.3) : 0;
      cs.forEach((c, i) => { tintaPinta(c, Ps[i], fuera, Math.max(0.02, crece), q => 0.32 * Math.sin(Math.min(1, q) * Math.PI * 0.5 + 0.4)); c.mat.uniforms.uAlpha.value = 1 - fuera; });
      return true; } });
}
function magTick(dt){
  const F = MAG.F; if (!F) return; const H = hero.position;
  if (F.escena){
    H.x = F.S.x; H.z = F.S.z; MOV11.vx = MOV11.vz = 0; if (state === 'attack' || state === 'charge') state = 'normal';
    const t = F.t; H.y = t < 0.95 ? 1.25 * smooth(Math.min(1, t / 0.35)) : 1.25 * (1 - smooth(Math.min(1, (t - 0.95) / 0.3))); grounded = true; vy = 0;
    heading = hero.rotation.y = lerpAngle(F.f, camYaw, Math.min(1, t / 0.95)) + smooth(Math.min(1, t / 0.95)) * TAU * 3;   // gira tres veces y acaba mirando a la cámara
    if (dt > 0 && rnd() < dt * 30){ const a = rnd() * TAU, r = 0.6 + rnd(); pa(H.x + Math.cos(a) * r, H.y + rnd() * 2, H.z + Math.sin(a) * r, 0, 0.6, 0, MAG_COLS[Math.floor(rnd() * 4)], 0.14, 0.6, -0.5, 1, 0.2, rnd() < 0.5 ? SH7.star : SH7.heart); }
    if (!F.boom && t >= 0.95) magEstallido(F);
    if (t >= 1.3){ F.escena = false; F.intocable = false; F.camK = 1; H.y = 0; magDedos(false); P.spine.rotation.y = 0; }
  } else if (dt > 0 && rnd() < dt * 6){ const a = rnd() * TAU; pa(H.x + Math.cos(a) * 0.6, H.y + 0.3 + rnd() * 1.4, H.z + Math.sin(a) * 0.6, 0, 0.5, 0, MAG_COLS[Math.floor(rnd() * 4)], 0.1, 0.6, -0.3, 1, 0.2, SH7.star); }
}
function magEstallido(F){
  F.boom = true; const H = hero.position; magVara(true); magDedos(true); staffToHand();
  const gs = new THREE.Sprite(magGranMat); gs.renderOrder = 8; gs.position.set(H.x - Math.sin(camYaw) * 0.9, H.y + 1.1, H.z - Math.cos(camYaw) * 0.9); scene.add(gs);   // detrás de Tovan, que posa delante
  foilFx.push({ t: 0, upd(){ const k = Math.min(1, this.t / 0.4); gs.scale.setScalar(0.6 + 4.6 * smooth(k)); magGranMat.opacity = (1 - k) * (1 - k); magGranMat.rotation = Math.sin(this.t * 9) * 0.12; return k < 1; }, fin(){ scene.remove(gs); magGranMat.opacity = 1; } });
  flash('#ffd0ec', 0.4); lightFlash(H.x, 1.5, H.z, 0xff8ad0, 2.6, 10); ringFx(H.x, H.z, 0xff8ad0, 0.3, 5.5, 0.5); ringFx(H.x, H.z, 0xc8a0ff, 0.2, 3.6, 0.4, 0.5);
  burst7(PA7, H.x, H.y + 1, H.z, 30, MAG_COLS, 7, 0.2, 0.8, 1, 1.5, 0.4, SH7.heart);
  for (const e of foilEnemigos(H, 4.2)){ const dx = e.g.position.x - H.x, dz = e.g.position.z - H.z, d = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(16), dx / d, dz / d, 6, null, 1); }
  play('magEstallido'); foilRotulo('<i>♡</i> ¡Transformación mágica! <i>♡</i>', 'magRot', 2.2);
  barkOnce('magLazos', '¡LAZOS! ¡Te han salido lazos! ¡Y brillos! Es lo más bonito que he visto nunca. No llores, Lumen, no llores…');
}
function magPose(){
  const F = MAG.F; if (!F || !F.escena) return; const t = F.t;
  if (t < 0.95){ const k = Math.min(1, t / 0.2);   // girando: brazos arriba, una rodilla doblada
    bl(P.armL.sh.rotation, 'z', -2.6, k); bl(P.armR.sh.rotation, 'z', 2.6, k); bl(P.armL.sh.rotation, 'x', -0.2, k); bl(P.armR.sh.rotation, 'x', -0.2, k); bl(P.armR.sh.rotation, 'y', 0, k);
    bl(P.armL.el.rotation, 'x', -0.3, k); bl(P.armR.el.rotation, 'x', -0.3, k);
    bl(P.legL.hip.rotation, 'x', 0.1, k); bl(P.legR.hip.rotation, 'x', -0.35, k); bl(P.legR.knee.rotation, 'x', 1.2, k); bl(P.legL.knee.rotation, 'x', 0.05, k); bl(P.spine.rotation, 'x', -0.1, k); }
  else { const k = Math.min(1, (t - 0.95) / 0.1);   // pose final: signo de la paz junto al ojo, varita fuera y pierna atrás
    bl(P.armL.sh.rotation, 'x', -2.1, k); bl(P.armL.sh.rotation, 'z', 0.35, k); bl(P.armL.el.rotation, 'x', -2.0, k);
    bl(P.armR.sh.rotation, 'x', -0.6, k); bl(P.armR.sh.rotation, 'y', 0, k); bl(P.armR.sh.rotation, 'z', 1.25, k); bl(P.armR.el.rotation, 'x', -0.3, k);
    bl(P.legR.hip.rotation, 'x', 0.45, k); bl(P.legR.knee.rotation, 'x', 1.3, k); bl(P.legL.hip.rotation, 'x', 0, k); bl(P.legL.knee.rotation, 'x', 0.05, k);
    bl(P.spine.rotation, 'y', 0.25, k); bl(P.neck.rotation, 'z', 0.18, k); bl(P.neck.rotation, 'x', 0.05, k); }
}
function magPost(){ const F = MAG.F; if (F && F.escena && F.t >= 0.95) M.face.uniforms.uMap.value = faceHappy; }
// corazones que buscan al enemigo más cercano (doce sprites, se reutilizan)
function magCorazones(f, n){
  magLienzos(); if (!MAG.cors.length) for (let i = 0; i < 12; i++){ const s = new THREE.Sprite(magCorMat); s.visible = false; s.renderOrder = 7; s.scale.setScalar(0.55); scene.add(s); MAG.cors.push({ s, vivo: false }); }
  const H = hero.position; staffTip.getWorldPosition(ssjV); if (!isFinite(ssjV.x) || ssjV.distanceTo(H) > 4) ssjV.set(H.x, H.y + 1.2, H.z);
  for (let i = 0; i < n; i++){ const c = MAG.cors.find(q => !q.vivo); if (!c) break;
    const a = f + (i - (n - 1) / 2) * 0.7 + (rnd() - 0.5) * 0.3;
    Object.assign(c, { vivo: true, t: 0, x: ssjV.x, y: Math.max(0.8, ssjV.y), z: ssjV.z, vx: Math.sin(a) * 7, vy: 2.5, vz: Math.cos(a) * 7, e: null, dmg: rdmg(11) });
    c.s.visible = true; c.s.position.set(c.x, c.y, c.z); }
  play('magCampana');
}
function magCorazonesTick(dt){
  for (const c of MAG.cors){ if (!c.vivo) continue; c.t += dt;
    if (!c.e || !c.e.alive){ c.e = null; let bd = 9; for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue; const d = Math.hypot(e.g.position.x - c.x, e.g.position.z - c.z); if (d < bd){ bd = d; c.e = e; } } }
    if (c.e){ const e = c.e, tx = e.g.position.x - c.x, ty = (e.numY || 1.4) * 0.5 - c.y, tz = e.g.position.z - c.z, d = Math.max(0.01, Math.hypot(tx, ty, tz)), sp = 9 + c.t * 6, k = 1 - Math.exp(-dt * 7);
      c.vx += (tx / d * sp - c.vx) * k; c.vy += (ty / d * sp - c.vy) * k; c.vz += (tz / d * sp - c.vz) * k;
      if (Math.hypot(tx, tz) < e.r + 0.35 && Math.abs(ty) < 1.3){ const dh = Math.max(0.01, Math.hypot(tx, tz)); foilGolpea(e, c.dmg, tx / dh, tz / dh, 1.5, null, 0.6);
        burst7(PA7, c.x, c.y, c.z, 8, [0xff8ad0, 0xffffff], 3, 0.14, 0.4, 0, 2, 0.3, SH7.heart); c.vivo = false; c.s.visible = false; play('magPop'); continue; } }
    else c.vy -= 3 * dt;
    c.x += c.vx * dt; c.y = Math.max(0.3, c.y + c.vy * dt); c.z += c.vz * dt; c.s.position.set(c.x, c.y, c.z); c.s.scale.setScalar(0.7 + 0.1 * Math.sin(time * 14 + c.t * 3));
    if (rnd() < 0.5) pa(c.x, c.y, c.z, 0, 0.3, 0, rnd() < 0.5 ? 0xffb0e0 : 0xffffff, 0.08, 0.35, 0, 1, 0.2, SH7.star);
    if (c.t > 1.8){ c.vivo = false; c.s.visible = false; burst7(PA7, c.x, c.y, c.z, 5, [0xffb0e0, 0xffffff], 2, 0.1, 0.3, 0, 2, 0.3, SH7.star); } }
}
// el remate: la «Tiara lunar», una media luna dorada que gira, sale 8 m y vuelve (golpea a la ida y a la vuelta)
function magTiaraConstruye(){
  if (MAG.tiara) return;
  const sh = new THREE.Shape(); sh.absarc(0, 0, 0.7, 1.0257, TAU - 1.0257, false); sh.absarc(0.32, 0, 0.6, TAU - 1.4989, 1.4989, true);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: false, curveSegments: 10 }); geo.translate(0, 0, -0.035); geo.rotateX(-Math.PI / 2);
  const g = new THREE.Group(); mesh(geo, makeMat(0xffd86a, { emissive: 0.7, side: THREE.DoubleSide }), 0, 0, 0, g); mesh(new THREE.OctahedronGeometry(0.12, 0), makeMat(0xff5ab0, { emissive: 0.8 }), -0.49, 0.05, 0, g);
  g.visible = false; scene.add(g); MAG.tiara = g;
}
function magTiara(f){
  magTiaraConstruye(); const T = MAG.tiara; if (T.visible){ magCorazones(f, 4); return; }
  const H = hero.position, O = new V3(H.x, 1.0, H.z), fx = Math.sin(f), fz = Math.cos(f), L = 8, ya1 = new Set(), ya2 = new Set(), dmg = rdmg(32), c = tintaCoge(MAG_ESTELA, 0, 'mag'), pts = [];
  T.visible = true; T.position.copy(O); T.scale.setScalar(0.3);
  foilGrito('¡Tiara lunar!', '#ffb0e0'); play('magTiara');
  foilFx.push({ t: 0, cintas: [c], upd(dt){ const t = this.t, ida = t < 0.45;
      if (ida){ const k = 1 - Math.pow(1 - t / 0.45, 2); T.position.set(O.x + fx * L * k, 1.0, O.z + fz * L * k); }
      else { const P0 = hero.position, dx = P0.x - T.position.x, dz = P0.z - T.position.z, d = Math.hypot(dx, dz), st = Math.min(d, (6 + (t - 0.45) * 30) * dt);
        if (d < 0.6 || t > 2.2) return false; T.position.x += dx / d * st; T.position.z += dz / d * st; T.position.y = lerp(T.position.y, P0.y + 1, 0.2); }
      T.rotation.y += dt * 22; T.scale.setScalar(Math.min(1.9, 0.3 + t * 7));
      pts.push(T.position.clone()); if (pts.length > 14) pts.shift();
      if (pts.length > 1) tintaPinta(c, mtoRuta(pts), 0, 1, q => 0.75 * q);
      if (rnd() < 0.6) pa(T.position.x, T.position.y, T.position.z, rnd() - 0.5, 0.5, rnd() - 0.5, rnd() < 0.5 ? 0xffd86a : 0xffffff, 0.12, 0.4, 0, 1, 0.2, SH7.star);
      const ya = ida ? ya1 : ya2;
      for (const e of enemies){ if (!e.alive || e.spawnT > 0 || ya.has(e)) continue; const dx = e.g.position.x - T.position.x, dz = e.g.position.z - T.position.z, d = Math.hypot(dx, dz);
        if (d < e.r + 1.15 && foilGolpea(e, dmg, dx / Math.max(d, 0.01), dz / Math.max(d, 0.01), 4, null, 1, ya)){ burst7(PA7, e.g.position.x, 1, e.g.position.z, 10, [0xffd86a, 0xff8ad0, 0xffffff], 4, 0.14, 0.4, 1, 2, 0.3, SH7.star); play('magPop'); } }
      return true; },
    fin(){ T.visible = false; } });
}
function magFin(m){
  const F = MAG.F; MAG.F = null; magVara(false); magDedos(false); if (F && F.escena){ hero.position.y = 0; P.spine.rotation.y = 0; }
  if (m === 'tiempo'){ const H = hero.position; burst7(PA7, H.x, 1.2, H.z, 24, MAG_COLS, 4, 0.16, 0.7, -0.5, 1.5, 0.3, SH7.heart); play('magFin'); foilGrito('Fin de la magia ♡', '#ffb0e0'); }
}
function magLimpia(m){ for (const c of MAG.cors){ c.vivo = false; c.s.visible = false; } if (m === 'titulo' || m === 'partida') mtoQuitaMarca('mag'); }
const magNota = (n, i, v, d) => { tone({ type: 'triangle', f0: NOTE(n), dur: d || 0.5, vol: v || 0.05, when: i, rv: 0.7 }); tone({ type: 'sine', f0: NOTE(n + 24), dur: (d || 0.5) * 0.6, vol: (v || 0.05) * 0.35, when: i, rv: 0.7 }); };
Object.assign(SFX, {
  magArpegio: () => { [72, 76, 79, 84, 88, 91, 96, 100].forEach((n, i) => magNota(n, i * 0.08, 0.05, 0.6)); noise({ dur: 1.1, vol: 0.05, f0: 9000, type: 'highpass', attack: 0.2, rv: 0.6 }); },
  magCampana: () => { magNota(96, 0, 0.04, 0.35); magNota(103, 0.06, 0.03, 0.35); },
  magPop: () => { tone({ type: 'sine', f0: 1200, f1: 1900, dur: 0.08, vol: 0.06 }); magNota(100, 0.02, 0.025, 0.25); },
  magEstallido: () => { [84, 88, 91, 96, 100].forEach((n, i) => magNota(n, i * 0.02, 0.06, 1.1)); noise({ dur: 0.6, vol: 0.12, f0: 8000, type: 'highpass', rv: 0.6 }); tone({ type: 'sine', f0: 200, f1: 60, dur: 0.4, vol: 0.25, rv: 0.4 }); },
  magTiara: () => { noise({ dur: 0.5, vol: 0.15, f0: 2000, f1: 800, q: 3, rv: 0.4 }); [91, 96, 100, 103].forEach((n, i) => magNota(n, i * 0.05, 0.035, 0.4)); },
  magFin: () => { [96, 91, 88, 84].forEach((n, i) => magNota(n, i * 0.09, 0.04, 0.6)); }
});
foilPoder({ id: 'foilMagica', ic: '🎀', name: 'Transformación mágica', tags: ['otaku'],
  desc: 'El primer remate de cada oleada te transforma entre lazos y corazones (15 s): el bastón se vuelve una varita, cada golpe dispara corazones que persiguen al enemigo y el remate lanza la «Tiara lunar», una media luna que va y vuelve.',
  remate(f){ magRemate(f); }, tick(dt){ magMarca(); if (dt > 0) magCorazonesTick(dt); }, oleada(){ MAG.usada = false; }, reset(){ MAG.usada = false; }, limpia(m){ magLimpia(m); } });

/* ======================================================================
   TALADRO ESPIRAL (drl)
   ====================================================================== */
const DRL = { n: 0, embiste: null, giga: null, mat: null, peque: null, gigante: null };
const DRL_ESP = [0xf0ffe0, 0x3dff6a, 0xffa020, 0], DRL_ESP2 = [0xfff4d0, 0xff8a1a, 0x7dff9a, 0];
// el taladro: un cono con franjas en espiral (verde y naranja) pintadas en un lienzo, con collar y cubo; dos: el de mano y el colosal
function drlConstruye(){
  if (DRL.mat) return;
  const lienzo = foilLienzo(64, 64, g => { const im = g.createImageData(64, 64), d = im.data;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++){ const q = (x + 3 * y) / 16, b = Math.floor(q) % 2, f = q - Math.floor(q), borde = f < 0.12 || f > 0.92, luz = f > 0.3 && f < 0.5, i = (y * 64 + x) * 4;
      const c = borde ? (b ? [106, 42, 0] : [8, 58, 20]) : b ? (luz ? [255, 196, 96] : [255, 138, 26]) : (luz ? [170, 255, 180] : [46, 232, 90]);
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
    g.putImageData(im, 0, 0); });
  const tex = new THREE.CanvasTexture(lienzo); tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  DRL.mat = makeMat(0xffffff, { map: tex, emissive: 0.55 }); const aro = makeMat(0x9aa0aa, { emissive: 0.1 }), oro = makeMat(0xffd23a, { emissive: 0.4 });
  const geo = new THREE.ConeGeometry(0.45, 2.0, 12, 8); geo.rotateX(Math.PI / 2); geo.translate(0, 0, 1.0);   // la punta hacia +z, la base en z = 0
  const nuevo = () => { const g = new THREE.Group(), m = mesh(geo, DRL.mat, 0, 0, 0, g), fijo = new THREE.Group(), src = new THREE.Group();
    mesh(new THREE.TorusGeometry(0.46, 0.06, 4, 12), oro, 0, 0, 0.02, src); const cubo = mesh(C(0.28, 0.36, 0.3, 8), aro, 0, 0, -0.14, src); cubo.rotation.x = Math.PI / 2;
    mpFusiona(src, fijo); g.add(fijo); g.userData.giro = m; g.visible = false; scene.add(g); return g; };
  DRL.peque = nuevo(); DRL.gigante = nuevo();
}
function drlMarca(){
  if (!mtoEnPartida()){ mtoQuitaMarca('drl'); return; }
  const el = foilMarcador('drl', 'drlMarca'), n = DRL.n;
  if (el.dataset.n !== String(n)){ el.dataset.n = n; el.className = 'foilMarca drlMarca' + (n === 3 ? ' giga' : '');
    el.innerHTML = `<i class="drlEsp"></i><span>${[1, 2, 3].map(k => `<u${k <= n ? ' class="on"' : ''}></u>`).join('')}</span><b>${n === 3 ? '¡GIGA!' : 'GIGA'}</b>`; }
}
// cada remate: embestida taladrando; cada cuarto, el gigataladro
function drlRemate(f){
  const F = FOILX.forma; if (DRL.embiste || DRL.giga || (F && (F.escena || F.t < 0.05))) return;   // (si este mismo remate acaba de abrir una forma, manda ella)
  DRL.n = (DRL.n + 1) % 4; if (DRL.n === 0) drlGiga(f); else drlEmbiste(f); drlMarca();
}
function drlEmbiste(f){
  drlConstruye(); const D = DRL.peque, c1 = mtoCinta(DRL_ESP, 'drl'), c2 = mtoCinta(DRL_ESP2, 'drl');
  const E = DRL.embiste = { t: 0, S: hero.position.clone(), f, fx: Math.sin(f), fz: Math.cos(f), ok: 0, tic: 0, ya: new Set() };
  state = 'normal'; queued = false; staffToHand(); D.visible = true; D.scale.setScalar(0.01);
  play('drlZumbido'); foilGrito('¡Taladro espiral!', '#7dff9a');
  barkOnce('drlTaladro', '¡Eso es un taladro! ¿De dónde lo has sacado? …No me lo digas: del bolsillo de las cosas imposibles.');
  const helice = (fase, r) => (s, v) => { const H = hero.position, a = s * 18 - time * 30 + fase, al = (s - 1) * Math.min(E.ok + 0.6, 3.6) + 1.1;
    return v.set(H.x + E.fx * al + Math.cos(a) * r * E.fz, 1.0 + Math.sin(a) * r, H.z + E.fz * al - Math.cos(a) * r * E.fx); };
  const P1 = helice(0, 0.6), P2 = helice(Math.PI, 0.5);
  foilFx.push({ t: 0, cintas: [c1, c2], upd(dt){
      if (DRL.embiste !== E || player.dead) return false;
      const T = 0.42, k = Math.min(1, this.t / T), dd = 5.2 * (1 - Math.pow(1 - k, 2)), H = hero.position;
      const nx = E.S.x + E.fx * dd, nz = E.S.z + E.fz * dd; if (mpLibre(nx, nz, 0.35)) E.ok = dd;   // no atraviesa muros ni sale de la arena
      H.x = E.S.x + E.fx * E.ok; H.z = E.S.z + E.fz * E.ok; heading = hero.rotation.y = E.f; MOV11.vx = MOV11.vz = 0; state = 'normal'; attackW = 1;
      D.position.set(H.x + E.fx * 0.7, 1.0, H.z + E.fz * 0.7); D.rotation.set(0, E.f, 0); D.scale.setScalar(Math.min(1, this.t / 0.08) * 1.25 * (this.t > T ? Math.max(0.01, 1 - (this.t - T) / 0.12) : 1));
      D.userData.giro.rotation.z += dt * 40;
      const fade = this.t > T ? (this.t - T) / 0.12 : 0;
      tintaPinta(c1, P1, 0, 1, q => 0.24 * q); tintaPinta(c2, P2, 0, 1, q => 0.18 * q); c1.mat.uniforms.uAlpha.value = c2.mat.uniforms.uAlpha.value = 1 - fade;
      E.tic -= dt;
      if (E.tic <= 0 && this.t <= T){ E.tic = 0.07;   // golpes múltiples a todo lo que atraviesa
        for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue; const dx = e.g.position.x - H.x, dz = e.g.position.z - H.z, al = dx * E.fx + dz * E.fz, pe = Math.abs(dx * E.fz - dz * E.fx);
          if (al > -0.6 && al < 2.8 && pe < 0.9 + e.r && foilGolpea(e, rdmg(8), E.fx, E.fz, 2.2, null, 0.6)){ E.ya.add(e); sparks(e.g.position.x, 1, e.g.position.z, 5, rnd() < 0.5 ? 0x7dff9a : 0xffb040, 4); } }
        sparks(D.position.x + E.fx * 2.4, 1, D.position.z + E.fz * 2.4, 3, 0xffd060, 3); }
      if (this.t > T && !E.fin){ E.fin = true;   // el último empujón
        for (const e of E.ya) if (e.alive) foilGolpea(e, rdmg(14), E.fx, E.fz, 6, null, 1);
        ringFx(H.x + E.fx * 1.8, H.z + E.fz * 1.8, 0x7dff9a, 0.3, 2.4, 0.3, 1); shake = Math.max(shake, 0.25); }
      return this.t < T + 0.12; },
    fin(){ D.visible = false; if (DRL.embiste === E){ DRL.embiste = null; attackW = Math.min(attackW, 0.5); } } });
}
// el gigataladro: Tovan salta señalando el cielo y uno colosal (~20 m) cae delante, se hunde girando y deja un cráter
function drlGiga(f){
  drlConstruye(); const H = hero.position, lim = clampArena(new V3(H.x + Math.sin(f) * 6, 0, H.z + Math.cos(f) * 6), ARENA - 1), x = lim.x, z = lim.z;
  const D = DRL.gigante, c1 = mtoCinta(DRL_ESP, 'drl'), c2 = mtoCinta(DRL_ESP2, 'drl'), G = DRL.giga = { t: 0, x, z, boom: false };
  state = 'normal'; attackW = 0; queued = false; staffToBack(); MOV11.vx = MOV11.vz = 0; if (grounded){ vy = 10; grounded = false; }
  D.visible = false; D.scale.setScalar(10); D.rotation.set(Math.PI / 2, 0, 0); D.position.set(x, 62, z);
  foilRotulo('<b>¡GIGATALADRO!</b><small>¡¿Quién te crees que soy?!</small>', 'drlRot', 2.6); play('drlGiga');
  barkOnce('drlGiga', '¡¿Eso es un taladro del tamaño de una torre?! Vale, ya no pregunto nada más. Nunca.');
  const helice = (fase) => (s, v) => { const a = s * 14 + time * 14 + fase, r = 0.6 + s * 4.2, y = D.position.y - 20 + s * 17; return v.set(x + Math.cos(a) * r, Math.max(0.2, y), z + Math.sin(a) * r); };
  const P1 = helice(0), P2 = helice(Math.PI);
  foilFx.push({ t: 0, cintas: [c1, c2], upd(dt){
      const t = this.t; G.t = t; if (DRL.giga !== G) return false;
      if (!FOILX.forma && t < 1.6) FOILX.camK = Math.max(FOILX.camK, 1.5);   // la cámara se aleja para verlo caer
      D.userData.giro.rotation.z += dt * (t < 0.75 ? 14 : 10);
      if (t < 0.15){ D.visible = false; c1.m.visible = c2.m.visible = false; return true; }
      D.visible = true; c1.m.visible = c2.m.visible = true;
      if (t < 0.75){ const k = (t - 0.15) / 0.6; D.position.y = lerp(62, 20, k * k);
        if (Math.floor(t * 8) !== Math.floor((t - dt) * 8)) ringFx(x, z, 0x7dff9a, 4.5, 0.6, 0.3, 0.06); }
      else { if (!G.boom) drlImpacto(G); D.position.y = 20 - 3 * smooth(Math.min(1, (t - 0.75) / 0.25));
        if (t > 1.6){ const k3 = Math.min(1, (t - 1.6) / 0.4); D.position.y = 17 - 6 * k3; D.scale.setScalar(10 * (1 - 0.6 * k3)); } }
      const fade = t > 1.3 ? Math.min(1, (t - 1.3) / 0.4) : 0;
      tintaPinta(c1, P1, 0, 1, q => 0.6 + q * 0.6); tintaPinta(c2, P2, 0, 1, q => 0.5 + q * 0.5); c1.mat.uniforms.uAlpha.value = c2.mat.uniforms.uAlpha.value = 1 - fade;
      return t < 2.0; },
    fin(){ D.visible = false; if (DRL.giga === G) DRL.giga = null; } });
}
function drlImpacto(G){
  G.boom = true; const x = G.x, z = G.z, O = new V3(x, 0, z), dmg = rdmg(80);
  for (const e of foilEnemigos(O, 6.5)){ const dx = e.g.position.x - x, dz = e.g.position.z - z, d = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, dmg, dx / d, dz / d, 10, null, 2); }
  titCrater(x, z, 3.2); ringFx(x, z, 0x7dff9a, 0.5, 10, 0.6); ringFx(x, z, 0xffa020, 0.4, 7, 0.5, 0.3); ringFx(x, z, 0xffffff, 0.3, 4, 0.35, 0.6);
  for (let i = 0; i < 34; i++){ const a = rnd() * TAU, v = 3 + rnd() * 7; spawnFx(x + Math.cos(a) * 1.2, 0.4, z + Math.sin(a) * 1.2, Math.cos(a) * v, 5 + rnd() * 7, Math.sin(a) * v, [0x7a6a5a, 0x9a8a78, 0x7dff9a, 0xffa020][i % 4], 0.16 + rnd() * 0.14, 1.1, 16, 0); }
  ring7(PN7, x, 0.3, z, 24, [0xd8cfc0, 0xb8a898, 0xc8bca8], 9, 1.0, 0.9, 1, 2.5, 2.6, SH7.dot);
  shake = Math.max(shake, 0.95); hitStop = Math.max(hitStop, 0.12); flash('#e8ffd8', 0.4); lightFlash(x, 2, z, 0x9dff7a, 3.5, 16); play('bossSlam'); play('drlBoom');
}
function drlPose(){
  const k = 1;
  if (DRL.embiste){   // embistiendo con el taladro por delante
    for (const A of [P.armL, P.armR]){ bl(A.sh.rotation, 'x', -1.45, k); bl(A.sh.rotation, 'y', 0, k); bl(A.el.rotation, 'x', -0.15, k); }
    bl(P.armL.sh.rotation, 'z', 0.3, k); bl(P.armR.sh.rotation, 'z', -0.3, k); bl(P.spine.rotation, 'x', 0.4, k); bl(P.spine.rotation, 'y', 0, k);
    bl(P.legL.hip.rotation, 'x', -0.7, k); bl(P.legL.knee.rotation, 'x', 0.6, k); bl(P.legR.hip.rotation, 'x', 0.5, k); bl(P.legR.knee.rotation, 'x', 0.3, k); }
  const G = DRL.giga;
  if (G && G.t < 1.2){ const w = Math.min(1, G.t / 0.1);   // señala el cielo: «¡¿quién te crees que soy?!»
    bl(P.armR.sh.rotation, 'x', -2.95, w); bl(P.armR.sh.rotation, 'y', 0, w); bl(P.armR.sh.rotation, 'z', 0.15, w); bl(P.armR.el.rotation, 'x', 0, w);
    bl(P.armL.sh.rotation, 'z', 0.5, w); bl(P.armL.el.rotation, 'x', -1.6, w); bl(P.neck.rotation, 'x', -0.35, w); }
}
function drlLimpia(m){ DRL.embiste = null; DRL.giga = null; if (DRL.peque){ DRL.peque.visible = false; DRL.gigante.visible = false; } if (m === 'titulo' || m === 'partida') mtoQuitaMarca('drl'); }
Object.assign(SFX, {
  drlZumbido: () => { for (let i = 0; i < 9; i++) tone({ type: 'sawtooth', f0: 150 + (i % 2) * 70, f1: 190 + (i % 2) * 70, dur: 0.05, vol: 0.07, when: i * 0.048 }); noise({ dur: 0.45, vol: 0.12, f0: 1800, q: 4, rv: 0.2 }); },
  drlGiga: () => { tone({ type: 'sine', f0: 2200, f1: 200, dur: 0.75, vol: 0.1, rv: 0.4 }); tone({ type: 'sawtooth', f0: 90, f1: 160, dur: 0.8, vol: 0.08, rv: 0.3 }); noise({ dur: 0.7, vol: 0.1, f0: 600, f1: 2400, q: 1.5, rv: 0.3 }); },
  drlBoom: () => { tone({ type: 'sine', f0: 70, f1: 22, dur: 1.3, vol: 0.7, rv: 0.7 }); noise({ dur: 1.1, vol: 0.4, f0: 1500, f1: 100, type: 'lowpass', rv: 0.6 });
    for (let i = 0; i < 6; i++) tone({ type: 'sawtooth', f0: 120, f1: 60, dur: 0.06, vol: 0.06, when: 0.1 + i * 0.07 }); }
});
foilPoder({ id: 'foilTaladro', ic: '🌀', name: 'Taladro espiral', tags: ['otaku'],
  desc: 'Taladra los cielos: cada remate saca del bastón un taladro espiral gigante y embistes 5 m taladrando todo lo que atraviesas. Cada cuarto remate es el «¡GIGATALADRO!»: saltas y uno colosal cae del cielo delante de ti.',
  remate(f){ drlRemate(f); }, tick(){ drlMarca(); }, pose(){ drlPose(); }, herido(){ if (DRL.embiste) return 'none'; },
  reset(){ DRL.n = 0; }, limpia(m){ drlLimpia(m); } });

/* ======================================================================
   MOTO ROJA (mto)
   ====================================================================== */
const MTO = { ult: -9, fin: -99, F: null, g: null, piv: null, ruedas: null, luces: null, hist: [[], []], cintas: null, carga: null, derrape: null, cd: 0, son: null, yaw: 0, lean: 0, velK: 0 };
const MTO_LUZ = [0xfff0f0, 0xff1a2a, 0xffffff, 0];
// la moto (low-poly): carrocería larga y roja, ruedas grandes con llantas que brillan, faro, pilotos y pegatinas; la carrocería, fundida
// la moto (el modelo está en js/poderes/vehiculos.js): el pivote del caballito va en la rueda de atrás
function mtoConstruye(){
  if (MTO.g) return;
  const v = vehMoto(); MTO.g = v.g; MTO.piv = v.piv; MTO.ruedas = v.ruedas; MTO.luces = v.luces; v.g.visible = false; scene.add(v.g);
}
// rodar dos veces seguidas (la segunda en menos de 0,5 s) la invoca
function mtoRodar(){
  if (FOILX.forma || time - MTO.fin < 10) return false;   // descansa 10 s entre viaje y viaje
  const antes = MTO.ult; MTO.ult = time;
  if (antes < 0 || time - antes > 0.5) return false;
  MTO.ult = -9; return mtoInvoca();
}
function mtoInvoca(){
  if (!grounded || NUCA.m || !foilEscenario()) return false;
  mtoConstruye();
  const F = foilForma({ id: 'mto', nom: 'MOTO ROJA', col: '#ff3a4a', dur: 14, velK: 1.9, alto: 0,
    contacto: { r: 1.3, dmg: () => rdmg(10 + 16 * Math.min(1, MTO.velK)), cd: 0.55, knock: 7, al: e => sparks(e.g.position.x, 0.8, e.g.position.z, 6, 0xffd060, 4) },
    ataque(){ mtoCaballito(); }, rodar(){ return mtoDerrape(); }, herido(){ if (MTO.derrape) return 'none'; },
    tick(dt){ mtoTick(dt); }, pose(){ mtoPose(); }, postPose(){ mtoPost(); }, fin(m){ MTO.fin = time; mtoFin(m); } });
  if (!F) return false;
  MTO.F = F; MTO.yaw = 1.3; MTO.lean = 0; MTO.carga = null; MTO.derrape = null; MTO.cd = 0.3; MTO.hist = [[], []];
  if (state === 'roll'){ state = 'normal'; P.body.rotation.x = 0; P.body.scale.setScalar(1); }
  MTO.g.visible = true; MTO.cintas = [mtoCinta(MTO_LUZ), mtoCinta(MTO_LUZ)];
  mtoSonido(true); play('mtoArranque'); play('mtoChirrido');
  foilRotulo('<b>¡A TODO GAS!</b>', 'mtoRot', 1.8);
  barkOnce('mtoMoto', '¡Esa moto deja estelas! Las luces se quedan pintadas en el aire. Quiero una. Bueno, quiero SER una.');
  return true;
}
// atacar: caballito y embestida corta muy fuerte
function mtoCaballito(){
  if (MTO.carga || MTO.derrape || MTO.cd > 0 || !grounded) return;
  const f = inputMag > 0.12 ? inputHeading : hero.rotation.y;
  MTO.carga = { t: 0, S: hero.position.clone(), f, fx: Math.sin(f), fz: Math.cos(f), ok: 0, ya: new Set() }; MTO.cd = 0.55;
  play('mtoCaballito');
}
// rodar: el derrape; la moto se cruza de lado, patina con chispas y la estela barre en abanico
function mtoDerrape(){
  if (MTO.derrape || MTO.carga || MTO.cd > 0 || !grounded) return true;   // en moto no se rueda
  const dir = inputMag > 0.12 ? inputHeading : hero.rotation.y, da = Math.sin(dir - hero.rotation.y), lado = Math.abs(da) > 0.15 ? Math.sign(da) : (rnd() < 0.5 ? -1 : 1);
  MTO.derrape = { t: 0, S: hero.position.clone(), dir, dx: Math.sin(dir), dz: Math.cos(dir), lado, ok: 0, golpe: false }; MTO.cd = 0.75;
  play('mtoChirrido');
  return true;
}
function mtoTick(dt){
  const F = MTO.F; if (!F || dt <= 0) return; const H = hero.position;
  F.alto = 0.04 + 0.2 * (1 - smooth(Math.min(1, F.t / 0.25)));   // se sube de un salto y se encaja en el asiento
  MTO.velK = clamp(Math.hypot(MOV11.vx, MOV11.vz) / 6.8, 0, 1.4); if (MTO.cd > 0) MTO.cd -= dt;
  if (F.t < 0.4){ MTO.yaw = 1.3 * (1 - smooth(F.t / 0.4)); mtoChispas(3); if (rnd() < 0.5) puffAt(H.x, H.z, 1, 1.2, 0xc8c0b8); }   // llega derrapando
  const C = MTO.carga;
  if (C){ C.t += dt; const k = Math.min(1, C.t / 0.38), dd = 4.2 * (1 - Math.pow(1 - k, 2));
    if (mpLibre(C.S.x + C.fx * dd, C.S.z + C.fz * dd, 0.4)) C.ok = dd;
    H.x = C.S.x + C.fx * C.ok; H.z = C.S.z + C.fz * C.ok; heading = hero.rotation.y = C.f; MOV11.vx = C.fx * 7; MOV11.vz = C.fz * 7;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || C.ya.has(e)) continue; const dx = e.g.position.x - H.x, dz = e.g.position.z - H.z, al = dx * C.fx + dz * C.fz, pe = Math.abs(dx * C.fz - dz * C.fx);
      if (al > -0.4 && al < 1.9 + e.r && pe < 0.8 + e.r && foilGolpea(e, rdmg(34), C.fx, C.fz, 9, null, 1.2, C.ya)){ sparks(e.g.position.x, 0.9, e.g.position.z, 10, 0xffd060, 5); shake = Math.max(shake, 0.3); hitStop = Math.max(hitStop, 0.05); play('mtoGolpe'); } }
    if (C.t > 0.45){ MTO.carga = null; MOV11.vx *= 0.5; MOV11.vz *= 0.5; } }
  const D = MTO.derrape;
  if (D){ D.t += dt; const T = 0.6, t = Math.min(D.t, T), dd = 9 * (t - t * t / (2 * T));
    if (mpLibre(D.S.x + D.dx * dd, D.S.z + D.dz * dd, 0.4)) D.ok = dd;
    H.x = D.S.x + D.dx * D.ok; H.z = D.S.z + D.dz * D.ok; heading = D.dir; MOV11.vx = MOV11.vz = 0;
    hero.rotation.y = D.dir + D.lado * 1.35 * smooth(Math.min(1, D.t / 0.12)); MTO.yaw = 0; mtoChispas(4);   // moto y piloto se cruzan; el patinazo sigue el rumbo if (rnd() < 0.6) puffAt(H.x, H.z, 1, 1.4, 0xc8c0b8);
    if (!D.golpe && D.t > 0.08){ D.golpe = true; mtoAbanico(D); }
    if (D.t >= T){ MTO.derrape = null; heading = hero.rotation.y = D.dir + D.lado * 1.35; } }
}
// chispas que saltan de la rueda de atrás
function mtoChispas(n){
  const f = hero.rotation.y + MTO.yaw, H = hero.position, x = H.x + Math.sin(f) * (0.28 + VEH_MOTO.zr), z = H.z + Math.cos(f) * (0.28 + VEH_MOTO.zr);
  for (let i = 0; i < n; i++){ const a = f + Math.PI + (rnd() - 0.5) * 1.6, v = 2 + rnd() * 4; spawnFx(x, 0.1, z, Math.sin(a) * v, 1 + rnd() * 2.5, Math.cos(a) * v, rnd() < 0.5 ? 0xffd060 : 0xff8a2a, 0.05, 0.35, 12, 0); }
}
function mtoAbanico(D){
  const O = hero.position.clone(), R = 4.2, dmg = rdmg(30), a0 = D.dir + Math.PI, a1 = D.dir + Math.PI - D.lado * 2.7;
  const c = mtoCinta(MTO_LUZ), c2 = mtoCinta(MTO_LUZ), P = (s, v) => { const a = lerp(a0, a1, s); return v.set(O.x + Math.sin(a) * R * 0.78, 0.6, O.z + Math.cos(a) * R * 0.78); };
  foilFx.push({ t: 0, cintas: [c, c2], upd(){ const k = Math.min(1, this.t / 0.22), fade = Math.max(0, (this.t - 0.3) / 0.5); if (fade >= 1) return false;
      tintaPinta(c, P, Math.max(0, k - 0.95), k, q => 0.6 * q); tintaPinta(c2, (s, v) => P(s, v).setY(0.25), Math.max(0, k - 0.95), k * 0.96, q => 0.35 * q);
      c.mat.uniforms.uAlpha.value = c2.mat.uniforms.uAlpha.value = 1 - fade; return true; } });
  for (const e of foilEnemigos(O, R)){ const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.01, Math.hypot(dx, dz)); if (foilGolpea(e, dmg, dx / d, dz / d, 8, null, 1.2)) sparks(e.g.position.x, 0.8, e.g.position.z, 8, 0xff6a7a, 4); }
  ringFx(O.x, O.z, 0xff2a3a, 0.5, R, 0.35); shake = Math.max(shake, 0.3);
}
function mtoPose(){
  const F = MTO.F; if (!F) return; const k = Math.min(1, F.t / 0.2);
  P.hips.position.y = 0.67;
  for (const [L, s] of [[P.legL, -1], [P.legR, 1]]){ bl(L.hip.rotation, 'x', -1.1, k); bl(L.hip.rotation, 'z', 0.45 * s, k); bl(L.knee.rotation, 'x', 1.3, k); }   // rodillas abiertas contra el carenado
  for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -1.6, k); bl(A.sh.rotation, 'y', 0, k); bl(A.sh.rotation, 'z', 0.12 * s, k); bl(A.el.rotation, 'x', -0.3, k); bl(A.el.rotation, 'z', 0, k); }
  bl(P.spine.rotation, 'x', 0.85, k); bl(P.spine.rotation, 'y', 0, k); bl(P.neck.rotation, 'x', -0.75, k); bl(P.neck.rotation, 'y', 0, k);   // tumbado sobre el depósito
  const C = MTO.carga, env = C ? Math.sin(Math.min(1, C.t / 0.45) * Math.PI) : 0;
  P.body.rotation.z = MTO.lean; P.body.rotation.x = -0.4 * env;
}
// después de colocar a Tovan: la moto debajo, inclinada, con las ruedas girando, y las estelas de los pilotos
function mtoPost(){
  const F = MTO.F; if (!F) return; const g = MTO.g, H = hero.position, f = hero.rotation.y + MTO.yaw, sc = hero.scale.x;
  const D = MTO.derrape, obj = D ? -D.lado * 0.35 : clamp(MOV11.bank * 2.4, -0.6, 0.6); MTO.lean = lerp(MTO.lean, obj, 0.25);
  g.position.set(H.x + Math.sin(f) * 0.28 * sc, H.y, H.z + Math.cos(f) * 0.28 * sc); g.rotation.set(0, f, MTO.lean); g.scale.setScalar(sc);
  const C = MTO.carga; MTO.piv.rotation.x = C ? -0.55 * Math.sin(Math.min(1, C.t / 0.45) * Math.PI) : 0;
  const v = Math.hypot(MOV11.vx, MOV11.vz) + (D ? 6 : 0); for (const w of MTO.ruedas) w.rotation.x += v * mtoDt() / 0.36;
  mtoEstelas(1);
}
let mtoT0 = null;
function mtoDt(){ const d = mtoT0 == null ? 0 : clamp(time - mtoT0, 0, 0.1); mtoT0 = time; return d; }
// las estelas: el último segundo de recorrido de los dos pilotos
function mtoEstelas(alfa){
  const cs = MTO.cintas; if (!cs) return; MTO.g.updateMatrixWorld(true);
  for (let i = 0; i < 2; i++){ const L = MTO.hist[i]; MTO.luces[i].getWorldPosition(ssjW);
    const u = L[L.length - 1]; if (!u || u.p.distanceToSquared(ssjW) > 0.0009 || time - u.t > 0.05) L.push({ p: ssjW.clone(), t: time }); else u.p.copy(ssjW);
    while (L.length > 2 && (time - L[0].t > 1.0 || L.length > 44)) L.shift();
    const c = cs[i]; c.m.visible = L.length > 1;
    if (c.m.visible){ const pts = L.map(o => o.p); tintaPinta(c, mtoRuta(pts), 0, 1, q => 0.14 + 0.16 * q); c.mat.uniforms.uAlpha.value = alfa; } }
}
function mtoFin(m){
  MTO.F = null; MTO.carga = null; MTO.derrape = null; mtoSonido(false);
  P.legL.hip.rotation.z = P.legR.hip.rotation.z = 0; P.body.rotation.x = 0; P.body.rotation.z = 0;
  const g = MTO.g, cs = MTO.cintas; MTO.cintas = null; if (!g) return;
  if (m === 'tiempo' && cs && gameState === 'play'){   // se va sola, dejando las estelas
    const f = g.rotation.y, fx = Math.sin(f), fz = Math.cos(f); MTO.cintas = cs; MTO.lean = 0; g.rotation.z = 0; MTO.piv.rotation.x = 0;
    play('mtoSale'); puff(8); foilGrito('¡Hasta la próxima!', '#ff6a7a');
    foilFx.push({ t: 0, cintas: cs, upd(dt){ const t = this.t; if (MTO.F || t > 0.9) return false;
        const v = 8 + t * 40; g.position.x += fx * v * dt; g.position.z += fz * v * dt; g.visible = t < 0.55; for (const w of MTO.ruedas) w.rotation.x += v * dt / 0.36;
        mtoEstelas(1 - t / 0.9); return true; },
      fin(){ if (MTO.cintas === cs) MTO.cintas = null; if (!MTO.F) g.visible = false; } });
  } else { g.visible = false; if (cs) cs.forEach(tintaSuelta); }
}
// motor: dos osciladores por un paso bajo; el tono sube con la velocidad (callado en pausa o con los efectos apagados)
function mtoSonido(on){
  if (!actx) return;
  if (on && !MTO.son){ try { const o1 = actx.createOscillator(), o2 = actx.createOscillator(), lp = actx.createBiquadFilter(), g = actx.createGain();
      o1.type = 'sawtooth'; o2.type = 'square'; o1.frequency.value = 50; o2.frequency.value = 25; lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 2; g.gain.value = 0;
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(sfxBus); o1.start(); o2.start(); MTO.son = { o1, o2, lp, g }; } catch (err) {} }
  else if (!on && MTO.son){ const s = MTO.son; MTO.son = null; try { const t = actx.currentTime; s.g.gain.setTargetAtTime(0, t, 0.08); s.o1.stop(t + 0.5); s.o2.stop(t + 0.5); } catch (err) {} }
}
function mtoSonidoTick(){
  const s = MTO.son; if (!s || !actx) return;
  const t = actx.currentTime, k = MTO.velK + (MTO.carga ? 0.5 : 0) + (MTO.derrape ? 0.3 : 0), on = sfxOn && gameState === 'play', f = 42 + 85 * k + 4 * Math.sin(time * 31);
  s.o1.frequency.setTargetAtTime(f, t, 0.06); s.o2.frequency.setTargetAtTime(f * 0.5, t, 0.06); s.lp.frequency.setTargetAtTime(500 + 900 * Math.min(1.5, k), t, 0.08);
  s.g.gain.setTargetAtTime(on ? 0.045 + 0.03 * Math.min(1, k) : 0, t, 0.06);
}
function mtoLimpia(){ mtoSonido(false); if (MTO.g && !MTO.F){ MTO.g.visible = false; } if (MTO.cintas){ MTO.cintas.forEach(tintaSuelta); MTO.cintas = null; } }
Object.assign(SFX, {
  mtoArranque: () => { tone({ type: 'sawtooth', f0: 60, f1: 230, dur: 0.5, vol: 0.12, rv: 0.2 }); tone({ type: 'sawtooth', f0: 230, f1: 120, dur: 0.4, vol: 0.08, when: 0.45, rv: 0.2 }); noise({ dur: 0.6, vol: 0.12, f0: 500, f1: 1500, q: 1, rv: 0.2 }); },
  mtoChirrido: () => { noise({ dur: 0.55, vol: 0.2, f0: 2600, f1: 1800, q: 8, rv: 0.2 }); tone({ type: 'triangle', f0: 1700, f1: 1150, dur: 0.5, vol: 0.05, rv: 0.2 }); },
  mtoCaballito: () => { tone({ type: 'sawtooth', f0: 90, f1: 260, dur: 0.35, vol: 0.12, rv: 0.2 }); noise({ dur: 0.3, vol: 0.12, f0: 800, f1: 2400, q: 1 }); },
  mtoGolpe: () => { tone({ type: 'sine', f0: 140, f1: 45, dur: 0.3, vol: 0.5, rv: 0.3 }); noise({ dur: 0.18, vol: 0.3, f0: 1200, f1: 300, type: 'lowpass' }); },
  mtoSale: () => { tone({ type: 'sawtooth', f0: 120, f1: 420, dur: 0.8, vol: 0.1, rv: 0.4 }); noise({ dur: 0.8, vol: 0.1, f0: 1200, f1: 3000, q: 1, rv: 0.3 }); }
});
foilPoder({ id: 'foilMoto', ic: '🏍️', name: 'Moto roja', tags: ['otaku'],
  desc: 'Una moto de neo-Tokio te espera: rueda dos veces seguidas y llega derrapando (14 s). Vas mucho más rápido, atropellas y dejas estelas de luz roja. Atacar = caballito y embestida; rodar = derrape de lado que golpea en abanico.',
  rodar(){ return mtoRodar(); }, tick(){ mtoSonidoTick(); }, reset(){ MTO.ult = -9; MTO.fin = -99; }, limpia(m){ mtoLimpia(m); } });

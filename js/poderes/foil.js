'use strict';
/* ======================================================================
   PODERES LEGENDARIOS FOIL
   Una rareza por encima de las legendarias, con carta holográfica. No
   salen en el reparto normal: se ganan (por ahora, salvando el paquete
   de la horda de ladrones; ver js/partida/objetivos-hordas.js).
   Cambian los ataques normales: cada golpe deja un trazo de tinta y el
   remate del combo (el último golpe) lanza una técnica, y cada una abre
   una forma de jugar:
     · Respiración del agua (la rara de antes, reconvertida): el remate
       suelta un dragón de agua que recorre el campo. Fluir: si ruedas
       mientras está fuera, cabalgas su corriente hasta la cabeza.
     · Mil pájaros (de una de ninjas): el remate es un relámpago azul que
       atraviesa a seis enemigos y apareces detrás del último. Carga: si
       te quedas quieto, el siguiente llega el doble de lejos y pega más.
     · Puño de fuego (de una de piratas): cada golpe deja un arco de fuego;
       el Ardor sube mientras no te den; el remate es un puño de llamas y,
       con el Ardor al máximo, «Gran llamarada», un sol que lo arrasa todo.
   Cada una viene de una serie distinta, como el resto de poderes otaku, y
   cada una tiene su estética:
     · Agua: cintas con shader de pincel (centro claro, cuerpo de color,
       vetas de cerdas y borde de tinta negro y roto, como la tinta china).
     · Mil pájaros: rayos azules que tiemblan (el camino se rehace 24 veces
       por segundo), con ramas, y la bola de chispas en la mano.
     · Puño de fuego: llamas que lamen (ruido que corre por la cinta), el
       puño de fuego al frente y, para la Gran llamarada, un sol.
   ====================================================================== */
RAR.foil = ['Foil', '#eaf6ff', 0];
const FOIL_IDS = ['waterBreath', 'foilChidori', 'foilHiken'];
const FOIL = { premio: false, pend: 0, danza: 0, quieto: 0, iai: false, fluir: null };
{ const u = UPGRADES.find(x => x.id === 'waterBreath');
  Object.assign(u, { r: 'foil', tags: ['otaku', 'hielo'], ic: '🌊', name: 'Respiración del agua', max: 1, req: () => FOIL.premio,
    desc: 'Décima forma: al rematar el combo, un dragón de agua sale de tu arma y recorre el campo arrastrando todo lo que toca (mucho daño y los moja: se congelan antes). Fluir: si ruedas mientras está fuera, cabalgas su corriente hasta la cabeza, intocable.' }); }
UPGRADES.push(
  { id: 'foilChidori', r: 'foil', tags: ['otaku', 'rayo'], ic: '⚡', name: 'Mil pájaros', max: 1, req: () => FOIL.premio, apply: () => {},
    desc: 'Técnica de ninja copiada (sin permiso): al rematar el combo, tu mano trina como mil pájaros, cruzas en un relámpago hasta a seis enemigos uno tras otro y apareces detrás del último; la descarga llega después. Carga: quieto un momento, el siguiente llega el doble de lejos y pega un 50 % más.' },
  { id: 'foilHiken', r: 'foil', tags: ['otaku', 'fuego'], ic: '🔥', name: 'Puño de fuego', max: 1, req: () => FOIL.premio, apply: () => {},
    desc: 'Comiste una fruta rara (sabía a pimiento): cada golpe deja un arco de fuego. Ardor: cada golpe que acierta sin que te den lo sube (máx. 12, +5 % de daño cada uno). El remate lanza un puño de llamas en línea recta, y con el Ardor al máximo, «Gran llamarada»: un sol que arrasa todo a 6 m.' }
);

/* ---------- Trazos de tinta: cintas de pincel que miran a la cámara ---------- */
const TINTA_N = 72;
const TINTA_VS = 'attribute vec2 aUV; varying vec2 vUV; void main(){ vUV = aUV; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const TINTA_FS = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  float u = vUV.x, a = abs(vUV.y), m = u * uLen;
  float brocha = n2(vec2(m * 1.7 + uSeed, vUV.y * 2.5)) * 0.65 + n2(vec2(m * 6.0 - uSeed, vUV.y * 8.0)) * 0.35;   // borde irregular
  float veta = n2(vec2(m * 0.8 - uTime * 1.5 + uSeed, vUV.y * 24.0));                                             // cerdas a lo largo
  float fuera = 0.84 + 0.16 * brocha;
  if (a > fuera) discard;
  float seco = (1.0 - smoothstep(0.0, 0.45, u)) * uSeco;                                                           // la cola, más seca
  if (veta < seco * 0.85 && a > 0.12) discard;
  vec3 col = mix(uB, uA, smoothstep(0.62, 0.05, a));                                                               // del cuerpo al centro claro
  col = mix(col, uC, smoothstep(0.58, 0.9, veta) * (1.0 - smoothstep(0.25, 0.62, a)));                             // vetas
  col = mix(col, uE, smoothstep(fuera - 0.2, fuera - 0.12, a));                                                    // borde de tinta
  gl_FragColor = vec4(col, uAlpha * smoothstep(0.0, 0.08, u));
}`;
// Rayo (aditivo): núcleo blanco y halo de color que parpadea a saltos, con cortes que bailan
const RAYO_FS = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float a = abs(vUV.y), tic = floor(uTime * 24.0);
  float core = 1.0 - smoothstep(0.03, 0.15, a), glow = pow(1.0 - a, 1.8);
  float flick = 0.65 + 0.35 * h1(vec2(tic, uSeed));
  float corte = step(0.14, h1(vec2(floor(vUV.x * uLen * 2.5) + tic * 7.0, uSeed)));
  vec3 col = uB * glow * 1.7 + uA * core;
  gl_FragColor = vec4(col, uAlpha * flick * mix(1.0, corte, 0.4) * smoothstep(0.0, 0.03, vUV.x) * clamp(core + glow, 0.0, 1.0));
}`;
// Llama: borde que lame (ruido que corre por la cinta), del blanco amarillo del centro al rojo del borde
const FUEGO_FS = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), f.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), f.x), f.y); }
void main(){
  float u = vUV.x, a = abs(vUV.y), m = u * uLen;
  float n = n2(vec2(m * 1.3 - uTime * 7.0 + uSeed, vUV.y * 2.2 - uTime * 1.6)) * 0.6 + n2(vec2(m * 3.7 - uTime * 13.0, vUV.y * 6.0 + uSeed)) * 0.4;
  float borde = 0.42 + 0.58 * n * (0.6 + 0.4 * u);
  if (a > borde) discard;
  float t = a / borde;
  vec3 col = mix(uA, uB, smoothstep(0.05, 0.5, t)); col = mix(col, uC, smoothstep(0.55, 0.95, t));
  gl_FragColor = vec4(col * (1.0 + 0.35 * (1.0 - t)), uAlpha * smoothstep(0.0, 0.1, u));
}`;
const TRAZO_FS = { tinta: TINTA_FS, rayo: RAYO_FS, fuego: FUEGO_FS };
const tintaPool = [];
function tintaCoge(cols, seco, tipo = 'tinta'){
  let c = tintaPool.find(q => !q.usada && q.tipo === tipo);
  if (!c){
    const geo = new THREE.BufferGeometry(), pos = new Float32Array((TINTA_N + 1) * 6), uv = new Float32Array((TINTA_N + 1) * 4), idx = [];
    for (let i = 0; i <= TINTA_N; i++){ uv.set([i / TINTA_N, -1, i / TINTA_N, 1], i * 4); if (i < TINTA_N){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const at = new THREE.BufferAttribute(pos, 3); at.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', at); geo.setAttribute('aUV', new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx);
    const mat = new THREE.ShaderMaterial({ vertexShader: TINTA_VS, fragmentShader: TRAZO_FS[tipo], transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: tipo === 'rayo' ? THREE.AdditiveBlending : THREE.NormalBlending,
      uniforms: { uA: { value: new THREE.Color() }, uB: { value: new THREE.Color() }, uC: { value: new THREE.Color() }, uE: { value: new THREE.Color() },
        uAlpha: { value: 1 }, uSeed: { value: 0 }, uLen: { value: 1 }, uTime: { value: 0 }, uSeco: { value: 1 } } });
    const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = 5; scene.add(m);
    c = { m, geo, pos, mat, tipo }; tintaPool.push(c);
  }
  const U = c.mat.uniforms; U.uA.value.setHex(cols[0]); U.uB.value.setHex(cols[1]); U.uC.value.setHex(cols[2]); U.uE.value.setHex(cols[3]);
  U.uAlpha.value = 1; U.uSeed.value = rnd() * 50; U.uSeco.value = seco == null ? 1 : seco;
  c.usada = true; c.m.visible = true; return c;
}
function tintaSuelta(c){ c.usada = false; c.m.visible = false; }
const _tP = Array.from({ length: TINTA_N + 1 }, () => new V3()), _tT = new V3(), _tV = new V3(), _tS = new V3();
// Pinta la cinta c a lo largo del camino P(s, v) entre s0 (cola) y s1 (cabeza); ancho(k) con k de 0 (cola) a 1 (cabeza)
function tintaPinta(c, P, s0, s1, ancho){
  const N = TINTA_N, pos = c.pos; let L = 0;
  for (let i = 0; i <= N; i++){ P(s0 + (s1 - s0) * i / N, _tP[i]); if (i) L += _tP[i].distanceTo(_tP[i - 1]); }
  for (let i = 0; i <= N; i++){
    const p = _tP[i]; _tT.subVectors(_tP[Math.min(N, i + 1)], _tP[Math.max(0, i - 1)]); _tV.subVectors(camera.position, p);
    _tS.crossVectors(_tT, _tV); const l = _tS.length(); if (l > 1e-6) _tS.multiplyScalar(ancho(i / N) * 0.5 / l); else _tS.set(0, 0, 0);
    pos[i * 6] = p.x - _tS.x; pos[i * 6 + 1] = p.y - _tS.y; pos[i * 6 + 2] = p.z - _tS.z; pos[i * 6 + 3] = p.x + _tS.x; pos[i * 6 + 4] = p.y + _tS.y; pos[i * 6 + 5] = p.z + _tS.z;
  }
  c.geo.attributes.position.needsUpdate = true; c.mat.uniforms.uLen.value = Math.max(0.5, L); c.mat.uniforms.uTime.value = time;
}
// Colores: [centro, cuerpo, vetas o borde, borde de tinta] (en el rayo y la llama solo cuentan los tres primeros)
const TINTA_AGUA = [0xf4fbff, 0x2f7fe8, 0xffffff, 0x05070c], TINTA_AGUA2 = [0xffffff, 0x8fd0ff, 0xffffff, 0x0a1220];
const RAYO_AZUL = [0xffffff, 0x3a9cff, 0xffffff, 0], RAYO_CIAN = [0xf4fdff, 0x8fe6ff, 0xffffff, 0];
const LLAMA = [0xfff7d0, 0xffa020, 0xd8300a, 0], LLAMA_VIVA = [0xffffff, 0xffd060, 0xff6a14, 0];
// Rayo que tiembla: el camino P(s) más un desvío aleatorio que se rehace 24 veces por segundo (los extremos no se mueven)
function rayoTiembla(P, n, amp){
  const tab = Array.from({ length: n + 1 }, () => new V3()); let tic = -1;
  const sacude = () => { for (const v of tab) v.set(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(2 * amp); };
  return (s, v) => { const t = Math.floor(time * 24); if (t !== tic){ tic = t; sacude(); }
    P(s, v); const x = Math.min(1, Math.max(0, s)) * n, i = Math.min(n - 1, Math.floor(x)), q = x - i, env = Math.sin(Math.PI * Math.min(1, Math.max(0, s)));
    return v.addScaledVector(_rjV.lerpVectors(tab[i], tab[i + 1], q), env); };
}
const _rjV = new V3();
// Ramas: rayitos que salen del camino principal hacia fuera
function rayoRamas(P, n, largo){
  return Array.from({ length: n }, () => { const s0 = 0.15 + rnd() * 0.75, dir = new V3(rnd() - 0.5, rnd() * 0.6, rnd() - 0.5).normalize(), L = largo * (0.6 + rnd() * 0.6), o = new V3();
    return { c: tintaCoge(RAYO_CIAN, 0, 'rayo'), P: rayoTiembla((s, v) => { P(s0, o); return v.copy(o).addScaledVector(dir, L * s); }, 4, 0.18) }; });
}
/* ---------- Sprites pintados al cargar (con su propio PRNG: nada de rnd() al cargar) ---------- */
const foilLienzo = (w, h, pinta) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext && c.getContext('2d'); if (g && g.beginPath && g.createRadialGradient) pinta(g); return c; };
const foilSprite = (lienzo, aditivo) => { const t = new THREE.CanvasTexture(lienzo); t.minFilter = THREE.LinearFilter;
  return new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending }); };
// La bola del Chidori: núcleo blanco, halo azul y chispas en zigzag
const chidoriMat = foilSprite(foilLienzo(128, 128, g => { const R = mulberry32(733);
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 60); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.18, 'rgba(200,240,255,0.95)'); gr.addColorStop(0.45, 'rgba(60,150,255,0.45)'); gr.addColorStop(1, 'rgba(20,60,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.lineCap = 'round'; g.lineJoin = 'round';
  for (let k = 0; k < 14; k++){ let a = R() * Math.PI * 2, r = 8, x = 64 + Math.cos(a) * r, y = 64 + Math.sin(a) * r; g.beginPath(); g.moveTo(x, y);
    for (let j = 0; j < 6; j++){ r += 7 + R() * 6; a += (R() - 0.5) * 0.9; x = 64 + Math.cos(a) * r; y = 64 + Math.sin(a) * r; g.lineTo(x, y); }
    g.strokeStyle = 'rgba(120,200,255,0.9)'; g.lineWidth = 3; g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 1.2; g.stroke(); } }), true);
// El puño de fuego: un puño de llamas (nudillos, pulgar) con lenguas de fuego hacia atrás
const punoMat = foilSprite(foilLienzo(256, 192, g => { const R = mulberry32(737);
  const llama = (y0, y1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#fff7d0'); gr.addColorStop(0.45, '#ffb030'); gr.addColorStop(1, '#d8300a'); return gr; };
  for (let k = 0; k < 16; k++){ const y = 30 + R() * 132, len = 70 + R() * 90, w = 10 + R() * 16;   // lenguas hacia atrás (a la izquierda)
    g.beginPath(); g.moveTo(150, y - w); g.quadraticCurveTo(120 - len * 0.4, y - w * 1.6 + (R() - 0.5) * 30, 140 - len, y + (R() - 0.5) * 24); g.quadraticCurveTo(120 - len * 0.3, y + w * 1.4, 150, y + w); g.closePath();
    g.fillStyle = llama(y - 30, y + 30); g.globalAlpha = 0.75; g.fill(); }
  g.globalAlpha = 1; const cuerpo = llama(40, 160);
  g.beginPath(); g.moveTo(120, 52); g.lineTo(196, 46); for (let i = 0; i < 4; i++){ const y = 50 + i * 24; g.quadraticCurveTo(236, y + 2, 230, y + 14); g.quadraticCurveTo(236, y + 24, 214, y + 26); }
  g.lineTo(196, 150); g.quadraticCurveTo(150, 160, 120, 140); g.closePath(); g.fillStyle = cuerpo; g.fill(); g.lineWidth = 4; g.strokeStyle = '#7a1606'; g.stroke();   // puño
  g.beginPath(); g.moveTo(150, 128); g.quadraticCurveTo(196, 118, 214, 140); g.quadraticCurveTo(190, 158, 150, 150); g.closePath(); g.fillStyle = '#ffd060'; g.fill(); g.stroke();   // pulgar
  for (let i = 1; i < 4; i++){ g.beginPath(); g.moveTo(198, 50 + i * 24); g.lineTo(224, 50 + i * 24); g.lineWidth = 3; g.stroke(); }
  const gr = g.createRadialGradient(190, 96, 4, 190, 96, 60); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(120, 30, 136, 140); }), false);
// El sol de la Gran llamarada: bola de fuego con corona de llamas
const solMat = foilSprite(foilLienzo(256, 256, g => { const R = mulberry32(739);
  for (let k = 0; k < 40; k++){ const a = R() * Math.PI * 2, len = 60 + R() * 60, w = 0.12 + R() * 0.12;
    g.beginPath(); g.moveTo(128 + Math.cos(a - w) * 70, 128 + Math.sin(a - w) * 70); g.quadraticCurveTo(128 + Math.cos(a) * (70 + len * 0.6), 128 + Math.sin(a) * (70 + len * 0.6), 128 + Math.cos(a + w * 0.4) * (70 + len), 128 + Math.sin(a + w * 0.4) * (70 + len));
    g.lineTo(128 + Math.cos(a + w) * 70, 128 + Math.sin(a + w) * 70); g.closePath(); g.fillStyle = R() < 0.5 ? 'rgba(255,120,20,0.8)' : 'rgba(255,200,60,0.8)'; g.fill(); }
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 84); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, '#fff3b0'); gr.addColorStop(0.75, '#ffa020'); gr.addColorStop(1, 'rgba(216,48,10,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(128, 128, 84, 0, Math.PI * 2); g.fill(); }), false);
const _manoV = new V3();
const manoDe = v => { P.armR.hand.getWorldPosition(v); return v; };

/* ---------- Técnicas en marcha ---------- */
const foilFx = [];
function foilTick(dt){
  for (let i = foilFx.length - 1; i >= 0; i--){ const f = foilFx[i]; f.t += dt; let vivo = false; try { vivo = f.upd(dt); } catch (err) { console.error(err); }
    if (!vivo){ for (const c of f.cintas || []) tintaSuelta(c); if (f.fin) f.fin(); foilFx.splice(i, 1); } }
}
const _fV = new V3(), _fW = new V3();
function foilGolpea(e, dmg, nx, nz, knock, el, power, yaHit){
  if (!e.alive || e.spawnT > 0 || e.reach === false || (yaHit && yaHit.has(e))) return false;
  if (yaHit) yaHit.add(e);
  return hitEnemy(e, dmg, rnd() < up.crit, nx, nz, knock, 2, false, { src: 'aoe', el, power });
}
const foilGrito = (txt, col) => { tA.set(hero.position.x, hero.position.y + 2.7, hero.position.z); spawnNumber(tA, txt, 'react', col); };
// Arco de tinta alrededor de Tovan (el tajo de cada golpe normal)
function tintaArco(cols, r, f, sg, ancho, dur, y0, dmgF, tipo){
  const O = hero.position.clone(), c = tintaCoge(cols, 0.7, tipo), a0 = f + sg * 1.45, a1 = f - sg * 1.45;
  const P = (s, v) => { const a = lerp(a0, a1, s); return v.set(O.x + Math.sin(a) * r, O.y + y0 + Math.sin(s * Math.PI) * 0.25, O.z + Math.cos(a) * r); };
  let pegado = false;
  foilFx.push({ t: 0, cintas: [c], upd(){ const k = Math.min(1, this.t / 0.12), tail = Math.max(0, (this.t - 0.1) / dur);
      if (tail >= 1) return false;
      tintaPinta(c, P, Math.min(tail, k * 0.98), k, q => ancho * Math.sin(Math.min(1, q) * Math.PI) * (0.4 + 0.6 * q));
      c.mat.uniforms.uAlpha.value = 1 - Math.max(0, tail - 0.4) / 0.6;
      if (!pegado && k >= 1){ pegado = true; if (dmgF) dmgF(O); }
      return true; } });
}
const enCono = (O, e, f, R, ang) => { const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.hypot(dx, dz); if (d - e.r > R) return null;
  let da = Math.atan2(dx, dz) - f; da = Math.atan2(Math.sin(da), Math.cos(da)); return Math.abs(da) <= ang || d < 0.9 ? [dx / Math.max(d, 0.01), dz / Math.max(d, 0.01)] : null; };

/* ---------- Agua: el dragón ---------- */
// La cabeza del dragón, pintada a pincel en un lienzo (blanco y azul con tinta negra), con su propio PRNG: nada de rnd() al cargar
const dragonCanvas = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext && c.getContext('2d');
  if (!g || !g.beginPath || !g.createLinearGradient) return c;
  const R = mulberry32(731), tinta = '#05070c';
  const relleno = (y0, y1) => { const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.55, '#bfe4ff'); gr.addColorStop(1, '#2f7fe8'); return gr; };
  const traza = (w) => { g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = tinta; g.lineWidth = w; g.stroke(); };
  for (let i = 0; i < 10; i++){   // melena de agua hacia atrás
    const y = 22 + i * 9 + (R() - 0.5) * 4, len = 52 + R() * 46;
    g.beginPath(); g.moveTo(104, y); g.quadraticCurveTo(78, y - 14 + R() * 10, 104 - len, y - 8 + (R() - 0.5) * 26); g.quadraticCurveTo(80, y + 10, 108, y + 9); g.closePath();
    g.fillStyle = relleno(y - 20, y + 16); g.fill(); traza(3); }
  g.beginPath(); g.moveTo(118, 32); g.bezierCurveTo(98, 8, 66, 0, 26, 6); g.bezierCurveTo(60, 12, 90, 22, 106, 40); g.closePath(); g.fillStyle = relleno(0, 40); g.fill(); traza(3.5);   // cuerno
  g.beginPath(); g.moveTo(140, 30); g.bezierCurveTo(128, 12, 110, 6, 92, 10); g.bezierCurveTo(112, 16, 124, 24, 130, 36); g.closePath(); g.fillStyle = '#e8f6ff'; g.fill(); traza(3);
  g.beginPath(); g.moveTo(100, 80); g.bezierCurveTo(146, 84, 190, 94, 230, 108); g.lineTo(220, 118); g.bezierCurveTo(170, 112, 130, 106, 94, 96); g.closePath();   // mandíbula de abajo
  g.fillStyle = relleno(80, 118); g.fill(); traza(4);
  g.beginPath(); g.moveTo(112, 70); g.bezierCurveTo(150, 74, 196, 84, 226, 102); g.lineTo(234, 60); g.bezierCurveTo(190, 64, 150, 66, 112, 70); g.closePath(); g.fillStyle = '#0b2a5a'; g.fill();   // boca
  for (let x = 132; x < 226; x += 11){ const yU = 64 + (x - 132) * -0.03, yL = 82 + (x - 132) * 0.24;
    g.beginPath(); g.moveTo(x, yU); g.lineTo(x + 5, yU + 11 + R() * 4); g.lineTo(x + 9, yU); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); traza(1.5);
    g.beginPath(); g.moveTo(x - 2, yL + 2); g.lineTo(x + 3, yL - 10 - R() * 3); g.lineTo(x + 7, yL + 3); g.closePath(); g.fillStyle = '#ffffff'; g.fill(); traza(1.5); }
  g.beginPath(); g.moveTo(96, 44); g.bezierCurveTo(130, 20, 196, 24, 240, 40); g.lineTo(252, 54); g.bezierCurveTo(216, 58, 164, 64, 104, 72); g.closePath();   // mandíbula de arriba
  g.fillStyle = relleno(22, 72); g.fill(); traza(4.5);
  for (let i = 0; i < 6; i++){ const x = 130 + i * 17; g.beginPath(); g.moveTo(x, 30 - i * 0.5); g.quadraticCurveTo(x + 8, 22, x + 16, 28 + i * 0.6); traza(2); }   // escamas del morro
  g.save(); g.translate(170, 42); g.rotate(-0.22); g.beginPath(); g.ellipse(0, 0, 13, 6, 0, 0, Math.PI * 2); g.fillStyle = '#7fe8ff'; g.fill(); traza(3);
  g.beginPath(); g.ellipse(3, 0, 3, 5, 0, 0, Math.PI * 2); g.fillStyle = tinta; g.fill(); g.restore();
  for (const [dy, k] of [[0, 1], [6, 0.8]]){ g.beginPath(); g.moveTo(246, 50 + dy); g.bezierCurveTo(200, 30 + dy * 3, 150, 118 - dy, 70 + dy * 4, 104 + dy); traza(2.2 * k);   // bigotes
    g.strokeStyle = '#ffffff'; g.lineWidth = 0.9 * k; g.stroke(); }
  return c;
})();
const dragonTex = new THREE.CanvasTexture(dragonCanvas); dragonTex.minFilter = THREE.LinearFilter;
const dragonMat = new THREE.SpriteMaterial({ map: dragonTex, transparent: true, depthWrite: false });
const _pr1 = new V3(), _pr2 = new V3();
function aguaDragon(f){
  const O = hero.position.clone(), sg = rnd() < 0.5 ? -1 : 1, fx = Math.sin(f), fz = Math.cos(f);
  // sale de detrás de Tovan, se enrosca a su alrededor subiendo y se abre en espiral hacia delante
  const P = (s, v, ph) => { const q = s + (ph || 0) * 0.01, th = sg * (-Math.PI * 0.85 + q * Math.PI * 2.3), r = 1.5 + 4.2 * q * q, d = 3.2 * q,
      lat = Math.sin(th) * r, fw = d + Math.cos(th) * r * 0.85, y = O.y + 0.7 + 2.6 * Math.sin(Math.min(1, q * 1.15) * Math.PI) * (1 - 0.25 * q) + 0.35 * Math.sin(q * 11 + (ph || 0));
    return v.set(O.x + fx * fw + fz * lat, y, O.z + fz * fw - fx * lat); };
  const cuerpo = tintaCoge(TINTA_AGUA, 0.9), velo = tintaCoge(TINTA_AGUA2, 1.2), velo2 = tintaCoge(TINTA_AGUA2, 1.2);
  const cab = new THREE.Sprite(dragonMat); cab.scale.set(3, 1.5, 1); cab.renderOrder = 6; scene.add(cab);
  const ya = new Set(), dmg = rdmg(46), DUR = 1.05, CAZA = 0.45;
  FOIL.dragon = { P, s: 0, vivo: true };
  shake = Math.max(shake, 0.3); flash('#dff4ff', 0.25); lightFlash(O.x, 1.5, O.z, 0x6ab8ff, 2.4, 9); play('whoosh'); play('specialBoom');
  foilGrito('Décima forma · ¡Dragón cambiante!', '#bfe8ff');
  foilFx.push({ t: 0, cintas: [cuerpo, velo, velo2], upd(dt){
      const k = Math.min(1, this.t / DUR), head = 1 - Math.pow(1 - k, 2.2), tail = this.t < DUR ? Math.max(0, head - CAZA) : Math.min(1, head - CAZA + (this.t - DUR) / 0.45 * CAZA);
      if (tail >= 0.995){ return false; }
      FOIL.dragon.s = head;
      const anchoC = q => 1.25 * (0.1 + 0.9 * Math.pow(q, 0.55)) * (q > 0.94 ? 1 - (q - 0.94) / 0.06 * 0.7 : 1);
      tintaPinta(cuerpo, P, tail, head, anchoC);
      tintaPinta(velo, (s, v) => P(s, v, 1.6).addScaledVector(_fW.set(0, 1, 0), 0.45), Math.max(0, tail - 0.02), head - 0.02, q => 0.42 * Math.sin(q * Math.PI));
      tintaPinta(velo2, (s, v) => P(s, v, -1.3).addScaledVector(_fW.set(0, 1, 0), -0.38), Math.max(0, tail - 0.04), head - 0.05, q => 0.3 * Math.sin(q * Math.PI));
      const fade = this.t < DUR ? 1 : Math.max(0, 1 - (this.t - DUR) / 0.45); cuerpo.mat.uniforms.uAlpha.value = velo.mat.uniforms.uAlpha.value = velo2.mat.uniforms.uAlpha.value = 0.35 + 0.65 * fade;
      // cabeza: en la punta, girada según por dónde va en pantalla
      P(head, _pr1); P(Math.min(1, head + 0.02), _pr2); cab.position.copy(_pr1); cab.visible = this.t < DUR + 0.12;
      if (cab.visible){ const a1 = _pr1.clone().project(camera), a2 = _pr2.clone().project(camera);
        const ang = Math.atan2((a2.y - a1.y) * innerHeight, (a2.x - a1.x) * innerWidth); dragonMat.rotation = ang; cab.scale.set(3, Math.cos(ang) < 0 ? -1.5 : 1.5, 1); }
      if (this.t < DUR){
        for (let i = 0; i < 2; i++){ const a = rnd() * TAU; spawnFx(_pr1.x, _pr1.y, _pr1.z, Math.cos(a) * 2.5, 1 + rnd() * 2, Math.sin(a) * 2.5, rnd() < 0.6 ? 0xffffff : 0x6ab8ff, 0.07, 0.5, 6, 0); }
        for (const e of enemies){ if (ya.has(e) || !e.alive || e.spawnT > 0) continue; const dx = e.g.position.x - _pr1.x, dz = e.g.position.z - _pr1.z;
          if (Math.hypot(dx, dz) < 1.5 + e.r && _pr1.y < 3.4){ const tx = _pr2.x - _pr1.x, tz = _pr2.z - _pr1.z, tl = Math.max(0.01, Math.hypot(tx, tz));
            if (foilGolpea(e, dmg, tx / tl, tz / tl, 6, 'ice', 1.4, ya)){ sparks(e.g.position.x, 1, e.g.position.z, 8, 0xdff6ff, 4); spawnFx(e.g.position.x, 1.2, e.g.position.z, 0, 3, 0, 0x6ab8ff, 0.12, 0.4, 6, 1); } } } }
      return true; },
    fin(){ scene.remove(cab); if (FOIL.dragon && FOIL.dragon.P === P) FOIL.dragon = null; } });
}
function aguaTajo(f, idx){
  tintaArco(TINTA_AGUA, 1.75, f, idx % 2 ? -1 : 1, 0.55, 0.28, 0.95, O => { const d = rdmg(8);
    for (const e of enemies){ const n = enCono(O, e, f, 2.5, 1.35); if (n) foilGolpea(e, d, n[0], n[1], 1.5, 'ice', 0.5); } });
  for (let i = 0; i < 6; i++){ const a = f + (rnd() - 0.5) * 1.6; spawnFx(hero.position.x + Math.sin(a) * 1.4, 1, hero.position.z + Math.cos(a) * 1.4, Math.sin(a) * 2, 1.5, Math.cos(a) * 2, 0xffffff, 0.06, 0.35, 6, 0); }
}
// Fluir: rodar con el dragón fuera te lleva por su corriente hasta la cabeza
function aguaFluir(){
  const D = FOIL.dragon; if (!D || D.s < 0.15) return false;
  const pts = []; for (let i = 0; i <= 16; i++){ const v = D.P(D.s * i / 16, new V3()); v.y = 0; pts.push(v); }
  let cerca = 0, dmin = 1e9; for (let i = 0; i < pts.length; i++){ const d = Math.hypot(pts[i].x - hero.position.x, pts[i].z - hero.position.z); if (d < dmin){ dmin = d; cerca = i; } }
  if (dmin > 4) return false;
  const ruta = pts.slice(cerca); if (ruta.length < 2) return false;
  FOIL.fluir = { ruta, t: 0, dur: 0.12 + ruta.length * 0.035, ya: new Set(), dmg: rdmg(24) };
  player.inv = Math.max(player.inv, FOIL.fluir.dur + 0.25); state = 'normal'; play('whoosh'); foilGrito('¡Fluir!', '#bfe8ff');
  return true;
}
function aguaFluirTick(dt){
  const F = FOIL.fluir; if (!F) return;
  F.t += dt; const k = Math.min(1, F.t / F.dur), x = k * (F.ruta.length - 1), i = Math.min(F.ruta.length - 2, Math.floor(x)), q = x - i;
  const p = _fV.lerpVectors(F.ruta[i], F.ruta[i + 1], q), nx = F.ruta[i + 1].x - F.ruta[i].x, nz = F.ruta[i + 1].z - F.ruta[i].z;
  hero.position.x = p.x; hero.position.z = p.z; if (Math.hypot(nx, nz) > 0.01){ heading = Math.atan2(nx, nz); hero.rotation.y = heading; }
  spawnFx(p.x, 0.4 + rnd() * 0.6, p.z, (rnd() - 0.5) * 2, 1 + rnd(), (rnd() - 0.5) * 2, rnd() < 0.5 ? 0xffffff : 0x6ab8ff, 0.08, 0.45, 4, 0);
  for (const e of enemies){ if (!e.alive || F.ya.has(e)) continue; const dx = e.g.position.x - p.x, dz = e.g.position.z - p.z, d = Math.hypot(dx, dz);
    if (d < 1.2 + e.r) foilGolpea(e, F.dmg, dx / Math.max(d, 0.01), dz / Math.max(d, 0.01), 4, 'ice', 1, F.ya); }
  if (k >= 1){ FOIL.fluir = null; ringFx(p.x, p.z, 0x6ab8ff, 0.3, 2.4, 0.4); puffAt(p.x, p.z, 8, 2, 0xdff6ff); }
}

/* ---------- Mil pájaros: el relámpago que cruza ---------- */
function truenoPrimera(f){
  const iai = FOIL.iai; FOIL.iai = false; FOIL.quieto = 0;
  const R = iai ? 14 : 8, O = hero.position.clone(), objetivos = [], ya = new Set();
  let cur = O.clone();
  for (let n = 0; n < 6; n++){ let best = null, bd = R;
    for (const e of enemies){ if (!e.alive || e.spawnT > 0 || ya.has(e) || e.reach === false) continue; const d = Math.hypot(e.g.position.x - cur.x, e.g.position.z - cur.z) - e.r;
      if (d < bd && (n || Math.cos(Math.atan2(e.g.position.x - cur.x, e.g.position.z - cur.z) - f) > -0.3 || d < 2)){ bd = d; best = e; } }
    if (!best) break; ya.add(best); objetivos.push(best); cur.set(best.g.position.x, 0, best.g.position.z); }
  const pts = [O.clone().setY(1)];
  for (const e of objetivos) pts.push(new V3(e.g.position.x, 1, e.g.position.z));
  const last = pts[pts.length - 1], prev = pts[pts.length - 2] || O, dx = last.x - prev.x, dz = last.z - prev.z, dl = Math.hypot(dx, dz) || 1;
  const fin = objetivos.length ? new V3(last.x + dx / dl * 1.6, 1, last.z + dz / dl * 1.6) : new V3(O.x + Math.sin(f) * 5, 1, O.z + Math.cos(f) * 5);
  const lim = clampArena(new V3(fin.x, 0, fin.z), ARENA - 0.8); fin.x = lim.x; fin.z = lim.z; if (MP.on && !mpLibre(fin.x, fin.z, 0.5)){ fin.x = last.x; fin.z = last.z; }
  pts.push(fin);
  // zigzag del rayo: puntos intermedios desviados
  const zz = [pts[0]]; for (let i = 1; i < pts.length; i++){ const a = pts[i - 1], b = pts[i];
    for (let k = 1; k <= 3; k++){ const q = k / 4, j = (rnd() - 0.5) * 0.9; zz.push(new V3(lerp(a.x, b.x, q) + (b.z - a.z) * j * 0.2, 1 + (rnd() - 0.5) * 0.6, lerp(a.z, b.z, q) - (b.x - a.x) * j * 0.2)); } zz.push(b); }
  const segL = []; let tot = 0; for (let i = 1; i < zz.length; i++){ tot += zz[i].distanceTo(zz[i - 1]); segL.push(tot); }
  const P = (s, v) => { const d = s * tot; let i = 0; while (i < segL.length - 1 && segL[i] < d) i++; const d0 = i ? segL[i - 1] : 0, q = (d - d0) / Math.max(0.001, segL[i] - d0); return v.lerpVectors(zz[i], zz[i + 1], Math.min(1, Math.max(0, q))); };
  const P1 = rayoTiembla(P, 30, 0.2), P2 = rayoTiembla(P, 30, 0.38), c1 = tintaCoge(RAYO_AZUL, 0, 'rayo'), c2 = tintaCoge(RAYO_CIAN, 0, 'rayo'), ramas = rayoRamas(P, 6, 1.3);
  const bola = new THREE.Sprite(chidoriMat); bola.renderOrder = 7; scene.add(bola);
  hero.position.x = fin.x; hero.position.z = fin.z; heading = Math.atan2(fin.x - prev.x, fin.z - prev.z) || f; hero.rotation.y = heading;
  player.inv = Math.max(player.inv, 0.7); hitStop = Math.max(hitStop, 0.12); flash('#dff4ff', 0.4); shake = Math.max(shake, 0.35); play('zap'); play('swingBig');
  foilGrito(iai ? '¡Mil pájaros! (cargado)' : '¡Mil pájaros!', '#9fe4ff'); play('chidori');
  const dmg = rdmg(iai ? 66 : 44); let golpeado = false;
  foilFx.push({ t: 0, cintas: [c1, c2, ...ramas.map(r => r.c)], upd(){
      const k = Math.min(1, this.t / 0.1), fade = Math.max(0, (this.t - 0.55) / 0.35);
      if (fade >= 1) return false;
      tintaPinta(c1, P1, 0, k, q => 0.7 * (0.45 + 0.55 * Math.sin(Math.min(1, q * 1.1) * Math.PI * 0.5 + 0.2)));
      tintaPinta(c2, P2, 0, k, q => 0.28);
      for (const r of ramas){ tintaPinta(r.c, r.P, 0, Math.min(1, k * 1.4), q => 0.22 * (1 - q * 0.7)); r.c.mat.uniforms.uAlpha.value = (1 - fade) * (0.6 + 0.4 * Math.sin(time * 50 + r.c.mat.uniforms.uSeed.value)); }
      c1.mat.uniforms.uAlpha.value = c2.mat.uniforms.uAlpha.value = 1 - fade;
      bola.visible = this.t < 0.45; if (bola.visible){ manoDe(bola.position); bola.scale.setScalar(1.1 + Math.sin(time * 60) * 0.25); chidoriMat.rotation = time * 9; }
      if (!golpeado && this.t > 0.28){ golpeado = true; play('thunder');
        for (const e of objetivos){ if (!e.alive) continue; const x = e.g.position.x, z = e.g.position.z; bolt(x, 8, z, x, 0.1, z, 0x9fe4ff, 0.12); lightFlash(x, 1.5, z, 0x6ac8ff, 2, 6);
          const nx = x - O.x, nz = z - O.z, nl = Math.max(0.01, Math.hypot(nx, nz)); foilGolpea(e, dmg, nx / nl, nz / nl, 3, 'shock', 1.6); sparks(x, 1, z, 12, 0xcff2ff, 5); } }
      return true; },
    fin(){ scene.remove(bola); } });
}
// Arco eléctrico de cada golpe: dos rayos que tiemblan alrededor de Tovan
function rayoArco(r, f, sg, y0, dur, dmgF){
  const O = hero.position.clone(), a0 = f + sg * 1.4, a1 = f - sg * 1.4;
  const base = (s, v) => { const a = lerp(a0, a1, s); return v.set(O.x + Math.sin(a) * r, O.y + y0 + Math.sin(s * Math.PI) * 0.2, O.z + Math.cos(a) * r); };
  const cs_ = [tintaCoge(RAYO_AZUL, 0, 'rayo'), tintaCoge(RAYO_CIAN, 0, 'rayo')], Ps = [rayoTiembla(base, 14, 0.14), rayoTiembla(base, 14, 0.26)];
  let pegado = false;
  foilFx.push({ t: 0, cintas: cs_, upd(){ const k = Math.min(1, this.t / 0.08), fade = Math.max(0, (this.t - 0.1) / dur); if (fade >= 1) return false;
      tintaPinta(cs_[0], Ps[0], 0, k, () => 0.34); tintaPinta(cs_[1], Ps[1], 0, k, () => 0.16);
      for (const c of cs_) c.mat.uniforms.uAlpha.value = 1 - fade;
      if (!pegado && k >= 1){ pegado = true; if (dmgF) dmgF(O); }
      return true; } });
}
function truenoTajo(f, idx){
  rayoArco(1.6, f, idx % 2 ? -1 : 1, 1.05, 0.18, O => { const d = rdmg(7);
    for (const e of enemies){ const n = enCono(O, e, f, 2.4, 1.3); if (n && foilGolpea(e, d, n[0], n[1], 1, rnd() < 0.3 ? 'shock' : null, 0.6)) sparks(e.g.position.x, 1, e.g.position.z, 4, 0xcff2ff, 3); } });
  play('zap');
}

/* ---------- Fuego: puño de fuego y ardor ---------- */
function fuegoArco(f, idx){
  const D = FOIL.danza;
  tintaArco(LLAMA, 1.8 + D * 0.04, f, idx % 2 ? -1 : 1, 0.95 + D * 0.04, 0.34, 0.9, O => { const d = rdmg(11 + D * 1.2); let pega = false;
    for (const e of enemies){ const n = enCono(O, e, f, 2.6 + D * 0.05, 1.4); if (n && foilGolpea(e, d, n[0], n[1], 2, 'fire', 0.7)) pega = true; }
    if (pega) fuegoPaso(); }, 'fuego');
  for (let i = 0; i < 5; i++){ const a = f + (rnd() - 0.5) * 2; spawnFx(hero.position.x + Math.sin(a) * 1.6, 0.9 + rnd() * 0.6, hero.position.z + Math.cos(a) * 1.6, 0, 1.6, 0, rnd() < 0.5 ? 0xffd060 : 0xff5a14, 0.07, 0.45, -2, 0); }
}
function fuegoPaso(){
  if (FOIL.danza >= 12) return; FOIL.danza++;
  if (FOIL.danza === 4 || FOIL.danza === 8) foilGrito(`Ardor ×${FOIL.danza}`, '#ffb02a');
  if (FOIL.danza === 12){ foilGrito('¡Ardor al máximo! El remate será «Gran llamarada»', '#fff3c0'); play('tier'); }
}
function fuegoPuno(f){   // el remate: un puño de llamas que sale recto y atraviesa
  const O = hero.position.clone(), fx = Math.sin(f), fz = Math.cos(f), L = 7 + FOIL.danza * 0.2, ya = new Set(), dmg = rdmg(34 + FOIL.danza * 2.5);
  const P = (s, v, ph) => v.set(O.x + fx * (0.6 + L * s) + fz * 0.25 * Math.sin(s * 9 + (ph || 0)), O.y + 1.1 + 0.15 * Math.sin(s * 7 + (ph || 0)), O.z + fz * (0.6 + L * s) - fx * 0.25 * Math.sin(s * 9 + (ph || 0)));
  const c1 = tintaCoge(LLAMA, 1, 'fuego'), c2 = tintaCoge(LLAMA_VIVA, 1, 'fuego'), c3 = tintaCoge(LLAMA_VIVA, 1, 'fuego');
  const puno = new THREE.Sprite(punoMat); puno.renderOrder = 7; scene.add(puno);
  foilGrito('¡Puño de fuego!', '#ffb02a'); play('whoosh'); play('specialBoom'); shake = Math.max(shake, 0.3); lightFlash(O.x, 1.5, O.z, 0xff8a2a, 2.4, 9);
  foilFx.push({ t: 0, cintas: [c1, c2, c3], upd(){
      const k = Math.min(1, this.t / 0.62), head = 1 - Math.pow(1 - k, 2), fade = Math.max(0, (this.t - 0.72) / 0.4);
      if (fade >= 1) return false;
      const tail = Math.max(0, head - 0.55 - fade * 0.45);
      tintaPinta(c1, P, tail, head, q => 2.3 * Math.pow(q, 1.3) + 0.25);                                 // cometa de llamas: ancha en el puño, fina en la cola
      tintaPinta(c2, (s, v) => P(s, v, 2).addScaledVector(_fW.set(0, 1, 0), 0.35), tail, head * 0.97, q => 0.8 * Math.pow(q, 1.6));
      tintaPinta(c3, (s, v) => P(s, v, 4).addScaledVector(_fW.set(0, 1, 0), -0.3), tail, head * 0.95, q => 0.7 * Math.pow(q, 1.6));
      c1.mat.uniforms.uAlpha.value = c2.mat.uniforms.uAlpha.value = c3.mat.uniforms.uAlpha.value = 1 - fade;
      // el puño, al frente y girado según por dónde va en pantalla
      P(head, _pr1); P(Math.min(1, head + 0.02), _pr2); puno.position.copy(_pr1); puno.visible = fade < 0.6;
      if (puno.visible){ const a1 = _pr1.clone().project(camera), a2 = _pr2.clone().project(camera), ang = Math.atan2((a2.y - a1.y) * innerHeight, (a2.x - a1.x) * innerWidth);
        punoMat.rotation = ang; punoMat.opacity = 1 - fade / 0.6; puno.scale.set(2.6, Math.cos(ang) < 0 ? -1.95 : 1.95, 1); }
      P(head, _fV); for (let i = 0; i < 3; i++) spawnFx(_fV.x, _fV.y, _fV.z, (rnd() - 0.5) * 3, 1 + rnd() * 2, (rnd() - 0.5) * 3, rnd() < 0.5 ? 0xffd060 : 0xff5a14, 0.1, 0.45, -1, 0);
      for (const e of enemies){ if (ya.has(e) || !e.alive || e.spawnT > 0) continue; const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, along = dx * fx + dz * fz, perp = Math.abs(dx * fz - dz * fx);
        if (along > 0 && along < 0.6 + L * head + 0.5 && perp < 1.1 + e.r) foilGolpea(e, dmg, fx, fz, 5, 'fire', 1.2, ya); }
      return true; },
    fin(){ scene.remove(puno); } });
}
function fuegoRueda(f){
  const sol = FOIL.danza >= 12, O = hero.position.clone(), r = sol ? 4.2 : 2.5, ya = new Set();
  const c1 = tintaCoge(LLAMA, 0.8, 'fuego'), c2 = tintaCoge(LLAMA_VIVA, 1, 'fuego'), sg = rnd() < 0.5 ? -1 : 1;
  const P = (s, v, k) => { const a = f + sg * s * TAU * 1.08; return v.set(O.x + Math.sin(a) * r * (k || 1), O.y + 0.5 + s * (sol ? 2.2 : 1.1), O.z + Math.cos(a) * r * (k || 1)); };
  const dmg = rdmg(sol ? 90 : 30 + FOIL.danza * 2);
  foilGrito('¡Gran llamarada!', '#ffd060');
  let halo = null;
  if (sol){ FOIL.danza = 0; halo = new THREE.Sprite(solMat); halo.renderOrder = 7; halo.scale.setScalar(0.01); scene.add(halo);
    flash('#fff0b0', 0.6); shake = Math.max(shake, 0.6); hitStop = Math.max(hitStop, 0.18); play('specialBoom'); lightFlash(O.x, 3, O.z, 0xffb02a, 4, 16); }
  else { shake = Math.max(shake, 0.25); lightFlash(O.x, 1.5, O.z, 0xff8a2a, 2.2, 8); }
  play('whoosh');
  foilFx.push({ t: 0, cintas: [c1, c2], upd(){
      const k = Math.min(1, this.t / (sol ? 0.4 : 0.26)), head = 1 - Math.pow(1 - k, 2), fade = Math.max(0, (this.t - (sol ? 0.75 : 0.45)) / 0.35);
      if (fade >= 1) return false;
      tintaPinta(c1, P, Math.max(0, head - 0.75), head, q => (sol ? 1.05 : 0.85) * (0.15 + 0.85 * q));
      tintaPinta(c2, (s, v) => P(s, v, 0.82), Math.max(0, head - 0.6), head * 0.98, q => (sol ? 0.6 : 0.35) * Math.sin(q * Math.PI));
      c1.mat.uniforms.uAlpha.value = c2.mat.uniforms.uAlpha.value = 1 - fade;
      if (halo){ const crece = Math.min(1, this.t / 0.35), cae = Math.max(0, Math.min(1, (this.t - 0.35) / 0.15));   // el sol crece sobre la cabeza y cae sobre el sitio
        halo.position.set(O.x, O.y + lerp(3.6, 0.4, cae), O.z); halo.scale.setScalar(lerp(0.2, 3.2, smooth(crece)) * (1 - cae * 0.55)); solMat.opacity = cae >= 1 ? Math.max(0, 1 - fade * 3) : 1; solMat.rotation = this.t * 1.5;
        if (cae >= 1 && !this.boom){ this.boom = true; ringFx(O.x, O.z, 0xff8a2a, 0.6, r + 1.2, 0.5); ringFx(O.x, O.z, 0xffd060, 0.4, r * 0.7, 0.35); play('boom'); shake = Math.max(shake, 0.7); } }
      P(head, _fV); for (let i = 0; i < 2; i++) spawnFx(_fV.x, _fV.y, _fV.z, (rnd() - 0.5) * 2, 1 + rnd() * 2, (rnd() - 0.5) * 2, rnd() < 0.5 ? 0xffd060 : 0xff5a14, 0.09, 0.5, -1, 0);
      for (const e of enemies){ if (ya.has(e) || !e.alive || e.spawnT > 0) continue; const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.hypot(dx, dz);
        if (d - e.r < r + 0.6 && d - e.r < r * head + 0.8) foilGolpea(e, dmg, dx / Math.max(d, 0.01), dz / Math.max(d, 0.01), sol ? 7 : 4, 'fire', sol ? 2 : 1.2, ya); }
      return true; },
    fin(){ if (halo) scene.remove(halo); } });
  if (sol) for (let i = 0; i < 40; i++){ const a = rnd() * TAU; spawnFx(O.x, 1, O.z, Math.cos(a) * 7, 2 + rnd() * 4, Math.sin(a) * 7, rnd() < 0.5 ? 0xffd060 : 0xff5a14, 0.12, 0.9, 4, 0); }
}

/* ---------- Ganchos: cada golpe normal y su remate ---------- */
const foilTiene = () => FOIL_IDS.some(id => lvl(id));
const _startMoveFoil = startMove;
startMove = function(name, idx){
  _startMoveFoil(name, idx);
  try {
    if (!foilTiene() || gameState !== 'play' || invActive) return;
    const mv = MV[name]; if (!mv || name === 'special' || mv.special || mv.dive || idx >= 96) return;
    const seq = weaponSeq(), fin = seq.length > 1 && idx === seq.length - 1, f = heading, dl = Math.max(0.05, (mv.dur || 0.42) * (mv.hit || 0.5) * 0.8);
    FOIL.quieto = 0;
    if (lvl('waterBreath')) later(dl, () => fin ? aguaDragon(f) : aguaTajo(f, idx));
    if (lvl('foilChidori')) later(dl, () => fin ? truenoPrimera(f) : truenoTajo(f, idx));
    if (lvl('foilHiken')) later(dl, () => fin ? (FOIL.danza >= 12 ? fuegoRueda(f) : fuegoPuno(f)) : fuegoArco(f, idx));
  } catch (err) { console.error(err); }
};
const _doRollFoil = doRoll;
doRoll = function(){ if (lvl('waterBreath') && canAct() && state !== 'roll' && !FOIL.fluir && FOIL.dragon && aguaFluir()) return; _doRollFoil(); };
const _hurtPlayerFoil = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){
  if (FOIL.fluir) return 'none';
  const h0 = player.hp, r = _hurtPlayerFoil(dmg, sx, sz, knock);
  if (player.hp < h0 && FOIL.danza > 0){ if (FOIL.danza >= 4) foilGrito('Se apaga el ardor', '#ff8a6a'); FOIL.danza = 0; }
  return r;
};
const _hitEnemyFoil = hitEnemy;
hitEnemy = function(e, val, crit, nx, nz, knock, meterGain, melee, o){
  if (FOIL.danza && lvl('foilHiken') && (melee || (o && o.src === 'melee'))) val = Math.round(val * (1 + 0.05 * FOIL.danza));
  return _hitEnemyFoil(e, val, crit, nx, nz, knock, meterGain, melee, o);
};
function foilIai(dt, playing){
  if (FOIL.bolaS) FOIL.bolaS.visible = false;
  if (!lvl('foilChidori') || !playing) return;
  const quieto = inputMag < 0.12 && state === 'normal' && grounded; FOIL.quieto = quieto ? FOIL.quieto + dt : 0;
  if (!FOIL.iai && FOIL.quieto > 0.8){ FOIL.iai = true; play('chidori'); foilGrito('Cargando…', '#9fe4ff'); }
  if (FOIL.iai && !quieto && state !== 'attack') FOIL.iai = false;
  if (FOIL.iai){ if (!FOIL.bolaS){ FOIL.bolaS = new THREE.Sprite(chidoriMat); FOIL.bolaS.renderOrder = 7; scene.add(FOIL.bolaS); }   // la bola de chispas en la mano
    FOIL.bolaS.visible = true; manoDe(FOIL.bolaS.position); FOIL.bolaS.scale.setScalar(0.75 + Math.sin(time * 55) * 0.18); chidoriMat.rotation = time * 9; }
  if (FOIL.iai && rnd() < dt * 18){ const a = rnd() * TAU; spawnFx(hero.position.x + Math.cos(a) * 0.5, 0.2 + rnd() * 1.6, hero.position.z + Math.sin(a) * 0.5, 0, 0.6, 0, rnd() < 0.5 ? 0x6ac8ff : 0xffffff, 0.05, 0.3, 0, 0); }
}
const _v3UpdateFoil = v3Update;
v3Update = function(dt, pdt, playing){
  _v3UpdateFoil(dt, pdt, playing);
  try { foilTick(playing ? pdt : 0); if (playing) aguaFluirTick(pdt); foilIai(pdt, playing); if (lvl('waterBreath')) P6.wbN = -1e6; } catch (err) { console.error(err); }   // la ola de antes ya no sale
};
const _clearWorldFoil = clearWorld;
clearWorld = function(){ _clearWorldFoil(); for (const f of foilFx){ for (const c of f.cintas || []) tintaSuelta(c); if (f.fin) f.fin(); } foilFx.length = 0; FOIL.dragon = null; FOIL.fluir = null; };
const _startRunFoil = startRun;
startRun = function(){ Object.assign(FOIL, { premio: false, pend: 0, danza: 0, quieto: 0, iai: false, fluir: null, dragon: null }); _startRunFoil(); };

/* ---------- El premio: pantalla de cartas foil ---------- */
// FOIL.pend lo pone quien da el premio; tras la carta normal sale la pantalla foil (con las que aún no tengas; si ya están todas, una legendaria)
const _dealCardsFoil = dealCards;
dealCards = function(){
  if (!FOIL.premio){ _dealCardsFoil(); foilDecora(); return; }
  offer = UPGRADES.filter(u => u.r === 'foil' && (taken[u.id] || 0) < u.max);
  if (!offer.length){ FOIL.premio = false; forceLegend = true; _dealCardsFoil(); foilDecora(); return; }
  try { renderCards10(); } catch (err) { console.error(err); }
  rerollBtn.hidden = true; foilDecora(); play('legend');
  const t = document.querySelector('#upScr .uptitle'); if (t) t.textContent = '¡Carta FOIL! · Premio por salvar el paquete';
  document.getElementById('upScr').classList.add('foilScr');
};
function foilDecora(){
  document.getElementById('upScr').classList.toggle('foilScr', FOIL.premio);
  for (const b of cardsEl.querySelectorAll('.card.r-foil')) if (!b.querySelector('.holo')){ const h = document.createElement('i'); h.className = 'holo'; b.appendChild(h); }
}
const _openUpgradesFoil = openUpgrades;
openUpgrades = function(){ _openUpgradesFoil(); if (FOIL.premio){ const t = document.querySelector('#upScr .uptitle'); if (t) t.textContent = '¡Carta FOIL! · Premio por salvar el paquete'; } };
const _chooseUpgradeFoil = chooseUpgrade;
chooseUpgrade = function(i){
  const u = offer[i], era = FOIL.premio; _chooseUpgradeFoil(i);
  if (era){ FOIL.premio = false; document.getElementById('upScr').classList.remove('foilScr');
    if (u && u.r === 'foil'){ flash('#ffffff', 0.5); play('legend'); later(0.4, () => banner(`${u.ic} ${u.name}<small>Poder FOIL · tus golpes ya no son normales</small>`, 2.4)); } }
};
const _afterUpgradeFoil = afterUpgrade;
afterUpgrade = function(){
  if (FOIL.pend > 0 && gameState === 'play'){ FOIL.pend--; FOIL.premio = true; openUpgrades(); return; }
  _afterUpgradeFoil();
};
Object.assign(SFX, { chidori: () => { for (let i = 0; i < 10; i++) tone({ type: 'square', f0: 2400 + Math.random() * 1800, f1: 1800 + Math.random() * 1200, dur: 0.05, vol: 0.035, when: i * 0.045, rv: 0.1 });
  noise({ dur: 0.5, vol: 0.08, f0: 5000, q: 2, rv: 0.1 }); } });

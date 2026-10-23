'use strict';
/* ======================================================================
   PODERES FOIL · CINCO MÁS (sobre js/poderes/foil-nucleo.js)
   Sustituyen a «Pelo dorado», que sobraba (había un poder normal
   parecido). Ninguno pone texto en pantalla. Cada uno con su prefijo en
   todo lo global (lo compartido, xtr):
     · Expansión de dominio (de una de hechiceros con venda) · vac.
       Especial con el ímpetu lleno: Tovan cruza los dedos y una burbuja de
       vacío crece desde él y se traga el mundo (cielo de estrellas, suelo
       de cosmos, luz fría). Los enemigos se quedan paralizados, saturados
       de información. Junta una esfera azul y otra roja en el «Púrpura»,
       que sale disparado 26 m borrando todo a su paso y deja una zanja.
       Al final la burbuja se encoge y vuelve el mundo.
     · Calaveras cañón (de un juego de esqueletos bromistas) · gst. Cuando
       te hieren (cada 3 s como mucho), aparecen girando calaveras de
       cabra, apuntan a los enemigos más cercanos, abren la mandíbula y
       disparan un rayo blanco que atraviesa; un ojo de Tovan brilla en
       cian. Cada cuarto remate, seis en abanico que se cruzan delante de él.
     · Bola cósmica (de una de un príncipe muy pequeño) · ktm. Al empezar
       cada oleada llueven cachivaches y Tovan empuja una bola pegajosa
       16 s: lo más pequeño que ella (cachivaches y enemigos) se queda
       pegado y la bola crece; lo grande rebota. Atacar = embestida. Al
       final, un arcoíris se la lleva al cielo y se convierte en estrella.
     · Burro de hormigón (de una de gusanos con bazucas) · wrm. Cada 40
       golpes cuerpo a cuerpo que aciertan, se abre el cielo sobre el grupo
       más grande con un coro celestial, cae un burro de piedra gigante que
       rebota cuatro veces aplastándolo todo y luego se desmorona.
     · Bola Smash (de uno de lucha con todas las estrellas) · smb. Cada
       20 s flota por la arena una bola arcoíris que se escapa si tardas;
       tres golpes la rompen y Tovan arde en arcoíris. El siguiente ataque
       es el golpe final: sube como un cohete, cae en picado, una cúpula de
       luz lanza a todos por los aires y cada uno revienta lejos con su
       explosión de color.
   Los modelos se construyen la primera vez y luego se enseñan y esconden;
   lo pintado al cargar usa mulberry32 (nada de rnd() al cargar). limpia()
   lo recoge todo (clearWorld, toTitle, limpiaEfectos y startRun).
   ====================================================================== */

/* ---------- Compartido ---------- */
const xtrV = new V3(), xtrW = new V3(), xtrU = new V3(), xtrQ = new THREE.Quaternion(), xtrC = new THREE.Color();
// el enemigo con más vecinos (a 3,2 m) de los que hay a R de O: ahí cae lo gordo
function xtrGrupo(O, R){
  const L = foilEnemigos(O, R); let mejor = null, n0 = -1, d0 = 1e9;
  for (const e of L){ let n = 0; for (const o of L) if (Math.hypot(o.g.position.x - e.g.position.x, o.g.position.z - e.g.position.z) < 3.2) n++;
    const d = Math.hypot(e.g.position.x - O.x, e.g.position.z - O.z); if (n > n0 || (n === n0 && d < d0)){ n0 = n; d0 = d; mejor = e; } }
  return mejor;
}
// golpe en área desde O (el empujón, hacia fuera)
function xtrArea(O, R, dmg, knock, el, power){
  for (const e of foilEnemigos(O, R)){ const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, typeof dmg === 'function' ? dmg(e) : dmg, dx / d, dz / d, knock, el || null, power || 1); }
}
// remate de los que no son fuertes: lo justo para tumbarlos (con «e.hp + 999» salían números enormes)
const xtrRemata = (e, nx, nz, power) => foilGolpea(e, Math.ceil(e.hp * 1.3) + 5, nx, nz, 0, null, power || 1);
function xtrSprite(mat, s, padre){ const sp = new THREE.Sprite(mat); sp.scale.setScalar(s || 1); sp.visible = false; sp.renderOrder = 6; (padre || scene).add(sp); return sp; }
const xtrBrillo = (r, g, b) => foilSprite(foilLienzo(64, 64, c => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, `rgba(${r},${g},${b},0.9)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); }), true);
const xtrHsv = h => xtrC.setHSL(((h % 1) + 1) % 1, 1, 0.6).getHex();
const xtrT = new V3(), xtrQv = (x, y, z) => xtrT.set(x, y, z);
// Arcoíris (normal, no aditivo): bandas de color a lo ancho que corren despacio (el haz del rey y la estela del golpe final)
TRAZO_FS.ktm = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
void main(){
  float u = vUV.x, a = abs(vUV.y);
  float h = fract(vUV.y * 0.5 + 0.5 + uTime * 0.25);
  vec3 c = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  float glow = pow(max(0.0, 1.0 - a), 0.8);
  gl_FragColor = vec4(mix(c, vec3(1.0), 0.22 + 0.3 * (1.0 - a)), uAlpha * glow * smoothstep(0.0, 0.06, u));
}`;

/* ======================================================================
   EXPANSIÓN DE DOMINIO (vac)
   ====================================================================== */
const VAC = { F: null, cup: null, borde: null, suelo: null, para: false, prev: null, azul: null, rojo: null, mor: null, halo: null, zanja: null, ocultos: null, amb: null };
const VAC_R = 32;   // radio del vacío: lo de más allá queda tapado por la burbuja
const VAC_T = { sello: 0.3, lleno: 1.2, azul: 1.85, rojo: 2.2, junta: 2.85, funde: 3.15, suelta: 3.45, vuela: 1.1, encoge: 5.3, fin: 6.2 };
const VAC_LARGO = 26;
// el cosmos de la burbuja (por dentro): nebulosa violeta y azul, estrellas que titilan, una galaxia en banda e hilos de información que caen
const VAC_VS = 'varying vec3 vD; void main(){ vD = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const VAC_COSMOS_FS = `
uniform float uT; varying vec3 vD;
float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float n3(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 0.0)), h3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(h3(i + vec3(0.0, 0.0, 1.0)), h3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(h3(i + vec3(0.0, 1.0, 1.0)), h3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z); }
void main(){
  vec3 d = normalize(vD);
  float n = n3(d * 2.6 + vec3(0.0, uT * 0.04, 0.0)) * 0.65 + n3(d * 6.0 - vec3(uT * 0.06)) * 0.35;
  vec3 col = mix(vec3(0.008, 0.005, 0.025), vec3(0.17, 0.06, 0.34), n * n * 1.3);
  col += vec3(0.05, 0.14, 0.4) * smoothstep(0.55, 0.9, n);
  float az = atan(d.z, d.x), band = exp(-pow((d.y - 0.12 * sin(az * 2.0 + uT * 0.2)) * 4.0, 2.0));
  col += vec3(0.6, 0.66, 1.0) * band * (0.12 + 0.55 * n * n);
  vec3 q = d * 70.0, c = floor(q), f = fract(q) - 0.5; float s = h3(c);
  col += vec3(0.9, 0.95, 1.0) * step(0.9, s) * smoothstep(0.32, 0.0, length(f)) * (0.55 + 0.45 * sin(uT * 3.0 + s * 70.0));
  float hilo = step(0.93, h3(vec3(floor(az * 48.0), 3.0, 1.0)));
  col += vec3(0.55, 0.85, 1.0) * hilo * pow(fract(d.y * 1.6 + uT * 0.9 + h3(vec3(floor(az * 48.0))) * 3.0), 8.0) * (1.0 - smoothstep(0.0, 0.03, abs(fract(az * 48.0 / 6.2832 * 6.2832) - 0.5) - 0.47));
  gl_FragColor = vec4(col, 1.0);
}`;
// el borde de la burbuja (brillo de canto, aditivo): solo se ve mientras crece o se encoge
const VAC_BORDE_VS = 'varying float vR; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); vR = 1.0 - abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }';
const VAC_BORDE_FS = 'uniform float uA; varying float vR; void main(){ float r = pow(vR, 3.0); gl_FragColor = vec4((vec3(0.75, 0.85, 1.0) * r * 1.6 + vec3(0.55, 0.3, 1.0) * pow(vR, 8.0)) * uA, 1.0); }';
// el suelo del vacío: negro con estrellas, anillos que salen de Tovan, radios y el canto encendido
const VAC_SUELO_VS = 'varying vec2 vP; uniform vec2 uC; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vP = w.xz - uC; gl_Position = projectionMatrix * viewMatrix * w; }';
const VAC_SUELO_FS = `
uniform float uT; uniform float uR; varying vec2 vP;
float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float r = length(vP); if (r > uR) discard;
  float an = atan(vP.y, vP.x);
  vec3 col = vec3(0.015, 0.01, 0.04) + vec3(0.05, 0.02, 0.1) * (1.0 - smoothstep(0.0, 18.0, r));
  col += vec3(0.3, 0.35, 0.75) * pow(abs(sin(r * 0.9 - uT * 2.0)), 30.0) * 0.6 / (1.0 + r * 0.15);
  col += vec3(0.25, 0.18, 0.55) * pow(abs(sin(an * 10.0)), 60.0) * 0.35 * smoothstep(1.0, 4.0, r);
  vec2 c = floor(vP * 2.5), f = fract(vP * 2.5) - 0.5; float s = h2(c);
  col += vec3(0.85, 0.9, 1.0) * step(0.95, s) * smoothstep(0.3, 0.0, length(f)) * (0.5 + 0.5 * sin(uT * 4.0 + s * 50.0));
  col += vec3(0.7, 0.8, 1.0) * smoothstep(uR - min(1.5, uR * 0.12), uR, r) * 1.2;
  gl_FragColor = vec4(col, 1.0);
}`;
// La cinta del Púrpura (aditiva): núcleo blanco, cuerpo violeta y remolinos que corren
TRAZO_FS.vac = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
void main(){
  float u = vUV.x, a = abs(vUV.y), m = u * uLen;
  float rem = 0.5 + 0.5 * sin(m * 2.2 - uTime * 18.0 + vUV.y * 5.0 + uSeed);
  float core = 1.0 - smoothstep(0.0, 0.35, a), glow = pow(max(0.0, 1.0 - a), 1.5);
  vec3 col = uB * glow * (1.1 + 0.7 * rem) + uA * core * 1.2 + uC * rem * glow * 0.45;
  gl_FragColor = vec4(col, uAlpha * smoothstep(0.0, 0.12, u) * clamp(glow + core, 0.0, 1.0));
}`;
const VAC_COLA = [0xffffff, 0x9a3cff, 0xff6ad8, 0], VAC_COLA2 = [0xffffff, 0xe0c8ff, 0xffffff, 0];
// Las esferas (pintadas al cargar): azul que aspira, roja que empuja y la violeta, con grietas de luz
const vacOrbe = (sem, w, cols, rayas) => foilSprite(foilLienzo(w, w, g => { const R = mulberry32(sem), c = w / 2;
  const gr = g.createRadialGradient(c, c, 0, c, c, c - 2); cols.forEach(([k, s]) => gr.addColorStop(k, s)); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.lineCap = 'round'; rayas(g, R, c); }), true);
const VAC_AZUL = vacOrbe(8101, 128, [[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(170,225,255,1)'], [0.5, 'rgba(40,120,255,0.6)'], [1, 'rgba(10,30,160,0)']], (g, R, c) => {
  for (let k = 0; k < 7; k++){ const a0 = R() * TAU; g.beginPath(); for (let j = 0; j <= 20; j++){ const r = 58 - j * 2.6, a = a0 + j * 0.28; j ? g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r) : g.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r); }
    g.strokeStyle = 'rgba(210,240,255,0.75)'; g.lineWidth = 2; g.stroke(); } });
const VAC_ROJO = vacOrbe(8102, 128, [[0, 'rgba(255,255,255,1)'], [0.2, 'rgba(255,190,170,1)'], [0.5, 'rgba(255,40,40,0.6)'], [1, 'rgba(150,0,20,0)']], (g, R, c) => {
  for (let k = 0; k < 16; k++){ const a = R() * TAU, r0 = 14 + R() * 10, r1 = 40 + R() * 22; g.beginPath(); g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0); g.lineTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
    g.strokeStyle = 'rgba(255,220,200,0.7)'; g.lineWidth = 2.5; g.stroke(); } });
const VAC_MORADO = vacOrbe(8103, 256, [[0, 'rgba(255,255,255,1)'], [0.16, 'rgba(250,225,255,1)'], [0.42, 'rgba(170,70,255,0.95)'], [0.7, 'rgba(90,20,200,0.55)'], [1, 'rgba(40,0,90,0)']], (g, R, c) => {
  for (let k = 0; k < 12; k++){ let a = R() * TAU, r = 30, x = c + Math.cos(a) * r, y = c + Math.sin(a) * r; g.beginPath(); g.moveTo(x, y);   // grietas de luz
    for (let j = 0; j < 7; j++){ r += 9 + R() * 8; a += (R() - 0.5) * 0.8; x = c + Math.cos(a) * r; y = c + Math.sin(a) * r; g.lineTo(x, y); }
    g.strokeStyle = 'rgba(255,170,255,0.8)'; g.lineWidth = 3; g.stroke(); g.strokeStyle = '#ffffff'; g.lineWidth = 1.2; g.stroke(); }
  for (let k = 0; k < 5; k++){ const a0 = R() * TAU; g.beginPath(); for (let j = 0; j <= 24; j++){ const r = 112 - j * 3.5, a = a0 + j * 0.24; j ? g.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r) : g.moveTo(c + Math.cos(a) * r, c + Math.sin(a) * r); }
    g.strokeStyle = 'rgba(230,200,255,0.5)'; g.lineWidth = 3; g.stroke(); } });
// la zanja que deja: franja oscura con los cantos violeta y las puntas desvanecidas
const VAC_ZANJA = (() => { const t = new THREE.CanvasTexture(foilLienzo(64, 256, g => {
  const gx = g.createLinearGradient(0, 0, 64, 0); gx.addColorStop(0, 'rgba(120,40,255,0)'); gx.addColorStop(0.18, 'rgba(190,110,255,0.85)'); gx.addColorStop(0.3, 'rgba(30,6,50,0.95)'); gx.addColorStop(0.7, 'rgba(30,6,50,0.95)'); gx.addColorStop(0.82, 'rgba(190,110,255,0.85)'); gx.addColorStop(1, 'rgba(120,40,255,0)');
  g.fillStyle = gx; g.fillRect(0, 0, 64, 256); g.globalCompositeOperation = 'destination-in';
  const gy = g.createLinearGradient(0, 0, 0, 256); gy.addColorStop(0, 'rgba(0,0,0,0)'); gy.addColorStop(0.08, 'rgba(0,0,0,1)'); gy.addColorStop(0.9, 'rgba(0,0,0,1)'); gy.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gy; g.fillRect(0, 0, 64, 256); }));
  t.minFilter = THREE.LinearFilter; return t; })();
function vacConstruye(){
  if (VAC.cup) return;
  const uT = { value: 0 };
  VAC.cup = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), new THREE.ShaderMaterial({ vertexShader: VAC_VS, fragmentShader: VAC_COSMOS_FS, uniforms: { uT }, side: THREE.BackSide }));
  VAC.borde = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 24), new THREE.ShaderMaterial({ vertexShader: VAC_BORDE_VS, fragmentShader: VAC_BORDE_FS, uniforms: { uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  VAC.suelo = new THREE.Mesh(new THREE.CircleGeometry(1, 64), new THREE.ShaderMaterial({ vertexShader: VAC_SUELO_VS, fragmentShader: VAC_SUELO_FS, uniforms: { uT, uR: { value: 1 }, uC: { value: new THREE.Vector2() } } }));
  VAC.suelo.rotation.x = -Math.PI / 2;
  VAC.zanja = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: VAC_ZANJA, transparent: true, depthWrite: false }));
  VAC.zanja.rotation.order = 'YXZ'; VAC.zanja.renderOrder = 2;
  for (const m of [VAC.cup, VAC.borde, VAC.suelo, VAC.zanja]){ m.visible = false; m.frustumCulled = false; scene.add(m); }
  VAC.azul = xtrSprite(VAC_AZUL, 0.9); VAC.rojo = xtrSprite(VAC_ROJO, 0.9); VAC.mor = xtrSprite(VAC_MORADO, 3); VAC.halo = xtrSprite(VAC_MORADO.clone(), 6);
  VAC.halo.material.opacity = 0.35;
}
// especial con el ímpetu lleno (si no se puede, el especial de siempre)
function vacEspecial(){
  if (!grounded || NUCA.m || FOILX.forma || !foilEscenario()) return false;
  vacConstruye();
  const F = foilForma({ id: 'vac', dur: VAC_T.fin, intocable: true, escena: true, soloForma: true, camK: 0.85,
    tick(dt){ vacTick(dt); }, pose(){ vacPose(); }, fin(m){ vacFin(m); } });
  if (!F) return false;
  VAC.F = F; F.S = hero.position.clone(); F.f = hero.rotation.y; F.golpeados = new Set(); F.lanza = null;
  VAC.prev = { fogN: shared.uFogNear.value, fogF: shared.uFogFar.value, fogC: shared.uFogCol.value.clone(), luz: shared.uLightCol.value.clone(), amb: shared.uAmb.value.clone() };
  state = 'normal'; attackW = 0; queued = false; comboT = 0; staffToBack(); MOV11.vx = MOV11.vz = 0;
  play('vacSello'); slowT = Math.max(slowT, 0.4);
  return true;
}
// con la burbuja cerrada, el escenario desaparece (como en el colosal: solo lo que estaba a la vista) y vuelve al romperse
function vacOculta(){
  if (VAC.ocultos) return; VAC.ocultos = []; VAC.amb = ambMode; ambMode = null;   // (updateAmbient volvería a enseñar sus partículas)
  for (const o of [...BIOMES.map(b => b.group), ground, rune, braz, toroBig, homeGroup, renderGroup, ...brazRuins, ...mountainsList, ...ambP]) if (o && o.visible){ o.visible = false; VAC.ocultos.push(o); }
}
function vacMuestra(){ if (!VAC.ocultos) return; for (const o of VAC.ocultos) o.visible = true; VAC.ocultos = null; ambMode = VAC.amb; }
// la luz y la niebla del vacío (k = 0, las de antes, exactas; k = 1, las del vacío)
function vacMundo(k){
  const P_ = VAC.prev; if (!P_) return;
  shared.uFogNear.value = lerp(P_.fogN, 10, k); shared.uFogFar.value = lerp(P_.fogF, 40, k);
  shared.uFogCol.value.copy(P_.fogC).lerp(xtrC.setHex(0x080420), k);
  shared.uLightCol.value.copy(P_.luz).lerp(xtrC.setHex(0xc4ccff), k);
  shared.uAmb.value.copy(P_.amb).lerp(xtrC.setHex(0x2a2456), k);
}
function vacBurbuja(R, S, canto){
  const on = R > 0.05;
  for (const m of [VAC.cup, VAC.suelo]) m.visible = on;
  VAC.borde.visible = on && canto > 0.01; VAC.borde.material.uniforms.uA.value = canto;
  if (!on) return;
  VAC.cup.position.set(S.x, 0, S.z); VAC.cup.scale.setScalar(R); VAC.borde.position.copy(VAC.cup.position); VAC.borde.scale.setScalar(R * 1.004);
  VAC.suelo.position.set(S.x, 0.02, S.z); VAC.suelo.scale.setScalar(R); VAC.suelo.material.uniforms.uR.value = R; VAC.suelo.material.uniforms.uC.value.set(S.x, S.z);
}
function vacTick(dt){
  const F = VAC.F; if (!F) return; const t = F.t, H = hero.position, f = F.f, fx = Math.sin(f), fz = Math.cos(f);
  H.x = F.S.x; H.z = F.S.z; heading = hero.rotation.y = f; MOV11.vx = MOV11.vz = 0; if (state === 'attack' || state === 'charge') state = 'normal';
  VAC.cup.material.uniforms.uT.value += dt;
  // la burbuja crece desde Tovan, se queda y al final se encoge hasta él
  const crece = clamp((t - VAC_T.sello) / (VAC_T.lleno - VAC_T.sello), 0, 1), encoge = clamp((t - VAC_T.encoge) / (VAC_T.fin - 0.12 - VAC_T.encoge), 0, 1);
  vacBurbuja(VAC_R * Math.pow(crece, 2.2) * (1 - encoge * encoge * (3 - 2 * encoge)), F.S, crece < 1 ? 1 : encoge > 0 ? 1 - encoge * 0.5 : 0);
  vacMundo(Math.min(crece, 1 - encoge));
  VAC.para = t >= VAC_T.lleno * 0.75 && t < VAC_T.encoge + 0.3;   // paralizados mientras dura el vacío
  if (!F.abre && t >= VAC_T.sello){ F.abre = true; play('vacAbre'); flash('#0a0420', 0.5); ringFx(F.S.x, F.S.z, 0xc8d4ff, 0.3, 6, 0.5); shake = Math.max(shake, 0.35); }
  if (!F.cerrado && t >= VAC_T.lleno){ F.cerrado = true; vacOculta(); flash('#f4f0ff', 0.55); shake = Math.max(shake, 0.25); }   // dentro ya no queda nada del mundo
  if (VAC.para && dt > 0) for (const e of enemies){ if (!e.alive || e.spawnT > 0) continue;   // información que les cae encima
    if (rnd() < dt * 9){ const y = (e.numY || 1.6) * 0.9 + 2.4; pn(e.g.position.x + (rnd() - 0.5) * 0.8, y, e.g.position.z + (rnd() - 0.5) * 0.8, 0, -10, 0, rnd() < 0.5 ? 0xbfe6ff : 0xffffff, 0.07, 0.24, 0, 0, 1, SH7.dot, 0.9); }
    if (rnd() < dt * 2.5) e.flash = 0.05; }
  // las esferas: azul en la mano izquierda, roja en la derecha; luego se juntan delante del pecho
  const C = xtrW.set(F.S.x + fx * 0.95, 1.3, F.S.z + fz * 0.95);
  if (!F.azul && t >= VAC_T.azul){ F.azul = true; VAC.azul.visible = true; play('vacAzul'); }
  if (!F.rojo && t >= VAC_T.rojo){ F.rojo = true; VAC.rojo.visible = true; play('vacRojo'); }
  if (F.azul && !F.funde){
    P.armR.hand.getWorldPosition(xtrV); P.armL.hand.getWorldPosition(xtrU);
    const j = clamp((t - VAC_T.junta) / (VAC_T.funde - VAC_T.junta), 0, 1), w = j * j, gira = j * 7;
    VAC.azul.position.lerpVectors(xtrV, C, w).add(xtrQv(Math.cos(gira) * 0.35 * (1 - j), Math.sin(gira) * 0.2 * (1 - j), 0));
    VAC.rojo.position.lerpVectors(xtrU, C, w).add(xtrQv(-Math.cos(gira) * 0.35 * (1 - j), -Math.sin(gira) * 0.2 * (1 - j), 0));
    VAC.azul.scale.setScalar(0.85 + Math.sin(time * 20) * 0.06); VAC.rojo.scale.setScalar(0.85 + Math.cos(time * 23) * 0.06);
    VAC.azul.material.rotation += dt * 4; VAC.rojo.material.rotation -= dt * 5;
    if (dt > 0 && rnd() < 0.8){ const a = rnd() * TAU; pn(VAC.azul.position.x + Math.cos(a) * 0.9, VAC.azul.position.y + Math.sin(a) * 0.9, VAC.azul.position.z, -Math.cos(a) * 2.6, -Math.sin(a) * 2.6, 0, 0x8fd0ff, 0.06, 0.3, 0, 0, 0.3, SH7.dot, 0.9); }
    if (F.rojo && dt > 0 && rnd() < 0.8){ const a = rnd() * TAU; pn(VAC.rojo.position.x, VAC.rojo.position.y, VAC.rojo.position.z, Math.cos(a) * 2.6, Math.sin(a) * 2.6, (rnd() - 0.5) * 2, 0xff7a6a, 0.06, 0.3, 0, 0, 0.3, SH7.dot, 0.9); }
  }
  if (!F.funde && t >= VAC_T.funde){ F.funde = true; VAC.azul.visible = VAC.rojo.visible = false; VAC.mor.visible = VAC.halo.visible = true;   // ¡se juntan!
    flash('#e8d0ff', 0.6); lightFlash(C.x, C.y, C.z, 0xb070ff, 4, 16); shake = Math.max(shake, 0.6); hitStop = Math.max(hitStop, 0.06); play('vacJunta'); slowT = Math.max(slowT, 0.3);
    ringFx(C.x, C.z, 0xd8b0ff, 0.4, 5.5, 0.45); burst7(PN7, C.x, C.y, C.z, 40, [0xffffff, 0xc080ff, 0x8a3cff], 7, 0.12, 0.5, 0, 2, 0, SH7.dot); F.camK = 1.3; }
  if (F.funde && !F.lanza){ const k = clamp((t - VAC_T.funde) / 0.25, 0, 1); VAC.mor.position.copy(C); VAC.halo.position.copy(C); VAC.mor.scale.setScalar(0.6 + k * 2.8 + Math.sin(time * 40) * 0.12); VAC.halo.scale.setScalar(2 + k * 4); VAC.mor.material.rotation += dt * 3; }
  if (!F.lanza && t >= VAC_T.suelta){   // ¡Púrpura!
    F.lanza = { t: 0, O: C.clone(), c1: mtoCinta(VAC_COLA, 'vac'), c2: mtoCinta(VAC_COLA2, 'vac'), anillo: 0 };
    shake = Math.max(shake, 1); hitStop = Math.max(hitStop, 0.09); flash('#d8b0ff', 0.55); play('vacPurpura'); }
  if (F.lanza) vacVuela(F, dt);
  // la cámara se pone, despacio, detrás de Tovan (así se ve el recorrido del Púrpura)
  if (t > VAC_T.junta - 0.4 && t < VAC_T.suelta + 1 && dt > 0 && !dragging) camYaw = lerpAngle(camYaw, f + Math.PI, 1 - Math.exp(-dt * 2.2));
  if (!F.cierra && t >= VAC_T.encoge){ F.cierra = true; vacMuestra(); flash('#f4f0ff', 0.5); play('vacCierra'); F.camK = 1; }   // se rompe: vuelve el mundo y la burbuja se encoge
}
function vacVuela(F, dt){
  const L = F.lanza, f = F.f, fx = Math.sin(f), fz = Math.cos(f); L.t += dt;
  const u = clamp(L.t / VAC_T.vuela, 0, 1), s = Math.pow(u, 1.3) * VAC_LARGO, x = L.O.x + fx * s, z = L.O.z + fz * s, fuera = clamp((L.t - VAC_T.vuela) / 0.3, 0, 1);
  VAC.mor.position.set(x, 1.3, z); VAC.halo.position.set(x, 1.3, z); VAC.mor.scale.setScalar((3.6 + Math.sin(time * 40) * 0.2) * (1 - fuera)); VAC.halo.scale.setScalar(6.5 * (1 - fuera)); VAC.mor.material.rotation += dt * 6;
  if (fuera >= 1){ VAC.mor.visible = VAC.halo.visible = false; }
  const P_ = (q, v) => v.set(L.O.x + fx * q, 1.3, L.O.z + fz * q);
  if (L.c1){ const a = 1 - clamp((L.t - VAC_T.vuela) / 0.8, 0, 1); tintaPinta(L.c1, P_, Math.max(0, s - 16), Math.max(0.01, s), k => 3.8 * Math.sqrt(k)); tintaPinta(L.c2, P_, Math.max(0, s - 11), Math.max(0.01, s), k => 1.3 * k);
    L.c1.mat.uniforms.uAlpha.value = L.c2.mat.uniforms.uAlpha.value = a; if (a <= 0){ tintaSuelta(L.c1); tintaSuelta(L.c2); L.c1 = L.c2 = null; } }
  // la zanja crece por detrás
  if (s > 0.5){ VAC.zanja.visible = true; VAC.zanja.material.opacity = 1; VAC.zanja.position.set(L.O.x + fx * s / 2, 0.035, L.O.z + fz * s / 2); VAC.zanja.rotation.set(-Math.PI / 2, f, 0); VAC.zanja.scale.set(3.4, s, 1); }
  if (u < 1 && dt > 0){
    while (L.anillo < s){ ringFx(L.O.x + fx * L.anillo, L.O.z + fz * L.anillo, 0xc890ff, 0.6, 3.4, 0.35); L.anillo += 2.6; }
    for (let i = 0; i < 4; i++){ const a = rnd() * TAU; pn(x + Math.cos(a) * 1.4, 1.3 + Math.sin(a) * 1.4, z, Math.cos(a) * 3, Math.sin(a) * 3, (rnd() - 0.5) * 3, rnd() < 0.5 ? 0xd8a8ff : 0xffffff, 0.14, 0.45, 0, 2, 0.2, SH7.dot, 0.9); }
    for (const e of enemies){ if (!e.alive || F.golpeados.has(e) || e.spawnT > 0) continue; if (Math.hypot(e.g.position.x - x, e.g.position.z - z) > 3 + e.r) continue; F.golpeados.add(e); vacBorra(e, fx, fz, x, z); }
    shake = Math.max(shake, 0.4);
  }
}
// lo que toca el Púrpura desaparece (a los fuertes, un buen mordisco)
function vacBorra(e, nx, nz, x, z){
  if (strFuerte(e)){ foilGolpea(e, rdmg(150) + Math.round(e.maxHp * 0.06), nx, nz, 10, 'shock', 2); return; }
  xtrRemata(e, nx, nz, 2);
  if (e.alive) return; const S = e.g.position.clone();
  strMuerte(e, 0.4, (q, k) => { q.g.scale.setScalar(q.scale * Math.max(0.01, 1 - k)); q.g.position.lerpVectors(S, xtrV.set(x, 0.6, z), k * 0.6); q.g.rotation.y += 0.5;
    if (rnd() < 0.6) pn(q.g.position.x, 0.7 * q.scale, q.g.position.z, (rnd() - 0.5) * 3, rnd() * 3, (rnd() - 0.5) * 3, rnd() < 0.5 ? 0xb070ff : 0xffffff, 0.12, 0.4, 0, 2, 0, SH7.dot, 0.9); });
}
function vacPose(){
  const F = VAC.F; if (!F) return; const t = F.t;
  if (t < VAC_T.azul){ const k = Math.min(1, t / 0.18);   // el sello: la mano derecha delante de la cara, los dedos cruzados
    bl(P.armL.sh.rotation, 'x', -1.6, k); bl(P.armL.sh.rotation, 'y', 0, k); bl(P.armL.sh.rotation, 'z', 0.45, k); bl(P.armL.el.rotation, 'x', -1.5, k);
    bl(P.armR.sh.rotation, 'x', 0.1, k); bl(P.armR.sh.rotation, 'z', 0.25, k); bl(P.armR.el.rotation, 'x', -0.2, k);
    bl(P.neck.rotation, 'x', t < VAC_T.sello ? 0.25 : -0.12, k); bl(P.neck.rotation, 'y', 0, k); bl(P.spine.rotation, 'x', -0.05, k); }
  else if (t < VAC_T.junta){ const k = Math.min(1, (t - VAC_T.azul) / 0.15);   // brazos abiertos: una esfera en cada mano
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -0.7, k); bl(A.sh.rotation, 'y', 0, k); bl(A.sh.rotation, 'z', 1.05 * s, k); bl(A.el.rotation, 'x', -0.45, k); }
    bl(P.neck.rotation, 'x', -0.08, k); }
  else if (t < VAC_T.suelta){ const k = Math.min(1, (t - VAC_T.junta) / 0.15);   // las junta delante
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -1.4, k); bl(A.sh.rotation, 'y', 0, k); bl(A.sh.rotation, 'z', -0.22 * s, k); bl(A.el.rotation, 'x', -0.3, k); }
    bl(P.spine.rotation, 'x', 0.12, k); }
  else { const k = Math.min(1, (t - VAC_T.suelta) / 0.08);   // y lo suelta: el brazo derecho estirado, el otro atrás
    bl(P.armL.sh.rotation, 'x', -1.55, k); bl(P.armL.sh.rotation, 'z', -0.05, k); bl(P.armL.el.rotation, 'x', 0, k);
    bl(P.armR.sh.rotation, 'x', 0.5, k); bl(P.armR.sh.rotation, 'z', 0.35, k); bl(P.spine.rotation, 'x', 0.2, k); bl(P.spine.rotation, 'y', 0.25, k); }
}
function vacFin(m){
  const F = VAC.F; VAC.F = null; VAC.para = false;
  vacMuestra(); if (VAC.prev){ vacMundo(0); VAC.prev = null; }
  for (const o of [VAC.cup, VAC.borde, VAC.suelo, VAC.azul, VAC.rojo, VAC.mor, VAC.halo]) if (o) o.visible = false;
  if (F && F.lanza){ if (F.lanza.c1) tintaSuelta(F.lanza.c1); if (F.lanza.c2) tintaSuelta(F.lanza.c2); F.lanza.c1 = F.lanza.c2 = null; }
  if (m === 'tiempo' && VAC.zanja && VAC.zanja.visible){ const z = VAC.zanja;   // la zanja se queda un poco y se borra
    foilFx.push({ t: 0, upd(){ if (!z.visible) return false; z.material.opacity = 1 - clamp((this.t - 2) / 1.2, 0, 1); return this.t < 3.2; }, fin(){ z.visible = false; } }); }
  else if (VAC.zanja) VAC.zanja.visible = false;
}
// paralizados: ni piensan ni se mueven (sí reciben golpes)
const vac_updateEnemy = updateEnemy;
updateEnemy = function(e, dt){
  if (VAC.para && e.alive && e.dying <= 0 && e.spawnT <= 0 && !e.colEscama){ e.vx = e.vz = 0; if (e.flash > 0) e.flash -= dt; if (e.tele) e.tele.visible = false; applyFlash(e); return; }
  vac_updateEnemy(e, dt);
};
Object.assign(SFX, {
  vacSello: () => { tone({ type: 'sine', f0: 62, f1: 38, dur: 1.4, vol: 0.5, rv: 0.6 }); tone({ type: 'triangle', f0: NOTE(88), dur: 1.2, vol: 0.05, attack: 0.02, rv: 0.8 }); noise({ dur: 0.6, vol: 0.12, f0: 5000, type: 'highpass', rv: 0.5 }); },
  vacAbre: () => { noise({ dur: 0.9, vol: 0.3, f0: 300, f1: 5000, type: 'bandpass', q: 0.7, attack: 0.35, rv: 0.7 }); tone({ type: 'sine', f0: 40, f1: 130, dur: 0.9, vol: 0.45, attack: 0.2, rv: 0.6 });
    [57, 64, 70, 75].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 3.6, vol: 0.035, attack: 0.6, when: 0.4 + i * 0.05, rv: 0.9 })); },
  vacAzul: () => { tone({ type: 'sine', f0: 280, f1: 900, dur: 0.6, vol: 0.12, rv: 0.4 }); noise({ dur: 0.6, vol: 0.12, f0: 2500, f1: 600, type: 'bandpass', q: 2, rv: 0.4 }); },
  vacRojo: () => { tone({ type: 'sawtooth', f0: 900, f1: 260, dur: 0.5, vol: 0.07, rv: 0.4 }); noise({ dur: 0.5, vol: 0.14, f0: 800, f1: 3000, type: 'bandpass', q: 2, rv: 0.4 }); },
  vacJunta: () => { [48, 55, 63, 70].forEach(n => tone({ type: 'triangle', f0: NOTE(n), dur: 1.4, vol: 0.07, rv: 0.8 })); tone({ type: 'sine', f0: 120, f1: 30, dur: 0.9, vol: 0.6, rv: 0.6 }); noise({ dur: 0.4, vol: 0.3, f0: 6000, type: 'highpass', rv: 0.5 }); },
  vacPurpura: () => { tone({ type: 'sine', f0: 85, f1: 20, dur: 1.6, vol: 0.95, rv: 0.7 }); noise({ dur: 1.4, vol: 0.55, f0: 1400, f1: 90, type: 'lowpass', q: 0.8, rv: 0.7 });
    tone({ type: 'sawtooth', f0: 110, f1: 50, dur: 1.1, vol: 0.12, rv: 0.5 }); noise({ dur: 0.2, vol: 0.4, f0: 7000, type: 'highpass', rv: 0.4 }); },
  vacCierra: () => { noise({ dur: 0.8, vol: 0.22, f0: 5000, f1: 300, type: 'bandpass', q: 0.7, rv: 0.6 }); tone({ type: 'sine', f0: 140, f1: 45, dur: 0.8, vol: 0.35, rv: 0.6 }); }
});
foilPoder({ id: 'foilDominio', ic: '🌌', name: 'Expansión de dominio', tags: ['otaku'],
  desc: 'Especial (con el ímpetu lleno): cruzas los dedos y el mundo se convierte en un vacío de estrellas. Los enemigos se quedan paralizados, saturados de información, y juntas una esfera azul y otra roja en el «Púrpura», que borra todo lo que encuentra en 26 m.',
  especial(){ return vacEspecial(); } });

/* ======================================================================
   CALAVERAS CAÑÓN (gst)
   ====================================================================== */
const GST = { pool: [], cd: 0, n: 0, ojo: null, ojoT: 0 };
const GST_RAYO = [0xffffff, 0x9ae8ff, 0xffffff, 0], GST_RAYO2 = [0xffffff, 0xffffff, 0xffffff, 0];
const GST_T = { llega: 0.28, carga: 0.62, dispara: 1.02, fin: 1.4 }, GST_ESC = 1.1;
// Rayo de calavera (aditivo): núcleo blanco liso, halo cian y un temblor que corre a lo largo
TRAZO_FS.gst = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
void main(){
  float u = vUV.x, a = abs(vUV.y);
  float core = 1.0 - smoothstep(0.35, 0.6, a), glow = pow(max(0.0, 1.0 - a), 2.0);
  float vib = 0.85 + 0.15 * sin(u * uLen * 3.0 - uTime * 50.0);
  vec3 col = uA * core * 1.3 + uB * glow * 0.9 * vib;
  gl_FragColor = vec4(col, uAlpha * clamp(core + glow, 0.0, 1.0) * smoothstep(0.0, 0.03, u));
}`;
const GST_OJO = xtrBrillo(120, 230, 255), GST_BOCA = xtrBrillo(170, 240, 255), GST_OJO_AMA = xtrBrillo(255, 230, 90);
// una calavera de cabra: cráneo, hocico, cuernos hacia atrás y la mandíbula aparte (para abrirla)
let gstMats = null;
function gstCalavera(){
  if (!gstMats) gstMats = { blanco: makeMat(0xf0f0e8, { emissive: 0.3 }), negro: makeMat(0x07070c) };
  const { blanco, negro } = gstMats, g = new THREE.Group(), src = new THREE.Group(), mSrc = new THREE.Group(), mand = new THREE.Group();
  mesh(B(0.9, 0.55, 0.8), blanco, 0, 0.18, -0.1, src); mesh(B(0.62, 0.3, 0.9), blanco, 0, 0.06, 0.66, src); mesh(B(0.74, 0.12, 0.5), blanco, 0, 0.44, 0.06, src);
  for (const s of [-1, 1]){ const c = mesh(B(0.14, 0.66, 0.16), blanco, 0.36 * s, 0.62, -0.44, src); c.rotation.set(-0.75, 0, -0.35 * s);
    mesh(B(0.26, 0.19, 0.06), negro, 0.22 * s, 0.24, 0.3, src); mesh(B(0.08, 0.06, 0.05), negro, 0.12 * s, 0.1, 1.11, src);
    for (let i = 0; i < 3; i++) mesh(B(0.07, 0.09, 0.07), blanco, (0.07 + i * 0.09) * s, -0.13, 1.02 - i * 0.12, src); }
  mesh(B(0.56, 0.12, 0.92), blanco, 0, -0.06, 0.34, mSrc);
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) mesh(B(0.07, 0.08, 0.07), blanco, (0.07 + i * 0.09) * s, 0.04, 0.7 - i * 0.12, mSrc);
  mpFusiona(src, g); mpFusiona(mSrc, mand); mand.position.set(0, -0.06, 0.12); g.add(mand);
  const ojos = [-1, 1].map(s => { const o = new THREE.Sprite(GST_OJO); o.scale.setScalar(0.3); o.position.set(0.22 * s, 0.24, 0.36); g.add(o); return o; });
  const boca = new THREE.Sprite(GST_BOCA); boca.position.set(0, -0.06, 1.12); g.add(boca);
  g.visible = false; g.rotation.order = 'YXZ'; scene.add(g);
  return { g, mand, ojos, boca, on: false };
}
function gstCoge(){ let b = GST.pool.find(q => !q.on); if (!b){ if (GST.pool.length >= 10) return null; b = gstCalavera(); GST.pool.push(b); } b.on = true; return b; }
// una calavera que llega a P girando, apunta a T, carga y dispara un rayo de L metros
function gstSale(P0, T, L, retraso, A){
  A = A || 1.05;
  const b = gstCoge(); if (!b) return;
  const yaw = Math.atan2(T.x - P0.x, T.z - P0.z), dir = new V3(Math.sin(yaw), 0, Math.cos(yaw)), desde = P0.clone().addScaledVector(dir, -2.5).add(new V3(0, 2.4, 0)), P = P0.clone();
  const tocado = new Map(); let tic = 0, sonado = 0;
  const fx = { t: -retraso, cintas: [], upd(dt){
      const t = this.t, g = b.g; if (t < 0){ g.visible = false; return true; }
      g.visible = true;
      if (t < GST_T.llega){ const u = t / GST_T.llega, w = 1 - Math.pow(1 - u, 3); g.position.lerpVectors(desde, P, w); g.rotation.set(0, yaw + (1 - w) * TAU, 0); g.scale.setScalar(GST_ESC * Math.max(0.05, w)); b.mand.rotation.x = 0; b.boca.scale.setScalar(0.01);
        if (!sonado){ sonado = 1; play('gstSale'); } return true; }
      g.rotation.set(0, yaw, 0);
      if (t < GST_T.carga){ const u = (t - GST_T.llega) / (GST_T.carga - GST_T.llega); g.position.copy(P); g.scale.setScalar(GST_ESC); b.mand.rotation.x = 0.5 * u; b.boca.scale.setScalar(0.2 + u * 0.7);
        for (const o of b.ojos) o.scale.setScalar(0.3 + u * 0.25 + Math.sin(time * 40) * 0.04);
        if (sonado < 2){ sonado = 2; play('gstCarga'); }
        if (dt > 0 && rnd() < 0.9){ b.boca.getWorldPosition(xtrV); const a = rnd() * TAU; pn(xtrV.x + Math.cos(a) * 0.9, xtrV.y + Math.sin(a) * 0.9, xtrV.z, -Math.cos(a) * 3, -Math.sin(a) * 3, 0, 0xcff4ff, 0.06, 0.28, 0, 0, 0.2, SH7.dot, 0.9); }
        return true; }
      b.boca.getWorldPosition(xtrV); const M = xtrV.clone(); M.y = Math.max(0.9, M.y - 0.1);
      if (t < GST_T.dispara){ const u = (t - GST_T.carga) / (GST_T.dispara - GST_T.carga);
        if (sonado < 3){ sonado = 3; play('gstDispara'); shake = Math.max(shake, 0.3); this.cintas.push(mtoCinta(GST_RAYO, 'gst'), mtoCinta(GST_RAYO2, 'gst')); lightFlash(M.x, M.y, M.z, 0xbfefff, 2.2, 12); }
        g.position.copy(P).addScaledVector(dir, -0.6 * Math.min(1, u * 4)).add(xtrU.set((rnd() - 0.5) * 0.06, (rnd() - 0.5) * 0.06, 0)); b.mand.rotation.x = 0.75; b.boca.scale.setScalar(1.3 + Math.sin(time * 50) * 0.15);
        const ancho = A * (0.85 + 0.15 * Math.sin(time * 60)), Pr = (s, v) => v.copy(M).addScaledVector(dir, s * L);
        tintaPinta(this.cintas[0], Pr, 0, 1, () => ancho); tintaPinta(this.cintas[1], Pr, 0, 1, () => ancho * 0.42);
        if (dt > 0 && (tic -= dt) <= 0){ tic = 0.1;   // daño a lo largo del rayo
          for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue; const n = tocado.get(e) || 0; if (n >= 4) continue;
            const px = e.g.position.x - M.x, pz = e.g.position.z - M.z, s = px * dir.x + pz * dir.z; if (s < -e.r || s > L + e.r) continue;
            if (Math.abs(px * dir.z - pz * dir.x) > 0.8 + e.r) continue; tocado.set(e, n + 1); foilGolpea(e, rdmg(15), dir.x, dir.z, 1.2, null, 1); } }
        for (let i = 0; i < 2 && dt > 0; i++){ const s = rnd() * L; pn(M.x + dir.x * s, M.y + (rnd() - 0.5) * 0.6, M.z + dir.z * s, (rnd() - 0.5) * 2, 1 + rnd() * 2, (rnd() - 0.5) * 2, 0xdff8ff, 0.07, 0.3, 0, 1, 0, SH7.dot, 0.8); }
        return true; }
      const u = clamp((t - GST_T.dispara) / (GST_T.fin - GST_T.dispara), 0, 1), Pr = (s, v) => v.copy(M).addScaledVector(dir, s * L);   // se apaga y se va
      if (this.cintas.length){ tintaPinta(this.cintas[0], Pr, 0, 1, () => A * (1 - u)); tintaPinta(this.cintas[1], Pr, 0, 1, () => A * 0.42 * (1 - u)); for (const c of this.cintas) c.mat.uniforms.uAlpha.value = 1 - u; }
      g.position.copy(P).addScaledVector(dir, -0.6 - u * 2.2).add(xtrU.set(0, u * 1.6, 0)); g.scale.setScalar(GST_ESC * (1 - u * u)); b.mand.rotation.x = 0.75 * (1 - u);
      return u < 1; },
    fin(){ b.on = false; b.g.visible = false; for (const o of b.ojos) o.scale.setScalar(0.3); } };
  foilFx.push(fx);
}
// el ojo izquierdo de Tovan se enciende (cian y amarillo, a ratos)
function gstOjo(dur){ if (!GST.ojo){ GST.ojo = xtrSprite(GST_OJO.clone(), 0.32); GST.ojo.renderOrder = 7; GST.ojo.material.depthTest = false; } GST.ojoT = Math.max(GST.ojoT, dur); }
function gstOjoTick(dt){
  const o = GST.ojo; if (!o) return; if (dt > 0) GST.ojoT -= dt;
  const ver = GST.ojoT > 0 && P.body.visible && !player.dead && (gameState === 'play' || gameState === 'paused'); o.visible = ver; if (!ver) return;
  P.neck.localToWorld(o.position.set(0.085, 0.07, 0.21)); o.material.color.setHex(Math.floor(time * 7) % 3 === 0 ? 0xffe060 : 0x8fe8ff); o.scale.setScalar(0.28 + Math.sin(time * 30) * 0.04);
}
// rumbo de la cámara a Tovan (las calaveras salen solo en el lado de allá: entre la cámara y Tovan tapaban la pantalla)
const gstFrente = () => Math.atan2(hero.position.x - camera.position.x, hero.position.z - camera.position.z);
// al recibir un golpe: cuatro calaveras detrás y a los lados de Tovan apuntando a los más cercanos (el que te ha dado, el primero)
function gstHerido(sx, sz){
  if (GST.cd > 0 || !foilPuede() || !foilEscenario()) return; const H = hero.position, f0 = gstFrente();
  const L = foilEnemigos(H, 14).sort((a, b) => Math.hypot(a.g.position.x - sx, a.g.position.z - sz) - Math.hypot(b.g.position.x - sx, b.g.position.z - sz)).slice(0, 4);
  if (!L.length) return; GST.cd = 3;
  L.forEach((e, i) => { const a = f0 + [-0.75, 0.75, -1.45, 1.45][i], P0 = new V3(H.x + Math.sin(a) * 3, 1.75 + (i >> 1) * 0.45, H.z + Math.cos(a) * 3);
    gstSale(P0, e.g.position, 16, i * 0.08); });
  gstOjo(1.6);
}
// cada cuarto remate: seis en abanico al otro lado, apuntando a Tovan con un poco de desvío para que los rayos se crucen delante de él
function gstRemate(){
  if (++GST.n % 4 || !foilEscenario()) return; const H = hero.position, f0 = gstFrente(), R = MP.on ? 7.5 : Math.min(7, ARENA + 0.8);
  for (let i = 0; i < 6; i++){ const a = f0 + (i - 2.5) * 0.5, P0 = new V3(H.x + Math.sin(a) * R, 1.8 + (i % 2) * 0.45, H.z + Math.cos(a) * R), lado = (i % 2 ? 1 : -1) * 1.3;
    gstSale(P0, new V3(H.x + Math.cos(a) * lado, 0, H.z - Math.sin(a) * lado), R + 2.5, i * 0.06, 0.75); }
  gstOjo(2); shake = Math.max(shake, 0.2);
}
// (las calaveras van por foilFx, que se recoge solo en cada limpieza; aquí, el ojo)
function gstLimpia(){ GST.ojoT = 0; if (GST.ojo) GST.ojo.visible = false; }
Object.assign(SFX, {
  gstSale: () => { noise({ dur: 0.28, vol: 0.18, f0: 600, f1: 3500, type: 'bandpass', q: 1.2, rv: 0.2 }); },
  gstCarga: () => { tone({ type: 'sine', f0: 240, f1: 1100, dur: 0.36, vol: 0.09, rv: 0.2 }); tone({ type: 'square', f0: 120, f1: 520, dur: 0.36, vol: 0.03 }); },
  gstDispara: () => { tone({ type: 'sawtooth', f0: 98, f1: 92, dur: 0.45, vol: 0.13, rv: 0.3 }); tone({ type: 'square', f0: 196, f1: 180, dur: 0.4, vol: 0.05, rv: 0.3 }); noise({ dur: 0.45, vol: 0.32, f0: 2500, f1: 700, type: 'bandpass', q: 0.6, rv: 0.3 }); }
});
foilPoder({ id: 'foilCalaveras', ic: '💀', name: 'Calaveras cañón', tags: ['otaku'],
  desc: 'Cuando te hacen daño, aparecen girando calaveras de cabra que apuntan a los enemigos más cercanos, abren la mandíbula y disparan un rayo blanco que lo atraviesa todo. Cada cuarto remate, seis calaveras en abanico cuyos rayos se cruzan delante de ti.',
  herido(dmg, sx, sz){ try { gstHerido(sx, sz); } catch (err) { console.error(err); } return null; },
  remate(){ gstRemate(); }, tick(dt){ if (GST.cd > 0) GST.cd -= dt; gstOjoTick(dt); }, reset(){ GST.n = 0; GST.cd = 0; }, limpia(){ gstLimpia(); } });

/* ======================================================================
   BOLA CÓSMICA (ktm)
   ====================================================================== */
const KTM = { F: null, bola: null, giro: null, nucleo: null, R: 0.6, Rv: 0.6, vol: 0, esc: 1, cachis: [], pegados: [], pend: false, emb: 0, ult: new V3(), musT: 0, musN: 0 };
const KTM_DUR = 16, KTM_CIELO = 1.9, KTM_R0 = 0.6, KTM_SUBE = [3, 16];   // al final sube tantos metros y se aleja tantos (si sube más, se sale del encuadre)
const KTM_ARCO = [0, 0, 0, 0];
function ktmMat(c, em){ return (ktmMat.m[c] = ktmMat.m[c] || makeMat(c, { emissive: em == null ? 0.22 : em })); }
ktmMat.m = {};
function ktmConstruye(){
  if (KTM.bola) return;
  const g = new THREE.Group(), giro = new THREE.Group(), nucleo = new THREE.Group(), src = new THREE.Group(); g.add(giro); giro.add(nucleo); g.visible = false; scene.add(g);
  mesh(new THREE.IcosahedronGeometry(1, 1), ktmMat(0xff7ab8, 0.25), 0, 0, 0, src);
  for (let i = 0; i < 18; i++){ const y = 1 - (i + 0.5) / 18 * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996, d = new V3(Math.cos(a) * r, y, Math.sin(a) * r), m_ = i % 3 ? ktmMat(0x9ae85a, 0.25) : ktmMat(0xffe14a, 0.3);   // los nudos
    const c = mesh(new THREE.CylinderGeometry(0.15, 0.19, 0.34, 6), m_, d.x * 1.02, d.y * 1.02, d.z * 1.02, src); c.quaternion.setFromUnitVectors(xtrU.set(0, 1, 0), d);
    mesh(new THREE.SphereGeometry(0.16, 6, 4), m_, d.x * 1.19, d.y * 1.19, d.z * 1.19, src); }
  mpFusiona(src, nucleo);
  KTM.bola = g; KTM.giro = giro; KTM.nucleo = nucleo;
  // los cachivaches: doce cosas de casa y de feria, cada una fundida por material
  const R = mulberry32(8301), C = (geo, c, x, y, z, p, em) => mesh(geo, ktmMat(c, em), x, y, z, p);
  const tipos = [
    p => { C(B(0.66, 0.46, 0.46), 0xc89a5a, 0, 0, 0, p); C(B(0.68, 0.05, 0.12), 0xe8d8b0, 0, 0.23, 0, p); return 0.4; },                                                          // caja
    p => { C(new THREE.CylinderGeometry(0.03, 0.22, 0.6, 8), 0xff7a1a, 0, 0.06, 0, p); C(new THREE.CylinderGeometry(0.12, 0.155, 0.1, 8), 0xffffff, 0, 0.08, 0, p); C(B(0.48, 0.06, 0.48), 0xff7a1a, 0, -0.24, 0, p); return 0.34; },   // cono
    p => { const b = C(new THREE.SphereGeometry(0.24, 8, 6), 0xffe040, 0, 0, 0, p); b.scale.set(1.15, 0.85, 1.3); C(new THREE.SphereGeometry(0.15, 8, 6), 0xffe040, 0, 0.22, 0.16, p); C(B(0.12, 0.05, 0.14), 0xff8a1a, 0, 0.2, 0.32, p); return 0.33; },   // patito
    p => { C(new THREE.SphereGeometry(0.3, 10, 7), 0x2f9a3a, 0, 0, 0, p); C(new THREE.SphereGeometry(0.302, 10, 7, 0, 0.5), 0x1a6a24, 0, 0, 0, p); return 0.32; },               // sandía
    p => { C(B(0.38, 0.38, 0.38), 0xfafafa, 0, 0, 0, p); for (const [x, y, z] of [[0, 0, 0.2], [0.1, 0.1, -0.2], [-0.1, -0.1, -0.2], [0.2, 0.08, 0.08], [0.2, -0.08, -0.08], [0, 0.2, 0]]) C(B(0.07, 0.07, 0.07), 0x1a1a22, x, y, z, p, 0); return 0.3; },   // dado
    p => { C(new THREE.SphereGeometry(0.3, 10, 5, 0, TAU, 0, Math.PI / 2), 0xe8282a, 0, 0.05, 0, p); C(new THREE.CylinderGeometry(0.11, 0.13, 0.28, 8), 0xfff4e0, 0, -0.08, 0, p);
      for (let i = 0; i < 4; i++){ const a = i * 1.7; C(new THREE.SphereGeometry(0.06, 6, 4), 0xffffff, Math.cos(a) * 0.17, 0.27, Math.sin(a) * 0.17, p); } return 0.33; },   // seta
    p => { C(new THREE.CylinderGeometry(0.15, 0.15, 0.42, 10), 0xd81e2a, 0, 0, 0, p); C(new THREE.CylinderGeometry(0.152, 0.152, 0.05, 10), 0xd8d8e0, 0, 0.2, 0, p); return 0.3; },   // lata
    p => { C(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 5), 0xc8a060, 0, 0, 0, p); [[0xffb0c8, 0.2], [0xffffff, 0], [0x9ad860, -0.2]].forEach(([c, y]) => C(new THREE.SphereGeometry(0.12, 8, 6), c, 0, y, 0, p)); return 0.38; },   // dango
    p => { C(B(0.48, 0.42, 0.48), 0x3a7aff, 0, 0, 0, p); C(B(0.5, 0.44, 0.1), 0xffd040, 0, 0, 0, p); C(B(0.1, 0.44, 0.5), 0xffd040, 0, 0, 0, p); C(new THREE.TorusGeometry(0.09, 0.035, 5, 8), 0xffd040, 0, 0.28, 0, p); return 0.36; },   // regalo
    p => { const m = C(new THREE.CylinderGeometry(0.28, 0.28, 0.06, 14), 0xffc820, 0, 0, 0, p, 0.45); m.rotation.x = Math.PI / 2; return 0.3; },                           // moneda
    p => { C(B(0.36, 0.18, 0.22), 0xfafaf2, 0, 0, 0, p); C(B(0.4, 0.07, 0.26), 0xff8a6a, 0, 0.12, 0, p); C(B(0.08, 0.2, 0.24), 0x1a2a1a, 0, 0.03, 0, p, 0); return 0.28; },   // sushi
    p => { const f = C(new THREE.ConeGeometry(0.2, 0.36, 8), 0xff2a4a, 0, 0, 0, p); f.rotation.x = Math.PI; C(new THREE.ConeGeometry(0.14, 0.08, 6), 0x3aaa3a, 0, 0.2, 0, p); return 0.27; }   // fresa
  ];
  for (const fn of tipos){ const s = new THREE.Group(), q = new THREE.Group(); const r = fn(s); s.rotation.set(R() * 0.4, R() * TAU, R() * 0.4); mpFusiona(s, q); q.visible = false; scene.add(q); KTM.cachis.push({ g: q, r, on: false, pegado: false, vy: 0, bote: 0 }); }
}
// al empezar la oleada (en cuanto hay enemigos a la vista)
function ktmVigila(dt, jugando){
  if (KTM.F && dt > 0) ktmMusica(dt);
  if (KTM.F && (gameState === 'upgrade' || gameState === 'cutscene')){ foilFormaAcaba('oleada'); return; }   // (si no le dio tiempo a subir, se va)
  if (!jugando || !KTM.pend || FOILX.forma || player.dead || !foilPuede() || !foilEscenario() || NUCA.m || state === 'roll' || state === 'tech') return;
  if (foilEnemigos(hero.position, 30).length < 2) return;
  KTM.pend = false; ktmEmpieza();
}
function ktmEmpieza(){
  ktmConstruye();
  const F = foilForma({ id: 'ktm', dur: KTM_DUR, velK: 1.12, camK: 1,
    tick(dt){ ktmTick(dt); }, ataque(){ ktmEmbiste(); }, pose(){ ktmPose(); }, fin(m){ ktmFin(m); } });
  if (!F) return false;
  KTM.F = F; KTM.R = KTM.Rv = KTM_R0; KTM.vol = 0; KTM.esc = 1; KTM.emb = 0; KTM.musT = 0; KTM.musN = 0; KTM.pegados.length = 0;
  const g = KTM.bola, H = hero.position; g.visible = true; g.scale.setScalar(1); KTM.giro.quaternion.identity(); KTM.nucleo.scale.setScalar(KTM_R0);
  g.position.set(H.x + Math.sin(hero.rotation.y) * (KTM_R0 + 0.45), KTM_R0, H.z + Math.cos(hero.rotation.y) * (KTM_R0 + 0.45)); KTM.ult.copy(g.position);
  // llueven los cachivaches alrededor
  KTM.cachis.forEach((c, i) => { let x, z, n = 0; do { const a = rnd() * TAU, r = 2.5 + rnd() * (MP.on ? 8 : Math.max(2, ARENA - 3)); x = H.x + Math.cos(a) * r; z = H.z + Math.sin(a) * r; const v = clampArena(xtrV.set(x, 0, z), ARENA - 0.8); x = v.x; z = v.z; } while (MP.on && !mpLibre(x, z, 0.6) && ++n < 8);
    c.on = true; c.pegado = false; c.g.visible = true; c.g.scale.setScalar(1); c.g.position.set(x, 9 + i * 0.7, z); c.vy = 0; c.bote = 0; c.g.rotation.set(rnd() * TAU, rnd() * TAU, 0); });
  play('ktmEmpieza'); ringFx(g.position.x, g.position.z, 0xff9ad0, 0.3, 2.2, 0.4);
  return true;
}
function ktmCrece(v){ KTM.vol += v; KTM.R = Math.min(3.2, Math.cbrt(KTM_R0 * KTM_R0 * KTM_R0 + KTM.vol)); }
function ktmTick(dt){
  const F = KTM.F; if (!F) return; const g = KTM.bola, H = hero.position, f = hero.rotation.y;
  if (clearT > 0 && F.t < KTM_DUR - KTM_CIELO) F.t = KTM_DUR - KTM_CIELO;   // oleada ganada: sube ya al cielo
  const cielo = F.t >= KTM_DUR - KTM_CIELO;
  if (cielo){ ktmCielo(F, dt); return; }
  if (KTM.emb > 0){ KTM.emb -= dt; const v = clampArena(xtrV.set(H.x + Math.sin(f) * 10 * dt, 0, H.z + Math.cos(f) * 10 * dt), ARENA - 0.4); H.x = v.x; H.z = v.z; }
  KTM.Rv += (KTM.R - KTM.Rv) * (1 - Math.exp(-dt * 6)); const R = KTM.Rv; KTM.nucleo.scale.setScalar(R);
  // delante de Tovan, rodando sobre el suelo
  const tx = H.x + Math.sin(f) * (R + 0.45), tz = H.z + Math.cos(f) * (R + 0.45), k = 1 - Math.exp(-dt * 14);
  g.position.x += (tx - g.position.x) * k; g.position.z += (tz - g.position.z) * k; g.position.y = R;
  const dx = g.position.x - KTM.ult.x, dz = g.position.z - KTM.ult.z, d = Math.hypot(dx, dz);
  if (d > 1e-4){ xtrQ.setFromAxisAngle(xtrU.set(dz / d, 0, -dx / d), d / R); KTM.giro.quaternion.premultiply(xtrQ); }
  KTM.ult.copy(g.position);
  if (d > 0.02 && dt > 0 && rnd() < 0.5) puffAt(g.position.x - dx / d * R * 0.6, g.position.z - dz / d * R * 0.6, 1, 0.6, 0xd8c8b0);
  F.camK = 1 + (R - KTM_R0) * 0.38;
  // los cachivaches caen, botan y se pegan
  for (const c of KTM.cachis){ if (!c.on || c.pegado) continue; const q = c.g.position;
    if (q.y > c.r || c.vy > 0){ c.vy -= 22 * dt; q.y += c.vy * dt; c.g.rotation.x += dt * 3; if (q.y <= c.r){ q.y = c.r; if (c.bote++ < 1){ c.vy = 3.2; puffAt(q.x, q.z, 3, 0.8); play('ktmPlop'); } else c.vy = 0; } }
    if (q.distanceTo(g.position) < R + c.r * 0.8){ c.pegado = true; KTM.giro.attach(c.g); ktmCrece(c.r * c.r * c.r * 1.4); ktmPegaFx(q); } }
  // los enemigos: lo pequeño se pega y lo grande rebota
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
    const ex = e.g.position.x - g.position.x, ez = e.g.position.z - g.position.z, de = Math.hypot(ex, ez); if (de > R + e.r) continue;
    const nx = ex / Math.max(de, 0.01), nz = ez / Math.max(de, 0.01);
    if (strFuerte(e) || e.r * 1.45 > R){ const u = F.toques.get(e) || -9; if (time - u < 0.6) continue; F.toques.set(e, time);
      foilGolpea(e, rdmg(10 + R * 14), nx, nz, 5 + R * 2, null, 1); play('ktmBonk'); shake = Math.max(shake, 0.15); continue; }
    xtrRemata(e, nx, nz); if (!e.alive){ ktmPega(e); ktmCrece(Math.pow(e.r * 1.6, 3)); ktmPegaFx(e.g.position); } }
}
function ktmPegaFx(p){ for (let i = 0; i < 6; i++){ const a = rnd() * TAU; pn(p.x, p.y + 0.3, p.z, Math.cos(a) * 2, 1 + rnd() * 2, Math.sin(a) * 2, xtrHsv(rnd()), 0.1, 0.4, 4, 1, 0, SH7.star, 1); } play('ktmPega'); }
// un enemigo pegado: su sitio en la bola, guardado en el marco de la bola (gira y sube con ella)
function ktmPega(e){
  const g = KTM.bola, inv = xtrQ.copy(KTM.giro.quaternion).invert();
  const off = new V3(e.g.position.x - g.position.x, Math.max(0.2, 0.5 * e.scale) - g.position.y, e.g.position.z - g.position.z).normalize().multiplyScalar(KTM.R * 0.92).applyQuaternion(inv);
  const P0 = { e, off, q0: inv.clone().multiply(e.g.quaternion), s: e.g.scale.x * 0.85 }; KTM.pegados.push(P0);
  strMuerte(e, 999, q => { if (!KTM.pegados.includes(P0) || !KTM.bola.visible){ q.dying = 0; return; }
    q.g.position.copy(P0.off).applyQuaternion(KTM.giro.quaternion).multiplyScalar(KTM.esc).add(KTM.bola.position);
    q.g.quaternion.copy(KTM.giro.quaternion).multiply(P0.q0); q.g.scale.setScalar(P0.s * KTM.esc); });
}
// atacar: embestida (Tovan y la bola salen disparados unos metros)
function ktmEmbiste(){ if (KTM.emb > 0 || !KTM.F || KTM.F.t >= KTM_DUR - KTM_CIELO) return; KTM.emb = 0.32; play('ktmRueda'); const g = KTM.bola; ringFx(g.position.x, g.position.z, 0xffd0f0, 0.3, KTM.Rv + 1.2, 0.3); }
// el final: un arcoíris del cielo se la lleva y se hace estrella
function ktmCielo(F, dt){
  const g = KTM.bola, u = clamp((F.t - (KTM_DUR - KTM_CIELO)) / KTM_CIELO, 0, 1), H = hero.position;
  if (!F.escena){ F.escena = true; F.intocable = true; F.S = H.clone(); F.B = g.position.clone(); F.arco = [tintaCoge(KTM_ARCO, 0, 'ktm'), tintaCoge(KTM_ARCO, 0, 'ktm')]; play('ktmCielo'); flash('#fff0ff', 0.3);
    F.lejos = F.B.clone().sub(camera.position).normalize(); }   // se aleja en la dirección en que mira la cámara (así no se sale del encuadre) y sube un poco
  H.x = F.S.x; H.z = F.S.z; MOV11.vx = MOV11.vz = 0;
  const q = Math.pow(Math.max(0, u - 0.12) / 0.88, 1.6); g.position.copy(F.B).addScaledVector(F.lejos, q * KTM_SUBE[1]); g.position.y += q * KTM_SUBE[0]; const y = g.position.y; KTM.esc = 1 - Math.max(0, u - 0.3) / 0.7 * 0.75; g.scale.setScalar(KTM.esc);
  xtrQ.setFromAxisAngle(xtrU.set(0, 1, 0), dt * (4 + u * 16)); KTM.giro.quaternion.premultiply(xtrQ);
  const G = g.position, ab = Math.min(1, u / 0.12), Pa = (s, v) => v.set(G.x + Math.sin(s * 3 + time) * 0.3 * (1 - s), lerp(G.y + 50, G.y, s), G.z + Math.cos(s * 3 + time) * 0.3 * (1 - s));
  F.arco.forEach((c, i) => { tintaPinta(c, Pa, 0, ab, () => (KTM.Rv * 2.4 + 1) * (i ? 0.45 : 1)); c.mat.uniforms.uAlpha.value = (1 - Math.max(0, u - 0.85) / 0.15) * (i ? 1 : 0.8); });
  if (!F.onda && u >= 0.12){ F.onda = true; const r = KTM.Rv + 3.6;   // al despegar: onda arcoíris en el suelo
    xtrArea(F.B, r, () => rdmg(20 + KTM.Rv * 30), 8, null, 1.4); ringFx(F.B.x, F.B.z, 0xffffff, 0.5, r + 1, 0.5); ring7(PN7, F.B.x, 0.2, F.B.z, 28, [0xff6a8a, 0xffd04a, 0x6aff8a, 0x6ac8ff, 0xc86aff], 7, 0.16, 0.7, 0, 2, 0, SH7.star); shake = Math.max(shake, 0.5); play('ktmDespega'); }
  if (dt > 0 && rnd() < 0.8) pn(g.position.x + (rnd() - 0.5) * 2, g.position.y, g.position.z + (rnd() - 0.5) * 2, 0, -3, 0, xtrHsv(rnd()), 0.14, 0.6, 0, 0, 0, SH7.star, 1);
}
function ktmPose(){
  const F = KTM.F; if (!F) return;
  if (F.escena){ const k = Math.min(1, (F.t - (KTM_DUR - KTM_CIELO)) / 0.2);   // la mira subir con los brazos arriba
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -2.7, k); bl(A.sh.rotation, 'y', 0, k); bl(A.sh.rotation, 'z', 0.3 * s, k); bl(A.el.rotation, 'x', -0.2, k); }
    bl(P.neck.rotation, 'x', -0.6, k); return; }
  for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ A.sh.rotation.x = -1.2; A.sh.rotation.y = 0; A.sh.rotation.z = -0.22 * s; A.el.rotation.x = -0.35; }   // empuja con las dos manos
  P.spine.rotation.x += 0.3;
}
function ktmFin(m){
  const F = KTM.F; KTM.F = null; if (!KTM.bola) return; const g = KTM.bola;
  if (F && F.arco) F.arco.forEach(tintaSuelta);
  if (m === 'tiempo' && g.visible){ const p = g.position.clone(), s = new THREE.Sprite(KTM_ESTRELLA.clone()); s.material.depthTest = false; s.position.copy(p); s.renderOrder = 7;   // (brilla por encima de todo, aunque haya un muro delante)
    scene.add(s); play('ktmEstrella');   // ¡ya es una estrella!
    foilFx.push({ t: 0, upd(){ const k = this.t / 1.6; s.scale.setScalar(5 * Math.sin(Math.min(1, k * 3) * Math.PI / 2) * (1 - Math.max(0, k - 0.6) / 0.4) + 0.01); s.material.rotation = this.t * 2; s.material.opacity = 0.8 + 0.2 * Math.sin(this.t * 30); return k < 1; }, fin(){ scene.remove(s); } }); }
  g.visible = false; KTM.esc = 1; KTM.pegados.length = 0;   // (los enemigos pegados se quitan solos: ya no están en la lista)
  for (const c of KTM.cachis){ if (c.pegado){ KTM.giro.remove(c.g); scene.add(c.g); c.g.quaternion.identity(); } c.on = false; c.pegado = false; c.g.visible = false; }
}
const KTM_ESTRELLA = foilSprite(foilLienzo(128, 128, g => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 60); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,240,180,0.9)'); gr.addColorStop(1, 'rgba(255,180,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#ffffff'; g.beginPath(); for (let i = 0; i < 8; i++){ const a = i / 8 * TAU, r = i % 2 ? 10 : 62; g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); } g.closePath(); g.fill(); }), true);
// una cancioncilla alegre mientras rueda (cada compás, una frase)
function ktmMusica(dt){
  if ((KTM.musT -= dt) > 0) return; KTM.musT = 1.6; const fr = [[72, 76, 79, 76, 74, 72, 74, 79], [72, 76, 79, 81, 79, 76, 74, 72]][KTM.musN++ % 2], e = 0.2;
  fr.forEach((n, i) => { if (i === 5 && KTM.musN % 2) return; tone({ type: 'triangle', f0: NOTE(n), dur: e * 0.8, vol: 0.05, when: i * e, rv: 0.25 }); tone({ type: 'square', f0: NOTE(n + 12), dur: e * 0.3, vol: 0.012, when: i * e, rv: 0.2 }); });
  [[0, 48], [2, 55], [4, 53], [6, 55]].forEach(([t, n]) => tone({ type: 'sine', f0: NOTE(n), dur: e * 1.6, vol: 0.09, when: t * e, rv: 0.1 }));
}
Object.assign(SFX, {
  ktmEmpieza: () => { [72, 76, 79, 84].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.14, vol: 0.07, when: i * 0.07, rv: 0.3 })); },
  ktmPlop: () => tone({ type: 'sine', f0: 420, f1: 180, dur: 0.08, vol: 0.06 }),
  ktmPega: () => { const f = 500 + Math.min(900, KTM.Rv * 300); tone({ type: 'square', f0: f, f1: f * 1.6, dur: 0.07, vol: 0.05 }); tone({ type: 'triangle', f0: f * 2, dur: 0.06, vol: 0.04, when: 0.05 }); },
  ktmBonk: () => { tone({ type: 'sine', f0: 160, f1: 70, dur: 0.15, vol: 0.25 }); noise({ dur: 0.08, vol: 0.12, f0: 900, type: 'lowpass' }); },
  ktmRueda: () => { noise({ dur: 0.3, vol: 0.18, f0: 300, f1: 900, type: 'lowpass', rv: 0.1 }); tone({ type: 'sine', f0: 90, f1: 140, dur: 0.3, vol: 0.2 }); },
  ktmCielo: () => { [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.5, vol: 0.05, attack: 0.05, when: i * 0.1, rv: 0.8 })); },
  ktmDespega: () => { noise({ dur: 0.6, vol: 0.25, f0: 400, f1: 3000, type: 'bandpass', rv: 0.5 }); tone({ type: 'sine', f0: 80, f1: 300, dur: 0.6, vol: 0.3, rv: 0.4 }); },
  ktmEstrella: () => { [88, 91, 96].forEach((n, i) => tone({ type: 'sine', f0: NOTE(n), dur: 0.5, vol: 0.05, when: i * 0.08, rv: 0.9 })); }
});
foilPoder({ id: 'foilKatamari', ic: '🌈', name: 'Bola cósmica', tags: ['otaku'],
  desc: 'Al empezar cada oleada llueven cachivaches y empujas una bola pegajosa durante 16 s: lo que es más pequeño que ella (cachivaches y enemigos) se queda pegado y la bola crece; lo grande rebota. Atacar es una embestida. Al final, un arcoíris se la lleva al cielo y la convierte en estrella.',
  coge(){ KTM.pend = true; }, oleada(){ KTM.pend = true; }, tick(dt, j){ ktmVigila(dt, j); }, reset(){ KTM.pend = false; } });

/* ======================================================================
   BURRO DE HORMIGÓN (wrm)
   ====================================================================== */
const WRM = { g: null, luz: null, golpes: 0, B: null };
const WRM_GOLPES = 40, WRM_BOTES = 4;
const WRM_LUZ_FS = 'uniform float uA; uniform float uT; varying vec2 vU; void main(){ float f = 0.55 + 0.45 * sin(vU.x * 56.5 + uT * 1.5) * sin(vU.x * 25.1 - uT); float k = pow(sin(3.1416 * vU.y), 0.6); gl_FragColor = vec4(vec3(1.0, 0.93, 0.7) * f * k * uA * 0.6, 1.0); }';
function wrmConstruye(){
  if (WRM.g) return;
  const piedra = makeMat(0x9c988f, { emissive: 0.14 }), oscura = makeMat(0x5c5852, { emissive: 0.06 }), src = new THREE.Group(), g = new THREE.Group();
  const M_ = (w, h, d, x, y, z, rx, m_) => { const o = mesh(B(w, h, d), m_ || piedra, x, y, z, src); if (rx) o.rotation.x = rx; return o; };
  M_(1.15, 0.95, 2.0, 0, 1.6, 0); M_(1.0, 0.3, 1.7, 0, 1.08, 0);                     // lomo y barriga
  M_(0.52, 1.0, 0.55, 0, 2.25, 0.9, -0.5); M_(0.14, 0.3, 0.9, 0, 2.6, 0.78, -0.5, oscura);   // cuello y crin
  M_(0.58, 0.58, 1.0, 0, 2.7, 1.35, 0.35); M_(0.48, 0.42, 0.38, 0, 2.43, 1.8, 0.35);     // cabeza y hocico
  for (const s of [-1, 1]){ const o = M_(0.14, 0.66, 0.24, 0.2 * s, 3.2, 1.08); o.rotation.set(-0.35, 0, 0.28 * s);   // orejas
    M_(0.08, 0.08, 0.04, 0.29 * s, 2.82, 1.62, 0, oscura); M_(0.06, 0.06, 0.04, 0.1 * s, 2.36, 2.0, 0, oscura);     // ojos y narinas
    for (const z of [-0.7, 0.7]){ M_(0.3, 1.15, 0.32, 0.36 * s, 0.6, z); M_(0.34, 0.16, 0.36, 0.36 * s, 0.08, z, 0, oscura); } }   // patas y cascos
  M_(0.12, 0.75, 0.12, 0, 1.55, -1.12, 0.45); M_(0.2, 0.22, 0.2, 0, 1.18, -1.3, 0, oscura);   // cola
  for (const [x, y, z, rz] of [[0.58, 1.7, 0.3, 0.6], [-0.58, 1.5, -0.4, -0.4], [0.3, 2.08, -0.5, 0]]) { const o = M_(0.02, 0.3, 0.5, x, y, z, 0, oscura); o.rotation.z = rz; }   // grietas
  src.scale.setScalar(1.3); mpFusiona(src, g); g.visible = false; scene.add(g); WRM.g = g;
  WRM.luz = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 3.2, 44, 20, 1, true), new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: WRM_LUZ_FS, uniforms: { uA: { value: 0 }, uT: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  WRM.luz.visible = false; WRM.luz.frustumCulled = false; scene.add(WRM.luz);
}
function wrmVigila(dt, jugando){
  if (!jugando || WRM.B || WRM.golpes < WRM_GOLPES || player.dead || !foilPuede() || !foilEscenario()) return;
  const e = xtrGrupo(hero.position, 13); if (!e) return;
  WRM.golpes = 0; wrmLanza(e);
}
function wrmLanza(e){
  wrmConstruye(); const B_ = { t: 0, x: e.g.position.x, z: e.g.position.z, fase: 'luz', bote: 0, f: rnd() * TAU, a: null, b: null, hop: 0, tr: 0 };
  WRM.B = B_; WRM.luz.position.set(B_.x, 22, B_.z); WRM.luz.visible = true; WRM.luz.material.uniforms.uA.value = 0; play('wrmCoro');
  foilFx.push({ t: 0, upd(dt){ return wrmTick(B_, dt); }, fin(){ wrmFuera(B_); } });
}
function wrmTick(B_, dt){
  if (WRM.B !== B_) return false;
  B_.t += dt; const t = B_.t, g = WRM.g, U = WRM.luz.material.uniforms; U.uT.value += dt;
  const dc = Math.hypot(camera.position.x - B_.x, camera.position.z - B_.z);   // con la cámara dentro del haz, casi no se ve (si no, lavaba la pantalla)
  U.uA.value = (t < 1.3 ? Math.min(1, t / 0.5) : Math.max(0, 1 - (t - 1.3) / 0.8)) * clamp((dc - 3.5) / 4, 0.12, 1); WRM.luz.visible = U.uA.value > 0.005;
  if (t < 1.3 && dt > 0) for (let i = 0; i < 2; i++){ const a = rnd() * TAU, r = rnd() * 3; pn(B_.x + Math.cos(a) * r, 6 + rnd() * 8, B_.z + Math.sin(a) * r, 0, -4, 0, rnd() < 0.5 ? 0xfff2b0 : 0xffffff, 0.1, 1.2, 0, 0, 0.5, SH7.star, 0.9); }
  if (B_.fase === 'luz' && t >= 0.85){ B_.fase = 'cae'; g.visible = true; g.scale.setScalar(1); g.position.set(B_.x, 40, B_.z); g.rotation.set(0, B_.f, 0); play('wrmSilba'); }
  if (B_.fase === 'cae'){ const u = clamp((t - 0.85) / 0.45, 0, 1); g.position.y = 40 * (1 - u * u); if (u >= 1){ wrmPisa(true); B_.bote = 1; wrmSiguiente(B_); } }
  else if (B_.fase === 'bota'){ B_.hop += dt; const u = clamp(B_.hop / 0.78, 0, 1);
    g.position.set(lerp(B_.a.x, B_.b.x, u), 5.4 * 4 * u * (1 - u), lerp(B_.a.z, B_.b.z, u)); g.rotation.x = Math.sin(u * TAU) * 0.18;
    if (u >= 1){ g.rotation.x = 0; wrmPisa(false); if (++B_.bote > WRM_BOTES){ B_.fase = 'rompe'; B_.tr = 0; } else wrmSiguiente(B_); } }
  else if (B_.fase === 'rompe'){ B_.tr += dt; g.position.x = B_.b.x + Math.sin(time * 70) * 0.06; if (B_.tr > 0.5){ wrmDesmorona(); return false; } }
  return true;
}
// el siguiente bote: hacia el grupo más cercano (como mucho 4,5 m) o recto
function wrmSiguiente(B_){
  const g = WRM.g, a = new V3(g.position.x, 0, g.position.z), e = xtrGrupo(a, 9), d = new V3();
  if (e) d.set(e.g.position.x - a.x, 0, e.g.position.z - a.z); if (d.length() < 1) d.set(Math.sin(B_.f), 0, Math.cos(B_.f)).multiplyScalar(3.5); if (d.length() > 4.5) d.setLength(4.5);
  B_.a = a; B_.b = clampArena(a.clone().add(d), ARENA - 1); B_.hop = 0; B_.fase = 'bota'; B_.f = Math.atan2(B_.b.x - a.x, B_.b.z - a.z) || B_.f; g.rotation.y = B_.f;
}
function wrmPisa(primero){
  const g = WRM.g, x = g.position.x, z = g.position.z, R = primero ? 4.6 : 3.8; g.position.y = 0;
  xtrArea({ x, z }, R, () => rdmg(primero ? 85 : 55), primero ? 10 : 8, null, 1.6);
  titCrater(x, z, primero ? 2.6 : 2); ringFx(x, z, 0xf0e4c8, 0.5, R + 1.5, 0.45); ringFx(x, z, 0xffffff, 0.3, R, 0.3, 0.3);
  ring7(PN7, x, 0.2, z, 22, [0xc8bca8, 0x9a907e, 0xe8e0d0], 6, 0.6, 0.8, 1, 2.5, 2.5, SH7.dot);
  for (let i = 0; i < 12; i++){ const a = rnd() * TAU, v = 2 + rnd() * 4; spawnFx(x + Math.cos(a) * 1.2, 0.3, z + Math.sin(a) * 1.2, Math.cos(a) * v, 4 + rnd() * 4, Math.sin(a) * v, rnd() < 0.5 ? 0x8a8478 : 0xa8a294, 0.14 + rnd() * 0.1, 0.9, 16, 0); }
  shake = Math.max(shake, primero ? 0.95 : 0.55); hitStop = Math.max(hitStop, primero ? 0.1 : 0.05); lightFlash(x, 1, z, 0xffe8c0, primero ? 3 : 2, 12); if (primero) flash('#fff4d8', 0.35);
  play(primero ? 'wrmPisaGorda' : 'wrmPisa');
}
function wrmDesmorona(){
  const g = WRM.g, x = g.position.x, z = g.position.z; g.visible = false;
  for (let i = 0; i < 34; i++){ const a = rnd() * TAU, v = 1 + rnd() * 3.5; spawnFx(x + Math.cos(a) * 0.8, 0.5 + rnd() * 3.5, z + Math.sin(a) * 0.8, Math.cos(a) * v, 1 + rnd() * 4, Math.sin(a) * v, rnd() < 0.5 ? 0x9c988f : 0x7a766e, 0.16 + rnd() * 0.16, 1, 16, 0); }
  puffAt(x, z, 10, 2.2, 0xc8c0b0); play('wrmRompe');
}
function wrmFuera(B_){ if (WRM.B === B_) WRM.B = null; if (WRM.g) WRM.g.visible = false; if (WRM.luz) WRM.luz.visible = false; }
Object.assign(SFX, {
  // el coro celestial: «Aaaah» en La mayor, dos voces por nota un pelín desafinadas
  wrmCoro: () => { [57, 61, 64, 69, 73].forEach((n, i) => { for (const d of [-0.07, 0.07]) tone({ type: i < 2 ? 'triangle' : 'sine', f0: NOTE(n + d), dur: 2.2, vol: 0.045, attack: 0.45, rv: 0.9 }); });
    [76, 81].forEach((n, i) => tone({ type: 'sine', f0: NOTE(n), dur: 1.2, vol: 0.03, attack: 0.3, when: 0.5 + i * 0.3, rv: 0.9 })); },
  wrmSilba: () => { tone({ type: 'sine', f0: 1800, f1: 300, dur: 0.45, vol: 0.08, rv: 0.2 }); noise({ dur: 0.45, vol: 0.12, f0: 3000, f1: 600, type: 'bandpass', rv: 0.2 }); },
  wrmPisaGorda: () => { tone({ type: 'sine', f0: 70, f1: 24, dur: 1.1, vol: 0.9, rv: 0.6 }); noise({ dur: 0.9, vol: 0.5, f0: 700, f1: 80, type: 'lowpass', rv: 0.6 }); tone({ type: 'square', f0: 110, f1: 40, dur: 0.3, vol: 0.12 }); },
  wrmPisa: () => { tone({ type: 'sine', f0: 85, f1: 30, dur: 0.6, vol: 0.6, rv: 0.4 }); noise({ dur: 0.5, vol: 0.35, f0: 600, f1: 90, type: 'lowpass', rv: 0.4 }); },
  wrmRompe: () => { noise({ dur: 1.2, vol: 0.3, f0: 900, f1: 120, type: 'lowpass', rv: 0.5 }); for (let i = 0; i < 6; i++) tone({ type: 'square', f0: 140 + Math.random() * 120, f1: 60, dur: 0.08, vol: 0.05, when: i * 0.09 }); }
});
foilPoder({ id: 'foilBurro', ic: '🐴', name: 'Burro de hormigón', tags: ['otaku'],
  desc: 'Cada 40 golpes cuerpo a cuerpo que aciertas, el cielo se abre con un coro celestial sobre el grupo de enemigos más grande y cae un burro de piedra gigante que rebota cuatro veces aplastándolo todo antes de desmoronarse.',
  dano(e, val, o, crit, melee){ if (melee && e.alive) WRM.golpes++; return val; }, tick(dt, j){ wrmVigila(dt, j); }, reset(){ WRM.golpes = 0; } });

/* ======================================================================
   BOLA SMASH (smb)
   ====================================================================== */
const SMB = { bola: null, aura: null, cd: 10, golpes: 0, lleno: false, vel: new V3(), obj: new V3(), objT: 0, vida: 0, huye: 0, F: null, ojos: null, cupula: null, ko: [] };
const SMB_CADA = 20, SMB_ALTO = 4.5, SMB_KO = [0xff3a5a, 0xffc020, 0x3ac8ff, 0x6aff6a, 0xff6aff, 0xffffff];
const SMB_BOLA_VS = 'varying vec3 vP; varying float vR; void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vec3 n = normalize(normalMatrix * normal); vR = 1.0 - abs(dot(n, normalize(-mv.xyz))); gl_Position = projectionMatrix * mv; }';
// la bola: arcoíris que gira, brillo de canto y las dos rayas oscuras del emblema (una vertical y otra horizontal, descentradas)
const SMB_BOLA_FS = `
uniform float uT; uniform float uF; varying vec3 vP; varying float vR;
vec3 hsv(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main(){ vec3 p = normalize(vP);
  vec3 col = mix(hsv(fract(atan(p.y, p.x) / 6.2832 + p.z * 0.35 + uT * 0.6)), vec3(1.0), 0.3 + 0.4 * pow(vR, 2.0));
  float lin = max(1.0 - smoothstep(0.035, 0.07, abs(p.x + 0.2)), 1.0 - smoothstep(0.035, 0.07, abs(p.y + 0.24)));
  col = mix(col, vec3(0.1, 0.05, 0.12), lin * 0.85); col = mix(col, vec3(1.0), uF);
  gl_FragColor = vec4(col * (1.05 + 0.3 * sin(uT * 8.0)), 1.0); }`;
// la cúpula del golpe final (aditiva): canto arcoíris
const SMB_CUP_FS = `
uniform float uA; uniform float uT; varying vec3 vP; varying float vR;
vec3 hsv(float h){ return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main(){ vec3 p = normalize(vP); float r = pow(vR, 2.2);
  gl_FragColor = vec4((mix(hsv(fract(p.y * 1.5 + atan(p.z, p.x) / 6.2832 - uT)), vec3(1.0), 0.45) * r * 1.4 + vec3(1.0) * 0.12) * uA, 1.0); }`;
// la explosión de color al salir despedido: un haz ancho donde revienta y estrecho hacia el centro
const SMB_KO_FS = 'uniform vec3 uC; uniform float uA; varying vec2 vU; void main(){ float k = 1.0 - vU.y; gl_FragColor = vec4(mix(uC, vec3(1.0), 0.35 * k * k) * (0.35 + 0.9 * k) * uA, 1.0); }';
const SMB_AURA = foilSprite(foilLienzo(128, 128, g => { for (let i = 0; i < 6; i++){ const gr = g.createRadialGradient(64, 64, 20, 64, 64, 62), h = i * 60;
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.55, `hsla(${h},100%,65%,0.0)`); gr.addColorStop(0.75, `hsla(${h},100%,65%,0.5)`); gr.addColorStop(1, `hsla(${h},100%,65%,0)`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(64, 64); g.arc(64, 64, 64, i / 6 * TAU, (i + 1) / 6 * TAU); g.closePath(); g.fill(); } }), true);
const SMB_DESTELLO = foilSprite(foilLienzo(128, 128, g => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 60); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.fillStyle = 'rgba(255,255,255,0.95)';
  for (let i = 0; i < 8; i++){ const a = i / 8 * TAU, w = i % 2 ? 0.05 : 0.09, r = i % 2 ? 40 : 62; g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(a - w) * 14, 64 + Math.sin(a - w) * 14); g.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r); g.lineTo(64 + Math.cos(a + w) * 14, 64 + Math.sin(a + w) * 14); g.closePath(); g.fill(); } }), true);
const SMB_OJO = xtrBrillo(255, 250, 210);
function smbConstruye(){
  if (SMB.bola) return;
  SMB.bola = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 2), new THREE.ShaderMaterial({ vertexShader: SMB_BOLA_VS, fragmentShader: SMB_BOLA_FS, uniforms: { uT: { value: 0 }, uF: { value: 0 } } }));
  SMB.bola.visible = false; scene.add(SMB.bola);
  SMB.aura = new THREE.Sprite(SMB_AURA.clone()); SMB.aura.scale.setScalar(1.9); SMB.bola.add(SMB.aura);
  SMB.cupula = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.ShaderMaterial({ vertexShader: SMB_BOLA_VS, fragmentShader: SMB_CUP_FS, uniforms: { uA: { value: 0 }, uT: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  SMB.cupula.visible = false; SMB.cupula.frustumCulled = false; scene.add(SMB.cupula);
  SMB.ojos = [0, 1].map(() => { const o = xtrSprite(SMB_OJO, 0.22); o.material = SMB_OJO.clone(); o.material.depthTest = false; o.renderOrder = 7; return o; });
  const geo = new THREE.CylinderGeometry(0.12, 1.5, 1, 14, 1, true); geo.translate(0, 0.5, 0);
  SMB.ko = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: SMB_KO_FS,
      uniforms: { uC: { value: new THREE.Color() }, uA: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.visible = false; m.frustumCulled = false; scene.add(m); const s = new THREE.Sprite(SMB_DESTELLO.clone()); s.visible = false; s.renderOrder = 6; scene.add(s); return { m, s, on: false }; });
}
// cada 20 s (con enemigos), la bola aparece cerca y revolotea; si tardas, se escapa
function smbVigila(dt, jugando){
  smbAuraTick(dt);
  const B_ = SMB.bola; if (B_ && B_.visible && !jugando && gameState !== 'paused'){ B_.visible = false; SMB.vida = 0; }   // (cartas, cinemáticas…: se va)
  if (!jugando || dt <= 0) return;
  if (!B_ || !B_.visible){
    if (SMB.lleno || !foilEscenario() || foilEnemigos(hero.position, 30).length < 1) return;
    if ((SMB.cd -= dt) > 0) return; smbAparece(); return; }
  const U = B_.material.uniforms; U.uT.value += dt; U.uF.value = Math.max(0, U.uF.value - dt * 5); SMB.aura.material.rotation += dt * 2;
  if (SMB.huye > 0){ SMB.huye += dt; B_.position.y += dt * (4 + SMB.huye * 8); B_.position.x += SMB.vel.x * dt; B_.position.z += SMB.vel.z * dt; if (SMB.huye > 1.4){ B_.visible = false; SMB.cd = SMB_CADA; } return; }
  if ((SMB.vida -= dt) <= 0 || !foilEscenario()){ SMB.huye = 0.01; play('smbHuye'); return; }
  if ((SMB.objT -= dt) <= 0){ SMB.objT = 1.2 + rnd() * 1.2; const a = rnd() * TAU, r = 2.5 + rnd() * 4; clampArena(SMB.obj.set(hero.position.x + Math.cos(a) * r, 0, hero.position.z + Math.sin(a) * r), ARENA - 1.2); }
  const ax = SMB.obj.x - B_.position.x, az = SMB.obj.z - B_.position.z, d = Math.max(0.01, Math.hypot(ax, az));
  SMB.vel.x += ax / d * 6 * dt; SMB.vel.z += az / d * 6 * dt; const v = Math.hypot(SMB.vel.x, SMB.vel.z); if (v > 3.4){ SMB.vel.x *= 3.4 / v; SMB.vel.z *= 3.4 / v; }
  SMB.vel.multiplyScalar(Math.exp(-dt * 0.8));
  B_.position.x += SMB.vel.x * dt; B_.position.z += SMB.vel.z * dt; clampArena(B_.position, ARENA - 0.8); B_.position.y = 1.25 + Math.sin(time * 2.6) * 0.22; B_.rotation.y += dt * 1.2; B_.rotation.x = Math.sin(time * 1.3) * 0.4;
  if (rnd() < 0.5) pn(B_.position.x + (rnd() - 0.5) * 0.8, B_.position.y + (rnd() - 0.5) * 0.8, B_.position.z + (rnd() - 0.5) * 0.8, 0, 0.6, 0, xtrHsv(rnd()), 0.08, 0.5, 0, 0, 0, SH7.star, 1);
}
function smbAparece(){
  smbConstruye(); const B_ = SMB.bola, H = hero.position, a = rnd() * TAU, r = 4.5 + rnd() * 2.5;
  B_.position.copy(clampArena(xtrV.set(H.x + Math.cos(a) * r, 0, H.z + Math.sin(a) * r), ARENA - 1.2)); B_.position.y = 1.25; B_.visible = true; B_.scale.setScalar(1);
  SMB.golpes = 0; SMB.vida = 15; SMB.huye = 0; SMB.objT = 0; SMB.vel.set(0, 0, 0); play('smbAparece');
  ringFx(B_.position.x, B_.position.z, 0xffffff, 0.2, 1.6, 0.4, 1.25);
}
// los golpes de Tovan (en el momento del impacto): si la bola está a tiro, cuenta
function smbGolpe(f){
  const B_ = SMB.bola; if (!B_ || !B_.visible || SMB.huye > 0) return;
  const dx = B_.position.x - hero.position.x, dz = B_.position.z - hero.position.z, d = Math.hypot(dx, dz), dy = B_.position.y - hero.position.y, a = Math.atan2(dx, dz) - f;
  if (d > 2.7 || dy > 2.4 || dy < -0.9 || (d > 1.8 && Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) > 1.4)) return;   // (cerca cuenta siempre: el golpe se gira solo hacia el enemigo más cercano)
  SMB.golpes++; B_.material.uniforms.uF.value = 1; SMB.vida = Math.max(SMB.vida, 4);
  SMB.vel.set(dx / Math.max(d, 0.01) * 7, 0, dz / Math.max(d, 0.01) * 7); SMB.objT = 0.8;
  burst7(PN7, B_.position.x, B_.position.y, B_.position.z, 14, [0xff6a8a, 0xffd04a, 0x6aff8a, 0x6ac8ff, 0xffffff], 5, 0.1, 0.4, 0, 2, 0, SH7.star);
  hitStop = Math.max(hitStop, 0.04);
  if (SMB.golpes >= 3) smbRompe(); else play('smbToque');
}
function smbRompe(){
  const B_ = SMB.bola, p = B_.position; B_.visible = false; SMB.lleno = true; SMB.cd = SMB_CADA;
  burst7(PN7, p.x, p.y, p.z, 50, [0xff3a5a, 0xffc020, 0x3aff6a, 0x3ac8ff, 0xc86aff, 0xffffff], 9, 0.16, 0.7, 4, 1.5, 0, SH7.star); ringFx(p.x, p.z, 0xffffff, 0.3, 4, 0.35, 0.4);
  flash('#ffffff', 0.4); shake = Math.max(shake, 0.4); hitStop = Math.max(hitStop, 0.08); lightFlash(p.x, p.y, p.z, 0xffffff, 3, 10); play('smbRompe');
}
// con la bola rota: Tovan arde en arcoíris y le brillan los ojos hasta que la usa
function smbAuraTick(dt){
  const ver = SMB.lleno && !player.dead && P.body.visible && (gameState === 'play' || gameState === 'paused') && !(SMB.F && SMB.F.t > 1.35);
  if (SMB.ojos) SMB.ojos.forEach((o, i) => { o.visible = ver; if (ver){ P.neck.localToWorld(o.position.set(i ? 0.085 : -0.085, 0.07, 0.21)); o.scale.setScalar(0.2 + Math.sin(time * 24 + i) * 0.04); } });
  if (!ver || dt <= 0) return; const H = hero.position;
  for (let i = 0; i < 3; i++){ const a = rnd() * TAU, r = 0.25 + rnd() * 0.3; pn(H.x + Math.cos(a) * r, H.y + 0.2 + rnd() * 1.2, H.z + Math.sin(a) * r, Math.cos(a) * 0.4, 1.6 + rnd() * 1.4, Math.sin(a) * 0.4, xtrHsv(time * 0.7 + rnd() * 0.3), 0.12 + rnd() * 0.08, 0.5, -0.5, 1, 0.2, SH7.dot, 0.8); }
}
// el golpe final (el siguiente ataque con la bola rota)
function smbFinal(){
  const F = foilForma({ id: 'smb', dur: 2.9, intocable: true, escena: true, soloForma: true, camK: 0.75, tick(dt){ smbTick(dt); }, pose(){ smbPose(); }, fin(m){ smbFin(m); } });
  if (!F) return false;
  SMB.lleno = false; SMB.F = F; F.S = hero.position.clone(); F.S.y = 0; F.f = hero.rotation.y;
  const e = xtrGrupo(F.S, 10); F.O = e ? new V3(e.g.position.x, 0, e.g.position.z) : clampArena(new V3(F.S.x + Math.sin(F.f) * 4, 0, F.S.z + Math.cos(F.f) * 4), ARENA - 0.6);
  if (e) F.f = Math.atan2(F.O.x - F.S.x, F.O.z - F.S.z) || F.f;
  state = 'normal'; attackW = 0; queued = false; comboT = 0; MOV11.vx = MOV11.vz = 0;
  F.rastro = strRastro('ktm', KTM_ARCO, 28, false);
  slowT = Math.max(slowT, 0.5); flash('#ffffff', 0.6); play('smbFinal'); shake = Math.max(shake, 0.3);
  return true;
}
function smbTick(dt){
  const F = SMB.F; if (!F) return; const t = F.t, H = hero.position;
  grounded = true; vy = 0; heading = hero.rotation.y = F.f; MOV11.vx = MOV11.vz = 0; if (state === 'attack' || state === 'charge' || state === 'roll') state = 'normal';
  let y = 0, k = 0;
  if (t < 0.45){ F.camK = 0.72; if (dt > 0) for (let i = 0; i < 4; i++){ const a = rnd() * TAU; pn(F.S.x + Math.cos(a) * 1.6, 0.2 + rnd() * 1.8, F.S.z + Math.sin(a) * 1.6, -Math.cos(a) * 5, 0, -Math.sin(a) * 5, xtrHsv(rnd()), 0.12, 0.3, 0, 0, 0.2, SH7.star, 1); } }
  else if (t < 0.85){ const u = (t - 0.45) / 0.4; y = SMB_ALTO * (1 - (1 - u) * (1 - u)); k = 0.55 * u; F.camK = 1.75; if (!F.sube){ F.sube = true; play('smbSube'); ringFx(F.S.x, F.S.z, 0xffffff, 0.3, 3, 0.35); } }
  else if (t < 1.12){ y = SMB_ALTO + Math.sin((t - 0.85) / 0.27 * Math.PI) * 0.4; k = 0.55 + 0.1 * (t - 0.85) / 0.27; }
  else if (t < 1.32){ const u = (t - 1.12) / 0.2; y = SMB_ALTO * (1 - u * u); k = 0.65 + 0.35 * u; if (!F.cae){ F.cae = true; play('smbCae'); } }
  else { k = 1; if (!F.pum){ F.pum = true; smbImpacto(F); } F.camK = 1.5; }
  H.set(lerp(F.S.x, F.O.x, k), y, lerp(F.S.z, F.O.z, k));
  strRastroPon(F.rastro, H.x, H.y + 0.8, H.z, t >= 0.45 && t < 1.4, 1.1, 1);
  if (F.pum){ const u = clamp((t - 1.32) / 0.5, 0, 1), C_ = SMB.cupula; C_.visible = u < 1; C_.position.set(F.O.x, 0, F.O.z); C_.scale.setScalar(0.5 + 9.5 * (1 - Math.pow(1 - u, 3))); C_.material.uniforms.uA.value = 1 - u * u; C_.material.uniforms.uT.value += dt; }
}
function smbImpacto(F){
  const O = F.O; flash('#ffffff', 0.75); shake = Math.max(shake, 1.1); hitStop = Math.max(hitStop, 0.12); lightFlash(O.x, 2, O.z, 0xffffff, 4, 18); play('smbImpacto');
  ringFx(O.x, O.z, 0xffffff, 0.5, 10, 0.5); ringFx(O.x, O.z, 0xffe080, 0.3, 7, 0.4, 0.3);
  ring7(PN7, O.x, 0.3, O.z, 40, [0xff3a5a, 0xffc020, 0x3aff6a, 0x3ac8ff, 0xc86aff, 0xffffff], 12, 0.2, 0.7, 0, 2, 0, SH7.star, 3);
  for (const e of foilEnemigos(O, 10)){ const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.3, Math.hypot(dx, dz));
    if (strFuerte(e)){ foilGolpea(e, rdmg(130), dx / d, dz / d, 14, null, 2); continue; }
    xtrRemata(e, dx / d, dz / d, 2); if (!e.alive) smbVuela(e, dx / d, dz / d); }
}
// sale despedido girando con estela y revienta lejos en una explosión de color
function smbVuela(e, nx, nz){
  let a = Math.atan2(nx, nz) + (rnd() - 0.5) * 0.5; const f0 = gstFrente(), da = Math.atan2(Math.sin(a - f0), Math.cos(a - f0));
  if (Math.abs(da) > 1.75) a = f0 + Math.sign(da) * (1.2 + rnd() * 0.5);   // hacia la cámara no: de lado o al fondo (si no, reventaban pegados a ella)
  const vh = 20 + rnd() * 8, vy0 = 8 + rnd() * 6, dur = 0.7 + rnd() * 0.4, col = SMB_KO[Math.floor(rnd() * SMB_KO.length)], S = e.g.position.clone(), spin = (rnd() < 0.5 ? -1 : 1) * (14 + rnd() * 10);
  let ko = false;
  strMuerte(e, dur, (q, k, dt) => { if (ko){ q.dying = 0; return; } const t = k * dur; q.g.position.set(S.x + Math.sin(a) * vh * t, S.y + 0.5 + vy0 * t - 4 * t * t, S.z + Math.cos(a) * vh * t); q.g.rotation.x += spin * dt; q.g.rotation.z += spin * 0.6 * dt;
    if (rnd() < 0.8) streak7(q.g.position.x, q.g.position.y + 0.4, q.g.position.z, -Math.sin(a), -0.15, -Math.cos(a), 1.8, 0xffffff, 0.18, 0.07);
    const v = xtrV.copy(q.g.position).project(camera), fuera = v.z > 1 || Math.abs(v.x) > 0.9 || Math.abs(v.y) > 0.88;   // revienta al llegar al borde de la pantalla (o al acabar el vuelo)
    if ((k > 0.2 && fuera) || k >= 0.97){ ko = true; smbKO(q.g.position, a, col); q.g.visible = false; } });
}
function smbKO(p, a, col){
  const K = SMB.ko.find(q => !q.on); if (!K) return; K.on = true; const x = p.x, y = Math.max(1, p.y), z = p.z;
  K.m.position.set(x, y, z); K.m.quaternion.setFromUnitVectors(xtrU.set(0, 1, 0), xtrV.set(-Math.sin(a), 0.12, -Math.cos(a)).normalize()); K.m.material.uniforms.uC.value.setHex(col);
  K.s.position.set(x, y, z); K.s.material.color.setHex(col); K.m.visible = K.s.visible = true;
  const e_ = clamp(xtrV.set(x, y, z).distanceTo(camera.position) / 16, 0.3, 1);   // (más pequeña cuanto más cerca de la cámara)
  shake = Math.max(shake, 0.35); play('smbKO'); lightFlash(x, y, z, col, 2.5, 14);
  foilFx.push({ t: 0, upd(){ const k = this.t / 0.6; K.m.scale.set((0.7 + k * 0.6) * e_, (2 + k * 6) * e_, (0.7 + k * 0.6) * e_); K.m.material.uniforms.uA.value = (1 - k) * 0.85; K.s.scale.setScalar((1.6 + k * 4) * e_); K.s.material.opacity = 1 - k; return k < 1; },
    fin(){ K.on = false; K.m.visible = K.s.visible = false; } });
}
function smbPose(){
  const F = SMB.F; if (!F) return; const t = F.t;
  if (t < 0.45){ const k = Math.min(1, t / 0.12);   // se agacha y carga
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', 0.55, k); bl(A.sh.rotation, 'z', 0.5 * s, k); bl(A.el.rotation, 'x', -0.9, k); } bl(P.spine.rotation, 'x', 0.45, k); }
  else if (t < 1.12){ const k = Math.min(1, (t - 0.45) / 0.1);   // sube con el puño en alto
    bl(P.armL.sh.rotation, 'x', -2.9, k); bl(P.armL.sh.rotation, 'z', -0.1, k); bl(P.armL.el.rotation, 'x', 0, k); bl(P.armR.sh.rotation, 'x', 0.3, k); bl(P.armR.sh.rotation, 'z', 0.25, k); bl(P.spine.rotation, 'x', -0.15, k); }
  else if (t < 1.32){ const k = Math.min(1, (t - 1.12) / 0.06);   // en picado, de cabeza
    for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -2.5, k); bl(A.sh.rotation, 'z', -0.15 * s, k); bl(A.el.rotation, 'x', 0, k); } bl(P.spine.rotation, 'x', 0.7, k); }
  else if (t < 2.05){ const k = Math.min(1, (t - 1.32) / 0.06);   // aterrizaje de superhéroe
    bl(P.armL.sh.rotation, 'x', -0.5, k); bl(P.armL.sh.rotation, 'z', -0.2, k); bl(P.armL.el.rotation, 'x', -0.2, k); bl(P.armR.sh.rotation, 'x', 0.6, k); bl(P.armR.sh.rotation, 'z', 0.6, k); bl(P.spine.rotation, 'x', 0.6, k); }
  else { const k = Math.min(1, (t - 2.05) / 0.15);   // y el puño en alto
    bl(P.armL.sh.rotation, 'x', -2.8, k); bl(P.armL.sh.rotation, 'z', -0.2, k); bl(P.armL.el.rotation, 'x', -0.3, k); bl(P.armR.sh.rotation, 'z', 0.3, k); }
}
function smbFin(){
  const F = SMB.F; SMB.F = null; if (F && F.rastro) strRastroFuera(F.rastro); if (SMB.cupula) SMB.cupula.visible = false;
  if (hero.position.y > 0 && !player.dead) hero.position.y = 0;
}
function smbLimpia(m){
  if (SMB.bola) SMB.bola.visible = false; if (SMB.cupula) SMB.cupula.visible = false; if (SMB.ojos) SMB.ojos.forEach(o => { o.visible = false; });
  SMB.cd = Math.max(SMB.cd, 6); if (m === 'titulo' || m === 'partida'){ SMB.lleno = false; SMB.cd = 10; }
}
// el siguiente ataque con la bola rota es el golpe final
const smb_doAttack = doAttack;
doAttack = function(){
  if (SMB.lleno && lvl('foilSmash') && canAct() && !invActive && foilPuede() && foilEscenario() && !FOILX.forma && state !== 'roll' && state !== 'tech' && !NUCA.m){ try { if (smbFinal()) return; } catch (err) { console.error(err); } }
  smb_doAttack();
};
Object.assign(SFX, {
  smbAparece: () => { [84, 88, 91, 96].forEach((n, i) => tone({ type: 'sine', f0: NOTE(n), dur: 0.3, vol: 0.04, when: i * 0.06, rv: 0.8 })); noise({ dur: 0.5, vol: 0.06, f0: 8000, type: 'highpass', attack: 0.1, rv: 0.6 }); },
  smbToque: () => { tone({ type: 'square', f0: 880, f1: 1320, dur: 0.06, vol: 0.06 }); noise({ dur: 0.08, vol: 0.15, f0: 3000, rv: 0.2 }); tone({ type: 'sine', f0: 200, f1: 90, dur: 0.12, vol: 0.2 }); },
  smbRompe: () => { noise({ dur: 0.5, vol: 0.4, f0: 6000, f1: 2000, type: 'highpass', rv: 0.5 }); [72, 79, 84, 88, 91].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.4, vol: 0.06, when: i * 0.05, rv: 0.7 })); tone({ type: 'sine', f0: 120, f1: 40, dur: 0.5, vol: 0.5 }); },
  smbHuye: () => { tone({ type: 'sine', f0: 900, f1: 2200, dur: 0.6, vol: 0.05, rv: 0.5 }); },
  smbFinal: () => { tone({ type: 'sine', f0: 60, f1: 120, dur: 0.5, vol: 0.5, rv: 0.6 }); noise({ dur: 0.5, vol: 0.3, f0: 200, f1: 6000, type: 'bandpass', attack: 0.3, rv: 0.6 }); [60, 67, 72, 76].forEach(n => tone({ type: 'sawtooth', f0: NOTE(n), dur: 0.6, vol: 0.035, attack: 0.1, rv: 0.6 })); },
  smbSube: () => { noise({ dur: 0.4, vol: 0.3, f0: 500, f1: 4000, type: 'bandpass', rv: 0.4 }); tone({ type: 'square', f0: 200, f1: 900, dur: 0.35, vol: 0.06 }); },
  smbCae: () => { tone({ type: 'sine', f0: 1500, f1: 200, dur: 0.22, vol: 0.12 }); noise({ dur: 0.22, vol: 0.25, f0: 4000, f1: 500, type: 'bandpass', rv: 0.2 }); },
  smbImpacto: () => { tone({ type: 'sine', f0: 80, f1: 20, dur: 1.5, vol: 1, rv: 0.7 }); noise({ dur: 1.2, vol: 0.6, f0: 1500, f1: 80, type: 'lowpass', rv: 0.7 }); noise({ dur: 0.15, vol: 0.5, f0: 6000, type: 'highpass', rv: 0.4 }); tone({ type: 'square', f0: 150, f1: 50, dur: 0.4, vol: 0.15 }); },
  // ¡fuera! un estallido y el público
  smbKO: () => { tone({ type: 'sine', f0: 110, f1: 35, dur: 0.6, vol: 0.5, rv: 0.6 }); noise({ dur: 0.5, vol: 0.35, f0: 2000, f1: 150, type: 'lowpass', rv: 0.6 }); noise({ dur: 1.2, vol: 0.07, f0: 1100, type: 'bandpass', q: 0.5, attack: 0.15, when: 0.1, rv: 0.8 }); }
});
foilPoder({ id: 'foilSmash', ic: '🔆', name: 'Bola Smash', tags: ['otaku'],
  desc: 'Cada 20 s aparece una bola arcoíris que revolotea por la arena y se escapa si tardas. Rómpela de tres golpes y arderás en arcoíris: tu siguiente ataque es el golpe final. Subes como un cohete, caes en picado y una cúpula de luz lanza a todos por los aires hasta que revientan lejos en una explosión de color.',
  golpe(f){ smbGolpe(f); }, remate(f){ smbGolpe(f); }, tick(dt, j){ smbVigila(dt, j); }, reset(){ SMB.lleno = false; SMB.cd = 10; }, limpia(m){ smbLimpia(m); } });

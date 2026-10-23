'use strict';
/* ======================================================================
   PODERES FOIL · JUEGOS (A): cinco clásicos de videojuego
   Se registran con foilPoder (js/poderes/foil-nucleo.js). Cada uno lleva
   su prefijo en todo lo global, su estética y sus sonidos de 8 bits:
     · Estrella invencible (de un fontanero) · str: cada golpe que acierta
       hace saltar una moneda que gira y vuela hacia Tovan (las bajas, 3).
       Con 50, la ESTRELLA (forma de 9 s): parpadea en arcoíris, intocable,
       más rápido, estela de destellos y quien toca sale volando (a los
       jefes, un golpe fuerte), con un arpegio alegre de fondo. Cada 100
       monedas, una vida: un hongo verde sale de Tovan y cura un 25 %.
     · Espada maestra (de un héroe de verde) · msw: al cogerla, Tovan la
       alza sobre la cabeza con su melodía. Con la vida al 95 % o más, cada
       golpe dispara un rayo con forma de espada (10 m). Remate: «Giro
       huracanado», un anillo de 360° y, con la vida llena, 8 rayos más.
     · Inhalar (de una bola rosa) · kby: el remate aspira en un cono de
       viento; se traga hasta 3 enemigos (los jefes solo se arrastran) y
       Tovan se queda hinchado; atacar lleno escupe una estrella enorme que
       gira, atraviesa y estalla (más daño cuantos más se tragó).
     · Comecocos (de un clásico de recreativa) · pac: cada 10 bajas, una
       píldora de poder en el suelo; al pisarla, 8 s de comecocos (forma):
       cuadrícula de neón, los enemigos se asustan (azules y lentos) y te
       los comes (200, 400, 800, 1600; sus ojos huyen); a los jefes, mordiscos.
     · Bola azul (de un erizo rápido) · snc: rodar es un acelerón en bola
       de pinchos; con enemigos a menos de 7 m, ataque teledirigido que
       encadena hasta 5. Cada golpe da un anillo; si te hieren se caen y
       se recogen para curarte un poco (con anillos, el golpe duele menos).
   Lo que comparten (arte en píxeles, estelas, el cuerpo oculto, quién es
   «fuerte») va con el prefijo str. Los modelos se construyen la primera
   vez que hacen falta y se quitan en limpia(); los lienzos se pintan al
   cargar sin rnd() (con mulberry32 donde hace falta azar).
   ====================================================================== */

/* ---------- Compartido: arte en píxeles, estelas, muertes y el cuerpo de Tovan ---------- */
// arte en píxeles: filas de caracteres → lienzo (cada carácter, un color de la paleta; '.' = transparente)
function strPix(arte, pal, k){ return foilLienzo(arte[0].length * k, arte.length * k, g => { arte.forEach((fila, y) => { for (let x = 0; x < fila.length; x++){ const c = pal[fila[x]]; if (c){ g.fillStyle = c; g.fillRect(x * k, y * k, k, k); } } }); }); }
const strNitida = lienzo => { const t = new THREE.CanvasTexture(lienzo); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; return t; };
const strSpriteMat = (lienzo, aditivo) => new THREE.SpriteMaterial({ map: strNitida(lienzo), transparent: true, depthWrite: false, blending: aditivo ? THREE.AdditiveBlending : THREE.NormalBlending });
// jefes, élites, sellos, capitanes y puestos: a esos, daño fuerte y punto (ni se los mata de un toque ni se los traga nadie)
const strFuerte = e => foilJefe(e) || !!e.cap || e.type === 'puesto';
// muerte a medida: tras killEnemy, el cuerpo hace lo que diga fn(e, k, dt) durante dur s y luego se quita
function strMuerte(e, dur, fn){
  if (e.alive || e.onDying || e.type === 'dragon' || e.colFase || e.terFase || e.remove) return false;
  e.dying = dur; let t = 0;
  e.onDying = (q, dt) => { q.dying -= dt; t += dt; try { fn(q, Math.min(1, t / dur), dt); } catch (err) { console.error(err); }
    if (q.dying <= 0){ scene.remove(q.g); if (q.tele) scene.remove(q.tele); q.remove = true; } };
  return true;
}
// estela: una cinta que sigue los últimos puntos por los que ha pasado Tovan
const strRastro = (tipo, cols, n, aditivo) => ({ tipo, cols, n, add: aditivo, h: [], c: null });
function strRastroPon(R, x, y, z, on, ancho, alfa){
  if (on){ const v = R.h.length >= R.n ? R.h.shift() : new V3(); R.h.push(v.set(x, y, z)); } else if (R.h.length) R.h.shift();
  let L = 0; for (let i = 1; i < R.h.length; i++) L += R.h[i].distanceTo(R.h[i - 1]);
  if (R.h.length < 3 || L < 0.1){ if (R.c){ if (R.h.length) R.c.m.visible = false; else { tintaSuelta(R.c); R.c = null; } } return; }
  if (!R.c){ R.c = tintaCoge(R.cols, 0, R.tipo); if (R.add) R.c.mat.blending = THREE.AdditiveBlending; }
  R.c.m.visible = true; const H = R.h, N = H.length - 1;
  tintaPinta(R.c, (s, v) => { const q = s * N, i = Math.min(N - 1, Math.floor(q)); return v.lerpVectors(H[i], H[i + 1], q - i); }, 0, 1, k => ancho * (0.12 + 0.88 * k));
  R.c.mat.uniforms.uAlpha.value = alfa == null ? 1 : alfa;
}
function strRastroFuera(R){ R.h.length = 0; if (R.c){ tintaSuelta(R.c); R.c = null; } }
// el cuerpo de Tovan se oculta mientras es comecocos o bola, y se devuelve tal cual (en las cinemáticas, siempre a la vista)
const STR_CUERPO = { oculto: false };
function strCuerpoVer(){
  const ocultar = (foilEn('pacForma') || !!SNC.m) && gameState !== 'cutscene' && !cs.active && !player.dead;
  if (ocultar !== STR_CUERPO.oculto){ STR_CUERPO.oculto = ocultar; P.body.visible = !ocultar; }
}
function strCuerpoDevuelve(){ if (STR_CUERPO.oculto){ STR_CUERPO.oculto = false; P.body.visible = true; } }
// marcador visible solo jugando (en el título y en las cinemáticas no)
const strEnJuego = () => gameState === 'play' || gameState === 'paused' || gameState === 'upgrade';
// fuera del juego (cinemática, cartas, fin): lo pasajero se recoge, que no se quede congelado en pantalla
const strFuera = () => gameState !== 'play' && gameState !== 'paused';
const strMarcaFuera = id => { const el = document.getElementById('foilM-' + id); if (el) el.hidden = true; };
const strV1 = new V3(), strV2 = new V3(), strCol1 = new THREE.Color(), strCol2 = new THREE.Color();

/* ======================================================================
   1 · ESTRELLA INVENCIBLE (de un fontanero) · prefijo str
   ====================================================================== */
const STR = { mon: 0, pend: 0, monedas: [], arp: 0, arpN: 0, snap: null, hongo: null, hongoT: -1, hongoOk: false, cadena: 0, marca: '',
  rastro: strRastro('str', [0xffffff, 0xffffff, 0xffffff, 0], 18, false) };
const STR_ARCO = [0xff3a3a, 0xff9a22, 0xffe62e, 0x44e04a, 0x34b4ff, 0xb45aff];
const STR_PTS = [100, 200, 400, 500, 800, 1000, 2000, 4000, 5000, 8000];
// la estela de arcoíris: seis franjas que cambian de color, con destellos que corren hacia la cola
TRAZO_FS.str = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 arco(float x){ return clamp(abs(mod(x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
void main(){
  float u = vUV.x, a = abs(vUV.y);
  if (a > 0.96) discard;
  float banda = floor((vUV.y * 0.5 + 0.5) * 6.0) / 6.0;
  vec3 col = arco(banda + floor(uTime * 12.0) / 6.0);
  float brillo = step(0.9, h1(floor(vec2(u * uLen * 5.0 + uTime * 9.0, vUV.y * 3.0 + uSeed))));
  col = mix(col, vec3(1.0), brillo);
  gl_FragColor = vec4(col, uAlpha * smoothstep(0.0, 0.6, u));
}`;
// la moneda (dorada, con su ranura), en píxeles
const strMonedaMat = strSpriteMat(strPix([
  '....OOOO....', '..OOYYYYOO..', '.OYLYYYYYDO.', '.OLYYSLYYDO.', 'OLYYYSLYYYDO', 'OLYYYSLYYYDO', 'OLYYYSLYYYDO', 'OLYYYSLYYYDO',
  'OLYYYSLYYYDO', 'OLYYYSLYYYDO', 'OLYYYSLYYYDO', 'OLYYYSLYYYDO', '.OLYYSLYYDO.', '.OYYYYYYYDO.', '..OODYYDOO..', '....OOOO....'],
  { O: '#6a3200', Y: '#ffc81e', L: '#fff3a0', D: '#d88a00', S: '#a85c00' }, 4), false);
Object.assign(SFX, {
  strPlin: () => { tone({ type: 'square', f0: NOTE(83), dur: 0.06, vol: 0.045, rv: 0.05 }); tone({ type: 'square', f0: NOTE(88), dur: 0.26, vol: 0.045, when: 0.06, rv: 0.15 }); },
  strEstrella: () => { [72, 76, 79, 84, 88, 91, 96].forEach((n, i) => tone({ type: 'square', f0: NOTE(n), dur: 0.09, vol: 0.05, when: i * 0.045, rv: 0.3 })); noise({ dur: 0.5, vol: 0.08, f0: 6000, type: 'highpass', rv: 0.3 }); },
  strArp: () => { const A = STR.arpN++ % 2 ? [74, 77, 81, 86, 81, 77, 74, 81] : [72, 76, 79, 84, 79, 76, 72, 79];
    A.forEach((n, i) => tone({ type: 'square', f0: NOTE(n), dur: 0.07, vol: 0.03, when: i * 0.08, rv: 0.05 }));
    tone({ type: 'triangle', f0: NOTE(A[0] - 24), dur: 0.28, vol: 0.09, rv: 0.05 }); tone({ type: 'triangle', f0: NOTE(A[0] - 17), dur: 0.24, vol: 0.07, when: 0.32, rv: 0.05 }); },
  strPatada: () => { tone({ type: 'square', f0: 330, f1: 990, dur: 0.09, vol: 0.06, rv: 0.05 }); noise({ dur: 0.06, vol: 0.12, f0: 900, type: 'lowpass' }); },
  strHongo: () => { for (let i = 0; i < 6; i++) tone({ type: 'square', f0: NOTE(60 + i * 3), f1: NOTE(64 + i * 3), dur: 0.07, vol: 0.04, when: i * 0.07, rv: 0.1 }); },
  strVida: () => seq_([[76, 0.1], [79, 0.1], [84, 0.1], [88, 0.1], [86, 0.1], [91, 0.3]], 'square', 0.09, 0.05, 0.25)
});

/* ---------- Monedas: saltan del golpe, giran y vuelan hacia Tovan ---------- */
function strMarcador(){
  const el = foilMarcador('strMon', 'strMarca'), txt = STR.mon + '|' + STR.pend; el.hidden = !strEnJuego();
  if (txt === STR.marca) return; STR.marca = txt;
  el.innerHTML = `<i class="strIcono"></i><b>×${String(STR.mon).padStart(2, '0')}</b><u class="${STR.pend ? 'strLista' : ''}"><s style="width:${(STR.mon % 50) * 2}%"></s></u>`;
}
function strMoneda(x, y, z){
  let m = STR.monedas.find(q => !q.vivo);
  if (!m){ if (STR.monedas.length >= 14){ strCobra(1); return; } m = { s: new THREE.Sprite(strMonedaMat) }; m.s.renderOrder = 7; scene.add(m.s); STR.monedas.push(m); }
  const a = rnd() * TAU; Object.assign(m, { vivo: true, t: 0, x, y, z, vx: Math.cos(a) * 1.6, vy: 5 + rnd() * 1.5, vz: Math.sin(a) * 1.6, fase: rnd() * 6 });
  m.s.visible = true; m.s.position.set(x, y, z); m.s.scale.set(0.42, 0.56, 1);
}
function strMonedasTick(dt){
  for (const m of STR.monedas){ if (!m.vivo) continue; m.t += dt;
    if (m.t < 0.4){ m.vy -= 16 * dt; m.x += m.vx * dt; m.y += m.vy * dt; m.z += m.vz * dt; }
    else { const tx = hero.position.x, ty = hero.position.y + 1.1, tz = hero.position.z, k = Math.min(1, dt * (5 + (m.t - 0.4) * 22));
      m.x += (tx - m.x) * k; m.y += (ty - m.y) * k; m.z += (tz - m.z) * k;
      if (Math.hypot(tx - m.x, ty - m.y, tz - m.z) < 0.35 || m.t > 1.6){ m.vivo = false; m.s.visible = false; strCobra(1); pa(m.x, m.y, m.z, 0, 0.6, 0, 0xfff3a0, 0.3, 0.25, 0, 0, 1.6, SH7.star); continue; } }
    m.s.position.set(m.x, m.y, m.z); m.s.scale.set(0.42 * Math.max(0.14, Math.abs(Math.cos(m.t * 13 + m.fase))), 0.56, 1);
  }
}
function strCobra(n){
  if (!lvl('foilEstrella')) return;
  for (let i = 0; i < n; i++){ STR.mon++; if (STR.mon % 50 === 0) STR.pend++; if (STR.mon >= 100){ STR.mon -= 100; strVida(); } }
  play('strPlin'); strMarcador();
}

/* ---------- La estrella: arcoíris, intocable, rápido y atropella ---------- */
function strEstrella(){
  return foilForma({ id: 'strForma', nom: '★ ¡INVENCIBLE! ★', col: '#ffe23a', dur: 9, intocable: true, velK: 1.45, camK: 1.08,
    empieza(){ STR.snap = HERO_MATS.map(m => [m.uniforms.uColor.value.getHex(), m.uniforms.uEmissive.value]); STR.arp = 0; STR.cadena = 0;
      foilRotulo([...'¡INVENCIBLE!'].map(c => `<span>${c}</span>`).join(''), 'strRot', 2.1);
      play('strEstrella'); flash('#fff6c0', 0.45); shake = Math.max(shake, 0.2); const O = hero.position;
      burst7(PA7, O.x, 1, O.z, 30, STR_ARCO, 6, 0.3, 0.7, 0, 1.5, 0.3, SH7.star); gring(O.x, 0.1, O.z, 0xffe23a, 0.4, 3.2, 0.45);
      barkOnce('strEstrella', '¡Brillas de todos los colores! Corre y atropella, que esto dura poco.'); },
    tick(dt){ strEstrellaTick(this, dt); },
    fin(){ strDevuelve(); } });
}
function strPinta(F){
  if (!STR.snap) return;
  const lento = F.dur - F.t < 1.6, paso = Math.floor(F.t / (lento ? 0.14 : 0.05));   // al final parpadea más despacio, como avisando
  HERO_MATS.forEach((m, i) => { const o = STR.snap[i];
    if (lento && paso % 2){ m.uniforms.uColor.value.setHex(o[0]); m.uniforms.uEmissive.value = o[1]; return; }
    m.uniforms.uColor.value.copy(strCol1.setHex(o[0]).lerp(strCol2.setHex(STR_ARCO[(paso + i) % 6]), lento ? 0.45 : 0.7)); m.uniforms.uEmissive.value = Math.max(o[1], 0.5); });
}
function strDevuelve(){ if (!STR.snap) return; HERO_MATS.forEach((m, i) => { m.uniforms.uColor.value.setHex(STR.snap[i][0]); m.uniforms.uEmissive.value = STR.snap[i][1]; }); STR.snap = null; }
function strEstrellaTick(F, dt){
  strPinta(F); const O = hero.position;
  for (let i = 0; i < 2; i++) if (rnd() < dt * 30) pa(O.x + (rnd() - 0.5) * 0.9, O.y + 0.2 + rnd() * 1.5, O.z + (rnd() - 0.5) * 0.9, (rnd() - 0.5), 0.5 + rnd(), (rnd() - 0.5), STR_ARCO[Math.floor(rnd() * 6)], 0.24, 0.55, 0, 1, 0.2, SH7.star);
  STR.arp -= dt; if (STR.arp <= 0){ STR.arp += 0.64; play('strArp'); }
  for (const e of foilEnemigos(O, 0.95)){
    const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.01, Math.hypot(dx, dz));
    if (strFuerte(e)){ const u = F.toques.get(e); if (u != null && time - u < 0.5) continue; F.toques.set(e, time);
      foilGolpea(e, rdmg(38), dx / d, dz / d, 5, null, 1); play('strPatada'); burst7(PA7, e.g.position.x, 1.1, e.g.position.z, 10, STR_ARCO, 4, 0.25, 0.4, 0, 1, 0.3, SH7.star); continue; }
    strVuela(e, dx / d, dz / d);
  }
}
// sale volando dando vueltas (y cuenta puntos, cada vez más)
function strVuela(e, nx, nz){
  const x = e.g.position.x, z = e.g.position.z; killEnemy(e); if (e.alive) return;
  tA.set(x, (e.numY || 1.5) + 0.3, z); spawnNumber(tA, STR_PTS[Math.min(STR_PTS.length - 1, STR.cadena++)], 'react strPts');
  const v = { x: nx * 6, y: 8.5, z: nz * 6, r: (rnd() < 0.5 ? -1 : 1) * 12 };
  strMuerte(e, 1.0, (q, k, dt) => { v.y -= 20 * dt; q.g.position.x += v.x * dt; q.g.position.y += v.y * dt; q.g.position.z += v.z * dt; q.g.rotation.x += v.r * dt; q.g.rotation.z += v.r * 0.4 * dt;
    if (k > 0.75) q.g.scale.setScalar(q.scale * Math.max(0.01, 1 - (k - 0.75) * 4)); });
  play('strPatada'); sparks(x, 1, z, 8, 0xfff3a0, 4); burst7(PA7, x, 1, z, 6, STR_ARCO, 3, 0.25, 0.35, 0, 1, 0.3, SH7.star);
}

/* ---------- La vida: un hongo verde sale de Tovan ---------- */
function strHongoModelo(){
  if (STR.hongo) return STR.hongo;
  const src = new THREE.Group(), verde = makeMat(0x2cc23a, { emissive: 0.4 }), blanco = makeMat(0xffffff, { emissive: 0.55 }), pie = makeMat(0xffe6b8, { emissive: 0.35 }), ojo = makeMat(0x101010, { emissive: 1 });
  const cap = mesh(new THREE.SphereGeometry(0.36, 10, 6, 0, TAU, 0, Math.PI / 2), verde, 0, 0.2, 0, src); cap.scale.set(1, 0.85, 1);
  mesh(C(0.36, 0.33, 0.05, 10), verde, 0, 0.19, 0, src);
  for (const [x, y, z, r] of [[0, 0.5, 0, 0.11], [0.24, 0.33, 0.17, 0.09], [-0.24, 0.33, 0.17, 0.09], [0, 0.36, -0.28, 0.1], [0.28, 0.31, -0.12, 0.07], [-0.28, 0.31, -0.12, 0.07]]) mesh(new THREE.IcosahedronGeometry(r, 0), blanco, x, y, z, src);
  mesh(C(0.17, 0.2, 0.24, 8), pie, 0, 0.08, 0, src);
  for (const s of [-1, 1]) mesh(B(0.045, 0.11, 0.02), ojo, 0.065 * s, 0.1, 0.19, src);
  const g = new THREE.Group(); mpFusiona(src, g); g.visible = false; scene.add(g); STR.hongo = g; return g;
}
function strVida(){ strHongoModelo(); STR.hongoT = 0; STR.hongoOk = false; play('strHongo'); }
function strHongoTick(dt){
  const g = STR.hongo; if (!g || STR.hongoT < 0) return;
  STR.hongoT += dt; const t = STR.hongoT, O = hero.position; g.visible = true;
  const y = O.y + 1.0 + smooth(Math.min(1, t / 0.55)) * 1.6 + (t > 0.55 ? Math.sin((t - 0.55) * 9) * 0.06 : 0), cae = clamp((t - 1.15) / 0.25, 0, 1);
  g.position.set(O.x, lerp(y, O.y + 1.1, cae), O.z); g.scale.setScalar(Math.max(0.01, 1.3 * Math.min(1, t / 0.25) * (1 - cae))); g.rotation.y = camYaw;
  if (t > 0.3 && rnd() < dt * 20) pa(g.position.x + (rnd() - 0.5) * 0.6, g.position.y + rnd() * 0.5, g.position.z + (rnd() - 0.5) * 0.6, 0, 0.8, 0, rnd() < 0.5 ? 0x7dff6a : 0xffffff, 0.2, 0.45, 0, 1, 0.3, SH7.star);
  if (cae >= 1 && !STR.hongoOk){ STR.hongoOk = true; heal(Math.round(player.maxHp * 0.25)); foilGrito('¡1 VIDA!', '#7dff6a'); play('strVida');
    ringFx(O.x, O.z, 0x7dff6a, 0.3, 2.6, 0.45); burst7(PA7, O.x, 1.2, O.z, 18, [0x7dff6a, 0xffffff, 0x2cc23a], 4, 0.25, 0.6, 0, 1, 0.3, SH7.plus); }
  if (t > 1.5){ g.visible = false; STR.hongoT = -1; }
}

foilPoder({ id: 'foilEstrella', ic: '⭐', name: 'Estrella invencible', tags: ['otaku'],
  desc: 'Regalo de un fontanero con bigote: cada golpe que acierta hace saltar una moneda (y cada baja, tres). Con 50, ¡ESTRELLA!: 9 s intocable, más rápido y brillando en arcoíris; a quien toques sale volando (a los jefes, un buen golpe). Cada 100 monedas, una vida: te curas un 25 %.',
  dano(e, val, o, crit, melee){
    if (gameState === 'play' && e.alive && e.spawnT <= 0 && (melee || (o && o.src === 'melee')) && !foilEn('strForma')){
      strMoneda(e.g.position.x, Math.min(2.2, (e.numY || 1.5) * 0.7), e.g.position.z);
      barkOnce('strMonedas', '¡Monedas! Ni idea de por qué salen de los bichos. Junta cincuenta, que dicen que pasa algo brillante.'); }
    return val; },
  mata(e){ if (foilEn('strForma')) return; for (let i = 0; i < 3; i++) strMoneda(e.g.position.x, 1, e.g.position.z); },
  tick(dt, jugando){
    strMarcador();
    if (strFuera()){ for (const m of STR.monedas) if (m.vivo){ m.vivo = false; m.s.visible = false; strCobra(1); } }
    if (!jugando) return;
    strMonedasTick(dt); strHongoTick(dt);
    if (dt > 0) strRastroPon(STR.rastro, hero.position.x, hero.position.y + 0.75, hero.position.z, foilEn('strForma'), 1.15);
    if (STR.pend > 0 && !FOILX.forma && foilPuede() && foilEscenario() && state !== 'roll' && strEstrella()) STR.pend--;
  },
  limpia(){ strDevuelve(); strRastroFuera(STR.rastro); for (const m of STR.monedas){ m.vivo = false; m.s.visible = false; } if (STR.hongo) STR.hongo.visible = false; STR.hongoT = -1;
    strMarcaFuera('strMon'); },
  reset(){ Object.assign(STR, { mon: 0, pend: 0, cadena: 0, marca: '' }); },
  coge(){ STR.marca = ''; strMarcador(); } });

/* ======================================================================
   2 · ESPADA MAESTRA (de un héroe de verde) · prefijo msw
   ====================================================================== */
const MSW = { pres: false, presT: -1, giro: null, rayos: [], item: null, brillo: null, rGeo: null, rMat: null };
// la espada en píxeles (punta arriba): hoja blanca con filo celeste, guarda azul con su joya y empuñadura azul
const MSW_ARTE = ['.....o.....', '....owo....', '...owcwo...', '...owcwo...', '...owcwo...', '...owcwo...', '...owcwo...', '...owcwo...', '...owcwo...', '...owcwo...',
  '...owcwo...', '...owcwo...', '...owcwo...', '...owcwo...', '...owcwo...', '...owcwo...', '...owcwo...', 'o.oowcwoo.o', 'obbbbybbbbo', '.obbpypbbo.',
  '..ooobooo..', '....obo....', '....obo....', '....obo....', '....obo....', '...ooyoo...', '...oyyyo...', '....ooo....'];
const MSW_PAL = { o: '#0e1638', w: '#ffffff', c: '#9fe8ff', b: '#2c5cff', p: '#7a3cff', y: '#ffd23a' };
const mswEspadaLienzo = strPix(MSW_ARTE, MSW_PAL, 3), mswEspadaTex = strNitida(mswEspadaLienzo);
const mswEspadaMat = new THREE.SpriteMaterial({ map: mswEspadaTex, transparent: true, depthWrite: false });
// el resplandor del objeto alzado: rayos dorados y blancos (aditivo, con su propio PRNG)
const mswRayosMat = foilSprite(foilLienzo(128, 128, g => { const R = mulberry32(741);
  for (let k = 0; k < 16; k++){ const a = k / 16 * TAU + (R() - 0.5) * 0.1, w = 0.07 + R() * 0.05, L = 40 + R() * 22;
    g.beginPath(); g.moveTo(64, 64); g.lineTo(64 + Math.cos(a - w) * L, 64 + Math.sin(a - w) * L); g.lineTo(64 + Math.cos(a + w) * L, 64 + Math.sin(a + w) * L); g.closePath();
    g.fillStyle = k % 2 ? 'rgba(255,230,120,0.55)' : 'rgba(255,255,255,0.6)'; g.fill(); }
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 34); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(160,230,255,0.6)'); gr.addColorStop(1, 'rgba(60,140,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }), true);
// el brillo de cada rayo
const mswBrilloMat = foilSprite(foilLienzo(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.35, 'rgba(120,210,255,0.55)'); gr.addColorStop(1, 'rgba(40,90,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), true);
// el anillo del giro: franjas duras de 8 bits (blanco, celeste, azul) con chispas que saltan
TRAZO_FS.msw = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float u = vUV.x, a = abs(vUV.y), q = floor(a * 5.0);
  if (q > 3.5) discard;
  vec3 col = q < 0.5 ? uA : q < 1.5 ? uB : q < 2.5 ? uC : uE;
  float tic = floor(uTime * 18.0), ch = step(0.86, h1(vec2(floor(u * uLen * 3.0) + tic * 3.0, floor(vUV.y * 2.0) + uSeed)));
  col = mix(col, vec3(1.0), ch * 0.85);
  gl_FragColor = vec4(col, uAlpha * smoothstep(0.0, 0.12, u));
}`;
const MSW_COL = [0xffffff, 0xbff4ff, 0x3a8cff, 0x2a3cd8], MSW_COL2 = [0xffffff, 0xffffff, 0x9fe8ff, 0x3a8cff];
Object.assign(SFX, {
  mswTada: () => { [[69, 0], [70, 0.16], [71, 0.32]].forEach(([n, w]) => tone({ type: 'square', f0: NOTE(n), dur: 0.14, vol: 0.06, when: w, rv: 0.2 }));
    tone({ type: 'square', f0: NOTE(72), dur: 1.0, vol: 0.06, when: 0.48, rv: 0.5 }); tone({ type: 'triangle', f0: NOTE(64), dur: 1.0, vol: 0.06, when: 0.48, rv: 0.5 }); tone({ type: 'triangle', f0: NOTE(48), dur: 1.1, vol: 0.1, when: 0.48, rv: 0.4 }); },
  mswPiu: () => { tone({ type: 'square', f0: 1900, f1: 420, dur: 0.14, vol: 0.05, rv: 0.1 }); tone({ type: 'square', f0: 2800, f1: 900, dur: 0.1, vol: 0.03, when: 0.02, rv: 0.1 }); },
  mswCarga: () => { for (let i = 0; i < 8; i++) tone({ type: 'square', f0: NOTE(72 + i * 2), dur: 0.03, vol: 0.035, when: i * 0.018, rv: 0.1 }); },
  mswGiro: () => { noise({ dur: 0.4, vol: 0.22, f0: 900, f1: 3200, q: 1.2, rv: 0.2 }); tone({ type: 'square', f0: 260, f1: 1300, dur: 0.3, vol: 0.06, rv: 0.2 }); },
  mswRompe: () => { tone({ type: 'square', f0: 1200, f1: 2400, dur: 0.06, vol: 0.04 }); noise({ dur: 0.1, vol: 0.08, f0: 5000, type: 'highpass' }); }
});

/* ---------- ¡Has conseguido…!: Tovan alza la espada ---------- */
function mswItem(on){
  if (on && !MSW.item){ MSW.brillo = new THREE.Sprite(mswRayosMat); MSW.brillo.renderOrder = 6; MSW.item = new THREE.Sprite(mswEspadaMat); MSW.item.renderOrder = 7; scene.add(MSW.brillo, MSW.item); }
  if (MSW.item){ MSW.item.visible = MSW.brillo.visible = on; }
}
function mswPresenta(){
  MSW.pres = false; MSW.presT = 0; mswItem(true); foilVel('msw', 0.05);
  play('mswTada'); flash('#ffffff', 0.4); shake = Math.max(shake, 0.12);
  foilRotulo('<div class="mswTri"><i></i><i></i><i></i></div><b>¡Has conseguido la Espada maestra!</b><small>Con la vida casi llena, cada golpe lanza un rayo</small>', 'mswRot', 3.2);
}
function mswPresTick(dt){
  if (MSW.presT < 0) return;
  MSW.presT += dt; const t = MSW.presT;
  if (t > 1.9 || state !== 'normal' || player.dead){ MSW.presT = -1; mswItem(false); foilVel('msw', 1);
    barkOnce('mswEspada', '¡Qué brillo! Mientras tengas la vida casi llena, la espada dispara rayos. O sea: que no te den.'); return; }
  P.neck.getWorldPosition(strV1); const y = strV1.y + 0.95 + Math.sin(t * 3) * 0.04, s = Math.min(1, t / 0.25);
  MSW.item.position.set(strV1.x, y, strV1.z); MSW.item.scale.set(0.5 * s, 1.27 * s, 1);
  MSW.brillo.position.set(strV1.x, y, strV1.z); MSW.brillo.scale.setScalar(2.6 * s * (1 + Math.sin(t * 7) * 0.06)); mswRayosMat.rotation = t * 0.8;
  if (rnd() < dt * 18) pa(strV1.x + (rnd() - 0.5) * 1.2, y + (rnd() - 0.5) * 1.2, strV1.z + (rnd() - 0.5) * 1.2, 0, 0.3, 0, rnd() < 0.5 ? 0xffffff : 0xffe680, 0.25, 0.4, 0, 1, 0.2, SH7.star);
}

/* ---------- Los rayos con forma de espada ---------- */
function mswRayo(f, x, y, z){
  let r = MSW.rayos.find(q => !q.vivo);
  if (!r){ if (MSW.rayos.length >= 12) return;
    if (!MSW.rGeo){ MSW.rGeo = new THREE.PlaneGeometry(0.62, 1.58); MSW.rGeo.rotateX(Math.PI / 2); MSW.rMat = makeMat(0xffffff, { map: mswEspadaTex, emissive: 1, side: THREE.DoubleSide }); }
    r = { g: new THREE.Group() }; r.m = new THREE.Mesh(MSW.rGeo, MSW.rMat); r.b = new THREE.Sprite(mswBrilloMat); r.b.scale.setScalar(1.6); r.b.renderOrder = 6; r.g.add(r.m, r.b); scene.add(r.g); MSW.rayos.push(r); }
  Object.assign(r, { vivo: true, f, x, y, z, d: 0 }); r.g.visible = true; r.g.position.set(x, y, z); r.g.rotation.y = f;
}
function mswRompe(r){
  r.vivo = false; r.g.visible = false; play('mswRompe');
  for (let i = 0; i < 4; i++){ const a = r.f + Math.PI / 4 + i * Math.PI / 2; pa(r.x, r.y, r.z, Math.sin(a) * 5, 0, Math.cos(a) * 5, 0xbff4ff, 0.4, 0.3, 0, 2, 0.5, SH7.dia); }
  gring(r.x, r.y, r.z, 0x8fe0ff, 0.2, 1.1, 0.25);
}
function mswRayosTick(dt){
  if (!MSW.rMat) return;
  MSW.rMat.uniforms.uColor.value.setHex(Math.floor(time * 20) % 2 ? 0xffffff : 0x8fe0ff);
  for (const r of MSW.rayos){ if (!r.vivo) continue;
    const sx = Math.sin(r.f), sz = Math.cos(r.f), paso = 21 * dt; r.x += sx * paso; r.z += sz * paso; r.d += paso; r.g.position.set(r.x, r.y, r.z);
    if (rnd() < 0.6) pa(r.x - sx * 0.7, r.y, r.z - sz * 0.7, 0, 0, 0, rnd() < 0.5 ? 0xffffff : 0x8fe0ff, 0.22, 0.25, 0, 0, 0.2, SH7.sq);
    let pega = null; for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue; if (Math.hypot(e.g.position.x - r.x, e.g.position.z - r.z) < e.r + 0.45){ pega = e; break; } }
    if (pega){ foilGolpea(pega, rdmg(14), sx, sz, 2, null, 1); mswRompe(r); continue; }
    if (r.d >= 10 || Math.hypot(r.x, r.z) > ARENA + 1 || (MP.on && !mpLibre(r.x, r.z, 0.1))) mswRompe(r);
  }
}
function mswDispara(f){ const O = hero.position; mswRayo(f, O.x + Math.sin(f) * 0.8, 1.0, O.z + Math.cos(f) * 0.8); play('mswPiu'); }

/* ---------- Giro huracanado: el remate ---------- */
function mswGiro(f){
  const lleno = player.hp >= player.maxHp - 0.5, O = hero.position.clone(), sg = rnd() < 0.5 ? -1 : 1;
  const c1 = tintaCoge(MSW_COL, 0, 'msw'), c2 = tintaCoge(MSW_COL2, 0, 'msw'); c1.mat.blending = c2.mat.blending = THREE.AdditiveBlending; c1.m.visible = c2.m.visible = false;
  const P = (r, y) => (s, v) => { const a = f + sg * s * TAU * 1.04; return v.set(O.x + Math.sin(a) * r, O.y + y, O.z + Math.cos(a) * r); };
  const P1 = P(2.35, 0.95), P2 = P(1.75, 0.75);
  MSW.giro = { t: 0, sg }; play('mswCarga'); manoDe(strV1); burst7(PA7, strV1.x, strV1.y, strV1.z, 8, [0xffffff, 0x9fe8ff], 2, 0.3, 0.3, 0, 2, 0.2, SH7.star);
  let pegado = false;
  foilFx.push({ t: 0, cintas: [c1, c2], upd(){
      const t = this.t - 0.12; if (t < 0) return true;
      if (!this.ya){ this.ya = true; play('mswGiro'); foilGrito('¡Giro huracanado!', '#bff4ff'); shake = Math.max(shake, 0.25); lightFlash(O.x, 1.2, O.z, 0x6ac8ff, 2, 8); }
      const k = Math.min(1, t / 0.24), fade = Math.max(0, (t - 0.28) / 0.32); if (fade >= 1) return false;
      c1.m.visible = c2.m.visible = true;
      tintaPinta(c1, P1, Math.max(0, k - 0.9 - fade * 0.1), k, q => 0.75 * (0.25 + 0.75 * q)); tintaPinta(c2, P2, Math.max(0, k - 0.8), k * 0.98, q => 0.35 * q);
      c1.mat.uniforms.uAlpha.value = c2.mat.uniforms.uAlpha.value = 1 - fade;
      if (!pegado && k >= 0.6){ pegado = true; const d = rdmg(36);
        for (const e of foilEnemigos(O, 3)){ const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, d, dx / l, dz / l, 5, null, 1.2); }
        gring(O.x, 0.12, O.z, 0x8fe0ff, 0.5, 3.2, 0.35); ring7(PA7, O.x, 0.9, O.z, 24, [0xffffff, 0x9fe8ff, 0x3a8cff], 6, 0.3, 0.4, 0, 2, 0.3, SH7.sq);
        if (lleno){ for (let i = 0; i < 8; i++) mswRayo(f + i * TAU / 8, O.x + Math.sin(f + i * TAU / 8) * 0.9, 1.0, O.z + Math.cos(f + i * TAU / 8) * 0.9); play('mswPiu'); } }
      return true; } });
}
function mswGiroPose(){
  const G = MSW.giro; if (!G) return;
  const k = clamp((G.t - 0.1) / 0.34, 0, 1);
  if (k >= 1 || state === 'roll' || player.dead){ MSW.giro = null; P.body.rotation.y = 0; return; }
  P.body.rotation.y = -G.sg * smooth(k) * TAU;
  bl(P.armR.sh.rotation, 'x', -1.4, 0.8); bl(P.armR.sh.rotation, 'z', 1.2, 0.8); bl(P.armL.sh.rotation, 'z', -1.1, 0.8); bl(P.spine.rotation, 'x', 0.25, 0.6);
}

foilPoder({ id: 'foilEspada', ic: '🗡️', name: 'Espada maestra', tags: ['otaku'],
  desc: 'La sacaste de una piedra en un bosque (era de un héroe vestido de verde). Con la vida casi llena, cada golpe lanza un rayo con forma de espada que vuela 10 m. Remate: «Giro huracanado», un tajo de 360° alrededor de ti; con la vida llena, además, 8 rayos en estrella.',
  golpe(f){ if (player.hp >= player.maxHp * 0.95) mswDispara(f); },
  remate(f){ mswGiro(f); },
  tick(dt, jugando){
    if (strFuera()){ if (MSW.presT >= 0){ MSW.presT = -1; mswItem(false); foilVel('msw', 1); } for (const r of MSW.rayos) if (r.vivo){ r.vivo = false; r.g.visible = false; } }
    if (!jugando) return;
    if (MSW.pres && foilPuede() && state === 'normal' && grounded) mswPresenta();
    mswPresTick(dt); mswRayosTick(dt); if (MSW.giro) MSW.giro.t += dt;
  },
  pose(){
    if (MSW.presT >= 0){ hero.rotation.y = camYaw;   // de cara a la cámara, como en el juego
      for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ A.sh.rotation.set(-2.85, 0, 0.35 * s); A.el.rotation.set(-0.3, 0, 0); }
      P.neck.rotation.x = -0.2; P.spine.rotation.x = -0.06; }
    mswGiroPose();
  },
  limpia(){ MSW.presT = -1; MSW.giro = null; P.body.rotation.y = 0; mswItem(false); foilVel('msw', 1); for (const r of MSW.rayos){ r.vivo = false; r.g.visible = false; } },
  reset(){ MSW.pres = false; },
  coge(){ MSW.pres = true; } });
/* ======================================================================
   3 · INHALAR (de una bola rosa) · prefijo kby
   ====================================================================== */
const KBY = { asp: null, lleno: 0, boca: null, inf: 0, escupeT: 0, marca: '' };
const KBY_VIENTO = [0xfff0f8, 0xff8ac8, 0xff5aa8, 0];
// el viento que aspira: trazos blancos y rosas que corren hacia la boca (hacia la cabeza de la cinta)
TRAZO_FS.kby = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
void main(){
  float u = vUV.x, a = abs(vUV.y);
  float r = fract(u * uLen * 0.8 - uTime * 4.5 + uSeed);
  float trazo = smoothstep(0.0, 0.12, r) * (1.0 - smoothstep(0.4, 0.65, r));
  vec3 col = mix(uB, uA, 1.0 - a);
  gl_FragColor = vec4(col, uAlpha * trazo * (1.0 - smoothstep(0.35, 1.0, a)) * smoothstep(0.0, 0.2, u) * (1.0 - smoothstep(0.9, 1.0, u)));
}`;
// la estrella que escupe: amarilla, gordita, con borde naranja y un brillo
const kbyEstrellaMat = foilSprite(foilLienzo(128, 128, g => {
  const punta = (r1, r2) => { g.beginPath(); for (let i = 0; i < 10; i++){ const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? r2 : r1; g.lineTo(64 + Math.cos(a) * r, 66 + Math.sin(a) * r); } g.closePath(); };
  g.lineJoin = 'round'; punta(54, 27); g.lineWidth = 14; g.strokeStyle = '#ff8a1a'; g.stroke();
  const gr = g.createRadialGradient(56, 54, 4, 64, 66, 56); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.3, '#fff6a0'); gr.addColorStop(1, '#ffc81e');
  punta(50, 25); g.fillStyle = gr; g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffe23a'; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.ellipse(50, 50, 7, 11, -0.5, 0, TAU); g.fill();
  g.fillStyle = '#ff6aa8'; for (const [x, y] of [[40, 74], [88, 74]]){ g.beginPath(); g.ellipse(x, y, 6, 3.5, 0, 0, TAU); g.fill(); } }), false);
// la boca abierta mientras aspira
const kbyBocaMat = foilSprite(foilLienzo(64, 64, g => { g.fillStyle = '#ff9ac8'; g.beginPath(); g.ellipse(32, 32, 27, 24, 0, 0, TAU); g.fill();
  g.fillStyle = '#4a0218'; g.beginPath(); g.ellipse(32, 32, 22, 19, 0, 0, TAU); g.fill(); g.fillStyle = '#ff5a8a'; g.beginPath(); g.ellipse(32, 44, 13, 7, 0, 0, TAU); g.fill(); }), false);
Object.assign(SFX, {
  kbyAspira: () => { noise({ dur: 1.15, vol: 0.2, f0: 450, f1: 2600, q: 0.9, rv: 0.2, attack: 0.15 }); tone({ type: 'sine', f0: 170, f1: 120, dur: 1.0, vol: 0.07, attack: 0.1 }); },
  kbyTrago: () => { tone({ type: 'sine', f0: 900, f1: 240, dur: 0.1, vol: 0.12 }); tone({ type: 'square', f0: 330, f1: 660, dur: 0.06, vol: 0.04, when: 0.08 }); },
  kbyGorjeo: () => { for (let i = 0; i < 5; i++) tone({ type: 'triangle', f0: i % 2 ? 1500 : 1180, f1: i % 2 ? 1300 : 1420, dur: 0.06, vol: 0.06, when: i * 0.055, rv: 0.2 }); },
  kbyPop: () => { tone({ type: 'square', f0: 180, f1: 900, dur: 0.07, vol: 0.08 }); noise({ dur: 0.08, vol: 0.16, f0: 1500, type: 'lowpass' }); },
  kbyEstalla: () => { SFX.boom(); [84, 88, 91, 96].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.15, vol: 0.05, when: 0.05 + i * 0.05, rv: 0.4 })); }
});
function kbyMarcador(){
  const el = foilMarcador('kbyPanza', 'kbyMarca'), txt = String(KBY.lleno); el.hidden = !KBY.lleno || !strEnJuego(); if (txt === KBY.marca) return; KBY.marca = txt;
  el.innerHTML = `<b>¡LLENO!</b>${[0, 1, 2].map(i => `<i class="${i < KBY.lleno ? 'kbyOn' : ''}"></i>`).join('')}`;
}
function kbyBocaPos(v){ P.neck.getWorldPosition(v); const f = KBY.asp ? KBY.asp.f : heading; v.x += Math.sin(f) * 0.4; v.z += Math.cos(f) * 0.4; v.y -= 0.08; return v; }

/* ---------- Aspirar (el remate) ---------- */
function kbyAspira(f){
  if (KBY.asp || !foilEscenario()) return;   // (en los escenarios propios, nada de mover a nadie)
  const cs3 = [0, 1, 2, 3].map(() => { const c = tintaCoge(KBY_VIENTO, 0, 'kby'); c.mat.blending = THREE.AdditiveBlending; return c; });
  KBY.asp = { t: 0, f, cs: cs3, presas: 0, dur: 1.15, jefeT: 0 };
  if (!KBY.boca){ KBY.boca = new THREE.Sprite(kbyBocaMat); KBY.boca.renderOrder = 7; scene.add(KBY.boca); }
  foilVel('kby', 0.12); play('kbyAspira'); foilGrito('¡Aspira!', '#ff9ad0');
}
function kbyAspiraTick(dt){
  const A = KBY.asp; if (!A) return;
  A.t += dt;
  if (A.t >= A.dur || state === 'roll' || player.dead){ kbyAspiraFin(); return; }
  const f = A.f, sx = Math.sin(f), sz = Math.cos(f), O = hero.position, Bc = kbyBocaPos(strV1); heading = f; hero.rotation.y = f;
  const al = Math.min(1, A.t / 0.15) * (A.t > A.dur - 0.2 ? (A.dur - A.t) / 0.2 : 1);
  A.cs.forEach((c, i) => { tintaPinta(c, (s, v) => { const r = (1 - s) * 5.4, ang = i * TAU / 4 + s * 4 - A.t * 7, rad = (1 - s) * (1 - s) * 1.9 + 0.05, lx = Math.cos(ang) * rad;
      return v.set(Bc.x + sx * r + sz * lx, Math.max(0.1, Bc.y + Math.sin(ang) * rad * 0.7 - (1 - s) * 0.45), Bc.z + sz * r - sx * lx); }, 0, 1, k => 0.12 + 0.5 * (1 - k)); c.mat.uniforms.uAlpha.value = al * 0.85; });
  for (let i = 0; i < 3; i++){ const d = 1 + rnd() * 4.4, lat = (rnd() - 0.5) * d * 0.9, x = Bc.x + sx * d + sz * lat, y = Math.max(0.15, Bc.y + (rnd() - 0.4) * d * 0.4 - d * 0.1), z = Bc.z + sz * d - sx * lat;
    const dx = Bc.x - x, dy = Bc.y - y, dz = Bc.z - z, l = Math.max(0.01, Math.hypot(dx, dy, dz));
    if (i) streak7(x, y, z, dx, dy, dz, 0.8, rnd() < 0.5 ? 0xffffff : 0xffb8dc, 0.22, 0.035, 12);
    else pa(x, y, z, dx / l * 8, dy / l * 8, dz / l * 8, rnd() < 0.5 ? 0xff8ac8 : 0xffffff, 0.22, Math.min(0.5, l / 8), 0, 0, 0.2, SH7.star); }
  KBY.boca.visible = true; KBY.boca.position.copy(Bc); KBY.boca.scale.setScalar(0.42 * (1 + Math.sin(A.t * 30) * 0.08));
  const pegaJefes = (A.jefeT += dt) >= 0.3; if (pegaJefes) A.jefeT = 0;
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue;
    const n = enCono(O, e, f, 5.6, 0.9); if (!n) continue;
    const d = Math.hypot(e.g.position.x - O.x, e.g.position.z - O.z);
    if (strFuerte(e)){ const v = 0.9 * dt; e.g.position.x -= n[0] * v; e.g.position.z -= n[1] * v; if (pegaJefes) foilGolpea(e, rdmg(9), -n[0], -n[1], 0.5, null, 1); continue; }
    if (d - e.r < 1.25){ if (A.presas < 3 && kbyTraga(e)) A.presas++; continue; }
    const tira = (2.5 + 7.5 * (1 - Math.min(1, d / 5.6))) * dt; e.g.position.x -= n[0] * tira; e.g.position.z -= n[1] * tira; e.vx = e.vz = 0;
    if (e.state !== 'hurt' || e.t < 0.12){ e.state = 'hurt'; e.t = 0.15; }   // mientras vuela hacia la boca no ataca
    e.g.rotation.z = Math.sin(time * 30 + e.seed) * 0.25; }
}
function kbyTraga(e){
  const x = e.g.position.x, z = e.g.position.z, s0 = e.g.scale.x; killEnemy(e); if (e.alive) return false;
  strMuerte(e, 0.28, (q, k) => { kbyBocaPos(strV2); q.g.position.lerp(strV2, Math.min(1, 0.2 + k)); q.g.scale.setScalar(Math.max(0.01, s0 * (1 - k))); q.g.rotation.y += 0.6; });
  KBY.lleno++; kbyMarcador(); play('kbyTrago'); burst7(PA7, x, 1, z, 8, [0xff8ac8, 0xffffff], 3, 0.2, 0.3, 0, 2, 0.3, SH7.star);
  return true;
}
function kbyAspiraFin(){
  const A = KBY.asp; if (!A) return; KBY.asp = null; for (const c of A.cs) tintaSuelta(c); if (KBY.boca) KBY.boca.visible = false;
  foilVel('kby', KBY.lleno ? 0.82 : 1);
  if (KBY.lleno && !player.dead){ play('kbyGorjeo'); foilGrito(KBY.lleno > 1 ? `¡Lleno! ×${KBY.lleno}` : '¡Lleno!', '#ff9ad0');
    barkOnce('kbyLleno', '¿Te lo has… tragado? Vale. No quiero saber a qué sabe un oni. Ataca para escupirlo.'); }
}

/* ---------- Escupir: una estrella enorme que atraviesa y estalla ---------- */
function kbyEscupe(){
  const n = KBY.lleno; KBY.lleno = 0; kbyMarcador(); foilVel('kby', 1);
  let f = heading; if (inputMag > 0.12) f = inputHeading; else { const e = nearestEnemy(8); if (e) f = angTo(hero.position.x, hero.position.z, e.g.position.x, e.g.position.z); }
  heading = f; hero.rotation.y = f;
  const O = hero.position.clone(), s = new THREE.Sprite(kbyEstrellaMat), ya = new Set(), dmg = rdmg(24 + 16 * n), L = 9, sx = Math.sin(f), sz = Math.cos(f), tam = 1.25 + 0.3 * n;
  s.renderOrder = 7; scene.add(s); KBY.escupeT = 0.3;
  play('kbyPop'); shake = Math.max(shake, 0.15); foilGrito('¡Estrella!', '#ffe23a');
  foilFx.push({ t: 0, upd(){
      const k = Math.min(1, this.t / 0.55), d = 0.8 + L * k, x = O.x + sx * d, z = O.z + sz * d, y = 1.0 + Math.sin(k * Math.PI) * 0.3;
      s.position.set(x, y, z); s.scale.setScalar(tam * Math.min(1, this.t / 0.08)); kbyEstrellaMat.rotation = -this.t * 14;
      if (rnd() < 0.8) pa(x - sx * 0.5, y + (rnd() - 0.5) * 0.4, z - sz * 0.5, (rnd() - 0.5), (rnd() - 0.5), (rnd() - 0.5), rnd() < 0.6 ? 0xffe23a : 0xff8ac8, 0.3, 0.45, 0, 1, 0.2, SH7.star);
      for (const e of enemies){ if (ya.has(e) || !e.alive || e.spawnT > 0) continue; if (Math.hypot(e.g.position.x - x, e.g.position.z - z) < e.r + 0.6 + 0.12 * n) foilGolpea(e, dmg, sx, sz, 5, null, 1.2, ya); }
      const choca = MP.on && !mpLibre(x, z, 0.2);
      if (k >= 1 || choca){ const R = 2.3 + 0.3 * n, de = rdmg(14 + 10 * n);
        for (const e of foilEnemigos(s.position, R)){ const dx = e.g.position.x - x, dz = e.g.position.z - z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, de, dx / l, dz / l, 6, null, 1.2); }
        ringFx(x, z, 0xffe23a, 0.4, R + 0.6, 0.4); gring(x, 0.15, z, 0xff8ac8, 0.3, R, 0.35); burst7(PA7, x, y, z, 28, [0xffe23a, 0xffffff, 0xff8ac8], 7, 0.35, 0.6, 0, 1.5, 0.3, SH7.star);
        lightFlash(x, 1.5, z, 0xffd060, 2, 8); shake = Math.max(shake, 0.3); play('kbyEstalla'); return false; }
      return true; },
    fin(){ scene.remove(s); } });
}
// atacar lleno escupe; mientras aspira no se ataca (los dos, antes que el ataque normal)
const kbyAtaqueOrig = doAttack;
doAttack = function(){
  if (lvl('foilKirby') && canAct() && !invActive && foilPuede()){
    if (KBY.asp) return;
    if (KBY.lleno > 0 && foilEscenario() && state !== 'roll' && state !== 'tech' && state !== 'attack' && !(FOILX.forma && FOILX.forma.ataque)){ kbyEscupe(); return; } }
  kbyAtaqueOrig();
};

foilPoder({ id: 'foilKirby', ic: '🌸', name: 'Inhalar', tags: ['otaku'],
  desc: 'Lo aprendiste de una bola rosa con mucho apetito. Remate: aspiras con un cono de viento y te tragas hasta tres enemigos cercanos (a los jefes solo los arrastras y los mareas). Lleno, el siguiente ataque escupe una estrella enorme que atraviesa y estalla: cuantos más te tragaste, más daño.',
  remate(f){ kbyAspira(f); },
  tick(dt, jugando){ kbyMarcador(); if (strFuera() && KBY.asp) kbyAspiraFin(); if (jugando) kbyAspiraTick(dt); if (KBY.escupeT > 0) KBY.escupeT -= dt; },
  pose(){
    if (KBY.asp){ bl(P.spine.rotation, 'x', -0.3, 0.7); bl(P.neck.rotation, 'x', -0.3, 0.7); for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'z', 1.05 * s, 0.7); bl(A.sh.rotation, 'x', 0.35, 0.7); } }
    else if (KBY.escupeT > 0){ bl(P.spine.rotation, 'x', 0.35, 0.8); bl(P.neck.rotation, 'x', 0.25, 0.8); }
  },
  post(){   // hinchado: el torso (y la cabeza) se redondean, con un bamboleo
    const obj = KBY.lleno ? 1 : 0; KBY.inf += (obj - KBY.inf) * 0.2;
    if (!obj && KBY.inf < 0.004){ if (KBY.inf){ KBY.inf = 0; P.spine.scale.set(1, 1, 1); } return; }
    const w = KBY.inf, b = Math.sin(time * 9) * 0.03 * w; P.spine.scale.set(1 + 0.5 * w + b, 1 + 0.2 * w - b, 1 + 0.5 * w + b);
  },
  limpia(){ kbyAspiraFin(); KBY.lleno = 0; KBY.inf = 0; KBY.escupeT = 0; P.spine.scale.set(1, 1, 1); foilVel('kby', 1); strMarcaFuera('kbyPanza'); },
  reset(){ KBY.lleno = 0; KBY.marca = ''; } });

/* ======================================================================
   4 · COMECOCOS (de un clásico de recreativa) · prefijo pac
   ====================================================================== */
const PAC = { bajas: 0, hay: false, pild: null, pildT: 0, disco: null, top: null, bot: null, rejilla: null, rejT: 0, fant: [], ojos: [], puntos: 0, waka: 0, wakaN: 0, boca: 0, lunge: 0, lungeCd: 0, muerde: new Map(), marca: '' };
const PAC_AZUL = new THREE.Color(0x2121ff), PAC_BLANCO = new THREE.Color(0xf4f4ff), pacP1 = new V3(), pacP2 = new V3();
const PAC_FANT = ['.....XXXX.....', '...XXXXXXXX...', '..XXXXXXXXXX..', '.XXXXXXXXXXXX.', '.XXXWWXXWWXXX.', '.XXXWWXXWWXXX.', 'XXXXXXXXXXXXXX',
  'XXXXXXXXXXXXXX', 'XXXXXXXXXXXXXX', 'XXWWXXWWXXWWXX', 'XWXXWWXXWWXXWX', 'XXXXXXXXXXXXXX', 'XX.XXX..XXX.XX', 'X...XX..XX...X'];
const pacFantMat = strSpriteMat(strPix(PAC_FANT, { X: '#2121ff', W: '#ffb8ae' }, 4)), pacFantMat2 = strSpriteMat(strPix(PAC_FANT, { X: '#f4f4ff', W: '#ff2020' }, 4));
const pacOjosMat = strSpriteMat(strPix(['..WW.....WW...', '.WWWW...WWWW..', '.BBWW...BBWW..', '.BBWW...BBWW..', '..WW.....WW...'], { W: '#ffffff', B: '#2121ff' }, 4));
const pacBrilloMat = foilSprite(foilLienzo(64, 64, g => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,230,1)'); gr.addColorStop(0.3, 'rgba(255,232,120,0.7)'); gr.addColorStop(1, 'rgba(255,200,40,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), true);
// la cuadrícula de neón: doble línea azul en el borde de cada celda y puntitos (los que tiene encima Tovan ya se los ha comido)
const PAC_REJ_VS = 'varying vec2 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }';
const PAC_REJ_FS = `
uniform vec2 uCen; uniform float uTime; uniform float uR; uniform float uAlpha; varying vec2 vW;
float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main(){
  float d = length(vW - uCen), fade = 1.0 - smoothstep(uR * 0.55, uR, d);
  if (fade <= 0.001) discard;
  vec2 g = vW / 1.6, f = fract(g), c = floor(g), e = min(f, 1.0 - f);
  float m = min(e.x, e.y), linea = 1.0 - smoothstep(0.03, 0.06, abs(m - 0.08));
  float punto = (h1(c) > 0.35 && length((c + 0.5) * 1.6 - uCen) > 0.9) ? 1.0 - smoothstep(0.07, 0.11, length(f - 0.5)) : 0.0;
  float pulso = 0.75 + 0.25 * sin(uTime * 6.0 - d * 1.5);
  vec3 col = vec3(0.16, 0.2, 1.0) * linea * pulso * 1.8 + vec3(1.0, 0.75, 0.68) * punto;
  float a = uAlpha * fade * max(linea, punto); if (a < 0.01) discard;
  gl_FragColor = vec4(col, a);
}`;
Object.assign(SFX, {
  pacWa: () => tone({ type: 'triangle', f0: 520, f1: 260, dur: 0.1, vol: 0.09, rv: 0 }),
  pacKa: () => tone({ type: 'triangle', f0: 260, f1: 540, dur: 0.1, vol: 0.09, rv: 0 }),
  pacPildora: () => { for (let i = 0; i < 4; i++) tone({ type: 'square', f0: 300, f1: 760, dur: 0.12, vol: 0.04, when: i * 0.13, rv: 0.1 }); },
  pacLatido: () => tone({ type: 'sine', f0: 240, f1: 360, dur: 0.14, vol: 0.04 }),
  pacPoder: () => { for (let i = 0; i < 6; i++) tone({ type: 'square', f0: i % 2 ? 900 : 300, f1: i % 2 ? 300 : 900, dur: 0.14, vol: 0.045, when: i * 0.14, rv: 0.1 }); },
  pacCome: () => { tone({ type: 'square', f0: 120, f1: 1400, dur: 0.3, vol: 0.06, rv: 0.1 }); tone({ type: 'triangle', f0: 240, f1: 2400, dur: 0.3, vol: 0.05 }); },
  pacMuerde: () => { tone({ type: 'square', f0: 700, f1: 150, dur: 0.08, vol: 0.07 }); noise({ dur: 0.06, vol: 0.12, f0: 1200, type: 'lowpass' }); },
  pacOjos: () => { for (let i = 0; i < 6; i++) tone({ type: 'square', f0: 1200, f1: 2000, dur: 0.05, vol: 0.025, when: i * 0.06 }); },
  pacFin: () => { for (let i = 0; i < 4; i++) tone({ type: 'square', f0: 700 - i * 120, f1: 500 - i * 100, dur: 0.1, vol: 0.04, when: i * 0.09 }); }
});
function pacMarcador(){
  const el = foilMarcador('pacPuntos', 'pacMarca'), txt = PAC.bajas + '|' + PAC.hay; el.hidden = !strEnJuego(); if (txt === PAC.marca) return; PAC.marca = txt;
  el.innerHTML = '<i class="pacCoco"></i>' + Array.from({ length: 10 }, (_, i) => `<s class="${i < PAC.bajas ? 'pacComido' : ''}"></s>`).join('') + `<u class="${PAC.hay ? 'pacHay' : ''}"></u>`;
}

/* ---------- La píldora de poder ---------- */
function pacPildora(){
  if (!PAC.pild){ const g = new THREE.Group(); mesh(new THREE.IcosahedronGeometry(0.36, 1), makeMat(0xffe86a, { emissive: 1 }), 0, 0, 0, g);
    const b = new THREE.Sprite(pacBrilloMat); b.scale.setScalar(2.2); b.renderOrder = 6; g.add(b); g.userData.b = b; scene.add(g); PAC.pild = g; }
  let v;
  if (MP.on) v = mpSitio(3, 5, 0.6);
  else { v = new V3(); for (let i = 0; i < 12; i++){ const a = rnd() * TAU, d = 2.6 + rnd() * 1.6; v.set(hero.position.x + Math.sin(a) * d, 0, hero.position.z + Math.cos(a) * d); if (Math.hypot(v.x, v.z) < ARENA - 0.9) break; } clampArena(v, ARENA - 0.9); }
  PAC.pild.position.set(v.x, 0.45, v.z); PAC.pild.visible = true; PAC.hay = true; PAC.pildT = 0; pacMarcador();
  play('pacPildora'); gring(v.x, 0.08, v.z, 0xffe800, 0.2, 1.6, 0.4); burst7(PA7, v.x, 0.5, v.z, 12, [0xffe800, 0xffffff], 3, 0.25, 0.4, 0, 1, 0.3, SH7.dot);
  barkOnce('pacPildora', 'Ha salido una bola brillante en el suelo… ¿Una píldora de poder? Písala y verás quién persigue a quién.');
}
function pacPildoraTick(dt){
  if (!PAC.hay || !PAC.pild) return;
  PAC.pildT += dt; const g = PAC.pild, t = PAC.pildT;
  g.scale.setScalar(1 + 0.22 * Math.sin(t * 8)); g.position.y = 0.45 + Math.sin(t * 3) * 0.06; g.userData.b.visible = Math.floor(t * 5) % 2 === 0;
  if (Math.floor(t / 0.8) !== Math.floor((t - dt) / 0.8)){ gring(g.position.x, 0.08, g.position.z, 0xffe800, 0.3, 1.3, 0.5); play('pacLatido'); }
  if (Math.hypot(g.position.x - hero.position.x, g.position.z - hero.position.z) < 0.95 && hero.position.y < 1.2 && !FOILX.forma && foilPuede() && pacEmpieza()){
    PAC.hay = false; g.visible = false; pacMarcador(); }
}

/* ---------- La forma: comecocos ---------- */
function pacModelo(){
  if (PAC.disco) return;
  const D = new THREE.Group(), gira = new THREE.Group(), am = makeMat(0xffe600, { emissive: 0.6 }); D.add(gira); D.userData.gira = gira;
  const mitad = ts => { const geo = C(0.62, 0.62, 0.3, 18, false, ts, Math.PI); geo.rotateX(Math.PI / 2); return mesh(geo, am, 0, 0, 0, gira); };
  PAC.top = mitad(Math.PI / 2); PAC.bot = mitad(Math.PI * 1.5); D.visible = false; scene.add(D); PAC.disco = D;
  const mat = new THREE.ShaderMaterial({ vertexShader: PAC_REJ_VS, fragmentShader: PAC_REJ_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uCen: { value: new THREE.Vector2() }, uTime: { value: 0 }, uR: { value: 0 }, uAlpha: { value: 1 } } });
  const geo = new THREE.PlaneGeometry(15, 15); geo.rotateX(-Math.PI / 2); PAC.rejilla = new THREE.Mesh(geo, mat); PAC.rejilla.renderOrder = 2; PAC.rejilla.frustumCulled = false; PAC.rejilla.visible = false; scene.add(PAC.rejilla);
}
function pacEmpieza(){
  return foilForma({ id: 'pacForma', nom: 'COMECOCOS', col: '#ffe800', dur: 8, velK: 1.3, camK: 1.12,
    empieza(){ pacModelo(); PAC.puntos = 0; PAC.lunge = 0; PAC.lungeCd = 0; PAC.waka = 0; PAC.rejT = 0; PAC.muerde.clear();
      foilRotulo('<b>¡PÍLDORA DE PODER!</b><i class="pacFila"><u></u><s></s><s></s><s></s><s class="pacGorda"></s></i>', 'pacRot', 2);
      play('pacPoder'); flash('#ffe800', 0.25); shake = Math.max(shake, 0.15); const O = hero.position;
      ring7(PA7, O.x, 0.5, O.z, 20, [0xffe800, 0x2121ff], 6, 0.3, 0.45, 0, 2, 0.3, SH7.sq);
      barkOnce('pacComer', '¡Ahora huyen ellos! Cómetelos antes de que se les pase el susto.'); },
    tick(dt){ pacTick(this, dt); },
    ataque(){ pacMordisco(); },
    herido(dmg, sx, sz){ return enemies.some(e => e.alive && strFuerte(e) && Math.hypot(e.g.position.x - sx, e.g.position.z - sz) < e.r + 6) ? null : 'none'; },   // asustados no muerden; los jefes, sí
    fin(){ pacFin(); } });
}
function pacMordisco(){
  if (PAC.lunge > 0 || PAC.lungeCd > 0) return;
  PAC.lunge = 0.18; PAC.lungeCd = 0.34; if (inputMag > 0.12){ heading = inputHeading; hero.rotation.y = heading; } play('pacWa');
}
function pacTick(F, dt){
  const O = hero.position, quedan = F.dur - F.t; PAC.rejT += dt;
  if (PAC.lunge > 0){ PAC.lunge -= dt; const v = 13 * dt; O.x += Math.sin(heading) * v; O.z += Math.cos(heading) * v; }
  PAC.lungeCd -= dt;
  const mueve = inputMag > 0.12 || PAC.lunge > 0; PAC.boca += dt * (mueve ? 17 : 7);
  PAC.waka -= dt; if (mueve && PAC.waka <= 0){ PAC.waka = 0.19; play(PAC.wakaN++ % 2 ? 'pacKa' : 'pacWa'); }
  pacIconos(quedan);
  for (const e of foilEnemigos(O, PAC.lunge > 0 ? 1.05 : 0.75)){
    if (strFuerte(e)){ const u = PAC.muerde.get(e); if (u != null && time - u < 0.4) continue; PAC.muerde.set(e, time);
      const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(24), dx / l, dz / l, 2, null, 1); play('pacMuerde');
      if (rnd() < 0.35) foilGrito('¡ÑAM!', '#ffe800'); continue; }
    pacCome(e);
  }
  if (quedan < 0.5 && !PAC.avisa){ PAC.avisa = true; play('pacFin'); } else if (quedan >= 0.5) PAC.avisa = false;
}
function pacCome(e){
  const x = e.g.position.x, z = e.g.position.z, y = e.numY || 1.5, s0 = e.g.scale.x; killEnemy(e); if (e.alive) return;
  tA.set(x, y * 0.75, z); spawnNumber(tA, [200, 400, 800, 1600][Math.min(3, PAC.puntos++)], 'react pacPts');
  strMuerte(e, 0.22, (q, k) => { q.g.scale.setScalar(Math.max(0.01, s0 * (1 - k))); q.g.position.lerp(strV2.set(hero.position.x, 0.4, hero.position.z), 0.3); });
  pacOjos(x, z, y * 0.7); play('pacCome'); play('pacOjos'); hitStop = Math.max(hitStop, 0.07); sparks(x, 0.8, z, 6, 0xffe800, 3);
}
function pacIconos(quedan){
  const blanco = quedan < 2 && Math.floor(quedan * 5) % 2 === 0; let i = 0;
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false) continue; if (i >= 24) break;
    let s = PAC.fant[i]; if (!s){ s = new THREE.Sprite(pacFantMat); s.renderOrder = 7; scene.add(s); PAC.fant.push(s); }
    s.material = blanco ? pacFantMat2 : pacFantMat; s.visible = true; s.position.set(e.g.position.x, (e.numY || 1.5) + 0.55 + Math.sin(time * 6 + i) * 0.08, e.g.position.z); s.scale.setScalar(strFuerte(e) ? 0.95 : 0.62); i++; }
  for (; i < PAC.fant.length; i++) PAC.fant[i].visible = false;
}
function pacOjos(x, z, y){
  let o = PAC.ojos.find(q => !q.vivo); if (!o){ if (PAC.ojos.length >= 8) return; o = { s: new THREE.Sprite(pacOjosMat) }; o.s.renderOrder = 7; scene.add(o.s); PAC.ojos.push(o); }
  const a = Math.atan2(x - hero.position.x, z - hero.position.z) + (rnd() - 0.5) * 0.6; Object.assign(o, { vivo: true, t: 0, x, y, z, vx: Math.sin(a) * 7, vz: Math.cos(a) * 7 }); o.s.visible = true;
}
function pacOjosTick(dt){
  for (const o of PAC.ojos){ if (!o.vivo) continue; o.t += dt; o.x += o.vx * dt; o.z += o.vz * dt; const k = o.t / 1.1; if (k >= 1){ o.vivo = false; o.s.visible = false; continue; }
    o.s.position.set(o.x, o.y + Math.abs(Math.sin(o.t * 14)) * 0.12, o.z); o.s.scale.set(0.62 * (1 - k * k), 0.22 * (1 - k * k), 1); }
}
function pacFin(){
  if (PAC.disco) PAC.disco.visible = false; if (PAC.rejilla) PAC.rejilla.visible = false; for (const s of PAC.fant) s.visible = false; PAC.muerde.clear(); PAC.lunge = 0;
}
// el disco mira siempre a la cámara (como el muñeco de la recreativa) y la boca apunta, en pantalla, hacia donde va
function pacPost(){
  const F = FOILX.forma, on = foilEn('pacForma') && !SNC.m && gameState !== 'cutscene' && !cs.active;
  if (PAC.disco) PAC.disco.visible = on; if (PAC.rejilla) PAC.rejilla.visible = foilEn('pacForma') && gameState !== 'cutscene' && !cs.active;
  if (!foilEn('pacForma') || gameState === 'cutscene' || cs.active) for (const f of PAC.fant) f.visible = false;
  if (!on) return;
  const O = hero.position, D = PAC.disco, y = O.y + 0.66; D.position.set(O.x, y, O.z); D.quaternion.copy(camera.quaternion);
  pacP1.set(O.x, y, O.z).project(camera); pacP2.set(O.x + Math.sin(heading), y, O.z + Math.cos(heading)).project(camera);
  D.userData.gira.rotation.z = Math.atan2((pacP2.y - pacP1.y) * innerHeight, (pacP2.x - pacP1.x) * innerWidth);
  const ab = 0.04 + 0.5 * Math.abs(Math.sin(PAC.boca)); PAC.top.rotation.z = ab; PAC.bot.rotation.z = -ab; D.scale.setScalar(PAC.lunge > 0 ? 1.15 : 1);
  const R = PAC.rejilla, U = R.material.uniforms, quedan = F ? F.dur - F.t : 0;
  R.position.set(O.x, 0.045, O.z); U.uCen.value.set(O.x, O.z); U.uTime.value = time; U.uR.value = 7 * smooth(Math.min(1, PAC.rejT / 0.45)); U.uAlpha.value = Math.min(1, quedan / 0.5);
}
// asustados: azules (blancos al final, parpadeando), más lentos y huyendo; los jefes, solo más lentos
const pacTinteOrig = statusTint;
statusTint = function(e, s){
  const c = pacTinteOrig(e, s); const F = FOILX.forma;
  if (F && F.id === 'pacForma' && e.alive){ const quedan = F.dur - F.t; c.lerp(quedan < 2 && Math.floor(quedan * 5) % 2 === 0 ? PAC_BLANCO : PAC_AZUL, 0.78); }
  return c;
};
const pacEnemigoOrig = updateEnemy;
updateEnemy = function(e, dt){
  if (!(dt > 0 && e.alive && e.spawnT <= 0 && foilEn('pacForma'))) return pacEnemigoOrig(e, dt);
  const fuerte = strFuerte(e); pacEnemigoOrig(e, dt * (fuerte ? 0.6 : 0.4));
  if (fuerte || !e.alive || e.noSep) return;
  const dx = e.g.position.x - hero.position.x, dz = e.g.position.z - hero.position.z, d = Math.max(0.01, Math.hypot(dx, dz));
  if (d < 7){ const a = Math.atan2(dx, dz), v = 1.6 * dt; e.g.position.x += Math.sin(a) * v; e.g.position.z += Math.cos(a) * v; e.g.rotation.y = lerpAngle(e.g.rotation.y, a, 0.15);
    const r = Math.hypot(e.g.position.x, e.g.position.z), lim = ARENA - 0.5; if (r > lim){ e.g.position.x *= lim / r; e.g.position.z *= lim / r; } }
};

foilPoder({ id: 'foilPacman', ic: '🟡', name: 'Comecocos', tags: ['otaku'],
  desc: 'Un clásico de recreativa: cada 10 bajas aparece en el suelo una píldora de poder. Písala y serás un comecocos 8 s: los enemigos se asustan (azules y lentos) y al tocarlos te los comes (200, 400, 800, 1600…); a los jefes, mordiscos. Atacar es un mordisco hacia delante.',
  mata(e){ if (foilEn('pacForma') || PAC.hay || !foilEscenario()) return; if (++PAC.bajas >= 10){ PAC.bajas = 0; pacPildora(); } pacMarcador(); },
  tick(dt, jugando){ pacMarcador(); if (!jugando) return; pacPildoraTick(dt); pacOjosTick(dt); },
  post(){ pacPost(); strCuerpoVer(); },
  limpia(){ pacFin(); strCuerpoDevuelve(); PAC.hay = false; if (PAC.pild) PAC.pild.visible = false; for (const o of PAC.ojos){ o.vivo = false; o.s.visible = false; } strMarcaFuera('pacPuntos'); },
  reset(){ PAC.bajas = 0; PAC.hay = false; PAC.marca = ''; } });
/* ======================================================================
   5 · BOLA AZUL (de un erizo rápido) · prefijo snc
   ====================================================================== */
const SNC = { m: null, cd: 0, anillos: 0, sueltos: [], pops: [], bola: null, lentoT: 0, marca: '', anGeo: null, anMat: null,
  rastro: strRastro('snc', [0xd8f4ff, 0x1a5cff, 0xffffff, 0], 12, true) };
// la estela borrosa: azul que brilla, más opaca cerca de la bola, con vetas a lo largo
TRAZO_FS.snc = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uE; uniform float uAlpha; uniform float uSeed; uniform float uLen; uniform float uTime; uniform float uSeco;
varying vec2 vUV;
void main(){
  float u = vUV.x, a = abs(vUV.y), nucleo = 1.0 - smoothstep(0.0, 0.75, a);
  float vetas = 0.55 + 0.45 * sin(vUV.y * 9.0 + uSeed);
  vec3 col = mix(uB, uA, nucleo * nucleo);
  gl_FragColor = vec4(col, uAlpha * u * u * (0.35 + 0.65 * nucleo) * vetas);
}`;
const sncAnilloMat = strSpriteMat(strPix(['....OOOO....', '..OOYYYYOO..', '.OYLLYYYYDO.', '.OLYOOOOYDO.', 'OYLO....OYDO', 'OYYO....OYDO', 'OYYO....OYDO', 'OYYO....ODDO',
  '.OYYOOOODDO.', '.OYYYYYDDDO.', '..OODDDDOO..', '....OOOO....'], { O: '#7a4200', Y: '#ffd21e', L: '#fff6b0', D: '#d88a00' }, 4), false);
// el remolino de la bola (aditivo): arcos azules y blancos, con su propio PRNG
const sncGiroMat = foilSprite(foilLienzo(128, 128, g => { const R = mulberry32(751); g.lineCap = 'round';
  for (let k = 0; k < 9; k++){ const r = 30 + R() * 30, a = R() * TAU, L = 1.2 + R() * 1.6; g.beginPath(); g.arc(64, 64, r, a, a + L); g.strokeStyle = k % 3 ? 'rgba(80,150,255,0.75)' : 'rgba(230,245,255,0.9)'; g.lineWidth = 3 + R() * 5; g.stroke(); } }), true);
Object.assign(SFX, {
  sncGiro: () => { for (let i = 0; i < 6; i++) tone({ type: 'square', f0: 200 + i * 120, f1: 700 + i * 160, dur: 0.05, vol: 0.04, when: i * 0.03 }); },
  sncSale: () => { noise({ dur: 0.35, vol: 0.2, f0: 700, f1: 3500, q: 1.1, rv: 0.15 }); tone({ type: 'square', f0: 500, f1: 1500, dur: 0.18, vol: 0.04 }); },
  sncTin: () => { tone({ type: 'square', f0: NOTE(88), dur: 0.05, vol: 0.03, rv: 0.1 }); tone({ type: 'triangle', f0: NOTE(100), dur: 0.22, vol: 0.045, when: 0.04, rv: 0.3 }); tone({ type: 'triangle', f0: NOTE(95), dur: 0.22, vol: 0.035, when: 0.04, rv: 0.3 }); },
  sncGolpe: () => { tone({ type: 'square', f0: 1400, f1: 400, dur: 0.08, vol: 0.06 }); noise({ dur: 0.08, vol: 0.2, f0: 1500, type: 'lowpass', q: 0.6 }); },
  sncPierde: () => { for (let i = 0; i < 8; i++) tone({ type: 'triangle', f0: NOTE(96 - i * 2), dur: 0.12, vol: 0.04, when: i * 0.04, rv: 0.3 }); },
  sncLento: () => seq_([[79, 0.08], [83, 0.08], [86, 0.25]], 'square', 0.07, 0.05, 0.3)
});
function sncMarcador(){
  const el = foilMarcador('sncAnillos', 'sncMarca'), txt = String(SNC.anillos); el.hidden = !strEnJuego(); el.classList.toggle('sncCero', !SNC.anillos);
  if (txt === SNC.marca) return; SNC.marca = txt; el.innerHTML = `<b>ANILLOS</b><span>${SNC.anillos}</span>`;
}
function sncBolaModelo(){
  if (SNC.bola) return SNC.bola;
  const src = new THREE.Group(), azul = makeMat(0x1f55ff, { emissive: 0.3 }), claro = makeMat(0x7fb0ff, { emissive: 0.45 }), piel = makeMat(0xffd8a8, { emissive: 0.3 });
  mesh(new THREE.IcosahedronGeometry(0.42, 1), azul, 0, 0, 0, src);
  for (let i = 0; i < 10; i++){ const a = i / 10 * TAU, d = new V3(i % 2 ? 0.32 : -0.32, Math.cos(a), Math.sin(a)).normalize();   // púas alrededor del giro, como una sierra
    const m = mesh(new THREE.ConeGeometry(0.15, 0.48, 4), i % 3 ? azul : claro, 0, 0, 0, src); m.position.copy(d).multiplyScalar(0.42); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d); }
  mesh(new THREE.IcosahedronGeometry(0.2, 0), piel, 0.3, 0, 0, src); mesh(new THREE.IcosahedronGeometry(0.2, 0), piel, -0.3, 0, 0, src);   // la tripa asoma a los lados
  const g = new THREE.Group(), gira = new THREE.Group(); mpFusiona(src, gira); g.add(gira); g.userData.gira = gira;
  const s = new THREE.Sprite(sncGiroMat); s.scale.setScalar(1.55); s.renderOrder = 6; g.add(s);
  g.visible = false; scene.add(g); SNC.bola = g; return g;
}

/* ---------- El acelerón y el ataque teledirigido ---------- */
const sncPuede = () => canAct() && !invActive && !SNC.m && !NUCA.m && state !== 'roll' && state !== 'tech' && !(state === 'attack' && curMove && curMove.special);
function sncSiguiente(M){   // el siguiente blanco a 7 m (el primero, hacia donde apuntas); a los fuertes se les puede volver a dar
  const cur = M.ult ? M.ult.g.position : hero.position, dir = !M.ult && inputMag > 0.12 ? inputHeading : null; let best = null, bs = 1e9;
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || e.dying > 0) continue;
    const n = M.golpes.get(e) || 0; if (n >= (strFuerte(e) ? 3 : 1)) continue;
    const dx = e.g.position.x - cur.x, dz = e.g.position.z - cur.z, d = Math.hypot(dx, dz) - e.r; if (d > 7) continue;
    let s = d + n * 4; if (dir !== null){ let da = Math.atan2(dx, dz) - dir; da = Math.abs(Math.atan2(Math.sin(da), Math.cos(da))); if (da > 1.3) continue; s += da * 2.5; }
    if (s < bs){ bs = s; best = e; } }
  return best;
}
function sncEmpieza(modo, e){
  const dir = e ? angTo(hero.position.x, hero.position.z, e.g.position.x, e.g.position.z) : (inputMag > 0.12 ? inputHeading : hero.rotation.y);
  const M = SNC.m = { modo, t: 0, f: dir, S: hero.position.clone(), seg: 0, segDur: 0.2, obj: null, fase: modo, golpes: new Map(), n: 0, ult: null, ya: new Set(), vy: 0, y0: 0 };
  if (e) sncSegmento(M, e);
  comboT = 0; state = 'roll'; rollT = 0.1; rollDir = heading = hero.rotation.y = dir; attackW = 0; trailAlpha = 0; staffToBack(); onRollStart();
  sncBolaModelo(); play('sncGiro'); play('sncSale'); vy = 0; puff(4);
  barkOnce('sncBola', '¡Te has hecho una bola azul y has salido disparado! Si hay alguien cerca, vas rebotando de cabeza en cabeza.');
}
function sncSegmento(M, e){ M.obj = e; M.seg = 0; M.S.copy(hero.position); M.fase = 'va'; M.segDur = clamp(Math.hypot(e.g.position.x - M.S.x, e.g.position.z - M.S.z) / 24, 0.1, 0.32); }
function sncPega(M, e){
  const H = hero.position, T = e.g.position, dx = T.x - M.S.x, dz = T.z - M.S.z, l = Math.max(0.01, Math.hypot(dx, dz)), c = rnd() < up.crit;
  hitEnemy(e, Math.round(rdmg(26) * (c ? critMul() : 1)), c, dx / l, dz / l, 3, 4, true, { src: 'melee' });
  M.n++; M.golpes.set(e, (M.golpes.get(e) || 0) + 1); M.ult = e; hitStop = Math.max(hitStop, 0.05);
  play('sncGolpe'); gring(T.x, H.y, T.z, 0x4a9cff, 0.2, 1.4, 0.25); burst7(PA7, T.x, H.y, T.z, 10, [0x9fe0ff, 0xffffff, 0x2a6bff], 5, 0.25, 0.3, 0, 2, 0.3, SH7.dia);
  const sig = M.n < 5 ? sncSiguiente(M) : null;
  if (sig){ M.fase = 'rebote'; M.seg = 0; M.y0 = H.y; return; }
  M.fase = 'cae'; M.vy = 6.5; SNC.cd = 1.2;
  if (M.n >= 2) slowT = Math.max(slowT, 0.55);
  if (M.n >= 3 && SNC.lentoT <= 0){ SNC.lentoT = 6; foilRotulo('¡DEMASIADO LENTO!', 'sncRot', 1.7); play('sncLento'); }
}
function sncTick(dt){
  if (SNC.cd > 0) SNC.cd -= dt; if (SNC.lentoT > 0) SNC.lentoT -= dt;
  const M = SNC.m; if (!M) return;
  if (player.dead || (gameState !== 'play' && gameState !== 'paused')){ sncAcaba(); return; }   // (cinemática, cartas, fin…)
  if (dt <= 0) return;
  M.t += dt; state = 'roll'; rollT = 0.1; grounded = true; vy = 0;
  const H = hero.position;
  if (M.fase === 'dash'){
    const k = M.t / 0.4; if (k >= 1){ sncAcaba(); return; }
    const v = 12 * (1 - 0.6 * k) * dt; H.x += Math.sin(M.f) * v; H.z += Math.cos(M.f) * v; H.y = 0;
    for (const e of foilEnemigos(H, 0.9)) if (!M.ya.has(e)){ M.ya.add(e); const dx = e.g.position.x - H.x, dz = e.g.position.z - H.z, l = Math.max(0.01, Math.hypot(dx, dz));
      hitEnemy(e, rdmg(16), rnd() < up.crit, dx / l, dz / l, 6, 3, true, { src: 'melee' }); play('sncGolpe'); sparks(e.g.position.x, 0.8, e.g.position.z, 6, 0x9fe0ff, 4); }
  } else if (M.fase === 'va'){
    const e = M.obj; if (!e || !e.alive || e.dying > 0){ const sig = sncSiguiente(M); if (sig) sncSegmento(M, sig); else { M.fase = 'cae'; M.vy = 2; } return; }
    M.seg += dt; const k = Math.min(1, M.seg / M.segDur), T = e.g.position, ty = Math.min(1.6, (e.numY || 1.5) * 0.55);
    H.set(lerp(M.S.x, T.x, k), lerp(M.S.y, ty, k) + Math.sin(k * Math.PI) * 0.7, lerp(M.S.z, T.z, k)); heading = hero.rotation.y = Math.atan2(T.x - M.S.x, T.z - M.S.z) || heading;
    if (k >= 1) sncPega(M, e);
  } else if (M.fase === 'rebote'){
    M.seg += dt; const k = Math.min(1, M.seg / 0.16); H.y = M.y0 + 1.3 * Math.sin(k * Math.PI / 2);
    if (k >= 1){ const sig = sncSiguiente(M); if (sig) sncSegmento(M, sig); else { M.fase = 'cae'; M.vy = 3; SNC.cd = 1.2; } }
  } else if (M.fase === 'cae'){
    M.vy -= 26 * dt; H.y += M.vy * dt; if (H.y <= 0){ H.y = 0; puff(5); play('land'); sncAcaba(); return; }
  }
  if (rnd() < 0.7) streak7(H.x, H.y + 0.45, H.z, -Math.sin(heading), 0, -Math.cos(heading), 1.1, rnd() < 0.5 ? 0x4a9cff : 0xd8f4ff, 0.16, 0.05);
}
function sncAcaba(){
  const M = SNC.m; if (!M) return; SNC.m = null;
  if (M.modo === 'va' && SNC.cd <= 0) SNC.cd = 1.2;
  if (SNC.bola) SNC.bola.visible = false;
  if (player.dead) return;
  if (hero.position.y > 0.01){ grounded = false; vy = 0; } else { hero.position.y = 0; grounded = true; vy = 0; }
  P.body.rotation.set(0, 0, 0); P.body.scale.setScalar(1);
  if (state === 'roll') state = 'normal';
}
function sncPost(){
  const B = SNC.bola; if (!B) return; const on = !!SNC.m && gameState !== 'cutscene' && !cs.active; B.visible = on; if (!on) return;
  B.position.set(hero.position.x, hero.position.y + 0.48, hero.position.z); B.rotation.y = hero.rotation.y; B.userData.gira.rotation.x = time * 32; sncGiroMat.rotation = -time * 25;
}

/* ---------- Anillos: cada golpe da uno; si te hieren, se caen ---------- */
function sncPop(x, y, z){
  let p = SNC.pops.find(q => !q.vivo); if (!p){ if (SNC.pops.length >= 8) return; p = { s: new THREE.Sprite(sncAnilloMat) }; p.s.renderOrder = 7; scene.add(p.s); SNC.pops.push(p); }
  Object.assign(p, { vivo: true, t: 0, x, y, z }); p.s.visible = true;
}
function sncPopsTick(dt){
  for (const p of SNC.pops){ if (!p.vivo) continue; p.t += dt; const k = p.t / 0.45; if (k >= 1){ p.vivo = false; p.s.visible = false; continue; }
    p.s.position.set(p.x, p.y + k * 0.9, p.z); const w = 0.42 * (1 - k * 0.3); p.s.scale.set(w * Math.max(0.15, Math.abs(Math.cos(p.t * 16))), w, 1); }
}
function sncPierde(){
  const n = Math.min(SNC.anillos, 16); SNC.anillos = 0; sncMarcador(); play('sncPierde');
  if (!SNC.anGeo){ SNC.anGeo = new THREE.TorusGeometry(0.2, 0.05, 5, 14); SNC.anMat = makeMat(0xffd21e, { emissive: 0.65 }); }
  for (let i = 0; i < n; i++){ let r = SNC.sueltos.find(q => !q.vivo); if (!r){ r = { m: new THREE.Mesh(SNC.anGeo, SNC.anMat) }; scene.add(r.m); SNC.sueltos.push(r); }
    const a = i / n * TAU + rnd() * 0.3, v = 3 + rnd() * 2.5; Object.assign(r, { vivo: true, t: 0, x: hero.position.x, y: 1, z: hero.position.z, vx: Math.cos(a) * v, vy: 5 + rnd() * 3, vz: Math.sin(a) * v }); r.m.visible = true; }
  barkOnce('sncAnillos', '¡Se te han caído los anillos! Recógelos rápido, que curan un poco… y luego se esfuman.');
}
function sncSueltosTick(dt){
  for (const r of SNC.sueltos){ if (!r.vivo) continue; r.t += dt;
    r.vy -= 18 * dt; r.x += r.vx * dt; r.y += r.vy * dt; r.z += r.vz * dt;
    if (r.y < 0.25){ r.y = 0.25; r.vy = Math.abs(r.vy) * 0.55; r.vx *= 0.8; r.vz *= 0.8; }
    const lim = ARENA - 0.4, rr = Math.hypot(r.x, r.z); if (rr > lim){ r.x *= lim / rr; r.z *= lim / rr; r.vx *= -0.5; r.vz *= -0.5; }
    r.m.position.set(r.x, r.y, r.z); r.m.rotation.y = r.t * 8; r.m.visible = r.t < 4.5 || Math.floor(r.t * 10) % 2 === 0;
    if (r.t > 0.45 && Math.hypot(r.x - hero.position.x, r.z - hero.position.z) < 1.0 && hero.position.y < 1.5 && !player.dead){ r.vivo = false; r.m.visible = false;
      SNC.anillos++; heal(Math.max(1, Math.round(player.maxHp * 0.015)), true); play('sncTin'); sncMarcador(); pa(r.x, r.y, r.z, 0, 1, 0, 0xfff6b0, 0.3, 0.3, 0, 0, 1.5, SH7.star); continue; }
    if (r.t > 6){ r.vivo = false; r.m.visible = false; } }
}
// con anillos, el golpe duele un 25 % menos (y se te caen); en bola, ni te tocan
const sncHeridaOrig = hurtPlayer;
hurtPlayer = function(dmg, sx, sz, knock){
  if (!lvl('foilSonic') || player.dead || gameState !== 'play') return sncHeridaOrig(dmg, sx, sz, knock);
  if (SNC.m) return 'none';
  const h0 = player.hp, r = sncHeridaOrig(SNC.anillos > 0 ? dmg * 0.75 : dmg, sx, sz, knock);
  if (player.hp < h0 && SNC.anillos > 0) sncPierde();
  return r;
};

foilPoder({ id: 'foilSonic', ic: '💨', name: 'Bola azul', tags: ['otaku'],
  desc: 'Te lo enseñó un erizo con prisa: RODAR es un acelerón en bola de pinchos. Con enemigos a menos de 7 m, ataque teledirigido: saltas de uno a otro, hasta cinco. Cada golpe te da un anillo; si te hieren se te caen (y el golpe duele menos), y recogerlos te cura un poco.',
  rodar(){
    if (!sncPuede() || !foilEscenario()) return false;   // (en el colosal, TOVAN.EXE o el show, rodar es agarrarse o un botón del programa)
    const e = SNC.cd <= 0 ? sncSiguiente({ golpes: new Map(), ult: null }) : null;
    if (e){ sncEmpieza('va', e); return true; }
    if (!grounded) return false;   // en el aire sin blanco: lo de siempre (el impulso de los mapas grandes)
    sncEmpieza('dash', null); return true;
  },
  dano(e, val, o, crit, melee){ if (gameState === 'play' && e.alive && e.spawnT <= 0 && (melee || (o && o.src === 'melee'))){ SNC.anillos = Math.min(999, SNC.anillos + 1); play('sncTin'); sncPop(e.g.position.x, Math.min(2.4, (e.numY || 1.5) * 0.85), e.g.position.z); sncMarcador(); } return val; },
  tick(dt, jugando){
    sncMarcador(); sncTick(dt);
    if (!jugando) return;
    sncPopsTick(dt); sncSueltosTick(dt);
    if (dt > 0) strRastroPon(SNC.rastro, hero.position.x, hero.position.y + 0.48, hero.position.z, !!SNC.m, 0.95, 0.9);
  },
  post(){ sncPost(); strCuerpoVer(); },
  limpia(){ sncAcaba(); strCuerpoDevuelve(); strRastroFuera(SNC.rastro); if (SNC.bola) SNC.bola.visible = false; for (const p of SNC.pops){ p.vivo = false; p.s.visible = false; } for (const r of SNC.sueltos){ r.vivo = false; r.m.visible = false; } strMarcaFuera('sncAnillos'); },
  reset(){ SNC.anillos = 0; SNC.cd = 0; SNC.lentoT = 0; SNC.marca = ''; } });

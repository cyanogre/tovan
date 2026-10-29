'use strict';
/* ======================================================================
   PODERES FOIL · INGENIO (cinco con mecánica propia, sobre foil-nucleo.js)
   Ninguno pone texto en pantalla: se entienden viéndolos. Cada uno con su
   prefijo:
     · Eco del tiempo · eco. Tovan se graba sin parar: dónde está y la pose
       entera, nodo a nodo, los últimos 2,5 s. Al rematar un combo, un eco
       suyo (cian y magenta, desplazados como una cinta de vídeo) sale de
       donde estaba hace 2,5 s y repite exactamente lo que hizo; cada golpe
       del eco pega donde pegó Tovan. Hasta dos a la vez; al acabar, se
       rompe en cristales.
     · Bandada de papel · ori. Cada enemigo que cae se pliega en una grulla
       de papel que vuela alrededor de Tovan (hasta 16). Cada remate lanza
       unas cuantas en picado contra los más cercanos; con doce o más salen
       todas en un remolino que barre la arena.
     · Tinta territorial · tnt. Al correr, Tovan deja un rastro de tinta en
       el suelo. Si el rastro se cierra en un lazo, el lazo se rellena y
       revienta hacia arriba con todo lo que haya dentro (más daño cuanto
       más grande). Cada lazo, de otro color.
     · Polaridad · pol. Cada golpe cuerpo a cuerpo carga al enemigo, rojo y
       azul por turnos (un aura de su color). Los de distinto color se
       atraen, con un arco eléctrico entre ellos, y se estampan; los del
       mismo se repelen. El remate tira de todos los cargados hacia el golpe.
     · A ritmo · rit. Un pulso a 120 por minuto: un aro se cierra a los pies
       de Tovan en cada tiempo. Atacar justo cuando se cierra suelta una
       onda y una nota (cada acierto, la siguiente de la escala); machacar
       el botón rompe la racha. Ocho seguidos: el drop, y el suelo se llena
       de barras de ecualizador que lo levantan todo al compás.
   Lo que va por el mundo pasa por foilFx o se recoge en limpia(); nada de
   rnd() al cargar.
   ====================================================================== */
const ingV = new V3(), ingW = new V3(), ingU = new V3();

/* ======================================================================
   ECO DEL TIEMPO (eco)
   ====================================================================== */
const ECO_SEG = 2.5, ECO_MAX = 2;
const ECO = { nodos: null, cuenta: 0, buf: [], libres: [], golpes: [], ecos: [], cd: 0, mats: null, ahora: null, ahoraV: null };
const ECO_CIAN = [0xffffff, 0x58f0ff, 0x1a78ff, 0], ECO_MAGENTA = [0xffffff, 0xff5ad8, 0x8a1aff, 0];
// la lista de nodos de Tovan (él primero); si cambia (otra arma, otro sombrero…) se empieza a grabar de cero
function ecoNodos(){
  let n = 0; hero.traverse(() => { n++; });
  if (ECO.nodos && n === ECO.cuenta) return ECO.nodos;
  ECO.nodos = []; hero.traverse(o => { ECO.nodos.push(o); o.layers.enable(1); }); ECO.cuenta = n; ECO.buf.length = 0; ECO.libres.length = 0; ECO.mats = null;
  ECO.ahora = new Float32Array(n * 10); ECO.ahoraV = new Uint8Array(n); return ECO.nodos;
}
function ecoLee(N, d, v){ for (let k = 0; k < N.length; k++){ const o = N[k], i = k * 10; o.position.toArray(d, i); o.quaternion.toArray(d, i + 3); o.scale.toArray(d, i + 7); v[k] = o.visible ? 1 : 0; } }
function ecoPon(N, d, v){ for (let k = 0; k < N.length; k++){ const o = N[k], i = k * 10; o.position.fromArray(d, i); o.quaternion.fromArray(d, i + 3); o.scale.fromArray(d, i + 7); o.visible = !!v[k]; } }
// cada fotograma, una copia de la pose (los fotogramas viejos se reciclan, salvo los que usa un eco)
function ecoGraba(){
  const N = ecoNodos(); let fr = ECO.libres.pop(); if (!fr || fr.v.length !== N.length) fr = { d: new Float32Array(N.length * 10), v: new Uint8Array(N.length) };
  fr.t = time; fr.eco = false; ecoLee(N, fr.d, fr.v); ECO.buf.push(fr);
  while (ECO.buf.length && (ECO.buf[0].t < time - ECO_SEG - 0.1 || ECO.buf.length > 260)){ const v = ECO.buf.shift(); if (!v.eco && ECO.libres.length < 40) ECO.libres.push(v); }
  while (ECO.golpes.length && ECO.golpes[0].t < time - ECO_SEG - 0.1) ECO.golpes.shift();
}
function ecoLanza(){
  const fr = ECO.buf.filter(f => f.t >= time - ECO_SEG); if (fr.length < 12) return; for (const f of fr) f.eco = true;
  const t0 = fr[0].t, E = { fr, i: 0, t: 0, t0, dur: fr[fr.length - 1].t - t0, gol: ECO.golpes.filter(g => g.t >= t0), gi: 0, n: ECO.cuenta };
  ECO.ecos.push(E); ECO.cd = 3; play('ecoRebobina');
  const x = fr[0].d[0], z = fr[0].d[2], H = hero.position;   // rebobinado: rayas de vídeo desde Tovan hasta donde empieza el eco
  for (let i = 0; i < 10; i++){ const k = i / 9; streak7(lerp(H.x, x, k) + (rnd() - 0.5) * 0.5, 0.3 + rnd() * 1.6, lerp(H.z, z, k) + (rnd() - 0.5) * 0.5, x - H.x, 0, z - H.z, 1.2, i % 2 ? 0x58f0ff : 0xff5ad8, 0.25, 0.05); }
  ringFx(x, z, 0x58f0ff, 0.2, 1.8, 0.3); ringFx(x, z, 0xff5ad8, 0.1, 1.4, 0.3, 0.1);
}
// el golpe del eco: donde pegó Tovan, hacia donde miraba (el remate, a la redonda)
function ecoGolpe(g){
  const O = { x: g.x, z: g.z }, R = g.fin ? 3.2 : 2.6, ya = new Set();
  for (const e of foilEnemigos(O, R)){ const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.01, Math.hypot(dx, dz));
    if (!g.fin && d > 0.8){ let da = Math.atan2(dx, dz) - g.f; da = Math.abs(Math.atan2(Math.sin(da), Math.cos(da))); if (da > 1.25) continue; }
    foilGolpea(e, rdmg(g.fin ? 36 : 22), dx / d, dz / d, g.fin ? 6 : 3, null, g.fin ? 1.4 : 1, ya); sparks(e.g.position.x, 1, e.g.position.z, 5, 0x9af6ff, 4); }
  const c = [mtoCinta(ECO_CIAN), mtoCinta(ECO_MAGENTA)], a0 = g.fin ? 0 : g.f - 1.15, a1 = g.fin ? TAU : g.f + 1.15, r = g.fin ? 2.3 : 1.7;
  foilFx.push({ t: 0, cintas: c, upd(){ const k = Math.min(1, this.t / 0.1), f = Math.max(0, (this.t - 0.12) / 0.2); if (f >= 1) return false;
      c.forEach((C, i) => { const o = i ? -0.07 : 0.07; tintaPinta(C, (s, v) => { const a = lerp(a0, a1, s); return v.set(O.x + Math.sin(a) * r + o, 0.95 + Math.sin(s * Math.PI) * 0.25, O.z + Math.cos(a) * r - o); }, Math.max(0, k - 0.5), k, q => 0.32 * Math.sin(q * Math.PI)); C.mat.uniforms.uAlpha.value = 1 - f; });
      return true; } });
  play('ecoGolpe');
}
function ecoTick(dt){
  for (let j = ECO.ecos.length - 1; j >= 0; j--){ const E = ECO.ecos[j]; E.t += dt; const rt = E.t0 + E.t;
    while (E.i < E.fr.length - 1 && E.fr[E.i + 1].t <= rt) E.i++;
    while (E.gi < E.gol.length && E.gol[E.gi].t <= rt){ ecoGolpe(E.gol[E.gi]); E.gi++; }
    if (E.t >= E.dur){ const d = E.fr[E.fr.length - 1].d; ECO.ecos.splice(j, 1); play('ecoRompe');   // se rompe en cristales
      burst7(PA7, d[0], 1, d[2], 26, [0x58f0ff, 0xff5ad8, 0xffffff], 5, 0.18, 0.6, 6, 1, 0, SH7.dia, 2); } }
}
// el eco se pinta encima, como los clones: con su pose grabada, dos pasadas (cian y magenta) algo separadas
function ecoPinta(){
  if (!ECO.ecos.length || !ECO.nodos || !(gameState === 'play' || gameState === 'paused') || cs.active) return;
  const N = ECO.nodos; if (!ECO.mats){ const s = new Set(); for (const o of N) if (o.material && o.material.uniforms && o.material.uniforms.uColor) s.add(o.material); ECO.mats = [...s]; }
  const guar = ECO.mats.map(m => [m.uniforms.uColor.value.getHex(), m.uniforms.uEmissive.value, m.uniforms.uOpacity.value]);
  ecoLee(N, ECO.ahora, ECO.ahoraV); ingU.setFromMatrixColumn(camera.matrixWorld, 0).setY(0).normalize();
  renderer.autoClear = false; camera.layers.set(1);
  for (const E of ECO.ecos){ if (E.n !== N.length) continue; const F = E.fr[E.i]; ecoPon(N, F.d, F.v);
    const al = 0.6 * Math.min(1, E.t / 0.15) * Math.min(1, (E.dur - E.t) / 0.25 + 0.2), x0 = hero.position.x, z0 = hero.position.z;
    for (const [col, o] of [[0x58f0ff, 0.05], [0xff5ad8, -0.05]]){ ECO.mats.forEach(m => { m.uniforms.uColor.value.setHex(col); m.uniforms.uEmissive.value = 0.85; m.uniforms.uOpacity.value = al; });
      hero.position.set(x0 + ingU.x * o, hero.position.y, z0 + ingU.z * o); hero.updateMatrixWorld(true); renderer.render(scene, camera); } }
  camera.layers.set(0); renderer.autoClear = true;
  ecoPon(N, ECO.ahora, ECO.ahoraV); hero.updateMatrixWorld(true);
  ECO.mats.forEach((m, i) => { m.uniforms.uColor.value.setHex(guar[i][0]); m.uniforms.uEmissive.value = guar[i][1]; m.uniforms.uOpacity.value = guar[i][2]; });
}
const eco_renderClones = renderClones;
renderClones = function(){ eco_renderClones(); if (lvl('foilEco')) try { ecoPinta(); } catch (err) { console.error(err); } };
function ecoLimpia(){ ECO.ecos.length = 0; ECO.buf.length = 0; ECO.golpes.length = 0; }
Object.assign(SFX, {
  ecoRebobina: () => { for (let i = 0; i < 7; i++) tone({ type: 'square', f0: 900 - i * 90, f1: 1500 - i * 120, dur: 0.05, vol: 0.03, when: i * 0.035 }); noise({ dur: 0.3, vol: 0.12, f0: 4000, f1: 900, type: 'bandpass', q: 2, rv: 0.2 }); },
  ecoGolpe: () => { tone({ type: 'sawtooth', f0: 520, f1: 180, dur: 0.12, vol: 0.04, rv: 0.3 }); tone({ type: 'sawtooth', f0: 530, f1: 186, dur: 0.12, vol: 0.04, when: 0.03, rv: 0.3 }); },
  ecoRompe: () => { for (let i = 0; i < 5; i++) tone({ type: 'triangle', f0: NOTE(96 - i * 3), dur: 0.08, vol: 0.03, when: i * 0.03, rv: 0.4 }); noise({ dur: 0.25, vol: 0.12, f0: 6000, type: 'highpass', rv: 0.3 }); }
});
foilPoder({ id: 'foilEco', ic: '📼', name: 'Eco del tiempo', tags: ['otaku'],
  desc: 'Al rematar un combo, un eco tuyo en cian y magenta sale de donde estabas hace dos segundos y medio y repite exactamente lo que hiciste, golpe a golpe y donde lo diste. Hasta dos ecos a la vez.',
  golpe(f, idx, fin){ ECO.golpes.push({ t: time, x: hero.position.x, z: hero.position.z, f, fin: false }); },
  remate(f){ ECO.golpes.push({ t: time, x: hero.position.x, z: hero.position.z, f, fin: true }); if (ECO.cd <= 0 && ECO.ecos.length < ECO_MAX && foilEscenario()) ecoLanza(); },
  tick(dt, jugando){ if (ECO.cd > 0 && dt > 0) ECO.cd -= dt; if (!jugando || dt <= 0) return; if (!foilEscenario()){ ecoLimpia(); return; } ecoGraba(); ecoTick(dt); },
  limpia(){ ecoLimpia(); }, reset(){ ECO.cd = 0; } });

/* ======================================================================
   BANDADA DE PAPEL (ori)
   ====================================================================== */
const ORI_MAX = 16, ORI_COLS = [0xf4efe4, 0xe8574f, 0x4f8fe0, 0xf2c14e, 0x6ac48a, 0xf08ab8];
const ORI = { gs: [], geo: null, ala: null, mats: null, son: 0 };
// la grulla: cuerpo en rombo con cuello y cola de punta, y dos alas aparte (para batirlas)
function oriGeos(){
  if (ORI.geo) return;
  const tri = v => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g; };
  ORI.geo = tri([0, 0.06, 0.16, -0.07, 0, 0, 0, 0.06, -0.16,   0, 0.06, 0.16, 0, 0.06, -0.16, 0.07, 0, 0,   0, -0.02, 0.1, 0, 0.06, 0.12, 0, 0.3, 0.3,   0, -0.02, -0.1, 0, 0.06, -0.12, 0, 0.22, -0.34,   0, 0.3, 0.3, 0, 0.27, 0.36, 0, 0.24, 0.3]);
  ORI.ala = tri([0, 0.03, 0.11, 0, 0.03, -0.09, 0.34, 0.1, -0.06,   0.34, 0.1, -0.06, 0, 0.03, 0.11, 0.2, 0.08, 0.12]);
  ORI.mats = ORI_COLS.map(c => makeMat(c, { emissive: 0.4, side: THREE.DoubleSide }));
}
function oriNueva(x, y, z){
  oriGeos(); const m = ORI.mats[ORI.gs.length % ORI.mats.length], g = new THREE.Group(), cuerpo = new THREE.Mesh(ORI.geo, m), aL = new THREE.Mesh(ORI.ala, m), aR = new THREE.Mesh(ORI.ala, m);
  aR.scale.x = -1; g.add(cuerpo, aL, aR); g.position.set(x, y, z); g.scale.setScalar(0.01); scene.add(g);
  const o = { g, aL, aR, v: new V3(), fase: rnd() * TAU, t: 0, modo: 'orbita', e: null, de: new V3(), ya: null };
  ORI.gs.push(o); return o;
}
function oriQuita(o){ scene.remove(o.g); const i = ORI.gs.indexOf(o); if (i >= 0) ORI.gs.splice(i, 1); }
function oriConfeti(x, y, z, n){ burst7(PA7, x, y, z, n, ORI_COLS, 5, 0.16, 0.9, 7, 1.5, 0, SH7.sq, 2); }
function oriPliega(e){
  if (ORI.gs.length >= ORI_MAX) return; const x = e.g.position.x, z = e.g.position.z, y = Math.min(1.6, (e.numY || 1.4) * 0.6);
  oriNueva(x, y, z); oriConfeti(x, y, z, 8); if ((ORI.son -= 1) <= 0){ ORI.son = 2; play('oriPliega'); }
}
// remate: unas cuantas en picado (con doce o más, todas en remolino)
function oriLanza(){
  const listas = ORI.gs.filter(o => o.modo === 'orbita' && o.t > 0.4); if (!listas.length) return; const H = hero.position;
  if (listas.length >= 12){ play('oriRemolino'); for (const [i, o] of listas.entries()){ o.modo = 'remolino'; o.t = 0; o.a = i / listas.length * TAU; o.ya = new Set(); } return; }
  const L = foilEnemigos(H, 10).sort((a, b) => Math.hypot(a.g.position.x - H.x, a.g.position.z - H.z) - Math.hypot(b.g.position.x - H.x, b.g.position.z - H.z)); if (!L.length) return;
  listas.slice(0, 4).forEach((o, i) => { o.modo = 'pica'; o.t = 0; o.e = L[i % L.length]; o.de.copy(o.g.position); }); play('oriPica');
}
function oriTick(dt){
  const H = hero.position, N = ORI.gs.length, k = 1 - Math.exp(-dt * 5);
  for (let i = N - 1; i >= 0; i--){ const o = ORI.gs[i], g = o.g; o.t += dt; const p = g.position, x0 = p.x, z0 = p.z;
    const bate = o.modo === 'pica' ? 0.15 : 0.35 + 0.55 * Math.sin(time * 11 + o.fase); o.aL.rotation.z = bate; o.aR.rotation.z = -bate;
    if (o.modo === 'orbita'){
      g.scale.setScalar(Math.min(1, o.t / 0.35) * 1.6);
      const a = i / Math.max(1, N) * TAU + time * 0.9, r = 1.7 + 0.35 * Math.sin(time * 1.7 + o.fase), y = 1.5 + 0.45 * Math.sin(time * 1.3 + i);
      p.x += (H.x + Math.sin(a) * r - p.x) * k; p.z += (H.z + Math.cos(a) * r - p.z) * k; p.y += (H.y + y - p.y) * k;
    } else if (o.modo === 'pica'){
      const e = o.e, T = e && e.alive ? e.g.position : null; if (!T){ o.modo = 'orbita'; continue; }
      const s = Math.min(1, o.t / 0.42), ty = Math.min(1.2, (e.numY || 1.4) * 0.5);
      p.set(lerp(o.de.x, T.x, s), lerp(o.de.y, ty, s) + Math.sin(s * Math.PI) * 1.4, lerp(o.de.z, T.z, s));
      if (rnd() < 0.7) pa(p.x, p.y, p.z, 0, 0, 0, ORI_COLS[i % 6], 0.08, 0.3, 0, 0, 0, SH7.sq);
      if (s >= 1){ const dx = T.x - o.de.x, dz = T.z - o.de.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(36), dx / l, dz / l, 5, null, 1.2);
        oriConfeti(p.x, p.y, p.z, 14); ringFx(T.x, T.z, 0xf4efe4, 0.2, 1.6, 0.3); play('oriPlof'); shake = Math.max(shake, 0.15); oriQuita(o); continue; }
    } else if (o.modo === 'remolino'){   // en espiral hacia fuera, cortando todo lo que pilla
      const s = o.t / 1.3; if (s >= 1){ oriConfeti(p.x, p.y, p.z, 10); oriQuita(o); continue; }
      const a = o.a + o.t * 7, r = 1.6 + s * 8;
      p.set(H.x + Math.sin(a) * r, 0.9 + Math.sin(s * Math.PI) * 1.2, H.z + Math.cos(a) * r);
      for (const e of foilEnemigos(p, 0.9)){ if (o.ya.has(e)) continue; o.ya.add(e); const dx = e.g.position.x - H.x, dz = e.g.position.z - H.z, l = Math.max(0.01, Math.hypot(dx, dz));
        foilGolpea(e, rdmg(30), dx / l, dz / l, 4, null, 1); sparks(e.g.position.x, 1, e.g.position.z, 4, 0xfff6e0, 3); }
      if (rnd() < 0.5) pa(p.x, p.y, p.z, 0, 0, 0, ORI_COLS[i % 6], 0.09, 0.4, 0, 0, 0, SH7.sq);
    }
    const vx = p.x - x0, vz = p.z - z0; if (vx * vx + vz * vz > 1e-6) g.rotation.y = Math.atan2(vx, vz);
  }
}
function oriLimpia(){ for (const o of ORI.gs.slice()) oriQuita(o); }
Object.assign(SFX, {
  oriPliega: () => { for (let i = 0; i < 3; i++) noise({ dur: 0.05, vol: 0.12, f0: 3500 + i * 800, type: 'highpass', when: i * 0.05 }); tone({ type: 'triangle', f0: NOTE(84), dur: 0.15, vol: 0.03, when: 0.12, rv: 0.4 }); },
  oriPica: () => { noise({ dur: 0.4, vol: 0.14, f0: 800, f1: 3000, type: 'bandpass', q: 1.5, rv: 0.2 }); },
  oriPlof: () => { noise({ dur: 0.12, vol: 0.22, f0: 2500, type: 'highpass' }); tone({ type: 'sine', f0: 220, f1: 90, dur: 0.12, vol: 0.12 }); },
  oriRemolino: () => { noise({ dur: 1.2, vol: 0.18, f0: 400, f1: 4000, type: 'bandpass', q: 1.2, attack: 0.3, rv: 0.3 }); [72, 76, 79, 84].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.3, vol: 0.04, when: i * 0.08, rv: 0.5 })); }
});
foilPoder({ id: 'foilGrullas', ic: '🕊️', name: 'Bandada de papel', tags: ['otaku'],
  desc: 'Cada enemigo que cae se pliega en una grulla de papel que vuela a tu alrededor (hasta 16). Cada remate lanza unas cuantas en picado contra los más cercanos; con doce o más salen todas en un remolino que barre la arena.',
  mata(e){ if (gameState === 'play' && foilEscenario()) oriPliega(e); },
  remate(){ if (foilEscenario()) oriLanza(); },
  tick(dt, jugando){ const ver = jugando || gameState === 'paused' || gameState === 'upgrade'; for (const o of ORI.gs) o.g.visible = ver && foilEscenario(); if (jugando && dt > 0 && foilEscenario()) oriTick(dt); },
  limpia(){ oriLimpia(); } });

/* ======================================================================
   TINTA TERRITORIAL (tnt)
   ====================================================================== */
const TNT_N = 180, TNT_VIDA = 4, TNT_COLS = [0xff2fa8, 0xff8a1a, 0x18e0d0, 0xa8f020, 0x8a4dff, 0xffe02a];
const TNT = { pts: [], col: 0, m: null, geo: null };
const TNT_VS = 'attribute float aK; attribute float aL; varying float vK; varying float vL; varying vec3 vW; void main(){ vK = aK; vL = aL; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
const TNT_FS = `uniform vec3 uC; varying float vK; varying float vL; varying vec3 vW;
float h(vec2 p){ return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5); }
void main(){
  vec2 c = floor(vW.xz * 9.0); float n = h(c);
  float borde = 1.0 - smoothstep(0.55, 1.0, abs(vL) + n * 0.25);
  float a = borde * (1.0 - vK * vK) * 0.92; if (a < 0.08) discard;
  gl_FragColor = vec4(uC * (0.8 + 0.35 * n), a);
}`;
function tntMalla(){
  if (TNT.m) return TNT.m;
  const g = new THREE.BufferGeometry(), N = TNT_N, idx = [];
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3)); g.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(N * 2), 1));
  const L = new Float32Array(N * 2); for (let i = 0; i < N; i++){ L[i * 2] = -1; L[i * 2 + 1] = 1; } g.setAttribute('aL', new THREE.BufferAttribute(L, 1));
  for (let i = 0; i < N - 1; i++){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } g.setIndex(idx); g.setDrawRange(0, 0);
  const mat = new THREE.ShaderMaterial({ vertexShader: TNT_VS, fragmentShader: TNT_FS, uniforms: { uC: { value: new THREE.Color(TNT_COLS[0]) } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  TNT.m = new THREE.Mesh(g, mat); TNT.m.frustumCulled = false; TNT.m.renderOrder = 2; scene.add(TNT.m); TNT.geo = g; return TNT.m;
}
function tntPinta(){
  const m = tntMalla(), P = TNT.pts, n = Math.min(P.length, TNT_N), pos = TNT.geo.attributes.position.array, K = TNT.geo.attributes.aK.array;
  m.material.uniforms.uC.value.setHex(TNT_COLS[TNT.col % TNT_COLS.length]);
  for (let i = 0; i < n; i++){ const p = P[P.length - n + i], q = P[Math.max(0, P.length - n + i - 1)], r = P[Math.min(P.length - 1, P.length - n + i + 1)];
    let dx = r.x - q.x, dz = r.z - q.z; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; const w = p.w;
    pos.set([p.x - dz * w, 0.035, p.z + dx * w, p.x + dz * w, 0.035, p.z - dx * w], i * 6); K[i * 2] = K[i * 2 + 1] = Math.min(1, (time - p.t) / TNT_VIDA); }
  TNT.geo.setDrawRange(0, Math.max(0, n - 1) * 6); TNT.geo.attributes.position.needsUpdate = true; TNT.geo.attributes.aK.needsUpdate = true; m.visible = n > 1;
}
// ¿corta el tramo nuevo (a→b) a alguno de los viejos? (devuelve el índice y el punto de corte)
function tntCorta(a, b){
  const P = TNT.pts;
  for (let j = 0; j < P.length - 4; j++){ const c = P[j], d = P[j + 1];
    const r1x = b.x - a.x, r1z = b.z - a.z, r2x = d.x - c.x, r2z = d.z - c.z, den = r1x * r2z - r1z * r2x; if (Math.abs(den) < 1e-6) continue;
    const t = ((c.x - a.x) * r2z - (c.z - a.z) * r2x) / den, u = ((c.x - a.x) * r1z - (c.z - a.z) * r1x) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return { j, x: a.x + r1x * t, z: a.z + r1z * t }; }
  return null;
}
function tntDentro(poly, x, z){ let s = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++){ const a = poly[i], b = poly[j]; if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) s = !s; } return s; }
function tntTick(dt){
  const H = hero.position, P = TNT.pts;
  while (P.length && time - P[0].t > TNT_VIDA) P.shift();
  const ult = P[P.length - 1], suelo = grounded && H.y < 0.2 && state !== 'dead';
  if (suelo && (!ult || Math.hypot(H.x - ult.x, H.z - ult.z) > 0.32)){
    const nuevo = { x: H.x, z: H.z, t: time, w: 0.22 + rnd() * 0.08 };
    const corte = ult ? tntCorta(ult, nuevo) : null;
    if (corte){ const poly = [{ x: corte.x, z: corte.z }, ...P.slice(corte.j + 1).map(p => ({ x: p.x, z: p.z }))]; let A = 0;
      for (let i = 0; i < poly.length; i++){ const a = poly[i], b = poly[(i + 1) % poly.length]; A += a.x * b.z - b.x * a.z; } A = Math.abs(A) / 2;
      if (A >= 1.6 && poly.length >= 4){ tntRevienta(poly, A); P.length = 0; } }
    P.push(nuevo); if (P.length > TNT_N) P.shift();
  }
  if (P.length > 1 || (TNT.m && TNT.m.visible)) tntPinta();
}
// el lazo se rellena y revienta hacia arriba
function tntRevienta(poly, A){
  const col = TNT_COLS[TNT.col % TNT_COLS.length]; TNT.col++;
  const forma = new THREE.Shape(poly.map(p => new THREE.Vector2(p.x, -p.z))), geo = new THREE.ShapeGeometry(forma); geo.rotateX(-Math.PI / 2); geo.translate(0, 0.04, 0);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 })); m.renderOrder = 2; scene.add(m);
  let cx = 0, cz = 0, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const p of poly){ cx += p.x; cz += p.z; x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); } cx /= poly.length; cz /= poly.length;
  play('tntLlena');
  foilFx.push({ t: 0, upd(dt){ const t = this.t;
      if (t < 0.35){ m.material.opacity = 0.85 * (t / 0.35) * (0.8 + 0.2 * Math.sin(t * 60)); return true; }
      if (!this.boom){ this.boom = true; const dano = rdmg(26 + Math.min(70, A * 4)), ya = new Set();
        for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || !tntDentro(poly, e.g.position.x, e.g.position.z)) continue; const dx = e.g.position.x - cx, dz = e.g.position.z - cz, l = Math.max(0.01, Math.hypot(dx, dz));
          foilGolpea(e, dano, dx / l, dz / l, 4, null, 1.5, ya); burst7(PA7, e.g.position.x, 0.5, e.g.position.z, 8, [col, 0xffffff], 7, 0.3, 0.7, 14, 1, 0, SH7.dot, 8); }
        const n = Math.min(40, 8 + A * 2); for (let i = 0, k = 0; i < n && k < 200; k++){ const x = lerp(x0, x1, rnd()), z = lerp(z0, z1, rnd()); if (!tntDentro(poly, x, z)) continue; i++;   // surtidores de tinta
          pa(x, 0.1, z, (rnd() - 0.5) * 1.5, 6 + rnd() * 7, (rnd() - 0.5) * 1.5, rnd() < 0.8 ? col : 0xffffff, 0.35 + rnd() * 0.35, 0.8 + rnd() * 0.4, 14, 0.5, 0, SH7.dot); }
        ringFx(cx, cz, col, 0.3, Math.sqrt(A) * 1.2 + 1, 0.45); flash('#' + new THREE.Color(col).getHexString(), 0.18); shake = Math.max(shake, Math.min(0.8, 0.2 + A * 0.03)); hitStop = Math.max(hitStop, 0.05); play('tntBoom'); }
      m.material.opacity = 0.85 * Math.max(0, 1 - (t - 0.35) / 1.4); return t < 1.75; },
    fin(){ scene.remove(m); geo.dispose(); m.material.dispose(); } });
}
Object.assign(SFX, {
  tntLlena: () => { noise({ dur: 0.35, vol: 0.14, f0: 300, f1: 1800, type: 'bandpass', q: 1.5, attack: 0.25 }); tone({ type: 'sine', f0: 200, f1: 520, dur: 0.33, vol: 0.06 }); },
  tntBoom: () => { noise({ dur: 0.5, vol: 0.35, f0: 900, f1: 200, type: 'lowpass', rv: 0.3 }); tone({ type: 'sine', f0: 110, f1: 40, dur: 0.4, vol: 0.4 }); for (let i = 0; i < 6; i++) noise({ dur: 0.06, vol: 0.1, f0: 1200 + i * 300, type: 'bandpass', q: 3, when: 0.05 + i * 0.05 }); }
});
foilPoder({ id: 'foilTinta', ic: '🎨', name: 'Tinta territorial', tags: ['otaku'],
  desc: 'Al correr dejas un rastro de tinta. Si lo cierras en un lazo alrededor de los enemigos, el lazo se rellena y revienta hacia arriba con todo lo que haya dentro: cuanto más grande, más daño. Cada lazo, de otro color.',
  tick(dt, jugando){ if (!jugando || !foilEscenario()){ if (!foilEscenario() || !strEnJuego()){ TNT.pts.length = 0; if (TNT.m) TNT.m.visible = false; } return; } if (dt > 0) tntTick(dt); },
  limpia(){ TNT.pts.length = 0; if (TNT.m) TNT.m.visible = false; } });

/* ======================================================================
   POLARIDAD (pol)
   ====================================================================== */
const POL = { sig: 1, auras: [], arcos: [], pulso: null };
const POL_ROJO = 0xff3048, POL_AZUL = 0x2a7cff;
const POL_AURA = foilLienzo(128, 128, g => { const gr = g.createRadialGradient(64, 64, 6, 64, 64, 62); gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
const POL_MATS = [POL_ROJO, POL_AZUL].map(c => { const m = foilSprite(POL_AURA, true); m.color = new THREE.Color(c); return m; });
function polCarga(e){
  if (!e.alive || e.spawnT > 0 || e.colEscama) return; POL.sig = -POL.sig; const nuevo = e.polo !== POL.sig; e.polo = POL.sig; e.poloT = 7; if (!e.polV) e.polV = new V3();
  if (nuevo){ const c = e.polo > 0 ? POL_ROJO : POL_AZUL; gring(e.g.position.x, 0.1, e.g.position.z, c, 0.3, 1.3, 0.25); play(e.polo > 0 ? 'polMas' : 'polMenos'); }
}
function polAura(i){ let s = POL.auras[i]; if (!s){ s = new THREE.Sprite(POL_MATS[0]); s.renderOrder = 6; scene.add(s); POL.auras.push(s); } return s; }
function polArco(i){ let o = POL.arcos[i]; if (o) return o;
  o = { c: tintaCoge([0xffffff, 0xd0a0ff, 0x8060ff, 0], 0, 'rayo'), A: new V3(), B: new V3() };
  o.P = rayoTiembla((s, v) => v.set(lerp(o.A.x, o.B.x, s), lerp(o.A.y, o.B.y, s) + Math.sin(s * Math.PI) * 0.35, lerp(o.A.z, o.B.z, s)), 8, 0.14); POL.arcos.push(o); return o; }
function polChoque(a, b, vr){
  const x = (a.g.position.x + b.g.position.x) / 2, z = (a.g.position.z + b.g.position.z) / 2, dx = b.g.position.x - a.g.position.x, dz = b.g.position.z - a.g.position.z, l = Math.max(0.01, Math.hypot(dx, dz)), dano = rdmg(24 + Math.min(30, vr * 3));
  foilGolpea(a, dano, -dx / l, -dz / l, 5, null, 1.4); foilGolpea(b, dano, dx / l, dz / l, 5, null, 1.4);
  for (const e of [a, b]){ e.polo = 0; e.poloT = 0; } a.polV.set(-dx / l * 5, 0, -dz / l * 5); b.polV.set(dx / l * 5, 0, dz / l * 5);
  burst7(PA7, x, 1, z, 22, [POL_ROJO, POL_AZUL, 0xffffff], 7, 0.2, 0.45, 0, 2, 0.3, SH7.star); ringFx(x, z, 0xd0a0ff, 0.2, 2.2, 0.3); lightFlash(x, 1.2, z, 0xc0a0ff, 3, 8);
  shake = Math.max(shake, 0.35); hitStop = Math.max(hitStop, 0.06); play('polChoque');
}
function polTick(dt){
  const L = enemies.filter(e => e.alive && e.spawnT <= 0 && e.polo && (e.poloT -= dt) > 0), P_ = POL.pulso;
  for (const e of enemies) if (e.polo && (!e.alive || e.poloT <= 0)){ e.polo = 0; }
  let na = 0, nc = 0; const H = hero.position;
  for (let i = 0; i < L.length; i++){ const a = L[i], A = a.g.position, fa = strFuerte(a);
    const s = polAura(na++); s.visible = true; s.material = POL_MATS[a.polo > 0 ? 0 : 1]; const y = Math.min(2.4, (a.numY || 1.4) * 0.55); s.position.set(A.x, y, A.z); s.scale.setScalar((a.r || 0.5) * 4.4 * (0.9 + 0.1 * Math.sin(time * 14 + i)));
    if (!(a.polPulso > time - 0.55)){ a.polPulso = time; gring(A.x, 0.08, A.z, a.polo > 0 ? POL_ROJO : POL_AZUL, 0.3, (a.r || 0.5) + 0.9, 0.4); }
    if (!fa && P_){ const dx = P_.x - A.x, dz = P_.z - A.z, d = Math.hypot(dx, dz); if (d < 7 && d > 0.05){ a.polV.x += dx / d * 40 * dt; a.polV.z += dz / d * 40 * dt; }
      if (d < 1.1 && !P_.ya.has(a)){ P_.ya.add(a); foilGolpea(a, rdmg(30), -dx / Math.max(0.01, d), -dz / Math.max(0.01, d), 4, null, 1.3); sparks(A.x, 1, A.z, 8, 0xd0a0ff, 5); } }
    for (let j = i + 1; j < L.length; j++){ const b = L[j], B_ = b.g.position, fb = strFuerte(b); const dx = B_.x - A.x, dz = B_.z - A.z, d = Math.max(0.05, Math.hypot(dx, dz)); if (d > 8) continue;
      const atrae = a.polo !== b.polo, k = atrae ? 14 / Math.max(1, d) : (d < 3 ? -7 / Math.max(0.6, d) : 0); if (!k) continue;
      if (!fa) { a.polV.x += dx / d * k * dt * (fb ? 1.6 : 1); a.polV.z += dz / d * k * dt * (fb ? 1.6 : 1); }
      if (!fb) { b.polV.x -= dx / d * k * dt * (fa ? 1.6 : 1); b.polV.z -= dz / d * k * dt * (fa ? 1.6 : 1); }
      if (atrae && nc < 6 && d < 6){ const o = polArco(nc++);   // el arco entre los dos
        o.A.set(A.x, Math.min(1.6, (a.numY || 1.4) * 0.55), A.z); o.B.set(B_.x, Math.min(1.6, (b.numY || 1.4) * 0.55), B_.z);
        o.c.m.visible = true; tintaPinta(o.c, o.P, 0, 1, q => 0.11); o.c.mat.uniforms.uAlpha.value = 0.75; }
      if (atrae && d < (a.r || 0.5) + (b.r || 0.5) + 0.3){ const vr = Math.hypot(a.polV.x - b.polV.x, a.polV.z - b.polV.z); if (vr > 1.5 || fa || fb) polChoque(a, b, vr); } } }
  for (const e of L){ if (strFuerte(e) || !e.polV) continue; const v = e.polV, sp = Math.hypot(v.x, v.z); if (sp > 14){ v.x *= 14 / sp; v.z *= 14 / sp; }
    e.g.position.x += v.x * dt; e.g.position.z += v.z * dt; v.multiplyScalar(Math.exp(-dt * 1.6)); const c = clampArena(ingV.set(e.g.position.x, 0, e.g.position.z), ARENA - 0.4); e.g.position.x = c.x; e.g.position.z = c.z; }
  for (let i = na; i < POL.auras.length; i++) POL.auras[i].visible = false;
  for (let i = nc; i < POL.arcos.length; i++) POL.arcos[i].c.m.visible = false;
  if (P_ && (P_.t -= dt) <= 0) POL.pulso = null;
}
function polRemate(f){
  const H = hero.position, x = H.x + Math.sin(f) * 1.6, z = H.z + Math.cos(f) * 1.6; if (!enemies.some(e => e.alive && e.polo)) return;
  POL.pulso = { x, z, t: 0.7, ya: new Set() }; gring(x, 0.15, z, 0xd0a0ff, 3.5, 0.4, 0.4); ringFx(x, z, 0xffffff, 3.2, 0.3, 0.35); play('polPulso');
}
function polLimpia(){ for (const s of POL.auras) s.visible = false; for (const o of POL.arcos) tintaSuelta(o.c); POL.arcos.length = 0; POL.pulso = null; for (const e of enemies){ e.polo = 0; e.poloT = 0; } }
Object.assign(SFX, {
  polMas: () => { tone({ type: 'square', f0: 660, f1: 990, dur: 0.06, vol: 0.03 }); },
  polMenos: () => { tone({ type: 'square', f0: 440, f1: 300, dur: 0.06, vol: 0.03 }); },
  polChoque: () => { noise({ dur: 0.25, vol: 0.3, f0: 3000, f1: 400, type: 'bandpass', q: 1.2 }); tone({ type: 'square', f0: 120, f1: 50, dur: 0.25, vol: 0.12 }); tone({ type: 'sawtooth', f0: 1800, f1: 200, dur: 0.15, vol: 0.04 }); },
  polPulso: () => { tone({ type: 'sine', f0: 60, f1: 160, dur: 0.4, vol: 0.3 }); noise({ dur: 0.4, vol: 0.12, f0: 200, f1: 2000, type: 'bandpass', q: 2, attack: 0.3 }); }
});
foilPoder({ id: 'foilPolaridad', ic: '🧲', name: 'Polaridad', tags: ['otaku', 'rayo'],
  desc: 'Cada golpe cuerpo a cuerpo carga al enemigo, rojo y azul por turnos. Los de distinto color se atraen y se estampan entre sí (cuanto más rápido, más daño); los del mismo se repelen. El remate tira de todos los cargados hacia el golpe.',
  dano(e, val, o, crit, melee){ if (melee && gameState === 'play' && foilEscenario()) polCarga(e); return val; },
  remate(f){ if (foilEscenario()) polRemate(f); },
  tick(dt, jugando){ if (!jugando || !foilEscenario()){ if (!foilEscenario()) polLimpia(); else for (const s of POL.auras) s.visible = s.visible && gameState === 'paused'; return; } if (dt > 0) polTick(dt); },
  limpia(){ polLimpia(); } });

/* ======================================================================
   A RITMO (rit)
   ====================================================================== */
const RIT_BEAT = 0.5, RIT_VENTANA = 0.12, RIT_ESCALA = [60, 62, 64, 67, 69, 72, 74, 76];
const RIT = { t0: 0, racha: 0, ult: -9, aro: null, meta: null, barras: null, drop: null, golpe: 0, fallo: 0, pulso: -1 };
function ritAros(){
  if (RIT.aro) return;
  const mk = (r0, r1) => { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.renderOrder = 3; m.visible = false; scene.add(m); return m; };
  RIT.aro = mk(0.94, 1); RIT.meta = mk(0.5, 0.56);
}
const ritFase = () => { const p = ((time - RIT.t0) % RIT_BEAT + RIT_BEAT) % RIT_BEAT; return Math.min(p, RIT_BEAT - p); };
function ritColor(k){ return new THREE.Color().setHSL((0.55 + k * 0.09) % 1, 0.95, 0.6); }
// al pulsar atacar: ¿a tiempo?
function ritJuzga(){
  if (time - RIT.ult < 0.22) return; RIT.ult = time;
  if (ritFase() <= RIT_VENTANA){ RIT.racha++; ritOnda(); if (RIT.racha >= 8 && !RIT.drop) ritDrop(); }
  else { if (RIT.racha > 1) play('ritFallo'); RIT.racha = 0; RIT.fallo = 0.3; }
}
function ritOnda(){
  const O = hero.position, k = RIT.racha, col = ritColor(k).getHex(); RIT.golpe = 0.2;
  tone({ type: 'triangle', f0: NOTE(RIT_ESCALA[(k - 1) % 8] + 12), dur: 0.25, vol: 0.06, rv: 0.4 }); tone({ type: 'square', f0: NOTE(RIT_ESCALA[(k - 1) % 8]), dur: 0.12, vol: 0.025 });
  ringFx(O.x, O.z, col, 0.5, 2.6 + k * 0.18, 0.3); gring(O.x, 0.5, O.z, col, 0.4, 1.8 + k * 0.12, 0.25);
  for (const e of foilEnemigos(O, 2.6 + k * 0.18)){ const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(12 + 4 * k), dx / l, dz / l, 3, null, 1); }
}
// el drop: barras de ecualizador que suben y bajan al compás por toda la arena
function ritDrop(){
  if (!RIT.barras){ const geo = new THREE.BoxGeometry(0.62, 1, 0.62); geo.translate(0, 0.5, 0); const mats = [0, 1, 2, 3, 4, 5].map(i => makeMat(ritColor(i * 1.3).getHex(), { emissive: 0.75 }));
    RIT.barras = Array.from({ length: 30 }, (_, i) => { const m = new THREE.Mesh(geo, mats[i % 6]); m.visible = false; scene.add(m); return { m, h: 0, obj: 0 }; }); }
  const O = hero.position; let i = 0;
  for (const [r, n] of [[1.8, 6], [3.3, 10], [4.9, 14]]) for (let j = 0; j < n; j++){ const a = j / n * TAU + r, b = RIT.barras[i++], x = O.x + Math.sin(a) * r, z = O.z + Math.cos(a) * r; if (Math.hypot(x, z) > ARENA - 0.4){ b.m.visible = false; b.on = false; continue; }
    b.on = true; b.lado = ((x - O.x) * (camera.position.x - O.x) + (z - O.z) * (camera.position.z - O.z)) / (r * Math.max(0.01, Math.hypot(camera.position.x - O.x, camera.position.z - O.z)));   // (las del lado de la cámara, bajitas)
    b.m.position.set(x, 0, z); b.h = 0.05; b.obj = 0.05; b.m.scale.set(1, 0.05, 1); b.m.visible = true; }
  RIT.drop = { t: 0, beat: -1 }; RIT.racha = 0; play('ritDrop'); flash('#ffffff', 0.35); shake = Math.max(shake, 0.6); lightFlash(O.x, 2, O.z, 0xff60ff, 4, 14);
}
function ritDropTick(dt){
  const D = RIT.drop; D.t += dt; const b = Math.floor((time - RIT.t0) / RIT_BEAT);
  if (b !== D.beat){ D.beat = b; const fin = D.t > RIT_BEAT * 5;
    for (const B of RIT.barras){ if (!B.on) continue; B.obj = fin ? 0 : B.lado > 0.25 ? 0.3 + rnd() * 0.7 : 0.6 + rnd() * 2.6; B.ya = false; } }
  let vivas = 0;
  for (const B of RIT.barras){ if (!B.on) continue; const sube = B.obj > B.h; B.h += (B.obj - B.h) * (1 - Math.exp(-dt * (sube ? 22 : 8))); B.m.scale.y = Math.max(0.02, B.h); if (B.h > 0.03 || B.obj > 0) vivas++;
    if (sube && B.h > 0.5 && !B.ya){ B.ya = true; const p = B.m.position;
      for (const e of foilEnemigos(p, 0.95)){ const dx = e.g.position.x - hero.position.x, dz = e.g.position.z - hero.position.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(28), dx / l, dz / l, 5, null, 1.3); burst7(PA7, e.g.position.x, 1, e.g.position.z, 6, [B.m.material.uniforms.uColor.value.getHex(), 0xffffff], 5, 0.2, 0.4, 0, 1, 0, SH7.sq, 4); } } }
  if (D.t > RIT_BEAT * 5 && !vivas){ for (const B of RIT.barras) B.m.visible = false; RIT.drop = null; }
}
function ritTick(dt){
  ritAros(); const O = hero.position, p = ((time - RIT.t0) % RIT_BEAT + RIT_BEAT) % RIT_BEAT, k = p / RIT_BEAT, col = RIT.fallo > 0 ? new THREE.Color(0x707080) : ritColor(RIT.racha);
  if (RIT.fallo > 0) RIT.fallo -= dt; if (RIT.golpe > 0) RIT.golpe -= dt;
  const hay = enemies.some(e => e.alive && e.spawnT <= 0);
  RIT.aro.visible = RIT.meta.visible = hay;
  if (hay){ const r = lerp(2.4, 0.53, k); RIT.aro.position.set(O.x, 0.06, O.z); RIT.aro.scale.setScalar(r); RIT.aro.material.color.copy(col); RIT.aro.material.opacity = 0.25 + 0.55 * k;
    RIT.meta.position.set(O.x, 0.06, O.z); RIT.meta.scale.setScalar(1 + (RIT.golpe > 0 ? RIT.golpe * 2.5 : 0)); RIT.meta.material.color.copy(col); RIT.meta.material.opacity = 0.35 + 0.4 * Math.max(0, 1 - Math.min(p, RIT_BEAT - p) / 0.1);
    const b = Math.floor((time - RIT.t0) / RIT_BEAT); if (b !== RIT.pulso){ RIT.pulso = b; play(b % 2 ? 'ritBombo' : 'ritBombo2'); } }
  if (RIT.drop) ritDropTick(dt);
}
function ritLimpia(){ if (RIT.aro){ RIT.aro.visible = RIT.meta.visible = false; } if (RIT.barras) for (const B of RIT.barras) B.m.visible = false; RIT.drop = null; RIT.racha = 0; }
const rit_doAttack = doAttack;
doAttack = function(){ if (lvl('foilRitmo') && gameState === 'play' && foilEscenario() && canAct() && !invActive) try { ritJuzga(); } catch (err) { console.error(err); } rit_doAttack(); };
Object.assign(SFX, {
  ritBombo: () => { tone({ type: 'sine', f0: 130, f1: 42, dur: 0.14, vol: 0.12 }); },
  ritBombo2: () => { tone({ type: 'sine', f0: 120, f1: 40, dur: 0.12, vol: 0.09 }); noise({ dur: 0.03, vol: 0.03, f0: 7000, type: 'highpass', when: RIT_BEAT / 2 }); },
  ritFallo: () => { tone({ type: 'sawtooth', f0: 220, f1: 160, dur: 0.15, vol: 0.04 }); },
  ritDrop: () => { tone({ type: 'sine', f0: 90, f1: 30, dur: 1.2, vol: 0.6, rv: 0.4 }); noise({ dur: 0.6, vol: 0.3, f0: 6000, f1: 300, type: 'lowpass', rv: 0.4 });
    [48, 55, 60, 64, 67, 72].forEach((n, i) => tone({ type: 'sawtooth', f0: NOTE(n), dur: 0.9, vol: 0.035, when: 0.05 + i * 0.01, rv: 0.5 })); }
});
foilPoder({ id: 'foilRitmo', ic: '🥁', name: 'A ritmo', tags: ['otaku'],
  desc: 'Un pulso marca el tiempo: un aro se cierra a tus pies en cada golpe de bombo. Si atacas justo cuando se cierra, sueltas una onda y suena una nota (cada vez la siguiente); machacar el botón rompe la racha. Ocho seguidas: ¡drop!, y el suelo se llena de barras de ecualizador que lo levantan todo.',
  tick(dt, jugando){ if (!jugando || !foilEscenario()){ if (RIT.aro && gameState !== 'paused'){ RIT.aro.visible = RIT.meta.visible = false; } return; } if (dt > 0) ritTick(dt); },
  coge(){ RIT.t0 = time; }, reset(){ RIT.racha = 0; }, limpia(){ ritLimpia(); } });

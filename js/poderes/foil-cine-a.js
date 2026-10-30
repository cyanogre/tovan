'use strict';
/* ======================================================================
   PODERES FOIL · CINE (A): referencias de películas clásicas, sobre
   foil-nucleo.js. Nada de texto en pantalla. Prefijos:
     · 88 millas por hora (Regreso al futuro) · dlr. Al rematar un combo,
       tres rayos caen detrás de Tovan, estalla una esfera de luz azul y
       sale de ella un DeLorean lanzado que cruza la arena junto a él,
       arrolla lo que pilla y desaparece en un fogonazo dejando dos surcos
       de fuego que siguen quemando.
     · Moto de luz (Tron) · trn. Si Tovan corre un momento sin parar, la
       moto de luz se forma a su alrededor (azul o roja, al azar) y deja
       un muro de neón detrás. Si lo cierra en un lazo, el suelo de dentro
       se vuelve una rejilla de luz y lo que haya dentro se desintegra en
       píxeles. Azul: el muro aparta y aturde y el disco vuelve como un
       bumerán. Roja: el muro quema y el disco rebota de enemigo en
       enemigo. Rodar = giro seco de 90°.
     · Cazafantasmas · caz. Los golpes cuerpo a cuerpo dejan a los
       enemigos pringados de ectoplasma verde. El remate saca los rayos de
       protones: los atrapa, los arrastra hasta una trampa que se abre con
       un cono de luz y se los traga.
   Los modelos se construyen la primera vez, sin rnd() al cargar.
   ====================================================================== */

/* ======================================================================
   88 MILLAS POR HORA (dlr)
   ====================================================================== */
const DLR = { coche: null, cd: 0 };
const DLR_RAYO = [0xffffff, 0x8ad8ff, 0x3a6aff, 0];
const DLR_ESFERA = foilSprite(foilLienzo(64, 64, g => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(160,220,255,0.85)'); gr.addColorStop(0.7, 'rgba(60,120,255,0.35)'); gr.addColorStop(1, 'rgba(20,40,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), true);
// el coche: cuña de acero, rejillas negras atrás, faros, pilotos, bobinas azules y el reactor de basura
function dlrModelo(){   // el coche está en js/poderes/vehiculos.js
  if (DLR.coche) return DLR.coche;
  const g = vehDelorean(); g.visible = false; scene.add(g); return (DLR.coche = g);
}
// los surcos de fuego: dos tiras en el suelo con llamas que corren
const DLR_FUEGO_VS = 'attribute float aK; varying vec2 vU; varying float vK; void main(){ vU = uv; vK = aK; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const DLR_FUEGO_FS = `uniform float uT; uniform float uA; varying vec2 vU; varying float vK;
float h(float x){ return fract(sin(x * 91.3) * 437.5); }
float r(float x){ float i = floor(x), f = fract(x); return mix(h(i), h(i + 1.0), f * f * (3.0 - 2.0 * f)); }
void main(){
  float n = r(vU.x * 26.0 - uT * 9.0) * 0.6 + r(vU.x * 61.0 + uT * 5.0) * 0.4;
  float borde = 1.0 - abs(vU.y * 2.0 - 1.0); float a = smoothstep(0.0, 0.5, borde + n * 0.4 - 0.25) * uA * (1.0 - vK * 0.6);
  vec3 c = mix(vec3(1.0, 0.25, 0.02), vec3(1.0, 0.85, 0.3), n * borde);
  gl_FragColor = vec4(c * a * 1.4, 1.0);
}`;
function dlrSurco(){
  const N = 90, g = new THREE.BufferGeometry(), idx = [], uv = new Float32Array(N * 4);
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 6), 3)); g.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(N * 2), 1));
  for (let i = 0; i < N; i++){ uv.set([i / (N - 1), 0, i / (N - 1), 1], i * 4); if (i < N - 1){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.setDrawRange(0, 0);
  const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: DLR_FUEGO_VS, fragmentShader: DLR_FUEGO_FS, uniforms: { uT: shared.uTime, uA: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  m.frustumCulled = false; m.renderOrder = 3; scene.add(m); return { m, g, pts: [], N };
}
function dlrSurcoPinta(S, dir){
  const P = S.pts, n = Math.min(P.length, S.N), pos = S.g.attributes.position.array, rx = Math.cos(dir), rz = -Math.sin(dir), w = 0.22;
  for (let i = 0; i < n; i++){ const p = P[i]; pos.set([p.x - rx * w, 0.04, p.z - rz * w, p.x + rx * w, 0.04, p.z + rz * w], i * 6); }
  S.g.setDrawRange(0, Math.max(0, n - 1) * 6); S.g.attributes.position.needsUpdate = true;
}
function dlrLanza(f){
  if (DLR.cd > 0 || !foilPuede() || !foilEscenario()) return; DLR.cd = 5;
  const car = dlrModelo(), H = hero.position, dx = Math.sin(f), dz = Math.cos(f), lx = Math.cos(f), lz = -Math.sin(f);
  const S0 = new V3(H.x - dx * 1.2 + lx * 1.6, 0, H.z - dz * 1.2 + lz * 1.6), V = 30, ya = new Set(), surcos = [dlrSurco(), dlrSurco()], rayos = [0, 1, 2, 3, 4].map(() => mtoCinta(DLR_RAYO, 'rayo'));   // (sale a tu lado y se aleja: el plano de la peli)
  const bolas = rayos.map((_, i) => { const a = i / 5 * TAU; return { x: S0.x + Math.sin(a) * 1.8, z: S0.z + Math.cos(a) * 1.8, t: 0.04 + i * 0.08 }; }), esfera = new THREE.Sprite(DLR_ESFERA); esfera.renderOrder = 7; scene.add(esfera);
  play('dlrRayos');
  foilFx.push({ t: 0, cintas: rayos, tic: 0, upd(dt){ const t = this.t;
      // 1. los rayos y la esfera de luz
      rayos.forEach((c, i) => { const b = bolas[i], k = t - b.t; if (k < 0 || k > 0.25){ c.m.visible = false; return; } c.m.visible = true;
        tintaPinta(c, rayoTiembla((s, v) => v.set(lerp(b.x, S0.x, s * s) + Math.sin(s * 9 + i) * 0.4, 14 * (1 - s) + 0.9 * s, lerp(b.z, S0.z, s * s) + Math.cos(s * 7) * 0.4), 12, 0.6), 0, 1, q => 0.6); c.mat.uniforms.uAlpha.value = 1 - k / 0.25;
        if (!b.ya){ b.ya = 1; lightFlash(b.x, 2, b.z, 0x8ad8ff, 3, 10); ringFx(b.x, b.z, 0x8ad8ff, 0.2, 1.8, 0.3); sparks(b.x, 0.2, b.z, 10, 0xbfe8ff, 6); shake = Math.max(shake, 0.2); } });
      esfera.visible = t < 0.6; if (t < 0.6){ const ke = t < 0.45 ? t / 0.45 : 1 - (t - 0.45) / 0.15; esfera.position.set(S0.x, 1, S0.z); esfera.scale.setScalar(0.3 + 3.2 * ke * ke * (1 + Math.sin(t * 60) * 0.06)); }
      if (t < 0.45){ if (dt > 0 && Math.random() < 0.7) pa(S0.x, 1, S0.z, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, Math.random() < 0.5 ? 0xffffff : 0x8ad8ff, 0.2, 0.25, 0, 3, 0, SH7.star); return true; }
      // 2. ¡ahí está! cruza a 88 millas por hora
      if (!this.sale){ this.sale = true; car.visible = true; car.rotation.set(0, f, 0); flash('#d8f0ff', 0.5); shake = Math.max(shake, 0.5); lightFlash(S0.x, 1.5, S0.z, 0x8ad8ff, 5, 14); gring(S0.x, 1, S0.z, 0xbfe8ff, 0.3, 4, 0.35, f, 1); play('dlrSale'); }
      const k = t - 0.45, d = V * k, x = S0.x + dx * d, z = S0.z + dz * d;
      if (k < 0.62){ car.position.set(x, 0.08 + Math.sin(t * 40) * 0.02, z);
        surcos.forEach((S, i) => { const s = i ? 1 : -1, px = x + lx * 0.72 * s - dx * 1.1, pz = z + lz * 0.72 * s - dz * 1.1; if (!S.pts.length || Math.hypot(px - S.pts[S.pts.length - 1].x, pz - S.pts[S.pts.length - 1].z) > 0.3) S.pts.push({ x: px, z: pz }); dlrSurcoPinta(S, f);
          if (dt > 0) pa(px, 0.2, pz, (Math.random() - 0.5) * 0.6, 1.5 + Math.random() * 2, (Math.random() - 0.5) * 0.6, Math.random() < 0.5 ? 0xff7a1a : 0xffd04a, 0.25, 0.5, -1, 1, 0, SH7.dot); });
        if (dt > 0 && Math.random() < 0.8) sparks(x - dx * 1.6, 0.3, z - dz * 1.6, 2, 0x8ad8ff, 4);
        for (const e of foilEnemigos(car.position, 1.9)){ if (ya.has(e)) continue; ya.add(e); foilGolpea(e, rdmg(70), lx * Math.sign((e.g.position.x - x) * lx + (e.g.position.z - z) * lz || 1), lz * Math.sign((e.g.position.x - x) * lx + (e.g.position.z - z) * lz || 1), 12, null, 2);
          sparks(e.g.position.x, 1, e.g.position.z, 10, 0xffffff, 6); hitStop = Math.max(hitStop, 0.04); play('dlrGolpe'); } }
      else if (!this.va){ this.va = true; car.visible = false; flash('#ffffff', 0.35); lightFlash(x, 1.5, z, 0x8ad8ff, 4, 12); gring(x, 1, z, 0xffffff, 0.3, 3.5, 0.3, f, 1); ringFx(x, z, 0x8ad8ff, 0.3, 3, 0.35); burst7(PA7, x, 1, z, 24, [0xffffff, 0x8ad8ff, 0x3a6aff], 8, 0.2, 0.4, 0, 2, 0, SH7.star); play('dlrVa'); }
      // 3. los surcos siguen ardiendo
      const fade = t > 3 ? (t - 3) / 0.8 : 0; surcos.forEach(S => { S.m.material.uniforms.uA.value = 1 - fade; });
      if ((this.tic -= dt) <= 0 && k > 0){ this.tic = 0.3; for (const S of surcos) for (let i = 0; i < S.pts.length; i += 3){ const p = S.pts[i]; for (const e of foilEnemigos(p, 0.6)){ foilGolpea(e, rdmg(8), 0, 0, 0, 'fire', 0.5); } } }
      return t < 3.8; },
    fin(){ car.visible = false; scene.remove(esfera); for (const S of surcos){ scene.remove(S.m); S.g.dispose(); S.m.material.dispose(); } } });
}
Object.assign(SFX, {
  dlrRayos: () => { for (let i = 0; i < 3; i++){ noise({ dur: 0.25, vol: 0.4, f0: 6000, f1: 800, type: 'bandpass', q: 0.8, when: 0.08 + i * 0.12, rv: 0.4 }); tone({ type: 'sawtooth', f0: 1800, f1: 200, dur: 0.12, vol: 0.06, when: 0.08 + i * 0.12 }); } },
  dlrSale: () => { tone({ type: 'sine', f0: 60, f1: 30, dur: 0.6, vol: 0.6, rv: 0.4 }); noise({ dur: 0.5, vol: 0.4, f0: 3000, f1: 300, type: 'lowpass', rv: 0.4 }); tone({ type: 'sawtooth', f0: 180, f1: 520, dur: 0.75, vol: 0.08, rv: 0.2 }); },
  dlrGolpe: () => { noise({ dur: 0.12, vol: 0.3, f0: 1200, type: 'lowpass' }); tone({ type: 'square', f0: 140, f1: 60, dur: 0.1, vol: 0.12 }); },
  dlrVa: () => { tone({ type: 'sine', f0: 900, f1: 60, dur: 0.5, vol: 0.3, rv: 0.5 }); noise({ dur: 0.4, vol: 0.35, f0: 5000, f1: 500, type: 'bandpass', rv: 0.5 }); }
});
foilPoder({ id: 'foilDelorean', ic: '🚗', name: '88 millas por hora', tags: ['otaku', 'fuego'],
  desc: 'Al rematar un combo caen tres rayos detrás de ti, estalla una esfera de luz y sale de ella un coche del tiempo lanzado que cruza la arena a tu lado, arrolla lo que pilla y desaparece en un fogonazo dejando dos surcos de fuego que siguen quemando.',
  remate(f){ dlrLanza(f); }, tick(dt){ if (DLR.cd > 0 && dt > 0) DLR.cd -= dt; }, reset(){ DLR.cd = 0; }, limpia(){ if (DLR.coche) DLR.coche.visible = false; } });

/* ======================================================================
   MOTO DE LUZ (trn)
   ====================================================================== */
const TRN_N = 200, TRN_VIDA = 4, TRN_ALTO = 0.95;
// La moto (vehTron, en js/poderes/vehiculos.js) se forma alrededor de Tovan cuando corre un rato sin parar, como el bastón de las
// películas, y sale azul o roja al azar: cada color hace cosas distintas (TRN_COL). El muro de luz sale de la cola.
const TRN_COL = {
  azul: { c: [0.08, 0.78, 1.0], hex: 0x3af0ff, hex2: 0x1a6aff, css: '#3af0ff' },   // Tron: el muro empuja y aturde; el disco vuelve como un bumerán
  rojo: { c: [1.0, 0.24, 0.04], hex: 0xff5a1a, hex2: 0xff1a0a, css: '#ff5a1a' }    // Clu: el muro quema; el disco rebota de enemigo en enemigo
};
const TRN = { pts: [], m: null, geo: null, F: null, g: null, ruedas: null, M: null, cola: null, luces: null, col: 'azul', muro: 'azul', corre: 0, fin: -99,
  discoCd: 0, disco: null, discoG: null, giro: null, giroCd: 0, lean: 0, son: null, t0: null };
const TRN_MURO_VS = 'attribute float aK; attribute float aV; varying float vK; varying float vV; void main(){ vK = aK; vV = aV; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const TRN_MURO_FS = `uniform float uT; uniform vec3 uCol; varying float vK; varying float vV;
void main(){
  float borde = smoothstep(0.86, 1.0, vV) + smoothstep(0.12, 0.0, vV) * 0.6;
  float lineas = 0.55 + 0.45 * step(0.5, fract(vV * 7.0 - uT * 0.6));
  float a = (0.35 * lineas + borde * 1.4) * (1.0 - vK * vK);
  vec3 c = mix(uCol, vec3(1.0, 1.0, 0.95), borde * 0.85);
  gl_FragColor = vec4(c * a, 1.0);
}`;
const TRN_REJILLA_FS = `uniform float uA; uniform vec3 uCol; varying vec3 vW;
void main(){ vec2 g = abs(fract(vW.xz * 1.6) - 0.5); float l = smoothstep(0.42, 0.5, max(g.x, g.y)); gl_FragColor = vec4(uCol * (0.15 + l * 1.2) * uA, 1.0); }`;
const TRN_REJILLA_VS = 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }';
const trnRGB = () => new THREE.Color().fromArray(TRN_COL[TRN.muro].c);
function trnMalla(){
  if (TRN.m) return TRN.m;
  const g = new THREE.BufferGeometry(), N = TRN_N, idx = [], V = new Float32Array(N * 2);
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 6), 3)); g.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(N * 2), 1));
  for (let i = 0; i < N; i++){ V[i * 2] = 0; V[i * 2 + 1] = 1; if (i < N - 1){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  g.setAttribute('aV', new THREE.BufferAttribute(V, 1)); g.setIndex(idx); g.setDrawRange(0, 0);
  TRN.m = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: TRN_MURO_VS, fragmentShader: TRN_MURO_FS, uniforms: { uT: shared.uTime, uCol: { value: trnRGB() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  TRN.m.frustumCulled = false; TRN.m.renderOrder = 3; scene.add(TRN.m); TRN.geo = g; return TRN.m;
}
function trnPinta(){
  const m = trnMalla(), P = TRN.pts, n = Math.min(P.length, TRN_N), pos = TRN.geo.attributes.position.array, K = TRN.geo.attributes.aK.array;
  for (let i = 0; i < n; i++){ const p = P[P.length - n + i]; pos.set([p.x, 0, p.z, p.x, TRN_ALTO, p.z], i * 6); K[i * 2] = K[i * 2 + 1] = Math.min(1, (time - p.t) / TRN_VIDA); }
  TRN.geo.setDrawRange(0, Math.max(0, n - 1) * 6); TRN.geo.attributes.position.needsUpdate = true; TRN.geo.attributes.aK.needsUpdate = true; m.visible = n > 1;
}
function trnCorta(a, b){
  const P = TRN.pts;
  for (let j = 0; j < P.length - 4; j++){ const c = P[j], d = P[j + 1];
    const r1x = b.x - a.x, r1z = b.z - a.z, r2x = d.x - c.x, r2z = d.z - c.z, den = r1x * r2z - r1z * r2x; if (Math.abs(den) < 1e-6) continue;
    const t = ((c.x - a.x) * r2z - (c.z - a.z) * r2x) / den, u = ((c.x - a.x) * r1z - (c.z - a.z) * r1x) / den;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return { j, x: a.x + r1x * t, z: a.z + r1z * t }; }
  return null;
}
function trnDentro(poly, x, z){ let s = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++){ const a = poly[i], b = poly[j]; if ((a.z > z) !== (b.z > z) && x < (b.x - a.x) * (z - a.z) / (b.z - a.z) + a.x) s = !s; } return s; }
const trnPixeles = (x, y, z, n) => { const C = TRN_COL[TRN.muro]; burst7(PA7, x, y, z, n, [C.hex, 0xffffff, C.hex2], 5, 0.16, 0.6, -2, 1.4, 0, SH7.sq, 3); };
// el muro: crece desde la cola mientras se va en moto; si se cierra un lazo, lo de dentro se desintegra
function trnTick(dt){
  const P = TRN.pts;
  while (P.length && time - P[0].t > TRN_VIDA) P.shift();
  if (TRN.F && grounded && hero.position.y < 0.2){ TRN.g.updateMatrixWorld(true); const W = TRN.cola.getWorldPosition(_fW), ult = P[P.length - 1];
    if (!ult || Math.hypot(W.x - ult.x, W.z - ult.z) > 0.3){
      const nuevo = { x: W.x, z: W.z, t: time }, corte = ult ? trnCorta(ult, nuevo) : null;
      if (corte){ const poly = [{ x: corte.x, z: corte.z }, ...P.slice(corte.j + 1).map(p => ({ x: p.x, z: p.z }))]; let A = 0;
        for (let i = 0; i < poly.length; i++){ const a = poly[i], b = poly[(i + 1) % poly.length]; A += a.x * b.z - b.x * a.z; } A = Math.abs(A) / 2;
        if (A >= 1.6 && poly.length >= 4){ trnDesintegra(poly, A); P.length = 0; } }
      P.push(nuevo); if (P.length > TRN_N) P.shift(); } }
  if (P.length > 1 || (TRN.m && TRN.m.visible)) trnPinta();
  trnMuroToca();
}
// lo que toca el muro: el azul lo aparta y lo aturde; el rojo lo quema
function trnMuroToca(){
  const P = TRN.pts, n = P.length - 3; if (n < 1) return; const azul = TRN.muro === 'azul';
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || (e.trnT || 0) > time) continue;
    const x = e.g.position.x, z = e.g.position.z, R = (e.r || 0.5) + 0.15; let best = R, bx = 0, bz = 0;
    for (let i = 0; i < n; i++){ const a = P[i], b = P[i + 1], vx = b.x - a.x, vz = b.z - a.z, L = vx * vx + vz * vz || 1e-6, k = clamp(((x - a.x) * vx + (z - a.z) * vz) / L, 0, 1), px = a.x + vx * k, pz = a.z + vz * k, d = Math.hypot(x - px, z - pz);
      if (d < best){ best = d; bx = px; bz = pz; } }
    if (best >= R) continue; const l = Math.max(0.01, Math.hypot(x - bx, z - bz)), nx = (x - bx) / l, nz = (z - bz) / l;
    if (azul){ e.trnT = time + 1.3; foilGolpea(e, rdmg(8), nx, nz, 9, 'shock', 1); if (e.alive && !foilJefe(e)) stunE(e, 1.0); }
    else { e.trnT = time + 0.7; foilGolpea(e, rdmg(24), nx, nz, 3, 'fire', 1); }
    trnPixeles(x, 0.6, z, 8); play('trnToque'); }
}
// el lazo se cierra: el suelo de dentro se vuelve rejilla, las paredes del lazo suben y todo se desintegra
function trnDesintegra(poly, A){
  const col = trnRGB(), forma = new THREE.Shape(poly.map(p => new THREE.Vector2(p.x, -p.z))), geo = new THREE.ShapeGeometry(forma); geo.rotateX(-Math.PI / 2); geo.translate(0, 0.05, 0);
  const suelo = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: TRN_REJILLA_VS, fragmentShader: TRN_REJILLA_FS, uniforms: { uA: { value: 0 }, uCol: { value: col } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  suelo.renderOrder = 2; scene.add(suelo);
  const pared = new THREE.BufferGeometry(), pos = [], kk = [], vv = [], idx = []; poly.concat([poly[0]]).forEach((p, i) => { pos.push(p.x, 0, p.z, p.x, TRN_ALTO * 1.6, p.z); kk.push(0, 0); vv.push(0, 1); if (i < poly.length){ const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
  pared.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pared.setAttribute('aK', new THREE.Float32BufferAttribute(kk, 1)); pared.setAttribute('aV', new THREE.Float32BufferAttribute(vv, 1)); pared.setIndex(idx);
  const muro = new THREE.Mesh(pared, TRN.m.material.clone()); muro.material.uniforms.uT = shared.uTime; muro.material.uniforms.uCol = { value: col }; muro.renderOrder = 3; muro.frustumCulled = false; scene.add(muro);
  let cx = 0, cz = 0; for (const p of poly){ cx += p.x; cz += p.z; } cx /= poly.length; cz /= poly.length; play('trnCierra');
  const C = TRN_COL[TRN.muro];
  foilFx.push({ t: 0, upd(){ const t = this.t;
      suelo.material.uniforms.uA.value = t < 0.4 ? t / 0.4 : Math.max(0, 1 - (t - 0.4) / 1.2); muro.scale.y = t < 0.4 ? 0.6 + t : Math.max(0.01, 1 - (t - 0.4) * 1.5);
      if (!this.boom && t >= 0.4){ this.boom = true; const dano = rdmg(30 + Math.min(70, A * 4));
        for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || !trnDentro(poly, e.g.position.x, e.g.position.z)) continue; const p = e.g.position, dx = p.x - cx, dz = p.z - cz, l = Math.max(0.01, Math.hypot(dx, dz));
          foilGolpea(e, dano, dx / l, dz / l, 3, null, 1.5); burst7(PA7, p.x, 1, p.z, 22, [C.hex, 0xffffff, C.hex2], 5, 0.18, 0.7, -2, 1.5, 0, SH7.sq, 3);
          for (let i = 0; i < 4; i++) streak7(p.x + (Math.random() - 0.5) * 0.8, 0.2, p.z + (Math.random() - 0.5) * 0.8, 0, 1, 0, 2.5, C.hex, 0.4, 0.05); }
        flash(C.css, 0.2); shake = Math.max(shake, Math.min(0.7, 0.2 + A * 0.03)); hitStop = Math.max(hitStop, 0.05); ringFx(cx, cz, C.hex, 0.3, Math.sqrt(A) * 1.2 + 1, 0.45); play('trnDerezz'); }
      return t < 1.6; }, fin(){ scene.remove(suelo); scene.remove(muro); geo.dispose(); pared.dispose(); suelo.material.dispose(); muro.material.dispose(); } });
}
/* ---------- La montura ---------- */
function trnConstruye(){ if (TRN.g) return; const v = vehTron(); Object.assign(TRN, { g: v.g, ruedas: v.ruedas, M: v.M, cola: v.cola, luces: v.luces }); v.g.visible = false; scene.add(v.g); }
function trnInvoca(forzado){   // (forzado: 'azul' | 'rojo', para probarlo desde la consola)
  if (FOILX.forma || NUCA.m || !grounded || !foilEscenario()) return false;
  trnConstruye(); const col = forzado || (rnd() < 0.5 ? 'azul' : 'rojo'), C = TRN_COL[col];
  const F = foilForma({ id: 'trn', nom: col === 'azul' ? 'MOTO DE LUZ' : 'MOTO DE LUZ ROJA', col: C.css, dur: 12, velK: 2.1, alto: 0.03,
    contacto: { r: 1.25, dmg: () => rdmg(12), cd: 0.6, knock: 7, al: e => trnPixeles(e.g.position.x, 0.8, e.g.position.z, 8) },
    ataque(){ trnDisco(); }, rodar(){ return trnGiro(); }, tick(dt){ trnMonta(dt); }, pose(){ trnPose(); }, postPose(){ trnPost(); }, fin(m){ trnFin(m); } });
  if (!F) return false;
  TRN.F = F; TRN.col = TRN.muro = col; TRN.corre = 0; TRN.pts.length = 0; TRN.giro = null; TRN.giroCd = 0; TRN.discoCd = 0.3; TRN.lean = 0;
  TRN.M.neon.uniforms.uColor.value.setHex(C.hex); for (const l of TRN.luces.slice(0, 1)) l.material.color.setHex(C.hex); if (TRN.m) TRN.m.material.uniforms.uCol.value = trnRGB();
  if (state === 'roll'){ state = 'normal'; P.body.rotation.x = 0; P.body.scale.setScalar(1); }
  TRN.g.visible = true; trnSonido(true); play('trnMonta');
  const H = hero.position; ringFx(H.x, H.z, C.hex, 0.2, 2.8, 0.45); trnPixeles(H.x, 0.7, H.z, 26); flash(C.css, 0.12);
  return true;
}
// atacar: el disco. Azul: sale recto y vuelve (pega a la ida y a la vuelta). Rojo: va de enemigo en enemigo (hasta 4) y vuelve.
function trnDiscoMalla(){
  if (TRN.discoG) return TRN.discoG; const g = new THREE.Group(), M = TRN.M;
  const aro = mesh(new THREE.TorusGeometry(0.21, 0.035, 4, 24), M.neon, 0, 0, 0, g); aro.rotation.x = Math.PI / 2;
  mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 20), M.oscuro, 0, 0, 0, g);
  const nu = mesh(new THREE.TorusGeometry(0.08, 0.018, 3, 14), M.neon, 0, 0.02, 0, g); nu.rotation.x = Math.PI / 2;
  g.visible = false; scene.add(g); return (TRN.discoG = g);
}
function trnDisco(){
  if (TRN.disco || TRN.discoCd > 0) return; const g = trnDiscoMalla(), H = hero.position, f = hero.rotation.y, azul = TRN.col === 'azul';
  const fx = { t: 0, pos: new V3(H.x + Math.sin(f) * 0.9, 1.0, H.z + Math.cos(f) * 0.9), dir: new V3(Math.sin(f), 0, Math.cos(f)), vuelta: false, ya: new Set(), golpes: 0, blanco: null,
    upd(dt){ const p = this.pos; let obj = null, v = azul ? 16 : 20;
      if (!this.vuelta){
        if (azul){ if (this.t > 0.45) this.vuelta = true; }
        else { if (!this.blanco || !this.blanco.alive){ this.blanco = trnSiguiente(p, this.ya, this.golpes ? 8 : 10); if (!this.blanco && (this.golpes || this.t > 0.45)) this.vuelta = true; }
          if (this.blanco) obj = this.blanco.g.position; } }
      if (this.vuelta){ obj = hero.position; v = 18; if (this.ya.size && !this.limpio){ this.limpio = true; if (azul) this.ya.clear(); } }
      if (obj){ this.dir.set(obj.x - p.x, 0, obj.z - p.z); const l = this.dir.length(); if (l > 0.01) this.dir.multiplyScalar(1 / l);
        if (this.vuelta && l < 0.9) return false; }
      p.addScaledVector(this.dir, v * dt); p.y = 1.0; g.position.copy(p); g.rotation.y += dt * 22;
      for (const e of enemies){ if (!e.alive || e.spawnT > 0 || this.ya.has(e)) continue; const dx = e.g.position.x - p.x, dz = e.g.position.z - p.z;
        if (Math.hypot(dx, dz) < (e.r || 0.5) + 0.45 && foilGolpea(e, rdmg(azul ? 22 : 30), this.dir.x, this.dir.z, 5, null, 1, this.ya)){ trnPixeles(e.g.position.x, 0.9, e.g.position.z, 10); play('trnPing');
          if (!azul){ this.golpes++; this.blanco = this.golpes < 4 ? trnSiguiente(p, this.ya, 8) : null; if (!this.blanco) this.vuelta = true; } } }
      if (rnd() < 0.6) pa(p.x, p.y, p.z, 0, 0, 0, TRN_COL[TRN.col].hex, 0.08, 0.25, 0, 1, 0, SH7.sq);
      return this.t < 3; },
    fin(){ g.visible = false; if (TRN.disco === fx) TRN.disco = null; } };
  g.position.copy(fx.pos); g.visible = true; TRN.disco = fx; TRN.discoCd = 0.5; foilFx.push(fx); play('trnDisco');
}
function trnSiguiente(p, ya, R){ let best = null, bd = R; for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || ya.has(e)) continue; const d = Math.hypot(e.g.position.x - p.x, e.g.position.z - p.z); if (d < bd){ bd = d; best = e; } } return best; }
// rodar: el giro seco de 90° de las películas (hacia el lado del joystick): la moto se cruza un instante y el muro hace esquina
function trnGiro(){
  if (TRN.giro || TRN.giroCd > 0 || !grounded) return true;
  const h = hero.rotation.y, da = inputMag > 0.12 ? Math.sin(inputHeading - h) : 0, lado = Math.abs(da) > 0.15 ? Math.sign(da) : (rnd() < 0.5 ? -1 : 1), dir = h + lado * Math.PI / 2;
  TRN.giro = { t: 0, S: hero.position.clone(), dir, dx: Math.sin(dir), dz: Math.cos(dir), ok: 0 }; TRN.giroCd = 0.45;
  ringFx(hero.position.x, hero.position.z, TRN_COL[TRN.col].hex, 0.2, 1.6, 0.25); play('trnGiro');
  return true;
}
function trnMonta(dt){
  const F = TRN.F; if (!F || dt <= 0) return; const H = hero.position;
  F.alto = 0.03 + 0.2 * (1 - smooth(Math.min(1, F.t / 0.25)));
  if (TRN.discoCd > 0) TRN.discoCd -= dt; if (TRN.giroCd > 0) TRN.giroCd -= dt;
  const G = TRN.giro;
  if (G){ G.t += dt; const T = 0.32, t = Math.min(G.t, T), dd = 4.2 * (t / T - 0.5 * (t / T) ** 2) * 2;
    if (mpLibre(G.S.x + G.dx * dd, G.S.z + G.dz * dd, 0.4)) G.ok = dd;
    H.x = G.S.x + G.dx * G.ok; H.z = G.S.z + G.dz * G.ok; heading = hero.rotation.y = G.dir; MOV11.vx = G.dx * 7; MOV11.vz = G.dz * 7;
    if (G.t >= T) TRN.giro = null; }
}
function trnPose(){
  const F = TRN.F; if (!F) return; const k = Math.min(1, F.t / 0.2);
  P.hips.position.y = 0.67;
  for (const [L, s] of [[P.legL, -1], [P.legR, 1]]){ bl(L.hip.rotation, 'x', -1.25, k); bl(L.hip.rotation, 'z', 0.3 * s, k); bl(L.knee.rotation, 'x', 1.5, k); }
  for (const [A, s] of [[P.armL, -1], [P.armR, 1]]){ bl(A.sh.rotation, 'x', -1.7, k); bl(A.sh.rotation, 'y', 0, k); bl(A.sh.rotation, 'z', 0.15 * s, k); bl(A.el.rotation, 'x', -0.25, k); bl(A.el.rotation, 'z', 0, k); }
  bl(P.spine.rotation, 'x', 1.0, k); bl(P.spine.rotation, 'y', 0, k); bl(P.neck.rotation, 'x', -0.9, k); bl(P.neck.rotation, 'y', 0, k);   // tumbado, como en la peli
  P.body.rotation.z = TRN.lean;
}
function trnPost(){
  const F = TRN.F; if (!F) return; const g = TRN.g, H = hero.position, f = hero.rotation.y, sc = hero.scale.x;
  TRN.lean = lerp(TRN.lean, TRN.giro ? 0 : clamp(MOV11.bank * 2.4, -0.6, 0.6), 0.25);
  g.position.set(H.x + Math.sin(f) * 0.2 * sc, H.y, H.z + Math.cos(f) * 0.2 * sc); g.rotation.set(0, f, TRN.lean); g.scale.setScalar(sc);
  const d = TRN.t0 == null ? 0 : clamp(time - TRN.t0, 0, 0.1); TRN.t0 = time; const v = Math.hypot(MOV11.vx, MOV11.vz);
  for (const w of TRN.ruedas) w.rotation.x += v * d / VEH_TRON.r;
}
function trnFin(m){
  TRN.F = null; TRN.fin = time; TRN.giro = null; trnSonido(false);
  P.legL.hip.rotation.z = P.legR.hip.rotation.z = 0; P.body.rotation.x = 0; P.body.rotation.z = 0;
  if (!TRN.g) return; TRN.g.visible = false;
  if (gameState === 'play'){ const H = hero.position; trnPixeles(H.x, 0.6, H.z, 30); ringFx(H.x, H.z, TRN_COL[TRN.col].hex, 0.4, 2.2, 0.35); play('trnSale'); }
}
// el zumbido de la moto: dos osciladores por un paso bajo, más agudo con la velocidad (callado en pausa o sin efectos)
function trnSonido(on){
  if (!actx) return;
  if (on && !TRN.son){ try { const o1 = actx.createOscillator(), o2 = actx.createOscillator(), lp = actx.createBiquadFilter(), g = actx.createGain();
      o1.type = 'sawtooth'; o2.type = 'triangle'; o1.frequency.value = 140; o2.frequency.value = 210; lp.type = 'lowpass'; lp.frequency.value = 1400; lp.Q.value = 4; g.gain.value = 0;
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(sfxBus); o1.start(); o2.start(); TRN.son = { o1, o2, lp, g }; } catch (err) {} }
  else if (!on && TRN.son){ const s = TRN.son; TRN.son = null; try { const t = actx.currentTime; s.g.gain.setTargetAtTime(0, t, 0.08); s.o1.stop(t + 0.5); s.o2.stop(t + 0.5); } catch (err) {} }
}
function trnSonidoTick(){
  const s = TRN.son; if (!s || !actx) return;
  const t = actx.currentTime, k = clamp(Math.hypot(MOV11.vx, MOV11.vz) / 7, 0, 1.4), on = sfxOn && gameState === 'play', f = 120 + 150 * k + 6 * Math.sin(time * 23);
  s.o1.frequency.setTargetAtTime(f, t, 0.05); s.o2.frequency.setTargetAtTime(f * 1.5, t, 0.05); s.lp.frequency.setTargetAtTime(900 + 1500 * Math.min(1.4, k), t, 0.08);
  s.g.gain.setTargetAtTime(on ? 0.02 + 0.018 * Math.min(1, k) : 0, t, 0.06);
}
function trnLimpia(){ TRN.pts.length = 0; if (TRN.m) TRN.m.visible = false; trnSonido(false); if (TRN.g && !TRN.F) TRN.g.visible = false; if (TRN.discoG && !TRN.disco) TRN.discoG.visible = false; TRN.corre = 0; }
Object.assign(SFX, {
  trnCierra: () => { tone({ type: 'sawtooth', f0: 220, f1: 880, dur: 0.38, vol: 0.06, rv: 0.3 }); tone({ type: 'square', f0: 440, f1: 1760, dur: 0.38, vol: 0.03, rv: 0.3 }); },
  trnDerezz: () => { for (let i = 0; i < 10; i++) tone({ type: 'square', f0: NOTE(96 - i * 3 + (i % 2) * 7), dur: 0.05, vol: 0.04, when: i * 0.03 }); noise({ dur: 0.35, vol: 0.25, f0: 5000, f1: 300, type: 'bandpass', rv: 0.3 }); tone({ type: 'sine', f0: 100, f1: 40, dur: 0.4, vol: 0.35 }); },
  trnMonta: () => { for (let i = 0; i < 6; i++) tone({ type: 'square', f0: NOTE(64 + i * 4), dur: 0.06, vol: 0.035, when: i * 0.035 }); tone({ type: 'sawtooth', f0: 90, f1: 300, dur: 0.5, vol: 0.06, rv: 0.3 }); },
  trnSale: () => { for (let i = 0; i < 6; i++) tone({ type: 'square', f0: NOTE(88 - i * 4), dur: 0.05, vol: 0.03, when: i * 0.03 }); noise({ dur: 0.3, vol: 0.08, f0: 4000, f1: 600, rv: 0.2 }); },
  trnGiro: () => { tone({ type: 'sawtooth', f0: 520, f1: 260, dur: 0.16, vol: 0.05, rv: 0.2 }); noise({ dur: 0.14, vol: 0.06, f0: 3000, f1: 1200, q: 4 }); },
  trnDisco: () => { noise({ dur: 0.3, vol: 0.06, f0: 1800, f1: 4200, q: 3, rv: 0.2 }); tone({ type: 'triangle', f0: 880, f1: 1320, dur: 0.2, vol: 0.03 }); },
  trnPing: () => { tone({ type: 'square', f0: 1760, f1: 2200, dur: 0.06, vol: 0.04, rv: 0.3 }); tone({ type: 'sine', f0: 220, f1: 110, dur: 0.15, vol: 0.12 }); },
  trnToque: () => { noise({ dur: 0.1, vol: 0.06, f0: 2600, f1: 900, q: 2 }); }
});
foilPoder({ id: 'foilTron', ic: '🏍️', name: 'Moto de luz', tags: ['otaku', 'rayo'],
  desc: 'Corre un momento sin parar y la moto de luz se forma a tu alrededor (12 s), azul o roja al azar, dejando un muro de neón detrás. Si cierras un lazo, lo de dentro se desintegra. Azul: el muro aparta y aturde, y el disco (atacar) vuelve como un bumerán. Roja: el muro quema y el disco rebota de enemigo en enemigo. Rodar = giro seco de 90°.',
  tick(dt, jugando){ if (!jugando || !foilEscenario()){ if (!foilEscenario() || !strEnJuego()){ TRN.pts.length = 0; if (TRN.m) TRN.m.visible = false; } return; }
    trnSonidoTick(); if (dt <= 0) return;
    if (!TRN.F){ const corre = grounded && state === 'normal' && inputMag > 0.5 && !FOILX.forma; TRN.corre = corre ? TRN.corre + dt : 0;
      if (TRN.corre > 1.1 && time - TRN.fin > 7) trnInvoca(); }
    trnTick(dt); },
  reset(){ TRN.fin = -99; TRN.corre = 0; }, limpia(){ trnLimpia(); } });

/* ======================================================================
   CAZAFANTASMAS (caz)
   ====================================================================== */
const CAZ = { cd: 0, babas: [], trampa: null, cono: null };
const CAZ_RAYO = [0xffffff, 0xff8a2a, 0x3a6aff, 0];
const CAZ_BABA = foilSprite(foilLienzo(64, 64, g => { const gr = g.createRadialGradient(32, 32, 4, 32, 32, 30); gr.addColorStop(0, 'rgba(220,255,160,0.95)'); gr.addColorStop(0.45, 'rgba(120,255,60,0.6)'); gr.addColorStop(1, 'rgba(40,200,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }), true);
const CAZ_CONO_FS = 'uniform float uA; uniform float uT; varying vec2 vU; void main(){ float a = pow(1.0 - vU.y, 1.3) * (0.7 + 0.3 * sin(vU.x * 40.0 + uT * 20.0)) * uA; gl_FragColor = vec4(vec3(0.85, 0.95, 1.0) * a, 1.0); }';
function cazTrampa(){
  if (CAZ.trampa) return CAZ.trampa;
  const gris = makeMat(0x3a3a42, { emissive: 0.15 }), amarillo = makeMat(0xffd21e, { emissive: 0.4 }), negro = makeMat(0x16161a), metal = makeMat(0x9a9aa4, { emissive: 0.2 }), rojo = makeMat(0xff2020, { emissive: 1 });
  const g = new THREE.Group(), src = new THREE.Group();
  mesh(B(0.78, 0.16, 0.5), gris, 0, 0.08, 0, src); for (const z of [-0.26, 0.26]) mesh(B(0.8, 0.06, 0.04), amarillo, 0, 0.13, z, src); for (const x of [-0.24, 0, 0.24]) mesh(B(0.08, 0.061, 0.044), negro, x, 0.13, 0.26, src);
  mesh(B(0.1, 0.07, 0.07), rojo, 0.34, 0.2, 0.2, src); mpFusiona(src, g);
  g.userData.puertas = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(s * 0.37, 0.17, 0); g.add(piv); mesh(B(0.36, 0.04, 0.46), metal, -s * 0.18, 0, 0, piv); return piv; });
  const cono = new THREE.Mesh((() => { const c = new THREE.CylinderGeometry(1.0, 0.26, 4.5, 20, 1, true); c.translate(0, 2.25, 0); return c; })(),
    new THREE.ShaderMaterial({ vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: CAZ_CONO_FS, uniforms: { uA: { value: 0 }, uT: shared.uTime }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  cono.renderOrder = 5; g.add(cono); g.userData.cono = cono; g.visible = false; scene.add(g); return (CAZ.trampa = g);
}
function cazBaba(i){ let s = CAZ.babas[i]; if (!s){ s = new THREE.Sprite(CAZ_BABA); s.renderOrder = 6; scene.add(s); CAZ.babas.push(s); } return s; }
function cazBabasTick(dt){
  let n = 0;
  for (const e of enemies){ if (!e.alive || !(e.cazT > 0)) continue; e.cazT -= dt; if (e.cazT <= 0) continue; const s = cazBaba(n++), p = e.g.position;
    s.visible = true; s.position.set(p.x, Math.min(2.2, (e.numY || 1.4) * 0.55), p.z); s.scale.setScalar((e.r || 0.5) * 3.4 * (0.9 + 0.1 * Math.sin(time * 9 + n)));
    if (dt > 0 && Math.random() < dt * 3) pa(p.x + (Math.random() - 0.5) * 0.6, (e.numY || 1.4) * 0.7, p.z + (Math.random() - 0.5) * 0.6, 0, -0.5, 0, 0x9aff4a, 0.12, 0.6, 6, 0, 0, SH7.dot); }
  for (let i = n; i < CAZ.babas.length; i++) CAZ.babas[i].visible = false;
}
// el remate: rayos de protones a los pringados, se los lleva a la trampa y la trampa se los traga
function cazCaza(f){
  if (CAZ.cd > 0 || !foilPuede() || !foilEscenario()) return; const H = hero.position;
  const L = enemies.filter(e => e.alive && e.spawnT <= 0 && e.cazT > 0 && Math.hypot(e.g.position.x - H.x, e.g.position.z - H.z) < 10).slice(0, 5); if (!L.length) return;
  CAZ.cd = 3.5; const T = clampArena(new V3(H.x + Math.sin(f) * 3, 0, H.z + Math.cos(f) * 3), ARENA - 0.8), tr = cazTrampa(), cono = tr.userData.cono, P_ = tr.userData.puertas;
  tr.visible = true; tr.position.copy(H); tr.rotation.y = f; P_.forEach(p => { p.rotation.z = 0; }); cono.material.uniforms.uA.value = 0;
  const pres = L.map(e => ({ e, c: [mtoCinta(CAZ_RAYO, 'rayo'), mtoCinta(CAZ_RAYO, 'rayo')], o: e.g.position.clone(), fuerte: strFuerte(e), dentro: false }));
  for (const p of pres) if (!p.fuerte) p.e.cazAgarre = p;
  play('cazProton');
  foilFx.push({ t: 0, cintas: pres.flatMap(p => p.c), tic: 0, upd(dt){ const t = this.t, mano = hero.position.clone().add(xtrV.set(Math.sin(hero.rotation.y) * 0.5, 1.1, Math.cos(hero.rotation.y) * 0.5));
      // la trampa sale deslizando hasta su sitio
      const kt = Math.min(1, t / 0.35); tr.position.set(lerp(H.x, T.x, kt), Math.sin(kt * Math.PI) * 0.6, lerp(H.z, T.z, kt)); tr.rotation.y += dt * (kt < 1 ? 14 : 0);
      // los rayos: de la mano a cada uno, temblando; los arrastran hacia la trampa y los levantan
      for (const p of pres){ const e = p.e, vivo = e.alive && t < 1.7;
        p.c.forEach((c, i) => { c.m.visible = vivo; if (!vivo) return; const de = mano, a = e.g.position.clone().setY(Math.min(1.4, (e.numY || 1.4) * 0.6));
          tintaPinta(c, rayoTiembla((s, v) => v.lerpVectors(de, a, s).add(xtrW.set(0, Math.sin(s * Math.PI) * (0.4 + i * 0.2), 0)), 9, 0.25 + i * 0.12), 0, 1, q => 0.18 - i * 0.06); c.mat.uniforms.uAlpha.value = 1; });
        if (!vivo || p.fuerte) continue; const k = clamp((t - 0.3) / 1.0, 0, 1), dx = T.x - p.o.x, dz = T.z - p.o.z;
        e.g.position.x = p.o.x + dx * smooth(k); e.g.position.z = p.o.z + dz * smooth(k); p.y = Math.sin(k * Math.PI) * 1.2 + (t > 1.25 ? (t - 1.25) * 9 : 0); e.g.rotation.y += dt * 6;
        if (t > 1.25) e.g.scale.setScalar(e.scale * Math.max(0.05, 1 - (t - 1.25) * 2)); }
      if ((this.tic -= dt) <= 0 && t < 1.7){ this.tic = 0.4; for (const p of pres) if (p.e.alive) foilGolpea(p.e, rdmg(12), 0, 0, 0, null, 0.3); if (t > 0.1) play('cazChispa'); }
      // la trampa se abre con el cono de luz y se los traga
      if (t > 1.0 && t < 1.8){ P_.forEach((p, i) => { p.rotation.z = (i ? -1 : 1) * Math.min(1.6, (t - 1.0) * 8); }); cono.material.uniforms.uA.value = 0.6 * Math.min(1, (t - 1.0) * 5) * (t > 1.6 ? Math.max(0, 1 - (t - 1.6) * 5) : 1); if (!this.abre){ this.abre = true; play('cazAbre'); } }
      if (!this.traga && t >= 1.7){ this.traga = true; for (const p of pres){ const e = p.e; if (e.cazAgarre === p) e.cazAgarre = null; e.g.scale.setScalar(e.scale); if (!e.alive) continue;
          if (p.fuerte) foilGolpea(e, rdmg(90), 0, 0, 4, null, 1.5); else { e.g.position.set(T.x, 0, T.z); foilGolpea(e, Math.max(rdmg(150), Math.ceil(e.hp * 1.3 + 5)), 0, 0, 0, null, 2); } }
        flash('#e8f4ff', 0.3); shake = Math.max(shake, 0.4); ringFx(T.x, T.z, 0xbfe0ff, 0.2, 2.4, 0.35); burst7(PA7, T.x, 0.6, T.z, 20, [0xffffff, 0xbfe0ff, 0x9aff4a], 4, 0.2, 0.5, 0, 2, 0, SH7.star); play('cazCierra'); }
      if (t > 1.8){ P_.forEach(p => { p.rotation.z = 0; }); if (dt > 0 && Math.random() < 0.3) puffAt(T.x, T.z, 1, 0.3, 0xd0d0d0); }
      return t < 3; },
    fin(){ tr.visible = false; cono.material.uniforms.uA.value = 0; for (const p of pres){ if (p.e.cazAgarre === p) p.e.cazAgarre = null; p.e.g.scale.setScalar(p.e.scale); } } });
}
// los atrapados no piensan; su altura la ponen los rayos
const caz_updateEnemy = updateEnemy;
updateEnemy = function(e, dt){ const A = e.cazAgarre; if (A && e.alive && e.dying <= 0){ e.vx = e.vz = 0; if (e.flash > 0) e.flash -= dt; if (e.tele) e.tele.visible = false; applyFlash(e); e.g.position.y = A.y || 0; return; } caz_updateEnemy(e, dt); };
Object.assign(SFX, {
  cazProton: () => { tone({ type: 'sawtooth', f0: 70, f1: 420, dur: 0.6, vol: 0.12, attack: 0.2, rv: 0.3 }); tone({ type: 'square', f0: 140, f1: 840, dur: 0.6, vol: 0.04, attack: 0.2 }); noise({ dur: 1.5, vol: 0.12, f0: 3000, q: 2, attack: 0.3, rv: 0.2 }); },
  cazChispa: () => { noise({ dur: 0.06, vol: 0.12, f0: 4500, type: 'highpass' }); },
  cazAbre: () => { noise({ dur: 0.6, vol: 0.25, f0: 300, f1: 4000, type: 'bandpass', q: 1, rv: 0.5 }); [72, 79, 84].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.6, vol: 0.05, when: i * 0.05, rv: 0.6 })); },
  cazCierra: () => { tone({ type: 'square', f0: 320, f1: 120, dur: 0.08, vol: 0.12 }); noise({ dur: 0.2, vol: 0.3, f0: 1500, type: 'lowpass' }); tone({ type: 'sine', f0: 880, dur: 0.08, vol: 0.05, when: 0.15 }); tone({ type: 'sine', f0: 880, dur: 0.08, vol: 0.05, when: 0.35 }); }
});
foilPoder({ id: 'foilCazafantasmas', ic: '👻', name: 'Cazafantasmas', tags: ['otaku', 'rayo'],
  desc: 'Tus golpes cuerpo a cuerpo dejan a los enemigos pringados de ectoplasma verde. Al rematar un combo sacas los rayos de protones: atrapas a los pringados, los arrastras hasta una trampa que se abre con un cono de luz y se los traga.',
  dano(e, val, o, crit, melee){ if (melee && gameState === 'play' && e.alive) e.cazT = 7; return val; },
  remate(f){ cazCaza(f); },
  tick(dt, jugando){ if (CAZ.cd > 0 && dt > 0) CAZ.cd -= dt; if (jugando && foilEscenario()) cazBabasTick(dt); else for (const s of CAZ.babas) s.visible = s.visible && gameState === 'paused'; },
  limpia(){ for (const s of CAZ.babas) s.visible = false; if (CAZ.trampa) CAZ.trampa.visible = false; for (const e of enemies){ e.cazT = 0; e.cazAgarre = null; } } });

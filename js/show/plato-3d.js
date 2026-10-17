'use strict';
/* ======================================================================
   EL SHOW EN 3D (2026-10): los programas de Míster Confianza dejan el
   lienzo pixelado de 320×180 y pasan al mundo 3D, con el Tovan de
   verdad y sus controles de siempre (J golpe, K esquiva, Espacio salto,
   L especial), en un plató: suelo de escenario, pantalla gigante con su
   cara, focos que barren, gradas con público y neones.
   - SH3: estado común (plató montado, cámara, interfaz, programa activo).
   - Cada programa es un objeto como los de MG_GAMES (overlay: false):
     start, upd, finish, end. El director (show/director.js) no cambia:
     sigue llevando las rondas por la vida del jefe (MG_THR).
   - El plató se construye la primera vez con su propio PRNG: nada de
     rnd() al cargar. Al montarlo se ocultan el bioma y sus partículas y
     se cambian cielo, niebla y luz; al acabar el show se devuelve todo.
   ====================================================================== */
const SH3 = { built: false, montado: false, cam: null, prog: null, prev: null, set: null, haces: [], gente: [], tgrande: 0, tanuncio: 0, pantalla: null, pTex: null, pT: 0, pRot: 0, signos: null };

/* ---------- Plató ---------- */
function sh3Lienzo(w, h, pinta){ const c = document.createElement('canvas'); c.width = w; c.height = h; pinta(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.userData = { c }; return t; }
function sh3Construye(){
  if (SH3.built) return; SH3.built = true;
  const R = mulberry32(2020), r = () => R(), g = SH3.set = new THREE.Group(); g.visible = false; scene.add(g);
  // suelo: el del estudio, oscuro, y el escenario redondo con su estrella y sus anillos
  const sueloTex = sh3Lienzo(512, 512, (x, w) => {
    const gr = x.createRadialGradient(w / 2, w / 2, 20, w / 2, w / 2, w / 2); gr.addColorStop(0, '#3a1d63'); gr.addColorStop(0.7, '#241040'); gr.addColorStop(1, '#160a2a'); x.fillStyle = gr; x.fillRect(0, 0, w, w);
    x.strokeStyle = 'rgba(255,210,58,.5)'; x.lineWidth = 3; for (const rr of [70, 150, 235]){ x.beginPath(); x.arc(w / 2, w / 2, rr, 0, TAU); x.stroke(); }
    x.strokeStyle = 'rgba(160,120,255,.18)'; x.lineWidth = 2; for (let k = 0; k < 16; k++){ const a = k / 16 * TAU; x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * 70, w / 2 + Math.sin(a) * 70); x.lineTo(w / 2 + Math.cos(a) * 250, w / 2 + Math.sin(a) * 250); x.stroke(); }
    x.save(); x.translate(w / 2, w / 2); x.fillStyle = '#ffd23a'; x.beginPath(); for (let k = 0; k < 10; k++){ const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 26 : 62; x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } x.closePath(); x.fill(); x.restore(); });
  sueloTex.anisotropy = 4;
  const piso = mesh(new THREE.CircleGeometry(9.2, 56), makeMat(0xffffff, { map: sueloTex }), 0, 0.01, 0, g); piso.rotation.x = -Math.PI / 2;
  const fuera = mesh(new THREE.CircleGeometry(48, 24), makeMat(0x0e0818), 0, -0.02, 0, g); fuera.rotation.x = -Math.PI / 2;
  const borde = mesh(new THREE.TorusGeometry(9.2, 0.09, 4, 64), makeMat(0xffd23a, { emissive: 1 }), 0, 0.03, 0, g); borde.rotation.x = Math.PI / 2;
  { const q = new THREE.Group(), bm = makeMat(0xfff2c0, { emissive: 1 }), bg = new THREE.IcosahedronGeometry(0.09, 0);   // bombillas del borde
    for (let k = 0; k < 48; k++){ const a = k / 48 * TAU; mesh(bg, bm, Math.cos(a) * 9.45, 0.08, Math.sin(a) * 9.45, q); } mpFusiona(q, g); }
  // pantalla gigante con su cara (se repinta: parpadea «EN DIRECTO» y corre el rótulo)
  SH3.pTex = sh3Lienzo(512, 288, () => {}); SH3.pTex.magFilter = THREE.NearestFilter;
  const pan = new THREE.Group(); pan.position.set(0, 5.4, -12.5); g.add(pan); SH3.pantalla = pan;
  mesh(B(15.2, 8.9, 0.4), makeMat(0x0a0a14), 0, 0, -0.25, pan);
  mesh(new THREE.PlaneGeometry(14.4, 8.1), makeMat(0xffffff, { map: SH3.pTex, emissive: 1 }), 0, 0, 0, pan);
  { const q = new THREE.Group(), bm = makeMat(0xffe9a0, { emissive: 1 }), bg = new THREE.IcosahedronGeometry(0.11, 0);
    for (let k = 0; k <= 30; k++){ const u = -7.5 + k * 0.5; mesh(bg, bm, u, 4.3, 0.05, q); mesh(bg, bm, u, -4.3, 0.05, q); }
    for (let k = 0; k <= 16; k++){ const v = -4.3 + k * 8.6 / 16; mesh(bg, bm, -7.5, v, 0.05, q); mesh(bg, bm, 7.5, v, 0.05, q); } mpFusiona(q, pan); }
  // torres de focos y haces que barren
  const metal = makeMat(0x3a3450), haz = makeMat(0xfff0c0, { emissive: 1, opacity: 0.1, side: THREE.DoubleSide });
  haz.transparent = true; haz.depthWrite = false; haz.blending = THREE.AdditiveBlending;
  for (const [tx, tz] of [[-12.5, -9], [12.5, -9], [-14, 3], [14, 3]]){
    const q = new THREE.Group(); for (let k = 0; k < 4; k++) mesh(B(0.12, 13, 0.12), metal, tx + (k & 1 ? 0.5 : -0.5), 6.5, tz + (k & 2 ? 0.5 : -0.5), q);
    for (let y = 1; y < 13; y += 1.5){ mesh(B(1.1, 0.08, 0.08), metal, tx, y, tz - 0.5, q); mesh(B(1.1, 0.08, 0.08), metal, tx, y, tz + 0.5, q); } mpFusiona(q, g); }
  for (let k = 0; k < 6; k++){ const p = new THREE.Group(); p.position.set(-10 + k * 4, 13.5, -4 + (k % 2) * 5); g.add(p);
    mesh(C(0.35, 0.5, 0.6, 8), metal, 0, 0, 0, p);
    const h = mesh(new THREE.ConeGeometry(2.2, 13.5, 20, 1, true), haz, 0, -6.9, 0, p); h.renderOrder = 2;
    SH3.haces.push({ p, ph: r() * TAU, sp: 0.4 + r() * 0.5 }); }
  // gradas con público (fundidas por color) y barras luminosas que se mueven
  const cols = [0x2a1a4a, 0x3a1a3a, 0x1a2a4a, 0x4a2a2a, 0x24243a].map(c => makeMat(c)), piel = makeMat(0x8a6a5a), palo = makeMat(0xff6ad8, { emissive: 1 }), palo2 = makeMat(0x6ad8ff, { emissive: 1 });
  for (const s of [-1, 1]){
    const q = new THREE.Group(), lz = new THREE.Group(); g.add(lz); SH3.gente.push(lz);
    for (let fila = 0; fila < 4; fila++){ mesh(B(9, 0.6, 1.2), metal, s * (13 + fila * 1.1), fila * 0.6 + 0.3, -3, q).rotation.y = s * 0.35;
      for (let k = 0; k < 9; k++){ const z = -7 + k * 1.05 + fila * 0.4 * s, x = s * (12.6 + fila * 1.1) + (k - 4) * 0.42 * s * 0.35, y = fila * 0.6 + 0.6;
        const cm = cols[Math.floor(r() * cols.length)]; mesh(B(0.5, 0.75, 0.35), cm, x, y + 0.38, z, q); mesh(new THREE.IcosahedronGeometry(0.2, 0), piel, x, y + 0.95, z, q);
        if (r() < 0.45){ const b = mesh(B(0.05, 0.55, 0.05), r() < 0.5 ? palo : palo2, x + s * -0.2, y + 1.35, z, lz); b.rotation.z = (r() - 0.5) * 0.6; } } }
    mpFusiona(q, g); }
  // neones
  const neon = (txt, col, w, h) => sh3Lienzo(w, h, (x) => { x.font = `bold ${h * 0.55}px 'Pixelify Sans', sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = col; x.shadowBlur = 18; x.fillStyle = col; x.fillText(txt, w / 2, h / 2); x.shadowBlur = 0; x.fillStyle = '#ffffff'; x.globalAlpha = 0.7; x.fillText(txt, w / 2, h / 2); });
  const n1 = mesh(new THREE.PlaneGeometry(6, 1.4), makeMat(0xffffff, { map: neon('¡CONFÍA EN MÍ!', '#ff4ab8', 512, 120), emissive: 1, opacity: 0.95 }), -10.5, 9.6, -11.8, g); n1.rotation.y = 0.35;
  const n2 = mesh(new THREE.PlaneGeometry(4, 1.3), makeMat(0xffffff, { map: neon('ON AIR', '#ff3040', 320, 104), emissive: 1, opacity: 0.95 }), 10.5, 9.6, -11.8, g); n2.rotation.y = -0.35; SH3.onair = n2;
  // signos de aviso («!» y «!!») sobre Míster Confianza
  const signo = (txt, c1, c2) => { const t = sh3Lienzo(128, 128, (x) => { x.fillStyle = c2; x.beginPath(); x.arc(64, 64, 58, 0, TAU); x.fill(); x.lineWidth = 8; x.strokeStyle = '#1a0a1a'; x.stroke();
      x.fillStyle = c1; x.font = "bold 86px 'Pixelify Sans', sans-serif"; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 64, 70); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.renderOrder = 9; s.visible = false; scene.add(s); return s; };
  SH3.signos = { uno: signo('!', '#2a0e30', '#ffd23a'), dos: signo('!!', '#ffffff', '#ff3a4a') };
}
function sh3PintaPantalla(dt){
  SH3.pT -= dt; if (SH3.pT > 0) return; SH3.pT = 0.2; SH3.pRot += 1;
  const c = SH3.pTex.userData.c, x = c.getContext('2d'), w = c.width, h = c.height;
  const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#20135a'); gr.addColorStop(1, '#0a0a2a'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
  for (let k = 0; k < 12; k++){ x.fillStyle = k % 2 ? 'rgba(255,210,58,.12)' : 'rgba(255,74,184,.10)'; x.beginPath(); x.moveTo(w / 2, h * 0.45); const a = (k / 12 + SH3.pRot * 0.01) * TAU; x.lineTo(w / 2 + Math.cos(a) * 600, h * 0.45 + Math.sin(a) * 600); x.lineTo(w / 2 + Math.cos(a + 0.26) * 600, h * 0.45 + Math.sin(a + 0.26) * 600); x.closePath(); x.fill(); }
  x.imageSmoothingEnabled = false; try { x.drawImage(starFace9(), w / 2 - 96, 18, 192, 192); } catch (err) {}
  x.fillStyle = '#d8322a'; x.fillRect(0, h - 56, w, 56); x.fillStyle = '#ffd23a'; x.fillRect(0, h - 58, w, 4);
  x.font = "bold 30px 'Pixelify Sans', sans-serif"; x.textBaseline = 'middle'; x.fillStyle = '#ffffff';
  const msg = '★ EL SHOW DE MÍSTER CONFIANZA ★ ¡EN DIRECTO! ★ ¡CONFÍA EN MÍ! ', tw = x.measureText(msg).width, off = -(SH3.pRot * 18) % tw;
  for (let k = -1; k < 3; k++) x.fillText(msg, off + k * tw, h - 28);
  if (SH3.pRot % 4 < 2){ x.fillStyle = '#ff3040'; x.fillRect(16, 14, 118, 32); x.fillStyle = '#fff'; x.font = "bold 22px 'Pixelify Sans', sans-serif"; x.fillText('● EN DIRECTO', 22, 31); }
  SH3.pTex.needsUpdate = true;
}
function sh3Monta(){
  const U = skyMat.uniforms;
  if (!SH3.montado){ sh3Construye(); SH3.montado = true;
    SH3.prev = { ARENA, amb: ambMode, fogN: shared.uFogNear.value, fogF: shared.uFogFar.value, fogC: shared.uFogCol.value.getHex(), luz: shared.uLightCol.value.clone(), ambC: shared.uAmb.value.getHex(),
      top: U.uTop.value.getHex(), mid: U.uMid.value.getHex(), hor: U.uHor.value.getHex(), moon: U.uMoonOn.value, stars: U.uStars.value, ocultos: [] }; }
  // (se repite al empezar cada programa: el canal de los marcianitos vuelve a enseñar el bioma al salir)
  const lista = [...BIOMES.map(b => b.group), ground, rune, braz, toroBig, homeGroup, renderGroup, ...brazRuins, ...mountainsList, ...ambP];
  for (const o of lista) if (o && o.visible){ o.visible = false; if (!SH3.prev.ocultos.includes(o)) SH3.prev.ocultos.push(o); }
  ambMode = null; for (const p of pickups) scene.remove(p.m); pickups.length = 0;
  ARENA = 8.6;
  U.uTop.value.setHex(0x05030c); U.uMid.value.setHex(0x0e0820); U.uHor.value.setHex(0x2a1240); U.uMoonOn.value = 0; U.uStars.value = 0;
  shared.uFogCol.value.setHex(0x120a20); shared.uFogNear.value = 26; shared.uFogFar.value = 70;
  shared.uLightCol.value.setHex(0xfff0e0); shared.uAmb.value.setHex(0x6a5a9a);
  SH3.set.visible = true; SH3.pT = 0;
  document.body.classList.add('sh3-on');
}
function sh3Desmonta(){
  if (!SH3.montado) return; SH3.montado = false;
  const P_ = SH3.prev, U = skyMat.uniforms;
  for (const o of P_.ocultos) o.visible = true;
  ambMode = P_.amb; ARENA = P_.ARENA;
  U.uTop.value.setHex(P_.top); U.uMid.value.setHex(P_.mid); U.uHor.value.setHex(P_.hor); U.uMoonOn.value = P_.moon; U.uStars.value = P_.stars;
  shared.uFogCol.value.setHex(P_.fogC); shared.uFogNear.value = P_.fogN; shared.uFogFar.value = P_.fogF; shared.uLightCol.value.copy(P_.luz); shared.uAmb.value.setHex(P_.ambC);
  SH3.set.visible = false; SH3.cam = null; for (const s of Object.values(SH3.signos)) s.visible = false;
  document.body.classList.remove('sh3-on', 'sh3-pelea', 'sh3-rpg', 'sh3-abajo'); sh3UI.hidden = true;
}
function sh3Tick(dt){
  if (!SH3.montado) return;
  sh3PintaPantalla(dt);
  for (const H of SH3.haces){ H.p.rotation.z = Math.sin(time * H.sp + H.ph) * 0.42; H.p.rotation.x = Math.cos(time * H.sp * 0.8 + H.ph) * 0.3; }
  SH3.gente.forEach((G, i) => { G.position.y = Math.abs(Math.sin(time * 6 + i)) * 0.12; });
  if (SH3.onair) SH3.onair.material.uniforms.uOpacity.value = Math.sin(time * 3) > -0.3 ? 0.95 : 0.35;
  for (const k of ['grande', 'anuncio']) if (SH3['t' + k] > 0 && (SH3['t' + k] -= dt) <= 0) s3('.s3' + k).hidden = true;   // (en tiempo de juego)
  // los dos luchadores no se meten uno dentro del otro
  if (SH3.prog && SH3.prog.lado && bossE && bossE.alive && bossE.g.visible){ const dx = hero.position.x - bossE.g.position.x, m = 1.15;
    if (Math.abs(dx) < m && hero.position.y < 1.6 && bossE.body.position.y < 1.2){ const s = Math.sign(dx) || 1, o = (m - Math.abs(dx)) / 2; hero.position.x += s * o; bossE.g.position.x -= s * o; } }
}

/* ---------- Interfaz (texto nítido, en el DOM) ---------- */
const sh3UI = document.createElement('div'); sh3UI.id = 'sh3'; sh3UI.hidden = true;
sh3UI.innerHTML = `<div class="s3barras" hidden><div class="s3lado izq"><div class="s3nom">TOVAN</div><div class="s3b"><i class="d"></i><i class="v"></i></div></div>
  <div class="s3vs"><b>VS</b><small class="s3ronda"></small></div>
  <div class="s3lado der"><div class="s3nom">MÍSTER CONFIANZA</div><div class="s3b"><i class="d"></i><i class="v"></i></div></div></div>
  <div class="s3grande" hidden><b></b><small></small></div>
  <div class="s3anuncio" hidden></div>
  <div class="s3aviso" hidden></div>
  <div class="s3teclas" hidden></div>`;
document.body.appendChild(sh3UI);
const s3 = sel => sh3UI.querySelector(sel);
function sh3Grande(txt, sub, dur, cls){ const el = s3('.s3grande'); el.querySelector('b').textContent = txt; el.querySelector('small').textContent = sub || ''; el.className = 's3grande ' + (cls || ''); el.hidden = false;
  el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; SH3.tgrande = dur || 1.6; }
function sh3Anuncio(txt, cls){ const el = s3('.s3anuncio'); el.textContent = txt; el.className = 's3anuncio ' + (cls || ''); el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
  SH3.tanuncio = 1.5; }
function sh3Aviso(txt){ const el = s3('.s3aviso'); if (!txt){ el.hidden = true; return; } el.textContent = txt; el.hidden = false; }
const TECLA3 = { J: 'J', K: 'K', E: 'Espacio', L: 'L', M: 'A / D', W: 'W / S' };
function sh3Teclas(lista){ const el = s3('.s3teclas'); if (!lista){ el.hidden = true; return; }
  const tactil = matchMedia('(pointer:coarse)').matches, nomT = { J: 'ATACAR', K: 'RODAR', E: 'SALTAR', L: 'ESPECIAL', M: 'joystick', W: 'joystick' };
  el.innerHTML = lista.map(([k, txt]) => `<span><kbd>${tactil ? nomT[k] || k : TECLA3[k] || k}</kbd>${txt}</span>`).join(''); el.hidden = false; }
function sh3Barras(on){ s3('.s3barras').hidden = !on; }
function sh3PintaBarras(){
  const b = bossE; if (!b) return; const r = Math.max(0, MG.round), top = r ? MG_THR[r - 1] : 1, bot = MG_THR[r];
  const fe = clamp((b.hp / b.maxHp - bot) / Math.max(0.01, top - bot), 0, 1), fp = clamp(player.hp / player.maxHp, 0, 1);
  const pon = (lado, f) => { const v = s3(`.s3lado.${lado} .v`), d = s3(`.s3lado.${lado} .d`); v.style.width = (f * 100).toFixed(1) + '%';
    const d0 = parseFloat(d.style.width) || 100; d.style.width = Math.max(f * 100, d0 - 0.6).toFixed(1) + '%'; };   // la barra roja baja despacio detrás
  pon('izq', fp); pon('der', fe); s3('.s3ronda').textContent = `RONDA ${r + 1} / ${MG.order.length}`;
}

/* ---------- Daño al jefe en el show (nunca por debajo del suelo de la ronda) ---------- */
function sh3Suelo(){ return bossE ? bossE.maxHp * MG_THR[Math.max(0, MG.round)] : 0; }
function sh3Dano(pct, at, txt){   // pct = % de la vida máxima (los programas que no pegan con el arma)
  const b = bossE; if (!b || !b.alive || !MG.active) return 0;
  const crit = rnd() < up.crit, v = Math.max(1, Math.round(b.maxHp * pct / 100 * mgF() * (crit ? critMul() : 1)));
  const real = Math.min(v, Math.max(0, b.hp - sh3Suelo() - 0.01)); b.hp -= real; b.flash = 0.15; stat('mgHits');
  tA.copy(at || b.g.position); tA.y = (at ? at.y : 0) + (at ? 0.6 : b.numY + 0.4); spawnNumber(tA, txt ? `${txt} ${v}` : v, crit ? 'crit' : '');
  play(crit ? 'crit' : 'hit'); player.meter = Math.min(100, player.meter + 3 * up.meterRate); return real;
}
const _hitEnemySh3 = hitEnemy;
hitEnemy = function(e, val, ...rest){
  if (SH3.prog && MG.active && e === bossE){ if (SH3.prog.vuln) val *= SH3.prog.vuln; val = Math.min(val, Math.max(0, e.hp - sh3Suelo() - 0.01)); if (val <= 0) return; }
  return _hitEnemySh3(e, val, ...rest);
};

/* ---------- Programa activo: cámara, bloqueo de acciones y bucle ---------- */
const _csCameraSh3 = csCamera;
csCamera = function(cam){ _csCameraSh3(cam); if (SH3.cam && SH3.montado && !cs.active){ try { SH3.cam(cam); } catch (err) { console.error(err); } } };
const sh3Bloquea = () => SH3.prog && SH3.prog.bloqueo && SH3.prog.bloqueo();
const _doAttackSh3 = doAttack, _doRollSh3 = doRoll, _doJumpSh3 = doJump, _doSpecialSh3 = doSpecial;
doAttack = function(...a){ if (SH3.prog && SH3.prog.btn && SH3.prog.btn('attack')) return; if (!sh3Bloquea()) return _doAttackSh3(...a); };
doRoll = function(...a){ if (SH3.prog && SH3.prog.btn && SH3.prog.btn('roll')) return; if (!sh3Bloquea()) return _doRollSh3(...a); };
doJump = function(...a){ if (SH3.prog && SH3.prog.btn && SH3.prog.btn('jump')) return; if (!sh3Bloquea()) return _doJumpSh3(...a); };
doSpecial = function(...a){ if (SH3.prog && SH3.prog.btn && SH3.prog.btn('special')) return; if (!sh3Bloquea()) return _doSpecialSh3(...a); };
// Míster Confianza durante un programa 3D: la IA es la del programa, sin frenesí ni escudo
function sh3TomaJefe(prog, ia){
  const e = bossE; if (!e) return null;
  prog.jefe0 = { upd: e.upd, fzT: e.fzT, fzM: e.fzMarks }; e.upd = ia; e.fzT = 1e9; e.fzMarks = [];
  e.g.visible = true; e.body.position.y = 0; e.body.rotation.set(0, 0, 0); e.vx = e.vz = 0; e.st = 'show3';
  if (e.parts) e.parts.forEach(p => { p.visible = false; }); if (e.beam) e.beam.visible = false;
  if (!e.phone11 && e.arms && e.arms[1].userData.el){ const ph = new THREE.Group(); ph.position.set(0, -0.48, 0.08); e.arms[1].userData.el.add(ph); mesh(B(0.14, 0.24, 0.04), phoneMat11, 0, 0, 0, ph); mesh(B(0.11, 0.19, 0.01), screenMat11, 0, 0, 0.025, ph); ph.visible = false; e.phone11 = ph; }
  return e;
}
function sh3SueltaJefe(prog){
  const e = bossE, J = prog.jefe0; prog.jefe0 = null; if (!e || !J) return;
  e.upd = J.upd; e.fzT = J.fzT; e.fzMarks = J.fzM || []; e.body.position.y = 0; e.body.rotation.set(0, 0, 0); if (e.phone11) e.phone11.visible = false; if (e.beam) e.beam.visible = false;
  for (const s of Object.values(SH3.signos || {})) s.visible = false;
}
function sh3Signo(cual, e){   // «!» (amarillo) o «!!» (rojo, esquiva o salta) sobre su cabeza; null lo quita
  if (!SH3.signos) return; for (const [k, s] of Object.entries(SH3.signos)){ s.visible = k === cual && !!e;
    if (s.visible){ s.position.set(e.g.position.x, e.body.position.y + e.numY + 0.9 + Math.abs(Math.sin(time * 9)) * 0.25, e.g.position.z); s.scale.setScalar(1.1 + 0.12 * Math.sin(time * 18)); } }
}
// poses de pelea para su modelo (las de la fase 2 + estas)
Object.assign(POSE11, {
  guardia:  { aL: [-1.1, -0.35], aR: [-1.25, 0.35], eL: [-1.4, 0.3], eR: [-1.5, -0.3], tx: 0.12, hx: 0.1, hz: 0, bx: 0, lg: [0.35, -0.25] },
  directo:  { aL: [-1.1, -0.35], aR: [-1.6, 0.1], eL: [-1.4, 0.3], eR: [0, 0], tx: 0.25, hx: 0.05, hz: 0, bx: 0, lg: [0.55, -0.5] },
  agachado: { aL: [-0.6, -0.5], aR: [-0.6, 0.5], eL: [-1.2, 0], eR: [-1.2, 0], tx: 0.5, hx: -0.3, hz: 0, bx: 0, lg: [-0.9, 0.9] },
  patada:   { aL: [0.6, -0.9], aR: [-2.2, 0.4], eL: [0, 0], eR: [0, 0], tx: -0.35, hx: -0.2, hz: 0, bx: 0.15, lg: [-1.55, 0.35] },
  golpeado: { aL: [0.5, -0.8], aR: [0.5, 0.8], eL: [-0.6, 0], eR: [-0.6, 0], tx: -0.35, hx: -0.4, hz: 0.2, bx: -0.2, lg: [-0.2, 0.3] },
  ko:       { aL: [-2.8, -0.9], aR: [-2.8, 0.9], eL: [0, 0], eR: [0, 0], tx: -0.2, hx: -0.4, hz: 0, bx: -1.45, lg: [0.4, -0.2] },
  lanza:    { aL: [-0.4, -0.35], aR: [-2.6, 0.3], eL: [0, 0], eR: [-0.4, 0], tx: -0.15, hx: -0.1, hz: 0, bx: 0, lg: [0.3, -0.3] }
});
function sh3Empieza(prog){ SH3.prog = prog; sh3Monta(); invActive = false; sh3UI.hidden = false; staffToBack(); state = 'normal'; attackW = 0; for (const q of projectiles) scene.remove(q.m); projectiles.length = 0; }
function sh3Acaba(prog){ if (SH3.prog === prog) SH3.prog = null; SH3.cam = null; sh3SueltaJefe(prog); sh3Barras(false); sh3Teclas(null); sh3Aviso(null);
  document.body.classList.remove('sh3-pelea', 'sh3-rpg', 'sh3-abajo'); }
const _v3UpdateSh3 = v3Update;
v3Update = function(dt, pdt, playing){ _v3UpdateSh3(dt, pdt, playing); try { sh3Tick(pdt); if (SH3.prog && SH3.prog.barras) sh3PintaBarras(); } catch (err) { console.error(err); } };
// al acabar el show (o salir) se recoge el plató
const _mgEndShowSh3 = mgEndShow;
mgEndShow = function(win){ if (SH3.prog && SH3.prog.end) SH3.prog.end(); _mgEndShowSh3(win); sh3Desmonta(); };
const _clearWorldSh3 = clearWorld;
clearWorld = function(){ if (SH3.prog) sh3Acaba(SH3.prog); sh3Desmonta(); _clearWorldSh3(); };
const _toTitleSh3 = toTitle;
toTitle = function(){ if (SH3.prog) sh3Acaba(SH3.prog); sh3Desmonta(); _toTitleSh3(); };

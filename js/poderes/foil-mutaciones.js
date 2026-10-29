'use strict';
/* ======================================================================
   MUTACIONES DE LOS FOIL (sobre todos los ficheros foil anteriores)
   Algunos foil se pisaban: hacían lo mismo con otra piel o se peleaban por
   la misma tecla. Si tienes los dos, se fusionan en uno nuevo que mezcla
   sus dos ideas (y los dos padres ya no vuelven a salir en el reparto):
     · Inhalar + Bola cósmica → Bola glotona · glo. La bola tiene boca:
       aspira todo lo que tiene delante y al final no sube al cielo, sale
       escupida como una estrella que rebota por la arena.
     · Bola azul + Estrella invencible → Erizo dorado · ssn. Las dos
       soltaban algo en cada golpe (anillos y monedas) y las dos te hacían
       intocable: ahora todo son anillos y con 50 te vuelves dorado (flotas,
       atropellas, atacar es un acelerón supersónico y la bola de pinchos,
       de oro, encadena hasta diez golpes) hasta que se gastan.
     · Titán + Manto de nueve colas → Titán zorro · tzo. Los dos eran «el
       especial te transforma»: ahora el titán sale con manto de chakra y
       nueve colas gigantes; cada manotazo barre con las colas a la redonda
       y el puñetazo final suelta además la bomba espiral.
     · Lluvia de tetriminós + Puerta del tesoro → Tetris del tesoro · tro.
       Los dos llovían cosas sobre los enemigos: ahora las piezas son de oro
       y caen de portales dorados, y un TETRIS abre la puerta del tesoro.
     · Burro de hormigón + Rey dragón → Burro dragón · bdr. Las dos eran una
       invocación gigante desde el cielo: el burro llega con alas de piedra,
       también con el especial, escupe fuego antes de cada bote y al
       desmoronarse suelta un megafulgor.
   Las mutaciones heredan los ganchos de sus padres (mutHereda) y cambian lo
   suyo envolviendo las funciones de los padres. Nada de texto en partida:
   la fusión se ve (dos espirales de sus colores que se juntan); en la carta
   de cada padre se avisa de con quién muta.
   ====================================================================== */
const MUT = { abs: new Set(), pend: [] }, MUT_PARES = [];
// los ganchos de los padres, juntos (las acciones se las queda el primero que la acepta; el daño pasa por los dos)
function mutHereda(ids, propio){
  const P_ = ids.map(id => FOILP.find(d => d.id === id)).filter(Boolean), h = {};
  for (const k of ['golpe', 'remate', 'tick', 'herido', 'mata', 'oleada', 'pose', 'post', 'limpia', 'reset', 'coge', 'especial', 'rodar', 'saltar', 'dano']){
    const fs = P_.filter(d => d[k]).map(d => d[k].bind(d)); if (!fs.length) continue;
    if (k === 'dano') h[k] = (e, val, ...r) => { for (const f of fs){ const v = f(e, val, ...r); if (typeof v === 'number' && isFinite(v)) val = v; } return val; };
    else if (k === 'especial' || k === 'rodar' || k === 'saltar') h[k] = (...a) => { for (const f of fs) if (f(...a)) return true; return false; };
    else if (k === 'herido') h[k] = (...a) => { let r = null; for (const f of fs) if (f(...a) === 'none') r = 'none'; return r; };
    else h[k] = (...a) => { for (const f of fs) f(...a); };
  }
  return Object.assign(h, propio);
}
function mutPoder(a, b, cols, def){
  foilPoder(def); MUT_PARES.push({ a, b, id: def.id, cols });
  const u = UPGRADES.find(x => x.id === def.id); u.req = () => false;   // nunca sale en el reparto: nace de sus dos padres
  for (const [p, otro] of [[a, b], [b, a]]){ const U = UPGRADES.find(x => x.id === p), O = UPGRADES.find(x => x.id === otro); if (!U || !O) continue;
    const r0 = U.req; U.req = () => (!r0 || r0()) && !MUT.abs.has(p) && !taken[def.id];
    U.desc += ` ⚗️ Con «${O.name}» muta en «${def.name}».`; }
}
// si ya tienes los dos padres, mutan (al elegir la carta o con foilDa)
function mutVigila(){
  for (const M of MUT_PARES){ if (!taken[M.a] || !taken[M.b] || taken[M.id]) continue;
    for (const d of FOILP) if ((d.id === M.a || d.id === M.b) && d.limpia){ try { d.limpia('mutacion'); } catch (err) { console.error(err); } }
    delete taken[M.a]; delete taken[M.b]; MUT.abs.add(M.a); MUT.abs.add(M.b); taken[M.id] = 1;
    try { UPGRADES.find(x => x.id === M.id).apply(); recountTags(); } catch (err) { console.error(err); }
    MUT.pend.push(M); }
  if (MUT.pend.length && gameState === 'play' && !player.dead && !cs.active) mutDestello(MUT.pend.shift());
}
// la fusión, sin rótulos: dos espirales de los colores de los padres suben alrededor de Tovan, se juntan y estallan
function mutDestello(M){
  const H = hero.position, c = [tintaCoge([0xffffff, M.cols[0], 0xffffff, 0], 0, 'rayo'), tintaCoge([0xffffff, M.cols[1], 0xffffff, 0], 0, 'rayo')]; play('mutFusion');
  foilFx.push({ t: 0, cintas: c, upd(){ const t = this.t, k = Math.min(1, t / 0.8), O = hero.position;
      c.forEach((C, i) => { tintaPinta(C, (s, v) => { const a = s * TAU * 2.2 + i * Math.PI + t * 6, r = 1.3 * (1 - s * 0.85); return v.set(O.x + Math.sin(a) * r, 0.1 + s * 2.6, O.z + Math.cos(a) * r); }, Math.max(0, k - 0.6), k, q => 0.25 + 0.2 * q); C.mat.uniforms.uAlpha.value = t < 0.85 ? 1 : Math.max(0, 1 - (t - 0.85) / 0.3); });
      if (!this.boom && t >= 0.8){ this.boom = true; flash('#ffffff', 0.35); shake = Math.max(shake, 0.3); burst7(PA7, O.x, 2.6, O.z, 40, [M.cols[0], M.cols[1], 0xffffff], 6, 0.18, 0.7, 2, 1.2, 0, SH7.star); ringFx(O.x, O.z, M.cols[0], 0.3, 3.5, 0.4); ringFx(O.x, O.z, M.cols[1], 0.2, 2.6, 0.35, 0.3); }
      return t < 1.2; } });
}
Object.assign(SFX, {
  bdrFuego: () => { noise({ dur: 0.7, vol: 0.3, f0: 300, f1: 1400, type: 'lowpass', attack: 0.08, rv: 0.4 }); tone({ type: 'sawtooth', f0: 80, f1: 55, dur: 0.6, vol: 0.08, rv: 0.3 }); },
  mutFusion: () => { [60, 64, 67, 71, 74, 79].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.5, vol: 0.05, when: i * 0.1, rv: 0.8 })); noise({ dur: 0.9, vol: 0.12, f0: 500, f1: 5000, type: 'bandpass', attack: 0.6, rv: 0.6 }); tone({ type: 'sine', f0: 110, f1: 40, dur: 0.6, vol: 0.4, when: 0.8, rv: 0.6 }); }
});
const mut_v3Update = v3Update;
v3Update = function(dt, pdt, playing){ mut_v3Update(dt, pdt, playing); try { mutVigila(); } catch (err) { console.error(err); } };
const mut_startRun = startRun;
startRun = function(){ MUT.abs.clear(); MUT.pend.length = 0; mut_startRun(); };

/* ======================================================================
   BOLA GLOTONA (glo) · Inhalar + Bola cósmica
   ====================================================================== */
const GLO = { boca: null, cd: 0, son: 0 };
const glo_ktmTick = ktmTick;
ktmTick = function(dt){ glo_ktmTick(dt); const F = KTM.F; if (lvl('mutGlotona') && F && !F.escena) gloAspira(dt); else if (GLO.boca && !(F && F.escupe)) GLO.boca.visible = false; };
function gloAspira(dt){
  const g = KTM.bola, R = KTM.Rv, f = hero.rotation.y, fx = Math.sin(f), fz = Math.cos(f);
  if (!GLO.boca){ GLO.boca = new THREE.Sprite(kbyBocaMat); GLO.boca.renderOrder = 7; scene.add(GLO.boca); }
  const B_ = GLO.boca; B_.visible = true; B_.position.set(g.position.x + fx * R * 0.92, g.position.y + R * 0.15, g.position.z + fz * R * 0.92); B_.scale.setScalar(R * 1.2 * (1 + Math.sin(time * 30) * 0.06));
  if (dt <= 0) return;
  for (const e of enemies){ if (!e.alive || e.spawnT > 0 || e.reach === false || strFuerte(e)) continue;   // lo de delante se arrastra hacia la boca
    const dx = g.position.x - e.g.position.x, dz = g.position.z - e.g.position.z, d = Math.hypot(dx, dz), Rr = R + 6; if (d > Rr || d < 0.01) continue;
    if ((-dx * fx - dz * fz) / d < 0.3) continue;
    const v = Math.min(d, (4 + 7 * (1 - d / Rr)) * dt); e.g.position.x += dx / d * v; e.g.position.z += dz / d * v; }
  for (let i = 0; i < 3; i++){ const a = f + (rnd() - 0.5) * 1.5, r = R + 2 + rnd() * 4, x = g.position.x + Math.sin(a) * r, z = g.position.z + Math.cos(a) * r, y = 0.3 + rnd() * R * 1.6;
    streak7(x, y, z, B_.position.x - x, B_.position.y - y, B_.position.z - z, 0.9, rnd() < 0.5 ? 0xffffff : 0xffb0d8, 0.2, 0.04, 9); }
  if ((GLO.son -= dt) <= 0){ GLO.son = 1.1; play('kbyAspira'); }
}
// al final no sube: sale escupida, rueda muy deprisa rebotando en los bordes, arrasa y estalla en estrella
const glo_ktmCielo = ktmCielo;
ktmCielo = function(F, dt){ if (!lvl('mutGlotona')) return glo_ktmCielo(F, dt); gloEscupe(F, dt); };
function gloEscupe(F, dt){
  const g = KTM.bola, H = hero.position, R = KTM.Rv;
  if (!F.escena){ F.escena = true; F.intocable = true; F.escupe = true; F.S = H.clone(); F.ya = new Set(); const f = hero.rotation.y; F.v = new V3(Math.sin(f) * 21, 0, Math.cos(f) * 21);
    play('kbyAspira'); play('ktmRueda'); shake = Math.max(shake, 0.5); flash('#ffd0ea', 0.3); if (GLO.boca) GLO.boca.visible = false; }
  H.x = F.S.x; H.z = F.S.z; MOV11.vx = MOV11.vz = 0;
  if (dt <= 0) return; const p = g.position;
  p.x += F.v.x * dt; p.z += F.v.z * dt; p.y = R;
  const d = Math.hypot(p.x, p.z), lim = Math.max(2, ARENA - R * 0.6);
  if (d > lim){ const nx = p.x / d, nz = p.z / d, dot = F.v.x * nx + F.v.z * nz; if (dot > 0){ F.v.x -= 2 * dot * nx; F.v.z -= 2 * dot * nz; shake = Math.max(shake, 0.35); play('ktmBonk'); ringFx(p.x, p.z, 0xffb0d8, 0.3, R + 2, 0.35); } p.x = nx * lim; p.z = nz * lim; }
  const sp = Math.hypot(F.v.x, F.v.z); xtrQ.setFromAxisAngle(xtrU.set(F.v.z / sp, 0, -F.v.x / sp), sp * dt / R); KTM.giro.quaternion.premultiply(xtrQ);
  for (const e of foilEnemigos(p, R + 0.3)){ if (F.ya.has(e)) continue; F.ya.add(e); const dx = e.g.position.x - p.x, dz = e.g.position.z - p.z, l = Math.max(0.01, Math.hypot(dx, dz));
    foilGolpea(e, rdmg(40 + R * 35), dx / l, dz / l, 12, null, 2); sparks(e.g.position.x, 1, e.g.position.z, 8, 0xffe060, 5); }
  for (let i = 0; i < 2; i++) pn(p.x + (rnd() - 0.5) * R, p.y + (rnd() - 0.5) * R, p.z + (rnd() - 0.5) * R, 0, 1, 0, xtrHsv(rnd()), 0.16, 0.6, 0, 1, 0, SH7.star, 1);
  if (F.t >= KTM_DUR - 0.08 && !F.boom){ F.boom = true; xtrArea(p, R + 3.2, () => rdmg(70), 10, null, 1.8); ringFx(p.x, p.z, 0xffffff, 0.4, R + 5, 0.5); ring7(PN7, p.x, 0.4, p.z, 30, [0xffe060, 0xff9ad0, 0xffffff], 9, 0.2, 0.7, 0, 2, 0, SH7.star, 3); flash('#fff4c0', 0.4); play('ktmEstrella'); }
}
const glo_ktmFin = ktmFin;
ktmFin = function(m){ if (lvl('mutGlotona')) GLO.cd = 8; if (GLO.boca) GLO.boca.visible = false; glo_ktmFin(m); };
mutPoder('foilKirby', 'foilKatamari', [0xff8ac8, 0x9ae85a], mutHereda(['foilKatamari'], { id: 'mutGlotona', ic: '👄', name: 'Bola glotona', tags: ['otaku'],
  desc: 'Mutación de Inhalar y Bola cósmica. Al empezar cada oleada (o al rematar, si descansó) empujas una bola con boca que aspira todo lo que tiene delante y se lo pega; al final sale escupida como una estrella que rebota por la arena arrasándolo todo.',
  remate(){ if (!KTM.F && GLO.cd <= 0) KTM.pend = true; }, tick(dt, j){ if (GLO.cd > 0 && dt > 0) GLO.cd -= dt; ktmVigila(dt, j); } }));

/* ======================================================================
   SUPER SONIC (ssn) · Bola azul + Estrella invencible
   Las dos soltaban algo en cada golpe (anillos y monedas) y las dos acababan
   en «nadie te toca». Juntas: solo anillos, y con 50 te vuelves dorado.
   ====================================================================== */
const SSN_ORO = [0xffe25a, 0xffd21e, 0xfff3a0, 0xffc430, 0xffeb80], SSN_RASTRO = [0xfffbe0, 0xffb81e, 0xffffff, 0];
const SSN = { F: null, pelo: false, snap: null, bola: null, drena: 0, cd: 0, arp: 0, boost: null, rastroCols: null, rastro: strRastro('snc', SSN_RASTRO, 14, true) };
// el remolino dorado de la bola (aditivo), con su propio PRNG
const ssnGiroMat = foilSprite(foilLienzo(128, 128, g => { const R = mulberry32(761); g.lineCap = 'round';
  for (let k = 0; k < 11; k++){ const r = 28 + R() * 32, a = R() * TAU, L = 1.2 + R() * 1.8; g.beginPath(); g.arc(64, 64, r, a, a + L); g.strokeStyle = k % 3 ? 'rgba(255,200,40,0.8)' : 'rgba(255,250,220,0.95)'; g.lineWidth = 3 + R() * 6; g.stroke(); } }), true);
Object.assign(SFX, {
  ssnSuper: () => { [67, 71, 74, 79, 83, 86, 91].forEach((n, i) => tone({ type: 'square', f0: NOTE(n), dur: 0.12, vol: 0.045, when: i * 0.05, rv: 0.3 })); noise({ dur: 0.8, vol: 0.2, f0: 800, f1: 6000, type: 'bandpass', attack: 0.4, rv: 0.5 }); tone({ type: 'sine', f0: 90, f1: 40, dur: 0.6, vol: 0.45, when: 0.35, rv: 0.5 }); },
  ssnBoom: () => { noise({ dur: 0.45, vol: 0.35, f0: 2400, f1: 250, type: 'lowpass', rv: 0.3 }); tone({ type: 'sawtooth', f0: 260, f1: 1300, dur: 0.18, vol: 0.06 }); tone({ type: 'sine', f0: 70, f1: 35, dur: 0.35, vol: 0.4 }); },
  ssnFin: () => { [86, 79, 74, 67, 62].forEach((n, i) => tone({ type: 'triangle', f0: NOTE(n), dur: 0.16, vol: 0.04, when: i * 0.06, rv: 0.4 })); }
});
// la bola de pinchos y su estela, en oro (y de vuelta al azul)
function ssnBola(on){
  const B = sncBolaModelo();
  if (on && !SSN.bola){ SSN.bola = []; B.traverse(o => { if (o.isSprite) o.material = ssnGiroMat; if (!o.isMesh || !o.material.uniforms) return; const c = o.material.uniforms.uColor.value, h = c.getHSL({});
      if (h.h > 0.5 && h.h < 0.75){ SSN.bola.push([c, c.getHex()]); c.setHex(h.l > 0.6 ? 0xfff09a : 0xffc21e); } }); }
  else if (!on && SSN.bola){ for (const [c, x] of SSN.bola) c.setHex(x); SSN.bola = null; B.traverse(o => { if (o.isSprite) o.material = sncGiroMat; }); }
  if (on !== !!SSN.rastroCols){ strRastroFuera(SNC.rastro); if (on){ SSN.rastroCols = SNC.rastro.cols; SNC.rastro.cols = SSN_RASTRO; } else { SNC.rastro.cols = SSN.rastroCols; SSN.rastroCols = null; } }
}
function ssnRestaura(){ if (SSN.snap){ HERO_MATS.forEach((m, i) => { m.uniforms.uColor.value.setHex(SSN.snap[i][0]); m.uniforms.uEmissive.value = SSN.snap[i][1]; }); SSN.snap = null; } ssnBola(false);
  if (SSN.pelo){ SSN.pelo = false; ssjPelo(false); } if (SSJ.aura) SSJ.aura.visible = false; }
// con 50 anillos, y sin otra forma encima
function ssnVigila(dt){
  if (SSN.cd > 0 && dt > 0) SSN.cd -= dt;
  if (SSN.F || SSN.cd > 0 || SNC.anillos < 50 || FOILX.forma || SNC.m || gameState !== 'play' || player.dead || state === 'roll' || !foilPuede() || !foilEscenario()) return;
  ssnTransforma();
}
function ssnTransforma(){
  const F = foilForma({ id: 'ssnForma', col: '#ffd21e', intocable: true, velK: 1.75, danoK: 1.6, camK: 1.08, alto: 0.2,
    empieza(){ ssjConstruye(); ssjPelo(true); SSN.pelo = true;   // el pelo de punta y el aura, los del antiguo «Pelo dorado»
      SSN.snap = HERO_MATS.map(m => [m.uniforms.uColor.value.getHex(), m.uniforms.uEmissive.value]); SSN.drena = 0; SSN.arp = 0.6; ssnBola(true);
      const O = hero.position; play('ssnSuper'); flash('#fff2a0', 0.5); shake = Math.max(shake, 0.4); hitStop = Math.max(hitStop, 0.08); lightFlash(O.x, 1.5, O.z, 0xffd060, 3.5, 12);
      ringFx(O.x, O.z, 0xffd21e, 0.4, 5.5, 0.5); ringFx(O.x, O.z, 0xffffff, 0.25, 3.5, 0.4, 0.4); gring(O.x, 0.1, O.z, 0xfff3a0, 0.4, 3.5, 0.45);
      burst7(PA7, O.x, 1, O.z, 44, SSN_ORO, 7, 0.3, 0.8, 0, 2.2, 0.3, SH7.star);
      const c = tintaCoge([0xffffff, 0xffd21e, 0xfff3a0, 0], 0, 'rayo');   // una columna de luz que sube y se apaga
      foilFx.push({ t: 0, cintas: [c], upd(){ const t = this.t, k = Math.min(1, t / 0.25), O2 = hero.position; tintaPinta(c, (s, v) => v.set(O2.x + Math.sin(s * 30 + t * 40) * 0.12, s * 9, O2.z), 0, k, q => 0.9 * (1 - q * 0.6));
          c.mat.uniforms.uAlpha.value = Math.max(0, 1 - t / 0.7); return t < 0.7; } }); },
    tick(dt){ ssnTick(this, dt); },
    ataque(){ ssnBoost(); },
    fin(m){ ssnFin(m); } });
  if (F) SSN.F = F;
}
function ssnTick(F, dt){
  const O = hero.position, paso = Math.floor(F.t / 0.06), quedan = SNC.anillos;
  const A = SSJ.aura; if (A){ A.visible = !SSN.boost && !SNC.m && !cs.active; A.position.set(O.x, O.y + (F.alto || 0) * 0.5, O.z); A.scale.set(0.85, 0.8 + 0.06 * Math.sin(time * 17), 0.85); A.material.uniforms.uTime.value = time; A.material.uniforms.uAlpha.value = quedan < 8 ? 0.35 : 0.6; }
  HERO_MATS.forEach((m, i) => { const o = SSN.snap && SSN.snap[i]; if (!o || m === M.hair) return; m.uniforms.uColor.value.copy(strCol1.setHex(o[0]).lerp(strCol2.setHex(SSN_ORO[(paso + i) % 5]), quedan < 8 && paso % 2 ? 0.35 : 0.72)); m.uniforms.uEmissive.value = Math.max(o[1], 0.5 + 0.15 * Math.sin(time * 14)); });
  F.alto = 0.2 + Math.sin(time * 3) * 0.07; ssnGiroMat.rotation = -time * 28;
  if (rnd() < dt * 40) pa(O.x + (rnd() - 0.5) * 0.9, O.y + 0.2 + rnd() * 1.4, O.z + (rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.4, 1.4 + rnd() * 1.6, (rnd() - 0.5) * 0.4, SSN_ORO[Math.floor(rnd() * 5)], 0.22, 0.5, -0.4, 1, 0.2, SH7.star);
  if (rnd() < dt * 6){ const a = rnd() * TAU, y = O.y + 0.3 + rnd() * 1.4; streak7(O.x + Math.sin(a) * 0.7, y, O.z + Math.cos(a) * 0.7, Math.sin(a + 1.6), (rnd() - 0.5) * 2, Math.cos(a + 1.6), 0.5, 0xfffbe0, 0.1, 0.03); }
  strRastroPon(SSN.rastro, O.x, O.y + 0.75, O.z, !SNC.m, 1.2, 0.8);
  SSN.arp -= dt; if (SSN.arp <= 0){ SSN.arp += 0.8; play('strArp'); }
  SSN.drena += dt; while (SSN.drena >= 0.25){ SSN.drena -= 0.25; SNC.anillos = Math.max(0, SNC.anillos - 1); }
  if (SNC.anillos <= 0 && !SNC.m && !SSN.boost){ foilFormaAcaba('anillos'); return; }
  if (SSN.boost) ssnBoostTick(dt);
  for (const e of foilEnemigos(O, 1.05)){   // a quien rozas: sale volando (a los fuertes, un buen golpe)
    const dx = e.g.position.x - O.x, dz = e.g.position.z - O.z, d = Math.max(0.01, Math.hypot(dx, dz));
    if (strFuerte(e)){ const u = F.toques.get(e); if (u != null && time - u < 0.45) continue; F.toques.set(e, time); foilGolpea(e, rdmg(46), dx / d, dz / d, 6, null, 1.2); ssnChispa(e.g.position); continue; }
    ssnVuela(e, dx / d, dz / d); }
}
function ssnChispa(p){ play('sncGolpe'); gring(p.x, 1, p.z, 0xffd21e, 0.25, 1.8, 0.3); burst7(PA7, p.x, 1.1, p.z, 12, SSN_ORO, 5, 0.25, 0.4, 0, 1.2, 0.3, SH7.star); shake = Math.max(shake, 0.2); }
function ssnVuela(e, nx, nz){
  const x = e.g.position.x, z = e.g.position.z; killEnemy(e); if (e.alive) return;
  const v = { x: nx * 9, y: 9.5, z: nz * 9, r: (rnd() < 0.5 ? -1 : 1) * 14 };
  strMuerte(e, 1.0, (q, k, dt) => { v.y -= 20 * dt; q.g.position.x += v.x * dt; q.g.position.y += v.y * dt; q.g.position.z += v.z * dt; q.g.rotation.x += v.r * dt; q.g.rotation.z += v.r * 0.4 * dt;
    if (k > 0.75) q.g.scale.setScalar(q.scale * Math.max(0.01, 1 - (k - 0.75) * 4)); });
  ssnChispa({ x, z }); sncPop(x, 1.2, z);
}
// atacar: acelerón supersónico que atraviesa todo lo que pilla (estampido al salir y al frenar)
function ssnBoost(){
  if (SSN.boost || SNC.m || !SSN.F) return; const f = inputMag > 0.12 ? inputHeading : hero.rotation.y, O = hero.position;
  SSN.boost = { t: 0, f, ya: new Set() }; heading = hero.rotation.y = f; play('ssnBoom'); play('sncSale');
  ringFx(O.x, O.z, 0xfff3a0, 0.3, 3, 0.35); gring(O.x, 0.8, O.z, 0xffffff, 0.3, 2.2, 0.25); shake = Math.max(shake, 0.3);
}
function ssnBoostTick(dt){
  const B = SSN.boost, H = hero.position; B.t += dt; MOV11.vx = MOV11.vz = 0;
  const T = 0.3, v = 30 * (1 - 0.5 * Math.min(1, B.t / T)) * dt; H.x += Math.sin(B.f) * v; H.z += Math.cos(B.f) * v;
  const r = Math.hypot(H.x, H.z), lim = ARENA - 0.35; if (r > lim){ H.x *= lim / r; H.z *= lim / r; B.t = T; }
  for (let i = 0; i < 2; i++) streak7(H.x + (rnd() - 0.5) * 0.6, H.y + 0.3 + rnd() * 0.8, H.z + (rnd() - 0.5) * 0.6, -Math.sin(B.f), 0, -Math.cos(B.f), 1.6, rnd() < 0.5 ? 0xffd21e : 0xffffff, 0.18, 0.05);
  for (const e of foilEnemigos(H, 1.5)){ if (B.ya.has(e)) continue; B.ya.add(e); const dx = e.g.position.x - H.x, dz = e.g.position.z - H.z, d = Math.max(0.01, Math.hypot(dx, dz));
    foilGolpea(e, rdmg(48), dx / d, dz / d, 12, null, 1.6); ssnChispa(e.g.position); hitStop = Math.max(hitStop, 0.03); }
  if (B.t >= T){ SSN.boost = null; ringFx(H.x, H.z, 0xffd21e, 0.3, 3.4, 0.35); burst7(PA7, H.x, 0.8, H.z, 14, SSN_ORO, 6, 0.25, 0.4, 0, 1, 0.3, SH7.star); }
}
function ssnFin(m){
  ssnRestaura(); SSN.F = null; SSN.boost = null; SSN.cd = 4; strCuerpoDevuelve();
  if (m === 'anillos' && !player.dead){ const O = hero.position; play('ssnFin'); burst7(PA7, O.x, 1, O.z, 20, SSN_ORO, 4, 0.25, 0.5, 0, 1, 0.3, SH7.star); }
}
// en el acelerón, la bola dorada (Tovan se esconde dentro, como en la bola azul)
const ssn_sncPost = sncPost;
sncPost = function(){ ssn_sncPost(); const B = SNC.bola; if (!SSN.boost || !B || gameState !== 'play' || cs.active) return;
  B.visible = true; B.position.set(hero.position.x, hero.position.y + 0.48, hero.position.z); B.rotation.y = hero.rotation.y; B.userData.gira.rotation.x = time * 40; };
const ssn_strCuerpoVer = strCuerpoVer;
strCuerpoVer = function(){ if (SSN.boost && gameState === 'play' && !cs.active && !player.dead){ if (!STR_CUERPO.oculto){ STR_CUERPO.oculto = true; P.body.visible = false; } return; } ssn_strCuerpoVer(); };
// la cadena dorada: más fuerte, más rápida y hasta diez golpes
const ssn_sncPega = sncPega;
sncPega = function(M, e){
  if (!SSN.F) return ssn_sncPega(M, e);
  const T = e.g.position, x = T.x, z = T.z; ssn_sncPega(M, e);
  if (e.alive){ const dx = x - M.S.x, dz = z - M.S.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(30), dx / l, dz / l, 3, null, 1.2); }
  ssnChispa({ x, z }); if (M.fase === 'cae' && M.n < 10){ const sig = sncSiguiente(M); if (sig){ M.fase = 'rebote'; M.seg = 0; M.y0 = hero.position.y; } }
  if (M.fase === 'cae') SNC.cd = 0.3;
};
const ssn_sncSegmento = sncSegmento;
sncSegmento = function(M, e){ ssn_sncSegmento(M, e); if (SSN.F) M.segDur *= 0.6; };
const dSonic = FOILP.find(d => d.id === 'foilSonic');
mutPoder('foilSonic', 'foilEstrella', [0x2a6aff, 0xffe23a], mutHereda(['foilSonic'], { id: 'mutSuperSonic', ic: '🌟', name: 'Erizo dorado', tags: ['otaku'],
  desc: 'Mutación de Bola azul y Estrella invencible (las dos te hacían soltar algo en cada golpe y te volvían intocable). Golpes y bajas te dan anillos; con 50 te vuelves dorado: flotas, nadie te toca, quien te roza sale volando, atacar es un acelerón supersónico que lo atraviesa todo y la bola de pinchos, de oro, encadena hasta diez golpes. Los anillos se van gastando; cuando se acaban, vuelves a ser tú.',
  mata(e){ if (gameState !== 'play') return; SNC.anillos = Math.min(999, SNC.anillos + 2); sncPop(e.g.position.x, 1.3, e.g.position.z); },
  tick(dt, jugando){ dSonic.tick(dt, jugando); if (!jugando) return; ssnVigila(dt); const O = hero.position; if (!SSN.F && SSN.rastro.h.length && dt > 0) strRastroPon(SSN.rastro, O.x, O.y + 0.75, O.z, false, 1.2, 0.8); },
  limpia(m){ dSonic.limpia(m); if (FOILX.forma && FOILX.forma.id === 'ssnForma') foilFormaAcaba('limpia'); ssnRestaura(); strRastroFuera(SSN.rastro); SSN.F = null; SSN.boost = null; },
  reset(){ SSN.cd = 0; } }));
// Moto roja + bola azul: rodar dos veces seguidas llama a la moto aunque el primer rodar haya sido el acelerón
const mot_doRoll = doRoll;
doRoll = function(){
  if (lvl('foilMoto') && SNC.m && SNC.m.modo === 'dash' && MTO.ult > 0 && time - MTO.ult < 0.5 && !FOILX.forma && time - MTO.fin >= 10 && foilPuede() && gameState === 'play'){
    sncAcaba(); MTO.ult = -9; if (mtoInvoca()) return; }
  mot_doRoll();
};

/* ======================================================================
   TITÁN ZORRO (tzo) · Titán + Manto de las nueve colas
   ====================================================================== */
const tzo_titEspecial = titEspecial;
titEspecial = function(){
  const ok = tzo_titEspecial(); if (!ok || !lvl('mutTitanZorro') || !TIT.F) return ok;
  const F = TIT.F; F.zorro = true; KYU.aura = 0; kyuDeco(true); KYU.colas = Array.from({ length: 9 }, () => tintaCoge(KYU_COLA, 0, 'kyu')); F.postPose = () => kyuColas();
  play('kyuRugido'); return ok;
};
const tzo_titTick = titTick;
titTick = function(dt){ tzo_titTick(dt); const F = TIT.F; if (!F || !F.zorro) return;
  KYU.aura = Math.min(1, KYU.aura + dt * 2); for (const a of KYU.deco.aura){ a.material.uniforms.uT.value = time; a.material.uniforms.uAmt.value = 0.55 * KYU.aura * (0.85 + 0.15 * Math.sin(time * 9)); }
  if (dt > 0 && rnd() < 0.8){ const s = hero.scale.x, x = hero.position.x, z = hero.position.z; pa(x + (rnd() - 0.5) * 0.9 * s, 0.2 + rnd() * 1.6 * s, z + (rnd() - 0.5) * 0.9 * s, (rnd() - 0.5) * 0.6, 1.5 + rnd() * 2, (rnd() - 0.5) * 0.6, rnd() < 0.6 ? 0xffb030 : 0xfff0a0, 0.3, 0.7, -0.5, 1, 0.3, SH7.dot, 0.8); } };
// cada manotazo: además, las nueve colas barren a la redonda
const tzo_titManotazo = titManotazo;
titManotazo = function(f){ tzo_titManotazo(f); const F = TIT.F; if (!F || !F.zorro) return;
  const O = hero.position; ringFx(O.x, O.z, 0xffb030, 0.5, 7, 0.45); ringFx(O.x, O.z, 0xfff0a0, 0.3, 5, 0.35, 0.4); gring(O.x, 0.12, O.z, 0xffd060, 0.4, 6, 0.4);
  xtrArea(O, 7, () => rdmg(18), 6, 'fire', 0.8); play('kyuZarpa'); };
// el puñetazo final suelta, además, la bomba espiral
const tzo_titPunetazo = titPunetazo;
titPunetazo = function(f){ tzo_titPunetazo(f); const F = TIT.F; if (F && F.zorro) later(0.12, () => { if (TIT.F === F) kyuBomba(f); }); };
const tzo_titFin = titFin;
titFin = function(m){ const F = TIT.F; tzo_titFin(m); if (F && F.zorro){ for (const c of KYU.colas) tintaSuelta(c); KYU.colas = []; kyuDeco(false); } };
mutPoder('foilTitan', 'foilKyubi', [0xffcf6a, 0xff8a20], { id: 'mutTitanZorro', ic: '🦊', name: 'Titán zorro', tags: ['otaku'],
  desc: 'Mutación de Titán y Manto de las nueve colas (los dos te transformaban con el especial). Te conviertes en un titán con manto de chakra y nueve colas gigantes: cada manotazo barre a la redonda con las colas y el puñetazo final suelta además la bomba espiral.',
  especial(){ return titEspecial(); }, limpia(){ TIT.puno = null; } });

/* ======================================================================
   TETRIS DEL TESORO (tro) · Lluvia de tetriminós + Puerta del tesoro
   ====================================================================== */
const TRO_ORO = { I: 0xffe070, O: 0xffc840, T: 0xffd860, S: 0xf0b030, Z: 0xffd040, L: 0xe8a828, J: 0xfff0a0 };
const tro_tetPieza = tetPieza;
tetPieza = function(tipo){ const p = tro_tetPieza(tipo); if (p && lvl('mutTetrisOro')){ p.col = TRO_ORO[tipo]; p.mat.uniforms.uColor.value.setHex(p.col); p.mat.uniforms.uEmissive.value = 0.75; p.ghMat.uniforms.uColor.value.setHex(0xffe070); } return p; };
// caen más bajo, cada una de su portal dorado
const tro_tetLluvia = tetLluvia;
tetLluvia = function(f){
  if (!lvl('mutTetrisOro')) return tro_tetLluvia(f);
  TET.alto = 8.5; tro_tetLluvia(f); TET.alto = 16; play('gobAbre');
  for (const p of TET.piezas){ if (!p.on || p.cayo || !p.gh.visible) continue; const P = gobPortal(); if (!P) break; const pos = new V3(p.x, 9, p.z);
    foilFx.push({ t: 0, upd(dt){ const t = this.t, k = Math.min(1, t / 0.15), c = clamp((t - 0.7) / 0.25, 0, 1); P.s.visible = true; P.s.position.copy(pos); P.s.scale.setScalar(2.4 * k * (1 - c) + 0.01); P.s.material.rotation += dt * 2;
        if (dt > 0 && rnd() < 0.5) spawnFx(pos.x + (rnd() - 0.5) * 1.6, pos.y - 0.3, pos.z + (rnd() - 0.5) * 1.6, 0, -2, 0, 0xffe070, 0.06, 0.4, 0, 0); return t < 0.95; },
      fin(){ P.on = false; P.s.visible = false; } }); }
};
// un TETRIS abre la puerta del tesoro
const tro_tetTetris = tetTetris;
tetTetris = function(R){ tro_tetTetris(R); if (lvl('mutTetrisOro')) later(0.25, () => gobLanza()); };
mutPoder('foilTetris', 'foilBabilonia', [0x00f0f0, 0xffc840], mutHereda(['foilTetris'], { id: 'mutTetrisOro', ic: '🏆', name: 'Tetris del tesoro', tags: ['otaku'],
  desc: 'Mutación de Lluvia de tetriminós y Puerta del tesoro (los dos llovían cosas sobre los enemigos). Cada remate abre portales dorados de los que caen piezas de oro; si encajan las cuatro, además de la línea se abre la puerta del tesoro y sale una ráfaga de armas.' }));

/* ======================================================================
   BURRO DRAGÓN (bdr) · Burro de hormigón + Rey dragón
   ====================================================================== */
const BDR = { alas: null };
// alas de piedra: membrana en abanico (triángulos) con tres huesos, fundidas
function bdrAlas(){
  if (BDR.alas) return BDR.alas;
  const piedra = makeMat(0x8a8680, { emissive: 0.12 }), memb = makeMat(0x6e5a52, { emissive: 0.1, side: THREE.DoubleSide });
  BDR.alas = [-1, 1].map(s => { const piv = new THREE.Group(), src = new THREE.Group(); piv.position.set(0.62 * s, 2.35, 0.1);
    const forma = new THREE.Shape(); forma.moveTo(0, 0); forma.lineTo(2.9, 0.9); forma.lineTo(2.5, 0.2); forma.lineTo(2.6, -0.5); forma.lineTo(1.9, -0.3); forma.lineTo(1.8, -1.0); forma.lineTo(1.1, -0.5); forma.lineTo(0.5, -0.9); forma.lineTo(0, -0.4);
    const m = mesh(new THREE.ShapeGeometry(forma), memb, 0, 0, 0, src); m.rotation.x = -Math.PI / 2; if (s < 0) m.scale.x = -1;
    for (const [x, z] of [[2.9, 0.9], [2.6, -0.5], [1.8, -1.0]]){ const L = Math.hypot(x, z), b = mesh(B(L, 0.12, 0.14), piedra, s * x / 2, 0.06, -z / 2, src); b.rotation.y = s * Math.atan2(z, x); }
    mpFusiona(src, piv); piv.visible = false; return piv; });
  return BDR.alas;
}
const bdr_wrmLanza = wrmLanza;
wrmLanza = function(e){ bdr_wrmLanza(e); const on = !!lvl('mutBurroDragon'); if (on){ for (const a of bdrAlas()) if (a.parent !== WRM.g) WRM.g.add(a); play('bahRugido'); } if (BDR.alas) BDR.alas.forEach(a => { a.visible = on; }); };
// aleteo; antes de cada bote, una llamarada hacia donde va a caer
const bdr_wrmTick = wrmTick;
wrmTick = function(B_, dt){ const r = bdr_wrmTick(B_, dt); if (BDR.alas && BDR.alas[0].visible){ const fase = B_.fase, w = fase === 'cae' || fase === 'bota' ? Math.sin(time * 13) * 0.55 : 0.25;
    BDR.alas.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * w; }); } return r; };
const bdr_wrmSiguiente = wrmSiguiente;
wrmSiguiente = function(B_){ bdr_wrmSiguiente(B_); if (!lvl('mutBurroDragon')) return;
  const g = WRM.g, de = g.localToWorld(new V3(0, 3.2, 2.5)), a = B_.b.clone().setY(0.3), c = [tintaCoge(LLAMA, 0, 'fuego'), tintaCoge(LLAMA_VIVA, 0, 'fuego')], ya = new Set(); play('bdrFuego');
  foilFx.push({ t: 0, cintas: c, upd(){ const k = Math.min(1, this.t / 0.25), f = Math.max(0, (this.t - 0.5) / 0.25); if (f >= 1) return false; g.updateMatrixWorld(); g.localToWorld(de.set(0, 3.2, 2.5));
      const P_ = (s, v) => v.lerpVectors(de, a, s).add(xtrT.set(0, Math.sin(s * Math.PI) * 0.6, 0)); tintaPinta(c[0], P_, 0, k, q => 0.4 + q * 1.4); tintaPinta(c[1], P_, 0, k, q => 0.2 + q * 0.6); c.forEach(C => { C.mat.uniforms.uAlpha.value = 1 - f; });
      if (k >= 1) for (const e of foilEnemigos(a, 2.6)){ if (ya.has(e)) continue; ya.add(e); const dx = e.g.position.x - a.x, dz = e.g.position.z - a.z, l = Math.max(0.01, Math.hypot(dx, dz)); foilGolpea(e, rdmg(30), dx / l, dz / l, 4, 'fire', 1.4); }
      return true; } }); };
// al desmoronarse: megafulgor
const bdr_wrmDesmorona = wrmDesmorona;
wrmDesmorona = function(){ const g = WRM.g, x = g.position.x, z = g.position.z, on = lvl('mutBurroDragon'); bdr_wrmDesmorona(); if (BDR.alas) BDR.alas.forEach(a => { a.visible = false; }); if (!on) return;
  flash('#ffffff', 0.7); shake = Math.max(shake, 1.1); hitStop = Math.max(hitStop, 0.1); lightFlash(x, 2, z, 0xaad8ff, 4, 18); play('psyBoom');
  ringFx(x, z, 0xffffff, 0.5, 9, 0.55); ringFx(x, z, 0x9ad0ff, 0.3, 6.5, 0.45, 0.4); burst7(PA7, x, 1.5, z, 50, [0xffffff, 0x9ad0ff, 0xffd8a0], 12, 0.25, 0.8, 0, 1.6, 0, SH7.star);
  xtrArea({ x, z }, 8, () => rdmg(90), 10, null, 2); };
mutPoder('foilBurro', 'foilBahamut', [0x9c988f, 0xffd860], mutHereda(['foilBurro'], { id: 'mutBurroDragon', ic: '🐲', name: 'Burro dragón', tags: ['otaku'],
  desc: 'Mutación de Burro de hormigón y Rey dragón (las dos eran invocaciones gigantes desde el cielo). El burro de piedra llega con alas de dragón cada 40 golpes o con el especial, escupe fuego hacia donde va a caer antes de cada bote y al desmoronarse suelta un megafulgor.',
  especial(){ if (WRM.B || !foilPuede() || !foilEscenario()) return false; const e = xtrGrupo(hero.position, 14); if (!e) return false; WRM.golpes = 0; wrmLanza(e); return true; } }));
